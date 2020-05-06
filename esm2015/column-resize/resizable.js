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
export class Resizable {
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
        const positionStrategy = this.overlay.position()
            .flexibleConnectedTo((/** @type {?} */ (this.elementRef.nativeElement)))
            .withFlexibleDimensions(false)
            .withGrowAfterOpen(false)
            .withPush(false)
            .withPositions([{
                originX: 'end',
                originY: 'top',
                overlayX: 'center',
                overlayY: 'top',
            }]);
        return this.overlay.create({
            direction: this.directionality,
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
        ({ size, completeImmediately }) => {
            (/** @type {?} */ (this.elementRef.nativeElement)).classList.add(OVERLAY_ACTIVE_CLASS);
            this._applySize(size);
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
     * @return {?}
     */
    _applySize(sizeInPixels) {
        /** @type {?} */
        const sizeToApply = Math.min(Math.max(sizeInPixels, this.minWidthPx, 0), this.maxWidthPx);
        this.resizeStrategy.applyColumnSize(this.columnDef.cssClassFriendlyName, (/** @type {?} */ (this.elementRef.nativeElement)), sizeToApply);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzaXphYmxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvY29sdW1uLXJlc2l6ZS9yZXNpemFibGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBUUEsT0FBTyxFQUVMLFNBQVMsR0FPVixNQUFNLGVBQWUsQ0FBQztBQUV2QixPQUFPLEVBQUMsZUFBZSxFQUFFLGNBQWMsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBR3BFLE9BQU8sRUFBQyxLQUFLLEVBQUUsYUFBYSxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQzFDLE9BQU8sRUFBQyxNQUFNLEVBQUUsU0FBUyxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFFakQsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLHdDQUF3QyxDQUFDO0FBRWhFLE9BQU8sRUFBQyxtQkFBbUIsRUFBQyxNQUFNLGFBQWEsQ0FBQztBQUtoRCxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sY0FBYyxDQUFDOztNQUdqQyxvQkFBb0IsR0FBRyxvQ0FBb0M7Ozs7Ozs7QUFPakUsTUFBTSxPQUFnQixTQUFTO0lBRC9CO1FBR1ksdUJBQWtCLEdBQVcsQ0FBQyxDQUFDO1FBQy9CLHVCQUFrQixHQUFXLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQztRQUk1QyxjQUFTLEdBQUcsSUFBSSxhQUFhLEVBQVEsQ0FBQztJQTBNM0QsQ0FBQzs7Ozs7SUExTEMsSUFBSSxVQUFVO1FBQ1osT0FBTyxJQUFJLENBQUMsa0JBQWtCLENBQUM7SUFDakMsQ0FBQzs7Ozs7SUFDRCxJQUFJLFVBQVUsQ0FBQyxLQUFhO1FBQzFCLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxLQUFLLENBQUM7UUFFaEMsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLGFBQWEsRUFBRTtZQUNqQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztTQUN6QjtJQUNILENBQUM7Ozs7O0lBR0QsSUFBSSxV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Q0FBQztRQUN2RCxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUM7UUFDL0IsSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLDJCQUEyQixFQUFFLENBQUM7UUFFakUsc0ZBQXNGO1FBRXRGLG1CQUFBLElBQUksQ0FBQyxVQUFVLENBQUMsYUFBYSxFQUFDLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUNoRSxDQUFDOzs7WUFqTkYsU0FBUzs7Ozs7OztJQUdSLHVDQUF5Qzs7Ozs7SUFDekMsdUNBQStEOzs7OztJQUUvRCxpQ0FBcUM7Ozs7O0lBQ3JDLCtCQUFrQzs7Ozs7SUFDbEMsOEJBQXlEOzs7OztJQUV6RCw4QkFBb0Q7Ozs7O0lBQ3BELGlDQUF1RDs7Ozs7SUFDdkQsbUNBQTJEOzs7OztJQUMzRCw2QkFBK0M7Ozs7O0lBQy9DLCtCQUFtRDs7Ozs7SUFDbkQsb0NBQXNFOzs7OztJQUN0RSw2QkFBK0M7Ozs7O0lBQy9DLDJCQUEyQzs7Ozs7SUFDM0MsNEJBQTZDOzs7OztJQUM3QyxtQ0FBdUU7Ozs7O0lBQ3ZFLG1DQUEyRDs7Ozs7SUFDM0QscUNBQStEOzs7Ozs7SUErQy9ELGtFQUF5RDs7Ozs7O0lBRXpELG9FQUEwRSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1xuICBBZnRlclZpZXdJbml0LFxuICBEaXJlY3RpdmUsXG4gIEVsZW1lbnRSZWYsXG4gIEluamVjdG9yLFxuICBOZ1pvbmUsXG4gIE9uRGVzdHJveSxcbiAgVHlwZSxcbiAgVmlld0NvbnRhaW5lclJlZixcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0RpcmVjdGlvbmFsaXR5fSBmcm9tICdAYW5ndWxhci9jZGsvYmlkaSc7XG5pbXBvcnQge0NvbXBvbmVudFBvcnRhbCwgUG9ydGFsSW5qZWN0b3J9IGZyb20gJ0Bhbmd1bGFyL2Nkay9wb3J0YWwnO1xuaW1wb3J0IHtPdmVybGF5LCBPdmVybGF5UmVmfSBmcm9tICdAYW5ndWxhci9jZGsvb3ZlcmxheSc7XG5pbXBvcnQge0Nka0NvbHVtbkRlZn0gZnJvbSAnQGFuZ3VsYXIvY2RrL3RhYmxlJztcbmltcG9ydCB7bWVyZ2UsIFJlcGxheVN1YmplY3R9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHtmaWx0ZXIsIHRha2VVbnRpbH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuXG5pbXBvcnQge19jbG9zZXN0fSBmcm9tICdAYW5ndWxhci9jZGstZXhwZXJpbWVudGFsL3BvcG92ZXItZWRpdCc7XG5cbmltcG9ydCB7SEVBREVSX1JPV19TRUxFQ1RPUn0gZnJvbSAnLi9zZWxlY3RvcnMnO1xuaW1wb3J0IHtSZXNpemVPdmVybGF5SGFuZGxlfSBmcm9tICcuL292ZXJsYXktaGFuZGxlJztcbmltcG9ydCB7Q29sdW1uUmVzaXplfSBmcm9tICcuL2NvbHVtbi1yZXNpemUnO1xuaW1wb3J0IHtDb2x1bW5TaXplQWN0aW9uLCBDb2x1bW5SZXNpemVOb3RpZmllclNvdXJjZX0gZnJvbSAnLi9jb2x1bW4tcmVzaXplLW5vdGlmaWVyJztcbmltcG9ydCB7SGVhZGVyUm93RXZlbnREaXNwYXRjaGVyfSBmcm9tICcuL2V2ZW50LWRpc3BhdGNoZXInO1xuaW1wb3J0IHtSZXNpemVSZWZ9IGZyb20gJy4vcmVzaXplLXJlZic7XG5pbXBvcnQge1Jlc2l6ZVN0cmF0ZWd5fSBmcm9tICcuL3Jlc2l6ZS1zdHJhdGVneSc7XG5cbmNvbnN0IE9WRVJMQVlfQUNUSVZFX0NMQVNTID0gJ2Nkay1yZXNpemFibGUtb3ZlcmxheS10aHVtYi1hY3RpdmUnO1xuXG4vKipcbiAqIEJhc2UgY2xhc3MgZm9yIFJlc2l6YWJsZSBkaXJlY3RpdmVzIHdoaWNoIGFyZSBhcHBsaWVkIHRvIGNvbHVtbiBoZWFkZXJzIHRvIG1ha2UgdGhvc2UgY29sdW1uc1xuICogcmVzaXphYmxlLlxuICovXG5ARGlyZWN0aXZlKClcbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBSZXNpemFibGU8SGFuZGxlQ29tcG9uZW50IGV4dGVuZHMgUmVzaXplT3ZlcmxheUhhbmRsZT5cbiAgICBpbXBsZW1lbnRzIEFmdGVyVmlld0luaXQsIE9uRGVzdHJveSB7XG4gIHByb3RlY3RlZCBtaW5XaWR0aFB4SW50ZXJuYWw6IG51bWJlciA9IDA7XG4gIHByb3RlY3RlZCBtYXhXaWR0aFB4SW50ZXJuYWw6IG51bWJlciA9IE51bWJlci5NQVhfU0FGRV9JTlRFR0VSO1xuXG4gIHByb3RlY3RlZCBpbmxpbmVIYW5kbGU/OiBIVE1MRWxlbWVudDtcbiAgcHJvdGVjdGVkIG92ZXJsYXlSZWY/OiBPdmVybGF5UmVmO1xuICBwcm90ZWN0ZWQgcmVhZG9ubHkgZGVzdHJveWVkID0gbmV3IFJlcGxheVN1YmplY3Q8dm9pZD4oKTtcblxuICBwcm90ZWN0ZWQgYWJzdHJhY3QgcmVhZG9ubHkgY29sdW1uRGVmOiBDZGtDb2x1bW5EZWY7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCByZWFkb25seSBjb2x1bW5SZXNpemU6IENvbHVtblJlc2l6ZTtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IHJlYWRvbmx5IGRpcmVjdGlvbmFsaXR5OiBEaXJlY3Rpb25hbGl0eTtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IHJlYWRvbmx5IGRvY3VtZW50OiBEb2N1bWVudDtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IHJlYWRvbmx5IGVsZW1lbnRSZWY6IEVsZW1lbnRSZWY7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCByZWFkb25seSBldmVudERpc3BhdGNoZXI6IEhlYWRlclJvd0V2ZW50RGlzcGF0Y2hlcjtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IHJlYWRvbmx5IGluamVjdG9yOiBJbmplY3RvcjtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IHJlYWRvbmx5IG5nWm9uZTogTmdab25lO1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgcmVhZG9ubHkgb3ZlcmxheTogT3ZlcmxheTtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IHJlYWRvbmx5IHJlc2l6ZU5vdGlmaWVyOiBDb2x1bW5SZXNpemVOb3RpZmllclNvdXJjZTtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IHJlYWRvbmx5IHJlc2l6ZVN0cmF0ZWd5OiBSZXNpemVTdHJhdGVneTtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IHJlYWRvbmx5IHZpZXdDb250YWluZXJSZWY6IFZpZXdDb250YWluZXJSZWY7XG5cbiAgLyoqIFRoZSBtaW5pbXVtIHdpZHRoIHRvIGFsbG93IHRoZSBjb2x1bW4gdG8gYmUgc2l6ZWQgdG8uICovXG4gIGdldCBtaW5XaWR0aFB4KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMubWluV2lkdGhQeEludGVybmFsO1xuICB9XG4gIHNldCBtaW5XaWR0aFB4KHZhbHVlOiBudW1iZXIpIHtcbiAgICB0aGlzLm1pbldpZHRoUHhJbnRlcm5hbCA9IHZhbHVlO1xuXG4gICAgaWYgKHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50KSB7XG4gICAgICB0aGlzLl9hcHBseU1pbldpZHRoUHgoKTtcbiAgICB9XG4gIH1cblxuICAvKiogVGhlIG1heGltdW0gd2lkdGggdG8gYWxsb3cgdGhlIGNvbHVtbiB0byBiZSBzaXplZCB0by4gKi9cbiAgZ2V0IG1heFdpZHRoUHgoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5tYXhXaWR0aFB4SW50ZXJuYWw7XG4gIH1cbiAgc2V0IG1heFdpZHRoUHgodmFsdWU6IG51bWJlcikge1xuICAgIHRoaXMubWF4V2lkdGhQeEludGVybmFsID0gdmFsdWU7XG5cbiAgICBpZiAodGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQpIHtcbiAgICAgIHRoaXMuX2FwcGx5TWF4V2lkdGhQeCgpO1xuICAgIH1cbiAgfVxuXG4gIG5nQWZ0ZXJWaWV3SW5pdCgpIHtcbiAgICB0aGlzLl9saXN0ZW5Gb3JSb3dIb3ZlckV2ZW50cygpO1xuICAgIHRoaXMuX2xpc3RlbkZvclJlc2l6ZUV2ZW50cygpO1xuICAgIHRoaXMuX2FwcGVuZElubGluZUhhbmRsZSgpO1xuICAgIHRoaXMuX2FwcGx5TWluV2lkdGhQeCgpO1xuICAgIHRoaXMuX2FwcGx5TWF4V2lkdGhQeCgpO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgdGhpcy5kZXN0cm95ZWQubmV4dCgpO1xuICAgIHRoaXMuZGVzdHJveWVkLmNvbXBsZXRlKCk7XG5cbiAgICBpZiAodGhpcy5pbmxpbmVIYW5kbGUpIHtcbiAgICAgIHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50IS5yZW1vdmVDaGlsZCh0aGlzLmlubGluZUhhbmRsZSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMub3ZlcmxheVJlZikge1xuICAgICAgdGhpcy5vdmVybGF5UmVmLmRpc3Bvc2UoKTtcbiAgICB9XG4gIH1cblxuICBwcm90ZWN0ZWQgYWJzdHJhY3QgZ2V0SW5saW5lSGFuZGxlQ3NzQ2xhc3NOYW1lKCk6IHN0cmluZztcblxuICBwcm90ZWN0ZWQgYWJzdHJhY3QgZ2V0T3ZlcmxheUhhbmRsZUNvbXBvbmVudFR5cGUoKTogVHlwZTxIYW5kbGVDb21wb25lbnQ+O1xuXG4gIHByaXZhdGUgX2NyZWF0ZU92ZXJsYXlGb3JIYW5kbGUoKTogT3ZlcmxheVJlZiB7XG4gICAgLy8gVXNlIG9mIG92ZXJsYXlzIGFsbG93cyB1cyB0byBwcm9wZXJseSBjYXB0dXJlIGNsaWNrIGV2ZW50cyBzcGFubmluZyBwYXJ0c1xuICAgIC8vIG9mIHR3byB0YWJsZSBjZWxscyBhbmQgaXMgYWxzbyB1c2VmdWwgZm9yIGRpc3BsYXlpbmcgYSByZXNpemUgdGh1bWJcbiAgICAvLyBvdmVyIGJvdGggY2VsbHMgYW5kIGV4dGVuZGluZyBpdCBkb3duIHRoZSB0YWJsZSBhcyBuZWVkZWQuXG5cbiAgICBjb25zdCBwb3NpdGlvblN0cmF0ZWd5ID0gdGhpcy5vdmVybGF5LnBvc2l0aW9uKClcbiAgICAgICAgLmZsZXhpYmxlQ29ubmVjdGVkVG8odGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQhKVxuICAgICAgICAud2l0aEZsZXhpYmxlRGltZW5zaW9ucyhmYWxzZSlcbiAgICAgICAgLndpdGhHcm93QWZ0ZXJPcGVuKGZhbHNlKVxuICAgICAgICAud2l0aFB1c2goZmFsc2UpXG4gICAgICAgIC53aXRoUG9zaXRpb25zKFt7XG4gICAgICAgICAgb3JpZ2luWDogJ2VuZCcsXG4gICAgICAgICAgb3JpZ2luWTogJ3RvcCcsXG4gICAgICAgICAgb3ZlcmxheVg6ICdjZW50ZXInLFxuICAgICAgICAgIG92ZXJsYXlZOiAndG9wJyxcbiAgICAgICAgfV0pO1xuXG4gICAgcmV0dXJuIHRoaXMub3ZlcmxheS5jcmVhdGUoe1xuICAgICAgZGlyZWN0aW9uOiB0aGlzLmRpcmVjdGlvbmFsaXR5LFxuICAgICAgZGlzcG9zZU9uTmF2aWdhdGlvbjogdHJ1ZSxcbiAgICAgIHBvc2l0aW9uU3RyYXRlZ3ksXG4gICAgICBzY3JvbGxTdHJhdGVneTogdGhpcy5vdmVybGF5LnNjcm9sbFN0cmF0ZWdpZXMucmVwb3NpdGlvbigpLFxuICAgICAgd2lkdGg6ICcxNnB4JyxcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX2xpc3RlbkZvclJvd0hvdmVyRXZlbnRzKCk6IHZvaWQge1xuICAgIGNvbnN0IGVsZW1lbnQgPSB0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCE7XG4gICAgY29uc3QgdGFrZVVudGlsRGVzdHJveWVkID0gdGFrZVVudGlsPGJvb2xlYW4+KHRoaXMuZGVzdHJveWVkKTtcblxuXG4gICAgdGhpcy5ldmVudERpc3BhdGNoZXIucmVzaXplT3ZlcmxheVZpc2libGVGb3JIZWFkZXJSb3coX2Nsb3Nlc3QoZWxlbWVudCwgSEVBREVSX1JPV19TRUxFQ1RPUikhKVxuICAgICAgICAucGlwZSh0YWtlVW50aWxEZXN0cm95ZWQpLnN1YnNjcmliZShob3ZlcmluZ1JvdyA9PiB7XG4gICAgICBpZiAoaG92ZXJpbmdSb3cpIHtcbiAgICAgICAgaWYgKCF0aGlzLm92ZXJsYXlSZWYpIHtcbiAgICAgICAgICB0aGlzLm92ZXJsYXlSZWYgPSB0aGlzLl9jcmVhdGVPdmVybGF5Rm9ySGFuZGxlKCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9zaG93SGFuZGxlT3ZlcmxheSgpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLm92ZXJsYXlSZWYpIHtcbiAgICAgICAgLy8gdG9kbyAtIGNhbid0IGRldGFjaCBkdXJpbmcgYW4gYWN0aXZlIHJlc2l6ZSAtIG5lZWQgdG8gd29yayB0aGF0IG91dFxuICAgICAgICB0aGlzLm92ZXJsYXlSZWYuZGV0YWNoKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIF9saXN0ZW5Gb3JSZXNpemVFdmVudHMoKSB7XG4gICAgY29uc3QgdGFrZVVudGlsRGVzdHJveWVkID0gdGFrZVVudGlsPENvbHVtblNpemVBY3Rpb24+KHRoaXMuZGVzdHJveWVkKTtcblxuICAgIG1lcmdlKFxuICAgICAgICB0aGlzLnJlc2l6ZU5vdGlmaWVyLnJlc2l6ZUNhbmNlbGVkLFxuICAgICAgICB0aGlzLnJlc2l6ZU5vdGlmaWVyLnRyaWdnZXJSZXNpemUsXG4gICAgKS5waXBlKFxuICAgICAgICB0YWtlVW50aWxEZXN0cm95ZWQsXG4gICAgICAgIGZpbHRlcihjb2x1bW5TaXplID0+IGNvbHVtblNpemUuY29sdW1uSWQgPT09IHRoaXMuY29sdW1uRGVmLm5hbWUpLFxuICAgICkuc3Vic2NyaWJlKCh7c2l6ZSwgY29tcGxldGVJbW1lZGlhdGVseX0pID0+IHtcbiAgICAgIHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50IS5jbGFzc0xpc3QuYWRkKE9WRVJMQVlfQUNUSVZFX0NMQVNTKTtcbiAgICAgIHRoaXMuX2FwcGx5U2l6ZShzaXplKTtcblxuICAgICAgaWYgKGNvbXBsZXRlSW1tZWRpYXRlbHkpIHtcbiAgICAgICAgdGhpcy5fY29tcGxldGVSZXNpemVPcGVyYXRpb24oKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIG1lcmdlKFxuICAgICAgICB0aGlzLnJlc2l6ZU5vdGlmaWVyLnJlc2l6ZUNhbmNlbGVkLFxuICAgICAgICB0aGlzLnJlc2l6ZU5vdGlmaWVyLnJlc2l6ZUNvbXBsZXRlZCxcbiAgICApLnBpcGUodGFrZVVudGlsRGVzdHJveWVkKS5zdWJzY3JpYmUoY29sdW1uU2l6ZSA9PiB7XG4gICAgICB0aGlzLl9jbGVhblVwQWZ0ZXJSZXNpemUoY29sdW1uU2l6ZSk7XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIF9jb21wbGV0ZVJlc2l6ZU9wZXJhdGlvbigpOiB2b2lkIHtcbiAgICB0aGlzLm5nWm9uZS5ydW4oKCkgPT4ge1xuICAgICAgdGhpcy5yZXNpemVOb3RpZmllci5yZXNpemVDb21wbGV0ZWQubmV4dCh7XG4gICAgICAgIGNvbHVtbklkOiB0aGlzLmNvbHVtbkRlZi5uYW1lLFxuICAgICAgICBzaXplOiB0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCEub2Zmc2V0V2lkdGgsXG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX2NsZWFuVXBBZnRlclJlc2l6ZShjb2x1bW5TaXplOiBDb2x1bW5TaXplQWN0aW9uKTogdm9pZCB7XG4gICAgdGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQhLmNsYXNzTGlzdC5yZW1vdmUoT1ZFUkxBWV9BQ1RJVkVfQ0xBU1MpO1xuXG4gICAgaWYgKHRoaXMub3ZlcmxheVJlZiAmJiB0aGlzLm92ZXJsYXlSZWYuaGFzQXR0YWNoZWQoKSkge1xuICAgICAgdGhpcy5fdXBkYXRlT3ZlcmxheUhhbmRsZUhlaWdodCgpO1xuICAgICAgdGhpcy5vdmVybGF5UmVmLnVwZGF0ZVBvc2l0aW9uKCk7XG5cbiAgICAgIGlmIChjb2x1bW5TaXplLmNvbHVtbklkID09PSB0aGlzLmNvbHVtbkRlZi5uYW1lKSB7XG4gICAgICAgIHRoaXMuaW5saW5lSGFuZGxlIS5mb2N1cygpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2NyZWF0ZUhhbmRsZVBvcnRhbCgpOiBDb21wb25lbnRQb3J0YWw8SGFuZGxlQ29tcG9uZW50PiB7XG4gICAgY29uc3QgaW5qZWN0b3IgPSBuZXcgUG9ydGFsSW5qZWN0b3IodGhpcy5pbmplY3RvciwgbmV3IFdlYWtNYXAoW1tcbiAgICAgIFJlc2l6ZVJlZixcbiAgICAgIG5ldyBSZXNpemVSZWYodGhpcy5lbGVtZW50UmVmLCB0aGlzLm92ZXJsYXlSZWYhLCB0aGlzLm1pbldpZHRoUHgsIHRoaXMubWF4V2lkdGhQeCksXG4gICAgXV0pKTtcbiAgICByZXR1cm4gbmV3IENvbXBvbmVudFBvcnRhbCh0aGlzLmdldE92ZXJsYXlIYW5kbGVDb21wb25lbnRUeXBlKCksXG4gICAgICAgIHRoaXMudmlld0NvbnRhaW5lclJlZiwgaW5qZWN0b3IpO1xuICB9XG5cbiAgcHJpdmF0ZSBfc2hvd0hhbmRsZU92ZXJsYXkoKTogdm9pZCB7XG4gICAgdGhpcy5fdXBkYXRlT3ZlcmxheUhhbmRsZUhlaWdodCgpO1xuICAgIHRoaXMub3ZlcmxheVJlZiEuYXR0YWNoKHRoaXMuX2NyZWF0ZUhhbmRsZVBvcnRhbCgpKTtcbiAgfVxuXG4gIHByaXZhdGUgX3VwZGF0ZU92ZXJsYXlIYW5kbGVIZWlnaHQoKSB7XG4gICAgdGhpcy5vdmVybGF5UmVmIS51cGRhdGVTaXplKHtoZWlnaHQ6IHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50IS5vZmZzZXRIZWlnaHR9KTtcbiAgfVxuXG4gIHByaXZhdGUgX2FwcGx5U2l6ZShzaXplSW5QaXhlbHM6IG51bWJlcik6IHZvaWQge1xuICAgIGNvbnN0IHNpemVUb0FwcGx5ID0gTWF0aC5taW4oTWF0aC5tYXgoc2l6ZUluUGl4ZWxzLCB0aGlzLm1pbldpZHRoUHgsIDApLCB0aGlzLm1heFdpZHRoUHgpO1xuXG4gICAgdGhpcy5yZXNpemVTdHJhdGVneS5hcHBseUNvbHVtblNpemUodGhpcy5jb2x1bW5EZWYuY3NzQ2xhc3NGcmllbmRseU5hbWUsXG4gICAgICAgIHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50ISwgc2l6ZVRvQXBwbHkpO1xuICB9XG5cbiAgcHJpdmF0ZSBfYXBwbHlNaW5XaWR0aFB4KCk6IHZvaWQge1xuICAgIHRoaXMucmVzaXplU3RyYXRlZ3kuYXBwbHlNaW5Db2x1bW5TaXplKHRoaXMuY29sdW1uRGVmLmNzc0NsYXNzRnJpZW5kbHlOYW1lLFxuICAgICAgICB0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCwgdGhpcy5taW5XaWR0aFB4KTtcbiAgfVxuXG4gIHByaXZhdGUgX2FwcGx5TWF4V2lkdGhQeCgpOiB2b2lkIHtcbiAgICB0aGlzLnJlc2l6ZVN0cmF0ZWd5LmFwcGx5TWF4Q29sdW1uU2l6ZSh0aGlzLmNvbHVtbkRlZi5jc3NDbGFzc0ZyaWVuZGx5TmFtZSxcbiAgICAgICAgdGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQsIHRoaXMubWF4V2lkdGhQeCk7XG4gIH1cblxuICBwcml2YXRlIF9hcHBlbmRJbmxpbmVIYW5kbGUoKTogdm9pZCB7XG4gICAgdGhpcy5pbmxpbmVIYW5kbGUgPSB0aGlzLmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHRoaXMuaW5saW5lSGFuZGxlLnRhYkluZGV4ID0gMDtcbiAgICB0aGlzLmlubGluZUhhbmRsZS5jbGFzc05hbWUgPSB0aGlzLmdldElubGluZUhhbmRsZUNzc0NsYXNzTmFtZSgpO1xuXG4gICAgLy8gVE9ETzogQXBwbHkgY29ycmVjdCBhcmlhIHJvbGUgKHByb2JhYmx5IHNsaWRlcikgYWZ0ZXIgYTExeSBzcGVjIHF1ZXN0aW9ucyByZXNvbHZlZC5cblxuICAgIHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50IS5hcHBlbmRDaGlsZCh0aGlzLmlubGluZUhhbmRsZSk7XG4gIH1cbn1cbiJdfQ==