import * as i0 from '@angular/core';
import { S as SignalLike, L as ListNavigationItem, a as ListSelectionItem, b as ListFocusItem, f as ListNavigationInputs, g as ListSelectionInputs, h as ListFocusInputs, e as ListNavigation, d as ListSelection, c as ListFocus, K as KeyboardEventManager, P as PointerEventManager } from './list-navigation.d-mll4djs5.js';

/** Inputs for an Expansion control. */
interface ExpansionControlInputs {
    /** Whether an Expansion is visible. */
    visible: SignalLike<boolean>;
    /** The controlled Expansion panel. */
    expansionPanel: SignalLike<ExpansionPanel | undefined>;
}
/** Inputs for an Expansion panel. */
interface ExpansionPanelInputs {
    /** A unique identifier for the panel. */
    id: SignalLike<string>;
    /** The Expansion control. */
    expansionControl: SignalLike<ExpansionControl | undefined>;
}
/**
 * An Expansion control.
 *
 * Use Expansion behavior if a pattern has a collapsible view that has two elements rely on the
 * states from each other. For example
 *
 * ```html
 * <button aria-controls="remote-content" aria-expanded="false">Toggle Content</button>
 *
 * ...
 *
 * <div id="remote-content" aria-hidden="true">
 *  Collapsible content
 * </div>
 * ```
 */
declare class ExpansionControl {
    readonly inputs: ExpansionControlInputs;
    /** Whether an Expansion is visible. */
    visible: SignalLike<boolean>;
    /** The controllerd Expansion panel Id. */
    controls: i0.Signal<string | undefined>;
    constructor(inputs: ExpansionControlInputs);
}
/** A Expansion panel. */
declare class ExpansionPanel {
    readonly inputs: ExpansionPanelInputs;
    /** A unique identifier for the panel. */
    id: SignalLike<string>;
    /** Whether the panel is hidden. */
    hidden: i0.Signal<boolean>;
    constructor(inputs: ExpansionPanelInputs);
}

/** The required inputs to tabs. */
interface TabInputs extends ListNavigationItem, ListSelectionItem<string>, ListFocusItem {
    /** The parent tablist that controls the tab. */
    tablist: SignalLike<TabListPattern>;
    /** The remote tabpanel controlled by the tab. */
    tabpanel: SignalLike<TabPanelPattern | undefined>;
}
/** A tab in a tablist. */
declare class TabPattern {
    readonly inputs: TabInputs;
    /** A global unique identifier for the tab. */
    id: SignalLike<string>;
    /** A local unique identifier for the tab. */
    value: SignalLike<string>;
    /** Whether the tab is disabled. */
    disabled: SignalLike<boolean>;
    /** The html element that should receive focus. */
    element: SignalLike<HTMLElement>;
    /** Controls the expansion state for the tab.  */
    expansionControl: ExpansionControl;
    /** Whether the tab is active. */
    active: i0.Signal<boolean>;
    /** Whether the tab is selected. */
    selected: i0.Signal<boolean>;
    /** A tabpanel Id controlled by the tab. */
    controls: i0.Signal<string | undefined>;
    /** The tabindex of the tab. */
    tabindex: i0.Signal<0 | -1>;
    constructor(inputs: TabInputs);
}
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
    /** Represents the expansion state for the tabpanel.  */
    expansionPanel: ExpansionPanel;
    /** Whether the tabpanel is hidden. */
    hidden: i0.Signal<boolean>;
    constructor(inputs: TabPanelInputs);
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
    /** Whether selection should follow focus. */
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

export { TabPattern as T, TabPanelPattern as a, TabListPattern as b };
export type { TabInputs as c, TabPanelInputs as d, TabListInputs as e };
