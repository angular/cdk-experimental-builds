import * as _angular_core from '@angular/core';
import { f as ListFocusItem, S as SignalLike, a as ListFocusInputs, d as ListFocus } from './pointer-event-manager.d-BqSm9Jh5.js';

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
    isTyping: _angular_core.Signal<boolean>;
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

export { ListTypeahead as L };
export type { ListTypeaheadItem as a, ListTypeaheadInputs as b };
