/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { AfterContentInit, ElementRef, EventEmitter, OnDestroy, QueryList } from '@angular/core';
import { ActiveDescendantKeyManager, Highlightable, ListKeyManagerOption } from '@angular/cdk/a11y';
import { BooleanInput } from '@angular/cdk/coercion';
export declare class CdkOption implements ListKeyManagerOption, Highlightable {
    private _elementRef;
    listbox: CdkListbox;
    private _selected;
    private _disabled;
    _active: boolean;
    get selected(): boolean;
    set selected(value: boolean);
    /** The id of the option, set to a uniqueid if the user does not provide one. */
    id: string;
    get disabled(): boolean;
    set disabled(value: boolean);
    constructor(_elementRef: ElementRef, listbox: CdkListbox);
    /** Toggles the selected state, emits a change event through the injected listbox. */
    toggle(): void;
    /** Sets the active property true if the option and listbox aren't disabled. */
    activate(): void;
    /** Sets the active property false. */
    deactivate(): void;
    /** Returns true if the option or listbox are disabled, and false otherwise. */
    _isInteractionDisabled(): boolean;
    /** Returns the tab index which depends on the disabled property. */
    _getTabIndex(): string | null;
    getLabel(): string;
    setActiveStyles(): void;
    setInactiveStyles(): void;
    static ngAcceptInputType_selected: BooleanInput;
    static ngAcceptInputType_disabled: BooleanInput;
}
export declare class CdkListbox implements AfterContentInit, OnDestroy {
    _listKeyManager: ActiveDescendantKeyManager<CdkOption>;
    private _disabled;
    _options: QueryList<CdkOption>;
    readonly selectionChange: EventEmitter<ListboxSelectionChangeEvent>;
    get disabled(): boolean;
    set disabled(value: boolean);
    ngAfterContentInit(): void;
    ngOnDestroy(): void;
    _keydown(event: KeyboardEvent): void;
    /** Emits a selection change event, called when an option has its selected state changed. */
    _emitChangeEvent(option: CdkOption): void;
    private _toggleActiveOption;
    /** Selects the given option if the option and listbox aren't disabled. */
    select(option: CdkOption): void;
    /** Deselects the given option if the option and listbox aren't disabled. */
    deselect(option: CdkOption): void;
    /** Updates the key manager's active item to the given option. */
    setActiveOption(option: CdkOption): void;
    static ngAcceptInputType_disabled: BooleanInput;
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
