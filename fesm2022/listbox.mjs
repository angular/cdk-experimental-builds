import * as i0 from '@angular/core';
import { inject, contentChildren, computed, input, booleanAttribute, model, Directive, ElementRef } from '@angular/core';
import { ListboxPattern, OptionPattern } from '@angular/cdk-experimental/ui-patterns';
import { Directionality } from '@angular/cdk/bidi';
import { toSignal } from '@angular/core/rxjs-interop';
import { _IdGenerator } from '@angular/cdk/a11y';

/**
 * A listbox container.
 *
 * Listboxes are used to display a list of items for a user to select from. The CdkListbox is meant
 * to be used in conjunction with CdkOption as follows:
 *
 * ```html
 * <ul cdkListbox>
 *   <li cdkOption>Item 1</li>
 *   <li cdkOption>Item 2</li>
 *   <li cdkOption>Item 3</li>
 * </ul>
 * ```
 */
class CdkListbox {
    /** The directionality (LTR / RTL) context for the application (or a subtree of it). */
    _directionality = inject(Directionality);
    /** The CdkOptions nested inside of the CdkListbox. */
    _cdkOptions = contentChildren(CdkOption, { descendants: true });
    /** A signal wrapper for directionality. */
    textDirection = toSignal(this._directionality.change, {
        initialValue: this._directionality.value,
    });
    /** The Option UIPatterns of the child CdkOptions. */
    items = computed(() => this._cdkOptions().map(option => option.pattern));
    /** Whether the list is vertically or horizontally oriented. */
    orientation = input('vertical');
    /** Whether multiple items in the list can be selected at once. */
    multiselectable = input(false, { transform: booleanAttribute });
    /** Whether focus should wrap when navigating. */
    wrap = input(true, { transform: booleanAttribute });
    /** Whether disabled items in the list should be skipped when navigating. */
    skipDisabled = input(true, { transform: booleanAttribute });
    /** The focus strategy used by the list. */
    focusMode = input('roving');
    /** The selection strategy used by the list. */
    selectionMode = input('follow');
    /** The amount of time before the typeahead search is reset. */
    typeaheadDelay = input(0.5); // Picked arbitrarily.
    /** Whether the listbox is disabled. */
    disabled = input(false, { transform: booleanAttribute });
    // TODO(wagnermaciel): Figure out how we want to expose control over the current listbox value.
    /** The ids of the current selected items. */
    selectedIds = model([]);
    /** The current index that has been navigated to. */
    activeIndex = model(0);
    /** The Listbox UIPattern. */
    pattern = new ListboxPattern({
        ...this,
        items: this.items,
        textDirection: this.textDirection,
    });
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.0", ngImport: i0, type: CdkListbox, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.2.0", version: "19.2.0", type: CdkListbox, isStandalone: true, selector: "[cdkListbox]", inputs: { orientation: { classPropertyName: "orientation", publicName: "orientation", isSignal: true, isRequired: false, transformFunction: null }, multiselectable: { classPropertyName: "multiselectable", publicName: "multiselectable", isSignal: true, isRequired: false, transformFunction: null }, wrap: { classPropertyName: "wrap", publicName: "wrap", isSignal: true, isRequired: false, transformFunction: null }, skipDisabled: { classPropertyName: "skipDisabled", publicName: "skipDisabled", isSignal: true, isRequired: false, transformFunction: null }, focusMode: { classPropertyName: "focusMode", publicName: "focusMode", isSignal: true, isRequired: false, transformFunction: null }, selectionMode: { classPropertyName: "selectionMode", publicName: "selectionMode", isSignal: true, isRequired: false, transformFunction: null }, typeaheadDelay: { classPropertyName: "typeaheadDelay", publicName: "typeaheadDelay", isSignal: true, isRequired: false, transformFunction: null }, disabled: { classPropertyName: "disabled", publicName: "disabled", isSignal: true, isRequired: false, transformFunction: null }, selectedIds: { classPropertyName: "selectedIds", publicName: "selectedIds", isSignal: true, isRequired: false, transformFunction: null }, activeIndex: { classPropertyName: "activeIndex", publicName: "activeIndex", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { selectedIds: "selectedIdsChange", activeIndex: "activeIndexChange" }, host: { attributes: { "role": "listbox" }, listeners: { "keydown": "pattern.onKeydown($event)", "pointerdown": "pattern.onPointerdown($event)" }, properties: { "attr.tabindex": "pattern.tabindex()", "attr.aria-disabled": "pattern.disabled()", "attr.aria-orientation": "pattern.orientation()", "attr.aria-multiselectable": "pattern.multiselectable()", "attr.aria-activedescendant": "pattern.activedescendant()" }, classAttribute: "cdk-listbox" }, queries: [{ propertyName: "_cdkOptions", predicate: CdkOption, descendants: true, isSignal: true }], exportAs: ["cdkListbox"], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.0", ngImport: i0, type: CdkListbox, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkListbox]',
                    exportAs: 'cdkListbox',
                    host: {
                        'role': 'listbox',
                        'class': 'cdk-listbox',
                        '[attr.tabindex]': 'pattern.tabindex()',
                        '[attr.aria-disabled]': 'pattern.disabled()',
                        '[attr.aria-orientation]': 'pattern.orientation()',
                        '[attr.aria-multiselectable]': 'pattern.multiselectable()',
                        '[attr.aria-activedescendant]': 'pattern.activedescendant()',
                        '(keydown)': 'pattern.onKeydown($event)',
                        '(pointerdown)': 'pattern.onPointerdown($event)',
                    },
                }]
        }] });
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
    id = computed(() => this._generatedId);
    // TODO(wagnermaciel): See if we want to change how we handle this since textContent is not
    // reactive. See https://github.com/angular/components/pull/30495#discussion_r1961260216.
    /** The text used by the typeahead search. */
    searchTerm = computed(() => this.label() ?? this.element().textContent);
    /** The parent Listbox UIPattern. */
    listbox = computed(() => this._cdkListbox.pattern);
    /** A reference to the option element to be focused on navigation. */
    element = computed(() => this._elementRef.nativeElement);
    /** Whether an item is disabled. */
    disabled = input(false, { transform: booleanAttribute });
    /** The text used by the typeahead search. */
    label = input();
    /** The Option UIPattern. */
    pattern = new OptionPattern({
        ...this,
        id: this.id,
        listbox: this.listbox,
        element: this.element,
        searchTerm: this.searchTerm,
    });
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.0", ngImport: i0, type: CdkOption, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.1.0", version: "19.2.0", type: CdkOption, isStandalone: true, selector: "[cdkOption]", inputs: { disabled: { classPropertyName: "disabled", publicName: "disabled", isSignal: true, isRequired: false, transformFunction: null }, label: { classPropertyName: "label", publicName: "label", isSignal: true, isRequired: false, transformFunction: null } }, host: { attributes: { "role": "option" }, properties: { "attr.tabindex": "pattern.tabindex()", "attr.aria-selected": "pattern.selected()", "attr.aria-disabled": "pattern.disabled()" }, classAttribute: "cdk-option" }, exportAs: ["cdkOption"], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.0", ngImport: i0, type: CdkOption, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkOption]',
                    exportAs: 'cdkOption',
                    host: {
                        'role': 'option',
                        'class': 'cdk-option',
                        '[attr.tabindex]': 'pattern.tabindex()',
                        '[attr.aria-selected]': 'pattern.selected()',
                        '[attr.aria-disabled]': 'pattern.disabled()',
                    },
                }]
        }] });

/**
 * Generated bundle index. Do not edit.
 */

export { CdkListbox, CdkOption };
//# sourceMappingURL=listbox.mjs.map
