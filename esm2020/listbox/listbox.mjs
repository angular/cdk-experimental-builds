/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ChangeDetectorRef, ContentChildren, Directive, ElementRef, forwardRef, inject, InjectFlags, Input, Output, QueryList, } from '@angular/core';
import { ActiveDescendantKeyManager } from '@angular/cdk/a11y';
import { A, DOWN_ARROW, END, ENTER, hasModifierKey, HOME, LEFT_ARROW, RIGHT_ARROW, SPACE, UP_ARROW, } from '@angular/cdk/keycodes';
import { coerceArray, coerceBooleanProperty } from '@angular/cdk/coercion';
import { SelectionModel } from '@angular/cdk/collections';
import { defer, merge, Subject } from 'rxjs';
import { filter, map, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { NG_VALIDATORS, NG_VALUE_ACCESSOR, Validators, } from '@angular/forms';
import { Directionality } from '@angular/cdk/bidi';
import * as i0 from "@angular/core";
/** The next id to use for creating unique DOM IDs. */
let nextId = 0;
/**
 * An implementation of SelectionModel that internally always represents the selection as a
 * multi-selection. This is necessary so that we can recover the full selection if the user
 * switches the listbox from single-selection to multi-selection after initialization.
 *
 * This selection model may report multiple selected values, even if it is in single-selection
 * mode. It is up to the user (CdkListbox) to check for invalid selections.
 */
class ListboxSelectionModel extends SelectionModel {
    constructor(multiple = false, initiallySelectedValues, emitChanges = true, compareWith) {
        super(true, initiallySelectedValues, emitChanges, compareWith);
        this.multiple = multiple;
    }
    isMultipleSelection() {
        return this.multiple;
    }
    select(...values) {
        // The super class is always in multi-selection mode, so we need to override the behavior if
        // this selection model actually belongs to a single-selection listbox.
        if (this.multiple) {
            return super.select(...values);
        }
        else {
            return super.setSelection(...values);
        }
    }
}
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
        return this.listbox.isSelected(this);
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
CdkOption.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.0.1", type: CdkOption, selector: "[cdkOption]", inputs: { id: "id", value: ["cdkOption", "value"], typeaheadLabel: ["cdkOptionTypeaheadLabel", "typeaheadLabel"], disabled: ["cdkOptionDisabled", "disabled"], enabledTabIndex: ["tabindex", "enabledTabIndex"] }, host: { attributes: { "role": "option" }, listeners: { "click": "_clicked.next($event)", "focus": "_handleFocus()" }, properties: { "id": "id", "attr.aria-selected": "isSelected() || null", "attr.tabindex": "_getTabIndex()", "attr.aria-disabled": "disabled || null", "class.cdk-option-active": "isActive()" }, classAttribute: "cdk-option" }, exportAs: ["cdkOption"], ngImport: i0 });
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
                        '[attr.aria-disabled]': 'disabled || null',
                        '[class.cdk-option-active]': 'isActive()',
                        '(click)': '_clicked.next($event)',
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
        this._disabled = false;
        this._useActiveDescendant = false;
        this._orientation = 'vertical';
        this._navigationWrapDisabled = false;
        this._navigateDisabledOptions = false;
        /** Emits when the selected value(s) in the listbox change. */
        this.valueChange = new Subject();
        /** The selection model used by the listbox. */
        this.selectionModel = new ListboxSelectionModel();
        /** Emits when the listbox is destroyed. */
        this.destroyed = new Subject();
        /** The host element of the listbox. */
        this.element = inject(ElementRef).nativeElement;
        /** The change detector for this listbox. */
        this.changeDetectorRef = inject(ChangeDetectorRef);
        /** Whether the currently selected value in the selection model is invalid. */
        this._invalid = false;
        /** The last user-triggered option. */
        this._lastTriggered = null;
        /** Callback called when the listbox has been touched */
        this._onTouched = () => { };
        /** Callback called when the listbox value changes */
        this._onChange = () => { };
        /** Callback called when the form validator changes. */
        this._onValidatorChange = () => { };
        /** Emits when an option has been clicked. */
        this._optionClicked = defer(() => this.options.changes.pipe(startWith(this.options), switchMap(options => merge(...options.map(option => option._clicked.pipe(map(event => ({ option, event }))))))));
        /** The directionality of the page. */
        this._dir = inject(Directionality, InjectFlags.Optional);
        /** A predicate that skips disabled options. */
        this._skipDisabledPredicate = (option) => option.disabled;
        /** A predicate that does not skip any options. */
        this._skipNonePredicate = () => false;
        /**
         * Validator that produces an error if multiple values are selected in a single selection
         * listbox.
         * @param control The control to validate
         * @return A validation error or null
         */
        this._validateUnexpectedMultipleValues = (control) => {
            const controlValue = this._coerceValue(control.value);
            if (!this.multiple && controlValue.length > 1) {
                return { 'cdkListboxUnexpectedMultipleValues': true };
            }
            return null;
        };
        /**
         * Validator that produces an error if any selected values are not valid options for this listbox.
         * @param control The control to validate
         * @return A validation error or null
         */
        this._validateUnexpectedOptionValues = (control) => {
            const controlValue = this._coerceValue(control.value);
            const invalidValues = this._getInvalidOptionValues(controlValue);
            if (invalidValues.length) {
                return { 'cdkListboxUnexpectedOptionValues': { 'values': invalidValues } };
            }
            return null;
        };
        /** The combined set of validators for this listbox. */
        this._validators = Validators.compose([
            this._validateUnexpectedMultipleValues,
            this._validateUnexpectedOptionValues,
        ]);
        // Update the internal value whenever the selection model's selection changes.
        this.selectionModel.changed.pipe(startWith(null), takeUntil(this.destroyed)).subscribe(() => {
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
        return this._invalid ? [] : this.selectionModel.selected;
    }
    set value(value) {
        this._setSelection(value);
    }
    /**
     * Whether the listbox allows multiple options to be selected. If the value switches from `true`
     * to `false`, and more than one option is selected, all options are deselected.
     */
    get multiple() {
        return this.selectionModel.multiple;
    }
    set multiple(value) {
        this.selectionModel.multiple = coerceBooleanProperty(value);
        this._updateInternalValue();
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
    /** The orientation of the listbox. Only affects keyboard interaction, not visual layout. */
    get orientation() {
        return this._orientation;
    }
    set orientation(value) {
        this._orientation = value === 'horizontal' ? 'horizontal' : 'vertical';
        if (value === 'horizontal') {
            this.listKeyManager?.withHorizontalOrientation(this._dir?.value || 'ltr');
        }
        else {
            this.listKeyManager?.withVerticalOrientation();
        }
    }
    /** The function used to compare option values. */
    get compareWith() {
        return this.selectionModel.compareWith;
    }
    set compareWith(fn) {
        this.selectionModel.compareWith = fn;
    }
    /**
     * Whether the keyboard navigation should wrap when the user presses arrow down on the last item
     * or arrow up on the first item.
     */
    get navigationWrapDisabled() {
        return this._navigationWrapDisabled;
    }
    set navigationWrapDisabled(wrap) {
        this._navigationWrapDisabled = coerceBooleanProperty(wrap);
        this.listKeyManager?.withWrap(!this._navigationWrapDisabled);
    }
    /** Whether keyboard navigation should skip over disabled items. */
    get navigateDisabledOptions() {
        return this._navigateDisabledOptions;
    }
    set navigateDisabledOptions(skip) {
        this._navigateDisabledOptions = coerceBooleanProperty(skip);
        this.listKeyManager?.skipPredicate(this._navigateDisabledOptions ? this._skipNonePredicate : this._skipDisabledPredicate);
    }
    ngAfterContentInit() {
        if (typeof ngDevMode === 'undefined' || ngDevMode) {
            this._verifyNoOptionValueCollisions();
        }
        this._initKeyManager();
        // Update the internal value whenever the options change, as this may change the validity of
        // the current selection
        this.options.changes.pipe(startWith(this.options), takeUntil(this.destroyed)).subscribe(() => {
            this._updateInternalValue();
        });
        this._optionClicked
            .pipe(filter(({ option }) => !option.disabled), takeUntil(this.destroyed))
            .subscribe(({ option, event }) => this._handleOptionClicked(option, event));
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
        if (this._invalid) {
            this.selectionModel.clear(false);
        }
        this.selectionModel.toggle(value);
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
        if (this._invalid) {
            this.selectionModel.clear(false);
        }
        this.selectionModel.select(value);
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
        if (this._invalid) {
            this.selectionModel.clear(false);
        }
        this.selectionModel.deselect(value);
    }
    /**
     * Set the selected state of all options.
     * @param isSelected The new selected state to set
     */
    setAllSelected(isSelected) {
        if (!isSelected) {
            this.selectionModel.clear();
        }
        else {
            if (this._invalid) {
                this.selectionModel.clear(false);
            }
            this.selectionModel.select(...this.options.map(option => option.value));
        }
    }
    /**
     * Get whether the given option is selected.
     * @param option The option to get the selected state of
     */
    isSelected(option) {
        return this.isValueSelected(option.value);
    }
    /**
     * Get whether the given value is selected.
     * @param value The value to get the selected state of
     */
    isValueSelected(value) {
        if (this._invalid) {
            return false;
        }
        return this.selectionModel.isSelected(value);
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
    /**
     * Triggers the given option in response to user interaction.
     * - In single selection mode: selects the option and deselects any other selected option.
     * - In multi selection mode: toggles the selected state of the option.
     * @param option The option to trigger
     */
    triggerOption(option) {
        if (option && !option.disabled) {
            this._lastTriggered = option;
            const changed = this.multiple
                ? this.selectionModel.toggle(option.value)
                : this.selectionModel.select(option.value);
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
     * Trigger the given range of options in response to user interaction.
     * Should only be called in multi-selection mode.
     * @param trigger The option that was triggered
     * @param from The start index of the options to toggle
     * @param to The end index of the options to toggle
     * @param on Whether to toggle the option range on
     */
    triggerRange(trigger, from, to, on) {
        if (this.disabled || (trigger && trigger.disabled)) {
            return;
        }
        this._lastTriggered = trigger;
        const isEqual = this.compareWith ?? Object.is;
        const updateValues = [...this.options]
            .slice(Math.max(0, Math.min(from, to)), Math.min(this.options.length, Math.max(from, to) + 1))
            .filter(option => !option.disabled)
            .map(option => option.value);
        const selected = [...this.value];
        for (const updateValue of updateValues) {
            const selectedIndex = selected.findIndex(selectedValue => isEqual(selectedValue, updateValue));
            if (on && selectedIndex === -1) {
                selected.push(updateValue);
            }
            else if (!on && selectedIndex !== -1) {
                selected.splice(selectedIndex, 1);
            }
        }
        let changed = this.selectionModel.setSelection(...selected);
        if (changed) {
            this._onChange(this.value);
            this.valueChange.next({
                value: this.value,
                listbox: this,
                option: trigger,
            });
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
        const ctrlKeys = ['ctrlKey', 'metaKey'];
        if (this.multiple && keyCode === A && hasModifierKey(event, ...ctrlKeys)) {
            // Toggle all options off if they're all selected, otherwise toggle them all on.
            this.triggerRange(null, 0, this.options.length - 1, this.options.length !== this.value.length);
            event.preventDefault();
            return;
        }
        if (this.multiple &&
            (keyCode === SPACE || keyCode === ENTER) &&
            hasModifierKey(event, 'shiftKey')) {
            if (this.listKeyManager.activeItem && this.listKeyManager.activeItemIndex != null) {
                this.triggerRange(this.listKeyManager.activeItem, this._getLastTriggeredIndex() ?? this.listKeyManager.activeItemIndex, this.listKeyManager.activeItemIndex, !this.listKeyManager.activeItem.isSelected());
            }
            event.preventDefault();
            return;
        }
        if (this.multiple &&
            keyCode === HOME &&
            hasModifierKey(event, ...ctrlKeys) &&
            hasModifierKey(event, 'shiftKey')) {
            const trigger = this.listKeyManager.activeItem;
            if (trigger) {
                const from = this.listKeyManager.activeItemIndex;
                this.listKeyManager.setFirstItemActive();
                this.triggerRange(trigger, from, this.listKeyManager.activeItemIndex, !trigger.isSelected());
            }
            event.preventDefault();
            return;
        }
        if (this.multiple &&
            keyCode === END &&
            hasModifierKey(event, ...ctrlKeys) &&
            hasModifierKey(event, 'shiftKey')) {
            const trigger = this.listKeyManager.activeItem;
            if (trigger) {
                const from = this.listKeyManager.activeItemIndex;
                this.listKeyManager.setLastItemActive();
                this.triggerRange(trigger, from, this.listKeyManager.activeItemIndex, !trigger.isSelected());
            }
            event.preventDefault();
            return;
        }
        if (keyCode === SPACE || keyCode === ENTER) {
            this.triggerOption(this.listKeyManager.activeItem);
            event.preventDefault();
            return;
        }
        const isNavKey = keyCode === UP_ARROW ||
            keyCode === DOWN_ARROW ||
            keyCode === LEFT_ARROW ||
            keyCode === RIGHT_ARROW ||
            keyCode === HOME ||
            keyCode === END;
        this.listKeyManager.onKeydown(event);
        // Will select an option if shift was pressed while navigating to the option
        if (isNavKey && event.shiftKey && previousActiveIndex !== this.listKeyManager.activeItemIndex) {
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
            .withWrap(!this._navigationWrapDisabled)
            .withTypeAhead()
            .withHomeAndEnd()
            .withAllowedModifierKeys(['shiftKey'])
            .skipPredicate(this._navigateDisabledOptions ? this._skipNonePredicate : this._skipDisabledPredicate);
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
        if (this._invalid) {
            this.selectionModel.clear(false);
        }
        this.selectionModel.setSelection(...this._coerceValue(value));
    }
    /** Update the internal value of the listbox based on the selection model. */
    _updateInternalValue() {
        const indexCache = new Map();
        this.selectionModel.sort((a, b) => {
            const aIndex = this._getIndexForValue(indexCache, a);
            const bIndex = this._getIndexForValue(indexCache, b);
            return aIndex - bIndex;
        });
        const selected = this.selectionModel.selected;
        this._invalid =
            (!this.multiple && selected.length > 1) || !!this._getInvalidOptionValues(selected).length;
        this._onValidatorChange();
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
    _handleOptionClicked(option, event) {
        this.listKeyManager.setActiveItem(option);
        if (event.shiftKey && this.multiple) {
            this.triggerRange(option, this._getLastTriggeredIndex() ?? this.listKeyManager.activeItemIndex, this.listKeyManager.activeItemIndex, !option.isSelected());
        }
        else {
            this.triggerOption(option);
        }
    }
    /** Verifies that no two options represent the same value under the compareWith function. */
    _verifyNoOptionValueCollisions() {
        this.options.changes.pipe(startWith(this.options), takeUntil(this.destroyed)).subscribe(() => {
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
     * Get the sublist of values that do not represent valid option values in this listbox.
     * @param values The list of values
     * @return The sublist of values that are not valid option values
     */
    _getInvalidOptionValues(values) {
        const isEqual = this.compareWith || Object.is;
        const validValues = (this.options || []).map(option => option.value);
        return values.filter(value => !validValues.some(validValue => isEqual(value, validValue)));
    }
    /** Get the index of the last triggered option. */
    _getLastTriggeredIndex() {
        const index = this.options.toArray().indexOf(this._lastTriggered);
        return index === -1 ? null : index;
    }
}
CdkListbox.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.0.1", ngImport: i0, type: CdkListbox, deps: [], target: i0.ɵɵFactoryTarget.Directive });
CdkListbox.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.0.1", type: CdkListbox, selector: "[cdkListbox]", inputs: { id: "id", enabledTabIndex: ["tabindex", "enabledTabIndex"], value: ["cdkListboxValue", "value"], multiple: ["cdkListboxMultiple", "multiple"], disabled: ["cdkListboxDisabled", "disabled"], useActiveDescendant: ["cdkListboxUseActiveDescendant", "useActiveDescendant"], orientation: ["cdkListboxOrientation", "orientation"], compareWith: ["cdkListboxCompareWith", "compareWith"], navigationWrapDisabled: ["cdkListboxNavigationWrapDisabled", "navigationWrapDisabled"], navigateDisabledOptions: ["cdkListboxNavigatesDisabledOptions", "navigateDisabledOptions"] }, outputs: { valueChange: "cdkListboxValueChange" }, host: { attributes: { "role": "listbox" }, listeners: { "focus": "_handleFocus()", "keydown": "_handleKeydown($event)", "focusout": "_handleFocusOut($event)" }, properties: { "id": "id", "attr.tabindex": "_getTabIndex()", "attr.aria-disabled": "disabled || null", "attr.aria-multiselectable": "multiple || null", "attr.aria-activedescendant": "_getAriaActiveDescendant()", "attr.aria-orientation": "orientation" }, classAttribute: "cdk-listbox" }, providers: [
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
                        '[attr.aria-disabled]': 'disabled || null',
                        '[attr.aria-multiselectable]': 'multiple || null',
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
            }], navigationWrapDisabled: [{
                type: Input,
                args: ['cdkListboxNavigationWrapDisabled']
            }], navigateDisabledOptions: [{
                type: Input,
                args: ['cdkListboxNavigatesDisabledOptions']
            }], valueChange: [{
                type: Output,
                args: ['cdkListboxValueChange']
            }], options: [{
                type: ContentChildren,
                args: [CdkOption, { descendants: true }]
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdGJveC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL2xpc3Rib3gvbGlzdGJveC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBRUwsaUJBQWlCLEVBQ2pCLGVBQWUsRUFDZixTQUFTLEVBQ1QsVUFBVSxFQUNWLFVBQVUsRUFDVixNQUFNLEVBQ04sV0FBVyxFQUNYLEtBQUssRUFFTCxNQUFNLEVBQ04sU0FBUyxHQUNWLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBQywwQkFBMEIsRUFBc0MsTUFBTSxtQkFBbUIsQ0FBQztBQUNsRyxPQUFPLEVBQ0wsQ0FBQyxFQUNELFVBQVUsRUFDVixHQUFHLEVBQ0gsS0FBSyxFQUNMLGNBQWMsRUFDZCxJQUFJLEVBQ0osVUFBVSxFQUNWLFdBQVcsRUFDWCxLQUFLLEVBQ0wsUUFBUSxHQUNULE1BQU0sdUJBQXVCLENBQUM7QUFDL0IsT0FBTyxFQUFlLFdBQVcsRUFBRSxxQkFBcUIsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQ3ZGLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSwwQkFBMEIsQ0FBQztBQUN4RCxPQUFPLEVBQUMsS0FBSyxFQUFFLEtBQUssRUFBYyxPQUFPLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDdkQsT0FBTyxFQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUM1RSxPQUFPLEVBR0wsYUFBYSxFQUNiLGlCQUFpQixFQUlqQixVQUFVLEdBQ1gsTUFBTSxnQkFBZ0IsQ0FBQztBQUN4QixPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sbUJBQW1CLENBQUM7O0FBRWpELHNEQUFzRDtBQUN0RCxJQUFJLE1BQU0sR0FBRyxDQUFDLENBQUM7QUFFZjs7Ozs7OztHQU9HO0FBQ0gsTUFBTSxxQkFBeUIsU0FBUSxjQUFpQjtJQUN0RCxZQUNTLFdBQVcsS0FBSyxFQUN2Qix1QkFBNkIsRUFDN0IsV0FBVyxHQUFHLElBQUksRUFDbEIsV0FBdUM7UUFFdkMsS0FBSyxDQUFDLElBQUksRUFBRSx1QkFBdUIsRUFBRSxXQUFXLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFMeEQsYUFBUSxHQUFSLFFBQVEsQ0FBUTtJQU16QixDQUFDO0lBRVEsbUJBQW1CO1FBQzFCLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztJQUN2QixDQUFDO0lBRVEsTUFBTSxDQUFDLEdBQUcsTUFBVztRQUM1Qiw0RkFBNEY7UUFDNUYsdUVBQXVFO1FBQ3ZFLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNqQixPQUFPLEtBQUssQ0FBQyxNQUFNLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQztTQUNoQzthQUFNO1lBQ0wsT0FBTyxLQUFLLENBQUMsWUFBWSxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUM7U0FDdEM7SUFDSCxDQUFDO0NBQ0Y7QUFFRCx3Q0FBd0M7QUFnQnhDLE1BQU0sT0FBTyxTQUFTO0lBZnRCO1FBeUJVLGlCQUFZLEdBQUcsY0FBYyxNQUFNLEVBQUUsRUFBRSxDQUFDO1FBbUJ4QyxjQUFTLEdBQVksS0FBSyxDQUFDO1FBY25DLGdDQUFnQztRQUN2QixZQUFPLEdBQWdCLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxhQUFhLENBQUM7UUFFakUsaURBQWlEO1FBQzlCLFlBQU8sR0FBa0IsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBRS9ELDBDQUEwQztRQUNoQyxjQUFTLEdBQUcsSUFBSSxPQUFPLEVBQVEsQ0FBQztRQUUxQyx3Q0FBd0M7UUFDL0IsYUFBUSxHQUFHLElBQUksT0FBTyxFQUFjLENBQUM7UUFFOUMsOENBQThDO1FBQ3RDLFlBQU8sR0FBRyxLQUFLLENBQUM7S0E0RXpCO0lBbklDLDJDQUEyQztJQUMzQyxJQUNJLEVBQUU7UUFDSixPQUFPLElBQUksQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQztJQUN2QyxDQUFDO0lBQ0QsSUFBSSxFQUFFLENBQUMsS0FBSztRQUNWLElBQUksQ0FBQyxHQUFHLEdBQUcsS0FBSyxDQUFDO0lBQ25CLENBQUM7SUFhRCx1Q0FBdUM7SUFDdkMsSUFDSSxRQUFRO1FBQ1YsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDO0lBQ2pELENBQUM7SUFDRCxJQUFJLFFBQVEsQ0FBQyxLQUFtQjtRQUM5QixJQUFJLENBQUMsU0FBUyxHQUFHLHFCQUFxQixDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2hELENBQUM7SUFHRCxxREFBcUQ7SUFDckQsSUFDSSxlQUFlO1FBQ2pCLE9BQU8sSUFBSSxDQUFDLGdCQUFnQixLQUFLLFNBQVM7WUFDeEMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZTtZQUM5QixDQUFDLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDO0lBQzVCLENBQUM7SUFDRCxJQUFJLGVBQWUsQ0FBQyxLQUFLO1FBQ3ZCLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxLQUFLLENBQUM7SUFDaEMsQ0FBQztJQWtCRCxXQUFXO1FBQ1QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUN0QixJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQzVCLENBQUM7SUFFRCx1Q0FBdUM7SUFDdkMsVUFBVTtRQUNSLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDdkMsQ0FBQztJQUVELHFDQUFxQztJQUNyQyxRQUFRO1FBQ04sT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDO0lBQ3RCLENBQUM7SUFFRCxnREFBZ0Q7SUFDaEQsTUFBTTtRQUNKLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzVCLENBQUM7SUFFRCxnREFBZ0Q7SUFDaEQsTUFBTTtRQUNKLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzVCLENBQUM7SUFFRCw4Q0FBOEM7SUFDOUMsUUFBUTtRQUNOLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzlCLENBQUM7SUFFRCx5QkFBeUI7SUFDekIsS0FBSztRQUNILElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDdkIsQ0FBQztJQUVELHlGQUF5RjtJQUN6RixRQUFRO1FBQ04sT0FBTyxDQUFDLElBQUksQ0FBQyxjQUFjLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsSUFBSSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDekUsQ0FBQztJQUVEOzs7T0FHRztJQUNILGVBQWU7UUFDYixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztJQUN0QixDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsaUJBQWlCO1FBQ2YsSUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7SUFDdkIsQ0FBQztJQUVELHlDQUF5QztJQUMvQixZQUFZO1FBQ3BCLDRGQUE0RjtRQUM1RiwyRkFBMkY7UUFDM0YsaUNBQWlDO1FBQ2pDLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsRUFBRTtZQUNwQyxJQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3BDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUM7U0FDdEI7SUFDSCxDQUFDO0lBRUQsd0NBQXdDO0lBQzlCLFlBQVk7UUFDcEIsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLG1CQUFtQixJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDckQsT0FBTyxDQUFDLENBQUMsQ0FBQztTQUNYO1FBQ0QsT0FBTyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3JELENBQUM7O3NHQW5JVSxTQUFTOzBGQUFULFNBQVM7MkZBQVQsU0FBUztrQkFmckIsU0FBUzttQkFBQztvQkFDVCxRQUFRLEVBQUUsYUFBYTtvQkFDdkIsUUFBUSxFQUFFLFdBQVc7b0JBQ3JCLElBQUksRUFBRTt3QkFDSixNQUFNLEVBQUUsUUFBUTt3QkFDaEIsT0FBTyxFQUFFLFlBQVk7d0JBQ3JCLE1BQU0sRUFBRSxJQUFJO3dCQUNaLHNCQUFzQixFQUFFLHNCQUFzQjt3QkFDOUMsaUJBQWlCLEVBQUUsZ0JBQWdCO3dCQUNuQyxzQkFBc0IsRUFBRSxrQkFBa0I7d0JBQzFDLDJCQUEyQixFQUFFLFlBQVk7d0JBQ3pDLFNBQVMsRUFBRSx1QkFBdUI7d0JBQ2xDLFNBQVMsRUFBRSxnQkFBZ0I7cUJBQzVCO2lCQUNGOzhCQUlLLEVBQUU7c0JBREwsS0FBSztnQkFXYyxLQUFLO3NCQUF4QixLQUFLO3VCQUFDLFdBQVc7Z0JBTWdCLGNBQWM7c0JBQS9DLEtBQUs7dUJBQUMseUJBQXlCO2dCQUk1QixRQUFRO3NCQURYLEtBQUs7dUJBQUMsbUJBQW1CO2dCQVd0QixlQUFlO3NCQURsQixLQUFLO3VCQUFDLFVBQVU7O0FBbUluQixNQUFNLE9BQU8sVUFBVTtJQThNckI7UUFsTVEsaUJBQVksR0FBRyxlQUFlLE1BQU0sRUFBRSxFQUFFLENBQUM7UUEwQ3pDLGNBQVMsR0FBWSxLQUFLLENBQUM7UUFVM0IseUJBQW9CLEdBQVksS0FBSyxDQUFDO1FBZXRDLGlCQUFZLEdBQThCLFVBQVUsQ0FBQztRQXVCckQsNEJBQXVCLEdBQUcsS0FBSyxDQUFDO1FBYWhDLDZCQUF3QixHQUFHLEtBQUssQ0FBQztRQUV6Qyw4REFBOEQ7UUFDcEIsZ0JBQVcsR0FBRyxJQUFJLE9BQU8sRUFBOEIsQ0FBQztRQUtsRywrQ0FBK0M7UUFDckMsbUJBQWMsR0FBRyxJQUFJLHFCQUFxQixFQUFLLENBQUM7UUFLMUQsMkNBQTJDO1FBQ3hCLGNBQVMsR0FBRyxJQUFJLE9BQU8sRUFBUSxDQUFDO1FBRW5ELHVDQUF1QztRQUNwQixZQUFPLEdBQWdCLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxhQUFhLENBQUM7UUFFM0UsNENBQTRDO1FBQ3pCLHNCQUFpQixHQUFHLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBRWpFLDhFQUE4RTtRQUN0RSxhQUFRLEdBQUcsS0FBSyxDQUFDO1FBRXpCLHNDQUFzQztRQUM5QixtQkFBYyxHQUF3QixJQUFJLENBQUM7UUFFbkQsd0RBQXdEO1FBQ2hELGVBQVUsR0FBRyxHQUFHLEVBQUUsR0FBRSxDQUFDLENBQUM7UUFFOUIscURBQXFEO1FBQzdDLGNBQVMsR0FBa0MsR0FBRyxFQUFFLEdBQUUsQ0FBQyxDQUFDO1FBRTVELHVEQUF1RDtRQUMvQyx1QkFBa0IsR0FBRyxHQUFHLEVBQUUsR0FBRSxDQUFDLENBQUM7UUFFdEMsNkNBQTZDO1FBQ3JDLG1CQUFjLEdBQUcsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUNqQyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQXNDLENBQUMsSUFBSSxDQUN2RCxTQUFTLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUN2QixTQUFTLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FDbEIsS0FBSyxDQUFDLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBQyxNQUFNLEVBQUUsS0FBSyxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUN2RixDQUNGLENBQ0YsQ0FBQztRQUVGLHNDQUFzQztRQUNyQixTQUFJLEdBQUcsTUFBTSxDQUFDLGNBQWMsRUFBRSxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFckUsK0NBQStDO1FBQzlCLDJCQUFzQixHQUFHLENBQUMsTUFBb0IsRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQztRQUVwRixrREFBa0Q7UUFDakMsdUJBQWtCLEdBQUcsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDO1FBRWxEOzs7OztXQUtHO1FBQ0ssc0NBQWlDLEdBQWdCLENBQUMsT0FBd0IsRUFBRSxFQUFFO1lBQ3BGLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3RELElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxJQUFJLFlBQVksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUM3QyxPQUFPLEVBQUMsb0NBQW9DLEVBQUUsSUFBSSxFQUFDLENBQUM7YUFDckQ7WUFDRCxPQUFPLElBQUksQ0FBQztRQUNkLENBQUMsQ0FBQztRQUVGOzs7O1dBSUc7UUFDSyxvQ0FBK0IsR0FBZ0IsQ0FBQyxPQUF3QixFQUFFLEVBQUU7WUFDbEYsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDdEQsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLHVCQUF1QixDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQ2pFLElBQUksYUFBYSxDQUFDLE1BQU0sRUFBRTtnQkFDeEIsT0FBTyxFQUFDLGtDQUFrQyxFQUFFLEVBQUMsUUFBUSxFQUFFLGFBQWEsRUFBQyxFQUFDLENBQUM7YUFDeEU7WUFDRCxPQUFPLElBQUksQ0FBQztRQUNkLENBQUMsQ0FBQztRQUVGLHVEQUF1RDtRQUMvQyxnQkFBVyxHQUFHLFVBQVUsQ0FBQyxPQUFPLENBQUM7WUFDdkMsSUFBSSxDQUFDLGlDQUFpQztZQUN0QyxJQUFJLENBQUMsK0JBQStCO1NBQ3JDLENBQUUsQ0FBQztRQUdGLDhFQUE4RTtRQUM5RSxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFFLFNBQVMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFO1lBQzFGLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO1FBQzlCLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQWhORCwyQ0FBMkM7SUFDM0MsSUFDSSxFQUFFO1FBQ0osT0FBTyxJQUFJLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUM7SUFDdkMsQ0FBQztJQUNELElBQUksRUFBRSxDQUFDLEtBQUs7UUFDVixJQUFJLENBQUMsR0FBRyxHQUFHLEtBQUssQ0FBQztJQUNuQixDQUFDO0lBSUQsdURBQXVEO0lBQ3ZELElBQ0ksZUFBZTtRQUNqQixPQUFPLElBQUksQ0FBQyxnQkFBZ0IsS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDO0lBQ3pFLENBQUM7SUFDRCxJQUFJLGVBQWUsQ0FBQyxLQUFLO1FBQ3ZCLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxLQUFLLENBQUM7SUFDaEMsQ0FBQztJQUdELG1GQUFtRjtJQUNuRixJQUNJLEtBQUs7UUFDUCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUM7SUFDM0QsQ0FBQztJQUNELElBQUksS0FBSyxDQUFDLEtBQW1CO1FBQzNCLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDNUIsQ0FBQztJQUVEOzs7T0FHRztJQUNILElBQ0ksUUFBUTtRQUNWLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUM7SUFDdEMsQ0FBQztJQUNELElBQUksUUFBUSxDQUFDLEtBQW1CO1FBQzlCLElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxHQUFHLHFCQUFxQixDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzVELElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO0lBQzlCLENBQUM7SUFFRCx1Q0FBdUM7SUFDdkMsSUFDSSxRQUFRO1FBQ1YsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDO0lBQ3hCLENBQUM7SUFDRCxJQUFJLFFBQVEsQ0FBQyxLQUFtQjtRQUM5QixJQUFJLENBQUMsU0FBUyxHQUFHLHFCQUFxQixDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2hELENBQUM7SUFHRCwwRkFBMEY7SUFDMUYsSUFDSSxtQkFBbUI7UUFDckIsT0FBTyxJQUFJLENBQUMsb0JBQW9CLENBQUM7SUFDbkMsQ0FBQztJQUNELElBQUksbUJBQW1CLENBQUMseUJBQXVDO1FBQzdELElBQUksQ0FBQyxvQkFBb0IsR0FBRyxxQkFBcUIsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO0lBQy9FLENBQUM7SUFHRCw0RkFBNEY7SUFDNUYsSUFDSSxXQUFXO1FBQ2IsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDO0lBQzNCLENBQUM7SUFDRCxJQUFJLFdBQVcsQ0FBQyxLQUFnQztRQUM5QyxJQUFJLENBQUMsWUFBWSxHQUFHLEtBQUssS0FBSyxZQUFZLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDO1FBQ3ZFLElBQUksS0FBSyxLQUFLLFlBQVksRUFBRTtZQUMxQixJQUFJLENBQUMsY0FBYyxFQUFFLHlCQUF5QixDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsS0FBSyxJQUFJLEtBQUssQ0FBQyxDQUFDO1NBQzNFO2FBQU07WUFDTCxJQUFJLENBQUMsY0FBYyxFQUFFLHVCQUF1QixFQUFFLENBQUM7U0FDaEQ7SUFDSCxDQUFDO0lBR0Qsa0RBQWtEO0lBQ2xELElBQ0ksV0FBVztRQUNiLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUM7SUFDekMsQ0FBQztJQUNELElBQUksV0FBVyxDQUFDLEVBQTJDO1FBQ3pELElBQUksQ0FBQyxjQUFjLENBQUMsV0FBVyxHQUFHLEVBQUUsQ0FBQztJQUN2QyxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsSUFDSSxzQkFBc0I7UUFDeEIsT0FBTyxJQUFJLENBQUMsdUJBQXVCLENBQUM7SUFDdEMsQ0FBQztJQUNELElBQUksc0JBQXNCLENBQUMsSUFBa0I7UUFDM0MsSUFBSSxDQUFDLHVCQUF1QixHQUFHLHFCQUFxQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzNELElBQUksQ0FBQyxjQUFjLEVBQUUsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLENBQUM7SUFDL0QsQ0FBQztJQUdELG1FQUFtRTtJQUNuRSxJQUNJLHVCQUF1QjtRQUN6QixPQUFPLElBQUksQ0FBQyx3QkFBd0IsQ0FBQztJQUN2QyxDQUFDO0lBQ0QsSUFBSSx1QkFBdUIsQ0FBQyxJQUFrQjtRQUM1QyxJQUFJLENBQUMsd0JBQXdCLEdBQUcscUJBQXFCLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDNUQsSUFBSSxDQUFDLGNBQWMsRUFBRSxhQUFhLENBQ2hDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQ3RGLENBQUM7SUFDSixDQUFDO0lBbUdELGtCQUFrQjtRQUNoQixJQUFJLE9BQU8sU0FBUyxLQUFLLFdBQVcsSUFBSSxTQUFTLEVBQUU7WUFDakQsSUFBSSxDQUFDLDhCQUE4QixFQUFFLENBQUM7U0FDdkM7UUFFRCxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7UUFFdkIsNEZBQTRGO1FBQzVGLHdCQUF3QjtRQUN4QixJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxTQUFTLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRTtZQUMzRixJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztRQUM5QixDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxjQUFjO2FBQ2hCLElBQUksQ0FDSCxNQUFNLENBQUMsQ0FBQyxFQUFDLE1BQU0sRUFBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFDdEMsU0FBUyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FDMUI7YUFDQSxTQUFTLENBQUMsQ0FBQyxFQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQzlFLENBQUM7SUFFRCxXQUFXO1FBQ1QsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDdEMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUN0QixJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQzVCLENBQUM7SUFFRDs7O09BR0c7SUFDSCxNQUFNLENBQUMsTUFBb0I7UUFDekIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDakMsQ0FBQztJQUVEOzs7T0FHRztJQUNILFdBQVcsQ0FBQyxLQUFRO1FBQ2xCLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNqQixJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUNsQztRQUNELElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3BDLENBQUM7SUFFRDs7O09BR0c7SUFDSCxNQUFNLENBQUMsTUFBb0I7UUFDekIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDakMsQ0FBQztJQUVEOzs7T0FHRztJQUNILFdBQVcsQ0FBQyxLQUFRO1FBQ2xCLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNqQixJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUNsQztRQUNELElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3BDLENBQUM7SUFFRDs7O09BR0c7SUFDSCxRQUFRLENBQUMsTUFBb0I7UUFDM0IsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDbkMsQ0FBQztJQUVEOzs7T0FHRztJQUNILGFBQWEsQ0FBQyxLQUFRO1FBQ3BCLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNqQixJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUNsQztRQUNELElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3RDLENBQUM7SUFFRDs7O09BR0c7SUFDSCxjQUFjLENBQUMsVUFBbUI7UUFDaEMsSUFBSSxDQUFDLFVBQVUsRUFBRTtZQUNmLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLENBQUM7U0FDN0I7YUFBTTtZQUNMLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtnQkFDakIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDbEM7WUFDRCxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7U0FDekU7SUFDSCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsVUFBVSxDQUFDLE1BQW9CO1FBQzdCLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDNUMsQ0FBQztJQUVEOzs7T0FHRztJQUNILGVBQWUsQ0FBQyxLQUFRO1FBQ3RCLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNqQixPQUFPLEtBQUssQ0FBQztTQUNkO1FBQ0QsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUMvQyxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILGdCQUFnQixDQUFDLEVBQWlDO1FBQ2hELElBQUksQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO0lBQ3RCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsaUJBQWlCLENBQUMsRUFBWTtRQUM1QixJQUFJLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQztJQUN2QixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILFVBQVUsQ0FBQyxLQUFtQjtRQUM1QixJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzVCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsZ0JBQWdCLENBQUMsVUFBbUI7UUFDbEMsSUFBSSxDQUFDLFFBQVEsR0FBRyxVQUFVLENBQUM7SUFDN0IsQ0FBQztJQUVEOzs7T0FHRztJQUNILFFBQVEsQ0FBQyxPQUFrQztRQUN6QyxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDbkMsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCx5QkFBeUIsQ0FBQyxFQUFjO1FBQ3RDLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxFQUFFLENBQUM7SUFDL0IsQ0FBQztJQUVELHdDQUF3QztJQUN4QyxLQUFLO1FBQ0gsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUN2QixDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDTyxhQUFhLENBQUMsTUFBMkI7UUFDakQsSUFBSSxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFO1lBQzlCLElBQUksQ0FBQyxjQUFjLEdBQUcsTUFBTSxDQUFDO1lBQzdCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRO2dCQUMzQixDQUFDLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQztnQkFDMUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUM3QyxJQUFJLE9BQU8sRUFBRTtnQkFDWCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDM0IsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUM7b0JBQ3BCLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSztvQkFDakIsT0FBTyxFQUFFLElBQUk7b0JBQ2IsTUFBTSxFQUFFLE1BQU07aUJBQ2YsQ0FBQyxDQUFDO2FBQ0o7U0FDRjtJQUNILENBQUM7SUFFRDs7Ozs7OztPQU9HO0lBQ08sWUFBWSxDQUFDLE9BQTRCLEVBQUUsSUFBWSxFQUFFLEVBQVUsRUFBRSxFQUFXO1FBQ3hGLElBQUksSUFBSSxDQUFDLFFBQVEsSUFBSSxDQUFDLE9BQU8sSUFBSSxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUU7WUFDbEQsT0FBTztTQUNSO1FBQ0QsSUFBSSxDQUFDLGNBQWMsR0FBRyxPQUFPLENBQUM7UUFDOUIsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFdBQVcsSUFBSSxNQUFNLENBQUMsRUFBRSxDQUFDO1FBQzlDLE1BQU0sWUFBWSxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO2FBQ25DLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7YUFDN0YsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDO2FBQ2xDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUMvQixNQUFNLFFBQVEsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2pDLEtBQUssTUFBTSxXQUFXLElBQUksWUFBWSxFQUFFO1lBQ3RDLE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FDdkQsT0FBTyxDQUFDLGFBQWEsRUFBRSxXQUFXLENBQUMsQ0FDcEMsQ0FBQztZQUNGLElBQUksRUFBRSxJQUFJLGFBQWEsS0FBSyxDQUFDLENBQUMsRUFBRTtnQkFDOUIsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQzthQUM1QjtpQkFBTSxJQUFJLENBQUMsRUFBRSxJQUFJLGFBQWEsS0FBSyxDQUFDLENBQUMsRUFBRTtnQkFDdEMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDLENBQUM7YUFDbkM7U0FDRjtRQUNELElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDLEdBQUcsUUFBUSxDQUFDLENBQUM7UUFDNUQsSUFBSSxPQUFPLEVBQUU7WUFDWCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUMzQixJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQztnQkFDcEIsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLO2dCQUNqQixPQUFPLEVBQUUsSUFBSTtnQkFDYixNQUFNLEVBQUUsT0FBTzthQUNoQixDQUFDLENBQUM7U0FDSjtJQUNILENBQUM7SUFFRDs7O09BR0c7SUFDSCxnQkFBZ0IsQ0FBQyxNQUFvQjtRQUNuQyxJQUFJLENBQUMsY0FBYyxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUM1QyxDQUFDO0lBRUQsOENBQThDO0lBQ3BDLFlBQVk7UUFDcEIsSUFBSSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsRUFBRTtZQUM3QixJQUFJLENBQUMsY0FBYyxDQUFDLGlCQUFpQixFQUFFLENBQUM7WUFDeEMsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7U0FDM0I7SUFDSCxDQUFDO0lBRUQsMkRBQTJEO0lBQ2pELGNBQWMsQ0FBQyxLQUFvQjtRQUMzQyxJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUU7WUFDbEIsT0FBTztTQUNSO1FBRUQsTUFBTSxFQUFDLE9BQU8sRUFBQyxHQUFHLEtBQUssQ0FBQztRQUN4QixNQUFNLG1CQUFtQixHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsZUFBZSxDQUFDO1FBQ2hFLE1BQU0sUUFBUSxHQUFHLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBVSxDQUFDO1FBRWpELElBQUksSUFBSSxDQUFDLFFBQVEsSUFBSSxPQUFPLEtBQUssQ0FBQyxJQUFJLGNBQWMsQ0FBQyxLQUFLLEVBQUUsR0FBRyxRQUFRLENBQUMsRUFBRTtZQUN4RSxnRkFBZ0Y7WUFDaEYsSUFBSSxDQUFDLFlBQVksQ0FDZixJQUFJLEVBQ0osQ0FBQyxFQUNELElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsRUFDdkIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEtBQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQzFDLENBQUM7WUFDRixLQUFLLENBQUMsY0FBYyxFQUFFLENBQUM7WUFDdkIsT0FBTztTQUNSO1FBRUQsSUFDRSxJQUFJLENBQUMsUUFBUTtZQUNiLENBQUMsT0FBTyxLQUFLLEtBQUssSUFBSSxPQUFPLEtBQUssS0FBSyxDQUFDO1lBQ3hDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsVUFBVSxDQUFDLEVBQ2pDO1lBQ0EsSUFBSSxJQUFJLENBQUMsY0FBYyxDQUFDLFVBQVUsSUFBSSxJQUFJLENBQUMsY0FBYyxDQUFDLGVBQWUsSUFBSSxJQUFJLEVBQUU7Z0JBQ2pGLElBQUksQ0FBQyxZQUFZLENBQ2YsSUFBSSxDQUFDLGNBQWMsQ0FBQyxVQUFVLEVBQzlCLElBQUksQ0FBQyxzQkFBc0IsRUFBRSxJQUFJLElBQUksQ0FBQyxjQUFjLENBQUMsZUFBZSxFQUNwRSxJQUFJLENBQUMsY0FBYyxDQUFDLGVBQWUsRUFDbkMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxVQUFVLEVBQUUsQ0FDN0MsQ0FBQzthQUNIO1lBQ0QsS0FBSyxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQ3ZCLE9BQU87U0FDUjtRQUVELElBQ0UsSUFBSSxDQUFDLFFBQVE7WUFDYixPQUFPLEtBQUssSUFBSTtZQUNoQixjQUFjLENBQUMsS0FBSyxFQUFFLEdBQUcsUUFBUSxDQUFDO1lBQ2xDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsVUFBVSxDQUFDLEVBQ2pDO1lBQ0EsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUM7WUFDL0MsSUFBSSxPQUFPLEVBQUU7Z0JBQ1gsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxlQUFnQixDQUFDO2dCQUNsRCxJQUFJLENBQUMsY0FBYyxDQUFDLGtCQUFrQixFQUFFLENBQUM7Z0JBQ3pDLElBQUksQ0FBQyxZQUFZLENBQ2YsT0FBTyxFQUNQLElBQUksRUFDSixJQUFJLENBQUMsY0FBYyxDQUFDLGVBQWdCLEVBQ3BDLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxDQUN0QixDQUFDO2FBQ0g7WUFDRCxLQUFLLENBQUMsY0FBYyxFQUFFLENBQUM7WUFDdkIsT0FBTztTQUNSO1FBRUQsSUFDRSxJQUFJLENBQUMsUUFBUTtZQUNiLE9BQU8sS0FBSyxHQUFHO1lBQ2YsY0FBYyxDQUFDLEtBQUssRUFBRSxHQUFHLFFBQVEsQ0FBQztZQUNsQyxjQUFjLENBQUMsS0FBSyxFQUFFLFVBQVUsQ0FBQyxFQUNqQztZQUNBLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDO1lBQy9DLElBQUksT0FBTyxFQUFFO2dCQUNYLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsZUFBZ0IsQ0FBQztnQkFDbEQsSUFBSSxDQUFDLGNBQWMsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO2dCQUN4QyxJQUFJLENBQUMsWUFBWSxDQUNmLE9BQU8sRUFDUCxJQUFJLEVBQ0osSUFBSSxDQUFDLGNBQWMsQ0FBQyxlQUFnQixFQUNwQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsQ0FDdEIsQ0FBQzthQUNIO1lBQ0QsS0FBSyxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQ3ZCLE9BQU87U0FDUjtRQUVELElBQUksT0FBTyxLQUFLLEtBQUssSUFBSSxPQUFPLEtBQUssS0FBSyxFQUFFO1lBQzFDLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUNuRCxLQUFLLENBQUMsY0FBYyxFQUFFLENBQUM7WUFDdkIsT0FBTztTQUNSO1FBRUQsTUFBTSxRQUFRLEdBQ1osT0FBTyxLQUFLLFFBQVE7WUFDcEIsT0FBTyxLQUFLLFVBQVU7WUFDdEIsT0FBTyxLQUFLLFVBQVU7WUFDdEIsT0FBTyxLQUFLLFdBQVc7WUFDdkIsT0FBTyxLQUFLLElBQUk7WUFDaEIsT0FBTyxLQUFLLEdBQUcsQ0FBQztRQUNsQixJQUFJLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNyQyw0RUFBNEU7UUFDNUUsSUFBSSxRQUFRLElBQUksS0FBSyxDQUFDLFFBQVEsSUFBSSxtQkFBbUIsS0FBSyxJQUFJLENBQUMsY0FBYyxDQUFDLGVBQWUsRUFBRTtZQUM3RixJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUM7U0FDcEQ7SUFDSCxDQUFDO0lBRUQ7OztPQUdHO0lBQ08sZUFBZSxDQUFDLEtBQWlCO1FBQ3pDLE1BQU0sWUFBWSxHQUFHLEtBQUssQ0FBQyxhQUF3QixDQUFDO1FBQ3BELElBQUksSUFBSSxDQUFDLE9BQU8sS0FBSyxZQUFZLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsRUFBRTtZQUN6RSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7U0FDbkI7SUFDSCxDQUFDO0lBRUQsMEVBQTBFO0lBQ2hFLHdCQUF3QjtRQUNoQyxPQUFPLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxVQUFVLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7SUFDaEYsQ0FBQztJQUVELHdDQUF3QztJQUM5QixZQUFZO1FBQ3BCLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNqQixPQUFPLENBQUMsQ0FBQyxDQUFDO1NBQ1g7UUFDRCxPQUFPLElBQUksQ0FBQyxtQkFBbUIsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNqRyxDQUFDO0lBRUQsa0NBQWtDO0lBQzFCLGVBQWU7UUFDckIsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLDBCQUEwQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7YUFDL0QsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDO2FBQ3ZDLGFBQWEsRUFBRTthQUNmLGNBQWMsRUFBRTthQUNoQix1QkFBdUIsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDO2FBQ3JDLGFBQWEsQ0FDWixJQUFJLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUN0RixDQUFDO1FBRUosSUFBSSxJQUFJLENBQUMsV0FBVyxLQUFLLFVBQVUsRUFBRTtZQUNuQyxJQUFJLENBQUMsY0FBYyxDQUFDLHVCQUF1QixFQUFFLENBQUM7U0FDL0M7YUFBTTtZQUNMLElBQUksQ0FBQyxjQUFjLENBQUMseUJBQXlCLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxLQUFLLElBQUksS0FBSyxDQUFDLENBQUM7U0FDMUU7UUFFRCxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU07YUFDdkIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7YUFDL0IsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLENBQUM7SUFDaEQsQ0FBQztJQUVELCtCQUErQjtJQUN2QixrQkFBa0I7UUFDeEIsSUFBSSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsRUFBRTtZQUM3QixJQUFJLENBQUMsY0FBYyxDQUFDLFVBQVUsRUFBRSxLQUFLLEVBQUUsQ0FBQztTQUN6QztRQUNELElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxZQUFZLEVBQUUsQ0FBQztJQUN4QyxDQUFDO0lBRUQ7OztPQUdHO0lBQ0ssYUFBYSxDQUFDLEtBQW1CO1FBQ3ZDLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNqQixJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUNsQztRQUNELElBQUksQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ2hFLENBQUM7SUFFRCw2RUFBNkU7SUFDckUsb0JBQW9CO1FBQzFCLE1BQU0sVUFBVSxHQUFHLElBQUksR0FBRyxFQUFhLENBQUM7UUFDeEMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFJLEVBQUUsQ0FBSSxFQUFFLEVBQUU7WUFDdEMsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNyRCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3JELE9BQU8sTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUN6QixDQUFDLENBQUMsQ0FBQztRQUNILE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDO1FBQzlDLElBQUksQ0FBQyxRQUFRO1lBQ1gsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLElBQUksUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLFFBQVEsQ0FBQyxDQUFDLE1BQU0sQ0FBQztRQUM3RixJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztRQUMxQixJQUFJLENBQUMsaUJBQWlCLENBQUMsWUFBWSxFQUFFLENBQUM7SUFDeEMsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0ssaUJBQWlCLENBQUMsS0FBcUIsRUFBRSxLQUFRO1FBQ3ZELE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxXQUFXLElBQUksTUFBTSxDQUFDLEVBQUUsQ0FBQztRQUM5QyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUNyQixJQUFJLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNmLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDNUMsSUFBSSxPQUFPLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBRSxDQUFDLEtBQUssQ0FBQyxFQUFFO29CQUM5QyxLQUFLLEdBQUcsQ0FBQyxDQUFDO29CQUNWLE1BQU07aUJBQ1A7YUFDRjtZQUNELEtBQUssQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO1NBQ3pCO1FBQ0QsT0FBTyxLQUFLLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBRSxDQUFDO0lBQzNCLENBQUM7SUFFRDs7O09BR0c7SUFDSyxvQkFBb0IsQ0FBQyxNQUFvQixFQUFFLEtBQWlCO1FBQ2xFLElBQUksQ0FBQyxjQUFjLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzFDLElBQUksS0FBSyxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ25DLElBQUksQ0FBQyxZQUFZLENBQ2YsTUFBTSxFQUNOLElBQUksQ0FBQyxzQkFBc0IsRUFBRSxJQUFJLElBQUksQ0FBQyxjQUFjLENBQUMsZUFBZ0IsRUFDckUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxlQUFnQixFQUNwQyxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FDckIsQ0FBQztTQUNIO2FBQU07WUFDTCxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQzVCO0lBQ0gsQ0FBQztJQUVELDRGQUE0RjtJQUNwRiw4QkFBOEI7UUFDcEMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsU0FBUyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUU7WUFDM0YsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFdBQVcsSUFBSSxNQUFNLENBQUMsRUFBRSxDQUFDO1lBQzlDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDNUMsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFFLENBQUM7Z0JBQ3BDLElBQUksU0FBUyxHQUF3QixJQUFJLENBQUM7Z0JBQzFDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7b0JBQ2hELE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBRSxDQUFDO29CQUNuQyxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBRTt3QkFDdEMsU0FBUyxHQUFHLEtBQUssQ0FBQzt3QkFDbEIsTUFBTTtxQkFDUDtpQkFDRjtnQkFDRCxJQUFJLFNBQVMsRUFBRTtvQkFDYiwyQ0FBMkM7b0JBQzNDLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRTt3QkFDcEIsT0FBTyxDQUFDLElBQUksQ0FDViwyRkFBMkYsRUFDM0Y7NEJBQ0UsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPOzRCQUN2QixPQUFPLEVBQUUsU0FBUyxDQUFDLE9BQU87NEJBQzFCLFdBQVcsRUFBRSxJQUFJLENBQUMsV0FBVzt5QkFDOUIsQ0FDRixDQUFDO3FCQUNIO3lCQUFNO3dCQUNMLE9BQU8sQ0FBQyxJQUFJLENBQUMsOENBQThDLEVBQUU7NEJBQzNELE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTzs0QkFDdkIsT0FBTyxFQUFFLFNBQVMsQ0FBQyxPQUFPO3lCQUMzQixDQUFDLENBQUM7cUJBQ0o7b0JBQ0QsT0FBTztpQkFDUjthQUNGO1FBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNLLFlBQVksQ0FBQyxLQUFtQjtRQUN0QyxPQUFPLEtBQUssSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2pELENBQUM7SUFFRDs7OztPQUlHO0lBQ0ssdUJBQXVCLENBQUMsTUFBb0I7UUFDbEQsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFdBQVcsSUFBSSxNQUFNLENBQUMsRUFBRSxDQUFDO1FBQzlDLE1BQU0sV0FBVyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sSUFBSSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDckUsT0FBTyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDN0YsQ0FBQztJQUVELGtEQUFrRDtJQUMxQyxzQkFBc0I7UUFDNUIsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGNBQWUsQ0FBQyxDQUFDO1FBQ25FLE9BQU8sS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztJQUNyQyxDQUFDOzt1R0E3dUJVLFVBQVU7MkZBQVYsVUFBVSxvbENBYlY7UUFDVDtZQUNFLE9BQU8sRUFBRSxpQkFBaUI7WUFDMUIsV0FBVyxFQUFFLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxVQUFVLENBQUM7WUFDekMsS0FBSyxFQUFFLElBQUk7U0FDWjtRQUNEO1lBQ0UsT0FBTyxFQUFFLGFBQWE7WUFDdEIsV0FBVyxFQUFFLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxVQUFVLENBQUM7WUFDekMsS0FBSyxFQUFFLElBQUk7U0FDWjtLQUNGLGtEQTJIZ0IsU0FBUzsyRkF6SGYsVUFBVTtrQkE3QnRCLFNBQVM7bUJBQUM7b0JBQ1QsUUFBUSxFQUFFLGNBQWM7b0JBQ3hCLFFBQVEsRUFBRSxZQUFZO29CQUN0QixJQUFJLEVBQUU7d0JBQ0osTUFBTSxFQUFFLFNBQVM7d0JBQ2pCLE9BQU8sRUFBRSxhQUFhO3dCQUN0QixNQUFNLEVBQUUsSUFBSTt3QkFDWixpQkFBaUIsRUFBRSxnQkFBZ0I7d0JBQ25DLHNCQUFzQixFQUFFLGtCQUFrQjt3QkFDMUMsNkJBQTZCLEVBQUUsa0JBQWtCO3dCQUNqRCw4QkFBOEIsRUFBRSw0QkFBNEI7d0JBQzVELHlCQUF5QixFQUFFLGFBQWE7d0JBQ3hDLFNBQVMsRUFBRSxnQkFBZ0I7d0JBQzNCLFdBQVcsRUFBRSx3QkFBd0I7d0JBQ3JDLFlBQVksRUFBRSx5QkFBeUI7cUJBQ3hDO29CQUNELFNBQVMsRUFBRTt3QkFDVDs0QkFDRSxPQUFPLEVBQUUsaUJBQWlCOzRCQUMxQixXQUFXLEVBQUUsVUFBVSxDQUFDLEdBQUcsRUFBRSxXQUFXLENBQUM7NEJBQ3pDLEtBQUssRUFBRSxJQUFJO3lCQUNaO3dCQUNEOzRCQUNFLE9BQU8sRUFBRSxhQUFhOzRCQUN0QixXQUFXLEVBQUUsVUFBVSxDQUFDLEdBQUcsRUFBRSxXQUFXLENBQUM7NEJBQ3pDLEtBQUssRUFBRSxJQUFJO3lCQUNaO3FCQUNGO2lCQUNGOzBFQU1LLEVBQUU7c0JBREwsS0FBSztnQkFZRixlQUFlO3NCQURsQixLQUFLO3VCQUFDLFVBQVU7Z0JBV2IsS0FBSztzQkFEUixLQUFLO3VCQUFDLGlCQUFpQjtnQkFhcEIsUUFBUTtzQkFEWCxLQUFLO3VCQUFDLG9CQUFvQjtnQkFXdkIsUUFBUTtzQkFEWCxLQUFLO3VCQUFDLG9CQUFvQjtnQkFXdkIsbUJBQW1CO3NCQUR0QixLQUFLO3VCQUFDLCtCQUErQjtnQkFXbEMsV0FBVztzQkFEZCxLQUFLO3VCQUFDLHVCQUF1QjtnQkFnQjFCLFdBQVc7c0JBRGQsS0FBSzt1QkFBQyx1QkFBdUI7Z0JBYTFCLHNCQUFzQjtzQkFEekIsS0FBSzt1QkFBQyxrQ0FBa0M7Z0JBWXJDLHVCQUF1QjtzQkFEMUIsS0FBSzt1QkFBQyxvQ0FBb0M7Z0JBYUQsV0FBVztzQkFBcEQsTUFBTTt1QkFBQyx1QkFBdUI7Z0JBRzRCLE9BQU87c0JBQWpFLGVBQWU7dUJBQUMsU0FBUyxFQUFFLEVBQUMsV0FBVyxFQUFFLElBQUksRUFBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1xuICBBZnRlckNvbnRlbnRJbml0LFxuICBDaGFuZ2VEZXRlY3RvclJlZixcbiAgQ29udGVudENoaWxkcmVuLFxuICBEaXJlY3RpdmUsXG4gIEVsZW1lbnRSZWYsXG4gIGZvcndhcmRSZWYsXG4gIGluamVjdCxcbiAgSW5qZWN0RmxhZ3MsXG4gIElucHV0LFxuICBPbkRlc3Ryb3ksXG4gIE91dHB1dCxcbiAgUXVlcnlMaXN0LFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7QWN0aXZlRGVzY2VuZGFudEtleU1hbmFnZXIsIEhpZ2hsaWdodGFibGUsIExpc3RLZXlNYW5hZ2VyT3B0aW9ufSBmcm9tICdAYW5ndWxhci9jZGsvYTExeSc7XG5pbXBvcnQge1xuICBBLFxuICBET1dOX0FSUk9XLFxuICBFTkQsXG4gIEVOVEVSLFxuICBoYXNNb2RpZmllcktleSxcbiAgSE9NRSxcbiAgTEVGVF9BUlJPVyxcbiAgUklHSFRfQVJST1csXG4gIFNQQUNFLFxuICBVUF9BUlJPVyxcbn0gZnJvbSAnQGFuZ3VsYXIvY2RrL2tleWNvZGVzJztcbmltcG9ydCB7Qm9vbGVhbklucHV0LCBjb2VyY2VBcnJheSwgY29lcmNlQm9vbGVhblByb3BlcnR5fSBmcm9tICdAYW5ndWxhci9jZGsvY29lcmNpb24nO1xuaW1wb3J0IHtTZWxlY3Rpb25Nb2RlbH0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvbGxlY3Rpb25zJztcbmltcG9ydCB7ZGVmZXIsIG1lcmdlLCBPYnNlcnZhYmxlLCBTdWJqZWN0fSBmcm9tICdyeGpzJztcbmltcG9ydCB7ZmlsdGVyLCBtYXAsIHN0YXJ0V2l0aCwgc3dpdGNoTWFwLCB0YWtlVW50aWx9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7XG4gIEFic3RyYWN0Q29udHJvbCxcbiAgQ29udHJvbFZhbHVlQWNjZXNzb3IsXG4gIE5HX1ZBTElEQVRPUlMsXG4gIE5HX1ZBTFVFX0FDQ0VTU09SLFxuICBWYWxpZGF0aW9uRXJyb3JzLFxuICBWYWxpZGF0b3IsXG4gIFZhbGlkYXRvckZuLFxuICBWYWxpZGF0b3JzLFxufSBmcm9tICdAYW5ndWxhci9mb3Jtcyc7XG5pbXBvcnQge0RpcmVjdGlvbmFsaXR5fSBmcm9tICdAYW5ndWxhci9jZGsvYmlkaSc7XG5cbi8qKiBUaGUgbmV4dCBpZCB0byB1c2UgZm9yIGNyZWF0aW5nIHVuaXF1ZSBET00gSURzLiAqL1xubGV0IG5leHRJZCA9IDA7XG5cbi8qKlxuICogQW4gaW1wbGVtZW50YXRpb24gb2YgU2VsZWN0aW9uTW9kZWwgdGhhdCBpbnRlcm5hbGx5IGFsd2F5cyByZXByZXNlbnRzIHRoZSBzZWxlY3Rpb24gYXMgYVxuICogbXVsdGktc2VsZWN0aW9uLiBUaGlzIGlzIG5lY2Vzc2FyeSBzbyB0aGF0IHdlIGNhbiByZWNvdmVyIHRoZSBmdWxsIHNlbGVjdGlvbiBpZiB0aGUgdXNlclxuICogc3dpdGNoZXMgdGhlIGxpc3Rib3ggZnJvbSBzaW5nbGUtc2VsZWN0aW9uIHRvIG11bHRpLXNlbGVjdGlvbiBhZnRlciBpbml0aWFsaXphdGlvbi5cbiAqXG4gKiBUaGlzIHNlbGVjdGlvbiBtb2RlbCBtYXkgcmVwb3J0IG11bHRpcGxlIHNlbGVjdGVkIHZhbHVlcywgZXZlbiBpZiBpdCBpcyBpbiBzaW5nbGUtc2VsZWN0aW9uXG4gKiBtb2RlLiBJdCBpcyB1cCB0byB0aGUgdXNlciAoQ2RrTGlzdGJveCkgdG8gY2hlY2sgZm9yIGludmFsaWQgc2VsZWN0aW9ucy5cbiAqL1xuY2xhc3MgTGlzdGJveFNlbGVjdGlvbk1vZGVsPFQ+IGV4dGVuZHMgU2VsZWN0aW9uTW9kZWw8VD4ge1xuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgbXVsdGlwbGUgPSBmYWxzZSxcbiAgICBpbml0aWFsbHlTZWxlY3RlZFZhbHVlcz86IFRbXSxcbiAgICBlbWl0Q2hhbmdlcyA9IHRydWUsXG4gICAgY29tcGFyZVdpdGg/OiAobzE6IFQsIG8yOiBUKSA9PiBib29sZWFuLFxuICApIHtcbiAgICBzdXBlcih0cnVlLCBpbml0aWFsbHlTZWxlY3RlZFZhbHVlcywgZW1pdENoYW5nZXMsIGNvbXBhcmVXaXRoKTtcbiAgfVxuXG4gIG92ZXJyaWRlIGlzTXVsdGlwbGVTZWxlY3Rpb24oKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMubXVsdGlwbGU7XG4gIH1cblxuICBvdmVycmlkZSBzZWxlY3QoLi4udmFsdWVzOiBUW10pIHtcbiAgICAvLyBUaGUgc3VwZXIgY2xhc3MgaXMgYWx3YXlzIGluIG11bHRpLXNlbGVjdGlvbiBtb2RlLCBzbyB3ZSBuZWVkIHRvIG92ZXJyaWRlIHRoZSBiZWhhdmlvciBpZlxuICAgIC8vIHRoaXMgc2VsZWN0aW9uIG1vZGVsIGFjdHVhbGx5IGJlbG9uZ3MgdG8gYSBzaW5nbGUtc2VsZWN0aW9uIGxpc3Rib3guXG4gICAgaWYgKHRoaXMubXVsdGlwbGUpIHtcbiAgICAgIHJldHVybiBzdXBlci5zZWxlY3QoLi4udmFsdWVzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHN1cGVyLnNldFNlbGVjdGlvbiguLi52YWx1ZXMpO1xuICAgIH1cbiAgfVxufVxuXG4vKiogQSBzZWxlY3RhYmxlIG9wdGlvbiBpbiBhIGxpc3Rib3guICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbY2RrT3B0aW9uXScsXG4gIGV4cG9ydEFzOiAnY2RrT3B0aW9uJyxcbiAgaG9zdDoge1xuICAgICdyb2xlJzogJ29wdGlvbicsXG4gICAgJ2NsYXNzJzogJ2Nkay1vcHRpb24nLFxuICAgICdbaWRdJzogJ2lkJyxcbiAgICAnW2F0dHIuYXJpYS1zZWxlY3RlZF0nOiAnaXNTZWxlY3RlZCgpIHx8IG51bGwnLFxuICAgICdbYXR0ci50YWJpbmRleF0nOiAnX2dldFRhYkluZGV4KCknLFxuICAgICdbYXR0ci5hcmlhLWRpc2FibGVkXSc6ICdkaXNhYmxlZCB8fCBudWxsJyxcbiAgICAnW2NsYXNzLmNkay1vcHRpb24tYWN0aXZlXSc6ICdpc0FjdGl2ZSgpJyxcbiAgICAnKGNsaWNrKSc6ICdfY2xpY2tlZC5uZXh0KCRldmVudCknLFxuICAgICcoZm9jdXMpJzogJ19oYW5kbGVGb2N1cygpJyxcbiAgfSxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrT3B0aW9uPFQgPSB1bmtub3duPiBpbXBsZW1lbnRzIExpc3RLZXlNYW5hZ2VyT3B0aW9uLCBIaWdobGlnaHRhYmxlLCBPbkRlc3Ryb3kge1xuICAvKiogVGhlIGlkIG9mIHRoZSBvcHRpb24ncyBob3N0IGVsZW1lbnQuICovXG4gIEBJbnB1dCgpXG4gIGdldCBpZCgpIHtcbiAgICByZXR1cm4gdGhpcy5faWQgfHwgdGhpcy5fZ2VuZXJhdGVkSWQ7XG4gIH1cbiAgc2V0IGlkKHZhbHVlKSB7XG4gICAgdGhpcy5faWQgPSB2YWx1ZTtcbiAgfVxuICBwcml2YXRlIF9pZDogc3RyaW5nO1xuICBwcml2YXRlIF9nZW5lcmF0ZWRJZCA9IGBjZGstb3B0aW9uLSR7bmV4dElkKyt9YDtcblxuICAvKiogVGhlIHZhbHVlIG9mIHRoaXMgb3B0aW9uLiAqL1xuICBASW5wdXQoJ2Nka09wdGlvbicpIHZhbHVlOiBUO1xuXG4gIC8qKlxuICAgKiBUaGUgdGV4dCB1c2VkIHRvIGxvY2F0ZSB0aGlzIGl0ZW0gZHVyaW5nIGxpc3Rib3ggdHlwZWFoZWFkLiBJZiBub3Qgc3BlY2lmaWVkLFxuICAgKiB0aGUgYHRleHRDb250ZW50YCBvZiB0aGUgaXRlbSB3aWxsIGJlIHVzZWQuXG4gICAqL1xuICBASW5wdXQoJ2Nka09wdGlvblR5cGVhaGVhZExhYmVsJykgdHlwZWFoZWFkTGFiZWw6IHN0cmluZztcblxuICAvKiogV2hldGhlciB0aGlzIG9wdGlvbiBpcyBkaXNhYmxlZC4gKi9cbiAgQElucHV0KCdjZGtPcHRpb25EaXNhYmxlZCcpXG4gIGdldCBkaXNhYmxlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5saXN0Ym94LmRpc2FibGVkIHx8IHRoaXMuX2Rpc2FibGVkO1xuICB9XG4gIHNldCBkaXNhYmxlZCh2YWx1ZTogQm9vbGVhbklucHV0KSB7XG4gICAgdGhpcy5fZGlzYWJsZWQgPSBjb2VyY2VCb29sZWFuUHJvcGVydHkodmFsdWUpO1xuICB9XG4gIHByaXZhdGUgX2Rpc2FibGVkOiBib29sZWFuID0gZmFsc2U7XG5cbiAgLyoqIFRoZSB0YWJpbmRleCBvZiB0aGUgb3B0aW9uIHdoZW4gaXQgaXMgZW5hYmxlZC4gKi9cbiAgQElucHV0KCd0YWJpbmRleCcpXG4gIGdldCBlbmFibGVkVGFiSW5kZXgoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2VuYWJsZWRUYWJJbmRleCA9PT0gdW5kZWZpbmVkXG4gICAgICA/IHRoaXMubGlzdGJveC5lbmFibGVkVGFiSW5kZXhcbiAgICAgIDogdGhpcy5fZW5hYmxlZFRhYkluZGV4O1xuICB9XG4gIHNldCBlbmFibGVkVGFiSW5kZXgodmFsdWUpIHtcbiAgICB0aGlzLl9lbmFibGVkVGFiSW5kZXggPSB2YWx1ZTtcbiAgfVxuICBwcml2YXRlIF9lbmFibGVkVGFiSW5kZXg/OiBudW1iZXIgfCBudWxsO1xuXG4gIC8qKiBUaGUgb3B0aW9uJ3MgaG9zdCBlbGVtZW50ICovXG4gIHJlYWRvbmx5IGVsZW1lbnQ6IEhUTUxFbGVtZW50ID0gaW5qZWN0KEVsZW1lbnRSZWYpLm5hdGl2ZUVsZW1lbnQ7XG5cbiAgLyoqIFRoZSBwYXJlbnQgbGlzdGJveCB0aGlzIG9wdGlvbiBiZWxvbmdzIHRvLiAqL1xuICBwcm90ZWN0ZWQgcmVhZG9ubHkgbGlzdGJveDogQ2RrTGlzdGJveDxUPiA9IGluamVjdChDZGtMaXN0Ym94KTtcblxuICAvKiogRW1pdHMgd2hlbiB0aGUgb3B0aW9uIGlzIGRlc3Ryb3llZC4gKi9cbiAgcHJvdGVjdGVkIGRlc3Ryb3llZCA9IG5ldyBTdWJqZWN0PHZvaWQ+KCk7XG5cbiAgLyoqIEVtaXRzIHdoZW4gdGhlIG9wdGlvbiBpcyBjbGlja2VkLiAqL1xuICByZWFkb25seSBfY2xpY2tlZCA9IG5ldyBTdWJqZWN0PE1vdXNlRXZlbnQ+KCk7XG5cbiAgLyoqIFdoZXRoZXIgdGhlIG9wdGlvbiBpcyBjdXJyZW50bHkgYWN0aXZlLiAqL1xuICBwcml2YXRlIF9hY3RpdmUgPSBmYWxzZTtcblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICB0aGlzLmRlc3Ryb3llZC5uZXh0KCk7XG4gICAgdGhpcy5kZXN0cm95ZWQuY29tcGxldGUoKTtcbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoaXMgb3B0aW9uIGlzIHNlbGVjdGVkLiAqL1xuICBpc1NlbGVjdGVkKCkge1xuICAgIHJldHVybiB0aGlzLmxpc3Rib3guaXNTZWxlY3RlZCh0aGlzKTtcbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoaXMgb3B0aW9uIGlzIGFjdGl2ZS4gKi9cbiAgaXNBY3RpdmUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2FjdGl2ZTtcbiAgfVxuXG4gIC8qKiBUb2dnbGUgdGhlIHNlbGVjdGVkIHN0YXRlIG9mIHRoaXMgb3B0aW9uLiAqL1xuICB0b2dnbGUoKSB7XG4gICAgdGhpcy5saXN0Ym94LnRvZ2dsZSh0aGlzKTtcbiAgfVxuXG4gIC8qKiBTZWxlY3QgdGhpcyBvcHRpb24gaWYgaXQgaXMgbm90IHNlbGVjdGVkLiAqL1xuICBzZWxlY3QoKSB7XG4gICAgdGhpcy5saXN0Ym94LnNlbGVjdCh0aGlzKTtcbiAgfVxuXG4gIC8qKiBEZXNlbGVjdCB0aGlzIG9wdGlvbiBpZiBpdCBpcyBzZWxlY3RlZC4gKi9cbiAgZGVzZWxlY3QoKSB7XG4gICAgdGhpcy5saXN0Ym94LmRlc2VsZWN0KHRoaXMpO1xuICB9XG5cbiAgLyoqIEZvY3VzIHRoaXMgb3B0aW9uLiAqL1xuICBmb2N1cygpIHtcbiAgICB0aGlzLmVsZW1lbnQuZm9jdXMoKTtcbiAgfVxuXG4gIC8qKiBHZXQgdGhlIGxhYmVsIGZvciB0aGlzIGVsZW1lbnQgd2hpY2ggaXMgcmVxdWlyZWQgYnkgdGhlIEZvY3VzYWJsZU9wdGlvbiBpbnRlcmZhY2UuICovXG4gIGdldExhYmVsKCkge1xuICAgIHJldHVybiAodGhpcy50eXBlYWhlYWRMYWJlbCA/PyB0aGlzLmVsZW1lbnQudGV4dENvbnRlbnQ/LnRyaW0oKSkgfHwgJyc7XG4gIH1cblxuICAvKipcbiAgICogU2V0IHRoZSBvcHRpb24gYXMgYWN0aXZlLlxuICAgKiBAZG9jcy1wcml2YXRlXG4gICAqL1xuICBzZXRBY3RpdmVTdHlsZXMoKSB7XG4gICAgdGhpcy5fYWN0aXZlID0gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgdGhlIG9wdGlvbiBhcyBpbmFjdGl2ZS5cbiAgICogQGRvY3MtcHJpdmF0ZVxuICAgKi9cbiAgc2V0SW5hY3RpdmVTdHlsZXMoKSB7XG4gICAgdGhpcy5fYWN0aXZlID0gZmFsc2U7XG4gIH1cblxuICAvKiogSGFuZGxlIGZvY3VzIGV2ZW50cyBvbiB0aGUgb3B0aW9uLiAqL1xuICBwcm90ZWN0ZWQgX2hhbmRsZUZvY3VzKCkge1xuICAgIC8vIE9wdGlvbnMgY2FuIHdpbmQgdXAgZ2V0dGluZyBmb2N1c2VkIGluIGFjdGl2ZSBkZXNjZW5kYW50IG1vZGUgaWYgdGhlIHVzZXIgY2xpY2tzIG9uIHRoZW0uXG4gICAgLy8gSW4gdGhpcyBjYXNlLCB3ZSBwdXNoIGZvY3VzIGJhY2sgdG8gdGhlIHBhcmVudCBsaXN0Ym94IHRvIHByZXZlbnQgYW4gZXh0cmEgdGFiIHN0b3Agd2hlblxuICAgIC8vIHRoZSB1c2VyIHBlcmZvcm1zIGEgc2hpZnQrdGFiLlxuICAgIGlmICh0aGlzLmxpc3Rib3gudXNlQWN0aXZlRGVzY2VuZGFudCkge1xuICAgICAgdGhpcy5saXN0Ym94Ll9zZXRBY3RpdmVPcHRpb24odGhpcyk7XG4gICAgICB0aGlzLmxpc3Rib3guZm9jdXMoKTtcbiAgICB9XG4gIH1cblxuICAvKiogR2V0IHRoZSB0YWJpbmRleCBmb3IgdGhpcyBvcHRpb24uICovXG4gIHByb3RlY3RlZCBfZ2V0VGFiSW5kZXgoKSB7XG4gICAgaWYgKHRoaXMubGlzdGJveC51c2VBY3RpdmVEZXNjZW5kYW50IHx8IHRoaXMuZGlzYWJsZWQpIHtcbiAgICAgIHJldHVybiAtMTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuaXNBY3RpdmUoKSA/IHRoaXMuZW5hYmxlZFRhYkluZGV4IDogLTE7XG4gIH1cbn1cblxuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW2Nka0xpc3Rib3hdJyxcbiAgZXhwb3J0QXM6ICdjZGtMaXN0Ym94JyxcbiAgaG9zdDoge1xuICAgICdyb2xlJzogJ2xpc3Rib3gnLFxuICAgICdjbGFzcyc6ICdjZGstbGlzdGJveCcsXG4gICAgJ1tpZF0nOiAnaWQnLFxuICAgICdbYXR0ci50YWJpbmRleF0nOiAnX2dldFRhYkluZGV4KCknLFxuICAgICdbYXR0ci5hcmlhLWRpc2FibGVkXSc6ICdkaXNhYmxlZCB8fCBudWxsJyxcbiAgICAnW2F0dHIuYXJpYS1tdWx0aXNlbGVjdGFibGVdJzogJ211bHRpcGxlIHx8IG51bGwnLFxuICAgICdbYXR0ci5hcmlhLWFjdGl2ZWRlc2NlbmRhbnRdJzogJ19nZXRBcmlhQWN0aXZlRGVzY2VuZGFudCgpJyxcbiAgICAnW2F0dHIuYXJpYS1vcmllbnRhdGlvbl0nOiAnb3JpZW50YXRpb24nLFxuICAgICcoZm9jdXMpJzogJ19oYW5kbGVGb2N1cygpJyxcbiAgICAnKGtleWRvd24pJzogJ19oYW5kbGVLZXlkb3duKCRldmVudCknLFxuICAgICcoZm9jdXNvdXQpJzogJ19oYW5kbGVGb2N1c091dCgkZXZlbnQpJyxcbiAgfSxcbiAgcHJvdmlkZXJzOiBbXG4gICAge1xuICAgICAgcHJvdmlkZTogTkdfVkFMVUVfQUNDRVNTT1IsXG4gICAgICB1c2VFeGlzdGluZzogZm9yd2FyZFJlZigoKSA9PiBDZGtMaXN0Ym94KSxcbiAgICAgIG11bHRpOiB0cnVlLFxuICAgIH0sXG4gICAge1xuICAgICAgcHJvdmlkZTogTkdfVkFMSURBVE9SUyxcbiAgICAgIHVzZUV4aXN0aW5nOiBmb3J3YXJkUmVmKCgpID0+IENka0xpc3Rib3gpLFxuICAgICAgbXVsdGk6IHRydWUsXG4gICAgfSxcbiAgXSxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrTGlzdGJveDxUID0gdW5rbm93bj5cbiAgaW1wbGVtZW50cyBBZnRlckNvbnRlbnRJbml0LCBPbkRlc3Ryb3ksIENvbnRyb2xWYWx1ZUFjY2Vzc29yLCBWYWxpZGF0b3JcbntcbiAgLyoqIFRoZSBpZCBvZiB0aGUgb3B0aW9uJ3MgaG9zdCBlbGVtZW50LiAqL1xuICBASW5wdXQoKVxuICBnZXQgaWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2lkIHx8IHRoaXMuX2dlbmVyYXRlZElkO1xuICB9XG4gIHNldCBpZCh2YWx1ZSkge1xuICAgIHRoaXMuX2lkID0gdmFsdWU7XG4gIH1cbiAgcHJpdmF0ZSBfaWQ6IHN0cmluZztcbiAgcHJpdmF0ZSBfZ2VuZXJhdGVkSWQgPSBgY2RrLWxpc3Rib3gtJHtuZXh0SWQrK31gO1xuXG4gIC8qKiBUaGUgdGFiaW5kZXggdG8gdXNlIHdoZW4gdGhlIGxpc3Rib3ggaXMgZW5hYmxlZC4gKi9cbiAgQElucHV0KCd0YWJpbmRleCcpXG4gIGdldCBlbmFibGVkVGFiSW5kZXgoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2VuYWJsZWRUYWJJbmRleCA9PT0gdW5kZWZpbmVkID8gMCA6IHRoaXMuX2VuYWJsZWRUYWJJbmRleDtcbiAgfVxuICBzZXQgZW5hYmxlZFRhYkluZGV4KHZhbHVlKSB7XG4gICAgdGhpcy5fZW5hYmxlZFRhYkluZGV4ID0gdmFsdWU7XG4gIH1cbiAgcHJpdmF0ZSBfZW5hYmxlZFRhYkluZGV4PzogbnVtYmVyIHwgbnVsbDtcblxuICAvKiogVGhlIHZhbHVlIHNlbGVjdGVkIGluIHRoZSBsaXN0Ym94LCByZXByZXNlbnRlZCBhcyBhbiBhcnJheSBvZiBvcHRpb24gdmFsdWVzLiAqL1xuICBASW5wdXQoJ2Nka0xpc3Rib3hWYWx1ZScpXG4gIGdldCB2YWx1ZSgpOiByZWFkb25seSBUW10ge1xuICAgIHJldHVybiB0aGlzLl9pbnZhbGlkID8gW10gOiB0aGlzLnNlbGVjdGlvbk1vZGVsLnNlbGVjdGVkO1xuICB9XG4gIHNldCB2YWx1ZSh2YWx1ZTogcmVhZG9ubHkgVFtdKSB7XG4gICAgdGhpcy5fc2V0U2VsZWN0aW9uKHZhbHVlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoZSBsaXN0Ym94IGFsbG93cyBtdWx0aXBsZSBvcHRpb25zIHRvIGJlIHNlbGVjdGVkLiBJZiB0aGUgdmFsdWUgc3dpdGNoZXMgZnJvbSBgdHJ1ZWBcbiAgICogdG8gYGZhbHNlYCwgYW5kIG1vcmUgdGhhbiBvbmUgb3B0aW9uIGlzIHNlbGVjdGVkLCBhbGwgb3B0aW9ucyBhcmUgZGVzZWxlY3RlZC5cbiAgICovXG4gIEBJbnB1dCgnY2RrTGlzdGJveE11bHRpcGxlJylcbiAgZ2V0IG11bHRpcGxlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnNlbGVjdGlvbk1vZGVsLm11bHRpcGxlO1xuICB9XG4gIHNldCBtdWx0aXBsZSh2YWx1ZTogQm9vbGVhbklucHV0KSB7XG4gICAgdGhpcy5zZWxlY3Rpb25Nb2RlbC5tdWx0aXBsZSA9IGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eSh2YWx1ZSk7XG4gICAgdGhpcy5fdXBkYXRlSW50ZXJuYWxWYWx1ZSgpO1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGxpc3Rib3ggaXMgZGlzYWJsZWQuICovXG4gIEBJbnB1dCgnY2RrTGlzdGJveERpc2FibGVkJylcbiAgZ2V0IGRpc2FibGVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9kaXNhYmxlZDtcbiAgfVxuICBzZXQgZGlzYWJsZWQodmFsdWU6IEJvb2xlYW5JbnB1dCkge1xuICAgIHRoaXMuX2Rpc2FibGVkID0gY29lcmNlQm9vbGVhblByb3BlcnR5KHZhbHVlKTtcbiAgfVxuICBwcml2YXRlIF9kaXNhYmxlZDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSBsaXN0Ym94IHdpbGwgdXNlIGFjdGl2ZSBkZXNjZW5kYW50IG9yIHdpbGwgbW92ZSBmb2N1cyBvbnRvIHRoZSBvcHRpb25zLiAqL1xuICBASW5wdXQoJ2Nka0xpc3Rib3hVc2VBY3RpdmVEZXNjZW5kYW50JylcbiAgZ2V0IHVzZUFjdGl2ZURlc2NlbmRhbnQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX3VzZUFjdGl2ZURlc2NlbmRhbnQ7XG4gIH1cbiAgc2V0IHVzZUFjdGl2ZURlc2NlbmRhbnQoc2hvdWxkVXNlQWN0aXZlRGVzY2VuZGFudDogQm9vbGVhbklucHV0KSB7XG4gICAgdGhpcy5fdXNlQWN0aXZlRGVzY2VuZGFudCA9IGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eShzaG91bGRVc2VBY3RpdmVEZXNjZW5kYW50KTtcbiAgfVxuICBwcml2YXRlIF91c2VBY3RpdmVEZXNjZW5kYW50OiBib29sZWFuID0gZmFsc2U7XG5cbiAgLyoqIFRoZSBvcmllbnRhdGlvbiBvZiB0aGUgbGlzdGJveC4gT25seSBhZmZlY3RzIGtleWJvYXJkIGludGVyYWN0aW9uLCBub3QgdmlzdWFsIGxheW91dC4gKi9cbiAgQElucHV0KCdjZGtMaXN0Ym94T3JpZW50YXRpb24nKVxuICBnZXQgb3JpZW50YXRpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuX29yaWVudGF0aW9uO1xuICB9XG4gIHNldCBvcmllbnRhdGlvbih2YWx1ZTogJ2hvcml6b250YWwnIHwgJ3ZlcnRpY2FsJykge1xuICAgIHRoaXMuX29yaWVudGF0aW9uID0gdmFsdWUgPT09ICdob3Jpem9udGFsJyA/ICdob3Jpem9udGFsJyA6ICd2ZXJ0aWNhbCc7XG4gICAgaWYgKHZhbHVlID09PSAnaG9yaXpvbnRhbCcpIHtcbiAgICAgIHRoaXMubGlzdEtleU1hbmFnZXI/LndpdGhIb3Jpem9udGFsT3JpZW50YXRpb24odGhpcy5fZGlyPy52YWx1ZSB8fCAnbHRyJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubGlzdEtleU1hbmFnZXI/LndpdGhWZXJ0aWNhbE9yaWVudGF0aW9uKCk7XG4gICAgfVxuICB9XG4gIHByaXZhdGUgX29yaWVudGF0aW9uOiAnaG9yaXpvbnRhbCcgfCAndmVydGljYWwnID0gJ3ZlcnRpY2FsJztcblxuICAvKiogVGhlIGZ1bmN0aW9uIHVzZWQgdG8gY29tcGFyZSBvcHRpb24gdmFsdWVzLiAqL1xuICBASW5wdXQoJ2Nka0xpc3Rib3hDb21wYXJlV2l0aCcpXG4gIGdldCBjb21wYXJlV2l0aCgpOiB1bmRlZmluZWQgfCAoKG8xOiBULCBvMjogVCkgPT4gYm9vbGVhbikge1xuICAgIHJldHVybiB0aGlzLnNlbGVjdGlvbk1vZGVsLmNvbXBhcmVXaXRoO1xuICB9XG4gIHNldCBjb21wYXJlV2l0aChmbjogdW5kZWZpbmVkIHwgKChvMTogVCwgbzI6IFQpID0+IGJvb2xlYW4pKSB7XG4gICAgdGhpcy5zZWxlY3Rpb25Nb2RlbC5jb21wYXJlV2l0aCA9IGZuO1xuICB9XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhlIGtleWJvYXJkIG5hdmlnYXRpb24gc2hvdWxkIHdyYXAgd2hlbiB0aGUgdXNlciBwcmVzc2VzIGFycm93IGRvd24gb24gdGhlIGxhc3QgaXRlbVxuICAgKiBvciBhcnJvdyB1cCBvbiB0aGUgZmlyc3QgaXRlbS5cbiAgICovXG4gIEBJbnB1dCgnY2RrTGlzdGJveE5hdmlnYXRpb25XcmFwRGlzYWJsZWQnKVxuICBnZXQgbmF2aWdhdGlvbldyYXBEaXNhYmxlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5fbmF2aWdhdGlvbldyYXBEaXNhYmxlZDtcbiAgfVxuICBzZXQgbmF2aWdhdGlvbldyYXBEaXNhYmxlZCh3cmFwOiBCb29sZWFuSW5wdXQpIHtcbiAgICB0aGlzLl9uYXZpZ2F0aW9uV3JhcERpc2FibGVkID0gY29lcmNlQm9vbGVhblByb3BlcnR5KHdyYXApO1xuICAgIHRoaXMubGlzdEtleU1hbmFnZXI/LndpdGhXcmFwKCF0aGlzLl9uYXZpZ2F0aW9uV3JhcERpc2FibGVkKTtcbiAgfVxuICBwcml2YXRlIF9uYXZpZ2F0aW9uV3JhcERpc2FibGVkID0gZmFsc2U7XG5cbiAgLyoqIFdoZXRoZXIga2V5Ym9hcmQgbmF2aWdhdGlvbiBzaG91bGQgc2tpcCBvdmVyIGRpc2FibGVkIGl0ZW1zLiAqL1xuICBASW5wdXQoJ2Nka0xpc3Rib3hOYXZpZ2F0ZXNEaXNhYmxlZE9wdGlvbnMnKVxuICBnZXQgbmF2aWdhdGVEaXNhYmxlZE9wdGlvbnMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX25hdmlnYXRlRGlzYWJsZWRPcHRpb25zO1xuICB9XG4gIHNldCBuYXZpZ2F0ZURpc2FibGVkT3B0aW9ucyhza2lwOiBCb29sZWFuSW5wdXQpIHtcbiAgICB0aGlzLl9uYXZpZ2F0ZURpc2FibGVkT3B0aW9ucyA9IGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eShza2lwKTtcbiAgICB0aGlzLmxpc3RLZXlNYW5hZ2VyPy5za2lwUHJlZGljYXRlKFxuICAgICAgdGhpcy5fbmF2aWdhdGVEaXNhYmxlZE9wdGlvbnMgPyB0aGlzLl9za2lwTm9uZVByZWRpY2F0ZSA6IHRoaXMuX3NraXBEaXNhYmxlZFByZWRpY2F0ZSxcbiAgICApO1xuICB9XG4gIHByaXZhdGUgX25hdmlnYXRlRGlzYWJsZWRPcHRpb25zID0gZmFsc2U7XG5cbiAgLyoqIEVtaXRzIHdoZW4gdGhlIHNlbGVjdGVkIHZhbHVlKHMpIGluIHRoZSBsaXN0Ym94IGNoYW5nZS4gKi9cbiAgQE91dHB1dCgnY2RrTGlzdGJveFZhbHVlQ2hhbmdlJykgcmVhZG9ubHkgdmFsdWVDaGFuZ2UgPSBuZXcgU3ViamVjdDxMaXN0Ym94VmFsdWVDaGFuZ2VFdmVudDxUPj4oKTtcblxuICAvKiogVGhlIGNoaWxkIG9wdGlvbnMgaW4gdGhpcyBsaXN0Ym94LiAqL1xuICBAQ29udGVudENoaWxkcmVuKENka09wdGlvbiwge2Rlc2NlbmRhbnRzOiB0cnVlfSkgcHJvdGVjdGVkIG9wdGlvbnM6IFF1ZXJ5TGlzdDxDZGtPcHRpb248VD4+O1xuXG4gIC8qKiBUaGUgc2VsZWN0aW9uIG1vZGVsIHVzZWQgYnkgdGhlIGxpc3Rib3guICovXG4gIHByb3RlY3RlZCBzZWxlY3Rpb25Nb2RlbCA9IG5ldyBMaXN0Ym94U2VsZWN0aW9uTW9kZWw8VD4oKTtcblxuICAvKiogVGhlIGtleSBtYW5hZ2VyIHRoYXQgbWFuYWdlcyBrZXlib2FyZCBuYXZpZ2F0aW9uIGZvciB0aGlzIGxpc3Rib3guICovXG4gIHByb3RlY3RlZCBsaXN0S2V5TWFuYWdlcjogQWN0aXZlRGVzY2VuZGFudEtleU1hbmFnZXI8Q2RrT3B0aW9uPFQ+PjtcblxuICAvKiogRW1pdHMgd2hlbiB0aGUgbGlzdGJveCBpcyBkZXN0cm95ZWQuICovXG4gIHByb3RlY3RlZCByZWFkb25seSBkZXN0cm95ZWQgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xuXG4gIC8qKiBUaGUgaG9zdCBlbGVtZW50IG9mIHRoZSBsaXN0Ym94LiAqL1xuICBwcm90ZWN0ZWQgcmVhZG9ubHkgZWxlbWVudDogSFRNTEVsZW1lbnQgPSBpbmplY3QoRWxlbWVudFJlZikubmF0aXZlRWxlbWVudDtcblxuICAvKiogVGhlIGNoYW5nZSBkZXRlY3RvciBmb3IgdGhpcyBsaXN0Ym94LiAqL1xuICBwcm90ZWN0ZWQgcmVhZG9ubHkgY2hhbmdlRGV0ZWN0b3JSZWYgPSBpbmplY3QoQ2hhbmdlRGV0ZWN0b3JSZWYpO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSBjdXJyZW50bHkgc2VsZWN0ZWQgdmFsdWUgaW4gdGhlIHNlbGVjdGlvbiBtb2RlbCBpcyBpbnZhbGlkLiAqL1xuICBwcml2YXRlIF9pbnZhbGlkID0gZmFsc2U7XG5cbiAgLyoqIFRoZSBsYXN0IHVzZXItdHJpZ2dlcmVkIG9wdGlvbi4gKi9cbiAgcHJpdmF0ZSBfbGFzdFRyaWdnZXJlZDogQ2RrT3B0aW9uPFQ+IHwgbnVsbCA9IG51bGw7XG5cbiAgLyoqIENhbGxiYWNrIGNhbGxlZCB3aGVuIHRoZSBsaXN0Ym94IGhhcyBiZWVuIHRvdWNoZWQgKi9cbiAgcHJpdmF0ZSBfb25Ub3VjaGVkID0gKCkgPT4ge307XG5cbiAgLyoqIENhbGxiYWNrIGNhbGxlZCB3aGVuIHRoZSBsaXN0Ym94IHZhbHVlIGNoYW5nZXMgKi9cbiAgcHJpdmF0ZSBfb25DaGFuZ2U6ICh2YWx1ZTogcmVhZG9ubHkgVFtdKSA9PiB2b2lkID0gKCkgPT4ge307XG5cbiAgLyoqIENhbGxiYWNrIGNhbGxlZCB3aGVuIHRoZSBmb3JtIHZhbGlkYXRvciBjaGFuZ2VzLiAqL1xuICBwcml2YXRlIF9vblZhbGlkYXRvckNoYW5nZSA9ICgpID0+IHt9O1xuXG4gIC8qKiBFbWl0cyB3aGVuIGFuIG9wdGlvbiBoYXMgYmVlbiBjbGlja2VkLiAqL1xuICBwcml2YXRlIF9vcHRpb25DbGlja2VkID0gZGVmZXIoKCkgPT5cbiAgICAodGhpcy5vcHRpb25zLmNoYW5nZXMgYXMgT2JzZXJ2YWJsZTxDZGtPcHRpb248VD5bXT4pLnBpcGUoXG4gICAgICBzdGFydFdpdGgodGhpcy5vcHRpb25zKSxcbiAgICAgIHN3aXRjaE1hcChvcHRpb25zID0+XG4gICAgICAgIG1lcmdlKC4uLm9wdGlvbnMubWFwKG9wdGlvbiA9PiBvcHRpb24uX2NsaWNrZWQucGlwZShtYXAoZXZlbnQgPT4gKHtvcHRpb24sIGV2ZW50fSkpKSkpLFxuICAgICAgKSxcbiAgICApLFxuICApO1xuXG4gIC8qKiBUaGUgZGlyZWN0aW9uYWxpdHkgb2YgdGhlIHBhZ2UuICovXG4gIHByaXZhdGUgcmVhZG9ubHkgX2RpciA9IGluamVjdChEaXJlY3Rpb25hbGl0eSwgSW5qZWN0RmxhZ3MuT3B0aW9uYWwpO1xuXG4gIC8qKiBBIHByZWRpY2F0ZSB0aGF0IHNraXBzIGRpc2FibGVkIG9wdGlvbnMuICovXG4gIHByaXZhdGUgcmVhZG9ubHkgX3NraXBEaXNhYmxlZFByZWRpY2F0ZSA9IChvcHRpb246IENka09wdGlvbjxUPikgPT4gb3B0aW9uLmRpc2FibGVkO1xuXG4gIC8qKiBBIHByZWRpY2F0ZSB0aGF0IGRvZXMgbm90IHNraXAgYW55IG9wdGlvbnMuICovXG4gIHByaXZhdGUgcmVhZG9ubHkgX3NraXBOb25lUHJlZGljYXRlID0gKCkgPT4gZmFsc2U7XG5cbiAgLyoqXG4gICAqIFZhbGlkYXRvciB0aGF0IHByb2R1Y2VzIGFuIGVycm9yIGlmIG11bHRpcGxlIHZhbHVlcyBhcmUgc2VsZWN0ZWQgaW4gYSBzaW5nbGUgc2VsZWN0aW9uXG4gICAqIGxpc3Rib3guXG4gICAqIEBwYXJhbSBjb250cm9sIFRoZSBjb250cm9sIHRvIHZhbGlkYXRlXG4gICAqIEByZXR1cm4gQSB2YWxpZGF0aW9uIGVycm9yIG9yIG51bGxcbiAgICovXG4gIHByaXZhdGUgX3ZhbGlkYXRlVW5leHBlY3RlZE11bHRpcGxlVmFsdWVzOiBWYWxpZGF0b3JGbiA9IChjb250cm9sOiBBYnN0cmFjdENvbnRyb2wpID0+IHtcbiAgICBjb25zdCBjb250cm9sVmFsdWUgPSB0aGlzLl9jb2VyY2VWYWx1ZShjb250cm9sLnZhbHVlKTtcbiAgICBpZiAoIXRoaXMubXVsdGlwbGUgJiYgY29udHJvbFZhbHVlLmxlbmd0aCA+IDEpIHtcbiAgICAgIHJldHVybiB7J2Nka0xpc3Rib3hVbmV4cGVjdGVkTXVsdGlwbGVWYWx1ZXMnOiB0cnVlfTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH07XG5cbiAgLyoqXG4gICAqIFZhbGlkYXRvciB0aGF0IHByb2R1Y2VzIGFuIGVycm9yIGlmIGFueSBzZWxlY3RlZCB2YWx1ZXMgYXJlIG5vdCB2YWxpZCBvcHRpb25zIGZvciB0aGlzIGxpc3Rib3guXG4gICAqIEBwYXJhbSBjb250cm9sIFRoZSBjb250cm9sIHRvIHZhbGlkYXRlXG4gICAqIEByZXR1cm4gQSB2YWxpZGF0aW9uIGVycm9yIG9yIG51bGxcbiAgICovXG4gIHByaXZhdGUgX3ZhbGlkYXRlVW5leHBlY3RlZE9wdGlvblZhbHVlczogVmFsaWRhdG9yRm4gPSAoY29udHJvbDogQWJzdHJhY3RDb250cm9sKSA9PiB7XG4gICAgY29uc3QgY29udHJvbFZhbHVlID0gdGhpcy5fY29lcmNlVmFsdWUoY29udHJvbC52YWx1ZSk7XG4gICAgY29uc3QgaW52YWxpZFZhbHVlcyA9IHRoaXMuX2dldEludmFsaWRPcHRpb25WYWx1ZXMoY29udHJvbFZhbHVlKTtcbiAgICBpZiAoaW52YWxpZFZhbHVlcy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiB7J2Nka0xpc3Rib3hVbmV4cGVjdGVkT3B0aW9uVmFsdWVzJzogeyd2YWx1ZXMnOiBpbnZhbGlkVmFsdWVzfX07XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9O1xuXG4gIC8qKiBUaGUgY29tYmluZWQgc2V0IG9mIHZhbGlkYXRvcnMgZm9yIHRoaXMgbGlzdGJveC4gKi9cbiAgcHJpdmF0ZSBfdmFsaWRhdG9ycyA9IFZhbGlkYXRvcnMuY29tcG9zZShbXG4gICAgdGhpcy5fdmFsaWRhdGVVbmV4cGVjdGVkTXVsdGlwbGVWYWx1ZXMsXG4gICAgdGhpcy5fdmFsaWRhdGVVbmV4cGVjdGVkT3B0aW9uVmFsdWVzLFxuICBdKSE7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgLy8gVXBkYXRlIHRoZSBpbnRlcm5hbCB2YWx1ZSB3aGVuZXZlciB0aGUgc2VsZWN0aW9uIG1vZGVsJ3Mgc2VsZWN0aW9uIGNoYW5nZXMuXG4gICAgdGhpcy5zZWxlY3Rpb25Nb2RlbC5jaGFuZ2VkLnBpcGUoc3RhcnRXaXRoKG51bGwpLCB0YWtlVW50aWwodGhpcy5kZXN0cm95ZWQpKS5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgdGhpcy5fdXBkYXRlSW50ZXJuYWxWYWx1ZSgpO1xuICAgIH0pO1xuICB9XG5cbiAgbmdBZnRlckNvbnRlbnRJbml0KCkge1xuICAgIGlmICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpIHtcbiAgICAgIHRoaXMuX3ZlcmlmeU5vT3B0aW9uVmFsdWVDb2xsaXNpb25zKCk7XG4gICAgfVxuXG4gICAgdGhpcy5faW5pdEtleU1hbmFnZXIoKTtcblxuICAgIC8vIFVwZGF0ZSB0aGUgaW50ZXJuYWwgdmFsdWUgd2hlbmV2ZXIgdGhlIG9wdGlvbnMgY2hhbmdlLCBhcyB0aGlzIG1heSBjaGFuZ2UgdGhlIHZhbGlkaXR5IG9mXG4gICAgLy8gdGhlIGN1cnJlbnQgc2VsZWN0aW9uXG4gICAgdGhpcy5vcHRpb25zLmNoYW5nZXMucGlwZShzdGFydFdpdGgodGhpcy5vcHRpb25zKSwgdGFrZVVudGlsKHRoaXMuZGVzdHJveWVkKSkuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgIHRoaXMuX3VwZGF0ZUludGVybmFsVmFsdWUoKTtcbiAgICB9KTtcblxuICAgIHRoaXMuX29wdGlvbkNsaWNrZWRcbiAgICAgIC5waXBlKFxuICAgICAgICBmaWx0ZXIoKHtvcHRpb259KSA9PiAhb3B0aW9uLmRpc2FibGVkKSxcbiAgICAgICAgdGFrZVVudGlsKHRoaXMuZGVzdHJveWVkKSxcbiAgICAgIClcbiAgICAgIC5zdWJzY3JpYmUoKHtvcHRpb24sIGV2ZW50fSkgPT4gdGhpcy5faGFuZGxlT3B0aW9uQ2xpY2tlZChvcHRpb24sIGV2ZW50KSk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICB0aGlzLmxpc3RLZXlNYW5hZ2VyLmNoYW5nZS5jb21wbGV0ZSgpO1xuICAgIHRoaXMuZGVzdHJveWVkLm5leHQoKTtcbiAgICB0aGlzLmRlc3Ryb3llZC5jb21wbGV0ZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRvZ2dsZSB0aGUgc2VsZWN0ZWQgc3RhdGUgb2YgdGhlIGdpdmVuIG9wdGlvbi5cbiAgICogQHBhcmFtIG9wdGlvbiBUaGUgb3B0aW9uIHRvIHRvZ2dsZVxuICAgKi9cbiAgdG9nZ2xlKG9wdGlvbjogQ2RrT3B0aW9uPFQ+KSB7XG4gICAgdGhpcy50b2dnbGVWYWx1ZShvcHRpb24udmFsdWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRvZ2dsZSB0aGUgc2VsZWN0ZWQgc3RhdGUgb2YgdGhlIGdpdmVuIHZhbHVlLlxuICAgKiBAcGFyYW0gdmFsdWUgVGhlIHZhbHVlIHRvIHRvZ2dsZVxuICAgKi9cbiAgdG9nZ2xlVmFsdWUodmFsdWU6IFQpIHtcbiAgICBpZiAodGhpcy5faW52YWxpZCkge1xuICAgICAgdGhpcy5zZWxlY3Rpb25Nb2RlbC5jbGVhcihmYWxzZSk7XG4gICAgfVxuICAgIHRoaXMuc2VsZWN0aW9uTW9kZWwudG9nZ2xlKHZhbHVlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWxlY3QgdGhlIGdpdmVuIG9wdGlvbi5cbiAgICogQHBhcmFtIG9wdGlvbiBUaGUgb3B0aW9uIHRvIHNlbGVjdFxuICAgKi9cbiAgc2VsZWN0KG9wdGlvbjogQ2RrT3B0aW9uPFQ+KSB7XG4gICAgdGhpcy5zZWxlY3RWYWx1ZShvcHRpb24udmFsdWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlbGVjdCB0aGUgZ2l2ZW4gdmFsdWUuXG4gICAqIEBwYXJhbSB2YWx1ZSBUaGUgdmFsdWUgdG8gc2VsZWN0XG4gICAqL1xuICBzZWxlY3RWYWx1ZSh2YWx1ZTogVCkge1xuICAgIGlmICh0aGlzLl9pbnZhbGlkKSB7XG4gICAgICB0aGlzLnNlbGVjdGlvbk1vZGVsLmNsZWFyKGZhbHNlKTtcbiAgICB9XG4gICAgdGhpcy5zZWxlY3Rpb25Nb2RlbC5zZWxlY3QodmFsdWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIERlc2VsZWN0IHRoZSBnaXZlbiBvcHRpb24uXG4gICAqIEBwYXJhbSBvcHRpb24gVGhlIG9wdGlvbiB0byBkZXNlbGVjdFxuICAgKi9cbiAgZGVzZWxlY3Qob3B0aW9uOiBDZGtPcHRpb248VD4pIHtcbiAgICB0aGlzLmRlc2VsZWN0VmFsdWUob3B0aW9uLnZhbHVlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXNlbGVjdCB0aGUgZ2l2ZW4gdmFsdWUuXG4gICAqIEBwYXJhbSB2YWx1ZSBUaGUgdmFsdWUgdG8gZGVzZWxlY3RcbiAgICovXG4gIGRlc2VsZWN0VmFsdWUodmFsdWU6IFQpIHtcbiAgICBpZiAodGhpcy5faW52YWxpZCkge1xuICAgICAgdGhpcy5zZWxlY3Rpb25Nb2RlbC5jbGVhcihmYWxzZSk7XG4gICAgfVxuICAgIHRoaXMuc2VsZWN0aW9uTW9kZWwuZGVzZWxlY3QodmFsdWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCB0aGUgc2VsZWN0ZWQgc3RhdGUgb2YgYWxsIG9wdGlvbnMuXG4gICAqIEBwYXJhbSBpc1NlbGVjdGVkIFRoZSBuZXcgc2VsZWN0ZWQgc3RhdGUgdG8gc2V0XG4gICAqL1xuICBzZXRBbGxTZWxlY3RlZChpc1NlbGVjdGVkOiBib29sZWFuKSB7XG4gICAgaWYgKCFpc1NlbGVjdGVkKSB7XG4gICAgICB0aGlzLnNlbGVjdGlvbk1vZGVsLmNsZWFyKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0aGlzLl9pbnZhbGlkKSB7XG4gICAgICAgIHRoaXMuc2VsZWN0aW9uTW9kZWwuY2xlYXIoZmFsc2UpO1xuICAgICAgfVxuICAgICAgdGhpcy5zZWxlY3Rpb25Nb2RlbC5zZWxlY3QoLi4udGhpcy5vcHRpb25zLm1hcChvcHRpb24gPT4gb3B0aW9uLnZhbHVlKSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCB3aGV0aGVyIHRoZSBnaXZlbiBvcHRpb24gaXMgc2VsZWN0ZWQuXG4gICAqIEBwYXJhbSBvcHRpb24gVGhlIG9wdGlvbiB0byBnZXQgdGhlIHNlbGVjdGVkIHN0YXRlIG9mXG4gICAqL1xuICBpc1NlbGVjdGVkKG9wdGlvbjogQ2RrT3B0aW9uPFQ+KSB7XG4gICAgcmV0dXJuIHRoaXMuaXNWYWx1ZVNlbGVjdGVkKG9wdGlvbi52YWx1ZSk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHdoZXRoZXIgdGhlIGdpdmVuIHZhbHVlIGlzIHNlbGVjdGVkLlxuICAgKiBAcGFyYW0gdmFsdWUgVGhlIHZhbHVlIHRvIGdldCB0aGUgc2VsZWN0ZWQgc3RhdGUgb2ZcbiAgICovXG4gIGlzVmFsdWVTZWxlY3RlZCh2YWx1ZTogVCkge1xuICAgIGlmICh0aGlzLl9pbnZhbGlkKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnNlbGVjdGlvbk1vZGVsLmlzU2VsZWN0ZWQodmFsdWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVycyBhIGNhbGxiYWNrIHRvIGJlIGludm9rZWQgd2hlbiB0aGUgbGlzdGJveCdzIHZhbHVlIGNoYW5nZXMgZnJvbSB1c2VyIGlucHV0LlxuICAgKiBAcGFyYW0gZm4gVGhlIGNhbGxiYWNrIHRvIHJlZ2lzdGVyXG4gICAqIEBkb2NzLXByaXZhdGVcbiAgICovXG4gIHJlZ2lzdGVyT25DaGFuZ2UoZm46ICh2YWx1ZTogcmVhZG9ubHkgVFtdKSA9PiB2b2lkKTogdm9pZCB7XG4gICAgdGhpcy5fb25DaGFuZ2UgPSBmbjtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlcnMgYSBjYWxsYmFjayB0byBiZSBpbnZva2VkIHdoZW4gdGhlIGxpc3Rib3ggaXMgYmx1cnJlZCBieSB0aGUgdXNlci5cbiAgICogQHBhcmFtIGZuIFRoZSBjYWxsYmFjayB0byByZWdpc3RlclxuICAgKiBAZG9jcy1wcml2YXRlXG4gICAqL1xuICByZWdpc3Rlck9uVG91Y2hlZChmbjogKCkgPT4ge30pOiB2b2lkIHtcbiAgICB0aGlzLl9vblRvdWNoZWQgPSBmbjtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBsaXN0Ym94J3MgdmFsdWUuXG4gICAqIEBwYXJhbSB2YWx1ZSBUaGUgbmV3IHZhbHVlIG9mIHRoZSBsaXN0Ym94XG4gICAqIEBkb2NzLXByaXZhdGVcbiAgICovXG4gIHdyaXRlVmFsdWUodmFsdWU6IHJlYWRvbmx5IFRbXSk6IHZvaWQge1xuICAgIHRoaXMuX3NldFNlbGVjdGlvbih2YWx1ZSk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgZGlzYWJsZWQgc3RhdGUgb2YgdGhlIGxpc3Rib3guXG4gICAqIEBwYXJhbSBpc0Rpc2FibGVkIFRoZSBuZXcgZGlzYWJsZWQgc3RhdGVcbiAgICogQGRvY3MtcHJpdmF0ZVxuICAgKi9cbiAgc2V0RGlzYWJsZWRTdGF0ZShpc0Rpc2FibGVkOiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5kaXNhYmxlZCA9IGlzRGlzYWJsZWQ7XG4gIH1cblxuICAvKipcbiAgICogVmFsaWRhdGUgdGhlIGdpdmVuIGNvbnRyb2xcbiAgICogQGRvY3MtcHJpdmF0ZVxuICAgKi9cbiAgdmFsaWRhdGUoY29udHJvbDogQWJzdHJhY3RDb250cm9sPGFueSwgYW55Pik6IFZhbGlkYXRpb25FcnJvcnMgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5fdmFsaWRhdG9ycyhjb250cm9sKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlcnMgYSBjYWxsYmFjayB0byBiZSBjYWxsZWQgd2hlbiB0aGUgZm9ybSB2YWxpZGF0b3IgY2hhbmdlcy5cbiAgICogQHBhcmFtIGZuIFRoZSBjYWxsYmFjayB0byBjYWxsXG4gICAqIEBkb2NzLXByaXZhdGVcbiAgICovXG4gIHJlZ2lzdGVyT25WYWxpZGF0b3JDaGFuZ2UoZm46ICgpID0+IHZvaWQpIHtcbiAgICB0aGlzLl9vblZhbGlkYXRvckNoYW5nZSA9IGZuO1xuICB9XG5cbiAgLyoqIEZvY3VzIHRoZSBsaXN0Ym94J3MgaG9zdCBlbGVtZW50LiAqL1xuICBmb2N1cygpIHtcbiAgICB0aGlzLmVsZW1lbnQuZm9jdXMoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUcmlnZ2VycyB0aGUgZ2l2ZW4gb3B0aW9uIGluIHJlc3BvbnNlIHRvIHVzZXIgaW50ZXJhY3Rpb24uXG4gICAqIC0gSW4gc2luZ2xlIHNlbGVjdGlvbiBtb2RlOiBzZWxlY3RzIHRoZSBvcHRpb24gYW5kIGRlc2VsZWN0cyBhbnkgb3RoZXIgc2VsZWN0ZWQgb3B0aW9uLlxuICAgKiAtIEluIG11bHRpIHNlbGVjdGlvbiBtb2RlOiB0b2dnbGVzIHRoZSBzZWxlY3RlZCBzdGF0ZSBvZiB0aGUgb3B0aW9uLlxuICAgKiBAcGFyYW0gb3B0aW9uIFRoZSBvcHRpb24gdG8gdHJpZ2dlclxuICAgKi9cbiAgcHJvdGVjdGVkIHRyaWdnZXJPcHRpb24ob3B0aW9uOiBDZGtPcHRpb248VD4gfCBudWxsKSB7XG4gICAgaWYgKG9wdGlvbiAmJiAhb3B0aW9uLmRpc2FibGVkKSB7XG4gICAgICB0aGlzLl9sYXN0VHJpZ2dlcmVkID0gb3B0aW9uO1xuICAgICAgY29uc3QgY2hhbmdlZCA9IHRoaXMubXVsdGlwbGVcbiAgICAgICAgPyB0aGlzLnNlbGVjdGlvbk1vZGVsLnRvZ2dsZShvcHRpb24udmFsdWUpXG4gICAgICAgIDogdGhpcy5zZWxlY3Rpb25Nb2RlbC5zZWxlY3Qob3B0aW9uLnZhbHVlKTtcbiAgICAgIGlmIChjaGFuZ2VkKSB7XG4gICAgICAgIHRoaXMuX29uQ2hhbmdlKHRoaXMudmFsdWUpO1xuICAgICAgICB0aGlzLnZhbHVlQ2hhbmdlLm5leHQoe1xuICAgICAgICAgIHZhbHVlOiB0aGlzLnZhbHVlLFxuICAgICAgICAgIGxpc3Rib3g6IHRoaXMsXG4gICAgICAgICAgb3B0aW9uOiBvcHRpb24sXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUcmlnZ2VyIHRoZSBnaXZlbiByYW5nZSBvZiBvcHRpb25zIGluIHJlc3BvbnNlIHRvIHVzZXIgaW50ZXJhY3Rpb24uXG4gICAqIFNob3VsZCBvbmx5IGJlIGNhbGxlZCBpbiBtdWx0aS1zZWxlY3Rpb24gbW9kZS5cbiAgICogQHBhcmFtIHRyaWdnZXIgVGhlIG9wdGlvbiB0aGF0IHdhcyB0cmlnZ2VyZWRcbiAgICogQHBhcmFtIGZyb20gVGhlIHN0YXJ0IGluZGV4IG9mIHRoZSBvcHRpb25zIHRvIHRvZ2dsZVxuICAgKiBAcGFyYW0gdG8gVGhlIGVuZCBpbmRleCBvZiB0aGUgb3B0aW9ucyB0byB0b2dnbGVcbiAgICogQHBhcmFtIG9uIFdoZXRoZXIgdG8gdG9nZ2xlIHRoZSBvcHRpb24gcmFuZ2Ugb25cbiAgICovXG4gIHByb3RlY3RlZCB0cmlnZ2VyUmFuZ2UodHJpZ2dlcjogQ2RrT3B0aW9uPFQ+IHwgbnVsbCwgZnJvbTogbnVtYmVyLCB0bzogbnVtYmVyLCBvbjogYm9vbGVhbikge1xuICAgIGlmICh0aGlzLmRpc2FibGVkIHx8ICh0cmlnZ2VyICYmIHRyaWdnZXIuZGlzYWJsZWQpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuX2xhc3RUcmlnZ2VyZWQgPSB0cmlnZ2VyO1xuICAgIGNvbnN0IGlzRXF1YWwgPSB0aGlzLmNvbXBhcmVXaXRoID8/IE9iamVjdC5pcztcbiAgICBjb25zdCB1cGRhdGVWYWx1ZXMgPSBbLi4udGhpcy5vcHRpb25zXVxuICAgICAgLnNsaWNlKE1hdGgubWF4KDAsIE1hdGgubWluKGZyb20sIHRvKSksIE1hdGgubWluKHRoaXMub3B0aW9ucy5sZW5ndGgsIE1hdGgubWF4KGZyb20sIHRvKSArIDEpKVxuICAgICAgLmZpbHRlcihvcHRpb24gPT4gIW9wdGlvbi5kaXNhYmxlZClcbiAgICAgIC5tYXAob3B0aW9uID0+IG9wdGlvbi52YWx1ZSk7XG4gICAgY29uc3Qgc2VsZWN0ZWQgPSBbLi4udGhpcy52YWx1ZV07XG4gICAgZm9yIChjb25zdCB1cGRhdGVWYWx1ZSBvZiB1cGRhdGVWYWx1ZXMpIHtcbiAgICAgIGNvbnN0IHNlbGVjdGVkSW5kZXggPSBzZWxlY3RlZC5maW5kSW5kZXgoc2VsZWN0ZWRWYWx1ZSA9PlxuICAgICAgICBpc0VxdWFsKHNlbGVjdGVkVmFsdWUsIHVwZGF0ZVZhbHVlKSxcbiAgICAgICk7XG4gICAgICBpZiAob24gJiYgc2VsZWN0ZWRJbmRleCA9PT0gLTEpIHtcbiAgICAgICAgc2VsZWN0ZWQucHVzaCh1cGRhdGVWYWx1ZSk7XG4gICAgICB9IGVsc2UgaWYgKCFvbiAmJiBzZWxlY3RlZEluZGV4ICE9PSAtMSkge1xuICAgICAgICBzZWxlY3RlZC5zcGxpY2Uoc2VsZWN0ZWRJbmRleCwgMSk7XG4gICAgICB9XG4gICAgfVxuICAgIGxldCBjaGFuZ2VkID0gdGhpcy5zZWxlY3Rpb25Nb2RlbC5zZXRTZWxlY3Rpb24oLi4uc2VsZWN0ZWQpO1xuICAgIGlmIChjaGFuZ2VkKSB7XG4gICAgICB0aGlzLl9vbkNoYW5nZSh0aGlzLnZhbHVlKTtcbiAgICAgIHRoaXMudmFsdWVDaGFuZ2UubmV4dCh7XG4gICAgICAgIHZhbHVlOiB0aGlzLnZhbHVlLFxuICAgICAgICBsaXN0Ym94OiB0aGlzLFxuICAgICAgICBvcHRpb246IHRyaWdnZXIsXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgZ2l2ZW4gb3B0aW9uIGFzIGFjdGl2ZS5cbiAgICogQHBhcmFtIG9wdGlvbiBUaGUgb3B0aW9uIHRvIG1ha2UgYWN0aXZlXG4gICAqL1xuICBfc2V0QWN0aXZlT3B0aW9uKG9wdGlvbjogQ2RrT3B0aW9uPFQ+KSB7XG4gICAgdGhpcy5saXN0S2V5TWFuYWdlci5zZXRBY3RpdmVJdGVtKG9wdGlvbik7XG4gIH1cblxuICAvKiogQ2FsbGVkIHdoZW4gdGhlIGxpc3Rib3ggcmVjZWl2ZXMgZm9jdXMuICovXG4gIHByb3RlY3RlZCBfaGFuZGxlRm9jdXMoKSB7XG4gICAgaWYgKCF0aGlzLnVzZUFjdGl2ZURlc2NlbmRhbnQpIHtcbiAgICAgIHRoaXMubGlzdEtleU1hbmFnZXIuc2V0TmV4dEl0ZW1BY3RpdmUoKTtcbiAgICAgIHRoaXMuX2ZvY3VzQWN0aXZlT3B0aW9uKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIENhbGxlZCB3aGVuIHRoZSB1c2VyIHByZXNzZXMga2V5ZG93biBvbiB0aGUgbGlzdGJveC4gKi9cbiAgcHJvdGVjdGVkIF9oYW5kbGVLZXlkb3duKGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XG4gICAgaWYgKHRoaXMuX2Rpc2FibGVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qge2tleUNvZGV9ID0gZXZlbnQ7XG4gICAgY29uc3QgcHJldmlvdXNBY3RpdmVJbmRleCA9IHRoaXMubGlzdEtleU1hbmFnZXIuYWN0aXZlSXRlbUluZGV4O1xuICAgIGNvbnN0IGN0cmxLZXlzID0gWydjdHJsS2V5JywgJ21ldGFLZXknXSBhcyBjb25zdDtcblxuICAgIGlmICh0aGlzLm11bHRpcGxlICYmIGtleUNvZGUgPT09IEEgJiYgaGFzTW9kaWZpZXJLZXkoZXZlbnQsIC4uLmN0cmxLZXlzKSkge1xuICAgICAgLy8gVG9nZ2xlIGFsbCBvcHRpb25zIG9mZiBpZiB0aGV5J3JlIGFsbCBzZWxlY3RlZCwgb3RoZXJ3aXNlIHRvZ2dsZSB0aGVtIGFsbCBvbi5cbiAgICAgIHRoaXMudHJpZ2dlclJhbmdlKFxuICAgICAgICBudWxsLFxuICAgICAgICAwLFxuICAgICAgICB0aGlzLm9wdGlvbnMubGVuZ3RoIC0gMSxcbiAgICAgICAgdGhpcy5vcHRpb25zLmxlbmd0aCAhPT0gdGhpcy52YWx1ZS5sZW5ndGgsXG4gICAgICApO1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoXG4gICAgICB0aGlzLm11bHRpcGxlICYmXG4gICAgICAoa2V5Q29kZSA9PT0gU1BBQ0UgfHwga2V5Q29kZSA9PT0gRU5URVIpICYmXG4gICAgICBoYXNNb2RpZmllcktleShldmVudCwgJ3NoaWZ0S2V5JylcbiAgICApIHtcbiAgICAgIGlmICh0aGlzLmxpc3RLZXlNYW5hZ2VyLmFjdGl2ZUl0ZW0gJiYgdGhpcy5saXN0S2V5TWFuYWdlci5hY3RpdmVJdGVtSW5kZXggIT0gbnVsbCkge1xuICAgICAgICB0aGlzLnRyaWdnZXJSYW5nZShcbiAgICAgICAgICB0aGlzLmxpc3RLZXlNYW5hZ2VyLmFjdGl2ZUl0ZW0sXG4gICAgICAgICAgdGhpcy5fZ2V0TGFzdFRyaWdnZXJlZEluZGV4KCkgPz8gdGhpcy5saXN0S2V5TWFuYWdlci5hY3RpdmVJdGVtSW5kZXgsXG4gICAgICAgICAgdGhpcy5saXN0S2V5TWFuYWdlci5hY3RpdmVJdGVtSW5kZXgsXG4gICAgICAgICAgIXRoaXMubGlzdEtleU1hbmFnZXIuYWN0aXZlSXRlbS5pc1NlbGVjdGVkKCksXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChcbiAgICAgIHRoaXMubXVsdGlwbGUgJiZcbiAgICAgIGtleUNvZGUgPT09IEhPTUUgJiZcbiAgICAgIGhhc01vZGlmaWVyS2V5KGV2ZW50LCAuLi5jdHJsS2V5cykgJiZcbiAgICAgIGhhc01vZGlmaWVyS2V5KGV2ZW50LCAnc2hpZnRLZXknKVxuICAgICkge1xuICAgICAgY29uc3QgdHJpZ2dlciA9IHRoaXMubGlzdEtleU1hbmFnZXIuYWN0aXZlSXRlbTtcbiAgICAgIGlmICh0cmlnZ2VyKSB7XG4gICAgICAgIGNvbnN0IGZyb20gPSB0aGlzLmxpc3RLZXlNYW5hZ2VyLmFjdGl2ZUl0ZW1JbmRleCE7XG4gICAgICAgIHRoaXMubGlzdEtleU1hbmFnZXIuc2V0Rmlyc3RJdGVtQWN0aXZlKCk7XG4gICAgICAgIHRoaXMudHJpZ2dlclJhbmdlKFxuICAgICAgICAgIHRyaWdnZXIsXG4gICAgICAgICAgZnJvbSxcbiAgICAgICAgICB0aGlzLmxpc3RLZXlNYW5hZ2VyLmFjdGl2ZUl0ZW1JbmRleCEsXG4gICAgICAgICAgIXRyaWdnZXIuaXNTZWxlY3RlZCgpLFxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoXG4gICAgICB0aGlzLm11bHRpcGxlICYmXG4gICAgICBrZXlDb2RlID09PSBFTkQgJiZcbiAgICAgIGhhc01vZGlmaWVyS2V5KGV2ZW50LCAuLi5jdHJsS2V5cykgJiZcbiAgICAgIGhhc01vZGlmaWVyS2V5KGV2ZW50LCAnc2hpZnRLZXknKVxuICAgICkge1xuICAgICAgY29uc3QgdHJpZ2dlciA9IHRoaXMubGlzdEtleU1hbmFnZXIuYWN0aXZlSXRlbTtcbiAgICAgIGlmICh0cmlnZ2VyKSB7XG4gICAgICAgIGNvbnN0IGZyb20gPSB0aGlzLmxpc3RLZXlNYW5hZ2VyLmFjdGl2ZUl0ZW1JbmRleCE7XG4gICAgICAgIHRoaXMubGlzdEtleU1hbmFnZXIuc2V0TGFzdEl0ZW1BY3RpdmUoKTtcbiAgICAgICAgdGhpcy50cmlnZ2VyUmFuZ2UoXG4gICAgICAgICAgdHJpZ2dlcixcbiAgICAgICAgICBmcm9tLFxuICAgICAgICAgIHRoaXMubGlzdEtleU1hbmFnZXIuYWN0aXZlSXRlbUluZGV4ISxcbiAgICAgICAgICAhdHJpZ2dlci5pc1NlbGVjdGVkKCksXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChrZXlDb2RlID09PSBTUEFDRSB8fCBrZXlDb2RlID09PSBFTlRFUikge1xuICAgICAgdGhpcy50cmlnZ2VyT3B0aW9uKHRoaXMubGlzdEtleU1hbmFnZXIuYWN0aXZlSXRlbSk7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGlzTmF2S2V5ID1cbiAgICAgIGtleUNvZGUgPT09IFVQX0FSUk9XIHx8XG4gICAgICBrZXlDb2RlID09PSBET1dOX0FSUk9XIHx8XG4gICAgICBrZXlDb2RlID09PSBMRUZUX0FSUk9XIHx8XG4gICAgICBrZXlDb2RlID09PSBSSUdIVF9BUlJPVyB8fFxuICAgICAga2V5Q29kZSA9PT0gSE9NRSB8fFxuICAgICAga2V5Q29kZSA9PT0gRU5EO1xuICAgIHRoaXMubGlzdEtleU1hbmFnZXIub25LZXlkb3duKGV2ZW50KTtcbiAgICAvLyBXaWxsIHNlbGVjdCBhbiBvcHRpb24gaWYgc2hpZnQgd2FzIHByZXNzZWQgd2hpbGUgbmF2aWdhdGluZyB0byB0aGUgb3B0aW9uXG4gICAgaWYgKGlzTmF2S2V5ICYmIGV2ZW50LnNoaWZ0S2V5ICYmIHByZXZpb3VzQWN0aXZlSW5kZXggIT09IHRoaXMubGlzdEtleU1hbmFnZXIuYWN0aXZlSXRlbUluZGV4KSB7XG4gICAgICB0aGlzLnRyaWdnZXJPcHRpb24odGhpcy5saXN0S2V5TWFuYWdlci5hY3RpdmVJdGVtKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gdGhlIGZvY3VzIGxlYXZlcyBhbiBlbGVtZW50IGluIHRoZSBsaXN0Ym94LlxuICAgKiBAcGFyYW0gZXZlbnQgVGhlIGZvY3Vzb3V0IGV2ZW50XG4gICAqL1xuICBwcm90ZWN0ZWQgX2hhbmRsZUZvY3VzT3V0KGV2ZW50OiBGb2N1c0V2ZW50KSB7XG4gICAgY29uc3Qgb3RoZXJFbGVtZW50ID0gZXZlbnQucmVsYXRlZFRhcmdldCBhcyBFbGVtZW50O1xuICAgIGlmICh0aGlzLmVsZW1lbnQgIT09IG90aGVyRWxlbWVudCAmJiAhdGhpcy5lbGVtZW50LmNvbnRhaW5zKG90aGVyRWxlbWVudCkpIHtcbiAgICAgIHRoaXMuX29uVG91Y2hlZCgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBHZXQgdGhlIGlkIG9mIHRoZSBhY3RpdmUgb3B0aW9uIGlmIGFjdGl2ZSBkZXNjZW5kYW50IGlzIGJlaW5nIHVzZWQuICovXG4gIHByb3RlY3RlZCBfZ2V0QXJpYUFjdGl2ZURlc2NlbmRhbnQoKTogc3RyaW5nIHwgbnVsbCB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIHRoaXMuX3VzZUFjdGl2ZURlc2NlbmRhbnQgPyB0aGlzLmxpc3RLZXlNYW5hZ2VyPy5hY3RpdmVJdGVtPy5pZCA6IG51bGw7XG4gIH1cblxuICAvKiogR2V0IHRoZSB0YWJpbmRleCBmb3IgdGhlIGxpc3Rib3guICovXG4gIHByb3RlY3RlZCBfZ2V0VGFiSW5kZXgoKSB7XG4gICAgaWYgKHRoaXMuZGlzYWJsZWQpIHtcbiAgICAgIHJldHVybiAtMTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMudXNlQWN0aXZlRGVzY2VuZGFudCB8fCAhdGhpcy5saXN0S2V5TWFuYWdlci5hY3RpdmVJdGVtID8gdGhpcy5lbmFibGVkVGFiSW5kZXggOiAtMTtcbiAgfVxuXG4gIC8qKiBJbml0aWFsaXplIHRoZSBrZXkgbWFuYWdlci4gKi9cbiAgcHJpdmF0ZSBfaW5pdEtleU1hbmFnZXIoKSB7XG4gICAgdGhpcy5saXN0S2V5TWFuYWdlciA9IG5ldyBBY3RpdmVEZXNjZW5kYW50S2V5TWFuYWdlcih0aGlzLm9wdGlvbnMpXG4gICAgICAud2l0aFdyYXAoIXRoaXMuX25hdmlnYXRpb25XcmFwRGlzYWJsZWQpXG4gICAgICAud2l0aFR5cGVBaGVhZCgpXG4gICAgICAud2l0aEhvbWVBbmRFbmQoKVxuICAgICAgLndpdGhBbGxvd2VkTW9kaWZpZXJLZXlzKFsnc2hpZnRLZXknXSlcbiAgICAgIC5za2lwUHJlZGljYXRlKFxuICAgICAgICB0aGlzLl9uYXZpZ2F0ZURpc2FibGVkT3B0aW9ucyA/IHRoaXMuX3NraXBOb25lUHJlZGljYXRlIDogdGhpcy5fc2tpcERpc2FibGVkUHJlZGljYXRlLFxuICAgICAgKTtcblxuICAgIGlmICh0aGlzLm9yaWVudGF0aW9uID09PSAndmVydGljYWwnKSB7XG4gICAgICB0aGlzLmxpc3RLZXlNYW5hZ2VyLndpdGhWZXJ0aWNhbE9yaWVudGF0aW9uKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubGlzdEtleU1hbmFnZXIud2l0aEhvcml6b250YWxPcmllbnRhdGlvbih0aGlzLl9kaXI/LnZhbHVlIHx8ICdsdHInKTtcbiAgICB9XG5cbiAgICB0aGlzLmxpc3RLZXlNYW5hZ2VyLmNoYW5nZVxuICAgICAgLnBpcGUodGFrZVVudGlsKHRoaXMuZGVzdHJveWVkKSlcbiAgICAgIC5zdWJzY3JpYmUoKCkgPT4gdGhpcy5fZm9jdXNBY3RpdmVPcHRpb24oKSk7XG4gIH1cblxuICAvKiogRm9jdXMgdGhlIGFjdGl2ZSBvcHRpb24uICovXG4gIHByaXZhdGUgX2ZvY3VzQWN0aXZlT3B0aW9uKCkge1xuICAgIGlmICghdGhpcy51c2VBY3RpdmVEZXNjZW5kYW50KSB7XG4gICAgICB0aGlzLmxpc3RLZXlNYW5hZ2VyLmFjdGl2ZUl0ZW0/LmZvY3VzKCk7XG4gICAgfVxuICAgIHRoaXMuY2hhbmdlRGV0ZWN0b3JSZWYubWFya0ZvckNoZWNrKCk7XG4gIH1cblxuICAvKipcbiAgICogU2V0IHRoZSBzZWxlY3RlZCB2YWx1ZXMuXG4gICAqIEBwYXJhbSB2YWx1ZSBUaGUgbGlzdCBvZiBuZXcgc2VsZWN0ZWQgdmFsdWVzLlxuICAgKi9cbiAgcHJpdmF0ZSBfc2V0U2VsZWN0aW9uKHZhbHVlOiByZWFkb25seSBUW10pIHtcbiAgICBpZiAodGhpcy5faW52YWxpZCkge1xuICAgICAgdGhpcy5zZWxlY3Rpb25Nb2RlbC5jbGVhcihmYWxzZSk7XG4gICAgfVxuICAgIHRoaXMuc2VsZWN0aW9uTW9kZWwuc2V0U2VsZWN0aW9uKC4uLnRoaXMuX2NvZXJjZVZhbHVlKHZhbHVlKSk7XG4gIH1cblxuICAvKiogVXBkYXRlIHRoZSBpbnRlcm5hbCB2YWx1ZSBvZiB0aGUgbGlzdGJveCBiYXNlZCBvbiB0aGUgc2VsZWN0aW9uIG1vZGVsLiAqL1xuICBwcml2YXRlIF91cGRhdGVJbnRlcm5hbFZhbHVlKCkge1xuICAgIGNvbnN0IGluZGV4Q2FjaGUgPSBuZXcgTWFwPFQsIG51bWJlcj4oKTtcbiAgICB0aGlzLnNlbGVjdGlvbk1vZGVsLnNvcnQoKGE6IFQsIGI6IFQpID0+IHtcbiAgICAgIGNvbnN0IGFJbmRleCA9IHRoaXMuX2dldEluZGV4Rm9yVmFsdWUoaW5kZXhDYWNoZSwgYSk7XG4gICAgICBjb25zdCBiSW5kZXggPSB0aGlzLl9nZXRJbmRleEZvclZhbHVlKGluZGV4Q2FjaGUsIGIpO1xuICAgICAgcmV0dXJuIGFJbmRleCAtIGJJbmRleDtcbiAgICB9KTtcbiAgICBjb25zdCBzZWxlY3RlZCA9IHRoaXMuc2VsZWN0aW9uTW9kZWwuc2VsZWN0ZWQ7XG4gICAgdGhpcy5faW52YWxpZCA9XG4gICAgICAoIXRoaXMubXVsdGlwbGUgJiYgc2VsZWN0ZWQubGVuZ3RoID4gMSkgfHwgISF0aGlzLl9nZXRJbnZhbGlkT3B0aW9uVmFsdWVzKHNlbGVjdGVkKS5sZW5ndGg7XG4gICAgdGhpcy5fb25WYWxpZGF0b3JDaGFuZ2UoKTtcbiAgICB0aGlzLmNoYW5nZURldGVjdG9yUmVmLm1hcmtGb3JDaGVjaygpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIGluZGV4IG9mIHRoZSBnaXZlbiB2YWx1ZSBpbiB0aGUgZ2l2ZW4gbGlzdCBvZiBvcHRpb25zLlxuICAgKiBAcGFyYW0gY2FjaGUgVGhlIGNhY2hlIG9mIGluZGljZXMgZm91bmQgc28gZmFyXG4gICAqIEBwYXJhbSB2YWx1ZSBUaGUgdmFsdWUgdG8gZmluZFxuICAgKiBAcmV0dXJuIFRoZSBpbmRleCBvZiB0aGUgdmFsdWUgaW4gdGhlIG9wdGlvbnMgbGlzdFxuICAgKi9cbiAgcHJpdmF0ZSBfZ2V0SW5kZXhGb3JWYWx1ZShjYWNoZTogTWFwPFQsIG51bWJlcj4sIHZhbHVlOiBUKSB7XG4gICAgY29uc3QgaXNFcXVhbCA9IHRoaXMuY29tcGFyZVdpdGggfHwgT2JqZWN0LmlzO1xuICAgIGlmICghY2FjaGUuaGFzKHZhbHVlKSkge1xuICAgICAgbGV0IGluZGV4ID0gLTE7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMub3B0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoaXNFcXVhbCh2YWx1ZSwgdGhpcy5vcHRpb25zLmdldChpKSEudmFsdWUpKSB7XG4gICAgICAgICAgaW5kZXggPSBpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBjYWNoZS5zZXQodmFsdWUsIGluZGV4KTtcbiAgICB9XG4gICAgcmV0dXJuIGNhY2hlLmdldCh2YWx1ZSkhO1xuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZSB0aGUgdXNlciBjbGlja2luZyBhbiBvcHRpb24uXG4gICAqIEBwYXJhbSBvcHRpb24gVGhlIG9wdGlvbiB0aGF0IHdhcyBjbGlja2VkLlxuICAgKi9cbiAgcHJpdmF0ZSBfaGFuZGxlT3B0aW9uQ2xpY2tlZChvcHRpb246IENka09wdGlvbjxUPiwgZXZlbnQ6IE1vdXNlRXZlbnQpIHtcbiAgICB0aGlzLmxpc3RLZXlNYW5hZ2VyLnNldEFjdGl2ZUl0ZW0ob3B0aW9uKTtcbiAgICBpZiAoZXZlbnQuc2hpZnRLZXkgJiYgdGhpcy5tdWx0aXBsZSkge1xuICAgICAgdGhpcy50cmlnZ2VyUmFuZ2UoXG4gICAgICAgIG9wdGlvbixcbiAgICAgICAgdGhpcy5fZ2V0TGFzdFRyaWdnZXJlZEluZGV4KCkgPz8gdGhpcy5saXN0S2V5TWFuYWdlci5hY3RpdmVJdGVtSW5kZXghLFxuICAgICAgICB0aGlzLmxpc3RLZXlNYW5hZ2VyLmFjdGl2ZUl0ZW1JbmRleCEsXG4gICAgICAgICFvcHRpb24uaXNTZWxlY3RlZCgpLFxuICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy50cmlnZ2VyT3B0aW9uKG9wdGlvbik7XG4gICAgfVxuICB9XG5cbiAgLyoqIFZlcmlmaWVzIHRoYXQgbm8gdHdvIG9wdGlvbnMgcmVwcmVzZW50IHRoZSBzYW1lIHZhbHVlIHVuZGVyIHRoZSBjb21wYXJlV2l0aCBmdW5jdGlvbi4gKi9cbiAgcHJpdmF0ZSBfdmVyaWZ5Tm9PcHRpb25WYWx1ZUNvbGxpc2lvbnMoKSB7XG4gICAgdGhpcy5vcHRpb25zLmNoYW5nZXMucGlwZShzdGFydFdpdGgodGhpcy5vcHRpb25zKSwgdGFrZVVudGlsKHRoaXMuZGVzdHJveWVkKSkuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgIGNvbnN0IGlzRXF1YWwgPSB0aGlzLmNvbXBhcmVXaXRoID8/IE9iamVjdC5pcztcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5vcHRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IG9wdGlvbiA9IHRoaXMub3B0aW9ucy5nZXQoaSkhO1xuICAgICAgICBsZXQgZHVwbGljYXRlOiBDZGtPcHRpb248VD4gfCBudWxsID0gbnVsbDtcbiAgICAgICAgZm9yIChsZXQgaiA9IGkgKyAxOyBqIDwgdGhpcy5vcHRpb25zLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgY29uc3Qgb3RoZXIgPSB0aGlzLm9wdGlvbnMuZ2V0KGopITtcbiAgICAgICAgICBpZiAoaXNFcXVhbChvcHRpb24udmFsdWUsIG90aGVyLnZhbHVlKSkge1xuICAgICAgICAgICAgZHVwbGljYXRlID0gb3RoZXI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGR1cGxpY2F0ZSkge1xuICAgICAgICAgIC8vIFRPRE8obW1hbGVyYmEpOiBMaW5rIHRvIGRvY3MgYWJvdXQgdGhpcy5cbiAgICAgICAgICBpZiAodGhpcy5jb21wYXJlV2l0aCkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICAgICAgICBgRm91bmQgbXVsdGlwbGUgQ2RrT3B0aW9uIHJlcHJlc2VudGluZyB0aGUgc2FtZSB2YWx1ZSB1bmRlciB0aGUgZ2l2ZW4gY29tcGFyZVdpdGggZnVuY3Rpb25gLFxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgb3B0aW9uMTogb3B0aW9uLmVsZW1lbnQsXG4gICAgICAgICAgICAgICAgb3B0aW9uMjogZHVwbGljYXRlLmVsZW1lbnQsXG4gICAgICAgICAgICAgICAgY29tcGFyZVdpdGg6IHRoaXMuY29tcGFyZVdpdGgsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYEZvdW5kIG11bHRpcGxlIENka09wdGlvbiB3aXRoIHRoZSBzYW1lIHZhbHVlYCwge1xuICAgICAgICAgICAgICBvcHRpb24xOiBvcHRpb24uZWxlbWVudCxcbiAgICAgICAgICAgICAgb3B0aW9uMjogZHVwbGljYXRlLmVsZW1lbnQsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQ29lcmNlcyBhIHZhbHVlIGludG8gYW4gYXJyYXkgcmVwcmVzZW50aW5nIGEgbGlzdGJveCBzZWxlY3Rpb24uXG4gICAqIEBwYXJhbSB2YWx1ZSBUaGUgdmFsdWUgdG8gY29lcmNlXG4gICAqIEByZXR1cm4gQW4gYXJyYXlcbiAgICovXG4gIHByaXZhdGUgX2NvZXJjZVZhbHVlKHZhbHVlOiByZWFkb25seSBUW10pIHtcbiAgICByZXR1cm4gdmFsdWUgPT0gbnVsbCA/IFtdIDogY29lcmNlQXJyYXkodmFsdWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgc3VibGlzdCBvZiB2YWx1ZXMgdGhhdCBkbyBub3QgcmVwcmVzZW50IHZhbGlkIG9wdGlvbiB2YWx1ZXMgaW4gdGhpcyBsaXN0Ym94LlxuICAgKiBAcGFyYW0gdmFsdWVzIFRoZSBsaXN0IG9mIHZhbHVlc1xuICAgKiBAcmV0dXJuIFRoZSBzdWJsaXN0IG9mIHZhbHVlcyB0aGF0IGFyZSBub3QgdmFsaWQgb3B0aW9uIHZhbHVlc1xuICAgKi9cbiAgcHJpdmF0ZSBfZ2V0SW52YWxpZE9wdGlvblZhbHVlcyh2YWx1ZXM6IHJlYWRvbmx5IFRbXSkge1xuICAgIGNvbnN0IGlzRXF1YWwgPSB0aGlzLmNvbXBhcmVXaXRoIHx8IE9iamVjdC5pcztcbiAgICBjb25zdCB2YWxpZFZhbHVlcyA9ICh0aGlzLm9wdGlvbnMgfHwgW10pLm1hcChvcHRpb24gPT4gb3B0aW9uLnZhbHVlKTtcbiAgICByZXR1cm4gdmFsdWVzLmZpbHRlcih2YWx1ZSA9PiAhdmFsaWRWYWx1ZXMuc29tZSh2YWxpZFZhbHVlID0+IGlzRXF1YWwodmFsdWUsIHZhbGlkVmFsdWUpKSk7XG4gIH1cblxuICAvKiogR2V0IHRoZSBpbmRleCBvZiB0aGUgbGFzdCB0cmlnZ2VyZWQgb3B0aW9uLiAqL1xuICBwcml2YXRlIF9nZXRMYXN0VHJpZ2dlcmVkSW5kZXgoKSB7XG4gICAgY29uc3QgaW5kZXggPSB0aGlzLm9wdGlvbnMudG9BcnJheSgpLmluZGV4T2YodGhpcy5fbGFzdFRyaWdnZXJlZCEpO1xuICAgIHJldHVybiBpbmRleCA9PT0gLTEgPyBudWxsIDogaW5kZXg7XG4gIH1cbn1cblxuLyoqIENoYW5nZSBldmVudCB0aGF0IGlzIGZpcmVkIHdoZW5ldmVyIHRoZSB2YWx1ZSBvZiB0aGUgbGlzdGJveCBjaGFuZ2VzLiAqL1xuZXhwb3J0IGludGVyZmFjZSBMaXN0Ym94VmFsdWVDaGFuZ2VFdmVudDxUPiB7XG4gIC8qKiBUaGUgbmV3IHZhbHVlIG9mIHRoZSBsaXN0Ym94LiAqL1xuICByZWFkb25seSB2YWx1ZTogcmVhZG9ubHkgVFtdO1xuXG4gIC8qKiBSZWZlcmVuY2UgdG8gdGhlIGxpc3Rib3ggdGhhdCBlbWl0dGVkIHRoZSBldmVudC4gKi9cbiAgcmVhZG9ubHkgbGlzdGJveDogQ2RrTGlzdGJveDxUPjtcblxuICAvKiogUmVmZXJlbmNlIHRvIHRoZSBvcHRpb24gdGhhdCB3YXMgdHJpZ2dlcmVkLiAqL1xuICByZWFkb25seSBvcHRpb246IENka09wdGlvbjxUPiB8IG51bGw7XG59XG4iXX0=