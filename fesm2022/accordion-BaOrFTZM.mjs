import { computed } from '@angular/core';
import { ListExpansion, ExpansionControl } from './expansion-B3kmlWCY.mjs';
import { ListFocus, ListNavigation, KeyboardEventManager, PointerEventManager } from './list-navigation-DFutf3ha.mjs';

const focusMode = () => 'roving';
/** A pattern controls the nested Accordions. */
class AccordionGroupPattern {
    inputs;
    /** Controls navigation for the group. */
    navigation;
    /** Controls focus for the group. */
    focusManager;
    /** Controls expansion for the group. */
    expansionManager;
    constructor(inputs) {
        this.inputs = inputs;
        this.wrap = inputs.wrap;
        this.orientation = inputs.orientation;
        this.textDirection = inputs.textDirection;
        this.activeItem = inputs.activeItem;
        this.disabled = inputs.disabled;
        this.multiExpandable = inputs.multiExpandable;
        this.items = inputs.items;
        this.expandedIds = inputs.expandedIds;
        this.skipDisabled = inputs.skipDisabled;
        this.focusManager = new ListFocus({
            ...inputs,
            focusMode,
        });
        this.navigation = new ListNavigation({
            ...inputs,
            focusMode,
            focusManager: this.focusManager,
        });
        this.expansionManager = new ListExpansion({
            ...inputs,
        });
    }
}
/** A pattern controls the expansion state of an accordion. */
class AccordionTriggerPattern {
    inputs;
    /** Whether this tab has expandable content. */
    expandable;
    /** The unique identifier used by the expansion behavior. */
    expansionId;
    /** Whether an accordion is expanded. */
    expanded;
    /** Controls the expansion state for the trigger. */
    expansionControl;
    /** Whether the trigger is active. */
    active = computed(() => this.inputs.accordionGroup().activeItem() === this);
    /** Id of the accordion panel controlled by the trigger. */
    controls = computed(() => this.inputs.accordionPanel()?.id());
    /** The tabindex of the trigger. */
    tabindex = computed(() => (this.inputs.accordionGroup().focusManager.isFocusable(this) ? 0 : -1));
    /** Whether the trigger is disabled. Disabling an accordion group disables all the triggers. */
    disabled = computed(() => this.inputs.disabled() || this.inputs.accordionGroup().disabled());
    /** The index of the trigger within its accordion group. */
    index = computed(() => this.inputs.accordionGroup().items().indexOf(this));
    constructor(inputs) {
        this.inputs = inputs;
        this.id = inputs.id;
        this.element = inputs.element;
        this.value = inputs.value;
        this.accordionGroup = inputs.accordionGroup;
        this.accordionPanel = inputs.accordionPanel;
        this.expansionControl = new ExpansionControl({
            ...inputs,
            expansionId: inputs.value,
            expandable: () => true,
            expansionManager: inputs.accordionGroup().expansionManager,
        });
        this.expandable = this.expansionControl.isExpandable;
        this.expansionId = this.expansionControl.expansionId;
        this.expanded = this.expansionControl.isExpanded;
    }
    /** The key used to navigate to the previous accordion trigger. */
    prevKey = computed(() => {
        if (this.inputs.accordionGroup().orientation() === 'vertical') {
            return 'ArrowUp';
        }
        return this.inputs.accordionGroup().textDirection() === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
    });
    /** The key used to navigate to the next accordion trigger. */
    nextKey = computed(() => {
        if (this.inputs.accordionGroup().orientation() === 'vertical') {
            return 'ArrowDown';
        }
        return this.inputs.accordionGroup().textDirection() === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
    });
    /** The keydown event manager for the accordion trigger. */
    keydown = computed(() => {
        return new KeyboardEventManager()
            .on(this.prevKey, () => this.accordionGroup().navigation.prev())
            .on(this.nextKey, () => this.accordionGroup().navigation.next())
            .on('Home', () => this.accordionGroup().navigation.first())
            .on('End', () => this.accordionGroup().navigation.last())
            .on(' ', () => this.expansionControl.toggle())
            .on('Enter', () => this.expansionControl.toggle());
    });
    /** The pointerdown event manager for the accordion trigger. */
    pointerdown = computed(() => {
        return new PointerEventManager().on(e => {
            const item = this._getItem(e);
            if (item) {
                this.accordionGroup().navigation.goto(item);
                this.expansionControl.toggle();
            }
        });
    });
    /** Handles keydown events on the trigger, delegating to the group if not disabled. */
    onKeydown(event) {
        this.keydown().handle(event);
    }
    /** Handles pointerdown events on the trigger, delegating to the group if not disabled. */
    onPointerdown(event) {
        this.pointerdown().handle(event);
    }
    /** Handles focus events on the trigger. This ensures the tabbing changes the active index. */
    onFocus(event) {
        const item = this._getItem(event);
        if (item && this.inputs.accordionGroup().focusManager.isFocusable(item)) {
            this.accordionGroup().focusManager.focus(item);
        }
    }
    _getItem(e) {
        if (!(e.target instanceof HTMLElement)) {
            return;
        }
        const element = e.target.closest('[role="button"]');
        return this.accordionGroup()
            .items()
            .find(i => i.element() === element);
    }
}
/** Represents an accordion panel. */
class AccordionPanelPattern {
    inputs;
    /** Whether the accordion panel is hidden. True if the associated trigger is not expanded. */
    hidden;
    constructor(inputs) {
        this.inputs = inputs;
        this.id = inputs.id;
        this.value = inputs.value;
        this.accordionTrigger = inputs.accordionTrigger;
        this.hidden = computed(() => inputs.accordionTrigger()?.expanded() === false);
    }
}

export { AccordionGroupPattern, AccordionPanelPattern, AccordionTriggerPattern };
//# sourceMappingURL=accordion-BaOrFTZM.mjs.map
