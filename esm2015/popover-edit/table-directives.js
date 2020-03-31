/**
 * @fileoverview added by tsickle
 * Generated from: src/cdk-experimental/popover-edit/table-directives.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
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
/**
 * Describes the number of columns before and after the originating cell that the
 * edit popup should span. In left to right locales, before means left and after means
 * right. In right to left locales before means right and after means left.
 * @record
 */
export function CdkPopoverEditColspan() { }
if (false) {
    /** @type {?|undefined} */
    CdkPopoverEditColspan.prototype.before;
    /** @type {?|undefined} */
    CdkPopoverEditColspan.prototype.after;
}
/**
 * Used for rate-limiting mousemove events.
 * @type {?}
 */
const MOUSE_MOVE_THROTTLE_TIME_MS = 10;
/**
 * A directive that must be attached to enable editability on a table.
 * It is responsible for setting up delegated event handlers and providing the
 * EditEventDispatcher service for use by the other edit directives.
 */
export class CdkEditable {
    /**
     * @param {?} elementRef
     * @param {?} editEventDispatcher
     * @param {?} focusDispatcher
     * @param {?} ngZone
     */
    constructor(elementRef, editEventDispatcher, focusDispatcher, ngZone) {
        this.elementRef = elementRef;
        this.editEventDispatcher = editEventDispatcher;
        this.focusDispatcher = focusDispatcher;
        this.ngZone = ngZone;
        this.destroyed = new Subject();
    }
    /**
     * @return {?}
     */
    ngAfterViewInit() {
        this._listenForTableEvents();
    }
    /**
     * @return {?}
     */
    ngOnDestroy() {
        this.destroyed.next();
        this.destroyed.complete();
    }
    /**
     * @private
     * @return {?}
     */
    _listenForTableEvents() {
        /** @type {?} */
        const element = this.elementRef.nativeElement;
        /** @type {?} */
        const toClosest = (/**
         * @param {?} selector
         * @return {?}
         */
        (selector) => map((/**
         * @param {?} event
         * @return {?}
         */
        (event) => closest(event.target, selector))));
        this.ngZone.runOutsideAngular((/**
         * @return {?}
         */
        () => {
            // Track mouse movement over the table to hide/show hover content.
            fromEvent(element, 'mouseover').pipe(toClosest(ROW_SELECTOR), takeUntil(this.destroyed)).subscribe(this.editEventDispatcher.hovering);
            fromEvent(element, 'mouseleave').pipe(mapTo(null), takeUntil(this.destroyed)).subscribe(this.editEventDispatcher.hovering);
            fromEvent(element, 'mousemove').pipe(throttleTime(MOUSE_MOVE_THROTTLE_TIME_MS), toClosest(ROW_SELECTOR), takeUntil(this.destroyed)).subscribe(this.editEventDispatcher.mouseMove);
            // Track focus within the table to hide/show/make focusable hover content.
            fromEventPattern((/**
             * @param {?} handler
             * @return {?}
             */
            handler => element.addEventListener('focus', handler, true)), (/**
             * @param {?} handler
             * @return {?}
             */
            handler => element.removeEventListener('focus', handler, true))).pipe(takeUntil(this.destroyed), toClosest(ROW_SELECTOR), share()).subscribe(this.editEventDispatcher.focused);
            merge(fromEventPattern((/**
             * @param {?} handler
             * @return {?}
             */
            handler => element.addEventListener('blur', handler, true)), (/**
             * @param {?} handler
             * @return {?}
             */
            handler => element.removeEventListener('blur', handler, true))), fromEvent(element, 'keydown').pipe(filter((/**
             * @param {?} event
             * @return {?}
             */
            event => event.key === 'Escape')))).pipe(takeUntil(this.destroyed), mapTo(null), share()).subscribe(this.editEventDispatcher.focused);
            // Keep track of rows within the table. This is used to know which rows with hover content
            // are first or last in the table. They are kept focusable in case focus enters from above
            // or below the table.
            this.ngZone.onStable.pipe(takeUntil(this.destroyed), 
            // Optimization: ignore dom changes while focus is within the table as we already
            // ensure that rows above and below the focused/active row are tabbable.
            withLatestFrom(this.editEventDispatcher.editingOrFocused), filter((/**
             * @param {?} __0
             * @return {?}
             */
            ([_, activeRow]) => activeRow == null)), map((/**
             * @return {?}
             */
            () => element.querySelectorAll(ROW_SELECTOR))), share()).subscribe(this.editEventDispatcher.allRows);
            fromEvent(element, 'keydown').pipe(filter((/**
             * @param {?} event
             * @return {?}
             */
            event => event.key === 'Enter')), toClosest(CELL_SELECTOR), takeUntil(this.destroyed)).subscribe(this.editEventDispatcher.editing);
            // Keydown must be used here or else key autorepeat does not work properly on some platforms.
            fromEvent(element, 'keydown')
                .pipe(takeUntil(this.destroyed))
                .subscribe(this.focusDispatcher.keyObserver);
        }));
    }
}
CdkEditable.decorators = [
    { type: Directive, args: [{
                selector: 'table[editable], cdk-table[editable], mat-table[editable]',
                providers: [EditEventDispatcher, EditServices],
            },] }
];
/** @nocollapse */
CdkEditable.ctorParameters = () => [
    { type: ElementRef },
    { type: EditEventDispatcher },
    { type: FocusDispatcher },
    { type: NgZone }
];
if (false) {
    /**
     * @type {?}
     * @protected
     */
    CdkEditable.prototype.destroyed;
    /**
     * @type {?}
     * @protected
     */
    CdkEditable.prototype.elementRef;
    /**
     * @type {?}
     * @protected
     */
    CdkEditable.prototype.editEventDispatcher;
    /**
     * @type {?}
     * @protected
     */
    CdkEditable.prototype.focusDispatcher;
    /**
     * @type {?}
     * @protected
     */
    CdkEditable.prototype.ngZone;
}
/** @type {?} */
const POPOVER_EDIT_HOST_BINDINGS = {
    '[attr.tabindex]': 'disabled ? null : 0',
    'class': 'cdk-popover-edit-cell',
    '[attr.aria-haspopup]': '!disabled',
};
/** @type {?} */
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
 * @template C
 */
export class CdkPopoverEdit {
    /**
     * @param {?} services
     * @param {?} elementRef
     * @param {?} viewContainerRef
     */
    constructor(services, elementRef, viewContainerRef) {
        this.services = services;
        this.elementRef = elementRef;
        this.viewContainerRef = viewContainerRef;
        /**
         * The edit lens template shown over the cell on edit.
         */
        this.template = null;
        this._colspan = {};
        this._disabled = false;
        this.destroyed = new Subject();
    }
    /**
     * Specifies that the popup should cover additional table cells before and/or after
     * this one.
     * @return {?}
     */
    get colspan() {
        return this._colspan;
    }
    /**
     * @param {?} value
     * @return {?}
     */
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
    /**
     * Whether popover edit is disabled for this cell.
     * @return {?}
     */
    get disabled() {
        return this._disabled;
    }
    /**
     * @param {?} value
     * @return {?}
     */
    set disabled(value) {
        this._disabled = value;
        if (value) {
            this.services.editEventDispatcher.doneEditingCell((/** @type {?} */ (this.elementRef.nativeElement)));
            this.services.editEventDispatcher.disabledCells.set((/** @type {?} */ (this.elementRef.nativeElement)), true);
        }
        else {
            this.services.editEventDispatcher.disabledCells.delete((/** @type {?} */ (this.elementRef.nativeElement)));
        }
    }
    /**
     * @return {?}
     */
    ngAfterViewInit() {
        this._startListeningToEditEvents();
    }
    /**
     * @return {?}
     */
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
    /**
     * @protected
     * @return {?}
     */
    initFocusTrap() {
        this.focusTrap = this.services.focusTrapFactory.create((/** @type {?} */ (this.overlayRef)).overlayElement);
    }
    /**
     * @protected
     * @return {?}
     */
    closeEditOverlay() {
        this.services.editEventDispatcher.doneEditingCell((/** @type {?} */ (this.elementRef.nativeElement)));
    }
    /**
     * @protected
     * @return {?}
     */
    panelClass() {
        return EDIT_PANE_CLASS;
    }
    /**
     * @private
     * @return {?}
     */
    _startListeningToEditEvents() {
        this.services.editEventDispatcher.editingCell((/** @type {?} */ (this.elementRef.nativeElement)))
            .pipe(takeUntil(this.destroyed))
            .subscribe((/**
         * @param {?} open
         * @return {?}
         */
        (open) => {
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
        }));
    }
    /**
     * @private
     * @return {?}
     */
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
        this.overlayRef.detachments().subscribe((/**
         * @return {?}
         */
        () => this.closeEditOverlay()));
    }
    /**
     * @private
     * @return {?}
     */
    _showEditOverlay() {
        (/** @type {?} */ (this.overlayRef)).attach(new TemplatePortal((/** @type {?} */ (this.template)), this.viewContainerRef, { $implicit: this.context }));
        // We have to defer trapping focus, because doing so too early can cause the form inside
        // the overlay to be submitted immediately if it was opened on an Enter keydown event.
        this.services.ngZone.runOutsideAngular((/**
         * @return {?}
         */
        () => {
            setTimeout((/**
             * @return {?}
             */
            () => {
                (/** @type {?} */ (this.focusTrap)).focusInitialElement();
            }));
        }));
        // Update the size of the popup initially and on subsequent changes to
        // scroll position and viewport size.
        merge(this.services.scrollDispatcher.scrolled(), this.services.viewportRuler.change())
            .pipe(startWith(null), takeUntil((/** @type {?} */ (this.overlayRef)).detachments()), takeUntil(this.destroyed))
            .subscribe((/**
         * @return {?}
         */
        () => {
            this._updateOverlaySize();
        }));
    }
    /**
     * @private
     * @return {?}
     */
    _getOverlayCells() {
        /** @type {?} */
        const cell = (/** @type {?} */ (closest((/** @type {?} */ (this.elementRef.nativeElement)), CELL_SELECTOR)));
        if (!this._colspan.before && !this._colspan.after) {
            return [cell];
        }
        /** @type {?} */
        const row = (/** @type {?} */ (closest((/** @type {?} */ (this.elementRef.nativeElement)), ROW_SELECTOR)));
        /** @type {?} */
        const rowCells = (/** @type {?} */ (Array.from(row.querySelectorAll(CELL_SELECTOR))));
        /** @type {?} */
        const ownIndex = rowCells.indexOf(cell);
        return rowCells.slice(ownIndex - (this._colspan.before || 0), ownIndex + (this._colspan.after || 0) + 1);
    }
    /**
     * @private
     * @return {?}
     */
    _getPositionStrategy() {
        return this.services.positionFactory.positionStrategyForCells(this._getOverlayCells());
    }
    /**
     * @private
     * @return {?}
     */
    _updateOverlaySize() {
        (/** @type {?} */ (this.overlayRef)).updateSize(this.services.positionFactory.sizeConfigForCells(this._getOverlayCells()));
    }
    /**
     * @private
     * @return {?}
     */
    _maybeReturnFocusToCell() {
        if (closest(document.activeElement, EDIT_PANE_SELECTOR) ===
            (/** @type {?} */ (this.overlayRef)).overlayElement) {
            (/** @type {?} */ (this.elementRef.nativeElement)).focus();
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
/** @nocollapse */
CdkPopoverEdit.ctorParameters = () => [
    { type: EditServices },
    { type: ElementRef },
    { type: ViewContainerRef }
];
if (false) {
    /**
     * The edit lens template shown over the cell on edit.
     * @type {?}
     */
    CdkPopoverEdit.prototype.template;
    /**
     * Implicit context to pass along to the template. Can be omitted if the template
     * is defined within the cell.
     * @type {?}
     */
    CdkPopoverEdit.prototype.context;
    /**
     * @type {?}
     * @private
     */
    CdkPopoverEdit.prototype._colspan;
    /**
     * @type {?}
     * @private
     */
    CdkPopoverEdit.prototype._disabled;
    /**
     * @type {?}
     * @protected
     */
    CdkPopoverEdit.prototype.focusTrap;
    /**
     * @type {?}
     * @protected
     */
    CdkPopoverEdit.prototype.overlayRef;
    /**
     * @type {?}
     * @protected
     */
    CdkPopoverEdit.prototype.destroyed;
    /**
     * @type {?}
     * @protected
     */
    CdkPopoverEdit.prototype.services;
    /**
     * @type {?}
     * @protected
     */
    CdkPopoverEdit.prototype.elementRef;
    /**
     * @type {?}
     * @protected
     */
    CdkPopoverEdit.prototype.viewContainerRef;
}
/**
 * Attaches an ng-template to a cell and shows it when instructed to by the
 * EditEventDispatcher service.
 * Makes the cell focusable.
 * @template C
 */
export class CdkPopoverEditTabOut extends CdkPopoverEdit {
    /**
     * @param {?} elementRef
     * @param {?} viewContainerRef
     * @param {?} services
     * @param {?} focusEscapeNotifierFactory
     */
    constructor(elementRef, viewContainerRef, services, focusEscapeNotifierFactory) {
        super(services, elementRef, viewContainerRef);
        this.focusEscapeNotifierFactory = focusEscapeNotifierFactory;
    }
    /**
     * @protected
     * @return {?}
     */
    initFocusTrap() {
        this.focusTrap = this.focusEscapeNotifierFactory.create((/** @type {?} */ (this.overlayRef)).overlayElement);
        this.focusTrap.escapes().pipe(takeUntil(this.destroyed)).subscribe((/**
         * @param {?} direction
         * @return {?}
         */
        direction => {
            if (this.services.editEventDispatcher.editRef) {
                this.services.editEventDispatcher.editRef.blur();
            }
            this.services.focusDispatcher.moveFocusHorizontally((/** @type {?} */ (closest((/** @type {?} */ (this.elementRef.nativeElement)), CELL_SELECTOR))), direction === 0 /* START */ ? -1 : 1);
            this.closeEditOverlay();
        }));
    }
}
CdkPopoverEditTabOut.decorators = [
    { type: Directive, args: [{
                selector: '[cdkPopoverEdit][cdkPopoverEditTabOut]',
                host: POPOVER_EDIT_HOST_BINDINGS,
                inputs: POPOVER_EDIT_INPUTS,
            },] }
];
/** @nocollapse */
CdkPopoverEditTabOut.ctorParameters = () => [
    { type: ElementRef },
    { type: ViewContainerRef },
    { type: EditServices },
    { type: FocusEscapeNotifierFactory }
];
if (false) {
    /**
     * @type {?}
     * @protected
     */
    CdkPopoverEditTabOut.prototype.focusTrap;
    /**
     * @type {?}
     * @protected
     */
    CdkPopoverEditTabOut.prototype.focusEscapeNotifierFactory;
}
/**
 * A structural directive that shows its contents when the table row containing
 * it is hovered or when an element in the row has focus.
 */
export class CdkRowHoverContent {
    /**
     * @param {?} services
     * @param {?} elementRef
     * @param {?} templateRef
     * @param {?} viewContainerRef
     */
    constructor(services, elementRef, templateRef, viewContainerRef) {
        this.services = services;
        this.elementRef = elementRef;
        this.templateRef = templateRef;
        this.viewContainerRef = viewContainerRef;
        this.destroyed = new Subject();
        this.viewRef = null;
    }
    /**
     * @return {?}
     */
    ngAfterViewInit() {
        this._row = (/** @type {?} */ (closest((/** @type {?} */ (this.elementRef.nativeElement)), ROW_SELECTOR)));
        this.services.editEventDispatcher.registerRowWithHoverContent(this._row);
        this._listenForHoverAndFocusEvents();
    }
    /**
     * @return {?}
     */
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
     * @protected
     * @param {?} _
     * @return {?}
     */
    initElement(_) {
    }
    /**
     * Called when the hover content needs to be focusable to preserve a reasonable tab ordering
     * but should not yet be shown.
     * @protected
     * @param {?} element
     * @return {?}
     */
    makeElementHiddenButFocusable(element) {
        element.style.opacity = '0';
    }
    /**
     * Called when the hover content needs to be focusable to preserve a reasonable tab ordering
     * but should not yet be shown.
     * @protected
     * @param {?} element
     * @return {?}
     */
    makeElementVisible(element) {
        element.style.opacity = '';
    }
    /**
     * @private
     * @return {?}
     */
    _listenForHoverAndFocusEvents() {
        this.services.editEventDispatcher.hoverOrFocusOnRow((/** @type {?} */ (this._row)))
            .pipe(takeUntil(this.destroyed))
            .subscribe((/**
         * @param {?} eventState
         * @return {?}
         */
        eventState => {
            // When in FOCUSABLE state, add the hover content to the dom but make it transparent so
            // that it is in the tab order relative to the currently focused row.
            if (eventState === 2 /* ON */ || eventState === 1 /* FOCUSABLE */) {
                if (!this.viewRef) {
                    this.viewRef = this.viewContainerRef.createEmbeddedView(this.templateRef, {});
                    this.initElement((/** @type {?} */ (this.viewRef.rootNodes[0])));
                    this.viewRef.markForCheck();
                }
                else if (this.viewContainerRef.indexOf(this.viewRef) === -1) {
                    this.viewContainerRef.insert((/** @type {?} */ (this.viewRef)));
                    this.viewRef.markForCheck();
                }
                if (eventState === 2 /* ON */) {
                    this.makeElementVisible((/** @type {?} */ (this.viewRef.rootNodes[0])));
                }
                else {
                    this.makeElementHiddenButFocusable((/** @type {?} */ (this.viewRef.rootNodes[0])));
                }
            }
            else if (this.viewRef) {
                this.viewContainerRef.detach(this.viewContainerRef.indexOf(this.viewRef));
            }
        }));
    }
}
CdkRowHoverContent.decorators = [
    { type: Directive, args: [{
                selector: '[cdkRowHoverContent]',
            },] }
];
/** @nocollapse */
CdkRowHoverContent.ctorParameters = () => [
    { type: EditServices },
    { type: ElementRef },
    { type: TemplateRef },
    { type: ViewContainerRef }
];
if (false) {
    /**
     * @type {?}
     * @protected
     */
    CdkRowHoverContent.prototype.destroyed;
    /**
     * @type {?}
     * @protected
     */
    CdkRowHoverContent.prototype.viewRef;
    /**
     * @type {?}
     * @private
     */
    CdkRowHoverContent.prototype._row;
    /**
     * @type {?}
     * @protected
     */
    CdkRowHoverContent.prototype.services;
    /**
     * @type {?}
     * @protected
     */
    CdkRowHoverContent.prototype.elementRef;
    /**
     * @type {?}
     * @protected
     */
    CdkRowHoverContent.prototype.templateRef;
    /**
     * @type {?}
     * @protected
     */
    CdkRowHoverContent.prototype.viewContainerRef;
}
/**
 * Opens the closest edit popover to this element, whether it's associated with this exact
 * element or an ancestor element.
 */
export class CdkEditOpen {
    /**
     * @param {?} elementRef
     * @param {?} editEventDispatcher
     */
    constructor(elementRef, editEventDispatcher) {
        this.elementRef = elementRef;
        this.editEventDispatcher = editEventDispatcher;
        /** @type {?} */
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
    /**
     * @param {?} evt
     * @return {?}
     */
    openEdit(evt) {
        this.editEventDispatcher.editing.next(closest((/** @type {?} */ (this.elementRef.nativeElement)), CELL_SELECTOR));
        evt.stopPropagation();
    }
}
CdkEditOpen.decorators = [
    { type: Directive, args: [{
                selector: '[cdkEditOpen]',
            },] }
];
/** @nocollapse */
CdkEditOpen.ctorParameters = () => [
    { type: ElementRef },
    { type: EditEventDispatcher }
];
CdkEditOpen.propDecorators = {
    openEdit: [{ type: HostListener, args: ['click', ['$event'],] }]
};
if (false) {
    /**
     * @type {?}
     * @protected
     */
    CdkEditOpen.prototype.elementRef;
    /**
     * @type {?}
     * @protected
     */
    CdkEditOpen.prototype.editEventDispatcher;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFibGUtZGlyZWN0aXZlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL3BvcG92ZXItZWRpdC90YWJsZS1kaXJlY3RpdmVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBU0EsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQ25ELE9BQU8sRUFFTCxTQUFTLEVBQ1QsVUFBVSxFQUVWLE1BQU0sRUFFTixXQUFXLEVBQ1gsZ0JBQWdCLEVBQ2hCLFlBQVksR0FDYixNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUMsU0FBUyxFQUFFLGdCQUFnQixFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDakUsT0FBTyxFQUNMLE1BQU0sRUFDTixHQUFHLEVBQ0gsS0FBSyxFQUNMLEtBQUssRUFDTCxTQUFTLEVBQ1QsU0FBUyxFQUNULFlBQVksRUFDWixjQUFjLEdBQ2YsTUFBTSxnQkFBZ0IsQ0FBQztBQUV4QixPQUFPLEVBQUMsYUFBYSxFQUFFLGVBQWUsRUFBRSxrQkFBa0IsRUFBRSxZQUFZLEVBQUMsTUFBTSxhQUFhLENBQUM7QUFDN0YsT0FBTyxFQUFDLG1CQUFtQixFQUFvQixNQUFNLHlCQUF5QixDQUFDO0FBQy9FLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUM3QyxPQUFPLEVBQUMsZUFBZSxFQUFDLE1BQU0sb0JBQW9CLENBQUM7QUFDbkQsT0FBTyxFQUdMLDBCQUEwQixFQUMzQixNQUFNLHlCQUF5QixDQUFDO0FBQ2pDLE9BQU8sRUFBQyxPQUFPLEVBQUMsTUFBTSxZQUFZLENBQUM7Ozs7Ozs7QUFPbkMsMkNBR0M7OztJQUZDLHVDQUFnQjs7SUFDaEIsc0NBQWU7Ozs7OztNQUlYLDJCQUEyQixHQUFHLEVBQUU7Ozs7OztBQVd0QyxNQUFNLE9BQU8sV0FBVzs7Ozs7OztJQUd0QixZQUN1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QU0sQ0FBQyxFQUFFO1lBQzlFLGFBQWEsQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1NBQzlDO0lBQ0gsQ0FBQzs7Ozs7Ozs7O0lBT0QsUUFBUSxDQUFDLEdBQVU7UUFDakIsSUFBSSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLG1CQUFBLElBQUksQ0FBQyxVQUFVLENBQUMsYUFBYSxFQUFDLEVBQUUsYUFBYSxDQUFDLENBQUMsQ0FBQztRQUM5RixHQUFHLENBQUMsZUFBZSxFQUFFLENBQUM7SUFDeEIsQ0FBQzs7O1lBeEJGLFNBQVMsU0FBQztnQkFDVCxRQUFRLEVBQUUsZUFBZTthQUMxQjs7OztZQXpkQyxVQUFVO1lBcUJKLG1CQUFtQjs7O3VCQXNkeEIsWUFBWSxTQUFDLE9BQU8sRUFBRSxDQUFDLFFBQVEsQ0FBQzs7Ozs7OztJQWY3QixpQ0FBc0Q7Ozs7O0lBQ3RELDBDQUEyRCIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtGb2N1c1RyYXB9IGZyb20gJ0Bhbmd1bGFyL2Nkay9hMTF5JztcbmltcG9ydCB7T3ZlcmxheVJlZiwgUG9zaXRpb25TdHJhdGVneX0gZnJvbSAnQGFuZ3VsYXIvY2RrL292ZXJsYXknO1xuaW1wb3J0IHtUZW1wbGF0ZVBvcnRhbH0gZnJvbSAnQGFuZ3VsYXIvY2RrL3BvcnRhbCc7XG5pbXBvcnQge1xuICBBZnRlclZpZXdJbml0LFxuICBEaXJlY3RpdmUsXG4gIEVsZW1lbnRSZWYsXG4gIEVtYmVkZGVkVmlld1JlZixcbiAgTmdab25lLFxuICBPbkRlc3Ryb3ksXG4gIFRlbXBsYXRlUmVmLFxuICBWaWV3Q29udGFpbmVyUmVmLFxuICBIb3N0TGlzdGVuZXIsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtmcm9tRXZlbnQsIGZyb21FdmVudFBhdHRlcm4sIG1lcmdlLCBTdWJqZWN0fSBmcm9tICdyeGpzJztcbmltcG9ydCB7XG4gIGZpbHRlcixcbiAgbWFwLFxuICBtYXBUbyxcbiAgc2hhcmUsXG4gIHN0YXJ0V2l0aCxcbiAgdGFrZVVudGlsLFxuICB0aHJvdHRsZVRpbWUsXG4gIHdpdGhMYXRlc3RGcm9tLFxufSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbmltcG9ydCB7Q0VMTF9TRUxFQ1RPUiwgRURJVF9QQU5FX0NMQVNTLCBFRElUX1BBTkVfU0VMRUNUT1IsIFJPV19TRUxFQ1RPUn0gZnJvbSAnLi9jb25zdGFudHMnO1xuaW1wb3J0IHtFZGl0RXZlbnREaXNwYXRjaGVyLCBIb3ZlckNvbnRlbnRTdGF0ZX0gZnJvbSAnLi9lZGl0LWV2ZW50LWRpc3BhdGNoZXInO1xuaW1wb3J0IHtFZGl0U2VydmljZXN9IGZyb20gJy4vZWRpdC1zZXJ2aWNlcyc7XG5pbXBvcnQge0ZvY3VzRGlzcGF0Y2hlcn0gZnJvbSAnLi9mb2N1cy1kaXNwYXRjaGVyJztcbmltcG9ydCB7XG4gIEZvY3VzRXNjYXBlTm90aWZpZXIsXG4gIEZvY3VzRXNjYXBlTm90aWZpZXJEaXJlY3Rpb24sXG4gIEZvY3VzRXNjYXBlTm90aWZpZXJGYWN0b3J5XG59IGZyb20gJy4vZm9jdXMtZXNjYXBlLW5vdGlmaWVyJztcbmltcG9ydCB7Y2xvc2VzdH0gZnJvbSAnLi9wb2x5ZmlsbCc7XG5cbi8qKlxuICogRGVzY3JpYmVzIHRoZSBudW1iZXIgb2YgY29sdW1ucyBiZWZvcmUgYW5kIGFmdGVyIHRoZSBvcmlnaW5hdGluZyBjZWxsIHRoYXQgdGhlXG4gKiBlZGl0IHBvcHVwIHNob3VsZCBzcGFuLiBJbiBsZWZ0IHRvIHJpZ2h0IGxvY2FsZXMsIGJlZm9yZSBtZWFucyBsZWZ0IGFuZCBhZnRlciBtZWFuc1xuICogcmlnaHQuIEluIHJpZ2h0IHRvIGxlZnQgbG9jYWxlcyBiZWZvcmUgbWVhbnMgcmlnaHQgYW5kIGFmdGVyIG1lYW5zIGxlZnQuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ2RrUG9wb3ZlckVkaXRDb2xzcGFuIHtcbiAgYmVmb3JlPzogbnVtYmVyO1xuICBhZnRlcj86IG51bWJlcjtcbn1cblxuLyoqIFVzZWQgZm9yIHJhdGUtbGltaXRpbmcgbW91c2Vtb3ZlIGV2ZW50cy4gKi9cbmNvbnN0IE1PVVNFX01PVkVfVEhST1RUTEVfVElNRV9NUyA9IDEwO1xuXG4vKipcbiAqIEEgZGlyZWN0aXZlIHRoYXQgbXVzdCBiZSBhdHRhY2hlZCB0byBlbmFibGUgZWRpdGFiaWxpdHkgb24gYSB0YWJsZS5cbiAqIEl0IGlzIHJlc3BvbnNpYmxlIGZvciBzZXR0aW5nIHVwIGRlbGVnYXRlZCBldmVudCBoYW5kbGVycyBhbmQgcHJvdmlkaW5nIHRoZVxuICogRWRpdEV2ZW50RGlzcGF0Y2hlciBzZXJ2aWNlIGZvciB1c2UgYnkgdGhlIG90aGVyIGVkaXQgZGlyZWN0aXZlcy5cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAndGFibGVbZWRpdGFibGVdLCBjZGstdGFibGVbZWRpdGFibGVdLCBtYXQtdGFibGVbZWRpdGFibGVdJyxcbiAgcHJvdmlkZXJzOiBbRWRpdEV2ZW50RGlzcGF0Y2hlciwgRWRpdFNlcnZpY2VzXSxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrRWRpdGFibGUgaW1wbGVtZW50cyBBZnRlclZpZXdJbml0LCBPbkRlc3Ryb3kge1xuICBwcm90ZWN0ZWQgcmVhZG9ubHkgZGVzdHJveWVkID0gbmV3IFN1YmplY3Q8dm9pZD4oKTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByb3RlY3RlZCByZWFkb25seSBlbGVtZW50UmVmOiBFbGVtZW50UmVmLFxuICAgICAgcHJvdGVjdGVkIHJlYWRvbmx5IGVkaXRFdmVudERpc3BhdGNoZXI6IEVkaXRFdmVudERpc3BhdGNoZXIsXG4gICAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgZm9jdXNEaXNwYXRjaGVyOiBGb2N1c0Rpc3BhdGNoZXIsIHByb3RlY3RlZCByZWFkb25seSBuZ1pvbmU6IE5nWm9uZSkge31cblxuICBuZ0FmdGVyVmlld0luaXQoKTogdm9pZCB7XG4gICAgdGhpcy5fbGlzdGVuRm9yVGFibGVFdmVudHMoKTtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCk6IHZvaWQge1xuICAgIHRoaXMuZGVzdHJveWVkLm5leHQoKTtcbiAgICB0aGlzLmRlc3Ryb3llZC5jb21wbGV0ZSgpO1xuICB9XG5cbiAgcHJpdmF0ZSBfbGlzdGVuRm9yVGFibGVFdmVudHMoKTogdm9pZCB7XG4gICAgY29uc3QgZWxlbWVudCA9IHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50O1xuICAgIGNvbnN0IHRvQ2xvc2VzdCA9IChzZWxlY3Rvcjogc3RyaW5nKSA9PlxuICAgICAgICBtYXAoKGV2ZW50OiBVSUV2ZW50KSA9PiBjbG9zZXN0KGV2ZW50LnRhcmdldCwgc2VsZWN0b3IpKTtcblxuICAgIHRoaXMubmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgIC8vIFRyYWNrIG1vdXNlIG1vdmVtZW50IG92ZXIgdGhlIHRhYmxlIHRvIGhpZGUvc2hvdyBob3ZlciBjb250ZW50LlxuICAgICAgZnJvbUV2ZW50PE1vdXNlRXZlbnQ+KGVsZW1lbnQsICdtb3VzZW92ZXInKS5waXBlKFxuICAgICAgICAgIHRvQ2xvc2VzdChST1dfU0VMRUNUT1IpLFxuICAgICAgICAgIHRha2VVbnRpbCh0aGlzLmRlc3Ryb3llZCksXG4gICAgICAgICAgKS5zdWJzY3JpYmUodGhpcy5lZGl0RXZlbnREaXNwYXRjaGVyLmhvdmVyaW5nKTtcbiAgICAgIGZyb21FdmVudDxNb3VzZUV2ZW50PihlbGVtZW50LCAnbW91c2VsZWF2ZScpLnBpcGUoXG4gICAgICAgICAgbWFwVG8obnVsbCksXG4gICAgICAgICAgdGFrZVVudGlsKHRoaXMuZGVzdHJveWVkKSxcbiAgICAgICAgICApLnN1YnNjcmliZSh0aGlzLmVkaXRFdmVudERpc3BhdGNoZXIuaG92ZXJpbmcpO1xuICAgICAgZnJvbUV2ZW50PE1vdXNlRXZlbnQ+KGVsZW1lbnQsICdtb3VzZW1vdmUnKS5waXBlKFxuICAgICAgICAgIHRocm90dGxlVGltZShNT1VTRV9NT1ZFX1RIUk9UVExFX1RJTUVfTVMpLFxuICAgICAgICAgIHRvQ2xvc2VzdChST1dfU0VMRUNUT1IpLFxuICAgICAgICAgIHRha2VVbnRpbCh0aGlzLmRlc3Ryb3llZCksXG4gICAgICAgICAgKS5zdWJzY3JpYmUodGhpcy5lZGl0RXZlbnREaXNwYXRjaGVyLm1vdXNlTW92ZSk7XG5cbiAgICAgIC8vIFRyYWNrIGZvY3VzIHdpdGhpbiB0aGUgdGFibGUgdG8gaGlkZS9zaG93L21ha2UgZm9jdXNhYmxlIGhvdmVyIGNvbnRlbnQuXG4gICAgICBmcm9tRXZlbnRQYXR0ZXJuPEZvY3VzRXZlbnQ+KFxuICAgICAgICAgIGhhbmRsZXIgPT4gZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdmb2N1cycsIGhhbmRsZXIsIHRydWUpLFxuICAgICAgICAgIGhhbmRsZXIgPT4gZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdmb2N1cycsIGhhbmRsZXIsIHRydWUpXG4gICAgICAgICAgKS5waXBlKFxuICAgICAgICAgICAgICB0YWtlVW50aWwodGhpcy5kZXN0cm95ZWQpLFxuICAgICAgICAgICAgICB0b0Nsb3Nlc3QoUk9XX1NFTEVDVE9SKSxcbiAgICAgICAgICAgICAgc2hhcmUoKSxcbiAgICAgICAgICAgICAgKS5zdWJzY3JpYmUodGhpcy5lZGl0RXZlbnREaXNwYXRjaGVyLmZvY3VzZWQpO1xuXG4gICAgICBtZXJnZShcbiAgICAgICAgZnJvbUV2ZW50UGF0dGVybjxGb2N1c0V2ZW50PihcbiAgICAgICAgICBoYW5kbGVyID0+IGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignYmx1cicsIGhhbmRsZXIsIHRydWUpLFxuICAgICAgICAgIGhhbmRsZXIgPT4gZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdibHVyJywgaGFuZGxlciwgdHJ1ZSlcbiAgICAgICAgKSxcbiAgICAgICAgZnJvbUV2ZW50PEtleWJvYXJkRXZlbnQ+KGVsZW1lbnQsICdrZXlkb3duJykucGlwZShmaWx0ZXIoZXZlbnQgPT4gZXZlbnQua2V5ID09PSAnRXNjYXBlJykpXG4gICAgICApLnBpcGUoXG4gICAgICAgIHRha2VVbnRpbCh0aGlzLmRlc3Ryb3llZCksXG4gICAgICAgIG1hcFRvKG51bGwpLFxuICAgICAgICBzaGFyZSgpLFxuICAgICAgKS5zdWJzY3JpYmUodGhpcy5lZGl0RXZlbnREaXNwYXRjaGVyLmZvY3VzZWQpO1xuXG4gICAgICAvLyBLZWVwIHRyYWNrIG9mIHJvd3Mgd2l0aGluIHRoZSB0YWJsZS4gVGhpcyBpcyB1c2VkIHRvIGtub3cgd2hpY2ggcm93cyB3aXRoIGhvdmVyIGNvbnRlbnRcbiAgICAgIC8vIGFyZSBmaXJzdCBvciBsYXN0IGluIHRoZSB0YWJsZS4gVGhleSBhcmUga2VwdCBmb2N1c2FibGUgaW4gY2FzZSBmb2N1cyBlbnRlcnMgZnJvbSBhYm92ZVxuICAgICAgLy8gb3IgYmVsb3cgdGhlIHRhYmxlLlxuICAgICAgdGhpcy5uZ1pvbmUub25TdGFibGUucGlwZShcbiAgICAgICAgICB0YWtlVW50aWwodGhpcy5kZXN0cm95ZWQpLFxuICAgICAgICAgIC8vIE9wdGltaXphdGlvbjogaWdub3JlIGRvbSBjaGFuZ2VzIHdoaWxlIGZvY3VzIGlzIHdpdGhpbiB0aGUgdGFibGUgYXMgd2UgYWxyZWFkeVxuICAgICAgICAgIC8vIGVuc3VyZSB0aGF0IHJvd3MgYWJvdmUgYW5kIGJlbG93IHRoZSBmb2N1c2VkL2FjdGl2ZSByb3cgYXJlIHRhYmJhYmxlLlxuICAgICAgICAgIHdpdGhMYXRlc3RGcm9tKHRoaXMuZWRpdEV2ZW50RGlzcGF0Y2hlci5lZGl0aW5nT3JGb2N1c2VkKSxcbiAgICAgICAgICBmaWx0ZXIoKFtfLCBhY3RpdmVSb3ddKSA9PiBhY3RpdmVSb3cgPT0gbnVsbCksXG4gICAgICAgICAgbWFwKCgpID0+IGVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChST1dfU0VMRUNUT1IpKSxcbiAgICAgICAgICBzaGFyZSgpLFxuICAgICAgICAgICkuc3Vic2NyaWJlKHRoaXMuZWRpdEV2ZW50RGlzcGF0Y2hlci5hbGxSb3dzKTtcblxuICAgICAgZnJvbUV2ZW50PEtleWJvYXJkRXZlbnQ+KGVsZW1lbnQsICdrZXlkb3duJykucGlwZShcbiAgICAgICAgICBmaWx0ZXIoZXZlbnQgPT4gZXZlbnQua2V5ID09PSAnRW50ZXInKSxcbiAgICAgICAgICB0b0Nsb3Nlc3QoQ0VMTF9TRUxFQ1RPUiksXG4gICAgICAgICAgdGFrZVVudGlsKHRoaXMuZGVzdHJveWVkKSxcbiAgICAgICAgICApLnN1YnNjcmliZSh0aGlzLmVkaXRFdmVudERpc3BhdGNoZXIuZWRpdGluZyk7XG5cbiAgICAgIC8vIEtleWRvd24gbXVzdCBiZSB1c2VkIGhlcmUgb3IgZWxzZSBrZXkgYXV0b3JlcGVhdCBkb2VzIG5vdCB3b3JrIHByb3Blcmx5IG9uIHNvbWUgcGxhdGZvcm1zLlxuICAgICAgZnJvbUV2ZW50PEtleWJvYXJkRXZlbnQ+KGVsZW1lbnQsICdrZXlkb3duJylcbiAgICAgICAgICAucGlwZSh0YWtlVW50aWwodGhpcy5kZXN0cm95ZWQpKVxuICAgICAgICAgIC5zdWJzY3JpYmUodGhpcy5mb2N1c0Rpc3BhdGNoZXIua2V5T2JzZXJ2ZXIpO1xuICAgIH0pO1xuICB9XG59XG5cbmNvbnN0IFBPUE9WRVJfRURJVF9IT1NUX0JJTkRJTkdTID0ge1xuICAnW2F0dHIudGFiaW5kZXhdJzogJ2Rpc2FibGVkID8gbnVsbCA6IDAnLFxuICAnY2xhc3MnOiAnY2RrLXBvcG92ZXItZWRpdC1jZWxsJyxcbiAgJ1thdHRyLmFyaWEtaGFzcG9wdXBdJzogJyFkaXNhYmxlZCcsXG59O1xuXG5jb25zdCBQT1BPVkVSX0VESVRfSU5QVVRTID0gW1xuICAndGVtcGxhdGU6IGNka1BvcG92ZXJFZGl0JyxcbiAgJ2NvbnRleHQ6IGNka1BvcG92ZXJFZGl0Q29udGV4dCcsXG4gICdjb2xzcGFuOiBjZGtQb3BvdmVyRWRpdENvbHNwYW4nLFxuICAnZGlzYWJsZWQ6IGNka1BvcG92ZXJFZGl0RGlzYWJsZWQnLFxuXTtcblxuLyoqXG4gKiBBdHRhY2hlcyBhbiBuZy10ZW1wbGF0ZSB0byBhIGNlbGwgYW5kIHNob3dzIGl0IHdoZW4gaW5zdHJ1Y3RlZCB0byBieSB0aGVcbiAqIEVkaXRFdmVudERpc3BhdGNoZXIgc2VydmljZS5cbiAqIE1ha2VzIHRoZSBjZWxsIGZvY3VzYWJsZS5cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW2Nka1BvcG92ZXJFZGl0XTpub3QoW2Nka1BvcG92ZXJFZGl0VGFiT3V0XSknLFxuICBob3N0OiBQT1BPVkVSX0VESVRfSE9TVF9CSU5ESU5HUyxcbiAgaW5wdXRzOiBQT1BPVkVSX0VESVRfSU5QVVRTLFxufSlcbmV4cG9ydCBjbGFzcyBDZGtQb3BvdmVyRWRpdDxDPiBpbXBsZW1lbnRzIEFmdGVyVmlld0luaXQsIE9uRGVzdHJveSB7XG4gIC8qKiBUaGUgZWRpdCBsZW5zIHRlbXBsYXRlIHNob3duIG92ZXIgdGhlIGNlbGwgb24gZWRpdC4gKi9cbiAgdGVtcGxhdGU6IFRlbXBsYXRlUmVmPGFueT58bnVsbCA9IG51bGw7XG5cbiAgLyoqXG4gICAqIEltcGxpY2l0IGNvbnRleHQgdG8gcGFzcyBhbG9uZyB0byB0aGUgdGVtcGxhdGUuIENhbiBiZSBvbWl0dGVkIGlmIHRoZSB0ZW1wbGF0ZVxuICAgKiBpcyBkZWZpbmVkIHdpdGhpbiB0aGUgY2VsbC5cbiAgICovXG4gIGNvbnRleHQ/OiBDO1xuXG4gIC8qKlxuICAgKiBTcGVjaWZpZXMgdGhhdCB0aGUgcG9wdXAgc2hvdWxkIGNvdmVyIGFkZGl0aW9uYWwgdGFibGUgY2VsbHMgYmVmb3JlIGFuZC9vciBhZnRlclxuICAgKiB0aGlzIG9uZS5cbiAgICovXG4gIGdldCBjb2xzcGFuKCk6IENka1BvcG92ZXJFZGl0Q29sc3BhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2NvbHNwYW47XG4gIH1cbiAgc2V0IGNvbHNwYW4odmFsdWU6IENka1BvcG92ZXJFZGl0Q29sc3Bhbikge1xuICAgIHRoaXMuX2NvbHNwYW4gPSB2YWx1ZTtcblxuICAgIC8vIFJlY29tcHV0ZSBwb3NpdGlvbmluZyB3aGVuIHRoZSBjb2xzcGFuIGNoYW5nZXMuXG4gICAgaWYgKHRoaXMub3ZlcmxheVJlZikge1xuICAgICAgdGhpcy5vdmVybGF5UmVmLnVwZGF0ZVBvc2l0aW9uU3RyYXRlZ3kodGhpcy5fZ2V0UG9zaXRpb25TdHJhdGVneSgpKTtcblxuICAgICAgaWYgKHRoaXMub3ZlcmxheVJlZi5oYXNBdHRhY2hlZCgpKSB7XG4gICAgICAgIHRoaXMuX3VwZGF0ZU92ZXJsYXlTaXplKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHByaXZhdGUgX2NvbHNwYW46IENka1BvcG92ZXJFZGl0Q29sc3BhbiA9IHt9O1xuXG4gIC8qKiBXaGV0aGVyIHBvcG92ZXIgZWRpdCBpcyBkaXNhYmxlZCBmb3IgdGhpcyBjZWxsLiAqL1xuICBnZXQgZGlzYWJsZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2Rpc2FibGVkO1xuICB9XG4gIHNldCBkaXNhYmxlZCh2YWx1ZTogYm9vbGVhbikge1xuICAgIHRoaXMuX2Rpc2FibGVkID0gdmFsdWU7XG5cbiAgICBpZiAodmFsdWUpIHtcbiAgICAgIHRoaXMuc2VydmljZXMuZWRpdEV2ZW50RGlzcGF0Y2hlci5kb25lRWRpdGluZ0NlbGwodGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQhKTtcbiAgICAgIHRoaXMuc2VydmljZXMuZWRpdEV2ZW50RGlzcGF0Y2hlci5kaXNhYmxlZENlbGxzLnNldCh0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCEsIHRydWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnNlcnZpY2VzLmVkaXRFdmVudERpc3BhdGNoZXIuZGlzYWJsZWRDZWxscy5kZWxldGUodGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQhKTtcbiAgICB9XG4gIH1cbiAgcHJpdmF0ZSBfZGlzYWJsZWQgPSBmYWxzZTtcblxuICBwcm90ZWN0ZWQgZm9jdXNUcmFwPzogRm9jdXNUcmFwO1xuICBwcm90ZWN0ZWQgb3ZlcmxheVJlZj86IE92ZXJsYXlSZWY7XG4gIHByb3RlY3RlZCByZWFkb25seSBkZXN0cm95ZWQgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJvdGVjdGVkIHJlYWRvbmx5IHNlcnZpY2VzOiBFZGl0U2VydmljZXMsIHByb3RlY3RlZCByZWFkb25seSBlbGVtZW50UmVmOiBFbGVtZW50UmVmLFxuICAgICAgcHJvdGVjdGVkIHJlYWRvbmx5IHZpZXdDb250YWluZXJSZWY6IFZpZXdDb250YWluZXJSZWYpIHt9XG5cbiAgbmdBZnRlclZpZXdJbml0KCk6IHZvaWQge1xuICAgIHRoaXMuX3N0YXJ0TGlzdGVuaW5nVG9FZGl0RXZlbnRzKCk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLmRlc3Ryb3llZC5uZXh0KCk7XG4gICAgdGhpcy5kZXN0cm95ZWQuY29tcGxldGUoKTtcblxuICAgIGlmICh0aGlzLmZvY3VzVHJhcCkge1xuICAgICAgdGhpcy5mb2N1c1RyYXAuZGVzdHJveSgpO1xuICAgICAgdGhpcy5mb2N1c1RyYXAgPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMub3ZlcmxheVJlZikge1xuICAgICAgdGhpcy5vdmVybGF5UmVmLmRpc3Bvc2UoKTtcbiAgICB9XG4gIH1cblxuICBwcm90ZWN0ZWQgaW5pdEZvY3VzVHJhcCgpOiB2b2lkIHtcbiAgICB0aGlzLmZvY3VzVHJhcCA9IHRoaXMuc2VydmljZXMuZm9jdXNUcmFwRmFjdG9yeS5jcmVhdGUodGhpcy5vdmVybGF5UmVmIS5vdmVybGF5RWxlbWVudCk7XG4gIH1cblxuICBwcm90ZWN0ZWQgY2xvc2VFZGl0T3ZlcmxheSgpOiB2b2lkIHtcbiAgICB0aGlzLnNlcnZpY2VzLmVkaXRFdmVudERpc3BhdGNoZXIuZG9uZUVkaXRpbmdDZWxsKHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50ISk7XG4gIH1cblxuICBwcm90ZWN0ZWQgcGFuZWxDbGFzcygpOiBzdHJpbmcge1xuICAgIHJldHVybiBFRElUX1BBTkVfQ0xBU1M7XG4gIH1cblxuICBwcml2YXRlIF9zdGFydExpc3RlbmluZ1RvRWRpdEV2ZW50cygpOiB2b2lkIHtcbiAgICB0aGlzLnNlcnZpY2VzLmVkaXRFdmVudERpc3BhdGNoZXIuZWRpdGluZ0NlbGwodGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQhKVxuICAgICAgICAucGlwZSh0YWtlVW50aWwodGhpcy5kZXN0cm95ZWQpKVxuICAgICAgICAuc3Vic2NyaWJlKChvcGVuKSA9PiB7XG4gICAgICAgICAgaWYgKG9wZW4gJiYgdGhpcy50ZW1wbGF0ZSkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLm92ZXJsYXlSZWYpIHtcbiAgICAgICAgICAgICAgdGhpcy5fY3JlYXRlRWRpdE92ZXJsYXkoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5fc2hvd0VkaXRPdmVybGF5KCk7XG4gICAgICAgICAgfSBlbHNlIGlmICh0aGlzLm92ZXJsYXlSZWYpIHtcbiAgICAgICAgICAgIHRoaXMuX21heWJlUmV0dXJuRm9jdXNUb0NlbGwoKTtcblxuICAgICAgICAgICAgdGhpcy5vdmVybGF5UmVmLmRldGFjaCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gIH1cblxuICBwcml2YXRlIF9jcmVhdGVFZGl0T3ZlcmxheSgpOiB2b2lkIHtcbiAgICB0aGlzLm92ZXJsYXlSZWYgPSB0aGlzLnNlcnZpY2VzLm92ZXJsYXkuY3JlYXRlKHtcbiAgICAgIGRpc3Bvc2VPbk5hdmlnYXRpb246IHRydWUsXG4gICAgICBwYW5lbENsYXNzOiB0aGlzLnBhbmVsQ2xhc3MoKSxcbiAgICAgIHBvc2l0aW9uU3RyYXRlZ3k6IHRoaXMuX2dldFBvc2l0aW9uU3RyYXRlZ3koKSxcbiAgICAgIHNjcm9sbFN0cmF0ZWd5OiB0aGlzLnNlcnZpY2VzLm92ZXJsYXkuc2Nyb2xsU3RyYXRlZ2llcy5yZXBvc2l0aW9uKCksXG4gICAgICBkaXJlY3Rpb246IHRoaXMuc2VydmljZXMuZGlyZWN0aW9uYWxpdHksXG4gICAgfSk7XG5cbiAgICB0aGlzLmluaXRGb2N1c1RyYXAoKTtcbiAgICB0aGlzLm92ZXJsYXlSZWYub3ZlcmxheUVsZW1lbnQuc2V0QXR0cmlidXRlKCdhcmlhLXJvbGUnLCAnZGlhbG9nJyk7XG5cbiAgICB0aGlzLm92ZXJsYXlSZWYuZGV0YWNobWVudHMoKS5zdWJzY3JpYmUoKCkgPT4gdGhpcy5jbG9zZUVkaXRPdmVybGF5KCkpO1xuICB9XG5cbiAgcHJpdmF0ZSBfc2hvd0VkaXRPdmVybGF5KCk6IHZvaWQge1xuICAgIHRoaXMub3ZlcmxheVJlZiEuYXR0YWNoKG5ldyBUZW1wbGF0ZVBvcnRhbChcbiAgICAgICAgdGhpcy50ZW1wbGF0ZSEsXG4gICAgICAgIHRoaXMudmlld0NvbnRhaW5lclJlZixcbiAgICAgICAgeyRpbXBsaWNpdDogdGhpcy5jb250ZXh0fSkpO1xuXG4gICAgLy8gV2UgaGF2ZSB0byBkZWZlciB0cmFwcGluZyBmb2N1cywgYmVjYXVzZSBkb2luZyBzbyB0b28gZWFybHkgY2FuIGNhdXNlIHRoZSBmb3JtIGluc2lkZVxuICAgIC8vIHRoZSBvdmVybGF5IHRvIGJlIHN1Ym1pdHRlZCBpbW1lZGlhdGVseSBpZiBpdCB3YXMgb3BlbmVkIG9uIGFuIEVudGVyIGtleWRvd24gZXZlbnQuXG4gICAgdGhpcy5zZXJ2aWNlcy5uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHRoaXMuZm9jdXNUcmFwIS5mb2N1c0luaXRpYWxFbGVtZW50KCk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIC8vIFVwZGF0ZSB0aGUgc2l6ZSBvZiB0aGUgcG9wdXAgaW5pdGlhbGx5IGFuZCBvbiBzdWJzZXF1ZW50IGNoYW5nZXMgdG9cbiAgICAvLyBzY3JvbGwgcG9zaXRpb24gYW5kIHZpZXdwb3J0IHNpemUuXG4gICAgbWVyZ2UodGhpcy5zZXJ2aWNlcy5zY3JvbGxEaXNwYXRjaGVyLnNjcm9sbGVkKCksIHRoaXMuc2VydmljZXMudmlld3BvcnRSdWxlci5jaGFuZ2UoKSlcbiAgICAgICAgLnBpcGUoXG4gICAgICAgICAgICBzdGFydFdpdGgobnVsbCksXG4gICAgICAgICAgICB0YWtlVW50aWwodGhpcy5vdmVybGF5UmVmIS5kZXRhY2htZW50cygpKSxcbiAgICAgICAgICAgIHRha2VVbnRpbCh0aGlzLmRlc3Ryb3llZCksXG4gICAgICAgICAgICApXG4gICAgICAgIC5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgICAgIHRoaXMuX3VwZGF0ZU92ZXJsYXlTaXplKCk7XG4gICAgICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0T3ZlcmxheUNlbGxzKCk6IEhUTUxFbGVtZW50W10ge1xuICAgIGNvbnN0IGNlbGwgPSBjbG9zZXN0KHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50ISwgQ0VMTF9TRUxFQ1RPUikgYXMgSFRNTEVsZW1lbnQ7XG5cbiAgICBpZiAoIXRoaXMuX2NvbHNwYW4uYmVmb3JlICYmICF0aGlzLl9jb2xzcGFuLmFmdGVyKSB7XG4gICAgICByZXR1cm4gW2NlbGxdO1xuICAgIH1cblxuICAgIGNvbnN0IHJvdyA9IGNsb3Nlc3QodGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQhLCBST1dfU0VMRUNUT1IpITtcbiAgICBjb25zdCByb3dDZWxscyA9IEFycmF5LmZyb20ocm93LnF1ZXJ5U2VsZWN0b3JBbGwoQ0VMTF9TRUxFQ1RPUikpIGFzIEhUTUxFbGVtZW50W107XG4gICAgY29uc3Qgb3duSW5kZXggPSByb3dDZWxscy5pbmRleE9mKGNlbGwpO1xuXG4gICAgcmV0dXJuIHJvd0NlbGxzLnNsaWNlKFxuICAgICAgICBvd25JbmRleCAtICh0aGlzLl9jb2xzcGFuLmJlZm9yZSB8fCAwKSwgb3duSW5kZXggKyAodGhpcy5fY29sc3Bhbi5hZnRlciB8fCAwKSArIDEpO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0UG9zaXRpb25TdHJhdGVneSgpOiBQb3NpdGlvblN0cmF0ZWd5IHtcbiAgICByZXR1cm4gdGhpcy5zZXJ2aWNlcy5wb3NpdGlvbkZhY3RvcnkucG9zaXRpb25TdHJhdGVneUZvckNlbGxzKHRoaXMuX2dldE92ZXJsYXlDZWxscygpKTtcbiAgfVxuXG4gIHByaXZhdGUgX3VwZGF0ZU92ZXJsYXlTaXplKCk6IHZvaWQge1xuICAgIHRoaXMub3ZlcmxheVJlZiEudXBkYXRlU2l6ZShcbiAgICAgICAgdGhpcy5zZXJ2aWNlcy5wb3NpdGlvbkZhY3Rvcnkuc2l6ZUNvbmZpZ0ZvckNlbGxzKHRoaXMuX2dldE92ZXJsYXlDZWxscygpKSk7XG4gIH1cblxuICBwcml2YXRlIF9tYXliZVJldHVybkZvY3VzVG9DZWxsKCk6IHZvaWQge1xuICAgIGlmIChjbG9zZXN0KGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQsIEVESVRfUEFORV9TRUxFQ1RPUikgPT09XG4gICAgICAgIHRoaXMub3ZlcmxheVJlZiEub3ZlcmxheUVsZW1lbnQpIHtcbiAgICAgIHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50IS5mb2N1cygpO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEF0dGFjaGVzIGFuIG5nLXRlbXBsYXRlIHRvIGEgY2VsbCBhbmQgc2hvd3MgaXQgd2hlbiBpbnN0cnVjdGVkIHRvIGJ5IHRoZVxuICogRWRpdEV2ZW50RGlzcGF0Y2hlciBzZXJ2aWNlLlxuICogTWFrZXMgdGhlIGNlbGwgZm9jdXNhYmxlLlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbY2RrUG9wb3ZlckVkaXRdW2Nka1BvcG92ZXJFZGl0VGFiT3V0XScsXG4gIGhvc3Q6IFBPUE9WRVJfRURJVF9IT1NUX0JJTkRJTkdTLFxuICBpbnB1dHM6IFBPUE9WRVJfRURJVF9JTlBVVFMsXG59KVxuZXhwb3J0IGNsYXNzIENka1BvcG92ZXJFZGl0VGFiT3V0PEM+IGV4dGVuZHMgQ2RrUG9wb3ZlckVkaXQ8Qz4ge1xuICBwcm90ZWN0ZWQgZm9jdXNUcmFwPzogRm9jdXNFc2NhcGVOb3RpZmllcjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIGVsZW1lbnRSZWY6IEVsZW1lbnRSZWYsIHZpZXdDb250YWluZXJSZWY6IFZpZXdDb250YWluZXJSZWYsIHNlcnZpY2VzOiBFZGl0U2VydmljZXMsXG4gICAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgZm9jdXNFc2NhcGVOb3RpZmllckZhY3Rvcnk6IEZvY3VzRXNjYXBlTm90aWZpZXJGYWN0b3J5KSB7XG4gICAgc3VwZXIoc2VydmljZXMsIGVsZW1lbnRSZWYsIHZpZXdDb250YWluZXJSZWYpO1xuICB9XG5cbiAgcHJvdGVjdGVkIGluaXRGb2N1c1RyYXAoKTogdm9pZCB7XG4gICAgdGhpcy5mb2N1c1RyYXAgPSB0aGlzLmZvY3VzRXNjYXBlTm90aWZpZXJGYWN0b3J5LmNyZWF0ZSh0aGlzLm92ZXJsYXlSZWYhLm92ZXJsYXlFbGVtZW50KTtcblxuICAgIHRoaXMuZm9jdXNUcmFwLmVzY2FwZXMoKS5waXBlKHRha2VVbnRpbCh0aGlzLmRlc3Ryb3llZCkpLnN1YnNjcmliZShkaXJlY3Rpb24gPT4ge1xuICAgICAgaWYgKHRoaXMuc2VydmljZXMuZWRpdEV2ZW50RGlzcGF0Y2hlci5lZGl0UmVmKSB7XG4gICAgICAgIHRoaXMuc2VydmljZXMuZWRpdEV2ZW50RGlzcGF0Y2hlci5lZGl0UmVmLmJsdXIoKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5zZXJ2aWNlcy5mb2N1c0Rpc3BhdGNoZXIubW92ZUZvY3VzSG9yaXpvbnRhbGx5KFxuICAgICAgICAgIGNsb3Nlc3QodGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQhLCBDRUxMX1NFTEVDVE9SKSBhcyBIVE1MRWxlbWVudCxcbiAgICAgICAgICBkaXJlY3Rpb24gPT09IEZvY3VzRXNjYXBlTm90aWZpZXJEaXJlY3Rpb24uU1RBUlQgPyAtMSA6IDEpO1xuXG4gICAgICB0aGlzLmNsb3NlRWRpdE92ZXJsYXkoKTtcbiAgICB9KTtcbiAgfVxufVxuXG4vKipcbiAqIEEgc3RydWN0dXJhbCBkaXJlY3RpdmUgdGhhdCBzaG93cyBpdHMgY29udGVudHMgd2hlbiB0aGUgdGFibGUgcm93IGNvbnRhaW5pbmdcbiAqIGl0IGlzIGhvdmVyZWQgb3Igd2hlbiBhbiBlbGVtZW50IGluIHRoZSByb3cgaGFzIGZvY3VzLlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbY2RrUm93SG92ZXJDb250ZW50XScsXG59KVxuZXhwb3J0IGNsYXNzIENka1Jvd0hvdmVyQ29udGVudCBpbXBsZW1lbnRzIEFmdGVyVmlld0luaXQsIE9uRGVzdHJveSB7XG4gIHByb3RlY3RlZCByZWFkb25seSBkZXN0cm95ZWQgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xuICBwcm90ZWN0ZWQgdmlld1JlZjogRW1iZWRkZWRWaWV3UmVmPGFueT58bnVsbCA9IG51bGw7XG5cbiAgcHJpdmF0ZSBfcm93PzogRWxlbWVudDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByb3RlY3RlZCByZWFkb25seSBzZXJ2aWNlczogRWRpdFNlcnZpY2VzLCBwcm90ZWN0ZWQgcmVhZG9ubHkgZWxlbWVudFJlZjogRWxlbWVudFJlZixcbiAgICAgIHByb3RlY3RlZCByZWFkb25seSB0ZW1wbGF0ZVJlZjogVGVtcGxhdGVSZWY8YW55PixcbiAgICAgIHByb3RlY3RlZCByZWFkb25seSB2aWV3Q29udGFpbmVyUmVmOiBWaWV3Q29udGFpbmVyUmVmKSB7fVxuXG4gIG5nQWZ0ZXJWaWV3SW5pdCgpOiB2b2lkIHtcbiAgICB0aGlzLl9yb3cgPSBjbG9zZXN0KHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50ISwgUk9XX1NFTEVDVE9SKSE7XG5cbiAgICB0aGlzLnNlcnZpY2VzLmVkaXRFdmVudERpc3BhdGNoZXIucmVnaXN0ZXJSb3dXaXRoSG92ZXJDb250ZW50KHRoaXMuX3Jvdyk7XG4gICAgdGhpcy5fbGlzdGVuRm9ySG92ZXJBbmRGb2N1c0V2ZW50cygpO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgdGhpcy5kZXN0cm95ZWQubmV4dCgpO1xuICAgIHRoaXMuZGVzdHJveWVkLmNvbXBsZXRlKCk7XG5cbiAgICBpZiAodGhpcy52aWV3UmVmKSB7XG4gICAgICB0aGlzLnZpZXdSZWYuZGVzdHJveSgpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9yb3cpIHtcbiAgICAgIHRoaXMuc2VydmljZXMuZWRpdEV2ZW50RGlzcGF0Y2hlci5kZXJlZ2lzdGVyUm93V2l0aEhvdmVyQ29udGVudCh0aGlzLl9yb3cpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgaW1tZWRpYXRlbHkgYWZ0ZXIgdGhlIGhvdmVyIGNvbnRlbnQgaXMgY3JlYXRlZCBhbmQgYWRkZWQgdG8gdGhlIGRvbS5cbiAgICogSW4gdGhlIENESyB2ZXJzaW9uLCB0aGlzIGlzIGEgbm9vcCBidXQgc3ViY2xhc3NlcyBzdWNoIGFzIE1hdFJvd0hvdmVyQ29udGVudCB1c2UgdGhpc1xuICAgKiB0byBwcmVwYXJlL3N0eWxlIHRoZSBpbnNlcnRlZCBlbGVtZW50LlxuICAgKi9cbiAgcHJvdGVjdGVkIGluaXRFbGVtZW50KF86IEhUTUxFbGVtZW50KTogdm9pZCB7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gdGhlIGhvdmVyIGNvbnRlbnQgbmVlZHMgdG8gYmUgZm9jdXNhYmxlIHRvIHByZXNlcnZlIGEgcmVhc29uYWJsZSB0YWIgb3JkZXJpbmdcbiAgICogYnV0IHNob3VsZCBub3QgeWV0IGJlIHNob3duLlxuICAgKi9cbiAgcHJvdGVjdGVkIG1ha2VFbGVtZW50SGlkZGVuQnV0Rm9jdXNhYmxlKGVsZW1lbnQ6IEhUTUxFbGVtZW50KTogdm9pZCB7XG4gICAgZWxlbWVudC5zdHlsZS5vcGFjaXR5ID0gJzAnO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIHRoZSBob3ZlciBjb250ZW50IG5lZWRzIHRvIGJlIGZvY3VzYWJsZSB0byBwcmVzZXJ2ZSBhIHJlYXNvbmFibGUgdGFiIG9yZGVyaW5nXG4gICAqIGJ1dCBzaG91bGQgbm90IHlldCBiZSBzaG93bi5cbiAgICovXG4gIHByb3RlY3RlZCBtYWtlRWxlbWVudFZpc2libGUoZWxlbWVudDogSFRNTEVsZW1lbnQpOiB2b2lkIHtcbiAgICBlbGVtZW50LnN0eWxlLm9wYWNpdHkgPSAnJztcbiAgfVxuXG4gIHByaXZhdGUgX2xpc3RlbkZvckhvdmVyQW5kRm9jdXNFdmVudHMoKTogdm9pZCB7XG4gICAgdGhpcy5zZXJ2aWNlcy5lZGl0RXZlbnREaXNwYXRjaGVyLmhvdmVyT3JGb2N1c09uUm93KHRoaXMuX3JvdyEpXG4gICAgICAgIC5waXBlKHRha2VVbnRpbCh0aGlzLmRlc3Ryb3llZCkpXG4gICAgICAgIC5zdWJzY3JpYmUoZXZlbnRTdGF0ZSA9PiB7XG4gICAgICAgICAgLy8gV2hlbiBpbiBGT0NVU0FCTEUgc3RhdGUsIGFkZCB0aGUgaG92ZXIgY29udGVudCB0byB0aGUgZG9tIGJ1dCBtYWtlIGl0IHRyYW5zcGFyZW50IHNvXG4gICAgICAgICAgLy8gdGhhdCBpdCBpcyBpbiB0aGUgdGFiIG9yZGVyIHJlbGF0aXZlIHRvIHRoZSBjdXJyZW50bHkgZm9jdXNlZCByb3cuXG5cbiAgICAgICAgICBpZiAoZXZlbnRTdGF0ZSA9PT0gSG92ZXJDb250ZW50U3RhdGUuT04gfHwgZXZlbnRTdGF0ZSA9PT0gSG92ZXJDb250ZW50U3RhdGUuRk9DVVNBQkxFKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMudmlld1JlZikge1xuICAgICAgICAgICAgICB0aGlzLnZpZXdSZWYgPSB0aGlzLnZpZXdDb250YWluZXJSZWYuY3JlYXRlRW1iZWRkZWRWaWV3KHRoaXMudGVtcGxhdGVSZWYsIHt9KTtcbiAgICAgICAgICAgICAgdGhpcy5pbml0RWxlbWVudCh0aGlzLnZpZXdSZWYucm9vdE5vZGVzWzBdIGFzIEhUTUxFbGVtZW50KTtcbiAgICAgICAgICAgICAgdGhpcy52aWV3UmVmLm1hcmtGb3JDaGVjaygpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnZpZXdDb250YWluZXJSZWYuaW5kZXhPZih0aGlzLnZpZXdSZWYpID09PSAtMSkge1xuICAgICAgICAgICAgICB0aGlzLnZpZXdDb250YWluZXJSZWYuaW5zZXJ0KHRoaXMudmlld1JlZiEpO1xuICAgICAgICAgICAgICB0aGlzLnZpZXdSZWYubWFya0ZvckNoZWNrKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChldmVudFN0YXRlID09PSBIb3ZlckNvbnRlbnRTdGF0ZS5PTikge1xuICAgICAgICAgICAgICB0aGlzLm1ha2VFbGVtZW50VmlzaWJsZSh0aGlzLnZpZXdSZWYucm9vdE5vZGVzWzBdIGFzIEhUTUxFbGVtZW50KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHRoaXMubWFrZUVsZW1lbnRIaWRkZW5CdXRGb2N1c2FibGUodGhpcy52aWV3UmVmLnJvb3ROb2Rlc1swXSBhcyBIVE1MRWxlbWVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnZpZXdSZWYpIHtcbiAgICAgICAgICAgIHRoaXMudmlld0NvbnRhaW5lclJlZi5kZXRhY2godGhpcy52aWV3Q29udGFpbmVyUmVmLmluZGV4T2YodGhpcy52aWV3UmVmKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgfVxufVxuXG4vKipcbiAqIE9wZW5zIHRoZSBjbG9zZXN0IGVkaXQgcG9wb3ZlciB0byB0aGlzIGVsZW1lbnQsIHdoZXRoZXIgaXQncyBhc3NvY2lhdGVkIHdpdGggdGhpcyBleGFjdFxuICogZWxlbWVudCBvciBhbiBhbmNlc3RvciBlbGVtZW50LlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbY2RrRWRpdE9wZW5dJyxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrRWRpdE9wZW4ge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByb3RlY3RlZCByZWFkb25seSBlbGVtZW50UmVmOiBFbGVtZW50UmVmPEhUTUxFbGVtZW50PixcbiAgICAgIHByb3RlY3RlZCByZWFkb25seSBlZGl0RXZlbnREaXNwYXRjaGVyOiBFZGl0RXZlbnREaXNwYXRjaGVyKSB7XG5cbiAgICBjb25zdCBuYXRpdmVFbGVtZW50ID0gZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50O1xuXG4gICAgLy8gUHJldmVudCBhY2NpZGVudGFsIGZvcm0gc3VibWl0cy5cbiAgICBpZiAobmF0aXZlRWxlbWVudC5ub2RlTmFtZSA9PT0gJ0JVVFRPTicgJiYgIW5hdGl2ZUVsZW1lbnQuZ2V0QXR0cmlidXRlKCd0eXBlJykpIHtcbiAgICAgIG5hdGl2ZUVsZW1lbnQuc2V0QXR0cmlidXRlKCd0eXBlJywgJ2J1dHRvbicpO1xuICAgIH1cbiAgfVxuXG4gIC8vIEluIEl2eSB0aGUgYGhvc3RgIG1ldGFkYXRhIHdpbGwgYmUgbWVyZ2VkLCB3aGVyZWFzIGluIFZpZXdFbmdpbmUgaXQgaXMgb3ZlcnJpZGRlbi4gSW4gb3JkZXJcbiAgLy8gdG8gYXZvaWQgZG91YmxlIGV2ZW50IGxpc3RlbmVycywgd2UgbmVlZCB0byB1c2UgYEhvc3RMaXN0ZW5lcmAuIE9uY2UgSXZ5IGlzIHRoZSBkZWZhdWx0LCB3ZVxuICAvLyBjYW4gbW92ZSB0aGlzIGJhY2sgaW50byBgaG9zdGAuXG4gIC8vIHRzbGludDpkaXNhYmxlOm5vLWhvc3QtZGVjb3JhdG9yLWluLWNvbmNyZXRlXG4gIEBIb3N0TGlzdGVuZXIoJ2NsaWNrJywgWyckZXZlbnQnXSlcbiAgb3BlbkVkaXQoZXZ0OiBFdmVudCk6IHZvaWQge1xuICAgIHRoaXMuZWRpdEV2ZW50RGlzcGF0Y2hlci5lZGl0aW5nLm5leHQoY2xvc2VzdCh0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCEsIENFTExfU0VMRUNUT1IpKTtcbiAgICBldnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gIH1cbn1cbiJdfQ==