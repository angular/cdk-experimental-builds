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
const MOUSE_MOVE_THROTTLE_TIME_MS = 10;
/**
 * A directive that must be attached to enable editability on a table.
 * It is responsible for setting up delegated event handlers and providing the
 * EditEventDispatcher service for use by the other edit directives.
 */
let CdkEditable = /** @class */ (() => {
    class CdkEditable {
        constructor(elementRef, editEventDispatcher, focusDispatcher, ngZone) {
            this.elementRef = elementRef;
            this.editEventDispatcher = editEventDispatcher;
            this.focusDispatcher = focusDispatcher;
            this.ngZone = ngZone;
            this.destroyed = new Subject();
        }
        ngAfterViewInit() {
            this._listenForTableEvents();
        }
        ngOnDestroy() {
            this.destroyed.next();
            this.destroyed.complete();
        }
        _listenForTableEvents() {
            const element = this.elementRef.nativeElement;
            const toClosest = (selector) => map((event) => closest(event.target, selector));
            this.ngZone.runOutsideAngular(() => {
                // Track mouse movement over the table to hide/show hover content.
                fromEvent(element, 'mouseover').pipe(toClosest(ROW_SELECTOR), takeUntil(this.destroyed)).subscribe(this.editEventDispatcher.hovering);
                fromEvent(element, 'mouseleave').pipe(mapTo(null), takeUntil(this.destroyed)).subscribe(this.editEventDispatcher.hovering);
                fromEvent(element, 'mousemove').pipe(throttleTime(MOUSE_MOVE_THROTTLE_TIME_MS), toClosest(ROW_SELECTOR), takeUntil(this.destroyed)).subscribe(this.editEventDispatcher.mouseMove);
                // Track focus within the table to hide/show/make focusable hover content.
                fromEventPattern(handler => element.addEventListener('focus', handler, true), handler => element.removeEventListener('focus', handler, true)).pipe(takeUntil(this.destroyed), toClosest(ROW_SELECTOR), share()).subscribe(this.editEventDispatcher.focused);
                merge(fromEventPattern(handler => element.addEventListener('blur', handler, true), handler => element.removeEventListener('blur', handler, true)), fromEvent(element, 'keydown').pipe(filter(event => event.key === 'Escape'))).pipe(takeUntil(this.destroyed), mapTo(null), share()).subscribe(this.editEventDispatcher.focused);
                // Keep track of rows within the table. This is used to know which rows with hover content
                // are first or last in the table. They are kept focusable in case focus enters from above
                // or below the table.
                this.ngZone.onStable.pipe(takeUntil(this.destroyed), 
                // Optimization: ignore dom changes while focus is within the table as we already
                // ensure that rows above and below the focused/active row are tabbable.
                withLatestFrom(this.editEventDispatcher.editingOrFocused), filter(([_, activeRow]) => activeRow == null), map(() => element.querySelectorAll(ROW_SELECTOR)), share()).subscribe(this.editEventDispatcher.allRows);
                fromEvent(element, 'keydown').pipe(filter(event => event.key === 'Enter'), toClosest(CELL_SELECTOR), takeUntil(this.destroyed)).subscribe(this.editEventDispatcher.editing);
                // Keydown must be used here or else key autorepeat does not work properly on some platforms.
                fromEvent(element, 'keydown')
                    .pipe(takeUntil(this.destroyed))
                    .subscribe(this.focusDispatcher.keyObserver);
            });
        }
    }
    CdkEditable.decorators = [
        { type: Directive, args: [{
                    selector: 'table[editable], cdk-table[editable], mat-table[editable]',
                    providers: [EditEventDispatcher, EditServices],
                },] }
    ];
    CdkEditable.ctorParameters = () => [
        { type: ElementRef },
        { type: EditEventDispatcher },
        { type: FocusDispatcher },
        { type: NgZone }
    ];
    return CdkEditable;
})();
export { CdkEditable };
const POPOVER_EDIT_HOST_BINDINGS = {
    '[attr.tabindex]': 'disabled ? null : 0',
    'class': 'cdk-popover-edit-cell',
    '[attr.aria-haspopup]': '!disabled',
};
const POPOVER_EDIT_INPUTS = [
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
let CdkPopoverEdit = /** @class */ (() => {
    class CdkPopoverEdit {
        constructor(services, elementRef, viewContainerRef) {
            this.services = services;
            this.elementRef = elementRef;
            this.viewContainerRef = viewContainerRef;
            /** The edit lens template shown over the cell on edit. */
            this.template = null;
            this._colspan = {};
            this._disabled = false;
            this.destroyed = new Subject();
        }
        /**
         * Specifies that the popup should cover additional table cells before and/or after
         * this one.
         */
        get colspan() {
            return this._colspan;
        }
        set colspan(value) {
            this._colspan = value;
            // Recompute positioning when the colspan changes.
            if (this.overlayRef) {
                this.overlayRef.updatePositionStrategy(this._getPositionStrategy());
                if (this.overlayRef.hasAttached()) {
                    this._updateOverlaySize();
                }
            }
        }
        /** Whether popover edit is disabled for this cell. */
        get disabled() {
            return this._disabled;
        }
        set disabled(value) {
            this._disabled = value;
            if (value) {
                this.services.editEventDispatcher.doneEditingCell(this.elementRef.nativeElement);
                this.services.editEventDispatcher.disabledCells.set(this.elementRef.nativeElement, true);
            }
            else {
                this.services.editEventDispatcher.disabledCells.delete(this.elementRef.nativeElement);
            }
        }
        ngAfterViewInit() {
            this._startListeningToEditEvents();
        }
        ngOnDestroy() {
            this.destroyed.next();
            this.destroyed.complete();
            if (this.focusTrap) {
                this.focusTrap.destroy();
                this.focusTrap = undefined;
            }
            if (this.overlayRef) {
                this.overlayRef.dispose();
            }
        }
        initFocusTrap() {
            this.focusTrap = this.services.focusTrapFactory.create(this.overlayRef.overlayElement);
        }
        closeEditOverlay() {
            this.services.editEventDispatcher.doneEditingCell(this.elementRef.nativeElement);
        }
        panelClass() {
            return EDIT_PANE_CLASS;
        }
        _startListeningToEditEvents() {
            this.services.editEventDispatcher.editingCell(this.elementRef.nativeElement)
                .pipe(takeUntil(this.destroyed))
                .subscribe((open) => {
                if (open && this.template) {
                    if (!this.overlayRef) {
                        this._createEditOverlay();
                    }
                    this._showEditOverlay();
                }
                else if (this.overlayRef) {
                    this._maybeReturnFocusToCell();
                    this.overlayRef.detach();
                }
            });
        }
        _createEditOverlay() {
            this.overlayRef = this.services.overlay.create({
                disposeOnNavigation: true,
                panelClass: this.panelClass(),
                positionStrategy: this._getPositionStrategy(),
                scrollStrategy: this.services.overlay.scrollStrategies.reposition(),
                direction: this.services.directionality,
            });
            this.initFocusTrap();
            this.overlayRef.overlayElement.setAttribute('aria-role', 'dialog');
            this.overlayRef.detachments().subscribe(() => this.closeEditOverlay());
        }
        _showEditOverlay() {
            this.overlayRef.attach(new TemplatePortal(this.template, this.viewContainerRef, { $implicit: this.context }));
            // We have to defer trapping focus, because doing so too early can cause the form inside
            // the overlay to be submitted immediately if it was opened on an Enter keydown event.
            this.services.ngZone.runOutsideAngular(() => {
                setTimeout(() => {
                    this.focusTrap.focusInitialElement();
                });
            });
            // Update the size of the popup initially and on subsequent changes to
            // scroll position and viewport size.
            merge(this.services.scrollDispatcher.scrolled(), this.services.viewportRuler.change())
                .pipe(startWith(null), takeUntil(this.overlayRef.detachments()), takeUntil(this.destroyed))
                .subscribe(() => {
                this._updateOverlaySize();
            });
        }
        _getOverlayCells() {
            const cell = closest(this.elementRef.nativeElement, CELL_SELECTOR);
            if (!this._colspan.before && !this._colspan.after) {
                return [cell];
            }
            const row = closest(this.elementRef.nativeElement, ROW_SELECTOR);
            const rowCells = Array.from(row.querySelectorAll(CELL_SELECTOR));
            const ownIndex = rowCells.indexOf(cell);
            return rowCells.slice(ownIndex - (this._colspan.before || 0), ownIndex + (this._colspan.after || 0) + 1);
        }
        _getPositionStrategy() {
            return this.services.positionFactory.positionStrategyForCells(this._getOverlayCells());
        }
        _updateOverlaySize() {
            this.overlayRef.updateSize(this.services.positionFactory.sizeConfigForCells(this._getOverlayCells()));
        }
        _maybeReturnFocusToCell() {
            if (closest(document.activeElement, EDIT_PANE_SELECTOR) ===
                this.overlayRef.overlayElement) {
                this.elementRef.nativeElement.focus();
            }
        }
    }
    CdkPopoverEdit.decorators = [
        { type: Directive, args: [{
                    selector: '[cdkPopoverEdit]:not([cdkPopoverEditTabOut])',
                    host: POPOVER_EDIT_HOST_BINDINGS,
                    inputs: POPOVER_EDIT_INPUTS,
                },] }
    ];
    CdkPopoverEdit.ctorParameters = () => [
        { type: EditServices },
        { type: ElementRef },
        { type: ViewContainerRef }
    ];
    return CdkPopoverEdit;
})();
export { CdkPopoverEdit };
/**
 * Attaches an ng-template to a cell and shows it when instructed to by the
 * EditEventDispatcher service.
 * Makes the cell focusable.
 */
let CdkPopoverEditTabOut = /** @class */ (() => {
    class CdkPopoverEditTabOut extends CdkPopoverEdit {
        constructor(elementRef, viewContainerRef, services, focusEscapeNotifierFactory) {
            super(services, elementRef, viewContainerRef);
            this.focusEscapeNotifierFactory = focusEscapeNotifierFactory;
        }
        initFocusTrap() {
            this.focusTrap = this.focusEscapeNotifierFactory.create(this.overlayRef.overlayElement);
            this.focusTrap.escapes().pipe(takeUntil(this.destroyed)).subscribe(direction => {
                if (this.services.editEventDispatcher.editRef) {
                    this.services.editEventDispatcher.editRef.blur();
                }
                this.services.focusDispatcher.moveFocusHorizontally(closest(this.elementRef.nativeElement, CELL_SELECTOR), direction === 0 /* START */ ? -1 : 1);
                this.closeEditOverlay();
            });
        }
    }
    CdkPopoverEditTabOut.decorators = [
        { type: Directive, args: [{
                    selector: '[cdkPopoverEdit][cdkPopoverEditTabOut]',
                    host: POPOVER_EDIT_HOST_BINDINGS,
                    inputs: POPOVER_EDIT_INPUTS,
                },] }
    ];
    CdkPopoverEditTabOut.ctorParameters = () => [
        { type: ElementRef },
        { type: ViewContainerRef },
        { type: EditServices },
        { type: FocusEscapeNotifierFactory }
    ];
    return CdkPopoverEditTabOut;
})();
export { CdkPopoverEditTabOut };
/**
 * A structural directive that shows its contents when the table row containing
 * it is hovered or when an element in the row has focus.
 */
let CdkRowHoverContent = /** @class */ (() => {
    class CdkRowHoverContent {
        constructor(services, elementRef, templateRef, viewContainerRef) {
            this.services = services;
            this.elementRef = elementRef;
            this.templateRef = templateRef;
            this.viewContainerRef = viewContainerRef;
            this.destroyed = new Subject();
            this.viewRef = null;
        }
        ngAfterViewInit() {
            this._row = closest(this.elementRef.nativeElement, ROW_SELECTOR);
            this.services.editEventDispatcher.registerRowWithHoverContent(this._row);
            this._listenForHoverAndFocusEvents();
        }
        ngOnDestroy() {
            this.destroyed.next();
            this.destroyed.complete();
            if (this.viewRef) {
                this.viewRef.destroy();
            }
            if (this._row) {
                this.services.editEventDispatcher.deregisterRowWithHoverContent(this._row);
            }
        }
        /**
         * Called immediately after the hover content is created and added to the dom.
         * In the CDK version, this is a noop but subclasses such as MatRowHoverContent use this
         * to prepare/style the inserted element.
         */
        initElement(_) {
        }
        /**
         * Called when the hover content needs to be focusable to preserve a reasonable tab ordering
         * but should not yet be shown.
         */
        makeElementHiddenButFocusable(element) {
            element.style.opacity = '0';
        }
        /**
         * Called when the hover content needs to be focusable to preserve a reasonable tab ordering
         * but should not yet be shown.
         */
        makeElementVisible(element) {
            element.style.opacity = '';
        }
        _listenForHoverAndFocusEvents() {
            this.services.editEventDispatcher.hoverOrFocusOnRow(this._row)
                .pipe(takeUntil(this.destroyed))
                .subscribe(eventState => {
                // When in FOCUSABLE state, add the hover content to the dom but make it transparent so
                // that it is in the tab order relative to the currently focused row.
                if (eventState === 2 /* ON */ || eventState === 1 /* FOCUSABLE */) {
                    if (!this.viewRef) {
                        this.viewRef = this.viewContainerRef.createEmbeddedView(this.templateRef, {});
                        this.initElement(this.viewRef.rootNodes[0]);
                        this.viewRef.markForCheck();
                    }
                    else if (this.viewContainerRef.indexOf(this.viewRef) === -1) {
                        this.viewContainerRef.insert(this.viewRef);
                        this.viewRef.markForCheck();
                    }
                    if (eventState === 2 /* ON */) {
                        this.makeElementVisible(this.viewRef.rootNodes[0]);
                    }
                    else {
                        this.makeElementHiddenButFocusable(this.viewRef.rootNodes[0]);
                    }
                }
                else if (this.viewRef) {
                    this.viewContainerRef.detach(this.viewContainerRef.indexOf(this.viewRef));
                }
            });
        }
    }
    CdkRowHoverContent.decorators = [
        { type: Directive, args: [{
                    selector: '[cdkRowHoverContent]',
                },] }
    ];
    CdkRowHoverContent.ctorParameters = () => [
        { type: EditServices },
        { type: ElementRef },
        { type: TemplateRef },
        { type: ViewContainerRef }
    ];
    return CdkRowHoverContent;
})();
export { CdkRowHoverContent };
/**
 * Opens the closest edit popover to this element, whether it's associated with this exact
 * element or an ancestor element.
 */
let CdkEditOpen = /** @class */ (() => {
    class CdkEditOpen {
        constructor(elementRef, editEventDispatcher) {
            this.elementRef = elementRef;
            this.editEventDispatcher = editEventDispatcher;
            const nativeElement = elementRef.nativeElement;
            // Prevent accidental form submits.
            if (nativeElement.nodeName === 'BUTTON' && !nativeElement.getAttribute('type')) {
                nativeElement.setAttribute('type', 'button');
            }
        }
        // In Ivy the `host` metadata will be merged, whereas in ViewEngine it is overridden. In order
        // to avoid double event listeners, we need to use `HostListener`. Once Ivy is the default, we
        // can move this back into `host`.
        // tslint:disable:no-host-decorator-in-concrete
        openEdit(evt) {
            this.editEventDispatcher.editing.next(closest(this.elementRef.nativeElement, CELL_SELECTOR));
            evt.stopPropagation();
        }
    }
    CdkEditOpen.decorators = [
        { type: Directive, args: [{
                    selector: '[cdkEditOpen]',
                },] }
    ];
    CdkEditOpen.ctorParameters = () => [
        { type: ElementRef },
        { type: EditEventDispatcher }
    ];
    CdkEditOpen.propDecorators = {
        openEdit: [{ type: HostListener, args: ['click', ['$event'],] }]
    };
    return CdkEditOpen;
})();
export { CdkEditOpen };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFibGUtZGlyZWN0aXZlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL3BvcG92ZXItZWRpdC90YWJsZS1kaXJlY3RpdmVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQVNBLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUNuRCxPQUFPLEVBRUwsU0FBUyxFQUNULFVBQVUsRUFFVixNQUFNLEVBRU4sV0FBVyxFQUNYLGdCQUFnQixFQUNoQixZQUFZLEdBQ2IsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFDLFNBQVMsRUFBRSxnQkFBZ0IsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQ2pFLE9BQU8sRUFDTCxNQUFNLEVBQ04sR0FBRyxFQUNILEtBQUssRUFDTCxLQUFLLEVBQ0wsU0FBUyxFQUNULFNBQVMsRUFDVCxZQUFZLEVBQ1osY0FBYyxHQUNmLE1BQU0sZ0JBQWdCLENBQUM7QUFFeEIsT0FBTyxFQUFDLGFBQWEsRUFBRSxlQUFlLEVBQUUsa0JBQWtCLEVBQUUsWUFBWSxFQUFDLE1BQU0sYUFBYSxDQUFDO0FBQzdGLE9BQU8sRUFBQyxtQkFBbUIsRUFBb0IsTUFBTSx5QkFBeUIsQ0FBQztBQUMvRSxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDN0MsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLG9CQUFvQixDQUFDO0FBQ25ELE9BQU8sRUFHTCwwQkFBMEIsRUFDM0IsTUFBTSx5QkFBeUIsQ0FBQztBQUNqQyxPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sWUFBWSxDQUFDO0FBWW5DLCtDQUErQztBQUMvQyxNQUFNLDJCQUEyQixHQUFHLEVBQUUsQ0FBQztBQUV2Qzs7OztHQUlHO0FBQ0g7SUFBQSxNQUlhLFdBQVc7UUFHdEIsWUFDdUIsVUFBc0IsRUFDdEIsbUJBQXdDLEVBQ3hDLGVB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QUFFLHNCQUFzQjtpQkFDakM7OztnQkF4V08sWUFBWTtnQkF0QmxCLFVBQVU7Z0JBSVYsV0FBVztnQkFDWCxnQkFBZ0I7O0lBNGNsQix5QkFBQztLQUFBO1NBbEZZLGtCQUFrQjtBQW9GL0I7OztHQUdHO0FBQ0g7SUFBQSxNQUdhLFdBQVc7UUFDdEIsWUFDdUIsVUFBbUMsRUFDbkMsbUJBQXdDO1lBRHhDLGVBQVUsR0FBVixVQUFVLENBQXlCO1lBQ25DLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBcUI7WUFFN0QsTUFBTSxhQUFhLEdBQUcsVUFBVSxDQUFDLGFBQWEsQ0FBQztZQUUvQyxtQ0FBbUM7WUFDbkMsSUFBSSxhQUFhLENBQUMsUUFBUSxLQUFLLFFBQVEsSUFBSSxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLEVBQUU7Z0JBQzlFLGFBQWEsQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDO2FBQzlDO1FBQ0gsQ0FBQztRQUVELDhGQUE4RjtRQUM5Riw4RkFBOEY7UUFDOUYsa0NBQWtDO1FBQ2xDLCtDQUErQztRQUUvQyxRQUFRLENBQUMsR0FBVTtZQUNqQixJQUFJLENBQUMsbUJBQW1CLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxhQUFjLEVBQUUsYUFBYSxDQUFDLENBQUMsQ0FBQztZQUM5RixHQUFHLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDeEIsQ0FBQzs7O2dCQXhCRixTQUFTLFNBQUM7b0JBQ1QsUUFBUSxFQUFFLGVBQWU7aUJBQzFCOzs7Z0JBemRDLFVBQVU7Z0JBcUJKLG1CQUFtQjs7OzJCQXNkeEIsWUFBWSxTQUFDLE9BQU8sRUFBRSxDQUFDLFFBQVEsQ0FBQzs7SUFLbkMsa0JBQUM7S0FBQTtTQXRCWSxXQUFXIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge0ZvY3VzVHJhcH0gZnJvbSAnQGFuZ3VsYXIvY2RrL2ExMXknO1xuaW1wb3J0IHtPdmVybGF5UmVmLCBQb3NpdGlvblN0cmF0ZWd5fSBmcm9tICdAYW5ndWxhci9jZGsvb3ZlcmxheSc7XG5pbXBvcnQge1RlbXBsYXRlUG9ydGFsfSBmcm9tICdAYW5ndWxhci9jZGsvcG9ydGFsJztcbmltcG9ydCB7XG4gIEFmdGVyVmlld0luaXQsXG4gIERpcmVjdGl2ZSxcbiAgRWxlbWVudFJlZixcbiAgRW1iZWRkZWRWaWV3UmVmLFxuICBOZ1pvbmUsXG4gIE9uRGVzdHJveSxcbiAgVGVtcGxhdGVSZWYsXG4gIFZpZXdDb250YWluZXJSZWYsXG4gIEhvc3RMaXN0ZW5lcixcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge2Zyb21FdmVudCwgZnJvbUV2ZW50UGF0dGVybiwgbWVyZ2UsIFN1YmplY3R9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHtcbiAgZmlsdGVyLFxuICBtYXAsXG4gIG1hcFRvLFxuICBzaGFyZSxcbiAgc3RhcnRXaXRoLFxuICB0YWtlVW50aWwsXG4gIHRocm90dGxlVGltZSxcbiAgd2l0aExhdGVzdEZyb20sXG59IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcblxuaW1wb3J0IHtDRUxMX1NFTEVDVE9SLCBFRElUX1BBTkVfQ0xBU1MsIEVESVRfUEFORV9TRUxFQ1RPUiwgUk9XX1NFTEVDVE9SfSBmcm9tICcuL2NvbnN0YW50cyc7XG5pbXBvcnQge0VkaXRFdmVudERpc3BhdGNoZXIsIEhvdmVyQ29udGVudFN0YXRlfSBmcm9tICcuL2VkaXQtZXZlbnQtZGlzcGF0Y2hlcic7XG5pbXBvcnQge0VkaXRTZXJ2aWNlc30gZnJvbSAnLi9lZGl0LXNlcnZpY2VzJztcbmltcG9ydCB7Rm9jdXNEaXNwYXRjaGVyfSBmcm9tICcuL2ZvY3VzLWRpc3BhdGNoZXInO1xuaW1wb3J0IHtcbiAgRm9jdXNFc2NhcGVOb3RpZmllcixcbiAgRm9jdXNFc2NhcGVOb3RpZmllckRpcmVjdGlvbixcbiAgRm9jdXNFc2NhcGVOb3RpZmllckZhY3Rvcnlcbn0gZnJvbSAnLi9mb2N1cy1lc2NhcGUtbm90aWZpZXInO1xuaW1wb3J0IHtjbG9zZXN0fSBmcm9tICcuL3BvbHlmaWxsJztcblxuLyoqXG4gKiBEZXNjcmliZXMgdGhlIG51bWJlciBvZiBjb2x1bW5zIGJlZm9yZSBhbmQgYWZ0ZXIgdGhlIG9yaWdpbmF0aW5nIGNlbGwgdGhhdCB0aGVcbiAqIGVkaXQgcG9wdXAgc2hvdWxkIHNwYW4uIEluIGxlZnQgdG8gcmlnaHQgbG9jYWxlcywgYmVmb3JlIG1lYW5zIGxlZnQgYW5kIGFmdGVyIG1lYW5zXG4gKiByaWdodC4gSW4gcmlnaHQgdG8gbGVmdCBsb2NhbGVzIGJlZm9yZSBtZWFucyByaWdodCBhbmQgYWZ0ZXIgbWVhbnMgbGVmdC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBDZGtQb3BvdmVyRWRpdENvbHNwYW4ge1xuICBiZWZvcmU/OiBudW1iZXI7XG4gIGFmdGVyPzogbnVtYmVyO1xufVxuXG4vKiogVXNlZCBmb3IgcmF0ZS1saW1pdGluZyBtb3VzZW1vdmUgZXZlbnRzLiAqL1xuY29uc3QgTU9VU0VfTU9WRV9USFJPVFRMRV9USU1FX01TID0gMTA7XG5cbi8qKlxuICogQSBkaXJlY3RpdmUgdGhhdCBtdXN0IGJlIGF0dGFjaGVkIHRvIGVuYWJsZSBlZGl0YWJpbGl0eSBvbiBhIHRhYmxlLlxuICogSXQgaXMgcmVzcG9uc2libGUgZm9yIHNldHRpbmcgdXAgZGVsZWdhdGVkIGV2ZW50IGhhbmRsZXJzIGFuZCBwcm92aWRpbmcgdGhlXG4gKiBFZGl0RXZlbnREaXNwYXRjaGVyIHNlcnZpY2UgZm9yIHVzZSBieSB0aGUgb3RoZXIgZWRpdCBkaXJlY3RpdmVzLlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICd0YWJsZVtlZGl0YWJsZV0sIGNkay10YWJsZVtlZGl0YWJsZV0sIG1hdC10YWJsZVtlZGl0YWJsZV0nLFxuICBwcm92aWRlcnM6IFtFZGl0RXZlbnREaXNwYXRjaGVyLCBFZGl0U2VydmljZXNdLFxufSlcbmV4cG9ydCBjbGFzcyBDZGtFZGl0YWJsZSBpbXBsZW1lbnRzIEFmdGVyVmlld0luaXQsIE9uRGVzdHJveSB7XG4gIHByb3RlY3RlZCByZWFkb25seSBkZXN0cm95ZWQgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJvdGVjdGVkIHJlYWRvbmx5IGVsZW1lbnRSZWY6IEVsZW1lbnRSZWYsXG4gICAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgZWRpdEV2ZW50RGlzcGF0Y2hlcjogRWRpdEV2ZW50RGlzcGF0Y2hlcixcbiAgICAgIHByb3RlY3RlZCByZWFkb25seSBmb2N1c0Rpc3BhdGNoZXI6IEZvY3VzRGlzcGF0Y2hlciwgcHJvdGVjdGVkIHJlYWRvbmx5IG5nWm9uZTogTmdab25lKSB7fVxuXG4gIG5nQWZ0ZXJWaWV3SW5pdCgpOiB2b2lkIHtcbiAgICB0aGlzLl9saXN0ZW5Gb3JUYWJsZUV2ZW50cygpO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgdGhpcy5kZXN0cm95ZWQubmV4dCgpO1xuICAgIHRoaXMuZGVzdHJveWVkLmNvbXBsZXRlKCk7XG4gIH1cblxuICBwcml2YXRlIF9saXN0ZW5Gb3JUYWJsZUV2ZW50cygpOiB2b2lkIHtcbiAgICBjb25zdCBlbGVtZW50ID0gdGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQ7XG4gICAgY29uc3QgdG9DbG9zZXN0ID0gKHNlbGVjdG9yOiBzdHJpbmcpID0+XG4gICAgICAgIG1hcCgoZXZlbnQ6IFVJRXZlbnQpID0+IGNsb3Nlc3QoZXZlbnQudGFyZ2V0LCBzZWxlY3RvcikpO1xuXG4gICAgdGhpcy5uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgLy8gVHJhY2sgbW91c2UgbW92ZW1lbnQgb3ZlciB0aGUgdGFibGUgdG8gaGlkZS9zaG93IGhvdmVyIGNvbnRlbnQuXG4gICAgICBmcm9tRXZlbnQ8TW91c2VFdmVudD4oZWxlbWVudCwgJ21vdXNlb3ZlcicpLnBpcGUoXG4gICAgICAgICAgdG9DbG9zZXN0KFJPV19TRUxFQ1RPUiksXG4gICAgICAgICAgdGFrZVVudGlsKHRoaXMuZGVzdHJveWVkKSxcbiAgICAgICAgICApLnN1YnNjcmliZSh0aGlzLmVkaXRFdmVudERpc3BhdGNoZXIuaG92ZXJpbmcpO1xuICAgICAgZnJvbUV2ZW50PE1vdXNlRXZlbnQ+KGVsZW1lbnQsICdtb3VzZWxlYXZlJykucGlwZShcbiAgICAgICAgICBtYXBUbyhudWxsKSxcbiAgICAgICAgICB0YWtlVW50aWwodGhpcy5kZXN0cm95ZWQpLFxuICAgICAgICAgICkuc3Vic2NyaWJlKHRoaXMuZWRpdEV2ZW50RGlzcGF0Y2hlci5ob3ZlcmluZyk7XG4gICAgICBmcm9tRXZlbnQ8TW91c2VFdmVudD4oZWxlbWVudCwgJ21vdXNlbW92ZScpLnBpcGUoXG4gICAgICAgICAgdGhyb3R0bGVUaW1lKE1PVVNFX01PVkVfVEhST1RUTEVfVElNRV9NUyksXG4gICAgICAgICAgdG9DbG9zZXN0KFJPV19TRUxFQ1RPUiksXG4gICAgICAgICAgdGFrZVVudGlsKHRoaXMuZGVzdHJveWVkKSxcbiAgICAgICAgICApLnN1YnNjcmliZSh0aGlzLmVkaXRFdmVudERpc3BhdGNoZXIubW91c2VNb3ZlKTtcblxuICAgICAgLy8gVHJhY2sgZm9jdXMgd2l0aGluIHRoZSB0YWJsZSB0byBoaWRlL3Nob3cvbWFrZSBmb2N1c2FibGUgaG92ZXIgY29udGVudC5cbiAgICAgIGZyb21FdmVudFBhdHRlcm48Rm9jdXNFdmVudD4oXG4gICAgICAgICAgaGFuZGxlciA9PiBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2ZvY3VzJywgaGFuZGxlciwgdHJ1ZSksXG4gICAgICAgICAgaGFuZGxlciA9PiBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2ZvY3VzJywgaGFuZGxlciwgdHJ1ZSlcbiAgICAgICAgICApLnBpcGUoXG4gICAgICAgICAgICAgIHRha2VVbnRpbCh0aGlzLmRlc3Ryb3llZCksXG4gICAgICAgICAgICAgIHRvQ2xvc2VzdChST1dfU0VMRUNUT1IpLFxuICAgICAgICAgICAgICBzaGFyZSgpLFxuICAgICAgICAgICAgICApLnN1YnNjcmliZSh0aGlzLmVkaXRFdmVudERpc3BhdGNoZXIuZm9jdXNlZCk7XG5cbiAgICAgIG1lcmdlKFxuICAgICAgICBmcm9tRXZlbnRQYXR0ZXJuPEZvY3VzRXZlbnQ+KFxuICAgICAgICAgIGhhbmRsZXIgPT4gZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdibHVyJywgaGFuZGxlciwgdHJ1ZSksXG4gICAgICAgICAgaGFuZGxlciA9PiBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2JsdXInLCBoYW5kbGVyLCB0cnVlKVxuICAgICAgICApLFxuICAgICAgICBmcm9tRXZlbnQ8S2V5Ym9hcmRFdmVudD4oZWxlbWVudCwgJ2tleWRvd24nKS5waXBlKGZpbHRlcihldmVudCA9PiBldmVudC5rZXkgPT09ICdFc2NhcGUnKSlcbiAgICAgICkucGlwZShcbiAgICAgICAgdGFrZVVudGlsKHRoaXMuZGVzdHJveWVkKSxcbiAgICAgICAgbWFwVG8obnVsbCksXG4gICAgICAgIHNoYXJlKCksXG4gICAgICApLnN1YnNjcmliZSh0aGlzLmVkaXRFdmVudERpc3BhdGNoZXIuZm9jdXNlZCk7XG5cbiAgICAgIC8vIEtlZXAgdHJhY2sgb2Ygcm93cyB3aXRoaW4gdGhlIHRhYmxlLiBUaGlzIGlzIHVzZWQgdG8ga25vdyB3aGljaCByb3dzIHdpdGggaG92ZXIgY29udGVudFxuICAgICAgLy8gYXJlIGZpcnN0IG9yIGxhc3QgaW4gdGhlIHRhYmxlLiBUaGV5IGFyZSBrZXB0IGZvY3VzYWJsZSBpbiBjYXNlIGZvY3VzIGVudGVycyBmcm9tIGFib3ZlXG4gICAgICAvLyBvciBiZWxvdyB0aGUgdGFibGUuXG4gICAgICB0aGlzLm5nWm9uZS5vblN0YWJsZS5waXBlKFxuICAgICAgICAgIHRha2VVbnRpbCh0aGlzLmRlc3Ryb3llZCksXG4gICAgICAgICAgLy8gT3B0aW1pemF0aW9uOiBpZ25vcmUgZG9tIGNoYW5nZXMgd2hpbGUgZm9jdXMgaXMgd2l0aGluIHRoZSB0YWJsZSBhcyB3ZSBhbHJlYWR5XG4gICAgICAgICAgLy8gZW5zdXJlIHRoYXQgcm93cyBhYm92ZSBhbmQgYmVsb3cgdGhlIGZvY3VzZWQvYWN0aXZlIHJvdyBhcmUgdGFiYmFibGUuXG4gICAgICAgICAgd2l0aExhdGVzdEZyb20odGhpcy5lZGl0RXZlbnREaXNwYXRjaGVyLmVkaXRpbmdPckZvY3VzZWQpLFxuICAgICAgICAgIGZpbHRlcigoW18sIGFjdGl2ZVJvd10pID0+IGFjdGl2ZVJvdyA9PSBudWxsKSxcbiAgICAgICAgICBtYXAoKCkgPT4gZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKFJPV19TRUxFQ1RPUikpLFxuICAgICAgICAgIHNoYXJlKCksXG4gICAgICAgICAgKS5zdWJzY3JpYmUodGhpcy5lZGl0RXZlbnREaXNwYXRjaGVyLmFsbFJvd3MpO1xuXG4gICAgICBmcm9tRXZlbnQ8S2V5Ym9hcmRFdmVudD4oZWxlbWVudCwgJ2tleWRvd24nKS5waXBlKFxuICAgICAgICAgIGZpbHRlcihldmVudCA9PiBldmVudC5rZXkgPT09ICdFbnRlcicpLFxuICAgICAgICAgIHRvQ2xvc2VzdChDRUxMX1NFTEVDVE9SKSxcbiAgICAgICAgICB0YWtlVW50aWwodGhpcy5kZXN0cm95ZWQpLFxuICAgICAgICAgICkuc3Vic2NyaWJlKHRoaXMuZWRpdEV2ZW50RGlzcGF0Y2hlci5lZGl0aW5nKTtcblxuICAgICAgLy8gS2V5ZG93biBtdXN0IGJlIHVzZWQgaGVyZSBvciBlbHNlIGtleSBhdXRvcmVwZWF0IGRvZXMgbm90IHdvcmsgcHJvcGVybHkgb24gc29tZSBwbGF0Zm9ybXMuXG4gICAgICBmcm9tRXZlbnQ8S2V5Ym9hcmRFdmVudD4oZWxlbWVudCwgJ2tleWRvd24nKVxuICAgICAgICAgIC5waXBlKHRha2VVbnRpbCh0aGlzLmRlc3Ryb3llZCkpXG4gICAgICAgICAgLnN1YnNjcmliZSh0aGlzLmZvY3VzRGlzcGF0Y2hlci5rZXlPYnNlcnZlcik7XG4gICAgfSk7XG4gIH1cbn1cblxuY29uc3QgUE9QT1ZFUl9FRElUX0hPU1RfQklORElOR1MgPSB7XG4gICdbYXR0ci50YWJpbmRleF0nOiAnZGlzYWJsZWQgPyBudWxsIDogMCcsXG4gICdjbGFzcyc6ICdjZGstcG9wb3Zlci1lZGl0LWNlbGwnLFxuICAnW2F0dHIuYXJpYS1oYXNwb3B1cF0nOiAnIWRpc2FibGVkJyxcbn07XG5cbmNvbnN0IFBPUE9WRVJfRURJVF9JTlBVVFMgPSBbXG4gICd0ZW1wbGF0ZTogY2RrUG9wb3ZlckVkaXQnLFxuICAnY29udGV4dDogY2RrUG9wb3ZlckVkaXRDb250ZXh0JyxcbiAgJ2NvbHNwYW46IGNka1BvcG92ZXJFZGl0Q29sc3BhbicsXG4gICdkaXNhYmxlZDogY2RrUG9wb3ZlckVkaXREaXNhYmxlZCcsXG5dO1xuXG4vKipcbiAqIEF0dGFjaGVzIGFuIG5nLXRlbXBsYXRlIHRvIGEgY2VsbCBhbmQgc2hvd3MgaXQgd2hlbiBpbnN0cnVjdGVkIHRvIGJ5IHRoZVxuICogRWRpdEV2ZW50RGlzcGF0Y2hlciBzZXJ2aWNlLlxuICogTWFrZXMgdGhlIGNlbGwgZm9jdXNhYmxlLlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbY2RrUG9wb3ZlckVkaXRdOm5vdChbY2RrUG9wb3ZlckVkaXRUYWJPdXRdKScsXG4gIGhvc3Q6IFBPUE9WRVJfRURJVF9IT1NUX0JJTkRJTkdTLFxuICBpbnB1dHM6IFBPUE9WRVJfRURJVF9JTlBVVFMsXG59KVxuZXhwb3J0IGNsYXNzIENka1BvcG92ZXJFZGl0PEM+IGltcGxlbWVudHMgQWZ0ZXJWaWV3SW5pdCwgT25EZXN0cm95IHtcbiAgLyoqIFRoZSBlZGl0IGxlbnMgdGVtcGxhdGUgc2hvd24gb3ZlciB0aGUgY2VsbCBvbiBlZGl0LiAqL1xuICB0ZW1wbGF0ZTogVGVtcGxhdGVSZWY8YW55PnxudWxsID0gbnVsbDtcblxuICAvKipcbiAgICogSW1wbGljaXQgY29udGV4dCB0byBwYXNzIGFsb25nIHRvIHRoZSB0ZW1wbGF0ZS4gQ2FuIGJlIG9taXR0ZWQgaWYgdGhlIHRlbXBsYXRlXG4gICAqIGlzIGRlZmluZWQgd2l0aGluIHRoZSBjZWxsLlxuICAgKi9cbiAgY29udGV4dD86IEM7XG5cbiAgLyoqXG4gICAqIFNwZWNpZmllcyB0aGF0IHRoZSBwb3B1cCBzaG91bGQgY292ZXIgYWRkaXRpb25hbCB0YWJsZSBjZWxscyBiZWZvcmUgYW5kL29yIGFmdGVyXG4gICAqIHRoaXMgb25lLlxuICAgKi9cbiAgZ2V0IGNvbHNwYW4oKTogQ2RrUG9wb3ZlckVkaXRDb2xzcGFuIHtcbiAgICByZXR1cm4gdGhpcy5fY29sc3BhbjtcbiAgfVxuICBzZXQgY29sc3Bhbih2YWx1ZTogQ2RrUG9wb3ZlckVkaXRDb2xzcGFuKSB7XG4gICAgdGhpcy5fY29sc3BhbiA9IHZhbHVlO1xuXG4gICAgLy8gUmVjb21wdXRlIHBvc2l0aW9uaW5nIHdoZW4gdGhlIGNvbHNwYW4gY2hhbmdlcy5cbiAgICBpZiAodGhpcy5vdmVybGF5UmVmKSB7XG4gICAgICB0aGlzLm92ZXJsYXlSZWYudXBkYXRlUG9zaXRpb25TdHJhdGVneSh0aGlzLl9nZXRQb3NpdGlvblN0cmF0ZWd5KCkpO1xuXG4gICAgICBpZiAodGhpcy5vdmVybGF5UmVmLmhhc0F0dGFjaGVkKCkpIHtcbiAgICAgICAgdGhpcy5fdXBkYXRlT3ZlcmxheVNpemUoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcHJpdmF0ZSBfY29sc3BhbjogQ2RrUG9wb3ZlckVkaXRDb2xzcGFuID0ge307XG5cbiAgLyoqIFdoZXRoZXIgcG9wb3ZlciBlZGl0IGlzIGRpc2FibGVkIGZvciB0aGlzIGNlbGwuICovXG4gIGdldCBkaXNhYmxlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fZGlzYWJsZWQ7XG4gIH1cbiAgc2V0IGRpc2FibGVkKHZhbHVlOiBib29sZWFuKSB7XG4gICAgdGhpcy5fZGlzYWJsZWQgPSB2YWx1ZTtcblxuICAgIGlmICh2YWx1ZSkge1xuICAgICAgdGhpcy5zZXJ2aWNlcy5lZGl0RXZlbnREaXNwYXRjaGVyLmRvbmVFZGl0aW5nQ2VsbCh0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCEpO1xuICAgICAgdGhpcy5zZXJ2aWNlcy5lZGl0RXZlbnREaXNwYXRjaGVyLmRpc2FibGVkQ2VsbHMuc2V0KHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50ISwgdHJ1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc2VydmljZXMuZWRpdEV2ZW50RGlzcGF0Y2hlci5kaXNhYmxlZENlbGxzLmRlbGV0ZSh0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCEpO1xuICAgIH1cbiAgfVxuICBwcml2YXRlIF9kaXNhYmxlZCA9IGZhbHNlO1xuXG4gIHByb3RlY3RlZCBmb2N1c1RyYXA/OiBGb2N1c1RyYXA7XG4gIHByb3RlY3RlZCBvdmVybGF5UmVmPzogT3ZlcmxheVJlZjtcbiAgcHJvdGVjdGVkIHJlYWRvbmx5IGRlc3Ryb3llZCA9IG5ldyBTdWJqZWN0PHZvaWQ+KCk7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgc2VydmljZXM6IEVkaXRTZXJ2aWNlcywgcHJvdGVjdGVkIHJlYWRvbmx5IGVsZW1lbnRSZWY6IEVsZW1lbnRSZWYsXG4gICAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgdmlld0NvbnRhaW5lclJlZjogVmlld0NvbnRhaW5lclJlZikge31cblxuICBuZ0FmdGVyVmlld0luaXQoKTogdm9pZCB7XG4gICAgdGhpcy5fc3RhcnRMaXN0ZW5pbmdUb0VkaXRFdmVudHMoKTtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCk6IHZvaWQge1xuICAgIHRoaXMuZGVzdHJveWVkLm5leHQoKTtcbiAgICB0aGlzLmRlc3Ryb3llZC5jb21wbGV0ZSgpO1xuXG4gICAgaWYgKHRoaXMuZm9jdXNUcmFwKSB7XG4gICAgICB0aGlzLmZvY3VzVHJhcC5kZXN0cm95KCk7XG4gICAgICB0aGlzLmZvY3VzVHJhcCA9IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5vdmVybGF5UmVmKSB7XG4gICAgICB0aGlzLm92ZXJsYXlSZWYuZGlzcG9zZSgpO1xuICAgIH1cbiAgfVxuXG4gIHByb3RlY3RlZCBpbml0Rm9jdXNUcmFwKCk6IHZvaWQge1xuICAgIHRoaXMuZm9jdXNUcmFwID0gdGhpcy5zZXJ2aWNlcy5mb2N1c1RyYXBGYWN0b3J5LmNyZWF0ZSh0aGlzLm92ZXJsYXlSZWYhLm92ZXJsYXlFbGVtZW50KTtcbiAgfVxuXG4gIHByb3RlY3RlZCBjbG9zZUVkaXRPdmVybGF5KCk6IHZvaWQge1xuICAgIHRoaXMuc2VydmljZXMuZWRpdEV2ZW50RGlzcGF0Y2hlci5kb25lRWRpdGluZ0NlbGwodGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQhKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBwYW5lbENsYXNzKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIEVESVRfUEFORV9DTEFTUztcbiAgfVxuXG4gIHByaXZhdGUgX3N0YXJ0TGlzdGVuaW5nVG9FZGl0RXZlbnRzKCk6IHZvaWQge1xuICAgIHRoaXMuc2VydmljZXMuZWRpdEV2ZW50RGlzcGF0Y2hlci5lZGl0aW5nQ2VsbCh0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCEpXG4gICAgICAgIC5waXBlKHRha2VVbnRpbCh0aGlzLmRlc3Ryb3llZCkpXG4gICAgICAgIC5zdWJzY3JpYmUoKG9wZW4pID0+IHtcbiAgICAgICAgICBpZiAob3BlbiAmJiB0aGlzLnRlbXBsYXRlKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMub3ZlcmxheVJlZikge1xuICAgICAgICAgICAgICB0aGlzLl9jcmVhdGVFZGl0T3ZlcmxheSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLl9zaG93RWRpdE92ZXJsYXkoKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMub3ZlcmxheVJlZikge1xuICAgICAgICAgICAgdGhpcy5fbWF5YmVSZXR1cm5Gb2N1c1RvQ2VsbCgpO1xuXG4gICAgICAgICAgICB0aGlzLm92ZXJsYXlSZWYuZGV0YWNoKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX2NyZWF0ZUVkaXRPdmVybGF5KCk6IHZvaWQge1xuICAgIHRoaXMub3ZlcmxheVJlZiA9IHRoaXMuc2VydmljZXMub3ZlcmxheS5jcmVhdGUoe1xuICAgICAgZGlzcG9zZU9uTmF2aWdhdGlvbjogdHJ1ZSxcbiAgICAgIHBhbmVsQ2xhc3M6IHRoaXMucGFuZWxDbGFzcygpLFxuICAgICAgcG9zaXRpb25TdHJhdGVneTogdGhpcy5fZ2V0UG9zaXRpb25TdHJhdGVneSgpLFxuICAgICAgc2Nyb2xsU3RyYXRlZ3k6IHRoaXMuc2VydmljZXMub3ZlcmxheS5zY3JvbGxTdHJhdGVnaWVzLnJlcG9zaXRpb24oKSxcbiAgICAgIGRpcmVjdGlvbjogdGhpcy5zZXJ2aWNlcy5kaXJlY3Rpb25hbGl0eSxcbiAgICB9KTtcblxuICAgIHRoaXMuaW5pdEZvY3VzVHJhcCgpO1xuICAgIHRoaXMub3ZlcmxheVJlZi5vdmVybGF5RWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2FyaWEtcm9sZScsICdkaWFsb2cnKTtcblxuICAgIHRoaXMub3ZlcmxheVJlZi5kZXRhY2htZW50cygpLnN1YnNjcmliZSgoKSA9PiB0aGlzLmNsb3NlRWRpdE92ZXJsYXkoKSk7XG4gIH1cblxuICBwcml2YXRlIF9zaG93RWRpdE92ZXJsYXkoKTogdm9pZCB7XG4gICAgdGhpcy5vdmVybGF5UmVmIS5hdHRhY2gobmV3IFRlbXBsYXRlUG9ydGFsKFxuICAgICAgICB0aGlzLnRlbXBsYXRlISxcbiAgICAgICAgdGhpcy52aWV3Q29udGFpbmVyUmVmLFxuICAgICAgICB7JGltcGxpY2l0OiB0aGlzLmNvbnRleHR9KSk7XG5cbiAgICAvLyBXZSBoYXZlIHRvIGRlZmVyIHRyYXBwaW5nIGZvY3VzLCBiZWNhdXNlIGRvaW5nIHNvIHRvbyBlYXJseSBjYW4gY2F1c2UgdGhlIGZvcm0gaW5zaWRlXG4gICAgLy8gdGhlIG92ZXJsYXkgdG8gYmUgc3VibWl0dGVkIGltbWVkaWF0ZWx5IGlmIGl0IHdhcyBvcGVuZWQgb24gYW4gRW50ZXIga2V5ZG93biBldmVudC5cbiAgICB0aGlzLnNlcnZpY2VzLm5nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgdGhpcy5mb2N1c1RyYXAhLmZvY3VzSW5pdGlhbEVsZW1lbnQoKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgLy8gVXBkYXRlIHRoZSBzaXplIG9mIHRoZSBwb3B1cCBpbml0aWFsbHkgYW5kIG9uIHN1YnNlcXVlbnQgY2hhbmdlcyB0b1xuICAgIC8vIHNjcm9sbCBwb3NpdGlvbiBhbmQgdmlld3BvcnQgc2l6ZS5cbiAgICBtZXJnZSh0aGlzLnNlcnZpY2VzLnNjcm9sbERpc3BhdGNoZXIuc2Nyb2xsZWQoKSwgdGhpcy5zZXJ2aWNlcy52aWV3cG9ydFJ1bGVyLmNoYW5nZSgpKVxuICAgICAgICAucGlwZShcbiAgICAgICAgICAgIHN0YXJ0V2l0aChudWxsKSxcbiAgICAgICAgICAgIHRha2VVbnRpbCh0aGlzLm92ZXJsYXlSZWYhLmRldGFjaG1lbnRzKCkpLFxuICAgICAgICAgICAgdGFrZVVudGlsKHRoaXMuZGVzdHJveWVkKSxcbiAgICAgICAgICAgIClcbiAgICAgICAgLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgICAgdGhpcy5fdXBkYXRlT3ZlcmxheVNpemUoKTtcbiAgICAgICAgfSk7XG4gIH1cblxuICBwcml2YXRlIF9nZXRPdmVybGF5Q2VsbHMoKTogSFRNTEVsZW1lbnRbXSB7XG4gICAgY29uc3QgY2VsbCA9IGNsb3Nlc3QodGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQhLCBDRUxMX1NFTEVDVE9SKSBhcyBIVE1MRWxlbWVudDtcblxuICAgIGlmICghdGhpcy5fY29sc3Bhbi5iZWZvcmUgJiYgIXRoaXMuX2NvbHNwYW4uYWZ0ZXIpIHtcbiAgICAgIHJldHVybiBbY2VsbF07XG4gICAgfVxuXG4gICAgY29uc3Qgcm93ID0gY2xvc2VzdCh0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCEsIFJPV19TRUxFQ1RPUikhO1xuICAgIGNvbnN0IHJvd0NlbGxzID0gQXJyYXkuZnJvbShyb3cucXVlcnlTZWxlY3RvckFsbChDRUxMX1NFTEVDVE9SKSkgYXMgSFRNTEVsZW1lbnRbXTtcbiAgICBjb25zdCBvd25JbmRleCA9IHJvd0NlbGxzLmluZGV4T2YoY2VsbCk7XG5cbiAgICByZXR1cm4gcm93Q2VsbHMuc2xpY2UoXG4gICAgICAgIG93bkluZGV4IC0gKHRoaXMuX2NvbHNwYW4uYmVmb3JlIHx8IDApLCBvd25JbmRleCArICh0aGlzLl9jb2xzcGFuLmFmdGVyIHx8IDApICsgMSk7XG4gIH1cblxuICBwcml2YXRlIF9nZXRQb3NpdGlvblN0cmF0ZWd5KCk6IFBvc2l0aW9uU3RyYXRlZ3kge1xuICAgIHJldHVybiB0aGlzLnNlcnZpY2VzLnBvc2l0aW9uRmFjdG9yeS5wb3NpdGlvblN0cmF0ZWd5Rm9yQ2VsbHModGhpcy5fZ2V0T3ZlcmxheUNlbGxzKCkpO1xuICB9XG5cbiAgcHJpdmF0ZSBfdXBkYXRlT3ZlcmxheVNpemUoKTogdm9pZCB7XG4gICAgdGhpcy5vdmVybGF5UmVmIS51cGRhdGVTaXplKFxuICAgICAgICB0aGlzLnNlcnZpY2VzLnBvc2l0aW9uRmFjdG9yeS5zaXplQ29uZmlnRm9yQ2VsbHModGhpcy5fZ2V0T3ZlcmxheUNlbGxzKCkpKTtcbiAgfVxuXG4gIHByaXZhdGUgX21heWJlUmV0dXJuRm9jdXNUb0NlbGwoKTogdm9pZCB7XG4gICAgaWYgKGNsb3Nlc3QoZG9jdW1lbnQuYWN0aXZlRWxlbWVudCwgRURJVF9QQU5FX1NFTEVDVE9SKSA9PT1cbiAgICAgICAgdGhpcy5vdmVybGF5UmVmIS5vdmVybGF5RWxlbWVudCkge1xuICAgICAgdGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQhLmZvY3VzKCk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQXR0YWNoZXMgYW4gbmctdGVtcGxhdGUgdG8gYSBjZWxsIGFuZCBzaG93cyBpdCB3aGVuIGluc3RydWN0ZWQgdG8gYnkgdGhlXG4gKiBFZGl0RXZlbnREaXNwYXRjaGVyIHNlcnZpY2UuXG4gKiBNYWtlcyB0aGUgY2VsbCBmb2N1c2FibGUuXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tjZGtQb3BvdmVyRWRpdF1bY2RrUG9wb3ZlckVkaXRUYWJPdXRdJyxcbiAgaG9zdDogUE9QT1ZFUl9FRElUX0hPU1RfQklORElOR1MsXG4gIGlucHV0czogUE9QT1ZFUl9FRElUX0lOUFVUUyxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrUG9wb3ZlckVkaXRUYWJPdXQ8Qz4gZXh0ZW5kcyBDZGtQb3BvdmVyRWRpdDxDPiB7XG4gIHByb3RlY3RlZCBmb2N1c1RyYXA/OiBGb2N1c0VzY2FwZU5vdGlmaWVyO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgZWxlbWVudFJlZjogRWxlbWVudFJlZiwgdmlld0NvbnRhaW5lclJlZjogVmlld0NvbnRhaW5lclJlZiwgc2VydmljZXM6IEVkaXRTZXJ2aWNlcyxcbiAgICAgIHByb3RlY3RlZCByZWFkb25seSBmb2N1c0VzY2FwZU5vdGlmaWVyRmFjdG9yeTogRm9jdXNFc2NhcGVOb3RpZmllckZhY3RvcnkpIHtcbiAgICBzdXBlcihzZXJ2aWNlcywgZWxlbWVudFJlZiwgdmlld0NvbnRhaW5lclJlZik7XG4gIH1cblxuICBwcm90ZWN0ZWQgaW5pdEZvY3VzVHJhcCgpOiB2b2lkIHtcbiAgICB0aGlzLmZvY3VzVHJhcCA9IHRoaXMuZm9jdXNFc2NhcGVOb3RpZmllckZhY3RvcnkuY3JlYXRlKHRoaXMub3ZlcmxheVJlZiEub3ZlcmxheUVsZW1lbnQpO1xuXG4gICAgdGhpcy5mb2N1c1RyYXAuZXNjYXBlcygpLnBpcGUodGFrZVVudGlsKHRoaXMuZGVzdHJveWVkKSkuc3Vic2NyaWJlKGRpcmVjdGlvbiA9PiB7XG4gICAgICBpZiAodGhpcy5zZXJ2aWNlcy5lZGl0RXZlbnREaXNwYXRjaGVyLmVkaXRSZWYpIHtcbiAgICAgICAgdGhpcy5zZXJ2aWNlcy5lZGl0RXZlbnREaXNwYXRjaGVyLmVkaXRSZWYuYmx1cigpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnNlcnZpY2VzLmZvY3VzRGlzcGF0Y2hlci5tb3ZlRm9jdXNIb3Jpem9udGFsbHkoXG4gICAgICAgICAgY2xvc2VzdCh0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCEsIENFTExfU0VMRUNUT1IpIGFzIEhUTUxFbGVtZW50LFxuICAgICAgICAgIGRpcmVjdGlvbiA9PT0gRm9jdXNFc2NhcGVOb3RpZmllckRpcmVjdGlvbi5TVEFSVCA/IC0xIDogMSk7XG5cbiAgICAgIHRoaXMuY2xvc2VFZGl0T3ZlcmxheSgpO1xuICAgIH0pO1xuICB9XG59XG5cbi8qKlxuICogQSBzdHJ1Y3R1cmFsIGRpcmVjdGl2ZSB0aGF0IHNob3dzIGl0cyBjb250ZW50cyB3aGVuIHRoZSB0YWJsZSByb3cgY29udGFpbmluZ1xuICogaXQgaXMgaG92ZXJlZCBvciB3aGVuIGFuIGVsZW1lbnQgaW4gdGhlIHJvdyBoYXMgZm9jdXMuXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tjZGtSb3dIb3ZlckNvbnRlbnRdJyxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrUm93SG92ZXJDb250ZW50IGltcGxlbWVudHMgQWZ0ZXJWaWV3SW5pdCwgT25EZXN0cm95IHtcbiAgcHJvdGVjdGVkIHJlYWRvbmx5IGRlc3Ryb3llZCA9IG5ldyBTdWJqZWN0PHZvaWQ+KCk7XG4gIHByb3RlY3RlZCB2aWV3UmVmOiBFbWJlZGRlZFZpZXdSZWY8YW55PnxudWxsID0gbnVsbDtcblxuICBwcml2YXRlIF9yb3c/OiBFbGVtZW50O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJvdGVjdGVkIHJlYWRvbmx5IHNlcnZpY2VzOiBFZGl0U2VydmljZXMsIHByb3RlY3RlZCByZWFkb25seSBlbGVtZW50UmVmOiBFbGVtZW50UmVmLFxuICAgICAgcHJvdGVjdGVkIHJlYWRvbmx5IHRlbXBsYXRlUmVmOiBUZW1wbGF0ZVJlZjxhbnk+LFxuICAgICAgcHJvdGVjdGVkIHJlYWRvbmx5IHZpZXdDb250YWluZXJSZWY6IFZpZXdDb250YWluZXJSZWYpIHt9XG5cbiAgbmdBZnRlclZpZXdJbml0KCk6IHZvaWQge1xuICAgIHRoaXMuX3JvdyA9IGNsb3Nlc3QodGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQhLCBST1dfU0VMRUNUT1IpITtcblxuICAgIHRoaXMuc2VydmljZXMuZWRpdEV2ZW50RGlzcGF0Y2hlci5yZWdpc3RlclJvd1dpdGhIb3ZlckNvbnRlbnQodGhpcy5fcm93KTtcbiAgICB0aGlzLl9saXN0ZW5Gb3JIb3ZlckFuZEZvY3VzRXZlbnRzKCk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLmRlc3Ryb3llZC5uZXh0KCk7XG4gICAgdGhpcy5kZXN0cm95ZWQuY29tcGxldGUoKTtcblxuICAgIGlmICh0aGlzLnZpZXdSZWYpIHtcbiAgICAgIHRoaXMudmlld1JlZi5kZXN0cm95KCk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX3Jvdykge1xuICAgICAgdGhpcy5zZXJ2aWNlcy5lZGl0RXZlbnREaXNwYXRjaGVyLmRlcmVnaXN0ZXJSb3dXaXRoSG92ZXJDb250ZW50KHRoaXMuX3Jvdyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENhbGxlZCBpbW1lZGlhdGVseSBhZnRlciB0aGUgaG92ZXIgY29udGVudCBpcyBjcmVhdGVkIGFuZCBhZGRlZCB0byB0aGUgZG9tLlxuICAgKiBJbiB0aGUgQ0RLIHZlcnNpb24sIHRoaXMgaXMgYSBub29wIGJ1dCBzdWJjbGFzc2VzIHN1Y2ggYXMgTWF0Um93SG92ZXJDb250ZW50IHVzZSB0aGlzXG4gICAqIHRvIHByZXBhcmUvc3R5bGUgdGhlIGluc2VydGVkIGVsZW1lbnQuXG4gICAqL1xuICBwcm90ZWN0ZWQgaW5pdEVsZW1lbnQoXzogSFRNTEVsZW1lbnQpOiB2b2lkIHtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiB0aGUgaG92ZXIgY29udGVudCBuZWVkcyB0byBiZSBmb2N1c2FibGUgdG8gcHJlc2VydmUgYSByZWFzb25hYmxlIHRhYiBvcmRlcmluZ1xuICAgKiBidXQgc2hvdWxkIG5vdCB5ZXQgYmUgc2hvd24uXG4gICAqL1xuICBwcm90ZWN0ZWQgbWFrZUVsZW1lbnRIaWRkZW5CdXRGb2N1c2FibGUoZWxlbWVudDogSFRNTEVsZW1lbnQpOiB2b2lkIHtcbiAgICBlbGVtZW50LnN0eWxlLm9wYWNpdHkgPSAnMCc7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gdGhlIGhvdmVyIGNvbnRlbnQgbmVlZHMgdG8gYmUgZm9jdXNhYmxlIHRvIHByZXNlcnZlIGEgcmVhc29uYWJsZSB0YWIgb3JkZXJpbmdcbiAgICogYnV0IHNob3VsZCBub3QgeWV0IGJlIHNob3duLlxuICAgKi9cbiAgcHJvdGVjdGVkIG1ha2VFbGVtZW50VmlzaWJsZShlbGVtZW50OiBIVE1MRWxlbWVudCk6IHZvaWQge1xuICAgIGVsZW1lbnQuc3R5bGUub3BhY2l0eSA9ICcnO1xuICB9XG5cbiAgcHJpdmF0ZSBfbGlzdGVuRm9ySG92ZXJBbmRGb2N1c0V2ZW50cygpOiB2b2lkIHtcbiAgICB0aGlzLnNlcnZpY2VzLmVkaXRFdmVudERpc3BhdGNoZXIuaG92ZXJPckZvY3VzT25Sb3codGhpcy5fcm93ISlcbiAgICAgICAgLnBpcGUodGFrZVVudGlsKHRoaXMuZGVzdHJveWVkKSlcbiAgICAgICAgLnN1YnNjcmliZShldmVudFN0YXRlID0+IHtcbiAgICAgICAgICAvLyBXaGVuIGluIEZPQ1VTQUJMRSBzdGF0ZSwgYWRkIHRoZSBob3ZlciBjb250ZW50IHRvIHRoZSBkb20gYnV0IG1ha2UgaXQgdHJhbnNwYXJlbnQgc29cbiAgICAgICAgICAvLyB0aGF0IGl0IGlzIGluIHRoZSB0YWIgb3JkZXIgcmVsYXRpdmUgdG8gdGhlIGN1cnJlbnRseSBmb2N1c2VkIHJvdy5cblxuICAgICAgICAgIGlmIChldmVudFN0YXRlID09PSBIb3ZlckNvbnRlbnRTdGF0ZS5PTiB8fCBldmVudFN0YXRlID09PSBIb3ZlckNvbnRlbnRTdGF0ZS5GT0NVU0FCTEUpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy52aWV3UmVmKSB7XG4gICAgICAgICAgICAgIHRoaXMudmlld1JlZiA9IHRoaXMudmlld0NvbnRhaW5lclJlZi5jcmVhdGVFbWJlZGRlZFZpZXcodGhpcy50ZW1wbGF0ZVJlZiwge30pO1xuICAgICAgICAgICAgICB0aGlzLmluaXRFbGVtZW50KHRoaXMudmlld1JlZi5yb290Tm9kZXNbMF0gYXMgSFRNTEVsZW1lbnQpO1xuICAgICAgICAgICAgICB0aGlzLnZpZXdSZWYubWFya0ZvckNoZWNrKCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMudmlld0NvbnRhaW5lclJlZi5pbmRleE9mKHRoaXMudmlld1JlZikgPT09IC0xKSB7XG4gICAgICAgICAgICAgIHRoaXMudmlld0NvbnRhaW5lclJlZi5pbnNlcnQodGhpcy52aWV3UmVmISk7XG4gICAgICAgICAgICAgIHRoaXMudmlld1JlZi5tYXJrRm9yQ2hlY2soKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGV2ZW50U3RhdGUgPT09IEhvdmVyQ29udGVudFN0YXRlLk9OKSB7XG4gICAgICAgICAgICAgIHRoaXMubWFrZUVsZW1lbnRWaXNpYmxlKHRoaXMudmlld1JlZi5yb290Tm9kZXNbMF0gYXMgSFRNTEVsZW1lbnQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdGhpcy5tYWtlRWxlbWVudEhpZGRlbkJ1dEZvY3VzYWJsZSh0aGlzLnZpZXdSZWYucm9vdE5vZGVzWzBdIGFzIEhUTUxFbGVtZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMudmlld1JlZikge1xuICAgICAgICAgICAgdGhpcy52aWV3Q29udGFpbmVyUmVmLmRldGFjaCh0aGlzLnZpZXdDb250YWluZXJSZWYuaW5kZXhPZih0aGlzLnZpZXdSZWYpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICB9XG59XG5cbi8qKlxuICogT3BlbnMgdGhlIGNsb3Nlc3QgZWRpdCBwb3BvdmVyIHRvIHRoaXMgZWxlbWVudCwgd2hldGhlciBpdCdzIGFzc29jaWF0ZWQgd2l0aCB0aGlzIGV4YWN0XG4gKiBlbGVtZW50IG9yIGFuIGFuY2VzdG9yIGVsZW1lbnQuXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tjZGtFZGl0T3Blbl0nLFxufSlcbmV4cG9ydCBjbGFzcyBDZGtFZGl0T3BlbiB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJvdGVjdGVkIHJlYWRvbmx5IGVsZW1lbnRSZWY6IEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+LFxuICAgICAgcHJvdGVjdGVkIHJlYWRvbmx5IGVkaXRFdmVudERpc3BhdGNoZXI6IEVkaXRFdmVudERpc3BhdGNoZXIpIHtcblxuICAgIGNvbnN0IG5hdGl2ZUVsZW1lbnQgPSBlbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQ7XG5cbiAgICAvLyBQcmV2ZW50IGFjY2lkZW50YWwgZm9ybSBzdWJtaXRzLlxuICAgIGlmIChuYXRpdmVFbGVtZW50Lm5vZGVOYW1lID09PSAnQlVUVE9OJyAmJiAhbmF0aXZlRWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3R5cGUnKSkge1xuICAgICAgbmF0aXZlRWxlbWVudC5zZXRBdHRyaWJ1dGUoJ3R5cGUnLCAnYnV0dG9uJyk7XG4gICAgfVxuICB9XG5cbiAgLy8gSW4gSXZ5IHRoZSBgaG9zdGAgbWV0YWRhdGEgd2lsbCBiZSBtZXJnZWQsIHdoZXJlYXMgaW4gVmlld0VuZ2luZSBpdCBpcyBvdmVycmlkZGVuLiBJbiBvcmRlclxuICAvLyB0byBhdm9pZCBkb3VibGUgZXZlbnQgbGlzdGVuZXJzLCB3ZSBuZWVkIHRvIHVzZSBgSG9zdExpc3RlbmVyYC4gT25jZSBJdnkgaXMgdGhlIGRlZmF1bHQsIHdlXG4gIC8vIGNhbiBtb3ZlIHRoaXMgYmFjayBpbnRvIGBob3N0YC5cbiAgLy8gdHNsaW50OmRpc2FibGU6bm8taG9zdC1kZWNvcmF0b3ItaW4tY29uY3JldGVcbiAgQEhvc3RMaXN0ZW5lcignY2xpY2snLCBbJyRldmVudCddKVxuICBvcGVuRWRpdChldnQ6IEV2ZW50KTogdm9pZCB7XG4gICAgdGhpcy5lZGl0RXZlbnREaXNwYXRjaGVyLmVkaXRpbmcubmV4dChjbG9zZXN0KHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50ISwgQ0VMTF9TRUxFQ1RPUikpO1xuICAgIGV2dC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgfVxufVxuIl19