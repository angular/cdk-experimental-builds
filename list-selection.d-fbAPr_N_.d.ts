import * as _angular_core from '@angular/core';
import { f as ListFocusItem, S as SignalLike, a as ListFocusInputs, W as WritableSignalLike, d as ListFocus } from './pointer-event-manager.d-BqSm9Jh5.js';

/** Represents an item in a collection, such as a listbox option, than can be selected. */
interface ListSelectionItem<V> extends ListFocusItem {
    /** The value of the item. */
    value: SignalLike<V>;
}
/** Represents the required inputs for a collection that contains selectable items. */
interface ListSelectionInputs<T extends ListSelectionItem<V>, V> extends ListFocusInputs<T> {
    /** Whether multiple items in the list can be selected at once. */
    multi: SignalLike<boolean>;
    /** The current value of the list selection. */
    value: WritableSignalLike<V[]>;
    /** The selection strategy used by the list. */
    selectionMode: SignalLike<'follow' | 'explicit'>;
}
/** Controls selection for a list of items. */
declare class ListSelection<T extends ListSelectionItem<V>, V> {
    readonly inputs: ListSelectionInputs<T, V> & {
        focusManager: ListFocus<T>;
    };
    /** The start index to use for range selection. */
    rangeStartIndex: _angular_core.WritableSignal<number>;
    /** The end index to use for range selection. */
    rangeEndIndex: _angular_core.WritableSignal<number>;
    /** The currently selected items. */
    selectedItems: _angular_core.Signal<T[]>;
    constructor(inputs: ListSelectionInputs<T, V> & {
        focusManager: ListFocus<T>;
    });
    /** Selects the item at the current active index. */
    select(item?: ListSelectionItem<V>, opts?: {
        anchor: boolean;
    }): void;
    /** Deselects the item at the current active index. */
    deselect(item?: T): void;
    /** Toggles the item at the current active index. */
    toggle(): void;
    /** Toggles only the item at the current active index. */
    toggleOne(): void;
    /** Selects all items in the list. */
    selectAll(): void;
    /** Deselects all items in the list. */
    deselectAll(): void;
    /**
     * Selects all items in the list or deselects all
     * items in the list if all items are already selected.
     */
    toggleAll(): void;
    /** Sets the selection to only the current active item. */
    selectOne(): void;
    /**
     * Selects all items in the list up to the anchor item.
     *
     * Deselects all items that were previously within the
     * selected range that are now outside of the selected range
     */
    selectRange(opts?: {
        anchor: boolean;
    }): void;
    /** Marks the given index as the start of a range selection. */
    beginRangeSelection(index?: number): void;
    /** Returns the items in the list starting from the given index.  */
    private _getItemsFromIndex;
}

export { ListSelection as L };
export type { ListSelectionItem as a, ListSelectionInputs as b };
