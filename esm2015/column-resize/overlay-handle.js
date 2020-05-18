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
let ResizeOverlayHandle = /** @class */ (() => {
    // TODO: Take another look at using cdk drag drop. IIRC I ran into a couple
    // good reasons for not using it but I don't remember what they were at this point.
    /**
     * Base class for a component shown over the edge of a resizable column that is responsible
     * for handling column resize mouse events and displaying any visible UI on the column edge.
     * @abstract
     */
    class ResizeOverlayHandle {
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
            const initialSize = this._getOriginWidth();
            /** @type {?} */
            let overlayOffset = this._getOverlayOffset();
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
                this.resizeNotifier.triggerResize.next({ columnId: this.columnDef.name, size: computedNewSize, previousSize: size });
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
                overlayOffset += originOffsetDeltaX + (this._isLtr() ? originSizeDeltaX : 0);
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
            return (/** @type {?} */ (this.resizeRef.origin.nativeElement)).offsetLeft;
        }
        /**
         * @private
         * @return {?}
         */
        _getOverlayOffset() {
            return parseInt((/** @type {?} */ (this.resizeRef.overlayRef.overlayElement.style.left)), 10);
        }
        /**
         * @private
         * @param {?} offset
         * @return {?}
         */
        _updateOverlayOffset(offset) {
            this.resizeRef.overlayRef.overlayElement.style.left = coerceCssPixelValue(offset);
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
    return ResizeOverlayHandle;
})();
export { ResizeOverlayHandle };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3ZlcmxheS1oYW5kbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrLWV4cGVyaW1lbnRhbC9jb2x1bW4tcmVzaXplL292ZXJsYXktaGFuZGxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQVFBLE9BQU8sRUFBZ0IsU0FBUyxFQUFnQyxNQUFNLGVBQWUsQ0FBQztBQUN0RixPQUFPLEVBQUMsbUJBQW1CLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUUxRCxPQUFPLEVBQUMsTUFBTSxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFFN0MsT0FBTyxFQUFDLFNBQVMsRUFBRSxhQUFhLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDOUMsT0FBTyxFQUNMLG9CQUFvQixFQUNwQixNQUFNLEVBQ04sR0FBRyxFQUNILEtBQUssRUFDTCxRQUFRLEVBQ1IsU0FBUyxFQUNULFNBQVMsR0FDVixNQUFNLGdCQUFnQixDQUFDO0FBRXhCLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSx3Q0FBd0MsQ0FBQztBQUVoRSxPQUFPLEVBQUMsb0JBQW9CLEVBQUMsTUFBTSxhQUFhLENBQUM7Ozs7Ozs7O0FBV2pEOzs7Ozs7OztJQUFBLE1BQ3NCLG1CQUFtQjtRQUR6QztZQUVxQixjQUFTLEdBQUcsSUFBSSxhQUFhLEVBQVEsQ0FBQztRQThKM0QsQ0FBQzs7OztRQW5KQyxlQUFlO1lBQ2IsSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7UUFDL0IsQ0FBQzs7OztRQUVELFdBQVc7WUFDVCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ3RCLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDNUIsQ0FBQzs7Ozs7UUFFTyxxQkFBcUI7WUFDM0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxpQkFBaUI7OztZQUFDLEdBQUcsRUFBRTs7c0JBQzNCLGtCQUFrQixHQUFHLFNBQVMsQ0FBYSxJ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YyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7aUJBQ3ZEO3FCQUFNO29CQUNMLElBQUksQ0FBQyxjQUFjLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztpQkFDdEQ7WUFDSCxDQUFDLEVBQUMsQ0FBQztRQUNMLENBQUM7OztnQkEvSkYsU0FBUzs7SUFnS1YsMEJBQUM7S0FBQTtTQS9KcUIsbUJBQW1COzs7Ozs7SUFDdkMsd0NBQXlEOzs7OztJQUV6RCx3Q0FBb0Q7Ozs7O0lBQ3BELHVDQUErQzs7Ozs7SUFDL0MsNkNBQTJEOzs7OztJQUMzRCx5Q0FBbUQ7Ozs7O0lBQ25ELDhDQUFzRTs7Ozs7SUFDdEUscUNBQTJDOzs7OztJQUMzQyw2Q0FBdUU7Ozs7O0lBQ3ZFLHdDQUFpRCIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0FmdGVyVmlld0luaXQsIERpcmVjdGl2ZSwgRWxlbWVudFJlZiwgT25EZXN0cm95LCBOZ1pvbmV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtjb2VyY2VDc3NQaXhlbFZhbHVlfSBmcm9tICdAYW5ndWxhci9jZGsvY29lcmNpb24nO1xuaW1wb3J0IHtEaXJlY3Rpb25hbGl0eX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2JpZGknO1xuaW1wb3J0IHtFU0NBUEV9IGZyb20gJ0Bhbmd1bGFyL2Nkay9rZXljb2Rlcyc7XG5pbXBvcnQge0Nka0NvbHVtbkRlZn0gZnJvbSAnQGFuZ3VsYXIvY2RrL3RhYmxlJztcbmltcG9ydCB7ZnJvbUV2ZW50LCBSZXBsYXlTdWJqZWN0fSBmcm9tICdyeGpzJztcbmltcG9ydCB7XG4gIGRpc3RpbmN0VW50aWxDaGFuZ2VkLFxuICBmaWx0ZXIsXG4gIG1hcCxcbiAgbWFwVG8sXG4gIHBhaXJ3aXNlLFxuICBzdGFydFdpdGgsXG4gIHRha2VVbnRpbCxcbn0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuXG5pbXBvcnQge19jbG9zZXN0fSBmcm9tICdAYW5ndWxhci9jZGstZXhwZXJpbWVudGFsL3BvcG92ZXItZWRpdCc7XG5cbmltcG9ydCB7SEVBREVSX0NFTExfU0VMRUNUT1J9IGZyb20gJy4vc2VsZWN0b3JzJztcbmltcG9ydCB7Q29sdW1uUmVzaXplTm90aWZpZXJTb3VyY2V9IGZyb20gJy4vY29sdW1uLXJlc2l6ZS1ub3RpZmllcic7XG5pbXBvcnQge0hlYWRlclJvd0V2ZW50RGlzcGF0Y2hlcn0gZnJvbSAnLi9ldmVudC1kaXNwYXRjaGVyJztcbmltcG9ydCB7UmVzaXplUmVmfSBmcm9tICcuL3Jlc2l6ZS1yZWYnO1xuXG4vLyBUT0RPOiBUYWtlIGFub3RoZXIgbG9vayBhdCB1c2luZyBjZGsgZHJhZyBkcm9wLiBJSVJDIEkgcmFuIGludG8gYSBjb3VwbGVcbi8vIGdvb2QgcmVhc29ucyBmb3Igbm90IHVzaW5nIGl0IGJ1dCBJIGRvbid0IHJlbWVtYmVyIHdoYXQgdGhleSB3ZXJlIGF0IHRoaXMgcG9pbnQuXG4vKipcbiAqIEJhc2UgY2xhc3MgZm9yIGEgY29tcG9uZW50IHNob3duIG92ZXIgdGhlIGVkZ2Ugb2YgYSByZXNpemFibGUgY29sdW1uIHRoYXQgaXMgcmVzcG9uc2libGVcbiAqIGZvciBoYW5kbGluZyBjb2x1bW4gcmVzaXplIG1vdXNlIGV2ZW50cyBhbmQgZGlzcGxheWluZyBhbnkgdmlzaWJsZSBVSSBvbiB0aGUgY29sdW1uIGVkZ2UuXG4gKi9cbkBEaXJlY3RpdmUoKVxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFJlc2l6ZU92ZXJsYXlIYW5kbGUgaW1wbGVtZW50cyBBZnRlclZpZXdJbml0LCBPbkRlc3Ryb3kge1xuICBwcm90ZWN0ZWQgcmVhZG9ubHkgZGVzdHJveWVkID0gbmV3IFJlcGxheVN1YmplY3Q8dm9pZD4oKTtcblxuICBwcm90ZWN0ZWQgYWJzdHJhY3QgcmVhZG9ubHkgY29sdW1uRGVmOiBDZGtDb2x1bW5EZWY7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCByZWFkb25seSBkb2N1bWVudDogRG9jdW1lbnQ7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCByZWFkb25seSBkaXJlY3Rpb25hbGl0eTogRGlyZWN0aW9uYWxpdHk7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCByZWFkb25seSBlbGVtZW50UmVmOiBFbGVtZW50UmVmO1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgcmVhZG9ubHkgZXZlbnREaXNwYXRjaGVyOiBIZWFkZXJSb3dFdmVudERpc3BhdGNoZXI7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCByZWFkb25seSBuZ1pvbmU6IE5nWm9uZTtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IHJlYWRvbmx5IHJlc2l6ZU5vdGlmaWVyOiBDb2x1bW5SZXNpemVOb3RpZmllclNvdXJjZTtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IHJlYWRvbmx5IHJlc2l6ZVJlZjogUmVzaXplUmVmO1xuXG4gIG5nQWZ0ZXJWaWV3SW5pdCgpIHtcbiAgICB0aGlzLl9saXN0ZW5Gb3JNb3VzZUV2ZW50cygpO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgdGhpcy5kZXN0cm95ZWQubmV4dCgpO1xuICAgIHRoaXMuZGVzdHJveWVkLmNvbXBsZXRlKCk7XG4gIH1cblxuICBwcml2YXRlIF9saXN0ZW5Gb3JNb3VzZUV2ZW50cygpIHtcbiAgICB0aGlzLm5nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgICBjb25zdCB0YWtlVW50aWxEZXN0cm95ZWQgPSB0YWtlVW50aWw8TW91c2VFdmVudD4odGhpcy5kZXN0cm95ZWQpO1xuXG4gICAgICBmcm9tRXZlbnQ8TW91c2VFdmVudD4odGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQhLCAnbW91c2VlbnRlcicpLnBpcGUoXG4gICAgICAgICAgdGFrZVVudGlsRGVzdHJveWVkLFxuICAgICAgICAgIG1hcFRvKHRoaXMucmVzaXplUmVmLm9yaWdpbi5uYXRpdmVFbGVtZW50ISksXG4gICAgICApLnN1YnNjcmliZShjZWxsID0+IHRoaXMuZXZlbnREaXNwYXRjaGVyLmhlYWRlckNlbGxIb3ZlcmVkLm5leHQoY2VsbCkpO1xuXG4gICAgICBmcm9tRXZlbnQ8TW91c2VFdmVudD4odGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQhLCAnbW91c2VsZWF2ZScpLnBpcGUoXG4gICAgICAgICAgdGFrZVVudGlsRGVzdHJveWVkLFxuICAgICAgICAgIG1hcChldmVudCA9PiBldmVudC5yZWxhdGVkVGFyZ2V0ICYmXG4gICAgICAgICAgICAgIF9jbG9zZXN0KGV2ZW50LnJlbGF0ZWRUYXJnZXQgYXMgRWxlbWVudCwgSEVBREVSX0NFTExfU0VMRUNUT1IpKSxcbiAgICAgICkuc3Vic2NyaWJlKGNlbGwgPT4gdGhpcy5ldmVudERpc3BhdGNoZXIuaGVhZGVyQ2VsbEhvdmVyZWQubmV4dChjZWxsKSk7XG5cbiAgICAgIGZyb21FdmVudDxNb3VzZUV2ZW50Pih0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCEsICdtb3VzZWRvd24nKVxuICAgICAgICAgIC5waXBlKHRha2VVbnRpbERlc3Ryb3llZCkuc3Vic2NyaWJlKG1vdXNlZG93bkV2ZW50ID0+IHtcbiAgICAgICAgdGhpcy5fZHJhZ1N0YXJ0ZWQobW91c2Vkb3duRXZlbnQpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIF9kcmFnU3RhcnRlZChtb3VzZWRvd25FdmVudDogTW91c2VFdmVudCkge1xuICAgIC8vIE9ubHkgYWxsb3cgZHJhZ2dpbmcgdXNpbmcgdGhlIGxlZnQgbW91c2UgYnV0dG9uLlxuICAgIGlmIChtb3VzZWRvd25FdmVudC5idXR0b24gIT09IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBtb3VzZXVwID0gZnJvbUV2ZW50PE1vdXNlRXZlbnQ+KHRoaXMuZG9jdW1lbnQsICdtb3VzZXVwJyk7XG4gICAgY29uc3QgbW91c2Vtb3ZlID0gZnJvbUV2ZW50PE1vdXNlRXZlbnQ+KHRoaXMuZG9jdW1lbnQsICdtb3VzZW1vdmUnKTtcbiAgICBjb25zdCBlc2NhcGUgPSBmcm9tRXZlbnQ8S2V5Ym9hcmRFdmVudD4odGhpcy5kb2N1bWVudCwgJ2tleXVwJylcbiAgICAgICAgLnBpcGUoZmlsdGVyKGV2ZW50ID0+IGV2ZW50LmtleUNvZGUgPT09IEVTQ0FQRSkpO1xuXG4gICAgY29uc3Qgc3RhcnRYID0gbW91c2Vkb3duRXZlbnQuc2NyZWVuWDtcblxuICAgIGNvbnN0IGluaXRpYWxTaXplID0gdGhpcy5fZ2V0T3JpZ2luV2lkdGgoKTtcbiAgICBsZXQgb3ZlcmxheU9mZnNldCA9IHRoaXMuX2dldE92ZXJsYXlPZmZzZXQoKTtcbiAgICBsZXQgb3JpZ2luT2Zmc2V0ID0gdGhpcy5fZ2V0T3JpZ2luT2Zmc2V0KCk7XG4gICAgbGV0IHNpemUgPSBpbml0aWFsU2l6ZTtcbiAgICBsZXQgb3ZlcnNob3QgPSAwO1xuXG4gICAgdGhpcy51cGRhdGVSZXNpemVBY3RpdmUodHJ1ZSk7XG5cbiAgICBtb3VzZXVwLnBpcGUodGFrZVVudGlsKGVzY2FwZSksIHRha2VVbnRpbCh0aGlzLmRlc3Ryb3llZCkpLnN1YnNjcmliZSgoe3NjcmVlblh9KSA9PiB7XG4gICAgICB0aGlzLl9ub3RpZnlSZXNpemVFbmRlZChzaXplLCBzY3JlZW5YICE9PSBzdGFydFgpO1xuICAgIH0pO1xuXG4gICAgZXNjYXBlLnBpcGUodGFrZVVudGlsKG1vdXNldXApLCB0YWtlVW50aWwodGhpcy5kZXN0cm95ZWQpKS5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgdGhpcy5fbm90aWZ5UmVzaXplRW5kZWQoaW5pdGlhbFNpemUpO1xuICAgIH0pO1xuXG4gICAgbW91c2Vtb3ZlLnBpcGUoXG4gICAgICAgIG1hcCgoe3NjcmVlblh9KSA9PiBzY3JlZW5YKSxcbiAgICAgICAgc3RhcnRXaXRoKHN0YXJ0WCksXG4gICAgICAgIGRpc3RpbmN0VW50aWxDaGFuZ2VkKCksXG4gICAgICAgIHBhaXJ3aXNlKCksXG4gICAgICAgIHRha2VVbnRpbChtb3VzZXVwKSxcbiAgICAgICAgdGFrZVVudGlsKGVzY2FwZSksXG4gICAgICAgIHRha2VVbnRpbCh0aGlzLmRlc3Ryb3llZCksXG4gICAgKS5zdWJzY3JpYmUoKFtwcmV2WCwgY3VyclhdKSA9PiB7XG4gICAgICBsZXQgZGVsdGFYID0gY3VyclggLSBwcmV2WDtcblxuICAgICAgLy8gSWYgdGhlIG1vdXNlIG1vdmVkIGZ1cnRoZXIgdGhhbiB0aGUgcmVzaXplIHdhcyBhYmxlIHRvIG1hdGNoLCBsaW1pdCB0aGVcbiAgICAgIC8vIG1vdmVtZW50IG9mIHRoZSBvdmVybGF5IHRvIG1hdGNoIHRoZSBhY3R1YWwgc2l6ZSBhbmQgcG9zaXRpb24gb2YgdGhlIG9yaWdpbi5cbiAgICAgIGlmIChvdmVyc2hvdCAhPT0gMCkge1xuICAgICAgICBpZiAob3ZlcnNob3QgPCAwICYmIGRlbHRhWCA8IDAgfHwgb3ZlcnNob3QgPiAwICYmIGRlbHRhWCA+IDApIHtcbiAgICAgICAgICBvdmVyc2hvdCArPSBkZWx0YVg7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnN0IHJlbWFpbmluZ092ZXJzaG90ID0gb3ZlcnNob3QgKyBkZWx0YVg7XG4gICAgICAgICAgb3ZlcnNob3QgPSBvdmVyc2hvdCA+IDAgP1xuICAgICAgICAgICAgICBNYXRoLm1heChyZW1haW5pbmdPdmVyc2hvdCwgMCkgOiBNYXRoLm1pbihyZW1haW5pbmdPdmVyc2hvdCwgMCk7XG4gICAgICAgICAgZGVsdGFYID0gcmVtYWluaW5nT3ZlcnNob3QgLSBvdmVyc2hvdDtcblxuICAgICAgICAgIGlmIChkZWx0YVggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgbGV0IGNvbXB1dGVkTmV3U2l6ZTogbnVtYmVyID0gc2l6ZSArICh0aGlzLl9pc0x0cigpID8gZGVsdGFYIDogLWRlbHRhWCk7XG4gICAgICBjb21wdXRlZE5ld1NpemUgPSBNYXRoLm1pbihcbiAgICAgICAgICBNYXRoLm1heChjb21wdXRlZE5ld1NpemUsIHRoaXMucmVzaXplUmVmLm1pbldpZHRoUHgsIDApLCB0aGlzLnJlc2l6ZVJlZi5tYXhXaWR0aFB4KTtcblxuICAgICAgdGhpcy5yZXNpemVOb3RpZmllci50cmlnZ2VyUmVzaXplLm5leHQoXG4gICAgICAgICAge2NvbHVtbklkOiB0aGlzLmNvbHVtbkRlZi5uYW1lLCBzaXplOiBjb21wdXRlZE5ld1NpemUsIHByZXZpb3VzU2l6ZTogc2l6ZX0pO1xuXG4gICAgICBjb25zdCBvcmlnaW5OZXdTaXplID0gdGhpcy5fZ2V0T3JpZ2luV2lkdGgoKTtcbiAgICAgIGNvbnN0IG9yaWdpbk5ld09mZnNldCA9IHRoaXMuX2dldE9yaWdpbk9mZnNldCgpO1xuICAgICAgY29uc3Qgb3JpZ2luT2Zmc2V0RGVsdGFYID0gb3JpZ2luTmV3T2Zmc2V0IC0gb3JpZ2luT2Zmc2V0O1xuICAgICAgY29uc3Qgb3JpZ2luU2l6ZURlbHRhWCA9IG9yaWdpbk5ld1NpemUgLSBzaXplO1xuICAgICAgc2l6ZSA9IG9yaWdpbk5ld1NpemU7XG4gICAgICBvcmlnaW5PZmZzZXQgPSBvcmlnaW5OZXdPZmZzZXQ7XG5cbiAgICAgIG92ZXJzaG90ICs9IGRlbHRhWCArICh0aGlzLl9pc0x0cigpID8gLW9yaWdpblNpemVEZWx0YVggOiBvcmlnaW5TaXplRGVsdGFYKTtcbiAgICAgIG92ZXJsYXlPZmZzZXQgKz0gb3JpZ2luT2Zmc2V0RGVsdGFYICsgKHRoaXMuX2lzTHRyKCkgPyBvcmlnaW5TaXplRGVsdGFYIDogMCk7XG5cbiAgICAgIHRoaXMuX3VwZGF0ZU92ZXJsYXlPZmZzZXQob3ZlcmxheU9mZnNldCk7XG4gICAgfSk7XG4gIH1cblxuICBwcm90ZWN0ZWQgdXBkYXRlUmVzaXplQWN0aXZlKGFjdGl2ZTogYm9vbGVhbik6IHZvaWQge1xuICAgIHRoaXMuZXZlbnREaXNwYXRjaGVyLm92ZXJsYXlIYW5kbGVBY3RpdmVGb3JDZWxsLm5leHQoXG4gICAgICAgIGFjdGl2ZSA/IHRoaXMucmVzaXplUmVmLm9yaWdpbi5uYXRpdmVFbGVtZW50ISA6IG51bGwpO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0T3JpZ2luV2lkdGgoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5yZXNpemVSZWYub3JpZ2luLm5hdGl2ZUVsZW1lbnQhLm9mZnNldFdpZHRoO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0T3JpZ2luT2Zmc2V0KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMucmVzaXplUmVmLm9yaWdpbi5uYXRpdmVFbGVtZW50IS5vZmZzZXRMZWZ0O1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0T3ZlcmxheU9mZnNldCgpOiBudW1iZXIge1xuICAgIHJldHVybiBwYXJzZUludCh0aGlzLnJlc2l6ZVJlZi5vdmVybGF5UmVmLm92ZXJsYXlFbGVtZW50LnN0eWxlLmxlZnQhLCAxMCk7XG4gIH1cblxuICBwcml2YXRlIF91cGRhdGVPdmVybGF5T2Zmc2V0KG9mZnNldDogbnVtYmVyKTogdm9pZCB7XG4gICAgdGhpcy5yZXNpemVSZWYub3ZlcmxheVJlZi5vdmVybGF5RWxlbWVudC5zdHlsZS5sZWZ0ID0gY29lcmNlQ3NzUGl4ZWxWYWx1ZShvZmZzZXQpO1xuICB9XG5cbiAgcHJpdmF0ZSBfaXNMdHIoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuZGlyZWN0aW9uYWxpdHkudmFsdWUgPT09ICdsdHInO1xuICB9XG5cbiAgcHJpdmF0ZSBfbm90aWZ5UmVzaXplRW5kZWQoc2l6ZTogbnVtYmVyLCBjb21wbGV0ZWRTdWNjZXNzZnVsbHkgPSBmYWxzZSk6IHZvaWQge1xuICAgIHRoaXMudXBkYXRlUmVzaXplQWN0aXZlKGZhbHNlKTtcblxuICAgIHRoaXMubmdab25lLnJ1bigoKSA9PiB7XG4gICAgICBjb25zdCBzaXplTWVzc2FnZSA9IHtjb2x1bW5JZDogdGhpcy5jb2x1bW5EZWYubmFtZSwgc2l6ZX07XG4gICAgICBpZiAoY29tcGxldGVkU3VjY2Vzc2Z1bGx5KSB7XG4gICAgICAgIHRoaXMucmVzaXplTm90aWZpZXIucmVzaXplQ29tcGxldGVkLm5leHQoc2l6ZU1lc3NhZ2UpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5yZXNpemVOb3RpZmllci5yZXNpemVDYW5jZWxlZC5uZXh0KHNpemVNZXNzYWdlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufVxuIl19