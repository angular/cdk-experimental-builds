import * as i0 from '@angular/core';
import { f as ListFocusItem, S as SignalLike, a as ListFocusInputs, W as WritableSignalLike, d as ListFocus } from './list-navigation.d-Br99p_2O.js';

/** Represents an item that can be expanded or collapsed. */
interface ExpansionItem extends ListFocusItem {
    /** Whether the item is expandable. */
    expandable: SignalLike<boolean>;
    /** Used to uniquely identify an expansion item. */
    expansionId: SignalLike<string>;
}
interface ExpansionControl extends ExpansionItem {
}
/**
 * Controls a single item's expansion state and interactions,
 * delegating actual state changes to an Expansion manager.
 */
declare class ExpansionControl {
    readonly inputs: ExpansionItem & {
        expansionManager: ListExpansion<ExpansionItem>;
    };
    /** Whether this specific item is currently expanded. Derived from the Expansion manager. */
    readonly isExpanded: i0.Signal<boolean>;
    /** Whether this item can be expanded. */
    readonly isExpandable: i0.Signal<boolean>;
    constructor(inputs: ExpansionItem & {
        expansionManager: ListExpansion<ExpansionItem>;
    });
    /** Requests the Expansopn manager to open this item. */
    open(): void;
    /** Requests the Expansion manager to close this item. */
    close(): void;
    /** Requests the Expansion manager to toggle this item. */
    toggle(): void;
}
/** Represents the required inputs for an expansion behavior. */
interface ListExpansionInputs<T extends ExpansionItem> extends ListFocusInputs<T> {
    /** Whether multiple items can be expanded at once. */
    multiExpandable: SignalLike<boolean>;
    /** An array of ids of the currently expanded items. */
    expandedIds: WritableSignalLike<string[]>;
}
/** Manages the expansion state of a list of items. */
declare class ListExpansion<T extends ExpansionItem> {
    readonly inputs: ListExpansionInputs<T> & {
        focusManager: ListFocus<T>;
    };
    /** A signal holding an array of ids of the currently expanded items. */
    expandedIds: WritableSignalLike<string[]>;
    /** The currently active (focused) item in the list. */
    activeItem: i0.Signal<T>;
    constructor(inputs: ListExpansionInputs<T> & {
        focusManager: ListFocus<T>;
    });
    /** Opens the specified item, or the currently active item if none is specified. */
    open(item?: T): void;
    /** Closes the specified item, or the currently active item if none is specified. */
    close(item?: T): void;
    /**
     * Toggles the expansion state of the specified item,
     * or the currently active item if none is specified.
     */
    toggle(item?: T): void;
    /** Opens all focusable items in the list. */
    openAll(): void;
    /** Closes all focusable items in the list. */
    closeAll(): void;
    /** Checks whether the specified item is expandable / collapsible. */
    isExpandable(item: T): boolean;
    /** Checks whether the specified item is currently expanded. */
    isExpanded(item: T): boolean;
}

export { ListExpansion as a, ExpansionControl as b };
export type { ExpansionItem as E, ListExpansionInputs as L };
