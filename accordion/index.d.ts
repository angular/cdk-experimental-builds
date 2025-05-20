import * as _angular_cdk_bidi from '@angular/cdk/bidi';
import * as i0 from '@angular/core';
import { WritableSignal } from '@angular/core';
import { c as AccordionTriggerPattern, e as AccordionPanelPattern, a as AccordionGroupPattern } from '../accordion.d-B3UVyhWI.js';
import * as i1 from '@angular/cdk-experimental/deferred-content';
import '../list-navigation.d-Br99p_2O.js';
import '../expansion.d-DSLPa1yp.js';

/**
 * Represents the content panel of an accordion item. It is controlled by an
 * associated `CdkAccordionTrigger`.
 */
declare class CdkAccordionPanel {
    /** The DeferredContentAware host directive. */
    private readonly _deferredContentAware;
    /** A global unique identifier for the panel. */
    private readonly _id;
    /** A local unique identifier for the panel, used to match with its trigger's value. */
    value: i0.InputSignal<string>;
    /** The parent accordion trigger pattern that controls this panel. This is set by CdkAccordionGroup. */
    readonly accordionTrigger: WritableSignal<AccordionTriggerPattern | undefined>;
    /** The UI pattern instance for this panel. */
    readonly pattern: AccordionPanelPattern;
    constructor();
    static ɵfac: i0.ɵɵFactoryDeclaration<CdkAccordionPanel, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<CdkAccordionPanel, "[cdkAccordionPanel]", ["cdkAccordionPanel"], { "value": { "alias": "value"; "required": true; "isSignal": true; }; }, {}, never, never, true, [{ directive: typeof i1.DeferredContentAware; inputs: { "preserveContent": "preserveContent"; }; outputs: {}; }]>;
}
/**
 * Represents the trigger button for an accordion item. It controls the expansion
 * state of an associated `CdkAccordionPanel`.
 */
declare class CdkAccordionTrigger {
    /** A global unique identifier for the trigger. */
    private readonly _id;
    /** A reference to the trigger element. */
    private readonly _elementRef;
    /** The parent CdkAccordionGroup. */
    private readonly _accordionGroup;
    /** A local unique identifier for the trigger, used to match with its panel's value. */
    value: i0.InputSignal<string>;
    /** Whether the trigger is disabled. */
    disabled: i0.InputSignalWithTransform<boolean, unknown>;
    /** The accordion panel pattern controlled by this trigger. This is set by CdkAccordionGroup. */
    readonly accordionPanel: WritableSignal<AccordionPanelPattern | undefined>;
    /** The UI pattern instance for this trigger. */
    readonly pattern: AccordionTriggerPattern;
    static ɵfac: i0.ɵɵFactoryDeclaration<CdkAccordionTrigger, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<CdkAccordionTrigger, "[cdkAccordionTrigger]", ["cdkAccordionTrigger"], { "value": { "alias": "value"; "required": true; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}
/**
 * Container for a group of accordion items. It manages the overall state and
 * interactions of the accordion, such as keyboard navigation and expansion mode.
 */
declare class CdkAccordionGroup {
    /** The CdkAccordionTriggers nested inside this group. */
    protected readonly _triggers: i0.Signal<readonly CdkAccordionTrigger[]>;
    /** The CdkAccordionPanels nested inside this group. */
    protected readonly _panels: i0.Signal<readonly CdkAccordionPanel[]>;
    /** The text direction (ltr or rtl). */
    readonly textDirection: WritableSignal<_angular_cdk_bidi.Direction>;
    /** Whether the entire accordion group is disabled. */
    disabled: i0.InputSignalWithTransform<boolean, unknown>;
    /** Whether multiple accordion items can be expanded simultaneously. */
    multiExpandable: i0.InputSignalWithTransform<boolean, unknown>;
    /** The values of the current selected/expanded accordions. */
    value: i0.ModelSignal<string[]>;
    /** Whether disabled items should be skipped during keyboard navigation. */
    skipDisabled: i0.InputSignalWithTransform<boolean, unknown>;
    /** Whether keyboard navigation should wrap around from the last item to the first, and vice-versa. */
    wrap: i0.InputSignalWithTransform<boolean, unknown>;
    /** The UI pattern instance for this accordion group. */
    readonly pattern: AccordionGroupPattern;
    constructor();
    static ɵfac: i0.ɵɵFactoryDeclaration<CdkAccordionGroup, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<CdkAccordionGroup, "[cdkAccordionGroup]", ["cdkAccordionGroup"], { "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "multiExpandable": { "alias": "multiExpandable"; "required": false; "isSignal": true; }; "value": { "alias": "value"; "required": false; "isSignal": true; }; "skipDisabled": { "alias": "skipDisabled"; "required": false; "isSignal": true; }; "wrap": { "alias": "wrap"; "required": false; "isSignal": true; }; }, { "value": "valueChange"; }, ["_triggers", "_panels"], never, true, never>;
}
/**
 * A structural directive that marks the `ng-template` to be used as the content
 * for a `CdkAccordionPanel`. This content can be lazily loaded.
 */
declare class CdkAccordionContent {
    static ɵfac: i0.ɵɵFactoryDeclaration<CdkAccordionContent, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<CdkAccordionContent, "ng-template[cdkAccordionContent]", never, {}, {}, never, never, true, [{ directive: typeof i1.DeferredContent; inputs: {}; outputs: {}; }]>;
}

export { CdkAccordionContent, CdkAccordionGroup, CdkAccordionPanel, CdkAccordionTrigger };
