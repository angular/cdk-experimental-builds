import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import { CollectionViewer, ListRange, DataSource } from '@angular/cdk/collections';
import * as i0 from '@angular/core';
import { TrackByFunction, OnInit, AfterContentChecked, OnDestroy, EventEmitter } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import * as i1 from '@angular/cdk/table';

/**
 * Maintains a set of selected values. One or more values can be added to or removed from the
 * selection.
 */
interface TrackBySelection<T> {
    isSelected(value: SelectableWithIndex<T>): boolean;
    select(...values: SelectableWithIndex<T>[]): void;
    deselect(...values: SelectableWithIndex<T>[]): void;
    changed: Subject<SelectionChange<T>>;
}
/**
 * A selectable value with an optional index. The index is required when the selection is used with
 * `trackBy`.
 */
interface SelectableWithIndex<T> {
    value: T;
    index?: number;
}
/**
 * Represents the change in the selection set.
 */
interface SelectionChange<T> {
    before: SelectableWithIndex<T>[];
    after: SelectableWithIndex<T>[];
}
/**
 * Maintains a set of selected items. Support selecting and deselecting items, and checking if a
 * value is selected.
 * When constructed with a `trackByFn`, all the items will be identified by applying the `trackByFn`
 * on them. Because `trackByFn` requires the index of the item to be passed in, the `index` field is
 * expected to be set when calling `isSelected`, `select` and `deselect`.
 */
declare class SelectionSet<T> implements TrackBySelection<T> {
    private _multiple;
    private _trackByFn?;
    private _selectionMap;
    changed: Subject<SelectionChange<T>>;
    constructor(_multiple?: boolean, _trackByFn?: TrackByFunction<T> | undefined);
    isSelected(value: SelectableWithIndex<T>): boolean;
    select(...selects: SelectableWithIndex<T>[]): void;
    deselect(...selects: SelectableWithIndex<T>[]): void;
    private _markSelected;
    private _markDeselected;
    private _getTrackedByValue;
    private _getCurrentSelection;
}

/**
 * Manages the selection states of the items and provides methods to check and update the selection
 * states.
 * It must be applied to the parent element if `cdkSelectionToggle`, `cdkSelectAll`,
 * `cdkRowSelection` and `cdkSelectionColumn` are applied.
 */
declare class CdkSelection<T> implements OnInit, AfterContentChecked, CollectionViewer, OnDestroy {
    viewChange: Observable<ListRange>;
    get dataSource(): TableDataSource<T>;
    set dataSource(dataSource: TableDataSource<T>);
    private _dataSource;
    trackByFn: TrackByFunction<T>;
    /** Whether to support multiple selection */
    get multiple(): boolean;
    set multiple(multiple: BooleanInput);
    protected _multiple: boolean;
    /** Emits when selection changes. */
    readonly change: EventEmitter<SelectionChange<T>>;
    /** Latest data provided by the data source. */
    private _data;
    /** Subscription that listens for the data provided by the data source.  */
    private _renderChangeSubscription;
    private _destroyed;
    private _selection;
    private _switchDataSource;
    private _observeRenderChanges;
    ngOnInit(): void;
    ngAfterContentChecked(): void;
    ngOnDestroy(): void;
    /** Toggles selection for a given value. `index` is required if `trackBy` is used. */
    toggleSelection(value: T, index?: number): void;
    /**
     * Toggles select-all. If no value is selected, select all values. If all values or some of the
     * values are selected, de-select all values.
     */
    toggleSelectAll(): void;
    /** Checks whether a value is selected. `index` is required if `trackBy` is used. */
    isSelected(value: T, index?: number): boolean;
    /** Checks whether all values are selected. */
    isAllSelected(): boolean;
    /** Checks whether partially selected. */
    isPartialSelected(): boolean;
    private _selectAll;
    private _clearAll;
    private _updateSelectAllState;
    selectAllState: SelectAllState;
    static ɵfac: i0.ɵɵFactoryDeclaration<CdkSelection<any>, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<CdkSelection<any>, "[cdkSelection]", ["cdkSelection"], { "dataSource": { "alias": "dataSource"; "required": false; }; "trackByFn": { "alias": "trackBy"; "required": false; }; "multiple": { "alias": "cdkSelectionMultiple"; "required": false; }; }, { "change": "cdkSelectionChange"; }, never, never, true, never>;
}
type SelectAllState = 'all' | 'none' | 'partial';
type TableDataSource<T> = DataSource<T> | Observable<readonly T[]> | readonly T[];

/**
 * Makes the element a select-all toggle.
 *
 * Must be used within a parent `CdkSelection` directive. It toggles the selection states
 * of all the selection toggles connected with the `CdkSelection` directive.
 * If the element implements `ControlValueAccessor`, e.g. `MatCheckbox`, the directive
 * automatically connects it with the select-all state provided by the `CdkSelection` directive. If
 * not, use `checked$` to get the checked state, `indeterminate$` to get the indeterminate state,
 * and `toggle()` to change the selection state.
 */
declare class CdkSelectAll<T> implements OnDestroy, OnInit {
    private readonly _selection;
    private readonly _controlValueAccessor;
    /**
     * The checked state of the toggle.
     * Resolves to `true` if all the values are selected, `false` if no value is selected.
     */
    readonly checked: Observable<boolean>;
    /**
     * The indeterminate state of the toggle.
     * Resolves to `true` if part (not all) of the values are selected, `false` if all values or no
     * value at all are selected.
     */
    readonly indeterminate: Observable<boolean>;
    /**
     * Toggles the select-all state.
     * @param event The click event if the toggle is triggered by a (mouse or keyboard) click. If
     *     using with a native `<input type="checkbox">`, the parameter is required for the
     *     indeterminate state to work properly.
     */
    toggle(event?: MouseEvent): void;
    private readonly _destroyed;
    constructor();
    ngOnInit(): void;
    private _configureControlValueAccessor;
    private _assertValidParentSelection;
    ngOnDestroy(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<CdkSelectAll<any>, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<CdkSelectAll<any>, "[cdkSelectAll]", ["cdkSelectAll"], {}, {}, never, never, true, never>;
}

/**
 * Makes the element a selection toggle.
 *
 * Must be used within a parent `CdkSelection` directive.
 * Must be provided with the value. If `trackBy` is used on `CdkSelection`, the index of the value
 * is required. If the element implements `ControlValueAccessor`, e.g. `MatCheckbox`, the directive
 * automatically connects it with the selection state provided by the `CdkSelection` directive. If
 * not, use `checked$` to get the checked state of the value, and `toggle()` to change the selection
 * state.
 */
declare class CdkSelectionToggle<T> implements OnDestroy, OnInit {
    private _selection;
    private _controlValueAccessors;
    /** The value that is associated with the toggle */
    value: T;
    /** The index of the value in the list. Required when used with `trackBy` */
    get index(): number | undefined;
    set index(index: NumberInput);
    protected _index?: number;
    /** The checked state of the selection toggle */
    readonly checked: Observable<boolean>;
    /** Toggles the selection */
    toggle(): void;
    private _destroyed;
    constructor();
    ngOnInit(): void;
    ngOnDestroy(): void;
    private _assertValidParentSelection;
    private _configureControlValueAccessor;
    private _isSelected;
    static ɵfac: i0.ɵɵFactoryDeclaration<CdkSelectionToggle<any>, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<CdkSelectionToggle<any>, "[cdkSelectionToggle]", ["cdkSelectionToggle"], { "value": { "alias": "cdkSelectionToggleValue"; "required": false; }; "index": { "alias": "cdkSelectionToggleIndex"; "required": false; }; }, {}, never, never, true, never>;
}

/**
 * Column that adds row selecting checkboxes and a select-all checkbox if `cdkSelectionMultiple` is
 * `true`.
 *
 * Must be used within a parent `CdkSelection` directive.
 */
declare class CdkSelectionColumn<T> implements OnInit, OnDestroy {
    private _table;
    readonly selection: CdkSelection<T> | null;
    /** Column name that should be used to reference this column. */
    get name(): string;
    set name(name: string);
    private _name;
    private readonly _columnDef;
    private readonly _cell;
    private readonly _headerCell;
    ngOnInit(): void;
    ngOnDestroy(): void;
    private _syncColumnDefName;
    static ɵfac: i0.ɵɵFactoryDeclaration<CdkSelectionColumn<any>, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<CdkSelectionColumn<any>, "cdk-selection-column", never, { "name": { "alias": "cdkSelectionColumnName"; "required": false; }; }, {}, never, never, true, never>;
}

/**
 * Applies `cdk-selected` class and `aria-selected` to an element.
 *
 * Must be used within a parent `CdkSelection` directive.
 * Must be provided with the value. The index is required if `trackBy` is used on the `CdkSelection`
 * directive.
 */
declare class CdkRowSelection<T> {
    readonly _selection: CdkSelection<T>;
    value: T;
    get index(): number | undefined;
    set index(index: NumberInput);
    protected _index?: number;
    static ɵfac: i0.ɵɵFactoryDeclaration<CdkRowSelection<any>, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<CdkRowSelection<any>, "[cdkRowSelection]", never, { "value": { "alias": "cdkRowSelectionValue"; "required": false; }; "index": { "alias": "cdkRowSelectionIndex"; "required": false; }; }, {}, never, never, true, never>;
}

declare class CdkSelectionModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<CdkSelectionModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<CdkSelectionModule, never, [typeof i1.CdkTableModule, typeof CdkSelection, typeof CdkSelectionToggle, typeof CdkSelectAll, typeof CdkSelectionColumn, typeof CdkRowSelection], [typeof CdkSelection, typeof CdkSelectionToggle, typeof CdkSelectAll, typeof CdkSelectionColumn, typeof CdkRowSelection]>;
    static ɵinj: i0.ɵɵInjectorDeclaration<CdkSelectionModule>;
}

export { CdkRowSelection, CdkSelectAll, CdkSelection, CdkSelectionColumn, CdkSelectionModule, CdkSelectionToggle, type SelectableWithIndex, type SelectionChange, SelectionSet };
