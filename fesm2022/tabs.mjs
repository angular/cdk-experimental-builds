import * as i1 from '@angular/cdk-experimental/deferred-content';
import { DeferredContentAware, DeferredContent } from '@angular/cdk-experimental/deferred-content';
import { _IdGenerator } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import * as i0 from '@angular/core';
import { contentChild, contentChildren, computed, inject, input, booleanAttribute, model, signal, ElementRef, effect, Directive } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TabListPattern, TabPattern, TabPanelPattern } from './tabs-C3iUgAka.mjs';
import './list-focus-SMTTo80U.mjs';

/**
 * A Tabs container.
 *
 * Represents a set of layered sections of content. The CdkTabs is a container meant to be used with
 * CdkTabList, CdkTab, and CdkTabPanel as follows:
 *
 * ```html
 * <div cdkTabs>
 *   <ul cdkTabList>
 *     <li cdkTab>Tab 1</li>
 *     <li cdkTab>Tab 2</li>
 *     <li cdkTab>Tab 3</li>
 *   </ul>
 *
 *   <div cdkTabPanel>Tab content 1</div>
 *   <div cdkTabPanel>Tab content 2</div>
 *   <div cdkTabPanel>Tab content 3</div>
 * </div>
 * ```
 */
class CdkTabs {
    /** The CdkTabList nested inside of the container. */
    _cdkTabList = contentChild(CdkTabList);
    /** The CdkTabPanels nested inside of the container. */
    _cdkTabPanels = contentChildren(CdkTabPanel);
    /** The Tab UIPattern of the child Tabs. */
    tabs = computed(() => this._cdkTabList()?.tabs());
    /** The TabPanel UIPattern of the child TabPanels. */
    tabpanels = computed(() => this._cdkTabPanels().map(tabpanel => tabpanel.pattern));
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.0.0-next.5", ngImport: i0, type: CdkTabs, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.2.0", version: "20.0.0-next.5", type: CdkTabs, isStandalone: true, selector: "[cdkTabs]", host: { classAttribute: "cdk-tabs" }, queries: [{ propertyName: "_cdkTabList", first: true, predicate: CdkTabList, descendants: true, isSignal: true }, { propertyName: "_cdkTabPanels", predicate: CdkTabPanel, isSignal: true }], exportAs: ["cdkTabs"], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.0.0-next.5", ngImport: i0, type: CdkTabs, decorators: [{
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
    /** The directionality (LTR / RTL) context for the application (or a subtree of it). */
    _directionality = inject(Directionality);
    /** The CdkTabs nested inside of the CdkTabList. */
    _cdkTabs = contentChildren(CdkTab);
    /** A signal wrapper for directionality. */
    textDirection = toSignal(this._directionality.change, {
        initialValue: this._directionality.value,
    });
    /** The Tab UIPatterns of the child Tabs. */
    tabs = computed(() => this._cdkTabs().map(tab => tab.pattern));
    /** Whether the tablist is vertically or horizontally oriented. */
    orientation = input('horizontal');
    /** Whether focus should wrap when navigating. */
    wrap = input(true, { transform: booleanAttribute });
    /** Whether disabled items in the list should be skipped when navigating. */
    skipDisabled = input(true, { transform: booleanAttribute });
    /** The focus strategy used by the tablist. */
    focusMode = input('roving');
    /** The selection strategy used by the tablist. */
    selectionMode = input('follow');
    /** Whether the tablist is disabled. */
    disabled = input(false, { transform: booleanAttribute });
    /** The current index that has been navigated to. */
    activeIndex = model(0);
    /** The TabList UIPattern. */
    pattern = new TabListPattern({
        ...this,
        items: this.tabs,
        textDirection: this.textDirection,
        value: signal([]),
    });
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.0.0-next.5", ngImport: i0, type: CdkTabList, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.2.0", version: "20.0.0-next.5", type: CdkTabList, isStandalone: true, selector: "[cdkTabList]", inputs: { orientation: { classPropertyName: "orientation", publicName: "orientation", isSignal: true, isRequired: false, transformFunction: null }, wrap: { classPropertyName: "wrap", publicName: "wrap", isSignal: true, isRequired: false, transformFunction: null }, skipDisabled: { classPropertyName: "skipDisabled", publicName: "skipDisabled", isSignal: true, isRequired: false, transformFunction: null }, focusMode: { classPropertyName: "focusMode", publicName: "focusMode", isSignal: true, isRequired: false, transformFunction: null }, selectionMode: { classPropertyName: "selectionMode", publicName: "selectionMode", isSignal: true, isRequired: false, transformFunction: null }, disabled: { classPropertyName: "disabled", publicName: "disabled", isSignal: true, isRequired: false, transformFunction: null }, activeIndex: { classPropertyName: "activeIndex", publicName: "activeIndex", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { activeIndex: "activeIndexChange" }, host: { attributes: { "role": "tablist" }, listeners: { "keydown": "pattern.onKeydown($event)", "pointerdown": "pattern.onPointerdown($event)" }, properties: { "attr.tabindex": "pattern.tabindex()", "attr.aria-disabled": "pattern.disabled()", "attr.aria-orientation": "pattern.orientation()", "attr.aria-activedescendant": "pattern.activedescendant()" }, classAttribute: "cdk-tablist" }, queries: [{ propertyName: "_cdkTabs", predicate: CdkTab, isSignal: true }], exportAs: ["cdkTabList"], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.0.0-next.5", ngImport: i0, type: CdkTabList, decorators: [{
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
                    },
                }]
        }] });
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
    /** The parent TabList UIPattern. */
    tablist = computed(() => this._cdkTabList.pattern);
    /** The TabPanel UIPattern associated with the tab */
    tabpanel = computed(() => this._cdkTabs.tabpanels().find(tabpanel => tabpanel.value() === this.value()));
    /** Whether a tab is disabled. */
    disabled = input(false, { transform: booleanAttribute });
    /** A local unique identifier for the tab. */
    value = input.required();
    /** The Tab UIPattern. */
    pattern = new TabPattern({
        ...this,
        id: () => this._id,
        element: () => this._elementRef.nativeElement,
        tablist: this.tablist,
        tabpanel: this.tabpanel,
        value: this.value,
    });
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.0.0-next.5", ngImport: i0, type: CdkTab, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.1.0", version: "20.0.0-next.5", type: CdkTab, isStandalone: true, selector: "[cdkTab]", inputs: { disabled: { classPropertyName: "disabled", publicName: "disabled", isSignal: true, isRequired: false, transformFunction: null }, value: { classPropertyName: "value", publicName: "value", isSignal: true, isRequired: true, transformFunction: null } }, host: { attributes: { "role": "tab" }, properties: { "attr.id": "pattern.id()", "attr.tabindex": "pattern.tabindex()", "attr.aria-selected": "pattern.selected()", "attr.aria-disabled": "pattern.disabled()", "attr.aria-controls": "pattern.controls()" }, classAttribute: "cdk-tab" }, exportAs: ["cdkTab"], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.0.0-next.5", ngImport: i0, type: CdkTab, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkTab]',
                    exportAs: 'cdkTab',
                    host: {
                        'role': 'tab',
                        'class': 'cdk-tab',
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
    tab = computed(() => this._cdkTabs.tabs()?.find(tab => tab.value() === this.value()));
    /** A local unique identifier for the tabpanel. */
    value = input.required();
    /** The TabPanel UIPattern. */
    pattern = new TabPanelPattern({
        ...this,
        id: () => this._id,
        tab: this.tab,
    });
    constructor() {
        effect(() => this._deferredContentAware.contentVisible.set(!this.pattern.hidden()));
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.0.0-next.5", ngImport: i0, type: CdkTabPanel, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.1.0", version: "20.0.0-next.5", type: CdkTabPanel, isStandalone: true, selector: "[cdkTabPanel]", inputs: { value: { classPropertyName: "value", publicName: "value", isSignal: true, isRequired: true, transformFunction: null } }, host: { attributes: { "role": "tabpanel", "tabindex": "0" }, properties: { "attr.id": "pattern.id()", "attr.inert": "pattern.hidden() ? true : null" }, classAttribute: "cdk-tabpanel" }, exportAs: ["cdkTabPanel"], hostDirectives: [{ directive: i1.DeferredContentAware, inputs: ["preserveContent", "preserveContent"] }], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.0.0-next.5", ngImport: i0, type: CdkTabPanel, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkTabPanel]',
                    exportAs: 'cdkTabPanel',
                    host: {
                        'role': 'tabpanel',
                        'tabindex': '0',
                        'class': 'cdk-tabpanel',
                        '[attr.id]': 'pattern.id()',
                        '[attr.inert]': 'pattern.hidden() ? true : null',
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
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.0.0-next.5", ngImport: i0, type: CdkTabContent, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "20.0.0-next.5", type: CdkTabContent, isStandalone: true, selector: "ng-template[cdkTabContent]", exportAs: ["cdTabContent"], hostDirectives: [{ directive: i1.DeferredContent }], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.0.0-next.5", ngImport: i0, type: CdkTabContent, decorators: [{
            type: Directive,
            args: [{
                    selector: 'ng-template[cdkTabContent]',
                    exportAs: 'cdTabContent',
                    hostDirectives: [DeferredContent],
                }]
        }] });

export { CdkTab, CdkTabContent, CdkTabList, CdkTabPanel, CdkTabs };
//# sourceMappingURL=tabs.mjs.map
