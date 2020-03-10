/**
 * @fileoverview added by tsickle
 * Generated from: src/cdk-experimental/column-resize/event-dispatcher.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
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
/**
 * Coordinates events between the column resize directives.
 */
export class HeaderRowEventDispatcher {
    /**
     * @param {?} _ngZone
     */
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
        /**
         * Distinct and shared version of headerCellHovered.
         */
        this.headerCellHoveredDistinct = this.headerCellHovered.pipe(distinctUntilChanged(), share());
        /**
         * Emits the header that is currently hovered or hosting an active resize event (with active
         * taking precedence).
         */
        this.headerRowHoveredOrActiveDistinct = combineLatest(this.headerCellHoveredDistinct.pipe(map((/**
         * @param {?} cell
         * @return {?}
         */
        cell => _closest(cell, HEADER_ROW_SELECTOR))), startWith(null), distinctUntilChanged()), this.overlayHandleActiveForCell.pipe(map((/**
         * @param {?} cell
         * @return {?}
         */
        cell => _closest(cell, HEADER_ROW_SELECTOR))), startWith(null), distinctUntilChanged())).pipe(skip(1), // Ignore initial [null, null] emission.
        map((/**
         * @param {?} __0
         * @return {?}
         */
        ([hovered, active]) => active || hovered)), distinctUntilChanged(), share());
        this._headerRowHoveredOrActiveDistinctReenterZone = this.headerRowHoveredOrActiveDistinct.pipe(this._enterZone(), share());
        // Optimization: Share row events observable with subsequent callers.
        // At startup, calls will be sequential by row (and typically there's only one).
        this._lastSeenRow = null;
        this._lastSeenRowHover = null;
    }
    /**
     * Emits whether the specified row should show its overlay controls.
     * Emission occurs within the NgZone.
     * @param {?} row
     * @return {?}
     */
    resizeOverlayVisibleForHeaderRow(row) {
        if (row !== this._lastSeenRow) {
            this._lastSeenRow = row;
            this._lastSeenRowHover = this._headerRowHoveredOrActiveDistinctReenterZone.pipe(map((/**
             * @param {?} hoveredRow
             * @return {?}
             */
            hoveredRow => hoveredRow === row)), distinctUntilChanged(), share());
        }
        return (/** @type {?} */ (this._lastSeenRowHover));
    }
    /**
     * @private
     * @template T
     * @return {?}
     */
    _enterZone() {
        return (/**
         * @param {?} source
         * @return {?}
         */
        (source) => new Observable((/**
         * @param {?} observer
         * @return {?}
         */
        (observer) => source.subscribe({
            next: (/**
             * @param {?} value
             * @return {?}
             */
            (value) => this._ngZone.run((/**
             * @return {?}
             */
            () => observer.next(value)))),
            error: (/**
             * @param {?} err
             * @return {?}
             */
            (err) => observer.error(err)),
            complete: (/**
             * @return {?}
             */
            () => observer.complete())
        }))));
    }
}
HeaderRowEventDispatcher.decorators = [
    { type: Injectable }
];
/** @nocollapse */
HeaderRowEventDispatcher.ctorParameters = () => [
    { type: NgZone }
];
if (false) {
    /**
     * Emits the currently hovered header cell or null when no header cells are hovered.
     * Exposed publicly for events to feed in, but subscribers should use headerCellHoveredDistinct,
     * defined below.
     * @type {?}
     */
    HeaderRowEventDispatcher.prototype.headerCellHovered;
    /**
     * Emits the header cell for which a user-triggered resize is active or null
     * when no resize is in progress.
     * @type {?}
     */
    HeaderRowEventDispatcher.prototype.overlayHandleActiveForCell;
    /**
     * Distinct and shared version of headerCellHovered.
     * @type {?}
     */
    HeaderRowEventDispatcher.prototype.headerCellHoveredDistinct;
    /**
     * Emits the header that is currently hovered or hosting an active resize event (with active
     * taking precedence).
     * @type {?}
     */
    HeaderRowEventDispatcher.prototype.headerRowHoveredOrActiveDistinct;
    /**
     * @type {?}
     * @private
     */
    HeaderRowEventDispatcher.prototype._headerRowHoveredOrActiveDistinctReenterZone;
    /**
     * @type {?}
     * @private
     */
    HeaderRowEventDispatcher.prototype._lastSeenRow;
    /**
     * @type {?}
     * @private
     */
    HeaderRowEventDispatcher.prototype._lastSeenRowHover;
    /**
     * @type {?}
     * @private
     */
    HeaderRowEventDispatcher.prototype._ngZone;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnQtZGlzcGF0Y2hlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL2NvbHVtbi1yZXNpemUvZXZlbnQtZGlzcGF0Y2hlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFRQSxPQUFPLEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUNqRCxPQUFPLEVBQUMsYUFBYSxFQUE0QixVQUFVLEVBQUUsT0FBTyxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQ2xGLE9BQU8sRUFBQyxvQkFBb0IsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUVqRixPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sd0NBQXdDLENBQUM7QUFFaEUsT0FBTyxFQUFDLG1CQUFtQixFQUFDLE1BQU0sYUFBYSxDQUFDOzs7O0FBSWhELE1BQU0sT0FBTyx3QkFBd0I7Ozs7SUFjbkMsWUFBNkIsT0FBZTtRQUFmLFlBQU8sR0FBUCxPQUFPLENBQVE7Ozs7OztRQVJuQyxzQkFBaUIsR0FBRyxJQUFJLE9BQU8sRUFBZ0IsQ0FBQzs7Ozs7UUFNaEQsK0JBQTBCLEdBQUcsSUFBSSxPQUFPLEVBQWdCLENBQUM7Ozs7UUFLekQsOEJBQXlCLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FDNUQsb0JBQW9CLEVBQUUsRUFDdEIsS0FBSyxFQUFFLENBQ1YsQ0FBQzs7Ozs7UUFNTyxxQ0FBZ0MsR0FBRyxhQUFhLENBQ3JELElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxJQUFJLENBQy9CLEdBQUc7Ozs7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsbUJBQW1CLENBQUMsRUFBQyxFQUNoRCxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQ2Ysb0JBQW9CLEVBQUUsQ0FDeEIsRUFDRixJQUFJLENBQUMsMEJBQTBCLENBQUMsSUFBSSxDQUNoQyxHQUFHOzs7O1FBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLG1CQUFtQixDQUFDLEVBQUMsRUFDaEQsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUNmLG9CQUFvQixFQUFFLENBQ3pCLENBQ0osQ0FBQyxJQUFJLENBQ0YsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLHdDQUF3QztRQUNqRCxHQUFHOzs7O1FBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsRUFBRSxFQUFFLENBQUMsTUFBTSxJQUFJLE9BQU8sRUFBQyxFQUM3QyxvQkFBb0IsRUFBRSxFQUN0QixLQUFLLEVBQUUsQ0FDVixDQUFDO1FBRWUsaURBQTRDLEdBQ3pELElBQUksQ0FBQyxnQ0FBZ0MsQ0FBQyxJQUFJLENBQ3RDLElBQUksQ0FBQyxVQUFVLEVBQUUsRUFDakIsS0FBSyxFQUFFLENBQ1YsQ0FBQzs7O1FBSUUsaUJBQVksR0FBaUIsSUFBSSxDQUFDO1FBQ2xDLHNCQUFpQixHQUE2QixJQUFJLENBQUM7SUF2Q1osQ0FBQzs7Ozs7OztJQTZDaEQsZ0NBQWdDLENBQUMsR0FBWTtRQUMzQyxJQUFJLEdBQUcsS0FBSyxJQUFJLENBQUMsWUFBWSxFQUFFO1lBQzdCLElBQUksQ0FBQyxZQUFZLEdBQUcsR0FBRyxDQUFDO1lBQ3hCLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUMsNENBQTRDLENBQUMsSUFBSSxDQUM3RSxHQUFHOzs7O1lBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxVQUFVLEtBQUssR0FBRyxFQUFDLEVBQ3JDLG9CQUFvQixFQUFFLEVBQ3RCLEtBQUssRUFBRSxDQUNSLENBQUM7U0FDSDtRQUVELE9BQU8sbUJBQUEsSUFBSSxDQUFDLGlCQUFpQixFQUFDLENBQUM7SUFDakMsQ0FBQzs7Ozs7O0lBRU8sVUFBVTtRQUNoQjs7OztRQUFPLENBQUMsTUFBcUIsRUFBRSxFQUFFLENBQzdCLElBQUksVUFBVTs7OztRQUFJLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDO1lBQy9DLElBQUk7Ozs7WUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHOzs7WUFBQyxHQUFHLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFDLENBQUE7WUFDN0QsS0FBSzs7OztZQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1lBQ25DLFFBQVE7OztZQUFFLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQTtTQUNwQyxDQUFDLEVBQUMsRUFBQztJQUNWLENBQUM7OztZQWhGRixVQUFVOzs7O1lBVFMsTUFBTTs7Ozs7Ozs7O0lBZ0J4QixxREFBeUQ7Ozs7OztJQU16RCw4REFBa0U7Ozs7O0lBS2xFLDZEQUdFOzs7Ozs7SUFNRixvRUFnQkU7Ozs7O0lBRUYsZ0ZBSU07Ozs7O0lBSU4sZ0RBQTBDOzs7OztJQUMxQyxxREFBMkQ7Ozs7O0lBdkMvQywyQ0FBZ0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtJbmplY3RhYmxlLCBOZ1pvbmV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtjb21iaW5lTGF0ZXN0LCBNb25vVHlwZU9wZXJhdG9yRnVuY3Rpb24sIE9ic2VydmFibGUsIFN1YmplY3R9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHtkaXN0aW5jdFVudGlsQ2hhbmdlZCwgbWFwLCBzaGFyZSwgc2tpcCwgc3RhcnRXaXRofSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbmltcG9ydCB7X2Nsb3Nlc3R9IGZyb20gJ0Bhbmd1bGFyL2Nkay1leHBlcmltZW50YWwvcG9wb3Zlci1lZGl0JztcblxuaW1wb3J0IHtIRUFERVJfUk9XX1NFTEVDVE9SfSBmcm9tICcuL3NlbGVjdG9ycyc7XG5cbi8qKiBDb29yZGluYXRlcyBldmVudHMgYmV0d2VlbiB0aGUgY29sdW1uIHJlc2l6ZSBkaXJlY3RpdmVzLiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEhlYWRlclJvd0V2ZW50RGlzcGF0Y2hlciB7XG4gIC8qKlxuICAgKiBFbWl0cyB0aGUgY3VycmVudGx5IGhvdmVyZWQgaGVhZGVyIGNlbGwgb3IgbnVsbCB3aGVuIG5vIGhlYWRlciBjZWxscyBhcmUgaG92ZXJlZC5cbiAgICogRXhwb3NlZCBwdWJsaWNseSBmb3IgZXZlbnRzIHRvIGZlZWQgaW4sIGJ1dCBzdWJzY3JpYmVycyBzaG91bGQgdXNlIGhlYWRlckNlbGxIb3ZlcmVkRGlzdGluY3QsXG4gICAqIGRlZmluZWQgYmVsb3cuXG4gICAqL1xuICByZWFkb25seSBoZWFkZXJDZWxsSG92ZXJlZCA9IG5ldyBTdWJqZWN0PEVsZW1lbnR8bnVsbD4oKTtcblxuICAvKipcbiAgICogRW1pdHMgdGhlIGhlYWRlciBjZWxsIGZvciB3aGljaCBhIHVzZXItdHJpZ2dlcmVkIHJlc2l6ZSBpcyBhY3RpdmUgb3IgbnVsbFxuICAgKiB3aGVuIG5vIHJlc2l6ZSBpcyBpbiBwcm9ncmVzcy5cbiAgICovXG4gIHJlYWRvbmx5IG92ZXJsYXlIYW5kbGVBY3RpdmVGb3JDZWxsID0gbmV3IFN1YmplY3Q8RWxlbWVudHxudWxsPigpO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgX25nWm9uZTogTmdab25lKSB7fVxuXG4gIC8qKiBEaXN0aW5jdCBhbmQgc2hhcmVkIHZlcnNpb24gb2YgaGVhZGVyQ2VsbEhvdmVyZWQuICovXG4gIHJlYWRvbmx5IGhlYWRlckNlbGxIb3ZlcmVkRGlzdGluY3QgPSB0aGlzLmhlYWRlckNlbGxIb3ZlcmVkLnBpcGUoXG4gICAgICBkaXN0aW5jdFVudGlsQ2hhbmdlZCgpLFxuICAgICAgc2hhcmUoKSxcbiAgKTtcblxuICAvKipcbiAgICogRW1pdHMgdGhlIGhlYWRlciB0aGF0IGlzIGN1cnJlbnRseSBob3ZlcmVkIG9yIGhvc3RpbmcgYW4gYWN0aXZlIHJlc2l6ZSBldmVudCAod2l0aCBhY3RpdmVcbiAgICogdGFraW5nIHByZWNlZGVuY2UpLlxuICAgKi9cbiAgcmVhZG9ubHkgaGVhZGVyUm93SG92ZXJlZE9yQWN0aXZlRGlzdGluY3QgPSBjb21iaW5lTGF0ZXN0KFxuICAgICAgdGhpcy5oZWFkZXJDZWxsSG92ZXJlZERpc3RpbmN0LnBpcGUoXG4gICAgICAgICAgbWFwKGNlbGwgPT4gX2Nsb3Nlc3QoY2VsbCwgSEVBREVSX1JPV19TRUxFQ1RPUikpLFxuICAgICAgICAgIHN0YXJ0V2l0aChudWxsKSxcbiAgICAgICAgICBkaXN0aW5jdFVudGlsQ2hhbmdlZCgpLFxuICAgICAgICksXG4gICAgICB0aGlzLm92ZXJsYXlIYW5kbGVBY3RpdmVGb3JDZWxsLnBpcGUoXG4gICAgICAgICAgbWFwKGNlbGwgPT4gX2Nsb3Nlc3QoY2VsbCwgSEVBREVSX1JPV19TRUxFQ1RPUikpLFxuICAgICAgICAgIHN0YXJ0V2l0aChudWxsKSxcbiAgICAgICAgICBkaXN0aW5jdFVudGlsQ2hhbmdlZCgpLFxuICAgICAgKSxcbiAgKS5waXBlKFxuICAgICAgc2tpcCgxKSwgLy8gSWdub3JlIGluaXRpYWwgW251bGwsIG51bGxdIGVtaXNzaW9uLlxuICAgICAgbWFwKChbaG92ZXJlZCwgYWN0aXZlXSkgPT4gYWN0aXZlIHx8IGhvdmVyZWQpLFxuICAgICAgZGlzdGluY3RVbnRpbENoYW5nZWQoKSxcbiAgICAgIHNoYXJlKCksXG4gICk7XG5cbiAgcHJpdmF0ZSByZWFkb25seSBfaGVhZGVyUm93SG92ZXJlZE9yQWN0aXZlRGlzdGluY3RSZWVudGVyWm9uZSA9XG4gICAgICB0aGlzLmhlYWRlclJvd0hvdmVyZWRPckFjdGl2ZURpc3RpbmN0LnBpcGUoXG4gICAgICAgICAgdGhpcy5fZW50ZXJab25lKCksXG4gICAgICAgICAgc2hhcmUoKSxcbiAgICAgICk7XG5cbiAgLy8gT3B0aW1pemF0aW9uOiBTaGFyZSByb3cgZXZlbnRzIG9ic2VydmFibGUgd2l0aCBzdWJzZXF1ZW50IGNhbGxlcnMuXG4gIC8vIEF0IHN0YXJ0dXAsIGNhbGxzIHdpbGwgYmUgc2VxdWVudGlhbCBieSByb3cgKGFuZCB0eXBpY2FsbHkgdGhlcmUncyBvbmx5IG9uZSkuXG4gIHByaXZhdGUgX2xhc3RTZWVuUm93OiBFbGVtZW50fG51bGwgPSBudWxsO1xuICBwcml2YXRlIF9sYXN0U2VlblJvd0hvdmVyOiBPYnNlcnZhYmxlPGJvb2xlYW4+fG51bGwgPSBudWxsO1xuXG4gIC8qKlxuICAgKiBFbWl0cyB3aGV0aGVyIHRoZSBzcGVjaWZpZWQgcm93IHNob3VsZCBzaG93IGl0cyBvdmVybGF5IGNvbnRyb2xzLlxuICAgKiBFbWlzc2lvbiBvY2N1cnMgd2l0aGluIHRoZSBOZ1pvbmUuXG4gICAqL1xuICByZXNpemVPdmVybGF5VmlzaWJsZUZvckhlYWRlclJvdyhyb3c6IEVsZW1lbnQpOiBPYnNlcnZhYmxlPGJvb2xlYW4+IHtcbiAgICBpZiAocm93ICE9PSB0aGlzLl9sYXN0U2VlblJvdykge1xuICAgICAgdGhpcy5fbGFzdFNlZW5Sb3cgPSByb3c7XG4gICAgICB0aGlzLl9sYXN0U2VlblJvd0hvdmVyID0gdGhpcy5faGVhZGVyUm93SG92ZXJlZE9yQWN0aXZlRGlzdGluY3RSZWVudGVyWm9uZS5waXBlKFxuICAgICAgICBtYXAoaG92ZXJlZFJvdyA9PiBob3ZlcmVkUm93ID09PSByb3cpLFxuICAgICAgICBkaXN0aW5jdFVudGlsQ2hhbmdlZCgpLFxuICAgICAgICBzaGFyZSgpLFxuICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fbGFzdFNlZW5Sb3dIb3ZlciE7XG4gIH1cblxuICBwcml2YXRlIF9lbnRlclpvbmU8VD4oKTogTW9ub1R5cGVPcGVyYXRvckZ1bmN0aW9uPFQ+IHtcbiAgICByZXR1cm4gKHNvdXJjZTogT2JzZXJ2YWJsZTxUPikgPT5cbiAgICAgICAgbmV3IE9ic2VydmFibGU8VD4oKG9ic2VydmVyKSA9PiBzb3VyY2Uuc3Vic2NyaWJlKHtcbiAgICAgICAgICBuZXh0OiAodmFsdWUpID0+IHRoaXMuX25nWm9uZS5ydW4oKCkgPT4gb2JzZXJ2ZXIubmV4dCh2YWx1ZSkpLFxuICAgICAgICAgIGVycm9yOiAoZXJyKSA9PiBvYnNlcnZlci5lcnJvcihlcnIpLFxuICAgICAgICAgIGNvbXBsZXRlOiAoKSA9PiBvYnNlcnZlci5jb21wbGV0ZSgpXG4gICAgICAgIH0pKTtcbiAgfVxufVxuIl19