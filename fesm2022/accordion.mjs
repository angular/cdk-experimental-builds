import * as i0 from '@angular/core';
import { inject, input, signal, afterRenderEffect, Directive, ElementRef, booleanAttribute, computed, contentChildren, model } from '@angular/core';
import { _IdGenerator } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import * as i1 from '@angular/cdk-experimental/deferred-content';
import { DeferredContentAware, DeferredContent } from '@angular/cdk-experimental/deferred-content';
import { A as AccordionPanelPattern, a as AccordionTriggerPattern, b as AccordionGroupPattern } from './accordion-CN4PcmAh.mjs';
import './list-focus-BXQdAA3i.mjs';
import './expansion-C9iQLHOG.mjs';

/**
 * Represents the content panel of an accordion item. It is controlled by an
 * associated `CdkAccordionTrigger`.
 */
class CdkAccordionPanel {
    /** The DeferredContentAware host directive. */
    _deferredContentAware = inject(DeferredContentAware);
    /** A global unique identifier for the panel. */
    _id = inject(_IdGenerator).getId('cdk-accordion-trigger-');
    /** A local unique identifier for the panel, used to match with its trigger's value. */
    value = input.required(...(ngDevMode ? [{ debugName: "value" }] : []));
    /** The parent accordion trigger pattern that controls this panel. This is set by CdkAccordionGroup. */
    accordionTrigger = signal(undefined, ...(ngDevMode ? [{ debugName: "accordionTrigger" }] : []));
    /** The UI pattern instance for this panel. */
    pattern = new AccordionPanelPattern({
        id: () => this._id,
        value: this.value,
        accordionTrigger: () => this.accordionTrigger(),
    });
    constructor() {
        // Connect the panel's hidden state to the DeferredContentAware's visibility.
        afterRenderEffect(() => {
            this._deferredContentAware.contentVisible.set(!this.pattern.hidden());
        });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.2.0-next.0", ngImport: i0, type: CdkAccordionPanel, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.1.0", version: "20.2.0-next.0", type: CdkAccordionPanel, isStandalone: true, selector: "[cdkAccordionPanel]", inputs: { value: { classPropertyName: "value", publicName: "value", isSignal: true, isRequired: true, transformFunction: null } }, host: { attributes: { "role": "region" }, properties: { "attr.id": "pattern.id()", "attr.aria-labelledby": "pattern.accordionTrigger()?.id()", "attr.inert": "pattern.hidden() ? true : null" }, classAttribute: "cdk-accordion-panel" }, exportAs: ["cdkAccordionPanel"], hostDirectives: [{ directive: i1.DeferredContentAware, inputs: ["preserveContent", "preserveContent"] }], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.2.0-next.0", ngImport: i0, type: CdkAccordionPanel, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkAccordionPanel]',
                    exportAs: 'cdkAccordionPanel',
                    hostDirectives: [
                        {
                            directive: DeferredContentAware,
                            inputs: ['preserveContent'],
                        },
                    ],
                    host: {
                        'class': 'cdk-accordion-panel',
                        'role': 'region',
                        '[attr.id]': 'pattern.id()',
                        '[attr.aria-labelledby]': 'pattern.accordionTrigger()?.id()',
                        '[attr.inert]': 'pattern.hidden() ? true : null',
                    },
                }]
        }], ctorParameters: () => [] });
/**
 * Represents the trigger button for an accordion item. It controls the expansion
 * state of an associated `CdkAccordionPanel`.
 */
class CdkAccordionTrigger {
    /** A global unique identifier for the trigger. */
    _id = inject(_IdGenerator).getId('cdk-accordion-trigger-');
    /** A reference to the trigger element. */
    _elementRef = inject(ElementRef);
    /** The parent CdkAccordionGroup. */
    _accordionGroup = inject(CdkAccordionGroup);
    /** A local unique identifier for the trigger, used to match with its panel's value. */
    value = input.required(...(ngDevMode ? [{ debugName: "value" }] : []));
    /** Whether the trigger is disabled. */
    disabled = input(false, ...(ngDevMode ? [{ debugName: "disabled", transform: booleanAttribute }] : [{ transform: booleanAttribute }]));
    /**
     * Whether this trigger is completely inaccessible.
     *
     * TODO(ok7sai): Consider move this to UI patterns.
     */
    hardDisabled = computed(() => this.pattern.disabled() && this.pattern.tabindex() < 0, ...(ngDevMode ? [{ debugName: "hardDisabled" }] : []));
    /** The accordion panel pattern controlled by this trigger. This is set by CdkAccordionGroup. */
    accordionPanel = signal(undefined, ...(ngDevMode ? [{ debugName: "accordionPanel" }] : []));
    /** The UI pattern instance for this trigger. */
    pattern = new AccordionTriggerPattern({
        id: () => this._id,
        value: this.value,
        disabled: this.disabled,
        element: () => this._elementRef.nativeElement,
        accordionGroup: computed(() => this._accordionGroup.pattern),
        accordionPanel: this.accordionPanel,
    });
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.2.0-next.0", ngImport: i0, type: CdkAccordionTrigger, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.1.0", version: "20.2.0-next.0", type: CdkAccordionTrigger, isStandalone: true, selector: "[cdkAccordionTrigger]", inputs: { value: { classPropertyName: "value", publicName: "value", isSignal: true, isRequired: true, transformFunction: null }, disabled: { classPropertyName: "disabled", publicName: "disabled", isSignal: true, isRequired: false, transformFunction: null } }, host: { attributes: { "role": "button" }, listeners: { "keydown": "pattern.onKeydown($event)", "pointerdown": "pattern.onPointerdown($event)", "focusin": "pattern.onFocus($event)" }, properties: { "class.cdk-active": "pattern.active()", "id": "pattern.id()", "attr.aria-expanded": "pattern.expanded()", "attr.aria-controls": "pattern.controls()", "attr.aria-disabled": "pattern.disabled()", "attr.inert": "hardDisabled() ? true : null", "attr.disabled": "hardDisabled() ? true : null", "attr.tabindex": "pattern.tabindex()" }, classAttribute: "cdk-accordion-trigger" }, exportAs: ["cdkAccordionTrigger"], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.2.0-next.0", ngImport: i0, type: CdkAccordionTrigger, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkAccordionTrigger]',
                    exportAs: 'cdkAccordionTrigger',
                    host: {
                        'class': 'cdk-accordion-trigger',
                        '[class.cdk-active]': 'pattern.active()',
                        'role': 'button',
                        '[id]': 'pattern.id()',
                        '[attr.aria-expanded]': 'pattern.expanded()',
                        '[attr.aria-controls]': 'pattern.controls()',
                        '[attr.aria-disabled]': 'pattern.disabled()',
                        '[attr.inert]': 'hardDisabled() ? true : null',
                        '[attr.disabled]': 'hardDisabled() ? true : null',
                        '[attr.tabindex]': 'pattern.tabindex()',
                        '(keydown)': 'pattern.onKeydown($event)',
                        '(pointerdown)': 'pattern.onPointerdown($event)',
                        '(focusin)': 'pattern.onFocus($event)',
                    },
                }]
        }] });
/**
 * Container for a group of accordion items. It manages the overall state and
 * interactions of the accordion, such as keyboard navigation and expansion mode.
 */
class CdkAccordionGroup {
    /** The CdkAccordionTriggers nested inside this group. */
    _triggers = contentChildren(CdkAccordionTrigger, ...(ngDevMode ? [{ debugName: "_triggers", descendants: true }] : [{ descendants: true }]));
    /** The CdkAccordionPanels nested inside this group. */
    _panels = contentChildren(CdkAccordionPanel, ...(ngDevMode ? [{ debugName: "_panels", descendants: true }] : [{ descendants: true }]));
    /** The text direction (ltr or rtl). */
    textDirection = inject(Directionality).valueSignal;
    /** Whether the entire accordion group is disabled. */
    disabled = input(false, ...(ngDevMode ? [{ debugName: "disabled", transform: booleanAttribute }] : [{ transform: booleanAttribute }]));
    /** Whether multiple accordion items can be expanded simultaneously. */
    multiExpandable = input(true, ...(ngDevMode ? [{ debugName: "multiExpandable", transform: booleanAttribute }] : [{ transform: booleanAttribute }]));
    /** The values of the current selected/expanded accordions. */
    value = model([], ...(ngDevMode ? [{ debugName: "value" }] : []));
    /** Whether disabled items should be skipped during keyboard navigation. */
    skipDisabled = input(true, ...(ngDevMode ? [{ debugName: "skipDisabled", transform: booleanAttribute }] : [{ transform: booleanAttribute }]));
    /** Whether keyboard navigation should wrap around from the last item to the first, and vice-versa. */
    wrap = input(false, ...(ngDevMode ? [{ debugName: "wrap", transform: booleanAttribute }] : [{ transform: booleanAttribute }]));
    /** The UI pattern instance for this accordion group. */
    pattern = new AccordionGroupPattern({
        ...this,
        // TODO(ok7sai): Consider making `activeIndex` an internal state in the pattern and call
        // `setDefaultState` in the CDK.
        activeIndex: signal(0),
        items: computed(() => this._triggers().map(trigger => trigger.pattern)),
        expandedIds: this.value,
        // TODO(ok7sai): Investigate whether an accordion should support horizontal mode.
        orientation: () => 'vertical',
    });
    constructor() {
        // Effect to link triggers with their corresponding panels and update the group's items.
        afterRenderEffect(() => {
            const triggers = this._triggers();
            const panels = this._panels();
            for (const trigger of triggers) {
                const panel = panels.find(p => p.value() === trigger.value());
                trigger.accordionPanel.set(panel?.pattern);
                if (panel) {
                    panel.accordionTrigger.set(trigger.pattern);
                }
            }
        });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.2.0-next.0", ngImport: i0, type: CdkAccordionGroup, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.2.0", version: "20.2.0-next.0", type: CdkAccordionGroup, isStandalone: true, selector: "[cdkAccordionGroup]", inputs: { disabled: { classPropertyName: "disabled", publicName: "disabled", isSignal: true, isRequired: false, transformFunction: null }, multiExpandable: { classPropertyName: "multiExpandable", publicName: "multiExpandable", isSignal: true, isRequired: false, transformFunction: null }, value: { classPropertyName: "value", publicName: "value", isSignal: true, isRequired: false, transformFunction: null }, skipDisabled: { classPropertyName: "skipDisabled", publicName: "skipDisabled", isSignal: true, isRequired: false, transformFunction: null }, wrap: { classPropertyName: "wrap", publicName: "wrap", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { value: "valueChange" }, host: { classAttribute: "cdk-accordion-group" }, queries: [{ propertyName: "_triggers", predicate: CdkAccordionTrigger, descendants: true, isSignal: true }, { propertyName: "_panels", predicate: CdkAccordionPanel, descendants: true, isSignal: true }], exportAs: ["cdkAccordionGroup"], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.2.0-next.0", ngImport: i0, type: CdkAccordionGroup, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkAccordionGroup]',
                    exportAs: 'cdkAccordionGroup',
                    host: {
                        'class': 'cdk-accordion-group',
                    },
                }]
        }], ctorParameters: () => [] });
/**
 * A structural directive that marks the `ng-template` to be used as the content
 * for a `CdkAccordionPanel`. This content can be lazily loaded.
 */
class CdkAccordionContent {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.2.0-next.0", ngImport: i0, type: CdkAccordionContent, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "20.2.0-next.0", type: CdkAccordionContent, isStandalone: true, selector: "ng-template[cdkAccordionContent]", hostDirectives: [{ directive: i1.DeferredContent }], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.2.0-next.0", ngImport: i0, type: CdkAccordionContent, decorators: [{
            type: Directive,
            args: [{
                    selector: 'ng-template[cdkAccordionContent]',
                    hostDirectives: [DeferredContent],
                }]
        }] });

export { CdkAccordionContent, CdkAccordionGroup, CdkAccordionPanel, CdkAccordionTrigger };
//# sourceMappingURL=accordion.mjs.map
