import * as i0 from '@angular/core';
import { computed, signal, inject, ElementRef, input, booleanAttribute, model, afterRenderEffect, Directive } from '@angular/core';
import { _IdGenerator } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import * as i1 from '@angular/cdk-experimental/deferred-content';
import { DeferredContentAware, DeferredContent } from '@angular/cdk-experimental/deferred-content';
import { List } from './list.mjs';
import { ExpansionControl, ListExpansion } from './expansion.mjs';
import { Modifier, KeyboardEventManager, PointerEventManager } from './list-navigation.mjs';

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
            manager.on(this.dynamicSpaceKey, () => list.toggleOne());
            manager.on('Enter', () => list.toggleOne());
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
        if (!this.multi() && this.followFocus()) {
            return manager.on(e => this.goto(e, { selectOne: true }));
        }
        if (!this.multi() && !this.followFocus()) {
            return manager.on(e => this.goto(e, { toggle: true }));
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
    /** A reference to the tree element. */
    _elementRef = inject(ElementRef);
    /** All CdkTreeItem instances within this tree. */
    _unorderedItems = signal(new Set(), ...(ngDevMode ? [{ debugName: "_unorderedItems" }] : []));
    /** Orientation of the tree. */
    orientation = input('vertical', ...(ngDevMode ? [{ debugName: "orientation" }] : []));
    /** Whether multi-selection is allowed. */
    multi = input(false, ...(ngDevMode ? [{ debugName: "multi", transform: booleanAttribute }] : [{ transform: booleanAttribute }]));
    /** Whether the tree is disabled. */
    disabled = input(false, ...(ngDevMode ? [{ debugName: "disabled", transform: booleanAttribute }] : [{ transform: booleanAttribute }]));
    /** The selection strategy used by the tree. */
    selectionMode = input('explicit', ...(ngDevMode ? [{ debugName: "selectionMode" }] : []));
    /** The focus strategy used by the tree. */
    focusMode = input('roving', ...(ngDevMode ? [{ debugName: "focusMode" }] : []));
    /** Whether navigation wraps. */
    wrap = input(true, ...(ngDevMode ? [{ debugName: "wrap", transform: booleanAttribute }] : [{ transform: booleanAttribute }]));
    /** Whether to skip disabled items during navigation. */
    skipDisabled = input(true, ...(ngDevMode ? [{ debugName: "skipDisabled", transform: booleanAttribute }] : [{ transform: booleanAttribute }]));
    /** Typeahead delay. */
    typeaheadDelay = input(0.5, ...(ngDevMode ? [{ debugName: "typeaheadDelay" }] : []));
    /** Selected item values. */
    value = model([], ...(ngDevMode ? [{ debugName: "value" }] : []));
    /** Text direction. */
    textDirection = inject(Directionality).valueSignal;
    /** Whether the tree is in navigation mode. */
    nav = input(false, ...(ngDevMode ? [{ debugName: "nav" }] : []));
    /** The aria-current type. */
    currentType = input('page', ...(ngDevMode ? [{ debugName: "currentType" }] : []));
    /** The UI pattern for the tree. */
    pattern = new TreePattern({
        ...this,
        allItems: computed(() => [...this._unorderedItems()].sort(sortDirectives).map(item => item.pattern)),
        activeItem: signal(undefined),
        element: () => this._elementRef.nativeElement,
    });
    /** Whether the tree has received focus yet. */
    _hasFocused = signal(false, ...(ngDevMode ? [{ debugName: "_hasFocused" }] : []));
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
        this._unorderedItems().add(child);
        this._unorderedItems.set(new Set(this._unorderedItems()));
    }
    unregister(child) {
        this._unorderedItems().delete(child);
        this._unorderedItems.set(new Set(this._unorderedItems()));
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.2.0-next.2", ngImport: i0, type: CdkTree, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.1.0", version: "20.2.0-next.2", type: CdkTree, isStandalone: true, selector: "[cdkTree]", inputs: { orientation: { classPropertyName: "orientation", publicName: "orientation", isSignal: true, isRequired: false, transformFunction: null }, multi: { classPropertyName: "multi", publicName: "multi", isSignal: true, isRequired: false, transformFunction: null }, disabled: { classPropertyName: "disabled", publicName: "disabled", isSignal: true, isRequired: false, transformFunction: null }, selectionMode: { classPropertyName: "selectionMode", publicName: "selectionMode", isSignal: true, isRequired: false, transformFunction: null }, focusMode: { classPropertyName: "focusMode", publicName: "focusMode", isSignal: true, isRequired: false, transformFunction: null }, wrap: { classPropertyName: "wrap", publicName: "wrap", isSignal: true, isRequired: false, transformFunction: null }, skipDisabled: { classPropertyName: "skipDisabled", publicName: "skipDisabled", isSignal: true, isRequired: false, transformFunction: null }, typeaheadDelay: { classPropertyName: "typeaheadDelay", publicName: "typeaheadDelay", isSignal: true, isRequired: false, transformFunction: null }, value: { classPropertyName: "value", publicName: "value", isSignal: true, isRequired: false, transformFunction: null }, nav: { classPropertyName: "nav", publicName: "nav", isSignal: true, isRequired: false, transformFunction: null }, currentType: { classPropertyName: "currentType", publicName: "currentType", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { value: "valueChange" }, host: { attributes: { "role": "tree" }, listeners: { "keydown": "pattern.onKeydown($event)", "pointerdown": "pattern.onPointerdown($event)", "focusin": "onFocus()" }, properties: { "attr.aria-orientation": "pattern.orientation()", "attr.aria-multiselectable": "pattern.multi()", "attr.aria-disabled": "pattern.disabled()", "attr.aria-activedescendant": "pattern.activedescendant()", "tabindex": "pattern.tabindex()" }, classAttribute: "cdk-tree" }, exportAs: ["cdkTree"], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.2.0-next.2", ngImport: i0, type: CdkTree, decorators: [{
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
    /** The owned tree item group. */
    _group = signal(undefined, ...(ngDevMode ? [{ debugName: "_group" }] : []));
    /** The id of the owned group. */
    ownsId = computed(() => this._group()?.id, ...(ngDevMode ? [{ debugName: "ownsId" }] : []));
    /** The host native element. */
    element = computed(() => this._elementRef.nativeElement, ...(ngDevMode ? [{ debugName: "element" }] : []));
    /** The value of the tree item. */
    value = input.required(...(ngDevMode ? [{ debugName: "value" }] : []));
    /** The parent tree root or tree item group. */
    parent = input.required(...(ngDevMode ? [{ debugName: "parent" }] : []));
    /** Whether the tree item is disabled. */
    disabled = input(false, ...(ngDevMode ? [{ debugName: "disabled", transform: booleanAttribute }] : [{ transform: booleanAttribute }]));
    /** Optional label for typeahead. Defaults to the element's textContent. */
    label = input(...(ngDevMode ? [undefined, { debugName: "label" }] : []));
    /** Search term for typeahead. */
    searchTerm = computed(() => this.label() ?? this.element().textContent, ...(ngDevMode ? [{ debugName: "searchTerm" }] : []));
    /** The tree root. */
    tree = computed(() => {
        if (this.parent() instanceof CdkTree) {
            return this.parent();
        }
        return this.parent().ownedBy().tree();
    }, ...(ngDevMode ? [{ debugName: "tree" }] : []));
    /** The UI pattern for this item. */
    pattern;
    constructor() {
        // Updates the visibility of the owned group.
        afterRenderEffect(() => {
            this._group()?.visible.set(this.pattern.expanded());
        });
    }
    ngOnInit() {
        this.parent().register(this);
        this.tree().register(this);
        const treePattern = computed(() => this.tree().pattern, ...(ngDevMode ? [{ debugName: "treePattern" }] : []));
        const parentPattern = computed(() => {
            if (this.parent() instanceof CdkTree) {
                return treePattern();
            }
            return this.parent().ownedBy().pattern;
        }, ...(ngDevMode ? [{ debugName: "parentPattern" }] : []));
        this.pattern = new TreeItemPattern({
            ...this,
            id: () => this._id,
            tree: treePattern,
            parent: parentPattern,
            children: computed(() => this._group()
                ?.children()
                .map(item => item.pattern) ?? []),
            hasChildren: computed(() => !!this._group()),
        });
    }
    ngOnDestroy() {
        this.parent().unregister(this);
        this.tree().unregister(this);
    }
    register(group) {
        this._group.set(group);
    }
    unregister() {
        this._group.set(undefined);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.2.0-next.2", ngImport: i0, type: CdkTreeItem, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.1.0", version: "20.2.0-next.2", type: CdkTreeItem, isStandalone: true, selector: "[cdkTreeItem]", inputs: { value: { classPropertyName: "value", publicName: "value", isSignal: true, isRequired: true, transformFunction: null }, parent: { classPropertyName: "parent", publicName: "parent", isSignal: true, isRequired: true, transformFunction: null }, disabled: { classPropertyName: "disabled", publicName: "disabled", isSignal: true, isRequired: false, transformFunction: null }, label: { classPropertyName: "label", publicName: "label", isSignal: true, isRequired: false, transformFunction: null } }, host: { attributes: { "role": "treeitem" }, properties: { "class.cdk-active": "pattern.active()", "id": "pattern.id()", "attr.aria-expanded": "pattern.expandable() ? pattern.expanded() : null", "attr.aria-selected": "pattern.selected()", "attr.aria-current": "pattern.current()", "attr.aria-disabled": "pattern.disabled()", "attr.aria-level": "pattern.level()", "attr.aria-owns": "ownsId()", "attr.aria-setsize": "pattern.setsize()", "attr.aria-posinset": "pattern.posinset()", "attr.tabindex": "pattern.tabindex()", "attr.inert": "pattern.visible() ? null : true" }, classAttribute: "cdk-treeitem" }, exportAs: ["cdkTreeItem"], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.2.0-next.2", ngImport: i0, type: CdkTreeItem, decorators: [{
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
                        '[attr.aria-owns]': 'ownsId()',
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
    /** All groupable items that are descendants of the group. */
    _unorderedItems = signal(new Set(), ...(ngDevMode ? [{ debugName: "_unorderedItems" }] : []));
    /** The host native element. */
    element = computed(() => this._elementRef.nativeElement, ...(ngDevMode ? [{ debugName: "element" }] : []));
    /** Unique ID for the group. */
    id = inject(_IdGenerator).getId('cdk-tree-group-');
    /** Whether the group is visible. */
    visible = signal(true, ...(ngDevMode ? [{ debugName: "visible" }] : []));
    /** Child items within this group. */
    children = computed(() => [...this._unorderedItems()].sort(sortDirectives), ...(ngDevMode ? [{ debugName: "children" }] : []));
    /** Tree item that owns the group. */
    ownedBy = input.required(...(ngDevMode ? [{ debugName: "ownedBy" }] : []));
    constructor() {
        // Connect the group's hidden state to the DeferredContentAware's visibility.
        afterRenderEffect(() => {
            this._deferredContentAware.contentVisible.set(this.visible());
        });
    }
    ngOnInit() {
        this.ownedBy().register(this);
    }
    ngOnDestroy() {
        this.ownedBy().unregister();
    }
    register(child) {
        this._unorderedItems().add(child);
        this._unorderedItems.set(new Set(this._unorderedItems()));
    }
    unregister(child) {
        this._unorderedItems().delete(child);
        this._unorderedItems.set(new Set(this._unorderedItems()));
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.2.0-next.2", ngImport: i0, type: CdkTreeItemGroup, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.1.0", version: "20.2.0-next.2", type: CdkTreeItemGroup, isStandalone: true, selector: "[cdkTreeItemGroup]", inputs: { ownedBy: { classPropertyName: "ownedBy", publicName: "ownedBy", isSignal: true, isRequired: true, transformFunction: null } }, host: { attributes: { "role": "group" }, properties: { "id": "id", "attr.inert": "visible() ? null : true" }, classAttribute: "cdk-treeitem-group" }, exportAs: ["cdkTreeItemGroup"], hostDirectives: [{ directive: i1.DeferredContentAware, inputs: ["preserveContent", "preserveContent"] }], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.2.0-next.2", ngImport: i0, type: CdkTreeItemGroup, decorators: [{
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
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.2.0-next.2", ngImport: i0, type: CdkTreeItemGroupContent, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "20.2.0-next.2", type: CdkTreeItemGroupContent, isStandalone: true, selector: "ng-template[cdkTreeItemGroupContent]", hostDirectives: [{ directive: i1.DeferredContent }], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.2.0-next.2", ngImport: i0, type: CdkTreeItemGroupContent, decorators: [{
            type: Directive,
            args: [{
                    selector: 'ng-template[cdkTreeItemGroupContent]',
                    hostDirectives: [DeferredContent],
                }]
        }] });

export { CdkTree, CdkTreeItem, CdkTreeItemGroup, CdkTreeItemGroupContent };
//# sourceMappingURL=tree.mjs.map
