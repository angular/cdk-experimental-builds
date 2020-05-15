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
var OVERLAY_ACTIVE_CLASS = 'cdk-resizable-overlay-thumb-active';
/**
 * Base class for Resizable directives which are applied to column headers to make those columns
 * resizable.
 */
var Resizable = /** @class */ (function () {
    function Resizable() {
        this.minWidthPxInternal = 0;
        this.maxWidthPxInternal = Number.MAX_SAFE_INTEGER;
        this.destroyed = new ReplaySubject();
    }
    Object.defineProperty(Resizable.prototype, "minWidthPx", {
        /** The minimum width to allow the column to be sized to. */
        get: function () {
            return this.minWidthPxInternal;
        },
        set: function (value) {
            this.minWidthPxInternal = value;
            if (this.elementRef.nativeElement) {
                this.columnResize.setResized();
                this._applyMinWidthPx();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Resizable.prototype, "maxWidthPx", {
        /** The maximum width to allow the column to be sized to. */
        get: function () {
            return this.maxWidthPxInternal;
        },
        set: function (value) {
            this.maxWidthPxInternal = value;
            if (this.elementRef.nativeElement) {
                this.columnResize.setResized();
                this._applyMaxWidthPx();
            }
        },
        enumerable: true,
        configurable: true
    });
    Resizable.prototype.ngAfterViewInit = function () {
        this._listenForRowHoverEvents();
        this._listenForResizeEvents();
        this._appendInlineHandle();
        this._applyMinWidthPx();
        this._applyMaxWidthPx();
    };
    Resizable.prototype.ngOnDestroy = function () {
        this.destroyed.next();
        this.destroyed.complete();
        if (this.inlineHandle) {
            this.elementRef.nativeElement.removeChild(this.inlineHandle);
        }
        if (this.overlayRef) {
            this.overlayRef.dispose();
        }
    };
    Resizable.prototype._createOverlayForHandle = function () {
        // Use of overlays allows us to properly capture click events spanning parts
        // of two table cells and is also useful for displaying a resize thumb
        // over both cells and extending it down the table as needed.
        var isRtl = this.directionality.value === 'rtl';
        var positionStrategy = this.overlay.position()
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
            positionStrategy: positionStrategy,
            scrollStrategy: this.overlay.scrollStrategies.reposition(),
            width: '16px',
        });
    };
    Resizable.prototype._listenForRowHoverEvents = function () {
        var _this = this;
        var element = this.elementRef.nativeElement;
        var takeUntilDestroyed = takeUntil(this.destroyed);
        this.eventDispatcher.resizeOverlayVisibleForHeaderRow(_closest(element, HEADER_ROW_SELECTOR))
            .pipe(takeUntilDestroyed).subscribe(function (hoveringRow) {
            if (hoveringRow) {
                if (!_this.overlayRef) {
                    _this.overlayRef = _this._createOverlayForHandle();
                }
                _this._showHandleOverlay();
            }
            else if (_this.overlayRef) {
                // todo - can't detach during an active resize - need to work that out
                _this.overlayRef.detach();
            }
        });
    };
    Resizable.prototype._listenForResizeEvents = function () {
        var _this = this;
        var takeUntilDestroyed = takeUntil(this.destroyed);
        merge(this.resizeNotifier.resizeCanceled, this.resizeNotifier.triggerResize).pipe(takeUntilDestroyed, filter(function (columnSize) { return columnSize.columnId === _this.columnDef.name; })).subscribe(function (_a) {
            var size = _a.size, previousSize = _a.previousSize, completeImmediately = _a.completeImmediately;
            _this.elementRef.nativeElement.classList.add(OVERLAY_ACTIVE_CLASS);
            _this._applySize(size, previousSize);
            if (completeImmediately) {
                _this._completeResizeOperation();
            }
        });
        merge(this.resizeNotifier.resizeCanceled, this.resizeNotifier.resizeCompleted).pipe(takeUntilDestroyed).subscribe(function (columnSize) {
            _this._cleanUpAfterResize(columnSize);
        });
    };
    Resizable.prototype._completeResizeOperation = function () {
        var _this = this;
        this.ngZone.run(function () {
            _this.resizeNotifier.resizeCompleted.next({
                columnId: _this.columnDef.name,
                size: _this.elementRef.nativeElement.offsetWidth,
            });
        });
    };
    Resizable.prototype._cleanUpAfterResize = function (columnSize) {
        this.elementRef.nativeElement.classList.remove(OVERLAY_ACTIVE_CLASS);
        if (this.overlayRef && this.overlayRef.hasAttached()) {
            this._updateOverlayHandleHeight();
            this.overlayRef.updatePosition();
            if (columnSize.columnId === this.columnDef.name) {
                this.inlineHandle.focus();
            }
        }
    };
    Resizable.prototype._createHandlePortal = function () {
        var injector = new PortalInjector(this.injector, new WeakMap([[
                ResizeRef,
                new ResizeRef(this.elementRef, this.overlayRef, this.minWidthPx, this.maxWidthPx),
            ]]));
        return new ComponentPortal(this.getOverlayHandleComponentType(), this.viewContainerRef, injector);
    };
    Resizable.prototype._showHandleOverlay = function () {
        this._updateOverlayHandleHeight();
        this.overlayRef.attach(this._createHandlePortal());
    };
    Resizable.prototype._updateOverlayHandleHeight = function () {
        this.overlayRef.updateSize({ height: this.elementRef.nativeElement.offsetHeight });
    };
    Resizable.prototype._applySize = function (sizeInPixels, previousSize) {
        var sizeToApply = Math.min(Math.max(sizeInPixels, this.minWidthPx, 0), this.maxWidthPx);
        this.resizeStrategy.applyColumnSize(this.columnDef.cssClassFriendlyName, this.elementRef.nativeElement, sizeToApply, previousSize);
    };
    Resizable.prototype._applyMinWidthPx = function () {
        this.resizeStrategy.applyMinColumnSize(this.columnDef.cssClassFriendlyName, this.elementRef.nativeElement, this.minWidthPx);
    };
    Resizable.prototype._applyMaxWidthPx = function () {
        this.resizeStrategy.applyMaxColumnSize(this.columnDef.cssClassFriendlyName, this.elementRef.nativeElement, this.maxWidthPx);
    };
    Resizable.prototype._appendInlineHandle = function () {
        this.inlineHandle = this.document.createElement('div');
        this.inlineHandle.tabIndex = 0;
        this.inlineHandle.className = this.getInlineHandleCssClassName();
        // TODO: Apply correct aria role (probably slider) after a11y spec questions resolved.
        this.elementRef.nativeElement.appendChild(this.inlineHandle);
    };
    Resizable.decorators = [
        { type: Directive }
    ];
    return Resizable;
}());
export { Resizable };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzaXphYmxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvY29sdW1uLXJlc2l6ZS9yZXNpemFibGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUVMLFNBQVMsR0FPVixNQUFNLGVBQWUsQ0FBQztBQUV2QixPQUFPLEVBQUMsZUFBZSxFQUFFLGNBQWMsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBR3BFLE9BQU8sRUFBQyxLQUFLLEVBQUUsYUFBYSxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQzFDLE9BQU8sRUFBQyxNQUFNLEVBQUUsU0FBUyxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFFakQsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLHdDQUF3QyxDQUFDO0FBRWhFLE9BQU8sRUFBQyxtQkFBbUIsRUFBQyxNQUFNLGFBQWEsQ0FBQztBQUtoRCxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sY0FBYyxDQUFDO0FBR3ZDLElBQU0sb0JBQW9CLEdBQUcsb0NBQW9DLENBQUM7QUFFbEU7OztHQUdHO0FBQ0g7SUFBQTtRQUdZLHVCQUFrQixHQUFXLENBQUMsQ0FBQztRQUMvQix1QkFBa0IsR0FBVyxNQUFNLENBQUMsZ0JBQWdCLENBQUM7UUFJNUMsY0FBUyxHQUFHLElBQUksYUFBYSxFQUFRLENBQUM7SUErTTNELENBQUM7SUEvTEMsc0JBQUksaUNBQVU7UUFEZCw0REFBNEQ7YUFDNUQ7WUFDRSxPQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQztRQUNqQyxDQUFDO2FBQ0QsVUFBZSxLQUFhO1lBQzFCLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxLQUFLLENBQUM7WUFFaEMsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLGFBQWEsRUFBRTtnQkFDakMsSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLEVBQUUsQ0FBQztnQkFDL0Is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LElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUN0RCxDQUFDO0lBRU8sb0NBQWdCLEdBQXhCO1FBQ0UsSUFBSSxDQUFDLGNBQWMsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLG9CQUFvQixFQUN0RSxJQUFJLENBQUMsVUFBVSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDdEQsQ0FBQztJQUVPLHVDQUFtQixHQUEzQjtRQUNFLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDdkQsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO1FBQy9CLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQywyQkFBMkIsRUFBRSxDQUFDO1FBRWpFLHNGQUFzRjtRQUV0RixJQUFJLENBQUMsVUFBVSxDQUFDLGFBQWMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQ2hFLENBQUM7O2dCQXRORixTQUFTOztJQXVOVixnQkFBQztDQUFBLEFBdk5ELElBdU5DO1NBdE5xQixTQUFTIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7XG4gIEFmdGVyVmlld0luaXQsXG4gIERpcmVjdGl2ZSxcbiAgRWxlbWVudFJlZixcbiAgSW5qZWN0b3IsXG4gIE5nWm9uZSxcbiAgT25EZXN0cm95LFxuICBUeXBlLFxuICBWaWV3Q29udGFpbmVyUmVmLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7RGlyZWN0aW9uYWxpdHl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9iaWRpJztcbmltcG9ydCB7Q29tcG9uZW50UG9ydGFsLCBQb3J0YWxJbmplY3Rvcn0gZnJvbSAnQGFuZ3VsYXIvY2RrL3BvcnRhbCc7XG5pbXBvcnQge092ZXJsYXksIE92ZXJsYXlSZWZ9IGZyb20gJ0Bhbmd1bGFyL2Nkay9vdmVybGF5JztcbmltcG9ydCB7Q2RrQ29sdW1uRGVmfSBmcm9tICdAYW5ndWxhci9jZGsvdGFibGUnO1xuaW1wb3J0IHttZXJnZSwgUmVwbGF5U3ViamVjdH0gZnJvbSAncnhqcyc7XG5pbXBvcnQge2ZpbHRlciwgdGFrZVVudGlsfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbmltcG9ydCB7X2Nsb3Nlc3R9IGZyb20gJ0Bhbmd1bGFyL2Nkay1leHBlcmltZW50YWwvcG9wb3Zlci1lZGl0JztcblxuaW1wb3J0IHtIRUFERVJfUk9XX1NFTEVDVE9SfSBmcm9tICcuL3NlbGVjdG9ycyc7XG5pbXBvcnQge1Jlc2l6ZU92ZXJsYXlIYW5kbGV9IGZyb20gJy4vb3ZlcmxheS1oYW5kbGUnO1xuaW1wb3J0IHtDb2x1bW5SZXNpemV9IGZyb20gJy4vY29sdW1uLXJlc2l6ZSc7XG5pbXBvcnQge0NvbHVtblNpemVBY3Rpb24sIENvbHVtblJlc2l6ZU5vdGlmaWVyU291cmNlfSBmcm9tICcuL2NvbHVtbi1yZXNpemUtbm90aWZpZXInO1xuaW1wb3J0IHtIZWFkZXJSb3dFdmVudERpc3BhdGNoZXJ9IGZyb20gJy4vZXZlbnQtZGlzcGF0Y2hlcic7XG5pbXBvcnQge1Jlc2l6ZVJlZn0gZnJvbSAnLi9yZXNpemUtcmVmJztcbmltcG9ydCB7UmVzaXplU3RyYXRlZ3l9IGZyb20gJy4vcmVzaXplLXN0cmF0ZWd5JztcblxuY29uc3QgT1ZFUkxBWV9BQ1RJVkVfQ0xBU1MgPSAnY2RrLXJlc2l6YWJsZS1vdmVybGF5LXRodW1iLWFjdGl2ZSc7XG5cbi8qKlxuICogQmFzZSBjbGFzcyBmb3IgUmVzaXphYmxlIGRpcmVjdGl2ZXMgd2hpY2ggYXJlIGFwcGxpZWQgdG8gY29sdW1uIGhlYWRlcnMgdG8gbWFrZSB0aG9zZSBjb2x1bW5zXG4gKiByZXNpemFibGUuXG4gKi9cbkBEaXJlY3RpdmUoKVxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFJlc2l6YWJsZTxIYW5kbGVDb21wb25lbnQgZXh0ZW5kcyBSZXNpemVPdmVybGF5SGFuZGxlPlxuICAgIGltcGxlbWVudHMgQWZ0ZXJWaWV3SW5pdCwgT25EZXN0cm95IHtcbiAgcHJvdGVjdGVkIG1pbldpZHRoUHhJbnRlcm5hbDogbnVtYmVyID0gMDtcbiAgcHJvdGVjdGVkIG1heFdpZHRoUHhJbnRlcm5hbDogbnVtYmVyID0gTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVI7XG5cbiAgcHJvdGVjdGVkIGlubGluZUhhbmRsZT86IEhUTUxFbGVtZW50O1xuICBwcm90ZWN0ZWQgb3ZlcmxheVJlZj86IE92ZXJsYXlSZWY7XG4gIHByb3RlY3RlZCByZWFkb25seSBkZXN0cm95ZWQgPSBuZXcgUmVwbGF5U3ViamVjdDx2b2lkPigpO1xuXG4gIHByb3RlY3RlZCBhYnN0cmFjdCByZWFkb25seSBjb2x1bW5EZWY6IENka0NvbHVtbkRlZjtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IHJlYWRvbmx5IGNvbHVtblJlc2l6ZTogQ29sdW1uUmVzaXplO1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgcmVhZG9ubHkgZGlyZWN0aW9uYWxpdHk6IERpcmVjdGlvbmFsaXR5O1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgcmVhZG9ubHkgZG9jdW1lbnQ6IERvY3VtZW50O1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgcmVhZG9ubHkgZWxlbWVudFJlZjogRWxlbWVudFJlZjtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IHJlYWRvbmx5IGV2ZW50RGlzcGF0Y2hlcjogSGVhZGVyUm93RXZlbnREaXNwYXRjaGVyO1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgcmVhZG9ubHkgaW5qZWN0b3I6IEluamVjdG9yO1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgcmVhZG9ubHkgbmdab25lOiBOZ1pvbmU7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCByZWFkb25seSBvdmVybGF5OiBPdmVybGF5O1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgcmVhZG9ubHkgcmVzaXplTm90aWZpZXI6IENvbHVtblJlc2l6ZU5vdGlmaWVyU291cmNlO1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgcmVhZG9ubHkgcmVzaXplU3RyYXRlZ3k6IFJlc2l6ZVN0cmF0ZWd5O1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgcmVhZG9ubHkgdmlld0NvbnRhaW5lclJlZjogVmlld0NvbnRhaW5lclJlZjtcblxuICAvKiogVGhlIG1pbmltdW0gd2lkdGggdG8gYWxsb3cgdGhlIGNvbHVtbiB0byBiZSBzaXplZCB0by4gKi9cbiAgZ2V0IG1pbldpZHRoUHgoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5taW5XaWR0aFB4SW50ZXJuYWw7XG4gIH1cbiAgc2V0IG1pbldpZHRoUHgodmFsdWU6IG51bWJlcikge1xuICAgIHRoaXMubWluV2lkdGhQeEludGVybmFsID0gdmFsdWU7XG5cbiAgICBpZiAodGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQpIHtcbiAgICAgIHRoaXMuY29sdW1uUmVzaXplLnNldFJlc2l6ZWQoKTtcbiAgICAgIHRoaXMuX2FwcGx5TWluV2lkdGhQeCgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBUaGUgbWF4aW11bSB3aWR0aCB0byBhbGxvdyB0aGUgY29sdW1uIHRvIGJlIHNpemVkIHRvLiAqL1xuICBnZXQgbWF4V2lkdGhQeCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLm1heFdpZHRoUHhJbnRlcm5hbDtcbiAgfVxuICBzZXQgbWF4V2lkdGhQeCh2YWx1ZTogbnVtYmVyKSB7XG4gICAgdGhpcy5tYXhXaWR0aFB4SW50ZXJuYWwgPSB2YWx1ZTtcblxuICAgIGlmICh0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCkge1xuICAgICAgdGhpcy5jb2x1bW5SZXNpemUuc2V0UmVzaXplZCgpO1xuICAgICAgdGhpcy5fYXBwbHlNYXhXaWR0aFB4KCk7XG4gICAgfVxuICB9XG5cbiAgbmdBZnRlclZpZXdJbml0KCkge1xuICAgIHRoaXMuX2xpc3RlbkZvclJvd0hvdmVyRXZlbnRzKCk7XG4gICAgdGhpcy5fbGlzdGVuRm9yUmVzaXplRXZlbnRzKCk7XG4gICAgdGhpcy5fYXBwZW5kSW5saW5lSGFuZGxlKCk7XG4gICAgdGhpcy5fYXBwbHlNaW5XaWR0aFB4KCk7XG4gICAgdGhpcy5fYXBwbHlNYXhXaWR0aFB4KCk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLmRlc3Ryb3llZC5uZXh0KCk7XG4gICAgdGhpcy5kZXN0cm95ZWQuY29tcGxldGUoKTtcblxuICAgIGlmICh0aGlzLmlubGluZUhhbmRsZSkge1xuICAgICAgdGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQhLnJlbW92ZUNoaWxkKHRoaXMuaW5saW5lSGFuZGxlKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5vdmVybGF5UmVmKSB7XG4gICAgICB0aGlzLm92ZXJsYXlSZWYuZGlzcG9zZSgpO1xuICAgIH1cbiAgfVxuXG4gIHByb3RlY3RlZCBhYnN0cmFjdCBnZXRJbmxpbmVIYW5kbGVDc3NDbGFzc05hbWUoKTogc3RyaW5nO1xuXG4gIHByb3RlY3RlZCBhYnN0cmFjdCBnZXRPdmVybGF5SGFuZGxlQ29tcG9uZW50VHlwZSgpOiBUeXBlPEhhbmRsZUNvbXBvbmVudD47XG5cbiAgcHJpdmF0ZSBfY3JlYXRlT3ZlcmxheUZvckhhbmRsZSgpOiBPdmVybGF5UmVmIHtcbiAgICAvLyBVc2Ugb2Ygb3ZlcmxheXMgYWxsb3dzIHVzIHRvIHByb3Blcmx5IGNhcHR1cmUgY2xpY2sgZXZlbnRzIHNwYW5uaW5nIHBhcnRzXG4gICAgLy8gb2YgdHdvIHRhYmxlIGNlbGxzIGFuZCBpcyBhbHNvIHVzZWZ1bCBmb3IgZGlzcGxheWluZyBhIHJlc2l6ZSB0aHVtYlxuICAgIC8vIG92ZXIgYm90aCBjZWxscyBhbmQgZXh0ZW5kaW5nIGl0IGRvd24gdGhlIHRhYmxlIGFzIG5lZWRlZC5cblxuICAgIGNvbnN0IGlzUnRsID0gdGhpcy5kaXJlY3Rpb25hbGl0eS52YWx1ZSA9PT0gJ3J0bCc7XG4gICAgY29uc3QgcG9zaXRpb25TdHJhdGVneSA9IHRoaXMub3ZlcmxheS5wb3NpdGlvbigpXG4gICAgICAgIC5mbGV4aWJsZUNvbm5lY3RlZFRvKHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50ISlcbiAgICAgICAgLndpdGhGbGV4aWJsZURpbWVuc2lvbnMoZmFsc2UpXG4gICAgICAgIC53aXRoR3Jvd0FmdGVyT3BlbihmYWxzZSlcbiAgICAgICAgLndpdGhQdXNoKGZhbHNlKVxuICAgICAgICAud2l0aERlZmF1bHRPZmZzZXRYKGlzUnRsID8gMSA6IDApXG4gICAgICAgIC53aXRoUG9zaXRpb25zKFt7XG4gICAgICAgICAgb3JpZ2luWDogaXNSdGwgPyAnc3RhcnQnIDogJ2VuZCcsXG4gICAgICAgICAgb3JpZ2luWTogJ3RvcCcsXG4gICAgICAgICAgb3ZlcmxheVg6ICdjZW50ZXInLFxuICAgICAgICAgIG92ZXJsYXlZOiAndG9wJyxcbiAgICAgICAgfV0pO1xuXG4gICAgcmV0dXJuIHRoaXMub3ZlcmxheS5jcmVhdGUoe1xuICAgICAgLy8gQWx3YXlzIHBvc2l0aW9uIHRoZSBvdmVybGF5IGJhc2VkIG9uIGxlZnQtaW5kZXhlZCBjb29yZGluYXRlcy5cbiAgICAgIGRpcmVjdGlvbjogJ2x0cicsXG4gICAgICBkaXNwb3NlT25OYXZpZ2F0aW9uOiB0cnVlLFxuICAgICAgcG9zaXRpb25TdHJhdGVneSxcbiAgICAgIHNjcm9sbFN0cmF0ZWd5OiB0aGlzLm92ZXJsYXkuc2Nyb2xsU3RyYXRlZ2llcy5yZXBvc2l0aW9uKCksXG4gICAgICB3aWR0aDogJzE2cHgnLFxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfbGlzdGVuRm9yUm93SG92ZXJFdmVudHMoKTogdm9pZCB7XG4gICAgY29uc3QgZWxlbWVudCA9IHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50ITtcbiAgICBjb25zdCB0YWtlVW50aWxEZXN0cm95ZWQgPSB0YWtlVW50aWw8Ym9vbGVhbj4odGhpcy5kZXN0cm95ZWQpO1xuXG5cbiAgICB0aGlzLmV2ZW50RGlzcGF0Y2hlci5yZXNpemVPdmVybGF5VmlzaWJsZUZvckhlYWRlclJvdyhfY2xvc2VzdChlbGVtZW50LCBIRUFERVJfUk9XX1NFTEVDVE9SKSEpXG4gICAgICAgIC5waXBlKHRha2VVbnRpbERlc3Ryb3llZCkuc3Vic2NyaWJlKGhvdmVyaW5nUm93ID0+IHtcbiAgICAgIGlmIChob3ZlcmluZ1Jvdykge1xuICAgICAgICBpZiAoIXRoaXMub3ZlcmxheVJlZikge1xuICAgICAgICAgIHRoaXMub3ZlcmxheVJlZiA9IHRoaXMuX2NyZWF0ZU92ZXJsYXlGb3JIYW5kbGUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX3Nob3dIYW5kbGVPdmVybGF5KCk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMub3ZlcmxheVJlZikge1xuICAgICAgICAvLyB0b2RvIC0gY2FuJ3QgZGV0YWNoIGR1cmluZyBhbiBhY3RpdmUgcmVzaXplIC0gbmVlZCB0byB3b3JrIHRoYXQgb3V0XG4gICAgICAgIHRoaXMub3ZlcmxheVJlZi5kZXRhY2goKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX2xpc3RlbkZvclJlc2l6ZUV2ZW50cygpIHtcbiAgICBjb25zdCB0YWtlVW50aWxEZXN0cm95ZWQgPSB0YWtlVW50aWw8Q29sdW1uU2l6ZUFjdGlvbj4odGhpcy5kZXN0cm95ZWQpO1xuXG4gICAgbWVyZ2UoXG4gICAgICAgIHRoaXMucmVzaXplTm90aWZpZXIucmVzaXplQ2FuY2VsZWQsXG4gICAgICAgIHRoaXMucmVzaXplTm90aWZpZXIudHJpZ2dlclJlc2l6ZSxcbiAgICApLnBpcGUoXG4gICAgICAgIHRha2VVbnRpbERlc3Ryb3llZCxcbiAgICAgICAgZmlsdGVyKGNvbHVtblNpemUgPT4gY29sdW1uU2l6ZS5jb2x1bW5JZCA9PT0gdGhpcy5jb2x1bW5EZWYubmFtZSksXG4gICAgKS5zdWJzY3JpYmUoKHtzaXplLCBwcmV2aW91c1NpemUsIGNvbXBsZXRlSW1tZWRpYXRlbHl9KSA9PiB7XG4gICAgICB0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCEuY2xhc3NMaXN0LmFkZChPVkVSTEFZX0FDVElWRV9DTEFTUyk7XG4gICAgICB0aGlzLl9hcHBseVNpemUoc2l6ZSwgcHJldmlvdXNTaXplKTtcblxuICAgICAgaWYgKGNvbXBsZXRlSW1tZWRpYXRlbHkpIHtcbiAgICAgICAgdGhpcy5fY29tcGxldGVSZXNpemVPcGVyYXRpb24oKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIG1lcmdlKFxuICAgICAgICB0aGlzLnJlc2l6ZU5vdGlmaWVyLnJlc2l6ZUNhbmNlbGVkLFxuICAgICAgICB0aGlzLnJlc2l6ZU5vdGlmaWVyLnJlc2l6ZUNvbXBsZXRlZCxcbiAgICApLnBpcGUodGFrZVVudGlsRGVzdHJveWVkKS5zdWJzY3JpYmUoY29sdW1uU2l6ZSA9PiB7XG4gICAgICB0aGlzLl9jbGVhblVwQWZ0ZXJSZXNpemUoY29sdW1uU2l6ZSk7XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIF9jb21wbGV0ZVJlc2l6ZU9wZXJhdGlvbigpOiB2b2lkIHtcbiAgICB0aGlzLm5nWm9uZS5ydW4oKCkgPT4ge1xuICAgICAgdGhpcy5yZXNpemVOb3RpZmllci5yZXNpemVDb21wbGV0ZWQubmV4dCh7XG4gICAgICAgIGNvbHVtbklkOiB0aGlzLmNvbHVtbkRlZi5uYW1lLFxuICAgICAgICBzaXplOiB0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCEub2Zmc2V0V2lkdGgsXG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX2NsZWFuVXBBZnRlclJlc2l6ZShjb2x1bW5TaXplOiBDb2x1bW5TaXplQWN0aW9uKTogdm9pZCB7XG4gICAgdGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQhLmNsYXNzTGlzdC5yZW1vdmUoT1ZFUkxBWV9BQ1RJVkVfQ0xBU1MpO1xuXG4gICAgaWYgKHRoaXMub3ZlcmxheVJlZiAmJiB0aGlzLm92ZXJsYXlSZWYuaGFzQXR0YWNoZWQoKSkge1xuICAgICAgdGhpcy5fdXBkYXRlT3ZlcmxheUhhbmRsZUhlaWdodCgpO1xuICAgICAgdGhpcy5vdmVybGF5UmVmLnVwZGF0ZVBvc2l0aW9uKCk7XG5cbiAgICAgIGlmIChjb2x1bW5TaXplLmNvbHVtbklkID09PSB0aGlzLmNvbHVtbkRlZi5uYW1lKSB7XG4gICAgICAgIHRoaXMuaW5saW5lSGFuZGxlIS5mb2N1cygpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2NyZWF0ZUhhbmRsZVBvcnRhbCgpOiBDb21wb25lbnRQb3J0YWw8SGFuZGxlQ29tcG9uZW50PiB7XG4gICAgY29uc3QgaW5qZWN0b3IgPSBuZXcgUG9ydGFsSW5qZWN0b3IodGhpcy5pbmplY3RvciwgbmV3IFdlYWtNYXAoW1tcbiAgICAgIFJlc2l6ZVJlZixcbiAgICAgIG5ldyBSZXNpemVSZWYodGhpcy5lbGVtZW50UmVmLCB0aGlzLm92ZXJsYXlSZWYhLCB0aGlzLm1pbldpZHRoUHgsIHRoaXMubWF4V2lkdGhQeCksXG4gICAgXV0pKTtcbiAgICByZXR1cm4gbmV3IENvbXBvbmVudFBvcnRhbCh0aGlzLmdldE92ZXJsYXlIYW5kbGVDb21wb25lbnRUeXBlKCksXG4gICAgICAgIHRoaXMudmlld0NvbnRhaW5lclJlZiwgaW5qZWN0b3IpO1xuICB9XG5cbiAgcHJpdmF0ZSBfc2hvd0hhbmRsZU92ZXJsYXkoKTogdm9pZCB7XG4gICAgdGhpcy5fdXBkYXRlT3ZlcmxheUhhbmRsZUhlaWdodCgpO1xuICAgIHRoaXMub3ZlcmxheVJlZiEuYXR0YWNoKHRoaXMuX2NyZWF0ZUhhbmRsZVBvcnRhbCgpKTtcbiAgfVxuXG4gIHByaXZhdGUgX3VwZGF0ZU92ZXJsYXlIYW5kbGVIZWlnaHQoKSB7XG4gICAgdGhpcy5vdmVybGF5UmVmIS51cGRhdGVTaXplKHtoZWlnaHQ6IHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50IS5vZmZzZXRIZWlnaHR9KTtcbiAgfVxuXG4gIHByaXZhdGUgX2FwcGx5U2l6ZShzaXplSW5QaXhlbHM6IG51bWJlciwgcHJldmlvdXNTaXplPzogbnVtYmVyKTogdm9pZCB7XG4gICAgY29uc3Qgc2l6ZVRvQXBwbHkgPSBNYXRoLm1pbihNYXRoLm1heChzaXplSW5QaXhlbHMsIHRoaXMubWluV2lkdGhQeCwgMCksIHRoaXMubWF4V2lkdGhQeCk7XG5cbiAgICB0aGlzLnJlc2l6ZVN0cmF0ZWd5LmFwcGx5Q29sdW1uU2l6ZSh0aGlzLmNvbHVtbkRlZi5jc3NDbGFzc0ZyaWVuZGx5TmFtZSxcbiAgICAgICAgdGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQhLCBzaXplVG9BcHBseSwgcHJldmlvdXNTaXplKTtcbiAgfVxuXG4gIHByaXZhdGUgX2FwcGx5TWluV2lkdGhQeCgpOiB2b2lkIHtcbiAgICB0aGlzLnJlc2l6ZVN0cmF0ZWd5LmFwcGx5TWluQ29sdW1uU2l6ZSh0aGlzLmNvbHVtbkRlZi5jc3NDbGFzc0ZyaWVuZGx5TmFtZSxcbiAgICAgICAgdGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQsIHRoaXMubWluV2lkdGhQeCk7XG4gIH1cblxuICBwcml2YXRlIF9hcHBseU1heFdpZHRoUHgoKTogdm9pZCB7XG4gICAgdGhpcy5yZXNpemVTdHJhdGVneS5hcHBseU1heENvbHVtblNpemUodGhpcy5jb2x1bW5EZWYuY3NzQ2xhc3NGcmllbmRseU5hbWUsXG4gICAgICAgIHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LCB0aGlzLm1heFdpZHRoUHgpO1xuICB9XG5cbiAgcHJpdmF0ZSBfYXBwZW5kSW5saW5lSGFuZGxlKCk6IHZvaWQge1xuICAgIHRoaXMuaW5saW5lSGFuZGxlID0gdGhpcy5kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICB0aGlzLmlubGluZUhhbmRsZS50YWJJbmRleCA9IDA7XG4gICAgdGhpcy5pbmxpbmVIYW5kbGUuY2xhc3NOYW1lID0gdGhpcy5nZXRJbmxpbmVIYW5kbGVDc3NDbGFzc05hbWUoKTtcblxuICAgIC8vIFRPRE86IEFwcGx5IGNvcnJlY3QgYXJpYSByb2xlIChwcm9iYWJseSBzbGlkZXIpIGFmdGVyIGExMXkgc3BlYyBxdWVzdGlvbnMgcmVzb2x2ZWQuXG5cbiAgICB0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCEuYXBwZW5kQ2hpbGQodGhpcy5pbmxpbmVIYW5kbGUpO1xuICB9XG59XG4iXX0=