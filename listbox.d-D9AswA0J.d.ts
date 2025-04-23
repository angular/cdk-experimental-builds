import * as i0 from '@angular/core';
import { ListFocusItem, SignalLike, ListFocusInputs, ListFocus, ListSelection, ListNavigation, ListNavigationItem, ListSelectionItem, ListNavigationInputs, ListSelectionInputs, KeyboardEventManager, PointerEventManager } from './list-navigation.d-cy63EByU.js';

/**
 * Represents an item in a collection, such as a listbox option, than can be navigated to by
 * typeahead.
 */
interface ListTypeaheadItem extends ListFocusItem {
    /** The text used by the typeahead search. */
    searchTerm: SignalLike<string>;
}
/**
 * Represents the required inputs for a collection that contains items that can be navigated to by
 * typeahead.
 */
interface ListTypeaheadInputs<T extends ListTypeaheadItem> extends ListFocusInputs<T> {
    /** The amount of time before the typeahead search is reset. */
    typeaheadDelay: SignalLike<number>;
}
/** Controls typeahead for a list of items. */
declare class ListTypeahead<T extends ListTypeaheadItem> {
    readonly inputs: ListTypeaheadInputs<T> & {
        focusManager: ListFocus<T>;
    };
    /** A reference to the timeout for resetting the typeahead search. */
    timeout?: ReturnType<typeof setTimeout> | undefined;
    /** The focus controller of the parent list. */
    focusManager: ListFocus<T>;
    /** Whether the user is actively typing a typeahead search query. */
    isTyping: i0.Signal<boolean>;
    /** Keeps track of the characters that typeahead search is being called with. */
    private _query;
    /** The index where that the typeahead search was initiated from. */
    private _startIndex;
    constructor(inputs: ListTypeaheadInputs<T> & {
        focusManager: ListFocus<T>;
    });
    /** Performs a typeahead search, appending the given character to the search string. */
    search(char: string): boolean;
    /**
     * Returns the first item whose search term matches the
     * current query starting from the the current anchor index.
     */
    private _getItem;
}

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
    index: i0.Signal<number>;
    /** Whether the option is selected. */
    selected: i0.Signal<boolean | undefined>;
    /** Whether the option is disabled. */
    disabled: SignalLike<boolean>;
    /** The text used by the typeahead search. */
    searchTerm: SignalLike<string>;
    /** A reference to the parent listbox. */
    listbox: SignalLike<ListboxPattern$1<V> | undefined>;
    /** The tabindex of the option. */
    tabindex: i0.Signal<0 | -1 | undefined>;
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
    disabled: i0.Signal<boolean>;
    /** Whether the listbox is readonly. */
    readonly: SignalLike<boolean>;
    /** The tabindex of the listbox. */
    tabindex: i0.Signal<0 | -1>;
    /** The id of the current active item. */
    activedescendant: i0.Signal<string | undefined>;
    /** Whether multiple items in the list can be selected at once. */
    multi: SignalLike<boolean>;
    /** The number of items in the listbox. */
    setsize: i0.Signal<number>;
    /** Whether the listbox selection follows focus. */
    followFocus: i0.Signal<boolean>;
    /** Whether the listbox should wrap. Used to disable wrapping while range selecting. */
    wrap: i0.WritableSignal<boolean>;
    /** The key used to navigate to the previous item in the list. */
    prevKey: i0.Signal<"ArrowUp" | "ArrowRight" | "ArrowLeft">;
    /** The key used to navigate to the next item in the list. */
    nextKey: i0.Signal<"ArrowRight" | "ArrowLeft" | "ArrowDown">;
    /** Represents the space key. Does nothing when the user is actively using typeahead. */
    dynamicSpaceKey: i0.Signal<"" | " ">;
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
    anchorIndex: i0.WritableSignal<number>;
    /** The keydown event manager for the listbox. */
    keydown: i0.Signal<KeyboardEventManager<KeyboardEvent>>;
    /** The pointerdown event manager for the listbox. */
    pointerdown: i0.Signal<PointerEventManager<PointerEvent>>;
    constructor(inputs: ListboxInputs<V>);
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

export { ListboxPattern, OptionPattern };
export type { ListboxInputs, OptionInputs };
