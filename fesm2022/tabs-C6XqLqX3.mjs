import { computed } from '@angular/core';
import { K as KeyboardEventManager, P as PointerEventManager, L as ListFocus, a as ListNavigation, b as ListSelection } from './list-focus-CxzPwJEC.mjs';

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
class ExpansionControl {
    inputs;
    /** Whether an Expansion is visible. */
    visible;
    /** The controllerd Expansion panel Id. */
    controls = computed(() => this.inputs.expansionPanel()?.id());
    constructor(inputs) {
        this.inputs = inputs;
        this.visible = inputs.visible;
    }
}
/** A Expansion panel. */
class ExpansionPanel {
    inputs;
    /** A unique identifier for the panel. */
    id;
    /** Whether the panel is hidden. */
    hidden = computed(() => !this.inputs.expansionControl()?.visible());
    constructor(inputs) {
        this.inputs = inputs;
        this.id = inputs.id;
    }
}

/** A tab in a tablist. */
class TabPattern {
    inputs;
    /** A global unique identifier for the tab. */
    id;
    /** A local unique identifier for the tab. */
    value;
    /** Whether the tab is disabled. */
    disabled;
    /** The html element that should receive focus. */
    element;
    /** Controls the expansion state for the tab.  */
    expansionControl;
    /** Whether the tab is active. */
    active = computed(() => this.inputs.tablist().focusManager.activeItem() === this);
    /** Whether the tab is selected. */
    selected = computed(() => !!this.inputs.tablist().selection.inputs.value().includes(this.value()));
    /** A tabpanel Id controlled by the tab. */
    controls = computed(() => this.expansionControl.controls());
    /** The tabindex of the tab. */
    tabindex = computed(() => this.inputs.tablist().focusManager.getItemTabindex(this));
    constructor(inputs) {
        this.inputs = inputs;
        this.id = inputs.id;
        this.value = inputs.value;
        this.disabled = inputs.disabled;
        this.element = inputs.element;
        this.expansionControl = new ExpansionControl({
            visible: this.selected,
            expansionPanel: computed(() => inputs.tabpanel()?.expansionPanel),
        });
    }
}
/** A tabpanel associated with a tab. */
class TabPanelPattern {
    /** A global unique identifier for the tabpanel. */
    id;
    /** A local unique identifier for the tabpanel. */
    value;
    /** Represents the expansion state for the tabpanel.  */
    expansionPanel;
    /** Whether the tabpanel is hidden. */
    hidden = computed(() => this.expansionPanel.hidden());
    constructor(inputs) {
        this.id = inputs.id;
        this.value = inputs.value;
        this.expansionPanel = new ExpansionPanel({
            id: inputs.id,
            expansionControl: computed(() => inputs.tab()?.expansionControl),
        });
    }
}
/** Controls the state of a tablist. */
class TabListPattern {
    inputs;
    /** Controls navigation for the tablist. */
    navigation;
    /** Controls selection for the tablist. */
    selection;
    /** Controls focus for the tablist. */
    focusManager;
    /** Whether the tablist is vertically or horizontally oriented. */
    orientation;
    /** Whether the tablist is disabled. */
    disabled;
    /** The tabindex of the tablist. */
    tabindex = computed(() => this.focusManager.getListTabindex());
    /** The id of the current active tab. */
    activedescendant = computed(() => this.focusManager.getActiveDescendant());
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
        const manager = new KeyboardEventManager()
            .on(this.prevKey, () => this.prev({ selectOne: this.followFocus() }))
            .on(this.nextKey, () => this.next({ selectOne: this.followFocus() }))
            .on('Home', () => this.first({ selectOne: this.followFocus() }))
            .on('End', () => this.last({ selectOne: this.followFocus() }))
            .on(' ', () => this.selection.selectOne())
            .on('Enter', () => this.selection.selectOne());
        return manager;
    });
    /** The pointerdown event manager for the tablist. */
    pointerdown = computed(() => {
        return new PointerEventManager().on(e => this.goto(e, { selectOne: true }));
    });
    constructor(inputs) {
        this.inputs = inputs;
        this.disabled = inputs.disabled;
        this.orientation = inputs.orientation;
        this.focusManager = new ListFocus(inputs);
        this.navigation = new ListNavigation({ ...inputs, focusManager: this.focusManager });
        this.selection = new ListSelection({
            ...inputs,
            multi: () => false,
            focusManager: this.focusManager,
        });
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
    /** Navigates to the first option in the tablist. */
    first(opts) {
        this.navigation.first();
        this._updateSelection(opts);
    }
    /** Navigates to the last option in the tablist. */
    last(opts) {
        this.navigation.last();
        this._updateSelection(opts);
    }
    /** Navigates to the next option in the tablist. */
    next(opts) {
        this.navigation.next();
        this._updateSelection(opts);
    }
    /** Navigates to the previous option in the tablist. */
    prev(opts) {
        this.navigation.prev();
        this._updateSelection(opts);
    }
    /** Navigates to the given item in the tablist. */
    goto(event, opts) {
        const item = this._getItem(event);
        if (item) {
            this.navigation.goto(item);
            this._updateSelection(opts);
        }
    }
    /** Handles updating selection for the tablist. */
    _updateSelection(opts) {
        if (opts?.select) {
            this.selection.select();
        }
        if (opts?.toggle) {
            this.selection.toggle();
        }
        if (opts?.toggleOne) {
            this.selection.toggleOne();
        }
        if (opts?.selectOne) {
            this.selection.selectOne();
        }
    }
    _getItem(e) {
        if (!(e.target instanceof HTMLElement)) {
            return;
        }
        const element = e.target.closest('[role="tab"]');
        return this.inputs.items().find(i => i.element() === element);
    }
}

export { TabListPattern as T, TabPattern as a, TabPanelPattern as b };
//# sourceMappingURL=tabs-C6XqLqX3.mjs.map
