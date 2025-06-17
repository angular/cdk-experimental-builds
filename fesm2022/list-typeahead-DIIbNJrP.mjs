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

export { ListTypeahead as L };
//# sourceMappingURL=list-typeahead-DIIbNJrP.mjs.map
