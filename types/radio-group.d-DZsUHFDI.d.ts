import * as _angular_core from '@angular/core';
import { KeyboardEventManager, PointerEventManager } from './pointer-event-manager.d-DxLZK1bd.js';
import { ListItem, ListInputs, List } from './list.d-B9T5bCJD.js';
import { SignalLike } from './list-navigation.d-v7LRaIQt.js';

/** Represents the required inputs for a radio button in a radio group. */
interface RadioButtonInputs<V> extends Omit<ListItem<V>, 'searchTerm' | 'index'> {
    /** A reference to the parent radio group. */
    group: SignalLike<RadioGroupPattern<V> | undefined>;
}
/** Represents a radio button within a radio group. */
declare class RadioButtonPattern<V> {
    readonly inputs: RadioButtonInputs<V>;
    /** A unique identifier for the radio button. */
    readonly id: SignalLike<string>;
    /** The value associated with the radio button. */
    readonly value: SignalLike<V>;
    /** The position of the radio button within the group. */
    readonly index: SignalLike<number>;
    /** Whether the radio button is currently the active one (focused). */
    readonly active: _angular_core.Signal<boolean>;
    /** Whether the radio button is selected. */
    readonly selected: SignalLike<boolean>;
    /** Whether the radio button is disabled. */
    readonly disabled: SignalLike<boolean>;
    /** A reference to the parent radio group. */
    readonly group: SignalLike<RadioGroupPattern<V> | undefined>;
    /** The tabindex of the radio button. */
    readonly tabindex: _angular_core.Signal<0 | -1 | undefined>;
    /** The HTML element associated with the radio button. */
    readonly element: SignalLike<HTMLElement>;
    /** The search term for typeahead. */
    readonly searchTerm: () => string;
    constructor(inputs: RadioButtonInputs<V>);
}

/** Represents the required inputs for a radio group. */
type RadioGroupInputs<V> = Omit<ListInputs<RadioButtonPattern<V>, V>, 'multi' | 'selectionMode' | 'wrap' | 'typeaheadDelay'> & {
    /** Whether the radio group is disabled. */
    disabled: SignalLike<boolean>;
    /** Whether the radio group is readonly. */
    readonly: SignalLike<boolean>;
    /** A function that returns the radio button associated with a given element. */
    getItem: (e: PointerEvent) => RadioButtonPattern<V> | undefined;
};
/** Controls the state of a radio group. */
declare class RadioGroupPattern<V> {
    readonly inputs: RadioGroupInputs<V>;
    /** The list behavior for the radio group. */
    readonly listBehavior: List<RadioButtonPattern<V>, V>;
    /** Whether the radio group is vertically or horizontally oriented. */
    readonly orientation: SignalLike<'vertical' | 'horizontal'>;
    /** Whether focus should wrap when navigating. */
    readonly wrap: _angular_core.WritableSignal<boolean>;
    /** The selection strategy used by the radio group. */
    readonly selectionMode: _angular_core.WritableSignal<"follow" | "explicit">;
    /** Whether the radio group is disabled. */
    readonly disabled: _angular_core.Signal<boolean>;
    /** The currently selected radio button. */
    readonly selectedItem: _angular_core.Signal<RadioButtonPattern<V>>;
    /** Whether the radio group is readonly. */
    readonly readonly: _angular_core.Signal<boolean>;
    /** The tabindex of the radio group. */
    readonly tabindex: _angular_core.Signal<0 | -1>;
    /** The id of the current active radio button (if using activedescendant). */
    readonly activedescendant: _angular_core.Signal<string | undefined>;
    /** The key used to navigate to the previous radio button. */
    private readonly _prevKey;
    /** The key used to navigate to the next radio button. */
    private readonly _nextKey;
    /** The keydown event manager for the radio group. */
    readonly keydown: _angular_core.Signal<KeyboardEventManager<KeyboardEvent>>;
    /** The pointerdown event manager for the radio group. */
    readonly pointerdown: _angular_core.Signal<PointerEventManager<PointerEvent>>;
    constructor(inputs: RadioGroupInputs<V>);
    /** Handles keydown events for the radio group. */
    onKeydown(event: KeyboardEvent): void;
    /** Handles pointerdown events for the radio group. */
    onPointerdown(event: PointerEvent): void;
    /**
     * Sets the radio group to its default initial state.
     *
     * Sets the active index to the selected radio button if one exists and is focusable.
     * Otherwise, sets the active index to the first focusable radio button.
     */
    setDefaultState(): void;
    /** Validates the state of the radio group and returns a list of accessibility violations. */
    validate(): string[];
}

export { RadioButtonPattern, RadioGroupPattern };
export type { RadioButtonInputs, RadioGroupInputs };
