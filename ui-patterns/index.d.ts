export { ListboxInputs, ListboxPattern, OptionInputs, OptionPattern } from '../listbox.d.js';
import { RadioButtonPattern } from '../radio-group.d.js';
export { RadioButtonInputs, RadioGroupInputs, RadioGroupPattern, ToolbarLike } from '../radio-group.d.js';
import { SignalLike, KeyboardEventManager, PointerEventManager } from '../pointer-event-manager.d.js';
export { WritableSignalLike, convertGetterSetterToWritableSignalLike } from '../pointer-event-manager.d.js';
export { TabInputs, TabListInputs, TabListPattern, TabPanelInputs, TabPanelPattern, TabPattern } from '../tabs.d.js';
export { AccordionGroupInputs, AccordionGroupPattern, AccordionPanelInputs, AccordionPanelPattern, AccordionTriggerInputs, AccordionTriggerPattern } from '../accordion.d.js';
import * as _angular_core from '@angular/core';
import { ListInputs, List, ListItem } from '../list.d.js';
import '../expansion.d.js';

/** Represents the required inputs for a toolbar. */
type ToolbarInputs<V> = Omit<ListInputs<ToolbarWidgetPattern | RadioButtonPattern<V>, V>, 'multi' | 'typeaheadDelay' | 'value' | 'selectionMode'>;
/** Controls the state of a toolbar. */
declare class ToolbarPattern<V> {
    readonly inputs: ToolbarInputs<V>;
    /** The list behavior for the toolbar. */
    listBehavior: List<ToolbarWidgetPattern | RadioButtonPattern<V>, V>;
    /** Whether the tablist is vertically or horizontally oriented. */
    readonly orientation: SignalLike<'vertical' | 'horizontal'>;
    /** Whether the toolbar is disabled. */
    disabled: _angular_core.Signal<boolean>;
    /** The tabindex of the toolbar (if using activedescendant). */
    tabindex: _angular_core.Signal<0 | -1>;
    /** The id of the current active widget (if using activedescendant). */
    activedescendant: _angular_core.Signal<string | undefined>;
    /** The key used to navigate to the previous widget. */
    prevKey: _angular_core.Signal<"ArrowUp" | "ArrowRight" | "ArrowLeft">;
    /** The key used to navigate to the next widget. */
    nextKey: _angular_core.Signal<"ArrowRight" | "ArrowLeft" | "ArrowDown">;
    /** The alternate key used to navigate to the previous widget */
    altPrevKey: _angular_core.Signal<"ArrowUp" | "ArrowRight" | "ArrowLeft">;
    /** The alternate key used to navigate to the next widget. */
    altNextKey: _angular_core.Signal<"ArrowRight" | "ArrowLeft" | "ArrowDown">;
    /** The keydown event manager for the toolbar. */
    keydown: _angular_core.Signal<KeyboardEventManager<KeyboardEvent>>;
    selectRadioButton(): void;
    /** The pointerdown event manager for the toolbar. */
    pointerdown: _angular_core.Signal<PointerEventManager<PointerEvent>>;
    /** Navigates to the widget associated with the given pointer event. */
    goto(event: PointerEvent): void;
    /** Handles keydown events for the toolbar. */
    onKeydown(event: KeyboardEvent): void;
    /** Handles pointerdown events for the toolbar. */
    onPointerdown(event: PointerEvent): void;
    /** Finds the Toolbar Widget associated with a pointer event target. */
    private _getItem;
    constructor(inputs: ToolbarInputs<V>);
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
/** Represents the required inputs for a toolbar widget in a toolbar. */
interface ToolbarWidgetInputs extends Omit<ListItem<any>, 'searchTerm' | 'value' | 'index'> {
    /** A reference to the parent toolbar. */
    parentToolbar: SignalLike<ToolbarPattern<null>>;
}
declare class ToolbarWidgetPattern {
    readonly inputs: ToolbarWidgetInputs;
    /** A unique identifier for the widget. */
    id: SignalLike<string>;
    /** The html element that should receive focus. */
    readonly element: SignalLike<HTMLElement>;
    /** Whether the widget is disabled. */
    disabled: SignalLike<boolean>;
    /** A reference to the parent toolbar. */
    parentToolbar: SignalLike<ToolbarPattern<null> | undefined>;
    /** The tabindex of the widgdet. */
    tabindex: _angular_core.Signal<0 | -1>;
    /** The text used by the typeahead search. */
    readonly searchTerm: () => string;
    /** The value associated with the widget. */
    readonly value: () => any;
    /** The position of the widget within the toolbar. */
    index: _angular_core.Signal<number>;
    /** Whether the widget is currently the active one (focused). */
    active: _angular_core.Signal<boolean>;
    constructor(inputs: ToolbarWidgetInputs);
}

export { RadioButtonPattern, SignalLike, ToolbarPattern, ToolbarWidgetPattern };
export type { ToolbarInputs, ToolbarWidgetInputs };
