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
    /** @type {?} */
    ColumnResize.prototype.directionality;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sdW1uLXJlc2l6ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL2NvbHVtbi1yZXNpemUvY29sdW1uLXJlc2l6ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFRQSxPQUFPLEVBQWdCLFNBQVMsRUFBZ0MsTUFBTSxlQUFlLENBQUM7QUFFdEYsT0FBTyxFQUFDLFNBQVMsRUFBRSxLQUFLLEVBQUUsYUFBYSxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQ3JELE9BQU8sRUFBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUV4RixPQUFPLEVBQUMsUUFBUSxFQUFFLFFBQVEsRUFBQyxNQUFNLHdDQUF3QyxDQUFDO0FBRzFFLE9BQU8sRUFBQyxvQkFBb0IsRUFBRSx1QkFBdUIsRUFBQyxNQUFNLGFBQWEsQ0FBQzs7TUFHcEUscUJBQXFCLEdBQUcsbUNBQW1DOztNQUMzRCx5QkFBeUIsR0FBRyx1Q0FBdUM7O0lBRXJFLE1BQU0sR0FBRyxDQUFDOzs7Ozs7QUFPZCxNQUFNLE9BQWdCLFlBQVk7SUFEbEM7UUFFcUIsY0FBUyxHQUFHLElBQUksYUFBYSxFQUFRLENBQUM7Ozs7UUFZdEMsZUFBVSxHQUFHLEdBQUcsRUFBRSxNQUFNLEVBQUUsQ0FBQztJQW1FaEQsQ0FBQzs7OztJQTlEQyxlQUFlO1FBQ2IsbUJBQUEsSUFBSSxDQUFDLFVBQVUsQ0FBQyxhQUFhLEVBQUMsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLENBQUM7UUFFdkUsSUFBSSxDQUFDLHdCQUF3QixFQUFFLENBQUM7UUFDaEMsSUFBSSxDQUFDLHdCQUF3QixFQUFFLENBQUM7UUFDaEMsSUFBSSxDQUFDLHVCQUF1QixFQUFFLENBQUM7SUFD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c0U7Ozs7O0lBQ3RFLDhCQUEyQzs7Ozs7SUFDM0MsZ0NBQWlFOzs7Ozs7SUFHakUsa0NBQThDOzs7OztJQUc5QywwQkFBWSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0FmdGVyVmlld0luaXQsIERpcmVjdGl2ZSwgRWxlbWVudFJlZiwgTmdab25lLCBPbkRlc3Ryb3l9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtEaXJlY3Rpb25hbGl0eX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2JpZGknO1xuaW1wb3J0IHtmcm9tRXZlbnQsIG1lcmdlLCBSZXBsYXlTdWJqZWN0fSBmcm9tICdyeGpzJztcbmltcG9ydCB7ZmlsdGVyLCBtYXAsIG1hcFRvLCBwYWlyd2lzZSwgc3RhcnRXaXRoLCB0YWtlLCB0YWtlVW50aWx9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcblxuaW1wb3J0IHtfY2xvc2VzdCwgX21hdGNoZXN9IGZyb20gJ0Bhbmd1bGFyL2Nkay1leHBlcmltZW50YWwvcG9wb3Zlci1lZGl0JztcblxuaW1wb3J0IHtDb2x1bW5SZXNpemVOb3RpZmllciwgQ29sdW1uUmVzaXplTm90aWZpZXJTb3VyY2V9IGZyb20gJy4vY29sdW1uLXJlc2l6ZS1ub3RpZmllcic7XG5pbXBvcnQge0hFQURFUl9DRUxMX1NFTEVDVE9SLCBSRVNJWkVfT1ZFUkxBWV9TRUxFQ1RPUn0gZnJvbSAnLi9zZWxlY3RvcnMnO1xuaW1wb3J0IHtIZWFkZXJSb3dFdmVudERpc3BhdGNoZXJ9IGZyb20gJy4vZXZlbnQtZGlzcGF0Y2hlcic7XG5cbmNvbnN0IEhPVkVSX09SX0FDVElWRV9DTEFTUyA9ICdjZGstY29sdW1uLXJlc2l6ZS1ob3Zlci1vci1hY3RpdmUnO1xuY29uc3QgV0lUSF9SRVNJWkVEX0NPTFVNTl9DTEFTUyA9ICdjZGstY29sdW1uLXJlc2l6ZS13aXRoLXJlc2l6ZWQtY29sdW1uJztcblxubGV0IG5leHRJZCA9IDA7XG5cbi8qKlxuICogQmFzZSBjbGFzcyBmb3IgQ29sdW1uUmVzaXplIGRpcmVjdGl2ZXMgd2hpY2ggYXR0YWNoIHRvIG1hdC10YWJsZSBlbGVtZW50cyB0b1xuICogcHJvdmlkZSBjb21tb24gZXZlbnRzIGFuZCBzZXJ2aWNlcyBmb3IgY29sdW1uIHJlc2l6aW5nLlxuICovXG5ARGlyZWN0aXZlKClcbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBDb2x1bW5SZXNpemUgaW1wbGVtZW50cyBBZnRlclZpZXdJbml0LCBPbkRlc3Ryb3kge1xuICBwcm90ZWN0ZWQgcmVhZG9ubHkgZGVzdHJveWVkID0gbmV3IFJlcGxheVN1YmplY3Q8dm9pZD4oKTtcblxuICAvKiBQdWJsaWNseSBhY2Nlc3NpYmxlIGludGVyZmFjZSBmb3IgdHJpZ2dlcmluZyBhbmQgYmVpbmcgbm90aWZpZWQgb2YgcmVzaXplcy4gKi9cbiAgYWJzdHJhY3QgcmVhZG9ubHkgY29sdW1uUmVzaXplTm90aWZpZXI6IENvbHVtblJlc2l6ZU5vdGlmaWVyO1xuXG4gIGFic3RyYWN0IHJlYWRvbmx5IGRpcmVjdGlvbmFsaXR5OiBEaXJlY3Rpb25hbGl0eTtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IHJlYWRvbmx5IGVsZW1lbnRSZWY6IEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+O1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgcmVhZG9ubHkgZXZlbnREaXNwYXRjaGVyOiBIZWFkZXJSb3dFdmVudERpc3BhdGNoZXI7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCByZWFkb25seSBuZ1pvbmU6IE5nWm9uZTtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IHJlYWRvbmx5IG5vdGlmaWVyOiBDb2x1bW5SZXNpemVOb3RpZmllclNvdXJjZTtcblxuICAvKiogVW5pcXVlIElEIGZvciB0aGlzIHRhYmxlIGluc3RhbmNlLiAqL1xuICBwcm90ZWN0ZWQgcmVhZG9ubHkgc2VsZWN0b3JJZCA9IGAkeysrbmV4dElkfWA7XG5cbiAgLyoqIFRoZSBpZCBhdHRyaWJ1dGUgb2YgdGhlIHRhYmxlLCBpZiBzcGVjaWZpZWQuICovXG4gIGlkPzogc3RyaW5nO1xuXG4gIG5nQWZ0ZXJWaWV3SW5pdCgpIHtcbiAgICB0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCEuY2xhc3NMaXN0LmFkZCh0aGlzLmdldFVuaXF1ZUNzc0NsYXNzKCkpO1xuXG4gICAgdGhpcy5fbGlzdGVuRm9yUm93SG92ZXJFdmVudHMoKTtcbiAgICB0aGlzLl9saXN0ZW5Gb3JSZXNpemVBY3Rpdml0eSgpO1xuICAgIHRoaXMuX2xpc3RlbkZvckhvdmVyQWN0aXZpdHkoKTtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIHRoaXMuZGVzdHJveWVkLm5leHQoKTtcbiAgICB0aGlzLmRlc3Ryb3llZC5jb21wbGV0ZSgpO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIHVuaXF1ZSBDU1MgY2xhc3MgbmFtZSBmb3IgdGhpcyB0YWJsZSBpbnN0YW5jZS4gKi9cbiAgZ2V0VW5pcXVlQ3NzQ2xhc3MoKSB7XG4gICAgcmV0dXJuIGBjZGstY29sdW1uLXJlc2l6ZS0ke3RoaXMuc2VsZWN0b3JJZH1gO1xuICB9XG5cbiAgcHJpdmF0ZSBfbGlzdGVuRm9yUm93SG92ZXJFdmVudHMoKSB7XG4gICAgdGhpcy5uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgY29uc3QgZWxlbWVudCA9IHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50ITtcblxuICAgICAgZnJvbUV2ZW50PE1vdXNlRXZlbnQ+KGVsZW1lbnQsICdtb3VzZW92ZXInKS5waXBlKFxuICAgICAgICAgIG1hcChldmVudCA9PiBfY2xvc2VzdChldmVudC50YXJnZXQsIEhFQURFUl9DRUxMX1NFTEVDVE9SKSksXG4gICAgICAgICAgdGFrZVVudGlsKHRoaXMuZGVzdHJveWVkKSxcbiAgICAgICAgICApLnN1YnNjcmliZSh0aGlzLmV2ZW50RGlzcGF0Y2hlci5oZWFkZXJDZWxsSG92ZXJlZCk7XG4gICAgICBmcm9tRXZlbnQ8TW91c2VFdmVudD4oZWxlbWVudCwgJ21vdXNlbGVhdmUnKS5waXBlKFxuICAgICAgICAgIGZpbHRlcihldmVudCA9PiAhIWV2ZW50LnJlbGF0ZWRUYXJnZXQgJiZcbiAgICAgICAgICAgICAgIV9tYXRjaGVzKGV2ZW50LnJlbGF0ZWRUYXJnZXQgYXMgRWxlbWVudCwgUkVTSVpFX09WRVJMQVlfU0VMRUNUT1IpKSxcbiAgICAgICAgICBtYXBUbyhudWxsKSxcbiAgICAgICAgICB0YWtlVW50aWwodGhpcy5kZXN0cm95ZWQpLFxuICAgICAgICAgICkuc3Vic2NyaWJlKHRoaXMuZXZlbnREaXNwYXRjaGVyLmhlYWRlckNlbGxIb3ZlcmVkKTtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX2xpc3RlbkZvclJlc2l6ZUFjdGl2aXR5KCkge1xuICAgIG1lcmdlKFxuICAgICAgICB0aGlzLmV2ZW50RGlzcGF0Y2hlci5vdmVybGF5SGFuZGxlQWN0aXZlRm9yQ2VsbC5waXBlKG1hcFRvKHVuZGVmaW5lZCkpLFxuICAgICAgICB0aGlzLm5vdGlmaWVyLnRyaWdnZXJSZXNpemUucGlwZShtYXBUbyh1bmRlZmluZWQpKSxcbiAgICAgICAgdGhpcy5ub3RpZmllci5yZXNpemVDb21wbGV0ZWQucGlwZShtYXBUbyh1bmRlZmluZWQpKVxuICAgICkucGlwZShcbiAgICAgICAgdGFrZVVudGlsKHRoaXMuZGVzdHJveWVkKSxcbiAgICAgICAgdGFrZSgxKSxcbiAgICApLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICB0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCEuY2xhc3NMaXN0LmFkZChXSVRIX1JFU0laRURfQ09MVU1OX0NMQVNTKTtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX2xpc3RlbkZvckhvdmVyQWN0aXZpdHkoKSB7XG4gICAgdGhpcy5ldmVudERpc3BhdGNoZXIuaGVhZGVyUm93SG92ZXJlZE9yQWN0aXZlRGlzdGluY3QucGlwZShcbiAgICAgICAgc3RhcnRXaXRoKG51bGwpLFxuICAgICAgICBwYWlyd2lzZSgpLFxuICAgICAgICB0YWtlVW50aWwodGhpcy5kZXN0cm95ZWQpLFxuICAgICkuc3Vic2NyaWJlKChbcHJldmlvdXNSb3csIGhvdmVyZWRSb3ddKSA9PiB7XG4gICAgICBpZiAoaG92ZXJlZFJvdykge1xuICAgICAgICBob3ZlcmVkUm93LmNsYXNzTGlzdC5hZGQoSE9WRVJfT1JfQUNUSVZFX0NMQVNTKTtcbiAgICAgIH1cbiAgICAgIGlmIChwcmV2aW91c1Jvdykge1xuICAgICAgICBwcmV2aW91c1Jvdy5jbGFzc0xpc3QucmVtb3ZlKEhPVkVSX09SX0FDVElWRV9DTEFTUyk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==