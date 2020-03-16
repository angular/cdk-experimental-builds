/**
 * @fileoverview added by tsickle
 * Generated from: src/cdk-experimental/column-resize/column-resize.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive } from '@angular/core';
import { fromEvent, merge, ReplaySubject } from 'rxjs';
import { filter, map, mapTo, pairwise, startWith, take, takeUntil } from 'rxjs/operators';
import { _closest, _matches } from '@angular/cdk-experimental/popover-edit';
import { HEADER_CELL_SELECTOR, RESIZE_OVERLAY_SELECTOR } from './selectors';
/** @type {?} */
const HOVER_OR_ACTIVE_CLASS = 'cdk-column-resize-hover-or-active';
/** @type {?} */
const WITH_RESIZED_COLUMN_CLASS = 'cdk-column-resize-with-resized-column';
/** @type {?} */
let nextId = 0;
/**
 * Base class for ColumnResize directives which attach to mat-table elements to
 * provide common events and services for column resizing.
 * @abstract
 */
export class ColumnResize {
    constructor() {
        this.destroyed = new ReplaySubject();
        /**
         * Unique ID for this table instance.
         */
        this.selectorId = `${++nextId}`;
    }
    /**
     * @return {?}
     */
    ngAfterViewInit() {
        (/** @type {?} */ (this.elementRef.nativeElement)).classList.add(this.getUniqueCssClass());
        this._listenForRowHoverEvents();
        this._listenForResizeActivity();
        this._listenForHoverActivity();
    }
    /**
     * @return {?}
     */
    ngOnDestroy() {
        this.destroyed.next();
        this.destroyed.complete();
    }
    /**
     * Gets the unique CSS class name for this table instance.
     * @return {?}
     */
    getUniqueCssClass() {
        return `cdk-column-resize-${this.selectorId}`;
    }
    /**
     * @private
     * @return {?}
     */
    _listenForRowHoverEvents() {
        this.ngZone.runOutsideAngular((/**
         * @return {?}
         */
        () => {
            /** @type {?} */
            const element = (/** @type {?} */ (this.elementRef.nativeElement));
            fromEvent(element, 'mouseover').pipe(map((/**
             * @param {?} event
             * @return {?}
             */
            event => _closest(event.target, HEADER_CELL_SELECTOR))), takeUntil(this.destroyed)).subscribe(this.eventDispatcher.headerCellHovered);
            fromEvent(element, 'mouseleave').pipe(filter((/**
             * @param {?} event
             * @return {?}
             */
            event => !!event.relatedTarget &&
                !_matches((/** @type {?} */ (event.relatedTarget)), RESIZE_OVERLAY_SELECTOR))), mapTo(null), takeUntil(this.destroyed)).subscribe(this.eventDispatcher.headerCellHovered);
        }));
    }
    /**
     * @private
     * @return {?}
     */
    _listenForResizeActivity() {
        merge(this.eventDispatcher.overlayHandleActiveForCell.pipe(mapTo(undefined)), this.notifier.triggerResize.pipe(mapTo(undefined)), this.notifier.resizeCompleted.pipe(mapTo(undefined))).pipe(takeUntil(this.destroyed), take(1)).subscribe((/**
         * @return {?}
         */
        () => {
            (/** @type {?} */ (this.elementRef.nativeElement)).classList.add(WITH_RESIZED_COLUMN_CLASS);
        }));
    }
    /**
     * @private
     * @return {?}
     */
    _listenForHoverActivity() {
        this.eventDispatcher.headerRowHoveredOrActiveDistinct.pipe(startWith(null), pairwise(), takeUntil(this.destroyed)).subscribe((/**
         * @param {?} __0
         * @return {?}
         */
        ([previousRow, hoveredRow]) => {
            if (hoveredRow) {
                hoveredRow.classList.add(HOVER_OR_ACTIVE_CLASS);
            }
            if (previousRow) {
                previousRow.classList.remove(HOVER_OR_ACTIVE_CLASS);
            }
        }));
    }
}
ColumnResize.decorators = [
    { type: Directive }
];
if (false) {
    /**
     * @type {?}
     * @protected
     */
    ColumnResize.prototype.destroyed;
    /** @type {?} */
    ColumnResize.prototype.columnResizeNotifier;
    /**
     * @type {?}
     * @protected
     */
    ColumnResize.prototype.elementRef;
    /**
     * @type {?}
     * @protected
     */
    ColumnResize.prototype.eventDispatcher;
    /**
     * @type {?}
     * @protected
     */
    ColumnResize.prototype.ngZone;
    /**
     * @type {?}
     * @protected
     */
    ColumnResize.prototype.notifier;
    /**
     * Unique ID for this table instance.
     * @type {?}
     * @protected
     */
    ColumnResize.prototype.selectorId;
    /**
     * The id attribute of the table, if specified.
     * @type {?}
     */
    ColumnResize.prototype.id;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sdW1uLXJlc2l6ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL2NvbHVtbi1yZXNpemUvY29sdW1uLXJlc2l6ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFRQSxPQUFPLEVBQWdCLFNBQVMsRUFBZ0MsTUFBTSxlQUFlLENBQUM7QUFDdEYsT0FBTyxFQUFDLFNBQVMsRUFBRSxLQUFLLEVBQUUsYUFBYSxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQ3JELE9BQU8sRUFBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUV4RixPQUFPLEVBQUMsUUFBUSxFQUFFLFFBQVEsRUFBQyxNQUFNLHdDQUF3QyxDQUFDO0FBRzFFLE9BQU8sRUFBQyxvQkFBb0IsRUFBRSx1QkFBdUIsRUFBQyxNQUFNLGFBQWEsQ0FBQzs7TUFHcEUscUJBQXFCLEdBQUcsbUNBQW1DOztNQUMzRCx5QkFBeUIsR0FBRyx1Q0FBdUM7O0lBRXJFLE1BQU0sR0FBRyxDQUFDOzs7Ozs7QUFPZCxNQUFNLE9BQWdCLFlBQVk7SUFEbEM7UUFFcUIsY0FBUyxHQUFHLElBQUksYUFBYSxFQUFRLENBQUM7Ozs7UUFXdEMsZUFBVSxHQUFHLEdBQUcsRUFBRSxNQUFNLEVBQUUsQ0FBQztJQW1FaEQsQ0FBQzs7OztJQTlEQyxlQUFlO1FBQ2IsbUJBQUEsSUFBSSxDQUFDLFVBQVUsQ0FBQyxhQUFhLEVBQUMsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLENBQUM7UUFFdkUsSUFBSSxDQUFDLHdCQUF3QixFQUFFLENBQUM7UUFDaEMsSUFBSSxDQUFDLHdCQUF3QixFQUFFLENBQUM7UUFDaEMsSUFBSSxDQUFDLHVCQUF1QixFQUFFLENBQUM7SUFD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QkFBMkM7Ozs7O0lBQzNDLGdDQUFpRTs7Ozs7O0lBR2pFLGtDQUE4Qzs7Ozs7SUFHOUMsMEJBQVkiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtBZnRlclZpZXdJbml0LCBEaXJlY3RpdmUsIEVsZW1lbnRSZWYsIE5nWm9uZSwgT25EZXN0cm95fSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7ZnJvbUV2ZW50LCBtZXJnZSwgUmVwbGF5U3ViamVjdH0gZnJvbSAncnhqcyc7XG5pbXBvcnQge2ZpbHRlciwgbWFwLCBtYXBUbywgcGFpcndpc2UsIHN0YXJ0V2l0aCwgdGFrZSwgdGFrZVVudGlsfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbmltcG9ydCB7X2Nsb3Nlc3QsIF9tYXRjaGVzfSBmcm9tICdAYW5ndWxhci9jZGstZXhwZXJpbWVudGFsL3BvcG92ZXItZWRpdCc7XG5cbmltcG9ydCB7Q29sdW1uUmVzaXplTm90aWZpZXIsIENvbHVtblJlc2l6ZU5vdGlmaWVyU291cmNlfSBmcm9tICcuL2NvbHVtbi1yZXNpemUtbm90aWZpZXInO1xuaW1wb3J0IHtIRUFERVJfQ0VMTF9TRUxFQ1RPUiwgUkVTSVpFX09WRVJMQVlfU0VMRUNUT1J9IGZyb20gJy4vc2VsZWN0b3JzJztcbmltcG9ydCB7SGVhZGVyUm93RXZlbnREaXNwYXRjaGVyfSBmcm9tICcuL2V2ZW50LWRpc3BhdGNoZXInO1xuXG5jb25zdCBIT1ZFUl9PUl9BQ1RJVkVfQ0xBU1MgPSAnY2RrLWNvbHVtbi1yZXNpemUtaG92ZXItb3ItYWN0aXZlJztcbmNvbnN0IFdJVEhfUkVTSVpFRF9DT0xVTU5fQ0xBU1MgPSAnY2RrLWNvbHVtbi1yZXNpemUtd2l0aC1yZXNpemVkLWNvbHVtbic7XG5cbmxldCBuZXh0SWQgPSAwO1xuXG4vKipcbiAqIEJhc2UgY2xhc3MgZm9yIENvbHVtblJlc2l6ZSBkaXJlY3RpdmVzIHdoaWNoIGF0dGFjaCB0byBtYXQtdGFibGUgZWxlbWVudHMgdG9cbiAqIHByb3ZpZGUgY29tbW9uIGV2ZW50cyBhbmQgc2VydmljZXMgZm9yIGNvbHVtbiByZXNpemluZy5cbiAqL1xuQERpcmVjdGl2ZSgpXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQ29sdW1uUmVzaXplIGltcGxlbWVudHMgQWZ0ZXJWaWV3SW5pdCwgT25EZXN0cm95IHtcbiAgcHJvdGVjdGVkIHJlYWRvbmx5IGRlc3Ryb3llZCA9IG5ldyBSZXBsYXlTdWJqZWN0PHZvaWQ+KCk7XG5cbiAgLyogUHVibGljbHkgYWNjZXNzaWJsZSBpbnRlcmZhY2UgZm9yIHRyaWdnZXJpbmcgYW5kIGJlaW5nIG5vdGlmaWVkIG9mIHJlc2l6ZXMuICovXG4gIGFic3RyYWN0IHJlYWRvbmx5IGNvbHVtblJlc2l6ZU5vdGlmaWVyOiBDb2x1bW5SZXNpemVOb3RpZmllcjtcblxuICBwcm90ZWN0ZWQgYWJzdHJhY3QgcmVhZG9ubHkgZWxlbWVudFJlZjogRWxlbWVudFJlZjxIVE1MRWxlbWVudD47XG4gIHByb3RlY3RlZCBhYnN0cmFjdCByZWFkb25seSBldmVudERpc3BhdGNoZXI6IEhlYWRlclJvd0V2ZW50RGlzcGF0Y2hlcjtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IHJlYWRvbmx5IG5nWm9uZTogTmdab25lO1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgcmVhZG9ubHkgbm90aWZpZXI6IENvbHVtblJlc2l6ZU5vdGlmaWVyU291cmNlO1xuXG4gIC8qKiBVbmlxdWUgSUQgZm9yIHRoaXMgdGFibGUgaW5zdGFuY2UuICovXG4gIHByb3RlY3RlZCByZWFkb25seSBzZWxlY3RvcklkID0gYCR7KytuZXh0SWR9YDtcblxuICAvKiogVGhlIGlkIGF0dHJpYnV0ZSBvZiB0aGUgdGFibGUsIGlmIHNwZWNpZmllZC4gKi9cbiAgaWQ/OiBzdHJpbmc7XG5cbiAgbmdBZnRlclZpZXdJbml0KCkge1xuICAgIHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50IS5jbGFzc0xpc3QuYWRkKHRoaXMuZ2V0VW5pcXVlQ3NzQ2xhc3MoKSk7XG5cbiAgICB0aGlzLl9saXN0ZW5Gb3JSb3dIb3ZlckV2ZW50cygpO1xuICAgIHRoaXMuX2xpc3RlbkZvclJlc2l6ZUFjdGl2aXR5KCk7XG4gICAgdGhpcy5fbGlzdGVuRm9ySG92ZXJBY3Rpdml0eSgpO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgdGhpcy5kZXN0cm95ZWQubmV4dCgpO1xuICAgIHRoaXMuZGVzdHJveWVkLmNvbXBsZXRlKCk7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgdW5pcXVlIENTUyBjbGFzcyBuYW1lIGZvciB0aGlzIHRhYmxlIGluc3RhbmNlLiAqL1xuICBnZXRVbmlxdWVDc3NDbGFzcygpIHtcbiAgICByZXR1cm4gYGNkay1jb2x1bW4tcmVzaXplLSR7dGhpcy5zZWxlY3RvcklkfWA7XG4gIH1cblxuICBwcml2YXRlIF9saXN0ZW5Gb3JSb3dIb3ZlckV2ZW50cygpIHtcbiAgICB0aGlzLm5nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgICBjb25zdCBlbGVtZW50ID0gdGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQhO1xuXG4gICAgICBmcm9tRXZlbnQ8TW91c2VFdmVudD4oZWxlbWVudCwgJ21vdXNlb3ZlcicpLnBpcGUoXG4gICAgICAgICAgbWFwKGV2ZW50ID0+IF9jbG9zZXN0KGV2ZW50LnRhcmdldCwgSEVBREVSX0NFTExfU0VMRUNUT1IpKSxcbiAgICAgICAgICB0YWtlVW50aWwodGhpcy5kZXN0cm95ZWQpLFxuICAgICAgICAgICkuc3Vic2NyaWJlKHRoaXMuZXZlbnREaXNwYXRjaGVyLmhlYWRlckNlbGxIb3ZlcmVkKTtcbiAgICAgIGZyb21FdmVudDxNb3VzZUV2ZW50PihlbGVtZW50LCAnbW91c2VsZWF2ZScpLnBpcGUoXG4gICAgICAgICAgZmlsdGVyKGV2ZW50ID0+ICEhZXZlbnQucmVsYXRlZFRhcmdldCAmJlxuICAgICAgICAgICAgICAhX21hdGNoZXMoZXZlbnQucmVsYXRlZFRhcmdldCBhcyBFbGVtZW50LCBSRVNJWkVfT1ZFUkxBWV9TRUxFQ1RPUikpLFxuICAgICAgICAgIG1hcFRvKG51bGwpLFxuICAgICAgICAgIHRha2VVbnRpbCh0aGlzLmRlc3Ryb3llZCksXG4gICAgICAgICAgKS5zdWJzY3JpYmUodGhpcy5ldmVudERpc3BhdGNoZXIuaGVhZGVyQ2VsbEhvdmVyZWQpO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfbGlzdGVuRm9yUmVzaXplQWN0aXZpdHkoKSB7XG4gICAgbWVyZ2UoXG4gICAgICAgIHRoaXMuZXZlbnREaXNwYXRjaGVyLm92ZXJsYXlIYW5kbGVBY3RpdmVGb3JDZWxsLnBpcGUobWFwVG8odW5kZWZpbmVkKSksXG4gICAgICAgIHRoaXMubm90aWZpZXIudHJpZ2dlclJlc2l6ZS5waXBlKG1hcFRvKHVuZGVmaW5lZCkpLFxuICAgICAgICB0aGlzLm5vdGlmaWVyLnJlc2l6ZUNvbXBsZXRlZC5waXBlKG1hcFRvKHVuZGVmaW5lZCkpXG4gICAgKS5waXBlKFxuICAgICAgICB0YWtlVW50aWwodGhpcy5kZXN0cm95ZWQpLFxuICAgICAgICB0YWtlKDEpLFxuICAgICkuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgIHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50IS5jbGFzc0xpc3QuYWRkKFdJVEhfUkVTSVpFRF9DT0xVTU5fQ0xBU1MpO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfbGlzdGVuRm9ySG92ZXJBY3Rpdml0eSgpIHtcbiAgICB0aGlzLmV2ZW50RGlzcGF0Y2hlci5oZWFkZXJSb3dIb3ZlcmVkT3JBY3RpdmVEaXN0aW5jdC5waXBlKFxuICAgICAgICBzdGFydFdpdGgobnVsbCksXG4gICAgICAgIHBhaXJ3aXNlKCksXG4gICAgICAgIHRha2VVbnRpbCh0aGlzLmRlc3Ryb3llZCksXG4gICAgKS5zdWJzY3JpYmUoKFtwcmV2aW91c1JvdywgaG92ZXJlZFJvd10pID0+IHtcbiAgICAgIGlmIChob3ZlcmVkUm93KSB7XG4gICAgICAgIGhvdmVyZWRSb3cuY2xhc3NMaXN0LmFkZChIT1ZFUl9PUl9BQ1RJVkVfQ0xBU1MpO1xuICAgICAgfVxuICAgICAgaWYgKHByZXZpb3VzUm93KSB7XG4gICAgICAgIHByZXZpb3VzUm93LmNsYXNzTGlzdC5yZW1vdmUoSE9WRVJfT1JfQUNUSVZFX0NMQVNTKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufVxuIl19