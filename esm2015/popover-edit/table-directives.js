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
    // tslint:disable-next-line:no-host-decorator-in-concrete
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFibGUtZGlyZWN0aXZlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL3BvcG92ZXItZWRpdC90YWJsZS1kaXJlY3RpdmVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQVNBLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUNuRCxPQUFPLEVBRUwsU0FBUyxFQUNULFVBQVUsRUFFVixNQUFNLEVBRU4sV0FBVyxFQUNYLGdCQUFnQixFQUNoQixZQUFZLEdBQ2IsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFDLFNBQVMsRUFBRSxnQkFBZ0IsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQ2pFLE9BQU8sRUFDTCxNQUFNLEVBQ04sR0FBRyxFQUNILEtBQUssRUFDTCxLQUFLLEVBQ0wsU0FBUyxFQUNULFNBQVMsRUFDVCxZQUFZLEVBQ1osY0FBYyxHQUNmLE1BQU0sZ0JBQWdCLENBQUM7QUFFeEIsT0FBTyxFQUFDLGFBQWEsRUFBRSxlQUFlLEVBQUUsa0JBQWtCLEVBQUUsWUFBWSxFQUFDLE1BQU0sYUFBYSxDQUFDO0FBQzdGLE9BQU8sRUFBQyxtQkFBbUIsRUFBb0IsTUFBTSx5QkFBeUIsQ0FBQztBQUMvRSxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDN0MsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLG9CQUFvQixDQUFDO0FBQ25ELE9BQU8sRUFHTCwwQkFBMEIsRUFDM0IsTUFBTSx5QkFBeUIsQ0FBQztBQUNqQyxPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sWUFBWSxDQUFDO0FBYW5DLCtDQUErQztBQUMvQyxNQUFNLDJCQUEyQixHQUFHLEVBQUUsQ0FBQztBQUV2Qzs7OztHQUlHO0FBS0gsTUFBTSxPQUFPLFdBQVc7SUFHdEIsWUFDdUIsVUFBc0IsRUFDdEIsbUJBQTBELEVBQzFELGVBQWdDLEVBQXFCLE1BQWM7UUFGbkUsZUFBVSxHQUFWLFVBQVUsQ0FBWTtRQUN0Qix3QkFBbUIsR0FBbkIsbUJBQW1CLENBQXVDO1FBQzFELG9CQUFlLEdBQWYsZUFBZSxDQUFpQjtRQUFxQixXQUFNLEdBQU4sTUFBTSxDQUFRO1FBTHZFLGNBQVMsR0FBRyxJQUFJLE9BQU8sRUFBUSxDQUFDO0lBSzBDLENBQUM7SUFFOUYsZUFBZTtRQUNiLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO0lBQy9CLENBQUM7SUFFRCxXQUFXO1FBQ1QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUN0QixJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQzVCLENBQUM7SUFFTyxxQkFBcUI7UUFDM0IsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUM7UUFDOUMsTUFBTSxTQUFTLEdBQUcsQ0FBQyxRQUFnQixFQUFFLEVBQUUsQ0FDbkMsR0FBRyxDQUFDLENBQUMsS0FBYyxFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBRTdELElBQUksQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsR0FBRyxFQUFFO1lBQ2pDLGtFQUFrRTtZQUNsRSxTQUFTLENBQWEsT0FBTyxFQUFFLFdBQVcsQ0FBQyxDQUFDLElBQUksQ0FDNUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxFQUN2QixTQUFTLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUN4QixDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDbkQsU0FBUyxDQUFhLE9BQU8sRUFBRSxZQUFZLENBQUMsQ0FBQyxJQUFJLENBQzdDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFDWCxTQUFTLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUN4QixDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDbkQsU0FBUyxDQUFhLE9BQU8sRUFBRSxXQUFXLENBQUMsQ0FBQyxJQUFJLENBQzVDLFlBQVksQ0FBQywyQkFBMkIsQ0FBQyxFQUN6QyxTQUFTLENBQUMsWUFBWSxDQUFDLEVBQ3ZCLFNBQVMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQ3hCLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUVwRCwwRUFBMEU7WUFDMUUsZ0JBQWdCLENBQ1osT0FBTyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsRUFDM0QsT0FBTyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsbUJBQW1CLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FDN0QsQ0FBQyxJQUFJLENBQ0YsU0FBUyxDQUFDLFlBQVksQ0FBQyxFQUN2QixLQUFLLEVBQUUsRUFDUCxTQUFTLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUN4QixDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFdEQsS0FBSyxDQUNILGdCQUFnQixDQUNkLE9BQU8sQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLEVBQzFELE9BQU8sQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLG1CQUFtQixDQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQzlELEVBQ0QsU0FBUyxDQUFnQixPQUFPLEVBQUUsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FDM0YsQ0FBQyxJQUFJLENBQ0osS0FBSyxDQUFDLElBQUksQ0FBQyxFQUNYLEtBQUssRUFBRSxFQUNQLFNBQVMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQzFCLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUU5QywwRkFBMEY7WUFDMUYsMEZBQTBGO1lBQzFGLHNCQUFzQjtZQUN0QixJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJO1lBQ3JCLGlGQUFpRjtZQUNqRix3RUFBd0U7WUFDeEUsY0FBYyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUN6RCxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxTQUFTLENBQUMsRUFBRSxFQUFFLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxFQUM3QyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLFlBQVksQ0FBQyxDQUFDLEVBQ2pELEtBQUssRUFBRSxFQUNQLFNBQVMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQ3hCLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUVsRCxTQUFTLENBQWdCLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQzdDLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLEtBQUssT0FBTyxDQUFDLEVBQ3RDLFNBQVMsQ0FBQyxhQUFhLENBQUMsRUFDeEIsU0FBUyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FDeEIsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBRWxELDZGQUE2RjtZQUM3RixTQUFTLENBQWdCLE9BQU8sRUFBRSxTQUFTLENBQUM7aUJBQ3ZDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO2lCQUMvQixTQUFTLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUNuRCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7OztZQXhGRixTQUFTLFNBQUM7Z0JBQ1QsUUFBUSxFQUFFLDJEQUEyRDtnQkFDckUsU0FBUyxFQUFFLENBQUMsbUJBQW1CLEVBQUUsWUFBWSxDQUFDO2FBQy9DOzs7WUFyREMsVUFBVTtZQXFCSixtQkFBbUI7WUFFbkIsZUFBZTtZQXJCckIsTUFBTTs7QUEySVIsTUFBTSwwQkFBMEIsR0FBRztJQUNqQyxpQkFBaUIsRUFBRSxxQkFBcUI7SUFDeEMsT0FBTyxFQUFFLHVCQUF1QjtJQUNoQyxzQkFBc0IsRUFBRSxXQUFXO0NBQ3BDLENBQUM7QUFFRixNQUFNLG1CQUFtQixHQUFHO0lBQzFCLDBCQUEwQjtJQUMxQixnQ0FBZ0M7SUFDaEMsZ0NBQWdDO0lBQ2hDLGtDQUFrQztDQUNuQyxDQUFDO0FBRUY7Ozs7R0FJRztBQU1ILE1BQU0sT0FBTyxjQUFjO0lBbUR6QixZQUN1QixRQUFzQixFQUFxQixVQUFzQixFQUNqRSxnQkFBa0M7UUFEbEMsYUFBUSxHQUFSLFFBQVEsQ0FBYztRQUFxQixlQUFVLEdBQVYsVUFBVSxDQUFZO1FBQ2pFLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7UUFwRHpELDBEQUEwRDtRQUMxRCxhQUFRLEdBQTBCLElBQUksQ0FBQztRQTJCL0IsYUFBUSxHQUEwQixFQUFFLENBQUM7UUFnQnJDLGNBQVMsR0FBRyxLQUFLLENBQUM7UUFJUCxjQUFTLEdBQUcsSUFBSSxPQUFPLEVBQVEsQ0FBQztJQUlTLENBQUM7SUEzQzdEOzs7T0FHRztJQUNILElBQUksT0FBTztRQUNULE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztJQUN2QixDQUFDO0lBQ0QsSUFBSSxPQUFPLENBQUMsS0FBNEI7UUFDdEMsSUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7UUFFdEIsa0RBQWtEO1FBQ2xELElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRTtZQUNuQixJQUFJLENBQUMsVUFBVSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLENBQUM7WUFFcEUsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsRUFBRSxFQUFFO2dCQUNqQyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQzthQUMzQjtTQUNGO0lBQ0gsQ0FBQztJQUdELHNEQUFzRDtJQUN0RCxJQUFJLFFBQVE7UUFDVixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUM7SUFDeEIsQ0FBQztJQUNELElBQUksUUFBUSxDQUFDLEtBQWM7UUFDekIsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7UUFFdkIsSUFBSSxLQUFLLEVBQUU7WUFDVCxJQUFJLENBQUMsUUFBUSxDQUFDLG1CQUFtQixDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLGFBQWMsQ0FBQyxDQUFDO1lBQ2xGLElBQUksQ0FBQyxRQUFRLENBQUMsbUJBQW1CLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLGFBQWMsRUFBRSxJQUFJLENBQUMsQ0FBQztTQUMzRjthQUFNO1lBQ0wsSUFBSSxDQUFDLFFBQVEsQ0FBQyxtQkFBbUIsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsYUFBYyxDQUFDLENBQUM7U0FDeEY7SUFDSCxDQUFDO0lBV0QsZUFBZTtRQUNiLElBQUksQ0FBQywyQkFBMkIsRUFBRSxDQUFDO0lBQ3JDLENBQUM7SUFFRCxXQUFXO1FBQ1QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUN0QixJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBRTFCLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUNsQixJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ3pCLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1NBQzVCO1FBRUQsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQ25CLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLENBQUM7U0FDM0I7SUFDSCxDQUFDO0lBRVMsYUFBYTtRQUNyQixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFXLENBQUMsY0FBYyxDQUFDLENBQUM7SUFDMUYsQ0FBQztJQUVTLGdCQUFnQjtRQUN4QixJQUFJLENBQUMsUUFBUSxDQUFDLG1CQUFtQixDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLGFBQWMsQ0FBQyxDQUFDO0lBQ3BGLENBQUM7SUFFUyxVQUFVO1FBQ2xCLE9BQU8sZUFBZSxDQUFDO0lBQ3pCLENBQUM7SUFFTywyQkFBMkI7UUFDakMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxtQkFBbUIsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxhQUFjLENBQUM7YUFDeEUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7YUFDL0IsU0FBUyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUU7WUFDbEIsSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtnQkFDekIsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUU7b0JBQ3BCLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO2lCQUMzQjtnQkFFRCxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQzthQUN6QjtpQkFBTSxJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUU7Z0JBQzFCLElBQUksQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO2dCQUUvQixJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDO2FBQzFCO1FBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDVCxDQUFDO0lBRU8sa0JBQWtCO1FBQ3hCLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDO1lBQzdDLG1CQUFtQixFQUFFLElBQUk7WUFDekIsVUFBVSxFQUFFLElBQUksQ0FBQyxVQUFVLEVBQUU7WUFDN0IsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLG9CQUFvQixFQUFFO1lBQzdDLGNBQWMsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLEVBQUU7WUFDbkUsU0FBUyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsY0FBYztTQUN4QyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7UUFDckIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDLFdBQVcsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUVuRSxJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsRUFBRSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDO0lBQ3pFLENBQUM7SUFFTyxnQkFBZ0I7UUFDdEIsSUFBSSxDQUFDLFVBQVcsQ0FBQyxNQUFNLENBQUMsSUFBSSxjQUFjLENBQ3RDLElBQUksQ0FBQyxRQUFTLEVBQ2QsSUFBSSxDQUFDLGdCQUFnQixFQUNyQixFQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFDLENBQUMsQ0FBQyxDQUFDO1FBRWhDLHdGQUF3RjtRQUN4RixzRkFBc0Y7UUFDdEYsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsR0FBRyxFQUFFO1lBQzFDLFVBQVUsQ0FBQyxHQUFHLEVBQUU7Z0JBQ2QsSUFBSSxDQUFDLFNBQVUsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO1lBQ3hDLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7UUFFSCxzRUFBc0U7UUFDdEUscUNBQXFDO1FBQ3JDLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRSxDQUFDO2FBQ2pGLElBQUksQ0FDSCxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQ2YsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsVUFBVyxDQUFDLFdBQVcsRUFBRSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUNqRTthQUNBLFNBQVMsQ0FBQyxHQUFHLEVBQUU7WUFDZCxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztRQUM1QixDQUFDLENBQUMsQ0FBQztJQUNULENBQUM7SUFFTyxnQkFBZ0I7UUFDdEIsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsYUFBYyxFQUFFLGFBQWEsQ0FBZ0IsQ0FBQztRQUVuRixJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRTtZQUNqRCxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDZjtRQUVELE1BQU0sR0FBRyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLGFBQWMsRUFBRSxZQUFZLENBQUUsQ0FBQztRQUNuRSxNQUFNLFFBQVEsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsQ0FBa0IsQ0FBQztRQUNsRixNQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRXhDLE9BQU8sUUFBUSxDQUFDLEtBQUssQ0FDakIsUUFBUSxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLEVBQUUsUUFBUSxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDekYsQ0FBQztJQUVPLG9CQUFvQjtRQUMxQixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLHdCQUF3QixDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUM7SUFDekYsQ0FBQztJQUVPLGtCQUFrQjtRQUN4QixJQUFJLENBQUMsVUFBVyxDQUFDLFVBQVUsQ0FDdkIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ2pGLENBQUM7SUFFTyx1QkFBdUI7UUFDN0IsSUFBSSxPQUFPLENBQUMsUUFBUSxDQUFDLGFBQWEsRUFBRSxrQkFBa0IsQ0FBQztZQUNuRCxJQUFJLENBQUMsVUFBVyxDQUFDLGNBQWMsRUFBRTtZQUNuQyxJQUFJLENBQUMsVUFBVSxDQUFDLGFBQWMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztTQUN4QztJQUNILENBQUM7OztZQWxMRixTQUFTLFNBQUM7Z0JBQ1QsUUFBUSxFQUFFLDhDQUE4QztnQkFDeEQsSUFBSSxFQUFFLDBCQUEwQjtnQkFDaEMsTUFBTSxFQUFFLG1CQUFtQjthQUM1Qjs7O1lBN0lPLFlBQVk7WUF0QmxCLFVBQVU7WUFLVixnQkFBZ0I7O0FBK1VsQjs7OztHQUlHO0FBTUgsTUFBTSxPQUFPLG9CQUF3QixTQUFRLGNBQWlCO0lBRzVELFlBQ0ksVUFBc0IsRUFBRSxnQkFBa0MsRUFBRSxRQUFzQixFQUMvRCwwQkFBc0Q7UUFDM0UsS0FBSyxDQUFDLFFBQVEsRUFBRSxVQUFVLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztRQUR6QiwrQkFBMEIsR0FBMUIsMEJBQTBCLENBQTRCO0lBRTdFLENBQUM7SUFFa0IsYUFBYTtRQUM5QixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVcsQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUV6RixJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxFQUFFO1lBQzdFLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLEVBQUU7Z0JBQzdDLElBQUksQ0FBQyxRQUFRLENBQUMsbUJBQW1CLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO2FBQ2xEO1lBRUQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMscUJBQXFCLENBQy9DLE9BQU8sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLGFBQWMsRUFBRSxhQUFhLENBQWdCLEVBQ3JFLFNBQVMsa0JBQXVDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUUvRCxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUMxQixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7OztZQTVCRixTQUFTLFNBQUM7Z0JBQ1QsUUFBUSxFQUFFLHdDQUF3QztnQkFDbEQsSUFBSSxFQUFFLDBCQUEwQjtnQkFDaEMsTUFBTSxFQUFFLG1CQUFtQjthQUM1Qjs7O1lBN1ZDLFVBQVU7WUFLVixnQkFBZ0I7WUFpQlYsWUFBWTtZQUtsQiwwQkFBMEI7O0FBNlY1Qjs7O0dBR0c7QUFJSCxNQUFNLE9BQU8sa0JBQWtCO0lBTTdCLFlBQ3VCLFFBQXNCLEVBQXFCLFVBQXNCLEVBQ2pFLFdBQTZCLEVBQzdCLGdCQUFrQztRQUZsQyxhQUFRLEdBQVIsUUFBUSxDQUFjO1FBQXFCLGVBQVUsR0FBVixVQUFVLENBQVk7UUFDakUsZ0JBQVcsR0FBWCxXQUFXLENBQWtCO1FBQzdCLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7UUFSdEMsY0FBUyxHQUFHLElBQUksT0FBTyxFQUFRLENBQUM7UUFDekMsWUFBTyxHQUE4QixJQUFJLENBQUM7SUFPUSxDQUFDO0lBRTdELGVBQWU7UUFDYixJQUFJLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLGFBQWMsRUFBRSxZQUFZLENBQUUsQ0FBQztRQUVuRSxJQUFJLENBQUMsUUFBUSxDQUFDLG1CQUFtQixDQUFDLDJCQUEyQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN6RSxJQUFJLENBQUMsNkJBQTZCLEVBQUUsQ0FBQztJQUN2QyxDQUFDO0lBRUQsV0FBVztRQUNULElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDdEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUUxQixJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDaEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztTQUN4QjtRQUVELElBQUksSUFBSSxDQUFDLElBQUksRUFBRTtZQUNiLElBQUksQ0FBQyxRQUFRLENBQUMsbUJBQW1CLENBQUMsNkJBQTZCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQzVFO0lBQ0gsQ0FBQztJQUVEOzs7O09BSUc7SUFDTyxXQUFXLENBQUMsQ0FBYztJQUNwQyxDQUFDO0lBRUQ7OztPQUdHO0lBQ08sNkJBQTZCLENBQUMsT0FBb0I7UUFDMUQsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsR0FBRyxDQUFDO0lBQzlCLENBQUM7SUFFRDs7O09BR0c7SUFDTyxrQkFBa0IsQ0FBQyxPQUFvQjtRQUMvQyxPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7SUFDN0IsQ0FBQztJQUVPLDZCQUE2QjtRQUNuQyxJQUFJLENBQUMsUUFBUSxDQUFDLG1CQUFtQixDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxJQUFLLENBQUM7YUFDMUQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7YUFDL0IsU0FBUyxDQUFDLFVBQVUsQ0FBQyxFQUFFO1lBQ3RCLHVGQUF1RjtZQUN2RixxRUFBcUU7WUFFckUsSUFBSSxVQUFVLGVBQXlCLElBQUksVUFBVSxzQkFBZ0MsRUFBRTtnQkFDckYsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUU7b0JBQ2pCLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUFDLENBQUM7b0JBQzlFLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFnQixDQUFDLENBQUM7b0JBQzNELElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFFLENBQUM7aUJBQzdCO3FCQUFNLElBQUksSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7b0JBQzdELElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQVEsQ0FBQyxDQUFDO29CQUM1QyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksRUFBRSxDQUFDO2lCQUM3QjtnQkFFRCxJQUFJLFVBQVUsZUFBeUIsRUFBRTtvQkFDdkMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBZ0IsQ0FBQyxDQUFDO2lCQUNuRTtxQkFBTTtvQkFDTCxJQUFJLENBQUMsNkJBQTZCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFnQixDQUFDLENBQUM7aUJBQzlFO2FBQ0Y7aUJBQU0sSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO2dCQUN2QixJQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7YUFDM0U7UUFDSCxDQUFDLENBQUMsQ0FBQztJQUNULENBQUM7OztZQXBGRixTQUFTLFNBQUM7Z0JBQ1QsUUFBUSxFQUFFLHNCQUFzQjthQUNqQzs7O1lBeFdPLFlBQVk7WUF0QmxCLFVBQVU7WUFJVixXQUFXO1lBQ1gsZ0JBQWdCOztBQThjbEI7OztHQUdHO0FBSUgsTUFBTSxPQUFPLFdBQVc7SUFDdEIsWUFDdUIsVUFBbUMsRUFDbkMsbUJBQTBEO1FBRDFELGVBQVUsR0FBVixVQUFVLENBQXlCO1FBQ25DLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBdUM7UUFFL0UsTUFBTSxhQUFhLEdBQUcsVUFBVSxDQUFDLGFBQWEsQ0FBQztRQUUvQyxtQ0FBbUM7UUFDbkMsSUFBSSxhQUFhLENBQUMsUUFBUSxLQUFLLFFBQVEsSUFBSSxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLEVBQUU7WUFDOUUsYUFBYSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUM7U0FDOUM7SUFDSCxDQUFDO0lBRUQsOEZBQThGO0lBQzlGLDhGQUE4RjtJQUM5RixrQ0FBa0M7SUFDbEMseURBQXlEO0lBRXpELFFBQVEsQ0FBQyxHQUFVO1FBQ2pCLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLGFBQWMsRUFBRSxhQUFhLENBQUMsQ0FBQyxDQUFDO1FBQzlGLEdBQUcsQ0FBQyxlQUFlLEVBQUUsQ0FBQztJQUN4QixDQUFDOzs7WUF4QkYsU0FBUyxTQUFDO2dCQUNULFFBQVEsRUFBRSxlQUFlO2FBQzFCOzs7WUF6ZEMsVUFBVTtZQXFCSixtQkFBbUI7Ozt1QkFzZHhCLFlBQVksU0FBQyxPQUFPLEVBQUUsQ0FBQyxRQUFRLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7Rm9jdXNUcmFwfSBmcm9tICdAYW5ndWxhci9jZGsvYTExeSc7XG5pbXBvcnQge092ZXJsYXlSZWYsIFBvc2l0aW9uU3RyYXRlZ3l9IGZyb20gJ0Bhbmd1bGFyL2Nkay9vdmVybGF5JztcbmltcG9ydCB7VGVtcGxhdGVQb3J0YWx9IGZyb20gJ0Bhbmd1bGFyL2Nkay9wb3J0YWwnO1xuaW1wb3J0IHtcbiAgQWZ0ZXJWaWV3SW5pdCxcbiAgRGlyZWN0aXZlLFxuICBFbGVtZW50UmVmLFxuICBFbWJlZGRlZFZpZXdSZWYsXG4gIE5nWm9uZSxcbiAgT25EZXN0cm95LFxuICBUZW1wbGF0ZVJlZixcbiAgVmlld0NvbnRhaW5lclJlZixcbiAgSG9zdExpc3RlbmVyLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7ZnJvbUV2ZW50LCBmcm9tRXZlbnRQYXR0ZXJuLCBtZXJnZSwgU3ViamVjdH0gZnJvbSAncnhqcyc7XG5pbXBvcnQge1xuICBmaWx0ZXIsXG4gIG1hcCxcbiAgbWFwVG8sXG4gIHNoYXJlLFxuICBzdGFydFdpdGgsXG4gIHRha2VVbnRpbCxcbiAgdGhyb3R0bGVUaW1lLFxuICB3aXRoTGF0ZXN0RnJvbSxcbn0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuXG5pbXBvcnQge0NFTExfU0VMRUNUT1IsIEVESVRfUEFORV9DTEFTUywgRURJVF9QQU5FX1NFTEVDVE9SLCBST1dfU0VMRUNUT1J9IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCB7RWRpdEV2ZW50RGlzcGF0Y2hlciwgSG92ZXJDb250ZW50U3RhdGV9IGZyb20gJy4vZWRpdC1ldmVudC1kaXNwYXRjaGVyJztcbmltcG9ydCB7RWRpdFNlcnZpY2VzfSBmcm9tICcuL2VkaXQtc2VydmljZXMnO1xuaW1wb3J0IHtGb2N1c0Rpc3BhdGNoZXJ9IGZyb20gJy4vZm9jdXMtZGlzcGF0Y2hlcic7XG5pbXBvcnQge1xuICBGb2N1c0VzY2FwZU5vdGlmaWVyLFxuICBGb2N1c0VzY2FwZU5vdGlmaWVyRGlyZWN0aW9uLFxuICBGb2N1c0VzY2FwZU5vdGlmaWVyRmFjdG9yeVxufSBmcm9tICcuL2ZvY3VzLWVzY2FwZS1ub3RpZmllcic7XG5pbXBvcnQge2Nsb3Nlc3R9IGZyb20gJy4vcG9seWZpbGwnO1xuaW1wb3J0IHtFZGl0UmVmfSBmcm9tICcuL2VkaXQtcmVmJztcblxuLyoqXG4gKiBEZXNjcmliZXMgdGhlIG51bWJlciBvZiBjb2x1bW5zIGJlZm9yZSBhbmQgYWZ0ZXIgdGhlIG9yaWdpbmF0aW5nIGNlbGwgdGhhdCB0aGVcbiAqIGVkaXQgcG9wdXAgc2hvdWxkIHNwYW4uIEluIGxlZnQgdG8gcmlnaHQgbG9jYWxlcywgYmVmb3JlIG1lYW5zIGxlZnQgYW5kIGFmdGVyIG1lYW5zXG4gKiByaWdodC4gSW4gcmlnaHQgdG8gbGVmdCBsb2NhbGVzIGJlZm9yZSBtZWFucyByaWdodCBhbmQgYWZ0ZXIgbWVhbnMgbGVmdC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBDZGtQb3BvdmVyRWRpdENvbHNwYW4ge1xuICBiZWZvcmU/OiBudW1iZXI7XG4gIGFmdGVyPzogbnVtYmVyO1xufVxuXG4vKiogVXNlZCBmb3IgcmF0ZS1saW1pdGluZyBtb3VzZW1vdmUgZXZlbnRzLiAqL1xuY29uc3QgTU9VU0VfTU9WRV9USFJPVFRMRV9USU1FX01TID0gMTA7XG5cbi8qKlxuICogQSBkaXJlY3RpdmUgdGhhdCBtdXN0IGJlIGF0dGFjaGVkIHRvIGVuYWJsZSBlZGl0YWJpbGl0eSBvbiBhIHRhYmxlLlxuICogSXQgaXMgcmVzcG9uc2libGUgZm9yIHNldHRpbmcgdXAgZGVsZWdhdGVkIGV2ZW50IGhhbmRsZXJzIGFuZCBwcm92aWRpbmcgdGhlXG4gKiBFZGl0RXZlbnREaXNwYXRjaGVyIHNlcnZpY2UgZm9yIHVzZSBieSB0aGUgb3RoZXIgZWRpdCBkaXJlY3RpdmVzLlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICd0YWJsZVtlZGl0YWJsZV0sIGNkay10YWJsZVtlZGl0YWJsZV0sIG1hdC10YWJsZVtlZGl0YWJsZV0nLFxuICBwcm92aWRlcnM6IFtFZGl0RXZlbnREaXNwYXRjaGVyLCBFZGl0U2VydmljZXNdLFxufSlcbmV4cG9ydCBjbGFzcyBDZGtFZGl0YWJsZSBpbXBsZW1lbnRzIEFmdGVyVmlld0luaXQsIE9uRGVzdHJveSB7XG4gIHByb3RlY3RlZCByZWFkb25seSBkZXN0cm95ZWQgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJvdGVjdGVkIHJlYWRvbmx5IGVsZW1lbnRSZWY6IEVsZW1lbnRSZWYsXG4gICAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgZWRpdEV2ZW50RGlzcGF0Y2hlcjogRWRpdEV2ZW50RGlzcGF0Y2hlcjxFZGl0UmVmPHVua25vd24+PixcbiAgICAgIHByb3RlY3RlZCByZWFkb25seSBmb2N1c0Rpc3BhdGNoZXI6IEZvY3VzRGlzcGF0Y2hlciwgcHJvdGVjdGVkIHJlYWRvbmx5IG5nWm9uZTogTmdab25lKSB7fVxuXG4gIG5nQWZ0ZXJWaWV3SW5pdCgpOiB2b2lkIHtcbiAgICB0aGlzLl9saXN0ZW5Gb3JUYWJsZUV2ZW50cygpO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgdGhpcy5kZXN0cm95ZWQubmV4dCgpO1xuICAgIHRoaXMuZGVzdHJveWVkLmNvbXBsZXRlKCk7XG4gIH1cblxuICBwcml2YXRlIF9saXN0ZW5Gb3JUYWJsZUV2ZW50cygpOiB2b2lkIHtcbiAgICBjb25zdCBlbGVtZW50ID0gdGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQ7XG4gICAgY29uc3QgdG9DbG9zZXN0ID0gKHNlbGVjdG9yOiBzdHJpbmcpID0+XG4gICAgICAgIG1hcCgoZXZlbnQ6IFVJRXZlbnQpID0+IGNsb3Nlc3QoZXZlbnQudGFyZ2V0LCBzZWxlY3RvcikpO1xuXG4gICAgdGhpcy5uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgLy8gVHJhY2sgbW91c2UgbW92ZW1lbnQgb3ZlciB0aGUgdGFibGUgdG8gaGlkZS9zaG93IGhvdmVyIGNvbnRlbnQuXG4gICAgICBmcm9tRXZlbnQ8TW91c2VFdmVudD4oZWxlbWVudCwgJ21vdXNlb3ZlcicpLnBpcGUoXG4gICAgICAgICAgdG9DbG9zZXN0KFJPV19TRUxFQ1RPUiksXG4gICAgICAgICAgdGFrZVVudGlsKHRoaXMuZGVzdHJveWVkKSxcbiAgICAgICAgICApLnN1YnNjcmliZSh0aGlzLmVkaXRFdmVudERpc3BhdGNoZXIuaG92ZXJpbmcpO1xuICAgICAgZnJvbUV2ZW50PE1vdXNlRXZlbnQ+KGVsZW1lbnQsICdtb3VzZWxlYXZlJykucGlwZShcbiAgICAgICAgICBtYXBUbyhudWxsKSxcbiAgICAgICAgICB0YWtlVW50aWwodGhpcy5kZXN0cm95ZWQpLFxuICAgICAgICAgICkuc3Vic2NyaWJlKHRoaXMuZWRpdEV2ZW50RGlzcGF0Y2hlci5ob3ZlcmluZyk7XG4gICAgICBmcm9tRXZlbnQ8TW91c2VFdmVudD4oZWxlbWVudCwgJ21vdXNlbW92ZScpLnBpcGUoXG4gICAgICAgICAgdGhyb3R0bGVUaW1lKE1PVVNFX01PVkVfVEhST1RUTEVfVElNRV9NUyksXG4gICAgICAgICAgdG9DbG9zZXN0KFJPV19TRUxFQ1RPUiksXG4gICAgICAgICAgdGFrZVVudGlsKHRoaXMuZGVzdHJveWVkKSxcbiAgICAgICAgICApLnN1YnNjcmliZSh0aGlzLmVkaXRFdmVudERpc3BhdGNoZXIubW91c2VNb3ZlKTtcblxuICAgICAgLy8gVHJhY2sgZm9jdXMgd2l0aGluIHRoZSB0YWJsZSB0byBoaWRlL3Nob3cvbWFrZSBmb2N1c2FibGUgaG92ZXIgY29udGVudC5cbiAgICAgIGZyb21FdmVudFBhdHRlcm48Rm9jdXNFdmVudD4oXG4gICAgICAgICAgaGFuZGxlciA9PiBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2ZvY3VzJywgaGFuZGxlciwgdHJ1ZSksXG4gICAgICAgICAgaGFuZGxlciA9PiBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2ZvY3VzJywgaGFuZGxlciwgdHJ1ZSlcbiAgICAgICAgICApLnBpcGUoXG4gICAgICAgICAgICAgIHRvQ2xvc2VzdChST1dfU0VMRUNUT1IpLFxuICAgICAgICAgICAgICBzaGFyZSgpLFxuICAgICAgICAgICAgICB0YWtlVW50aWwodGhpcy5kZXN0cm95ZWQpLFxuICAgICAgICAgICAgICApLnN1YnNjcmliZSh0aGlzLmVkaXRFdmVudERpc3BhdGNoZXIuZm9jdXNlZCk7XG5cbiAgICAgIG1lcmdlKFxuICAgICAgICBmcm9tRXZlbnRQYXR0ZXJuPEZvY3VzRXZlbnQ+KFxuICAgICAgICAgIGhhbmRsZXIgPT4gZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdibHVyJywgaGFuZGxlciwgdHJ1ZSksXG4gICAgICAgICAgaGFuZGxlciA9PiBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2JsdXInLCBoYW5kbGVyLCB0cnVlKVxuICAgICAgICApLFxuICAgICAgICBmcm9tRXZlbnQ8S2V5Ym9hcmRFdmVudD4oZWxlbWVudCwgJ2tleWRvd24nKS5waXBlKGZpbHRlcihldmVudCA9PiBldmVudC5rZXkgPT09ICdFc2NhcGUnKSlcbiAgICAgICkucGlwZShcbiAgICAgICAgbWFwVG8obnVsbCksXG4gICAgICAgIHNoYXJlKCksXG4gICAgICAgIHRha2VVbnRpbCh0aGlzLmRlc3Ryb3llZCksXG4gICAgICApLnN1YnNjcmliZSh0aGlzLmVkaXRFdmVudERpc3BhdGNoZXIuZm9jdXNlZCk7XG5cbiAgICAgIC8vIEtlZXAgdHJhY2sgb2Ygcm93cyB3aXRoaW4gdGhlIHRhYmxlLiBUaGlzIGlzIHVzZWQgdG8ga25vdyB3aGljaCByb3dzIHdpdGggaG92ZXIgY29udGVudFxuICAgICAgLy8gYXJlIGZpcnN0IG9yIGxhc3QgaW4gdGhlIHRhYmxlLiBUaGV5IGFyZSBrZXB0IGZvY3VzYWJsZSBpbiBjYXNlIGZvY3VzIGVudGVycyBmcm9tIGFib3ZlXG4gICAgICAvLyBvciBiZWxvdyB0aGUgdGFibGUuXG4gICAgICB0aGlzLm5nWm9uZS5vblN0YWJsZS5waXBlKFxuICAgICAgICAgIC8vIE9wdGltaXphdGlvbjogaWdub3JlIGRvbSBjaGFuZ2VzIHdoaWxlIGZvY3VzIGlzIHdpdGhpbiB0aGUgdGFibGUgYXMgd2UgYWxyZWFkeVxuICAgICAgICAgIC8vIGVuc3VyZSB0aGF0IHJvd3MgYWJvdmUgYW5kIGJlbG93IHRoZSBmb2N1c2VkL2FjdGl2ZSByb3cgYXJlIHRhYmJhYmxlLlxuICAgICAgICAgIHdpdGhMYXRlc3RGcm9tKHRoaXMuZWRpdEV2ZW50RGlzcGF0Y2hlci5lZGl0aW5nT3JGb2N1c2VkKSxcbiAgICAgICAgICBmaWx0ZXIoKFtfLCBhY3RpdmVSb3ddKSA9PiBhY3RpdmVSb3cgPT0gbnVsbCksXG4gICAgICAgICAgbWFwKCgpID0+IGVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChST1dfU0VMRUNUT1IpKSxcbiAgICAgICAgICBzaGFyZSgpLFxuICAgICAgICAgIHRha2VVbnRpbCh0aGlzLmRlc3Ryb3llZCksXG4gICAgICAgICAgKS5zdWJzY3JpYmUodGhpcy5lZGl0RXZlbnREaXNwYXRjaGVyLmFsbFJvd3MpO1xuXG4gICAgICBmcm9tRXZlbnQ8S2V5Ym9hcmRFdmVudD4oZWxlbWVudCwgJ2tleWRvd24nKS5waXBlKFxuICAgICAgICAgIGZpbHRlcihldmVudCA9PiBldmVudC5rZXkgPT09ICdFbnRlcicpLFxuICAgICAgICAgIHRvQ2xvc2VzdChDRUxMX1NFTEVDVE9SKSxcbiAgICAgICAgICB0YWtlVW50aWwodGhpcy5kZXN0cm95ZWQpLFxuICAgICAgICAgICkuc3Vic2NyaWJlKHRoaXMuZWRpdEV2ZW50RGlzcGF0Y2hlci5lZGl0aW5nKTtcblxuICAgICAgLy8gS2V5ZG93biBtdXN0IGJlIHVzZWQgaGVyZSBvciBlbHNlIGtleSBhdXRvcmVwZWF0IGRvZXMgbm90IHdvcmsgcHJvcGVybHkgb24gc29tZSBwbGF0Zm9ybXMuXG4gICAgICBmcm9tRXZlbnQ8S2V5Ym9hcmRFdmVudD4oZWxlbWVudCwgJ2tleWRvd24nKVxuICAgICAgICAgIC5waXBlKHRha2VVbnRpbCh0aGlzLmRlc3Ryb3llZCkpXG4gICAgICAgICAgLnN1YnNjcmliZSh0aGlzLmZvY3VzRGlzcGF0Y2hlci5rZXlPYnNlcnZlcik7XG4gICAgfSk7XG4gIH1cbn1cblxuY29uc3QgUE9QT1ZFUl9FRElUX0hPU1RfQklORElOR1MgPSB7XG4gICdbYXR0ci50YWJpbmRleF0nOiAnZGlzYWJsZWQgPyBudWxsIDogMCcsXG4gICdjbGFzcyc6ICdjZGstcG9wb3Zlci1lZGl0LWNlbGwnLFxuICAnW2F0dHIuYXJpYS1oYXNwb3B1cF0nOiAnIWRpc2FibGVkJyxcbn07XG5cbmNvbnN0IFBPUE9WRVJfRURJVF9JTlBVVFMgPSBbXG4gICd0ZW1wbGF0ZTogY2RrUG9wb3ZlckVkaXQnLFxuICAnY29udGV4dDogY2RrUG9wb3ZlckVkaXRDb250ZXh0JyxcbiAgJ2NvbHNwYW46IGNka1BvcG92ZXJFZGl0Q29sc3BhbicsXG4gICdkaXNhYmxlZDogY2RrUG9wb3ZlckVkaXREaXNhYmxlZCcsXG5dO1xuXG4vKipcbiAqIEF0dGFjaGVzIGFuIG5nLXRlbXBsYXRlIHRvIGEgY2VsbCBhbmQgc2hvd3MgaXQgd2hlbiBpbnN0cnVjdGVkIHRvIGJ5IHRoZVxuICogRWRpdEV2ZW50RGlzcGF0Y2hlciBzZXJ2aWNlLlxuICogTWFrZXMgdGhlIGNlbGwgZm9jdXNhYmxlLlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbY2RrUG9wb3ZlckVkaXRdOm5vdChbY2RrUG9wb3ZlckVkaXRUYWJPdXRdKScsXG4gIGhvc3Q6IFBPUE9WRVJfRURJVF9IT1NUX0JJTkRJTkdTLFxuICBpbnB1dHM6IFBPUE9WRVJfRURJVF9JTlBVVFMsXG59KVxuZXhwb3J0IGNsYXNzIENka1BvcG92ZXJFZGl0PEM+IGltcGxlbWVudHMgQWZ0ZXJWaWV3SW5pdCwgT25EZXN0cm95IHtcbiAgLyoqIFRoZSBlZGl0IGxlbnMgdGVtcGxhdGUgc2hvd24gb3ZlciB0aGUgY2VsbCBvbiBlZGl0LiAqL1xuICB0ZW1wbGF0ZTogVGVtcGxhdGVSZWY8YW55PnxudWxsID0gbnVsbDtcblxuICAvKipcbiAgICogSW1wbGljaXQgY29udGV4dCB0byBwYXNzIGFsb25nIHRvIHRoZSB0ZW1wbGF0ZS4gQ2FuIGJlIG9taXR0ZWQgaWYgdGhlIHRlbXBsYXRlXG4gICAqIGlzIGRlZmluZWQgd2l0aGluIHRoZSBjZWxsLlxuICAgKi9cbiAgY29udGV4dD86IEM7XG5cbiAgLyoqXG4gICAqIFNwZWNpZmllcyB0aGF0IHRoZSBwb3B1cCBzaG91bGQgY292ZXIgYWRkaXRpb25hbCB0YWJsZSBjZWxscyBiZWZvcmUgYW5kL29yIGFmdGVyXG4gICAqIHRoaXMgb25lLlxuICAgKi9cbiAgZ2V0IGNvbHNwYW4oKTogQ2RrUG9wb3ZlckVkaXRDb2xzcGFuIHtcbiAgICByZXR1cm4gdGhpcy5fY29sc3BhbjtcbiAgfVxuICBzZXQgY29sc3Bhbih2YWx1ZTogQ2RrUG9wb3ZlckVkaXRDb2xzcGFuKSB7XG4gICAgdGhpcy5fY29sc3BhbiA9IHZhbHVlO1xuXG4gICAgLy8gUmVjb21wdXRlIHBvc2l0aW9uaW5nIHdoZW4gdGhlIGNvbHNwYW4gY2hhbmdlcy5cbiAgICBpZiAodGhpcy5vdmVybGF5UmVmKSB7XG4gICAgICB0aGlzLm92ZXJsYXlSZWYudXBkYXRlUG9zaXRpb25TdHJhdGVneSh0aGlzLl9nZXRQb3NpdGlvblN0cmF0ZWd5KCkpO1xuXG4gICAgICBpZiAodGhpcy5vdmVybGF5UmVmLmhhc0F0dGFjaGVkKCkpIHtcbiAgICAgICAgdGhpcy5fdXBkYXRlT3ZlcmxheVNpemUoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcHJpdmF0ZSBfY29sc3BhbjogQ2RrUG9wb3ZlckVkaXRDb2xzcGFuID0ge307XG5cbiAgLyoqIFdoZXRoZXIgcG9wb3ZlciBlZGl0IGlzIGRpc2FibGVkIGZvciB0aGlzIGNlbGwuICovXG4gIGdldCBkaXNhYmxlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fZGlzYWJsZWQ7XG4gIH1cbiAgc2V0IGRpc2FibGVkKHZhbHVlOiBib29sZWFuKSB7XG4gICAgdGhpcy5fZGlzYWJsZWQgPSB2YWx1ZTtcblxuICAgIGlmICh2YWx1ZSkge1xuICAgICAgdGhpcy5zZXJ2aWNlcy5lZGl0RXZlbnREaXNwYXRjaGVyLmRvbmVFZGl0aW5nQ2VsbCh0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCEpO1xuICAgICAgdGhpcy5zZXJ2aWNlcy5lZGl0RXZlbnREaXNwYXRjaGVyLmRpc2FibGVkQ2VsbHMuc2V0KHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50ISwgdHJ1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc2VydmljZXMuZWRpdEV2ZW50RGlzcGF0Y2hlci5kaXNhYmxlZENlbGxzLmRlbGV0ZSh0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCEpO1xuICAgIH1cbiAgfVxuICBwcml2YXRlIF9kaXNhYmxlZCA9IGZhbHNlO1xuXG4gIHByb3RlY3RlZCBmb2N1c1RyYXA/OiBGb2N1c1RyYXA7XG4gIHByb3RlY3RlZCBvdmVybGF5UmVmPzogT3ZlcmxheVJlZjtcbiAgcHJvdGVjdGVkIHJlYWRvbmx5IGRlc3Ryb3llZCA9IG5ldyBTdWJqZWN0PHZvaWQ+KCk7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgc2VydmljZXM6IEVkaXRTZXJ2aWNlcywgcHJvdGVjdGVkIHJlYWRvbmx5IGVsZW1lbnRSZWY6IEVsZW1lbnRSZWYsXG4gICAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgdmlld0NvbnRhaW5lclJlZjogVmlld0NvbnRhaW5lclJlZikge31cblxuICBuZ0FmdGVyVmlld0luaXQoKTogdm9pZCB7XG4gICAgdGhpcy5fc3RhcnRMaXN0ZW5pbmdUb0VkaXRFdmVudHMoKTtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCk6IHZvaWQge1xuICAgIHRoaXMuZGVzdHJveWVkLm5leHQoKTtcbiAgICB0aGlzLmRlc3Ryb3llZC5jb21wbGV0ZSgpO1xuXG4gICAgaWYgKHRoaXMuZm9jdXNUcmFwKSB7XG4gICAgICB0aGlzLmZvY3VzVHJhcC5kZXN0cm95KCk7XG4gICAgICB0aGlzLmZvY3VzVHJhcCA9IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5vdmVybGF5UmVmKSB7XG4gICAgICB0aGlzLm92ZXJsYXlSZWYuZGlzcG9zZSgpO1xuICAgIH1cbiAgfVxuXG4gIHByb3RlY3RlZCBpbml0Rm9jdXNUcmFwKCk6IHZvaWQge1xuICAgIHRoaXMuZm9jdXNUcmFwID0gdGhpcy5zZXJ2aWNlcy5mb2N1c1RyYXBGYWN0b3J5LmNyZWF0ZSh0aGlzLm92ZXJsYXlSZWYhLm92ZXJsYXlFbGVtZW50KTtcbiAgfVxuXG4gIHByb3RlY3RlZCBjbG9zZUVkaXRPdmVybGF5KCk6IHZvaWQge1xuICAgIHRoaXMuc2VydmljZXMuZWRpdEV2ZW50RGlzcGF0Y2hlci5kb25lRWRpdGluZ0NlbGwodGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQhKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBwYW5lbENsYXNzKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIEVESVRfUEFORV9DTEFTUztcbiAgfVxuXG4gIHByaXZhdGUgX3N0YXJ0TGlzdGVuaW5nVG9FZGl0RXZlbnRzKCk6IHZvaWQge1xuICAgIHRoaXMuc2VydmljZXMuZWRpdEV2ZW50RGlzcGF0Y2hlci5lZGl0aW5nQ2VsbCh0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCEpXG4gICAgICAgIC5waXBlKHRha2VVbnRpbCh0aGlzLmRlc3Ryb3llZCkpXG4gICAgICAgIC5zdWJzY3JpYmUoKG9wZW4pID0+IHtcbiAgICAgICAgICBpZiAob3BlbiAmJiB0aGlzLnRlbXBsYXRlKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMub3ZlcmxheVJlZikge1xuICAgICAgICAgICAgICB0aGlzLl9jcmVhdGVFZGl0T3ZlcmxheSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLl9zaG93RWRpdE92ZXJsYXkoKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMub3ZlcmxheVJlZikge1xuICAgICAgICAgICAgdGhpcy5fbWF5YmVSZXR1cm5Gb2N1c1RvQ2VsbCgpO1xuXG4gICAgICAgICAgICB0aGlzLm92ZXJsYXlSZWYuZGV0YWNoKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX2NyZWF0ZUVkaXRPdmVybGF5KCk6IHZvaWQge1xuICAgIHRoaXMub3ZlcmxheVJlZiA9IHRoaXMuc2VydmljZXMub3ZlcmxheS5jcmVhdGUoe1xuICAgICAgZGlzcG9zZU9uTmF2aWdhdGlvbjogdHJ1ZSxcbiAgICAgIHBhbmVsQ2xhc3M6IHRoaXMucGFuZWxDbGFzcygpLFxuICAgICAgcG9zaXRpb25TdHJhdGVneTogdGhpcy5fZ2V0UG9zaXRpb25TdHJhdGVneSgpLFxuICAgICAgc2Nyb2xsU3RyYXRlZ3k6IHRoaXMuc2VydmljZXMub3ZlcmxheS5zY3JvbGxTdHJhdGVnaWVzLnJlcG9zaXRpb24oKSxcbiAgICAgIGRpcmVjdGlvbjogdGhpcy5zZXJ2aWNlcy5kaXJlY3Rpb25hbGl0eSxcbiAgICB9KTtcblxuICAgIHRoaXMuaW5pdEZvY3VzVHJhcCgpO1xuICAgIHRoaXMub3ZlcmxheVJlZi5vdmVybGF5RWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2FyaWEtcm9sZScsICdkaWFsb2cnKTtcblxuICAgIHRoaXMub3ZlcmxheVJlZi5kZXRhY2htZW50cygpLnN1YnNjcmliZSgoKSA9PiB0aGlzLmNsb3NlRWRpdE92ZXJsYXkoKSk7XG4gIH1cblxuICBwcml2YXRlIF9zaG93RWRpdE92ZXJsYXkoKTogdm9pZCB7XG4gICAgdGhpcy5vdmVybGF5UmVmIS5hdHRhY2gobmV3IFRlbXBsYXRlUG9ydGFsKFxuICAgICAgICB0aGlzLnRlbXBsYXRlISxcbiAgICAgICAgdGhpcy52aWV3Q29udGFpbmVyUmVmLFxuICAgICAgICB7JGltcGxpY2l0OiB0aGlzLmNvbnRleHR9KSk7XG5cbiAgICAvLyBXZSBoYXZlIHRvIGRlZmVyIHRyYXBwaW5nIGZvY3VzLCBiZWNhdXNlIGRvaW5nIHNvIHRvbyBlYXJseSBjYW4gY2F1c2UgdGhlIGZvcm0gaW5zaWRlXG4gICAgLy8gdGhlIG92ZXJsYXkgdG8gYmUgc3VibWl0dGVkIGltbWVkaWF0ZWx5IGlmIGl0IHdhcyBvcGVuZWQgb24gYW4gRW50ZXIga2V5ZG93biBldmVudC5cbiAgICB0aGlzLnNlcnZpY2VzLm5nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgdGhpcy5mb2N1c1RyYXAhLmZvY3VzSW5pdGlhbEVsZW1lbnQoKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgLy8gVXBkYXRlIHRoZSBzaXplIG9mIHRoZSBwb3B1cCBpbml0aWFsbHkgYW5kIG9uIHN1YnNlcXVlbnQgY2hhbmdlcyB0b1xuICAgIC8vIHNjcm9sbCBwb3NpdGlvbiBhbmQgdmlld3BvcnQgc2l6ZS5cbiAgICBtZXJnZSh0aGlzLnNlcnZpY2VzLnNjcm9sbERpc3BhdGNoZXIuc2Nyb2xsZWQoKSwgdGhpcy5zZXJ2aWNlcy52aWV3cG9ydFJ1bGVyLmNoYW5nZSgpKVxuICAgICAgICAucGlwZShcbiAgICAgICAgICBzdGFydFdpdGgobnVsbCksXG4gICAgICAgICAgdGFrZVVudGlsKG1lcmdlKHRoaXMub3ZlcmxheVJlZiEuZGV0YWNobWVudHMoKSwgdGhpcy5kZXN0cm95ZWQpKVxuICAgICAgICApXG4gICAgICAgIC5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgICAgIHRoaXMuX3VwZGF0ZU92ZXJsYXlTaXplKCk7XG4gICAgICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0T3ZlcmxheUNlbGxzKCk6IEhUTUxFbGVtZW50W10ge1xuICAgIGNvbnN0IGNlbGwgPSBjbG9zZXN0KHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50ISwgQ0VMTF9TRUxFQ1RPUikgYXMgSFRNTEVsZW1lbnQ7XG5cbiAgICBpZiAoIXRoaXMuX2NvbHNwYW4uYmVmb3JlICYmICF0aGlzLl9jb2xzcGFuLmFmdGVyKSB7XG4gICAgICByZXR1cm4gW2NlbGxdO1xuICAgIH1cblxuICAgIGNvbnN0IHJvdyA9IGNsb3Nlc3QodGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQhLCBST1dfU0VMRUNUT1IpITtcbiAgICBjb25zdCByb3dDZWxscyA9IEFycmF5LmZyb20ocm93LnF1ZXJ5U2VsZWN0b3JBbGwoQ0VMTF9TRUxFQ1RPUikpIGFzIEhUTUxFbGVtZW50W107XG4gICAgY29uc3Qgb3duSW5kZXggPSByb3dDZWxscy5pbmRleE9mKGNlbGwpO1xuXG4gICAgcmV0dXJuIHJvd0NlbGxzLnNsaWNlKFxuICAgICAgICBvd25JbmRleCAtICh0aGlzLl9jb2xzcGFuLmJlZm9yZSB8fCAwKSwgb3duSW5kZXggKyAodGhpcy5fY29sc3Bhbi5hZnRlciB8fCAwKSArIDEpO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0UG9zaXRpb25TdHJhdGVneSgpOiBQb3NpdGlvblN0cmF0ZWd5IHtcbiAgICByZXR1cm4gdGhpcy5zZXJ2aWNlcy5wb3NpdGlvbkZhY3RvcnkucG9zaXRpb25TdHJhdGVneUZvckNlbGxzKHRoaXMuX2dldE92ZXJsYXlDZWxscygpKTtcbiAgfVxuXG4gIHByaXZhdGUgX3VwZGF0ZU92ZXJsYXlTaXplKCk6IHZvaWQge1xuICAgIHRoaXMub3ZlcmxheVJlZiEudXBkYXRlU2l6ZShcbiAgICAgICAgdGhpcy5zZXJ2aWNlcy5wb3NpdGlvbkZhY3Rvcnkuc2l6ZUNvbmZpZ0ZvckNlbGxzKHRoaXMuX2dldE92ZXJsYXlDZWxscygpKSk7XG4gIH1cblxuICBwcml2YXRlIF9tYXliZVJldHVybkZvY3VzVG9DZWxsKCk6IHZvaWQge1xuICAgIGlmIChjbG9zZXN0KGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQsIEVESVRfUEFORV9TRUxFQ1RPUikgPT09XG4gICAgICAgIHRoaXMub3ZlcmxheVJlZiEub3ZlcmxheUVsZW1lbnQpIHtcbiAgICAgIHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50IS5mb2N1cygpO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEF0dGFjaGVzIGFuIG5nLXRlbXBsYXRlIHRvIGEgY2VsbCBhbmQgc2hvd3MgaXQgd2hlbiBpbnN0cnVjdGVkIHRvIGJ5IHRoZVxuICogRWRpdEV2ZW50RGlzcGF0Y2hlciBzZXJ2aWNlLlxuICogTWFrZXMgdGhlIGNlbGwgZm9jdXNhYmxlLlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbY2RrUG9wb3ZlckVkaXRdW2Nka1BvcG92ZXJFZGl0VGFiT3V0XScsXG4gIGhvc3Q6IFBPUE9WRVJfRURJVF9IT1NUX0JJTkRJTkdTLFxuICBpbnB1dHM6IFBPUE9WRVJfRURJVF9JTlBVVFMsXG59KVxuZXhwb3J0IGNsYXNzIENka1BvcG92ZXJFZGl0VGFiT3V0PEM+IGV4dGVuZHMgQ2RrUG9wb3ZlckVkaXQ8Qz4ge1xuICBwcm90ZWN0ZWQgb3ZlcnJpZGUgZm9jdXNUcmFwPzogRm9jdXNFc2NhcGVOb3RpZmllcjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIGVsZW1lbnRSZWY6IEVsZW1lbnRSZWYsIHZpZXdDb250YWluZXJSZWY6IFZpZXdDb250YWluZXJSZWYsIHNlcnZpY2VzOiBFZGl0U2VydmljZXMsXG4gICAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgZm9jdXNFc2NhcGVOb3RpZmllckZhY3Rvcnk6IEZvY3VzRXNjYXBlTm90aWZpZXJGYWN0b3J5KSB7XG4gICAgc3VwZXIoc2VydmljZXMsIGVsZW1lbnRSZWYsIHZpZXdDb250YWluZXJSZWYpO1xuICB9XG5cbiAgcHJvdGVjdGVkIG92ZXJyaWRlIGluaXRGb2N1c1RyYXAoKTogdm9pZCB7XG4gICAgdGhpcy5mb2N1c1RyYXAgPSB0aGlzLmZvY3VzRXNjYXBlTm90aWZpZXJGYWN0b3J5LmNyZWF0ZSh0aGlzLm92ZXJsYXlSZWYhLm92ZXJsYXlFbGVtZW50KTtcblxuICAgIHRoaXMuZm9jdXNUcmFwLmVzY2FwZXMoKS5waXBlKHRha2VVbnRpbCh0aGlzLmRlc3Ryb3llZCkpLnN1YnNjcmliZShkaXJlY3Rpb24gPT4ge1xuICAgICAgaWYgKHRoaXMuc2VydmljZXMuZWRpdEV2ZW50RGlzcGF0Y2hlci5lZGl0UmVmKSB7XG4gICAgICAgIHRoaXMuc2VydmljZXMuZWRpdEV2ZW50RGlzcGF0Y2hlci5lZGl0UmVmLmJsdXIoKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5zZXJ2aWNlcy5mb2N1c0Rpc3BhdGNoZXIubW92ZUZvY3VzSG9yaXpvbnRhbGx5KFxuICAgICAgICAgIGNsb3Nlc3QodGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQhLCBDRUxMX1NFTEVDVE9SKSBhcyBIVE1MRWxlbWVudCxcbiAgICAgICAgICBkaXJlY3Rpb24gPT09IEZvY3VzRXNjYXBlTm90aWZpZXJEaXJlY3Rpb24uU1RBUlQgPyAtMSA6IDEpO1xuXG4gICAgICB0aGlzLmNsb3NlRWRpdE92ZXJsYXkoKTtcbiAgICB9KTtcbiAgfVxufVxuXG4vKipcbiAqIEEgc3RydWN0dXJhbCBkaXJlY3RpdmUgdGhhdCBzaG93cyBpdHMgY29udGVudHMgd2hlbiB0aGUgdGFibGUgcm93IGNvbnRhaW5pbmdcbiAqIGl0IGlzIGhvdmVyZWQgb3Igd2hlbiBhbiBlbGVtZW50IGluIHRoZSByb3cgaGFzIGZvY3VzLlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbY2RrUm93SG92ZXJDb250ZW50XScsXG59KVxuZXhwb3J0IGNsYXNzIENka1Jvd0hvdmVyQ29udGVudCBpbXBsZW1lbnRzIEFmdGVyVmlld0luaXQsIE9uRGVzdHJveSB7XG4gIHByb3RlY3RlZCByZWFkb25seSBkZXN0cm95ZWQgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xuICBwcm90ZWN0ZWQgdmlld1JlZjogRW1iZWRkZWRWaWV3UmVmPGFueT58bnVsbCA9IG51bGw7XG5cbiAgcHJpdmF0ZSBfcm93PzogRWxlbWVudDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByb3RlY3RlZCByZWFkb25seSBzZXJ2aWNlczogRWRpdFNlcnZpY2VzLCBwcm90ZWN0ZWQgcmVhZG9ubHkgZWxlbWVudFJlZjogRWxlbWVudFJlZixcbiAgICAgIHByb3RlY3RlZCByZWFkb25seSB0ZW1wbGF0ZVJlZjogVGVtcGxhdGVSZWY8YW55PixcbiAgICAgIHByb3RlY3RlZCByZWFkb25seSB2aWV3Q29udGFpbmVyUmVmOiBWaWV3Q29udGFpbmVyUmVmKSB7fVxuXG4gIG5nQWZ0ZXJWaWV3SW5pdCgpOiB2b2lkIHtcbiAgICB0aGlzLl9yb3cgPSBjbG9zZXN0KHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50ISwgUk9XX1NFTEVDVE9SKSE7XG5cbiAgICB0aGlzLnNlcnZpY2VzLmVkaXRFdmVudERpc3BhdGNoZXIucmVnaXN0ZXJSb3dXaXRoSG92ZXJDb250ZW50KHRoaXMuX3Jvdyk7XG4gICAgdGhpcy5fbGlzdGVuRm9ySG92ZXJBbmRGb2N1c0V2ZW50cygpO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgdGhpcy5kZXN0cm95ZWQubmV4dCgpO1xuICAgIHRoaXMuZGVzdHJveWVkLmNvbXBsZXRlKCk7XG5cbiAgICBpZiAodGhpcy52aWV3UmVmKSB7XG4gICAgICB0aGlzLnZpZXdSZWYuZGVzdHJveSgpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9yb3cpIHtcbiAgICAgIHRoaXMuc2VydmljZXMuZWRpdEV2ZW50RGlzcGF0Y2hlci5kZXJlZ2lzdGVyUm93V2l0aEhvdmVyQ29udGVudCh0aGlzLl9yb3cpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgaW1tZWRpYXRlbHkgYWZ0ZXIgdGhlIGhvdmVyIGNvbnRlbnQgaXMgY3JlYXRlZCBhbmQgYWRkZWQgdG8gdGhlIGRvbS5cbiAgICogSW4gdGhlIENESyB2ZXJzaW9uLCB0aGlzIGlzIGEgbm9vcCBidXQgc3ViY2xhc3NlcyBzdWNoIGFzIE1hdFJvd0hvdmVyQ29udGVudCB1c2UgdGhpc1xuICAgKiB0byBwcmVwYXJlL3N0eWxlIHRoZSBpbnNlcnRlZCBlbGVtZW50LlxuICAgKi9cbiAgcHJvdGVjdGVkIGluaXRFbGVtZW50KF86IEhUTUxFbGVtZW50KTogdm9pZCB7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gdGhlIGhvdmVyIGNvbnRlbnQgbmVlZHMgdG8gYmUgZm9jdXNhYmxlIHRvIHByZXNlcnZlIGEgcmVhc29uYWJsZSB0YWIgb3JkZXJpbmdcbiAgICogYnV0IHNob3VsZCBub3QgeWV0IGJlIHNob3duLlxuICAgKi9cbiAgcHJvdGVjdGVkIG1ha2VFbGVtZW50SGlkZGVuQnV0Rm9jdXNhYmxlKGVsZW1lbnQ6IEhUTUxFbGVtZW50KTogdm9pZCB7XG4gICAgZWxlbWVudC5zdHlsZS5vcGFjaXR5ID0gJzAnO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIHRoZSBob3ZlciBjb250ZW50IG5lZWRzIHRvIGJlIGZvY3VzYWJsZSB0byBwcmVzZXJ2ZSBhIHJlYXNvbmFibGUgdGFiIG9yZGVyaW5nXG4gICAqIGJ1dCBzaG91bGQgbm90IHlldCBiZSBzaG93bi5cbiAgICovXG4gIHByb3RlY3RlZCBtYWtlRWxlbWVudFZpc2libGUoZWxlbWVudDogSFRNTEVsZW1lbnQpOiB2b2lkIHtcbiAgICBlbGVtZW50LnN0eWxlLm9wYWNpdHkgPSAnJztcbiAgfVxuXG4gIHByaXZhdGUgX2xpc3RlbkZvckhvdmVyQW5kRm9jdXNFdmVudHMoKTogdm9pZCB7XG4gICAgdGhpcy5zZXJ2aWNlcy5lZGl0RXZlbnREaXNwYXRjaGVyLmhvdmVyT3JGb2N1c09uUm93KHRoaXMuX3JvdyEpXG4gICAgICAgIC5waXBlKHRha2VVbnRpbCh0aGlzLmRlc3Ryb3llZCkpXG4gICAgICAgIC5zdWJzY3JpYmUoZXZlbnRTdGF0ZSA9PiB7XG4gICAgICAgICAgLy8gV2hlbiBpbiBGT0NVU0FCTEUgc3RhdGUsIGFkZCB0aGUgaG92ZXIgY29udGVudCB0byB0aGUgZG9tIGJ1dCBtYWtlIGl0IHRyYW5zcGFyZW50IHNvXG4gICAgICAgICAgLy8gdGhhdCBpdCBpcyBpbiB0aGUgdGFiIG9yZGVyIHJlbGF0aXZlIHRvIHRoZSBjdXJyZW50bHkgZm9jdXNlZCByb3cuXG5cbiAgICAgICAgICBpZiAoZXZlbnRTdGF0ZSA9PT0gSG92ZXJDb250ZW50U3RhdGUuT04gfHwgZXZlbnRTdGF0ZSA9PT0gSG92ZXJDb250ZW50U3RhdGUuRk9DVVNBQkxFKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMudmlld1JlZikge1xuICAgICAgICAgICAgICB0aGlzLnZpZXdSZWYgPSB0aGlzLnZpZXdDb250YWluZXJSZWYuY3JlYXRlRW1iZWRkZWRWaWV3KHRoaXMudGVtcGxhdGVSZWYsIHt9KTtcbiAgICAgICAgICAgICAgdGhpcy5pbml0RWxlbWVudCh0aGlzLnZpZXdSZWYucm9vdE5vZGVzWzBdIGFzIEhUTUxFbGVtZW50KTtcbiAgICAgICAgICAgICAgdGhpcy52aWV3UmVmLm1hcmtGb3JDaGVjaygpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnZpZXdDb250YWluZXJSZWYuaW5kZXhPZih0aGlzLnZpZXdSZWYpID09PSAtMSkge1xuICAgICAgICAgICAgICB0aGlzLnZpZXdDb250YWluZXJSZWYuaW5zZXJ0KHRoaXMudmlld1JlZiEpO1xuICAgICAgICAgICAgICB0aGlzLnZpZXdSZWYubWFya0ZvckNoZWNrKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChldmVudFN0YXRlID09PSBIb3ZlckNvbnRlbnRTdGF0ZS5PTikge1xuICAgICAgICAgICAgICB0aGlzLm1ha2VFbGVtZW50VmlzaWJsZSh0aGlzLnZpZXdSZWYucm9vdE5vZGVzWzBdIGFzIEhUTUxFbGVtZW50KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHRoaXMubWFrZUVsZW1lbnRIaWRkZW5CdXRGb2N1c2FibGUodGhpcy52aWV3UmVmLnJvb3ROb2Rlc1swXSBhcyBIVE1MRWxlbWVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnZpZXdSZWYpIHtcbiAgICAgICAgICAgIHRoaXMudmlld0NvbnRhaW5lclJlZi5kZXRhY2godGhpcy52aWV3Q29udGFpbmVyUmVmLmluZGV4T2YodGhpcy52aWV3UmVmKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgfVxufVxuXG4vKipcbiAqIE9wZW5zIHRoZSBjbG9zZXN0IGVkaXQgcG9wb3ZlciB0byB0aGlzIGVsZW1lbnQsIHdoZXRoZXIgaXQncyBhc3NvY2lhdGVkIHdpdGggdGhpcyBleGFjdFxuICogZWxlbWVudCBvciBhbiBhbmNlc3RvciBlbGVtZW50LlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbY2RrRWRpdE9wZW5dJyxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrRWRpdE9wZW4ge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByb3RlY3RlZCByZWFkb25seSBlbGVtZW50UmVmOiBFbGVtZW50UmVmPEhUTUxFbGVtZW50PixcbiAgICAgIHByb3RlY3RlZCByZWFkb25seSBlZGl0RXZlbnREaXNwYXRjaGVyOiBFZGl0RXZlbnREaXNwYXRjaGVyPEVkaXRSZWY8dW5rbm93bj4+KSB7XG5cbiAgICBjb25zdCBuYXRpdmVFbGVtZW50ID0gZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50O1xuXG4gICAgLy8gUHJldmVudCBhY2NpZGVudGFsIGZvcm0gc3VibWl0cy5cbiAgICBpZiAobmF0aXZlRWxlbWVudC5ub2RlTmFtZSA9PT0gJ0JVVFRPTicgJiYgIW5hdGl2ZUVsZW1lbnQuZ2V0QXR0cmlidXRlKCd0eXBlJykpIHtcbiAgICAgIG5hdGl2ZUVsZW1lbnQuc2V0QXR0cmlidXRlKCd0eXBlJywgJ2J1dHRvbicpO1xuICAgIH1cbiAgfVxuXG4gIC8vIEluIEl2eSB0aGUgYGhvc3RgIG1ldGFkYXRhIHdpbGwgYmUgbWVyZ2VkLCB3aGVyZWFzIGluIFZpZXdFbmdpbmUgaXQgaXMgb3ZlcnJpZGRlbi4gSW4gb3JkZXJcbiAgLy8gdG8gYXZvaWQgZG91YmxlIGV2ZW50IGxpc3RlbmVycywgd2UgbmVlZCB0byB1c2UgYEhvc3RMaXN0ZW5lcmAuIE9uY2UgSXZ5IGlzIHRoZSBkZWZhdWx0LCB3ZVxuICAvLyBjYW4gbW92ZSB0aGlzIGJhY2sgaW50byBgaG9zdGAuXG4gIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1ob3N0LWRlY29yYXRvci1pbi1jb25jcmV0ZVxuICBASG9zdExpc3RlbmVyKCdjbGljaycsIFsnJGV2ZW50J10pXG4gIG9wZW5FZGl0KGV2dDogRXZlbnQpOiB2b2lkIHtcbiAgICB0aGlzLmVkaXRFdmVudERpc3BhdGNoZXIuZWRpdGluZy5uZXh0KGNsb3Nlc3QodGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQhLCBDRUxMX1NFTEVDVE9SKSk7XG4gICAgZXZ0LnN0b3BQcm9wYWdhdGlvbigpO1xuICB9XG59XG4iXX0=