import * as i0 from '@angular/core';
import { inject, contentChildren, computed, input, booleanAttribute, model, signal, afterRenderEffect, Directive, ElementRef } from '@angular/core';
import { Directionality } from '@angular/cdk/bidi';
import { toSignal } from '@angular/core/rxjs-interop';
import { _IdGenerator } from '@angular/cdk/a11y';
import { L as ListboxPattern, O as OptionPattern } from './option-PfSxXfNh.mjs';
import './list-DwfufhyY.mjs';
import './list-navigation-DzM8xz11.mjs';

/**
 * A listbox container.
 *
 * Listboxes are used to display a list of items for a user to select from. The CdkListbox is meant
 * to be used in conjunction with CdkOption as follows:
 *
 * ```html
 * <ul cdkListbox>
 *   <li [value]="1" cdkOption>Item 1</li>
 *   <li [value]="2" cdkOption>Item 2</li>
 *   <li [value]="3" cdkOption>Item 3</li>
 * </ul>
 * ```
 */
class CdkListbox {
    /** The directionality (LTR / RTL) context for the application (or a subtree of it). */
    _directionality = inject(Directionality);
    /** The CdkOptions nested inside of the CdkListbox. */
    _cdkOptions = contentChildren(CdkOption, ...(ngDevMode ? [{ debugName: "_cdkOptions", descendants: true }] : [{ descendants: true }]));
    /** A signal wrapper for directionality. */
    textDirection = toSignal(this._directionality.change, {
        initialValue: this._directionality.value,
    });
    /** The Option UIPatterns of the child CdkOptions. */
    items = computed(() => this._cdkOptions().map(option => option.pattern), ...(ngDevMode ? [{ debugName: "items" }] : []));
    /** Whether the list is vertically or horizontally oriented. */
    orientation = input('vertical', ...(ngDevMode ? [{ debugName: "orientation" }] : []));
    /** Whether multiple items in the list can be selected at once. */
    multi = input(false, ...(ngDevMode ? [{ debugName: "multi", transform: booleanAttribute }] : [{ transform: booleanAttribute }]));
    /** Whether focus should wrap when navigating. */
    wrap = input(true, ...(ngDevMode ? [{ debugName: "wrap", transform: booleanAttribute }] : [{ transform: booleanAttribute }]));
    /** Whether disabled items in the list should be skipped when navigating. */
    skipDisabled = input(true, ...(ngDevMode ? [{ debugName: "skipDisabled", transform: booleanAttribute }] : [{ transform: booleanAttribute }]));
    /** The focus strategy used by the list. */
    focusMode = input('roving', ...(ngDevMode ? [{ debugName: "focusMode" }] : []));
    /** The selection strategy used by the list. */
    selectionMode = input('follow', ...(ngDevMode ? [{ debugName: "selectionMode" }] : []));
    /** The amount of time before the typeahead search is reset. */
    typeaheadDelay = input(0.5, ...(ngDevMode ? [{ debugName: "typeaheadDelay" }] : [])); // Picked arbitrarily.
    /** Whether the listbox is disabled. */
    disabled = input(false, ...(ngDevMode ? [{ debugName: "disabled", transform: booleanAttribute }] : [{ transform: booleanAttribute }]));
    /** Whether the listbox is readonly. */
    readonly = input(false, ...(ngDevMode ? [{ debugName: "readonly", transform: booleanAttribute }] : [{ transform: booleanAttribute }]));
    /** The values of the current selected items. */
    value = model([], ...(ngDevMode ? [{ debugName: "value" }] : []));
    /** The Listbox UIPattern. */
    pattern = new ListboxPattern({
        ...this,
        items: this.items,
        activeIndex: signal(0), // TODO: Use linkedSignal to ensure this doesn't get fked up.
        textDirection: this.textDirection,
    });
    /** Whether the listbox has received focus yet. */
    _hasFocused = signal(false, ...(ngDevMode ? [{ debugName: "_hasFocused" }] : []));
    constructor() {
        afterRenderEffect(() => {
            if (typeof ngDevMode === 'undefined' || ngDevMode) {
                const violations = this.pattern.validate();
                for (const violation of violations) {
                    console.error(violation);
                }
            }
        });
        afterRenderEffect(() => {
            if (!this._hasFocused()) {
                this.pattern.setDefaultState();
            }
        });
    }
    onFocus() {
        this._hasFocused.set(true);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.2.0-next.1", ngImport: i0, type: CdkListbox, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.2.0", version: "20.2.0-next.1", type: CdkListbox, isStandalone: true, selector: "[cdkListbox]", inputs: { orientation: { classPropertyName: "orientation", publicName: "orientation", isSignal: true, isRequired: false, transformFunction: null }, multi: { classPropertyName: "multi", publicName: "multi", isSignal: true, isRequired: false, transformFunction: null }, wrap: { classPropertyName: "wrap", publicName: "wrap", isSignal: true, isRequired: false, transformFunction: null }, skipDisabled: { classPropertyName: "skipDisabled", publicName: "skipDisabled", isSignal: true, isRequired: false, transformFunction: null }, focusMode: { classPropertyName: "focusMode", publicName: "focusMode", isSignal: true, isRequired: false, transformFunction: null }, selectionMode: { classPropertyName: "selectionMode", publicName: "selectionMode", isSignal: true, isRequired: false, transformFunction: null }, typeaheadDelay: { classPropertyName: "typeaheadDelay", publicName: "typeaheadDelay", isSignal: true, isRequired: false, transformFunction: null }, disabled: { classPropertyName: "disabled", publicName: "disabled", isSignal: true, isRequired: false, transformFunction: null }, readonly: { classPropertyName: "readonly", publicName: "readonly", isSignal: true, isRequired: false, transformFunction: null }, value: { classPropertyName: "value", publicName: "value", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { value: "valueChange" }, host: { attributes: { "role": "listbox" }, listeners: { "keydown": "pattern.onKeydown($event)", "pointerdown": "pattern.onPointerdown($event)", "focusin": "onFocus()" }, properties: { "attr.tabindex": "pattern.tabindex()", "attr.aria-readonly": "pattern.readonly()", "attr.aria-disabled": "pattern.disabled()", "attr.aria-orientation": "pattern.orientation()", "attr.aria-multiselectable": "pattern.multi()", "attr.aria-activedescendant": "pattern.activedescendant()" }, classAttribute: "cdk-listbox" }, queries: [{ propertyName: "_cdkOptions", predicate: CdkOption, descendants: true, isSignal: true }], exportAs: ["cdkListbox"], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.2.0-next.1", ngImport: i0, type: CdkListbox, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkListbox]',
                    exportAs: 'cdkListbox',
                    host: {
                        'role': 'listbox',
                        'class': 'cdk-listbox',
                        '[attr.tabindex]': 'pattern.tabindex()',
                        '[attr.aria-readonly]': 'pattern.readonly()',
                        '[attr.aria-disabled]': 'pattern.disabled()',
                        '[attr.aria-orientation]': 'pattern.orientation()',
                        '[attr.aria-multiselectable]': 'pattern.multi()',
                        '[attr.aria-activedescendant]': 'pattern.activedescendant()',
                        '(keydown)': 'pattern.onKeydown($event)',
                        '(pointerdown)': 'pattern.onPointerdown($event)',
                        '(focusin)': 'onFocus()',
                    },
                }]
        }], ctorParameters: () => [] });
/** A selectable option in a CdkListbox. */
class CdkOption {
    /** A reference to the option element. */
    _elementRef = inject(ElementRef);
    /** The parent CdkListbox. */
    _cdkListbox = inject(CdkListbox);
    /** A unique identifier for the option. */
    _generatedId = inject(_IdGenerator).getId('cdk-option-');
    // TODO(wagnermaciel): https://github.com/angular/components/pull/30495#discussion_r1972601144.
    /** A unique identifier for the option. */
    id = computed(() => this._generatedId, ...(ngDevMode ? [{ debugName: "id" }] : []));
    // TODO(wagnermaciel): See if we want to change how we handle this since textContent is not
    // reactive. See https://github.com/angular/components/pull/30495#discussion_r1961260216.
    /** The text used by the typeahead search. */
    searchTerm = computed(() => this.label() ?? this.element().textContent, ...(ngDevMode ? [{ debugName: "searchTerm" }] : []));
    /** The parent Listbox UIPattern. */
    listbox = computed(() => this._cdkListbox.pattern, ...(ngDevMode ? [{ debugName: "listbox" }] : []));
    /** A reference to the option element to be focused on navigation. */
    element = computed(() => this._elementRef.nativeElement, ...(ngDevMode ? [{ debugName: "element" }] : []));
    /** The value of the option. */
    value = input.required(...(ngDevMode ? [{ debugName: "value" }] : []));
    /** Whether an item is disabled. */
    disabled = input(false, ...(ngDevMode ? [{ debugName: "disabled", transform: booleanAttribute }] : [{ transform: booleanAttribute }]));
    /** The text used by the typeahead search. */
    label = input(...(ngDevMode ? [undefined, { debugName: "label" }] : []));
    /** The Option UIPattern. */
    pattern = new OptionPattern({
        ...this,
        id: this.id,
        value: this.value,
        listbox: this.listbox,
        element: this.element,
        searchTerm: this.searchTerm,
    });
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.2.0-next.1", ngImport: i0, type: CdkOption, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.1.0", version: "20.2.0-next.1", type: CdkOption, isStandalone: true, selector: "[cdkOption]", inputs: { value: { classPropertyName: "value", publicName: "value", isSignal: true, isRequired: true, transformFunction: null }, disabled: { classPropertyName: "disabled", publicName: "disabled", isSignal: true, isRequired: false, transformFunction: null }, label: { classPropertyName: "label", publicName: "label", isSignal: true, isRequired: false, transformFunction: null } }, host: { attributes: { "role": "option" }, properties: { "class.cdk-active": "pattern.active()", "attr.id": "pattern.id()", "attr.tabindex": "pattern.tabindex()", "attr.aria-selected": "pattern.selected()", "attr.aria-disabled": "pattern.disabled()" }, classAttribute: "cdk-option" }, exportAs: ["cdkOption"], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.2.0-next.1", ngImport: i0, type: CdkOption, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkOption]',
                    exportAs: 'cdkOption',
                    host: {
                        'role': 'option',
                        'class': 'cdk-option',
                        '[class.cdk-active]': 'pattern.active()',
                        '[attr.id]': 'pattern.id()',
                        '[attr.tabindex]': 'pattern.tabindex()',
                        '[attr.aria-selected]': 'pattern.selected()',
                        '[attr.aria-disabled]': 'pattern.disabled()',
                    },
                }]
        }] });

export { CdkListbox, CdkOption };
//# sourceMappingURL=listbox.mjs.map
