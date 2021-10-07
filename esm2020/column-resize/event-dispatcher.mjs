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
export class HeaderRowEventDispatcher {
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
        return (source) => new Observable((observer) => source.subscribe({
            next: (value) => this._ngZone.run(() => observer.next(value)),
            error: (err) => observer.error(err),
            complete: () => observer.complete()
        }));
    }
}
HeaderRowEventDispatcher.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.0-next.15", ngImport: i0, type: HeaderRowEventDispatcher, deps: [{ token: i0.NgZone }], target: i0.ɵɵFactoryTarget.Injectable });
HeaderRowEventDispatcher.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.0-next.15", ngImport: i0, type: HeaderRowEventDispatcher });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.0-next.15", ngImport: i0, type: HeaderRowEventDispatcher, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: i0.NgZone }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnQtZGlzcGF0Y2hlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL2NvbHVtbi1yZXNpemUvZXZlbnQtZGlzcGF0Y2hlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUNqRCxPQUFPLEVBQUMsYUFBYSxFQUE0QixVQUFVLEVBQUUsT0FBTyxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQ2xGLE9BQU8sRUFBQyxvQkFBb0IsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUVqRixPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sd0NBQXdDLENBQUM7QUFFaEUsT0FBTyxFQUFDLG1CQUFtQixFQUFDLE1BQU0sYUFBYSxDQUFDOztBQUVoRCwrREFBK0Q7QUFFL0QsTUFBTSxPQUFPLHdCQUF3QjtJQWNuQyxZQUE2QixPQUFlO1FBQWYsWUFBTyxHQUFQLE9BQU8sQ0FBUTtRQWI1Qzs7OztXQUlHO1FBQ00sc0JBQWlCLEdBQUcsSUFBSSxPQUFPLEVBQWdCLENBQUM7UUFFekQ7OztXQUdHO1FBQ00sK0JBQTBCLEdBQUcsSUFBSSxPQUFPLEVBQWdCLENBQUM7UUFJbEUsd0RBQXdEO1FBQy9DLDhCQUF5QixHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQzVELG9CQUFvQixFQUFFLEVBQ3RCLEtBQUssRUFBRSxDQUNWLENBQUM7UUFFRjs7O1dBR0c7UUFDTSxxQ0FBZ0MsR0FBRyxhQUFhLENBQUM7WUFDdEQsSUFBSSxDQUFDLHlCQUF5QixDQUFDLElBQUksQ0FDL0IsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxtQkFBbUIsQ0FBQyxDQUFDLEVBQ2hELFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFDZixvQkFBb0IsRUFBRSxDQUN4QjtZQUNGLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxJQUFJLENBQ2hDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsbUJBQW1CLENBQUMsQ0FBQyxFQUNoRCxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQ2Ysb0JBQW9CLEVBQUUsQ0FDekI7U0FDSixDQUFDLENBQUMsSUFBSSxDQUNILElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSx3Q0FBd0M7UUFDakQsR0FBRyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLEVBQUUsRUFBRSxDQUFDLE1BQU0sSUFBSSxPQUFPLENBQUMsRUFDN0Msb0JBQW9CLEVBQUUsRUFDdEIsS0FBSyxFQUFFLENBQ1YsQ0FBQztRQUVlLGlEQUE0QyxHQUN6RCxJQUFJLENBQUMsZ0NBQWdDLENBQUMsSUFBSSxDQUN0QyxJQUFJLENBQUMsVUFBVSxFQUFFLEVBQ2pCLEtBQUssRUFBRSxDQUNWLENBQUM7UUFFTixxRUFBcUU7UUFDckUsZ0ZBQWdGO1FBQ3hFLGlCQUFZLEdBQWlCLElBQUksQ0FBQztRQUNsQyxzQkFBaUIsR0FBNkIsSUFBSSxDQUFDO0lBdkNaLENBQUM7SUF5Q2hEOzs7T0FHRztJQUNILGdDQUFnQyxDQUFDLEdBQVk7UUFDM0MsSUFBSSxHQUFHLEtBQUssSUFBSSxDQUFDLFlBQVksRUFBRTtZQUM3QixJQUFJLENBQUMsWUFBWSxHQUFHLEdBQUcsQ0FBQztZQUN4QixJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDLDRDQUE0QyxDQUFDLElBQUksQ0FDN0UsR0FBRyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsVUFBVSxLQUFLLEdBQUcsQ0FBQyxFQUNyQyxvQkFBb0IsRUFBRSxFQUN0QixLQUFLLEVBQUUsQ0FDUixDQUFDO1NBQ0g7UUFFRCxPQUFPLElBQUksQ0FBQyxpQkFBa0IsQ0FBQztJQUNqQyxDQUFDO0lBRU8sVUFBVTtRQUNoQixPQUFPLENBQUMsTUFBcUIsRUFBRSxFQUFFLENBQzdCLElBQUksVUFBVSxDQUFJLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDO1lBQy9DLElBQUksRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUM3RCxLQUFLLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDO1lBQ25DLFFBQVEsRUFBRSxHQUFHLEVBQUUsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFO1NBQ3BDLENBQUMsQ0FBQyxDQUFDO0lBQ1YsQ0FBQzs7NkhBL0VVLHdCQUF3QjtpSUFBeEIsd0JBQXdCO21HQUF4Qix3QkFBd0I7a0JBRHBDLFVBQVUiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtJbmplY3RhYmxlLCBOZ1pvbmV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtjb21iaW5lTGF0ZXN0LCBNb25vVHlwZU9wZXJhdG9yRnVuY3Rpb24sIE9ic2VydmFibGUsIFN1YmplY3R9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHtkaXN0aW5jdFVudGlsQ2hhbmdlZCwgbWFwLCBzaGFyZSwgc2tpcCwgc3RhcnRXaXRofSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbmltcG9ydCB7X2Nsb3Nlc3R9IGZyb20gJ0Bhbmd1bGFyL2Nkay1leHBlcmltZW50YWwvcG9wb3Zlci1lZGl0JztcblxuaW1wb3J0IHtIRUFERVJfUk9XX1NFTEVDVE9SfSBmcm9tICcuL3NlbGVjdG9ycyc7XG5cbi8qKiBDb29yZGluYXRlcyBldmVudHMgYmV0d2VlbiB0aGUgY29sdW1uIHJlc2l6ZSBkaXJlY3RpdmVzLiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEhlYWRlclJvd0V2ZW50RGlzcGF0Y2hlciB7XG4gIC8qKlxuICAgKiBFbWl0cyB0aGUgY3VycmVudGx5IGhvdmVyZWQgaGVhZGVyIGNlbGwgb3IgbnVsbCB3aGVuIG5vIGhlYWRlciBjZWxscyBhcmUgaG92ZXJlZC5cbiAgICogRXhwb3NlZCBwdWJsaWNseSBmb3IgZXZlbnRzIHRvIGZlZWQgaW4sIGJ1dCBzdWJzY3JpYmVycyBzaG91bGQgdXNlIGhlYWRlckNlbGxIb3ZlcmVkRGlzdGluY3QsXG4gICAqIGRlZmluZWQgYmVsb3cuXG4gICAqL1xuICByZWFkb25seSBoZWFkZXJDZWxsSG92ZXJlZCA9IG5ldyBTdWJqZWN0PEVsZW1lbnR8bnVsbD4oKTtcblxuICAvKipcbiAgICogRW1pdHMgdGhlIGhlYWRlciBjZWxsIGZvciB3aGljaCBhIHVzZXItdHJpZ2dlcmVkIHJlc2l6ZSBpcyBhY3RpdmUgb3IgbnVsbFxuICAgKiB3aGVuIG5vIHJlc2l6ZSBpcyBpbiBwcm9ncmVzcy5cbiAgICovXG4gIHJlYWRvbmx5IG92ZXJsYXlIYW5kbGVBY3RpdmVGb3JDZWxsID0gbmV3IFN1YmplY3Q8RWxlbWVudHxudWxsPigpO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgX25nWm9uZTogTmdab25lKSB7fVxuXG4gIC8qKiBEaXN0aW5jdCBhbmQgc2hhcmVkIHZlcnNpb24gb2YgaGVhZGVyQ2VsbEhvdmVyZWQuICovXG4gIHJlYWRvbmx5IGhlYWRlckNlbGxIb3ZlcmVkRGlzdGluY3QgPSB0aGlzLmhlYWRlckNlbGxIb3ZlcmVkLnBpcGUoXG4gICAgICBkaXN0aW5jdFVudGlsQ2hhbmdlZCgpLFxuICAgICAgc2hhcmUoKSxcbiAgKTtcblxuICAvKipcbiAgICogRW1pdHMgdGhlIGhlYWRlciB0aGF0IGlzIGN1cnJlbnRseSBob3ZlcmVkIG9yIGhvc3RpbmcgYW4gYWN0aXZlIHJlc2l6ZSBldmVudCAod2l0aCBhY3RpdmVcbiAgICogdGFraW5nIHByZWNlZGVuY2UpLlxuICAgKi9cbiAgcmVhZG9ubHkgaGVhZGVyUm93SG92ZXJlZE9yQWN0aXZlRGlzdGluY3QgPSBjb21iaW5lTGF0ZXN0KFtcbiAgICAgIHRoaXMuaGVhZGVyQ2VsbEhvdmVyZWREaXN0aW5jdC5waXBlKFxuICAgICAgICAgIG1hcChjZWxsID0+IF9jbG9zZXN0KGNlbGwsIEhFQURFUl9ST1dfU0VMRUNUT1IpKSxcbiAgICAgICAgICBzdGFydFdpdGgobnVsbCksXG4gICAgICAgICAgZGlzdGluY3RVbnRpbENoYW5nZWQoKSxcbiAgICAgICApLFxuICAgICAgdGhpcy5vdmVybGF5SGFuZGxlQWN0aXZlRm9yQ2VsbC5waXBlKFxuICAgICAgICAgIG1hcChjZWxsID0+IF9jbG9zZXN0KGNlbGwsIEhFQURFUl9ST1dfU0VMRUNUT1IpKSxcbiAgICAgICAgICBzdGFydFdpdGgobnVsbCksXG4gICAgICAgICAgZGlzdGluY3RVbnRpbENoYW5nZWQoKSxcbiAgICAgICksXG4gIF0pLnBpcGUoXG4gICAgICBza2lwKDEpLCAvLyBJZ25vcmUgaW5pdGlhbCBbbnVsbCwgbnVsbF0gZW1pc3Npb24uXG4gICAgICBtYXAoKFtob3ZlcmVkLCBhY3RpdmVdKSA9PiBhY3RpdmUgfHwgaG92ZXJlZCksXG4gICAgICBkaXN0aW5jdFVudGlsQ2hhbmdlZCgpLFxuICAgICAgc2hhcmUoKSxcbiAgKTtcblxuICBwcml2YXRlIHJlYWRvbmx5IF9oZWFkZXJSb3dIb3ZlcmVkT3JBY3RpdmVEaXN0aW5jdFJlZW50ZXJab25lID1cbiAgICAgIHRoaXMuaGVhZGVyUm93SG92ZXJlZE9yQWN0aXZlRGlzdGluY3QucGlwZShcbiAgICAgICAgICB0aGlzLl9lbnRlclpvbmUoKSxcbiAgICAgICAgICBzaGFyZSgpLFxuICAgICAgKTtcblxuICAvLyBPcHRpbWl6YXRpb246IFNoYXJlIHJvdyBldmVudHMgb2JzZXJ2YWJsZSB3aXRoIHN1YnNlcXVlbnQgY2FsbGVycy5cbiAgLy8gQXQgc3RhcnR1cCwgY2FsbHMgd2lsbCBiZSBzZXF1ZW50aWFsIGJ5IHJvdyAoYW5kIHR5cGljYWxseSB0aGVyZSdzIG9ubHkgb25lKS5cbiAgcHJpdmF0ZSBfbGFzdFNlZW5Sb3c6IEVsZW1lbnR8bnVsbCA9IG51bGw7XG4gIHByaXZhdGUgX2xhc3RTZWVuUm93SG92ZXI6IE9ic2VydmFibGU8Ym9vbGVhbj58bnVsbCA9IG51bGw7XG5cbiAgLyoqXG4gICAqIEVtaXRzIHdoZXRoZXIgdGhlIHNwZWNpZmllZCByb3cgc2hvdWxkIHNob3cgaXRzIG92ZXJsYXkgY29udHJvbHMuXG4gICAqIEVtaXNzaW9uIG9jY3VycyB3aXRoaW4gdGhlIE5nWm9uZS5cbiAgICovXG4gIHJlc2l6ZU92ZXJsYXlWaXNpYmxlRm9ySGVhZGVyUm93KHJvdzogRWxlbWVudCk6IE9ic2VydmFibGU8Ym9vbGVhbj4ge1xuICAgIGlmIChyb3cgIT09IHRoaXMuX2xhc3RTZWVuUm93KSB7XG4gICAgICB0aGlzLl9sYXN0U2VlblJvdyA9IHJvdztcbiAgICAgIHRoaXMuX2xhc3RTZWVuUm93SG92ZXIgPSB0aGlzLl9oZWFkZXJSb3dIb3ZlcmVkT3JBY3RpdmVEaXN0aW5jdFJlZW50ZXJab25lLnBpcGUoXG4gICAgICAgIG1hcChob3ZlcmVkUm93ID0+IGhvdmVyZWRSb3cgPT09IHJvdyksXG4gICAgICAgIGRpc3RpbmN0VW50aWxDaGFuZ2VkKCksXG4gICAgICAgIHNoYXJlKCksXG4gICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9sYXN0U2VlblJvd0hvdmVyITtcbiAgfVxuXG4gIHByaXZhdGUgX2VudGVyWm9uZTxUPigpOiBNb25vVHlwZU9wZXJhdG9yRnVuY3Rpb248VD4ge1xuICAgIHJldHVybiAoc291cmNlOiBPYnNlcnZhYmxlPFQ+KSA9PlxuICAgICAgICBuZXcgT2JzZXJ2YWJsZTxUPigob2JzZXJ2ZXIpID0+IHNvdXJjZS5zdWJzY3JpYmUoe1xuICAgICAgICAgIG5leHQ6ICh2YWx1ZSkgPT4gdGhpcy5fbmdab25lLnJ1bigoKSA9PiBvYnNlcnZlci5uZXh0KHZhbHVlKSksXG4gICAgICAgICAgZXJyb3I6IChlcnIpID0+IG9ic2VydmVyLmVycm9yKGVyciksXG4gICAgICAgICAgY29tcGxldGU6ICgpID0+IG9ic2VydmVyLmNvbXBsZXRlKClcbiAgICAgICAgfSkpO1xuICB9XG59XG4iXX0=