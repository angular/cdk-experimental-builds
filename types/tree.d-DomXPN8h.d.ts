import * as _angular_core from '@angular/core';
import { SignalLike } from './list-navigation.d-v7LRaIQt.js';
import { ListItem, ListInputs, List } from './list.d-CgeCwpQa.js';
import { ExpansionItem, ListExpansion, ExpansionControl } from './expansion.d-Bk5hojv9.js';
import { KeyboardEventManager, PointerEventManager } from './pointer-event-manager.d-DxLZK1bd.js';

/** Represents the required inputs for a tree item. */
interface TreeItemInputs<V> extends Omit<ListItem<V>, 'index'> {
    /** The parent item. */
    parent: SignalLike<TreeItemPattern<V> | TreePattern<V>>;
    /** Whether this item has children. Children can be lazily loaded. */
    hasChildren: SignalLike<boolean>;
    /** The children items. */
    children: SignalLike<TreeItemPattern<V>[]>;
    /** The tree pattern this item belongs to. */
    tree: SignalLike<TreePattern<V>>;
}
interface TreeItemPattern<V> extends TreeItemInputs<V> {
}
/**
 * Represents an item in a Tree.
 */
declare class TreeItemPattern<V> implements ExpansionItem {
    readonly inputs: TreeItemInputs<V>;
    /** The position of this item among its siblings. */
    readonly index: _angular_core.Signal<number>;
    /** The unique identifier used by the expansion behavior. */
    readonly expansionId: SignalLike<string>;
    /** Controls expansion for child items. */
    readonly expansionManager: ListExpansion;
    /** Controls expansion for this item. */
    readonly expansion: ExpansionControl;
    /** Whether the item is expandable. It's expandable if children item exist. */
    readonly expandable: SignalLike<boolean>;
    /** The level of the current item in a tree. */
    readonly level: SignalLike<number>;
    /** Whether this item is currently expanded. */
    readonly expanded: _angular_core.Signal<boolean>;
    /** Whether this item is visible. */
    readonly visible: _angular_core.Signal<boolean>;
    /** The number of items under the same parent at the same level. */
    readonly setsize: _angular_core.Signal<number>;
    /** The position of this item among its siblings (1-based). */
    readonly posinset: _angular_core.Signal<number>;
    /** Whether the item is active. */
    readonly active: _angular_core.Signal<boolean>;
    /** The tabindex of the item. */
    readonly tabindex: _angular_core.Signal<0 | -1>;
    /** Whether the item is selected. */
    readonly selected: _angular_core.Signal<boolean | undefined>;
    /** The current type of this item. */
    readonly current: _angular_core.Signal<"page" | "step" | "location" | "date" | "time" | "true" | "false" | undefined>;
    constructor(inputs: TreeItemInputs<V>);
}
/** The selection operations that the tree can perform. */
interface SelectOptions {
    toggle?: boolean;
    selectOne?: boolean;
    selectRange?: boolean;
    anchor?: boolean;
}
/** Represents the required inputs for a tree. */
interface TreeInputs<V> extends Omit<ListInputs<TreeItemPattern<V>, V>, 'items'> {
    /** A unique identifier for the tree. */
    id: SignalLike<string>;
    /** All items in the tree, in document order (DFS-like, a flattened list). */
    allItems: SignalLike<TreeItemPattern<V>[]>;
    /** Whether the tree is in navigation mode. */
    nav: SignalLike<boolean>;
    /** The aria-current type. */
    currentType: SignalLike<'page' | 'step' | 'location' | 'date' | 'time' | 'true' | 'false'>;
}
interface TreePattern<V> extends TreeInputs<V> {
}
/** Controls the state and interactions of a tree view. */
declare class TreePattern<V> {
    readonly inputs: TreeInputs<V>;
    /** The list behavior for the tree. */
    readonly listBehavior: List<TreeItemPattern<V>, V>;
    /** Controls expansion for direct children of the tree root (top-level items). */
    readonly expansionManager: ListExpansion;
    /** The root level is 0. */
    readonly level: () => number;
    /** The root is always expanded. */
    readonly expanded: () => boolean;
    /** The tabindex of the tree. */
    tabindex: SignalLike<-1 | 0>;
    /** The id of the current active item. */
    readonly activedescendant: _angular_core.Signal<string | undefined>;
    /** The direct children of the root (top-level tree items). */
    readonly children: _angular_core.Signal<TreeItemPattern<V>[]>;
    /** All currently visible tree items. An item is visible if their parent is expanded. */
    readonly visibleItems: _angular_core.Signal<TreeItemPattern<V>[]>;
    /** Whether the tree selection follows focus. */
    readonly followFocus: _angular_core.Signal<boolean>;
    /** The key for navigating to the previous item. */
    readonly prevKey: _angular_core.Signal<"ArrowUp" | "ArrowRight" | "ArrowLeft">;
    /** The key for navigating to the next item. */
    readonly nextKey: _angular_core.Signal<"ArrowRight" | "ArrowLeft" | "ArrowDown">;
    /** The key for collapsing an item or moving to its parent. */
    readonly collapseKey: _angular_core.Signal<"ArrowUp" | "ArrowRight" | "ArrowLeft">;
    /** The key for expanding an item or moving to its first child. */
    readonly expandKey: _angular_core.Signal<"ArrowRight" | "ArrowLeft" | "ArrowDown">;
    /** Represents the space key. Does nothing when the user is actively using typeahead. */
    readonly dynamicSpaceKey: _angular_core.Signal<"" | " ">;
    /** Regular expression to match characters for typeahead. */
    readonly typeaheadRegexp: RegExp;
    /** The keydown event manager for the tree. */
    readonly keydown: _angular_core.Signal<KeyboardEventManager<KeyboardEvent>>;
    /** The pointerdown event manager for the tree. */
    pointerdown: _angular_core.Signal<PointerEventManager<PointerEvent>>;
    constructor(inputs: TreeInputs<V>);
    /**
     * Sets the tree to it's default initial state.
     *
     * Sets the active index of the tree to the first focusable selected tree item if one exists.
     * Otherwise, sets focus to the first focusable tree item.
     */
    setDefaultState(): void;
    /** Handles keydown events on the tree. */
    onKeydown(event: KeyboardEvent): void;
    /** Handles pointerdown events on the tree. */
    onPointerdown(event: PointerEvent): void;
    /** Navigates to the given tree item in the tree. */
    goto(e: PointerEvent, opts?: SelectOptions): void;
    /** Toggles to expand or collapse a tree item. */
    toggleExpansion(item?: TreeItemPattern<V>): void;
    /** Expands a tree item. */
    expand(opts?: SelectOptions): void;
    /** Expands all sibling tree items including itself. */
    expandSiblings(item?: TreeItemPattern<V>): void;
    /** Collapses a tree item. */
    collapse(opts?: SelectOptions): void;
    /** Retrieves the TreeItemPattern associated with a DOM event, if any. */
    protected _getItem(event: Event): TreeItemPattern<V> | undefined;
}

export { TreeItemPattern, TreePattern };
export type { TreeInputs, TreeItemInputs };
