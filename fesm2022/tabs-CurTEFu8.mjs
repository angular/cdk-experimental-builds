import { computed, signal } from '@angular/core';
import { K as KeyboardEventManager, P as PointerEventManager, L as ListFocus, b as ListNavigation, a as ListSelection } from './list-focus-Di7m_z_6.mjs';

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
        this.element = inputs.element;
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
    /** The currently active (focused) item in the list. */
    activeItem = computed(() => this.inputs.focusManager.activeItem());
    constructor(inputs) {
        this.inputs = inputs;
        this.expandedIds = inputs.expandedIds ?? signal([]);
    }
    /** Opens the specified item, or the currently active item if none is specified. */
    open(item = this.activeItem()) {
        if (this.isExpandable(item)) {
            this.inputs.multiExpandable()
                ? this.expandedIds.update(ids => ids.concat(item.expansionId()))
                : this.expandedIds.set([item.expansionId()]);
        }
    }
    /** Closes the specified item, or the currently active item if none is specified. */
    close(item = this.activeItem()) {
        if (this.isExpandable(item)) {
            this.expandedIds.update(ids => ids.filter(id => id !== item.expansionId()));
        }
    }
    /**
     * Toggles the expansion state of the specified item,
     * or the currently active item if none is specified.
     */
    toggle(item = this.activeItem()) {
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
        return (!this.inputs.disabled() && this.inputs.focusManager.isFocusable(item) && item.expandable());
    }
    /** Checks whether the specified item is currently expanded. */
    isExpanded(item) {
        return this.expandedIds().includes(item.expansionId());
    }
}

/** A tab in a tablist. */
class TabPattern {
    inputs;
    /** A global unique identifier for the tab. */
    id;
    /** A local unique identifier for the tab. */
    value;
    /** Whether the tab is disabled. */
    disabled;
    /** The html element that should receive focus. */
    element;
    /** Whether this tab has expandable content. */
    expandable;
    /** The unique identifier used by the expansion behavior. */
    expansionId;
    /** Whether the tab is expanded. */
    expanded;
    /** Whether the tab is active. */
    active = computed(() => this.inputs.tablist().focusManager.activeItem() === this);
    /** Whether the tab is selected. */
    selected = computed(() => !!this.inputs.tablist().selection.inputs.value().includes(this.value()));
    /** The tabindex of the tab. */
    tabindex = computed(() => this.inputs.tablist().focusManager.getItemTabindex(this));
    /** The id of the tabpanel associated with the tab. */
    controls = computed(() => this.inputs.tabpanel()?.id());
    constructor(inputs) {
        this.inputs = inputs;
        this.id = inputs.id;
        this.value = inputs.value;
        this.disabled = inputs.disabled;
        this.element = inputs.element;
        const expansionControl = new ExpansionControl({
            ...inputs,
            expansionId: inputs.value,
            expandable: () => true,
            expansionManager: inputs.tablist().expansionManager,
        });
        this.expansionId = expansionControl.expansionId;
        this.expandable = expansionControl.isExpandable;
        this.expanded = expansionControl.isExpanded;
    }
}
/** A tabpanel associated with a tab. */
class TabPanelPattern {
    inputs;
    /** A global unique identifier for the tabpanel. */
    id;
    /** A local unique identifier for the tabpanel. */
    value;
    /** Whether the tabpanel is hidden. */
    hidden = computed(() => this.inputs.tab()?.expanded() === false);
    constructor(inputs) {
        this.inputs = inputs;
        this.id = inputs.id;
        this.value = inputs.value;
    }
}
/** Controls the state of a tablist. */
class TabListPattern {
    inputs;
    /** Controls navigation for the tablist. */
    navigation;
    /** Controls selection for the tablist. */
    selection;
    /** Controls focus for the tablist. */
    focusManager;
    /** Controls expansion for the tablist. */
    expansionManager;
    /** Whether the tablist is vertically or horizontally oriented. */
    orientation;
    /** Whether the tablist is disabled. */
    disabled;
    /** The tabindex of the tablist. */
    tabindex = computed(() => this.focusManager.getListTabindex());
    /** The id of the current active tab. */
    activedescendant = computed(() => this.focusManager.getActiveDescendant());
    /** Whether selection should follow focus. */
    followFocus = computed(() => this.inputs.selectionMode() === 'follow');
    /** The key used to navigate to the previous tab in the tablist. */
    prevKey = computed(() => {
        if (this.inputs.orientation() === 'vertical') {
            return 'ArrowUp';
        }
        return this.inputs.textDirection() === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
    });
    /** The key used to navigate to the next item in the list. */
    nextKey = computed(() => {
        if (this.inputs.orientation() === 'vertical') {
            return 'ArrowDown';
        }
        return this.inputs.textDirection() === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
    });
    /** The keydown event manager for the tablist. */
    keydown = computed(() => {
        return new KeyboardEventManager()
            .on(this.prevKey, () => this.prev({ select: this.followFocus() }))
            .on(this.nextKey, () => this.next({ select: this.followFocus() }))
            .on('Home', () => this.first({ select: this.followFocus() }))
            .on('End', () => this.last({ select: this.followFocus() }))
            .on(' ', () => this._select({ select: true }))
            .on('Enter', () => this._select({ select: true }));
    });
    /** The pointerdown event manager for the tablist. */
    pointerdown = computed(() => {
        return new PointerEventManager().on(e => this.goto(e, { select: true }));
    });
    constructor(inputs) {
        this.inputs = inputs;
        this.disabled = inputs.disabled;
        this.orientation = inputs.orientation;
        this.focusManager = new ListFocus(inputs);
        this.navigation = new ListNavigation({ ...inputs, focusManager: this.focusManager });
        this.selection = new ListSelection({
            ...inputs,
            multi: () => false,
            focusManager: this.focusManager,
        });
        this.expansionManager = new ListExpansion({
            ...inputs,
            multiExpandable: () => false,
            expandedIds: this.inputs.value,
            focusManager: this.focusManager,
        });
    }
    /** Handles keydown events for the tablist. */
    onKeydown(event) {
        if (!this.disabled()) {
            this.keydown().handle(event);
        }
    }
    /** The pointerdown event manager for the tablist. */
    onPointerdown(event) {
        if (!this.disabled()) {
            this.pointerdown().handle(event);
        }
    }
    /** Navigates to the first option in the tablist. */
    first(opts) {
        this.navigation.first();
        this._select(opts);
    }
    /** Navigates to the last option in the tablist. */
    last(opts) {
        this.navigation.last();
        this._select(opts);
    }
    /** Navigates to the next option in the tablist. */
    next(opts) {
        this.navigation.next();
        this._select(opts);
    }
    /** Navigates to the previous option in the tablist. */
    prev(opts) {
        this.navigation.prev();
        this._select(opts);
    }
    /** Navigates to the given item in the tablist. */
    goto(event, opts) {
        const item = this._getItem(event);
        if (item) {
            this.navigation.goto(item);
            this._select(opts);
        }
    }
    /** Handles updating selection for the tablist. */
    _select(opts) {
        if (opts?.select) {
            this.selection.selectOne();
            this.expansionManager.open();
        }
    }
    _getItem(e) {
        if (!(e.target instanceof HTMLElement)) {
            return;
        }
        const element = e.target.closest('[role="tab"]');
        return this.inputs.items().find(i => i.element() === element);
    }
}

export { TabListPattern as T, TabPattern as a, TabPanelPattern as b };
//# sourceMappingURL=tabs-CurTEFu8.mjs.map
