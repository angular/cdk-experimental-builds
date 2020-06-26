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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFibGUtZGlyZWN0aXZlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL3BvcG92ZXItZWRpdC90YWJsZS1kaXJlY3RpdmVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQVNBLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUNuRCxPQUFPLEVBRUwsU0FBUyxFQUNULFVBQVUsRUFFVixNQUFNLEVBRU4sV0FBVyxFQUNYLGdCQUFnQixFQUNoQixZQUFZLEdBQ2IsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFDLFNBQVMsRUFBRSxnQkFBZ0IsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQ2pFLE9BQU8sRUFDTCxNQUFNLEVBQ04sR0FBRyxFQUNILEtBQUssRUFDTCxLQUFLLEVBQ0wsU0FBUyxFQUNULFNBQVMsRUFDVCxZQUFZLEVBQ1osY0FBYyxHQUNmLE1BQU0sZ0JBQWdCLENBQUM7QUFFeEIsT0FBTyxFQUFDLGFBQWEsRUFBRSxlQUFlLEVBQUUsa0JBQWtCLEVBQUUsWUFBWSxFQUFDLE1BQU0sYUFBYSxDQUFDO0FBQzdGLE9BQU8sRUFBQyxtQkFBbUIsRUFBb0IsTUFBTSx5QkFBeUIsQ0FBQztBQUMvRSxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDN0MsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLG9CQUFvQixDQUFDO0FBQ25ELE9BQU8sRUFHTCwwQkFBMEIsRUFDM0IsTUFBTSx5QkFBeUIsQ0FBQztBQUNqQyxPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sWUFBWSxDQUFDO0FBWW5DLCtDQUErQztBQUMvQyxNQUFNLDJCQUEyQixHQUFHLEVBQUUsQ0FBQztBQUV2Qzs7OztHQUlHO0FBQ0g7SUFBQSxNQUlhLFdBQVc7UUFHdEIsWUFDdUIsVUFBc0IsRUFDdEIsbUJBQXdDLEVBQ3hDLGVB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QUUsc0JBQXNCO2lCQUNqQzs7O2dCQXZXTyxZQUFZO2dCQXRCbEIsVUFBVTtnQkFJVixXQUFXO2dCQUNYLGdCQUFnQjs7SUEyY2xCLHlCQUFDO0tBQUE7U0FsRlksa0JBQWtCO0FBb0YvQjs7O0dBR0c7QUFDSDtJQUFBLE1BR2EsV0FBVztRQUN0QixZQUN1QixVQUFtQyxFQUNuQyxtQkFBd0M7WUFEeEMsZUFBVSxHQUFWLFVBQVUsQ0FBeUI7WUFDbkMsd0JBQW1CLEdBQW5CLG1CQUFtQixDQUFxQjtZQUU3RCxNQUFNLGFBQWEsR0FBRyxVQUFVLENBQUMsYUFBYSxDQUFDO1lBRS9DLG1DQUFtQztZQUNuQyxJQUFJLGFBQWEsQ0FBQyxRQUFRLEtBQUssUUFBUSxJQUFJLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsRUFBRTtnQkFDOUUsYUFBYSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUM7YUFDOUM7UUFDSCxDQUFDO1FBRUQsOEZBQThGO1FBQzlGLDhGQUE4RjtRQUM5RixrQ0FBa0M7UUFDbEMsK0NBQStDO1FBRS9DLFFBQVEsQ0FBQyxHQUFVO1lBQ2pCLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLGFBQWMsRUFBRSxhQUFhLENBQUMsQ0FBQyxDQUFDO1lBQzlGLEdBQUcsQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUN4QixDQUFDOzs7Z0JBeEJGLFNBQVMsU0FBQztvQkFDVCxRQUFRLEVBQUUsZUFBZTtpQkFDMUI7OztnQkF4ZEMsVUFBVTtnQkFxQkosbUJBQW1COzs7MkJBcWR4QixZQUFZLFNBQUMsT0FBTyxFQUFFLENBQUMsUUFBUSxDQUFDOztJQUtuQyxrQkFBQztLQUFBO1NBdEJZLFdBQVciLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7Rm9jdXNUcmFwfSBmcm9tICdAYW5ndWxhci9jZGsvYTExeSc7XG5pbXBvcnQge092ZXJsYXlSZWYsIFBvc2l0aW9uU3RyYXRlZ3l9IGZyb20gJ0Bhbmd1bGFyL2Nkay9vdmVybGF5JztcbmltcG9ydCB7VGVtcGxhdGVQb3J0YWx9IGZyb20gJ0Bhbmd1bGFyL2Nkay9wb3J0YWwnO1xuaW1wb3J0IHtcbiAgQWZ0ZXJWaWV3SW5pdCxcbiAgRGlyZWN0aXZlLFxuICBFbGVtZW50UmVmLFxuICBFbWJlZGRlZFZpZXdSZWYsXG4gIE5nWm9uZSxcbiAgT25EZXN0cm95LFxuICBUZW1wbGF0ZVJlZixcbiAgVmlld0NvbnRhaW5lclJlZixcbiAgSG9zdExpc3RlbmVyLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7ZnJvbUV2ZW50LCBmcm9tRXZlbnRQYXR0ZXJuLCBtZXJnZSwgU3ViamVjdH0gZnJvbSAncnhqcyc7XG5pbXBvcnQge1xuICBmaWx0ZXIsXG4gIG1hcCxcbiAgbWFwVG8sXG4gIHNoYXJlLFxuICBzdGFydFdpdGgsXG4gIHRha2VVbnRpbCxcbiAgdGhyb3R0bGVUaW1lLFxuICB3aXRoTGF0ZXN0RnJvbSxcbn0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuXG5pbXBvcnQge0NFTExfU0VMRUNUT1IsIEVESVRfUEFORV9DTEFTUywgRURJVF9QQU5FX1NFTEVDVE9SLCBST1dfU0VMRUNUT1J9IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCB7RWRpdEV2ZW50RGlzcGF0Y2hlciwgSG92ZXJDb250ZW50U3RhdGV9IGZyb20gJy4vZWRpdC1ldmVudC1kaXNwYXRjaGVyJztcbmltcG9ydCB7RWRpdFNlcnZpY2VzfSBmcm9tICcuL2VkaXQtc2VydmljZXMnO1xuaW1wb3J0IHtGb2N1c0Rpc3BhdGNoZXJ9IGZyb20gJy4vZm9jdXMtZGlzcGF0Y2hlcic7XG5pbXBvcnQge1xuICBGb2N1c0VzY2FwZU5vdGlmaWVyLFxuICBGb2N1c0VzY2FwZU5vdGlmaWVyRGlyZWN0aW9uLFxuICBGb2N1c0VzY2FwZU5vdGlmaWVyRmFjdG9yeVxufSBmcm9tICcuL2ZvY3VzLWVzY2FwZS1ub3RpZmllcic7XG5pbXBvcnQge2Nsb3Nlc3R9IGZyb20gJy4vcG9seWZpbGwnO1xuXG4vKipcbiAqIERlc2NyaWJlcyB0aGUgbnVtYmVyIG9mIGNvbHVtbnMgYmVmb3JlIGFuZCBhZnRlciB0aGUgb3JpZ2luYXRpbmcgY2VsbCB0aGF0IHRoZVxuICogZWRpdCBwb3B1cCBzaG91bGQgc3Bhbi4gSW4gbGVmdCB0byByaWdodCBsb2NhbGVzLCBiZWZvcmUgbWVhbnMgbGVmdCBhbmQgYWZ0ZXIgbWVhbnNcbiAqIHJpZ2h0LiBJbiByaWdodCB0byBsZWZ0IGxvY2FsZXMgYmVmb3JlIG1lYW5zIHJpZ2h0IGFuZCBhZnRlciBtZWFucyBsZWZ0LlxuICovXG5leHBvcnQgaW50ZXJmYWNlIENka1BvcG92ZXJFZGl0Q29sc3BhbiB7XG4gIGJlZm9yZT86IG51bWJlcjtcbiAgYWZ0ZXI/OiBudW1iZXI7XG59XG5cbi8qKiBVc2VkIGZvciByYXRlLWxpbWl0aW5nIG1vdXNlbW92ZSBldmVudHMuICovXG5jb25zdCBNT1VTRV9NT1ZFX1RIUk9UVExFX1RJTUVfTVMgPSAxMDtcblxuLyoqXG4gKiBBIGRpcmVjdGl2ZSB0aGF0IG11c3QgYmUgYXR0YWNoZWQgdG8gZW5hYmxlIGVkaXRhYmlsaXR5IG9uIGEgdGFibGUuXG4gKiBJdCBpcyByZXNwb25zaWJsZSBmb3Igc2V0dGluZyB1cCBkZWxlZ2F0ZWQgZXZlbnQgaGFuZGxlcnMgYW5kIHByb3ZpZGluZyB0aGVcbiAqIEVkaXRFdmVudERpc3BhdGNoZXIgc2VydmljZSBmb3IgdXNlIGJ5IHRoZSBvdGhlciBlZGl0IGRpcmVjdGl2ZXMuXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ3RhYmxlW2VkaXRhYmxlXSwgY2RrLXRhYmxlW2VkaXRhYmxlXSwgbWF0LXRhYmxlW2VkaXRhYmxlXScsXG4gIHByb3ZpZGVyczogW0VkaXRFdmVudERpc3BhdGNoZXIsIEVkaXRTZXJ2aWNlc10sXG59KVxuZXhwb3J0IGNsYXNzIENka0VkaXRhYmxlIGltcGxlbWVudHMgQWZ0ZXJWaWV3SW5pdCwgT25EZXN0cm95IHtcbiAgcHJvdGVjdGVkIHJlYWRvbmx5IGRlc3Ryb3llZCA9IG5ldyBTdWJqZWN0PHZvaWQ+KCk7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgZWxlbWVudFJlZjogRWxlbWVudFJlZixcbiAgICAgIHByb3RlY3RlZCByZWFkb25seSBlZGl0RXZlbnREaXNwYXRjaGVyOiBFZGl0RXZlbnREaXNwYXRjaGVyLFxuICAgICAgcHJvdGVjdGVkIHJlYWRvbmx5IGZvY3VzRGlzcGF0Y2hlcjogRm9jdXNEaXNwYXRjaGVyLCBwcm90ZWN0ZWQgcmVhZG9ubHkgbmdab25lOiBOZ1pvbmUpIHt9XG5cbiAgbmdBZnRlclZpZXdJbml0KCk6IHZvaWQge1xuICAgIHRoaXMuX2xpc3RlbkZvclRhYmxlRXZlbnRzKCk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLmRlc3Ryb3llZC5uZXh0KCk7XG4gICAgdGhpcy5kZXN0cm95ZWQuY29tcGxldGUoKTtcbiAgfVxuXG4gIHByaXZhdGUgX2xpc3RlbkZvclRhYmxlRXZlbnRzKCk6IHZvaWQge1xuICAgIGNvbnN0IGVsZW1lbnQgPSB0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudDtcbiAgICBjb25zdCB0b0Nsb3Nlc3QgPSAoc2VsZWN0b3I6IHN0cmluZykgPT5cbiAgICAgICAgbWFwKChldmVudDogVUlFdmVudCkgPT4gY2xvc2VzdChldmVudC50YXJnZXQsIHNlbGVjdG9yKSk7XG5cbiAgICB0aGlzLm5nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgICAvLyBUcmFjayBtb3VzZSBtb3ZlbWVudCBvdmVyIHRoZSB0YWJsZSB0byBoaWRlL3Nob3cgaG92ZXIgY29udGVudC5cbiAgICAgIGZyb21FdmVudDxNb3VzZUV2ZW50PihlbGVtZW50LCAnbW91c2VvdmVyJykucGlwZShcbiAgICAgICAgICB0b0Nsb3Nlc3QoUk9XX1NFTEVDVE9SKSxcbiAgICAgICAgICB0YWtlVW50aWwodGhpcy5kZXN0cm95ZWQpLFxuICAgICAgICAgICkuc3Vic2NyaWJlKHRoaXMuZWRpdEV2ZW50RGlzcGF0Y2hlci5ob3ZlcmluZyk7XG4gICAgICBmcm9tRXZlbnQ8TW91c2VFdmVudD4oZWxlbWVudCwgJ21vdXNlbGVhdmUnKS5waXBlKFxuICAgICAgICAgIG1hcFRvKG51bGwpLFxuICAgICAgICAgIHRha2VVbnRpbCh0aGlzLmRlc3Ryb3llZCksXG4gICAgICAgICAgKS5zdWJzY3JpYmUodGhpcy5lZGl0RXZlbnREaXNwYXRjaGVyLmhvdmVyaW5nKTtcbiAgICAgIGZyb21FdmVudDxNb3VzZUV2ZW50PihlbGVtZW50LCAnbW91c2Vtb3ZlJykucGlwZShcbiAgICAgICAgICB0aHJvdHRsZVRpbWUoTU9VU0VfTU9WRV9USFJPVFRMRV9USU1FX01TKSxcbiAgICAgICAgICB0b0Nsb3Nlc3QoUk9XX1NFTEVDVE9SKSxcbiAgICAgICAgICB0YWtlVW50aWwodGhpcy5kZXN0cm95ZWQpLFxuICAgICAgICAgICkuc3Vic2NyaWJlKHRoaXMuZWRpdEV2ZW50RGlzcGF0Y2hlci5tb3VzZU1vdmUpO1xuXG4gICAgICAvLyBUcmFjayBmb2N1cyB3aXRoaW4gdGhlIHRhYmxlIHRvIGhpZGUvc2hvdy9tYWtlIGZvY3VzYWJsZSBob3ZlciBjb250ZW50LlxuICAgICAgZnJvbUV2ZW50UGF0dGVybjxGb2N1c0V2ZW50PihcbiAgICAgICAgICBoYW5kbGVyID0+IGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXMnLCBoYW5kbGVyLCB0cnVlKSxcbiAgICAgICAgICBoYW5kbGVyID0+IGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignZm9jdXMnLCBoYW5kbGVyLCB0cnVlKVxuICAgICAgICAgICkucGlwZShcbiAgICAgICAgICAgICAgdG9DbG9zZXN0KFJPV19TRUxFQ1RPUiksXG4gICAgICAgICAgICAgIHNoYXJlKCksXG4gICAgICAgICAgICAgIHRha2VVbnRpbCh0aGlzLmRlc3Ryb3llZCksXG4gICAgICAgICAgICAgICkuc3Vic2NyaWJlKHRoaXMuZWRpdEV2ZW50RGlzcGF0Y2hlci5mb2N1c2VkKTtcblxuICAgICAgbWVyZ2UoXG4gICAgICAgIGZyb21FdmVudFBhdHRlcm48Rm9jdXNFdmVudD4oXG4gICAgICAgICAgaGFuZGxlciA9PiBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2JsdXInLCBoYW5kbGVyLCB0cnVlKSxcbiAgICAgICAgICBoYW5kbGVyID0+IGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignYmx1cicsIGhhbmRsZXIsIHRydWUpXG4gICAgICAgICksXG4gICAgICAgIGZyb21FdmVudDxLZXlib2FyZEV2ZW50PihlbGVtZW50LCAna2V5ZG93bicpLnBpcGUoZmlsdGVyKGV2ZW50ID0+IGV2ZW50LmtleSA9PT0gJ0VzY2FwZScpKVxuICAgICAgKS5waXBlKFxuICAgICAgICBtYXBUbyhudWxsKSxcbiAgICAgICAgc2hhcmUoKSxcbiAgICAgICAgdGFrZVVudGlsKHRoaXMuZGVzdHJveWVkKSxcbiAgICAgICkuc3Vic2NyaWJlKHRoaXMuZWRpdEV2ZW50RGlzcGF0Y2hlci5mb2N1c2VkKTtcblxuICAgICAgLy8gS2VlcCB0cmFjayBvZiByb3dzIHdpdGhpbiB0aGUgdGFibGUuIFRoaXMgaXMgdXNlZCB0byBrbm93IHdoaWNoIHJvd3Mgd2l0aCBob3ZlciBjb250ZW50XG4gICAgICAvLyBhcmUgZmlyc3Qgb3IgbGFzdCBpbiB0aGUgdGFibGUuIFRoZXkgYXJlIGtlcHQgZm9jdXNhYmxlIGluIGNhc2UgZm9jdXMgZW50ZXJzIGZyb20gYWJvdmVcbiAgICAgIC8vIG9yIGJlbG93IHRoZSB0YWJsZS5cbiAgICAgIHRoaXMubmdab25lLm9uU3RhYmxlLnBpcGUoXG4gICAgICAgICAgLy8gT3B0aW1pemF0aW9uOiBpZ25vcmUgZG9tIGNoYW5nZXMgd2hpbGUgZm9jdXMgaXMgd2l0aGluIHRoZSB0YWJsZSBhcyB3ZSBhbHJlYWR5XG4gICAgICAgICAgLy8gZW5zdXJlIHRoYXQgcm93cyBhYm92ZSBhbmQgYmVsb3cgdGhlIGZvY3VzZWQvYWN0aXZlIHJvdyBhcmUgdGFiYmFibGUuXG4gICAgICAgICAgd2l0aExhdGVzdEZyb20odGhpcy5lZGl0RXZlbnREaXNwYXRjaGVyLmVkaXRpbmdPckZvY3VzZWQpLFxuICAgICAgICAgIGZpbHRlcigoW18sIGFjdGl2ZVJvd10pID0+IGFjdGl2ZVJvdyA9PSBudWxsKSxcbiAgICAgICAgICBtYXAoKCkgPT4gZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKFJPV19TRUxFQ1RPUikpLFxuICAgICAgICAgIHNoYXJlKCksXG4gICAgICAgICAgdGFrZVVudGlsKHRoaXMuZGVzdHJveWVkKSxcbiAgICAgICAgICApLnN1YnNjcmliZSh0aGlzLmVkaXRFdmVudERpc3BhdGNoZXIuYWxsUm93cyk7XG5cbiAgICAgIGZyb21FdmVudDxLZXlib2FyZEV2ZW50PihlbGVtZW50LCAna2V5ZG93bicpLnBpcGUoXG4gICAgICAgICAgZmlsdGVyKGV2ZW50ID0+IGV2ZW50LmtleSA9PT0gJ0VudGVyJyksXG4gICAgICAgICAgdG9DbG9zZXN0KENFTExfU0VMRUNUT1IpLFxuICAgICAgICAgIHRha2VVbnRpbCh0aGlzLmRlc3Ryb3llZCksXG4gICAgICAgICAgKS5zdWJzY3JpYmUodGhpcy5lZGl0RXZlbnREaXNwYXRjaGVyLmVkaXRpbmcpO1xuXG4gICAgICAvLyBLZXlkb3duIG11c3QgYmUgdXNlZCBoZXJlIG9yIGVsc2Uga2V5IGF1dG9yZXBlYXQgZG9lcyBub3Qgd29yayBwcm9wZXJseSBvbiBzb21lIHBsYXRmb3Jtcy5cbiAgICAgIGZyb21FdmVudDxLZXlib2FyZEV2ZW50PihlbGVtZW50LCAna2V5ZG93bicpXG4gICAgICAgICAgLnBpcGUodGFrZVVudGlsKHRoaXMuZGVzdHJveWVkKSlcbiAgICAgICAgICAuc3Vic2NyaWJlKHRoaXMuZm9jdXNEaXNwYXRjaGVyLmtleU9ic2VydmVyKTtcbiAgICB9KTtcbiAgfVxufVxuXG5jb25zdCBQT1BPVkVSX0VESVRfSE9TVF9CSU5ESU5HUyA9IHtcbiAgJ1thdHRyLnRhYmluZGV4XSc6ICdkaXNhYmxlZCA/IG51bGwgOiAwJyxcbiAgJ2NsYXNzJzogJ2Nkay1wb3BvdmVyLWVkaXQtY2VsbCcsXG4gICdbYXR0ci5hcmlhLWhhc3BvcHVwXSc6ICchZGlzYWJsZWQnLFxufTtcblxuY29uc3QgUE9QT1ZFUl9FRElUX0lOUFVUUyA9IFtcbiAgJ3RlbXBsYXRlOiBjZGtQb3BvdmVyRWRpdCcsXG4gICdjb250ZXh0OiBjZGtQb3BvdmVyRWRpdENvbnRleHQnLFxuICAnY29sc3BhbjogY2RrUG9wb3ZlckVkaXRDb2xzcGFuJyxcbiAgJ2Rpc2FibGVkOiBjZGtQb3BvdmVyRWRpdERpc2FibGVkJyxcbl07XG5cbi8qKlxuICogQXR0YWNoZXMgYW4gbmctdGVtcGxhdGUgdG8gYSBjZWxsIGFuZCBzaG93cyBpdCB3aGVuIGluc3RydWN0ZWQgdG8gYnkgdGhlXG4gKiBFZGl0RXZlbnREaXNwYXRjaGVyIHNlcnZpY2UuXG4gKiBNYWtlcyB0aGUgY2VsbCBmb2N1c2FibGUuXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tjZGtQb3BvdmVyRWRpdF06bm90KFtjZGtQb3BvdmVyRWRpdFRhYk91dF0pJyxcbiAgaG9zdDogUE9QT1ZFUl9FRElUX0hPU1RfQklORElOR1MsXG4gIGlucHV0czogUE9QT1ZFUl9FRElUX0lOUFVUUyxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrUG9wb3ZlckVkaXQ8Qz4gaW1wbGVtZW50cyBBZnRlclZpZXdJbml0LCBPbkRlc3Ryb3kge1xuICAvKiogVGhlIGVkaXQgbGVucyB0ZW1wbGF0ZSBzaG93biBvdmVyIHRoZSBjZWxsIG9uIGVkaXQuICovXG4gIHRlbXBsYXRlOiBUZW1wbGF0ZVJlZjxhbnk+fG51bGwgPSBudWxsO1xuXG4gIC8qKlxuICAgKiBJbXBsaWNpdCBjb250ZXh0IHRvIHBhc3MgYWxvbmcgdG8gdGhlIHRlbXBsYXRlLiBDYW4gYmUgb21pdHRlZCBpZiB0aGUgdGVtcGxhdGVcbiAgICogaXMgZGVmaW5lZCB3aXRoaW4gdGhlIGNlbGwuXG4gICAqL1xuICBjb250ZXh0PzogQztcblxuICAvKipcbiAgICogU3BlY2lmaWVzIHRoYXQgdGhlIHBvcHVwIHNob3VsZCBjb3ZlciBhZGRpdGlvbmFsIHRhYmxlIGNlbGxzIGJlZm9yZSBhbmQvb3IgYWZ0ZXJcbiAgICogdGhpcyBvbmUuXG4gICAqL1xuICBnZXQgY29sc3BhbigpOiBDZGtQb3BvdmVyRWRpdENvbHNwYW4ge1xuICAgIHJldHVybiB0aGlzLl9jb2xzcGFuO1xuICB9XG4gIHNldCBjb2xzcGFuKHZhbHVlOiBDZGtQb3BvdmVyRWRpdENvbHNwYW4pIHtcbiAgICB0aGlzLl9jb2xzcGFuID0gdmFsdWU7XG5cbiAgICAvLyBSZWNvbXB1dGUgcG9zaXRpb25pbmcgd2hlbiB0aGUgY29sc3BhbiBjaGFuZ2VzLlxuICAgIGlmICh0aGlzLm92ZXJsYXlSZWYpIHtcbiAgICAgIHRoaXMub3ZlcmxheVJlZi51cGRhdGVQb3NpdGlvblN0cmF0ZWd5KHRoaXMuX2dldFBvc2l0aW9uU3RyYXRlZ3koKSk7XG5cbiAgICAgIGlmICh0aGlzLm92ZXJsYXlSZWYuaGFzQXR0YWNoZWQoKSkge1xuICAgICAgICB0aGlzLl91cGRhdGVPdmVybGF5U2l6ZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBwcml2YXRlIF9jb2xzcGFuOiBDZGtQb3BvdmVyRWRpdENvbHNwYW4gPSB7fTtcblxuICAvKiogV2hldGhlciBwb3BvdmVyIGVkaXQgaXMgZGlzYWJsZWQgZm9yIHRoaXMgY2VsbC4gKi9cbiAgZ2V0IGRpc2FibGVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9kaXNhYmxlZDtcbiAgfVxuICBzZXQgZGlzYWJsZWQodmFsdWU6IGJvb2xlYW4pIHtcbiAgICB0aGlzLl9kaXNhYmxlZCA9IHZhbHVlO1xuXG4gICAgaWYgKHZhbHVlKSB7XG4gICAgICB0aGlzLnNlcnZpY2VzLmVkaXRFdmVudERpc3BhdGNoZXIuZG9uZUVkaXRpbmdDZWxsKHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50ISk7XG4gICAgICB0aGlzLnNlcnZpY2VzLmVkaXRFdmVudERpc3BhdGNoZXIuZGlzYWJsZWRDZWxscy5zZXQodGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQhLCB0cnVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zZXJ2aWNlcy5lZGl0RXZlbnREaXNwYXRjaGVyLmRpc2FibGVkQ2VsbHMuZGVsZXRlKHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50ISk7XG4gICAgfVxuICB9XG4gIHByaXZhdGUgX2Rpc2FibGVkID0gZmFsc2U7XG5cbiAgcHJvdGVjdGVkIGZvY3VzVHJhcD86IEZvY3VzVHJhcDtcbiAgcHJvdGVjdGVkIG92ZXJsYXlSZWY/OiBPdmVybGF5UmVmO1xuICBwcm90ZWN0ZWQgcmVhZG9ubHkgZGVzdHJveWVkID0gbmV3IFN1YmplY3Q8dm9pZD4oKTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByb3RlY3RlZCByZWFkb25seSBzZXJ2aWNlczogRWRpdFNlcnZpY2VzLCBwcm90ZWN0ZWQgcmVhZG9ubHkgZWxlbWVudFJlZjogRWxlbWVudFJlZixcbiAgICAgIHByb3RlY3RlZCByZWFkb25seSB2aWV3Q29udGFpbmVyUmVmOiBWaWV3Q29udGFpbmVyUmVmKSB7fVxuXG4gIG5nQWZ0ZXJWaWV3SW5pdCgpOiB2b2lkIHtcbiAgICB0aGlzLl9zdGFydExpc3RlbmluZ1RvRWRpdEV2ZW50cygpO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgdGhpcy5kZXN0cm95ZWQubmV4dCgpO1xuICAgIHRoaXMuZGVzdHJveWVkLmNvbXBsZXRlKCk7XG5cbiAgICBpZiAodGhpcy5mb2N1c1RyYXApIHtcbiAgICAgIHRoaXMuZm9jdXNUcmFwLmRlc3Ryb3koKTtcbiAgICAgIHRoaXMuZm9jdXNUcmFwID0gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGlmICh0aGlzLm92ZXJsYXlSZWYpIHtcbiAgICAgIHRoaXMub3ZlcmxheVJlZi5kaXNwb3NlKCk7XG4gICAgfVxuICB9XG5cbiAgcHJvdGVjdGVkIGluaXRGb2N1c1RyYXAoKTogdm9pZCB7XG4gICAgdGhpcy5mb2N1c1RyYXAgPSB0aGlzLnNlcnZpY2VzLmZvY3VzVHJhcEZhY3RvcnkuY3JlYXRlKHRoaXMub3ZlcmxheVJlZiEub3ZlcmxheUVsZW1lbnQpO1xuICB9XG5cbiAgcHJvdGVjdGVkIGNsb3NlRWRpdE92ZXJsYXkoKTogdm9pZCB7XG4gICAgdGhpcy5zZXJ2aWNlcy5lZGl0RXZlbnREaXNwYXRjaGVyLmRvbmVFZGl0aW5nQ2VsbCh0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCEpO1xuICB9XG5cbiAgcHJvdGVjdGVkIHBhbmVsQ2xhc3MoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gRURJVF9QQU5FX0NMQVNTO1xuICB9XG5cbiAgcHJpdmF0ZSBfc3RhcnRMaXN0ZW5pbmdUb0VkaXRFdmVudHMoKTogdm9pZCB7XG4gICAgdGhpcy5zZXJ2aWNlcy5lZGl0RXZlbnREaXNwYXRjaGVyLmVkaXRpbmdDZWxsKHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50ISlcbiAgICAgICAgLnBpcGUodGFrZVVudGlsKHRoaXMuZGVzdHJveWVkKSlcbiAgICAgICAgLnN1YnNjcmliZSgob3BlbikgPT4ge1xuICAgICAgICAgIGlmIChvcGVuICYmIHRoaXMudGVtcGxhdGUpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5vdmVybGF5UmVmKSB7XG4gICAgICAgICAgICAgIHRoaXMuX2NyZWF0ZUVkaXRPdmVybGF5KCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuX3Nob3dFZGl0T3ZlcmxheSgpO1xuICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5vdmVybGF5UmVmKSB7XG4gICAgICAgICAgICB0aGlzLl9tYXliZVJldHVybkZvY3VzVG9DZWxsKCk7XG5cbiAgICAgICAgICAgIHRoaXMub3ZlcmxheVJlZi5kZXRhY2goKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfY3JlYXRlRWRpdE92ZXJsYXkoKTogdm9pZCB7XG4gICAgdGhpcy5vdmVybGF5UmVmID0gdGhpcy5zZXJ2aWNlcy5vdmVybGF5LmNyZWF0ZSh7XG4gICAgICBkaXNwb3NlT25OYXZpZ2F0aW9uOiB0cnVlLFxuICAgICAgcGFuZWxDbGFzczogdGhpcy5wYW5lbENsYXNzKCksXG4gICAgICBwb3NpdGlvblN0cmF0ZWd5OiB0aGlzLl9nZXRQb3NpdGlvblN0cmF0ZWd5KCksXG4gICAgICBzY3JvbGxTdHJhdGVneTogdGhpcy5zZXJ2aWNlcy5vdmVybGF5LnNjcm9sbFN0cmF0ZWdpZXMucmVwb3NpdGlvbigpLFxuICAgICAgZGlyZWN0aW9uOiB0aGlzLnNlcnZpY2VzLmRpcmVjdGlvbmFsaXR5LFxuICAgIH0pO1xuXG4gICAgdGhpcy5pbml0Rm9jdXNUcmFwKCk7XG4gICAgdGhpcy5vdmVybGF5UmVmLm92ZXJsYXlFbGVtZW50LnNldEF0dHJpYnV0ZSgnYXJpYS1yb2xlJywgJ2RpYWxvZycpO1xuXG4gICAgdGhpcy5vdmVybGF5UmVmLmRldGFjaG1lbnRzKCkuc3Vic2NyaWJlKCgpID0+IHRoaXMuY2xvc2VFZGl0T3ZlcmxheSgpKTtcbiAgfVxuXG4gIHByaXZhdGUgX3Nob3dFZGl0T3ZlcmxheSgpOiB2b2lkIHtcbiAgICB0aGlzLm92ZXJsYXlSZWYhLmF0dGFjaChuZXcgVGVtcGxhdGVQb3J0YWwoXG4gICAgICAgIHRoaXMudGVtcGxhdGUhLFxuICAgICAgICB0aGlzLnZpZXdDb250YWluZXJSZWYsXG4gICAgICAgIHskaW1wbGljaXQ6IHRoaXMuY29udGV4dH0pKTtcblxuICAgIC8vIFdlIGhhdmUgdG8gZGVmZXIgdHJhcHBpbmcgZm9jdXMsIGJlY2F1c2UgZG9pbmcgc28gdG9vIGVhcmx5IGNhbiBjYXVzZSB0aGUgZm9ybSBpbnNpZGVcbiAgICAvLyB0aGUgb3ZlcmxheSB0byBiZSBzdWJtaXR0ZWQgaW1tZWRpYXRlbHkgaWYgaXQgd2FzIG9wZW5lZCBvbiBhbiBFbnRlciBrZXlkb3duIGV2ZW50LlxuICAgIHRoaXMuc2VydmljZXMubmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aGlzLmZvY3VzVHJhcCEuZm9jdXNJbml0aWFsRWxlbWVudCgpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICAvLyBVcGRhdGUgdGhlIHNpemUgb2YgdGhlIHBvcHVwIGluaXRpYWxseSBhbmQgb24gc3Vic2VxdWVudCBjaGFuZ2VzIHRvXG4gICAgLy8gc2Nyb2xsIHBvc2l0aW9uIGFuZCB2aWV3cG9ydCBzaXplLlxuICAgIG1lcmdlKHRoaXMuc2VydmljZXMuc2Nyb2xsRGlzcGF0Y2hlci5zY3JvbGxlZCgpLCB0aGlzLnNlcnZpY2VzLnZpZXdwb3J0UnVsZXIuY2hhbmdlKCkpXG4gICAgICAgIC5waXBlKFxuICAgICAgICAgIHN0YXJ0V2l0aChudWxsKSxcbiAgICAgICAgICB0YWtlVW50aWwobWVyZ2UodGhpcy5vdmVybGF5UmVmIS5kZXRhY2htZW50cygpLCB0aGlzLmRlc3Ryb3llZCkpXG4gICAgICAgIClcbiAgICAgICAgLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgICAgdGhpcy5fdXBkYXRlT3ZlcmxheVNpemUoKTtcbiAgICAgICAgfSk7XG4gIH1cblxuICBwcml2YXRlIF9nZXRPdmVybGF5Q2VsbHMoKTogSFRNTEVsZW1lbnRbXSB7XG4gICAgY29uc3QgY2VsbCA9IGNsb3Nlc3QodGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQhLCBDRUxMX1NFTEVDVE9SKSBhcyBIVE1MRWxlbWVudDtcblxuICAgIGlmICghdGhpcy5fY29sc3Bhbi5iZWZvcmUgJiYgIXRoaXMuX2NvbHNwYW4uYWZ0ZXIpIHtcbiAgICAgIHJldHVybiBbY2VsbF07XG4gICAgfVxuXG4gICAgY29uc3Qgcm93ID0gY2xvc2VzdCh0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCEsIFJPV19TRUxFQ1RPUikhO1xuICAgIGNvbnN0IHJvd0NlbGxzID0gQXJyYXkuZnJvbShyb3cucXVlcnlTZWxlY3RvckFsbChDRUxMX1NFTEVDVE9SKSkgYXMgSFRNTEVsZW1lbnRbXTtcbiAgICBjb25zdCBvd25JbmRleCA9IHJvd0NlbGxzLmluZGV4T2YoY2VsbCk7XG5cbiAgICByZXR1cm4gcm93Q2VsbHMuc2xpY2UoXG4gICAgICAgIG93bkluZGV4IC0gKHRoaXMuX2NvbHNwYW4uYmVmb3JlIHx8IDApLCBvd25JbmRleCArICh0aGlzLl9jb2xzcGFuLmFmdGVyIHx8IDApICsgMSk7XG4gIH1cblxuICBwcml2YXRlIF9nZXRQb3NpdGlvblN0cmF0ZWd5KCk6IFBvc2l0aW9uU3RyYXRlZ3kge1xuICAgIHJldHVybiB0aGlzLnNlcnZpY2VzLnBvc2l0aW9uRmFjdG9yeS5wb3NpdGlvblN0cmF0ZWd5Rm9yQ2VsbHModGhpcy5fZ2V0T3ZlcmxheUNlbGxzKCkpO1xuICB9XG5cbiAgcHJpdmF0ZSBfdXBkYXRlT3ZlcmxheVNpemUoKTogdm9pZCB7XG4gICAgdGhpcy5vdmVybGF5UmVmIS51cGRhdGVTaXplKFxuICAgICAgICB0aGlzLnNlcnZpY2VzLnBvc2l0aW9uRmFjdG9yeS5zaXplQ29uZmlnRm9yQ2VsbHModGhpcy5fZ2V0T3ZlcmxheUNlbGxzKCkpKTtcbiAgfVxuXG4gIHByaXZhdGUgX21heWJlUmV0dXJuRm9jdXNUb0NlbGwoKTogdm9pZCB7XG4gICAgaWYgKGNsb3Nlc3QoZG9jdW1lbnQuYWN0aXZlRWxlbWVudCwgRURJVF9QQU5FX1NFTEVDVE9SKSA9PT1cbiAgICAgICAgdGhpcy5vdmVybGF5UmVmIS5vdmVybGF5RWxlbWVudCkge1xuICAgICAgdGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQhLmZvY3VzKCk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQXR0YWNoZXMgYW4gbmctdGVtcGxhdGUgdG8gYSBjZWxsIGFuZCBzaG93cyBpdCB3aGVuIGluc3RydWN0ZWQgdG8gYnkgdGhlXG4gKiBFZGl0RXZlbnREaXNwYXRjaGVyIHNlcnZpY2UuXG4gKiBNYWtlcyB0aGUgY2VsbCBmb2N1c2FibGUuXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tjZGtQb3BvdmVyRWRpdF1bY2RrUG9wb3ZlckVkaXRUYWJPdXRdJyxcbiAgaG9zdDogUE9QT1ZFUl9FRElUX0hPU1RfQklORElOR1MsXG4gIGlucHV0czogUE9QT1ZFUl9FRElUX0lOUFVUUyxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrUG9wb3ZlckVkaXRUYWJPdXQ8Qz4gZXh0ZW5kcyBDZGtQb3BvdmVyRWRpdDxDPiB7XG4gIHByb3RlY3RlZCBmb2N1c1RyYXA/OiBGb2N1c0VzY2FwZU5vdGlmaWVyO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgZWxlbWVudFJlZjogRWxlbWVudFJlZiwgdmlld0NvbnRhaW5lclJlZjogVmlld0NvbnRhaW5lclJlZiwgc2VydmljZXM6IEVkaXRTZXJ2aWNlcyxcbiAgICAgIHByb3RlY3RlZCByZWFkb25seSBmb2N1c0VzY2FwZU5vdGlmaWVyRmFjdG9yeTogRm9jdXNFc2NhcGVOb3RpZmllckZhY3RvcnkpIHtcbiAgICBzdXBlcihzZXJ2aWNlcywgZWxlbWVudFJlZiwgdmlld0NvbnRhaW5lclJlZik7XG4gIH1cblxuICBwcm90ZWN0ZWQgaW5pdEZvY3VzVHJhcCgpOiB2b2lkIHtcbiAgICB0aGlzLmZvY3VzVHJhcCA9IHRoaXMuZm9jdXNFc2NhcGVOb3RpZmllckZhY3RvcnkuY3JlYXRlKHRoaXMub3ZlcmxheVJlZiEub3ZlcmxheUVsZW1lbnQpO1xuXG4gICAgdGhpcy5mb2N1c1RyYXAuZXNjYXBlcygpLnBpcGUodGFrZVVudGlsKHRoaXMuZGVzdHJveWVkKSkuc3Vic2NyaWJlKGRpcmVjdGlvbiA9PiB7XG4gICAgICBpZiAodGhpcy5zZXJ2aWNlcy5lZGl0RXZlbnREaXNwYXRjaGVyLmVkaXRSZWYpIHtcbiAgICAgICAgdGhpcy5zZXJ2aWNlcy5lZGl0RXZlbnREaXNwYXRjaGVyLmVkaXRSZWYuYmx1cigpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnNlcnZpY2VzLmZvY3VzRGlzcGF0Y2hlci5tb3ZlRm9jdXNIb3Jpem9udGFsbHkoXG4gICAgICAgICAgY2xvc2VzdCh0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCEsIENFTExfU0VMRUNUT1IpIGFzIEhUTUxFbGVtZW50LFxuICAgICAgICAgIGRpcmVjdGlvbiA9PT0gRm9jdXNFc2NhcGVOb3RpZmllckRpcmVjdGlvbi5TVEFSVCA/IC0xIDogMSk7XG5cbiAgICAgIHRoaXMuY2xvc2VFZGl0T3ZlcmxheSgpO1xuICAgIH0pO1xuICB9XG59XG5cbi8qKlxuICogQSBzdHJ1Y3R1cmFsIGRpcmVjdGl2ZSB0aGF0IHNob3dzIGl0cyBjb250ZW50cyB3aGVuIHRoZSB0YWJsZSByb3cgY29udGFpbmluZ1xuICogaXQgaXMgaG92ZXJlZCBvciB3aGVuIGFuIGVsZW1lbnQgaW4gdGhlIHJvdyBoYXMgZm9jdXMuXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tjZGtSb3dIb3ZlckNvbnRlbnRdJyxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrUm93SG92ZXJDb250ZW50IGltcGxlbWVudHMgQWZ0ZXJWaWV3SW5pdCwgT25EZXN0cm95IHtcbiAgcHJvdGVjdGVkIHJlYWRvbmx5IGRlc3Ryb3llZCA9IG5ldyBTdWJqZWN0PHZvaWQ+KCk7XG4gIHByb3RlY3RlZCB2aWV3UmVmOiBFbWJlZGRlZFZpZXdSZWY8YW55PnxudWxsID0gbnVsbDtcblxuICBwcml2YXRlIF9yb3c/OiBFbGVtZW50O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJvdGVjdGVkIHJlYWRvbmx5IHNlcnZpY2VzOiBFZGl0U2VydmljZXMsIHByb3RlY3RlZCByZWFkb25seSBlbGVtZW50UmVmOiBFbGVtZW50UmVmLFxuICAgICAgcHJvdGVjdGVkIHJlYWRvbmx5IHRlbXBsYXRlUmVmOiBUZW1wbGF0ZVJlZjxhbnk+LFxuICAgICAgcHJvdGVjdGVkIHJlYWRvbmx5IHZpZXdDb250YWluZXJSZWY6IFZpZXdDb250YWluZXJSZWYpIHt9XG5cbiAgbmdBZnRlclZpZXdJbml0KCk6IHZvaWQge1xuICAgIHRoaXMuX3JvdyA9IGNsb3Nlc3QodGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQhLCBST1dfU0VMRUNUT1IpITtcblxuICAgIHRoaXMuc2VydmljZXMuZWRpdEV2ZW50RGlzcGF0Y2hlci5yZWdpc3RlclJvd1dpdGhIb3ZlckNvbnRlbnQodGhpcy5fcm93KTtcbiAgICB0aGlzLl9saXN0ZW5Gb3JIb3ZlckFuZEZvY3VzRXZlbnRzKCk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLmRlc3Ryb3llZC5uZXh0KCk7XG4gICAgdGhpcy5kZXN0cm95ZWQuY29tcGxldGUoKTtcblxuICAgIGlmICh0aGlzLnZpZXdSZWYpIHtcbiAgICAgIHRoaXMudmlld1JlZi5kZXN0cm95KCk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX3Jvdykge1xuICAgICAgdGhpcy5zZXJ2aWNlcy5lZGl0RXZlbnREaXNwYXRjaGVyLmRlcmVnaXN0ZXJSb3dXaXRoSG92ZXJDb250ZW50KHRoaXMuX3Jvdyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENhbGxlZCBpbW1lZGlhdGVseSBhZnRlciB0aGUgaG92ZXIgY29udGVudCBpcyBjcmVhdGVkIGFuZCBhZGRlZCB0byB0aGUgZG9tLlxuICAgKiBJbiB0aGUgQ0RLIHZlcnNpb24sIHRoaXMgaXMgYSBub29wIGJ1dCBzdWJjbGFzc2VzIHN1Y2ggYXMgTWF0Um93SG92ZXJDb250ZW50IHVzZSB0aGlzXG4gICAqIHRvIHByZXBhcmUvc3R5bGUgdGhlIGluc2VydGVkIGVsZW1lbnQuXG4gICAqL1xuICBwcm90ZWN0ZWQgaW5pdEVsZW1lbnQoXzogSFRNTEVsZW1lbnQpOiB2b2lkIHtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiB0aGUgaG92ZXIgY29udGVudCBuZWVkcyB0byBiZSBmb2N1c2FibGUgdG8gcHJlc2VydmUgYSByZWFzb25hYmxlIHRhYiBvcmRlcmluZ1xuICAgKiBidXQgc2hvdWxkIG5vdCB5ZXQgYmUgc2hvd24uXG4gICAqL1xuICBwcm90ZWN0ZWQgbWFrZUVsZW1lbnRIaWRkZW5CdXRGb2N1c2FibGUoZWxlbWVudDogSFRNTEVsZW1lbnQpOiB2b2lkIHtcbiAgICBlbGVtZW50LnN0eWxlLm9wYWNpdHkgPSAnMCc7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gdGhlIGhvdmVyIGNvbnRlbnQgbmVlZHMgdG8gYmUgZm9jdXNhYmxlIHRvIHByZXNlcnZlIGEgcmVhc29uYWJsZSB0YWIgb3JkZXJpbmdcbiAgICogYnV0IHNob3VsZCBub3QgeWV0IGJlIHNob3duLlxuICAgKi9cbiAgcHJvdGVjdGVkIG1ha2VFbGVtZW50VmlzaWJsZShlbGVtZW50OiBIVE1MRWxlbWVudCk6IHZvaWQge1xuICAgIGVsZW1lbnQuc3R5bGUub3BhY2l0eSA9ICcnO1xuICB9XG5cbiAgcHJpdmF0ZSBfbGlzdGVuRm9ySG92ZXJBbmRGb2N1c0V2ZW50cygpOiB2b2lkIHtcbiAgICB0aGlzLnNlcnZpY2VzLmVkaXRFdmVudERpc3BhdGNoZXIuaG92ZXJPckZvY3VzT25Sb3codGhpcy5fcm93ISlcbiAgICAgICAgLnBpcGUodGFrZVVudGlsKHRoaXMuZGVzdHJveWVkKSlcbiAgICAgICAgLnN1YnNjcmliZShldmVudFN0YXRlID0+IHtcbiAgICAgICAgICAvLyBXaGVuIGluIEZPQ1VTQUJMRSBzdGF0ZSwgYWRkIHRoZSBob3ZlciBjb250ZW50IHRvIHRoZSBkb20gYnV0IG1ha2UgaXQgdHJhbnNwYXJlbnQgc29cbiAgICAgICAgICAvLyB0aGF0IGl0IGlzIGluIHRoZSB0YWIgb3JkZXIgcmVsYXRpdmUgdG8gdGhlIGN1cnJlbnRseSBmb2N1c2VkIHJvdy5cblxuICAgICAgICAgIGlmIChldmVudFN0YXRlID09PSBIb3ZlckNvbnRlbnRTdGF0ZS5PTiB8fCBldmVudFN0YXRlID09PSBIb3ZlckNvbnRlbnRTdGF0ZS5GT0NVU0FCTEUpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy52aWV3UmVmKSB7XG4gICAgICAgICAgICAgIHRoaXMudmlld1JlZiA9IHRoaXMudmlld0NvbnRhaW5lclJlZi5jcmVhdGVFbWJlZGRlZFZpZXcodGhpcy50ZW1wbGF0ZVJlZiwge30pO1xuICAgICAgICAgICAgICB0aGlzLmluaXRFbGVtZW50KHRoaXMudmlld1JlZi5yb290Tm9kZXNbMF0gYXMgSFRNTEVsZW1lbnQpO1xuICAgICAgICAgICAgICB0aGlzLnZpZXdSZWYubWFya0ZvckNoZWNrKCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMudmlld0NvbnRhaW5lclJlZi5pbmRleE9mKHRoaXMudmlld1JlZikgPT09IC0xKSB7XG4gICAgICAgICAgICAgIHRoaXMudmlld0NvbnRhaW5lclJlZi5pbnNlcnQodGhpcy52aWV3UmVmISk7XG4gICAgICAgICAgICAgIHRoaXMudmlld1JlZi5tYXJrRm9yQ2hlY2soKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGV2ZW50U3RhdGUgPT09IEhvdmVyQ29udGVudFN0YXRlLk9OKSB7XG4gICAgICAgICAgICAgIHRoaXMubWFrZUVsZW1lbnRWaXNpYmxlKHRoaXMudmlld1JlZi5yb290Tm9kZXNbMF0gYXMgSFRNTEVsZW1lbnQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdGhpcy5tYWtlRWxlbWVudEhpZGRlbkJ1dEZvY3VzYWJsZSh0aGlzLnZpZXdSZWYucm9vdE5vZGVzWzBdIGFzIEhUTUxFbGVtZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMudmlld1JlZikge1xuICAgICAgICAgICAgdGhpcy52aWV3Q29udGFpbmVyUmVmLmRldGFjaCh0aGlzLnZpZXdDb250YWluZXJSZWYuaW5kZXhPZih0aGlzLnZpZXdSZWYpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICB9XG59XG5cbi8qKlxuICogT3BlbnMgdGhlIGNsb3Nlc3QgZWRpdCBwb3BvdmVyIHRvIHRoaXMgZWxlbWVudCwgd2hldGhlciBpdCdzIGFzc29jaWF0ZWQgd2l0aCB0aGlzIGV4YWN0XG4gKiBlbGVtZW50IG9yIGFuIGFuY2VzdG9yIGVsZW1lbnQuXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tjZGtFZGl0T3Blbl0nLFxufSlcbmV4cG9ydCBjbGFzcyBDZGtFZGl0T3BlbiB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJvdGVjdGVkIHJlYWRvbmx5IGVsZW1lbnRSZWY6IEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+LFxuICAgICAgcHJvdGVjdGVkIHJlYWRvbmx5IGVkaXRFdmVudERpc3BhdGNoZXI6IEVkaXRFdmVudERpc3BhdGNoZXIpIHtcblxuICAgIGNvbnN0IG5hdGl2ZUVsZW1lbnQgPSBlbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQ7XG5cbiAgICAvLyBQcmV2ZW50IGFjY2lkZW50YWwgZm9ybSBzdWJtaXRzLlxuICAgIGlmIChuYXRpdmVFbGVtZW50Lm5vZGVOYW1lID09PSAnQlVUVE9OJyAmJiAhbmF0aXZlRWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3R5cGUnKSkge1xuICAgICAgbmF0aXZlRWxlbWVudC5zZXRBdHRyaWJ1dGUoJ3R5cGUnLCAnYnV0dG9uJyk7XG4gICAgfVxuICB9XG5cbiAgLy8gSW4gSXZ5IHRoZSBgaG9zdGAgbWV0YWRhdGEgd2lsbCBiZSBtZXJnZWQsIHdoZXJlYXMgaW4gVmlld0VuZ2luZSBpdCBpcyBvdmVycmlkZGVuLiBJbiBvcmRlclxuICAvLyB0byBhdm9pZCBkb3VibGUgZXZlbnQgbGlzdGVuZXJzLCB3ZSBuZWVkIHRvIHVzZSBgSG9zdExpc3RlbmVyYC4gT25jZSBJdnkgaXMgdGhlIGRlZmF1bHQsIHdlXG4gIC8vIGNhbiBtb3ZlIHRoaXMgYmFjayBpbnRvIGBob3N0YC5cbiAgLy8gdHNsaW50OmRpc2FibGU6bm8taG9zdC1kZWNvcmF0b3ItaW4tY29uY3JldGVcbiAgQEhvc3RMaXN0ZW5lcignY2xpY2snLCBbJyRldmVudCddKVxuICBvcGVuRWRpdChldnQ6IEV2ZW50KTogdm9pZCB7XG4gICAgdGhpcy5lZGl0RXZlbnREaXNwYXRjaGVyLmVkaXRpbmcubmV4dChjbG9zZXN0KHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50ISwgQ0VMTF9TRUxFQ1RPUikpO1xuICAgIGV2dC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgfVxufVxuIl19