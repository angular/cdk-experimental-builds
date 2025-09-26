import * as i0 from '@angular/core';
import { inject, ElementRef, computed, contentChildren, input, booleanAttribute, model, signal, afterRenderEffect, Directive, linkedSignal } from '@angular/core';
import { Directionality } from '@angular/cdk/bidi';
import { _IdGenerator } from '@angular/cdk/a11y';
import * as i1 from '@angular/cdk-experimental/toolbar';
import { CdkToolbarWidgetGroup } from '@angular/cdk-experimental/toolbar';
import { ToolbarRadioGroupPattern, RadioGroupPattern, RadioButtonPattern } from './toolbar-radio-group.mjs';
import './list.mjs';
import './list-navigation.mjs';

// TODO: Move mapSignal to it's own file so it can be reused across components.
/**
 * Creates a new writable signal (signal V) whose value is connected to the given original
 * writable signal (signal T) such that updating signal V updates signal T and vice-versa.
 *
 * This function establishes a two-way synchronization between the source signal and the new mapped
 * signal. When the source signal changes, the mapped signal updates by applying the `transform`
 * function. When the mapped signal is explicitly set or updated, the change is propagated back to
 * the source signal by applying the `reverse` function.
 */
function mapSignal(originalSignal, operations) {
    const mappedSignal = linkedSignal(() => operations.transform(originalSignal()));
    const updateMappedSignal = mappedSignal.update;
    const setMappedSignal = mappedSignal.set;
    mappedSignal.set = (newValue) => {
        setMappedSignal(newValue);
        originalSignal.set(operations.reverse(newValue));
    };
    mappedSignal.update = (updateFn) => {
        updateMappedSignal(oldValue => updateFn(oldValue));
        originalSignal.update(oldValue => operations.reverse(updateFn(operations.transform(oldValue))));
    };
    return mappedSignal;
}
/**
 * A radio button group container.
 *
 * Radio groups are used to group multiple radio buttons or radio group labels so they function as
 * a single form control. The CdkRadioGroup is meant to be used in conjunction with CdkRadioButton
 * as follows:
 *
 * ```html
 * <div cdkRadioGroup>
 *   <label cdkRadioButton value="1">Option 1</label>
 *   <label cdkRadioButton value="2">Option 2</label>
 *   <label cdkRadioButton value="3">Option 3</label>
 * </div>
 * ```
 */
class CdkRadioGroup {
    /** A reference to the radio group element. */
    _elementRef = inject(ElementRef);
    /** A reference to the CdkToolbarWidgetGroup, if the radio group is in a toolbar. */
    _cdkToolbarWidgetGroup = inject(CdkToolbarWidgetGroup);
    /** Whether the radio group is inside of a CdkToolbar. */
    _hasToolbar = computed(() => !!this._cdkToolbarWidgetGroup.toolbar(), ...(ngDevMode ? [{ debugName: "_hasToolbar" }] : []));
    /** The CdkRadioButtons nested inside of the CdkRadioGroup. */
    _cdkRadioButtons = contentChildren(CdkRadioButton, ...(ngDevMode ? [{ debugName: "_cdkRadioButtons", descendants: true }] : [{ descendants: true }]));
    /** A signal wrapper for directionality. */
    textDirection = inject(Directionality).valueSignal;
    /** The RadioButton UIPatterns of the child CdkRadioButtons. */
    items = computed(() => this._cdkRadioButtons().map(radio => radio.pattern), ...(ngDevMode ? [{ debugName: "items" }] : []));
    /** Whether the radio group is vertically or horizontally oriented. */
    orientation = input('vertical', ...(ngDevMode ? [{ debugName: "orientation" }] : []));
    /** Whether disabled items in the group should be skipped when navigating. */
    skipDisabled = input(true, ...(ngDevMode ? [{ debugName: "skipDisabled", transform: booleanAttribute }] : [{ transform: booleanAttribute }]));
    /** The focus strategy used by the radio group. */
    focusMode = input('roving', ...(ngDevMode ? [{ debugName: "focusMode" }] : []));
    /** Whether the radio group is disabled. */
    disabled = input(false, ...(ngDevMode ? [{ debugName: "disabled", transform: booleanAttribute }] : [{ transform: booleanAttribute }]));
    /** Whether the radio group is readonly. */
    readonly = input(false, ...(ngDevMode ? [{ debugName: "readonly", transform: booleanAttribute }] : [{ transform: booleanAttribute }]));
    /** The value of the currently selected radio button. */
    value = model(null, ...(ngDevMode ? [{ debugName: "value" }] : []));
    /** The internal selection state for the radio group. */
    _value = mapSignal(this.value, {
        transform: value => (value !== null ? [value] : []),
        reverse: values => (values.length === 0 ? null : values[0]),
    });
    /** The RadioGroup UIPattern. */
    pattern;
    /** Whether the radio group has received focus yet. */
    _hasFocused = signal(false, ...(ngDevMode ? [{ debugName: "_hasFocused" }] : []));
    constructor() {
        const inputs = {
            ...this,
            items: this.items,
            value: this._value,
            activeItem: signal(undefined),
            textDirection: this.textDirection,
            element: () => this._elementRef.nativeElement,
            getItem: e => {
                if (!(e.target instanceof HTMLElement)) {
                    return undefined;
                }
                const element = e.target.closest('[role="radio"]');
                return this.items().find(i => i.element() === element);
            },
            toolbar: this._cdkToolbarWidgetGroup.toolbar,
        };
        this.pattern = this._hasToolbar()
            ? new ToolbarRadioGroupPattern(inputs)
            : new RadioGroupPattern(inputs);
        if (this._hasToolbar()) {
            this._cdkToolbarWidgetGroup.controls.set(this.pattern);
        }
        afterRenderEffect(() => {
            if (typeof ngDevMode === 'undefined' || ngDevMode) {
                const violations = this.pattern.validate();
                for (const violation of violations) {
                    console.error(violation);
                }
            }
        });
        afterRenderEffect(() => {
            if (!this._hasFocused() && !this._hasToolbar()) {
                this.pattern.setDefaultState();
            }
        });
    }
    onFocus() {
        this._hasFocused.set(true);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.2.0-next.2", ngImport: i0, type: CdkRadioGroup, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.2.0", version: "20.2.0-next.2", type: CdkRadioGroup, isStandalone: true, selector: "[cdkRadioGroup]", inputs: { orientation: { classPropertyName: "orientation", publicName: "orientation", isSignal: true, isRequired: false, transformFunction: null }, skipDisabled: { classPropertyName: "skipDisabled", publicName: "skipDisabled", isSignal: true, isRequired: false, transformFunction: null }, focusMode: { classPropertyName: "focusMode", publicName: "focusMode", isSignal: true, isRequired: false, transformFunction: null }, disabled: { classPropertyName: "disabled", publicName: "disabled", isSignal: true, isRequired: false, transformFunction: null }, readonly: { classPropertyName: "readonly", publicName: "readonly", isSignal: true, isRequired: false, transformFunction: null }, value: { classPropertyName: "value", publicName: "value", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { value: "valueChange" }, host: { attributes: { "role": "radiogroup" }, listeners: { "keydown": "pattern.onKeydown($event)", "pointerdown": "pattern.onPointerdown($event)", "focusin": "onFocus()" }, properties: { "attr.tabindex": "pattern.tabindex()", "attr.aria-readonly": "pattern.readonly()", "attr.aria-disabled": "pattern.disabled()", "attr.aria-orientation": "pattern.orientation()", "attr.aria-activedescendant": "pattern.activedescendant()" }, classAttribute: "cdk-radio-group" }, queries: [{ propertyName: "_cdkRadioButtons", predicate: CdkRadioButton, descendants: true, isSignal: true }], exportAs: ["cdkRadioGroup"], hostDirectives: [{ directive: i1.CdkToolbarWidgetGroup, inputs: ["disabled", "disabled"] }], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.2.0-next.2", ngImport: i0, type: CdkRadioGroup, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkRadioGroup]',
                    exportAs: 'cdkRadioGroup',
                    host: {
                        'role': 'radiogroup',
                        'class': 'cdk-radio-group',
                        '[attr.tabindex]': 'pattern.tabindex()',
                        '[attr.aria-readonly]': 'pattern.readonly()',
                        '[attr.aria-disabled]': 'pattern.disabled()',
                        '[attr.aria-orientation]': 'pattern.orientation()',
                        '[attr.aria-activedescendant]': 'pattern.activedescendant()',
                        '(keydown)': 'pattern.onKeydown($event)',
                        '(pointerdown)': 'pattern.onPointerdown($event)',
                        '(focusin)': 'onFocus()',
                    },
                    hostDirectives: [
                        {
                            directive: CdkToolbarWidgetGroup,
                            inputs: ['disabled'],
                        },
                    ],
                }]
        }], ctorParameters: () => [] });
/** A selectable radio button in a CdkRadioGroup. */
class CdkRadioButton {
    /** A reference to the radio button element. */
    _elementRef = inject(ElementRef);
    /** The parent CdkRadioGroup. */
    _cdkRadioGroup = inject(CdkRadioGroup);
    /** A unique identifier for the radio button. */
    _generatedId = inject(_IdGenerator).getId('cdk-radio-button-');
    /** A unique identifier for the radio button. */
    id = computed(() => this._generatedId, ...(ngDevMode ? [{ debugName: "id" }] : []));
    /** The value associated with the radio button. */
    value = input.required(...(ngDevMode ? [{ debugName: "value" }] : []));
    /** The parent RadioGroup UIPattern. */
    group = computed(() => this._cdkRadioGroup.pattern, ...(ngDevMode ? [{ debugName: "group" }] : []));
    /** A reference to the radio button element to be focused on navigation. */
    element = computed(() => this._elementRef.nativeElement, ...(ngDevMode ? [{ debugName: "element" }] : []));
    /** Whether the radio button is disabled. */
    disabled = input(false, ...(ngDevMode ? [{ debugName: "disabled", transform: booleanAttribute }] : [{ transform: booleanAttribute }]));
    /** The RadioButton UIPattern. */
    pattern = new RadioButtonPattern({
        ...this,
        id: this.id,
        value: this.value,
        group: this.group,
        element: this.element,
    });
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.2.0-next.2", ngImport: i0, type: CdkRadioButton, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.1.0", version: "20.2.0-next.2", type: CdkRadioButton, isStandalone: true, selector: "[cdkRadioButton]", inputs: { value: { classPropertyName: "value", publicName: "value", isSignal: true, isRequired: true, transformFunction: null }, disabled: { classPropertyName: "disabled", publicName: "disabled", isSignal: true, isRequired: false, transformFunction: null } }, host: { attributes: { "role": "radio" }, properties: { "class.cdk-active": "pattern.active()", "attr.tabindex": "pattern.tabindex()", "attr.aria-checked": "pattern.selected()", "attr.aria-disabled": "pattern.disabled()", "id": "pattern.id()" }, classAttribute: "cdk-radio-button" }, exportAs: ["cdkRadioButton"], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.2.0-next.2", ngImport: i0, type: CdkRadioButton, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkRadioButton]',
                    exportAs: 'cdkRadioButton',
                    host: {
                        'role': 'radio',
                        'class': 'cdk-radio-button',
                        '[class.cdk-active]': 'pattern.active()',
                        '[attr.tabindex]': 'pattern.tabindex()',
                        '[attr.aria-checked]': 'pattern.selected()',
                        '[attr.aria-disabled]': 'pattern.disabled()',
                        '[id]': 'pattern.id()',
                    },
                }]
        }] });

export { CdkRadioButton, CdkRadioGroup };
//# sourceMappingURL=radio-group.mjs.map
