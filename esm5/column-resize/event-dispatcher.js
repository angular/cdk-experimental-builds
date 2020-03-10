/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __read } from "tslib";
import { Injectable, NgZone } from '@angular/core';
import { combineLatest, Observable, Subject } from 'rxjs';
import { distinctUntilChanged, map, share, skip, startWith } from 'rxjs/operators';
import { _closest } from '@angular/cdk-experimental/popover-edit';
import { HEADER_ROW_SELECTOR } from './selectors';
/** Coordinates events between the column resize directives. */
var HeaderRowEventDispatcher = /** @class */ (function () {
    function HeaderRowEventDispatcher(_ngZone) {
        this._ngZone = _ngZone;
        /**
         * Emits the currently hovered header cell or null when no header cells are hovered.
         * Exposed publicly for events to feed in, but subscribers should use headerCellHoveredDistinct,
         * defined below.
         */
        this.headerCellHovered = new Subject();
        /**
         * Emits the header cell for which a user-triggered resize is active or null
         * when no resize is in progress.
         */
        this.overlayHandleActiveForCell = new Subject();
        /** Distinct and shared version of headerCellHovered. */
        this.headerCellHoveredDistinct = this.headerCellHovered.pipe(distinctUntilChanged(), share());
        /**
         * Emits the header that is currently hovered or hosting an active resize event (with active
         * taking precedence).
         */
        this.headerRowHoveredOrActiveDistinct = combineLatest(this.headerCellHoveredDistinct.pipe(map(function (cell) { return _closest(cell, HEADER_ROW_SELECTOR); }), startWith(null), distinctUntilChanged()), this.overlayHandleActiveForCell.pipe(map(function (cell) { return _closest(cell, HEADER_ROW_SELECTOR); }), startWith(null), distinctUntilChanged())).pipe(skip(1), // Ignore initial [null, null] emission.
        map(function (_a) {
            var _b = __read(_a, 2), hovered = _b[0], active = _b[1];
            return active || hovered;
        }), distinctUntilChanged(), share());
        this._headerRowHoveredOrActiveDistinctReenterZone = this.headerRowHoveredOrActiveDistinct.pipe(this._enterZone(), share());
        // Optimization: Share row events observable with subsequent callers.
        // At startup, calls will be sequential by row (and typically there's only one).
        this._lastSeenRow = null;
        this._lastSeenRowHover = null;
    }
    /**
     * Emits whether the specified row should show its overlay controls.
     * Emission occurs within the NgZone.
     */
    HeaderRowEventDispatcher.prototype.resizeOverlayVisibleForHeaderRow = function (row) {
        if (row !== this._lastSeenRow) {
            this._lastSeenRow = row;
            this._lastSeenRowHover = this._headerRowHoveredOrActiveDistinctReenterZone.pipe(map(function (hoveredRow) { return hoveredRow === row; }), distinctUntilChanged(), share());
        }
        return this._lastSeenRowHover;
    };
    HeaderRowEventDispatcher.prototype._enterZone = function () {
        var _this = this;
        return function (source) {
            return new Observable(function (observer) { return source.subscribe({
                next: function (value) { return _this._ngZone.run(function () { return observer.next(value); }); },
                error: function (err) { return observer.error(err); },
                complete: function () { return observer.complete(); }
            }); });
        };
    };
    HeaderRowEventDispatcher.decorators = [
        { type: Injectable }
    ];
    /** @nocollapse */
    HeaderRowEventDispatcher.ctorParameters = function () { return [
        { type: NgZone }
    ]; };
    return HeaderRowEventDispatcher;
}());
export { HeaderRowEventDispatcher };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnQtZGlzcGF0Y2hlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL2NvbHVtbi1yZXNpemUvZXZlbnQtZGlzcGF0Y2hlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7O0FBRUgsT0FBTyxFQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDakQsT0FBTyxFQUFDLGFBQWEsRUFBNEIsVUFBVSxFQUFFLE9BQU8sRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUNsRixPQUFPLEVBQUMsb0JBQW9CLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFFakYsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLHdDQUF3QyxDQUFDO0FBRWhFLE9BQU8sRUFBQyxtQkFBbUIsRUFBQyxNQUFNLGFBQWEsQ0FBQztBQUVoRCwrREFBK0Q7QUFDL0Q7SUFlRSxrQ0FBNkIsT0FBZTtRQUFmLFlBQU8sR0FBUCxPQUFPLENBQVE7UUFiNUM7Ozs7V0FJRztRQUNNLHNCQUFpQixHQUFHLElBQUksT0FBTyxFQUFnQixDQUFDO1FBRXpEOzs7V0FHRztRQUNNLCtCQUEwQixHQUFHLElBQUksT0FBTyxFQUFnQixDQUFDO1FBSWxFLHdEQUF3RDtRQUMvQyw4QkFBeUIsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUM1RCxvQkFBb0IsRUFBRSxFQUN0QixLQUFLLEVBQUUsQ0FDVixDQUFDO1FBRUY7OztXQUdHO1FBQ00scUNBQWdDLEdBQUcsYUFBYSxDQUNyRCxJQUFJLENBQUMseUJBQXlCLENBQUMsSUFBSSxDQUMvQixHQUFHLENBQUMsVUFBQSxJQUFJLElBQUksT0FBQSxRQUFRLENBQUMsSUFBSSxFQUFFLG1CQUFtQixDQUFDLEVBQW5DLENBQW1DLENBQUMsRUFDaEQsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUNmLG9CQUFvQixFQUFFLENBQ3hCLEVBQ0YsSUFBSSxDQUFDLDBCQUEwQixDQUFDLElBQUksQ0FDaEMsR0FBRyxDQUFDLFVBQUEsSUFBSSxJQUFJLE9BQUEsUUFBUSxDQUFDLElBQUksRUFBRSxtQkFBbUIsQ0FBQyxFQUFuQyxDQUFtQyxDQUFDLEVBQ2hELFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFDZixvQkFBb0IsRUFBRSxDQUN6QixDQUNKLENBQUMsSUFBSSxDQUNGLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSx3Q0FBd0M7UUFDakQsR0FBRyxDQUFDLFVBQUMsRUFBaUI7Z0JBQWpCLGtCQUFpQixFQUFoQixlQUFPLEVBQUUsY0FBTTtZQUFNLE9BQUEsTUFBTSxJQUFJLE9BQU87UUFBakIsQ0FBaUIsQ0FBQyxFQUM3QyxvQkFBb0IsRUFBRSxFQUN0QixLQUFLLEVBQUUsQ0FDVixDQUFDO1FBRWUsaURBQTRDLEdBQ3pELElBQUksQ0FBQyxnQ0FBZ0MsQ0FBQyxJQUFJLENBQ3RDLElBQUksQ0FBQyxVQUFVLEVBQUUsRUFDakIsS0FBSyxFQUFFLENBQ1YsQ0FBQztRQUVOLHFFQUFxRTtRQUNyRSxnRkFBZ0Y7UUFDeEUsaUJBQVksR0FBaUIsSUFBSSxDQUFDO1FBQ2xDLHNCQUFpQixHQUE2QixJQUFJLENBQUM7SUF2Q1osQ0FBQztJQXlDaEQ7OztPQUdHO0lBQ0gsbUVBQWdDLEdBQWhDLFVBQWlDLEdBQVk7UUFDM0MsSUFBSSxHQUFHLEtBQUssSUFBSSxDQUFDLFlBQVksRUFBRTtZQUM3QixJQUFJLENBQUMsWUFBWSxHQUFHLEdBQUcsQ0FBQztZQUN4QixJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDLDRDQUE0QyxDQUFDLElBQUksQ0FDN0UsR0FBRyxDQUFDLFVBQUEsVUFBVSxJQUFJLE9BQUEsVUFBVSxLQUFLLEdBQUcsRUFBbEIsQ0FBa0IsQ0FBQyxFQUNyQyxvQkFBb0IsRUFBRSxFQUN0QixLQUFLLEVBQUUsQ0FDUixDQUFDO1NBQ0g7UUFFRCxPQUFPLElBQUksQ0FBQyxpQkFBa0IsQ0FBQztJQUNqQyxDQUFDO0lBRU8sNkNBQVUsR0FBbEI7UUFBQSxpQkFPQztRQU5DLE9BQU8sVUFBQyxNQUFxQjtZQUN6QixPQUFBLElBQUksVUFBVSxDQUFJLFVBQUMsUUFBUSxJQUFLLE9BQUEsTUFBTSxDQUFDLFNBQVMsQ0FBQztnQkFDL0MsSUFBSSxFQUFFLFVBQUMsS0FBSyxJQUFLLE9BQUEsS0FBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBTSxPQUFBLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQXBCLENBQW9CLENBQUMsRUFBNUMsQ0FBNEM7Z0JBQzdELEtBQUssRUFBRSxVQUFDLEdBQUcsSUFBSyxPQUFBLFFBQVEsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQW5CLENBQW1CO2dCQUNuQyxRQUFRLEVBQUUsY0FBTSxPQUFBLFFBQVEsQ0FBQyxRQUFRLEVBQUUsRUFBbkIsQ0FBbUI7YUFDcEMsQ0FBQyxFQUo4QixDQUk5QixDQUFDO1FBSkgsQ0FJRyxDQUFDO0lBQ1YsQ0FBQzs7Z0JBaEZGLFVBQVU7Ozs7Z0JBVFMsTUFBTTs7SUEwRjFCLCtCQUFDO0NBQUEsQUFqRkQsSUFpRkM7U0FoRlksd0JBQXdCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SW5qZWN0YWJsZSwgTmdab25lfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7Y29tYmluZUxhdGVzdCwgTW9ub1R5cGVPcGVyYXRvckZ1bmN0aW9uLCBPYnNlcnZhYmxlLCBTdWJqZWN0fSBmcm9tICdyeGpzJztcbmltcG9ydCB7ZGlzdGluY3RVbnRpbENoYW5nZWQsIG1hcCwgc2hhcmUsIHNraXAsIHN0YXJ0V2l0aH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuXG5pbXBvcnQge19jbG9zZXN0fSBmcm9tICdAYW5ndWxhci9jZGstZXhwZXJpbWVudGFsL3BvcG92ZXItZWRpdCc7XG5cbmltcG9ydCB7SEVBREVSX1JPV19TRUxFQ1RPUn0gZnJvbSAnLi9zZWxlY3RvcnMnO1xuXG4vKiogQ29vcmRpbmF0ZXMgZXZlbnRzIGJldHdlZW4gdGhlIGNvbHVtbiByZXNpemUgZGlyZWN0aXZlcy4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBIZWFkZXJSb3dFdmVudERpc3BhdGNoZXIge1xuICAvKipcbiAgICogRW1pdHMgdGhlIGN1cnJlbnRseSBob3ZlcmVkIGhlYWRlciBjZWxsIG9yIG51bGwgd2hlbiBubyBoZWFkZXIgY2VsbHMgYXJlIGhvdmVyZWQuXG4gICAqIEV4cG9zZWQgcHVibGljbHkgZm9yIGV2ZW50cyB0byBmZWVkIGluLCBidXQgc3Vic2NyaWJlcnMgc2hvdWxkIHVzZSBoZWFkZXJDZWxsSG92ZXJlZERpc3RpbmN0LFxuICAgKiBkZWZpbmVkIGJlbG93LlxuICAgKi9cbiAgcmVhZG9ubHkgaGVhZGVyQ2VsbEhvdmVyZWQgPSBuZXcgU3ViamVjdDxFbGVtZW50fG51bGw+KCk7XG5cbiAgLyoqXG4gICAqIEVtaXRzIHRoZSBoZWFkZXIgY2VsbCBmb3Igd2hpY2ggYSB1c2VyLXRyaWdnZXJlZCByZXNpemUgaXMgYWN0aXZlIG9yIG51bGxcbiAgICogd2hlbiBubyByZXNpemUgaXMgaW4gcHJvZ3Jlc3MuXG4gICAqL1xuICByZWFkb25seSBvdmVybGF5SGFuZGxlQWN0aXZlRm9yQ2VsbCA9IG5ldyBTdWJqZWN0PEVsZW1lbnR8bnVsbD4oKTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHJlYWRvbmx5IF9uZ1pvbmU6IE5nWm9uZSkge31cblxuICAvKiogRGlzdGluY3QgYW5kIHNoYXJlZCB2ZXJzaW9uIG9mIGhlYWRlckNlbGxIb3ZlcmVkLiAqL1xuICByZWFkb25seSBoZWFkZXJDZWxsSG92ZXJlZERpc3RpbmN0ID0gdGhpcy5oZWFkZXJDZWxsSG92ZXJlZC5waXBlKFxuICAgICAgZGlzdGluY3RVbnRpbENoYW5nZWQoKSxcbiAgICAgIHNoYXJlKCksXG4gICk7XG5cbiAgLyoqXG4gICAqIEVtaXRzIHRoZSBoZWFkZXIgdGhhdCBpcyBjdXJyZW50bHkgaG92ZXJlZCBvciBob3N0aW5nIGFuIGFjdGl2ZSByZXNpemUgZXZlbnQgKHdpdGggYWN0aXZlXG4gICAqIHRha2luZyBwcmVjZWRlbmNlKS5cbiAgICovXG4gIHJlYWRvbmx5IGhlYWRlclJvd0hvdmVyZWRPckFjdGl2ZURpc3RpbmN0ID0gY29tYmluZUxhdGVzdChcbiAgICAgIHRoaXMuaGVhZGVyQ2VsbEhvdmVyZWREaXN0aW5jdC5waXBlKFxuICAgICAgICAgIG1hcChjZWxsID0+IF9jbG9zZXN0KGNlbGwsIEhFQURFUl9ST1dfU0VMRUNUT1IpKSxcbiAgICAgICAgICBzdGFydFdpdGgobnVsbCksXG4gICAgICAgICAgZGlzdGluY3RVbnRpbENoYW5nZWQoKSxcbiAgICAgICApLFxuICAgICAgdGhpcy5vdmVybGF5SGFuZGxlQWN0aXZlRm9yQ2VsbC5waXBlKFxuICAgICAgICAgIG1hcChjZWxsID0+IF9jbG9zZXN0KGNlbGwsIEhFQURFUl9ST1dfU0VMRUNUT1IpKSxcbiAgICAgICAgICBzdGFydFdpdGgobnVsbCksXG4gICAgICAgICAgZGlzdGluY3RVbnRpbENoYW5nZWQoKSxcbiAgICAgICksXG4gICkucGlwZShcbiAgICAgIHNraXAoMSksIC8vIElnbm9yZSBpbml0aWFsIFtudWxsLCBudWxsXSBlbWlzc2lvbi5cbiAgICAgIG1hcCgoW2hvdmVyZWQsIGFjdGl2ZV0pID0+IGFjdGl2ZSB8fCBob3ZlcmVkKSxcbiAgICAgIGRpc3RpbmN0VW50aWxDaGFuZ2VkKCksXG4gICAgICBzaGFyZSgpLFxuICApO1xuXG4gIHByaXZhdGUgcmVhZG9ubHkgX2hlYWRlclJvd0hvdmVyZWRPckFjdGl2ZURpc3RpbmN0UmVlbnRlclpvbmUgPVxuICAgICAgdGhpcy5oZWFkZXJSb3dIb3ZlcmVkT3JBY3RpdmVEaXN0aW5jdC5waXBlKFxuICAgICAgICAgIHRoaXMuX2VudGVyWm9uZSgpLFxuICAgICAgICAgIHNoYXJlKCksXG4gICAgICApO1xuXG4gIC8vIE9wdGltaXphdGlvbjogU2hhcmUgcm93IGV2ZW50cyBvYnNlcnZhYmxlIHdpdGggc3Vic2VxdWVudCBjYWxsZXJzLlxuICAvLyBBdCBzdGFydHVwLCBjYWxscyB3aWxsIGJlIHNlcXVlbnRpYWwgYnkgcm93IChhbmQgdHlwaWNhbGx5IHRoZXJlJ3Mgb25seSBvbmUpLlxuICBwcml2YXRlIF9sYXN0U2VlblJvdzogRWxlbWVudHxudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBfbGFzdFNlZW5Sb3dIb3ZlcjogT2JzZXJ2YWJsZTxib29sZWFuPnxudWxsID0gbnVsbDtcblxuICAvKipcbiAgICogRW1pdHMgd2hldGhlciB0aGUgc3BlY2lmaWVkIHJvdyBzaG91bGQgc2hvdyBpdHMgb3ZlcmxheSBjb250cm9scy5cbiAgICogRW1pc3Npb24gb2NjdXJzIHdpdGhpbiB0aGUgTmdab25lLlxuICAgKi9cbiAgcmVzaXplT3ZlcmxheVZpc2libGVGb3JIZWFkZXJSb3cocm93OiBFbGVtZW50KTogT2JzZXJ2YWJsZTxib29sZWFuPiB7XG4gICAgaWYgKHJvdyAhPT0gdGhpcy5fbGFzdFNlZW5Sb3cpIHtcbiAgICAgIHRoaXMuX2xhc3RTZWVuUm93ID0gcm93O1xuICAgICAgdGhpcy5fbGFzdFNlZW5Sb3dIb3ZlciA9IHRoaXMuX2hlYWRlclJvd0hvdmVyZWRPckFjdGl2ZURpc3RpbmN0UmVlbnRlclpvbmUucGlwZShcbiAgICAgICAgbWFwKGhvdmVyZWRSb3cgPT4gaG92ZXJlZFJvdyA9PT0gcm93KSxcbiAgICAgICAgZGlzdGluY3RVbnRpbENoYW5nZWQoKSxcbiAgICAgICAgc2hhcmUoKSxcbiAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX2xhc3RTZWVuUm93SG92ZXIhO1xuICB9XG5cbiAgcHJpdmF0ZSBfZW50ZXJab25lPFQ+KCk6IE1vbm9UeXBlT3BlcmF0b3JGdW5jdGlvbjxUPiB7XG4gICAgcmV0dXJuIChzb3VyY2U6IE9ic2VydmFibGU8VD4pID0+XG4gICAgICAgIG5ldyBPYnNlcnZhYmxlPFQ+KChvYnNlcnZlcikgPT4gc291cmNlLnN1YnNjcmliZSh7XG4gICAgICAgICAgbmV4dDogKHZhbHVlKSA9PiB0aGlzLl9uZ1pvbmUucnVuKCgpID0+IG9ic2VydmVyLm5leHQodmFsdWUpKSxcbiAgICAgICAgICBlcnJvcjogKGVycikgPT4gb2JzZXJ2ZXIuZXJyb3IoZXJyKSxcbiAgICAgICAgICBjb21wbGV0ZTogKCkgPT4gb2JzZXJ2ZXIuY29tcGxldGUoKVxuICAgICAgICB9KSk7XG4gIH1cbn1cbiJdfQ==