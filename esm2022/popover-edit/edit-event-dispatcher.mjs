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
import * as i0 from "@angular/core";
/** The delay applied to mouse events before hiding or showing hover content. */
const MOUSE_EVENT_DELAY_MS = 40;
/** The delay for reacting to focus/blur changes. */
const FOCUS_DELAY = 0;
// Note: this class is generic, rather than referencing EditRef directly, in order to avoid
// circular imports. If we were to reference it here, importing the registry into the
// class that is registering itself will introduce a circular import.
/**
 * Service for sharing delegated events and state for triggering table edits.
 */
class EditEventDispatcher {
    /** The EditRef for the currently active edit lens (if any). */
    get editRef() {
        return this._editRef;
    }
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
    /** Unset the currently active EditRef, if the specified editRef is active. */
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
            this._lastSeenRowHoverOrFocus = this._hoveredContentStateDistinct.pipe(map(state => state.get(row) || 0 /* HoverContentState.OFF */), this._distinctShare);
        }
        return this._lastSeenRowHoverOrFocus;
    }
    /**
     * RxJS operator that enters the Angular zone, used to reduce boilerplate in
     * re-entering the zone for stream pipelines.
     */
    _enterZone() {
        return (source) => new Observable(observer => source.subscribe({
            next: value => this._ngZone.run(() => observer.next(value)),
            error: err => observer.error(err),
            complete: () => observer.complete(),
        }));
    }
    _getFirstRowWithHoverContent() {
        return this._mapAllRowsToSingleRow(rows => {
            for (let i = 0, row; (row = rows[i]); i++) {
                if (this._rowsWithHoverContent.has(row)) {
                    return row;
                }
            }
            return null;
        });
    }
    _getLastRowWithHoverContent() {
        return this._mapAllRowsToSingleRow(rows => {
            for (let i = rows.length - 1, row; (row = rows[i]); i--) {
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.0.0", ngImport: i0, type: EditEventDispatcher, deps: [{ token: i0.NgZone }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "16.0.0", ngImport: i0, type: EditEventDispatcher }); }
}
export { EditEventDispatcher };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.0.0", ngImport: i0, type: EditEventDispatcher, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: i0.NgZone }]; } });
function computeHoverContentState([firstRow, lastRow, activeRow, hoverRow,]) {
    const hoverContentState = new Map();
    // Add focusable rows.
    for (const focussableRow of [
        firstRow,
        lastRow,
        activeRow && activeRow.previousElementSibling,
        activeRow && activeRow.nextElementSibling,
    ]) {
        if (focussableRow) {
            hoverContentState.set(focussableRow, 1 /* HoverContentState.FOCUSABLE */);
        }
    }
    // Add/overwrite with fully visible rows.
    for (const onRow of [activeRow, hoverRow]) {
        if (onRow) {
            hoverContentState.set(onRow, 2 /* HoverContentState.ON */);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdC1ldmVudC1kaXNwYXRjaGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvcG9wb3Zlci1lZGl0L2VkaXQtZXZlbnQtZGlzcGF0Y2hlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUNqRCxPQUFPLEVBQUMsYUFBYSxFQUE0QixVQUFVLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUN4RixPQUFPLEVBQ0wsS0FBSyxFQUNMLFNBQVMsRUFDVCxZQUFZLEVBQ1osb0JBQW9CLEVBQ3BCLE1BQU0sRUFDTixHQUFHLEVBQ0gsSUFBSSxFQUNKLFNBQVMsRUFDVCxXQUFXLEdBQ1osTUFBTSxnQkFBZ0IsQ0FBQztBQUV4QixPQUFPLEVBQUMsYUFBYSxFQUFFLFlBQVksRUFBQyxNQUFNLGFBQWEsQ0FBQztBQUN4RCxPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sWUFBWSxDQUFDOztBQUVuQyxnRkFBZ0Y7QUFDaEYsTUFBTSxvQkFBb0IsR0FBRyxFQUFFLENBQUM7QUFFaEMsb0RBQW9EO0FBQ3BELE1BQU0sV0FBVyxHQUFHLENBQUMsQ0FBQztBQWN0QiwyRkFBMkY7QUFDM0YscUZBQXFGO0FBQ3JGLHFFQUFxRTtBQUVyRTs7R0FFRztBQUNILE1BQ2EsbUJBQW1CO0lBdUI5QiwrREFBK0Q7SUFDL0QsSUFBSSxPQUFPO1FBQ1QsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDO0lBQ3ZCLENBQUM7SUFnRkQsWUFBNkIsT0FBZTtRQUFmLFlBQU8sR0FBUCxPQUFPLENBQVE7UUF6RzVDLDhGQUE4RjtRQUNyRixZQUFPLEdBQUcsSUFBSSxPQUFPLEVBQWtCLENBQUM7UUFFakQscUVBQXFFO1FBQzVELGFBQVEsR0FBRyxJQUFJLE9BQU8sRUFBa0Is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QUFJLEVBQUU7UUFDckIsT0FBTyxLQUFLLENBQUM7S0FDZDtJQUVELHVEQUF1RDtJQUN2RCxLQUFLLE1BQU0sSUFBSSxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUU7UUFDdkMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDL0IsT0FBTyxLQUFLLENBQUM7U0FDZDtLQUNGO0lBRUQsT0FBTyxJQUFJLENBQUM7QUFDZCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SW5qZWN0YWJsZSwgTmdab25lfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7Y29tYmluZUxhdGVzdCwgTW9ub1R5cGVPcGVyYXRvckZ1bmN0aW9uLCBPYnNlcnZhYmxlLCBwaXBlLCBTdWJqZWN0fSBmcm9tICdyeGpzJztcbmltcG9ydCB7XG4gIGF1ZGl0LFxuICBhdWRpdFRpbWUsXG4gIGRlYm91bmNlVGltZSxcbiAgZGlzdGluY3RVbnRpbENoYW5nZWQsXG4gIGZpbHRlcixcbiAgbWFwLFxuICBza2lwLFxuICBzdGFydFdpdGgsXG4gIHNoYXJlUmVwbGF5LFxufSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbmltcG9ydCB7Q0VMTF9TRUxFQ1RPUiwgUk9XX1NFTEVDVE9SfSBmcm9tICcuL2NvbnN0YW50cyc7XG5pbXBvcnQge2Nsb3Nlc3R9IGZyb20gJy4vcG9seWZpbGwnO1xuXG4vKiogVGhlIGRlbGF5IGFwcGxpZWQgdG8gbW91c2UgZXZlbnRzIGJlZm9yZSBoaWRpbmcgb3Igc2hvd2luZyBob3ZlciBjb250ZW50LiAqL1xuY29uc3QgTU9VU0VfRVZFTlRfREVMQVlfTVMgPSA0MDtcblxuLyoqIFRoZSBkZWxheSBmb3IgcmVhY3RpbmcgdG8gZm9jdXMvYmx1ciBjaGFuZ2VzLiAqL1xuY29uc3QgRk9DVVNfREVMQVkgPSAwO1xuXG4vKipcbiAqIFRoZSBwb3NzaWJsZSBzdGF0ZXMgZm9yIGhvdmVyIGNvbnRlbnQ6XG4gKiBPRkYgLSBOb3QgcmVuZGVyZWQuXG4gKiBGT0NVU0FCTEUgLSBSZW5kZXJlZCBpbiB0aGUgZG9tIGFuZCBzdHlsZWQgZm9yIGl0cyBjb250ZW50cyB0byBiZSBmb2N1c2FibGUgYnV0IGludmlzaWJsZS5cbiAqIE9OIC0gUmVuZGVyZWQgYW5kIGZ1bGx5IHZpc2libGUuXG4gKi9cbmV4cG9ydCBjb25zdCBlbnVtIEhvdmVyQ29udGVudFN0YXRlIHtcbiAgT0ZGID0gMCxcbiAgRk9DVVNBQkxFLFxuICBPTixcbn1cblxuLy8gTm90ZTogdGhpcyBjbGFzcyBpcyBnZW5lcmljLCByYXRoZXIgdGhhbiByZWZlcmVuY2luZyBFZGl0UmVmIGRpcmVjdGx5LCBpbiBvcmRlciB0byBhdm9pZFxuLy8gY2lyY3VsYXIgaW1wb3J0cy4gSWYgd2Ugd2VyZSB0byByZWZlcmVuY2UgaXQgaGVyZSwgaW1wb3J0aW5nIHRoZSByZWdpc3RyeSBpbnRvIHRoZVxuLy8gY2xhc3MgdGhhdCBpcyByZWdpc3RlcmluZyBpdHNlbGYgd2lsbCBpbnRyb2R1Y2UgYSBjaXJjdWxhciBpbXBvcnQuXG5cbi8qKlxuICogU2VydmljZSBmb3Igc2hhcmluZyBkZWxlZ2F0ZWQgZXZlbnRzIGFuZCBzdGF0ZSBmb3IgdHJpZ2dlcmluZyB0YWJsZSBlZGl0cy5cbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEVkaXRFdmVudERpc3BhdGNoZXI8Uj4ge1xuICAvKiogQSBzdWJqZWN0IHRoYXQgaW5kaWNhdGVzIHdoaWNoIHRhYmxlIGNlbGwgaXMgY3VycmVudGx5IGVkaXRpbmcgKHVubGVzcyBpdCBpcyBkaXNhYmxlZCkuICovXG4gIHJlYWRvbmx5IGVkaXRpbmcgPSBuZXcgU3ViamVjdDxFbGVtZW50IHwgbnVsbD4oKTtcblxuICAvKiogQSBzdWJqZWN0IHRoYXQgaW5kaWNhdGVzIHdoaWNoIHRhYmxlIHJvdyBpcyBjdXJyZW50bHkgaG92ZXJlZC4gKi9cbiAgcmVhZG9ubHkgaG92ZXJpbmcgPSBuZXcgU3ViamVjdDxFbGVtZW50IHwgbnVsbD4oKTtcblxuICAvKiogQSBzdWJqZWN0IHRoYXQgaW5kaWNhdGVzIHdoaWNoIHRhYmxlIHJvdyBjdXJyZW50bHkgY29udGFpbnMgZm9jdXMuICovXG4gIHJlYWRvbmx5IGZvY3VzZWQgPSBuZXcgU3ViamVjdDxFbGVtZW50IHwgbnVsbD4oKTtcblxuICAvKiogQSBzdWJqZWN0IHRoYXQgaW5kaWNhdGVzIGFsbCBlbGVtZW50cyBpbiB0aGUgdGFibGUgbWF0Y2hpbmcgUk9XX1NFTEVDVE9SLiAqL1xuICByZWFkb25seSBhbGxSb3dzID0gbmV3IFN1YmplY3Q8Tm9kZUxpc3Q+KCk7XG5cbiAgLyoqIEEgc3ViamVjdCB0aGF0IGVtaXRzIG1vdXNlIG1vdmUgZXZlbnRzIGZyb20gdGhlIHRhYmxlIGluZGljYXRpbmcgdGhlIHRhcmdldGVkIHJvdy4gKi9cbiAgcmVhZG9ubHkgbW91c2VNb3ZlID0gbmV3IFN1YmplY3Q8RWxlbWVudCB8IG51bGw+KCk7XG5cbiAgLy8gVE9ETzogVXNlIFdlYWtTZXQgb25jZSBJRTExIHN1cHBvcnQgaXMgZHJvcHBlZC5cbiAgLyoqXG4gICAqIFRyYWNrcyB0aGUgY3VycmVudGx5IGRpc2FibGVkIGVkaXRhYmxlIGNlbGxzIC0gZWRpdCBjYWxscyB3aWxsIGJlIGlnbm9yZWRcbiAgICogZm9yIHRoZXNlIGNlbGxzLlxuICAgKi9cbiAgcmVhZG9ubHkgZGlzYWJsZWRDZWxscyA9IG5ldyBXZWFrTWFwPEVsZW1lbnQsIGJvb2xlYW4+KCk7XG5cbiAgLyoqIFRoZSBFZGl0UmVmIGZvciB0aGUgY3VycmVudGx5IGFjdGl2ZSBlZGl0IGxlbnMgKGlmIGFueSkuICovXG4gIGdldCBlZGl0UmVmKCk6IFIgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5fZWRpdFJlZjtcbiAgfVxuICBwcml2YXRlIF9lZGl0UmVmOiBSIHwgbnVsbCA9IG51bGw7XG5cbiAgLy8gT3B0aW1pemF0aW9uOiBQcmVjb21wdXRlIGNvbW1vbiBwaXBlYWJsZSBvcGVyYXRvcnMgdXNlZCBwZXIgcm93L2NlbGwuXG4gIHByaXZhdGUgcmVhZG9ubHkgX2Rpc3RpbmN0VW50aWxDaGFuZ2VkID0gZGlzdGluY3RVbnRpbENoYW5nZWQ8XG4gICAgRWxlbWVudCB8IEhvdmVyQ29udGVudFN0YXRlIHwgYm9vbGVhbiB8IG51bGxcbiAgPigpO1xuICBwcml2YXRlIHJlYWRvbmx5IF9zdGFydFdpdGhOdWxsID0gc3RhcnRXaXRoPEVsZW1lbnQgfCBudWxsPihudWxsKTtcbiAgcHJpdmF0ZSByZWFkb25seSBfZGlzdGluY3RTaGFyZSA9IHBpcGUoXG4gICAgdGhpcy5fZGlzdGluY3RVbnRpbENoYW5nZWQgYXMgTW9ub1R5cGVPcGVyYXRvckZ1bmN0aW9uPEhvdmVyQ29udGVudFN0YXRlPixcbiAgICBzaGFyZVJlcGxheSgxKSxcbiAgKTtcbiAgcHJpdmF0ZSByZWFkb25seSBfc3RhcnRXaXRoTnVsbERpc3RpbmN0ID0gcGlwZShcbiAgICB0aGlzLl9zdGFydFdpdGhOdWxsLFxuICAgIHRoaXMuX2Rpc3RpbmN0VW50aWxDaGFuZ2VkIGFzIE1vbm9UeXBlT3BlcmF0b3JGdW5jdGlvbjxFbGVtZW50IHwgbnVsbD4sXG4gICk7XG5cbiAgcmVhZG9ubHkgZWRpdGluZ0FuZEVuYWJsZWQgPSB0aGlzLmVkaXRpbmcucGlwZShcbiAgICBmaWx0ZXIoY2VsbCA9PiBjZWxsID09IG51bGwgfHwgIXRoaXMuZGlzYWJsZWRDZWxscy5oYXMoY2VsbCkpLFxuICAgIHNoYXJlUmVwbGF5KDEpLFxuICApO1xuXG4gIC8qKiBBbiBvYnNlcnZhYmxlIHRoYXQgZW1pdHMgdGhlIHJvdyBjb250YWluaW5nIGZvY3VzIG9yIGFuIGFjdGl2ZSBlZGl0LiAqL1xuICByZWFkb25seSBlZGl0aW5nT3JGb2N1c2VkID0gY29tYmluZUxhdGVzdChbXG4gICAgdGhpcy5lZGl0aW5nQW5kRW5hYmxlZC5waXBlKFxuICAgICAgbWFwKGNlbGwgPT4gY2xvc2VzdChjZWxsLCBST1dfU0VMRUNUT1IpKSxcbiAgICAgIHRoaXMuX3N0YXJ0V2l0aE51bGwsXG4gICAgKSxcbiAgICB0aGlzLmZvY3VzZWQucGlwZSh0aGlzLl9zdGFydFdpdGhOdWxsKSxcbiAgXSkucGlwZShcbiAgICBtYXAoKFtlZGl0aW5nUm93LCBmb2N1c2VkUm93XSkgPT4gZm9jdXNlZFJvdyB8fCBlZGl0aW5nUm93KSxcbiAgICB0aGlzLl9kaXN0aW5jdFVudGlsQ2hhbmdlZCBhcyBNb25vVHlwZU9wZXJhdG9yRnVuY3Rpb248RWxlbWVudCB8IG51bGw+LFxuICAgIGF1ZGl0VGltZShGT0NVU19ERUxBWSksIC8vIFVzZSBhdWRpdCB0byBza2lwIG92ZXIgYmx1ciBldmVudHMgdG8gdGhlIG5leHQgZm9jdXNlZCBlbGVtZW50LlxuICAgIHRoaXMuX2Rpc3RpbmN0VW50aWxDaGFuZ2VkIGFzIE1vbm9UeXBlT3BlcmF0b3JGdW5jdGlvbjxFbGVtZW50IHwgbnVsbD4sXG4gICAgc2hhcmVSZXBsYXkoMSksXG4gICk7XG5cbiAgLyoqIFRyYWNrcyByb3dzIHRoYXQgY29udGFpbiBob3ZlciBjb250ZW50IHdpdGggYSByZWZlcmVuY2UgY291bnQuICovXG4gIHByaXZhdGUgX3Jvd3NXaXRoSG92ZXJDb250ZW50ID0gbmV3IFdlYWtNYXA8RWxlbWVudCwgbnVtYmVyPigpO1xuXG4gIC8qKiBUaGUgdGFibGUgY2VsbCB0aGF0IGhhcyBhbiBhY3RpdmUgZWRpdCBsZW5zIChvciBudWxsKS4gKi9cbiAgcHJpdmF0ZSBfY3VycmVudGx5RWRpdGluZzogRWxlbWVudCB8IG51bGwgPSBudWxsO1xuXG4gIC8qKiBUaGUgY29tYmluZWQgc2V0IG9mIHJvdyBob3ZlciBjb250ZW50IHN0YXRlcyBvcmdhbml6ZWQgYnkgcm93LiAqL1xuICBwcml2YXRlIHJlYWRvbmx5IF9ob3ZlcmVkQ29udGVudFN0YXRlRGlzdGluY3QgPSBjb21iaW5lTGF0ZXN0KFtcbiAgICB0aGlzLl9nZXRGaXJzdFJvd1dpdGhIb3ZlckNvbnRlbnQoKSxcbiAgICB0aGlzLl9nZXRMYXN0Um93V2l0aEhvdmVyQ29udGVudCgpLFxuICAgIHRoaXMuZWRpdGluZ09yRm9jdXNlZCxcbiAgICB0aGlzLmhvdmVyaW5nLnBpcGUoXG4gICAgICBkaXN0aW5jdFVudGlsQ2hhbmdlZCgpLFxuICAgICAgYXVkaXQocm93ID0+XG4gICAgICAgIHRoaXMubW91c2VNb3ZlLnBpcGUoXG4gICAgICAgICAgZmlsdGVyKG1vdXNlTW92ZVJvdyA9PiByb3cgPT09IG1vdXNlTW92ZVJvdyksXG4gICAgICAgICAgdGhpcy5fc3RhcnRXaXRoTnVsbCxcbiAgICAgICAgICBkZWJvdW5jZVRpbWUoTU9VU0VfRVZFTlRfREVMQVlfTVMpLFxuICAgICAgICApLFxuICAgICAgKSxcbiAgICAgIHRoaXMuX3N0YXJ0V2l0aE51bGxEaXN0aW5jdCxcbiAgICApLFxuICBdKS5waXBlKFxuICAgIHNraXAoMSksIC8vIFNraXAgdGhlIGluaXRpYWwgZW1pc3Npb24gb2YgW251bGwsIG51bGwsIG51bGwsIG51bGxdLlxuICAgIG1hcChjb21wdXRlSG92ZXJDb250ZW50U3RhdGUpLFxuICAgIGRpc3RpbmN0VW50aWxDaGFuZ2VkKGFyZU1hcEVudHJpZXNFcXVhbCksXG4gICAgLy8gT3B0aW1pemF0aW9uOiBFbnRlciB0aGUgem9uZSBiZWZvcmUgc2hhcmVSZXBsYXkgc28gdGhhdCB3ZSB0cmlnZ2VyIGEgc2luZ2xlXG4gICAgLy8gQXBwbGljYXRpb25SZWYudGljayBmb3IgYWxsIHJvdyB1cGRhdGVzLlxuICAgIHRoaXMuX2VudGVyWm9uZSgpLFxuICAgIHNoYXJlUmVwbGF5KDEpLFxuICApO1xuXG4gIHByaXZhdGUgcmVhZG9ubHkgX2VkaXRpbmdBbmRFbmFibGVkRGlzdGluY3QgPSB0aGlzLmVkaXRpbmdBbmRFbmFibGVkLnBpcGUoXG4gICAgZGlzdGluY3RVbnRpbENoYW5nZWQoKSxcbiAgICB0aGlzLl9lbnRlclpvbmUoKSxcbiAgICBzaGFyZVJlcGxheSgxKSxcbiAgKTtcblxuICAvLyBPcHRpbWl6YXRpb246IFNoYXJlIHJvdyBldmVudHMgb2JzZXJ2YWJsZSB3aXRoIHN1YnNlcXVlbnQgY2FsbGVycy5cbiAgLy8gQXQgc3RhcnR1cCwgY2FsbHMgd2lsbCBiZSBzZXF1ZW50aWFsIGJ5IHJvdy5cbiAgcHJpdmF0ZSBfbGFzdFNlZW5Sb3c6IEVsZW1lbnQgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBfbGFzdFNlZW5Sb3dIb3Zlck9yRm9jdXM6IE9ic2VydmFibGU8SG92ZXJDb250ZW50U3RhdGU+IHwgbnVsbCA9IG51bGw7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSByZWFkb25seSBfbmdab25lOiBOZ1pvbmUpIHtcbiAgICB0aGlzLl9lZGl0aW5nQW5kRW5hYmxlZERpc3RpbmN0LnN1YnNjcmliZShjZWxsID0+IHtcbiAgICAgIHRoaXMuX2N1cnJlbnRseUVkaXRpbmcgPSBjZWxsO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgYW4gT2JzZXJ2YWJsZSB0aGF0IGVtaXRzIHRydWUgd2hlbiB0aGUgc3BlY2lmaWVkIGVsZW1lbnQncyBjZWxsXG4gICAqIGlzIGVkaXRpbmcgYW5kIGZhbHNlIHdoZW4gbm90LlxuICAgKi9cbiAgZWRpdGluZ0NlbGwoZWxlbWVudDogRWxlbWVudCB8IEV2ZW50VGFyZ2V0KTogT2JzZXJ2YWJsZTxib29sZWFuPiB7XG4gICAgbGV0IGNlbGw6IEVsZW1lbnQgfCBudWxsID0gbnVsbDtcblxuICAgIHJldHVybiB0aGlzLl9lZGl0aW5nQW5kRW5hYmxlZERpc3RpbmN0LnBpcGUoXG4gICAgICBtYXAoZWRpdENlbGwgPT4gZWRpdENlbGwgPT09IChjZWxsIHx8IChjZWxsID0gY2xvc2VzdChlbGVtZW50LCBDRUxMX1NFTEVDVE9SKSkpKSxcbiAgICAgIHRoaXMuX2Rpc3RpbmN0VW50aWxDaGFuZ2VkIGFzIE1vbm9UeXBlT3BlcmF0b3JGdW5jdGlvbjxib29sZWFuPixcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0b3BzIGVkaXRpbmcgZm9yIHRoZSBzcGVjaWZpZWQgY2VsbC4gSWYgdGhlIHNwZWNpZmllZCBjZWxsIGlzIG5vdCB0aGUgY3VycmVudFxuICAgKiBlZGl0IGNlbGwsIGRvZXMgbm90aGluZy5cbiAgICovXG4gIGRvbmVFZGl0aW5nQ2VsbChlbGVtZW50OiBFbGVtZW50IHwgRXZlbnRUYXJnZXQpOiB2b2lkIHtcbiAgICBjb25zdCBjZWxsID0gY2xvc2VzdChlbGVtZW50LCBDRUxMX1NFTEVDVE9SKTtcblxuICAgIGlmICh0aGlzLl9jdXJyZW50bHlFZGl0aW5nID09PSBjZWxsKSB7XG4gICAgICB0aGlzLmVkaXRpbmcubmV4dChudWxsKTtcbiAgICB9XG4gIH1cblxuICAvKiogU2V0cyB0aGUgY3VycmVudGx5IGFjdGl2ZSBFZGl0UmVmLiAqL1xuICBzZXRBY3RpdmVFZGl0UmVmKHJlZjogUikge1xuICAgIHRoaXMuX2VkaXRSZWYgPSByZWY7XG4gIH1cblxuICAvKiogVW5zZXQgdGhlIGN1cnJlbnRseSBhY3RpdmUgRWRpdFJlZiwgaWYgdGhlIHNwZWNpZmllZCBlZGl0UmVmIGlzIGFjdGl2ZS4gKi9cbiAgdW5zZXRBY3RpdmVFZGl0UmVmKHJlZjogUikge1xuICAgIGlmICh0aGlzLl9lZGl0UmVmICE9PSByZWYpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl9lZGl0UmVmID0gbnVsbDtcbiAgfVxuXG4gIC8qKiBBZGRzIHRoZSBzcGVjaWZpZWQgdGFibGUgcm93IHRvIGJlIHRyYWNrZWQgZm9yIGZpcnN0L2xhc3Qgcm93IGNvbXBhcmlzb25zLiAqL1xuICByZWdpc3RlclJvd1dpdGhIb3ZlckNvbnRlbnQocm93OiBFbGVtZW50KTogdm9pZCB7XG4gICAgdGhpcy5fcm93c1dpdGhIb3ZlckNvbnRlbnQuc2V0KHJvdywgKHRoaXMuX3Jvd3NXaXRoSG92ZXJDb250ZW50LmdldChyb3cpIHx8IDApICsgMSk7XG4gIH1cblxuICAvKipcbiAgICogUmVmZXJlbmNlIGRlY3JlbWVudHMgYW5kIHVsdGltYXRlbHkgcmVtb3ZlcyB0aGUgc3BlY2lmaWVkIHRhYmxlIHJvdyBmcm9tIGZpcnN0L2xhc3Qgcm93XG4gICAqIGNvbXBhcmlzb25zLlxuICAgKi9cbiAgZGVyZWdpc3RlclJvd1dpdGhIb3ZlckNvbnRlbnQocm93OiBFbGVtZW50KTogdm9pZCB7XG4gICAgY29uc3QgcmVmQ291bnQgPSB0aGlzLl9yb3dzV2l0aEhvdmVyQ29udGVudC5nZXQocm93KSB8fCAwO1xuXG4gICAgaWYgKHJlZkNvdW50IDw9IDEpIHtcbiAgICAgIHRoaXMuX3Jvd3NXaXRoSG92ZXJDb250ZW50LmRlbGV0ZShyb3cpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9yb3dzV2l0aEhvdmVyQ29udGVudC5zZXQocm93LCByZWZDb3VudCAtIDEpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIGFuIE9ic2VydmFibGUgdGhhdCBlbWl0cyB0cnVlIHdoZW4gdGhlIHNwZWNpZmllZCBlbGVtZW50J3Mgcm93XG4gICAqIGNvbnRhaW5zIHRoZSBmb2N1c2VkIGVsZW1lbnQgb3IgaXMgYmVpbmcgaG92ZXJlZCBvdmVyIGFuZCBmYWxzZSB3aGVuIG5vdC5cbiAgICogSG92ZXJpbmcgaXMgZGVmaW5lZCBhcyB3aGVuIHRoZSBtb3VzZSBoYXMgbW9tZW50YXJpbHkgc3RvcHBlZCBtb3Zpbmcgb3ZlciB0aGUgY2VsbC5cbiAgICovXG4gIGhvdmVyT3JGb2N1c09uUm93KHJvdzogRWxlbWVudCk6IE9ic2VydmFibGU8SG92ZXJDb250ZW50U3RhdGU+IHtcbiAgICBpZiAocm93ICE9PSB0aGlzLl9sYXN0U2VlblJvdykge1xuICAgICAgdGhpcy5fbGFzdFNlZW5Sb3cgPSByb3c7XG4gICAgICB0aGlzLl9sYXN0U2VlblJvd0hvdmVyT3JGb2N1cyA9IHRoaXMuX2hvdmVyZWRDb250ZW50U3RhdGVEaXN0aW5jdC5waXBlKFxuICAgICAgICBtYXAoc3RhdGUgPT4gc3RhdGUuZ2V0KHJvdykgfHwgSG92ZXJDb250ZW50U3RhdGUuT0ZGKSxcbiAgICAgICAgdGhpcy5fZGlzdGluY3RTaGFyZSxcbiAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX2xhc3RTZWVuUm93SG92ZXJPckZvY3VzITtcbiAgfVxuXG4gIC8qKlxuICAgKiBSeEpTIG9wZXJhdG9yIHRoYXQgZW50ZXJzIHRoZSBBbmd1bGFyIHpvbmUsIHVzZWQgdG8gcmVkdWNlIGJvaWxlcnBsYXRlIGluXG4gICAqIHJlLWVudGVyaW5nIHRoZSB6b25lIGZvciBzdHJlYW0gcGlwZWxpbmVzLlxuICAgKi9cbiAgcHJpdmF0ZSBfZW50ZXJab25lPFQ+KCk6IE1vbm9UeXBlT3BlcmF0b3JGdW5jdGlvbjxUPiB7XG4gICAgcmV0dXJuIChzb3VyY2U6IE9ic2VydmFibGU8VD4pID0+XG4gICAgICBuZXcgT2JzZXJ2YWJsZTxUPihvYnNlcnZlciA9PlxuICAgICAgICBzb3VyY2Uuc3Vic2NyaWJlKHtcbiAgICAgICAgICBuZXh0OiB2YWx1ZSA9PiB0aGlzLl9uZ1pvbmUucnVuKCgpID0+IG9ic2VydmVyLm5leHQodmFsdWUpKSxcbiAgICAgICAgICBlcnJvcjogZXJyID0+IG9ic2VydmVyLmVycm9yKGVyciksXG4gICAgICAgICAgY29tcGxldGU6ICgpID0+IG9ic2VydmVyLmNvbXBsZXRlKCksXG4gICAgICAgIH0pLFxuICAgICAgKTtcbiAgfVxuXG4gIHByaXZhdGUgX2dldEZpcnN0Um93V2l0aEhvdmVyQ29udGVudCgpOiBPYnNlcnZhYmxlPEVsZW1lbnQgfCBudWxsPiB7XG4gICAgcmV0dXJuIHRoaXMuX21hcEFsbFJvd3NUb1NpbmdsZVJvdyhyb3dzID0+IHtcbiAgICAgIGZvciAobGV0IGkgPSAwLCByb3c7IChyb3cgPSByb3dzW2ldKTsgaSsrKSB7XG4gICAgICAgIGlmICh0aGlzLl9yb3dzV2l0aEhvdmVyQ29udGVudC5oYXMocm93IGFzIEVsZW1lbnQpKSB7XG4gICAgICAgICAgcmV0dXJuIHJvdyBhcyBFbGVtZW50O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX2dldExhc3RSb3dXaXRoSG92ZXJDb250ZW50KCk6IE9ic2VydmFibGU8RWxlbWVudCB8IG51bGw+IHtcbiAgICByZXR1cm4gdGhpcy5fbWFwQWxsUm93c1RvU2luZ2xlUm93KHJvd3MgPT4ge1xuICAgICAgZm9yIChsZXQgaSA9IHJvd3MubGVuZ3RoIC0gMSwgcm93OyAocm93ID0gcm93c1tpXSk7IGktLSkge1xuICAgICAgICBpZiAodGhpcy5fcm93c1dpdGhIb3ZlckNvbnRlbnQuaGFzKHJvdyBhcyBFbGVtZW50KSkge1xuICAgICAgICAgIHJldHVybiByb3cgYXMgRWxlbWVudDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIF9tYXBBbGxSb3dzVG9TaW5nbGVSb3coXG4gICAgbWFwcGVyOiAocm93czogTm9kZUxpc3QpID0+IEVsZW1lbnQgfCBudWxsLFxuICApOiBPYnNlcnZhYmxlPEVsZW1lbnQgfCBudWxsPiB7XG4gICAgcmV0dXJuIHRoaXMuYWxsUm93cy5waXBlKG1hcChtYXBwZXIpLCB0aGlzLl9zdGFydFdpdGhOdWxsRGlzdGluY3QpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNvbXB1dGVIb3ZlckNvbnRlbnRTdGF0ZShbXG4gIGZpcnN0Um93LFxuICBsYXN0Um93LFxuICBhY3RpdmVSb3csXG4gIGhvdmVyUm93LFxuXTogKEVsZW1lbnQgfCBudWxsKVtdKTogTWFwPEVsZW1lbnQsIEhvdmVyQ29udGVudFN0YXRlPiB7XG4gIGNvbnN0IGhvdmVyQ29udGVudFN0YXRlID0gbmV3IE1hcDxFbGVtZW50LCBIb3ZlckNvbnRlbnRTdGF0ZT4oKTtcblxuICAvLyBBZGQgZm9jdXNhYmxlIHJvd3MuXG4gIGZvciAoY29uc3QgZm9jdXNzYWJsZVJvdyBvZiBbXG4gICAgZmlyc3RSb3csXG4gICAgbGFzdFJvdyxcbiAgICBhY3RpdmVSb3cgJiYgYWN0aXZlUm93LnByZXZpb3VzRWxlbWVudFNpYmxpbmcsXG4gICAgYWN0aXZlUm93ICYmIGFjdGl2ZVJvdy5uZXh0RWxlbWVudFNpYmxpbmcsXG4gIF0pIHtcbiAgICBpZiAoZm9jdXNzYWJsZVJvdykge1xuICAgICAgaG92ZXJDb250ZW50U3RhdGUuc2V0KGZvY3Vzc2FibGVSb3cgYXMgRWxlbWVudCwgSG92ZXJDb250ZW50U3RhdGUuRk9DVVNBQkxFKTtcbiAgICB9XG4gIH1cblxuICAvLyBBZGQvb3ZlcndyaXRlIHdpdGggZnVsbHkgdmlzaWJsZSByb3dzLlxuICBmb3IgKGNvbnN0IG9uUm93IG9mIFthY3RpdmVSb3csIGhvdmVyUm93XSkge1xuICAgIGlmIChvblJvdykge1xuICAgICAgaG92ZXJDb250ZW50U3RhdGUuc2V0KG9uUm93LCBIb3ZlckNvbnRlbnRTdGF0ZS5PTik7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGhvdmVyQ29udGVudFN0YXRlO1xufVxuXG5mdW5jdGlvbiBhcmVNYXBFbnRyaWVzRXF1YWw8SywgVj4oYTogTWFwPEssIFY+LCBiOiBNYXA8SywgVj4pOiBib29sZWFuIHtcbiAgaWYgKGEuc2l6ZSAhPT0gYi5zaXplKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gVE9ETzogdXNlIE1hcC5wcm90b3R5cGUuZW50cmllcyBvbmNlIHdlJ3JlIG9mZiBJRTExLlxuICBmb3IgKGNvbnN0IGFLZXkgb2YgQXJyYXkuZnJvbShhLmtleXMoKSkpIHtcbiAgICBpZiAoYi5nZXQoYUtleSkgIT09IGEuZ2V0KGFLZXkpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59XG4iXX0=