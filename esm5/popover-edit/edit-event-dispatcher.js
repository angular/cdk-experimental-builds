/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __read, __values } from "tslib";
import { Injectable, NgZone } from '@angular/core';
import { combineLatest, Observable, pipe, Subject } from 'rxjs';
import { audit, auditTime, debounceTime, distinctUntilChanged, filter, map, skip, startWith, shareReplay, } from 'rxjs/operators';
import { CELL_SELECTOR, ROW_SELECTOR } from './constants';
import { closest } from './polyfill';
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
        this._distinctShare = pipe(this._distinctUntilChanged, shareReplay(1));
        this._startWithNullDistinct = pipe(this._startWithNull, this._distinctUntilChanged);
        this.editingAndEnabled = this.editing.pipe(filter(function (cell) { return cell == null || !_this.disabledCells.has(cell); }), shareReplay(1));
        /** An observable that emits the row containing focus or an active edit. */
        this.editingOrFocused = combineLatest([
            this.editingAndEnabled.pipe(map(function (cell) { return closest(cell, ROW_SELECTOR); }), this._startWithNull),
            this.focused.pipe(this._startWithNull),
        ]).pipe(map(function (_a) {
            var _b = __read(_a, 2), editingRow = _b[0], focusedRow = _b[1];
            return focusedRow || editingRow;
        }), this._distinctUntilChanged, auditTime(FOCUS_DELAY), // Use audit to skip over blur events to the next focused element.
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
            this.hovering.pipe(distinctUntilChanged(), audit(function (row) { return _this.mouseMove.pipe(filter(function (mouseMoveRow) { return row === mouseMoveRow; }), _this._startWithNull, debounceTime(MOUSE_EVENT_DELAY_MS)); }), this._startWithNullDistinct),
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
export { EditEventDispatcher };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdC1ldmVudC1kaXNwYXRjaGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvcG9wb3Zlci1lZGl0L2VkaXQtZXZlbnQtZGlzcGF0Y2hlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7O0FBRUgsT0FBTyxFQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDakQsT0FBTyxFQUFDLGFBQWEsRUFBNEIsVUFBVSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDeEYsT0FBTyxFQUNMLEtBQUssRUFDTCxTQUFTLEVBQ1QsWUFBWSxFQUNaLG9CQUFvQixFQUNwQixNQUFNLEVBQ04sR0FBRyxFQUNILElBQUksRUFDSixTQUFTLEVBQ1QsV0FBVyxHQUNaLE1BQU0sZ0JBQWdCLENBQUM7QUFFeEIsT0FBTyxFQUFDLGFBQWEsRUFBRSxZQUFZLEVBQUMsTUFBTSxhQUFhLENBQUM7QUFDeEQsT0FBTyxFQUFDLE9BQU8sRUFBQyxNQUFNLFlBQVksQ0FBQztBQUduQyxnRkFBZ0Y7QUFDaEYsSUFBTSxvQkFBb0IsR0FBRyxFQUFFLENBQUM7QUFFaEMsb0RBQW9EO0FBQ3BELElBQU0sV0FBVyxHQUFHLENBQUMsQ0FBQztBQWN0Qjs7R0FFRztBQUNIO0lBd0dFLDZCQUE2QixPQUFlO1FBQTVDLGlCQUlDO1FBSjRCLFlBQU8sR0FBUCxPQUFPLENBQVE7UUF0RzVDLDhGQUE4RjtRQUNyRixZQUFPLEdBQUcsSUFBSSxPQUFPLEVBQWdCLENBQUM7UUFFL0MscUVBQXFFO1FBQzVELGFBQVEsR0FBRyxJQUFJLE9BQU8sRUFBZ0IsQ0FBQztRQUVoRCx5RUFBeUU7UUFDaEUsWUFBTyxHQUFHLElBQUksT0FBTyxFQUFnQixDQUFDO1FBRS9DLGdGQUFnRjtRQUN2RSxZQUFPLEdBQUcsSUFBSSxPQUFPLEVB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QyxhQUF3QixvQkFBOEIsQ0FBQzthQUM5RTtTQUNGOzs7Ozs7Ozs7O1FBRUQseUNBQXlDO1FBQ3pDLEtBQW9CLElBQUEsS0FBQSxTQUFBLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxDQUFBLGdCQUFBLDRCQUFFO1lBQXRDLElBQU0sS0FBSyxXQUFBO1lBQ2QsSUFBSSxLQUFLLEVBQUU7Z0JBQ1QsaUJBQWlCLENBQUMsR0FBRyxDQUFDLEtBQUssYUFBdUIsQ0FBQzthQUNwRDtTQUNGOzs7Ozs7Ozs7SUFFRCxPQUFPLGlCQUFpQixDQUFDO0FBQzNCLENBQUM7QUFFRCxTQUFTLGtCQUFrQixDQUFPLENBQVksRUFBRSxDQUFZOztJQUMxRCxJQUFJLENBQUMsQ0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDLElBQUksRUFBRTtRQUNyQixPQUFPLEtBQUssQ0FBQztLQUNkOztRQUVELHVEQUF1RDtRQUN2RCxLQUFtQixJQUFBLEtBQUEsU0FBQSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFBLGdCQUFBLDRCQUFFO1lBQXBDLElBQU0sSUFBSSxXQUFBO1lBQ2IsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQy9CLE9BQU8sS0FBSyxDQUFDO2FBQ2Q7U0FDRjs7Ozs7Ozs7O0lBRUQsT0FBTyxJQUFJLENBQUM7QUFDZCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SW5qZWN0YWJsZSwgTmdab25lfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7Y29tYmluZUxhdGVzdCwgTW9ub1R5cGVPcGVyYXRvckZ1bmN0aW9uLCBPYnNlcnZhYmxlLCBwaXBlLCBTdWJqZWN0fSBmcm9tICdyeGpzJztcbmltcG9ydCB7XG4gIGF1ZGl0LFxuICBhdWRpdFRpbWUsXG4gIGRlYm91bmNlVGltZSxcbiAgZGlzdGluY3RVbnRpbENoYW5nZWQsXG4gIGZpbHRlcixcbiAgbWFwLFxuICBza2lwLFxuICBzdGFydFdpdGgsXG4gIHNoYXJlUmVwbGF5LFxufSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbmltcG9ydCB7Q0VMTF9TRUxFQ1RPUiwgUk9XX1NFTEVDVE9SfSBmcm9tICcuL2NvbnN0YW50cyc7XG5pbXBvcnQge2Nsb3Nlc3R9IGZyb20gJy4vcG9seWZpbGwnO1xuaW1wb3J0IHtFZGl0UmVmfSBmcm9tICcuL2VkaXQtcmVmJztcblxuLyoqIFRoZSBkZWxheSBhcHBsaWVkIHRvIG1vdXNlIGV2ZW50cyBiZWZvcmUgaGlkaW5nIG9yIHNob3dpbmcgaG92ZXIgY29udGVudC4gKi9cbmNvbnN0IE1PVVNFX0VWRU5UX0RFTEFZX01TID0gNDA7XG5cbi8qKiBUaGUgZGVsYXkgZm9yIHJlYWN0aW5nIHRvIGZvY3VzL2JsdXIgY2hhbmdlcy4gKi9cbmNvbnN0IEZPQ1VTX0RFTEFZID0gMDtcblxuLyoqXG4gKiBUaGUgcG9zc2libGUgc3RhdGVzIGZvciBob3ZlciBjb250ZW50OlxuICogT0ZGIC0gTm90IHJlbmRlcmVkLlxuICogRk9DVVNBQkxFIC0gUmVuZGVyZWQgaW4gdGhlIGRvbSBhbmQgc3R5bGVkIGZvciBpdHMgY29udGVudHMgdG8gYmUgZm9jdXNhYmxlIGJ1dCBpbnZpc2libGUuXG4gKiBPTiAtIFJlbmRlcmVkIGFuZCBmdWxseSB2aXNpYmxlLlxuICovXG5leHBvcnQgY29uc3QgZW51bSBIb3ZlckNvbnRlbnRTdGF0ZSB7XG4gIE9GRiA9IDAsXG4gIEZPQ1VTQUJMRSxcbiAgT04sXG59XG5cbi8qKlxuICogU2VydmljZSBmb3Igc2hhcmluZyBkZWxlZ2F0ZWQgZXZlbnRzIGFuZCBzdGF0ZSBmb3IgdHJpZ2dlcmluZyB0YWJsZSBlZGl0cy5cbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEVkaXRFdmVudERpc3BhdGNoZXIge1xuICAvKiogQSBzdWJqZWN0IHRoYXQgaW5kaWNhdGVzIHdoaWNoIHRhYmxlIGNlbGwgaXMgY3VycmVudGx5IGVkaXRpbmcgKHVubGVzcyBpdCBpcyBkaXNhYmxlZCkuICovXG4gIHJlYWRvbmx5IGVkaXRpbmcgPSBuZXcgU3ViamVjdDxFbGVtZW50fG51bGw+KCk7XG5cbiAgLyoqIEEgc3ViamVjdCB0aGF0IGluZGljYXRlcyB3aGljaCB0YWJsZSByb3cgaXMgY3VycmVudGx5IGhvdmVyZWQuICovXG4gIHJlYWRvbmx5IGhvdmVyaW5nID0gbmV3IFN1YmplY3Q8RWxlbWVudHxudWxsPigpO1xuXG4gIC8qKiBBIHN1YmplY3QgdGhhdCBpbmRpY2F0ZXMgd2hpY2ggdGFibGUgcm93IGN1cnJlbnRseSBjb250YWlucyBmb2N1cy4gKi9cbiAgcmVhZG9ubHkgZm9jdXNlZCA9IG5ldyBTdWJqZWN0PEVsZW1lbnR8bnVsbD4oKTtcblxuICAvKiogQSBzdWJqZWN0IHRoYXQgaW5kaWNhdGVzIGFsbCBlbGVtZW50cyBpbiB0aGUgdGFibGUgbWF0Y2hpbmcgUk9XX1NFTEVDVE9SLiAqL1xuICByZWFkb25seSBhbGxSb3dzID0gbmV3IFN1YmplY3Q8Tm9kZUxpc3Q+KCk7XG5cbiAgLyoqIEEgc3ViamVjdCB0aGF0IGVtaXRzIG1vdXNlIG1vdmUgZXZlbnRzIGZyb20gdGhlIHRhYmxlIGluZGljYXRpbmcgdGhlIHRhcmdldGVkIHJvdy4gKi9cbiAgcmVhZG9ubHkgbW91c2VNb3ZlID0gbmV3IFN1YmplY3Q8RWxlbWVudHxudWxsPigpO1xuXG4gIC8vIFRPRE86IFVzZSBXZWFrU2V0IG9uY2UgSUUxMSBzdXBwb3J0IGlzIGRyb3BwZWQuXG4gIC8qKlxuICAgKiBUcmFja3MgdGhlIGN1cnJlbnRseSBkaXNhYmxlZCBlZGl0YWJsZSBjZWxscyAtIGVkaXQgY2FsbHMgd2lsbCBiZSBpZ25vcmVkXG4gICAqIGZvciB0aGVzZSBjZWxscy5cbiAgICovXG4gIHJlYWRvbmx5IGRpc2FibGVkQ2VsbHMgPSBuZXcgV2Vha01hcDxFbGVtZW50LCBib29sZWFuPigpO1xuXG4gIC8qKiBUaGUgRWRpdFJlZiBmb3IgdGhlIGN1cnJlbnRseSBhY3RpdmUgZWRpdCBsZW5zIChpZiBhbnkpLiAqL1xuICBnZXQgZWRpdFJlZigpOiBFZGl0UmVmPGFueT58bnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuX2VkaXRSZWY7XG4gIH1cbiAgcHJpdmF0ZSBfZWRpdFJlZjogRWRpdFJlZjxhbnk+fG51bGwgPSBudWxsO1xuXG4gIC8vIE9wdGltaXphdGlvbjogUHJlY29tcHV0ZSBjb21tb24gcGlwZWFibGUgb3BlcmF0b3JzIHVzZWQgcGVyIHJvdy9jZWxsLlxuICBwcml2YXRlIHJlYWRvbmx5IF9kaXN0aW5jdFVudGlsQ2hhbmdlZCA9XG4gICAgICBkaXN0aW5jdFVudGlsQ2hhbmdlZDxFbGVtZW50fEhvdmVyQ29udGVudFN0YXRlfGJvb2xlYW58bnVsbD4oKTtcbiAgcHJpdmF0ZSByZWFkb25seSBfc3RhcnRXaXRoTnVsbCA9IHN0YXJ0V2l0aDxFbGVtZW50fG51bGw+KG51bGwpO1xuICBwcml2YXRlIHJlYWRvbmx5IF9kaXN0aW5jdFNoYXJlID0gcGlwZShcbiAgICB0aGlzLl9kaXN0aW5jdFVudGlsQ2hhbmdlZCBhcyBNb25vVHlwZU9wZXJhdG9yRnVuY3Rpb248SG92ZXJDb250ZW50U3RhdGU+LFxuICAgIHNoYXJlUmVwbGF5KDEpLFxuICApO1xuICBwcml2YXRlIHJlYWRvbmx5IF9zdGFydFdpdGhOdWxsRGlzdGluY3QgPSBwaXBlKFxuICAgIHRoaXMuX3N0YXJ0V2l0aE51bGwsXG4gICAgdGhpcy5fZGlzdGluY3RVbnRpbENoYW5nZWQgYXMgTW9ub1R5cGVPcGVyYXRvckZ1bmN0aW9uPEVsZW1lbnR8bnVsbD4sXG4gICk7XG5cbiAgcmVhZG9ubHkgZWRpdGluZ0FuZEVuYWJsZWQgPSB0aGlzLmVkaXRpbmcucGlwZShcbiAgICAgIGZpbHRlcihjZWxsID0+IGNlbGwgPT0gbnVsbCB8fCAhdGhpcy5kaXNhYmxlZENlbGxzLmhhcyhjZWxsKSksXG4gICAgICBzaGFyZVJlcGxheSgxKSxcbiAgKTtcblxuICAvKiogQW4gb2JzZXJ2YWJsZSB0aGF0IGVtaXRzIHRoZSByb3cgY29udGFpbmluZyBmb2N1cyBvciBhbiBhY3RpdmUgZWRpdC4gKi9cbiAgcmVhZG9ubHkgZWRpdGluZ09yRm9jdXNlZCA9IGNvbWJpbmVMYXRlc3QoW1xuICAgICAgdGhpcy5lZGl0aW5nQW5kRW5hYmxlZC5waXBlKFxuICAgICAgICAgIG1hcChjZWxsID0+IGNsb3Nlc3QoY2VsbCwgUk9XX1NFTEVDVE9SKSksXG4gICAgICAgICAgdGhpcy5fc3RhcnRXaXRoTnVsbCxcbiAgICAgICksXG4gICAgICB0aGlzLmZvY3VzZWQucGlwZSh0aGlzLl9zdGFydFdpdGhOdWxsKSxcbiAgXSkucGlwZShcbiAgICAgIG1hcCgoW2VkaXRpbmdSb3csIGZvY3VzZWRSb3ddKSA9PiBmb2N1c2VkUm93IHx8IGVkaXRpbmdSb3cpLFxuICAgICAgdGhpcy5fZGlzdGluY3RVbnRpbENoYW5nZWQgYXMgTW9ub1R5cGVPcGVyYXRvckZ1bmN0aW9uPEVsZW1lbnR8bnVsbD4sXG4gICAgICBhdWRpdFRpbWUoRk9DVVNfREVMQVkpLCAvLyBVc2UgYXVkaXQgdG8gc2tpcCBvdmVyIGJsdXIgZXZlbnRzIHRvIHRoZSBuZXh0IGZvY3VzZWQgZWxlbWVudC5cbiAgICAgIHRoaXMuX2Rpc3RpbmN0VW50aWxDaGFuZ2VkIGFzIE1vbm9UeXBlT3BlcmF0b3JGdW5jdGlvbjxFbGVtZW50fG51bGw+LFxuICAgICAgc2hhcmVSZXBsYXkoMSksXG4gICk7XG5cbiAgLyoqIFRyYWNrcyByb3dzIHRoYXQgY29udGFpbiBob3ZlciBjb250ZW50IHdpdGggYSByZWZlcmVuY2UgY291bnQuICovXG4gIHByaXZhdGUgX3Jvd3NXaXRoSG92ZXJDb250ZW50ID0gbmV3IFdlYWtNYXA8RWxlbWVudCwgbnVtYmVyPigpO1xuXG4gIC8qKiBUaGUgdGFibGUgY2VsbCB0aGF0IGhhcyBhbiBhY3RpdmUgZWRpdCBsZW5zIChvciBudWxsKS4gKi9cbiAgcHJpdmF0ZSBfY3VycmVudGx5RWRpdGluZzogRWxlbWVudHxudWxsID0gbnVsbDtcblxuICAvKiogVGhlIGNvbWJpbmVkIHNldCBvZiByb3cgaG92ZXIgY29udGVudCBzdGF0ZXMgb3JnYW5pemVkIGJ5IHJvdy4gKi9cbiAgcHJpdmF0ZSByZWFkb25seSBfaG92ZXJlZENvbnRlbnRTdGF0ZURpc3RpbmN0ID0gY29tYmluZUxhdGVzdChbXG4gICAgICB0aGlzLl9nZXRGaXJzdFJvd1dpdGhIb3ZlckNvbnRlbnQoKSxcbiAgICAgIHRoaXMuX2dldExhc3RSb3dXaXRoSG92ZXJDb250ZW50KCksXG4gICAgICB0aGlzLmVkaXRpbmdPckZvY3VzZWQsXG4gICAgICB0aGlzLmhvdmVyaW5nLnBpcGUoXG4gICAgICAgICAgZGlzdGluY3RVbnRpbENoYW5nZWQoKSxcbiAgICAgICAgICBhdWRpdChyb3cgPT4gdGhpcy5tb3VzZU1vdmUucGlwZShcbiAgICAgICAgICAgICAgZmlsdGVyKG1vdXNlTW92ZVJvdyA9PiByb3cgPT09IG1vdXNlTW92ZVJvdyksXG4gICAgICAgICAgICAgIHRoaXMuX3N0YXJ0V2l0aE51bGwsXG4gICAgICAgICAgICAgIGRlYm91bmNlVGltZShNT1VTRV9FVkVOVF9ERUxBWV9NUykpLFxuICAgICAgICAgICksXG4gICAgICAgICAgdGhpcy5fc3RhcnRXaXRoTnVsbERpc3RpbmN0LFxuICAgICAgKSxcbiAgXSkucGlwZShcbiAgICAgIHNraXAoMSksIC8vIFNraXAgdGhlIGluaXRpYWwgZW1pc3Npb24gb2YgW251bGwsIG51bGwsIG51bGwsIG51bGxdLlxuICAgICAgbWFwKGNvbXB1dGVIb3ZlckNvbnRlbnRTdGF0ZSksXG4gICAgICBkaXN0aW5jdFVudGlsQ2hhbmdlZChhcmVNYXBFbnRyaWVzRXF1YWwpLFxuICAgICAgLy8gT3B0aW1pemF0aW9uOiBFbnRlciB0aGUgem9uZSBiZWZvcmUgc2hhcmVSZXBsYXkgc28gdGhhdCB3ZSB0cmlnZ2VyIGEgc2luZ2xlXG4gICAgICAvLyBBcHBsaWNhdGlvblJlZi50aWNrIGZvciBhbGwgcm93IHVwZGF0ZXMuXG4gICAgICB0aGlzLl9lbnRlclpvbmUoKSxcbiAgICAgIHNoYXJlUmVwbGF5KDEpLFxuICApO1xuXG4gIHByaXZhdGUgcmVhZG9ubHkgX2VkaXRpbmdBbmRFbmFibGVkRGlzdGluY3QgPSB0aGlzLmVkaXRpbmdBbmRFbmFibGVkLnBpcGUoXG4gICAgICBkaXN0aW5jdFVudGlsQ2hhbmdlZCgpLFxuICAgICAgdGhpcy5fZW50ZXJab25lKCksXG4gICAgICBzaGFyZVJlcGxheSgxKSxcbiAgKTtcblxuICAvLyBPcHRpbWl6YXRpb246IFNoYXJlIHJvdyBldmVudHMgb2JzZXJ2YWJsZSB3aXRoIHN1YnNlcXVlbnQgY2FsbGVycy5cbiAgLy8gQXQgc3RhcnR1cCwgY2FsbHMgd2lsbCBiZSBzZXF1ZW50aWFsIGJ5IHJvdy5cbiAgcHJpdmF0ZSBfbGFzdFNlZW5Sb3c6IEVsZW1lbnR8bnVsbCA9IG51bGw7XG4gIHByaXZhdGUgX2xhc3RTZWVuUm93SG92ZXJPckZvY3VzOiBPYnNlcnZhYmxlPEhvdmVyQ29udGVudFN0YXRlPnxudWxsID0gbnVsbDtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHJlYWRvbmx5IF9uZ1pvbmU6IE5nWm9uZSkge1xuICAgIHRoaXMuX2VkaXRpbmdBbmRFbmFibGVkRGlzdGluY3Quc3Vic2NyaWJlKGNlbGwgPT4ge1xuICAgICAgdGhpcy5fY3VycmVudGx5RWRpdGluZyA9IGNlbGw7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyBhbiBPYnNlcnZhYmxlIHRoYXQgZW1pdHMgdHJ1ZSB3aGVuIHRoZSBzcGVjaWZpZWQgZWxlbWVudCdzIGNlbGxcbiAgICogaXMgZWRpdGluZyBhbmQgZmFsc2Ugd2hlbiBub3QuXG4gICAqL1xuICBlZGl0aW5nQ2VsbChlbGVtZW50OiBFbGVtZW50fEV2ZW50VGFyZ2V0KTogT2JzZXJ2YWJsZTxib29sZWFuPiB7XG4gICAgbGV0IGNlbGw6IEVsZW1lbnR8bnVsbCA9IG51bGw7XG5cbiAgICByZXR1cm4gdGhpcy5fZWRpdGluZ0FuZEVuYWJsZWREaXN0aW5jdC5waXBlKFxuICAgICAgICBtYXAoZWRpdENlbGwgPT4gZWRpdENlbGwgPT09IChjZWxsIHx8IChjZWxsID0gY2xvc2VzdChlbGVtZW50LCBDRUxMX1NFTEVDVE9SKSkpKSxcbiAgICAgICAgdGhpcy5fZGlzdGluY3RVbnRpbENoYW5nZWQgYXMgTW9ub1R5cGVPcGVyYXRvckZ1bmN0aW9uPGJvb2xlYW4+LFxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogU3RvcHMgZWRpdGluZyBmb3IgdGhlIHNwZWNpZmllZCBjZWxsLiBJZiB0aGUgc3BlY2lmaWVkIGNlbGwgaXMgbm90IHRoZSBjdXJyZW50XG4gICAqIGVkaXQgY2VsbCwgZG9lcyBub3RoaW5nLlxuICAgKi9cbiAgZG9uZUVkaXRpbmdDZWxsKGVsZW1lbnQ6IEVsZW1lbnR8RXZlbnRUYXJnZXQpOiB2b2lkIHtcbiAgICBjb25zdCBjZWxsID0gY2xvc2VzdChlbGVtZW50LCBDRUxMX1NFTEVDVE9SKTtcblxuICAgIGlmICh0aGlzLl9jdXJyZW50bHlFZGl0aW5nID09PSBjZWxsKSB7XG4gICAgICB0aGlzLmVkaXRpbmcubmV4dChudWxsKTtcbiAgICB9XG4gIH1cblxuICAvKiogU2V0cyB0aGUgY3VycmVudGx5IGFjdGl2ZSBFZGl0UmVmLiAqL1xuICBzZXRBY3RpdmVFZGl0UmVmKHJlZjogRWRpdFJlZjxhbnk+KSB7XG4gICAgdGhpcy5fZWRpdFJlZiA9IHJlZjtcbiAgfVxuXG4gIC8qKiBVbnNldHMgdGhlIGN1cnJlbnRseSBhY3RpdmUgRWRpdFJlZiwgaWYgdGhlIHNwZWNpZmllZCBlZGl0UmVmIGlzIGFjdGl2ZS4gKi9cbiAgdW5zZXRBY3RpdmVFZGl0UmVmKHJlZjogRWRpdFJlZjxhbnk+KSB7XG4gICAgaWYgKHRoaXMuX2VkaXRSZWYgIT09IHJlZikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX2VkaXRSZWYgPSBudWxsO1xuICB9XG5cbiAgLyoqIEFkZHMgdGhlIHNwZWNpZmllZCB0YWJsZSByb3cgdG8gYmUgdHJhY2tlZCBmb3IgZmlyc3QvbGFzdCByb3cgY29tcGFyaXNvbnMuICovXG4gIHJlZ2lzdGVyUm93V2l0aEhvdmVyQ29udGVudChyb3c6IEVsZW1lbnQpOiB2b2lkIHtcbiAgICB0aGlzLl9yb3dzV2l0aEhvdmVyQ29udGVudC5zZXQocm93LCAodGhpcy5fcm93c1dpdGhIb3ZlckNvbnRlbnQuZ2V0KHJvdykgfHwgMCkgKyAxKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWZlcmVuY2UgZGVjcmVtZW50cyBhbmQgdWx0aW1hdGVseSByZW1vdmVzIHRoZSBzcGVjaWZpZWQgdGFibGUgcm93IGZyb20gZmlyc3QvbGFzdCByb3dcbiAgICogY29tcGFyaXNvbnMuXG4gICAqL1xuICBkZXJlZ2lzdGVyUm93V2l0aEhvdmVyQ29udGVudChyb3c6IEVsZW1lbnQpOiB2b2lkIHtcbiAgICBjb25zdCByZWZDb3VudCA9IHRoaXMuX3Jvd3NXaXRoSG92ZXJDb250ZW50LmdldChyb3cpIHx8IDA7XG5cbiAgICBpZiAocmVmQ291bnQgPD0gMSkge1xuICAgICAgdGhpcy5fcm93c1dpdGhIb3ZlckNvbnRlbnQuZGVsZXRlKHJvdyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3Jvd3NXaXRoSG92ZXJDb250ZW50LnNldChyb3csIHJlZkNvdW50IC0gMSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgYW4gT2JzZXJ2YWJsZSB0aGF0IGVtaXRzIHRydWUgd2hlbiB0aGUgc3BlY2lmaWVkIGVsZW1lbnQncyByb3dcbiAgICogY29udGFpbnMgdGhlIGZvY3VzZWQgZWxlbWVudCBvciBpcyBiZWluZyBob3ZlcmVkIG92ZXIgYW5kIGZhbHNlIHdoZW4gbm90LlxuICAgKiBIb3ZlcmluZyBpcyBkZWZpbmVkIGFzIHdoZW4gdGhlIG1vdXNlIGhhcyBtb21lbnRhcmlseSBzdG9wcGVkIG1vdmluZyBvdmVyIHRoZSBjZWxsLlxuICAgKi9cbiAgaG92ZXJPckZvY3VzT25Sb3cocm93OiBFbGVtZW50KTogT2JzZXJ2YWJsZTxIb3ZlckNvbnRlbnRTdGF0ZT4ge1xuICAgIGlmIChyb3cgIT09IHRoaXMuX2xhc3RTZWVuUm93KSB7XG4gICAgICB0aGlzLl9sYXN0U2VlblJvdyA9IHJvdztcbiAgICAgIHRoaXMuX2xhc3RTZWVuUm93SG92ZXJPckZvY3VzID0gdGhpcy5faG92ZXJlZENvbnRlbnRTdGF0ZURpc3RpbmN0LnBpcGUoXG4gICAgICAgIG1hcChzdGF0ZSA9PiBzdGF0ZS5nZXQocm93KSB8fCBIb3ZlckNvbnRlbnRTdGF0ZS5PRkYpLFxuICAgICAgICB0aGlzLl9kaXN0aW5jdFNoYXJlLFxuICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fbGFzdFNlZW5Sb3dIb3Zlck9yRm9jdXMhO1xuICB9XG5cbiAgLyoqXG4gICAqIFJ4SlMgb3BlcmF0b3IgdGhhdCBlbnRlcnMgdGhlIEFuZ3VsYXIgem9uZSwgdXNlZCB0byByZWR1Y2UgYm9pbGVycGxhdGUgaW5cbiAgICogcmUtZW50ZXJpbmcgdGhlIHpvbmUgZm9yIHN0cmVhbSBwaXBlbGluZXMuXG4gICAqL1xuICBwcml2YXRlIF9lbnRlclpvbmU8VD4oKTogTW9ub1R5cGVPcGVyYXRvckZ1bmN0aW9uPFQ+IHtcbiAgICByZXR1cm4gKHNvdXJjZTogT2JzZXJ2YWJsZTxUPikgPT5cbiAgICAgICAgbmV3IE9ic2VydmFibGU8VD4oKG9ic2VydmVyKSA9PiBzb3VyY2Uuc3Vic2NyaWJlKHtcbiAgICAgICAgICAgICBuZXh0OiAodmFsdWUpID0+IHRoaXMuX25nWm9uZS5ydW4oKCkgPT4gb2JzZXJ2ZXIubmV4dCh2YWx1ZSkpLFxuICAgICAgICAgICAgIGVycm9yOiAoZXJyKSA9PiBvYnNlcnZlci5lcnJvcihlcnIpLFxuICAgICAgICAgICAgIGNvbXBsZXRlOiAoKSA9PiBvYnNlcnZlci5jb21wbGV0ZSgpXG4gICAgICAgICAgIH0pKTtcbiAgfVxuXG4gIHByaXZhdGUgX2dldEZpcnN0Um93V2l0aEhvdmVyQ29udGVudCgpOiBPYnNlcnZhYmxlPEVsZW1lbnR8bnVsbD4ge1xuICAgIHJldHVybiB0aGlzLl9tYXBBbGxSb3dzVG9TaW5nbGVSb3cocm93cyA9PiB7XG4gICAgICBmb3IgKGxldCBpID0gMCwgcm93OyByb3cgPSByb3dzW2ldOyBpKyspIHtcbiAgICAgICAgaWYgKHRoaXMuX3Jvd3NXaXRoSG92ZXJDb250ZW50Lmhhcyhyb3cgYXMgRWxlbWVudCkpIHtcbiAgICAgICAgICByZXR1cm4gcm93IGFzIEVsZW1lbnQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0TGFzdFJvd1dpdGhIb3ZlckNvbnRlbnQoKTogT2JzZXJ2YWJsZTxFbGVtZW50fG51bGw+IHtcbiAgICByZXR1cm4gdGhpcy5fbWFwQWxsUm93c1RvU2luZ2xlUm93KHJvd3MgPT4ge1xuICAgICAgZm9yIChsZXQgaSA9IHJvd3MubGVuZ3RoIC0gMSwgcm93OyByb3cgPSByb3dzW2ldOyBpLS0pIHtcbiAgICAgICAgaWYgKHRoaXMuX3Jvd3NXaXRoSG92ZXJDb250ZW50Lmhhcyhyb3cgYXMgRWxlbWVudCkpIHtcbiAgICAgICAgICByZXR1cm4gcm93IGFzIEVsZW1lbnQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfbWFwQWxsUm93c1RvU2luZ2xlUm93KG1hcHBlcjogKHJvd3M6IE5vZGVMaXN0KSA9PiBFbGVtZW50fG51bGwpOlxuICAgICAgT2JzZXJ2YWJsZTxFbGVtZW50fG51bGw+IHtcbiAgICByZXR1cm4gdGhpcy5hbGxSb3dzLnBpcGUoXG4gICAgICAgIG1hcChtYXBwZXIpLFxuICAgICAgICB0aGlzLl9zdGFydFdpdGhOdWxsRGlzdGluY3QsXG4gICAgKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjb21wdXRlSG92ZXJDb250ZW50U3RhdGUoW2ZpcnN0Um93LCBsYXN0Um93LCBhY3RpdmVSb3csIGhvdmVyUm93XTogQXJyYXk8RWxlbWVudHxudWxsPik6XG4gICAgIE1hcDxFbGVtZW50LCBIb3ZlckNvbnRlbnRTdGF0ZT4ge1xuICBjb25zdCBob3ZlckNvbnRlbnRTdGF0ZSA9IG5ldyBNYXA8RWxlbWVudCwgSG92ZXJDb250ZW50U3RhdGU+KCk7XG5cbiAgLy8gQWRkIGZvY3VzYWJsZSByb3dzLlxuICBmb3IgKGNvbnN0IGZvY3Vzc2FibGVSb3cgb2YgW1xuICAgIGZpcnN0Um93LFxuICAgIGxhc3RSb3csXG4gICAgYWN0aXZlUm93ICYmIGFjdGl2ZVJvdy5wcmV2aW91c0VsZW1lbnRTaWJsaW5nLFxuICAgIGFjdGl2ZVJvdyAmJiBhY3RpdmVSb3cubmV4dEVsZW1lbnRTaWJsaW5nLFxuICBdKSB7XG4gICAgaWYgKGZvY3Vzc2FibGVSb3cpIHtcbiAgICAgIGhvdmVyQ29udGVudFN0YXRlLnNldChmb2N1c3NhYmxlUm93IGFzIEVsZW1lbnQsIEhvdmVyQ29udGVudFN0YXRlLkZPQ1VTQUJMRSk7XG4gICAgfVxuICB9XG5cbiAgLy8gQWRkL292ZXJ3cml0ZSB3aXRoIGZ1bGx5IHZpc2libGUgcm93cy5cbiAgZm9yIChjb25zdCBvblJvdyBvZiBbYWN0aXZlUm93LCBob3ZlclJvd10pIHtcbiAgICBpZiAob25Sb3cpIHtcbiAgICAgIGhvdmVyQ29udGVudFN0YXRlLnNldChvblJvdywgSG92ZXJDb250ZW50U3RhdGUuT04pO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBob3ZlckNvbnRlbnRTdGF0ZTtcbn1cblxuZnVuY3Rpb24gYXJlTWFwRW50cmllc0VxdWFsPEssIFY+KGE6IE1hcDxLLCBWPiwgYjogTWFwPEssIFY+KTogYm9vbGVhbiB7XG4gIGlmIChhLnNpemUgIT09IGIuc2l6ZSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIFRPRE86IHVzZSBNYXAucHJvdG90eXBlLmVudHJpZXMgb25jZSB3ZSdyZSBvZmYgSUUxMS5cbiAgZm9yIChjb25zdCBhS2V5IG9mIEFycmF5LmZyb20oYS5rZXlzKCkpKSB7XG4gICAgaWYgKGIuZ2V0KGFLZXkpICE9PSBhLmdldChhS2V5KSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufVxuIl19