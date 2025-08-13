import { computed, signal } from '@angular/core';
import { List } from './list.mjs';
import { PointerEventManager, KeyboardEventManager } from './list-navigation.mjs';

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

/** Controls the state of a toolbar. */
class ToolbarPattern {
    inputs;
    /** The list behavior for the toolbar. */
    listBehavior;
    /** Whether the tablist is vertically or horizontally oriented. */
    orientation;
    /** Whether the toolbar is disabled. */
    disabled = computed(() => this.listBehavior.disabled());
    /** The tabindex of the toolbar (if using activedescendant). */
    tabindex = computed(() => this.listBehavior.tabindex());
    /** The id of the current active widget (if using activedescendant). */
    activedescendant = computed(() => this.listBehavior.activedescendant());
    /** The key used to navigate to the previous widget. */
    prevKey = computed(() => {
        if (this.inputs.orientation() === 'vertical') {
            return 'ArrowUp';
        }
        return this.inputs.textDirection() === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
    });
    /** The key used to navigate to the next widget. */
    nextKey = computed(() => {
        if (this.inputs.orientation() === 'vertical') {
            return 'ArrowDown';
        }
        return this.inputs.textDirection() === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
    });
    /** The alternate key used to navigate to the previous widget */
    altPrevKey = computed(() => {
        if (this.inputs.orientation() === 'vertical') {
            return this.inputs.textDirection() === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
        }
        return 'ArrowUp';
    });
    /** The alternate key used to navigate to the next widget. */
    altNextKey = computed(() => {
        if (this.inputs.orientation() === 'vertical') {
            return this.inputs.textDirection() === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
        }
        return 'ArrowDown';
    });
    /** The keydown event manager for the toolbar. */
    keydown = computed(() => {
        const manager = new KeyboardEventManager();
        const activeItem = this.inputs.activeItem();
        const isRadioButton = activeItem instanceof RadioButtonPattern;
        if (isRadioButton) {
            manager
                .on(' ', () => this.selectRadioButton())
                .on('Enter', () => this.selectRadioButton())
                .on(this.altNextKey, () => activeItem?.group()?.listBehavior.next())
                .on(this.altPrevKey, () => activeItem?.group()?.listBehavior.prev());
        }
        else {
            manager.on(this.altNextKey, () => this.listBehavior.next());
            manager.on(this.altPrevKey, () => this.listBehavior.prev());
        }
        return manager
            .on(this.prevKey, () => this.listBehavior.prev())
            .on(this.nextKey, () => this.listBehavior.next())
            .on('Home', () => this.listBehavior.first())
            .on('End', () => this.listBehavior.last());
    });
    selectRadioButton() {
        const activeItem = this.inputs.activeItem();
        // activeItem must be a radio button
        const group = activeItem.group();
        if (group && !group.readonly() && !group.disabled()) {
            group.listBehavior.selectOne();
        }
    }
    /** The pointerdown event manager for the toolbar. */
    pointerdown = computed(() => new PointerEventManager().on(e => this.goto(e)));
    /** Navigates to the widget associated with the given pointer event. */
    goto(event) {
        const item = this._getItem(event);
        if (!item)
            return;
        if (item instanceof RadioButtonPattern) {
            const group = item.group();
            if (group && !group.disabled()) {
                group.listBehavior.goto(item, { selectOne: !group.readonly() });
            }
        }
        else {
            this.listBehavior.goto(item);
        }
    }
    /** Handles keydown events for the toolbar. */
    onKeydown(event) {
        if (!this.disabled()) {
            this.keydown().handle(event);
        }
    }
    /** Handles pointerdown events for the toolbar. */
    onPointerdown(event) {
        if (!this.disabled()) {
            this.pointerdown().handle(event);
        }
    }
    /** Finds the Toolbar Widget associated with a pointer event target. */
    _getItem(e) {
        if (!(e.target instanceof HTMLElement)) {
            return undefined;
        }
        // Assumes the target or its ancestor has role="radio" or role="button"
        const element = e.target.closest('[role="button"], [role="radio"]');
        return this.inputs.items().find(i => i.element() === element);
    }
    constructor(inputs) {
        this.inputs = inputs;
        this.orientation = inputs.orientation;
        this.listBehavior = new List({
            ...inputs,
            multi: () => false,
            selectionMode: () => 'explicit',
            value: signal([]),
            typeaheadDelay: () => 0, // Toolbar widgets do not support typeahead.
        });
    }
    /**
     * Sets the toolbar to its default initial state.
     *
     * Sets the active index to the selected widget if one exists and is focusable.
     * Otherwise, sets the active index to the first focusable widget.
     */
    setDefaultState() {
        let firstItem = null;
        for (const item of this.inputs.items()) {
            if (this.listBehavior.isFocusable(item)) {
                if (!firstItem) {
                    firstItem = item;
                }
                if (item instanceof RadioButtonPattern && item.selected()) {
                    this.inputs.activeItem.set(item);
                    return;
                }
            }
        }
        if (firstItem) {
            this.inputs.activeItem.set(firstItem);
        }
    }
    /** Validates the state of the toolbar and returns a list of accessibility violations. */
    validate() {
        const violations = [];
        if (this.inputs.skipDisabled()) {
            for (const item of this.inputs.items()) {
                if (item instanceof RadioButtonPattern && item.selected() && item.disabled()) {
                    violations.push("Accessibility Violation: A selected radio button inside the toolbar is disabled while 'skipDisabled' is true, making the selection unreachable via keyboard.");
                }
            }
        }
        return violations;
    }
}
class ToolbarWidgetPattern {
    inputs;
    /** A unique identifier for the widget. */
    id;
    /** The html element that should receive focus. */
    element;
    /** Whether the widget is disabled. */
    disabled;
    /** A reference to the parent toolbar. */
    parentToolbar;
    /** The tabindex of the widgdet. */
    tabindex = computed(() => this.inputs.parentToolbar().listBehavior.getItemTabindex(this));
    /** The text used by the typeahead search. */
    searchTerm = () => ''; // Unused because toolbar does not support typeahead.
    /** The value associated with the widget. */
    value = () => ''; // Unused because toolbar does not support selection.
    /** The position of the widget within the toolbar. */
    index = computed(() => this.parentToolbar()?.inputs.items().indexOf(this) ?? -1);
    /** Whether the widget is currently the active one (focused). */
    active = computed(() => this.parentToolbar()?.inputs.activeItem() === this);
    constructor(inputs) {
        this.inputs = inputs;
        this.id = inputs.id;
        this.element = inputs.element;
        this.disabled = inputs.disabled;
        this.parentToolbar = inputs.parentToolbar;
    }
}

export { RadioButtonPattern, ToolbarPattern, ToolbarWidgetPattern };
//# sourceMappingURL=toolbar2.mjs.map
