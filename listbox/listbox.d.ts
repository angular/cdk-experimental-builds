/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { EventEmitter, QueryList } from '@angular/core';
import { BooleanInput } from '@angular/cdk/coercion';
/**
 * Directive that applies interaction patterns to an element following the aria role of option.
 * Typically meant to be placed inside a listbox. Logic handling selection, disabled state, and
 * value is built in.
 */
export declare class CdkOption {
    listbox: CdkListbox;
    private _selected;
    /** Whether the option is selected or not */
    get selected(): boolean;
    set selected(value: boolean);
    /** The id of the option, set to a uniqueid if the user does not provide one */
    id: string;
    constructor(listbox: CdkListbox);
    /** Toggles the selected state, emits a change event through the injected listbox */
    toggle(): void;
    static ngAcceptInputType_selected: BooleanInput;
}
/**
 * Directive that applies interaction patterns to an element following the aria role of listbox.
 * Typically CdkOption elements are placed inside the listbox. Logic to handle keyboard navigation,
 * selection of options, active options, and disabled states is built in.
 */
export declare class CdkListbox {
    /** A query list containing all CdkOption elements within this listbox */
    _options: QueryList<CdkOption>;
    readonly selectionChange: EventEmitter<ListboxSelectionChangeEvent>;
    /** Emits a selection change event, called when an option has its selected state changed */
    _emitChangeEvent(option: CdkOption): void;
    /** Sets the given option's selected state to true */
    select(option: CdkOption): void;
    /** Sets the given option's selected state to null. Null is preferable for screen readers */
    deselect(option: CdkOption): void;
}
/** Change event that is being fired whenever the selected state of an option changes. */
export declare class ListboxSelectionChangeEvent {
    /** Reference to the listbox that emitted the event. */
    source: CdkListbox;
    /** Reference to the option that has been changed. */
    option: CdkOption;
    constructor(
    /** Reference to the listbox that emitted the event. */
    source: CdkListbox, 
    /** Reference to the option that has been changed. */
    option: CdkOption);
}
