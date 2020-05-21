/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __decorate, __metadata } from "tslib";
import { Injectable, NgZone } from '@angular/core';
import { combineLatest, Observable, Subject } from 'rxjs';
import { distinctUntilChanged, map, share, skip, startWith } from 'rxjs/operators';
import { _closest } from '@angular/cdk-experimental/popover-edit';
import { HEADER_ROW_SELECTOR } from './selectors';
/** Coordinates events between the column resize directives. */
let HeaderRowEventDispatcher = /** @class */ (() => {
    let HeaderRowEventDispatcher = class HeaderRowEventDispatcher {
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
    };
    HeaderRowEventDispatcher = __decorate([
        Injectable(),
        __metadata("design:paramtypes", [NgZone])
    ], HeaderRowEventDispatcher);
    return HeaderRowEventDispatcher;
})();
export { HeaderRowEventDispatcher };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnQtZGlzcGF0Y2hlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL2NvbHVtbi1yZXNpemUvZXZlbnQtZGlzcGF0Y2hlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7O0FBRUgsT0FBTyxFQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDakQsT0FBTyxFQUFDLGFBQWEsRUFBNEIsVUFBVSxFQUFFLE9BQU8sRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUNsRixPQUFPLEVBQUMsb0JBQW9CLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFFakYsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLHdDQUF3QyxDQUFDO0FBRWhFLE9BQU8sRUFBQyxtQkFBbUIsRUFBQyxNQUFNLGFBQWEsQ0FBQztBQUVoRCwrREFBK0Q7QUFFL0Q7SUFBQSxJQUFhLHdCQUF3QixHQUFyQyxNQUFhLHdCQUF3QjtRQWNuQyxZQUE2QixPQUFlO1lBQWYsWUFBTyxHQUFQLE9BQU8sQ0FBUTtZQWI1Qzs7OztlQUlHO1lBQ00sc0JBQWlCLEdBQUcsSUFBSSxPQUFPLEVBQWdCLENBQUM7WUFFekQ7OztlQUdHO1lBQ00sK0JBQTBCLEdBQUcsSUFBSSxPQUFPLEVBQWdCLENBQUM7WUFJbEUsd0RBQXdEO1lBQy9DLDhCQUF5QixHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQzVELG9CQUFvQixFQUFFLEVBQ3RCLEtBQUssRUFBRSxDQUNWLENBQUM7WUFFRjs7O2VBR0c7WUFDTSxxQ0FBZ0MsR0FBRyxhQUFhLENBQ3JELElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxJQUFJLENBQy9CLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsbUJBQW1CLENBQUMsQ0FBQyxFQUNoRCxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQ2Ysb0JBQW9CLEVBQUUsQ0FDeEIsRUFDRixJQUFJLENBQUMsMEJBQTBCLENBQUMsSUFBSSxDQUNoQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLG1CQUFtQixDQUFDLENBQUMsRUFDaEQsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUNmLG9CQUFvQixFQUFFLENBQ3pCLENBQ0osQ0FBQyxJQUFJLENBQ0YsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLHdDQUF3QztZQUNqRCxHQUFHLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsRUFBRSxFQUFFLENBQUMsTUFBTSxJQUFJLE9BQU8sQ0FBQyxFQUM3QyxvQkFBb0IsRUFBRSxFQUN0QixLQUFLLEVBQUUsQ0FDVixDQUFDO1lBRWUsaURBQTRDLEdBQ3pELElBQUksQ0FBQyxnQ0FBZ0MsQ0FBQyxJQUFJLENBQ3RDLElBQUksQ0FBQyxVQUFVLEVBQUUsRUFDakIsS0FBSyxFQUFFLENBQ1YsQ0FBQztZQUVOLHFFQUFxRTtZQUNyRSxnRkFBZ0Y7WUFDeEUsaUJBQVksR0FBaUIsSUFBSSxDQUFDO1lBQ2xDLHNCQUFpQixHQUE2QixJQUFJLENBQUM7UUF2Q1osQ0FBQztRQXlDaEQ7OztXQUdHO1FBQ0gsZ0NBQWdDLENBQUMsR0FBWTtZQUMzQyxJQUFJLEdBQUcsS0FBSyxJQUFJLENBQUMsWUFBWSxFQUFFO2dCQUM3QixJQUFJLENBQUMsWUFBWSxHQUFHLEdBQUcsQ0FBQztnQkFDeEIsSUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQyw0Q0FBNEMsQ0FBQyxJQUFJLENBQzdFLEdBQUcsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLFVBQVUsS0FBSyxHQUFHLENBQUMsRUFDckMsb0JBQW9CLEVBQUUsRUFDdEIsS0FBSyxFQUFFLENBQ1IsQ0FBQzthQUNIO1lBRUQsT0FBTyxJQUFJLENBQUMsaUJBQWtCLENBQUM7UUFDakMsQ0FBQztRQUVPLFVBQVU7WUFDaEIsT0FBTyxDQUFDLE1BQXFCLEVBQUUsRUFBRSxDQUM3QixJQUFJLFVBQVUsQ0FBSSxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQztnQkFDL0MsSUFBSSxFQUFFLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUM3RCxLQUFLLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDO2dCQUNuQyxRQUFRLEVBQUUsR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRTthQUNwQyxDQUFDLENBQUMsQ0FBQztRQUNWLENBQUM7S0FDRixDQUFBO0lBaEZZLHdCQUF3QjtRQURwQyxVQUFVLEVBQUU7eUNBZTJCLE1BQU07T0FkakMsd0JBQXdCLENBZ0ZwQztJQUFELCtCQUFDO0tBQUE7U0FoRlksd0JBQXdCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SW5qZWN0YWJsZSwgTmdab25lfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7Y29tYmluZUxhdGVzdCwgTW9ub1R5cGVPcGVyYXRvckZ1bmN0aW9uLCBPYnNlcnZhYmxlLCBTdWJqZWN0fSBmcm9tICdyeGpzJztcbmltcG9ydCB7ZGlzdGluY3RVbnRpbENoYW5nZWQsIG1hcCwgc2hhcmUsIHNraXAsIHN0YXJ0V2l0aH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuXG5pbXBvcnQge19jbG9zZXN0fSBmcm9tICdAYW5ndWxhci9jZGstZXhwZXJpbWVudGFsL3BvcG92ZXItZWRpdCc7XG5cbmltcG9ydCB7SEVBREVSX1JPV19TRUxFQ1RPUn0gZnJvbSAnLi9zZWxlY3RvcnMnO1xuXG4vKiogQ29vcmRpbmF0ZXMgZXZlbnRzIGJldHdlZW4gdGhlIGNvbHVtbiByZXNpemUgZGlyZWN0aXZlcy4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBIZWFkZXJSb3dFdmVudERpc3BhdGNoZXIge1xuICAvKipcbiAgICogRW1pdHMgdGhlIGN1cnJlbnRseSBob3ZlcmVkIGhlYWRlciBjZWxsIG9yIG51bGwgd2hlbiBubyBoZWFkZXIgY2VsbHMgYXJlIGhvdmVyZWQuXG4gICAqIEV4cG9zZWQgcHVibGljbHkgZm9yIGV2ZW50cyB0byBmZWVkIGluLCBidXQgc3Vic2NyaWJlcnMgc2hvdWxkIHVzZSBoZWFkZXJDZWxsSG92ZXJlZERpc3RpbmN0LFxuICAgKiBkZWZpbmVkIGJlbG93LlxuICAgKi9cbiAgcmVhZG9ubHkgaGVhZGVyQ2VsbEhvdmVyZWQgPSBuZXcgU3ViamVjdDxFbGVtZW50fG51bGw+KCk7XG5cbiAgLyoqXG4gICAqIEVtaXRzIHRoZSBoZWFkZXIgY2VsbCBmb3Igd2hpY2ggYSB1c2VyLXRyaWdnZXJlZCByZXNpemUgaXMgYWN0aXZlIG9yIG51bGxcbiAgICogd2hlbiBubyByZXNpemUgaXMgaW4gcHJvZ3Jlc3MuXG4gICAqL1xuICByZWFkb25seSBvdmVybGF5SGFuZGxlQWN0aXZlRm9yQ2VsbCA9IG5ldyBTdWJqZWN0PEVsZW1lbnR8bnVsbD4oKTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHJlYWRvbmx5IF9uZ1pvbmU6IE5nWm9uZSkge31cblxuICAvKiogRGlzdGluY3QgYW5kIHNoYXJlZCB2ZXJzaW9uIG9mIGhlYWRlckNlbGxIb3ZlcmVkLiAqL1xuICByZWFkb25seSBoZWFkZXJDZWxsSG92ZXJlZERpc3RpbmN0ID0gdGhpcy5oZWFkZXJDZWxsSG92ZXJlZC5waXBlKFxuICAgICAgZGlzdGluY3RVbnRpbENoYW5nZWQoKSxcbiAgICAgIHNoYXJlKCksXG4gICk7XG5cbiAgLyoqXG4gICAqIEVtaXRzIHRoZSBoZWFkZXIgdGhhdCBpcyBjdXJyZW50bHkgaG92ZXJlZCBvciBob3N0aW5nIGFuIGFjdGl2ZSByZXNpemUgZXZlbnQgKHdpdGggYWN0aXZlXG4gICAqIHRha2luZyBwcmVjZWRlbmNlKS5cbiAgICovXG4gIHJlYWRvbmx5IGhlYWRlclJvd0hvdmVyZWRPckFjdGl2ZURpc3RpbmN0ID0gY29tYmluZUxhdGVzdChcbiAgICAgIHRoaXMuaGVhZGVyQ2VsbEhvdmVyZWREaXN0aW5jdC5waXBlKFxuICAgICAgICAgIG1hcChjZWxsID0+IF9jbG9zZXN0KGNlbGwsIEhFQURFUl9ST1dfU0VMRUNUT1IpKSxcbiAgICAgICAgICBzdGFydFdpdGgobnVsbCksXG4gICAgICAgICAgZGlzdGluY3RVbnRpbENoYW5nZWQoKSxcbiAgICAgICApLFxuICAgICAgdGhpcy5vdmVybGF5SGFuZGxlQWN0aXZlRm9yQ2VsbC5waXBlKFxuICAgICAgICAgIG1hcChjZWxsID0+IF9jbG9zZXN0KGNlbGwsIEhFQURFUl9ST1dfU0VMRUNUT1IpKSxcbiAgICAgICAgICBzdGFydFdpdGgobnVsbCksXG4gICAgICAgICAgZGlzdGluY3RVbnRpbENoYW5nZWQoKSxcbiAgICAgICksXG4gICkucGlwZShcbiAgICAgIHNraXAoMSksIC8vIElnbm9yZSBpbml0aWFsIFtudWxsLCBudWxsXSBlbWlzc2lvbi5cbiAgICAgIG1hcCgoW2hvdmVyZWQsIGFjdGl2ZV0pID0+IGFjdGl2ZSB8fCBob3ZlcmVkKSxcbiAgICAgIGRpc3RpbmN0VW50aWxDaGFuZ2VkKCksXG4gICAgICBzaGFyZSgpLFxuICApO1xuXG4gIHByaXZhdGUgcmVhZG9ubHkgX2hlYWRlclJvd0hvdmVyZWRPckFjdGl2ZURpc3RpbmN0UmVlbnRlclpvbmUgPVxuICAgICAgdGhpcy5oZWFkZXJSb3dIb3ZlcmVkT3JBY3RpdmVEaXN0aW5jdC5waXBlKFxuICAgICAgICAgIHRoaXMuX2VudGVyWm9uZSgpLFxuICAgICAgICAgIHNoYXJlKCksXG4gICAgICApO1xuXG4gIC8vIE9wdGltaXphdGlvbjogU2hhcmUgcm93IGV2ZW50cyBvYnNlcnZhYmxlIHdpdGggc3Vic2VxdWVudCBjYWxsZXJzLlxuICAvLyBBdCBzdGFydHVwLCBjYWxscyB3aWxsIGJlIHNlcXVlbnRpYWwgYnkgcm93IChhbmQgdHlwaWNhbGx5IHRoZXJlJ3Mgb25seSBvbmUpLlxuICBwcml2YXRlIF9sYXN0U2VlblJvdzogRWxlbWVudHxudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBfbGFzdFNlZW5Sb3dIb3ZlcjogT2JzZXJ2YWJsZTxib29sZWFuPnxudWxsID0gbnVsbDtcblxuICAvKipcbiAgICogRW1pdHMgd2hldGhlciB0aGUgc3BlY2lmaWVkIHJvdyBzaG91bGQgc2hvdyBpdHMgb3ZlcmxheSBjb250cm9scy5cbiAgICogRW1pc3Npb24gb2NjdXJzIHdpdGhpbiB0aGUgTmdab25lLlxuICAgKi9cbiAgcmVzaXplT3ZlcmxheVZpc2libGVGb3JIZWFkZXJSb3cocm93OiBFbGVtZW50KTogT2JzZXJ2YWJsZTxib29sZWFuPiB7XG4gICAgaWYgKHJvdyAhPT0gdGhpcy5fbGFzdFNlZW5Sb3cpIHtcbiAgICAgIHRoaXMuX2xhc3RTZWVuUm93ID0gcm93O1xuICAgICAgdGhpcy5fbGFzdFNlZW5Sb3dIb3ZlciA9IHRoaXMuX2hlYWRlclJvd0hvdmVyZWRPckFjdGl2ZURpc3RpbmN0UmVlbnRlclpvbmUucGlwZShcbiAgICAgICAgbWFwKGhvdmVyZWRSb3cgPT4gaG92ZXJlZFJvdyA9PT0gcm93KSxcbiAgICAgICAgZGlzdGluY3RVbnRpbENoYW5nZWQoKSxcbiAgICAgICAgc2hhcmUoKSxcbiAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX2xhc3RTZWVuUm93SG92ZXIhO1xuICB9XG5cbiAgcHJpdmF0ZSBfZW50ZXJab25lPFQ+KCk6IE1vbm9UeXBlT3BlcmF0b3JGdW5jdGlvbjxUPiB7XG4gICAgcmV0dXJuIChzb3VyY2U6IE9ic2VydmFibGU8VD4pID0+XG4gICAgICAgIG5ldyBPYnNlcnZhYmxlPFQ+KChvYnNlcnZlcikgPT4gc291cmNlLnN1YnNjcmliZSh7XG4gICAgICAgICAgbmV4dDogKHZhbHVlKSA9PiB0aGlzLl9uZ1pvbmUucnVuKCgpID0+IG9ic2VydmVyLm5leHQodmFsdWUpKSxcbiAgICAgICAgICBlcnJvcjogKGVycikgPT4gb2JzZXJ2ZXIuZXJyb3IoZXJyKSxcbiAgICAgICAgICBjb21wbGV0ZTogKCkgPT4gb2JzZXJ2ZXIuY29tcGxldGUoKVxuICAgICAgICB9KSk7XG4gIH1cbn1cbiJdfQ==