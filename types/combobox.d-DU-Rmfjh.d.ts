import * as _angular_core from '@angular/core';
import { KeyboardEventManager, PointerEventManager } from './pointer-event-manager.d-DxLZK1bd.js';
import { SignalLike, WritableSignalLike } from './list-navigation.d-v7LRaIQt.js';
import { ListItem } from './list.d-CgeCwpQa.js';

/** Represents the required inputs for a combobox. */
interface ComboboxInputs<T extends ListItem<V>, V> {
    /** The controls for the popup associated with the combobox. */
    popupControls: SignalLike<ComboboxListboxControls<T, V> | ComboboxTreeControls<T, V> | undefined>;
    /** The HTML input element that serves as the combobox input. */
    inputEl: SignalLike<HTMLInputElement | undefined>;
    /** The HTML element that serves as the combobox container. */
    containerEl: SignalLike<HTMLElement | undefined>;
    /** The filtering mode for the combobox. */
    filterMode: SignalLike<'manual' | 'auto-select' | 'highlight'>;
    /** The current value of the combobox. */
    inputValue?: WritableSignalLike<string>;
    /** The value of the first matching item in the popup. */
    firstMatch: SignalLike<V | undefined>;
}
/** An interface that allows combobox popups to expose the necessary controls for the combobox. */
interface ComboboxListboxControls<T extends ListItem<V>, V> {
    /** A unique identifier for the popup. */
    id: () => string;
    /** The ARIA role for the popup. */
    role: SignalLike<'listbox' | 'tree' | 'grid'>;
    /** The ID of the active item in the popup. */
    activeId: SignalLike<string | undefined>;
    /** The list of items in the popup. */
    items: SignalLike<T[]>;
    /** Navigates to the given item in the popup. */
    focus: (item: T) => void;
    /** Navigates to the next item in the popup. */
    next: () => void;
    /** Navigates to the previous item in the popup. */
    prev: () => void;
    /** Navigates to the first item in the popup. */
    first: () => void;
    /** Navigates to the last item in the popup. */
    last: () => void;
    /** Selects the current item in the popup. */
    select: (item?: T) => void;
    /** Clears the selection state of the popup. */
    clearSelection: () => void;
    /** Removes focus from any item in the popup. */
    unfocus: () => void;
    /** Returns the item corresponding to the given event. */
    getItem: (e: PointerEvent) => T | undefined;
    /** Returns the currently selected item in the popup. */
    getSelectedItem: () => T | undefined;
    /** Sets the value of the combobox based on the selected item. */
    setValue: (value: V | undefined) => void;
}
interface ComboboxTreeControls<T extends ListItem<V>, V> extends ComboboxListboxControls<T, V> {
    /** Whether the currently active item in the popup is collapsible. */
    isItemCollapsible: () => boolean;
    /** Expands the currently active item in the popup. */
    expandItem: () => void;
    /** Collapses the currently active item in the popup. */
    collapseItem: () => void;
    /** Checks if the currently active item in the popup is expandable. */
    isItemExpandable: () => boolean;
    /** Expands all nodes in the tree. */
    expandAll: () => void;
    /** Collapses all nodes in the tree. */
    collapseAll: () => void;
}
/** Controls the state of a combobox. */
declare class ComboboxPattern<T extends ListItem<V>, V> {
    readonly inputs: ComboboxInputs<T, V>;
    /** Whether the combobox is expanded. */
    expanded: _angular_core.WritableSignal<boolean>;
    /** The ID of the active item in the combobox. */
    activedescendant: _angular_core.Signal<string | null>;
    /** The currently highlighted item in the combobox. */
    highlightedItem: _angular_core.WritableSignal<T | undefined>;
    /** Whether the most recent input event was a deletion. */
    isDeleting: boolean;
    /** Whether the combobox is focused. */
    isFocused: _angular_core.WritableSignal<boolean>;
    /** The key used to navigate to the previous item in the list. */
    expandKey: _angular_core.Signal<string>;
    /** The key used to navigate to the next item in the list. */
    collapseKey: _angular_core.Signal<string>;
    /** The ID of the popup associated with the combobox. */
    popupId: _angular_core.Signal<string | null>;
    /** The autocomplete behavior of the combobox. */
    autocomplete: _angular_core.Signal<"both" | "list">;
    /** The ARIA role of the popup associated with the combobox. */
    hasPopup: _angular_core.Signal<"listbox" | "tree" | "grid" | null>;
    /** The keydown event manager for the combobox. */
    keydown: _angular_core.Signal<KeyboardEventManager<KeyboardEvent>>;
    /** The pointerup event manager for the combobox. */
    pointerup: _angular_core.Signal<PointerEventManager<PointerEvent>>;
    constructor(inputs: ComboboxInputs<T, V>);
    /** Handles keydown events for the combobox. */
    onKeydown(event: KeyboardEvent): void;
    /** Handles pointerup events for the combobox. */
    onPointerup(event: PointerEvent): void;
    /** Handles input events for the combobox. */
    onInput(event: Event): void;
    onFocusIn(): void;
    /** Handles focus out events for the combobox. */
    onFocusOut(event: FocusEvent): void;
    firstMatch: _angular_core.Signal<T | undefined>;
    onFilter(): void;
    highlight(): void;
    /** Closes the combobox. */
    close(): void;
    /** Opens the combobox. */
    open(nav?: {
        first?: boolean;
        last?: boolean;
    }): void;
    /** Navigates to the next focusable item in the combobox popup. */
    next(): void;
    /** Navigates to the previous focusable item in the combobox popup. */
    prev(): void;
    /** Navigates to the first focusable item in the combobox popup. */
    first(): void;
    /** Navigates to the last focusable item in the combobox popup. */
    last(): void;
    collapseItem(): void;
    expandItem(): void;
    /** Selects an item in the combobox popup. */
    select(opts?: {
        item?: T;
        commit?: boolean;
        close?: boolean;
    }): void;
    /** Updates the value of the input based on the currently selected item. */
    commit(): void;
    /** Navigates and handles additional actions based on filter mode. */
    private _navigate;
}

export { ComboboxPattern };
export type { ComboboxInputs, ComboboxListboxControls, ComboboxTreeControls };
