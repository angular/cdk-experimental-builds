import { signal, computed } from '@angular/core';
import { List } from './_list-chunk.mjs';
import { KeyboardEventManager, PointerEventManager } from './_pointer-event-manager-chunk.mjs';

/** Controls the state of a radio group. */
class RadioGroupPattern {
    inputs;
    /** The list behavior for the radio group. */
    listBehavior;
    /** Whether the radio group is vertically or horizontally oriented. */
    orientation;
    /** Whether focus should wrap when navigating. */
    wrap = signal(false);
    /** The selection strategy used by the radio group. */
    selectionMode = signal('follow');
    /** Whether the radio group is disabled. */
    disabled = computed(() => this.inputs.disabled() || this.listBehavior.disabled());
    /** The currently selected radio button. */
    selectedItem = computed(() => this.listBehavior.selectionBehavior.selectedItems()[0]);
    /** Whether the radio group is readonly. */
    readonly = computed(() => this.selectedItem()?.disabled() || this.inputs.readonly());
    /** The tabindex of the radio group. */
    tabindex = computed(() => this.listBehavior.tabindex());
    /** The id of the current active radio button (if using activedescendant). */
    activedescendant = computed(() => this.listBehavior.activedescendant());
    /** The key used to navigate to the previous radio button. */
    _prevKey = computed(() => {
        if (this.inputs.orientation() === 'vertical') {
            return 'ArrowUp';
        }
        return this.inputs.textDirection() === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
    });
    /** The key used to navigate to the next radio button. */
    _nextKey = computed(() => {
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
                .on(this._prevKey, () => this.listBehavior.prev())
                .on(this._nextKey, () => this.listBehavior.next())
                .on('Home', () => this.listBehavior.first())
                .on('End', () => this.listBehavior.last());
        }
        // Default behavior: navigate and select on arrow keys, home, end.
        // Space/Enter also select the focused item.
        return manager
            .on(this._prevKey, () => this.listBehavior.prev({ selectOne: true }))
            .on(this._nextKey, () => this.listBehavior.next({ selectOne: true }))
            .on('Home', () => this.listBehavior.first({ selectOne: true }))
            .on('End', () => this.listBehavior.last({ selectOne: true }))
            .on(' ', () => this.listBehavior.selectOne())
            .on('Enter', () => this.listBehavior.selectOne());
    });
    /** The pointerdown event manager for the radio group. */
    pointerdown = computed(() => {
        const manager = new PointerEventManager();
        if (this.readonly()) {
            // Navigate focus only in readonly mode.
            return manager.on(e => this.listBehavior.goto(this.inputs.getItem(e)));
        }
        // Default behavior: navigate and select on click.
        return manager.on(e => this.listBehavior.goto(this.inputs.getItem(e), { selectOne: true }));
    });
    constructor(inputs) {
        this.inputs = inputs;
        this.orientation = inputs.orientation;
        this.listBehavior = new List({
            ...inputs,
            wrap: this.wrap,
            selectionMode: this.selectionMode,
            multi: () => false,
            typeaheadDelay: () => 0, // Radio groups do not support typeahead.
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
    /**
     * Sets the radio group to its default initial state.
     *
     * Sets the active index to the selected radio button if one exists and is focusable.
     * Otherwise, sets the active index to the first focusable radio button.
     */
    setDefaultState() {
        let firstItem = null;
        for (const item of this.inputs.items()) {
            if (this.listBehavior.isFocusable(item)) {
                if (!firstItem) {
                    firstItem = item;
                }
                if (item.selected()) {
                    this.inputs.activeItem.set(item);
                    return;
                }
            }
        }
        if (firstItem) {
            this.inputs.activeItem.set(firstItem);
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
}

/** Represents a radio button within a radio group. */
class RadioButtonPattern {
    inputs;
    /** A unique identifier for the radio button. */
    id;
    /** The value associated with the radio button. */
    value;
    /** The position of the radio button within the group. */
    index = computed(() => this.group()?.listBehavior.inputs.items().indexOf(this) ?? -1);
    /** Whether the radio button is currently the active one (focused). */
    active = computed(() => this.group()?.listBehavior.inputs.activeItem() === this);
    /** Whether the radio button is selected. */
    selected = computed(() => !!this.group()?.listBehavior.inputs.value().includes(this.value()));
    /** Whether the radio button is disabled. */
    disabled;
    /** A reference to the parent radio group. */
    group;
    /** The tabindex of the radio button. */
    tabindex = computed(() => this.group()?.listBehavior.getItemTabindex(this));
    /** The HTML element associated with the radio button. */
    element;
    /** The search term for typeahead. */
    searchTerm = () => ''; // Radio groups do not support typeahead.
    constructor(inputs) {
        this.inputs = inputs;
        this.id = inputs.id;
        this.value = inputs.value;
        this.group = inputs.group;
        this.element = inputs.element;
        this.disabled = inputs.disabled;
    }
}

/** Controls the state of a radio group in a toolbar. */
class ToolbarRadioGroupPattern extends RadioGroupPattern {
    inputs;
    constructor(inputs) {
        if (!!inputs.toolbar()) {
            inputs.orientation = inputs.toolbar().orientation;
            inputs.skipDisabled = inputs.toolbar().skipDisabled;
        }
        super(inputs);
        this.inputs = inputs;
    }
    /** Noop. The toolbar handles keydown events. */
    onKeydown(_) { }
    /** Noop. The toolbar handles pointerdown events. */
    onPointerdown(_) { }
    /** Whether the radio group is currently on the first item. */
    isOnFirstItem() {
        return this.listBehavior.navigationBehavior.peekPrev() === undefined;
    }
    /** Whether the radio group is currently on the last item. */
    isOnLastItem() {
        return this.listBehavior.navigationBehavior.peekNext() === undefined;
    }
    /** Navigates to the next radio button in the group. */
    next(wrap) {
        this.wrap.set(wrap);
        this.listBehavior.next();
        this.wrap.set(false);
    }
    /** Navigates to the previous radio button in the group. */
    prev(wrap) {
        this.wrap.set(wrap);
        this.listBehavior.prev();
        this.wrap.set(false);
    }
    /** Navigates to the first radio button in the group. */
    first() {
        this.listBehavior.first();
    }
    /** Navigates to the last radio button in the group. */
    last() {
        this.listBehavior.last();
    }
    /** Removes focus from the radio group. */
    unfocus() {
        this.inputs.activeItem.set(undefined);
    }
    /** Triggers the action of the currently active radio button in the group. */
    trigger() {
        if (this.readonly())
            return;
        this.listBehavior.selectOne();
    }
    /** Navigates to the radio button targeted by a pointer event. */
    goto(e) {
        this.listBehavior.goto(this.inputs.getItem(e), {
            selectOne: !this.readonly(),
        });
    }
}

export { RadioButtonPattern, RadioGroupPattern, ToolbarRadioGroupPattern };
//# sourceMappingURL=_toolbar-radio-group-chunk.mjs.map
