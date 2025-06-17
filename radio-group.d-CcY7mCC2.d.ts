import * as _angular_core from '@angular/core';
import { e as ListNavigationItem, f as ListFocusItem, S as SignalLike, d as ListFocus, b as ListNavigation, L as ListNavigationInputs, a as ListFocusInputs, K as KeyboardEventManager, P as PointerEventManager } from './list-navigation.d-tcweHm4g.js';
import { L as ListSelectionItem, b as ListSelection, a as ListSelectionInputs } from './list-selection.d-BBLdeUeF.js';

/**
 * Represents the properties exposed by a radio group that need to be accessed by a radio button.
 * This exists to avoid circular dependency errors between the radio group and radio button.
 */
interface RadioGroupLike<V> {
    focusManager: ListFocus<RadioButtonPattern<V>>;
    selection: ListSelection<RadioButtonPattern<V>, V>;
    navigation: ListNavigation<RadioButtonPattern<V>>;
}
/** Represents the required inputs for a radio button in a radio group. */
interface RadioButtonInputs<V> extends ListNavigationItem, ListSelectionItem<V>, ListFocusItem {
    /** A reference to the parent radio group. */
    group: SignalLike<RadioGroupLike<V> | undefined>;
}
/** Represents a radio button within a radio group. */
declare class RadioButtonPattern<V> {
    readonly inputs: RadioButtonInputs<V>;
    /** A unique identifier for the radio button. */
    id: SignalLike<string>;
    /** The value associated with the radio button. */
    value: SignalLike<V>;
    /** The position of the radio button within the group. */
    index: _angular_core.Signal<number>;
    /** Whether the radio button is currently the active one (focused). */
    active: _angular_core.Signal<boolean>;
    /** Whether the radio button is selected. */
    selected: SignalLike<boolean>;
    /** Whether the radio button is disabled. */
    disabled: SignalLike<boolean>;
    /** A reference to the parent radio group. */
    group: SignalLike<RadioGroupLike<V> | undefined>;
    /** The tabindex of the radio button. */
    tabindex: _angular_core.Signal<0 | -1 | undefined>;
    /** The HTML element associated with the radio button. */
    element: SignalLike<HTMLElement>;
    constructor(inputs: RadioButtonInputs<V>);
}

/** The selection operations that the radio group can perform. */
interface SelectOptions {
    selectOne?: boolean;
}
/** Represents the required inputs for a radio group. */
type RadioGroupInputs<V> = Omit<ListNavigationInputs<RadioButtonPattern<V>>, 'wrap'> & Omit<ListSelectionInputs<RadioButtonPattern<V>, V>, 'multi' | 'selectionMode'> & ListFocusInputs<RadioButtonPattern<V>> & {
    /** Whether the radio group is disabled. */
    disabled: SignalLike<boolean>;
    /** Whether the radio group is readonly. */
    readonly: SignalLike<boolean>;
};
/** Controls the state of a radio group. */
declare class RadioGroupPattern<V> {
    readonly inputs: RadioGroupInputs<V>;
    /** Controls navigation for the radio group. */
    navigation: ListNavigation<RadioButtonPattern<V>>;
    /** Controls selection for the radio group. */
    selection: ListSelection<RadioButtonPattern<V>, V>;
    /** Controls focus for the radio group. */
    focusManager: ListFocus<RadioButtonPattern<V>>;
    /** Whether the radio group is vertically or horizontally oriented. */
    orientation: SignalLike<'vertical' | 'horizontal'>;
    /** Whether the radio group is disabled. */
    disabled: _angular_core.Signal<boolean>;
    /** The currently selected radio button. */
    selectedItem: _angular_core.Signal<RadioButtonPattern<V>>;
    /** Whether the radio group is readonly. */
    readonly: _angular_core.Signal<boolean>;
    /** The tabindex of the radio group (if using activedescendant). */
    tabindex: _angular_core.Signal<0 | -1>;
    /** The id of the current active radio button (if using activedescendant). */
    activedescendant: _angular_core.Signal<string | undefined>;
    /** The key used to navigate to the previous radio button. */
    prevKey: _angular_core.Signal<"ArrowUp" | "ArrowRight" | "ArrowLeft">;
    /** The key used to navigate to the next radio button. */
    nextKey: _angular_core.Signal<"ArrowRight" | "ArrowLeft" | "ArrowDown">;
    /** The keydown event manager for the radio group. */
    keydown: _angular_core.Signal<KeyboardEventManager<KeyboardEvent>>;
    /** The pointerdown event manager for the radio group. */
    pointerdown: _angular_core.Signal<PointerEventManager<PointerEvent>>;
    constructor(inputs: RadioGroupInputs<V>);
    /** Handles keydown events for the radio group. */
    onKeydown(event: KeyboardEvent): void;
    /** Handles pointerdown events for the radio group. */
    onPointerdown(event: PointerEvent): void;
    /** Navigates to the first enabled radio button in the group. */
    first(opts?: SelectOptions): void;
    /** Navigates to the last enabled radio button in the group. */
    last(opts?: SelectOptions): void;
    /** Navigates to the next enabled radio button in the group. */
    next(opts?: SelectOptions): void;
    /** Navigates to the previous enabled radio button in the group. */
    prev(opts?: SelectOptions): void;
    /** Navigates to the radio button associated with the given pointer event. */
    goto(event: PointerEvent, opts?: SelectOptions): void;
    /**
     * Sets the radio group to its default initial state.
     *
     * Sets the active index to the selected radio button if one exists and is focusable.
     * Otherwise, sets the active index to the first focusable radio button.
     */
    setDefaultState(): void;
    /** Validates the state of the radio group and returns a list of accessibility violations. */
    validate(): string[];
    /** Safely performs a navigation operation and updates selection if needed. */
    private _navigate;
    /** Finds the RadioButtonPattern associated with a pointer event target. */
    private _getItem;
}

export { RadioGroupPattern as a, RadioButtonPattern as c };
export type { RadioGroupInputs as R, RadioButtonInputs as b };
