import { computed } from '@angular/core';

/**
 * Controls a single item's expansion state and interactions,
 * delegating actual state changes to an Expansion manager.
 */
class ExpansionControl {
    inputs;
    /** Whether this specific item is currently expanded. Derived from the Expansion manager. */
    isExpanded = computed(() => this.inputs.expansionManager.isExpanded(this));
    /** Whether this item can be expanded. */
    isExpandable = computed(() => this.inputs.expansionManager.isExpandable(this));
    constructor(inputs) {
        this.inputs = inputs;
        this.expansionId = inputs.expansionId;
        this.expandable = inputs.expandable;
        this.disabled = inputs.disabled;
    }
    /** Requests the Expansopn manager to open this item. */
    open() {
        this.inputs.expansionManager.open(this);
    }
    /** Requests the Expansion manager to close this item. */
    close() {
        this.inputs.expansionManager.close(this);
    }
    /** Requests the Expansion manager to toggle this item. */
    toggle() {
        this.inputs.expansionManager.toggle(this);
    }
}
/** Manages the expansion state of a list of items. */
class ListExpansion {
    inputs;
    /** A signal holding an array of ids of the currently expanded items. */
    expandedIds;
    constructor(inputs) {
        this.inputs = inputs;
        this.expandedIds = inputs.expandedIds;
    }
    /** Opens the specified item. */
    open(item) {
        if (!this.isExpandable(item))
            return;
        if (this.isExpanded(item))
            return;
        if (!this.inputs.multiExpandable()) {
            this.closeAll();
        }
        this.expandedIds.update(ids => ids.concat(item.expansionId()));
    }
    /** Closes the specified item. */
    close(item) {
        if (this.isExpandable(item)) {
            this.expandedIds.update(ids => ids.filter(id => id !== item.expansionId()));
        }
    }
    /** Toggles the expansion state of the specified item. */
    toggle(item) {
        this.expandedIds().includes(item.expansionId()) ? this.close(item) : this.open(item);
    }
    /** Opens all focusable items in the list. */
    openAll() {
        if (this.inputs.multiExpandable()) {
            for (const item of this.inputs.items()) {
                this.open(item);
            }
        }
    }
    /** Closes all focusable items in the list. */
    closeAll() {
        for (const item of this.inputs.items()) {
            this.close(item);
        }
    }
    /** Checks whether the specified item is expandable / collapsible. */
    isExpandable(item) {
        return !this.inputs.disabled() && !item.disabled() && item.expandable();
    }
    /** Checks whether the specified item is currently expanded. */
    isExpanded(item) {
        return this.expandedIds().includes(item.expansionId());
    }
}

export { ExpansionControl as E, ListExpansion as L };
//# sourceMappingURL=expansion-C9iQLHOG.mjs.map
