import { KeyboardEventManager, ModifierKey, PointerEventManager, ListNavigation, ListSelection, ListFocus } from './list-focus-DtTH4bDx.mjs';
import { computed, signal } from '@angular/core';

/** Controls typeahead for a list of items. */
class ListTypeahead {
    inputs;
    /** A reference to the timeout for resetting the typeahead search. */
    timeout;
    /** The navigation controller of the parent list. */
    navigation;
    /** Whether the user is actively typing a typeahead search query. */
    isTyping = computed(() => this._query().length > 0);
    /** Keeps track of the characters that typeahead search is being called with. */
    _query = signal('');
    /** The index where that the typeahead search was initiated from. */
    _startIndex = signal(undefined);
    constructor(inputs) {
        this.inputs = inputs;
        this.navigation = inputs.navigation;
    }
    /** Performs a typeahead search, appending the given character to the search string. */
    search(char) {
        if (char.length !== 1) {
            return;
        }
        if (!this.isTyping() && char === ' ') {
            return;
        }
        if (this._startIndex() === undefined) {
            this._startIndex.set(this.navigation.inputs.activeIndex());
        }
        clearTimeout(this.timeout);
        this._query.update(q => q + char.toLowerCase());
        const item = this._getItem();
        if (item) {
            this.navigation.goto(item);
        }
        this.timeout = setTimeout(() => {
            this._query.set('');
            this._startIndex.set(undefined);
        }, this.inputs.typeaheadDelay() * 1000);
    }
    /**
     * Returns the first item whose search term matches the
     * current query starting from the the current anchor index.
     */
    _getItem() {
        let items = this.navigation.inputs.items();
        const after = items.slice(this._startIndex() + 1);
        const before = items.slice(0, this._startIndex());
        items = this.navigation.inputs.wrap() ? after.concat(before) : after; // TODO: Always wrap?
        items.push(this.navigation.inputs.items()[this._startIndex()]);
        const focusableItems = [];
        for (const item of items) {
            if (this.navigation.isFocusable(item)) {
                focusableItems.push(item);
            }
        }
        return focusableItems.find(i => i.searchTerm().toLowerCase().startsWith(this._query()));
    }
}

/** Controls the state of a listbox. */
class ListboxPattern {
    inputs;
    /** Controls navigation for the listbox. */
    navigation;
    /** Controls selection for the listbox. */
    selection;
    /** Controls typeahead for the listbox. */
    typeahead;
    /** Controls focus for the listbox. */
    focusManager;
    /** Whether the list is vertically or horizontally oriented. */
    orientation;
    /** Whether the listbox is disabled. */
    disabled;
    /** Whether the listbox is readonly. */
    readonly;
    /** The tabindex of the listbox. */
    tabindex = computed(() => this.focusManager.getListTabindex());
    /** The id of the current active item. */
    activedescendant = computed(() => this.focusManager.getActiveDescendant());
    /** Whether multiple items in the list can be selected at once. */
    multi;
    /** The number of items in the listbox. */
    setsize = computed(() => this.navigation.inputs.items().length);
    /** Whether the listbox selection follows focus. */
    followFocus = computed(() => this.inputs.selectionMode() === 'follow');
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
    dynamicSpaceKey = computed(() => (this.typeahead.isTyping() ? '' : ' '));
    /** The regexp used to decide if a key should trigger typeahead. */
    typeaheadRegexp = /^.$/; // TODO: Ignore spaces?
    /** The keydown event manager for the listbox. */
    keydown = computed(() => {
        const manager = new KeyboardEventManager();
        if (this.readonly()) {
            return manager
                .on(this.prevKey, () => this.prev())
                .on(this.nextKey, () => this.next())
                .on('Home', () => this.first())
                .on('End', () => this.last())
                .on(this.typeaheadRegexp, e => this.search(e.key));
        }
        if (!this.followFocus()) {
            manager
                .on(this.prevKey, () => this.prev())
                .on(this.nextKey, () => this.next())
                .on('Home', () => this.first())
                .on('End', () => this.last())
                .on(this.typeaheadRegexp, e => this.search(e.key));
        }
        if (this.followFocus()) {
            manager
                .on(this.prevKey, () => this.prev({ selectOne: true }))
                .on(this.nextKey, () => this.next({ selectOne: true }))
                .on('Home', () => this.first({ selectOne: true }))
                .on('End', () => this.last({ selectOne: true }))
                .on(this.typeaheadRegexp, e => this.search(e.key, { selectOne: true }));
        }
        if (this.inputs.multi()) {
            manager
                .on(ModifierKey.Shift, 'Enter', () => this._updateSelection({ selectFromAnchor: true }))
                .on(ModifierKey.Shift, this.prevKey, () => this.prev({ toggle: true }))
                .on(ModifierKey.Shift, this.nextKey, () => this.next({ toggle: true }))
                .on([ModifierKey.Ctrl, ModifierKey.Meta], 'A', () => this._updateSelection({ selectAll: true }))
                .on([ModifierKey.Ctrl | ModifierKey.Shift, ModifierKey.Meta | ModifierKey.Shift], 'Home', () => this.first({ selectFromActive: true }))
                .on([ModifierKey.Ctrl | ModifierKey.Shift, ModifierKey.Meta | ModifierKey.Shift], 'End', () => this.last({ selectFromActive: true }))
                .on(ModifierKey.Shift, this.dynamicSpaceKey, () => this._updateSelection({ selectFromAnchor: true }));
        }
        if (!this.followFocus() && this.inputs.multi()) {
            manager.on(this.dynamicSpaceKey, () => this._updateSelection({ toggle: true }));
            manager.on('Enter', () => this._updateSelection({ toggle: true }));
        }
        if (!this.followFocus() && !this.inputs.multi()) {
            manager.on(this.dynamicSpaceKey, () => this._updateSelection({ toggleOne: true }));
            manager.on('Enter', () => this._updateSelection({ toggleOne: true }));
        }
        if (this.inputs.multi() && this.followFocus()) {
            manager
                .on([ModifierKey.Ctrl, ModifierKey.Meta], this.prevKey, () => this.prev())
                .on([ModifierKey.Ctrl, ModifierKey.Meta], this.nextKey, () => this.next())
                .on([ModifierKey.Ctrl, ModifierKey.Meta], ' ', () => this._updateSelection({ toggle: true }))
                .on([ModifierKey.Ctrl, ModifierKey.Meta], 'Enter', () => this._updateSelection({ toggle: true }))
                .on([ModifierKey.Ctrl, ModifierKey.Meta], 'Home', () => this.first()) // TODO: Not in spec but prob should be.
                .on([ModifierKey.Ctrl, ModifierKey.Meta], 'End', () => this.last()); // TODO: Not in spec but prob should be.
        }
        return manager;
    });
    /** The pointerdown event manager for the listbox. */
    pointerdown = computed(() => {
        const manager = new PointerEventManager();
        if (this.readonly()) {
            return manager.on(e => this.goto(e));
        }
        if (!this.multi() && this.followFocus()) {
            return manager.on(e => this.goto(e, { selectOne: true }));
        }
        if (!this.multi() && !this.followFocus()) {
            return manager.on(e => this.goto(e, { toggle: true }));
        }
        if (this.multi() && this.followFocus()) {
            return manager
                .on(e => this.goto(e, { selectOne: true }))
                .on(ModifierKey.Ctrl, e => this.goto(e, { toggle: true }))
                .on(ModifierKey.Shift, e => this.goto(e, { toggleFromAnchor: true }));
        }
        if (this.multi() && !this.followFocus()) {
            return manager
                .on(e => this.goto(e, { toggle: true }))
                .on(ModifierKey.Shift, e => this.goto(e, { toggleFromAnchor: true }));
        }
        return manager;
    });
    constructor(inputs) {
        this.inputs = inputs;
        this.disabled = inputs.disabled;
        this.readonly = inputs.readonly;
        this.orientation = inputs.orientation;
        this.multi = inputs.multi;
        this.navigation = new ListNavigation(inputs);
        this.selection = new ListSelection({ ...inputs, navigation: this.navigation });
        this.typeahead = new ListTypeahead({ ...inputs, navigation: this.navigation });
        this.focusManager = new ListFocus({ ...inputs, navigation: this.navigation });
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
    /** Navigates to the first option in the listbox. */
    first(opts) {
        this.navigation.first();
        this.focusManager.focus();
        this._updateSelection(opts);
    }
    /** Navigates to the last option in the listbox. */
    last(opts) {
        this.navigation.last();
        this.focusManager.focus();
        this._updateSelection(opts);
    }
    /** Navigates to the next option in the listbox. */
    next(opts) {
        this.navigation.next();
        this.focusManager.focus();
        this._updateSelection(opts);
    }
    /** Navigates to the previous option in the listbox. */
    prev(opts) {
        this.navigation.prev();
        this.focusManager.focus();
        this._updateSelection(opts);
    }
    /** Navigates to the given item in the listbox. */
    goto(event, opts) {
        const item = this._getItem(event);
        if (item) {
            this.navigation.goto(item);
            this.focusManager.focus();
            this._updateSelection(opts);
        }
    }
    /** Handles typeahead search navigation for the listbox. */
    search(char, opts) {
        this.typeahead.search(char);
        this.focusManager.focus();
        this._updateSelection(opts);
    }
    /** Handles updating selection for the listbox. */
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
        if (opts?.selectAll) {
            this.selection.selectAll();
        }
        if (opts?.selectFromAnchor) {
            this.selection.selectFromPrevSelectedItem();
        }
        if (opts?.selectFromActive) {
            this.selection.selectFromActive();
        }
        if (opts?.toggleFromAnchor) {
            this.selection.toggleFromPrevSelectedItem();
        }
    }
    _getItem(e) {
        if (!(e.target instanceof HTMLElement)) {
            return;
        }
        const element = e.target.closest('[role="option"]'); // TODO: Use a different identifier.
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
        ?.navigation.inputs.items()
        .findIndex(i => i.id() === this.id()) ?? -1);
    /** Whether the option is selected. */
    selected = computed(() => this.listbox()?.selection.inputs.value().includes(this.value()));
    /** Whether the option is disabled. */
    disabled;
    /** The text used by the typeahead search. */
    searchTerm;
    /** A reference to the parent listbox. */
    listbox;
    /** The tabindex of the option. */
    tabindex = computed(() => this.listbox()?.focusManager.getItemTabindex(this));
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
//# sourceMappingURL=option-Bgpacz3g.mjs.map
