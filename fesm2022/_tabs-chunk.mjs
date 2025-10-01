import { computed } from '@angular/core';
import { ExpansionControl, ListExpansion } from './_expansion-chunk.mjs';
import { List } from './_list-chunk.mjs';
import { KeyboardEventManager, PointerEventManager } from './_pointer-event-manager-chunk.mjs';

/** Controls label and description of an element. */
class LabelControl {
    inputs;
    /** The `aria-label`. */
    label = computed(() => this.inputs.label?.());
    /** The `aria-labelledby` ids. */
    labelledBy = computed(() => {
        const label = this.label();
        const labelledBy = this.inputs.labelledBy?.();
        const defaultLabelledBy = this.inputs.defaultLabelledBy();
        if (labelledBy && labelledBy.length > 0) {
            return labelledBy;
        }
        // If an aria-label is provided by developers, do not set aria-labelledby with the
        // defaultLabelledBy value because if both attributes are set, aria-labelledby will be used.
        if (label) {
            return [];
        }
        return defaultLabelledBy;
    });
    constructor(inputs) {
        this.inputs = inputs;
    }
}

/** A tab in a tablist. */
class TabPattern {
    inputs;
    /** Controls expansion for this tab. */
    expansion;
    /** A global unique identifier for the tab. */
    id;
    /** The index of the tab. */
    index = computed(() => this.inputs.tablist().inputs.items().indexOf(this));
    /** A local unique identifier for the tab. */
    value;
    /** Whether the tab is disabled. */
    disabled;
    /** The html element that should receive focus. */
    element;
    /** The text used by the typeahead search. */
    searchTerm = () => ''; // Unused because tabs do not support typeahead.
    /** Whether this tab has expandable content. */
    expandable = computed(() => this.expansion.expandable());
    /** The unique identifier used by the expansion behavior. */
    expansionId = computed(() => this.expansion.expansionId());
    /** Whether the tab is expanded. */
    expanded = computed(() => this.expansion.isExpanded());
    /** Whether the tab is active. */
    active = computed(() => this.inputs.tablist().inputs.activeItem() === this);
    /** Whether the tab is selected. */
    selected = computed(() => !!this.inputs.tablist().inputs.value().includes(this.value()));
    /** The tabindex of the tab. */
    tabindex = computed(() => this.inputs.tablist().listBehavior.getItemTabindex(this));
    /** The id of the tabpanel associated with the tab. */
    controls = computed(() => this.inputs.tabpanel()?.id());
    constructor(inputs) {
        this.inputs = inputs;
        this.id = inputs.id;
        this.value = inputs.value;
        this.disabled = inputs.disabled;
        this.element = inputs.element;
        this.expansion = new ExpansionControl({
            ...inputs,
            expansionId: inputs.value,
            expandable: () => true,
            expansionManager: inputs.tablist().expansionManager,
        });
    }
}
/** A tabpanel associated with a tab. */
class TabPanelPattern {
    inputs;
    /** A global unique identifier for the tabpanel. */
    id;
    /** A local unique identifier for the tabpanel. */
    value;
    /** Controls label for this tabpanel. */
    labelManager;
    /** Whether the tabpanel is hidden. */
    hidden = computed(() => this.inputs.tab()?.expanded() === false);
    /** The tabindex of this tabpanel. */
    tabindex = computed(() => (this.hidden() ? -1 : 0));
    /** The aria-labelledby value for this tabpanel. */
    labelledBy = computed(() => this.labelManager.labelledBy().length > 0
        ? this.labelManager.labelledBy().join(' ')
        : undefined);
    constructor(inputs) {
        this.inputs = inputs;
        this.id = inputs.id;
        this.value = inputs.value;
        this.labelManager = new LabelControl({
            ...inputs,
            defaultLabelledBy: computed(() => (this.inputs.tab() ? [this.inputs.tab().id()] : [])),
        });
    }
}
/** Controls the state of a tablist. */
class TabListPattern {
    inputs;
    /** The list behavior for the tablist. */
    listBehavior;
    /** Controls expansion for the tablist. */
    expansionManager;
    /** Whether the tablist is vertically or horizontally oriented. */
    orientation;
    /** Whether the tablist is disabled. */
    disabled;
    /** The tabindex of the tablist. */
    tabindex = computed(() => this.listBehavior.tabindex());
    /** The id of the current active tab. */
    activedescendant = computed(() => this.listBehavior.activedescendant());
    /** Whether selection should follow focus. */
    followFocus = computed(() => this.inputs.selectionMode() === 'follow');
    /** The key used to navigate to the previous tab in the tablist. */
    prevKey = computed(() => {
        if (this.inputs.orientation() === 'vertical') {
            return 'ArrowUp';
        }
        return this.inputs.textDirection() === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
    });
    /** The key used to navigate to the next item in the list. */
    nextKey = computed(() => {
        if (this.inputs.orientation() === 'vertical') {
            return 'ArrowDown';
        }
        return this.inputs.textDirection() === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
    });
    /** The keydown event manager for the tablist. */
    keydown = computed(() => {
        return new KeyboardEventManager()
            .on(this.prevKey, () => this.listBehavior.prev({ select: this.followFocus() }))
            .on(this.nextKey, () => this.listBehavior.next({ select: this.followFocus() }))
            .on('Home', () => this.listBehavior.first({ select: this.followFocus() }))
            .on('End', () => this.listBehavior.last({ select: this.followFocus() }))
            .on(' ', () => this.listBehavior.select())
            .on('Enter', () => this.listBehavior.select());
    });
    /** The pointerdown event manager for the tablist. */
    pointerdown = computed(() => {
        return new PointerEventManager().on(e => this.listBehavior.goto(this._getItem(e), { select: true }));
    });
    constructor(inputs) {
        this.inputs = inputs;
        this.disabled = inputs.disabled;
        this.orientation = inputs.orientation;
        this.listBehavior = new List({
            ...inputs,
            multi: () => false,
            typeaheadDelay: () => 0, // Tabs do not support typeahead.
        });
        this.expansionManager = new ListExpansion({
            ...inputs,
            multiExpandable: () => false,
            expandedIds: this.inputs.value,
        });
    }
    /**
     * Sets the tablist to its default initial state.
     *
     * Sets the active index of the tablist to the first focusable selected
     * tab if one exists. Otherwise, sets focus to the first focusable tab.
     *
     * This method should be called once the tablist and its tabs are properly initialized.
     */
    setDefaultState() {
        let firstItem;
        for (const item of this.inputs.items()) {
            if (!this.listBehavior.isFocusable(item))
                continue;
            if (firstItem === undefined) {
                firstItem = item;
            }
            if (item.selected()) {
                this.inputs.activeItem.set(item);
                return;
            }
        }
        if (firstItem !== undefined) {
            this.inputs.activeItem.set(firstItem);
        }
    }
    /** Handles keydown events for the tablist. */
    onKeydown(event) {
        if (!this.disabled()) {
            this.keydown().handle(event);
        }
    }
    /** The pointerdown event manager for the tablist. */
    onPointerdown(event) {
        if (!this.disabled()) {
            this.pointerdown().handle(event);
        }
    }
    /** Returns the tab item associated with the given pointer event. */
    _getItem(e) {
        if (!(e.target instanceof HTMLElement)) {
            return;
        }
        const element = e.target.closest('[role="tab"]');
        return this.inputs.items().find(i => i.element() === element);
    }
}

export { TabListPattern, TabPanelPattern, TabPattern };
//# sourceMappingURL=_tabs-chunk.mjs.map
