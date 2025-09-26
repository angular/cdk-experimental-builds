import * as _angular_cdk_bidi from '@angular/cdk/bidi';
import * as _angular_core from '@angular/core';
import { OnInit, OnDestroy, Signal } from '@angular/core';
import { SignalLike } from '../list-navigation.d.js';
import { List, ListItem, ListInputs } from '../list.d.js';
import { ExpansionItem, ListExpansion, ExpansionControl } from '../expansion.d.js';
import { KeyboardEventManager, PointerEventManager } from '../pointer-event-manager.d.js';
import * as i1 from '@angular/cdk-experimental/deferred-content';

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
    readonly tabindex: _angular_core.Signal<0 | -1>;
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
    private _getItem;
}

interface HasElement {
    element: Signal<HTMLElement>;
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
declare class CdkTree<V> {
    /** A reference to the tree element. */
    private readonly _elementRef;
    /** All CdkTreeItem instances within this tree. */
    private readonly _unorderedItems;
    /** Orientation of the tree. */
    readonly orientation: _angular_core.InputSignal<"vertical" | "horizontal">;
    /** Whether multi-selection is allowed. */
    readonly multi: _angular_core.InputSignalWithTransform<boolean, unknown>;
    /** Whether the tree is disabled. */
    readonly disabled: _angular_core.InputSignalWithTransform<boolean, unknown>;
    /** The selection strategy used by the tree. */
    readonly selectionMode: _angular_core.InputSignal<"explicit" | "follow">;
    /** The focus strategy used by the tree. */
    readonly focusMode: _angular_core.InputSignal<"roving" | "activedescendant">;
    /** Whether navigation wraps. */
    readonly wrap: _angular_core.InputSignalWithTransform<boolean, unknown>;
    /** Whether to skip disabled items during navigation. */
    readonly skipDisabled: _angular_core.InputSignalWithTransform<boolean, unknown>;
    /** Typeahead delay. */
    readonly typeaheadDelay: _angular_core.InputSignal<number>;
    /** Selected item values. */
    readonly value: _angular_core.ModelSignal<V[]>;
    /** Text direction. */
    readonly textDirection: _angular_core.WritableSignal<_angular_cdk_bidi.Direction>;
    /** Whether the tree is in navigation mode. */
    readonly nav: _angular_core.InputSignal<boolean>;
    /** The aria-current type. */
    readonly currentType: _angular_core.InputSignal<"page" | "step" | "location" | "date" | "time" | "true" | "false">;
    /** The UI pattern for the tree. */
    readonly pattern: TreePattern<V>;
    /** Whether the tree has received focus yet. */
    private _hasFocused;
    constructor();
    onFocus(): void;
    register(child: CdkTreeItem<V>): void;
    unregister(child: CdkTreeItem<V>): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CdkTree<any>, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<CdkTree<any>, "[cdkTree]", ["cdkTree"], { "orientation": { "alias": "orientation"; "required": false; "isSignal": true; }; "multi": { "alias": "multi"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "selectionMode": { "alias": "selectionMode"; "required": false; "isSignal": true; }; "focusMode": { "alias": "focusMode"; "required": false; "isSignal": true; }; "wrap": { "alias": "wrap"; "required": false; "isSignal": true; }; "skipDisabled": { "alias": "skipDisabled"; "required": false; "isSignal": true; }; "typeaheadDelay": { "alias": "typeaheadDelay"; "required": false; "isSignal": true; }; "value": { "alias": "value"; "required": false; "isSignal": true; }; "nav": { "alias": "nav"; "required": false; "isSignal": true; }; "currentType": { "alias": "currentType"; "required": false; "isSignal": true; }; }, { "value": "valueChange"; }, never, never, true, never>;
}
/**
 * A selectable and expandable Tree Item in a Tree.
 */
declare class CdkTreeItem<V> implements OnInit, OnDestroy, HasElement {
    /** A reference to the tree item element. */
    private readonly _elementRef;
    /** A unique identifier for the tree item. */
    private readonly _id;
    /** The owned tree item group. */
    private readonly _group;
    /** The id of the owned group. */
    readonly ownsId: Signal<string | undefined>;
    /** The host native element. */
    readonly element: Signal<any>;
    /** The value of the tree item. */
    readonly value: _angular_core.InputSignal<V>;
    /** The parent tree root or tree item group. */
    readonly parent: _angular_core.InputSignal<CdkTreeItemGroup<V> | CdkTree<V>>;
    /** Whether the tree item is disabled. */
    readonly disabled: _angular_core.InputSignalWithTransform<boolean, unknown>;
    /** Optional label for typeahead. Defaults to the element's textContent. */
    readonly label: _angular_core.InputSignal<string | undefined>;
    /** Search term for typeahead. */
    readonly searchTerm: Signal<any>;
    /** The tree root. */
    readonly tree: Signal<CdkTree<V>>;
    /** The UI pattern for this item. */
    pattern: TreeItemPattern<V>;
    constructor();
    ngOnInit(): void;
    ngOnDestroy(): void;
    register(group: CdkTreeItemGroup<V>): void;
    unregister(): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CdkTreeItem<any>, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<CdkTreeItem<any>, "[cdkTreeItem]", ["cdkTreeItem"], { "value": { "alias": "value"; "required": true; "isSignal": true; }; "parent": { "alias": "parent"; "required": true; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "label": { "alias": "label"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}
/**
 * Container that designates content as a group.
 */
declare class CdkTreeItemGroup<V> implements OnInit, OnDestroy, HasElement {
    /** A reference to the group element. */
    private readonly _elementRef;
    /** The DeferredContentAware host directive. */
    private readonly _deferredContentAware;
    /** All groupable items that are descendants of the group. */
    private readonly _unorderedItems;
    /** The host native element. */
    readonly element: Signal<any>;
    /** Unique ID for the group. */
    readonly id: string;
    /** Whether the group is visible. */
    readonly visible: _angular_core.WritableSignal<boolean>;
    /** Child items within this group. */
    readonly children: Signal<CdkTreeItem<V>[]>;
    /** Tree item that owns the group. */
    readonly ownedBy: _angular_core.InputSignal<CdkTreeItem<V>>;
    constructor();
    ngOnInit(): void;
    ngOnDestroy(): void;
    register(child: CdkTreeItem<V>): void;
    unregister(child: CdkTreeItem<V>): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CdkTreeItemGroup<any>, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<CdkTreeItemGroup<any>, "[cdkTreeItemGroup]", ["cdkTreeItemGroup"], { "ownedBy": { "alias": "ownedBy"; "required": true; "isSignal": true; }; }, {}, never, never, true, [{ directive: typeof i1.DeferredContentAware; inputs: { "preserveContent": "preserveContent"; }; outputs: {}; }]>;
}
/**
 * A structural directive that marks the `ng-template` to be used as the content
 * for a `CdkTreeItemGroup`. This content can be lazily loaded.
 */
declare class CdkTreeItemGroupContent {
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CdkTreeItemGroupContent, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<CdkTreeItemGroupContent, "ng-template[cdkTreeItemGroupContent]", never, {}, {}, never, never, true, [{ directive: typeof i1.DeferredContent; inputs: {}; outputs: {}; }]>;
}

export { CdkTree, CdkTreeItem, CdkTreeItemGroup, CdkTreeItemGroupContent };
