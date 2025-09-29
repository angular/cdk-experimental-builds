import * as _angular_cdk_bidi from '@angular/cdk/bidi';
import * as _angular_core from '@angular/core';
import { Signal, OnInit, OnDestroy } from '@angular/core';
import { TreePattern, TreeItemPattern } from './tree.d-DomXPN8h.js';
import * as i1 from '@angular/cdk-experimental/combobox';
import * as i1$1 from '@angular/cdk-experimental/deferred-content';
import './list-navigation.d-v7LRaIQt.js';
import './list.d-CgeCwpQa.js';
import './expansion.d-Bk5hojv9.js';
import './pointer-event-manager.d-DxLZK1bd.js';

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
    /** A unique identifier for the tree. */
    private readonly _generatedId;
    /** A unique identifier for the tree. */
    protected id: Signal<string>;
    /** A reference to the parent combobox popup, if one exists. */
    private readonly _popup;
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
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<CdkTree<any>, "[cdkTree]", ["cdkTree"], { "orientation": { "alias": "orientation"; "required": false; "isSignal": true; }; "multi": { "alias": "multi"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "selectionMode": { "alias": "selectionMode"; "required": false; "isSignal": true; }; "focusMode": { "alias": "focusMode"; "required": false; "isSignal": true; }; "wrap": { "alias": "wrap"; "required": false; "isSignal": true; }; "skipDisabled": { "alias": "skipDisabled"; "required": false; "isSignal": true; }; "typeaheadDelay": { "alias": "typeaheadDelay"; "required": false; "isSignal": true; }; "value": { "alias": "value"; "required": false; "isSignal": true; }; "nav": { "alias": "nav"; "required": false; "isSignal": true; }; "currentType": { "alias": "currentType"; "required": false; "isSignal": true; }; }, { "value": "valueChange"; }, never, never, true, [{ directive: typeof i1.CdkComboboxPopup; inputs: {}; outputs: {}; }]>;
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
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<CdkTreeItemGroup<any>, "[cdkTreeItemGroup]", ["cdkTreeItemGroup"], { "ownedBy": { "alias": "ownedBy"; "required": true; "isSignal": true; }; }, {}, never, never, true, [{ directive: typeof i1$1.DeferredContentAware; inputs: { "preserveContent": "preserveContent"; }; outputs: {}; }]>;
}
/**
 * A structural directive that marks the `ng-template` to be used as the content
 * for a `CdkTreeItemGroup`. This content can be lazily loaded.
 */
declare class CdkTreeItemGroupContent {
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CdkTreeItemGroupContent, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<CdkTreeItemGroupContent, "ng-template[cdkTreeItemGroupContent]", never, {}, {}, never, never, true, [{ directive: typeof i1$1.DeferredContent; inputs: {}; outputs: {}; }]>;
}

export { CdkTree, CdkTreeItem, CdkTreeItemGroup, CdkTreeItemGroupContent };
