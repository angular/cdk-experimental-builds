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
        var initialSize = this._getOriginWidth();
        var overlayOffset = this._getOverlayOffset();
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
            _this.resizeNotifier.triggerResize.next({ columnId: _this.columnDef.name, size: computedNewSize, previousSize: size });
            var originNewSize = _this._getOriginWidth();
            var originNewOffset = _this._getOriginOffset();
            var originOffsetDeltaX = originNewOffset - originOffset;
            var originSizeDeltaX = originNewSize - size;
            size = originNewSize;
            originOffset = originNewOffset;
            overshot += deltaX + (_this._isLtr() ? -originSizeDeltaX : originSizeDeltaX);
            overlayOffset += originOffsetDeltaX + (_this._isLtr() ? originSizeDeltaX : 0);
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
        return this.resizeRef.origin.nativeElement.offsetLeft;
    };
    ResizeOverlayHandle.prototype._getOverlayOffset = function () {
        return parseInt(this.resizeRef.overlayRef.overlayElement.style.left, 10);
    };
    ResizeOverlayHandle.prototype._updateOverlayOffset = function (offset) {
        this.resizeRef.overlayRef.overlayElement.style.left = coerceCssPixelValue(offset);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3ZlcmxheS1oYW5kbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrLWV4cGVyaW1lbnRhbC9jb2x1bW4tcmVzaXplL292ZXJsYXktaGFuZGxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFFSCxPQUFPLEVBQWdCLFNBQVMsRUFBZ0MsTUFBTSxlQUFlLENBQUM7QUFDdEYsT0FBTyxFQUFDLG1CQUFtQixFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFFMUQsT0FBTyxFQUFDLE1BQU0sRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBRTdDLE9BQU8sRUFBQyxTQUFTLEVBQUUsYUFBYSxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQzlDLE9BQU8sRUFDTCxvQkFBb0IsRUFDcEIsTUFBTSxFQUNOLEdBQUcsRUFDSCxLQUFLLEVBQ0wsUUFBUSxFQUNSLFNBQVMsRUFDVCxTQUFTLEdBQ1YsTUFBTSxnQkFBZ0IsQ0FBQztBQUV4QixPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sd0NBQXdDLENBQUM7QUFFaEUsT0FBTyxFQUFDLG9CQUFvQixFQUFDLE1BQU0sYUFBYSxDQUFDO0FBS2pELDJFQUEyRTtBQUMzRSxtRkFBbUY7QUFDbkY7OztHQUdHO0FBQ0g7SUFBQTtRQUVxQixjQUFTLEdBQUcsSUFBSSxhQUFhLEVBQVEsQ0FBQztJQThKM0QsQ0FBQztJQW5KQyw2Q0FBZSxHQUFmO1FBQ0UsSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7SUFDL0IsQ0FBQztJQUVELHlDQUFXLEdBQVg7UUFDRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3RCLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDNUIsQ0FBQztJQUVPLG1EQUFxQixHQUE3QjtRQUFBLGlCQW9CQztRQW5CQyxJQUFJLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDO1lB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QUMsUUFBUSxFQUFFLEtBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLElBQUksTUFBQSxFQUFDLENBQUM7WUFDMUQsSUFBSSxxQkFBcUIsRUFBRTtnQkFDekIsS0FBSSxDQUFDLGNBQWMsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO2FBQ3ZEO2lCQUFNO2dCQUNMLEtBQUksQ0FBQyxjQUFjLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQzthQUN0RDtRQUNILENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQzs7Z0JBL0pGLFNBQVM7O0lBZ0tWLDBCQUFDO0NBQUEsQUFoS0QsSUFnS0M7U0EvSnFCLG1CQUFtQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0FmdGVyVmlld0luaXQsIERpcmVjdGl2ZSwgRWxlbWVudFJlZiwgT25EZXN0cm95LCBOZ1pvbmV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtjb2VyY2VDc3NQaXhlbFZhbHVlfSBmcm9tICdAYW5ndWxhci9jZGsvY29lcmNpb24nO1xuaW1wb3J0IHtEaXJlY3Rpb25hbGl0eX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2JpZGknO1xuaW1wb3J0IHtFU0NBUEV9IGZyb20gJ0Bhbmd1bGFyL2Nkay9rZXljb2Rlcyc7XG5pbXBvcnQge0Nka0NvbHVtbkRlZn0gZnJvbSAnQGFuZ3VsYXIvY2RrL3RhYmxlJztcbmltcG9ydCB7ZnJvbUV2ZW50LCBSZXBsYXlTdWJqZWN0fSBmcm9tICdyeGpzJztcbmltcG9ydCB7XG4gIGRpc3RpbmN0VW50aWxDaGFuZ2VkLFxuICBmaWx0ZXIsXG4gIG1hcCxcbiAgbWFwVG8sXG4gIHBhaXJ3aXNlLFxuICBzdGFydFdpdGgsXG4gIHRha2VVbnRpbCxcbn0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuXG5pbXBvcnQge19jbG9zZXN0fSBmcm9tICdAYW5ndWxhci9jZGstZXhwZXJpbWVudGFsL3BvcG92ZXItZWRpdCc7XG5cbmltcG9ydCB7SEVBREVSX0NFTExfU0VMRUNUT1J9IGZyb20gJy4vc2VsZWN0b3JzJztcbmltcG9ydCB7Q29sdW1uUmVzaXplTm90aWZpZXJTb3VyY2V9IGZyb20gJy4vY29sdW1uLXJlc2l6ZS1ub3RpZmllcic7XG5pbXBvcnQge0hlYWRlclJvd0V2ZW50RGlzcGF0Y2hlcn0gZnJvbSAnLi9ldmVudC1kaXNwYXRjaGVyJztcbmltcG9ydCB7UmVzaXplUmVmfSBmcm9tICcuL3Jlc2l6ZS1yZWYnO1xuXG4vLyBUT0RPOiBUYWtlIGFub3RoZXIgbG9vayBhdCB1c2luZyBjZGsgZHJhZyBkcm9wLiBJSVJDIEkgcmFuIGludG8gYSBjb3VwbGVcbi8vIGdvb2QgcmVhc29ucyBmb3Igbm90IHVzaW5nIGl0IGJ1dCBJIGRvbid0IHJlbWVtYmVyIHdoYXQgdGhleSB3ZXJlIGF0IHRoaXMgcG9pbnQuXG4vKipcbiAqIEJhc2UgY2xhc3MgZm9yIGEgY29tcG9uZW50IHNob3duIG92ZXIgdGhlIGVkZ2Ugb2YgYSByZXNpemFibGUgY29sdW1uIHRoYXQgaXMgcmVzcG9uc2libGVcbiAqIGZvciBoYW5kbGluZyBjb2x1bW4gcmVzaXplIG1vdXNlIGV2ZW50cyBhbmQgZGlzcGxheWluZyBhbnkgdmlzaWJsZSBVSSBvbiB0aGUgY29sdW1uIGVkZ2UuXG4gKi9cbkBEaXJlY3RpdmUoKVxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFJlc2l6ZU92ZXJsYXlIYW5kbGUgaW1wbGVtZW50cyBBZnRlclZpZXdJbml0LCBPbkRlc3Ryb3kge1xuICBwcm90ZWN0ZWQgcmVhZG9ubHkgZGVzdHJveWVkID0gbmV3IFJlcGxheVN1YmplY3Q8dm9pZD4oKTtcblxuICBwcm90ZWN0ZWQgYWJzdHJhY3QgcmVhZG9ubHkgY29sdW1uRGVmOiBDZGtDb2x1bW5EZWY7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCByZWFkb25seSBkb2N1bWVudDogRG9jdW1lbnQ7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCByZWFkb25seSBkaXJlY3Rpb25hbGl0eTogRGlyZWN0aW9uYWxpdHk7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCByZWFkb25seSBlbGVtZW50UmVmOiBFbGVtZW50UmVmO1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgcmVhZG9ubHkgZXZlbnREaXNwYXRjaGVyOiBIZWFkZXJSb3dFdmVudERpc3BhdGNoZXI7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCByZWFkb25seSBuZ1pvbmU6IE5nWm9uZTtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IHJlYWRvbmx5IHJlc2l6ZU5vdGlmaWVyOiBDb2x1bW5SZXNpemVOb3RpZmllclNvdXJjZTtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IHJlYWRvbmx5IHJlc2l6ZVJlZjogUmVzaXplUmVmO1xuXG4gIG5nQWZ0ZXJWaWV3SW5pdCgpIHtcbiAgICB0aGlzLl9saXN0ZW5Gb3JNb3VzZUV2ZW50cygpO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgdGhpcy5kZXN0cm95ZWQubmV4dCgpO1xuICAgIHRoaXMuZGVzdHJveWVkLmNvbXBsZXRlKCk7XG4gIH1cblxuICBwcml2YXRlIF9saXN0ZW5Gb3JNb3VzZUV2ZW50cygpIHtcbiAgICB0aGlzLm5nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgICBjb25zdCB0YWtlVW50aWxEZXN0cm95ZWQgPSB0YWtlVW50aWw8TW91c2VFdmVudD4odGhpcy5kZXN0cm95ZWQpO1xuXG4gICAgICBmcm9tRXZlbnQ8TW91c2VFdmVudD4odGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQhLCAnbW91c2VlbnRlcicpLnBpcGUoXG4gICAgICAgICAgdGFrZVVudGlsRGVzdHJveWVkLFxuICAgICAgICAgIG1hcFRvKHRoaXMucmVzaXplUmVmLm9yaWdpbi5uYXRpdmVFbGVtZW50ISksXG4gICAgICApLnN1YnNjcmliZShjZWxsID0+IHRoaXMuZXZlbnREaXNwYXRjaGVyLmhlYWRlckNlbGxIb3ZlcmVkLm5leHQoY2VsbCkpO1xuXG4gICAgICBmcm9tRXZlbnQ8TW91c2VFdmVudD4odGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQhLCAnbW91c2VsZWF2ZScpLnBpcGUoXG4gICAgICAgICAgdGFrZVVudGlsRGVzdHJveWVkLFxuICAgICAgICAgIG1hcChldmVudCA9PiBldmVudC5yZWxhdGVkVGFyZ2V0ICYmXG4gICAgICAgICAgICAgIF9jbG9zZXN0KGV2ZW50LnJlbGF0ZWRUYXJnZXQgYXMgRWxlbWVudCwgSEVBREVSX0NFTExfU0VMRUNUT1IpKSxcbiAgICAgICkuc3Vic2NyaWJlKGNlbGwgPT4gdGhpcy5ldmVudERpc3BhdGNoZXIuaGVhZGVyQ2VsbEhvdmVyZWQubmV4dChjZWxsKSk7XG5cbiAgICAgIGZyb21FdmVudDxNb3VzZUV2ZW50Pih0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCEsICdtb3VzZWRvd24nKVxuICAgICAgICAgIC5waXBlKHRha2VVbnRpbERlc3Ryb3llZCkuc3Vic2NyaWJlKG1vdXNlZG93bkV2ZW50ID0+IHtcbiAgICAgICAgdGhpcy5fZHJhZ1N0YXJ0ZWQobW91c2Vkb3duRXZlbnQpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIF9kcmFnU3RhcnRlZChtb3VzZWRvd25FdmVudDogTW91c2VFdmVudCkge1xuICAgIC8vIE9ubHkgYWxsb3cgZHJhZ2dpbmcgdXNpbmcgdGhlIGxlZnQgbW91c2UgYnV0dG9uLlxuICAgIGlmIChtb3VzZWRvd25FdmVudC5idXR0b24gIT09IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBtb3VzZXVwID0gZnJvbUV2ZW50PE1vdXNlRXZlbnQ+KHRoaXMuZG9jdW1lbnQsICdtb3VzZXVwJyk7XG4gICAgY29uc3QgbW91c2Vtb3ZlID0gZnJvbUV2ZW50PE1vdXNlRXZlbnQ+KHRoaXMuZG9jdW1lbnQsICdtb3VzZW1vdmUnKTtcbiAgICBjb25zdCBlc2NhcGUgPSBmcm9tRXZlbnQ8S2V5Ym9hcmRFdmVudD4odGhpcy5kb2N1bWVudCwgJ2tleXVwJylcbiAgICAgICAgLnBpcGUoZmlsdGVyKGV2ZW50ID0+IGV2ZW50LmtleUNvZGUgPT09IEVTQ0FQRSkpO1xuXG4gICAgY29uc3Qgc3RhcnRYID0gbW91c2Vkb3duRXZlbnQuc2NyZWVuWDtcblxuICAgIGNvbnN0IGluaXRpYWxTaXplID0gdGhpcy5fZ2V0T3JpZ2luV2lkdGgoKTtcbiAgICBsZXQgb3ZlcmxheU9mZnNldCA9IHRoaXMuX2dldE92ZXJsYXlPZmZzZXQoKTtcbiAgICBsZXQgb3JpZ2luT2Zmc2V0ID0gdGhpcy5fZ2V0T3JpZ2luT2Zmc2V0KCk7XG4gICAgbGV0IHNpemUgPSBpbml0aWFsU2l6ZTtcbiAgICBsZXQgb3ZlcnNob3QgPSAwO1xuXG4gICAgdGhpcy51cGRhdGVSZXNpemVBY3RpdmUodHJ1ZSk7XG5cbiAgICBtb3VzZXVwLnBpcGUodGFrZVVudGlsKGVzY2FwZSksIHRha2VVbnRpbCh0aGlzLmRlc3Ryb3llZCkpLnN1YnNjcmliZSgoe3NjcmVlblh9KSA9PiB7XG4gICAgICB0aGlzLl9ub3RpZnlSZXNpemVFbmRlZChzaXplLCBzY3JlZW5YICE9PSBzdGFydFgpO1xuICAgIH0pO1xuXG4gICAgZXNjYXBlLnBpcGUodGFrZVVudGlsKG1vdXNldXApLCB0YWtlVW50aWwodGhpcy5kZXN0cm95ZWQpKS5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgdGhpcy5fbm90aWZ5UmVzaXplRW5kZWQoaW5pdGlhbFNpemUpO1xuICAgIH0pO1xuXG4gICAgbW91c2Vtb3ZlLnBpcGUoXG4gICAgICAgIG1hcCgoe3NjcmVlblh9KSA9PiBzY3JlZW5YKSxcbiAgICAgICAgc3RhcnRXaXRoKHN0YXJ0WCksXG4gICAgICAgIGRpc3RpbmN0VW50aWxDaGFuZ2VkKCksXG4gICAgICAgIHBhaXJ3aXNlKCksXG4gICAgICAgIHRha2VVbnRpbChtb3VzZXVwKSxcbiAgICAgICAgdGFrZVVudGlsKGVzY2FwZSksXG4gICAgICAgIHRha2VVbnRpbCh0aGlzLmRlc3Ryb3llZCksXG4gICAgKS5zdWJzY3JpYmUoKFtwcmV2WCwgY3VyclhdKSA9PiB7XG4gICAgICBsZXQgZGVsdGFYID0gY3VyclggLSBwcmV2WDtcblxuICAgICAgLy8gSWYgdGhlIG1vdXNlIG1vdmVkIGZ1cnRoZXIgdGhhbiB0aGUgcmVzaXplIHdhcyBhYmxlIHRvIG1hdGNoLCBsaW1pdCB0aGVcbiAgICAgIC8vIG1vdmVtZW50IG9mIHRoZSBvdmVybGF5IHRvIG1hdGNoIHRoZSBhY3R1YWwgc2l6ZSBhbmQgcG9zaXRpb24gb2YgdGhlIG9yaWdpbi5cbiAgICAgIGlmIChvdmVyc2hvdCAhPT0gMCkge1xuICAgICAgICBpZiAob3ZlcnNob3QgPCAwICYmIGRlbHRhWCA8IDAgfHwgb3ZlcnNob3QgPiAwICYmIGRlbHRhWCA+IDApIHtcbiAgICAgICAgICBvdmVyc2hvdCArPSBkZWx0YVg7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnN0IHJlbWFpbmluZ092ZXJzaG90ID0gb3ZlcnNob3QgKyBkZWx0YVg7XG4gICAgICAgICAgb3ZlcnNob3QgPSBvdmVyc2hvdCA+IDAgP1xuICAgICAgICAgICAgICBNYXRoLm1heChyZW1haW5pbmdPdmVyc2hvdCwgMCkgOiBNYXRoLm1pbihyZW1haW5pbmdPdmVyc2hvdCwgMCk7XG4gICAgICAgICAgZGVsdGFYID0gcmVtYWluaW5nT3ZlcnNob3QgLSBvdmVyc2hvdDtcblxuICAgICAgICAgIGlmIChkZWx0YVggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgbGV0IGNvbXB1dGVkTmV3U2l6ZTogbnVtYmVyID0gc2l6ZSArICh0aGlzLl9pc0x0cigpID8gZGVsdGFYIDogLWRlbHRhWCk7XG4gICAgICBjb21wdXRlZE5ld1NpemUgPSBNYXRoLm1pbihcbiAgICAgICAgICBNYXRoLm1heChjb21wdXRlZE5ld1NpemUsIHRoaXMucmVzaXplUmVmLm1pbldpZHRoUHgsIDApLCB0aGlzLnJlc2l6ZVJlZi5tYXhXaWR0aFB4KTtcblxuICAgICAgdGhpcy5yZXNpemVOb3RpZmllci50cmlnZ2VyUmVzaXplLm5leHQoXG4gICAgICAgICAge2NvbHVtbklkOiB0aGlzLmNvbHVtbkRlZi5uYW1lLCBzaXplOiBjb21wdXRlZE5ld1NpemUsIHByZXZpb3VzU2l6ZTogc2l6ZX0pO1xuXG4gICAgICBjb25zdCBvcmlnaW5OZXdTaXplID0gdGhpcy5fZ2V0T3JpZ2luV2lkdGgoKTtcbiAgICAgIGNvbnN0IG9yaWdpbk5ld09mZnNldCA9IHRoaXMuX2dldE9yaWdpbk9mZnNldCgpO1xuICAgICAgY29uc3Qgb3JpZ2luT2Zmc2V0RGVsdGFYID0gb3JpZ2luTmV3T2Zmc2V0IC0gb3JpZ2luT2Zmc2V0O1xuICAgICAgY29uc3Qgb3JpZ2luU2l6ZURlbHRhWCA9IG9yaWdpbk5ld1NpemUgLSBzaXplO1xuICAgICAgc2l6ZSA9IG9yaWdpbk5ld1NpemU7XG4gICAgICBvcmlnaW5PZmZzZXQgPSBvcmlnaW5OZXdPZmZzZXQ7XG5cbiAgICAgIG92ZXJzaG90ICs9IGRlbHRhWCArICh0aGlzLl9pc0x0cigpID8gLW9yaWdpblNpemVEZWx0YVggOiBvcmlnaW5TaXplRGVsdGFYKTtcbiAgICAgIG92ZXJsYXlPZmZzZXQgKz0gb3JpZ2luT2Zmc2V0RGVsdGFYICsgKHRoaXMuX2lzTHRyKCkgPyBvcmlnaW5TaXplRGVsdGFYIDogMCk7XG5cbiAgICAgIHRoaXMuX3VwZGF0ZU92ZXJsYXlPZmZzZXQob3ZlcmxheU9mZnNldCk7XG4gICAgfSk7XG4gIH1cblxuICBwcm90ZWN0ZWQgdXBkYXRlUmVzaXplQWN0aXZlKGFjdGl2ZTogYm9vbGVhbik6IHZvaWQge1xuICAgIHRoaXMuZXZlbnREaXNwYXRjaGVyLm92ZXJsYXlIYW5kbGVBY3RpdmVGb3JDZWxsLm5leHQoXG4gICAgICAgIGFjdGl2ZSA/IHRoaXMucmVzaXplUmVmLm9yaWdpbi5uYXRpdmVFbGVtZW50ISA6IG51bGwpO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0T3JpZ2luV2lkdGgoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5yZXNpemVSZWYub3JpZ2luLm5hdGl2ZUVsZW1lbnQhLm9mZnNldFdpZHRoO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0T3JpZ2luT2Zmc2V0KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMucmVzaXplUmVmLm9yaWdpbi5uYXRpdmVFbGVtZW50IS5vZmZzZXRMZWZ0O1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0T3ZlcmxheU9mZnNldCgpOiBudW1iZXIge1xuICAgIHJldHVybiBwYXJzZUludCh0aGlzLnJlc2l6ZVJlZi5vdmVybGF5UmVmLm92ZXJsYXlFbGVtZW50LnN0eWxlLmxlZnQhLCAxMCk7XG4gIH1cblxuICBwcml2YXRlIF91cGRhdGVPdmVybGF5T2Zmc2V0KG9mZnNldDogbnVtYmVyKTogdm9pZCB7XG4gICAgdGhpcy5yZXNpemVSZWYub3ZlcmxheVJlZi5vdmVybGF5RWxlbWVudC5zdHlsZS5sZWZ0ID0gY29lcmNlQ3NzUGl4ZWxWYWx1ZShvZmZzZXQpO1xuICB9XG5cbiAgcHJpdmF0ZSBfaXNMdHIoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuZGlyZWN0aW9uYWxpdHkudmFsdWUgPT09ICdsdHInO1xuICB9XG5cbiAgcHJpdmF0ZSBfbm90aWZ5UmVzaXplRW5kZWQoc2l6ZTogbnVtYmVyLCBjb21wbGV0ZWRTdWNjZXNzZnVsbHkgPSBmYWxzZSk6IHZvaWQge1xuICAgIHRoaXMudXBkYXRlUmVzaXplQWN0aXZlKGZhbHNlKTtcblxuICAgIHRoaXMubmdab25lLnJ1bigoKSA9PiB7XG4gICAgICBjb25zdCBzaXplTWVzc2FnZSA9IHtjb2x1bW5JZDogdGhpcy5jb2x1bW5EZWYubmFtZSwgc2l6ZX07XG4gICAgICBpZiAoY29tcGxldGVkU3VjY2Vzc2Z1bGx5KSB7XG4gICAgICAgIHRoaXMucmVzaXplTm90aWZpZXIucmVzaXplQ29tcGxldGVkLm5leHQoc2l6ZU1lc3NhZ2UpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5yZXNpemVOb3RpZmllci5yZXNpemVDYW5jZWxlZC5uZXh0KHNpemVNZXNzYWdlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufVxuIl19