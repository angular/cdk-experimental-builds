import { coerceBooleanProperty, coerceNumberProperty } from '@angular/cdk/coercion';
import { isDataSource } from '@angular/cdk/collections';
import * as i0 from '@angular/core';
import { EventEmitter, Directive, Input, Output, inject, Component, ChangeDetectionStrategy, ViewEncapsulation, ViewChild, NgModule } from '@angular/core';
import { Subject, Observable, of } from 'rxjs';
import { takeUntil, switchMap, distinctUntilChanged } from 'rxjs/operators';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { CdkTable, CdkColumnDef, CdkCellDef, CdkHeaderCellDef, CdkTableModule } from '@angular/cdk/table';
import { AsyncPipe } from '@angular/common';

class SelectionSet {
  _multiple;
  _trackByFn;
  _selectionMap = new Map();
  changed = new Subject();
  constructor(_multiple = false, _trackByFn) {
    this._multiple = _multiple;
    this._trackByFn = _trackByFn;
  }
  isSelected(value) {
    return this._selectionMap.has(this._getTrackedByValue(value));
  }
  select(...selects) {
    if (!this._multiple && selects.length > 1 && (typeof ngDevMode === 'undefined' || ngDevMode)) {
      throw Error('SelectionSet: not multiple selection');
    }
    const before = this._getCurrentSelection();
    if (!this._multiple) {
      this._selectionMap.clear();
    }
    for (const select of selects) {
      if (this.isSelected(select)) {
        continue;
      }
      this._markSelected(this._getTrackedByValue(select), select);
    }
    const after = this._getCurrentSelection();
    this.changed.next({
      before,
      after
    });
  }
  deselect(...selects) {
    if (!this._multiple && selects.length > 1 && (typeof ngDevMode === 'undefined' || ngDevMode)) {
      throw Error('SelectionSet: not multiple selection');
    }
    const before = this._getCurrentSelection();
    for (const select of selects) {
      if (!this.isSelected(select)) {
        continue;
      }
      this._markDeselected(this._getTrackedByValue(select));
    }
    const after = this._getCurrentSelection();
    this.changed.next({
      before,
      after
    });
  }
  _markSelected(key, toSelect) {
    this._selectionMap.set(key, toSelect);
  }
  _markDeselected(key) {
    this._selectionMap.delete(key);
  }
  _getTrackedByValue(select) {
    if (!this._trackByFn) {
      return select.value;
    }
    if (select.index == null && (typeof ngDevMode === 'undefined' || ngDevMode)) {
      throw Error('SelectionSet: index required when trackByFn is used.');
    }
    return this._trackByFn(select.index, select.value);
  }
  _getCurrentSelection() {
    return Array.from(this._selectionMap.values());
  }
}

class CdkSelection {
  viewChange;
  get dataSource() {
    return this._dataSource;
  }
  set dataSource(dataSource) {
    if (this._dataSource !== dataSource) {
      this._switchDataSource(dataSource);
    }
  }
  _dataSource;
  trackByFn;
  get multiple() {
    return this._multiple;
  }
  set multiple(multiple) {
    this._multiple = coerceBooleanProperty(multiple);
  }
  _multiple;
  change = new EventEmitter();
  _data;
  _renderChangeSubscription;
  _destroyed = new Subject();
  _selection;
  _switchDataSource(dataSource) {
    this._data = [];
    if (isDataSource(this._dataSource)) {
      this._dataSource.disconnect(this);
    }
    if (this._renderChangeSubscription) {
      this._renderChangeSubscription.unsubscribe();
      this._renderChangeSubscription = null;
    }
    this._dataSource = dataSource;
  }
  _observeRenderChanges() {
    if (!this._dataSource) {
      return;
    }
    let dataStream;
    if (isDataSource(this._dataSource)) {
      dataStream = this._dataSource.connect(this);
    } else if (this._dataSource instanceof Observable) {
      dataStream = this._dataSource;
    } else if (Array.isArray(this._dataSource)) {
      dataStream = of(this._dataSource);
    }
    if (dataStream == null && (typeof ngDevMode === 'undefined' || ngDevMode)) {
      throw Error('Unknown data source');
    }
    this._renderChangeSubscription = dataStream.pipe(takeUntil(this._destroyed)).subscribe(data => {
      this._data = data || [];
    });
  }
  ngOnInit() {
    this._selection = new SelectionSet(this._multiple, this.trackByFn);
    this._selection.changed.pipe(takeUntil(this._destroyed)).subscribe(change => {
      this._updateSelectAllState();
      this.change.emit(change);
    });
  }
  ngAfterContentChecked() {
    if (this._dataSource && !this._renderChangeSubscription) {
      this._observeRenderChanges();
    }
  }
  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
    if (isDataSource(this._dataSource)) {
      this._dataSource.disconnect(this);
    }
  }
  toggleSelection(value, index) {
    if (!!this.trackByFn && index == null && (typeof ngDevMode === 'undefined' || ngDevMode)) {
      throw Error('CdkSelection: index required when trackBy is used');
    }
    if (this.isSelected(value, index)) {
      this._selection.deselect({
        value,
        index
      });
    } else {
      this._selection.select({
        value,
        index
      });
    }
  }
  toggleSelectAll() {
    if (!this._multiple && (typeof ngDevMode === 'undefined' || ngDevMode)) {
      throw Error('CdkSelection: multiple selection not enabled');
    }
    if (this.selectAllState === 'none') {
      this._selectAll();
    } else {
      this._clearAll();
    }
  }
  isSelected(value, index) {
    if (!!this.trackByFn && index == null && (typeof ngDevMode === 'undefined' || ngDevMode)) {
      throw Error('CdkSelection: index required when trackBy is used');
    }
    return this._selection.isSelected({
      value,
      index
    });
  }
  isAllSelected() {
    return this._data.every((value, index) => this._selection.isSelected({
      value,
      index
    }));
  }
  isPartialSelected() {
    return !this.isAllSelected() && this._data.some((value, index) => this._selection.isSelected({
      value,
      index
    }));
  }
  _selectAll() {
    const toSelect = [];
    this._data.forEach((value, index) => {
      toSelect.push({
        value,
        index
      });
    });
    this._selection.select(...toSelect);
  }
  _clearAll() {
    const toDeselect = [];
    this._data.forEach((value, index) => {
      toDeselect.push({
        value,
        index
      });
    });
    this._selection.deselect(...toDeselect);
  }
  _updateSelectAllState() {
    if (this.isAllSelected()) {
      this.selectAllState = 'all';
    } else if (this.isPartialSelected()) {
      this.selectAllState = 'partial';
    } else {
      this.selectAllState = 'none';
    }
  }
  selectAllState = 'none';
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: "12.0.0",
    version: "20.2.0-next.2",
    ngImport: i0,
    type: CdkSelection,
    deps: [],
    target: i0.ɵɵFactoryTarget.Directive
  });
  static ɵdir = i0.ɵɵngDeclareDirective({
    minVersion: "14.0.0",
    version: "20.2.0-next.2",
    type: CdkSelection,
    isStandalone: true,
    selector: "[cdkSelection]",
    inputs: {
      dataSource: "dataSource",
      trackByFn: ["trackBy", "trackByFn"],
      multiple: ["cdkSelectionMultiple", "multiple"]
    },
    outputs: {
      change: "cdkSelectionChange"
    },
    exportAs: ["cdkSelection"],
    ngImport: i0
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: "12.0.0",
  version: "20.2.0-next.2",
  ngImport: i0,
  type: CdkSelection,
  decorators: [{
    type: Directive,
    args: [{
      selector: '[cdkSelection]',
      exportAs: 'cdkSelection'
    }]
  }],
  propDecorators: {
    dataSource: [{
      type: Input
    }],
    trackByFn: [{
      type: Input,
      args: ['trackBy']
    }],
    multiple: [{
      type: Input,
      args: ['cdkSelectionMultiple']
    }],
    change: [{
      type: Output,
      args: ['cdkSelectionChange']
    }]
  }
});

class CdkSelectAll {
  _selection = inject(CdkSelection, {
    optional: true
  });
  _controlValueAccessor = inject(NG_VALUE_ACCESSOR, {
    optional: true,
    self: true
  });
  checked;
  indeterminate;
  toggle(event) {
    if (event) {
      event.preventDefault();
    }
    setTimeout(() => {
      this._selection.toggleSelectAll();
    });
  }
  _destroyed = new Subject();
  constructor() {
    const _selection = this._selection;
    this.checked = _selection.change.pipe(switchMap(() => of(_selection.isAllSelected())));
    this.indeterminate = _selection.change.pipe(switchMap(() => of(_selection.isPartialSelected())));
  }
  ngOnInit() {
    this._assertValidParentSelection();
    this._configureControlValueAccessor();
  }
  _configureControlValueAccessor() {
    if (this._controlValueAccessor && this._controlValueAccessor.length) {
      this._controlValueAccessor[0].registerOnChange(e => {
        if (e === true || e === false) {
          this.toggle();
        }
      });
      this.checked.pipe(takeUntil(this._destroyed)).subscribe(state => {
        this._controlValueAccessor[0].writeValue(state);
      });
    }
  }
  _assertValidParentSelection() {
    if (!this._selection && (typeof ngDevMode === 'undefined' || ngDevMode)) {
      throw Error('CdkSelectAll: missing CdkSelection in the parent');
    }
    if (!this._selection.multiple && (typeof ngDevMode === 'undefined' || ngDevMode)) {
      throw Error('CdkSelectAll: CdkSelection must have cdkSelectionMultiple set to true');
    }
  }
  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
  }
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: "12.0.0",
    version: "20.2.0-next.2",
    ngImport: i0,
    type: CdkSelectAll,
    deps: [],
    target: i0.ɵɵFactoryTarget.Directive
  });
  static ɵdir = i0.ɵɵngDeclareDirective({
    minVersion: "14.0.0",
    version: "20.2.0-next.2",
    type: CdkSelectAll,
    isStandalone: true,
    selector: "[cdkSelectAll]",
    exportAs: ["cdkSelectAll"],
    ngImport: i0
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: "12.0.0",
  version: "20.2.0-next.2",
  ngImport: i0,
  type: CdkSelectAll,
  decorators: [{
    type: Directive,
    args: [{
      selector: '[cdkSelectAll]',
      exportAs: 'cdkSelectAll'
    }]
  }],
  ctorParameters: () => []
});

class CdkSelectionToggle {
  _selection = inject(CdkSelection, {
    optional: true
  });
  _controlValueAccessors = inject(NG_VALUE_ACCESSOR, {
    optional: true,
    self: true
  });
  value;
  get index() {
    return this._index;
  }
  set index(index) {
    this._index = coerceNumberProperty(index);
  }
  _index;
  checked;
  toggle() {
    this._selection.toggleSelection(this.value, this.index);
  }
  _destroyed = new Subject();
  constructor() {
    const _selection = this._selection;
    this.checked = _selection.change.pipe(switchMap(() => of(this._isSelected())), distinctUntilChanged());
  }
  ngOnInit() {
    this._assertValidParentSelection();
    this._configureControlValueAccessor();
  }
  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
  }
  _assertValidParentSelection() {
    if (!this._selection && (typeof ngDevMode === 'undefined' || ngDevMode)) {
      throw Error('CdkSelectAll: missing CdkSelection in the parent');
    }
  }
  _configureControlValueAccessor() {
    if (this._controlValueAccessors && this._controlValueAccessors.length) {
      this._controlValueAccessors[0].registerOnChange(e => {
        if (typeof e === 'boolean') {
          this.toggle();
        }
      });
      this.checked.pipe(takeUntil(this._destroyed)).subscribe(state => {
        this._controlValueAccessors[0].writeValue(state);
      });
    }
  }
  _isSelected() {
    return this._selection.isSelected(this.value, this.index);
  }
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: "12.0.0",
    version: "20.2.0-next.2",
    ngImport: i0,
    type: CdkSelectionToggle,
    deps: [],
    target: i0.ɵɵFactoryTarget.Directive
  });
  static ɵdir = i0.ɵɵngDeclareDirective({
    minVersion: "14.0.0",
    version: "20.2.0-next.2",
    type: CdkSelectionToggle,
    isStandalone: true,
    selector: "[cdkSelectionToggle]",
    inputs: {
      value: ["cdkSelectionToggleValue", "value"],
      index: ["cdkSelectionToggleIndex", "index"]
    },
    exportAs: ["cdkSelectionToggle"],
    ngImport: i0
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: "12.0.0",
  version: "20.2.0-next.2",
  ngImport: i0,
  type: CdkSelectionToggle,
  decorators: [{
    type: Directive,
    args: [{
      selector: '[cdkSelectionToggle]',
      exportAs: 'cdkSelectionToggle'
    }]
  }],
  ctorParameters: () => [],
  propDecorators: {
    value: [{
      type: Input,
      args: ['cdkSelectionToggleValue']
    }],
    index: [{
      type: Input,
      args: ['cdkSelectionToggleIndex']
    }]
  }
});

class CdkSelectionColumn {
  _table = inject(CdkTable, {
    optional: true
  });
  selection = inject(CdkSelection, {
    optional: true
  });
  get name() {
    return this._name;
  }
  set name(name) {
    this._name = name;
    this._syncColumnDefName();
  }
  _name;
  _columnDef;
  _cell;
  _headerCell;
  ngOnInit() {
    if (!this.selection && (typeof ngDevMode === 'undefined' || ngDevMode)) {
      throw Error('CdkSelectionColumn: missing CdkSelection in the parent');
    }
    this._syncColumnDefName();
    if (this._table) {
      this._columnDef.cell = this._cell;
      this._columnDef.headerCell = this._headerCell;
      this._table.addColumnDef(this._columnDef);
    } else if (typeof ngDevMode === 'undefined' || ngDevMode) {
      throw Error('CdkSelectionColumn: missing parent table');
    }
  }
  ngOnDestroy() {
    if (this._table) {
      this._table.removeColumnDef(this._columnDef);
    }
  }
  _syncColumnDefName() {
    if (this._columnDef) {
      this._columnDef.name = this._name;
    }
  }
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: "12.0.0",
    version: "20.2.0-next.2",
    ngImport: i0,
    type: CdkSelectionColumn,
    deps: [],
    target: i0.ɵɵFactoryTarget.Component
  });
  static ɵcmp = i0.ɵɵngDeclareComponent({
    minVersion: "17.0.0",
    version: "20.2.0-next.2",
    type: CdkSelectionColumn,
    isStandalone: true,
    selector: "cdk-selection-column",
    inputs: {
      name: ["cdkSelectionColumnName", "name"]
    },
    viewQueries: [{
      propertyName: "_columnDef",
      first: true,
      predicate: CdkColumnDef,
      descendants: true,
      static: true
    }, {
      propertyName: "_cell",
      first: true,
      predicate: CdkCellDef,
      descendants: true,
      static: true
    }, {
      propertyName: "_headerCell",
      first: true,
      predicate: CdkHeaderCellDef,
      descendants: true,
      static: true
    }],
    ngImport: i0,
    template: `
    <ng-container cdkColumnDef>
      <th cdkHeaderCell *cdkHeaderCellDef>
        @if (selection && selection.multiple) {
          <input type="checkbox"
              cdkSelectAll
              #allToggler="cdkSelectAll"
              [checked]="allToggler.checked | async"
              [indeterminate]="allToggler.indeterminate | async"
              (click)="allToggler.toggle($event)">
        }
      </th>
      <td cdkCell *cdkCellDef="let row; let i = $index">
        <input type="checkbox"
            #toggler="cdkSelectionToggle"
            cdkSelectionToggle
            [cdkSelectionToggleValue]="row"
            [cdkSelectionToggleIndex]="i"
            (click)="toggler.toggle()"
            [checked]="toggler.checked | async">
      </td>
    </ng-container>
  `,
    isInline: true,
    dependencies: [{
      kind: "directive",
      type: CdkColumnDef,
      selector: "[cdkColumnDef]",
      inputs: ["cdkColumnDef", "sticky", "stickyEnd"]
    }, {
      kind: "directive",
      type: CdkHeaderCellDef,
      selector: "[cdkHeaderCellDef]"
    }, {
      kind: "directive",
      type: CdkSelectAll,
      selector: "[cdkSelectAll]",
      exportAs: ["cdkSelectAll"]
    }, {
      kind: "directive",
      type: CdkCellDef,
      selector: "[cdkCellDef]"
    }, {
      kind: "directive",
      type: CdkSelectionToggle,
      selector: "[cdkSelectionToggle]",
      inputs: ["cdkSelectionToggleValue", "cdkSelectionToggleIndex"],
      exportAs: ["cdkSelectionToggle"]
    }, {
      kind: "pipe",
      type: AsyncPipe,
      name: "async"
    }],
    changeDetection: i0.ChangeDetectionStrategy.OnPush,
    encapsulation: i0.ViewEncapsulation.None
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: "12.0.0",
  version: "20.2.0-next.2",
  ngImport: i0,
  type: CdkSelectionColumn,
  decorators: [{
    type: Component,
    args: [{
      selector: 'cdk-selection-column',
      template: `
    <ng-container cdkColumnDef>
      <th cdkHeaderCell *cdkHeaderCellDef>
        @if (selection && selection.multiple) {
          <input type="checkbox"
              cdkSelectAll
              #allToggler="cdkSelectAll"
              [checked]="allToggler.checked | async"
              [indeterminate]="allToggler.indeterminate | async"
              (click)="allToggler.toggle($event)">
        }
      </th>
      <td cdkCell *cdkCellDef="let row; let i = $index">
        <input type="checkbox"
            #toggler="cdkSelectionToggle"
            cdkSelectionToggle
            [cdkSelectionToggleValue]="row"
            [cdkSelectionToggleIndex]="i"
            (click)="toggler.toggle()"
            [checked]="toggler.checked | async">
      </td>
    </ng-container>
  `,
      changeDetection: ChangeDetectionStrategy.OnPush,
      encapsulation: ViewEncapsulation.None,
      imports: [CdkColumnDef, CdkHeaderCellDef, CdkSelectAll, CdkCellDef, CdkSelectionToggle, AsyncPipe]
    }]
  }],
  propDecorators: {
    name: [{
      type: Input,
      args: ['cdkSelectionColumnName']
    }],
    _columnDef: [{
      type: ViewChild,
      args: [CdkColumnDef, {
        static: true
      }]
    }],
    _cell: [{
      type: ViewChild,
      args: [CdkCellDef, {
        static: true
      }]
    }],
    _headerCell: [{
      type: ViewChild,
      args: [CdkHeaderCellDef, {
        static: true
      }]
    }]
  }
});

class CdkRowSelection {
  _selection = inject(CdkSelection);
  value = undefined;
  get index() {
    return this._index;
  }
  set index(index) {
    this._index = coerceNumberProperty(index);
  }
  _index;
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: "12.0.0",
    version: "20.2.0-next.2",
    ngImport: i0,
    type: CdkRowSelection,
    deps: [],
    target: i0.ɵɵFactoryTarget.Directive
  });
  static ɵdir = i0.ɵɵngDeclareDirective({
    minVersion: "14.0.0",
    version: "20.2.0-next.2",
    type: CdkRowSelection,
    isStandalone: true,
    selector: "[cdkRowSelection]",
    inputs: {
      value: ["cdkRowSelectionValue", "value"],
      index: ["cdkRowSelectionIndex", "index"]
    },
    host: {
      properties: {
        "class.cdk-selected": "_selection.isSelected(this.value, this.index)",
        "attr.aria-selected": "_selection.isSelected(this.value, this.index)"
      }
    },
    ngImport: i0
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: "12.0.0",
  version: "20.2.0-next.2",
  ngImport: i0,
  type: CdkRowSelection,
  decorators: [{
    type: Directive,
    args: [{
      selector: '[cdkRowSelection]',
      host: {
        '[class.cdk-selected]': '_selection.isSelected(this.value, this.index)',
        '[attr.aria-selected]': '_selection.isSelected(this.value, this.index)'
      }
    }]
  }],
  propDecorators: {
    value: [{
      type: Input,
      args: ['cdkRowSelectionValue']
    }],
    index: [{
      type: Input,
      args: ['cdkRowSelectionIndex']
    }]
  }
});

class CdkSelectionModule {
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: "12.0.0",
    version: "20.2.0-next.2",
    ngImport: i0,
    type: CdkSelectionModule,
    deps: [],
    target: i0.ɵɵFactoryTarget.NgModule
  });
  static ɵmod = i0.ɵɵngDeclareNgModule({
    minVersion: "14.0.0",
    version: "20.2.0-next.2",
    ngImport: i0,
    type: CdkSelectionModule,
    imports: [CdkTableModule, CdkSelection, CdkSelectionToggle, CdkSelectAll, CdkSelectionColumn, CdkRowSelection],
    exports: [CdkSelection, CdkSelectionToggle, CdkSelectAll, CdkSelectionColumn, CdkRowSelection]
  });
  static ɵinj = i0.ɵɵngDeclareInjector({
    minVersion: "12.0.0",
    version: "20.2.0-next.2",
    ngImport: i0,
    type: CdkSelectionModule,
    imports: [CdkTableModule]
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: "12.0.0",
  version: "20.2.0-next.2",
  ngImport: i0,
  type: CdkSelectionModule,
  decorators: [{
    type: NgModule,
    args: [{
      imports: [CdkTableModule, CdkSelection, CdkSelectionToggle, CdkSelectAll, CdkSelectionColumn, CdkRowSelection],
      exports: [CdkSelection, CdkSelectionToggle, CdkSelectAll, CdkSelectionColumn, CdkRowSelection]
    }]
  }]
});

export { CdkRowSelection, CdkSelectAll, CdkSelection, CdkSelectionColumn, CdkSelectionModule, CdkSelectionToggle, SelectionSet };
//# sourceMappingURL=selection.mjs.map
