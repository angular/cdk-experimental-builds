import * as _angular_cdk_bidi from '@angular/cdk/bidi';
import * as i0 from '@angular/core';
import { a as TabPattern, c as TabPanelPattern, e as TabListPattern } from '../tabs.d-CBlJ33jz.js';
import * as i1 from '@angular/cdk-experimental/deferred-content';
import '../list-navigation.d-Br99p_2O.js';
import '../list-selection.d-BQWRFJI-.js';
import '../expansion.d-DB4i_1Aa.js';

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
declare class CdkTabs {
    /** The CdkTabList nested inside of the container. */
    private readonly _cdkTabList;
    /** The CdkTabPanels nested inside of the container. */
    private readonly _cdkTabPanels;
    /** The Tab UIPattern of the child Tabs. */
    tabs: i0.Signal<TabPattern[] | undefined>;
    /** The TabPanel UIPattern of the child TabPanels. */
    tabpanels: i0.Signal<TabPanelPattern[]>;
    static ɵfac: i0.ɵɵFactoryDeclaration<CdkTabs, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<CdkTabs, "[cdkTabs]", ["cdkTabs"], {}, {}, ["_cdkTabList", "_cdkTabPanels"], never, true, never>;
}
/**
 * A TabList container.
 *
 * Controls a list of CdkTab(s).
 */
declare class CdkTabList {
    /** The directionality (LTR / RTL) context for the application (or a subtree of it). */
    private readonly _directionality;
    /** The CdkTabs nested inside of the CdkTabList. */
    private readonly _cdkTabs;
    /** The internal tab selection state. */
    private readonly _selection;
    /** A signal wrapper for directionality. */
    protected textDirection: i0.Signal<_angular_cdk_bidi.Direction>;
    /** The Tab UIPatterns of the child Tabs. */
    tabs: i0.Signal<TabPattern[]>;
    /** Whether the tablist is vertically or horizontally oriented. */
    orientation: i0.InputSignal<"vertical" | "horizontal">;
    /** Whether focus should wrap when navigating. */
    wrap: i0.InputSignalWithTransform<boolean, unknown>;
    /** Whether disabled items in the list should be skipped when navigating. */
    skipDisabled: i0.InputSignalWithTransform<boolean, unknown>;
    /** The focus strategy used by the tablist. */
    focusMode: i0.InputSignal<"roving" | "activedescendant">;
    /** The selection strategy used by the tablist. */
    selectionMode: i0.InputSignal<"follow" | "explicit">;
    /** Whether the tablist is disabled. */
    disabled: i0.InputSignalWithTransform<boolean, unknown>;
    /** The current index that has been navigated to. */
    activeIndex: i0.ModelSignal<number>;
    /** The current selected tab. */
    tab: i0.ModelSignal<string | undefined>;
    /** The TabList UIPattern. */
    pattern: TabListPattern;
    constructor();
    static ɵfac: i0.ɵɵFactoryDeclaration<CdkTabList, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<CdkTabList, "[cdkTabList]", ["cdkTabList"], { "orientation": { "alias": "orientation"; "required": false; "isSignal": true; }; "wrap": { "alias": "wrap"; "required": false; "isSignal": true; }; "skipDisabled": { "alias": "skipDisabled"; "required": false; "isSignal": true; }; "focusMode": { "alias": "focusMode"; "required": false; "isSignal": true; }; "selectionMode": { "alias": "selectionMode"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "activeIndex": { "alias": "activeIndex"; "required": false; "isSignal": true; }; "tab": { "alias": "tab"; "required": false; "isSignal": true; }; }, { "activeIndex": "activeIndexChange"; "tab": "tabChange"; }, ["_cdkTabs"], never, true, never>;
}
/** A selectable tab in a TabList. */
declare class CdkTab {
    /** A reference to the tab element. */
    private readonly _elementRef;
    /** The parent CdkTabs. */
    private readonly _cdkTabs;
    /** The parent CdkTabList. */
    private readonly _cdkTabList;
    /** A global unique identifier for the tab. */
    private readonly _id;
    /** The parent TabList UIPattern. */
    protected tablist: i0.Signal<TabListPattern>;
    /** The TabPanel UIPattern associated with the tab */
    protected tabpanel: i0.Signal<TabPanelPattern | undefined>;
    /** Whether a tab is disabled. */
    disabled: i0.InputSignalWithTransform<boolean, unknown>;
    /** A local unique identifier for the tab. */
    value: i0.InputSignal<string>;
    /** The Tab UIPattern. */
    pattern: TabPattern;
    static ɵfac: i0.ɵɵFactoryDeclaration<CdkTab, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<CdkTab, "[cdkTab]", ["cdkTab"], { "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "value": { "alias": "value"; "required": true; "isSignal": true; }; }, {}, never, never, true, never>;
}
/**
 * A TabPanel container for the resources of layered content associated with a tab.
 *
 * If a tabpanel is hidden due to its corresponding tab is not activated, the `inert` attribute
 * will be applied to the tabpanel element to remove it from the accessibility tree and stop
 * all the keyboard and pointer interactions. Note that this does not visually hide the tabpenl
 * and a proper styling is required.
 */
declare class CdkTabPanel {
    /** The DeferredContentAware host directive. */
    private readonly _deferredContentAware;
    /** The parent CdkTabs. */
    private readonly _cdkTabs;
    /** A global unique identifier for the tab. */
    private readonly _id;
    /** The Tab UIPattern associated with the tabpanel */
    protected tab: i0.Signal<TabPattern | undefined>;
    /** A local unique identifier for the tabpanel. */
    value: i0.InputSignal<string>;
    /** The TabPanel UIPattern. */
    pattern: TabPanelPattern;
    constructor();
    static ɵfac: i0.ɵɵFactoryDeclaration<CdkTabPanel, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<CdkTabPanel, "[cdkTabPanel]", ["cdkTabPanel"], { "value": { "alias": "value"; "required": true; "isSignal": true; }; }, {}, never, never, true, [{ directive: typeof i1.DeferredContentAware; inputs: { "preserveContent": "preserveContent"; }; outputs: {}; }]>;
}
/**
 * A TabContent container for the lazy-loaded content.
 */
declare class CdkTabContent {
    static ɵfac: i0.ɵɵFactoryDeclaration<CdkTabContent, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<CdkTabContent, "ng-template[cdkTabContent]", ["cdTabContent"], {}, {}, never, never, true, [{ directive: typeof i1.DeferredContent; inputs: {}; outputs: {}; }]>;
}

export { CdkTab, CdkTabContent, CdkTabList, CdkTabPanel, CdkTabs };
