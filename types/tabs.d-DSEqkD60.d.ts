import * as _angular_core from '@angular/core';
import { KeyboardEventManager, PointerEventManager } from './pointer-event-manager.d-DxLZK1bd.js';
import { ExpansionItem, ExpansionControl, ListExpansionInputs, ListExpansion } from './expansion.d-Bk5hojv9.js';
import { SignalLike } from './list-navigation.d-v7LRaIQt.js';
import { ListItem, ListInputs, List } from './list.d-CgeCwpQa.js';

/** Represents the required inputs for the label control. */
interface LabelControlInputs {
    /** The default `aria-labelledby` ids. */
    defaultLabelledBy: SignalLike<string[]>;
}
/** Represents the optional inputs for the label control. */
interface LabelControlOptionalInputs {
    /** The `aria-label`. */
    label?: SignalLike<string | undefined>;
    /** The user-provided `aria-labelledby` ids. */
    labelledBy?: SignalLike<string[]>;
}
/** Controls label and description of an element. */
declare class LabelControl {
    readonly inputs: LabelControlInputs & LabelControlOptionalInputs;
    /** The `aria-label`. */
    readonly label: _angular_core.Signal<string | undefined>;
    /** The `aria-labelledby` ids. */
    readonly labelledBy: _angular_core.Signal<string[]>;
    constructor(inputs: LabelControlInputs & LabelControlOptionalInputs);
}

/** The required inputs to tabs. */
interface TabInputs extends Omit<ListItem<string>, 'searchTerm' | 'index'>, Omit<ExpansionItem, 'expansionId' | 'expandable'> {
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
    /** The index of the tab. */
    readonly index: _angular_core.Signal<number>;
    /** A local unique identifier for the tab. */
    readonly value: SignalLike<string>;
    /** Whether the tab is disabled. */
    readonly disabled: SignalLike<boolean>;
    /** The html element that should receive focus. */
    readonly element: SignalLike<HTMLElement>;
    /** The text used by the typeahead search. */
    readonly searchTerm: () => string;
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
interface TabPanelInputs extends LabelControlOptionalInputs {
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
    /** Controls label for this tabpanel. */
    readonly labelManager: LabelControl;
    /** Whether the tabpanel is hidden. */
    readonly hidden: _angular_core.Signal<boolean>;
    /** The tabindex of this tabpanel. */
    readonly tabindex: _angular_core.Signal<0 | -1>;
    /** The aria-labelledby value for this tabpanel. */
    readonly labelledBy: _angular_core.Signal<string | undefined>;
    constructor(inputs: TabPanelInputs);
}
/** The required inputs for the tablist. */
type TabListInputs = Omit<ListInputs<TabPattern, string>, 'multi' | 'typeaheadDelay'> & Omit<ListExpansionInputs, 'multiExpandable' | 'expandedIds' | 'items'>;
/** Controls the state of a tablist. */
declare class TabListPattern {
    readonly inputs: TabListInputs;
    /** The list behavior for the tablist. */
    readonly listBehavior: List<TabPattern, string>;
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
    /** Returns the tab item associated with the given pointer event. */
    private _getItem;
}

export { TabListPattern, TabPanelPattern, TabPattern };
export type { TabInputs, TabListInputs, TabPanelInputs };
