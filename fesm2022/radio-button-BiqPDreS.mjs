import { computed } from '@angular/core';
import { L as ListFocus, a as ListNavigation, K as KeyboardEventManager, P as PointerEventManager } from './list-focus-BXQdAA3i.mjs';
import { L as ListSelection } from './list-selection-C41ApAbt.mjs';

/** Controls the state of a radio group. */
class RadioGroupPattern {
    inputs;
    /** Controls navigation for the radio group. */
    navigation;
    /** Controls selection for the radio group. */
    selection;
    /** Controls focus for the radio group. */
    focusManager;
    /** Whether the radio group is vertically or horizontally oriented. */
    orientation;
    /** Whether the radio group is disabled. */
    disabled = computed(() => this.inputs.disabled() || this.focusManager.isListDisabled());
    /** The currently selected radio button. */
    selectedItem = computed(() => this.selection.selectedItems()[0]);
    /** Whether the radio group is readonly. */
    readonly = computed(() => this.selectedItem()?.disabled() || this.inputs.readonly());
    /** The tabindex of the radio group (if using activedescendant). */
    tabindex = computed(() => this.focusManager.getListTabindex());
    /** The id of the current active radio button (if using activedescendant). */
    activedescendant = computed(() => this.focusManager.getActiveDescendant());
    /** The key used to navigate to the previous radio button. */
    prevKey = computed(() => {
        if (this.inputs.orientation() === 'vertical') {
            return 'ArrowUp';
        }
        return this.inputs.textDirection() === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
    });
    /** The key used to navigate to the next radio button. */
    nextKey = computed(() => {
        if (this.inputs.orientation() === 'vertical') {
            return 'ArrowDown';
        }
        return this.inputs.textDirection() === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
    });
    /** The keydown event manager for the radio group. */
    keydown = computed(() => {
        const manager = new KeyboardEventManager();
        // Readonly mode allows navigation but not selection changes.
        if (this.readonly()) {
            return manager
                .on(this.prevKey, () => this.prev())
                .on(this.nextKey, () => this.next())
                .on('Home', () => this.first())
                .on('End', () => this.last());
        }
        // Default behavior: navigate and select on arrow keys, home, end.
        // Space/Enter also select the focused item.
        return manager
            .on(this.prevKey, () => this.prev({ selectOne: true }))
            .on(this.nextKey, () => this.next({ selectOne: true }))
            .on('Home', () => this.first({ selectOne: true }))
            .on('End', () => this.last({ selectOne: true }))
            .on(' ', () => this.selection.selectOne())
            .on('Enter', () => this.selection.selectOne());
    });
    /** The pointerdown event manager for the radio group. */
    pointerdown = computed(() => {
        const manager = new PointerEventManager();
        if (this.readonly()) {
            // Navigate focus only in readonly mode.
            return manager.on(e => this.goto(e));
        }
        // Default behavior: navigate and select on click.
        return manager.on(e => this.goto(e, { selectOne: true }));
    });
    constructor(inputs) {
        this.inputs = inputs;
        this.orientation = inputs.orientation;
        this.focusManager = new ListFocus(inputs);
        this.navigation = new ListNavigation({
            ...inputs,
            wrap: () => false,
            focusManager: this.focusManager,
        });
        this.selection = new ListSelection({
            ...inputs,
            multi: () => false,
            selectionMode: () => 'follow',
            focusManager: this.focusManager,
        });
    }
    /** Handles keydown events for the radio group. */
    onKeydown(event) {
        if (!this.disabled()) {
            this.keydown().handle(event);
        }
    }
    /** Handles pointerdown events for the radio group. */
    onPointerdown(event) {
        if (!this.disabled()) {
            this.pointerdown().handle(event);
        }
    }
    /** Navigates to the first enabled radio button in the group. */
    first(opts) {
        this._navigate(opts, () => this.navigation.first());
    }
    /** Navigates to the last enabled radio button in the group. */
    last(opts) {
        this._navigate(opts, () => this.navigation.last());
    }
    /** Navigates to the next enabled radio button in the group. */
    next(opts) {
        this._navigate(opts, () => this.navigation.next());
    }
    /** Navigates to the previous enabled radio button in the group. */
    prev(opts) {
        this._navigate(opts, () => this.navigation.prev());
    }
    /** Navigates to the radio button associated with the given pointer event. */
    goto(event, opts) {
        const item = this._getItem(event);
        this._navigate(opts, () => this.navigation.goto(item));
    }
    /**
     * Sets the radio group to its default initial state.
     *
     * Sets the active index to the selected radio button if one exists and is focusable.
     * Otherwise, sets the active index to the first focusable radio button.
     */
    setDefaultState() {
        let firstItem = null;
        for (const item of this.inputs.items()) {
            if (this.focusManager.isFocusable(item)) {
                if (!firstItem) {
                    firstItem = item;
                }
                if (item.selected()) {
                    this.inputs.activeIndex.set(item.index());
                    return;
                }
            }
        }
        if (firstItem) {
            this.inputs.activeIndex.set(firstItem.index());
        }
    }
    /** Validates the state of the radio group and returns a list of accessibility violations. */
    validate() {
        const violations = [];
        if (this.selectedItem()?.disabled() && this.inputs.skipDisabled()) {
            violations.push("Accessibility Violation: The selected radio button is disabled while 'skipDisabled' is true, making the selection unreachable via keyboard.");
        }
        return violations;
    }
    /** Safely performs a navigation operation and updates selection if needed. */
    _navigate(opts = {}, operation) {
        const moved = operation();
        if (moved && opts.selectOne) {
            this.selection.selectOne();
        }
    }
    /** Finds the RadioButtonPattern associated with a pointer event target. */
    _getItem(e) {
        if (!(e.target instanceof HTMLElement)) {
            return undefined;
        }
        // Assumes the target or its ancestor has role="radio"
        const element = e.target.closest('[role="radio"]');
        return this.inputs.items().find(i => i.element() === element);
    }
}

/** Represents a radio button within a radio group. */
class RadioButtonPattern {
    inputs;
    /** A unique identifier for the radio button. */
    id;
    /** The value associated with the radio button. */
    value;
    /** The position of the radio button within the group. */
    index = computed(() => this.group()
        ?.navigation.inputs.items()
        .findIndex(i => i.id() === this.id()) ?? -1);
    /** Whether the radio button is currently the active one (focused). */
    active = computed(() => this.group()?.focusManager.activeItem() === this);
    /** Whether the radio button is selected. */
    selected = computed(() => !!this.group()?.selection.inputs.value().includes(this.value()));
    /** Whether the radio button is disabled. */
    disabled;
    /** A reference to the parent radio group. */
    group;
    /** The tabindex of the radio button. */
    tabindex = computed(() => this.group()?.focusManager.getItemTabindex(this));
    /** The HTML element associated with the radio button. */
    element;
    constructor(inputs) {
        this.inputs = inputs;
        this.id = inputs.id;
        this.value = inputs.value;
        this.group = inputs.group;
        this.element = inputs.element;
        this.disabled = inputs.disabled;
    }
}

export { RadioGroupPattern as R, RadioButtonPattern as a };
//# sourceMappingURL=radio-button-BiqPDreS.mjs.map
