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
    /** @nocollapse */
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdC1ldmVudC1kaXNwYXRjaGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvcG9wb3Zlci1lZGl0L2VkaXQtZXZlbnQtZGlzcGF0Y2hlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUNqRCxPQUFPLEVBQUMsYUFBYSxFQUE0QixVQUFVLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUN4RixPQUFPLEVBQ0wsS0FBSyxFQUNMLFNBQVMsRUFDVCxZQUFZLEVBQ1osb0JBQW9CLEVBQ3BCLE1BQU0sRUFDTixHQUFHLEVBQ0gsSUFBSSxFQUNKLFNBQVMsRUFDVCxXQUFXLEdBQ1osTUFBTSxnQkFBZ0IsQ0FBQztBQUV4QixPQUFPLEVBQUMsYUFBYSxFQUFFLFlBQVksRUFBQyxNQUFNLGFBQWEsQ0FBQztBQUN4RCxPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sWUFBWSxDQUFDO0FBR25DLGdGQUFnRjtBQUNoRixNQUFNLG9CQUFvQixHQUFHLEVBQUUsQ0FBQztBQUVoQyxvREFBb0Q7QUFDcEQsTUFBTSxXQUFXLEdBQUcsQ0FBQyxDQUFDO0FBY3RCOztHQUVHO0FBQ0g7SUFBQSxNQUNhLG1CQUFtQjtRQXVHOUIsWUFBNkIsT0FBZTtZQUFmLFlBQU8sR0FBUCxPQUFPLENBQVE7WUF0RzVDLDhGQUE4RjtZQUNyRixZQUFPLEdBQUcsSUFBSSxPQUFPLEVBQWdCLENBQUM7WUFFL0MscUVBQXFFO1lBQzVELGFBQVEsR0FBRyxJQUFJLE9BQU8sRUFBZ0IsQ0FBQztZQUVoRCx5RUFBeUU7WUFDaEUsWUFBTyxHQUFHLElBQUksT0FBTyxFQUFnQixDQUFDO1lBRS9DLGdGQUFnRjtZQUN2RSxZQUFPLEdBQUcsSUFBSSxPQUFPLEVBQVksQ0FBQztZ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TyxLQUFLLENBQUM7S0FDZDtJQUVELHVEQUF1RDtJQUN2RCxLQUFLLE1BQU0sSUFBSSxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUU7UUFDdkMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDL0IsT0FBTyxLQUFLLENBQUM7U0FDZDtLQUNGO0lBRUQsT0FBTyxJQUFJLENBQUM7QUFDZCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SW5qZWN0YWJsZSwgTmdab25lfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7Y29tYmluZUxhdGVzdCwgTW9ub1R5cGVPcGVyYXRvckZ1bmN0aW9uLCBPYnNlcnZhYmxlLCBwaXBlLCBTdWJqZWN0fSBmcm9tICdyeGpzJztcbmltcG9ydCB7XG4gIGF1ZGl0LFxuICBhdWRpdFRpbWUsXG4gIGRlYm91bmNlVGltZSxcbiAgZGlzdGluY3RVbnRpbENoYW5nZWQsXG4gIGZpbHRlcixcbiAgbWFwLFxuICBza2lwLFxuICBzdGFydFdpdGgsXG4gIHNoYXJlUmVwbGF5LFxufSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbmltcG9ydCB7Q0VMTF9TRUxFQ1RPUiwgUk9XX1NFTEVDVE9SfSBmcm9tICcuL2NvbnN0YW50cyc7XG5pbXBvcnQge2Nsb3Nlc3R9IGZyb20gJy4vcG9seWZpbGwnO1xuaW1wb3J0IHtFZGl0UmVmfSBmcm9tICcuL2VkaXQtcmVmJztcblxuLyoqIFRoZSBkZWxheSBhcHBsaWVkIHRvIG1vdXNlIGV2ZW50cyBiZWZvcmUgaGlkaW5nIG9yIHNob3dpbmcgaG92ZXIgY29udGVudC4gKi9cbmNvbnN0IE1PVVNFX0VWRU5UX0RFTEFZX01TID0gNDA7XG5cbi8qKiBUaGUgZGVsYXkgZm9yIHJlYWN0aW5nIHRvIGZvY3VzL2JsdXIgY2hhbmdlcy4gKi9cbmNvbnN0IEZPQ1VTX0RFTEFZID0gMDtcblxuLyoqXG4gKiBUaGUgcG9zc2libGUgc3RhdGVzIGZvciBob3ZlciBjb250ZW50OlxuICogT0ZGIC0gTm90IHJlbmRlcmVkLlxuICogRk9DVVNBQkxFIC0gUmVuZGVyZWQgaW4gdGhlIGRvbSBhbmQgc3R5bGVkIGZvciBpdHMgY29udGVudHMgdG8gYmUgZm9jdXNhYmxlIGJ1dCBpbnZpc2libGUuXG4gKiBPTiAtIFJlbmRlcmVkIGFuZCBmdWxseSB2aXNpYmxlLlxuICovXG5leHBvcnQgY29uc3QgZW51bSBIb3ZlckNvbnRlbnRTdGF0ZSB7XG4gIE9GRiA9IDAsXG4gIEZPQ1VTQUJMRSxcbiAgT04sXG59XG5cbi8qKlxuICogU2VydmljZSBmb3Igc2hhcmluZyBkZWxlZ2F0ZWQgZXZlbnRzIGFuZCBzdGF0ZSBmb3IgdHJpZ2dlcmluZyB0YWJsZSBlZGl0cy5cbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEVkaXRFdmVudERpc3BhdGNoZXIge1xuICAvKiogQSBzdWJqZWN0IHRoYXQgaW5kaWNhdGVzIHdoaWNoIHRhYmxlIGNlbGwgaXMgY3VycmVudGx5IGVkaXRpbmcgKHVubGVzcyBpdCBpcyBkaXNhYmxlZCkuICovXG4gIHJlYWRvbmx5IGVkaXRpbmcgPSBuZXcgU3ViamVjdDxFbGVtZW50fG51bGw+KCk7XG5cbiAgLyoqIEEgc3ViamVjdCB0aGF0IGluZGljYXRlcyB3aGljaCB0YWJsZSByb3cgaXMgY3VycmVudGx5IGhvdmVyZWQuICovXG4gIHJlYWRvbmx5IGhvdmVyaW5nID0gbmV3IFN1YmplY3Q8RWxlbWVudHxudWxsPigpO1xuXG4gIC8qKiBBIHN1YmplY3QgdGhhdCBpbmRpY2F0ZXMgd2hpY2ggdGFibGUgcm93IGN1cnJlbnRseSBjb250YWlucyBmb2N1cy4gKi9cbiAgcmVhZG9ubHkgZm9jdXNlZCA9IG5ldyBTdWJqZWN0PEVsZW1lbnR8bnVsbD4oKTtcblxuICAvKiogQSBzdWJqZWN0IHRoYXQgaW5kaWNhdGVzIGFsbCBlbGVtZW50cyBpbiB0aGUgdGFibGUgbWF0Y2hpbmcgUk9XX1NFTEVDVE9SLiAqL1xuICByZWFkb25seSBhbGxSb3dzID0gbmV3IFN1YmplY3Q8Tm9kZUxpc3Q+KCk7XG5cbiAgLyoqIEEgc3ViamVjdCB0aGF0IGVtaXRzIG1vdXNlIG1vdmUgZXZlbnRzIGZyb20gdGhlIHRhYmxlIGluZGljYXRpbmcgdGhlIHRhcmdldGVkIHJvdy4gKi9cbiAgcmVhZG9ubHkgbW91c2VNb3ZlID0gbmV3IFN1YmplY3Q8RWxlbWVudHxudWxsPigpO1xuXG4gIC8vIFRPRE86IFVzZSBXZWFrU2V0IG9uY2UgSUUxMSBzdXBwb3J0IGlzIGRyb3BwZWQuXG4gIC8qKlxuICAgKiBUcmFja3MgdGhlIGN1cnJlbnRseSBkaXNhYmxlZCBlZGl0YWJsZSBjZWxscyAtIGVkaXQgY2FsbHMgd2lsbCBiZSBpZ25vcmVkXG4gICAqIGZvciB0aGVzZSBjZWxscy5cbiAgICovXG4gIHJlYWRvbmx5IGRpc2FibGVkQ2VsbHMgPSBuZXcgV2Vha01hcDxFbGVtZW50LCBib29sZWFuPigpO1xuXG4gIC8qKiBUaGUgRWRpdFJlZiBmb3IgdGhlIGN1cnJlbnRseSBhY3RpdmUgZWRpdCBsZW5zIChpZiBhbnkpLiAqL1xuICBnZXQgZWRpdFJlZigpOiBFZGl0UmVmPGFueT58bnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuX2VkaXRSZWY7XG4gIH1cbiAgcHJpdmF0ZSBfZWRpdFJlZjogRWRpdFJlZjxhbnk+fG51bGwgPSBudWxsO1xuXG4gIC8vIE9wdGltaXphdGlvbjogUHJlY29tcHV0ZSBjb21tb24gcGlwZWFibGUgb3BlcmF0b3JzIHVzZWQgcGVyIHJvdy9jZWxsLlxuICBwcml2YXRlIHJlYWRvbmx5IF9kaXN0aW5jdFVudGlsQ2hhbmdlZCA9XG4gICAgICBkaXN0aW5jdFVudGlsQ2hhbmdlZDxFbGVtZW50fEhvdmVyQ29udGVudFN0YXRlfGJvb2xlYW58bnVsbD4oKTtcbiAgcHJpdmF0ZSByZWFkb25seSBfc3RhcnRXaXRoTnVsbCA9IHN0YXJ0V2l0aDxFbGVtZW50fG51bGw+KG51bGwpO1xuICBwcml2YXRlIHJlYWRvbmx5IF9kaXN0aW5jdFNoYXJlID0gcGlwZShcbiAgICB0aGlzLl9kaXN0aW5jdFVudGlsQ2hhbmdlZCBhcyBNb25vVHlwZU9wZXJhdG9yRnVuY3Rpb248SG92ZXJDb250ZW50U3RhdGU+LFxuICAgIHNoYXJlUmVwbGF5KDEpLFxuICApO1xuICBwcml2YXRlIHJlYWRvbmx5IF9zdGFydFdpdGhOdWxsRGlzdGluY3QgPSBwaXBlKFxuICAgIHRoaXMuX3N0YXJ0V2l0aE51bGwsXG4gICAgdGhpcy5fZGlzdGluY3RVbnRpbENoYW5nZWQgYXMgTW9ub1R5cGVPcGVyYXRvckZ1bmN0aW9uPEVsZW1lbnR8bnVsbD4sXG4gICk7XG5cbiAgcmVhZG9ubHkgZWRpdGluZ0FuZEVuYWJsZWQgPSB0aGlzLmVkaXRpbmcucGlwZShcbiAgICAgIGZpbHRlcihjZWxsID0+IGNlbGwgPT0gbnVsbCB8fCAhdGhpcy5kaXNhYmxlZENlbGxzLmhhcyhjZWxsKSksXG4gICAgICBzaGFyZVJlcGxheSgxKSxcbiAgKTtcblxuICAvKiogQW4gb2JzZXJ2YWJsZSB0aGF0IGVtaXRzIHRoZSByb3cgY29udGFpbmluZyBmb2N1cyBvciBhbiBhY3RpdmUgZWRpdC4gKi9cbiAgcmVhZG9ubHkgZWRpdGluZ09yRm9jdXNlZCA9IGNvbWJpbmVMYXRlc3QoW1xuICAgICAgdGhpcy5lZGl0aW5nQW5kRW5hYmxlZC5waXBlKFxuICAgICAgICAgIG1hcChjZWxsID0+IGNsb3Nlc3QoY2VsbCwgUk9XX1NFTEVDVE9SKSksXG4gICAgICAgICAgdGhpcy5fc3RhcnRXaXRoTnVsbCxcbiAgICAgICksXG4gICAgICB0aGlzLmZvY3VzZWQucGlwZSh0aGlzLl9zdGFydFdpdGhOdWxsKSxcbiAgXSkucGlwZShcbiAgICAgIG1hcCgoW2VkaXRpbmdSb3csIGZvY3VzZWRSb3ddKSA9PiBmb2N1c2VkUm93IHx8IGVkaXRpbmdSb3cpLFxuICAgICAgdGhpcy5fZGlzdGluY3RVbnRpbENoYW5nZWQgYXMgTW9ub1R5cGVPcGVyYXRvckZ1bmN0aW9uPEVsZW1lbnR8bnVsbD4sXG4gICAgICBhdWRpdFRpbWUoRk9DVVNfREVMQVkpLCAvLyBVc2UgYXVkaXQgdG8gc2tpcCBvdmVyIGJsdXIgZXZlbnRzIHRvIHRoZSBuZXh0IGZvY3VzZWQgZWxlbWVudC5cbiAgICAgIHRoaXMuX2Rpc3RpbmN0VW50aWxDaGFuZ2VkIGFzIE1vbm9UeXBlT3BlcmF0b3JGdW5jdGlvbjxFbGVtZW50fG51bGw+LFxuICAgICAgc2hhcmVSZXBsYXkoMSksXG4gICk7XG5cbiAgLyoqIFRyYWNrcyByb3dzIHRoYXQgY29udGFpbiBob3ZlciBjb250ZW50IHdpdGggYSByZWZlcmVuY2UgY291bnQuICovXG4gIHByaXZhdGUgX3Jvd3NXaXRoSG92ZXJDb250ZW50ID0gbmV3IFdlYWtNYXA8RWxlbWVudCwgbnVtYmVyPigpO1xuXG4gIC8qKiBUaGUgdGFibGUgY2VsbCB0aGF0IGhhcyBhbiBhY3RpdmUgZWRpdCBsZW5zIChvciBudWxsKS4gKi9cbiAgcHJpdmF0ZSBfY3VycmVudGx5RWRpdGluZzogRWxlbWVudHxudWxsID0gbnVsbDtcblxuICAvKiogVGhlIGNvbWJpbmVkIHNldCBvZiByb3cgaG92ZXIgY29udGVudCBzdGF0ZXMgb3JnYW5pemVkIGJ5IHJvdy4gKi9cbiAgcHJpdmF0ZSByZWFkb25seSBfaG92ZXJlZENvbnRlbnRTdGF0ZURpc3RpbmN0ID0gY29tYmluZUxhdGVzdChbXG4gICAgICB0aGlzLl9nZXRGaXJzdFJvd1dpdGhIb3ZlckNvbnRlbnQoKSxcbiAgICAgIHRoaXMuX2dldExhc3RSb3dXaXRoSG92ZXJDb250ZW50KCksXG4gICAgICB0aGlzLmVkaXRpbmdPckZvY3VzZWQsXG4gICAgICB0aGlzLmhvdmVyaW5nLnBpcGUoXG4gICAgICAgICAgZGlzdGluY3RVbnRpbENoYW5nZWQoKSxcbiAgICAgICAgICBhdWRpdChyb3cgPT4gdGhpcy5tb3VzZU1vdmUucGlwZShcbiAgICAgICAgICAgICAgZmlsdGVyKG1vdXNlTW92ZVJvdyA9PiByb3cgPT09IG1vdXNlTW92ZVJvdyksXG4gICAgICAgICAgICAgIHRoaXMuX3N0YXJ0V2l0aE51bGwsXG4gICAgICAgICAgICAgIGRlYm91bmNlVGltZShNT1VTRV9FVkVOVF9ERUxBWV9NUykpLFxuICAgICAgICAgICksXG4gICAgICAgICAgdGhpcy5fc3RhcnRXaXRoTnVsbERpc3RpbmN0LFxuICAgICAgKSxcbiAgXSkucGlwZShcbiAgICAgIHNraXAoMSksIC8vIFNraXAgdGhlIGluaXRpYWwgZW1pc3Npb24gb2YgW251bGwsIG51bGwsIG51bGwsIG51bGxdLlxuICAgICAgbWFwKGNvbXB1dGVIb3ZlckNvbnRlbnRTdGF0ZSksXG4gICAgICBkaXN0aW5jdFVudGlsQ2hhbmdlZChhcmVNYXBFbnRyaWVzRXF1YWwpLFxuICAgICAgLy8gT3B0aW1pemF0aW9uOiBFbnRlciB0aGUgem9uZSBiZWZvcmUgc2hhcmVSZXBsYXkgc28gdGhhdCB3ZSB0cmlnZ2VyIGEgc2luZ2xlXG4gICAgICAvLyBBcHBsaWNhdGlvblJlZi50aWNrIGZvciBhbGwgcm93IHVwZGF0ZXMuXG4gICAgICB0aGlzLl9lbnRlclpvbmUoKSxcbiAgICAgIHNoYXJlUmVwbGF5KDEpLFxuICApO1xuXG4gIHByaXZhdGUgcmVhZG9ubHkgX2VkaXRpbmdBbmRFbmFibGVkRGlzdGluY3QgPSB0aGlzLmVkaXRpbmdBbmRFbmFibGVkLnBpcGUoXG4gICAgICBkaXN0aW5jdFVudGlsQ2hhbmdlZCgpLFxuICAgICAgdGhpcy5fZW50ZXJab25lKCksXG4gICAgICBzaGFyZVJlcGxheSgxKSxcbiAgKTtcblxuICAvLyBPcHRpbWl6YXRpb246IFNoYXJlIHJvdyBldmVudHMgb2JzZXJ2YWJsZSB3aXRoIHN1YnNlcXVlbnQgY2FsbGVycy5cbiAgLy8gQXQgc3RhcnR1cCwgY2FsbHMgd2lsbCBiZSBzZXF1ZW50aWFsIGJ5IHJvdy5cbiAgcHJpdmF0ZSBfbGFzdFNlZW5Sb3c6IEVsZW1lbnR8bnVsbCA9IG51bGw7XG4gIHByaXZhdGUgX2xhc3RTZWVuUm93SG92ZXJPckZvY3VzOiBPYnNlcnZhYmxlPEhvdmVyQ29udGVudFN0YXRlPnxudWxsID0gbnVsbDtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHJlYWRvbmx5IF9uZ1pvbmU6IE5nWm9uZSkge1xuICAgIHRoaXMuX2VkaXRpbmdBbmRFbmFibGVkRGlzdGluY3Quc3Vic2NyaWJlKGNlbGwgPT4ge1xuICAgICAgdGhpcy5fY3VycmVudGx5RWRpdGluZyA9IGNlbGw7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyBhbiBPYnNlcnZhYmxlIHRoYXQgZW1pdHMgdHJ1ZSB3aGVuIHRoZSBzcGVjaWZpZWQgZWxlbWVudCdzIGNlbGxcbiAgICogaXMgZWRpdGluZyBhbmQgZmFsc2Ugd2hlbiBub3QuXG4gICAqL1xuICBlZGl0aW5nQ2VsbChlbGVtZW50OiBFbGVtZW50fEV2ZW50VGFyZ2V0KTogT2JzZXJ2YWJsZTxib29sZWFuPiB7XG4gICAgbGV0IGNlbGw6IEVsZW1lbnR8bnVsbCA9IG51bGw7XG5cbiAgICByZXR1cm4gdGhpcy5fZWRpdGluZ0FuZEVuYWJsZWREaXN0aW5jdC5waXBlKFxuICAgICAgICBtYXAoZWRpdENlbGwgPT4gZWRpdENlbGwgPT09IChjZWxsIHx8IChjZWxsID0gY2xvc2VzdChlbGVtZW50LCBDRUxMX1NFTEVDVE9SKSkpKSxcbiAgICAgICAgdGhpcy5fZGlzdGluY3RVbnRpbENoYW5nZWQgYXMgTW9ub1R5cGVPcGVyYXRvckZ1bmN0aW9uPGJvb2xlYW4+LFxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogU3RvcHMgZWRpdGluZyBmb3IgdGhlIHNwZWNpZmllZCBjZWxsLiBJZiB0aGUgc3BlY2lmaWVkIGNlbGwgaXMgbm90IHRoZSBjdXJyZW50XG4gICAqIGVkaXQgY2VsbCwgZG9lcyBub3RoaW5nLlxuICAgKi9cbiAgZG9uZUVkaXRpbmdDZWxsKGVsZW1lbnQ6IEVsZW1lbnR8RXZlbnRUYXJnZXQpOiB2b2lkIHtcbiAgICBjb25zdCBjZWxsID0gY2xvc2VzdChlbGVtZW50LCBDRUxMX1NFTEVDVE9SKTtcblxuICAgIGlmICh0aGlzLl9jdXJyZW50bHlFZGl0aW5nID09PSBjZWxsKSB7XG4gICAgICB0aGlzLmVkaXRpbmcubmV4dChudWxsKTtcbiAgICB9XG4gIH1cblxuICAvKiogU2V0cyB0aGUgY3VycmVudGx5IGFjdGl2ZSBFZGl0UmVmLiAqL1xuICBzZXRBY3RpdmVFZGl0UmVmKHJlZjogRWRpdFJlZjxhbnk+KSB7XG4gICAgdGhpcy5fZWRpdFJlZiA9IHJlZjtcbiAgfVxuXG4gIC8qKiBVbnNldHMgdGhlIGN1cnJlbnRseSBhY3RpdmUgRWRpdFJlZiwgaWYgdGhlIHNwZWNpZmllZCBlZGl0UmVmIGlzIGFjdGl2ZS4gKi9cbiAgdW5zZXRBY3RpdmVFZGl0UmVmKHJlZjogRWRpdFJlZjxhbnk+KSB7XG4gICAgaWYgKHRoaXMuX2VkaXRSZWYgIT09IHJlZikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX2VkaXRSZWYgPSBudWxsO1xuICB9XG5cbiAgLyoqIEFkZHMgdGhlIHNwZWNpZmllZCB0YWJsZSByb3cgdG8gYmUgdHJhY2tlZCBmb3IgZmlyc3QvbGFzdCByb3cgY29tcGFyaXNvbnMuICovXG4gIHJlZ2lzdGVyUm93V2l0aEhvdmVyQ29udGVudChyb3c6IEVsZW1lbnQpOiB2b2lkIHtcbiAgICB0aGlzLl9yb3dzV2l0aEhvdmVyQ29udGVudC5zZXQocm93LCAodGhpcy5fcm93c1dpdGhIb3ZlckNvbnRlbnQuZ2V0KHJvdykgfHwgMCkgKyAxKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWZlcmVuY2UgZGVjcmVtZW50cyBhbmQgdWx0aW1hdGVseSByZW1vdmVzIHRoZSBzcGVjaWZpZWQgdGFibGUgcm93IGZyb20gZmlyc3QvbGFzdCByb3dcbiAgICogY29tcGFyaXNvbnMuXG4gICAqL1xuICBkZXJlZ2lzdGVyUm93V2l0aEhvdmVyQ29udGVudChyb3c6IEVsZW1lbnQpOiB2b2lkIHtcbiAgICBjb25zdCByZWZDb3VudCA9IHRoaXMuX3Jvd3NXaXRoSG92ZXJDb250ZW50LmdldChyb3cpIHx8IDA7XG5cbiAgICBpZiAocmVmQ291bnQgPD0gMSkge1xuICAgICAgdGhpcy5fcm93c1dpdGhIb3ZlckNvbnRlbnQuZGVsZXRlKHJvdyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3Jvd3NXaXRoSG92ZXJDb250ZW50LnNldChyb3csIHJlZkNvdW50IC0gMSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgYW4gT2JzZXJ2YWJsZSB0aGF0IGVtaXRzIHRydWUgd2hlbiB0aGUgc3BlY2lmaWVkIGVsZW1lbnQncyByb3dcbiAgICogY29udGFpbnMgdGhlIGZvY3VzZWQgZWxlbWVudCBvciBpcyBiZWluZyBob3ZlcmVkIG92ZXIgYW5kIGZhbHNlIHdoZW4gbm90LlxuICAgKiBIb3ZlcmluZyBpcyBkZWZpbmVkIGFzIHdoZW4gdGhlIG1vdXNlIGhhcyBtb21lbnRhcmlseSBzdG9wcGVkIG1vdmluZyBvdmVyIHRoZSBjZWxsLlxuICAgKi9cbiAgaG92ZXJPckZvY3VzT25Sb3cocm93OiBFbGVtZW50KTogT2JzZXJ2YWJsZTxIb3ZlckNvbnRlbnRTdGF0ZT4ge1xuICAgIGlmIChyb3cgIT09IHRoaXMuX2xhc3RTZWVuUm93KSB7XG4gICAgICB0aGlzLl9sYXN0U2VlblJvdyA9IHJvdztcbiAgICAgIHRoaXMuX2xhc3RTZWVuUm93SG92ZXJPckZvY3VzID0gdGhpcy5faG92ZXJlZENvbnRlbnRTdGF0ZURpc3RpbmN0LnBpcGUoXG4gICAgICAgIG1hcChzdGF0ZSA9PiBzdGF0ZS5nZXQocm93KSB8fCBIb3ZlckNvbnRlbnRTdGF0ZS5PRkYpLFxuICAgICAgICB0aGlzLl9kaXN0aW5jdFNoYXJlLFxuICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fbGFzdFNlZW5Sb3dIb3Zlck9yRm9jdXMhO1xuICB9XG5cbiAgLyoqXG4gICAqIFJ4SlMgb3BlcmF0b3IgdGhhdCBlbnRlcnMgdGhlIEFuZ3VsYXIgem9uZSwgdXNlZCB0byByZWR1Y2UgYm9pbGVycGxhdGUgaW5cbiAgICogcmUtZW50ZXJpbmcgdGhlIHpvbmUgZm9yIHN0cmVhbSBwaXBlbGluZXMuXG4gICAqL1xuICBwcml2YXRlIF9lbnRlclpvbmU8VD4oKTogTW9ub1R5cGVPcGVyYXRvckZ1bmN0aW9uPFQ+IHtcbiAgICByZXR1cm4gKHNvdXJjZTogT2JzZXJ2YWJsZTxUPikgPT5cbiAgICAgICAgbmV3IE9ic2VydmFibGU8VD4oKG9ic2VydmVyKSA9PiBzb3VyY2Uuc3Vic2NyaWJlKHtcbiAgICAgICAgICAgICBuZXh0OiAodmFsdWUpID0+IHRoaXMuX25nWm9uZS5ydW4oKCkgPT4gb2JzZXJ2ZXIubmV4dCh2YWx1ZSkpLFxuICAgICAgICAgICAgIGVycm9yOiAoZXJyKSA9PiBvYnNlcnZlci5lcnJvcihlcnIpLFxuICAgICAgICAgICAgIGNvbXBsZXRlOiAoKSA9PiBvYnNlcnZlci5jb21wbGV0ZSgpXG4gICAgICAgICAgIH0pKTtcbiAgfVxuXG4gIHByaXZhdGUgX2dldEZpcnN0Um93V2l0aEhvdmVyQ29udGVudCgpOiBPYnNlcnZhYmxlPEVsZW1lbnR8bnVsbD4ge1xuICAgIHJldHVybiB0aGlzLl9tYXBBbGxSb3dzVG9TaW5nbGVSb3cocm93cyA9PiB7XG4gICAgICBmb3IgKGxldCBpID0gMCwgcm93OyByb3cgPSByb3dzW2ldOyBpKyspIHtcbiAgICAgICAgaWYgKHRoaXMuX3Jvd3NXaXRoSG92ZXJDb250ZW50Lmhhcyhyb3cgYXMgRWxlbWVudCkpIHtcbiAgICAgICAgICByZXR1cm4gcm93IGFzIEVsZW1lbnQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0TGFzdFJvd1dpdGhIb3ZlckNvbnRlbnQoKTogT2JzZXJ2YWJsZTxFbGVtZW50fG51bGw+IHtcbiAgICByZXR1cm4gdGhpcy5fbWFwQWxsUm93c1RvU2luZ2xlUm93KHJvd3MgPT4ge1xuICAgICAgZm9yIChsZXQgaSA9IHJvd3MubGVuZ3RoIC0gMSwgcm93OyByb3cgPSByb3dzW2ldOyBpLS0pIHtcbiAgICAgICAgaWYgKHRoaXMuX3Jvd3NXaXRoSG92ZXJDb250ZW50Lmhhcyhyb3cgYXMgRWxlbWVudCkpIHtcbiAgICAgICAgICByZXR1cm4gcm93IGFzIEVsZW1lbnQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfbWFwQWxsUm93c1RvU2luZ2xlUm93KG1hcHBlcjogKHJvd3M6IE5vZGVMaXN0KSA9PiBFbGVtZW50fG51bGwpOlxuICAgICAgT2JzZXJ2YWJsZTxFbGVtZW50fG51bGw+IHtcbiAgICByZXR1cm4gdGhpcy5hbGxSb3dzLnBpcGUoXG4gICAgICAgIG1hcChtYXBwZXIpLFxuICAgICAgICB0aGlzLl9zdGFydFdpdGhOdWxsRGlzdGluY3QsXG4gICAgKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjb21wdXRlSG92ZXJDb250ZW50U3RhdGUoW2ZpcnN0Um93LCBsYXN0Um93LCBhY3RpdmVSb3csIGhvdmVyUm93XTogQXJyYXk8RWxlbWVudHxudWxsPik6XG4gICAgIE1hcDxFbGVtZW50LCBIb3ZlckNvbnRlbnRTdGF0ZT4ge1xuICBjb25zdCBob3ZlckNvbnRlbnRTdGF0ZSA9IG5ldyBNYXA8RWxlbWVudCwgSG92ZXJDb250ZW50U3RhdGU+KCk7XG5cbiAgLy8gQWRkIGZvY3VzYWJsZSByb3dzLlxuICBmb3IgKGNvbnN0IGZvY3Vzc2FibGVSb3cgb2YgW1xuICAgIGZpcnN0Um93LFxuICAgIGxhc3RSb3csXG4gICAgYWN0aXZlUm93ICYmIGFjdGl2ZVJvdy5wcmV2aW91c0VsZW1lbnRTaWJsaW5nLFxuICAgIGFjdGl2ZVJvdyAmJiBhY3RpdmVSb3cubmV4dEVsZW1lbnRTaWJsaW5nLFxuICBdKSB7XG4gICAgaWYgKGZvY3Vzc2FibGVSb3cpIHtcbiAgICAgIGhvdmVyQ29udGVudFN0YXRlLnNldChmb2N1c3NhYmxlUm93IGFzIEVsZW1lbnQsIEhvdmVyQ29udGVudFN0YXRlLkZPQ1VTQUJMRSk7XG4gICAgfVxuICB9XG5cbiAgLy8gQWRkL292ZXJ3cml0ZSB3aXRoIGZ1bGx5IHZpc2libGUgcm93cy5cbiAgZm9yIChjb25zdCBvblJvdyBvZiBbYWN0aXZlUm93LCBob3ZlclJvd10pIHtcbiAgICBpZiAob25Sb3cpIHtcbiAgICAgIGhvdmVyQ29udGVudFN0YXRlLnNldChvblJvdywgSG92ZXJDb250ZW50U3RhdGUuT04pO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBob3ZlckNvbnRlbnRTdGF0ZTtcbn1cblxuZnVuY3Rpb24gYXJlTWFwRW50cmllc0VxdWFsPEssIFY+KGE6IE1hcDxLLCBWPiwgYjogTWFwPEssIFY+KTogYm9vbGVhbiB7XG4gIGlmIChhLnNpemUgIT09IGIuc2l6ZSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIFRPRE86IHVzZSBNYXAucHJvdG90eXBlLmVudHJpZXMgb25jZSB3ZSdyZSBvZmYgSUUxMS5cbiAgZm9yIChjb25zdCBhS2V5IG9mIEFycmF5LmZyb20oYS5rZXlzKCkpKSB7XG4gICAgaWYgKGIuZ2V0KGFLZXkpICE9PSBhLmdldChhS2V5KSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufVxuIl19