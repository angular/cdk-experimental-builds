/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, Injector, } from '@angular/core';
import { ComponentPortal } from '@angular/cdk/portal';
import { merge, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { _closest } from '@angular/cdk-experimental/popover-edit';
import { HEADER_ROW_SELECTOR } from './selectors';
import { ResizeRef } from './resize-ref';
import * as i0 from "@angular/core";
const OVERLAY_ACTIVE_CLASS = 'cdk-resizable-overlay-thumb-active';
/**
 * Base class for Resizable directives which are applied to column headers to make those columns
 * resizable.
 */
export class Resizable {
    constructor() {
        this.minWidthPxInternal = 0;
        this.maxWidthPxInternal = Number.MAX_SAFE_INTEGER;
        this.destroyed = new Subject();
        this._viewInitialized = false;
    }
    /** The minimum width to allow the column to be sized to. */
    get minWidthPx() {
        return this.minWidthPxInternal;
    }
    set minWidthPx(value) {
        this.minWidthPxInternal = value;
        this.columnResize.setResized();
        if (this.elementRef.nativeElement && this._viewInitialized) {
            this._applyMinWidthPx();
        }
    }
    /** The maximum width to allow the column to be sized to. */
    get maxWidthPx() {
        return this.maxWidthPxInternal;
    }
    set maxWidthPx(value) {
        this.maxWidthPxInternal = value;
        this.columnResize.setResized();
        if (this.elementRef.nativeElement && this._viewInitialized) {
            this._applyMaxWidthPx();
        }
    }
    ngAfterViewInit() {
        this._listenForRowHoverEvents();
        this._listenForResizeEvents();
        this._appendInlineHandle();
        this.styleScheduler.scheduleEnd(() => {
            this._viewInitialized = true;
            this._applyMinWidthPx();
            this._applyMaxWidthPx();
        });
    }
    ngOnDestroy() {
        this.destroyed.next();
        this.destroyed.complete();
        this.inlineHandle?.remove();
        this.overlayRef?.dispose();
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
        const injector = Injector.create({
            parent: this.injector,
            providers: [{
                    provide: ResizeRef,
                    useValue: new ResizeRef(this.elementRef, this.overlayRef, this.minWidthPx, this.maxWidthPx)
                }]
        });
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
        this.styleScheduler.schedule(() => {
            this.inlineHandle = this.document.createElement('div');
            this.inlineHandle.tabIndex = 0;
            this.inlineHandle.className = this.getInlineHandleCssClassName();
            // TODO: Apply correct aria role (probably slider) after a11y spec questions resolved.
            this.elementRef.nativeElement.appendChild(this.inlineHandle);
        });
    }
}
Resizable.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.0-next.15", ngImport: i0, type: Resizable, deps: [], target: i0.ɵɵFactoryTarget.Directive });
Resizable.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "13.0.0-next.15", type: Resizable, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.0-next.15", ngImport: i0, type: Resizable, decorators: [{
            type: Directive
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzaXphYmxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvY29sdW1uLXJlc2l6ZS9yZXNpemFibGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUVMLFNBQVMsRUFFVCxRQUFRLEdBTVQsTUFBTSxlQUFlLENBQUM7QUFFdkIsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBR3BELE9BQU8sRUFBQyxLQUFLLEVBQUUsT0FBTyxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQ3BDLE9BQU8sRUFBQyxNQUFNLEVBQUUsU0FBUyxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFFakQsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLHdDQUF3QyxDQUFDO0FBRWhFLE9BQU8sRUFBQyxtQkFBbUIsRUFBQyxNQUFNLGFBQWEsQ0FBQztBQUtoRCxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sY0FBYyxDQUFDOztBQUd2QyxNQUFNLG9CQUFvQixHQUFHLG9DQUFvQyxDQUFDO0FBRWxFOzs7R0FHRztBQUVILE1BQU0sT0FBZ0IsU0FBUztJQUQvQjtRQUdZLHVCQUFrQixHQUFXLENBQUMsQ0FBQztRQUMvQix1QkFBa0IsR0FBVyxNQUFNLENBQUMsZ0JBQWdCLENBQUM7UUFJNUMsY0FBUyxHQUFHLElBQUksT0FBTyxFQUFRLENBQUM7UUFpQjNDLHFCQUFnQixHQUFHLEtBQUssQ0FBQztLQXlNbEM7SUF2TUMsNERBQTREO0lBQzVELElBQUksVUFBVTtRQUNaLE9BQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDO0lBQ2pDLENBQUM7SUFDRCxJQUFJLFVBQVUsQ0FBQyxLQUFhO1FBQzFCLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxLQUFLLENBQUM7UUFFaEMsSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUMvQixJQUFJLElBQUks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LElBQUksQ0FBQyxTQUFTLENBQUMsb0JBQW9CLEVBQ3RFLElBQUksQ0FBQyxVQUFVLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUN0RCxDQUFDO0lBRU8sZ0JBQWdCO1FBQ3RCLElBQUksQ0FBQyxjQUFjLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxvQkFBb0IsRUFDdEUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ3RELENBQUM7SUFFTyxtQkFBbUI7UUFDekIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFO1lBQ2hDLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDdkQsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO1lBQy9CLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQywyQkFBMkIsRUFBRSxDQUFDO1lBRWpFLHNGQUFzRjtZQUV0RixJQUFJLENBQUMsVUFBVSxDQUFDLGFBQWMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ2hFLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQzs7OEdBaE9tQixTQUFTO2tHQUFULFNBQVM7bUdBQVQsU0FBUztrQkFEOUIsU0FBUyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1xuICBBZnRlclZpZXdJbml0LFxuICBEaXJlY3RpdmUsXG4gIEVsZW1lbnRSZWYsXG4gIEluamVjdG9yLFxuICBOZ1pvbmUsXG4gIE9uRGVzdHJveSxcbiAgVHlwZSxcbiAgVmlld0NvbnRhaW5lclJlZixcbiAgQ2hhbmdlRGV0ZWN0b3JSZWYsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtEaXJlY3Rpb25hbGl0eX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2JpZGknO1xuaW1wb3J0IHtDb21wb25lbnRQb3J0YWx9IGZyb20gJ0Bhbmd1bGFyL2Nkay9wb3J0YWwnO1xuaW1wb3J0IHtPdmVybGF5LCBPdmVybGF5UmVmfSBmcm9tICdAYW5ndWxhci9jZGsvb3ZlcmxheSc7XG5pbXBvcnQge0Nka0NvbHVtbkRlZiwgX0NvYWxlc2NlZFN0eWxlU2NoZWR1bGVyfSBmcm9tICdAYW5ndWxhci9jZGsvdGFibGUnO1xuaW1wb3J0IHttZXJnZSwgU3ViamVjdH0gZnJvbSAncnhqcyc7XG5pbXBvcnQge2ZpbHRlciwgdGFrZVVudGlsfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbmltcG9ydCB7X2Nsb3Nlc3R9IGZyb20gJ0Bhbmd1bGFyL2Nkay1leHBlcmltZW50YWwvcG9wb3Zlci1lZGl0JztcblxuaW1wb3J0IHtIRUFERVJfUk9XX1NFTEVDVE9SfSBmcm9tICcuL3NlbGVjdG9ycyc7XG5pbXBvcnQge1Jlc2l6ZU92ZXJsYXlIYW5kbGV9IGZyb20gJy4vb3ZlcmxheS1oYW5kbGUnO1xuaW1wb3J0IHtDb2x1bW5SZXNpemV9IGZyb20gJy4vY29sdW1uLXJlc2l6ZSc7XG5pbXBvcnQge0NvbHVtblNpemVBY3Rpb24sIENvbHVtblJlc2l6ZU5vdGlmaWVyU291cmNlfSBmcm9tICcuL2NvbHVtbi1yZXNpemUtbm90aWZpZXInO1xuaW1wb3J0IHtIZWFkZXJSb3dFdmVudERpc3BhdGNoZXJ9IGZyb20gJy4vZXZlbnQtZGlzcGF0Y2hlcic7XG5pbXBvcnQge1Jlc2l6ZVJlZn0gZnJvbSAnLi9yZXNpemUtcmVmJztcbmltcG9ydCB7UmVzaXplU3RyYXRlZ3l9IGZyb20gJy4vcmVzaXplLXN0cmF0ZWd5JztcblxuY29uc3QgT1ZFUkxBWV9BQ1RJVkVfQ0xBU1MgPSAnY2RrLXJlc2l6YWJsZS1vdmVybGF5LXRodW1iLWFjdGl2ZSc7XG5cbi8qKlxuICogQmFzZSBjbGFzcyBmb3IgUmVzaXphYmxlIGRpcmVjdGl2ZXMgd2hpY2ggYXJlIGFwcGxpZWQgdG8gY29sdW1uIGhlYWRlcnMgdG8gbWFrZSB0aG9zZSBjb2x1bW5zXG4gKiByZXNpemFibGUuXG4gKi9cbkBEaXJlY3RpdmUoKVxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFJlc2l6YWJsZTxIYW5kbGVDb21wb25lbnQgZXh0ZW5kcyBSZXNpemVPdmVybGF5SGFuZGxlPlxuICAgIGltcGxlbWVudHMgQWZ0ZXJWaWV3SW5pdCwgT25EZXN0cm95IHtcbiAgcHJvdGVjdGVkIG1pbldpZHRoUHhJbnRlcm5hbDogbnVtYmVyID0gMDtcbiAgcHJvdGVjdGVkIG1heFdpZHRoUHhJbnRlcm5hbDogbnVtYmVyID0gTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVI7XG5cbiAgcHJvdGVjdGVkIGlubGluZUhhbmRsZT86IEhUTUxFbGVtZW50O1xuICBwcm90ZWN0ZWQgb3ZlcmxheVJlZj86IE92ZXJsYXlSZWY7XG4gIHByb3RlY3RlZCByZWFkb25seSBkZXN0cm95ZWQgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xuXG4gIHByb3RlY3RlZCBhYnN0cmFjdCByZWFkb25seSBjb2x1bW5EZWY6IENka0NvbHVtbkRlZjtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IHJlYWRvbmx5IGNvbHVtblJlc2l6ZTogQ29sdW1uUmVzaXplO1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgcmVhZG9ubHkgZGlyZWN0aW9uYWxpdHk6IERpcmVjdGlvbmFsaXR5O1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgcmVhZG9ubHkgZG9jdW1lbnQ6IERvY3VtZW50O1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgcmVhZG9ubHkgZWxlbWVudFJlZjogRWxlbWVudFJlZjtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IHJlYWRvbmx5IGV2ZW50RGlzcGF0Y2hlcjogSGVhZGVyUm93RXZlbnREaXNwYXRjaGVyO1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgcmVhZG9ubHkgaW5qZWN0b3I6IEluamVjdG9yO1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgcmVhZG9ubHkgbmdab25lOiBOZ1pvbmU7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCByZWFkb25seSBvdmVybGF5OiBPdmVybGF5O1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgcmVhZG9ubHkgcmVzaXplTm90aWZpZXI6IENvbHVtblJlc2l6ZU5vdGlmaWVyU291cmNlO1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgcmVhZG9ubHkgcmVzaXplU3RyYXRlZ3k6IFJlc2l6ZVN0cmF0ZWd5O1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgcmVhZG9ubHkgc3R5bGVTY2hlZHVsZXI6IF9Db2FsZXNjZWRTdHlsZVNjaGVkdWxlcjtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IHJlYWRvbmx5IHZpZXdDb250YWluZXJSZWY6IFZpZXdDb250YWluZXJSZWY7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCByZWFkb25seSBjaGFuZ2VEZXRlY3RvclJlZjogQ2hhbmdlRGV0ZWN0b3JSZWY7XG5cbiAgcHJpdmF0ZSBfdmlld0luaXRpYWxpemVkID0gZmFsc2U7XG5cbiAgLyoqIFRoZSBtaW5pbXVtIHdpZHRoIHRvIGFsbG93IHRoZSBjb2x1bW4gdG8gYmUgc2l6ZWQgdG8uICovXG4gIGdldCBtaW5XaWR0aFB4KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMubWluV2lkdGhQeEludGVybmFsO1xuICB9XG4gIHNldCBtaW5XaWR0aFB4KHZhbHVlOiBudW1iZXIpIHtcbiAgICB0aGlzLm1pbldpZHRoUHhJbnRlcm5hbCA9IHZhbHVlO1xuXG4gICAgdGhpcy5jb2x1bW5SZXNpemUuc2V0UmVzaXplZCgpO1xuICAgIGlmICh0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCAmJiB0aGlzLl92aWV3SW5pdGlhbGl6ZWQpIHtcbiAgICAgIHRoaXMuX2FwcGx5TWluV2lkdGhQeCgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBUaGUgbWF4aW11bSB3aWR0aCB0byBhbGxvdyB0aGUgY29sdW1uIHRvIGJlIHNpemVkIHRvLiAqL1xuICBnZXQgbWF4V2lkdGhQeCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLm1heFdpZHRoUHhJbnRlcm5hbDtcbiAgfVxuICBzZXQgbWF4V2lkdGhQeCh2YWx1ZTogbnVtYmVyKSB7XG4gICAgdGhpcy5tYXhXaWR0aFB4SW50ZXJuYWwgPSB2YWx1ZTtcblxuICAgIHRoaXMuY29sdW1uUmVzaXplLnNldFJlc2l6ZWQoKTtcbiAgICBpZiAodGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQgJiYgdGhpcy5fdmlld0luaXRpYWxpemVkKSB7XG4gICAgICB0aGlzLl9hcHBseU1heFdpZHRoUHgoKTtcbiAgICB9XG4gIH1cblxuICBuZ0FmdGVyVmlld0luaXQoKSB7XG4gICAgdGhpcy5fbGlzdGVuRm9yUm93SG92ZXJFdmVudHMoKTtcbiAgICB0aGlzLl9saXN0ZW5Gb3JSZXNpemVFdmVudHMoKTtcbiAgICB0aGlzLl9hcHBlbmRJbmxpbmVIYW5kbGUoKTtcblxuICAgIHRoaXMuc3R5bGVTY2hlZHVsZXIuc2NoZWR1bGVFbmQoKCkgPT4ge1xuICAgICAgdGhpcy5fdmlld0luaXRpYWxpemVkID0gdHJ1ZTtcbiAgICAgIHRoaXMuX2FwcGx5TWluV2lkdGhQeCgpO1xuICAgICAgdGhpcy5fYXBwbHlNYXhXaWR0aFB4KCk7XG4gICAgfSk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLmRlc3Ryb3llZC5uZXh0KCk7XG4gICAgdGhpcy5kZXN0cm95ZWQuY29tcGxldGUoKTtcbiAgICB0aGlzLmlubGluZUhhbmRsZT8ucmVtb3ZlKCk7XG4gICAgdGhpcy5vdmVybGF5UmVmPy5kaXNwb3NlKCk7XG4gIH1cblxuICBwcm90ZWN0ZWQgYWJzdHJhY3QgZ2V0SW5saW5lSGFuZGxlQ3NzQ2xhc3NOYW1lKCk6IHN0cmluZztcblxuICBwcm90ZWN0ZWQgYWJzdHJhY3QgZ2V0T3ZlcmxheUhhbmRsZUNvbXBvbmVudFR5cGUoKTogVHlwZTxIYW5kbGVDb21wb25lbnQ+O1xuXG4gIHByaXZhdGUgX2NyZWF0ZU92ZXJsYXlGb3JIYW5kbGUoKTogT3ZlcmxheVJlZiB7XG4gICAgLy8gVXNlIG9mIG92ZXJsYXlzIGFsbG93cyB1cyB0byBwcm9wZXJseSBjYXB0dXJlIGNsaWNrIGV2ZW50cyBzcGFubmluZyBwYXJ0c1xuICAgIC8vIG9mIHR3byB0YWJsZSBjZWxscyBhbmQgaXMgYWxzbyB1c2VmdWwgZm9yIGRpc3BsYXlpbmcgYSByZXNpemUgdGh1bWJcbiAgICAvLyBvdmVyIGJvdGggY2VsbHMgYW5kIGV4dGVuZGluZyBpdCBkb3duIHRoZSB0YWJsZSBhcyBuZWVkZWQuXG5cbiAgICBjb25zdCBpc1J0bCA9IHRoaXMuZGlyZWN0aW9uYWxpdHkudmFsdWUgPT09ICdydGwnO1xuICAgIGNvbnN0IHBvc2l0aW9uU3RyYXRlZ3kgPSB0aGlzLm92ZXJsYXkucG9zaXRpb24oKVxuICAgICAgICAuZmxleGlibGVDb25uZWN0ZWRUbyh0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCEpXG4gICAgICAgIC53aXRoRmxleGlibGVEaW1lbnNpb25zKGZhbHNlKVxuICAgICAgICAud2l0aEdyb3dBZnRlck9wZW4oZmFsc2UpXG4gICAgICAgIC53aXRoUHVzaChmYWxzZSlcbiAgICAgICAgLndpdGhEZWZhdWx0T2Zmc2V0WChpc1J0bCA/IDEgOiAwKVxuICAgICAgICAud2l0aFBvc2l0aW9ucyhbe1xuICAgICAgICAgIG9yaWdpblg6IGlzUnRsID8gJ3N0YXJ0JyA6ICdlbmQnLFxuICAgICAgICAgIG9yaWdpblk6ICd0b3AnLFxuICAgICAgICAgIG92ZXJsYXlYOiAnY2VudGVyJyxcbiAgICAgICAgICBvdmVybGF5WTogJ3RvcCcsXG4gICAgICAgIH1dKTtcblxuICAgIHJldHVybiB0aGlzLm92ZXJsYXkuY3JlYXRlKHtcbiAgICAgIC8vIEFsd2F5cyBwb3NpdGlvbiB0aGUgb3ZlcmxheSBiYXNlZCBvbiBsZWZ0LWluZGV4ZWQgY29vcmRpbmF0ZXMuXG4gICAgICBkaXJlY3Rpb246ICdsdHInLFxuICAgICAgZGlzcG9zZU9uTmF2aWdhdGlvbjogdHJ1ZSxcbiAgICAgIHBvc2l0aW9uU3RyYXRlZ3ksXG4gICAgICBzY3JvbGxTdHJhdGVneTogdGhpcy5vdmVybGF5LnNjcm9sbFN0cmF0ZWdpZXMucmVwb3NpdGlvbigpLFxuICAgICAgd2lkdGg6ICcxNnB4JyxcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX2xpc3RlbkZvclJvd0hvdmVyRXZlbnRzKCk6IHZvaWQge1xuICAgIGNvbnN0IGVsZW1lbnQgPSB0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCE7XG4gICAgY29uc3QgdGFrZVVudGlsRGVzdHJveWVkID0gdGFrZVVudGlsPGJvb2xlYW4+KHRoaXMuZGVzdHJveWVkKTtcblxuXG4gICAgdGhpcy5ldmVudERpc3BhdGNoZXIucmVzaXplT3ZlcmxheVZpc2libGVGb3JIZWFkZXJSb3coX2Nsb3Nlc3QoZWxlbWVudCwgSEVBREVSX1JPV19TRUxFQ1RPUikhKVxuICAgICAgICAucGlwZSh0YWtlVW50aWxEZXN0cm95ZWQpLnN1YnNjcmliZShob3ZlcmluZ1JvdyA9PiB7XG4gICAgICBpZiAoaG92ZXJpbmdSb3cpIHtcbiAgICAgICAgaWYgKCF0aGlzLm92ZXJsYXlSZWYpIHtcbiAgICAgICAgICB0aGlzLm92ZXJsYXlSZWYgPSB0aGlzLl9jcmVhdGVPdmVybGF5Rm9ySGFuZGxlKCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9zaG93SGFuZGxlT3ZlcmxheSgpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLm92ZXJsYXlSZWYpIHtcbiAgICAgICAgLy8gdG9kbyAtIGNhbid0IGRldGFjaCBkdXJpbmcgYW4gYWN0aXZlIHJlc2l6ZSAtIG5lZWQgdG8gd29yayB0aGF0IG91dFxuICAgICAgICB0aGlzLm92ZXJsYXlSZWYuZGV0YWNoKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIF9saXN0ZW5Gb3JSZXNpemVFdmVudHMoKSB7XG4gICAgY29uc3QgdGFrZVVudGlsRGVzdHJveWVkID0gdGFrZVVudGlsPENvbHVtblNpemVBY3Rpb24+KHRoaXMuZGVzdHJveWVkKTtcblxuICAgIG1lcmdlKFxuICAgICAgICB0aGlzLnJlc2l6ZU5vdGlmaWVyLnJlc2l6ZUNhbmNlbGVkLFxuICAgICAgICB0aGlzLnJlc2l6ZU5vdGlmaWVyLnRyaWdnZXJSZXNpemUsXG4gICAgKS5waXBlKFxuICAgICAgICB0YWtlVW50aWxEZXN0cm95ZWQsXG4gICAgICAgIGZpbHRlcihjb2x1bW5TaXplID0+IGNvbHVtblNpemUuY29sdW1uSWQgPT09IHRoaXMuY29sdW1uRGVmLm5hbWUpLFxuICAgICkuc3Vic2NyaWJlKCh7c2l6ZSwgcHJldmlvdXNTaXplLCBjb21wbGV0ZUltbWVkaWF0ZWx5fSkgPT4ge1xuICAgICAgdGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQhLmNsYXNzTGlzdC5hZGQoT1ZFUkxBWV9BQ1RJVkVfQ0xBU1MpO1xuICAgICAgdGhpcy5fYXBwbHlTaXplKHNpemUsIHByZXZpb3VzU2l6ZSk7XG5cbiAgICAgIGlmIChjb21wbGV0ZUltbWVkaWF0ZWx5KSB7XG4gICAgICAgIHRoaXMuX2NvbXBsZXRlUmVzaXplT3BlcmF0aW9uKCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBtZXJnZShcbiAgICAgICAgdGhpcy5yZXNpemVOb3RpZmllci5yZXNpemVDYW5jZWxlZCxcbiAgICAgICAgdGhpcy5yZXNpemVOb3RpZmllci5yZXNpemVDb21wbGV0ZWQsXG4gICAgKS5waXBlKHRha2VVbnRpbERlc3Ryb3llZCkuc3Vic2NyaWJlKGNvbHVtblNpemUgPT4ge1xuICAgICAgdGhpcy5fY2xlYW5VcEFmdGVyUmVzaXplKGNvbHVtblNpemUpO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfY29tcGxldGVSZXNpemVPcGVyYXRpb24oKTogdm9pZCB7XG4gICAgdGhpcy5uZ1pvbmUucnVuKCgpID0+IHtcbiAgICAgIHRoaXMucmVzaXplTm90aWZpZXIucmVzaXplQ29tcGxldGVkLm5leHQoe1xuICAgICAgICBjb2x1bW5JZDogdGhpcy5jb2x1bW5EZWYubmFtZSxcbiAgICAgICAgc2l6ZTogdGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQhLm9mZnNldFdpZHRoLFxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIF9jbGVhblVwQWZ0ZXJSZXNpemUoY29sdW1uU2l6ZTogQ29sdW1uU2l6ZUFjdGlvbik6IHZvaWQge1xuICAgIHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50IS5jbGFzc0xpc3QucmVtb3ZlKE9WRVJMQVlfQUNUSVZFX0NMQVNTKTtcblxuICAgIGlmICh0aGlzLm92ZXJsYXlSZWYgJiYgdGhpcy5vdmVybGF5UmVmLmhhc0F0dGFjaGVkKCkpIHtcbiAgICAgIHRoaXMuX3VwZGF0ZU92ZXJsYXlIYW5kbGVIZWlnaHQoKTtcbiAgICAgIHRoaXMub3ZlcmxheVJlZi51cGRhdGVQb3NpdGlvbigpO1xuXG4gICAgICBpZiAoY29sdW1uU2l6ZS5jb2x1bW5JZCA9PT0gdGhpcy5jb2x1bW5EZWYubmFtZSkge1xuICAgICAgICB0aGlzLmlubGluZUhhbmRsZSEuZm9jdXMoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9jcmVhdGVIYW5kbGVQb3J0YWwoKTogQ29tcG9uZW50UG9ydGFsPEhhbmRsZUNvbXBvbmVudD4ge1xuICAgIGNvbnN0IGluamVjdG9yID0gSW5qZWN0b3IuY3JlYXRlKHtcbiAgICAgIHBhcmVudDogdGhpcy5pbmplY3RvcixcbiAgICAgIHByb3ZpZGVyczogW3tcbiAgICAgICAgcHJvdmlkZTogUmVzaXplUmVmLFxuICAgICAgICB1c2VWYWx1ZTogbmV3IFJlc2l6ZVJlZih0aGlzLmVsZW1lbnRSZWYsIHRoaXMub3ZlcmxheVJlZiEsIHRoaXMubWluV2lkdGhQeCwgdGhpcy5tYXhXaWR0aFB4KVxuICAgICAgfV1cbiAgICB9KTtcblxuICAgIHJldHVybiBuZXcgQ29tcG9uZW50UG9ydGFsKHRoaXMuZ2V0T3ZlcmxheUhhbmRsZUNvbXBvbmVudFR5cGUoKSxcbiAgICAgICAgdGhpcy52aWV3Q29udGFpbmVyUmVmLCBpbmplY3Rvcik7XG4gIH1cblxuICBwcml2YXRlIF9zaG93SGFuZGxlT3ZlcmxheSgpOiB2b2lkIHtcbiAgICB0aGlzLl91cGRhdGVPdmVybGF5SGFuZGxlSGVpZ2h0KCk7XG4gICAgdGhpcy5vdmVybGF5UmVmIS5hdHRhY2godGhpcy5fY3JlYXRlSGFuZGxlUG9ydGFsKCkpO1xuXG4gICAgLy8gTmVlZGVkIHRvIGVuc3VyZSB0aGF0IGFsbCBvZiB0aGUgbGlmZWN5Y2xlIGhvb2tzIGluc2lkZSB0aGUgb3ZlcmxheSBydW4gaW1tZWRpYXRlbHkuXG4gICAgdGhpcy5jaGFuZ2VEZXRlY3RvclJlZi5tYXJrRm9yQ2hlY2soKTtcbiAgfVxuXG4gIHByaXZhdGUgX3VwZGF0ZU92ZXJsYXlIYW5kbGVIZWlnaHQoKSB7XG4gICAgdGhpcy5vdmVybGF5UmVmIS51cGRhdGVTaXplKHtoZWlnaHQ6IHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50IS5vZmZzZXRIZWlnaHR9KTtcbiAgfVxuXG4gIHByaXZhdGUgX2FwcGx5U2l6ZShzaXplSW5QaXhlbHM6IG51bWJlciwgcHJldmlvdXNTaXplPzogbnVtYmVyKTogdm9pZCB7XG4gICAgY29uc3Qgc2l6ZVRvQXBwbHkgPSBNYXRoLm1pbihNYXRoLm1heChzaXplSW5QaXhlbHMsIHRoaXMubWluV2lkdGhQeCwgMCksIHRoaXMubWF4V2lkdGhQeCk7XG5cbiAgICB0aGlzLnJlc2l6ZVN0cmF0ZWd5LmFwcGx5Q29sdW1uU2l6ZSh0aGlzLmNvbHVtbkRlZi5jc3NDbGFzc0ZyaWVuZGx5TmFtZSxcbiAgICAgICAgdGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQhLCBzaXplVG9BcHBseSwgcHJldmlvdXNTaXplKTtcbiAgfVxuXG4gIHByaXZhdGUgX2FwcGx5TWluV2lkdGhQeCgpOiB2b2lkIHtcbiAgICB0aGlzLnJlc2l6ZVN0cmF0ZWd5LmFwcGx5TWluQ29sdW1uU2l6ZSh0aGlzLmNvbHVtbkRlZi5jc3NDbGFzc0ZyaWVuZGx5TmFtZSxcbiAgICAgICAgdGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQsIHRoaXMubWluV2lkdGhQeCk7XG4gIH1cblxuICBwcml2YXRlIF9hcHBseU1heFdpZHRoUHgoKTogdm9pZCB7XG4gICAgdGhpcy5yZXNpemVTdHJhdGVneS5hcHBseU1heENvbHVtblNpemUodGhpcy5jb2x1bW5EZWYuY3NzQ2xhc3NGcmllbmRseU5hbWUsXG4gICAgICAgIHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LCB0aGlzLm1heFdpZHRoUHgpO1xuICB9XG5cbiAgcHJpdmF0ZSBfYXBwZW5kSW5saW5lSGFuZGxlKCk6IHZvaWQge1xuICAgIHRoaXMuc3R5bGVTY2hlZHVsZXIuc2NoZWR1bGUoKCkgPT4ge1xuICAgICAgdGhpcy5pbmxpbmVIYW5kbGUgPSB0aGlzLmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgdGhpcy5pbmxpbmVIYW5kbGUudGFiSW5kZXggPSAwO1xuICAgICAgdGhpcy5pbmxpbmVIYW5kbGUuY2xhc3NOYW1lID0gdGhpcy5nZXRJbmxpbmVIYW5kbGVDc3NDbGFzc05hbWUoKTtcblxuICAgICAgLy8gVE9ETzogQXBwbHkgY29ycmVjdCBhcmlhIHJvbGUgKHByb2JhYmx5IHNsaWRlcikgYWZ0ZXIgYTExeSBzcGVjIHF1ZXN0aW9ucyByZXNvbHZlZC5cblxuICAgICAgdGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQhLmFwcGVuZENoaWxkKHRoaXMuaW5saW5lSGFuZGxlKTtcbiAgICB9KTtcbiAgfVxufVxuIl19