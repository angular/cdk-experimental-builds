/**
 * @fileoverview added by tsickle
 * Generated from: src/cdk-experimental/popover-edit/edit-event-dispatcher.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Injectable, NgZone } from '@angular/core';
import { combineLatest, Observable, pipe, Subject } from 'rxjs';
import { audit, auditTime, debounceTime, distinctUntilChanged, filter, map, share, skip, startWith, } from 'rxjs/operators';
import { CELL_SELECTOR, ROW_SELECTOR } from './constants';
import { closest } from './polyfill';
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
export { HoverContentState };
/**
 * Service for sharing delegated events and state for triggering table edits.
 */
export class EditEventDispatcher {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdC1ldmVudC1kaXNwYXRjaGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvcG9wb3Zlci1lZGl0L2VkaXQtZXZlbnQtZGlzcGF0Y2hlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFRQSxPQUFPLEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUNqRCxPQUFPLEVBQUMsYUFBYSxFQUE0QixVQUFVLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUN4RixPQUFPLEVBQ0wsS0FBSyxFQUNMLFNBQVMsRUFDVCxZQUFZLEVBQ1osb0JBQW9CLEVBQ3BCLE1BQU0sRUFDTixHQUFHLEVBQ0gsS0FBSyxFQUNMLElBQUksRUFDSixTQUFTLEdBQ1YsTUFBTSxnQkFBZ0IsQ0FBQztBQUV4QixPQUFPLEVBQUMsYUFBYSxFQUFFLFlBQVksRUFBQyxNQUFNLGFBQWEsQ0FBQztBQUN4RCxPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sWUFBWSxDQUFDOzs7OztNQUk3QixvQkFBb0IsR0FBRyxFQUFFOzs7OztNQUd6QixXQUFXLEdBQUcsQ0FBQzs7QUFRckIsTUFBa0IsaUJBQWlCO0lBQ2pDLEdBQUcsR0FBSTtJQUNQLFNBQVMsR0FBQTtJQUNULEVBQUUsR0FBQTtFQUNIOzs7OztBQU1ELE1BQU0sT0FBTyxtQkFBbUI7Ozs7SUF1RzlCLFlBQTZCLE9BQWU7UUFBZixZQUFPLEdBQVAsT0FBTyxDQUFROzs7O1FBckduQyxZQUFPLEdBQUcsSUFBSSxPQUFPLEVBQWdCLENBQUM7Ozs7UUFHdEMsYUFBUSxHQUFHLElBQUksT0FBTyxFQUFnQixDQUFDOzs7O1FBR3ZDLFlBQU8sR0FBRyxJQUFJLE9BQU8sRUFBZ0IsQ0FBQzs7OztRQUd0QyxZQUFPLEdBQUcsSUFBSSxPQUFPLEVBQVksQ0FBQzs7OztRQUdsQyxjQUFTLEdB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LEtBQUssRUFBRTtZQUNULGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxLQUFLLGFBQXVCLENBQUM7U0FDcEQ7S0FDRjtJQUVELE9BQU8saUJBQWlCLENBQUM7QUFDM0IsQ0FBQzs7Ozs7OztBQUVELFNBQVMsa0JBQWtCLENBQU8sQ0FBWSxFQUFFLENBQVk7SUFDMUQsSUFBSSxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxJQUFJLEVBQUU7UUFDckIsT0FBTyxLQUFLLENBQUM7S0FDZDtJQUVELHVEQUF1RDtJQUN2RCxLQUFLLE1BQU0sSUFBSSxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUU7UUFDdkMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDL0IsT0FBTyxLQUFLLENBQUM7U0FDZDtLQUNGO0lBRUQsT0FBTyxJQUFJLENBQUM7QUFDZCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SW5qZWN0YWJsZSwgTmdab25lfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7Y29tYmluZUxhdGVzdCwgTW9ub1R5cGVPcGVyYXRvckZ1bmN0aW9uLCBPYnNlcnZhYmxlLCBwaXBlLCBTdWJqZWN0fSBmcm9tICdyeGpzJztcbmltcG9ydCB7XG4gIGF1ZGl0LFxuICBhdWRpdFRpbWUsXG4gIGRlYm91bmNlVGltZSxcbiAgZGlzdGluY3RVbnRpbENoYW5nZWQsXG4gIGZpbHRlcixcbiAgbWFwLFxuICBzaGFyZSxcbiAgc2tpcCxcbiAgc3RhcnRXaXRoLFxufSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbmltcG9ydCB7Q0VMTF9TRUxFQ1RPUiwgUk9XX1NFTEVDVE9SfSBmcm9tICcuL2NvbnN0YW50cyc7XG5pbXBvcnQge2Nsb3Nlc3R9IGZyb20gJy4vcG9seWZpbGwnO1xuaW1wb3J0IHtFZGl0UmVmfSBmcm9tICcuL2VkaXQtcmVmJztcblxuLyoqIFRoZSBkZWxheSBhcHBsaWVkIHRvIG1vdXNlIGV2ZW50cyBiZWZvcmUgaGlkaW5nIG9yIHNob3dpbmcgaG92ZXIgY29udGVudC4gKi9cbmNvbnN0IE1PVVNFX0VWRU5UX0RFTEFZX01TID0gNDA7XG5cbi8qKiBUaGUgZGVsYXkgZm9yIHJlYWN0aW5nIHRvIGZvY3VzL2JsdXIgY2hhbmdlcy4gKi9cbmNvbnN0IEZPQ1VTX0RFTEFZID0gMDtcblxuLyoqXG4gKiBUaGUgcG9zc2libGUgc3RhdGVzIGZvciBob3ZlciBjb250ZW50OlxuICogT0ZGIC0gTm90IHJlbmRlcmVkLlxuICogRk9DVVNBQkxFIC0gUmVuZGVyZWQgaW4gdGhlIGRvbSBhbmQgc3R5bHllZCBmb3IgaXRzIGNvbnRlbnRzIHRvIGJlIGZvY3VzYWJsZSBidXQgaW52aXNpYmxlLlxuICogT04gLSBSZW5kZXJlZCBhbmQgZnVsbHkgdmlzaWJsZS5cbiAqL1xuZXhwb3J0IGNvbnN0IGVudW0gSG92ZXJDb250ZW50U3RhdGUge1xuICBPRkYgPSAwLFxuICBGT0NVU0FCTEUsXG4gIE9OLFxufVxuXG4vKipcbiAqIFNlcnZpY2UgZm9yIHNoYXJpbmcgZGVsZWdhdGVkIGV2ZW50cyBhbmQgc3RhdGUgZm9yIHRyaWdnZXJpbmcgdGFibGUgZWRpdHMuXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBFZGl0RXZlbnREaXNwYXRjaGVyIHtcbiAgLyoqIEEgc3ViamVjdCB0aGF0IGluZGljYXRlcyB3aGljaCB0YWJsZSBjZWxsIGlzIGN1cnJlbnRseSBlZGl0aW5nICh1bmxlc3MgaXQgaXMgZGlzYWJsZWQpLiAqL1xuICByZWFkb25seSBlZGl0aW5nID0gbmV3IFN1YmplY3Q8RWxlbWVudHxudWxsPigpO1xuXG4gIC8qKiBBIHN1YmplY3QgdGhhdCBpbmRpY2F0ZXMgd2hpY2ggdGFibGUgcm93IGlzIGN1cnJlbnRseSBob3ZlcmVkLiAqL1xuICByZWFkb25seSBob3ZlcmluZyA9IG5ldyBTdWJqZWN0PEVsZW1lbnR8bnVsbD4oKTtcblxuICAvKiogQSBzdWJqZWN0IHRoYXQgaW5kaWNhdGVzIHdoaWNoIHRhYmxlIHJvdyBjdXJyZW50bHkgY29udGFpbnMgZm9jdXMuICovXG4gIHJlYWRvbmx5IGZvY3VzZWQgPSBuZXcgU3ViamVjdDxFbGVtZW50fG51bGw+KCk7XG5cbiAgLyoqIEEgc3ViamVjdCB0aGF0IGluZGljYXRlcyBhbGwgZWxlbWVudHMgaW4gdGhlIHRhYmxlIG1hdGNoaW5nIFJPV19TRUxFQ1RPUi4gKi9cbiAgcmVhZG9ubHkgYWxsUm93cyA9IG5ldyBTdWJqZWN0PE5vZGVMaXN0PigpO1xuXG4gIC8qKiBBIHN1YmplY3QgdGhhdCBlbWl0cyBtb3VzZSBtb3ZlIGV2ZW50cyBmcm9tIHRoZSB0YWJsZSBpbmRpY2F0aW5nIHRoZSB0YXJnZXRlZCByb3cuICovXG4gIHJlYWRvbmx5IG1vdXNlTW92ZSA9IG5ldyBTdWJqZWN0PEVsZW1lbnR8bnVsbD4oKTtcblxuICAvLyBUT0RPOiBVc2UgV2Vha1NldCBvbmNlIElFMTEgc3VwcG9ydCBpcyBkcm9wcGVkLlxuICAvKipcbiAgICogVHJhY2tzIHRoZSBjdXJyZW50bHkgZGlzYWJsZWQgZWRpdGFibGUgY2VsbHMgLSBlZGl0IGNhbGxzIHdpbGwgYmUgaWdub3JlZFxuICAgKiBmb3IgdGhlc2UgY2VsbHMuXG4gICAqL1xuICByZWFkb25seSBkaXNhYmxlZENlbGxzID0gbmV3IFdlYWtNYXA8RWxlbWVudCwgYm9vbGVhbj4oKTtcblxuICAvKiogVGhlIEVkaXRSZWYgZm9yIHRoZSBjdXJyZW50bHkgYWN0aXZlIGVkaXQgbGVucyAoaWYgYW55KS4gKi9cbiAgZ2V0IGVkaXRSZWYoKTogRWRpdFJlZjxhbnk+fG51bGwge1xuICAgIHJldHVybiB0aGlzLl9lZGl0UmVmO1xuICB9XG4gIHByaXZhdGUgX2VkaXRSZWY6IEVkaXRSZWY8YW55PnxudWxsID0gbnVsbDtcblxuICAvLyBPcHRpbWl6YXRpb246IFByZWNvbXB1dGUgY29tbW9uIHBpcGVhYmxlIG9wZXJhdG9ycyB1c2VkIHBlciByb3cvY2VsbC5cbiAgcHJpdmF0ZSByZWFkb25seSBfZGlzdGluY3RVbnRpbENoYW5nZWQgPVxuICAgICAgZGlzdGluY3RVbnRpbENoYW5nZWQ8RWxlbWVudHxIb3ZlckNvbnRlbnRTdGF0ZXxib29sZWFufG51bGw+KCk7XG4gIHByaXZhdGUgcmVhZG9ubHkgX3N0YXJ0V2l0aE51bGwgPSBzdGFydFdpdGg8RWxlbWVudHxudWxsPihudWxsKTtcbiAgcHJpdmF0ZSByZWFkb25seSBfZGlzdGluY3RTaGFyZSA9IHBpcGUoXG4gICAgdGhpcy5fZGlzdGluY3RVbnRpbENoYW5nZWQgYXMgTW9ub1R5cGVPcGVyYXRvckZ1bmN0aW9uPEhvdmVyQ29udGVudFN0YXRlPixcbiAgICBzaGFyZSgpLFxuICApO1xuICBwcml2YXRlIHJlYWRvbmx5IF9zdGFydFdpdGhOdWxsRGlzdGluY3QgPSBwaXBlKFxuICAgIHRoaXMuX3N0YXJ0V2l0aE51bGwsXG4gICAgdGhpcy5fZGlzdGluY3RVbnRpbENoYW5nZWQgYXMgTW9ub1R5cGVPcGVyYXRvckZ1bmN0aW9uPEVsZW1lbnR8bnVsbD4sXG4gICk7XG5cbiAgcmVhZG9ubHkgZWRpdGluZ0FuZEVuYWJsZWQgPSB0aGlzLmVkaXRpbmcucGlwZShcbiAgICAgIGZpbHRlcihjZWxsID0+IGNlbGwgPT0gbnVsbCB8fCAhdGhpcy5kaXNhYmxlZENlbGxzLmhhcyhjZWxsKSksXG4gICAgICBzaGFyZSgpLFxuICApO1xuXG4gIC8qKiBBbiBvYnNlcnZhYmxlIHRoYXQgZW1pdHMgdGhlIHJvdyBjb250YWluaW5nIGZvY3VzIG9yIGFuIGFjdGl2ZSBlZGl0LiAqL1xuICByZWFkb25seSBlZGl0aW5nT3JGb2N1c2VkID0gY29tYmluZUxhdGVzdChbXG4gICAgICB0aGlzLmVkaXRpbmdBbmRFbmFibGVkLnBpcGUoXG4gICAgICAgICAgbWFwKGNlbGwgPT4gY2xvc2VzdChjZWxsLCBST1dfU0VMRUNUT1IpKSxcbiAgICAgICAgICB0aGlzLl9zdGFydFdpdGhOdWxsLFxuICAgICAgKSxcbiAgICAgIHRoaXMuZm9jdXNlZC5waXBlKHRoaXMuX3N0YXJ0V2l0aE51bGwpLFxuICBdKS5waXBlKFxuICAgICAgbWFwKChbZWRpdGluZ1JvdywgZm9jdXNlZFJvd10pID0+IGZvY3VzZWRSb3cgfHwgZWRpdGluZ1JvdyksXG4gICAgICB0aGlzLl9kaXN0aW5jdFVudGlsQ2hhbmdlZCBhcyBNb25vVHlwZU9wZXJhdG9yRnVuY3Rpb248RWxlbWVudHxudWxsPixcbiAgICAgIGF1ZGl0VGltZShGT0NVU19ERUxBWSksIC8vIFVzZSBhdWRpdCB0byBza2lwIG92ZXIgYmx1ciBldmVudHMgdG8gdGhlIG5leHQgZm9jdXNlZCBlbGVtZW50LlxuICAgICAgdGhpcy5fZGlzdGluY3RVbnRpbENoYW5nZWQgYXMgTW9ub1R5cGVPcGVyYXRvckZ1bmN0aW9uPEVsZW1lbnR8bnVsbD4sXG4gICAgICBzaGFyZSgpLFxuICApO1xuXG4gIC8qKiBUcmFja3Mgcm93cyB0aGF0IGNvbnRhaW4gaG92ZXIgY29udGVudCB3aXRoIGEgcmVmZXJlbmNlIGNvdW50LiAqL1xuICBwcml2YXRlIF9yb3dzV2l0aEhvdmVyQ29udGVudCA9IG5ldyBXZWFrTWFwPEVsZW1lbnQsIG51bWJlcj4oKTtcblxuICAvKiogVGhlIHRhYmxlIGNlbGwgdGhhdCBoYXMgYW4gYWN0aXZlIGVkaXQgbGVucyAob3IgbnVsbCkuICovXG4gIHByaXZhdGUgX2N1cnJlbnRseUVkaXRpbmc6IEVsZW1lbnR8bnVsbCA9IG51bGw7XG5cbiAgLyoqIFRoZSBjb21iaW5lZCBzZXQgb2Ygcm93IGhvdmVyIGNvbnRlbnQgc3RhdGVzIG9yZ2FuaXplZCBieSByb3cuICovXG4gIHByaXZhdGUgcmVhZG9ubHkgX2hvdmVyZWRDb250ZW50U3RhdGVEaXN0aW5jdCA9IGNvbWJpbmVMYXRlc3QoW1xuICAgICAgdGhpcy5fZ2V0Rmlyc3RSb3dXaXRoSG92ZXJDb250ZW50KCksXG4gICAgICB0aGlzLl9nZXRMYXN0Um93V2l0aEhvdmVyQ29udGVudCgpLFxuICAgICAgdGhpcy5lZGl0aW5nT3JGb2N1c2VkLFxuICAgICAgdGhpcy5ob3ZlcmluZy5waXBlKFxuICAgICAgICAgIGRpc3RpbmN0VW50aWxDaGFuZ2VkKCksXG4gICAgICAgICAgYXVkaXQocm93ID0+IHRoaXMubW91c2VNb3ZlLnBpcGUoXG4gICAgICAgICAgICAgIGZpbHRlcihtb3VzZU1vdmVSb3cgPT4gcm93ID09PSBtb3VzZU1vdmVSb3cpLFxuICAgICAgICAgICAgICB0aGlzLl9zdGFydFdpdGhOdWxsLFxuICAgICAgICAgICAgICBkZWJvdW5jZVRpbWUoTU9VU0VfRVZFTlRfREVMQVlfTVMpKSxcbiAgICAgICAgICApLFxuICAgICAgICAgIHRoaXMuX3N0YXJ0V2l0aE51bGxEaXN0aW5jdCxcbiAgICAgICksXG4gIF0pLnBpcGUoXG4gICAgICBza2lwKDEpLCAvLyBTa2lwIHRoZSBpbml0aWFsIGVtaXNzaW9uIG9mIFtudWxsLCBudWxsLCBudWxsLCBudWxsXS5cbiAgICAgIG1hcChjb21wdXRlSG92ZXJDb250ZW50U3RhdGUpLFxuICAgICAgZGlzdGluY3RVbnRpbENoYW5nZWQoYXJlTWFwRW50cmllc0VxdWFsKSxcbiAgICAgIC8vIE9wdGltaXphdGlvbjogRW50ZXIgdGhlIHpvbmUgYmVmb3JlIHNoYXJlKCkgc28gdGhhdCB3ZSB0cmlnZ2VyIGEgc2luZ2xlXG4gICAgICAvLyBBcHBsaWNhdGlvblJlZi50aWNrIGZvciBhbGwgcm93IHVwZGF0ZXMuXG4gICAgICB0aGlzLl9lbnRlclpvbmUoKSxcbiAgICAgIHNoYXJlKCksXG4gICk7XG5cbiAgcHJpdmF0ZSByZWFkb25seSBfZWRpdGluZ0FuZEVuYWJsZWREaXN0aW5jdCA9IHRoaXMuZWRpdGluZ0FuZEVuYWJsZWQucGlwZShcbiAgICAgIGRpc3RpbmN0VW50aWxDaGFuZ2VkKCksXG4gICAgICB0aGlzLl9lbnRlclpvbmUoKSxcbiAgICAgIHNoYXJlKCksXG4gICk7XG5cbiAgLy8gT3B0aW1pemF0aW9uOiBTaGFyZSByb3cgZXZlbnRzIG9ic2VydmFibGUgd2l0aCBzdWJzZXF1ZW50IGNhbGxlcnMuXG4gIC8vIEF0IHN0YXJ0dXAsIGNhbGxzIHdpbGwgYmUgc2VxdWVudGlhbCBieSByb3cuXG4gIHByaXZhdGUgX2xhc3RTZWVuUm93OiBFbGVtZW50fG51bGwgPSBudWxsO1xuICBwcml2YXRlIF9sYXN0U2VlblJvd0hvdmVyT3JGb2N1czogT2JzZXJ2YWJsZTxIb3ZlckNvbnRlbnRTdGF0ZT58bnVsbCA9IG51bGw7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSByZWFkb25seSBfbmdab25lOiBOZ1pvbmUpIHtcbiAgICB0aGlzLl9lZGl0aW5nQW5kRW5hYmxlZERpc3RpbmN0LnN1YnNjcmliZShjZWxsID0+IHtcbiAgICAgIHRoaXMuX2N1cnJlbnRseUVkaXRpbmcgPSBjZWxsO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgYW4gT2JzZXJ2YWJsZSB0aGF0IGVtaXRzIHRydWUgd2hlbiB0aGUgc3BlY2lmaWVkIGVsZW1lbnQncyBjZWxsXG4gICAqIGlzIGVkaXRpbmcgYW5kIGZhbHNlIHdoZW4gbm90LlxuICAgKi9cbiAgZWRpdGluZ0NlbGwoZWxlbWVudDogRWxlbWVudHxFdmVudFRhcmdldCk6IE9ic2VydmFibGU8Ym9vbGVhbj4ge1xuICAgIGxldCBjZWxsOiBFbGVtZW50fG51bGwgPSBudWxsO1xuXG4gICAgcmV0dXJuIHRoaXMuX2VkaXRpbmdBbmRFbmFibGVkRGlzdGluY3QucGlwZShcbiAgICAgICAgbWFwKGVkaXRDZWxsID0+IGVkaXRDZWxsID09PSAoY2VsbCB8fCAoY2VsbCA9IGNsb3Nlc3QoZWxlbWVudCwgQ0VMTF9TRUxFQ1RPUikpKSksXG4gICAgICAgIHRoaXMuX2Rpc3RpbmN0VW50aWxDaGFuZ2VkIGFzIE1vbm9UeXBlT3BlcmF0b3JGdW5jdGlvbjxib29sZWFuPixcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0b3BzIGVkaXRpbmcgZm9yIHRoZSBzcGVjaWZpZWQgY2VsbC4gSWYgdGhlIHNwZWNpZmllZCBjZWxsIGlzIG5vdCB0aGUgY3VycmVudFxuICAgKiBlZGl0IGNlbGwsIGRvZXMgbm90aGluZy5cbiAgICovXG4gIGRvbmVFZGl0aW5nQ2VsbChlbGVtZW50OiBFbGVtZW50fEV2ZW50VGFyZ2V0KTogdm9pZCB7XG4gICAgY29uc3QgY2VsbCA9IGNsb3Nlc3QoZWxlbWVudCwgQ0VMTF9TRUxFQ1RPUik7XG5cbiAgICBpZiAodGhpcy5fY3VycmVudGx5RWRpdGluZyA9PT0gY2VsbCkge1xuICAgICAgdGhpcy5lZGl0aW5nLm5leHQobnVsbCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFNldHMgdGhlIGN1cnJlbnRseSBhY3RpdmUgRWRpdFJlZi4gKi9cbiAgc2V0QWN0aXZlRWRpdFJlZihyZWY6IEVkaXRSZWY8YW55Pikge1xuICAgIHRoaXMuX2VkaXRSZWYgPSByZWY7XG4gIH1cblxuICAvKiogVW5zZXRzIHRoZSBjdXJyZW50bHkgYWN0aXZlIEVkaXRSZWYsIGlmIHRoZSBzcGVjaWZpZWQgZWRpdFJlZiBpcyBhY3RpdmUuICovXG4gIHVuc2V0QWN0aXZlRWRpdFJlZihyZWY6IEVkaXRSZWY8YW55Pikge1xuICAgIGlmICh0aGlzLl9lZGl0UmVmICE9PSByZWYpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl9lZGl0UmVmID0gbnVsbDtcbiAgfVxuXG4gIC8qKiBBZGRzIHRoZSBzcGVjaWZpZWQgdGFibGUgcm93IHRvIGJlIHRyYWNrZWQgZm9yIGZpcnN0L2xhc3Qgcm93IGNvbXBhcmlzb25zLiAqL1xuICByZWdpc3RlclJvd1dpdGhIb3ZlckNvbnRlbnQocm93OiBFbGVtZW50KTogdm9pZCB7XG4gICAgdGhpcy5fcm93c1dpdGhIb3ZlckNvbnRlbnQuc2V0KHJvdywgKHRoaXMuX3Jvd3NXaXRoSG92ZXJDb250ZW50LmdldChyb3cpIHx8IDApICsgMSk7XG4gIH1cblxuICAvKipcbiAgICogUmVmZXJlbmNlIGRlY3JlbWVudHMgYW5kIHVsdGltYXRlbHkgcmVtb3ZlcyB0aGUgc3BlY2lmaWVkIHRhYmxlIHJvdyBmcm9tIGZpcnN0L2xhc3Qgcm93XG4gICAqIGNvbXBhcmlzb25zLlxuICAgKi9cbiAgZGVyZWdpc3RlclJvd1dpdGhIb3ZlckNvbnRlbnQocm93OiBFbGVtZW50KTogdm9pZCB7XG4gICAgY29uc3QgcmVmQ291bnQgPSB0aGlzLl9yb3dzV2l0aEhvdmVyQ29udGVudC5nZXQocm93KSB8fCAwO1xuXG4gICAgaWYgKHJlZkNvdW50IDw9IDEpIHtcbiAgICAgIHRoaXMuX3Jvd3NXaXRoSG92ZXJDb250ZW50LmRlbGV0ZShyb3cpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9yb3dzV2l0aEhvdmVyQ29udGVudC5zZXQocm93LCByZWZDb3VudCAtIDEpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIGFuIE9ic2VydmFibGUgdGhhdCBlbWl0cyB0cnVlIHdoZW4gdGhlIHNwZWNpZmllZCBlbGVtZW50J3Mgcm93XG4gICAqIGNvbnRhaW5zIHRoZSBmb2N1c2VkIGVsZW1lbnQgb3IgaXMgYmVpbmcgaG92ZXJlZCBvdmVyIGFuZCBmYWxzZSB3aGVuIG5vdC5cbiAgICogSG92ZXJpbmcgaXMgZGVmaW5lZCBhcyB3aGVuIHRoZSBtb3VzZSBoYXMgbW9tZW50YXJpbHkgc3RvcHBlZCBtb3Zpbmcgb3ZlciB0aGUgY2VsbC5cbiAgICovXG4gIGhvdmVyT3JGb2N1c09uUm93KHJvdzogRWxlbWVudCk6IE9ic2VydmFibGU8SG92ZXJDb250ZW50U3RhdGU+IHtcbiAgICBpZiAocm93ICE9PSB0aGlzLl9sYXN0U2VlblJvdykge1xuICAgICAgdGhpcy5fbGFzdFNlZW5Sb3cgPSByb3c7XG4gICAgICB0aGlzLl9sYXN0U2VlblJvd0hvdmVyT3JGb2N1cyA9IHRoaXMuX2hvdmVyZWRDb250ZW50U3RhdGVEaXN0aW5jdC5waXBlKFxuICAgICAgICBtYXAoc3RhdGUgPT4gc3RhdGUuZ2V0KHJvdykgfHwgSG92ZXJDb250ZW50U3RhdGUuT0ZGKSxcbiAgICAgICAgdGhpcy5fZGlzdGluY3RTaGFyZSxcbiAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX2xhc3RTZWVuUm93SG92ZXJPckZvY3VzITtcbiAgfVxuXG4gIC8qKlxuICAgKiBSeEpTIG9wZXJhdG9yIHRoYXQgZW50ZXJzIHRoZSBBbmd1bGFyIHpvbmUsIHVzZWQgdG8gcmVkdWNlIGJvaWxlcnBsYXRlIGluXG4gICAqIHJlLWVudGVyaW5nIHRoZSB6b25lIGZvciBzdHJlYW0gcGlwZWxpbmVzLlxuICAgKi9cbiAgcHJpdmF0ZSBfZW50ZXJab25lPFQ+KCk6IE1vbm9UeXBlT3BlcmF0b3JGdW5jdGlvbjxUPiB7XG4gICAgcmV0dXJuIChzb3VyY2U6IE9ic2VydmFibGU8VD4pID0+XG4gICAgICAgIG5ldyBPYnNlcnZhYmxlPFQ+KChvYnNlcnZlcikgPT4gc291cmNlLnN1YnNjcmliZSh7XG4gICAgICAgICAgICAgbmV4dDogKHZhbHVlKSA9PiB0aGlzLl9uZ1pvbmUucnVuKCgpID0+IG9ic2VydmVyLm5leHQodmFsdWUpKSxcbiAgICAgICAgICAgICBlcnJvcjogKGVycikgPT4gb2JzZXJ2ZXIuZXJyb3IoZXJyKSxcbiAgICAgICAgICAgICBjb21wbGV0ZTogKCkgPT4gb2JzZXJ2ZXIuY29tcGxldGUoKVxuICAgICAgICAgICB9KSk7XG4gIH1cblxuICBwcml2YXRlIF9nZXRGaXJzdFJvd1dpdGhIb3ZlckNvbnRlbnQoKTogT2JzZXJ2YWJsZTxFbGVtZW50fG51bGw+IHtcbiAgICByZXR1cm4gdGhpcy5fbWFwQWxsUm93c1RvU2luZ2xlUm93KHJvd3MgPT4ge1xuICAgICAgZm9yIChsZXQgaSA9IDAsIHJvdzsgcm93ID0gcm93c1tpXTsgaSsrKSB7XG4gICAgICAgIGlmICh0aGlzLl9yb3dzV2l0aEhvdmVyQ29udGVudC5oYXMocm93IGFzIEVsZW1lbnQpKSB7XG4gICAgICAgICAgcmV0dXJuIHJvdyBhcyBFbGVtZW50O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX2dldExhc3RSb3dXaXRoSG92ZXJDb250ZW50KCk6IE9ic2VydmFibGU8RWxlbWVudHxudWxsPiB7XG4gICAgcmV0dXJuIHRoaXMuX21hcEFsbFJvd3NUb1NpbmdsZVJvdyhyb3dzID0+IHtcbiAgICAgIGZvciAobGV0IGkgPSByb3dzLmxlbmd0aCAtIDEsIHJvdzsgcm93ID0gcm93c1tpXTsgaS0tKSB7XG4gICAgICAgIGlmICh0aGlzLl9yb3dzV2l0aEhvdmVyQ29udGVudC5oYXMocm93IGFzIEVsZW1lbnQpKSB7XG4gICAgICAgICAgcmV0dXJuIHJvdyBhcyBFbGVtZW50O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX21hcEFsbFJvd3NUb1NpbmdsZVJvdyhtYXBwZXI6IChyb3dzOiBOb2RlTGlzdCkgPT4gRWxlbWVudHxudWxsKTpcbiAgICAgIE9ic2VydmFibGU8RWxlbWVudHxudWxsPiB7XG4gICAgcmV0dXJuIHRoaXMuYWxsUm93cy5waXBlKFxuICAgICAgICBtYXAobWFwcGVyKSxcbiAgICAgICAgdGhpcy5fc3RhcnRXaXRoTnVsbERpc3RpbmN0LFxuICAgICk7XG4gIH1cbn1cblxuZnVuY3Rpb24gY29tcHV0ZUhvdmVyQ29udGVudFN0YXRlKFtmaXJzdFJvdywgbGFzdFJvdywgYWN0aXZlUm93LCBob3ZlclJvd106IEFycmF5PEVsZW1lbnR8bnVsbD4pOlxuICAgICBNYXA8RWxlbWVudCwgSG92ZXJDb250ZW50U3RhdGU+IHtcbiAgY29uc3QgaG92ZXJDb250ZW50U3RhdGUgPSBuZXcgTWFwPEVsZW1lbnQsIEhvdmVyQ29udGVudFN0YXRlPigpO1xuXG4gIC8vIEFkZCBmb2N1c2FibGUgcm93cy5cbiAgZm9yIChjb25zdCBmb2N1c3NhYmxlUm93IG9mIFtcbiAgICBmaXJzdFJvdyxcbiAgICBsYXN0Um93LFxuICAgIGFjdGl2ZVJvdyAmJiBhY3RpdmVSb3cucHJldmlvdXNFbGVtZW50U2libGluZyxcbiAgICBhY3RpdmVSb3cgJiYgYWN0aXZlUm93Lm5leHRFbGVtZW50U2libGluZyxcbiAgXSkge1xuICAgIGlmIChmb2N1c3NhYmxlUm93KSB7XG4gICAgICBob3ZlckNvbnRlbnRTdGF0ZS5zZXQoZm9jdXNzYWJsZVJvdyBhcyBFbGVtZW50LCBIb3ZlckNvbnRlbnRTdGF0ZS5GT0NVU0FCTEUpO1xuICAgIH1cbiAgfVxuXG4gIC8vIEFkZC9vdmVyd3JpdGUgd2l0aCBmdWxseSB2aXNpYmxlIHJvd3MuXG4gIGZvciAoY29uc3Qgb25Sb3cgb2YgW2FjdGl2ZVJvdywgaG92ZXJSb3ddKSB7XG4gICAgaWYgKG9uUm93KSB7XG4gICAgICBob3ZlckNvbnRlbnRTdGF0ZS5zZXQob25Sb3csIEhvdmVyQ29udGVudFN0YXRlLk9OKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gaG92ZXJDb250ZW50U3RhdGU7XG59XG5cbmZ1bmN0aW9uIGFyZU1hcEVudHJpZXNFcXVhbDxLLCBWPihhOiBNYXA8SywgVj4sIGI6IE1hcDxLLCBWPik6IGJvb2xlYW4ge1xuICBpZiAoYS5zaXplICE9PSBiLnNpemUpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBUT0RPOiB1c2UgTWFwLnByb3RvdHlwZS5lbnRyaWVzIG9uY2Ugd2UncmUgb2ZmIElFMTEuXG4gIGZvciAoY29uc3QgYUtleSBvZiBBcnJheS5mcm9tKGEua2V5cygpKSkge1xuICAgIGlmIChiLmdldChhS2V5KSAhPT0gYS5nZXQoYUtleSkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn1cbiJdfQ==