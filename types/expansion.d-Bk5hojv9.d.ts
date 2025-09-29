import * as _angular_core from '@angular/core';
import { SignalLike, WritableSignalLike } from './list-navigation.d-v7LRaIQt.js';

/** Represents an item that can be expanded or collapsed. */
interface ExpansionItem {
    /** Whether the item is expandable. */
    expandable: SignalLike<boolean>;
    /** Used to uniquely identify an expansion item. */
    expansionId: SignalLike<string>;
    /** Whether the expansion is disabled. */
    disabled: SignalLike<boolean>;
}
interface ExpansionControl extends ExpansionItem {
}
/**
 * Controls a single item's expansion state and interactions,
 * delegating actual state changes to an Expansion manager.
 */
declare class ExpansionControl {
    readonly inputs: ExpansionItem & {
        expansionManager: ListExpansion;
    };
    /** Whether this specific item is currently expanded. Derived from the Expansion manager. */
    readonly isExpanded: _angular_core.Signal<boolean>;
    /** Whether this item can be expanded. */
    readonly isExpandable: _angular_core.Signal<boolean>;
    constructor(inputs: ExpansionItem & {
        expansionManager: ListExpansion;
    });
    /** Requests the Expansion manager to open this item. */
    open(): void;
    /** Requests the Expansion manager to close this item. */
    close(): void;
    /** Requests the Expansion manager to toggle this item. */
    toggle(): void;
}
/** Represents the required inputs for an expansion behavior. */
interface ListExpansionInputs {
    /** Whether multiple items can be expanded at once. */
    multiExpandable: SignalLike<boolean>;
    /** An array of ids of the currently expanded items. */
    expandedIds: WritableSignalLike<string[]>;
    /** An array of expansion items. */
    items: SignalLike<ExpansionItem[]>;
    /** Whether all expansions are disabled. */
    disabled: SignalLike<boolean>;
}
/** Manages the expansion state of a list of items. */
declare class ListExpansion {
    readonly inputs: ListExpansionInputs;
    /** A signal holding an array of ids of the currently expanded items. */
    expandedIds: WritableSignalLike<string[]>;
    constructor(inputs: ListExpansionInputs);
    /** Opens the specified item. */
    open(item: ExpansionItem): void;
    /** Closes the specified item. */
    close(item: ExpansionItem): void;
    /** Toggles the expansion state of the specified item. */
    toggle(item: ExpansionItem): void;
    /** Opens all focusable items in the list. */
    openAll(): void;
    /** Closes all focusable items in the list. */
    closeAll(): void;
    /** Checks whether the specified item is expandable / collapsible. */
    isExpandable(item: ExpansionItem): boolean;
    /** Checks whether the specified item is currently expanded. */
    isExpanded(item: ExpansionItem): boolean;
}

export { ExpansionControl, ListExpansion };
export type { ExpansionItem, ListExpansionInputs };
