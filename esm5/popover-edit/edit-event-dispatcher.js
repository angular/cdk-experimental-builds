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
import { audit, auditTime, debounceTime, distinctUntilChanged, filter, map, share, skip, startWith, } from 'rxjs/operators';
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
        this._distinctShare = pipe(this._distinctUntilChanged, share());
        this._startWithNullDistinct = pipe(this._startWithNull, this._distinctUntilChanged);
        this.editingAndEnabled = this.editing.pipe(filter(function (cell) { return cell == null || !_this.disabledCells.has(cell); }), share());
        /** An observable that emits the row containing focus or an active edit. */
        this.editingOrFocused = combineLatest([
            this.editingAndEnabled.pipe(map(function (cell) { return closest(cell, ROW_SELECTOR); }), this._startWithNull),
            this.focused.pipe(this._startWithNull),
        ]).pipe(map(function (_a) {
            var _b = __read(_a, 2), editingRow = _b[0], focusedRow = _b[1];
            return focusedRow || editingRow;
        }), this._distinctUntilChanged, auditTime(FOCUS_DELAY), // Use audit to skip over blur events to the next focused element.
        this._distinctUntilChanged, share());
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
        // Optimization: Enter the zone before share() so that we trigger a single
        // ApplicationRef.tick for all row updates.
        this._enterZone(), share());
        this._editingAndEnabledDistinct = this.editingAndEnabled.pipe(distinctUntilChanged(), this._enterZone(), share());
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdC1ldmVudC1kaXNwYXRjaGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvcG9wb3Zlci1lZGl0L2VkaXQtZXZlbnQtZGlzcGF0Y2hlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7O0FBRUgsT0FBTyxFQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDakQsT0FBTyxFQUFDLGFBQWEsRUFBNEIsVUFBVSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDeEYsT0FBTyxFQUNMLEtBQUssRUFDTCxTQUFTLEVBQ1QsWUFBWSxFQUNaLG9CQUFvQixFQUNwQixNQUFNLEVBQ04sR0FBRyxFQUNILEtBQUssRUFDTCxJQUFJLEVBQ0osU0FBUyxHQUNWLE1BQU0sZ0JBQWdCLENBQUM7QUFFeEIsT0FBTyxFQUFDLGFBQWEsRUFBRSxZQUFZLEVBQUMsTUFBTSxhQUFhLENBQUM7QUFDeEQsT0FBTyxFQUFDLE9BQU8sRUFBQyxNQUFNLFlBQVksQ0FBQztBQUduQyxnRkFBZ0Y7QUFDaEYsSUFBTSxvQkFBb0IsR0FBRyxFQUFFLENBQUM7QUFFaEMsb0RBQW9EO0FBQ3BELElBQU0sV0FBVyxHQUFHLENBQUMsQ0FBQztBQWN0Qjs7R0FFRztBQUNIO0lBd0dFLDZCQUE2QixPQUFlO1FBQTVDLGlCQUlDO1FBSjRCLFlBQU8sR0FBUCxPQUFPLENBQVE7UUF0RzVDLDhGQUE4RjtRQUNyRixZQUFPLEdBQUcsSUFBSSxPQUFPLEVBQWdCLENBQUM7UUFFL0MscUVBQXFFO1FBQzVELGFBQVEsR0FBRyxJQUFJLE9BQU8sRUFBZ0IsQ0FBQztRQUVoRCx5RUFBeUU7UUFDaEUsWUFBTyxHQUFHLElBQUksT0FBTyxFQUFnQixDQUFDO1FBRS9DLGdGQUFnRjtRQUN2RSxZQUFPLEdBQUcsSUFBSSxPQUFPLEVB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Q3pDLEtBQW9CLElBQUEsS0FBQSxTQUFBLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxDQUFBLGdCQUFBLDRCQUFFO1lBQXRDLElBQU0sS0FBSyxXQUFBO1lBQ2QsSUFBSSxLQUFLLEVBQUU7Z0JBQ1QsaUJBQWlCLENBQUMsR0FBRyxDQUFDLEtBQUssYUFBdUIsQ0FBQzthQUNwRDtTQUNGOzs7Ozs7Ozs7SUFFRCxPQUFPLGlCQUFpQixDQUFDO0FBQzNCLENBQUM7QUFFRCxTQUFTLGtCQUFrQixDQUFPLENBQVksRUFBRSxDQUFZOztJQUMxRCxJQUFJLENBQUMsQ0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDLElBQUksRUFBRTtRQUNyQixPQUFPLEtBQUssQ0FBQztLQUNkOztRQUVELHVEQUF1RDtRQUN2RCxLQUFtQixJQUFBLEtBQUEsU0FBQSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFBLGdCQUFBLDRCQUFFO1lBQXBDLElBQU0sSUFBSSxXQUFBO1lBQ2IsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQy9CLE9BQU8sS0FBSyxDQUFDO2FBQ2Q7U0FDRjs7Ozs7Ozs7O0lBRUQsT0FBTyxJQUFJLENBQUM7QUFDZCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SW5qZWN0YWJsZSwgTmdab25lfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7Y29tYmluZUxhdGVzdCwgTW9ub1R5cGVPcGVyYXRvckZ1bmN0aW9uLCBPYnNlcnZhYmxlLCBwaXBlLCBTdWJqZWN0fSBmcm9tICdyeGpzJztcbmltcG9ydCB7XG4gIGF1ZGl0LFxuICBhdWRpdFRpbWUsXG4gIGRlYm91bmNlVGltZSxcbiAgZGlzdGluY3RVbnRpbENoYW5nZWQsXG4gIGZpbHRlcixcbiAgbWFwLFxuICBzaGFyZSxcbiAgc2tpcCxcbiAgc3RhcnRXaXRoLFxufSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbmltcG9ydCB7Q0VMTF9TRUxFQ1RPUiwgUk9XX1NFTEVDVE9SfSBmcm9tICcuL2NvbnN0YW50cyc7XG5pbXBvcnQge2Nsb3Nlc3R9IGZyb20gJy4vcG9seWZpbGwnO1xuaW1wb3J0IHtFZGl0UmVmfSBmcm9tICcuL2VkaXQtcmVmJztcblxuLyoqIFRoZSBkZWxheSBhcHBsaWVkIHRvIG1vdXNlIGV2ZW50cyBiZWZvcmUgaGlkaW5nIG9yIHNob3dpbmcgaG92ZXIgY29udGVudC4gKi9cbmNvbnN0IE1PVVNFX0VWRU5UX0RFTEFZX01TID0gNDA7XG5cbi8qKiBUaGUgZGVsYXkgZm9yIHJlYWN0aW5nIHRvIGZvY3VzL2JsdXIgY2hhbmdlcy4gKi9cbmNvbnN0IEZPQ1VTX0RFTEFZID0gMDtcblxuLyoqXG4gKiBUaGUgcG9zc2libGUgc3RhdGVzIGZvciBob3ZlciBjb250ZW50OlxuICogT0ZGIC0gTm90IHJlbmRlcmVkLlxuICogRk9DVVNBQkxFIC0gUmVuZGVyZWQgaW4gdGhlIGRvbSBhbmQgc3R5bHllZCBmb3IgaXRzIGNvbnRlbnRzIHRvIGJlIGZvY3VzYWJsZSBidXQgaW52aXNpYmxlLlxuICogT04gLSBSZW5kZXJlZCBhbmQgZnVsbHkgdmlzaWJsZS5cbiAqL1xuZXhwb3J0IGNvbnN0IGVudW0gSG92ZXJDb250ZW50U3RhdGUge1xuICBPRkYgPSAwLFxuICBGT0NVU0FCTEUsXG4gIE9OLFxufVxuXG4vKipcbiAqIFNlcnZpY2UgZm9yIHNoYXJpbmcgZGVsZWdhdGVkIGV2ZW50cyBhbmQgc3RhdGUgZm9yIHRyaWdnZXJpbmcgdGFibGUgZWRpdHMuXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBFZGl0RXZlbnREaXNwYXRjaGVyIHtcbiAgLyoqIEEgc3ViamVjdCB0aGF0IGluZGljYXRlcyB3aGljaCB0YWJsZSBjZWxsIGlzIGN1cnJlbnRseSBlZGl0aW5nICh1bmxlc3MgaXQgaXMgZGlzYWJsZWQpLiAqL1xuICByZWFkb25seSBlZGl0aW5nID0gbmV3IFN1YmplY3Q8RWxlbWVudHxudWxsPigpO1xuXG4gIC8qKiBBIHN1YmplY3QgdGhhdCBpbmRpY2F0ZXMgd2hpY2ggdGFibGUgcm93IGlzIGN1cnJlbnRseSBob3ZlcmVkLiAqL1xuICByZWFkb25seSBob3ZlcmluZyA9IG5ldyBTdWJqZWN0PEVsZW1lbnR8bnVsbD4oKTtcblxuICAvKiogQSBzdWJqZWN0IHRoYXQgaW5kaWNhdGVzIHdoaWNoIHRhYmxlIHJvdyBjdXJyZW50bHkgY29udGFpbnMgZm9jdXMuICovXG4gIHJlYWRvbmx5IGZvY3VzZWQgPSBuZXcgU3ViamVjdDxFbGVtZW50fG51bGw+KCk7XG5cbiAgLyoqIEEgc3ViamVjdCB0aGF0IGluZGljYXRlcyBhbGwgZWxlbWVudHMgaW4gdGhlIHRhYmxlIG1hdGNoaW5nIFJPV19TRUxFQ1RPUi4gKi9cbiAgcmVhZG9ubHkgYWxsUm93cyA9IG5ldyBTdWJqZWN0PE5vZGVMaXN0PigpO1xuXG4gIC8qKiBBIHN1YmplY3QgdGhhdCBlbWl0cyBtb3VzZSBtb3ZlIGV2ZW50cyBmcm9tIHRoZSB0YWJsZSBpbmRpY2F0aW5nIHRoZSB0YXJnZXRlZCByb3cuICovXG4gIHJlYWRvbmx5IG1vdXNlTW92ZSA9IG5ldyBTdWJqZWN0PEVsZW1lbnR8bnVsbD4oKTtcblxuICAvLyBUT0RPOiBVc2UgV2Vha1NldCBvbmNlIElFMTEgc3VwcG9ydCBpcyBkcm9wcGVkLlxuICAvKipcbiAgICogVHJhY2tzIHRoZSBjdXJyZW50bHkgZGlzYWJsZWQgZWRpdGFibGUgY2VsbHMgLSBlZGl0IGNhbGxzIHdpbGwgYmUgaWdub3JlZFxuICAgKiBmb3IgdGhlc2UgY2VsbHMuXG4gICAqL1xuICByZWFkb25seSBkaXNhYmxlZENlbGxzID0gbmV3IFdlYWtNYXA8RWxlbWVudCwgYm9vbGVhbj4oKTtcblxuICAvKiogVGhlIEVkaXRSZWYgZm9yIHRoZSBjdXJyZW50bHkgYWN0aXZlIGVkaXQgbGVucyAoaWYgYW55KS4gKi9cbiAgZ2V0IGVkaXRSZWYoKTogRWRpdFJlZjxhbnk+fG51bGwge1xuICAgIHJldHVybiB0aGlzLl9lZGl0UmVmO1xuICB9XG4gIHByaXZhdGUgX2VkaXRSZWY6IEVkaXRSZWY8YW55PnxudWxsID0gbnVsbDtcblxuICAvLyBPcHRpbWl6YXRpb246IFByZWNvbXB1dGUgY29tbW9uIHBpcGVhYmxlIG9wZXJhdG9ycyB1c2VkIHBlciByb3cvY2VsbC5cbiAgcHJpdmF0ZSByZWFkb25seSBfZGlzdGluY3RVbnRpbENoYW5nZWQgPVxuICAgICAgZGlzdGluY3RVbnRpbENoYW5nZWQ8RWxlbWVudHxIb3ZlckNvbnRlbnRTdGF0ZXxib29sZWFufG51bGw+KCk7XG4gIHByaXZhdGUgcmVhZG9ubHkgX3N0YXJ0V2l0aE51bGwgPSBzdGFydFdpdGg8RWxlbWVudHxudWxsPihudWxsKTtcbiAgcHJpdmF0ZSByZWFkb25seSBfZGlzdGluY3RTaGFyZSA9IHBpcGUoXG4gICAgdGhpcy5fZGlzdGluY3RVbnRpbENoYW5nZWQgYXMgTW9ub1R5cGVPcGVyYXRvckZ1bmN0aW9uPEhvdmVyQ29udGVudFN0YXRlPixcbiAgICBzaGFyZSgpLFxuICApO1xuICBwcml2YXRlIHJlYWRvbmx5IF9zdGFydFdpdGhOdWxsRGlzdGluY3QgPSBwaXBlKFxuICAgIHRoaXMuX3N0YXJ0V2l0aE51bGwsXG4gICAgdGhpcy5fZGlzdGluY3RVbnRpbENoYW5nZWQgYXMgTW9ub1R5cGVPcGVyYXRvckZ1bmN0aW9uPEVsZW1lbnR8bnVsbD4sXG4gICk7XG5cbiAgcmVhZG9ubHkgZWRpdGluZ0FuZEVuYWJsZWQgPSB0aGlzLmVkaXRpbmcucGlwZShcbiAgICAgIGZpbHRlcihjZWxsID0+IGNlbGwgPT0gbnVsbCB8fCAhdGhpcy5kaXNhYmxlZENlbGxzLmhhcyhjZWxsKSksXG4gICAgICBzaGFyZSgpLFxuICApO1xuXG4gIC8qKiBBbiBvYnNlcnZhYmxlIHRoYXQgZW1pdHMgdGhlIHJvdyBjb250YWluaW5nIGZvY3VzIG9yIGFuIGFjdGl2ZSBlZGl0LiAqL1xuICByZWFkb25seSBlZGl0aW5nT3JGb2N1c2VkID0gY29tYmluZUxhdGVzdChbXG4gICAgICB0aGlzLmVkaXRpbmdBbmRFbmFibGVkLnBpcGUoXG4gICAgICAgICAgbWFwKGNlbGwgPT4gY2xvc2VzdChjZWxsLCBST1dfU0VMRUNUT1IpKSxcbiAgICAgICAgICB0aGlzLl9zdGFydFdpdGhOdWxsLFxuICAgICAgKSxcbiAgICAgIHRoaXMuZm9jdXNlZC5waXBlKHRoaXMuX3N0YXJ0V2l0aE51bGwpLFxuICBdKS5waXBlKFxuICAgICAgbWFwKChbZWRpdGluZ1JvdywgZm9jdXNlZFJvd10pID0+IGZvY3VzZWRSb3cgfHwgZWRpdGluZ1JvdyksXG4gICAgICB0aGlzLl9kaXN0aW5jdFVudGlsQ2hhbmdlZCBhcyBNb25vVHlwZU9wZXJhdG9yRnVuY3Rpb248RWxlbWVudHxudWxsPixcbiAgICAgIGF1ZGl0VGltZShGT0NVU19ERUxBWSksIC8vIFVzZSBhdWRpdCB0byBza2lwIG92ZXIgYmx1ciBldmVudHMgdG8gdGhlIG5leHQgZm9jdXNlZCBlbGVtZW50LlxuICAgICAgdGhpcy5fZGlzdGluY3RVbnRpbENoYW5nZWQgYXMgTW9ub1R5cGVPcGVyYXRvckZ1bmN0aW9uPEVsZW1lbnR8bnVsbD4sXG4gICAgICBzaGFyZSgpLFxuICApO1xuXG4gIC8qKiBUcmFja3Mgcm93cyB0aGF0IGNvbnRhaW4gaG92ZXIgY29udGVudCB3aXRoIGEgcmVmZXJlbmNlIGNvdW50LiAqL1xuICBwcml2YXRlIF9yb3dzV2l0aEhvdmVyQ29udGVudCA9IG5ldyBXZWFrTWFwPEVsZW1lbnQsIG51bWJlcj4oKTtcblxuICAvKiogVGhlIHRhYmxlIGNlbGwgdGhhdCBoYXMgYW4gYWN0aXZlIGVkaXQgbGVucyAob3IgbnVsbCkuICovXG4gIHByaXZhdGUgX2N1cnJlbnRseUVkaXRpbmc6IEVsZW1lbnR8bnVsbCA9IG51bGw7XG5cbiAgLyoqIFRoZSBjb21iaW5lZCBzZXQgb2Ygcm93IGhvdmVyIGNvbnRlbnQgc3RhdGVzIG9yZ2FuaXplZCBieSByb3cuICovXG4gIHByaXZhdGUgcmVhZG9ubHkgX2hvdmVyZWRDb250ZW50U3RhdGVEaXN0aW5jdCA9IGNvbWJpbmVMYXRlc3QoW1xuICAgICAgdGhpcy5fZ2V0Rmlyc3RSb3dXaXRoSG92ZXJDb250ZW50KCksXG4gICAgICB0aGlzLl9nZXRMYXN0Um93V2l0aEhvdmVyQ29udGVudCgpLFxuICAgICAgdGhpcy5lZGl0aW5nT3JGb2N1c2VkLFxuICAgICAgdGhpcy5ob3ZlcmluZy5waXBlKFxuICAgICAgICAgIGRpc3RpbmN0VW50aWxDaGFuZ2VkKCksXG4gICAgICAgICAgYXVkaXQocm93ID0+IHRoaXMubW91c2VNb3ZlLnBpcGUoXG4gICAgICAgICAgICAgIGZpbHRlcihtb3VzZU1vdmVSb3cgPT4gcm93ID09PSBtb3VzZU1vdmVSb3cpLFxuICAgICAgICAgICAgICB0aGlzLl9zdGFydFdpdGhOdWxsLFxuICAgICAgICAgICAgICBkZWJvdW5jZVRpbWUoTU9VU0VfRVZFTlRfREVMQVlfTVMpKSxcbiAgICAgICAgICApLFxuICAgICAgICAgIHRoaXMuX3N0YXJ0V2l0aE51bGxEaXN0aW5jdCxcbiAgICAgICksXG4gIF0pLnBpcGUoXG4gICAgICBza2lwKDEpLCAvLyBTa2lwIHRoZSBpbml0aWFsIGVtaXNzaW9uIG9mIFtudWxsLCBudWxsLCBudWxsLCBudWxsXS5cbiAgICAgIG1hcChjb21wdXRlSG92ZXJDb250ZW50U3RhdGUpLFxuICAgICAgZGlzdGluY3RVbnRpbENoYW5nZWQoYXJlTWFwRW50cmllc0VxdWFsKSxcbiAgICAgIC8vIE9wdGltaXphdGlvbjogRW50ZXIgdGhlIHpvbmUgYmVmb3JlIHNoYXJlKCkgc28gdGhhdCB3ZSB0cmlnZ2VyIGEgc2luZ2xlXG4gICAgICAvLyBBcHBsaWNhdGlvblJlZi50aWNrIGZvciBhbGwgcm93IHVwZGF0ZXMuXG4gICAgICB0aGlzLl9lbnRlclpvbmUoKSxcbiAgICAgIHNoYXJlKCksXG4gICk7XG5cbiAgcHJpdmF0ZSByZWFkb25seSBfZWRpdGluZ0FuZEVuYWJsZWREaXN0aW5jdCA9IHRoaXMuZWRpdGluZ0FuZEVuYWJsZWQucGlwZShcbiAgICAgIGRpc3RpbmN0VW50aWxDaGFuZ2VkKCksXG4gICAgICB0aGlzLl9lbnRlclpvbmUoKSxcbiAgICAgIHNoYXJlKCksXG4gICk7XG5cbiAgLy8gT3B0aW1pemF0aW9uOiBTaGFyZSByb3cgZXZlbnRzIG9ic2VydmFibGUgd2l0aCBzdWJzZXF1ZW50IGNhbGxlcnMuXG4gIC8vIEF0IHN0YXJ0dXAsIGNhbGxzIHdpbGwgYmUgc2VxdWVudGlhbCBieSByb3cuXG4gIHByaXZhdGUgX2xhc3RTZWVuUm93OiBFbGVtZW50fG51bGwgPSBudWxsO1xuICBwcml2YXRlIF9sYXN0U2VlblJvd0hvdmVyT3JGb2N1czogT2JzZXJ2YWJsZTxIb3ZlckNvbnRlbnRTdGF0ZT58bnVsbCA9IG51bGw7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSByZWFkb25seSBfbmdab25lOiBOZ1pvbmUpIHtcbiAgICB0aGlzLl9lZGl0aW5nQW5kRW5hYmxlZERpc3RpbmN0LnN1YnNjcmliZShjZWxsID0+IHtcbiAgICAgIHRoaXMuX2N1cnJlbnRseUVkaXRpbmcgPSBjZWxsO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgYW4gT2JzZXJ2YWJsZSB0aGF0IGVtaXRzIHRydWUgd2hlbiB0aGUgc3BlY2lmaWVkIGVsZW1lbnQncyBjZWxsXG4gICAqIGlzIGVkaXRpbmcgYW5kIGZhbHNlIHdoZW4gbm90LlxuICAgKi9cbiAgZWRpdGluZ0NlbGwoZWxlbWVudDogRWxlbWVudHxFdmVudFRhcmdldCk6IE9ic2VydmFibGU8Ym9vbGVhbj4ge1xuICAgIGxldCBjZWxsOiBFbGVtZW50fG51bGwgPSBudWxsO1xuXG4gICAgcmV0dXJuIHRoaXMuX2VkaXRpbmdBbmRFbmFibGVkRGlzdGluY3QucGlwZShcbiAgICAgICAgbWFwKGVkaXRDZWxsID0+IGVkaXRDZWxsID09PSAoY2VsbCB8fCAoY2VsbCA9IGNsb3Nlc3QoZWxlbWVudCwgQ0VMTF9TRUxFQ1RPUikpKSksXG4gICAgICAgIHRoaXMuX2Rpc3RpbmN0VW50aWxDaGFuZ2VkIGFzIE1vbm9UeXBlT3BlcmF0b3JGdW5jdGlvbjxib29sZWFuPixcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0b3BzIGVkaXRpbmcgZm9yIHRoZSBzcGVjaWZpZWQgY2VsbC4gSWYgdGhlIHNwZWNpZmllZCBjZWxsIGlzIG5vdCB0aGUgY3VycmVudFxuICAgKiBlZGl0IGNlbGwsIGRvZXMgbm90aGluZy5cbiAgICovXG4gIGRvbmVFZGl0aW5nQ2VsbChlbGVtZW50OiBFbGVtZW50fEV2ZW50VGFyZ2V0KTogdm9pZCB7XG4gICAgY29uc3QgY2VsbCA9IGNsb3Nlc3QoZWxlbWVudCwgQ0VMTF9TRUxFQ1RPUik7XG5cbiAgICBpZiAodGhpcy5fY3VycmVudGx5RWRpdGluZyA9PT0gY2VsbCkge1xuICAgICAgdGhpcy5lZGl0aW5nLm5leHQobnVsbCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFNldHMgdGhlIGN1cnJlbnRseSBhY3RpdmUgRWRpdFJlZi4gKi9cbiAgc2V0QWN0aXZlRWRpdFJlZihyZWY6IEVkaXRSZWY8YW55Pikge1xuICAgIHRoaXMuX2VkaXRSZWYgPSByZWY7XG4gIH1cblxuICAvKiogVW5zZXRzIHRoZSBjdXJyZW50bHkgYWN0aXZlIEVkaXRSZWYsIGlmIHRoZSBzcGVjaWZpZWQgZWRpdFJlZiBpcyBhY3RpdmUuICovXG4gIHVuc2V0QWN0aXZlRWRpdFJlZihyZWY6IEVkaXRSZWY8YW55Pikge1xuICAgIGlmICh0aGlzLl9lZGl0UmVmICE9PSByZWYpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl9lZGl0UmVmID0gbnVsbDtcbiAgfVxuXG4gIC8qKiBBZGRzIHRoZSBzcGVjaWZpZWQgdGFibGUgcm93IHRvIGJlIHRyYWNrZWQgZm9yIGZpcnN0L2xhc3Qgcm93IGNvbXBhcmlzb25zLiAqL1xuICByZWdpc3RlclJvd1dpdGhIb3ZlckNvbnRlbnQocm93OiBFbGVtZW50KTogdm9pZCB7XG4gICAgdGhpcy5fcm93c1dpdGhIb3ZlckNvbnRlbnQuc2V0KHJvdywgKHRoaXMuX3Jvd3NXaXRoSG92ZXJDb250ZW50LmdldChyb3cpIHx8IDApICsgMSk7XG4gIH1cblxuICAvKipcbiAgICogUmVmZXJlbmNlIGRlY3JlbWVudHMgYW5kIHVsdGltYXRlbHkgcmVtb3ZlcyB0aGUgc3BlY2lmaWVkIHRhYmxlIHJvdyBmcm9tIGZpcnN0L2xhc3Qgcm93XG4gICAqIGNvbXBhcmlzb25zLlxuICAgKi9cbiAgZGVyZWdpc3RlclJvd1dpdGhIb3ZlckNvbnRlbnQocm93OiBFbGVtZW50KTogdm9pZCB7XG4gICAgY29uc3QgcmVmQ291bnQgPSB0aGlzLl9yb3dzV2l0aEhvdmVyQ29udGVudC5nZXQocm93KSB8fCAwO1xuXG4gICAgaWYgKHJlZkNvdW50IDw9IDEpIHtcbiAgICAgIHRoaXMuX3Jvd3NXaXRoSG92ZXJDb250ZW50LmRlbGV0ZShyb3cpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9yb3dzV2l0aEhvdmVyQ29udGVudC5zZXQocm93LCByZWZDb3VudCAtIDEpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIGFuIE9ic2VydmFibGUgdGhhdCBlbWl0cyB0cnVlIHdoZW4gdGhlIHNwZWNpZmllZCBlbGVtZW50J3Mgcm93XG4gICAqIGNvbnRhaW5zIHRoZSBmb2N1c2VkIGVsZW1lbnQgb3IgaXMgYmVpbmcgaG92ZXJlZCBvdmVyIGFuZCBmYWxzZSB3aGVuIG5vdC5cbiAgICogSG92ZXJpbmcgaXMgZGVmaW5lZCBhcyB3aGVuIHRoZSBtb3VzZSBoYXMgbW9tZW50YXJpbHkgc3RvcHBlZCBtb3Zpbmcgb3ZlciB0aGUgY2VsbC5cbiAgICovXG4gIGhvdmVyT3JGb2N1c09uUm93KHJvdzogRWxlbWVudCk6IE9ic2VydmFibGU8SG92ZXJDb250ZW50U3RhdGU+IHtcbiAgICBpZiAocm93ICE9PSB0aGlzLl9sYXN0U2VlblJvdykge1xuICAgICAgdGhpcy5fbGFzdFNlZW5Sb3cgPSByb3c7XG4gICAgICB0aGlzLl9sYXN0U2VlblJvd0hvdmVyT3JGb2N1cyA9IHRoaXMuX2hvdmVyZWRDb250ZW50U3RhdGVEaXN0aW5jdC5waXBlKFxuICAgICAgICBtYXAoc3RhdGUgPT4gc3RhdGUuZ2V0KHJvdykgfHwgSG92ZXJDb250ZW50U3RhdGUuT0ZGKSxcbiAgICAgICAgdGhpcy5fZGlzdGluY3RTaGFyZSxcbiAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX2xhc3RTZWVuUm93SG92ZXJPckZvY3VzITtcbiAgfVxuXG4gIC8qKlxuICAgKiBSeEpTIG9wZXJhdG9yIHRoYXQgZW50ZXJzIHRoZSBBbmd1bGFyIHpvbmUsIHVzZWQgdG8gcmVkdWNlIGJvaWxlcnBsYXRlIGluXG4gICAqIHJlLWVudGVyaW5nIHRoZSB6b25lIGZvciBzdHJlYW0gcGlwZWxpbmVzLlxuICAgKi9cbiAgcHJpdmF0ZSBfZW50ZXJab25lPFQ+KCk6IE1vbm9UeXBlT3BlcmF0b3JGdW5jdGlvbjxUPiB7XG4gICAgcmV0dXJuIChzb3VyY2U6IE9ic2VydmFibGU8VD4pID0+XG4gICAgICAgIG5ldyBPYnNlcnZhYmxlPFQ+KChvYnNlcnZlcikgPT4gc291cmNlLnN1YnNjcmliZSh7XG4gICAgICAgICAgICAgbmV4dDogKHZhbHVlKSA9PiB0aGlzLl9uZ1pvbmUucnVuKCgpID0+IG9ic2VydmVyLm5leHQodmFsdWUpKSxcbiAgICAgICAgICAgICBlcnJvcjogKGVycikgPT4gb2JzZXJ2ZXIuZXJyb3IoZXJyKSxcbiAgICAgICAgICAgICBjb21wbGV0ZTogKCkgPT4gb2JzZXJ2ZXIuY29tcGxldGUoKVxuICAgICAgICAgICB9KSk7XG4gIH1cblxuICBwcml2YXRlIF9nZXRGaXJzdFJvd1dpdGhIb3ZlckNvbnRlbnQoKTogT2JzZXJ2YWJsZTxFbGVtZW50fG51bGw+IHtcbiAgICByZXR1cm4gdGhpcy5fbWFwQWxsUm93c1RvU2luZ2xlUm93KHJvd3MgPT4ge1xuICAgICAgZm9yIChsZXQgaSA9IDAsIHJvdzsgcm93ID0gcm93c1tpXTsgaSsrKSB7XG4gICAgICAgIGlmICh0aGlzLl9yb3dzV2l0aEhvdmVyQ29udGVudC5oYXMocm93IGFzIEVsZW1lbnQpKSB7XG4gICAgICAgICAgcmV0dXJuIHJvdyBhcyBFbGVtZW50O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX2dldExhc3RSb3dXaXRoSG92ZXJDb250ZW50KCk6IE9ic2VydmFibGU8RWxlbWVudHxudWxsPiB7XG4gICAgcmV0dXJuIHRoaXMuX21hcEFsbFJvd3NUb1NpbmdsZVJvdyhyb3dzID0+IHtcbiAgICAgIGZvciAobGV0IGkgPSByb3dzLmxlbmd0aCAtIDEsIHJvdzsgcm93ID0gcm93c1tpXTsgaS0tKSB7XG4gICAgICAgIGlmICh0aGlzLl9yb3dzV2l0aEhvdmVyQ29udGVudC5oYXMocm93IGFzIEVsZW1lbnQpKSB7XG4gICAgICAgICAgcmV0dXJuIHJvdyBhcyBFbGVtZW50O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX21hcEFsbFJvd3NUb1NpbmdsZVJvdyhtYXBwZXI6IChyb3dzOiBOb2RlTGlzdCkgPT4gRWxlbWVudHxudWxsKTpcbiAgICAgIE9ic2VydmFibGU8RWxlbWVudHxudWxsPiB7XG4gICAgcmV0dXJuIHRoaXMuYWxsUm93cy5waXBlKFxuICAgICAgICBtYXAobWFwcGVyKSxcbiAgICAgICAgdGhpcy5fc3RhcnRXaXRoTnVsbERpc3RpbmN0LFxuICAgICk7XG4gIH1cbn1cblxuZnVuY3Rpb24gY29tcHV0ZUhvdmVyQ29udGVudFN0YXRlKFtmaXJzdFJvdywgbGFzdFJvdywgYWN0aXZlUm93LCBob3ZlclJvd106IEFycmF5PEVsZW1lbnR8bnVsbD4pOlxuICAgICBNYXA8RWxlbWVudCwgSG92ZXJDb250ZW50U3RhdGU+IHtcbiAgY29uc3QgaG92ZXJDb250ZW50U3RhdGUgPSBuZXcgTWFwPEVsZW1lbnQsIEhvdmVyQ29udGVudFN0YXRlPigpO1xuXG4gIC8vIEFkZCBmb2N1c2FibGUgcm93cy5cbiAgZm9yIChjb25zdCBmb2N1c3NhYmxlUm93IG9mIFtcbiAgICBmaXJzdFJvdyxcbiAgICBsYXN0Um93LFxuICAgIGFjdGl2ZVJvdyAmJiBhY3RpdmVSb3cucHJldmlvdXNFbGVtZW50U2libGluZyxcbiAgICBhY3RpdmVSb3cgJiYgYWN0aXZlUm93Lm5leHRFbGVtZW50U2libGluZyxcbiAgXSkge1xuICAgIGlmIChmb2N1c3NhYmxlUm93KSB7XG4gICAgICBob3ZlckNvbnRlbnRTdGF0ZS5zZXQoZm9jdXNzYWJsZVJvdyBhcyBFbGVtZW50LCBIb3ZlckNvbnRlbnRTdGF0ZS5GT0NVU0FCTEUpO1xuICAgIH1cbiAgfVxuXG4gIC8vIEFkZC9vdmVyd3JpdGUgd2l0aCBmdWxseSB2aXNpYmxlIHJvd3MuXG4gIGZvciAoY29uc3Qgb25Sb3cgb2YgW2FjdGl2ZVJvdywgaG92ZXJSb3ddKSB7XG4gICAgaWYgKG9uUm93KSB7XG4gICAgICBob3ZlckNvbnRlbnRTdGF0ZS5zZXQob25Sb3csIEhvdmVyQ29udGVudFN0YXRlLk9OKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gaG92ZXJDb250ZW50U3RhdGU7XG59XG5cbmZ1bmN0aW9uIGFyZU1hcEVudHJpZXNFcXVhbDxLLCBWPihhOiBNYXA8SywgVj4sIGI6IE1hcDxLLCBWPik6IGJvb2xlYW4ge1xuICBpZiAoYS5zaXplICE9PSBiLnNpemUpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBUT0RPOiB1c2UgTWFwLnByb3RvdHlwZS5lbnRyaWVzIG9uY2Ugd2UncmUgb2ZmIElFMTEuXG4gIGZvciAoY29uc3QgYUtleSBvZiBBcnJheS5mcm9tKGEua2V5cygpKSkge1xuICAgIGlmIChiLmdldChhS2V5KSAhPT0gYS5nZXQoYUtleSkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn1cbiJdfQ==