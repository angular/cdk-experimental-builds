import { computed } from '@angular/core';
import { K as KeyboardEventManager, P as PointerEventManager, L as ListFocus, a as ListNavigation } from './list-focus-BXQdAA3i.mjs';
import { L as ListSelection } from './list-selection-C41ApAbt.mjs';
import { E as ExpansionControl, L as ListExpansion } from './expansion-C9iQLHOG.mjs';

/** A tab in a tablist. */
class TabPattern {
    inputs;
    /** Controls expansion for this tab. */
    expansion;
    /** A global unique identifier for the tab. */
    id;
    /** A local unique identifier for the tab. */
    value;
    /** Whether the tab is disabled. */
    disabled;
    /** The html element that should receive focus. */
    element;
    /** Whether this tab has expandable content. */
    expandable = computed(() => this.expansion.expandable());
    /** The unique identifier used by the expansion behavior. */
    expansionId = computed(() => this.expansion.expansionId());
    /** Whether the tab is expanded. */
    expanded = computed(() => this.expansion.isExpanded());
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
        this.expansion = new ExpansionControl({
            ...inputs,
            expansionId: inputs.value,
            expandable: () => true,
            expansionManager: inputs.tablist().expansionManager,
        });
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
    /** The tabindex of this tabpanel. */
    tabindex = computed(() => (this.hidden() ? -1 : 0));
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
        });
    }
    /**
     * Sets the tablist to its default initial state.
     *
     * Sets the active index of the tablist to the first focusable selected
     * tab if one exists. Otherwise, sets focus to the first focusable tab.
     *
     * This method should be called once the tablist and its tabs are properly initialized.
     */
    setDefaultState() {
        let firstItemIndex;
        for (const [index, item] of this.inputs.items().entries()) {
            if (!this.focusManager.isFocusable(item))
                continue;
            if (firstItemIndex === undefined) {
                firstItemIndex = index;
            }
            if (item.selected()) {
                this.inputs.activeIndex.set(index);
                return;
            }
        }
        if (firstItemIndex !== undefined) {
            this.inputs.activeIndex.set(firstItemIndex);
        }
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
            this.expansionManager.open(this.focusManager.activeItem());
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
//# sourceMappingURL=tabs-YS9XXb7X.mjs.map
