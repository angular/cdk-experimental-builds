import { SignalLike } from './list-navigation.d.js';

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

export { KeyboardEventManager, PointerEventManager };
