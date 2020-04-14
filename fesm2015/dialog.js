import { trigger, state, style, transition, animate } from '@angular/animations';
import { FocusTrapFactory, A11yModule } from '@angular/cdk/a11y';
import { BasePortalOutlet, CdkPortalOutlet, PortalInjector, ComponentPortal, TemplatePortal, PortalModule } from '@angular/cdk/portal';
import { DOCUMENT, Location } from '@angular/common';
import { Component, ViewEncapsulation, ChangeDetectionStrategy, ElementRef, ChangeDetectorRef, Optional, Inject, HostBinding, ViewChild, InjectionToken, Injectable, Injector, Type, SkipSelf, NgModule } from '@angular/core';
import { Subject, defer, of } from 'rxjs';
import { distinctUntilChanged, filter, map, startWith } from 'rxjs/operators';
import { ESCAPE, hasModifierKey } from '@angular/cdk/keycodes';
import { Directionality } from '@angular/cdk/bidi';
import { Overlay, OverlayConfig, OverlayModule } from '@angular/cdk/overlay';

/**
 * @fileoverview added by tsickle
 * Generated from: src/cdk-experimental/dialog/dialog-config.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * Possible overrides for a dialog's position.
 * @record
 */
function DialogPosition() { }
if (false) {
    /** @type {?|undefined} */
    DialogPosition.prototype.top;
    /** @type {?|undefined} */
    DialogPosition.prototype.bottom;
    /** @type {?|undefined} */
    DialogPosition.prototype.left;
    /** @type {?|undefined} */
    DialogPosition.prototype.right;
}
/**
 * @template D
 */
class DialogConfig {
    constructor() {
        /**
         * The ARIA role of the dialog.
         */
        this.role = 'dialog';
        /**
         * Custom class(es) for the overlay panel.
         */
        this.panelClass = '';
        /**
         * Whether the dialog has a background.
         */
        this.hasBackdrop = true;
        /**
         * Custom class(es) for the backdrop.
         */
        this.backdropClass = '';
        /**
         * Whether the dialog can be closed by user interaction.
         */
        this.disableClose = false;
        /**
         * The width of the dialog.
         */
        this.width = '';
        /**
         * The height of the dialog.
         */
        this.height = '';
        /**
         * The minimum width of the dialog.
         */
        this.minWidth = '';
        /**
         * The minimum height of the dialog.
         */
        this.minHeight = '';
        /**
         * The maximum width of the dialog.
         */
        this.maxWidth = '80vw';
        /**
         * The maximum height of the dialog.
         */
        this.maxHeight = '';
        /**
         * Data to be injected into the dialog content.
         */
        this.data = null;
        /**
         * ID of the element that describes the dialog.
         */
        this.ariaDescribedBy = null;
        /**
         * Aria label to assign to the dialog element
         */
        this.ariaLabel = null;
        /**
         * Whether the dialog should focus the first focusable element on open.
         */
        this.autoFocus = true;
        /**
         * Duration of the enter animation. Has to be a valid CSS value (e.g. 100ms).
         */
        this.enterAnimationDuration = '225ms';
        /**
         * Duration of the exit animation. Has to be a valid CSS value (e.g. 50ms).
         */
        this.exitAnimationDuration = '225ms';
    }
}
if (false) {
    /**
     * Component to use as the container for the dialog.
     * @type {?}
     */
    DialogConfig.prototype.containerComponent;
    /**
     * Where the attached component should live in Angular's *logical* component tree.
     * This affects what is available for injection and the change detection order for the
     * component instantiated inside of the dialog. This does not affect where the dialog
     * content will be rendered.
     * @type {?}
     */
    DialogConfig.prototype.viewContainerRef;
    /**
     * The id of the dialog.
     * @type {?}
     */
    DialogConfig.prototype.id;
    /**
     * The ARIA role of the dialog.
     * @type {?}
     */
    DialogConfig.prototype.role;
    /**
     * Custom class(es) for the overlay panel.
     * @type {?}
     */
    DialogConfig.prototype.panelClass;
    /**
     * Whether the dialog has a background.
     * @type {?}
     */
    DialogConfig.prototype.hasBackdrop;
    /**
     * Custom class(es) for the backdrop.
     * @type {?}
     */
    DialogConfig.prototype.backdropClass;
    /**
     * Whether the dialog can be closed by user interaction.
     * @type {?}
     */
    DialogConfig.prototype.disableClose;
    /**
     * The width of the dialog.
     * @type {?}
     */
    DialogConfig.prototype.width;
    /**
     * The height of the dialog.
     * @type {?}
     */
    DialogConfig.prototype.height;
    /**
     * The minimum width of the dialog.
     * @type {?}
     */
    DialogConfig.prototype.minWidth;
    /**
     * The minimum height of the dialog.
     * @type {?}
     */
    DialogConfig.prototype.minHeight;
    /**
     * The maximum width of the dialog.
     * @type {?}
     */
    DialogConfig.prototype.maxWidth;
    /**
     * The maximum height of the dialog.
     * @type {?}
     */
    DialogConfig.prototype.maxHeight;
    /**
     * The position of the dialog.
     * @type {?}
     */
    DialogConfig.prototype.position;
    /**
     * Data to be injected into the dialog content.
     * @type {?}
     */
    DialogConfig.prototype.data;
    /**
     * The layout direction for the dialog content.
     * @type {?}
     */
    DialogConfig.prototype.direction;
    /**
     * ID of the element that describes the dialog.
     * @type {?}
     */
    DialogConfig.prototype.ariaDescribedBy;
    /**
     * Aria label to assign to the dialog element
     * @type {?}
     */
    DialogConfig.prototype.ariaLabel;
    /**
     * Whether the dialog should focus the first focusable element on open.
     * @type {?}
     */
    DialogConfig.prototype.autoFocus;
    /**
     * Duration of the enter animation. Has to be a valid CSS value (e.g. 100ms).
     * @type {?}
     */
    DialogConfig.prototype.enterAnimationDuration;
    /**
     * Duration of the exit animation. Has to be a valid CSS value (e.g. 50ms).
     * @type {?}
     */
    DialogConfig.prototype.exitAnimationDuration;
}

/**
 * @fileoverview added by tsickle
 * Generated from: src/cdk-experimental/dialog/dialog-container.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @return {?}
 */
function throwDialogContentAlreadyAttachedError() {
    throw Error('Attempting to attach dialog content after content is already attached');
}
/**
 * Internal component that wraps user-provided dialog content.
 * \@docs-private
 */
class CdkDialogContainer extends BasePortalOutlet {
    /**
     * @param {?} _elementRef
     * @param {?} _focusTrapFactory
     * @param {?} _changeDetectorRef
     * @param {?} _document
     * @param {?} _config
     */
    constructor(_elementRef, _focusTrapFactory, _changeDetectorRef, _document, _config) {
        super();
        this._elementRef = _elementRef;
        this._focusTrapFactory = _focusTrapFactory;
        this._changeDetectorRef = _changeDetectorRef;
        this._config = _config;
        /**
         * State of the dialog animation.
         */
        this._state = 'enter';
        /**
         * Element that was focused before the dialog was opened. Save this to restore upon close.
         */
        this._elementFocusedBeforeDialogWasOpened = null;
        /**
         * The class that traps and manages focus within the dialog.
         */
        this._focusTrap = this._focusTrapFactory.create(this._elementRef.nativeElement);
        this._ariaModal = true;
        /**
         * A subject emitting before the dialog enters the view.
         */
        this._beforeEnter = new Subject();
        /**
         * A subject emitting after the dialog enters the view.
         */
        this._afterEnter = new Subject();
        /**
         * A subject emitting before the dialog exits the view.
         */
        this._beforeExit = new Subject();
        /**
         * A subject emitting after the dialog exits the view.
         */
        this._afterExit = new Subject();
        /**
         * Stream of animation `done` events.
         */
        this._animationDone = new Subject();
        /**
         * Attaches a DOM portal to the dialog container.
         * @param portal Portal to be attached.
         * @deprecated To be turned into a method.
         * \@breaking-change 10.0.0
         */
        this.attachDomPortal = (/**
         * @param {?} portal
         * @return {?}
         */
        (portal) => {
            if (this._portalHost.hasAttached()) {
                throwDialogContentAlreadyAttachedError();
            }
            this._savePreviouslyFocusedElement();
            return this._portalHost.attachDomPortal(portal);
        });
        this._document = _document;
        // We use a Subject with a distinctUntilChanged, rather than a callback attached to .done,
        // because some browsers fire the done event twice and we don't want to emit duplicate events.
        // See: https://github.com/angular/angular/issues/24084
        this._animationDone.pipe(distinctUntilChanged((/**
         * @param {?} x
         * @param {?} y
         * @return {?}
         */
        (x, y) => {
            return x.fromState === y.fromState && x.toState === y.toState;
        }))).subscribe((/**
         * @param {?} event
         * @return {?}
         */
        event => {
            // Emit lifecycle events based on animation `done` callback.
            if (event.toState === 'enter') {
                this._autoFocusFirstTabbableElement();
                this._afterEnter.next();
                this._afterEnter.complete();
            }
            if (event.fromState === 'enter' && (event.toState === 'void' || event.toState === 'exit')) {
                this._returnFocusAfterDialog();
                this._afterExit.next();
                this._afterExit.complete();
            }
        }));
    }
    // @HostBinding is used in the class as it is expected to be extended. Since @Component decorator
    // metadata is not inherited by child classes, instead the host binding data is defined in a way
    // that can be inherited.
    // tslint:disable:no-host-decorator-in-concrete
    /**
     * @return {?}
     */
    get _ariaLabel() { return this._config.ariaLabel || null; }
    /**
     * @return {?}
     */
    get _ariaDescribedBy() { return this._config.ariaDescribedBy; }
    /**
     * @return {?}
     */
    get _role() { return this._config.role; }
    /**
     * @return {?}
     */
    get _tabindex() { return -1; }
    /**
     * Destroy focus trap to place focus back to the element focused before the dialog opened.
     * @return {?}
     */
    ngOnDestroy() {
        this._focusTrap.destroy();
        this._animationDone.complete();
    }
    /**
     * Attach a ComponentPortal as content to this dialog container.
     * @template T
     * @param {?} portal Portal to be attached as the dialog content.
     * @return {?}
     */
    attachComponentPortal(portal) {
        if (this._portalHost.hasAttached()) {
            throwDialogContentAlreadyAttachedError();
        }
        this._savePreviouslyFocusedElement();
        return this._portalHost.attachComponentPortal(portal);
    }
    /**
     * Attach a TemplatePortal as content to this dialog container.
     * @template C
     * @param {?} portal Portal to be attached as the dialog content.
     * @return {?}
     */
    attachTemplatePortal(portal) {
        if (this._portalHost.hasAttached()) {
            throwDialogContentAlreadyAttachedError();
        }
        this._savePreviouslyFocusedElement();
        return this._portalHost.attachTemplatePortal(portal);
    }
    /**
     * Emit lifecycle events based on animation `start` callback.
     * @param {?} event
     * @return {?}
     */
    _onAnimationStart(event) {
        if (event.toState === 'enter') {
            this._beforeEnter.next();
            this._beforeEnter.complete();
        }
        if (event.fromState === 'enter' && (event.toState === 'void' || event.toState === 'exit')) {
            this._beforeExit.next();
            this._beforeExit.complete();
        }
    }
    /**
     * Starts the dialog exit animation.
     * @return {?}
     */
    _startExiting() {
        this._state = 'exit';
        // Mark the container for check so it can react if the
        // view container is using OnPush change detection.
        this._changeDetectorRef.markForCheck();
    }
    /**
     * Saves a reference to the element that was focused before the dialog was opened.
     * @private
     * @return {?}
     */
    _savePreviouslyFocusedElement() {
        if (this._document) {
            this._elementFocusedBeforeDialogWasOpened = (/** @type {?} */ (this._document.activeElement));
            // Move focus onto the dialog immediately in order to prevent the user from accidentally
            // opening multiple dialogs at the same time. Needs to be async, because the element
            // may not be focusable immediately.
            Promise.resolve().then((/**
             * @return {?}
             */
            () => this._elementRef.nativeElement.focus()));
        }
    }
    /**
     * Autofocus the first tabbable element inside of the dialog, if there is not a tabbable element,
     * focus the dialog instead.
     * @private
     * @return {?}
     */
    _autoFocusFirstTabbableElement() {
        /** @type {?} */
        const element = this._elementRef.nativeElement;
        // If were to attempt to focus immediately, then the content of the dialog would not yet be
        // ready in instances where change detection has to run first. To deal with this, we simply
        // wait for the microtask queue to be empty.
        if (this._config.autoFocus) {
            this._focusTrap.focusInitialElementWhenReady().then((/**
             * @param {?} hasMovedFocus
             * @return {?}
             */
            hasMovedFocus => {
                // If we didn't find any focusable elements inside the dialog, focus the
                // container so the user can't tab into other elements behind it.
                if (!hasMovedFocus) {
                    element.focus();
                }
            }));
        }
        else {
            /** @type {?} */
            const activeElement = this._document.activeElement;
            // Otherwise ensure that focus is on the dialog container. It's possible that a different
            // component tried to move focus while the open animation was running. See:
            // https://github.com/angular/components/issues/16215. Note that we only want to do this
            // if the focus isn't inside the dialog already, because it's possible that the consumer
            // turned off `autoFocus` in order to move focus themselves.
            if (activeElement !== element && !element.contains(activeElement)) {
                element.focus();
            }
        }
    }
    /**
     * Returns the focus to the element focused before the dialog was open.
     * @private
     * @return {?}
     */
    _returnFocusAfterDialog() {
        /** @type {?} */
        const toFocus = this._elementFocusedBeforeDialogWasOpened;
        // We need the extra check, because IE can set the `activeElement` to null in some cases.
        if (toFocus && typeof toFocus.focus === 'function') {
            /** @type {?} */
            const activeElement = this._document.activeElement;
            /** @type {?} */
            const element = this._elementRef.nativeElement;
            // Make sure that focus is still inside the dialog or is on the body (usually because a
            // non-focusable element like the backdrop was clicked) before moving it. It's possible that
            // the consumer moved it themselves before the animation was done, in which case we shouldn't
            // do anything.
            if (!activeElement || activeElement === this._document.body || activeElement === element ||
                element.contains(activeElement)) {
                toFocus.focus();
            }
        }
    }
}
CdkDialogContainer.decorators = [
    { type: Component, args: [{
                selector: 'cdk-dialog-container',
                template: "<ng-template cdkPortalOutlet></ng-template>\n",
                encapsulation: ViewEncapsulation.None,
                // Using OnPush for dialogs caused some G3 sync issues. Disabled until we can track them down.
                // tslint:disable-next-line:validate-decorators
                changeDetection: ChangeDetectionStrategy.Default,
                animations: [
                    trigger('dialog', [
                        state('enter', style({ opacity: 1 })),
                        state('exit, void', style({ opacity: 0 })),
                        transition('* => enter', animate('{{enterAnimationDuration}}')),
                        transition('* => exit, * => void', animate('{{exitAnimationDuration}}')),
                    ])
                ],
                host: {
                    '[@dialog]': `{
      value: _state,
      params: {
        enterAnimationDuration: _config.enterAnimationDuration,
        exitAnimationDuration: _config.exitAnimationDuration
      }
    }`,
                    '(@dialog.start)': '_onAnimationStart($event)',
                    '(@dialog.done)': '_animationDone.next($event)',
                },
                styles: ["cdk-dialog-container{background:#fff;border-radius:5px;display:block;padding:10px}\n"]
            }] }
];
/** @nocollapse */
CdkDialogContainer.ctorParameters = () => [
    { type: ElementRef },
    { type: FocusTrapFactory },
    { type: ChangeDetectorRef },
    { type: undefined, decorators: [{ type: Optional }, { type: Inject, args: [DOCUMENT,] }] },
    { type: DialogConfig }
];
CdkDialogContainer.propDecorators = {
    _ariaLabel: [{ type: HostBinding, args: ['attr.aria-label',] }],
    _ariaDescribedBy: [{ type: HostBinding, args: ['attr.aria-describedby',] }],
    _role: [{ type: HostBinding, args: ['attr.role',] }],
    _ariaModal: [{ type: HostBinding, args: ['attr.aria-modal',] }],
    _tabindex: [{ type: HostBinding, args: ['attr.tabindex',] }],
    _portalHost: [{ type: ViewChild, args: [CdkPortalOutlet, { static: true },] }]
};
if (false) {
    /**
     * @type {?}
     * @private
     */
    CdkDialogContainer.prototype._document;
    /**
     * State of the dialog animation.
     * @type {?}
     */
    CdkDialogContainer.prototype._state;
    /**
     * Element that was focused before the dialog was opened. Save this to restore upon close.
     * @type {?}
     * @private
     */
    CdkDialogContainer.prototype._elementFocusedBeforeDialogWasOpened;
    /**
     * The class that traps and manages focus within the dialog.
     * @type {?}
     * @private
     */
    CdkDialogContainer.prototype._focusTrap;
    /** @type {?} */
    CdkDialogContainer.prototype._ariaModal;
    /**
     * The portal host inside of this container into which the dialog content will be loaded.
     * @type {?}
     */
    CdkDialogContainer.prototype._portalHost;
    /**
     * A subject emitting before the dialog enters the view.
     * @type {?}
     */
    CdkDialogContainer.prototype._beforeEnter;
    /**
     * A subject emitting after the dialog enters the view.
     * @type {?}
     */
    CdkDialogContainer.prototype._afterEnter;
    /**
     * A subject emitting before the dialog exits the view.
     * @type {?}
     */
    CdkDialogContainer.prototype._beforeExit;
    /**
     * A subject emitting after the dialog exits the view.
     * @type {?}
     */
    CdkDialogContainer.prototype._afterExit;
    /**
     * Stream of animation `done` events.
     * @type {?}
     */
    CdkDialogContainer.prototype._animationDone;
    /**
     * Attaches a DOM portal to the dialog container.
     * \@param portal Portal to be attached.
     * @deprecated To be turned into a method.
     * \@breaking-change 10.0.0
     * @type {?}
     */
    CdkDialogContainer.prototype.attachDomPortal;
    /**
     * @type {?}
     * @private
     */
    CdkDialogContainer.prototype._elementRef;
    /**
     * @type {?}
     * @private
     */
    CdkDialogContainer.prototype._focusTrapFactory;
    /**
     * @type {?}
     * @private
     */
    CdkDialogContainer.prototype._changeDetectorRef;
    /**
     * The dialog configuration.
     * @type {?}
     */
    CdkDialogContainer.prototype._config;
}

/**
 * @fileoverview added by tsickle
 * Generated from: src/cdk-experimental/dialog/dialog-ref.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * Unique id for the created dialog.
 * @type {?}
 */
let uniqueId = 0;
/**
 * Reference to a dialog opened via the Dialog service.
 * @template T, R
 */
class DialogRef {
    /**
     * @param {?} _overlayRef
     * @param {?} _containerInstance
     * @param {?=} id
     */
    constructor(_overlayRef, _containerInstance, id = `dialog-${uniqueId++}`) {
        this._overlayRef = _overlayRef;
        this._containerInstance = _containerInstance;
        this.id = id;
        // If the dialog has a backdrop, handle clicks from the backdrop.
        if (_containerInstance._config.hasBackdrop) {
            _overlayRef.backdropClick().subscribe((/**
             * @return {?}
             */
            () => {
                if (!this.disableClose) {
                    this.close();
                }
            }));
        }
        this.beforeClosed().subscribe((/**
         * @return {?}
         */
        () => {
            this._overlayRef.detachBackdrop();
        }));
        this.afterClosed().subscribe((/**
         * @return {?}
         */
        () => {
            this._overlayRef.detach();
            this._overlayRef.dispose();
            this.componentInstance = (/** @type {?} */ (null));
        }));
        // Close when escape keydown event occurs
        _overlayRef.keydownEvents()
            .pipe(filter((/**
         * @param {?} event
         * @return {?}
         */
        event => {
            return event.keyCode === ESCAPE && !this.disableClose && !hasModifierKey(event);
        })))
            .subscribe((/**
         * @param {?} event
         * @return {?}
         */
        event => {
            event.preventDefault();
            this.close();
        }));
    }
    /**
     * Gets an observable that emits when the overlay's backdrop has been clicked.
     * @return {?}
     */
    backdropClick() {
        return this._overlayRef.backdropClick();
    }
    /**
     * Close the dialog.
     * @param {?=} dialogResult Optional result to return to the dialog opener.
     * @return {?}
     */
    close(dialogResult) {
        this._result = dialogResult;
        this._containerInstance._startExiting();
    }
    /**
     * Updates the dialog's position.
     * @template THIS
     * @this {THIS}
     * @param {?=} position New dialog position.
     * @return {THIS}
     */
    updatePosition(position) {
        /** @type {?} */
        let strategy = (/** @type {?} */ (this))._getPositionStrategy();
        if (position && (position.left || position.right)) {
            position.left ? strategy.left(position.left) : strategy.right(position.right);
        }
        else {
            strategy.centerHorizontally();
        }
        if (position && (position.top || position.bottom)) {
            position.top ? strategy.top(position.top) : strategy.bottom(position.bottom);
        }
        else {
            strategy.centerVertically();
        }
        (/** @type {?} */ (this))._overlayRef.updatePosition();
        return (/** @type {?} */ (this));
    }
    /**
     * Gets an observable that emits when keydown events are targeted on the overlay.
     * @return {?}
     */
    keydownEvents() {
        return this._overlayRef.keydownEvents();
    }
    /**
     * Updates the dialog's width and height, defined, min and max.
     * @template THIS
     * @this {THIS}
     * @param {?} size New size for the overlay.
     * @return {THIS}
     */
    updateSize(size) {
        if (size.width) {
            (/** @type {?} */ (this))._getPositionStrategy().width(size.width.toString());
        }
        if (size.height) {
            (/** @type {?} */ (this))._getPositionStrategy().height(size.height.toString());
        }
        (/** @type {?} */ (this))._overlayRef.updateSize(size);
        (/** @type {?} */ (this))._overlayRef.updatePosition();
        return (/** @type {?} */ (this));
    }
    /**
     * Fetches the position strategy object from the overlay ref.
     * @private
     * @return {?}
     */
    _getPositionStrategy() {
        return (/** @type {?} */ (this._overlayRef.getConfig().positionStrategy));
    }
    /**
     * Gets an observable that emits when dialog begins opening.
     * @return {?}
     */
    beforeOpened() {
        return this._containerInstance._beforeEnter.asObservable();
    }
    /**
     * Gets an observable that emits when dialog is finished opening.
     * @return {?}
     */
    afterOpened() {
        return this._containerInstance._afterEnter.asObservable();
    }
    /**
     * Gets an observable that emits when dialog begins closing.
     * @return {?}
     */
    beforeClosed() {
        return this._containerInstance._beforeExit.pipe(map((/**
         * @return {?}
         */
        () => this._result)));
    }
    /**
     * Gets an observable that emits when dialog is finished closing.
     * @return {?}
     */
    afterClosed() {
        return this._containerInstance._afterExit.pipe(map((/**
         * @return {?}
         */
        () => this._result)));
    }
}
if (false) {
    /**
     * The instance of the component in the dialog.
     * @type {?}
     */
    DialogRef.prototype.componentInstance;
    /**
     * Whether the user is allowed to close the dialog.
     * @type {?}
     */
    DialogRef.prototype.disableClose;
    /**
     * Result to be passed to afterClosed.
     * @type {?}
     * @private
     */
    DialogRef.prototype._result;
    /** @type {?} */
    DialogRef.prototype._overlayRef;
    /**
     * @type {?}
     * @protected
     */
    DialogRef.prototype._containerInstance;
    /** @type {?} */
    DialogRef.prototype.id;
}

/**
 * @fileoverview added by tsickle
 * Generated from: src/cdk-experimental/dialog/dialog-injectors.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * Injection token for the Dialog's ScrollStrategy.
 * @type {?}
 */
const DIALOG_SCROLL_STRATEGY = new InjectionToken('DialogScrollStrategy');
/**
 * Injection token for the Dialog's Data.
 * @type {?}
 */
const DIALOG_DATA = new InjectionToken('DialogData');
/**
 * Injection token for the DialogRef constructor.
 * @type {?}
 */
const DIALOG_REF = new InjectionToken('DialogRef');
/**
 * Injection token for the DialogConfig.
 * @type {?}
 */
const DIALOG_CONFIG = new InjectionToken('DialogConfig');
/**
 * Injection token for the Dialog's DialogContainer component.
 * @type {?}
 */
const DIALOG_CONTAINER = new InjectionToken('DialogContainer');
/**
 * \@docs-private
 * @param {?} overlay
 * @return {?}
 */
function MAT_DIALOG_SCROLL_STRATEGY_PROVIDER_FACTORY(overlay) {
    return (/**
     * @return {?}
     */
    () => overlay.scrollStrategies.block());
}
/**
 * \@docs-private
 * @type {?}
 */
const MAT_DIALOG_SCROLL_STRATEGY_PROVIDER = {
    provide: DIALOG_SCROLL_STRATEGY,
    deps: [Overlay],
    useFactory: MAT_DIALOG_SCROLL_STRATEGY_PROVIDER_FACTORY,
};

/**
 * @fileoverview added by tsickle
 * Generated from: src/cdk-experimental/dialog/dialog.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * Service to open modal dialogs.
 */
class Dialog {
    /**
     * @param {?} _overlay
     * @param {?} _injector
     * @param {?} _dialogRefConstructor
     * @param {?} scrollStrategy
     * @param {?} _parentDialog
     * @param {?} location
     */
    constructor(_overlay, _injector, _dialogRefConstructor, 
    // TODO(crisbeto): the `any` here can be replaced
    // with the proper type once we start using Ivy.
    scrollStrategy, _parentDialog, location) {
        this._overlay = _overlay;
        this._injector = _injector;
        this._dialogRefConstructor = _dialogRefConstructor;
        this._parentDialog = _parentDialog;
        this._afterAllClosedBase = new Subject();
        // TODO(jelbourn): tighten the type on the right-hand side of this expression.
        this.afterAllClosed = defer((/**
         * @return {?}
         */
        () => this.openDialogs.length ?
            this._afterAllClosed : this._afterAllClosed.pipe(startWith(undefined))));
        this._afterOpened = new Subject();
        this._openDialogs = [];
        // Close all of the dialogs when the user goes forwards/backwards in history or when the
        // location hash changes. Note that this usually doesn't include clicking on links (unless
        // the user is using the `HashLocationStrategy`).
        if (!_parentDialog && location) {
            location.subscribe((/**
             * @return {?}
             */
            () => this.closeAll()));
        }
        this._scrollStrategy = scrollStrategy;
    }
    /**
     * Stream that emits when all dialogs are closed.
     * @return {?}
     */
    get _afterAllClosed() {
        return this._parentDialog ? this._parentDialog.afterAllClosed : this._afterAllClosedBase;
    }
    /**
     * Stream that emits when a dialog is opened.
     * @return {?}
     */
    get afterOpened() {
        return this._parentDialog ? this._parentDialog.afterOpened : this._afterOpened;
    }
    /**
     * Stream that emits when a dialog is opened.
     * @return {?}
     */
    get openDialogs() {
        return this._parentDialog ? this._parentDialog.openDialogs : this._openDialogs;
    }
    /**
     * Gets an open dialog by id.
     * @param {?} id
     * @return {?}
     */
    getById(id) {
        return this._openDialogs.find((/**
         * @param {?} ref
         * @return {?}
         */
        ref => ref.id === id));
    }
    /**
     * Closes all open dialogs.
     * @return {?}
     */
    closeAll() {
        this.openDialogs.forEach((/**
         * @param {?} ref
         * @return {?}
         */
        ref => ref.close()));
    }
    /**
     * Opens a dialog from a component.
     * @template T
     * @param {?} component
     * @param {?=} config
     * @return {?}
     */
    openFromComponent(component, config) {
        config = this._applyConfigDefaults(config);
        if (config.id && this.getById(config.id)) {
            throw Error(`Dialog with id "${config.id}" exists already. The dialog id must be unique.`);
        }
        /** @type {?} */
        const overlayRef = this._createOverlay(config);
        /** @type {?} */
        const dialogContainer = this._attachDialogContainer(overlayRef, config);
        /** @type {?} */
        const dialogRef = this._attachDialogContentForComponent(component, dialogContainer, overlayRef, config);
        this._registerDialogRef(dialogRef);
        return dialogRef;
    }
    /**
     * Opens a dialog from a template.
     * @template T
     * @param {?} template
     * @param {?=} config
     * @return {?}
     */
    openFromTemplate(template, config) {
        config = this._applyConfigDefaults(config);
        if (config.id && this.getById(config.id)) {
            throw Error(`Dialog with id "${config.id}" exists already. The dialog id must be unique.`);
        }
        /** @type {?} */
        const overlayRef = this._createOverlay(config);
        /** @type {?} */
        const dialogContainer = this._attachDialogContainer(overlayRef, config);
        /** @type {?} */
        const dialogRef = this._attachDialogContentForTemplate(template, dialogContainer, overlayRef, config);
        this._registerDialogRef(dialogRef);
        return dialogRef;
    }
    /**
     * @return {?}
     */
    ngOnDestroy() {
        // Only close all the dialogs at this level.
        this._openDialogs.forEach((/**
         * @param {?} ref
         * @return {?}
         */
        ref => ref.close()));
    }
    /**
     * Forwards emitting events for when dialogs are opened and all dialogs are closed.
     * @private
     * @param {?} dialogRef
     * @return {?}
     */
    _registerDialogRef(dialogRef) {
        this.openDialogs.push(dialogRef);
        /** @type {?} */
        const dialogOpenSub = dialogRef.afterOpened().subscribe((/**
         * @return {?}
         */
        () => {
            this.afterOpened.next(dialogRef);
            dialogOpenSub.unsubscribe();
        }));
        /** @type {?} */
        const dialogCloseSub = dialogRef.afterClosed().subscribe((/**
         * @return {?}
         */
        () => {
            /** @type {?} */
            let dialogIndex = this._openDialogs.indexOf(dialogRef);
            if (dialogIndex > -1) {
                this._openDialogs.splice(dialogIndex, 1);
            }
            if (!this._openDialogs.length) {
                this._afterAllClosedBase.next();
                dialogCloseSub.unsubscribe();
            }
        }));
    }
    /**
     * Creates an overlay config from a dialog config.
     * @protected
     * @param {?} config The dialog configuration.
     * @return {?} The overlay configuration.
     */
    _createOverlay(config) {
        /** @type {?} */
        const overlayConfig = new OverlayConfig({
            positionStrategy: this._overlay.position().global(),
            scrollStrategy: this._scrollStrategy(),
            panelClass: config.panelClass,
            hasBackdrop: config.hasBackdrop,
            direction: config.direction,
            minWidth: config.minWidth,
            minHeight: config.minHeight,
            maxWidth: config.maxWidth,
            maxHeight: config.maxHeight
        });
        if (config.backdropClass) {
            overlayConfig.backdropClass = config.backdropClass;
        }
        return this._overlay.create(overlayConfig);
    }
    /**
     * Attaches an MatDialogContainer to a dialog's already-created overlay.
     * @protected
     * @param {?} overlay Reference to the dialog's underlying overlay.
     * @param {?} config The dialog configuration.
     * @return {?} A promise resolving to a ComponentRef for the attached container.
     */
    _attachDialogContainer(overlay, config) {
        /** @type {?} */
        const container = config.containerComponent || this._injector.get(DIALOG_CONTAINER);
        /** @type {?} */
        const userInjector = config && config.viewContainerRef && config.viewContainerRef.injector;
        /** @type {?} */
        const injector = new PortalInjector(userInjector || this._injector, new WeakMap([
            [DialogConfig, config]
        ]));
        /** @type {?} */
        const containerPortal = new ComponentPortal(container, config.viewContainerRef, injector);
        /** @type {?} */
        const containerRef = overlay.attach(containerPortal);
        containerRef.instance._config = config;
        return containerRef.instance;
    }
    /**
     * Attaches the user-provided component to the already-created MatDialogContainer.
     * @protected
     * @template T
     * @param {?} componentOrTemplateRef The type of component being loaded into the dialog,
     *     or a TemplateRef to instantiate as the content.
     * @param {?} dialogContainer Reference to the wrapping MatDialogContainer.
     * @param {?} overlayRef Reference to the overlay in which the dialog resides.
     * @param {?} config The dialog configuration.
     * @return {?} A promise resolving to the MatDialogRef that should be returned to the user.
     */
    _attachDialogContentForComponent(componentOrTemplateRef, dialogContainer, overlayRef, config) {
        // Create a reference to the dialog we're creating in order to give the user a handle
        // to modify and close it.
        /** @type {?} */
        const dialogRef = this._createDialogRef(overlayRef, dialogContainer, config);
        /** @type {?} */
        const injector = this._createInjector(config, dialogRef, dialogContainer);
        /** @type {?} */
        const contentRef = dialogContainer.attachComponentPortal(new ComponentPortal(componentOrTemplateRef, undefined, injector));
        dialogRef.componentInstance = contentRef.instance;
        return dialogRef;
    }
    /**
     * Attaches the user-provided component to the already-created MatDialogContainer.
     * @protected
     * @template T
     * @param {?} componentOrTemplateRef The type of component being loaded into the dialog,
     *     or a TemplateRef to instantiate as the content.
     * @param {?} dialogContainer Reference to the wrapping MatDialogContainer.
     * @param {?} overlayRef Reference to the overlay in which the dialog resides.
     * @param {?} config The dialog configuration.
     * @return {?} A promise resolving to the MatDialogRef that should be returned to the user.
     */
    _attachDialogContentForTemplate(componentOrTemplateRef, dialogContainer, overlayRef, config) {
        // Create a reference to the dialog we're creating in order to give the user a handle
        // to modify and close it.
        /** @type {?} */
        const dialogRef = this._createDialogRef(overlayRef, dialogContainer, config);
        dialogContainer.attachTemplatePortal(new TemplatePortal(componentOrTemplateRef, (/** @type {?} */ (null)), (/** @type {?} */ ({ $implicit: config.data, dialogRef }))));
        return dialogRef;
    }
    /**
     * Creates a custom injector to be used inside the dialog. This allows a component loaded inside
     * of a dialog to close itself and, optionally, to return a value.
     * @private
     * @template T
     * @param {?} config Config object that is used to construct the dialog.
     * @param {?} dialogRef Reference to the dialog.
     * @param {?} dialogContainer
     * @return {?} The custom injector that can be used inside the dialog.
     */
    _createInjector(config, dialogRef, dialogContainer) {
        /** @type {?} */
        const userInjector = config && config.viewContainerRef && config.viewContainerRef.injector;
        /** @type {?} */
        const injectionTokens = new WeakMap([
            [this._injector.get(DIALOG_REF), dialogRef],
            [this._injector.get(DIALOG_CONTAINER), dialogContainer],
            [DIALOG_DATA, config.data]
        ]);
        if (config.direction &&
            (!userInjector || !userInjector.get(Directionality, null))) {
            injectionTokens.set(Directionality, {
                value: config.direction,
                change: of()
            });
        }
        return new PortalInjector(userInjector || this._injector, injectionTokens);
    }
    /**
     * Creates a new dialog ref.
     * @private
     * @param {?} overlayRef
     * @param {?} dialogContainer
     * @param {?} config
     * @return {?}
     */
    _createDialogRef(overlayRef, dialogContainer, config) {
        /** @type {?} */
        const dialogRef = new this._dialogRefConstructor(overlayRef, dialogContainer, config.id);
        dialogRef.disableClose = config.disableClose;
        dialogRef.updateSize(config).updatePosition(config.position);
        return dialogRef;
    }
    /**
     * Expands the provided configuration object to include the default values for properties which
     * are undefined.
     * @private
     * @param {?=} config
     * @return {?}
     */
    _applyConfigDefaults(config) {
        /** @type {?} */
        const dialogConfig = (/** @type {?} */ (this._injector.get(DIALOG_CONFIG)));
        return Object.assign(Object.assign({}, new dialogConfig()), config);
    }
}
Dialog.decorators = [
    { type: Injectable }
];
/** @nocollapse */
Dialog.ctorParameters = () => [
    { type: Overlay },
    { type: Injector },
    { type: Type, decorators: [{ type: Inject, args: [DIALOG_REF,] }] },
    { type: undefined, decorators: [{ type: Inject, args: [DIALOG_SCROLL_STRATEGY,] }] },
    { type: Dialog, decorators: [{ type: Optional }, { type: SkipSelf }] },
    { type: Location, decorators: [{ type: Optional }] }
];
if (false) {
    /**
     * @type {?}
     * @private
     */
    Dialog.prototype._scrollStrategy;
    /** @type {?} */
    Dialog.prototype._afterAllClosedBase;
    /** @type {?} */
    Dialog.prototype.afterAllClosed;
    /** @type {?} */
    Dialog.prototype._afterOpened;
    /** @type {?} */
    Dialog.prototype._openDialogs;
    /**
     * @type {?}
     * @private
     */
    Dialog.prototype._overlay;
    /**
     * @type {?}
     * @private
     */
    Dialog.prototype._injector;
    /**
     * @type {?}
     * @private
     */
    Dialog.prototype._dialogRefConstructor;
    /**
     * @type {?}
     * @private
     */
    Dialog.prototype._parentDialog;
}

/**
 * @fileoverview added by tsickle
 * Generated from: src/cdk-experimental/dialog/dialog-module.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
const ɵ0 = DialogRef, ɵ1 = CdkDialogContainer, ɵ2 = DialogConfig;
class DialogModule {
}
DialogModule.decorators = [
    { type: NgModule, args: [{
                imports: [
                    OverlayModule,
                    PortalModule,
                    A11yModule,
                ],
                exports: [
                    // Re-export the PortalModule so that people extending the `CdkDialogContainer`
                    // don't have to remember to import it or be faced with an unhelpful error.
                    PortalModule,
                    CdkDialogContainer,
                ],
                declarations: [
                    CdkDialogContainer,
                ],
                providers: [
                    Dialog,
                    MAT_DIALOG_SCROLL_STRATEGY_PROVIDER,
                    { provide: DIALOG_REF, useValue: ɵ0 },
                    { provide: DIALOG_CONTAINER, useValue: ɵ1 },
                    { provide: DIALOG_CONFIG, useValue: ɵ2 },
                ],
                entryComponents: [CdkDialogContainer],
            },] }
];

/**
 * @fileoverview added by tsickle
 * Generated from: src/cdk-experimental/dialog/public-api.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */

/**
 * Generated bundle index. Do not edit.
 */

export { CdkDialogContainer, DIALOG_CONFIG, DIALOG_CONTAINER, DIALOG_DATA, DIALOG_REF, DIALOG_SCROLL_STRATEGY, Dialog, DialogConfig, DialogModule, DialogRef, MAT_DIALOG_SCROLL_STRATEGY_PROVIDER, MAT_DIALOG_SCROLL_STRATEGY_PROVIDER_FACTORY, throwDialogContentAlreadyAttachedError };
//# sourceMappingURL=dialog.js.map
