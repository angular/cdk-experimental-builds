import * as i0 from '@angular/core';

type SignalLike<T> = () => T;
interface WritableSignalLike<T> extends SignalLike<T> {
    set(value: T): void;
    update(updateFn: (value: T) => T): void;
}
/** Converts a getter setter style signal to a WritableSignalLike. */
declare function convertGetterSetterToWritableSignalLike<T>(getter: () => T, setter: (v: T) => void): WritableSignalLike<T>;

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
declare enum ModifierKey {
    None = 0,
    Ctrl = 1,
    Shift = 2,
    Alt = 4,
    Meta = 8
}
type ModifierInputs = ModifierKey | ModifierKey[];
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

/** Represents an item in a collection, such as a listbox option, than can be navigated to. */
interface ListNavigationItem {
    /** Whether an item is disabled. */
    disabled: SignalLike<boolean>;
}
/** Represents the required inputs for a collection that has navigable items. */
interface ListNavigationInputs<T extends ListNavigationItem> {
    /** Whether focus should wrap when navigating. */
    wrap: SignalLike<boolean>;
    /** The items in the list. */
    items: SignalLike<T[]>;
    /** Whether disabled items in the list should be skipped when navigating. */
    skipDisabled: SignalLike<boolean>;
    /** The current index that has been navigated to. */
    activeIndex: WritableSignalLike<number>;
    /** Whether the list is vertically or horizontally oriented. */
    orientation: SignalLike<'vertical' | 'horizontal'>;
    /** The direction that text is read based on the users locale. */
    textDirection: SignalLike<'rtl' | 'ltr'>;
}
/** Controls navigation for a list of items. */
declare class ListNavigation<T extends ListNavigationItem> {
    readonly inputs: ListNavigationInputs<T>;
    /** The last index that was active. */
    prevActiveIndex: i0.WritableSignal<number>;
    constructor(inputs: ListNavigationInputs<T>);
    /** Navigates to the given item. */
    goto(item: T): void;
    /** Navigates to the next item in the list. */
    next(): void;
    /** Navigates to the previous item in the list. */
    prev(): void;
    /** Navigates to the first item in the list. */
    first(): void;
    /** Navigates to the last item in the list. */
    last(): void;
    /** Returns true if the given item can be navigated to. */
    isFocusable(item: T): boolean;
    /** Advances to the next or previous focusable item in the list based on the given delta. */
    private _advance;
}

/** Represents an item in a collection, such as a listbox option, than can be selected. */
interface ListSelectionItem<V> extends ListNavigationItem {
    /** The value of the item. */
    value: SignalLike<V>;
    /** Whether an item is disabled. */
    disabled: SignalLike<boolean>;
}
/** Represents the required inputs for a collection that contains selectable items. */
interface ListSelectionInputs<T extends ListSelectionItem<V>, V> {
    /** The items in the list. */
    items: SignalLike<T[]>;
    /** Whether multiple items in the list can be selected at once. */
    multi: SignalLike<boolean>;
    /** The current value of the list selection. */
    value: WritableSignalLike<V[]>;
    /** The selection strategy used by the list. */
    selectionMode: SignalLike<'follow' | 'explicit'>;
}
/** Controls selection for a list of items. */
declare class ListSelection<T extends ListSelectionItem<V>, V> {
    readonly inputs: ListSelectionInputs<T, V> & {
        navigation: ListNavigation<T>;
    };
    /** The value of the most recently selected item. */
    previousValue: i0.WritableSignal<V | undefined>;
    /** The navigation controller of the parent list. */
    navigation: ListNavigation<T>;
    constructor(inputs: ListSelectionInputs<T, V> & {
        navigation: ListNavigation<T>;
    });
    /** Selects the item at the current active index. */
    select(item?: T): void;
    /** Deselects the item at the current active index. */
    deselect(item?: T): void;
    /** Toggles the item at the current active index. */
    toggle(): void;
    /** Toggles only the item at the current active index. */
    toggleOne(): void;
    /** Selects all items in the list. */
    selectAll(): void;
    /** Deselects all items in the list. */
    deselectAll(): void;
    /** Selects the items in the list starting at the last selected item. */
    selectFromPrevSelectedItem(): void;
    /** Selects the items in the list starting at the last active item. */
    selectFromActive(): void;
    /** Selects the items in the list starting at the given index. */
    private _selectFromIndex;
    /** Sets the selection to only the current active item. */
    selectOne(): void;
    /** Sets the anchor to the current active index. */
    private _anchor;
}

/**
 * Represents an item in a collection, such as a listbox option, than can be navigated to by
 * typeahead.
 */
interface ListTypeaheadItem extends ListNavigationItem {
    /** The text used by the typeahead search. */
    searchTerm: SignalLike<string>;
}
/**
 * Represents the required inputs for a collection that contains items that can be navigated to by
 * typeahead.
 */
interface ListTypeaheadInputs {
    /** The amount of time before the typeahead search is reset. */
    typeaheadDelay: SignalLike<number>;
}
/** Controls typeahead for a list of items. */
declare class ListTypeahead<T extends ListTypeaheadItem> {
    readonly inputs: ListTypeaheadInputs & {
        navigation: ListNavigation<T>;
    };
    /** A reference to the timeout for resetting the typeahead search. */
    timeout?: ReturnType<typeof setTimeout> | undefined;
    /** The navigation controller of the parent list. */
    navigation: ListNavigation<T>;
    /** Keeps track of the characters that typeahead search is being called with. */
    private _query;
    /** The index where that the typeahead search was initiated from. */
    private _startIndex;
    constructor(inputs: ListTypeaheadInputs & {
        navigation: ListNavigation<T>;
    });
    /** Performs a typeahead search, appending the given character to the search string. */
    search(char: string): void;
    /**
     * Returns the first item whose search term matches the
     * current query starting from the the current anchor index.
     */
    private _getItem;
}

/** Represents an item in a collection, such as a listbox option, than may receive focus. */
interface ListFocusItem extends ListNavigationItem {
    /** A unique identifier for the item. */
    id: SignalLike<string>;
    /** The html element that should receive focus. */
    element: SignalLike<HTMLElement>;
}
/** Represents the required inputs for a collection that contains focusable items. */
interface ListFocusInputs<T extends ListFocusItem> {
    /** The focus strategy used by the list. */
    focusMode: SignalLike<'roving' | 'activedescendant'>;
}
/** Controls focus for a list of items. */
declare class ListFocus<T extends ListFocusItem> {
    readonly inputs: ListFocusInputs<T> & {
        navigation: ListNavigation<T>;
    };
    /** The navigation controller of the parent list. */
    navigation: ListNavigation<ListFocusItem>;
    constructor(inputs: ListFocusInputs<T> & {
        navigation: ListNavigation<T>;
    });
    /** The id of the current active item. */
    getActiveDescendant(): string | undefined;
    /** The tabindex for the list. */
    getListTabindex(): -1 | 0;
    /** Returns the tabindex for the given item. */
    getItemTabindex(item: T): -1 | 0;
    /** Focuses the current active item. */
    focus(): void;
}

/**
 * Represents the properties exposed by a listbox that need to be accessed by an option.
 * This exists to avoid circular dependency errors between the listbox and option.
 */
interface ListboxPattern$1<V> {
    focusManager: ListFocus<OptionPattern<V>>;
    selection: ListSelection<OptionPattern<V>, V>;
    navigation: ListNavigation<OptionPattern<V>>;
}
/** Represents the required inputs for an option in a listbox. */
interface OptionInputs<V> extends ListNavigationItem, ListSelectionItem<V>, ListTypeaheadItem, ListFocusItem {
    listbox: SignalLike<ListboxPattern$1<V> | undefined>;
}
/** Represents an option in a listbox. */
declare class OptionPattern<V> {
    /** A unique identifier for the option. */
    id: SignalLike<string>;
    /** The value of the option. */
    value: SignalLike<V>;
    /** The position of the option in the list. */
    index: i0.Signal<number>;
    /** Whether the option is selected. */
    selected: i0.Signal<boolean | undefined>;
    /** Whether the option is disabled. */
    disabled: SignalLike<boolean>;
    /** The text used by the typeahead search. */
    searchTerm: SignalLike<string>;
    /** A reference to the parent listbox. */
    listbox: SignalLike<ListboxPattern$1<V> | undefined>;
    /** The tabindex of the option. */
    tabindex: i0.Signal<0 | -1 | undefined>;
    /** The html element that should receive focus. */
    element: SignalLike<HTMLElement>;
    constructor(args: OptionInputs<V>);
}

/** The selection operations that the listbox can perform. */
interface SelectOptions {
    select?: boolean;
    toggle?: boolean;
    toggleOne?: boolean;
    selectOne?: boolean;
    selectAll?: boolean;
    selectFromAnchor?: boolean;
    selectFromActive?: boolean;
}
/** Represents the required inputs for a listbox. */
type ListboxInputs<V> = ListNavigationInputs<OptionPattern<V>> & ListSelectionInputs<OptionPattern<V>, V> & ListTypeaheadInputs & ListFocusInputs<OptionPattern<V>> & {
    disabled: SignalLike<boolean>;
    readonly: SignalLike<boolean>;
};
/** Controls the state of a listbox. */
declare class ListboxPattern<V> {
    readonly inputs: ListboxInputs<V>;
    /** Controls navigation for the listbox. */
    navigation: ListNavigation<OptionPattern<V>>;
    /** Controls selection for the listbox. */
    selection: ListSelection<OptionPattern<V>, V>;
    /** Controls typeahead for the listbox. */
    typeahead: ListTypeahead<OptionPattern<V>>;
    /** Controls focus for the listbox. */
    focusManager: ListFocus<OptionPattern<V>>;
    /** Whether the list is vertically or horizontally oriented. */
    orientation: SignalLike<'vertical' | 'horizontal'>;
    /** Whether the listbox is disabled. */
    disabled: SignalLike<boolean>;
    /** Whether the listbox is readonly. */
    readonly: SignalLike<boolean>;
    /** The tabindex of the listbox. */
    tabindex: i0.Signal<0 | -1>;
    /** The id of the current active item. */
    activedescendant: i0.Signal<string | undefined>;
    /** Whether multiple items in the list can be selected at once. */
    multi: SignalLike<boolean>;
    /** The number of items in the listbox. */
    setsize: i0.Signal<number>;
    /** Whether the listbox selection follows focus. */
    followFocus: i0.Signal<boolean>;
    /** The key used to navigate to the previous item in the list. */
    prevKey: i0.Signal<"ArrowUp" | "ArrowRight" | "ArrowLeft">;
    /** The key used to navigate to the next item in the list. */
    nextKey: i0.Signal<"ArrowRight" | "ArrowLeft" | "ArrowDown">;
    /** The regexp used to decide if a key should trigger typeahead. */
    typeaheadRegexp: RegExp;
    /** The keydown event manager for the listbox. */
    keydown: i0.Signal<KeyboardEventManager<KeyboardEvent>>;
    /** The pointerdown event manager for the listbox. */
    pointerdown: i0.Signal<PointerEventManager<PointerEvent>>;
    constructor(inputs: ListboxInputs<V>);
    /** Handles keydown events for the listbox. */
    onKeydown(event: KeyboardEvent): void;
    onPointerdown(event: PointerEvent): void;
    /** Navigates to the first option in the listbox. */
    first(opts?: SelectOptions): void;
    /** Navigates to the last option in the listbox. */
    last(opts?: SelectOptions): void;
    /** Navigates to the next option in the listbox. */
    next(opts?: SelectOptions): void;
    /** Navigates to the previous option in the listbox. */
    prev(opts?: SelectOptions): void;
    /** Navigates to the given item in the listbox. */
    goto(event: PointerEvent, opts?: SelectOptions): void;
    /** Handles typeahead search navigation for the listbox. */
    search(char: string, opts?: SelectOptions): void;
    /** Handles updating selection for the listbox. */
    private _updateSelection;
    private _getItem;
}

export { ListboxPattern as L, OptionPattern as O, type SignalLike as S, type WritableSignalLike as W, type ListboxInputs as a, type OptionInputs as b, convertGetterSetterToWritableSignalLike as c };
