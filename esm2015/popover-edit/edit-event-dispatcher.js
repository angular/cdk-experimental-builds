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
import { audit, auditTime, debounceTime, distinctUntilChanged, filter, map, skip, startWith, shareReplay, } from 'rxjs/operators';
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
let EditEventDispatcher = /** @class */ (() => {
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
            this._distinctShare = pipe((/** @type {?} */ (this._distinctUntilChanged)), shareReplay(1));
            this._startWithNullDistinct = pipe(this._startWithNull, (/** @type {?} */ (this._distinctUntilChanged)));
            this.editingAndEnabled = this.editing.pipe(filter((/**
             * @param {?} cell
             * @return {?}
             */
            cell => cell == null || !this.disabledCells.has(cell))), shareReplay(1));
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
            ([editingRow, focusedRow]) => focusedRow || editingRow)), (/** @type {?} */ (this._distinctUntilChanged)), auditTime(FOCUS_DELAY), (/** @type {?} */ (this._distinctUntilChanged)), shareReplay(1));
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
            // Optimization: Enter the zone before shareReplay so that we trigger a single
            // ApplicationRef.tick for all row updates.
            this._enterZone(), shareReplay(1));
            this._editingAndEnabledDistinct = this.editingAndEnabled.pipe(distinctUntilChanged(), this._enterZone(), shareReplay(1));
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
    return EditEventDispatcher;
})();
export { EditEventDispatcher };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdC1ldmVudC1kaXNwYXRjaGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvcG9wb3Zlci1lZGl0L2VkaXQtZXZlbnQtZGlzcGF0Y2hlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFRQSxPQUFPLEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUNqRCxPQUFPLEVBQUMsYUFBYSxFQUE0QixVQUFVLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUN4RixPQUFPLEVBQ0wsS0FBSyxFQUNMLFNBQVMsRUFDVCxZQUFZLEVBQ1osb0JBQW9CLEVBQ3BCLE1BQU0sRUFDTixHQUFHLEVBQ0gsSUFBSSxFQUNKLFNBQVMsRUFDVCxXQUFXLEdBQ1osTUFBTSxnQkFBZ0IsQ0FBQztBQUV4QixPQUFPLEVBQUMsYUFBYSxFQUFFLFlBQVksRUFBQyxNQUFNLGFBQWEsQ0FBQztBQUN4RCxPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sWUFBWSxDQUFDOzs7OztNQUk3QixvQkFBb0IsR0FBRyxFQUFFOzs7OztNQUd6QixXQUFXLEdBQUcsQ0FBQzs7QUFRckIsTUFBa0IsaUJBQWlCO0lBQ2pDLEdBQUcsR0FBSTtJQUNQLFNBQVMsR0FBQTtJQUNULEVBQUUsR0FBQTtFQUNIOzs7OztBQUtEOzs7O0lBQUEsTUFDYSxtQkFBbUI7Ozs7UUF1RzlCLFlBQTZCLE9BQWU7WUFBZixZQUFPLEdBQVAsT0FBTyxDQUFROzs7O1lBckduQyxZQUFPLEdBQUcsSUFBSSxPQUFPLEVBQWdCLENBQUM7Ozs7WUFHdEMsYUFBUSxHQUFHLElBQUksT0FBTyxFQUFnQixDQUFDOzs7O1lBR3ZDLFlBQU8sR0FBRyxJQUFJLE9BQU8sRUFBZ0IsQ0FBQzs7OztZQUd0QyxZQUFPLEdBQUcsSUFBSSxPQUFPLEVBQVksQ0FBQzs7OztZQUdsQyxjQUFT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LENBQUMsbUJBQUEsYUFBYSxFQUFXLG9CQUE4QixDQUFDO1NBQzlFO0tBQ0Y7SUFFRCx5Q0FBeUM7SUFDekMsS0FBSyxNQUFNLEtBQUssSUFBSSxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsRUFBRTtRQUN6QyxJQUFJLEtBQUssRUFBRTtZQUNULGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxLQUFLLGFBQXVCLENBQUM7U0FDcEQ7S0FDRjtJQUVELE9BQU8saUJBQWlCLENBQUM7QUFDM0IsQ0FBQzs7Ozs7OztBQUVELFNBQVMsa0JBQWtCLENBQU8sQ0FBWSxFQUFFLENBQVk7SUFDMUQsSUFBSSxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxJQUFJLEVBQUU7UUFDckIsT0FBTyxLQUFLLENBQUM7S0FDZDtJQUVELHVEQUF1RDtJQUN2RCxLQUFLLE1BQU0sSUFBSSxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUU7UUFDdkMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDL0IsT0FBTyxLQUFLLENBQUM7U0FDZDtLQUNGO0lBRUQsT0FBTyxJQUFJLENBQUM7QUFDZCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SW5qZWN0YWJsZSwgTmdab25lfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7Y29tYmluZUxhdGVzdCwgTW9ub1R5cGVPcGVyYXRvckZ1bmN0aW9uLCBPYnNlcnZhYmxlLCBwaXBlLCBTdWJqZWN0fSBmcm9tICdyeGpzJztcbmltcG9ydCB7XG4gIGF1ZGl0LFxuICBhdWRpdFRpbWUsXG4gIGRlYm91bmNlVGltZSxcbiAgZGlzdGluY3RVbnRpbENoYW5nZWQsXG4gIGZpbHRlcixcbiAgbWFwLFxuICBza2lwLFxuICBzdGFydFdpdGgsXG4gIHNoYXJlUmVwbGF5LFxufSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbmltcG9ydCB7Q0VMTF9TRUxFQ1RPUiwgUk9XX1NFTEVDVE9SfSBmcm9tICcuL2NvbnN0YW50cyc7XG5pbXBvcnQge2Nsb3Nlc3R9IGZyb20gJy4vcG9seWZpbGwnO1xuaW1wb3J0IHtFZGl0UmVmfSBmcm9tICcuL2VkaXQtcmVmJztcblxuLyoqIFRoZSBkZWxheSBhcHBsaWVkIHRvIG1vdXNlIGV2ZW50cyBiZWZvcmUgaGlkaW5nIG9yIHNob3dpbmcgaG92ZXIgY29udGVudC4gKi9cbmNvbnN0IE1PVVNFX0VWRU5UX0RFTEFZX01TID0gNDA7XG5cbi8qKiBUaGUgZGVsYXkgZm9yIHJlYWN0aW5nIHRvIGZvY3VzL2JsdXIgY2hhbmdlcy4gKi9cbmNvbnN0IEZPQ1VTX0RFTEFZID0gMDtcblxuLyoqXG4gKiBUaGUgcG9zc2libGUgc3RhdGVzIGZvciBob3ZlciBjb250ZW50OlxuICogT0ZGIC0gTm90IHJlbmRlcmVkLlxuICogRk9DVVNBQkxFIC0gUmVuZGVyZWQgaW4gdGhlIGRvbSBhbmQgc3R5bGVkIGZvciBpdHMgY29udGVudHMgdG8gYmUgZm9jdXNhYmxlIGJ1dCBpbnZpc2libGUuXG4gKiBPTiAtIFJlbmRlcmVkIGFuZCBmdWxseSB2aXNpYmxlLlxuICovXG5leHBvcnQgY29uc3QgZW51bSBIb3ZlckNvbnRlbnRTdGF0ZSB7XG4gIE9GRiA9IDAsXG4gIEZPQ1VTQUJMRSxcbiAgT04sXG59XG5cbi8qKlxuICogU2VydmljZSBmb3Igc2hhcmluZyBkZWxlZ2F0ZWQgZXZlbnRzIGFuZCBzdGF0ZSBmb3IgdHJpZ2dlcmluZyB0YWJsZSBlZGl0cy5cbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEVkaXRFdmVudERpc3BhdGNoZXIge1xuICAvKiogQSBzdWJqZWN0IHRoYXQgaW5kaWNhdGVzIHdoaWNoIHRhYmxlIGNlbGwgaXMgY3VycmVudGx5IGVkaXRpbmcgKHVubGVzcyBpdCBpcyBkaXNhYmxlZCkuICovXG4gIHJlYWRvbmx5IGVkaXRpbmcgPSBuZXcgU3ViamVjdDxFbGVtZW50fG51bGw+KCk7XG5cbiAgLyoqIEEgc3ViamVjdCB0aGF0IGluZGljYXRlcyB3aGljaCB0YWJsZSByb3cgaXMgY3VycmVudGx5IGhvdmVyZWQuICovXG4gIHJlYWRvbmx5IGhvdmVyaW5nID0gbmV3IFN1YmplY3Q8RWxlbWVudHxudWxsPigpO1xuXG4gIC8qKiBBIHN1YmplY3QgdGhhdCBpbmRpY2F0ZXMgd2hpY2ggdGFibGUgcm93IGN1cnJlbnRseSBjb250YWlucyBmb2N1cy4gKi9cbiAgcmVhZG9ubHkgZm9jdXNlZCA9IG5ldyBTdWJqZWN0PEVsZW1lbnR8bnVsbD4oKTtcblxuICAvKiogQSBzdWJqZWN0IHRoYXQgaW5kaWNhdGVzIGFsbCBlbGVtZW50cyBpbiB0aGUgdGFibGUgbWF0Y2hpbmcgUk9XX1NFTEVDVE9SLiAqL1xuICByZWFkb25seSBhbGxSb3dzID0gbmV3IFN1YmplY3Q8Tm9kZUxpc3Q+KCk7XG5cbiAgLyoqIEEgc3ViamVjdCB0aGF0IGVtaXRzIG1vdXNlIG1vdmUgZXZlbnRzIGZyb20gdGhlIHRhYmxlIGluZGljYXRpbmcgdGhlIHRhcmdldGVkIHJvdy4gKi9cbiAgcmVhZG9ubHkgbW91c2VNb3ZlID0gbmV3IFN1YmplY3Q8RWxlbWVudHxudWxsPigpO1xuXG4gIC8vIFRPRE86IFVzZSBXZWFrU2V0IG9uY2UgSUUxMSBzdXBwb3J0IGlzIGRyb3BwZWQuXG4gIC8qKlxuICAgKiBUcmFja3MgdGhlIGN1cnJlbnRseSBkaXNhYmxlZCBlZGl0YWJsZSBjZWxscyAtIGVkaXQgY2FsbHMgd2lsbCBiZSBpZ25vcmVkXG4gICAqIGZvciB0aGVzZSBjZWxscy5cbiAgICovXG4gIHJlYWRvbmx5IGRpc2FibGVkQ2VsbHMgPSBuZXcgV2Vha01hcDxFbGVtZW50LCBib29sZWFuPigpO1xuXG4gIC8qKiBUaGUgRWRpdFJlZiBmb3IgdGhlIGN1cnJlbnRseSBhY3RpdmUgZWRpdCBsZW5zIChpZiBhbnkpLiAqL1xuICBnZXQgZWRpdFJlZigpOiBFZGl0UmVmPGFueT58bnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuX2VkaXRSZWY7XG4gIH1cbiAgcHJpdmF0ZSBfZWRpdFJlZjogRWRpdFJlZjxhbnk+fG51bGwgPSBudWxsO1xuXG4gIC8vIE9wdGltaXphdGlvbjogUHJlY29tcHV0ZSBjb21tb24gcGlwZWFibGUgb3BlcmF0b3JzIHVzZWQgcGVyIHJvdy9jZWxsLlxuICBwcml2YXRlIHJlYWRvbmx5IF9kaXN0aW5jdFVudGlsQ2hhbmdlZCA9XG4gICAgICBkaXN0aW5jdFVudGlsQ2hhbmdlZDxFbGVtZW50fEhvdmVyQ29udGVudFN0YXRlfGJvb2xlYW58bnVsbD4oKTtcbiAgcHJpdmF0ZSByZWFkb25seSBfc3RhcnRXaXRoTnVsbCA9IHN0YXJ0V2l0aDxFbGVtZW50fG51bGw+KG51bGwpO1xuICBwcml2YXRlIHJlYWRvbmx5IF9kaXN0aW5jdFNoYXJlID0gcGlwZShcbiAgICB0aGlzLl9kaXN0aW5jdFVudGlsQ2hhbmdlZCBhcyBNb25vVHlwZU9wZXJhdG9yRnVuY3Rpb248SG92ZXJDb250ZW50U3RhdGU+LFxuICAgIHNoYXJlUmVwbGF5KDEpLFxuICApO1xuICBwcml2YXRlIHJlYWRvbmx5IF9zdGFydFdpdGhOdWxsRGlzdGluY3QgPSBwaXBlKFxuICAgIHRoaXMuX3N0YXJ0V2l0aE51bGwsXG4gICAgdGhpcy5fZGlzdGluY3RVbnRpbENoYW5nZWQgYXMgTW9ub1R5cGVPcGVyYXRvckZ1bmN0aW9uPEVsZW1lbnR8bnVsbD4sXG4gICk7XG5cbiAgcmVhZG9ubHkgZWRpdGluZ0FuZEVuYWJsZWQgPSB0aGlzLmVkaXRpbmcucGlwZShcbiAgICAgIGZpbHRlcihjZWxsID0+IGNlbGwgPT0gbnVsbCB8fCAhdGhpcy5kaXNhYmxlZENlbGxzLmhhcyhjZWxsKSksXG4gICAgICBzaGFyZVJlcGxheSgxKSxcbiAgKTtcblxuICAvKiogQW4gb2JzZXJ2YWJsZSB0aGF0IGVtaXRzIHRoZSByb3cgY29udGFpbmluZyBmb2N1cyBvciBhbiBhY3RpdmUgZWRpdC4gKi9cbiAgcmVhZG9ubHkgZWRpdGluZ09yRm9jdXNlZCA9IGNvbWJpbmVMYXRlc3QoW1xuICAgICAgdGhpcy5lZGl0aW5nQW5kRW5hYmxlZC5waXBlKFxuICAgICAgICAgIG1hcChjZWxsID0+IGNsb3Nlc3QoY2VsbCwgUk9XX1NFTEVDVE9SKSksXG4gICAgICAgICAgdGhpcy5fc3RhcnRXaXRoTnVsbCxcbiAgICAgICksXG4gICAgICB0aGlzLmZvY3VzZWQucGlwZSh0aGlzLl9zdGFydFdpdGhOdWxsKSxcbiAgXSkucGlwZShcbiAgICAgIG1hcCgoW2VkaXRpbmdSb3csIGZvY3VzZWRSb3ddKSA9PiBmb2N1c2VkUm93IHx8IGVkaXRpbmdSb3cpLFxuICAgICAgdGhpcy5fZGlzdGluY3RVbnRpbENoYW5nZWQgYXMgTW9ub1R5cGVPcGVyYXRvckZ1bmN0aW9uPEVsZW1lbnR8bnVsbD4sXG4gICAgICBhdWRpdFRpbWUoRk9DVVNfREVMQVkpLCAvLyBVc2UgYXVkaXQgdG8gc2tpcCBvdmVyIGJsdXIgZXZlbnRzIHRvIHRoZSBuZXh0IGZvY3VzZWQgZWxlbWVudC5cbiAgICAgIHRoaXMuX2Rpc3RpbmN0VW50aWxDaGFuZ2VkIGFzIE1vbm9UeXBlT3BlcmF0b3JGdW5jdGlvbjxFbGVtZW50fG51bGw+LFxuICAgICAgc2hhcmVSZXBsYXkoMSksXG4gICk7XG5cbiAgLyoqIFRyYWNrcyByb3dzIHRoYXQgY29udGFpbiBob3ZlciBjb250ZW50IHdpdGggYSByZWZlcmVuY2UgY291bnQuICovXG4gIHByaXZhdGUgX3Jvd3NXaXRoSG92ZXJDb250ZW50ID0gbmV3IFdlYWtNYXA8RWxlbWVudCwgbnVtYmVyPigpO1xuXG4gIC8qKiBUaGUgdGFibGUgY2VsbCB0aGF0IGhhcyBhbiBhY3RpdmUgZWRpdCBsZW5zIChvciBudWxsKS4gKi9cbiAgcHJpdmF0ZSBfY3VycmVudGx5RWRpdGluZzogRWxlbWVudHxudWxsID0gbnVsbDtcblxuICAvKiogVGhlIGNvbWJpbmVkIHNldCBvZiByb3cgaG92ZXIgY29udGVudCBzdGF0ZXMgb3JnYW5pemVkIGJ5IHJvdy4gKi9cbiAgcHJpdmF0ZSByZWFkb25seSBfaG92ZXJlZENvbnRlbnRTdGF0ZURpc3RpbmN0ID0gY29tYmluZUxhdGVzdChbXG4gICAgICB0aGlzLl9nZXRGaXJzdFJvd1dpdGhIb3ZlckNvbnRlbnQoKSxcbiAgICAgIHRoaXMuX2dldExhc3RSb3dXaXRoSG92ZXJDb250ZW50KCksXG4gICAgICB0aGlzLmVkaXRpbmdPckZvY3VzZWQsXG4gICAgICB0aGlzLmhvdmVyaW5nLnBpcGUoXG4gICAgICAgICAgZGlzdGluY3RVbnRpbENoYW5nZWQoKSxcbiAgICAgICAgICBhdWRpdChyb3cgPT4gdGhpcy5tb3VzZU1vdmUucGlwZShcbiAgICAgICAgICAgICAgZmlsdGVyKG1vdXNlTW92ZVJvdyA9PiByb3cgPT09IG1vdXNlTW92ZVJvdyksXG4gICAgICAgICAgICAgIHRoaXMuX3N0YXJ0V2l0aE51bGwsXG4gICAgICAgICAgICAgIGRlYm91bmNlVGltZShNT1VTRV9FVkVOVF9ERUxBWV9NUykpLFxuICAgICAgICAgICksXG4gICAgICAgICAgdGhpcy5fc3RhcnRXaXRoTnVsbERpc3RpbmN0LFxuICAgICAgKSxcbiAgXSkucGlwZShcbiAgICAgIHNraXAoMSksIC8vIFNraXAgdGhlIGluaXRpYWwgZW1pc3Npb24gb2YgW251bGwsIG51bGwsIG51bGwsIG51bGxdLlxuICAgICAgbWFwKGNvbXB1dGVIb3ZlckNvbnRlbnRTdGF0ZSksXG4gICAgICBkaXN0aW5jdFVudGlsQ2hhbmdlZChhcmVNYXBFbnRyaWVzRXF1YWwpLFxuICAgICAgLy8gT3B0aW1pemF0aW9uOiBFbnRlciB0aGUgem9uZSBiZWZvcmUgc2hhcmVSZXBsYXkgc28gdGhhdCB3ZSB0cmlnZ2VyIGEgc2luZ2xlXG4gICAgICAvLyBBcHBsaWNhdGlvblJlZi50aWNrIGZvciBhbGwgcm93IHVwZGF0ZXMuXG4gICAgICB0aGlzLl9lbnRlclpvbmUoKSxcbiAgICAgIHNoYXJlUmVwbGF5KDEpLFxuICApO1xuXG4gIHByaXZhdGUgcmVhZG9ubHkgX2VkaXRpbmdBbmRFbmFibGVkRGlzdGluY3QgPSB0aGlzLmVkaXRpbmdBbmRFbmFibGVkLnBpcGUoXG4gICAgICBkaXN0aW5jdFVudGlsQ2hhbmdlZCgpLFxuICAgICAgdGhpcy5fZW50ZXJab25lKCksXG4gICAgICBzaGFyZVJlcGxheSgxKSxcbiAgKTtcblxuICAvLyBPcHRpbWl6YXRpb246IFNoYXJlIHJvdyBldmVudHMgb2JzZXJ2YWJsZSB3aXRoIHN1YnNlcXVlbnQgY2FsbGVycy5cbiAgLy8gQXQgc3RhcnR1cCwgY2FsbHMgd2lsbCBiZSBzZXF1ZW50aWFsIGJ5IHJvdy5cbiAgcHJpdmF0ZSBfbGFzdFNlZW5Sb3c6IEVsZW1lbnR8bnVsbCA9IG51bGw7XG4gIHByaXZhdGUgX2xhc3RTZWVuUm93SG92ZXJPckZvY3VzOiBPYnNlcnZhYmxlPEhvdmVyQ29udGVudFN0YXRlPnxudWxsID0gbnVsbDtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHJlYWRvbmx5IF9uZ1pvbmU6IE5nWm9uZSkge1xuICAgIHRoaXMuX2VkaXRpbmdBbmRFbmFibGVkRGlzdGluY3Quc3Vic2NyaWJlKGNlbGwgPT4ge1xuICAgICAgdGhpcy5fY3VycmVudGx5RWRpdGluZyA9IGNlbGw7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyBhbiBPYnNlcnZhYmxlIHRoYXQgZW1pdHMgdHJ1ZSB3aGVuIHRoZSBzcGVjaWZpZWQgZWxlbWVudCdzIGNlbGxcbiAgICogaXMgZWRpdGluZyBhbmQgZmFsc2Ugd2hlbiBub3QuXG4gICAqL1xuICBlZGl0aW5nQ2VsbChlbGVtZW50OiBFbGVtZW50fEV2ZW50VGFyZ2V0KTogT2JzZXJ2YWJsZTxib29sZWFuPiB7XG4gICAgbGV0IGNlbGw6IEVsZW1lbnR8bnVsbCA9IG51bGw7XG5cbiAgICByZXR1cm4gdGhpcy5fZWRpdGluZ0FuZEVuYWJsZWREaXN0aW5jdC5waXBlKFxuICAgICAgICBtYXAoZWRpdENlbGwgPT4gZWRpdENlbGwgPT09IChjZWxsIHx8IChjZWxsID0gY2xvc2VzdChlbGVtZW50LCBDRUxMX1NFTEVDVE9SKSkpKSxcbiAgICAgICAgdGhpcy5fZGlzdGluY3RVbnRpbENoYW5nZWQgYXMgTW9ub1R5cGVPcGVyYXRvckZ1bmN0aW9uPGJvb2xlYW4+LFxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogU3RvcHMgZWRpdGluZyBmb3IgdGhlIHNwZWNpZmllZCBjZWxsLiBJZiB0aGUgc3BlY2lmaWVkIGNlbGwgaXMgbm90IHRoZSBjdXJyZW50XG4gICAqIGVkaXQgY2VsbCwgZG9lcyBub3RoaW5nLlxuICAgKi9cbiAgZG9uZUVkaXRpbmdDZWxsKGVsZW1lbnQ6IEVsZW1lbnR8RXZlbnRUYXJnZXQpOiB2b2lkIHtcbiAgICBjb25zdCBjZWxsID0gY2xvc2VzdChlbGVtZW50LCBDRUxMX1NFTEVDVE9SKTtcblxuICAgIGlmICh0aGlzLl9jdXJyZW50bHlFZGl0aW5nID09PSBjZWxsKSB7XG4gICAgICB0aGlzLmVkaXRpbmcubmV4dChudWxsKTtcbiAgICB9XG4gIH1cblxuICAvKiogU2V0cyB0aGUgY3VycmVudGx5IGFjdGl2ZSBFZGl0UmVmLiAqL1xuICBzZXRBY3RpdmVFZGl0UmVmKHJlZjogRWRpdFJlZjxhbnk+KSB7XG4gICAgdGhpcy5fZWRpdFJlZiA9IHJlZjtcbiAgfVxuXG4gIC8qKiBVbnNldHMgdGhlIGN1cnJlbnRseSBhY3RpdmUgRWRpdFJlZiwgaWYgdGhlIHNwZWNpZmllZCBlZGl0UmVmIGlzIGFjdGl2ZS4gKi9cbiAgdW5zZXRBY3RpdmVFZGl0UmVmKHJlZjogRWRpdFJlZjxhbnk+KSB7XG4gICAgaWYgKHRoaXMuX2VkaXRSZWYgIT09IHJlZikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX2VkaXRSZWYgPSBudWxsO1xuICB9XG5cbiAgLyoqIEFkZHMgdGhlIHNwZWNpZmllZCB0YWJsZSByb3cgdG8gYmUgdHJhY2tlZCBmb3IgZmlyc3QvbGFzdCByb3cgY29tcGFyaXNvbnMuICovXG4gIHJlZ2lzdGVyUm93V2l0aEhvdmVyQ29udGVudChyb3c6IEVsZW1lbnQpOiB2b2lkIHtcbiAgICB0aGlzLl9yb3dzV2l0aEhvdmVyQ29udGVudC5zZXQocm93LCAodGhpcy5fcm93c1dpdGhIb3ZlckNvbnRlbnQuZ2V0KHJvdykgfHwgMCkgKyAxKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWZlcmVuY2UgZGVjcmVtZW50cyBhbmQgdWx0aW1hdGVseSByZW1vdmVzIHRoZSBzcGVjaWZpZWQgdGFibGUgcm93IGZyb20gZmlyc3QvbGFzdCByb3dcbiAgICogY29tcGFyaXNvbnMuXG4gICAqL1xuICBkZXJlZ2lzdGVyUm93V2l0aEhvdmVyQ29udGVudChyb3c6IEVsZW1lbnQpOiB2b2lkIHtcbiAgICBjb25zdCByZWZDb3VudCA9IHRoaXMuX3Jvd3NXaXRoSG92ZXJDb250ZW50LmdldChyb3cpIHx8IDA7XG5cbiAgICBpZiAocmVmQ291bnQgPD0gMSkge1xuICAgICAgdGhpcy5fcm93c1dpdGhIb3ZlckNvbnRlbnQuZGVsZXRlKHJvdyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3Jvd3NXaXRoSG92ZXJDb250ZW50LnNldChyb3csIHJlZkNvdW50IC0gMSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgYW4gT2JzZXJ2YWJsZSB0aGF0IGVtaXRzIHRydWUgd2hlbiB0aGUgc3BlY2lmaWVkIGVsZW1lbnQncyByb3dcbiAgICogY29udGFpbnMgdGhlIGZvY3VzZWQgZWxlbWVudCBvciBpcyBiZWluZyBob3ZlcmVkIG92ZXIgYW5kIGZhbHNlIHdoZW4gbm90LlxuICAgKiBIb3ZlcmluZyBpcyBkZWZpbmVkIGFzIHdoZW4gdGhlIG1vdXNlIGhhcyBtb21lbnRhcmlseSBzdG9wcGVkIG1vdmluZyBvdmVyIHRoZSBjZWxsLlxuICAgKi9cbiAgaG92ZXJPckZvY3VzT25Sb3cocm93OiBFbGVtZW50KTogT2JzZXJ2YWJsZTxIb3ZlckNvbnRlbnRTdGF0ZT4ge1xuICAgIGlmIChyb3cgIT09IHRoaXMuX2xhc3RTZWVuUm93KSB7XG4gICAgICB0aGlzLl9sYXN0U2VlblJvdyA9IHJvdztcbiAgICAgIHRoaXMuX2xhc3RTZWVuUm93SG92ZXJPckZvY3VzID0gdGhpcy5faG92ZXJlZENvbnRlbnRTdGF0ZURpc3RpbmN0LnBpcGUoXG4gICAgICAgIG1hcChzdGF0ZSA9PiBzdGF0ZS5nZXQocm93KSB8fCBIb3ZlckNvbnRlbnRTdGF0ZS5PRkYpLFxuICAgICAgICB0aGlzLl9kaXN0aW5jdFNoYXJlLFxuICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fbGFzdFNlZW5Sb3dIb3Zlck9yRm9jdXMhO1xuICB9XG5cbiAgLyoqXG4gICAqIFJ4SlMgb3BlcmF0b3IgdGhhdCBlbnRlcnMgdGhlIEFuZ3VsYXIgem9uZSwgdXNlZCB0byByZWR1Y2UgYm9pbGVycGxhdGUgaW5cbiAgICogcmUtZW50ZXJpbmcgdGhlIHpvbmUgZm9yIHN0cmVhbSBwaXBlbGluZXMuXG4gICAqL1xuICBwcml2YXRlIF9lbnRlclpvbmU8VD4oKTogTW9ub1R5cGVPcGVyYXRvckZ1bmN0aW9uPFQ+IHtcbiAgICByZXR1cm4gKHNvdXJjZTogT2JzZXJ2YWJsZTxUPikgPT5cbiAgICAgICAgbmV3IE9ic2VydmFibGU8VD4oKG9ic2VydmVyKSA9PiBzb3VyY2Uuc3Vic2NyaWJlKHtcbiAgICAgICAgICAgICBuZXh0OiAodmFsdWUpID0+IHRoaXMuX25nWm9uZS5ydW4oKCkgPT4gb2JzZXJ2ZXIubmV4dCh2YWx1ZSkpLFxuICAgICAgICAgICAgIGVycm9yOiAoZXJyKSA9PiBvYnNlcnZlci5lcnJvcihlcnIpLFxuICAgICAgICAgICAgIGNvbXBsZXRlOiAoKSA9PiBvYnNlcnZlci5jb21wbGV0ZSgpXG4gICAgICAgICAgIH0pKTtcbiAgfVxuXG4gIHByaXZhdGUgX2dldEZpcnN0Um93V2l0aEhvdmVyQ29udGVudCgpOiBPYnNlcnZhYmxlPEVsZW1lbnR8bnVsbD4ge1xuICAgIHJldHVybiB0aGlzLl9tYXBBbGxSb3dzVG9TaW5nbGVSb3cocm93cyA9PiB7XG4gICAgICBmb3IgKGxldCBpID0gMCwgcm93OyByb3cgPSByb3dzW2ldOyBpKyspIHtcbiAgICAgICAgaWYgKHRoaXMuX3Jvd3NXaXRoSG92ZXJDb250ZW50Lmhhcyhyb3cgYXMgRWxlbWVudCkpIHtcbiAgICAgICAgICByZXR1cm4gcm93IGFzIEVsZW1lbnQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0TGFzdFJvd1dpdGhIb3ZlckNvbnRlbnQoKTogT2JzZXJ2YWJsZTxFbGVtZW50fG51bGw+IHtcbiAgICByZXR1cm4gdGhpcy5fbWFwQWxsUm93c1RvU2luZ2xlUm93KHJvd3MgPT4ge1xuICAgICAgZm9yIChsZXQgaSA9IHJvd3MubGVuZ3RoIC0gMSwgcm93OyByb3cgPSByb3dzW2ldOyBpLS0pIHtcbiAgICAgICAgaWYgKHRoaXMuX3Jvd3NXaXRoSG92ZXJDb250ZW50Lmhhcyhyb3cgYXMgRWxlbWVudCkpIHtcbiAgICAgICAgICByZXR1cm4gcm93IGFzIEVsZW1lbnQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfbWFwQWxsUm93c1RvU2luZ2xlUm93KG1hcHBlcjogKHJvd3M6IE5vZGVMaXN0KSA9PiBFbGVtZW50fG51bGwpOlxuICAgICAgT2JzZXJ2YWJsZTxFbGVtZW50fG51bGw+IHtcbiAgICByZXR1cm4gdGhpcy5hbGxSb3dzLnBpcGUoXG4gICAgICAgIG1hcChtYXBwZXIpLFxuICAgICAgICB0aGlzLl9zdGFydFdpdGhOdWxsRGlzdGluY3QsXG4gICAgKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjb21wdXRlSG92ZXJDb250ZW50U3RhdGUoW2ZpcnN0Um93LCBsYXN0Um93LCBhY3RpdmVSb3csIGhvdmVyUm93XTogQXJyYXk8RWxlbWVudHxudWxsPik6XG4gICAgIE1hcDxFbGVtZW50LCBIb3ZlckNvbnRlbnRTdGF0ZT4ge1xuICBjb25zdCBob3ZlckNvbnRlbnRTdGF0ZSA9IG5ldyBNYXA8RWxlbWVudCwgSG92ZXJDb250ZW50U3RhdGU+KCk7XG5cbiAgLy8gQWRkIGZvY3VzYWJsZSByb3dzLlxuICBmb3IgKGNvbnN0IGZvY3Vzc2FibGVSb3cgb2YgW1xuICAgIGZpcnN0Um93LFxuICAgIGxhc3RSb3csXG4gICAgYWN0aXZlUm93ICYmIGFjdGl2ZVJvdy5wcmV2aW91c0VsZW1lbnRTaWJsaW5nLFxuICAgIGFjdGl2ZVJvdyAmJiBhY3RpdmVSb3cubmV4dEVsZW1lbnRTaWJsaW5nLFxuICBdKSB7XG4gICAgaWYgKGZvY3Vzc2FibGVSb3cpIHtcbiAgICAgIGhvdmVyQ29udGVudFN0YXRlLnNldChmb2N1c3NhYmxlUm93IGFzIEVsZW1lbnQsIEhvdmVyQ29udGVudFN0YXRlLkZPQ1VTQUJMRSk7XG4gICAgfVxuICB9XG5cbiAgLy8gQWRkL292ZXJ3cml0ZSB3aXRoIGZ1bGx5IHZpc2libGUgcm93cy5cbiAgZm9yIChjb25zdCBvblJvdyBvZiBbYWN0aXZlUm93LCBob3ZlclJvd10pIHtcbiAgICBpZiAob25Sb3cpIHtcbiAgICAgIGhvdmVyQ29udGVudFN0YXRlLnNldChvblJvdywgSG92ZXJDb250ZW50U3RhdGUuT04pO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBob3ZlckNvbnRlbnRTdGF0ZTtcbn1cblxuZnVuY3Rpb24gYXJlTWFwRW50cmllc0VxdWFsPEssIFY+KGE6IE1hcDxLLCBWPiwgYjogTWFwPEssIFY+KTogYm9vbGVhbiB7XG4gIGlmIChhLnNpemUgIT09IGIuc2l6ZSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIFRPRE86IHVzZSBNYXAucHJvdG90eXBlLmVudHJpZXMgb25jZSB3ZSdyZSBvZmYgSUUxMS5cbiAgZm9yIChjb25zdCBhS2V5IG9mIEFycmF5LmZyb20oYS5rZXlzKCkpKSB7XG4gICAgaWYgKGIuZ2V0KGFLZXkpICE9PSBhLmdldChhS2V5KSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufVxuIl19