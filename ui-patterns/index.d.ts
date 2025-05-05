export { a as ListboxInputs, L as ListboxPattern, b as OptionInputs, O as OptionPattern } from '../listbox.d-CLZqhGGi.js';
import * as i0 from '@angular/core';
import { L as ListNavigationItem, a as ListSelectionItem, b as ListFocusItem, S as SignalLike, c as ListFocus, d as ListSelection, e as ListNavigation, f as ListNavigationInputs, g as ListSelectionInputs, h as ListFocusInputs, K as KeyboardEventManager, P as PointerEventManager } from '../list-navigation.d-mll4djs5.js';
export { W as WritableSignalLike, i as convertGetterSetterToWritableSignalLike } from '../list-navigation.d-mll4djs5.js';
export { c as TabInputs, e as TabListInputs, b as TabListPattern, d as TabPanelInputs, a as TabPanelPattern, T as TabPattern } from '../tabs.d-DjGAdSa8.js';

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
    index: i0.Signal<number>;
    /** Whether the radio button is currently the active one (focused). */
    active: i0.Signal<boolean>;
    /** Whether the radio button is selected. */
    selected: i0.Signal<boolean | undefined>;
    /** Whether the radio button is disabled. */
    disabled: SignalLike<boolean>;
    /** A reference to the parent radio group. */
    group: SignalLike<RadioGroupLike<V> | undefined>;
    /** The tabindex of the radio button. */
    tabindex: i0.Signal<0 | -1 | undefined>;
    /** The HTML element associated with the radio button. */
    element: SignalLike<HTMLElement>;
    constructor(inputs: RadioButtonInputs<V>);
}

/** The selection operations that the radio group can perform. */
interface SelectOptions {
    selectOne?: boolean;
}
/** Represents the required inputs for a radio group. */
type RadioGroupInputs<V> = ListNavigationInputs<RadioButtonPattern<V>> & Omit<ListSelectionInputs<RadioButtonPattern<V>, V>, 'multi' | 'selectionMode'> & ListFocusInputs<RadioButtonPattern<V>> & {
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
    disabled: i0.Signal<boolean>;
    /** Whether the radio group is readonly. */
    readonly: SignalLike<boolean>;
    /** The tabindex of the radio group (if using activedescendant). */
    tabindex: i0.Signal<0 | -1>;
    /** The id of the current active radio button (if using activedescendant). */
    activedescendant: i0.Signal<string | undefined>;
    /** The key used to navigate to the previous radio button. */
    prevKey: i0.Signal<"ArrowUp" | "ArrowRight" | "ArrowLeft">;
    /** The key used to navigate to the next radio button. */
    nextKey: i0.Signal<"ArrowRight" | "ArrowLeft" | "ArrowDown">;
    /** The keydown event manager for the radio group. */
    keydown: i0.Signal<KeyboardEventManager<KeyboardEvent>>;
    /** The pointerdown event manager for the radio group. */
    pointerdown: i0.Signal<PointerEventManager<PointerEvent>>;
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
    /** Safely performs a navigation operation and updates selection if needed. */
    private _navigate;
    /** Finds the RadioButtonPattern associated with a pointer event target. */
    private _getItem;
}

export { RadioButtonPattern, RadioGroupPattern, SignalLike };
export type { RadioButtonInputs, RadioGroupInputs };
