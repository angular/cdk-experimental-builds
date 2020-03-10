/**
 * @fileoverview added by tsickle
 * Generated from: src/cdk-experimental/column-resize/overlay-handle.ts
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
import { coerceCssPixelValue } from '@angular/cdk/coercion';
import { ESCAPE } from '@angular/cdk/keycodes';
import { fromEvent, ReplaySubject } from 'rxjs';
import { distinctUntilChanged, filter, map, mapTo, pairwise, startWith, takeUntil, } from 'rxjs/operators';
import { _closest } from '@angular/cdk-experimental/popover-edit';
import { HEADER_CELL_SELECTOR } from './selectors';
// TODO: Take another look at using cdk drag drop. IIRC I ran into a couple
// good reasons for not using it but I don't remember what they were at this point.
/**
 * Base class for a component shown over the edge of a resizable column that is responsible
 * for handling column resize mouse events and displaying any visible UI on the column edge.
 * @abstract
 */
export class ResizeOverlayHandle {
    constructor() {
        this.destroyed = new ReplaySubject();
    }
    /**
     * @return {?}
     */
    ngAfterViewInit() {
        this._listenForMouseEvents();
    }
    /**
     * @return {?}
     */
    ngOnDestroy() {
        this.destroyed.next();
        this.destroyed.complete();
    }
    /**
     * @private
     * @return {?}
     */
    _listenForMouseEvents() {
        this.ngZone.runOutsideAngular((/**
         * @return {?}
         */
        () => {
            /** @type {?} */
            const takeUntilDestroyed = takeUntil(this.destroyed);
            fromEvent((/** @type {?} */ (this.elementRef.nativeElement)), 'mouseenter').pipe(takeUntilDestroyed, mapTo((/** @type {?} */ (this.resizeRef.origin.nativeElement)))).subscribe((/**
             * @param {?} cell
             * @return {?}
             */
            cell => this.eventDispatcher.headerCellHovered.next(cell)));
            fromEvent((/** @type {?} */ (this.elementRef.nativeElement)), 'mouseleave').pipe(takeUntilDestroyed, map((/**
             * @param {?} event
             * @return {?}
             */
            event => event.relatedTarget &&
                _closest((/** @type {?} */ (event.relatedTarget)), HEADER_CELL_SELECTOR)))).subscribe((/**
             * @param {?} cell
             * @return {?}
             */
            cell => this.eventDispatcher.headerCellHovered.next(cell)));
            fromEvent((/** @type {?} */ (this.elementRef.nativeElement)), 'mousedown')
                .pipe(takeUntilDestroyed).subscribe((/**
             * @param {?} mousedownEvent
             * @return {?}
             */
            mousedownEvent => {
                this._dragStarted(mousedownEvent);
            }));
        }));
    }
    /**
     * @private
     * @param {?} mousedownEvent
     * @return {?}
     */
    _dragStarted(mousedownEvent) {
        // Only allow dragging using the left mouse button.
        if (mousedownEvent.button !== 0) {
            return;
        }
        /** @type {?} */
        const mouseup = fromEvent(this.document, 'mouseup');
        /** @type {?} */
        const mousemove = fromEvent(this.document, 'mousemove');
        /** @type {?} */
        const escape = fromEvent(this.document, 'keyup')
            .pipe(filter((/**
         * @param {?} event
         * @return {?}
         */
        event => event.keyCode === ESCAPE)));
        /** @type {?} */
        const startX = mousedownEvent.screenX;
        /** @type {?} */
        const initialOverlayOffset = this._getOverlayOffset();
        /** @type {?} */
        const initialSize = this._getOriginWidth();
        /** @type {?} */
        let overlayOffset = initialOverlayOffset;
        /** @type {?} */
        let originOffset = this._getOriginOffset();
        /** @type {?} */
        let size = initialSize;
        /** @type {?} */
        let overshot = 0;
        this.updateResizeActive(true);
        mouseup.pipe(takeUntil(escape), takeUntil(this.destroyed)).subscribe((/**
         * @param {?} __0
         * @return {?}
         */
        ({ screenX }) => {
            this._notifyResizeEnded(size, screenX !== startX);
        }));
        escape.pipe(takeUntil(mouseup), takeUntil(this.destroyed)).subscribe((/**
         * @return {?}
         */
        () => {
            this._notifyResizeEnded(initialSize);
        }));
        mousemove.pipe(map((/**
         * @param {?} __0
         * @return {?}
         */
        ({ screenX }) => screenX)), startWith(startX), distinctUntilChanged(), pairwise(), takeUntil(mouseup), takeUntil(escape), takeUntil(this.destroyed)).subscribe((/**
         * @param {?} __0
         * @return {?}
         */
        ([prevX, currX]) => {
            /** @type {?} */
            let deltaX = currX - prevX;
            // If the mouse moved further than the resize was able to match, limit the
            // movement of the overlay to match the actual size and position of the origin.
            if (overshot !== 0) {
                if (overshot < 0 && deltaX < 0 || overshot > 0 && deltaX > 0) {
                    overshot += deltaX;
                    return;
                }
                else {
                    /** @type {?} */
                    const remainingOvershot = overshot + deltaX;
                    overshot = overshot > 0 ?
                        Math.max(remainingOvershot, 0) : Math.min(remainingOvershot, 0);
                    deltaX = remainingOvershot - overshot;
                    if (deltaX === 0) {
                        return;
                    }
                }
            }
            /** @type {?} */
            let computedNewSize = size + (this._isLtr() ? deltaX : -deltaX);
            computedNewSize = Math.min(Math.max(computedNewSize, this.resizeRef.minWidthPx, 0), this.resizeRef.maxWidthPx);
            this.resizeNotifier.triggerResize.next({ columnId: this.columnDef.name, size: computedNewSize });
            /** @type {?} */
            const originNewSize = this._getOriginWidth();
            /** @type {?} */
            const originNewOffset = this._getOriginOffset();
            /** @type {?} */
            const originOffsetDeltaX = originNewOffset - originOffset;
            /** @type {?} */
            const originSizeDeltaX = originNewSize - size;
            size = originNewSize;
            originOffset = originNewOffset;
            overshot += deltaX + (this._isLtr() ? -originSizeDeltaX : originSizeDeltaX);
            overlayOffset += originSizeDeltaX + originOffsetDeltaX;
            this._updateOverlayOffset(overlayOffset);
        }));
    }
    /**
     * @protected
     * @param {?} active
     * @return {?}
     */
    updateResizeActive(active) {
        this.eventDispatcher.overlayHandleActiveForCell.next(active ? (/** @type {?} */ (this.resizeRef.origin.nativeElement)) : null);
    }
    /**
     * @private
     * @return {?}
     */
    _getOriginWidth() {
        return (/** @type {?} */ (this.resizeRef.origin.nativeElement)).offsetWidth;
    }
    /**
     * @private
     * @return {?}
     */
    _getOriginOffset() {
        /** @type {?} */
        const originElement = (/** @type {?} */ (this.resizeRef.origin.nativeElement));
        /** @type {?} */
        const offsetLeft = originElement.offsetLeft;
        return this._isLtr() ?
            offsetLeft :
            (/** @type {?} */ (originElement.offsetParent)).offsetWidth - (offsetLeft + this._getOriginWidth());
    }
    /**
     * @private
     * @return {?}
     */
    _getOverlayOffset() {
        /** @type {?} */
        const overlayElement = this.resizeRef.overlayRef.overlayElement;
        return this._isLtr() ?
            parseInt((/** @type {?} */ (overlayElement.style.left)), 10) : parseInt((/** @type {?} */ (overlayElement.style.right)), 10);
    }
    /**
     * @private
     * @param {?} offset
     * @return {?}
     */
    _updateOverlayOffset(offset) {
        /** @type {?} */
        const overlayElement = this.resizeRef.overlayRef.overlayElement;
        /** @type {?} */
        const overlayOffsetCssValue = coerceCssPixelValue(offset);
        if (this._isLtr()) {
            overlayElement.style.left = overlayOffsetCssValue;
        }
        else {
            overlayElement.style.right = overlayOffsetCssValue;
        }
    }
    /**
     * @private
     * @return {?}
     */
    _isLtr() {
        return this.directionality.value === 'ltr';
    }
    /**
     * @private
     * @param {?} size
     * @param {?=} completedSuccessfully
     * @return {?}
     */
    _notifyResizeEnded(size, completedSuccessfully = false) {
        this.updateResizeActive(false);
        this.ngZone.run((/**
         * @return {?}
         */
        () => {
            /** @type {?} */
            const sizeMessage = { columnId: this.columnDef.name, size };
            if (completedSuccessfully) {
                this.resizeNotifier.resizeCompleted.next(sizeMessage);
            }
            else {
                this.resizeNotifier.resizeCanceled.next(sizeMessage);
            }
        }));
    }
}
ResizeOverlayHandle.decorators = [
    { type: Directive }
];
if (false) {
    /**
     * @type {?}
     * @protected
     */
    ResizeOverlayHandle.prototype.destroyed;
    /**
     * @type {?}
     * @protected
     */
    ResizeOverlayHandle.prototype.columnDef;
    /**
     * @type {?}
     * @protected
     */
    ResizeOverlayHandle.prototype.document;
    /**
     * @type {?}
     * @protected
     */
    ResizeOverlayHandle.prototype.directionality;
    /**
     * @type {?}
     * @protected
     */
    ResizeOverlayHandle.prototype.elementRef;
    /**
     * @type {?}
     * @protected
     */
    ResizeOverlayHandle.prototype.eventDispatcher;
    /**
     * @type {?}
     * @protected
     */
    ResizeOverlayHandle.prototype.ngZone;
    /**
     * @type {?}
     * @protected
     */
    ResizeOverlayHandle.prototype.resizeNotifier;
    /**
     * @type {?}
     * @protected
     */
    ResizeOverlayHandle.prototype.resizeRef;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3ZlcmxheS1oYW5kbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrLWV4cGVyaW1lbnRhbC9jb2x1bW4tcmVzaXplL292ZXJsYXktaGFuZGxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQVFBLE9BQU8sRUFBZ0IsU0FBUyxFQUFnQyxNQUFNLGVBQWUsQ0FBQztBQUN0RixPQUFPLEVBQUMsbUJBQW1CLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUUxRCxPQUFPLEVBQUMsTUFBTSxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFFN0MsT0FBTyxFQUFDLFNBQVMsRUFBRSxhQUFhLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDOUMsT0FBTyxFQUNMLG9CQUFvQixFQUNwQixNQUFNLEVBQ04sR0FBRyxFQUNILEtBQUssRUFDTCxRQUFRLEVBQ1IsU0FBUyxFQUNULFNBQVMsR0FDVixNQUFNLGdCQUFnQixDQUFDO0FBRXhCLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSx3Q0FBd0MsQ0FBQztBQUVoRSxPQUFPLEVBQUMsb0JBQW9CLEVBQUMsTUFBTSxhQUFhLENBQUM7Ozs7Ozs7O0FBWWpELE1BQU0sT0FBZ0IsbUJBQW1CO0lBRHpDO1FBRXFCLGNBQVMsR0FBRyxJQUFJLGFBQWEsRUFBUSxDQUFDO0lBNkszRCxDQUFDOzs7O0lBbEtDLGVBQWU7UUFDYixJQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQztJQUMvQixDQUFDOzs7O0lBRUQsV0FBVztRQUNULElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDdEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUM1QixDQUFDOzs7OztJQUVPLHFCQUFxQjtRQUMzQixJQUFJLENBQUMsTUFBTSxDQUFDLGlCQUFpQjs7O1FBQUMsR0FBRyxFQUFFOztrQkFDM0Isa0JBQWtCLEdBQUcsU0FBUyxDQUFhLElBQUksQ0FB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QkFBcUIsQ0FBQztTQUNwRDtJQUNILENBQUM7Ozs7O0lBRU8sTUFBTTtRQUNaLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEtBQUssS0FBSyxDQUFDO0lBQzdDLENBQUM7Ozs7Ozs7SUFFTyxrQkFBa0IsQ0FBQyxJQUFZLEVBQUUscUJBQXFCLEdBQUcsS0FBSztRQUNwRSxJQUFJLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFL0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHOzs7UUFBQyxHQUFHLEVBQUU7O2tCQUNiLFdBQVcsR0FBRyxFQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUM7WUFDekQsSUFBSSxxQkFBcUIsRUFBRTtnQkFDekIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO2FBQ3ZEO2lCQUFNO2dCQUNMLElBQUksQ0FBQyxjQUFjLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQzthQUN0RDtRQUNILENBQUMsRUFBQyxDQUFDO0lBQ0wsQ0FBQzs7O1lBOUtGLFNBQVM7Ozs7Ozs7SUFFUix3Q0FBeUQ7Ozs7O0lBRXpELHdDQUFvRDs7Ozs7SUFDcEQsdUNBQStDOzs7OztJQUMvQyw2Q0FBMkQ7Ozs7O0lBQzNELHlDQUFtRDs7Ozs7SUFDbkQsOENBQXNFOzs7OztJQUN0RSxxQ0FBMkM7Ozs7O0lBQzNDLDZDQUF1RTs7Ozs7SUFDdkUsd0NBQWlEIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7QWZ0ZXJWaWV3SW5pdCwgRGlyZWN0aXZlLCBFbGVtZW50UmVmLCBPbkRlc3Ryb3ksIE5nWm9uZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge2NvZXJjZUNzc1BpeGVsVmFsdWV9IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2VyY2lvbic7XG5pbXBvcnQge0RpcmVjdGlvbmFsaXR5fSBmcm9tICdAYW5ndWxhci9jZGsvYmlkaSc7XG5pbXBvcnQge0VTQ0FQRX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2tleWNvZGVzJztcbmltcG9ydCB7Q2RrQ29sdW1uRGVmfSBmcm9tICdAYW5ndWxhci9jZGsvdGFibGUnO1xuaW1wb3J0IHtmcm9tRXZlbnQsIFJlcGxheVN1YmplY3R9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHtcbiAgZGlzdGluY3RVbnRpbENoYW5nZWQsXG4gIGZpbHRlcixcbiAgbWFwLFxuICBtYXBUbyxcbiAgcGFpcndpc2UsXG4gIHN0YXJ0V2l0aCxcbiAgdGFrZVVudGlsLFxufSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbmltcG9ydCB7X2Nsb3Nlc3R9IGZyb20gJ0Bhbmd1bGFyL2Nkay1leHBlcmltZW50YWwvcG9wb3Zlci1lZGl0JztcblxuaW1wb3J0IHtIRUFERVJfQ0VMTF9TRUxFQ1RPUn0gZnJvbSAnLi9zZWxlY3RvcnMnO1xuaW1wb3J0IHtDb2x1bW5SZXNpemVOb3RpZmllclNvdXJjZX0gZnJvbSAnLi9jb2x1bW4tcmVzaXplLW5vdGlmaWVyJztcbmltcG9ydCB7SGVhZGVyUm93RXZlbnREaXNwYXRjaGVyfSBmcm9tICcuL2V2ZW50LWRpc3BhdGNoZXInO1xuaW1wb3J0IHtSZXNpemVSZWZ9IGZyb20gJy4vcmVzaXplLXJlZic7XG5cbi8vIFRPRE86IFRha2UgYW5vdGhlciBsb29rIGF0IHVzaW5nIGNkayBkcmFnIGRyb3AuIElJUkMgSSByYW4gaW50byBhIGNvdXBsZVxuLy8gZ29vZCByZWFzb25zIGZvciBub3QgdXNpbmcgaXQgYnV0IEkgZG9uJ3QgcmVtZW1iZXIgd2hhdCB0aGV5IHdlcmUgYXQgdGhpcyBwb2ludC5cbi8qKlxuICogQmFzZSBjbGFzcyBmb3IgYSBjb21wb25lbnQgc2hvd24gb3ZlciB0aGUgZWRnZSBvZiBhIHJlc2l6YWJsZSBjb2x1bW4gdGhhdCBpcyByZXNwb25zaWJsZVxuICogZm9yIGhhbmRsaW5nIGNvbHVtbiByZXNpemUgbW91c2UgZXZlbnRzIGFuZCBkaXNwbGF5aW5nIGFueSB2aXNpYmxlIFVJIG9uIHRoZSBjb2x1bW4gZWRnZS5cbiAqL1xuQERpcmVjdGl2ZSgpXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgUmVzaXplT3ZlcmxheUhhbmRsZSBpbXBsZW1lbnRzIEFmdGVyVmlld0luaXQsIE9uRGVzdHJveSB7XG4gIHByb3RlY3RlZCByZWFkb25seSBkZXN0cm95ZWQgPSBuZXcgUmVwbGF5U3ViamVjdDx2b2lkPigpO1xuXG4gIHByb3RlY3RlZCBhYnN0cmFjdCByZWFkb25seSBjb2x1bW5EZWY6IENka0NvbHVtbkRlZjtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IHJlYWRvbmx5IGRvY3VtZW50OiBEb2N1bWVudDtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IHJlYWRvbmx5IGRpcmVjdGlvbmFsaXR5OiBEaXJlY3Rpb25hbGl0eTtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IHJlYWRvbmx5IGVsZW1lbnRSZWY6IEVsZW1lbnRSZWY7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCByZWFkb25seSBldmVudERpc3BhdGNoZXI6IEhlYWRlclJvd0V2ZW50RGlzcGF0Y2hlcjtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IHJlYWRvbmx5IG5nWm9uZTogTmdab25lO1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgcmVhZG9ubHkgcmVzaXplTm90aWZpZXI6IENvbHVtblJlc2l6ZU5vdGlmaWVyU291cmNlO1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgcmVhZG9ubHkgcmVzaXplUmVmOiBSZXNpemVSZWY7XG5cbiAgbmdBZnRlclZpZXdJbml0KCkge1xuICAgIHRoaXMuX2xpc3RlbkZvck1vdXNlRXZlbnRzKCk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICB0aGlzLmRlc3Ryb3llZC5uZXh0KCk7XG4gICAgdGhpcy5kZXN0cm95ZWQuY29tcGxldGUoKTtcbiAgfVxuXG4gIHByaXZhdGUgX2xpc3RlbkZvck1vdXNlRXZlbnRzKCkge1xuICAgIHRoaXMubmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgIGNvbnN0IHRha2VVbnRpbERlc3Ryb3llZCA9IHRha2VVbnRpbDxNb3VzZUV2ZW50Pih0aGlzLmRlc3Ryb3llZCk7XG5cbiAgICAgIGZyb21FdmVudDxNb3VzZUV2ZW50Pih0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCEsICdtb3VzZWVudGVyJykucGlwZShcbiAgICAgICAgICB0YWtlVW50aWxEZXN0cm95ZWQsXG4gICAgICAgICAgbWFwVG8odGhpcy5yZXNpemVSZWYub3JpZ2luLm5hdGl2ZUVsZW1lbnQhKSxcbiAgICAgICkuc3Vic2NyaWJlKGNlbGwgPT4gdGhpcy5ldmVudERpc3BhdGNoZXIuaGVhZGVyQ2VsbEhvdmVyZWQubmV4dChjZWxsKSk7XG5cbiAgICAgIGZyb21FdmVudDxNb3VzZUV2ZW50Pih0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCEsICdtb3VzZWxlYXZlJykucGlwZShcbiAgICAgICAgICB0YWtlVW50aWxEZXN0cm95ZWQsXG4gICAgICAgICAgbWFwKGV2ZW50ID0+IGV2ZW50LnJlbGF0ZWRUYXJnZXQgJiZcbiAgICAgICAgICAgICAgX2Nsb3Nlc3QoZXZlbnQucmVsYXRlZFRhcmdldCBhcyBFbGVtZW50LCBIRUFERVJfQ0VMTF9TRUxFQ1RPUikpLFxuICAgICAgKS5zdWJzY3JpYmUoY2VsbCA9PiB0aGlzLmV2ZW50RGlzcGF0Y2hlci5oZWFkZXJDZWxsSG92ZXJlZC5uZXh0KGNlbGwpKTtcblxuICAgICAgZnJvbUV2ZW50PE1vdXNlRXZlbnQ+KHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50ISwgJ21vdXNlZG93bicpXG4gICAgICAgICAgLnBpcGUodGFrZVVudGlsRGVzdHJveWVkKS5zdWJzY3JpYmUobW91c2Vkb3duRXZlbnQgPT4ge1xuICAgICAgICB0aGlzLl9kcmFnU3RhcnRlZChtb3VzZWRvd25FdmVudCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX2RyYWdTdGFydGVkKG1vdXNlZG93bkV2ZW50OiBNb3VzZUV2ZW50KSB7XG4gICAgLy8gT25seSBhbGxvdyBkcmFnZ2luZyB1c2luZyB0aGUgbGVmdCBtb3VzZSBidXR0b24uXG4gICAgaWYgKG1vdXNlZG93bkV2ZW50LmJ1dHRvbiAhPT0gMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IG1vdXNldXAgPSBmcm9tRXZlbnQ8TW91c2VFdmVudD4odGhpcy5kb2N1bWVudCwgJ21vdXNldXAnKTtcbiAgICBjb25zdCBtb3VzZW1vdmUgPSBmcm9tRXZlbnQ8TW91c2VFdmVudD4odGhpcy5kb2N1bWVudCwgJ21vdXNlbW92ZScpO1xuICAgIGNvbnN0IGVzY2FwZSA9IGZyb21FdmVudDxLZXlib2FyZEV2ZW50Pih0aGlzLmRvY3VtZW50LCAna2V5dXAnKVxuICAgICAgICAucGlwZShmaWx0ZXIoZXZlbnQgPT4gZXZlbnQua2V5Q29kZSA9PT0gRVNDQVBFKSk7XG5cbiAgICBjb25zdCBzdGFydFggPSBtb3VzZWRvd25FdmVudC5zY3JlZW5YO1xuXG4gICAgY29uc3QgaW5pdGlhbE92ZXJsYXlPZmZzZXQgPSB0aGlzLl9nZXRPdmVybGF5T2Zmc2V0KCk7XG4gICAgY29uc3QgaW5pdGlhbFNpemUgPSB0aGlzLl9nZXRPcmlnaW5XaWR0aCgpO1xuICAgIGxldCBvdmVybGF5T2Zmc2V0ID0gaW5pdGlhbE92ZXJsYXlPZmZzZXQ7XG4gICAgbGV0IG9yaWdpbk9mZnNldCA9IHRoaXMuX2dldE9yaWdpbk9mZnNldCgpO1xuICAgIGxldCBzaXplID0gaW5pdGlhbFNpemU7XG4gICAgbGV0IG92ZXJzaG90ID0gMDtcblxuICAgIHRoaXMudXBkYXRlUmVzaXplQWN0aXZlKHRydWUpO1xuXG4gICAgbW91c2V1cC5waXBlKHRha2VVbnRpbChlc2NhcGUpLCB0YWtlVW50aWwodGhpcy5kZXN0cm95ZWQpKS5zdWJzY3JpYmUoKHtzY3JlZW5YfSkgPT4ge1xuICAgICAgdGhpcy5fbm90aWZ5UmVzaXplRW5kZWQoc2l6ZSwgc2NyZWVuWCAhPT0gc3RhcnRYKTtcbiAgICB9KTtcblxuICAgIGVzY2FwZS5waXBlKHRha2VVbnRpbChtb3VzZXVwKSwgdGFrZVVudGlsKHRoaXMuZGVzdHJveWVkKSkuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgIHRoaXMuX25vdGlmeVJlc2l6ZUVuZGVkKGluaXRpYWxTaXplKTtcbiAgICB9KTtcblxuICAgIG1vdXNlbW92ZS5waXBlKFxuICAgICAgICBtYXAoKHtzY3JlZW5YfSkgPT4gc2NyZWVuWCksXG4gICAgICAgIHN0YXJ0V2l0aChzdGFydFgpLFxuICAgICAgICBkaXN0aW5jdFVudGlsQ2hhbmdlZCgpLFxuICAgICAgICBwYWlyd2lzZSgpLFxuICAgICAgICB0YWtlVW50aWwobW91c2V1cCksXG4gICAgICAgIHRha2VVbnRpbChlc2NhcGUpLFxuICAgICAgICB0YWtlVW50aWwodGhpcy5kZXN0cm95ZWQpLFxuICAgICkuc3Vic2NyaWJlKChbcHJldlgsIGN1cnJYXSkgPT4ge1xuICAgICAgbGV0IGRlbHRhWCA9IGN1cnJYIC0gcHJldlg7XG5cbiAgICAgIC8vIElmIHRoZSBtb3VzZSBtb3ZlZCBmdXJ0aGVyIHRoYW4gdGhlIHJlc2l6ZSB3YXMgYWJsZSB0byBtYXRjaCwgbGltaXQgdGhlXG4gICAgICAvLyBtb3ZlbWVudCBvZiB0aGUgb3ZlcmxheSB0byBtYXRjaCB0aGUgYWN0dWFsIHNpemUgYW5kIHBvc2l0aW9uIG9mIHRoZSBvcmlnaW4uXG4gICAgICBpZiAob3ZlcnNob3QgIT09IDApIHtcbiAgICAgICAgaWYgKG92ZXJzaG90IDwgMCAmJiBkZWx0YVggPCAwIHx8IG92ZXJzaG90ID4gMCAmJiBkZWx0YVggPiAwKSB7XG4gICAgICAgICAgb3ZlcnNob3QgKz0gZGVsdGFYO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zdCByZW1haW5pbmdPdmVyc2hvdCA9IG92ZXJzaG90ICsgZGVsdGFYO1xuICAgICAgICAgIG92ZXJzaG90ID0gb3ZlcnNob3QgPiAwID9cbiAgICAgICAgICAgICAgTWF0aC5tYXgocmVtYWluaW5nT3ZlcnNob3QsIDApIDogTWF0aC5taW4ocmVtYWluaW5nT3ZlcnNob3QsIDApO1xuICAgICAgICAgIGRlbHRhWCA9IHJlbWFpbmluZ092ZXJzaG90IC0gb3ZlcnNob3Q7XG5cbiAgICAgICAgICBpZiAoZGVsdGFYID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGxldCBjb21wdXRlZE5ld1NpemU6IG51bWJlciA9IHNpemUgKyAodGhpcy5faXNMdHIoKSA/IGRlbHRhWCA6IC1kZWx0YVgpO1xuICAgICAgY29tcHV0ZWROZXdTaXplID0gTWF0aC5taW4oXG4gICAgICAgICAgTWF0aC5tYXgoY29tcHV0ZWROZXdTaXplLCB0aGlzLnJlc2l6ZVJlZi5taW5XaWR0aFB4LCAwKSwgdGhpcy5yZXNpemVSZWYubWF4V2lkdGhQeCk7XG5cbiAgICAgIHRoaXMucmVzaXplTm90aWZpZXIudHJpZ2dlclJlc2l6ZS5uZXh0KFxuICAgICAgICAgIHtjb2x1bW5JZDogdGhpcy5jb2x1bW5EZWYubmFtZSwgc2l6ZTogY29tcHV0ZWROZXdTaXplfSk7XG5cbiAgICAgIGNvbnN0IG9yaWdpbk5ld1NpemUgPSB0aGlzLl9nZXRPcmlnaW5XaWR0aCgpO1xuICAgICAgY29uc3Qgb3JpZ2luTmV3T2Zmc2V0ID0gdGhpcy5fZ2V0T3JpZ2luT2Zmc2V0KCk7XG4gICAgICBjb25zdCBvcmlnaW5PZmZzZXREZWx0YVggPSBvcmlnaW5OZXdPZmZzZXQgLSBvcmlnaW5PZmZzZXQ7XG4gICAgICBjb25zdCBvcmlnaW5TaXplRGVsdGFYID0gb3JpZ2luTmV3U2l6ZSAtIHNpemU7XG4gICAgICBzaXplID0gb3JpZ2luTmV3U2l6ZTtcbiAgICAgIG9yaWdpbk9mZnNldCA9IG9yaWdpbk5ld09mZnNldDtcblxuICAgICAgb3ZlcnNob3QgKz0gZGVsdGFYICsgKHRoaXMuX2lzTHRyKCkgPyAtb3JpZ2luU2l6ZURlbHRhWCA6IG9yaWdpblNpemVEZWx0YVgpO1xuICAgICAgb3ZlcmxheU9mZnNldCArPSBvcmlnaW5TaXplRGVsdGFYICsgb3JpZ2luT2Zmc2V0RGVsdGFYO1xuXG4gICAgICB0aGlzLl91cGRhdGVPdmVybGF5T2Zmc2V0KG92ZXJsYXlPZmZzZXQpO1xuICAgIH0pO1xuICB9XG5cbiAgcHJvdGVjdGVkIHVwZGF0ZVJlc2l6ZUFjdGl2ZShhY3RpdmU6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLmV2ZW50RGlzcGF0Y2hlci5vdmVybGF5SGFuZGxlQWN0aXZlRm9yQ2VsbC5uZXh0KFxuICAgICAgICBhY3RpdmUgPyB0aGlzLnJlc2l6ZVJlZi5vcmlnaW4ubmF0aXZlRWxlbWVudCEgOiBudWxsKTtcbiAgfVxuXG4gIHByaXZhdGUgX2dldE9yaWdpbldpZHRoKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMucmVzaXplUmVmLm9yaWdpbi5uYXRpdmVFbGVtZW50IS5vZmZzZXRXaWR0aDtcbiAgfVxuXG4gIHByaXZhdGUgX2dldE9yaWdpbk9mZnNldCgpOiBudW1iZXIge1xuICAgIGNvbnN0IG9yaWdpbkVsZW1lbnQgPSB0aGlzLnJlc2l6ZVJlZi5vcmlnaW4ubmF0aXZlRWxlbWVudCE7XG4gICAgY29uc3Qgb2Zmc2V0TGVmdCA9IG9yaWdpbkVsZW1lbnQub2Zmc2V0TGVmdDtcblxuICAgIHJldHVybiB0aGlzLl9pc0x0cigpID9cbiAgICAgICAgb2Zmc2V0TGVmdCA6XG4gICAgICAgIG9yaWdpbkVsZW1lbnQub2Zmc2V0UGFyZW50IS5vZmZzZXRXaWR0aCAtIChvZmZzZXRMZWZ0ICsgdGhpcy5fZ2V0T3JpZ2luV2lkdGgoKSk7XG4gIH1cblxuICBwcml2YXRlIF9nZXRPdmVybGF5T2Zmc2V0KCk6IG51bWJlciB7XG4gICAgY29uc3Qgb3ZlcmxheUVsZW1lbnQgPSB0aGlzLnJlc2l6ZVJlZi5vdmVybGF5UmVmLm92ZXJsYXlFbGVtZW50O1xuICAgIHJldHVybiB0aGlzLl9pc0x0cigpID9cbiAgICAgICAgcGFyc2VJbnQob3ZlcmxheUVsZW1lbnQuc3R5bGUubGVmdCEsIDEwKSA6IHBhcnNlSW50KG92ZXJsYXlFbGVtZW50LnN0eWxlLnJpZ2h0ISwgMTApO1xuICB9XG5cbiAgcHJpdmF0ZSBfdXBkYXRlT3ZlcmxheU9mZnNldChvZmZzZXQ6IG51bWJlcik6IHZvaWQge1xuICAgIGNvbnN0IG92ZXJsYXlFbGVtZW50ID0gdGhpcy5yZXNpemVSZWYub3ZlcmxheVJlZi5vdmVybGF5RWxlbWVudDtcbiAgICBjb25zdCBvdmVybGF5T2Zmc2V0Q3NzVmFsdWUgPSBjb2VyY2VDc3NQaXhlbFZhbHVlKG9mZnNldCk7XG5cbiAgICBpZiAodGhpcy5faXNMdHIoKSkge1xuICAgICAgb3ZlcmxheUVsZW1lbnQuc3R5bGUubGVmdCA9IG92ZXJsYXlPZmZzZXRDc3NWYWx1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgb3ZlcmxheUVsZW1lbnQuc3R5bGUucmlnaHQgPSBvdmVybGF5T2Zmc2V0Q3NzVmFsdWU7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfaXNMdHIoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuZGlyZWN0aW9uYWxpdHkudmFsdWUgPT09ICdsdHInO1xuICB9XG5cbiAgcHJpdmF0ZSBfbm90aWZ5UmVzaXplRW5kZWQoc2l6ZTogbnVtYmVyLCBjb21wbGV0ZWRTdWNjZXNzZnVsbHkgPSBmYWxzZSk6IHZvaWQge1xuICAgIHRoaXMudXBkYXRlUmVzaXplQWN0aXZlKGZhbHNlKTtcblxuICAgIHRoaXMubmdab25lLnJ1bigoKSA9PiB7XG4gICAgICBjb25zdCBzaXplTWVzc2FnZSA9IHtjb2x1bW5JZDogdGhpcy5jb2x1bW5EZWYubmFtZSwgc2l6ZX07XG4gICAgICBpZiAoY29tcGxldGVkU3VjY2Vzc2Z1bGx5KSB7XG4gICAgICAgIHRoaXMucmVzaXplTm90aWZpZXIucmVzaXplQ29tcGxldGVkLm5leHQoc2l6ZU1lc3NhZ2UpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5yZXNpemVOb3RpZmllci5yZXNpemVDYW5jZWxlZC5uZXh0KHNpemVNZXNzYWdlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufVxuIl19