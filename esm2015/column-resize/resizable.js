/**
 * @fileoverview added by tsickle
 * Generated from: src/cdk-experimental/column-resize/resizable.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, } from '@angular/core';
import { ComponentPortal, PortalInjector } from '@angular/cdk/portal';
import { merge, ReplaySubject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { _closest } from '@angular/cdk-experimental/popover-edit';
import { HEADER_ROW_SELECTOR } from './selectors';
import { ResizeRef } from './resize-ref';
/** @type {?} */
const OVERLAY_ACTIVE_CLASS = 'cdk-resizable-overlay-thumb-active';
/**
 * Base class for Resizable directives which are applied to column headers to make those columns
 * resizable.
 * @abstract
 * @template HandleComponent
 */
let Resizable = /** @class */ (() => {
    /**
     * Base class for Resizable directives which are applied to column headers to make those columns
     * resizable.
     * @abstract
     * @template HandleComponent
     */
    class Resizable {
        constructor() {
            this.minWidthPxInternal = 0;
            this.maxWidthPxInternal = Number.MAX_SAFE_INTEGER;
            this.destroyed = new ReplaySubject();
        }
        /**
         * The minimum width to allow the column to be sized to.
         * @return {?}
         */
        get minWidthPx() {
            return this.minWidthPxInternal;
        }
        /**
         * @param {?} value
         * @return {?}
         */
        set minWidthPx(value) {
            this.minWidthPxInternal = value;
            if (this.elementRef.nativeElement) {
                this.columnResize.setResized();
                this._applyMinWidthPx();
            }
        }
        /**
         * The maximum width to allow the column to be sized to.
         * @return {?}
         */
        get maxWidthPx() {
            return this.maxWidthPxInternal;
        }
        /**
         * @param {?} value
         * @return {?}
         */
        set maxWidthPx(value) {
            this.maxWidthPxInternal = value;
            if (this.elementRef.nativeElement) {
                this.columnResize.setResized();
                this._applyMaxWidthPx();
            }
        }
        /**
         * @return {?}
         */
        ngAfterViewInit() {
            this._listenForRowHoverEvents();
            this._listenForResizeEvents();
            this._appendInlineHandle();
            this._applyMinWidthPx();
            this._applyMaxWidthPx();
        }
        /**
         * @return {?}
         */
        ngOnDestroy() {
            this.destroyed.next();
            this.destroyed.complete();
            if (this.inlineHandle) {
                (/** @type {?} */ (this.elementRef.nativeElement)).removeChild(this.inlineHandle);
            }
            if (this.overlayRef) {
                this.overlayRef.dispose();
            }
        }
        /**
         * @private
         * @return {?}
         */
        _createOverlayForHandle() {
            // Use of overlays allows us to properly capture click events spanning parts
            // of two table cells and is also useful for displaying a resize thumb
            // over both cells and extending it down the table as needed.
            // Use of overlays allows us to properly capture click events spanning parts
            // of two table cells and is also useful for displaying a resize thumb
            // over both cells and extending it down the table as needed.
            /** @type {?} */
            const isRtl = this.directionality.value === 'rtl';
            /** @type {?} */
            const positionStrategy = this.overlay.position()
                .flexibleConnectedTo((/** @type {?} */ (this.elementRef.nativeElement)))
                .withFlexibleDimensions(false)
                .withGrowAfterOpen(false)
                .withPush(false)
                .withDefaultOffsetX(isRtl ? 1 : 0)
                .withPositions([{
                    originX: isRtl ? 'start' : 'end',
                    originY: 'top',
                    overlayX: 'center',
                    overlayY: 'top',
                }]);
            return this.overlay.create({
                // Always position the overlay based on left-indexed coordinates.
                direction: 'ltr',
                disposeOnNavigation: true,
                positionStrategy,
                scrollStrategy: this.overlay.scrollStrategies.reposition(),
                width: '16px',
            });
        }
        /**
         * @private
         * @return {?}
         */
        _listenForRowHoverEvents() {
            /** @type {?} */
            const element = (/** @type {?} */ (this.elementRef.nativeElement));
            /** @type {?} */
            const takeUntilDestroyed = takeUntil(this.destroyed);
            this.eventDispatcher.resizeOverlayVisibleForHeaderRow((/** @type {?} */ (_closest(element, HEADER_ROW_SELECTOR))))
                .pipe(takeUntilDestroyed).subscribe((/**
             * @param {?} hoveringRow
             * @return {?}
             */
            hoveringRow => {
                if (hoveringRow) {
                    if (!this.overlayRef) {
                        this.overlayRef = this._createOverlayForHandle();
                    }
                    this._showHandleOverlay();
                }
                else if (this.overlayRef) {
                    // todo - can't detach during an active resize - need to work that out
                    this.overlayRef.detach();
                }
            }));
        }
        /**
         * @private
         * @return {?}
         */
        _listenForResizeEvents() {
            /** @type {?} */
            const takeUntilDestroyed = takeUntil(this.destroyed);
            merge(this.resizeNotifier.resizeCanceled, this.resizeNotifier.triggerResize).pipe(takeUntilDestroyed, filter((/**
             * @param {?} columnSize
             * @return {?}
             */
            columnSize => columnSize.columnId === this.columnDef.name))).subscribe((/**
             * @param {?} __0
             * @return {?}
             */
            ({ size, previousSize, completeImmediately }) => {
                (/** @type {?} */ (this.elementRef.nativeElement)).classList.add(OVERLAY_ACTIVE_CLASS);
                this._applySize(size, previousSize);
                if (completeImmediately) {
                    this._completeResizeOperation();
                }
            }));
            merge(this.resizeNotifier.resizeCanceled, this.resizeNotifier.resizeCompleted).pipe(takeUntilDestroyed).subscribe((/**
             * @param {?} columnSize
             * @return {?}
             */
            columnSize => {
                this._cleanUpAfterResize(columnSize);
            }));
        }
        /**
         * @private
         * @return {?}
         */
        _completeResizeOperation() {
            this.ngZone.run((/**
             * @return {?}
             */
            () => {
                this.resizeNotifier.resizeCompleted.next({
                    columnId: this.columnDef.name,
                    size: (/** @type {?} */ (this.elementRef.nativeElement)).offsetWidth,
                });
            }));
        }
        /**
         * @private
         * @param {?} columnSize
         * @return {?}
         */
        _cleanUpAfterResize(columnSize) {
            (/** @type {?} */ (this.elementRef.nativeElement)).classList.remove(OVERLAY_ACTIVE_CLASS);
            if (this.overlayRef && this.overlayRef.hasAttached()) {
                this._updateOverlayHandleHeight();
                this.overlayRef.updatePosition();
                if (columnSize.columnId === this.columnDef.name) {
                    (/** @type {?} */ (this.inlineHandle)).focus();
                }
            }
        }
        /**
         * @private
         * @return {?}
         */
        _createHandlePortal() {
            /** @type {?} */
            const injector = new PortalInjector(this.injector, new WeakMap([[
                    ResizeRef,
                    new ResizeRef(this.elementRef, (/** @type {?} */ (this.overlayRef)), this.minWidthPx, this.maxWidthPx),
                ]]));
            return new ComponentPortal(this.getOverlayHandleComponentType(), this.viewContainerRef, injector);
        }
        /**
         * @private
         * @return {?}
         */
        _showHandleOverlay() {
            this._updateOverlayHandleHeight();
            (/** @type {?} */ (this.overlayRef)).attach(this._createHandlePortal());
        }
        /**
         * @private
         * @return {?}
         */
        _updateOverlayHandleHeight() {
            (/** @type {?} */ (this.overlayRef)).updateSize({ height: (/** @type {?} */ (this.elementRef.nativeElement)).offsetHeight });
        }
        /**
         * @private
         * @param {?} sizeInPixels
         * @param {?=} previousSize
         * @return {?}
         */
        _applySize(sizeInPixels, previousSize) {
            /** @type {?} */
            const sizeToApply = Math.min(Math.max(sizeInPixels, this.minWidthPx, 0), this.maxWidthPx);
            this.resizeStrategy.applyColumnSize(this.columnDef.cssClassFriendlyName, (/** @type {?} */ (this.elementRef.nativeElement)), sizeToApply, previousSize);
        }
        /**
         * @private
         * @return {?}
         */
        _applyMinWidthPx() {
            this.resizeStrategy.applyMinColumnSize(this.columnDef.cssClassFriendlyName, this.elementRef.nativeElement, this.minWidthPx);
        }
        /**
         * @private
         * @return {?}
         */
        _applyMaxWidthPx() {
            this.resizeStrategy.applyMaxColumnSize(this.columnDef.cssClassFriendlyName, this.elementRef.nativeElement, this.maxWidthPx);
        }
        /**
         * @private
         * @return {?}
         */
        _appendInlineHandle() {
            this.inlineHandle = this.document.createElement('div');
            this.inlineHandle.tabIndex = 0;
            this.inlineHandle.className = this.getInlineHandleCssClassName();
            // TODO: Apply correct aria role (probably slider) after a11y spec questions resolved.
            (/** @type {?} */ (this.elementRef.nativeElement)).appendChild(this.inlineHandle);
        }
    }
    Resizable.decorators = [
        { type: Directive }
    ];
    return Resizable;
})();
export { Resizable };
if (false) {
    /**
     * @type {?}
     * @protected
     */
    Resizable.prototype.minWidthPxInternal;
    /**
     * @type {?}
     * @protected
     */
    Resizable.prototype.maxWidthPxInternal;
    /**
     * @type {?}
     * @protected
     */
    Resizable.prototype.inlineHandle;
    /**
     * @type {?}
     * @protected
     */
    Resizable.prototype.overlayRef;
    /**
     * @type {?}
     * @protected
     */
    Resizable.prototype.destroyed;
    /**
     * @type {?}
     * @protected
     */
    Resizable.prototype.columnDef;
    /**
     * @type {?}
     * @protected
     */
    Resizable.prototype.columnResize;
    /**
     * @type {?}
     * @protected
     */
    Resizable.prototype.directionality;
    /**
     * @type {?}
     * @protected
     */
    Resizable.prototype.document;
    /**
     * @type {?}
     * @protected
     */
    Resizable.prototype.elementRef;
    /**
     * @type {?}
     * @protected
     */
    Resizable.prototype.eventDispatcher;
    /**
     * @type {?}
     * @protected
     */
    Resizable.prototype.injector;
    /**
     * @type {?}
     * @protected
     */
    Resizable.prototype.ngZone;
    /**
     * @type {?}
     * @protected
     */
    Resizable.prototype.overlay;
    /**
     * @type {?}
     * @protected
     */
    Resizable.prototype.resizeNotifier;
    /**
     * @type {?}
     * @protected
     */
    Resizable.prototype.resizeStrategy;
    /**
     * @type {?}
     * @protected
     */
    Resizable.prototype.viewContainerRef;
    /**
     * @abstract
     * @protected
     * @return {?}
     */
    Resizable.prototype.getInlineHandleCssClassName = function () { };
    /**
     * @abstract
     * @protected
     * @return {?}
     */
    Resizable.prototype.getOverlayHandleComponentType = function () { };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzaXphYmxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvY29sdW1uLXJlc2l6ZS9yZXNpemFibGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBUUEsT0FBTyxFQUVMLFNBQVMsR0FPVixNQUFNLGVBQWUsQ0FBQztBQUV2QixPQUFPLEVBQUMsZUFBZSxFQUFFLGNBQWMsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBR3BFLE9BQU8sRUFBQyxLQUFLLEVBQUUsYUFBYSxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQzFDLE9BQU8sRUFBQyxNQUFNLEVBQUUsU0FBUyxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFFakQsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLHdDQUF3QyxDQUFDO0FBRWhFLE9BQU8sRUFBQyxtQkFBbUIsRUFBQyxNQUFNLGFBQWEsQ0FBQztBQUtoRCxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sY0FBYyxDQUFDOztNQUdqQyxvQkFBb0IsR0FBRyxvQ0FBb0M7Ozs7Ozs7QUFNakU7Ozs7Ozs7SUFBQSxNQUNzQixTQUFTO1FBRC9CO1lBR1ksdUJBQWtCLEdBQVcsQ0FBQyxDQUFDO1lBQy9CLHVCQUFrQixHQUFXLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQztZQUk1QyxjQUFTLEdBQUcsSUFBSSxhQUFhLEVBQVEsQ0FBQztRQStNM0QsQ0FBQzs7Ozs7UUEvTEMsSUFBSSxVQUFVO1lBQ1osT0FBTyxJQUFJLENBQUMsa0JBQWtCLENBQUM7UUFDakMsQ0FBQzs7Ozs7UUFDRCxJQUFJLFVBQVUsQ0FBQyxLQUFhO1lBQzFCLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxLQUFLLENBQUM7WUFFaEMsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLGFBQWEsRUFBRTtnQkFDakMsSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLEVBQUUsQ0FBQztnQkFDL0IsSUFBSSxDQUFD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O0lBRXpELG9FQUEwRSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1xuICBBZnRlclZpZXdJbml0LFxuICBEaXJlY3RpdmUsXG4gIEVsZW1lbnRSZWYsXG4gIEluamVjdG9yLFxuICBOZ1pvbmUsXG4gIE9uRGVzdHJveSxcbiAgVHlwZSxcbiAgVmlld0NvbnRhaW5lclJlZixcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0RpcmVjdGlvbmFsaXR5fSBmcm9tICdAYW5ndWxhci9jZGsvYmlkaSc7XG5pbXBvcnQge0NvbXBvbmVudFBvcnRhbCwgUG9ydGFsSW5qZWN0b3J9IGZyb20gJ0Bhbmd1bGFyL2Nkay9wb3J0YWwnO1xuaW1wb3J0IHtPdmVybGF5LCBPdmVybGF5UmVmfSBmcm9tICdAYW5ndWxhci9jZGsvb3ZlcmxheSc7XG5pbXBvcnQge0Nka0NvbHVtbkRlZn0gZnJvbSAnQGFuZ3VsYXIvY2RrL3RhYmxlJztcbmltcG9ydCB7bWVyZ2UsIFJlcGxheVN1YmplY3R9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHtmaWx0ZXIsIHRha2VVbnRpbH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuXG5pbXBvcnQge19jbG9zZXN0fSBmcm9tICdAYW5ndWxhci9jZGstZXhwZXJpbWVudGFsL3BvcG92ZXItZWRpdCc7XG5cbmltcG9ydCB7SEVBREVSX1JPV19TRUxFQ1RPUn0gZnJvbSAnLi9zZWxlY3RvcnMnO1xuaW1wb3J0IHtSZXNpemVPdmVybGF5SGFuZGxlfSBmcm9tICcuL292ZXJsYXktaGFuZGxlJztcbmltcG9ydCB7Q29sdW1uUmVzaXplfSBmcm9tICcuL2NvbHVtbi1yZXNpemUnO1xuaW1wb3J0IHtDb2x1bW5TaXplQWN0aW9uLCBDb2x1bW5SZXNpemVOb3RpZmllclNvdXJjZX0gZnJvbSAnLi9jb2x1bW4tcmVzaXplLW5vdGlmaWVyJztcbmltcG9ydCB7SGVhZGVyUm93RXZlbnREaXNwYXRjaGVyfSBmcm9tICcuL2V2ZW50LWRpc3BhdGNoZXInO1xuaW1wb3J0IHtSZXNpemVSZWZ9IGZyb20gJy4vcmVzaXplLXJlZic7XG5pbXBvcnQge1Jlc2l6ZVN0cmF0ZWd5fSBmcm9tICcuL3Jlc2l6ZS1zdHJhdGVneSc7XG5cbmNvbnN0IE9WRVJMQVlfQUNUSVZFX0NMQVNTID0gJ2Nkay1yZXNpemFibGUtb3ZlcmxheS10aHVtYi1hY3RpdmUnO1xuXG4vKipcbiAqIEJhc2UgY2xhc3MgZm9yIFJlc2l6YWJsZSBkaXJlY3RpdmVzIHdoaWNoIGFyZSBhcHBsaWVkIHRvIGNvbHVtbiBoZWFkZXJzIHRvIG1ha2UgdGhvc2UgY29sdW1uc1xuICogcmVzaXphYmxlLlxuICovXG5ARGlyZWN0aXZlKClcbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBSZXNpemFibGU8SGFuZGxlQ29tcG9uZW50IGV4dGVuZHMgUmVzaXplT3ZlcmxheUhhbmRsZT5cbiAgICBpbXBsZW1lbnRzIEFmdGVyVmlld0luaXQsIE9uRGVzdHJveSB7XG4gIHByb3RlY3RlZCBtaW5XaWR0aFB4SW50ZXJuYWw6IG51bWJlciA9IDA7XG4gIHByb3RlY3RlZCBtYXhXaWR0aFB4SW50ZXJuYWw6IG51bWJlciA9IE51bWJlci5NQVhfU0FGRV9JTlRFR0VSO1xuXG4gIHByb3RlY3RlZCBpbmxpbmVIYW5kbGU/OiBIVE1MRWxlbWVudDtcbiAgcHJvdGVjdGVkIG92ZXJsYXlSZWY/OiBPdmVybGF5UmVmO1xuICBwcm90ZWN0ZWQgcmVhZG9ubHkgZGVzdHJveWVkID0gbmV3IFJlcGxheVN1YmplY3Q8dm9pZD4oKTtcblxuICBwcm90ZWN0ZWQgYWJzdHJhY3QgcmVhZG9ubHkgY29sdW1uRGVmOiBDZGtDb2x1bW5EZWY7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCByZWFkb25seSBjb2x1bW5SZXNpemU6IENvbHVtblJlc2l6ZTtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IHJlYWRvbmx5IGRpcmVjdGlvbmFsaXR5OiBEaXJlY3Rpb25hbGl0eTtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IHJlYWRvbmx5IGRvY3VtZW50OiBEb2N1bWVudDtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IHJlYWRvbmx5IGVsZW1lbnRSZWY6IEVsZW1lbnRSZWY7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCByZWFkb25seSBldmVudERpc3BhdGNoZXI6IEhlYWRlclJvd0V2ZW50RGlzcGF0Y2hlcjtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IHJlYWRvbmx5IGluamVjdG9yOiBJbmplY3RvcjtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IHJlYWRvbmx5IG5nWm9uZTogTmdab25lO1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgcmVhZG9ubHkgb3ZlcmxheTogT3ZlcmxheTtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IHJlYWRvbmx5IHJlc2l6ZU5vdGlmaWVyOiBDb2x1bW5SZXNpemVOb3RpZmllclNvdXJjZTtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IHJlYWRvbmx5IHJlc2l6ZVN0cmF0ZWd5OiBSZXNpemVTdHJhdGVneTtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IHJlYWRvbmx5IHZpZXdDb250YWluZXJSZWY6IFZpZXdDb250YWluZXJSZWY7XG5cbiAgLyoqIFRoZSBtaW5pbXVtIHdpZHRoIHRvIGFsbG93IHRoZSBjb2x1bW4gdG8gYmUgc2l6ZWQgdG8uICovXG4gIGdldCBtaW5XaWR0aFB4KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMubWluV2lkdGhQeEludGVybmFsO1xuICB9XG4gIHNldCBtaW5XaWR0aFB4KHZhbHVlOiBudW1iZXIpIHtcbiAgICB0aGlzLm1pbldpZHRoUHhJbnRlcm5hbCA9IHZhbHVlO1xuXG4gICAgaWYgKHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50KSB7XG4gICAgICB0aGlzLmNvbHVtblJlc2l6ZS5zZXRSZXNpemVkKCk7XG4gICAgICB0aGlzLl9hcHBseU1pbldpZHRoUHgoKTtcbiAgICB9XG4gIH1cblxuICAvKiogVGhlIG1heGltdW0gd2lkdGggdG8gYWxsb3cgdGhlIGNvbHVtbiB0byBiZSBzaXplZCB0by4gKi9cbiAgZ2V0IG1heFdpZHRoUHgoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5tYXhXaWR0aFB4SW50ZXJuYWw7XG4gIH1cbiAgc2V0IG1heFdpZHRoUHgodmFsdWU6IG51bWJlcikge1xuICAgIHRoaXMubWF4V2lkdGhQeEludGVybmFsID0gdmFsdWU7XG5cbiAgICBpZiAodGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQpIHtcbiAgICAgIHRoaXMuY29sdW1uUmVzaXplLnNldFJlc2l6ZWQoKTtcbiAgICAgIHRoaXMuX2FwcGx5TWF4V2lkdGhQeCgpO1xuICAgIH1cbiAgfVxuXG4gIG5nQWZ0ZXJWaWV3SW5pdCgpIHtcbiAgICB0aGlzLl9saXN0ZW5Gb3JSb3dIb3ZlckV2ZW50cygpO1xuICAgIHRoaXMuX2xpc3RlbkZvclJlc2l6ZUV2ZW50cygpO1xuICAgIHRoaXMuX2FwcGVuZElubGluZUhhbmRsZSgpO1xuICAgIHRoaXMuX2FwcGx5TWluV2lkdGhQeCgpO1xuICAgIHRoaXMuX2FwcGx5TWF4V2lkdGhQeCgpO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgdGhpcy5kZXN0cm95ZWQubmV4dCgpO1xuICAgIHRoaXMuZGVzdHJveWVkLmNvbXBsZXRlKCk7XG5cbiAgICBpZiAodGhpcy5pbmxpbmVIYW5kbGUpIHtcbiAgICAgIHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50IS5yZW1vdmVDaGlsZCh0aGlzLmlubGluZUhhbmRsZSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMub3ZlcmxheVJlZikge1xuICAgICAgdGhpcy5vdmVybGF5UmVmLmRpc3Bvc2UoKTtcbiAgICB9XG4gIH1cblxuICBwcm90ZWN0ZWQgYWJzdHJhY3QgZ2V0SW5saW5lSGFuZGxlQ3NzQ2xhc3NOYW1lKCk6IHN0cmluZztcblxuICBwcm90ZWN0ZWQgYWJzdHJhY3QgZ2V0T3ZlcmxheUhhbmRsZUNvbXBvbmVudFR5cGUoKTogVHlwZTxIYW5kbGVDb21wb25lbnQ+O1xuXG4gIHByaXZhdGUgX2NyZWF0ZU92ZXJsYXlGb3JIYW5kbGUoKTogT3ZlcmxheVJlZiB7XG4gICAgLy8gVXNlIG9mIG92ZXJsYXlzIGFsbG93cyB1cyB0byBwcm9wZXJseSBjYXB0dXJlIGNsaWNrIGV2ZW50cyBzcGFubmluZyBwYXJ0c1xuICAgIC8vIG9mIHR3byB0YWJsZSBjZWxscyBhbmQgaXMgYWxzbyB1c2VmdWwgZm9yIGRpc3BsYXlpbmcgYSByZXNpemUgdGh1bWJcbiAgICAvLyBvdmVyIGJvdGggY2VsbHMgYW5kIGV4dGVuZGluZyBpdCBkb3duIHRoZSB0YWJsZSBhcyBuZWVkZWQuXG5cbiAgICBjb25zdCBpc1J0bCA9IHRoaXMuZGlyZWN0aW9uYWxpdHkudmFsdWUgPT09ICdydGwnO1xuICAgIGNvbnN0IHBvc2l0aW9uU3RyYXRlZ3kgPSB0aGlzLm92ZXJsYXkucG9zaXRpb24oKVxuICAgICAgICAuZmxleGlibGVDb25uZWN0ZWRUbyh0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCEpXG4gICAgICAgIC53aXRoRmxleGlibGVEaW1lbnNpb25zKGZhbHNlKVxuICAgICAgICAud2l0aEdyb3dBZnRlck9wZW4oZmFsc2UpXG4gICAgICAgIC53aXRoUHVzaChmYWxzZSlcbiAgICAgICAgLndpdGhEZWZhdWx0T2Zmc2V0WChpc1J0bCA/IDEgOiAwKVxuICAgICAgICAud2l0aFBvc2l0aW9ucyhbe1xuICAgICAgICAgIG9yaWdpblg6IGlzUnRsID8gJ3N0YXJ0JyA6ICdlbmQnLFxuICAgICAgICAgIG9yaWdpblk6ICd0b3AnLFxuICAgICAgICAgIG92ZXJsYXlYOiAnY2VudGVyJyxcbiAgICAgICAgICBvdmVybGF5WTogJ3RvcCcsXG4gICAgICAgIH1dKTtcblxuICAgIHJldHVybiB0aGlzLm92ZXJsYXkuY3JlYXRlKHtcbiAgICAgIC8vIEFsd2F5cyBwb3NpdGlvbiB0aGUgb3ZlcmxheSBiYXNlZCBvbiBsZWZ0LWluZGV4ZWQgY29vcmRpbmF0ZXMuXG4gICAgICBkaXJlY3Rpb246ICdsdHInLFxuICAgICAgZGlzcG9zZU9uTmF2aWdhdGlvbjogdHJ1ZSxcbiAgICAgIHBvc2l0aW9uU3RyYXRlZ3ksXG4gICAgICBzY3JvbGxTdHJhdGVneTogdGhpcy5vdmVybGF5LnNjcm9sbFN0cmF0ZWdpZXMucmVwb3NpdGlvbigpLFxuICAgICAgd2lkdGg6ICcxNnB4JyxcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX2xpc3RlbkZvclJvd0hvdmVyRXZlbnRzKCk6IHZvaWQge1xuICAgIGNvbnN0IGVsZW1lbnQgPSB0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCE7XG4gICAgY29uc3QgdGFrZVVudGlsRGVzdHJveWVkID0gdGFrZVVudGlsPGJvb2xlYW4+KHRoaXMuZGVzdHJveWVkKTtcblxuXG4gICAgdGhpcy5ldmVudERpc3BhdGNoZXIucmVzaXplT3ZlcmxheVZpc2libGVGb3JIZWFkZXJSb3coX2Nsb3Nlc3QoZWxlbWVudCwgSEVBREVSX1JPV19TRUxFQ1RPUikhKVxuICAgICAgICAucGlwZSh0YWtlVW50aWxEZXN0cm95ZWQpLnN1YnNjcmliZShob3ZlcmluZ1JvdyA9PiB7XG4gICAgICBpZiAoaG92ZXJpbmdSb3cpIHtcbiAgICAgICAgaWYgKCF0aGlzLm92ZXJsYXlSZWYpIHtcbiAgICAgICAgICB0aGlzLm92ZXJsYXlSZWYgPSB0aGlzLl9jcmVhdGVPdmVybGF5Rm9ySGFuZGxlKCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9zaG93SGFuZGxlT3ZlcmxheSgpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLm92ZXJsYXlSZWYpIHtcbiAgICAgICAgLy8gdG9kbyAtIGNhbid0IGRldGFjaCBkdXJpbmcgYW4gYWN0aXZlIHJlc2l6ZSAtIG5lZWQgdG8gd29yayB0aGF0IG91dFxuICAgICAgICB0aGlzLm92ZXJsYXlSZWYuZGV0YWNoKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIF9saXN0ZW5Gb3JSZXNpemVFdmVudHMoKSB7XG4gICAgY29uc3QgdGFrZVVudGlsRGVzdHJveWVkID0gdGFrZVVudGlsPENvbHVtblNpemVBY3Rpb24+KHRoaXMuZGVzdHJveWVkKTtcblxuICAgIG1lcmdlKFxuICAgICAgICB0aGlzLnJlc2l6ZU5vdGlmaWVyLnJlc2l6ZUNhbmNlbGVkLFxuICAgICAgICB0aGlzLnJlc2l6ZU5vdGlmaWVyLnRyaWdnZXJSZXNpemUsXG4gICAgKS5waXBlKFxuICAgICAgICB0YWtlVW50aWxEZXN0cm95ZWQsXG4gICAgICAgIGZpbHRlcihjb2x1bW5TaXplID0+IGNvbHVtblNpemUuY29sdW1uSWQgPT09IHRoaXMuY29sdW1uRGVmLm5hbWUpLFxuICAgICkuc3Vic2NyaWJlKCh7c2l6ZSwgcHJldmlvdXNTaXplLCBjb21wbGV0ZUltbWVkaWF0ZWx5fSkgPT4ge1xuICAgICAgdGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQhLmNsYXNzTGlzdC5hZGQoT1ZFUkxBWV9BQ1RJVkVfQ0xBU1MpO1xuICAgICAgdGhpcy5fYXBwbHlTaXplKHNpemUsIHByZXZpb3VzU2l6ZSk7XG5cbiAgICAgIGlmIChjb21wbGV0ZUltbWVkaWF0ZWx5KSB7XG4gICAgICAgIHRoaXMuX2NvbXBsZXRlUmVzaXplT3BlcmF0aW9uKCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBtZXJnZShcbiAgICAgICAgdGhpcy5yZXNpemVOb3RpZmllci5yZXNpemVDYW5jZWxlZCxcbiAgICAgICAgdGhpcy5yZXNpemVOb3RpZmllci5yZXNpemVDb21wbGV0ZWQsXG4gICAgKS5waXBlKHRha2VVbnRpbERlc3Ryb3llZCkuc3Vic2NyaWJlKGNvbHVtblNpemUgPT4ge1xuICAgICAgdGhpcy5fY2xlYW5VcEFmdGVyUmVzaXplKGNvbHVtblNpemUpO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfY29tcGxldGVSZXNpemVPcGVyYXRpb24oKTogdm9pZCB7XG4gICAgdGhpcy5uZ1pvbmUucnVuKCgpID0+IHtcbiAgICAgIHRoaXMucmVzaXplTm90aWZpZXIucmVzaXplQ29tcGxldGVkLm5leHQoe1xuICAgICAgICBjb2x1bW5JZDogdGhpcy5jb2x1bW5EZWYubmFtZSxcbiAgICAgICAgc2l6ZTogdGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQhLm9mZnNldFdpZHRoLFxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIF9jbGVhblVwQWZ0ZXJSZXNpemUoY29sdW1uU2l6ZTogQ29sdW1uU2l6ZUFjdGlvbik6IHZvaWQge1xuICAgIHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50IS5jbGFzc0xpc3QucmVtb3ZlKE9WRVJMQVlfQUNUSVZFX0NMQVNTKTtcblxuICAgIGlmICh0aGlzLm92ZXJsYXlSZWYgJiYgdGhpcy5vdmVybGF5UmVmLmhhc0F0dGFjaGVkKCkpIHtcbiAgICAgIHRoaXMuX3VwZGF0ZU92ZXJsYXlIYW5kbGVIZWlnaHQoKTtcbiAgICAgIHRoaXMub3ZlcmxheVJlZi51cGRhdGVQb3NpdGlvbigpO1xuXG4gICAgICBpZiAoY29sdW1uU2l6ZS5jb2x1bW5JZCA9PT0gdGhpcy5jb2x1bW5EZWYubmFtZSkge1xuICAgICAgICB0aGlzLmlubGluZUhhbmRsZSEuZm9jdXMoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9jcmVhdGVIYW5kbGVQb3J0YWwoKTogQ29tcG9uZW50UG9ydGFsPEhhbmRsZUNvbXBvbmVudD4ge1xuICAgIGNvbnN0IGluamVjdG9yID0gbmV3IFBvcnRhbEluamVjdG9yKHRoaXMuaW5qZWN0b3IsIG5ldyBXZWFrTWFwKFtbXG4gICAgICBSZXNpemVSZWYsXG4gICAgICBuZXcgUmVzaXplUmVmKHRoaXMuZWxlbWVudFJlZiwgdGhpcy5vdmVybGF5UmVmISwgdGhpcy5taW5XaWR0aFB4LCB0aGlzLm1heFdpZHRoUHgpLFxuICAgIF1dKSk7XG4gICAgcmV0dXJuIG5ldyBDb21wb25lbnRQb3J0YWwodGhpcy5nZXRPdmVybGF5SGFuZGxlQ29tcG9uZW50VHlwZSgpLFxuICAgICAgICB0aGlzLnZpZXdDb250YWluZXJSZWYsIGluamVjdG9yKTtcbiAgfVxuXG4gIHByaXZhdGUgX3Nob3dIYW5kbGVPdmVybGF5KCk6IHZvaWQge1xuICAgIHRoaXMuX3VwZGF0ZU92ZXJsYXlIYW5kbGVIZWlnaHQoKTtcbiAgICB0aGlzLm92ZXJsYXlSZWYhLmF0dGFjaCh0aGlzLl9jcmVhdGVIYW5kbGVQb3J0YWwoKSk7XG4gIH1cblxuICBwcml2YXRlIF91cGRhdGVPdmVybGF5SGFuZGxlSGVpZ2h0KCkge1xuICAgIHRoaXMub3ZlcmxheVJlZiEudXBkYXRlU2l6ZSh7aGVpZ2h0OiB0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCEub2Zmc2V0SGVpZ2h0fSk7XG4gIH1cblxuICBwcml2YXRlIF9hcHBseVNpemUoc2l6ZUluUGl4ZWxzOiBudW1iZXIsIHByZXZpb3VzU2l6ZT86IG51bWJlcik6IHZvaWQge1xuICAgIGNvbnN0IHNpemVUb0FwcGx5ID0gTWF0aC5taW4oTWF0aC5tYXgoc2l6ZUluUGl4ZWxzLCB0aGlzLm1pbldpZHRoUHgsIDApLCB0aGlzLm1heFdpZHRoUHgpO1xuXG4gICAgdGhpcy5yZXNpemVTdHJhdGVneS5hcHBseUNvbHVtblNpemUodGhpcy5jb2x1bW5EZWYuY3NzQ2xhc3NGcmllbmRseU5hbWUsXG4gICAgICAgIHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50ISwgc2l6ZVRvQXBwbHksIHByZXZpb3VzU2l6ZSk7XG4gIH1cblxuICBwcml2YXRlIF9hcHBseU1pbldpZHRoUHgoKTogdm9pZCB7XG4gICAgdGhpcy5yZXNpemVTdHJhdGVneS5hcHBseU1pbkNvbHVtblNpemUodGhpcy5jb2x1bW5EZWYuY3NzQ2xhc3NGcmllbmRseU5hbWUsXG4gICAgICAgIHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LCB0aGlzLm1pbldpZHRoUHgpO1xuICB9XG5cbiAgcHJpdmF0ZSBfYXBwbHlNYXhXaWR0aFB4KCk6IHZvaWQge1xuICAgIHRoaXMucmVzaXplU3RyYXRlZ3kuYXBwbHlNYXhDb2x1bW5TaXplKHRoaXMuY29sdW1uRGVmLmNzc0NsYXNzRnJpZW5kbHlOYW1lLFxuICAgICAgICB0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCwgdGhpcy5tYXhXaWR0aFB4KTtcbiAgfVxuXG4gIHByaXZhdGUgX2FwcGVuZElubGluZUhhbmRsZSgpOiB2b2lkIHtcbiAgICB0aGlzLmlubGluZUhhbmRsZSA9IHRoaXMuZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgdGhpcy5pbmxpbmVIYW5kbGUudGFiSW5kZXggPSAwO1xuICAgIHRoaXMuaW5saW5lSGFuZGxlLmNsYXNzTmFtZSA9IHRoaXMuZ2V0SW5saW5lSGFuZGxlQ3NzQ2xhc3NOYW1lKCk7XG5cbiAgICAvLyBUT0RPOiBBcHBseSBjb3JyZWN0IGFyaWEgcm9sZSAocHJvYmFibHkgc2xpZGVyKSBhZnRlciBhMTF5IHNwZWMgcXVlc3Rpb25zIHJlc29sdmVkLlxuXG4gICAgdGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQhLmFwcGVuZENoaWxkKHRoaXMuaW5saW5lSGFuZGxlKTtcbiAgfVxufVxuIl19