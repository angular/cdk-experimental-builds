import { signal } from '@angular/core';

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
        if (!hasModifiers(event, modifiers)) {
            return false;
        }
        if (key instanceof RegExp) {
            return key.test(event.key);
        }
        const keyStr = typeof key === 'string' ? key : key();
        return keyStr.toLowerCase() === event.key.toLowerCase();
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
    /** The value of the most recently selected item. */
    previousValue = signal(undefined);
    /** The navigation controller of the parent list. */
    navigation;
    constructor(inputs) {
        this.inputs = inputs;
        this.navigation = inputs.navigation;
    }
    /** Selects the item at the current active index. */
    select(item) {
        item = item ?? this.inputs.items()[this.inputs.navigation.inputs.activeIndex()];
        if (item.disabled() || this.inputs.value().includes(item.value())) {
            return;
        }
        if (!this.inputs.multi()) {
            this.deselectAll();
        }
        // TODO: Need to discuss when to drop this.
        this._anchor();
        this.inputs.value.update(values => values.concat(item.value()));
    }
    /** Deselects the item at the current active index. */
    deselect(item) {
        item = item ?? this.inputs.items()[this.inputs.navigation.inputs.activeIndex()];
        if (!item.disabled()) {
            this.inputs.value.update(values => values.filter(value => value !== item.value()));
        }
    }
    /** Toggles the item at the current active index. */
    toggle() {
        const item = this.inputs.items()[this.inputs.navigation.inputs.activeIndex()];
        this.inputs.value().includes(item.value()) ? this.deselect() : this.select();
    }
    /** Toggles only the item at the current active index. */
    toggleOne() {
        const item = this.inputs.items()[this.inputs.navigation.inputs.activeIndex()];
        this.inputs.value().includes(item.value()) ? this.deselect() : this.selectOne();
    }
    /** Selects all items in the list. */
    selectAll() {
        if (!this.inputs.multi()) {
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
        const previousValue = this.inputs.items().findIndex(i => this.previousValue() === i.value());
        this._selectFromIndex(previousValue);
    }
    /** Selects the items in the list starting at the last active item. */
    selectFromActive() {
        this._selectFromIndex(this.inputs.navigation.prevActiveIndex());
    }
    /** Sets the selection to only the current active item. */
    selectOne() {
        this.deselectAll();
        this.select();
    }
    /** Toggles the items in the list starting at the last selected item. */
    toggleFromPrevSelectedItem() {
        const prevIndex = this.inputs.items().findIndex(i => this.previousValue() === i.value());
        const currIndex = this.inputs.navigation.inputs.activeIndex();
        const currValue = this.inputs.items()[currIndex].value();
        const items = this._getItemsFromIndex(prevIndex);
        const operation = this.inputs.value().includes(currValue)
            ? this.deselect.bind(this)
            : this.select.bind(this);
        for (const item of items) {
            operation(item);
        }
    }
    /** Sets the anchor to the current active index. */
    _anchor() {
        const item = this.inputs.items()[this.inputs.navigation.inputs.activeIndex()];
        this.previousValue.set(item.value());
    }
    /** Selects the items in the list starting at the given index. */
    _selectFromIndex(index) {
        const items = this._getItemsFromIndex(index);
        for (const item of items) {
            this.select(item);
        }
    }
    /** Returns all items from the given index to the current active index. */
    _getItemsFromIndex(index) {
        if (index === -1) {
            return [];
        }
        const upper = Math.max(this.inputs.navigation.inputs.activeIndex(), index);
        const lower = Math.min(this.inputs.navigation.inputs.activeIndex(), index);
        const items = [];
        for (let i = lower; i <= upper; i++) {
            items.push(this.inputs.items()[i]);
        }
        return items;
    }
}

/** Controls navigation for a list of items. */
class ListNavigation {
    inputs;
    /** The last index that was active. */
    prevActiveIndex = signal(0);
    constructor(inputs) {
        this.inputs = inputs;
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
        if (this.navigation.inputs.items().length) {
            return this.navigation.inputs.items()[this.navigation.inputs.activeIndex()].id();
        }
        return undefined;
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

export { KeyboardEventManager, ListFocus, ListNavigation, ListSelection, ModifierKey, PointerEventManager };
//# sourceMappingURL=list-focus-DtTH4bDx.mjs.map
