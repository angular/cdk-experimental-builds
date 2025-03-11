import { signal, computed } from '@angular/core';

/** Bit flag representation of the possible modifier keys that can be present on an event. */
var ModifierKey;
(function (ModifierKey) {
    ModifierKey[ModifierKey["None"] = 0] = "None";
    ModifierKey[ModifierKey["Ctrl"] = 1] = "Ctrl";
    ModifierKey[ModifierKey["Shift"] = 2] = "Shift";
    ModifierKey[ModifierKey["Alt"] = 4] = "Alt";
    ModifierKey[ModifierKey["Meta"] = 8] = "Meta";
})(ModifierKey || (ModifierKey = {}));
/**
 * Abstract base class for all event managers.
 *
 * Event managers are designed to normalize how event handlers are authored and create a safety net
 * for common event handling gotchas like remembering to call preventDefault or stopPropagation.
 */
class EventManager {
    configs = [];
    /** Runs the handlers that match with the given event. */
    handle(event) {
        for (const config of this.configs) {
            if (config.matcher(event)) {
                config.handler(event);
                if (config.preventDefault) {
                    event.preventDefault();
                }
                if (config.stopPropagation) {
                    event.stopPropagation();
                }
            }
        }
    }
}
/** Gets bit flag representation of the modifier keys present on the given event. */
function getModifiers(event) {
    return ((+event.ctrlKey && ModifierKey.Ctrl) |
        (+event.shiftKey && ModifierKey.Shift) |
        (+event.altKey && ModifierKey.Alt) |
        (+event.metaKey && ModifierKey.Meta));
}
/**
 * Checks if the given event has modifiers that are an exact match for any of the given modifier
 * flag combinations.
 */
function hasModifiers(event, modifiers) {
    const eventModifiers = getModifiers(event);
    const modifiersList = Array.isArray(modifiers) ? modifiers : [modifiers];
    return modifiersList.some(modifiers => eventModifiers === modifiers);
}

/**
 * An event manager that is specialized for handling keyboard events. By default this manager stops
 * propagation and prevents default on all events it handles.
 */
class KeyboardEventManager extends EventManager {
    options = {
        preventDefault: true,
        stopPropagation: true,
    };
    on(...args) {
        const { modifiers, key, handler } = this._normalizeInputs(...args);
        this.configs.push({
            handler: handler,
            matcher: event => this._isMatch(event, key, modifiers),
            ...this.options,
        });
        return this;
    }
    _normalizeInputs(...args) {
        const key = args.length === 3 ? args[1] : args[0];
        const handler = args.length === 3 ? args[2] : args[1];
        const modifiers = args.length === 3 ? args[0] : ModifierKey.None;
        return {
            key: key,
            handler: handler,
            modifiers: modifiers,
        };
    }
    _isMatch(event, key, modifiers) {
        if (key instanceof RegExp) {
            return key.test(event.key);
        }
        const keyStr = typeof key === 'string' ? key : key();
        return keyStr.toLowerCase() === event.key.toLowerCase() && hasModifiers(event, modifiers);
    }
}

/**
 * The different mouse buttons that may appear on a pointer event.
 */
var MouseButton;
(function (MouseButton) {
    MouseButton[MouseButton["Main"] = 0] = "Main";
    MouseButton[MouseButton["Auxiliary"] = 1] = "Auxiliary";
    MouseButton[MouseButton["Secondary"] = 2] = "Secondary";
})(MouseButton || (MouseButton = {}));
/** An event manager that is specialized for handling pointer events. */
class PointerEventManager extends EventManager {
    options = {
        preventDefault: false,
        stopPropagation: false,
    };
    on(...args) {
        const { button, handler, modifiers } = this._normalizeInputs(...args);
        this.configs.push({
            handler,
            matcher: event => this._isMatch(event, button, modifiers),
            ...this.options,
        });
        return this;
    }
    _normalizeInputs(...args) {
        if (args.length === 3) {
            return {
                button: args[0],
                modifiers: args[1],
                handler: args[2],
            };
        }
        if (typeof args[0] === 'number' && typeof args[1] === 'function') {
            return {
                button: MouseButton.Main,
                modifiers: args[0],
                handler: args[1],
            };
        }
        return {
            button: MouseButton.Main,
            modifiers: ModifierKey.None,
            handler: args[0],
        };
    }
    _isMatch(event, button, modifiers) {
        return button === (event.button ?? 0) && hasModifiers(event, modifiers);
    }
}

/** Controls selection for a list of items. */
class ListSelection {
    inputs;
    /** The id of the most recently selected item. */
    previousSelectedId = signal(undefined);
    /** The navigation controller of the parent list. */
    navigation;
    constructor(inputs) {
        this.inputs = inputs;
        this.navigation = inputs.navigation;
    }
    /** Selects the item at the current active index. */
    select(item) {
        item = item ?? this.inputs.items()[this.inputs.navigation.inputs.activeIndex()];
        if (item.disabled() || this.inputs.selectedIds().includes(item.id())) {
            return;
        }
        if (!this.inputs.multiselectable()) {
            this.deselectAll();
        }
        // TODO: Need to discuss when to drop this.
        this._anchor();
        this.inputs.selectedIds.update(ids => ids.concat(item.id()));
    }
    /** Deselects the item at the current active index. */
    deselect(item) {
        item = item ?? this.inputs.items()[this.inputs.navigation.inputs.activeIndex()];
        if (!item.disabled()) {
            this.inputs.selectedIds.update(ids => ids.filter(id => id !== item.id()));
        }
    }
    /** Toggles the item at the current active index. */
    toggle() {
        const item = this.inputs.items()[this.inputs.navigation.inputs.activeIndex()];
        this.inputs.selectedIds().includes(item.id()) ? this.deselect() : this.select();
    }
    /** Toggles only the item at the current active index. */
    toggleOne() {
        const item = this.inputs.items()[this.inputs.navigation.inputs.activeIndex()];
        this.inputs.selectedIds().includes(item.id()) ? this.deselect() : this.selectOne();
    }
    /** Selects all items in the list. */
    selectAll() {
        if (!this.inputs.multiselectable()) {
            return; // Should we log a warning?
        }
        for (const item of this.inputs.items()) {
            this.select(item);
        }
        this._anchor();
    }
    /** Deselects all items in the list. */
    deselectAll() {
        for (const item of this.inputs.items()) {
            this.deselect(item);
        }
    }
    /** Selects the items in the list starting at the last selected item. */
    selectFromPrevSelectedItem() {
        const prevSelectedId = this.inputs.items().findIndex(i => this.previousSelectedId() === i.id());
        this._selectFromIndex(prevSelectedId);
    }
    /** Selects the items in the list starting at the last active item. */
    selectFromActive() {
        this._selectFromIndex(this.inputs.navigation.prevActiveIndex());
    }
    /** Selects the items in the list starting at the given index. */
    _selectFromIndex(index) {
        if (index === -1) {
            return;
        }
        const upper = Math.max(this.inputs.navigation.inputs.activeIndex(), index);
        const lower = Math.min(this.inputs.navigation.inputs.activeIndex(), index);
        for (let i = lower; i <= upper; i++) {
            this.select(this.inputs.items()[i]);
        }
    }
    /** Sets the selection to only the current active item. */
    selectOne() {
        this.deselectAll();
        this.select();
    }
    /** Sets the anchor to the current active index. */
    _anchor() {
        const item = this.inputs.items()[this.inputs.navigation.inputs.activeIndex()];
        this.previousSelectedId.set(item.id());
    }
}

/** Controls typeahead for a list of items. */
class ListTypeahead {
    inputs;
    /** A reference to the timeout for resetting the typeahead search. */
    timeout;
    /** The navigation controller of the parent list. */
    navigation;
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

/** Controls navigation for a list of items. */
class ListNavigation {
    inputs;
    /** The last index that was active. */
    prevActiveIndex = signal(0);
    constructor(inputs) {
        this.inputs = inputs;
        this.prevActiveIndex.set(inputs.activeIndex());
    }
    /** Navigates to the given item. */
    goto(item) {
        if (this.isFocusable(item)) {
            this.prevActiveIndex.set(this.inputs.activeIndex());
            const index = this.inputs.items().indexOf(item);
            this.inputs.activeIndex.set(index);
        }
    }
    /** Navigates to the next item in the list. */
    next() {
        this._advance(1);
    }
    /** Navigates to the previous item in the list. */
    prev() {
        this._advance(-1);
    }
    /** Navigates to the first item in the list. */
    first() {
        const item = this.inputs.items().find(i => this.isFocusable(i));
        if (item) {
            this.goto(item);
        }
    }
    /** Navigates to the last item in the list. */
    last() {
        const items = this.inputs.items();
        for (let i = items.length - 1; i >= 0; i--) {
            if (this.isFocusable(items[i])) {
                this.goto(items[i]);
                return;
            }
        }
    }
    /** Returns true if the given item can be navigated to. */
    isFocusable(item) {
        return !item.disabled() || !this.inputs.skipDisabled();
    }
    /** Advances to the next or previous focusable item in the list based on the given delta. */
    _advance(delta) {
        const items = this.inputs.items();
        const itemCount = items.length;
        const startIndex = this.inputs.activeIndex();
        const step = (i) => this.inputs.wrap() ? (i + delta + itemCount) % itemCount : i + delta;
        // If wrapping is enabled, this loop ultimately terminates when `i` gets back to `startIndex`
        // in the case that all options are disabled. If wrapping is disabled, the loop terminates
        // when the index goes out of bounds.
        for (let i = step(startIndex); i !== startIndex && i < itemCount && i >= 0; i = step(i)) {
            if (this.isFocusable(items[i])) {
                this.goto(items[i]);
                return;
            }
        }
    }
}

/** Controls focus for a list of items. */
class ListFocus {
    inputs;
    /** The navigation controller of the parent list. */
    navigation;
    constructor(inputs) {
        this.inputs = inputs;
        this.navigation = inputs.navigation;
    }
    /** The id of the current active item. */
    getActiveDescendant() {
        if (this.inputs.focusMode() === 'roving') {
            return undefined;
        }
        return this.navigation.inputs.items()[this.navigation.inputs.activeIndex()].id();
    }
    /** The tabindex for the list. */
    getListTabindex() {
        return this.inputs.focusMode() === 'activedescendant' ? 0 : -1;
    }
    /** Returns the tabindex for the given item. */
    getItemTabindex(item) {
        if (this.inputs.focusMode() === 'activedescendant') {
            return -1;
        }
        const index = this.navigation.inputs.items().indexOf(item);
        return this.navigation.inputs.activeIndex() === index ? 0 : -1;
    }
    /** Focuses the current active item. */
    focus() {
        if (this.inputs.focusMode() === 'activedescendant') {
            return;
        }
        const item = this.navigation.inputs.items()[this.navigation.inputs.activeIndex()];
        item.element().focus();
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
    /** The tabindex of the listbox. */
    tabindex = computed(() => this.focusManager.getListTabindex());
    /** The id of the current active item. */
    activedescendant = computed(() => this.focusManager.getActiveDescendant());
    /** Whether multiple items in the list can be selected at once. */
    multiselectable;
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
    /** The regexp used to decide if a key should trigger typeahead. */
    typeaheadRegexp = /^.$/; // TODO: Ignore spaces?
    /** The keydown event manager for the listbox. */
    keydown = computed(() => {
        const manager = new KeyboardEventManager();
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
        if (this.inputs.multiselectable()) {
            manager
                .on(ModifierKey.Shift, ' ', () => this._updateSelection({ selectFromAnchor: true }))
                .on(ModifierKey.Shift, 'Enter', () => this._updateSelection({ selectFromAnchor: true }))
                .on(ModifierKey.Shift, this.prevKey, () => this.prev({ toggle: true }))
                .on(ModifierKey.Shift, this.nextKey, () => this.next({ toggle: true }))
                .on(ModifierKey.Ctrl | ModifierKey.Shift, 'Home', () => this.first({ selectFromActive: true }))
                .on(ModifierKey.Ctrl | ModifierKey.Shift, 'End', () => this.last({ selectFromActive: true }))
                .on(ModifierKey.Ctrl, 'A', () => this._updateSelection({ selectAll: true }));
        }
        if (!this.followFocus() && this.inputs.multiselectable()) {
            manager.on(' ', () => this._updateSelection({ toggle: true }));
            manager.on('Enter', () => this._updateSelection({ toggle: true }));
        }
        if (!this.followFocus() && !this.inputs.multiselectable()) {
            manager.on(' ', () => this._updateSelection({ toggleOne: true }));
            manager.on('Enter', () => this._updateSelection({ toggleOne: true }));
        }
        if (this.inputs.multiselectable() && this.followFocus()) {
            manager
                .on(ModifierKey.Ctrl, this.prevKey, () => this.prev())
                .on(ModifierKey.Ctrl, this.nextKey, () => this.next())
                .on(ModifierKey.Ctrl, 'Home', () => this.first()) // TODO: Not in spec but prob should be.
                .on(ModifierKey.Ctrl, 'End', () => this.last()); // TODO: Not in spec but prob should be.
        }
        return manager;
    });
    /** The pointerdown event manager for the listbox. */
    pointerdown = computed(() => {
        const manager = new PointerEventManager();
        if (this.inputs.multiselectable()) {
            manager
                .on(e => this.goto(e, { toggle: true }))
                .on(ModifierKey.Shift, e => this.goto(e, { selectFromActive: true }));
        }
        else {
            manager.on(e => this.goto(e, { toggleOne: true }));
        }
        return manager;
    });
    constructor(inputs) {
        this.inputs = inputs;
        this.disabled = inputs.disabled;
        this.orientation = inputs.orientation;
        this.multiselectable = inputs.multiselectable;
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
    }
    _getItem(e) {
        if (!(e.target instanceof HTMLElement)) {
            return;
        }
        const element = e.target.closest('[cdkoption]'); // TODO: Use a different identifier.
        return this.inputs.items().find(i => i.element() === element);
    }
}

/** Represents an option in a listbox. */
class OptionPattern {
    /** A unique identifier for the option. */
    id;
    /** The position of the option in the list. */
    index = computed(() => this.listbox()
        .navigation.inputs.items()
        .findIndex(i => i.id() === this.id()) ?? -1);
    /** Whether the option is selected. */
    selected = computed(() => this.listbox().selection.inputs.selectedIds().includes(this.id()));
    /** Whether the option is disabled. */
    disabled;
    /** The text used by the typeahead search. */
    searchTerm;
    /** A reference to the parent listbox. */
    listbox;
    /** The tabindex of the option. */
    tabindex = computed(() => this.listbox().focusManager.getItemTabindex(this));
    /** The html element that should receive focus. */
    element;
    constructor(args) {
        this.id = args.id;
        this.listbox = args.listbox;
        this.element = args.element;
        this.disabled = args.disabled;
        this.searchTerm = args.searchTerm;
    }
}

export { ListboxPattern as L, OptionPattern as O };
//# sourceMappingURL=option-d2bb1041.mjs.map
