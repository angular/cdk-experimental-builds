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
export class CdkEditable {
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
            fromEventPattern(handler => element.addEventListener('focus', handler, true), handler => element.removeEventListener('focus', handler, true)).pipe(toClosest(ROW_SELECTOR), share(), takeUntil(this.destroyed)).subscribe(this.editEventDispatcher.focused);
            merge(fromEventPattern(handler => element.addEventListener('blur', handler, true), handler => element.removeEventListener('blur', handler, true)), fromEvent(element, 'keydown').pipe(filter(event => event.key === 'Escape'))).pipe(mapTo(null), share(), takeUntil(this.destroyed)).subscribe(this.editEventDispatcher.focused);
            // Keep track of rows within the table. This is used to know which rows with hover content
            // are first or last in the table. They are kept focusable in case focus enters from above
            // or below the table.
            this.ngZone.onStable.pipe(
            // Optimization: ignore dom changes while focus is within the table as we already
            // ensure that rows above and below the focused/active row are tabbable.
            withLatestFrom(this.editEventDispatcher.editingOrFocused), filter(([_, activeRow]) => activeRow == null), map(() => element.querySelectorAll(ROW_SELECTOR)), share(), takeUntil(this.destroyed)).subscribe(this.editEventDispatcher.allRows);
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
export class CdkPopoverEdit {
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
            .pipe(startWith(null), takeUntil(merge(this.overlayRef.detachments(), this.destroyed)))
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
/**
 * Attaches an ng-template to a cell and shows it when instructed to by the
 * EditEventDispatcher service.
 * Makes the cell focusable.
 */
export class CdkPopoverEditTabOut extends CdkPopoverEdit {
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
/**
 * A structural directive that shows its contents when the table row containing
 * it is hovered or when an element in the row has focus.
 */
export class CdkRowHoverContent {
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
/**
 * Opens the closest edit popover to this element, whether it's associated with this exact
 * element or an ancestor element.
 */
export class CdkEditOpen {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFibGUtZGlyZWN0aXZlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL3BvcG92ZXItZWRpdC90YWJsZS1kaXJlY3RpdmVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQVNBLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUNuRCxPQUFPLEVBRUwsU0FBUyxFQUNULFVBQVUsRUFFVixNQUFNLEVBRU4sV0FBVyxFQUNYLGdCQUFnQixFQUNoQixZQUFZLEdBQ2IsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFDLFNBQVMsRUFBRSxnQkFBZ0IsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQ2pFLE9BQU8sRUFDTCxNQUFNLEVBQ04sR0FBRyxFQUNILEtBQUssRUFDTCxLQUFLLEVBQ0wsU0FBUyxFQUNULFNBQVMsRUFDVCxZQUFZLEVBQ1osY0FBYyxHQUNmLE1BQU0sZ0JBQWdCLENBQUM7QUFFeEIsT0FBTyxFQUFDLGFBQWEsRUFBRSxlQUFlLEVBQUUsa0JBQWtCLEVBQUUsWUFBWSxFQUFDLE1BQU0sYUFBYSxDQUFDO0FBQzdGLE9BQU8sRUFBQyxtQkFBbUIsRUFBb0IsTUFBTSx5QkFBeUIsQ0FBQztBQUMvRSxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDN0MsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLG9CQUFvQixDQUFDO0FBQ25ELE9BQU8sRUFHTCwwQkFBMEIsRUFDM0IsTUFBTSx5QkFBeUIsQ0FBQztBQUNqQyxPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sWUFBWSxDQUFDO0FBWW5DLCtDQUErQztBQUMvQyxNQUFNLDJCQUEyQixHQUFHLEVBQUUsQ0FBQztBQUV2Qzs7OztHQUlHO0FBS0gsTUFBTSxPQUFPLFdBQVc7SUFHdEIsWUFDdUIsVUFBc0IsRUFDdEIsbUJBQXdDLEVBQ3hDLGVB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QW1CLEdBQW5CLG1CQUFtQixDQUFxQjtRQUU3RCxNQUFNLGFBQWEsR0FBRyxVQUFVLENBQUMsYUFBYSxDQUFDO1FBRS9DLG1DQUFtQztRQUNuQyxJQUFJLGFBQWEsQ0FBQyxRQUFRLEtBQUssUUFBUSxJQUFJLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUM5RSxhQUFhLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQztTQUM5QztJQUNILENBQUM7SUFFRCw4RkFBOEY7SUFDOUYsOEZBQThGO0lBQzlGLGtDQUFrQztJQUNsQywrQ0FBK0M7SUFFL0MsUUFBUSxDQUFDLEdBQVU7UUFDakIsSUFBSSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsYUFBYyxFQUFFLGFBQWEsQ0FBQyxDQUFDLENBQUM7UUFDOUYsR0FBRyxDQUFDLGVBQWUsRUFBRSxDQUFDO0lBQ3hCLENBQUM7OztZQXhCRixTQUFTLFNBQUM7Z0JBQ1QsUUFBUSxFQUFFLGVBQWU7YUFDMUI7OztZQXhkQyxVQUFVO1lBcUJKLG1CQUFtQjs7O3VCQXFkeEIsWUFBWSxTQUFDLE9BQU8sRUFBRSxDQUFDLFFBQVEsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtGb2N1c1RyYXB9IGZyb20gJ0Bhbmd1bGFyL2Nkay9hMTF5JztcbmltcG9ydCB7T3ZlcmxheVJlZiwgUG9zaXRpb25TdHJhdGVneX0gZnJvbSAnQGFuZ3VsYXIvY2RrL292ZXJsYXknO1xuaW1wb3J0IHtUZW1wbGF0ZVBvcnRhbH0gZnJvbSAnQGFuZ3VsYXIvY2RrL3BvcnRhbCc7XG5pbXBvcnQge1xuICBBZnRlclZpZXdJbml0LFxuICBEaXJlY3RpdmUsXG4gIEVsZW1lbnRSZWYsXG4gIEVtYmVkZGVkVmlld1JlZixcbiAgTmdab25lLFxuICBPbkRlc3Ryb3ksXG4gIFRlbXBsYXRlUmVmLFxuICBWaWV3Q29udGFpbmVyUmVmLFxuICBIb3N0TGlzdGVuZXIsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtmcm9tRXZlbnQsIGZyb21FdmVudFBhdHRlcm4sIG1lcmdlLCBTdWJqZWN0fSBmcm9tICdyeGpzJztcbmltcG9ydCB7XG4gIGZpbHRlcixcbiAgbWFwLFxuICBtYXBUbyxcbiAgc2hhcmUsXG4gIHN0YXJ0V2l0aCxcbiAgdGFrZVVudGlsLFxuICB0aHJvdHRsZVRpbWUsXG4gIHdpdGhMYXRlc3RGcm9tLFxufSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbmltcG9ydCB7Q0VMTF9TRUxFQ1RPUiwgRURJVF9QQU5FX0NMQVNTLCBFRElUX1BBTkVfU0VMRUNUT1IsIFJPV19TRUxFQ1RPUn0gZnJvbSAnLi9jb25zdGFudHMnO1xuaW1wb3J0IHtFZGl0RXZlbnREaXNwYXRjaGVyLCBIb3ZlckNvbnRlbnRTdGF0ZX0gZnJvbSAnLi9lZGl0LWV2ZW50LWRpc3BhdGNoZXInO1xuaW1wb3J0IHtFZGl0U2VydmljZXN9IGZyb20gJy4vZWRpdC1zZXJ2aWNlcyc7XG5pbXBvcnQge0ZvY3VzRGlzcGF0Y2hlcn0gZnJvbSAnLi9mb2N1cy1kaXNwYXRjaGVyJztcbmltcG9ydCB7XG4gIEZvY3VzRXNjYXBlTm90aWZpZXIsXG4gIEZvY3VzRXNjYXBlTm90aWZpZXJEaXJlY3Rpb24sXG4gIEZvY3VzRXNjYXBlTm90aWZpZXJGYWN0b3J5XG59IGZyb20gJy4vZm9jdXMtZXNjYXBlLW5vdGlmaWVyJztcbmltcG9ydCB7Y2xvc2VzdH0gZnJvbSAnLi9wb2x5ZmlsbCc7XG5cbi8qKlxuICogRGVzY3JpYmVzIHRoZSBudW1iZXIgb2YgY29sdW1ucyBiZWZvcmUgYW5kIGFmdGVyIHRoZSBvcmlnaW5hdGluZyBjZWxsIHRoYXQgdGhlXG4gKiBlZGl0IHBvcHVwIHNob3VsZCBzcGFuLiBJbiBsZWZ0IHRvIHJpZ2h0IGxvY2FsZXMsIGJlZm9yZSBtZWFucyBsZWZ0IGFuZCBhZnRlciBtZWFuc1xuICogcmlnaHQuIEluIHJpZ2h0IHRvIGxlZnQgbG9jYWxlcyBiZWZvcmUgbWVhbnMgcmlnaHQgYW5kIGFmdGVyIG1lYW5zIGxlZnQuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ2RrUG9wb3ZlckVkaXRDb2xzcGFuIHtcbiAgYmVmb3JlPzogbnVtYmVyO1xuICBhZnRlcj86IG51bWJlcjtcbn1cblxuLyoqIFVzZWQgZm9yIHJhdGUtbGltaXRpbmcgbW91c2Vtb3ZlIGV2ZW50cy4gKi9cbmNvbnN0IE1PVVNFX01PVkVfVEhST1RUTEVfVElNRV9NUyA9IDEwO1xuXG4vKipcbiAqIEEgZGlyZWN0aXZlIHRoYXQgbXVzdCBiZSBhdHRhY2hlZCB0byBlbmFibGUgZWRpdGFiaWxpdHkgb24gYSB0YWJsZS5cbiAqIEl0IGlzIHJlc3BvbnNpYmxlIGZvciBzZXR0aW5nIHVwIGRlbGVnYXRlZCBldmVudCBoYW5kbGVycyBhbmQgcHJvdmlkaW5nIHRoZVxuICogRWRpdEV2ZW50RGlzcGF0Y2hlciBzZXJ2aWNlIGZvciB1c2UgYnkgdGhlIG90aGVyIGVkaXQgZGlyZWN0aXZlcy5cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAndGFibGVbZWRpdGFibGVdLCBjZGstdGFibGVbZWRpdGFibGVdLCBtYXQtdGFibGVbZWRpdGFibGVdJyxcbiAgcHJvdmlkZXJzOiBbRWRpdEV2ZW50RGlzcGF0Y2hlciwgRWRpdFNlcnZpY2VzXSxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrRWRpdGFibGUgaW1wbGVtZW50cyBBZnRlclZpZXdJbml0LCBPbkRlc3Ryb3kge1xuICBwcm90ZWN0ZWQgcmVhZG9ubHkgZGVzdHJveWVkID0gbmV3IFN1YmplY3Q8dm9pZD4oKTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByb3RlY3RlZCByZWFkb25seSBlbGVtZW50UmVmOiBFbGVtZW50UmVmLFxuICAgICAgcHJvdGVjdGVkIHJlYWRvbmx5IGVkaXRFdmVudERpc3BhdGNoZXI6IEVkaXRFdmVudERpc3BhdGNoZXIsXG4gICAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgZm9jdXNEaXNwYXRjaGVyOiBGb2N1c0Rpc3BhdGNoZXIsIHByb3RlY3RlZCByZWFkb25seSBuZ1pvbmU6IE5nWm9uZSkge31cblxuICBuZ0FmdGVyVmlld0luaXQoKTogdm9pZCB7XG4gICAgdGhpcy5fbGlzdGVuRm9yVGFibGVFdmVudHMoKTtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCk6IHZvaWQge1xuICAgIHRoaXMuZGVzdHJveWVkLm5leHQoKTtcbiAgICB0aGlzLmRlc3Ryb3llZC5jb21wbGV0ZSgpO1xuICB9XG5cbiAgcHJpdmF0ZSBfbGlzdGVuRm9yVGFibGVFdmVudHMoKTogdm9pZCB7XG4gICAgY29uc3QgZWxlbWVudCA9IHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50O1xuICAgIGNvbnN0IHRvQ2xvc2VzdCA9IChzZWxlY3Rvcjogc3RyaW5nKSA9PlxuICAgICAgICBtYXAoKGV2ZW50OiBVSUV2ZW50KSA9PiBjbG9zZXN0KGV2ZW50LnRhcmdldCwgc2VsZWN0b3IpKTtcblxuICAgIHRoaXMubmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgIC8vIFRyYWNrIG1vdXNlIG1vdmVtZW50IG92ZXIgdGhlIHRhYmxlIHRvIGhpZGUvc2hvdyBob3ZlciBjb250ZW50LlxuICAgICAgZnJvbUV2ZW50PE1vdXNlRXZlbnQ+KGVsZW1lbnQsICdtb3VzZW92ZXInKS5waXBlKFxuICAgICAgICAgIHRvQ2xvc2VzdChST1dfU0VMRUNUT1IpLFxuICAgICAgICAgIHRha2VVbnRpbCh0aGlzLmRlc3Ryb3llZCksXG4gICAgICAgICAgKS5zdWJzY3JpYmUodGhpcy5lZGl0RXZlbnREaXNwYXRjaGVyLmhvdmVyaW5nKTtcbiAgICAgIGZyb21FdmVudDxNb3VzZUV2ZW50PihlbGVtZW50LCAnbW91c2VsZWF2ZScpLnBpcGUoXG4gICAgICAgICAgbWFwVG8obnVsbCksXG4gICAgICAgICAgdGFrZVVudGlsKHRoaXMuZGVzdHJveWVkKSxcbiAgICAgICAgICApLnN1YnNjcmliZSh0aGlzLmVkaXRFdmVudERpc3BhdGNoZXIuaG92ZXJpbmcpO1xuICAgICAgZnJvbUV2ZW50PE1vdXNlRXZlbnQ+KGVsZW1lbnQsICdtb3VzZW1vdmUnKS5waXBlKFxuICAgICAgICAgIHRocm90dGxlVGltZShNT1VTRV9NT1ZFX1RIUk9UVExFX1RJTUVfTVMpLFxuICAgICAgICAgIHRvQ2xvc2VzdChST1dfU0VMRUNUT1IpLFxuICAgICAgICAgIHRha2VVbnRpbCh0aGlzLmRlc3Ryb3llZCksXG4gICAgICAgICAgKS5zdWJzY3JpYmUodGhpcy5lZGl0RXZlbnREaXNwYXRjaGVyLm1vdXNlTW92ZSk7XG5cbiAgICAgIC8vIFRyYWNrIGZvY3VzIHdpdGhpbiB0aGUgdGFibGUgdG8gaGlkZS9zaG93L21ha2UgZm9jdXNhYmxlIGhvdmVyIGNvbnRlbnQuXG4gICAgICBmcm9tRXZlbnRQYXR0ZXJuPEZvY3VzRXZlbnQ+KFxuICAgICAgICAgIGhhbmRsZXIgPT4gZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdmb2N1cycsIGhhbmRsZXIsIHRydWUpLFxuICAgICAgICAgIGhhbmRsZXIgPT4gZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdmb2N1cycsIGhhbmRsZXIsIHRydWUpXG4gICAgICAgICAgKS5waXBlKFxuICAgICAgICAgICAgICB0b0Nsb3Nlc3QoUk9XX1NFTEVDVE9SKSxcbiAgICAgICAgICAgICAgc2hhcmUoKSxcbiAgICAgICAgICAgICAgdGFrZVVudGlsKHRoaXMuZGVzdHJveWVkKSxcbiAgICAgICAgICAgICAgKS5zdWJzY3JpYmUodGhpcy5lZGl0RXZlbnREaXNwYXRjaGVyLmZvY3VzZWQpO1xuXG4gICAgICBtZXJnZShcbiAgICAgICAgZnJvbUV2ZW50UGF0dGVybjxGb2N1c0V2ZW50PihcbiAgICAgICAgICBoYW5kbGVyID0+IGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignYmx1cicsIGhhbmRsZXIsIHRydWUpLFxuICAgICAgICAgIGhhbmRsZXIgPT4gZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdibHVyJywgaGFuZGxlciwgdHJ1ZSlcbiAgICAgICAgKSxcbiAgICAgICAgZnJvbUV2ZW50PEtleWJvYXJkRXZlbnQ+KGVsZW1lbnQsICdrZXlkb3duJykucGlwZShmaWx0ZXIoZXZlbnQgPT4gZXZlbnQua2V5ID09PSAnRXNjYXBlJykpXG4gICAgICApLnBpcGUoXG4gICAgICAgIG1hcFRvKG51bGwpLFxuICAgICAgICBzaGFyZSgpLFxuICAgICAgICB0YWtlVW50aWwodGhpcy5kZXN0cm95ZWQpLFxuICAgICAgKS5zdWJzY3JpYmUodGhpcy5lZGl0RXZlbnREaXNwYXRjaGVyLmZvY3VzZWQpO1xuXG4gICAgICAvLyBLZWVwIHRyYWNrIG9mIHJvd3Mgd2l0aGluIHRoZSB0YWJsZS4gVGhpcyBpcyB1c2VkIHRvIGtub3cgd2hpY2ggcm93cyB3aXRoIGhvdmVyIGNvbnRlbnRcbiAgICAgIC8vIGFyZSBmaXJzdCBvciBsYXN0IGluIHRoZSB0YWJsZS4gVGhleSBhcmUga2VwdCBmb2N1c2FibGUgaW4gY2FzZSBmb2N1cyBlbnRlcnMgZnJvbSBhYm92ZVxuICAgICAgLy8gb3IgYmVsb3cgdGhlIHRhYmxlLlxuICAgICAgdGhpcy5uZ1pvbmUub25TdGFibGUucGlwZShcbiAgICAgICAgICAvLyBPcHRpbWl6YXRpb246IGlnbm9yZSBkb20gY2hhbmdlcyB3aGlsZSBmb2N1cyBpcyB3aXRoaW4gdGhlIHRhYmxlIGFzIHdlIGFscmVhZHlcbiAgICAgICAgICAvLyBlbnN1cmUgdGhhdCByb3dzIGFib3ZlIGFuZCBiZWxvdyB0aGUgZm9jdXNlZC9hY3RpdmUgcm93IGFyZSB0YWJiYWJsZS5cbiAgICAgICAgICB3aXRoTGF0ZXN0RnJvbSh0aGlzLmVkaXRFdmVudERpc3BhdGNoZXIuZWRpdGluZ09yRm9jdXNlZCksXG4gICAgICAgICAgZmlsdGVyKChbXywgYWN0aXZlUm93XSkgPT4gYWN0aXZlUm93ID09IG51bGwpLFxuICAgICAgICAgIG1hcCgoKSA9PiBlbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoUk9XX1NFTEVDVE9SKSksXG4gICAgICAgICAgc2hhcmUoKSxcbiAgICAgICAgICB0YWtlVW50aWwodGhpcy5kZXN0cm95ZWQpLFxuICAgICAgICAgICkuc3Vic2NyaWJlKHRoaXMuZWRpdEV2ZW50RGlzcGF0Y2hlci5hbGxSb3dzKTtcblxuICAgICAgZnJvbUV2ZW50PEtleWJvYXJkRXZlbnQ+KGVsZW1lbnQsICdrZXlkb3duJykucGlwZShcbiAgICAgICAgICBmaWx0ZXIoZXZlbnQgPT4gZXZlbnQua2V5ID09PSAnRW50ZXInKSxcbiAgICAgICAgICB0b0Nsb3Nlc3QoQ0VMTF9TRUxFQ1RPUiksXG4gICAgICAgICAgdGFrZVVudGlsKHRoaXMuZGVzdHJveWVkKSxcbiAgICAgICAgICApLnN1YnNjcmliZSh0aGlzLmVkaXRFdmVudERpc3BhdGNoZXIuZWRpdGluZyk7XG5cbiAgICAgIC8vIEtleWRvd24gbXVzdCBiZSB1c2VkIGhlcmUgb3IgZWxzZSBrZXkgYXV0b3JlcGVhdCBkb2VzIG5vdCB3b3JrIHByb3Blcmx5IG9uIHNvbWUgcGxhdGZvcm1zLlxuICAgICAgZnJvbUV2ZW50PEtleWJvYXJkRXZlbnQ+KGVsZW1lbnQsICdrZXlkb3duJylcbiAgICAgICAgICAucGlwZSh0YWtlVW50aWwodGhpcy5kZXN0cm95ZWQpKVxuICAgICAgICAgIC5zdWJzY3JpYmUodGhpcy5mb2N1c0Rpc3BhdGNoZXIua2V5T2JzZXJ2ZXIpO1xuICAgIH0pO1xuICB9XG59XG5cbmNvbnN0IFBPUE9WRVJfRURJVF9IT1NUX0JJTkRJTkdTID0ge1xuICAnW2F0dHIudGFiaW5kZXhdJzogJ2Rpc2FibGVkID8gbnVsbCA6IDAnLFxuICAnY2xhc3MnOiAnY2RrLXBvcG92ZXItZWRpdC1jZWxsJyxcbiAgJ1thdHRyLmFyaWEtaGFzcG9wdXBdJzogJyFkaXNhYmxlZCcsXG59O1xuXG5jb25zdCBQT1BPVkVSX0VESVRfSU5QVVRTID0gW1xuICAndGVtcGxhdGU6IGNka1BvcG92ZXJFZGl0JyxcbiAgJ2NvbnRleHQ6IGNka1BvcG92ZXJFZGl0Q29udGV4dCcsXG4gICdjb2xzcGFuOiBjZGtQb3BvdmVyRWRpdENvbHNwYW4nLFxuICAnZGlzYWJsZWQ6IGNka1BvcG92ZXJFZGl0RGlzYWJsZWQnLFxuXTtcblxuLyoqXG4gKiBBdHRhY2hlcyBhbiBuZy10ZW1wbGF0ZSB0byBhIGNlbGwgYW5kIHNob3dzIGl0IHdoZW4gaW5zdHJ1Y3RlZCB0byBieSB0aGVcbiAqIEVkaXRFdmVudERpc3BhdGNoZXIgc2VydmljZS5cbiAqIE1ha2VzIHRoZSBjZWxsIGZvY3VzYWJsZS5cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW2Nka1BvcG92ZXJFZGl0XTpub3QoW2Nka1BvcG92ZXJFZGl0VGFiT3V0XSknLFxuICBob3N0OiBQT1BPVkVSX0VESVRfSE9TVF9CSU5ESU5HUyxcbiAgaW5wdXRzOiBQT1BPVkVSX0VESVRfSU5QVVRTLFxufSlcbmV4cG9ydCBjbGFzcyBDZGtQb3BvdmVyRWRpdDxDPiBpbXBsZW1lbnRzIEFmdGVyVmlld0luaXQsIE9uRGVzdHJveSB7XG4gIC8qKiBUaGUgZWRpdCBsZW5zIHRlbXBsYXRlIHNob3duIG92ZXIgdGhlIGNlbGwgb24gZWRpdC4gKi9cbiAgdGVtcGxhdGU6IFRlbXBsYXRlUmVmPGFueT58bnVsbCA9IG51bGw7XG5cbiAgLyoqXG4gICAqIEltcGxpY2l0IGNvbnRleHQgdG8gcGFzcyBhbG9uZyB0byB0aGUgdGVtcGxhdGUuIENhbiBiZSBvbWl0dGVkIGlmIHRoZSB0ZW1wbGF0ZVxuICAgKiBpcyBkZWZpbmVkIHdpdGhpbiB0aGUgY2VsbC5cbiAgICovXG4gIGNvbnRleHQ/OiBDO1xuXG4gIC8qKlxuICAgKiBTcGVjaWZpZXMgdGhhdCB0aGUgcG9wdXAgc2hvdWxkIGNvdmVyIGFkZGl0aW9uYWwgdGFibGUgY2VsbHMgYmVmb3JlIGFuZC9vciBhZnRlclxuICAgKiB0aGlzIG9uZS5cbiAgICovXG4gIGdldCBjb2xzcGFuKCk6IENka1BvcG92ZXJFZGl0Q29sc3BhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2NvbHNwYW47XG4gIH1cbiAgc2V0IGNvbHNwYW4odmFsdWU6IENka1BvcG92ZXJFZGl0Q29sc3Bhbikge1xuICAgIHRoaXMuX2NvbHNwYW4gPSB2YWx1ZTtcblxuICAgIC8vIFJlY29tcHV0ZSBwb3NpdGlvbmluZyB3aGVuIHRoZSBjb2xzcGFuIGNoYW5nZXMuXG4gICAgaWYgKHRoaXMub3ZlcmxheVJlZikge1xuICAgICAgdGhpcy5vdmVybGF5UmVmLnVwZGF0ZVBvc2l0aW9uU3RyYXRlZ3kodGhpcy5fZ2V0UG9zaXRpb25TdHJhdGVneSgpKTtcblxuICAgICAgaWYgKHRoaXMub3ZlcmxheVJlZi5oYXNBdHRhY2hlZCgpKSB7XG4gICAgICAgIHRoaXMuX3VwZGF0ZU92ZXJsYXlTaXplKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHByaXZhdGUgX2NvbHNwYW46IENka1BvcG92ZXJFZGl0Q29sc3BhbiA9IHt9O1xuXG4gIC8qKiBXaGV0aGVyIHBvcG92ZXIgZWRpdCBpcyBkaXNhYmxlZCBmb3IgdGhpcyBjZWxsLiAqL1xuICBnZXQgZGlzYWJsZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2Rpc2FibGVkO1xuICB9XG4gIHNldCBkaXNhYmxlZCh2YWx1ZTogYm9vbGVhbikge1xuICAgIHRoaXMuX2Rpc2FibGVkID0gdmFsdWU7XG5cbiAgICBpZiAodmFsdWUpIHtcbiAgICAgIHRoaXMuc2VydmljZXMuZWRpdEV2ZW50RGlzcGF0Y2hlci5kb25lRWRpdGluZ0NlbGwodGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQhKTtcbiAgICAgIHRoaXMuc2VydmljZXMuZWRpdEV2ZW50RGlzcGF0Y2hlci5kaXNhYmxlZENlbGxzLnNldCh0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCEsIHRydWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnNlcnZpY2VzLmVkaXRFdmVudERpc3BhdGNoZXIuZGlzYWJsZWRDZWxscy5kZWxldGUodGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQhKTtcbiAgICB9XG4gIH1cbiAgcHJpdmF0ZSBfZGlzYWJsZWQgPSBmYWxzZTtcblxuICBwcm90ZWN0ZWQgZm9jdXNUcmFwPzogRm9jdXNUcmFwO1xuICBwcm90ZWN0ZWQgb3ZlcmxheVJlZj86IE92ZXJsYXlSZWY7XG4gIHByb3RlY3RlZCByZWFkb25seSBkZXN0cm95ZWQgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJvdGVjdGVkIHJlYWRvbmx5IHNlcnZpY2VzOiBFZGl0U2VydmljZXMsIHByb3RlY3RlZCByZWFkb25seSBlbGVtZW50UmVmOiBFbGVtZW50UmVmLFxuICAgICAgcHJvdGVjdGVkIHJlYWRvbmx5IHZpZXdDb250YWluZXJSZWY6IFZpZXdDb250YWluZXJSZWYpIHt9XG5cbiAgbmdBZnRlclZpZXdJbml0KCk6IHZvaWQge1xuICAgIHRoaXMuX3N0YXJ0TGlzdGVuaW5nVG9FZGl0RXZlbnRzKCk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLmRlc3Ryb3llZC5uZXh0KCk7XG4gICAgdGhpcy5kZXN0cm95ZWQuY29tcGxldGUoKTtcblxuICAgIGlmICh0aGlzLmZvY3VzVHJhcCkge1xuICAgICAgdGhpcy5mb2N1c1RyYXAuZGVzdHJveSgpO1xuICAgICAgdGhpcy5mb2N1c1RyYXAgPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMub3ZlcmxheVJlZikge1xuICAgICAgdGhpcy5vdmVybGF5UmVmLmRpc3Bvc2UoKTtcbiAgICB9XG4gIH1cblxuICBwcm90ZWN0ZWQgaW5pdEZvY3VzVHJhcCgpOiB2b2lkIHtcbiAgICB0aGlzLmZvY3VzVHJhcCA9IHRoaXMuc2VydmljZXMuZm9jdXNUcmFwRmFjdG9yeS5jcmVhdGUodGhpcy5vdmVybGF5UmVmIS5vdmVybGF5RWxlbWVudCk7XG4gIH1cblxuICBwcm90ZWN0ZWQgY2xvc2VFZGl0T3ZlcmxheSgpOiB2b2lkIHtcbiAgICB0aGlzLnNlcnZpY2VzLmVkaXRFdmVudERpc3BhdGNoZXIuZG9uZUVkaXRpbmdDZWxsKHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50ISk7XG4gIH1cblxuICBwcm90ZWN0ZWQgcGFuZWxDbGFzcygpOiBzdHJpbmcge1xuICAgIHJldHVybiBFRElUX1BBTkVfQ0xBU1M7XG4gIH1cblxuICBwcml2YXRlIF9zdGFydExpc3RlbmluZ1RvRWRpdEV2ZW50cygpOiB2b2lkIHtcbiAgICB0aGlzLnNlcnZpY2VzLmVkaXRFdmVudERpc3BhdGNoZXIuZWRpdGluZ0NlbGwodGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQhKVxuICAgICAgICAucGlwZSh0YWtlVW50aWwodGhpcy5kZXN0cm95ZWQpKVxuICAgICAgICAuc3Vic2NyaWJlKChvcGVuKSA9PiB7XG4gICAgICAgICAgaWYgKG9wZW4gJiYgdGhpcy50ZW1wbGF0ZSkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLm92ZXJsYXlSZWYpIHtcbiAgICAgICAgICAgICAgdGhpcy5fY3JlYXRlRWRpdE92ZXJsYXkoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5fc2hvd0VkaXRPdmVybGF5KCk7XG4gICAgICAgICAgfSBlbHNlIGlmICh0aGlzLm92ZXJsYXlSZWYpIHtcbiAgICAgICAgICAgIHRoaXMuX21heWJlUmV0dXJuRm9jdXNUb0NlbGwoKTtcblxuICAgICAgICAgICAgdGhpcy5vdmVybGF5UmVmLmRldGFjaCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gIH1cblxuICBwcml2YXRlIF9jcmVhdGVFZGl0T3ZlcmxheSgpOiB2b2lkIHtcbiAgICB0aGlzLm92ZXJsYXlSZWYgPSB0aGlzLnNlcnZpY2VzLm92ZXJsYXkuY3JlYXRlKHtcbiAgICAgIGRpc3Bvc2VPbk5hdmlnYXRpb246IHRydWUsXG4gICAgICBwYW5lbENsYXNzOiB0aGlzLnBhbmVsQ2xhc3MoKSxcbiAgICAgIHBvc2l0aW9uU3RyYXRlZ3k6IHRoaXMuX2dldFBvc2l0aW9uU3RyYXRlZ3koKSxcbiAgICAgIHNjcm9sbFN0cmF0ZWd5OiB0aGlzLnNlcnZpY2VzLm92ZXJsYXkuc2Nyb2xsU3RyYXRlZ2llcy5yZXBvc2l0aW9uKCksXG4gICAgICBkaXJlY3Rpb246IHRoaXMuc2VydmljZXMuZGlyZWN0aW9uYWxpdHksXG4gICAgfSk7XG5cbiAgICB0aGlzLmluaXRGb2N1c1RyYXAoKTtcbiAgICB0aGlzLm92ZXJsYXlSZWYub3ZlcmxheUVsZW1lbnQuc2V0QXR0cmlidXRlKCdhcmlhLXJvbGUnLCAnZGlhbG9nJyk7XG5cbiAgICB0aGlzLm92ZXJsYXlSZWYuZGV0YWNobWVudHMoKS5zdWJzY3JpYmUoKCkgPT4gdGhpcy5jbG9zZUVkaXRPdmVybGF5KCkpO1xuICB9XG5cbiAgcHJpdmF0ZSBfc2hvd0VkaXRPdmVybGF5KCk6IHZvaWQge1xuICAgIHRoaXMub3ZlcmxheVJlZiEuYXR0YWNoKG5ldyBUZW1wbGF0ZVBvcnRhbChcbiAgICAgICAgdGhpcy50ZW1wbGF0ZSEsXG4gICAgICAgIHRoaXMudmlld0NvbnRhaW5lclJlZixcbiAgICAgICAgeyRpbXBsaWNpdDogdGhpcy5jb250ZXh0fSkpO1xuXG4gICAgLy8gV2UgaGF2ZSB0byBkZWZlciB0cmFwcGluZyBmb2N1cywgYmVjYXVzZSBkb2luZyBzbyB0b28gZWFybHkgY2FuIGNhdXNlIHRoZSBmb3JtIGluc2lkZVxuICAgIC8vIHRoZSBvdmVybGF5IHRvIGJlIHN1Ym1pdHRlZCBpbW1lZGlhdGVseSBpZiBpdCB3YXMgb3BlbmVkIG9uIGFuIEVudGVyIGtleWRvd24gZXZlbnQuXG4gICAgdGhpcy5zZXJ2aWNlcy5uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHRoaXMuZm9jdXNUcmFwIS5mb2N1c0luaXRpYWxFbGVtZW50KCk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIC8vIFVwZGF0ZSB0aGUgc2l6ZSBvZiB0aGUgcG9wdXAgaW5pdGlhbGx5IGFuZCBvbiBzdWJzZXF1ZW50IGNoYW5nZXMgdG9cbiAgICAvLyBzY3JvbGwgcG9zaXRpb24gYW5kIHZpZXdwb3J0IHNpemUuXG4gICAgbWVyZ2UodGhpcy5zZXJ2aWNlcy5zY3JvbGxEaXNwYXRjaGVyLnNjcm9sbGVkKCksIHRoaXMuc2VydmljZXMudmlld3BvcnRSdWxlci5jaGFuZ2UoKSlcbiAgICAgICAgLnBpcGUoXG4gICAgICAgICAgc3RhcnRXaXRoKG51bGwpLFxuICAgICAgICAgIHRha2VVbnRpbChtZXJnZSh0aGlzLm92ZXJsYXlSZWYhLmRldGFjaG1lbnRzKCksIHRoaXMuZGVzdHJveWVkKSlcbiAgICAgICAgKVxuICAgICAgICAuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgICAgICB0aGlzLl91cGRhdGVPdmVybGF5U2l6ZSgpO1xuICAgICAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX2dldE92ZXJsYXlDZWxscygpOiBIVE1MRWxlbWVudFtdIHtcbiAgICBjb25zdCBjZWxsID0gY2xvc2VzdCh0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCEsIENFTExfU0VMRUNUT1IpIGFzIEhUTUxFbGVtZW50O1xuXG4gICAgaWYgKCF0aGlzLl9jb2xzcGFuLmJlZm9yZSAmJiAhdGhpcy5fY29sc3Bhbi5hZnRlcikge1xuICAgICAgcmV0dXJuIFtjZWxsXTtcbiAgICB9XG5cbiAgICBjb25zdCByb3cgPSBjbG9zZXN0KHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50ISwgUk9XX1NFTEVDVE9SKSE7XG4gICAgY29uc3Qgcm93Q2VsbHMgPSBBcnJheS5mcm9tKHJvdy5xdWVyeVNlbGVjdG9yQWxsKENFTExfU0VMRUNUT1IpKSBhcyBIVE1MRWxlbWVudFtdO1xuICAgIGNvbnN0IG93bkluZGV4ID0gcm93Q2VsbHMuaW5kZXhPZihjZWxsKTtcblxuICAgIHJldHVybiByb3dDZWxscy5zbGljZShcbiAgICAgICAgb3duSW5kZXggLSAodGhpcy5fY29sc3Bhbi5iZWZvcmUgfHwgMCksIG93bkluZGV4ICsgKHRoaXMuX2NvbHNwYW4uYWZ0ZXIgfHwgMCkgKyAxKTtcbiAgfVxuXG4gIHByaXZhdGUgX2dldFBvc2l0aW9uU3RyYXRlZ3koKTogUG9zaXRpb25TdHJhdGVneSB7XG4gICAgcmV0dXJuIHRoaXMuc2VydmljZXMucG9zaXRpb25GYWN0b3J5LnBvc2l0aW9uU3RyYXRlZ3lGb3JDZWxscyh0aGlzLl9nZXRPdmVybGF5Q2VsbHMoKSk7XG4gIH1cblxuICBwcml2YXRlIF91cGRhdGVPdmVybGF5U2l6ZSgpOiB2b2lkIHtcbiAgICB0aGlzLm92ZXJsYXlSZWYhLnVwZGF0ZVNpemUoXG4gICAgICAgIHRoaXMuc2VydmljZXMucG9zaXRpb25GYWN0b3J5LnNpemVDb25maWdGb3JDZWxscyh0aGlzLl9nZXRPdmVybGF5Q2VsbHMoKSkpO1xuICB9XG5cbiAgcHJpdmF0ZSBfbWF5YmVSZXR1cm5Gb2N1c1RvQ2VsbCgpOiB2b2lkIHtcbiAgICBpZiAoY2xvc2VzdChkb2N1bWVudC5hY3RpdmVFbGVtZW50LCBFRElUX1BBTkVfU0VMRUNUT1IpID09PVxuICAgICAgICB0aGlzLm92ZXJsYXlSZWYhLm92ZXJsYXlFbGVtZW50KSB7XG4gICAgICB0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCEuZm9jdXMoKTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBBdHRhY2hlcyBhbiBuZy10ZW1wbGF0ZSB0byBhIGNlbGwgYW5kIHNob3dzIGl0IHdoZW4gaW5zdHJ1Y3RlZCB0byBieSB0aGVcbiAqIEVkaXRFdmVudERpc3BhdGNoZXIgc2VydmljZS5cbiAqIE1ha2VzIHRoZSBjZWxsIGZvY3VzYWJsZS5cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW2Nka1BvcG92ZXJFZGl0XVtjZGtQb3BvdmVyRWRpdFRhYk91dF0nLFxuICBob3N0OiBQT1BPVkVSX0VESVRfSE9TVF9CSU5ESU5HUyxcbiAgaW5wdXRzOiBQT1BPVkVSX0VESVRfSU5QVVRTLFxufSlcbmV4cG9ydCBjbGFzcyBDZGtQb3BvdmVyRWRpdFRhYk91dDxDPiBleHRlbmRzIENka1BvcG92ZXJFZGl0PEM+IHtcbiAgcHJvdGVjdGVkIGZvY3VzVHJhcD86IEZvY3VzRXNjYXBlTm90aWZpZXI7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBlbGVtZW50UmVmOiBFbGVtZW50UmVmLCB2aWV3Q29udGFpbmVyUmVmOiBWaWV3Q29udGFpbmVyUmVmLCBzZXJ2aWNlczogRWRpdFNlcnZpY2VzLFxuICAgICAgcHJvdGVjdGVkIHJlYWRvbmx5IGZvY3VzRXNjYXBlTm90aWZpZXJGYWN0b3J5OiBGb2N1c0VzY2FwZU5vdGlmaWVyRmFjdG9yeSkge1xuICAgIHN1cGVyKHNlcnZpY2VzLCBlbGVtZW50UmVmLCB2aWV3Q29udGFpbmVyUmVmKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBpbml0Rm9jdXNUcmFwKCk6IHZvaWQge1xuICAgIHRoaXMuZm9jdXNUcmFwID0gdGhpcy5mb2N1c0VzY2FwZU5vdGlmaWVyRmFjdG9yeS5jcmVhdGUodGhpcy5vdmVybGF5UmVmIS5vdmVybGF5RWxlbWVudCk7XG5cbiAgICB0aGlzLmZvY3VzVHJhcC5lc2NhcGVzKCkucGlwZSh0YWtlVW50aWwodGhpcy5kZXN0cm95ZWQpKS5zdWJzY3JpYmUoZGlyZWN0aW9uID0+IHtcbiAgICAgIGlmICh0aGlzLnNlcnZpY2VzLmVkaXRFdmVudERpc3BhdGNoZXIuZWRpdFJlZikge1xuICAgICAgICB0aGlzLnNlcnZpY2VzLmVkaXRFdmVudERpc3BhdGNoZXIuZWRpdFJlZi5ibHVyKCk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuc2VydmljZXMuZm9jdXNEaXNwYXRjaGVyLm1vdmVGb2N1c0hvcml6b250YWxseShcbiAgICAgICAgICBjbG9zZXN0KHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50ISwgQ0VMTF9TRUxFQ1RPUikgYXMgSFRNTEVsZW1lbnQsXG4gICAgICAgICAgZGlyZWN0aW9uID09PSBGb2N1c0VzY2FwZU5vdGlmaWVyRGlyZWN0aW9uLlNUQVJUID8gLTEgOiAxKTtcblxuICAgICAgdGhpcy5jbG9zZUVkaXRPdmVybGF5KCk7XG4gICAgfSk7XG4gIH1cbn1cblxuLyoqXG4gKiBBIHN0cnVjdHVyYWwgZGlyZWN0aXZlIHRoYXQgc2hvd3MgaXRzIGNvbnRlbnRzIHdoZW4gdGhlIHRhYmxlIHJvdyBjb250YWluaW5nXG4gKiBpdCBpcyBob3ZlcmVkIG9yIHdoZW4gYW4gZWxlbWVudCBpbiB0aGUgcm93IGhhcyBmb2N1cy5cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW2Nka1Jvd0hvdmVyQ29udGVudF0nLFxufSlcbmV4cG9ydCBjbGFzcyBDZGtSb3dIb3ZlckNvbnRlbnQgaW1wbGVtZW50cyBBZnRlclZpZXdJbml0LCBPbkRlc3Ryb3kge1xuICBwcm90ZWN0ZWQgcmVhZG9ubHkgZGVzdHJveWVkID0gbmV3IFN1YmplY3Q8dm9pZD4oKTtcbiAgcHJvdGVjdGVkIHZpZXdSZWY6IEVtYmVkZGVkVmlld1JlZjxhbnk+fG51bGwgPSBudWxsO1xuXG4gIHByaXZhdGUgX3Jvdz86IEVsZW1lbnQ7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgc2VydmljZXM6IEVkaXRTZXJ2aWNlcywgcHJvdGVjdGVkIHJlYWRvbmx5IGVsZW1lbnRSZWY6IEVsZW1lbnRSZWYsXG4gICAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgdGVtcGxhdGVSZWY6IFRlbXBsYXRlUmVmPGFueT4sXG4gICAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgdmlld0NvbnRhaW5lclJlZjogVmlld0NvbnRhaW5lclJlZikge31cblxuICBuZ0FmdGVyVmlld0luaXQoKTogdm9pZCB7XG4gICAgdGhpcy5fcm93ID0gY2xvc2VzdCh0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCEsIFJPV19TRUxFQ1RPUikhO1xuXG4gICAgdGhpcy5zZXJ2aWNlcy5lZGl0RXZlbnREaXNwYXRjaGVyLnJlZ2lzdGVyUm93V2l0aEhvdmVyQ29udGVudCh0aGlzLl9yb3cpO1xuICAgIHRoaXMuX2xpc3RlbkZvckhvdmVyQW5kRm9jdXNFdmVudHMoKTtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCk6IHZvaWQge1xuICAgIHRoaXMuZGVzdHJveWVkLm5leHQoKTtcbiAgICB0aGlzLmRlc3Ryb3llZC5jb21wbGV0ZSgpO1xuXG4gICAgaWYgKHRoaXMudmlld1JlZikge1xuICAgICAgdGhpcy52aWV3UmVmLmRlc3Ryb3koKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fcm93KSB7XG4gICAgICB0aGlzLnNlcnZpY2VzLmVkaXRFdmVudERpc3BhdGNoZXIuZGVyZWdpc3RlclJvd1dpdGhIb3ZlckNvbnRlbnQodGhpcy5fcm93KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIGltbWVkaWF0ZWx5IGFmdGVyIHRoZSBob3ZlciBjb250ZW50IGlzIGNyZWF0ZWQgYW5kIGFkZGVkIHRvIHRoZSBkb20uXG4gICAqIEluIHRoZSBDREsgdmVyc2lvbiwgdGhpcyBpcyBhIG5vb3AgYnV0IHN1YmNsYXNzZXMgc3VjaCBhcyBNYXRSb3dIb3ZlckNvbnRlbnQgdXNlIHRoaXNcbiAgICogdG8gcHJlcGFyZS9zdHlsZSB0aGUgaW5zZXJ0ZWQgZWxlbWVudC5cbiAgICovXG4gIHByb3RlY3RlZCBpbml0RWxlbWVudChfOiBIVE1MRWxlbWVudCk6IHZvaWQge1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIHRoZSBob3ZlciBjb250ZW50IG5lZWRzIHRvIGJlIGZvY3VzYWJsZSB0byBwcmVzZXJ2ZSBhIHJlYXNvbmFibGUgdGFiIG9yZGVyaW5nXG4gICAqIGJ1dCBzaG91bGQgbm90IHlldCBiZSBzaG93bi5cbiAgICovXG4gIHByb3RlY3RlZCBtYWtlRWxlbWVudEhpZGRlbkJ1dEZvY3VzYWJsZShlbGVtZW50OiBIVE1MRWxlbWVudCk6IHZvaWQge1xuICAgIGVsZW1lbnQuc3R5bGUub3BhY2l0eSA9ICcwJztcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiB0aGUgaG92ZXIgY29udGVudCBuZWVkcyB0byBiZSBmb2N1c2FibGUgdG8gcHJlc2VydmUgYSByZWFzb25hYmxlIHRhYiBvcmRlcmluZ1xuICAgKiBidXQgc2hvdWxkIG5vdCB5ZXQgYmUgc2hvd24uXG4gICAqL1xuICBwcm90ZWN0ZWQgbWFrZUVsZW1lbnRWaXNpYmxlKGVsZW1lbnQ6IEhUTUxFbGVtZW50KTogdm9pZCB7XG4gICAgZWxlbWVudC5zdHlsZS5vcGFjaXR5ID0gJyc7XG4gIH1cblxuICBwcml2YXRlIF9saXN0ZW5Gb3JIb3ZlckFuZEZvY3VzRXZlbnRzKCk6IHZvaWQge1xuICAgIHRoaXMuc2VydmljZXMuZWRpdEV2ZW50RGlzcGF0Y2hlci5ob3Zlck9yRm9jdXNPblJvdyh0aGlzLl9yb3chKVxuICAgICAgICAucGlwZSh0YWtlVW50aWwodGhpcy5kZXN0cm95ZWQpKVxuICAgICAgICAuc3Vic2NyaWJlKGV2ZW50U3RhdGUgPT4ge1xuICAgICAgICAgIC8vIFdoZW4gaW4gRk9DVVNBQkxFIHN0YXRlLCBhZGQgdGhlIGhvdmVyIGNvbnRlbnQgdG8gdGhlIGRvbSBidXQgbWFrZSBpdCB0cmFuc3BhcmVudCBzb1xuICAgICAgICAgIC8vIHRoYXQgaXQgaXMgaW4gdGhlIHRhYiBvcmRlciByZWxhdGl2ZSB0byB0aGUgY3VycmVudGx5IGZvY3VzZWQgcm93LlxuXG4gICAgICAgICAgaWYgKGV2ZW50U3RhdGUgPT09IEhvdmVyQ29udGVudFN0YXRlLk9OIHx8IGV2ZW50U3RhdGUgPT09IEhvdmVyQ29udGVudFN0YXRlLkZPQ1VTQUJMRSkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLnZpZXdSZWYpIHtcbiAgICAgICAgICAgICAgdGhpcy52aWV3UmVmID0gdGhpcy52aWV3Q29udGFpbmVyUmVmLmNyZWF0ZUVtYmVkZGVkVmlldyh0aGlzLnRlbXBsYXRlUmVmLCB7fSk7XG4gICAgICAgICAgICAgIHRoaXMuaW5pdEVsZW1lbnQodGhpcy52aWV3UmVmLnJvb3ROb2Rlc1swXSBhcyBIVE1MRWxlbWVudCk7XG4gICAgICAgICAgICAgIHRoaXMudmlld1JlZi5tYXJrRm9yQ2hlY2soKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy52aWV3Q29udGFpbmVyUmVmLmluZGV4T2YodGhpcy52aWV3UmVmKSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgdGhpcy52aWV3Q29udGFpbmVyUmVmLmluc2VydCh0aGlzLnZpZXdSZWYhKTtcbiAgICAgICAgICAgICAgdGhpcy52aWV3UmVmLm1hcmtGb3JDaGVjaygpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZXZlbnRTdGF0ZSA9PT0gSG92ZXJDb250ZW50U3RhdGUuT04pIHtcbiAgICAgICAgICAgICAgdGhpcy5tYWtlRWxlbWVudFZpc2libGUodGhpcy52aWV3UmVmLnJvb3ROb2Rlc1swXSBhcyBIVE1MRWxlbWVudCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB0aGlzLm1ha2VFbGVtZW50SGlkZGVuQnV0Rm9jdXNhYmxlKHRoaXMudmlld1JlZi5yb290Tm9kZXNbMF0gYXMgSFRNTEVsZW1lbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy52aWV3UmVmKSB7XG4gICAgICAgICAgICB0aGlzLnZpZXdDb250YWluZXJSZWYuZGV0YWNoKHRoaXMudmlld0NvbnRhaW5lclJlZi5pbmRleE9mKHRoaXMudmlld1JlZikpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gIH1cbn1cblxuLyoqXG4gKiBPcGVucyB0aGUgY2xvc2VzdCBlZGl0IHBvcG92ZXIgdG8gdGhpcyBlbGVtZW50LCB3aGV0aGVyIGl0J3MgYXNzb2NpYXRlZCB3aXRoIHRoaXMgZXhhY3RcbiAqIGVsZW1lbnQgb3IgYW4gYW5jZXN0b3IgZWxlbWVudC5cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW2Nka0VkaXRPcGVuXScsXG59KVxuZXhwb3J0IGNsYXNzIENka0VkaXRPcGVuIHtcbiAgY29uc3RydWN0b3IoXG4gICAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgZWxlbWVudFJlZjogRWxlbWVudFJlZjxIVE1MRWxlbWVudD4sXG4gICAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgZWRpdEV2ZW50RGlzcGF0Y2hlcjogRWRpdEV2ZW50RGlzcGF0Y2hlcikge1xuXG4gICAgY29uc3QgbmF0aXZlRWxlbWVudCA9IGVsZW1lbnRSZWYubmF0aXZlRWxlbWVudDtcblxuICAgIC8vIFByZXZlbnQgYWNjaWRlbnRhbCBmb3JtIHN1Ym1pdHMuXG4gICAgaWYgKG5hdGl2ZUVsZW1lbnQubm9kZU5hbWUgPT09ICdCVVRUT04nICYmICFuYXRpdmVFbGVtZW50LmdldEF0dHJpYnV0ZSgndHlwZScpKSB7XG4gICAgICBuYXRpdmVFbGVtZW50LnNldEF0dHJpYnV0ZSgndHlwZScsICdidXR0b24nKTtcbiAgICB9XG4gIH1cblxuICAvLyBJbiBJdnkgdGhlIGBob3N0YCBtZXRhZGF0YSB3aWxsIGJlIG1lcmdlZCwgd2hlcmVhcyBpbiBWaWV3RW5naW5lIGl0IGlzIG92ZXJyaWRkZW4uIEluIG9yZGVyXG4gIC8vIHRvIGF2b2lkIGRvdWJsZSBldmVudCBsaXN0ZW5lcnMsIHdlIG5lZWQgdG8gdXNlIGBIb3N0TGlzdGVuZXJgLiBPbmNlIEl2eSBpcyB0aGUgZGVmYXVsdCwgd2VcbiAgLy8gY2FuIG1vdmUgdGhpcyBiYWNrIGludG8gYGhvc3RgLlxuICAvLyB0c2xpbnQ6ZGlzYWJsZTpuby1ob3N0LWRlY29yYXRvci1pbi1jb25jcmV0ZVxuICBASG9zdExpc3RlbmVyKCdjbGljaycsIFsnJGV2ZW50J10pXG4gIG9wZW5FZGl0KGV2dDogRXZlbnQpOiB2b2lkIHtcbiAgICB0aGlzLmVkaXRFdmVudERpc3BhdGNoZXIuZWRpdGluZy5uZXh0KGNsb3Nlc3QodGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQhLCBDRUxMX1NFTEVDVE9SKSk7XG4gICAgZXZ0LnN0b3BQcm9wYWdhdGlvbigpO1xuICB9XG59XG4iXX0=