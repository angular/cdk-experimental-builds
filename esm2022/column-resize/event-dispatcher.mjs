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
import * as i0 from "@angular/core";
/** Coordinates events between the column resize directives. */
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
        this.headerRowHoveredOrActiveDistinct = combineLatest([
            this.headerCellHoveredDistinct.pipe(map(cell => _closest(cell, HEADER_ROW_SELECTOR)), startWith(null), distinctUntilChanged()),
            this.overlayHandleActiveForCell.pipe(map(cell => _closest(cell, HEADER_ROW_SELECTOR)), startWith(null), distinctUntilChanged()),
        ]).pipe(skip(1), // Ignore initial [null, null] emission.
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
        return (source) => new Observable(observer => source.subscribe({
            next: value => this._ngZone.run(() => observer.next(value)),
            error: err => observer.error(err),
            complete: () => observer.complete(),
        }));
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.0.0", ngImport: i0, type: HeaderRowEventDispatcher, deps: [{ token: i0.NgZone }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "16.0.0", ngImport: i0, type: HeaderRowEventDispatcher }); }
}
export { HeaderRowEventDispatcher };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.0.0", ngImport: i0, type: HeaderRowEventDispatcher, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: i0.NgZone }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnQtZGlzcGF0Y2hlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL2NvbHVtbi1yZXNpemUvZXZlbnQtZGlzcGF0Y2hlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUNqRCxPQUFPLEVBQUMsYUFBYSxFQUE0QixVQUFVLEVBQUUsT0FBTyxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQ2xGLE9BQU8sRUFBQyxvQkFBb0IsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUVqRixPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sd0NBQXdDLENBQUM7QUFFaEUsT0FBTyxFQUFDLG1CQUFtQixFQUFDLE1BQU0sYUFBYSxDQUFDOztBQUVoRCwrREFBK0Q7QUFDL0QsTUFDYSx3QkFBd0I7SUFjbkMsWUFBNkIsT0FBZTtRQUFmLFlBQU8sR0FBUCxPQUFPLENBQVE7UUFiNUM7Ozs7V0FJRztRQUNNLHNCQUFpQixHQUFHLElBQUksT0FBTyxFQUFrQixDQUFDO1FBRTNEOzs7V0FHRztRQUNNLCtCQUEwQixHQUFHLElBQUksT0FBTyxFQUFrQixDQUFDO1FBSXBFLHdEQUF3RDtRQUMvQyw4QkFBeUIsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLG9CQUFvQixFQUFFLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUVsRzs7O1dBR0c7UUFDTSxxQ0FBZ0MsR0FBRyxhQUFhLENBQUM7WUFDeEQsSUFBSSxDQUFDLHlCQUF5QixDQUFDLElBQUksQ0FDakMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxtQkFBbUIsQ0FBQyxDQUFDLEVBQ2hELFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFDZixvQkFBb0IsRUFBRSxDQUN2QjtZQUNELElBQUksQ0FBQywwQkFBMEIsQ0FBQyxJQUFJLENBQ2xDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsbUJBQW1CLENBQUMsQ0FBQyxFQUNoRCxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQ2Ysb0JBQW9CLEVBQUUsQ0FDdkI7U0FDRixDQUFDLENBQUMsSUFBSSxDQUNMLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSx3Q0FBd0M7UUFDakQsR0FBRyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLEVBQUUsRUFBRSxDQUFDLE1BQU0sSUFBSSxPQUFPLENBQUMsRUFDN0Msb0JBQW9CLEVBQUUsRUFDdEIsS0FBSyxFQUFFLENBQ1IsQ0FBQztRQUVlLGlEQUE0QyxHQUMzRCxJQUFJLENBQUMsZ0NBQWdDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBRXpFLHFFQUFxRTtRQUNyRSxnRkFBZ0Y7UUFDeEUsaUJBQVksR0FBbUIsSUFBSSxDQUFDO1FBQ3BDLHNCQUFpQixHQUErQixJQUFJLENBQUM7SUFqQ2QsQ0FBQztJQW1DaEQ7OztPQUdHO0lBQ0gsZ0NBQWdDLENBQUMsR0FBWTtRQUMzQyxJQUFJLEdBQUcsS0FBSyxJQUFJLENBQUMsWUFBWSxFQUFFO1lBQzdCLElBQUksQ0FBQyxZQUFZLEdBQUcsR0FBRyxDQUFDO1lBQ3hCLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUMsNENBQTRDLENBQUMsSUFBSSxDQUM3RSxHQUFHLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxVQUFVLEtBQUssR0FBRyxDQUFDLEVBQ3JDLG9CQUFvQixFQUFFLEVBQ3RCLEtBQUssRUFBRSxDQUNSLENBQUM7U0FDSDtRQUVELE9BQU8sSUFBSSxDQUFDLGlCQUFrQixDQUFDO0lBQ2pDLENBQUM7SUFFTyxVQUFVO1FBQ2hCLE9BQU8sQ0FBQyxNQUFxQixFQUFFLEVBQUUsQ0FDL0IsSUFBSSxVQUFVLENBQUksUUFBUSxDQUFDLEVBQUUsQ0FDM0IsTUFBTSxDQUFDLFNBQVMsQ0FBQztZQUNmLElBQUksRUFBRSxLQUFLLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDM0QsS0FBSyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUM7WUFDakMsUUFBUSxFQUFFLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUU7U0FDcEMsQ0FBQyxDQUNILENBQUM7SUFDTixDQUFDOzhHQTNFVSx3QkFBd0I7a0hBQXhCLHdCQUF3Qjs7U0FBeEIsd0JBQXdCOzJGQUF4Qix3QkFBd0I7a0JBRHBDLFVBQVUiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtJbmplY3RhYmxlLCBOZ1pvbmV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtjb21iaW5lTGF0ZXN0LCBNb25vVHlwZU9wZXJhdG9yRnVuY3Rpb24sIE9ic2VydmFibGUsIFN1YmplY3R9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHtkaXN0aW5jdFVudGlsQ2hhbmdlZCwgbWFwLCBzaGFyZSwgc2tpcCwgc3RhcnRXaXRofSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbmltcG9ydCB7X2Nsb3Nlc3R9IGZyb20gJ0Bhbmd1bGFyL2Nkay1leHBlcmltZW50YWwvcG9wb3Zlci1lZGl0JztcblxuaW1wb3J0IHtIRUFERVJfUk9XX1NFTEVDVE9SfSBmcm9tICcuL3NlbGVjdG9ycyc7XG5cbi8qKiBDb29yZGluYXRlcyBldmVudHMgYmV0d2VlbiB0aGUgY29sdW1uIHJlc2l6ZSBkaXJlY3RpdmVzLiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEhlYWRlclJvd0V2ZW50RGlzcGF0Y2hlciB7XG4gIC8qKlxuICAgKiBFbWl0cyB0aGUgY3VycmVudGx5IGhvdmVyZWQgaGVhZGVyIGNlbGwgb3IgbnVsbCB3aGVuIG5vIGhlYWRlciBjZWxscyBhcmUgaG92ZXJlZC5cbiAgICogRXhwb3NlZCBwdWJsaWNseSBmb3IgZXZlbnRzIHRvIGZlZWQgaW4sIGJ1dCBzdWJzY3JpYmVycyBzaG91bGQgdXNlIGhlYWRlckNlbGxIb3ZlcmVkRGlzdGluY3QsXG4gICAqIGRlZmluZWQgYmVsb3cuXG4gICAqL1xuICByZWFkb25seSBoZWFkZXJDZWxsSG92ZXJlZCA9IG5ldyBTdWJqZWN0PEVsZW1lbnQgfCBudWxsPigpO1xuXG4gIC8qKlxuICAgKiBFbWl0cyB0aGUgaGVhZGVyIGNlbGwgZm9yIHdoaWNoIGEgdXNlci10cmlnZ2VyZWQgcmVzaXplIGlzIGFjdGl2ZSBvciBudWxsXG4gICAqIHdoZW4gbm8gcmVzaXplIGlzIGluIHByb2dyZXNzLlxuICAgKi9cbiAgcmVhZG9ubHkgb3ZlcmxheUhhbmRsZUFjdGl2ZUZvckNlbGwgPSBuZXcgU3ViamVjdDxFbGVtZW50IHwgbnVsbD4oKTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHJlYWRvbmx5IF9uZ1pvbmU6IE5nWm9uZSkge31cblxuICAvKiogRGlzdGluY3QgYW5kIHNoYXJlZCB2ZXJzaW9uIG9mIGhlYWRlckNlbGxIb3ZlcmVkLiAqL1xuICByZWFkb25seSBoZWFkZXJDZWxsSG92ZXJlZERpc3RpbmN0ID0gdGhpcy5oZWFkZXJDZWxsSG92ZXJlZC5waXBlKGRpc3RpbmN0VW50aWxDaGFuZ2VkKCksIHNoYXJlKCkpO1xuXG4gIC8qKlxuICAgKiBFbWl0cyB0aGUgaGVhZGVyIHRoYXQgaXMgY3VycmVudGx5IGhvdmVyZWQgb3IgaG9zdGluZyBhbiBhY3RpdmUgcmVzaXplIGV2ZW50ICh3aXRoIGFjdGl2ZVxuICAgKiB0YWtpbmcgcHJlY2VkZW5jZSkuXG4gICAqL1xuICByZWFkb25seSBoZWFkZXJSb3dIb3ZlcmVkT3JBY3RpdmVEaXN0aW5jdCA9IGNvbWJpbmVMYXRlc3QoW1xuICAgIHRoaXMuaGVhZGVyQ2VsbEhvdmVyZWREaXN0aW5jdC5waXBlKFxuICAgICAgbWFwKGNlbGwgPT4gX2Nsb3Nlc3QoY2VsbCwgSEVBREVSX1JPV19TRUxFQ1RPUikpLFxuICAgICAgc3RhcnRXaXRoKG51bGwpLFxuICAgICAgZGlzdGluY3RVbnRpbENoYW5nZWQoKSxcbiAgICApLFxuICAgIHRoaXMub3ZlcmxheUhhbmRsZUFjdGl2ZUZvckNlbGwucGlwZShcbiAgICAgIG1hcChjZWxsID0+IF9jbG9zZXN0KGNlbGwsIEhFQURFUl9ST1dfU0VMRUNUT1IpKSxcbiAgICAgIHN0YXJ0V2l0aChudWxsKSxcbiAgICAgIGRpc3RpbmN0VW50aWxDaGFuZ2VkKCksXG4gICAgKSxcbiAgXSkucGlwZShcbiAgICBza2lwKDEpLCAvLyBJZ25vcmUgaW5pdGlhbCBbbnVsbCwgbnVsbF0gZW1pc3Npb24uXG4gICAgbWFwKChbaG92ZXJlZCwgYWN0aXZlXSkgPT4gYWN0aXZlIHx8IGhvdmVyZWQpLFxuICAgIGRpc3RpbmN0VW50aWxDaGFuZ2VkKCksXG4gICAgc2hhcmUoKSxcbiAgKTtcblxuICBwcml2YXRlIHJlYWRvbmx5IF9oZWFkZXJSb3dIb3ZlcmVkT3JBY3RpdmVEaXN0aW5jdFJlZW50ZXJab25lID1cbiAgICB0aGlzLmhlYWRlclJvd0hvdmVyZWRPckFjdGl2ZURpc3RpbmN0LnBpcGUodGhpcy5fZW50ZXJab25lKCksIHNoYXJlKCkpO1xuXG4gIC8vIE9wdGltaXphdGlvbjogU2hhcmUgcm93IGV2ZW50cyBvYnNlcnZhYmxlIHdpdGggc3Vic2VxdWVudCBjYWxsZXJzLlxuICAvLyBBdCBzdGFydHVwLCBjYWxscyB3aWxsIGJlIHNlcXVlbnRpYWwgYnkgcm93IChhbmQgdHlwaWNhbGx5IHRoZXJlJ3Mgb25seSBvbmUpLlxuICBwcml2YXRlIF9sYXN0U2VlblJvdzogRWxlbWVudCB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIF9sYXN0U2VlblJvd0hvdmVyOiBPYnNlcnZhYmxlPGJvb2xlYW4+IHwgbnVsbCA9IG51bGw7XG5cbiAgLyoqXG4gICAqIEVtaXRzIHdoZXRoZXIgdGhlIHNwZWNpZmllZCByb3cgc2hvdWxkIHNob3cgaXRzIG92ZXJsYXkgY29udHJvbHMuXG4gICAqIEVtaXNzaW9uIG9jY3VycyB3aXRoaW4gdGhlIE5nWm9uZS5cbiAgICovXG4gIHJlc2l6ZU92ZXJsYXlWaXNpYmxlRm9ySGVhZGVyUm93KHJvdzogRWxlbWVudCk6IE9ic2VydmFibGU8Ym9vbGVhbj4ge1xuICAgIGlmIChyb3cgIT09IHRoaXMuX2xhc3RTZWVuUm93KSB7XG4gICAgICB0aGlzLl9sYXN0U2VlblJvdyA9IHJvdztcbiAgICAgIHRoaXMuX2xhc3RTZWVuUm93SG92ZXIgPSB0aGlzLl9oZWFkZXJSb3dIb3ZlcmVkT3JBY3RpdmVEaXN0aW5jdFJlZW50ZXJab25lLnBpcGUoXG4gICAgICAgIG1hcChob3ZlcmVkUm93ID0+IGhvdmVyZWRSb3cgPT09IHJvdyksXG4gICAgICAgIGRpc3RpbmN0VW50aWxDaGFuZ2VkKCksXG4gICAgICAgIHNoYXJlKCksXG4gICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9sYXN0U2VlblJvd0hvdmVyITtcbiAgfVxuXG4gIHByaXZhdGUgX2VudGVyWm9uZTxUPigpOiBNb25vVHlwZU9wZXJhdG9yRnVuY3Rpb248VD4ge1xuICAgIHJldHVybiAoc291cmNlOiBPYnNlcnZhYmxlPFQ+KSA9PlxuICAgICAgbmV3IE9ic2VydmFibGU8VD4ob2JzZXJ2ZXIgPT5cbiAgICAgICAgc291cmNlLnN1YnNjcmliZSh7XG4gICAgICAgICAgbmV4dDogdmFsdWUgPT4gdGhpcy5fbmdab25lLnJ1bigoKSA9PiBvYnNlcnZlci5uZXh0KHZhbHVlKSksXG4gICAgICAgICAgZXJyb3I6IGVyciA9PiBvYnNlcnZlci5lcnJvcihlcnIpLFxuICAgICAgICAgIGNvbXBsZXRlOiAoKSA9PiBvYnNlcnZlci5jb21wbGV0ZSgpLFxuICAgICAgICB9KSxcbiAgICAgICk7XG4gIH1cbn1cbiJdfQ==