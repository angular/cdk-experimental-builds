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
        return (source) => new Observable(observer => source.subscribe({
            next: value => this._ngZone.run(() => observer.next(value)),
            error: err => observer.error(err),
            complete: () => observer.complete(),
        }));
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.0-next.0+sha-37d1f71", ngImport: i0, type: HeaderRowEventDispatcher, deps: [{ token: i0.NgZone }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.0.0-next.0+sha-37d1f71", ngImport: i0, type: HeaderRowEventDispatcher }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.0-next.0+sha-37d1f71", ngImport: i0, type: HeaderRowEventDispatcher, decorators: [{
            type: Injectable
        }], ctorParameters: () => [{ type: i0.NgZone }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnQtZGlzcGF0Y2hlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL2NvbHVtbi1yZXNpemUvZXZlbnQtZGlzcGF0Y2hlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUNqRCxPQUFPLEVBQUMsYUFBYSxFQUE0QixVQUFVLEVBQUUsT0FBTyxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQ2xGLE9BQU8sRUFBQyxvQkFBb0IsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUVqRixPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sd0NBQXdDLENBQUM7QUFFaEUsT0FBTyxFQUFDLG1CQUFtQixFQUFDLE1BQU0sYUFBYSxDQUFDOztBQUVoRCwrREFBK0Q7QUFFL0QsTUFBTSxPQUFPLHdCQUF3QjtJQWNuQyxZQUE2QixPQUFlO1FBQWYsWUFBTyxHQUFQLE9BQU8sQ0FBUTtRQWI1Qzs7OztXQUlHO1FBQ00sc0JBQWlCLEdBQUcsSUFBSSxPQUFPLEVBQWtCLENBQUM7UUFFM0Q7OztXQUdHO1FBQ00sK0JBQTBCLEdBQUcsSUFBSSxPQUFPLEVBQWtCLENBQUM7UUFJcEUsd0RBQXdEO1FBQy9DLDhCQUF5QixHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBRWxHOzs7V0FHRztRQUNNLHFDQUFnQyxHQUFHLGFBQWEsQ0FBQztZQUN4RCxJQUFJLENBQUMseUJBQXlCLENBQUMsSUFBSSxDQUNqQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLG1CQUFtQixDQUFDLENBQUMsRUFDaEQsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUNmLG9CQUFvQixFQUFFLENBQ3ZCO1lBQ0QsSUFBSSxDQUFDLDBCQUEwQixDQUFDLElBQUksQ0FDbEMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxtQkFBbUIsQ0FBQyxDQUFDLEVBQ2hELFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFDZixvQkFBb0IsRUFBRSxDQUN2QjtTQUNGLENBQUMsQ0FBQyxJQUFJLENBQ0wsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLHdDQUF3QztRQUNqRCxHQUFHLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsRUFBRSxFQUFFLENBQUMsTUFBTSxJQUFJLE9BQU8sQ0FBQyxFQUM3QyxvQkFBb0IsRUFBRSxFQUN0QixLQUFLLEVBQUUsQ0FDUixDQUFDO1FBRWUsaURBQTRDLEdBQzNELElBQUksQ0FBQyxnQ0FBZ0MsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7UUFFekUscUVBQXFFO1FBQ3JFLGdGQUFnRjtRQUN4RSxpQkFBWSxHQUFtQixJQUFJLENBQUM7UUFDcEMsc0JBQWlCLEdBQStCLElBQUksQ0FBQztJQWpDZCxDQUFDO0lBbUNoRDs7O09BR0c7SUFDSCxnQ0FBZ0MsQ0FBQyxHQUFZO1FBQzNDLElBQUksR0FBRyxLQUFLLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUM5QixJQUFJLENBQUMsWUFBWSxHQUFHLEdBQUcsQ0FBQztZQUN4QixJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDLDRDQUE0QyxDQUFDLElBQUksQ0FDN0UsR0FBRyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsVUFBVSxLQUFLLEdBQUcsQ0FBQyxFQUNyQyxvQkFBb0IsRUFBRSxFQUN0QixLQUFLLEVBQUUsQ0FDUixDQUFDO1FBQ0osQ0FBQztRQUVELE9BQU8sSUFBSSxDQUFDLGlCQUFrQixDQUFDO0lBQ2pDLENBQUM7SUFFTyxVQUFVO1FBQ2hCLE9BQU8sQ0FBQyxNQUFxQixFQUFFLEVBQUUsQ0FDL0IsSUFBSSxVQUFVLENBQUksUUFBUSxDQUFDLEVBQUUsQ0FDM0IsTUFBTSxDQUFDLFNBQVMsQ0FBQztZQUNmLElBQUksRUFBRSxLQUFLLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDM0QsS0FBSyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUM7WUFDakMsUUFBUSxFQUFFLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUU7U0FDcEMsQ0FBQyxDQUNILENBQUM7SUFDTixDQUFDO2lJQTNFVSx3QkFBd0I7cUlBQXhCLHdCQUF3Qjs7OEdBQXhCLHdCQUF3QjtrQkFEcEMsVUFBVSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0luamVjdGFibGUsIE5nWm9uZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge2NvbWJpbmVMYXRlc3QsIE1vbm9UeXBlT3BlcmF0b3JGdW5jdGlvbiwgT2JzZXJ2YWJsZSwgU3ViamVjdH0gZnJvbSAncnhqcyc7XG5pbXBvcnQge2Rpc3RpbmN0VW50aWxDaGFuZ2VkLCBtYXAsIHNoYXJlLCBza2lwLCBzdGFydFdpdGh9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcblxuaW1wb3J0IHtfY2xvc2VzdH0gZnJvbSAnQGFuZ3VsYXIvY2RrLWV4cGVyaW1lbnRhbC9wb3BvdmVyLWVkaXQnO1xuXG5pbXBvcnQge0hFQURFUl9ST1dfU0VMRUNUT1J9IGZyb20gJy4vc2VsZWN0b3JzJztcblxuLyoqIENvb3JkaW5hdGVzIGV2ZW50cyBiZXR3ZWVuIHRoZSBjb2x1bW4gcmVzaXplIGRpcmVjdGl2ZXMuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgSGVhZGVyUm93RXZlbnREaXNwYXRjaGVyIHtcbiAgLyoqXG4gICAqIEVtaXRzIHRoZSBjdXJyZW50bHkgaG92ZXJlZCBoZWFkZXIgY2VsbCBvciBudWxsIHdoZW4gbm8gaGVhZGVyIGNlbGxzIGFyZSBob3ZlcmVkLlxuICAgKiBFeHBvc2VkIHB1YmxpY2x5IGZvciBldmVudHMgdG8gZmVlZCBpbiwgYnV0IHN1YnNjcmliZXJzIHNob3VsZCB1c2UgaGVhZGVyQ2VsbEhvdmVyZWREaXN0aW5jdCxcbiAgICogZGVmaW5lZCBiZWxvdy5cbiAgICovXG4gIHJlYWRvbmx5IGhlYWRlckNlbGxIb3ZlcmVkID0gbmV3IFN1YmplY3Q8RWxlbWVudCB8IG51bGw+KCk7XG5cbiAgLyoqXG4gICAqIEVtaXRzIHRoZSBoZWFkZXIgY2VsbCBmb3Igd2hpY2ggYSB1c2VyLXRyaWdnZXJlZCByZXNpemUgaXMgYWN0aXZlIG9yIG51bGxcbiAgICogd2hlbiBubyByZXNpemUgaXMgaW4gcHJvZ3Jlc3MuXG4gICAqL1xuICByZWFkb25seSBvdmVybGF5SGFuZGxlQWN0aXZlRm9yQ2VsbCA9IG5ldyBTdWJqZWN0PEVsZW1lbnQgfCBudWxsPigpO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgX25nWm9uZTogTmdab25lKSB7fVxuXG4gIC8qKiBEaXN0aW5jdCBhbmQgc2hhcmVkIHZlcnNpb24gb2YgaGVhZGVyQ2VsbEhvdmVyZWQuICovXG4gIHJlYWRvbmx5IGhlYWRlckNlbGxIb3ZlcmVkRGlzdGluY3QgPSB0aGlzLmhlYWRlckNlbGxIb3ZlcmVkLnBpcGUoZGlzdGluY3RVbnRpbENoYW5nZWQoKSwgc2hhcmUoKSk7XG5cbiAgLyoqXG4gICAqIEVtaXRzIHRoZSBoZWFkZXIgdGhhdCBpcyBjdXJyZW50bHkgaG92ZXJlZCBvciBob3N0aW5nIGFuIGFjdGl2ZSByZXNpemUgZXZlbnQgKHdpdGggYWN0aXZlXG4gICAqIHRha2luZyBwcmVjZWRlbmNlKS5cbiAgICovXG4gIHJlYWRvbmx5IGhlYWRlclJvd0hvdmVyZWRPckFjdGl2ZURpc3RpbmN0ID0gY29tYmluZUxhdGVzdChbXG4gICAgdGhpcy5oZWFkZXJDZWxsSG92ZXJlZERpc3RpbmN0LnBpcGUoXG4gICAgICBtYXAoY2VsbCA9PiBfY2xvc2VzdChjZWxsLCBIRUFERVJfUk9XX1NFTEVDVE9SKSksXG4gICAgICBzdGFydFdpdGgobnVsbCksXG4gICAgICBkaXN0aW5jdFVudGlsQ2hhbmdlZCgpLFxuICAgICksXG4gICAgdGhpcy5vdmVybGF5SGFuZGxlQWN0aXZlRm9yQ2VsbC5waXBlKFxuICAgICAgbWFwKGNlbGwgPT4gX2Nsb3Nlc3QoY2VsbCwgSEVBREVSX1JPV19TRUxFQ1RPUikpLFxuICAgICAgc3RhcnRXaXRoKG51bGwpLFxuICAgICAgZGlzdGluY3RVbnRpbENoYW5nZWQoKSxcbiAgICApLFxuICBdKS5waXBlKFxuICAgIHNraXAoMSksIC8vIElnbm9yZSBpbml0aWFsIFtudWxsLCBudWxsXSBlbWlzc2lvbi5cbiAgICBtYXAoKFtob3ZlcmVkLCBhY3RpdmVdKSA9PiBhY3RpdmUgfHwgaG92ZXJlZCksXG4gICAgZGlzdGluY3RVbnRpbENoYW5nZWQoKSxcbiAgICBzaGFyZSgpLFxuICApO1xuXG4gIHByaXZhdGUgcmVhZG9ubHkgX2hlYWRlclJvd0hvdmVyZWRPckFjdGl2ZURpc3RpbmN0UmVlbnRlclpvbmUgPVxuICAgIHRoaXMuaGVhZGVyUm93SG92ZXJlZE9yQWN0aXZlRGlzdGluY3QucGlwZSh0aGlzLl9lbnRlclpvbmUoKSwgc2hhcmUoKSk7XG5cbiAgLy8gT3B0aW1pemF0aW9uOiBTaGFyZSByb3cgZXZlbnRzIG9ic2VydmFibGUgd2l0aCBzdWJzZXF1ZW50IGNhbGxlcnMuXG4gIC8vIEF0IHN0YXJ0dXAsIGNhbGxzIHdpbGwgYmUgc2VxdWVudGlhbCBieSByb3cgKGFuZCB0eXBpY2FsbHkgdGhlcmUncyBvbmx5IG9uZSkuXG4gIHByaXZhdGUgX2xhc3RTZWVuUm93OiBFbGVtZW50IHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgX2xhc3RTZWVuUm93SG92ZXI6IE9ic2VydmFibGU8Ym9vbGVhbj4gfCBudWxsID0gbnVsbDtcblxuICAvKipcbiAgICogRW1pdHMgd2hldGhlciB0aGUgc3BlY2lmaWVkIHJvdyBzaG91bGQgc2hvdyBpdHMgb3ZlcmxheSBjb250cm9scy5cbiAgICogRW1pc3Npb24gb2NjdXJzIHdpdGhpbiB0aGUgTmdab25lLlxuICAgKi9cbiAgcmVzaXplT3ZlcmxheVZpc2libGVGb3JIZWFkZXJSb3cocm93OiBFbGVtZW50KTogT2JzZXJ2YWJsZTxib29sZWFuPiB7XG4gICAgaWYgKHJvdyAhPT0gdGhpcy5fbGFzdFNlZW5Sb3cpIHtcbiAgICAgIHRoaXMuX2xhc3RTZWVuUm93ID0gcm93O1xuICAgICAgdGhpcy5fbGFzdFNlZW5Sb3dIb3ZlciA9IHRoaXMuX2hlYWRlclJvd0hvdmVyZWRPckFjdGl2ZURpc3RpbmN0UmVlbnRlclpvbmUucGlwZShcbiAgICAgICAgbWFwKGhvdmVyZWRSb3cgPT4gaG92ZXJlZFJvdyA9PT0gcm93KSxcbiAgICAgICAgZGlzdGluY3RVbnRpbENoYW5nZWQoKSxcbiAgICAgICAgc2hhcmUoKSxcbiAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX2xhc3RTZWVuUm93SG92ZXIhO1xuICB9XG5cbiAgcHJpdmF0ZSBfZW50ZXJab25lPFQ+KCk6IE1vbm9UeXBlT3BlcmF0b3JGdW5jdGlvbjxUPiB7XG4gICAgcmV0dXJuIChzb3VyY2U6IE9ic2VydmFibGU8VD4pID0+XG4gICAgICBuZXcgT2JzZXJ2YWJsZTxUPihvYnNlcnZlciA9PlxuICAgICAgICBzb3VyY2Uuc3Vic2NyaWJlKHtcbiAgICAgICAgICBuZXh0OiB2YWx1ZSA9PiB0aGlzLl9uZ1pvbmUucnVuKCgpID0+IG9ic2VydmVyLm5leHQodmFsdWUpKSxcbiAgICAgICAgICBlcnJvcjogZXJyID0+IG9ic2VydmVyLmVycm9yKGVyciksXG4gICAgICAgICAgY29tcGxldGU6ICgpID0+IG9ic2VydmVyLmNvbXBsZXRlKCksXG4gICAgICAgIH0pLFxuICAgICAgKTtcbiAgfVxufVxuIl19