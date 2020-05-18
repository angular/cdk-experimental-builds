/**
 * @fileoverview added by tsickle
 * Generated from: src/cdk-experimental/dialog/dialog-container.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { animate, state, style, transition, trigger } from '@angular/animations';
import { FocusTrapFactory } from '@angular/cdk/a11y';
import { BasePortalOutlet, CdkPortalOutlet, } from '@angular/cdk/portal';
import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostBinding, Inject, Optional, ViewChild, ViewEncapsulation, } from '@angular/core';
import { Subject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { DialogConfig } from './dialog-config';
/**
 * @return {?}
 */
export function throwDialogContentAlreadyAttachedError() {
    throw Error('Attempting to attach dialog content after content is already attached');
}
/**
 * Internal component that wraps user-provided dialog content.
 * \@docs-private
 */
let CdkDialogContainer = /** @class */ (() => {
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
    return CdkDialogContainer;
})();
export { CdkDialogContainer };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhbG9nLWNvbnRhaW5lci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL2RpYWxvZy9kaWFsb2ctY29udGFpbmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQVFBLE9BQU8sRUFBQyxPQUFPLEVBQWtCLEtBQUssRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLE9BQU8sRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQy9GLE9BQU8sRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQ25ELE9BQU8sRUFDTCxnQkFBZ0IsRUFFaEIsZUFBZSxHQUdoQixNQUFNLHFCQUFxQixDQUFDO0FBQzdCLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUN6QyxPQUFPLEVBQ0wsdUJBQXVCLEVBQ3ZCLGlCQUFpQixFQUNqQixTQUFTLEVBRVQsVUFBVSxFQUVWLFdBQVcsRUFDWCxNQUFNLEVBRU4sUUFBUSxFQUNSLFNBQVMsRUFDVCxpQkFBaUIsR0FDbEIsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFDLE9BQU8sRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUM3QixPQUFPLEVBQUMsb0JBQW9CLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUNwRCxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0saUJBQWlCLENBQUM7Ozs7QUFHN0MsTUFBTSxVQUFVLHNDQUFzQztJQUNwRCxNQUFNLEtBQUssQ0FBQyx1RUFBdUUsQ0FBQyxDQUFDO0FBQ3ZGLENBQUM7Ozs7O0FBT0Q7Ozs7O0lBQUEsTUE0QmEsa0JBQW1CLFNBQVEsZ0JBQWdCOzs7Ozs7OztRQThDdEQsWUFDVSxXQUFvQyxFQUNwQyxpQkFBbUMsRUFDbkMsa0JBQXFDLEVBQ2YsU0FBYyxFQUVyQyxPQUFxQjtZQUM1QixLQUFLLEVBQUUsQ0FBQztZQU5BLGdCQUFXLEdBQVgsV0FBVyxDQUF5QjtZ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QUksRUFBRTt3QkFDSixXQUFXLEVBQUU7Ozs7OztNQU1YO3dCQUNGLGlCQUFpQixFQUFFLDJCQUEyQjt3QkFDOUMsZ0JBQWdCLEVBQUUsNkJBQTZCO3FCQUNoRDs7aUJBQ0Y7Ozs7Z0JBbERDLFVBQVU7Z0JBZEosZ0JBQWdCO2dCQVd0QixpQkFBaUI7Z0RBd0dkLFFBQVEsWUFBSSxNQUFNLFNBQUMsUUFBUTtnQkExRnhCLFlBQVk7Ozs2QkF3RGpCLFdBQVcsU0FBQyxpQkFBaUI7bUNBRTdCLFdBQVcsU0FBQyx1QkFBdUI7d0JBR25DLFdBQVcsU0FBQyxXQUFXOzZCQUV2QixXQUFXLFNBQUMsaUJBQWlCOzRCQUU3QixXQUFXLFNBQUMsZUFBZTs4QkFJM0IsU0FBUyxTQUFDLGVBQWUsRUFBRSxFQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUM7O0lBbUw1Qyx5QkFBQztLQUFBO1NBaE5ZLGtCQUFrQjs7Ozs7O0lBQzdCLHVDQUFxQzs7Ozs7SUFHckMsb0NBQTRDOzs7Ozs7SUFHNUMsa0VBQXdFOzs7Ozs7SUFHeEUsd0NBQW1GOztJQWFuRix3Q0FBMkQ7Ozs7O0lBTTNELHlDQUF5RTs7Ozs7SUFHekUsMENBQTRDOzs7OztJQUc1Qyx5Q0FBMkM7Ozs7O0lBRzNDLHlDQUEyQzs7Ozs7SUFHM0Msd0NBQTBDOzs7OztJQUcxQyw0Q0FBK0M7Ozs7Ozs7O0lBd0UvQyw2Q0FPQzs7Ozs7SUE1RUMseUNBQTRDOzs7OztJQUM1QywrQ0FBMkM7Ozs7O0lBQzNDLGdEQUE2Qzs7Ozs7SUFHN0MscUNBQTRCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7YW5pbWF0ZSwgQW5pbWF0aW9uRXZlbnQsIHN0YXRlLCBzdHlsZSwgdHJhbnNpdGlvbiwgdHJpZ2dlcn0gZnJvbSAnQGFuZ3VsYXIvYW5pbWF0aW9ucyc7XG5pbXBvcnQge0ZvY3VzVHJhcEZhY3Rvcnl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9hMTF5JztcbmltcG9ydCB7XG4gIEJhc2VQb3J0YWxPdXRsZXQsXG4gIENvbXBvbmVudFBvcnRhbCxcbiAgQ2RrUG9ydGFsT3V0bGV0LFxuICBUZW1wbGF0ZVBvcnRhbCxcbiAgRG9tUG9ydGFsLFxufSBmcm9tICdAYW5ndWxhci9jZGsvcG9ydGFsJztcbmltcG9ydCB7RE9DVU1FTlR9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQge1xuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gIENvbXBvbmVudCxcbiAgQ29tcG9uZW50UmVmLFxuICBFbGVtZW50UmVmLFxuICBFbWJlZGRlZFZpZXdSZWYsXG4gIEhvc3RCaW5kaW5nLFxuICBJbmplY3QsXG4gIE9uRGVzdHJveSxcbiAgT3B0aW9uYWwsXG4gIFZpZXdDaGlsZCxcbiAgVmlld0VuY2Fwc3VsYXRpb24sXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtTdWJqZWN0fSBmcm9tICdyeGpzJztcbmltcG9ydCB7ZGlzdGluY3RVbnRpbENoYW5nZWR9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7RGlhbG9nQ29uZmlnfSBmcm9tICcuL2RpYWxvZy1jb25maWcnO1xuXG5cbmV4cG9ydCBmdW5jdGlvbiB0aHJvd0RpYWxvZ0NvbnRlbnRBbHJlYWR5QXR0YWNoZWRFcnJvcigpIHtcbiAgdGhyb3cgRXJyb3IoJ0F0dGVtcHRpbmcgdG8gYXR0YWNoIGRpYWxvZyBjb250ZW50IGFmdGVyIGNvbnRlbnQgaXMgYWxyZWFkeSBhdHRhY2hlZCcpO1xufVxuXG5cbi8qKlxuICogSW50ZXJuYWwgY29tcG9uZW50IHRoYXQgd3JhcHMgdXNlci1wcm92aWRlZCBkaWFsb2cgY29udGVudC5cbiAqIEBkb2NzLXByaXZhdGVcbiAqL1xuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnY2RrLWRpYWxvZy1jb250YWluZXInLFxuICB0ZW1wbGF0ZVVybDogJy4vZGlhbG9nLWNvbnRhaW5lci5odG1sJyxcbiAgc3R5bGVVcmxzOiBbJ2RpYWxvZy1jb250YWluZXIuY3NzJ10sXG4gIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmUsXG4gIC8vIFVzaW5nIE9uUHVzaCBmb3IgZGlhbG9ncyBjYXVzZWQgc29tZSBHMyBzeW5jIGlzc3Vlcy4gRGlzYWJsZWQgdW50aWwgd2UgY2FuIHRyYWNrIHRoZW0gZG93bi5cbiAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOnZhbGlkYXRlLWRlY29yYXRvcnNcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5EZWZhdWx0LFxuICBhbmltYXRpb25zOiBbXG4gICAgdHJpZ2dlcignZGlhbG9nJywgW1xuICAgICAgc3RhdGUoJ2VudGVyJywgc3R5bGUoe29wYWNpdHk6IDF9KSksXG4gICAgICBzdGF0ZSgnZXhpdCwgdm9pZCcsIHN0eWxlKHtvcGFjaXR5OiAwfSkpLFxuICAgICAgdHJhbnNpdGlvbignKiA9PiBlbnRlcicsIGFuaW1hdGUoJ3t7ZW50ZXJBbmltYXRpb25EdXJhdGlvbn19JykpLFxuICAgICAgdHJhbnNpdGlvbignKiA9PiBleGl0LCAqID0+IHZvaWQnLCBhbmltYXRlKCd7e2V4aXRBbmltYXRpb25EdXJhdGlvbn19JykpLFxuICAgIF0pXG4gIF0sXG4gIGhvc3Q6IHtcbiAgICAnW0BkaWFsb2ddJzogYHtcbiAgICAgIHZhbHVlOiBfc3RhdGUsXG4gICAgICBwYXJhbXM6IHtcbiAgICAgICAgZW50ZXJBbmltYXRpb25EdXJhdGlvbjogX2NvbmZpZy5lbnRlckFuaW1hdGlvbkR1cmF0aW9uLFxuICAgICAgICBleGl0QW5pbWF0aW9uRHVyYXRpb246IF9jb25maWcuZXhpdEFuaW1hdGlvbkR1cmF0aW9uXG4gICAgICB9XG4gICAgfWAsXG4gICAgJyhAZGlhbG9nLnN0YXJ0KSc6ICdfb25BbmltYXRpb25TdGFydCgkZXZlbnQpJyxcbiAgICAnKEBkaWFsb2cuZG9uZSknOiAnX2FuaW1hdGlvbkRvbmUubmV4dCgkZXZlbnQpJyxcbiAgfSxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrRGlhbG9nQ29udGFpbmVyIGV4dGVuZHMgQmFzZVBvcnRhbE91dGxldCBpbXBsZW1lbnRzIE9uRGVzdHJveSB7XG4gIHByaXZhdGUgcmVhZG9ubHkgX2RvY3VtZW50OiBEb2N1bWVudDtcblxuICAvKiogU3RhdGUgb2YgdGhlIGRpYWxvZyBhbmltYXRpb24uICovXG4gIF9zdGF0ZTogJ3ZvaWQnIHwgJ2VudGVyJyB8ICdleGl0JyA9ICdlbnRlcic7XG5cbiAgLyoqIEVsZW1lbnQgdGhhdCB3YXMgZm9jdXNlZCBiZWZvcmUgdGhlIGRpYWxvZyB3YXMgb3BlbmVkLiBTYXZlIHRoaXMgdG8gcmVzdG9yZSB1cG9uIGNsb3NlLiAqL1xuICBwcml2YXRlIF9lbGVtZW50Rm9jdXNlZEJlZm9yZURpYWxvZ1dhc09wZW5lZDogSFRNTEVsZW1lbnQgfCBudWxsID0gbnVsbDtcblxuICAgLyoqIFRoZSBjbGFzcyB0aGF0IHRyYXBzIGFuZCBtYW5hZ2VzIGZvY3VzIHdpdGhpbiB0aGUgZGlhbG9nLiAqL1xuICBwcml2YXRlIF9mb2N1c1RyYXAgPSB0aGlzLl9mb2N1c1RyYXBGYWN0b3J5LmNyZWF0ZSh0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQpO1xuXG4gIC8vIEBIb3N0QmluZGluZyBpcyB1c2VkIGluIHRoZSBjbGFzcyBhcyBpdCBpcyBleHBlY3RlZCB0byBiZSBleHRlbmRlZC4gU2luY2UgQENvbXBvbmVudCBkZWNvcmF0b3JcbiAgLy8gbWV0YWRhdGEgaXMgbm90IGluaGVyaXRlZCBieSBjaGlsZCBjbGFzc2VzLCBpbnN0ZWFkIHRoZSBob3N0IGJpbmRpbmcgZGF0YSBpcyBkZWZpbmVkIGluIGEgd2F5XG4gIC8vIHRoYXQgY2FuIGJlIGluaGVyaXRlZC5cbiAgLy8gdHNsaW50OmRpc2FibGU6bm8taG9zdC1kZWNvcmF0b3ItaW4tY29uY3JldGVcbiAgQEhvc3RCaW5kaW5nKCdhdHRyLmFyaWEtbGFiZWwnKSBnZXQgX2FyaWFMYWJlbCgpIHsgcmV0dXJuIHRoaXMuX2NvbmZpZy5hcmlhTGFiZWwgfHwgbnVsbDsgfVxuXG4gIEBIb3N0QmluZGluZygnYXR0ci5hcmlhLWRlc2NyaWJlZGJ5JylcbiAgZ2V0IF9hcmlhRGVzY3JpYmVkQnkoKSB7IHJldHVybiB0aGlzLl9jb25maWcuYXJpYURlc2NyaWJlZEJ5OyB9XG5cbiAgQEhvc3RCaW5kaW5nKCdhdHRyLnJvbGUnKSBnZXQgX3JvbGUoKSB7IHJldHVybiB0aGlzLl9jb25maWcucm9sZTsgfVxuXG4gIEBIb3N0QmluZGluZygnYXR0ci5hcmlhLW1vZGFsJykgX2FyaWFNb2RhbDogYm9vbGVhbiA9IHRydWU7XG5cbiAgQEhvc3RCaW5kaW5nKCdhdHRyLnRhYmluZGV4JykgZ2V0IF90YWJpbmRleCgpIHsgcmV0dXJuIC0xOyB9XG4gIC8vIHRzbGludDpkaXNhYmxlOm5vLWhvc3QtZGVjb3JhdG9yLWluLWNvbmNyZXRlXG5cbiAgLyoqIFRoZSBwb3J0YWwgaG9zdCBpbnNpZGUgb2YgdGhpcyBjb250YWluZXIgaW50byB3aGljaCB0aGUgZGlhbG9nIGNvbnRlbnQgd2lsbCBiZSBsb2FkZWQuICovXG4gIEBWaWV3Q2hpbGQoQ2RrUG9ydGFsT3V0bGV0LCB7c3RhdGljOiB0cnVlfSkgX3BvcnRhbEhvc3Q6IENka1BvcnRhbE91dGxldDtcblxuICAvKiogQSBzdWJqZWN0IGVtaXR0aW5nIGJlZm9yZSB0aGUgZGlhbG9nIGVudGVycyB0aGUgdmlldy4gKi9cbiAgX2JlZm9yZUVudGVyOiBTdWJqZWN0PHZvaWQ+ID0gbmV3IFN1YmplY3QoKTtcblxuICAvKiogQSBzdWJqZWN0IGVtaXR0aW5nIGFmdGVyIHRoZSBkaWFsb2cgZW50ZXJzIHRoZSB2aWV3LiAqL1xuICBfYWZ0ZXJFbnRlcjogU3ViamVjdDx2b2lkPiA9IG5ldyBTdWJqZWN0KCk7XG5cbiAgLyoqIEEgc3ViamVjdCBlbWl0dGluZyBiZWZvcmUgdGhlIGRpYWxvZyBleGl0cyB0aGUgdmlldy4gKi9cbiAgX2JlZm9yZUV4aXQ6IFN1YmplY3Q8dm9pZD4gPSBuZXcgU3ViamVjdCgpO1xuXG4gIC8qKiBBIHN1YmplY3QgZW1pdHRpbmcgYWZ0ZXIgdGhlIGRpYWxvZyBleGl0cyB0aGUgdmlldy4gKi9cbiAgX2FmdGVyRXhpdDogU3ViamVjdDx2b2lkPiA9IG5ldyBTdWJqZWN0KCk7XG5cbiAgLyoqIFN0cmVhbSBvZiBhbmltYXRpb24gYGRvbmVgIGV2ZW50cy4gKi9cbiAgX2FuaW1hdGlvbkRvbmUgPSBuZXcgU3ViamVjdDxBbmltYXRpb25FdmVudD4oKTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIF9lbGVtZW50UmVmOiBFbGVtZW50UmVmPEhUTUxFbGVtZW50PixcbiAgICBwcml2YXRlIF9mb2N1c1RyYXBGYWN0b3J5OiBGb2N1c1RyYXBGYWN0b3J5LFxuICAgIHByaXZhdGUgX2NoYW5nZURldGVjdG9yUmVmOiBDaGFuZ2VEZXRlY3RvclJlZixcbiAgICBAT3B0aW9uYWwoKSBASW5qZWN0KERPQ1VNRU5UKSBfZG9jdW1lbnQ6IGFueSxcbiAgICAvKiogVGhlIGRpYWxvZyBjb25maWd1cmF0aW9uLiAqL1xuICAgIHB1YmxpYyBfY29uZmlnOiBEaWFsb2dDb25maWcpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5fZG9jdW1lbnQgPSBfZG9jdW1lbnQ7XG5cbiAgICAvLyBXZSB1c2UgYSBTdWJqZWN0IHdpdGggYSBkaXN0aW5jdFVudGlsQ2hhbmdlZCwgcmF0aGVyIHRoYW4gYSBjYWxsYmFjayBhdHRhY2hlZCB0byAuZG9uZSxcbiAgICAvLyBiZWNhdXNlIHNvbWUgYnJvd3NlcnMgZmlyZSB0aGUgZG9uZSBldmVudCB0d2ljZSBhbmQgd2UgZG9uJ3Qgd2FudCB0byBlbWl0IGR1cGxpY2F0ZSBldmVudHMuXG4gICAgLy8gU2VlOiBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyL2lzc3Vlcy8yNDA4NFxuICAgIHRoaXMuX2FuaW1hdGlvbkRvbmUucGlwZShkaXN0aW5jdFVudGlsQ2hhbmdlZCgoeCwgeSkgPT4ge1xuICAgICAgcmV0dXJuIHguZnJvbVN0YXRlID09PSB5LmZyb21TdGF0ZSAmJiB4LnRvU3RhdGUgPT09IHkudG9TdGF0ZTtcbiAgICB9KSkuc3Vic2NyaWJlKGV2ZW50ID0+IHtcbiAgICAgIC8vIEVtaXQgbGlmZWN5Y2xlIGV2ZW50cyBiYXNlZCBvbiBhbmltYXRpb24gYGRvbmVgIGNhbGxiYWNrLlxuICAgICAgaWYgKGV2ZW50LnRvU3RhdGUgPT09ICdlbnRlcicpIHtcbiAgICAgICAgdGhpcy5fYXV0b0ZvY3VzRmlyc3RUYWJiYWJsZUVsZW1lbnQoKTtcbiAgICAgICAgdGhpcy5fYWZ0ZXJFbnRlci5uZXh0KCk7XG4gICAgICAgIHRoaXMuX2FmdGVyRW50ZXIuY29tcGxldGUoKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGV2ZW50LmZyb21TdGF0ZSA9PT0gJ2VudGVyJyAmJiAoZXZlbnQudG9TdGF0ZSA9PT0gJ3ZvaWQnIHx8IGV2ZW50LnRvU3RhdGUgPT09ICdleGl0JykpIHtcbiAgICAgICAgdGhpcy5fcmV0dXJuRm9jdXNBZnRlckRpYWxvZygpO1xuICAgICAgICB0aGlzLl9hZnRlckV4aXQubmV4dCgpO1xuICAgICAgICB0aGlzLl9hZnRlckV4aXQuY29tcGxldGUoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBEZXN0cm95IGZvY3VzIHRyYXAgdG8gcGxhY2UgZm9jdXMgYmFjayB0byB0aGUgZWxlbWVudCBmb2N1c2VkIGJlZm9yZSB0aGUgZGlhbG9nIG9wZW5lZC4gKi9cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgdGhpcy5fZm9jdXNUcmFwLmRlc3Ryb3koKTtcbiAgICB0aGlzLl9hbmltYXRpb25Eb25lLmNvbXBsZXRlKCk7XG4gIH1cblxuICAvKipcbiAgICogQXR0YWNoIGEgQ29tcG9uZW50UG9ydGFsIGFzIGNvbnRlbnQgdG8gdGhpcyBkaWFsb2cgY29udGFpbmVyLlxuICAgKiBAcGFyYW0gcG9ydGFsIFBvcnRhbCB0byBiZSBhdHRhY2hlZCBhcyB0aGUgZGlhbG9nIGNvbnRlbnQuXG4gICAqL1xuICBhdHRhY2hDb21wb25lbnRQb3J0YWw8VD4ocG9ydGFsOiBDb21wb25lbnRQb3J0YWw8VD4pOiBDb21wb25lbnRSZWY8VD4ge1xuICAgIGlmICh0aGlzLl9wb3J0YWxIb3N0Lmhhc0F0dGFjaGVkKCkpIHtcbiAgICAgIHRocm93RGlhbG9nQ29udGVudEFscmVhZHlBdHRhY2hlZEVycm9yKCk7XG4gICAgfVxuXG4gICAgdGhpcy5fc2F2ZVByZXZpb3VzbHlGb2N1c2VkRWxlbWVudCgpO1xuICAgIHJldHVybiB0aGlzLl9wb3J0YWxIb3N0LmF0dGFjaENvbXBvbmVudFBvcnRhbChwb3J0YWwpO1xuICB9XG5cbiAgLyoqXG4gICAqIEF0dGFjaCBhIFRlbXBsYXRlUG9ydGFsIGFzIGNvbnRlbnQgdG8gdGhpcyBkaWFsb2cgY29udGFpbmVyLlxuICAgKiBAcGFyYW0gcG9ydGFsIFBvcnRhbCB0byBiZSBhdHRhY2hlZCBhcyB0aGUgZGlhbG9nIGNvbnRlbnQuXG4gICAqL1xuICBhdHRhY2hUZW1wbGF0ZVBvcnRhbDxDPihwb3J0YWw6IFRlbXBsYXRlUG9ydGFsPEM+KTogRW1iZWRkZWRWaWV3UmVmPEM+IHtcbiAgICBpZiAodGhpcy5fcG9ydGFsSG9zdC5oYXNBdHRhY2hlZCgpKSB7XG4gICAgICB0aHJvd0RpYWxvZ0NvbnRlbnRBbHJlYWR5QXR0YWNoZWRFcnJvcigpO1xuICAgIH1cblxuICAgIHRoaXMuX3NhdmVQcmV2aW91c2x5Rm9jdXNlZEVsZW1lbnQoKTtcbiAgICByZXR1cm4gdGhpcy5fcG9ydGFsSG9zdC5hdHRhY2hUZW1wbGF0ZVBvcnRhbChwb3J0YWwpO1xuICB9XG5cbiAgLyoqXG4gICAqIEF0dGFjaGVzIGEgRE9NIHBvcnRhbCB0byB0aGUgZGlhbG9nIGNvbnRhaW5lci5cbiAgICogQHBhcmFtIHBvcnRhbCBQb3J0YWwgdG8gYmUgYXR0YWNoZWQuXG4gICAqIEBkZXByZWNhdGVkIFRvIGJlIHR1cm5lZCBpbnRvIGEgbWV0aG9kLlxuICAgKiBAYnJlYWtpbmctY2hhbmdlIDEwLjAuMFxuICAgKi9cbiAgYXR0YWNoRG9tUG9ydGFsID0gKHBvcnRhbDogRG9tUG9ydGFsKSA9PiB7XG4gICAgaWYgKHRoaXMuX3BvcnRhbEhvc3QuaGFzQXR0YWNoZWQoKSkge1xuICAgICAgdGhyb3dEaWFsb2dDb250ZW50QWxyZWFkeUF0dGFjaGVkRXJyb3IoKTtcbiAgICB9XG5cbiAgICB0aGlzLl9zYXZlUHJldmlvdXNseUZvY3VzZWRFbGVtZW50KCk7XG4gICAgcmV0dXJuIHRoaXMuX3BvcnRhbEhvc3QuYXR0YWNoRG9tUG9ydGFsKHBvcnRhbCk7XG4gIH1cblxuICAvKiogRW1pdCBsaWZlY3ljbGUgZXZlbnRzIGJhc2VkIG9uIGFuaW1hdGlvbiBgc3RhcnRgIGNhbGxiYWNrLiAqL1xuICBfb25BbmltYXRpb25TdGFydChldmVudDogQW5pbWF0aW9uRXZlbnQpIHtcbiAgICBpZiAoZXZlbnQudG9TdGF0ZSA9PT0gJ2VudGVyJykge1xuICAgICAgdGhpcy5fYmVmb3JlRW50ZXIubmV4dCgpO1xuICAgICAgdGhpcy5fYmVmb3JlRW50ZXIuY29tcGxldGUoKTtcbiAgICB9XG4gICAgaWYgKGV2ZW50LmZyb21TdGF0ZSA9PT0gJ2VudGVyJyAmJiAoZXZlbnQudG9TdGF0ZSA9PT0gJ3ZvaWQnIHx8IGV2ZW50LnRvU3RhdGUgPT09ICdleGl0JykpIHtcbiAgICAgIHRoaXMuX2JlZm9yZUV4aXQubmV4dCgpO1xuICAgICAgdGhpcy5fYmVmb3JlRXhpdC5jb21wbGV0ZSgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBTdGFydHMgdGhlIGRpYWxvZyBleGl0IGFuaW1hdGlvbi4gKi9cbiAgX3N0YXJ0RXhpdGluZygpOiB2b2lkIHtcbiAgICB0aGlzLl9zdGF0ZSA9ICdleGl0JztcblxuICAgIC8vIE1hcmsgdGhlIGNvbnRhaW5lciBmb3IgY2hlY2sgc28gaXQgY2FuIHJlYWN0IGlmIHRoZVxuICAgIC8vIHZpZXcgY29udGFpbmVyIGlzIHVzaW5nIE9uUHVzaCBjaGFuZ2UgZGV0ZWN0aW9uLlxuICAgIHRoaXMuX2NoYW5nZURldGVjdG9yUmVmLm1hcmtGb3JDaGVjaygpO1xuICB9XG5cbiAgLyoqIFNhdmVzIGEgcmVmZXJlbmNlIHRvIHRoZSBlbGVtZW50IHRoYXQgd2FzIGZvY3VzZWQgYmVmb3JlIHRoZSBkaWFsb2cgd2FzIG9wZW5lZC4gKi9cbiAgcHJpdmF0ZSBfc2F2ZVByZXZpb3VzbHlGb2N1c2VkRWxlbWVudCgpIHtcbiAgICBpZiAodGhpcy5fZG9jdW1lbnQpIHtcbiAgICAgIHRoaXMuX2VsZW1lbnRGb2N1c2VkQmVmb3JlRGlhbG9nV2FzT3BlbmVkID0gdGhpcy5fZG9jdW1lbnQuYWN0aXZlRWxlbWVudCBhcyBIVE1MRWxlbWVudDtcblxuICAgICAgLy8gTW92ZSBmb2N1cyBvbnRvIHRoZSBkaWFsb2cgaW1tZWRpYXRlbHkgaW4gb3JkZXIgdG8gcHJldmVudCB0aGUgdXNlciBmcm9tIGFjY2lkZW50YWxseVxuICAgICAgLy8gb3BlbmluZyBtdWx0aXBsZSBkaWFsb2dzIGF0IHRoZSBzYW1lIHRpbWUuIE5lZWRzIHRvIGJlIGFzeW5jLCBiZWNhdXNlIHRoZSBlbGVtZW50XG4gICAgICAvLyBtYXkgbm90IGJlIGZvY3VzYWJsZSBpbW1lZGlhdGVseS5cbiAgICAgIFByb21pc2UucmVzb2x2ZSgpLnRoZW4oKCkgPT4gdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LmZvY3VzKCkpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBdXRvZm9jdXMgdGhlIGZpcnN0IHRhYmJhYmxlIGVsZW1lbnQgaW5zaWRlIG9mIHRoZSBkaWFsb2csIGlmIHRoZXJlIGlzIG5vdCBhIHRhYmJhYmxlIGVsZW1lbnQsXG4gICAqIGZvY3VzIHRoZSBkaWFsb2cgaW5zdGVhZC5cbiAgICovXG4gIHByaXZhdGUgX2F1dG9Gb2N1c0ZpcnN0VGFiYmFibGVFbGVtZW50KCkge1xuICAgIGNvbnN0IGVsZW1lbnQgPSB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQ7XG5cbiAgICAvLyBJZiB3ZXJlIHRvIGF0dGVtcHQgdG8gZm9jdXMgaW1tZWRpYXRlbHksIHRoZW4gdGhlIGNvbnRlbnQgb2YgdGhlIGRpYWxvZyB3b3VsZCBub3QgeWV0IGJlXG4gICAgLy8gcmVhZHkgaW4gaW5zdGFuY2VzIHdoZXJlIGNoYW5nZSBkZXRlY3Rpb24gaGFzIHRvIHJ1biBmaXJzdC4gVG8gZGVhbCB3aXRoIHRoaXMsIHdlIHNpbXBseVxuICAgIC8vIHdhaXQgZm9yIHRoZSBtaWNyb3Rhc2sgcXVldWUgdG8gYmUgZW1wdHkuXG4gICAgaWYgKHRoaXMuX2NvbmZpZy5hdXRvRm9jdXMpIHtcbiAgICAgIHRoaXMuX2ZvY3VzVHJhcC5mb2N1c0luaXRpYWxFbGVtZW50V2hlblJlYWR5KCkudGhlbihoYXNNb3ZlZEZvY3VzID0+IHtcbiAgICAgICAgLy8gSWYgd2UgZGlkbid0IGZpbmQgYW55IGZvY3VzYWJsZSBlbGVtZW50cyBpbnNpZGUgdGhlIGRpYWxvZywgZm9jdXMgdGhlXG4gICAgICAgIC8vIGNvbnRhaW5lciBzbyB0aGUgdXNlciBjYW4ndCB0YWIgaW50byBvdGhlciBlbGVtZW50cyBiZWhpbmQgaXQuXG4gICAgICAgIGlmICghaGFzTW92ZWRGb2N1cykge1xuICAgICAgICAgIGVsZW1lbnQuZm9jdXMoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGFjdGl2ZUVsZW1lbnQgPSB0aGlzLl9kb2N1bWVudC5hY3RpdmVFbGVtZW50O1xuXG4gICAgICAvLyBPdGhlcndpc2UgZW5zdXJlIHRoYXQgZm9jdXMgaXMgb24gdGhlIGRpYWxvZyBjb250YWluZXIuIEl0J3MgcG9zc2libGUgdGhhdCBhIGRpZmZlcmVudFxuICAgICAgLy8gY29tcG9uZW50IHRyaWVkIHRvIG1vdmUgZm9jdXMgd2hpbGUgdGhlIG9wZW4gYW5pbWF0aW9uIHdhcyBydW5uaW5nLiBTZWU6XG4gICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9jb21wb25lbnRzL2lzc3Vlcy8xNjIxNS4gTm90ZSB0aGF0IHdlIG9ubHkgd2FudCB0byBkbyB0aGlzXG4gICAgICAvLyBpZiB0aGUgZm9jdXMgaXNuJ3QgaW5zaWRlIHRoZSBkaWFsb2cgYWxyZWFkeSwgYmVjYXVzZSBpdCdzIHBvc3NpYmxlIHRoYXQgdGhlIGNvbnN1bWVyXG4gICAgICAvLyB0dXJuZWQgb2ZmIGBhdXRvRm9jdXNgIGluIG9yZGVyIHRvIG1vdmUgZm9jdXMgdGhlbXNlbHZlcy5cbiAgICAgIGlmIChhY3RpdmVFbGVtZW50ICE9PSBlbGVtZW50ICYmICFlbGVtZW50LmNvbnRhaW5zKGFjdGl2ZUVsZW1lbnQpKSB7XG4gICAgICAgIGVsZW1lbnQuZm9jdXMoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKiogUmV0dXJucyB0aGUgZm9jdXMgdG8gdGhlIGVsZW1lbnQgZm9jdXNlZCBiZWZvcmUgdGhlIGRpYWxvZyB3YXMgb3Blbi4gKi9cbiAgcHJpdmF0ZSBfcmV0dXJuRm9jdXNBZnRlckRpYWxvZygpIHtcbiAgICBjb25zdCB0b0ZvY3VzID0gdGhpcy5fZWxlbWVudEZvY3VzZWRCZWZvcmVEaWFsb2dXYXNPcGVuZWQ7XG4gICAgLy8gV2UgbmVlZCB0aGUgZXh0cmEgY2hlY2ssIGJlY2F1c2UgSUUgY2FuIHNldCB0aGUgYGFjdGl2ZUVsZW1lbnRgIHRvIG51bGwgaW4gc29tZSBjYXNlcy5cbiAgICBpZiAodG9Gb2N1cyAmJiB0eXBlb2YgdG9Gb2N1cy5mb2N1cyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgY29uc3QgYWN0aXZlRWxlbWVudCA9IHRoaXMuX2RvY3VtZW50LmFjdGl2ZUVsZW1lbnQ7XG4gICAgICBjb25zdCBlbGVtZW50ID0gdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50O1xuXG4gICAgICAvLyBNYWtlIHN1cmUgdGhhdCBmb2N1cyBpcyBzdGlsbCBpbnNpZGUgdGhlIGRpYWxvZyBvciBpcyBvbiB0aGUgYm9keSAodXN1YWxseSBiZWNhdXNlIGFcbiAgICAgIC8vIG5vbi1mb2N1c2FibGUgZWxlbWVudCBsaWtlIHRoZSBiYWNrZHJvcCB3YXMgY2xpY2tlZCkgYmVmb3JlIG1vdmluZyBpdC4gSXQncyBwb3NzaWJsZSB0aGF0XG4gICAgICAvLyB0aGUgY29uc3VtZXIgbW92ZWQgaXQgdGhlbXNlbHZlcyBiZWZvcmUgdGhlIGFuaW1hdGlvbiB3YXMgZG9uZSwgaW4gd2hpY2ggY2FzZSB3ZSBzaG91bGRuJ3RcbiAgICAgIC8vIGRvIGFueXRoaW5nLlxuICAgICAgaWYgKCFhY3RpdmVFbGVtZW50IHx8IGFjdGl2ZUVsZW1lbnQgPT09IHRoaXMuX2RvY3VtZW50LmJvZHkgfHwgYWN0aXZlRWxlbWVudCA9PT0gZWxlbWVudCB8fFxuICAgICAgICBlbGVtZW50LmNvbnRhaW5zKGFjdGl2ZUVsZW1lbnQpKSB7XG4gICAgICAgIHRvRm9jdXMuZm9jdXMoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiJdfQ==