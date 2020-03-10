/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __read } from "tslib";
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
 */
var ResizeOverlayHandle = /** @class */ (function () {
    function ResizeOverlayHandle() {
        this.destroyed = new ReplaySubject();
    }
    ResizeOverlayHandle.prototype.ngAfterViewInit = function () {
        this._listenForMouseEvents();
    };
    ResizeOverlayHandle.prototype.ngOnDestroy = function () {
        this.destroyed.next();
        this.destroyed.complete();
    };
    ResizeOverlayHandle.prototype._listenForMouseEvents = function () {
        var _this = this;
        this.ngZone.runOutsideAngular(function () {
            var takeUntilDestroyed = takeUntil(_this.destroyed);
            fromEvent(_this.elementRef.nativeElement, 'mouseenter').pipe(takeUntilDestroyed, mapTo(_this.resizeRef.origin.nativeElement)).subscribe(function (cell) { return _this.eventDispatcher.headerCellHovered.next(cell); });
            fromEvent(_this.elementRef.nativeElement, 'mouseleave').pipe(takeUntilDestroyed, map(function (event) { return event.relatedTarget &&
                _closest(event.relatedTarget, HEADER_CELL_SELECTOR); })).subscribe(function (cell) { return _this.eventDispatcher.headerCellHovered.next(cell); });
            fromEvent(_this.elementRef.nativeElement, 'mousedown')
                .pipe(takeUntilDestroyed).subscribe(function (mousedownEvent) {
                _this._dragStarted(mousedownEvent);
            });
        });
    };
    ResizeOverlayHandle.prototype._dragStarted = function (mousedownEvent) {
        var _this = this;
        // Only allow dragging using the left mouse button.
        if (mousedownEvent.button !== 0) {
            return;
        }
        var mouseup = fromEvent(this.document, 'mouseup');
        var mousemove = fromEvent(this.document, 'mousemove');
        var escape = fromEvent(this.document, 'keyup')
            .pipe(filter(function (event) { return event.keyCode === ESCAPE; }));
        var startX = mousedownEvent.screenX;
        var initialOverlayOffset = this._getOverlayOffset();
        var initialSize = this._getOriginWidth();
        var overlayOffset = initialOverlayOffset;
        var originOffset = this._getOriginOffset();
        var size = initialSize;
        var overshot = 0;
        this.updateResizeActive(true);
        mouseup.pipe(takeUntil(escape), takeUntil(this.destroyed)).subscribe(function (_a) {
            var screenX = _a.screenX;
            _this._notifyResizeEnded(size, screenX !== startX);
        });
        escape.pipe(takeUntil(mouseup), takeUntil(this.destroyed)).subscribe(function () {
            _this._notifyResizeEnded(initialSize);
        });
        mousemove.pipe(map(function (_a) {
            var screenX = _a.screenX;
            return screenX;
        }), startWith(startX), distinctUntilChanged(), pairwise(), takeUntil(mouseup), takeUntil(escape), takeUntil(this.destroyed)).subscribe(function (_a) {
            var _b = __read(_a, 2), prevX = _b[0], currX = _b[1];
            var deltaX = currX - prevX;
            // If the mouse moved further than the resize was able to match, limit the
            // movement of the overlay to match the actual size and position of the origin.
            if (overshot !== 0) {
                if (overshot < 0 && deltaX < 0 || overshot > 0 && deltaX > 0) {
                    overshot += deltaX;
                    return;
                }
                else {
                    var remainingOvershot = overshot + deltaX;
                    overshot = overshot > 0 ?
                        Math.max(remainingOvershot, 0) : Math.min(remainingOvershot, 0);
                    deltaX = remainingOvershot - overshot;
                    if (deltaX === 0) {
                        return;
                    }
                }
            }
            var computedNewSize = size + (_this._isLtr() ? deltaX : -deltaX);
            computedNewSize = Math.min(Math.max(computedNewSize, _this.resizeRef.minWidthPx, 0), _this.resizeRef.maxWidthPx);
            _this.resizeNotifier.triggerResize.next({ columnId: _this.columnDef.name, size: computedNewSize });
            var originNewSize = _this._getOriginWidth();
            var originNewOffset = _this._getOriginOffset();
            var originOffsetDeltaX = originNewOffset - originOffset;
            var originSizeDeltaX = originNewSize - size;
            size = originNewSize;
            originOffset = originNewOffset;
            overshot += deltaX + (_this._isLtr() ? -originSizeDeltaX : originSizeDeltaX);
            overlayOffset += originSizeDeltaX + originOffsetDeltaX;
            _this._updateOverlayOffset(overlayOffset);
        });
    };
    ResizeOverlayHandle.prototype.updateResizeActive = function (active) {
        this.eventDispatcher.overlayHandleActiveForCell.next(active ? this.resizeRef.origin.nativeElement : null);
    };
    ResizeOverlayHandle.prototype._getOriginWidth = function () {
        return this.resizeRef.origin.nativeElement.offsetWidth;
    };
    ResizeOverlayHandle.prototype._getOriginOffset = function () {
        var originElement = this.resizeRef.origin.nativeElement;
        var offsetLeft = originElement.offsetLeft;
        return this._isLtr() ?
            offsetLeft :
            originElement.offsetParent.offsetWidth - (offsetLeft + this._getOriginWidth());
    };
    ResizeOverlayHandle.prototype._getOverlayOffset = function () {
        var overlayElement = this.resizeRef.overlayRef.overlayElement;
        return this._isLtr() ?
            parseInt(overlayElement.style.left, 10) : parseInt(overlayElement.style.right, 10);
    };
    ResizeOverlayHandle.prototype._updateOverlayOffset = function (offset) {
        var overlayElement = this.resizeRef.overlayRef.overlayElement;
        var overlayOffsetCssValue = coerceCssPixelValue(offset);
        if (this._isLtr()) {
            overlayElement.style.left = overlayOffsetCssValue;
        }
        else {
            overlayElement.style.right = overlayOffsetCssValue;
        }
    };
    ResizeOverlayHandle.prototype._isLtr = function () {
        return this.directionality.value === 'ltr';
    };
    ResizeOverlayHandle.prototype._notifyResizeEnded = function (size, completedSuccessfully) {
        var _this = this;
        if (completedSuccessfully === void 0) { completedSuccessfully = false; }
        this.updateResizeActive(false);
        this.ngZone.run(function () {
            var sizeMessage = { columnId: _this.columnDef.name, size: size };
            if (completedSuccessfully) {
                _this.resizeNotifier.resizeCompleted.next(sizeMessage);
            }
            else {
                _this.resizeNotifier.resizeCanceled.next(sizeMessage);
            }
        });
    };
    ResizeOverlayHandle.decorators = [
        { type: Directive }
    ];
    return ResizeOverlayHandle;
}());
export { ResizeOverlayHandle };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3ZlcmxheS1oYW5kbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrLWV4cGVyaW1lbnRhbC9jb2x1bW4tcmVzaXplL292ZXJsYXktaGFuZGxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFFSCxPQUFPLEVBQWdCLFNBQVMsRUFBZ0MsTUFBTSxlQUFlLENBQUM7QUFDdEYsT0FBTyxFQUFDLG1CQUFtQixFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFFMUQsT0FBTyxFQUFDLE1BQU0sRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBRTdDLE9BQU8sRUFBQyxTQUFTLEVBQUUsYUFBYSxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQzlDLE9BQU8sRUFDTCxvQkFBb0IsRUFDcEIsTUFBTSxFQUNOLEdBQUcsRUFDSCxLQUFLLEVBQ0wsUUFBUSxFQUNSLFNBQVMsRUFDVCxTQUFTLEdBQ1YsTUFBTSxnQkFBZ0IsQ0FBQztBQUV4QixPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sd0NBQXdDLENBQUM7QUFFaEUsT0FBTyxFQUFDLG9CQUFvQixFQUFDLE1BQU0sYUFBYSxDQUFDO0FBS2pELDJFQUEyRTtBQUMzRSxtRkFBbUY7QUFDbkY7OztHQUdHO0FBQ0g7SUFBQTtRQUVxQixjQUFTLEdBQUcsSUFBSSxhQUFhLEVBQVEsQ0FBQztJQTZLM0QsQ0FBQztJQWxLQyw2Q0FBZSxHQUFmO1FBQ0UsSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7SUFDL0IsQ0FBQztJQUVELHlDQUFXLEdBQVg7UUFDRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3RCLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDNUIsQ0FBQztJQUVPLG1EQUFxQixHQUE3QjtRQUFBLGlCQW9CQztRQW5CQyxJQUFJLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDO1lB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QyxNQUFNLENBQUMsQ0FBQztRQUUxRCxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFBRTtZQUNqQixjQUFjLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxxQkFBcUIsQ0FBQztTQUNuRDthQUFNO1lBQ0wsY0FBYyxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcscUJBQXFCLENBQUM7U0FDcEQ7SUFDSCxDQUFDO0lBRU8sb0NBQU0sR0FBZDtRQUNFLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEtBQUssS0FBSyxDQUFDO0lBQzdDLENBQUM7SUFFTyxnREFBa0IsR0FBMUIsVUFBMkIsSUFBWSxFQUFFLHFCQUE2QjtRQUF0RSxpQkFXQztRQVh3QyxzQ0FBQSxFQUFBLDZCQUE2QjtRQUNwRSxJQUFJLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFL0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUM7WUFDZCxJQUFNLFdBQVcsR0FBRyxFQUFDLFFBQVEsRUFBRSxLQUFJLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxJQUFJLE1BQUEsRUFBQyxDQUFDO1lBQzFELElBQUkscUJBQXFCLEVBQUU7Z0JBQ3pCLEtBQUksQ0FBQyxjQUFjLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQzthQUN2RDtpQkFBTTtnQkFDTCxLQUFJLENBQUMsY0FBYyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7YUFDdEQ7UUFDSCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7O2dCQTlLRixTQUFTOztJQStLViwwQkFBQztDQUFBLEFBL0tELElBK0tDO1NBOUtxQixtQkFBbUIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtBZnRlclZpZXdJbml0LCBEaXJlY3RpdmUsIEVsZW1lbnRSZWYsIE9uRGVzdHJveSwgTmdab25lfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7Y29lcmNlQ3NzUGl4ZWxWYWx1ZX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvZXJjaW9uJztcbmltcG9ydCB7RGlyZWN0aW9uYWxpdHl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9iaWRpJztcbmltcG9ydCB7RVNDQVBFfSBmcm9tICdAYW5ndWxhci9jZGsva2V5Y29kZXMnO1xuaW1wb3J0IHtDZGtDb2x1bW5EZWZ9IGZyb20gJ0Bhbmd1bGFyL2Nkay90YWJsZSc7XG5pbXBvcnQge2Zyb21FdmVudCwgUmVwbGF5U3ViamVjdH0gZnJvbSAncnhqcyc7XG5pbXBvcnQge1xuICBkaXN0aW5jdFVudGlsQ2hhbmdlZCxcbiAgZmlsdGVyLFxuICBtYXAsXG4gIG1hcFRvLFxuICBwYWlyd2lzZSxcbiAgc3RhcnRXaXRoLFxuICB0YWtlVW50aWwsXG59IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcblxuaW1wb3J0IHtfY2xvc2VzdH0gZnJvbSAnQGFuZ3VsYXIvY2RrLWV4cGVyaW1lbnRhbC9wb3BvdmVyLWVkaXQnO1xuXG5pbXBvcnQge0hFQURFUl9DRUxMX1NFTEVDVE9SfSBmcm9tICcuL3NlbGVjdG9ycyc7XG5pbXBvcnQge0NvbHVtblJlc2l6ZU5vdGlmaWVyU291cmNlfSBmcm9tICcuL2NvbHVtbi1yZXNpemUtbm90aWZpZXInO1xuaW1wb3J0IHtIZWFkZXJSb3dFdmVudERpc3BhdGNoZXJ9IGZyb20gJy4vZXZlbnQtZGlzcGF0Y2hlcic7XG5pbXBvcnQge1Jlc2l6ZVJlZn0gZnJvbSAnLi9yZXNpemUtcmVmJztcblxuLy8gVE9ETzogVGFrZSBhbm90aGVyIGxvb2sgYXQgdXNpbmcgY2RrIGRyYWcgZHJvcC4gSUlSQyBJIHJhbiBpbnRvIGEgY291cGxlXG4vLyBnb29kIHJlYXNvbnMgZm9yIG5vdCB1c2luZyBpdCBidXQgSSBkb24ndCByZW1lbWJlciB3aGF0IHRoZXkgd2VyZSBhdCB0aGlzIHBvaW50LlxuLyoqXG4gKiBCYXNlIGNsYXNzIGZvciBhIGNvbXBvbmVudCBzaG93biBvdmVyIHRoZSBlZGdlIG9mIGEgcmVzaXphYmxlIGNvbHVtbiB0aGF0IGlzIHJlc3BvbnNpYmxlXG4gKiBmb3IgaGFuZGxpbmcgY29sdW1uIHJlc2l6ZSBtb3VzZSBldmVudHMgYW5kIGRpc3BsYXlpbmcgYW55IHZpc2libGUgVUkgb24gdGhlIGNvbHVtbiBlZGdlLlxuICovXG5ARGlyZWN0aXZlKClcbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBSZXNpemVPdmVybGF5SGFuZGxlIGltcGxlbWVudHMgQWZ0ZXJWaWV3SW5pdCwgT25EZXN0cm95IHtcbiAgcHJvdGVjdGVkIHJlYWRvbmx5IGRlc3Ryb3llZCA9IG5ldyBSZXBsYXlTdWJqZWN0PHZvaWQ+KCk7XG5cbiAgcHJvdGVjdGVkIGFic3RyYWN0IHJlYWRvbmx5IGNvbHVtbkRlZjogQ2RrQ29sdW1uRGVmO1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgcmVhZG9ubHkgZG9jdW1lbnQ6IERvY3VtZW50O1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgcmVhZG9ubHkgZGlyZWN0aW9uYWxpdHk6IERpcmVjdGlvbmFsaXR5O1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgcmVhZG9ubHkgZWxlbWVudFJlZjogRWxlbWVudFJlZjtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IHJlYWRvbmx5IGV2ZW50RGlzcGF0Y2hlcjogSGVhZGVyUm93RXZlbnREaXNwYXRjaGVyO1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgcmVhZG9ubHkgbmdab25lOiBOZ1pvbmU7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCByZWFkb25seSByZXNpemVOb3RpZmllcjogQ29sdW1uUmVzaXplTm90aWZpZXJTb3VyY2U7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCByZWFkb25seSByZXNpemVSZWY6IFJlc2l6ZVJlZjtcblxuICBuZ0FmdGVyVmlld0luaXQoKSB7XG4gICAgdGhpcy5fbGlzdGVuRm9yTW91c2VFdmVudHMoKTtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIHRoaXMuZGVzdHJveWVkLm5leHQoKTtcbiAgICB0aGlzLmRlc3Ryb3llZC5jb21wbGV0ZSgpO1xuICB9XG5cbiAgcHJpdmF0ZSBfbGlzdGVuRm9yTW91c2VFdmVudHMoKSB7XG4gICAgdGhpcy5uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgY29uc3QgdGFrZVVudGlsRGVzdHJveWVkID0gdGFrZVVudGlsPE1vdXNlRXZlbnQ+KHRoaXMuZGVzdHJveWVkKTtcblxuICAgICAgZnJvbUV2ZW50PE1vdXNlRXZlbnQ+KHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50ISwgJ21vdXNlZW50ZXInKS5waXBlKFxuICAgICAgICAgIHRha2VVbnRpbERlc3Ryb3llZCxcbiAgICAgICAgICBtYXBUbyh0aGlzLnJlc2l6ZVJlZi5vcmlnaW4ubmF0aXZlRWxlbWVudCEpLFxuICAgICAgKS5zdWJzY3JpYmUoY2VsbCA9PiB0aGlzLmV2ZW50RGlzcGF0Y2hlci5oZWFkZXJDZWxsSG92ZXJlZC5uZXh0KGNlbGwpKTtcblxuICAgICAgZnJvbUV2ZW50PE1vdXNlRXZlbnQ+KHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50ISwgJ21vdXNlbGVhdmUnKS5waXBlKFxuICAgICAgICAgIHRha2VVbnRpbERlc3Ryb3llZCxcbiAgICAgICAgICBtYXAoZXZlbnQgPT4gZXZlbnQucmVsYXRlZFRhcmdldCAmJlxuICAgICAgICAgICAgICBfY2xvc2VzdChldmVudC5yZWxhdGVkVGFyZ2V0IGFzIEVsZW1lbnQsIEhFQURFUl9DRUxMX1NFTEVDVE9SKSksXG4gICAgICApLnN1YnNjcmliZShjZWxsID0+IHRoaXMuZXZlbnREaXNwYXRjaGVyLmhlYWRlckNlbGxIb3ZlcmVkLm5leHQoY2VsbCkpO1xuXG4gICAgICBmcm9tRXZlbnQ8TW91c2VFdmVudD4odGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQhLCAnbW91c2Vkb3duJylcbiAgICAgICAgICAucGlwZSh0YWtlVW50aWxEZXN0cm95ZWQpLnN1YnNjcmliZShtb3VzZWRvd25FdmVudCA9PiB7XG4gICAgICAgIHRoaXMuX2RyYWdTdGFydGVkKG1vdXNlZG93bkV2ZW50KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfZHJhZ1N0YXJ0ZWQobW91c2Vkb3duRXZlbnQ6IE1vdXNlRXZlbnQpIHtcbiAgICAvLyBPbmx5IGFsbG93IGRyYWdnaW5nIHVzaW5nIHRoZSBsZWZ0IG1vdXNlIGJ1dHRvbi5cbiAgICBpZiAobW91c2Vkb3duRXZlbnQuYnV0dG9uICE9PSAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgbW91c2V1cCA9IGZyb21FdmVudDxNb3VzZUV2ZW50Pih0aGlzLmRvY3VtZW50LCAnbW91c2V1cCcpO1xuICAgIGNvbnN0IG1vdXNlbW92ZSA9IGZyb21FdmVudDxNb3VzZUV2ZW50Pih0aGlzLmRvY3VtZW50LCAnbW91c2Vtb3ZlJyk7XG4gICAgY29uc3QgZXNjYXBlID0gZnJvbUV2ZW50PEtleWJvYXJkRXZlbnQ+KHRoaXMuZG9jdW1lbnQsICdrZXl1cCcpXG4gICAgICAgIC5waXBlKGZpbHRlcihldmVudCA9PiBldmVudC5rZXlDb2RlID09PSBFU0NBUEUpKTtcblxuICAgIGNvbnN0IHN0YXJ0WCA9IG1vdXNlZG93bkV2ZW50LnNjcmVlblg7XG5cbiAgICBjb25zdCBpbml0aWFsT3ZlcmxheU9mZnNldCA9IHRoaXMuX2dldE92ZXJsYXlPZmZzZXQoKTtcbiAgICBjb25zdCBpbml0aWFsU2l6ZSA9IHRoaXMuX2dldE9yaWdpbldpZHRoKCk7XG4gICAgbGV0IG92ZXJsYXlPZmZzZXQgPSBpbml0aWFsT3ZlcmxheU9mZnNldDtcbiAgICBsZXQgb3JpZ2luT2Zmc2V0ID0gdGhpcy5fZ2V0T3JpZ2luT2Zmc2V0KCk7XG4gICAgbGV0IHNpemUgPSBpbml0aWFsU2l6ZTtcbiAgICBsZXQgb3ZlcnNob3QgPSAwO1xuXG4gICAgdGhpcy51cGRhdGVSZXNpemVBY3RpdmUodHJ1ZSk7XG5cbiAgICBtb3VzZXVwLnBpcGUodGFrZVVudGlsKGVzY2FwZSksIHRha2VVbnRpbCh0aGlzLmRlc3Ryb3llZCkpLnN1YnNjcmliZSgoe3NjcmVlblh9KSA9PiB7XG4gICAgICB0aGlzLl9ub3RpZnlSZXNpemVFbmRlZChzaXplLCBzY3JlZW5YICE9PSBzdGFydFgpO1xuICAgIH0pO1xuXG4gICAgZXNjYXBlLnBpcGUodGFrZVVudGlsKG1vdXNldXApLCB0YWtlVW50aWwodGhpcy5kZXN0cm95ZWQpKS5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgdGhpcy5fbm90aWZ5UmVzaXplRW5kZWQoaW5pdGlhbFNpemUpO1xuICAgIH0pO1xuXG4gICAgbW91c2Vtb3ZlLnBpcGUoXG4gICAgICAgIG1hcCgoe3NjcmVlblh9KSA9PiBzY3JlZW5YKSxcbiAgICAgICAgc3RhcnRXaXRoKHN0YXJ0WCksXG4gICAgICAgIGRpc3RpbmN0VW50aWxDaGFuZ2VkKCksXG4gICAgICAgIHBhaXJ3aXNlKCksXG4gICAgICAgIHRha2VVbnRpbChtb3VzZXVwKSxcbiAgICAgICAgdGFrZVVudGlsKGVzY2FwZSksXG4gICAgICAgIHRha2VVbnRpbCh0aGlzLmRlc3Ryb3llZCksXG4gICAgKS5zdWJzY3JpYmUoKFtwcmV2WCwgY3VyclhdKSA9PiB7XG4gICAgICBsZXQgZGVsdGFYID0gY3VyclggLSBwcmV2WDtcblxuICAgICAgLy8gSWYgdGhlIG1vdXNlIG1vdmVkIGZ1cnRoZXIgdGhhbiB0aGUgcmVzaXplIHdhcyBhYmxlIHRvIG1hdGNoLCBsaW1pdCB0aGVcbiAgICAgIC8vIG1vdmVtZW50IG9mIHRoZSBvdmVybGF5IHRvIG1hdGNoIHRoZSBhY3R1YWwgc2l6ZSBhbmQgcG9zaXRpb24gb2YgdGhlIG9yaWdpbi5cbiAgICAgIGlmIChvdmVyc2hvdCAhPT0gMCkge1xuICAgICAgICBpZiAob3ZlcnNob3QgPCAwICYmIGRlbHRhWCA8IDAgfHwgb3ZlcnNob3QgPiAwICYmIGRlbHRhWCA+IDApIHtcbiAgICAgICAgICBvdmVyc2hvdCArPSBkZWx0YVg7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnN0IHJlbWFpbmluZ092ZXJzaG90ID0gb3ZlcnNob3QgKyBkZWx0YVg7XG4gICAgICAgICAgb3ZlcnNob3QgPSBvdmVyc2hvdCA+IDAgP1xuICAgICAgICAgICAgICBNYXRoLm1heChyZW1haW5pbmdPdmVyc2hvdCwgMCkgOiBNYXRoLm1pbihyZW1haW5pbmdPdmVyc2hvdCwgMCk7XG4gICAgICAgICAgZGVsdGFYID0gcmVtYWluaW5nT3ZlcnNob3QgLSBvdmVyc2hvdDtcblxuICAgICAgICAgIGlmIChkZWx0YVggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgbGV0IGNvbXB1dGVkTmV3U2l6ZTogbnVtYmVyID0gc2l6ZSArICh0aGlzLl9pc0x0cigpID8gZGVsdGFYIDogLWRlbHRhWCk7XG4gICAgICBjb21wdXRlZE5ld1NpemUgPSBNYXRoLm1pbihcbiAgICAgICAgICBNYXRoLm1heChjb21wdXRlZE5ld1NpemUsIHRoaXMucmVzaXplUmVmLm1pbldpZHRoUHgsIDApLCB0aGlzLnJlc2l6ZVJlZi5tYXhXaWR0aFB4KTtcblxuICAgICAgdGhpcy5yZXNpemVOb3RpZmllci50cmlnZ2VyUmVzaXplLm5leHQoXG4gICAgICAgICAge2NvbHVtbklkOiB0aGlzLmNvbHVtbkRlZi5uYW1lLCBzaXplOiBjb21wdXRlZE5ld1NpemV9KTtcblxuICAgICAgY29uc3Qgb3JpZ2luTmV3U2l6ZSA9IHRoaXMuX2dldE9yaWdpbldpZHRoKCk7XG4gICAgICBjb25zdCBvcmlnaW5OZXdPZmZzZXQgPSB0aGlzLl9nZXRPcmlnaW5PZmZzZXQoKTtcbiAgICAgIGNvbnN0IG9yaWdpbk9mZnNldERlbHRhWCA9IG9yaWdpbk5ld09mZnNldCAtIG9yaWdpbk9mZnNldDtcbiAgICAgIGNvbnN0IG9yaWdpblNpemVEZWx0YVggPSBvcmlnaW5OZXdTaXplIC0gc2l6ZTtcbiAgICAgIHNpemUgPSBvcmlnaW5OZXdTaXplO1xuICAgICAgb3JpZ2luT2Zmc2V0ID0gb3JpZ2luTmV3T2Zmc2V0O1xuXG4gICAgICBvdmVyc2hvdCArPSBkZWx0YVggKyAodGhpcy5faXNMdHIoKSA/IC1vcmlnaW5TaXplRGVsdGFYIDogb3JpZ2luU2l6ZURlbHRhWCk7XG4gICAgICBvdmVybGF5T2Zmc2V0ICs9IG9yaWdpblNpemVEZWx0YVggKyBvcmlnaW5PZmZzZXREZWx0YVg7XG5cbiAgICAgIHRoaXMuX3VwZGF0ZU92ZXJsYXlPZmZzZXQob3ZlcmxheU9mZnNldCk7XG4gICAgfSk7XG4gIH1cblxuICBwcm90ZWN0ZWQgdXBkYXRlUmVzaXplQWN0aXZlKGFjdGl2ZTogYm9vbGVhbik6IHZvaWQge1xuICAgIHRoaXMuZXZlbnREaXNwYXRjaGVyLm92ZXJsYXlIYW5kbGVBY3RpdmVGb3JDZWxsLm5leHQoXG4gICAgICAgIGFjdGl2ZSA/IHRoaXMucmVzaXplUmVmLm9yaWdpbi5uYXRpdmVFbGVtZW50ISA6IG51bGwpO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0T3JpZ2luV2lkdGgoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5yZXNpemVSZWYub3JpZ2luLm5hdGl2ZUVsZW1lbnQhLm9mZnNldFdpZHRoO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0T3JpZ2luT2Zmc2V0KCk6IG51bWJlciB7XG4gICAgY29uc3Qgb3JpZ2luRWxlbWVudCA9IHRoaXMucmVzaXplUmVmLm9yaWdpbi5uYXRpdmVFbGVtZW50ITtcbiAgICBjb25zdCBvZmZzZXRMZWZ0ID0gb3JpZ2luRWxlbWVudC5vZmZzZXRMZWZ0O1xuXG4gICAgcmV0dXJuIHRoaXMuX2lzTHRyKCkgP1xuICAgICAgICBvZmZzZXRMZWZ0IDpcbiAgICAgICAgb3JpZ2luRWxlbWVudC5vZmZzZXRQYXJlbnQhLm9mZnNldFdpZHRoIC0gKG9mZnNldExlZnQgKyB0aGlzLl9nZXRPcmlnaW5XaWR0aCgpKTtcbiAgfVxuXG4gIHByaXZhdGUgX2dldE92ZXJsYXlPZmZzZXQoKTogbnVtYmVyIHtcbiAgICBjb25zdCBvdmVybGF5RWxlbWVudCA9IHRoaXMucmVzaXplUmVmLm92ZXJsYXlSZWYub3ZlcmxheUVsZW1lbnQ7XG4gICAgcmV0dXJuIHRoaXMuX2lzTHRyKCkgP1xuICAgICAgICBwYXJzZUludChvdmVybGF5RWxlbWVudC5zdHlsZS5sZWZ0ISwgMTApIDogcGFyc2VJbnQob3ZlcmxheUVsZW1lbnQuc3R5bGUucmlnaHQhLCAxMCk7XG4gIH1cblxuICBwcml2YXRlIF91cGRhdGVPdmVybGF5T2Zmc2V0KG9mZnNldDogbnVtYmVyKTogdm9pZCB7XG4gICAgY29uc3Qgb3ZlcmxheUVsZW1lbnQgPSB0aGlzLnJlc2l6ZVJlZi5vdmVybGF5UmVmLm92ZXJsYXlFbGVtZW50O1xuICAgIGNvbnN0IG92ZXJsYXlPZmZzZXRDc3NWYWx1ZSA9IGNvZXJjZUNzc1BpeGVsVmFsdWUob2Zmc2V0KTtcblxuICAgIGlmICh0aGlzLl9pc0x0cigpKSB7XG4gICAgICBvdmVybGF5RWxlbWVudC5zdHlsZS5sZWZ0ID0gb3ZlcmxheU9mZnNldENzc1ZhbHVlO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdmVybGF5RWxlbWVudC5zdHlsZS5yaWdodCA9IG92ZXJsYXlPZmZzZXRDc3NWYWx1ZTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9pc0x0cigpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5kaXJlY3Rpb25hbGl0eS52YWx1ZSA9PT0gJ2x0cic7XG4gIH1cblxuICBwcml2YXRlIF9ub3RpZnlSZXNpemVFbmRlZChzaXplOiBudW1iZXIsIGNvbXBsZXRlZFN1Y2Nlc3NmdWxseSA9IGZhbHNlKTogdm9pZCB7XG4gICAgdGhpcy51cGRhdGVSZXNpemVBY3RpdmUoZmFsc2UpO1xuXG4gICAgdGhpcy5uZ1pvbmUucnVuKCgpID0+IHtcbiAgICAgIGNvbnN0IHNpemVNZXNzYWdlID0ge2NvbHVtbklkOiB0aGlzLmNvbHVtbkRlZi5uYW1lLCBzaXplfTtcbiAgICAgIGlmIChjb21wbGV0ZWRTdWNjZXNzZnVsbHkpIHtcbiAgICAgICAgdGhpcy5yZXNpemVOb3RpZmllci5yZXNpemVDb21wbGV0ZWQubmV4dChzaXplTWVzc2FnZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnJlc2l6ZU5vdGlmaWVyLnJlc2l6ZUNhbmNlbGVkLm5leHQoc2l6ZU1lc3NhZ2UpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG59XG4iXX0=