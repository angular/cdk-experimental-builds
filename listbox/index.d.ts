import * as i0 from '@angular/core';
import * as _angular_cdk_bidi from '@angular/cdk/bidi';
import { O as OptionPattern, L as ListboxPattern } from '../listbox.d-e1f2866f.js';

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
declare class CdkListbox<V> {
    /** The directionality (LTR / RTL) context for the application (or a subtree of it). */
    private readonly _directionality;
    /** The CdkOptions nested inside of the CdkListbox. */
    private readonly _cdkOptions;
    /** A signal wrapper for directionality. */
    protected textDirection: i0.Signal<_angular_cdk_bidi.Direction>;
    /** The Option UIPatterns of the child CdkOptions. */
    protected items: i0.Signal<OptionPattern<any>[]>;
    /** Whether the list is vertically or horizontally oriented. */
    orientation: i0.InputSignal<"vertical" | "horizontal">;
    /** Whether multiple items in the list can be selected at once. */
    multiselectable: i0.InputSignalWithTransform<boolean, unknown>;
    /** Whether focus should wrap when navigating. */
    wrap: i0.InputSignalWithTransform<boolean, unknown>;
    /** Whether disabled items in the list should be skipped when navigating. */
    skipDisabled: i0.InputSignalWithTransform<boolean, unknown>;
    /** The focus strategy used by the list. */
    focusMode: i0.InputSignal<"roving" | "activedescendant">;
    /** The selection strategy used by the list. */
    selectionMode: i0.InputSignal<"follow" | "explicit">;
    /** The amount of time before the typeahead search is reset. */
    typeaheadDelay: i0.InputSignal<number>;
    /** Whether the listbox is disabled. */
    disabled: i0.InputSignalWithTransform<boolean, unknown>;
    /** The values of the current selected items. */
    value: i0.ModelSignal<V[]>;
    /** The current index that has been navigated to. */
    activeIndex: i0.ModelSignal<number>;
    /** The Listbox UIPattern. */
    pattern: ListboxPattern<V>;
    static ɵfac: i0.ɵɵFactoryDeclaration<CdkListbox<any>, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<CdkListbox<any>, "[cdkListbox]", ["cdkListbox"], { "orientation": { "alias": "orientation"; "required": false; "isSignal": true; }; "multiselectable": { "alias": "multiselectable"; "required": false; "isSignal": true; }; "wrap": { "alias": "wrap"; "required": false; "isSignal": true; }; "skipDisabled": { "alias": "skipDisabled"; "required": false; "isSignal": true; }; "focusMode": { "alias": "focusMode"; "required": false; "isSignal": true; }; "selectionMode": { "alias": "selectionMode"; "required": false; "isSignal": true; }; "typeaheadDelay": { "alias": "typeaheadDelay"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "value": { "alias": "value"; "required": false; "isSignal": true; }; "activeIndex": { "alias": "activeIndex"; "required": false; "isSignal": true; }; }, { "value": "valueChange"; "activeIndex": "activeIndexChange"; }, ["_cdkOptions"], never, true, never>;
}
/** A selectable option in a CdkListbox. */
declare class CdkOption<V> {
    /** A reference to the option element. */
    private readonly _elementRef;
    /** The parent CdkListbox. */
    private readonly _cdkListbox;
    /** A unique identifier for the option. */
    private readonly _generatedId;
    /** A unique identifier for the option. */
    protected id: i0.Signal<string>;
    protected value: i0.InputSignal<V>;
    /** The text used by the typeahead search. */
    protected searchTerm: i0.Signal<any>;
    /** The parent Listbox UIPattern. */
    protected listbox: i0.Signal<ListboxPattern<any>>;
    /** A reference to the option element to be focused on navigation. */
    protected element: i0.Signal<any>;
    /** Whether an item is disabled. */
    disabled: i0.InputSignalWithTransform<boolean, unknown>;
    /** The text used by the typeahead search. */
    label: i0.InputSignal<string | undefined>;
    /** The Option UIPattern. */
    pattern: OptionPattern<V>;
    static ɵfac: i0.ɵɵFactoryDeclaration<CdkOption<any>, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<CdkOption<any>, "[cdkOption]", ["cdkOption"], { "value": { "alias": "value"; "required": true; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "label": { "alias": "label"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}

export { CdkListbox, CdkOption };
