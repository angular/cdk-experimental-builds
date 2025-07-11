import * as i0 from '@angular/core';
import { computed, signal, input, booleanAttribute, model, inject, afterRenderEffect, Directive, ElementRef } from '@angular/core';
import { _IdGenerator } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import * as i1 from '@angular/cdk-experimental/deferred-content';
import { DeferredContentAware, DeferredContent } from '@angular/cdk-experimental/deferred-content';
import { M as ModifierKey, L as ListFocus, a as ListNavigation, K as KeyboardEventManager, P as PointerEventManager } from './list-focus-BXQdAA3i.mjs';
import { L as ListSelection } from './list-selection-C41ApAbt.mjs';
import { L as ListTypeahead } from './list-typeahead-DIIbNJrP.mjs';
import { E as ExpansionControl, L as ListExpansion } from './expansion-C9iQLHOG.mjs';

/**
 * Represents an item in a Tree.
 */
class TreeItemPattern {
    inputs;
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
    active = computed(() => this.tree().focusManager.activeItem() === this);
    /** The tabindex of the item. */
    tabindex = computed(() => this.tree().focusManager.getItemTabindex(this));
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
    /** Controls focus for the all visible tree items. */
    focusManager;
    /** Controls navigation for all visible tree items. */
    navigationManager;
    /** Controls selection for all visible tree items. */
    selectionManager;
    /** Controls typeahead for all visible tree items. */
    typeaheadManager;
    /** Controls expansion for direct children of the tree root (top-level items). */
    expansionManager;
    /** The root level is 0. */
    level = () => 0;
    /** The root is always expanded. */
    expanded = () => true;
    /** The tabindex of the tree. */
    tabindex = computed(() => this.focusManager.getListTabindex());
    /** The id of the current active item. */
    activedescendant = computed(() => this.focusManager.getActiveDescendant());
    /** Whether the tree is performing a range selection. */
    inSelection = signal(false);
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
    dynamicSpaceKey = computed(() => (this.typeaheadManager.isTyping() ? '' : ' '));
    /** Regular expression to match characters for typeahead. */
    typeaheadRegexp = /^.$/;
    /** Uncommitted tree item for selecting a range of tree items. */
    anchorItem = signal(undefined);
    /**
     * Uncommitted tree item index for selecting a range of tree items.
     *
     * The index is computed in case the tree item position is changed caused by tree expansions.
     */
    anchorIndex = computed(() => this.anchorItem() ? this.visibleItems().indexOf(this.anchorItem()) : -1);
    /** The keydown event manager for the tree. */
    keydown = computed(() => {
        const manager = new KeyboardEventManager();
        if (!this.followFocus()) {
            manager
                .on(this.prevKey, () => this.prev())
                .on(this.nextKey, () => this.next())
                .on('Home', () => this.first())
                .on('End', () => this.last())
                .on(this.typeaheadRegexp, e => this.search(e.key));
        }
        if (this.followFocus()) {
            manager
                .on(this.prevKey, () => this.prev({ selectOne: true }))
                .on(this.nextKey, () => this.next({ selectOne: true }))
                .on('Home', () => this.first({ selectOne: true }))
                .on('End', () => this.last({ selectOne: true }))
                .on(this.typeaheadRegexp, e => this.search(e.key, { selectOne: true }));
        }
        if (this.inputs.multi()) {
            manager
                .on(ModifierKey.Any, 'Shift', () => this.anchorItem.set(this.focusManager.activeItem()))
                .on(ModifierKey.Shift, this.prevKey, () => this.prev({ selectRange: true }))
                .on(ModifierKey.Shift, this.nextKey, () => this.next({ selectRange: true }))
                .on([ModifierKey.Ctrl | ModifierKey.Shift, ModifierKey.Meta | ModifierKey.Shift], 'Home', () => this.first({ selectRange: true, anchor: false }))
                .on([ModifierKey.Ctrl | ModifierKey.Shift, ModifierKey.Meta | ModifierKey.Shift], 'End', () => this.last({ selectRange: true, anchor: false }))
                .on(ModifierKey.Shift, 'Enter', () => this._updateSelection({ selectRange: true, anchor: false }))
                .on(ModifierKey.Shift, this.dynamicSpaceKey, () => this._updateSelection({ selectRange: true, anchor: false }));
        }
        if (!this.followFocus() && this.inputs.multi()) {
            manager
                .on(this.dynamicSpaceKey, () => this.selectionManager.toggle())
                .on('Enter', () => this.selectionManager.toggle())
                .on([ModifierKey.Ctrl, ModifierKey.Meta], 'A', () => this.selectionManager.toggleAll());
        }
        if (!this.followFocus() && !this.inputs.multi()) {
            manager.on(this.dynamicSpaceKey, () => this.selectionManager.toggleOne());
            manager.on('Enter', () => this.selectionManager.toggleOne());
        }
        if (this.inputs.multi() && this.followFocus()) {
            manager
                .on([ModifierKey.Ctrl, ModifierKey.Meta], this.prevKey, () => this.prev())
                .on([ModifierKey.Ctrl, ModifierKey.Meta], this.nextKey, () => this.next())
                .on([ModifierKey.Ctrl, ModifierKey.Meta], ' ', () => this.selectionManager.toggle())
                .on([ModifierKey.Ctrl, ModifierKey.Meta], 'Enter', () => this.selectionManager.toggle())
                .on([ModifierKey.Ctrl, ModifierKey.Meta], 'Home', () => this.first())
                .on([ModifierKey.Ctrl, ModifierKey.Meta], 'End', () => this.last())
                .on([ModifierKey.Ctrl, ModifierKey.Meta], 'A', () => {
                this.selectionManager.toggleAll();
                this.selectionManager.select(); // Ensure the currect item remains selected.
            });
        }
        manager
            .on(this.expandKey, () => this.expand())
            .on(this.collapseKey, () => this.collapse())
            .on(ModifierKey.Shift, '*', () => this.expandSiblings());
        return manager;
    });
    /** The pointerdown event manager for the tree. */
    pointerdown = computed(() => {
        const manager = new PointerEventManager();
        if (this.multi()) {
            manager.on(ModifierKey.Shift, e => this.goto(e, { selectRange: true }));
        }
        if (!this.multi() && this.followFocus()) {
            return manager.on(e => this.goto(e, { selectOne: true }));
        }
        if (!this.multi() && !this.followFocus()) {
            return manager.on(e => this.goto(e, { toggle: true }));
        }
        if (this.multi() && this.followFocus()) {
            return manager
                .on(e => this.goto(e, { selectOne: true }))
                .on(ModifierKey.Ctrl, e => this.goto(e, { toggle: true }));
        }
        if (this.multi() && !this.followFocus()) {
            return manager.on(e => this.goto(e, { toggle: true }));
        }
        return manager;
    });
    constructor(inputs) {
        this.inputs = inputs;
        this.nav = inputs.nav;
        this.currentType = inputs.currentType;
        this.allItems = inputs.allItems;
        this.focusMode = inputs.focusMode;
        this.disabled = inputs.disabled;
        this.activeIndex = inputs.activeIndex;
        this.skipDisabled = inputs.skipDisabled;
        this.wrap = inputs.wrap;
        this.orientation = inputs.orientation;
        this.textDirection = inputs.textDirection;
        this.multi = computed(() => (this.nav() ? false : this.inputs.multi()));
        this.value = inputs.value;
        this.selectionMode = inputs.selectionMode;
        this.typeaheadDelay = inputs.typeaheadDelay;
        this.focusManager = new ListFocus({
            ...inputs,
            items: this.visibleItems,
        });
        this.navigationManager = new ListNavigation({
            ...inputs,
            wrap: computed(() => this.inputs.wrap() && !this.inSelection()),
            items: this.visibleItems,
            focusManager: this.focusManager,
        });
        this.selectionManager = new ListSelection({
            ...inputs,
            items: this.visibleItems,
            focusManager: this.focusManager,
        });
        this.typeaheadManager = new ListTypeahead({
            ...inputs,
            items: this.visibleItems,
            focusManager: this.focusManager,
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
        let firstItemIndex;
        for (const [index, item] of this.allItems().entries()) {
            if (!item.visible())
                continue;
            if (!this.focusManager.isFocusable(item))
                continue;
            if (firstItemIndex === undefined) {
                firstItemIndex = index;
            }
            if (item.selected()) {
                this.activeIndex.set(index);
                return;
            }
        }
        if (firstItemIndex !== undefined) {
            this.activeIndex.set(firstItemIndex);
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
    /** Navigates to the first visible tree item in the tree. */
    first(opts) {
        this._navigate(opts, () => this.navigationManager.first());
    }
    /** Navigates to the last visible tree item in the tree. */
    last(opts) {
        this._navigate(opts, () => this.navigationManager.last());
    }
    /** Navigates to the next visible tree item in the tree. */
    next(opts) {
        this._navigate(opts, () => this.navigationManager.next());
    }
    /** Navigates to the previous visible tree item in the tree. */
    prev(opts) {
        this._navigate(opts, () => this.navigationManager.prev());
    }
    /** Navigates to the given tree item in the tree. */
    goto(event, opts) {
        const item = this._getItem(event);
        this._navigate(opts, () => this.navigationManager.goto(item));
        this.toggleExpansion(item);
    }
    /** Handles typeahead search navigation for the tree. */
    search(char, opts) {
        this._navigate(opts, () => this.typeaheadManager.search(char));
    }
    /** Toggles to expand or collapse a tree item. */
    toggleExpansion(item) {
        item ??= this.focusManager.activeItem();
        if (!item || !this.focusManager.isFocusable(item))
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
    expand(item) {
        item ??= this.focusManager.activeItem();
        if (!item || !this.focusManager.isFocusable(item))
            return;
        if (item.expandable() && !item.expanded()) {
            item.expansion.open();
        }
        else if (item.expanded() && item.children().length > 0) {
            const firstChild = item.children()[0];
            if (this.focusManager.isFocusable(firstChild)) {
                this.navigationManager.goto(firstChild);
            }
        }
    }
    /** Expands all sibling tree items including itself. */
    expandSiblings(item) {
        item ??= this.focusManager.activeItem();
        const siblings = item.parent()?.children();
        siblings?.forEach(item => this.expand(item));
    }
    /** Collapses a tree item. */
    collapse(item) {
        item ??= this.focusManager.activeItem();
        if (!item || !this.focusManager.isFocusable(item))
            return;
        if (item.expandable() && item.expanded()) {
            item.expansion.close();
        }
        else if (item.parent() && item.parent() !== this) {
            const parentItem = item.parent();
            if (parentItem instanceof TreeItemPattern && this.focusManager.isFocusable(parentItem)) {
                this.navigationManager.goto(parentItem);
            }
        }
    }
    /** Safely performs a navigation operation. */
    _navigate(opts = {}, operation) {
        if (opts?.selectRange) {
            this.inSelection.set(true);
            this.selectionManager.rangeStartIndex.set(this.anchorIndex());
        }
        const moved = operation();
        if (moved) {
            this._updateSelection(opts);
        }
        this.inSelection.set(false);
    }
    /** Handles updating selection for the tree. */
    _updateSelection(opts = { anchor: true }) {
        if (opts.toggle) {
            this.selectionManager.toggle();
        }
        if (opts.selectOne) {
            this.selectionManager.selectOne();
        }
        if (opts.selectRange) {
            this.selectionManager.selectRange();
        }
        if (!opts.anchor) {
            this.anchorItem.set(this.visibleItems()[this.selectionManager.rangeStartIndex()]);
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

/**
 * Sort directives by their document order.
 */
function sortDirectives(a, b) {
    return (a.element().compareDocumentPosition(b.element()) & Node.DOCUMENT_POSITION_PRECEDING) > 0
        ? 1
        : -1;
}
/**
 * A Tree container.
 *
 * Transforms nested lists into an accessible, ARIA-compliant tree structure.
 *
 * ```html
 * <ul cdkTree [(value)]="selectedItems" [multi]="true">
 *   <li cdkTreeItem [value]="'leaf1'">Leaf Item 1</li>
 *   <li cdkTreeItem [value]="'parent1'">
 *     Parent Item 1
 *     <ul cdkTreeItemGroup [value]="'parent1'">
 *       <ng-template cdkTreeItemGroupContent>
 *         <li cdkTreeItem [value]="'child1.1'">Child Item 1.1</li>
 *         <li cdkTreeItem [value]="'child1.2'">Child Item 1.2</li>
 *       </ng-template>
 *     </ul>
 *   </li>
 *   <li cdkTreeItem [value]="'leaf2'" [disabled]="true">Disabled Leaf Item 2</li>
 * </ul>
 * ```
 */
class CdkTree {
    /** All CdkTreeItem instances within this tree. */
    _unorderedItems = signal(new Set());
    /** All CdkGroup instances within this tree. */
    unorderedGroups = signal(new Set());
    /** Orientation of the tree. */
    orientation = input('vertical');
    /** Whether multi-selection is allowed. */
    multi = input(false, { transform: booleanAttribute });
    /** Whether the tree is disabled. */
    disabled = input(false, { transform: booleanAttribute });
    /** The selection strategy used by the tree. */
    selectionMode = input('explicit');
    /** The focus strategy used by the tree. */
    focusMode = input('roving');
    /** Whether navigation wraps. */
    wrap = input(true, { transform: booleanAttribute });
    /** Whether to skip disabled items during navigation. */
    skipDisabled = input(true, { transform: booleanAttribute });
    /** Typeahead delay. */
    typeaheadDelay = input(0.5);
    /** Selected item values. */
    value = model([]);
    /** Text direction. */
    textDirection = inject(Directionality).valueSignal;
    /** Whether the tree is in navigation mode. */
    nav = input(false);
    /** The aria-current type. */
    currentType = input('page');
    /** The UI pattern for the tree. */
    pattern = new TreePattern({
        ...this,
        allItems: computed(() => [...this._unorderedItems()].sort(sortDirectives).map(item => item.pattern)),
        activeIndex: signal(0),
    });
    /** Whether the tree has received focus yet. */
    _hasFocused = signal(false);
    constructor() {
        afterRenderEffect(() => {
            if (!this._hasFocused()) {
                this.pattern.setDefaultState();
            }
        });
    }
    onFocus() {
        this._hasFocused.set(true);
    }
    register(child) {
        if (child instanceof CdkTreeItemGroup) {
            this.unorderedGroups().add(child);
            this.unorderedGroups.set(new Set(this.unorderedGroups()));
        }
        if (child instanceof CdkTreeItem) {
            this._unorderedItems().add(child);
            this._unorderedItems.set(new Set(this._unorderedItems()));
        }
    }
    deregister(child) {
        if (child instanceof CdkTreeItemGroup) {
            this.unorderedGroups().delete(child);
            this.unorderedGroups.set(new Set(this.unorderedGroups()));
        }
        if (child instanceof CdkTreeItem) {
            this._unorderedItems().delete(child);
            this._unorderedItems.set(new Set(this._unorderedItems()));
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: CdkTree, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.1.0", version: "20.0.0", type: CdkTree, isStandalone: true, selector: "[cdkTree]", inputs: { orientation: { classPropertyName: "orientation", publicName: "orientation", isSignal: true, isRequired: false, transformFunction: null }, multi: { classPropertyName: "multi", publicName: "multi", isSignal: true, isRequired: false, transformFunction: null }, disabled: { classPropertyName: "disabled", publicName: "disabled", isSignal: true, isRequired: false, transformFunction: null }, selectionMode: { classPropertyName: "selectionMode", publicName: "selectionMode", isSignal: true, isRequired: false, transformFunction: null }, focusMode: { classPropertyName: "focusMode", publicName: "focusMode", isSignal: true, isRequired: false, transformFunction: null }, wrap: { classPropertyName: "wrap", publicName: "wrap", isSignal: true, isRequired: false, transformFunction: null }, skipDisabled: { classPropertyName: "skipDisabled", publicName: "skipDisabled", isSignal: true, isRequired: false, transformFunction: null }, typeaheadDelay: { classPropertyName: "typeaheadDelay", publicName: "typeaheadDelay", isSignal: true, isRequired: false, transformFunction: null }, value: { classPropertyName: "value", publicName: "value", isSignal: true, isRequired: false, transformFunction: null }, nav: { classPropertyName: "nav", publicName: "nav", isSignal: true, isRequired: false, transformFunction: null }, currentType: { classPropertyName: "currentType", publicName: "currentType", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { value: "valueChange" }, host: { attributes: { "role": "tree" }, listeners: { "keydown": "pattern.onKeydown($event)", "pointerdown": "pattern.onPointerdown($event)", "focusin": "onFocus()" }, properties: { "attr.aria-orientation": "pattern.orientation()", "attr.aria-multiselectable": "pattern.multi()", "attr.aria-disabled": "pattern.disabled()", "attr.aria-activedescendant": "pattern.activedescendant()", "tabindex": "pattern.tabindex()" }, classAttribute: "cdk-tree" }, exportAs: ["cdkTree"], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: CdkTree, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkTree]',
                    exportAs: 'cdkTree',
                    host: {
                        'class': 'cdk-tree',
                        'role': 'tree',
                        '[attr.aria-orientation]': 'pattern.orientation()',
                        '[attr.aria-multiselectable]': 'pattern.multi()',
                        '[attr.aria-disabled]': 'pattern.disabled()',
                        '[attr.aria-activedescendant]': 'pattern.activedescendant()',
                        '[tabindex]': 'pattern.tabindex()',
                        '(keydown)': 'pattern.onKeydown($event)',
                        '(pointerdown)': 'pattern.onPointerdown($event)',
                        '(focusin)': 'onFocus()',
                    },
                }]
        }], ctorParameters: () => [] });
/**
 * A selectable and expandable Tree Item in a Tree.
 */
class CdkTreeItem {
    /** A reference to the tree item element. */
    _elementRef = inject(ElementRef);
    /** A unique identifier for the tree item. */
    _id = inject(_IdGenerator).getId('cdk-tree-item-');
    /** The top level CdkTree. */
    _tree = inject((CdkTree));
    /** The parent CdkTreeItem. */
    _treeItem = inject((CdkTreeItem), { optional: true, skipSelf: true });
    /** The parent CdkGroup, if any. */
    _parentGroup = inject((CdkTreeItemGroup), { optional: true });
    /** The top level TreePattern. */
    _treePattern = computed(() => this._tree.pattern);
    /** The parent TreeItemPattern. */
    _parentPattern = computed(() => this._treeItem?.pattern ?? this._treePattern());
    /** The host native element. */
    element = computed(() => this._elementRef.nativeElement);
    /** The value of the tree item. */
    value = input.required();
    /** Whether the tree item is disabled. */
    disabled = input(false, { transform: booleanAttribute });
    /** Optional label for typeahead. Defaults to the element's textContent. */
    label = input();
    /** Search term for typeahead. */
    searchTerm = computed(() => this.label() ?? this.element().textContent);
    /** Manual group assignment. */
    group = signal(undefined);
    /** The UI pattern for this item. */
    pattern = new TreeItemPattern({
        ...this,
        id: () => this._id,
        tree: this._treePattern,
        parent: this._parentPattern,
        children: computed(() => this.group()
            ?.children()
            .map(item => item.pattern) ?? []),
        hasChildren: computed(() => !!this.group()),
    });
    constructor() {
        afterRenderEffect(() => {
            const group = [...this._tree.unorderedGroups()].find(group => group.value() === this.value());
            if (group) {
                this.group.set(group);
            }
        });
        // Updates the visibility of the owned group.
        afterRenderEffect(() => {
            this.group()?.visible.set(this.pattern.expanded());
        });
    }
    ngOnInit() {
        this._tree.register(this);
        this._parentGroup?.register(this);
    }
    ngOnDestroy() {
        this._tree.deregister(this);
        this._parentGroup?.deregister(this);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: CdkTreeItem, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.1.0", version: "20.0.0", type: CdkTreeItem, isStandalone: true, selector: "[cdkTreeItem]", inputs: { value: { classPropertyName: "value", publicName: "value", isSignal: true, isRequired: true, transformFunction: null }, disabled: { classPropertyName: "disabled", publicName: "disabled", isSignal: true, isRequired: false, transformFunction: null }, label: { classPropertyName: "label", publicName: "label", isSignal: true, isRequired: false, transformFunction: null } }, host: { attributes: { "role": "treeitem" }, properties: { "class.cdk-active": "pattern.active()", "id": "pattern.id()", "attr.aria-expanded": "pattern.expandable() ? pattern.expanded() : null", "attr.aria-selected": "pattern.selected()", "attr.aria-current": "pattern.current()", "attr.aria-disabled": "pattern.disabled()", "attr.aria-level": "pattern.level()", "attr.aria-owns": "group()?.id", "attr.aria-setsize": "pattern.setsize()", "attr.aria-posinset": "pattern.posinset()", "attr.tabindex": "pattern.tabindex()", "attr.inert": "pattern.visible() ? null : true" }, classAttribute: "cdk-treeitem" }, exportAs: ["cdkTreeItem"], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: CdkTreeItem, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkTreeItem]',
                    exportAs: 'cdkTreeItem',
                    host: {
                        'class': 'cdk-treeitem',
                        '[class.cdk-active]': 'pattern.active()',
                        'role': 'treeitem',
                        '[id]': 'pattern.id()',
                        '[attr.aria-expanded]': 'pattern.expandable() ? pattern.expanded() : null',
                        '[attr.aria-selected]': 'pattern.selected()',
                        '[attr.aria-current]': 'pattern.current()',
                        '[attr.aria-disabled]': 'pattern.disabled()',
                        '[attr.aria-level]': 'pattern.level()',
                        '[attr.aria-owns]': 'group()?.id',
                        '[attr.aria-setsize]': 'pattern.setsize()',
                        '[attr.aria-posinset]': 'pattern.posinset()',
                        '[attr.tabindex]': 'pattern.tabindex()',
                        '[attr.inert]': 'pattern.visible() ? null : true',
                    },
                }]
        }], ctorParameters: () => [] });
/**
 * Container that designates content as a group.
 */
class CdkTreeItemGroup {
    /** A reference to the group element. */
    _elementRef = inject(ElementRef);
    /** The DeferredContentAware host directive. */
    _deferredContentAware = inject(DeferredContentAware);
    /** The top level CdkTree. */
    _tree = inject((CdkTree));
    /** All groupable items that are descendants of the group. */
    _unorderedItems = signal(new Set());
    /** The host native element. */
    element = computed(() => this._elementRef.nativeElement);
    /** Unique ID for the group. */
    id = inject(_IdGenerator).getId('cdk-tree-group-');
    /** Whether the group is visible. */
    visible = signal(true);
    /** Child items within this group. */
    children = computed(() => [...this._unorderedItems()].sort(sortDirectives));
    /** Identifier for matching the group owner. */
    value = input.required();
    constructor() {
        // Connect the group's hidden state to the DeferredContentAware's visibility.
        afterRenderEffect(() => {
            this._deferredContentAware.contentVisible.set(this.visible());
        });
    }
    ngOnInit() {
        this._tree.register(this);
    }
    ngOnDestroy() {
        this._tree.deregister(this);
    }
    register(child) {
        this._unorderedItems().add(child);
        this._unorderedItems.set(new Set(this._unorderedItems()));
    }
    deregister(child) {
        this._unorderedItems().delete(child);
        this._unorderedItems.set(new Set(this._unorderedItems()));
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: CdkTreeItemGroup, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.1.0", version: "20.0.0", type: CdkTreeItemGroup, isStandalone: true, selector: "[cdkTreeItemGroup]", inputs: { value: { classPropertyName: "value", publicName: "value", isSignal: true, isRequired: true, transformFunction: null } }, host: { attributes: { "role": "group" }, properties: { "id": "id", "attr.inert": "visible() ? null : true" }, classAttribute: "cdk-treeitem-group" }, exportAs: ["cdkTreeItemGroup"], hostDirectives: [{ directive: i1.DeferredContentAware, inputs: ["preserveContent", "preserveContent"] }], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: CdkTreeItemGroup, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkTreeItemGroup]',
                    exportAs: 'cdkTreeItemGroup',
                    hostDirectives: [
                        {
                            directive: DeferredContentAware,
                            inputs: ['preserveContent'],
                        },
                    ],
                    host: {
                        'class': 'cdk-treeitem-group',
                        'role': 'group',
                        '[id]': 'id',
                        '[attr.inert]': 'visible() ? null : true',
                    },
                }]
        }], ctorParameters: () => [] });
/**
 * A structural directive that marks the `ng-template` to be used as the content
 * for a `CdkTreeItemGroup`. This content can be lazily loaded.
 */
class CdkTreeItemGroupContent {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: CdkTreeItemGroupContent, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "20.0.0", type: CdkTreeItemGroupContent, isStandalone: true, selector: "ng-template[cdkTreeItemGroupContent]", hostDirectives: [{ directive: i1.DeferredContent }], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: CdkTreeItemGroupContent, decorators: [{
            type: Directive,
            args: [{
                    selector: 'ng-template[cdkTreeItemGroupContent]',
                    hostDirectives: [DeferredContent],
                }]
        }] });

export { CdkTree, CdkTreeItem, CdkTreeItemGroup, CdkTreeItemGroupContent };
//# sourceMappingURL=tree.mjs.map
