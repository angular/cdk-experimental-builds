/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, } from '@angular/core';
import { ComponentPortal, PortalInjector } from '@angular/cdk/portal';
import { merge, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { _closest } from '@angular/cdk-experimental/popover-edit';
import { HEADER_ROW_SELECTOR } from './selectors';
import { ResizeRef } from './resize-ref';
const OVERLAY_ACTIVE_CLASS = 'cdk-resizable-overlay-thumb-active';
/**
 * Base class for Resizable directives which are applied to column headers to make those columns
 * resizable.
 */
let Resizable = /** @class */ (() => {
    class Resizable {
        constructor() {
            this.minWidthPxInternal = 0;
            this.maxWidthPxInternal = Number.MAX_SAFE_INTEGER;
            this.destroyed = new Subject();
        }
        /** The minimum width to allow the column to be sized to. */
        get minWidthPx() {
            return this.minWidthPxInternal;
        }
        set minWidthPx(value) {
            this.minWidthPxInternal = value;
            if (this.elementRef.nativeElement) {
                this.columnResize.setResized();
                this._applyMinWidthPx();
            }
        }
        /** The maximum width to allow the column to be sized to. */
        get maxWidthPx() {
            return this.maxWidthPxInternal;
        }
        set maxWidthPx(value) {
            this.maxWidthPxInternal = value;
            if (this.elementRef.nativeElement) {
                this.columnResize.setResized();
                this._applyMaxWidthPx();
            }
        }
        ngAfterViewInit() {
            this._listenForRowHoverEvents();
            this._listenForResizeEvents();
            this._appendInlineHandle();
            this._applyMinWidthPx();
            this._applyMaxWidthPx();
        }
        ngOnDestroy() {
            this.destroyed.next();
            this.destroyed.complete();
            if (this.inlineHandle) {
                this.elementRef.nativeElement.removeChild(this.inlineHandle);
            }
            if (this.overlayRef) {
                this.overlayRef.dispose();
            }
        }
        _createOverlayForHandle() {
            // Use of overlays allows us to properly capture click events spanning parts
            // of two table cells and is also useful for displaying a resize thumb
            // over both cells and extending it down the table as needed.
            const isRtl = this.directionality.value === 'rtl';
            const positionStrategy = this.overlay.position()
                .flexibleConnectedTo(this.elementRef.nativeElement)
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
        _listenForRowHoverEvents() {
            const element = this.elementRef.nativeElement;
            const takeUntilDestroyed = takeUntil(this.destroyed);
            this.eventDispatcher.resizeOverlayVisibleForHeaderRow(_closest(element, HEADER_ROW_SELECTOR))
                .pipe(takeUntilDestroyed).subscribe(hoveringRow => {
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
            });
        }
        _listenForResizeEvents() {
            const takeUntilDestroyed = takeUntil(this.destroyed);
            merge(this.resizeNotifier.resizeCanceled, this.resizeNotifier.triggerResize).pipe(takeUntilDestroyed, filter(columnSize => columnSize.columnId === this.columnDef.name)).subscribe(({ size, previousSize, completeImmediately }) => {
                this.elementRef.nativeElement.classList.add(OVERLAY_ACTIVE_CLASS);
                this._applySize(size, previousSize);
                if (completeImmediately) {
                    this._completeResizeOperation();
                }
            });
            merge(this.resizeNotifier.resizeCanceled, this.resizeNotifier.resizeCompleted).pipe(takeUntilDestroyed).subscribe(columnSize => {
                this._cleanUpAfterResize(columnSize);
            });
        }
        _completeResizeOperation() {
            this.ngZone.run(() => {
                this.resizeNotifier.resizeCompleted.next({
                    columnId: this.columnDef.name,
                    size: this.elementRef.nativeElement.offsetWidth,
                });
            });
        }
        _cleanUpAfterResize(columnSize) {
            this.elementRef.nativeElement.classList.remove(OVERLAY_ACTIVE_CLASS);
            if (this.overlayRef && this.overlayRef.hasAttached()) {
                this._updateOverlayHandleHeight();
                this.overlayRef.updatePosition();
                if (columnSize.columnId === this.columnDef.name) {
                    this.inlineHandle.focus();
                }
            }
        }
        _createHandlePortal() {
            const injector = new PortalInjector(this.injector, new WeakMap([[
                    ResizeRef,
                    new ResizeRef(this.elementRef, this.overlayRef, this.minWidthPx, this.maxWidthPx),
                ]]));
            return new ComponentPortal(this.getOverlayHandleComponentType(), this.viewContainerRef, injector);
        }
        _showHandleOverlay() {
            this._updateOverlayHandleHeight();
            this.overlayRef.attach(this._createHandlePortal());
            // Needed to ensure that all of the lifecycle hooks inside the overlay run immediately.
            this.changeDetectorRef.markForCheck();
        }
        _updateOverlayHandleHeight() {
            this.overlayRef.updateSize({ height: this.elementRef.nativeElement.offsetHeight });
        }
        _applySize(sizeInPixels, previousSize) {
            const sizeToApply = Math.min(Math.max(sizeInPixels, this.minWidthPx, 0), this.maxWidthPx);
            this.resizeStrategy.applyColumnSize(this.columnDef.cssClassFriendlyName, this.elementRef.nativeElement, sizeToApply, previousSize);
        }
        _applyMinWidthPx() {
            this.resizeStrategy.applyMinColumnSize(this.columnDef.cssClassFriendlyName, this.elementRef.nativeElement, this.minWidthPx);
        }
        _applyMaxWidthPx() {
            this.resizeStrategy.applyMaxColumnSize(this.columnDef.cssClassFriendlyName, this.elementRef.nativeElement, this.maxWidthPx);
        }
        _appendInlineHandle() {
            this.inlineHandle = this.document.createElement('div');
            this.inlineHandle.tabIndex = 0;
            this.inlineHandle.className = this.getInlineHandleCssClassName();
            // TODO: Apply correct aria role (probably slider) after a11y spec questions resolved.
            this.elementRef.nativeElement.appendChild(this.inlineHandle);
        }
    }
    Resizable.decorators = [
        { type: Directive }
    ];
    return Resizable;
})();
export { Resizable };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzaXphYmxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvY29sdW1uLXJlc2l6ZS9yZXNpemFibGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUVMLFNBQVMsR0FRVixNQUFNLGVBQWUsQ0FBQztBQUV2QixPQUFPLEVBQUMsZUFBZSxFQUFFLGNBQWMsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBR3BFLE9BQU8sRUFBQyxLQUFLLEVBQUUsT0FBTyxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQ3BDLE9BQU8sRUFBQyxNQUFNLEVBQUUsU0FBUyxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFFakQsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLHdDQUF3QyxDQUFDO0FBRWhFLE9BQU8sRUFBQyxtQkFBbUIsRUFBQyxNQUFNLGFBQWEsQ0FBQztBQUtoRCxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sY0FBYyxDQUFDO0FBR3ZDLE1BQU0sb0JBQW9CLEdBQUcsb0NBQW9DLENBQUM7QUFFbEU7OztHQUdHO0FBQ0g7SUFBQSxNQUNzQixTQUFTO1FBRC9CO1lBR1ksdUJBQWtCLEdBQVcsQ0FBQyxDQUFDO1lBQy9CLHVCQUFrQixHQUFXLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQztZQUk1QyxjQUFTLEdBQUcsSUFBSSxPQUFPLEVBQVEsQ0FBQztRQW1OckQsQ0FBQztRQW5NQyw0REFBNEQ7UUFDNUQsSUFBSSxVQUFVO1lBQ1osT0FBTyxJQUFJLENBQUMsa0JBQWtCLENBQUM7UUFDakMsQ0FBQztRQUNELElBQUksVUFBVSxDQUFDLEtBQWE7WUFDMUIsSUFBSSxDQUFDLGtCQUFrQixHQUFHLEtBQUssQ0FBQztZQUVoQyxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsYUFBYSxFQUFFO2dCQUNqQyxJQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsRUFBRSxDQUFD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VUFBVSxDQUFDLENBQUM7UUFDdEQsQ0FBQztRQUVPLGdCQUFnQjtZQUN0QixJQUFJLENBQUMsY0FBYyxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsb0JBQW9CLEVBQ3RFLElBQUksQ0FBQyxVQUFVLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUN0RCxDQUFDO1FBRU8sbUJBQW1CO1lBQ3pCLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDdkQsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO1lBQy9CLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQywyQkFBMkIsRUFBRSxDQUFDO1lBRWpFLHNGQUFzRjtZQUV0RixJQUFJLENBQUMsVUFBVSxDQUFDLGFBQWMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ2hFLENBQUM7OztnQkExTkYsU0FBUzs7SUEyTlYsZ0JBQUM7S0FBQTtTQTFOcUIsU0FBUyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1xuICBBZnRlclZpZXdJbml0LFxuICBEaXJlY3RpdmUsXG4gIEVsZW1lbnRSZWYsXG4gIEluamVjdG9yLFxuICBOZ1pvbmUsXG4gIE9uRGVzdHJveSxcbiAgVHlwZSxcbiAgVmlld0NvbnRhaW5lclJlZixcbiAgQ2hhbmdlRGV0ZWN0b3JSZWYsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtEaXJlY3Rpb25hbGl0eX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2JpZGknO1xuaW1wb3J0IHtDb21wb25lbnRQb3J0YWwsIFBvcnRhbEluamVjdG9yfSBmcm9tICdAYW5ndWxhci9jZGsvcG9ydGFsJztcbmltcG9ydCB7T3ZlcmxheSwgT3ZlcmxheVJlZn0gZnJvbSAnQGFuZ3VsYXIvY2RrL292ZXJsYXknO1xuaW1wb3J0IHtDZGtDb2x1bW5EZWZ9IGZyb20gJ0Bhbmd1bGFyL2Nkay90YWJsZSc7XG5pbXBvcnQge21lcmdlLCBTdWJqZWN0fSBmcm9tICdyeGpzJztcbmltcG9ydCB7ZmlsdGVyLCB0YWtlVW50aWx9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcblxuaW1wb3J0IHtfY2xvc2VzdH0gZnJvbSAnQGFuZ3VsYXIvY2RrLWV4cGVyaW1lbnRhbC9wb3BvdmVyLWVkaXQnO1xuXG5pbXBvcnQge0hFQURFUl9ST1dfU0VMRUNUT1J9IGZyb20gJy4vc2VsZWN0b3JzJztcbmltcG9ydCB7UmVzaXplT3ZlcmxheUhhbmRsZX0gZnJvbSAnLi9vdmVybGF5LWhhbmRsZSc7XG5pbXBvcnQge0NvbHVtblJlc2l6ZX0gZnJvbSAnLi9jb2x1bW4tcmVzaXplJztcbmltcG9ydCB7Q29sdW1uU2l6ZUFjdGlvbiwgQ29sdW1uUmVzaXplTm90aWZpZXJTb3VyY2V9IGZyb20gJy4vY29sdW1uLXJlc2l6ZS1ub3RpZmllcic7XG5pbXBvcnQge0hlYWRlclJvd0V2ZW50RGlzcGF0Y2hlcn0gZnJvbSAnLi9ldmVudC1kaXNwYXRjaGVyJztcbmltcG9ydCB7UmVzaXplUmVmfSBmcm9tICcuL3Jlc2l6ZS1yZWYnO1xuaW1wb3J0IHtSZXNpemVTdHJhdGVneX0gZnJvbSAnLi9yZXNpemUtc3RyYXRlZ3knO1xuXG5jb25zdCBPVkVSTEFZX0FDVElWRV9DTEFTUyA9ICdjZGstcmVzaXphYmxlLW92ZXJsYXktdGh1bWItYWN0aXZlJztcblxuLyoqXG4gKiBCYXNlIGNsYXNzIGZvciBSZXNpemFibGUgZGlyZWN0aXZlcyB3aGljaCBhcmUgYXBwbGllZCB0byBjb2x1bW4gaGVhZGVycyB0byBtYWtlIHRob3NlIGNvbHVtbnNcbiAqIHJlc2l6YWJsZS5cbiAqL1xuQERpcmVjdGl2ZSgpXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgUmVzaXphYmxlPEhhbmRsZUNvbXBvbmVudCBleHRlbmRzIFJlc2l6ZU92ZXJsYXlIYW5kbGU+XG4gICAgaW1wbGVtZW50cyBBZnRlclZpZXdJbml0LCBPbkRlc3Ryb3kge1xuICBwcm90ZWN0ZWQgbWluV2lkdGhQeEludGVybmFsOiBudW1iZXIgPSAwO1xuICBwcm90ZWN0ZWQgbWF4V2lkdGhQeEludGVybmFsOiBudW1iZXIgPSBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUjtcblxuICBwcm90ZWN0ZWQgaW5saW5lSGFuZGxlPzogSFRNTEVsZW1lbnQ7XG4gIHByb3RlY3RlZCBvdmVybGF5UmVmPzogT3ZlcmxheVJlZjtcbiAgcHJvdGVjdGVkIHJlYWRvbmx5IGRlc3Ryb3llZCA9IG5ldyBTdWJqZWN0PHZvaWQ+KCk7XG5cbiAgcHJvdGVjdGVkIGFic3RyYWN0IHJlYWRvbmx5IGNvbHVtbkRlZjogQ2RrQ29sdW1uRGVmO1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgcmVhZG9ubHkgY29sdW1uUmVzaXplOiBDb2x1bW5SZXNpemU7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCByZWFkb25seSBkaXJlY3Rpb25hbGl0eTogRGlyZWN0aW9uYWxpdHk7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCByZWFkb25seSBkb2N1bWVudDogRG9jdW1lbnQ7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCByZWFkb25seSBlbGVtZW50UmVmOiBFbGVtZW50UmVmO1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgcmVhZG9ubHkgZXZlbnREaXNwYXRjaGVyOiBIZWFkZXJSb3dFdmVudERpc3BhdGNoZXI7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCByZWFkb25seSBpbmplY3RvcjogSW5qZWN0b3I7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCByZWFkb25seSBuZ1pvbmU6IE5nWm9uZTtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IHJlYWRvbmx5IG92ZXJsYXk6IE92ZXJsYXk7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCByZWFkb25seSByZXNpemVOb3RpZmllcjogQ29sdW1uUmVzaXplTm90aWZpZXJTb3VyY2U7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCByZWFkb25seSByZXNpemVTdHJhdGVneTogUmVzaXplU3RyYXRlZ3k7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCByZWFkb25seSB2aWV3Q29udGFpbmVyUmVmOiBWaWV3Q29udGFpbmVyUmVmO1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgcmVhZG9ubHkgY2hhbmdlRGV0ZWN0b3JSZWY6IENoYW5nZURldGVjdG9yUmVmO1xuXG4gIC8qKiBUaGUgbWluaW11bSB3aWR0aCB0byBhbGxvdyB0aGUgY29sdW1uIHRvIGJlIHNpemVkIHRvLiAqL1xuICBnZXQgbWluV2lkdGhQeCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLm1pbldpZHRoUHhJbnRlcm5hbDtcbiAgfVxuICBzZXQgbWluV2lkdGhQeCh2YWx1ZTogbnVtYmVyKSB7XG4gICAgdGhpcy5taW5XaWR0aFB4SW50ZXJuYWwgPSB2YWx1ZTtcblxuICAgIGlmICh0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCkge1xuICAgICAgdGhpcy5jb2x1bW5SZXNpemUuc2V0UmVzaXplZCgpO1xuICAgICAgdGhpcy5fYXBwbHlNaW5XaWR0aFB4KCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFRoZSBtYXhpbXVtIHdpZHRoIHRvIGFsbG93IHRoZSBjb2x1bW4gdG8gYmUgc2l6ZWQgdG8uICovXG4gIGdldCBtYXhXaWR0aFB4KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMubWF4V2lkdGhQeEludGVybmFsO1xuICB9XG4gIHNldCBtYXhXaWR0aFB4KHZhbHVlOiBudW1iZXIpIHtcbiAgICB0aGlzLm1heFdpZHRoUHhJbnRlcm5hbCA9IHZhbHVlO1xuXG4gICAgaWYgKHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50KSB7XG4gICAgICB0aGlzLmNvbHVtblJlc2l6ZS5zZXRSZXNpemVkKCk7XG4gICAgICB0aGlzLl9hcHBseU1heFdpZHRoUHgoKTtcbiAgICB9XG4gIH1cblxuICBuZ0FmdGVyVmlld0luaXQoKSB7XG4gICAgdGhpcy5fbGlzdGVuRm9yUm93SG92ZXJFdmVudHMoKTtcbiAgICB0aGlzLl9saXN0ZW5Gb3JSZXNpemVFdmVudHMoKTtcbiAgICB0aGlzLl9hcHBlbmRJbmxpbmVIYW5kbGUoKTtcbiAgICB0aGlzLl9hcHBseU1pbldpZHRoUHgoKTtcbiAgICB0aGlzLl9hcHBseU1heFdpZHRoUHgoKTtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCk6IHZvaWQge1xuICAgIHRoaXMuZGVzdHJveWVkLm5leHQoKTtcbiAgICB0aGlzLmRlc3Ryb3llZC5jb21wbGV0ZSgpO1xuXG4gICAgaWYgKHRoaXMuaW5saW5lSGFuZGxlKSB7XG4gICAgICB0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCEucmVtb3ZlQ2hpbGQodGhpcy5pbmxpbmVIYW5kbGUpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLm92ZXJsYXlSZWYpIHtcbiAgICAgIHRoaXMub3ZlcmxheVJlZi5kaXNwb3NlKCk7XG4gICAgfVxuICB9XG5cbiAgcHJvdGVjdGVkIGFic3RyYWN0IGdldElubGluZUhhbmRsZUNzc0NsYXNzTmFtZSgpOiBzdHJpbmc7XG5cbiAgcHJvdGVjdGVkIGFic3RyYWN0IGdldE92ZXJsYXlIYW5kbGVDb21wb25lbnRUeXBlKCk6IFR5cGU8SGFuZGxlQ29tcG9uZW50PjtcblxuICBwcml2YXRlIF9jcmVhdGVPdmVybGF5Rm9ySGFuZGxlKCk6IE92ZXJsYXlSZWYge1xuICAgIC8vIFVzZSBvZiBvdmVybGF5cyBhbGxvd3MgdXMgdG8gcHJvcGVybHkgY2FwdHVyZSBjbGljayBldmVudHMgc3Bhbm5pbmcgcGFydHNcbiAgICAvLyBvZiB0d28gdGFibGUgY2VsbHMgYW5kIGlzIGFsc28gdXNlZnVsIGZvciBkaXNwbGF5aW5nIGEgcmVzaXplIHRodW1iXG4gICAgLy8gb3ZlciBib3RoIGNlbGxzIGFuZCBleHRlbmRpbmcgaXQgZG93biB0aGUgdGFibGUgYXMgbmVlZGVkLlxuXG4gICAgY29uc3QgaXNSdGwgPSB0aGlzLmRpcmVjdGlvbmFsaXR5LnZhbHVlID09PSAncnRsJztcbiAgICBjb25zdCBwb3NpdGlvblN0cmF0ZWd5ID0gdGhpcy5vdmVybGF5LnBvc2l0aW9uKClcbiAgICAgICAgLmZsZXhpYmxlQ29ubmVjdGVkVG8odGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQhKVxuICAgICAgICAud2l0aEZsZXhpYmxlRGltZW5zaW9ucyhmYWxzZSlcbiAgICAgICAgLndpdGhHcm93QWZ0ZXJPcGVuKGZhbHNlKVxuICAgICAgICAud2l0aFB1c2goZmFsc2UpXG4gICAgICAgIC53aXRoRGVmYXVsdE9mZnNldFgoaXNSdGwgPyAxIDogMClcbiAgICAgICAgLndpdGhQb3NpdGlvbnMoW3tcbiAgICAgICAgICBvcmlnaW5YOiBpc1J0bCA/ICdzdGFydCcgOiAnZW5kJyxcbiAgICAgICAgICBvcmlnaW5ZOiAndG9wJyxcbiAgICAgICAgICBvdmVybGF5WDogJ2NlbnRlcicsXG4gICAgICAgICAgb3ZlcmxheVk6ICd0b3AnLFxuICAgICAgICB9XSk7XG5cbiAgICByZXR1cm4gdGhpcy5vdmVybGF5LmNyZWF0ZSh7XG4gICAgICAvLyBBbHdheXMgcG9zaXRpb24gdGhlIG92ZXJsYXkgYmFzZWQgb24gbGVmdC1pbmRleGVkIGNvb3JkaW5hdGVzLlxuICAgICAgZGlyZWN0aW9uOiAnbHRyJyxcbiAgICAgIGRpc3Bvc2VPbk5hdmlnYXRpb246IHRydWUsXG4gICAgICBwb3NpdGlvblN0cmF0ZWd5LFxuICAgICAgc2Nyb2xsU3RyYXRlZ3k6IHRoaXMub3ZlcmxheS5zY3JvbGxTdHJhdGVnaWVzLnJlcG9zaXRpb24oKSxcbiAgICAgIHdpZHRoOiAnMTZweCcsXG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIF9saXN0ZW5Gb3JSb3dIb3ZlckV2ZW50cygpOiB2b2lkIHtcbiAgICBjb25zdCBlbGVtZW50ID0gdGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQhO1xuICAgIGNvbnN0IHRha2VVbnRpbERlc3Ryb3llZCA9IHRha2VVbnRpbDxib29sZWFuPih0aGlzLmRlc3Ryb3llZCk7XG5cblxuICAgIHRoaXMuZXZlbnREaXNwYXRjaGVyLnJlc2l6ZU92ZXJsYXlWaXNpYmxlRm9ySGVhZGVyUm93KF9jbG9zZXN0KGVsZW1lbnQsIEhFQURFUl9ST1dfU0VMRUNUT1IpISlcbiAgICAgICAgLnBpcGUodGFrZVVudGlsRGVzdHJveWVkKS5zdWJzY3JpYmUoaG92ZXJpbmdSb3cgPT4ge1xuICAgICAgaWYgKGhvdmVyaW5nUm93KSB7XG4gICAgICAgIGlmICghdGhpcy5vdmVybGF5UmVmKSB7XG4gICAgICAgICAgdGhpcy5vdmVybGF5UmVmID0gdGhpcy5fY3JlYXRlT3ZlcmxheUZvckhhbmRsZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fc2hvd0hhbmRsZU92ZXJsYXkoKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5vdmVybGF5UmVmKSB7XG4gICAgICAgIC8vIHRvZG8gLSBjYW4ndCBkZXRhY2ggZHVyaW5nIGFuIGFjdGl2ZSByZXNpemUgLSBuZWVkIHRvIHdvcmsgdGhhdCBvdXRcbiAgICAgICAgdGhpcy5vdmVybGF5UmVmLmRldGFjaCgpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfbGlzdGVuRm9yUmVzaXplRXZlbnRzKCkge1xuICAgIGNvbnN0IHRha2VVbnRpbERlc3Ryb3llZCA9IHRha2VVbnRpbDxDb2x1bW5TaXplQWN0aW9uPih0aGlzLmRlc3Ryb3llZCk7XG5cbiAgICBtZXJnZShcbiAgICAgICAgdGhpcy5yZXNpemVOb3RpZmllci5yZXNpemVDYW5jZWxlZCxcbiAgICAgICAgdGhpcy5yZXNpemVOb3RpZmllci50cmlnZ2VyUmVzaXplLFxuICAgICkucGlwZShcbiAgICAgICAgdGFrZVVudGlsRGVzdHJveWVkLFxuICAgICAgICBmaWx0ZXIoY29sdW1uU2l6ZSA9PiBjb2x1bW5TaXplLmNvbHVtbklkID09PSB0aGlzLmNvbHVtbkRlZi5uYW1lKSxcbiAgICApLnN1YnNjcmliZSgoe3NpemUsIHByZXZpb3VzU2l6ZSwgY29tcGxldGVJbW1lZGlhdGVseX0pID0+IHtcbiAgICAgIHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50IS5jbGFzc0xpc3QuYWRkKE9WRVJMQVlfQUNUSVZFX0NMQVNTKTtcbiAgICAgIHRoaXMuX2FwcGx5U2l6ZShzaXplLCBwcmV2aW91c1NpemUpO1xuXG4gICAgICBpZiAoY29tcGxldGVJbW1lZGlhdGVseSkge1xuICAgICAgICB0aGlzLl9jb21wbGV0ZVJlc2l6ZU9wZXJhdGlvbigpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgbWVyZ2UoXG4gICAgICAgIHRoaXMucmVzaXplTm90aWZpZXIucmVzaXplQ2FuY2VsZWQsXG4gICAgICAgIHRoaXMucmVzaXplTm90aWZpZXIucmVzaXplQ29tcGxldGVkLFxuICAgICkucGlwZSh0YWtlVW50aWxEZXN0cm95ZWQpLnN1YnNjcmliZShjb2x1bW5TaXplID0+IHtcbiAgICAgIHRoaXMuX2NsZWFuVXBBZnRlclJlc2l6ZShjb2x1bW5TaXplKTtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX2NvbXBsZXRlUmVzaXplT3BlcmF0aW9uKCk6IHZvaWQge1xuICAgIHRoaXMubmdab25lLnJ1bigoKSA9PiB7XG4gICAgICB0aGlzLnJlc2l6ZU5vdGlmaWVyLnJlc2l6ZUNvbXBsZXRlZC5uZXh0KHtcbiAgICAgICAgY29sdW1uSWQ6IHRoaXMuY29sdW1uRGVmLm5hbWUsXG4gICAgICAgIHNpemU6IHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50IS5vZmZzZXRXaWR0aCxcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfY2xlYW5VcEFmdGVyUmVzaXplKGNvbHVtblNpemU6IENvbHVtblNpemVBY3Rpb24pOiB2b2lkIHtcbiAgICB0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCEuY2xhc3NMaXN0LnJlbW92ZShPVkVSTEFZX0FDVElWRV9DTEFTUyk7XG5cbiAgICBpZiAodGhpcy5vdmVybGF5UmVmICYmIHRoaXMub3ZlcmxheVJlZi5oYXNBdHRhY2hlZCgpKSB7XG4gICAgICB0aGlzLl91cGRhdGVPdmVybGF5SGFuZGxlSGVpZ2h0KCk7XG4gICAgICB0aGlzLm92ZXJsYXlSZWYudXBkYXRlUG9zaXRpb24oKTtcblxuICAgICAgaWYgKGNvbHVtblNpemUuY29sdW1uSWQgPT09IHRoaXMuY29sdW1uRGVmLm5hbWUpIHtcbiAgICAgICAgdGhpcy5pbmxpbmVIYW5kbGUhLmZvY3VzKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfY3JlYXRlSGFuZGxlUG9ydGFsKCk6IENvbXBvbmVudFBvcnRhbDxIYW5kbGVDb21wb25lbnQ+IHtcbiAgICBjb25zdCBpbmplY3RvciA9IG5ldyBQb3J0YWxJbmplY3Rvcih0aGlzLmluamVjdG9yLCBuZXcgV2Vha01hcChbW1xuICAgICAgUmVzaXplUmVmLFxuICAgICAgbmV3IFJlc2l6ZVJlZih0aGlzLmVsZW1lbnRSZWYsIHRoaXMub3ZlcmxheVJlZiEsIHRoaXMubWluV2lkdGhQeCwgdGhpcy5tYXhXaWR0aFB4KSxcbiAgICBdXSkpO1xuICAgIHJldHVybiBuZXcgQ29tcG9uZW50UG9ydGFsKHRoaXMuZ2V0T3ZlcmxheUhhbmRsZUNvbXBvbmVudFR5cGUoKSxcbiAgICAgICAgdGhpcy52aWV3Q29udGFpbmVyUmVmLCBpbmplY3Rvcik7XG4gIH1cblxuICBwcml2YXRlIF9zaG93SGFuZGxlT3ZlcmxheSgpOiB2b2lkIHtcbiAgICB0aGlzLl91cGRhdGVPdmVybGF5SGFuZGxlSGVpZ2h0KCk7XG4gICAgdGhpcy5vdmVybGF5UmVmIS5hdHRhY2godGhpcy5fY3JlYXRlSGFuZGxlUG9ydGFsKCkpO1xuXG4gICAgLy8gTmVlZGVkIHRvIGVuc3VyZSB0aGF0IGFsbCBvZiB0aGUgbGlmZWN5Y2xlIGhvb2tzIGluc2lkZSB0aGUgb3ZlcmxheSBydW4gaW1tZWRpYXRlbHkuXG4gICAgdGhpcy5jaGFuZ2VEZXRlY3RvclJlZi5tYXJrRm9yQ2hlY2soKTtcbiAgfVxuXG4gIHByaXZhdGUgX3VwZGF0ZU92ZXJsYXlIYW5kbGVIZWlnaHQoKSB7XG4gICAgdGhpcy5vdmVybGF5UmVmIS51cGRhdGVTaXplKHtoZWlnaHQ6IHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50IS5vZmZzZXRIZWlnaHR9KTtcbiAgfVxuXG4gIHByaXZhdGUgX2FwcGx5U2l6ZShzaXplSW5QaXhlbHM6IG51bWJlciwgcHJldmlvdXNTaXplPzogbnVtYmVyKTogdm9pZCB7XG4gICAgY29uc3Qgc2l6ZVRvQXBwbHkgPSBNYXRoLm1pbihNYXRoLm1heChzaXplSW5QaXhlbHMsIHRoaXMubWluV2lkdGhQeCwgMCksIHRoaXMubWF4V2lkdGhQeCk7XG5cbiAgICB0aGlzLnJlc2l6ZVN0cmF0ZWd5LmFwcGx5Q29sdW1uU2l6ZSh0aGlzLmNvbHVtbkRlZi5jc3NDbGFzc0ZyaWVuZGx5TmFtZSxcbiAgICAgICAgdGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQhLCBzaXplVG9BcHBseSwgcHJldmlvdXNTaXplKTtcbiAgfVxuXG4gIHByaXZhdGUgX2FwcGx5TWluV2lkdGhQeCgpOiB2b2lkIHtcbiAgICB0aGlzLnJlc2l6ZVN0cmF0ZWd5LmFwcGx5TWluQ29sdW1uU2l6ZSh0aGlzLmNvbHVtbkRlZi5jc3NDbGFzc0ZyaWVuZGx5TmFtZSxcbiAgICAgICAgdGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQsIHRoaXMubWluV2lkdGhQeCk7XG4gIH1cblxuICBwcml2YXRlIF9hcHBseU1heFdpZHRoUHgoKTogdm9pZCB7XG4gICAgdGhpcy5yZXNpemVTdHJhdGVneS5hcHBseU1heENvbHVtblNpemUodGhpcy5jb2x1bW5EZWYuY3NzQ2xhc3NGcmllbmRseU5hbWUsXG4gICAgICAgIHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LCB0aGlzLm1heFdpZHRoUHgpO1xuICB9XG5cbiAgcHJpdmF0ZSBfYXBwZW5kSW5saW5lSGFuZGxlKCk6IHZvaWQge1xuICAgIHRoaXMuaW5saW5lSGFuZGxlID0gdGhpcy5kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICB0aGlzLmlubGluZUhhbmRsZS50YWJJbmRleCA9IDA7XG4gICAgdGhpcy5pbmxpbmVIYW5kbGUuY2xhc3NOYW1lID0gdGhpcy5nZXRJbmxpbmVIYW5kbGVDc3NDbGFzc05hbWUoKTtcblxuICAgIC8vIFRPRE86IEFwcGx5IGNvcnJlY3QgYXJpYSByb2xlIChwcm9iYWJseSBzbGlkZXIpIGFmdGVyIGExMXkgc3BlYyBxdWVzdGlvbnMgcmVzb2x2ZWQuXG5cbiAgICB0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCEuYXBwZW5kQ2hpbGQodGhpcy5pbmxpbmVIYW5kbGUpO1xuICB9XG59XG4iXX0=