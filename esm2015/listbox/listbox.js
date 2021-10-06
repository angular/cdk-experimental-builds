/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ContentChildren, Directive, ElementRef, EventEmitter, forwardRef, Inject, InjectionToken, Input, Optional, Output, QueryList } from '@angular/core';
import { ActiveDescendantKeyManager } from '@angular/cdk/a11y';
import { DOWN_ARROW, ENTER, SPACE, UP_ARROW, LEFT_ARROW, RIGHT_ARROW } from '@angular/cdk/keycodes';
import { coerceBooleanProperty, coerceArray } from '@angular/cdk/coercion';
import { SelectionModel } from '@angular/cdk/collections';
import { defer, merge, Subject } from 'rxjs';
import { startWith, switchMap, takeUntil } from 'rxjs/operators';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { CdkComboboxPanel } from '@angular/cdk-experimental/combobox';
import { Directionality } from '@angular/cdk/bidi';
let nextId = 0;
let listboxId = 0;
export const CDK_LISTBOX_VALUE_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => CdkListbox),
    multi: true
};
export const PANEL = new InjectionToken('CdkComboboxPanel');
export class CdkOption {
    constructor(_elementRef, listbox) {
        this._elementRef = _elementRef;
        this.listbox = listbox;
        this._selected = false;
        this._disabled = false;
        this._active = false;
        /** The id of the option, set to a uniqueid if the user does not provide one. */
        this.id = `cdk-option-${nextId++}`;
        this.selectionChange = new EventEmitter();
    }
    get selected() {
        return this._selected;
    }
    set selected(value) {
        if (!this._disabled) {
            this._selected = coerceBooleanProperty(value);
        }
    }
    get disabled() {
        return this._disabled;
    }
    set disabled(value) {
        this._disabled = coerceBooleanProperty(value);
    }
    /** The form value of the option. */
    get value() {
        return this._value;
    }
    set value(value) {
        if (this.selected && value !== this._value) {
            this.deselect();
        }
        this._value = value;
    }
    /** Toggles the selected state, emits a change event through the injected listbox. */
    toggle() {
        if (!this._isInteractionDisabled()) {
            this.selected = !this.selected;
            this._emitSelectionChange(true);
        }
    }
    /** Sets the active property true if the option and listbox aren't disabled. */
    activate() {
        if (!this._isInteractionDisabled()) {
            this._active = true;
        }
    }
    /** Sets the active property false. */
    deactivate() {
        if (!this._isInteractionDisabled()) {
            this._active = false;
        }
    }
    /** Sets the selected property true if it was false. */
    select() {
        if (!this.selected) {
            this.selected = true;
            this._emitSelectionChange();
        }
    }
    /** Sets the selected property false if it was true. */
    deselect() {
        if (this.selected) {
            this.selected = false;
            this._emitSelectionChange();
        }
    }
    /** Applies focus to the option. */
    focus() {
        this._elementRef.nativeElement.focus();
    }
    /** Returns true if the option or listbox are disabled, and false otherwise. */
    _isInteractionDisabled() {
        return (this.listbox.disabled || this._disabled);
    }
    /** Emits a change event extending the Option Selection Change Event interface. */
    _emitSelectionChange(isUserInput = false) {
        this.selectionChange.emit({
            source: this,
            isUserInput: isUserInput
        });
    }
    /** Returns the tab index which depends on the disabled property. */
    _getTabIndex() {
        return this._isInteractionDisabled() ? null : '-1';
    }
    /** Get the label for this element which is required by the FocusableOption interface. */
    getLabel() {
        var _a;
        // we know that the current node is an element type
        const clone = this._elementRef.nativeElement.cloneNode(true);
        this._removeIcons(clone);
        return ((_a = clone.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || '';
    }
    /** Remove any child from the given element which can be identified as an icon. */
    _removeIcons(element) {
        // TODO: make this a configurable function that can removed any desired type of node.
        for (const icon of Array.from(element.querySelectorAll('mat-icon, .material-icons'))) {
            icon.remove();
        }
    }
    getElementRef() {
        return this._elementRef;
    }
    /** Sets the active property to true to enable the active css class. */
    setActiveStyles() {
        this._active = true;
    }
    /** Sets the active property to false to disable the active css class. */
    setInactiveStyles() {
        this._active = false;
    }
}
CdkOption.decorators = [
    { type: Directive, args: [{
                selector: '[cdkOption]',
                exportAs: 'cdkOption',
                host: {
                    'role': 'option',
                    'class': 'cdk-option',
                    '(click)': 'toggle()',
                    '(focus)': 'activate()',
                    '(blur)': 'deactivate()',
                    '[id]': 'id',
                    '[attr.aria-selected]': 'selected || null',
                    '[attr.tabindex]': '_getTabIndex()',
                    '[attr.aria-disabled]': '_isInteractionDisabled()',
                    '[class.cdk-option-disabled]': '_isInteractionDisabled()',
                    '[class.cdk-option-active]': '_active',
                    '[class.cdk-option-selected]': 'selected'
                }
            },] }
];
CdkOption.ctorParameters = () => [
    { type: ElementRef },
    { type: CdkListbox, decorators: [{ type: Inject, args: [forwardRef(() => CdkListbox),] }] }
];
CdkOption.propDecorators = {
    id: [{ type: Input }],
    selected: [{ type: Input }],
    disabled: [{ type: Input }],
    value: [{ type: Input }],
    selectionChange: [{ type: Output }]
};
export class CdkListbox {
    constructor(_parentPanel, _dir) {
        this._parentPanel = _parentPanel;
        this._dir = _dir;
        this._tabIndex = 0;
        /** `View -> model callback called when select has been touched` */
        this._onTouched = () => { };
        /** `View -> model callback called when value changes` */
        this._onChange = () => { };
        this.optionSelectionChanges = defer(() => {
            const options = this._options;
            return options.changes.pipe(startWith(options), switchMap(() => merge(...options.map(option => option.selectionChange))));
        });
        this._disabled = false;
        this._multiple = false;
        this._useActiveDescendant = false;
        this._autoFocus = true;
        this._destroyed = new Subject();
        this.selectionChange = new EventEmitter();
        this.id = `cdk-listbox-${listboxId++}`;
        /** Determines the orientation for the list key manager. Affects keyboard interaction. */
        this.orientation = 'vertical';
        this.compareWith = (a1, a2) => a1 === a2;
    }
    /**
     * Whether the listbox allows multiple options to be selected.
     * If `multiple` switches from `true` to `false`, all options are deselected.
     */
    get multiple() {
        return this._multiple;
    }
    set multiple(value) {
        this._updateSelectionOnMultiSelectionChange(value);
        this._multiple = coerceBooleanProperty(value);
    }
    get disabled() {
        return this._disabled;
    }
    set disabled(value) {
        this._disabled = coerceBooleanProperty(value);
    }
    /** Whether the listbox will use active descendant or will move focus onto the options. */
    get useActiveDescendant() {
        return this._useActiveDescendant;
    }
    set useActiveDescendant(shouldUseActiveDescendant) {
        this._useActiveDescendant = coerceBooleanProperty(shouldUseActiveDescendant);
    }
    /** Whether on focus the listbox will focus its active option, default to true. */
    get autoFocus() {
        return this._autoFocus;
    }
    set autoFocus(shouldAutoFocus) {
        this._autoFocus = coerceBooleanProperty(shouldAutoFocus);
    }
    ngOnInit() {
        this._selectionModel = new SelectionModel(this.multiple);
    }
    ngAfterContentInit() {
        this._initKeyManager();
        this._initSelectionModel();
        this._registerWithPanel();
        this.optionSelectionChanges.subscribe(event => {
            this._emitChangeEvent(event.source);
            this._updateSelectionModel(event.source);
            this.setActiveOption(event.source);
            this._updatePanelForSelection(event.source);
        });
    }
    ngOnDestroy() {
        this._listKeyManager.change.complete();
        this._destroyed.next();
        this._destroyed.complete();
    }
    _registerWithPanel() {
        const panel = this._parentPanel || this._explicitPanel;
        panel === null || panel === void 0 ? void 0 : panel._registerContent(this.id, 'listbox');
    }
    _initKeyManager() {
        var _a;
        this._listKeyManager = new ActiveDescendantKeyManager(this._options)
            .withWrap()
            .withTypeAhead()
            .withHomeAndEnd()
            .withAllowedModifierKeys(['shiftKey']);
        if (this.orientation === 'vertical') {
            this._listKeyManager.withVerticalOrientation();
        }
        else {
            this._listKeyManager.withHorizontalOrientation(((_a = this._dir) === null || _a === void 0 ? void 0 : _a.value) || 'ltr');
        }
        this._listKeyManager.change.pipe(takeUntil(this._destroyed)).subscribe(() => {
            this._updateActiveOption();
        });
    }
    _initSelectionModel() {
        this._selectionModel.changed.pipe(takeUntil(this._destroyed))
            .subscribe((event) => {
            for (const option of event.added) {
                option.selected = true;
            }
            for (const option of event.removed) {
                option.selected = false;
            }
        });
    }
    _keydown(event) {
        if (this._disabled) {
            return;
        }
        const manager = this._listKeyManager;
        const { keyCode } = event;
        const previousActiveIndex = manager.activeItemIndex;
        if (keyCode === SPACE || keyCode === ENTER) {
            if (manager.activeItem && !manager.isTyping()) {
                this._toggleActiveOption();
            }
            event.preventDefault();
        }
        else {
            manager.onKeydown(event);
        }
        /** Will select an option if shift was pressed while navigating to the option */
        const isArrow = (keyCode === UP_ARROW
            || keyCode === DOWN_ARROW
            || keyCode === LEFT_ARROW
            || keyCode === RIGHT_ARROW);
        if (isArrow && event.shiftKey && previousActiveIndex !== this._listKeyManager.activeItemIndex) {
            this._toggleActiveOption();
        }
    }
    /** Emits a selection change event, called when an option has its selected state changed. */
    _emitChangeEvent(option) {
        this.selectionChange.emit({
            source: this,
            option: option
        });
    }
    /** Updates the selection model after a toggle. */
    _updateSelectionModel(option) {
        if (!this.multiple && this._selectionModel.selected.length !== 0) {
            const previouslySelected = this._selectionModel.selected[0];
            this.deselect(previouslySelected);
        }
        option.selected ? this._selectionModel.select(option) :
            this._selectionModel.deselect(option);
    }
    _updatePanelForSelection(option) {
        const panel = this._parentPanel || this._explicitPanel;
        if (!this.multiple) {
            option.selected ? panel === null || panel === void 0 ? void 0 : panel.closePanel(option.value) : panel === null || panel === void 0 ? void 0 : panel.closePanel();
        }
        else {
            panel === null || panel === void 0 ? void 0 : panel.closePanel(this.getSelectedValues());
        }
    }
    /** Toggles the selected state of the active option if not disabled. */
    _toggleActiveOption() {
        const activeOption = this._listKeyManager.activeItem;
        if (activeOption && !activeOption.disabled) {
            activeOption.toggle();
        }
    }
    /** Returns the id of the active option if active descendant is being used. */
    _getAriaActiveDescendant() {
        var _a, _b;
        return this._useActiveDescendant ? (_b = (_a = this._listKeyManager) === null || _a === void 0 ? void 0 : _a.activeItem) === null || _b === void 0 ? void 0 : _b.id : null;
    }
    /** Updates the activeOption and the active and focus properties of the option. */
    _updateActiveOption() {
        var _a;
        if (!this._listKeyManager.activeItem) {
            return;
        }
        (_a = this._activeOption) === null || _a === void 0 ? void 0 : _a.deactivate();
        this._activeOption = this._listKeyManager.activeItem;
        this._activeOption.activate();
        if (!this.useActiveDescendant) {
            this._activeOption.focus();
        }
    }
    /** Updates selection states of options when the 'multiple' property changes. */
    _updateSelectionOnMultiSelectionChange(value) {
        var _a;
        if (this.multiple && !value) {
            // Deselect all options instead of arbitrarily keeping one of the selected options.
            this.setAllSelected(false);
        }
        else if (!this.multiple && value) {
            this._selectionModel =
                new SelectionModel(value, (_a = this._selectionModel) === null || _a === void 0 ? void 0 : _a.selected);
        }
    }
    _focusActiveOption() {
        if (!this.autoFocus) {
            return;
        }
        if (this._listKeyManager.activeItem) {
            this.setActiveOption(this._listKeyManager.activeItem);
        }
        else if (this._options.first) {
            this.setActiveOption(this._options.first);
        }
    }
    /** Selects the given option if the option and listbox aren't disabled. */
    select(option) {
        if (!this.disabled && !option.disabled) {
            option.select();
        }
    }
    /** Deselects the given option if the option and listbox aren't disabled. */
    deselect(option) {
        if (!this.disabled && !option.disabled) {
            option.deselect();
        }
    }
    /** Sets the selected state of all options to be the given value. */
    setAllSelected(isSelected) {
        for (const option of this._options.toArray()) {
            isSelected ? this.select(option) : this.deselect(option);
        }
    }
    /** Updates the key manager's active item to the given option. */
    setActiveOption(option) {
        this._listKeyManager.updateActiveItem(option);
        this._updateActiveOption();
    }
    /**
     * Saves a callback function to be invoked when the select's value
     * changes from user input. Required to implement ControlValueAccessor.
     */
    registerOnChange(fn) {
        this._onChange = fn;
    }
    /**
     * Saves a callback function to be invoked when the select is blurred
     * by the user. Required to implement ControlValueAccessor.
     */
    registerOnTouched(fn) {
        this._onTouched = fn;
    }
    /** Sets the select's value. Required to implement ControlValueAccessor. */
    writeValue(values) {
        if (this._options) {
            this._setSelectionByValue(values);
        }
    }
    /** Disables the select. Required to implement ControlValueAccessor. */
    setDisabledState(isDisabled) {
        this.disabled = isDisabled;
    }
    /** Returns the values of the currently selected options. */
    getSelectedValues() {
        return this._options.filter(option => option.selected).map(option => option.value);
    }
    /** Selects an option that has the corresponding given value. */
    _setSelectionByValue(values) {
        for (const option of this._options.toArray()) {
            this.deselect(option);
        }
        const valuesArray = coerceArray(values);
        for (const value of valuesArray) {
            const correspondingOption = this._options.find((option) => {
                return option.value != null && this.compareWith(option.value, value);
            });
            if (correspondingOption) {
                this.select(correspondingOption);
                if (!this.multiple) {
                    return;
                }
            }
        }
    }
}
CdkListbox.decorators = [
    { type: Directive, args: [{
                selector: '[cdkListbox]',
                exportAs: 'cdkListbox',
                host: {
                    'role': 'listbox',
                    'class': 'cdk-listbox',
                    '[id]': 'id',
                    '(focus)': '_focusActiveOption()',
                    '(keydown)': '_keydown($event)',
                    '[attr.tabindex]': '_tabIndex',
                    '[attr.aria-disabled]': 'disabled',
                    '[attr.aria-multiselectable]': 'multiple',
                    '[attr.aria-activedescendant]': '_getAriaActiveDescendant()',
                    '[attr.aria-orientation]': 'orientation'
                },
                providers: [CDK_LISTBOX_VALUE_ACCESSOR]
            },] }
];
CdkListbox.ctorParameters = () => [
    { type: CdkComboboxPanel, decorators: [{ type: Optional }, { type: Inject, args: [PANEL,] }] },
    { type: Directionality, decorators: [{ type: Optional }] }
];
CdkListbox.propDecorators = {
    _options: [{ type: ContentChildren, args: [CdkOption, { descendants: true },] }],
    selectionChange: [{ type: Output }],
    id: [{ type: Input }],
    multiple: [{ type: Input }],
    disabled: [{ type: Input }],
    useActiveDescendant: [{ type: Input }],
    autoFocus: [{ type: Input }],
    orientation: [{ type: Input, args: ['listboxOrientation',] }],
    compareWith: [{ type: Input }],
    _explicitPanel: [{ type: Input, args: ['parentPanel',] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdGJveC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL2xpc3Rib3gvbGlzdGJveC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBRUwsZUFBZSxFQUNmLFNBQVMsRUFDVCxVQUFVLEVBQUUsWUFBWSxFQUFFLFVBQVUsRUFDcEMsTUFBTSxFQUFFLGNBQWMsRUFDdEIsS0FBSyxFQUFxQixRQUFRLEVBQUUsTUFBTSxFQUMxQyxTQUFTLEVBQ1YsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFDLDBCQUEwQixFQUFzQyxNQUFNLG1CQUFtQixDQUFDO0FBQ2xHLE9BQU8sRUFBQyxVQUFVLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQ2xHLE9BQU8sRUFBZSxxQkFBcUIsRUFBRSxXQUFXLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUN2RixPQUFPLEVBQWtCLGNBQWMsRUFBQyxNQUFNLDBCQUEwQixDQUFDO0FBQ3pFLE9BQU8sRUFBQyxLQUFLLEVBQUUsS0FBSyxFQUFjLE9BQU8sRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUN2RCxPQUFPLEVBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUMvRCxPQUFPLEVBQXVCLGlCQUFpQixFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDdkUsT0FBTyxFQUFDLGdCQUFnQixFQUFDLE1BQU0sb0NBQW9DLENBQUM7QUFDcEUsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBRWpELElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQztBQUNmLElBQUksU0FBUyxHQUFHLENBQUMsQ0FBQztBQUVsQixNQUFNLENBQUMsTUFBTSwwQkFBMEIsR0FBUTtJQUM3QyxP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bGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7XG4gIEFmdGVyQ29udGVudEluaXQsXG4gIENvbnRlbnRDaGlsZHJlbixcbiAgRGlyZWN0aXZlLFxuICBFbGVtZW50UmVmLCBFdmVudEVtaXR0ZXIsIGZvcndhcmRSZWYsXG4gIEluamVjdCwgSW5qZWN0aW9uVG9rZW4sXG4gIElucHV0LCBPbkRlc3Ryb3ksIE9uSW5pdCwgT3B0aW9uYWwsIE91dHB1dCxcbiAgUXVlcnlMaXN0XG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtBY3RpdmVEZXNjZW5kYW50S2V5TWFuYWdlciwgSGlnaGxpZ2h0YWJsZSwgTGlzdEtleU1hbmFnZXJPcHRpb259IGZyb20gJ0Bhbmd1bGFyL2Nkay9hMTF5JztcbmltcG9ydCB7RE9XTl9BUlJPVywgRU5URVIsIFNQQUNFLCBVUF9BUlJPVywgTEVGVF9BUlJPVywgUklHSFRfQVJST1d9IGZyb20gJ0Bhbmd1bGFyL2Nkay9rZXljb2Rlcyc7XG5pbXBvcnQge0Jvb2xlYW5JbnB1dCwgY29lcmNlQm9vbGVhblByb3BlcnR5LCBjb2VyY2VBcnJheX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvZXJjaW9uJztcbmltcG9ydCB7U2VsZWN0aW9uQ2hhbmdlLCBTZWxlY3Rpb25Nb2RlbH0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvbGxlY3Rpb25zJztcbmltcG9ydCB7ZGVmZXIsIG1lcmdlLCBPYnNlcnZhYmxlLCBTdWJqZWN0fSBmcm9tICdyeGpzJztcbmltcG9ydCB7c3RhcnRXaXRoLCBzd2l0Y2hNYXAsIHRha2VVbnRpbH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuaW1wb3J0IHtDb250cm9sVmFsdWVBY2Nlc3NvciwgTkdfVkFMVUVfQUNDRVNTT1J9IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcbmltcG9ydCB7Q2RrQ29tYm9ib3hQYW5lbH0gZnJvbSAnQGFuZ3VsYXIvY2RrLWV4cGVyaW1lbnRhbC9jb21ib2JveCc7XG5pbXBvcnQge0RpcmVjdGlvbmFsaXR5fSBmcm9tICdAYW5ndWxhci9jZGsvYmlkaSc7XG5cbmxldCBuZXh0SWQgPSAwO1xubGV0IGxpc3Rib3hJZCA9IDA7XG5cbmV4cG9ydCBjb25zdCBDREtfTElTVEJPWF9WQUxVRV9BQ0NFU1NPUjogYW55ID0ge1xuICBwcm92aWRlOiBOR19WQUxVRV9BQ0NFU1NPUixcbiAgdXNlRXhpc3Rpbmc6IGZvcndhcmRSZWYoKCkgPT4gQ2RrTGlzdGJveCksXG4gIG11bHRpOiB0cnVlXG59O1xuXG5leHBvcnQgY29uc3QgUEFORUwgPSBuZXcgSW5qZWN0aW9uVG9rZW48Q2RrQ29tYm9ib3hQYW5lbD4oJ0Nka0NvbWJvYm94UGFuZWwnKTtcblxuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW2Nka09wdGlvbl0nLFxuICBleHBvcnRBczogJ2Nka09wdGlvbicsXG4gIGhvc3Q6IHtcbiAgICAncm9sZSc6ICdvcHRpb24nLFxuICAgICdjbGFzcyc6ICdjZGstb3B0aW9uJyxcbiAgICAnKGNsaWNrKSc6ICd0b2dnbGUoKScsXG4gICAgJyhmb2N1cyknOiAnYWN0aXZhdGUoKScsXG4gICAgJyhibHVyKSc6ICdkZWFjdGl2YXRlKCknLFxuICAgICdbaWRdJzogJ2lkJyxcbiAgICAnW2F0dHIuYXJpYS1zZWxlY3RlZF0nOiAnc2VsZWN0ZWQgfHwgbnVsbCcsXG4gICAgJ1thdHRyLnRhYmluZGV4XSc6ICdfZ2V0VGFiSW5kZXgoKScsXG4gICAgJ1thdHRyLmFyaWEtZGlzYWJsZWRdJzogJ19pc0ludGVyYWN0aW9uRGlzYWJsZWQoKScsXG4gICAgJ1tjbGFzcy5jZGstb3B0aW9uLWRpc2FibGVkXSc6ICdfaXNJbnRlcmFjdGlvbkRpc2FibGVkKCknLFxuICAgICdbY2xhc3MuY2RrLW9wdGlvbi1hY3RpdmVdJzogJ19hY3RpdmUnLFxuICAgICdbY2xhc3MuY2RrLW9wdGlvbi1zZWxlY3RlZF0nOiAnc2VsZWN0ZWQnXG4gIH1cbn0pXG5leHBvcnQgY2xhc3MgQ2RrT3B0aW9uPFQgPSB1bmtub3duPiBpbXBsZW1lbnRzIExpc3RLZXlNYW5hZ2VyT3B0aW9uLCBIaWdobGlnaHRhYmxlIHtcbiAgcHJpdmF0ZSBfc2VsZWN0ZWQ6IGJvb2xlYW4gPSBmYWxzZTtcbiAgcHJpdmF0ZSBfZGlzYWJsZWQ6IGJvb2xlYW4gPSBmYWxzZTtcbiAgcHJpdmF0ZSBfdmFsdWU6IFQ7XG4gIF9hY3RpdmU6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAvKiogVGhlIGlkIG9mIHRoZSBvcHRpb24sIHNldCB0byBhIHVuaXF1ZWlkIGlmIHRoZSB1c2VyIGRvZXMgbm90IHByb3ZpZGUgb25lLiAqL1xuICBASW5wdXQoKSBpZCA9IGBjZGstb3B0aW9uLSR7bmV4dElkKyt9YDtcblxuICBASW5wdXQoKVxuICBnZXQgc2VsZWN0ZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX3NlbGVjdGVkO1xuICB9XG4gIHNldCBzZWxlY3RlZCh2YWx1ZTogYm9vbGVhbikge1xuICAgIGlmICghdGhpcy5fZGlzYWJsZWQpIHtcbiAgICAgIHRoaXMuX3NlbGVjdGVkID0gY29lcmNlQm9vbGVhblByb3BlcnR5KHZhbHVlKTtcbiAgICB9XG4gIH1cblxuICBASW5wdXQoKVxuICBnZXQgZGlzYWJsZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2Rpc2FibGVkO1xuICB9XG4gIHNldCBkaXNhYmxlZCh2YWx1ZTogYm9vbGVhbikge1xuICAgIHRoaXMuX2Rpc2FibGVkID0gY29lcmNlQm9vbGVhblByb3BlcnR5KHZhbHVlKTtcbiAgfVxuXG4gIC8qKiBUaGUgZm9ybSB2YWx1ZSBvZiB0aGUgb3B0aW9uLiAqL1xuICBASW5wdXQoKVxuICBnZXQgdmFsdWUoKTogVCB7XG4gICAgcmV0dXJuIHRoaXMuX3ZhbHVlO1xuICB9XG4gIHNldCB2YWx1ZSh2YWx1ZTogVCkge1xuICAgIGlmICh0aGlzLnNlbGVjdGVkICYmIHZhbHVlICE9PSB0aGlzLl92YWx1ZSkge1xuICAgICAgdGhpcy5kZXNlbGVjdCgpO1xuICAgIH1cbiAgICB0aGlzLl92YWx1ZSA9IHZhbHVlO1xuICB9XG5cbiAgQE91dHB1dCgpIHJlYWRvbmx5IHNlbGVjdGlvbkNoYW5nZSA9XG4gICAgICBuZXcgRXZlbnRFbWl0dGVyPE9wdGlvblNlbGVjdGlvbkNoYW5nZUV2ZW50PFQ+PigpO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgX2VsZW1lbnRSZWY6IEVsZW1lbnRSZWYsXG4gICAgICAgICAgICAgIEBJbmplY3QoZm9yd2FyZFJlZigoKSA9PiBDZGtMaXN0Ym94KSkgcmVhZG9ubHkgbGlzdGJveDogQ2RrTGlzdGJveDxUPikge1xuICB9XG5cbiAgLyoqIFRvZ2dsZXMgdGhlIHNlbGVjdGVkIHN0YXRlLCBlbWl0cyBhIGNoYW5nZSBldmVudCB0aHJvdWdoIHRoZSBpbmplY3RlZCBsaXN0Ym94LiAqL1xuICB0b2dnbGUoKSB7XG4gICAgaWYgKCF0aGlzLl9pc0ludGVyYWN0aW9uRGlzYWJsZWQoKSkge1xuICAgICAgdGhpcy5zZWxlY3RlZCA9ICF0aGlzLnNlbGVjdGVkO1xuICAgICAgdGhpcy5fZW1pdFNlbGVjdGlvbkNoYW5nZSh0cnVlKTtcbiAgICB9XG4gIH1cblxuICAvKiogU2V0cyB0aGUgYWN0aXZlIHByb3BlcnR5IHRydWUgaWYgdGhlIG9wdGlvbiBhbmQgbGlzdGJveCBhcmVuJ3QgZGlzYWJsZWQuICovXG4gIGFjdGl2YXRlKCkge1xuICAgIGlmICghdGhpcy5faXNJbnRlcmFjdGlvbkRpc2FibGVkKCkpIHtcbiAgICAgIHRoaXMuX2FjdGl2ZSA9IHRydWU7XG4gICAgfVxuICB9XG5cbiAgLyoqIFNldHMgdGhlIGFjdGl2ZSBwcm9wZXJ0eSBmYWxzZS4gKi9cbiAgZGVhY3RpdmF0ZSgpIHtcbiAgICBpZiAoIXRoaXMuX2lzSW50ZXJhY3Rpb25EaXNhYmxlZCgpKSB7XG4gICAgICB0aGlzLl9hY3RpdmUgPSBmYWxzZTtcbiAgICB9XG4gIH1cblxuICAvKiogU2V0cyB0aGUgc2VsZWN0ZWQgcHJvcGVydHkgdHJ1ZSBpZiBpdCB3YXMgZmFsc2UuICovXG4gIHNlbGVjdCgpIHtcbiAgICBpZiAoIXRoaXMuc2VsZWN0ZWQpIHtcbiAgICAgIHRoaXMuc2VsZWN0ZWQgPSB0cnVlO1xuICAgICAgdGhpcy5fZW1pdFNlbGVjdGlvbkNoYW5nZSgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBTZXRzIHRoZSBzZWxlY3RlZCBwcm9wZXJ0eSBmYWxzZSBpZiBpdCB3YXMgdHJ1ZS4gKi9cbiAgZGVzZWxlY3QoKSB7XG4gICAgaWYgKHRoaXMuc2VsZWN0ZWQpIHtcbiAgICAgIHRoaXMuc2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAgIHRoaXMuX2VtaXRTZWxlY3Rpb25DaGFuZ2UoKTtcbiAgICB9XG4gIH1cblxuICAvKiogQXBwbGllcyBmb2N1cyB0byB0aGUgb3B0aW9uLiAqL1xuICBmb2N1cygpIHtcbiAgICB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQuZm9jdXMoKTtcbiAgfVxuXG4gIC8qKiBSZXR1cm5zIHRydWUgaWYgdGhlIG9wdGlvbiBvciBsaXN0Ym94IGFyZSBkaXNhYmxlZCwgYW5kIGZhbHNlIG90aGVyd2lzZS4gKi9cbiAgX2lzSW50ZXJhY3Rpb25EaXNhYmxlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gKHRoaXMubGlzdGJveC5kaXNhYmxlZCB8fCB0aGlzLl9kaXNhYmxlZCk7XG4gIH1cblxuICAvKiogRW1pdHMgYSBjaGFuZ2UgZXZlbnQgZXh0ZW5kaW5nIHRoZSBPcHRpb24gU2VsZWN0aW9uIENoYW5nZSBFdmVudCBpbnRlcmZhY2UuICovXG4gIHByaXZhdGUgX2VtaXRTZWxlY3Rpb25DaGFuZ2UoaXNVc2VySW5wdXQgPSBmYWxzZSkge1xuICAgIHRoaXMuc2VsZWN0aW9uQ2hhbmdlLmVtaXQoe1xuICAgICAgc291cmNlOiB0aGlzLFxuICAgICAgaXNVc2VySW5wdXQ6IGlzVXNlcklucHV0XG4gICAgfSk7XG4gIH1cblxuICAvKiogUmV0dXJucyB0aGUgdGFiIGluZGV4IHdoaWNoIGRlcGVuZHMgb24gdGhlIGRpc2FibGVkIHByb3BlcnR5LiAqL1xuICBfZ2V0VGFiSW5kZXgoKTogc3RyaW5nIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuX2lzSW50ZXJhY3Rpb25EaXNhYmxlZCgpID8gbnVsbCA6ICctMSc7XG4gIH1cblxuICAvKiogR2V0IHRoZSBsYWJlbCBmb3IgdGhpcyBlbGVtZW50IHdoaWNoIGlzIHJlcXVpcmVkIGJ5IHRoZSBGb2N1c2FibGVPcHRpb24gaW50ZXJmYWNlLiAqL1xuICBnZXRMYWJlbCgpIHtcbiAgICAvLyB3ZSBrbm93IHRoYXQgdGhlIGN1cnJlbnQgbm9kZSBpcyBhbiBlbGVtZW50IHR5cGVcbiAgICBjb25zdCBjbG9uZSA9IHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5jbG9uZU5vZGUodHJ1ZSkgYXMgRWxlbWVudDtcbiAgICB0aGlzLl9yZW1vdmVJY29ucyhjbG9uZSk7XG5cbiAgICByZXR1cm4gY2xvbmUudGV4dENvbnRlbnQ/LnRyaW0oKSB8fCAnJztcbiAgfVxuXG4gIC8qKiBSZW1vdmUgYW55IGNoaWxkIGZyb20gdGhlIGdpdmVuIGVsZW1lbnQgd2hpY2ggY2FuIGJlIGlkZW50aWZpZWQgYXMgYW4gaWNvbi4gKi9cbiAgcHJpdmF0ZSBfcmVtb3ZlSWNvbnMoZWxlbWVudDogRWxlbWVudCkge1xuICAgIC8vIFRPRE86IG1ha2UgdGhpcyBhIGNvbmZpZ3VyYWJsZSBmdW5jdGlvbiB0aGF0IGNhbiByZW1vdmVkIGFueSBkZXNpcmVkIHR5cGUgb2Ygbm9kZS5cbiAgICBmb3IgKGNvbnN0IGljb24gb2YgQXJyYXkuZnJvbShlbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ21hdC1pY29uLCAubWF0ZXJpYWwtaWNvbnMnKSkpIHtcbiAgICAgIGljb24ucmVtb3ZlKCk7XG4gICAgfVxuICB9XG5cbiAgZ2V0RWxlbWVudFJlZigpIHtcbiAgICByZXR1cm4gdGhpcy5fZWxlbWVudFJlZjtcbiAgfVxuXG4gIC8qKiBTZXRzIHRoZSBhY3RpdmUgcHJvcGVydHkgdG8gdHJ1ZSB0byBlbmFibGUgdGhlIGFjdGl2ZSBjc3MgY2xhc3MuICovXG4gIHNldEFjdGl2ZVN0eWxlcygpIHtcbiAgICB0aGlzLl9hY3RpdmUgPSB0cnVlO1xuICB9XG5cbiAgLyoqIFNldHMgdGhlIGFjdGl2ZSBwcm9wZXJ0eSB0byBmYWxzZSB0byBkaXNhYmxlIHRoZSBhY3RpdmUgY3NzIGNsYXNzLiAqL1xuICBzZXRJbmFjdGl2ZVN0eWxlcygpIHtcbiAgICB0aGlzLl9hY3RpdmUgPSBmYWxzZTtcbiAgfVxuXG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zZWxlY3RlZDogQm9vbGVhbklucHV0O1xuICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZGlzYWJsZWQ6IEJvb2xlYW5JbnB1dDtcbn1cblxuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW2Nka0xpc3Rib3hdJyxcbiAgZXhwb3J0QXM6ICdjZGtMaXN0Ym94JyxcbiAgaG9zdDoge1xuICAgICdyb2xlJzogJ2xpc3Rib3gnLFxuICAgICdjbGFzcyc6ICdjZGstbGlzdGJveCcsXG4gICAgJ1tpZF0nOiAnaWQnLFxuICAgICcoZm9jdXMpJzogJ19mb2N1c0FjdGl2ZU9wdGlvbigpJyxcbiAgICAnKGtleWRvd24pJzogJ19rZXlkb3duKCRldmVudCknLFxuICAgICdbYXR0ci50YWJpbmRleF0nOiAnX3RhYkluZGV4JyxcbiAgICAnW2F0dHIuYXJpYS1kaXNhYmxlZF0nOiAnZGlzYWJsZWQnLFxuICAgICdbYXR0ci5hcmlhLW11bHRpc2VsZWN0YWJsZV0nOiAnbXVsdGlwbGUnLFxuICAgICdbYXR0ci5hcmlhLWFjdGl2ZWRlc2NlbmRhbnRdJzogJ19nZXRBcmlhQWN0aXZlRGVzY2VuZGFudCgpJyxcbiAgICAnW2F0dHIuYXJpYS1vcmllbnRhdGlvbl0nOiAnb3JpZW50YXRpb24nXG4gIH0sXG4gIHByb3ZpZGVyczogW0NES19MSVNUQk9YX1ZBTFVFX0FDQ0VTU09SXVxufSlcbmV4cG9ydCBjbGFzcyBDZGtMaXN0Ym94PFQ+IGltcGxlbWVudHMgQWZ0ZXJDb250ZW50SW5pdCwgT25EZXN0cm95LCBPbkluaXQsIENvbnRyb2xWYWx1ZUFjY2Vzc29yIHtcblxuICBfbGlzdEtleU1hbmFnZXI6IEFjdGl2ZURlc2NlbmRhbnRLZXlNYW5hZ2VyPENka09wdGlvbjxUPj47XG4gIF9zZWxlY3Rpb25Nb2RlbDogU2VsZWN0aW9uTW9kZWw8Q2RrT3B0aW9uPFQ+PjtcbiAgX3RhYkluZGV4ID0gMDtcblxuICAvKiogYFZpZXcgLT4gbW9kZWwgY2FsbGJhY2sgY2FsbGVkIHdoZW4gc2VsZWN0IGhhcyBiZWVuIHRvdWNoZWRgICovXG4gIF9vblRvdWNoZWQ6ICgpID0+IHZvaWQgPSAoKSA9PiB7fTtcblxuICAvKiogYFZpZXcgLT4gbW9kZWwgY2FsbGJhY2sgY2FsbGVkIHdoZW4gdmFsdWUgY2hhbmdlc2AgKi9cbiAgX29uQ2hhbmdlOiAodmFsdWU6IFQpID0+IHZvaWQgPSAoKSA9PiB7fTtcblxuICByZWFkb25seSBvcHRpb25TZWxlY3Rpb25DaGFuZ2VzOiBPYnNlcnZhYmxlPE9wdGlvblNlbGVjdGlvbkNoYW5nZUV2ZW50PFQ+PiA9IGRlZmVyKCgpID0+IHtcbiAgICBjb25zdCBvcHRpb25zID0gdGhpcy5fb3B0aW9ucztcblxuICAgIHJldHVybiBvcHRpb25zLmNoYW5nZXMucGlwZShcbiAgICAgIHN0YXJ0V2l0aChvcHRpb25zKSxcbiAgICAgIHN3aXRjaE1hcCgoKSA9PiBtZXJnZSguLi5vcHRpb25zLm1hcChvcHRpb24gPT4gb3B0aW9uLnNlbGVjdGlvbkNoYW5nZSkpKVxuICAgICk7XG4gIH0pIGFzIE9ic2VydmFibGU8T3B0aW9uU2VsZWN0aW9uQ2hhbmdlRXZlbnQ8VD4+O1xuXG4gIHByaXZhdGUgX2Rpc2FibGVkOiBib29sZWFuID0gZmFsc2U7XG4gIHByaXZhdGUgX211bHRpcGxlOiBib29sZWFuID0gZmFsc2U7XG4gIHByaXZhdGUgX3VzZUFjdGl2ZURlc2NlbmRhbnQ6IGJvb2xlYW4gPSBmYWxzZTtcbiAgcHJpdmF0ZSBfYXV0b0ZvY3VzOiBib29sZWFuID0gdHJ1ZTtcbiAgcHJpdmF0ZSBfYWN0aXZlT3B0aW9uOiBDZGtPcHRpb248VD47XG4gIHByaXZhdGUgcmVhZG9ubHkgX2Rlc3Ryb3llZCA9IG5ldyBTdWJqZWN0PHZvaWQ+KCk7XG5cbiAgQENvbnRlbnRDaGlsZHJlbihDZGtPcHRpb24sIHtkZXNjZW5kYW50czogdHJ1ZX0pIF9vcHRpb25zOiBRdWVyeUxpc3Q8Q2RrT3B0aW9uPFQ+PjtcblxuICBAT3V0cHV0KCkgcmVhZG9ubHkgc2VsZWN0aW9uQ2hhbmdlID1cbiAgICAgIG5ldyBFdmVudEVtaXR0ZXI8TGlzdGJveFNlbGVjdGlvbkNoYW5nZUV2ZW50PFQ+PigpO1xuXG4gIEBJbnB1dCgpIGlkID0gYGNkay1saXN0Ym94LSR7bGlzdGJveElkKyt9YDtcblxuICAvKipcbiAgICogV2hldGhlciB0aGUgbGlzdGJveCBhbGxvd3MgbXVsdGlwbGUgb3B0aW9ucyB0byBiZSBzZWxlY3RlZC5cbiAgICogSWYgYG11bHRpcGxlYCBzd2l0Y2hlcyBmcm9tIGB0cnVlYCB0byBgZmFsc2VgLCBhbGwgb3B0aW9ucyBhcmUgZGVzZWxlY3RlZC5cbiAgICovXG4gIEBJbnB1dCgpXG4gIGdldCBtdWx0aXBsZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fbXVsdGlwbGU7XG4gIH1cbiAgc2V0IG11bHRpcGxlKHZhbHVlOiBib29sZWFuKSB7XG4gICAgdGhpcy5fdXBkYXRlU2VsZWN0aW9uT25NdWx0aVNlbGVjdGlvbkNoYW5nZSh2YWx1ZSk7XG4gICAgdGhpcy5fbXVsdGlwbGUgPSBjb2VyY2VCb29sZWFuUHJvcGVydHkodmFsdWUpO1xuICB9XG5cbiAgQElucHV0KClcbiAgZ2V0IGRpc2FibGVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9kaXNhYmxlZDtcbiAgfVxuICBzZXQgZGlzYWJsZWQodmFsdWU6IGJvb2xlYW4pIHtcbiAgICB0aGlzLl9kaXNhYmxlZCA9IGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eSh2YWx1ZSk7XG4gIH1cblxuICAvKiogV2hldGhlciB0aGUgbGlzdGJveCB3aWxsIHVzZSBhY3RpdmUgZGVzY2VuZGFudCBvciB3aWxsIG1vdmUgZm9jdXMgb250byB0aGUgb3B0aW9ucy4gKi9cbiAgQElucHV0KClcbiAgZ2V0IHVzZUFjdGl2ZURlc2NlbmRhbnQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX3VzZUFjdGl2ZURlc2NlbmRhbnQ7XG4gIH1cbiAgc2V0IHVzZUFjdGl2ZURlc2NlbmRhbnQoc2hvdWxkVXNlQWN0aXZlRGVzY2VuZGFudDogYm9vbGVhbikge1xuICAgIHRoaXMuX3VzZUFjdGl2ZURlc2NlbmRhbnQgPSBjb2VyY2VCb29sZWFuUHJvcGVydHkoc2hvdWxkVXNlQWN0aXZlRGVzY2VuZGFudCk7XG4gIH1cblxuICAvKiogV2hldGhlciBvbiBmb2N1cyB0aGUgbGlzdGJveCB3aWxsIGZvY3VzIGl0cyBhY3RpdmUgb3B0aW9uLCBkZWZhdWx0IHRvIHRydWUuICovXG4gIEBJbnB1dCgpXG4gIGdldCBhdXRvRm9jdXMoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2F1dG9Gb2N1cztcbiAgfVxuICBzZXQgYXV0b0ZvY3VzKHNob3VsZEF1dG9Gb2N1czogYm9vbGVhbikge1xuICAgIHRoaXMuX2F1dG9Gb2N1cyA9IGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eShzaG91bGRBdXRvRm9jdXMpO1xuICB9XG5cbiAgLyoqIERldGVybWluZXMgdGhlIG9yaWVudGF0aW9uIGZvciB0aGUgbGlzdCBrZXkgbWFuYWdlci4gQWZmZWN0cyBrZXlib2FyZCBpbnRlcmFjdGlvbi4gKi9cbiAgQElucHV0KCdsaXN0Ym94T3JpZW50YXRpb24nKSBvcmllbnRhdGlvbjogJ2hvcml6b250YWwnIHwgJ3ZlcnRpY2FsJyA9ICd2ZXJ0aWNhbCc7XG5cbiAgQElucHV0KCkgY29tcGFyZVdpdGg6IChvMTogVCwgbzI6IFQpID0+IGJvb2xlYW4gPSAoYTEsIGEyKSA9PiBhMSA9PT0gYTI7XG5cbiAgQElucHV0KCdwYXJlbnRQYW5lbCcpIHByaXZhdGUgcmVhZG9ubHkgX2V4cGxpY2l0UGFuZWw6IENka0NvbWJvYm94UGFuZWw7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgQE9wdGlvbmFsKCkgQEluamVjdChQQU5FTCkgcmVhZG9ubHkgX3BhcmVudFBhbmVsPzogQ2RrQ29tYm9ib3hQYW5lbDxUPixcbiAgICBAT3B0aW9uYWwoKSBwcml2YXRlIHJlYWRvbmx5IF9kaXI/OiBEaXJlY3Rpb25hbGl0eVxuICApIHsgfVxuXG4gIG5nT25Jbml0KCkge1xuICAgIHRoaXMuX3NlbGVjdGlvbk1vZGVsID0gbmV3IFNlbGVjdGlvbk1vZGVsPENka09wdGlvbjxUPj4odGhpcy5tdWx0aXBsZSk7XG4gIH1cblxuICBuZ0FmdGVyQ29udGVudEluaXQoKSB7XG4gICAgdGhpcy5faW5pdEtleU1hbmFnZXIoKTtcbiAgICB0aGlzLl9pbml0U2VsZWN0aW9uTW9kZWwoKTtcbiAgICB0aGlzLl9yZWdpc3RlcldpdGhQYW5lbCgpO1xuXG4gICAgdGhpcy5vcHRpb25TZWxlY3Rpb25DaGFuZ2VzLnN1YnNjcmliZShldmVudCA9PiB7XG4gICAgICB0aGlzLl9lbWl0Q2hhbmdlRXZlbnQoZXZlbnQuc291cmNlKTtcbiAgICAgIHRoaXMuX3VwZGF0ZVNlbGVjdGlvbk1vZGVsKGV2ZW50LnNvdXJjZSk7XG4gICAgICB0aGlzLnNldEFjdGl2ZU9wdGlvbihldmVudC5zb3VyY2UpO1xuICAgICAgdGhpcy5fdXBkYXRlUGFuZWxGb3JTZWxlY3Rpb24oZXZlbnQuc291cmNlKTtcbiAgICB9KTtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIHRoaXMuX2xpc3RLZXlNYW5hZ2VyLmNoYW5nZS5jb21wbGV0ZSgpO1xuICAgIHRoaXMuX2Rlc3Ryb3llZC5uZXh0KCk7XG4gICAgdGhpcy5fZGVzdHJveWVkLmNvbXBsZXRlKCk7XG4gIH1cblxuICBwcml2YXRlIF9yZWdpc3RlcldpdGhQYW5lbCgpOiB2b2lkIHtcbiAgICBjb25zdCBwYW5lbCA9IHRoaXMuX3BhcmVudFBhbmVsIHx8IHRoaXMuX2V4cGxpY2l0UGFuZWw7XG4gICAgcGFuZWw/Ll9yZWdpc3RlckNvbnRlbnQodGhpcy5pZCwgJ2xpc3Rib3gnKTtcbiAgfVxuXG4gIHByaXZhdGUgX2luaXRLZXlNYW5hZ2VyKCkge1xuICAgIHRoaXMuX2xpc3RLZXlNYW5hZ2VyID0gbmV3IEFjdGl2ZURlc2NlbmRhbnRLZXlNYW5hZ2VyKHRoaXMuX29wdGlvbnMpXG4gICAgICAgIC53aXRoV3JhcCgpXG4gICAgICAgIC53aXRoVHlwZUFoZWFkKClcbiAgICAgICAgLndpdGhIb21lQW5kRW5kKClcbiAgICAgICAgLndpdGhBbGxvd2VkTW9kaWZpZXJLZXlzKFsnc2hpZnRLZXknXSk7XG5cbiAgICBpZiAodGhpcy5vcmllbnRhdGlvbiA9PT0gJ3ZlcnRpY2FsJykge1xuICAgICAgdGhpcy5fbGlzdEtleU1hbmFnZXIud2l0aFZlcnRpY2FsT3JpZW50YXRpb24oKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fbGlzdEtleU1hbmFnZXIud2l0aEhvcml6b250YWxPcmllbnRhdGlvbih0aGlzLl9kaXI/LnZhbHVlIHx8ICdsdHInKTtcbiAgICB9XG5cbiAgICB0aGlzLl9saXN0S2V5TWFuYWdlci5jaGFuZ2UucGlwZSh0YWtlVW50aWwodGhpcy5fZGVzdHJveWVkKSkuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgIHRoaXMuX3VwZGF0ZUFjdGl2ZU9wdGlvbigpO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfaW5pdFNlbGVjdGlvbk1vZGVsKCkge1xuICAgIHRoaXMuX3NlbGVjdGlvbk1vZGVsLmNoYW5nZWQucGlwZSh0YWtlVW50aWwodGhpcy5fZGVzdHJveWVkKSlcbiAgICAgICAgLnN1YnNjcmliZSgoZXZlbnQ6IFNlbGVjdGlvbkNoYW5nZTxDZGtPcHRpb248VD4+KSA9PiB7XG5cbiAgICAgIGZvciAoY29uc3Qgb3B0aW9uIG9mIGV2ZW50LmFkZGVkKSB7XG4gICAgICAgIG9wdGlvbi5zZWxlY3RlZCA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIGZvciAoY29uc3Qgb3B0aW9uIG9mIGV2ZW50LnJlbW92ZWQpIHtcbiAgICAgICAgb3B0aW9uLnNlbGVjdGVkID0gZmFsc2U7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBfa2V5ZG93bihldmVudDogS2V5Ym9hcmRFdmVudCkge1xuICAgIGlmICh0aGlzLl9kaXNhYmxlZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IG1hbmFnZXIgPSB0aGlzLl9saXN0S2V5TWFuYWdlcjtcbiAgICBjb25zdCB7a2V5Q29kZX0gPSBldmVudDtcbiAgICBjb25zdCBwcmV2aW91c0FjdGl2ZUluZGV4ID0gbWFuYWdlci5hY3RpdmVJdGVtSW5kZXg7XG5cbiAgICBpZiAoa2V5Q29kZSA9PT0gU1BBQ0UgfHwga2V5Q29kZSA9PT0gRU5URVIpIHtcbiAgICAgIGlmIChtYW5hZ2VyLmFjdGl2ZUl0ZW0gJiYgIW1hbmFnZXIuaXNUeXBpbmcoKSkge1xuICAgICAgICB0aGlzLl90b2dnbGVBY3RpdmVPcHRpb24oKTtcbiAgICAgIH1cbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICB9IGVsc2Uge1xuICAgICAgbWFuYWdlci5vbktleWRvd24oZXZlbnQpO1xuICAgIH1cblxuICAgIC8qKiBXaWxsIHNlbGVjdCBhbiBvcHRpb24gaWYgc2hpZnQgd2FzIHByZXNzZWQgd2hpbGUgbmF2aWdhdGluZyB0byB0aGUgb3B0aW9uICovXG4gICAgY29uc3QgaXNBcnJvdyA9IChrZXlDb2RlID09PSBVUF9BUlJPV1xuICAgICAgICB8fCBrZXlDb2RlID09PSBET1dOX0FSUk9XXG4gICAgICAgIHx8IGtleUNvZGUgPT09IExFRlRfQVJST1dcbiAgICAgICAgfHwga2V5Q29kZSA9PT0gUklHSFRfQVJST1cpO1xuICAgIGlmIChpc0Fycm93ICYmIGV2ZW50LnNoaWZ0S2V5ICYmIHByZXZpb3VzQWN0aXZlSW5kZXggIT09IHRoaXMuX2xpc3RLZXlNYW5hZ2VyLmFjdGl2ZUl0ZW1JbmRleCkge1xuICAgICAgdGhpcy5fdG9nZ2xlQWN0aXZlT3B0aW9uKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEVtaXRzIGEgc2VsZWN0aW9uIGNoYW5nZSBldmVudCwgY2FsbGVkIHdoZW4gYW4gb3B0aW9uIGhhcyBpdHMgc2VsZWN0ZWQgc3RhdGUgY2hhbmdlZC4gKi9cbiAgX2VtaXRDaGFuZ2VFdmVudChvcHRpb246IENka09wdGlvbjxUPikge1xuICAgIHRoaXMuc2VsZWN0aW9uQ2hhbmdlLmVtaXQoe1xuICAgICAgc291cmNlOiB0aGlzLFxuICAgICAgb3B0aW9uOiBvcHRpb25cbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBVcGRhdGVzIHRoZSBzZWxlY3Rpb24gbW9kZWwgYWZ0ZXIgYSB0b2dnbGUuICovXG4gIF91cGRhdGVTZWxlY3Rpb25Nb2RlbChvcHRpb246IENka09wdGlvbjxUPikge1xuICAgIGlmICghdGhpcy5tdWx0aXBsZSAmJiB0aGlzLl9zZWxlY3Rpb25Nb2RlbC5zZWxlY3RlZC5sZW5ndGggIT09IDApIHtcbiAgICAgIGNvbnN0IHByZXZpb3VzbHlTZWxlY3RlZCA9IHRoaXMuX3NlbGVjdGlvbk1vZGVsLnNlbGVjdGVkWzBdO1xuICAgICAgdGhpcy5kZXNlbGVjdChwcmV2aW91c2x5U2VsZWN0ZWQpO1xuICAgIH1cblxuICAgIG9wdGlvbi5zZWxlY3RlZCA/IHRoaXMuX3NlbGVjdGlvbk1vZGVsLnNlbGVjdChvcHRpb24pIDpcbiAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9zZWxlY3Rpb25Nb2RlbC5kZXNlbGVjdChvcHRpb24pO1xuICB9XG5cbiAgX3VwZGF0ZVBhbmVsRm9yU2VsZWN0aW9uKG9wdGlvbjogQ2RrT3B0aW9uPFQ+KSB7XG4gICAgY29uc3QgcGFuZWwgPSB0aGlzLl9wYXJlbnRQYW5lbCB8fCB0aGlzLl9leHBsaWNpdFBhbmVsO1xuICAgIGlmICghdGhpcy5tdWx0aXBsZSkge1xuICAgICAgb3B0aW9uLnNlbGVjdGVkID8gcGFuZWw/LmNsb3NlUGFuZWwob3B0aW9uLnZhbHVlKSA6IHBhbmVsPy5jbG9zZVBhbmVsKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHBhbmVsPy5jbG9zZVBhbmVsKHRoaXMuZ2V0U2VsZWN0ZWRWYWx1ZXMoKSk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFRvZ2dsZXMgdGhlIHNlbGVjdGVkIHN0YXRlIG9mIHRoZSBhY3RpdmUgb3B0aW9uIGlmIG5vdCBkaXNhYmxlZC4gKi9cbiAgcHJpdmF0ZSBfdG9nZ2xlQWN0aXZlT3B0aW9uKCkge1xuICAgIGNvbnN0IGFjdGl2ZU9wdGlvbiA9IHRoaXMuX2xpc3RLZXlNYW5hZ2VyLmFjdGl2ZUl0ZW07XG4gICAgaWYgKGFjdGl2ZU9wdGlvbiAmJiAhYWN0aXZlT3B0aW9uLmRpc2FibGVkKSB7XG4gICAgICBhY3RpdmVPcHRpb24udG9nZ2xlKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFJldHVybnMgdGhlIGlkIG9mIHRoZSBhY3RpdmUgb3B0aW9uIGlmIGFjdGl2ZSBkZXNjZW5kYW50IGlzIGJlaW5nIHVzZWQuICovXG4gIF9nZXRBcmlhQWN0aXZlRGVzY2VuZGFudCgpOiBzdHJpbmcgfCBudWxsIHwgdW5kZWZpbmVkIHtcbiAgICByZXR1cm4gdGhpcy5fdXNlQWN0aXZlRGVzY2VuZGFudCA/IHRoaXMuX2xpc3RLZXlNYW5hZ2VyPy5hY3RpdmVJdGVtPy5pZCA6IG51bGw7XG4gIH1cblxuICAvKiogVXBkYXRlcyB0aGUgYWN0aXZlT3B0aW9uIGFuZCB0aGUgYWN0aXZlIGFuZCBmb2N1cyBwcm9wZXJ0aWVzIG9mIHRoZSBvcHRpb24uICovXG4gIHByaXZhdGUgX3VwZGF0ZUFjdGl2ZU9wdGlvbigpIHtcbiAgICBpZiAoIXRoaXMuX2xpc3RLZXlNYW5hZ2VyLmFjdGl2ZUl0ZW0pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl9hY3RpdmVPcHRpb24/LmRlYWN0aXZhdGUoKTtcbiAgICB0aGlzLl9hY3RpdmVPcHRpb24gPSB0aGlzLl9saXN0S2V5TWFuYWdlci5hY3RpdmVJdGVtO1xuICAgIHRoaXMuX2FjdGl2ZU9wdGlvbi5hY3RpdmF0ZSgpO1xuXG4gICAgaWYgKCF0aGlzLnVzZUFjdGl2ZURlc2NlbmRhbnQpIHtcbiAgICAgIHRoaXMuX2FjdGl2ZU9wdGlvbi5mb2N1cygpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBVcGRhdGVzIHNlbGVjdGlvbiBzdGF0ZXMgb2Ygb3B0aW9ucyB3aGVuIHRoZSAnbXVsdGlwbGUnIHByb3BlcnR5IGNoYW5nZXMuICovXG4gIHByaXZhdGUgX3VwZGF0ZVNlbGVjdGlvbk9uTXVsdGlTZWxlY3Rpb25DaGFuZ2UodmFsdWU6IGJvb2xlYW4pIHtcbiAgICBpZiAodGhpcy5tdWx0aXBsZSAmJiAhdmFsdWUpIHtcbiAgICAgIC8vIERlc2VsZWN0IGFsbCBvcHRpb25zIGluc3RlYWQgb2YgYXJiaXRyYXJpbHkga2VlcGluZyBvbmUgb2YgdGhlIHNlbGVjdGVkIG9wdGlvbnMuXG4gICAgICB0aGlzLnNldEFsbFNlbGVjdGVkKGZhbHNlKTtcbiAgICB9IGVsc2UgaWYgKCF0aGlzLm11bHRpcGxlICYmIHZhbHVlKSB7XG4gICAgICB0aGlzLl9zZWxlY3Rpb25Nb2RlbCA9XG4gICAgICAgICAgbmV3IFNlbGVjdGlvbk1vZGVsPENka09wdGlvbjxUPj4odmFsdWUsIHRoaXMuX3NlbGVjdGlvbk1vZGVsPy5zZWxlY3RlZCk7XG4gICAgfVxuICB9XG5cbiAgX2ZvY3VzQWN0aXZlT3B0aW9uKCkge1xuICAgIGlmICghdGhpcy5hdXRvRm9jdXMpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fbGlzdEtleU1hbmFnZXIuYWN0aXZlSXRlbSkge1xuICAgICAgdGhpcy5zZXRBY3RpdmVPcHRpb24odGhpcy5fbGlzdEtleU1hbmFnZXIuYWN0aXZlSXRlbSk7XG4gICAgfSBlbHNlIGlmICh0aGlzLl9vcHRpb25zLmZpcnN0KSB7XG4gICAgICB0aGlzLnNldEFjdGl2ZU9wdGlvbih0aGlzLl9vcHRpb25zLmZpcnN0KTtcbiAgICB9XG4gIH1cblxuICAvKiogU2VsZWN0cyB0aGUgZ2l2ZW4gb3B0aW9uIGlmIHRoZSBvcHRpb24gYW5kIGxpc3Rib3ggYXJlbid0IGRpc2FibGVkLiAqL1xuICBzZWxlY3Qob3B0aW9uOiBDZGtPcHRpb248VD4pIHtcbiAgICBpZiAoIXRoaXMuZGlzYWJsZWQgJiYgIW9wdGlvbi5kaXNhYmxlZCkge1xuICAgICAgb3B0aW9uLnNlbGVjdCgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBEZXNlbGVjdHMgdGhlIGdpdmVuIG9wdGlvbiBpZiB0aGUgb3B0aW9uIGFuZCBsaXN0Ym94IGFyZW4ndCBkaXNhYmxlZC4gKi9cbiAgZGVzZWxlY3Qob3B0aW9uOiBDZGtPcHRpb248VD4pIHtcbiAgICBpZiAoIXRoaXMuZGlzYWJsZWQgJiYgIW9wdGlvbi5kaXNhYmxlZCkge1xuICAgICAgb3B0aW9uLmRlc2VsZWN0KCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFNldHMgdGhlIHNlbGVjdGVkIHN0YXRlIG9mIGFsbCBvcHRpb25zIHRvIGJlIHRoZSBnaXZlbiB2YWx1ZS4gKi9cbiAgc2V0QWxsU2VsZWN0ZWQoaXNTZWxlY3RlZDogYm9vbGVhbikge1xuICAgIGZvciAoY29uc3Qgb3B0aW9uIG9mIHRoaXMuX29wdGlvbnMudG9BcnJheSgpKSB7XG4gICAgICBpc1NlbGVjdGVkID8gdGhpcy5zZWxlY3Qob3B0aW9uKSA6IHRoaXMuZGVzZWxlY3Qob3B0aW9uKTtcbiAgICB9XG4gIH1cblxuICAvKiogVXBkYXRlcyB0aGUga2V5IG1hbmFnZXIncyBhY3RpdmUgaXRlbSB0byB0aGUgZ2l2ZW4gb3B0aW9uLiAqL1xuICBzZXRBY3RpdmVPcHRpb24ob3B0aW9uOiBDZGtPcHRpb248VD4pIHtcbiAgICB0aGlzLl9saXN0S2V5TWFuYWdlci51cGRhdGVBY3RpdmVJdGVtKG9wdGlvbik7XG4gICAgdGhpcy5fdXBkYXRlQWN0aXZlT3B0aW9uKCk7XG4gIH1cblxuICAvKipcbiAgICogU2F2ZXMgYSBjYWxsYmFjayBmdW5jdGlvbiB0byBiZSBpbnZva2VkIHdoZW4gdGhlIHNlbGVjdCdzIHZhbHVlXG4gICAqIGNoYW5nZXMgZnJvbSB1c2VyIGlucHV0LiBSZXF1aXJlZCB0byBpbXBsZW1lbnQgQ29udHJvbFZhbHVlQWNjZXNzb3IuXG4gICAqL1xuICByZWdpc3Rlck9uQ2hhbmdlKGZuOiAodmFsdWU6IFQpID0+IHZvaWQpOiB2b2lkIHtcbiAgICB0aGlzLl9vbkNoYW5nZSA9IGZuO1xuICB9XG5cbiAgLyoqXG4gICAqIFNhdmVzIGEgY2FsbGJhY2sgZnVuY3Rpb24gdG8gYmUgaW52b2tlZCB3aGVuIHRoZSBzZWxlY3QgaXMgYmx1cnJlZFxuICAgKiBieSB0aGUgdXNlci4gUmVxdWlyZWQgdG8gaW1wbGVtZW50IENvbnRyb2xWYWx1ZUFjY2Vzc29yLlxuICAgKi9cbiAgcmVnaXN0ZXJPblRvdWNoZWQoZm46ICgpID0+IHt9KTogdm9pZCB7XG4gICAgdGhpcy5fb25Ub3VjaGVkID0gZm47XG4gIH1cblxuICAvKiogU2V0cyB0aGUgc2VsZWN0J3MgdmFsdWUuIFJlcXVpcmVkIHRvIGltcGxlbWVudCBDb250cm9sVmFsdWVBY2Nlc3Nvci4gKi9cbiAgd3JpdGVWYWx1ZSh2YWx1ZXM6IFQgfCBUW10pOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fb3B0aW9ucykge1xuICAgICAgdGhpcy5fc2V0U2VsZWN0aW9uQnlWYWx1ZSh2YWx1ZXMpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBEaXNhYmxlcyB0aGUgc2VsZWN0LiBSZXF1aXJlZCB0byBpbXBsZW1lbnQgQ29udHJvbFZhbHVlQWNjZXNzb3IuICovXG4gIHNldERpc2FibGVkU3RhdGUoaXNEaXNhYmxlZDogYm9vbGVhbik6IHZvaWQge1xuICAgIHRoaXMuZGlzYWJsZWQgPSBpc0Rpc2FibGVkO1xuICB9XG5cbiAgLyoqIFJldHVybnMgdGhlIHZhbHVlcyBvZiB0aGUgY3VycmVudGx5IHNlbGVjdGVkIG9wdGlvbnMuICovXG4gIGdldFNlbGVjdGVkVmFsdWVzKCk6IFRbXSB7XG4gICAgcmV0dXJuIHRoaXMuX29wdGlvbnMuZmlsdGVyKG9wdGlvbiA9PiBvcHRpb24uc2VsZWN0ZWQpLm1hcChvcHRpb24gPT4gb3B0aW9uLnZhbHVlKTtcbiAgfVxuXG4gIC8qKiBTZWxlY3RzIGFuIG9wdGlvbiB0aGF0IGhhcyB0aGUgY29ycmVzcG9uZGluZyBnaXZlbiB2YWx1ZS4gKi9cbiAgcHJpdmF0ZSBfc2V0U2VsZWN0aW9uQnlWYWx1ZSh2YWx1ZXM6IFQgfCBUW10pIHtcbiAgICBmb3IgKGNvbnN0IG9wdGlvbiBvZiB0aGlzLl9vcHRpb25zLnRvQXJyYXkoKSkge1xuICAgICAgdGhpcy5kZXNlbGVjdChvcHRpb24pO1xuICAgIH1cblxuICAgIGNvbnN0IHZhbHVlc0FycmF5ID0gY29lcmNlQXJyYXkodmFsdWVzKTtcbiAgICBmb3IgKGNvbnN0IHZhbHVlIG9mIHZhbHVlc0FycmF5KSB7XG4gICAgICBjb25zdCBjb3JyZXNwb25kaW5nT3B0aW9uID0gdGhpcy5fb3B0aW9ucy5maW5kKChvcHRpb246IENka09wdGlvbjxUPikgPT4ge1xuICAgICAgICByZXR1cm4gb3B0aW9uLnZhbHVlICE9IG51bGwgJiYgdGhpcy5jb21wYXJlV2l0aChvcHRpb24udmFsdWUsIHZhbHVlKTtcbiAgICAgIH0pO1xuXG4gICAgICBpZiAoY29ycmVzcG9uZGluZ09wdGlvbikge1xuICAgICAgICB0aGlzLnNlbGVjdChjb3JyZXNwb25kaW5nT3B0aW9uKTtcbiAgICAgICAgaWYgKCF0aGlzLm11bHRpcGxlKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2Rpc2FibGVkOiBCb29sZWFuSW5wdXQ7XG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9tdWx0aXBsZTogQm9vbGVhbklucHV0O1xuICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfdXNlQWN0aXZlRGVzY2VuZGFudDogQm9vbGVhbklucHV0O1xuICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfYXV0b0ZvY3VzOiBCb29sZWFuSW5wdXQ7XG59XG5cbi8qKiBDaGFuZ2UgZXZlbnQgdGhhdCBpcyBiZWluZyBmaXJlZCB3aGVuZXZlciB0aGUgc2VsZWN0ZWQgc3RhdGUgb2YgYW4gb3B0aW9uIGNoYW5nZXMuICovXG5leHBvcnQgaW50ZXJmYWNlIExpc3Rib3hTZWxlY3Rpb25DaGFuZ2VFdmVudDxUPiB7XG4gIC8qKiBSZWZlcmVuY2UgdG8gdGhlIGxpc3Rib3ggdGhhdCBlbWl0dGVkIHRoZSBldmVudC4gKi9cbiAgcmVhZG9ubHkgc291cmNlOiBDZGtMaXN0Ym94PFQ+O1xuXG4gIC8qKiBSZWZlcmVuY2UgdG8gdGhlIG9wdGlvbiB0aGF0IGhhcyBiZWVuIGNoYW5nZWQuICovXG4gIHJlYWRvbmx5IG9wdGlvbjogQ2RrT3B0aW9uPFQ+O1xufVxuXG4vKiogRXZlbnQgb2JqZWN0IGVtaXR0ZWQgYnkgTWF0T3B0aW9uIHdoZW4gc2VsZWN0ZWQgb3IgZGVzZWxlY3RlZC4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgT3B0aW9uU2VsZWN0aW9uQ2hhbmdlRXZlbnQ8VD4ge1xuICAvKiogUmVmZXJlbmNlIHRvIHRoZSBvcHRpb24gdGhhdCBlbWl0dGVkIHRoZSBldmVudC4gKi9cbiAgc291cmNlOiBDZGtPcHRpb248VD47XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGNoYW5nZSBpbiB0aGUgb3B0aW9uJ3MgdmFsdWUgd2FzIGEgcmVzdWx0IG9mIGEgdXNlciBhY3Rpb24uICovXG4gIGlzVXNlcklucHV0OiBib29sZWFuO1xufVxuIl19