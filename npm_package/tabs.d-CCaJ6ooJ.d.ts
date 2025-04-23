import * as i0 from '@angular/core';
import { L as ListNavigationItem, a as ListSelectionItem, b as ListFocusItem, S as SignalLike, d as ListNavigationInputs, e as ListSelectionInputs, f as ListFocusInputs, g as ListNavigation, h as ListSelection, i as ListFocus, K as KeyboardEventManager, P as PointerEventManager } from './list-navigation.d-DfOSxsSp.js';

/** The required inputs to tabs. */
interface TabInputs extends ListNavigationItem, ListSelectionItem<string>, ListFocusItem {
    tablist: SignalLike<TabListPattern>;
    tabpanel: SignalLike<TabPanelPattern | undefined>;
}
/** A tab in a tablist. */
declare class TabPattern {
    /** A global unique identifier for the tab. */
    id: SignalLike<string>;
    /** A local unique identifier for the tab. */
    value: SignalLike<string>;
    /** Whether the tab is selected. */
    selected: i0.Signal<boolean>;
    /** A Tabpanel Id controlled by the tab. */
    controls: i0.Signal<string | undefined>;
    /** Whether the tab is disabled. */
    disabled: SignalLike<boolean>;
    /** A reference to the parent tablist. */
    tablist: SignalLike<TabListPattern>;
    /** A reference to the corresponding tabpanel. */
    tabpanel: SignalLike<TabPanelPattern | undefined>;
    /** The tabindex of the tab. */
    tabindex: i0.Signal<0 | -1>;
    /** The html element that should receive focus. */
    element: SignalLike<HTMLElement>;
    constructor(inputs: TabInputs);
}
/** The selection operations that the tablist can perform. */
interface SelectOptions {
    select?: boolean;
    toggle?: boolean;
    toggleOne?: boolean;
    selectOne?: boolean;
}
/** The required inputs for the tablist. */
type TabListInputs = ListNavigationInputs<TabPattern> & Omit<ListSelectionInputs<TabPattern, string>, 'multi'> & ListFocusInputs<TabPattern> & {
    disabled: SignalLike<boolean>;
};
/** The required inputs for the tabpanel. */
interface TabPanelInputs {
    id: SignalLike<string>;
    tab: SignalLike<TabPattern | undefined>;
    value: SignalLike<string>;
}
/** A tabpanel associated with a tab. */
declare class TabPanelPattern {
    /** A global unique identifier for the tabpanel. */
    id: SignalLike<string>;
    /** A local unique identifier for the tabpanel. */
    value: SignalLike<string>;
    /** A reference to the corresponding tab. */
    tab: SignalLike<TabPattern | undefined>;
    /** Whether the tabpanel is hidden. */
    hidden: i0.Signal<boolean>;
    constructor(inputs: TabPanelInputs);
}
/** Controls the state of a tablist. */
declare class TabListPattern {
    readonly inputs: TabListInputs;
    /** Controls navigation for the tablist. */
    navigation: ListNavigation<TabPattern>;
    /** Controls selection for the tablist. */
    selection: ListSelection<TabPattern, string>;
    /** Controls focus for the tablist. */
    focusManager: ListFocus<TabPattern>;
    /** Whether the tablist is vertically or horizontally oriented. */
    orientation: SignalLike<'vertical' | 'horizontal'>;
    /** Whether the tablist is disabled. */
    disabled: SignalLike<boolean>;
    /** The tabindex of the tablist. */
    tabindex: i0.Signal<0 | -1>;
    /** The id of the current active tab. */
    activedescendant: i0.Signal<string | undefined>;
    followFocus: i0.Signal<boolean>;
    /** The key used to navigate to the previous tab in the tablist. */
    prevKey: i0.Signal<"ArrowUp" | "ArrowRight" | "ArrowLeft">;
    /** The key used to navigate to the next item in the list. */
    nextKey: i0.Signal<"ArrowRight" | "ArrowLeft" | "ArrowDown">;
    /** The keydown event manager for the tablist. */
    keydown: i0.Signal<KeyboardEventManager<KeyboardEvent>>;
    /** The pointerdown event manager for the tablist. */
    pointerdown: i0.Signal<PointerEventManager<PointerEvent>>;
    constructor(inputs: TabListInputs);
    /** Handles keydown events for the tablist. */
    onKeydown(event: KeyboardEvent): void;
    /** The pointerdown event manager for the tablist. */
    onPointerdown(event: PointerEvent): void;
    /** Navigates to the first option in the tablist. */
    first(opts?: SelectOptions): void;
    /** Navigates to the last option in the tablist. */
    last(opts?: SelectOptions): void;
    /** Navigates to the next option in the tablist. */
    next(opts?: SelectOptions): void;
    /** Navigates to the previous option in the tablist. */
    prev(opts?: SelectOptions): void;
    /** Navigates to the given item in the tablist. */
    goto(event: PointerEvent, opts?: SelectOptions): void;
    /** Handles updating selection for the tablist. */
    private _updateSelection;
    private _getItem;
}

export { TabPattern as a, TabPanelPattern as d, TabListPattern as e };
export type { TabInputs as T, TabListInputs as b, TabPanelInputs as c };
