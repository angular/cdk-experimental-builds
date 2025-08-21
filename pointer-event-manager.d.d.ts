import * as _angular_core from '@angular/core';

type SignalLike<T> = () => T;
interface WritableSignalLike<T> extends SignalLike<T> {
    set(value: T): void;
    update(updateFn: (value: T) => T): void;
}
/** Converts a getter setter style signal to a WritableSignalLike. */
declare function convertGetterSetterToWritableSignalLike<T>(getter: () => T, setter: (v: T) => void): WritableSignalLike<T>;

/** Represents an item in a collection, such as a listbox option, than may receive focus. */
interface ListFocusItem {
    /** A unique identifier for the item. */
    id: SignalLike<string>;
    /** The html element that should receive focus. */
    element: SignalLike<HTMLElement>;
    /** Whether an item is disabled. */
    disabled: SignalLike<boolean>;
    /** The index of the item in the list. */
    index: SignalLike<number>;
}
/** Represents the required inputs for a collection that contains focusable items. */
interface ListFocusInputs<T extends ListFocusItem> {
    /** The focus strategy used by the list. */
    focusMode: SignalLike<'roving' | 'activedescendant'>;
    /** Whether the list is disabled. */
    disabled: SignalLike<boolean>;
    /** The items in the list. */
    items: SignalLike<T[]>;
    /** The active item. */
    activeItem: WritableSignalLike<T | undefined>;
    /** Whether disabled items in the list should be skipped when navigating. */
    skipDisabled: SignalLike<boolean>;
    element: SignalLike<HTMLElement | undefined>;
}
/** Controls focus for a list of items. */
declare class ListFocus<T extends ListFocusItem> {
    readonly inputs: ListFocusInputs<T>;
    /** The last item that was active. */
    prevActiveItem: _angular_core.WritableSignal<T | undefined>;
    /** The index of the last item that was active. */
    prevActiveIndex: _angular_core.Signal<number>;
    /** The current active index in the list. */
    activeIndex: _angular_core.Signal<number>;
    constructor(inputs: ListFocusInputs<T>);
    /** Whether the list is in a disabled state. */
    isListDisabled(): boolean;
    /** The id of the current active item. */
    getActiveDescendant(): string | undefined;
    /** The tabindex for the list. */
    getListTabindex(): -1 | 0;
    /** Returns the tabindex for the given item. */
    getItemTabindex(item: T): -1 | 0;
    /** Moves focus to the given item if it is focusable. */
    focus(item: T): boolean;
    /** Returns true if the given item can be navigated to. */
    isFocusable(item: T): boolean;
}

/** Represents an item in a collection, such as a listbox option, than can be navigated to. */
interface ListNavigationItem extends ListFocusItem {
}
/** Represents the required inputs for a collection that has navigable items. */
interface ListNavigationInputs<T extends ListNavigationItem> extends ListFocusInputs<T> {
    /** Whether focus should wrap when navigating. */
    wrap: SignalLike<boolean>;
    /** Whether the list is vertically or horizontally oriented. */
    orientation: SignalLike<'vertical' | 'horizontal'>;
    /** The direction that text is read based on the users locale. */
    textDirection: SignalLike<'rtl' | 'ltr'>;
}
/** Controls navigation for a list of items. */
declare class ListNavigation<T extends ListNavigationItem> {
    readonly inputs: ListNavigationInputs<T> & {
        focusManager: ListFocus<T>;
    };
    constructor(inputs: ListNavigationInputs<T> & {
        focusManager: ListFocus<T>;
    });
    /** Navigates to the given item. */
    goto(item?: T): boolean;
    /** Navigates to the next item in the list. */
    next(): boolean;
    /** Navigates to the previous item in the list. */
    prev(): boolean;
    /** Navigates to the first item in the list. */
    first(): boolean;
    /** Navigates to the last item in the list. */
    last(): boolean;
    /** Advances to the next or previous focusable item in the list based on the given delta. */
    private _advance;
}

/**
 * Options that are applicable to all event handlers.
 *
 * This library has not yet had a need for stopPropagationImmediate.
 */
interface EventHandlerOptions {
    stopPropagation: boolean;
    preventDefault: boolean;
}
/** A basic event handler. */
type EventHandler<T extends Event> = (event: T) => void;
/** A function that determines whether an event is to be handled. */
type EventMatcher<T extends Event> = (event: T) => boolean;
/** A config that specifies how to handle a particular event. */
interface EventHandlerConfig<T extends Event> extends EventHandlerOptions {
    matcher: EventMatcher<T>;
    handler: EventHandler<T>;
}
/** Bit flag representation of the possible modifier keys that can be present on an event. */
declare enum Modifier {
    None = 0,
    Ctrl = 1,
    Shift = 2,
    Alt = 4,
    Meta = 8,
    Any = "Any"
}
type ModifierInputs = Modifier | Modifier[];
/**
 * Abstract base class for all event managers.
 *
 * Event managers are designed to normalize how event handlers are authored and create a safety net
 * for common event handling gotchas like remembering to call preventDefault or stopPropagation.
 */
declare abstract class EventManager<T extends Event> {
    protected configs: EventHandlerConfig<T>[];
    abstract options: EventHandlerOptions;
    /** Runs the handlers that match with the given event. */
    handle(event: T): void;
    /** Configures the event manager to handle specific events. (See subclasses for more). */
    abstract on(...args: [...unknown[]]): this;
}

/**
 * Used to represent a keycode.
 *
 * This is used to match whether an events keycode should be handled. The ability to match using a
 * string, SignalLike, or Regexp gives us more flexibility when authoring event handlers.
 */
type KeyCode = string | SignalLike<string> | RegExp;
/**
 * An event manager that is specialized for handling keyboard events. By default this manager stops
 * propagation and prevents default on all events it handles.
 */
declare class KeyboardEventManager<T extends KeyboardEvent> extends EventManager<T> {
    options: EventHandlerOptions;
    /** Configures this event manager to handle events with a specific key and no modifiers. */
    on(key: KeyCode, handler: EventHandler<T>): this;
    /**  Configures this event manager to handle events with a specific modifer and key combination. */
    on(modifiers: ModifierInputs, key: KeyCode, handler: EventHandler<T>): this;
    private _normalizeInputs;
    private _isMatch;
}

/**
 * The different mouse buttons that may appear on a pointer event.
 */
declare enum MouseButton {
    Main = 0,
    Auxiliary = 1,
    Secondary = 2
}
/** An event manager that is specialized for handling pointer events. */
declare class PointerEventManager<T extends PointerEvent> extends EventManager<T> {
    options: EventHandlerOptions;
    /**
     * Configures this event manager to handle events with a specific modifer and mouse button
     * combination.
     */
    on(button: MouseButton, modifiers: ModifierInputs, handler: EventHandler<T>): this;
    /**
     * Configures this event manager to handle events with a specific mouse button and no modifiers.
     */
    on(modifiers: ModifierInputs, handler: EventHandler<T>): this;
    /**
     * Configures this event manager to handle events with the main mouse button and no modifiers.
     *
     * @param handler The handler function
     * @param options Options for whether to stop propagation or prevent default.
     */
    on(handler: EventHandler<T>): this;
    private _normalizeInputs;
    _isMatch(event: PointerEvent, button: MouseButton, modifiers: ModifierInputs): boolean;
}

export { KeyboardEventManager, ListFocus, ListNavigation, PointerEventManager, convertGetterSetterToWritableSignalLike };
export type { ListFocusInputs, ListFocusItem, ListNavigationInputs, ListNavigationItem, SignalLike, WritableSignalLike };
