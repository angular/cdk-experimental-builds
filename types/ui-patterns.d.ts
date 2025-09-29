import { ComboboxPattern, ComboboxListboxControls, ComboboxTreeControls } from './combobox.d-DU-Rmfjh.js';
export { ComboboxInputs } from './combobox.d-DU-Rmfjh.js';
import { ListboxInputs, OptionPattern, ListboxPattern } from './listbox.d-D0n-irer.js';
export { OptionInputs } from './listbox.d-D0n-irer.js';
import * as _angular_core from '@angular/core';
import { SignalLike } from './list-navigation.d-v7LRaIQt.js';
export { WritableSignalLike, convertGetterSetterToWritableSignalLike } from './list-navigation.d-v7LRaIQt.js';
import { RadioGroupInputs, RadioGroupPattern } from './radio-group.d-29i6QPDq.js';
export { RadioButtonInputs, RadioButtonPattern } from './radio-group.d-29i6QPDq.js';
import { ToolbarPattern, ToolbarWidgetGroupControls } from './toolbar.d-DJ21fkit.js';
export { ToolbarInputs, ToolbarWidgetGroupInputs, ToolbarWidgetGroupPattern, ToolbarWidgetInputs, ToolbarWidgetPattern } from './toolbar.d-DJ21fkit.js';
export { TabInputs, TabListInputs, TabListPattern, TabPanelInputs, TabPanelPattern, TabPattern } from './tabs.d-DSEqkD60.js';
export { AccordionGroupInputs, AccordionGroupPattern, AccordionPanelInputs, AccordionPanelPattern, AccordionTriggerInputs, AccordionTriggerPattern } from './accordion.d-C-nrfp4d.js';
import { TreeInputs, TreeItemPattern, TreePattern } from './tree.d-DomXPN8h.js';
export { TreeItemInputs } from './tree.d-DomXPN8h.js';
import './pointer-event-manager.d-DxLZK1bd.js';
import './list.d-CgeCwpQa.js';
import './expansion.d-Bk5hojv9.js';

type ComboboxListboxInputs<V> = ListboxInputs<V> & {
    /** The combobox controlling the listbox. */
    combobox: SignalLike<ComboboxPattern<OptionPattern<V>, V> | undefined>;
};
declare class ComboboxListboxPattern<V> extends ListboxPattern<V> implements ComboboxListboxControls<OptionPattern<V>, V> {
    readonly inputs: ComboboxListboxInputs<V>;
    /** A unique identifier for the popup. */
    id: _angular_core.Signal<string>;
    /** The ARIA role for the listbox. */
    role: _angular_core.Signal<"listbox">;
    /** The id of the active (focused) item in the listbox. */
    activeId: _angular_core.Signal<string | undefined>;
    /** The list of options in the listbox. */
    items: SignalLike<OptionPattern<V>[]>;
    /** The tabindex for the listbox. Always -1 because the combobox handles focus. */
    tabindex: SignalLike<-1 | 0>;
    constructor(inputs: ComboboxListboxInputs<V>);
    /** Noop. The combobox handles keydown events. */
    onKeydown(_: KeyboardEvent): void;
    /** Noop. The combobox handles pointerdown events. */
    onPointerdown(_: PointerEvent): void;
    /** Noop. The combobox controls the open state. */
    setDefaultState(): void;
    /** Navigates to the specified item in the listbox. */
    focus: (item: OptionPattern<V>) => void;
    /** Navigates to the next focusable item in the listbox. */
    next: () => void;
    /** Navigates to the previous focusable item in the listbox. */
    prev: () => void;
    /** Navigates to the last focusable item in the listbox. */
    last: () => void;
    /** Navigates to the first focusable item in the listbox. */
    first: () => void;
    /** Unfocuses the currently focused item in the listbox. */
    unfocus: () => void;
    /** Selects the specified item in the listbox. */
    select: (item?: OptionPattern<V>) => void;
    /** Clears the selection in the listbox. */
    clearSelection: () => void;
    /** Retrieves the OptionPattern associated with a pointer event. */
    getItem: (e: PointerEvent) => OptionPattern<V> | undefined;
    /** Retrieves the currently selected item in the listbox. */
    getSelectedItem: () => OptionPattern<V> | undefined;
    /** Sets the value of the combobox listbox. */
    setValue: (value: V | undefined) => void;
}

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

type ComboboxTreeInputs<V> = TreeInputs<V> & {
    /** The combobox controlling the tree. */
    combobox: SignalLike<ComboboxPattern<TreeItemPattern<V>, V> | undefined>;
};
declare class ComboboxTreePattern<V> extends TreePattern<V> implements ComboboxTreeControls<TreeItemPattern<V>, V> {
    readonly inputs: ComboboxTreeInputs<V>;
    /** Whether the currently focused item is collapsible. */
    isItemCollapsible: () => boolean;
    /** The ARIA role for the tree. */
    role: () => "tree";
    activeId: _angular_core.Signal<string | undefined>;
    /** The list of items in the tree. */
    items: _angular_core.Signal<TreeItemPattern<V>[]>;
    /** The tabindex for the tree. Always -1 because the combobox handles focus. */
    tabindex: SignalLike<-1 | 0>;
    constructor(inputs: ComboboxTreeInputs<V>);
    /** Noop. The combobox handles keydown events. */
    onKeydown(_: KeyboardEvent): void;
    /** Noop. The combobox handles pointerdown events. */
    onPointerdown(_: PointerEvent): void;
    /** Noop. The combobox controls the open state. */
    setDefaultState(): void;
    /** Navigates to the specified item in the tree. */
    focus: (item: TreeItemPattern<V>) => void;
    /** Navigates to the next focusable item in the tree. */
    next: () => void;
    /** Navigates to the previous focusable item in the tree. */
    prev: () => void;
    /** Navigates to the last focusable item in the tree. */
    last: () => void;
    /** Navigates to the first focusable item in the tree. */
    first: () => void;
    /** Unfocuses the currently focused item in the tree. */
    unfocus: () => void;
    /** Selects the specified item in the tree or the current active item if not provided. */
    select: (item?: TreeItemPattern<V>) => void;
    /** Clears the selection in the tree. */
    clearSelection: () => void;
    /** Retrieves the TreeItemPattern associated with a pointer event. */
    getItem: (e: PointerEvent) => TreeItemPattern<V> | undefined;
    /** Retrieves the currently selected item in the tree */
    getSelectedItem: () => TreeItemPattern<V> | undefined;
    /** Sets the value of the combobox tree. */
    setValue: (value: V | undefined) => void;
    /** Expands the currently focused item if it is expandable. */
    expandItem: () => void;
    /** Collapses the currently focused item if it is expandable. */
    collapseItem: () => void;
    /** Whether the specified item or the currently active item is expandable. */
    isItemExpandable(item?: TreeItemPattern<V> | undefined): boolean;
    /** Expands all of the tree items. */
    expandAll: () => void;
    /** Collapses all of the tree items. */
    collapseAll: () => void;
}

export { ComboboxListboxControls, ComboboxListboxPattern, ComboboxPattern, ComboboxTreeControls, ComboboxTreePattern, ListboxInputs, ListboxPattern, OptionPattern, RadioGroupInputs, RadioGroupPattern, SignalLike, ToolbarPattern, ToolbarRadioGroupPattern, ToolbarWidgetGroupControls, TreeInputs, TreeItemPattern, TreePattern };
export type { ComboboxListboxInputs, ComboboxTreeInputs, ToolbarRadioGroupInputs };
