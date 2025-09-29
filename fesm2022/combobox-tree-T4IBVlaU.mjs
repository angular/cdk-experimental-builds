import { computed, signal } from '@angular/core';
import { List } from './list-QKHHM4uh.mjs';
import { ExpansionControl, ListExpansion } from './expansion-BRQMRoGR.mjs';
import { Modifier, KeyboardEventManager, PointerEventManager } from './pointer-event-manager-B6GE9jDm.mjs';

/**
 * Represents an item in a Tree.
 */
class TreeItemPattern {
    inputs;
    /** The position of this item among its siblings. */
    index = computed(() => this.tree().visibleItems().indexOf(this));
    /** The unique identifier used by the expansion behavior. */
    expansionId;
    /** Controls expansion for child items. */
    expansionManager;
    /** Controls expansion for this item. */
    expansion;
    /** Whether the item is expandable. It's expandable if children item exist. */
    expandable;
    /** The level of the current item in a tree. */
    level = computed(() => this.parent().level() + 1);
    /** Whether this item is currently expanded. */
    expanded = computed(() => this.expansion.isExpanded());
    /** Whether this item is visible. */
    visible = computed(() => this.parent().expanded());
    /** The number of items under the same parent at the same level. */
    setsize = computed(() => this.parent().children().length);
    /** The position of this item among its siblings (1-based). */
    posinset = computed(() => this.parent().children().indexOf(this) + 1);
    /** Whether the item is active. */
    active = computed(() => this.tree().activeItem() === this);
    /** The tabindex of the item. */
    tabindex = computed(() => this.tree().listBehavior.getItemTabindex(this));
    /** Whether the item is selected. */
    selected = computed(() => {
        if (this.tree().nav()) {
            return undefined;
        }
        return this.tree().value().includes(this.value());
    });
    /** The current type of this item. */
    current = computed(() => {
        if (!this.tree().nav()) {
            return undefined;
        }
        return this.tree().value().includes(this.value()) ? this.tree().currentType() : undefined;
    });
    constructor(inputs) {
        this.inputs = inputs;
        this.id = inputs.id;
        this.value = inputs.value;
        this.element = inputs.element;
        this.disabled = inputs.disabled;
        this.searchTerm = inputs.searchTerm;
        this.expansionId = inputs.id;
        this.tree = inputs.tree;
        this.parent = inputs.parent;
        this.children = inputs.children;
        this.expandable = inputs.hasChildren;
        this.expansion = new ExpansionControl({
            ...inputs,
            expandable: this.expandable,
            expansionId: this.expansionId,
            expansionManager: this.parent().expansionManager,
        });
        this.expansionManager = new ListExpansion({
            ...inputs,
            multiExpandable: () => true,
            // TODO(ok7sai): allow pre-expanded tree items.
            expandedIds: signal([]),
            items: this.children,
            disabled: computed(() => this.tree()?.disabled() ?? false),
        });
    }
}
/** Controls the state and interactions of a tree view. */
class TreePattern {
    inputs;
    /** The list behavior for the tree. */
    listBehavior;
    /** Controls expansion for direct children of the tree root (top-level items). */
    expansionManager;
    /** The root level is 0. */
    level = () => 0;
    /** The root is always expanded. */
    expanded = () => true;
    /** The tabindex of the tree. */
    tabindex = computed(() => this.listBehavior.tabindex());
    /** The id of the current active item. */
    activedescendant = computed(() => this.listBehavior.activedescendant());
    /** The direct children of the root (top-level tree items). */
    children = computed(() => this.inputs.allItems().filter(item => item.level() === this.level() + 1));
    /** All currently visible tree items. An item is visible if their parent is expanded. */
    visibleItems = computed(() => this.inputs.allItems().filter(item => item.visible()));
    /** Whether the tree selection follows focus. */
    followFocus = computed(() => this.inputs.selectionMode() === 'follow');
    /** The key for navigating to the previous item. */
    prevKey = computed(() => {
        if (this.inputs.orientation() === 'vertical') {
            return 'ArrowUp';
        }
        return this.inputs.textDirection() === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
    });
    /** The key for navigating to the next item. */
    nextKey = computed(() => {
        if (this.inputs.orientation() === 'vertical') {
            return 'ArrowDown';
        }
        return this.inputs.textDirection() === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
    });
    /** The key for collapsing an item or moving to its parent. */
    collapseKey = computed(() => {
        if (this.inputs.orientation() === 'horizontal') {
            return 'ArrowUp';
        }
        return this.inputs.textDirection() === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
    });
    /** The key for expanding an item or moving to its first child. */
    expandKey = computed(() => {
        if (this.inputs.orientation() === 'horizontal') {
            return 'ArrowDown';
        }
        return this.inputs.textDirection() === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
    });
    /** Represents the space key. Does nothing when the user is actively using typeahead. */
    dynamicSpaceKey = computed(() => (this.listBehavior.isTyping() ? '' : ' '));
    /** Regular expression to match characters for typeahead. */
    typeaheadRegexp = /^.$/;
    /** The keydown event manager for the tree. */
    keydown = computed(() => {
        const manager = new KeyboardEventManager();
        const list = this.listBehavior;
        manager
            .on(this.prevKey, () => list.prev({ selectOne: this.followFocus() }))
            .on(this.nextKey, () => list.next({ selectOne: this.followFocus() }))
            .on('Home', () => list.first({ selectOne: this.followFocus() }))
            .on('End', () => list.last({ selectOne: this.followFocus() }))
            .on(this.typeaheadRegexp, e => list.search(e.key, { selectOne: this.followFocus() }))
            .on(this.expandKey, () => this.expand({ selectOne: this.followFocus() }))
            .on(this.collapseKey, () => this.collapse({ selectOne: this.followFocus() }))
            .on(Modifier.Shift, '*', () => this.expandSiblings());
        if (this.inputs.multi()) {
            manager
                // TODO: Tracking the anchor by index can break if the
                // tree is expanded or collapsed causing the index to change.
                .on(Modifier.Any, 'Shift', () => list.anchor(this.listBehavior.activeIndex()))
                .on(Modifier.Shift, this.prevKey, () => list.prev({ selectRange: true }))
                .on(Modifier.Shift, this.nextKey, () => list.next({ selectRange: true }))
                .on([Modifier.Ctrl | Modifier.Shift, Modifier.Meta | Modifier.Shift], 'Home', () => list.first({ selectRange: true, anchor: false }))
                .on([Modifier.Ctrl | Modifier.Shift, Modifier.Meta | Modifier.Shift], 'End', () => list.last({ selectRange: true, anchor: false }))
                .on(Modifier.Shift, 'Enter', () => list.updateSelection({ selectRange: true, anchor: false }))
                .on(Modifier.Shift, this.dynamicSpaceKey, () => list.updateSelection({ selectRange: true, anchor: false }));
        }
        if (!this.followFocus() && this.inputs.multi()) {
            manager
                .on(this.dynamicSpaceKey, () => list.toggle())
                .on('Enter', () => list.toggle())
                .on([Modifier.Ctrl, Modifier.Meta], 'A', () => list.toggleAll());
        }
        if (!this.followFocus() && !this.inputs.multi()) {
            manager.on(this.dynamicSpaceKey, () => list.selectOne());
            manager.on('Enter', () => list.selectOne());
        }
        if (this.inputs.multi() && this.followFocus()) {
            manager
                .on([Modifier.Ctrl, Modifier.Meta], this.prevKey, () => list.prev())
                .on([Modifier.Ctrl, Modifier.Meta], this.nextKey, () => list.next())
                .on([Modifier.Ctrl, Modifier.Meta], this.expandKey, () => this.expand())
                .on([Modifier.Ctrl, Modifier.Meta], this.collapseKey, () => this.collapse())
                .on([Modifier.Ctrl, Modifier.Meta], ' ', () => list.toggle())
                .on([Modifier.Ctrl, Modifier.Meta], 'Enter', () => list.toggle())
                .on([Modifier.Ctrl, Modifier.Meta], 'Home', () => list.first())
                .on([Modifier.Ctrl, Modifier.Meta], 'End', () => list.last())
                .on([Modifier.Ctrl, Modifier.Meta], 'A', () => {
                list.toggleAll();
                list.select(); // Ensure the currect item remains selected.
            });
        }
        return manager;
    });
    /** The pointerdown event manager for the tree. */
    pointerdown = computed(() => {
        const manager = new PointerEventManager();
        if (this.multi()) {
            manager.on(Modifier.Shift, e => this.goto(e, { selectRange: true }));
        }
        if (!this.multi()) {
            return manager.on(e => this.goto(e, { selectOne: true }));
        }
        if (this.multi() && this.followFocus()) {
            return manager
                .on(e => this.goto(e, { selectOne: true }))
                .on(Modifier.Ctrl, e => this.goto(e, { toggle: true }));
        }
        if (this.multi() && !this.followFocus()) {
            return manager.on(e => this.goto(e, { toggle: true }));
        }
        return manager;
    });
    constructor(inputs) {
        this.inputs = inputs;
        this.id = inputs.id;
        this.nav = inputs.nav;
        this.currentType = inputs.currentType;
        this.allItems = inputs.allItems;
        this.focusMode = inputs.focusMode;
        this.disabled = inputs.disabled;
        this.activeItem = inputs.activeItem;
        this.skipDisabled = inputs.skipDisabled;
        this.wrap = inputs.wrap;
        this.orientation = inputs.orientation;
        this.textDirection = inputs.textDirection;
        this.multi = computed(() => (this.nav() ? false : this.inputs.multi()));
        this.selectionMode = inputs.selectionMode;
        this.typeaheadDelay = inputs.typeaheadDelay;
        this.value = inputs.value;
        this.listBehavior = new List({
            ...inputs,
            items: this.visibleItems,
            multi: this.multi,
        });
        this.expansionManager = new ListExpansion({
            multiExpandable: () => true,
            // TODO(ok7sai): allow pre-expanded tree items.
            expandedIds: signal([]),
            items: this.children,
            disabled: this.disabled,
        });
    }
    /**
     * Sets the tree to it's default initial state.
     *
     * Sets the active index of the tree to the first focusable selected tree item if one exists.
     * Otherwise, sets focus to the first focusable tree item.
     */
    setDefaultState() {
        let firstItem;
        for (const item of this.allItems()) {
            if (!item.visible())
                continue;
            if (!this.listBehavior.isFocusable(item))
                continue;
            if (firstItem === undefined) {
                firstItem = item;
            }
            if (item.selected()) {
                this.activeItem.set(item);
                return;
            }
        }
        if (firstItem !== undefined) {
            this.activeItem.set(firstItem);
        }
    }
    /** Handles keydown events on the tree. */
    onKeydown(event) {
        if (!this.disabled()) {
            this.keydown().handle(event);
        }
    }
    /** Handles pointerdown events on the tree. */
    onPointerdown(event) {
        if (!this.disabled()) {
            this.pointerdown().handle(event);
        }
    }
    /** Navigates to the given tree item in the tree. */
    goto(e, opts) {
        const item = this._getItem(e);
        if (!item)
            return;
        this.listBehavior.goto(item, opts);
        this.toggleExpansion(item);
    }
    /** Toggles to expand or collapse a tree item. */
    toggleExpansion(item) {
        item ??= this.activeItem();
        if (!item || !this.listBehavior.isFocusable(item))
            return;
        if (!item.expandable())
            return;
        if (item.expanded()) {
            this.collapse();
        }
        else {
            item.expansion.open();
        }
    }
    /** Expands a tree item. */
    expand(opts) {
        const item = this.activeItem();
        if (!item || !this.listBehavior.isFocusable(item))
            return;
        if (item.expandable() && !item.expanded()) {
            item.expansion.open();
        }
        else if (item.expanded() &&
            item.children().some(item => this.listBehavior.isFocusable(item))) {
            this.listBehavior.next(opts);
        }
    }
    /** Expands all sibling tree items including itself. */
    expandSiblings(item) {
        item ??= this.activeItem();
        const siblings = item?.parent()?.children();
        siblings?.forEach(item => item.expansion.open());
    }
    /** Collapses a tree item. */
    collapse(opts) {
        const item = this.activeItem();
        if (!item || !this.listBehavior.isFocusable(item))
            return;
        if (item.expandable() && item.expanded()) {
            item.expansion.close();
        }
        else if (item.parent() && item.parent() !== this) {
            const parentItem = item.parent();
            if (parentItem instanceof TreeItemPattern && this.listBehavior.isFocusable(parentItem)) {
                this.listBehavior.goto(parentItem, opts);
            }
        }
    }
    /** Retrieves the TreeItemPattern associated with a DOM event, if any. */
    _getItem(event) {
        if (!(event.target instanceof HTMLElement)) {
            return;
        }
        const element = event.target.closest('[role="treeitem"]');
        return this.inputs.allItems().find(i => i.element() === element);
    }
}

class ComboboxTreePattern extends TreePattern {
    inputs;
    /** Whether the currently focused item is collapsible. */
    isItemCollapsible = () => this.activeItem()?.parent() instanceof TreeItemPattern;
    /** The ARIA role for the tree. */
    role = () => 'tree';
    /* The id of the active (focused) item in the tree. */
    activeId = computed(() => this.listBehavior.activedescendant());
    /** The list of items in the tree. */
    items = computed(() => this.inputs.allItems());
    /** The tabindex for the tree. Always -1 because the combobox handles focus. */
    tabindex = () => -1;
    constructor(inputs) {
        if (inputs.combobox()) {
            inputs.multi = () => false;
            inputs.focusMode = () => 'activedescendant';
            inputs.element = inputs.combobox().inputs.inputEl;
        }
        super(inputs);
        this.inputs = inputs;
    }
    /** Noop. The combobox handles keydown events. */
    onKeydown(_) { }
    /** Noop. The combobox handles pointerdown events. */
    onPointerdown(_) { }
    /** Noop. The combobox controls the open state. */
    setDefaultState() { }
    /** Navigates to the specified item in the tree. */
    focus = (item) => this.listBehavior.goto(item);
    /** Navigates to the next focusable item in the tree. */
    next = () => this.listBehavior.next();
    /** Navigates to the previous focusable item in the tree. */
    prev = () => this.listBehavior.prev();
    /** Navigates to the last focusable item in the tree. */
    last = () => this.listBehavior.last();
    /** Navigates to the first focusable item in the tree. */
    first = () => this.listBehavior.first();
    /** Unfocuses the currently focused item in the tree. */
    unfocus = () => this.listBehavior.unfocus();
    /** Selects the specified item in the tree or the current active item if not provided. */
    select = (item) => this.listBehavior.select(item);
    /** Clears the selection in the tree. */
    clearSelection = () => this.listBehavior.deselectAll();
    /** Retrieves the TreeItemPattern associated with a pointer event. */
    getItem = (e) => this._getItem(e);
    /** Retrieves the currently selected item in the tree */
    getSelectedItem = () => this.inputs.allItems().find(i => i.selected());
    /** Sets the value of the combobox tree. */
    setValue = (value) => this.inputs.value.set(value ? [value] : []);
    /** Expands the currently focused item if it is expandable. */
    expandItem = () => this.expand();
    /** Collapses the currently focused item if it is expandable. */
    collapseItem = () => this.collapse();
    /** Whether the specified item or the currently active item is expandable. */
    isItemExpandable(item = this.activeItem()) {
        return item ? item.expandable() : false;
    }
    /** Expands all of the tree items. */
    expandAll = () => this.items().forEach(item => item.expansion.open());
    /** Collapses all of the tree items. */
    collapseAll = () => this.items().forEach(item => item.expansion.close());
}

export { ComboboxTreePattern, TreeItemPattern, TreePattern };
//# sourceMappingURL=combobox-tree-T4IBVlaU.mjs.map
