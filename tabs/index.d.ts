import * as i0 from '@angular/core';
import { Signal, OnInit, OnDestroy } from '@angular/core';
import * as _angular_cdk_bidi from '@angular/cdk/bidi';
import { a as TabPattern, c as TabPanelPattern, e as TabListPattern } from '../tabs.d-BytMQIRD.js';
import * as i1 from '@angular/cdk-experimental/deferred-content';
import '../list-navigation.d-Br99p_2O.js';
import '../list-selection.d-BQWRFJI-.js';
import '../expansion.d-DB4i_1Aa.js';

interface HasElement {
    element: Signal<HTMLElement>;
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
declare class CdkTabs {
    /** The CdkTabList nested inside of the container. */
    private readonly _tablist;
    /** The CdkTabPanels nested inside of the container. */
    private readonly _unorderedPanels;
    /** The Tab UIPattern of the child Tabs. */
    tabs: Signal<TabPattern[] | undefined>;
    /** The TabPanel UIPattern of the child TabPanels. */
    unorderedTabpanels: Signal<TabPanelPattern[]>;
    register(child: CdkTabList | CdkTabPanel): void;
    deregister(child: CdkTabList | CdkTabPanel): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<CdkTabs, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<CdkTabs, "[cdkTabs]", ["cdkTabs"], {}, {}, never, never, true, never>;
}
/**
 * A TabList container.
 *
 * Controls a list of CdkTab(s).
 */
declare class CdkTabList implements OnInit, OnDestroy {
    /** The parent CdkTabs. */
    private readonly _cdkTabs;
    /** The CdkTabs nested inside of the CdkTabList. */
    private readonly _unorderedTabs;
    /** The internal tab selection state. */
    private readonly _selection;
    /** Text direction. */
    readonly textDirection: i0.WritableSignal<_angular_cdk_bidi.Direction>;
    /** The Tab UIPatterns of the child Tabs. */
    readonly tabs: Signal<TabPattern[]>;
    /** Whether the tablist is vertically or horizontally oriented. */
    readonly orientation: i0.InputSignal<"vertical" | "horizontal">;
    /** Whether focus should wrap when navigating. */
    readonly wrap: i0.InputSignalWithTransform<boolean, unknown>;
    /** Whether disabled items in the list should be skipped when navigating. */
    readonly skipDisabled: i0.InputSignalWithTransform<boolean, unknown>;
    /** The focus strategy used by the tablist. */
    readonly focusMode: i0.InputSignal<"roving" | "activedescendant">;
    /** The selection strategy used by the tablist. */
    readonly selectionMode: i0.InputSignal<"follow" | "explicit">;
    /** Whether the tablist is disabled. */
    readonly disabled: i0.InputSignalWithTransform<boolean, unknown>;
    /** The current selected tab. */
    readonly tab: i0.ModelSignal<string | undefined>;
    /** The TabList UIPattern. */
    readonly pattern: TabListPattern;
    /** Whether the tree has received focus yet. */
    private _hasFocused;
    constructor();
    onFocus(): void;
    ngOnInit(): void;
    ngOnDestroy(): void;
    register(child: CdkTab): void;
    deregister(child: CdkTab): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<CdkTabList, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<CdkTabList, "[cdkTabList]", ["cdkTabList"], { "orientation": { "alias": "orientation"; "required": false; "isSignal": true; }; "wrap": { "alias": "wrap"; "required": false; "isSignal": true; }; "skipDisabled": { "alias": "skipDisabled"; "required": false; "isSignal": true; }; "focusMode": { "alias": "focusMode"; "required": false; "isSignal": true; }; "selectionMode": { "alias": "selectionMode"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "tab": { "alias": "tab"; "required": false; "isSignal": true; }; }, { "tab": "tabChange"; }, never, never, true, never>;
}
/** A selectable tab in a TabList. */
declare class CdkTab implements HasElement, OnInit, OnDestroy {
    /** A reference to the tab element. */
    private readonly _elementRef;
    /** The parent CdkTabs. */
    private readonly _cdkTabs;
    /** The parent CdkTabList. */
    private readonly _cdkTabList;
    /** A global unique identifier for the tab. */
    private readonly _id;
    /** The host native element. */
    readonly element: Signal<any>;
    /** The parent TabList UIPattern. */
    readonly tablist: Signal<TabListPattern>;
    /** The TabPanel UIPattern associated with the tab */
    readonly tabpanel: Signal<TabPanelPattern | undefined>;
    /** Whether a tab is disabled. */
    readonly disabled: i0.InputSignalWithTransform<boolean, unknown>;
    /** A local unique identifier for the tab. */
    readonly value: i0.InputSignal<string>;
    /** The Tab UIPattern. */
    readonly pattern: TabPattern;
    ngOnInit(): void;
    ngOnDestroy(): void;
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
declare class CdkTabPanel implements OnInit, OnDestroy {
    /** The DeferredContentAware host directive. */
    private readonly _deferredContentAware;
    /** The parent CdkTabs. */
    private readonly _cdkTabs;
    /** A global unique identifier for the tab. */
    private readonly _id;
    /** The Tab UIPattern associated with the tabpanel */
    readonly tab: Signal<TabPattern | undefined>;
    /** A local unique identifier for the tabpanel. */
    readonly value: i0.InputSignal<string>;
    /** The TabPanel UIPattern. */
    readonly pattern: TabPanelPattern;
    constructor();
    ngOnInit(): void;
    ngOnDestroy(): void;
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
