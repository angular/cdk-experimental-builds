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
        var _a;
        // TODO: make this a configurable function that can removed any desired type of node.
        for (const icon of Array.from(element.querySelectorAll('mat-icon, .material-icons'))) {
            (_a = icon.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild(icon);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdGJveC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL2xpc3Rib3gvbGlzdGJveC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBRUwsZUFBZSxFQUNmLFNBQVMsRUFDVCxVQUFVLEVBQUUsWUFBWSxFQUFFLFVBQVUsRUFDcEMsTUFBTSxFQUFFLGNBQWMsRUFDdEIsS0FBSyxFQUFxQixRQUFRLEVBQUUsTUFBTSxFQUMxQyxTQUFTLEVBQ1YsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFDLDBCQUEwQixFQUFzQyxNQUFNLG1CQUFtQixDQUFDO0FBQ2xHLE9BQU8sRUFBQyxVQUFVLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQ2xHLE9BQU8sRUFBZSxxQkFBcUIsRUFBRSxXQUFXLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUN2RixPQUFPLEVBQWtCLGNBQWMsRUFBQyxNQUFNLDBCQUEwQixDQUFDO0FBQ3pFLE9BQU8sRUFBQyxLQUFLLEVBQUUsS0FBSyxFQUFjLE9BQU8sRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUN2RCxPQUFPLEVBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUMvRCxPQUFPLEVBQXVCLGlCQUFpQixFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDdkUsT0FBTyxFQUFDLGdCQUFnQixFQUFDLE1BQU0sb0NBQW9DLENBQUM7QUFDcEUsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBRWpELElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQztBQUNmLElBQUksU0FBUyxHQUFHLENBQUMsQ0FBQztBQUVsQixNQUFNLENBQUMsTUFBTSwwQkFBMEIsR0FBUTtJQUM3QyxP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InNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1xuICBBZnRlckNvbnRlbnRJbml0LFxuICBDb250ZW50Q2hpbGRyZW4sXG4gIERpcmVjdGl2ZSxcbiAgRWxlbWVudFJlZiwgRXZlbnRFbWl0dGVyLCBmb3J3YXJkUmVmLFxuICBJbmplY3QsIEluamVjdGlvblRva2VuLFxuICBJbnB1dCwgT25EZXN0cm95LCBPbkluaXQsIE9wdGlvbmFsLCBPdXRwdXQsXG4gIFF1ZXJ5TGlzdFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7QWN0aXZlRGVzY2VuZGFudEtleU1hbmFnZXIsIEhpZ2hsaWdodGFibGUsIExpc3RLZXlNYW5hZ2VyT3B0aW9ufSBmcm9tICdAYW5ndWxhci9jZGsvYTExeSc7XG5pbXBvcnQge0RPV05fQVJST1csIEVOVEVSLCBTUEFDRSwgVVBfQVJST1csIExFRlRfQVJST1csIFJJR0hUX0FSUk9XfSBmcm9tICdAYW5ndWxhci9jZGsva2V5Y29kZXMnO1xuaW1wb3J0IHtCb29sZWFuSW5wdXQsIGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eSwgY29lcmNlQXJyYXl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2VyY2lvbic7XG5pbXBvcnQge1NlbGVjdGlvbkNoYW5nZSwgU2VsZWN0aW9uTW9kZWx9IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2xsZWN0aW9ucyc7XG5pbXBvcnQge2RlZmVyLCBtZXJnZSwgT2JzZXJ2YWJsZSwgU3ViamVjdH0gZnJvbSAncnhqcyc7XG5pbXBvcnQge3N0YXJ0V2l0aCwgc3dpdGNoTWFwLCB0YWtlVW50aWx9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7Q29udHJvbFZhbHVlQWNjZXNzb3IsIE5HX1ZBTFVFX0FDQ0VTU09SfSBmcm9tICdAYW5ndWxhci9mb3Jtcyc7XG5pbXBvcnQge0Nka0NvbWJvYm94UGFuZWx9IGZyb20gJ0Bhbmd1bGFyL2Nkay1leHBlcmltZW50YWwvY29tYm9ib3gnO1xuaW1wb3J0IHtEaXJlY3Rpb25hbGl0eX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2JpZGknO1xuXG5sZXQgbmV4dElkID0gMDtcbmxldCBsaXN0Ym94SWQgPSAwO1xuXG5leHBvcnQgY29uc3QgQ0RLX0xJU1RCT1hfVkFMVUVfQUNDRVNTT1I6IGFueSA9IHtcbiAgcHJvdmlkZTogTkdfVkFMVUVfQUNDRVNTT1IsXG4gIHVzZUV4aXN0aW5nOiBmb3J3YXJkUmVmKCgpID0+IENka0xpc3Rib3gpLFxuICBtdWx0aTogdHJ1ZVxufTtcblxuZXhwb3J0IGNvbnN0IFBBTkVMID0gbmV3IEluamVjdGlvblRva2VuPENka0NvbWJvYm94UGFuZWw+KCdDZGtDb21ib2JveFBhbmVsJyk7XG5cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tjZGtPcHRpb25dJyxcbiAgZXhwb3J0QXM6ICdjZGtPcHRpb24nLFxuICBob3N0OiB7XG4gICAgJ3JvbGUnOiAnb3B0aW9uJyxcbiAgICAnY2xhc3MnOiAnY2RrLW9wdGlvbicsXG4gICAgJyhjbGljayknOiAndG9nZ2xlKCknLFxuICAgICcoZm9jdXMpJzogJ2FjdGl2YXRlKCknLFxuICAgICcoYmx1ciknOiAnZGVhY3RpdmF0ZSgpJyxcbiAgICAnW2lkXSc6ICdpZCcsXG4gICAgJ1thdHRyLmFyaWEtc2VsZWN0ZWRdJzogJ3NlbGVjdGVkIHx8IG51bGwnLFxuICAgICdbYXR0ci50YWJpbmRleF0nOiAnX2dldFRhYkluZGV4KCknLFxuICAgICdbYXR0ci5hcmlhLWRpc2FibGVkXSc6ICdfaXNJbnRlcmFjdGlvbkRpc2FibGVkKCknLFxuICAgICdbY2xhc3MuY2RrLW9wdGlvbi1kaXNhYmxlZF0nOiAnX2lzSW50ZXJhY3Rpb25EaXNhYmxlZCgpJyxcbiAgICAnW2NsYXNzLmNkay1vcHRpb24tYWN0aXZlXSc6ICdfYWN0aXZlJyxcbiAgICAnW2NsYXNzLmNkay1vcHRpb24tc2VsZWN0ZWRdJzogJ3NlbGVjdGVkJ1xuICB9XG59KVxuZXhwb3J0IGNsYXNzIENka09wdGlvbjxUID0gdW5rbm93bj4gaW1wbGVtZW50cyBMaXN0S2V5TWFuYWdlck9wdGlvbiwgSGlnaGxpZ2h0YWJsZSB7XG4gIHByaXZhdGUgX3NlbGVjdGVkOiBib29sZWFuID0gZmFsc2U7XG4gIHByaXZhdGUgX2Rpc2FibGVkOiBib29sZWFuID0gZmFsc2U7XG4gIHByaXZhdGUgX3ZhbHVlOiBUO1xuICBfYWN0aXZlOiBib29sZWFuID0gZmFsc2U7XG5cbiAgLyoqIFRoZSBpZCBvZiB0aGUgb3B0aW9uLCBzZXQgdG8gYSB1bmlxdWVpZCBpZiB0aGUgdXNlciBkb2VzIG5vdCBwcm92aWRlIG9uZS4gKi9cbiAgQElucHV0KCkgaWQgPSBgY2RrLW9wdGlvbi0ke25leHRJZCsrfWA7XG5cbiAgQElucHV0KClcbiAgZ2V0IHNlbGVjdGVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9zZWxlY3RlZDtcbiAgfVxuICBzZXQgc2VsZWN0ZWQodmFsdWU6IGJvb2xlYW4pIHtcbiAgICBpZiAoIXRoaXMuX2Rpc2FibGVkKSB7XG4gICAgICB0aGlzLl9zZWxlY3RlZCA9IGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eSh2YWx1ZSk7XG4gICAgfVxuICB9XG5cbiAgQElucHV0KClcbiAgZ2V0IGRpc2FibGVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9kaXNhYmxlZDtcbiAgfVxuICBzZXQgZGlzYWJsZWQodmFsdWU6IGJvb2xlYW4pIHtcbiAgICB0aGlzLl9kaXNhYmxlZCA9IGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eSh2YWx1ZSk7XG4gIH1cblxuICAvKiogVGhlIGZvcm0gdmFsdWUgb2YgdGhlIG9wdGlvbi4gKi9cbiAgQElucHV0KClcbiAgZ2V0IHZhbHVlKCk6IFQge1xuICAgIHJldHVybiB0aGlzLl92YWx1ZTtcbiAgfVxuICBzZXQgdmFsdWUodmFsdWU6IFQpIHtcbiAgICBpZiAodGhpcy5zZWxlY3RlZCAmJiB2YWx1ZSAhPT0gdGhpcy5fdmFsdWUpIHtcbiAgICAgIHRoaXMuZGVzZWxlY3QoKTtcbiAgICB9XG4gICAgdGhpcy5fdmFsdWUgPSB2YWx1ZTtcbiAgfVxuXG4gIEBPdXRwdXQoKSByZWFkb25seSBzZWxlY3Rpb25DaGFuZ2U6IEV2ZW50RW1pdHRlcjxPcHRpb25TZWxlY3Rpb25DaGFuZ2VFdmVudDxUPj4gPVxuICAgICAgbmV3IEV2ZW50RW1pdHRlcjxPcHRpb25TZWxlY3Rpb25DaGFuZ2VFdmVudDxUPj4oKTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHJlYWRvbmx5IF9lbGVtZW50UmVmOiBFbGVtZW50UmVmLFxuICAgICAgICAgICAgICBASW5qZWN0KGZvcndhcmRSZWYoKCkgPT4gQ2RrTGlzdGJveCkpIHJlYWRvbmx5IGxpc3Rib3g6IENka0xpc3Rib3g8VD4pIHtcbiAgfVxuXG4gIC8qKiBUb2dnbGVzIHRoZSBzZWxlY3RlZCBzdGF0ZSwgZW1pdHMgYSBjaGFuZ2UgZXZlbnQgdGhyb3VnaCB0aGUgaW5qZWN0ZWQgbGlzdGJveC4gKi9cbiAgdG9nZ2xlKCkge1xuICAgIGlmICghdGhpcy5faXNJbnRlcmFjdGlvbkRpc2FibGVkKCkpIHtcbiAgICAgIHRoaXMuc2VsZWN0ZWQgPSAhdGhpcy5zZWxlY3RlZDtcbiAgICAgIHRoaXMuX2VtaXRTZWxlY3Rpb25DaGFuZ2UodHJ1ZSk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFNldHMgdGhlIGFjdGl2ZSBwcm9wZXJ0eSB0cnVlIGlmIHRoZSBvcHRpb24gYW5kIGxpc3Rib3ggYXJlbid0IGRpc2FibGVkLiAqL1xuICBhY3RpdmF0ZSgpIHtcbiAgICBpZiAoIXRoaXMuX2lzSW50ZXJhY3Rpb25EaXNhYmxlZCgpKSB7XG4gICAgICB0aGlzLl9hY3RpdmUgPSB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBTZXRzIHRoZSBhY3RpdmUgcHJvcGVydHkgZmFsc2UuICovXG4gIGRlYWN0aXZhdGUoKSB7XG4gICAgaWYgKCF0aGlzLl9pc0ludGVyYWN0aW9uRGlzYWJsZWQoKSkge1xuICAgICAgdGhpcy5fYWN0aXZlID0gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgLyoqIFNldHMgdGhlIHNlbGVjdGVkIHByb3BlcnR5IHRydWUgaWYgaXQgd2FzIGZhbHNlLiAqL1xuICBzZWxlY3QoKSB7XG4gICAgaWYgKCF0aGlzLnNlbGVjdGVkKSB7XG4gICAgICB0aGlzLnNlbGVjdGVkID0gdHJ1ZTtcbiAgICAgIHRoaXMuX2VtaXRTZWxlY3Rpb25DaGFuZ2UoKTtcbiAgICB9XG4gIH1cblxuICAvKiogU2V0cyB0aGUgc2VsZWN0ZWQgcHJvcGVydHkgZmFsc2UgaWYgaXQgd2FzIHRydWUuICovXG4gIGRlc2VsZWN0KCkge1xuICAgIGlmICh0aGlzLnNlbGVjdGVkKSB7XG4gICAgICB0aGlzLnNlbGVjdGVkID0gZmFsc2U7XG4gICAgICB0aGlzLl9lbWl0U2VsZWN0aW9uQ2hhbmdlKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEFwcGxpZXMgZm9jdXMgdG8gdGhlIG9wdGlvbi4gKi9cbiAgZm9jdXMoKSB7XG4gICAgdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LmZvY3VzKCk7XG4gIH1cblxuICAvKiogUmV0dXJucyB0cnVlIGlmIHRoZSBvcHRpb24gb3IgbGlzdGJveCBhcmUgZGlzYWJsZWQsIGFuZCBmYWxzZSBvdGhlcndpc2UuICovXG4gIF9pc0ludGVyYWN0aW9uRGlzYWJsZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuICh0aGlzLmxpc3Rib3guZGlzYWJsZWQgfHwgdGhpcy5fZGlzYWJsZWQpO1xuICB9XG5cbiAgLyoqIEVtaXRzIGEgY2hhbmdlIGV2ZW50IGV4dGVuZGluZyB0aGUgT3B0aW9uIFNlbGVjdGlvbiBDaGFuZ2UgRXZlbnQgaW50ZXJmYWNlLiAqL1xuICBwcml2YXRlIF9lbWl0U2VsZWN0aW9uQ2hhbmdlKGlzVXNlcklucHV0ID0gZmFsc2UpIHtcbiAgICB0aGlzLnNlbGVjdGlvbkNoYW5nZS5lbWl0KHtcbiAgICAgIHNvdXJjZTogdGhpcyxcbiAgICAgIGlzVXNlcklucHV0OiBpc1VzZXJJbnB1dFxuICAgIH0pO1xuICB9XG5cbiAgLyoqIFJldHVybnMgdGhlIHRhYiBpbmRleCB3aGljaCBkZXBlbmRzIG9uIHRoZSBkaXNhYmxlZCBwcm9wZXJ0eS4gKi9cbiAgX2dldFRhYkluZGV4KCk6IHN0cmluZyB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLl9pc0ludGVyYWN0aW9uRGlzYWJsZWQoKSA/IG51bGwgOiAnLTEnO1xuICB9XG5cbiAgLyoqIEdldCB0aGUgbGFiZWwgZm9yIHRoaXMgZWxlbWVudCB3aGljaCBpcyByZXF1aXJlZCBieSB0aGUgRm9jdXNhYmxlT3B0aW9uIGludGVyZmFjZS4gKi9cbiAgZ2V0TGFiZWwoKSB7XG4gICAgLy8gd2Uga25vdyB0aGF0IHRoZSBjdXJyZW50IG5vZGUgaXMgYW4gZWxlbWVudCB0eXBlXG4gICAgY29uc3QgY2xvbmUgPSB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQuY2xvbmVOb2RlKHRydWUpIGFzIEVsZW1lbnQ7XG4gICAgdGhpcy5fcmVtb3ZlSWNvbnMoY2xvbmUpO1xuXG4gICAgcmV0dXJuIGNsb25lLnRleHRDb250ZW50Py50cmltKCkgfHwgJyc7XG4gIH1cblxuICAvKiogUmVtb3ZlIGFueSBjaGlsZCBmcm9tIHRoZSBnaXZlbiBlbGVtZW50IHdoaWNoIGNhbiBiZSBpZGVudGlmaWVkIGFzIGFuIGljb24uICovXG4gIHByaXZhdGUgX3JlbW92ZUljb25zKGVsZW1lbnQ6IEVsZW1lbnQpIHtcbiAgICAvLyBUT0RPOiBtYWtlIHRoaXMgYSBjb25maWd1cmFibGUgZnVuY3Rpb24gdGhhdCBjYW4gcmVtb3ZlZCBhbnkgZGVzaXJlZCB0eXBlIG9mIG5vZGUuXG4gICAgZm9yIChjb25zdCBpY29uIG9mIEFycmF5LmZyb20oZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKCdtYXQtaWNvbiwgLm1hdGVyaWFsLWljb25zJykpKSB7XG4gICAgICBpY29uLnBhcmVudE5vZGU/LnJlbW92ZUNoaWxkKGljb24pO1xuICAgIH1cbiAgfVxuXG4gIGdldEVsZW1lbnRSZWYoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2VsZW1lbnRSZWY7XG4gIH1cblxuICAvKiogU2V0cyB0aGUgYWN0aXZlIHByb3BlcnR5IHRvIHRydWUgdG8gZW5hYmxlIHRoZSBhY3RpdmUgY3NzIGNsYXNzLiAqL1xuICBzZXRBY3RpdmVTdHlsZXMoKSB7XG4gICAgdGhpcy5fYWN0aXZlID0gdHJ1ZTtcbiAgfVxuXG4gIC8qKiBTZXRzIHRoZSBhY3RpdmUgcHJvcGVydHkgdG8gZmFsc2UgdG8gZGlzYWJsZSB0aGUgYWN0aXZlIGNzcyBjbGFzcy4gKi9cbiAgc2V0SW5hY3RpdmVTdHlsZXMoKSB7XG4gICAgdGhpcy5fYWN0aXZlID0gZmFsc2U7XG4gIH1cblxuICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc2VsZWN0ZWQ6IEJvb2xlYW5JbnB1dDtcbiAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2Rpc2FibGVkOiBCb29sZWFuSW5wdXQ7XG59XG5cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tjZGtMaXN0Ym94XScsXG4gIGV4cG9ydEFzOiAnY2RrTGlzdGJveCcsXG4gIGhvc3Q6IHtcbiAgICAncm9sZSc6ICdsaXN0Ym94JyxcbiAgICAnY2xhc3MnOiAnY2RrLWxpc3Rib3gnLFxuICAgICdbaWRdJzogJ2lkJyxcbiAgICAnKGZvY3VzKSc6ICdfZm9jdXNBY3RpdmVPcHRpb24oKScsXG4gICAgJyhrZXlkb3duKSc6ICdfa2V5ZG93bigkZXZlbnQpJyxcbiAgICAnW2F0dHIudGFiaW5kZXhdJzogJ190YWJJbmRleCcsXG4gICAgJ1thdHRyLmFyaWEtZGlzYWJsZWRdJzogJ2Rpc2FibGVkJyxcbiAgICAnW2F0dHIuYXJpYS1tdWx0aXNlbGVjdGFibGVdJzogJ211bHRpcGxlJyxcbiAgICAnW2F0dHIuYXJpYS1hY3RpdmVkZXNjZW5kYW50XSc6ICdfZ2V0QXJpYUFjdGl2ZURlc2NlbmRhbnQoKScsXG4gICAgJ1thdHRyLmFyaWEtb3JpZW50YXRpb25dJzogJ29yaWVudGF0aW9uJ1xuICB9LFxuICBwcm92aWRlcnM6IFtDREtfTElTVEJPWF9WQUxVRV9BQ0NFU1NPUl1cbn0pXG5leHBvcnQgY2xhc3MgQ2RrTGlzdGJveDxUPiBpbXBsZW1lbnRzIEFmdGVyQ29udGVudEluaXQsIE9uRGVzdHJveSwgT25Jbml0LCBDb250cm9sVmFsdWVBY2Nlc3NvciB7XG5cbiAgX2xpc3RLZXlNYW5hZ2VyOiBBY3RpdmVEZXNjZW5kYW50S2V5TWFuYWdlcjxDZGtPcHRpb248VD4+O1xuICBfc2VsZWN0aW9uTW9kZWw6IFNlbGVjdGlvbk1vZGVsPENka09wdGlvbjxUPj47XG4gIF90YWJJbmRleCA9IDA7XG5cbiAgLyoqIGBWaWV3IC0+IG1vZGVsIGNhbGxiYWNrIGNhbGxlZCB3aGVuIHNlbGVjdCBoYXMgYmVlbiB0b3VjaGVkYCAqL1xuICBfb25Ub3VjaGVkOiAoKSA9PiB2b2lkID0gKCkgPT4ge307XG5cbiAgLyoqIGBWaWV3IC0+IG1vZGVsIGNhbGxiYWNrIGNhbGxlZCB3aGVuIHZhbHVlIGNoYW5nZXNgICovXG4gIF9vbkNoYW5nZTogKHZhbHVlOiBUKSA9PiB2b2lkID0gKCkgPT4ge307XG5cbiAgcmVhZG9ubHkgb3B0aW9uU2VsZWN0aW9uQ2hhbmdlczogT2JzZXJ2YWJsZTxPcHRpb25TZWxlY3Rpb25DaGFuZ2VFdmVudDxUPj4gPSBkZWZlcigoKSA9PiB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHRoaXMuX29wdGlvbnM7XG5cbiAgICByZXR1cm4gb3B0aW9ucy5jaGFuZ2VzLnBpcGUoXG4gICAgICBzdGFydFdpdGgob3B0aW9ucyksXG4gICAgICBzd2l0Y2hNYXAoKCkgPT4gbWVyZ2UoLi4ub3B0aW9ucy5tYXAob3B0aW9uID0+IG9wdGlvbi5zZWxlY3Rpb25DaGFuZ2UpKSlcbiAgICApO1xuICB9KSBhcyBPYnNlcnZhYmxlPE9wdGlvblNlbGVjdGlvbkNoYW5nZUV2ZW50PFQ+PjtcblxuICBwcml2YXRlIF9kaXNhYmxlZDogYm9vbGVhbiA9IGZhbHNlO1xuICBwcml2YXRlIF9tdWx0aXBsZTogYm9vbGVhbiA9IGZhbHNlO1xuICBwcml2YXRlIF91c2VBY3RpdmVEZXNjZW5kYW50OiBib29sZWFuID0gZmFsc2U7XG4gIHByaXZhdGUgX2F1dG9Gb2N1czogYm9vbGVhbiA9IHRydWU7XG4gIHByaXZhdGUgX2FjdGl2ZU9wdGlvbjogQ2RrT3B0aW9uPFQ+O1xuICBwcml2YXRlIHJlYWRvbmx5IF9kZXN0cm95ZWQgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xuXG4gIEBDb250ZW50Q2hpbGRyZW4oQ2RrT3B0aW9uLCB7ZGVzY2VuZGFudHM6IHRydWV9KSBfb3B0aW9uczogUXVlcnlMaXN0PENka09wdGlvbjxUPj47XG5cbiAgQE91dHB1dCgpIHJlYWRvbmx5IHNlbGVjdGlvbkNoYW5nZTogRXZlbnRFbWl0dGVyPExpc3Rib3hTZWxlY3Rpb25DaGFuZ2VFdmVudDxUPj4gPVxuICAgICAgbmV3IEV2ZW50RW1pdHRlcjxMaXN0Ym94U2VsZWN0aW9uQ2hhbmdlRXZlbnQ8VD4+KCk7XG5cbiAgQElucHV0KCkgaWQgPSBgY2RrLWxpc3Rib3gtJHtsaXN0Ym94SWQrK31gO1xuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoZSBsaXN0Ym94IGFsbG93cyBtdWx0aXBsZSBvcHRpb25zIHRvIGJlIHNlbGVjdGVkLlxuICAgKiBJZiBgbXVsdGlwbGVgIHN3aXRjaGVzIGZyb20gYHRydWVgIHRvIGBmYWxzZWAsIGFsbCBvcHRpb25zIGFyZSBkZXNlbGVjdGVkLlxuICAgKi9cbiAgQElucHV0KClcbiAgZ2V0IG11bHRpcGxlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9tdWx0aXBsZTtcbiAgfVxuICBzZXQgbXVsdGlwbGUodmFsdWU6IGJvb2xlYW4pIHtcbiAgICB0aGlzLl91cGRhdGVTZWxlY3Rpb25Pbk11bHRpU2VsZWN0aW9uQ2hhbmdlKHZhbHVlKTtcbiAgICB0aGlzLl9tdWx0aXBsZSA9IGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eSh2YWx1ZSk7XG4gIH1cblxuICBASW5wdXQoKVxuICBnZXQgZGlzYWJsZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2Rpc2FibGVkO1xuICB9XG4gIHNldCBkaXNhYmxlZCh2YWx1ZTogYm9vbGVhbikge1xuICAgIHRoaXMuX2Rpc2FibGVkID0gY29lcmNlQm9vbGVhblByb3BlcnR5KHZhbHVlKTtcbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoZSBsaXN0Ym94IHdpbGwgdXNlIGFjdGl2ZSBkZXNjZW5kYW50IG9yIHdpbGwgbW92ZSBmb2N1cyBvbnRvIHRoZSBvcHRpb25zLiAqL1xuICBASW5wdXQoKVxuICBnZXQgdXNlQWN0aXZlRGVzY2VuZGFudCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fdXNlQWN0aXZlRGVzY2VuZGFudDtcbiAgfVxuICBzZXQgdXNlQWN0aXZlRGVzY2VuZGFudChzaG91bGRVc2VBY3RpdmVEZXNjZW5kYW50OiBib29sZWFuKSB7XG4gICAgdGhpcy5fdXNlQWN0aXZlRGVzY2VuZGFudCA9IGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eShzaG91bGRVc2VBY3RpdmVEZXNjZW5kYW50KTtcbiAgfVxuXG4gIC8qKiBXaGV0aGVyIG9uIGZvY3VzIHRoZSBsaXN0Ym94IHdpbGwgZm9jdXMgaXRzIGFjdGl2ZSBvcHRpb24sIGRlZmF1bHQgdG8gdHJ1ZS4gKi9cbiAgQElucHV0KClcbiAgZ2V0IGF1dG9Gb2N1cygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fYXV0b0ZvY3VzO1xuICB9XG4gIHNldCBhdXRvRm9jdXMoc2hvdWxkQXV0b0ZvY3VzOiBib29sZWFuKSB7XG4gICAgdGhpcy5fYXV0b0ZvY3VzID0gY29lcmNlQm9vbGVhblByb3BlcnR5KHNob3VsZEF1dG9Gb2N1cyk7XG4gIH1cblxuICAvKiogRGV0ZXJtaW5lcyB0aGUgb3JpZW50YXRpb24gZm9yIHRoZSBsaXN0IGtleSBtYW5hZ2VyLiBBZmZlY3RzIGtleWJvYXJkIGludGVyYWN0aW9uLiAqL1xuICBASW5wdXQoJ2xpc3Rib3hPcmllbnRhdGlvbicpIG9yaWVudGF0aW9uOiAnaG9yaXpvbnRhbCcgfCAndmVydGljYWwnID0gJ3ZlcnRpY2FsJztcblxuICBASW5wdXQoKSBjb21wYXJlV2l0aDogKG8xOiBULCBvMjogVCkgPT4gYm9vbGVhbiA9IChhMSwgYTIpID0+IGExID09PSBhMjtcblxuICBASW5wdXQoJ3BhcmVudFBhbmVsJykgcHJpdmF0ZSByZWFkb25seSBfZXhwbGljaXRQYW5lbDogQ2RrQ29tYm9ib3hQYW5lbDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBAT3B0aW9uYWwoKSBASW5qZWN0KFBBTkVMKSByZWFkb25seSBfcGFyZW50UGFuZWw/OiBDZGtDb21ib2JveFBhbmVsPFQ+LFxuICAgIEBPcHRpb25hbCgpIHByaXZhdGUgcmVhZG9ubHkgX2Rpcj86IERpcmVjdGlvbmFsaXR5XG4gICkgeyB9XG5cbiAgbmdPbkluaXQoKSB7XG4gICAgdGhpcy5fc2VsZWN0aW9uTW9kZWwgPSBuZXcgU2VsZWN0aW9uTW9kZWw8Q2RrT3B0aW9uPFQ+Pih0aGlzLm11bHRpcGxlKTtcbiAgfVxuXG4gIG5nQWZ0ZXJDb250ZW50SW5pdCgpIHtcbiAgICB0aGlzLl9pbml0S2V5TWFuYWdlcigpO1xuICAgIHRoaXMuX2luaXRTZWxlY3Rpb25Nb2RlbCgpO1xuICAgIHRoaXMuX3JlZ2lzdGVyV2l0aFBhbmVsKCk7XG5cbiAgICB0aGlzLm9wdGlvblNlbGVjdGlvbkNoYW5nZXMuc3Vic2NyaWJlKGV2ZW50ID0+IHtcbiAgICAgIHRoaXMuX2VtaXRDaGFuZ2VFdmVudChldmVudC5zb3VyY2UpO1xuICAgICAgdGhpcy5fdXBkYXRlU2VsZWN0aW9uTW9kZWwoZXZlbnQuc291cmNlKTtcbiAgICAgIHRoaXMuc2V0QWN0aXZlT3B0aW9uKGV2ZW50LnNvdXJjZSk7XG4gICAgICB0aGlzLl91cGRhdGVQYW5lbEZvclNlbGVjdGlvbihldmVudC5zb3VyY2UpO1xuICAgIH0pO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgdGhpcy5fbGlzdEtleU1hbmFnZXIuY2hhbmdlLmNvbXBsZXRlKCk7XG4gICAgdGhpcy5fZGVzdHJveWVkLm5leHQoKTtcbiAgICB0aGlzLl9kZXN0cm95ZWQuY29tcGxldGUoKTtcbiAgfVxuXG4gIHByaXZhdGUgX3JlZ2lzdGVyV2l0aFBhbmVsKCk6IHZvaWQge1xuICAgIGNvbnN0IHBhbmVsID0gdGhpcy5fcGFyZW50UGFuZWwgfHwgdGhpcy5fZXhwbGljaXRQYW5lbDtcbiAgICBwYW5lbD8uX3JlZ2lzdGVyQ29udGVudCh0aGlzLmlkLCAnbGlzdGJveCcpO1xuICB9XG5cbiAgcHJpdmF0ZSBfaW5pdEtleU1hbmFnZXIoKSB7XG4gICAgdGhpcy5fbGlzdEtleU1hbmFnZXIgPSBuZXcgQWN0aXZlRGVzY2VuZGFudEtleU1hbmFnZXIodGhpcy5fb3B0aW9ucylcbiAgICAgICAgLndpdGhXcmFwKClcbiAgICAgICAgLndpdGhUeXBlQWhlYWQoKVxuICAgICAgICAud2l0aEhvbWVBbmRFbmQoKVxuICAgICAgICAud2l0aEFsbG93ZWRNb2RpZmllcktleXMoWydzaGlmdEtleSddKTtcblxuICAgIGlmICh0aGlzLm9yaWVudGF0aW9uID09PSAndmVydGljYWwnKSB7XG4gICAgICB0aGlzLl9saXN0S2V5TWFuYWdlci53aXRoVmVydGljYWxPcmllbnRhdGlvbigpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9saXN0S2V5TWFuYWdlci53aXRoSG9yaXpvbnRhbE9yaWVudGF0aW9uKHRoaXMuX2Rpcj8udmFsdWUgfHwgJ2x0cicpO1xuICAgIH1cblxuICAgIHRoaXMuX2xpc3RLZXlNYW5hZ2VyLmNoYW5nZS5waXBlKHRha2VVbnRpbCh0aGlzLl9kZXN0cm95ZWQpKS5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgdGhpcy5fdXBkYXRlQWN0aXZlT3B0aW9uKCk7XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIF9pbml0U2VsZWN0aW9uTW9kZWwoKSB7XG4gICAgdGhpcy5fc2VsZWN0aW9uTW9kZWwuY2hhbmdlZC5waXBlKHRha2VVbnRpbCh0aGlzLl9kZXN0cm95ZWQpKVxuICAgICAgICAuc3Vic2NyaWJlKChldmVudDogU2VsZWN0aW9uQ2hhbmdlPENka09wdGlvbjxUPj4pID0+IHtcblxuICAgICAgZm9yIChjb25zdCBvcHRpb24gb2YgZXZlbnQuYWRkZWQpIHtcbiAgICAgICAgb3B0aW9uLnNlbGVjdGVkID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgZm9yIChjb25zdCBvcHRpb24gb2YgZXZlbnQucmVtb3ZlZCkge1xuICAgICAgICBvcHRpb24uc2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIF9rZXlkb3duKGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XG4gICAgaWYgKHRoaXMuX2Rpc2FibGVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgbWFuYWdlciA9IHRoaXMuX2xpc3RLZXlNYW5hZ2VyO1xuICAgIGNvbnN0IHtrZXlDb2RlfSA9IGV2ZW50O1xuICAgIGNvbnN0IHByZXZpb3VzQWN0aXZlSW5kZXggPSBtYW5hZ2VyLmFjdGl2ZUl0ZW1JbmRleDtcblxuICAgIGlmIChrZXlDb2RlID09PSBTUEFDRSB8fCBrZXlDb2RlID09PSBFTlRFUikge1xuICAgICAgaWYgKG1hbmFnZXIuYWN0aXZlSXRlbSAmJiAhbWFuYWdlci5pc1R5cGluZygpKSB7XG4gICAgICAgIHRoaXMuX3RvZ2dsZUFjdGl2ZU9wdGlvbigpO1xuICAgICAgfVxuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgIH0gZWxzZSB7XG4gICAgICBtYW5hZ2VyLm9uS2V5ZG93bihldmVudCk7XG4gICAgfVxuXG4gICAgLyoqIFdpbGwgc2VsZWN0IGFuIG9wdGlvbiBpZiBzaGlmdCB3YXMgcHJlc3NlZCB3aGlsZSBuYXZpZ2F0aW5nIHRvIHRoZSBvcHRpb24gKi9cbiAgICBjb25zdCBpc0Fycm93ID0gKGtleUNvZGUgPT09IFVQX0FSUk9XXG4gICAgICAgIHx8IGtleUNvZGUgPT09IERPV05fQVJST1dcbiAgICAgICAgfHwga2V5Q29kZSA9PT0gTEVGVF9BUlJPV1xuICAgICAgICB8fCBrZXlDb2RlID09PSBSSUdIVF9BUlJPVyk7XG4gICAgaWYgKGlzQXJyb3cgJiYgZXZlbnQuc2hpZnRLZXkgJiYgcHJldmlvdXNBY3RpdmVJbmRleCAhPT0gdGhpcy5fbGlzdEtleU1hbmFnZXIuYWN0aXZlSXRlbUluZGV4KSB7XG4gICAgICB0aGlzLl90b2dnbGVBY3RpdmVPcHRpb24oKTtcbiAgICB9XG4gIH1cblxuICAvKiogRW1pdHMgYSBzZWxlY3Rpb24gY2hhbmdlIGV2ZW50LCBjYWxsZWQgd2hlbiBhbiBvcHRpb24gaGFzIGl0cyBzZWxlY3RlZCBzdGF0ZSBjaGFuZ2VkLiAqL1xuICBfZW1pdENoYW5nZUV2ZW50KG9wdGlvbjogQ2RrT3B0aW9uPFQ+KSB7XG4gICAgdGhpcy5zZWxlY3Rpb25DaGFuZ2UuZW1pdCh7XG4gICAgICBzb3VyY2U6IHRoaXMsXG4gICAgICBvcHRpb246IG9wdGlvblxuICAgIH0pO1xuICB9XG5cbiAgLyoqIFVwZGF0ZXMgdGhlIHNlbGVjdGlvbiBtb2RlbCBhZnRlciBhIHRvZ2dsZS4gKi9cbiAgX3VwZGF0ZVNlbGVjdGlvbk1vZGVsKG9wdGlvbjogQ2RrT3B0aW9uPFQ+KSB7XG4gICAgaWYgKCF0aGlzLm11bHRpcGxlICYmIHRoaXMuX3NlbGVjdGlvbk1vZGVsLnNlbGVjdGVkLmxlbmd0aCAhPT0gMCkge1xuICAgICAgY29uc3QgcHJldmlvdXNseVNlbGVjdGVkID0gdGhpcy5fc2VsZWN0aW9uTW9kZWwuc2VsZWN0ZWRbMF07XG4gICAgICB0aGlzLmRlc2VsZWN0KHByZXZpb3VzbHlTZWxlY3RlZCk7XG4gICAgfVxuXG4gICAgb3B0aW9uLnNlbGVjdGVkID8gdGhpcy5fc2VsZWN0aW9uTW9kZWwuc2VsZWN0KG9wdGlvbikgOlxuICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3NlbGVjdGlvbk1vZGVsLmRlc2VsZWN0KG9wdGlvbik7XG4gIH1cblxuICBfdXBkYXRlUGFuZWxGb3JTZWxlY3Rpb24ob3B0aW9uOiBDZGtPcHRpb248VD4pIHtcbiAgICBjb25zdCBwYW5lbCA9IHRoaXMuX3BhcmVudFBhbmVsIHx8IHRoaXMuX2V4cGxpY2l0UGFuZWw7XG4gICAgaWYgKCF0aGlzLm11bHRpcGxlKSB7XG4gICAgICBvcHRpb24uc2VsZWN0ZWQgPyBwYW5lbD8uY2xvc2VQYW5lbChvcHRpb24udmFsdWUpIDogcGFuZWw/LmNsb3NlUGFuZWwoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcGFuZWw/LmNsb3NlUGFuZWwodGhpcy5nZXRTZWxlY3RlZFZhbHVlcygpKTtcbiAgICB9XG4gIH1cblxuICAvKiogVG9nZ2xlcyB0aGUgc2VsZWN0ZWQgc3RhdGUgb2YgdGhlIGFjdGl2ZSBvcHRpb24gaWYgbm90IGRpc2FibGVkLiAqL1xuICBwcml2YXRlIF90b2dnbGVBY3RpdmVPcHRpb24oKSB7XG4gICAgY29uc3QgYWN0aXZlT3B0aW9uID0gdGhpcy5fbGlzdEtleU1hbmFnZXIuYWN0aXZlSXRlbTtcbiAgICBpZiAoYWN0aXZlT3B0aW9uICYmICFhY3RpdmVPcHRpb24uZGlzYWJsZWQpIHtcbiAgICAgIGFjdGl2ZU9wdGlvbi50b2dnbGUoKTtcbiAgICB9XG4gIH1cblxuICAvKiogUmV0dXJucyB0aGUgaWQgb2YgdGhlIGFjdGl2ZSBvcHRpb24gaWYgYWN0aXZlIGRlc2NlbmRhbnQgaXMgYmVpbmcgdXNlZC4gKi9cbiAgX2dldEFyaWFBY3RpdmVEZXNjZW5kYW50KCk6IHN0cmluZyB8IG51bGwgfCB1bmRlZmluZWQge1xuICAgIHJldHVybiB0aGlzLl91c2VBY3RpdmVEZXNjZW5kYW50ID8gdGhpcy5fbGlzdEtleU1hbmFnZXI/LmFjdGl2ZUl0ZW0/LmlkIDogbnVsbDtcbiAgfVxuXG4gIC8qKiBVcGRhdGVzIHRoZSBhY3RpdmVPcHRpb24gYW5kIHRoZSBhY3RpdmUgYW5kIGZvY3VzIHByb3BlcnRpZXMgb2YgdGhlIG9wdGlvbi4gKi9cbiAgcHJpdmF0ZSBfdXBkYXRlQWN0aXZlT3B0aW9uKCkge1xuICAgIGlmICghdGhpcy5fbGlzdEtleU1hbmFnZXIuYWN0aXZlSXRlbSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX2FjdGl2ZU9wdGlvbj8uZGVhY3RpdmF0ZSgpO1xuICAgIHRoaXMuX2FjdGl2ZU9wdGlvbiA9IHRoaXMuX2xpc3RLZXlNYW5hZ2VyLmFjdGl2ZUl0ZW07XG4gICAgdGhpcy5fYWN0aXZlT3B0aW9uLmFjdGl2YXRlKCk7XG5cbiAgICBpZiAoIXRoaXMudXNlQWN0aXZlRGVzY2VuZGFudCkge1xuICAgICAgdGhpcy5fYWN0aXZlT3B0aW9uLmZvY3VzKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFVwZGF0ZXMgc2VsZWN0aW9uIHN0YXRlcyBvZiBvcHRpb25zIHdoZW4gdGhlICdtdWx0aXBsZScgcHJvcGVydHkgY2hhbmdlcy4gKi9cbiAgcHJpdmF0ZSBfdXBkYXRlU2VsZWN0aW9uT25NdWx0aVNlbGVjdGlvbkNoYW5nZSh2YWx1ZTogYm9vbGVhbikge1xuICAgIGlmICh0aGlzLm11bHRpcGxlICYmICF2YWx1ZSkge1xuICAgICAgLy8gRGVzZWxlY3QgYWxsIG9wdGlvbnMgaW5zdGVhZCBvZiBhcmJpdHJhcmlseSBrZWVwaW5nIG9uZSBvZiB0aGUgc2VsZWN0ZWQgb3B0aW9ucy5cbiAgICAgIHRoaXMuc2V0QWxsU2VsZWN0ZWQoZmFsc2UpO1xuICAgIH0gZWxzZSBpZiAoIXRoaXMubXVsdGlwbGUgJiYgdmFsdWUpIHtcbiAgICAgIHRoaXMuX3NlbGVjdGlvbk1vZGVsID1cbiAgICAgICAgICBuZXcgU2VsZWN0aW9uTW9kZWw8Q2RrT3B0aW9uPFQ+Pih2YWx1ZSwgdGhpcy5fc2VsZWN0aW9uTW9kZWw/LnNlbGVjdGVkKTtcbiAgICB9XG4gIH1cblxuICBfZm9jdXNBY3RpdmVPcHRpb24oKSB7XG4gICAgaWYgKCF0aGlzLmF1dG9Gb2N1cykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9saXN0S2V5TWFuYWdlci5hY3RpdmVJdGVtKSB7XG4gICAgICB0aGlzLnNldEFjdGl2ZU9wdGlvbih0aGlzLl9saXN0S2V5TWFuYWdlci5hY3RpdmVJdGVtKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuX29wdGlvbnMuZmlyc3QpIHtcbiAgICAgIHRoaXMuc2V0QWN0aXZlT3B0aW9uKHRoaXMuX29wdGlvbnMuZmlyc3QpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBTZWxlY3RzIHRoZSBnaXZlbiBvcHRpb24gaWYgdGhlIG9wdGlvbiBhbmQgbGlzdGJveCBhcmVuJ3QgZGlzYWJsZWQuICovXG4gIHNlbGVjdChvcHRpb246IENka09wdGlvbjxUPikge1xuICAgIGlmICghdGhpcy5kaXNhYmxlZCAmJiAhb3B0aW9uLmRpc2FibGVkKSB7XG4gICAgICBvcHRpb24uc2VsZWN0KCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIERlc2VsZWN0cyB0aGUgZ2l2ZW4gb3B0aW9uIGlmIHRoZSBvcHRpb24gYW5kIGxpc3Rib3ggYXJlbid0IGRpc2FibGVkLiAqL1xuICBkZXNlbGVjdChvcHRpb246IENka09wdGlvbjxUPikge1xuICAgIGlmICghdGhpcy5kaXNhYmxlZCAmJiAhb3B0aW9uLmRpc2FibGVkKSB7XG4gICAgICBvcHRpb24uZGVzZWxlY3QoKTtcbiAgICB9XG4gIH1cblxuICAvKiogU2V0cyB0aGUgc2VsZWN0ZWQgc3RhdGUgb2YgYWxsIG9wdGlvbnMgdG8gYmUgdGhlIGdpdmVuIHZhbHVlLiAqL1xuICBzZXRBbGxTZWxlY3RlZChpc1NlbGVjdGVkOiBib29sZWFuKSB7XG4gICAgZm9yIChjb25zdCBvcHRpb24gb2YgdGhpcy5fb3B0aW9ucy50b0FycmF5KCkpIHtcbiAgICAgIGlzU2VsZWN0ZWQgPyB0aGlzLnNlbGVjdChvcHRpb24pIDogdGhpcy5kZXNlbGVjdChvcHRpb24pO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBVcGRhdGVzIHRoZSBrZXkgbWFuYWdlcidzIGFjdGl2ZSBpdGVtIHRvIHRoZSBnaXZlbiBvcHRpb24uICovXG4gIHNldEFjdGl2ZU9wdGlvbihvcHRpb246IENka09wdGlvbjxUPikge1xuICAgIHRoaXMuX2xpc3RLZXlNYW5hZ2VyLnVwZGF0ZUFjdGl2ZUl0ZW0ob3B0aW9uKTtcbiAgICB0aGlzLl91cGRhdGVBY3RpdmVPcHRpb24oKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTYXZlcyBhIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGJlIGludm9rZWQgd2hlbiB0aGUgc2VsZWN0J3MgdmFsdWVcbiAgICogY2hhbmdlcyBmcm9tIHVzZXIgaW5wdXQuIFJlcXVpcmVkIHRvIGltcGxlbWVudCBDb250cm9sVmFsdWVBY2Nlc3Nvci5cbiAgICovXG4gIHJlZ2lzdGVyT25DaGFuZ2UoZm46ICh2YWx1ZTogVCkgPT4gdm9pZCk6IHZvaWQge1xuICAgIHRoaXMuX29uQ2hhbmdlID0gZm47XG4gIH1cblxuICAvKipcbiAgICogU2F2ZXMgYSBjYWxsYmFjayBmdW5jdGlvbiB0byBiZSBpbnZva2VkIHdoZW4gdGhlIHNlbGVjdCBpcyBibHVycmVkXG4gICAqIGJ5IHRoZSB1c2VyLiBSZXF1aXJlZCB0byBpbXBsZW1lbnQgQ29udHJvbFZhbHVlQWNjZXNzb3IuXG4gICAqL1xuICByZWdpc3Rlck9uVG91Y2hlZChmbjogKCkgPT4ge30pOiB2b2lkIHtcbiAgICB0aGlzLl9vblRvdWNoZWQgPSBmbjtcbiAgfVxuXG4gIC8qKiBTZXRzIHRoZSBzZWxlY3QncyB2YWx1ZS4gUmVxdWlyZWQgdG8gaW1wbGVtZW50IENvbnRyb2xWYWx1ZUFjY2Vzc29yLiAqL1xuICB3cml0ZVZhbHVlKHZhbHVlczogVCB8IFRbXSk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9vcHRpb25zKSB7XG4gICAgICB0aGlzLl9zZXRTZWxlY3Rpb25CeVZhbHVlKHZhbHVlcyk7XG4gICAgfVxuICB9XG5cbiAgLyoqIERpc2FibGVzIHRoZSBzZWxlY3QuIFJlcXVpcmVkIHRvIGltcGxlbWVudCBDb250cm9sVmFsdWVBY2Nlc3Nvci4gKi9cbiAgc2V0RGlzYWJsZWRTdGF0ZShpc0Rpc2FibGVkOiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5kaXNhYmxlZCA9IGlzRGlzYWJsZWQ7XG4gIH1cblxuICAvKiogUmV0dXJucyB0aGUgdmFsdWVzIG9mIHRoZSBjdXJyZW50bHkgc2VsZWN0ZWQgb3B0aW9ucy4gKi9cbiAgZ2V0U2VsZWN0ZWRWYWx1ZXMoKTogVFtdIHtcbiAgICByZXR1cm4gdGhpcy5fb3B0aW9ucy5maWx0ZXIob3B0aW9uID0+IG9wdGlvbi5zZWxlY3RlZCkubWFwKG9wdGlvbiA9PiBvcHRpb24udmFsdWUpO1xuICB9XG5cbiAgLyoqIFNlbGVjdHMgYW4gb3B0aW9uIHRoYXQgaGFzIHRoZSBjb3JyZXNwb25kaW5nIGdpdmVuIHZhbHVlLiAqL1xuICBwcml2YXRlIF9zZXRTZWxlY3Rpb25CeVZhbHVlKHZhbHVlczogVCB8IFRbXSkge1xuICAgIGZvciAoY29uc3Qgb3B0aW9uIG9mIHRoaXMuX29wdGlvbnMudG9BcnJheSgpKSB7XG4gICAgICB0aGlzLmRlc2VsZWN0KG9wdGlvbik7XG4gICAgfVxuXG4gICAgY29uc3QgdmFsdWVzQXJyYXkgPSBjb2VyY2VBcnJheSh2YWx1ZXMpO1xuICAgIGZvciAoY29uc3QgdmFsdWUgb2YgdmFsdWVzQXJyYXkpIHtcbiAgICAgIGNvbnN0IGNvcnJlc3BvbmRpbmdPcHRpb24gPSB0aGlzLl9vcHRpb25zLmZpbmQoKG9wdGlvbjogQ2RrT3B0aW9uPFQ+KSA9PiB7XG4gICAgICAgIHJldHVybiBvcHRpb24udmFsdWUgIT0gbnVsbCAmJiB0aGlzLmNvbXBhcmVXaXRoKG9wdGlvbi52YWx1ZSwgdmFsdWUpO1xuICAgICAgfSk7XG5cbiAgICAgIGlmIChjb3JyZXNwb25kaW5nT3B0aW9uKSB7XG4gICAgICAgIHRoaXMuc2VsZWN0KGNvcnJlc3BvbmRpbmdPcHRpb24pO1xuICAgICAgICBpZiAoIXRoaXMubXVsdGlwbGUpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZGlzYWJsZWQ6IEJvb2xlYW5JbnB1dDtcbiAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX211bHRpcGxlOiBCb29sZWFuSW5wdXQ7XG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV91c2VBY3RpdmVEZXNjZW5kYW50OiBCb29sZWFuSW5wdXQ7XG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9hdXRvRm9jdXM6IEJvb2xlYW5JbnB1dDtcbn1cblxuLyoqIENoYW5nZSBldmVudCB0aGF0IGlzIGJlaW5nIGZpcmVkIHdoZW5ldmVyIHRoZSBzZWxlY3RlZCBzdGF0ZSBvZiBhbiBvcHRpb24gY2hhbmdlcy4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTGlzdGJveFNlbGVjdGlvbkNoYW5nZUV2ZW50PFQ+IHtcbiAgLyoqIFJlZmVyZW5jZSB0byB0aGUgbGlzdGJveCB0aGF0IGVtaXR0ZWQgdGhlIGV2ZW50LiAqL1xuICByZWFkb25seSBzb3VyY2U6IENka0xpc3Rib3g8VD47XG5cbiAgLyoqIFJlZmVyZW5jZSB0byB0aGUgb3B0aW9uIHRoYXQgaGFzIGJlZW4gY2hhbmdlZC4gKi9cbiAgcmVhZG9ubHkgb3B0aW9uOiBDZGtPcHRpb248VD47XG59XG5cbi8qKiBFdmVudCBvYmplY3QgZW1pdHRlZCBieSBNYXRPcHRpb24gd2hlbiBzZWxlY3RlZCBvciBkZXNlbGVjdGVkLiAqL1xuZXhwb3J0IGludGVyZmFjZSBPcHRpb25TZWxlY3Rpb25DaGFuZ2VFdmVudDxUPiB7XG4gIC8qKiBSZWZlcmVuY2UgdG8gdGhlIG9wdGlvbiB0aGF0IGVtaXR0ZWQgdGhlIGV2ZW50LiAqL1xuICBzb3VyY2U6IENka09wdGlvbjxUPjtcblxuICAvKiogV2hldGhlciB0aGUgY2hhbmdlIGluIHRoZSBvcHRpb24ncyB2YWx1ZSB3YXMgYSByZXN1bHQgb2YgYSB1c2VyIGFjdGlvbi4gKi9cbiAgaXNVc2VySW5wdXQ6IGJvb2xlYW47XG59XG4iXX0=