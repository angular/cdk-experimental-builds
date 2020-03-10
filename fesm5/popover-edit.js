import { __read, __values, __extends } from 'tslib';
import { Injectable, NgZone, Self, ɵɵdefineInjectable, ɵɵinject, EventEmitter, Directive, ElementRef, HostListener, Input, Inject, ViewContainerRef, TemplateRef, NgModule } from '@angular/core';
import { Subject, pipe, combineLatest, Observable, fromEvent, fromEventPattern, merge } from 'rxjs';
import { distinctUntilChanged, startWith, share, filter, map, auditTime, audit, debounceTime, skip, take, takeUntil, mapTo, throttleTime, withLatestFrom } from 'rxjs/operators';
import { ControlContainer } from '@angular/forms';
import { Directionality } from '@angular/cdk/bidi';
import { RIGHT_ARROW, LEFT_ARROW, DOWN_ARROW, UP_ARROW, hasModifierKey } from '@angular/cdk/keycodes';
import { Overlay, OverlayModule } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { FocusTrapFactory, FocusTrap, InteractivityChecker } from '@angular/cdk/a11y';
import { ScrollDispatcher, ViewportRuler } from '@angular/cdk/scrolling';
import { DOCUMENT } from '@angular/common';

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** Selector for finding table cells. */
var CELL_SELECTOR = '.cdk-cell, .mat-cell, td';
/** Selector for finding editable table cells. */
var EDITABLE_CELL_SELECTOR = '.cdk-popover-edit-cell, .mat-popover-edit-cell';
/** Selector for finding table rows. */
var ROW_SELECTOR = '.cdk-row, .mat-row, tr';
/** Selector for finding the table element. */
var TABLE_SELECTOR = 'table, cdk-table, mat-table';
/** CSS class added to the edit lens pane. */
var EDIT_PANE_CLASS = 'cdk-edit-pane';
/** Selector for finding the edit lens pane. */
var EDIT_PANE_SELECTOR = "." + EDIT_PANE_CLASS + ", .mat-edit-pane";

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** IE 11 compatible matches implementation. */
function matches(element, selector) {
    return element.matches ?
        element.matches(selector) :
        element['msMatchesSelector'](selector);
}
/** IE 11 compatible closest implementation that is able to start from non-Element Nodes. */
function closest(element, selector) {
    if (!(element instanceof Node)) {
        return null;
    }
    var curr = element;
    while (curr != null && !(curr instanceof Element)) {
        curr = curr.parentNode;
    }
    return curr && (hasNativeClosest ?
        curr.closest(selector) : polyfillClosest(curr, selector));
}
/** Polyfill for browsers without Element.closest. */
function polyfillClosest(element, selector) {
    var curr = element;
    while (curr != null && !(curr instanceof Element && matches(curr, selector))) {
        curr = curr.parentNode;
    }
    return (curr || null);
}
var hasNativeClosest = !!Element.prototype.closest;

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** The delay applied to mouse events before hiding or showing hover content. */
var MOUSE_EVENT_DELAY_MS = 40;
/** The delay for reacting to focus/blur changes. */
var FOCUS_DELAY = 0;
/**
 * Service for sharing delegated events and state for triggering table edits.
 */
var EditEventDispatcher = /** @class */ (function () {
    function EditEventDispatcher(_ngZone) {
        var _this = this;
        this._ngZone = _ngZone;
        /** A subject that indicates which table cell is currently editing (unless it is disabled). */
        this.editing = new Subject();
        /** A subject that indicates which table row is currently hovered. */
        this.hovering = new Subject();
        /** A subject that indicates which table row currently contains focus. */
        this.focused = new Subject();
        /** A subject that indicates all elements in the table matching ROW_SELECTOR. */
        this.allRows = new Subject();
        /** A subject that emits mouse move events from the table indicating the targeted row. */
        this.mouseMove = new Subject();
        // TODO: Use WeakSet once IE11 support is dropped.
        /**
         * Tracks the currently disabled editable cells - edit calls will be ignored
         * for these cells.
         */
        this.disabledCells = new WeakMap();
        this._editRef = null;
        // Optimization: Precompute common pipeable operators used per row/cell.
        this._distinctUntilChanged = distinctUntilChanged();
        this._startWithNull = startWith(null);
        this._distinctShare = pipe(this._distinctUntilChanged, share());
        this._startWithNullDistinct = pipe(this._startWithNull, this._distinctUntilChanged);
        this.editingAndEnabled = this.editing.pipe(filter(function (cell) { return cell == null || !_this.disabledCells.has(cell); }), share());
        /** An observable that emits the row containing focus or an active edit. */
        this.editingOrFocused = combineLatest([
            this.editingAndEnabled.pipe(map(function (cell) { return closest(cell, ROW_SELECTOR); }), this._startWithNull),
            this.focused.pipe(this._startWithNull),
        ]).pipe(map(function (_a) {
            var _b = __read(_a, 2), editingRow = _b[0], focusedRow = _b[1];
            return focusedRow || editingRow;
        }), this._distinctUntilChanged, auditTime(FOCUS_DELAY), // Use audit to skip over blur events to the next focused element.
        this._distinctUntilChanged, share());
        /** Tracks rows that contain hover content with a reference count. */
        this._rowsWithHoverContent = new WeakMap();
        /** The table cell that has an active edit lens (or null). */
        this._currentlyEditing = null;
        /** The combined set of row hover content states organized by row. */
        this._hoveredContentStateDistinct = combineLatest([
            this._getFirstRowWithHoverContent(),
            this._getLastRowWithHoverContent(),
            this.editingOrFocused,
            this.hovering.pipe(distinctUntilChanged(), audit(function (row) { return _this.mouseMove.pipe(filter(function (mouseMoveRow) { return row === mouseMoveRow; }), _this._startWithNull, debounceTime(MOUSE_EVENT_DELAY_MS)); }), this._startWithNullDistinct),
        ]).pipe(skip(1), // Skip the initial emission of [null, null, null, null].
        map(computeHoverContentState), distinctUntilChanged(areMapEntriesEqual), 
        // Optimization: Enter the zone before share() so that we trigger a single
        // ApplicationRef.tick for all row updates.
        this._enterZone(), share());
        this._editingAndEnabledDistinct = this.editingAndEnabled.pipe(distinctUntilChanged(), this._enterZone(), share());
        // Optimization: Share row events observable with subsequent callers.
        // At startup, calls will be sequential by row.
        this._lastSeenRow = null;
        this._lastSeenRowHoverOrFocus = null;
        this._editingAndEnabledDistinct.subscribe(function (cell) {
            _this._currentlyEditing = cell;
        });
    }
    Object.defineProperty(EditEventDispatcher.prototype, "editRef", {
        /** The EditRef for the currently active edit lens (if any). */
        get: function () {
            return this._editRef;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Gets an Observable that emits true when the specified element's cell
     * is editing and false when not.
     */
    EditEventDispatcher.prototype.editingCell = function (element) {
        var cell = null;
        return this._editingAndEnabledDistinct.pipe(map(function (editCell) { return editCell === (cell || (cell = closest(element, CELL_SELECTOR))); }), this._distinctUntilChanged);
    };
    /**
     * Stops editing for the specified cell. If the specified cell is not the current
     * edit cell, does nothing.
     */
    EditEventDispatcher.prototype.doneEditingCell = function (element) {
        var cell = closest(element, CELL_SELECTOR);
        if (this._currentlyEditing === cell) {
            this.editing.next(null);
        }
    };
    /** Sets the currently active EditRef. */
    EditEventDispatcher.prototype.setActiveEditRef = function (ref) {
        this._editRef = ref;
    };
    /** Unsets the currently active EditRef, if the specified editRef is active. */
    EditEventDispatcher.prototype.unsetActiveEditRef = function (ref) {
        if (this._editRef !== ref) {
            return;
        }
        this._editRef = null;
    };
    /** Adds the specified table row to be tracked for first/last row comparisons. */
    EditEventDispatcher.prototype.registerRowWithHoverContent = function (row) {
        this._rowsWithHoverContent.set(row, (this._rowsWithHoverContent.get(row) || 0) + 1);
    };
    /**
     * Reference decrements and ultimately removes the specified table row from first/last row
     * comparisons.
     */
    EditEventDispatcher.prototype.deregisterRowWithHoverContent = function (row) {
        var refCount = this._rowsWithHoverContent.get(row) || 0;
        if (refCount <= 1) {
            this._rowsWithHoverContent.delete(row);
        }
        else {
            this._rowsWithHoverContent.set(row, refCount - 1);
        }
    };
    /**
     * Gets an Observable that emits true when the specified element's row
     * contains the focused element or is being hovered over and false when not.
     * Hovering is defined as when the mouse has momentarily stopped moving over the cell.
     */
    EditEventDispatcher.prototype.hoverOrFocusOnRow = function (row) {
        if (row !== this._lastSeenRow) {
            this._lastSeenRow = row;
            this._lastSeenRowHoverOrFocus = this._hoveredContentStateDistinct.pipe(map(function (state) { return state.get(row) || 0 /* OFF */; }), this._distinctShare);
        }
        return this._lastSeenRowHoverOrFocus;
    };
    /**
     * RxJS operator that enters the Angular zone, used to reduce boilerplate in
     * re-entering the zone for stream pipelines.
     */
    EditEventDispatcher.prototype._enterZone = function () {
        var _this = this;
        return function (source) {
            return new Observable(function (observer) { return source.subscribe({
                next: function (value) { return _this._ngZone.run(function () { return observer.next(value); }); },
                error: function (err) { return observer.error(err); },
                complete: function () { return observer.complete(); }
            }); });
        };
    };
    EditEventDispatcher.prototype._getFirstRowWithHoverContent = function () {
        var _this = this;
        return this._mapAllRowsToSingleRow(function (rows) {
            for (var i = 0, row = void 0; row = rows[i]; i++) {
                if (_this._rowsWithHoverContent.has(row)) {
                    return row;
                }
            }
            return null;
        });
    };
    EditEventDispatcher.prototype._getLastRowWithHoverContent = function () {
        var _this = this;
        return this._mapAllRowsToSingleRow(function (rows) {
            for (var i = rows.length - 1, row = void 0; row = rows[i]; i--) {
                if (_this._rowsWithHoverContent.has(row)) {
                    return row;
                }
            }
            return null;
        });
    };
    EditEventDispatcher.prototype._mapAllRowsToSingleRow = function (mapper) {
        return this.allRows.pipe(map(mapper), this._startWithNullDistinct);
    };
    EditEventDispatcher.decorators = [
        { type: Injectable }
    ];
    /** @nocollapse */
    EditEventDispatcher.ctorParameters = function () { return [
        { type: NgZone }
    ]; };
    return EditEventDispatcher;
}());
function computeHoverContentState(_a) {
    var e_1, _b, e_2, _c;
    var _d = __read(_a, 4), firstRow = _d[0], lastRow = _d[1], activeRow = _d[2], hoverRow = _d[3];
    var hoverContentState = new Map();
    try {
        // Add focusable rows.
        for (var _e = __values([
            firstRow,
            lastRow,
            activeRow && activeRow.previousElementSibling,
            activeRow && activeRow.nextElementSibling,
        ]), _f = _e.next(); !_f.done; _f = _e.next()) {
            var focussableRow = _f.value;
            if (focussableRow) {
                hoverContentState.set(focussableRow, 1 /* FOCUSABLE */);
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
        }
        finally { if (e_1) throw e_1.error; }
    }
    try {
        // Add/overwrite with fully visible rows.
        for (var _g = __values([activeRow, hoverRow]), _h = _g.next(); !_h.done; _h = _g.next()) {
            var onRow = _h.value;
            if (onRow) {
                hoverContentState.set(onRow, 2 /* ON */);
            }
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (_h && !_h.done && (_c = _g.return)) _c.call(_g);
        }
        finally { if (e_2) throw e_2.error; }
    }
    return hoverContentState;
}
function areMapEntriesEqual(a, b) {
    var e_3, _a;
    if (a.size !== b.size) {
        return false;
    }
    try {
        // TODO: use Map.prototype.entries once we're off IE11.
        for (var _b = __values(Array.from(a.keys())), _c = _b.next(); !_c.done; _c = _b.next()) {
            var aKey = _c.value;
            if (b.get(aKey) !== a.get(aKey)) {
                return false;
            }
        }
    }
    catch (e_3_1) { e_3 = { error: e_3_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_3) throw e_3.error; }
    }
    return true;
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Used for communication between the form within the edit lens and the
 * table that launched it. Provided by CdkEditControl within the lens.
 */
var EditRef = /** @class */ (function () {
    function EditRef(_form, _editEventDispatcher, _ngZone) {
        this._form = _form;
        this._editEventDispatcher = _editEventDispatcher;
        this._ngZone = _ngZone;
        /** Emits the final value of this edit instance before closing. */
        this._finalValueSubject = new Subject();
        this.finalValue = this._finalValueSubject.asObservable();
        /** Emits when the user tabs out of this edit lens before closing. */
        this._blurredSubject = new Subject();
        this.blurred = this._blurredSubject.asObservable();
        this._editEventDispatcher.setActiveEditRef(this);
    }
    /**
     * Called by the host directive's OnInit hook. Reads the initial state of the
     * form and overrides it with persisted state from previous openings, if
     * applicable.
     */
    EditRef.prototype.init = function (previousFormValue) {
        var _this = this;
        // Wait for the zone to stabilize before caching the initial value.
        // This ensures that all form controls have been initialized.
        this._ngZone.onStable.pipe(take(1)).subscribe(function () {
            _this.updateRevertValue();
            if (previousFormValue) {
                _this.reset(previousFormValue);
            }
        });
    };
    EditRef.prototype.ngOnDestroy = function () {
        this._editEventDispatcher.unsetActiveEditRef(this);
        this._finalValueSubject.next(this._form.value);
        this._finalValueSubject.complete();
    };
    /** Whether the attached form is in a valid state. */
    EditRef.prototype.isValid = function () {
        return this._form.valid;
    };
    /** Set the form's current value as what it will be set to on revert/reset. */
    EditRef.prototype.updateRevertValue = function () {
        this._revertFormValue = this._form.value;
    };
    /** Tells the table to close the edit popup. */
    EditRef.prototype.close = function () {
        this._editEventDispatcher.editing.next(null);
    };
    /** Notifies the active edit that the user has moved focus out of the lens. */
    EditRef.prototype.blur = function () {
        this._blurredSubject.next();
    };
    /**
     * Resets the form value to the specified value or the previously set
     * revert value.
     */
    EditRef.prototype.reset = function (value) {
        this._form.reset(value || this._revertFormValue);
    };
    EditRef.decorators = [
        { type: Injectable }
    ];
    /** @nocollapse */
    EditRef.ctorParameters = function () { return [
        { type: ControlContainer, decorators: [{ type: Self }] },
        { type: EditEventDispatcher },
        { type: NgZone }
    ]; };
    return EditRef;
}());

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Service responsible for moving cell focus around in response to keyboard events.
 * May be overridden to customize the keyboard behavior of popover edit.
 */
var FocusDispatcher = /** @class */ (function () {
    function FocusDispatcher(directionality) {
        var _this = this;
        this.directionality = directionality;
        this.keyObserver = { next: function (event) { return _this.handleKeyboardEvent(event); } };
    }
    /**
     * Moves focus to earlier or later cells (in dom order) by offset cells relative to
     * currentCell.
     */
    FocusDispatcher.prototype.moveFocusHorizontally = function (currentCell, offset) {
        var cells = Array.from(closest(currentCell, TABLE_SELECTOR).querySelectorAll(EDITABLE_CELL_SELECTOR));
        var currentIndex = cells.indexOf(currentCell);
        var newIndex = currentIndex + offset;
        if (cells[newIndex]) {
            cells[newIndex].focus();
        }
    };
    /** Moves focus to up or down by row by offset cells relative to currentCell. */
    FocusDispatcher.prototype.moveFocusVertically = function (currentCell, offset) {
        var currentRow = closest(currentCell, ROW_SELECTOR);
        var rows = Array.from(closest(currentRow, TABLE_SELECTOR).querySelectorAll(ROW_SELECTOR));
        var currentRowIndex = rows.indexOf(currentRow);
        var currentIndexWithinRow = Array.from(currentRow.querySelectorAll(EDITABLE_CELL_SELECTOR)).indexOf(currentCell);
        var newRowIndex = currentRowIndex + offset;
        if (rows[newRowIndex]) {
            var rowToFocus = Array.from(rows[newRowIndex].querySelectorAll(EDITABLE_CELL_SELECTOR));
            if (rowToFocus[currentIndexWithinRow]) {
                rowToFocus[currentIndexWithinRow].focus();
            }
        }
    };
    /** Translates arrow keydown events into focus move operations. */
    FocusDispatcher.prototype.handleKeyboardEvent = function (event) {
        var cell = closest(event.target, EDITABLE_CELL_SELECTOR);
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
                // If the keyboard event is not handled, return now so that we don't `preventDefault`.
                return;
        }
        event.preventDefault();
    };
    FocusDispatcher.decorators = [
        { type: Injectable, args: [{ providedIn: 'root' },] }
    ];
    /** @nocollapse */
    FocusDispatcher.ctorParameters = function () { return [
        { type: Directionality }
    ]; };
    FocusDispatcher.ɵprov = ɵɵdefineInjectable({ factory: function FocusDispatcher_Factory() { return new FocusDispatcher(ɵɵinject(Directionality)); }, token: FocusDispatcher, providedIn: "root" });
    return FocusDispatcher;
}());

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * A convenience class for preserving unsaved form state while an edit lens is closed.
 *
 * Example usage:
 * class MyComponent {
 *   readonly nameEditValues = new FormValueContainer&lt;Item, {name: string}&gt;();
 * }
 *
 * &lt;form cdkEditControl [(cdkEditControlPreservedFormValue)]="nameEditValues.for(item).value"&gt;
 */
var FormValueContainer = /** @class */ (function () {
    function FormValueContainer() {
        this._formValues = new WeakMap();
    }
    FormValueContainer.prototype.for = function (key) {
        var _formValues = this._formValues;
        var entry = _formValues.get(key);
        if (!entry) {
            // Expose entry as an object so that we can [(two-way)] bind to its value member
            entry = {};
            _formValues.set(key, entry);
        }
        return entry;
    };
    return FormValueContainer;
}());

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * A directive that attaches to a form within the edit lens.
 * It coordinates the form state with the table-wide edit system and handles
 * closing the edit lens when the form is submitted or the user clicks
 * out.
 */
var CdkEditControl = /** @class */ (function () {
    function CdkEditControl(elementRef, editRef) {
        this.elementRef = elementRef;
        this.editRef = editRef;
        this.destroyed = new Subject();
        /**
         * Specifies what should happen when the user clicks outside of the edit lens.
         * The default behavior is to close the lens without submitting the form.
         */
        this.clickOutBehavior = 'close';
        this.preservedFormValueChange = new EventEmitter();
        /**
         * Determines whether the lens will close on form submit if the form is not in a valid
         * state. By default the lens will remain open.
         */
        this.ignoreSubmitUnlessValid = true;
    }
    CdkEditControl.prototype.ngOnInit = function () {
        var _this = this;
        this.editRef.init(this.preservedFormValue);
        this.editRef.finalValue.subscribe(this.preservedFormValueChange);
        this.editRef.blurred.subscribe(function () { return _this._handleBlur(); });
    };
    CdkEditControl.prototype.ngOnDestroy = function () {
        this.destroyed.next();
        this.destroyed.complete();
    };
    /**
     * Called when the form submits. If ignoreSubmitUnlessValid is true, checks
     * the form for validity before proceeding.
     * Updates the revert state with the latest submitted value then closes the edit.
     */
    // In Ivy the `host` metadata will be merged, whereas in ViewEngine it is overridden. In order
    // to avoid double event listeners, we need to use `HostListener`. Once Ivy is the default, we
    // can move this back into `host`.
    // tslint:disable:no-host-decorator-in-concrete
    CdkEditControl.prototype.handleFormSubmit = function () {
        if (this.ignoreSubmitUnlessValid && !this.editRef.isValid()) {
            return;
        }
        this.editRef.updateRevertValue();
        this.editRef.close();
    };
    /** Called on Escape keyup. Closes the edit. */
    CdkEditControl.prototype.close = function () {
        // todo - allow this behavior to be customized as well, such as calling
        // reset before close
        this.editRef.close();
    };
    /**
     * Called on click anywhere in the document.
     * If the click was outside of the lens, trigger the specified click out behavior.
     */
    // In Ivy the `host` metadata will be merged, whereas in ViewEngine it is overridden. In order
    // to avoid double event listeners, we need to use `HostListener`. Once Ivy is the default, we
    // can move this back into `host`.
    // tslint:disable:no-host-decorator-in-concrete
    CdkEditControl.prototype.handlePossibleClickOut = function (evt) {
        if (closest(evt.target, EDIT_PANE_SELECTOR)) {
            return;
        }
        switch (this.clickOutBehavior) {
            case 'submit':
                // Manually cause the form to submit before closing.
                this._triggerFormSubmit();
                this.editRef.close();
                break;
            case 'close':
                this.editRef.close();
                break;
            default:
                break;
        }
    };
    // In Ivy the `host` metadata will be merged, whereas in ViewEngine it is overridden. In order
    // to avoid double event listeners, we need to use `HostListener`. Once Ivy is the default, we
    // can move this back into `host`.
    // tslint:disable:no-host-decorator-in-concrete
    CdkEditControl.prototype._handleKeydown = function (event) {
        if (event.key === 'Escape' && !hasModifierKey(event)) {
            this.close();
            event.preventDefault();
        }
    };
    /** Triggers submit on tab out if clickOutBehavior is 'submit'. */
    CdkEditControl.prototype._handleBlur = function () {
        if (this.clickOutBehavior === 'submit') {
            // Manually cause the form to submit before closing.
            this._triggerFormSubmit();
        }
    };
    CdkEditControl.prototype._triggerFormSubmit = function () {
        this.elementRef.nativeElement.dispatchEvent(new Event('submit'));
    };
    CdkEditControl.decorators = [
        { type: Directive, args: [{
                    selector: 'form[cdkEditControl]',
                    inputs: [
                        'clickOutBehavior: cdkEditControlClickOutBehavior',
                        'preservedFormValue: cdkEditControlPreservedFormValue',
                        'ignoreSubmitUnlessValid: cdkEditControlIgnoreSubmitUnlessValid',
                    ],
                    outputs: ['preservedFormValueChange: cdkEditControlPreservedFormValueChange'],
                    providers: [EditRef],
                },] }
    ];
    /** @nocollapse */
    CdkEditControl.ctorParameters = function () { return [
        { type: ElementRef },
        { type: EditRef }
    ]; };
    CdkEditControl.propDecorators = {
        handleFormSubmit: [{ type: HostListener, args: ['ngSubmit',] }],
        handlePossibleClickOut: [{ type: HostListener, args: ['document:click', ['$event'],] }],
        _handleKeydown: [{ type: HostListener, args: ['keydown', ['$event'],] }]
    };
    return CdkEditControl;
}());
/** Reverts the form to its initial or previously submitted state on click. */
var CdkEditRevert = /** @class */ (function () {
    function CdkEditRevert(editRef) {
        this.editRef = editRef;
        /** Type of the button. Defaults to `button` to avoid accident form submits. */
        this.type = 'button';
    }
    // In Ivy the `host` metadata will be merged, whereas in ViewEngine it is overridden. In order
    // to avoid double event listeners, we need to use `HostListener`. Once Ivy is the default, we
    // can move this back into `host`.
    // tslint:disable:no-host-decorator-in-concrete
    CdkEditRevert.prototype.revertEdit = function () {
        this.editRef.reset();
    };
    CdkEditRevert.decorators = [
        { type: Directive, args: [{
                    selector: 'button[cdkEditRevert]',
                    host: {
                        'type': 'button',
                    }
                },] }
    ];
    /** @nocollapse */
    CdkEditRevert.ctorParameters = function () { return [
        { type: EditRef }
    ]; };
    CdkEditRevert.propDecorators = {
        type: [{ type: Input }],
        revertEdit: [{ type: HostListener, args: ['click',] }]
    };
    return CdkEditRevert;
}());
/** Closes the lens on click. */
var CdkEditClose = /** @class */ (function () {
    function CdkEditClose(elementRef, editRef) {
        this.elementRef = elementRef;
        this.editRef = editRef;
        var nativeElement = elementRef.nativeElement;
        // Prevent accidental form submits.
        if (nativeElement.nodeName === 'BUTTON' && !nativeElement.getAttribute('type')) {
            nativeElement.setAttribute('type', 'button');
        }
    }
    // In Ivy the `host` metadata will be merged, whereas in ViewEngine it is overridden. In order
    // to avoid double event listeners, we need to use `HostListener`. Once Ivy is the default, we
    // can move this back into `host`.
    // tslint:disable:no-host-decorator-in-concrete
    CdkEditClose.prototype.closeEdit = function () {
        // Note that we use `click` here, rather than a keyboard event, because some screen readers
        // will emit a fake click event instead of an enter keyboard event on buttons.
        this.editRef.close();
    };
    CdkEditClose.decorators = [
        { type: Directive, args: [{ selector: '[cdkEditClose]' },] }
    ];
    /** @nocollapse */
    CdkEditClose.ctorParameters = function () { return [
        { type: ElementRef },
        { type: EditRef }
    ]; };
    CdkEditClose.propDecorators = {
        closeEdit: [{ type: HostListener, args: ['click',] }, { type: HostListener, args: ['keyup.enter',] }, { type: HostListener, args: ['keyup.space',] }]
    };
    return CdkEditClose;
}());

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Overridable factory responsible for configuring how cdkPopoverEdit popovers are positioned
 * and sized.
 */
var PopoverEditPositionStrategyFactory = /** @class */ (function () {
    function PopoverEditPositionStrategyFactory() {
    }
    PopoverEditPositionStrategyFactory.decorators = [
        { type: Injectable }
    ];
    return PopoverEditPositionStrategyFactory;
}());
/**
 * Default implementation of PopoverEditPositionStrategyFactory.
 * Uses a FlexibleConnectedPositionStrategy anchored to the start + top of the cell.
 * Note: This will change to CoverPositionStrategy once it implemented.
 */
var DefaultPopoverEditPositionStrategyFactory = /** @class */ (function (_super) {
    __extends(DefaultPopoverEditPositionStrategyFactory, _super);
    function DefaultPopoverEditPositionStrategyFactory(direction, overlay) {
        var _this = _super.call(this) || this;
        _this.direction = direction;
        _this.overlay = overlay;
        return _this;
    }
    DefaultPopoverEditPositionStrategyFactory.prototype.positionStrategyForCells = function (cells) {
        return this.overlay.position()
            .flexibleConnectedTo(cells[0])
            .withGrowAfterOpen()
            .withPush()
            .withViewportMargin(16)
            .withPositions([{
                originX: 'start',
                originY: 'top',
                overlayX: 'start',
                overlayY: 'top',
            }]);
    };
    DefaultPopoverEditPositionStrategyFactory.prototype.sizeConfigForCells = function (cells) {
        if (cells.length === 0) {
            return {};
        }
        if (cells.length === 1) {
            return { width: cells[0].getBoundingClientRect().width };
        }
        var firstCell, lastCell;
        if (this.direction.value === 'ltr') {
            firstCell = cells[0];
            lastCell = cells[cells.length - 1];
        }
        else {
            lastCell = cells[0];
            firstCell = cells[cells.length - 1];
        }
        return { width: lastCell.getBoundingClientRect().right - firstCell.getBoundingClientRect().left };
    };
    DefaultPopoverEditPositionStrategyFactory.decorators = [
        { type: Injectable }
    ];
    /** @nocollapse */
    DefaultPopoverEditPositionStrategyFactory.ctorParameters = function () { return [
        { type: Directionality },
        { type: Overlay }
    ]; };
    return DefaultPopoverEditPositionStrategyFactory;
}(PopoverEditPositionStrategyFactory));

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Optimization
 * Collects multiple Injectables into a singleton shared across the table. By reducing the
 * number of services injected into each CdkPopoverEdit, this saves about 0.023ms of cpu time
 * and 56 bytes of memory per instance.
 */
var EditServices = /** @class */ (function () {
    function EditServices(directionality, editEventDispatcher, focusDispatcher, focusTrapFactory, ngZone, overlay, positionFactory, scrollDispatcher, viewportRuler) {
        this.directionality = directionality;
        this.editEventDispatcher = editEventDispatcher;
        this.focusDispatcher = focusDispatcher;
        this.focusTrapFactory = focusTrapFactory;
        this.ngZone = ngZone;
        this.overlay = overlay;
        this.positionFactory = positionFactory;
        this.scrollDispatcher = scrollDispatcher;
        this.viewportRuler = viewportRuler;
    }
    EditServices.decorators = [
        { type: Injectable }
    ];
    /** @nocollapse */
    EditServices.ctorParameters = function () { return [
        { type: Directionality },
        { type: EditEventDispatcher },
        { type: FocusDispatcher },
        { type: FocusTrapFactory },
        { type: NgZone },
        { type: Overlay },
        { type: PopoverEditPositionStrategyFactory },
        { type: ScrollDispatcher },
        { type: ViewportRuler }
    ]; };
    return EditServices;
}());

/**
 * Like FocusTrap, but rather than trapping focus within a dom region, notifies subscribers when
 * focus leaves the region.
 */
var FocusEscapeNotifier = /** @class */ (function (_super) {
    __extends(FocusEscapeNotifier, _super);
    function FocusEscapeNotifier(element, checker, ngZone, document) {
        var _this = _super.call(this, element, checker, ngZone, document, true /* deferAnchors */) || this;
        _this._escapeSubject = new Subject();
        // The focus trap adds "anchors" at the beginning and end of a trapped region that redirect
        // focus. We override that redirect behavior here with simply emitting on a stream.
        _this.startAnchorListener = function () {
            _this._escapeSubject.next(0 /* START */);
            return true;
        };
        _this.endAnchorListener = function () {
            _this._escapeSubject.next(1 /* END */);
            return true;
        };
        _this.attachAnchors();
        return _this;
    }
    FocusEscapeNotifier.prototype.escapes = function () {
        return this._escapeSubject.asObservable();
    };
    return FocusEscapeNotifier;
}(FocusTrap));
/** Factory that allows easy instantiation of focus escape notifiers. */
var FocusEscapeNotifierFactory = /** @class */ (function () {
    function FocusEscapeNotifierFactory(_checker, _ngZone, _document) {
        this._checker = _checker;
        this._ngZone = _ngZone;
        this._document = _document;
    }
    /**
     * Creates a focus escape notifier region around the given element.
     * @param element The element around which focus will be monitored.
     * @returns The created focus escape notifier instance.
     */
    FocusEscapeNotifierFactory.prototype.create = function (element) {
        return new FocusEscapeNotifier(element, this._checker, this._ngZone, this._document);
    };
    FocusEscapeNotifierFactory.decorators = [
        { type: Injectable, args: [{ providedIn: 'root' },] }
    ];
    /** @nocollapse */
    FocusEscapeNotifierFactory.ctorParameters = function () { return [
        { type: InteractivityChecker },
        { type: NgZone },
        { type: undefined, decorators: [{ type: Inject, args: [DOCUMENT,] }] }
    ]; };
    FocusEscapeNotifierFactory.ɵprov = ɵɵdefineInjectable({ factory: function FocusEscapeNotifierFactory_Factory() { return new FocusEscapeNotifierFactory(ɵɵinject(InteractivityChecker), ɵɵinject(NgZone), ɵɵinject(DOCUMENT)); }, token: FocusEscapeNotifierFactory, providedIn: "root" });
    return FocusEscapeNotifierFactory;
}());

/** Used for rate-limiting mousemove events. */
var MOUSE_MOVE_THROTTLE_TIME_MS = 10;
/**
 * A directive that must be attached to enable editability on a table.
 * It is responsible for setting up delegated event handlers and providing the
 * EditEventDispatcher service for use by the other edit directives.
 */
var CdkEditable = /** @class */ (function () {
    function CdkEditable(elementRef, editEventDispatcher, focusDispatcher, ngZone) {
        this.elementRef = elementRef;
        this.editEventDispatcher = editEventDispatcher;
        this.focusDispatcher = focusDispatcher;
        this.ngZone = ngZone;
        this.destroyed = new Subject();
    }
    CdkEditable.prototype.ngAfterViewInit = function () {
        this._listenForTableEvents();
    };
    CdkEditable.prototype.ngOnDestroy = function () {
        this.destroyed.next();
        this.destroyed.complete();
    };
    CdkEditable.prototype._listenForTableEvents = function () {
        var _this = this;
        var element = this.elementRef.nativeElement;
        var toClosest = function (selector) {
            return map(function (event) { return closest(event.target, selector); });
        };
        this.ngZone.runOutsideAngular(function () {
            // Track mouse movement over the table to hide/show hover content.
            fromEvent(element, 'mouseover').pipe(toClosest(ROW_SELECTOR), takeUntil(_this.destroyed)).subscribe(_this.editEventDispatcher.hovering);
            fromEvent(element, 'mouseleave').pipe(mapTo(null), takeUntil(_this.destroyed)).subscribe(_this.editEventDispatcher.hovering);
            fromEvent(element, 'mousemove').pipe(throttleTime(MOUSE_MOVE_THROTTLE_TIME_MS), toClosest(ROW_SELECTOR), takeUntil(_this.destroyed)).subscribe(_this.editEventDispatcher.mouseMove);
            // Track focus within the table to hide/show/make focusable hover content.
            fromEventPattern(function (handler) { return element.addEventListener('focus', handler, true); }, function (handler) { return element.removeEventListener('focus', handler, true); }).pipe(takeUntil(_this.destroyed), toClosest(ROW_SELECTOR), share()).subscribe(_this.editEventDispatcher.focused);
            fromEventPattern(function (handler) { return element.addEventListener('blur', handler, true); }, function (handler) { return element.removeEventListener('blur', handler, true); }).pipe(takeUntil(_this.destroyed), mapTo(null), share()).subscribe(_this.editEventDispatcher.focused);
            // Keep track of rows within the table. This is used to know which rows with hover content
            // are first or last in the table. They are kept focusable in case focus enters from above
            // or below the table.
            _this.ngZone.onStable.pipe(takeUntil(_this.destroyed), 
            // Optimization: ignore dom changes while focus is within the table as we already
            // ensure that rows above and below the focused/active row are tabbable.
            withLatestFrom(_this.editEventDispatcher.editingOrFocused), filter(function (_a) {
                var _b = __read(_a, 2), _ = _b[0], activeRow = _b[1];
                return activeRow == null;
            }), map(function () { return element.querySelectorAll(ROW_SELECTOR); }), share()).subscribe(_this.editEventDispatcher.allRows);
            fromEvent(element, 'keydown').pipe(filter(function (event) { return event.key === 'Enter'; }), toClosest(CELL_SELECTOR), takeUntil(_this.destroyed)).subscribe(_this.editEventDispatcher.editing);
            // Keydown must be used here or else key autorepeat does not work properly on some platforms.
            fromEvent(element, 'keydown')
                .pipe(takeUntil(_this.destroyed))
                .subscribe(_this.focusDispatcher.keyObserver);
        });
    };
    CdkEditable.decorators = [
        { type: Directive, args: [{
                    selector: 'table[editable], cdk-table[editable], mat-table[editable]',
                    providers: [EditEventDispatcher, EditServices],
                },] }
    ];
    /** @nocollapse */
    CdkEditable.ctorParameters = function () { return [
        { type: ElementRef },
        { type: EditEventDispatcher },
        { type: FocusDispatcher },
        { type: NgZone }
    ]; };
    return CdkEditable;
}());
var POPOVER_EDIT_HOST_BINDINGS = {
    '[attr.tabindex]': 'disabled ? null : 0',
    'class': 'cdk-popover-edit-cell',
    '[attr.aria-haspopup]': '!disabled',
};
var POPOVER_EDIT_INPUTS = [
    'template: cdkPopoverEdit',
    'context: cdkPopoverEditContext',
    'colspan: cdkPopoverEditColspan',
    'disabled: cdkPopoverEditDisabled',
];
/**
 * Attaches an ng-template to a cell and shows it when instructed to by the
 * EditEventDispatcher service.
 * Makes the cell focusable.
 */
var CdkPopoverEdit = /** @class */ (function () {
    function CdkPopoverEdit(services, elementRef, viewContainerRef) {
        this.services = services;
        this.elementRef = elementRef;
        this.viewContainerRef = viewContainerRef;
        /** The edit lens template shown over the cell on edit. */
        this.template = null;
        this._colspan = {};
        this._disabled = false;
        this.destroyed = new Subject();
    }
    Object.defineProperty(CdkPopoverEdit.prototype, "colspan", {
        /**
         * Specifies that the popup should cover additional table cells before and/or after
         * this one.
         */
        get: function () {
            return this._colspan;
        },
        set: function (value) {
            this._colspan = value;
            // Recompute positioning when the colspan changes.
            if (this.overlayRef) {
                this.overlayRef.updatePositionStrategy(this._getPositionStrategy());
                if (this.overlayRef.hasAttached()) {
                    this._updateOverlaySize();
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CdkPopoverEdit.prototype, "disabled", {
        /** Whether popover edit is disabled for this cell. */
        get: function () {
            return this._disabled;
        },
        set: function (value) {
            this._disabled = value;
            if (value) {
                this.services.editEventDispatcher.doneEditingCell(this.elementRef.nativeElement);
                this.services.editEventDispatcher.disabledCells.set(this.elementRef.nativeElement, true);
            }
            else {
                this.services.editEventDispatcher.disabledCells.delete(this.elementRef.nativeElement);
            }
        },
        enumerable: true,
        configurable: true
    });
    CdkPopoverEdit.prototype.ngAfterViewInit = function () {
        this._startListeningToEditEvents();
    };
    CdkPopoverEdit.prototype.ngOnDestroy = function () {
        this.destroyed.next();
        this.destroyed.complete();
        if (this.focusTrap) {
            this.focusTrap.destroy();
            this.focusTrap = undefined;
        }
        if (this.overlayRef) {
            this.overlayRef.dispose();
        }
    };
    CdkPopoverEdit.prototype.initFocusTrap = function () {
        this.focusTrap = this.services.focusTrapFactory.create(this.overlayRef.overlayElement);
    };
    CdkPopoverEdit.prototype.closeEditOverlay = function () {
        this.services.editEventDispatcher.doneEditingCell(this.elementRef.nativeElement);
    };
    CdkPopoverEdit.prototype.panelClass = function () {
        return EDIT_PANE_CLASS;
    };
    CdkPopoverEdit.prototype._startListeningToEditEvents = function () {
        var _this = this;
        this.services.editEventDispatcher.editingCell(this.elementRef.nativeElement)
            .pipe(takeUntil(this.destroyed))
            .subscribe(function (open) {
            if (open && _this.template) {
                if (!_this.overlayRef) {
                    _this._createEditOverlay();
                }
                _this._showEditOverlay();
            }
            else if (_this.overlayRef) {
                _this._maybeReturnFocusToCell();
                _this.overlayRef.detach();
            }
        });
    };
    CdkPopoverEdit.prototype._createEditOverlay = function () {
        var _this = this;
        this.overlayRef = this.services.overlay.create({
            disposeOnNavigation: true,
            panelClass: this.panelClass(),
            positionStrategy: this._getPositionStrategy(),
            scrollStrategy: this.services.overlay.scrollStrategies.reposition(),
            direction: this.services.directionality,
        });
        this.initFocusTrap();
        this.overlayRef.overlayElement.setAttribute('aria-role', 'dialog');
        this.overlayRef.detachments().subscribe(function () { return _this.closeEditOverlay(); });
    };
    CdkPopoverEdit.prototype._showEditOverlay = function () {
        var _this = this;
        this.overlayRef.attach(new TemplatePortal(this.template, this.viewContainerRef, { $implicit: this.context }));
        // We have to defer trapping focus, because doing so too early can cause the form inside
        // the overlay to be submitted immediately if it was opened on an Enter keydown event.
        this.services.ngZone.runOutsideAngular(function () {
            setTimeout(function () {
                _this.focusTrap.focusInitialElement();
            });
        });
        // Update the size of the popup initially and on subsequent changes to
        // scroll position and viewport size.
        merge(this.services.scrollDispatcher.scrolled(), this.services.viewportRuler.change())
            .pipe(startWith(null), takeUntil(this.overlayRef.detachments()), takeUntil(this.destroyed))
            .subscribe(function () {
            _this._updateOverlaySize();
        });
    };
    CdkPopoverEdit.prototype._getOverlayCells = function () {
        var cell = closest(this.elementRef.nativeElement, CELL_SELECTOR);
        if (!this._colspan.before && !this._colspan.after) {
            return [cell];
        }
        var row = closest(this.elementRef.nativeElement, ROW_SELECTOR);
        var rowCells = Array.from(row.querySelectorAll(CELL_SELECTOR));
        var ownIndex = rowCells.indexOf(cell);
        return rowCells.slice(ownIndex - (this._colspan.before || 0), ownIndex + (this._colspan.after || 0) + 1);
    };
    CdkPopoverEdit.prototype._getPositionStrategy = function () {
        return this.services.positionFactory.positionStrategyForCells(this._getOverlayCells());
    };
    CdkPopoverEdit.prototype._updateOverlaySize = function () {
        this.overlayRef.updateSize(this.services.positionFactory.sizeConfigForCells(this._getOverlayCells()));
    };
    CdkPopoverEdit.prototype._maybeReturnFocusToCell = function () {
        if (closest(document.activeElement, EDIT_PANE_SELECTOR) ===
            this.overlayRef.overlayElement) {
            this.elementRef.nativeElement.focus();
        }
    };
    CdkPopoverEdit.decorators = [
        { type: Directive, args: [{
                    selector: '[cdkPopoverEdit]:not([cdkPopoverEditTabOut])',
                    host: POPOVER_EDIT_HOST_BINDINGS,
                    inputs: POPOVER_EDIT_INPUTS,
                },] }
    ];
    /** @nocollapse */
    CdkPopoverEdit.ctorParameters = function () { return [
        { type: EditServices },
        { type: ElementRef },
        { type: ViewContainerRef }
    ]; };
    return CdkPopoverEdit;
}());
/**
 * Attaches an ng-template to a cell and shows it when instructed to by the
 * EditEventDispatcher service.
 * Makes the cell focusable.
 */
var CdkPopoverEditTabOut = /** @class */ (function (_super) {
    __extends(CdkPopoverEditTabOut, _super);
    function CdkPopoverEditTabOut(elementRef, viewContainerRef, services, focusEscapeNotifierFactory) {
        var _this = _super.call(this, services, elementRef, viewContainerRef) || this;
        _this.focusEscapeNotifierFactory = focusEscapeNotifierFactory;
        return _this;
    }
    CdkPopoverEditTabOut.prototype.initFocusTrap = function () {
        var _this = this;
        this.focusTrap = this.focusEscapeNotifierFactory.create(this.overlayRef.overlayElement);
        this.focusTrap.escapes().pipe(takeUntil(this.destroyed)).subscribe(function (direction) {
            if (_this.services.editEventDispatcher.editRef) {
                _this.services.editEventDispatcher.editRef.blur();
            }
            _this.services.focusDispatcher.moveFocusHorizontally(closest(_this.elementRef.nativeElement, CELL_SELECTOR), direction === 0 /* START */ ? -1 : 1);
            _this.closeEditOverlay();
        });
    };
    CdkPopoverEditTabOut.decorators = [
        { type: Directive, args: [{
                    selector: '[cdkPopoverEdit][cdkPopoverEditTabOut]',
                    host: POPOVER_EDIT_HOST_BINDINGS,
                    inputs: POPOVER_EDIT_INPUTS,
                },] }
    ];
    /** @nocollapse */
    CdkPopoverEditTabOut.ctorParameters = function () { return [
        { type: ElementRef },
        { type: ViewContainerRef },
        { type: EditServices },
        { type: FocusEscapeNotifierFactory }
    ]; };
    return CdkPopoverEditTabOut;
}(CdkPopoverEdit));
/**
 * A structural directive that shows its contents when the table row containing
 * it is hovered or when an element in the row has focus.
 */
var CdkRowHoverContent = /** @class */ (function () {
    function CdkRowHoverContent(services, elementRef, templateRef, viewContainerRef) {
        this.services = services;
        this.elementRef = elementRef;
        this.templateRef = templateRef;
        this.viewContainerRef = viewContainerRef;
        this.destroyed = new Subject();
        this.viewRef = null;
    }
    CdkRowHoverContent.prototype.ngAfterViewInit = function () {
        this._row = closest(this.elementRef.nativeElement, ROW_SELECTOR);
        this.services.editEventDispatcher.registerRowWithHoverContent(this._row);
        this._listenForHoverAndFocusEvents();
    };
    CdkRowHoverContent.prototype.ngOnDestroy = function () {
        this.destroyed.next();
        this.destroyed.complete();
        if (this.viewRef) {
            this.viewRef.destroy();
        }
        if (this._row) {
            this.services.editEventDispatcher.deregisterRowWithHoverContent(this._row);
        }
    };
    /**
     * Called immediately after the hover content is created and added to the dom.
     * In the CDK version, this is a noop but subclasses such as MatRowHoverContent use this
     * to prepare/style the inserted element.
     */
    CdkRowHoverContent.prototype.initElement = function (_) {
    };
    /**
     * Called when the hover content needs to be focusable to preserve a reasonable tab ordering
     * but should not yet be shown.
     */
    CdkRowHoverContent.prototype.makeElementHiddenButFocusable = function (element) {
        element.style.opacity = '0';
    };
    /**
     * Called when the hover content needs to be focusable to preserve a reasonable tab ordering
     * but should not yet be shown.
     */
    CdkRowHoverContent.prototype.makeElementVisible = function (element) {
        element.style.opacity = '';
    };
    CdkRowHoverContent.prototype._listenForHoverAndFocusEvents = function () {
        var _this = this;
        this.services.editEventDispatcher.hoverOrFocusOnRow(this._row)
            .pipe(takeUntil(this.destroyed))
            .subscribe(function (eventState) {
            // When in FOCUSABLE state, add the hover content to the dom but make it transparent so
            // that it is in the tab order relative to the currently focused row.
            if (eventState === 2 /* ON */ || eventState === 1 /* FOCUSABLE */) {
                if (!_this.viewRef) {
                    _this.viewRef = _this.viewContainerRef.createEmbeddedView(_this.templateRef, {});
                    _this.initElement(_this.viewRef.rootNodes[0]);
                    _this.viewRef.markForCheck();
                }
                else if (_this.viewContainerRef.indexOf(_this.viewRef) === -1) {
                    _this.viewContainerRef.insert(_this.viewRef);
                    _this.viewRef.markForCheck();
                }
                if (eventState === 2 /* ON */) {
                    _this.makeElementVisible(_this.viewRef.rootNodes[0]);
                }
                else {
                    _this.makeElementHiddenButFocusable(_this.viewRef.rootNodes[0]);
                }
            }
            else if (_this.viewRef) {
                _this.viewContainerRef.detach(_this.viewContainerRef.indexOf(_this.viewRef));
            }
        });
    };
    CdkRowHoverContent.decorators = [
        { type: Directive, args: [{
                    selector: '[cdkRowHoverContent]',
                },] }
    ];
    /** @nocollapse */
    CdkRowHoverContent.ctorParameters = function () { return [
        { type: EditServices },
        { type: ElementRef },
        { type: TemplateRef },
        { type: ViewContainerRef }
    ]; };
    return CdkRowHoverContent;
}());
/**
 * Opens the closest edit popover to this element, whether it's associated with this exact
 * element or an ancestor element.
 */
var CdkEditOpen = /** @class */ (function () {
    function CdkEditOpen(elementRef, editEventDispatcher) {
        this.elementRef = elementRef;
        this.editEventDispatcher = editEventDispatcher;
        var nativeElement = elementRef.nativeElement;
        // Prevent accidental form submits.
        if (nativeElement.nodeName === 'BUTTON' && !nativeElement.getAttribute('type')) {
            nativeElement.setAttribute('type', 'button');
        }
    }
    // In Ivy the `host` metadata will be merged, whereas in ViewEngine it is overridden. In order
    // to avoid double event listeners, we need to use `HostListener`. Once Ivy is the default, we
    // can move this back into `host`.
    // tslint:disable:no-host-decorator-in-concrete
    CdkEditOpen.prototype.openEdit = function (evt) {
        this.editEventDispatcher.editing.next(closest(this.elementRef.nativeElement, CELL_SELECTOR));
        evt.stopPropagation();
    };
    CdkEditOpen.decorators = [
        { type: Directive, args: [{
                    selector: '[cdkEditOpen]',
                },] }
    ];
    /** @nocollapse */
    CdkEditOpen.ctorParameters = function () { return [
        { type: ElementRef },
        { type: EditEventDispatcher }
    ]; };
    CdkEditOpen.propDecorators = {
        openEdit: [{ type: HostListener, args: ['click', ['$event'],] }]
    };
    return CdkEditOpen;
}());

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var EXPORTED_DECLARATIONS = [
    CdkPopoverEdit,
    CdkPopoverEditTabOut,
    CdkRowHoverContent,
    CdkEditControl,
    CdkEditRevert,
    CdkEditClose,
    CdkEditable,
    CdkEditOpen,
];
var CdkPopoverEditModule = /** @class */ (function () {
    function CdkPopoverEditModule() {
    }
    CdkPopoverEditModule.decorators = [
        { type: NgModule, args: [{
                    imports: [
                        OverlayModule,
                    ],
                    exports: EXPORTED_DECLARATIONS,
                    declarations: EXPORTED_DECLARATIONS,
                    providers: [{
                            provide: PopoverEditPositionStrategyFactory,
                            useClass: DefaultPopoverEditPositionStrategyFactory
                        }],
                },] }
    ];
    return CdkPopoverEditModule;
}());

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Generated bundle index. Do not edit.
 */

export { CdkEditClose, CdkEditControl, CdkEditOpen, CdkEditRevert, CdkEditable, CdkPopoverEdit, CdkPopoverEditModule, CdkPopoverEditTabOut, CdkRowHoverContent, DefaultPopoverEditPositionStrategyFactory, EditEventDispatcher, EditRef, FocusDispatcher, FormValueContainer, PopoverEditPositionStrategyFactory, CELL_SELECTOR as _CELL_SELECTOR, closest as _closest, matches as _matches, EditServices as ɵangular_material_src_cdk_experimental_popover_edit_popover_edit_a, FocusEscapeNotifierFactory as ɵangular_material_src_cdk_experimental_popover_edit_popover_edit_b };
//# sourceMappingURL=popover-edit.js.map
