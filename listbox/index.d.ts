import { ActiveDescendantKeyManager } from '@angular/cdk/a11y';
import { AfterContentInit } from '@angular/core';
import { BooleanInput } from '@angular/cdk/coercion';
import { CdkCombobox } from '@angular/cdk-experimental/combobox';
import { ControlValueAccessor } from '@angular/forms';
import { Directionality } from '@angular/cdk/bidi';
import { ElementRef } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { Highlightable } from '@angular/cdk/a11y';
import * as i0 from '@angular/core';
import { InjectionToken } from '@angular/core';
import { ListKeyManagerOption } from '@angular/cdk/a11y';
import { Observable } from 'rxjs';
import { OnDestroy } from '@angular/core';
import { OnInit } from '@angular/core';
import { QueryList } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { Type } from '@angular/core';

export declare const CDK_LISTBOX_VALUE_ACCESSOR: {
    provide: InjectionToken<readonly ControlValueAccessor[]>;
    useExisting: Type<any>;
    multi: boolean;
};

export declare class CdkListbox<T> implements AfterContentInit, OnDestroy, OnInit, ControlValueAccessor {
    private readonly _combobox;
    private readonly _dir?;
    _listKeyManager: ActiveDescendantKeyManager<CdkOption<T>>;
    _selectionModel: SelectionModel<CdkOption<T>>;
    _tabIndex: number;
    /** `View -> model callback called when select has been touched` */
    _onTouched: () => void;
    /** `View -> model callback called when value changes` */
    _onChange: (value: T) => void;
    readonly optionSelectionChanges: Observable<OptionSelectionChangeEvent<T>>;
    private _disabled;
    private _multiple;
    private _useActiveDescendant;
    private _autoFocus;
    private _activeOption;
    private readonly _destroyed;
    _options: QueryList<CdkOption<T>>;
    readonly selectionChange: EventEmitter<ListboxSelectionChangeEvent<T>>;
    id: string;
    /**
     * Whether the listbox allows multiple options to be selected.
     * If `multiple` switches from `true` to `false`, all options are deselected.
     */
    get multiple(): boolean;
    set multiple(value: BooleanInput);
    get disabled(): boolean;
    set disabled(value: BooleanInput);
    /** Whether the listbox will use active descendant or will move focus onto the options. */
    get useActiveDescendant(): boolean;
    set useActiveDescendant(shouldUseActiveDescendant: BooleanInput);
    /** Whether on focus the listbox will focus its active option, default to true. */
    get autoFocus(): boolean;
    set autoFocus(shouldAutoFocus: BooleanInput);
    /** Determines the orientation for the list key manager. Affects keyboard interaction. */
    orientation: 'horizontal' | 'vertical';
    compareWith: (o1: T, o2: T) => boolean;
    constructor(_combobox: CdkCombobox, _dir?: Directionality | undefined);
    ngOnInit(): void;
    ngAfterContentInit(): void;
    ngOnDestroy(): void;
    private _initKeyManager;
    private _initSelectionModel;
    _keydown(event: KeyboardEvent): void;
    /** Emits a selection change event, called when an option has its selected state changed. */
    _emitChangeEvent(option: CdkOption<T>): void;
    /** Updates the selection model after a toggle. */
    _updateSelectionModel(option: CdkOption<T>): void;
    _updatePanelForSelection(option: CdkOption<T>): void;
    /** Toggles the selected state of the active option if not disabled. */
    private _toggleActiveOption;
    /** Returns the id of the active option if active descendant is being used. */
    _getAriaActiveDescendant(): string | null | undefined;
    /** Updates the activeOption and the active and focus properties of the option. */
    private _updateActiveOption;
    /** Updates selection states of options when the 'multiple' property changes. */
    private _updateSelectionOnMultiSelectionChange;
    _focusActiveOption(): void;
    /** Selects the given option if the option and listbox aren't disabled. */
    select(option: CdkOption<T>): void;
    /** Deselects the given option if the option and listbox aren't disabled. */
    deselect(option: CdkOption<T>): void;
    /** Sets the selected state of all options to be the given value. */
    setAllSelected(isSelected: boolean): void;
    /** Updates the key manager's active item to the given option. */
    setActiveOption(option: CdkOption<T>): void;
    /**
     * Saves a callback function to be invoked when the select's value
     * changes from user input. Required to implement ControlValueAccessor.
     */
    registerOnChange(fn: (value: T) => void): void;
    /**
     * Saves a callback function to be invoked when the select is blurred
     * by the user. Required to implement ControlValueAccessor.
     */
    registerOnTouched(fn: () => {}): void;
    /** Sets the select's value. Required to implement ControlValueAccessor. */
    writeValue(values: T | T[]): void;
    /** Disables the select. Required to implement ControlValueAccessor. */
    setDisabledState(isDisabled: boolean): void;
    /** Returns the values of the currently selected options. */
    getSelectedValues(): T[];
    /** Selects an option that has the corresponding given value. */
    private _setSelectionByValue;
    static ɵfac: i0.ɵɵFactoryDeclaration<CdkListbox<any>, [{ optional: true; }, { optional: true; }]>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<CdkListbox<any>, "[cdkListbox]", ["cdkListbox"], { "id": "id"; "multiple": "multiple"; "disabled": "disabled"; "useActiveDescendant": "useActiveDescendant"; "autoFocus": "autoFocus"; "orientation": "listboxOrientation"; "compareWith": "compareWith"; }, { "selectionChange": "selectionChange"; }, ["_options"], never, false>;
}

export declare class CdkListboxModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<CdkListboxModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<CdkListboxModule, [typeof i1.CdkListbox, typeof i1.CdkOption], never, [typeof i1.CdkListbox, typeof i1.CdkOption]>;
    static ɵinj: i0.ɵɵInjectorDeclaration<CdkListboxModule>;
}

export declare class CdkOption<T = unknown> implements ListKeyManagerOption, Highlightable {
    private readonly _elementRef;
    readonly listbox: CdkListbox<T>;
    private _selected;
    private _disabled;
    private _value;
    _active: boolean;
    /** The id of the option, set to a uniqueid if the user does not provide one. */
    id: string;
    get selected(): boolean;
    set selected(value: BooleanInput);
    get disabled(): boolean;
    set disabled(value: BooleanInput);
    /** The form value of the option. */
    get value(): T;
    set value(value: T);
    /**
     * The text used to locate this item during menu typeahead. If not specified,
     * the `textContent` of the item will be used.
     */
    typeahead: string;
    readonly selectionChange: EventEmitter<OptionSelectionChangeEvent<T>>;
    constructor(_elementRef: ElementRef, listbox: CdkListbox<T>);
    /** Toggles the selected state, emits a change event through the injected listbox. */
    toggle(): void;
    /** Sets the active property true if the option and listbox aren't disabled. */
    activate(): void;
    /** Sets the active property false. */
    deactivate(): void;
    /** Sets the selected property true if it was false. */
    select(): void;
    /** Sets the selected property false if it was true. */
    deselect(): void;
    /** Applies focus to the option. */
    focus(): void;
    /** Returns true if the option or listbox are disabled, and false otherwise. */
    _isInteractionDisabled(): boolean;
    /** Emits a change event extending the Option Selection Change Event interface. */
    private _emitSelectionChange;
    /** Returns the tab index which depends on the disabled property. */
    _getTabIndex(): string | null;
    /** Get the label for this element which is required by the FocusableOption interface. */
    getLabel(): string;
    /** Sets the active property to true to enable the active css class. */
    setActiveStyles(): void;
    /** Sets the active property to false to disable the active css class. */
    setInactiveStyles(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<CdkOption<any>, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<CdkOption<any>, "[cdkOption]", ["cdkOption"], { "id": "id"; "selected": "selected"; "disabled": "disabled"; "value": "value"; "typeahead": "typeahead"; }, { "selectionChange": "selectionChange"; }, never, never, false>;
}

declare namespace i1 {
    export {
        CDK_LISTBOX_VALUE_ACCESSOR,
        CdkOption,
        CdkListbox,
        ListboxSelectionChangeEvent,
        OptionSelectionChangeEvent
    }
}

/** Change event that is being fired whenever the selected state of an option changes. */
export declare interface ListboxSelectionChangeEvent<T> {
    /** Reference to the listbox that emitted the event. */
    readonly source: CdkListbox<T>;
    /** Reference to the option that has been changed. */
    readonly option: CdkOption<T>;
}

/** Event object emitted by MatOption when selected or deselected. */
export declare interface OptionSelectionChangeEvent<T> {
    /** Reference to the option that emitted the event. */
    source: CdkOption<T>;
    /** Whether the change in the option's value was a result of a user action. */
    isUserInput: boolean;
}

export { }
