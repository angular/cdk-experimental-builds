import * as _angular_core from '@angular/core';
import { e as ListNavigationItem, f as ListFocusItem, S as SignalLike, L as ListNavigationInputs, a as ListFocusInputs, b as ListNavigation, d as ListFocus, K as KeyboardEventManager, P as PointerEventManager } from './list-navigation.d-tcweHm4g.js';
import { L as ListSelectionItem, a as ListSelectionInputs, b as ListSelection } from './list-selection.d-BBLdeUeF.js';
import { E as ExpansionItem, b as ExpansionControl, L as ListExpansionInputs, a as ListExpansion } from './expansion.d-BvIuKvYU.js';

/** The required inputs to tabs. */
interface TabInputs extends ListNavigationItem, ListSelectionItem<string>, ListFocusItem, Omit<ExpansionItem, 'expansionId' | 'expandable'> {
    /** The parent tablist that controls the tab. */
    tablist: SignalLike<TabListPattern>;
    /** The remote tabpanel controlled by the tab. */
    tabpanel: SignalLike<TabPanelPattern | undefined>;
}
/** A tab in a tablist. */
declare class TabPattern {
    readonly inputs: TabInputs;
    /** Controls expansion for this tab. */
    readonly expansion: ExpansionControl;
    /** A global unique identifier for the tab. */
    readonly id: SignalLike<string>;
    /** A local unique identifier for the tab. */
    readonly value: SignalLike<string>;
    /** Whether the tab is disabled. */
    readonly disabled: SignalLike<boolean>;
    /** The html element that should receive focus. */
    readonly element: SignalLike<HTMLElement>;
    /** Whether this tab has expandable content. */
    readonly expandable: _angular_core.Signal<boolean>;
    /** The unique identifier used by the expansion behavior. */
    readonly expansionId: _angular_core.Signal<string>;
    /** Whether the tab is expanded. */
    readonly expanded: _angular_core.Signal<boolean>;
    /** Whether the tab is active. */
    readonly active: _angular_core.Signal<boolean>;
    /** Whether the tab is selected. */
    readonly selected: _angular_core.Signal<boolean>;
    /** The tabindex of the tab. */
    readonly tabindex: _angular_core.Signal<0 | -1>;
    /** The id of the tabpanel associated with the tab. */
    readonly controls: _angular_core.Signal<string | undefined>;
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
    readonly inputs: TabPanelInputs;
    /** A global unique identifier for the tabpanel. */
    readonly id: SignalLike<string>;
    /** A local unique identifier for the tabpanel. */
    readonly value: SignalLike<string>;
    /** Whether the tabpanel is hidden. */
    readonly hidden: _angular_core.Signal<boolean>;
    constructor(inputs: TabPanelInputs);
}
/** The selection operations that the tablist can perform. */
interface SelectOptions {
    select?: boolean;
}
/** The required inputs for the tablist. */
type TabListInputs = ListNavigationInputs<TabPattern> & Omit<ListSelectionInputs<TabPattern, string>, 'multi'> & ListFocusInputs<TabPattern> & Omit<ListExpansionInputs, 'multiExpandable' | 'expandedIds' | 'items'>;
/** Controls the state of a tablist. */
declare class TabListPattern {
    readonly inputs: TabListInputs;
    /** Controls navigation for the tablist. */
    readonly navigation: ListNavigation<TabPattern>;
    /** Controls selection for the tablist. */
    readonly selection: ListSelection<TabPattern, string>;
    /** Controls focus for the tablist. */
    readonly focusManager: ListFocus<TabPattern>;
    /** Controls expansion for the tablist. */
    readonly expansionManager: ListExpansion;
    /** Whether the tablist is vertically or horizontally oriented. */
    readonly orientation: SignalLike<'vertical' | 'horizontal'>;
    /** Whether the tablist is disabled. */
    readonly disabled: SignalLike<boolean>;
    /** The tabindex of the tablist. */
    readonly tabindex: _angular_core.Signal<0 | -1>;
    /** The id of the current active tab. */
    readonly activedescendant: _angular_core.Signal<string | undefined>;
    /** Whether selection should follow focus. */
    readonly followFocus: _angular_core.Signal<boolean>;
    /** The key used to navigate to the previous tab in the tablist. */
    readonly prevKey: _angular_core.Signal<"ArrowUp" | "ArrowRight" | "ArrowLeft">;
    /** The key used to navigate to the next item in the list. */
    readonly nextKey: _angular_core.Signal<"ArrowRight" | "ArrowLeft" | "ArrowDown">;
    /** The keydown event manager for the tablist. */
    readonly keydown: _angular_core.Signal<KeyboardEventManager<KeyboardEvent>>;
    /** The pointerdown event manager for the tablist. */
    readonly pointerdown: _angular_core.Signal<PointerEventManager<PointerEvent>>;
    constructor(inputs: TabListInputs);
    /**
     * Sets the tablist to its default initial state.
     *
     * Sets the active index of the tablist to the first focusable selected
     * tab if one exists. Otherwise, sets focus to the first focusable tab.
     *
     * This method should be called once the tablist and its tabs are properly initialized.
     */
    setDefaultState(): void;
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
    private _select;
    private _getItem;
}

export { TabPattern as a, TabPanelPattern as c, TabListPattern as e };
export type { TabInputs as T, TabPanelInputs as b, TabListInputs as d };
