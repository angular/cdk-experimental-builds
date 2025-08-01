import { computed, signal } from '@angular/core';
import { List } from './list.mjs';
import { Modifier, KeyboardEventManager, PointerEventManager } from './list-navigation.mjs';

/** Controls the state of a listbox. */
class ListboxPattern {
    inputs;
    listBehavior;
    /** Whether the list is vertically or horizontally oriented. */
    orientation;
    /** Whether the listbox is disabled. */
    disabled = computed(() => this.listBehavior.disabled());
    /** Whether the listbox is readonly. */
    readonly;
    /** The tabindex of the listbox. */
    tabindex = computed(() => this.listBehavior.tabindex());
    /** The id of the current active item. */
    activedescendant = computed(() => this.listBehavior.activedescendant());
    /** Whether multiple items in the list can be selected at once. */
    multi;
    /** The number of items in the listbox. */
    setsize = computed(() => this.inputs.items().length);
    /** Whether the listbox selection follows focus. */
    followFocus = computed(() => this.inputs.selectionMode() === 'follow');
    /** Whether the listbox should wrap. Used to disable wrapping while range selecting. */
    wrap = signal(true);
    /** The key used to navigate to the previous item in the list. */
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
    /** Represents the space key. Does nothing when the user is actively using typeahead. */
    dynamicSpaceKey = computed(() => (this.listBehavior.isTyping() ? '' : ' '));
    /** The regexp used to decide if a key should trigger typeahead. */
    typeaheadRegexp = /^.$/; // TODO: Ignore spaces?
    /** The keydown event manager for the listbox. */
    keydown = computed(() => {
        const manager = new KeyboardEventManager();
        if (this.readonly()) {
            return manager
                .on(this.prevKey, () => this.listBehavior.prev())
                .on(this.nextKey, () => this.listBehavior.next())
                .on('Home', () => this.listBehavior.first())
                .on('End', () => this.listBehavior.last())
                .on(this.typeaheadRegexp, e => this.listBehavior.search(e.key));
        }
        if (!this.followFocus()) {
            manager
                .on(this.prevKey, () => this.listBehavior.prev())
                .on(this.nextKey, () => this.listBehavior.next())
                .on('Home', () => this.listBehavior.first())
                .on('End', () => this.listBehavior.last())
                .on(this.typeaheadRegexp, e => this.listBehavior.search(e.key));
        }
        if (this.followFocus()) {
            manager
                .on(this.prevKey, () => this.listBehavior.prev({ selectOne: true }))
                .on(this.nextKey, () => this.listBehavior.next({ selectOne: true }))
                .on('Home', () => this.listBehavior.first({ selectOne: true }))
                .on('End', () => this.listBehavior.last({ selectOne: true }))
                .on(this.typeaheadRegexp, e => this.listBehavior.search(e.key, { selectOne: true }));
        }
        if (this.inputs.multi()) {
            manager
                .on(Modifier.Any, 'Shift', () => this.listBehavior.anchor(this.inputs.activeIndex()))
                .on(Modifier.Shift, this.prevKey, () => this.listBehavior.prev({ selectRange: true }))
                .on(Modifier.Shift, this.nextKey, () => this.listBehavior.next({ selectRange: true }))
                .on([Modifier.Ctrl | Modifier.Shift, Modifier.Meta | Modifier.Shift], 'Home', () => this.listBehavior.first({ selectRange: true, anchor: false }))
                .on([Modifier.Ctrl | Modifier.Shift, Modifier.Meta | Modifier.Shift], 'End', () => this.listBehavior.last({ selectRange: true, anchor: false }))
                .on(Modifier.Shift, 'Enter', () => this.listBehavior.updateSelection({ selectRange: true, anchor: false }))
                .on(Modifier.Shift, this.dynamicSpaceKey, () => this.listBehavior.updateSelection({ selectRange: true, anchor: false }));
        }
        if (!this.followFocus() && this.inputs.multi()) {
            manager
                .on(this.dynamicSpaceKey, () => this.listBehavior.toggle())
                .on('Enter', () => this.listBehavior.toggle())
                .on([Modifier.Ctrl, Modifier.Meta], 'A', () => this.listBehavior.toggleAll());
        }
        if (!this.followFocus() && !this.inputs.multi()) {
            manager.on(this.dynamicSpaceKey, () => this.listBehavior.toggleOne());
            manager.on('Enter', () => this.listBehavior.toggleOne());
        }
        if (this.inputs.multi() && this.followFocus()) {
            manager
                .on([Modifier.Ctrl, Modifier.Meta], this.prevKey, () => this.listBehavior.prev())
                .on([Modifier.Ctrl, Modifier.Meta], this.nextKey, () => this.listBehavior.next())
                .on([Modifier.Ctrl, Modifier.Meta], ' ', () => this.listBehavior.toggle())
                .on([Modifier.Ctrl, Modifier.Meta], 'Enter', () => this.listBehavior.toggle())
                .on([Modifier.Ctrl, Modifier.Meta], 'Home', () => this.listBehavior.first())
                .on([Modifier.Ctrl, Modifier.Meta], 'End', () => this.listBehavior.last())
                .on([Modifier.Ctrl, Modifier.Meta], 'A', () => {
                this.listBehavior.toggleAll();
                this.listBehavior.select(); // Ensure the currect option remains selected.
            });
        }
        return manager;
    });
    /** The pointerdown event manager for the listbox. */
    pointerdown = computed(() => {
        const manager = new PointerEventManager();
        if (this.readonly()) {
            return manager.on(e => this.listBehavior.goto(this._getItem(e)));
        }
        if (this.multi()) {
            manager.on(Modifier.Shift, e => this.listBehavior.goto(this._getItem(e), { selectRange: true }));
        }
        if (!this.multi() && this.followFocus()) {
            return manager.on(e => this.listBehavior.goto(this._getItem(e), { selectOne: true }));
        }
        if (!this.multi() && !this.followFocus()) {
            return manager.on(e => this.listBehavior.goto(this._getItem(e), { toggle: true }));
        }
        if (this.multi() && this.followFocus()) {
            return manager
                .on(e => this.listBehavior.goto(this._getItem(e), { selectOne: true }))
                .on(Modifier.Ctrl, e => this.listBehavior.goto(this._getItem(e), { toggle: true }));
        }
        if (this.multi() && !this.followFocus()) {
            return manager.on(e => this.listBehavior.goto(this._getItem(e), { toggle: true }));
        }
        return manager;
    });
    constructor(inputs) {
        this.inputs = inputs;
        this.readonly = inputs.readonly;
        this.orientation = inputs.orientation;
        this.multi = inputs.multi;
        this.listBehavior = new List(inputs);
    }
    /** Returns a set of violations */
    validate() {
        const violations = [];
        if (!this.inputs.multi() && this.inputs.value().length > 1) {
            violations.push(`A single-select listbox should not have multiple selected options. Selected options: ${this.inputs.value().join(', ')}`);
        }
        if (this.inputs.items.length &&
            (this.inputs.activeIndex() < 0 || this.inputs.activeIndex() >= this.inputs.items().length)) {
            violations.push(`The active index is out of bounds. Number of options: ${this.inputs.items().length} Active index: ${this.inputs.activeIndex()}.`);
        }
        return violations;
    }
    /** Handles keydown events for the listbox. */
    onKeydown(event) {
        if (!this.disabled()) {
            this.keydown().handle(event);
        }
    }
    onPointerdown(event) {
        if (!this.disabled()) {
            this.pointerdown().handle(event);
        }
    }
    /**
     * Sets the listbox to it's default initial state.
     *
     * Sets the active index of the listbox to the first focusable selected
     * item if one exists. Otherwise, sets focus to the first focusable item.
     *
     * This method should be called once the listbox and it's options are properly initialized,
     * meaning the ListboxPattern and OptionPatterns should have references to each other before this
     * is called.
     */
    setDefaultState() {
        let firstItem = null;
        for (const item of this.inputs.items()) {
            if (this.listBehavior.isFocusable(item)) {
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
    _getItem(e) {
        if (!(e.target instanceof HTMLElement)) {
            return;
        }
        const element = e.target.closest('[role="option"]');
        return this.inputs.items().find(i => i.element() === element);
    }
}

/** Represents an option in a listbox. */
class OptionPattern {
    /** A unique identifier for the option. */
    id;
    /** The value of the option. */
    value;
    /** The position of the option in the list. */
    index = computed(() => this.listbox()
        ?.inputs.items()
        .findIndex(i => i.id() === this.id()) ?? -1);
    /** Whether the option is active. */
    active = computed(() => this.listbox()?.listBehavior.activeItem() === this);
    /** Whether the option is selected. */
    selected = computed(() => this.listbox()?.inputs.value().includes(this.value()));
    /** Whether the option is disabled. */
    disabled;
    /** The text used by the typeahead search. */
    searchTerm;
    /** A reference to the parent listbox. */
    listbox;
    /** The tabindex of the option. */
    tabindex = computed(() => this.listbox()?.listBehavior.getItemTabindex(this));
    /** The html element that should receive focus. */
    element;
    constructor(args) {
        this.id = args.id;
        this.value = args.value;
        this.listbox = args.listbox;
        this.element = args.element;
        this.disabled = args.disabled;
        this.searchTerm = args.searchTerm;
    }
}

export { ListboxPattern, OptionPattern };
//# sourceMappingURL=option.mjs.map
