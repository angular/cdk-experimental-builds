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
        var positionStrategy = this.overlay.position()
            .flexibleConnectedTo(this.elementRef.nativeElement)
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
            var size = _a.size, completeImmediately = _a.completeImmediately;
            _this.elementRef.nativeElement.classList.add(OVERLAY_ACTIVE_CLASS);
            _this._applySize(size);
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
    Resizable.prototype._applySize = function (sizeInPixels) {
        var sizeToApply = Math.min(Math.max(sizeInPixels, this.minWidthPx, 0), this.maxWidthPx);
        this.resizeStrategy.applyColumnSize(this.columnDef.cssClassFriendlyName, this.elementRef.nativeElement, sizeToApply);
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
    return Resizable;
}());
export { Resizable };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzaXphYmxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvY29sdW1uLXJlc2l6ZS9yZXNpemFibGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBWUgsT0FBTyxFQUFDLGVBQWUsRUFBRSxjQUFjLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUdwRSxPQUFPLEVBQUMsS0FBSyxFQUFFLGFBQWEsRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUMxQyxPQUFPLEVBQUMsTUFBTSxFQUFFLFNBQVMsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBRWpELE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSx3Q0FBd0MsQ0FBQztBQUVoRSxPQUFPLEVBQUMsbUJBQW1CLEVBQUMsTUFBTSxhQUFhLENBQUM7QUFLaEQsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLGNBQWMsQ0FBQztBQUd2QyxJQUFNLG9CQUFvQixHQUFHLG9DQUFvQyxDQUFDO0FBRWxFOzs7R0FHRztBQUNIO0lBQUE7UUFFWSx1QkFBa0IsR0FBVyxDQUFDLENBQUM7UUFDL0IsdUJBQWtCLEdBQVcsTUFBTSxDQUFDLGdCQUFnQixDQUFDO1FBSTVDLGNBQVMsR0FBRyxJQUFJLGFBQWEsRUFBUSxDQUFDO0lBME0zRCxDQUFDO0lBMUxDLHNCQUFJLGlDQUFVO1FBRGQsNERBQTREO2FBQzVEO1lBQ0UsT0FBTyxJQUFJLENBQUMsa0JBQWtCLENBQUM7UUFDakMsQ0FBQzthQUNELFVBQWUsS0FBYTtZQUMxQixJQUFJLENBQUMsa0JBQWtCLEdBQUcsS0FBSyxDQUFDO1lBRWhDLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxhQUFhLEVBQUU7Z0JBQ2pDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO2FBQ3pCO1FBQ0gsQ0FBQzs7O09BUEE7SUFVRCxzQkFBSSxpQ0FBVTtRQURkLDREQUE0RDthQUM1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LFlBQVksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLDJCQUEyQixFQUFFLENBQUM7UUFFakUsc0ZBQXNGO1FBRXRGLElBQUksQ0FBQyxVQUFVLENBQUMsYUFBYyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDaEUsQ0FBQztJQUNILGdCQUFDO0FBQUQsQ0FBQyxBQWpORCxJQWlOQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1xuICBBZnRlclZpZXdJbml0LFxuICBFbGVtZW50UmVmLFxuICBJbmplY3RvcixcbiAgTmdab25lLFxuICBPbkRlc3Ryb3ksXG4gIFR5cGUsXG4gIFZpZXdDb250YWluZXJSZWYsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtEaXJlY3Rpb25hbGl0eX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2JpZGknO1xuaW1wb3J0IHtDb21wb25lbnRQb3J0YWwsIFBvcnRhbEluamVjdG9yfSBmcm9tICdAYW5ndWxhci9jZGsvcG9ydGFsJztcbmltcG9ydCB7T3ZlcmxheSwgT3ZlcmxheVJlZn0gZnJvbSAnQGFuZ3VsYXIvY2RrL292ZXJsYXknO1xuaW1wb3J0IHtDZGtDb2x1bW5EZWZ9IGZyb20gJ0Bhbmd1bGFyL2Nkay90YWJsZSc7XG5pbXBvcnQge21lcmdlLCBSZXBsYXlTdWJqZWN0fSBmcm9tICdyeGpzJztcbmltcG9ydCB7ZmlsdGVyLCB0YWtlVW50aWx9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcblxuaW1wb3J0IHtfY2xvc2VzdH0gZnJvbSAnQGFuZ3VsYXIvY2RrLWV4cGVyaW1lbnRhbC9wb3BvdmVyLWVkaXQnO1xuXG5pbXBvcnQge0hFQURFUl9ST1dfU0VMRUNUT1J9IGZyb20gJy4vc2VsZWN0b3JzJztcbmltcG9ydCB7UmVzaXplT3ZlcmxheUhhbmRsZX0gZnJvbSAnLi9vdmVybGF5LWhhbmRsZSc7XG5pbXBvcnQge0NvbHVtblJlc2l6ZX0gZnJvbSAnLi9jb2x1bW4tcmVzaXplJztcbmltcG9ydCB7Q29sdW1uU2l6ZUFjdGlvbiwgQ29sdW1uUmVzaXplTm90aWZpZXJTb3VyY2V9IGZyb20gJy4vY29sdW1uLXJlc2l6ZS1ub3RpZmllcic7XG5pbXBvcnQge0hlYWRlclJvd0V2ZW50RGlzcGF0Y2hlcn0gZnJvbSAnLi9ldmVudC1kaXNwYXRjaGVyJztcbmltcG9ydCB7UmVzaXplUmVmfSBmcm9tICcuL3Jlc2l6ZS1yZWYnO1xuaW1wb3J0IHtSZXNpemVTdHJhdGVneX0gZnJvbSAnLi9yZXNpemUtc3RyYXRlZ3knO1xuXG5jb25zdCBPVkVSTEFZX0FDVElWRV9DTEFTUyA9ICdjZGstcmVzaXphYmxlLW92ZXJsYXktdGh1bWItYWN0aXZlJztcblxuLyoqXG4gKiBCYXNlIGNsYXNzIGZvciBSZXNpemFibGUgZGlyZWN0aXZlcyB3aGljaCBhcmUgYXBwbGllZCB0byBjb2x1bW4gaGVhZGVycyB0byBtYWtlIHRob3NlIGNvbHVtbnNcbiAqIHJlc2l6YWJsZS5cbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFJlc2l6YWJsZTxIYW5kbGVDb21wb25lbnQgZXh0ZW5kcyBSZXNpemVPdmVybGF5SGFuZGxlPlxuICAgIGltcGxlbWVudHMgQWZ0ZXJWaWV3SW5pdCwgT25EZXN0cm95IHtcbiAgcHJvdGVjdGVkIG1pbldpZHRoUHhJbnRlcm5hbDogbnVtYmVyID0gMDtcbiAgcHJvdGVjdGVkIG1heFdpZHRoUHhJbnRlcm5hbDogbnVtYmVyID0gTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVI7XG5cbiAgcHJvdGVjdGVkIGlubGluZUhhbmRsZT86IEhUTUxFbGVtZW50O1xuICBwcm90ZWN0ZWQgb3ZlcmxheVJlZj86IE92ZXJsYXlSZWY7XG4gIHByb3RlY3RlZCByZWFkb25seSBkZXN0cm95ZWQgPSBuZXcgUmVwbGF5U3ViamVjdDx2b2lkPigpO1xuXG4gIHByb3RlY3RlZCBhYnN0cmFjdCByZWFkb25seSBjb2x1bW5EZWY6IENka0NvbHVtbkRlZjtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IHJlYWRvbmx5IGNvbHVtblJlc2l6ZTogQ29sdW1uUmVzaXplO1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgcmVhZG9ubHkgZGlyZWN0aW9uYWxpdHk6IERpcmVjdGlvbmFsaXR5O1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgcmVhZG9ubHkgZG9jdW1lbnQ6IERvY3VtZW50O1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgcmVhZG9ubHkgZWxlbWVudFJlZjogRWxlbWVudFJlZjtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IHJlYWRvbmx5IGV2ZW50RGlzcGF0Y2hlcjogSGVhZGVyUm93RXZlbnREaXNwYXRjaGVyO1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgcmVhZG9ubHkgaW5qZWN0b3I6IEluamVjdG9yO1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgcmVhZG9ubHkgbmdab25lOiBOZ1pvbmU7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCByZWFkb25seSBvdmVybGF5OiBPdmVybGF5O1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgcmVhZG9ubHkgcmVzaXplTm90aWZpZXI6IENvbHVtblJlc2l6ZU5vdGlmaWVyU291cmNlO1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgcmVhZG9ubHkgcmVzaXplU3RyYXRlZ3k6IFJlc2l6ZVN0cmF0ZWd5O1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgcmVhZG9ubHkgdmlld0NvbnRhaW5lclJlZjogVmlld0NvbnRhaW5lclJlZjtcblxuICAvKiogVGhlIG1pbmltdW0gd2lkdGggdG8gYWxsb3cgdGhlIGNvbHVtbiB0byBiZSBzaXplZCB0by4gKi9cbiAgZ2V0IG1pbldpZHRoUHgoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5taW5XaWR0aFB4SW50ZXJuYWw7XG4gIH1cbiAgc2V0IG1pbldpZHRoUHgodmFsdWU6IG51bWJlcikge1xuICAgIHRoaXMubWluV2lkdGhQeEludGVybmFsID0gdmFsdWU7XG5cbiAgICBpZiAodGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQpIHtcbiAgICAgIHRoaXMuX2FwcGx5TWluV2lkdGhQeCgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBUaGUgbWF4aW11bSB3aWR0aCB0byBhbGxvdyB0aGUgY29sdW1uIHRvIGJlIHNpemVkIHRvLiAqL1xuICBnZXQgbWF4V2lkdGhQeCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLm1heFdpZHRoUHhJbnRlcm5hbDtcbiAgfVxuICBzZXQgbWF4V2lkdGhQeCh2YWx1ZTogbnVtYmVyKSB7XG4gICAgdGhpcy5tYXhXaWR0aFB4SW50ZXJuYWwgPSB2YWx1ZTtcblxuICAgIGlmICh0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCkge1xuICAgICAgdGhpcy5fYXBwbHlNYXhXaWR0aFB4KCk7XG4gICAgfVxuICB9XG5cbiAgbmdBZnRlclZpZXdJbml0KCkge1xuICAgIHRoaXMuX2xpc3RlbkZvclJvd0hvdmVyRXZlbnRzKCk7XG4gICAgdGhpcy5fbGlzdGVuRm9yUmVzaXplRXZlbnRzKCk7XG4gICAgdGhpcy5fYXBwZW5kSW5saW5lSGFuZGxlKCk7XG4gICAgdGhpcy5fYXBwbHlNaW5XaWR0aFB4KCk7XG4gICAgdGhpcy5fYXBwbHlNYXhXaWR0aFB4KCk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLmRlc3Ryb3llZC5uZXh0KCk7XG4gICAgdGhpcy5kZXN0cm95ZWQuY29tcGxldGUoKTtcblxuICAgIGlmICh0aGlzLmlubGluZUhhbmRsZSkge1xuICAgICAgdGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQhLnJlbW92ZUNoaWxkKHRoaXMuaW5saW5lSGFuZGxlKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5vdmVybGF5UmVmKSB7XG4gICAgICB0aGlzLm92ZXJsYXlSZWYuZGlzcG9zZSgpO1xuICAgIH1cbiAgfVxuXG4gIHByb3RlY3RlZCBhYnN0cmFjdCBnZXRJbmxpbmVIYW5kbGVDc3NDbGFzc05hbWUoKTogc3RyaW5nO1xuXG4gIHByb3RlY3RlZCBhYnN0cmFjdCBnZXRPdmVybGF5SGFuZGxlQ29tcG9uZW50VHlwZSgpOiBUeXBlPEhhbmRsZUNvbXBvbmVudD47XG5cbiAgcHJpdmF0ZSBfY3JlYXRlT3ZlcmxheUZvckhhbmRsZSgpOiBPdmVybGF5UmVmIHtcbiAgICAvLyBVc2Ugb2Ygb3ZlcmxheXMgYWxsb3dzIHVzIHRvIHByb3Blcmx5IGNhcHR1cmUgY2xpY2sgZXZlbnRzIHNwYW5uaW5nIHBhcnRzXG4gICAgLy8gb2YgdHdvIHRhYmxlIGNlbGxzIGFuZCBpcyBhbHNvIHVzZWZ1bCBmb3IgZGlzcGxheWluZyBhIHJlc2l6ZSB0aHVtYlxuICAgIC8vIG92ZXIgYm90aCBjZWxscyBhbmQgZXh0ZW5kaW5nIGl0IGRvd24gdGhlIHRhYmxlIGFzIG5lZWRlZC5cblxuICAgIGNvbnN0IHBvc2l0aW9uU3RyYXRlZ3kgPSB0aGlzLm92ZXJsYXkucG9zaXRpb24oKVxuICAgICAgICAuZmxleGlibGVDb25uZWN0ZWRUbyh0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCEpXG4gICAgICAgIC53aXRoRmxleGlibGVEaW1lbnNpb25zKGZhbHNlKVxuICAgICAgICAud2l0aEdyb3dBZnRlck9wZW4oZmFsc2UpXG4gICAgICAgIC53aXRoUHVzaChmYWxzZSlcbiAgICAgICAgLndpdGhQb3NpdGlvbnMoW3tcbiAgICAgICAgICBvcmlnaW5YOiAnZW5kJyxcbiAgICAgICAgICBvcmlnaW5ZOiAndG9wJyxcbiAgICAgICAgICBvdmVybGF5WDogJ2NlbnRlcicsXG4gICAgICAgICAgb3ZlcmxheVk6ICd0b3AnLFxuICAgICAgICB9XSk7XG5cbiAgICByZXR1cm4gdGhpcy5vdmVybGF5LmNyZWF0ZSh7XG4gICAgICBkaXJlY3Rpb246IHRoaXMuZGlyZWN0aW9uYWxpdHksXG4gICAgICBkaXNwb3NlT25OYXZpZ2F0aW9uOiB0cnVlLFxuICAgICAgcG9zaXRpb25TdHJhdGVneSxcbiAgICAgIHNjcm9sbFN0cmF0ZWd5OiB0aGlzLm92ZXJsYXkuc2Nyb2xsU3RyYXRlZ2llcy5yZXBvc2l0aW9uKCksXG4gICAgICB3aWR0aDogJzE2cHgnLFxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfbGlzdGVuRm9yUm93SG92ZXJFdmVudHMoKTogdm9pZCB7XG4gICAgY29uc3QgZWxlbWVudCA9IHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50ITtcbiAgICBjb25zdCB0YWtlVW50aWxEZXN0cm95ZWQgPSB0YWtlVW50aWw8Ym9vbGVhbj4odGhpcy5kZXN0cm95ZWQpO1xuXG5cbiAgICB0aGlzLmV2ZW50RGlzcGF0Y2hlci5yZXNpemVPdmVybGF5VmlzaWJsZUZvckhlYWRlclJvdyhfY2xvc2VzdChlbGVtZW50LCBIRUFERVJfUk9XX1NFTEVDVE9SKSEpXG4gICAgICAgIC5waXBlKHRha2VVbnRpbERlc3Ryb3llZCkuc3Vic2NyaWJlKGhvdmVyaW5nUm93ID0+IHtcbiAgICAgIGlmIChob3ZlcmluZ1Jvdykge1xuICAgICAgICBpZiAoIXRoaXMub3ZlcmxheVJlZikge1xuICAgICAgICAgIHRoaXMub3ZlcmxheVJlZiA9IHRoaXMuX2NyZWF0ZU92ZXJsYXlGb3JIYW5kbGUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX3Nob3dIYW5kbGVPdmVybGF5KCk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMub3ZlcmxheVJlZikge1xuICAgICAgICAvLyB0b2RvIC0gY2FuJ3QgZGV0YWNoIGR1cmluZyBhbiBhY3RpdmUgcmVzaXplIC0gbmVlZCB0byB3b3JrIHRoYXQgb3V0XG4gICAgICAgIHRoaXMub3ZlcmxheVJlZi5kZXRhY2goKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX2xpc3RlbkZvclJlc2l6ZUV2ZW50cygpIHtcbiAgICBjb25zdCB0YWtlVW50aWxEZXN0cm95ZWQgPSB0YWtlVW50aWw8Q29sdW1uU2l6ZUFjdGlvbj4odGhpcy5kZXN0cm95ZWQpO1xuXG4gICAgbWVyZ2UoXG4gICAgICAgIHRoaXMucmVzaXplTm90aWZpZXIucmVzaXplQ2FuY2VsZWQsXG4gICAgICAgIHRoaXMucmVzaXplTm90aWZpZXIudHJpZ2dlclJlc2l6ZSxcbiAgICApLnBpcGUoXG4gICAgICAgIHRha2VVbnRpbERlc3Ryb3llZCxcbiAgICAgICAgZmlsdGVyKGNvbHVtblNpemUgPT4gY29sdW1uU2l6ZS5jb2x1bW5JZCA9PT0gdGhpcy5jb2x1bW5EZWYubmFtZSksXG4gICAgKS5zdWJzY3JpYmUoKHtzaXplLCBjb21wbGV0ZUltbWVkaWF0ZWx5fSkgPT4ge1xuICAgICAgdGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQhLmNsYXNzTGlzdC5hZGQoT1ZFUkxBWV9BQ1RJVkVfQ0xBU1MpO1xuICAgICAgdGhpcy5fYXBwbHlTaXplKHNpemUpO1xuXG4gICAgICBpZiAoY29tcGxldGVJbW1lZGlhdGVseSkge1xuICAgICAgICB0aGlzLl9jb21wbGV0ZVJlc2l6ZU9wZXJhdGlvbigpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgbWVyZ2UoXG4gICAgICAgIHRoaXMucmVzaXplTm90aWZpZXIucmVzaXplQ2FuY2VsZWQsXG4gICAgICAgIHRoaXMucmVzaXplTm90aWZpZXIucmVzaXplQ29tcGxldGVkLFxuICAgICkucGlwZSh0YWtlVW50aWxEZXN0cm95ZWQpLnN1YnNjcmliZShjb2x1bW5TaXplID0+IHtcbiAgICAgIHRoaXMuX2NsZWFuVXBBZnRlclJlc2l6ZShjb2x1bW5TaXplKTtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX2NvbXBsZXRlUmVzaXplT3BlcmF0aW9uKCk6IHZvaWQge1xuICAgIHRoaXMubmdab25lLnJ1bigoKSA9PiB7XG4gICAgICB0aGlzLnJlc2l6ZU5vdGlmaWVyLnJlc2l6ZUNvbXBsZXRlZC5uZXh0KHtcbiAgICAgICAgY29sdW1uSWQ6IHRoaXMuY29sdW1uRGVmLm5hbWUsXG4gICAgICAgIHNpemU6IHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50IS5vZmZzZXRXaWR0aCxcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfY2xlYW5VcEFmdGVyUmVzaXplKGNvbHVtblNpemU6IENvbHVtblNpemVBY3Rpb24pOiB2b2lkIHtcbiAgICB0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCEuY2xhc3NMaXN0LnJlbW92ZShPVkVSTEFZX0FDVElWRV9DTEFTUyk7XG5cbiAgICBpZiAodGhpcy5vdmVybGF5UmVmICYmIHRoaXMub3ZlcmxheVJlZi5oYXNBdHRhY2hlZCgpKSB7XG4gICAgICB0aGlzLl91cGRhdGVPdmVybGF5SGFuZGxlSGVpZ2h0KCk7XG4gICAgICB0aGlzLm92ZXJsYXlSZWYudXBkYXRlUG9zaXRpb24oKTtcblxuICAgICAgaWYgKGNvbHVtblNpemUuY29sdW1uSWQgPT09IHRoaXMuY29sdW1uRGVmLm5hbWUpIHtcbiAgICAgICAgdGhpcy5pbmxpbmVIYW5kbGUhLmZvY3VzKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfY3JlYXRlSGFuZGxlUG9ydGFsKCk6IENvbXBvbmVudFBvcnRhbDxIYW5kbGVDb21wb25lbnQ+IHtcbiAgICBjb25zdCBpbmplY3RvciA9IG5ldyBQb3J0YWxJbmplY3Rvcih0aGlzLmluamVjdG9yLCBuZXcgV2Vha01hcChbW1xuICAgICAgUmVzaXplUmVmLFxuICAgICAgbmV3IFJlc2l6ZVJlZih0aGlzLmVsZW1lbnRSZWYsIHRoaXMub3ZlcmxheVJlZiEsIHRoaXMubWluV2lkdGhQeCwgdGhpcy5tYXhXaWR0aFB4KSxcbiAgICBdXSkpO1xuICAgIHJldHVybiBuZXcgQ29tcG9uZW50UG9ydGFsKHRoaXMuZ2V0T3ZlcmxheUhhbmRsZUNvbXBvbmVudFR5cGUoKSxcbiAgICAgICAgdGhpcy52aWV3Q29udGFpbmVyUmVmLCBpbmplY3Rvcik7XG4gIH1cblxuICBwcml2YXRlIF9zaG93SGFuZGxlT3ZlcmxheSgpOiB2b2lkIHtcbiAgICB0aGlzLl91cGRhdGVPdmVybGF5SGFuZGxlSGVpZ2h0KCk7XG4gICAgdGhpcy5vdmVybGF5UmVmIS5hdHRhY2godGhpcy5fY3JlYXRlSGFuZGxlUG9ydGFsKCkpO1xuICB9XG5cbiAgcHJpdmF0ZSBfdXBkYXRlT3ZlcmxheUhhbmRsZUhlaWdodCgpIHtcbiAgICB0aGlzLm92ZXJsYXlSZWYhLnVwZGF0ZVNpemUoe2hlaWdodDogdGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQhLm9mZnNldEhlaWdodH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfYXBwbHlTaXplKHNpemVJblBpeGVsczogbnVtYmVyKTogdm9pZCB7XG4gICAgY29uc3Qgc2l6ZVRvQXBwbHkgPSBNYXRoLm1pbihNYXRoLm1heChzaXplSW5QaXhlbHMsIHRoaXMubWluV2lkdGhQeCwgMCksIHRoaXMubWF4V2lkdGhQeCk7XG5cbiAgICB0aGlzLnJlc2l6ZVN0cmF0ZWd5LmFwcGx5Q29sdW1uU2l6ZSh0aGlzLmNvbHVtbkRlZi5jc3NDbGFzc0ZyaWVuZGx5TmFtZSxcbiAgICAgICAgdGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQhLCBzaXplVG9BcHBseSk7XG4gIH1cblxuICBwcml2YXRlIF9hcHBseU1pbldpZHRoUHgoKTogdm9pZCB7XG4gICAgdGhpcy5yZXNpemVTdHJhdGVneS5hcHBseU1pbkNvbHVtblNpemUodGhpcy5jb2x1bW5EZWYuY3NzQ2xhc3NGcmllbmRseU5hbWUsXG4gICAgICAgIHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LCB0aGlzLm1pbldpZHRoUHgpO1xuICB9XG5cbiAgcHJpdmF0ZSBfYXBwbHlNYXhXaWR0aFB4KCk6IHZvaWQge1xuICAgIHRoaXMucmVzaXplU3RyYXRlZ3kuYXBwbHlNYXhDb2x1bW5TaXplKHRoaXMuY29sdW1uRGVmLmNzc0NsYXNzRnJpZW5kbHlOYW1lLFxuICAgICAgICB0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCwgdGhpcy5tYXhXaWR0aFB4KTtcbiAgfVxuXG4gIHByaXZhdGUgX2FwcGVuZElubGluZUhhbmRsZSgpOiB2b2lkIHtcbiAgICB0aGlzLmlubGluZUhhbmRsZSA9IHRoaXMuZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgdGhpcy5pbmxpbmVIYW5kbGUudGFiSW5kZXggPSAwO1xuICAgIHRoaXMuaW5saW5lSGFuZGxlLmNsYXNzTmFtZSA9IHRoaXMuZ2V0SW5saW5lSGFuZGxlQ3NzQ2xhc3NOYW1lKCk7XG5cbiAgICAvLyBUT0RPOiBBcHBseSBjb3JyZWN0IGFyaWEgcm9sZSAocHJvYmFibHkgc2xpZGVyKSBhZnRlciBhMTF5IHNwZWMgcXVlc3Rpb25zIHJlc29sdmVkLlxuXG4gICAgdGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQhLmFwcGVuZENoaWxkKHRoaXMuaW5saW5lSGFuZGxlKTtcbiAgfVxufVxuIl19