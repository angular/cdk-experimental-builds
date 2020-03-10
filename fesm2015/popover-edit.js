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
 * @fileoverview added by tsickle
 * Generated from: src/cdk-experimental/popover-edit/constants.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Selector for finding table cells.
 * @type {?}
 */
const CELL_SELECTOR = '.cdk-cell, .mat-cell, td';
/**
 * Selector for finding editable table cells.
 * @type {?}
 */
const EDITABLE_CELL_SELECTOR = '.cdk-popover-edit-cell, .mat-popover-edit-cell';
/**
 * Selector for finding table rows.
 * @type {?}
 */
const ROW_SELECTOR = '.cdk-row, .mat-row, tr';
/**
 * Selector for finding the table element.
 * @type {?}
 */
const TABLE_SELECTOR = 'table, cdk-table, mat-table';
/**
 * CSS class added to the edit lens pane.
 * @type {?}
 */
const EDIT_PANE_CLASS = 'cdk-edit-pane';
/**
 * Selector for finding the edit lens pane.
 * @type {?}
 */
const EDIT_PANE_SELECTOR = `.${EDIT_PANE_CLASS}, .mat-edit-pane`;

/**
 * @fileoverview added by tsickle
 * Generated from: src/cdk-experimental/popover-edit/polyfill.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * IE 11 compatible matches implementation.
 * @param {?} element
 * @param {?} selector
 * @return {?}
 */
function matches(element, selector) {
    return element.matches ?
        element.matches(selector) :
        ((/** @type {?} */ (element)))['msMatchesSelector'](selector);
}
/**
 * IE 11 compatible closest implementation that is able to start from non-Element Nodes.
 * @param {?} element
 * @param {?} selector
 * @return {?}
 */
function closest(element, selector) {
    if (!(element instanceof Node)) {
        return null;
    }
    /** @type {?} */
    let curr = element;
    while (curr != null && !(curr instanceof Element)) {
        curr = curr.parentNode;
    }
    return curr && (/** @type {?} */ ((hasNativeClosest ?
        curr.closest(selector) : polyfillClosest(curr, selector))));
}
/**
 * Polyfill for browsers without Element.closest.
 * @param {?} element
 * @param {?} selector
 * @return {?}
 */
function polyfillClosest(element, selector) {
    /** @type {?} */
    let curr = element;
    while (curr != null && !(curr instanceof Element && matches(curr, selector))) {
        curr = curr.parentNode;
    }
    return (/** @type {?} */ ((curr || null)));
}
/** @type {?} */
const hasNativeClosest = !!Element.prototype.closest;

/**
 * @fileoverview added by tsickle
 * Generated from: src/cdk-experimental/popover-edit/edit-event-dispatcher.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * The delay applied to mouse events before hiding or showing hover content.
 * @type {?}
 */
const MOUSE_EVENT_DELAY_MS = 40;
/**
 * The delay for reacting to focus/blur changes.
 * @type {?}
 */
const FOCUS_DELAY = 0;
/** @enum {number} */
const HoverContentState = {
    OFF: 0,
    FOCUSABLE: 1,
    ON: 2,
};
/**
 * Service for sharing delegated events and state for triggering table edits.
 */
class EditEventDispatcher {
    /**
     * @param {?} _ngZone
     */
    constructor(_ngZone) {
        this._ngZone = _ngZone;
        /**
         * A subject that indicates which table cell is currently editing (unless it is disabled).
         */
        this.editing = new Subject();
        /**
         * A subject that indicates which table row is currently hovered.
         */
        this.hovering = new Subject();
        /**
         * A subject that indicates which table row currently contains focus.
         */
        this.focused = new Subject();
        /**
         * A subject that indicates all elements in the table matching ROW_SELECTOR.
         */
        this.allRows = new Subject();
        /**
         * A subject that emits mouse move events from the table indicating the targeted row.
         */
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
        this._distinctShare = pipe((/** @type {?} */ (this._distinctUntilChanged)), share());
        this._startWithNullDistinct = pipe(this._startWithNull, (/** @type {?} */ (this._distinctUntilChanged)));
        this.editingAndEnabled = this.editing.pipe(filter((/**
         * @param {?} cell
         * @return {?}
         */
        cell => cell == null || !this.disabledCells.has(cell))), share());
        /**
         * An observable that emits the row containing focus or an active edit.
         */
        this.editingOrFocused = combineLatest([
            this.editingAndEnabled.pipe(map((/**
             * @param {?} cell
             * @return {?}
             */
            cell => closest(cell, ROW_SELECTOR))), this._startWithNull),
            this.focused.pipe(this._startWithNull),
        ]).pipe(map((/**
         * @param {?} __0
         * @return {?}
         */
        ([editingRow, focusedRow]) => focusedRow || editingRow)), (/** @type {?} */ (this._distinctUntilChanged)), auditTime(FOCUS_DELAY), (/** @type {?} */ (this._distinctUntilChanged)), share());
        /**
         * Tracks rows that contain hover content with a reference count.
         */
        this._rowsWithHoverContent = new WeakMap();
        /**
         * The table cell that has an active edit lens (or null).
         */
        this._currentlyEditing = null;
        /**
         * The combined set of row hover content states organized by row.
         */
        this._hoveredContentStateDistinct = combineLatest([
            this._getFirstRowWithHoverContent(),
            this._getLastRowWithHoverContent(),
            this.editingOrFocused,
            this.hovering.pipe(distinctUntilChanged(), audit((/**
             * @param {?} row
             * @return {?}
             */
            row => this.mouseMove.pipe(filter((/**
             * @param {?} mouseMoveRow
             * @return {?}
             */
            mouseMoveRow => row === mouseMoveRow)), this._startWithNull, debounceTime(MOUSE_EVENT_DELAY_MS)))), this._startWithNullDistinct),
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
        this._editingAndEnabledDistinct.subscribe((/**
         * @param {?} cell
         * @return {?}
         */
        cell => {
            this._currentlyEditing = cell;
        }));
    }
    /**
     * The EditRef for the currently active edit lens (if any).
     * @return {?}
     */
    get editRef() {
        return this._editRef;
    }
    /**
     * Gets an Observable that emits true when the specified element's cell
     * is editing and false when not.
     * @param {?} element
     * @return {?}
     */
    editingCell(element) {
        /** @type {?} */
        let cell = null;
        return this._editingAndEnabledDistinct.pipe(map((/**
         * @param {?} editCell
         * @return {?}
         */
        editCell => editCell === (cell || (cell = closest(element, CELL_SELECTOR))))), (/** @type {?} */ (this._distinctUntilChanged)));
    }
    /**
     * Stops editing for the specified cell. If the specified cell is not the current
     * edit cell, does nothing.
     * @param {?} element
     * @return {?}
     */
    doneEditingCell(element) {
        /** @type {?} */
        const cell = closest(element, CELL_SELECTOR);
        if (this._currentlyEditing === cell) {
            this.editing.next(null);
        }
    }
    /**
     * Sets the currently active EditRef.
     * @param {?} ref
     * @return {?}
     */
    setActiveEditRef(ref) {
        this._editRef = ref;
    }
    /**
     * Unsets the currently active EditRef, if the specified editRef is active.
     * @param {?} ref
     * @return {?}
     */
    unsetActiveEditRef(ref) {
        if (this._editRef !== ref) {
            return;
        }
        this._editRef = null;
    }
    /**
     * Adds the specified table row to be tracked for first/last row comparisons.
     * @param {?} row
     * @return {?}
     */
    registerRowWithHoverContent(row) {
        this._rowsWithHoverContent.set(row, (this._rowsWithHoverContent.get(row) || 0) + 1);
    }
    /**
     * Reference decrements and ultimately removes the specified table row from first/last row
     * comparisons.
     * @param {?} row
     * @return {?}
     */
    deregisterRowWithHoverContent(row) {
        /** @type {?} */
        const refCount = this._rowsWithHoverContent.get(row) || 0;
        if (refCount <= 1) {
            this._rowsWithHoverContent.delete(row);
        }
        else {
            this._rowsWithHoverContent.set(row, refCount - 1);
        }
    }
    /**
     * Gets an Observable that emits true when the specified element's row
     * contains the focused element or is being hovered over and false when not.
     * Hovering is defined as when the mouse has momentarily stopped moving over the cell.
     * @param {?} row
     * @return {?}
     */
    hoverOrFocusOnRow(row) {
        if (row !== this._lastSeenRow) {
            this._lastSeenRow = row;
            this._lastSeenRowHoverOrFocus = this._hoveredContentStateDistinct.pipe(map((/**
             * @param {?} state
             * @return {?}
             */
            state => state.get(row) || 0 /* OFF */)), this._distinctShare);
        }
        return (/** @type {?} */ (this._lastSeenRowHoverOrFocus));
    }
    /**
     * RxJS operator that enters the Angular zone, used to reduce boilerplate in
     * re-entering the zone for stream pipelines.
     * @private
     * @template T
     * @return {?}
     */
    _enterZone() {
        return (/**
         * @param {?} source
         * @return {?}
         */
        (source) => new Observable((/**
         * @param {?} observer
         * @return {?}
         */
        (observer) => source.subscribe({
            next: (/**
             * @param {?} value
             * @return {?}
             */
            (value) => this._ngZone.run((/**
             * @return {?}
             */
            () => observer.next(value)))),
            error: (/**
             * @param {?} err
             * @return {?}
             */
            (err) => observer.error(err)),
            complete: (/**
             * @return {?}
             */
            () => observer.complete())
        }))));
    }
    /**
     * @private
     * @return {?}
     */
    _getFirstRowWithHoverContent() {
        return this._mapAllRowsToSingleRow((/**
         * @param {?} rows
         * @return {?}
         */
        rows => {
            for (let i = 0, row; row = rows[i]; i++) {
                if (this._rowsWithHoverContent.has((/** @type {?} */ (row)))) {
                    return (/** @type {?} */ (row));
                }
            }
            return null;
        }));
    }
    /**
     * @private
     * @return {?}
     */
    _getLastRowWithHoverContent() {
        return this._mapAllRowsToSingleRow((/**
         * @param {?} rows
         * @return {?}
         */
        rows => {
            for (let i = rows.length - 1, row; row = rows[i]; i--) {
                if (this._rowsWithHoverContent.has((/** @type {?} */ (row)))) {
                    return (/** @type {?} */ (row));
                }
            }
            return null;
        }));
    }
    /**
     * @private
     * @param {?} mapper
     * @return {?}
     */
    _mapAllRowsToSingleRow(mapper) {
        return this.allRows.pipe(map(mapper), this._startWithNullDistinct);
    }
}
EditEventDispatcher.decorators = [
    { type: Injectable }
];
/** @nocollapse */
EditEventDispatcher.ctorParameters = () => [
    { type: NgZone }
];
if (false) {
    /**
     * A subject that indicates which table cell is currently editing (unless it is disabled).
     * @type {?}
     */
    EditEventDispatcher.prototype.editing;
    /**
     * A subject that indicates which table row is currently hovered.
     * @type {?}
     */
    EditEventDispatcher.prototype.hovering;
    /**
     * A subject that indicates which table row currently contains focus.
     * @type {?}
     */
    EditEventDispatcher.prototype.focused;
    /**
     * A subject that indicates all elements in the table matching ROW_SELECTOR.
     * @type {?}
     */
    EditEventDispatcher.prototype.allRows;
    /**
     * A subject that emits mouse move events from the table indicating the targeted row.
     * @type {?}
     */
    EditEventDispatcher.prototype.mouseMove;
    /**
     * Tracks the currently disabled editable cells - edit calls will be ignored
     * for these cells.
     * @type {?}
     */
    EditEventDispatcher.prototype.disabledCells;
    /**
     * @type {?}
     * @private
     */
    EditEventDispatcher.prototype._editRef;
    /**
     * @type {?}
     * @private
     */
    EditEventDispatcher.prototype._distinctUntilChanged;
    /**
     * @type {?}
     * @private
     */
    EditEventDispatcher.prototype._startWithNull;
    /**
     * @type {?}
     * @private
     */
    EditEventDispatcher.prototype._distinctShare;
    /**
     * @type {?}
     * @private
     */
    EditEventDispatcher.prototype._startWithNullDistinct;
    /** @type {?} */
    EditEventDispatcher.prototype.editingAndEnabled;
    /**
     * An observable that emits the row containing focus or an active edit.
     * @type {?}
     */
    EditEventDispatcher.prototype.editingOrFocused;
    /**
     * Tracks rows that contain hover content with a reference count.
     * @type {?}
     * @private
     */
    EditEventDispatcher.prototype._rowsWithHoverContent;
    /**
     * The table cell that has an active edit lens (or null).
     * @type {?}
     * @private
     */
    EditEventDispatcher.prototype._currentlyEditing;
    /**
     * The combined set of row hover content states organized by row.
     * @type {?}
     * @private
     */
    EditEventDispatcher.prototype._hoveredContentStateDistinct;
    /**
     * @type {?}
     * @private
     */
    EditEventDispatcher.prototype._editingAndEnabledDistinct;
    /**
     * @type {?}
     * @private
     */
    EditEventDispatcher.prototype._lastSeenRow;
    /**
     * @type {?}
     * @private
     */
    EditEventDispatcher.prototype._lastSeenRowHoverOrFocus;
    /**
     * @type {?}
     * @private
     */
    EditEventDispatcher.prototype._ngZone;
}
/**
 * @param {?} __0
 * @return {?}
 */
function computeHoverContentState([firstRow, lastRow, activeRow, hoverRow]) {
    /** @type {?} */
    const hoverContentState = new Map();
    // Add focusable rows.
    for (const focussableRow of [
        firstRow,
        lastRow,
        activeRow && activeRow.previousElementSibling,
        activeRow && activeRow.nextElementSibling,
    ]) {
        if (focussableRow) {
            hoverContentState.set((/** @type {?} */ (focussableRow)), 1 /* FOCUSABLE */);
        }
    }
    // Add/overwrite with fully visible rows.
    for (const onRow of [activeRow, hoverRow]) {
        if (onRow) {
            hoverContentState.set(onRow, 2 /* ON */);
        }
    }
    return hoverContentState;
}
/**
 * @template K, V
 * @param {?} a
 * @param {?} b
 * @return {?}
 */
function areMapEntriesEqual(a, b) {
    if (a.size !== b.size) {
        return false;
    }
    // TODO: use Map.prototype.entries once we're off IE11.
    for (const aKey of Array.from(a.keys())) {
        if (b.get(aKey) !== a.get(aKey)) {
            return false;
        }
    }
    return true;
}

/**
 * @fileoverview added by tsickle
 * Generated from: src/cdk-experimental/popover-edit/edit-ref.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * Used for communication between the form within the edit lens and the
 * table that launched it. Provided by CdkEditControl within the lens.
 * @template FormValue
 */
class EditRef {
    /**
     * @param {?} _form
     * @param {?} _editEventDispatcher
     * @param {?} _ngZone
     */
    constructor(_form, _editEventDispatcher, _ngZone) {
        this._form = _form;
        this._editEventDispatcher = _editEventDispatcher;
        this._ngZone = _ngZone;
        /**
         * Emits the final value of this edit instance before closing.
         */
        this._finalValueSubject = new Subject();
        this.finalValue = this._finalValueSubject.asObservable();
        /**
         * Emits when the user tabs out of this edit lens before closing.
         */
        this._blurredSubject = new Subject();
        this.blurred = this._blurredSubject.asObservable();
        this._editEventDispatcher.setActiveEditRef(this);
    }
    /**
     * Called by the host directive's OnInit hook. Reads the initial state of the
     * form and overrides it with persisted state from previous openings, if
     * applicable.
     * @param {?} previousFormValue
     * @return {?}
     */
    init(previousFormValue) {
        // Wait for the zone to stabilize before caching the initial value.
        // This ensures that all form controls have been initialized.
        this._ngZone.onStable.pipe(take(1)).subscribe((/**
         * @return {?}
         */
        () => {
            this.updateRevertValue();
            if (previousFormValue) {
                this.reset(previousFormValue);
            }
        }));
    }
    /**
     * @return {?}
     */
    ngOnDestroy() {
        this._editEventDispatcher.unsetActiveEditRef(this);
        this._finalValueSubject.next(this._form.value);
        this._finalValueSubject.complete();
    }
    /**
     * Whether the attached form is in a valid state.
     * @return {?}
     */
    isValid() {
        return this._form.valid;
    }
    /**
     * Set the form's current value as what it will be set to on revert/reset.
     * @return {?}
     */
    updateRevertValue() {
        this._revertFormValue = this._form.value;
    }
    /**
     * Tells the table to close the edit popup.
     * @return {?}
     */
    close() {
        this._editEventDispatcher.editing.next(null);
    }
    /**
     * Notifies the active edit that the user has moved focus out of the lens.
     * @return {?}
     */
    blur() {
        this._blurredSubject.next();
    }
    /**
     * Resets the form value to the specified value or the previously set
     * revert value.
     * @param {?=} value
     * @return {?}
     */
    reset(value) {
        this._form.reset(value || this._revertFormValue);
    }
}
EditRef.decorators = [
    { type: Injectable }
];
/** @nocollapse */
EditRef.ctorParameters = () => [
    { type: ControlContainer, decorators: [{ type: Self }] },
    { type: EditEventDispatcher },
    { type: NgZone }
];
if (false) {
    /**
     * Emits the final value of this edit instance before closing.
     * @type {?}
     * @private
     */
    EditRef.prototype._finalValueSubject;
    /** @type {?} */
    EditRef.prototype.finalValue;
    /**
     * Emits when the user tabs out of this edit lens before closing.
     * @type {?}
     * @private
     */
    EditRef.prototype._blurredSubject;
    /** @type {?} */
    EditRef.prototype.blurred;
    /**
     * The value to set the form back to on revert.
     * @type {?}
     * @private
     */
    EditRef.prototype._revertFormValue;
    /**
     * @type {?}
     * @private
     */
    EditRef.prototype._form;
    /**
     * @type {?}
     * @private
     */
    EditRef.prototype._editEventDispatcher;
    /**
     * @type {?}
     * @private
     */
    EditRef.prototype._ngZone;
}

/**
 * @fileoverview added by tsickle
 * Generated from: src/cdk-experimental/popover-edit/focus-dispatcher.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * Service responsible for moving cell focus around in response to keyboard events.
 * May be overridden to customize the keyboard behavior of popover edit.
 */
class FocusDispatcher {
    /**
     * @param {?} directionality
     */
    constructor(directionality) {
        this.directionality = directionality;
        this.keyObserver = { next: (/**
             * @param {?} event
             * @return {?}
             */
            (event) => this.handleKeyboardEvent(event)) };
    }
    /**
     * Moves focus to earlier or later cells (in dom order) by offset cells relative to
     * currentCell.
     * @param {?} currentCell
     * @param {?} offset
     * @return {?}
     */
    moveFocusHorizontally(currentCell, offset) {
        /** @type {?} */
        const cells = (/** @type {?} */ (Array.from((/** @type {?} */ (closest(currentCell, TABLE_SELECTOR))).querySelectorAll(EDITABLE_CELL_SELECTOR))));
        /** @type {?} */
        const currentIndex = cells.indexOf(currentCell);
        /** @type {?} */
        const newIndex = currentIndex + offset;
        if (cells[newIndex]) {
            cells[newIndex].focus();
        }
    }
    /**
     * Moves focus to up or down by row by offset cells relative to currentCell.
     * @param {?} currentCell
     * @param {?} offset
     * @return {?}
     */
    moveFocusVertically(currentCell, offset) {
        /** @type {?} */
        const currentRow = (/** @type {?} */ (closest(currentCell, ROW_SELECTOR)));
        /** @type {?} */
        const rows = Array.from((/** @type {?} */ (closest(currentRow, TABLE_SELECTOR))).querySelectorAll(ROW_SELECTOR));
        /** @type {?} */
        const currentRowIndex = rows.indexOf(currentRow);
        /** @type {?} */
        const currentIndexWithinRow = Array.from(currentRow.querySelectorAll(EDITABLE_CELL_SELECTOR)).indexOf(currentCell);
        /** @type {?} */
        const newRowIndex = currentRowIndex + offset;
        if (rows[newRowIndex]) {
            /** @type {?} */
            const rowToFocus = (/** @type {?} */ (Array.from(rows[newRowIndex].querySelectorAll(EDITABLE_CELL_SELECTOR))));
            if (rowToFocus[currentIndexWithinRow]) {
                rowToFocus[currentIndexWithinRow].focus();
            }
        }
    }
    /**
     * Translates arrow keydown events into focus move operations.
     * @protected
     * @param {?} event
     * @return {?}
     */
    handleKeyboardEvent(event) {
        /** @type {?} */
        const cell = (/** @type {?} */ (closest(event.target, EDITABLE_CELL_SELECTOR)));
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
    }
}
FocusDispatcher.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] }
];
/** @nocollapse */
FocusDispatcher.ctorParameters = () => [
    { type: Directionality }
];
/** @nocollapse */ FocusDispatcher.ɵprov = ɵɵdefineInjectable({ factory: function FocusDispatcher_Factory() { return new FocusDispatcher(ɵɵinject(Directionality)); }, token: FocusDispatcher, providedIn: "root" });
if (false) {
    /**
     * Observes keydown events triggered from the table.
     * @type {?}
     */
    FocusDispatcher.prototype.keyObserver;
    /**
     * @type {?}
     * @protected
     */
    FocusDispatcher.prototype.directionality;
}

/**
 * @fileoverview added by tsickle
 * Generated from: src/cdk-experimental/popover-edit/form-value-container.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * @record
 * @template FormValue
 */
function Entry() { }
if (false) {
    /** @type {?|undefined} */
    Entry.prototype.value;
}
/**
 * A convenience class for preserving unsaved form state while an edit lens is closed.
 *
 * Example usage:
 * class MyComponent {
 *   readonly nameEditValues = new FormValueContainer&lt;Item, {name: string}&gt;();
 * }
 *
 * &lt;form cdkEditControl [(cdkEditControlPreservedFormValue)]="nameEditValues.for(item).value"&gt;
 * @template Key, FormValue
 */
class FormValueContainer {
    constructor() {
        this._formValues = new WeakMap();
    }
    /**
     * @param {?} key
     * @return {?}
     */
    for(key) {
        /** @type {?} */
        const _formValues = this._formValues;
        /** @type {?} */
        let entry = _formValues.get(key);
        if (!entry) {
            // Expose entry as an object so that we can [(two-way)] bind to its value member
            entry = {};
            _formValues.set(key, entry);
        }
        return entry;
    }
}
if (false) {
    /**
     * @type {?}
     * @private
     */
    FormValueContainer.prototype._formValues;
}

/**
 * @fileoverview added by tsickle
 * Generated from: src/cdk-experimental/popover-edit/lens-directives.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * A directive that attaches to a form within the edit lens.
 * It coordinates the form state with the table-wide edit system and handles
 * closing the edit lens when the form is submitted or the user clicks
 * out.
 * @template FormValue
 */
class CdkEditControl {
    /**
     * @param {?} elementRef
     * @param {?} editRef
     */
    constructor(elementRef, editRef) {
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
    /**
     * @return {?}
     */
    ngOnInit() {
        this.editRef.init(this.preservedFormValue);
        this.editRef.finalValue.subscribe(this.preservedFormValueChange);
        this.editRef.blurred.subscribe((/**
         * @return {?}
         */
        () => this._handleBlur()));
    }
    /**
     * @return {?}
     */
    ngOnDestroy() {
        this.destroyed.next();
        this.destroyed.complete();
    }
    /**
     * Called when the form submits. If ignoreSubmitUnlessValid is true, checks
     * the form for validity before proceeding.
     * Updates the revert state with the latest submitted value then closes the edit.
     * @return {?}
     */
    // In Ivy the `host` metadata will be merged, whereas in ViewEngine it is overridden. In order
    // to avoid double event listeners, we need to use `HostListener`. Once Ivy is the default, we
    // can move this back into `host`.
    // tslint:disable:no-host-decorator-in-concrete
    handleFormSubmit() {
        if (this.ignoreSubmitUnlessValid && !this.editRef.isValid()) {
            return;
        }
        this.editRef.updateRevertValue();
        this.editRef.close();
    }
    /**
     * Called on Escape keyup. Closes the edit.
     * @return {?}
     */
    close() {
        // todo - allow this behavior to be customized as well, such as calling
        // reset before close
        this.editRef.close();
    }
    /**
     * Called on click anywhere in the document.
     * If the click was outside of the lens, trigger the specified click out behavior.
     * @param {?} evt
     * @return {?}
     */
    // In Ivy the `host` metadata will be merged, whereas in ViewEngine it is overridden. In order
    // to avoid double event listeners, we need to use `HostListener`. Once Ivy is the default, we
    // can move this back into `host`.
    // tslint:disable:no-host-decorator-in-concrete
    handlePossibleClickOut(evt) {
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
    }
    // In Ivy the `host` metadata will be merged, whereas in ViewEngine it is overridden. In order
    // to avoid double event listeners, we need to use `HostListener`. Once Ivy is the default, we
    // can move this back into `host`.
    // tslint:disable:no-host-decorator-in-concrete
    /**
     * @param {?} event
     * @return {?}
     */
    _handleKeydown(event) {
        if (event.key === 'Escape' && !hasModifierKey(event)) {
            this.close();
            event.preventDefault();
        }
    }
    /**
     * Triggers submit on tab out if clickOutBehavior is 'submit'.
     * @private
     * @return {?}
     */
    _handleBlur() {
        if (this.clickOutBehavior === 'submit') {
            // Manually cause the form to submit before closing.
            this._triggerFormSubmit();
        }
    }
    /**
     * @private
     * @return {?}
     */
    _triggerFormSubmit() {
        (/** @type {?} */ (this.elementRef.nativeElement)).dispatchEvent(new Event('submit'));
    }
}
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
CdkEditControl.ctorParameters = () => [
    { type: ElementRef },
    { type: EditRef }
];
CdkEditControl.propDecorators = {
    handleFormSubmit: [{ type: HostListener, args: ['ngSubmit',] }],
    handlePossibleClickOut: [{ type: HostListener, args: ['document:click', ['$event'],] }],
    _handleKeydown: [{ type: HostListener, args: ['keydown', ['$event'],] }]
};
if (false) {
    /**
     * @type {?}
     * @protected
     */
    CdkEditControl.prototype.destroyed;
    /**
     * Specifies what should happen when the user clicks outside of the edit lens.
     * The default behavior is to close the lens without submitting the form.
     * @type {?}
     */
    CdkEditControl.prototype.clickOutBehavior;
    /**
     * A two-way binding for storing unsubmitted form state. If not provided
     * then form state will be discarded on close. The PeristBy directive is offered
     * as a convenient shortcut for these bindings.
     * @type {?}
     */
    CdkEditControl.prototype.preservedFormValue;
    /** @type {?} */
    CdkEditControl.prototype.preservedFormValueChange;
    /**
     * Determines whether the lens will close on form submit if the form is not in a valid
     * state. By default the lens will remain open.
     * @type {?}
     */
    CdkEditControl.prototype.ignoreSubmitUnlessValid;
    /**
     * @type {?}
     * @protected
     */
    CdkEditControl.prototype.elementRef;
    /** @type {?} */
    CdkEditControl.prototype.editRef;
}
/**
 * Reverts the form to its initial or previously submitted state on click.
 * @template FormValue
 */
class CdkEditRevert {
    /**
     * @param {?} editRef
     */
    constructor(editRef) {
        this.editRef = editRef;
        /**
         * Type of the button. Defaults to `button` to avoid accident form submits.
         */
        this.type = 'button';
    }
    // In Ivy the `host` metadata will be merged, whereas in ViewEngine it is overridden. In order
    // to avoid double event listeners, we need to use `HostListener`. Once Ivy is the default, we
    // can move this back into `host`.
    // tslint:disable:no-host-decorator-in-concrete
    /**
     * @return {?}
     */
    revertEdit() {
        this.editRef.reset();
    }
}
CdkEditRevert.decorators = [
    { type: Directive, args: [{
                selector: 'button[cdkEditRevert]',
                host: {
                    'type': 'button',
                }
            },] }
];
/** @nocollapse */
CdkEditRevert.ctorParameters = () => [
    { type: EditRef }
];
CdkEditRevert.propDecorators = {
    type: [{ type: Input }],
    revertEdit: [{ type: HostListener, args: ['click',] }]
};
if (false) {
    /**
     * Type of the button. Defaults to `button` to avoid accident form submits.
     * @type {?}
     */
    CdkEditRevert.prototype.type;
    /**
     * @type {?}
     * @protected
     */
    CdkEditRevert.prototype.editRef;
}
/**
 * Closes the lens on click.
 * @template FormValue
 */
class CdkEditClose {
    /**
     * @param {?} elementRef
     * @param {?} editRef
     */
    constructor(elementRef, editRef) {
        this.elementRef = elementRef;
        this.editRef = editRef;
        /** @type {?} */
        const nativeElement = elementRef.nativeElement;
        // Prevent accidental form submits.
        if (nativeElement.nodeName === 'BUTTON' && !nativeElement.getAttribute('type')) {
            nativeElement.setAttribute('type', 'button');
        }
    }
    // In Ivy the `host` metadata will be merged, whereas in ViewEngine it is overridden. In order
    // to avoid double event listeners, we need to use `HostListener`. Once Ivy is the default, we
    // can move this back into `host`.
    // tslint:disable:no-host-decorator-in-concrete
    /**
     * @return {?}
     */
    closeEdit() {
        // Note that we use `click` here, rather than a keyboard event, because some screen readers
        // will emit a fake click event instead of an enter keyboard event on buttons.
        this.editRef.close();
    }
}
CdkEditClose.decorators = [
    { type: Directive, args: [{ selector: '[cdkEditClose]' },] }
];
/** @nocollapse */
CdkEditClose.ctorParameters = () => [
    { type: ElementRef },
    { type: EditRef }
];
CdkEditClose.propDecorators = {
    closeEdit: [{ type: HostListener, args: ['click',] }, { type: HostListener, args: ['keyup.enter',] }, { type: HostListener, args: ['keyup.space',] }]
};
if (false) {
    /**
     * @type {?}
     * @protected
     */
    CdkEditClose.prototype.elementRef;
    /**
     * @type {?}
     * @protected
     */
    CdkEditClose.prototype.editRef;
}

/**
 * @fileoverview added by tsickle
 * Generated from: src/cdk-experimental/popover-edit/popover-edit-position-strategy-factory.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * Overridable factory responsible for configuring how cdkPopoverEdit popovers are positioned
 * and sized.
 * @abstract
 */
class PopoverEditPositionStrategyFactory {
}
PopoverEditPositionStrategyFactory.decorators = [
    { type: Injectable }
];
if (false) {
    /**
     * Creates a PositionStrategy based on the specified table cells.
     * The cells will be provided in DOM order.
     * @abstract
     * @param {?} cells
     * @return {?}
     */
    PopoverEditPositionStrategyFactory.prototype.positionStrategyForCells = function (cells) { };
    /**
     * Creates an OverlaySizeConfig based on the specified table cells.
     * The cells will be provided in DOM order.
     * @abstract
     * @param {?} cells
     * @return {?}
     */
    PopoverEditPositionStrategyFactory.prototype.sizeConfigForCells = function (cells) { };
}
/**
 * Default implementation of PopoverEditPositionStrategyFactory.
 * Uses a FlexibleConnectedPositionStrategy anchored to the start + top of the cell.
 * Note: This will change to CoverPositionStrategy once it implemented.
 */
class DefaultPopoverEditPositionStrategyFactory extends PopoverEditPositionStrategyFactory {
    /**
     * @param {?} direction
     * @param {?} overlay
     */
    constructor(direction, overlay) {
        super();
        this.direction = direction;
        this.overlay = overlay;
    }
    /**
     * @param {?} cells
     * @return {?}
     */
    positionStrategyForCells(cells) {
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
    }
    /**
     * @param {?} cells
     * @return {?}
     */
    sizeConfigForCells(cells) {
        if (cells.length === 0) {
            return {};
        }
        if (cells.length === 1) {
            return { width: cells[0].getBoundingClientRect().width };
        }
        /** @type {?} */
        let firstCell;
        /** @type {?} */
        let lastCell;
        if (this.direction.value === 'ltr') {
            firstCell = cells[0];
            lastCell = cells[cells.length - 1];
        }
        else {
            lastCell = cells[0];
            firstCell = cells[cells.length - 1];
        }
        return { width: lastCell.getBoundingClientRect().right - firstCell.getBoundingClientRect().left };
    }
}
DefaultPopoverEditPositionStrategyFactory.decorators = [
    { type: Injectable }
];
/** @nocollapse */
DefaultPopoverEditPositionStrategyFactory.ctorParameters = () => [
    { type: Directionality },
    { type: Overlay }
];
if (false) {
    /**
     * @type {?}
     * @protected
     */
    DefaultPopoverEditPositionStrategyFactory.prototype.direction;
    /**
     * @type {?}
     * @protected
     */
    DefaultPopoverEditPositionStrategyFactory.prototype.overlay;
}

/**
 * @fileoverview added by tsickle
 * Generated from: src/cdk-experimental/popover-edit/edit-services.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * Optimization
 * Collects multiple Injectables into a singleton shared across the table. By reducing the
 * number of services injected into each CdkPopoverEdit, this saves about 0.023ms of cpu time
 * and 56 bytes of memory per instance.
 */
class EditServices {
    /**
     * @param {?} directionality
     * @param {?} editEventDispatcher
     * @param {?} focusDispatcher
     * @param {?} focusTrapFactory
     * @param {?} ngZone
     * @param {?} overlay
     * @param {?} positionFactory
     * @param {?} scrollDispatcher
     * @param {?} viewportRuler
     */
    constructor(directionality, editEventDispatcher, focusDispatcher, focusTrapFactory, ngZone, overlay, positionFactory, scrollDispatcher, viewportRuler) {
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
}
EditServices.decorators = [
    { type: Injectable }
];
/** @nocollapse */
EditServices.ctorParameters = () => [
    { type: Directionality },
    { type: EditEventDispatcher },
    { type: FocusDispatcher },
    { type: FocusTrapFactory },
    { type: NgZone },
    { type: Overlay },
    { type: PopoverEditPositionStrategyFactory },
    { type: ScrollDispatcher },
    { type: ViewportRuler }
];
if (false) {
    /** @type {?} */
    EditServices.prototype.directionality;
    /** @type {?} */
    EditServices.prototype.editEventDispatcher;
    /** @type {?} */
    EditServices.prototype.focusDispatcher;
    /** @type {?} */
    EditServices.prototype.focusTrapFactory;
    /** @type {?} */
    EditServices.prototype.ngZone;
    /** @type {?} */
    EditServices.prototype.overlay;
    /** @type {?} */
    EditServices.prototype.positionFactory;
    /** @type {?} */
    EditServices.prototype.scrollDispatcher;
    /** @type {?} */
    EditServices.prototype.viewportRuler;
}

/**
 * @fileoverview added by tsickle
 * Generated from: src/cdk-experimental/popover-edit/focus-escape-notifier.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/** @enum {number} */
const FocusEscapeNotifierDirection = {
    START: 0,
    END: 1,
};
/**
 * Like FocusTrap, but rather than trapping focus within a dom region, notifies subscribers when
 * focus leaves the region.
 */
class FocusEscapeNotifier extends FocusTrap {
    /**
     * @param {?} element
     * @param {?} checker
     * @param {?} ngZone
     * @param {?} document
     */
    constructor(element, checker, ngZone, document) {
        super(element, checker, ngZone, document, true /* deferAnchors */);
        this._escapeSubject = new Subject();
        // The focus trap adds "anchors" at the beginning and end of a trapped region that redirect
        // focus. We override that redirect behavior here with simply emitting on a stream.
        this.startAnchorListener = (/**
         * @return {?}
         */
        () => {
            this._escapeSubject.next(0 /* START */);
            return true;
        });
        this.endAnchorListener = (/**
         * @return {?}
         */
        () => {
            this._escapeSubject.next(1 /* END */);
            return true;
        });
        this.attachAnchors();
    }
    /**
     * @return {?}
     */
    escapes() {
        return this._escapeSubject.asObservable();
    }
}
if (false) {
    /**
     * @type {?}
     * @private
     */
    FocusEscapeNotifier.prototype._escapeSubject;
}
/**
 * Factory that allows easy instantiation of focus escape notifiers.
 */
class FocusEscapeNotifierFactory {
    /**
     * @param {?} _checker
     * @param {?} _ngZone
     * @param {?} _document
     */
    constructor(_checker, _ngZone, _document) {
        this._checker = _checker;
        this._ngZone = _ngZone;
        this._document = _document;
    }
    /**
     * Creates a focus escape notifier region around the given element.
     * @param {?} element The element around which focus will be monitored.
     * @return {?} The created focus escape notifier instance.
     */
    create(element) {
        return new FocusEscapeNotifier(element, this._checker, this._ngZone, this._document);
    }
}
FocusEscapeNotifierFactory.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] }
];
/** @nocollapse */
FocusEscapeNotifierFactory.ctorParameters = () => [
    { type: InteractivityChecker },
    { type: NgZone },
    { type: undefined, decorators: [{ type: Inject, args: [DOCUMENT,] }] }
];
/** @nocollapse */ FocusEscapeNotifierFactory.ɵprov = ɵɵdefineInjectable({ factory: function FocusEscapeNotifierFactory_Factory() { return new FocusEscapeNotifierFactory(ɵɵinject(InteractivityChecker), ɵɵinject(NgZone), ɵɵinject(DOCUMENT)); }, token: FocusEscapeNotifierFactory, providedIn: "root" });
if (false) {
    /**
     * @type {?}
     * @private
     */
    FocusEscapeNotifierFactory.prototype._document;
    /**
     * @type {?}
     * @private
     */
    FocusEscapeNotifierFactory.prototype._checker;
    /**
     * @type {?}
     * @private
     */
    FocusEscapeNotifierFactory.prototype._ngZone;
}

/**
 * @fileoverview added by tsickle
 * Generated from: src/cdk-experimental/popover-edit/table-directives.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * Describes the number of columns before and after the originating cell that the
 * edit popup should span. In left to right locales, before means left and after means
 * right. In right to left locales before means right and after means left.
 * @record
 */
function CdkPopoverEditColspan() { }
if (false) {
    /** @type {?|undefined} */
    CdkPopoverEditColspan.prototype.before;
    /** @type {?|undefined} */
    CdkPopoverEditColspan.prototype.after;
}
/**
 * Used for rate-limiting mousemove events.
 * @type {?}
 */
const MOUSE_MOVE_THROTTLE_TIME_MS = 10;
/**
 * A directive that must be attached to enable editability on a table.
 * It is responsible for setting up delegated event handlers and providing the
 * EditEventDispatcher service for use by the other edit directives.
 */
class CdkEditable {
    /**
     * @param {?} elementRef
     * @param {?} editEventDispatcher
     * @param {?} focusDispatcher
     * @param {?} ngZone
     */
    constructor(elementRef, editEventDispatcher, focusDispatcher, ngZone) {
        this.elementRef = elementRef;
        this.editEventDispatcher = editEventDispatcher;
        this.focusDispatcher = focusDispatcher;
        this.ngZone = ngZone;
        this.destroyed = new Subject();
    }
    /**
     * @return {?}
     */
    ngAfterViewInit() {
        this._listenForTableEvents();
    }
    /**
     * @return {?}
     */
    ngOnDestroy() {
        this.destroyed.next();
        this.destroyed.complete();
    }
    /**
     * @private
     * @return {?}
     */
    _listenForTableEvents() {
        /** @type {?} */
        const element = this.elementRef.nativeElement;
        /** @type {?} */
        const toClosest = (/**
         * @param {?} selector
         * @return {?}
         */
        (selector) => map((/**
         * @param {?} event
         * @return {?}
         */
        (event) => closest(event.target, selector))));
        this.ngZone.runOutsideAngular((/**
         * @return {?}
         */
        () => {
            // Track mouse movement over the table to hide/show hover content.
            fromEvent(element, 'mouseover').pipe(toClosest(ROW_SELECTOR), takeUntil(this.destroyed)).subscribe(this.editEventDispatcher.hovering);
            fromEvent(element, 'mouseleave').pipe(mapTo(null), takeUntil(this.destroyed)).subscribe(this.editEventDispatcher.hovering);
            fromEvent(element, 'mousemove').pipe(throttleTime(MOUSE_MOVE_THROTTLE_TIME_MS), toClosest(ROW_SELECTOR), takeUntil(this.destroyed)).subscribe(this.editEventDispatcher.mouseMove);
            // Track focus within the table to hide/show/make focusable hover content.
            fromEventPattern((/**
             * @param {?} handler
             * @return {?}
             */
            (handler) => element.addEventListener('focus', handler, true)), (/**
             * @param {?} handler
             * @return {?}
             */
            (handler) => element.removeEventListener('focus', handler, true))).pipe(takeUntil(this.destroyed), toClosest(ROW_SELECTOR), share()).subscribe(this.editEventDispatcher.focused);
            fromEventPattern((/**
             * @param {?} handler
             * @return {?}
             */
            (handler) => element.addEventListener('blur', handler, true)), (/**
             * @param {?} handler
             * @return {?}
             */
            (handler) => element.removeEventListener('blur', handler, true))).pipe(takeUntil(this.destroyed), mapTo(null), share()).subscribe(this.editEventDispatcher.focused);
            // Keep track of rows within the table. This is used to know which rows with hover content
            // are first or last in the table. They are kept focusable in case focus enters from above
            // or below the table.
            this.ngZone.onStable.pipe(takeUntil(this.destroyed), 
            // Optimization: ignore dom changes while focus is within the table as we already
            // ensure that rows above and below the focused/active row are tabbable.
            withLatestFrom(this.editEventDispatcher.editingOrFocused), filter((/**
             * @param {?} __0
             * @return {?}
             */
            ([_, activeRow]) => activeRow == null)), map((/**
             * @return {?}
             */
            () => element.querySelectorAll(ROW_SELECTOR))), share()).subscribe(this.editEventDispatcher.allRows);
            fromEvent(element, 'keydown').pipe(filter((/**
             * @param {?} event
             * @return {?}
             */
            event => event.key === 'Enter')), toClosest(CELL_SELECTOR), takeUntil(this.destroyed)).subscribe(this.editEventDispatcher.editing);
            // Keydown must be used here or else key autorepeat does not work properly on some platforms.
            fromEvent(element, 'keydown')
                .pipe(takeUntil(this.destroyed))
                .subscribe(this.focusDispatcher.keyObserver);
        }));
    }
}
CdkEditable.decorators = [
    { type: Directive, args: [{
                selector: 'table[editable], cdk-table[editable], mat-table[editable]',
                providers: [EditEventDispatcher, EditServices],
            },] }
];
/** @nocollapse */
CdkEditable.ctorParameters = () => [
    { type: ElementRef },
    { type: EditEventDispatcher },
    { type: FocusDispatcher },
    { type: NgZone }
];
if (false) {
    /**
     * @type {?}
     * @protected
     */
    CdkEditable.prototype.destroyed;
    /**
     * @type {?}
     * @protected
     */
    CdkEditable.prototype.elementRef;
    /**
     * @type {?}
     * @protected
     */
    CdkEditable.prototype.editEventDispatcher;
    /**
     * @type {?}
     * @protected
     */
    CdkEditable.prototype.focusDispatcher;
    /**
     * @type {?}
     * @protected
     */
    CdkEditable.prototype.ngZone;
}
/** @type {?} */
const POPOVER_EDIT_HOST_BINDINGS = {
    '[attr.tabindex]': 'disabled ? null : 0',
    'class': 'cdk-popover-edit-cell',
    '[attr.aria-haspopup]': '!disabled',
};
/** @type {?} */
const POPOVER_EDIT_INPUTS = [
    'template: cdkPopoverEdit',
    'context: cdkPopoverEditContext',
    'colspan: cdkPopoverEditColspan',
    'disabled: cdkPopoverEditDisabled',
];
/**
 * Attaches an ng-template to a cell and shows it when instructed to by the
 * EditEventDispatcher service.
 * Makes the cell focusable.
 * @template C
 */
class CdkPopoverEdit {
    /**
     * @param {?} services
     * @param {?} elementRef
     * @param {?} viewContainerRef
     */
    constructor(services, elementRef, viewContainerRef) {
        this.services = services;
        this.elementRef = elementRef;
        this.viewContainerRef = viewContainerRef;
        /**
         * The edit lens template shown over the cell on edit.
         */
        this.template = null;
        this._colspan = {};
        this._disabled = false;
        this.destroyed = new Subject();
    }
    /**
     * Specifies that the popup should cover additional table cells before and/or after
     * this one.
     * @return {?}
     */
    get colspan() {
        return this._colspan;
    }
    /**
     * @param {?} value
     * @return {?}
     */
    set colspan(value) {
        this._colspan = value;
        // Recompute positioning when the colspan changes.
        if (this.overlayRef) {
            this.overlayRef.updatePositionStrategy(this._getPositionStrategy());
            if (this.overlayRef.hasAttached()) {
                this._updateOverlaySize();
            }
        }
    }
    /**
     * Whether popover edit is disabled for this cell.
     * @return {?}
     */
    get disabled() {
        return this._disabled;
    }
    /**
     * @param {?} value
     * @return {?}
     */
    set disabled(value) {
        this._disabled = value;
        if (value) {
            this.services.editEventDispatcher.doneEditingCell((/** @type {?} */ (this.elementRef.nativeElement)));
            this.services.editEventDispatcher.disabledCells.set((/** @type {?} */ (this.elementRef.nativeElement)), true);
        }
        else {
            this.services.editEventDispatcher.disabledCells.delete((/** @type {?} */ (this.elementRef.nativeElement)));
        }
    }
    /**
     * @return {?}
     */
    ngAfterViewInit() {
        this._startListeningToEditEvents();
    }
    /**
     * @return {?}
     */
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
    /**
     * @protected
     * @return {?}
     */
    initFocusTrap() {
        this.focusTrap = this.services.focusTrapFactory.create((/** @type {?} */ (this.overlayRef)).overlayElement);
    }
    /**
     * @protected
     * @return {?}
     */
    closeEditOverlay() {
        this.services.editEventDispatcher.doneEditingCell((/** @type {?} */ (this.elementRef.nativeElement)));
    }
    /**
     * @protected
     * @return {?}
     */
    panelClass() {
        return EDIT_PANE_CLASS;
    }
    /**
     * @private
     * @return {?}
     */
    _startListeningToEditEvents() {
        this.services.editEventDispatcher.editingCell((/** @type {?} */ (this.elementRef.nativeElement)))
            .pipe(takeUntil(this.destroyed))
            .subscribe((/**
         * @param {?} open
         * @return {?}
         */
        (open) => {
            if (open && this.template) {
                if (!this.overlayRef) {
                    this._createEditOverlay();
                }
                this._showEditOverlay();
            }
            else if (this.overlayRef) {
                this._maybeReturnFocusToCell();
                this.overlayRef.detach();
            }
        }));
    }
    /**
     * @private
     * @return {?}
     */
    _createEditOverlay() {
        this.overlayRef = this.services.overlay.create({
            disposeOnNavigation: true,
            panelClass: this.panelClass(),
            positionStrategy: this._getPositionStrategy(),
            scrollStrategy: this.services.overlay.scrollStrategies.reposition(),
            direction: this.services.directionality,
        });
        this.initFocusTrap();
        this.overlayRef.overlayElement.setAttribute('aria-role', 'dialog');
        this.overlayRef.detachments().subscribe((/**
         * @return {?}
         */
        () => this.closeEditOverlay()));
    }
    /**
     * @private
     * @return {?}
     */
    _showEditOverlay() {
        (/** @type {?} */ (this.overlayRef)).attach(new TemplatePortal((/** @type {?} */ (this.template)), this.viewContainerRef, { $implicit: this.context }));
        // We have to defer trapping focus, because doing so too early can cause the form inside
        // the overlay to be submitted immediately if it was opened on an Enter keydown event.
        this.services.ngZone.runOutsideAngular((/**
         * @return {?}
         */
        () => {
            setTimeout((/**
             * @return {?}
             */
            () => {
                (/** @type {?} */ (this.focusTrap)).focusInitialElement();
            }));
        }));
        // Update the size of the popup initially and on subsequent changes to
        // scroll position and viewport size.
        merge(this.services.scrollDispatcher.scrolled(), this.services.viewportRuler.change())
            .pipe(startWith(null), takeUntil((/** @type {?} */ (this.overlayRef)).detachments()), takeUntil(this.destroyed))
            .subscribe((/**
         * @return {?}
         */
        () => {
            this._updateOverlaySize();
        }));
    }
    /**
     * @private
     * @return {?}
     */
    _getOverlayCells() {
        /** @type {?} */
        const cell = (/** @type {?} */ (closest((/** @type {?} */ (this.elementRef.nativeElement)), CELL_SELECTOR)));
        if (!this._colspan.before && !this._colspan.after) {
            return [cell];
        }
        /** @type {?} */
        const row = (/** @type {?} */ (closest((/** @type {?} */ (this.elementRef.nativeElement)), ROW_SELECTOR)));
        /** @type {?} */
        const rowCells = (/** @type {?} */ (Array.from(row.querySelectorAll(CELL_SELECTOR))));
        /** @type {?} */
        const ownIndex = rowCells.indexOf(cell);
        return rowCells.slice(ownIndex - (this._colspan.before || 0), ownIndex + (this._colspan.after || 0) + 1);
    }
    /**
     * @private
     * @return {?}
     */
    _getPositionStrategy() {
        return this.services.positionFactory.positionStrategyForCells(this._getOverlayCells());
    }
    /**
     * @private
     * @return {?}
     */
    _updateOverlaySize() {
        (/** @type {?} */ (this.overlayRef)).updateSize(this.services.positionFactory.sizeConfigForCells(this._getOverlayCells()));
    }
    /**
     * @private
     * @return {?}
     */
    _maybeReturnFocusToCell() {
        if (closest(document.activeElement, EDIT_PANE_SELECTOR) ===
            (/** @type {?} */ (this.overlayRef)).overlayElement) {
            (/** @type {?} */ (this.elementRef.nativeElement)).focus();
        }
    }
}
CdkPopoverEdit.decorators = [
    { type: Directive, args: [{
                selector: '[cdkPopoverEdit]:not([cdkPopoverEditTabOut])',
                host: POPOVER_EDIT_HOST_BINDINGS,
                inputs: POPOVER_EDIT_INPUTS,
            },] }
];
/** @nocollapse */
CdkPopoverEdit.ctorParameters = () => [
    { type: EditServices },
    { type: ElementRef },
    { type: ViewContainerRef }
];
if (false) {
    /**
     * The edit lens template shown over the cell on edit.
     * @type {?}
     */
    CdkPopoverEdit.prototype.template;
    /**
     * Implicit context to pass along to the template. Can be omitted if the template
     * is defined within the cell.
     * @type {?}
     */
    CdkPopoverEdit.prototype.context;
    /**
     * @type {?}
     * @private
     */
    CdkPopoverEdit.prototype._colspan;
    /**
     * @type {?}
     * @private
     */
    CdkPopoverEdit.prototype._disabled;
    /**
     * @type {?}
     * @protected
     */
    CdkPopoverEdit.prototype.focusTrap;
    /**
     * @type {?}
     * @protected
     */
    CdkPopoverEdit.prototype.overlayRef;
    /**
     * @type {?}
     * @protected
     */
    CdkPopoverEdit.prototype.destroyed;
    /**
     * @type {?}
     * @protected
     */
    CdkPopoverEdit.prototype.services;
    /**
     * @type {?}
     * @protected
     */
    CdkPopoverEdit.prototype.elementRef;
    /**
     * @type {?}
     * @protected
     */
    CdkPopoverEdit.prototype.viewContainerRef;
}
/**
 * Attaches an ng-template to a cell and shows it when instructed to by the
 * EditEventDispatcher service.
 * Makes the cell focusable.
 * @template C
 */
class CdkPopoverEditTabOut extends CdkPopoverEdit {
    /**
     * @param {?} elementRef
     * @param {?} viewContainerRef
     * @param {?} services
     * @param {?} focusEscapeNotifierFactory
     */
    constructor(elementRef, viewContainerRef, services, focusEscapeNotifierFactory) {
        super(services, elementRef, viewContainerRef);
        this.focusEscapeNotifierFactory = focusEscapeNotifierFactory;
    }
    /**
     * @protected
     * @return {?}
     */
    initFocusTrap() {
        this.focusTrap = this.focusEscapeNotifierFactory.create((/** @type {?} */ (this.overlayRef)).overlayElement);
        this.focusTrap.escapes().pipe(takeUntil(this.destroyed)).subscribe((/**
         * @param {?} direction
         * @return {?}
         */
        direction => {
            if (this.services.editEventDispatcher.editRef) {
                this.services.editEventDispatcher.editRef.blur();
            }
            this.services.focusDispatcher.moveFocusHorizontally((/** @type {?} */ (closest((/** @type {?} */ (this.elementRef.nativeElement)), CELL_SELECTOR))), direction === 0 /* START */ ? -1 : 1);
            this.closeEditOverlay();
        }));
    }
}
CdkPopoverEditTabOut.decorators = [
    { type: Directive, args: [{
                selector: '[cdkPopoverEdit][cdkPopoverEditTabOut]',
                host: POPOVER_EDIT_HOST_BINDINGS,
                inputs: POPOVER_EDIT_INPUTS,
            },] }
];
/** @nocollapse */
CdkPopoverEditTabOut.ctorParameters = () => [
    { type: ElementRef },
    { type: ViewContainerRef },
    { type: EditServices },
    { type: FocusEscapeNotifierFactory }
];
if (false) {
    /**
     * @type {?}
     * @protected
     */
    CdkPopoverEditTabOut.prototype.focusTrap;
    /**
     * @type {?}
     * @protected
     */
    CdkPopoverEditTabOut.prototype.focusEscapeNotifierFactory;
}
/**
 * A structural directive that shows its contents when the table row containing
 * it is hovered or when an element in the row has focus.
 */
class CdkRowHoverContent {
    /**
     * @param {?} services
     * @param {?} elementRef
     * @param {?} templateRef
     * @param {?} viewContainerRef
     */
    constructor(services, elementRef, templateRef, viewContainerRef) {
        this.services = services;
        this.elementRef = elementRef;
        this.templateRef = templateRef;
        this.viewContainerRef = viewContainerRef;
        this.destroyed = new Subject();
        this.viewRef = null;
    }
    /**
     * @return {?}
     */
    ngAfterViewInit() {
        this._row = (/** @type {?} */ (closest((/** @type {?} */ (this.elementRef.nativeElement)), ROW_SELECTOR)));
        this.services.editEventDispatcher.registerRowWithHoverContent(this._row);
        this._listenForHoverAndFocusEvents();
    }
    /**
     * @return {?}
     */
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
    /**
     * Called immediately after the hover content is created and added to the dom.
     * In the CDK version, this is a noop but subclasses such as MatRowHoverContent use this
     * to prepare/style the inserted element.
     * @protected
     * @param {?} _
     * @return {?}
     */
    initElement(_) {
    }
    /**
     * Called when the hover content needs to be focusable to preserve a reasonable tab ordering
     * but should not yet be shown.
     * @protected
     * @param {?} element
     * @return {?}
     */
    makeElementHiddenButFocusable(element) {
        element.style.opacity = '0';
    }
    /**
     * Called when the hover content needs to be focusable to preserve a reasonable tab ordering
     * but should not yet be shown.
     * @protected
     * @param {?} element
     * @return {?}
     */
    makeElementVisible(element) {
        element.style.opacity = '';
    }
    /**
     * @private
     * @return {?}
     */
    _listenForHoverAndFocusEvents() {
        this.services.editEventDispatcher.hoverOrFocusOnRow((/** @type {?} */ (this._row)))
            .pipe(takeUntil(this.destroyed))
            .subscribe((/**
         * @param {?} eventState
         * @return {?}
         */
        eventState => {
            // When in FOCUSABLE state, add the hover content to the dom but make it transparent so
            // that it is in the tab order relative to the currently focused row.
            if (eventState === 2 /* ON */ || eventState === 1 /* FOCUSABLE */) {
                if (!this.viewRef) {
                    this.viewRef = this.viewContainerRef.createEmbeddedView(this.templateRef, {});
                    this.initElement((/** @type {?} */ (this.viewRef.rootNodes[0])));
                    this.viewRef.markForCheck();
                }
                else if (this.viewContainerRef.indexOf(this.viewRef) === -1) {
                    this.viewContainerRef.insert((/** @type {?} */ (this.viewRef)));
                    this.viewRef.markForCheck();
                }
                if (eventState === 2 /* ON */) {
                    this.makeElementVisible((/** @type {?} */ (this.viewRef.rootNodes[0])));
                }
                else {
                    this.makeElementHiddenButFocusable((/** @type {?} */ (this.viewRef.rootNodes[0])));
                }
            }
            else if (this.viewRef) {
                this.viewContainerRef.detach(this.viewContainerRef.indexOf(this.viewRef));
            }
        }));
    }
}
CdkRowHoverContent.decorators = [
    { type: Directive, args: [{
                selector: '[cdkRowHoverContent]',
            },] }
];
/** @nocollapse */
CdkRowHoverContent.ctorParameters = () => [
    { type: EditServices },
    { type: ElementRef },
    { type: TemplateRef },
    { type: ViewContainerRef }
];
if (false) {
    /**
     * @type {?}
     * @protected
     */
    CdkRowHoverContent.prototype.destroyed;
    /**
     * @type {?}
     * @protected
     */
    CdkRowHoverContent.prototype.viewRef;
    /**
     * @type {?}
     * @private
     */
    CdkRowHoverContent.prototype._row;
    /**
     * @type {?}
     * @protected
     */
    CdkRowHoverContent.prototype.services;
    /**
     * @type {?}
     * @protected
     */
    CdkRowHoverContent.prototype.elementRef;
    /**
     * @type {?}
     * @protected
     */
    CdkRowHoverContent.prototype.templateRef;
    /**
     * @type {?}
     * @protected
     */
    CdkRowHoverContent.prototype.viewContainerRef;
}
/**
 * Opens the closest edit popover to this element, whether it's associated with this exact
 * element or an ancestor element.
 */
class CdkEditOpen {
    /**
     * @param {?} elementRef
     * @param {?} editEventDispatcher
     */
    constructor(elementRef, editEventDispatcher) {
        this.elementRef = elementRef;
        this.editEventDispatcher = editEventDispatcher;
        /** @type {?} */
        const nativeElement = elementRef.nativeElement;
        // Prevent accidental form submits.
        if (nativeElement.nodeName === 'BUTTON' && !nativeElement.getAttribute('type')) {
            nativeElement.setAttribute('type', 'button');
        }
    }
    // In Ivy the `host` metadata will be merged, whereas in ViewEngine it is overridden. In order
    // to avoid double event listeners, we need to use `HostListener`. Once Ivy is the default, we
    // can move this back into `host`.
    // tslint:disable:no-host-decorator-in-concrete
    /**
     * @param {?} evt
     * @return {?}
     */
    openEdit(evt) {
        this.editEventDispatcher.editing.next(closest((/** @type {?} */ (this.elementRef.nativeElement)), CELL_SELECTOR));
        evt.stopPropagation();
    }
}
CdkEditOpen.decorators = [
    { type: Directive, args: [{
                selector: '[cdkEditOpen]',
            },] }
];
/** @nocollapse */
CdkEditOpen.ctorParameters = () => [
    { type: ElementRef },
    { type: EditEventDispatcher }
];
CdkEditOpen.propDecorators = {
    openEdit: [{ type: HostListener, args: ['click', ['$event'],] }]
};
if (false) {
    /**
     * @type {?}
     * @protected
     */
    CdkEditOpen.prototype.elementRef;
    /**
     * @type {?}
     * @protected
     */
    CdkEditOpen.prototype.editEventDispatcher;
}

/**
 * @fileoverview added by tsickle
 * Generated from: src/cdk-experimental/popover-edit/popover-edit-module.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/** @type {?} */
const EXPORTED_DECLARATIONS = [
    CdkPopoverEdit,
    CdkPopoverEditTabOut,
    CdkRowHoverContent,
    CdkEditControl,
    CdkEditRevert,
    CdkEditClose,
    CdkEditable,
    CdkEditOpen,
];
class CdkPopoverEditModule {
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

/**
 * @fileoverview added by tsickle
 * Generated from: src/cdk-experimental/popover-edit/public-api.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */

/**
 * Generated bundle index. Do not edit.
 */

export { CdkEditClose, CdkEditControl, CdkEditOpen, CdkEditRevert, CdkEditable, CdkPopoverEdit, CdkPopoverEditModule, CdkPopoverEditTabOut, CdkRowHoverContent, DefaultPopoverEditPositionStrategyFactory, EditEventDispatcher, EditRef, FocusDispatcher, FormValueContainer, PopoverEditPositionStrategyFactory, CELL_SELECTOR as _CELL_SELECTOR, closest as _closest, matches as _matches, EditServices as ɵangular_material_src_cdk_experimental_popover_edit_popover_edit_a, FocusEscapeNotifierFactory as ɵangular_material_src_cdk_experimental_popover_edit_popover_edit_b };
//# sourceMappingURL=popover-edit.js.map
