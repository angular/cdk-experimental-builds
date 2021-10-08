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
export class EditEventDispatcher {
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
EditEventDispatcher.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.0-next.15", ngImport: i0, type: EditEventDispatcher, deps: [{ token: i0.NgZone }], target: i0.ɵɵFactoryTarget.Injectable });
EditEventDispatcher.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.0-next.15", ngImport: i0, type: EditEventDispatcher });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.0-next.15", ngImport: i0, type: EditEventDispatcher, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: i0.NgZone }]; } });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdC1ldmVudC1kaXNwYXRjaGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvcG9wb3Zlci1lZGl0L2VkaXQtZXZlbnQtZGlzcGF0Y2hlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUNqRCxPQUFPLEVBQUMsYUFBYSxFQUE0QixVQUFVLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUN4RixPQUFPLEVBQ0wsS0FBSyxFQUNMLFNBQVMsRUFDVCxZQUFZLEVBQ1osb0JBQW9CLEVBQ3BCLE1BQU0sRUFDTixHQUFHLEVBQ0gsSUFBSSxFQUNKLFNBQVMsRUFDVCxXQUFXLEdBQ1osTUFBTSxnQkFBZ0IsQ0FBQztBQUV4QixPQUFPLEVBQUMsYUFBYSxFQUFFLFlBQVksRUFBQyxNQUFNLGFBQWEsQ0FBQztBQUN4RCxPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sWUFBWSxDQUFDOztBQUVuQyxnRkFBZ0Y7QUFDaEYsTUFBTSxvQkFBb0IsR0FBRyxFQUFFLENBQUM7QUFFaEMsb0RBQW9EO0FBQ3BELE1BQU0sV0FBVyxHQUFHLENBQUMsQ0FBQztBQWN0QiwyRkFBMkY7QUFDM0YscUZBQXFGO0FBQ3JGLHFFQUFxRTtBQUVyRTs7R0FFRztBQUVILE1BQU0sT0FBTyxtQkFBbUI7SUF1RzlCLFlBQTZCLE9BQWU7UUFBZixZQUFPLEdBQVAsT0FBTyxDQUFRO1FBdEc1Qyw4RkFBOEY7UUFDckYsWUFBTyxHQUFHLElBQUksT0FBTyxFQUFnQixDQUFDO1FBRS9DLHFFQUFxRTtRQUM1RCxhQUFRLEdBQUcsSUFBSSxPQUFPLEVBQWdCLENBQUM7UUFFaEQseUVBQXlFO1FBQ2hFLFlBQU8sR0FBRyxJQUFJLE9BQU8sRUFBZ0IsQ0FBQztRQUUvQyxnRkFB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QUNyQixPQUFPLEtBQUssQ0FBQztLQUNkO0lBRUQsdURBQXVEO0lBQ3ZELEtBQUssTUFBTSxJQUFJLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRTtRQUN2QyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUMvQixPQUFPLEtBQUssQ0FBQztTQUNkO0tBQ0Y7SUFFRCxPQUFPLElBQUksQ0FBQztBQUNkLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtJbmplY3RhYmxlLCBOZ1pvbmV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtjb21iaW5lTGF0ZXN0LCBNb25vVHlwZU9wZXJhdG9yRnVuY3Rpb24sIE9ic2VydmFibGUsIHBpcGUsIFN1YmplY3R9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHtcbiAgYXVkaXQsXG4gIGF1ZGl0VGltZSxcbiAgZGVib3VuY2VUaW1lLFxuICBkaXN0aW5jdFVudGlsQ2hhbmdlZCxcbiAgZmlsdGVyLFxuICBtYXAsXG4gIHNraXAsXG4gIHN0YXJ0V2l0aCxcbiAgc2hhcmVSZXBsYXksXG59IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcblxuaW1wb3J0IHtDRUxMX1NFTEVDVE9SLCBST1dfU0VMRUNUT1J9IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCB7Y2xvc2VzdH0gZnJvbSAnLi9wb2x5ZmlsbCc7XG5cbi8qKiBUaGUgZGVsYXkgYXBwbGllZCB0byBtb3VzZSBldmVudHMgYmVmb3JlIGhpZGluZyBvciBzaG93aW5nIGhvdmVyIGNvbnRlbnQuICovXG5jb25zdCBNT1VTRV9FVkVOVF9ERUxBWV9NUyA9IDQwO1xuXG4vKiogVGhlIGRlbGF5IGZvciByZWFjdGluZyB0byBmb2N1cy9ibHVyIGNoYW5nZXMuICovXG5jb25zdCBGT0NVU19ERUxBWSA9IDA7XG5cbi8qKlxuICogVGhlIHBvc3NpYmxlIHN0YXRlcyBmb3IgaG92ZXIgY29udGVudDpcbiAqIE9GRiAtIE5vdCByZW5kZXJlZC5cbiAqIEZPQ1VTQUJMRSAtIFJlbmRlcmVkIGluIHRoZSBkb20gYW5kIHN0eWxlZCBmb3IgaXRzIGNvbnRlbnRzIHRvIGJlIGZvY3VzYWJsZSBidXQgaW52aXNpYmxlLlxuICogT04gLSBSZW5kZXJlZCBhbmQgZnVsbHkgdmlzaWJsZS5cbiAqL1xuZXhwb3J0IGNvbnN0IGVudW0gSG92ZXJDb250ZW50U3RhdGUge1xuICBPRkYgPSAwLFxuICBGT0NVU0FCTEUsXG4gIE9OLFxufVxuXG4vLyBOb3RlOiB0aGlzIGNsYXNzIGlzIGdlbmVyaWMsIHJhdGhlciB0aGFuIHJlZmVyZW5jaW5nIEVkaXRSZWYgZGlyZWN0bHksIGluIG9yZGVyIHRvIGF2b2lkXG4vLyBjaXJjdWxhciBpbXBvcnRzLiBJZiB3ZSB3ZXJlIHRvIHJlZmVyZW5jZSBpdCBoZXJlLCBpbXBvcnRpbmcgdGhlIHJlZ2lzdHJ5IGludG8gdGhlXG4vLyBjbGFzcyB0aGF0IGlzIHJlZ2lzdGVyaW5nIGl0c2VsZiB3aWxsIGludHJvZHVjZSBhIGNpcmN1bGFyIGltcG9ydC5cblxuLyoqXG4gKiBTZXJ2aWNlIGZvciBzaGFyaW5nIGRlbGVnYXRlZCBldmVudHMgYW5kIHN0YXRlIGZvciB0cmlnZ2VyaW5nIHRhYmxlIGVkaXRzLlxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgRWRpdEV2ZW50RGlzcGF0Y2hlcjxSPiB7XG4gIC8qKiBBIHN1YmplY3QgdGhhdCBpbmRpY2F0ZXMgd2hpY2ggdGFibGUgY2VsbCBpcyBjdXJyZW50bHkgZWRpdGluZyAodW5sZXNzIGl0IGlzIGRpc2FibGVkKS4gKi9cbiAgcmVhZG9ubHkgZWRpdGluZyA9IG5ldyBTdWJqZWN0PEVsZW1lbnR8bnVsbD4oKTtcblxuICAvKiogQSBzdWJqZWN0IHRoYXQgaW5kaWNhdGVzIHdoaWNoIHRhYmxlIHJvdyBpcyBjdXJyZW50bHkgaG92ZXJlZC4gKi9cbiAgcmVhZG9ubHkgaG92ZXJpbmcgPSBuZXcgU3ViamVjdDxFbGVtZW50fG51bGw+KCk7XG5cbiAgLyoqIEEgc3ViamVjdCB0aGF0IGluZGljYXRlcyB3aGljaCB0YWJsZSByb3cgY3VycmVudGx5IGNvbnRhaW5zIGZvY3VzLiAqL1xuICByZWFkb25seSBmb2N1c2VkID0gbmV3IFN1YmplY3Q8RWxlbWVudHxudWxsPigpO1xuXG4gIC8qKiBBIHN1YmplY3QgdGhhdCBpbmRpY2F0ZXMgYWxsIGVsZW1lbnRzIGluIHRoZSB0YWJsZSBtYXRjaGluZyBST1dfU0VMRUNUT1IuICovXG4gIHJlYWRvbmx5IGFsbFJvd3MgPSBuZXcgU3ViamVjdDxOb2RlTGlzdD4oKTtcblxuICAvKiogQSBzdWJqZWN0IHRoYXQgZW1pdHMgbW91c2UgbW92ZSBldmVudHMgZnJvbSB0aGUgdGFibGUgaW5kaWNhdGluZyB0aGUgdGFyZ2V0ZWQgcm93LiAqL1xuICByZWFkb25seSBtb3VzZU1vdmUgPSBuZXcgU3ViamVjdDxFbGVtZW50fG51bGw+KCk7XG5cbiAgLy8gVE9ETzogVXNlIFdlYWtTZXQgb25jZSBJRTExIHN1cHBvcnQgaXMgZHJvcHBlZC5cbiAgLyoqXG4gICAqIFRyYWNrcyB0aGUgY3VycmVudGx5IGRpc2FibGVkIGVkaXRhYmxlIGNlbGxzIC0gZWRpdCBjYWxscyB3aWxsIGJlIGlnbm9yZWRcbiAgICogZm9yIHRoZXNlIGNlbGxzLlxuICAgKi9cbiAgcmVhZG9ubHkgZGlzYWJsZWRDZWxscyA9IG5ldyBXZWFrTWFwPEVsZW1lbnQsIGJvb2xlYW4+KCk7XG5cbiAgLyoqIFRoZSBFZGl0UmVmIGZvciB0aGUgY3VycmVudGx5IGFjdGl2ZSBlZGl0IGxlbnMgKGlmIGFueSkuICovXG4gIGdldCBlZGl0UmVmKCk6IFJ8bnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuX2VkaXRSZWY7XG4gIH1cbiAgcHJpdmF0ZSBfZWRpdFJlZjogUnxudWxsID0gbnVsbDtcblxuICAvLyBPcHRpbWl6YXRpb246IFByZWNvbXB1dGUgY29tbW9uIHBpcGVhYmxlIG9wZXJhdG9ycyB1c2VkIHBlciByb3cvY2VsbC5cbiAgcHJpdmF0ZSByZWFkb25seSBfZGlzdGluY3RVbnRpbENoYW5nZWQgPVxuICAgICAgZGlzdGluY3RVbnRpbENoYW5nZWQ8RWxlbWVudHxIb3ZlckNvbnRlbnRTdGF0ZXxib29sZWFufG51bGw+KCk7XG4gIHByaXZhdGUgcmVhZG9ubHkgX3N0YXJ0V2l0aE51bGwgPSBzdGFydFdpdGg8RWxlbWVudHxudWxsPihudWxsKTtcbiAgcHJpdmF0ZSByZWFkb25seSBfZGlzdGluY3RTaGFyZSA9IHBpcGUoXG4gICAgdGhpcy5fZGlzdGluY3RVbnRpbENoYW5nZWQgYXMgTW9ub1R5cGVPcGVyYXRvckZ1bmN0aW9uPEhvdmVyQ29udGVudFN0YXRlPixcbiAgICBzaGFyZVJlcGxheSgxKSxcbiAgKTtcbiAgcHJpdmF0ZSByZWFkb25seSBfc3RhcnRXaXRoTnVsbERpc3RpbmN0ID0gcGlwZShcbiAgICB0aGlzLl9zdGFydFdpdGhOdWxsLFxuICAgIHRoaXMuX2Rpc3RpbmN0VW50aWxDaGFuZ2VkIGFzIE1vbm9UeXBlT3BlcmF0b3JGdW5jdGlvbjxFbGVtZW50fG51bGw+LFxuICApO1xuXG4gIHJlYWRvbmx5IGVkaXRpbmdBbmRFbmFibGVkID0gdGhpcy5lZGl0aW5nLnBpcGUoXG4gICAgICBmaWx0ZXIoY2VsbCA9PiBjZWxsID09IG51bGwgfHwgIXRoaXMuZGlzYWJsZWRDZWxscy5oYXMoY2VsbCkpLFxuICAgICAgc2hhcmVSZXBsYXkoMSksXG4gICk7XG5cbiAgLyoqIEFuIG9ic2VydmFibGUgdGhhdCBlbWl0cyB0aGUgcm93IGNvbnRhaW5pbmcgZm9jdXMgb3IgYW4gYWN0aXZlIGVkaXQuICovXG4gIHJlYWRvbmx5IGVkaXRpbmdPckZvY3VzZWQgPSBjb21iaW5lTGF0ZXN0KFtcbiAgICAgIHRoaXMuZWRpdGluZ0FuZEVuYWJsZWQucGlwZShcbiAgICAgICAgICBtYXAoY2VsbCA9PiBjbG9zZXN0KGNlbGwsIFJPV19TRUxFQ1RPUikpLFxuICAgICAgICAgIHRoaXMuX3N0YXJ0V2l0aE51bGwsXG4gICAgICApLFxuICAgICAgdGhpcy5mb2N1c2VkLnBpcGUodGhpcy5fc3RhcnRXaXRoTnVsbCksXG4gIF0pLnBpcGUoXG4gICAgICBtYXAoKFtlZGl0aW5nUm93LCBmb2N1c2VkUm93XSkgPT4gZm9jdXNlZFJvdyB8fCBlZGl0aW5nUm93KSxcbiAgICAgIHRoaXMuX2Rpc3RpbmN0VW50aWxDaGFuZ2VkIGFzIE1vbm9UeXBlT3BlcmF0b3JGdW5jdGlvbjxFbGVtZW50fG51bGw+LFxuICAgICAgYXVkaXRUaW1lKEZPQ1VTX0RFTEFZKSwgLy8gVXNlIGF1ZGl0IHRvIHNraXAgb3ZlciBibHVyIGV2ZW50cyB0byB0aGUgbmV4dCBmb2N1c2VkIGVsZW1lbnQuXG4gICAgICB0aGlzLl9kaXN0aW5jdFVudGlsQ2hhbmdlZCBhcyBNb25vVHlwZU9wZXJhdG9yRnVuY3Rpb248RWxlbWVudHxudWxsPixcbiAgICAgIHNoYXJlUmVwbGF5KDEpLFxuICApO1xuXG4gIC8qKiBUcmFja3Mgcm93cyB0aGF0IGNvbnRhaW4gaG92ZXIgY29udGVudCB3aXRoIGEgcmVmZXJlbmNlIGNvdW50LiAqL1xuICBwcml2YXRlIF9yb3dzV2l0aEhvdmVyQ29udGVudCA9IG5ldyBXZWFrTWFwPEVsZW1lbnQsIG51bWJlcj4oKTtcblxuICAvKiogVGhlIHRhYmxlIGNlbGwgdGhhdCBoYXMgYW4gYWN0aXZlIGVkaXQgbGVucyAob3IgbnVsbCkuICovXG4gIHByaXZhdGUgX2N1cnJlbnRseUVkaXRpbmc6IEVsZW1lbnR8bnVsbCA9IG51bGw7XG5cbiAgLyoqIFRoZSBjb21iaW5lZCBzZXQgb2Ygcm93IGhvdmVyIGNvbnRlbnQgc3RhdGVzIG9yZ2FuaXplZCBieSByb3cuICovXG4gIHByaXZhdGUgcmVhZG9ubHkgX2hvdmVyZWRDb250ZW50U3RhdGVEaXN0aW5jdCA9IGNvbWJpbmVMYXRlc3QoW1xuICAgICAgdGhpcy5fZ2V0Rmlyc3RSb3dXaXRoSG92ZXJDb250ZW50KCksXG4gICAgICB0aGlzLl9nZXRMYXN0Um93V2l0aEhvdmVyQ29udGVudCgpLFxuICAgICAgdGhpcy5lZGl0aW5nT3JGb2N1c2VkLFxuICAgICAgdGhpcy5ob3ZlcmluZy5waXBlKFxuICAgICAgICAgIGRpc3RpbmN0VW50aWxDaGFuZ2VkKCksXG4gICAgICAgICAgYXVkaXQocm93ID0+IHRoaXMubW91c2VNb3ZlLnBpcGUoXG4gICAgICAgICAgICAgIGZpbHRlcihtb3VzZU1vdmVSb3cgPT4gcm93ID09PSBtb3VzZU1vdmVSb3cpLFxuICAgICAgICAgICAgICB0aGlzLl9zdGFydFdpdGhOdWxsLFxuICAgICAgICAgICAgICBkZWJvdW5jZVRpbWUoTU9VU0VfRVZFTlRfREVMQVlfTVMpKSxcbiAgICAgICAgICApLFxuICAgICAgICAgIHRoaXMuX3N0YXJ0V2l0aE51bGxEaXN0aW5jdCxcbiAgICAgICksXG4gIF0pLnBpcGUoXG4gICAgICBza2lwKDEpLCAvLyBTa2lwIHRoZSBpbml0aWFsIGVtaXNzaW9uIG9mIFtudWxsLCBudWxsLCBudWxsLCBudWxsXS5cbiAgICAgIG1hcChjb21wdXRlSG92ZXJDb250ZW50U3RhdGUpLFxuICAgICAgZGlzdGluY3RVbnRpbENoYW5nZWQoYXJlTWFwRW50cmllc0VxdWFsKSxcbiAgICAgIC8vIE9wdGltaXphdGlvbjogRW50ZXIgdGhlIHpvbmUgYmVmb3JlIHNoYXJlUmVwbGF5IHNvIHRoYXQgd2UgdHJpZ2dlciBhIHNpbmdsZVxuICAgICAgLy8gQXBwbGljYXRpb25SZWYudGljayBmb3IgYWxsIHJvdyB1cGRhdGVzLlxuICAgICAgdGhpcy5fZW50ZXJab25lKCksXG4gICAgICBzaGFyZVJlcGxheSgxKSxcbiAgKTtcblxuICBwcml2YXRlIHJlYWRvbmx5IF9lZGl0aW5nQW5kRW5hYmxlZERpc3RpbmN0ID0gdGhpcy5lZGl0aW5nQW5kRW5hYmxlZC5waXBlKFxuICAgICAgZGlzdGluY3RVbnRpbENoYW5nZWQoKSxcbiAgICAgIHRoaXMuX2VudGVyWm9uZSgpLFxuICAgICAgc2hhcmVSZXBsYXkoMSksXG4gICk7XG5cbiAgLy8gT3B0aW1pemF0aW9uOiBTaGFyZSByb3cgZXZlbnRzIG9ic2VydmFibGUgd2l0aCBzdWJzZXF1ZW50IGNhbGxlcnMuXG4gIC8vIEF0IHN0YXJ0dXAsIGNhbGxzIHdpbGwgYmUgc2VxdWVudGlhbCBieSByb3cuXG4gIHByaXZhdGUgX2xhc3RTZWVuUm93OiBFbGVtZW50fG51bGwgPSBudWxsO1xuICBwcml2YXRlIF9sYXN0U2VlblJvd0hvdmVyT3JGb2N1czogT2JzZXJ2YWJsZTxIb3ZlckNvbnRlbnRTdGF0ZT58bnVsbCA9IG51bGw7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSByZWFkb25seSBfbmdab25lOiBOZ1pvbmUpIHtcbiAgICB0aGlzLl9lZGl0aW5nQW5kRW5hYmxlZERpc3RpbmN0LnN1YnNjcmliZShjZWxsID0+IHtcbiAgICAgIHRoaXMuX2N1cnJlbnRseUVkaXRpbmcgPSBjZWxsO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgYW4gT2JzZXJ2YWJsZSB0aGF0IGVtaXRzIHRydWUgd2hlbiB0aGUgc3BlY2lmaWVkIGVsZW1lbnQncyBjZWxsXG4gICAqIGlzIGVkaXRpbmcgYW5kIGZhbHNlIHdoZW4gbm90LlxuICAgKi9cbiAgZWRpdGluZ0NlbGwoZWxlbWVudDogRWxlbWVudHxFdmVudFRhcmdldCk6IE9ic2VydmFibGU8Ym9vbGVhbj4ge1xuICAgIGxldCBjZWxsOiBFbGVtZW50fG51bGwgPSBudWxsO1xuXG4gICAgcmV0dXJuIHRoaXMuX2VkaXRpbmdBbmRFbmFibGVkRGlzdGluY3QucGlwZShcbiAgICAgICAgbWFwKGVkaXRDZWxsID0+IGVkaXRDZWxsID09PSAoY2VsbCB8fCAoY2VsbCA9IGNsb3Nlc3QoZWxlbWVudCwgQ0VMTF9TRUxFQ1RPUikpKSksXG4gICAgICAgIHRoaXMuX2Rpc3RpbmN0VW50aWxDaGFuZ2VkIGFzIE1vbm9UeXBlT3BlcmF0b3JGdW5jdGlvbjxib29sZWFuPixcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0b3BzIGVkaXRpbmcgZm9yIHRoZSBzcGVjaWZpZWQgY2VsbC4gSWYgdGhlIHNwZWNpZmllZCBjZWxsIGlzIG5vdCB0aGUgY3VycmVudFxuICAgKiBlZGl0IGNlbGwsIGRvZXMgbm90aGluZy5cbiAgICovXG4gIGRvbmVFZGl0aW5nQ2VsbChlbGVtZW50OiBFbGVtZW50fEV2ZW50VGFyZ2V0KTogdm9pZCB7XG4gICAgY29uc3QgY2VsbCA9IGNsb3Nlc3QoZWxlbWVudCwgQ0VMTF9TRUxFQ1RPUik7XG5cbiAgICBpZiAodGhpcy5fY3VycmVudGx5RWRpdGluZyA9PT0gY2VsbCkge1xuICAgICAgdGhpcy5lZGl0aW5nLm5leHQobnVsbCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFNldHMgdGhlIGN1cnJlbnRseSBhY3RpdmUgRWRpdFJlZi4gKi9cbiAgc2V0QWN0aXZlRWRpdFJlZihyZWY6IFIpIHtcbiAgICB0aGlzLl9lZGl0UmVmID0gcmVmO1xuICB9XG5cbiAgLyoqIFVuc2V0cyB0aGUgY3VycmVudGx5IGFjdGl2ZSBFZGl0UmVmLCBpZiB0aGUgc3BlY2lmaWVkIGVkaXRSZWYgaXMgYWN0aXZlLiAqL1xuICB1bnNldEFjdGl2ZUVkaXRSZWYocmVmOiBSKSB7XG4gICAgaWYgKHRoaXMuX2VkaXRSZWYgIT09IHJlZikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX2VkaXRSZWYgPSBudWxsO1xuICB9XG5cbiAgLyoqIEFkZHMgdGhlIHNwZWNpZmllZCB0YWJsZSByb3cgdG8gYmUgdHJhY2tlZCBmb3IgZmlyc3QvbGFzdCByb3cgY29tcGFyaXNvbnMuICovXG4gIHJlZ2lzdGVyUm93V2l0aEhvdmVyQ29udGVudChyb3c6IEVsZW1lbnQpOiB2b2lkIHtcbiAgICB0aGlzLl9yb3dzV2l0aEhvdmVyQ29udGVudC5zZXQocm93LCAodGhpcy5fcm93c1dpdGhIb3ZlckNvbnRlbnQuZ2V0KHJvdykgfHwgMCkgKyAxKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWZlcmVuY2UgZGVjcmVtZW50cyBhbmQgdWx0aW1hdGVseSByZW1vdmVzIHRoZSBzcGVjaWZpZWQgdGFibGUgcm93IGZyb20gZmlyc3QvbGFzdCByb3dcbiAgICogY29tcGFyaXNvbnMuXG4gICAqL1xuICBkZXJlZ2lzdGVyUm93V2l0aEhvdmVyQ29udGVudChyb3c6IEVsZW1lbnQpOiB2b2lkIHtcbiAgICBjb25zdCByZWZDb3VudCA9IHRoaXMuX3Jvd3NXaXRoSG92ZXJDb250ZW50LmdldChyb3cpIHx8IDA7XG5cbiAgICBpZiAocmVmQ291bnQgPD0gMSkge1xuICAgICAgdGhpcy5fcm93c1dpdGhIb3ZlckNvbnRlbnQuZGVsZXRlKHJvdyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3Jvd3NXaXRoSG92ZXJDb250ZW50LnNldChyb3csIHJlZkNvdW50IC0gMSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgYW4gT2JzZXJ2YWJsZSB0aGF0IGVtaXRzIHRydWUgd2hlbiB0aGUgc3BlY2lmaWVkIGVsZW1lbnQncyByb3dcbiAgICogY29udGFpbnMgdGhlIGZvY3VzZWQgZWxlbWVudCBvciBpcyBiZWluZyBob3ZlcmVkIG92ZXIgYW5kIGZhbHNlIHdoZW4gbm90LlxuICAgKiBIb3ZlcmluZyBpcyBkZWZpbmVkIGFzIHdoZW4gdGhlIG1vdXNlIGhhcyBtb21lbnRhcmlseSBzdG9wcGVkIG1vdmluZyBvdmVyIHRoZSBjZWxsLlxuICAgKi9cbiAgaG92ZXJPckZvY3VzT25Sb3cocm93OiBFbGVtZW50KTogT2JzZXJ2YWJsZTxIb3ZlckNvbnRlbnRTdGF0ZT4ge1xuICAgIGlmIChyb3cgIT09IHRoaXMuX2xhc3RTZWVuUm93KSB7XG4gICAgICB0aGlzLl9sYXN0U2VlblJvdyA9IHJvdztcbiAgICAgIHRoaXMuX2xhc3RTZWVuUm93SG92ZXJPckZvY3VzID0gdGhpcy5faG92ZXJlZENvbnRlbnRTdGF0ZURpc3RpbmN0LnBpcGUoXG4gICAgICAgIG1hcChzdGF0ZSA9PiBzdGF0ZS5nZXQocm93KSB8fCBIb3ZlckNvbnRlbnRTdGF0ZS5PRkYpLFxuICAgICAgICB0aGlzLl9kaXN0aW5jdFNoYXJlLFxuICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fbGFzdFNlZW5Sb3dIb3Zlck9yRm9jdXMhO1xuICB9XG5cbiAgLyoqXG4gICAqIFJ4SlMgb3BlcmF0b3IgdGhhdCBlbnRlcnMgdGhlIEFuZ3VsYXIgem9uZSwgdXNlZCB0byByZWR1Y2UgYm9pbGVycGxhdGUgaW5cbiAgICogcmUtZW50ZXJpbmcgdGhlIHpvbmUgZm9yIHN0cmVhbSBwaXBlbGluZXMuXG4gICAqL1xuICBwcml2YXRlIF9lbnRlclpvbmU8VD4oKTogTW9ub1R5cGVPcGVyYXRvckZ1bmN0aW9uPFQ+IHtcbiAgICByZXR1cm4gKHNvdXJjZTogT2JzZXJ2YWJsZTxUPikgPT5cbiAgICAgICAgbmV3IE9ic2VydmFibGU8VD4oKG9ic2VydmVyKSA9PiBzb3VyY2Uuc3Vic2NyaWJlKHtcbiAgICAgICAgICAgICBuZXh0OiAodmFsdWUpID0+IHRoaXMuX25nWm9uZS5ydW4oKCkgPT4gb2JzZXJ2ZXIubmV4dCh2YWx1ZSkpLFxuICAgICAgICAgICAgIGVycm9yOiAoZXJyKSA9PiBvYnNlcnZlci5lcnJvcihlcnIpLFxuICAgICAgICAgICAgIGNvbXBsZXRlOiAoKSA9PiBvYnNlcnZlci5jb21wbGV0ZSgpXG4gICAgICAgICAgIH0pKTtcbiAgfVxuXG4gIHByaXZhdGUgX2dldEZpcnN0Um93V2l0aEhvdmVyQ29udGVudCgpOiBPYnNlcnZhYmxlPEVsZW1lbnR8bnVsbD4ge1xuICAgIHJldHVybiB0aGlzLl9tYXBBbGxSb3dzVG9TaW5nbGVSb3cocm93cyA9PiB7XG4gICAgICBmb3IgKGxldCBpID0gMCwgcm93OyByb3cgPSByb3dzW2ldOyBpKyspIHtcbiAgICAgICAgaWYgKHRoaXMuX3Jvd3NXaXRoSG92ZXJDb250ZW50Lmhhcyhyb3cgYXMgRWxlbWVudCkpIHtcbiAgICAgICAgICByZXR1cm4gcm93IGFzIEVsZW1lbnQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0TGFzdFJvd1dpdGhIb3ZlckNvbnRlbnQoKTogT2JzZXJ2YWJsZTxFbGVtZW50fG51bGw+IHtcbiAgICByZXR1cm4gdGhpcy5fbWFwQWxsUm93c1RvU2luZ2xlUm93KHJvd3MgPT4ge1xuICAgICAgZm9yIChsZXQgaSA9IHJvd3MubGVuZ3RoIC0gMSwgcm93OyByb3cgPSByb3dzW2ldOyBpLS0pIHtcbiAgICAgICAgaWYgKHRoaXMuX3Jvd3NXaXRoSG92ZXJDb250ZW50Lmhhcyhyb3cgYXMgRWxlbWVudCkpIHtcbiAgICAgICAgICByZXR1cm4gcm93IGFzIEVsZW1lbnQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfbWFwQWxsUm93c1RvU2luZ2xlUm93KG1hcHBlcjogKHJvd3M6IE5vZGVMaXN0KSA9PiBFbGVtZW50fG51bGwpOlxuICAgICAgT2JzZXJ2YWJsZTxFbGVtZW50fG51bGw+IHtcbiAgICByZXR1cm4gdGhpcy5hbGxSb3dzLnBpcGUoXG4gICAgICAgIG1hcChtYXBwZXIpLFxuICAgICAgICB0aGlzLl9zdGFydFdpdGhOdWxsRGlzdGluY3QsXG4gICAgKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjb21wdXRlSG92ZXJDb250ZW50U3RhdGUoW2ZpcnN0Um93LCBsYXN0Um93LCBhY3RpdmVSb3csIGhvdmVyUm93XTogKEVsZW1lbnR8bnVsbClbXSk6XG4gICAgIE1hcDxFbGVtZW50LCBIb3ZlckNvbnRlbnRTdGF0ZT4ge1xuICBjb25zdCBob3ZlckNvbnRlbnRTdGF0ZSA9IG5ldyBNYXA8RWxlbWVudCwgSG92ZXJDb250ZW50U3RhdGU+KCk7XG5cbiAgLy8gQWRkIGZvY3VzYWJsZSByb3dzLlxuICBmb3IgKGNvbnN0IGZvY3Vzc2FibGVSb3cgb2YgW1xuICAgIGZpcnN0Um93LFxuICAgIGxhc3RSb3csXG4gICAgYWN0aXZlUm93ICYmIGFjdGl2ZVJvdy5wcmV2aW91c0VsZW1lbnRTaWJsaW5nLFxuICAgIGFjdGl2ZVJvdyAmJiBhY3RpdmVSb3cubmV4dEVsZW1lbnRTaWJsaW5nLFxuICBdKSB7XG4gICAgaWYgKGZvY3Vzc2FibGVSb3cpIHtcbiAgICAgIGhvdmVyQ29udGVudFN0YXRlLnNldChmb2N1c3NhYmxlUm93IGFzIEVsZW1lbnQsIEhvdmVyQ29udGVudFN0YXRlLkZPQ1VTQUJMRSk7XG4gICAgfVxuICB9XG5cbiAgLy8gQWRkL292ZXJ3cml0ZSB3aXRoIGZ1bGx5IHZpc2libGUgcm93cy5cbiAgZm9yIChjb25zdCBvblJvdyBvZiBbYWN0aXZlUm93LCBob3ZlclJvd10pIHtcbiAgICBpZiAob25Sb3cpIHtcbiAgICAgIGhvdmVyQ29udGVudFN0YXRlLnNldChvblJvdywgSG92ZXJDb250ZW50U3RhdGUuT04pO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBob3ZlckNvbnRlbnRTdGF0ZTtcbn1cblxuZnVuY3Rpb24gYXJlTWFwRW50cmllc0VxdWFsPEssIFY+KGE6IE1hcDxLLCBWPiwgYjogTWFwPEssIFY+KTogYm9vbGVhbiB7XG4gIGlmIChhLnNpemUgIT09IGIuc2l6ZSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIFRPRE86IHVzZSBNYXAucHJvdG90eXBlLmVudHJpZXMgb25jZSB3ZSdyZSBvZmYgSUUxMS5cbiAgZm9yIChjb25zdCBhS2V5IG9mIEFycmF5LmZyb20oYS5rZXlzKCkpKSB7XG4gICAgaWYgKGIuZ2V0KGFLZXkpICE9PSBhLmdldChhS2V5KSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufVxuIl19