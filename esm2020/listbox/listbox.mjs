/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ChangeDetectorRef, ContentChildren, Directive, ElementRef, forwardRef, inject, InjectFlags, Input, Output, QueryList, } from '@angular/core';
import { ActiveDescendantKeyManager } from '@angular/cdk/a11y';
import { DOWN_ARROW, ENTER, LEFT_ARROW, RIGHT_ARROW, SPACE, UP_ARROW } from '@angular/cdk/keycodes';
import { coerceArray, coerceBooleanProperty } from '@angular/cdk/coercion';
import { SelectionModel } from '@angular/cdk/collections';
import { BehaviorSubject, combineLatest, defer, merge, Subject } from 'rxjs';
import { filter, mapTo, startWith, switchMap, take, takeUntil } from 'rxjs/operators';
import { NG_VALIDATORS, NG_VALUE_ACCESSOR, Validators, } from '@angular/forms';
import { Directionality } from '@angular/cdk/bidi';
import { CdkCombobox } from '@angular/cdk-experimental/combobox';
import * as i0 from "@angular/core";
/** The next id to use for creating unique DOM IDs. */
let nextId = 0;
// TODO(mmalerba):
//   - should listbox wrap be configurable?
//   - should skipping disabled options be configurable?
/** A selectable option in a listbox. */
export class CdkOption {
    constructor() {
        this._generatedId = `cdk-option-${nextId++}`;
        this._disabled = false;
        /** The option's host element */
        this.element = inject(ElementRef).nativeElement;
        /** The parent listbox this option belongs to. */
        this.listbox = inject(CdkListbox);
        /** Emits when the option is destroyed. */
        this.destroyed = new Subject();
        /** Emits when the option is clicked. */
        this._clicked = new Subject();
        /** Whether the option is currently active. */
        this._active = false;
    }
    /** The id of the option's host element. */
    get id() {
        return this._id || this._generatedId;
    }
    set id(value) {
        this._id = value;
    }
    /** Whether this option is disabled. */
    get disabled() {
        return this.listbox.disabled || this._disabled;
    }
    set disabled(value) {
        this._disabled = coerceBooleanProperty(value);
    }
    /** The tabindex of the option when it is enabled. */
    get enabledTabIndex() {
        return this._enabledTabIndex === undefined
            ? this.listbox.enabledTabIndex
            : this._enabledTabIndex;
    }
    set enabledTabIndex(value) {
        this._enabledTabIndex = value;
    }
    ngOnDestroy() {
        this.destroyed.next();
        this.destroyed.complete();
    }
    /** Whether this option is selected. */
    isSelected() {
        return this.listbox.isSelected(this.value);
    }
    /** Whether this option is active. */
    isActive() {
        return this._active;
    }
    /** Toggle the selected state of this option. */
    toggle() {
        this.listbox.toggle(this);
    }
    /** Select this option if it is not selected. */
    select() {
        this.listbox.select(this);
    }
    /** Deselect this option if it is selected. */
    deselect() {
        this.listbox.deselect(this);
    }
    /** Focus this option. */
    focus() {
        this.element.focus();
    }
    /** Get the label for this element which is required by the FocusableOption interface. */
    getLabel() {
        return (this.typeaheadLabel ?? this.element.textContent?.trim()) || '';
    }
    /**
     * Set the option as active.
     * @docs-private
     */
    setActiveStyles() {
        this._active = true;
    }
    /**
     * Set the option as inactive.
     * @docs-private
     */
    setInactiveStyles() {
        this._active = false;
    }
    /** Handle focus events on the option. */
    _handleFocus() {
        // Options can wind up getting focused in active descendant mode if the user clicks on them.
        // In this case, we push focus back to the parent listbox to prevent an extra tab stop when
        // the user performs a shift+tab.
        if (this.listbox.useActiveDescendant) {
            this.listbox._setActiveOption(this);
            this.listbox.focus();
        }
    }
    /** Get the tabindex for this option. */
    _getTabIndex() {
        if (this.listbox.useActiveDescendant || this.disabled) {
            return -1;
        }
        return this.isActive() ? this.enabledTabIndex : -1;
    }
}
CdkOption.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.0.1", ngImport: i0, type: CdkOption, deps: [], target: i0.ɵɵFactoryTarget.Directive });
CdkOption.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.0.1", type: CdkOption, selector: "[cdkOption]", inputs: { id: "id", value: ["cdkOption", "value"], typeaheadLabel: ["cdkOptionTypeaheadLabel", "typeaheadLabel"], disabled: ["cdkOptionDisabled", "disabled"], enabledTabIndex: ["tabindex", "enabledTabIndex"] }, host: { attributes: { "role": "option" }, listeners: { "click": "_clicked.next()", "focus": "_handleFocus()" }, properties: { "id": "id", "attr.aria-selected": "isSelected() || null", "attr.tabindex": "_getTabIndex()", "attr.aria-disabled": "disabled", "class.cdk-option-disabled": "disabled", "class.cdk-option-active": "isActive()", "class.cdk-option-selected": "isSelected()" }, classAttribute: "cdk-option" }, exportAs: ["cdkOption"], ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.0.1", ngImport: i0, type: CdkOption, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkOption]',
                    exportAs: 'cdkOption',
                    host: {
                        'role': 'option',
                        'class': 'cdk-option',
                        '[id]': 'id',
                        '[attr.aria-selected]': 'isSelected() || null',
                        '[attr.tabindex]': '_getTabIndex()',
                        '[attr.aria-disabled]': 'disabled',
                        '[class.cdk-option-disabled]': 'disabled',
                        '[class.cdk-option-active]': 'isActive()',
                        '[class.cdk-option-selected]': 'isSelected()',
                        '(click)': '_clicked.next()',
                        '(focus)': '_handleFocus()',
                    },
                }]
        }], propDecorators: { id: [{
                type: Input
            }], value: [{
                type: Input,
                args: ['cdkOption']
            }], typeaheadLabel: [{
                type: Input,
                args: ['cdkOptionTypeaheadLabel']
            }], disabled: [{
                type: Input,
                args: ['cdkOptionDisabled']
            }], enabledTabIndex: [{
                type: Input,
                args: ['tabindex']
            }] } });
export class CdkListbox {
    constructor() {
        this._generatedId = `cdk-listbox-${nextId++}`;
        this._multiple = false;
        this._disabled = false;
        this._useActiveDescendant = false;
        /** The orientation of the listbox. Only affects keyboard interaction, not visual layout. */
        this.orientation = 'vertical';
        /** Emits when the selected value(s) in the listbox change. */
        this.valueChange = new Subject();
        // TODO(mmalerba): Refactor SelectionModel so that its not necessary to create new instances
        /** The selection model used by the listbox. */
        this.selectionModelSubject = new BehaviorSubject(new SelectionModel(this.multiple, [], true, this._compareWith));
        /** Emits when the listbox is destroyed. */
        this.destroyed = new Subject();
        /** The host element of the listbox. */
        this.element = inject(ElementRef).nativeElement;
        /** The change detector for this listbox. */
        this.changeDetectorRef = inject(ChangeDetectorRef);
        /** Callback called when the listbox has been touched */
        this._onTouched = () => { };
        /** Callback called when the listbox value changes */
        this._onChange = () => { };
        /** Callback called when the form validator changes. */
        this._onValidatorChange = () => { };
        /** Emits when an option has been clicked. */
        this._optionClicked = defer(() => this.options.changes.pipe(startWith(this.options), switchMap(options => merge(...options.map(option => option._clicked.pipe(mapTo(option)))))));
        /** The directionality of the page. */
        this._dir = inject(Directionality, InjectFlags.Optional);
        // TODO(mmalerba): Should not depend on combobox
        this._combobox = inject(CdkCombobox, InjectFlags.Optional);
        /**
         * Validator that produces an error if multiple values are selected in a single selection
         * listbox.
         * @param control The control to validate
         * @return A validation error or null
         */
        this._validateMultipleValues = (control) => {
            const controlValue = this._coerceValue(control.value);
            if (!this.multiple && controlValue.length > 1) {
                return { 'cdkListboxMultipleValues': true };
            }
            return null;
        };
        /**
         * Validator that produces an error if any selected values are not valid options for this listbox.
         * @param control The control to validate
         * @return A validation error or null
         */
        this._validateInvalidValues = (control) => {
            const controlValue = this._coerceValue(control.value);
            const invalidValues = this._getValuesWithValidity(controlValue, false);
            if (invalidValues.length) {
                return { 'cdkListboxInvalidValues': { 'values': invalidValues } };
            }
            return null;
        };
        /** The combined set of validators for this listbox. */
        this._validators = Validators.compose([
            this._validateMultipleValues,
            this._validateInvalidValues,
        ]);
        this.selectionModelSubject
            .pipe(switchMap(selectionModel => selectionModel.changed), takeUntil(this.destroyed))
            .subscribe(() => {
            this._updateInternalValue();
        });
    }
    /** The id of the option's host element. */
    get id() {
        return this._id || this._generatedId;
    }
    set id(value) {
        this._id = value;
    }
    /** The tabindex to use when the listbox is enabled. */
    get enabledTabIndex() {
        return this._enabledTabIndex === undefined ? 0 : this._enabledTabIndex;
    }
    set enabledTabIndex(value) {
        this._enabledTabIndex = value;
    }
    /** The value selected in the listbox, represented as an array of option values. */
    get value() {
        return this.selectionModel().selected;
    }
    set value(value) {
        this._setSelection(value);
    }
    /**
     * Whether the listbox allows multiple options to be selected. If the value switches from `true`
     * to `false`, and more than one option is selected, all options are deselected.
     */
    get multiple() {
        return this._multiple;
    }
    set multiple(value) {
        this._multiple = coerceBooleanProperty(value);
        this._updateSelectionModel();
        this._onValidatorChange();
    }
    /** Whether the listbox is disabled. */
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
    /** The function used to compare option values. */
    get compareWith() {
        return this._compareWith;
    }
    set compareWith(fn) {
        this._compareWith = fn;
        this._updateSelectionModel();
    }
    ngAfterContentInit() {
        if (typeof ngDevMode === 'undefined' || ngDevMode) {
            this._verifyNoOptionValueCollisions();
        }
        this._initKeyManager();
        this._combobox?._registerContent(this.id, 'listbox');
        this.options.changes.pipe(takeUntil(this.destroyed)).subscribe(() => {
            this._updateInternalValue();
            this._onValidatorChange();
        });
        this._optionClicked
            .pipe(filter(option => !option.disabled), takeUntil(this.destroyed))
            .subscribe(option => this._handleOptionClicked(option));
    }
    ngOnDestroy() {
        this.listKeyManager.change.complete();
        this.destroyed.next();
        this.destroyed.complete();
    }
    /**
     * Toggle the selected state of the given option.
     * @param option The option to toggle
     */
    toggle(option) {
        this.toggleValue(option.value);
    }
    /**
     * Toggle the selected state of the given value.
     * @param value The value to toggle
     */
    toggleValue(value) {
        this.selectionModel().toggle(value);
    }
    /**
     * Select the given option.
     * @param option The option to select
     */
    select(option) {
        this.selectValue(option.value);
    }
    /**
     * Select the given value.
     * @param value The value to select
     */
    selectValue(value) {
        this.selectionModel().select(value);
    }
    /**
     * Deselect the given option.
     * @param option The option to deselect
     */
    deselect(option) {
        this.deselectValue(option.value);
    }
    /**
     * Deselect the given value.
     * @param value The value to deselect
     */
    deselectValue(value) {
        this.selectionModel().deselect(value);
    }
    /**
     * Set the selected state of all options.
     * @param isSelected The new selected state to set
     */
    setAllSelected(isSelected) {
        if (!isSelected) {
            this.selectionModel().clear();
        }
        else {
            this.selectionModel().select(...this.options.toArray().map(option => option.value));
        }
    }
    /**
     * Get whether the given option is selected.
     * @param option The option to get the selected state of
     */
    isSelected(option) {
        return this.selectionModel().isSelected(option instanceof CdkOption ? option.value : option);
    }
    /**
     * Registers a callback to be invoked when the listbox's value changes from user input.
     * @param fn The callback to register
     * @docs-private
     */
    registerOnChange(fn) {
        this._onChange = fn;
    }
    /**
     * Registers a callback to be invoked when the listbox is blurred by the user.
     * @param fn The callback to register
     * @docs-private
     */
    registerOnTouched(fn) {
        this._onTouched = fn;
    }
    /**
     * Sets the listbox's value.
     * @param value The new value of the listbox
     * @docs-private
     */
    writeValue(value) {
        this._setSelection(value);
    }
    /**
     * Sets the disabled state of the listbox.
     * @param isDisabled The new disabled state
     * @docs-private
     */
    setDisabledState(isDisabled) {
        this.disabled = isDisabled;
    }
    /**
     * Validate the given control
     * @docs-private
     */
    validate(control) {
        return this._validators(control);
    }
    /**
     * Registers a callback to be called when the form validator changes.
     * @param fn The callback to call
     * @docs-private
     */
    registerOnValidatorChange(fn) {
        this._onValidatorChange = fn;
    }
    /** Focus the listbox's host element. */
    focus() {
        this.element.focus();
    }
    /** The selection model used to track the listbox's value. */
    selectionModel() {
        return this.selectionModelSubject.value;
    }
    /**
     * Triggers the given option in response to user interaction.
     * - In single selection mode: selects the option and deselects any other selected option.
     * - In multi selection mode: toggles the selected state of the option.
     * @param option The option to trigger
     */
    triggerOption(option) {
        if (option && !option.disabled) {
            let changed = false;
            this.selectionModel()
                .changed.pipe(take(1), takeUntil(this.destroyed))
                .subscribe(() => (changed = true));
            if (this.multiple) {
                this.toggle(option);
            }
            else {
                this.select(option);
            }
            if (changed) {
                this._onChange(this.value);
                this.valueChange.next({
                    value: this.value,
                    listbox: this,
                    option: option,
                });
            }
        }
    }
    /**
     * Sets the given option as active.
     * @param option The option to make active
     */
    _setActiveOption(option) {
        this.listKeyManager.setActiveItem(option);
    }
    /** Called when the listbox receives focus. */
    _handleFocus() {
        if (!this.useActiveDescendant) {
            this.listKeyManager.setNextItemActive();
            this._focusActiveOption();
        }
    }
    /** Called when the user presses keydown on the listbox. */
    _handleKeydown(event) {
        if (this._disabled) {
            return;
        }
        const { keyCode } = event;
        const previousActiveIndex = this.listKeyManager.activeItemIndex;
        if (keyCode === SPACE || keyCode === ENTER) {
            this.triggerOption(this.listKeyManager.activeItem);
            event.preventDefault();
        }
        else {
            this.listKeyManager.onKeydown(event);
        }
        /** Will select an option if shift was pressed while navigating to the option */
        const isArrow = keyCode === UP_ARROW ||
            keyCode === DOWN_ARROW ||
            keyCode === LEFT_ARROW ||
            keyCode === RIGHT_ARROW;
        if (isArrow && event.shiftKey && previousActiveIndex !== this.listKeyManager.activeItemIndex) {
            this.triggerOption(this.listKeyManager.activeItem);
        }
    }
    /**
     * Called when the focus leaves an element in the listbox.
     * @param event The focusout event
     */
    _handleFocusOut(event) {
        const otherElement = event.relatedTarget;
        if (this.element !== otherElement && !this.element.contains(otherElement)) {
            this._onTouched();
        }
    }
    /** Get the id of the active option if active descendant is being used. */
    _getAriaActiveDescendant() {
        return this._useActiveDescendant ? this.listKeyManager?.activeItem?.id : null;
    }
    /** Get the tabindex for the listbox. */
    _getTabIndex() {
        if (this.disabled) {
            return -1;
        }
        return this.useActiveDescendant || !this.listKeyManager.activeItem ? this.enabledTabIndex : -1;
    }
    /** Initialize the key manager. */
    _initKeyManager() {
        this.listKeyManager = new ActiveDescendantKeyManager(this.options)
            .withWrap()
            .withTypeAhead()
            .withHomeAndEnd()
            .withAllowedModifierKeys(['shiftKey']);
        if (this.orientation === 'vertical') {
            this.listKeyManager.withVerticalOrientation();
        }
        else {
            this.listKeyManager.withHorizontalOrientation(this._dir?.value || 'ltr');
        }
        this.listKeyManager.change
            .pipe(takeUntil(this.destroyed))
            .subscribe(() => this._focusActiveOption());
    }
    // TODO(mmalerba): Should not depend on combobox.
    _updatePanelForSelection(option) {
        if (this._combobox) {
            if (!this.multiple) {
                this._combobox.updateAndClose(option.isSelected() ? option.value : []);
            }
            else {
                this._combobox.updateAndClose(this.value);
            }
        }
    }
    /** Update the selection mode when the 'multiple' property changes. */
    _updateSelectionModel() {
        this.selectionModelSubject.next(new SelectionModel(this.multiple, !this.multiple && this.value.length > 1 ? [] : this.value.slice(), true, this._compareWith));
    }
    /** Focus the active option. */
    _focusActiveOption() {
        if (!this.useActiveDescendant) {
            this.listKeyManager.activeItem?.focus();
        }
        this.changeDetectorRef.markForCheck();
    }
    /**
     * Set the selected values.
     * @param value The list of new selected values.
     */
    _setSelection(value) {
        const coercedValue = this._coerceValue(value);
        this.selectionModel().setSelection(...(!this.multiple && coercedValue.length > 1
            ? []
            : this._getValuesWithValidity(coercedValue, true)));
    }
    /** Update the internal value of the listbox based on the selection model. */
    _updateInternalValue() {
        const indexCache = new Map();
        // Check if we need to remove any values due to them becoming invalid
        // (e.g. if the option was removed from the DOM.)
        const selected = this.selectionModel().selected;
        const validSelected = this._getValuesWithValidity(selected, true);
        if (validSelected.length != selected.length) {
            this.selectionModel().setSelection(...validSelected);
        }
        this.selectionModel().sort((a, b) => {
            const aIndex = this._getIndexForValue(indexCache, a);
            const bIndex = this._getIndexForValue(indexCache, b);
            return aIndex - bIndex;
        });
        this.changeDetectorRef.markForCheck();
    }
    /**
     * Gets the index of the given value in the given list of options.
     * @param cache The cache of indices found so far
     * @param value The value to find
     * @return The index of the value in the options list
     */
    _getIndexForValue(cache, value) {
        const isEqual = this.compareWith || Object.is;
        if (!cache.has(value)) {
            let index = -1;
            for (let i = 0; i < this.options.length; i++) {
                if (isEqual(value, this.options.get(i).value)) {
                    index = i;
                    break;
                }
            }
            cache.set(value, index);
        }
        return cache.get(value);
    }
    /**
     * Handle the user clicking an option.
     * @param option The option that was clicked.
     */
    _handleOptionClicked(option) {
        this.listKeyManager.setActiveItem(option);
        this.triggerOption(option);
        this._updatePanelForSelection(option);
    }
    /** Verifies that no two options represent the same value under the compareWith function. */
    _verifyNoOptionValueCollisions() {
        combineLatest([
            this.selectionModelSubject,
            this.options.changes.pipe(startWith(this.options)),
        ]).subscribe(() => {
            const isEqual = this.compareWith ?? Object.is;
            for (let i = 0; i < this.options.length; i++) {
                const option = this.options.get(i);
                let duplicate = null;
                for (let j = i + 1; j < this.options.length; j++) {
                    const other = this.options.get(j);
                    if (isEqual(option.value, other.value)) {
                        duplicate = other;
                        break;
                    }
                }
                if (duplicate) {
                    // TODO(mmalerba): Link to docs about this.
                    if (this.compareWith) {
                        console.warn(`Found multiple CdkOption representing the same value under the given compareWith function`, {
                            option1: option.element,
                            option2: duplicate.element,
                            compareWith: this.compareWith,
                        });
                    }
                    else {
                        console.warn(`Found multiple CdkOption with the same value`, {
                            option1: option.element,
                            option2: duplicate.element,
                        });
                    }
                    return;
                }
            }
        });
    }
    /**
     * Coerces a value into an array representing a listbox selection.
     * @param value The value to coerce
     * @return An array
     */
    _coerceValue(value) {
        return value == null ? [] : coerceArray(value);
    }
    /**
     * Get the sublist of values with the given validity.
     * @param values The list of values
     * @param valid Whether to get valid values
     * @return The sublist of values with the requested validity
     */
    _getValuesWithValidity(values, valid) {
        const isEqual = this.compareWith || Object.is;
        const validValues = (this.options || []).map(option => option.value);
        return values.filter(value => valid === validValues.some(validValue => isEqual(value, validValue)));
    }
}
CdkListbox.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.0.1", ngImport: i0, type: CdkListbox, deps: [], target: i0.ɵɵFactoryTarget.Directive });
CdkListbox.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.0.1", type: CdkListbox, selector: "[cdkListbox]", inputs: { id: "id", enabledTabIndex: ["tabindex", "enabledTabIndex"], value: ["cdkListboxValue", "value"], multiple: ["cdkListboxMultiple", "multiple"], disabled: ["cdkListboxDisabled", "disabled"], useActiveDescendant: ["cdkListboxUseActiveDescendant", "useActiveDescendant"], orientation: ["cdkListboxOrientation", "orientation"], compareWith: ["cdkListboxCompareWith", "compareWith"] }, outputs: { valueChange: "cdkListboxValueChange" }, host: { attributes: { "role": "listbox" }, listeners: { "focus": "_handleFocus()", "keydown": "_handleKeydown($event)", "focusout": "_handleFocusOut($event)" }, properties: { "id": "id", "attr.tabindex": "_getTabIndex()", "attr.aria-disabled": "disabled", "attr.aria-multiselectable": "multiple", "attr.aria-activedescendant": "_getAriaActiveDescendant()", "attr.aria-orientation": "orientation" }, classAttribute: "cdk-listbox" }, providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => CdkListbox),
            multi: true,
        },
        {
            provide: NG_VALIDATORS,
            useExisting: forwardRef(() => CdkListbox),
            multi: true,
        },
    ], queries: [{ propertyName: "options", predicate: CdkOption, descendants: true }], exportAs: ["cdkListbox"], ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.0.1", ngImport: i0, type: CdkListbox, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkListbox]',
                    exportAs: 'cdkListbox',
                    host: {
                        'role': 'listbox',
                        'class': 'cdk-listbox',
                        '[id]': 'id',
                        '[attr.tabindex]': '_getTabIndex()',
                        '[attr.aria-disabled]': 'disabled',
                        '[attr.aria-multiselectable]': 'multiple',
                        '[attr.aria-activedescendant]': '_getAriaActiveDescendant()',
                        '[attr.aria-orientation]': 'orientation',
                        '(focus)': '_handleFocus()',
                        '(keydown)': '_handleKeydown($event)',
                        '(focusout)': '_handleFocusOut($event)',
                    },
                    providers: [
                        {
                            provide: NG_VALUE_ACCESSOR,
                            useExisting: forwardRef(() => CdkListbox),
                            multi: true,
                        },
                        {
                            provide: NG_VALIDATORS,
                            useExisting: forwardRef(() => CdkListbox),
                            multi: true,
                        },
                    ],
                }]
        }], ctorParameters: function () { return []; }, propDecorators: { id: [{
                type: Input
            }], enabledTabIndex: [{
                type: Input,
                args: ['tabindex']
            }], value: [{
                type: Input,
                args: ['cdkListboxValue']
            }], multiple: [{
                type: Input,
                args: ['cdkListboxMultiple']
            }], disabled: [{
                type: Input,
                args: ['cdkListboxDisabled']
            }], useActiveDescendant: [{
                type: Input,
                args: ['cdkListboxUseActiveDescendant']
            }], orientation: [{
                type: Input,
                args: ['cdkListboxOrientation']
            }], compareWith: [{
                type: Input,
                args: ['cdkListboxCompareWith']
            }], valueChange: [{
                type: Output,
                args: ['cdkListboxValueChange']
            }], options: [{
                type: ContentChildren,
                args: [CdkOption, { descendants: true }]
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdGJveC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL2xpc3Rib3gvbGlzdGJveC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBRUwsaUJBQWlCLEVBQ2pCLGVBQWUsRUFDZixTQUFTLEVBQ1QsVUFBVSxFQUNWLFVBQVUsRUFDVixNQUFNLEVBQ04sV0FBVyxFQUNYLEtBQUssRUFFTCxNQUFNLEVBQ04sU0FBUyxHQUNWLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBQywwQkFBMEIsRUFBc0MsTUFBTSxtQkFBbUIsQ0FBQztBQUNsRyxPQUFPLEVBQUMsVUFBVSxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUNsRyxPQUFPLEVBQWUsV0FBVyxFQUFFLHFCQUFxQixFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDdkYsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLDBCQUEwQixDQUFDO0FBQ3hELE9BQU8sRUFBQyxlQUFlLEVBQUUsYUFBYSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQWMsT0FBTyxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQ3ZGLE9BQU8sRUFBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQ3BGLE9BQU8sRUFHTCxhQUFhLEVBQ2IsaUJBQWlCLEVBSWpCLFVBQVUsR0FDWCxNQUFNLGdCQUFnQixDQUFDO0FBQ3hCLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUNqRCxPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0sb0NBQW9DLENBQUM7O0FBRS9ELHNEQUFzRDtBQUN0RCxJQUFJLE1BQU0sR0FBRyxDQUFDLENBQUM7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QUFFO3NCQURMLEtBQUs7Z0JBWUYsZUFBZTtzQkFEbEIsS0FBSzt1QkFBQyxVQUFVO2dCQVdiLEtBQUs7c0JBRFIsS0FBSzt1QkFBQyxpQkFBaUI7Z0JBYXBCLFFBQVE7c0JBRFgsS0FBSzt1QkFBQyxvQkFBb0I7Z0JBYXZCLFFBQVE7c0JBRFgsS0FBSzt1QkFBQyxvQkFBb0I7Z0JBV3ZCLG1CQUFtQjtzQkFEdEIsS0FBSzt1QkFBQywrQkFBK0I7Z0JBVU4sV0FBVztzQkFBMUMsS0FBSzt1QkFBQyx1QkFBdUI7Z0JBSTFCLFdBQVc7c0JBRGQsS0FBSzt1QkFBQyx1QkFBdUI7Z0JBV1ksV0FBVztzQkFBcEQsTUFBTTt1QkFBQyx1QkFBdUI7Z0JBRzRCLE9BQU87c0JBQWpFLGVBQWU7dUJBQUMsU0FBUyxFQUFFLEVBQUMsV0FBVyxFQUFFLElBQUksRUFBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1xuICBBZnRlckNvbnRlbnRJbml0LFxuICBDaGFuZ2VEZXRlY3RvclJlZixcbiAgQ29udGVudENoaWxkcmVuLFxuICBEaXJlY3RpdmUsXG4gIEVsZW1lbnRSZWYsXG4gIGZvcndhcmRSZWYsXG4gIGluamVjdCxcbiAgSW5qZWN0RmxhZ3MsXG4gIElucHV0LFxuICBPbkRlc3Ryb3ksXG4gIE91dHB1dCxcbiAgUXVlcnlMaXN0LFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7QWN0aXZlRGVzY2VuZGFudEtleU1hbmFnZXIsIEhpZ2hsaWdodGFibGUsIExpc3RLZXlNYW5hZ2VyT3B0aW9ufSBmcm9tICdAYW5ndWxhci9jZGsvYTExeSc7XG5pbXBvcnQge0RPV05fQVJST1csIEVOVEVSLCBMRUZUX0FSUk9XLCBSSUdIVF9BUlJPVywgU1BBQ0UsIFVQX0FSUk9XfSBmcm9tICdAYW5ndWxhci9jZGsva2V5Y29kZXMnO1xuaW1wb3J0IHtCb29sZWFuSW5wdXQsIGNvZXJjZUFycmF5LCBjb2VyY2VCb29sZWFuUHJvcGVydHl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2VyY2lvbic7XG5pbXBvcnQge1NlbGVjdGlvbk1vZGVsfSBmcm9tICdAYW5ndWxhci9jZGsvY29sbGVjdGlvbnMnO1xuaW1wb3J0IHtCZWhhdmlvclN1YmplY3QsIGNvbWJpbmVMYXRlc3QsIGRlZmVyLCBtZXJnZSwgT2JzZXJ2YWJsZSwgU3ViamVjdH0gZnJvbSAncnhqcyc7XG5pbXBvcnQge2ZpbHRlciwgbWFwVG8sIHN0YXJ0V2l0aCwgc3dpdGNoTWFwLCB0YWtlLCB0YWtlVW50aWx9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7XG4gIEFic3RyYWN0Q29udHJvbCxcbiAgQ29udHJvbFZhbHVlQWNjZXNzb3IsXG4gIE5HX1ZBTElEQVRPUlMsXG4gIE5HX1ZBTFVFX0FDQ0VTU09SLFxuICBWYWxpZGF0aW9uRXJyb3JzLFxuICBWYWxpZGF0b3IsXG4gIFZhbGlkYXRvckZuLFxuICBWYWxpZGF0b3JzLFxufSBmcm9tICdAYW5ndWxhci9mb3Jtcyc7XG5pbXBvcnQge0RpcmVjdGlvbmFsaXR5fSBmcm9tICdAYW5ndWxhci9jZGsvYmlkaSc7XG5pbXBvcnQge0Nka0NvbWJvYm94fSBmcm9tICdAYW5ndWxhci9jZGstZXhwZXJpbWVudGFsL2NvbWJvYm94JztcblxuLyoqIFRoZSBuZXh0IGlkIHRvIHVzZSBmb3IgY3JlYXRpbmcgdW5pcXVlIERPTSBJRHMuICovXG5sZXQgbmV4dElkID0gMDtcblxuLy8gVE9ETyhtbWFsZXJiYSk6XG4vLyAgIC0gc2hvdWxkIGxpc3Rib3ggd3JhcCBiZSBjb25maWd1cmFibGU/XG4vLyAgIC0gc2hvdWxkIHNraXBwaW5nIGRpc2FibGVkIG9wdGlvbnMgYmUgY29uZmlndXJhYmxlP1xuXG4vKiogQSBzZWxlY3RhYmxlIG9wdGlvbiBpbiBhIGxpc3Rib3guICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbY2RrT3B0aW9uXScsXG4gIGV4cG9ydEFzOiAnY2RrT3B0aW9uJyxcbiAgaG9zdDoge1xuICAgICdyb2xlJzogJ29wdGlvbicsXG4gICAgJ2NsYXNzJzogJ2Nkay1vcHRpb24nLFxuICAgICdbaWRdJzogJ2lkJyxcbiAgICAnW2F0dHIuYXJpYS1zZWxlY3RlZF0nOiAnaXNTZWxlY3RlZCgpIHx8IG51bGwnLFxuICAgICdbYXR0ci50YWJpbmRleF0nOiAnX2dldFRhYkluZGV4KCknLFxuICAgICdbYXR0ci5hcmlhLWRpc2FibGVkXSc6ICdkaXNhYmxlZCcsXG4gICAgJ1tjbGFzcy5jZGstb3B0aW9uLWRpc2FibGVkXSc6ICdkaXNhYmxlZCcsXG4gICAgJ1tjbGFzcy5jZGstb3B0aW9uLWFjdGl2ZV0nOiAnaXNBY3RpdmUoKScsXG4gICAgJ1tjbGFzcy5jZGstb3B0aW9uLXNlbGVjdGVkXSc6ICdpc1NlbGVjdGVkKCknLFxuICAgICcoY2xpY2spJzogJ19jbGlja2VkLm5leHQoKScsXG4gICAgJyhmb2N1cyknOiAnX2hhbmRsZUZvY3VzKCknLFxuICB9LFxufSlcbmV4cG9ydCBjbGFzcyBDZGtPcHRpb248VCA9IHVua25vd24+IGltcGxlbWVudHMgTGlzdEtleU1hbmFnZXJPcHRpb24sIEhpZ2hsaWdodGFibGUsIE9uRGVzdHJveSB7XG4gIC8qKiBUaGUgaWQgb2YgdGhlIG9wdGlvbidzIGhvc3QgZWxlbWVudC4gKi9cbiAgQElucHV0KClcbiAgZ2V0IGlkKCkge1xuICAgIHJldHVybiB0aGlzLl9pZCB8fCB0aGlzLl9nZW5lcmF0ZWRJZDtcbiAgfVxuICBzZXQgaWQodmFsdWUpIHtcbiAgICB0aGlzLl9pZCA9IHZhbHVlO1xuICB9XG4gIHByaXZhdGUgX2lkOiBzdHJpbmc7XG4gIHByaXZhdGUgX2dlbmVyYXRlZElkID0gYGNkay1vcHRpb24tJHtuZXh0SWQrK31gO1xuXG4gIC8qKiBUaGUgdmFsdWUgb2YgdGhpcyBvcHRpb24uICovXG4gIEBJbnB1dCgnY2RrT3B0aW9uJykgdmFsdWU6IFQ7XG5cbiAgLyoqXG4gICAqIFRoZSB0ZXh0IHVzZWQgdG8gbG9jYXRlIHRoaXMgaXRlbSBkdXJpbmcgbGlzdGJveCB0eXBlYWhlYWQuIElmIG5vdCBzcGVjaWZpZWQsXG4gICAqIHRoZSBgdGV4dENvbnRlbnRgIG9mIHRoZSBpdGVtIHdpbGwgYmUgdXNlZC5cbiAgICovXG4gIEBJbnB1dCgnY2RrT3B0aW9uVHlwZWFoZWFkTGFiZWwnKSB0eXBlYWhlYWRMYWJlbDogc3RyaW5nO1xuXG4gIC8qKiBXaGV0aGVyIHRoaXMgb3B0aW9uIGlzIGRpc2FibGVkLiAqL1xuICBASW5wdXQoJ2Nka09wdGlvbkRpc2FibGVkJylcbiAgZ2V0IGRpc2FibGVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmxpc3Rib3guZGlzYWJsZWQgfHwgdGhpcy5fZGlzYWJsZWQ7XG4gIH1cbiAgc2V0IGRpc2FibGVkKHZhbHVlOiBCb29sZWFuSW5wdXQpIHtcbiAgICB0aGlzLl9kaXNhYmxlZCA9IGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eSh2YWx1ZSk7XG4gIH1cbiAgcHJpdmF0ZSBfZGlzYWJsZWQ6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAvKiogVGhlIHRhYmluZGV4IG9mIHRoZSBvcHRpb24gd2hlbiBpdCBpcyBlbmFibGVkLiAqL1xuICBASW5wdXQoJ3RhYmluZGV4JylcbiAgZ2V0IGVuYWJsZWRUYWJJbmRleCgpIHtcbiAgICByZXR1cm4gdGhpcy5fZW5hYmxlZFRhYkluZGV4ID09PSB1bmRlZmluZWRcbiAgICAgID8gdGhpcy5saXN0Ym94LmVuYWJsZWRUYWJJbmRleFxuICAgICAgOiB0aGlzLl9lbmFibGVkVGFiSW5kZXg7XG4gIH1cbiAgc2V0IGVuYWJsZWRUYWJJbmRleCh2YWx1ZSkge1xuICAgIHRoaXMuX2VuYWJsZWRUYWJJbmRleCA9IHZhbHVlO1xuICB9XG4gIHByaXZhdGUgX2VuYWJsZWRUYWJJbmRleD86IG51bWJlciB8IG51bGw7XG5cbiAgLyoqIFRoZSBvcHRpb24ncyBob3N0IGVsZW1lbnQgKi9cbiAgcmVhZG9ubHkgZWxlbWVudDogSFRNTEVsZW1lbnQgPSBpbmplY3QoRWxlbWVudFJlZikubmF0aXZlRWxlbWVudDtcblxuICAvKiogVGhlIHBhcmVudCBsaXN0Ym94IHRoaXMgb3B0aW9uIGJlbG9uZ3MgdG8uICovXG4gIHByb3RlY3RlZCByZWFkb25seSBsaXN0Ym94OiBDZGtMaXN0Ym94PFQ+ID0gaW5qZWN0KENka0xpc3Rib3gpO1xuXG4gIC8qKiBFbWl0cyB3aGVuIHRoZSBvcHRpb24gaXMgZGVzdHJveWVkLiAqL1xuICBwcm90ZWN0ZWQgZGVzdHJveWVkID0gbmV3IFN1YmplY3Q8dm9pZD4oKTtcblxuICAvKiogRW1pdHMgd2hlbiB0aGUgb3B0aW9uIGlzIGNsaWNrZWQuICovXG4gIHJlYWRvbmx5IF9jbGlja2VkID0gbmV3IFN1YmplY3Q8dm9pZD4oKTtcblxuICAvKiogV2hldGhlciB0aGUgb3B0aW9uIGlzIGN1cnJlbnRseSBhY3RpdmUuICovXG4gIHByaXZhdGUgX2FjdGl2ZSA9IGZhbHNlO1xuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIHRoaXMuZGVzdHJveWVkLm5leHQoKTtcbiAgICB0aGlzLmRlc3Ryb3llZC5jb21wbGV0ZSgpO1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhpcyBvcHRpb24gaXMgc2VsZWN0ZWQuICovXG4gIGlzU2VsZWN0ZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMubGlzdGJveC5pc1NlbGVjdGVkKHRoaXMudmFsdWUpO1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhpcyBvcHRpb24gaXMgYWN0aXZlLiAqL1xuICBpc0FjdGl2ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fYWN0aXZlO1xuICB9XG5cbiAgLyoqIFRvZ2dsZSB0aGUgc2VsZWN0ZWQgc3RhdGUgb2YgdGhpcyBvcHRpb24uICovXG4gIHRvZ2dsZSgpIHtcbiAgICB0aGlzLmxpc3Rib3gudG9nZ2xlKHRoaXMpO1xuICB9XG5cbiAgLyoqIFNlbGVjdCB0aGlzIG9wdGlvbiBpZiBpdCBpcyBub3Qgc2VsZWN0ZWQuICovXG4gIHNlbGVjdCgpIHtcbiAgICB0aGlzLmxpc3Rib3guc2VsZWN0KHRoaXMpO1xuICB9XG5cbiAgLyoqIERlc2VsZWN0IHRoaXMgb3B0aW9uIGlmIGl0IGlzIHNlbGVjdGVkLiAqL1xuICBkZXNlbGVjdCgpIHtcbiAgICB0aGlzLmxpc3Rib3guZGVzZWxlY3QodGhpcyk7XG4gIH1cblxuICAvKiogRm9jdXMgdGhpcyBvcHRpb24uICovXG4gIGZvY3VzKCkge1xuICAgIHRoaXMuZWxlbWVudC5mb2N1cygpO1xuICB9XG5cbiAgLyoqIEdldCB0aGUgbGFiZWwgZm9yIHRoaXMgZWxlbWVudCB3aGljaCBpcyByZXF1aXJlZCBieSB0aGUgRm9jdXNhYmxlT3B0aW9uIGludGVyZmFjZS4gKi9cbiAgZ2V0TGFiZWwoKSB7XG4gICAgcmV0dXJuICh0aGlzLnR5cGVhaGVhZExhYmVsID8/IHRoaXMuZWxlbWVudC50ZXh0Q29udGVudD8udHJpbSgpKSB8fCAnJztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgdGhlIG9wdGlvbiBhcyBhY3RpdmUuXG4gICAqIEBkb2NzLXByaXZhdGVcbiAgICovXG4gIHNldEFjdGl2ZVN0eWxlcygpIHtcbiAgICB0aGlzLl9hY3RpdmUgPSB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCB0aGUgb3B0aW9uIGFzIGluYWN0aXZlLlxuICAgKiBAZG9jcy1wcml2YXRlXG4gICAqL1xuICBzZXRJbmFjdGl2ZVN0eWxlcygpIHtcbiAgICB0aGlzLl9hY3RpdmUgPSBmYWxzZTtcbiAgfVxuXG4gIC8qKiBIYW5kbGUgZm9jdXMgZXZlbnRzIG9uIHRoZSBvcHRpb24uICovXG4gIHByb3RlY3RlZCBfaGFuZGxlRm9jdXMoKSB7XG4gICAgLy8gT3B0aW9ucyBjYW4gd2luZCB1cCBnZXR0aW5nIGZvY3VzZWQgaW4gYWN0aXZlIGRlc2NlbmRhbnQgbW9kZSBpZiB0aGUgdXNlciBjbGlja3Mgb24gdGhlbS5cbiAgICAvLyBJbiB0aGlzIGNhc2UsIHdlIHB1c2ggZm9jdXMgYmFjayB0byB0aGUgcGFyZW50IGxpc3Rib3ggdG8gcHJldmVudCBhbiBleHRyYSB0YWIgc3RvcCB3aGVuXG4gICAgLy8gdGhlIHVzZXIgcGVyZm9ybXMgYSBzaGlmdCt0YWIuXG4gICAgaWYgKHRoaXMubGlzdGJveC51c2VBY3RpdmVEZXNjZW5kYW50KSB7XG4gICAgICB0aGlzLmxpc3Rib3guX3NldEFjdGl2ZU9wdGlvbih0aGlzKTtcbiAgICAgIHRoaXMubGlzdGJveC5mb2N1cygpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBHZXQgdGhlIHRhYmluZGV4IGZvciB0aGlzIG9wdGlvbi4gKi9cbiAgcHJvdGVjdGVkIF9nZXRUYWJJbmRleCgpIHtcbiAgICBpZiAodGhpcy5saXN0Ym94LnVzZUFjdGl2ZURlc2NlbmRhbnQgfHwgdGhpcy5kaXNhYmxlZCkge1xuICAgICAgcmV0dXJuIC0xO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5pc0FjdGl2ZSgpID8gdGhpcy5lbmFibGVkVGFiSW5kZXggOiAtMTtcbiAgfVxufVxuXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbY2RrTGlzdGJveF0nLFxuICBleHBvcnRBczogJ2Nka0xpc3Rib3gnLFxuICBob3N0OiB7XG4gICAgJ3JvbGUnOiAnbGlzdGJveCcsXG4gICAgJ2NsYXNzJzogJ2Nkay1saXN0Ym94JyxcbiAgICAnW2lkXSc6ICdpZCcsXG4gICAgJ1thdHRyLnRhYmluZGV4XSc6ICdfZ2V0VGFiSW5kZXgoKScsXG4gICAgJ1thdHRyLmFyaWEtZGlzYWJsZWRdJzogJ2Rpc2FibGVkJyxcbiAgICAnW2F0dHIuYXJpYS1tdWx0aXNlbGVjdGFibGVdJzogJ211bHRpcGxlJyxcbiAgICAnW2F0dHIuYXJpYS1hY3RpdmVkZXNjZW5kYW50XSc6ICdfZ2V0QXJpYUFjdGl2ZURlc2NlbmRhbnQoKScsXG4gICAgJ1thdHRyLmFyaWEtb3JpZW50YXRpb25dJzogJ29yaWVudGF0aW9uJyxcbiAgICAnKGZvY3VzKSc6ICdfaGFuZGxlRm9jdXMoKScsXG4gICAgJyhrZXlkb3duKSc6ICdfaGFuZGxlS2V5ZG93bigkZXZlbnQpJyxcbiAgICAnKGZvY3Vzb3V0KSc6ICdfaGFuZGxlRm9jdXNPdXQoJGV2ZW50KScsXG4gIH0sXG4gIHByb3ZpZGVyczogW1xuICAgIHtcbiAgICAgIHByb3ZpZGU6IE5HX1ZBTFVFX0FDQ0VTU09SLFxuICAgICAgdXNlRXhpc3Rpbmc6IGZvcndhcmRSZWYoKCkgPT4gQ2RrTGlzdGJveCksXG4gICAgICBtdWx0aTogdHJ1ZSxcbiAgICB9LFxuICAgIHtcbiAgICAgIHByb3ZpZGU6IE5HX1ZBTElEQVRPUlMsXG4gICAgICB1c2VFeGlzdGluZzogZm9yd2FyZFJlZigoKSA9PiBDZGtMaXN0Ym94KSxcbiAgICAgIG11bHRpOiB0cnVlLFxuICAgIH0sXG4gIF0sXG59KVxuZXhwb3J0IGNsYXNzIENka0xpc3Rib3g8VCA9IHVua25vd24+XG4gIGltcGxlbWVudHMgQWZ0ZXJDb250ZW50SW5pdCwgT25EZXN0cm95LCBDb250cm9sVmFsdWVBY2Nlc3NvciwgVmFsaWRhdG9yXG57XG4gIC8qKiBUaGUgaWQgb2YgdGhlIG9wdGlvbidzIGhvc3QgZWxlbWVudC4gKi9cbiAgQElucHV0KClcbiAgZ2V0IGlkKCkge1xuICAgIHJldHVybiB0aGlzLl9pZCB8fCB0aGlzLl9nZW5lcmF0ZWRJZDtcbiAgfVxuICBzZXQgaWQodmFsdWUpIHtcbiAgICB0aGlzLl9pZCA9IHZhbHVlO1xuICB9XG4gIHByaXZhdGUgX2lkOiBzdHJpbmc7XG4gIHByaXZhdGUgX2dlbmVyYXRlZElkID0gYGNkay1saXN0Ym94LSR7bmV4dElkKyt9YDtcblxuICAvKiogVGhlIHRhYmluZGV4IHRvIHVzZSB3aGVuIHRoZSBsaXN0Ym94IGlzIGVuYWJsZWQuICovXG4gIEBJbnB1dCgndGFiaW5kZXgnKVxuICBnZXQgZW5hYmxlZFRhYkluZGV4KCkge1xuICAgIHJldHVybiB0aGlzLl9lbmFibGVkVGFiSW5kZXggPT09IHVuZGVmaW5lZCA/IDAgOiB0aGlzLl9lbmFibGVkVGFiSW5kZXg7XG4gIH1cbiAgc2V0IGVuYWJsZWRUYWJJbmRleCh2YWx1ZSkge1xuICAgIHRoaXMuX2VuYWJsZWRUYWJJbmRleCA9IHZhbHVlO1xuICB9XG4gIHByaXZhdGUgX2VuYWJsZWRUYWJJbmRleD86IG51bWJlciB8IG51bGw7XG5cbiAgLyoqIFRoZSB2YWx1ZSBzZWxlY3RlZCBpbiB0aGUgbGlzdGJveCwgcmVwcmVzZW50ZWQgYXMgYW4gYXJyYXkgb2Ygb3B0aW9uIHZhbHVlcy4gKi9cbiAgQElucHV0KCdjZGtMaXN0Ym94VmFsdWUnKVxuICBnZXQgdmFsdWUoKTogcmVhZG9ubHkgVFtdIHtcbiAgICByZXR1cm4gdGhpcy5zZWxlY3Rpb25Nb2RlbCgpLnNlbGVjdGVkO1xuICB9XG4gIHNldCB2YWx1ZSh2YWx1ZTogcmVhZG9ubHkgVFtdKSB7XG4gICAgdGhpcy5fc2V0U2VsZWN0aW9uKHZhbHVlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoZSBsaXN0Ym94IGFsbG93cyBtdWx0aXBsZSBvcHRpb25zIHRvIGJlIHNlbGVjdGVkLiBJZiB0aGUgdmFsdWUgc3dpdGNoZXMgZnJvbSBgdHJ1ZWBcbiAgICogdG8gYGZhbHNlYCwgYW5kIG1vcmUgdGhhbiBvbmUgb3B0aW9uIGlzIHNlbGVjdGVkLCBhbGwgb3B0aW9ucyBhcmUgZGVzZWxlY3RlZC5cbiAgICovXG4gIEBJbnB1dCgnY2RrTGlzdGJveE11bHRpcGxlJylcbiAgZ2V0IG11bHRpcGxlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9tdWx0aXBsZTtcbiAgfVxuICBzZXQgbXVsdGlwbGUodmFsdWU6IEJvb2xlYW5JbnB1dCkge1xuICAgIHRoaXMuX211bHRpcGxlID0gY29lcmNlQm9vbGVhblByb3BlcnR5KHZhbHVlKTtcbiAgICB0aGlzLl91cGRhdGVTZWxlY3Rpb25Nb2RlbCgpO1xuICAgIHRoaXMuX29uVmFsaWRhdG9yQ2hhbmdlKCk7XG4gIH1cbiAgcHJpdmF0ZSBfbXVsdGlwbGU6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAvKiogV2hldGhlciB0aGUgbGlzdGJveCBpcyBkaXNhYmxlZC4gKi9cbiAgQElucHV0KCdjZGtMaXN0Ym94RGlzYWJsZWQnKVxuICBnZXQgZGlzYWJsZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2Rpc2FibGVkO1xuICB9XG4gIHNldCBkaXNhYmxlZCh2YWx1ZTogQm9vbGVhbklucHV0KSB7XG4gICAgdGhpcy5fZGlzYWJsZWQgPSBjb2VyY2VCb29sZWFuUHJvcGVydHkodmFsdWUpO1xuICB9XG4gIHByaXZhdGUgX2Rpc2FibGVkOiBib29sZWFuID0gZmFsc2U7XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGxpc3Rib3ggd2lsbCB1c2UgYWN0aXZlIGRlc2NlbmRhbnQgb3Igd2lsbCBtb3ZlIGZvY3VzIG9udG8gdGhlIG9wdGlvbnMuICovXG4gIEBJbnB1dCgnY2RrTGlzdGJveFVzZUFjdGl2ZURlc2NlbmRhbnQnKVxuICBnZXQgdXNlQWN0aXZlRGVzY2VuZGFudCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fdXNlQWN0aXZlRGVzY2VuZGFudDtcbiAgfVxuICBzZXQgdXNlQWN0aXZlRGVzY2VuZGFudChzaG91bGRVc2VBY3RpdmVEZXNjZW5kYW50OiBCb29sZWFuSW5wdXQpIHtcbiAgICB0aGlzLl91c2VBY3RpdmVEZXNjZW5kYW50ID0gY29lcmNlQm9vbGVhblByb3BlcnR5KHNob3VsZFVzZUFjdGl2ZURlc2NlbmRhbnQpO1xuICB9XG4gIHByaXZhdGUgX3VzZUFjdGl2ZURlc2NlbmRhbnQ6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAvKiogVGhlIG9yaWVudGF0aW9uIG9mIHRoZSBsaXN0Ym94LiBPbmx5IGFmZmVjdHMga2V5Ym9hcmQgaW50ZXJhY3Rpb24sIG5vdCB2aXN1YWwgbGF5b3V0LiAqL1xuICBASW5wdXQoJ2Nka0xpc3Rib3hPcmllbnRhdGlvbicpIG9yaWVudGF0aW9uOiAnaG9yaXpvbnRhbCcgfCAndmVydGljYWwnID0gJ3ZlcnRpY2FsJztcblxuICAvKiogVGhlIGZ1bmN0aW9uIHVzZWQgdG8gY29tcGFyZSBvcHRpb24gdmFsdWVzLiAqL1xuICBASW5wdXQoJ2Nka0xpc3Rib3hDb21wYXJlV2l0aCcpXG4gIGdldCBjb21wYXJlV2l0aCgpOiB1bmRlZmluZWQgfCAoKG8xOiBULCBvMjogVCkgPT4gYm9vbGVhbikge1xuICAgIHJldHVybiB0aGlzLl9jb21wYXJlV2l0aDtcbiAgfVxuICBzZXQgY29tcGFyZVdpdGgoZm46IHVuZGVmaW5lZCB8ICgobzE6IFQsIG8yOiBUKSA9PiBib29sZWFuKSkge1xuICAgIHRoaXMuX2NvbXBhcmVXaXRoID0gZm47XG4gICAgdGhpcy5fdXBkYXRlU2VsZWN0aW9uTW9kZWwoKTtcbiAgfVxuICBwcml2YXRlIF9jb21wYXJlV2l0aD86IChvMTogVCwgbzI6IFQpID0+IGJvb2xlYW47XG5cbiAgLyoqIEVtaXRzIHdoZW4gdGhlIHNlbGVjdGVkIHZhbHVlKHMpIGluIHRoZSBsaXN0Ym94IGNoYW5nZS4gKi9cbiAgQE91dHB1dCgnY2RrTGlzdGJveFZhbHVlQ2hhbmdlJykgcmVhZG9ubHkgdmFsdWVDaGFuZ2UgPSBuZXcgU3ViamVjdDxMaXN0Ym94VmFsdWVDaGFuZ2VFdmVudDxUPj4oKTtcblxuICAvKiogVGhlIGNoaWxkIG9wdGlvbnMgaW4gdGhpcyBsaXN0Ym94LiAqL1xuICBAQ29udGVudENoaWxkcmVuKENka09wdGlvbiwge2Rlc2NlbmRhbnRzOiB0cnVlfSkgcHJvdGVjdGVkIG9wdGlvbnM6IFF1ZXJ5TGlzdDxDZGtPcHRpb248VD4+O1xuXG4gIC8vIFRPRE8obW1hbGVyYmEpOiBSZWZhY3RvciBTZWxlY3Rpb25Nb2RlbCBzbyB0aGF0IGl0cyBub3QgbmVjZXNzYXJ5IHRvIGNyZWF0ZSBuZXcgaW5zdGFuY2VzXG4gIC8qKiBUaGUgc2VsZWN0aW9uIG1vZGVsIHVzZWQgYnkgdGhlIGxpc3Rib3guICovXG4gIHByb3RlY3RlZCBzZWxlY3Rpb25Nb2RlbFN1YmplY3QgPSBuZXcgQmVoYXZpb3JTdWJqZWN0KFxuICAgIG5ldyBTZWxlY3Rpb25Nb2RlbDxUPih0aGlzLm11bHRpcGxlLCBbXSwgdHJ1ZSwgdGhpcy5fY29tcGFyZVdpdGgpLFxuICApO1xuXG4gIC8qKiBUaGUga2V5IG1hbmFnZXIgdGhhdCBtYW5hZ2VzIGtleWJvYXJkIG5hdmlnYXRpb24gZm9yIHRoaXMgbGlzdGJveC4gKi9cbiAgcHJvdGVjdGVkIGxpc3RLZXlNYW5hZ2VyOiBBY3RpdmVEZXNjZW5kYW50S2V5TWFuYWdlcjxDZGtPcHRpb248VD4+O1xuXG4gIC8qKiBFbWl0cyB3aGVuIHRoZSBsaXN0Ym94IGlzIGRlc3Ryb3llZC4gKi9cbiAgcHJvdGVjdGVkIHJlYWRvbmx5IGRlc3Ryb3llZCA9IG5ldyBTdWJqZWN0PHZvaWQ+KCk7XG5cbiAgLyoqIFRoZSBob3N0IGVsZW1lbnQgb2YgdGhlIGxpc3Rib3guICovXG4gIHByb3RlY3RlZCByZWFkb25seSBlbGVtZW50OiBIVE1MRWxlbWVudCA9IGluamVjdChFbGVtZW50UmVmKS5uYXRpdmVFbGVtZW50O1xuXG4gIC8qKiBUaGUgY2hhbmdlIGRldGVjdG9yIGZvciB0aGlzIGxpc3Rib3guICovXG4gIHByb3RlY3RlZCByZWFkb25seSBjaGFuZ2VEZXRlY3RvclJlZiA9IGluamVjdChDaGFuZ2VEZXRlY3RvclJlZik7XG5cbiAgLyoqIENhbGxiYWNrIGNhbGxlZCB3aGVuIHRoZSBsaXN0Ym94IGhhcyBiZWVuIHRvdWNoZWQgKi9cbiAgcHJpdmF0ZSBfb25Ub3VjaGVkID0gKCkgPT4ge307XG5cbiAgLyoqIENhbGxiYWNrIGNhbGxlZCB3aGVuIHRoZSBsaXN0Ym94IHZhbHVlIGNoYW5nZXMgKi9cbiAgcHJpdmF0ZSBfb25DaGFuZ2U6ICh2YWx1ZTogcmVhZG9ubHkgVFtdKSA9PiB2b2lkID0gKCkgPT4ge307XG5cbiAgLyoqIENhbGxiYWNrIGNhbGxlZCB3aGVuIHRoZSBmb3JtIHZhbGlkYXRvciBjaGFuZ2VzLiAqL1xuICBwcml2YXRlIF9vblZhbGlkYXRvckNoYW5nZSA9ICgpID0+IHt9O1xuXG4gIC8qKiBFbWl0cyB3aGVuIGFuIG9wdGlvbiBoYXMgYmVlbiBjbGlja2VkLiAqL1xuICBwcml2YXRlIF9vcHRpb25DbGlja2VkID0gZGVmZXIoKCkgPT5cbiAgICAodGhpcy5vcHRpb25zLmNoYW5nZXMgYXMgT2JzZXJ2YWJsZTxDZGtPcHRpb248VD5bXT4pLnBpcGUoXG4gICAgICBzdGFydFdpdGgodGhpcy5vcHRpb25zKSxcbiAgICAgIHN3aXRjaE1hcChvcHRpb25zID0+IG1lcmdlKC4uLm9wdGlvbnMubWFwKG9wdGlvbiA9PiBvcHRpb24uX2NsaWNrZWQucGlwZShtYXBUbyhvcHRpb24pKSkpKSxcbiAgICApLFxuICApO1xuXG4gIC8qKiBUaGUgZGlyZWN0aW9uYWxpdHkgb2YgdGhlIHBhZ2UuICovXG4gIHByaXZhdGUgcmVhZG9ubHkgX2RpciA9IGluamVjdChEaXJlY3Rpb25hbGl0eSwgSW5qZWN0RmxhZ3MuT3B0aW9uYWwpO1xuXG4gIC8vIFRPRE8obW1hbGVyYmEpOiBTaG91bGQgbm90IGRlcGVuZCBvbiBjb21ib2JveFxuICBwcml2YXRlIHJlYWRvbmx5IF9jb21ib2JveCA9IGluamVjdChDZGtDb21ib2JveCwgSW5qZWN0RmxhZ3MuT3B0aW9uYWwpO1xuXG4gIC8qKlxuICAgKiBWYWxpZGF0b3IgdGhhdCBwcm9kdWNlcyBhbiBlcnJvciBpZiBtdWx0aXBsZSB2YWx1ZXMgYXJlIHNlbGVjdGVkIGluIGEgc2luZ2xlIHNlbGVjdGlvblxuICAgKiBsaXN0Ym94LlxuICAgKiBAcGFyYW0gY29udHJvbCBUaGUgY29udHJvbCB0byB2YWxpZGF0ZVxuICAgKiBAcmV0dXJuIEEgdmFsaWRhdGlvbiBlcnJvciBvciBudWxsXG4gICAqL1xuICBwcml2YXRlIF92YWxpZGF0ZU11bHRpcGxlVmFsdWVzOiBWYWxpZGF0b3JGbiA9IChjb250cm9sOiBBYnN0cmFjdENvbnRyb2wpID0+IHtcbiAgICBjb25zdCBjb250cm9sVmFsdWUgPSB0aGlzLl9jb2VyY2VWYWx1ZShjb250cm9sLnZhbHVlKTtcbiAgICBpZiAoIXRoaXMubXVsdGlwbGUgJiYgY29udHJvbFZhbHVlLmxlbmd0aCA+IDEpIHtcbiAgICAgIHJldHVybiB7J2Nka0xpc3Rib3hNdWx0aXBsZVZhbHVlcyc6IHRydWV9O1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfTtcblxuICAvKipcbiAgICogVmFsaWRhdG9yIHRoYXQgcHJvZHVjZXMgYW4gZXJyb3IgaWYgYW55IHNlbGVjdGVkIHZhbHVlcyBhcmUgbm90IHZhbGlkIG9wdGlvbnMgZm9yIHRoaXMgbGlzdGJveC5cbiAgICogQHBhcmFtIGNvbnRyb2wgVGhlIGNvbnRyb2wgdG8gdmFsaWRhdGVcbiAgICogQHJldHVybiBBIHZhbGlkYXRpb24gZXJyb3Igb3IgbnVsbFxuICAgKi9cbiAgcHJpdmF0ZSBfdmFsaWRhdGVJbnZhbGlkVmFsdWVzOiBWYWxpZGF0b3JGbiA9IChjb250cm9sOiBBYnN0cmFjdENvbnRyb2wpID0+IHtcbiAgICBjb25zdCBjb250cm9sVmFsdWUgPSB0aGlzLl9jb2VyY2VWYWx1ZShjb250cm9sLnZhbHVlKTtcbiAgICBjb25zdCBpbnZhbGlkVmFsdWVzID0gdGhpcy5fZ2V0VmFsdWVzV2l0aFZhbGlkaXR5KGNvbnRyb2xWYWx1ZSwgZmFsc2UpO1xuICAgIGlmIChpbnZhbGlkVmFsdWVzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIHsnY2RrTGlzdGJveEludmFsaWRWYWx1ZXMnOiB7J3ZhbHVlcyc6IGludmFsaWRWYWx1ZXN9fTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH07XG5cbiAgLyoqIFRoZSBjb21iaW5lZCBzZXQgb2YgdmFsaWRhdG9ycyBmb3IgdGhpcyBsaXN0Ym94LiAqL1xuICBwcml2YXRlIF92YWxpZGF0b3JzID0gVmFsaWRhdG9ycy5jb21wb3NlKFtcbiAgICB0aGlzLl92YWxpZGF0ZU11bHRpcGxlVmFsdWVzLFxuICAgIHRoaXMuX3ZhbGlkYXRlSW52YWxpZFZhbHVlcyxcbiAgXSkhO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuc2VsZWN0aW9uTW9kZWxTdWJqZWN0XG4gICAgICAucGlwZShcbiAgICAgICAgc3dpdGNoTWFwKHNlbGVjdGlvbk1vZGVsID0+IHNlbGVjdGlvbk1vZGVsLmNoYW5nZWQpLFxuICAgICAgICB0YWtlVW50aWwodGhpcy5kZXN0cm95ZWQpLFxuICAgICAgKVxuICAgICAgLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgIHRoaXMuX3VwZGF0ZUludGVybmFsVmFsdWUoKTtcbiAgICAgIH0pO1xuICB9XG5cbiAgbmdBZnRlckNvbnRlbnRJbml0KCkge1xuICAgIGlmICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpIHtcbiAgICAgIHRoaXMuX3ZlcmlmeU5vT3B0aW9uVmFsdWVDb2xsaXNpb25zKCk7XG4gICAgfVxuICAgIHRoaXMuX2luaXRLZXlNYW5hZ2VyKCk7XG4gICAgdGhpcy5fY29tYm9ib3g/Ll9yZWdpc3RlckNvbnRlbnQodGhpcy5pZCwgJ2xpc3Rib3gnKTtcbiAgICB0aGlzLm9wdGlvbnMuY2hhbmdlcy5waXBlKHRha2VVbnRpbCh0aGlzLmRlc3Ryb3llZCkpLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICB0aGlzLl91cGRhdGVJbnRlcm5hbFZhbHVlKCk7XG4gICAgICB0aGlzLl9vblZhbGlkYXRvckNoYW5nZSgpO1xuICAgIH0pO1xuICAgIHRoaXMuX29wdGlvbkNsaWNrZWRcbiAgICAgIC5waXBlKFxuICAgICAgICBmaWx0ZXIob3B0aW9uID0+ICFvcHRpb24uZGlzYWJsZWQpLFxuICAgICAgICB0YWtlVW50aWwodGhpcy5kZXN0cm95ZWQpLFxuICAgICAgKVxuICAgICAgLnN1YnNjcmliZShvcHRpb24gPT4gdGhpcy5faGFuZGxlT3B0aW9uQ2xpY2tlZChvcHRpb24pKTtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIHRoaXMubGlzdEtleU1hbmFnZXIuY2hhbmdlLmNvbXBsZXRlKCk7XG4gICAgdGhpcy5kZXN0cm95ZWQubmV4dCgpO1xuICAgIHRoaXMuZGVzdHJveWVkLmNvbXBsZXRlKCk7XG4gIH1cblxuICAvKipcbiAgICogVG9nZ2xlIHRoZSBzZWxlY3RlZCBzdGF0ZSBvZiB0aGUgZ2l2ZW4gb3B0aW9uLlxuICAgKiBAcGFyYW0gb3B0aW9uIFRoZSBvcHRpb24gdG8gdG9nZ2xlXG4gICAqL1xuICB0b2dnbGUob3B0aW9uOiBDZGtPcHRpb248VD4pIHtcbiAgICB0aGlzLnRvZ2dsZVZhbHVlKG9wdGlvbi52YWx1ZSk7XG4gIH1cblxuICAvKipcbiAgICogVG9nZ2xlIHRoZSBzZWxlY3RlZCBzdGF0ZSBvZiB0aGUgZ2l2ZW4gdmFsdWUuXG4gICAqIEBwYXJhbSB2YWx1ZSBUaGUgdmFsdWUgdG8gdG9nZ2xlXG4gICAqL1xuICB0b2dnbGVWYWx1ZSh2YWx1ZTogVCkge1xuICAgIHRoaXMuc2VsZWN0aW9uTW9kZWwoKS50b2dnbGUodmFsdWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlbGVjdCB0aGUgZ2l2ZW4gb3B0aW9uLlxuICAgKiBAcGFyYW0gb3B0aW9uIFRoZSBvcHRpb24gdG8gc2VsZWN0XG4gICAqL1xuICBzZWxlY3Qob3B0aW9uOiBDZGtPcHRpb248VD4pIHtcbiAgICB0aGlzLnNlbGVjdFZhbHVlKG9wdGlvbi52YWx1ZSk7XG4gIH1cblxuICAvKipcbiAgICogU2VsZWN0IHRoZSBnaXZlbiB2YWx1ZS5cbiAgICogQHBhcmFtIHZhbHVlIFRoZSB2YWx1ZSB0byBzZWxlY3RcbiAgICovXG4gIHNlbGVjdFZhbHVlKHZhbHVlOiBUKSB7XG4gICAgdGhpcy5zZWxlY3Rpb25Nb2RlbCgpLnNlbGVjdCh2YWx1ZSk7XG4gIH1cblxuICAvKipcbiAgICogRGVzZWxlY3QgdGhlIGdpdmVuIG9wdGlvbi5cbiAgICogQHBhcmFtIG9wdGlvbiBUaGUgb3B0aW9uIHRvIGRlc2VsZWN0XG4gICAqL1xuICBkZXNlbGVjdChvcHRpb246IENka09wdGlvbjxUPikge1xuICAgIHRoaXMuZGVzZWxlY3RWYWx1ZShvcHRpb24udmFsdWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIERlc2VsZWN0IHRoZSBnaXZlbiB2YWx1ZS5cbiAgICogQHBhcmFtIHZhbHVlIFRoZSB2YWx1ZSB0byBkZXNlbGVjdFxuICAgKi9cbiAgZGVzZWxlY3RWYWx1ZSh2YWx1ZTogVCkge1xuICAgIHRoaXMuc2VsZWN0aW9uTW9kZWwoKS5kZXNlbGVjdCh2YWx1ZSk7XG4gIH1cblxuICAvKipcbiAgICogU2V0IHRoZSBzZWxlY3RlZCBzdGF0ZSBvZiBhbGwgb3B0aW9ucy5cbiAgICogQHBhcmFtIGlzU2VsZWN0ZWQgVGhlIG5ldyBzZWxlY3RlZCBzdGF0ZSB0byBzZXRcbiAgICovXG4gIHNldEFsbFNlbGVjdGVkKGlzU2VsZWN0ZWQ6IGJvb2xlYW4pIHtcbiAgICBpZiAoIWlzU2VsZWN0ZWQpIHtcbiAgICAgIHRoaXMuc2VsZWN0aW9uTW9kZWwoKS5jbGVhcigpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnNlbGVjdGlvbk1vZGVsKCkuc2VsZWN0KC4uLnRoaXMub3B0aW9ucy50b0FycmF5KCkubWFwKG9wdGlvbiA9PiBvcHRpb24udmFsdWUpKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2V0IHdoZXRoZXIgdGhlIGdpdmVuIG9wdGlvbiBpcyBzZWxlY3RlZC5cbiAgICogQHBhcmFtIG9wdGlvbiBUaGUgb3B0aW9uIHRvIGdldCB0aGUgc2VsZWN0ZWQgc3RhdGUgb2ZcbiAgICovXG4gIGlzU2VsZWN0ZWQob3B0aW9uOiBDZGtPcHRpb248VD4gfCBUKSB7XG4gICAgcmV0dXJuIHRoaXMuc2VsZWN0aW9uTW9kZWwoKS5pc1NlbGVjdGVkKG9wdGlvbiBpbnN0YW5jZW9mIENka09wdGlvbiA/IG9wdGlvbi52YWx1ZSA6IG9wdGlvbik7XG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXJzIGEgY2FsbGJhY2sgdG8gYmUgaW52b2tlZCB3aGVuIHRoZSBsaXN0Ym94J3MgdmFsdWUgY2hhbmdlcyBmcm9tIHVzZXIgaW5wdXQuXG4gICAqIEBwYXJhbSBmbiBUaGUgY2FsbGJhY2sgdG8gcmVnaXN0ZXJcbiAgICogQGRvY3MtcHJpdmF0ZVxuICAgKi9cbiAgcmVnaXN0ZXJPbkNoYW5nZShmbjogKHZhbHVlOiByZWFkb25seSBUW10pID0+IHZvaWQpOiB2b2lkIHtcbiAgICB0aGlzLl9vbkNoYW5nZSA9IGZuO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVycyBhIGNhbGxiYWNrIHRvIGJlIGludm9rZWQgd2hlbiB0aGUgbGlzdGJveCBpcyBibHVycmVkIGJ5IHRoZSB1c2VyLlxuICAgKiBAcGFyYW0gZm4gVGhlIGNhbGxiYWNrIHRvIHJlZ2lzdGVyXG4gICAqIEBkb2NzLXByaXZhdGVcbiAgICovXG4gIHJlZ2lzdGVyT25Ub3VjaGVkKGZuOiAoKSA9PiB7fSk6IHZvaWQge1xuICAgIHRoaXMuX29uVG91Y2hlZCA9IGZuO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIGxpc3Rib3gncyB2YWx1ZS5cbiAgICogQHBhcmFtIHZhbHVlIFRoZSBuZXcgdmFsdWUgb2YgdGhlIGxpc3Rib3hcbiAgICogQGRvY3MtcHJpdmF0ZVxuICAgKi9cbiAgd3JpdGVWYWx1ZSh2YWx1ZTogcmVhZG9ubHkgVFtdKTogdm9pZCB7XG4gICAgdGhpcy5fc2V0U2VsZWN0aW9uKHZhbHVlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBkaXNhYmxlZCBzdGF0ZSBvZiB0aGUgbGlzdGJveC5cbiAgICogQHBhcmFtIGlzRGlzYWJsZWQgVGhlIG5ldyBkaXNhYmxlZCBzdGF0ZVxuICAgKiBAZG9jcy1wcml2YXRlXG4gICAqL1xuICBzZXREaXNhYmxlZFN0YXRlKGlzRGlzYWJsZWQ6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLmRpc2FibGVkID0gaXNEaXNhYmxlZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBWYWxpZGF0ZSB0aGUgZ2l2ZW4gY29udHJvbFxuICAgKiBAZG9jcy1wcml2YXRlXG4gICAqL1xuICB2YWxpZGF0ZShjb250cm9sOiBBYnN0cmFjdENvbnRyb2w8YW55LCBhbnk+KTogVmFsaWRhdGlvbkVycm9ycyB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLl92YWxpZGF0b3JzKGNvbnRyb2wpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVycyBhIGNhbGxiYWNrIHRvIGJlIGNhbGxlZCB3aGVuIHRoZSBmb3JtIHZhbGlkYXRvciBjaGFuZ2VzLlxuICAgKiBAcGFyYW0gZm4gVGhlIGNhbGxiYWNrIHRvIGNhbGxcbiAgICogQGRvY3MtcHJpdmF0ZVxuICAgKi9cbiAgcmVnaXN0ZXJPblZhbGlkYXRvckNoYW5nZShmbjogKCkgPT4gdm9pZCkge1xuICAgIHRoaXMuX29uVmFsaWRhdG9yQ2hhbmdlID0gZm47XG4gIH1cblxuICAvKiogRm9jdXMgdGhlIGxpc3Rib3gncyBob3N0IGVsZW1lbnQuICovXG4gIGZvY3VzKCkge1xuICAgIHRoaXMuZWxlbWVudC5mb2N1cygpO1xuICB9XG5cbiAgLyoqIFRoZSBzZWxlY3Rpb24gbW9kZWwgdXNlZCB0byB0cmFjayB0aGUgbGlzdGJveCdzIHZhbHVlLiAqL1xuICBwcm90ZWN0ZWQgc2VsZWN0aW9uTW9kZWwoKSB7XG4gICAgcmV0dXJuIHRoaXMuc2VsZWN0aW9uTW9kZWxTdWJqZWN0LnZhbHVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFRyaWdnZXJzIHRoZSBnaXZlbiBvcHRpb24gaW4gcmVzcG9uc2UgdG8gdXNlciBpbnRlcmFjdGlvbi5cbiAgICogLSBJbiBzaW5nbGUgc2VsZWN0aW9uIG1vZGU6IHNlbGVjdHMgdGhlIG9wdGlvbiBhbmQgZGVzZWxlY3RzIGFueSBvdGhlciBzZWxlY3RlZCBvcHRpb24uXG4gICAqIC0gSW4gbXVsdGkgc2VsZWN0aW9uIG1vZGU6IHRvZ2dsZXMgdGhlIHNlbGVjdGVkIHN0YXRlIG9mIHRoZSBvcHRpb24uXG4gICAqIEBwYXJhbSBvcHRpb24gVGhlIG9wdGlvbiB0byB0cmlnZ2VyXG4gICAqL1xuICBwcm90ZWN0ZWQgdHJpZ2dlck9wdGlvbihvcHRpb246IENka09wdGlvbjxUPiB8IG51bGwpIHtcbiAgICBpZiAob3B0aW9uICYmICFvcHRpb24uZGlzYWJsZWQpIHtcbiAgICAgIGxldCBjaGFuZ2VkID0gZmFsc2U7XG4gICAgICB0aGlzLnNlbGVjdGlvbk1vZGVsKClcbiAgICAgICAgLmNoYW5nZWQucGlwZSh0YWtlKDEpLCB0YWtlVW50aWwodGhpcy5kZXN0cm95ZWQpKVxuICAgICAgICAuc3Vic2NyaWJlKCgpID0+IChjaGFuZ2VkID0gdHJ1ZSkpO1xuICAgICAgaWYgKHRoaXMubXVsdGlwbGUpIHtcbiAgICAgICAgdGhpcy50b2dnbGUob3B0aW9uKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuc2VsZWN0KG9wdGlvbik7XG4gICAgICB9XG4gICAgICBpZiAoY2hhbmdlZCkge1xuICAgICAgICB0aGlzLl9vbkNoYW5nZSh0aGlzLnZhbHVlKTtcbiAgICAgICAgdGhpcy52YWx1ZUNoYW5nZS5uZXh0KHtcbiAgICAgICAgICB2YWx1ZTogdGhpcy52YWx1ZSxcbiAgICAgICAgICBsaXN0Ym94OiB0aGlzLFxuICAgICAgICAgIG9wdGlvbjogb3B0aW9uLFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgZ2l2ZW4gb3B0aW9uIGFzIGFjdGl2ZS5cbiAgICogQHBhcmFtIG9wdGlvbiBUaGUgb3B0aW9uIHRvIG1ha2UgYWN0aXZlXG4gICAqL1xuICBfc2V0QWN0aXZlT3B0aW9uKG9wdGlvbjogQ2RrT3B0aW9uPFQ+KSB7XG4gICAgdGhpcy5saXN0S2V5TWFuYWdlci5zZXRBY3RpdmVJdGVtKG9wdGlvbik7XG4gIH1cblxuICAvKiogQ2FsbGVkIHdoZW4gdGhlIGxpc3Rib3ggcmVjZWl2ZXMgZm9jdXMuICovXG4gIHByb3RlY3RlZCBfaGFuZGxlRm9jdXMoKSB7XG4gICAgaWYgKCF0aGlzLnVzZUFjdGl2ZURlc2NlbmRhbnQpIHtcbiAgICAgIHRoaXMubGlzdEtleU1hbmFnZXIuc2V0TmV4dEl0ZW1BY3RpdmUoKTtcbiAgICAgIHRoaXMuX2ZvY3VzQWN0aXZlT3B0aW9uKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIENhbGxlZCB3aGVuIHRoZSB1c2VyIHByZXNzZXMga2V5ZG93biBvbiB0aGUgbGlzdGJveC4gKi9cbiAgcHJvdGVjdGVkIF9oYW5kbGVLZXlkb3duKGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XG4gICAgaWYgKHRoaXMuX2Rpc2FibGVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qge2tleUNvZGV9ID0gZXZlbnQ7XG4gICAgY29uc3QgcHJldmlvdXNBY3RpdmVJbmRleCA9IHRoaXMubGlzdEtleU1hbmFnZXIuYWN0aXZlSXRlbUluZGV4O1xuXG4gICAgaWYgKGtleUNvZGUgPT09IFNQQUNFIHx8IGtleUNvZGUgPT09IEVOVEVSKSB7XG4gICAgICB0aGlzLnRyaWdnZXJPcHRpb24odGhpcy5saXN0S2V5TWFuYWdlci5hY3RpdmVJdGVtKTtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubGlzdEtleU1hbmFnZXIub25LZXlkb3duKGV2ZW50KTtcbiAgICB9XG5cbiAgICAvKiogV2lsbCBzZWxlY3QgYW4gb3B0aW9uIGlmIHNoaWZ0IHdhcyBwcmVzc2VkIHdoaWxlIG5hdmlnYXRpbmcgdG8gdGhlIG9wdGlvbiAqL1xuICAgIGNvbnN0IGlzQXJyb3cgPVxuICAgICAga2V5Q29kZSA9PT0gVVBfQVJST1cgfHxcbiAgICAgIGtleUNvZGUgPT09IERPV05fQVJST1cgfHxcbiAgICAgIGtleUNvZGUgPT09IExFRlRfQVJST1cgfHxcbiAgICAgIGtleUNvZGUgPT09IFJJR0hUX0FSUk9XO1xuICAgIGlmIChpc0Fycm93ICYmIGV2ZW50LnNoaWZ0S2V5ICYmIHByZXZpb3VzQWN0aXZlSW5kZXggIT09IHRoaXMubGlzdEtleU1hbmFnZXIuYWN0aXZlSXRlbUluZGV4KSB7XG4gICAgICB0aGlzLnRyaWdnZXJPcHRpb24odGhpcy5saXN0S2V5TWFuYWdlci5hY3RpdmVJdGVtKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gdGhlIGZvY3VzIGxlYXZlcyBhbiBlbGVtZW50IGluIHRoZSBsaXN0Ym94LlxuICAgKiBAcGFyYW0gZXZlbnQgVGhlIGZvY3Vzb3V0IGV2ZW50XG4gICAqL1xuICBwcm90ZWN0ZWQgX2hhbmRsZUZvY3VzT3V0KGV2ZW50OiBGb2N1c0V2ZW50KSB7XG4gICAgY29uc3Qgb3RoZXJFbGVtZW50ID0gZXZlbnQucmVsYXRlZFRhcmdldCBhcyBFbGVtZW50O1xuICAgIGlmICh0aGlzLmVsZW1lbnQgIT09IG90aGVyRWxlbWVudCAmJiAhdGhpcy5lbGVtZW50LmNvbnRhaW5zKG90aGVyRWxlbWVudCkpIHtcbiAgICAgIHRoaXMuX29uVG91Y2hlZCgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBHZXQgdGhlIGlkIG9mIHRoZSBhY3RpdmUgb3B0aW9uIGlmIGFjdGl2ZSBkZXNjZW5kYW50IGlzIGJlaW5nIHVzZWQuICovXG4gIHByb3RlY3RlZCBfZ2V0QXJpYUFjdGl2ZURlc2NlbmRhbnQoKTogc3RyaW5nIHwgbnVsbCB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIHRoaXMuX3VzZUFjdGl2ZURlc2NlbmRhbnQgPyB0aGlzLmxpc3RLZXlNYW5hZ2VyPy5hY3RpdmVJdGVtPy5pZCA6IG51bGw7XG4gIH1cblxuICAvKiogR2V0IHRoZSB0YWJpbmRleCBmb3IgdGhlIGxpc3Rib3guICovXG4gIHByb3RlY3RlZCBfZ2V0VGFiSW5kZXgoKSB7XG4gICAgaWYgKHRoaXMuZGlzYWJsZWQpIHtcbiAgICAgIHJldHVybiAtMTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMudXNlQWN0aXZlRGVzY2VuZGFudCB8fCAhdGhpcy5saXN0S2V5TWFuYWdlci5hY3RpdmVJdGVtID8gdGhpcy5lbmFibGVkVGFiSW5kZXggOiAtMTtcbiAgfVxuXG4gIC8qKiBJbml0aWFsaXplIHRoZSBrZXkgbWFuYWdlci4gKi9cbiAgcHJpdmF0ZSBfaW5pdEtleU1hbmFnZXIoKSB7XG4gICAgdGhpcy5saXN0S2V5TWFuYWdlciA9IG5ldyBBY3RpdmVEZXNjZW5kYW50S2V5TWFuYWdlcih0aGlzLm9wdGlvbnMpXG4gICAgICAud2l0aFdyYXAoKVxuICAgICAgLndpdGhUeXBlQWhlYWQoKVxuICAgICAgLndpdGhIb21lQW5kRW5kKClcbiAgICAgIC53aXRoQWxsb3dlZE1vZGlmaWVyS2V5cyhbJ3NoaWZ0S2V5J10pO1xuXG4gICAgaWYgKHRoaXMub3JpZW50YXRpb24gPT09ICd2ZXJ0aWNhbCcpIHtcbiAgICAgIHRoaXMubGlzdEtleU1hbmFnZXIud2l0aFZlcnRpY2FsT3JpZW50YXRpb24oKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5saXN0S2V5TWFuYWdlci53aXRoSG9yaXpvbnRhbE9yaWVudGF0aW9uKHRoaXMuX2Rpcj8udmFsdWUgfHwgJ2x0cicpO1xuICAgIH1cblxuICAgIHRoaXMubGlzdEtleU1hbmFnZXIuY2hhbmdlXG4gICAgICAucGlwZSh0YWtlVW50aWwodGhpcy5kZXN0cm95ZWQpKVxuICAgICAgLnN1YnNjcmliZSgoKSA9PiB0aGlzLl9mb2N1c0FjdGl2ZU9wdGlvbigpKTtcbiAgfVxuXG4gIC8vIFRPRE8obW1hbGVyYmEpOiBTaG91bGQgbm90IGRlcGVuZCBvbiBjb21ib2JveC5cbiAgcHJpdmF0ZSBfdXBkYXRlUGFuZWxGb3JTZWxlY3Rpb24ob3B0aW9uOiBDZGtPcHRpb248VD4pIHtcbiAgICBpZiAodGhpcy5fY29tYm9ib3gpIHtcbiAgICAgIGlmICghdGhpcy5tdWx0aXBsZSkge1xuICAgICAgICB0aGlzLl9jb21ib2JveC51cGRhdGVBbmRDbG9zZShvcHRpb24uaXNTZWxlY3RlZCgpID8gb3B0aW9uLnZhbHVlIDogW10pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fY29tYm9ib3gudXBkYXRlQW5kQ2xvc2UodGhpcy52YWx1ZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqIFVwZGF0ZSB0aGUgc2VsZWN0aW9uIG1vZGUgd2hlbiB0aGUgJ211bHRpcGxlJyBwcm9wZXJ0eSBjaGFuZ2VzLiAqL1xuICBwcml2YXRlIF91cGRhdGVTZWxlY3Rpb25Nb2RlbCgpIHtcbiAgICB0aGlzLnNlbGVjdGlvbk1vZGVsU3ViamVjdC5uZXh0KFxuICAgICAgbmV3IFNlbGVjdGlvbk1vZGVsKFxuICAgICAgICB0aGlzLm11bHRpcGxlLFxuICAgICAgICAhdGhpcy5tdWx0aXBsZSAmJiB0aGlzLnZhbHVlLmxlbmd0aCA+IDEgPyBbXSA6IHRoaXMudmFsdWUuc2xpY2UoKSxcbiAgICAgICAgdHJ1ZSxcbiAgICAgICAgdGhpcy5fY29tcGFyZVdpdGgsXG4gICAgICApLFxuICAgICk7XG4gIH1cblxuICAvKiogRm9jdXMgdGhlIGFjdGl2ZSBvcHRpb24uICovXG4gIHByaXZhdGUgX2ZvY3VzQWN0aXZlT3B0aW9uKCkge1xuICAgIGlmICghdGhpcy51c2VBY3RpdmVEZXNjZW5kYW50KSB7XG4gICAgICB0aGlzLmxpc3RLZXlNYW5hZ2VyLmFjdGl2ZUl0ZW0/LmZvY3VzKCk7XG4gICAgfVxuICAgIHRoaXMuY2hhbmdlRGV0ZWN0b3JSZWYubWFya0ZvckNoZWNrKCk7XG4gIH1cblxuICAvKipcbiAgICogU2V0IHRoZSBzZWxlY3RlZCB2YWx1ZXMuXG4gICAqIEBwYXJhbSB2YWx1ZSBUaGUgbGlzdCBvZiBuZXcgc2VsZWN0ZWQgdmFsdWVzLlxuICAgKi9cbiAgcHJpdmF0ZSBfc2V0U2VsZWN0aW9uKHZhbHVlOiByZWFkb25seSBUW10pIHtcbiAgICBjb25zdCBjb2VyY2VkVmFsdWUgPSB0aGlzLl9jb2VyY2VWYWx1ZSh2YWx1ZSk7XG4gICAgdGhpcy5zZWxlY3Rpb25Nb2RlbCgpLnNldFNlbGVjdGlvbihcbiAgICAgIC4uLighdGhpcy5tdWx0aXBsZSAmJiBjb2VyY2VkVmFsdWUubGVuZ3RoID4gMVxuICAgICAgICA/IFtdXG4gICAgICAgIDogdGhpcy5fZ2V0VmFsdWVzV2l0aFZhbGlkaXR5KGNvZXJjZWRWYWx1ZSwgdHJ1ZSkpLFxuICAgICk7XG4gIH1cblxuICAvKiogVXBkYXRlIHRoZSBpbnRlcm5hbCB2YWx1ZSBvZiB0aGUgbGlzdGJveCBiYXNlZCBvbiB0aGUgc2VsZWN0aW9uIG1vZGVsLiAqL1xuICBwcml2YXRlIF91cGRhdGVJbnRlcm5hbFZhbHVlKCkge1xuICAgIGNvbnN0IGluZGV4Q2FjaGUgPSBuZXcgTWFwPFQsIG51bWJlcj4oKTtcbiAgICAvLyBDaGVjayBpZiB3ZSBuZWVkIHRvIHJlbW92ZSBhbnkgdmFsdWVzIGR1ZSB0byB0aGVtIGJlY29taW5nIGludmFsaWRcbiAgICAvLyAoZS5nLiBpZiB0aGUgb3B0aW9uIHdhcyByZW1vdmVkIGZyb20gdGhlIERPTS4pXG4gICAgY29uc3Qgc2VsZWN0ZWQgPSB0aGlzLnNlbGVjdGlvbk1vZGVsKCkuc2VsZWN0ZWQ7XG4gICAgY29uc3QgdmFsaWRTZWxlY3RlZCA9IHRoaXMuX2dldFZhbHVlc1dpdGhWYWxpZGl0eShzZWxlY3RlZCwgdHJ1ZSk7XG4gICAgaWYgKHZhbGlkU2VsZWN0ZWQubGVuZ3RoICE9IHNlbGVjdGVkLmxlbmd0aCkge1xuICAgICAgdGhpcy5zZWxlY3Rpb25Nb2RlbCgpLnNldFNlbGVjdGlvbiguLi52YWxpZFNlbGVjdGVkKTtcbiAgICB9XG4gICAgdGhpcy5zZWxlY3Rpb25Nb2RlbCgpLnNvcnQoKGE6IFQsIGI6IFQpID0+IHtcbiAgICAgIGNvbnN0IGFJbmRleCA9IHRoaXMuX2dldEluZGV4Rm9yVmFsdWUoaW5kZXhDYWNoZSwgYSk7XG4gICAgICBjb25zdCBiSW5kZXggPSB0aGlzLl9nZXRJbmRleEZvclZhbHVlKGluZGV4Q2FjaGUsIGIpO1xuICAgICAgcmV0dXJuIGFJbmRleCAtIGJJbmRleDtcbiAgICB9KTtcbiAgICB0aGlzLmNoYW5nZURldGVjdG9yUmVmLm1hcmtGb3JDaGVjaygpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIGluZGV4IG9mIHRoZSBnaXZlbiB2YWx1ZSBpbiB0aGUgZ2l2ZW4gbGlzdCBvZiBvcHRpb25zLlxuICAgKiBAcGFyYW0gY2FjaGUgVGhlIGNhY2hlIG9mIGluZGljZXMgZm91bmQgc28gZmFyXG4gICAqIEBwYXJhbSB2YWx1ZSBUaGUgdmFsdWUgdG8gZmluZFxuICAgKiBAcmV0dXJuIFRoZSBpbmRleCBvZiB0aGUgdmFsdWUgaW4gdGhlIG9wdGlvbnMgbGlzdFxuICAgKi9cbiAgcHJpdmF0ZSBfZ2V0SW5kZXhGb3JWYWx1ZShjYWNoZTogTWFwPFQsIG51bWJlcj4sIHZhbHVlOiBUKSB7XG4gICAgY29uc3QgaXNFcXVhbCA9IHRoaXMuY29tcGFyZVdpdGggfHwgT2JqZWN0LmlzO1xuICAgIGlmICghY2FjaGUuaGFzKHZhbHVlKSkge1xuICAgICAgbGV0IGluZGV4ID0gLTE7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMub3B0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoaXNFcXVhbCh2YWx1ZSwgdGhpcy5vcHRpb25zLmdldChpKSEudmFsdWUpKSB7XG4gICAgICAgICAgaW5kZXggPSBpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBjYWNoZS5zZXQodmFsdWUsIGluZGV4KTtcbiAgICB9XG4gICAgcmV0dXJuIGNhY2hlLmdldCh2YWx1ZSkhO1xuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZSB0aGUgdXNlciBjbGlja2luZyBhbiBvcHRpb24uXG4gICAqIEBwYXJhbSBvcHRpb24gVGhlIG9wdGlvbiB0aGF0IHdhcyBjbGlja2VkLlxuICAgKi9cbiAgcHJpdmF0ZSBfaGFuZGxlT3B0aW9uQ2xpY2tlZChvcHRpb246IENka09wdGlvbjxUPikge1xuICAgIHRoaXMubGlzdEtleU1hbmFnZXIuc2V0QWN0aXZlSXRlbShvcHRpb24pO1xuICAgIHRoaXMudHJpZ2dlck9wdGlvbihvcHRpb24pO1xuICAgIHRoaXMuX3VwZGF0ZVBhbmVsRm9yU2VsZWN0aW9uKG9wdGlvbik7XG4gIH1cblxuICAvKiogVmVyaWZpZXMgdGhhdCBubyB0d28gb3B0aW9ucyByZXByZXNlbnQgdGhlIHNhbWUgdmFsdWUgdW5kZXIgdGhlIGNvbXBhcmVXaXRoIGZ1bmN0aW9uLiAqL1xuICBwcml2YXRlIF92ZXJpZnlOb09wdGlvblZhbHVlQ29sbGlzaW9ucygpIHtcbiAgICBjb21iaW5lTGF0ZXN0KFtcbiAgICAgIHRoaXMuc2VsZWN0aW9uTW9kZWxTdWJqZWN0LFxuICAgICAgdGhpcy5vcHRpb25zLmNoYW5nZXMucGlwZShzdGFydFdpdGgodGhpcy5vcHRpb25zKSksXG4gICAgXSkuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgIGNvbnN0IGlzRXF1YWwgPSB0aGlzLmNvbXBhcmVXaXRoID8/IE9iamVjdC5pcztcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5vcHRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IG9wdGlvbiA9IHRoaXMub3B0aW9ucy5nZXQoaSkhO1xuICAgICAgICBsZXQgZHVwbGljYXRlOiBDZGtPcHRpb248VD4gfCBudWxsID0gbnVsbDtcbiAgICAgICAgZm9yIChsZXQgaiA9IGkgKyAxOyBqIDwgdGhpcy5vcHRpb25zLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgY29uc3Qgb3RoZXIgPSB0aGlzLm9wdGlvbnMuZ2V0KGopITtcbiAgICAgICAgICBpZiAoaXNFcXVhbChvcHRpb24udmFsdWUsIG90aGVyLnZhbHVlKSkge1xuICAgICAgICAgICAgZHVwbGljYXRlID0gb3RoZXI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGR1cGxpY2F0ZSkge1xuICAgICAgICAgIC8vIFRPRE8obW1hbGVyYmEpOiBMaW5rIHRvIGRvY3MgYWJvdXQgdGhpcy5cbiAgICAgICAgICBpZiAodGhpcy5jb21wYXJlV2l0aCkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICAgICAgICBgRm91bmQgbXVsdGlwbGUgQ2RrT3B0aW9uIHJlcHJlc2VudGluZyB0aGUgc2FtZSB2YWx1ZSB1bmRlciB0aGUgZ2l2ZW4gY29tcGFyZVdpdGggZnVuY3Rpb25gLFxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgb3B0aW9uMTogb3B0aW9uLmVsZW1lbnQsXG4gICAgICAgICAgICAgICAgb3B0aW9uMjogZHVwbGljYXRlLmVsZW1lbnQsXG4gICAgICAgICAgICAgICAgY29tcGFyZVdpdGg6IHRoaXMuY29tcGFyZVdpdGgsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYEZvdW5kIG11bHRpcGxlIENka09wdGlvbiB3aXRoIHRoZSBzYW1lIHZhbHVlYCwge1xuICAgICAgICAgICAgICBvcHRpb24xOiBvcHRpb24uZWxlbWVudCxcbiAgICAgICAgICAgICAgb3B0aW9uMjogZHVwbGljYXRlLmVsZW1lbnQsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQ29lcmNlcyBhIHZhbHVlIGludG8gYW4gYXJyYXkgcmVwcmVzZW50aW5nIGEgbGlzdGJveCBzZWxlY3Rpb24uXG4gICAqIEBwYXJhbSB2YWx1ZSBUaGUgdmFsdWUgdG8gY29lcmNlXG4gICAqIEByZXR1cm4gQW4gYXJyYXlcbiAgICovXG4gIHByaXZhdGUgX2NvZXJjZVZhbHVlKHZhbHVlOiByZWFkb25seSBUW10pIHtcbiAgICByZXR1cm4gdmFsdWUgPT0gbnVsbCA/IFtdIDogY29lcmNlQXJyYXkodmFsdWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgc3VibGlzdCBvZiB2YWx1ZXMgd2l0aCB0aGUgZ2l2ZW4gdmFsaWRpdHkuXG4gICAqIEBwYXJhbSB2YWx1ZXMgVGhlIGxpc3Qgb2YgdmFsdWVzXG4gICAqIEBwYXJhbSB2YWxpZCBXaGV0aGVyIHRvIGdldCB2YWxpZCB2YWx1ZXNcbiAgICogQHJldHVybiBUaGUgc3VibGlzdCBvZiB2YWx1ZXMgd2l0aCB0aGUgcmVxdWVzdGVkIHZhbGlkaXR5XG4gICAqL1xuICBwcml2YXRlIF9nZXRWYWx1ZXNXaXRoVmFsaWRpdHkodmFsdWVzOiByZWFkb25seSBUW10sIHZhbGlkOiBib29sZWFuKSB7XG4gICAgY29uc3QgaXNFcXVhbCA9IHRoaXMuY29tcGFyZVdpdGggfHwgT2JqZWN0LmlzO1xuICAgIGNvbnN0IHZhbGlkVmFsdWVzID0gKHRoaXMub3B0aW9ucyB8fCBbXSkubWFwKG9wdGlvbiA9PiBvcHRpb24udmFsdWUpO1xuICAgIHJldHVybiB2YWx1ZXMuZmlsdGVyKFxuICAgICAgdmFsdWUgPT4gdmFsaWQgPT09IHZhbGlkVmFsdWVzLnNvbWUodmFsaWRWYWx1ZSA9PiBpc0VxdWFsKHZhbHVlLCB2YWxpZFZhbHVlKSksXG4gICAgKTtcbiAgfVxufVxuXG4vKiogQ2hhbmdlIGV2ZW50IHRoYXQgaXMgZmlyZWQgd2hlbmV2ZXIgdGhlIHZhbHVlIG9mIHRoZSBsaXN0Ym94IGNoYW5nZXMuICovXG5leHBvcnQgaW50ZXJmYWNlIExpc3Rib3hWYWx1ZUNoYW5nZUV2ZW50PFQ+IHtcbiAgLyoqIFRoZSBuZXcgdmFsdWUgb2YgdGhlIGxpc3Rib3guICovXG4gIHJlYWRvbmx5IHZhbHVlOiByZWFkb25seSBUW107XG5cbiAgLyoqIFJlZmVyZW5jZSB0byB0aGUgbGlzdGJveCB0aGF0IGVtaXR0ZWQgdGhlIGV2ZW50LiAqL1xuICByZWFkb25seSBsaXN0Ym94OiBDZGtMaXN0Ym94PFQ+O1xuXG4gIC8qKiBSZWZlcmVuY2UgdG8gdGhlIG9wdGlvbiB0aGF0IHdhcyB0cmlnZ2VyZWQuICovXG4gIHJlYWRvbmx5IG9wdGlvbjogQ2RrT3B0aW9uPFQ+O1xufVxuIl19