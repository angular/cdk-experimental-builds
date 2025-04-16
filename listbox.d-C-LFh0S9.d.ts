import * as i0 from '@angular/core';
import { ListNavigationItem, SignalLike, ListNavigation, ListFocus, ListSelection, ListSelectionItem, ListFocusItem, ListNavigationInputs, ListSelectionInputs, ListFocusInputs, KeyboardEventManager, PointerEventManager } from './list-focus.d-1SGksIi8.js';

/**
 * Represents an item in a collection, such as a listbox option, than can be navigated to by
 * typeahead.
 */
interface ListTypeaheadItem extends ListNavigationItem {
    /** The text used by the typeahead search. */
    searchTerm: SignalLike<string>;
}
/**
 * Represents the required inputs for a collection that contains items that can be navigated to by
 * typeahead.
 */
interface ListTypeaheadInputs {
    /** The amount of time before the typeahead search is reset. */
    typeaheadDelay: SignalLike<number>;
}
/** Controls typeahead for a list of items. */
declare class ListTypeahead<T extends ListTypeaheadItem> {
    readonly inputs: ListTypeaheadInputs & {
        navigation: ListNavigation<T>;
    };
    /** A reference to the timeout for resetting the typeahead search. */
    timeout?: ReturnType<typeof setTimeout> | undefined;
    /** The navigation controller of the parent list. */
    navigation: ListNavigation<T>;
    /** Whether the user is actively typing a typeahead search query. */
    isTyping: i0.Signal<boolean>;
    /** Keeps track of the characters that typeahead search is being called with. */
    private _query;
    /** The index where that the typeahead search was initiated from. */
    private _startIndex;
    constructor(inputs: ListTypeaheadInputs & {
        navigation: ListNavigation<T>;
    });
    /** Performs a typeahead search, appending the given character to the search string. */
    search(char: string): void;
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
    select?: boolean;
    toggle?: boolean;
    toggleOne?: boolean;
    selectOne?: boolean;
    selectAll?: boolean;
    selectFromAnchor?: boolean;
    selectFromActive?: boolean;
    toggleFromAnchor?: boolean;
}
/** Represents the required inputs for a listbox. */
type ListboxInputs<V> = ListNavigationInputs<OptionPattern<V>> & ListSelectionInputs<OptionPattern<V>, V> & ListTypeaheadInputs & ListFocusInputs<OptionPattern<V>> & {
    disabled: SignalLike<boolean>;
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
    disabled: SignalLike<boolean>;
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
    /** The key used to navigate to the previous item in the list. */
    prevKey: i0.Signal<"ArrowUp" | "ArrowRight" | "ArrowLeft">;
    /** The key used to navigate to the next item in the list. */
    nextKey: i0.Signal<"ArrowRight" | "ArrowLeft" | "ArrowDown">;
    /** Represents the space key. Does nothing when the user is actively using typeahead. */
    dynamicSpaceKey: i0.Signal<"" | " ">;
    /** The regexp used to decide if a key should trigger typeahead. */
    typeaheadRegexp: RegExp;
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
    /** Handles updating selection for the listbox. */
    private _updateSelection;
    private _getItem;
}

export { ListboxPattern, OptionPattern };
export type { ListboxInputs, OptionInputs };
