/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ContentChildren, Directive, ElementRef, EventEmitter, forwardRef, Inject, Input, Optional, Output, QueryList, } from '@angular/core';
import { ActiveDescendantKeyManager } from '@angular/cdk/a11y';
import { DOWN_ARROW, ENTER, LEFT_ARROW, RIGHT_ARROW, SPACE, UP_ARROW } from '@angular/cdk/keycodes';
import { coerceArray, coerceBooleanProperty } from '@angular/cdk/coercion';
import { SelectionModel } from '@angular/cdk/collections';
import { defer, merge, Subject } from 'rxjs';
import { startWith, switchMap, takeUntil } from 'rxjs/operators';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Directionality } from '@angular/cdk/bidi';
import { CDK_COMBOBOX, CdkCombobox } from '@angular/cdk-experimental/combobox';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/bidi";
import * as i2 from "@angular/cdk-experimental/combobox";
let nextId = 0;
let listboxId = 0;
export const CDK_LISTBOX_VALUE_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => CdkListbox),
    multi: true,
};
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
        return this.listbox.disabled || this._disabled;
    }
    /** Emits a change event extending the Option Selection Change Event interface. */
    _emitSelectionChange(isUserInput = false) {
        this.selectionChange.emit({
            source: this,
            isUserInput: isUserInput,
        });
    }
    /** Returns the tab index which depends on the disabled property. */
    _getTabIndex() {
        return this._isInteractionDisabled() ? null : '-1';
    }
    /** Get the label for this element which is required by the FocusableOption interface. */
    getLabel() {
        return (this.typeahead ?? this._elementRef.nativeElement.textContent?.trim()) || '';
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
CdkOption.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.0.0-rc.0", ngImport: i0, type: CdkOption, deps: [{ token: i0.ElementRef }, { token: forwardRef(() => CdkListbox) }], target: i0.ɵɵFactoryTarget.Directive });
CdkOption.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.0.0-rc.0", type: CdkOption, selector: "[cdkOption]", inputs: { id: "id", selected: "selected", disabled: "disabled", value: "value", typeahead: "typeahead" }, outputs: { selectionChange: "selectionChange" }, host: { attributes: { "role": "option" }, listeners: { "click": "toggle()", "focus": "activate()", "blur": "deactivate()" }, properties: { "id": "id", "attr.aria-selected": "selected || null", "attr.tabindex": "_getTabIndex()", "attr.aria-disabled": "_isInteractionDisabled()", "class.cdk-option-disabled": "_isInteractionDisabled()", "class.cdk-option-active": "_active", "class.cdk-option-selected": "selected" }, classAttribute: "cdk-option" }, exportAs: ["cdkOption"], ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.0.0-rc.0", ngImport: i0, type: CdkOption, decorators: [{
            type: Directive,
            args: [{
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
                        '[class.cdk-option-selected]': 'selected',
                    },
                }]
        }], ctorParameters: function () { return [{ type: i0.ElementRef }, { type: CdkListbox, decorators: [{
                    type: Inject,
                    args: [forwardRef(() => CdkListbox)]
                }] }]; }, propDecorators: { id: [{
                type: Input
            }], selected: [{
                type: Input
            }], disabled: [{
                type: Input
            }], value: [{
                type: Input
            }], typeahead: [{
                type: Input
            }], selectionChange: [{
                type: Output
            }] } });
export class CdkListbox {
    constructor(_combobox, _dir) {
        this._combobox = _combobox;
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
        const coercedValue = coerceBooleanProperty(value);
        this._updateSelectionOnMultiSelectionChange(coercedValue);
        this._multiple = coercedValue;
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
        this._combobox?._registerContent(this.id, 'listbox');
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
    _initKeyManager() {
        this._listKeyManager = new ActiveDescendantKeyManager(this._options)
            .withWrap()
            .withTypeAhead()
            .withHomeAndEnd()
            .withAllowedModifierKeys(['shiftKey']);
        if (this.orientation === 'vertical') {
            this._listKeyManager.withVerticalOrientation();
        }
        else {
            this._listKeyManager.withHorizontalOrientation(this._dir?.value || 'ltr');
        }
        this._listKeyManager.change.pipe(takeUntil(this._destroyed)).subscribe(() => {
            this._updateActiveOption();
        });
    }
    _initSelectionModel() {
        this._selectionModel.changed
            .pipe(takeUntil(this._destroyed))
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
        const isArrow = keyCode === UP_ARROW ||
            keyCode === DOWN_ARROW ||
            keyCode === LEFT_ARROW ||
            keyCode === RIGHT_ARROW;
        if (isArrow && event.shiftKey && previousActiveIndex !== this._listKeyManager.activeItemIndex) {
            this._toggleActiveOption();
        }
    }
    /** Emits a selection change event, called when an option has its selected state changed. */
    _emitChangeEvent(option) {
        this.selectionChange.emit({
            source: this,
            option: option,
        });
    }
    /** Updates the selection model after a toggle. */
    _updateSelectionModel(option) {
        if (!this.multiple && this._selectionModel.selected.length !== 0) {
            const previouslySelected = this._selectionModel.selected[0];
            this.deselect(previouslySelected);
        }
        option.selected ? this._selectionModel.select(option) : this._selectionModel.deselect(option);
    }
    _updatePanelForSelection(option) {
        if (this._combobox) {
            if (!this.multiple) {
                this._combobox.updateAndClose(option.selected ? option.value : []);
            }
            else {
                this._combobox.updateAndClose(this.getSelectedValues());
            }
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
        return this._useActiveDescendant ? this._listKeyManager?.activeItem?.id : null;
    }
    /** Updates the activeOption and the active and focus properties of the option. */
    _updateActiveOption() {
        if (!this._listKeyManager.activeItem) {
            return;
        }
        this._activeOption?.deactivate();
        this._activeOption = this._listKeyManager.activeItem;
        this._activeOption.activate();
        if (!this.useActiveDescendant) {
            this._activeOption.focus();
        }
    }
    /** Updates selection states of options when the 'multiple' property changes. */
    _updateSelectionOnMultiSelectionChange(value) {
        if (this.multiple && !value) {
            // Deselect all options instead of arbitrarily keeping one of the selected options.
            this.setAllSelected(false);
        }
        else if (!this.multiple && value) {
            this._selectionModel = new SelectionModel(value, this._selectionModel?.selected);
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
CdkListbox.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.0.0-rc.0", ngImport: i0, type: CdkListbox, deps: [{ token: CDK_COMBOBOX, optional: true }, { token: i1.Directionality, optional: true }], target: i0.ɵɵFactoryTarget.Directive });
CdkListbox.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.0.0-rc.0", type: CdkListbox, selector: "[cdkListbox]", inputs: { id: "id", multiple: "multiple", disabled: "disabled", useActiveDescendant: "useActiveDescendant", autoFocus: "autoFocus", orientation: ["listboxOrientation", "orientation"], compareWith: "compareWith" }, outputs: { selectionChange: "selectionChange" }, host: { attributes: { "role": "listbox" }, listeners: { "focus": "_focusActiveOption()", "keydown": "_keydown($event)" }, properties: { "id": "id", "attr.tabindex": "_tabIndex", "attr.aria-disabled": "disabled", "attr.aria-multiselectable": "multiple", "attr.aria-activedescendant": "_getAriaActiveDescendant()", "attr.aria-orientation": "orientation" }, classAttribute: "cdk-listbox" }, providers: [CDK_LISTBOX_VALUE_ACCESSOR], queries: [{ propertyName: "_options", predicate: CdkOption, descendants: true }], exportAs: ["cdkListbox"], ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.0.0-rc.0", ngImport: i0, type: CdkListbox, decorators: [{
            type: Directive,
            args: [{
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
                        '[attr.aria-orientation]': 'orientation',
                    },
                    providers: [CDK_LISTBOX_VALUE_ACCESSOR],
                }]
        }], ctorParameters: function () { return [{ type: i2.CdkCombobox, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [CDK_COMBOBOX]
                }] }, { type: i1.Directionality, decorators: [{
                    type: Optional
                }] }]; }, propDecorators: { _options: [{
                type: ContentChildren,
                args: [CdkOption, { descendants: true }]
            }], selectionChange: [{
                type: Output
            }], id: [{
                type: Input
            }], multiple: [{
                type: Input
            }], disabled: [{
                type: Input
            }], useActiveDescendant: [{
                type: Input
            }], autoFocus: [{
                type: Input
            }], orientation: [{
                type: Input,
                args: ['listboxOrientation']
            }], compareWith: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdGJveC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL2xpc3Rib3gvbGlzdGJveC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBRUwsZUFBZSxFQUNmLFNBQVMsRUFDVCxVQUFVLEVBQ1YsWUFBWSxFQUNaLFVBQVUsRUFDVixNQUFNLEVBQ04sS0FBSyxFQUdMLFFBQVEsRUFDUixNQUFNLEVBQ04sU0FBUyxHQUNWLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBQywwQkFBMEIsRUFBc0MsTUFBTSxtQkFBbUIsQ0FBQztBQUNsRyxPQUFPLEVBQUMsVUFBVSxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUNsRyxPQUFPLEVBQWUsV0FBVyxFQUFFLHFCQUFxQixFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDdkYsT0FBTyxFQUFrQixjQUFjLEVBQUMsTUFBTSwwQkFBMEIsQ0FBQztBQUN6RSxPQUFPLEVBQUMsS0FBSyxFQUFFLEtBQUssRUFBYyxPQUFPLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDdkQsT0FBTyxFQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDL0QsT0FBTyxFQUF1QixpQkFBaUIsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQ3ZFLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUNqRCxPQUFPLEVBQUMsWUFBWSxFQUFFLFdBQVcsRUFBQyxNQUFNLG9DQUFvQyxDQUFDOzs7O0FBRTdFLElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQztBQUNmLElBQUksU0FBUyxHQUFHLENBQUMsQ0FBQztBQUVsQixNQUFNLENBQUMsTUFBTSwwQkFBMEIsR0FBRztJQUN4QyxPQUFP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LEVBQUUsSUFBSTt3QkFDWixTQUFTLEVBQUUsc0JBQXNCO3dCQUNqQyxXQUFXLEVBQUUsa0JBQWtCO3dCQUMvQixpQkFBaUIsRUFBRSxXQUFXO3dCQUM5QixzQkFBc0IsRUFBRSxVQUFVO3dCQUNsQyw2QkFBNkIsRUFBRSxVQUFVO3dCQUN6Qyw4QkFBOEIsRUFBRSw0QkFBNEI7d0JBQzVELHlCQUF5QixFQUFFLGFBQWE7cUJBQ3pDO29CQUNELFNBQVMsRUFBRSxDQUFDLDBCQUEwQixDQUFDO2lCQUN4Qzs7MEJBZ0ZJLFFBQVE7OzBCQUFJLE1BQU07MkJBQUMsWUFBWTs7MEJBQy9CLFFBQVE7NENBckRzQyxRQUFRO3NCQUF4RCxlQUFlO3VCQUFDLFNBQVMsRUFBRSxFQUFDLFdBQVcsRUFBRSxJQUFJLEVBQUM7Z0JBRTVCLGVBQWU7c0JBQWpDLE1BQU07Z0JBRUUsRUFBRTtzQkFBVixLQUFLO2dCQU9GLFFBQVE7c0JBRFgsS0FBSztnQkFXRixRQUFRO3NCQURYLEtBQUs7Z0JBVUYsbUJBQW1CO3NCQUR0QixLQUFLO2dCQVVGLFNBQVM7c0JBRFosS0FBSztnQkFTdUIsV0FBVztzQkFBdkMsS0FBSzt1QkFBQyxvQkFBb0I7Z0JBRWxCLFdBQVc7c0JBQW5CLEtBQUsiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtcbiAgQWZ0ZXJDb250ZW50SW5pdCxcbiAgQ29udGVudENoaWxkcmVuLFxuICBEaXJlY3RpdmUsXG4gIEVsZW1lbnRSZWYsXG4gIEV2ZW50RW1pdHRlcixcbiAgZm9yd2FyZFJlZixcbiAgSW5qZWN0LFxuICBJbnB1dCxcbiAgT25EZXN0cm95LFxuICBPbkluaXQsXG4gIE9wdGlvbmFsLFxuICBPdXRwdXQsXG4gIFF1ZXJ5TGlzdCxcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0FjdGl2ZURlc2NlbmRhbnRLZXlNYW5hZ2VyLCBIaWdobGlnaHRhYmxlLCBMaXN0S2V5TWFuYWdlck9wdGlvbn0gZnJvbSAnQGFuZ3VsYXIvY2RrL2ExMXknO1xuaW1wb3J0IHtET1dOX0FSUk9XLCBFTlRFUiwgTEVGVF9BUlJPVywgUklHSFRfQVJST1csIFNQQUNFLCBVUF9BUlJPV30gZnJvbSAnQGFuZ3VsYXIvY2RrL2tleWNvZGVzJztcbmltcG9ydCB7Qm9vbGVhbklucHV0LCBjb2VyY2VBcnJheSwgY29lcmNlQm9vbGVhblByb3BlcnR5fSBmcm9tICdAYW5ndWxhci9jZGsvY29lcmNpb24nO1xuaW1wb3J0IHtTZWxlY3Rpb25DaGFuZ2UsIFNlbGVjdGlvbk1vZGVsfSBmcm9tICdAYW5ndWxhci9jZGsvY29sbGVjdGlvbnMnO1xuaW1wb3J0IHtkZWZlciwgbWVyZ2UsIE9ic2VydmFibGUsIFN1YmplY3R9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHtzdGFydFdpdGgsIHN3aXRjaE1hcCwgdGFrZVVudGlsfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5pbXBvcnQge0NvbnRyb2xWYWx1ZUFjY2Vzc29yLCBOR19WQUxVRV9BQ0NFU1NPUn0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xuaW1wb3J0IHtEaXJlY3Rpb25hbGl0eX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2JpZGknO1xuaW1wb3J0IHtDREtfQ09NQk9CT1gsIENka0NvbWJvYm94fSBmcm9tICdAYW5ndWxhci9jZGstZXhwZXJpbWVudGFsL2NvbWJvYm94JztcblxubGV0IG5leHRJZCA9IDA7XG5sZXQgbGlzdGJveElkID0gMDtcblxuZXhwb3J0IGNvbnN0IENES19MSVNUQk9YX1ZBTFVFX0FDQ0VTU09SID0ge1xuICBwcm92aWRlOiBOR19WQUxVRV9BQ0NFU1NPUixcbiAgdXNlRXhpc3Rpbmc6IGZvcndhcmRSZWYoKCkgPT4gQ2RrTGlzdGJveCksXG4gIG11bHRpOiB0cnVlLFxufTtcblxuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW2Nka09wdGlvbl0nLFxuICBleHBvcnRBczogJ2Nka09wdGlvbicsXG4gIGhvc3Q6IHtcbiAgICAncm9sZSc6ICdvcHRpb24nLFxuICAgICdjbGFzcyc6ICdjZGstb3B0aW9uJyxcbiAgICAnKGNsaWNrKSc6ICd0b2dnbGUoKScsXG4gICAgJyhmb2N1cyknOiAnYWN0aXZhdGUoKScsXG4gICAgJyhibHVyKSc6ICdkZWFjdGl2YXRlKCknLFxuICAgICdbaWRdJzogJ2lkJyxcbiAgICAnW2F0dHIuYXJpYS1zZWxlY3RlZF0nOiAnc2VsZWN0ZWQgfHwgbnVsbCcsXG4gICAgJ1thdHRyLnRhYmluZGV4XSc6ICdfZ2V0VGFiSW5kZXgoKScsXG4gICAgJ1thdHRyLmFyaWEtZGlzYWJsZWRdJzogJ19pc0ludGVyYWN0aW9uRGlzYWJsZWQoKScsXG4gICAgJ1tjbGFzcy5jZGstb3B0aW9uLWRpc2FibGVkXSc6ICdfaXNJbnRlcmFjdGlvbkRpc2FibGVkKCknLFxuICAgICdbY2xhc3MuY2RrLW9wdGlvbi1hY3RpdmVdJzogJ19hY3RpdmUnLFxuICAgICdbY2xhc3MuY2RrLW9wdGlvbi1zZWxlY3RlZF0nOiAnc2VsZWN0ZWQnLFxuICB9LFxufSlcbmV4cG9ydCBjbGFzcyBDZGtPcHRpb248VCA9IHVua25vd24+IGltcGxlbWVudHMgTGlzdEtleU1hbmFnZXJPcHRpb24sIEhpZ2hsaWdodGFibGUge1xuICBwcml2YXRlIF9zZWxlY3RlZDogYm9vbGVhbiA9IGZhbHNlO1xuICBwcml2YXRlIF9kaXNhYmxlZDogYm9vbGVhbiA9IGZhbHNlO1xuICBwcml2YXRlIF92YWx1ZTogVDtcbiAgX2FjdGl2ZTogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIC8qKiBUaGUgaWQgb2YgdGhlIG9wdGlvbiwgc2V0IHRvIGEgdW5pcXVlaWQgaWYgdGhlIHVzZXIgZG9lcyBub3QgcHJvdmlkZSBvbmUuICovXG4gIEBJbnB1dCgpIGlkID0gYGNkay1vcHRpb24tJHtuZXh0SWQrK31gO1xuXG4gIEBJbnB1dCgpXG4gIGdldCBzZWxlY3RlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fc2VsZWN0ZWQ7XG4gIH1cbiAgc2V0IHNlbGVjdGVkKHZhbHVlOiBCb29sZWFuSW5wdXQpIHtcbiAgICBpZiAoIXRoaXMuX2Rpc2FibGVkKSB7XG4gICAgICB0aGlzLl9zZWxlY3RlZCA9IGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eSh2YWx1ZSk7XG4gICAgfVxuICB9XG5cbiAgQElucHV0KClcbiAgZ2V0IGRpc2FibGVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9kaXNhYmxlZDtcbiAgfVxuICBzZXQgZGlzYWJsZWQodmFsdWU6IEJvb2xlYW5JbnB1dCkge1xuICAgIHRoaXMuX2Rpc2FibGVkID0gY29lcmNlQm9vbGVhblByb3BlcnR5KHZhbHVlKTtcbiAgfVxuXG4gIC8qKiBUaGUgZm9ybSB2YWx1ZSBvZiB0aGUgb3B0aW9uLiAqL1xuICBASW5wdXQoKVxuICBnZXQgdmFsdWUoKTogVCB7XG4gICAgcmV0dXJuIHRoaXMuX3ZhbHVlO1xuICB9XG4gIHNldCB2YWx1ZSh2YWx1ZTogVCkge1xuICAgIGlmICh0aGlzLnNlbGVjdGVkICYmIHZhbHVlICE9PSB0aGlzLl92YWx1ZSkge1xuICAgICAgdGhpcy5kZXNlbGVjdCgpO1xuICAgIH1cbiAgICB0aGlzLl92YWx1ZSA9IHZhbHVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSB0ZXh0IHVzZWQgdG8gbG9jYXRlIHRoaXMgaXRlbSBkdXJpbmcgbWVudSB0eXBlYWhlYWQuIElmIG5vdCBzcGVjaWZpZWQsXG4gICAqIHRoZSBgdGV4dENvbnRlbnRgIG9mIHRoZSBpdGVtIHdpbGwgYmUgdXNlZC5cbiAgICovXG4gIEBJbnB1dCgpIHR5cGVhaGVhZDogc3RyaW5nO1xuXG4gIEBPdXRwdXQoKSByZWFkb25seSBzZWxlY3Rpb25DaGFuZ2UgPSBuZXcgRXZlbnRFbWl0dGVyPE9wdGlvblNlbGVjdGlvbkNoYW5nZUV2ZW50PFQ+PigpO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgcmVhZG9ubHkgX2VsZW1lbnRSZWY6IEVsZW1lbnRSZWYsXG4gICAgQEluamVjdChmb3J3YXJkUmVmKCgpID0+IENka0xpc3Rib3gpKSByZWFkb25seSBsaXN0Ym94OiBDZGtMaXN0Ym94PFQ+LFxuICApIHt9XG5cbiAgLyoqIFRvZ2dsZXMgdGhlIHNlbGVjdGVkIHN0YXRlLCBlbWl0cyBhIGNoYW5nZSBldmVudCB0aHJvdWdoIHRoZSBpbmplY3RlZCBsaXN0Ym94LiAqL1xuICB0b2dnbGUoKSB7XG4gICAgaWYgKCF0aGlzLl9pc0ludGVyYWN0aW9uRGlzYWJsZWQoKSkge1xuICAgICAgdGhpcy5zZWxlY3RlZCA9ICF0aGlzLnNlbGVjdGVkO1xuICAgICAgdGhpcy5fZW1pdFNlbGVjdGlvbkNoYW5nZSh0cnVlKTtcbiAgICB9XG4gIH1cblxuICAvKiogU2V0cyB0aGUgYWN0aXZlIHByb3BlcnR5IHRydWUgaWYgdGhlIG9wdGlvbiBhbmQgbGlzdGJveCBhcmVuJ3QgZGlzYWJsZWQuICovXG4gIGFjdGl2YXRlKCkge1xuICAgIGlmICghdGhpcy5faXNJbnRlcmFjdGlvbkRpc2FibGVkKCkpIHtcbiAgICAgIHRoaXMuX2FjdGl2ZSA9IHRydWU7XG4gICAgfVxuICB9XG5cbiAgLyoqIFNldHMgdGhlIGFjdGl2ZSBwcm9wZXJ0eSBmYWxzZS4gKi9cbiAgZGVhY3RpdmF0ZSgpIHtcbiAgICBpZiAoIXRoaXMuX2lzSW50ZXJhY3Rpb25EaXNhYmxlZCgpKSB7XG4gICAgICB0aGlzLl9hY3RpdmUgPSBmYWxzZTtcbiAgICB9XG4gIH1cblxuICAvKiogU2V0cyB0aGUgc2VsZWN0ZWQgcHJvcGVydHkgdHJ1ZSBpZiBpdCB3YXMgZmFsc2UuICovXG4gIHNlbGVjdCgpIHtcbiAgICBpZiAoIXRoaXMuc2VsZWN0ZWQpIHtcbiAgICAgIHRoaXMuc2VsZWN0ZWQgPSB0cnVlO1xuICAgICAgdGhpcy5fZW1pdFNlbGVjdGlvbkNoYW5nZSgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBTZXRzIHRoZSBzZWxlY3RlZCBwcm9wZXJ0eSBmYWxzZSBpZiBpdCB3YXMgdHJ1ZS4gKi9cbiAgZGVzZWxlY3QoKSB7XG4gICAgaWYgKHRoaXMuc2VsZWN0ZWQpIHtcbiAgICAgIHRoaXMuc2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAgIHRoaXMuX2VtaXRTZWxlY3Rpb25DaGFuZ2UoKTtcbiAgICB9XG4gIH1cblxuICAvKiogQXBwbGllcyBmb2N1cyB0byB0aGUgb3B0aW9uLiAqL1xuICBmb2N1cygpIHtcbiAgICB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQuZm9jdXMoKTtcbiAgfVxuXG4gIC8qKiBSZXR1cm5zIHRydWUgaWYgdGhlIG9wdGlvbiBvciBsaXN0Ym94IGFyZSBkaXNhYmxlZCwgYW5kIGZhbHNlIG90aGVyd2lzZS4gKi9cbiAgX2lzSW50ZXJhY3Rpb25EaXNhYmxlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5saXN0Ym94LmRpc2FibGVkIHx8IHRoaXMuX2Rpc2FibGVkO1xuICB9XG5cbiAgLyoqIEVtaXRzIGEgY2hhbmdlIGV2ZW50IGV4dGVuZGluZyB0aGUgT3B0aW9uIFNlbGVjdGlvbiBDaGFuZ2UgRXZlbnQgaW50ZXJmYWNlLiAqL1xuICBwcml2YXRlIF9lbWl0U2VsZWN0aW9uQ2hhbmdlKGlzVXNlcklucHV0ID0gZmFsc2UpIHtcbiAgICB0aGlzLnNlbGVjdGlvbkNoYW5nZS5lbWl0KHtcbiAgICAgIHNvdXJjZTogdGhpcyxcbiAgICAgIGlzVXNlcklucHV0OiBpc1VzZXJJbnB1dCxcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBSZXR1cm5zIHRoZSB0YWIgaW5kZXggd2hpY2ggZGVwZW5kcyBvbiB0aGUgZGlzYWJsZWQgcHJvcGVydHkuICovXG4gIF9nZXRUYWJJbmRleCgpOiBzdHJpbmcgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5faXNJbnRlcmFjdGlvbkRpc2FibGVkKCkgPyBudWxsIDogJy0xJztcbiAgfVxuXG4gIC8qKiBHZXQgdGhlIGxhYmVsIGZvciB0aGlzIGVsZW1lbnQgd2hpY2ggaXMgcmVxdWlyZWQgYnkgdGhlIEZvY3VzYWJsZU9wdGlvbiBpbnRlcmZhY2UuICovXG4gIGdldExhYmVsKCkge1xuICAgIHJldHVybiAodGhpcy50eXBlYWhlYWQgPz8gdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LnRleHRDb250ZW50Py50cmltKCkpIHx8ICcnO1xuICB9XG5cbiAgLyoqIFNldHMgdGhlIGFjdGl2ZSBwcm9wZXJ0eSB0byB0cnVlIHRvIGVuYWJsZSB0aGUgYWN0aXZlIGNzcyBjbGFzcy4gKi9cbiAgc2V0QWN0aXZlU3R5bGVzKCkge1xuICAgIHRoaXMuX2FjdGl2ZSA9IHRydWU7XG4gIH1cblxuICAvKiogU2V0cyB0aGUgYWN0aXZlIHByb3BlcnR5IHRvIGZhbHNlIHRvIGRpc2FibGUgdGhlIGFjdGl2ZSBjc3MgY2xhc3MuICovXG4gIHNldEluYWN0aXZlU3R5bGVzKCkge1xuICAgIHRoaXMuX2FjdGl2ZSA9IGZhbHNlO1xuICB9XG59XG5cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tjZGtMaXN0Ym94XScsXG4gIGV4cG9ydEFzOiAnY2RrTGlzdGJveCcsXG4gIGhvc3Q6IHtcbiAgICAncm9sZSc6ICdsaXN0Ym94JyxcbiAgICAnY2xhc3MnOiAnY2RrLWxpc3Rib3gnLFxuICAgICdbaWRdJzogJ2lkJyxcbiAgICAnKGZvY3VzKSc6ICdfZm9jdXNBY3RpdmVPcHRpb24oKScsXG4gICAgJyhrZXlkb3duKSc6ICdfa2V5ZG93bigkZXZlbnQpJyxcbiAgICAnW2F0dHIudGFiaW5kZXhdJzogJ190YWJJbmRleCcsXG4gICAgJ1thdHRyLmFyaWEtZGlzYWJsZWRdJzogJ2Rpc2FibGVkJyxcbiAgICAnW2F0dHIuYXJpYS1tdWx0aXNlbGVjdGFibGVdJzogJ211bHRpcGxlJyxcbiAgICAnW2F0dHIuYXJpYS1hY3RpdmVkZXNjZW5kYW50XSc6ICdfZ2V0QXJpYUFjdGl2ZURlc2NlbmRhbnQoKScsXG4gICAgJ1thdHRyLmFyaWEtb3JpZW50YXRpb25dJzogJ29yaWVudGF0aW9uJyxcbiAgfSxcbiAgcHJvdmlkZXJzOiBbQ0RLX0xJU1RCT1hfVkFMVUVfQUNDRVNTT1JdLFxufSlcbmV4cG9ydCBjbGFzcyBDZGtMaXN0Ym94PFQ+IGltcGxlbWVudHMgQWZ0ZXJDb250ZW50SW5pdCwgT25EZXN0cm95LCBPbkluaXQsIENvbnRyb2xWYWx1ZUFjY2Vzc29yIHtcbiAgX2xpc3RLZXlNYW5hZ2VyOiBBY3RpdmVEZXNjZW5kYW50S2V5TWFuYWdlcjxDZGtPcHRpb248VD4+O1xuICBfc2VsZWN0aW9uTW9kZWw6IFNlbGVjdGlvbk1vZGVsPENka09wdGlvbjxUPj47XG4gIF90YWJJbmRleCA9IDA7XG5cbiAgLyoqIGBWaWV3IC0+IG1vZGVsIGNhbGxiYWNrIGNhbGxlZCB3aGVuIHNlbGVjdCBoYXMgYmVlbiB0b3VjaGVkYCAqL1xuICBfb25Ub3VjaGVkOiAoKSA9PiB2b2lkID0gKCkgPT4ge307XG5cbiAgLyoqIGBWaWV3IC0+IG1vZGVsIGNhbGxiYWNrIGNhbGxlZCB3aGVuIHZhbHVlIGNoYW5nZXNgICovXG4gIF9vbkNoYW5nZTogKHZhbHVlOiBUKSA9PiB2b2lkID0gKCkgPT4ge307XG5cbiAgcmVhZG9ubHkgb3B0aW9uU2VsZWN0aW9uQ2hhbmdlczogT2JzZXJ2YWJsZTxPcHRpb25TZWxlY3Rpb25DaGFuZ2VFdmVudDxUPj4gPSBkZWZlcigoKSA9PiB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHRoaXMuX29wdGlvbnM7XG5cbiAgICByZXR1cm4gb3B0aW9ucy5jaGFuZ2VzLnBpcGUoXG4gICAgICBzdGFydFdpdGgob3B0aW9ucyksXG4gICAgICBzd2l0Y2hNYXAoKCkgPT4gbWVyZ2UoLi4ub3B0aW9ucy5tYXAob3B0aW9uID0+IG9wdGlvbi5zZWxlY3Rpb25DaGFuZ2UpKSksXG4gICAgKTtcbiAgfSkgYXMgT2JzZXJ2YWJsZTxPcHRpb25TZWxlY3Rpb25DaGFuZ2VFdmVudDxUPj47XG5cbiAgcHJpdmF0ZSBfZGlzYWJsZWQ6IGJvb2xlYW4gPSBmYWxzZTtcbiAgcHJpdmF0ZSBfbXVsdGlwbGU6IGJvb2xlYW4gPSBmYWxzZTtcbiAgcHJpdmF0ZSBfdXNlQWN0aXZlRGVzY2VuZGFudDogYm9vbGVhbiA9IGZhbHNlO1xuICBwcml2YXRlIF9hdXRvRm9jdXM6IGJvb2xlYW4gPSB0cnVlO1xuICBwcml2YXRlIF9hY3RpdmVPcHRpb246IENka09wdGlvbjxUPjtcbiAgcHJpdmF0ZSByZWFkb25seSBfZGVzdHJveWVkID0gbmV3IFN1YmplY3Q8dm9pZD4oKTtcblxuICBAQ29udGVudENoaWxkcmVuKENka09wdGlvbiwge2Rlc2NlbmRhbnRzOiB0cnVlfSkgX29wdGlvbnM6IFF1ZXJ5TGlzdDxDZGtPcHRpb248VD4+O1xuXG4gIEBPdXRwdXQoKSByZWFkb25seSBzZWxlY3Rpb25DaGFuZ2UgPSBuZXcgRXZlbnRFbWl0dGVyPExpc3Rib3hTZWxlY3Rpb25DaGFuZ2VFdmVudDxUPj4oKTtcblxuICBASW5wdXQoKSBpZCA9IGBjZGstbGlzdGJveC0ke2xpc3Rib3hJZCsrfWA7XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhlIGxpc3Rib3ggYWxsb3dzIG11bHRpcGxlIG9wdGlvbnMgdG8gYmUgc2VsZWN0ZWQuXG4gICAqIElmIGBtdWx0aXBsZWAgc3dpdGNoZXMgZnJvbSBgdHJ1ZWAgdG8gYGZhbHNlYCwgYWxsIG9wdGlvbnMgYXJlIGRlc2VsZWN0ZWQuXG4gICAqL1xuICBASW5wdXQoKVxuICBnZXQgbXVsdGlwbGUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX211bHRpcGxlO1xuICB9XG4gIHNldCBtdWx0aXBsZSh2YWx1ZTogQm9vbGVhbklucHV0KSB7XG4gICAgY29uc3QgY29lcmNlZFZhbHVlID0gY29lcmNlQm9vbGVhblByb3BlcnR5KHZhbHVlKTtcbiAgICB0aGlzLl91cGRhdGVTZWxlY3Rpb25Pbk11bHRpU2VsZWN0aW9uQ2hhbmdlKGNvZXJjZWRWYWx1ZSk7XG4gICAgdGhpcy5fbXVsdGlwbGUgPSBjb2VyY2VkVmFsdWU7XG4gIH1cblxuICBASW5wdXQoKVxuICBnZXQgZGlzYWJsZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2Rpc2FibGVkO1xuICB9XG4gIHNldCBkaXNhYmxlZCh2YWx1ZTogQm9vbGVhbklucHV0KSB7XG4gICAgdGhpcy5fZGlzYWJsZWQgPSBjb2VyY2VCb29sZWFuUHJvcGVydHkodmFsdWUpO1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGxpc3Rib3ggd2lsbCB1c2UgYWN0aXZlIGRlc2NlbmRhbnQgb3Igd2lsbCBtb3ZlIGZvY3VzIG9udG8gdGhlIG9wdGlvbnMuICovXG4gIEBJbnB1dCgpXG4gIGdldCB1c2VBY3RpdmVEZXNjZW5kYW50KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl91c2VBY3RpdmVEZXNjZW5kYW50O1xuICB9XG4gIHNldCB1c2VBY3RpdmVEZXNjZW5kYW50KHNob3VsZFVzZUFjdGl2ZURlc2NlbmRhbnQ6IEJvb2xlYW5JbnB1dCkge1xuICAgIHRoaXMuX3VzZUFjdGl2ZURlc2NlbmRhbnQgPSBjb2VyY2VCb29sZWFuUHJvcGVydHkoc2hvdWxkVXNlQWN0aXZlRGVzY2VuZGFudCk7XG4gIH1cblxuICAvKiogV2hldGhlciBvbiBmb2N1cyB0aGUgbGlzdGJveCB3aWxsIGZvY3VzIGl0cyBhY3RpdmUgb3B0aW9uLCBkZWZhdWx0IHRvIHRydWUuICovXG4gIEBJbnB1dCgpXG4gIGdldCBhdXRvRm9jdXMoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2F1dG9Gb2N1cztcbiAgfVxuICBzZXQgYXV0b0ZvY3VzKHNob3VsZEF1dG9Gb2N1czogQm9vbGVhbklucHV0KSB7XG4gICAgdGhpcy5fYXV0b0ZvY3VzID0gY29lcmNlQm9vbGVhblByb3BlcnR5KHNob3VsZEF1dG9Gb2N1cyk7XG4gIH1cblxuICAvKiogRGV0ZXJtaW5lcyB0aGUgb3JpZW50YXRpb24gZm9yIHRoZSBsaXN0IGtleSBtYW5hZ2VyLiBBZmZlY3RzIGtleWJvYXJkIGludGVyYWN0aW9uLiAqL1xuICBASW5wdXQoJ2xpc3Rib3hPcmllbnRhdGlvbicpIG9yaWVudGF0aW9uOiAnaG9yaXpvbnRhbCcgfCAndmVydGljYWwnID0gJ3ZlcnRpY2FsJztcblxuICBASW5wdXQoKSBjb21wYXJlV2l0aDogKG8xOiBULCBvMjogVCkgPT4gYm9vbGVhbiA9IChhMSwgYTIpID0+IGExID09PSBhMjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBAT3B0aW9uYWwoKSBASW5qZWN0KENES19DT01CT0JPWCkgcHJpdmF0ZSByZWFkb25seSBfY29tYm9ib3g6IENka0NvbWJvYm94LFxuICAgIEBPcHRpb25hbCgpIHByaXZhdGUgcmVhZG9ubHkgX2Rpcj86IERpcmVjdGlvbmFsaXR5LFxuICApIHt9XG5cbiAgbmdPbkluaXQoKSB7XG4gICAgdGhpcy5fc2VsZWN0aW9uTW9kZWwgPSBuZXcgU2VsZWN0aW9uTW9kZWw8Q2RrT3B0aW9uPFQ+Pih0aGlzLm11bHRpcGxlKTtcbiAgfVxuXG4gIG5nQWZ0ZXJDb250ZW50SW5pdCgpIHtcbiAgICB0aGlzLl9pbml0S2V5TWFuYWdlcigpO1xuICAgIHRoaXMuX2luaXRTZWxlY3Rpb25Nb2RlbCgpO1xuICAgIHRoaXMuX2NvbWJvYm94Py5fcmVnaXN0ZXJDb250ZW50KHRoaXMuaWQsICdsaXN0Ym94Jyk7XG5cbiAgICB0aGlzLm9wdGlvblNlbGVjdGlvbkNoYW5nZXMuc3Vic2NyaWJlKGV2ZW50ID0+IHtcbiAgICAgIHRoaXMuX2VtaXRDaGFuZ2VFdmVudChldmVudC5zb3VyY2UpO1xuICAgICAgdGhpcy5fdXBkYXRlU2VsZWN0aW9uTW9kZWwoZXZlbnQuc291cmNlKTtcbiAgICAgIHRoaXMuc2V0QWN0aXZlT3B0aW9uKGV2ZW50LnNvdXJjZSk7XG4gICAgICB0aGlzLl91cGRhdGVQYW5lbEZvclNlbGVjdGlvbihldmVudC5zb3VyY2UpO1xuICAgIH0pO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgdGhpcy5fbGlzdEtleU1hbmFnZXIuY2hhbmdlLmNvbXBsZXRlKCk7XG4gICAgdGhpcy5fZGVzdHJveWVkLm5leHQoKTtcbiAgICB0aGlzLl9kZXN0cm95ZWQuY29tcGxldGUoKTtcbiAgfVxuXG4gIHByaXZhdGUgX2luaXRLZXlNYW5hZ2VyKCkge1xuICAgIHRoaXMuX2xpc3RLZXlNYW5hZ2VyID0gbmV3IEFjdGl2ZURlc2NlbmRhbnRLZXlNYW5hZ2VyKHRoaXMuX29wdGlvbnMpXG4gICAgICAud2l0aFdyYXAoKVxuICAgICAgLndpdGhUeXBlQWhlYWQoKVxuICAgICAgLndpdGhIb21lQW5kRW5kKClcbiAgICAgIC53aXRoQWxsb3dlZE1vZGlmaWVyS2V5cyhbJ3NoaWZ0S2V5J10pO1xuXG4gICAgaWYgKHRoaXMub3JpZW50YXRpb24gPT09ICd2ZXJ0aWNhbCcpIHtcbiAgICAgIHRoaXMuX2xpc3RLZXlNYW5hZ2VyLndpdGhWZXJ0aWNhbE9yaWVudGF0aW9uKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2xpc3RLZXlNYW5hZ2VyLndpdGhIb3Jpem9udGFsT3JpZW50YXRpb24odGhpcy5fZGlyPy52YWx1ZSB8fCAnbHRyJyk7XG4gICAgfVxuXG4gICAgdGhpcy5fbGlzdEtleU1hbmFnZXIuY2hhbmdlLnBpcGUodGFrZVVudGlsKHRoaXMuX2Rlc3Ryb3llZCkpLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICB0aGlzLl91cGRhdGVBY3RpdmVPcHRpb24oKTtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX2luaXRTZWxlY3Rpb25Nb2RlbCgpIHtcbiAgICB0aGlzLl9zZWxlY3Rpb25Nb2RlbC5jaGFuZ2VkXG4gICAgICAucGlwZSh0YWtlVW50aWwodGhpcy5fZGVzdHJveWVkKSlcbiAgICAgIC5zdWJzY3JpYmUoKGV2ZW50OiBTZWxlY3Rpb25DaGFuZ2U8Q2RrT3B0aW9uPFQ+PikgPT4ge1xuICAgICAgICBmb3IgKGNvbnN0IG9wdGlvbiBvZiBldmVudC5hZGRlZCkge1xuICAgICAgICAgIG9wdGlvbi5zZWxlY3RlZCA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGNvbnN0IG9wdGlvbiBvZiBldmVudC5yZW1vdmVkKSB7XG4gICAgICAgICAgb3B0aW9uLnNlbGVjdGVkID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICB9XG5cbiAgX2tleWRvd24oZXZlbnQ6IEtleWJvYXJkRXZlbnQpIHtcbiAgICBpZiAodGhpcy5fZGlzYWJsZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBtYW5hZ2VyID0gdGhpcy5fbGlzdEtleU1hbmFnZXI7XG4gICAgY29uc3Qge2tleUNvZGV9ID0gZXZlbnQ7XG4gICAgY29uc3QgcHJldmlvdXNBY3RpdmVJbmRleCA9IG1hbmFnZXIuYWN0aXZlSXRlbUluZGV4O1xuXG4gICAgaWYgKGtleUNvZGUgPT09IFNQQUNFIHx8IGtleUNvZGUgPT09IEVOVEVSKSB7XG4gICAgICBpZiAobWFuYWdlci5hY3RpdmVJdGVtICYmICFtYW5hZ2VyLmlzVHlwaW5nKCkpIHtcbiAgICAgICAgdGhpcy5fdG9nZ2xlQWN0aXZlT3B0aW9uKCk7XG4gICAgICB9XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBtYW5hZ2VyLm9uS2V5ZG93bihldmVudCk7XG4gICAgfVxuXG4gICAgLyoqIFdpbGwgc2VsZWN0IGFuIG9wdGlvbiBpZiBzaGlmdCB3YXMgcHJlc3NlZCB3aGlsZSBuYXZpZ2F0aW5nIHRvIHRoZSBvcHRpb24gKi9cbiAgICBjb25zdCBpc0Fycm93ID1cbiAgICAgIGtleUNvZGUgPT09IFVQX0FSUk9XIHx8XG4gICAgICBrZXlDb2RlID09PSBET1dOX0FSUk9XIHx8XG4gICAgICBrZXlDb2RlID09PSBMRUZUX0FSUk9XIHx8XG4gICAgICBrZXlDb2RlID09PSBSSUdIVF9BUlJPVztcbiAgICBpZiAoaXNBcnJvdyAmJiBldmVudC5zaGlmdEtleSAmJiBwcmV2aW91c0FjdGl2ZUluZGV4ICE9PSB0aGlzLl9saXN0S2V5TWFuYWdlci5hY3RpdmVJdGVtSW5kZXgpIHtcbiAgICAgIHRoaXMuX3RvZ2dsZUFjdGl2ZU9wdGlvbigpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBFbWl0cyBhIHNlbGVjdGlvbiBjaGFuZ2UgZXZlbnQsIGNhbGxlZCB3aGVuIGFuIG9wdGlvbiBoYXMgaXRzIHNlbGVjdGVkIHN0YXRlIGNoYW5nZWQuICovXG4gIF9lbWl0Q2hhbmdlRXZlbnQob3B0aW9uOiBDZGtPcHRpb248VD4pIHtcbiAgICB0aGlzLnNlbGVjdGlvbkNoYW5nZS5lbWl0KHtcbiAgICAgIHNvdXJjZTogdGhpcyxcbiAgICAgIG9wdGlvbjogb3B0aW9uLFxuICAgIH0pO1xuICB9XG5cbiAgLyoqIFVwZGF0ZXMgdGhlIHNlbGVjdGlvbiBtb2RlbCBhZnRlciBhIHRvZ2dsZS4gKi9cbiAgX3VwZGF0ZVNlbGVjdGlvbk1vZGVsKG9wdGlvbjogQ2RrT3B0aW9uPFQ+KSB7XG4gICAgaWYgKCF0aGlzLm11bHRpcGxlICYmIHRoaXMuX3NlbGVjdGlvbk1vZGVsLnNlbGVjdGVkLmxlbmd0aCAhPT0gMCkge1xuICAgICAgY29uc3QgcHJldmlvdXNseVNlbGVjdGVkID0gdGhpcy5fc2VsZWN0aW9uTW9kZWwuc2VsZWN0ZWRbMF07XG4gICAgICB0aGlzLmRlc2VsZWN0KHByZXZpb3VzbHlTZWxlY3RlZCk7XG4gICAgfVxuXG4gICAgb3B0aW9uLnNlbGVjdGVkID8gdGhpcy5fc2VsZWN0aW9uTW9kZWwuc2VsZWN0KG9wdGlvbikgOiB0aGlzLl9zZWxlY3Rpb25Nb2RlbC5kZXNlbGVjdChvcHRpb24pO1xuICB9XG5cbiAgX3VwZGF0ZVBhbmVsRm9yU2VsZWN0aW9uKG9wdGlvbjogQ2RrT3B0aW9uPFQ+KSB7XG4gICAgaWYgKHRoaXMuX2NvbWJvYm94KSB7XG4gICAgICBpZiAoIXRoaXMubXVsdGlwbGUpIHtcbiAgICAgICAgdGhpcy5fY29tYm9ib3gudXBkYXRlQW5kQ2xvc2Uob3B0aW9uLnNlbGVjdGVkID8gb3B0aW9uLnZhbHVlIDogW10pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fY29tYm9ib3gudXBkYXRlQW5kQ2xvc2UodGhpcy5nZXRTZWxlY3RlZFZhbHVlcygpKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKiogVG9nZ2xlcyB0aGUgc2VsZWN0ZWQgc3RhdGUgb2YgdGhlIGFjdGl2ZSBvcHRpb24gaWYgbm90IGRpc2FibGVkLiAqL1xuICBwcml2YXRlIF90b2dnbGVBY3RpdmVPcHRpb24oKSB7XG4gICAgY29uc3QgYWN0aXZlT3B0aW9uID0gdGhpcy5fbGlzdEtleU1hbmFnZXIuYWN0aXZlSXRlbTtcbiAgICBpZiAoYWN0aXZlT3B0aW9uICYmICFhY3RpdmVPcHRpb24uZGlzYWJsZWQpIHtcbiAgICAgIGFjdGl2ZU9wdGlvbi50b2dnbGUoKTtcbiAgICB9XG4gIH1cblxuICAvKiogUmV0dXJucyB0aGUgaWQgb2YgdGhlIGFjdGl2ZSBvcHRpb24gaWYgYWN0aXZlIGRlc2NlbmRhbnQgaXMgYmVpbmcgdXNlZC4gKi9cbiAgX2dldEFyaWFBY3RpdmVEZXNjZW5kYW50KCk6IHN0cmluZyB8IG51bGwgfCB1bmRlZmluZWQge1xuICAgIHJldHVybiB0aGlzLl91c2VBY3RpdmVEZXNjZW5kYW50ID8gdGhpcy5fbGlzdEtleU1hbmFnZXI/LmFjdGl2ZUl0ZW0/LmlkIDogbnVsbDtcbiAgfVxuXG4gIC8qKiBVcGRhdGVzIHRoZSBhY3RpdmVPcHRpb24gYW5kIHRoZSBhY3RpdmUgYW5kIGZvY3VzIHByb3BlcnRpZXMgb2YgdGhlIG9wdGlvbi4gKi9cbiAgcHJpdmF0ZSBfdXBkYXRlQWN0aXZlT3B0aW9uKCkge1xuICAgIGlmICghdGhpcy5fbGlzdEtleU1hbmFnZXIuYWN0aXZlSXRlbSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX2FjdGl2ZU9wdGlvbj8uZGVhY3RpdmF0ZSgpO1xuICAgIHRoaXMuX2FjdGl2ZU9wdGlvbiA9IHRoaXMuX2xpc3RLZXlNYW5hZ2VyLmFjdGl2ZUl0ZW07XG4gICAgdGhpcy5fYWN0aXZlT3B0aW9uLmFjdGl2YXRlKCk7XG5cbiAgICBpZiAoIXRoaXMudXNlQWN0aXZlRGVzY2VuZGFudCkge1xuICAgICAgdGhpcy5fYWN0aXZlT3B0aW9uLmZvY3VzKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFVwZGF0ZXMgc2VsZWN0aW9uIHN0YXRlcyBvZiBvcHRpb25zIHdoZW4gdGhlICdtdWx0aXBsZScgcHJvcGVydHkgY2hhbmdlcy4gKi9cbiAgcHJpdmF0ZSBfdXBkYXRlU2VsZWN0aW9uT25NdWx0aVNlbGVjdGlvbkNoYW5nZSh2YWx1ZTogYm9vbGVhbikge1xuICAgIGlmICh0aGlzLm11bHRpcGxlICYmICF2YWx1ZSkge1xuICAgICAgLy8gRGVzZWxlY3QgYWxsIG9wdGlvbnMgaW5zdGVhZCBvZiBhcmJpdHJhcmlseSBrZWVwaW5nIG9uZSBvZiB0aGUgc2VsZWN0ZWQgb3B0aW9ucy5cbiAgICAgIHRoaXMuc2V0QWxsU2VsZWN0ZWQoZmFsc2UpO1xuICAgIH0gZWxzZSBpZiAoIXRoaXMubXVsdGlwbGUgJiYgdmFsdWUpIHtcbiAgICAgIHRoaXMuX3NlbGVjdGlvbk1vZGVsID0gbmV3IFNlbGVjdGlvbk1vZGVsPENka09wdGlvbjxUPj4oXG4gICAgICAgIHZhbHVlLFxuICAgICAgICB0aGlzLl9zZWxlY3Rpb25Nb2RlbD8uc2VsZWN0ZWQsXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIF9mb2N1c0FjdGl2ZU9wdGlvbigpIHtcbiAgICBpZiAoIXRoaXMuYXV0b0ZvY3VzKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2xpc3RLZXlNYW5hZ2VyLmFjdGl2ZUl0ZW0pIHtcbiAgICAgIHRoaXMuc2V0QWN0aXZlT3B0aW9uKHRoaXMuX2xpc3RLZXlNYW5hZ2VyLmFjdGl2ZUl0ZW0pO1xuICAgIH0gZWxzZSBpZiAodGhpcy5fb3B0aW9ucy5maXJzdCkge1xuICAgICAgdGhpcy5zZXRBY3RpdmVPcHRpb24odGhpcy5fb3B0aW9ucy5maXJzdCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFNlbGVjdHMgdGhlIGdpdmVuIG9wdGlvbiBpZiB0aGUgb3B0aW9uIGFuZCBsaXN0Ym94IGFyZW4ndCBkaXNhYmxlZC4gKi9cbiAgc2VsZWN0KG9wdGlvbjogQ2RrT3B0aW9uPFQ+KSB7XG4gICAgaWYgKCF0aGlzLmRpc2FibGVkICYmICFvcHRpb24uZGlzYWJsZWQpIHtcbiAgICAgIG9wdGlvbi5zZWxlY3QoKTtcbiAgICB9XG4gIH1cblxuICAvKiogRGVzZWxlY3RzIHRoZSBnaXZlbiBvcHRpb24gaWYgdGhlIG9wdGlvbiBhbmQgbGlzdGJveCBhcmVuJ3QgZGlzYWJsZWQuICovXG4gIGRlc2VsZWN0KG9wdGlvbjogQ2RrT3B0aW9uPFQ+KSB7XG4gICAgaWYgKCF0aGlzLmRpc2FibGVkICYmICFvcHRpb24uZGlzYWJsZWQpIHtcbiAgICAgIG9wdGlvbi5kZXNlbGVjdCgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBTZXRzIHRoZSBzZWxlY3RlZCBzdGF0ZSBvZiBhbGwgb3B0aW9ucyB0byBiZSB0aGUgZ2l2ZW4gdmFsdWUuICovXG4gIHNldEFsbFNlbGVjdGVkKGlzU2VsZWN0ZWQ6IGJvb2xlYW4pIHtcbiAgICBmb3IgKGNvbnN0IG9wdGlvbiBvZiB0aGlzLl9vcHRpb25zLnRvQXJyYXkoKSkge1xuICAgICAgaXNTZWxlY3RlZCA/IHRoaXMuc2VsZWN0KG9wdGlvbikgOiB0aGlzLmRlc2VsZWN0KG9wdGlvbik7XG4gICAgfVxuICB9XG5cbiAgLyoqIFVwZGF0ZXMgdGhlIGtleSBtYW5hZ2VyJ3MgYWN0aXZlIGl0ZW0gdG8gdGhlIGdpdmVuIG9wdGlvbi4gKi9cbiAgc2V0QWN0aXZlT3B0aW9uKG9wdGlvbjogQ2RrT3B0aW9uPFQ+KSB7XG4gICAgdGhpcy5fbGlzdEtleU1hbmFnZXIudXBkYXRlQWN0aXZlSXRlbShvcHRpb24pO1xuICAgIHRoaXMuX3VwZGF0ZUFjdGl2ZU9wdGlvbigpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNhdmVzIGEgY2FsbGJhY2sgZnVuY3Rpb24gdG8gYmUgaW52b2tlZCB3aGVuIHRoZSBzZWxlY3QncyB2YWx1ZVxuICAgKiBjaGFuZ2VzIGZyb20gdXNlciBpbnB1dC4gUmVxdWlyZWQgdG8gaW1wbGVtZW50IENvbnRyb2xWYWx1ZUFjY2Vzc29yLlxuICAgKi9cbiAgcmVnaXN0ZXJPbkNoYW5nZShmbjogKHZhbHVlOiBUKSA9PiB2b2lkKTogdm9pZCB7XG4gICAgdGhpcy5fb25DaGFuZ2UgPSBmbjtcbiAgfVxuXG4gIC8qKlxuICAgKiBTYXZlcyBhIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGJlIGludm9rZWQgd2hlbiB0aGUgc2VsZWN0IGlzIGJsdXJyZWRcbiAgICogYnkgdGhlIHVzZXIuIFJlcXVpcmVkIHRvIGltcGxlbWVudCBDb250cm9sVmFsdWVBY2Nlc3Nvci5cbiAgICovXG4gIHJlZ2lzdGVyT25Ub3VjaGVkKGZuOiAoKSA9PiB7fSk6IHZvaWQge1xuICAgIHRoaXMuX29uVG91Y2hlZCA9IGZuO1xuICB9XG5cbiAgLyoqIFNldHMgdGhlIHNlbGVjdCdzIHZhbHVlLiBSZXF1aXJlZCB0byBpbXBsZW1lbnQgQ29udHJvbFZhbHVlQWNjZXNzb3IuICovXG4gIHdyaXRlVmFsdWUodmFsdWVzOiBUIHwgVFtdKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX29wdGlvbnMpIHtcbiAgICAgIHRoaXMuX3NldFNlbGVjdGlvbkJ5VmFsdWUodmFsdWVzKTtcbiAgICB9XG4gIH1cblxuICAvKiogRGlzYWJsZXMgdGhlIHNlbGVjdC4gUmVxdWlyZWQgdG8gaW1wbGVtZW50IENvbnRyb2xWYWx1ZUFjY2Vzc29yLiAqL1xuICBzZXREaXNhYmxlZFN0YXRlKGlzRGlzYWJsZWQ6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLmRpc2FibGVkID0gaXNEaXNhYmxlZDtcbiAgfVxuXG4gIC8qKiBSZXR1cm5zIHRoZSB2YWx1ZXMgb2YgdGhlIGN1cnJlbnRseSBzZWxlY3RlZCBvcHRpb25zLiAqL1xuICBnZXRTZWxlY3RlZFZhbHVlcygpOiBUW10ge1xuICAgIHJldHVybiB0aGlzLl9vcHRpb25zLmZpbHRlcihvcHRpb24gPT4gb3B0aW9uLnNlbGVjdGVkKS5tYXAob3B0aW9uID0+IG9wdGlvbi52YWx1ZSk7XG4gIH1cblxuICAvKiogU2VsZWN0cyBhbiBvcHRpb24gdGhhdCBoYXMgdGhlIGNvcnJlc3BvbmRpbmcgZ2l2ZW4gdmFsdWUuICovXG4gIHByaXZhdGUgX3NldFNlbGVjdGlvbkJ5VmFsdWUodmFsdWVzOiBUIHwgVFtdKSB7XG4gICAgZm9yIChjb25zdCBvcHRpb24gb2YgdGhpcy5fb3B0aW9ucy50b0FycmF5KCkpIHtcbiAgICAgIHRoaXMuZGVzZWxlY3Qob3B0aW9uKTtcbiAgICB9XG5cbiAgICBjb25zdCB2YWx1ZXNBcnJheSA9IGNvZXJjZUFycmF5KHZhbHVlcyk7XG4gICAgZm9yIChjb25zdCB2YWx1ZSBvZiB2YWx1ZXNBcnJheSkge1xuICAgICAgY29uc3QgY29ycmVzcG9uZGluZ09wdGlvbiA9IHRoaXMuX29wdGlvbnMuZmluZCgob3B0aW9uOiBDZGtPcHRpb248VD4pID0+IHtcbiAgICAgICAgcmV0dXJuIG9wdGlvbi52YWx1ZSAhPSBudWxsICYmIHRoaXMuY29tcGFyZVdpdGgob3B0aW9uLnZhbHVlLCB2YWx1ZSk7XG4gICAgICB9KTtcblxuICAgICAgaWYgKGNvcnJlc3BvbmRpbmdPcHRpb24pIHtcbiAgICAgICAgdGhpcy5zZWxlY3QoY29ycmVzcG9uZGluZ09wdGlvbik7XG4gICAgICAgIGlmICghdGhpcy5tdWx0aXBsZSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG4vKiogQ2hhbmdlIGV2ZW50IHRoYXQgaXMgYmVpbmcgZmlyZWQgd2hlbmV2ZXIgdGhlIHNlbGVjdGVkIHN0YXRlIG9mIGFuIG9wdGlvbiBjaGFuZ2VzLiAqL1xuZXhwb3J0IGludGVyZmFjZSBMaXN0Ym94U2VsZWN0aW9uQ2hhbmdlRXZlbnQ8VD4ge1xuICAvKiogUmVmZXJlbmNlIHRvIHRoZSBsaXN0Ym94IHRoYXQgZW1pdHRlZCB0aGUgZXZlbnQuICovXG4gIHJlYWRvbmx5IHNvdXJjZTogQ2RrTGlzdGJveDxUPjtcblxuICAvKiogUmVmZXJlbmNlIHRvIHRoZSBvcHRpb24gdGhhdCBoYXMgYmVlbiBjaGFuZ2VkLiAqL1xuICByZWFkb25seSBvcHRpb246IENka09wdGlvbjxUPjtcbn1cblxuLyoqIEV2ZW50IG9iamVjdCBlbWl0dGVkIGJ5IE1hdE9wdGlvbiB3aGVuIHNlbGVjdGVkIG9yIGRlc2VsZWN0ZWQuICovXG5leHBvcnQgaW50ZXJmYWNlIE9wdGlvblNlbGVjdGlvbkNoYW5nZUV2ZW50PFQ+IHtcbiAgLyoqIFJlZmVyZW5jZSB0byB0aGUgb3B0aW9uIHRoYXQgZW1pdHRlZCB0aGUgZXZlbnQuICovXG4gIHNvdXJjZTogQ2RrT3B0aW9uPFQ+O1xuXG4gIC8qKiBXaGV0aGVyIHRoZSBjaGFuZ2UgaW4gdGhlIG9wdGlvbidzIHZhbHVlIHdhcyBhIHJlc3VsdCBvZiBhIHVzZXIgYWN0aW9uLiAqL1xuICBpc1VzZXJJbnB1dDogYm9vbGVhbjtcbn1cbiJdfQ==