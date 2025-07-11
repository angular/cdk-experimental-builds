import * as _angular_core from '@angular/core';
import { e as ListNavigationItem, f as ListFocusItem, S as SignalLike, d as ListFocus, b as ListNavigation, L as ListNavigationInputs, a as ListFocusInputs, K as KeyboardEventManager, P as PointerEventManager } from './list-navigation.d-tcweHm4g.js';
import { a as ListSelectionItem, L as ListSelection, b as ListSelectionInputs } from './list-selection.d-zyz_XRbe.js';
import { a as ListTypeaheadItem, b as ListTypeaheadInputs, L as ListTypeahead } from './list-typeahead.d-DvIIfjfu.js';

/**
 * Represents the properties exposed by a listbox that need to be accessed by an option.
 * This exists to avoid circular dependency errors between the listbox and option.
 */
interface ListboxPattern$1<V> {
    focusManager: ListFocus<OptionPattern<V>>;
    selection: ListSelection<OptionPattern<V>, V>;
    navigation: ListNavigation<OptionPattern<V>>;
}
/** Represents the required inputs for an option in a listbox. */
interface OptionInputs<V> extends ListNavigationItem, ListSelectionItem<V>, ListTypeaheadItem, ListFocusItem {
    listbox: SignalLike<ListboxPattern$1<V> | undefined>;
}
/** Represents an option in a listbox. */
declare class OptionPattern<V> {
    /** A unique identifier for the option. */
    id: SignalLike<string>;
    /** The value of the option. */
    value: SignalLike<V>;
    /** The position of the option in the list. */
    index: _angular_core.Signal<number>;
    /** Whether the option is active. */
    active: _angular_core.Signal<boolean>;
    /** Whether the option is selected. */
    selected: _angular_core.Signal<boolean | undefined>;
    /** Whether the option is disabled. */
    disabled: SignalLike<boolean>;
    /** The text used by the typeahead search. */
    searchTerm: SignalLike<string>;
    /** A reference to the parent listbox. */
    listbox: SignalLike<ListboxPattern$1<V> | undefined>;
    /** The tabindex of the option. */
    tabindex: _angular_core.Signal<0 | -1 | undefined>;
    /** The html element that should receive focus. */
    element: SignalLike<HTMLElement>;
    constructor(args: OptionInputs<V>);
}

/** The selection operations that the listbox can perform. */
interface SelectOptions {
    toggle?: boolean;
    selectOne?: boolean;
    selectRange?: boolean;
    anchor?: boolean;
}
/** Represents the required inputs for a listbox. */
type ListboxInputs<V> = ListNavigationInputs<OptionPattern<V>> & ListSelectionInputs<OptionPattern<V>, V> & ListTypeaheadInputs<OptionPattern<V>> & ListFocusInputs<OptionPattern<V>> & {
    readonly: SignalLike<boolean>;
};
/** Controls the state of a listbox. */
declare class ListboxPattern<V> {
    readonly inputs: ListboxInputs<V>;
    /** Controls navigation for the listbox. */
    navigation: ListNavigation<OptionPattern<V>>;
    /** Controls selection for the listbox. */
    selection: ListSelection<OptionPattern<V>, V>;
    /** Controls typeahead for the listbox. */
    typeahead: ListTypeahead<OptionPattern<V>>;
    /** Controls focus for the listbox. */
    focusManager: ListFocus<OptionPattern<V>>;
    /** Whether the list is vertically or horizontally oriented. */
    orientation: SignalLike<'vertical' | 'horizontal'>;
    /** Whether the listbox is disabled. */
    disabled: _angular_core.Signal<boolean>;
    /** Whether the listbox is readonly. */
    readonly: SignalLike<boolean>;
    /** The tabindex of the listbox. */
    tabindex: _angular_core.Signal<0 | -1>;
    /** The id of the current active item. */
    activedescendant: _angular_core.Signal<string | undefined>;
    /** Whether multiple items in the list can be selected at once. */
    multi: SignalLike<boolean>;
    /** The number of items in the listbox. */
    setsize: _angular_core.Signal<number>;
    /** Whether the listbox selection follows focus. */
    followFocus: _angular_core.Signal<boolean>;
    /** Whether the listbox should wrap. Used to disable wrapping while range selecting. */
    wrap: _angular_core.WritableSignal<boolean>;
    /** The key used to navigate to the previous item in the list. */
    prevKey: _angular_core.Signal<"ArrowUp" | "ArrowRight" | "ArrowLeft">;
    /** The key used to navigate to the next item in the list. */
    nextKey: _angular_core.Signal<"ArrowRight" | "ArrowLeft" | "ArrowDown">;
    /** Represents the space key. Does nothing when the user is actively using typeahead. */
    dynamicSpaceKey: _angular_core.Signal<"" | " ">;
    /** The regexp used to decide if a key should trigger typeahead. */
    typeaheadRegexp: RegExp;
    /**
     * The uncommitted index for selecting a range of options.
     *
     * NOTE: This is subtly distinct from the "rangeStartIndex" in the ListSelection behavior.
     * The anchorIndex does not necessarily represent the start of a range, but represents the most
     * recent index where the user showed intent to begin a range selection. Usually, this is wherever
     * the user most recently pressed the "Shift" key, but if the user presses shift + space to select
     * from the anchor, the user is not intending to start a new range from this index.
     *
     * In other words, "rangeStartIndex" is only set when a user commits to starting a range selection
     * while "anchorIndex" is set whenever a user indicates they may be starting a range selection.
     */
    anchorIndex: _angular_core.WritableSignal<number>;
    /** The keydown event manager for the listbox. */
    keydown: _angular_core.Signal<KeyboardEventManager<KeyboardEvent>>;
    /** The pointerdown event manager for the listbox. */
    pointerdown: _angular_core.Signal<PointerEventManager<PointerEvent>>;
    constructor(inputs: ListboxInputs<V>);
    /** Returns a set of violations */
    validate(): string[];
    /** Handles keydown events for the listbox. */
    onKeydown(event: KeyboardEvent): void;
    onPointerdown(event: PointerEvent): void;
    /** Navigates to the first option in the listbox. */
    first(opts?: SelectOptions): void;
    /** Navigates to the last option in the listbox. */
    last(opts?: SelectOptions): void;
    /** Navigates to the next option in the listbox. */
    next(opts?: SelectOptions): void;
    /** Navigates to the previous option in the listbox. */
    prev(opts?: SelectOptions): void;
    /** Navigates to the given item in the listbox. */
    goto(event: PointerEvent, opts?: SelectOptions): void;
    /** Handles typeahead search navigation for the listbox. */
    search(char: string, opts?: SelectOptions): void;
    /**
     * Sets the listbox to it's default initial state.
     *
     * Sets the active index of the listbox to the first focusable selected
     * item if one exists. Otherwise, sets focus to the first focusable item.
     *
     * This method should be called once the listbox and it's options are properly initialized,
     * meaning the ListboxPattern and OptionPatterns should have references to each other before this
     * is called.
     */
    setDefaultState(): void;
    /**
     * Safely performs a navigation operation.
     *
     * Handles conditionally disabling wrapping for when a navigation
     * operation is occurring while the user is selecting a range of options.
     *
     * Handles boilerplate calling of focus & selection operations. Also ensures these
     * additional operations are only called if the navigation operation moved focus to a new option.
     */
    private _navigate;
    /** Handles updating selection for the listbox. */
    private _updateSelection;
    private _getItem;
}

export { ListboxPattern as a, OptionPattern as b };
export type { ListboxInputs as L, OptionInputs as O };
