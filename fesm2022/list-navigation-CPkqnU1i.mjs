import { signal, computed } from '@angular/core';

/** Controls focus for a list of items. */
class ListFocus {
    inputs;
    /** The last item that was active. */
    prevActiveItem = signal(undefined);
    /** The index of the last item that was active. */
    prevActiveIndex = computed(() => {
        return this.prevActiveItem() ? this.inputs.items().indexOf(this.prevActiveItem()) : -1;
    });
    /** The current active index in the list. */
    activeIndex = computed(() => {
        return this.inputs.activeItem() ? this.inputs.items().indexOf(this.inputs.activeItem()) : -1;
    });
    constructor(inputs) {
        this.inputs = inputs;
    }
    /** Whether the list is in a disabled state. */
    isListDisabled() {
        return this.inputs.disabled() || this.inputs.items().every(i => i.disabled());
    }
    /** The id of the current active item. */
    getActiveDescendant() {
        if (this.isListDisabled()) {
            return undefined;
        }
        if (this.inputs.focusMode() === 'roving') {
            return undefined;
        }
        return this.inputs.activeItem()?.id() ?? undefined;
    }
    /** The tabindex for the list. */
    getListTabindex() {
        if (this.isListDisabled()) {
            return 0;
        }
        return this.inputs.focusMode() === 'activedescendant' ? 0 : -1;
    }
    /** Returns the tabindex for the given item. */
    getItemTabindex(item) {
        if (this.isListDisabled()) {
            return -1;
        }
        if (this.inputs.focusMode() === 'activedescendant') {
            return -1;
        }
        return this.inputs.activeItem() === item ? 0 : -1;
    }
    /** Moves focus to the given item if it is focusable. */
    focus(item) {
        if (this.isListDisabled() || !this.isFocusable(item)) {
            return false;
        }
        this.prevActiveItem.set(this.inputs.activeItem());
        this.inputs.activeItem.set(item);
        this.inputs.focusMode() === 'roving' ? item.element().focus() : this.inputs.element()?.focus();
        return true;
    }
    /** Returns true if the given item can be navigated to. */
    isFocusable(item) {
        return !item.disabled() || !this.inputs.skipDisabled();
    }
}

/** Controls navigation for a list of items. */
class ListNavigation {
    inputs;
    constructor(inputs) {
        this.inputs = inputs;
    }
    /** Navigates to the given item. */
    goto(item) {
        return item ? this.inputs.focusManager.focus(item) : false;
    }
    /** Navigates to the next item in the list. */
    next() {
        return this._advance(1);
    }
    /** Peeks the next item in the list. */
    peekNext() {
        return this._peek(1);
    }
    /** Navigates to the previous item in the list. */
    prev() {
        return this._advance(-1);
    }
    /** Peeks the previous item in the list. */
    peekPrev() {
        return this._peek(-1);
    }
    /** Navigates to the first item in the list. */
    first() {
        const item = this.inputs.items().find(i => this.inputs.focusManager.isFocusable(i));
        return item ? this.goto(item) : false;
    }
    /** Navigates to the last item in the list. */
    last() {
        const items = this.inputs.items();
        for (let i = items.length - 1; i >= 0; i--) {
            if (this.inputs.focusManager.isFocusable(items[i])) {
                return this.goto(items[i]);
            }
        }
        return false;
    }
    /** Advances to the next or previous focusable item in the list based on the given delta. */
    _advance(delta) {
        const item = this._peek(delta);
        return item ? this.goto(item) : false;
    }
    /** Peeks the next or previous focusable item in the list based on the given delta. */
    _peek(delta) {
        const items = this.inputs.items();
        const itemCount = items.length;
        const startIndex = this.inputs.focusManager.activeIndex();
        const step = (i) => this.inputs.wrap() ? (i + delta + itemCount) % itemCount : i + delta;
        // If wrapping is enabled, this loop ultimately terminates when `i` gets back to `startIndex`
        // in the case that all options are disabled. If wrapping is disabled, the loop terminates
        // when the index goes out of bounds.
        for (let i = step(startIndex); i !== startIndex && i < itemCount && i >= 0; i = step(i)) {
            if (this.inputs.focusManager.isFocusable(items[i])) {
                return items[i];
            }
        }
        return;
    }
}

export { ListFocus, ListNavigation };
//# sourceMappingURL=list-navigation-CPkqnU1i.mjs.map
