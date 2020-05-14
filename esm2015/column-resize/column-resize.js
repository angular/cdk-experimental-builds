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
     * Called when a column in the table is resized. Applies a css class to the table element.
     * @return {?}
     */
    setResized() {
        (/** @type {?} */ (this.elementRef.nativeElement)).classList.add(WITH_RESIZED_COLUMN_CLASS);
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
            this.setResized();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sdW1uLXJlc2l6ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL2NvbHVtbi1yZXNpemUvY29sdW1uLXJlc2l6ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFRQSxPQUFPLEVBQWdCLFNBQVMsRUFBZ0MsTUFBTSxlQUFlLENBQUM7QUFDdEYsT0FBTyxFQUFDLFNBQVMsRUFBRSxLQUFLLEVBQUUsYUFBYSxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQ3JELE9BQU8sRUFBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUV4RixPQUFPLEVBQUMsUUFBUSxFQUFFLFFBQVEsRUFBQyxNQUFNLHdDQUF3QyxDQUFDO0FBRzFFLE9BQU8sRUFBQyxvQkFBb0IsRUFBRSx1QkFBdUIsRUFBQyxNQUFNLGFBQWEsQ0FBQzs7TUFHcEUscUJBQXFCLEdBQUcsbUNBQW1DOztNQUMzRCx5QkFBeUIsR0FBRyx1Q0FBdUM7O0lBRXJFLE1BQU0sR0FBRyxDQUFDOzs7Ozs7QUFPZCxNQUFNLE9BQWdCLFlBQVk7SUFEbEM7UUFFcUIsY0FBUyxHQUFHLElBQUksYUFBYSxFQUFRLENBQUM7Ozs7UUFhdEMsZUFBVSxHQUFHLEdBQUcsRUFBRSxNQUFNLEVBQUUsQ0FBQztJQXdFaEQsQ0FBQzs7OztJQW5FQyxlQUFlO1FBQ2IsbUJBQUEsSUFBSSxDQUFDLFVBQVUsQ0FBQyxhQUFhLEVBQUMsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLENBQUM7UUFFdkUsSUFBSSxDQUFDLHdCQUF3QixFQUFFLENBQUM7UUFDaEMsSUFBSSxDQUFDLHdCQUF3QixFQUFFLENBQUM7UUFDaEMsSUFBSSxDQUFDLHVCQUF1QixFQUFFLENBQUM7SUFD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ekQsNENBQTZEOztJQUc3RCxrQ0FBc0Q7Ozs7O0lBRXRELHVDQUFzRTs7Ozs7SUFDdEUsOEJBQTJDOzs7OztJQUMzQyxnQ0FBaUU7Ozs7OztJQUdqRSxrQ0FBOEM7Ozs7O0lBRzlDLDBCQUFZIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7QWZ0ZXJWaWV3SW5pdCwgRGlyZWN0aXZlLCBFbGVtZW50UmVmLCBOZ1pvbmUsIE9uRGVzdHJveX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge2Zyb21FdmVudCwgbWVyZ2UsIFJlcGxheVN1YmplY3R9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHtmaWx0ZXIsIG1hcCwgbWFwVG8sIHBhaXJ3aXNlLCBzdGFydFdpdGgsIHRha2UsIHRha2VVbnRpbH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuXG5pbXBvcnQge19jbG9zZXN0LCBfbWF0Y2hlc30gZnJvbSAnQGFuZ3VsYXIvY2RrLWV4cGVyaW1lbnRhbC9wb3BvdmVyLWVkaXQnO1xuXG5pbXBvcnQge0NvbHVtblJlc2l6ZU5vdGlmaWVyLCBDb2x1bW5SZXNpemVOb3RpZmllclNvdXJjZX0gZnJvbSAnLi9jb2x1bW4tcmVzaXplLW5vdGlmaWVyJztcbmltcG9ydCB7SEVBREVSX0NFTExfU0VMRUNUT1IsIFJFU0laRV9PVkVSTEFZX1NFTEVDVE9SfSBmcm9tICcuL3NlbGVjdG9ycyc7XG5pbXBvcnQge0hlYWRlclJvd0V2ZW50RGlzcGF0Y2hlcn0gZnJvbSAnLi9ldmVudC1kaXNwYXRjaGVyJztcblxuY29uc3QgSE9WRVJfT1JfQUNUSVZFX0NMQVNTID0gJ2Nkay1jb2x1bW4tcmVzaXplLWhvdmVyLW9yLWFjdGl2ZSc7XG5jb25zdCBXSVRIX1JFU0laRURfQ09MVU1OX0NMQVNTID0gJ2Nkay1jb2x1bW4tcmVzaXplLXdpdGgtcmVzaXplZC1jb2x1bW4nO1xuXG5sZXQgbmV4dElkID0gMDtcblxuLyoqXG4gKiBCYXNlIGNsYXNzIGZvciBDb2x1bW5SZXNpemUgZGlyZWN0aXZlcyB3aGljaCBhdHRhY2ggdG8gbWF0LXRhYmxlIGVsZW1lbnRzIHRvXG4gKiBwcm92aWRlIGNvbW1vbiBldmVudHMgYW5kIHNlcnZpY2VzIGZvciBjb2x1bW4gcmVzaXppbmcuXG4gKi9cbkBEaXJlY3RpdmUoKVxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIENvbHVtblJlc2l6ZSBpbXBsZW1lbnRzIEFmdGVyVmlld0luaXQsIE9uRGVzdHJveSB7XG4gIHByb3RlY3RlZCByZWFkb25seSBkZXN0cm95ZWQgPSBuZXcgUmVwbGF5U3ViamVjdDx2b2lkPigpO1xuXG4gIC8qIFB1YmxpY2x5IGFjY2Vzc2libGUgaW50ZXJmYWNlIGZvciB0cmlnZ2VyaW5nIGFuZCBiZWluZyBub3RpZmllZCBvZiByZXNpemVzLiAqL1xuICBhYnN0cmFjdCByZWFkb25seSBjb2x1bW5SZXNpemVOb3RpZmllcjogQ29sdW1uUmVzaXplTm90aWZpZXI7XG5cbiAgLyogRWxlbWVudFJlZiB0aGF0IHRoaXMgZGlyZWN0aXZlIGlzIGF0dGFjaGVkIHRvLiBFeHBvc2VkIEZvciB1c2UgYnkgY29sdW1uLWxldmVsIGRpcmVjdGl2ZXMgKi9cbiAgYWJzdHJhY3QgcmVhZG9ubHkgZWxlbWVudFJlZjogRWxlbWVudFJlZjxIVE1MRWxlbWVudD47XG5cbiAgcHJvdGVjdGVkIGFic3RyYWN0IHJlYWRvbmx5IGV2ZW50RGlzcGF0Y2hlcjogSGVhZGVyUm93RXZlbnREaXNwYXRjaGVyO1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgcmVhZG9ubHkgbmdab25lOiBOZ1pvbmU7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCByZWFkb25seSBub3RpZmllcjogQ29sdW1uUmVzaXplTm90aWZpZXJTb3VyY2U7XG5cbiAgLyoqIFVuaXF1ZSBJRCBmb3IgdGhpcyB0YWJsZSBpbnN0YW5jZS4gKi9cbiAgcHJvdGVjdGVkIHJlYWRvbmx5IHNlbGVjdG9ySWQgPSBgJHsrK25leHRJZH1gO1xuXG4gIC8qKiBUaGUgaWQgYXR0cmlidXRlIG9mIHRoZSB0YWJsZSwgaWYgc3BlY2lmaWVkLiAqL1xuICBpZD86IHN0cmluZztcblxuICBuZ0FmdGVyVmlld0luaXQoKSB7XG4gICAgdGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQhLmNsYXNzTGlzdC5hZGQodGhpcy5nZXRVbmlxdWVDc3NDbGFzcygpKTtcblxuICAgIHRoaXMuX2xpc3RlbkZvclJvd0hvdmVyRXZlbnRzKCk7XG4gICAgdGhpcy5fbGlzdGVuRm9yUmVzaXplQWN0aXZpdHkoKTtcbiAgICB0aGlzLl9saXN0ZW5Gb3JIb3ZlckFjdGl2aXR5KCk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICB0aGlzLmRlc3Ryb3llZC5uZXh0KCk7XG4gICAgdGhpcy5kZXN0cm95ZWQuY29tcGxldGUoKTtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSB1bmlxdWUgQ1NTIGNsYXNzIG5hbWUgZm9yIHRoaXMgdGFibGUgaW5zdGFuY2UuICovXG4gIGdldFVuaXF1ZUNzc0NsYXNzKCkge1xuICAgIHJldHVybiBgY2RrLWNvbHVtbi1yZXNpemUtJHt0aGlzLnNlbGVjdG9ySWR9YDtcbiAgfVxuXG4gIC8qKiBDYWxsZWQgd2hlbiBhIGNvbHVtbiBpbiB0aGUgdGFibGUgaXMgcmVzaXplZC4gQXBwbGllcyBhIGNzcyBjbGFzcyB0byB0aGUgdGFibGUgZWxlbWVudC4gKi9cbiAgc2V0UmVzaXplZCgpIHtcbiAgICB0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCEuY2xhc3NMaXN0LmFkZChXSVRIX1JFU0laRURfQ09MVU1OX0NMQVNTKTtcbiAgfVxuXG4gIHByaXZhdGUgX2xpc3RlbkZvclJvd0hvdmVyRXZlbnRzKCkge1xuICAgIHRoaXMubmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgIGNvbnN0IGVsZW1lbnQgPSB0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCE7XG5cbiAgICAgIGZyb21FdmVudDxNb3VzZUV2ZW50PihlbGVtZW50LCAnbW91c2VvdmVyJykucGlwZShcbiAgICAgICAgICBtYXAoZXZlbnQgPT4gX2Nsb3Nlc3QoZXZlbnQudGFyZ2V0LCBIRUFERVJfQ0VMTF9TRUxFQ1RPUikpLFxuICAgICAgICAgIHRha2VVbnRpbCh0aGlzLmRlc3Ryb3llZCksXG4gICAgICAgICAgKS5zdWJzY3JpYmUodGhpcy5ldmVudERpc3BhdGNoZXIuaGVhZGVyQ2VsbEhvdmVyZWQpO1xuICAgICAgZnJvbUV2ZW50PE1vdXNlRXZlbnQ+KGVsZW1lbnQsICdtb3VzZWxlYXZlJykucGlwZShcbiAgICAgICAgICBmaWx0ZXIoZXZlbnQgPT4gISFldmVudC5yZWxhdGVkVGFyZ2V0ICYmXG4gICAgICAgICAgICAgICFfbWF0Y2hlcyhldmVudC5yZWxhdGVkVGFyZ2V0IGFzIEVsZW1lbnQsIFJFU0laRV9PVkVSTEFZX1NFTEVDVE9SKSksXG4gICAgICAgICAgbWFwVG8obnVsbCksXG4gICAgICAgICAgdGFrZVVudGlsKHRoaXMuZGVzdHJveWVkKSxcbiAgICAgICAgICApLnN1YnNjcmliZSh0aGlzLmV2ZW50RGlzcGF0Y2hlci5oZWFkZXJDZWxsSG92ZXJlZCk7XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIF9saXN0ZW5Gb3JSZXNpemVBY3Rpdml0eSgpIHtcbiAgICBtZXJnZShcbiAgICAgICAgdGhpcy5ldmVudERpc3BhdGNoZXIub3ZlcmxheUhhbmRsZUFjdGl2ZUZvckNlbGwucGlwZShtYXBUbyh1bmRlZmluZWQpKSxcbiAgICAgICAgdGhpcy5ub3RpZmllci50cmlnZ2VyUmVzaXplLnBpcGUobWFwVG8odW5kZWZpbmVkKSksXG4gICAgICAgIHRoaXMubm90aWZpZXIucmVzaXplQ29tcGxldGVkLnBpcGUobWFwVG8odW5kZWZpbmVkKSlcbiAgICApLnBpcGUoXG4gICAgICAgIHRha2VVbnRpbCh0aGlzLmRlc3Ryb3llZCksXG4gICAgICAgIHRha2UoMSksXG4gICAgKS5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgdGhpcy5zZXRSZXNpemVkKCk7XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIF9saXN0ZW5Gb3JIb3ZlckFjdGl2aXR5KCkge1xuICAgIHRoaXMuZXZlbnREaXNwYXRjaGVyLmhlYWRlclJvd0hvdmVyZWRPckFjdGl2ZURpc3RpbmN0LnBpcGUoXG4gICAgICAgIHN0YXJ0V2l0aChudWxsKSxcbiAgICAgICAgcGFpcndpc2UoKSxcbiAgICAgICAgdGFrZVVudGlsKHRoaXMuZGVzdHJveWVkKSxcbiAgICApLnN1YnNjcmliZSgoW3ByZXZpb3VzUm93LCBob3ZlcmVkUm93XSkgPT4ge1xuICAgICAgaWYgKGhvdmVyZWRSb3cpIHtcbiAgICAgICAgaG92ZXJlZFJvdy5jbGFzc0xpc3QuYWRkKEhPVkVSX09SX0FDVElWRV9DTEFTUyk7XG4gICAgICB9XG4gICAgICBpZiAocHJldmlvdXNSb3cpIHtcbiAgICAgICAgcHJldmlvdXNSb3cuY2xhc3NMaXN0LnJlbW92ZShIT1ZFUl9PUl9BQ1RJVkVfQ0xBU1MpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG59XG4iXX0=