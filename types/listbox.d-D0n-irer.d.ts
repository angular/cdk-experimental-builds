import * as _angular_core from '@angular/core';
import { SignalLike } from './list-navigation.d-v7LRaIQt.js';
import { ListItem, ListInputs, List } from './list.d-CgeCwpQa.js';
import { KeyboardEventManager, PointerEventManager } from './pointer-event-manager.d-DxLZK1bd.js';

/**
 * Represents the properties exposed by a listbox that need to be accessed by an option.
 * This exists to avoid circular dependency errors between the listbox and option.
 */
interface ListboxPattern$1<V> {
    inputs: ListInputs<OptionPattern<V>, V>;
    listBehavior: List<OptionPattern<V>, V>;
}
/** Represents the required inputs for an option in a listbox. */
interface OptionInputs<V> extends Omit<ListItem<V>, 'index'> {
    listbox: SignalLike<ListboxPattern$1<V> | undefined>;
}
/** Represents an option in a listbox. */
declare class OptionPattern<V> {
    /** A unique identifier for the option. */
    id: SignalLike<string>;
    /** The value of the option. */
    value: SignalLike<V>;
    /** The position of the option in the list. */
    index: _angular_core.Signal<number>;
    /** Whether the option is active. */
    active: _angular_core.Signal<boolean>;
    /** Whether the option is selected. */
    selected: _angular_core.Signal<boolean | undefined>;
    /** Whether the option is disabled. */
    disabled: SignalLike<boolean>;
    /** The text used by the typeahead search. */
    searchTerm: SignalLike<string>;
    /** A reference to the parent listbox. */
    listbox: SignalLike<ListboxPattern$1<V> | undefined>;
    /** The tabindex of the option. */
    tabindex: _angular_core.Signal<0 | -1 | undefined>;
    /** The html element that should receive focus. */
    element: SignalLike<HTMLElement>;
    constructor(args: OptionInputs<V>);
}

/** Represents the required inputs for a listbox. */
type ListboxInputs<V> = ListInputs<OptionPattern<V>, V> & {
    /** A unique identifier for the listbox. */
    id: SignalLike<string>;
    /** Whether the listbox is readonly. */
    readonly: SignalLike<boolean>;
};
/** Controls the state of a listbox. */
declare class ListboxPattern<V> {
    readonly inputs: ListboxInputs<V>;
    listBehavior: List<OptionPattern<V>, V>;
    /** Whether the list is vertically or horizontally oriented. */
    orientation: SignalLike<'vertical' | 'horizontal'>;
    /** Whether the listbox is disabled. */
    disabled: _angular_core.Signal<boolean>;
    /** Whether the listbox is readonly. */
    readonly: SignalLike<boolean>;
    /** The tabindex of the listbox. */
    tabindex: SignalLike<-1 | 0>;
    /** The id of the current active item. */
    activedescendant: _angular_core.Signal<string | undefined>;
    /** Whether multiple items in the list can be selected at once. */
    multi: SignalLike<boolean>;
    /** The number of items in the listbox. */
    setsize: _angular_core.Signal<number>;
    /** Whether the listbox selection follows focus. */
    followFocus: _angular_core.Signal<boolean>;
    /** Whether the listbox should wrap. Used to disable wrapping while range selecting. */
    wrap: _angular_core.WritableSignal<boolean>;
    /** The key used to navigate to the previous item in the list. */
    prevKey: _angular_core.Signal<"ArrowUp" | "ArrowRight" | "ArrowLeft">;
    /** The key used to navigate to the next item in the list. */
    nextKey: _angular_core.Signal<"ArrowRight" | "ArrowLeft" | "ArrowDown">;
    /** Represents the space key. Does nothing when the user is actively using typeahead. */
    dynamicSpaceKey: _angular_core.Signal<"" | " ">;
    /** The regexp used to decide if a key should trigger typeahead. */
    typeaheadRegexp: RegExp;
    /** The keydown event manager for the listbox. */
    keydown: _angular_core.Signal<KeyboardEventManager<KeyboardEvent>>;
    /** The pointerdown event manager for the listbox. */
    pointerdown: _angular_core.Signal<PointerEventManager<PointerEvent>>;
    constructor(inputs: ListboxInputs<V>);
    /** Returns a set of violations */
    validate(): string[];
    /** Handles keydown events for the listbox. */
    onKeydown(event: KeyboardEvent): void;
    onPointerdown(event: PointerEvent): void;
    /**
     * Sets the listbox to it's default initial state.
     *
     * Sets the active index of the listbox to the first focusable selected
     * item if one exists. Otherwise, sets focus to the first focusable item.
     *
     * This method should be called once the listbox and it's options are properly initialized,
     * meaning the ListboxPattern and OptionPatterns should have references to each other before this
     * is called.
     */
    setDefaultState(): void;
    protected _getItem(e: PointerEvent): OptionPattern<V> | undefined;
}

export { ListboxPattern, OptionPattern };
export type { ListboxInputs, OptionInputs };
