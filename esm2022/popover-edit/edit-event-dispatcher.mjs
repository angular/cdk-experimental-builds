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
/**
 * The possible states for hover content:
 * OFF - Not rendered.
 * FOCUSABLE - Rendered in the dom and styled for its contents to be focusable but invisible.
 * ON - Rendered and fully visible.
 */
export var HoverContentState;
(function (HoverContentState) {
    HoverContentState[HoverContentState["OFF"] = 0] = "OFF";
    HoverContentState[HoverContentState["FOCUSABLE"] = 1] = "FOCUSABLE";
    HoverContentState[HoverContentState["ON"] = 2] = "ON";
})(HoverContentState || (HoverContentState = {}));
// Note: this class is generic, rather than referencing EditRef directly, in order to avoid
// circular imports. If we were to reference it here, importing the registry into the
// class that is registering itself will introduce a circular import.
/**
 * Service for sharing delegated events and state for triggering table edits.
 */
export class EditEventDispatcher {
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
            this._lastSeenRowHoverOrFocus = this._hoveredContentStateDistinct.pipe(map(state => state.get(row) || HoverContentState.OFF), this._distinctShare);
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.0.0-rc.2", ngImport: i0, type: EditEventDispatcher, deps: [{ token: i0.NgZone }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "17.0.0-rc.2", ngImport: i0, type: EditEventDispatcher }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.0.0-rc.2", ngImport: i0, type: EditEventDispatcher, decorators: [{
            type: Injectable
        }], ctorParameters: () => [{ type: i0.NgZone }] });
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
            hoverContentState.set(focussableRow, HoverContentState.FOCUSABLE);
        }
    }
    // Add/overwrite with fully visible rows.
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
    // TODO: use Map.prototype.entries once we're off IE11.
    for (const aKey of Array.from(a.keys())) {
        if (b.get(aKey) !== a.get(aKey)) {
            return false;
        }
    }
    return true;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdC1ldmVudC1kaXNwYXRjaGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvcG9wb3Zlci1lZGl0L2VkaXQtZXZlbnQtZGlzcGF0Y2hlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUNqRCxPQUFPLEVBQUMsYUFBYSxFQUE0QixVQUFVLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUN4RixPQUFPLEVBQ0wsS0FBSyxFQUNMLFNBQVMsRUFDVCxZQUFZLEVBQ1osb0JBQW9CLEVBQ3BCLE1BQU0sRUFDTixHQUFHLEVBQ0gsSUFBSSxFQUNKLFNBQVMsRUFDVCxXQUFXLEdBQ1osTUFBTSxnQkFBZ0IsQ0FBQztBQUV4QixPQUFPLEVBQUMsYUFBYSxFQUFFLFlBQVksRUFBQyxNQUFNLGFBQWEsQ0FBQztBQUN4RCxPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sWUFBWSxDQUFDOztBQUVuQyxnRkFBZ0Y7QUFDaEYsTUFBTSxvQkFBb0IsR0FBRyxFQUFFLENBQUM7QUFFaEMsb0RBQW9EO0FBQ3BELE1BQU0sV0FBVyxHQUFHLENBQUMsQ0FBQztBQUV0Qjs7Ozs7R0FLRztBQUNILE1BQU0sQ0FBTixJQUFZLGlCQUlYO0FBSkQsV0FBWSxpQkFBaUI7SUFDM0IsdURBQU8sQ0FBQTtJQUNQLG1FQUFTLENBQUE7SUFDVCxxREFBRSxDQUFBO0FBQ0osQ0FBQyxFQUpXLGlCQUFpQixLQUFqQixpQkFBaUIsUUFJNUI7QUFFRCwyRkFBMkY7QUFDM0YscUZBQXFGO0FBQ3JGLHFFQUFxRTtBQUVyRTs7R0FFRztBQUVILE1BQU0sT0FBTyxtQkFBbUI7SUF1QjlCLCtEQUErRDtJQUMvRCxJQUFJLE9BQU87UUFDVCxPQUFPLElBQUksQ0FBQyxRQUFRLENB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SyxFQUFFO1lBQ1QsaUJBQWlCLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxpQkFBaUIsQ0FBQyxFQUFFLENBQUMsQ0FBQztTQUNwRDtLQUNGO0lBRUQsT0FBTyxpQkFBaUIsQ0FBQztBQUMzQixDQUFDO0FBRUQsU0FBUyxrQkFBa0IsQ0FBTyxDQUFZLEVBQUUsQ0FBWTtJQUMxRCxJQUFJLENBQUMsQ0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDLElBQUksRUFBRTtRQUNyQixPQUFPLEtBQUssQ0FBQztLQUNkO0lBRUQsdURBQXVEO0lBQ3ZELEtBQUssTUFBTSxJQUFJLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRTtRQUN2QyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUMvQixPQUFPLEtBQUssQ0FBQztTQUNkO0tBQ0Y7SUFFRCxPQUFPLElBQUksQ0FBQztBQUNkLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtJbmplY3RhYmxlLCBOZ1pvbmV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtjb21iaW5lTGF0ZXN0LCBNb25vVHlwZU9wZXJhdG9yRnVuY3Rpb24sIE9ic2VydmFibGUsIHBpcGUsIFN1YmplY3R9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHtcbiAgYXVkaXQsXG4gIGF1ZGl0VGltZSxcbiAgZGVib3VuY2VUaW1lLFxuICBkaXN0aW5jdFVudGlsQ2hhbmdlZCxcbiAgZmlsdGVyLFxuICBtYXAsXG4gIHNraXAsXG4gIHN0YXJ0V2l0aCxcbiAgc2hhcmVSZXBsYXksXG59IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcblxuaW1wb3J0IHtDRUxMX1NFTEVDVE9SLCBST1dfU0VMRUNUT1J9IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCB7Y2xvc2VzdH0gZnJvbSAnLi9wb2x5ZmlsbCc7XG5cbi8qKiBUaGUgZGVsYXkgYXBwbGllZCB0byBtb3VzZSBldmVudHMgYmVmb3JlIGhpZGluZyBvciBzaG93aW5nIGhvdmVyIGNvbnRlbnQuICovXG5jb25zdCBNT1VTRV9FVkVOVF9ERUxBWV9NUyA9IDQwO1xuXG4vKiogVGhlIGRlbGF5IGZvciByZWFjdGluZyB0byBmb2N1cy9ibHVyIGNoYW5nZXMuICovXG5jb25zdCBGT0NVU19ERUxBWSA9IDA7XG5cbi8qKlxuICogVGhlIHBvc3NpYmxlIHN0YXRlcyBmb3IgaG92ZXIgY29udGVudDpcbiAqIE9GRiAtIE5vdCByZW5kZXJlZC5cbiAqIEZPQ1VTQUJMRSAtIFJlbmRlcmVkIGluIHRoZSBkb20gYW5kIHN0eWxlZCBmb3IgaXRzIGNvbnRlbnRzIHRvIGJlIGZvY3VzYWJsZSBidXQgaW52aXNpYmxlLlxuICogT04gLSBSZW5kZXJlZCBhbmQgZnVsbHkgdmlzaWJsZS5cbiAqL1xuZXhwb3J0IGVudW0gSG92ZXJDb250ZW50U3RhdGUge1xuICBPRkYgPSAwLFxuICBGT0NVU0FCTEUsXG4gIE9OLFxufVxuXG4vLyBOb3RlOiB0aGlzIGNsYXNzIGlzIGdlbmVyaWMsIHJhdGhlciB0aGFuIHJlZmVyZW5jaW5nIEVkaXRSZWYgZGlyZWN0bHksIGluIG9yZGVyIHRvIGF2b2lkXG4vLyBjaXJjdWxhciBpbXBvcnRzLiBJZiB3ZSB3ZXJlIHRvIHJlZmVyZW5jZSBpdCBoZXJlLCBpbXBvcnRpbmcgdGhlIHJlZ2lzdHJ5IGludG8gdGhlXG4vLyBjbGFzcyB0aGF0IGlzIHJlZ2lzdGVyaW5nIGl0c2VsZiB3aWxsIGludHJvZHVjZSBhIGNpcmN1bGFyIGltcG9ydC5cblxuLyoqXG4gKiBTZXJ2aWNlIGZvciBzaGFyaW5nIGRlbGVnYXRlZCBldmVudHMgYW5kIHN0YXRlIGZvciB0cmlnZ2VyaW5nIHRhYmxlIGVkaXRzLlxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgRWRpdEV2ZW50RGlzcGF0Y2hlcjxSPiB7XG4gIC8qKiBBIHN1YmplY3QgdGhhdCBpbmRpY2F0ZXMgd2hpY2ggdGFibGUgY2VsbCBpcyBjdXJyZW50bHkgZWRpdGluZyAodW5sZXNzIGl0IGlzIGRpc2FibGVkKS4gKi9cbiAgcmVhZG9ubHkgZWRpdGluZyA9IG5ldyBTdWJqZWN0PEVsZW1lbnQgfCBudWxsPigpO1xuXG4gIC8qKiBBIHN1YmplY3QgdGhhdCBpbmRpY2F0ZXMgd2hpY2ggdGFibGUgcm93IGlzIGN1cnJlbnRseSBob3ZlcmVkLiAqL1xuICByZWFkb25seSBob3ZlcmluZyA9IG5ldyBTdWJqZWN0PEVsZW1lbnQgfCBudWxsPigpO1xuXG4gIC8qKiBBIHN1YmplY3QgdGhhdCBpbmRpY2F0ZXMgd2hpY2ggdGFibGUgcm93IGN1cnJlbnRseSBjb250YWlucyBmb2N1cy4gKi9cbiAgcmVhZG9ubHkgZm9jdXNlZCA9IG5ldyBTdWJqZWN0PEVsZW1lbnQgfCBudWxsPigpO1xuXG4gIC8qKiBBIHN1YmplY3QgdGhhdCBpbmRpY2F0ZXMgYWxsIGVsZW1lbnRzIGluIHRoZSB0YWJsZSBtYXRjaGluZyBST1dfU0VMRUNUT1IuICovXG4gIHJlYWRvbmx5IGFsbFJvd3MgPSBuZXcgU3ViamVjdDxOb2RlTGlzdD4oKTtcblxuICAvKiogQSBzdWJqZWN0IHRoYXQgZW1pdHMgbW91c2UgbW92ZSBldmVudHMgZnJvbSB0aGUgdGFibGUgaW5kaWNhdGluZyB0aGUgdGFyZ2V0ZWQgcm93LiAqL1xuICByZWFkb25seSBtb3VzZU1vdmUgPSBuZXcgU3ViamVjdDxFbGVtZW50IHwgbnVsbD4oKTtcblxuICAvLyBUT0RPOiBVc2UgV2Vha1NldCBvbmNlIElFMTEgc3VwcG9ydCBpcyBkcm9wcGVkLlxuICAvKipcbiAgICogVHJhY2tzIHRoZSBjdXJyZW50bHkgZGlzYWJsZWQgZWRpdGFibGUgY2VsbHMgLSBlZGl0IGNhbGxzIHdpbGwgYmUgaWdub3JlZFxuICAgKiBmb3IgdGhlc2UgY2VsbHMuXG4gICAqL1xuICByZWFkb25seSBkaXNhYmxlZENlbGxzID0gbmV3IFdlYWtNYXA8RWxlbWVudCwgYm9vbGVhbj4oKTtcblxuICAvKiogVGhlIEVkaXRSZWYgZm9yIHRoZSBjdXJyZW50bHkgYWN0aXZlIGVkaXQgbGVucyAoaWYgYW55KS4gKi9cbiAgZ2V0IGVkaXRSZWYoKTogUiB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLl9lZGl0UmVmO1xuICB9XG4gIHByaXZhdGUgX2VkaXRSZWY6IFIgfCBudWxsID0gbnVsbDtcblxuICAvLyBPcHRpbWl6YXRpb246IFByZWNvbXB1dGUgY29tbW9uIHBpcGVhYmxlIG9wZXJhdG9ycyB1c2VkIHBlciByb3cvY2VsbC5cbiAgcHJpdmF0ZSByZWFkb25seSBfZGlzdGluY3RVbnRpbENoYW5nZWQgPSBkaXN0aW5jdFVudGlsQ2hhbmdlZDxcbiAgICBFbGVtZW50IHwgSG92ZXJDb250ZW50U3RhdGUgfCBib29sZWFuIHwgbnVsbFxuICA+KCk7XG4gIHByaXZhdGUgcmVhZG9ubHkgX3N0YXJ0V2l0aE51bGwgPSBzdGFydFdpdGg8RWxlbWVudCB8IG51bGw+KG51bGwpO1xuICBwcml2YXRlIHJlYWRvbmx5IF9kaXN0aW5jdFNoYXJlID0gcGlwZShcbiAgICB0aGlzLl9kaXN0aW5jdFVudGlsQ2hhbmdlZCBhcyBNb25vVHlwZU9wZXJhdG9yRnVuY3Rpb248SG92ZXJDb250ZW50U3RhdGU+LFxuICAgIHNoYXJlUmVwbGF5KDEpLFxuICApO1xuICBwcml2YXRlIHJlYWRvbmx5IF9zdGFydFdpdGhOdWxsRGlzdGluY3QgPSBwaXBlKFxuICAgIHRoaXMuX3N0YXJ0V2l0aE51bGwsXG4gICAgdGhpcy5fZGlzdGluY3RVbnRpbENoYW5nZWQgYXMgTW9ub1R5cGVPcGVyYXRvckZ1bmN0aW9uPEVsZW1lbnQgfCBudWxsPixcbiAgKTtcblxuICByZWFkb25seSBlZGl0aW5nQW5kRW5hYmxlZCA9IHRoaXMuZWRpdGluZy5waXBlKFxuICAgIGZpbHRlcihjZWxsID0+IGNlbGwgPT0gbnVsbCB8fCAhdGhpcy5kaXNhYmxlZENlbGxzLmhhcyhjZWxsKSksXG4gICAgc2hhcmVSZXBsYXkoMSksXG4gICk7XG5cbiAgLyoqIEFuIG9ic2VydmFibGUgdGhhdCBlbWl0cyB0aGUgcm93IGNvbnRhaW5pbmcgZm9jdXMgb3IgYW4gYWN0aXZlIGVkaXQuICovXG4gIHJlYWRvbmx5IGVkaXRpbmdPckZvY3VzZWQgPSBjb21iaW5lTGF0ZXN0KFtcbiAgICB0aGlzLmVkaXRpbmdBbmRFbmFibGVkLnBpcGUoXG4gICAgICBtYXAoY2VsbCA9PiBjbG9zZXN0KGNlbGwsIFJPV19TRUxFQ1RPUikpLFxuICAgICAgdGhpcy5fc3RhcnRXaXRoTnVsbCxcbiAgICApLFxuICAgIHRoaXMuZm9jdXNlZC5waXBlKHRoaXMuX3N0YXJ0V2l0aE51bGwpLFxuICBdKS5waXBlKFxuICAgIG1hcCgoW2VkaXRpbmdSb3csIGZvY3VzZWRSb3ddKSA9PiBmb2N1c2VkUm93IHx8IGVkaXRpbmdSb3cpLFxuICAgIHRoaXMuX2Rpc3RpbmN0VW50aWxDaGFuZ2VkIGFzIE1vbm9UeXBlT3BlcmF0b3JGdW5jdGlvbjxFbGVtZW50IHwgbnVsbD4sXG4gICAgYXVkaXRUaW1lKEZPQ1VTX0RFTEFZKSwgLy8gVXNlIGF1ZGl0IHRvIHNraXAgb3ZlciBibHVyIGV2ZW50cyB0byB0aGUgbmV4dCBmb2N1c2VkIGVsZW1lbnQuXG4gICAgdGhpcy5fZGlzdGluY3RVbnRpbENoYW5nZWQgYXMgTW9ub1R5cGVPcGVyYXRvckZ1bmN0aW9uPEVsZW1lbnQgfCBudWxsPixcbiAgICBzaGFyZVJlcGxheSgxKSxcbiAgKTtcblxuICAvKiogVHJhY2tzIHJvd3MgdGhhdCBjb250YWluIGhvdmVyIGNvbnRlbnQgd2l0aCBhIHJlZmVyZW5jZSBjb3VudC4gKi9cbiAgcHJpdmF0ZSBfcm93c1dpdGhIb3ZlckNvbnRlbnQgPSBuZXcgV2Vha01hcDxFbGVtZW50LCBudW1iZXI+KCk7XG5cbiAgLyoqIFRoZSB0YWJsZSBjZWxsIHRoYXQgaGFzIGFuIGFjdGl2ZSBlZGl0IGxlbnMgKG9yIG51bGwpLiAqL1xuICBwcml2YXRlIF9jdXJyZW50bHlFZGl0aW5nOiBFbGVtZW50IHwgbnVsbCA9IG51bGw7XG5cbiAgLyoqIFRoZSBjb21iaW5lZCBzZXQgb2Ygcm93IGhvdmVyIGNvbnRlbnQgc3RhdGVzIG9yZ2FuaXplZCBieSByb3cuICovXG4gIHByaXZhdGUgcmVhZG9ubHkgX2hvdmVyZWRDb250ZW50U3RhdGVEaXN0aW5jdCA9IGNvbWJpbmVMYXRlc3QoW1xuICAgIHRoaXMuX2dldEZpcnN0Um93V2l0aEhvdmVyQ29udGVudCgpLFxuICAgIHRoaXMuX2dldExhc3RSb3dXaXRoSG92ZXJDb250ZW50KCksXG4gICAgdGhpcy5lZGl0aW5nT3JGb2N1c2VkLFxuICAgIHRoaXMuaG92ZXJpbmcucGlwZShcbiAgICAgIGRpc3RpbmN0VW50aWxDaGFuZ2VkKCksXG4gICAgICBhdWRpdChyb3cgPT5cbiAgICAgICAgdGhpcy5tb3VzZU1vdmUucGlwZShcbiAgICAgICAgICBmaWx0ZXIobW91c2VNb3ZlUm93ID0+IHJvdyA9PT0gbW91c2VNb3ZlUm93KSxcbiAgICAgICAgICB0aGlzLl9zdGFydFdpdGhOdWxsLFxuICAgICAgICAgIGRlYm91bmNlVGltZShNT1VTRV9FVkVOVF9ERUxBWV9NUyksXG4gICAgICAgICksXG4gICAgICApLFxuICAgICAgdGhpcy5fc3RhcnRXaXRoTnVsbERpc3RpbmN0LFxuICAgICksXG4gIF0pLnBpcGUoXG4gICAgc2tpcCgxKSwgLy8gU2tpcCB0aGUgaW5pdGlhbCBlbWlzc2lvbiBvZiBbbnVsbCwgbnVsbCwgbnVsbCwgbnVsbF0uXG4gICAgbWFwKGNvbXB1dGVIb3ZlckNvbnRlbnRTdGF0ZSksXG4gICAgZGlzdGluY3RVbnRpbENoYW5nZWQoYXJlTWFwRW50cmllc0VxdWFsKSxcbiAgICAvLyBPcHRpbWl6YXRpb246IEVudGVyIHRoZSB6b25lIGJlZm9yZSBzaGFyZVJlcGxheSBzbyB0aGF0IHdlIHRyaWdnZXIgYSBzaW5nbGVcbiAgICAvLyBBcHBsaWNhdGlvblJlZi50aWNrIGZvciBhbGwgcm93IHVwZGF0ZXMuXG4gICAgdGhpcy5fZW50ZXJab25lKCksXG4gICAgc2hhcmVSZXBsYXkoMSksXG4gICk7XG5cbiAgcHJpdmF0ZSByZWFkb25seSBfZWRpdGluZ0FuZEVuYWJsZWREaXN0aW5jdCA9IHRoaXMuZWRpdGluZ0FuZEVuYWJsZWQucGlwZShcbiAgICBkaXN0aW5jdFVudGlsQ2hhbmdlZCgpLFxuICAgIHRoaXMuX2VudGVyWm9uZSgpLFxuICAgIHNoYXJlUmVwbGF5KDEpLFxuICApO1xuXG4gIC8vIE9wdGltaXphdGlvbjogU2hhcmUgcm93IGV2ZW50cyBvYnNlcnZhYmxlIHdpdGggc3Vic2VxdWVudCBjYWxsZXJzLlxuICAvLyBBdCBzdGFydHVwLCBjYWxscyB3aWxsIGJlIHNlcXVlbnRpYWwgYnkgcm93LlxuICBwcml2YXRlIF9sYXN0U2VlblJvdzogRWxlbWVudCB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIF9sYXN0U2VlblJvd0hvdmVyT3JGb2N1czogT2JzZXJ2YWJsZTxIb3ZlckNvbnRlbnRTdGF0ZT4gfCBudWxsID0gbnVsbDtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHJlYWRvbmx5IF9uZ1pvbmU6IE5nWm9uZSkge1xuICAgIHRoaXMuX2VkaXRpbmdBbmRFbmFibGVkRGlzdGluY3Quc3Vic2NyaWJlKGNlbGwgPT4ge1xuICAgICAgdGhpcy5fY3VycmVudGx5RWRpdGluZyA9IGNlbGw7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyBhbiBPYnNlcnZhYmxlIHRoYXQgZW1pdHMgdHJ1ZSB3aGVuIHRoZSBzcGVjaWZpZWQgZWxlbWVudCdzIGNlbGxcbiAgICogaXMgZWRpdGluZyBhbmQgZmFsc2Ugd2hlbiBub3QuXG4gICAqL1xuICBlZGl0aW5nQ2VsbChlbGVtZW50OiBFbGVtZW50IHwgRXZlbnRUYXJnZXQpOiBPYnNlcnZhYmxlPGJvb2xlYW4+IHtcbiAgICBsZXQgY2VsbDogRWxlbWVudCB8IG51bGwgPSBudWxsO1xuXG4gICAgcmV0dXJuIHRoaXMuX2VkaXRpbmdBbmRFbmFibGVkRGlzdGluY3QucGlwZShcbiAgICAgIG1hcChlZGl0Q2VsbCA9PiBlZGl0Q2VsbCA9PT0gKGNlbGwgfHwgKGNlbGwgPSBjbG9zZXN0KGVsZW1lbnQsIENFTExfU0VMRUNUT1IpKSkpLFxuICAgICAgdGhpcy5fZGlzdGluY3RVbnRpbENoYW5nZWQgYXMgTW9ub1R5cGVPcGVyYXRvckZ1bmN0aW9uPGJvb2xlYW4+LFxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogU3RvcHMgZWRpdGluZyBmb3IgdGhlIHNwZWNpZmllZCBjZWxsLiBJZiB0aGUgc3BlY2lmaWVkIGNlbGwgaXMgbm90IHRoZSBjdXJyZW50XG4gICAqIGVkaXQgY2VsbCwgZG9lcyBub3RoaW5nLlxuICAgKi9cbiAgZG9uZUVkaXRpbmdDZWxsKGVsZW1lbnQ6IEVsZW1lbnQgfCBFdmVudFRhcmdldCk6IHZvaWQge1xuICAgIGNvbnN0IGNlbGwgPSBjbG9zZXN0KGVsZW1lbnQsIENFTExfU0VMRUNUT1IpO1xuXG4gICAgaWYgKHRoaXMuX2N1cnJlbnRseUVkaXRpbmcgPT09IGNlbGwpIHtcbiAgICAgIHRoaXMuZWRpdGluZy5uZXh0KG51bGwpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBTZXRzIHRoZSBjdXJyZW50bHkgYWN0aXZlIEVkaXRSZWYuICovXG4gIHNldEFjdGl2ZUVkaXRSZWYocmVmOiBSKSB7XG4gICAgdGhpcy5fZWRpdFJlZiA9IHJlZjtcbiAgfVxuXG4gIC8qKiBVbnNldCB0aGUgY3VycmVudGx5IGFjdGl2ZSBFZGl0UmVmLCBpZiB0aGUgc3BlY2lmaWVkIGVkaXRSZWYgaXMgYWN0aXZlLiAqL1xuICB1bnNldEFjdGl2ZUVkaXRSZWYocmVmOiBSKSB7XG4gICAgaWYgKHRoaXMuX2VkaXRSZWYgIT09IHJlZikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX2VkaXRSZWYgPSBudWxsO1xuICB9XG5cbiAgLyoqIEFkZHMgdGhlIHNwZWNpZmllZCB0YWJsZSByb3cgdG8gYmUgdHJhY2tlZCBmb3IgZmlyc3QvbGFzdCByb3cgY29tcGFyaXNvbnMuICovXG4gIHJlZ2lzdGVyUm93V2l0aEhvdmVyQ29udGVudChyb3c6IEVsZW1lbnQpOiB2b2lkIHtcbiAgICB0aGlzLl9yb3dzV2l0aEhvdmVyQ29udGVudC5zZXQocm93LCAodGhpcy5fcm93c1dpdGhIb3ZlckNvbnRlbnQuZ2V0KHJvdykgfHwgMCkgKyAxKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWZlcmVuY2UgZGVjcmVtZW50cyBhbmQgdWx0aW1hdGVseSByZW1vdmVzIHRoZSBzcGVjaWZpZWQgdGFibGUgcm93IGZyb20gZmlyc3QvbGFzdCByb3dcbiAgICogY29tcGFyaXNvbnMuXG4gICAqL1xuICBkZXJlZ2lzdGVyUm93V2l0aEhvdmVyQ29udGVudChyb3c6IEVsZW1lbnQpOiB2b2lkIHtcbiAgICBjb25zdCByZWZDb3VudCA9IHRoaXMuX3Jvd3NXaXRoSG92ZXJDb250ZW50LmdldChyb3cpIHx8IDA7XG5cbiAgICBpZiAocmVmQ291bnQgPD0gMSkge1xuICAgICAgdGhpcy5fcm93c1dpdGhIb3ZlckNvbnRlbnQuZGVsZXRlKHJvdyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3Jvd3NXaXRoSG92ZXJDb250ZW50LnNldChyb3csIHJlZkNvdW50IC0gMSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgYW4gT2JzZXJ2YWJsZSB0aGF0IGVtaXRzIHRydWUgd2hlbiB0aGUgc3BlY2lmaWVkIGVsZW1lbnQncyByb3dcbiAgICogY29udGFpbnMgdGhlIGZvY3VzZWQgZWxlbWVudCBvciBpcyBiZWluZyBob3ZlcmVkIG92ZXIgYW5kIGZhbHNlIHdoZW4gbm90LlxuICAgKiBIb3ZlcmluZyBpcyBkZWZpbmVkIGFzIHdoZW4gdGhlIG1vdXNlIGhhcyBtb21lbnRhcmlseSBzdG9wcGVkIG1vdmluZyBvdmVyIHRoZSBjZWxsLlxuICAgKi9cbiAgaG92ZXJPckZvY3VzT25Sb3cocm93OiBFbGVtZW50KTogT2JzZXJ2YWJsZTxIb3ZlckNvbnRlbnRTdGF0ZT4ge1xuICAgIGlmIChyb3cgIT09IHRoaXMuX2xhc3RTZWVuUm93KSB7XG4gICAgICB0aGlzLl9sYXN0U2VlblJvdyA9IHJvdztcbiAgICAgIHRoaXMuX2xhc3RTZWVuUm93SG92ZXJPckZvY3VzID0gdGhpcy5faG92ZXJlZENvbnRlbnRTdGF0ZURpc3RpbmN0LnBpcGUoXG4gICAgICAgIG1hcChzdGF0ZSA9PiBzdGF0ZS5nZXQocm93KSB8fCBIb3ZlckNvbnRlbnRTdGF0ZS5PRkYpLFxuICAgICAgICB0aGlzLl9kaXN0aW5jdFNoYXJlLFxuICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fbGFzdFNlZW5Sb3dIb3Zlck9yRm9jdXMhO1xuICB9XG5cbiAgLyoqXG4gICAqIFJ4SlMgb3BlcmF0b3IgdGhhdCBlbnRlcnMgdGhlIEFuZ3VsYXIgem9uZSwgdXNlZCB0byByZWR1Y2UgYm9pbGVycGxhdGUgaW5cbiAgICogcmUtZW50ZXJpbmcgdGhlIHpvbmUgZm9yIHN0cmVhbSBwaXBlbGluZXMuXG4gICAqL1xuICBwcml2YXRlIF9lbnRlclpvbmU8VD4oKTogTW9ub1R5cGVPcGVyYXRvckZ1bmN0aW9uPFQ+IHtcbiAgICByZXR1cm4gKHNvdXJjZTogT2JzZXJ2YWJsZTxUPikgPT5cbiAgICAgIG5ldyBPYnNlcnZhYmxlPFQ+KG9ic2VydmVyID0+XG4gICAgICAgIHNvdXJjZS5zdWJzY3JpYmUoe1xuICAgICAgICAgIG5leHQ6IHZhbHVlID0+IHRoaXMuX25nWm9uZS5ydW4oKCkgPT4gb2JzZXJ2ZXIubmV4dCh2YWx1ZSkpLFxuICAgICAgICAgIGVycm9yOiBlcnIgPT4gb2JzZXJ2ZXIuZXJyb3IoZXJyKSxcbiAgICAgICAgICBjb21wbGV0ZTogKCkgPT4gb2JzZXJ2ZXIuY29tcGxldGUoKSxcbiAgICAgICAgfSksXG4gICAgICApO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0Rmlyc3RSb3dXaXRoSG92ZXJDb250ZW50KCk6IE9ic2VydmFibGU8RWxlbWVudCB8IG51bGw+IHtcbiAgICByZXR1cm4gdGhpcy5fbWFwQWxsUm93c1RvU2luZ2xlUm93KHJvd3MgPT4ge1xuICAgICAgZm9yIChsZXQgaSA9IDAsIHJvdzsgKHJvdyA9IHJvd3NbaV0pOyBpKyspIHtcbiAgICAgICAgaWYgKHRoaXMuX3Jvd3NXaXRoSG92ZXJDb250ZW50Lmhhcyhyb3cgYXMgRWxlbWVudCkpIHtcbiAgICAgICAgICByZXR1cm4gcm93IGFzIEVsZW1lbnQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0TGFzdFJvd1dpdGhIb3ZlckNvbnRlbnQoKTogT2JzZXJ2YWJsZTxFbGVtZW50IHwgbnVsbD4ge1xuICAgIHJldHVybiB0aGlzLl9tYXBBbGxSb3dzVG9TaW5nbGVSb3cocm93cyA9PiB7XG4gICAgICBmb3IgKGxldCBpID0gcm93cy5sZW5ndGggLSAxLCByb3c7IChyb3cgPSByb3dzW2ldKTsgaS0tKSB7XG4gICAgICAgIGlmICh0aGlzLl9yb3dzV2l0aEhvdmVyQ29udGVudC5oYXMocm93IGFzIEVsZW1lbnQpKSB7XG4gICAgICAgICAgcmV0dXJuIHJvdyBhcyBFbGVtZW50O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX21hcEFsbFJvd3NUb1NpbmdsZVJvdyhcbiAgICBtYXBwZXI6IChyb3dzOiBOb2RlTGlzdCkgPT4gRWxlbWVudCB8IG51bGwsXG4gICk6IE9ic2VydmFibGU8RWxlbWVudCB8IG51bGw+IHtcbiAgICByZXR1cm4gdGhpcy5hbGxSb3dzLnBpcGUobWFwKG1hcHBlciksIHRoaXMuX3N0YXJ0V2l0aE51bGxEaXN0aW5jdCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gY29tcHV0ZUhvdmVyQ29udGVudFN0YXRlKFtcbiAgZmlyc3RSb3csXG4gIGxhc3RSb3csXG4gIGFjdGl2ZVJvdyxcbiAgaG92ZXJSb3csXG5dOiAoRWxlbWVudCB8IG51bGwpW10pOiBNYXA8RWxlbWVudCwgSG92ZXJDb250ZW50U3RhdGU+IHtcbiAgY29uc3QgaG92ZXJDb250ZW50U3RhdGUgPSBuZXcgTWFwPEVsZW1lbnQsIEhvdmVyQ29udGVudFN0YXRlPigpO1xuXG4gIC8vIEFkZCBmb2N1c2FibGUgcm93cy5cbiAgZm9yIChjb25zdCBmb2N1c3NhYmxlUm93IG9mIFtcbiAgICBmaXJzdFJvdyxcbiAgICBsYXN0Um93LFxuICAgIGFjdGl2ZVJvdyAmJiBhY3RpdmVSb3cucHJldmlvdXNFbGVtZW50U2libGluZyxcbiAgICBhY3RpdmVSb3cgJiYgYWN0aXZlUm93Lm5leHRFbGVtZW50U2libGluZyxcbiAgXSkge1xuICAgIGlmIChmb2N1c3NhYmxlUm93KSB7XG4gICAgICBob3ZlckNvbnRlbnRTdGF0ZS5zZXQoZm9jdXNzYWJsZVJvdyBhcyBFbGVtZW50LCBIb3ZlckNvbnRlbnRTdGF0ZS5GT0NVU0FCTEUpO1xuICAgIH1cbiAgfVxuXG4gIC8vIEFkZC9vdmVyd3JpdGUgd2l0aCBmdWxseSB2aXNpYmxlIHJvd3MuXG4gIGZvciAoY29uc3Qgb25Sb3cgb2YgW2FjdGl2ZVJvdywgaG92ZXJSb3ddKSB7XG4gICAgaWYgKG9uUm93KSB7XG4gICAgICBob3ZlckNvbnRlbnRTdGF0ZS5zZXQob25Sb3csIEhvdmVyQ29udGVudFN0YXRlLk9OKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gaG92ZXJDb250ZW50U3RhdGU7XG59XG5cbmZ1bmN0aW9uIGFyZU1hcEVudHJpZXNFcXVhbDxLLCBWPihhOiBNYXA8SywgVj4sIGI6IE1hcDxLLCBWPik6IGJvb2xlYW4ge1xuICBpZiAoYS5zaXplICE9PSBiLnNpemUpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBUT0RPOiB1c2UgTWFwLnByb3RvdHlwZS5lbnRyaWVzIG9uY2Ugd2UncmUgb2ZmIElFMTEuXG4gIGZvciAoY29uc3QgYUtleSBvZiBBcnJheS5mcm9tKGEua2V5cygpKSkge1xuICAgIGlmIChiLmdldChhS2V5KSAhPT0gYS5nZXQoYUtleSkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn1cbiJdfQ==