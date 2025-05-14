import * as i0 from '@angular/core';
import { b as ListFocusItem, S as SignalLike, i as ListFocusInputs, W as WritableSignalLike, d as ListFocus, L as ListNavigationItem, a as ListSelectionItem, g as ListNavigationInputs, h as ListSelectionInputs, f as ListNavigation, e as ListSelection, K as KeyboardEventManager, P as PointerEventManager } from './list-navigation.d-DBM6WNf9.js';

/** Represents an item that can be expanded or collapsed. */
interface ExpansionItem extends ListFocusItem {
    /** Whether the item is expandable. */
    expandable: SignalLike<boolean>;
    /** Used to uniquely identify an expansion item. */
    expansionId: SignalLike<string>;
}
/** Represents the required inputs for an expansion behavior. */
interface ListExpansionInputs<T extends ExpansionItem> extends ListFocusInputs<T> {
    /** Whether multiple items can be expanded at once. */
    multiExpandable: SignalLike<boolean>;
    /** An array of ids of the currently expanded items. */
    expandedIds: WritableSignalLike<string[]>;
}
/** Manages the expansion state of a list of items. */
declare class ListExpansion<T extends ExpansionItem> {
    readonly inputs: ListExpansionInputs<T> & {
        focusManager: ListFocus<T>;
    };
    /** A signal holding an array of ids of the currently expanded items. */
    expandedIds: WritableSignalLike<string[]>;
    /** The currently active (focused) item in the list. */
    activeItem: i0.Signal<T>;
    constructor(inputs: ListExpansionInputs<T> & {
        focusManager: ListFocus<T>;
    });
    /** Opens the specified item, or the currently active item if none is specified. */
    open(item?: T): void;
    /** Closes the specified item, or the currently active item if none is specified. */
    close(item?: T): void;
    /**
     * Toggles the expansion state of the specified item,
     * or the currently active item if none is specified.
     */
    toggle(item?: T): void;
    /** Opens all focusable items in the list. */
    openAll(): void;
    /** Closes all focusable items in the list. */
    closeAll(): void;
    /** Checks whether the specified item is expandable / collapsible. */
    isExpandable(item: T): boolean;
    /** Checks whether the specified item is currently expanded. */
    isExpanded(item: T): boolean;
}

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
    /** A global unique identifier for the tab. */
    id: SignalLike<string>;
    /** A local unique identifier for the tab. */
    value: SignalLike<string>;
    /** Whether the tab is disabled. */
    disabled: SignalLike<boolean>;
    /** The html element that should receive focus. */
    element: SignalLike<HTMLElement>;
    /** Whether this tab has expandable content. */
    expandable: SignalLike<boolean>;
    /** The unique identifier used by the expansion behavior. */
    expansionId: SignalLike<string>;
    /** Whether the tab is expanded. */
    expanded: SignalLike<boolean>;
    /** Whether the tab is active. */
    active: i0.Signal<boolean>;
    /** Whether the tab is selected. */
    selected: i0.Signal<boolean>;
    /** The tabindex of the tab. */
    tabindex: i0.Signal<0 | -1>;
    /** The id of the tabpanel associated with the tab. */
    controls: i0.Signal<string | undefined>;
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
    id: SignalLike<string>;
    /** A local unique identifier for the tabpanel. */
    value: SignalLike<string>;
    /** Whether the tabpanel is hidden. */
    hidden: i0.Signal<boolean>;
    constructor(inputs: TabPanelInputs);
}
/** The selection operations that the tablist can perform. */
interface SelectOptions {
    select?: boolean;
}
/** The required inputs for the tablist. */
type TabListInputs = ListNavigationInputs<TabPattern> & Omit<ListSelectionInputs<TabPattern, string>, 'multi'> & ListFocusInputs<TabPattern> & Omit<ListExpansionInputs<TabPattern>, 'multiExpandable' | 'expandedIds'> & {
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
    /** Controls expansion for the tablist. */
    expansionManager: ListExpansion<TabPattern>;
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
    private _select;
    private _getItem;
}

export { TabPattern as a, TabPanelPattern as c, TabListPattern as e };
export type { TabInputs as T, TabPanelInputs as b, TabListInputs as d };
