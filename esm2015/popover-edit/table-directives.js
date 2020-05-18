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
let CdkEditable = /** @class */ (() => {
    /**
     * A directive that must be attached to enable editability on a table.
     * It is responsible for setting up delegated event handlers and providing the
     * EditEventDispatcher service for use by the other edit directives.
     */
    class CdkEditable {
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
    return CdkEditable;
})();
export { CdkEditable };
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
let CdkPopoverEdit = /** @class */ (() => {
    /**
     * Attaches an ng-template to a cell and shows it when instructed to by the
     * EditEventDispatcher service.
     * Makes the cell focusable.
     * @template C
     */
    class CdkPopoverEdit {
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
    return CdkPopoverEdit;
})();
export { CdkPopoverEdit };
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
let CdkPopoverEditTabOut = /** @class */ (() => {
    /**
     * Attaches an ng-template to a cell and shows it when instructed to by the
     * EditEventDispatcher service.
     * Makes the cell focusable.
     * @template C
     */
    class CdkPopoverEditTabOut extends CdkPopoverEdit {
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
    return CdkPopoverEditTabOut;
})();
export { CdkPopoverEditTabOut };
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
let CdkRowHoverContent = /** @class */ (() => {
    /**
     * A structural directive that shows its contents when the table row containing
     * it is hovered or when an element in the row has focus.
     */
    class CdkRowHoverContent {
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
    return CdkRowHoverContent;
})();
export { CdkRowHoverContent };
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
let CdkEditOpen = /** @class */ (() => {
    /**
     * Opens the closest edit popover to this element, whether it's associated with this exact
     * element or an ancestor element.
     */
    class CdkEditOpen {
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
    return CdkEditOpen;
})();
export { CdkEditOpen };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFibGUtZGlyZWN0aXZlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL3BvcG92ZXItZWRpdC90YWJsZS1kaXJlY3RpdmVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBU0EsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQ25ELE9BQU8sRUFFTCxTQUFTLEVBQ1QsVUFBVSxFQUVWLE1BQU0sRUFFTixXQUFXLEVBQ1gsZ0JBQWdCLEVBQ2hCLFlBQVksR0FDYixNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUMsU0FBUyxFQUFFLGdCQUFnQixFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDakUsT0FBTyxFQUNMLE1BQU0sRUFDTixHQUFHLEVBQ0gsS0FBSyxFQUNMLEtBQUssRUFDTCxTQUFTLEVBQ1QsU0FBUyxFQUNULFlBQVksRUFDWixjQUFjLEdBQ2YsTUFBTSxnQkFBZ0IsQ0FBQztBQUV4QixPQUFPLEVBQUMsYUFBYSxFQUFFLGVBQWUsRUFBRSxrQkFBa0IsRUFBRSxZQUFZLEVBQUMsTUFBTSxhQUFhLENBQUM7QUFDN0YsT0FBTyxFQUFDLG1CQUFtQixFQUFvQixNQUFNLHlCQUF5QixDQUFDO0FBQy9FLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUM3QyxPQUFPLEVBQUMsZUFBZSxFQUFDLE1BQU0sb0JBQW9CLENBQUM7QUFDbkQsT0FBTyxFQUdMLDBCQUEwQixFQUMzQixNQUFNLHlCQUF5QixDQUFDO0FBQ2pDLE9BQU8sRUFBQyxPQUFPLEVBQUMsTUFBTSxZQUFZLENBQUM7Ozs7Ozs7QUFPbkMsMkNBR0M7OztJQUZDLHVDQUFnQjs7SUFDaEIsc0NBQWU7Ozs7OztNQUlYLDJCQUEyQixHQUFHLEVBQUU7Ozs7OztBQU90Qzs7Ozs7O0lBQUEsTUFJYSxXQUFXOzs7Ozs7O1FBR3RC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Ozs7O0FBK0UzRDs7Ozs7SUFBQSxNQUdhLFdBQVc7Ozs7O1FBQ3RCLFlBQ3VCLFVBQW1DLEVBQ25DLG1CQUF3QztZQUR4QyxlQUFVLEdBQVYsVUFBVSxDQUF5QjtZQUNuQyx3QkFBbUIsR0FBbkIsbUJBQW1CLENBQXFCOztrQkFFdkQsYUFBYSxHQUFHLFVBQVUsQ0FBQyxhQUFhO1lBRTlDLG1DQUFtQztZQUNuQyxJQUFJLGFBQWEsQ0FBQyxRQUFRLEtBQUssUUFBUSxJQUFJLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsRUFBRTtnQkFDOUUsYUFBYSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUM7YUFDOUM7UUFDSCxDQUFDOzs7Ozs7Ozs7UUFPRCxRQUFRLENBQUMsR0FBVTtZQUNqQixJQUFJLENBQUMsbUJBQW1CLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsbUJBQUEsSUFBSSxDQUFDLFVBQVUsQ0FBQyxhQUFhLEVBQUMsRUFBRSxhQUFhLENBQUMsQ0FBQyxDQUFDO1lBQzlGLEdBQUcsQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUN4QixDQUFDOzs7Z0JBeEJGLFNBQVMsU0FBQztvQkFDVCxRQUFRLEVBQUUsZUFBZTtpQkFDMUI7Ozs7Z0JBemRDLFVBQVU7Z0JBcUJKLG1CQUFtQjs7OzJCQXNkeEIsWUFBWSxTQUFDLE9BQU8sRUFBRSxDQUFDLFFBQVEsQ0FBQzs7SUFLbkMsa0JBQUM7S0FBQTtTQXRCWSxXQUFXOzs7Ozs7SUFFbEIsaUNBQXNEOzs7OztJQUN0RCwwQ0FBMkQiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7Rm9jdXNUcmFwfSBmcm9tICdAYW5ndWxhci9jZGsvYTExeSc7XG5pbXBvcnQge092ZXJsYXlSZWYsIFBvc2l0aW9uU3RyYXRlZ3l9IGZyb20gJ0Bhbmd1bGFyL2Nkay9vdmVybGF5JztcbmltcG9ydCB7VGVtcGxhdGVQb3J0YWx9IGZyb20gJ0Bhbmd1bGFyL2Nkay9wb3J0YWwnO1xuaW1wb3J0IHtcbiAgQWZ0ZXJWaWV3SW5pdCxcbiAgRGlyZWN0aXZlLFxuICBFbGVtZW50UmVmLFxuICBFbWJlZGRlZFZpZXdSZWYsXG4gIE5nWm9uZSxcbiAgT25EZXN0cm95LFxuICBUZW1wbGF0ZVJlZixcbiAgVmlld0NvbnRhaW5lclJlZixcbiAgSG9zdExpc3RlbmVyLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7ZnJvbUV2ZW50LCBmcm9tRXZlbnRQYXR0ZXJuLCBtZXJnZSwgU3ViamVjdH0gZnJvbSAncnhqcyc7XG5pbXBvcnQge1xuICBmaWx0ZXIsXG4gIG1hcCxcbiAgbWFwVG8sXG4gIHNoYXJlLFxuICBzdGFydFdpdGgsXG4gIHRha2VVbnRpbCxcbiAgdGhyb3R0bGVUaW1lLFxuICB3aXRoTGF0ZXN0RnJvbSxcbn0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuXG5pbXBvcnQge0NFTExfU0VMRUNUT1IsIEVESVRfUEFORV9DTEFTUywgRURJVF9QQU5FX1NFTEVDVE9SLCBST1dfU0VMRUNUT1J9IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCB7RWRpdEV2ZW50RGlzcGF0Y2hlciwgSG92ZXJDb250ZW50U3RhdGV9IGZyb20gJy4vZWRpdC1ldmVudC1kaXNwYXRjaGVyJztcbmltcG9ydCB7RWRpdFNlcnZpY2VzfSBmcm9tICcuL2VkaXQtc2VydmljZXMnO1xuaW1wb3J0IHtGb2N1c0Rpc3BhdGNoZXJ9IGZyb20gJy4vZm9jdXMtZGlzcGF0Y2hlcic7XG5pbXBvcnQge1xuICBGb2N1c0VzY2FwZU5vdGlmaWVyLFxuICBGb2N1c0VzY2FwZU5vdGlmaWVyRGlyZWN0aW9uLFxuICBGb2N1c0VzY2FwZU5vdGlmaWVyRmFjdG9yeVxufSBmcm9tICcuL2ZvY3VzLWVzY2FwZS1ub3RpZmllcic7XG5pbXBvcnQge2Nsb3Nlc3R9IGZyb20gJy4vcG9seWZpbGwnO1xuXG4vKipcbiAqIERlc2NyaWJlcyB0aGUgbnVtYmVyIG9mIGNvbHVtbnMgYmVmb3JlIGFuZCBhZnRlciB0aGUgb3JpZ2luYXRpbmcgY2VsbCB0aGF0IHRoZVxuICogZWRpdCBwb3B1cCBzaG91bGQgc3Bhbi4gSW4gbGVmdCB0byByaWdodCBsb2NhbGVzLCBiZWZvcmUgbWVhbnMgbGVmdCBhbmQgYWZ0ZXIgbWVhbnNcbiAqIHJpZ2h0LiBJbiByaWdodCB0byBsZWZ0IGxvY2FsZXMgYmVmb3JlIG1lYW5zIHJpZ2h0IGFuZCBhZnRlciBtZWFucyBsZWZ0LlxuICovXG5leHBvcnQgaW50ZXJmYWNlIENka1BvcG92ZXJFZGl0Q29sc3BhbiB7XG4gIGJlZm9yZT86IG51bWJlcjtcbiAgYWZ0ZXI/OiBudW1iZXI7XG59XG5cbi8qKiBVc2VkIGZvciByYXRlLWxpbWl0aW5nIG1vdXNlbW92ZSBldmVudHMuICovXG5jb25zdCBNT1VTRV9NT1ZFX1RIUk9UVExFX1RJTUVfTVMgPSAxMDtcblxuLyoqXG4gKiBBIGRpcmVjdGl2ZSB0aGF0IG11c3QgYmUgYXR0YWNoZWQgdG8gZW5hYmxlIGVkaXRhYmlsaXR5IG9uIGEgdGFibGUuXG4gKiBJdCBpcyByZXNwb25zaWJsZSBmb3Igc2V0dGluZyB1cCBkZWxlZ2F0ZWQgZXZlbnQgaGFuZGxlcnMgYW5kIHByb3ZpZGluZyB0aGVcbiAqIEVkaXRFdmVudERpc3BhdGNoZXIgc2VydmljZSBmb3IgdXNlIGJ5IHRoZSBvdGhlciBlZGl0IGRpcmVjdGl2ZXMuXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ3RhYmxlW2VkaXRhYmxlXSwgY2RrLXRhYmxlW2VkaXRhYmxlXSwgbWF0LXRhYmxlW2VkaXRhYmxlXScsXG4gIHByb3ZpZGVyczogW0VkaXRFdmVudERpc3BhdGNoZXIsIEVkaXRTZXJ2aWNlc10sXG59KVxuZXhwb3J0IGNsYXNzIENka0VkaXRhYmxlIGltcGxlbWVudHMgQWZ0ZXJWaWV3SW5pdCwgT25EZXN0cm95IHtcbiAgcHJvdGVjdGVkIHJlYWRvbmx5IGRlc3Ryb3llZCA9IG5ldyBTdWJqZWN0PHZvaWQ+KCk7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgZWxlbWVudFJlZjogRWxlbWVudFJlZixcbiAgICAgIHByb3RlY3RlZCByZWFkb25seSBlZGl0RXZlbnREaXNwYXRjaGVyOiBFZGl0RXZlbnREaXNwYXRjaGVyLFxuICAgICAgcHJvdGVjdGVkIHJlYWRvbmx5IGZvY3VzRGlzcGF0Y2hlcjogRm9jdXNEaXNwYXRjaGVyLCBwcm90ZWN0ZWQgcmVhZG9ubHkgbmdab25lOiBOZ1pvbmUpIHt9XG5cbiAgbmdBZnRlclZpZXdJbml0KCk6IHZvaWQge1xuICAgIHRoaXMuX2xpc3RlbkZvclRhYmxlRXZlbnRzKCk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLmRlc3Ryb3llZC5uZXh0KCk7XG4gICAgdGhpcy5kZXN0cm95ZWQuY29tcGxldGUoKTtcbiAgfVxuXG4gIHByaXZhdGUgX2xpc3RlbkZvclRhYmxlRXZlbnRzKCk6IHZvaWQge1xuICAgIGNvbnN0IGVsZW1lbnQgPSB0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudDtcbiAgICBjb25zdCB0b0Nsb3Nlc3QgPSAoc2VsZWN0b3I6IHN0cmluZykgPT5cbiAgICAgICAgbWFwKChldmVudDogVUlFdmVudCkgPT4gY2xvc2VzdChldmVudC50YXJnZXQsIHNlbGVjdG9yKSk7XG5cbiAgICB0aGlzLm5nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgICAvLyBUcmFjayBtb3VzZSBtb3ZlbWVudCBvdmVyIHRoZSB0YWJsZSB0byBoaWRlL3Nob3cgaG92ZXIgY29udGVudC5cbiAgICAgIGZyb21FdmVudDxNb3VzZUV2ZW50PihlbGVtZW50LCAnbW91c2VvdmVyJykucGlwZShcbiAgICAgICAgICB0b0Nsb3Nlc3QoUk9XX1NFTEVDVE9SKSxcbiAgICAgICAgICB0YWtlVW50aWwodGhpcy5kZXN0cm95ZWQpLFxuICAgICAgICAgICkuc3Vic2NyaWJlKHRoaXMuZWRpdEV2ZW50RGlzcGF0Y2hlci5ob3ZlcmluZyk7XG4gICAgICBmcm9tRXZlbnQ8TW91c2VFdmVudD4oZWxlbWVudCwgJ21vdXNlbGVhdmUnKS5waXBlKFxuICAgICAgICAgIG1hcFRvKG51bGwpLFxuICAgICAgICAgIHRha2VVbnRpbCh0aGlzLmRlc3Ryb3llZCksXG4gICAgICAgICAgKS5zdWJzY3JpYmUodGhpcy5lZGl0RXZlbnREaXNwYXRjaGVyLmhvdmVyaW5nKTtcbiAgICAgIGZyb21FdmVudDxNb3VzZUV2ZW50PihlbGVtZW50LCAnbW91c2Vtb3ZlJykucGlwZShcbiAgICAgICAgICB0aHJvdHRsZVRpbWUoTU9VU0VfTU9WRV9USFJPVFRMRV9USU1FX01TKSxcbiAgICAgICAgICB0b0Nsb3Nlc3QoUk9XX1NFTEVDVE9SKSxcbiAgICAgICAgICB0YWtlVW50aWwodGhpcy5kZXN0cm95ZWQpLFxuICAgICAgICAgICkuc3Vic2NyaWJlKHRoaXMuZWRpdEV2ZW50RGlzcGF0Y2hlci5tb3VzZU1vdmUpO1xuXG4gICAgICAvLyBUcmFjayBmb2N1cyB3aXRoaW4gdGhlIHRhYmxlIHRvIGhpZGUvc2hvdy9tYWtlIGZvY3VzYWJsZSBob3ZlciBjb250ZW50LlxuICAgICAgZnJvbUV2ZW50UGF0dGVybjxGb2N1c0V2ZW50PihcbiAgICAgICAgICBoYW5kbGVyID0+IGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXMnLCBoYW5kbGVyLCB0cnVlKSxcbiAgICAgICAgICBoYW5kbGVyID0+IGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignZm9jdXMnLCBoYW5kbGVyLCB0cnVlKVxuICAgICAgICAgICkucGlwZShcbiAgICAgICAgICAgICAgdGFrZVVudGlsKHRoaXMuZGVzdHJveWVkKSxcbiAgICAgICAgICAgICAgdG9DbG9zZXN0KFJPV19TRUxFQ1RPUiksXG4gICAgICAgICAgICAgIHNoYXJlKCksXG4gICAgICAgICAgICAgICkuc3Vic2NyaWJlKHRoaXMuZWRpdEV2ZW50RGlzcGF0Y2hlci5mb2N1c2VkKTtcblxuICAgICAgbWVyZ2UoXG4gICAgICAgIGZyb21FdmVudFBhdHRlcm48Rm9jdXNFdmVudD4oXG4gICAgICAgICAgaGFuZGxlciA9PiBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2JsdXInLCBoYW5kbGVyLCB0cnVlKSxcbiAgICAgICAgICBoYW5kbGVyID0+IGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignYmx1cicsIGhhbmRsZXIsIHRydWUpXG4gICAgICAgICksXG4gICAgICAgIGZyb21FdmVudDxLZXlib2FyZEV2ZW50PihlbGVtZW50LCAna2V5ZG93bicpLnBpcGUoZmlsdGVyKGV2ZW50ID0+IGV2ZW50LmtleSA9PT0gJ0VzY2FwZScpKVxuICAgICAgKS5waXBlKFxuICAgICAgICB0YWtlVW50aWwodGhpcy5kZXN0cm95ZWQpLFxuICAgICAgICBtYXBUbyhudWxsKSxcbiAgICAgICAgc2hhcmUoKSxcbiAgICAgICkuc3Vic2NyaWJlKHRoaXMuZWRpdEV2ZW50RGlzcGF0Y2hlci5mb2N1c2VkKTtcblxuICAgICAgLy8gS2VlcCB0cmFjayBvZiByb3dzIHdpdGhpbiB0aGUgdGFibGUuIFRoaXMgaXMgdXNlZCB0byBrbm93IHdoaWNoIHJvd3Mgd2l0aCBob3ZlciBjb250ZW50XG4gICAgICAvLyBhcmUgZmlyc3Qgb3IgbGFzdCBpbiB0aGUgdGFibGUuIFRoZXkgYXJlIGtlcHQgZm9jdXNhYmxlIGluIGNhc2UgZm9jdXMgZW50ZXJzIGZyb20gYWJvdmVcbiAgICAgIC8vIG9yIGJlbG93IHRoZSB0YWJsZS5cbiAgICAgIHRoaXMubmdab25lLm9uU3RhYmxlLnBpcGUoXG4gICAgICAgICAgdGFrZVVudGlsKHRoaXMuZGVzdHJveWVkKSxcbiAgICAgICAgICAvLyBPcHRpbWl6YXRpb246IGlnbm9yZSBkb20gY2hhbmdlcyB3aGlsZSBmb2N1cyBpcyB3aXRoaW4gdGhlIHRhYmxlIGFzIHdlIGFscmVhZHlcbiAgICAgICAgICAvLyBlbnN1cmUgdGhhdCByb3dzIGFib3ZlIGFuZCBiZWxvdyB0aGUgZm9jdXNlZC9hY3RpdmUgcm93IGFyZSB0YWJiYWJsZS5cbiAgICAgICAgICB3aXRoTGF0ZXN0RnJvbSh0aGlzLmVkaXRFdmVudERpc3BhdGNoZXIuZWRpdGluZ09yRm9jdXNlZCksXG4gICAgICAgICAgZmlsdGVyKChbXywgYWN0aXZlUm93XSkgPT4gYWN0aXZlUm93ID09IG51bGwpLFxuICAgICAgICAgIG1hcCgoKSA9PiBlbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoUk9XX1NFTEVDVE9SKSksXG4gICAgICAgICAgc2hhcmUoKSxcbiAgICAgICAgICApLnN1YnNjcmliZSh0aGlzLmVkaXRFdmVudERpc3BhdGNoZXIuYWxsUm93cyk7XG5cbiAgICAgIGZyb21FdmVudDxLZXlib2FyZEV2ZW50PihlbGVtZW50LCAna2V5ZG93bicpLnBpcGUoXG4gICAgICAgICAgZmlsdGVyKGV2ZW50ID0+IGV2ZW50LmtleSA9PT0gJ0VudGVyJyksXG4gICAgICAgICAgdG9DbG9zZXN0KENFTExfU0VMRUNUT1IpLFxuICAgICAgICAgIHRha2VVbnRpbCh0aGlzLmRlc3Ryb3llZCksXG4gICAgICAgICAgKS5zdWJzY3JpYmUodGhpcy5lZGl0RXZlbnREaXNwYXRjaGVyLmVkaXRpbmcpO1xuXG4gICAgICAvLyBLZXlkb3duIG11c3QgYmUgdXNlZCBoZXJlIG9yIGVsc2Uga2V5IGF1dG9yZXBlYXQgZG9lcyBub3Qgd29yayBwcm9wZXJseSBvbiBzb21lIHBsYXRmb3Jtcy5cbiAgICAgIGZyb21FdmVudDxLZXlib2FyZEV2ZW50PihlbGVtZW50LCAna2V5ZG93bicpXG4gICAgICAgICAgLnBpcGUodGFrZVVudGlsKHRoaXMuZGVzdHJveWVkKSlcbiAgICAgICAgICAuc3Vic2NyaWJlKHRoaXMuZm9jdXNEaXNwYXRjaGVyLmtleU9ic2VydmVyKTtcbiAgICB9KTtcbiAgfVxufVxuXG5jb25zdCBQT1BPVkVSX0VESVRfSE9TVF9CSU5ESU5HUyA9IHtcbiAgJ1thdHRyLnRhYmluZGV4XSc6ICdkaXNhYmxlZCA/IG51bGwgOiAwJyxcbiAgJ2NsYXNzJzogJ2Nkay1wb3BvdmVyLWVkaXQtY2VsbCcsXG4gICdbYXR0ci5hcmlhLWhhc3BvcHVwXSc6ICchZGlzYWJsZWQnLFxufTtcblxuY29uc3QgUE9QT1ZFUl9FRElUX0lOUFVUUyA9IFtcbiAgJ3RlbXBsYXRlOiBjZGtQb3BvdmVyRWRpdCcsXG4gICdjb250ZXh0OiBjZGtQb3BvdmVyRWRpdENvbnRleHQnLFxuICAnY29sc3BhbjogY2RrUG9wb3ZlckVkaXRDb2xzcGFuJyxcbiAgJ2Rpc2FibGVkOiBjZGtQb3BvdmVyRWRpdERpc2FibGVkJyxcbl07XG5cbi8qKlxuICogQXR0YWNoZXMgYW4gbmctdGVtcGxhdGUgdG8gYSBjZWxsIGFuZCBzaG93cyBpdCB3aGVuIGluc3RydWN0ZWQgdG8gYnkgdGhlXG4gKiBFZGl0RXZlbnREaXNwYXRjaGVyIHNlcnZpY2UuXG4gKiBNYWtlcyB0aGUgY2VsbCBmb2N1c2FibGUuXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tjZGtQb3BvdmVyRWRpdF06bm90KFtjZGtQb3BvdmVyRWRpdFRhYk91dF0pJyxcbiAgaG9zdDogUE9QT1ZFUl9FRElUX0hPU1RfQklORElOR1MsXG4gIGlucHV0czogUE9QT1ZFUl9FRElUX0lOUFVUUyxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrUG9wb3ZlckVkaXQ8Qz4gaW1wbGVtZW50cyBBZnRlclZpZXdJbml0LCBPbkRlc3Ryb3kge1xuICAvKiogVGhlIGVkaXQgbGVucyB0ZW1wbGF0ZSBzaG93biBvdmVyIHRoZSBjZWxsIG9uIGVkaXQuICovXG4gIHRlbXBsYXRlOiBUZW1wbGF0ZVJlZjxhbnk+fG51bGwgPSBudWxsO1xuXG4gIC8qKlxuICAgKiBJbXBsaWNpdCBjb250ZXh0IHRvIHBhc3MgYWxvbmcgdG8gdGhlIHRlbXBsYXRlLiBDYW4gYmUgb21pdHRlZCBpZiB0aGUgdGVtcGxhdGVcbiAgICogaXMgZGVmaW5lZCB3aXRoaW4gdGhlIGNlbGwuXG4gICAqL1xuICBjb250ZXh0PzogQztcblxuICAvKipcbiAgICogU3BlY2lmaWVzIHRoYXQgdGhlIHBvcHVwIHNob3VsZCBjb3ZlciBhZGRpdGlvbmFsIHRhYmxlIGNlbGxzIGJlZm9yZSBhbmQvb3IgYWZ0ZXJcbiAgICogdGhpcyBvbmUuXG4gICAqL1xuICBnZXQgY29sc3BhbigpOiBDZGtQb3BvdmVyRWRpdENvbHNwYW4ge1xuICAgIHJldHVybiB0aGlzLl9jb2xzcGFuO1xuICB9XG4gIHNldCBjb2xzcGFuKHZhbHVlOiBDZGtQb3BvdmVyRWRpdENvbHNwYW4pIHtcbiAgICB0aGlzLl9jb2xzcGFuID0gdmFsdWU7XG5cbiAgICAvLyBSZWNvbXB1dGUgcG9zaXRpb25pbmcgd2hlbiB0aGUgY29sc3BhbiBjaGFuZ2VzLlxuICAgIGlmICh0aGlzLm92ZXJsYXlSZWYpIHtcbiAgICAgIHRoaXMub3ZlcmxheVJlZi51cGRhdGVQb3NpdGlvblN0cmF0ZWd5KHRoaXMuX2dldFBvc2l0aW9uU3RyYXRlZ3koKSk7XG5cbiAgICAgIGlmICh0aGlzLm92ZXJsYXlSZWYuaGFzQXR0YWNoZWQoKSkge1xuICAgICAgICB0aGlzLl91cGRhdGVPdmVybGF5U2l6ZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBwcml2YXRlIF9jb2xzcGFuOiBDZGtQb3BvdmVyRWRpdENvbHNwYW4gPSB7fTtcblxuICAvKiogV2hldGhlciBwb3BvdmVyIGVkaXQgaXMgZGlzYWJsZWQgZm9yIHRoaXMgY2VsbC4gKi9cbiAgZ2V0IGRpc2FibGVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9kaXNhYmxlZDtcbiAgfVxuICBzZXQgZGlzYWJsZWQodmFsdWU6IGJvb2xlYW4pIHtcbiAgICB0aGlzLl9kaXNhYmxlZCA9IHZhbHVlO1xuXG4gICAgaWYgKHZhbHVlKSB7XG4gICAgICB0aGlzLnNlcnZpY2VzLmVkaXRFdmVudERpc3BhdGNoZXIuZG9uZUVkaXRpbmdDZWxsKHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50ISk7XG4gICAgICB0aGlzLnNlcnZpY2VzLmVkaXRFdmVudERpc3BhdGNoZXIuZGlzYWJsZWRDZWxscy5zZXQodGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQhLCB0cnVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zZXJ2aWNlcy5lZGl0RXZlbnREaXNwYXRjaGVyLmRpc2FibGVkQ2VsbHMuZGVsZXRlKHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50ISk7XG4gICAgfVxuICB9XG4gIHByaXZhdGUgX2Rpc2FibGVkID0gZmFsc2U7XG5cbiAgcHJvdGVjdGVkIGZvY3VzVHJhcD86IEZvY3VzVHJhcDtcbiAgcHJvdGVjdGVkIG92ZXJsYXlSZWY/OiBPdmVybGF5UmVmO1xuICBwcm90ZWN0ZWQgcmVhZG9ubHkgZGVzdHJveWVkID0gbmV3IFN1YmplY3Q8dm9pZD4oKTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByb3RlY3RlZCByZWFkb25seSBzZXJ2aWNlczogRWRpdFNlcnZpY2VzLCBwcm90ZWN0ZWQgcmVhZG9ubHkgZWxlbWVudFJlZjogRWxlbWVudFJlZixcbiAgICAgIHByb3RlY3RlZCByZWFkb25seSB2aWV3Q29udGFpbmVyUmVmOiBWaWV3Q29udGFpbmVyUmVmKSB7fVxuXG4gIG5nQWZ0ZXJWaWV3SW5pdCgpOiB2b2lkIHtcbiAgICB0aGlzLl9zdGFydExpc3RlbmluZ1RvRWRpdEV2ZW50cygpO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgdGhpcy5kZXN0cm95ZWQubmV4dCgpO1xuICAgIHRoaXMuZGVzdHJveWVkLmNvbXBsZXRlKCk7XG5cbiAgICBpZiAodGhpcy5mb2N1c1RyYXApIHtcbiAgICAgIHRoaXMuZm9jdXNUcmFwLmRlc3Ryb3koKTtcbiAgICAgIHRoaXMuZm9jdXNUcmFwID0gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGlmICh0aGlzLm92ZXJsYXlSZWYpIHtcbiAgICAgIHRoaXMub3ZlcmxheVJlZi5kaXNwb3NlKCk7XG4gICAgfVxuICB9XG5cbiAgcHJvdGVjdGVkIGluaXRGb2N1c1RyYXAoKTogdm9pZCB7XG4gICAgdGhpcy5mb2N1c1RyYXAgPSB0aGlzLnNlcnZpY2VzLmZvY3VzVHJhcEZhY3RvcnkuY3JlYXRlKHRoaXMub3ZlcmxheVJlZiEub3ZlcmxheUVsZW1lbnQpO1xuICB9XG5cbiAgcHJvdGVjdGVkIGNsb3NlRWRpdE92ZXJsYXkoKTogdm9pZCB7XG4gICAgdGhpcy5zZXJ2aWNlcy5lZGl0RXZlbnREaXNwYXRjaGVyLmRvbmVFZGl0aW5nQ2VsbCh0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCEpO1xuICB9XG5cbiAgcHJvdGVjdGVkIHBhbmVsQ2xhc3MoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gRURJVF9QQU5FX0NMQVNTO1xuICB9XG5cbiAgcHJpdmF0ZSBfc3RhcnRMaXN0ZW5pbmdUb0VkaXRFdmVudHMoKTogdm9pZCB7XG4gICAgdGhpcy5zZXJ2aWNlcy5lZGl0RXZlbnREaXNwYXRjaGVyLmVkaXRpbmdDZWxsKHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50ISlcbiAgICAgICAgLnBpcGUodGFrZVVudGlsKHRoaXMuZGVzdHJveWVkKSlcbiAgICAgICAgLnN1YnNjcmliZSgob3BlbikgPT4ge1xuICAgICAgICAgIGlmIChvcGVuICYmIHRoaXMudGVtcGxhdGUpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5vdmVybGF5UmVmKSB7XG4gICAgICAgICAgICAgIHRoaXMuX2NyZWF0ZUVkaXRPdmVybGF5KCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuX3Nob3dFZGl0T3ZlcmxheSgpO1xuICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5vdmVybGF5UmVmKSB7XG4gICAgICAgICAgICB0aGlzLl9tYXliZVJldHVybkZvY3VzVG9DZWxsKCk7XG5cbiAgICAgICAgICAgIHRoaXMub3ZlcmxheVJlZi5kZXRhY2goKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfY3JlYXRlRWRpdE92ZXJsYXkoKTogdm9pZCB7XG4gICAgdGhpcy5vdmVybGF5UmVmID0gdGhpcy5zZXJ2aWNlcy5vdmVybGF5LmNyZWF0ZSh7XG4gICAgICBkaXNwb3NlT25OYXZpZ2F0aW9uOiB0cnVlLFxuICAgICAgcGFuZWxDbGFzczogdGhpcy5wYW5lbENsYXNzKCksXG4gICAgICBwb3NpdGlvblN0cmF0ZWd5OiB0aGlzLl9nZXRQb3NpdGlvblN0cmF0ZWd5KCksXG4gICAgICBzY3JvbGxTdHJhdGVneTogdGhpcy5zZXJ2aWNlcy5vdmVybGF5LnNjcm9sbFN0cmF0ZWdpZXMucmVwb3NpdGlvbigpLFxuICAgICAgZGlyZWN0aW9uOiB0aGlzLnNlcnZpY2VzLmRpcmVjdGlvbmFsaXR5LFxuICAgIH0pO1xuXG4gICAgdGhpcy5pbml0Rm9jdXNUcmFwKCk7XG4gICAgdGhpcy5vdmVybGF5UmVmLm92ZXJsYXlFbGVtZW50LnNldEF0dHJpYnV0ZSgnYXJpYS1yb2xlJywgJ2RpYWxvZycpO1xuXG4gICAgdGhpcy5vdmVybGF5UmVmLmRldGFjaG1lbnRzKCkuc3Vic2NyaWJlKCgpID0+IHRoaXMuY2xvc2VFZGl0T3ZlcmxheSgpKTtcbiAgfVxuXG4gIHByaXZhdGUgX3Nob3dFZGl0T3ZlcmxheSgpOiB2b2lkIHtcbiAgICB0aGlzLm92ZXJsYXlSZWYhLmF0dGFjaChuZXcgVGVtcGxhdGVQb3J0YWwoXG4gICAgICAgIHRoaXMudGVtcGxhdGUhLFxuICAgICAgICB0aGlzLnZpZXdDb250YWluZXJSZWYsXG4gICAgICAgIHskaW1wbGljaXQ6IHRoaXMuY29udGV4dH0pKTtcblxuICAgIC8vIFdlIGhhdmUgdG8gZGVmZXIgdHJhcHBpbmcgZm9jdXMsIGJlY2F1c2UgZG9pbmcgc28gdG9vIGVhcmx5IGNhbiBjYXVzZSB0aGUgZm9ybSBpbnNpZGVcbiAgICAvLyB0aGUgb3ZlcmxheSB0byBiZSBzdWJtaXR0ZWQgaW1tZWRpYXRlbHkgaWYgaXQgd2FzIG9wZW5lZCBvbiBhbiBFbnRlciBrZXlkb3duIGV2ZW50LlxuICAgIHRoaXMuc2VydmljZXMubmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aGlzLmZvY3VzVHJhcCEuZm9jdXNJbml0aWFsRWxlbWVudCgpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICAvLyBVcGRhdGUgdGhlIHNpemUgb2YgdGhlIHBvcHVwIGluaXRpYWxseSBhbmQgb24gc3Vic2VxdWVudCBjaGFuZ2VzIHRvXG4gICAgLy8gc2Nyb2xsIHBvc2l0aW9uIGFuZCB2aWV3cG9ydCBzaXplLlxuICAgIG1lcmdlKHRoaXMuc2VydmljZXMuc2Nyb2xsRGlzcGF0Y2hlci5zY3JvbGxlZCgpLCB0aGlzLnNlcnZpY2VzLnZpZXdwb3J0UnVsZXIuY2hhbmdlKCkpXG4gICAgICAgIC5waXBlKFxuICAgICAgICAgICAgc3RhcnRXaXRoKG51bGwpLFxuICAgICAgICAgICAgdGFrZVVudGlsKHRoaXMub3ZlcmxheVJlZiEuZGV0YWNobWVudHMoKSksXG4gICAgICAgICAgICB0YWtlVW50aWwodGhpcy5kZXN0cm95ZWQpLFxuICAgICAgICAgICAgKVxuICAgICAgICAuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgICAgICB0aGlzLl91cGRhdGVPdmVybGF5U2l6ZSgpO1xuICAgICAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX2dldE92ZXJsYXlDZWxscygpOiBIVE1MRWxlbWVudFtdIHtcbiAgICBjb25zdCBjZWxsID0gY2xvc2VzdCh0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCEsIENFTExfU0VMRUNUT1IpIGFzIEhUTUxFbGVtZW50O1xuXG4gICAgaWYgKCF0aGlzLl9jb2xzcGFuLmJlZm9yZSAmJiAhdGhpcy5fY29sc3Bhbi5hZnRlcikge1xuICAgICAgcmV0dXJuIFtjZWxsXTtcbiAgICB9XG5cbiAgICBjb25zdCByb3cgPSBjbG9zZXN0KHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50ISwgUk9XX1NFTEVDVE9SKSE7XG4gICAgY29uc3Qgcm93Q2VsbHMgPSBBcnJheS5mcm9tKHJvdy5xdWVyeVNlbGVjdG9yQWxsKENFTExfU0VMRUNUT1IpKSBhcyBIVE1MRWxlbWVudFtdO1xuICAgIGNvbnN0IG93bkluZGV4ID0gcm93Q2VsbHMuaW5kZXhPZihjZWxsKTtcblxuICAgIHJldHVybiByb3dDZWxscy5zbGljZShcbiAgICAgICAgb3duSW5kZXggLSAodGhpcy5fY29sc3Bhbi5iZWZvcmUgfHwgMCksIG93bkluZGV4ICsgKHRoaXMuX2NvbHNwYW4uYWZ0ZXIgfHwgMCkgKyAxKTtcbiAgfVxuXG4gIHByaXZhdGUgX2dldFBvc2l0aW9uU3RyYXRlZ3koKTogUG9zaXRpb25TdHJhdGVneSB7XG4gICAgcmV0dXJuIHRoaXMuc2VydmljZXMucG9zaXRpb25GYWN0b3J5LnBvc2l0aW9uU3RyYXRlZ3lGb3JDZWxscyh0aGlzLl9nZXRPdmVybGF5Q2VsbHMoKSk7XG4gIH1cblxuICBwcml2YXRlIF91cGRhdGVPdmVybGF5U2l6ZSgpOiB2b2lkIHtcbiAgICB0aGlzLm92ZXJsYXlSZWYhLnVwZGF0ZVNpemUoXG4gICAgICAgIHRoaXMuc2VydmljZXMucG9zaXRpb25GYWN0b3J5LnNpemVDb25maWdGb3JDZWxscyh0aGlzLl9nZXRPdmVybGF5Q2VsbHMoKSkpO1xuICB9XG5cbiAgcHJpdmF0ZSBfbWF5YmVSZXR1cm5Gb2N1c1RvQ2VsbCgpOiB2b2lkIHtcbiAgICBpZiAoY2xvc2VzdChkb2N1bWVudC5hY3RpdmVFbGVtZW50LCBFRElUX1BBTkVfU0VMRUNUT1IpID09PVxuICAgICAgICB0aGlzLm92ZXJsYXlSZWYhLm92ZXJsYXlFbGVtZW50KSB7XG4gICAgICB0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCEuZm9jdXMoKTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBBdHRhY2hlcyBhbiBuZy10ZW1wbGF0ZSB0byBhIGNlbGwgYW5kIHNob3dzIGl0IHdoZW4gaW5zdHJ1Y3RlZCB0byBieSB0aGVcbiAqIEVkaXRFdmVudERpc3BhdGNoZXIgc2VydmljZS5cbiAqIE1ha2VzIHRoZSBjZWxsIGZvY3VzYWJsZS5cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW2Nka1BvcG92ZXJFZGl0XVtjZGtQb3BvdmVyRWRpdFRhYk91dF0nLFxuICBob3N0OiBQT1BPVkVSX0VESVRfSE9TVF9CSU5ESU5HUyxcbiAgaW5wdXRzOiBQT1BPVkVSX0VESVRfSU5QVVRTLFxufSlcbmV4cG9ydCBjbGFzcyBDZGtQb3BvdmVyRWRpdFRhYk91dDxDPiBleHRlbmRzIENka1BvcG92ZXJFZGl0PEM+IHtcbiAgcHJvdGVjdGVkIGZvY3VzVHJhcD86IEZvY3VzRXNjYXBlTm90aWZpZXI7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBlbGVtZW50UmVmOiBFbGVtZW50UmVmLCB2aWV3Q29udGFpbmVyUmVmOiBWaWV3Q29udGFpbmVyUmVmLCBzZXJ2aWNlczogRWRpdFNlcnZpY2VzLFxuICAgICAgcHJvdGVjdGVkIHJlYWRvbmx5IGZvY3VzRXNjYXBlTm90aWZpZXJGYWN0b3J5OiBGb2N1c0VzY2FwZU5vdGlmaWVyRmFjdG9yeSkge1xuICAgIHN1cGVyKHNlcnZpY2VzLCBlbGVtZW50UmVmLCB2aWV3Q29udGFpbmVyUmVmKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBpbml0Rm9jdXNUcmFwKCk6IHZvaWQge1xuICAgIHRoaXMuZm9jdXNUcmFwID0gdGhpcy5mb2N1c0VzY2FwZU5vdGlmaWVyRmFjdG9yeS5jcmVhdGUodGhpcy5vdmVybGF5UmVmIS5vdmVybGF5RWxlbWVudCk7XG5cbiAgICB0aGlzLmZvY3VzVHJhcC5lc2NhcGVzKCkucGlwZSh0YWtlVW50aWwodGhpcy5kZXN0cm95ZWQpKS5zdWJzY3JpYmUoZGlyZWN0aW9uID0+IHtcbiAgICAgIGlmICh0aGlzLnNlcnZpY2VzLmVkaXRFdmVudERpc3BhdGNoZXIuZWRpdFJlZikge1xuICAgICAgICB0aGlzLnNlcnZpY2VzLmVkaXRFdmVudERpc3BhdGNoZXIuZWRpdFJlZi5ibHVyKCk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuc2VydmljZXMuZm9jdXNEaXNwYXRjaGVyLm1vdmVGb2N1c0hvcml6b250YWxseShcbiAgICAgICAgICBjbG9zZXN0KHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50ISwgQ0VMTF9TRUxFQ1RPUikgYXMgSFRNTEVsZW1lbnQsXG4gICAgICAgICAgZGlyZWN0aW9uID09PSBGb2N1c0VzY2FwZU5vdGlmaWVyRGlyZWN0aW9uLlNUQVJUID8gLTEgOiAxKTtcblxuICAgICAgdGhpcy5jbG9zZUVkaXRPdmVybGF5KCk7XG4gICAgfSk7XG4gIH1cbn1cblxuLyoqXG4gKiBBIHN0cnVjdHVyYWwgZGlyZWN0aXZlIHRoYXQgc2hvd3MgaXRzIGNvbnRlbnRzIHdoZW4gdGhlIHRhYmxlIHJvdyBjb250YWluaW5nXG4gKiBpdCBpcyBob3ZlcmVkIG9yIHdoZW4gYW4gZWxlbWVudCBpbiB0aGUgcm93IGhhcyBmb2N1cy5cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW2Nka1Jvd0hvdmVyQ29udGVudF0nLFxufSlcbmV4cG9ydCBjbGFzcyBDZGtSb3dIb3ZlckNvbnRlbnQgaW1wbGVtZW50cyBBZnRlclZpZXdJbml0LCBPbkRlc3Ryb3kge1xuICBwcm90ZWN0ZWQgcmVhZG9ubHkgZGVzdHJveWVkID0gbmV3IFN1YmplY3Q8dm9pZD4oKTtcbiAgcHJvdGVjdGVkIHZpZXdSZWY6IEVtYmVkZGVkVmlld1JlZjxhbnk+fG51bGwgPSBudWxsO1xuXG4gIHByaXZhdGUgX3Jvdz86IEVsZW1lbnQ7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgc2VydmljZXM6IEVkaXRTZXJ2aWNlcywgcHJvdGVjdGVkIHJlYWRvbmx5IGVsZW1lbnRSZWY6IEVsZW1lbnRSZWYsXG4gICAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgdGVtcGxhdGVSZWY6IFRlbXBsYXRlUmVmPGFueT4sXG4gICAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgdmlld0NvbnRhaW5lclJlZjogVmlld0NvbnRhaW5lclJlZikge31cblxuICBuZ0FmdGVyVmlld0luaXQoKTogdm9pZCB7XG4gICAgdGhpcy5fcm93ID0gY2xvc2VzdCh0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCEsIFJPV19TRUxFQ1RPUikhO1xuXG4gICAgdGhpcy5zZXJ2aWNlcy5lZGl0RXZlbnREaXNwYXRjaGVyLnJlZ2lzdGVyUm93V2l0aEhvdmVyQ29udGVudCh0aGlzLl9yb3cpO1xuICAgIHRoaXMuX2xpc3RlbkZvckhvdmVyQW5kRm9jdXNFdmVudHMoKTtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCk6IHZvaWQge1xuICAgIHRoaXMuZGVzdHJveWVkLm5leHQoKTtcbiAgICB0aGlzLmRlc3Ryb3llZC5jb21wbGV0ZSgpO1xuXG4gICAgaWYgKHRoaXMudmlld1JlZikge1xuICAgICAgdGhpcy52aWV3UmVmLmRlc3Ryb3koKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fcm93KSB7XG4gICAgICB0aGlzLnNlcnZpY2VzLmVkaXRFdmVudERpc3BhdGNoZXIuZGVyZWdpc3RlclJvd1dpdGhIb3ZlckNvbnRlbnQodGhpcy5fcm93KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIGltbWVkaWF0ZWx5IGFmdGVyIHRoZSBob3ZlciBjb250ZW50IGlzIGNyZWF0ZWQgYW5kIGFkZGVkIHRvIHRoZSBkb20uXG4gICAqIEluIHRoZSBDREsgdmVyc2lvbiwgdGhpcyBpcyBhIG5vb3AgYnV0IHN1YmNsYXNzZXMgc3VjaCBhcyBNYXRSb3dIb3ZlckNvbnRlbnQgdXNlIHRoaXNcbiAgICogdG8gcHJlcGFyZS9zdHlsZSB0aGUgaW5zZXJ0ZWQgZWxlbWVudC5cbiAgICovXG4gIHByb3RlY3RlZCBpbml0RWxlbWVudChfOiBIVE1MRWxlbWVudCk6IHZvaWQge1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIHRoZSBob3ZlciBjb250ZW50IG5lZWRzIHRvIGJlIGZvY3VzYWJsZSB0byBwcmVzZXJ2ZSBhIHJlYXNvbmFibGUgdGFiIG9yZGVyaW5nXG4gICAqIGJ1dCBzaG91bGQgbm90IHlldCBiZSBzaG93bi5cbiAgICovXG4gIHByb3RlY3RlZCBtYWtlRWxlbWVudEhpZGRlbkJ1dEZvY3VzYWJsZShlbGVtZW50OiBIVE1MRWxlbWVudCk6IHZvaWQge1xuICAgIGVsZW1lbnQuc3R5bGUub3BhY2l0eSA9ICcwJztcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiB0aGUgaG92ZXIgY29udGVudCBuZWVkcyB0byBiZSBmb2N1c2FibGUgdG8gcHJlc2VydmUgYSByZWFzb25hYmxlIHRhYiBvcmRlcmluZ1xuICAgKiBidXQgc2hvdWxkIG5vdCB5ZXQgYmUgc2hvd24uXG4gICAqL1xuICBwcm90ZWN0ZWQgbWFrZUVsZW1lbnRWaXNpYmxlKGVsZW1lbnQ6IEhUTUxFbGVtZW50KTogdm9pZCB7XG4gICAgZWxlbWVudC5zdHlsZS5vcGFjaXR5ID0gJyc7XG4gIH1cblxuICBwcml2YXRlIF9saXN0ZW5Gb3JIb3ZlckFuZEZvY3VzRXZlbnRzKCk6IHZvaWQge1xuICAgIHRoaXMuc2VydmljZXMuZWRpdEV2ZW50RGlzcGF0Y2hlci5ob3Zlck9yRm9jdXNPblJvdyh0aGlzLl9yb3chKVxuICAgICAgICAucGlwZSh0YWtlVW50aWwodGhpcy5kZXN0cm95ZWQpKVxuICAgICAgICAuc3Vic2NyaWJlKGV2ZW50U3RhdGUgPT4ge1xuICAgICAgICAgIC8vIFdoZW4gaW4gRk9DVVNBQkxFIHN0YXRlLCBhZGQgdGhlIGhvdmVyIGNvbnRlbnQgdG8gdGhlIGRvbSBidXQgbWFrZSBpdCB0cmFuc3BhcmVudCBzb1xuICAgICAgICAgIC8vIHRoYXQgaXQgaXMgaW4gdGhlIHRhYiBvcmRlciByZWxhdGl2ZSB0byB0aGUgY3VycmVudGx5IGZvY3VzZWQgcm93LlxuXG4gICAgICAgICAgaWYgKGV2ZW50U3RhdGUgPT09IEhvdmVyQ29udGVudFN0YXRlLk9OIHx8IGV2ZW50U3RhdGUgPT09IEhvdmVyQ29udGVudFN0YXRlLkZPQ1VTQUJMRSkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLnZpZXdSZWYpIHtcbiAgICAgICAgICAgICAgdGhpcy52aWV3UmVmID0gdGhpcy52aWV3Q29udGFpbmVyUmVmLmNyZWF0ZUVtYmVkZGVkVmlldyh0aGlzLnRlbXBsYXRlUmVmLCB7fSk7XG4gICAgICAgICAgICAgIHRoaXMuaW5pdEVsZW1lbnQodGhpcy52aWV3UmVmLnJvb3ROb2Rlc1swXSBhcyBIVE1MRWxlbWVudCk7XG4gICAgICAgICAgICAgIHRoaXMudmlld1JlZi5tYXJrRm9yQ2hlY2soKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy52aWV3Q29udGFpbmVyUmVmLmluZGV4T2YodGhpcy52aWV3UmVmKSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgdGhpcy52aWV3Q29udGFpbmVyUmVmLmluc2VydCh0aGlzLnZpZXdSZWYhKTtcbiAgICAgICAgICAgICAgdGhpcy52aWV3UmVmLm1hcmtGb3JDaGVjaygpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZXZlbnRTdGF0ZSA9PT0gSG92ZXJDb250ZW50U3RhdGUuT04pIHtcbiAgICAgICAgICAgICAgdGhpcy5tYWtlRWxlbWVudFZpc2libGUodGhpcy52aWV3UmVmLnJvb3ROb2Rlc1swXSBhcyBIVE1MRWxlbWVudCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB0aGlzLm1ha2VFbGVtZW50SGlkZGVuQnV0Rm9jdXNhYmxlKHRoaXMudmlld1JlZi5yb290Tm9kZXNbMF0gYXMgSFRNTEVsZW1lbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy52aWV3UmVmKSB7XG4gICAgICAgICAgICB0aGlzLnZpZXdDb250YWluZXJSZWYuZGV0YWNoKHRoaXMudmlld0NvbnRhaW5lclJlZi5pbmRleE9mKHRoaXMudmlld1JlZikpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gIH1cbn1cblxuLyoqXG4gKiBPcGVucyB0aGUgY2xvc2VzdCBlZGl0IHBvcG92ZXIgdG8gdGhpcyBlbGVtZW50LCB3aGV0aGVyIGl0J3MgYXNzb2NpYXRlZCB3aXRoIHRoaXMgZXhhY3RcbiAqIGVsZW1lbnQgb3IgYW4gYW5jZXN0b3IgZWxlbWVudC5cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW2Nka0VkaXRPcGVuXScsXG59KVxuZXhwb3J0IGNsYXNzIENka0VkaXRPcGVuIHtcbiAgY29uc3RydWN0b3IoXG4gICAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgZWxlbWVudFJlZjogRWxlbWVudFJlZjxIVE1MRWxlbWVudD4sXG4gICAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgZWRpdEV2ZW50RGlzcGF0Y2hlcjogRWRpdEV2ZW50RGlzcGF0Y2hlcikge1xuXG4gICAgY29uc3QgbmF0aXZlRWxlbWVudCA9IGVsZW1lbnRSZWYubmF0aXZlRWxlbWVudDtcblxuICAgIC8vIFByZXZlbnQgYWNjaWRlbnRhbCBmb3JtIHN1Ym1pdHMuXG4gICAgaWYgKG5hdGl2ZUVsZW1lbnQubm9kZU5hbWUgPT09ICdCVVRUT04nICYmICFuYXRpdmVFbGVtZW50LmdldEF0dHJpYnV0ZSgndHlwZScpKSB7XG4gICAgICBuYXRpdmVFbGVtZW50LnNldEF0dHJpYnV0ZSgndHlwZScsICdidXR0b24nKTtcbiAgICB9XG4gIH1cblxuICAvLyBJbiBJdnkgdGhlIGBob3N0YCBtZXRhZGF0YSB3aWxsIGJlIG1lcmdlZCwgd2hlcmVhcyBpbiBWaWV3RW5naW5lIGl0IGlzIG92ZXJyaWRkZW4uIEluIG9yZGVyXG4gIC8vIHRvIGF2b2lkIGRvdWJsZSBldmVudCBsaXN0ZW5lcnMsIHdlIG5lZWQgdG8gdXNlIGBIb3N0TGlzdGVuZXJgLiBPbmNlIEl2eSBpcyB0aGUgZGVmYXVsdCwgd2VcbiAgLy8gY2FuIG1vdmUgdGhpcyBiYWNrIGludG8gYGhvc3RgLlxuICAvLyB0c2xpbnQ6ZGlzYWJsZTpuby1ob3N0LWRlY29yYXRvci1pbi1jb25jcmV0ZVxuICBASG9zdExpc3RlbmVyKCdjbGljaycsIFsnJGV2ZW50J10pXG4gIG9wZW5FZGl0KGV2dDogRXZlbnQpOiB2b2lkIHtcbiAgICB0aGlzLmVkaXRFdmVudERpc3BhdGNoZXIuZWRpdGluZy5uZXh0KGNsb3Nlc3QodGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQhLCBDRUxMX1NFTEVDVE9SKSk7XG4gICAgZXZ0LnN0b3BQcm9wYWdhdGlvbigpO1xuICB9XG59XG4iXX0=