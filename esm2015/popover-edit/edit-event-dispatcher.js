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
/** The delay applied to mouse events before hiding or showing hover content. */
const MOUSE_EVENT_DELAY_MS = 40;
/** The delay for reacting to focus/blur changes. */
const FOCUS_DELAY = 0;
/**
 * Service for sharing delegated events and state for triggering table edits.
 */
let EditEventDispatcher = /** @class */ (() => {
    class EditEventDispatcher {
        constructor(_ngZone) {
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
            this._distinctShare = pipe(this._distinctUntilChanged, shareReplay(1));
            this._startWithNullDistinct = pipe(this._startWithNull, this._distinctUntilChanged);
            this.editingAndEnabled = this.editing.pipe(filter(cell => cell == null || !this.disabledCells.has(cell)), shareReplay(1));
            /** An observable that emits the row containing focus or an active edit. */
            this.editingOrFocused = combineLatest([
                this.editingAndEnabled.pipe(map(cell => closest(cell, ROW_SELECTOR)), this._startWithNull),
                this.focused.pipe(this._startWithNull),
            ]).pipe(map(([editingRow, focusedRow]) => focusedRow || editingRow), this._distinctUntilChanged, auditTime(FOCUS_DELAY), // Use audit to skip over blur events to the next focused element.
            this._distinctUntilChanged, shareReplay(1));
            /** Tracks rows that contain hover content with a reference count. */
            this._rowsWithHoverContent = new WeakMap();
            /** The table cell that has an active edit lens (or null). */
            this._currentlyEditing = null;
            /** The combined set of row hover content states organized by row. */
            this._hoveredContentStateDistinct = combineLatest([
                this._getFirstRowWithHoverContent(),
                this._getLastRowWithHoverContent(),
                this.editingOrFocused,
                this.hovering.pipe(distinctUntilChanged(), audit(row => this.mouseMove.pipe(filter(mouseMoveRow => row === mouseMoveRow), this._startWithNull, debounceTime(MOUSE_EVENT_DELAY_MS))), this._startWithNullDistinct),
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
            this._editingAndEnabledDistinct.subscribe(cell => {
                this._currentlyEditing = cell;
            });
        }
        /** The EditRef for the currently active edit lens (if any). */
        get editRef() {
            return this._editRef;
        }
        /**
         * Gets an Observable that emits true when the specified element's cell
         * is editing and false when not.
         */
        editingCell(element) {
            let cell = null;
            return this._editingAndEnabledDistinct.pipe(map(editCell => editCell === (cell || (cell = closest(element, CELL_SELECTOR)))), this._distinctUntilChanged);
        }
        /**
         * Stops editing for the specified cell. If the specified cell is not the current
         * edit cell, does nothing.
         */
        doneEditingCell(element) {
            const cell = closest(element, CELL_SELECTOR);
            if (this._currentlyEditing === cell) {
                this.editing.next(null);
            }
        }
        /** Sets the currently active EditRef. */
        setActiveEditRef(ref) {
            this._editRef = ref;
        }
        /** Unsets the currently active EditRef, if the specified editRef is active. */
        unsetActiveEditRef(ref) {
            if (this._editRef !== ref) {
                return;
            }
            this._editRef = null;
        }
        /** Adds the specified table row to be tracked for first/last row comparisons. */
        registerRowWithHoverContent(row) {
            this._rowsWithHoverContent.set(row, (this._rowsWithHoverContent.get(row) || 0) + 1);
        }
        /**
         * Reference decrements and ultimately removes the specified table row from first/last row
         * comparisons.
         */
        deregisterRowWithHoverContent(row) {
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
         */
        hoverOrFocusOnRow(row) {
            if (row !== this._lastSeenRow) {
                this._lastSeenRow = row;
                this._lastSeenRowHoverOrFocus = this._hoveredContentStateDistinct.pipe(map(state => state.get(row) || 0 /* OFF */), this._distinctShare);
            }
            return this._lastSeenRowHoverOrFocus;
        }
        /**
         * RxJS operator that enters the Angular zone, used to reduce boilerplate in
         * re-entering the zone for stream pipelines.
         */
        _enterZone() {
            return (source) => new Observable((observer) => source.subscribe({
                next: (value) => this._ngZone.run(() => observer.next(value)),
                error: (err) => observer.error(err),
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
    }
    EditEventDispatcher.decorators = [
        { type: Injectable }
    ];
    EditEventDispatcher.ctorParameters = () => [
        { type: NgZone }
    ];
    return EditEventDispatcher;
})();
export { EditEventDispatcher };
function computeHoverContentState([firstRow, lastRow, activeRow, hoverRow]) {
    const hoverContentState = new Map();
    // Add focusable rows.
    for (const focussableRow of [
        firstRow,
        lastRow,
        activeRow && activeRow.previousElementSibling,
        activeRow && activeRow.nextElementSibling,
    ]) {
        if (focussableRow) {
            hoverContentState.set(focussableRow, 1 /* FOCUSABLE */);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdC1ldmVudC1kaXNwYXRjaGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvcG9wb3Zlci1lZGl0L2VkaXQtZXZlbnQtZGlzcGF0Y2hlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUNqRCxPQUFPLEVBQUMsYUFBYSxFQUE0QixVQUFVLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUN4RixPQUFPLEVBQ0wsS0FBSyxFQUNMLFNBQVMsRUFDVCxZQUFZLEVBQ1osb0JBQW9CLEVBQ3BCLE1BQU0sRUFDTixHQUFHLEVBQ0gsSUFBSSxFQUNKLFNBQVMsRUFDVCxXQUFXLEdBQ1osTUFBTSxnQkFBZ0IsQ0FBQztBQUV4QixPQUFPLEVBQUMsYUFBYSxFQUFFLFlBQVksRUFBQyxNQUFNLGFBQWEsQ0FBQztBQUN4RCxPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sWUFBWSxDQUFDO0FBR25DLGdGQUFnRjtBQUNoRixNQUFNLG9CQUFvQixHQUFHLEVBQUUsQ0FBQztBQUVoQyxvREFBb0Q7QUFDcEQsTUFBTSxXQUFXLEdBQUcsQ0FBQyxDQUFDO0FBY3RCOztHQUVHO0FBQ0g7SUFBQSxNQUNhLG1CQUFtQjtRQXVHOUIsWUFBNkIsT0FBZTtZQUFmLFlBQU8sR0FBUCxPQUFPLENBQVE7WUF0RzVDLDhGQUE4RjtZQUNyRixZQUFPLEdBQUcsSUFBSSxPQUFPLEVBQWdCLENBQUM7WUFFL0MscUVBQXFFO1lBQzVELGFBQVEsR0FBRyxJQUFJLE9BQU8sRUFBZ0IsQ0FBQztZQUVoRCx5RUFBeUU7WUFDaEUsWUFBTyxHQUFHLElBQUksT0FBTyxFQUFnQixDQUFDO1lBRS9DLGdGQUFnRjtZQUN2RSxZQUFPLEdBQUcsSUFBSSxPQUFPLEVBQVksQ0FBQztZ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LEtBQUssQ0FBQztLQUNkO0lBRUQsdURBQXVEO0lBQ3ZELEtBQUssTUFBTSxJQUFJLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRTtRQUN2QyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUMvQixPQUFPLEtBQUssQ0FBQztTQUNkO0tBQ0Y7SUFFRCxPQUFPLElBQUksQ0FBQztBQUNkLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtJbmplY3RhYmxlLCBOZ1pvbmV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtjb21iaW5lTGF0ZXN0LCBNb25vVHlwZU9wZXJhdG9yRnVuY3Rpb24sIE9ic2VydmFibGUsIHBpcGUsIFN1YmplY3R9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHtcbiAgYXVkaXQsXG4gIGF1ZGl0VGltZSxcbiAgZGVib3VuY2VUaW1lLFxuICBkaXN0aW5jdFVudGlsQ2hhbmdlZCxcbiAgZmlsdGVyLFxuICBtYXAsXG4gIHNraXAsXG4gIHN0YXJ0V2l0aCxcbiAgc2hhcmVSZXBsYXksXG59IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcblxuaW1wb3J0IHtDRUxMX1NFTEVDVE9SLCBST1dfU0VMRUNUT1J9IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCB7Y2xvc2VzdH0gZnJvbSAnLi9wb2x5ZmlsbCc7XG5pbXBvcnQge0VkaXRSZWZ9IGZyb20gJy4vZWRpdC1yZWYnO1xuXG4vKiogVGhlIGRlbGF5IGFwcGxpZWQgdG8gbW91c2UgZXZlbnRzIGJlZm9yZSBoaWRpbmcgb3Igc2hvd2luZyBob3ZlciBjb250ZW50LiAqL1xuY29uc3QgTU9VU0VfRVZFTlRfREVMQVlfTVMgPSA0MDtcblxuLyoqIFRoZSBkZWxheSBmb3IgcmVhY3RpbmcgdG8gZm9jdXMvYmx1ciBjaGFuZ2VzLiAqL1xuY29uc3QgRk9DVVNfREVMQVkgPSAwO1xuXG4vKipcbiAqIFRoZSBwb3NzaWJsZSBzdGF0ZXMgZm9yIGhvdmVyIGNvbnRlbnQ6XG4gKiBPRkYgLSBOb3QgcmVuZGVyZWQuXG4gKiBGT0NVU0FCTEUgLSBSZW5kZXJlZCBpbiB0aGUgZG9tIGFuZCBzdHlsZWQgZm9yIGl0cyBjb250ZW50cyB0byBiZSBmb2N1c2FibGUgYnV0IGludmlzaWJsZS5cbiAqIE9OIC0gUmVuZGVyZWQgYW5kIGZ1bGx5IHZpc2libGUuXG4gKi9cbmV4cG9ydCBjb25zdCBlbnVtIEhvdmVyQ29udGVudFN0YXRlIHtcbiAgT0ZGID0gMCxcbiAgRk9DVVNBQkxFLFxuICBPTixcbn1cblxuLyoqXG4gKiBTZXJ2aWNlIGZvciBzaGFyaW5nIGRlbGVnYXRlZCBldmVudHMgYW5kIHN0YXRlIGZvciB0cmlnZ2VyaW5nIHRhYmxlIGVkaXRzLlxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgRWRpdEV2ZW50RGlzcGF0Y2hlciB7XG4gIC8qKiBBIHN1YmplY3QgdGhhdCBpbmRpY2F0ZXMgd2hpY2ggdGFibGUgY2VsbCBpcyBjdXJyZW50bHkgZWRpdGluZyAodW5sZXNzIGl0IGlzIGRpc2FibGVkKS4gKi9cbiAgcmVhZG9ubHkgZWRpdGluZyA9IG5ldyBTdWJqZWN0PEVsZW1lbnR8bnVsbD4oKTtcblxuICAvKiogQSBzdWJqZWN0IHRoYXQgaW5kaWNhdGVzIHdoaWNoIHRhYmxlIHJvdyBpcyBjdXJyZW50bHkgaG92ZXJlZC4gKi9cbiAgcmVhZG9ubHkgaG92ZXJpbmcgPSBuZXcgU3ViamVjdDxFbGVtZW50fG51bGw+KCk7XG5cbiAgLyoqIEEgc3ViamVjdCB0aGF0IGluZGljYXRlcyB3aGljaCB0YWJsZSByb3cgY3VycmVudGx5IGNvbnRhaW5zIGZvY3VzLiAqL1xuICByZWFkb25seSBmb2N1c2VkID0gbmV3IFN1YmplY3Q8RWxlbWVudHxudWxsPigpO1xuXG4gIC8qKiBBIHN1YmplY3QgdGhhdCBpbmRpY2F0ZXMgYWxsIGVsZW1lbnRzIGluIHRoZSB0YWJsZSBtYXRjaGluZyBST1dfU0VMRUNUT1IuICovXG4gIHJlYWRvbmx5IGFsbFJvd3MgPSBuZXcgU3ViamVjdDxOb2RlTGlzdD4oKTtcblxuICAvKiogQSBzdWJqZWN0IHRoYXQgZW1pdHMgbW91c2UgbW92ZSBldmVudHMgZnJvbSB0aGUgdGFibGUgaW5kaWNhdGluZyB0aGUgdGFyZ2V0ZWQgcm93LiAqL1xuICByZWFkb25seSBtb3VzZU1vdmUgPSBuZXcgU3ViamVjdDxFbGVtZW50fG51bGw+KCk7XG5cbiAgLy8gVE9ETzogVXNlIFdlYWtTZXQgb25jZSBJRTExIHN1cHBvcnQgaXMgZHJvcHBlZC5cbiAgLyoqXG4gICAqIFRyYWNrcyB0aGUgY3VycmVudGx5IGRpc2FibGVkIGVkaXRhYmxlIGNlbGxzIC0gZWRpdCBjYWxscyB3aWxsIGJlIGlnbm9yZWRcbiAgICogZm9yIHRoZXNlIGNlbGxzLlxuICAgKi9cbiAgcmVhZG9ubHkgZGlzYWJsZWRDZWxscyA9IG5ldyBXZWFrTWFwPEVsZW1lbnQsIGJvb2xlYW4+KCk7XG5cbiAgLyoqIFRoZSBFZGl0UmVmIGZvciB0aGUgY3VycmVudGx5IGFjdGl2ZSBlZGl0IGxlbnMgKGlmIGFueSkuICovXG4gIGdldCBlZGl0UmVmKCk6IEVkaXRSZWY8YW55PnxudWxsIHtcbiAgICByZXR1cm4gdGhpcy5fZWRpdFJlZjtcbiAgfVxuICBwcml2YXRlIF9lZGl0UmVmOiBFZGl0UmVmPGFueT58bnVsbCA9IG51bGw7XG5cbiAgLy8gT3B0aW1pemF0aW9uOiBQcmVjb21wdXRlIGNvbW1vbiBwaXBlYWJsZSBvcGVyYXRvcnMgdXNlZCBwZXIgcm93L2NlbGwuXG4gIHByaXZhdGUgcmVhZG9ubHkgX2Rpc3RpbmN0VW50aWxDaGFuZ2VkID1cbiAgICAgIGRpc3RpbmN0VW50aWxDaGFuZ2VkPEVsZW1lbnR8SG92ZXJDb250ZW50U3RhdGV8Ym9vbGVhbnxudWxsPigpO1xuICBwcml2YXRlIHJlYWRvbmx5IF9zdGFydFdpdGhOdWxsID0gc3RhcnRXaXRoPEVsZW1lbnR8bnVsbD4obnVsbCk7XG4gIHByaXZhdGUgcmVhZG9ubHkgX2Rpc3RpbmN0U2hhcmUgPSBwaXBlKFxuICAgIHRoaXMuX2Rpc3RpbmN0VW50aWxDaGFuZ2VkIGFzIE1vbm9UeXBlT3BlcmF0b3JGdW5jdGlvbjxIb3ZlckNvbnRlbnRTdGF0ZT4sXG4gICAgc2hhcmVSZXBsYXkoMSksXG4gICk7XG4gIHByaXZhdGUgcmVhZG9ubHkgX3N0YXJ0V2l0aE51bGxEaXN0aW5jdCA9IHBpcGUoXG4gICAgdGhpcy5fc3RhcnRXaXRoTnVsbCxcbiAgICB0aGlzLl9kaXN0aW5jdFVudGlsQ2hhbmdlZCBhcyBNb25vVHlwZU9wZXJhdG9yRnVuY3Rpb248RWxlbWVudHxudWxsPixcbiAgKTtcblxuICByZWFkb25seSBlZGl0aW5nQW5kRW5hYmxlZCA9IHRoaXMuZWRpdGluZy5waXBlKFxuICAgICAgZmlsdGVyKGNlbGwgPT4gY2VsbCA9PSBudWxsIHx8ICF0aGlzLmRpc2FibGVkQ2VsbHMuaGFzKGNlbGwpKSxcbiAgICAgIHNoYXJlUmVwbGF5KDEpLFxuICApO1xuXG4gIC8qKiBBbiBvYnNlcnZhYmxlIHRoYXQgZW1pdHMgdGhlIHJvdyBjb250YWluaW5nIGZvY3VzIG9yIGFuIGFjdGl2ZSBlZGl0LiAqL1xuICByZWFkb25seSBlZGl0aW5nT3JGb2N1c2VkID0gY29tYmluZUxhdGVzdChbXG4gICAgICB0aGlzLmVkaXRpbmdBbmRFbmFibGVkLnBpcGUoXG4gICAgICAgICAgbWFwKGNlbGwgPT4gY2xvc2VzdChjZWxsLCBST1dfU0VMRUNUT1IpKSxcbiAgICAgICAgICB0aGlzLl9zdGFydFdpdGhOdWxsLFxuICAgICAgKSxcbiAgICAgIHRoaXMuZm9jdXNlZC5waXBlKHRoaXMuX3N0YXJ0V2l0aE51bGwpLFxuICBdKS5waXBlKFxuICAgICAgbWFwKChbZWRpdGluZ1JvdywgZm9jdXNlZFJvd10pID0+IGZvY3VzZWRSb3cgfHwgZWRpdGluZ1JvdyksXG4gICAgICB0aGlzLl9kaXN0aW5jdFVudGlsQ2hhbmdlZCBhcyBNb25vVHlwZU9wZXJhdG9yRnVuY3Rpb248RWxlbWVudHxudWxsPixcbiAgICAgIGF1ZGl0VGltZShGT0NVU19ERUxBWSksIC8vIFVzZSBhdWRpdCB0byBza2lwIG92ZXIgYmx1ciBldmVudHMgdG8gdGhlIG5leHQgZm9jdXNlZCBlbGVtZW50LlxuICAgICAgdGhpcy5fZGlzdGluY3RVbnRpbENoYW5nZWQgYXMgTW9ub1R5cGVPcGVyYXRvckZ1bmN0aW9uPEVsZW1lbnR8bnVsbD4sXG4gICAgICBzaGFyZVJlcGxheSgxKSxcbiAgKTtcblxuICAvKiogVHJhY2tzIHJvd3MgdGhhdCBjb250YWluIGhvdmVyIGNvbnRlbnQgd2l0aCBhIHJlZmVyZW5jZSBjb3VudC4gKi9cbiAgcHJpdmF0ZSBfcm93c1dpdGhIb3ZlckNvbnRlbnQgPSBuZXcgV2Vha01hcDxFbGVtZW50LCBudW1iZXI+KCk7XG5cbiAgLyoqIFRoZSB0YWJsZSBjZWxsIHRoYXQgaGFzIGFuIGFjdGl2ZSBlZGl0IGxlbnMgKG9yIG51bGwpLiAqL1xuICBwcml2YXRlIF9jdXJyZW50bHlFZGl0aW5nOiBFbGVtZW50fG51bGwgPSBudWxsO1xuXG4gIC8qKiBUaGUgY29tYmluZWQgc2V0IG9mIHJvdyBob3ZlciBjb250ZW50IHN0YXRlcyBvcmdhbml6ZWQgYnkgcm93LiAqL1xuICBwcml2YXRlIHJlYWRvbmx5IF9ob3ZlcmVkQ29udGVudFN0YXRlRGlzdGluY3QgPSBjb21iaW5lTGF0ZXN0KFtcbiAgICAgIHRoaXMuX2dldEZpcnN0Um93V2l0aEhvdmVyQ29udGVudCgpLFxuICAgICAgdGhpcy5fZ2V0TGFzdFJvd1dpdGhIb3ZlckNvbnRlbnQoKSxcbiAgICAgIHRoaXMuZWRpdGluZ09yRm9jdXNlZCxcbiAgICAgIHRoaXMuaG92ZXJpbmcucGlwZShcbiAgICAgICAgICBkaXN0aW5jdFVudGlsQ2hhbmdlZCgpLFxuICAgICAgICAgIGF1ZGl0KHJvdyA9PiB0aGlzLm1vdXNlTW92ZS5waXBlKFxuICAgICAgICAgICAgICBmaWx0ZXIobW91c2VNb3ZlUm93ID0+IHJvdyA9PT0gbW91c2VNb3ZlUm93KSxcbiAgICAgICAgICAgICAgdGhpcy5fc3RhcnRXaXRoTnVsbCxcbiAgICAgICAgICAgICAgZGVib3VuY2VUaW1lKE1PVVNFX0VWRU5UX0RFTEFZX01TKSksXG4gICAgICAgICAgKSxcbiAgICAgICAgICB0aGlzLl9zdGFydFdpdGhOdWxsRGlzdGluY3QsXG4gICAgICApLFxuICBdKS5waXBlKFxuICAgICAgc2tpcCgxKSwgLy8gU2tpcCB0aGUgaW5pdGlhbCBlbWlzc2lvbiBvZiBbbnVsbCwgbnVsbCwgbnVsbCwgbnVsbF0uXG4gICAgICBtYXAoY29tcHV0ZUhvdmVyQ29udGVudFN0YXRlKSxcbiAgICAgIGRpc3RpbmN0VW50aWxDaGFuZ2VkKGFyZU1hcEVudHJpZXNFcXVhbCksXG4gICAgICAvLyBPcHRpbWl6YXRpb246IEVudGVyIHRoZSB6b25lIGJlZm9yZSBzaGFyZVJlcGxheSBzbyB0aGF0IHdlIHRyaWdnZXIgYSBzaW5nbGVcbiAgICAgIC8vIEFwcGxpY2F0aW9uUmVmLnRpY2sgZm9yIGFsbCByb3cgdXBkYXRlcy5cbiAgICAgIHRoaXMuX2VudGVyWm9uZSgpLFxuICAgICAgc2hhcmVSZXBsYXkoMSksXG4gICk7XG5cbiAgcHJpdmF0ZSByZWFkb25seSBfZWRpdGluZ0FuZEVuYWJsZWREaXN0aW5jdCA9IHRoaXMuZWRpdGluZ0FuZEVuYWJsZWQucGlwZShcbiAgICAgIGRpc3RpbmN0VW50aWxDaGFuZ2VkKCksXG4gICAgICB0aGlzLl9lbnRlclpvbmUoKSxcbiAgICAgIHNoYXJlUmVwbGF5KDEpLFxuICApO1xuXG4gIC8vIE9wdGltaXphdGlvbjogU2hhcmUgcm93IGV2ZW50cyBvYnNlcnZhYmxlIHdpdGggc3Vic2VxdWVudCBjYWxsZXJzLlxuICAvLyBBdCBzdGFydHVwLCBjYWxscyB3aWxsIGJlIHNlcXVlbnRpYWwgYnkgcm93LlxuICBwcml2YXRlIF9sYXN0U2VlblJvdzogRWxlbWVudHxudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBfbGFzdFNlZW5Sb3dIb3Zlck9yRm9jdXM6IE9ic2VydmFibGU8SG92ZXJDb250ZW50U3RhdGU+fG51bGwgPSBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgX25nWm9uZTogTmdab25lKSB7XG4gICAgdGhpcy5fZWRpdGluZ0FuZEVuYWJsZWREaXN0aW5jdC5zdWJzY3JpYmUoY2VsbCA9PiB7XG4gICAgICB0aGlzLl9jdXJyZW50bHlFZGl0aW5nID0gY2VsbDtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIGFuIE9ic2VydmFibGUgdGhhdCBlbWl0cyB0cnVlIHdoZW4gdGhlIHNwZWNpZmllZCBlbGVtZW50J3MgY2VsbFxuICAgKiBpcyBlZGl0aW5nIGFuZCBmYWxzZSB3aGVuIG5vdC5cbiAgICovXG4gIGVkaXRpbmdDZWxsKGVsZW1lbnQ6IEVsZW1lbnR8RXZlbnRUYXJnZXQpOiBPYnNlcnZhYmxlPGJvb2xlYW4+IHtcbiAgICBsZXQgY2VsbDogRWxlbWVudHxudWxsID0gbnVsbDtcblxuICAgIHJldHVybiB0aGlzLl9lZGl0aW5nQW5kRW5hYmxlZERpc3RpbmN0LnBpcGUoXG4gICAgICAgIG1hcChlZGl0Q2VsbCA9PiBlZGl0Q2VsbCA9PT0gKGNlbGwgfHwgKGNlbGwgPSBjbG9zZXN0KGVsZW1lbnQsIENFTExfU0VMRUNUT1IpKSkpLFxuICAgICAgICB0aGlzLl9kaXN0aW5jdFVudGlsQ2hhbmdlZCBhcyBNb25vVHlwZU9wZXJhdG9yRnVuY3Rpb248Ym9vbGVhbj4sXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdG9wcyBlZGl0aW5nIGZvciB0aGUgc3BlY2lmaWVkIGNlbGwuIElmIHRoZSBzcGVjaWZpZWQgY2VsbCBpcyBub3QgdGhlIGN1cnJlbnRcbiAgICogZWRpdCBjZWxsLCBkb2VzIG5vdGhpbmcuXG4gICAqL1xuICBkb25lRWRpdGluZ0NlbGwoZWxlbWVudDogRWxlbWVudHxFdmVudFRhcmdldCk6IHZvaWQge1xuICAgIGNvbnN0IGNlbGwgPSBjbG9zZXN0KGVsZW1lbnQsIENFTExfU0VMRUNUT1IpO1xuXG4gICAgaWYgKHRoaXMuX2N1cnJlbnRseUVkaXRpbmcgPT09IGNlbGwpIHtcbiAgICAgIHRoaXMuZWRpdGluZy5uZXh0KG51bGwpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBTZXRzIHRoZSBjdXJyZW50bHkgYWN0aXZlIEVkaXRSZWYuICovXG4gIHNldEFjdGl2ZUVkaXRSZWYocmVmOiBFZGl0UmVmPGFueT4pIHtcbiAgICB0aGlzLl9lZGl0UmVmID0gcmVmO1xuICB9XG5cbiAgLyoqIFVuc2V0cyB0aGUgY3VycmVudGx5IGFjdGl2ZSBFZGl0UmVmLCBpZiB0aGUgc3BlY2lmaWVkIGVkaXRSZWYgaXMgYWN0aXZlLiAqL1xuICB1bnNldEFjdGl2ZUVkaXRSZWYocmVmOiBFZGl0UmVmPGFueT4pIHtcbiAgICBpZiAodGhpcy5fZWRpdFJlZiAhPT0gcmVmKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5fZWRpdFJlZiA9IG51bGw7XG4gIH1cblxuICAvKiogQWRkcyB0aGUgc3BlY2lmaWVkIHRhYmxlIHJvdyB0byBiZSB0cmFja2VkIGZvciBmaXJzdC9sYXN0IHJvdyBjb21wYXJpc29ucy4gKi9cbiAgcmVnaXN0ZXJSb3dXaXRoSG92ZXJDb250ZW50KHJvdzogRWxlbWVudCk6IHZvaWQge1xuICAgIHRoaXMuX3Jvd3NXaXRoSG92ZXJDb250ZW50LnNldChyb3csICh0aGlzLl9yb3dzV2l0aEhvdmVyQ29udGVudC5nZXQocm93KSB8fCAwKSArIDEpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlZmVyZW5jZSBkZWNyZW1lbnRzIGFuZCB1bHRpbWF0ZWx5IHJlbW92ZXMgdGhlIHNwZWNpZmllZCB0YWJsZSByb3cgZnJvbSBmaXJzdC9sYXN0IHJvd1xuICAgKiBjb21wYXJpc29ucy5cbiAgICovXG4gIGRlcmVnaXN0ZXJSb3dXaXRoSG92ZXJDb250ZW50KHJvdzogRWxlbWVudCk6IHZvaWQge1xuICAgIGNvbnN0IHJlZkNvdW50ID0gdGhpcy5fcm93c1dpdGhIb3ZlckNvbnRlbnQuZ2V0KHJvdykgfHwgMDtcblxuICAgIGlmIChyZWZDb3VudCA8PSAxKSB7XG4gICAgICB0aGlzLl9yb3dzV2l0aEhvdmVyQ29udGVudC5kZWxldGUocm93KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fcm93c1dpdGhIb3ZlckNvbnRlbnQuc2V0KHJvdywgcmVmQ291bnQgLSAxKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2V0cyBhbiBPYnNlcnZhYmxlIHRoYXQgZW1pdHMgdHJ1ZSB3aGVuIHRoZSBzcGVjaWZpZWQgZWxlbWVudCdzIHJvd1xuICAgKiBjb250YWlucyB0aGUgZm9jdXNlZCBlbGVtZW50IG9yIGlzIGJlaW5nIGhvdmVyZWQgb3ZlciBhbmQgZmFsc2Ugd2hlbiBub3QuXG4gICAqIEhvdmVyaW5nIGlzIGRlZmluZWQgYXMgd2hlbiB0aGUgbW91c2UgaGFzIG1vbWVudGFyaWx5IHN0b3BwZWQgbW92aW5nIG92ZXIgdGhlIGNlbGwuXG4gICAqL1xuICBob3Zlck9yRm9jdXNPblJvdyhyb3c6IEVsZW1lbnQpOiBPYnNlcnZhYmxlPEhvdmVyQ29udGVudFN0YXRlPiB7XG4gICAgaWYgKHJvdyAhPT0gdGhpcy5fbGFzdFNlZW5Sb3cpIHtcbiAgICAgIHRoaXMuX2xhc3RTZWVuUm93ID0gcm93O1xuICAgICAgdGhpcy5fbGFzdFNlZW5Sb3dIb3Zlck9yRm9jdXMgPSB0aGlzLl9ob3ZlcmVkQ29udGVudFN0YXRlRGlzdGluY3QucGlwZShcbiAgICAgICAgbWFwKHN0YXRlID0+IHN0YXRlLmdldChyb3cpIHx8IEhvdmVyQ29udGVudFN0YXRlLk9GRiksXG4gICAgICAgIHRoaXMuX2Rpc3RpbmN0U2hhcmUsXG4gICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9sYXN0U2VlblJvd0hvdmVyT3JGb2N1cyE7XG4gIH1cblxuICAvKipcbiAgICogUnhKUyBvcGVyYXRvciB0aGF0IGVudGVycyB0aGUgQW5ndWxhciB6b25lLCB1c2VkIHRvIHJlZHVjZSBib2lsZXJwbGF0ZSBpblxuICAgKiByZS1lbnRlcmluZyB0aGUgem9uZSBmb3Igc3RyZWFtIHBpcGVsaW5lcy5cbiAgICovXG4gIHByaXZhdGUgX2VudGVyWm9uZTxUPigpOiBNb25vVHlwZU9wZXJhdG9yRnVuY3Rpb248VD4ge1xuICAgIHJldHVybiAoc291cmNlOiBPYnNlcnZhYmxlPFQ+KSA9PlxuICAgICAgICBuZXcgT2JzZXJ2YWJsZTxUPigob2JzZXJ2ZXIpID0+IHNvdXJjZS5zdWJzY3JpYmUoe1xuICAgICAgICAgICAgIG5leHQ6ICh2YWx1ZSkgPT4gdGhpcy5fbmdab25lLnJ1bigoKSA9PiBvYnNlcnZlci5uZXh0KHZhbHVlKSksXG4gICAgICAgICAgICAgZXJyb3I6IChlcnIpID0+IG9ic2VydmVyLmVycm9yKGVyciksXG4gICAgICAgICAgICAgY29tcGxldGU6ICgpID0+IG9ic2VydmVyLmNvbXBsZXRlKClcbiAgICAgICAgICAgfSkpO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0Rmlyc3RSb3dXaXRoSG92ZXJDb250ZW50KCk6IE9ic2VydmFibGU8RWxlbWVudHxudWxsPiB7XG4gICAgcmV0dXJuIHRoaXMuX21hcEFsbFJvd3NUb1NpbmdsZVJvdyhyb3dzID0+IHtcbiAgICAgIGZvciAobGV0IGkgPSAwLCByb3c7IHJvdyA9IHJvd3NbaV07IGkrKykge1xuICAgICAgICBpZiAodGhpcy5fcm93c1dpdGhIb3ZlckNvbnRlbnQuaGFzKHJvdyBhcyBFbGVtZW50KSkge1xuICAgICAgICAgIHJldHVybiByb3cgYXMgRWxlbWVudDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIF9nZXRMYXN0Um93V2l0aEhvdmVyQ29udGVudCgpOiBPYnNlcnZhYmxlPEVsZW1lbnR8bnVsbD4ge1xuICAgIHJldHVybiB0aGlzLl9tYXBBbGxSb3dzVG9TaW5nbGVSb3cocm93cyA9PiB7XG4gICAgICBmb3IgKGxldCBpID0gcm93cy5sZW5ndGggLSAxLCByb3c7IHJvdyA9IHJvd3NbaV07IGktLSkge1xuICAgICAgICBpZiAodGhpcy5fcm93c1dpdGhIb3ZlckNvbnRlbnQuaGFzKHJvdyBhcyBFbGVtZW50KSkge1xuICAgICAgICAgIHJldHVybiByb3cgYXMgRWxlbWVudDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIF9tYXBBbGxSb3dzVG9TaW5nbGVSb3cobWFwcGVyOiAocm93czogTm9kZUxpc3QpID0+IEVsZW1lbnR8bnVsbCk6XG4gICAgICBPYnNlcnZhYmxlPEVsZW1lbnR8bnVsbD4ge1xuICAgIHJldHVybiB0aGlzLmFsbFJvd3MucGlwZShcbiAgICAgICAgbWFwKG1hcHBlciksXG4gICAgICAgIHRoaXMuX3N0YXJ0V2l0aE51bGxEaXN0aW5jdCxcbiAgICApO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNvbXB1dGVIb3ZlckNvbnRlbnRTdGF0ZShbZmlyc3RSb3csIGxhc3RSb3csIGFjdGl2ZVJvdywgaG92ZXJSb3ddOiAoRWxlbWVudHxudWxsKVtdKTpcbiAgICAgTWFwPEVsZW1lbnQsIEhvdmVyQ29udGVudFN0YXRlPiB7XG4gIGNvbnN0IGhvdmVyQ29udGVudFN0YXRlID0gbmV3IE1hcDxFbGVtZW50LCBIb3ZlckNvbnRlbnRTdGF0ZT4oKTtcblxuICAvLyBBZGQgZm9jdXNhYmxlIHJvd3MuXG4gIGZvciAoY29uc3QgZm9jdXNzYWJsZVJvdyBvZiBbXG4gICAgZmlyc3RSb3csXG4gICAgbGFzdFJvdyxcbiAgICBhY3RpdmVSb3cgJiYgYWN0aXZlUm93LnByZXZpb3VzRWxlbWVudFNpYmxpbmcsXG4gICAgYWN0aXZlUm93ICYmIGFjdGl2ZVJvdy5uZXh0RWxlbWVudFNpYmxpbmcsXG4gIF0pIHtcbiAgICBpZiAoZm9jdXNzYWJsZVJvdykge1xuICAgICAgaG92ZXJDb250ZW50U3RhdGUuc2V0KGZvY3Vzc2FibGVSb3cgYXMgRWxlbWVudCwgSG92ZXJDb250ZW50U3RhdGUuRk9DVVNBQkxFKTtcbiAgICB9XG4gIH1cblxuICAvLyBBZGQvb3ZlcndyaXRlIHdpdGggZnVsbHkgdmlzaWJsZSByb3dzLlxuICBmb3IgKGNvbnN0IG9uUm93IG9mIFthY3RpdmVSb3csIGhvdmVyUm93XSkge1xuICAgIGlmIChvblJvdykge1xuICAgICAgaG92ZXJDb250ZW50U3RhdGUuc2V0KG9uUm93LCBIb3ZlckNvbnRlbnRTdGF0ZS5PTik7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGhvdmVyQ29udGVudFN0YXRlO1xufVxuXG5mdW5jdGlvbiBhcmVNYXBFbnRyaWVzRXF1YWw8SywgVj4oYTogTWFwPEssIFY+LCBiOiBNYXA8SywgVj4pOiBib29sZWFuIHtcbiAgaWYgKGEuc2l6ZSAhPT0gYi5zaXplKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gVE9ETzogdXNlIE1hcC5wcm90b3R5cGUuZW50cmllcyBvbmNlIHdlJ3JlIG9mZiBJRTExLlxuICBmb3IgKGNvbnN0IGFLZXkgb2YgQXJyYXkuZnJvbShhLmtleXMoKSkpIHtcbiAgICBpZiAoYi5nZXQoYUtleSkgIT09IGEuZ2V0KGFLZXkpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59XG4iXX0=