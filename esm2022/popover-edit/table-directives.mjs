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
            // Keydown must be used here or else key auto-repeat does not work properly on some platforms.
            fromEvent(element, 'keydown')
                .pipe(takeUntil(this.destroyed))
                .subscribe(this.focusDispatcher.keyObserver);
        });
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.0.0-rc.2", ngImport: i0, type: CdkEditable, deps: [{ token: i0.ElementRef }, { token: i1.EditEventDispatcher }, { token: i2.FocusDispatcher }, { token: i0.NgZone }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "16.0.0-rc.2", type: CdkEditable, selector: "table[editable], cdk-table[editable], mat-table[editable]", providers: [EditEventDispatcher, EditServices], ngImport: i0 }); }
}
export { CdkEditable };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.0.0-rc.2", ngImport: i0, type: CdkEditable, decorators: [{
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
class CdkPopoverEdit {
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.0.0-rc.2", ngImport: i0, type: CdkPopoverEdit, deps: [{ token: i3.EditServices }, { token: i0.ElementRef }, { token: i0.ViewContainerRef }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "16.0.0-rc.2", type: CdkPopoverEdit, selector: "[cdkPopoverEdit]:not([cdkPopoverEditTabOut])", inputs: { template: ["cdkPopoverEdit", "template"], context: ["cdkPopoverEditContext", "context"], colspan: ["cdkPopoverEditColspan", "colspan"], disabled: ["cdkPopoverEditDisabled", "disabled"] }, host: { properties: { "attr.tabindex": "disabled ? null : 0", "attr.aria-haspopup": "!disabled" }, classAttribute: "cdk-popover-edit-cell" }, ngImport: i0 }); }
}
export { CdkPopoverEdit };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.0.0-rc.2", ngImport: i0, type: CdkPopoverEdit, decorators: [{
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
class CdkPopoverEditTabOut extends CdkPopoverEdit {
    constructor(elementRef, viewContainerRef, services, focusEscapeNotifierFactory) {
        super(services, elementRef, viewContainerRef);
        this.focusEscapeNotifierFactory = focusEscapeNotifierFactory;
        this.focusTrap = undefined;
    }
    initFocusTrap() {
        this.focusTrap = this.focusEscapeNotifierFactory.create(this.overlayRef.overlayElement);
        this.focusTrap
            .escapes()
            .pipe(takeUntil(this.destroyed))
            .subscribe(direction => {
            this.services.editEventDispatcher.editRef?.blur();
            this.services.focusDispatcher.moveFocusHorizontally(closest(this.elementRef.nativeElement, CELL_SELECTOR), direction === 0 /* FocusEscapeNotifierDirection.START */ ? -1 : 1);
            this.closeEditOverlay();
        });
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.0.0-rc.2", ngImport: i0, type: CdkPopoverEditTabOut, deps: [{ token: i0.ElementRef }, { token: i0.ViewContainerRef }, { token: i3.EditServices }, { token: i4.FocusEscapeNotifierFactory }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "16.0.0-rc.2", type: CdkPopoverEditTabOut, selector: "[cdkPopoverEdit][cdkPopoverEditTabOut]", inputs: { template: ["cdkPopoverEdit", "template"], context: ["cdkPopoverEditContext", "context"], colspan: ["cdkPopoverEditColspan", "colspan"], disabled: ["cdkPopoverEditDisabled", "disabled"] }, host: { properties: { "attr.tabindex": "disabled ? null : 0", "attr.aria-haspopup": "!disabled" }, classAttribute: "cdk-popover-edit-cell" }, usesInheritance: true, ngImport: i0 }); }
}
export { CdkPopoverEditTabOut };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.0.0-rc.2", ngImport: i0, type: CdkPopoverEditTabOut, decorators: [{
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.0.0-rc.2", ngImport: i0, type: CdkRowHoverContent, deps: [{ token: i3.EditServices }, { token: i0.ElementRef }, { token: i0.TemplateRef }, { token: i0.ViewContainerRef }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "16.0.0-rc.2", type: CdkRowHoverContent, selector: "[cdkRowHoverContent]", ngImport: i0 }); }
}
export { CdkRowHoverContent };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.0.0-rc.2", ngImport: i0, type: CdkRowHoverContent, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkRowHoverContent]',
                }]
        }], ctorParameters: function () { return [{ type: i3.EditServices }, { type: i0.ElementRef }, { type: i0.TemplateRef }, { type: i0.ViewContainerRef }]; } });
/**
 * Opens the closest edit popover to this element, whether it's associated with this exact
 * element or an ancestor element.
 */
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
    openEdit(evt) {
        this.editEventDispatcher.editing.next(closest(this.elementRef.nativeElement, CELL_SELECTOR));
        evt.stopPropagation();
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.0.0-rc.2", ngImport: i0, type: CdkEditOpen, deps: [{ token: i0.ElementRef }, { token: i1.EditEventDispatcher }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "16.0.0-rc.2", type: CdkEditOpen, selector: "[cdkEditOpen]", host: { listeners: { "click": "openEdit($event)" } }, ngImport: i0 }); }
}
export { CdkEditOpen };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.0.0-rc.2", ngImport: i0, type: CdkEditOpen, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkEditOpen]',
                    host: {
                        '(click)': 'openEdit($event)',
                    },
                }]
        }], ctorParameters: function () { return [{ type: i0.ElementRef }, { type: i1.EditEventDispatcher }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFibGUtZGlyZWN0aXZlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL3BvcG92ZXItZWRpdC90YWJsZS1kaXJlY3RpdmVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQVNBLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUNuRCxPQUFPLEVBRUwsU0FBUyxFQUNULFVBQVUsRUFFVixNQUFNLEVBRU4sV0FBVyxFQUNYLGdCQUFnQixHQUNqQixNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUMsU0FBUyxFQUFFLGdCQUFnQixFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDakUsT0FBTyxFQUNMLE1BQU0sRUFDTixHQUFHLEVBQ0gsS0FBSyxFQUNMLEtBQUssRUFDTCxTQUFTLEVBQ1QsU0FBUyxFQUNULFlBQVksRUFDWixjQUFjLEdBQ2YsTUFBTSxnQkFBZ0IsQ0FBQztBQUV4QixPQUFPLEVBQUMsYUFBYSxFQUFFLGVBQWUsRUFBRSxrQkFBa0IsRUFBRSxZQUFZLEVBQUMsTUFBTSxhQUFhLENBQUM7QUFDN0YsT0FBTyxFQUFDLG1CQUFtQixFQUFvQixNQUFNLHlCQUF5QixDQUFDO0FBQy9FLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUM3QyxPQUFPLEVBQUMsZUFBZSxFQUFDLE1BQU0sb0JBQW9CLENBQUM7QUFDbkQsT0FBTyxFQUdMLDBCQUEwQixHQUMzQixNQUFNLHlCQUF5QixDQUFDO0FBQ2pDLE9BQU8sRUFBQyxPQUFPLEVBQUMsTUFBTSxZQUFZLENBQUM7Ozs7OztBQWFuQywrQ0FBK0M7QUFDL0MsTUFBTSwyQkFBMkIsR0FBRyxFQUFFLENBQUM7QUFFdkM7Ozs7R0FJRztBQUNILE1BSWEsV0FBVztJQUd0QixZQUNxQixVQUFzQixFQUN0QixtQkFBMEQsRUFDMUQsZUFBZ0MsRUFDaEMs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QkFBbUIsR0FBbkIsbUJBQW1CLENBQXVDO1FBRTdFLE1BQU0sYUFBYSxHQUFHLFVBQVUsQ0FBQyxhQUFhLENBQUM7UUFFL0MsbUNBQW1DO1FBQ25DLElBQUksYUFBYSxDQUFDLFFBQVEsS0FBSyxRQUFRLElBQUksQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQzlFLGFBQWEsQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1NBQzlDO0lBQ0gsQ0FBQztJQUVELFFBQVEsQ0FBQyxHQUFVO1FBQ2pCLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLGFBQWMsRUFBRSxhQUFhLENBQUMsQ0FBQyxDQUFDO1FBQzlGLEdBQUcsQ0FBQyxlQUFlLEVBQUUsQ0FBQztJQUN4QixDQUFDO21IQWhCVSxXQUFXO3VHQUFYLFdBQVc7O1NBQVgsV0FBVztnR0FBWCxXQUFXO2tCQU52QixTQUFTO21CQUFDO29CQUNULFFBQVEsRUFBRSxlQUFlO29CQUN6QixJQUFJLEVBQUU7d0JBQ0osU0FBUyxFQUFFLGtCQUFrQjtxQkFDOUI7aUJBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7Rm9jdXNUcmFwfSBmcm9tICdAYW5ndWxhci9jZGsvYTExeSc7XG5pbXBvcnQge092ZXJsYXlSZWYsIFBvc2l0aW9uU3RyYXRlZ3l9IGZyb20gJ0Bhbmd1bGFyL2Nkay9vdmVybGF5JztcbmltcG9ydCB7VGVtcGxhdGVQb3J0YWx9IGZyb20gJ0Bhbmd1bGFyL2Nkay9wb3J0YWwnO1xuaW1wb3J0IHtcbiAgQWZ0ZXJWaWV3SW5pdCxcbiAgRGlyZWN0aXZlLFxuICBFbGVtZW50UmVmLFxuICBFbWJlZGRlZFZpZXdSZWYsXG4gIE5nWm9uZSxcbiAgT25EZXN0cm95LFxuICBUZW1wbGF0ZVJlZixcbiAgVmlld0NvbnRhaW5lclJlZixcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge2Zyb21FdmVudCwgZnJvbUV2ZW50UGF0dGVybiwgbWVyZ2UsIFN1YmplY3R9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHtcbiAgZmlsdGVyLFxuICBtYXAsXG4gIG1hcFRvLFxuICBzaGFyZSxcbiAgc3RhcnRXaXRoLFxuICB0YWtlVW50aWwsXG4gIHRocm90dGxlVGltZSxcbiAgd2l0aExhdGVzdEZyb20sXG59IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcblxuaW1wb3J0IHtDRUxMX1NFTEVDVE9SLCBFRElUX1BBTkVfQ0xBU1MsIEVESVRfUEFORV9TRUxFQ1RPUiwgUk9XX1NFTEVDVE9SfSBmcm9tICcuL2NvbnN0YW50cyc7XG5pbXBvcnQge0VkaXRFdmVudERpc3BhdGNoZXIsIEhvdmVyQ29udGVudFN0YXRlfSBmcm9tICcuL2VkaXQtZXZlbnQtZGlzcGF0Y2hlcic7XG5pbXBvcnQge0VkaXRTZXJ2aWNlc30gZnJvbSAnLi9lZGl0LXNlcnZpY2VzJztcbmltcG9ydCB7Rm9jdXNEaXNwYXRjaGVyfSBmcm9tICcuL2ZvY3VzLWRpc3BhdGNoZXInO1xuaW1wb3J0IHtcbiAgRm9jdXNFc2NhcGVOb3RpZmllcixcbiAgRm9jdXNFc2NhcGVOb3RpZmllckRpcmVjdGlvbixcbiAgRm9jdXNFc2NhcGVOb3RpZmllckZhY3RvcnksXG59IGZyb20gJy4vZm9jdXMtZXNjYXBlLW5vdGlmaWVyJztcbmltcG9ydCB7Y2xvc2VzdH0gZnJvbSAnLi9wb2x5ZmlsbCc7XG5pbXBvcnQge0VkaXRSZWZ9IGZyb20gJy4vZWRpdC1yZWYnO1xuXG4vKipcbiAqIERlc2NyaWJlcyB0aGUgbnVtYmVyIG9mIGNvbHVtbnMgYmVmb3JlIGFuZCBhZnRlciB0aGUgb3JpZ2luYXRpbmcgY2VsbCB0aGF0IHRoZVxuICogZWRpdCBwb3B1cCBzaG91bGQgc3Bhbi4gSW4gbGVmdCB0byByaWdodCBsb2NhbGVzLCBiZWZvcmUgbWVhbnMgbGVmdCBhbmQgYWZ0ZXIgbWVhbnNcbiAqIHJpZ2h0LiBJbiByaWdodCB0byBsZWZ0IGxvY2FsZXMgYmVmb3JlIG1lYW5zIHJpZ2h0IGFuZCBhZnRlciBtZWFucyBsZWZ0LlxuICovXG5leHBvcnQgaW50ZXJmYWNlIENka1BvcG92ZXJFZGl0Q29sc3BhbiB7XG4gIGJlZm9yZT86IG51bWJlcjtcbiAgYWZ0ZXI/OiBudW1iZXI7XG59XG5cbi8qKiBVc2VkIGZvciByYXRlLWxpbWl0aW5nIG1vdXNlbW92ZSBldmVudHMuICovXG5jb25zdCBNT1VTRV9NT1ZFX1RIUk9UVExFX1RJTUVfTVMgPSAxMDtcblxuLyoqXG4gKiBBIGRpcmVjdGl2ZSB0aGF0IG11c3QgYmUgYXR0YWNoZWQgdG8gZW5hYmxlIGVkaXRhYmlsaXR5IG9uIGEgdGFibGUuXG4gKiBJdCBpcyByZXNwb25zaWJsZSBmb3Igc2V0dGluZyB1cCBkZWxlZ2F0ZWQgZXZlbnQgaGFuZGxlcnMgYW5kIHByb3ZpZGluZyB0aGVcbiAqIEVkaXRFdmVudERpc3BhdGNoZXIgc2VydmljZSBmb3IgdXNlIGJ5IHRoZSBvdGhlciBlZGl0IGRpcmVjdGl2ZXMuXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ3RhYmxlW2VkaXRhYmxlXSwgY2RrLXRhYmxlW2VkaXRhYmxlXSwgbWF0LXRhYmxlW2VkaXRhYmxlXScsXG4gIHByb3ZpZGVyczogW0VkaXRFdmVudERpc3BhdGNoZXIsIEVkaXRTZXJ2aWNlc10sXG59KVxuZXhwb3J0IGNsYXNzIENka0VkaXRhYmxlIGltcGxlbWVudHMgQWZ0ZXJWaWV3SW5pdCwgT25EZXN0cm95IHtcbiAgcHJvdGVjdGVkIHJlYWRvbmx5IGRlc3Ryb3llZCA9IG5ldyBTdWJqZWN0PHZvaWQ+KCk7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJvdGVjdGVkIHJlYWRvbmx5IGVsZW1lbnRSZWY6IEVsZW1lbnRSZWYsXG4gICAgcHJvdGVjdGVkIHJlYWRvbmx5IGVkaXRFdmVudERpc3BhdGNoZXI6IEVkaXRFdmVudERpc3BhdGNoZXI8RWRpdFJlZjx1bmtub3duPj4sXG4gICAgcHJvdGVjdGVkIHJlYWRvbmx5IGZvY3VzRGlzcGF0Y2hlcjogRm9jdXNEaXNwYXRjaGVyLFxuICAgIHByb3RlY3RlZCByZWFkb25seSBuZ1pvbmU6IE5nWm9uZSxcbiAgKSB7fVxuXG4gIG5nQWZ0ZXJWaWV3SW5pdCgpOiB2b2lkIHtcbiAgICB0aGlzLl9saXN0ZW5Gb3JUYWJsZUV2ZW50cygpO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgdGhpcy5kZXN0cm95ZWQubmV4dCgpO1xuICAgIHRoaXMuZGVzdHJveWVkLmNvbXBsZXRlKCk7XG4gIH1cblxuICBwcml2YXRlIF9saXN0ZW5Gb3JUYWJsZUV2ZW50cygpOiB2b2lkIHtcbiAgICBjb25zdCBlbGVtZW50ID0gdGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQ7XG4gICAgY29uc3QgdG9DbG9zZXN0ID0gKHNlbGVjdG9yOiBzdHJpbmcpID0+XG4gICAgICBtYXAoKGV2ZW50OiBVSUV2ZW50KSA9PiBjbG9zZXN0KGV2ZW50LnRhcmdldCwgc2VsZWN0b3IpKTtcblxuICAgIHRoaXMubmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgIC8vIFRyYWNrIG1vdXNlIG1vdmVtZW50IG92ZXIgdGhlIHRhYmxlIHRvIGhpZGUvc2hvdyBob3ZlciBjb250ZW50LlxuICAgICAgZnJvbUV2ZW50PE1vdXNlRXZlbnQ+KGVsZW1lbnQsICdtb3VzZW92ZXInKVxuICAgICAgICAucGlwZSh0b0Nsb3Nlc3QoUk9XX1NFTEVDVE9SKSwgdGFrZVVudGlsKHRoaXMuZGVzdHJveWVkKSlcbiAgICAgICAgLnN1YnNjcmliZSh0aGlzLmVkaXRFdmVudERpc3BhdGNoZXIuaG92ZXJpbmcpO1xuICAgICAgZnJvbUV2ZW50PE1vdXNlRXZlbnQ+KGVsZW1lbnQsICdtb3VzZWxlYXZlJylcbiAgICAgICAgLnBpcGUobWFwVG8obnVsbCksIHRha2VVbnRpbCh0aGlzLmRlc3Ryb3llZCkpXG4gICAgICAgIC5zdWJzY3JpYmUodGhpcy5lZGl0RXZlbnREaXNwYXRjaGVyLmhvdmVyaW5nKTtcbiAgICAgIGZyb21FdmVudDxNb3VzZUV2ZW50PihlbGVtZW50LCAnbW91c2Vtb3ZlJylcbiAgICAgICAgLnBpcGUoXG4gICAgICAgICAgdGhyb3R0bGVUaW1lKE1PVVNFX01PVkVfVEhST1RUTEVfVElNRV9NUyksXG4gICAgICAgICAgdG9DbG9zZXN0KFJPV19TRUxFQ1RPUiksXG4gICAgICAgICAgdGFrZVVudGlsKHRoaXMuZGVzdHJveWVkKSxcbiAgICAgICAgKVxuICAgICAgICAuc3Vic2NyaWJlKHRoaXMuZWRpdEV2ZW50RGlzcGF0Y2hlci5tb3VzZU1vdmUpO1xuXG4gICAgICAvLyBUcmFjayBmb2N1cyB3aXRoaW4gdGhlIHRhYmxlIHRvIGhpZGUvc2hvdy9tYWtlIGZvY3VzYWJsZSBob3ZlciBjb250ZW50LlxuICAgICAgZnJvbUV2ZW50UGF0dGVybjxGb2N1c0V2ZW50PihcbiAgICAgICAgaGFuZGxlciA9PiBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2ZvY3VzJywgaGFuZGxlciwgdHJ1ZSksXG4gICAgICAgIGhhbmRsZXIgPT4gZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdmb2N1cycsIGhhbmRsZXIsIHRydWUpLFxuICAgICAgKVxuICAgICAgICAucGlwZSh0b0Nsb3Nlc3QoUk9XX1NFTEVDVE9SKSwgc2hhcmUoKSwgdGFrZVVudGlsKHRoaXMuZGVzdHJveWVkKSlcbiAgICAgICAgLnN1YnNjcmliZSh0aGlzLmVkaXRFdmVudERpc3BhdGNoZXIuZm9jdXNlZCk7XG5cbiAgICAgIG1lcmdlKFxuICAgICAgICBmcm9tRXZlbnRQYXR0ZXJuPEZvY3VzRXZlbnQ+KFxuICAgICAgICAgIGhhbmRsZXIgPT4gZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdibHVyJywgaGFuZGxlciwgdHJ1ZSksXG4gICAgICAgICAgaGFuZGxlciA9PiBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2JsdXInLCBoYW5kbGVyLCB0cnVlKSxcbiAgICAgICAgKSxcbiAgICAgICAgZnJvbUV2ZW50PEtleWJvYXJkRXZlbnQ+KGVsZW1lbnQsICdrZXlkb3duJykucGlwZShmaWx0ZXIoZXZlbnQgPT4gZXZlbnQua2V5ID09PSAnRXNjYXBlJykpLFxuICAgICAgKVxuICAgICAgICAucGlwZShtYXBUbyhudWxsKSwgc2hhcmUoKSwgdGFrZVVudGlsKHRoaXMuZGVzdHJveWVkKSlcbiAgICAgICAgLnN1YnNjcmliZSh0aGlzLmVkaXRFdmVudERpc3BhdGNoZXIuZm9jdXNlZCk7XG5cbiAgICAgIC8vIEtlZXAgdHJhY2sgb2Ygcm93cyB3aXRoaW4gdGhlIHRhYmxlLiBUaGlzIGlzIHVzZWQgdG8ga25vdyB3aGljaCByb3dzIHdpdGggaG92ZXIgY29udGVudFxuICAgICAgLy8gYXJlIGZpcnN0IG9yIGxhc3QgaW4gdGhlIHRhYmxlLiBUaGV5IGFyZSBrZXB0IGZvY3VzYWJsZSBpbiBjYXNlIGZvY3VzIGVudGVycyBmcm9tIGFib3ZlXG4gICAgICAvLyBvciBiZWxvdyB0aGUgdGFibGUuXG4gICAgICB0aGlzLm5nWm9uZS5vblN0YWJsZVxuICAgICAgICAucGlwZShcbiAgICAgICAgICAvLyBPcHRpbWl6YXRpb246IGlnbm9yZSBkb20gY2hhbmdlcyB3aGlsZSBmb2N1cyBpcyB3aXRoaW4gdGhlIHRhYmxlIGFzIHdlIGFscmVhZHlcbiAgICAgICAgICAvLyBlbnN1cmUgdGhhdCByb3dzIGFib3ZlIGFuZCBiZWxvdyB0aGUgZm9jdXNlZC9hY3RpdmUgcm93IGFyZSB0YWJiYWJsZS5cbiAgICAgICAgICB3aXRoTGF0ZXN0RnJvbSh0aGlzLmVkaXRFdmVudERpc3BhdGNoZXIuZWRpdGluZ09yRm9jdXNlZCksXG4gICAgICAgICAgZmlsdGVyKChbXywgYWN0aXZlUm93XSkgPT4gYWN0aXZlUm93ID09IG51bGwpLFxuICAgICAgICAgIG1hcCgoKSA9PiBlbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoUk9XX1NFTEVDVE9SKSksXG4gICAgICAgICAgc2hhcmUoKSxcbiAgICAgICAgICB0YWtlVW50aWwodGhpcy5kZXN0cm95ZWQpLFxuICAgICAgICApXG4gICAgICAgIC5zdWJzY3JpYmUodGhpcy5lZGl0RXZlbnREaXNwYXRjaGVyLmFsbFJvd3MpO1xuXG4gICAgICBmcm9tRXZlbnQ8S2V5Ym9hcmRFdmVudD4oZWxlbWVudCwgJ2tleWRvd24nKVxuICAgICAgICAucGlwZShcbiAgICAgICAgICBmaWx0ZXIoZXZlbnQgPT4gZXZlbnQua2V5ID09PSAnRW50ZXInKSxcbiAgICAgICAgICB0b0Nsb3Nlc3QoQ0VMTF9TRUxFQ1RPUiksXG4gICAgICAgICAgdGFrZVVudGlsKHRoaXMuZGVzdHJveWVkKSxcbiAgICAgICAgKVxuICAgICAgICAuc3Vic2NyaWJlKHRoaXMuZWRpdEV2ZW50RGlzcGF0Y2hlci5lZGl0aW5nKTtcblxuICAgICAgLy8gS2V5ZG93biBtdXN0IGJlIHVzZWQgaGVyZSBvciBlbHNlIGtleSBhdXRvLXJlcGVhdCBkb2VzIG5vdCB3b3JrIHByb3Blcmx5IG9uIHNvbWUgcGxhdGZvcm1zLlxuICAgICAgZnJvbUV2ZW50PEtleWJvYXJkRXZlbnQ+KGVsZW1lbnQsICdrZXlkb3duJylcbiAgICAgICAgLnBpcGUodGFrZVVudGlsKHRoaXMuZGVzdHJveWVkKSlcbiAgICAgICAgLnN1YnNjcmliZSh0aGlzLmZvY3VzRGlzcGF0Y2hlci5rZXlPYnNlcnZlcik7XG4gICAgfSk7XG4gIH1cbn1cblxuY29uc3QgUE9QT1ZFUl9FRElUX0hPU1RfQklORElOR1MgPSB7XG4gICdbYXR0ci50YWJpbmRleF0nOiAnZGlzYWJsZWQgPyBudWxsIDogMCcsXG4gICdjbGFzcyc6ICdjZGstcG9wb3Zlci1lZGl0LWNlbGwnLFxuICAnW2F0dHIuYXJpYS1oYXNwb3B1cF0nOiAnIWRpc2FibGVkJyxcbn07XG5cbmNvbnN0IFBPUE9WRVJfRURJVF9JTlBVVFMgPSBbXG4gICd0ZW1wbGF0ZTogY2RrUG9wb3ZlckVkaXQnLFxuICAnY29udGV4dDogY2RrUG9wb3ZlckVkaXRDb250ZXh0JyxcbiAgJ2NvbHNwYW46IGNka1BvcG92ZXJFZGl0Q29sc3BhbicsXG4gICdkaXNhYmxlZDogY2RrUG9wb3ZlckVkaXREaXNhYmxlZCcsXG5dO1xuXG4vKipcbiAqIEF0dGFjaGVzIGFuIG5nLXRlbXBsYXRlIHRvIGEgY2VsbCBhbmQgc2hvd3MgaXQgd2hlbiBpbnN0cnVjdGVkIHRvIGJ5IHRoZVxuICogRWRpdEV2ZW50RGlzcGF0Y2hlciBzZXJ2aWNlLlxuICogTWFrZXMgdGhlIGNlbGwgZm9jdXNhYmxlLlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbY2RrUG9wb3ZlckVkaXRdOm5vdChbY2RrUG9wb3ZlckVkaXRUYWJPdXRdKScsXG4gIGhvc3Q6IFBPUE9WRVJfRURJVF9IT1NUX0JJTkRJTkdTLFxuICBpbnB1dHM6IFBPUE9WRVJfRURJVF9JTlBVVFMsXG59KVxuZXhwb3J0IGNsYXNzIENka1BvcG92ZXJFZGl0PEM+IGltcGxlbWVudHMgQWZ0ZXJWaWV3SW5pdCwgT25EZXN0cm95IHtcbiAgLyoqIFRoZSBlZGl0IGxlbnMgdGVtcGxhdGUgc2hvd24gb3ZlciB0aGUgY2VsbCBvbiBlZGl0LiAqL1xuICB0ZW1wbGF0ZTogVGVtcGxhdGVSZWY8YW55PiB8IG51bGwgPSBudWxsO1xuXG4gIC8qKlxuICAgKiBJbXBsaWNpdCBjb250ZXh0IHRvIHBhc3MgYWxvbmcgdG8gdGhlIHRlbXBsYXRlLiBDYW4gYmUgb21pdHRlZCBpZiB0aGUgdGVtcGxhdGVcbiAgICogaXMgZGVmaW5lZCB3aXRoaW4gdGhlIGNlbGwuXG4gICAqL1xuICBjb250ZXh0PzogQztcblxuICAvKipcbiAgICogU3BlY2lmaWVzIHRoYXQgdGhlIHBvcHVwIHNob3VsZCBjb3ZlciBhZGRpdGlvbmFsIHRhYmxlIGNlbGxzIGJlZm9yZSBhbmQvb3IgYWZ0ZXJcbiAgICogdGhpcyBvbmUuXG4gICAqL1xuICBnZXQgY29sc3BhbigpOiBDZGtQb3BvdmVyRWRpdENvbHNwYW4ge1xuICAgIHJldHVybiB0aGlzLl9jb2xzcGFuO1xuICB9XG4gIHNldCBjb2xzcGFuKHZhbHVlOiBDZGtQb3BvdmVyRWRpdENvbHNwYW4pIHtcbiAgICB0aGlzLl9jb2xzcGFuID0gdmFsdWU7XG5cbiAgICAvLyBSZWNvbXB1dGUgcG9zaXRpb25pbmcgd2hlbiB0aGUgY29sc3BhbiBjaGFuZ2VzLlxuICAgIGlmICh0aGlzLm92ZXJsYXlSZWYpIHtcbiAgICAgIHRoaXMub3ZlcmxheVJlZi51cGRhdGVQb3NpdGlvblN0cmF0ZWd5KHRoaXMuX2dldFBvc2l0aW9uU3RyYXRlZ3koKSk7XG5cbiAgICAgIGlmICh0aGlzLm92ZXJsYXlSZWYuaGFzQXR0YWNoZWQoKSkge1xuICAgICAgICB0aGlzLl91cGRhdGVPdmVybGF5U2l6ZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBwcml2YXRlIF9jb2xzcGFuOiBDZGtQb3BvdmVyRWRpdENvbHNwYW4gPSB7fTtcblxuICAvKiogV2hldGhlciBwb3BvdmVyIGVkaXQgaXMgZGlzYWJsZWQgZm9yIHRoaXMgY2VsbC4gKi9cbiAgZ2V0IGRpc2FibGVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9kaXNhYmxlZDtcbiAgfVxuICBzZXQgZGlzYWJsZWQodmFsdWU6IGJvb2xlYW4pIHtcbiAgICB0aGlzLl9kaXNhYmxlZCA9IHZhbHVlO1xuXG4gICAgaWYgKHZhbHVlKSB7XG4gICAgICB0aGlzLnNlcnZpY2VzLmVkaXRFdmVudERpc3BhdGNoZXIuZG9uZUVkaXRpbmdDZWxsKHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50ISk7XG4gICAgICB0aGlzLnNlcnZpY2VzLmVkaXRFdmVudERpc3BhdGNoZXIuZGlzYWJsZWRDZWxscy5zZXQodGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQhLCB0cnVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zZXJ2aWNlcy5lZGl0RXZlbnREaXNwYXRjaGVyLmRpc2FibGVkQ2VsbHMuZGVsZXRlKHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50ISk7XG4gICAgfVxuICB9XG4gIHByaXZhdGUgX2Rpc2FibGVkID0gZmFsc2U7XG5cbiAgcHJvdGVjdGVkIGZvY3VzVHJhcD86IEZvY3VzVHJhcDtcbiAgcHJvdGVjdGVkIG92ZXJsYXlSZWY/OiBPdmVybGF5UmVmO1xuICBwcm90ZWN0ZWQgcmVhZG9ubHkgZGVzdHJveWVkID0gbmV3IFN1YmplY3Q8dm9pZD4oKTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgc2VydmljZXM6IEVkaXRTZXJ2aWNlcyxcbiAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgZWxlbWVudFJlZjogRWxlbWVudFJlZixcbiAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgdmlld0NvbnRhaW5lclJlZjogVmlld0NvbnRhaW5lclJlZixcbiAgKSB7fVxuXG4gIG5nQWZ0ZXJWaWV3SW5pdCgpOiB2b2lkIHtcbiAgICB0aGlzLl9zdGFydExpc3RlbmluZ1RvRWRpdEV2ZW50cygpO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgdGhpcy5kZXN0cm95ZWQubmV4dCgpO1xuICAgIHRoaXMuZGVzdHJveWVkLmNvbXBsZXRlKCk7XG5cbiAgICBpZiAodGhpcy5mb2N1c1RyYXApIHtcbiAgICAgIHRoaXMuZm9jdXNUcmFwLmRlc3Ryb3koKTtcbiAgICAgIHRoaXMuZm9jdXNUcmFwID0gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGlmICh0aGlzLm92ZXJsYXlSZWYpIHtcbiAgICAgIHRoaXMub3ZlcmxheVJlZi5kaXNwb3NlKCk7XG4gICAgfVxuICB9XG5cbiAgcHJvdGVjdGVkIGluaXRGb2N1c1RyYXAoKTogdm9pZCB7XG4gICAgdGhpcy5mb2N1c1RyYXAgPSB0aGlzLnNlcnZpY2VzLmZvY3VzVHJhcEZhY3RvcnkuY3JlYXRlKHRoaXMub3ZlcmxheVJlZiEub3ZlcmxheUVsZW1lbnQpO1xuICB9XG5cbiAgcHJvdGVjdGVkIGNsb3NlRWRpdE92ZXJsYXkoKTogdm9pZCB7XG4gICAgdGhpcy5zZXJ2aWNlcy5lZGl0RXZlbnREaXNwYXRjaGVyLmRvbmVFZGl0aW5nQ2VsbCh0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCEpO1xuICB9XG5cbiAgcHJvdGVjdGVkIHBhbmVsQ2xhc3MoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gRURJVF9QQU5FX0NMQVNTO1xuICB9XG5cbiAgcHJpdmF0ZSBfc3RhcnRMaXN0ZW5pbmdUb0VkaXRFdmVudHMoKTogdm9pZCB7XG4gICAgdGhpcy5zZXJ2aWNlcy5lZGl0RXZlbnREaXNwYXRjaGVyXG4gICAgICAuZWRpdGluZ0NlbGwodGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQhKVxuICAgICAgLnBpcGUodGFrZVVudGlsKHRoaXMuZGVzdHJveWVkKSlcbiAgICAgIC5zdWJzY3JpYmUob3BlbiA9PiB7XG4gICAgICAgIGlmIChvcGVuICYmIHRoaXMudGVtcGxhdGUpIHtcbiAgICAgICAgICBpZiAoIXRoaXMub3ZlcmxheVJlZikge1xuICAgICAgICAgICAgdGhpcy5fY3JlYXRlRWRpdE92ZXJsYXkoKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB0aGlzLl9zaG93RWRpdE92ZXJsYXkoKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLm92ZXJsYXlSZWYpIHtcbiAgICAgICAgICB0aGlzLl9tYXliZVJldHVybkZvY3VzVG9DZWxsKCk7XG5cbiAgICAgICAgICB0aGlzLm92ZXJsYXlSZWYuZGV0YWNoKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfY3JlYXRlRWRpdE92ZXJsYXkoKTogdm9pZCB7XG4gICAgdGhpcy5vdmVybGF5UmVmID0gdGhpcy5zZXJ2aWNlcy5vdmVybGF5LmNyZWF0ZSh7XG4gICAgICBkaXNwb3NlT25OYXZpZ2F0aW9uOiB0cnVlLFxuICAgICAgcGFuZWxDbGFzczogdGhpcy5wYW5lbENsYXNzKCksXG4gICAgICBwb3NpdGlvblN0cmF0ZWd5OiB0aGlzLl9nZXRQb3NpdGlvblN0cmF0ZWd5KCksXG4gICAgICBzY3JvbGxTdHJhdGVneTogdGhpcy5zZXJ2aWNlcy5vdmVybGF5LnNjcm9sbFN0cmF0ZWdpZXMucmVwb3NpdGlvbigpLFxuICAgICAgZGlyZWN0aW9uOiB0aGlzLnNlcnZpY2VzLmRpcmVjdGlvbmFsaXR5LFxuICAgIH0pO1xuXG4gICAgdGhpcy5pbml0Rm9jdXNUcmFwKCk7XG4gICAgdGhpcy5vdmVybGF5UmVmLm92ZXJsYXlFbGVtZW50LnNldEF0dHJpYnV0ZSgnYXJpYS1yb2xlJywgJ2RpYWxvZycpO1xuXG4gICAgdGhpcy5vdmVybGF5UmVmLmRldGFjaG1lbnRzKCkuc3Vic2NyaWJlKCgpID0+IHRoaXMuY2xvc2VFZGl0T3ZlcmxheSgpKTtcbiAgfVxuXG4gIHByaXZhdGUgX3Nob3dFZGl0T3ZlcmxheSgpOiB2b2lkIHtcbiAgICB0aGlzLm92ZXJsYXlSZWYhLmF0dGFjaChcbiAgICAgIG5ldyBUZW1wbGF0ZVBvcnRhbCh0aGlzLnRlbXBsYXRlISwgdGhpcy52aWV3Q29udGFpbmVyUmVmLCB7JGltcGxpY2l0OiB0aGlzLmNvbnRleHR9KSxcbiAgICApO1xuXG4gICAgLy8gV2UgaGF2ZSB0byBkZWZlciB0cmFwcGluZyBmb2N1cywgYmVjYXVzZSBkb2luZyBzbyB0b28gZWFybHkgY2FuIGNhdXNlIHRoZSBmb3JtIGluc2lkZVxuICAgIC8vIHRoZSBvdmVybGF5IHRvIGJlIHN1Ym1pdHRlZCBpbW1lZGlhdGVseSBpZiBpdCB3YXMgb3BlbmVkIG9uIGFuIEVudGVyIGtleWRvd24gZXZlbnQuXG4gICAgdGhpcy5zZXJ2aWNlcy5uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHRoaXMuZm9jdXNUcmFwIS5mb2N1c0luaXRpYWxFbGVtZW50KCk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIC8vIFVwZGF0ZSB0aGUgc2l6ZSBvZiB0aGUgcG9wdXAgaW5pdGlhbGx5IGFuZCBvbiBzdWJzZXF1ZW50IGNoYW5nZXMgdG9cbiAgICAvLyBzY3JvbGwgcG9zaXRpb24gYW5kIHZpZXdwb3J0IHNpemUuXG4gICAgbWVyZ2UodGhpcy5zZXJ2aWNlcy5zY3JvbGxEaXNwYXRjaGVyLnNjcm9sbGVkKCksIHRoaXMuc2VydmljZXMudmlld3BvcnRSdWxlci5jaGFuZ2UoKSlcbiAgICAgIC5waXBlKHN0YXJ0V2l0aChudWxsKSwgdGFrZVVudGlsKG1lcmdlKHRoaXMub3ZlcmxheVJlZiEuZGV0YWNobWVudHMoKSwgdGhpcy5kZXN0cm95ZWQpKSlcbiAgICAgIC5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgICB0aGlzLl91cGRhdGVPdmVybGF5U2l6ZSgpO1xuICAgICAgfSk7XG4gIH1cblxuICBwcml2YXRlIF9nZXRPdmVybGF5Q2VsbHMoKTogSFRNTEVsZW1lbnRbXSB7XG4gICAgY29uc3QgY2VsbCA9IGNsb3Nlc3QodGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQhLCBDRUxMX1NFTEVDVE9SKSBhcyBIVE1MRWxlbWVudDtcblxuICAgIGlmICghdGhpcy5fY29sc3Bhbi5iZWZvcmUgJiYgIXRoaXMuX2NvbHNwYW4uYWZ0ZXIpIHtcbiAgICAgIHJldHVybiBbY2VsbF07XG4gICAgfVxuXG4gICAgY29uc3Qgcm93ID0gY2xvc2VzdCh0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCEsIFJPV19TRUxFQ1RPUikhO1xuICAgIGNvbnN0IHJvd0NlbGxzID0gQXJyYXkuZnJvbShyb3cucXVlcnlTZWxlY3RvckFsbChDRUxMX1NFTEVDVE9SKSkgYXMgSFRNTEVsZW1lbnRbXTtcbiAgICBjb25zdCBvd25JbmRleCA9IHJvd0NlbGxzLmluZGV4T2YoY2VsbCk7XG5cbiAgICByZXR1cm4gcm93Q2VsbHMuc2xpY2UoXG4gICAgICBvd25JbmRleCAtICh0aGlzLl9jb2xzcGFuLmJlZm9yZSB8fCAwKSxcbiAgICAgIG93bkluZGV4ICsgKHRoaXMuX2NvbHNwYW4uYWZ0ZXIgfHwgMCkgKyAxLFxuICAgICk7XG4gIH1cblxuICBwcml2YXRlIF9nZXRQb3NpdGlvblN0cmF0ZWd5KCk6IFBvc2l0aW9uU3RyYXRlZ3kge1xuICAgIHJldHVybiB0aGlzLnNlcnZpY2VzLnBvc2l0aW9uRmFjdG9yeS5wb3NpdGlvblN0cmF0ZWd5Rm9yQ2VsbHModGhpcy5fZ2V0T3ZlcmxheUNlbGxzKCkpO1xuICB9XG5cbiAgcHJpdmF0ZSBfdXBkYXRlT3ZlcmxheVNpemUoKTogdm9pZCB7XG4gICAgdGhpcy5vdmVybGF5UmVmIS51cGRhdGVTaXplKFxuICAgICAgdGhpcy5zZXJ2aWNlcy5wb3NpdGlvbkZhY3Rvcnkuc2l6ZUNvbmZpZ0ZvckNlbGxzKHRoaXMuX2dldE92ZXJsYXlDZWxscygpKSxcbiAgICApO1xuICB9XG5cbiAgcHJpdmF0ZSBfbWF5YmVSZXR1cm5Gb2N1c1RvQ2VsbCgpOiB2b2lkIHtcbiAgICBpZiAoY2xvc2VzdChkb2N1bWVudC5hY3RpdmVFbGVtZW50LCBFRElUX1BBTkVfU0VMRUNUT1IpID09PSB0aGlzLm92ZXJsYXlSZWYhLm92ZXJsYXlFbGVtZW50KSB7XG4gICAgICB0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCEuZm9jdXMoKTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBBdHRhY2hlcyBhbiBuZy10ZW1wbGF0ZSB0byBhIGNlbGwgYW5kIHNob3dzIGl0IHdoZW4gaW5zdHJ1Y3RlZCB0byBieSB0aGVcbiAqIEVkaXRFdmVudERpc3BhdGNoZXIgc2VydmljZS5cbiAqIE1ha2VzIHRoZSBjZWxsIGZvY3VzYWJsZS5cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW2Nka1BvcG92ZXJFZGl0XVtjZGtQb3BvdmVyRWRpdFRhYk91dF0nLFxuICBob3N0OiBQT1BPVkVSX0VESVRfSE9TVF9CSU5ESU5HUyxcbiAgaW5wdXRzOiBQT1BPVkVSX0VESVRfSU5QVVRTLFxufSlcbmV4cG9ydCBjbGFzcyBDZGtQb3BvdmVyRWRpdFRhYk91dDxDPiBleHRlbmRzIENka1BvcG92ZXJFZGl0PEM+IHtcbiAgcHJvdGVjdGVkIG92ZXJyaWRlIGZvY3VzVHJhcD86IEZvY3VzRXNjYXBlTm90aWZpZXIgPSB1bmRlZmluZWQ7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgZWxlbWVudFJlZjogRWxlbWVudFJlZixcbiAgICB2aWV3Q29udGFpbmVyUmVmOiBWaWV3Q29udGFpbmVyUmVmLFxuICAgIHNlcnZpY2VzOiBFZGl0U2VydmljZXMsXG4gICAgcHJvdGVjdGVkIHJlYWRvbmx5IGZvY3VzRXNjYXBlTm90aWZpZXJGYWN0b3J5OiBGb2N1c0VzY2FwZU5vdGlmaWVyRmFjdG9yeSxcbiAgKSB7XG4gICAgc3VwZXIoc2VydmljZXMsIGVsZW1lbnRSZWYsIHZpZXdDb250YWluZXJSZWYpO1xuICB9XG5cbiAgcHJvdGVjdGVkIG92ZXJyaWRlIGluaXRGb2N1c1RyYXAoKTogdm9pZCB7XG4gICAgdGhpcy5mb2N1c1RyYXAgPSB0aGlzLmZvY3VzRXNjYXBlTm90aWZpZXJGYWN0b3J5LmNyZWF0ZSh0aGlzLm92ZXJsYXlSZWYhLm92ZXJsYXlFbGVtZW50KTtcblxuICAgIHRoaXMuZm9jdXNUcmFwXG4gICAgICAuZXNjYXBlcygpXG4gICAgICAucGlwZSh0YWtlVW50aWwodGhpcy5kZXN0cm95ZWQpKVxuICAgICAgLnN1YnNjcmliZShkaXJlY3Rpb24gPT4ge1xuICAgICAgICB0aGlzLnNlcnZpY2VzLmVkaXRFdmVudERpc3BhdGNoZXIuZWRpdFJlZj8uYmx1cigpO1xuICAgICAgICB0aGlzLnNlcnZpY2VzLmZvY3VzRGlzcGF0Y2hlci5tb3ZlRm9jdXNIb3Jpem9udGFsbHkoXG4gICAgICAgICAgY2xvc2VzdCh0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCEsIENFTExfU0VMRUNUT1IpIGFzIEhUTUxFbGVtZW50LFxuICAgICAgICAgIGRpcmVjdGlvbiA9PT0gRm9jdXNFc2NhcGVOb3RpZmllckRpcmVjdGlvbi5TVEFSVCA/IC0xIDogMSxcbiAgICAgICAgKTtcblxuICAgICAgICB0aGlzLmNsb3NlRWRpdE92ZXJsYXkoKTtcbiAgICAgIH0pO1xuICB9XG59XG5cbi8qKlxuICogQSBzdHJ1Y3R1cmFsIGRpcmVjdGl2ZSB0aGF0IHNob3dzIGl0cyBjb250ZW50cyB3aGVuIHRoZSB0YWJsZSByb3cgY29udGFpbmluZ1xuICogaXQgaXMgaG92ZXJlZCBvciB3aGVuIGFuIGVsZW1lbnQgaW4gdGhlIHJvdyBoYXMgZm9jdXMuXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tjZGtSb3dIb3ZlckNvbnRlbnRdJyxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrUm93SG92ZXJDb250ZW50IGltcGxlbWVudHMgQWZ0ZXJWaWV3SW5pdCwgT25EZXN0cm95IHtcbiAgcHJvdGVjdGVkIHJlYWRvbmx5IGRlc3Ryb3llZCA9IG5ldyBTdWJqZWN0PHZvaWQ+KCk7XG4gIHByb3RlY3RlZCB2aWV3UmVmOiBFbWJlZGRlZFZpZXdSZWY8YW55PiB8IG51bGwgPSBudWxsO1xuXG4gIHByaXZhdGUgX3Jvdz86IEVsZW1lbnQ7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJvdGVjdGVkIHJlYWRvbmx5IHNlcnZpY2VzOiBFZGl0U2VydmljZXMsXG4gICAgcHJvdGVjdGVkIHJlYWRvbmx5IGVsZW1lbnRSZWY6IEVsZW1lbnRSZWYsXG4gICAgcHJvdGVjdGVkIHJlYWRvbmx5IHRlbXBsYXRlUmVmOiBUZW1wbGF0ZVJlZjxhbnk+LFxuICAgIHByb3RlY3RlZCByZWFkb25seSB2aWV3Q29udGFpbmVyUmVmOiBWaWV3Q29udGFpbmVyUmVmLFxuICApIHt9XG5cbiAgbmdBZnRlclZpZXdJbml0KCk6IHZvaWQge1xuICAgIHRoaXMuX3JvdyA9IGNsb3Nlc3QodGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQhLCBST1dfU0VMRUNUT1IpITtcblxuICAgIHRoaXMuc2VydmljZXMuZWRpdEV2ZW50RGlzcGF0Y2hlci5yZWdpc3RlclJvd1dpdGhIb3ZlckNvbnRlbnQodGhpcy5fcm93KTtcbiAgICB0aGlzLl9saXN0ZW5Gb3JIb3ZlckFuZEZvY3VzRXZlbnRzKCk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLmRlc3Ryb3llZC5uZXh0KCk7XG4gICAgdGhpcy5kZXN0cm95ZWQuY29tcGxldGUoKTtcblxuICAgIGlmICh0aGlzLnZpZXdSZWYpIHtcbiAgICAgIHRoaXMudmlld1JlZi5kZXN0cm95KCk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX3Jvdykge1xuICAgICAgdGhpcy5zZXJ2aWNlcy5lZGl0RXZlbnREaXNwYXRjaGVyLmRlcmVnaXN0ZXJSb3dXaXRoSG92ZXJDb250ZW50KHRoaXMuX3Jvdyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENhbGxlZCBpbW1lZGlhdGVseSBhZnRlciB0aGUgaG92ZXIgY29udGVudCBpcyBjcmVhdGVkIGFuZCBhZGRlZCB0byB0aGUgZG9tLlxuICAgKiBJbiB0aGUgQ0RLIHZlcnNpb24sIHRoaXMgaXMgYSBub29wIGJ1dCBzdWJjbGFzc2VzIHN1Y2ggYXMgTWF0Um93SG92ZXJDb250ZW50IHVzZSB0aGlzXG4gICAqIHRvIHByZXBhcmUvc3R5bGUgdGhlIGluc2VydGVkIGVsZW1lbnQuXG4gICAqL1xuICBwcm90ZWN0ZWQgaW5pdEVsZW1lbnQoXzogSFRNTEVsZW1lbnQpOiB2b2lkIHt9XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIHRoZSBob3ZlciBjb250ZW50IG5lZWRzIHRvIGJlIGZvY3VzYWJsZSB0byBwcmVzZXJ2ZSBhIHJlYXNvbmFibGUgdGFiIG9yZGVyaW5nXG4gICAqIGJ1dCBzaG91bGQgbm90IHlldCBiZSBzaG93bi5cbiAgICovXG4gIHByb3RlY3RlZCBtYWtlRWxlbWVudEhpZGRlbkJ1dEZvY3VzYWJsZShlbGVtZW50OiBIVE1MRWxlbWVudCk6IHZvaWQge1xuICAgIGVsZW1lbnQuc3R5bGUub3BhY2l0eSA9ICcwJztcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiB0aGUgaG92ZXIgY29udGVudCBuZWVkcyB0byBiZSBmb2N1c2FibGUgdG8gcHJlc2VydmUgYSByZWFzb25hYmxlIHRhYiBvcmRlcmluZ1xuICAgKiBidXQgc2hvdWxkIG5vdCB5ZXQgYmUgc2hvd24uXG4gICAqL1xuICBwcm90ZWN0ZWQgbWFrZUVsZW1lbnRWaXNpYmxlKGVsZW1lbnQ6IEhUTUxFbGVtZW50KTogdm9pZCB7XG4gICAgZWxlbWVudC5zdHlsZS5vcGFjaXR5ID0gJyc7XG4gIH1cblxuICBwcml2YXRlIF9saXN0ZW5Gb3JIb3ZlckFuZEZvY3VzRXZlbnRzKCk6IHZvaWQge1xuICAgIHRoaXMuc2VydmljZXMuZWRpdEV2ZW50RGlzcGF0Y2hlclxuICAgICAgLmhvdmVyT3JGb2N1c09uUm93KHRoaXMuX3JvdyEpXG4gICAgICAucGlwZSh0YWtlVW50aWwodGhpcy5kZXN0cm95ZWQpKVxuICAgICAgLnN1YnNjcmliZShldmVudFN0YXRlID0+IHtcbiAgICAgICAgLy8gV2hlbiBpbiBGT0NVU0FCTEUgc3RhdGUsIGFkZCB0aGUgaG92ZXIgY29udGVudCB0byB0aGUgZG9tIGJ1dCBtYWtlIGl0IHRyYW5zcGFyZW50IHNvXG4gICAgICAgIC8vIHRoYXQgaXQgaXMgaW4gdGhlIHRhYiBvcmRlciByZWxhdGl2ZSB0byB0aGUgY3VycmVudGx5IGZvY3VzZWQgcm93LlxuXG4gICAgICAgIGlmIChldmVudFN0YXRlID09PSBIb3ZlckNvbnRlbnRTdGF0ZS5PTiB8fCBldmVudFN0YXRlID09PSBIb3ZlckNvbnRlbnRTdGF0ZS5GT0NVU0FCTEUpIHtcbiAgICAgICAgICBpZiAoIXRoaXMudmlld1JlZikge1xuICAgICAgICAgICAgdGhpcy52aWV3UmVmID0gdGhpcy52aWV3Q29udGFpbmVyUmVmLmNyZWF0ZUVtYmVkZGVkVmlldyh0aGlzLnRlbXBsYXRlUmVmLCB7fSk7XG4gICAgICAgICAgICB0aGlzLmluaXRFbGVtZW50KHRoaXMudmlld1JlZi5yb290Tm9kZXNbMF0gYXMgSFRNTEVsZW1lbnQpO1xuICAgICAgICAgICAgdGhpcy52aWV3UmVmLm1hcmtGb3JDaGVjaygpO1xuICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy52aWV3Q29udGFpbmVyUmVmLmluZGV4T2YodGhpcy52aWV3UmVmKSA9PT0gLTEpIHtcbiAgICAgICAgICAgIHRoaXMudmlld0NvbnRhaW5lclJlZi5pbnNlcnQodGhpcy52aWV3UmVmISk7XG4gICAgICAgICAgICB0aGlzLnZpZXdSZWYubWFya0ZvckNoZWNrKCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGV2ZW50U3RhdGUgPT09IEhvdmVyQ29udGVudFN0YXRlLk9OKSB7XG4gICAgICAgICAgICB0aGlzLm1ha2VFbGVtZW50VmlzaWJsZSh0aGlzLnZpZXdSZWYucm9vdE5vZGVzWzBdIGFzIEhUTUxFbGVtZW50KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5tYWtlRWxlbWVudEhpZGRlbkJ1dEZvY3VzYWJsZSh0aGlzLnZpZXdSZWYucm9vdE5vZGVzWzBdIGFzIEhUTUxFbGVtZW50KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy52aWV3UmVmKSB7XG4gICAgICAgICAgdGhpcy52aWV3Q29udGFpbmVyUmVmLmRldGFjaCh0aGlzLnZpZXdDb250YWluZXJSZWYuaW5kZXhPZih0aGlzLnZpZXdSZWYpKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gIH1cbn1cblxuLyoqXG4gKiBPcGVucyB0aGUgY2xvc2VzdCBlZGl0IHBvcG92ZXIgdG8gdGhpcyBlbGVtZW50LCB3aGV0aGVyIGl0J3MgYXNzb2NpYXRlZCB3aXRoIHRoaXMgZXhhY3RcbiAqIGVsZW1lbnQgb3IgYW4gYW5jZXN0b3IgZWxlbWVudC5cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW2Nka0VkaXRPcGVuXScsXG4gIGhvc3Q6IHtcbiAgICAnKGNsaWNrKSc6ICdvcGVuRWRpdCgkZXZlbnQpJyxcbiAgfSxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrRWRpdE9wZW4ge1xuICBjb25zdHJ1Y3RvcihcbiAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgZWxlbWVudFJlZjogRWxlbWVudFJlZjxIVE1MRWxlbWVudD4sXG4gICAgcHJvdGVjdGVkIHJlYWRvbmx5IGVkaXRFdmVudERpc3BhdGNoZXI6IEVkaXRFdmVudERpc3BhdGNoZXI8RWRpdFJlZjx1bmtub3duPj4sXG4gICkge1xuICAgIGNvbnN0IG5hdGl2ZUVsZW1lbnQgPSBlbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQ7XG5cbiAgICAvLyBQcmV2ZW50IGFjY2lkZW50YWwgZm9ybSBzdWJtaXRzLlxuICAgIGlmIChuYXRpdmVFbGVtZW50Lm5vZGVOYW1lID09PSAnQlVUVE9OJyAmJiAhbmF0aXZlRWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3R5cGUnKSkge1xuICAgICAgbmF0aXZlRWxlbWVudC5zZXRBdHRyaWJ1dGUoJ3R5cGUnLCAnYnV0dG9uJyk7XG4gICAgfVxuICB9XG5cbiAgb3BlbkVkaXQoZXZ0OiBFdmVudCk6IHZvaWQge1xuICAgIHRoaXMuZWRpdEV2ZW50RGlzcGF0Y2hlci5lZGl0aW5nLm5leHQoY2xvc2VzdCh0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCEsIENFTExfU0VMRUNUT1IpKTtcbiAgICBldnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gIH1cbn1cbiJdfQ==