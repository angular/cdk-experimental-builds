import { M as ModifierKey, L as ListFocus, a as ListSelection, b as ListNavigation, K as KeyboardEventManager, P as PointerEventManager } from './list-focus-Di7m_z_6.mjs';
import { computed, signal } from '@angular/core';

/** Controls typeahead for a list of items. */
class ListTypeahead {
    inputs;
    /** A reference to the timeout for resetting the typeahead search. */
    timeout;
    /** The focus controller of the parent list. */
    focusManager;
    /** Whether the user is actively typing a typeahead search query. */
    isTyping = computed(() => this._query().length > 0);
    /** Keeps track of the characters that typeahead search is being called with. */
    _query = signal('');
    /** The index where that the typeahead search was initiated from. */
    _startIndex = signal(undefined);
    constructor(inputs) {
        this.inputs = inputs;
        this.focusManager = inputs.focusManager;
    }
    /** Performs a typeahead search, appending the given character to the search string. */
    search(char) {
        if (char.length !== 1) {
            return false;
        }
        if (!this.isTyping() && char === ' ') {
            return false;
        }
        if (this._startIndex() === undefined) {
            this._startIndex.set(this.focusManager.inputs.activeIndex());
        }
        clearTimeout(this.timeout);
        this._query.update(q => q + char.toLowerCase());
        const item = this._getItem();
        if (item) {
            this.focusManager.focus(item);
        }
        this.timeout = setTimeout(() => {
            this._query.set('');
            this._startIndex.set(undefined);
        }, this.inputs.typeaheadDelay() * 1000);
        return true;
    }
    /**
     * Returns the first item whose search term matches the
     * current query starting from the the current anchor index.
     */
    _getItem() {
        let items = this.focusManager.inputs.items();
        const after = items.slice(this._startIndex() + 1);
        const before = items.slice(0, this._startIndex());
        items = after.concat(before);
        items.push(this.inputs.items()[this._startIndex()]);
        const focusableItems = [];
        for (const item of items) {
            if (this.focusManager.isFocusable(item)) {
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
    disabled = computed(() => this.focusManager.isListDisabled());
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
    dynamicSpaceKey = computed(() => (this.typeahead.isTyping() ? '' : ' '));
    /** The regexp used to decide if a key should trigger typeahead. */
    typeaheadRegexp = /^.$/; // TODO: Ignore spaces?
    /**
     * The uncommitted index for selecting a range of options.
     *
     * NOTE: This is subtly distinct from the "rangeStartIndex" in the ListSelection behavior.
     * The anchorIndex does not necessarily represent the start of a range, but represents the most
     * recent index where the user showed intent to begin a range selection. Usually, this is wherever
     * the user most recently pressed the "Shift" key, but if the user presses shift + space to select
     * from the anchor, the user is not intending to start a new range from this index.
     *
     * In other words, "rangeStartIndex" is only set when a user commits to starting a range selection
     * while "anchorIndex" is set whenever a user indicates they may be starting a range selection.
     */
    anchorIndex = signal(0);
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
                .on(ModifierKey.Any, 'Shift', () => this.anchorIndex.set(this.inputs.activeIndex()))
                .on(ModifierKey.Shift, this.prevKey, () => this.prev({ selectRange: true }))
                .on(ModifierKey.Shift, this.nextKey, () => this.next({ selectRange: true }))
                .on([ModifierKey.Ctrl | ModifierKey.Shift, ModifierKey.Meta | ModifierKey.Shift], 'Home', () => this.first({ selectRange: true, anchor: false }))
                .on([ModifierKey.Ctrl | ModifierKey.Shift, ModifierKey.Meta | ModifierKey.Shift], 'End', () => this.last({ selectRange: true, anchor: false }))
                .on(ModifierKey.Shift, 'Enter', () => this._updateSelection({ selectRange: true, anchor: false }))
                .on(ModifierKey.Shift, this.dynamicSpaceKey, () => this._updateSelection({ selectRange: true, anchor: false }));
        }
        if (!this.followFocus() && this.inputs.multi()) {
            manager
                .on(this.dynamicSpaceKey, () => this.selection.toggle())
                .on('Enter', () => this.selection.toggle())
                .on([ModifierKey.Ctrl, ModifierKey.Meta], 'A', () => this.selection.toggleAll());
        }
        if (!this.followFocus() && !this.inputs.multi()) {
            manager.on(this.dynamicSpaceKey, () => this.selection.toggleOne());
            manager.on('Enter', () => this.selection.toggleOne());
        }
        if (this.inputs.multi() && this.followFocus()) {
            manager
                .on([ModifierKey.Ctrl, ModifierKey.Meta], this.prevKey, () => this.prev())
                .on([ModifierKey.Ctrl, ModifierKey.Meta], this.nextKey, () => this.next())
                .on([ModifierKey.Ctrl, ModifierKey.Meta], ' ', () => this.selection.toggle())
                .on([ModifierKey.Ctrl, ModifierKey.Meta], 'Enter', () => this.selection.toggle())
                .on([ModifierKey.Ctrl, ModifierKey.Meta], 'Home', () => this.first())
                .on([ModifierKey.Ctrl, ModifierKey.Meta], 'End', () => this.last())
                .on([ModifierKey.Ctrl, ModifierKey.Meta], 'A', () => {
                this.selection.toggleAll();
                this.selection.select(); // Ensure the currect option remains selected.
            });
        }
        return manager;
    });
    /** The pointerdown event manager for the listbox. */
    pointerdown = computed(() => {
        const manager = new PointerEventManager();
        if (this.readonly()) {
            return manager.on(e => this.goto(e));
        }
        if (this.multi()) {
            manager.on(ModifierKey.Shift, e => this.goto(e, { selectRange: true }));
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
                .on(ModifierKey.Ctrl, e => this.goto(e, { toggle: true }));
        }
        if (this.multi() && !this.followFocus()) {
            return manager.on(e => this.goto(e, { toggle: true }));
        }
        return manager;
    });
    constructor(inputs) {
        this.inputs = inputs;
        this.readonly = inputs.readonly;
        this.orientation = inputs.orientation;
        this.multi = inputs.multi;
        this.focusManager = new ListFocus(inputs);
        this.selection = new ListSelection({ ...inputs, focusManager: this.focusManager });
        this.typeahead = new ListTypeahead({ ...inputs, focusManager: this.focusManager });
        this.navigation = new ListNavigation({
            ...inputs,
            focusManager: this.focusManager,
            wrap: computed(() => this.wrap() && this.inputs.wrap()),
        });
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
        this._navigate(opts, () => this.navigation.first());
    }
    /** Navigates to the last option in the listbox. */
    last(opts) {
        this._navigate(opts, () => this.navigation.last());
    }
    /** Navigates to the next option in the listbox. */
    next(opts) {
        this._navigate(opts, () => this.navigation.next());
    }
    /** Navigates to the previous option in the listbox. */
    prev(opts) {
        this._navigate(opts, () => this.navigation.prev());
    }
    /** Navigates to the given item in the listbox. */
    goto(event, opts) {
        const item = this._getItem(event);
        this._navigate(opts, () => this.navigation.goto(item));
    }
    /** Handles typeahead search navigation for the listbox. */
    search(char, opts) {
        this._navigate(opts, () => this.typeahead.search(char));
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
    /**
     * Safely performs a navigation operation.
     *
     * Handles conditionally disabling wrapping for when a navigation
     * operation is occurring while the user is selecting a range of options.
     *
     * Handles boilerplate calling of focus & selection operations. Also ensures these
     * additional operations are only called if the navigation operation moved focus to a new option.
     */
    _navigate(opts = {}, operation) {
        if (opts?.selectRange) {
            this.wrap.set(false);
            this.selection.rangeStartIndex.set(this.anchorIndex());
        }
        const moved = operation();
        if (moved) {
            this._updateSelection(opts);
        }
        this.wrap.set(true);
    }
    /** Handles updating selection for the listbox. */
    _updateSelection(opts = { anchor: true }) {
        if (opts.toggle) {
            this.selection.toggle();
        }
        if (opts.selectOne) {
            this.selection.selectOne();
        }
        if (opts.selectRange) {
            this.selection.selectRange();
        }
        if (!opts.anchor) {
            this.anchorIndex.set(this.selection.rangeStartIndex());
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
        ?.navigation.inputs.items()
        .findIndex(i => i.id() === this.id()) ?? -1);
    /** Whether the option is active. */
    active = computed(() => this.listbox()?.focusManager.activeItem() === this);
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

export { ListboxPattern as L, OptionPattern as O };
//# sourceMappingURL=option-f_gNslw8.mjs.map
