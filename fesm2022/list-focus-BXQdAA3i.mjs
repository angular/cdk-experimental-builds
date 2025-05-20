import { signal, computed } from '@angular/core';

/** Bit flag representation of the possible modifier keys that can be present on an event. */
var ModifierKey;
(function (ModifierKey) {
    ModifierKey[ModifierKey["None"] = 0] = "None";
    ModifierKey[ModifierKey["Ctrl"] = 1] = "Ctrl";
    ModifierKey[ModifierKey["Shift"] = 2] = "Shift";
    ModifierKey[ModifierKey["Alt"] = 4] = "Alt";
    ModifierKey[ModifierKey["Meta"] = 8] = "Meta";
    ModifierKey["Any"] = "Any";
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
    if (modifiersList.includes(ModifierKey.Any)) {
        return true;
    }
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
    /** Navigates to the previous item in the list. */
    prev() {
        return this._advance(-1);
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
        const items = this.inputs.items();
        const itemCount = items.length;
        const startIndex = this.inputs.activeIndex();
        const step = (i) => this.inputs.wrap() ? (i + delta + itemCount) % itemCount : i + delta;
        // If wrapping is enabled, this loop ultimately terminates when `i` gets back to `startIndex`
        // in the case that all options are disabled. If wrapping is disabled, the loop terminates
        // when the index goes out of bounds.
        for (let i = step(startIndex); i !== startIndex && i < itemCount && i >= 0; i = step(i)) {
            if (this.inputs.focusManager.isFocusable(items[i])) {
                return this.goto(items[i]);
            }
        }
        return false;
    }
}

/** Controls focus for a list of items. */
class ListFocus {
    inputs;
    /** The last index that was active. */
    prevActiveIndex = signal(0);
    /** The current active item. */
    activeItem = computed(() => this.inputs.items()[this.inputs.activeIndex()]);
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
        return this.inputs.items()[this.inputs.activeIndex()].id();
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
        return this.activeItem() === item ? 0 : -1;
    }
    /** Moves focus to the given item if it is focusable. */
    focus(item) {
        if (this.isListDisabled() || !this.isFocusable(item)) {
            return false;
        }
        this.prevActiveIndex.set(this.inputs.activeIndex());
        const index = this.inputs.items().indexOf(item);
        this.inputs.activeIndex.set(index);
        if (this.inputs.focusMode() === 'roving') {
            item.element().focus();
        }
        return true;
    }
    /** Returns true if the given item can be navigated to. */
    isFocusable(item) {
        return !item.disabled() || !this.inputs.skipDisabled();
    }
}

export { KeyboardEventManager as K, ListFocus as L, ModifierKey as M, PointerEventManager as P, ListNavigation as a };
//# sourceMappingURL=list-focus-BXQdAA3i.mjs.map
