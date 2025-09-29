import * as i1 from '@angular/cdk-experimental/deferred-content';
import { DeferredContentAware, DeferredContent } from '@angular/cdk-experimental/deferred-content';
import { _IdGenerator } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import * as i0 from '@angular/core';
import { signal, computed, Directive, inject, ElementRef, linkedSignal, input, booleanAttribute, model, afterRenderEffect } from '@angular/core';
import { TabListPattern, TabPattern, TabPanelPattern } from './tabs-CNyN-ltr.mjs';
import './expansion-BRQMRoGR.mjs';
import './list-QKHHM4uh.mjs';
import './list-navigation-CPkqnU1i.mjs';
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
 * A Tabs container.
 *
 * Represents a set of layered sections of content. The CdkTabs is a container meant to be used with
 * CdkTabList, CdkTab, and CdkTabPanel as follows:
 *
 * ```html
 * <div cdkTabs>
 *   <ul cdkTabList>
 *     <li cdkTab value="tab1">Tab 1</li>
 *     <li cdkTab value="tab2">Tab 2</li>
 *     <li cdkTab value="tab3">Tab 3</li>
 *   </ul>
 *
 *   <div cdkTabPanel value="tab1">
 *      <ng-template cdkTabContent>Tab content 1</ng-template>
 *   </div>
 *   <div cdkTabPanel value="tab2">
 *      <ng-template cdkTabContent>Tab content 2</ng-template>
 *   </div>
 *   <div cdkTabPanel value="tab3">
 *      <ng-template cdkTabContent>Tab content 3</ng-template>
 *   </div>
 * ```
 */
class CdkTabs {
    /** The CdkTabList nested inside of the container. */
    _tablist = signal(undefined, ...(ngDevMode ? [{ debugName: "_tablist" }] : []));
    /** The CdkTabPanels nested inside of the container. */
    _unorderedPanels = signal(new Set(), ...(ngDevMode ? [{ debugName: "_unorderedPanels" }] : []));
    /** The Tab UIPattern of the child Tabs. */
    tabs = computed(() => this._tablist()?.tabs(), ...(ngDevMode ? [{ debugName: "tabs" }] : []));
    /** The TabPanel UIPattern of the child TabPanels. */
    unorderedTabpanels = computed(() => [...this._unorderedPanels()].map(tabpanel => tabpanel.pattern), ...(ngDevMode ? [{ debugName: "unorderedTabpanels" }] : []));
    register(child) {
        if (child instanceof CdkTabList) {
            this._tablist.set(child);
        }
        if (child instanceof CdkTabPanel) {
            this._unorderedPanels().add(child);
            this._unorderedPanels.set(new Set(this._unorderedPanels()));
        }
    }
    deregister(child) {
        if (child instanceof CdkTabList) {
            this._tablist.set(undefined);
        }
        if (child instanceof CdkTabPanel) {
            this._unorderedPanels().delete(child);
            this._unorderedPanels.set(new Set(this._unorderedPanels()));
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.2.0-next.2", ngImport: i0, type: CdkTabs, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "20.2.0-next.2", type: CdkTabs, isStandalone: true, selector: "[cdkTabs]", host: { classAttribute: "cdk-tabs" }, exportAs: ["cdkTabs"], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.2.0-next.2", ngImport: i0, type: CdkTabs, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkTabs]',
                    exportAs: 'cdkTabs',
                    host: {
                        'class': 'cdk-tabs',
                    },
                }]
        }] });
/**
 * A TabList container.
 *
 * Controls a list of CdkTab(s).
 */
class CdkTabList {
    /** A reference to the tab list element. */
    _elementRef = inject(ElementRef);
    /** The parent CdkTabs. */
    _cdkTabs = inject(CdkTabs);
    /** The CdkTabs nested inside of the CdkTabList. */
    _unorderedTabs = signal(new Set(), ...(ngDevMode ? [{ debugName: "_unorderedTabs" }] : []));
    /** The internal tab selection state. */
    _selection = linkedSignal(() => (this.tab() ? [this.tab()] : []));
    /** Text direction. */
    textDirection = inject(Directionality).valueSignal;
    /** The Tab UIPatterns of the child Tabs. */
    tabs = computed(() => [...this._unorderedTabs()].sort(sortDirectives).map(tab => tab.pattern), ...(ngDevMode ? [{ debugName: "tabs" }] : []));
    /** Whether the tablist is vertically or horizontally oriented. */
    orientation = input('horizontal', ...(ngDevMode ? [{ debugName: "orientation" }] : []));
    /** Whether focus should wrap when navigating. */
    wrap = input(true, ...(ngDevMode ? [{ debugName: "wrap", transform: booleanAttribute }] : [{ transform: booleanAttribute }]));
    /** Whether disabled items in the list should be skipped when navigating. */
    skipDisabled = input(true, ...(ngDevMode ? [{ debugName: "skipDisabled", transform: booleanAttribute }] : [{ transform: booleanAttribute }]));
    /** The focus strategy used by the tablist. */
    focusMode = input('roving', ...(ngDevMode ? [{ debugName: "focusMode" }] : []));
    /** The selection strategy used by the tablist. */
    selectionMode = input('follow', ...(ngDevMode ? [{ debugName: "selectionMode" }] : []));
    /** Whether the tablist is disabled. */
    disabled = input(false, ...(ngDevMode ? [{ debugName: "disabled", transform: booleanAttribute }] : [{ transform: booleanAttribute }]));
    /** The current selected tab. */
    tab = model(...(ngDevMode ? [undefined, { debugName: "tab" }] : []));
    /** The TabList UIPattern. */
    pattern = new TabListPattern({
        ...this,
        items: this.tabs,
        value: this._selection,
        activeItem: signal(undefined),
        element: () => this._elementRef.nativeElement,
    });
    /** Whether the tree has received focus yet. */
    _hasFocused = signal(false, ...(ngDevMode ? [{ debugName: "_hasFocused" }] : []));
    constructor() {
        afterRenderEffect(() => this.tab.set(this._selection()[0]));
        afterRenderEffect(() => {
            if (!this._hasFocused()) {
                this.pattern.setDefaultState();
            }
        });
    }
    onFocus() {
        this._hasFocused.set(true);
    }
    ngOnInit() {
        this._cdkTabs.register(this);
    }
    ngOnDestroy() {
        this._cdkTabs.deregister(this);
    }
    register(child) {
        this._unorderedTabs().add(child);
        this._unorderedTabs.set(new Set(this._unorderedTabs()));
    }
    deregister(child) {
        this._unorderedTabs().delete(child);
        this._unorderedTabs.set(new Set(this._unorderedTabs()));
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.2.0-next.2", ngImport: i0, type: CdkTabList, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.1.0", version: "20.2.0-next.2", type: CdkTabList, isStandalone: true, selector: "[cdkTabList]", inputs: { orientation: { classPropertyName: "orientation", publicName: "orientation", isSignal: true, isRequired: false, transformFunction: null }, wrap: { classPropertyName: "wrap", publicName: "wrap", isSignal: true, isRequired: false, transformFunction: null }, skipDisabled: { classPropertyName: "skipDisabled", publicName: "skipDisabled", isSignal: true, isRequired: false, transformFunction: null }, focusMode: { classPropertyName: "focusMode", publicName: "focusMode", isSignal: true, isRequired: false, transformFunction: null }, selectionMode: { classPropertyName: "selectionMode", publicName: "selectionMode", isSignal: true, isRequired: false, transformFunction: null }, disabled: { classPropertyName: "disabled", publicName: "disabled", isSignal: true, isRequired: false, transformFunction: null }, tab: { classPropertyName: "tab", publicName: "tab", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { tab: "tabChange" }, host: { attributes: { "role": "tablist" }, listeners: { "keydown": "pattern.onKeydown($event)", "pointerdown": "pattern.onPointerdown($event)", "focusin": "onFocus()" }, properties: { "attr.tabindex": "pattern.tabindex()", "attr.aria-disabled": "pattern.disabled()", "attr.aria-orientation": "pattern.orientation()", "attr.aria-activedescendant": "pattern.activedescendant()" }, classAttribute: "cdk-tablist" }, exportAs: ["cdkTabList"], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.2.0-next.2", ngImport: i0, type: CdkTabList, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkTabList]',
                    exportAs: 'cdkTabList',
                    host: {
                        'role': 'tablist',
                        'class': 'cdk-tablist',
                        '[attr.tabindex]': 'pattern.tabindex()',
                        '[attr.aria-disabled]': 'pattern.disabled()',
                        '[attr.aria-orientation]': 'pattern.orientation()',
                        '[attr.aria-activedescendant]': 'pattern.activedescendant()',
                        '(keydown)': 'pattern.onKeydown($event)',
                        '(pointerdown)': 'pattern.onPointerdown($event)',
                        '(focusin)': 'onFocus()',
                    },
                }]
        }], ctorParameters: () => [] });
/** A selectable tab in a TabList. */
class CdkTab {
    /** A reference to the tab element. */
    _elementRef = inject(ElementRef);
    /** The parent CdkTabs. */
    _cdkTabs = inject(CdkTabs);
    /** The parent CdkTabList. */
    _cdkTabList = inject(CdkTabList);
    /** A global unique identifier for the tab. */
    _id = inject(_IdGenerator).getId('cdk-tab-');
    /** The host native element. */
    element = computed(() => this._elementRef.nativeElement, ...(ngDevMode ? [{ debugName: "element" }] : []));
    /** The parent TabList UIPattern. */
    tablist = computed(() => this._cdkTabList.pattern, ...(ngDevMode ? [{ debugName: "tablist" }] : []));
    /** The TabPanel UIPattern associated with the tab */
    tabpanel = computed(() => this._cdkTabs.unorderedTabpanels().find(tabpanel => tabpanel.value() === this.value()), ...(ngDevMode ? [{ debugName: "tabpanel" }] : []));
    /** Whether a tab is disabled. */
    disabled = input(false, ...(ngDevMode ? [{ debugName: "disabled", transform: booleanAttribute }] : [{ transform: booleanAttribute }]));
    /** A local unique identifier for the tab. */
    value = input.required(...(ngDevMode ? [{ debugName: "value" }] : []));
    /** The Tab UIPattern. */
    pattern = new TabPattern({
        ...this,
        id: () => this._id,
        tablist: this.tablist,
        tabpanel: this.tabpanel,
        value: this.value,
    });
    ngOnInit() {
        this._cdkTabList.register(this);
    }
    ngOnDestroy() {
        this._cdkTabList.deregister(this);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.2.0-next.2", ngImport: i0, type: CdkTab, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.1.0", version: "20.2.0-next.2", type: CdkTab, isStandalone: true, selector: "[cdkTab]", inputs: { disabled: { classPropertyName: "disabled", publicName: "disabled", isSignal: true, isRequired: false, transformFunction: null }, value: { classPropertyName: "value", publicName: "value", isSignal: true, isRequired: true, transformFunction: null } }, host: { attributes: { "role": "tab" }, properties: { "class.cdk-active": "pattern.active()", "attr.id": "pattern.id()", "attr.tabindex": "pattern.tabindex()", "attr.aria-selected": "pattern.selected()", "attr.aria-disabled": "pattern.disabled()", "attr.aria-controls": "pattern.controls()" }, classAttribute: "cdk-tab" }, exportAs: ["cdkTab"], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.2.0-next.2", ngImport: i0, type: CdkTab, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkTab]',
                    exportAs: 'cdkTab',
                    host: {
                        'role': 'tab',
                        'class': 'cdk-tab',
                        '[class.cdk-active]': 'pattern.active()',
                        '[attr.id]': 'pattern.id()',
                        '[attr.tabindex]': 'pattern.tabindex()',
                        '[attr.aria-selected]': 'pattern.selected()',
                        '[attr.aria-disabled]': 'pattern.disabled()',
                        '[attr.aria-controls]': 'pattern.controls()',
                    },
                }]
        }] });
/**
 * A TabPanel container for the resources of layered content associated with a tab.
 *
 * If a tabpanel is hidden due to its corresponding tab is not activated, the `inert` attribute
 * will be applied to the tabpanel element to remove it from the accessibility tree and stop
 * all the keyboard and pointer interactions. Note that this does not visually hide the tabpenl
 * and a proper styling is required.
 */
class CdkTabPanel {
    /** The DeferredContentAware host directive. */
    _deferredContentAware = inject(DeferredContentAware);
    /** The parent CdkTabs. */
    _cdkTabs = inject(CdkTabs);
    /** A global unique identifier for the tab. */
    _id = inject(_IdGenerator).getId('cdk-tabpanel-');
    /** The Tab UIPattern associated with the tabpanel */
    tab = computed(() => this._cdkTabs.tabs()?.find(tab => tab.value() === this.value()), ...(ngDevMode ? [{ debugName: "tab" }] : []));
    /** A local unique identifier for the tabpanel. */
    value = input.required(...(ngDevMode ? [{ debugName: "value" }] : []));
    /** The TabPanel UIPattern. */
    pattern = new TabPanelPattern({
        ...this,
        id: () => this._id,
        tab: this.tab,
    });
    constructor() {
        afterRenderEffect(() => this._deferredContentAware.contentVisible.set(!this.pattern.hidden()));
    }
    ngOnInit() {
        this._cdkTabs.register(this);
    }
    ngOnDestroy() {
        this._cdkTabs.deregister(this);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.2.0-next.2", ngImport: i0, type: CdkTabPanel, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.1.0", version: "20.2.0-next.2", type: CdkTabPanel, isStandalone: true, selector: "[cdkTabPanel]", inputs: { value: { classPropertyName: "value", publicName: "value", isSignal: true, isRequired: true, transformFunction: null } }, host: { attributes: { "role": "tabpanel" }, properties: { "attr.id": "pattern.id()", "attr.tabindex": "pattern.tabindex()", "attr.inert": "pattern.hidden() ? true : null", "attr.aria-labelledby": "pattern.labelledBy()" }, classAttribute: "cdk-tabpanel" }, exportAs: ["cdkTabPanel"], hostDirectives: [{ directive: i1.DeferredContentAware, inputs: ["preserveContent", "preserveContent"] }], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.2.0-next.2", ngImport: i0, type: CdkTabPanel, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkTabPanel]',
                    exportAs: 'cdkTabPanel',
                    host: {
                        'role': 'tabpanel',
                        'class': 'cdk-tabpanel',
                        '[attr.id]': 'pattern.id()',
                        '[attr.tabindex]': 'pattern.tabindex()',
                        '[attr.inert]': 'pattern.hidden() ? true : null',
                        '[attr.aria-labelledby]': 'pattern.labelledBy()',
                    },
                    hostDirectives: [
                        {
                            directive: DeferredContentAware,
                            inputs: ['preserveContent'],
                        },
                    ],
                }]
        }], ctorParameters: () => [] });
/**
 * A TabContent container for the lazy-loaded content.
 */
class CdkTabContent {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.2.0-next.2", ngImport: i0, type: CdkTabContent, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "20.2.0-next.2", type: CdkTabContent, isStandalone: true, selector: "ng-template[cdkTabContent]", exportAs: ["cdTabContent"], hostDirectives: [{ directive: i1.DeferredContent }], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.2.0-next.2", ngImport: i0, type: CdkTabContent, decorators: [{
            type: Directive,
            args: [{
                    selector: 'ng-template[cdkTabContent]',
                    exportAs: 'cdTabContent',
                    hostDirectives: [DeferredContent],
                }]
        }] });

export { CdkTab, CdkTabContent, CdkTabList, CdkTabPanel, CdkTabs };
//# sourceMappingURL=tabs.mjs.map
