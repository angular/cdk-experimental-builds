import * as _angular_core from '@angular/core';
import { KeyboardEventManager, PointerEventManager } from './pointer-event-manager.d-DxLZK1bd.js';
import { ListExpansionInputs, ListExpansion, ExpansionItem, ExpansionControl } from './expansion.d-D5S9iQY2.js';
import { ListNavigationInputs, ListFocusInputs, ListNavigation, ListFocus, ListNavigationItem, ListFocusItem, SignalLike } from './list-navigation.d-v7LRaIQt.js';

/** Inputs of the AccordionGroupPattern. */
type AccordionGroupInputs = Omit<ListNavigationInputs<AccordionTriggerPattern> & ListFocusInputs<AccordionTriggerPattern> & Omit<ListExpansionInputs, 'items'>, 'focusMode'>;
interface AccordionGroupPattern extends AccordionGroupInputs {
}
/** A pattern controls the nested Accordions. */
declare class AccordionGroupPattern {
    readonly inputs: AccordionGroupInputs;
    /** Controls navigation for the group. */
    navigation: ListNavigation<AccordionTriggerPattern>;
    /** Controls focus for the group. */
    focusManager: ListFocus<AccordionTriggerPattern>;
    /** Controls expansion for the group. */
    expansionManager: ListExpansion;
    constructor(inputs: AccordionGroupInputs);
}
/** Inputs for the AccordionTriggerPattern. */
type AccordionTriggerInputs = Omit<ListNavigationItem & ListFocusItem, 'index'> & Omit<ExpansionItem, 'expansionId' | 'expandable'> & {
    /** A local unique identifier for the trigger. */
    value: SignalLike<string>;
    /** The parent accordion group that controls this trigger. */
    accordionGroup: SignalLike<AccordionGroupPattern>;
    /** The accordion panel controlled by this trigger. */
    accordionPanel: SignalLike<AccordionPanelPattern | undefined>;
};
interface AccordionTriggerPattern extends AccordionTriggerInputs {
}
/** A pattern controls the expansion state of an accordion. */
declare class AccordionTriggerPattern {
    readonly inputs: AccordionTriggerInputs;
    /** Whether this tab has expandable content. */
    expandable: SignalLike<boolean>;
    /** The unique identifier used by the expansion behavior. */
    expansionId: SignalLike<string>;
    /** Whether an accordion is expanded. */
    expanded: SignalLike<boolean>;
    /** Controls the expansion state for the trigger. */
    expansionControl: ExpansionControl;
    /** Whether the trigger is active. */
    active: _angular_core.Signal<boolean>;
    /** Id of the accordion panel controlled by the trigger. */
    controls: _angular_core.Signal<string | undefined>;
    /** The tabindex of the trigger. */
    tabindex: _angular_core.Signal<-1 | 0>;
    /** Whether the trigger is disabled. Disabling an accordion group disables all the triggers. */
    disabled: _angular_core.Signal<boolean>;
    /** The index of the trigger within its accordion group. */
    index: _angular_core.Signal<number>;
    constructor(inputs: AccordionTriggerInputs);
    /** The key used to navigate to the previous accordion trigger. */
    prevKey: _angular_core.Signal<"ArrowUp" | "ArrowRight" | "ArrowLeft">;
    /** The key used to navigate to the next accordion trigger. */
    nextKey: _angular_core.Signal<"ArrowRight" | "ArrowLeft" | "ArrowDown">;
    /** The keydown event manager for the accordion trigger. */
    keydown: _angular_core.Signal<KeyboardEventManager<KeyboardEvent>>;
    /** The pointerdown event manager for the accordion trigger. */
    pointerdown: _angular_core.Signal<PointerEventManager<PointerEvent>>;
    /** Handles keydown events on the trigger, delegating to the group if not disabled. */
    onKeydown(event: KeyboardEvent): void;
    /** Handles pointerdown events on the trigger, delegating to the group if not disabled. */
    onPointerdown(event: PointerEvent): void;
    /** Handles focus events on the trigger. This ensures the tabbing changes the active index. */
    onFocus(event: FocusEvent): void;
    private _getItem;
}
/** Represents the required inputs for the AccordionPanelPattern. */
interface AccordionPanelInputs {
    /** A global unique identifier for the panel. */
    id: SignalLike<string>;
    /** A local unique identifier for the panel, matching its trigger's value. */
    value: SignalLike<string>;
    /** The parent accordion trigger that controls this panel. */
    accordionTrigger: SignalLike<AccordionTriggerPattern | undefined>;
}
interface AccordionPanelPattern extends AccordionPanelInputs {
}
/** Represents an accordion panel. */
declare class AccordionPanelPattern {
    readonly inputs: AccordionPanelInputs;
    /** Whether the accordion panel is hidden. True if the associated trigger is not expanded. */
    hidden: SignalLike<boolean>;
    constructor(inputs: AccordionPanelInputs);
}

export { AccordionGroupPattern, AccordionPanelPattern, AccordionTriggerPattern };
export type { AccordionGroupInputs, AccordionPanelInputs, AccordionTriggerInputs };
