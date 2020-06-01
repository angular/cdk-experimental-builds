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
    /** @nocollapse */
    HeaderRowEventDispatcher.ctorParameters = () => [
        { type: NgZone }
    ];
    return HeaderRowEventDispatcher;
})();
export { HeaderRowEventDispatcher };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnQtZGlzcGF0Y2hlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL2NvbHVtbi1yZXNpemUvZXZlbnQtZGlzcGF0Y2hlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUNqRCxPQUFPLEVBQUMsYUFBYSxFQUE0QixVQUFVLEVBQUUsT0FBTyxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQ2xGLE9BQU8sRUFBQyxvQkFBb0IsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUVqRixPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sd0NBQXdDLENBQUM7QUFFaEUsT0FBTyxFQUFDLG1CQUFtQixFQUFDLE1BQU0sYUFBYSxDQUFDO0FBRWhELCtEQUErRDtBQUMvRDtJQUFBLE1BQ2Esd0JBQXdCO1FBY25DLFlBQTZCLE9BQWU7WUFBZixZQUFPLEdBQVAsT0FBTyxDQUFRO1lBYjVDOzs7O2VBSUc7WUFDTSxzQkFBaUIsR0FBRyxJQUFJLE9BQU8sRUFBZ0IsQ0FBQztZQUV6RDs7O2VBR0c7WUFDTSwrQkFBMEIsR0FBRyxJQUFJLE9BQU8sRUFBZ0IsQ0FBQztZQUlsRSx3REFBd0Q7WUFDL0MsOEJBQXlCLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FDNUQsb0JBQW9CLEVBQUUsRUFDdEIsS0FBSyxFQUFFLENBQ1YsQ0FBQztZQUVGOzs7ZUFHRztZQUNNLHFDQUFnQyxHQUFHLGFBQWEsQ0FDckQsSUFBSSxDQUFDLHlCQUF5QixDQUFDLElBQUksQ0FDL0IsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxtQkFBbUIsQ0FBQyxDQUFDLEVBQ2hELFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFDZixvQkFBb0IsRUFBRSxDQUN4QixFQUNGLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxJQUFJLENBQ2hDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsbUJBQW1CLENBQUMsQ0FBQyxFQUNoRCxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQ2Ysb0JBQW9CLEVBQUUsQ0FDekIsQ0FDSixDQUFDLElBQUksQ0FDRixJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsd0NBQXdDO1lBQ2pELEdBQUcsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxFQUFFLEVBQUUsQ0FBQyxNQUFNLElBQUksT0FBTyxDQUFDLEVBQzdDLG9CQUFvQixFQUFFLEVBQ3RCLEtBQUssRUFBRSxDQUNWLENBQUM7WUFFZSxpREFBNEMsR0FDekQsSUFBSSxDQUFDLGdDQUFnQyxDQUFDLElBQUksQ0FDdEMsSUFBSSxDQUFDLFVBQVUsRUFBRSxFQUNqQixLQUFLLEVBQUUsQ0FDVixDQUFDO1lBRU4scUVBQXFFO1lBQ3JFLGdGQUFnRjtZQUN4RSxpQkFBWSxHQUFpQixJQUFJLENBQUM7WUFDbEMsc0JBQWlCLEdBQTZCLElBQUksQ0FBQztRQXZDWixDQUFDO1FBeUNoRDs7O1dBR0c7UUFDSCxnQ0FBZ0MsQ0FBQyxHQUFZO1lBQzNDLElBQUksR0FBRyxLQUFLLElBQUksQ0FBQyxZQUFZLEVBQUU7Z0JBQzdCLElBQUksQ0FBQyxZQUFZLEdBQUcsR0FBRyxDQUFDO2dCQUN4QixJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDLDRDQUE0QyxDQUFDLElBQUksQ0FDN0UsR0FBRyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsVUFBVSxLQUFLLEdBQUcsQ0FBQyxFQUNyQyxvQkFBb0IsRUFBRSxFQUN0QixLQUFLLEVBQUUsQ0FDUixDQUFDO2FBQ0g7WUFFRCxPQUFPLElBQUksQ0FBQyxpQkFBa0IsQ0FBQztRQUNqQyxDQUFDO1FBRU8sVUFBVTtZQUNoQixPQUFPLENBQUMsTUFBcUIsRUFBRSxFQUFFLENBQzdCLElBQUksVUFBVSxDQUFJLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDO2dCQUMvQyxJQUFJLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQzdELEtBQUssRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUM7Z0JBQ25DLFFBQVEsRUFBRSxHQUFHLEVBQUUsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFO2FBQ3BDLENBQUMsQ0FBQyxDQUFDO1FBQ1YsQ0FBQzs7O2dCQWhGRixVQUFVOzs7O2dCQVRTLE1BQU07O0lBMEYxQiwrQkFBQztLQUFBO1NBaEZZLHdCQUF3QiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0luamVjdGFibGUsIE5nWm9uZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge2NvbWJpbmVMYXRlc3QsIE1vbm9UeXBlT3BlcmF0b3JGdW5jdGlvbiwgT2JzZXJ2YWJsZSwgU3ViamVjdH0gZnJvbSAncnhqcyc7XG5pbXBvcnQge2Rpc3RpbmN0VW50aWxDaGFuZ2VkLCBtYXAsIHNoYXJlLCBza2lwLCBzdGFydFdpdGh9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcblxuaW1wb3J0IHtfY2xvc2VzdH0gZnJvbSAnQGFuZ3VsYXIvY2RrLWV4cGVyaW1lbnRhbC9wb3BvdmVyLWVkaXQnO1xuXG5pbXBvcnQge0hFQURFUl9ST1dfU0VMRUNUT1J9IGZyb20gJy4vc2VsZWN0b3JzJztcblxuLyoqIENvb3JkaW5hdGVzIGV2ZW50cyBiZXR3ZWVuIHRoZSBjb2x1bW4gcmVzaXplIGRpcmVjdGl2ZXMuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgSGVhZGVyUm93RXZlbnREaXNwYXRjaGVyIHtcbiAgLyoqXG4gICAqIEVtaXRzIHRoZSBjdXJyZW50bHkgaG92ZXJlZCBoZWFkZXIgY2VsbCBvciBudWxsIHdoZW4gbm8gaGVhZGVyIGNlbGxzIGFyZSBob3ZlcmVkLlxuICAgKiBFeHBvc2VkIHB1YmxpY2x5IGZvciBldmVudHMgdG8gZmVlZCBpbiwgYnV0IHN1YnNjcmliZXJzIHNob3VsZCB1c2UgaGVhZGVyQ2VsbEhvdmVyZWREaXN0aW5jdCxcbiAgICogZGVmaW5lZCBiZWxvdy5cbiAgICovXG4gIHJlYWRvbmx5IGhlYWRlckNlbGxIb3ZlcmVkID0gbmV3IFN1YmplY3Q8RWxlbWVudHxudWxsPigpO1xuXG4gIC8qKlxuICAgKiBFbWl0cyB0aGUgaGVhZGVyIGNlbGwgZm9yIHdoaWNoIGEgdXNlci10cmlnZ2VyZWQgcmVzaXplIGlzIGFjdGl2ZSBvciBudWxsXG4gICAqIHdoZW4gbm8gcmVzaXplIGlzIGluIHByb2dyZXNzLlxuICAgKi9cbiAgcmVhZG9ubHkgb3ZlcmxheUhhbmRsZUFjdGl2ZUZvckNlbGwgPSBuZXcgU3ViamVjdDxFbGVtZW50fG51bGw+KCk7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSByZWFkb25seSBfbmdab25lOiBOZ1pvbmUpIHt9XG5cbiAgLyoqIERpc3RpbmN0IGFuZCBzaGFyZWQgdmVyc2lvbiBvZiBoZWFkZXJDZWxsSG92ZXJlZC4gKi9cbiAgcmVhZG9ubHkgaGVhZGVyQ2VsbEhvdmVyZWREaXN0aW5jdCA9IHRoaXMuaGVhZGVyQ2VsbEhvdmVyZWQucGlwZShcbiAgICAgIGRpc3RpbmN0VW50aWxDaGFuZ2VkKCksXG4gICAgICBzaGFyZSgpLFxuICApO1xuXG4gIC8qKlxuICAgKiBFbWl0cyB0aGUgaGVhZGVyIHRoYXQgaXMgY3VycmVudGx5IGhvdmVyZWQgb3IgaG9zdGluZyBhbiBhY3RpdmUgcmVzaXplIGV2ZW50ICh3aXRoIGFjdGl2ZVxuICAgKiB0YWtpbmcgcHJlY2VkZW5jZSkuXG4gICAqL1xuICByZWFkb25seSBoZWFkZXJSb3dIb3ZlcmVkT3JBY3RpdmVEaXN0aW5jdCA9IGNvbWJpbmVMYXRlc3QoXG4gICAgICB0aGlzLmhlYWRlckNlbGxIb3ZlcmVkRGlzdGluY3QucGlwZShcbiAgICAgICAgICBtYXAoY2VsbCA9PiBfY2xvc2VzdChjZWxsLCBIRUFERVJfUk9XX1NFTEVDVE9SKSksXG4gICAgICAgICAgc3RhcnRXaXRoKG51bGwpLFxuICAgICAgICAgIGRpc3RpbmN0VW50aWxDaGFuZ2VkKCksXG4gICAgICAgKSxcbiAgICAgIHRoaXMub3ZlcmxheUhhbmRsZUFjdGl2ZUZvckNlbGwucGlwZShcbiAgICAgICAgICBtYXAoY2VsbCA9PiBfY2xvc2VzdChjZWxsLCBIRUFERVJfUk9XX1NFTEVDVE9SKSksXG4gICAgICAgICAgc3RhcnRXaXRoKG51bGwpLFxuICAgICAgICAgIGRpc3RpbmN0VW50aWxDaGFuZ2VkKCksXG4gICAgICApLFxuICApLnBpcGUoXG4gICAgICBza2lwKDEpLCAvLyBJZ25vcmUgaW5pdGlhbCBbbnVsbCwgbnVsbF0gZW1pc3Npb24uXG4gICAgICBtYXAoKFtob3ZlcmVkLCBhY3RpdmVdKSA9PiBhY3RpdmUgfHwgaG92ZXJlZCksXG4gICAgICBkaXN0aW5jdFVudGlsQ2hhbmdlZCgpLFxuICAgICAgc2hhcmUoKSxcbiAgKTtcblxuICBwcml2YXRlIHJlYWRvbmx5IF9oZWFkZXJSb3dIb3ZlcmVkT3JBY3RpdmVEaXN0aW5jdFJlZW50ZXJab25lID1cbiAgICAgIHRoaXMuaGVhZGVyUm93SG92ZXJlZE9yQWN0aXZlRGlzdGluY3QucGlwZShcbiAgICAgICAgICB0aGlzLl9lbnRlclpvbmUoKSxcbiAgICAgICAgICBzaGFyZSgpLFxuICAgICAgKTtcblxuICAvLyBPcHRpbWl6YXRpb246IFNoYXJlIHJvdyBldmVudHMgb2JzZXJ2YWJsZSB3aXRoIHN1YnNlcXVlbnQgY2FsbGVycy5cbiAgLy8gQXQgc3RhcnR1cCwgY2FsbHMgd2lsbCBiZSBzZXF1ZW50aWFsIGJ5IHJvdyAoYW5kIHR5cGljYWxseSB0aGVyZSdzIG9ubHkgb25lKS5cbiAgcHJpdmF0ZSBfbGFzdFNlZW5Sb3c6IEVsZW1lbnR8bnVsbCA9IG51bGw7XG4gIHByaXZhdGUgX2xhc3RTZWVuUm93SG92ZXI6IE9ic2VydmFibGU8Ym9vbGVhbj58bnVsbCA9IG51bGw7XG5cbiAgLyoqXG4gICAqIEVtaXRzIHdoZXRoZXIgdGhlIHNwZWNpZmllZCByb3cgc2hvdWxkIHNob3cgaXRzIG92ZXJsYXkgY29udHJvbHMuXG4gICAqIEVtaXNzaW9uIG9jY3VycyB3aXRoaW4gdGhlIE5nWm9uZS5cbiAgICovXG4gIHJlc2l6ZU92ZXJsYXlWaXNpYmxlRm9ySGVhZGVyUm93KHJvdzogRWxlbWVudCk6IE9ic2VydmFibGU8Ym9vbGVhbj4ge1xuICAgIGlmIChyb3cgIT09IHRoaXMuX2xhc3RTZWVuUm93KSB7XG4gICAgICB0aGlzLl9sYXN0U2VlblJvdyA9IHJvdztcbiAgICAgIHRoaXMuX2xhc3RTZWVuUm93SG92ZXIgPSB0aGlzLl9oZWFkZXJSb3dIb3ZlcmVkT3JBY3RpdmVEaXN0aW5jdFJlZW50ZXJab25lLnBpcGUoXG4gICAgICAgIG1hcChob3ZlcmVkUm93ID0+IGhvdmVyZWRSb3cgPT09IHJvdyksXG4gICAgICAgIGRpc3RpbmN0VW50aWxDaGFuZ2VkKCksXG4gICAgICAgIHNoYXJlKCksXG4gICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9sYXN0U2VlblJvd0hvdmVyITtcbiAgfVxuXG4gIHByaXZhdGUgX2VudGVyWm9uZTxUPigpOiBNb25vVHlwZU9wZXJhdG9yRnVuY3Rpb248VD4ge1xuICAgIHJldHVybiAoc291cmNlOiBPYnNlcnZhYmxlPFQ+KSA9PlxuICAgICAgICBuZXcgT2JzZXJ2YWJsZTxUPigob2JzZXJ2ZXIpID0+IHNvdXJjZS5zdWJzY3JpYmUoe1xuICAgICAgICAgIG5leHQ6ICh2YWx1ZSkgPT4gdGhpcy5fbmdab25lLnJ1bigoKSA9PiBvYnNlcnZlci5uZXh0KHZhbHVlKSksXG4gICAgICAgICAgZXJyb3I6IChlcnIpID0+IG9ic2VydmVyLmVycm9yKGVyciksXG4gICAgICAgICAgY29tcGxldGU6ICgpID0+IG9ic2VydmVyLmNvbXBsZXRlKClcbiAgICAgICAgfSkpO1xuICB9XG59XG4iXX0=