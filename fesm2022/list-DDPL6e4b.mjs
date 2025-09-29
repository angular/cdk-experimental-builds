import { signal, computed } from '@angular/core';
import { ListFocus, ListNavigation } from './list-navigation-DFutf3ha.mjs';

/** Controls selection for a list of items. */
class ListSelection {
    inputs;
    /** The start index to use for range selection. */
    rangeStartIndex = signal(0);
    /** The end index to use for range selection. */
    rangeEndIndex = signal(0);
    /** The currently selected items. */
    selectedItems = computed(() => this.inputs.items().filter(item => this.inputs.value().includes(item.value())));
    constructor(inputs) {
        this.inputs = inputs;
    }
    /** Selects the item at the current active index. */
    select(item, opts = { anchor: true }) {
        item = item ?? this.inputs.focusManager.inputs.activeItem();
        if (item.disabled() || this.inputs.value().includes(item.value())) {
            return;
        }
        if (!this.inputs.multi()) {
            this.deselectAll();
        }
        const index = this.inputs.items().findIndex(i => i === item);
        if (opts.anchor) {
            this.beginRangeSelection(index);
        }
        this.inputs.value.update(values => values.concat(item.value()));
    }
    /** Deselects the item at the current active index. */
    deselect(item) {
        item = item ?? this.inputs.focusManager.inputs.activeItem();
        if (item && !item.disabled()) {
            this.inputs.value.update(values => values.filter(value => value !== item.value()));
        }
    }
    /** Toggles the item at the current active index. */
    toggle() {
        const item = this.inputs.focusManager.inputs.activeItem();
        if (item) {
            this.inputs.value().includes(item.value()) ? this.deselect() : this.select();
        }
    }
    /** Toggles only the item at the current active index. */
    toggleOne() {
        const item = this.inputs.focusManager.inputs.activeItem();
        if (item) {
            this.inputs.value().includes(item.value()) ? this.deselect() : this.selectOne();
        }
    }
    /** Selects all items in the list. */
    selectAll() {
        if (!this.inputs.multi()) {
            return; // Should we log a warning?
        }
        for (const item of this.inputs.items()) {
            this.select(item, { anchor: false });
        }
        this.beginRangeSelection();
    }
    /** Deselects all items in the list. */
    deselectAll() {
        // If an item is not in the list, it forcefully gets deselected.
        // This actually creates a bug for the following edge case:
        //
        // Setup: An item is not in the list (maybe it's lazily loaded), and it is disabled & selected.
        // Expected: If deselectAll() is called, it should NOT get deselected (because it is disabled).
        // Actual: Calling deselectAll() will still deselect the item.
        //
        // Why? Because we can't check if the item is disabled if it's not in the list.
        //
        // Alternatively, we could NOT deselect items that are not in the list, but this has the
        // inverse (and more common) effect of keeping enabled items selected when they aren't in the
        // list.
        for (const value of this.inputs.value()) {
            const item = this.inputs.items().find(i => i.value() === value);
            item
                ? this.deselect(item)
                : this.inputs.value.update(values => values.filter(v => v !== value));
        }
    }
    /**
     * Selects all items in the list or deselects all
     * items in the list if all items are already selected.
     */
    toggleAll() {
        const selectableValues = this.inputs
            .items()
            .filter(i => !i.disabled())
            .map(i => i.value());
        selectableValues.every(i => this.inputs.value().includes(i))
            ? this.deselectAll()
            : this.selectAll();
    }
    /** Sets the selection to only the current active item. */
    selectOne() {
        const item = this.inputs.focusManager.inputs.activeItem();
        if (item && item.disabled()) {
            return;
        }
        this.deselectAll();
        if (this.inputs.value().length > 0 && !this.inputs.multi()) {
            return;
        }
        this.select();
    }
    /**
     * Selects all items in the list up to the anchor item.
     *
     * Deselects all items that were previously within the
     * selected range that are now outside of the selected range
     */
    selectRange(opts = { anchor: true }) {
        const isStartOfRange = this.inputs.focusManager.prevActiveIndex() === this.rangeStartIndex();
        if (isStartOfRange && opts.anchor) {
            this.beginRangeSelection(this.inputs.focusManager.prevActiveIndex());
        }
        const itemsInRange = this._getItemsFromIndex(this.rangeStartIndex());
        const itemsOutOfRange = this._getItemsFromIndex(this.rangeEndIndex()).filter(i => !itemsInRange.includes(i));
        for (const item of itemsOutOfRange) {
            this.deselect(item);
        }
        for (const item of itemsInRange) {
            this.select(item, { anchor: false });
        }
        if (itemsInRange.length) {
            const item = itemsInRange.pop();
            const index = this.inputs.items().findIndex(i => i === item);
            this.rangeEndIndex.set(index);
        }
    }
    /** Marks the given index as the start of a range selection. */
    beginRangeSelection(index = this.inputs.focusManager.activeIndex()) {
        this.rangeStartIndex.set(index);
        this.rangeEndIndex.set(index);
    }
    /** Returns the items in the list starting from the given index.  */
    _getItemsFromIndex(index) {
        if (index === -1) {
            return [];
        }
        const upper = Math.max(this.inputs.focusManager.activeIndex(), index);
        const lower = Math.min(this.inputs.focusManager.activeIndex(), index);
        const items = [];
        for (let i = lower; i <= upper; i++) {
            items.push(this.inputs.items()[i]);
        }
        if (this.inputs.focusManager.activeIndex() < index) {
            return items.reverse();
        }
        return items;
    }
}

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
            this._startIndex.set(this.focusManager.activeIndex());
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

/** Controls the state of a list. */
class List {
    inputs;
    /** Controls navigation for the list. */
    navigationBehavior;
    /** Controls selection for the list. */
    selectionBehavior;
    /** Controls typeahead for the list. */
    typeaheadBehavior;
    /** Controls focus for the list. */
    focusBehavior;
    /** Whether the list is disabled. */
    disabled = computed(() => this.focusBehavior.isListDisabled());
    /** The id of the current active item. */
    activedescendant = computed(() => this.focusBehavior.getActiveDescendant());
    /** The tabindex of the list. */
    tabindex = computed(() => this.focusBehavior.getListTabindex());
    /** The index of the currently active item in the list. */
    activeIndex = computed(() => this.focusBehavior.activeIndex());
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
    _anchorIndex = signal(0);
    /** Whether the list should wrap. Used to disable wrapping while range selecting. */
    _wrap = signal(true);
    constructor(inputs) {
        this.inputs = inputs;
        this.focusBehavior = new ListFocus(inputs);
        this.selectionBehavior = new ListSelection({ ...inputs, focusManager: this.focusBehavior });
        this.typeaheadBehavior = new ListTypeahead({ ...inputs, focusManager: this.focusBehavior });
        this.navigationBehavior = new ListNavigation({
            ...inputs,
            focusManager: this.focusBehavior,
            wrap: computed(() => this._wrap() && this.inputs.wrap()),
        });
    }
    /** Returns the tabindex for the given item. */
    getItemTabindex(item) {
        return this.focusBehavior.getItemTabindex(item);
    }
    /** Navigates to the first option in the list. */
    first(opts) {
        this._navigate(opts, () => this.navigationBehavior.first());
    }
    /** Navigates to the last option in the list. */
    last(opts) {
        this._navigate(opts, () => this.navigationBehavior.last());
    }
    /** Navigates to the next option in the list. */
    next(opts) {
        this._navigate(opts, () => this.navigationBehavior.next());
    }
    /** Navigates to the previous option in the list. */
    prev(opts) {
        this._navigate(opts, () => this.navigationBehavior.prev());
    }
    /** Navigates to the given item in the list. */
    goto(item, opts) {
        this._navigate(opts, () => this.navigationBehavior.goto(item));
    }
    /** Marks the given index as the potential start of a range selection. */
    anchor(index) {
        this._anchorIndex.set(index);
    }
    /** Handles typeahead search navigation for the list. */
    search(char, opts) {
        this._navigate(opts, () => this.typeaheadBehavior.search(char));
    }
    /** Checks if the list is currently typing for typeahead search. */
    isTyping() {
        return this.typeaheadBehavior.isTyping();
    }
    /** Selects the currently active item in the list. */
    select() {
        this.selectionBehavior.select();
    }
    /** Sets the selection to only the current active item. */
    selectOne() {
        this.selectionBehavior.selectOne();
    }
    /** Deselects the currently active item in the list. */
    deselect() {
        this.selectionBehavior.deselect();
    }
    /** Deselects all items in the list. */
    deselectAll() {
        this.selectionBehavior.deselectAll();
    }
    /** Toggles the currently active item in the list. */
    toggle() {
        this.selectionBehavior.toggle();
    }
    /** Toggles the currently active item in the list, deselecting all other items. */
    toggleOne() {
        this.selectionBehavior.toggleOne();
    }
    /** Toggles the selection of all items in the list. */
    toggleAll() {
        this.selectionBehavior.toggleAll();
    }
    /** Checks if the given item is able to receive focus. */
    isFocusable(item) {
        return this.focusBehavior.isFocusable(item);
    }
    /** Handles updating selection for the list. */
    updateSelection(opts = { anchor: true }) {
        if (opts.toggle) {
            this.selectionBehavior.toggle();
        }
        if (opts.select) {
            this.selectionBehavior.select();
        }
        if (opts.selectOne) {
            this.selectionBehavior.selectOne();
        }
        if (opts.selectRange) {
            this.selectionBehavior.selectRange();
        }
        if (!opts.anchor) {
            this.anchor(this.selectionBehavior.rangeStartIndex());
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
            this._wrap.set(false);
            this.selectionBehavior.rangeStartIndex.set(this._anchorIndex());
        }
        const moved = operation();
        if (moved) {
            this.updateSelection(opts);
        }
        this._wrap.set(true);
    }
}

export { List };
//# sourceMappingURL=list-DDPL6e4b.mjs.map
