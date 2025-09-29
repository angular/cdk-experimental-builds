import { signal, computed } from '@angular/core';
import { KeyboardEventManager, PointerEventManager } from './pointer-event-manager-B6GE9jDm.mjs';

/** Controls the state of a combobox. */
class ComboboxPattern {
    inputs;
    /** Whether the combobox is expanded. */
    expanded = signal(false);
    /** The ID of the active item in the combobox. */
    activedescendant = computed(() => this.inputs.popupControls()?.activeId() ?? null);
    /** The currently highlighted item in the combobox. */
    highlightedItem = signal(undefined);
    /** Whether the most recent input event was a deletion. */
    isDeleting = false;
    /** Whether the combobox is focused. */
    isFocused = signal(false);
    /** The key used to navigate to the previous item in the list. */
    expandKey = computed(() => 'ArrowRight'); // TODO: RTL support.
    /** The key used to navigate to the next item in the list. */
    collapseKey = computed(() => 'ArrowLeft'); // TODO: RTL support.
    /** The ID of the popup associated with the combobox. */
    popupId = computed(() => this.inputs.popupControls()?.id() || null);
    /** The autocomplete behavior of the combobox. */
    autocomplete = computed(() => (this.inputs.filterMode() === 'highlight' ? 'both' : 'list'));
    /** The ARIA role of the popup associated with the combobox. */
    hasPopup = computed(() => this.inputs.popupControls()?.role() || null);
    /** The keydown event manager for the combobox. */
    keydown = computed(() => {
        if (!this.expanded()) {
            return new KeyboardEventManager()
                .on('ArrowDown', () => this.open({ first: true }))
                .on('ArrowUp', () => this.open({ last: true }));
        }
        const popupControls = this.inputs.popupControls();
        if (!popupControls) {
            return new KeyboardEventManager();
        }
        const manager = new KeyboardEventManager()
            .on('ArrowDown', () => this.next())
            .on('ArrowUp', () => this.prev())
            .on('Home', () => this.first())
            .on('End', () => this.last())
            .on('Escape', () => {
            // TODO(wagnermaciel): We may want to fold this logic into the close() method.
            if (this.inputs.filterMode() === 'highlight' && popupControls.activeId()) {
                popupControls.unfocus();
                popupControls.clearSelection();
                const inputEl = this.inputs.inputEl();
                if (inputEl) {
                    inputEl.value = this.inputs.inputValue();
                }
            }
            else {
                this.close();
                this.inputs.popupControls()?.clearSelection();
            }
        }) // TODO: When filter mode is 'highlight', escape should revert to the last committed value.
            .on('Enter', () => this.select({ commit: true, close: true }));
        if (popupControls.role() === 'tree') {
            const treeControls = popupControls;
            if (treeControls.isItemExpandable() || treeControls.isItemCollapsible()) {
                manager.on(this.collapseKey(), () => this.collapseItem());
            }
            if (treeControls.isItemExpandable()) {
                manager.on(this.expandKey(), () => this.expandItem());
            }
        }
        return manager;
    });
    /** The pointerup event manager for the combobox. */
    pointerup = computed(() => new PointerEventManager().on(e => {
        const item = this.inputs.popupControls()?.getItem(e);
        if (item) {
            this.select({ item, commit: true, close: true });
            this.inputs.inputEl()?.focus(); // Return focus to the input after selecting.
        }
        if (e.target === this.inputs.inputEl()) {
            this.open();
        }
    }));
    constructor(inputs) {
        this.inputs = inputs;
    }
    /** Handles keydown events for the combobox. */
    onKeydown(event) {
        this.keydown().handle(event);
    }
    /** Handles pointerup events for the combobox. */
    onPointerup(event) {
        this.pointerup().handle(event);
    }
    /** Handles input events for the combobox. */
    onInput(event) {
        const inputEl = this.inputs.inputEl();
        if (!inputEl) {
            return;
        }
        this.open();
        this.inputs.inputValue?.set(inputEl.value);
        this.isDeleting = event instanceof InputEvent && !!event.inputType.match(/^delete/);
        if (this.inputs.filterMode() === 'manual') {
            const searchTerm = this.inputs.popupControls()?.getSelectedItem()?.searchTerm();
            if (searchTerm && this.inputs.inputValue() !== searchTerm) {
                this.inputs.popupControls()?.clearSelection();
            }
        }
    }
    onFocusIn() {
        this.isFocused.set(true);
    }
    /** Handles focus out events for the combobox. */
    onFocusOut(event) {
        if (!(event.relatedTarget instanceof HTMLElement) ||
            !this.inputs.containerEl()?.contains(event.relatedTarget)) {
            this.isFocused.set(false);
            if (this.inputs.filterMode() !== 'manual') {
                this.commit();
            }
            else {
                const item = this.inputs
                    .popupControls()
                    ?.items()
                    .find(i => i.searchTerm() === this.inputs.inputEl()?.value);
                if (item) {
                    this.select({ item });
                }
            }
            this.close();
        }
    }
    firstMatch = computed(() => {
        // TODO(wagnermaciel): Consider whether we should not provide this default behavior for the
        // listbox. Instead, we may want to allow users to have no match so that typing does not focus
        // any option.
        if (this.inputs.popupControls()?.role() === 'listbox') {
            return this.inputs.popupControls()?.items()[0];
        }
        return this.inputs
            .popupControls()
            ?.items()
            .find(i => i.value() === this.inputs.firstMatch());
    });
    onFilter() {
        // TODO(wagnermaciel)
        // When the user first interacts with the combobox, the popup will lazily render for the first
        // time. This is a simple way to detect this and avoid auto-focus & selection logic, but this
        // should probably be moved to the component layer instead.
        const isInitialRender = !this.inputs.inputValue?.().length && !this.isDeleting;
        if (isInitialRender) {
            return;
        }
        // Avoid refocusing the input if a filter event occurs after focus has left the combobox.
        if (!this.isFocused()) {
            return;
        }
        if (this.inputs.popupControls()?.role() === 'tree') {
            const treeControls = this.inputs.popupControls();
            this.inputs.inputValue?.().length ? treeControls.expandAll() : treeControls.collapseAll();
        }
        const item = this.firstMatch();
        if (!item) {
            this.inputs.popupControls()?.clearSelection();
            this.inputs.popupControls()?.unfocus();
            return;
        }
        this.inputs.popupControls()?.focus(item);
        if (this.inputs.filterMode() !== 'manual') {
            this.select({ item });
        }
        if (this.inputs.filterMode() === 'highlight' && !this.isDeleting) {
            this.highlight();
        }
    }
    highlight() {
        const inputEl = this.inputs.inputEl();
        const item = this.inputs.popupControls()?.getSelectedItem();
        if (!inputEl || !item) {
            return;
        }
        const isHighlightable = item
            .searchTerm()
            .toLowerCase()
            .startsWith(this.inputs.inputValue().toLowerCase());
        if (isHighlightable) {
            inputEl.value =
                this.inputs.inputValue() + item.searchTerm().slice(this.inputs.inputValue().length);
            inputEl.setSelectionRange(this.inputs.inputValue().length, item.searchTerm().length);
            this.highlightedItem.set(item);
        }
    }
    /** Closes the combobox. */
    close() {
        this.expanded.set(false);
        this.inputs.popupControls()?.unfocus();
    }
    /** Opens the combobox. */
    open(nav) {
        this.expanded.set(true);
        if (nav?.first) {
            this.first();
        }
        if (nav?.last) {
            this.last();
        }
    }
    /** Navigates to the next focusable item in the combobox popup. */
    next() {
        this._navigate(() => this.inputs.popupControls()?.next());
    }
    /** Navigates to the previous focusable item in the combobox popup. */
    prev() {
        this._navigate(() => this.inputs.popupControls()?.prev());
    }
    /** Navigates to the first focusable item in the combobox popup. */
    first() {
        this._navigate(() => this.inputs.popupControls()?.first());
    }
    /** Navigates to the last focusable item in the combobox popup. */
    last() {
        this._navigate(() => this.inputs.popupControls()?.last());
    }
    collapseItem() {
        const controls = this.inputs.popupControls();
        this._navigate(() => controls?.collapseItem());
    }
    expandItem() {
        const controls = this.inputs.popupControls();
        this._navigate(() => controls?.expandItem());
    }
    /** Selects an item in the combobox popup. */
    select(opts = {}) {
        this.inputs.popupControls()?.select(opts.item);
        if (opts.commit) {
            this.commit();
        }
        if (opts.close) {
            this.close();
        }
    }
    /** Updates the value of the input based on the currently selected item. */
    commit() {
        const inputEl = this.inputs.inputEl();
        const item = this.inputs.popupControls()?.getSelectedItem();
        if (inputEl && item) {
            inputEl.value = item.searchTerm();
            this.inputs.inputValue?.set(item.searchTerm());
            if (this.inputs.filterMode() === 'highlight') {
                const length = inputEl.value.length;
                inputEl.setSelectionRange(length, length);
            }
        }
    }
    /** Navigates and handles additional actions based on filter mode. */
    _navigate(operation) {
        operation();
        if (this.inputs.filterMode() !== 'manual') {
            this.select();
        }
        if (this.inputs.filterMode() === 'highlight') {
            // This is to handle when the user navigates back to the originally highlighted item.
            // E.g. User types "Al", highlights "Alice", then navigates down and back up to "Alice".
            const selectedItem = this.inputs.popupControls()?.getSelectedItem();
            if (!selectedItem) {
                return;
            }
            if (selectedItem === this.highlightedItem()) {
                this.highlight();
            }
            else {
                const inputEl = this.inputs.inputEl();
                inputEl.value = selectedItem?.searchTerm();
            }
        }
    }
}

export { ComboboxPattern };
//# sourceMappingURL=combobox-ZZC2YlgZ.mjs.map
