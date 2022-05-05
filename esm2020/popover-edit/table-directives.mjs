import { TemplatePortal } from '@angular/cdk/portal';
import { Directive, ElementRef, NgZone, TemplateRef, ViewContainerRef, } from '@angular/core';
import { fromEvent, fromEventPattern, merge, Subject } from 'rxjs';
import { filter, map, mapTo, share, startWith, takeUntil, throttleTime, withLatestFrom, } from 'rxjs/operators';
import { CELL_SELECTOR, EDIT_PANE_CLASS, EDIT_PANE_SELECTOR, ROW_SELECTOR } from './constants';
import { EditEventDispatcher } from './edit-event-dispatcher';
import { EditServices } from './edit-services';
import { FocusDispatcher } from './focus-dispatcher';
import { FocusEscapeNotifierFactory, } from './focus-escape-notifier';
import { closest } from './polyfill';
import * as i0 from "@angular/core";
import * as i1 from "./edit-event-dispatcher";
import * as i2 from "./focus-dispatcher";
import * as i3 from "./edit-services";
import * as i4 from "./focus-escape-notifier";
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
            fromEvent(element, 'mouseover')
                .pipe(toClosest(ROW_SELECTOR), takeUntil(this.destroyed))
                .subscribe(this.editEventDispatcher.hovering);
            fromEvent(element, 'mouseleave')
                .pipe(mapTo(null), takeUntil(this.destroyed))
                .subscribe(this.editEventDispatcher.hovering);
            fromEvent(element, 'mousemove')
                .pipe(throttleTime(MOUSE_MOVE_THROTTLE_TIME_MS), toClosest(ROW_SELECTOR), takeUntil(this.destroyed))
                .subscribe(this.editEventDispatcher.mouseMove);
            // Track focus within the table to hide/show/make focusable hover content.
            fromEventPattern(handler => element.addEventListener('focus', handler, true), handler => element.removeEventListener('focus', handler, true))
                .pipe(toClosest(ROW_SELECTOR), share(), takeUntil(this.destroyed))
                .subscribe(this.editEventDispatcher.focused);
            merge(fromEventPattern(handler => element.addEventListener('blur', handler, true), handler => element.removeEventListener('blur', handler, true)), fromEvent(element, 'keydown').pipe(filter(event => event.key === 'Escape')))
                .pipe(mapTo(null), share(), takeUntil(this.destroyed))
                .subscribe(this.editEventDispatcher.focused);
            // Keep track of rows within the table. This is used to know which rows with hover content
            // are first or last in the table. They are kept focusable in case focus enters from above
            // or below the table.
            this.ngZone.onStable
                .pipe(
            // Optimization: ignore dom changes while focus is within the table as we already
            // ensure that rows above and below the focused/active row are tabbable.
            withLatestFrom(this.editEventDispatcher.editingOrFocused), filter(([_, activeRow]) => activeRow == null), map(() => element.querySelectorAll(ROW_SELECTOR)), share(), takeUntil(this.destroyed))
                .subscribe(this.editEventDispatcher.allRows);
            fromEvent(element, 'keydown')
                .pipe(filter(event => event.key === 'Enter'), toClosest(CELL_SELECTOR), takeUntil(this.destroyed))
                .subscribe(this.editEventDispatcher.editing);
            // Keydown must be used here or else key autorepeat does not work properly on some platforms.
            fromEvent(element, 'keydown')
                .pipe(takeUntil(this.destroyed))
                .subscribe(this.focusDispatcher.keyObserver);
        });
    }
}
CdkEditable.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.0.0-next.16", ngImport: i0, type: CdkEditable, deps: [{ token: i0.ElementRef }, { token: i1.EditEventDispatcher }, { token: i2.FocusDispatcher }, { token: i0.NgZone }], target: i0.ɵɵFactoryTarget.Directive });
CdkEditable.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.0.0-next.16", type: CdkEditable, selector: "table[editable], cdk-table[editable], mat-table[editable]", providers: [EditEventDispatcher, EditServices], ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.0.0-next.16", ngImport: i0, type: CdkEditable, decorators: [{
            type: Directive,
            args: [{
                    selector: 'table[editable], cdk-table[editable], mat-table[editable]',
                    providers: [EditEventDispatcher, EditServices],
                }]
        }], ctorParameters: function () { return [{ type: i0.ElementRef }, { type: i1.EditEventDispatcher }, { type: i2.FocusDispatcher }, { type: i0.NgZone }]; } });
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
        this.services.editEventDispatcher
            .editingCell(this.elementRef.nativeElement)
            .pipe(takeUntil(this.destroyed))
            .subscribe(open => {
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
        if (closest(document.activeElement, EDIT_PANE_SELECTOR) === this.overlayRef.overlayElement) {
            this.elementRef.nativeElement.focus();
        }
    }
}
CdkPopoverEdit.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.0.0-next.16", ngImport: i0, type: CdkPopoverEdit, deps: [{ token: i3.EditServices }, { token: i0.ElementRef }, { token: i0.ViewContainerRef }], target: i0.ɵɵFactoryTarget.Directive });
CdkPopoverEdit.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.0.0-next.16", type: CdkPopoverEdit, selector: "[cdkPopoverEdit]:not([cdkPopoverEditTabOut])", inputs: { template: ["cdkPopoverEdit", "template"], context: ["cdkPopoverEditContext", "context"], colspan: ["cdkPopoverEditColspan", "colspan"], disabled: ["cdkPopoverEditDisabled", "disabled"] }, host: { properties: { "attr.tabindex": "disabled ? null : 0", "attr.aria-haspopup": "!disabled" }, classAttribute: "cdk-popover-edit-cell" }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.0.0-next.16", ngImport: i0, type: CdkPopoverEdit, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkPopoverEdit]:not([cdkPopoverEditTabOut])',
                    host: POPOVER_EDIT_HOST_BINDINGS,
                    inputs: POPOVER_EDIT_INPUTS,
                }]
        }], ctorParameters: function () { return [{ type: i3.EditServices }, { type: i0.ElementRef }, { type: i0.ViewContainerRef }]; } });
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
        this.focusTrap
            .escapes()
            .pipe(takeUntil(this.destroyed))
            .subscribe(direction => {
            if (this.services.editEventDispatcher.editRef) {
                this.services.editEventDispatcher.editRef.blur();
            }
            this.services.focusDispatcher.moveFocusHorizontally(closest(this.elementRef.nativeElement, CELL_SELECTOR), direction === 0 /* FocusEscapeNotifierDirection.START */ ? -1 : 1);
            this.closeEditOverlay();
        });
    }
}
CdkPopoverEditTabOut.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.0.0-next.16", ngImport: i0, type: CdkPopoverEditTabOut, deps: [{ token: i0.ElementRef }, { token: i0.ViewContainerRef }, { token: i3.EditServices }, { token: i4.FocusEscapeNotifierFactory }], target: i0.ɵɵFactoryTarget.Directive });
CdkPopoverEditTabOut.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.0.0-next.16", type: CdkPopoverEditTabOut, selector: "[cdkPopoverEdit][cdkPopoverEditTabOut]", inputs: { template: ["cdkPopoverEdit", "template"], context: ["cdkPopoverEditContext", "context"], colspan: ["cdkPopoverEditColspan", "colspan"], disabled: ["cdkPopoverEditDisabled", "disabled"] }, host: { properties: { "attr.tabindex": "disabled ? null : 0", "attr.aria-haspopup": "!disabled" }, classAttribute: "cdk-popover-edit-cell" }, usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.0.0-next.16", ngImport: i0, type: CdkPopoverEditTabOut, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkPopoverEdit][cdkPopoverEditTabOut]',
                    host: POPOVER_EDIT_HOST_BINDINGS,
                    inputs: POPOVER_EDIT_INPUTS,
                }]
        }], ctorParameters: function () { return [{ type: i0.ElementRef }, { type: i0.ViewContainerRef }, { type: i3.EditServices }, { type: i4.FocusEscapeNotifierFactory }]; } });
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
    initElement(_) { }
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
        this.services.editEventDispatcher
            .hoverOrFocusOnRow(this._row)
            .pipe(takeUntil(this.destroyed))
            .subscribe(eventState => {
            // When in FOCUSABLE state, add the hover content to the dom but make it transparent so
            // that it is in the tab order relative to the currently focused row.
            if (eventState === 2 /* HoverContentState.ON */ || eventState === 1 /* HoverContentState.FOCUSABLE */) {
                if (!this.viewRef) {
                    this.viewRef = this.viewContainerRef.createEmbeddedView(this.templateRef, {});
                    this.initElement(this.viewRef.rootNodes[0]);
                    this.viewRef.markForCheck();
                }
                else if (this.viewContainerRef.indexOf(this.viewRef) === -1) {
                    this.viewContainerRef.insert(this.viewRef);
                    this.viewRef.markForCheck();
                }
                if (eventState === 2 /* HoverContentState.ON */) {
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
CdkRowHoverContent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.0.0-next.16", ngImport: i0, type: CdkRowHoverContent, deps: [{ token: i3.EditServices }, { token: i0.ElementRef }, { token: i0.TemplateRef }, { token: i0.ViewContainerRef }], target: i0.ɵɵFactoryTarget.Directive });
CdkRowHoverContent.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.0.0-next.16", type: CdkRowHoverContent, selector: "[cdkRowHoverContent]", ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.0.0-next.16", ngImport: i0, type: CdkRowHoverContent, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkRowHoverContent]',
                }]
        }], ctorParameters: function () { return [{ type: i3.EditServices }, { type: i0.ElementRef }, { type: i0.TemplateRef }, { type: i0.ViewContainerRef }]; } });
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
    openEdit(evt) {
        this.editEventDispatcher.editing.next(closest(this.elementRef.nativeElement, CELL_SELECTOR));
        evt.stopPropagation();
    }
}
CdkEditOpen.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.0.0-next.16", ngImport: i0, type: CdkEditOpen, deps: [{ token: i0.ElementRef }, { token: i1.EditEventDispatcher }], target: i0.ɵɵFactoryTarget.Directive });
CdkEditOpen.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.0.0-next.16", type: CdkEditOpen, selector: "[cdkEditOpen]", host: { listeners: { "click": "openEdit($event)" } }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.0.0-next.16", ngImport: i0, type: CdkEditOpen, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkEditOpen]',
                    host: {
                        '(click)': 'openEdit($event)',
                    },
                }]
        }], ctorParameters: function () { return [{ type: i0.ElementRef }, { type: i1.EditEventDispatcher }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFibGUtZGlyZWN0aXZlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL3BvcG92ZXItZWRpdC90YWJsZS1kaXJlY3RpdmVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQVNBLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUNuRCxPQUFPLEVBRUwsU0FBUyxFQUNULFVBQVUsRUFFVixNQUFNLEVBRU4sV0FBVyxFQUNYLGdCQUFnQixHQUNqQixNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUMsU0FBUyxFQUFFLGdCQUFnQixFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDakUsT0FBTyxFQUNMLE1BQU0sRUFDTixHQUFHLEVBQ0gsS0FBSyxFQUNMLEtBQUssRUFDTCxTQUFTLEVBQ1QsU0FBUyxFQUNULFlBQVksRUFDWixjQUFjLEdBQ2YsTUFBTSxnQkFBZ0IsQ0FBQztBQUV4QixPQUFPLEVBQUMsYUFBYSxFQUFFLGVBQWUsRUFBRSxrQkFBa0IsRUFBRSxZQUFZLEVBQUMsTUFBTSxhQUFhLENBQUM7QUFDN0YsT0FBTyxFQUFDLG1CQUFtQixFQUFvQixNQUFNLHlCQUF5QixDQUFDO0FBQy9FLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUM3QyxPQUFPLEVBQUMsZUFBZSxFQUFDLE1BQU0sb0JBQW9CLENBQUM7QUFDbkQsT0FBTyxFQUdMLDBCQUEwQixHQUMzQixNQUFNLHlCQUF5QixDQUFDO0FBQ2pDLE9BQU8sRUFBQyxPQUFPLEVBQUMsTUFBTSxZQUFZLENBQUM7Ozs7OztBQWFuQywrQ0FBK0M7QUFDL0MsTUFBTSwyQkFBMkIsR0FBRyxFQUFFLENBQUM7QUFFdkM7Ozs7R0FJRztBQUtILE1BQU0sT0FBTyxXQUFXO0lBR3RCLFlBQ3FCLFVBQXNCLEVBQ3RCLG1CQUEwRCxFQUMxRCxlQUFnQyxF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Q0FBeUI7UUFDbkMsd0JBQW1CLEdBQW5CLG1CQUFtQixDQUF1QztRQUU3RSxNQUFNLGFBQWEsR0FBRyxVQUFVLENBQUMsYUFBYSxDQUFDO1FBRS9DLG1DQUFtQztRQUNuQyxJQUFJLGFBQWEsQ0FBQyxRQUFRLEtBQUssUUFBUSxJQUFJLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUM5RSxhQUFhLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQztTQUM5QztJQUNILENBQUM7SUFFRCxRQUFRLENBQUMsR0FBVTtRQUNqQixJQUFJLENBQUMsbUJBQW1CLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxhQUFjLEVBQUUsYUFBYSxDQUFDLENBQUMsQ0FBQztRQUM5RixHQUFHLENBQUMsZUFBZSxFQUFFLENBQUM7SUFDeEIsQ0FBQzs7Z0hBaEJVLFdBQVc7b0dBQVgsV0FBVzttR0FBWCxXQUFXO2tCQU52QixTQUFTO21CQUFDO29CQUNULFFBQVEsRUFBRSxlQUFlO29CQUN6QixJQUFJLEVBQUU7d0JBQ0osU0FBUyxFQUFFLGtCQUFrQjtxQkFDOUI7aUJBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7Rm9jdXNUcmFwfSBmcm9tICdAYW5ndWxhci9jZGsvYTExeSc7XG5pbXBvcnQge092ZXJsYXlSZWYsIFBvc2l0aW9uU3RyYXRlZ3l9IGZyb20gJ0Bhbmd1bGFyL2Nkay9vdmVybGF5JztcbmltcG9ydCB7VGVtcGxhdGVQb3J0YWx9IGZyb20gJ0Bhbmd1bGFyL2Nkay9wb3J0YWwnO1xuaW1wb3J0IHtcbiAgQWZ0ZXJWaWV3SW5pdCxcbiAgRGlyZWN0aXZlLFxuICBFbGVtZW50UmVmLFxuICBFbWJlZGRlZFZpZXdSZWYsXG4gIE5nWm9uZSxcbiAgT25EZXN0cm95LFxuICBUZW1wbGF0ZVJlZixcbiAgVmlld0NvbnRhaW5lclJlZixcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge2Zyb21FdmVudCwgZnJvbUV2ZW50UGF0dGVybiwgbWVyZ2UsIFN1YmplY3R9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHtcbiAgZmlsdGVyLFxuICBtYXAsXG4gIG1hcFRvLFxuICBzaGFyZSxcbiAgc3RhcnRXaXRoLFxuICB0YWtlVW50aWwsXG4gIHRocm90dGxlVGltZSxcbiAgd2l0aExhdGVzdEZyb20sXG59IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcblxuaW1wb3J0IHtDRUxMX1NFTEVDVE9SLCBFRElUX1BBTkVfQ0xBU1MsIEVESVRfUEFORV9TRUxFQ1RPUiwgUk9XX1NFTEVDVE9SfSBmcm9tICcuL2NvbnN0YW50cyc7XG5pbXBvcnQge0VkaXRFdmVudERpc3BhdGNoZXIsIEhvdmVyQ29udGVudFN0YXRlfSBmcm9tICcuL2VkaXQtZXZlbnQtZGlzcGF0Y2hlcic7XG5pbXBvcnQge0VkaXRTZXJ2aWNlc30gZnJvbSAnLi9lZGl0LXNlcnZpY2VzJztcbmltcG9ydCB7Rm9jdXNEaXNwYXRjaGVyfSBmcm9tICcuL2ZvY3VzLWRpc3BhdGNoZXInO1xuaW1wb3J0IHtcbiAgRm9jdXNFc2NhcGVOb3RpZmllcixcbiAgRm9jdXNFc2NhcGVOb3RpZmllckRpcmVjdGlvbixcbiAgRm9jdXNFc2NhcGVOb3RpZmllckZhY3RvcnksXG59IGZyb20gJy4vZm9jdXMtZXNjYXBlLW5vdGlmaWVyJztcbmltcG9ydCB7Y2xvc2VzdH0gZnJvbSAnLi9wb2x5ZmlsbCc7XG5pbXBvcnQge0VkaXRSZWZ9IGZyb20gJy4vZWRpdC1yZWYnO1xuXG4vKipcbiAqIERlc2NyaWJlcyB0aGUgbnVtYmVyIG9mIGNvbHVtbnMgYmVmb3JlIGFuZCBhZnRlciB0aGUgb3JpZ2luYXRpbmcgY2VsbCB0aGF0IHRoZVxuICogZWRpdCBwb3B1cCBzaG91bGQgc3Bhbi4gSW4gbGVmdCB0byByaWdodCBsb2NhbGVzLCBiZWZvcmUgbWVhbnMgbGVmdCBhbmQgYWZ0ZXIgbWVhbnNcbiAqIHJpZ2h0LiBJbiByaWdodCB0byBsZWZ0IGxvY2FsZXMgYmVmb3JlIG1lYW5zIHJpZ2h0IGFuZCBhZnRlciBtZWFucyBsZWZ0LlxuICovXG5leHBvcnQgaW50ZXJmYWNlIENka1BvcG92ZXJFZGl0Q29sc3BhbiB7XG4gIGJlZm9yZT86IG51bWJlcjtcbiAgYWZ0ZXI/OiBudW1iZXI7XG59XG5cbi8qKiBVc2VkIGZvciByYXRlLWxpbWl0aW5nIG1vdXNlbW92ZSBldmVudHMuICovXG5jb25zdCBNT1VTRV9NT1ZFX1RIUk9UVExFX1RJTUVfTVMgPSAxMDtcblxuLyoqXG4gKiBBIGRpcmVjdGl2ZSB0aGF0IG11c3QgYmUgYXR0YWNoZWQgdG8gZW5hYmxlIGVkaXRhYmlsaXR5IG9uIGEgdGFibGUuXG4gKiBJdCBpcyByZXNwb25zaWJsZSBmb3Igc2V0dGluZyB1cCBkZWxlZ2F0ZWQgZXZlbnQgaGFuZGxlcnMgYW5kIHByb3ZpZGluZyB0aGVcbiAqIEVkaXRFdmVudERpc3BhdGNoZXIgc2VydmljZSBmb3IgdXNlIGJ5IHRoZSBvdGhlciBlZGl0IGRpcmVjdGl2ZXMuXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ3RhYmxlW2VkaXRhYmxlXSwgY2RrLXRhYmxlW2VkaXRhYmxlXSwgbWF0LXRhYmxlW2VkaXRhYmxlXScsXG4gIHByb3ZpZGVyczogW0VkaXRFdmVudERpc3BhdGNoZXIsIEVkaXRTZXJ2aWNlc10sXG59KVxuZXhwb3J0IGNsYXNzIENka0VkaXRhYmxlIGltcGxlbWVudHMgQWZ0ZXJWaWV3SW5pdCwgT25EZXN0cm95IHtcbiAgcHJvdGVjdGVkIHJlYWRvbmx5IGRlc3Ryb3llZCA9IG5ldyBTdWJqZWN0PHZvaWQ+KCk7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJvdGVjdGVkIHJlYWRvbmx5IGVsZW1lbnRSZWY6IEVsZW1lbnRSZWYsXG4gICAgcHJvdGVjdGVkIHJlYWRvbmx5IGVkaXRFdmVudERpc3BhdGNoZXI6IEVkaXRFdmVudERpc3BhdGNoZXI8RWRpdFJlZjx1bmtub3duPj4sXG4gICAgcHJvdGVjdGVkIHJlYWRvbmx5IGZvY3VzRGlzcGF0Y2hlcjogRm9jdXNEaXNwYXRjaGVyLFxuICAgIHByb3RlY3RlZCByZWFkb25seSBuZ1pvbmU6IE5nWm9uZSxcbiAgKSB7fVxuXG4gIG5nQWZ0ZXJWaWV3SW5pdCgpOiB2b2lkIHtcbiAgICB0aGlzLl9saXN0ZW5Gb3JUYWJsZUV2ZW50cygpO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgdGhpcy5kZXN0cm95ZWQubmV4dCgpO1xuICAgIHRoaXMuZGVzdHJveWVkLmNvbXBsZXRlKCk7XG4gIH1cblxuICBwcml2YXRlIF9saXN0ZW5Gb3JUYWJsZUV2ZW50cygpOiB2b2lkIHtcbiAgICBjb25zdCBlbGVtZW50ID0gdGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQ7XG4gICAgY29uc3QgdG9DbG9zZXN0ID0gKHNlbGVjdG9yOiBzdHJpbmcpID0+XG4gICAgICBtYXAoKGV2ZW50OiBVSUV2ZW50KSA9PiBjbG9zZXN0KGV2ZW50LnRhcmdldCwgc2VsZWN0b3IpKTtcblxuICAgIHRoaXMubmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgIC8vIFRyYWNrIG1vdXNlIG1vdmVtZW50IG92ZXIgdGhlIHRhYmxlIHRvIGhpZGUvc2hvdyBob3ZlciBjb250ZW50LlxuICAgICAgZnJvbUV2ZW50PE1vdXNlRXZlbnQ+KGVsZW1lbnQsICdtb3VzZW92ZXInKVxuICAgICAgICAucGlwZSh0b0Nsb3Nlc3QoUk9XX1NFTEVDVE9SKSwgdGFrZVVudGlsKHRoaXMuZGVzdHJveWVkKSlcbiAgICAgICAgLnN1YnNjcmliZSh0aGlzLmVkaXRFdmVudERpc3BhdGNoZXIuaG92ZXJpbmcpO1xuICAgICAgZnJvbUV2ZW50PE1vdXNlRXZlbnQ+KGVsZW1lbnQsICdtb3VzZWxlYXZlJylcbiAgICAgICAgLnBpcGUobWFwVG8obnVsbCksIHRha2VVbnRpbCh0aGlzLmRlc3Ryb3llZCkpXG4gICAgICAgIC5zdWJzY3JpYmUodGhpcy5lZGl0RXZlbnREaXNwYXRjaGVyLmhvdmVyaW5nKTtcbiAgICAgIGZyb21FdmVudDxNb3VzZUV2ZW50PihlbGVtZW50LCAnbW91c2Vtb3ZlJylcbiAgICAgICAgLnBpcGUoXG4gICAgICAgICAgdGhyb3R0bGVUaW1lKE1PVVNFX01PVkVfVEhST1RUTEVfVElNRV9NUyksXG4gICAgICAgICAgdG9DbG9zZXN0KFJPV19TRUxFQ1RPUiksXG4gICAgICAgICAgdGFrZVVudGlsKHRoaXMuZGVzdHJveWVkKSxcbiAgICAgICAgKVxuICAgICAgICAuc3Vic2NyaWJlKHRoaXMuZWRpdEV2ZW50RGlzcGF0Y2hlci5tb3VzZU1vdmUpO1xuXG4gICAgICAvLyBUcmFjayBmb2N1cyB3aXRoaW4gdGhlIHRhYmxlIHRvIGhpZGUvc2hvdy9tYWtlIGZvY3VzYWJsZSBob3ZlciBjb250ZW50LlxuICAgICAgZnJvbUV2ZW50UGF0dGVybjxGb2N1c0V2ZW50PihcbiAgICAgICAgaGFuZGxlciA9PiBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2ZvY3VzJywgaGFuZGxlciwgdHJ1ZSksXG4gICAgICAgIGhhbmRsZXIgPT4gZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdmb2N1cycsIGhhbmRsZXIsIHRydWUpLFxuICAgICAgKVxuICAgICAgICAucGlwZSh0b0Nsb3Nlc3QoUk9XX1NFTEVDVE9SKSwgc2hhcmUoKSwgdGFrZVVudGlsKHRoaXMuZGVzdHJveWVkKSlcbiAgICAgICAgLnN1YnNjcmliZSh0aGlzLmVkaXRFdmVudERpc3BhdGNoZXIuZm9jdXNlZCk7XG5cbiAgICAgIG1lcmdlKFxuICAgICAgICBmcm9tRXZlbnRQYXR0ZXJuPEZvY3VzRXZlbnQ+KFxuICAgICAgICAgIGhhbmRsZXIgPT4gZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdibHVyJywgaGFuZGxlciwgdHJ1ZSksXG4gICAgICAgICAgaGFuZGxlciA9PiBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2JsdXInLCBoYW5kbGVyLCB0cnVlKSxcbiAgICAgICAgKSxcbiAgICAgICAgZnJvbUV2ZW50PEtleWJvYXJkRXZlbnQ+KGVsZW1lbnQsICdrZXlkb3duJykucGlwZShmaWx0ZXIoZXZlbnQgPT4gZXZlbnQua2V5ID09PSAnRXNjYXBlJykpLFxuICAgICAgKVxuICAgICAgICAucGlwZShtYXBUbyhudWxsKSwgc2hhcmUoKSwgdGFrZVVudGlsKHRoaXMuZGVzdHJveWVkKSlcbiAgICAgICAgLnN1YnNjcmliZSh0aGlzLmVkaXRFdmVudERpc3BhdGNoZXIuZm9jdXNlZCk7XG5cbiAgICAgIC8vIEtlZXAgdHJhY2sgb2Ygcm93cyB3aXRoaW4gdGhlIHRhYmxlLiBUaGlzIGlzIHVzZWQgdG8ga25vdyB3aGljaCByb3dzIHdpdGggaG92ZXIgY29udGVudFxuICAgICAgLy8gYXJlIGZpcnN0IG9yIGxhc3QgaW4gdGhlIHRhYmxlLiBUaGV5IGFyZSBrZXB0IGZvY3VzYWJsZSBpbiBjYXNlIGZvY3VzIGVudGVycyBmcm9tIGFib3ZlXG4gICAgICAvLyBvciBiZWxvdyB0aGUgdGFibGUuXG4gICAgICB0aGlzLm5nWm9uZS5vblN0YWJsZVxuICAgICAgICAucGlwZShcbiAgICAgICAgICAvLyBPcHRpbWl6YXRpb246IGlnbm9yZSBkb20gY2hhbmdlcyB3aGlsZSBmb2N1cyBpcyB3aXRoaW4gdGhlIHRhYmxlIGFzIHdlIGFscmVhZHlcbiAgICAgICAgICAvLyBlbnN1cmUgdGhhdCByb3dzIGFib3ZlIGFuZCBiZWxvdyB0aGUgZm9jdXNlZC9hY3RpdmUgcm93IGFyZSB0YWJiYWJsZS5cbiAgICAgICAgICB3aXRoTGF0ZXN0RnJvbSh0aGlzLmVkaXRFdmVudERpc3BhdGNoZXIuZWRpdGluZ09yRm9jdXNlZCksXG4gICAgICAgICAgZmlsdGVyKChbXywgYWN0aXZlUm93XSkgPT4gYWN0aXZlUm93ID09IG51bGwpLFxuICAgICAgICAgIG1hcCgoKSA9PiBlbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoUk9XX1NFTEVDVE9SKSksXG4gICAgICAgICAgc2hhcmUoKSxcbiAgICAgICAgICB0YWtlVW50aWwodGhpcy5kZXN0cm95ZWQpLFxuICAgICAgICApXG4gICAgICAgIC5zdWJzY3JpYmUodGhpcy5lZGl0RXZlbnREaXNwYXRjaGVyLmFsbFJvd3MpO1xuXG4gICAgICBmcm9tRXZlbnQ8S2V5Ym9hcmRFdmVudD4oZWxlbWVudCwgJ2tleWRvd24nKVxuICAgICAgICAucGlwZShcbiAgICAgICAgICBmaWx0ZXIoZXZlbnQgPT4gZXZlbnQua2V5ID09PSAnRW50ZXInKSxcbiAgICAgICAgICB0b0Nsb3Nlc3QoQ0VMTF9TRUxFQ1RPUiksXG4gICAgICAgICAgdGFrZVVudGlsKHRoaXMuZGVzdHJveWVkKSxcbiAgICAgICAgKVxuICAgICAgICAuc3Vic2NyaWJlKHRoaXMuZWRpdEV2ZW50RGlzcGF0Y2hlci5lZGl0aW5nKTtcblxuICAgICAgLy8gS2V5ZG93biBtdXN0IGJlIHVzZWQgaGVyZSBvciBlbHNlIGtleSBhdXRvcmVwZWF0IGRvZXMgbm90IHdvcmsgcHJvcGVybHkgb24gc29tZSBwbGF0Zm9ybXMuXG4gICAgICBmcm9tRXZlbnQ8S2V5Ym9hcmRFdmVudD4oZWxlbWVudCwgJ2tleWRvd24nKVxuICAgICAgICAucGlwZSh0YWtlVW50aWwodGhpcy5kZXN0cm95ZWQpKVxuICAgICAgICAuc3Vic2NyaWJlKHRoaXMuZm9jdXNEaXNwYXRjaGVyLmtleU9ic2VydmVyKTtcbiAgICB9KTtcbiAgfVxufVxuXG5jb25zdCBQT1BPVkVSX0VESVRfSE9TVF9CSU5ESU5HUyA9IHtcbiAgJ1thdHRyLnRhYmluZGV4XSc6ICdkaXNhYmxlZCA/IG51bGwgOiAwJyxcbiAgJ2NsYXNzJzogJ2Nkay1wb3BvdmVyLWVkaXQtY2VsbCcsXG4gICdbYXR0ci5hcmlhLWhhc3BvcHVwXSc6ICchZGlzYWJsZWQnLFxufTtcblxuY29uc3QgUE9QT1ZFUl9FRElUX0lOUFVUUyA9IFtcbiAgJ3RlbXBsYXRlOiBjZGtQb3BvdmVyRWRpdCcsXG4gICdjb250ZXh0OiBjZGtQb3BvdmVyRWRpdENvbnRleHQnLFxuICAnY29sc3BhbjogY2RrUG9wb3ZlckVkaXRDb2xzcGFuJyxcbiAgJ2Rpc2FibGVkOiBjZGtQb3BvdmVyRWRpdERpc2FibGVkJyxcbl07XG5cbi8qKlxuICogQXR0YWNoZXMgYW4gbmctdGVtcGxhdGUgdG8gYSBjZWxsIGFuZCBzaG93cyBpdCB3aGVuIGluc3RydWN0ZWQgdG8gYnkgdGhlXG4gKiBFZGl0RXZlbnREaXNwYXRjaGVyIHNlcnZpY2UuXG4gKiBNYWtlcyB0aGUgY2VsbCBmb2N1c2FibGUuXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tjZGtQb3BvdmVyRWRpdF06bm90KFtjZGtQb3BvdmVyRWRpdFRhYk91dF0pJyxcbiAgaG9zdDogUE9QT1ZFUl9FRElUX0hPU1RfQklORElOR1MsXG4gIGlucHV0czogUE9QT1ZFUl9FRElUX0lOUFVUUyxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrUG9wb3ZlckVkaXQ8Qz4gaW1wbGVtZW50cyBBZnRlclZpZXdJbml0LCBPbkRlc3Ryb3kge1xuICAvKiogVGhlIGVkaXQgbGVucyB0ZW1wbGF0ZSBzaG93biBvdmVyIHRoZSBjZWxsIG9uIGVkaXQuICovXG4gIHRlbXBsYXRlOiBUZW1wbGF0ZVJlZjxhbnk+IHwgbnVsbCA9IG51bGw7XG5cbiAgLyoqXG4gICAqIEltcGxpY2l0IGNvbnRleHQgdG8gcGFzcyBhbG9uZyB0byB0aGUgdGVtcGxhdGUuIENhbiBiZSBvbWl0dGVkIGlmIHRoZSB0ZW1wbGF0ZVxuICAgKiBpcyBkZWZpbmVkIHdpdGhpbiB0aGUgY2VsbC5cbiAgICovXG4gIGNvbnRleHQ/OiBDO1xuXG4gIC8qKlxuICAgKiBTcGVjaWZpZXMgdGhhdCB0aGUgcG9wdXAgc2hvdWxkIGNvdmVyIGFkZGl0aW9uYWwgdGFibGUgY2VsbHMgYmVmb3JlIGFuZC9vciBhZnRlclxuICAgKiB0aGlzIG9uZS5cbiAgICovXG4gIGdldCBjb2xzcGFuKCk6IENka1BvcG92ZXJFZGl0Q29sc3BhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2NvbHNwYW47XG4gIH1cbiAgc2V0IGNvbHNwYW4odmFsdWU6IENka1BvcG92ZXJFZGl0Q29sc3Bhbikge1xuICAgIHRoaXMuX2NvbHNwYW4gPSB2YWx1ZTtcblxuICAgIC8vIFJlY29tcHV0ZSBwb3NpdGlvbmluZyB3aGVuIHRoZSBjb2xzcGFuIGNoYW5nZXMuXG4gICAgaWYgKHRoaXMub3ZlcmxheVJlZikge1xuICAgICAgdGhpcy5vdmVybGF5UmVmLnVwZGF0ZVBvc2l0aW9uU3RyYXRlZ3kodGhpcy5fZ2V0UG9zaXRpb25TdHJhdGVneSgpKTtcblxuICAgICAgaWYgKHRoaXMub3ZlcmxheVJlZi5oYXNBdHRhY2hlZCgpKSB7XG4gICAgICAgIHRoaXMuX3VwZGF0ZU92ZXJsYXlTaXplKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHByaXZhdGUgX2NvbHNwYW46IENka1BvcG92ZXJFZGl0Q29sc3BhbiA9IHt9O1xuXG4gIC8qKiBXaGV0aGVyIHBvcG92ZXIgZWRpdCBpcyBkaXNhYmxlZCBmb3IgdGhpcyBjZWxsLiAqL1xuICBnZXQgZGlzYWJsZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2Rpc2FibGVkO1xuICB9XG4gIHNldCBkaXNhYmxlZCh2YWx1ZTogYm9vbGVhbikge1xuICAgIHRoaXMuX2Rpc2FibGVkID0gdmFsdWU7XG5cbiAgICBpZiAodmFsdWUpIHtcbiAgICAgIHRoaXMuc2VydmljZXMuZWRpdEV2ZW50RGlzcGF0Y2hlci5kb25lRWRpdGluZ0NlbGwodGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQhKTtcbiAgICAgIHRoaXMuc2VydmljZXMuZWRpdEV2ZW50RGlzcGF0Y2hlci5kaXNhYmxlZENlbGxzLnNldCh0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCEsIHRydWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnNlcnZpY2VzLmVkaXRFdmVudERpc3BhdGNoZXIuZGlzYWJsZWRDZWxscy5kZWxldGUodGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQhKTtcbiAgICB9XG4gIH1cbiAgcHJpdmF0ZSBfZGlzYWJsZWQgPSBmYWxzZTtcblxuICBwcm90ZWN0ZWQgZm9jdXNUcmFwPzogRm9jdXNUcmFwO1xuICBwcm90ZWN0ZWQgb3ZlcmxheVJlZj86IE92ZXJsYXlSZWY7XG4gIHByb3RlY3RlZCByZWFkb25seSBkZXN0cm95ZWQgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByb3RlY3RlZCByZWFkb25seSBzZXJ2aWNlczogRWRpdFNlcnZpY2VzLFxuICAgIHByb3RlY3RlZCByZWFkb25seSBlbGVtZW50UmVmOiBFbGVtZW50UmVmLFxuICAgIHByb3RlY3RlZCByZWFkb25seSB2aWV3Q29udGFpbmVyUmVmOiBWaWV3Q29udGFpbmVyUmVmLFxuICApIHt9XG5cbiAgbmdBZnRlclZpZXdJbml0KCk6IHZvaWQge1xuICAgIHRoaXMuX3N0YXJ0TGlzdGVuaW5nVG9FZGl0RXZlbnRzKCk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLmRlc3Ryb3llZC5uZXh0KCk7XG4gICAgdGhpcy5kZXN0cm95ZWQuY29tcGxldGUoKTtcblxuICAgIGlmICh0aGlzLmZvY3VzVHJhcCkge1xuICAgICAgdGhpcy5mb2N1c1RyYXAuZGVzdHJveSgpO1xuICAgICAgdGhpcy5mb2N1c1RyYXAgPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMub3ZlcmxheVJlZikge1xuICAgICAgdGhpcy5vdmVybGF5UmVmLmRpc3Bvc2UoKTtcbiAgICB9XG4gIH1cblxuICBwcm90ZWN0ZWQgaW5pdEZvY3VzVHJhcCgpOiB2b2lkIHtcbiAgICB0aGlzLmZvY3VzVHJhcCA9IHRoaXMuc2VydmljZXMuZm9jdXNUcmFwRmFjdG9yeS5jcmVhdGUodGhpcy5vdmVybGF5UmVmIS5vdmVybGF5RWxlbWVudCk7XG4gIH1cblxuICBwcm90ZWN0ZWQgY2xvc2VFZGl0T3ZlcmxheSgpOiB2b2lkIHtcbiAgICB0aGlzLnNlcnZpY2VzLmVkaXRFdmVudERpc3BhdGNoZXIuZG9uZUVkaXRpbmdDZWxsKHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50ISk7XG4gIH1cblxuICBwcm90ZWN0ZWQgcGFuZWxDbGFzcygpOiBzdHJpbmcge1xuICAgIHJldHVybiBFRElUX1BBTkVfQ0xBU1M7XG4gIH1cblxuICBwcml2YXRlIF9zdGFydExpc3RlbmluZ1RvRWRpdEV2ZW50cygpOiB2b2lkIHtcbiAgICB0aGlzLnNlcnZpY2VzLmVkaXRFdmVudERpc3BhdGNoZXJcbiAgICAgIC5lZGl0aW5nQ2VsbCh0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCEpXG4gICAgICAucGlwZSh0YWtlVW50aWwodGhpcy5kZXN0cm95ZWQpKVxuICAgICAgLnN1YnNjcmliZShvcGVuID0+IHtcbiAgICAgICAgaWYgKG9wZW4gJiYgdGhpcy50ZW1wbGF0ZSkge1xuICAgICAgICAgIGlmICghdGhpcy5vdmVybGF5UmVmKSB7XG4gICAgICAgICAgICB0aGlzLl9jcmVhdGVFZGl0T3ZlcmxheSgpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHRoaXMuX3Nob3dFZGl0T3ZlcmxheSgpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMub3ZlcmxheVJlZikge1xuICAgICAgICAgIHRoaXMuX21heWJlUmV0dXJuRm9jdXNUb0NlbGwoKTtcblxuICAgICAgICAgIHRoaXMub3ZlcmxheVJlZi5kZXRhY2goKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gIH1cblxuICBwcml2YXRlIF9jcmVhdGVFZGl0T3ZlcmxheSgpOiB2b2lkIHtcbiAgICB0aGlzLm92ZXJsYXlSZWYgPSB0aGlzLnNlcnZpY2VzLm92ZXJsYXkuY3JlYXRlKHtcbiAgICAgIGRpc3Bvc2VPbk5hdmlnYXRpb246IHRydWUsXG4gICAgICBwYW5lbENsYXNzOiB0aGlzLnBhbmVsQ2xhc3MoKSxcbiAgICAgIHBvc2l0aW9uU3RyYXRlZ3k6IHRoaXMuX2dldFBvc2l0aW9uU3RyYXRlZ3koKSxcbiAgICAgIHNjcm9sbFN0cmF0ZWd5OiB0aGlzLnNlcnZpY2VzLm92ZXJsYXkuc2Nyb2xsU3RyYXRlZ2llcy5yZXBvc2l0aW9uKCksXG4gICAgICBkaXJlY3Rpb246IHRoaXMuc2VydmljZXMuZGlyZWN0aW9uYWxpdHksXG4gICAgfSk7XG5cbiAgICB0aGlzLmluaXRGb2N1c1RyYXAoKTtcbiAgICB0aGlzLm92ZXJsYXlSZWYub3ZlcmxheUVsZW1lbnQuc2V0QXR0cmlidXRlKCdhcmlhLXJvbGUnLCAnZGlhbG9nJyk7XG5cbiAgICB0aGlzLm92ZXJsYXlSZWYuZGV0YWNobWVudHMoKS5zdWJzY3JpYmUoKCkgPT4gdGhpcy5jbG9zZUVkaXRPdmVybGF5KCkpO1xuICB9XG5cbiAgcHJpdmF0ZSBfc2hvd0VkaXRPdmVybGF5KCk6IHZvaWQge1xuICAgIHRoaXMub3ZlcmxheVJlZiEuYXR0YWNoKFxuICAgICAgbmV3IFRlbXBsYXRlUG9ydGFsKHRoaXMudGVtcGxhdGUhLCB0aGlzLnZpZXdDb250YWluZXJSZWYsIHskaW1wbGljaXQ6IHRoaXMuY29udGV4dH0pLFxuICAgICk7XG5cbiAgICAvLyBXZSBoYXZlIHRvIGRlZmVyIHRyYXBwaW5nIGZvY3VzLCBiZWNhdXNlIGRvaW5nIHNvIHRvbyBlYXJseSBjYW4gY2F1c2UgdGhlIGZvcm0gaW5zaWRlXG4gICAgLy8gdGhlIG92ZXJsYXkgdG8gYmUgc3VibWl0dGVkIGltbWVkaWF0ZWx5IGlmIGl0IHdhcyBvcGVuZWQgb24gYW4gRW50ZXIga2V5ZG93biBldmVudC5cbiAgICB0aGlzLnNlcnZpY2VzLm5nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgdGhpcy5mb2N1c1RyYXAhLmZvY3VzSW5pdGlhbEVsZW1lbnQoKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgLy8gVXBkYXRlIHRoZSBzaXplIG9mIHRoZSBwb3B1cCBpbml0aWFsbHkgYW5kIG9uIHN1YnNlcXVlbnQgY2hhbmdlcyB0b1xuICAgIC8vIHNjcm9sbCBwb3NpdGlvbiBhbmQgdmlld3BvcnQgc2l6ZS5cbiAgICBtZXJnZSh0aGlzLnNlcnZpY2VzLnNjcm9sbERpc3BhdGNoZXIuc2Nyb2xsZWQoKSwgdGhpcy5zZXJ2aWNlcy52aWV3cG9ydFJ1bGVyLmNoYW5nZSgpKVxuICAgICAgLnBpcGUoc3RhcnRXaXRoKG51bGwpLCB0YWtlVW50aWwobWVyZ2UodGhpcy5vdmVybGF5UmVmIS5kZXRhY2htZW50cygpLCB0aGlzLmRlc3Ryb3llZCkpKVxuICAgICAgLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgIHRoaXMuX3VwZGF0ZU92ZXJsYXlTaXplKCk7XG4gICAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX2dldE92ZXJsYXlDZWxscygpOiBIVE1MRWxlbWVudFtdIHtcbiAgICBjb25zdCBjZWxsID0gY2xvc2VzdCh0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCEsIENFTExfU0VMRUNUT1IpIGFzIEhUTUxFbGVtZW50O1xuXG4gICAgaWYgKCF0aGlzLl9jb2xzcGFuLmJlZm9yZSAmJiAhdGhpcy5fY29sc3Bhbi5hZnRlcikge1xuICAgICAgcmV0dXJuIFtjZWxsXTtcbiAgICB9XG5cbiAgICBjb25zdCByb3cgPSBjbG9zZXN0KHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50ISwgUk9XX1NFTEVDVE9SKSE7XG4gICAgY29uc3Qgcm93Q2VsbHMgPSBBcnJheS5mcm9tKHJvdy5xdWVyeVNlbGVjdG9yQWxsKENFTExfU0VMRUNUT1IpKSBhcyBIVE1MRWxlbWVudFtdO1xuICAgIGNvbnN0IG93bkluZGV4ID0gcm93Q2VsbHMuaW5kZXhPZihjZWxsKTtcblxuICAgIHJldHVybiByb3dDZWxscy5zbGljZShcbiAgICAgIG93bkluZGV4IC0gKHRoaXMuX2NvbHNwYW4uYmVmb3JlIHx8IDApLFxuICAgICAgb3duSW5kZXggKyAodGhpcy5fY29sc3Bhbi5hZnRlciB8fCAwKSArIDEsXG4gICAgKTtcbiAgfVxuXG4gIHByaXZhdGUgX2dldFBvc2l0aW9uU3RyYXRlZ3koKTogUG9zaXRpb25TdHJhdGVneSB7XG4gICAgcmV0dXJuIHRoaXMuc2VydmljZXMucG9zaXRpb25GYWN0b3J5LnBvc2l0aW9uU3RyYXRlZ3lGb3JDZWxscyh0aGlzLl9nZXRPdmVybGF5Q2VsbHMoKSk7XG4gIH1cblxuICBwcml2YXRlIF91cGRhdGVPdmVybGF5U2l6ZSgpOiB2b2lkIHtcbiAgICB0aGlzLm92ZXJsYXlSZWYhLnVwZGF0ZVNpemUoXG4gICAgICB0aGlzLnNlcnZpY2VzLnBvc2l0aW9uRmFjdG9yeS5zaXplQ29uZmlnRm9yQ2VsbHModGhpcy5fZ2V0T3ZlcmxheUNlbGxzKCkpLFxuICAgICk7XG4gIH1cblxuICBwcml2YXRlIF9tYXliZVJldHVybkZvY3VzVG9DZWxsKCk6IHZvaWQge1xuICAgIGlmIChjbG9zZXN0KGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQsIEVESVRfUEFORV9TRUxFQ1RPUikgPT09IHRoaXMub3ZlcmxheVJlZiEub3ZlcmxheUVsZW1lbnQpIHtcbiAgICAgIHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50IS5mb2N1cygpO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEF0dGFjaGVzIGFuIG5nLXRlbXBsYXRlIHRvIGEgY2VsbCBhbmQgc2hvd3MgaXQgd2hlbiBpbnN0cnVjdGVkIHRvIGJ5IHRoZVxuICogRWRpdEV2ZW50RGlzcGF0Y2hlciBzZXJ2aWNlLlxuICogTWFrZXMgdGhlIGNlbGwgZm9jdXNhYmxlLlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbY2RrUG9wb3ZlckVkaXRdW2Nka1BvcG92ZXJFZGl0VGFiT3V0XScsXG4gIGhvc3Q6IFBPUE9WRVJfRURJVF9IT1NUX0JJTkRJTkdTLFxuICBpbnB1dHM6IFBPUE9WRVJfRURJVF9JTlBVVFMsXG59KVxuZXhwb3J0IGNsYXNzIENka1BvcG92ZXJFZGl0VGFiT3V0PEM+IGV4dGVuZHMgQ2RrUG9wb3ZlckVkaXQ8Qz4ge1xuICBwcm90ZWN0ZWQgb3ZlcnJpZGUgZm9jdXNUcmFwPzogRm9jdXNFc2NhcGVOb3RpZmllcjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBlbGVtZW50UmVmOiBFbGVtZW50UmVmLFxuICAgIHZpZXdDb250YWluZXJSZWY6IFZpZXdDb250YWluZXJSZWYsXG4gICAgc2VydmljZXM6IEVkaXRTZXJ2aWNlcyxcbiAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgZm9jdXNFc2NhcGVOb3RpZmllckZhY3Rvcnk6IEZvY3VzRXNjYXBlTm90aWZpZXJGYWN0b3J5LFxuICApIHtcbiAgICBzdXBlcihzZXJ2aWNlcywgZWxlbWVudFJlZiwgdmlld0NvbnRhaW5lclJlZik7XG4gIH1cblxuICBwcm90ZWN0ZWQgb3ZlcnJpZGUgaW5pdEZvY3VzVHJhcCgpOiB2b2lkIHtcbiAgICB0aGlzLmZvY3VzVHJhcCA9IHRoaXMuZm9jdXNFc2NhcGVOb3RpZmllckZhY3RvcnkuY3JlYXRlKHRoaXMub3ZlcmxheVJlZiEub3ZlcmxheUVsZW1lbnQpO1xuXG4gICAgdGhpcy5mb2N1c1RyYXBcbiAgICAgIC5lc2NhcGVzKClcbiAgICAgIC5waXBlKHRha2VVbnRpbCh0aGlzLmRlc3Ryb3llZCkpXG4gICAgICAuc3Vic2NyaWJlKGRpcmVjdGlvbiA9PiB7XG4gICAgICAgIGlmICh0aGlzLnNlcnZpY2VzLmVkaXRFdmVudERpc3BhdGNoZXIuZWRpdFJlZikge1xuICAgICAgICAgIHRoaXMuc2VydmljZXMuZWRpdEV2ZW50RGlzcGF0Y2hlci5lZGl0UmVmLmJsdXIoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc2VydmljZXMuZm9jdXNEaXNwYXRjaGVyLm1vdmVGb2N1c0hvcml6b250YWxseShcbiAgICAgICAgICBjbG9zZXN0KHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50ISwgQ0VMTF9TRUxFQ1RPUikgYXMgSFRNTEVsZW1lbnQsXG4gICAgICAgICAgZGlyZWN0aW9uID09PSBGb2N1c0VzY2FwZU5vdGlmaWVyRGlyZWN0aW9uLlNUQVJUID8gLTEgOiAxLFxuICAgICAgICApO1xuXG4gICAgICAgIHRoaXMuY2xvc2VFZGl0T3ZlcmxheSgpO1xuICAgICAgfSk7XG4gIH1cbn1cblxuLyoqXG4gKiBBIHN0cnVjdHVyYWwgZGlyZWN0aXZlIHRoYXQgc2hvd3MgaXRzIGNvbnRlbnRzIHdoZW4gdGhlIHRhYmxlIHJvdyBjb250YWluaW5nXG4gKiBpdCBpcyBob3ZlcmVkIG9yIHdoZW4gYW4gZWxlbWVudCBpbiB0aGUgcm93IGhhcyBmb2N1cy5cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW2Nka1Jvd0hvdmVyQ29udGVudF0nLFxufSlcbmV4cG9ydCBjbGFzcyBDZGtSb3dIb3ZlckNvbnRlbnQgaW1wbGVtZW50cyBBZnRlclZpZXdJbml0LCBPbkRlc3Ryb3kge1xuICBwcm90ZWN0ZWQgcmVhZG9ubHkgZGVzdHJveWVkID0gbmV3IFN1YmplY3Q8dm9pZD4oKTtcbiAgcHJvdGVjdGVkIHZpZXdSZWY6IEVtYmVkZGVkVmlld1JlZjxhbnk+IHwgbnVsbCA9IG51bGw7XG5cbiAgcHJpdmF0ZSBfcm93PzogRWxlbWVudDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgc2VydmljZXM6IEVkaXRTZXJ2aWNlcyxcbiAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgZWxlbWVudFJlZjogRWxlbWVudFJlZixcbiAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgdGVtcGxhdGVSZWY6IFRlbXBsYXRlUmVmPGFueT4sXG4gICAgcHJvdGVjdGVkIHJlYWRvbmx5IHZpZXdDb250YWluZXJSZWY6IFZpZXdDb250YWluZXJSZWYsXG4gICkge31cblxuICBuZ0FmdGVyVmlld0luaXQoKTogdm9pZCB7XG4gICAgdGhpcy5fcm93ID0gY2xvc2VzdCh0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCEsIFJPV19TRUxFQ1RPUikhO1xuXG4gICAgdGhpcy5zZXJ2aWNlcy5lZGl0RXZlbnREaXNwYXRjaGVyLnJlZ2lzdGVyUm93V2l0aEhvdmVyQ29udGVudCh0aGlzLl9yb3cpO1xuICAgIHRoaXMuX2xpc3RlbkZvckhvdmVyQW5kRm9jdXNFdmVudHMoKTtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCk6IHZvaWQge1xuICAgIHRoaXMuZGVzdHJveWVkLm5leHQoKTtcbiAgICB0aGlzLmRlc3Ryb3llZC5jb21wbGV0ZSgpO1xuXG4gICAgaWYgKHRoaXMudmlld1JlZikge1xuICAgICAgdGhpcy52aWV3UmVmLmRlc3Ryb3koKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fcm93KSB7XG4gICAgICB0aGlzLnNlcnZpY2VzLmVkaXRFdmVudERpc3BhdGNoZXIuZGVyZWdpc3RlclJvd1dpdGhIb3ZlckNvbnRlbnQodGhpcy5fcm93KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIGltbWVkaWF0ZWx5IGFmdGVyIHRoZSBob3ZlciBjb250ZW50IGlzIGNyZWF0ZWQgYW5kIGFkZGVkIHRvIHRoZSBkb20uXG4gICAqIEluIHRoZSBDREsgdmVyc2lvbiwgdGhpcyBpcyBhIG5vb3AgYnV0IHN1YmNsYXNzZXMgc3VjaCBhcyBNYXRSb3dIb3ZlckNvbnRlbnQgdXNlIHRoaXNcbiAgICogdG8gcHJlcGFyZS9zdHlsZSB0aGUgaW5zZXJ0ZWQgZWxlbWVudC5cbiAgICovXG4gIHByb3RlY3RlZCBpbml0RWxlbWVudChfOiBIVE1MRWxlbWVudCk6IHZvaWQge31cblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gdGhlIGhvdmVyIGNvbnRlbnQgbmVlZHMgdG8gYmUgZm9jdXNhYmxlIHRvIHByZXNlcnZlIGEgcmVhc29uYWJsZSB0YWIgb3JkZXJpbmdcbiAgICogYnV0IHNob3VsZCBub3QgeWV0IGJlIHNob3duLlxuICAgKi9cbiAgcHJvdGVjdGVkIG1ha2VFbGVtZW50SGlkZGVuQnV0Rm9jdXNhYmxlKGVsZW1lbnQ6IEhUTUxFbGVtZW50KTogdm9pZCB7XG4gICAgZWxlbWVudC5zdHlsZS5vcGFjaXR5ID0gJzAnO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIHRoZSBob3ZlciBjb250ZW50IG5lZWRzIHRvIGJlIGZvY3VzYWJsZSB0byBwcmVzZXJ2ZSBhIHJlYXNvbmFibGUgdGFiIG9yZGVyaW5nXG4gICAqIGJ1dCBzaG91bGQgbm90IHlldCBiZSBzaG93bi5cbiAgICovXG4gIHByb3RlY3RlZCBtYWtlRWxlbWVudFZpc2libGUoZWxlbWVudDogSFRNTEVsZW1lbnQpOiB2b2lkIHtcbiAgICBlbGVtZW50LnN0eWxlLm9wYWNpdHkgPSAnJztcbiAgfVxuXG4gIHByaXZhdGUgX2xpc3RlbkZvckhvdmVyQW5kRm9jdXNFdmVudHMoKTogdm9pZCB7XG4gICAgdGhpcy5zZXJ2aWNlcy5lZGl0RXZlbnREaXNwYXRjaGVyXG4gICAgICAuaG92ZXJPckZvY3VzT25Sb3codGhpcy5fcm93ISlcbiAgICAgIC5waXBlKHRha2VVbnRpbCh0aGlzLmRlc3Ryb3llZCkpXG4gICAgICAuc3Vic2NyaWJlKGV2ZW50U3RhdGUgPT4ge1xuICAgICAgICAvLyBXaGVuIGluIEZPQ1VTQUJMRSBzdGF0ZSwgYWRkIHRoZSBob3ZlciBjb250ZW50IHRvIHRoZSBkb20gYnV0IG1ha2UgaXQgdHJhbnNwYXJlbnQgc29cbiAgICAgICAgLy8gdGhhdCBpdCBpcyBpbiB0aGUgdGFiIG9yZGVyIHJlbGF0aXZlIHRvIHRoZSBjdXJyZW50bHkgZm9jdXNlZCByb3cuXG5cbiAgICAgICAgaWYgKGV2ZW50U3RhdGUgPT09IEhvdmVyQ29udGVudFN0YXRlLk9OIHx8IGV2ZW50U3RhdGUgPT09IEhvdmVyQ29udGVudFN0YXRlLkZPQ1VTQUJMRSkge1xuICAgICAgICAgIGlmICghdGhpcy52aWV3UmVmKSB7XG4gICAgICAgICAgICB0aGlzLnZpZXdSZWYgPSB0aGlzLnZpZXdDb250YWluZXJSZWYuY3JlYXRlRW1iZWRkZWRWaWV3KHRoaXMudGVtcGxhdGVSZWYsIHt9KTtcbiAgICAgICAgICAgIHRoaXMuaW5pdEVsZW1lbnQodGhpcy52aWV3UmVmLnJvb3ROb2Rlc1swXSBhcyBIVE1MRWxlbWVudCk7XG4gICAgICAgICAgICB0aGlzLnZpZXdSZWYubWFya0ZvckNoZWNrKCk7XG4gICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnZpZXdDb250YWluZXJSZWYuaW5kZXhPZih0aGlzLnZpZXdSZWYpID09PSAtMSkge1xuICAgICAgICAgICAgdGhpcy52aWV3Q29udGFpbmVyUmVmLmluc2VydCh0aGlzLnZpZXdSZWYhKTtcbiAgICAgICAgICAgIHRoaXMudmlld1JlZi5tYXJrRm9yQ2hlY2soKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoZXZlbnRTdGF0ZSA9PT0gSG92ZXJDb250ZW50U3RhdGUuT04pIHtcbiAgICAgICAgICAgIHRoaXMubWFrZUVsZW1lbnRWaXNpYmxlKHRoaXMudmlld1JlZi5yb290Tm9kZXNbMF0gYXMgSFRNTEVsZW1lbnQpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLm1ha2VFbGVtZW50SGlkZGVuQnV0Rm9jdXNhYmxlKHRoaXMudmlld1JlZi5yb290Tm9kZXNbMF0gYXMgSFRNTEVsZW1lbnQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnZpZXdSZWYpIHtcbiAgICAgICAgICB0aGlzLnZpZXdDb250YWluZXJSZWYuZGV0YWNoKHRoaXMudmlld0NvbnRhaW5lclJlZi5pbmRleE9mKHRoaXMudmlld1JlZikpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgfVxufVxuXG4vKipcbiAqIE9wZW5zIHRoZSBjbG9zZXN0IGVkaXQgcG9wb3ZlciB0byB0aGlzIGVsZW1lbnQsIHdoZXRoZXIgaXQncyBhc3NvY2lhdGVkIHdpdGggdGhpcyBleGFjdFxuICogZWxlbWVudCBvciBhbiBhbmNlc3RvciBlbGVtZW50LlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbY2RrRWRpdE9wZW5dJyxcbiAgaG9zdDoge1xuICAgICcoY2xpY2spJzogJ29wZW5FZGl0KCRldmVudCknLFxuICB9LFxufSlcbmV4cG9ydCBjbGFzcyBDZGtFZGl0T3BlbiB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHByb3RlY3RlZCByZWFkb25seSBlbGVtZW50UmVmOiBFbGVtZW50UmVmPEhUTUxFbGVtZW50PixcbiAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgZWRpdEV2ZW50RGlzcGF0Y2hlcjogRWRpdEV2ZW50RGlzcGF0Y2hlcjxFZGl0UmVmPHVua25vd24+PixcbiAgKSB7XG4gICAgY29uc3QgbmF0aXZlRWxlbWVudCA9IGVsZW1lbnRSZWYubmF0aXZlRWxlbWVudDtcblxuICAgIC8vIFByZXZlbnQgYWNjaWRlbnRhbCBmb3JtIHN1Ym1pdHMuXG4gICAgaWYgKG5hdGl2ZUVsZW1lbnQubm9kZU5hbWUgPT09ICdCVVRUT04nICYmICFuYXRpdmVFbGVtZW50LmdldEF0dHJpYnV0ZSgndHlwZScpKSB7XG4gICAgICBuYXRpdmVFbGVtZW50LnNldEF0dHJpYnV0ZSgndHlwZScsICdidXR0b24nKTtcbiAgICB9XG4gIH1cblxuICBvcGVuRWRpdChldnQ6IEV2ZW50KTogdm9pZCB7XG4gICAgdGhpcy5lZGl0RXZlbnREaXNwYXRjaGVyLmVkaXRpbmcubmV4dChjbG9zZXN0KHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50ISwgQ0VMTF9TRUxFQ1RPUikpO1xuICAgIGV2dC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgfVxufVxuIl19