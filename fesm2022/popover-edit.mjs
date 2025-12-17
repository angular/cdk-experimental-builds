import { closest } from './_polyfill-chunk.mjs';
import * as i0 from '@angular/core';
import { inject, NgZone, Injectable, Injector, afterNextRender, ElementRef, EventEmitter, Directive, Input, DOCUMENT, Renderer2, ViewContainerRef, TemplateRef, NgModule } from '@angular/core';
import { Subject, pipe, combineLatest, Observable, merge } from 'rxjs';
import { distinctUntilChanged, startWith, shareReplay, filter, map, auditTime, audit, debounceTime, skip, takeUntil, mapTo, throttleTime, share, withLatestFrom } from 'rxjs/operators';
import { ControlContainer } from '@angular/forms';
import { Directionality } from '@angular/cdk/bidi';
import { RIGHT_ARROW, LEFT_ARROW, DOWN_ARROW, UP_ARROW, hasModifierKey } from '@angular/cdk/keycodes';
import { createOverlayRef, createRepositionScrollStrategy, createFlexibleConnectedPositionStrategy, OverlayModule } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { FocusTrapFactory, InteractivityChecker, FocusTrap } from '@angular/cdk/a11y';
import { ScrollDispatcher, ViewportRuler } from '@angular/cdk/scrolling';

const CELL_SELECTOR = '.cdk-cell, .mat-cell, td';
const EDITABLE_CELL_SELECTOR = '.cdk-popover-edit-cell, .mat-popover-edit-cell';
const ROW_SELECTOR = '.cdk-row, .mat-row, tr';
const TABLE_SELECTOR = 'table, cdk-table, mat-table';
const EDIT_PANE_CLASS = 'cdk-edit-pane';
const EDIT_PANE_SELECTOR = `.${EDIT_PANE_CLASS}, .mat-edit-pane`;
const SKIP_ROW_FOCUS_SELECTOR = '.cdk-popover-edit-skip-focus, .mat-popover-edit-skip-focus';

const MOUSE_EVENT_DELAY_MS = 40;
const FOCUS_DELAY = 0;
var HoverContentState;
(function (HoverContentState) {
  HoverContentState[HoverContentState["OFF"] = 0] = "OFF";
  HoverContentState[HoverContentState["FOCUSABLE"] = 1] = "FOCUSABLE";
  HoverContentState[HoverContentState["ON"] = 2] = "ON";
})(HoverContentState || (HoverContentState = {}));
class EditEventDispatcher {
  _ngZone = inject(NgZone);
  editing = new Subject();
  hovering = new Subject();
  focused = new Subject();
  allRows = new Subject();
  mouseMove = new Subject();
  disabledCells = new WeakMap();
  get editRef() {
    return this._editRef;
  }
  _editRef = null;
  _distinctUntilChanged = distinctUntilChanged();
  _startWithNull = startWith(null);
  _distinctShare = pipe(this._distinctUntilChanged, shareReplay(1));
  _startWithNullDistinct = pipe(this._startWithNull, this._distinctUntilChanged);
  editingAndEnabled = this.editing.pipe(filter(cell => cell == null || !this.disabledCells.has(cell)), shareReplay(1));
  editingOrFocused = combineLatest([this.editingAndEnabled.pipe(map(cell => closest(cell, ROW_SELECTOR)), this._startWithNull), this.focused.pipe(this._startWithNull)]).pipe(map(([editingRow, focusedRow]) => focusedRow || editingRow), this._distinctUntilChanged, auditTime(FOCUS_DELAY), this._distinctUntilChanged, shareReplay(1));
  _rowsWithHoverContent = new WeakMap();
  _currentlyEditing = null;
  _hoveredContentStateDistinct = combineLatest([this._getFirstRowWithHoverContent(), this._getLastRowWithHoverContent(), this.editingOrFocused, this.hovering.pipe(distinctUntilChanged(), audit(row => this.mouseMove.pipe(filter(mouseMoveRow => row === mouseMoveRow), this._startWithNull, debounceTime(MOUSE_EVENT_DELAY_MS))), this._startWithNullDistinct)]).pipe(skip(1), map(computeHoverContentState), distinctUntilChanged(areMapEntriesEqual), this._enterZone(), shareReplay(1));
  _editingAndEnabledDistinct = this.editingAndEnabled.pipe(distinctUntilChanged(), this._enterZone(), shareReplay(1));
  _lastSeenRow = null;
  _lastSeenRowHoverOrFocus = null;
  constructor() {
    this._editingAndEnabledDistinct.subscribe(cell => {
      this._currentlyEditing = cell;
    });
  }
  editingCell(element) {
    let cell = null;
    return this._editingAndEnabledDistinct.pipe(map(editCell => editCell === (cell || (cell = closest(element, CELL_SELECTOR)))), this._distinctUntilChanged);
  }
  doneEditingCell(element) {
    const cell = closest(element, CELL_SELECTOR);
    if (this._currentlyEditing === cell) {
      this.editing.next(null);
    }
  }
  setActiveEditRef(ref) {
    this._editRef = ref;
  }
  unsetActiveEditRef(ref) {
    if (this._editRef !== ref) {
      return;
    }
    this._editRef = null;
  }
  registerRowWithHoverContent(row) {
    this._rowsWithHoverContent.set(row, (this._rowsWithHoverContent.get(row) || 0) + 1);
  }
  deregisterRowWithHoverContent(row) {
    const refCount = this._rowsWithHoverContent.get(row) || 0;
    if (refCount <= 1) {
      this._rowsWithHoverContent.delete(row);
    } else {
      this._rowsWithHoverContent.set(row, refCount - 1);
    }
  }
  hoverOrFocusOnRow(row) {
    if (row !== this._lastSeenRow) {
      this._lastSeenRow = row;
      this._lastSeenRowHoverOrFocus = this._hoveredContentStateDistinct.pipe(map(state => state.get(row) || HoverContentState.OFF), this._distinctShare);
    }
    return this._lastSeenRowHoverOrFocus;
  }
  _enterZone() {
    return source => new Observable(observer => source.subscribe({
      next: value => this._ngZone.run(() => observer.next(value)),
      error: err => observer.error(err),
      complete: () => observer.complete()
    }));
  }
  _getFirstRowWithHoverContent() {
    return this._mapAllRowsToSingleRow(rows => {
      for (let i = 0, row; row = rows[i]; i++) {
        if (this._rowsWithHoverContent.has(row)) {
          return row;
        }
      }
      return null;
    });
  }
  _getLastRowWithHoverContent() {
    return this._mapAllRowsToSingleRow(rows => {
      for (let i = rows.length - 1, row; row = rows[i]; i--) {
        if (this._rowsWithHoverContent.has(row)) {
          return row;
        }
      }
      return null;
    });
  }
  _mapAllRowsToSingleRow(mapper) {
    return this.allRows.pipe(map(mapper), this._startWithNullDistinct);
  }
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: "12.0.0",
    version: "21.0.3",
    ngImport: i0,
    type: EditEventDispatcher,
    deps: [],
    target: i0.ɵɵFactoryTarget.Injectable
  });
  static ɵprov = i0.ɵɵngDeclareInjectable({
    minVersion: "12.0.0",
    version: "21.0.3",
    ngImport: i0,
    type: EditEventDispatcher
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: "12.0.0",
  version: "21.0.3",
  ngImport: i0,
  type: EditEventDispatcher,
  decorators: [{
    type: Injectable
  }],
  ctorParameters: () => []
});
function computeHoverContentState([firstRow, lastRow, activeRow, hoverRow]) {
  const hoverContentState = new Map();
  for (const focussableRow of [firstRow, lastRow, activeRow && activeRow.previousElementSibling, activeRow && activeRow.nextElementSibling]) {
    if (focussableRow) {
      hoverContentState.set(focussableRow, HoverContentState.FOCUSABLE);
    }
  }
  for (const onRow of [activeRow, hoverRow]) {
    if (onRow) {
      hoverContentState.set(onRow, HoverContentState.ON);
    }
  }
  return hoverContentState;
}
function areMapEntriesEqual(a, b) {
  if (a.size !== b.size) {
    return false;
  }
  for (const aKey of Array.from(a.keys())) {
    if (b.get(aKey) !== a.get(aKey)) {
      return false;
    }
  }
  return true;
}

class EditRef {
  _form = inject(ControlContainer, {
    self: true
  });
  _editEventDispatcher = inject(EditEventDispatcher);
  _finalValueSubject = new Subject();
  finalValue = this._finalValueSubject;
  _blurredSubject = new Subject();
  blurred = this._blurredSubject;
  _revertFormValue;
  _injector = inject(Injector);
  constructor() {
    this._editEventDispatcher.setActiveEditRef(this);
  }
  init(previousFormValue) {
    afterNextRender(() => {
      this.updateRevertValue();
      if (previousFormValue) {
        this.reset(previousFormValue);
      }
    }, {
      injector: this._injector
    });
  }
  ngOnDestroy() {
    this._editEventDispatcher.unsetActiveEditRef(this);
    this._finalValueSubject.next(this._form.value);
    this._finalValueSubject.complete();
  }
  isValid() {
    return this._form.valid;
  }
  updateRevertValue() {
    this._revertFormValue = this._form.value;
  }
  close() {
    this._editEventDispatcher.editing.next(null);
  }
  blur() {
    this._blurredSubject.next();
  }
  reset(value) {
    this._form.reset(value || this._revertFormValue);
  }
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: "12.0.0",
    version: "21.0.3",
    ngImport: i0,
    type: EditRef,
    deps: [],
    target: i0.ɵɵFactoryTarget.Injectable
  });
  static ɵprov = i0.ɵɵngDeclareInjectable({
    minVersion: "12.0.0",
    version: "21.0.3",
    ngImport: i0,
    type: EditRef
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: "12.0.0",
  version: "21.0.3",
  ngImport: i0,
  type: EditRef,
  decorators: [{
    type: Injectable
  }],
  ctorParameters: () => []
});

class FocusDispatcher {
  directionality = inject(Directionality);
  keyObserver = {
    next: event => this.handleKeyboardEvent(event)
  };
  moveFocusHorizontally(currentCell, offset) {
    const cells = Array.from(closest(currentCell, TABLE_SELECTOR).querySelectorAll(EDITABLE_CELL_SELECTOR));
    const currentIndex = cells.indexOf(currentCell);
    const newIndex = currentIndex + offset;
    if (cells[newIndex]) {
      cells[newIndex].focus();
    }
  }
  moveFocusVertically(currentCell, offset) {
    const currentRow = closest(currentCell, ROW_SELECTOR);
    const rows = Array.from(closest(currentRow, TABLE_SELECTOR).querySelectorAll(ROW_SELECTOR));
    const currentRowIndex = rows.indexOf(currentRow);
    const currentIndexWithinRow = Array.from(currentRow.querySelectorAll(EDITABLE_CELL_SELECTOR)).indexOf(currentCell);
    let newRowIndex = currentRowIndex + offset;
    while (rows[newRowIndex]?.matches(SKIP_ROW_FOCUS_SELECTOR)) {
      newRowIndex = newRowIndex + (offset > 0 ? 1 : -1);
    }
    if (rows[newRowIndex]) {
      const rowToFocus = Array.from(rows[newRowIndex].querySelectorAll(EDITABLE_CELL_SELECTOR));
      if (rowToFocus[currentIndexWithinRow]) {
        rowToFocus[currentIndexWithinRow].focus();
      }
    }
  }
  handleKeyboardEvent(event) {
    const cell = closest(event.target, EDITABLE_CELL_SELECTOR);
    if (!cell) {
      return;
    }
    switch (event.keyCode) {
      case UP_ARROW:
        this.moveFocusVertically(cell, -1);
        break;
      case DOWN_ARROW:
        this.moveFocusVertically(cell, 1);
        break;
      case LEFT_ARROW:
        this.moveFocusHorizontally(cell, this.directionality.value === 'ltr' ? -1 : 1);
        break;
      case RIGHT_ARROW:
        this.moveFocusHorizontally(cell, this.directionality.value === 'ltr' ? 1 : -1);
        break;
      default:
        return;
    }
    event.preventDefault();
  }
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: "12.0.0",
    version: "21.0.3",
    ngImport: i0,
    type: FocusDispatcher,
    deps: [],
    target: i0.ɵɵFactoryTarget.Injectable
  });
  static ɵprov = i0.ɵɵngDeclareInjectable({
    minVersion: "12.0.0",
    version: "21.0.3",
    ngImport: i0,
    type: FocusDispatcher,
    providedIn: 'root'
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: "12.0.0",
  version: "21.0.3",
  ngImport: i0,
  type: FocusDispatcher,
  decorators: [{
    type: Injectable,
    args: [{
      providedIn: 'root'
    }]
  }]
});

class FormValueContainer {
  _formValues = new WeakMap();
  for(key) {
    const _formValues = this._formValues;
    let entry = _formValues.get(key);
    if (!entry) {
      entry = {};
      _formValues.set(key, entry);
    }
    return entry;
  }
}

class CdkEditControl {
  elementRef = inject(ElementRef);
  editRef = inject(EditRef);
  destroyed = new Subject();
  clickOutBehavior = 'close';
  preservedFormValue;
  preservedFormValueChange = new EventEmitter();
  ignoreSubmitUnlessValid = true;
  ngOnInit() {
    this.editRef.init(this.preservedFormValue);
    this.editRef.finalValue.subscribe(this.preservedFormValueChange);
    this.editRef.blurred.subscribe(() => this._handleBlur());
  }
  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }
  handleFormSubmit() {
    if (this.ignoreSubmitUnlessValid && !this.editRef.isValid()) {
      return;
    }
    this.editRef.updateRevertValue();
    this.editRef.close();
  }
  close() {
    this.editRef.close();
  }
  handlePossibleClickOut(evt) {
    if (closest(evt.target, EDIT_PANE_SELECTOR)) {
      return;
    }
    switch (this.clickOutBehavior) {
      case 'submit':
        this._triggerFormSubmit();
        this.editRef.close();
        break;
      case 'close':
        this.editRef.close();
        break;
    }
  }
  _handleKeydown(event) {
    if (event.key === 'Escape' && !hasModifierKey(event)) {
      this.close();
      event.preventDefault();
    }
  }
  _handleBlur() {
    if (this.clickOutBehavior === 'submit') {
      this._triggerFormSubmit();
    }
  }
  _triggerFormSubmit() {
    this.elementRef.nativeElement.dispatchEvent(new Event('submit'));
  }
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: "12.0.0",
    version: "21.0.3",
    ngImport: i0,
    type: CdkEditControl,
    deps: [],
    target: i0.ɵɵFactoryTarget.Directive
  });
  static ɵdir = i0.ɵɵngDeclareDirective({
    minVersion: "14.0.0",
    version: "21.0.3",
    type: CdkEditControl,
    isStandalone: true,
    selector: "form[cdkEditControl]",
    inputs: {
      clickOutBehavior: ["cdkEditControlClickOutBehavior", "clickOutBehavior"],
      preservedFormValue: ["cdkEditControlPreservedFormValue", "preservedFormValue"],
      ignoreSubmitUnlessValid: ["cdkEditControlIgnoreSubmitUnlessValid", "ignoreSubmitUnlessValid"]
    },
    outputs: {
      preservedFormValueChange: "cdkEditControlPreservedFormValueChange"
    },
    host: {
      listeners: {
        "ngSubmit": "handleFormSubmit()",
        "document:click": "handlePossibleClickOut($event)",
        "keydown": "_handleKeydown($event)"
      }
    },
    providers: [EditRef],
    ngImport: i0
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: "12.0.0",
  version: "21.0.3",
  ngImport: i0,
  type: CdkEditControl,
  decorators: [{
    type: Directive,
    args: [{
      selector: 'form[cdkEditControl]',
      inputs: [{
        name: 'clickOutBehavior',
        alias: 'cdkEditControlClickOutBehavior'
      }, {
        name: 'preservedFormValue',
        alias: 'cdkEditControlPreservedFormValue'
      }, {
        name: 'ignoreSubmitUnlessValid',
        alias: 'cdkEditControlIgnoreSubmitUnlessValid'
      }],
      outputs: ['preservedFormValueChange: cdkEditControlPreservedFormValueChange'],
      providers: [EditRef],
      host: {
        '(ngSubmit)': 'handleFormSubmit()',
        '(document:click)': 'handlePossibleClickOut($event)',
        '(keydown)': '_handleKeydown($event)'
      }
    }]
  }]
});
class CdkEditRevert {
  editRef = inject(EditRef);
  type = 'button';
  revertEdit() {
    this.editRef.reset();
  }
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: "12.0.0",
    version: "21.0.3",
    ngImport: i0,
    type: CdkEditRevert,
    deps: [],
    target: i0.ɵɵFactoryTarget.Directive
  });
  static ɵdir = i0.ɵɵngDeclareDirective({
    minVersion: "14.0.0",
    version: "21.0.3",
    type: CdkEditRevert,
    isStandalone: true,
    selector: "button[cdkEditRevert]",
    inputs: {
      type: "type"
    },
    host: {
      attributes: {
        "type": "button"
      },
      listeners: {
        "click": "revertEdit()"
      }
    },
    ngImport: i0
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: "12.0.0",
  version: "21.0.3",
  ngImport: i0,
  type: CdkEditRevert,
  decorators: [{
    type: Directive,
    args: [{
      selector: 'button[cdkEditRevert]',
      host: {
        'type': 'button',
        '(click)': 'revertEdit()'
      }
    }]
  }],
  propDecorators: {
    type: [{
      type: Input
    }]
  }
});
class CdkEditClose {
  elementRef = inject(ElementRef);
  editRef = inject(EditRef);
  constructor() {
    const nativeElement = this.elementRef.nativeElement;
    if (nativeElement.nodeName === 'BUTTON' && !nativeElement.getAttribute('type')) {
      nativeElement.setAttribute('type', 'button');
    }
  }
  closeEdit() {
    this.editRef.close();
  }
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: "12.0.0",
    version: "21.0.3",
    ngImport: i0,
    type: CdkEditClose,
    deps: [],
    target: i0.ɵɵFactoryTarget.Directive
  });
  static ɵdir = i0.ɵɵngDeclareDirective({
    minVersion: "14.0.0",
    version: "21.0.3",
    type: CdkEditClose,
    isStandalone: true,
    selector: "[cdkEditClose]",
    host: {
      listeners: {
        "click": "closeEdit()",
        "keydown.enter": "closeEdit()",
        "keydown.space": "closeEdit()"
      }
    },
    ngImport: i0
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: "12.0.0",
  version: "21.0.3",
  ngImport: i0,
  type: CdkEditClose,
  decorators: [{
    type: Directive,
    args: [{
      selector: '[cdkEditClose]',
      host: {
        '(click)': 'closeEdit()',
        '(keydown.enter)': 'closeEdit()',
        '(keydown.space)': 'closeEdit()'
      }
    }]
  }],
  ctorParameters: () => []
});

class EditServices {
  directionality = inject(Directionality);
  editEventDispatcher = inject(EditEventDispatcher);
  focusDispatcher = inject(FocusDispatcher);
  focusTrapFactory = inject(FocusTrapFactory);
  ngZone = inject(NgZone);
  scrollDispatcher = inject(ScrollDispatcher);
  viewportRuler = inject(ViewportRuler);
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: "12.0.0",
    version: "21.0.3",
    ngImport: i0,
    type: EditServices,
    deps: [],
    target: i0.ɵɵFactoryTarget.Injectable
  });
  static ɵprov = i0.ɵɵngDeclareInjectable({
    minVersion: "12.0.0",
    version: "21.0.3",
    ngImport: i0,
    type: EditServices
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: "12.0.0",
  version: "21.0.3",
  ngImport: i0,
  type: EditServices,
  decorators: [{
    type: Injectable
  }]
});

var FocusEscapeNotifierDirection;
(function (FocusEscapeNotifierDirection) {
  FocusEscapeNotifierDirection[FocusEscapeNotifierDirection["START"] = 0] = "START";
  FocusEscapeNotifierDirection[FocusEscapeNotifierDirection["END"] = 1] = "END";
})(FocusEscapeNotifierDirection || (FocusEscapeNotifierDirection = {}));
class FocusEscapeNotifier extends FocusTrap {
  _escapeSubject = new Subject();
  constructor(element, checker, ngZone, document) {
    super(element, checker, ngZone, document, true);
    this.startAnchorListener = () => {
      this._escapeSubject.next(FocusEscapeNotifierDirection.START);
      return true;
    };
    this.endAnchorListener = () => {
      this._escapeSubject.next(FocusEscapeNotifierDirection.END);
      return true;
    };
    this.attachAnchors();
  }
  escapes() {
    return this._escapeSubject;
  }
}
class FocusEscapeNotifierFactory {
  _checker = inject(InteractivityChecker);
  _ngZone = inject(NgZone);
  _document = inject(DOCUMENT);
  create(element) {
    return new FocusEscapeNotifier(element, this._checker, this._ngZone, this._document);
  }
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: "12.0.0",
    version: "21.0.3",
    ngImport: i0,
    type: FocusEscapeNotifierFactory,
    deps: [],
    target: i0.ɵɵFactoryTarget.Injectable
  });
  static ɵprov = i0.ɵɵngDeclareInjectable({
    minVersion: "12.0.0",
    version: "21.0.3",
    ngImport: i0,
    type: FocusEscapeNotifierFactory,
    providedIn: 'root'
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: "12.0.0",
  version: "21.0.3",
  ngImport: i0,
  type: FocusEscapeNotifierFactory,
  decorators: [{
    type: Injectable,
    args: [{
      providedIn: 'root'
    }]
  }]
});

const MOUSE_MOVE_THROTTLE_TIME_MS = 10;
function hasRowElement(nl) {
  for (let i = 0; i < nl.length; i++) {
    const el = nl[i];
    if (!(el instanceof HTMLElement)) {
      continue;
    }
    if (el.matches(ROW_SELECTOR)) {
      return true;
    }
  }
  return false;
}
function isRowMutation(mutation) {
  return hasRowElement(mutation.addedNodes) || hasRowElement(mutation.removedNodes);
}
class CdkEditable {
  elementRef = inject(ElementRef);
  editEventDispatcher = inject(EditEventDispatcher);
  focusDispatcher = inject(FocusDispatcher);
  ngZone = inject(NgZone);
  _renderer = inject(Renderer2);
  destroyed = new Subject();
  _rowsRendered = new Subject();
  _rowMutationObserver = globalThis.MutationObserver ? new globalThis.MutationObserver(mutations => {
    if (mutations.some(isRowMutation)) {
      this._rowsRendered.next();
    }
  }) : null;
  constructor() {
    afterNextRender(() => {
      this._rowsRendered.next();
      this._rowMutationObserver?.observe(this.elementRef.nativeElement, {
        childList: true,
        subtree: true
      });
    });
  }
  ngAfterViewInit() {
    this._listenForTableEvents();
  }
  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
    this._rowMutationObserver?.disconnect();
  }
  _observableFromEvent(element, name, options) {
    return new Observable(subscriber => {
      const handler = event => subscriber.next(event);
      const cleanup = this._renderer.listen(element, name, handler, options);
      return () => {
        cleanup();
        subscriber.complete();
      };
    });
  }
  _listenForTableEvents() {
    const element = this.elementRef.nativeElement;
    const toClosest = selector => map(event => closest(event.target, selector));
    this.ngZone.runOutsideAngular(() => {
      this._observableFromEvent(element, 'mouseover').pipe(toClosest(ROW_SELECTOR), takeUntil(this.destroyed)).subscribe(this.editEventDispatcher.hovering);
      this._observableFromEvent(element, 'mouseleave').pipe(mapTo(null), takeUntil(this.destroyed)).subscribe(this.editEventDispatcher.hovering);
      this._observableFromEvent(element, 'mousemove').pipe(throttleTime(MOUSE_MOVE_THROTTLE_TIME_MS), toClosest(ROW_SELECTOR), takeUntil(this.destroyed)).subscribe(this.editEventDispatcher.mouseMove);
      this._observableFromEvent(element, 'focus', {
        capture: true
      }).pipe(toClosest(ROW_SELECTOR), share(), takeUntil(this.destroyed)).subscribe(this.editEventDispatcher.focused);
      merge(this._observableFromEvent(element, 'blur', {
        capture: true
      }), this._observableFromEvent(element, 'keydown').pipe(filter(event => event.key === 'Escape'))).pipe(mapTo(null), share(), takeUntil(this.destroyed)).subscribe(this.editEventDispatcher.focused);
      this._rowsRendered.pipe(debounceTime(0), withLatestFrom(this.editEventDispatcher.editingOrFocused), filter(([_, activeRow]) => activeRow == null), map(() => element.querySelectorAll(ROW_SELECTOR)), share(), takeUntil(this.destroyed)).subscribe(this.editEventDispatcher.allRows);
      this._observableFromEvent(element, 'keydown').pipe(filter(event => event.key === 'Enter'), toClosest(CELL_SELECTOR), takeUntil(this.destroyed)).subscribe(this.editEventDispatcher.editing);
      this._observableFromEvent(element, 'keydown').pipe(takeUntil(this.destroyed)).subscribe(this.focusDispatcher.keyObserver);
    });
  }
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: "12.0.0",
    version: "21.0.3",
    ngImport: i0,
    type: CdkEditable,
    deps: [],
    target: i0.ɵɵFactoryTarget.Directive
  });
  static ɵdir = i0.ɵɵngDeclareDirective({
    minVersion: "14.0.0",
    version: "21.0.3",
    type: CdkEditable,
    isStandalone: true,
    selector: "table[editable], cdk-table[editable], mat-table[editable]",
    providers: [EditEventDispatcher, EditServices],
    ngImport: i0
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: "12.0.0",
  version: "21.0.3",
  ngImport: i0,
  type: CdkEditable,
  decorators: [{
    type: Directive,
    args: [{
      selector: 'table[editable], cdk-table[editable], mat-table[editable]',
      providers: [EditEventDispatcher, EditServices]
    }]
  }],
  ctorParameters: () => []
});
const POPOVER_EDIT_HOST_BINDINGS = {
  '[attr.tabindex]': 'disabled ? null : 0',
  'class': 'cdk-popover-edit-cell',
  '[attr.aria-haspopup]': '!disabled'
};
const POPOVER_EDIT_INPUTS = [{
  name: 'template',
  alias: 'cdkPopoverEdit'
}, {
  name: 'context',
  alias: 'cdkPopoverEditContext'
}, {
  name: 'colspan',
  alias: 'cdkPopoverEditColspan'
}, {
  name: 'disabled',
  alias: 'cdkPopoverEditDisabled'
}, {
  name: 'ariaLabel',
  alias: 'cdkPopoverEditAriaLabel'
}];
class CdkPopoverEdit {
  services = inject(EditServices);
  elementRef = inject(ElementRef);
  viewContainerRef = inject(ViewContainerRef);
  _injector = inject(Injector);
  template = null;
  context;
  ariaLabel;
  get colspan() {
    return this._colspan;
  }
  set colspan(value) {
    this._colspan = value;
    if (this.overlayRef) {
      this.overlayRef.updatePositionStrategy(this._getPositionStrategy());
      if (this.overlayRef.hasAttached()) {
        this._updateOverlaySize();
      }
    }
  }
  _colspan = {};
  get disabled() {
    return this._disabled;
  }
  set disabled(value) {
    this._disabled = value;
    if (value) {
      this.services.editEventDispatcher.doneEditingCell(this.elementRef.nativeElement);
      this.services.editEventDispatcher.disabledCells.set(this.elementRef.nativeElement, true);
    } else {
      this.services.editEventDispatcher.disabledCells.delete(this.elementRef.nativeElement);
    }
  }
  _disabled = false;
  focusTrap;
  overlayRef;
  destroyed = new Subject();
  ngAfterViewInit() {
    this._startListeningToEditEvents();
  }
  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
    if (this.focusTrap) {
      this.focusTrap.destroy();
      this.focusTrap = undefined;
    }
    if (this.overlayRef) {
      this.overlayRef.dispose();
    }
  }
  initFocusTrap() {
    this.focusTrap = this.services.focusTrapFactory.create(this.overlayRef.overlayElement);
  }
  closeEditOverlay() {
    this.services.editEventDispatcher.doneEditingCell(this.elementRef.nativeElement);
  }
  panelClass() {
    return EDIT_PANE_CLASS;
  }
  _startListeningToEditEvents() {
    this.services.editEventDispatcher.editingCell(this.elementRef.nativeElement).pipe(takeUntil(this.destroyed)).subscribe(open => {
      if (open && this.template) {
        if (!this.overlayRef) {
          this._createEditOverlay();
        }
        this._showEditOverlay();
      } else if (this.overlayRef) {
        this._maybeReturnFocusToCell();
        this.overlayRef.detach();
      }
    });
  }
  _createEditOverlay() {
    this.overlayRef = createOverlayRef(this._injector, {
      disposeOnNavigation: true,
      panelClass: this.panelClass(),
      positionStrategy: this._getPositionStrategy(),
      scrollStrategy: createRepositionScrollStrategy(this._injector),
      direction: this.services.directionality
    });
    this.initFocusTrap();
    this.overlayRef.overlayElement.setAttribute('role', 'dialog');
    if (this.ariaLabel) {
      this.overlayRef.overlayElement.setAttribute('aria-label', this.ariaLabel);
    }
    this.overlayRef.detachments().subscribe(() => this.closeEditOverlay());
  }
  _showEditOverlay() {
    this.overlayRef.attach(new TemplatePortal(this.template, this.viewContainerRef, {
      $implicit: this.context
    }));
    this.services.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        this.focusTrap.focusInitialElement();
      });
    });
    merge(this.services.scrollDispatcher.scrolled(), this.services.viewportRuler.change()).pipe(startWith(null), takeUntil(merge(this.overlayRef.detachments(), this.destroyed))).subscribe(() => {
      this._updateOverlaySize();
    });
  }
  _getOverlayCells() {
    const cell = closest(this.elementRef.nativeElement, CELL_SELECTOR);
    if (!this._colspan.before && !this._colspan.after) {
      return [cell];
    }
    const row = closest(this.elementRef.nativeElement, ROW_SELECTOR);
    const rowCells = Array.from(row.querySelectorAll(CELL_SELECTOR));
    const ownIndex = rowCells.indexOf(cell);
    return rowCells.slice(ownIndex - (this._colspan.before || 0), ownIndex + (this._colspan.after || 0) + 1);
  }
  _getPositionStrategy() {
    const cells = this._getOverlayCells();
    return createFlexibleConnectedPositionStrategy(this._injector, cells[0]).withGrowAfterOpen().withPush().withViewportMargin(16).withPositions([{
      originX: 'start',
      originY: 'top',
      overlayX: 'start',
      overlayY: 'top'
    }]);
  }
  _updateOverlaySize() {
    this.overlayRef.updateSize(this._sizeConfigForCells(this._getOverlayCells()));
  }
  _maybeReturnFocusToCell() {
    if (closest(document.activeElement, EDIT_PANE_SELECTOR) === this.overlayRef.overlayElement) {
      this.elementRef.nativeElement.focus();
    }
  }
  _sizeConfigForCells(cells) {
    if (cells.length === 0) {
      return {};
    }
    if (cells.length === 1) {
      return {
        width: cells[0].getBoundingClientRect().width
      };
    }
    let firstCell, lastCell;
    if (this.services.directionality.value === 'ltr') {
      firstCell = cells[0];
      lastCell = cells[cells.length - 1];
    } else {
      lastCell = cells[0];
      firstCell = cells[cells.length - 1];
    }
    return {
      width: lastCell.getBoundingClientRect().right - firstCell.getBoundingClientRect().left
    };
  }
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: "12.0.0",
    version: "21.0.3",
    ngImport: i0,
    type: CdkPopoverEdit,
    deps: [],
    target: i0.ɵɵFactoryTarget.Directive
  });
  static ɵdir = i0.ɵɵngDeclareDirective({
    minVersion: "14.0.0",
    version: "21.0.3",
    type: CdkPopoverEdit,
    isStandalone: true,
    selector: "[cdkPopoverEdit]:not([cdkPopoverEditTabOut])",
    inputs: {
      template: ["cdkPopoverEdit", "template"],
      context: ["cdkPopoverEditContext", "context"],
      colspan: ["cdkPopoverEditColspan", "colspan"],
      disabled: ["cdkPopoverEditDisabled", "disabled"],
      ariaLabel: ["cdkPopoverEditAriaLabel", "ariaLabel"]
    },
    host: {
      properties: {
        "attr.tabindex": "disabled ? null : 0",
        "attr.aria-haspopup": "!disabled"
      },
      classAttribute: "cdk-popover-edit-cell"
    },
    ngImport: i0
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: "12.0.0",
  version: "21.0.3",
  ngImport: i0,
  type: CdkPopoverEdit,
  decorators: [{
    type: Directive,
    args: [{
      selector: '[cdkPopoverEdit]:not([cdkPopoverEditTabOut])',
      host: POPOVER_EDIT_HOST_BINDINGS,
      inputs: POPOVER_EDIT_INPUTS
    }]
  }]
});
class CdkPopoverEditTabOut extends CdkPopoverEdit {
  focusEscapeNotifierFactory = inject(FocusEscapeNotifierFactory);
  focusTrap = undefined;
  initFocusTrap() {
    this.focusTrap = this.focusEscapeNotifierFactory.create(this.overlayRef.overlayElement);
    this.focusTrap.escapes().pipe(takeUntil(this.destroyed)).subscribe(direction => {
      this.services.editEventDispatcher.editRef?.blur();
      this.services.focusDispatcher.moveFocusHorizontally(closest(this.elementRef.nativeElement, CELL_SELECTOR), direction === FocusEscapeNotifierDirection.START ? -1 : 1);
      this.closeEditOverlay();
    });
  }
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: "12.0.0",
    version: "21.0.3",
    ngImport: i0,
    type: CdkPopoverEditTabOut,
    deps: null,
    target: i0.ɵɵFactoryTarget.Directive
  });
  static ɵdir = i0.ɵɵngDeclareDirective({
    minVersion: "14.0.0",
    version: "21.0.3",
    type: CdkPopoverEditTabOut,
    isStandalone: true,
    selector: "[cdkPopoverEdit][cdkPopoverEditTabOut]",
    inputs: {
      template: ["cdkPopoverEdit", "template"],
      context: ["cdkPopoverEditContext", "context"],
      colspan: ["cdkPopoverEditColspan", "colspan"],
      disabled: ["cdkPopoverEditDisabled", "disabled"],
      ariaLabel: ["cdkPopoverEditAriaLabel", "ariaLabel"]
    },
    host: {
      properties: {
        "attr.tabindex": "disabled ? null : 0",
        "attr.aria-haspopup": "!disabled"
      },
      classAttribute: "cdk-popover-edit-cell"
    },
    usesInheritance: true,
    ngImport: i0
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: "12.0.0",
  version: "21.0.3",
  ngImport: i0,
  type: CdkPopoverEditTabOut,
  decorators: [{
    type: Directive,
    args: [{
      selector: '[cdkPopoverEdit][cdkPopoverEditTabOut]',
      host: POPOVER_EDIT_HOST_BINDINGS,
      inputs: POPOVER_EDIT_INPUTS
    }]
  }]
});
class CdkRowHoverContent {
  services = inject(EditServices);
  elementRef = inject(ElementRef);
  templateRef = inject(TemplateRef);
  viewContainerRef = inject(ViewContainerRef);
  destroyed = new Subject();
  viewRef = null;
  _row;
  ngAfterViewInit() {
    this._row = closest(this.elementRef.nativeElement, ROW_SELECTOR);
    this.services.editEventDispatcher.registerRowWithHoverContent(this._row);
    this._listenForHoverAndFocusEvents();
  }
  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
    if (this.viewRef) {
      this.viewRef.destroy();
    }
    if (this._row) {
      this.services.editEventDispatcher.deregisterRowWithHoverContent(this._row);
    }
  }
  initElement(_) {}
  makeElementHiddenButFocusable(element) {
    element.style.opacity = '0';
  }
  makeElementVisible(element) {
    element.style.opacity = '';
  }
  _listenForHoverAndFocusEvents() {
    this.services.editEventDispatcher.hoverOrFocusOnRow(this._row).pipe(takeUntil(this.destroyed)).subscribe(eventState => {
      if (eventState === HoverContentState.ON || eventState === HoverContentState.FOCUSABLE) {
        if (!this.viewRef) {
          this.viewRef = this.viewContainerRef.createEmbeddedView(this.templateRef, {});
          this.initElement(this.viewRef.rootNodes[0]);
          this.viewRef.markForCheck();
        } else if (this.viewContainerRef.indexOf(this.viewRef) === -1) {
          this.viewContainerRef.insert(this.viewRef);
          this.viewRef.markForCheck();
        }
        if (eventState === HoverContentState.ON) {
          this.makeElementVisible(this.viewRef.rootNodes[0]);
        } else {
          this.makeElementHiddenButFocusable(this.viewRef.rootNodes[0]);
        }
      } else if (this.viewRef) {
        this.viewContainerRef.detach(this.viewContainerRef.indexOf(this.viewRef));
      }
    });
  }
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: "12.0.0",
    version: "21.0.3",
    ngImport: i0,
    type: CdkRowHoverContent,
    deps: [],
    target: i0.ɵɵFactoryTarget.Directive
  });
  static ɵdir = i0.ɵɵngDeclareDirective({
    minVersion: "14.0.0",
    version: "21.0.3",
    type: CdkRowHoverContent,
    isStandalone: true,
    selector: "[cdkRowHoverContent]",
    ngImport: i0
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: "12.0.0",
  version: "21.0.3",
  ngImport: i0,
  type: CdkRowHoverContent,
  decorators: [{
    type: Directive,
    args: [{
      selector: '[cdkRowHoverContent]'
    }]
  }]
});
class CdkEditOpen {
  elementRef = inject(ElementRef);
  editEventDispatcher = inject(EditEventDispatcher);
  constructor() {
    const elementRef = this.elementRef;
    const nativeElement = elementRef.nativeElement;
    if (nativeElement.nodeName === 'BUTTON' && !nativeElement.getAttribute('type')) {
      nativeElement.setAttribute('type', 'button');
    }
  }
  openEdit(evt) {
    this.editEventDispatcher.editing.next(closest(this.elementRef.nativeElement, CELL_SELECTOR));
    evt.stopPropagation();
  }
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: "12.0.0",
    version: "21.0.3",
    ngImport: i0,
    type: CdkEditOpen,
    deps: [],
    target: i0.ɵɵFactoryTarget.Directive
  });
  static ɵdir = i0.ɵɵngDeclareDirective({
    minVersion: "14.0.0",
    version: "21.0.3",
    type: CdkEditOpen,
    isStandalone: true,
    selector: "[cdkEditOpen]",
    host: {
      listeners: {
        "click": "openEdit($event)"
      }
    },
    ngImport: i0
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: "12.0.0",
  version: "21.0.3",
  ngImport: i0,
  type: CdkEditOpen,
  decorators: [{
    type: Directive,
    args: [{
      selector: '[cdkEditOpen]',
      host: {
        '(click)': 'openEdit($event)'
      }
    }]
  }],
  ctorParameters: () => []
});

const EXPORTED_DECLARATIONS = [CdkPopoverEdit, CdkPopoverEditTabOut, CdkRowHoverContent, CdkEditControl, CdkEditRevert, CdkEditClose, CdkEditable, CdkEditOpen];
class CdkPopoverEditModule {
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: "12.0.0",
    version: "21.0.3",
    ngImport: i0,
    type: CdkPopoverEditModule,
    deps: [],
    target: i0.ɵɵFactoryTarget.NgModule
  });
  static ɵmod = i0.ɵɵngDeclareNgModule({
    minVersion: "14.0.0",
    version: "21.0.3",
    ngImport: i0,
    type: CdkPopoverEditModule,
    imports: [OverlayModule, CdkPopoverEdit, CdkPopoverEditTabOut, CdkRowHoverContent, CdkEditControl, CdkEditRevert, CdkEditClose, CdkEditable, CdkEditOpen],
    exports: [CdkPopoverEdit, CdkPopoverEditTabOut, CdkRowHoverContent, CdkEditControl, CdkEditRevert, CdkEditClose, CdkEditable, CdkEditOpen]
  });
  static ɵinj = i0.ɵɵngDeclareInjector({
    minVersion: "12.0.0",
    version: "21.0.3",
    ngImport: i0,
    type: CdkPopoverEditModule,
    imports: [OverlayModule]
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: "12.0.0",
  version: "21.0.3",
  ngImport: i0,
  type: CdkPopoverEditModule,
  decorators: [{
    type: NgModule,
    args: [{
      imports: [OverlayModule, ...EXPORTED_DECLARATIONS],
      exports: EXPORTED_DECLARATIONS
    }]
  }]
});

export { CdkEditClose, CdkEditControl, CdkEditOpen, CdkEditRevert, CdkEditable, CdkPopoverEdit, CdkPopoverEditModule, CdkPopoverEditTabOut, CdkRowHoverContent, EditEventDispatcher, EditRef, FocusDispatcher, FormValueContainer, HoverContentState, CELL_SELECTOR as _CELL_SELECTOR, closest as _closest };
//# sourceMappingURL=popover-edit.mjs.map
