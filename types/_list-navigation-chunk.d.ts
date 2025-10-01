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
    /** Peeks the next item in the list. */
    peekNext(): T | undefined;
    /** Navigates to the previous item in the list. */
    prev(): boolean;
    /** Peeks the previous item in the list. */
    peekPrev(): T | undefined;
    /** Navigates to the first item in the list. */
    first(): boolean;
    /** Navigates to the last item in the list. */
    last(): boolean;
    /** Advances to the next or previous focusable item in the list based on the given delta. */
    private _advance;
    /** Peeks the next or previous focusable item in the list based on the given delta. */
    private _peek;
}

export { ListFocus, ListNavigation, convertGetterSetterToWritableSignalLike };
export type { ListFocusInputs, ListFocusItem, ListNavigationInputs, ListNavigationItem, SignalLike, WritableSignalLike };
