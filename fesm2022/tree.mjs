import * as i0 from '@angular/core';
import { inject, computed, ElementRef, signal, input, booleanAttribute, model, afterRenderEffect, untracked, Directive } from '@angular/core';
import { _IdGenerator } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import * as i1$1 from '@angular/cdk-experimental/deferred-content';
import { DeferredContentAware, DeferredContent } from '@angular/cdk-experimental/deferred-content';
import * as i1 from '@angular/cdk-experimental/combobox';
import { CdkComboboxPopup } from '@angular/cdk-experimental/combobox';
import { ComboboxTreePattern, TreePattern, TreeItemPattern } from './combobox-tree-T4IBVlaU.mjs';
import './list-QKHHM4uh.mjs';
import './list-navigation-CPkqnU1i.mjs';
import './expansion-BRQMRoGR.mjs';
import './pointer-event-manager-B6GE9jDm.mjs';

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
    /** A unique identifier for the tree. */
    _generatedId = inject(_IdGenerator).getId('cdk-tree-');
    // TODO(wagnermaciel): https://github.com/angular/components/pull/30495#discussion_r1972601144.
    /** A unique identifier for the tree. */
    id = computed(() => this._generatedId, ...(ngDevMode ? [{ debugName: "id" }] : []));
    /** A reference to the parent combobox popup, if one exists. */
    _popup = inject(CdkComboboxPopup, {
        optional: true,
    });
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
    pattern;
    /** Whether the tree has received focus yet. */
    _hasFocused = signal(false, ...(ngDevMode ? [{ debugName: "_hasFocused" }] : []));
    constructor() {
        const inputs = {
            ...this,
            id: this.id,
            allItems: computed(() => [...this._unorderedItems()].sort(sortDirectives).map(item => item.pattern)),
            activeItem: signal(undefined),
            element: () => this._elementRef.nativeElement,
            combobox: () => this._popup?.combobox?.pattern,
        };
        this.pattern = this._popup?.combobox
            ? new ComboboxTreePattern(inputs)
            : new TreePattern(inputs);
        if (this._popup?.combobox) {
            this._popup?.controls?.set(this.pattern);
        }
        afterRenderEffect(() => {
            if (!this._hasFocused()) {
                this.pattern.setDefaultState();
            }
        });
        afterRenderEffect(() => {
            const items = inputs.allItems();
            const activeItem = untracked(() => inputs.activeItem());
            if (!items.some(i => i === activeItem) && activeItem) {
                this.pattern.listBehavior.unfocus();
            }
        });
        afterRenderEffect(() => {
            const items = inputs.allItems();
            const value = untracked(() => this.value());
            if (items && value.some(v => !items.some(i => i.value() === v))) {
                this.value.set(value.filter(v => items.some(i => i.value() === v)));
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
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.1.0", version: "20.2.0-next.2", type: CdkTree, isStandalone: true, selector: "[cdkTree]", inputs: { orientation: { classPropertyName: "orientation", publicName: "orientation", isSignal: true, isRequired: false, transformFunction: null }, multi: { classPropertyName: "multi", publicName: "multi", isSignal: true, isRequired: false, transformFunction: null }, disabled: { classPropertyName: "disabled", publicName: "disabled", isSignal: true, isRequired: false, transformFunction: null }, selectionMode: { classPropertyName: "selectionMode", publicName: "selectionMode", isSignal: true, isRequired: false, transformFunction: null }, focusMode: { classPropertyName: "focusMode", publicName: "focusMode", isSignal: true, isRequired: false, transformFunction: null }, wrap: { classPropertyName: "wrap", publicName: "wrap", isSignal: true, isRequired: false, transformFunction: null }, skipDisabled: { classPropertyName: "skipDisabled", publicName: "skipDisabled", isSignal: true, isRequired: false, transformFunction: null }, typeaheadDelay: { classPropertyName: "typeaheadDelay", publicName: "typeaheadDelay", isSignal: true, isRequired: false, transformFunction: null }, value: { classPropertyName: "value", publicName: "value", isSignal: true, isRequired: false, transformFunction: null }, nav: { classPropertyName: "nav", publicName: "nav", isSignal: true, isRequired: false, transformFunction: null }, currentType: { classPropertyName: "currentType", publicName: "currentType", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { value: "valueChange" }, host: { attributes: { "role": "tree" }, listeners: { "keydown": "pattern.onKeydown($event)", "pointerdown": "pattern.onPointerdown($event)", "focusin": "onFocus()" }, properties: { "attr.id": "id()", "attr.aria-orientation": "pattern.orientation()", "attr.aria-multiselectable": "pattern.multi()", "attr.aria-disabled": "pattern.disabled()", "attr.aria-activedescendant": "pattern.activedescendant()", "tabindex": "pattern.tabindex()" }, classAttribute: "cdk-tree" }, exportAs: ["cdkTree"], hostDirectives: [{ directive: i1.CdkComboboxPopup }], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.2.0-next.2", ngImport: i0, type: CdkTree, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkTree]',
                    exportAs: 'cdkTree',
                    host: {
                        'class': 'cdk-tree',
                        'role': 'tree',
                        '[attr.id]': 'id()',
                        '[attr.aria-orientation]': 'pattern.orientation()',
                        '[attr.aria-multiselectable]': 'pattern.multi()',
                        '[attr.aria-disabled]': 'pattern.disabled()',
                        '[attr.aria-activedescendant]': 'pattern.activedescendant()',
                        '[tabindex]': 'pattern.tabindex()',
                        '(keydown)': 'pattern.onKeydown($event)',
                        '(pointerdown)': 'pattern.onPointerdown($event)',
                        '(focusin)': 'onFocus()',
                    },
                    hostDirectives: [{ directive: CdkComboboxPopup }],
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
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.1.0", version: "20.2.0-next.2", type: CdkTreeItem, isStandalone: true, selector: "[cdkTreeItem]", inputs: { value: { classPropertyName: "value", publicName: "value", isSignal: true, isRequired: true, transformFunction: null }, parent: { classPropertyName: "parent", publicName: "parent", isSignal: true, isRequired: true, transformFunction: null }, disabled: { classPropertyName: "disabled", publicName: "disabled", isSignal: true, isRequired: false, transformFunction: null }, label: { classPropertyName: "label", publicName: "label", isSignal: true, isRequired: false, transformFunction: null } }, host: { attributes: { "role": "treeitem" }, properties: { "class.cdk-active": "pattern.active()", "id": "pattern.id()", "attr.aria-expanded": "pattern.expandable() ? pattern.expanded() : null", "attr.aria-selected": "pattern.selected()", "attr.aria-current": "pattern.current()", "attr.aria-disabled": "pattern.disabled()", "attr.aria-level": "pattern.level()", "attr.aria-owns": "ownsId()", "attr.aria-setsize": "pattern.setsize()", "attr.aria-posinset": "pattern.posinset()", "attr.tabindex": "pattern.tabindex()" }, classAttribute: "cdk-treeitem" }, exportAs: ["cdkTreeItem"], ngImport: i0 });
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
        this._deferredContentAware.preserveContent.set(true);
        // Connect the group's hidden state to the DeferredContentAware's visibility.
        afterRenderEffect(() => {
            this.ownedBy().tree().pattern instanceof ComboboxTreePattern
                ? this._deferredContentAware.contentVisible.set(true)
                : this._deferredContentAware.contentVisible.set(this.visible());
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
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.1.0", version: "20.2.0-next.2", type: CdkTreeItemGroup, isStandalone: true, selector: "[cdkTreeItemGroup]", inputs: { ownedBy: { classPropertyName: "ownedBy", publicName: "ownedBy", isSignal: true, isRequired: true, transformFunction: null } }, host: { attributes: { "role": "group" }, properties: { "id": "id", "attr.inert": "visible() ? null : true" }, classAttribute: "cdk-treeitem-group" }, exportAs: ["cdkTreeItemGroup"], hostDirectives: [{ directive: i1$1.DeferredContentAware, inputs: ["preserveContent", "preserveContent"] }], ngImport: i0 });
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
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "20.2.0-next.2", type: CdkTreeItemGroupContent, isStandalone: true, selector: "ng-template[cdkTreeItemGroupContent]", hostDirectives: [{ directive: i1$1.DeferredContent }], ngImport: i0 });
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
