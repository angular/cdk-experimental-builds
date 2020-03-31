import { __extends, __read } from "tslib";
import { TemplatePortal } from '@angular/cdk/portal';
import { Directive, ElementRef, NgZone, TemplateRef, ViewContainerRef, HostListener, } from '@angular/core';
import { fromEvent, fromEventPattern, merge, Subject } from 'rxjs';
import { filter, map, mapTo, share, startWith, takeUntil, throttleTime, withLatestFrom, } from 'rxjs/operators';
import { CELL_SELECTOR, EDIT_PANE_CLASS, EDIT_PANE_SELECTOR, ROW_SELECTOR } from './constants';
import { EditEventDispatcher } from './edit-event-dispatcher';
import { EditServices } from './edit-services';
import { FocusDispatcher } from './focus-dispatcher';
import { FocusEscapeNotifierFactory } from './focus-escape-notifier';
import { closest } from './polyfill';
/** Used for rate-limiting mousemove events. */
var MOUSE_MOVE_THROTTLE_TIME_MS = 10;
/**
 * A directive that must be attached to enable editability on a table.
 * It is responsible for setting up delegated event handlers and providing the
 * EditEventDispatcher service for use by the other edit directives.
 */
var CdkEditable = /** @class */ (function () {
    function CdkEditable(elementRef, editEventDispatcher, focusDispatcher, ngZone) {
        this.elementRef = elementRef;
        this.editEventDispatcher = editEventDispatcher;
        this.focusDispatcher = focusDispatcher;
        this.ngZone = ngZone;
        this.destroyed = new Subject();
    }
    CdkEditable.prototype.ngAfterViewInit = function () {
        this._listenForTableEvents();
    };
    CdkEditable.prototype.ngOnDestroy = function () {
        this.destroyed.next();
        this.destroyed.complete();
    };
    CdkEditable.prototype._listenForTableEvents = function () {
        var _this = this;
        var element = this.elementRef.nativeElement;
        var toClosest = function (selector) {
            return map(function (event) { return closest(event.target, selector); });
        };
        this.ngZone.runOutsideAngular(function () {
            // Track mouse movement over the table to hide/show hover content.
            fromEvent(element, 'mouseover').pipe(toClosest(ROW_SELECTOR), takeUntil(_this.destroyed)).subscribe(_this.editEventDispatcher.hovering);
            fromEvent(element, 'mouseleave').pipe(mapTo(null), takeUntil(_this.destroyed)).subscribe(_this.editEventDispatcher.hovering);
            fromEvent(element, 'mousemove').pipe(throttleTime(MOUSE_MOVE_THROTTLE_TIME_MS), toClosest(ROW_SELECTOR), takeUntil(_this.destroyed)).subscribe(_this.editEventDispatcher.mouseMove);
            // Track focus within the table to hide/show/make focusable hover content.
            fromEventPattern(function (handler) { return element.addEventListener('focus', handler, true); }, function (handler) { return element.removeEventListener('focus', handler, true); }).pipe(takeUntil(_this.destroyed), toClosest(ROW_SELECTOR), share()).subscribe(_this.editEventDispatcher.focused);
            merge(fromEventPattern(function (handler) { return element.addEventListener('blur', handler, true); }, function (handler) { return element.removeEventListener('blur', handler, true); }), fromEvent(element, 'keydown').pipe(filter(function (event) { return event.key === 'Escape'; }))).pipe(takeUntil(_this.destroyed), mapTo(null), share()).subscribe(_this.editEventDispatcher.focused);
            // Keep track of rows within the table. This is used to know which rows with hover content
            // are first or last in the table. They are kept focusable in case focus enters from above
            // or below the table.
            _this.ngZone.onStable.pipe(takeUntil(_this.destroyed), 
            // Optimization: ignore dom changes while focus is within the table as we already
            // ensure that rows above and below the focused/active row are tabbable.
            withLatestFrom(_this.editEventDispatcher.editingOrFocused), filter(function (_a) {
                var _b = __read(_a, 2), _ = _b[0], activeRow = _b[1];
                return activeRow == null;
            }), map(function () { return element.querySelectorAll(ROW_SELECTOR); }), share()).subscribe(_this.editEventDispatcher.allRows);
            fromEvent(element, 'keydown').pipe(filter(function (event) { return event.key === 'Enter'; }), toClosest(CELL_SELECTOR), takeUntil(_this.destroyed)).subscribe(_this.editEventDispatcher.editing);
            // Keydown must be used here or else key autorepeat does not work properly on some platforms.
            fromEvent(element, 'keydown')
                .pipe(takeUntil(_this.destroyed))
                .subscribe(_this.focusDispatcher.keyObserver);
        });
    };
    CdkEditable.decorators = [
        { type: Directive, args: [{
                    selector: 'table[editable], cdk-table[editable], mat-table[editable]',
                    providers: [EditEventDispatcher, EditServices],
                },] }
    ];
    /** @nocollapse */
    CdkEditable.ctorParameters = function () { return [
        { type: ElementRef },
        { type: EditEventDispatcher },
        { type: FocusDispatcher },
        { type: NgZone }
    ]; };
    return CdkEditable;
}());
export { CdkEditable };
var POPOVER_EDIT_HOST_BINDINGS = {
    '[attr.tabindex]': 'disabled ? null : 0',
    'class': 'cdk-popover-edit-cell',
    '[attr.aria-haspopup]': '!disabled',
};
var POPOVER_EDIT_INPUTS = [
    'template: cdkPopoverEdit',
    'context: cdkPopoverEditContext',
    'colspan: cdkPopoverEditColspan',
    'disabled: cdkPopoverEditDisabled',
];
/**
 * Attaches an ng-template to a cell and shows it when instructed to by the
 * EditEventDispatcher service.
 * Makes the cell focusable.
 */
var CdkPopoverEdit = /** @class */ (function () {
    function CdkPopoverEdit(services, elementRef, viewContainerRef) {
        this.services = services;
        this.elementRef = elementRef;
        this.viewContainerRef = viewContainerRef;
        /** The edit lens template shown over the cell on edit. */
        this.template = null;
        this._colspan = {};
        this._disabled = false;
        this.destroyed = new Subject();
    }
    Object.defineProperty(CdkPopoverEdit.prototype, "colspan", {
        /**
         * Specifies that the popup should cover additional table cells before and/or after
         * this one.
         */
        get: function () {
            return this._colspan;
        },
        set: function (value) {
            this._colspan = value;
            // Recompute positioning when the colspan changes.
            if (this.overlayRef) {
                this.overlayRef.updatePositionStrategy(this._getPositionStrategy());
                if (this.overlayRef.hasAttached()) {
                    this._updateOverlaySize();
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CdkPopoverEdit.prototype, "disabled", {
        /** Whether popover edit is disabled for this cell. */
        get: function () {
            return this._disabled;
        },
        set: function (value) {
            this._disabled = value;
            if (value) {
                this.services.editEventDispatcher.doneEditingCell(this.elementRef.nativeElement);
                this.services.editEventDispatcher.disabledCells.set(this.elementRef.nativeElement, true);
            }
            else {
                this.services.editEventDispatcher.disabledCells.delete(this.elementRef.nativeElement);
            }
        },
        enumerable: true,
        configurable: true
    });
    CdkPopoverEdit.prototype.ngAfterViewInit = function () {
        this._startListeningToEditEvents();
    };
    CdkPopoverEdit.prototype.ngOnDestroy = function () {
        this.destroyed.next();
        this.destroyed.complete();
        if (this.focusTrap) {
            this.focusTrap.destroy();
            this.focusTrap = undefined;
        }
        if (this.overlayRef) {
            this.overlayRef.dispose();
        }
    };
    CdkPopoverEdit.prototype.initFocusTrap = function () {
        this.focusTrap = this.services.focusTrapFactory.create(this.overlayRef.overlayElement);
    };
    CdkPopoverEdit.prototype.closeEditOverlay = function () {
        this.services.editEventDispatcher.doneEditingCell(this.elementRef.nativeElement);
    };
    CdkPopoverEdit.prototype.panelClass = function () {
        return EDIT_PANE_CLASS;
    };
    CdkPopoverEdit.prototype._startListeningToEditEvents = function () {
        var _this = this;
        this.services.editEventDispatcher.editingCell(this.elementRef.nativeElement)
            .pipe(takeUntil(this.destroyed))
            .subscribe(function (open) {
            if (open && _this.template) {
                if (!_this.overlayRef) {
                    _this._createEditOverlay();
                }
                _this._showEditOverlay();
            }
            else if (_this.overlayRef) {
                _this._maybeReturnFocusToCell();
                _this.overlayRef.detach();
            }
        });
    };
    CdkPopoverEdit.prototype._createEditOverlay = function () {
        var _this = this;
        this.overlayRef = this.services.overlay.create({
            disposeOnNavigation: true,
            panelClass: this.panelClass(),
            positionStrategy: this._getPositionStrategy(),
            scrollStrategy: this.services.overlay.scrollStrategies.reposition(),
            direction: this.services.directionality,
        });
        this.initFocusTrap();
        this.overlayRef.overlayElement.setAttribute('aria-role', 'dialog');
        this.overlayRef.detachments().subscribe(function () { return _this.closeEditOverlay(); });
    };
    CdkPopoverEdit.prototype._showEditOverlay = function () {
        var _this = this;
        this.overlayRef.attach(new TemplatePortal(this.template, this.viewContainerRef, { $implicit: this.context }));
        // We have to defer trapping focus, because doing so too early can cause the form inside
        // the overlay to be submitted immediately if it was opened on an Enter keydown event.
        this.services.ngZone.runOutsideAngular(function () {
            setTimeout(function () {
                _this.focusTrap.focusInitialElement();
            });
        });
        // Update the size of the popup initially and on subsequent changes to
        // scroll position and viewport size.
        merge(this.services.scrollDispatcher.scrolled(), this.services.viewportRuler.change())
            .pipe(startWith(null), takeUntil(this.overlayRef.detachments()), takeUntil(this.destroyed))
            .subscribe(function () {
            _this._updateOverlaySize();
        });
    };
    CdkPopoverEdit.prototype._getOverlayCells = function () {
        var cell = closest(this.elementRef.nativeElement, CELL_SELECTOR);
        if (!this._colspan.before && !this._colspan.after) {
            return [cell];
        }
        var row = closest(this.elementRef.nativeElement, ROW_SELECTOR);
        var rowCells = Array.from(row.querySelectorAll(CELL_SELECTOR));
        var ownIndex = rowCells.indexOf(cell);
        return rowCells.slice(ownIndex - (this._colspan.before || 0), ownIndex + (this._colspan.after || 0) + 1);
    };
    CdkPopoverEdit.prototype._getPositionStrategy = function () {
        return this.services.positionFactory.positionStrategyForCells(this._getOverlayCells());
    };
    CdkPopoverEdit.prototype._updateOverlaySize = function () {
        this.overlayRef.updateSize(this.services.positionFactory.sizeConfigForCells(this._getOverlayCells()));
    };
    CdkPopoverEdit.prototype._maybeReturnFocusToCell = function () {
        if (closest(document.activeElement, EDIT_PANE_SELECTOR) ===
            this.overlayRef.overlayElement) {
            this.elementRef.nativeElement.focus();
        }
    };
    CdkPopoverEdit.decorators = [
        { type: Directive, args: [{
                    selector: '[cdkPopoverEdit]:not([cdkPopoverEditTabOut])',
                    host: POPOVER_EDIT_HOST_BINDINGS,
                    inputs: POPOVER_EDIT_INPUTS,
                },] }
    ];
    /** @nocollapse */
    CdkPopoverEdit.ctorParameters = function () { return [
        { type: EditServices },
        { type: ElementRef },
        { type: ViewContainerRef }
    ]; };
    return CdkPopoverEdit;
}());
export { CdkPopoverEdit };
/**
 * Attaches an ng-template to a cell and shows it when instructed to by the
 * EditEventDispatcher service.
 * Makes the cell focusable.
 */
var CdkPopoverEditTabOut = /** @class */ (function (_super) {
    __extends(CdkPopoverEditTabOut, _super);
    function CdkPopoverEditTabOut(elementRef, viewContainerRef, services, focusEscapeNotifierFactory) {
        var _this = _super.call(this, services, elementRef, viewContainerRef) || this;
        _this.focusEscapeNotifierFactory = focusEscapeNotifierFactory;
        return _this;
    }
    CdkPopoverEditTabOut.prototype.initFocusTrap = function () {
        var _this = this;
        this.focusTrap = this.focusEscapeNotifierFactory.create(this.overlayRef.overlayElement);
        this.focusTrap.escapes().pipe(takeUntil(this.destroyed)).subscribe(function (direction) {
            if (_this.services.editEventDispatcher.editRef) {
                _this.services.editEventDispatcher.editRef.blur();
            }
            _this.services.focusDispatcher.moveFocusHorizontally(closest(_this.elementRef.nativeElement, CELL_SELECTOR), direction === 0 /* START */ ? -1 : 1);
            _this.closeEditOverlay();
        });
    };
    CdkPopoverEditTabOut.decorators = [
        { type: Directive, args: [{
                    selector: '[cdkPopoverEdit][cdkPopoverEditTabOut]',
                    host: POPOVER_EDIT_HOST_BINDINGS,
                    inputs: POPOVER_EDIT_INPUTS,
                },] }
    ];
    /** @nocollapse */
    CdkPopoverEditTabOut.ctorParameters = function () { return [
        { type: ElementRef },
        { type: ViewContainerRef },
        { type: EditServices },
        { type: FocusEscapeNotifierFactory }
    ]; };
    return CdkPopoverEditTabOut;
}(CdkPopoverEdit));
export { CdkPopoverEditTabOut };
/**
 * A structural directive that shows its contents when the table row containing
 * it is hovered or when an element in the row has focus.
 */
var CdkRowHoverContent = /** @class */ (function () {
    function CdkRowHoverContent(services, elementRef, templateRef, viewContainerRef) {
        this.services = services;
        this.elementRef = elementRef;
        this.templateRef = templateRef;
        this.viewContainerRef = viewContainerRef;
        this.destroyed = new Subject();
        this.viewRef = null;
    }
    CdkRowHoverContent.prototype.ngAfterViewInit = function () {
        this._row = closest(this.elementRef.nativeElement, ROW_SELECTOR);
        this.services.editEventDispatcher.registerRowWithHoverContent(this._row);
        this._listenForHoverAndFocusEvents();
    };
    CdkRowHoverContent.prototype.ngOnDestroy = function () {
        this.destroyed.next();
        this.destroyed.complete();
        if (this.viewRef) {
            this.viewRef.destroy();
        }
        if (this._row) {
            this.services.editEventDispatcher.deregisterRowWithHoverContent(this._row);
        }
    };
    /**
     * Called immediately after the hover content is created and added to the dom.
     * In the CDK version, this is a noop but subclasses such as MatRowHoverContent use this
     * to prepare/style the inserted element.
     */
    CdkRowHoverContent.prototype.initElement = function (_) {
    };
    /**
     * Called when the hover content needs to be focusable to preserve a reasonable tab ordering
     * but should not yet be shown.
     */
    CdkRowHoverContent.prototype.makeElementHiddenButFocusable = function (element) {
        element.style.opacity = '0';
    };
    /**
     * Called when the hover content needs to be focusable to preserve a reasonable tab ordering
     * but should not yet be shown.
     */
    CdkRowHoverContent.prototype.makeElementVisible = function (element) {
        element.style.opacity = '';
    };
    CdkRowHoverContent.prototype._listenForHoverAndFocusEvents = function () {
        var _this = this;
        this.services.editEventDispatcher.hoverOrFocusOnRow(this._row)
            .pipe(takeUntil(this.destroyed))
            .subscribe(function (eventState) {
            // When in FOCUSABLE state, add the hover content to the dom but make it transparent so
            // that it is in the tab order relative to the currently focused row.
            if (eventState === 2 /* ON */ || eventState === 1 /* FOCUSABLE */) {
                if (!_this.viewRef) {
                    _this.viewRef = _this.viewContainerRef.createEmbeddedView(_this.templateRef, {});
                    _this.initElement(_this.viewRef.rootNodes[0]);
                    _this.viewRef.markForCheck();
                }
                else if (_this.viewContainerRef.indexOf(_this.viewRef) === -1) {
                    _this.viewContainerRef.insert(_this.viewRef);
                    _this.viewRef.markForCheck();
                }
                if (eventState === 2 /* ON */) {
                    _this.makeElementVisible(_this.viewRef.rootNodes[0]);
                }
                else {
                    _this.makeElementHiddenButFocusable(_this.viewRef.rootNodes[0]);
                }
            }
            else if (_this.viewRef) {
                _this.viewContainerRef.detach(_this.viewContainerRef.indexOf(_this.viewRef));
            }
        });
    };
    CdkRowHoverContent.decorators = [
        { type: Directive, args: [{
                    selector: '[cdkRowHoverContent]',
                },] }
    ];
    /** @nocollapse */
    CdkRowHoverContent.ctorParameters = function () { return [
        { type: EditServices },
        { type: ElementRef },
        { type: TemplateRef },
        { type: ViewContainerRef }
    ]; };
    return CdkRowHoverContent;
}());
export { CdkRowHoverContent };
/**
 * Opens the closest edit popover to this element, whether it's associated with this exact
 * element or an ancestor element.
 */
var CdkEditOpen = /** @class */ (function () {
    function CdkEditOpen(elementRef, editEventDispatcher) {
        this.elementRef = elementRef;
        this.editEventDispatcher = editEventDispatcher;
        var nativeElement = elementRef.nativeElement;
        // Prevent accidental form submits.
        if (nativeElement.nodeName === 'BUTTON' && !nativeElement.getAttribute('type')) {
            nativeElement.setAttribute('type', 'button');
        }
    }
    // In Ivy the `host` metadata will be merged, whereas in ViewEngine it is overridden. In order
    // to avoid double event listeners, we need to use `HostListener`. Once Ivy is the default, we
    // can move this back into `host`.
    // tslint:disable:no-host-decorator-in-concrete
    CdkEditOpen.prototype.openEdit = function (evt) {
        this.editEventDispatcher.editing.next(closest(this.elementRef.nativeElement, CELL_SELECTOR));
        evt.stopPropagation();
    };
    CdkEditOpen.decorators = [
        { type: Directive, args: [{
                    selector: '[cdkEditOpen]',
                },] }
    ];
    /** @nocollapse */
    CdkEditOpen.ctorParameters = function () { return [
        { type: ElementRef },
        { type: EditEventDispatcher }
    ]; };
    CdkEditOpen.propDecorators = {
        openEdit: [{ type: HostListener, args: ['click', ['$event'],] }]
    };
    return CdkEditOpen;
}());
export { CdkEditOpen };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFibGUtZGlyZWN0aXZlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL3BvcG92ZXItZWRpdC90YWJsZS1kaXJlY3RpdmVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFTQSxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDbkQsT0FBTyxFQUVMLFNBQVMsRUFDVCxVQUFVLEVBRVYsTUFBTSxFQUVOLFdBQVcsRUFDWCxnQkFBZ0IsRUFDaEIsWUFBWSxHQUNiLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBQyxTQUFTLEVBQUUsZ0JBQWdCLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUNqRSxPQUFPLEVBQ0wsTUFBTSxFQUNOLEdBQUcsRUFDSCxLQUFLLEVBQ0wsS0FBSyxFQUNMLFNBQVMsRUFDVCxTQUFTLEVBQ1QsWUFBWSxFQUNaLGNBQWMsR0FDZixNQUFNLGdCQUFnQixDQUFDO0FBRXhCLE9BQU8sRUFBQyxhQUFhLEVBQUUsZUFBZSxFQUFFLGtCQUFrQixFQUFFLFlBQVksRUFBQyxNQUFNLGFBQWEsQ0FBQztBQUM3RixPQUFPLEVBQUMsbUJBQW1CLEVBQW9CLE1BQU0seUJBQXlCLENBQUM7QUFDL0UsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQzdDLE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSxvQkFBb0IsQ0FBQztBQUNuRCxPQUFPLEVBR0wsMEJBQTBCLEVBQzNCLE1BQU0seUJBQXlCLENBQUM7QUFDakMsT0FBTyxFQUFDLE9BQU8sRUFBQyxNQUFNLFlBQVksQ0FBQztBQVluQywrQ0FBK0M7QUFDL0MsSUFBTSwyQkFBMkIsR0FBRyxFQUFFLENBQUM7QUFFdkM7Ozs7R0FJRztBQUNIO0lBT0UscUJBQ3VCLFVBQXNCLEVBQ3RCLG1CQUF3QyxFQUN4QyxlQUFn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USxFQUFFLGVBQWU7aUJBQzFCOzs7O2dCQXpkQyxVQUFVO2dCQXFCSixtQkFBbUI7OzsyQkFzZHhCLFlBQVksU0FBQyxPQUFPLEVBQUUsQ0FBQyxRQUFRLENBQUM7O0lBS25DLGtCQUFDO0NBQUEsQUF6QkQsSUF5QkM7U0F0QlksV0FBVyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtGb2N1c1RyYXB9IGZyb20gJ0Bhbmd1bGFyL2Nkay9hMTF5JztcbmltcG9ydCB7T3ZlcmxheVJlZiwgUG9zaXRpb25TdHJhdGVneX0gZnJvbSAnQGFuZ3VsYXIvY2RrL292ZXJsYXknO1xuaW1wb3J0IHtUZW1wbGF0ZVBvcnRhbH0gZnJvbSAnQGFuZ3VsYXIvY2RrL3BvcnRhbCc7XG5pbXBvcnQge1xuICBBZnRlclZpZXdJbml0LFxuICBEaXJlY3RpdmUsXG4gIEVsZW1lbnRSZWYsXG4gIEVtYmVkZGVkVmlld1JlZixcbiAgTmdab25lLFxuICBPbkRlc3Ryb3ksXG4gIFRlbXBsYXRlUmVmLFxuICBWaWV3Q29udGFpbmVyUmVmLFxuICBIb3N0TGlzdGVuZXIsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtmcm9tRXZlbnQsIGZyb21FdmVudFBhdHRlcm4sIG1lcmdlLCBTdWJqZWN0fSBmcm9tICdyeGpzJztcbmltcG9ydCB7XG4gIGZpbHRlcixcbiAgbWFwLFxuICBtYXBUbyxcbiAgc2hhcmUsXG4gIHN0YXJ0V2l0aCxcbiAgdGFrZVVudGlsLFxuICB0aHJvdHRsZVRpbWUsXG4gIHdpdGhMYXRlc3RGcm9tLFxufSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbmltcG9ydCB7Q0VMTF9TRUxFQ1RPUiwgRURJVF9QQU5FX0NMQVNTLCBFRElUX1BBTkVfU0VMRUNUT1IsIFJPV19TRUxFQ1RPUn0gZnJvbSAnLi9jb25zdGFudHMnO1xuaW1wb3J0IHtFZGl0RXZlbnREaXNwYXRjaGVyLCBIb3ZlckNvbnRlbnRTdGF0ZX0gZnJvbSAnLi9lZGl0LWV2ZW50LWRpc3BhdGNoZXInO1xuaW1wb3J0IHtFZGl0U2VydmljZXN9IGZyb20gJy4vZWRpdC1zZXJ2aWNlcyc7XG5pbXBvcnQge0ZvY3VzRGlzcGF0Y2hlcn0gZnJvbSAnLi9mb2N1cy1kaXNwYXRjaGVyJztcbmltcG9ydCB7XG4gIEZvY3VzRXNjYXBlTm90aWZpZXIsXG4gIEZvY3VzRXNjYXBlTm90aWZpZXJEaXJlY3Rpb24sXG4gIEZvY3VzRXNjYXBlTm90aWZpZXJGYWN0b3J5XG59IGZyb20gJy4vZm9jdXMtZXNjYXBlLW5vdGlmaWVyJztcbmltcG9ydCB7Y2xvc2VzdH0gZnJvbSAnLi9wb2x5ZmlsbCc7XG5cbi8qKlxuICogRGVzY3JpYmVzIHRoZSBudW1iZXIgb2YgY29sdW1ucyBiZWZvcmUgYW5kIGFmdGVyIHRoZSBvcmlnaW5hdGluZyBjZWxsIHRoYXQgdGhlXG4gKiBlZGl0IHBvcHVwIHNob3VsZCBzcGFuLiBJbiBsZWZ0IHRvIHJpZ2h0IGxvY2FsZXMsIGJlZm9yZSBtZWFucyBsZWZ0IGFuZCBhZnRlciBtZWFuc1xuICogcmlnaHQuIEluIHJpZ2h0IHRvIGxlZnQgbG9jYWxlcyBiZWZvcmUgbWVhbnMgcmlnaHQgYW5kIGFmdGVyIG1lYW5zIGxlZnQuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ2RrUG9wb3ZlckVkaXRDb2xzcGFuIHtcbiAgYmVmb3JlPzogbnVtYmVyO1xuICBhZnRlcj86IG51bWJlcjtcbn1cblxuLyoqIFVzZWQgZm9yIHJhdGUtbGltaXRpbmcgbW91c2Vtb3ZlIGV2ZW50cy4gKi9cbmNvbnN0IE1PVVNFX01PVkVfVEhST1RUTEVfVElNRV9NUyA9IDEwO1xuXG4vKipcbiAqIEEgZGlyZWN0aXZlIHRoYXQgbXVzdCBiZSBhdHRhY2hlZCB0byBlbmFibGUgZWRpdGFiaWxpdHkgb24gYSB0YWJsZS5cbiAqIEl0IGlzIHJlc3BvbnNpYmxlIGZvciBzZXR0aW5nIHVwIGRlbGVnYXRlZCBldmVudCBoYW5kbGVycyBhbmQgcHJvdmlkaW5nIHRoZVxuICogRWRpdEV2ZW50RGlzcGF0Y2hlciBzZXJ2aWNlIGZvciB1c2UgYnkgdGhlIG90aGVyIGVkaXQgZGlyZWN0aXZlcy5cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAndGFibGVbZWRpdGFibGVdLCBjZGstdGFibGVbZWRpdGFibGVdLCBtYXQtdGFibGVbZWRpdGFibGVdJyxcbiAgcHJvdmlkZXJzOiBbRWRpdEV2ZW50RGlzcGF0Y2hlciwgRWRpdFNlcnZpY2VzXSxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrRWRpdGFibGUgaW1wbGVtZW50cyBBZnRlclZpZXdJbml0LCBPbkRlc3Ryb3kge1xuICBwcm90ZWN0ZWQgcmVhZG9ubHkgZGVzdHJveWVkID0gbmV3IFN1YmplY3Q8dm9pZD4oKTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByb3RlY3RlZCByZWFkb25seSBlbGVtZW50UmVmOiBFbGVtZW50UmVmLFxuICAgICAgcHJvdGVjdGVkIHJlYWRvbmx5IGVkaXRFdmVudERpc3BhdGNoZXI6IEVkaXRFdmVudERpc3BhdGNoZXIsXG4gICAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgZm9jdXNEaXNwYXRjaGVyOiBGb2N1c0Rpc3BhdGNoZXIsIHByb3RlY3RlZCByZWFkb25seSBuZ1pvbmU6IE5nWm9uZSkge31cblxuICBuZ0FmdGVyVmlld0luaXQoKTogdm9pZCB7XG4gICAgdGhpcy5fbGlzdGVuRm9yVGFibGVFdmVudHMoKTtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCk6IHZvaWQge1xuICAgIHRoaXMuZGVzdHJveWVkLm5leHQoKTtcbiAgICB0aGlzLmRlc3Ryb3llZC5jb21wbGV0ZSgpO1xuICB9XG5cbiAgcHJpdmF0ZSBfbGlzdGVuRm9yVGFibGVFdmVudHMoKTogdm9pZCB7XG4gICAgY29uc3QgZWxlbWVudCA9IHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50O1xuICAgIGNvbnN0IHRvQ2xvc2VzdCA9IChzZWxlY3Rvcjogc3RyaW5nKSA9PlxuICAgICAgICBtYXAoKGV2ZW50OiBVSUV2ZW50KSA9PiBjbG9zZXN0KGV2ZW50LnRhcmdldCwgc2VsZWN0b3IpKTtcblxuICAgIHRoaXMubmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgIC8vIFRyYWNrIG1vdXNlIG1vdmVtZW50IG92ZXIgdGhlIHRhYmxlIHRvIGhpZGUvc2hvdyBob3ZlciBjb250ZW50LlxuICAgICAgZnJvbUV2ZW50PE1vdXNlRXZlbnQ+KGVsZW1lbnQsICdtb3VzZW92ZXInKS5waXBlKFxuICAgICAgICAgIHRvQ2xvc2VzdChST1dfU0VMRUNUT1IpLFxuICAgICAgICAgIHRha2VVbnRpbCh0aGlzLmRlc3Ryb3llZCksXG4gICAgICAgICAgKS5zdWJzY3JpYmUodGhpcy5lZGl0RXZlbnREaXNwYXRjaGVyLmhvdmVyaW5nKTtcbiAgICAgIGZyb21FdmVudDxNb3VzZUV2ZW50PihlbGVtZW50LCAnbW91c2VsZWF2ZScpLnBpcGUoXG4gICAgICAgICAgbWFwVG8obnVsbCksXG4gICAgICAgICAgdGFrZVVudGlsKHRoaXMuZGVzdHJveWVkKSxcbiAgICAgICAgICApLnN1YnNjcmliZSh0aGlzLmVkaXRFdmVudERpc3BhdGNoZXIuaG92ZXJpbmcpO1xuICAgICAgZnJvbUV2ZW50PE1vdXNlRXZlbnQ+KGVsZW1lbnQsICdtb3VzZW1vdmUnKS5waXBlKFxuICAgICAgICAgIHRocm90dGxlVGltZShNT1VTRV9NT1ZFX1RIUk9UVExFX1RJTUVfTVMpLFxuICAgICAgICAgIHRvQ2xvc2VzdChST1dfU0VMRUNUT1IpLFxuICAgICAgICAgIHRha2VVbnRpbCh0aGlzLmRlc3Ryb3llZCksXG4gICAgICAgICAgKS5zdWJzY3JpYmUodGhpcy5lZGl0RXZlbnREaXNwYXRjaGVyLm1vdXNlTW92ZSk7XG5cbiAgICAgIC8vIFRyYWNrIGZvY3VzIHdpdGhpbiB0aGUgdGFibGUgdG8gaGlkZS9zaG93L21ha2UgZm9jdXNhYmxlIGhvdmVyIGNvbnRlbnQuXG4gICAgICBmcm9tRXZlbnRQYXR0ZXJuPEZvY3VzRXZlbnQ+KFxuICAgICAgICAgIGhhbmRsZXIgPT4gZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdmb2N1cycsIGhhbmRsZXIsIHRydWUpLFxuICAgICAgICAgIGhhbmRsZXIgPT4gZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdmb2N1cycsIGhhbmRsZXIsIHRydWUpXG4gICAgICAgICAgKS5waXBlKFxuICAgICAgICAgICAgICB0YWtlVW50aWwodGhpcy5kZXN0cm95ZWQpLFxuICAgICAgICAgICAgICB0b0Nsb3Nlc3QoUk9XX1NFTEVDVE9SKSxcbiAgICAgICAgICAgICAgc2hhcmUoKSxcbiAgICAgICAgICAgICAgKS5zdWJzY3JpYmUodGhpcy5lZGl0RXZlbnREaXNwYXRjaGVyLmZvY3VzZWQpO1xuXG4gICAgICBtZXJnZShcbiAgICAgICAgZnJvbUV2ZW50UGF0dGVybjxGb2N1c0V2ZW50PihcbiAgICAgICAgICBoYW5kbGVyID0+IGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignYmx1cicsIGhhbmRsZXIsIHRydWUpLFxuICAgICAgICAgIGhhbmRsZXIgPT4gZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdibHVyJywgaGFuZGxlciwgdHJ1ZSlcbiAgICAgICAgKSxcbiAgICAgICAgZnJvbUV2ZW50PEtleWJvYXJkRXZlbnQ+KGVsZW1lbnQsICdrZXlkb3duJykucGlwZShmaWx0ZXIoZXZlbnQgPT4gZXZlbnQua2V5ID09PSAnRXNjYXBlJykpXG4gICAgICApLnBpcGUoXG4gICAgICAgIHRha2VVbnRpbCh0aGlzLmRlc3Ryb3llZCksXG4gICAgICAgIG1hcFRvKG51bGwpLFxuICAgICAgICBzaGFyZSgpLFxuICAgICAgKS5zdWJzY3JpYmUodGhpcy5lZGl0RXZlbnREaXNwYXRjaGVyLmZvY3VzZWQpO1xuXG4gICAgICAvLyBLZWVwIHRyYWNrIG9mIHJvd3Mgd2l0aGluIHRoZSB0YWJsZS4gVGhpcyBpcyB1c2VkIHRvIGtub3cgd2hpY2ggcm93cyB3aXRoIGhvdmVyIGNvbnRlbnRcbiAgICAgIC8vIGFyZSBmaXJzdCBvciBsYXN0IGluIHRoZSB0YWJsZS4gVGhleSBhcmUga2VwdCBmb2N1c2FibGUgaW4gY2FzZSBmb2N1cyBlbnRlcnMgZnJvbSBhYm92ZVxuICAgICAgLy8gb3IgYmVsb3cgdGhlIHRhYmxlLlxuICAgICAgdGhpcy5uZ1pvbmUub25TdGFibGUucGlwZShcbiAgICAgICAgICB0YWtlVW50aWwodGhpcy5kZXN0cm95ZWQpLFxuICAgICAgICAgIC8vIE9wdGltaXphdGlvbjogaWdub3JlIGRvbSBjaGFuZ2VzIHdoaWxlIGZvY3VzIGlzIHdpdGhpbiB0aGUgdGFibGUgYXMgd2UgYWxyZWFkeVxuICAgICAgICAgIC8vIGVuc3VyZSB0aGF0IHJvd3MgYWJvdmUgYW5kIGJlbG93IHRoZSBmb2N1c2VkL2FjdGl2ZSByb3cgYXJlIHRhYmJhYmxlLlxuICAgICAgICAgIHdpdGhMYXRlc3RGcm9tKHRoaXMuZWRpdEV2ZW50RGlzcGF0Y2hlci5lZGl0aW5nT3JGb2N1c2VkKSxcbiAgICAgICAgICBmaWx0ZXIoKFtfLCBhY3RpdmVSb3ddKSA9PiBhY3RpdmVSb3cgPT0gbnVsbCksXG4gICAgICAgICAgbWFwKCgpID0+IGVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChST1dfU0VMRUNUT1IpKSxcbiAgICAgICAgICBzaGFyZSgpLFxuICAgICAgICAgICkuc3Vic2NyaWJlKHRoaXMuZWRpdEV2ZW50RGlzcGF0Y2hlci5hbGxSb3dzKTtcblxuICAgICAgZnJvbUV2ZW50PEtleWJvYXJkRXZlbnQ+KGVsZW1lbnQsICdrZXlkb3duJykucGlwZShcbiAgICAgICAgICBmaWx0ZXIoZXZlbnQgPT4gZXZlbnQua2V5ID09PSAnRW50ZXInKSxcbiAgICAgICAgICB0b0Nsb3Nlc3QoQ0VMTF9TRUxFQ1RPUiksXG4gICAgICAgICAgdGFrZVVudGlsKHRoaXMuZGVzdHJveWVkKSxcbiAgICAgICAgICApLnN1YnNjcmliZSh0aGlzLmVkaXRFdmVudERpc3BhdGNoZXIuZWRpdGluZyk7XG5cbiAgICAgIC8vIEtleWRvd24gbXVzdCBiZSB1c2VkIGhlcmUgb3IgZWxzZSBrZXkgYXV0b3JlcGVhdCBkb2VzIG5vdCB3b3JrIHByb3Blcmx5IG9uIHNvbWUgcGxhdGZvcm1zLlxuICAgICAgZnJvbUV2ZW50PEtleWJvYXJkRXZlbnQ+KGVsZW1lbnQsICdrZXlkb3duJylcbiAgICAgICAgICAucGlwZSh0YWtlVW50aWwodGhpcy5kZXN0cm95ZWQpKVxuICAgICAgICAgIC5zdWJzY3JpYmUodGhpcy5mb2N1c0Rpc3BhdGNoZXIua2V5T2JzZXJ2ZXIpO1xuICAgIH0pO1xuICB9XG59XG5cbmNvbnN0IFBPUE9WRVJfRURJVF9IT1NUX0JJTkRJTkdTID0ge1xuICAnW2F0dHIudGFiaW5kZXhdJzogJ2Rpc2FibGVkID8gbnVsbCA6IDAnLFxuICAnY2xhc3MnOiAnY2RrLXBvcG92ZXItZWRpdC1jZWxsJyxcbiAgJ1thdHRyLmFyaWEtaGFzcG9wdXBdJzogJyFkaXNhYmxlZCcsXG59O1xuXG5jb25zdCBQT1BPVkVSX0VESVRfSU5QVVRTID0gW1xuICAndGVtcGxhdGU6IGNka1BvcG92ZXJFZGl0JyxcbiAgJ2NvbnRleHQ6IGNka1BvcG92ZXJFZGl0Q29udGV4dCcsXG4gICdjb2xzcGFuOiBjZGtQb3BvdmVyRWRpdENvbHNwYW4nLFxuICAnZGlzYWJsZWQ6IGNka1BvcG92ZXJFZGl0RGlzYWJsZWQnLFxuXTtcblxuLyoqXG4gKiBBdHRhY2hlcyBhbiBuZy10ZW1wbGF0ZSB0byBhIGNlbGwgYW5kIHNob3dzIGl0IHdoZW4gaW5zdHJ1Y3RlZCB0byBieSB0aGVcbiAqIEVkaXRFdmVudERpc3BhdGNoZXIgc2VydmljZS5cbiAqIE1ha2VzIHRoZSBjZWxsIGZvY3VzYWJsZS5cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW2Nka1BvcG92ZXJFZGl0XTpub3QoW2Nka1BvcG92ZXJFZGl0VGFiT3V0XSknLFxuICBob3N0OiBQT1BPVkVSX0VESVRfSE9TVF9CSU5ESU5HUyxcbiAgaW5wdXRzOiBQT1BPVkVSX0VESVRfSU5QVVRTLFxufSlcbmV4cG9ydCBjbGFzcyBDZGtQb3BvdmVyRWRpdDxDPiBpbXBsZW1lbnRzIEFmdGVyVmlld0luaXQsIE9uRGVzdHJveSB7XG4gIC8qKiBUaGUgZWRpdCBsZW5zIHRlbXBsYXRlIHNob3duIG92ZXIgdGhlIGNlbGwgb24gZWRpdC4gKi9cbiAgdGVtcGxhdGU6IFRlbXBsYXRlUmVmPGFueT58bnVsbCA9IG51bGw7XG5cbiAgLyoqXG4gICAqIEltcGxpY2l0IGNvbnRleHQgdG8gcGFzcyBhbG9uZyB0byB0aGUgdGVtcGxhdGUuIENhbiBiZSBvbWl0dGVkIGlmIHRoZSB0ZW1wbGF0ZVxuICAgKiBpcyBkZWZpbmVkIHdpdGhpbiB0aGUgY2VsbC5cbiAgICovXG4gIGNvbnRleHQ/OiBDO1xuXG4gIC8qKlxuICAgKiBTcGVjaWZpZXMgdGhhdCB0aGUgcG9wdXAgc2hvdWxkIGNvdmVyIGFkZGl0aW9uYWwgdGFibGUgY2VsbHMgYmVmb3JlIGFuZC9vciBhZnRlclxuICAgKiB0aGlzIG9uZS5cbiAgICovXG4gIGdldCBjb2xzcGFuKCk6IENka1BvcG92ZXJFZGl0Q29sc3BhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2NvbHNwYW47XG4gIH1cbiAgc2V0IGNvbHNwYW4odmFsdWU6IENka1BvcG92ZXJFZGl0Q29sc3Bhbikge1xuICAgIHRoaXMuX2NvbHNwYW4gPSB2YWx1ZTtcblxuICAgIC8vIFJlY29tcHV0ZSBwb3NpdGlvbmluZyB3aGVuIHRoZSBjb2xzcGFuIGNoYW5nZXMuXG4gICAgaWYgKHRoaXMub3ZlcmxheVJlZikge1xuICAgICAgdGhpcy5vdmVybGF5UmVmLnVwZGF0ZVBvc2l0aW9uU3RyYXRlZ3kodGhpcy5fZ2V0UG9zaXRpb25TdHJhdGVneSgpKTtcblxuICAgICAgaWYgKHRoaXMub3ZlcmxheVJlZi5oYXNBdHRhY2hlZCgpKSB7XG4gICAgICAgIHRoaXMuX3VwZGF0ZU92ZXJsYXlTaXplKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHByaXZhdGUgX2NvbHNwYW46IENka1BvcG92ZXJFZGl0Q29sc3BhbiA9IHt9O1xuXG4gIC8qKiBXaGV0aGVyIHBvcG92ZXIgZWRpdCBpcyBkaXNhYmxlZCBmb3IgdGhpcyBjZWxsLiAqL1xuICBnZXQgZGlzYWJsZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2Rpc2FibGVkO1xuICB9XG4gIHNldCBkaXNhYmxlZCh2YWx1ZTogYm9vbGVhbikge1xuICAgIHRoaXMuX2Rpc2FibGVkID0gdmFsdWU7XG5cbiAgICBpZiAodmFsdWUpIHtcbiAgICAgIHRoaXMuc2VydmljZXMuZWRpdEV2ZW50RGlzcGF0Y2hlci5kb25lRWRpdGluZ0NlbGwodGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQhKTtcbiAgICAgIHRoaXMuc2VydmljZXMuZWRpdEV2ZW50RGlzcGF0Y2hlci5kaXNhYmxlZENlbGxzLnNldCh0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCEsIHRydWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnNlcnZpY2VzLmVkaXRFdmVudERpc3BhdGNoZXIuZGlzYWJsZWRDZWxscy5kZWxldGUodGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQhKTtcbiAgICB9XG4gIH1cbiAgcHJpdmF0ZSBfZGlzYWJsZWQgPSBmYWxzZTtcblxuICBwcm90ZWN0ZWQgZm9jdXNUcmFwPzogRm9jdXNUcmFwO1xuICBwcm90ZWN0ZWQgb3ZlcmxheVJlZj86IE92ZXJsYXlSZWY7XG4gIHByb3RlY3RlZCByZWFkb25seSBkZXN0cm95ZWQgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJvdGVjdGVkIHJlYWRvbmx5IHNlcnZpY2VzOiBFZGl0U2VydmljZXMsIHByb3RlY3RlZCByZWFkb25seSBlbGVtZW50UmVmOiBFbGVtZW50UmVmLFxuICAgICAgcHJvdGVjdGVkIHJlYWRvbmx5IHZpZXdDb250YWluZXJSZWY6IFZpZXdDb250YWluZXJSZWYpIHt9XG5cbiAgbmdBZnRlclZpZXdJbml0KCk6IHZvaWQge1xuICAgIHRoaXMuX3N0YXJ0TGlzdGVuaW5nVG9FZGl0RXZlbnRzKCk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLmRlc3Ryb3llZC5uZXh0KCk7XG4gICAgdGhpcy5kZXN0cm95ZWQuY29tcGxldGUoKTtcblxuICAgIGlmICh0aGlzLmZvY3VzVHJhcCkge1xuICAgICAgdGhpcy5mb2N1c1RyYXAuZGVzdHJveSgpO1xuICAgICAgdGhpcy5mb2N1c1RyYXAgPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMub3ZlcmxheVJlZikge1xuICAgICAgdGhpcy5vdmVybGF5UmVmLmRpc3Bvc2UoKTtcbiAgICB9XG4gIH1cblxuICBwcm90ZWN0ZWQgaW5pdEZvY3VzVHJhcCgpOiB2b2lkIHtcbiAgICB0aGlzLmZvY3VzVHJhcCA9IHRoaXMuc2VydmljZXMuZm9jdXNUcmFwRmFjdG9yeS5jcmVhdGUodGhpcy5vdmVybGF5UmVmIS5vdmVybGF5RWxlbWVudCk7XG4gIH1cblxuICBwcm90ZWN0ZWQgY2xvc2VFZGl0T3ZlcmxheSgpOiB2b2lkIHtcbiAgICB0aGlzLnNlcnZpY2VzLmVkaXRFdmVudERpc3BhdGNoZXIuZG9uZUVkaXRpbmdDZWxsKHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50ISk7XG4gIH1cblxuICBwcm90ZWN0ZWQgcGFuZWxDbGFzcygpOiBzdHJpbmcge1xuICAgIHJldHVybiBFRElUX1BBTkVfQ0xBU1M7XG4gIH1cblxuICBwcml2YXRlIF9zdGFydExpc3RlbmluZ1RvRWRpdEV2ZW50cygpOiB2b2lkIHtcbiAgICB0aGlzLnNlcnZpY2VzLmVkaXRFdmVudERpc3BhdGNoZXIuZWRpdGluZ0NlbGwodGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQhKVxuICAgICAgICAucGlwZSh0YWtlVW50aWwodGhpcy5kZXN0cm95ZWQpKVxuICAgICAgICAuc3Vic2NyaWJlKChvcGVuKSA9PiB7XG4gICAgICAgICAgaWYgKG9wZW4gJiYgdGhpcy50ZW1wbGF0ZSkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLm92ZXJsYXlSZWYpIHtcbiAgICAgICAgICAgICAgdGhpcy5fY3JlYXRlRWRpdE92ZXJsYXkoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5fc2hvd0VkaXRPdmVybGF5KCk7XG4gICAgICAgICAgfSBlbHNlIGlmICh0aGlzLm92ZXJsYXlSZWYpIHtcbiAgICAgICAgICAgIHRoaXMuX21heWJlUmV0dXJuRm9jdXNUb0NlbGwoKTtcblxuICAgICAgICAgICAgdGhpcy5vdmVybGF5UmVmLmRldGFjaCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gIH1cblxuICBwcml2YXRlIF9jcmVhdGVFZGl0T3ZlcmxheSgpOiB2b2lkIHtcbiAgICB0aGlzLm92ZXJsYXlSZWYgPSB0aGlzLnNlcnZpY2VzLm92ZXJsYXkuY3JlYXRlKHtcbiAgICAgIGRpc3Bvc2VPbk5hdmlnYXRpb246IHRydWUsXG4gICAgICBwYW5lbENsYXNzOiB0aGlzLnBhbmVsQ2xhc3MoKSxcbiAgICAgIHBvc2l0aW9uU3RyYXRlZ3k6IHRoaXMuX2dldFBvc2l0aW9uU3RyYXRlZ3koKSxcbiAgICAgIHNjcm9sbFN0cmF0ZWd5OiB0aGlzLnNlcnZpY2VzLm92ZXJsYXkuc2Nyb2xsU3RyYXRlZ2llcy5yZXBvc2l0aW9uKCksXG4gICAgICBkaXJlY3Rpb246IHRoaXMuc2VydmljZXMuZGlyZWN0aW9uYWxpdHksXG4gICAgfSk7XG5cbiAgICB0aGlzLmluaXRGb2N1c1RyYXAoKTtcbiAgICB0aGlzLm92ZXJsYXlSZWYub3ZlcmxheUVsZW1lbnQuc2V0QXR0cmlidXRlKCdhcmlhLXJvbGUnLCAnZGlhbG9nJyk7XG5cbiAgICB0aGlzLm92ZXJsYXlSZWYuZGV0YWNobWVudHMoKS5zdWJzY3JpYmUoKCkgPT4gdGhpcy5jbG9zZUVkaXRPdmVybGF5KCkpO1xuICB9XG5cbiAgcHJpdmF0ZSBfc2hvd0VkaXRPdmVybGF5KCk6IHZvaWQge1xuICAgIHRoaXMub3ZlcmxheVJlZiEuYXR0YWNoKG5ldyBUZW1wbGF0ZVBvcnRhbChcbiAgICAgICAgdGhpcy50ZW1wbGF0ZSEsXG4gICAgICAgIHRoaXMudmlld0NvbnRhaW5lclJlZixcbiAgICAgICAgeyRpbXBsaWNpdDogdGhpcy5jb250ZXh0fSkpO1xuXG4gICAgLy8gV2UgaGF2ZSB0byBkZWZlciB0cmFwcGluZyBmb2N1cywgYmVjYXVzZSBkb2luZyBzbyB0b28gZWFybHkgY2FuIGNhdXNlIHRoZSBmb3JtIGluc2lkZVxuICAgIC8vIHRoZSBvdmVybGF5IHRvIGJlIHN1Ym1pdHRlZCBpbW1lZGlhdGVseSBpZiBpdCB3YXMgb3BlbmVkIG9uIGFuIEVudGVyIGtleWRvd24gZXZlbnQuXG4gICAgdGhpcy5zZXJ2aWNlcy5uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHRoaXMuZm9jdXNUcmFwIS5mb2N1c0luaXRpYWxFbGVtZW50KCk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIC8vIFVwZGF0ZSB0aGUgc2l6ZSBvZiB0aGUgcG9wdXAgaW5pdGlhbGx5IGFuZCBvbiBzdWJzZXF1ZW50IGNoYW5nZXMgdG9cbiAgICAvLyBzY3JvbGwgcG9zaXRpb24gYW5kIHZpZXdwb3J0IHNpemUuXG4gICAgbWVyZ2UodGhpcy5zZXJ2aWNlcy5zY3JvbGxEaXNwYXRjaGVyLnNjcm9sbGVkKCksIHRoaXMuc2VydmljZXMudmlld3BvcnRSdWxlci5jaGFuZ2UoKSlcbiAgICAgICAgLnBpcGUoXG4gICAgICAgICAgICBzdGFydFdpdGgobnVsbCksXG4gICAgICAgICAgICB0YWtlVW50aWwodGhpcy5vdmVybGF5UmVmIS5kZXRhY2htZW50cygpKSxcbiAgICAgICAgICAgIHRha2VVbnRpbCh0aGlzLmRlc3Ryb3llZCksXG4gICAgICAgICAgICApXG4gICAgICAgIC5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgICAgIHRoaXMuX3VwZGF0ZU92ZXJsYXlTaXplKCk7XG4gICAgICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0T3ZlcmxheUNlbGxzKCk6IEhUTUxFbGVtZW50W10ge1xuICAgIGNvbnN0IGNlbGwgPSBjbG9zZXN0KHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50ISwgQ0VMTF9TRUxFQ1RPUikgYXMgSFRNTEVsZW1lbnQ7XG5cbiAgICBpZiAoIXRoaXMuX2NvbHNwYW4uYmVmb3JlICYmICF0aGlzLl9jb2xzcGFuLmFmdGVyKSB7XG4gICAgICByZXR1cm4gW2NlbGxdO1xuICAgIH1cblxuICAgIGNvbnN0IHJvdyA9IGNsb3Nlc3QodGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQhLCBST1dfU0VMRUNUT1IpITtcbiAgICBjb25zdCByb3dDZWxscyA9IEFycmF5LmZyb20ocm93LnF1ZXJ5U2VsZWN0b3JBbGwoQ0VMTF9TRUxFQ1RPUikpIGFzIEhUTUxFbGVtZW50W107XG4gICAgY29uc3Qgb3duSW5kZXggPSByb3dDZWxscy5pbmRleE9mKGNlbGwpO1xuXG4gICAgcmV0dXJuIHJvd0NlbGxzLnNsaWNlKFxuICAgICAgICBvd25JbmRleCAtICh0aGlzLl9jb2xzcGFuLmJlZm9yZSB8fCAwKSwgb3duSW5kZXggKyAodGhpcy5fY29sc3Bhbi5hZnRlciB8fCAwKSArIDEpO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0UG9zaXRpb25TdHJhdGVneSgpOiBQb3NpdGlvblN0cmF0ZWd5IHtcbiAgICByZXR1cm4gdGhpcy5zZXJ2aWNlcy5wb3NpdGlvbkZhY3RvcnkucG9zaXRpb25TdHJhdGVneUZvckNlbGxzKHRoaXMuX2dldE92ZXJsYXlDZWxscygpKTtcbiAgfVxuXG4gIHByaXZhdGUgX3VwZGF0ZU92ZXJsYXlTaXplKCk6IHZvaWQge1xuICAgIHRoaXMub3ZlcmxheVJlZiEudXBkYXRlU2l6ZShcbiAgICAgICAgdGhpcy5zZXJ2aWNlcy5wb3NpdGlvbkZhY3Rvcnkuc2l6ZUNvbmZpZ0ZvckNlbGxzKHRoaXMuX2dldE92ZXJsYXlDZWxscygpKSk7XG4gIH1cblxuICBwcml2YXRlIF9tYXliZVJldHVybkZvY3VzVG9DZWxsKCk6IHZvaWQge1xuICAgIGlmIChjbG9zZXN0KGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQsIEVESVRfUEFORV9TRUxFQ1RPUikgPT09XG4gICAgICAgIHRoaXMub3ZlcmxheVJlZiEub3ZlcmxheUVsZW1lbnQpIHtcbiAgICAgIHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50IS5mb2N1cygpO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEF0dGFjaGVzIGFuIG5nLXRlbXBsYXRlIHRvIGEgY2VsbCBhbmQgc2hvd3MgaXQgd2hlbiBpbnN0cnVjdGVkIHRvIGJ5IHRoZVxuICogRWRpdEV2ZW50RGlzcGF0Y2hlciBzZXJ2aWNlLlxuICogTWFrZXMgdGhlIGNlbGwgZm9jdXNhYmxlLlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbY2RrUG9wb3ZlckVkaXRdW2Nka1BvcG92ZXJFZGl0VGFiT3V0XScsXG4gIGhvc3Q6IFBPUE9WRVJfRURJVF9IT1NUX0JJTkRJTkdTLFxuICBpbnB1dHM6IFBPUE9WRVJfRURJVF9JTlBVVFMsXG59KVxuZXhwb3J0IGNsYXNzIENka1BvcG92ZXJFZGl0VGFiT3V0PEM+IGV4dGVuZHMgQ2RrUG9wb3ZlckVkaXQ8Qz4ge1xuICBwcm90ZWN0ZWQgZm9jdXNUcmFwPzogRm9jdXNFc2NhcGVOb3RpZmllcjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIGVsZW1lbnRSZWY6IEVsZW1lbnRSZWYsIHZpZXdDb250YWluZXJSZWY6IFZpZXdDb250YWluZXJSZWYsIHNlcnZpY2VzOiBFZGl0U2VydmljZXMsXG4gICAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgZm9jdXNFc2NhcGVOb3RpZmllckZhY3Rvcnk6IEZvY3VzRXNjYXBlTm90aWZpZXJGYWN0b3J5KSB7XG4gICAgc3VwZXIoc2VydmljZXMsIGVsZW1lbnRSZWYsIHZpZXdDb250YWluZXJSZWYpO1xuICB9XG5cbiAgcHJvdGVjdGVkIGluaXRGb2N1c1RyYXAoKTogdm9pZCB7XG4gICAgdGhpcy5mb2N1c1RyYXAgPSB0aGlzLmZvY3VzRXNjYXBlTm90aWZpZXJGYWN0b3J5LmNyZWF0ZSh0aGlzLm92ZXJsYXlSZWYhLm92ZXJsYXlFbGVtZW50KTtcblxuICAgIHRoaXMuZm9jdXNUcmFwLmVzY2FwZXMoKS5waXBlKHRha2VVbnRpbCh0aGlzLmRlc3Ryb3llZCkpLnN1YnNjcmliZShkaXJlY3Rpb24gPT4ge1xuICAgICAgaWYgKHRoaXMuc2VydmljZXMuZWRpdEV2ZW50RGlzcGF0Y2hlci5lZGl0UmVmKSB7XG4gICAgICAgIHRoaXMuc2VydmljZXMuZWRpdEV2ZW50RGlzcGF0Y2hlci5lZGl0UmVmLmJsdXIoKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5zZXJ2aWNlcy5mb2N1c0Rpc3BhdGNoZXIubW92ZUZvY3VzSG9yaXpvbnRhbGx5KFxuICAgICAgICAgIGNsb3Nlc3QodGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQhLCBDRUxMX1NFTEVDVE9SKSBhcyBIVE1MRWxlbWVudCxcbiAgICAgICAgICBkaXJlY3Rpb24gPT09IEZvY3VzRXNjYXBlTm90aWZpZXJEaXJlY3Rpb24uU1RBUlQgPyAtMSA6IDEpO1xuXG4gICAgICB0aGlzLmNsb3NlRWRpdE92ZXJsYXkoKTtcbiAgICB9KTtcbiAgfVxufVxuXG4vKipcbiAqIEEgc3RydWN0dXJhbCBkaXJlY3RpdmUgdGhhdCBzaG93cyBpdHMgY29udGVudHMgd2hlbiB0aGUgdGFibGUgcm93IGNvbnRhaW5pbmdcbiAqIGl0IGlzIGhvdmVyZWQgb3Igd2hlbiBhbiBlbGVtZW50IGluIHRoZSByb3cgaGFzIGZvY3VzLlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbY2RrUm93SG92ZXJDb250ZW50XScsXG59KVxuZXhwb3J0IGNsYXNzIENka1Jvd0hvdmVyQ29udGVudCBpbXBsZW1lbnRzIEFmdGVyVmlld0luaXQsIE9uRGVzdHJveSB7XG4gIHByb3RlY3RlZCByZWFkb25seSBkZXN0cm95ZWQgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xuICBwcm90ZWN0ZWQgdmlld1JlZjogRW1iZWRkZWRWaWV3UmVmPGFueT58bnVsbCA9IG51bGw7XG5cbiAgcHJpdmF0ZSBfcm93PzogRWxlbWVudDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByb3RlY3RlZCByZWFkb25seSBzZXJ2aWNlczogRWRpdFNlcnZpY2VzLCBwcm90ZWN0ZWQgcmVhZG9ubHkgZWxlbWVudFJlZjogRWxlbWVudFJlZixcbiAgICAgIHByb3RlY3RlZCByZWFkb25seSB0ZW1wbGF0ZVJlZjogVGVtcGxhdGVSZWY8YW55PixcbiAgICAgIHByb3RlY3RlZCByZWFkb25seSB2aWV3Q29udGFpbmVyUmVmOiBWaWV3Q29udGFpbmVyUmVmKSB7fVxuXG4gIG5nQWZ0ZXJWaWV3SW5pdCgpOiB2b2lkIHtcbiAgICB0aGlzLl9yb3cgPSBjbG9zZXN0KHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50ISwgUk9XX1NFTEVDVE9SKSE7XG5cbiAgICB0aGlzLnNlcnZpY2VzLmVkaXRFdmVudERpc3BhdGNoZXIucmVnaXN0ZXJSb3dXaXRoSG92ZXJDb250ZW50KHRoaXMuX3Jvdyk7XG4gICAgdGhpcy5fbGlzdGVuRm9ySG92ZXJBbmRGb2N1c0V2ZW50cygpO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgdGhpcy5kZXN0cm95ZWQubmV4dCgpO1xuICAgIHRoaXMuZGVzdHJveWVkLmNvbXBsZXRlKCk7XG5cbiAgICBpZiAodGhpcy52aWV3UmVmKSB7XG4gICAgICB0aGlzLnZpZXdSZWYuZGVzdHJveSgpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9yb3cpIHtcbiAgICAgIHRoaXMuc2VydmljZXMuZWRpdEV2ZW50RGlzcGF0Y2hlci5kZXJlZ2lzdGVyUm93V2l0aEhvdmVyQ29udGVudCh0aGlzLl9yb3cpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgaW1tZWRpYXRlbHkgYWZ0ZXIgdGhlIGhvdmVyIGNvbnRlbnQgaXMgY3JlYXRlZCBhbmQgYWRkZWQgdG8gdGhlIGRvbS5cbiAgICogSW4gdGhlIENESyB2ZXJzaW9uLCB0aGlzIGlzIGEgbm9vcCBidXQgc3ViY2xhc3NlcyBzdWNoIGFzIE1hdFJvd0hvdmVyQ29udGVudCB1c2UgdGhpc1xuICAgKiB0byBwcmVwYXJlL3N0eWxlIHRoZSBpbnNlcnRlZCBlbGVtZW50LlxuICAgKi9cbiAgcHJvdGVjdGVkIGluaXRFbGVtZW50KF86IEhUTUxFbGVtZW50KTogdm9pZCB7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gdGhlIGhvdmVyIGNvbnRlbnQgbmVlZHMgdG8gYmUgZm9jdXNhYmxlIHRvIHByZXNlcnZlIGEgcmVhc29uYWJsZSB0YWIgb3JkZXJpbmdcbiAgICogYnV0IHNob3VsZCBub3QgeWV0IGJlIHNob3duLlxuICAgKi9cbiAgcHJvdGVjdGVkIG1ha2VFbGVtZW50SGlkZGVuQnV0Rm9jdXNhYmxlKGVsZW1lbnQ6IEhUTUxFbGVtZW50KTogdm9pZCB7XG4gICAgZWxlbWVudC5zdHlsZS5vcGFjaXR5ID0gJzAnO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIHRoZSBob3ZlciBjb250ZW50IG5lZWRzIHRvIGJlIGZvY3VzYWJsZSB0byBwcmVzZXJ2ZSBhIHJlYXNvbmFibGUgdGFiIG9yZGVyaW5nXG4gICAqIGJ1dCBzaG91bGQgbm90IHlldCBiZSBzaG93bi5cbiAgICovXG4gIHByb3RlY3RlZCBtYWtlRWxlbWVudFZpc2libGUoZWxlbWVudDogSFRNTEVsZW1lbnQpOiB2b2lkIHtcbiAgICBlbGVtZW50LnN0eWxlLm9wYWNpdHkgPSAnJztcbiAgfVxuXG4gIHByaXZhdGUgX2xpc3RlbkZvckhvdmVyQW5kRm9jdXNFdmVudHMoKTogdm9pZCB7XG4gICAgdGhpcy5zZXJ2aWNlcy5lZGl0RXZlbnREaXNwYXRjaGVyLmhvdmVyT3JGb2N1c09uUm93KHRoaXMuX3JvdyEpXG4gICAgICAgIC5waXBlKHRha2VVbnRpbCh0aGlzLmRlc3Ryb3llZCkpXG4gICAgICAgIC5zdWJzY3JpYmUoZXZlbnRTdGF0ZSA9PiB7XG4gICAgICAgICAgLy8gV2hlbiBpbiBGT0NVU0FCTEUgc3RhdGUsIGFkZCB0aGUgaG92ZXIgY29udGVudCB0byB0aGUgZG9tIGJ1dCBtYWtlIGl0IHRyYW5zcGFyZW50IHNvXG4gICAgICAgICAgLy8gdGhhdCBpdCBpcyBpbiB0aGUgdGFiIG9yZGVyIHJlbGF0aXZlIHRvIHRoZSBjdXJyZW50bHkgZm9jdXNlZCByb3cuXG5cbiAgICAgICAgICBpZiAoZXZlbnRTdGF0ZSA9PT0gSG92ZXJDb250ZW50U3RhdGUuT04gfHwgZXZlbnRTdGF0ZSA9PT0gSG92ZXJDb250ZW50U3RhdGUuRk9DVVNBQkxFKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMudmlld1JlZikge1xuICAgICAgICAgICAgICB0aGlzLnZpZXdSZWYgPSB0aGlzLnZpZXdDb250YWluZXJSZWYuY3JlYXRlRW1iZWRkZWRWaWV3KHRoaXMudGVtcGxhdGVSZWYsIHt9KTtcbiAgICAgICAgICAgICAgdGhpcy5pbml0RWxlbWVudCh0aGlzLnZpZXdSZWYucm9vdE5vZGVzWzBdIGFzIEhUTUxFbGVtZW50KTtcbiAgICAgICAgICAgICAgdGhpcy52aWV3UmVmLm1hcmtGb3JDaGVjaygpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnZpZXdDb250YWluZXJSZWYuaW5kZXhPZih0aGlzLnZpZXdSZWYpID09PSAtMSkge1xuICAgICAgICAgICAgICB0aGlzLnZpZXdDb250YWluZXJSZWYuaW5zZXJ0KHRoaXMudmlld1JlZiEpO1xuICAgICAgICAgICAgICB0aGlzLnZpZXdSZWYubWFya0ZvckNoZWNrKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChldmVudFN0YXRlID09PSBIb3ZlckNvbnRlbnRTdGF0ZS5PTikge1xuICAgICAgICAgICAgICB0aGlzLm1ha2VFbGVtZW50VmlzaWJsZSh0aGlzLnZpZXdSZWYucm9vdE5vZGVzWzBdIGFzIEhUTUxFbGVtZW50KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHRoaXMubWFrZUVsZW1lbnRIaWRkZW5CdXRGb2N1c2FibGUodGhpcy52aWV3UmVmLnJvb3ROb2Rlc1swXSBhcyBIVE1MRWxlbWVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnZpZXdSZWYpIHtcbiAgICAgICAgICAgIHRoaXMudmlld0NvbnRhaW5lclJlZi5kZXRhY2godGhpcy52aWV3Q29udGFpbmVyUmVmLmluZGV4T2YodGhpcy52aWV3UmVmKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgfVxufVxuXG4vKipcbiAqIE9wZW5zIHRoZSBjbG9zZXN0IGVkaXQgcG9wb3ZlciB0byB0aGlzIGVsZW1lbnQsIHdoZXRoZXIgaXQncyBhc3NvY2lhdGVkIHdpdGggdGhpcyBleGFjdFxuICogZWxlbWVudCBvciBhbiBhbmNlc3RvciBlbGVtZW50LlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbY2RrRWRpdE9wZW5dJyxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrRWRpdE9wZW4ge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByb3RlY3RlZCByZWFkb25seSBlbGVtZW50UmVmOiBFbGVtZW50UmVmPEhUTUxFbGVtZW50PixcbiAgICAgIHByb3RlY3RlZCByZWFkb25seSBlZGl0RXZlbnREaXNwYXRjaGVyOiBFZGl0RXZlbnREaXNwYXRjaGVyKSB7XG5cbiAgICBjb25zdCBuYXRpdmVFbGVtZW50ID0gZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50O1xuXG4gICAgLy8gUHJldmVudCBhY2NpZGVudGFsIGZvcm0gc3VibWl0cy5cbiAgICBpZiAobmF0aXZlRWxlbWVudC5ub2RlTmFtZSA9PT0gJ0JVVFRPTicgJiYgIW5hdGl2ZUVsZW1lbnQuZ2V0QXR0cmlidXRlKCd0eXBlJykpIHtcbiAgICAgIG5hdGl2ZUVsZW1lbnQuc2V0QXR0cmlidXRlKCd0eXBlJywgJ2J1dHRvbicpO1xuICAgIH1cbiAgfVxuXG4gIC8vIEluIEl2eSB0aGUgYGhvc3RgIG1ldGFkYXRhIHdpbGwgYmUgbWVyZ2VkLCB3aGVyZWFzIGluIFZpZXdFbmdpbmUgaXQgaXMgb3ZlcnJpZGRlbi4gSW4gb3JkZXJcbiAgLy8gdG8gYXZvaWQgZG91YmxlIGV2ZW50IGxpc3RlbmVycywgd2UgbmVlZCB0byB1c2UgYEhvc3RMaXN0ZW5lcmAuIE9uY2UgSXZ5IGlzIHRoZSBkZWZhdWx0LCB3ZVxuICAvLyBjYW4gbW92ZSB0aGlzIGJhY2sgaW50byBgaG9zdGAuXG4gIC8vIHRzbGludDpkaXNhYmxlOm5vLWhvc3QtZGVjb3JhdG9yLWluLWNvbmNyZXRlXG4gIEBIb3N0TGlzdGVuZXIoJ2NsaWNrJywgWyckZXZlbnQnXSlcbiAgb3BlbkVkaXQoZXZ0OiBFdmVudCk6IHZvaWQge1xuICAgIHRoaXMuZWRpdEV2ZW50RGlzcGF0Y2hlci5lZGl0aW5nLm5leHQoY2xvc2VzdCh0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCEsIENFTExfU0VMRUNUT1IpKTtcbiAgICBldnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gIH1cbn1cbiJdfQ==