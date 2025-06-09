import * as i0 from '@angular/core';
import { L as ListNavigationInputs, a as ListFocusInputs, b as ListNavigation, d as ListFocus, e as ListNavigationItem, f as ListFocusItem, S as SignalLike, K as KeyboardEventManager, P as PointerEventManager } from './list-navigation.d-Br99p_2O.js';
import { L as ListExpansionInputs, a as ListExpansion, E as ExpansionItem, b as ExpansionControl } from './expansion.d-DB4i_1Aa.js';

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
type AccordionTriggerInputs = ListNavigationItem & ListFocusItem & Omit<ExpansionItem, 'expansionId' | 'expandable'> & {
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
    active: i0.Signal<boolean>;
    /** Id of the accordion panel controlled by the trigger. */
    controls: i0.Signal<string | undefined>;
    /** The tabindex of the trigger. */
    tabindex: i0.Signal<-1 | 0>;
    /** Whether the trigger is disabled. Disabling an accordion group disables all the triggers. */
    disabled: i0.Signal<boolean>;
    constructor(inputs: AccordionTriggerInputs);
    /** The key used to navigate to the previous accordion trigger. */
    prevKey: i0.Signal<"ArrowUp" | "ArrowRight" | "ArrowLeft">;
    /** The key used to navigate to the next accordion trigger. */
    nextKey: i0.Signal<"ArrowRight" | "ArrowLeft" | "ArrowDown">;
    /** The keydown event manager for the accordion trigger. */
    keydown: i0.Signal<KeyboardEventManager<KeyboardEvent>>;
    /** The pointerdown event manager for the accordion trigger. */
    pointerdown: i0.Signal<PointerEventManager<PointerEvent>>;
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

export { AccordionGroupPattern as a, AccordionTriggerPattern as c, AccordionPanelPattern as e };
export type { AccordionGroupInputs as A, AccordionTriggerInputs as b, AccordionPanelInputs as d };
