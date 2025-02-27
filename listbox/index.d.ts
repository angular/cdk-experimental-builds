import { Direction } from '@angular/cdk/bidi';
import * as i0 from '@angular/core';
import { InputSignal } from '@angular/core';
import { InputSignalWithTransform } from '@angular/core';
import { ListboxPattern } from '@angular/cdk-experimental/ui-patterns';
import { ModelSignal } from '@angular/core';
import { OptionPattern } from '@angular/cdk-experimental/ui-patterns';
import { Signal } from '@angular/core';

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
export declare class CdkListbox {
    /** The directionality (LTR / RTL) context for the application (or a subtree of it). */
    private readonly _directionality;
    /** The CdkOptions nested inside of the CdkListbox. */
    private readonly _cdkOptions;
    /** A signal wrapper for directionality. */
    protected textDirection: Signal<Direction>;
    /** The Option UIPatterns of the child CdkOptions. */
    protected items: Signal<OptionPattern[]>;
    /** Whether the list is vertically or horizontally oriented. */
    orientation: InputSignal<"vertical" | "horizontal">;
    /** Whether multiple items in the list can be selected at once. */
    multiselectable: InputSignalWithTransform<boolean, unknown>;
    /** Whether focus should wrap when navigating. */
    wrap: InputSignalWithTransform<boolean, unknown>;
    /** Whether disabled items in the list should be skipped when navigating. */
    skipDisabled: InputSignalWithTransform<boolean, unknown>;
    /** The focus strategy used by the list. */
    focusMode: InputSignal<"roving" | "activedescendant">;
    /** The selection strategy used by the list. */
    selectionMode: InputSignal<"follow" | "explicit">;
    /** The amount of time before the typeahead search is reset. */
    typeaheadDelay: InputSignal<number>;
    /** Whether the listbox is disabled. */
    disabled: InputSignalWithTransform<boolean, unknown>;
    /** The ids of the current selected items. */
    selectedIds: ModelSignal<string[]>;
    /** The current index that has been navigated to. */
    activeIndex: ModelSignal<number>;
    /** The Listbox UIPattern. */
    pattern: ListboxPattern;
    static ɵfac: i0.ɵɵFactoryDeclaration<CdkListbox, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<CdkListbox, "[cdkListbox]", ["cdkListbox"], { "orientation": { "alias": "orientation"; "required": false; "isSignal": true; }; "multiselectable": { "alias": "multiselectable"; "required": false; "isSignal": true; }; "wrap": { "alias": "wrap"; "required": false; "isSignal": true; }; "skipDisabled": { "alias": "skipDisabled"; "required": false; "isSignal": true; }; "focusMode": { "alias": "focusMode"; "required": false; "isSignal": true; }; "selectionMode": { "alias": "selectionMode"; "required": false; "isSignal": true; }; "typeaheadDelay": { "alias": "typeaheadDelay"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "selectedIds": { "alias": "selectedIds"; "required": false; "isSignal": true; }; "activeIndex": { "alias": "activeIndex"; "required": false; "isSignal": true; }; }, { "selectedIds": "selectedIdsChange"; "activeIndex": "activeIndexChange"; }, ["_cdkOptions"], never, true, never>;
}

/** A selectable option in a CdkListbox. */
export declare class CdkOption {
    /** A reference to the option element. */
    private readonly _elementRef;
    /** The parent CdkListbox. */
    private readonly _cdkListbox;
    /** A unique identifier for the option. */
    private readonly _generatedId;
    /** A unique identifier for the option. */
    protected id: Signal<string>;
    /** The text used by the typeahead search. */
    protected searchTerm: Signal<any>;
    /** The parent Listbox UIPattern. */
    protected listbox: Signal<ListboxPattern>;
    /** A reference to the option element to be focused on navigation. */
    protected element: Signal<any>;
    /** Whether an item is disabled. */
    disabled: InputSignalWithTransform<boolean, unknown>;
    /** The text used by the typeahead search. */
    label: InputSignal<string | undefined>;
    /** The Option UIPattern. */
    pattern: OptionPattern;
    static ɵfac: i0.ɵɵFactoryDeclaration<CdkOption, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<CdkOption, "[cdkOption]", ["cdkOption"], { "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "label": { "alias": "label"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}

export { }
