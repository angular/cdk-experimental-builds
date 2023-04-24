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
class Resizable {
    constructor() {
        this.minWidthPxInternal = 0;
        this.maxWidthPxInternal = Number.MAX_SAFE_INTEGER;
        this.destroyed = new Subject();
        this._viewInitialized = false;
        this._isDestroyed = false;
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
            if (this._isDestroyed)
                return;
            this._viewInitialized = true;
            this._applyMinWidthPx();
            this._applyMaxWidthPx();
        });
    }
    ngOnDestroy() {
        this._isDestroyed = true;
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
        const positionStrategy = this.overlay
            .position()
            .flexibleConnectedTo(this.elementRef.nativeElement)
            .withFlexibleDimensions(false)
            .withGrowAfterOpen(false)
            .withPush(false)
            .withDefaultOffsetX(isRtl ? 1 : 0)
            .withPositions([
            {
                originX: isRtl ? 'start' : 'end',
                originY: 'top',
                overlayX: 'center',
                overlayY: 'top',
            },
        ]);
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
        this.eventDispatcher
            .resizeOverlayVisibleForHeaderRow(_closest(element, HEADER_ROW_SELECTOR))
            .pipe(takeUntilDestroyed)
            .subscribe(hoveringRow => {
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
        merge(this.resizeNotifier.resizeCanceled, this.resizeNotifier.triggerResize)
            .pipe(takeUntilDestroyed, filter(columnSize => columnSize.columnId === this.columnDef.name))
            .subscribe(({ size, previousSize, completeImmediately }) => {
            this.elementRef.nativeElement.classList.add(OVERLAY_ACTIVE_CLASS);
            this._applySize(size, previousSize);
            if (completeImmediately) {
                this._completeResizeOperation();
            }
        });
        merge(this.resizeNotifier.resizeCanceled, this.resizeNotifier.resizeCompleted)
            .pipe(takeUntilDestroyed)
            .subscribe(columnSize => {
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
            providers: [
                {
                    provide: ResizeRef,
                    useValue: new ResizeRef(this.elementRef, this.overlayRef, this.minWidthPx, this.maxWidthPx),
                },
            ],
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.0.0-rc.2", ngImport: i0, type: Resizable, deps: [], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "16.0.0-rc.2", type: Resizable, ngImport: i0 }); }
}
export { Resizable };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.0.0-rc.2", ngImport: i0, type: Resizable, decorators: [{
            type: Directive
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzaXphYmxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvY29sdW1uLXJlc2l6ZS9yZXNpemFibGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUVMLFNBQVMsRUFFVCxRQUFRLEdBTVQsTUFBTSxlQUFlLENBQUM7QUFFdkIsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBR3BELE9BQU8sRUFBQyxLQUFLLEVBQUUsT0FBTyxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQ3BDLE9BQU8sRUFBQyxNQUFNLEVBQUUsU0FBUyxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFFakQsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLHdDQUF3QyxDQUFDO0FBRWhFLE9BQU8sRUFBQyxtQkFBbUIsRUFBQyxNQUFNLGFBQWEsQ0FBQztBQUtoRCxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sY0FBYyxDQUFDOztBQUd2QyxNQUFNLG9CQUFvQixHQUFHLG9DQUFvQyxDQUFDO0FBRWxFOzs7R0FHRztBQUNILE1BQ3NCLFNBQVM7SUFEL0I7UUFJWSx1QkFBa0IsR0FBVyxDQUFDLENBQUM7UUFDL0IsdUJBQWtCLEdBQVcsTUFBTSxDQUFDLGdCQUFnQixDQUFDO1FBSTVDLGNBQVMsR0FBRyxJQUFJLE9BQU8sRUFBUSxDQUFDO1FBaUIzQyxxQkFBZ0IsR0FBRyxLQUFLLENBQUM7UUFDekIsaUJBQVksR0FBRyxLQUFLLENBQUM7S0FpTzlCO0lBL05DLDREQUE0RDtJQUM1RCxJQUFJLFVBQVU7UUFDWixPQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQztJQUNqQyxDQUFDO0lBQ0QsSUFBSSxVQUFVLENBQUMsS0FBYTtRQUMxQixJQUFJLENBQUMsa0JBQWtCLEdBQUcsS0FBSyxDQUFDO1FBRWhDLElBQUksQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFF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LENBQUMsYUFBYyxFQUM5QixXQUFXLEVBQ1gsWUFBWSxDQUNiLENBQUM7SUFDSixDQUFDO0lBRU8sZ0JBQWdCO1FBQ3RCLElBQUksQ0FBQyxjQUFjLENBQUMsa0JBQWtCLENBQ3BDLElBQUksQ0FBQyxTQUFTLENBQUMsb0JBQW9CLEVBQ25DLElBQUksQ0FBQyxVQUFVLENBQUMsYUFBYSxFQUM3QixJQUFJLENBQUMsVUFBVSxDQUNoQixDQUFDO0lBQ0osQ0FBQztJQUVPLGdCQUFnQjtRQUN0QixJQUFJLENBQUMsY0FBYyxDQUFDLGtCQUFrQixDQUNwQyxJQUFJLENBQUMsU0FBUyxDQUFDLG9CQUFvQixFQUNuQyxJQUFJLENBQUMsVUFBVSxDQUFDLGFBQWEsRUFDN0IsSUFBSSxDQUFDLFVBQVUsQ0FDaEIsQ0FBQztJQUNKLENBQUM7SUFFTyxtQkFBbUI7UUFDekIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFO1lBQ2hDLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDdkQsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO1lBQy9CLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQywyQkFBMkIsRUFBRSxDQUFDO1lBRWpFLHNGQUFzRjtZQUV0RixJQUFJLENBQUMsVUFBVSxDQUFDLGFBQWMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ2hFLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQzttSEExUG1CLFNBQVM7dUdBQVQsU0FBUzs7U0FBVCxTQUFTO2dHQUFULFNBQVM7a0JBRDlCLFNBQVMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtcbiAgQWZ0ZXJWaWV3SW5pdCxcbiAgRGlyZWN0aXZlLFxuICBFbGVtZW50UmVmLFxuICBJbmplY3RvcixcbiAgTmdab25lLFxuICBPbkRlc3Ryb3ksXG4gIFR5cGUsXG4gIFZpZXdDb250YWluZXJSZWYsXG4gIENoYW5nZURldGVjdG9yUmVmLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7RGlyZWN0aW9uYWxpdHl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9iaWRpJztcbmltcG9ydCB7Q29tcG9uZW50UG9ydGFsfSBmcm9tICdAYW5ndWxhci9jZGsvcG9ydGFsJztcbmltcG9ydCB7T3ZlcmxheSwgT3ZlcmxheVJlZn0gZnJvbSAnQGFuZ3VsYXIvY2RrL292ZXJsYXknO1xuaW1wb3J0IHtDZGtDb2x1bW5EZWYsIF9Db2FsZXNjZWRTdHlsZVNjaGVkdWxlcn0gZnJvbSAnQGFuZ3VsYXIvY2RrL3RhYmxlJztcbmltcG9ydCB7bWVyZ2UsIFN1YmplY3R9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHtmaWx0ZXIsIHRha2VVbnRpbH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuXG5pbXBvcnQge19jbG9zZXN0fSBmcm9tICdAYW5ndWxhci9jZGstZXhwZXJpbWVudGFsL3BvcG92ZXItZWRpdCc7XG5cbmltcG9ydCB7SEVBREVSX1JPV19TRUxFQ1RPUn0gZnJvbSAnLi9zZWxlY3RvcnMnO1xuaW1wb3J0IHtSZXNpemVPdmVybGF5SGFuZGxlfSBmcm9tICcuL292ZXJsYXktaGFuZGxlJztcbmltcG9ydCB7Q29sdW1uUmVzaXplfSBmcm9tICcuL2NvbHVtbi1yZXNpemUnO1xuaW1wb3J0IHtDb2x1bW5TaXplQWN0aW9uLCBDb2x1bW5SZXNpemVOb3RpZmllclNvdXJjZX0gZnJvbSAnLi9jb2x1bW4tcmVzaXplLW5vdGlmaWVyJztcbmltcG9ydCB7SGVhZGVyUm93RXZlbnREaXNwYXRjaGVyfSBmcm9tICcuL2V2ZW50LWRpc3BhdGNoZXInO1xuaW1wb3J0IHtSZXNpemVSZWZ9IGZyb20gJy4vcmVzaXplLXJlZic7XG5pbXBvcnQge1Jlc2l6ZVN0cmF0ZWd5fSBmcm9tICcuL3Jlc2l6ZS1zdHJhdGVneSc7XG5cbmNvbnN0IE9WRVJMQVlfQUNUSVZFX0NMQVNTID0gJ2Nkay1yZXNpemFibGUtb3ZlcmxheS10aHVtYi1hY3RpdmUnO1xuXG4vKipcbiAqIEJhc2UgY2xhc3MgZm9yIFJlc2l6YWJsZSBkaXJlY3RpdmVzIHdoaWNoIGFyZSBhcHBsaWVkIHRvIGNvbHVtbiBoZWFkZXJzIHRvIG1ha2UgdGhvc2UgY29sdW1uc1xuICogcmVzaXphYmxlLlxuICovXG5ARGlyZWN0aXZlKClcbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBSZXNpemFibGU8SGFuZGxlQ29tcG9uZW50IGV4dGVuZHMgUmVzaXplT3ZlcmxheUhhbmRsZT5cbiAgaW1wbGVtZW50cyBBZnRlclZpZXdJbml0LCBPbkRlc3Ryb3lcbntcbiAgcHJvdGVjdGVkIG1pbldpZHRoUHhJbnRlcm5hbDogbnVtYmVyID0gMDtcbiAgcHJvdGVjdGVkIG1heFdpZHRoUHhJbnRlcm5hbDogbnVtYmVyID0gTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVI7XG5cbiAgcHJvdGVjdGVkIGlubGluZUhhbmRsZT86IEhUTUxFbGVtZW50O1xuICBwcm90ZWN0ZWQgb3ZlcmxheVJlZj86IE92ZXJsYXlSZWY7XG4gIHByb3RlY3RlZCByZWFkb25seSBkZXN0cm95ZWQgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xuXG4gIHByb3RlY3RlZCBhYnN0cmFjdCByZWFkb25seSBjb2x1bW5EZWY6IENka0NvbHVtbkRlZjtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IHJlYWRvbmx5IGNvbHVtblJlc2l6ZTogQ29sdW1uUmVzaXplO1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgcmVhZG9ubHkgZGlyZWN0aW9uYWxpdHk6IERpcmVjdGlvbmFsaXR5O1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgcmVhZG9ubHkgZG9jdW1lbnQ6IERvY3VtZW50O1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgcmVhZG9ubHkgZWxlbWVudFJlZjogRWxlbWVudFJlZjtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IHJlYWRvbmx5IGV2ZW50RGlzcGF0Y2hlcjogSGVhZGVyUm93RXZlbnREaXNwYXRjaGVyO1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgcmVhZG9ubHkgaW5qZWN0b3I6IEluamVjdG9yO1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgcmVhZG9ubHkgbmdab25lOiBOZ1pvbmU7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCByZWFkb25seSBvdmVybGF5OiBPdmVybGF5O1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgcmVhZG9ubHkgcmVzaXplTm90aWZpZXI6IENvbHVtblJlc2l6ZU5vdGlmaWVyU291cmNlO1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgcmVhZG9ubHkgcmVzaXplU3RyYXRlZ3k6IFJlc2l6ZVN0cmF0ZWd5O1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgcmVhZG9ubHkgc3R5bGVTY2hlZHVsZXI6IF9Db2FsZXNjZWRTdHlsZVNjaGVkdWxlcjtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IHJlYWRvbmx5IHZpZXdDb250YWluZXJSZWY6IFZpZXdDb250YWluZXJSZWY7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCByZWFkb25seSBjaGFuZ2VEZXRlY3RvclJlZjogQ2hhbmdlRGV0ZWN0b3JSZWY7XG5cbiAgcHJpdmF0ZSBfdmlld0luaXRpYWxpemVkID0gZmFsc2U7XG4gIHByaXZhdGUgX2lzRGVzdHJveWVkID0gZmFsc2U7XG5cbiAgLyoqIFRoZSBtaW5pbXVtIHdpZHRoIHRvIGFsbG93IHRoZSBjb2x1bW4gdG8gYmUgc2l6ZWQgdG8uICovXG4gIGdldCBtaW5XaWR0aFB4KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMubWluV2lkdGhQeEludGVybmFsO1xuICB9XG4gIHNldCBtaW5XaWR0aFB4KHZhbHVlOiBudW1iZXIpIHtcbiAgICB0aGlzLm1pbldpZHRoUHhJbnRlcm5hbCA9IHZhbHVlO1xuXG4gICAgdGhpcy5jb2x1bW5SZXNpemUuc2V0UmVzaXplZCgpO1xuICAgIGlmICh0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCAmJiB0aGlzLl92aWV3SW5pdGlhbGl6ZWQpIHtcbiAgICAgIHRoaXMuX2FwcGx5TWluV2lkdGhQeCgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBUaGUgbWF4aW11bSB3aWR0aCB0byBhbGxvdyB0aGUgY29sdW1uIHRvIGJlIHNpemVkIHRvLiAqL1xuICBnZXQgbWF4V2lkdGhQeCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLm1heFdpZHRoUHhJbnRlcm5hbDtcbiAgfVxuICBzZXQgbWF4V2lkdGhQeCh2YWx1ZTogbnVtYmVyKSB7XG4gICAgdGhpcy5tYXhXaWR0aFB4SW50ZXJuYWwgPSB2YWx1ZTtcblxuICAgIHRoaXMuY29sdW1uUmVzaXplLnNldFJlc2l6ZWQoKTtcbiAgICBpZiAodGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQgJiYgdGhpcy5fdmlld0luaXRpYWxpemVkKSB7XG4gICAgICB0aGlzLl9hcHBseU1heFdpZHRoUHgoKTtcbiAgICB9XG4gIH1cblxuICBuZ0FmdGVyVmlld0luaXQoKSB7XG4gICAgdGhpcy5fbGlzdGVuRm9yUm93SG92ZXJFdmVudHMoKTtcbiAgICB0aGlzLl9saXN0ZW5Gb3JSZXNpemVFdmVudHMoKTtcbiAgICB0aGlzLl9hcHBlbmRJbmxpbmVIYW5kbGUoKTtcblxuICAgIHRoaXMuc3R5bGVTY2hlZHVsZXIuc2NoZWR1bGVFbmQoKCkgPT4ge1xuICAgICAgaWYgKHRoaXMuX2lzRGVzdHJveWVkKSByZXR1cm47XG4gICAgICB0aGlzLl92aWV3SW5pdGlhbGl6ZWQgPSB0cnVlO1xuICAgICAgdGhpcy5fYXBwbHlNaW5XaWR0aFB4KCk7XG4gICAgICB0aGlzLl9hcHBseU1heFdpZHRoUHgoKTtcbiAgICB9KTtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCk6IHZvaWQge1xuICAgIHRoaXMuX2lzRGVzdHJveWVkID0gdHJ1ZTtcbiAgICB0aGlzLmRlc3Ryb3llZC5uZXh0KCk7XG4gICAgdGhpcy5kZXN0cm95ZWQuY29tcGxldGUoKTtcbiAgICB0aGlzLmlubGluZUhhbmRsZT8ucmVtb3ZlKCk7XG4gICAgdGhpcy5vdmVybGF5UmVmPy5kaXNwb3NlKCk7XG4gIH1cblxuICBwcm90ZWN0ZWQgYWJzdHJhY3QgZ2V0SW5saW5lSGFuZGxlQ3NzQ2xhc3NOYW1lKCk6IHN0cmluZztcblxuICBwcm90ZWN0ZWQgYWJzdHJhY3QgZ2V0T3ZlcmxheUhhbmRsZUNvbXBvbmVudFR5cGUoKTogVHlwZTxIYW5kbGVDb21wb25lbnQ+O1xuXG4gIHByaXZhdGUgX2NyZWF0ZU92ZXJsYXlGb3JIYW5kbGUoKTogT3ZlcmxheVJlZiB7XG4gICAgLy8gVXNlIG9mIG92ZXJsYXlzIGFsbG93cyB1cyB0byBwcm9wZXJseSBjYXB0dXJlIGNsaWNrIGV2ZW50cyBzcGFubmluZyBwYXJ0c1xuICAgIC8vIG9mIHR3byB0YWJsZSBjZWxscyBhbmQgaXMgYWxzbyB1c2VmdWwgZm9yIGRpc3BsYXlpbmcgYSByZXNpemUgdGh1bWJcbiAgICAvLyBvdmVyIGJvdGggY2VsbHMgYW5kIGV4dGVuZGluZyBpdCBkb3duIHRoZSB0YWJsZSBhcyBuZWVkZWQuXG5cbiAgICBjb25zdCBpc1J0bCA9IHRoaXMuZGlyZWN0aW9uYWxpdHkudmFsdWUgPT09ICdydGwnO1xuICAgIGNvbnN0IHBvc2l0aW9uU3RyYXRlZ3kgPSB0aGlzLm92ZXJsYXlcbiAgICAgIC5wb3NpdGlvbigpXG4gICAgICAuZmxleGlibGVDb25uZWN0ZWRUbyh0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCEpXG4gICAgICAud2l0aEZsZXhpYmxlRGltZW5zaW9ucyhmYWxzZSlcbiAgICAgIC53aXRoR3Jvd0FmdGVyT3BlbihmYWxzZSlcbiAgICAgIC53aXRoUHVzaChmYWxzZSlcbiAgICAgIC53aXRoRGVmYXVsdE9mZnNldFgoaXNSdGwgPyAxIDogMClcbiAgICAgIC53aXRoUG9zaXRpb25zKFtcbiAgICAgICAge1xuICAgICAgICAgIG9yaWdpblg6IGlzUnRsID8gJ3N0YXJ0JyA6ICdlbmQnLFxuICAgICAgICAgIG9yaWdpblk6ICd0b3AnLFxuICAgICAgICAgIG92ZXJsYXlYOiAnY2VudGVyJyxcbiAgICAgICAgICBvdmVybGF5WTogJ3RvcCcsXG4gICAgICAgIH0sXG4gICAgICBdKTtcblxuICAgIHJldHVybiB0aGlzLm92ZXJsYXkuY3JlYXRlKHtcbiAgICAgIC8vIEFsd2F5cyBwb3NpdGlvbiB0aGUgb3ZlcmxheSBiYXNlZCBvbiBsZWZ0LWluZGV4ZWQgY29vcmRpbmF0ZXMuXG4gICAgICBkaXJlY3Rpb246ICdsdHInLFxuICAgICAgZGlzcG9zZU9uTmF2aWdhdGlvbjogdHJ1ZSxcbiAgICAgIHBvc2l0aW9uU3RyYXRlZ3ksXG4gICAgICBzY3JvbGxTdHJhdGVneTogdGhpcy5vdmVybGF5LnNjcm9sbFN0cmF0ZWdpZXMucmVwb3NpdGlvbigpLFxuICAgICAgd2lkdGg6ICcxNnB4JyxcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX2xpc3RlbkZvclJvd0hvdmVyRXZlbnRzKCk6IHZvaWQge1xuICAgIGNvbnN0IGVsZW1lbnQgPSB0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCE7XG4gICAgY29uc3QgdGFrZVVudGlsRGVzdHJveWVkID0gdGFrZVVudGlsPGJvb2xlYW4+KHRoaXMuZGVzdHJveWVkKTtcblxuICAgIHRoaXMuZXZlbnREaXNwYXRjaGVyXG4gICAgICAucmVzaXplT3ZlcmxheVZpc2libGVGb3JIZWFkZXJSb3coX2Nsb3Nlc3QoZWxlbWVudCwgSEVBREVSX1JPV19TRUxFQ1RPUikhKVxuICAgICAgLnBpcGUodGFrZVVudGlsRGVzdHJveWVkKVxuICAgICAgLnN1YnNjcmliZShob3ZlcmluZ1JvdyA9PiB7XG4gICAgICAgIGlmIChob3ZlcmluZ1Jvdykge1xuICAgICAgICAgIGlmICghdGhpcy5vdmVybGF5UmVmKSB7XG4gICAgICAgICAgICB0aGlzLm92ZXJsYXlSZWYgPSB0aGlzLl9jcmVhdGVPdmVybGF5Rm9ySGFuZGxlKCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdGhpcy5fc2hvd0hhbmRsZU92ZXJsYXkoKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLm92ZXJsYXlSZWYpIHtcbiAgICAgICAgICAvLyB0b2RvIC0gY2FuJ3QgZGV0YWNoIGR1cmluZyBhbiBhY3RpdmUgcmVzaXplIC0gbmVlZCB0byB3b3JrIHRoYXQgb3V0XG4gICAgICAgICAgdGhpcy5vdmVybGF5UmVmLmRldGFjaCgpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX2xpc3RlbkZvclJlc2l6ZUV2ZW50cygpIHtcbiAgICBjb25zdCB0YWtlVW50aWxEZXN0cm95ZWQgPSB0YWtlVW50aWw8Q29sdW1uU2l6ZUFjdGlvbj4odGhpcy5kZXN0cm95ZWQpO1xuXG4gICAgbWVyZ2UodGhpcy5yZXNpemVOb3RpZmllci5yZXNpemVDYW5jZWxlZCwgdGhpcy5yZXNpemVOb3RpZmllci50cmlnZ2VyUmVzaXplKVxuICAgICAgLnBpcGUoXG4gICAgICAgIHRha2VVbnRpbERlc3Ryb3llZCxcbiAgICAgICAgZmlsdGVyKGNvbHVtblNpemUgPT4gY29sdW1uU2l6ZS5jb2x1bW5JZCA9PT0gdGhpcy5jb2x1bW5EZWYubmFtZSksXG4gICAgICApXG4gICAgICAuc3Vic2NyaWJlKCh7c2l6ZSwgcHJldmlvdXNTaXplLCBjb21wbGV0ZUltbWVkaWF0ZWx5fSkgPT4ge1xuICAgICAgICB0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCEuY2xhc3NMaXN0LmFkZChPVkVSTEFZX0FDVElWRV9DTEFTUyk7XG4gICAgICAgIHRoaXMuX2FwcGx5U2l6ZShzaXplLCBwcmV2aW91c1NpemUpO1xuXG4gICAgICAgIGlmIChjb21wbGV0ZUltbWVkaWF0ZWx5KSB7XG4gICAgICAgICAgdGhpcy5fY29tcGxldGVSZXNpemVPcGVyYXRpb24oKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICBtZXJnZSh0aGlzLnJlc2l6ZU5vdGlmaWVyLnJlc2l6ZUNhbmNlbGVkLCB0aGlzLnJlc2l6ZU5vdGlmaWVyLnJlc2l6ZUNvbXBsZXRlZClcbiAgICAgIC5waXBlKHRha2VVbnRpbERlc3Ryb3llZClcbiAgICAgIC5zdWJzY3JpYmUoY29sdW1uU2l6ZSA9PiB7XG4gICAgICAgIHRoaXMuX2NsZWFuVXBBZnRlclJlc2l6ZShjb2x1bW5TaXplKTtcbiAgICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfY29tcGxldGVSZXNpemVPcGVyYXRpb24oKTogdm9pZCB7XG4gICAgdGhpcy5uZ1pvbmUucnVuKCgpID0+IHtcbiAgICAgIHRoaXMucmVzaXplTm90aWZpZXIucmVzaXplQ29tcGxldGVkLm5leHQoe1xuICAgICAgICBjb2x1bW5JZDogdGhpcy5jb2x1bW5EZWYubmFtZSxcbiAgICAgICAgc2l6ZTogdGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQhLm9mZnNldFdpZHRoLFxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIF9jbGVhblVwQWZ0ZXJSZXNpemUoY29sdW1uU2l6ZTogQ29sdW1uU2l6ZUFjdGlvbik6IHZvaWQge1xuICAgIHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50IS5jbGFzc0xpc3QucmVtb3ZlKE9WRVJMQVlfQUNUSVZFX0NMQVNTKTtcblxuICAgIGlmICh0aGlzLm92ZXJsYXlSZWYgJiYgdGhpcy5vdmVybGF5UmVmLmhhc0F0dGFjaGVkKCkpIHtcbiAgICAgIHRoaXMuX3VwZGF0ZU92ZXJsYXlIYW5kbGVIZWlnaHQoKTtcbiAgICAgIHRoaXMub3ZlcmxheVJlZi51cGRhdGVQb3NpdGlvbigpO1xuXG4gICAgICBpZiAoY29sdW1uU2l6ZS5jb2x1bW5JZCA9PT0gdGhpcy5jb2x1bW5EZWYubmFtZSkge1xuICAgICAgICB0aGlzLmlubGluZUhhbmRsZSEuZm9jdXMoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9jcmVhdGVIYW5kbGVQb3J0YWwoKTogQ29tcG9uZW50UG9ydGFsPEhhbmRsZUNvbXBvbmVudD4ge1xuICAgIGNvbnN0IGluamVjdG9yID0gSW5qZWN0b3IuY3JlYXRlKHtcbiAgICAgIHBhcmVudDogdGhpcy5pbmplY3RvcixcbiAgICAgIHByb3ZpZGVyczogW1xuICAgICAgICB7XG4gICAgICAgICAgcHJvdmlkZTogUmVzaXplUmVmLFxuICAgICAgICAgIHVzZVZhbHVlOiBuZXcgUmVzaXplUmVmKFxuICAgICAgICAgICAgdGhpcy5lbGVtZW50UmVmLFxuICAgICAgICAgICAgdGhpcy5vdmVybGF5UmVmISxcbiAgICAgICAgICAgIHRoaXMubWluV2lkdGhQeCxcbiAgICAgICAgICAgIHRoaXMubWF4V2lkdGhQeCxcbiAgICAgICAgICApLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9KTtcblxuICAgIHJldHVybiBuZXcgQ29tcG9uZW50UG9ydGFsKFxuICAgICAgdGhpcy5nZXRPdmVybGF5SGFuZGxlQ29tcG9uZW50VHlwZSgpLFxuICAgICAgdGhpcy52aWV3Q29udGFpbmVyUmVmLFxuICAgICAgaW5qZWN0b3IsXG4gICAgKTtcbiAgfVxuXG4gIHByaXZhdGUgX3Nob3dIYW5kbGVPdmVybGF5KCk6IHZvaWQge1xuICAgIHRoaXMuX3VwZGF0ZU92ZXJsYXlIYW5kbGVIZWlnaHQoKTtcbiAgICB0aGlzLm92ZXJsYXlSZWYhLmF0dGFjaCh0aGlzLl9jcmVhdGVIYW5kbGVQb3J0YWwoKSk7XG5cbiAgICAvLyBOZWVkZWQgdG8gZW5zdXJlIHRoYXQgYWxsIG9mIHRoZSBsaWZlY3ljbGUgaG9va3MgaW5zaWRlIHRoZSBvdmVybGF5IHJ1biBpbW1lZGlhdGVseS5cbiAgICB0aGlzLmNoYW5nZURldGVjdG9yUmVmLm1hcmtGb3JDaGVjaygpO1xuICB9XG5cbiAgcHJpdmF0ZSBfdXBkYXRlT3ZlcmxheUhhbmRsZUhlaWdodCgpIHtcbiAgICB0aGlzLm92ZXJsYXlSZWYhLnVwZGF0ZVNpemUoe2hlaWdodDogdGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQhLm9mZnNldEhlaWdodH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfYXBwbHlTaXplKHNpemVJblBpeGVsczogbnVtYmVyLCBwcmV2aW91c1NpemU/OiBudW1iZXIpOiB2b2lkIHtcbiAgICBjb25zdCBzaXplVG9BcHBseSA9IE1hdGgubWluKE1hdGgubWF4KHNpemVJblBpeGVscywgdGhpcy5taW5XaWR0aFB4LCAwKSwgdGhpcy5tYXhXaWR0aFB4KTtcblxuICAgIHRoaXMucmVzaXplU3RyYXRlZ3kuYXBwbHlDb2x1bW5TaXplKFxuICAgICAgdGhpcy5jb2x1bW5EZWYuY3NzQ2xhc3NGcmllbmRseU5hbWUsXG4gICAgICB0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCEsXG4gICAgICBzaXplVG9BcHBseSxcbiAgICAgIHByZXZpb3VzU2l6ZSxcbiAgICApO1xuICB9XG5cbiAgcHJpdmF0ZSBfYXBwbHlNaW5XaWR0aFB4KCk6IHZvaWQge1xuICAgIHRoaXMucmVzaXplU3RyYXRlZ3kuYXBwbHlNaW5Db2x1bW5TaXplKFxuICAgICAgdGhpcy5jb2x1bW5EZWYuY3NzQ2xhc3NGcmllbmRseU5hbWUsXG4gICAgICB0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCxcbiAgICAgIHRoaXMubWluV2lkdGhQeCxcbiAgICApO1xuICB9XG5cbiAgcHJpdmF0ZSBfYXBwbHlNYXhXaWR0aFB4KCk6IHZvaWQge1xuICAgIHRoaXMucmVzaXplU3RyYXRlZ3kuYXBwbHlNYXhDb2x1bW5TaXplKFxuICAgICAgdGhpcy5jb2x1bW5EZWYuY3NzQ2xhc3NGcmllbmRseU5hbWUsXG4gICAgICB0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCxcbiAgICAgIHRoaXMubWF4V2lkdGhQeCxcbiAgICApO1xuICB9XG5cbiAgcHJpdmF0ZSBfYXBwZW5kSW5saW5lSGFuZGxlKCk6IHZvaWQge1xuICAgIHRoaXMuc3R5bGVTY2hlZHVsZXIuc2NoZWR1bGUoKCkgPT4ge1xuICAgICAgdGhpcy5pbmxpbmVIYW5kbGUgPSB0aGlzLmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgdGhpcy5pbmxpbmVIYW5kbGUudGFiSW5kZXggPSAwO1xuICAgICAgdGhpcy5pbmxpbmVIYW5kbGUuY2xhc3NOYW1lID0gdGhpcy5nZXRJbmxpbmVIYW5kbGVDc3NDbGFzc05hbWUoKTtcblxuICAgICAgLy8gVE9ETzogQXBwbHkgY29ycmVjdCBhcmlhIHJvbGUgKHByb2JhYmx5IHNsaWRlcikgYWZ0ZXIgYTExeSBzcGVjIHF1ZXN0aW9ucyByZXNvbHZlZC5cblxuICAgICAgdGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQhLmFwcGVuZENoaWxkKHRoaXMuaW5saW5lSGFuZGxlKTtcbiAgICB9KTtcbiAgfVxufVxuIl19