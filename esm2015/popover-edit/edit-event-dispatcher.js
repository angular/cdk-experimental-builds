/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __decorate, __metadata } from "tslib";
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
    let EditEventDispatcher = class EditEventDispatcher {
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
    };
    EditEventDispatcher = __decorate([
        Injectable(),
        __metadata("design:paramtypes", [NgZone])
    ], EditEventDispatcher);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdC1ldmVudC1kaXNwYXRjaGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvcG9wb3Zlci1lZGl0L2VkaXQtZXZlbnQtZGlzcGF0Y2hlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7O0FBRUgsT0FBTyxFQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDakQsT0FBTyxFQUFDLGFBQWEsRUFBNEIsVUFBVSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDeEYsT0FBTyxFQUNMLEtBQUssRUFDTCxTQUFTLEVBQ1QsWUFBWSxFQUNaLG9CQUFvQixFQUNwQixNQUFNLEVBQ04sR0FBRyxFQUNILElBQUksRUFDSixTQUFTLEVBQ1QsV0FBVyxHQUNaLE1BQU0sZ0JBQWdCLENBQUM7QUFFeEIsT0FBTyxFQUFDLGFBQWEsRUFBRSxZQUFZLEVBQUMsTUFBTSxhQUFhLENBQUM7QUFDeEQsT0FBTyxFQUFDLE9BQU8sRUFBQyxNQUFNLFlBQVksQ0FBQztBQUduQyxnRkFBZ0Y7QUFDaEYsTUFBTSxvQkFBb0IsR0FBRyxFQUFFLENBQUM7QUFFaEMsb0RBQW9EO0FBQ3BELE1BQU0sV0FBVyxHQUFHLENBQUMsQ0FBQztBQWN0Qjs7R0FFRztBQUVIO0lBQUEsSUFBYSxtQkFBbUIsR0FBaEMsTUFBYSxtQkFBbUI7UUF1RzlCLFlBQTZCLE9BQWU7WUFBZixZQUFPLEdBQVAsT0FBTyxDQUFRO1lBdEc1Qyw4RkFBOEY7WUFDckYsWUFBTyxHQUFHLElBQUksT0FBTyxFQUFnQixDQUFDO1lBRS9DLHFFQUFxRTtZQUM1RCxhQUFRLEdBQUcsSUFBSSxPQUFPLEVBQWdCLENBQUM7WUFFaEQseUVBQXlFO1lBQ2hFLFlBQU8sR0FBRyxJQUFJLE9BQU8sRUFBZ0IsQ0FBQztZQUUvQyxnRkFBZ0Y7WUFDdkUsWUFBTyxHQUFHLElB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SUFDMUQsSUFBSSxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxJQUFJLEVBQUU7UUFDckIsT0FBTyxLQUFLLENBQUM7S0FDZDtJQUVELHVEQUF1RDtJQUN2RCxLQUFLLE1BQU0sSUFBSSxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUU7UUFDdkMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDL0IsT0FBTyxLQUFLLENBQUM7U0FDZDtLQUNGO0lBRUQsT0FBTyxJQUFJLENBQUM7QUFDZCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SW5qZWN0YWJsZSwgTmdab25lfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7Y29tYmluZUxhdGVzdCwgTW9ub1R5cGVPcGVyYXRvckZ1bmN0aW9uLCBPYnNlcnZhYmxlLCBwaXBlLCBTdWJqZWN0fSBmcm9tICdyeGpzJztcbmltcG9ydCB7XG4gIGF1ZGl0LFxuICBhdWRpdFRpbWUsXG4gIGRlYm91bmNlVGltZSxcbiAgZGlzdGluY3RVbnRpbENoYW5nZWQsXG4gIGZpbHRlcixcbiAgbWFwLFxuICBza2lwLFxuICBzdGFydFdpdGgsXG4gIHNoYXJlUmVwbGF5LFxufSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbmltcG9ydCB7Q0VMTF9TRUxFQ1RPUiwgUk9XX1NFTEVDVE9SfSBmcm9tICcuL2NvbnN0YW50cyc7XG5pbXBvcnQge2Nsb3Nlc3R9IGZyb20gJy4vcG9seWZpbGwnO1xuaW1wb3J0IHtFZGl0UmVmfSBmcm9tICcuL2VkaXQtcmVmJztcblxuLyoqIFRoZSBkZWxheSBhcHBsaWVkIHRvIG1vdXNlIGV2ZW50cyBiZWZvcmUgaGlkaW5nIG9yIHNob3dpbmcgaG92ZXIgY29udGVudC4gKi9cbmNvbnN0IE1PVVNFX0VWRU5UX0RFTEFZX01TID0gNDA7XG5cbi8qKiBUaGUgZGVsYXkgZm9yIHJlYWN0aW5nIHRvIGZvY3VzL2JsdXIgY2hhbmdlcy4gKi9cbmNvbnN0IEZPQ1VTX0RFTEFZID0gMDtcblxuLyoqXG4gKiBUaGUgcG9zc2libGUgc3RhdGVzIGZvciBob3ZlciBjb250ZW50OlxuICogT0ZGIC0gTm90IHJlbmRlcmVkLlxuICogRk9DVVNBQkxFIC0gUmVuZGVyZWQgaW4gdGhlIGRvbSBhbmQgc3R5bGVkIGZvciBpdHMgY29udGVudHMgdG8gYmUgZm9jdXNhYmxlIGJ1dCBpbnZpc2libGUuXG4gKiBPTiAtIFJlbmRlcmVkIGFuZCBmdWxseSB2aXNpYmxlLlxuICovXG5leHBvcnQgY29uc3QgZW51bSBIb3ZlckNvbnRlbnRTdGF0ZSB7XG4gIE9GRiA9IDAsXG4gIEZPQ1VTQUJMRSxcbiAgT04sXG59XG5cbi8qKlxuICogU2VydmljZSBmb3Igc2hhcmluZyBkZWxlZ2F0ZWQgZXZlbnRzIGFuZCBzdGF0ZSBmb3IgdHJpZ2dlcmluZyB0YWJsZSBlZGl0cy5cbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEVkaXRFdmVudERpc3BhdGNoZXIge1xuICAvKiogQSBzdWJqZWN0IHRoYXQgaW5kaWNhdGVzIHdoaWNoIHRhYmxlIGNlbGwgaXMgY3VycmVudGx5IGVkaXRpbmcgKHVubGVzcyBpdCBpcyBkaXNhYmxlZCkuICovXG4gIHJlYWRvbmx5IGVkaXRpbmcgPSBuZXcgU3ViamVjdDxFbGVtZW50fG51bGw+KCk7XG5cbiAgLyoqIEEgc3ViamVjdCB0aGF0IGluZGljYXRlcyB3aGljaCB0YWJsZSByb3cgaXMgY3VycmVudGx5IGhvdmVyZWQuICovXG4gIHJlYWRvbmx5IGhvdmVyaW5nID0gbmV3IFN1YmplY3Q8RWxlbWVudHxudWxsPigpO1xuXG4gIC8qKiBBIHN1YmplY3QgdGhhdCBpbmRpY2F0ZXMgd2hpY2ggdGFibGUgcm93IGN1cnJlbnRseSBjb250YWlucyBmb2N1cy4gKi9cbiAgcmVhZG9ubHkgZm9jdXNlZCA9IG5ldyBTdWJqZWN0PEVsZW1lbnR8bnVsbD4oKTtcblxuICAvKiogQSBzdWJqZWN0IHRoYXQgaW5kaWNhdGVzIGFsbCBlbGVtZW50cyBpbiB0aGUgdGFibGUgbWF0Y2hpbmcgUk9XX1NFTEVDVE9SLiAqL1xuICByZWFkb25seSBhbGxSb3dzID0gbmV3IFN1YmplY3Q8Tm9kZUxpc3Q+KCk7XG5cbiAgLyoqIEEgc3ViamVjdCB0aGF0IGVtaXRzIG1vdXNlIG1vdmUgZXZlbnRzIGZyb20gdGhlIHRhYmxlIGluZGljYXRpbmcgdGhlIHRhcmdldGVkIHJvdy4gKi9cbiAgcmVhZG9ubHkgbW91c2VNb3ZlID0gbmV3IFN1YmplY3Q8RWxlbWVudHxudWxsPigpO1xuXG4gIC8vIFRPRE86IFVzZSBXZWFrU2V0IG9uY2UgSUUxMSBzdXBwb3J0IGlzIGRyb3BwZWQuXG4gIC8qKlxuICAgKiBUcmFja3MgdGhlIGN1cnJlbnRseSBkaXNhYmxlZCBlZGl0YWJsZSBjZWxscyAtIGVkaXQgY2FsbHMgd2lsbCBiZSBpZ25vcmVkXG4gICAqIGZvciB0aGVzZSBjZWxscy5cbiAgICovXG4gIHJlYWRvbmx5IGRpc2FibGVkQ2VsbHMgPSBuZXcgV2Vha01hcDxFbGVtZW50LCBib29sZWFuPigpO1xuXG4gIC8qKiBUaGUgRWRpdFJlZiBmb3IgdGhlIGN1cnJlbnRseSBhY3RpdmUgZWRpdCBsZW5zIChpZiBhbnkpLiAqL1xuICBnZXQgZWRpdFJlZigpOiBFZGl0UmVmPGFueT58bnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuX2VkaXRSZWY7XG4gIH1cbiAgcHJpdmF0ZSBfZWRpdFJlZjogRWRpdFJlZjxhbnk+fG51bGwgPSBudWxsO1xuXG4gIC8vIE9wdGltaXphdGlvbjogUHJlY29tcHV0ZSBjb21tb24gcGlwZWFibGUgb3BlcmF0b3JzIHVzZWQgcGVyIHJvdy9jZWxsLlxuICBwcml2YXRlIHJlYWRvbmx5IF9kaXN0aW5jdFVudGlsQ2hhbmdlZCA9XG4gICAgICBkaXN0aW5jdFVudGlsQ2hhbmdlZDxFbGVtZW50fEhvdmVyQ29udGVudFN0YXRlfGJvb2xlYW58bnVsbD4oKTtcbiAgcHJpdmF0ZSByZWFkb25seSBfc3RhcnRXaXRoTnVsbCA9IHN0YXJ0V2l0aDxFbGVtZW50fG51bGw+KG51bGwpO1xuICBwcml2YXRlIHJlYWRvbmx5IF9kaXN0aW5jdFNoYXJlID0gcGlwZShcbiAgICB0aGlzLl9kaXN0aW5jdFVudGlsQ2hhbmdlZCBhcyBNb25vVHlwZU9wZXJhdG9yRnVuY3Rpb248SG92ZXJDb250ZW50U3RhdGU+LFxuICAgIHNoYXJlUmVwbGF5KDEpLFxuICApO1xuICBwcml2YXRlIHJlYWRvbmx5IF9zdGFydFdpdGhOdWxsRGlzdGluY3QgPSBwaXBlKFxuICAgIHRoaXMuX3N0YXJ0V2l0aE51bGwsXG4gICAgdGhpcy5fZGlzdGluY3RVbnRpbENoYW5nZWQgYXMgTW9ub1R5cGVPcGVyYXRvckZ1bmN0aW9uPEVsZW1lbnR8bnVsbD4sXG4gICk7XG5cbiAgcmVhZG9ubHkgZWRpdGluZ0FuZEVuYWJsZWQgPSB0aGlzLmVkaXRpbmcucGlwZShcbiAgICAgIGZpbHRlcihjZWxsID0+IGNlbGwgPT0gbnVsbCB8fCAhdGhpcy5kaXNhYmxlZENlbGxzLmhhcyhjZWxsKSksXG4gICAgICBzaGFyZVJlcGxheSgxKSxcbiAgKTtcblxuICAvKiogQW4gb2JzZXJ2YWJsZSB0aGF0IGVtaXRzIHRoZSByb3cgY29udGFpbmluZyBmb2N1cyBvciBhbiBhY3RpdmUgZWRpdC4gKi9cbiAgcmVhZG9ubHkgZWRpdGluZ09yRm9jdXNlZCA9IGNvbWJpbmVMYXRlc3QoW1xuICAgICAgdGhpcy5lZGl0aW5nQW5kRW5hYmxlZC5waXBlKFxuICAgICAgICAgIG1hcChjZWxsID0+IGNsb3Nlc3QoY2VsbCwgUk9XX1NFTEVDVE9SKSksXG4gICAgICAgICAgdGhpcy5fc3RhcnRXaXRoTnVsbCxcbiAgICAgICksXG4gICAgICB0aGlzLmZvY3VzZWQucGlwZSh0aGlzLl9zdGFydFdpdGhOdWxsKSxcbiAgXSkucGlwZShcbiAgICAgIG1hcCgoW2VkaXRpbmdSb3csIGZvY3VzZWRSb3ddKSA9PiBmb2N1c2VkUm93IHx8IGVkaXRpbmdSb3cpLFxuICAgICAgdGhpcy5fZGlzdGluY3RVbnRpbENoYW5nZWQgYXMgTW9ub1R5cGVPcGVyYXRvckZ1bmN0aW9uPEVsZW1lbnR8bnVsbD4sXG4gICAgICBhdWRpdFRpbWUoRk9DVVNfREVMQVkpLCAvLyBVc2UgYXVkaXQgdG8gc2tpcCBvdmVyIGJsdXIgZXZlbnRzIHRvIHRoZSBuZXh0IGZvY3VzZWQgZWxlbWVudC5cbiAgICAgIHRoaXMuX2Rpc3RpbmN0VW50aWxDaGFuZ2VkIGFzIE1vbm9UeXBlT3BlcmF0b3JGdW5jdGlvbjxFbGVtZW50fG51bGw+LFxuICAgICAgc2hhcmVSZXBsYXkoMSksXG4gICk7XG5cbiAgLyoqIFRyYWNrcyByb3dzIHRoYXQgY29udGFpbiBob3ZlciBjb250ZW50IHdpdGggYSByZWZlcmVuY2UgY291bnQuICovXG4gIHByaXZhdGUgX3Jvd3NXaXRoSG92ZXJDb250ZW50ID0gbmV3IFdlYWtNYXA8RWxlbWVudCwgbnVtYmVyPigpO1xuXG4gIC8qKiBUaGUgdGFibGUgY2VsbCB0aGF0IGhhcyBhbiBhY3RpdmUgZWRpdCBsZW5zIChvciBudWxsKS4gKi9cbiAgcHJpdmF0ZSBfY3VycmVudGx5RWRpdGluZzogRWxlbWVudHxudWxsID0gbnVsbDtcblxuICAvKiogVGhlIGNvbWJpbmVkIHNldCBvZiByb3cgaG92ZXIgY29udGVudCBzdGF0ZXMgb3JnYW5pemVkIGJ5IHJvdy4gKi9cbiAgcHJpdmF0ZSByZWFkb25seSBfaG92ZXJlZENvbnRlbnRTdGF0ZURpc3RpbmN0ID0gY29tYmluZUxhdGVzdChbXG4gICAgICB0aGlzLl9nZXRGaXJzdFJvd1dpdGhIb3ZlckNvbnRlbnQoKSxcbiAgICAgIHRoaXMuX2dldExhc3RSb3dXaXRoSG92ZXJDb250ZW50KCksXG4gICAgICB0aGlzLmVkaXRpbmdPckZvY3VzZWQsXG4gICAgICB0aGlzLmhvdmVyaW5nLnBpcGUoXG4gICAgICAgICAgZGlzdGluY3RVbnRpbENoYW5nZWQoKSxcbiAgICAgICAgICBhdWRpdChyb3cgPT4gdGhpcy5tb3VzZU1vdmUucGlwZShcbiAgICAgICAgICAgICAgZmlsdGVyKG1vdXNlTW92ZVJvdyA9PiByb3cgPT09IG1vdXNlTW92ZVJvdyksXG4gICAgICAgICAgICAgIHRoaXMuX3N0YXJ0V2l0aE51bGwsXG4gICAgICAgICAgICAgIGRlYm91bmNlVGltZShNT1VTRV9FVkVOVF9ERUxBWV9NUykpLFxuICAgICAgICAgICksXG4gICAgICAgICAgdGhpcy5fc3RhcnRXaXRoTnVsbERpc3RpbmN0LFxuICAgICAgKSxcbiAgXSkucGlwZShcbiAgICAgIHNraXAoMSksIC8vIFNraXAgdGhlIGluaXRpYWwgZW1pc3Npb24gb2YgW251bGwsIG51bGwsIG51bGwsIG51bGxdLlxuICAgICAgbWFwKGNvbXB1dGVIb3ZlckNvbnRlbnRTdGF0ZSksXG4gICAgICBkaXN0aW5jdFVudGlsQ2hhbmdlZChhcmVNYXBFbnRyaWVzRXF1YWwpLFxuICAgICAgLy8gT3B0aW1pemF0aW9uOiBFbnRlciB0aGUgem9uZSBiZWZvcmUgc2hhcmVSZXBsYXkgc28gdGhhdCB3ZSB0cmlnZ2VyIGEgc2luZ2xlXG4gICAgICAvLyBBcHBsaWNhdGlvblJlZi50aWNrIGZvciBhbGwgcm93IHVwZGF0ZXMuXG4gICAgICB0aGlzLl9lbnRlclpvbmUoKSxcbiAgICAgIHNoYXJlUmVwbGF5KDEpLFxuICApO1xuXG4gIHByaXZhdGUgcmVhZG9ubHkgX2VkaXRpbmdBbmRFbmFibGVkRGlzdGluY3QgPSB0aGlzLmVkaXRpbmdBbmRFbmFibGVkLnBpcGUoXG4gICAgICBkaXN0aW5jdFVudGlsQ2hhbmdlZCgpLFxuICAgICAgdGhpcy5fZW50ZXJab25lKCksXG4gICAgICBzaGFyZVJlcGxheSgxKSxcbiAgKTtcblxuICAvLyBPcHRpbWl6YXRpb246IFNoYXJlIHJvdyBldmVudHMgb2JzZXJ2YWJsZSB3aXRoIHN1YnNlcXVlbnQgY2FsbGVycy5cbiAgLy8gQXQgc3RhcnR1cCwgY2FsbHMgd2lsbCBiZSBzZXF1ZW50aWFsIGJ5IHJvdy5cbiAgcHJpdmF0ZSBfbGFzdFNlZW5Sb3c6IEVsZW1lbnR8bnVsbCA9IG51bGw7XG4gIHByaXZhdGUgX2xhc3RTZWVuUm93SG92ZXJPckZvY3VzOiBPYnNlcnZhYmxlPEhvdmVyQ29udGVudFN0YXRlPnxudWxsID0gbnVsbDtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHJlYWRvbmx5IF9uZ1pvbmU6IE5nWm9uZSkge1xuICAgIHRoaXMuX2VkaXRpbmdBbmRFbmFibGVkRGlzdGluY3Quc3Vic2NyaWJlKGNlbGwgPT4ge1xuICAgICAgdGhpcy5fY3VycmVudGx5RWRpdGluZyA9IGNlbGw7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyBhbiBPYnNlcnZhYmxlIHRoYXQgZW1pdHMgdHJ1ZSB3aGVuIHRoZSBzcGVjaWZpZWQgZWxlbWVudCdzIGNlbGxcbiAgICogaXMgZWRpdGluZyBhbmQgZmFsc2Ugd2hlbiBub3QuXG4gICAqL1xuICBlZGl0aW5nQ2VsbChlbGVtZW50OiBFbGVtZW50fEV2ZW50VGFyZ2V0KTogT2JzZXJ2YWJsZTxib29sZWFuPiB7XG4gICAgbGV0IGNlbGw6IEVsZW1lbnR8bnVsbCA9IG51bGw7XG5cbiAgICByZXR1cm4gdGhpcy5fZWRpdGluZ0FuZEVuYWJsZWREaXN0aW5jdC5waXBlKFxuICAgICAgICBtYXAoZWRpdENlbGwgPT4gZWRpdENlbGwgPT09IChjZWxsIHx8IChjZWxsID0gY2xvc2VzdChlbGVtZW50LCBDRUxMX1NFTEVDVE9SKSkpKSxcbiAgICAgICAgdGhpcy5fZGlzdGluY3RVbnRpbENoYW5nZWQgYXMgTW9ub1R5cGVPcGVyYXRvckZ1bmN0aW9uPGJvb2xlYW4+LFxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogU3RvcHMgZWRpdGluZyBmb3IgdGhlIHNwZWNpZmllZCBjZWxsLiBJZiB0aGUgc3BlY2lmaWVkIGNlbGwgaXMgbm90IHRoZSBjdXJyZW50XG4gICAqIGVkaXQgY2VsbCwgZG9lcyBub3RoaW5nLlxuICAgKi9cbiAgZG9uZUVkaXRpbmdDZWxsKGVsZW1lbnQ6IEVsZW1lbnR8RXZlbnRUYXJnZXQpOiB2b2lkIHtcbiAgICBjb25zdCBjZWxsID0gY2xvc2VzdChlbGVtZW50LCBDRUxMX1NFTEVDVE9SKTtcblxuICAgIGlmICh0aGlzLl9jdXJyZW50bHlFZGl0aW5nID09PSBjZWxsKSB7XG4gICAgICB0aGlzLmVkaXRpbmcubmV4dChudWxsKTtcbiAgICB9XG4gIH1cblxuICAvKiogU2V0cyB0aGUgY3VycmVudGx5IGFjdGl2ZSBFZGl0UmVmLiAqL1xuICBzZXRBY3RpdmVFZGl0UmVmKHJlZjogRWRpdFJlZjxhbnk+KSB7XG4gICAgdGhpcy5fZWRpdFJlZiA9IHJlZjtcbiAgfVxuXG4gIC8qKiBVbnNldHMgdGhlIGN1cnJlbnRseSBhY3RpdmUgRWRpdFJlZiwgaWYgdGhlIHNwZWNpZmllZCBlZGl0UmVmIGlzIGFjdGl2ZS4gKi9cbiAgdW5zZXRBY3RpdmVFZGl0UmVmKHJlZjogRWRpdFJlZjxhbnk+KSB7XG4gICAgaWYgKHRoaXMuX2VkaXRSZWYgIT09IHJlZikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX2VkaXRSZWYgPSBudWxsO1xuICB9XG5cbiAgLyoqIEFkZHMgdGhlIHNwZWNpZmllZCB0YWJsZSByb3cgdG8gYmUgdHJhY2tlZCBmb3IgZmlyc3QvbGFzdCByb3cgY29tcGFyaXNvbnMuICovXG4gIHJlZ2lzdGVyUm93V2l0aEhvdmVyQ29udGVudChyb3c6IEVsZW1lbnQpOiB2b2lkIHtcbiAgICB0aGlzLl9yb3dzV2l0aEhvdmVyQ29udGVudC5zZXQocm93LCAodGhpcy5fcm93c1dpdGhIb3ZlckNvbnRlbnQuZ2V0KHJvdykgfHwgMCkgKyAxKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWZlcmVuY2UgZGVjcmVtZW50cyBhbmQgdWx0aW1hdGVseSByZW1vdmVzIHRoZSBzcGVjaWZpZWQgdGFibGUgcm93IGZyb20gZmlyc3QvbGFzdCByb3dcbiAgICogY29tcGFyaXNvbnMuXG4gICAqL1xuICBkZXJlZ2lzdGVyUm93V2l0aEhvdmVyQ29udGVudChyb3c6IEVsZW1lbnQpOiB2b2lkIHtcbiAgICBjb25zdCByZWZDb3VudCA9IHRoaXMuX3Jvd3NXaXRoSG92ZXJDb250ZW50LmdldChyb3cpIHx8IDA7XG5cbiAgICBpZiAocmVmQ291bnQgPD0gMSkge1xuICAgICAgdGhpcy5fcm93c1dpdGhIb3ZlckNvbnRlbnQuZGVsZXRlKHJvdyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3Jvd3NXaXRoSG92ZXJDb250ZW50LnNldChyb3csIHJlZkNvdW50IC0gMSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgYW4gT2JzZXJ2YWJsZSB0aGF0IGVtaXRzIHRydWUgd2hlbiB0aGUgc3BlY2lmaWVkIGVsZW1lbnQncyByb3dcbiAgICogY29udGFpbnMgdGhlIGZvY3VzZWQgZWxlbWVudCBvciBpcyBiZWluZyBob3ZlcmVkIG92ZXIgYW5kIGZhbHNlIHdoZW4gbm90LlxuICAgKiBIb3ZlcmluZyBpcyBkZWZpbmVkIGFzIHdoZW4gdGhlIG1vdXNlIGhhcyBtb21lbnRhcmlseSBzdG9wcGVkIG1vdmluZyBvdmVyIHRoZSBjZWxsLlxuICAgKi9cbiAgaG92ZXJPckZvY3VzT25Sb3cocm93OiBFbGVtZW50KTogT2JzZXJ2YWJsZTxIb3ZlckNvbnRlbnRTdGF0ZT4ge1xuICAgIGlmIChyb3cgIT09IHRoaXMuX2xhc3RTZWVuUm93KSB7XG4gICAgICB0aGlzLl9sYXN0U2VlblJvdyA9IHJvdztcbiAgICAgIHRoaXMuX2xhc3RTZWVuUm93SG92ZXJPckZvY3VzID0gdGhpcy5faG92ZXJlZENvbnRlbnRTdGF0ZURpc3RpbmN0LnBpcGUoXG4gICAgICAgIG1hcChzdGF0ZSA9PiBzdGF0ZS5nZXQocm93KSB8fCBIb3ZlckNvbnRlbnRTdGF0ZS5PRkYpLFxuICAgICAgICB0aGlzLl9kaXN0aW5jdFNoYXJlLFxuICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fbGFzdFNlZW5Sb3dIb3Zlck9yRm9jdXMhO1xuICB9XG5cbiAgLyoqXG4gICAqIFJ4SlMgb3BlcmF0b3IgdGhhdCBlbnRlcnMgdGhlIEFuZ3VsYXIgem9uZSwgdXNlZCB0byByZWR1Y2UgYm9pbGVycGxhdGUgaW5cbiAgICogcmUtZW50ZXJpbmcgdGhlIHpvbmUgZm9yIHN0cmVhbSBwaXBlbGluZXMuXG4gICAqL1xuICBwcml2YXRlIF9lbnRlclpvbmU8VD4oKTogTW9ub1R5cGVPcGVyYXRvckZ1bmN0aW9uPFQ+IHtcbiAgICByZXR1cm4gKHNvdXJjZTogT2JzZXJ2YWJsZTxUPikgPT5cbiAgICAgICAgbmV3IE9ic2VydmFibGU8VD4oKG9ic2VydmVyKSA9PiBzb3VyY2Uuc3Vic2NyaWJlKHtcbiAgICAgICAgICAgICBuZXh0OiAodmFsdWUpID0+IHRoaXMuX25nWm9uZS5ydW4oKCkgPT4gb2JzZXJ2ZXIubmV4dCh2YWx1ZSkpLFxuICAgICAgICAgICAgIGVycm9yOiAoZXJyKSA9PiBvYnNlcnZlci5lcnJvcihlcnIpLFxuICAgICAgICAgICAgIGNvbXBsZXRlOiAoKSA9PiBvYnNlcnZlci5jb21wbGV0ZSgpXG4gICAgICAgICAgIH0pKTtcbiAgfVxuXG4gIHByaXZhdGUgX2dldEZpcnN0Um93V2l0aEhvdmVyQ29udGVudCgpOiBPYnNlcnZhYmxlPEVsZW1lbnR8bnVsbD4ge1xuICAgIHJldHVybiB0aGlzLl9tYXBBbGxSb3dzVG9TaW5nbGVSb3cocm93cyA9PiB7XG4gICAgICBmb3IgKGxldCBpID0gMCwgcm93OyByb3cgPSByb3dzW2ldOyBpKyspIHtcbiAgICAgICAgaWYgKHRoaXMuX3Jvd3NXaXRoSG92ZXJDb250ZW50Lmhhcyhyb3cgYXMgRWxlbWVudCkpIHtcbiAgICAgICAgICByZXR1cm4gcm93IGFzIEVsZW1lbnQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0TGFzdFJvd1dpdGhIb3ZlckNvbnRlbnQoKTogT2JzZXJ2YWJsZTxFbGVtZW50fG51bGw+IHtcbiAgICByZXR1cm4gdGhpcy5fbWFwQWxsUm93c1RvU2luZ2xlUm93KHJvd3MgPT4ge1xuICAgICAgZm9yIChsZXQgaSA9IHJvd3MubGVuZ3RoIC0gMSwgcm93OyByb3cgPSByb3dzW2ldOyBpLS0pIHtcbiAgICAgICAgaWYgKHRoaXMuX3Jvd3NXaXRoSG92ZXJDb250ZW50Lmhhcyhyb3cgYXMgRWxlbWVudCkpIHtcbiAgICAgICAgICByZXR1cm4gcm93IGFzIEVsZW1lbnQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfbWFwQWxsUm93c1RvU2luZ2xlUm93KG1hcHBlcjogKHJvd3M6IE5vZGVMaXN0KSA9PiBFbGVtZW50fG51bGwpOlxuICAgICAgT2JzZXJ2YWJsZTxFbGVtZW50fG51bGw+IHtcbiAgICByZXR1cm4gdGhpcy5hbGxSb3dzLnBpcGUoXG4gICAgICAgIG1hcChtYXBwZXIpLFxuICAgICAgICB0aGlzLl9zdGFydFdpdGhOdWxsRGlzdGluY3QsXG4gICAgKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjb21wdXRlSG92ZXJDb250ZW50U3RhdGUoW2ZpcnN0Um93LCBsYXN0Um93LCBhY3RpdmVSb3csIGhvdmVyUm93XTogQXJyYXk8RWxlbWVudHxudWxsPik6XG4gICAgIE1hcDxFbGVtZW50LCBIb3ZlckNvbnRlbnRTdGF0ZT4ge1xuICBjb25zdCBob3ZlckNvbnRlbnRTdGF0ZSA9IG5ldyBNYXA8RWxlbWVudCwgSG92ZXJDb250ZW50U3RhdGU+KCk7XG5cbiAgLy8gQWRkIGZvY3VzYWJsZSByb3dzLlxuICBmb3IgKGNvbnN0IGZvY3Vzc2FibGVSb3cgb2YgW1xuICAgIGZpcnN0Um93LFxuICAgIGxhc3RSb3csXG4gICAgYWN0aXZlUm93ICYmIGFjdGl2ZVJvdy5wcmV2aW91c0VsZW1lbnRTaWJsaW5nLFxuICAgIGFjdGl2ZVJvdyAmJiBhY3RpdmVSb3cubmV4dEVsZW1lbnRTaWJsaW5nLFxuICBdKSB7XG4gICAgaWYgKGZvY3Vzc2FibGVSb3cpIHtcbiAgICAgIGhvdmVyQ29udGVudFN0YXRlLnNldChmb2N1c3NhYmxlUm93IGFzIEVsZW1lbnQsIEhvdmVyQ29udGVudFN0YXRlLkZPQ1VTQUJMRSk7XG4gICAgfVxuICB9XG5cbiAgLy8gQWRkL292ZXJ3cml0ZSB3aXRoIGZ1bGx5IHZpc2libGUgcm93cy5cbiAgZm9yIChjb25zdCBvblJvdyBvZiBbYWN0aXZlUm93LCBob3ZlclJvd10pIHtcbiAgICBpZiAob25Sb3cpIHtcbiAgICAgIGhvdmVyQ29udGVudFN0YXRlLnNldChvblJvdywgSG92ZXJDb250ZW50U3RhdGUuT04pO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBob3ZlckNvbnRlbnRTdGF0ZTtcbn1cblxuZnVuY3Rpb24gYXJlTWFwRW50cmllc0VxdWFsPEssIFY+KGE6IE1hcDxLLCBWPiwgYjogTWFwPEssIFY+KTogYm9vbGVhbiB7XG4gIGlmIChhLnNpemUgIT09IGIuc2l6ZSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIFRPRE86IHVzZSBNYXAucHJvdG90eXBlLmVudHJpZXMgb25jZSB3ZSdyZSBvZmYgSUUxMS5cbiAgZm9yIChjb25zdCBhS2V5IG9mIEFycmF5LmZyb20oYS5rZXlzKCkpKSB7XG4gICAgaWYgKGIuZ2V0KGFLZXkpICE9PSBhLmdldChhS2V5KSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufVxuIl19