import * as _angular_core from '@angular/core';
import * as _angular_cdk_bidi from '@angular/cdk/bidi';
import { b as OptionPattern, a as ListboxPattern } from '../listbox.d-hkdivyCf.js';
import '../list-navigation.d-tcweHm4g.js';
import '../list-selection.d-BBLdeUeF.js';
import '../list-typeahead.d-DvIIfjfu.js';

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
declare class CdkListbox<V> {
    /** The directionality (LTR / RTL) context for the application (or a subtree of it). */
    private readonly _directionality;
    /** The CdkOptions nested inside of the CdkListbox. */
    private readonly _cdkOptions;
    /** A signal wrapper for directionality. */
    protected textDirection: _angular_core.Signal<_angular_cdk_bidi.Direction>;
    /** The Option UIPatterns of the child CdkOptions. */
    protected items: _angular_core.Signal<OptionPattern<any>[]>;
    /** Whether the list is vertically or horizontally oriented. */
    orientation: _angular_core.InputSignal<"vertical" | "horizontal">;
    /** Whether multiple items in the list can be selected at once. */
    multi: _angular_core.InputSignalWithTransform<boolean, unknown>;
    /** Whether focus should wrap when navigating. */
    wrap: _angular_core.InputSignalWithTransform<boolean, unknown>;
    /** Whether disabled items in the list should be skipped when navigating. */
    skipDisabled: _angular_core.InputSignalWithTransform<boolean, unknown>;
    /** The focus strategy used by the list. */
    focusMode: _angular_core.InputSignal<"roving" | "activedescendant">;
    /** The selection strategy used by the list. */
    selectionMode: _angular_core.InputSignal<"follow" | "explicit">;
    /** The amount of time before the typeahead search is reset. */
    typeaheadDelay: _angular_core.InputSignal<number>;
    /** Whether the listbox is disabled. */
    disabled: _angular_core.InputSignalWithTransform<boolean, unknown>;
    /** Whether the listbox is readonly. */
    readonly: _angular_core.InputSignalWithTransform<boolean, unknown>;
    /** The values of the current selected items. */
    value: _angular_core.ModelSignal<V[]>;
    /** The Listbox UIPattern. */
    pattern: ListboxPattern<V>;
    /** Whether the listbox has received focus yet. */
    private _hasFocused;
    constructor();
    onFocus(): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CdkListbox<any>, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<CdkListbox<any>, "[cdkListbox]", ["cdkListbox"], { "orientation": { "alias": "orientation"; "required": false; "isSignal": true; }; "multi": { "alias": "multi"; "required": false; "isSignal": true; }; "wrap": { "alias": "wrap"; "required": false; "isSignal": true; }; "skipDisabled": { "alias": "skipDisabled"; "required": false; "isSignal": true; }; "focusMode": { "alias": "focusMode"; "required": false; "isSignal": true; }; "selectionMode": { "alias": "selectionMode"; "required": false; "isSignal": true; }; "typeaheadDelay": { "alias": "typeaheadDelay"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "readonly": { "alias": "readonly"; "required": false; "isSignal": true; }; "value": { "alias": "value"; "required": false; "isSignal": true; }; }, { "value": "valueChange"; }, ["_cdkOptions"], never, true, never>;
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
    protected id: _angular_core.Signal<string>;
    /** The value of the option. */
    readonly value: _angular_core.InputSignal<V>;
    /** The text used by the typeahead search. */
    protected searchTerm: _angular_core.Signal<any>;
    /** The parent Listbox UIPattern. */
    protected listbox: _angular_core.Signal<ListboxPattern<any>>;
    /** A reference to the option element to be focused on navigation. */
    protected element: _angular_core.Signal<any>;
    /** Whether an item is disabled. */
    disabled: _angular_core.InputSignalWithTransform<boolean, unknown>;
    /** The text used by the typeahead search. */
    label: _angular_core.InputSignal<string | undefined>;
    /** The Option UIPattern. */
    pattern: OptionPattern<V>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CdkOption<any>, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<CdkOption<any>, "[cdkOption]", ["cdkOption"], { "value": { "alias": "value"; "required": true; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "label": { "alias": "label"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}

export { CdkListbox, CdkOption };
