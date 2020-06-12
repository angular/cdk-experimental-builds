/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Injectable, NgZone } from '@angular/core';
import { combineLatest, Observable, Subject } from 'rxjs';
import { distinctUntilChanged, map, share, skip, startWith } from 'rxjs/operators';
import { _closest } from '@angular/cdk-experimental/popover-edit';
import { HEADER_ROW_SELECTOR } from './selectors';
/** Coordinates events between the column resize directives. */
let HeaderRowEventDispatcher = /** @class */ (() => {
    class HeaderRowEventDispatcher {
        constructor(_ngZone) {
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
            this.headerRowHoveredOrActiveDistinct = combineLatest(this.headerCellHoveredDistinct.pipe(map(cell => _closest(cell, HEADER_ROW_SELECTOR)), startWith(null), distinctUntilChanged()), this.overlayHandleActiveForCell.pipe(map(cell => _closest(cell, HEADER_ROW_SELECTOR)), startWith(null), distinctUntilChanged())).pipe(skip(1), // Ignore initial [null, null] emission.
            map(([hovered, active]) => active || hovered), distinctUntilChanged(), share());
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
        resizeOverlayVisibleForHeaderRow(row) {
            if (row !== this._lastSeenRow) {
                this._lastSeenRow = row;
                this._lastSeenRowHover = this._headerRowHoveredOrActiveDistinctReenterZone.pipe(map(hoveredRow => hoveredRow === row), distinctUntilChanged(), share());
            }
            return this._lastSeenRowHover;
        }
        _enterZone() {
            return (source) => new Observable((observer) => source.subscribe({
                next: (value) => this._ngZone.run(() => observer.next(value)),
                error: (err) => observer.error(err),
                complete: () => observer.complete()
            }));
        }
    }
    HeaderRowEventDispatcher.decorators = [
        { type: Injectable }
    ];
    HeaderRowEventDispatcher.ctorParameters = () => [
        { type: NgZone }
    ];
    return HeaderRowEventDispatcher;
})();
export { HeaderRowEventDispatcher };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnQtZGlzcGF0Y2hlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL2NvbHVtbi1yZXNpemUvZXZlbnQtZGlzcGF0Y2hlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUNqRCxPQUFPLEVBQUMsYUFBYSxFQUE0QixVQUFVLEVBQUUsT0FBTyxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQ2xGLE9BQU8sRUFBQyxvQkFBb0IsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUVqRixPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sd0NBQXdDLENBQUM7QUFFaEUsT0FBTyxFQUFDLG1CQUFtQixFQUFDLE1BQU0sYUFBYSxDQUFDO0FBRWhELCtEQUErRDtBQUMvRDtJQUFBLE1BQ2Esd0JBQXdCO1FBY25DLFlBQTZCLE9BQWU7WUFBZixZQUFPLEdBQVAsT0FBTyxDQUFRO1lBYjVDOzs7O2VBSUc7WUFDTSxzQkFBaUIsR0FBRyxJQUFJLE9BQU8sRUFBZ0IsQ0FBQztZQUV6RDs7O2VBR0c7WUFDTSwrQkFBMEIsR0FBRyxJQUFJLE9BQU8sRUFBZ0IsQ0FBQztZQUlsRSx3REFBd0Q7WUFDL0MsOEJBQXlCLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FDNUQsb0JBQW9CLEVBQUUsRUFDdEIsS0FBSyxFQUFFLENBQ1YsQ0FBQztZQUVGOzs7ZUFHRztZQUNNLHFDQUFnQyxHQUFHLGFBQWEsQ0FDckQsSUFBSSxDQUFDLHlCQUF5QixDQUFDLElBQUksQ0FDL0IsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxtQkFBbUIsQ0FBQyxDQUFDLEVBQ2hELFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFDZixvQkFBb0IsRUFBRSxDQUN4QixFQUNGLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxJQUFJLENBQ2hDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsbUJBQW1CLENBQUMsQ0FBQyxFQUNoRCxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQ2Ysb0JBQW9CLEVBQUUsQ0FDekIsQ0FDSixDQUFDLElBQUksQ0FDRixJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsd0NBQXdDO1lBQ2pELEdBQUcsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxFQUFFLEVBQUUsQ0FBQyxNQUFNLElBQUksT0FBTyxDQUFDLEVBQzdDLG9CQUFvQixFQUFFLEVBQ3RCLEtBQUssRUFBRSxDQUNWLENBQUM7WUFFZSxpREFBNEMsR0FDekQsSUFBSSxDQUFDLGdDQUFnQyxDQUFDLElBQUksQ0FDdEMsSUFBSSxDQUFDLFVBQVUsRUFBRSxFQUNqQixLQUFLLEVBQUUsQ0FDVixDQUFDO1lBRU4scUVBQXFFO1lBQ3JFLGdGQUFnRjtZQUN4RSxpQkFBWSxHQUFpQixJQUFJLENBQUM7WUFDbEMsc0JBQWlCLEdBQTZCLElBQUksQ0FBQztRQXZDWixDQUFDO1FBeUNoRDs7O1dBR0c7UUFDSCxnQ0FBZ0MsQ0FBQyxHQUFZO1lBQzNDLElBQUksR0FBRyxLQUFLLElBQUksQ0FBQyxZQUFZLEVBQUU7Z0JBQzdCLElBQUksQ0FBQyxZQUFZLEdBQUcsR0FBRyxDQUFDO2dCQUN4QixJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDLDRDQUE0QyxDQUFDLElBQUksQ0FDN0UsR0FBRyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsVUFBVSxLQUFLLEdBQUcsQ0FBQyxFQUNyQyxvQkFBb0IsRUFBRSxFQUN0QixLQUFLLEVBQUUsQ0FDUixDQUFDO2FBQ0g7WUFFRCxPQUFPLElBQUksQ0FBQyxpQkFBa0IsQ0FBQztRQUNqQyxDQUFDO1FBRU8sVUFBVTtZQUNoQixPQUFPLENBQUMsTUFBcUIsRUFBRSxFQUFFLENBQzdCLElBQUksVUFBVSxDQUFJLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDO2dCQUMvQyxJQUFJLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQzdELEtBQUssRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUM7Z0JBQ25DLFFBQVEsRUFBRSxHQUFHLEVBQUUsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFO2FBQ3BDLENBQUMsQ0FBQyxDQUFDO1FBQ1YsQ0FBQzs7O2dCQWhGRixVQUFVOzs7Z0JBVFMsTUFBTTs7SUEwRjFCLCtCQUFDO0tBQUE7U0FoRlksd0JBQXdCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SW5qZWN0YWJsZSwgTmdab25lfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7Y29tYmluZUxhdGVzdCwgTW9ub1R5cGVPcGVyYXRvckZ1bmN0aW9uLCBPYnNlcnZhYmxlLCBTdWJqZWN0fSBmcm9tICdyeGpzJztcbmltcG9ydCB7ZGlzdGluY3RVbnRpbENoYW5nZWQsIG1hcCwgc2hhcmUsIHNraXAsIHN0YXJ0V2l0aH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuXG5pbXBvcnQge19jbG9zZXN0fSBmcm9tICdAYW5ndWxhci9jZGstZXhwZXJpbWVudGFsL3BvcG92ZXItZWRpdCc7XG5cbmltcG9ydCB7SEVBREVSX1JPV19TRUxFQ1RPUn0gZnJvbSAnLi9zZWxlY3RvcnMnO1xuXG4vKiogQ29vcmRpbmF0ZXMgZXZlbnRzIGJldHdlZW4gdGhlIGNvbHVtbiByZXNpemUgZGlyZWN0aXZlcy4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBIZWFkZXJSb3dFdmVudERpc3BhdGNoZXIge1xuICAvKipcbiAgICogRW1pdHMgdGhlIGN1cnJlbnRseSBob3ZlcmVkIGhlYWRlciBjZWxsIG9yIG51bGwgd2hlbiBubyBoZWFkZXIgY2VsbHMgYXJlIGhvdmVyZWQuXG4gICAqIEV4cG9zZWQgcHVibGljbHkgZm9yIGV2ZW50cyB0byBmZWVkIGluLCBidXQgc3Vic2NyaWJlcnMgc2hvdWxkIHVzZSBoZWFkZXJDZWxsSG92ZXJlZERpc3RpbmN0LFxuICAgKiBkZWZpbmVkIGJlbG93LlxuICAgKi9cbiAgcmVhZG9ubHkgaGVhZGVyQ2VsbEhvdmVyZWQgPSBuZXcgU3ViamVjdDxFbGVtZW50fG51bGw+KCk7XG5cbiAgLyoqXG4gICAqIEVtaXRzIHRoZSBoZWFkZXIgY2VsbCBmb3Igd2hpY2ggYSB1c2VyLXRyaWdnZXJlZCByZXNpemUgaXMgYWN0aXZlIG9yIG51bGxcbiAgICogd2hlbiBubyByZXNpemUgaXMgaW4gcHJvZ3Jlc3MuXG4gICAqL1xuICByZWFkb25seSBvdmVybGF5SGFuZGxlQWN0aXZlRm9yQ2VsbCA9IG5ldyBTdWJqZWN0PEVsZW1lbnR8bnVsbD4oKTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHJlYWRvbmx5IF9uZ1pvbmU6IE5nWm9uZSkge31cblxuICAvKiogRGlzdGluY3QgYW5kIHNoYXJlZCB2ZXJzaW9uIG9mIGhlYWRlckNlbGxIb3ZlcmVkLiAqL1xuICByZWFkb25seSBoZWFkZXJDZWxsSG92ZXJlZERpc3RpbmN0ID0gdGhpcy5oZWFkZXJDZWxsSG92ZXJlZC5waXBlKFxuICAgICAgZGlzdGluY3RVbnRpbENoYW5nZWQoKSxcbiAgICAgIHNoYXJlKCksXG4gICk7XG5cbiAgLyoqXG4gICAqIEVtaXRzIHRoZSBoZWFkZXIgdGhhdCBpcyBjdXJyZW50bHkgaG92ZXJlZCBvciBob3N0aW5nIGFuIGFjdGl2ZSByZXNpemUgZXZlbnQgKHdpdGggYWN0aXZlXG4gICAqIHRha2luZyBwcmVjZWRlbmNlKS5cbiAgICovXG4gIHJlYWRvbmx5IGhlYWRlclJvd0hvdmVyZWRPckFjdGl2ZURpc3RpbmN0ID0gY29tYmluZUxhdGVzdChcbiAgICAgIHRoaXMuaGVhZGVyQ2VsbEhvdmVyZWREaXN0aW5jdC5waXBlKFxuICAgICAgICAgIG1hcChjZWxsID0+IF9jbG9zZXN0KGNlbGwsIEhFQURFUl9ST1dfU0VMRUNUT1IpKSxcbiAgICAgICAgICBzdGFydFdpdGgobnVsbCksXG4gICAgICAgICAgZGlzdGluY3RVbnRpbENoYW5nZWQoKSxcbiAgICAgICApLFxuICAgICAgdGhpcy5vdmVybGF5SGFuZGxlQWN0aXZlRm9yQ2VsbC5waXBlKFxuICAgICAgICAgIG1hcChjZWxsID0+IF9jbG9zZXN0KGNlbGwsIEhFQURFUl9ST1dfU0VMRUNUT1IpKSxcbiAgICAgICAgICBzdGFydFdpdGgobnVsbCksXG4gICAgICAgICAgZGlzdGluY3RVbnRpbENoYW5nZWQoKSxcbiAgICAgICksXG4gICkucGlwZShcbiAgICAgIHNraXAoMSksIC8vIElnbm9yZSBpbml0aWFsIFtudWxsLCBudWxsXSBlbWlzc2lvbi5cbiAgICAgIG1hcCgoW2hvdmVyZWQsIGFjdGl2ZV0pID0+IGFjdGl2ZSB8fCBob3ZlcmVkKSxcbiAgICAgIGRpc3RpbmN0VW50aWxDaGFuZ2VkKCksXG4gICAgICBzaGFyZSgpLFxuICApO1xuXG4gIHByaXZhdGUgcmVhZG9ubHkgX2hlYWRlclJvd0hvdmVyZWRPckFjdGl2ZURpc3RpbmN0UmVlbnRlclpvbmUgPVxuICAgICAgdGhpcy5oZWFkZXJSb3dIb3ZlcmVkT3JBY3RpdmVEaXN0aW5jdC5waXBlKFxuICAgICAgICAgIHRoaXMuX2VudGVyWm9uZSgpLFxuICAgICAgICAgIHNoYXJlKCksXG4gICAgICApO1xuXG4gIC8vIE9wdGltaXphdGlvbjogU2hhcmUgcm93IGV2ZW50cyBvYnNlcnZhYmxlIHdpdGggc3Vic2VxdWVudCBjYWxsZXJzLlxuICAvLyBBdCBzdGFydHVwLCBjYWxscyB3aWxsIGJlIHNlcXVlbnRpYWwgYnkgcm93IChhbmQgdHlwaWNhbGx5IHRoZXJlJ3Mgb25seSBvbmUpLlxuICBwcml2YXRlIF9sYXN0U2VlblJvdzogRWxlbWVudHxudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBfbGFzdFNlZW5Sb3dIb3ZlcjogT2JzZXJ2YWJsZTxib29sZWFuPnxudWxsID0gbnVsbDtcblxuICAvKipcbiAgICogRW1pdHMgd2hldGhlciB0aGUgc3BlY2lmaWVkIHJvdyBzaG91bGQgc2hvdyBpdHMgb3ZlcmxheSBjb250cm9scy5cbiAgICogRW1pc3Npb24gb2NjdXJzIHdpdGhpbiB0aGUgTmdab25lLlxuICAgKi9cbiAgcmVzaXplT3ZlcmxheVZpc2libGVGb3JIZWFkZXJSb3cocm93OiBFbGVtZW50KTogT2JzZXJ2YWJsZTxib29sZWFuPiB7XG4gICAgaWYgKHJvdyAhPT0gdGhpcy5fbGFzdFNlZW5Sb3cpIHtcbiAgICAgIHRoaXMuX2xhc3RTZWVuUm93ID0gcm93O1xuICAgICAgdGhpcy5fbGFzdFNlZW5Sb3dIb3ZlciA9IHRoaXMuX2hlYWRlclJvd0hvdmVyZWRPckFjdGl2ZURpc3RpbmN0UmVlbnRlclpvbmUucGlwZShcbiAgICAgICAgbWFwKGhvdmVyZWRSb3cgPT4gaG92ZXJlZFJvdyA9PT0gcm93KSxcbiAgICAgICAgZGlzdGluY3RVbnRpbENoYW5nZWQoKSxcbiAgICAgICAgc2hhcmUoKSxcbiAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX2xhc3RTZWVuUm93SG92ZXIhO1xuICB9XG5cbiAgcHJpdmF0ZSBfZW50ZXJab25lPFQ+KCk6IE1vbm9UeXBlT3BlcmF0b3JGdW5jdGlvbjxUPiB7XG4gICAgcmV0dXJuIChzb3VyY2U6IE9ic2VydmFibGU8VD4pID0+XG4gICAgICAgIG5ldyBPYnNlcnZhYmxlPFQ+KChvYnNlcnZlcikgPT4gc291cmNlLnN1YnNjcmliZSh7XG4gICAgICAgICAgbmV4dDogKHZhbHVlKSA9PiB0aGlzLl9uZ1pvbmUucnVuKCgpID0+IG9ic2VydmVyLm5leHQodmFsdWUpKSxcbiAgICAgICAgICBlcnJvcjogKGVycikgPT4gb2JzZXJ2ZXIuZXJyb3IoZXJyKSxcbiAgICAgICAgICBjb21wbGV0ZTogKCkgPT4gb2JzZXJ2ZXIuY29tcGxldGUoKVxuICAgICAgICB9KSk7XG4gIH1cbn1cbiJdfQ==