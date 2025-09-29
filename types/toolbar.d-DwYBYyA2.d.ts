import * as _angular_core from '@angular/core';
import { SignalLike } from './list-navigation.d-v7LRaIQt.js';
import { ListItem, ListInputs, List } from './list.d-B9T5bCJD.js';

/** Represents the required inputs for a toolbar widget in a toolbar. */
interface ToolbarWidgetInputs<V> extends Omit<ListItem<V>, 'searchTerm' | 'value' | 'index'> {
    /** A reference to the parent toolbar. */
    toolbar: SignalLike<ToolbarPattern<V>>;
}
declare class ToolbarWidgetPattern<V> implements ListItem<V> {
    readonly inputs: ToolbarWidgetInputs<V>;
    /** A unique identifier for the widget. */
    readonly id: SignalLike<string>;
    /** The html element that should receive focus. */
    readonly element: SignalLike<HTMLElement>;
    /** Whether the widget is disabled. */
    readonly disabled: SignalLike<boolean>;
    /** A reference to the parent toolbar. */
    readonly toolbar: SignalLike<ToolbarPattern<V>>;
    /** The tabindex of the widgdet. */
    readonly tabindex: _angular_core.Signal<0 | -1>;
    /** The text used by the typeahead search. */
    readonly searchTerm: () => string;
    /** The value associated with the widget. */
    readonly value: () => V;
    /** The position of the widget within the toolbar. */
    readonly index: _angular_core.Signal<number>;
    /** Whether the widget is currently the active one (focused). */
    readonly active: _angular_core.Signal<boolean>;
    constructor(inputs: ToolbarWidgetInputs<V>);
}

/** An interface that allows sub patterns to expose the necessary controls for the toolbar. */
interface ToolbarWidgetGroupControls {
    /** Whether the widget group is currently on the first item. */
    isOnFirstItem(): boolean;
    /** Whether the widget group is currently on the last item. */
    isOnLastItem(): boolean;
    /** Navigates to the next widget in the group. */
    next(wrap: boolean): void;
    /** Navigates to the previous widget in the group. */
    prev(wrap: boolean): void;
    /** Navigates to the first widget in the group. */
    first(): void;
    /** Navigates to the last widget in the group. */
    last(): void;
    /** Removes focus from the widget group. */
    unfocus(): void;
    /** Triggers the action of the currently active widget in the group. */
    trigger(): void;
    /** Navigates to the widget targeted by a pointer event. */
    goto(event: PointerEvent): void;
    /** Sets the widget group to its default initial state. */
    setDefaultState(): void;
}
/** Represents the required inputs for a toolbar widget group. */
interface ToolbarWidgetGroupInputs<V> extends Omit<ListItem<V>, 'searchTerm' | 'value' | 'index'> {
    /** A reference to the parent toolbar. */
    toolbar: SignalLike<ToolbarPattern<V> | undefined>;
    /** The controls for the sub patterns associated with the toolbar. */
    controls: SignalLike<ToolbarWidgetGroupControls | undefined>;
}
/** A group of widgets within a toolbar that provides nested navigation. */
declare class ToolbarWidgetGroupPattern<V> implements ListItem<V> {
    readonly inputs: ToolbarWidgetGroupInputs<V>;
    /** A unique identifier for the widget. */
    readonly id: SignalLike<string>;
    /** The html element that should receive focus. */
    readonly element: SignalLike<HTMLElement>;
    /** Whether the widget is disabled. */
    readonly disabled: SignalLike<boolean>;
    /** A reference to the parent toolbar. */
    readonly toolbar: SignalLike<ToolbarPattern<V> | undefined>;
    /** The text used by the typeahead search. */
    readonly searchTerm: () => string;
    /** The value associated with the widget. */
    readonly value: () => V;
    /** The position of the widget within the toolbar. */
    readonly index: _angular_core.Signal<number>;
    /** The actions that can be performed on the widget group. */
    readonly controls: SignalLike<ToolbarWidgetGroupControls>;
    /** Default toolbar widget group controls when no controls provided. */
    private readonly _defaultControls;
    constructor(inputs: ToolbarWidgetGroupInputs<V>);
}

/** Represents the required inputs for a toolbar. */
type ToolbarInputs<V> = Omit<ListInputs<ToolbarWidgetPattern<V> | ToolbarWidgetGroupPattern<V>, V>, 'multi' | 'typeaheadDelay' | 'value' | 'selectionMode' | 'focusMode'> & {
    /** A function that returns the toolbar item associated with a given element. */
    getItem: (e: Element) => ToolbarWidgetPattern<V> | ToolbarWidgetGroupPattern<V> | undefined;
};
/** Controls the state of a toolbar. */
declare class ToolbarPattern<V> {
    readonly inputs: ToolbarInputs<V>;
    /** The list behavior for the toolbar. */
    readonly listBehavior: List<ToolbarWidgetPattern<V> | ToolbarWidgetGroupPattern<V>, V>;
    /** Whether the tablist is vertically or horizontally oriented. */
    readonly orientation: SignalLike<'vertical' | 'horizontal'>;
    /** Whether disabled items in the group should be skipped when navigating. */
    readonly skipDisabled: SignalLike<boolean>;
    /** Whether the toolbar is disabled. */
    readonly disabled: _angular_core.Signal<boolean>;
    /** The tabindex of the toolbar (if using activedescendant). */
    readonly tabindex: _angular_core.Signal<0 | -1>;
    /** The id of the current active widget (if using activedescendant). */
    readonly activedescendant: _angular_core.Signal<string | undefined>;
    /** The key used to navigate to the previous widget. */
    private readonly _prevKey;
    /** The key used to navigate to the next widget. */
    private readonly _nextKey;
    /** The alternate key used to navigate to the previous widget. */
    private readonly _altPrevKey;
    /** The alternate key used to navigate to the next widget. */
    private readonly _altNextKey;
    /** The keydown event manager for the toolbar. */
    private readonly _keydown;
    /** The pointerdown event manager for the toolbar. */
    private readonly _pointerdown;
    /** Navigates to the next widget in the toolbar. */
    private _next;
    /** Navigates to the previous widget in the toolbar. */
    private _prev;
    private _groupNext;
    private _groupPrev;
    /** Triggers the action of the currently active widget. */
    private _trigger;
    /** Navigates to the first widget in the toolbar. */
    private _first;
    /** Navigates to the last widget in the toolbar. */
    private _last;
    /** Navigates to the widget targeted by a pointer event. */
    private _goto;
    constructor(inputs: ToolbarInputs<V>);
    /** Handles keydown events for the toolbar. */
    onKeydown(event: KeyboardEvent): void;
    /** Handles pointerdown events for the toolbar. */
    onPointerdown(event: PointerEvent): void;
    /**
     * Sets the toolbar to its default initial state.
     *
     * Sets the active index to the selected widget if one exists and is focusable.
     * Otherwise, sets the active index to the first focusable widget.
     */
    setDefaultState(): void;
    /** Validates the state of the toolbar and returns a list of accessibility violations. */
    validate(): string[];
}

export { ToolbarPattern, ToolbarWidgetGroupPattern, ToolbarWidgetPattern };
export type { ToolbarInputs, ToolbarWidgetGroupControls, ToolbarWidgetGroupInputs, ToolbarWidgetInputs };
