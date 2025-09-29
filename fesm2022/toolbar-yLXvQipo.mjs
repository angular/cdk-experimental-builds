import { computed, signal } from '@angular/core';
import { List } from './list-QKHHM4uh.mjs';
import { PointerEventManager, KeyboardEventManager } from './pointer-event-manager-B6GE9jDm.mjs';

class ToolbarWidgetPattern {
    inputs;
    /** A unique identifier for the widget. */
    id;
    /** The html element that should receive focus. */
    element;
    /** Whether the widget is disabled. */
    disabled;
    /** A reference to the parent toolbar. */
    toolbar;
    /** The tabindex of the widgdet. */
    tabindex = computed(() => this.toolbar().listBehavior.getItemTabindex(this));
    /** The text used by the typeahead search. */
    searchTerm = () => ''; // Unused because toolbar does not support typeahead.
    /** The value associated with the widget. */
    value = () => ''; // Unused because toolbar does not support selection.
    /** The position of the widget within the toolbar. */
    index = computed(() => this.toolbar().inputs.items().indexOf(this) ?? -1);
    /** Whether the widget is currently the active one (focused). */
    active = computed(() => this.toolbar().inputs.activeItem() === this);
    constructor(inputs) {
        this.inputs = inputs;
        this.id = inputs.id;
        this.element = inputs.element;
        this.disabled = inputs.disabled;
        this.toolbar = inputs.toolbar;
    }
}

/** A group of widgets within a toolbar that provides nested navigation. */
class ToolbarWidgetGroupPattern {
    inputs;
    /** A unique identifier for the widget. */
    id;
    /** The html element that should receive focus. */
    element;
    /** Whether the widget is disabled. */
    disabled;
    /** A reference to the parent toolbar. */
    toolbar;
    /** The text used by the typeahead search. */
    searchTerm = () => ''; // Unused because toolbar does not support typeahead.
    /** The value associated with the widget. */
    value = () => ''; // Unused because toolbar does not support selection.
    /** The position of the widget within the toolbar. */
    index = computed(() => this.toolbar()?.inputs.items().indexOf(this) ?? -1);
    /** The actions that can be performed on the widget group. */
    controls = computed(() => this.inputs.controls() ?? this._defaultControls);
    /** Default toolbar widget group controls when no controls provided. */
    _defaultControls = {
        isOnFirstItem: () => true,
        isOnLastItem: () => true,
        next: () => { },
        prev: () => { },
        first: () => { },
        last: () => { },
        unfocus: () => { },
        trigger: () => { },
        goto: () => { },
        setDefaultState: () => { },
    };
    constructor(inputs) {
        this.inputs = inputs;
        this.id = inputs.id;
        this.element = inputs.element;
        this.disabled = inputs.disabled;
        this.toolbar = inputs.toolbar;
    }
}

/** Controls the state of a toolbar. */
class ToolbarPattern {
    inputs;
    /** The list behavior for the toolbar. */
    listBehavior;
    /** Whether the tablist is vertically or horizontally oriented. */
    orientation;
    /** Whether disabled items in the group should be skipped when navigating. */
    skipDisabled;
    /** Whether the toolbar is disabled. */
    disabled = computed(() => this.listBehavior.disabled());
    /** The tabindex of the toolbar (if using activedescendant). */
    tabindex = computed(() => this.listBehavior.tabindex());
    /** The id of the current active widget (if using activedescendant). */
    activedescendant = computed(() => this.listBehavior.activedescendant());
    /** The key used to navigate to the previous widget. */
    _prevKey = computed(() => {
        if (this.inputs.orientation() === 'vertical') {
            return 'ArrowUp';
        }
        return this.inputs.textDirection() === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
    });
    /** The key used to navigate to the next widget. */
    _nextKey = computed(() => {
        if (this.inputs.orientation() === 'vertical') {
            return 'ArrowDown';
        }
        return this.inputs.textDirection() === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
    });
    /** The alternate key used to navigate to the previous widget. */
    _altPrevKey = computed(() => {
        if (this.inputs.orientation() === 'vertical') {
            return this.inputs.textDirection() === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
        }
        return 'ArrowUp';
    });
    /** The alternate key used to navigate to the next widget. */
    _altNextKey = computed(() => {
        if (this.inputs.orientation() === 'vertical') {
            return this.inputs.textDirection() === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
        }
        return 'ArrowDown';
    });
    /** The keydown event manager for the toolbar. */
    _keydown = computed(() => {
        const manager = new KeyboardEventManager();
        return manager
            .on(this._nextKey, () => this._next())
            .on(this._prevKey, () => this._prev())
            .on(this._altNextKey, () => this._groupNext())
            .on(this._altPrevKey, () => this._groupPrev())
            .on(' ', () => this._trigger())
            .on('Enter', () => this._trigger())
            .on('Home', () => this._first())
            .on('End', () => this._last());
    });
    /** The pointerdown event manager for the toolbar. */
    _pointerdown = computed(() => new PointerEventManager().on(e => this._goto(e)));
    /** Navigates to the next widget in the toolbar. */
    _next() {
        const item = this.inputs.activeItem();
        if (item instanceof ToolbarWidgetGroupPattern) {
            if (!item.disabled() && !item.controls().isOnLastItem()) {
                item.controls().next(false);
                return;
            }
            item.controls().unfocus();
        }
        this.listBehavior.next();
        const newItem = this.inputs.activeItem();
        if (newItem instanceof ToolbarWidgetGroupPattern) {
            newItem.controls().first();
        }
    }
    /** Navigates to the previous widget in the toolbar. */
    _prev() {
        const item = this.inputs.activeItem();
        if (item instanceof ToolbarWidgetGroupPattern) {
            if (!item.disabled() && !item.controls().isOnFirstItem()) {
                item.controls().prev(false);
                return;
            }
            item.controls().unfocus();
        }
        this.listBehavior.prev();
        const newItem = this.inputs.activeItem();
        if (newItem instanceof ToolbarWidgetGroupPattern) {
            newItem.controls().last();
        }
    }
    _groupNext() {
        const item = this.inputs.activeItem();
        if (item instanceof ToolbarWidgetPattern)
            return;
        item?.controls().next(true);
    }
    _groupPrev() {
        const item = this.inputs.activeItem();
        if (item instanceof ToolbarWidgetPattern)
            return;
        item?.controls().prev(true);
    }
    /** Triggers the action of the currently active widget. */
    _trigger() {
        const item = this.inputs.activeItem();
        if (item instanceof ToolbarWidgetGroupPattern) {
            item.controls().trigger();
        }
    }
    /** Navigates to the first widget in the toolbar. */
    _first() {
        const item = this.inputs.activeItem();
        if (item instanceof ToolbarWidgetGroupPattern) {
            item.controls().unfocus();
        }
        this.listBehavior.first();
        const newItem = this.inputs.activeItem();
        if (newItem instanceof ToolbarWidgetGroupPattern) {
            newItem.controls().first();
        }
    }
    /** Navigates to the last widget in the toolbar. */
    _last() {
        const item = this.inputs.activeItem();
        if (item instanceof ToolbarWidgetGroupPattern) {
            item.controls().unfocus();
        }
        this.listBehavior.last();
        const newItem = this.inputs.activeItem();
        if (newItem instanceof ToolbarWidgetGroupPattern) {
            newItem.controls().last();
        }
    }
    /** Navigates to the widget targeted by a pointer event. */
    _goto(e) {
        const item = this.inputs.getItem(e.target);
        if (!item)
            return;
        this.listBehavior.goto(item);
        if (item instanceof ToolbarWidgetGroupPattern) {
            item.controls().goto(e);
        }
    }
    constructor(inputs) {
        this.inputs = inputs;
        this.orientation = inputs.orientation;
        this.skipDisabled = inputs.skipDisabled;
        this.listBehavior = new List({
            ...inputs,
            multi: () => false,
            focusMode: () => 'roving',
            selectionMode: () => 'explicit',
            value: signal([]),
            typeaheadDelay: () => 0, // Toolbar widgets do not support typeahead.
        });
    }
    /** Handles keydown events for the toolbar. */
    onKeydown(event) {
        if (this.disabled())
            return;
        this._keydown().handle(event);
    }
    /** Handles pointerdown events for the toolbar. */
    onPointerdown(event) {
        if (this.disabled())
            return;
        this._pointerdown().handle(event);
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
            }
        }
        if (firstItem) {
            this.inputs.activeItem.set(firstItem);
        }
        if (firstItem instanceof ToolbarWidgetGroupPattern) {
            firstItem.controls().setDefaultState();
        }
    }
    /** Validates the state of the toolbar and returns a list of accessibility violations. */
    validate() {
        const violations = [];
        return violations;
    }
}

export { ToolbarPattern, ToolbarWidgetGroupPattern, ToolbarWidgetPattern };
//# sourceMappingURL=toolbar-yLXvQipo.mjs.map
