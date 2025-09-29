export { ListboxInputs, ListboxPattern, OptionInputs, OptionPattern } from './listbox.d-fLTfIr8M.js';
import { RadioGroupInputs, RadioGroupPattern } from './radio-group.d-DZsUHFDI.js';
export { RadioButtonInputs, RadioButtonPattern } from './radio-group.d-DZsUHFDI.js';
import { SignalLike } from './list-navigation.d-v7LRaIQt.js';
export { WritableSignalLike, convertGetterSetterToWritableSignalLike } from './list-navigation.d-v7LRaIQt.js';
import { ToolbarPattern, ToolbarWidgetGroupControls } from './toolbar.d-DwYBYyA2.js';
export { ToolbarInputs, ToolbarWidgetGroupInputs, ToolbarWidgetGroupPattern, ToolbarWidgetInputs, ToolbarWidgetPattern } from './toolbar.d-DwYBYyA2.js';
export { TabInputs, TabListInputs, TabListPattern, TabPanelInputs, TabPanelPattern, TabPattern } from './tabs.d-ujolMxd5.js';
export { AccordionGroupInputs, AccordionGroupPattern, AccordionPanelInputs, AccordionPanelPattern, AccordionTriggerInputs, AccordionTriggerPattern } from './accordion.d-CWtRia7r.js';
import '@angular/core';
import './list.d-B9T5bCJD.js';
import './pointer-event-manager.d-DxLZK1bd.js';
import './expansion.d-D5S9iQY2.js';

/** Represents the required inputs for a toolbar controlled radio group. */
type ToolbarRadioGroupInputs<V> = RadioGroupInputs<V> & {
    /** The toolbar controlling the radio group. */
    toolbar: SignalLike<ToolbarPattern<V> | undefined>;
};
/** Controls the state of a radio group in a toolbar. */
declare class ToolbarRadioGroupPattern<V> extends RadioGroupPattern<V> implements ToolbarWidgetGroupControls {
    readonly inputs: ToolbarRadioGroupInputs<V>;
    constructor(inputs: ToolbarRadioGroupInputs<V>);
    /** Noop. The toolbar handles keydown events. */
    onKeydown(_: KeyboardEvent): void;
    /** Noop. The toolbar handles pointerdown events. */
    onPointerdown(_: PointerEvent): void;
    /** Whether the radio group is currently on the first item. */
    isOnFirstItem(): boolean;
    /** Whether the radio group is currently on the last item. */
    isOnLastItem(): boolean;
    /** Navigates to the next radio button in the group. */
    next(wrap: boolean): void;
    /** Navigates to the previous radio button in the group. */
    prev(wrap: boolean): void;
    /** Navigates to the first radio button in the group. */
    first(): void;
    /** Navigates to the last radio button in the group. */
    last(): void;
    /** Removes focus from the radio group. */
    unfocus(): void;
    /** Triggers the action of the currently active radio button in the group. */
    trigger(): void;
    /** Navigates to the radio button targeted by a pointer event. */
    goto(e: PointerEvent): void;
}

export { RadioGroupInputs, RadioGroupPattern, SignalLike, ToolbarPattern, ToolbarRadioGroupPattern, ToolbarWidgetGroupControls };
export type { ToolbarRadioGroupInputs };
