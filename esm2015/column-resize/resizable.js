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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzaXphYmxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvY29sdW1uLXJlc2l6ZS9yZXNpemFibGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBa0JBLE9BQU8sRUFBQyxlQUFlLEVBQUUsY0FBYyxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFHcEUsT0FBTyxFQUFDLEtBQUssRUFBRSxhQUFhLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDMUMsT0FBTyxFQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUVqRCxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sd0NBQXdDLENBQUM7QUFFaEUsT0FBTyxFQUFDLG1CQUFtQixFQUFDLE1BQU0sYUFBYSxDQUFDO0FBS2hELE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSxjQUFjLENBQUM7O01BR2pDLG9CQUFvQixHQUFHLG9DQUFvQzs7Ozs7OztBQU1qRSxNQUFNLE9BQWdCLFNBQVM7SUFBL0I7UUFFWSx1QkFBa0IsR0FBVyxDQUFDLENBQUM7UUFDL0IsdUJBQWtCLEdBQVcsTUFBTSxDQUFDLGdCQUFnQixDQUFDO1FBSTVDLGNBQVMsR0FBRyxJQUFJLGFBQWEsRUFBUSxDQUFDO0lBME0zRCxDQUFDOzs7OztJQTFMQyxJQUFJLFVBQVU7UUFDWixPQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQztJQUNqQyxDQUFDOzs7OztJQUNELElBQUksVUFBVSxDQUFDLEtBQWE7UUFDMUIsSUFBSSxDQUFDLGtCQUFrQixHQUFHLEtBQUssQ0FBQztRQUVoQyxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsYUFBYSxFQUFFO1lBQ2pDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1NBQ3pCO0lBQ0gsQ0FBQzs7Ozs7SUFHRCxJQUFJLFVBQVU7UUFDWixPQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQztJQUNq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LENBQUMsQ0FBQztRQUMvQixJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsMkJBQTJCLEVBQUUsQ0FBQztRQUVqRSxzRkFBc0Y7UUFFdEYsbUJBQUEsSUFBSSxDQUFDLFVBQVUsQ0FBQyxhQUFhLEVBQUMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQ2hFLENBQUM7Q0FDRjs7Ozs7O0lBL01DLHVDQUF5Qzs7Ozs7SUFDekMsdUNBQStEOzs7OztJQUUvRCxpQ0FBcUM7Ozs7O0lBQ3JDLCtCQUFrQzs7Ozs7SUFDbEMsOEJBQXlEOzs7OztJQUV6RCw4QkFBb0Q7Ozs7O0lBQ3BELGlDQUF1RDs7Ozs7SUFDdkQsbUNBQTJEOzs7OztJQUMzRCw2QkFBK0M7Ozs7O0lBQy9DLCtCQUFtRDs7Ozs7SUFDbkQsb0NBQXNFOzs7OztJQUN0RSw2QkFBK0M7Ozs7O0lBQy9DLDJCQUEyQzs7Ozs7SUFDM0MsNEJBQTZDOzs7OztJQUM3QyxtQ0FBdUU7Ozs7O0lBQ3ZFLG1DQUEyRDs7Ozs7SUFDM0QscUNBQStEOzs7Ozs7SUErQy9ELGtFQUF5RDs7Ozs7O0lBRXpELG9FQUEwRSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1xuICBBZnRlclZpZXdJbml0LFxuICBFbGVtZW50UmVmLFxuICBJbmplY3RvcixcbiAgTmdab25lLFxuICBPbkRlc3Ryb3ksXG4gIFR5cGUsXG4gIFZpZXdDb250YWluZXJSZWYsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtEaXJlY3Rpb25hbGl0eX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2JpZGknO1xuaW1wb3J0IHtDb21wb25lbnRQb3J0YWwsIFBvcnRhbEluamVjdG9yfSBmcm9tICdAYW5ndWxhci9jZGsvcG9ydGFsJztcbmltcG9ydCB7T3ZlcmxheSwgT3ZlcmxheVJlZn0gZnJvbSAnQGFuZ3VsYXIvY2RrL292ZXJsYXknO1xuaW1wb3J0IHtDZGtDb2x1bW5EZWZ9IGZyb20gJ0Bhbmd1bGFyL2Nkay90YWJsZSc7XG5pbXBvcnQge21lcmdlLCBSZXBsYXlTdWJqZWN0fSBmcm9tICdyeGpzJztcbmltcG9ydCB7ZmlsdGVyLCB0YWtlVW50aWx9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcblxuaW1wb3J0IHtfY2xvc2VzdH0gZnJvbSAnQGFuZ3VsYXIvY2RrLWV4cGVyaW1lbnRhbC9wb3BvdmVyLWVkaXQnO1xuXG5pbXBvcnQge0hFQURFUl9ST1dfU0VMRUNUT1J9IGZyb20gJy4vc2VsZWN0b3JzJztcbmltcG9ydCB7UmVzaXplT3ZlcmxheUhhbmRsZX0gZnJvbSAnLi9vdmVybGF5LWhhbmRsZSc7XG5pbXBvcnQge0NvbHVtblJlc2l6ZX0gZnJvbSAnLi9jb2x1bW4tcmVzaXplJztcbmltcG9ydCB7Q29sdW1uU2l6ZUFjdGlvbiwgQ29sdW1uUmVzaXplTm90aWZpZXJTb3VyY2V9IGZyb20gJy4vY29sdW1uLXJlc2l6ZS1ub3RpZmllcic7XG5pbXBvcnQge0hlYWRlclJvd0V2ZW50RGlzcGF0Y2hlcn0gZnJvbSAnLi9ldmVudC1kaXNwYXRjaGVyJztcbmltcG9ydCB7UmVzaXplUmVmfSBmcm9tICcuL3Jlc2l6ZS1yZWYnO1xuaW1wb3J0IHtSZXNpemVTdHJhdGVneX0gZnJvbSAnLi9yZXNpemUtc3RyYXRlZ3knO1xuXG5jb25zdCBPVkVSTEFZX0FDVElWRV9DTEFTUyA9ICdjZGstcmVzaXphYmxlLW92ZXJsYXktdGh1bWItYWN0aXZlJztcblxuLyoqXG4gKiBCYXNlIGNsYXNzIGZvciBSZXNpemFibGUgZGlyZWN0aXZlcyB3aGljaCBhcmUgYXBwbGllZCB0byBjb2x1bW4gaGVhZGVycyB0byBtYWtlIHRob3NlIGNvbHVtbnNcbiAqIHJlc2l6YWJsZS5cbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFJlc2l6YWJsZTxIYW5kbGVDb21wb25lbnQgZXh0ZW5kcyBSZXNpemVPdmVybGF5SGFuZGxlPlxuICAgIGltcGxlbWVudHMgQWZ0ZXJWaWV3SW5pdCwgT25EZXN0cm95IHtcbiAgcHJvdGVjdGVkIG1pbldpZHRoUHhJbnRlcm5hbDogbnVtYmVyID0gMDtcbiAgcHJvdGVjdGVkIG1heFdpZHRoUHhJbnRlcm5hbDogbnVtYmVyID0gTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVI7XG5cbiAgcHJvdGVjdGVkIGlubGluZUhhbmRsZT86IEhUTUxFbGVtZW50O1xuICBwcm90ZWN0ZWQgb3ZlcmxheVJlZj86IE92ZXJsYXlSZWY7XG4gIHByb3RlY3RlZCByZWFkb25seSBkZXN0cm95ZWQgPSBuZXcgUmVwbGF5U3ViamVjdDx2b2lkPigpO1xuXG4gIHByb3RlY3RlZCBhYnN0cmFjdCByZWFkb25seSBjb2x1bW5EZWY6IENka0NvbHVtbkRlZjtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IHJlYWRvbmx5IGNvbHVtblJlc2l6ZTogQ29sdW1uUmVzaXplO1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgcmVhZG9ubHkgZGlyZWN0aW9uYWxpdHk6IERpcmVjdGlvbmFsaXR5O1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgcmVhZG9ubHkgZG9jdW1lbnQ6IERvY3VtZW50O1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgcmVhZG9ubHkgZWxlbWVudFJlZjogRWxlbWVudFJlZjtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IHJlYWRvbmx5IGV2ZW50RGlzcGF0Y2hlcjogSGVhZGVyUm93RXZlbnREaXNwYXRjaGVyO1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgcmVhZG9ubHkgaW5qZWN0b3I6IEluamVjdG9yO1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgcmVhZG9ubHkgbmdab25lOiBOZ1pvbmU7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCByZWFkb25seSBvdmVybGF5OiBPdmVybGF5O1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgcmVhZG9ubHkgcmVzaXplTm90aWZpZXI6IENvbHVtblJlc2l6ZU5vdGlmaWVyU291cmNlO1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgcmVhZG9ubHkgcmVzaXplU3RyYXRlZ3k6IFJlc2l6ZVN0cmF0ZWd5O1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgcmVhZG9ubHkgdmlld0NvbnRhaW5lclJlZjogVmlld0NvbnRhaW5lclJlZjtcblxuICAvKiogVGhlIG1pbmltdW0gd2lkdGggdG8gYWxsb3cgdGhlIGNvbHVtbiB0byBiZSBzaXplZCB0by4gKi9cbiAgZ2V0IG1pbldpZHRoUHgoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5taW5XaWR0aFB4SW50ZXJuYWw7XG4gIH1cbiAgc2V0IG1pbldpZHRoUHgodmFsdWU6IG51bWJlcikge1xuICAgIHRoaXMubWluV2lkdGhQeEludGVybmFsID0gdmFsdWU7XG5cbiAgICBpZiAodGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQpIHtcbiAgICAgIHRoaXMuX2FwcGx5TWluV2lkdGhQeCgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBUaGUgbWF4aW11bSB3aWR0aCB0byBhbGxvdyB0aGUgY29sdW1uIHRvIGJlIHNpemVkIHRvLiAqL1xuICBnZXQgbWF4V2lkdGhQeCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLm1heFdpZHRoUHhJbnRlcm5hbDtcbiAgfVxuICBzZXQgbWF4V2lkdGhQeCh2YWx1ZTogbnVtYmVyKSB7XG4gICAgdGhpcy5tYXhXaWR0aFB4SW50ZXJuYWwgPSB2YWx1ZTtcblxuICAgIGlmICh0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCkge1xuICAgICAgdGhpcy5fYXBwbHlNYXhXaWR0aFB4KCk7XG4gICAgfVxuICB9XG5cbiAgbmdBZnRlclZpZXdJbml0KCkge1xuICAgIHRoaXMuX2xpc3RlbkZvclJvd0hvdmVyRXZlbnRzKCk7XG4gICAgdGhpcy5fbGlzdGVuRm9yUmVzaXplRXZlbnRzKCk7XG4gICAgdGhpcy5fYXBwZW5kSW5saW5lSGFuZGxlKCk7XG4gICAgdGhpcy5fYXBwbHlNaW5XaWR0aFB4KCk7XG4gICAgdGhpcy5fYXBwbHlNYXhXaWR0aFB4KCk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLmRlc3Ryb3llZC5uZXh0KCk7XG4gICAgdGhpcy5kZXN0cm95ZWQuY29tcGxldGUoKTtcblxuICAgIGlmICh0aGlzLmlubGluZUhhbmRsZSkge1xuICAgICAgdGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQhLnJlbW92ZUNoaWxkKHRoaXMuaW5saW5lSGFuZGxlKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5vdmVybGF5UmVmKSB7XG4gICAgICB0aGlzLm92ZXJsYXlSZWYuZGlzcG9zZSgpO1xuICAgIH1cbiAgfVxuXG4gIHByb3RlY3RlZCBhYnN0cmFjdCBnZXRJbmxpbmVIYW5kbGVDc3NDbGFzc05hbWUoKTogc3RyaW5nO1xuXG4gIHByb3RlY3RlZCBhYnN0cmFjdCBnZXRPdmVybGF5SGFuZGxlQ29tcG9uZW50VHlwZSgpOiBUeXBlPEhhbmRsZUNvbXBvbmVudD47XG5cbiAgcHJpdmF0ZSBfY3JlYXRlT3ZlcmxheUZvckhhbmRsZSgpOiBPdmVybGF5UmVmIHtcbiAgICAvLyBVc2Ugb2Ygb3ZlcmxheXMgYWxsb3dzIHVzIHRvIHByb3Blcmx5IGNhcHR1cmUgY2xpY2sgZXZlbnRzIHNwYW5uaW5nIHBhcnRzXG4gICAgLy8gb2YgdHdvIHRhYmxlIGNlbGxzIGFuZCBpcyBhbHNvIHVzZWZ1bCBmb3IgZGlzcGxheWluZyBhIHJlc2l6ZSB0aHVtYlxuICAgIC8vIG92ZXIgYm90aCBjZWxscyBhbmQgZXh0ZW5kaW5nIGl0IGRvd24gdGhlIHRhYmxlIGFzIG5lZWRlZC5cblxuICAgIGNvbnN0IHBvc2l0aW9uU3RyYXRlZ3kgPSB0aGlzLm92ZXJsYXkucG9zaXRpb24oKVxuICAgICAgICAuZmxleGlibGVDb25uZWN0ZWRUbyh0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCEpXG4gICAgICAgIC53aXRoRmxleGlibGVEaW1lbnNpb25zKGZhbHNlKVxuICAgICAgICAud2l0aEdyb3dBZnRlck9wZW4oZmFsc2UpXG4gICAgICAgIC53aXRoUHVzaChmYWxzZSlcbiAgICAgICAgLndpdGhQb3NpdGlvbnMoW3tcbiAgICAgICAgICBvcmlnaW5YOiAnZW5kJyxcbiAgICAgICAgICBvcmlnaW5ZOiAndG9wJyxcbiAgICAgICAgICBvdmVybGF5WDogJ2NlbnRlcicsXG4gICAgICAgICAgb3ZlcmxheVk6ICd0b3AnLFxuICAgICAgICB9XSk7XG5cbiAgICByZXR1cm4gdGhpcy5vdmVybGF5LmNyZWF0ZSh7XG4gICAgICBkaXJlY3Rpb246IHRoaXMuZGlyZWN0aW9uYWxpdHksXG4gICAgICBkaXNwb3NlT25OYXZpZ2F0aW9uOiB0cnVlLFxuICAgICAgcG9zaXRpb25TdHJhdGVneSxcbiAgICAgIHNjcm9sbFN0cmF0ZWd5OiB0aGlzLm92ZXJsYXkuc2Nyb2xsU3RyYXRlZ2llcy5yZXBvc2l0aW9uKCksXG4gICAgICB3aWR0aDogJzE2cHgnLFxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfbGlzdGVuRm9yUm93SG92ZXJFdmVudHMoKTogdm9pZCB7XG4gICAgY29uc3QgZWxlbWVudCA9IHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50ITtcbiAgICBjb25zdCB0YWtlVW50aWxEZXN0cm95ZWQgPSB0YWtlVW50aWw8Ym9vbGVhbj4odGhpcy5kZXN0cm95ZWQpO1xuXG5cbiAgICB0aGlzLmV2ZW50RGlzcGF0Y2hlci5yZXNpemVPdmVybGF5VmlzaWJsZUZvckhlYWRlclJvdyhfY2xvc2VzdChlbGVtZW50LCBIRUFERVJfUk9XX1NFTEVDVE9SKSEpXG4gICAgICAgIC5waXBlKHRha2VVbnRpbERlc3Ryb3llZCkuc3Vic2NyaWJlKGhvdmVyaW5nUm93ID0+IHtcbiAgICAgIGlmIChob3ZlcmluZ1Jvdykge1xuICAgICAgICBpZiAoIXRoaXMub3ZlcmxheVJlZikge1xuICAgICAgICAgIHRoaXMub3ZlcmxheVJlZiA9IHRoaXMuX2NyZWF0ZU92ZXJsYXlGb3JIYW5kbGUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX3Nob3dIYW5kbGVPdmVybGF5KCk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMub3ZlcmxheVJlZikge1xuICAgICAgICAvLyB0b2RvIC0gY2FuJ3QgZGV0YWNoIGR1cmluZyBhbiBhY3RpdmUgcmVzaXplIC0gbmVlZCB0byB3b3JrIHRoYXQgb3V0XG4gICAgICAgIHRoaXMub3ZlcmxheVJlZi5kZXRhY2goKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX2xpc3RlbkZvclJlc2l6ZUV2ZW50cygpIHtcbiAgICBjb25zdCB0YWtlVW50aWxEZXN0cm95ZWQgPSB0YWtlVW50aWw8Q29sdW1uU2l6ZUFjdGlvbj4odGhpcy5kZXN0cm95ZWQpO1xuXG4gICAgbWVyZ2UoXG4gICAgICAgIHRoaXMucmVzaXplTm90aWZpZXIucmVzaXplQ2FuY2VsZWQsXG4gICAgICAgIHRoaXMucmVzaXplTm90aWZpZXIudHJpZ2dlclJlc2l6ZSxcbiAgICApLnBpcGUoXG4gICAgICAgIHRha2VVbnRpbERlc3Ryb3llZCxcbiAgICAgICAgZmlsdGVyKGNvbHVtblNpemUgPT4gY29sdW1uU2l6ZS5jb2x1bW5JZCA9PT0gdGhpcy5jb2x1bW5EZWYubmFtZSksXG4gICAgKS5zdWJzY3JpYmUoKHtzaXplLCBjb21wbGV0ZUltbWVkaWF0ZWx5fSkgPT4ge1xuICAgICAgdGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQhLmNsYXNzTGlzdC5hZGQoT1ZFUkxBWV9BQ1RJVkVfQ0xBU1MpO1xuICAgICAgdGhpcy5fYXBwbHlTaXplKHNpemUpO1xuXG4gICAgICBpZiAoY29tcGxldGVJbW1lZGlhdGVseSkge1xuICAgICAgICB0aGlzLl9jb21wbGV0ZVJlc2l6ZU9wZXJhdGlvbigpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgbWVyZ2UoXG4gICAgICAgIHRoaXMucmVzaXplTm90aWZpZXIucmVzaXplQ2FuY2VsZWQsXG4gICAgICAgIHRoaXMucmVzaXplTm90aWZpZXIucmVzaXplQ29tcGxldGVkLFxuICAgICkucGlwZSh0YWtlVW50aWxEZXN0cm95ZWQpLnN1YnNjcmliZShjb2x1bW5TaXplID0+IHtcbiAgICAgIHRoaXMuX2NsZWFuVXBBZnRlclJlc2l6ZShjb2x1bW5TaXplKTtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX2NvbXBsZXRlUmVzaXplT3BlcmF0aW9uKCk6IHZvaWQge1xuICAgIHRoaXMubmdab25lLnJ1bigoKSA9PiB7XG4gICAgICB0aGlzLnJlc2l6ZU5vdGlmaWVyLnJlc2l6ZUNvbXBsZXRlZC5uZXh0KHtcbiAgICAgICAgY29sdW1uSWQ6IHRoaXMuY29sdW1uRGVmLm5hbWUsXG4gICAgICAgIHNpemU6IHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50IS5vZmZzZXRXaWR0aCxcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfY2xlYW5VcEFmdGVyUmVzaXplKGNvbHVtblNpemU6IENvbHVtblNpemVBY3Rpb24pOiB2b2lkIHtcbiAgICB0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCEuY2xhc3NMaXN0LnJlbW92ZShPVkVSTEFZX0FDVElWRV9DTEFTUyk7XG5cbiAgICBpZiAodGhpcy5vdmVybGF5UmVmICYmIHRoaXMub3ZlcmxheVJlZi5oYXNBdHRhY2hlZCgpKSB7XG4gICAgICB0aGlzLl91cGRhdGVPdmVybGF5SGFuZGxlSGVpZ2h0KCk7XG4gICAgICB0aGlzLm92ZXJsYXlSZWYudXBkYXRlUG9zaXRpb24oKTtcblxuICAgICAgaWYgKGNvbHVtblNpemUuY29sdW1uSWQgPT09IHRoaXMuY29sdW1uRGVmLm5hbWUpIHtcbiAgICAgICAgdGhpcy5pbmxpbmVIYW5kbGUhLmZvY3VzKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfY3JlYXRlSGFuZGxlUG9ydGFsKCk6IENvbXBvbmVudFBvcnRhbDxIYW5kbGVDb21wb25lbnQ+IHtcbiAgICBjb25zdCBpbmplY3RvciA9IG5ldyBQb3J0YWxJbmplY3Rvcih0aGlzLmluamVjdG9yLCBuZXcgV2Vha01hcChbW1xuICAgICAgUmVzaXplUmVmLFxuICAgICAgbmV3IFJlc2l6ZVJlZih0aGlzLmVsZW1lbnRSZWYsIHRoaXMub3ZlcmxheVJlZiEsIHRoaXMubWluV2lkdGhQeCwgdGhpcy5tYXhXaWR0aFB4KSxcbiAgICBdXSkpO1xuICAgIHJldHVybiBuZXcgQ29tcG9uZW50UG9ydGFsKHRoaXMuZ2V0T3ZlcmxheUhhbmRsZUNvbXBvbmVudFR5cGUoKSxcbiAgICAgICAgdGhpcy52aWV3Q29udGFpbmVyUmVmLCBpbmplY3Rvcik7XG4gIH1cblxuICBwcml2YXRlIF9zaG93SGFuZGxlT3ZlcmxheSgpOiB2b2lkIHtcbiAgICB0aGlzLl91cGRhdGVPdmVybGF5SGFuZGxlSGVpZ2h0KCk7XG4gICAgdGhpcy5vdmVybGF5UmVmIS5hdHRhY2godGhpcy5fY3JlYXRlSGFuZGxlUG9ydGFsKCkpO1xuICB9XG5cbiAgcHJpdmF0ZSBfdXBkYXRlT3ZlcmxheUhhbmRsZUhlaWdodCgpIHtcbiAgICB0aGlzLm92ZXJsYXlSZWYhLnVwZGF0ZVNpemUoe2hlaWdodDogdGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQhLm9mZnNldEhlaWdodH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfYXBwbHlTaXplKHNpemVJblBpeGVsczogbnVtYmVyKTogdm9pZCB7XG4gICAgY29uc3Qgc2l6ZVRvQXBwbHkgPSBNYXRoLm1pbihNYXRoLm1heChzaXplSW5QaXhlbHMsIHRoaXMubWluV2lkdGhQeCwgMCksIHRoaXMubWF4V2lkdGhQeCk7XG5cbiAgICB0aGlzLnJlc2l6ZVN0cmF0ZWd5LmFwcGx5Q29sdW1uU2l6ZSh0aGlzLmNvbHVtbkRlZi5jc3NDbGFzc0ZyaWVuZGx5TmFtZSxcbiAgICAgICAgdGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQhLCBzaXplVG9BcHBseSk7XG4gIH1cblxuICBwcml2YXRlIF9hcHBseU1pbldpZHRoUHgoKTogdm9pZCB7XG4gICAgdGhpcy5yZXNpemVTdHJhdGVneS5hcHBseU1pbkNvbHVtblNpemUodGhpcy5jb2x1bW5EZWYuY3NzQ2xhc3NGcmllbmRseU5hbWUsXG4gICAgICAgIHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LCB0aGlzLm1pbldpZHRoUHgpO1xuICB9XG5cbiAgcHJpdmF0ZSBfYXBwbHlNYXhXaWR0aFB4KCk6IHZvaWQge1xuICAgIHRoaXMucmVzaXplU3RyYXRlZ3kuYXBwbHlNYXhDb2x1bW5TaXplKHRoaXMuY29sdW1uRGVmLmNzc0NsYXNzRnJpZW5kbHlOYW1lLFxuICAgICAgICB0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCwgdGhpcy5tYXhXaWR0aFB4KTtcbiAgfVxuXG4gIHByaXZhdGUgX2FwcGVuZElubGluZUhhbmRsZSgpOiB2b2lkIHtcbiAgICB0aGlzLmlubGluZUhhbmRsZSA9IHRoaXMuZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgdGhpcy5pbmxpbmVIYW5kbGUudGFiSW5kZXggPSAwO1xuICAgIHRoaXMuaW5saW5lSGFuZGxlLmNsYXNzTmFtZSA9IHRoaXMuZ2V0SW5saW5lSGFuZGxlQ3NzQ2xhc3NOYW1lKCk7XG5cbiAgICAvLyBUT0RPOiBBcHBseSBjb3JyZWN0IGFyaWEgcm9sZSAocHJvYmFibHkgc2xpZGVyKSBhZnRlciBhMTF5IHNwZWMgcXVlc3Rpb25zIHJlc29sdmVkLlxuXG4gICAgdGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQhLmFwcGVuZENoaWxkKHRoaXMuaW5saW5lSGFuZGxlKTtcbiAgfVxufVxuIl19