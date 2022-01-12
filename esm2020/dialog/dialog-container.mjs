/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { animate, state, style, transition, trigger } from '@angular/animations';
import { FocusTrapFactory, InteractivityChecker } from '@angular/cdk/a11y';
import { _getFocusedElementPierceShadowDom } from '@angular/cdk/platform';
import { BasePortalOutlet, CdkPortalOutlet, } from '@angular/cdk/portal';
import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, NgZone, Optional, ViewChild, ViewEncapsulation, } from '@angular/core';
import { Subject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { DialogConfig } from './dialog-config';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/a11y";
import * as i2 from "./dialog-config";
import * as i3 from "@angular/cdk/portal";
export function throwDialogContentAlreadyAttachedError() {
    throw Error('Attempting to attach dialog content after content is already attached');
}
/**
 * Internal component that wraps user-provided dialog content.
 * @docs-private
 */
export class CdkDialogContainer extends BasePortalOutlet {
    constructor(_elementRef, _focusTrapFactory, _changeDetectorRef, _interactivityChecker, _ngZone, _document, 
    /** The dialog configuration. */
    _config) {
        super();
        this._elementRef = _elementRef;
        this._focusTrapFactory = _focusTrapFactory;
        this._changeDetectorRef = _changeDetectorRef;
        this._interactivityChecker = _interactivityChecker;
        this._ngZone = _ngZone;
        this._config = _config;
        /** State of the dialog animation. */
        this._state = 'enter';
        /** Element that was focused before the dialog was opened. Save this to restore upon close. */
        this._elementFocusedBeforeDialogWasOpened = null;
        /** The class that traps and manages focus within the dialog. */
        this._focusTrap = this._focusTrapFactory.create(this._elementRef.nativeElement);
        /** A subject emitting before the dialog enters the view. */
        this._beforeEnter = new Subject();
        /** A subject emitting after the dialog enters the view. */
        this._afterEnter = new Subject();
        /** A subject emitting before the dialog exits the view. */
        this._beforeExit = new Subject();
        /** A subject emitting after the dialog exits the view. */
        this._afterExit = new Subject();
        /** Stream of animation `done` events. */
        this._animationDone = new Subject();
        /**
         * Attaches a DOM portal to the dialog container.
         * @param portal Portal to be attached.
         * @deprecated To be turned into a method.
         * @breaking-change 10.0.0
         */
        this.attachDomPortal = (portal) => {
            if (this._portalHost.hasAttached() && (typeof ngDevMode === 'undefined' || ngDevMode)) {
                throwDialogContentAlreadyAttachedError();
            }
            return this._portalHost.attachDomPortal(portal);
        };
        this._document = _document;
        // We use a Subject with a distinctUntilChanged, rather than a callback attached to .done,
        // because some browsers fire the done event twice and we don't want to emit duplicate events.
        // See: https://github.com/angular/angular/issues/24084
        this._animationDone
            .pipe(distinctUntilChanged((x, y) => {
            return x.fromState === y.fromState && x.toState === y.toState;
        }))
            .subscribe(event => {
            // Emit lifecycle events based on animation `done` callback.
            if (event.toState === 'enter') {
                this._autoFocus();
                this._afterEnter.next();
                this._afterEnter.complete();
            }
            if (event.fromState === 'enter' && (event.toState === 'void' || event.toState === 'exit')) {
                this._returnFocusAfterDialog();
                this._afterExit.next();
                this._afterExit.complete();
            }
        });
    }
    /** Initializes the dialog container with the attached content. */
    _initializeWithAttachedContent() {
        // Save the previously focused element. This element will be re-focused
        // when the dialog closes.
        this._savePreviouslyFocusedElement();
        // Move focus onto the dialog immediately in order to prevent the user
        // from accidentally opening multiple dialogs at the same time.
        this._focusDialogContainer();
    }
    /** Destroy focus trap to place focus back to the element focused before the dialog opened. */
    ngOnDestroy() {
        this._focusTrap.destroy();
        this._animationDone.complete();
    }
    /**
     * Attach a ComponentPortal as content to this dialog container.
     * @param portal Portal to be attached as the dialog content.
     */
    attachComponentPortal(portal) {
        if (this._portalHost.hasAttached() && (typeof ngDevMode === 'undefined' || ngDevMode)) {
            throwDialogContentAlreadyAttachedError();
        }
        return this._portalHost.attachComponentPortal(portal);
    }
    /**
     * Attach a TemplatePortal as content to this dialog container.
     * @param portal Portal to be attached as the dialog content.
     */
    attachTemplatePortal(portal) {
        if (this._portalHost.hasAttached() && (typeof ngDevMode === 'undefined' || ngDevMode)) {
            throwDialogContentAlreadyAttachedError();
        }
        return this._portalHost.attachTemplatePortal(portal);
    }
    /** Emit lifecycle events based on animation `start` callback. */
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
    /** Starts the dialog exit animation. */
    _startExiting() {
        this._state = 'exit';
        // Mark the container for check so it can react if the
        // view container is using OnPush change detection.
        this._changeDetectorRef.markForCheck();
    }
    /** Saves a reference to the element that was focused before the dialog was opened. */
    _savePreviouslyFocusedElement() {
        if (this._document) {
            this._elementFocusedBeforeDialogWasOpened = _getFocusedElementPierceShadowDom();
        }
    }
    /** Focuses the dialog container. */
    _focusDialogContainer() {
        // Note that there is no focus method when rendering on the server.
        if (this._elementRef.nativeElement.focus) {
            this._elementRef.nativeElement.focus();
        }
    }
    /**
     * Focuses the provided element. If the element is not focusable, it will add a tabIndex
     * attribute to forcefully focus it. The attribute is removed after focus is moved.
     * @param element The element to focus.
     */
    _forceFocus(element, options) {
        if (!this._interactivityChecker.isFocusable(element)) {
            element.tabIndex = -1;
            // The tabindex attribute should be removed to avoid navigating to that element again
            this._ngZone.runOutsideAngular(() => {
                element.addEventListener('blur', () => element.removeAttribute('tabindex'));
                element.addEventListener('mousedown', () => element.removeAttribute('tabindex'));
            });
        }
        element.focus(options);
    }
    /**
     * Focuses the first element that matches the given selector within the focus trap.
     * @param selector The CSS selector for the element to set focus to.
     */
    _focusByCssSelector(selector, options) {
        let elementToFocus = this._elementRef.nativeElement.querySelector(selector);
        if (elementToFocus) {
            this._forceFocus(elementToFocus, options);
        }
    }
    /**
     * Autofocus the element specified by the autoFocus field. When autoFocus is not 'dialog', if
     * for some reason the element cannot be focused, the dialog container will be focused.
     */
    _autoFocus() {
        const element = this._elementRef.nativeElement;
        // If were to attempt to focus immediately, then the content of the dialog would not yet be
        // ready in instances where change detection has to run first. To deal with this, we simply
        // wait for the microtask queue to be empty when setting focus when autoFocus isn't set to
        // dialog. If the element inside the dialog can't be focused, then the container is focused
        // so the user can't tab into other elements behind it.
        switch (this._config.autoFocus) {
            case false:
            case 'dialog':
                const activeElement = _getFocusedElementPierceShadowDom();
                // Ensure that focus is on the dialog container. It's possible that a different
                // component tried to move focus while the open animation was running. See:
                // https://github.com/angular/components/issues/16215. Note that we only want to do this
                // if the focus isn't inside the dialog already, because it's possible that the consumer
                // turned off `autoFocus` in order to move focus themselves.
                if (activeElement !== element && !element.contains(activeElement)) {
                    element.focus();
                }
                break;
            case true:
            case 'first-tabbable':
                this._focusTrap.focusInitialElementWhenReady().then(hasMovedFocus => {
                    if (!hasMovedFocus) {
                        element.focus();
                    }
                });
                break;
            case 'first-heading':
                this._focusByCssSelector('h1, h2, h3, h4, h5, h6, [role="heading"]');
                break;
            default:
                this._focusByCssSelector(this._config.autoFocus);
                break;
        }
    }
    /** Returns the focus to the element focused before the dialog was open. */
    _returnFocusAfterDialog() {
        const toFocus = this._elementFocusedBeforeDialogWasOpened;
        // We need the extra check, because IE can set the `activeElement` to null in some cases.
        if (toFocus && typeof toFocus.focus === 'function') {
            const activeElement = _getFocusedElementPierceShadowDom();
            const element = this._elementRef.nativeElement;
            // Make sure that focus is still inside the dialog or is on the body (usually because a
            // non-focusable element like the backdrop was clicked) before moving it. It's possible that
            // the consumer moved it themselves before the animation was done, in which case we shouldn't
            // do anything.
            if (!activeElement ||
                activeElement === this._document.body ||
                activeElement === element ||
                element.contains(activeElement)) {
                toFocus.focus();
            }
        }
    }
}
CdkDialogContainer.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.2.0-next.2", ngImport: i0, type: CdkDialogContainer, deps: [{ token: i0.ElementRef }, { token: i1.FocusTrapFactory }, { token: i0.ChangeDetectorRef }, { token: i1.InteractivityChecker }, { token: i0.NgZone }, { token: DOCUMENT, optional: true }, { token: i2.DialogConfig }], target: i0.ɵɵFactoryTarget.Component });
CdkDialogContainer.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "12.0.0", version: "13.2.0-next.2", type: CdkDialogContainer, selector: "cdk-dialog-container", host: { attributes: { "tabindex": "-1", "aria-modal": "true" }, listeners: { "@dialog.start": "_onAnimationStart($event)", "@dialog.done": "_animationDone.next($event)" }, properties: { "@dialog": "{\n      value: _state,\n      params: {\n        enterAnimationDuration: _config.enterAnimationDuration,\n        exitAnimationDuration: _config.exitAnimationDuration\n      }\n    }", "attr.role": "_config.role", "attr.aria-label": "_config.ariaLabel || null", "attr.aria-describedby": "_config.ariaDescribedBy" } }, viewQueries: [{ propertyName: "_portalHost", first: true, predicate: CdkPortalOutlet, descendants: true, static: true }], usesInheritance: true, ngImport: i0, template: "<ng-template cdkPortalOutlet></ng-template>\n", styles: ["cdk-dialog-container{background:#fff;border-radius:5px;display:block;padding:10px}\n"], directives: [{ type: i3.CdkPortalOutlet, selector: "[cdkPortalOutlet]", inputs: ["cdkPortalOutlet"], outputs: ["attached"], exportAs: ["cdkPortalOutlet"] }], animations: [
        trigger('dialog', [
            state('enter', style({ opacity: 1 })),
            state('exit, void', style({ opacity: 0 })),
            transition('* => enter', animate('{{enterAnimationDuration}}')),
            transition('* => exit, * => void', animate('{{exitAnimationDuration}}')),
        ]),
    ], changeDetection: i0.ChangeDetectionStrategy.Default, encapsulation: i0.ViewEncapsulation.None });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.2.0-next.2", ngImport: i0, type: CdkDialogContainer, decorators: [{
            type: Component,
            args: [{ selector: 'cdk-dialog-container', encapsulation: ViewEncapsulation.None, changeDetection: ChangeDetectionStrategy.Default, animations: [
                        trigger('dialog', [
                            state('enter', style({ opacity: 1 })),
                            state('exit, void', style({ opacity: 0 })),
                            transition('* => enter', animate('{{enterAnimationDuration}}')),
                            transition('* => exit, * => void', animate('{{exitAnimationDuration}}')),
                        ]),
                    ], host: {
                        '[@dialog]': `{
      value: _state,
      params: {
        enterAnimationDuration: _config.enterAnimationDuration,
        exitAnimationDuration: _config.exitAnimationDuration
      }
    }`,
                        '(@dialog.start)': '_onAnimationStart($event)',
                        '(@dialog.done)': '_animationDone.next($event)',
                        'tabindex': '-1',
                        '[attr.role]': '_config.role',
                        'aria-modal': 'true',
                        '[attr.aria-label]': '_config.ariaLabel || null',
                        '[attr.aria-describedby]': '_config.ariaDescribedBy',
                    }, template: "<ng-template cdkPortalOutlet></ng-template>\n", styles: ["cdk-dialog-container{background:#fff;border-radius:5px;display:block;padding:10px}\n"] }]
        }], ctorParameters: function () { return [{ type: i0.ElementRef }, { type: i1.FocusTrapFactory }, { type: i0.ChangeDetectorRef }, { type: i1.InteractivityChecker }, { type: i0.NgZone }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [DOCUMENT]
                }] }, { type: i2.DialogConfig }]; }, propDecorators: { _portalHost: [{
                type: ViewChild,
                args: [CdkPortalOutlet, { static: true }]
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhbG9nLWNvbnRhaW5lci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL2RpYWxvZy9kaWFsb2ctY29udGFpbmVyLnRzIiwiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvZGlhbG9nL2RpYWxvZy1jb250YWluZXIuaHRtbCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsT0FBTyxFQUFrQixLQUFLLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxPQUFPLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUMvRixPQUFPLEVBQUMsZ0JBQWdCLEVBQUUsb0JBQW9CLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUN6RSxPQUFPLEVBQUMsaUNBQWlDLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUN4RSxPQUFPLEVBQ0wsZ0JBQWdCLEVBQ2hCLGVBQWUsR0FJaEIsTUFBTSxxQkFBcUIsQ0FBQztBQUM3QixPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDekMsT0FBTyxFQUNMLHVCQUF1QixFQUN2QixpQkFBaUIsRUFDakIsU0FBUyxFQUVULFVBQVUsRUFFVixNQUFNLEVBQ04sTUFBTSxFQUVOLFFBQVEsRUFDUixTQUFTLEVBQ1QsaUJBQWlCLEdBQ2xCLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBQyxPQUFPLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDN0IsT0FBTyxFQUFDLG9CQUFvQixFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDcEQsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGlCQUFpQixDQUFDOzs7OztBQUU3QyxNQUFNLFVBQVUsc0NBQXNDO0lBQ3BELE1BQU0sS0FBSyxDQUFDLHVFQUF1RSxDQUFDLENBQUM7QUFDdkYsQ0FBQztBQUVEOzs7R0FHRztBQWtDSCxNQUFNLE9BQU8sa0JBQW1CLFNBQVEsZ0JBQWdCO0lBOEJ0RCxZQUNVLFdBQW9DLEVBQ3BDLGlCQUFtQyxFQUNuQyxrQkFBcUMsRUFDNUIscUJBQTJDLEVBQzNDLE9BQWUsRUFDRixTQUFjO0lBQzVDLGdDQUFnQztJQUN6QixPQUFxQjtRQUU1QixLQUFLLEVBQUUsQ0FBQztRQVRBLGdCQUFXLEdBQVgsV0FBVyxDQUF5QjtRQUNwQyxzQkFBaUIsR0FBakIsaUJBQWlCLENBQWtCO1FBQ25DLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBbUI7UUFDNUIsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUFzQjtRQUMzQyxZQUFPLEdBQVAsT0FBTyxDQUFRO1FBR3pCLFlBQU8sR0FBUCxPQUFPLENBQWM7UUFuQzlCLHFDQUFxQztRQUNyQyxXQUFNLEdBQThCLE9BQU8sQ0FBQztRQUU1Qyw4RkFBOEY7UUFDdEYseUNBQW9DLEdBQXVCLElBQUksQ0FBQztRQUV4RSxnRUFBZ0U7UUFDeEQsZUFBVSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUtuRiw0REFBNEQ7UUFDbkQsaUJBQVksR0FBRyxJQUFJLE9BQU8sRUFBUSxDQUFDO1FBRTVDLDJEQUEyRDtRQUNsRCxnQkFBVyxHQUFHLElBQUksT0FBTyxFQUFRLENBQUM7UUFFM0MsMkRBQTJEO1FBQ2xELGdCQUFXLEdBQUcsSUFBSSxPQUFPLEVBQVEsQ0FBQztRQUUzQywwREFBMEQ7UUFDakQsZUFBVSxHQUFHLElBQUksT0FBTyxFQUFRLENBQUM7UUFFMUMseUNBQXlDO1FBQ2hDLG1CQUFjLEdBQUcsSUFBSSxPQUFPLEVBQWtCLENBQUM7UUFpRnhEOzs7OztXQUtHO1FBQ00sb0JBQWUsR0FBRyxDQUFDLE1BQWlCLEVBQUUsRUFBRTtZQUMvQyxJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxPQUFPLFNBQVMsS0FBSyxXQUFXLElBQUksU0FBUyxDQUFDLEVBQUU7Z0JBQ3JGLHNDQUFzQyxFQUFFLENBQUM7YUFDMUM7WUFFRCxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2xELENBQUMsQ0FBQztRQS9FQSxJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztRQUUzQiwwRkFBMEY7UUFDMUYsOEZBQThGO1FBQzlGLHVEQUF1RDtRQUN2RCxJQUFJLENBQUMsY0FBYzthQUNoQixJQUFJLENBQ0gsb0JBQW9CLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDNUIsT0FBTyxDQUFDLENBQUMsU0FBUyxLQUFLLENBQUMsQ0FBQyxTQUFTLElBQUksQ0FBQyxDQUFDLE9BQU8sS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDO1FBQ2hFLENBQUMsQ0FBQyxDQUNIO2FBQ0EsU0FBUyxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQ2pCLDREQUE0RDtZQUM1RCxJQUFJLEtBQUssQ0FBQyxPQUFPLEtBQUssT0FBTyxFQUFFO2dCQUM3QixJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7Z0JBQ2xCLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ3hCLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLENBQUM7YUFDN0I7WUFFRCxJQUFJLEtBQUssQ0FBQyxTQUFTLEtBQUssT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sS0FBSyxNQUFNLElBQUksS0FBSyxDQUFDLE9BQU8sS0FBSyxNQUFNLENBQUMsRUFBRTtnQkFDekYsSUFBSSxDQUFDLHVCQUF1QixFQUFFLENBQUM7Z0JBQy9CLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ3ZCLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLENBQUM7YUFDNUI7UUFDSCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCxrRUFBa0U7SUFDbEUsOEJBQThCO1FBQzVCLHVFQUF1RTtRQUN2RSwwQkFBMEI7UUFDMUIsSUFBSSxDQUFDLDZCQUE2QixFQUFFLENBQUM7UUFDckMsc0VBQXNFO1FBQ3RFLCtEQUErRDtRQUMvRCxJQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQztJQUMvQixDQUFDO0lBRUQsOEZBQThGO0lBQzlGLFdBQVc7UUFDVCxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQzFCLElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDakMsQ0FBQztJQUVEOzs7T0FHRztJQUNILHFCQUFxQixDQUFJLE1BQTBCO1FBQ2pELElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLE9BQU8sU0FBUyxLQUFLLFdBQVcsSUFBSSxTQUFTLENBQUMsRUFBRTtZQUNyRixzQ0FBc0MsRUFBRSxDQUFDO1NBQzFDO1FBRUQsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLHFCQUFxQixDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3hELENBQUM7SUFFRDs7O09BR0c7SUFDSCxvQkFBb0IsQ0FBSSxNQUF5QjtRQUMvQyxJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxPQUFPLFNBQVMsS0FBSyxXQUFXLElBQUksU0FBUyxDQUFDLEVBQUU7WUFDckYsc0NBQXNDLEVBQUUsQ0FBQztTQUMxQztRQUVELE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUN2RCxDQUFDO0lBZ0JELGlFQUFpRTtJQUNqRSxpQkFBaUIsQ0FBQyxLQUFxQjtRQUNyQyxJQUFJLEtBQUssQ0FBQyxPQUFPLEtBQUssT0FBTyxFQUFFO1lBQzdCLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDekIsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsQ0FBQztTQUM5QjtRQUNELElBQUksS0FBSyxDQUFDLFNBQVMsS0FBSyxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxLQUFLLE1BQU0sSUFBSSxLQUFLLENBQUMsT0FBTyxLQUFLLE1BQU0sQ0FBQyxFQUFFO1lBQ3pGLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDeEIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsQ0FBQztTQUM3QjtJQUNILENBQUM7SUFFRCx3Q0FBd0M7SUFDeEMsYUFBYTtRQUNYLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBRXJCLHNEQUFzRDtRQUN0RCxtREFBbUQ7UUFDbkQsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFlBQVksRUFBRSxDQUFDO0lBQ3pDLENBQUM7SUFFRCxzRkFBc0Y7SUFDOUUsNkJBQTZCO1FBQ25DLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUNsQixJQUFJLENBQUMsb0NBQW9DLEdBQUcsaUNBQWlDLEVBQUUsQ0FBQztTQUNqRjtJQUNILENBQUM7SUFFRCxvQ0FBb0M7SUFDNUIscUJBQXFCO1FBQzNCLG1FQUFtRTtRQUNuRSxJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRTtZQUN4QyxJQUFJLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztTQUN4QztJQUNILENBQUM7SUFFRDs7OztPQUlHO0lBQ0ssV0FBVyxDQUFDLE9BQW9CLEVBQUUsT0FBc0I7UUFDOUQsSUFBSSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLEVBQUU7WUFDcEQsT0FBTyxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUN0QixxRkFBcUY7WUFDckYsSUFBSSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLEVBQUU7Z0JBQ2xDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO2dCQUM1RSxPQUFPLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxFQUFFLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztZQUNuRixDQUFDLENBQUMsQ0FBQztTQUNKO1FBQ0QsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUN6QixDQUFDO0lBRUQ7OztPQUdHO0lBQ0ssbUJBQW1CLENBQUMsUUFBZ0IsRUFBRSxPQUFzQjtRQUNsRSxJQUFJLGNBQWMsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQy9ELFFBQVEsQ0FDYSxDQUFDO1FBQ3hCLElBQUksY0FBYyxFQUFFO1lBQ2xCLElBQUksQ0FBQyxXQUFXLENBQUMsY0FBYyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1NBQzNDO0lBQ0gsQ0FBQztJQUVEOzs7T0FHRztJQUNLLFVBQVU7UUFDaEIsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUM7UUFFL0MsMkZBQTJGO1FBQzNGLDJGQUEyRjtRQUMzRiwwRkFBMEY7UUFDMUYsMkZBQTJGO1FBQzNGLHVEQUF1RDtRQUN2RCxRQUFRLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFO1lBQzlCLEtBQUssS0FBSyxDQUFDO1lBQ1gsS0FBSyxRQUFRO2dCQUNYLE1BQU0sYUFBYSxHQUFHLGlDQUFpQyxFQUFFLENBQUM7Z0JBQzFELCtFQUErRTtnQkFDL0UsMkVBQTJFO2dCQUMzRSx3RkFBd0Y7Z0JBQ3hGLHdGQUF3RjtnQkFDeEYsNERBQTREO2dCQUM1RCxJQUFJLGFBQWEsS0FBSyxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxFQUFFO29CQUNqRSxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUM7aUJBQ2pCO2dCQUNELE1BQU07WUFDUixLQUFLLElBQUksQ0FBQztZQUNWLEtBQUssZ0JBQWdCO2dCQUNuQixJQUFJLENBQUMsVUFBVSxDQUFDLDRCQUE0QixFQUFFLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxFQUFFO29CQUNsRSxJQUFJLENBQUMsYUFBYSxFQUFFO3dCQUNsQixPQUFPLENBQUMsS0FBSyxFQUFFLENBQUM7cUJBQ2pCO2dCQUNILENBQUMsQ0FBQyxDQUFDO2dCQUNILE1BQU07WUFDUixLQUFLLGVBQWU7Z0JBQ2xCLElBQUksQ0FBQyxtQkFBbUIsQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO2dCQUNyRSxNQUFNO1lBQ1I7Z0JBQ0UsSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBVSxDQUFDLENBQUM7Z0JBQ2xELE1BQU07U0FDVDtJQUNILENBQUM7SUFFRCwyRUFBMkU7SUFDbkUsdUJBQXVCO1FBQzdCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxvQ0FBb0MsQ0FBQztRQUMxRCx5RkFBeUY7UUFDekYsSUFBSSxPQUFPLElBQUksT0FBTyxPQUFPLENBQUMsS0FBSyxLQUFLLFVBQVUsRUFBRTtZQUNsRCxNQUFNLGFBQWEsR0FBRyxpQ0FBaUMsRUFBRSxDQUFDO1lBQzFELE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDO1lBRS9DLHVGQUF1RjtZQUN2Riw0RkFBNEY7WUFDNUYsNkZBQTZGO1lBQzdGLGVBQWU7WUFDZixJQUNFLENBQUMsYUFBYTtnQkFDZCxhQUFhLEtBQUssSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJO2dCQUNyQyxhQUFhLEtBQUssT0FBTztnQkFDekIsT0FBTyxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsRUFDL0I7Z0JBQ0EsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDO2FBQ2pCO1NBQ0Y7SUFDSCxDQUFDOztzSEE1UFUsa0JBQWtCLHVLQW9DUCxRQUFROzBHQXBDbkIsa0JBQWtCLDhtQkFhbEIsZUFBZSxxRkMzRjVCLCtDQUNBLDhRRG9EYztRQUNWLE9BQU8sQ0FBQyxRQUFRLEVBQUU7WUFDaEIsS0FBSyxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsRUFBQyxPQUFPLEVBQUUsQ0FBQyxFQUFDLENBQUMsQ0FBQztZQUNuQyxLQUFLLENBQUMsWUFBWSxFQUFFLEtBQUssQ0FBQyxFQUFDLE9BQU8sRUFBRSxDQUFDLEVBQUMsQ0FBQyxDQUFDO1lBQ3hDLFVBQVUsQ0FBQyxZQUFZLEVBQUUsT0FBTyxDQUFDLDRCQUE0QixDQUFDLENBQUM7WUFDL0QsVUFBVSxDQUFDLHNCQUFzQixFQUFFLE9BQU8sQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO1NBQ3pFLENBQUM7S0FDSDtrR0FrQlUsa0JBQWtCO2tCQWpDOUIsU0FBUzsrQkFDRSxzQkFBc0IsaUJBR2pCLGlCQUFpQixDQUFDLElBQUksbUJBR3BCLHVCQUF1QixDQUFDLE9BQU8sY0FDcEM7d0JBQ1YsT0FBTyxDQUFDLFFBQVEsRUFBRTs0QkFDaEIsS0FBSyxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsRUFBQyxPQUFPLEVBQUUsQ0FBQyxFQUFDLENBQUMsQ0FBQzs0QkFDbkMsS0FBSyxDQUFDLFlBQVksRUFBRSxLQUFLLENBQUMsRUFBQyxPQUFPLEVBQUUsQ0FBQyxFQUFDLENBQUMsQ0FBQzs0QkFDeEMsVUFBVSxDQUFDLFlBQVksRUFBRSxPQUFPLENBQUMsNEJBQTRCLENBQUMsQ0FBQzs0QkFDL0QsVUFBVSxDQUFDLHNCQUFzQixFQUFFLE9BQU8sQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO3lCQUN6RSxDQUFDO3FCQUNILFFBQ0s7d0JBQ0osV0FBVyxFQUFFOzs7Ozs7TUFNWDt3QkFDRixpQkFBaUIsRUFBRSwyQkFBMkI7d0JBQzlDLGdCQUFnQixFQUFFLDZCQUE2Qjt3QkFDL0MsVUFBVSxFQUFFLElBQUk7d0JBQ2hCLGFBQWEsRUFBRSxjQUFjO3dCQUM3QixZQUFZLEVBQUUsTUFBTTt3QkFDcEIsbUJBQW1CLEVBQUUsMkJBQTJCO3dCQUNoRCx5QkFBeUIsRUFBRSx5QkFBeUI7cUJBQ3JEOzswQkFzQ0UsUUFBUTs7MEJBQUksTUFBTTsyQkFBQyxRQUFRO3VFQXZCYyxXQUFXO3NCQUF0RCxTQUFTO3VCQUFDLGVBQWUsRUFBRSxFQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHthbmltYXRlLCBBbmltYXRpb25FdmVudCwgc3RhdGUsIHN0eWxlLCB0cmFuc2l0aW9uLCB0cmlnZ2VyfSBmcm9tICdAYW5ndWxhci9hbmltYXRpb25zJztcbmltcG9ydCB7Rm9jdXNUcmFwRmFjdG9yeSwgSW50ZXJhY3Rpdml0eUNoZWNrZXJ9IGZyb20gJ0Bhbmd1bGFyL2Nkay9hMTF5JztcbmltcG9ydCB7X2dldEZvY3VzZWRFbGVtZW50UGllcmNlU2hhZG93RG9tfSBmcm9tICdAYW5ndWxhci9jZGsvcGxhdGZvcm0nO1xuaW1wb3J0IHtcbiAgQmFzZVBvcnRhbE91dGxldCxcbiAgQ2RrUG9ydGFsT3V0bGV0LFxuICBDb21wb25lbnRQb3J0YWwsXG4gIERvbVBvcnRhbCxcbiAgVGVtcGxhdGVQb3J0YWwsXG59IGZyb20gJ0Bhbmd1bGFyL2Nkay9wb3J0YWwnO1xuaW1wb3J0IHtET0NVTUVOVH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7XG4gIENoYW5nZURldGVjdGlvblN0cmF0ZWd5LFxuICBDaGFuZ2VEZXRlY3RvclJlZixcbiAgQ29tcG9uZW50LFxuICBDb21wb25lbnRSZWYsXG4gIEVsZW1lbnRSZWYsXG4gIEVtYmVkZGVkVmlld1JlZixcbiAgSW5qZWN0LFxuICBOZ1pvbmUsXG4gIE9uRGVzdHJveSxcbiAgT3B0aW9uYWwsXG4gIFZpZXdDaGlsZCxcbiAgVmlld0VuY2Fwc3VsYXRpb24sXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtTdWJqZWN0fSBmcm9tICdyeGpzJztcbmltcG9ydCB7ZGlzdGluY3RVbnRpbENoYW5nZWR9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7RGlhbG9nQ29uZmlnfSBmcm9tICcuL2RpYWxvZy1jb25maWcnO1xuXG5leHBvcnQgZnVuY3Rpb24gdGhyb3dEaWFsb2dDb250ZW50QWxyZWFkeUF0dGFjaGVkRXJyb3IoKSB7XG4gIHRocm93IEVycm9yKCdBdHRlbXB0aW5nIHRvIGF0dGFjaCBkaWFsb2cgY29udGVudCBhZnRlciBjb250ZW50IGlzIGFscmVhZHkgYXR0YWNoZWQnKTtcbn1cblxuLyoqXG4gKiBJbnRlcm5hbCBjb21wb25lbnQgdGhhdCB3cmFwcyB1c2VyLXByb3ZpZGVkIGRpYWxvZyBjb250ZW50LlxuICogQGRvY3MtcHJpdmF0ZVxuICovXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdjZGstZGlhbG9nLWNvbnRhaW5lcicsXG4gIHRlbXBsYXRlVXJsOiAnLi9kaWFsb2ctY29udGFpbmVyLmh0bWwnLFxuICBzdHlsZVVybHM6IFsnZGlhbG9nLWNvbnRhaW5lci5jc3MnXSxcbiAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZSxcbiAgLy8gVXNpbmcgT25QdXNoIGZvciBkaWFsb2dzIGNhdXNlZCBzb21lIEczIHN5bmMgaXNzdWVzLiBEaXNhYmxlZCB1bnRpbCB3ZSBjYW4gdHJhY2sgdGhlbSBkb3duLlxuICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6dmFsaWRhdGUtZGVjb3JhdG9yc1xuICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5LkRlZmF1bHQsXG4gIGFuaW1hdGlvbnM6IFtcbiAgICB0cmlnZ2VyKCdkaWFsb2cnLCBbXG4gICAgICBzdGF0ZSgnZW50ZXInLCBzdHlsZSh7b3BhY2l0eTogMX0pKSxcbiAgICAgIHN0YXRlKCdleGl0LCB2b2lkJywgc3R5bGUoe29wYWNpdHk6IDB9KSksXG4gICAgICB0cmFuc2l0aW9uKCcqID0+IGVudGVyJywgYW5pbWF0ZSgne3tlbnRlckFuaW1hdGlvbkR1cmF0aW9ufX0nKSksXG4gICAgICB0cmFuc2l0aW9uKCcqID0+IGV4aXQsICogPT4gdm9pZCcsIGFuaW1hdGUoJ3t7ZXhpdEFuaW1hdGlvbkR1cmF0aW9ufX0nKSksXG4gICAgXSksXG4gIF0sXG4gIGhvc3Q6IHtcbiAgICAnW0BkaWFsb2ddJzogYHtcbiAgICAgIHZhbHVlOiBfc3RhdGUsXG4gICAgICBwYXJhbXM6IHtcbiAgICAgICAgZW50ZXJBbmltYXRpb25EdXJhdGlvbjogX2NvbmZpZy5lbnRlckFuaW1hdGlvbkR1cmF0aW9uLFxuICAgICAgICBleGl0QW5pbWF0aW9uRHVyYXRpb246IF9jb25maWcuZXhpdEFuaW1hdGlvbkR1cmF0aW9uXG4gICAgICB9XG4gICAgfWAsXG4gICAgJyhAZGlhbG9nLnN0YXJ0KSc6ICdfb25BbmltYXRpb25TdGFydCgkZXZlbnQpJyxcbiAgICAnKEBkaWFsb2cuZG9uZSknOiAnX2FuaW1hdGlvbkRvbmUubmV4dCgkZXZlbnQpJyxcbiAgICAndGFiaW5kZXgnOiAnLTEnLFxuICAgICdbYXR0ci5yb2xlXSc6ICdfY29uZmlnLnJvbGUnLFxuICAgICdhcmlhLW1vZGFsJzogJ3RydWUnLFxuICAgICdbYXR0ci5hcmlhLWxhYmVsXSc6ICdfY29uZmlnLmFyaWFMYWJlbCB8fCBudWxsJyxcbiAgICAnW2F0dHIuYXJpYS1kZXNjcmliZWRieV0nOiAnX2NvbmZpZy5hcmlhRGVzY3JpYmVkQnknLFxuICB9LFxufSlcbmV4cG9ydCBjbGFzcyBDZGtEaWFsb2dDb250YWluZXIgZXh0ZW5kcyBCYXNlUG9ydGFsT3V0bGV0IGltcGxlbWVudHMgT25EZXN0cm95IHtcbiAgcHJpdmF0ZSByZWFkb25seSBfZG9jdW1lbnQ6IERvY3VtZW50O1xuXG4gIC8qKiBTdGF0ZSBvZiB0aGUgZGlhbG9nIGFuaW1hdGlvbi4gKi9cbiAgX3N0YXRlOiAndm9pZCcgfCAnZW50ZXInIHwgJ2V4aXQnID0gJ2VudGVyJztcblxuICAvKiogRWxlbWVudCB0aGF0IHdhcyBmb2N1c2VkIGJlZm9yZSB0aGUgZGlhbG9nIHdhcyBvcGVuZWQuIFNhdmUgdGhpcyB0byByZXN0b3JlIHVwb24gY2xvc2UuICovXG4gIHByaXZhdGUgX2VsZW1lbnRGb2N1c2VkQmVmb3JlRGlhbG9nV2FzT3BlbmVkOiBIVE1MRWxlbWVudCB8IG51bGwgPSBudWxsO1xuXG4gIC8qKiBUaGUgY2xhc3MgdGhhdCB0cmFwcyBhbmQgbWFuYWdlcyBmb2N1cyB3aXRoaW4gdGhlIGRpYWxvZy4gKi9cbiAgcHJpdmF0ZSBfZm9jdXNUcmFwID0gdGhpcy5fZm9jdXNUcmFwRmFjdG9yeS5jcmVhdGUodGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50KTtcblxuICAvKiogVGhlIHBvcnRhbCBob3N0IGluc2lkZSBvZiB0aGlzIGNvbnRhaW5lciBpbnRvIHdoaWNoIHRoZSBkaWFsb2cgY29udGVudCB3aWxsIGJlIGxvYWRlZC4gKi9cbiAgQFZpZXdDaGlsZChDZGtQb3J0YWxPdXRsZXQsIHtzdGF0aWM6IHRydWV9KSBfcG9ydGFsSG9zdDogQ2RrUG9ydGFsT3V0bGV0O1xuXG4gIC8qKiBBIHN1YmplY3QgZW1pdHRpbmcgYmVmb3JlIHRoZSBkaWFsb2cgZW50ZXJzIHRoZSB2aWV3LiAqL1xuICByZWFkb25seSBfYmVmb3JlRW50ZXIgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xuXG4gIC8qKiBBIHN1YmplY3QgZW1pdHRpbmcgYWZ0ZXIgdGhlIGRpYWxvZyBlbnRlcnMgdGhlIHZpZXcuICovXG4gIHJlYWRvbmx5IF9hZnRlckVudGVyID0gbmV3IFN1YmplY3Q8dm9pZD4oKTtcblxuICAvKiogQSBzdWJqZWN0IGVtaXR0aW5nIGJlZm9yZSB0aGUgZGlhbG9nIGV4aXRzIHRoZSB2aWV3LiAqL1xuICByZWFkb25seSBfYmVmb3JlRXhpdCA9IG5ldyBTdWJqZWN0PHZvaWQ+KCk7XG5cbiAgLyoqIEEgc3ViamVjdCBlbWl0dGluZyBhZnRlciB0aGUgZGlhbG9nIGV4aXRzIHRoZSB2aWV3LiAqL1xuICByZWFkb25seSBfYWZ0ZXJFeGl0ID0gbmV3IFN1YmplY3Q8dm9pZD4oKTtcblxuICAvKiogU3RyZWFtIG9mIGFuaW1hdGlvbiBgZG9uZWAgZXZlbnRzLiAqL1xuICByZWFkb25seSBfYW5pbWF0aW9uRG9uZSA9IG5ldyBTdWJqZWN0PEFuaW1hdGlvbkV2ZW50PigpO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgX2VsZW1lbnRSZWY6IEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+LFxuICAgIHByaXZhdGUgX2ZvY3VzVHJhcEZhY3Rvcnk6IEZvY3VzVHJhcEZhY3RvcnksXG4gICAgcHJpdmF0ZSBfY2hhbmdlRGV0ZWN0b3JSZWY6IENoYW5nZURldGVjdG9yUmVmLFxuICAgIHByaXZhdGUgcmVhZG9ubHkgX2ludGVyYWN0aXZpdHlDaGVja2VyOiBJbnRlcmFjdGl2aXR5Q2hlY2tlcixcbiAgICBwcml2YXRlIHJlYWRvbmx5IF9uZ1pvbmU6IE5nWm9uZSxcbiAgICBAT3B0aW9uYWwoKSBASW5qZWN0KERPQ1VNRU5UKSBfZG9jdW1lbnQ6IGFueSxcbiAgICAvKiogVGhlIGRpYWxvZyBjb25maWd1cmF0aW9uLiAqL1xuICAgIHB1YmxpYyBfY29uZmlnOiBEaWFsb2dDb25maWcsXG4gICkge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLl9kb2N1bWVudCA9IF9kb2N1bWVudDtcblxuICAgIC8vIFdlIHVzZSBhIFN1YmplY3Qgd2l0aCBhIGRpc3RpbmN0VW50aWxDaGFuZ2VkLCByYXRoZXIgdGhhbiBhIGNhbGxiYWNrIGF0dGFjaGVkIHRvIC5kb25lLFxuICAgIC8vIGJlY2F1c2Ugc29tZSBicm93c2VycyBmaXJlIHRoZSBkb25lIGV2ZW50IHR3aWNlIGFuZCB3ZSBkb24ndCB3YW50IHRvIGVtaXQgZHVwbGljYXRlIGV2ZW50cy5cbiAgICAvLyBTZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIvaXNzdWVzLzI0MDg0XG4gICAgdGhpcy5fYW5pbWF0aW9uRG9uZVxuICAgICAgLnBpcGUoXG4gICAgICAgIGRpc3RpbmN0VW50aWxDaGFuZ2VkKCh4LCB5KSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHguZnJvbVN0YXRlID09PSB5LmZyb21TdGF0ZSAmJiB4LnRvU3RhdGUgPT09IHkudG9TdGF0ZTtcbiAgICAgICAgfSksXG4gICAgICApXG4gICAgICAuc3Vic2NyaWJlKGV2ZW50ID0+IHtcbiAgICAgICAgLy8gRW1pdCBsaWZlY3ljbGUgZXZlbnRzIGJhc2VkIG9uIGFuaW1hdGlvbiBgZG9uZWAgY2FsbGJhY2suXG4gICAgICAgIGlmIChldmVudC50b1N0YXRlID09PSAnZW50ZXInKSB7XG4gICAgICAgICAgdGhpcy5fYXV0b0ZvY3VzKCk7XG4gICAgICAgICAgdGhpcy5fYWZ0ZXJFbnRlci5uZXh0KCk7XG4gICAgICAgICAgdGhpcy5fYWZ0ZXJFbnRlci5jb21wbGV0ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGV2ZW50LmZyb21TdGF0ZSA9PT0gJ2VudGVyJyAmJiAoZXZlbnQudG9TdGF0ZSA9PT0gJ3ZvaWQnIHx8IGV2ZW50LnRvU3RhdGUgPT09ICdleGl0JykpIHtcbiAgICAgICAgICB0aGlzLl9yZXR1cm5Gb2N1c0FmdGVyRGlhbG9nKCk7XG4gICAgICAgICAgdGhpcy5fYWZ0ZXJFeGl0Lm5leHQoKTtcbiAgICAgICAgICB0aGlzLl9hZnRlckV4aXQuY29tcGxldGUoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gIH1cblxuICAvKiogSW5pdGlhbGl6ZXMgdGhlIGRpYWxvZyBjb250YWluZXIgd2l0aCB0aGUgYXR0YWNoZWQgY29udGVudC4gKi9cbiAgX2luaXRpYWxpemVXaXRoQXR0YWNoZWRDb250ZW50KCkge1xuICAgIC8vIFNhdmUgdGhlIHByZXZpb3VzbHkgZm9jdXNlZCBlbGVtZW50LiBUaGlzIGVsZW1lbnQgd2lsbCBiZSByZS1mb2N1c2VkXG4gICAgLy8gd2hlbiB0aGUgZGlhbG9nIGNsb3Nlcy5cbiAgICB0aGlzLl9zYXZlUHJldmlvdXNseUZvY3VzZWRFbGVtZW50KCk7XG4gICAgLy8gTW92ZSBmb2N1cyBvbnRvIHRoZSBkaWFsb2cgaW1tZWRpYXRlbHkgaW4gb3JkZXIgdG8gcHJldmVudCB0aGUgdXNlclxuICAgIC8vIGZyb20gYWNjaWRlbnRhbGx5IG9wZW5pbmcgbXVsdGlwbGUgZGlhbG9ncyBhdCB0aGUgc2FtZSB0aW1lLlxuICAgIHRoaXMuX2ZvY3VzRGlhbG9nQ29udGFpbmVyKCk7XG4gIH1cblxuICAvKiogRGVzdHJveSBmb2N1cyB0cmFwIHRvIHBsYWNlIGZvY3VzIGJhY2sgdG8gdGhlIGVsZW1lbnQgZm9jdXNlZCBiZWZvcmUgdGhlIGRpYWxvZyBvcGVuZWQuICovXG4gIG5nT25EZXN0cm95KCkge1xuICAgIHRoaXMuX2ZvY3VzVHJhcC5kZXN0cm95KCk7XG4gICAgdGhpcy5fYW5pbWF0aW9uRG9uZS5jb21wbGV0ZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEF0dGFjaCBhIENvbXBvbmVudFBvcnRhbCBhcyBjb250ZW50IHRvIHRoaXMgZGlhbG9nIGNvbnRhaW5lci5cbiAgICogQHBhcmFtIHBvcnRhbCBQb3J0YWwgdG8gYmUgYXR0YWNoZWQgYXMgdGhlIGRpYWxvZyBjb250ZW50LlxuICAgKi9cbiAgYXR0YWNoQ29tcG9uZW50UG9ydGFsPFQ+KHBvcnRhbDogQ29tcG9uZW50UG9ydGFsPFQ+KTogQ29tcG9uZW50UmVmPFQ+IHtcbiAgICBpZiAodGhpcy5fcG9ydGFsSG9zdC5oYXNBdHRhY2hlZCgpICYmICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpKSB7XG4gICAgICB0aHJvd0RpYWxvZ0NvbnRlbnRBbHJlYWR5QXR0YWNoZWRFcnJvcigpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9wb3J0YWxIb3N0LmF0dGFjaENvbXBvbmVudFBvcnRhbChwb3J0YWwpO1xuICB9XG5cbiAgLyoqXG4gICAqIEF0dGFjaCBhIFRlbXBsYXRlUG9ydGFsIGFzIGNvbnRlbnQgdG8gdGhpcyBkaWFsb2cgY29udGFpbmVyLlxuICAgKiBAcGFyYW0gcG9ydGFsIFBvcnRhbCB0byBiZSBhdHRhY2hlZCBhcyB0aGUgZGlhbG9nIGNvbnRlbnQuXG4gICAqL1xuICBhdHRhY2hUZW1wbGF0ZVBvcnRhbDxDPihwb3J0YWw6IFRlbXBsYXRlUG9ydGFsPEM+KTogRW1iZWRkZWRWaWV3UmVmPEM+IHtcbiAgICBpZiAodGhpcy5fcG9ydGFsSG9zdC5oYXNBdHRhY2hlZCgpICYmICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpKSB7XG4gICAgICB0aHJvd0RpYWxvZ0NvbnRlbnRBbHJlYWR5QXR0YWNoZWRFcnJvcigpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9wb3J0YWxIb3N0LmF0dGFjaFRlbXBsYXRlUG9ydGFsKHBvcnRhbCk7XG4gIH1cblxuICAvKipcbiAgICogQXR0YWNoZXMgYSBET00gcG9ydGFsIHRvIHRoZSBkaWFsb2cgY29udGFpbmVyLlxuICAgKiBAcGFyYW0gcG9ydGFsIFBvcnRhbCB0byBiZSBhdHRhY2hlZC5cbiAgICogQGRlcHJlY2F0ZWQgVG8gYmUgdHVybmVkIGludG8gYSBtZXRob2QuXG4gICAqIEBicmVha2luZy1jaGFuZ2UgMTAuMC4wXG4gICAqL1xuICBvdmVycmlkZSBhdHRhY2hEb21Qb3J0YWwgPSAocG9ydGFsOiBEb21Qb3J0YWwpID0+IHtcbiAgICBpZiAodGhpcy5fcG9ydGFsSG9zdC5oYXNBdHRhY2hlZCgpICYmICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpKSB7XG4gICAgICB0aHJvd0RpYWxvZ0NvbnRlbnRBbHJlYWR5QXR0YWNoZWRFcnJvcigpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9wb3J0YWxIb3N0LmF0dGFjaERvbVBvcnRhbChwb3J0YWwpO1xuICB9O1xuXG4gIC8qKiBFbWl0IGxpZmVjeWNsZSBldmVudHMgYmFzZWQgb24gYW5pbWF0aW9uIGBzdGFydGAgY2FsbGJhY2suICovXG4gIF9vbkFuaW1hdGlvblN0YXJ0KGV2ZW50OiBBbmltYXRpb25FdmVudCkge1xuICAgIGlmIChldmVudC50b1N0YXRlID09PSAnZW50ZXInKSB7XG4gICAgICB0aGlzLl9iZWZvcmVFbnRlci5uZXh0KCk7XG4gICAgICB0aGlzLl9iZWZvcmVFbnRlci5jb21wbGV0ZSgpO1xuICAgIH1cbiAgICBpZiAoZXZlbnQuZnJvbVN0YXRlID09PSAnZW50ZXInICYmIChldmVudC50b1N0YXRlID09PSAndm9pZCcgfHwgZXZlbnQudG9TdGF0ZSA9PT0gJ2V4aXQnKSkge1xuICAgICAgdGhpcy5fYmVmb3JlRXhpdC5uZXh0KCk7XG4gICAgICB0aGlzLl9iZWZvcmVFeGl0LmNvbXBsZXRlKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFN0YXJ0cyB0aGUgZGlhbG9nIGV4aXQgYW5pbWF0aW9uLiAqL1xuICBfc3RhcnRFeGl0aW5nKCk6IHZvaWQge1xuICAgIHRoaXMuX3N0YXRlID0gJ2V4aXQnO1xuXG4gICAgLy8gTWFyayB0aGUgY29udGFpbmVyIGZvciBjaGVjayBzbyBpdCBjYW4gcmVhY3QgaWYgdGhlXG4gICAgLy8gdmlldyBjb250YWluZXIgaXMgdXNpbmcgT25QdXNoIGNoYW5nZSBkZXRlY3Rpb24uXG4gICAgdGhpcy5fY2hhbmdlRGV0ZWN0b3JSZWYubWFya0ZvckNoZWNrKCk7XG4gIH1cblxuICAvKiogU2F2ZXMgYSByZWZlcmVuY2UgdG8gdGhlIGVsZW1lbnQgdGhhdCB3YXMgZm9jdXNlZCBiZWZvcmUgdGhlIGRpYWxvZyB3YXMgb3BlbmVkLiAqL1xuICBwcml2YXRlIF9zYXZlUHJldmlvdXNseUZvY3VzZWRFbGVtZW50KCkge1xuICAgIGlmICh0aGlzLl9kb2N1bWVudCkge1xuICAgICAgdGhpcy5fZWxlbWVudEZvY3VzZWRCZWZvcmVEaWFsb2dXYXNPcGVuZWQgPSBfZ2V0Rm9jdXNlZEVsZW1lbnRQaWVyY2VTaGFkb3dEb20oKTtcbiAgICB9XG4gIH1cblxuICAvKiogRm9jdXNlcyB0aGUgZGlhbG9nIGNvbnRhaW5lci4gKi9cbiAgcHJpdmF0ZSBfZm9jdXNEaWFsb2dDb250YWluZXIoKSB7XG4gICAgLy8gTm90ZSB0aGF0IHRoZXJlIGlzIG5vIGZvY3VzIG1ldGhvZCB3aGVuIHJlbmRlcmluZyBvbiB0aGUgc2VydmVyLlxuICAgIGlmICh0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQuZm9jdXMpIHtcbiAgICAgIHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5mb2N1cygpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBGb2N1c2VzIHRoZSBwcm92aWRlZCBlbGVtZW50LiBJZiB0aGUgZWxlbWVudCBpcyBub3QgZm9jdXNhYmxlLCBpdCB3aWxsIGFkZCBhIHRhYkluZGV4XG4gICAqIGF0dHJpYnV0ZSB0byBmb3JjZWZ1bGx5IGZvY3VzIGl0LiBUaGUgYXR0cmlidXRlIGlzIHJlbW92ZWQgYWZ0ZXIgZm9jdXMgaXMgbW92ZWQuXG4gICAqIEBwYXJhbSBlbGVtZW50IFRoZSBlbGVtZW50IHRvIGZvY3VzLlxuICAgKi9cbiAgcHJpdmF0ZSBfZm9yY2VGb2N1cyhlbGVtZW50OiBIVE1MRWxlbWVudCwgb3B0aW9ucz86IEZvY3VzT3B0aW9ucykge1xuICAgIGlmICghdGhpcy5faW50ZXJhY3Rpdml0eUNoZWNrZXIuaXNGb2N1c2FibGUoZWxlbWVudCkpIHtcbiAgICAgIGVsZW1lbnQudGFiSW5kZXggPSAtMTtcbiAgICAgIC8vIFRoZSB0YWJpbmRleCBhdHRyaWJ1dGUgc2hvdWxkIGJlIHJlbW92ZWQgdG8gYXZvaWQgbmF2aWdhdGluZyB0byB0aGF0IGVsZW1lbnQgYWdhaW5cbiAgICAgIHRoaXMuX25nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignYmx1cicsICgpID0+IGVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKCd0YWJpbmRleCcpKTtcbiAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCAoKSA9PiBlbGVtZW50LnJlbW92ZUF0dHJpYnV0ZSgndGFiaW5kZXgnKSk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgZWxlbWVudC5mb2N1cyhvcHRpb25zKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGb2N1c2VzIHRoZSBmaXJzdCBlbGVtZW50IHRoYXQgbWF0Y2hlcyB0aGUgZ2l2ZW4gc2VsZWN0b3Igd2l0aGluIHRoZSBmb2N1cyB0cmFwLlxuICAgKiBAcGFyYW0gc2VsZWN0b3IgVGhlIENTUyBzZWxlY3RvciBmb3IgdGhlIGVsZW1lbnQgdG8gc2V0IGZvY3VzIHRvLlxuICAgKi9cbiAgcHJpdmF0ZSBfZm9jdXNCeUNzc1NlbGVjdG9yKHNlbGVjdG9yOiBzdHJpbmcsIG9wdGlvbnM/OiBGb2N1c09wdGlvbnMpIHtcbiAgICBsZXQgZWxlbWVudFRvRm9jdXMgPSB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQucXVlcnlTZWxlY3RvcihcbiAgICAgIHNlbGVjdG9yLFxuICAgICkgYXMgSFRNTEVsZW1lbnQgfCBudWxsO1xuICAgIGlmIChlbGVtZW50VG9Gb2N1cykge1xuICAgICAgdGhpcy5fZm9yY2VGb2N1cyhlbGVtZW50VG9Gb2N1cywgb3B0aW9ucyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEF1dG9mb2N1cyB0aGUgZWxlbWVudCBzcGVjaWZpZWQgYnkgdGhlIGF1dG9Gb2N1cyBmaWVsZC4gV2hlbiBhdXRvRm9jdXMgaXMgbm90ICdkaWFsb2cnLCBpZlxuICAgKiBmb3Igc29tZSByZWFzb24gdGhlIGVsZW1lbnQgY2Fubm90IGJlIGZvY3VzZWQsIHRoZSBkaWFsb2cgY29udGFpbmVyIHdpbGwgYmUgZm9jdXNlZC5cbiAgICovXG4gIHByaXZhdGUgX2F1dG9Gb2N1cygpIHtcbiAgICBjb25zdCBlbGVtZW50ID0gdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50O1xuXG4gICAgLy8gSWYgd2VyZSB0byBhdHRlbXB0IHRvIGZvY3VzIGltbWVkaWF0ZWx5LCB0aGVuIHRoZSBjb250ZW50IG9mIHRoZSBkaWFsb2cgd291bGQgbm90IHlldCBiZVxuICAgIC8vIHJlYWR5IGluIGluc3RhbmNlcyB3aGVyZSBjaGFuZ2UgZGV0ZWN0aW9uIGhhcyB0byBydW4gZmlyc3QuIFRvIGRlYWwgd2l0aCB0aGlzLCB3ZSBzaW1wbHlcbiAgICAvLyB3YWl0IGZvciB0aGUgbWljcm90YXNrIHF1ZXVlIHRvIGJlIGVtcHR5IHdoZW4gc2V0dGluZyBmb2N1cyB3aGVuIGF1dG9Gb2N1cyBpc24ndCBzZXQgdG9cbiAgICAvLyBkaWFsb2cuIElmIHRoZSBlbGVtZW50IGluc2lkZSB0aGUgZGlhbG9nIGNhbid0IGJlIGZvY3VzZWQsIHRoZW4gdGhlIGNvbnRhaW5lciBpcyBmb2N1c2VkXG4gICAgLy8gc28gdGhlIHVzZXIgY2FuJ3QgdGFiIGludG8gb3RoZXIgZWxlbWVudHMgYmVoaW5kIGl0LlxuICAgIHN3aXRjaCAodGhpcy5fY29uZmlnLmF1dG9Gb2N1cykge1xuICAgICAgY2FzZSBmYWxzZTpcbiAgICAgIGNhc2UgJ2RpYWxvZyc6XG4gICAgICAgIGNvbnN0IGFjdGl2ZUVsZW1lbnQgPSBfZ2V0Rm9jdXNlZEVsZW1lbnRQaWVyY2VTaGFkb3dEb20oKTtcbiAgICAgICAgLy8gRW5zdXJlIHRoYXQgZm9jdXMgaXMgb24gdGhlIGRpYWxvZyBjb250YWluZXIuIEl0J3MgcG9zc2libGUgdGhhdCBhIGRpZmZlcmVudFxuICAgICAgICAvLyBjb21wb25lbnQgdHJpZWQgdG8gbW92ZSBmb2N1cyB3aGlsZSB0aGUgb3BlbiBhbmltYXRpb24gd2FzIHJ1bm5pbmcuIFNlZTpcbiAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvY29tcG9uZW50cy9pc3N1ZXMvMTYyMTUuIE5vdGUgdGhhdCB3ZSBvbmx5IHdhbnQgdG8gZG8gdGhpc1xuICAgICAgICAvLyBpZiB0aGUgZm9jdXMgaXNuJ3QgaW5zaWRlIHRoZSBkaWFsb2cgYWxyZWFkeSwgYmVjYXVzZSBpdCdzIHBvc3NpYmxlIHRoYXQgdGhlIGNvbnN1bWVyXG4gICAgICAgIC8vIHR1cm5lZCBvZmYgYGF1dG9Gb2N1c2AgaW4gb3JkZXIgdG8gbW92ZSBmb2N1cyB0aGVtc2VsdmVzLlxuICAgICAgICBpZiAoYWN0aXZlRWxlbWVudCAhPT0gZWxlbWVudCAmJiAhZWxlbWVudC5jb250YWlucyhhY3RpdmVFbGVtZW50KSkge1xuICAgICAgICAgIGVsZW1lbnQuZm9jdXMoKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgdHJ1ZTpcbiAgICAgIGNhc2UgJ2ZpcnN0LXRhYmJhYmxlJzpcbiAgICAgICAgdGhpcy5fZm9jdXNUcmFwLmZvY3VzSW5pdGlhbEVsZW1lbnRXaGVuUmVhZHkoKS50aGVuKGhhc01vdmVkRm9jdXMgPT4ge1xuICAgICAgICAgIGlmICghaGFzTW92ZWRGb2N1cykge1xuICAgICAgICAgICAgZWxlbWVudC5mb2N1cygpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnZmlyc3QtaGVhZGluZyc6XG4gICAgICAgIHRoaXMuX2ZvY3VzQnlDc3NTZWxlY3RvcignaDEsIGgyLCBoMywgaDQsIGg1LCBoNiwgW3JvbGU9XCJoZWFkaW5nXCJdJyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhpcy5fZm9jdXNCeUNzc1NlbGVjdG9yKHRoaXMuX2NvbmZpZy5hdXRvRm9jdXMhKTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgLyoqIFJldHVybnMgdGhlIGZvY3VzIHRvIHRoZSBlbGVtZW50IGZvY3VzZWQgYmVmb3JlIHRoZSBkaWFsb2cgd2FzIG9wZW4uICovXG4gIHByaXZhdGUgX3JldHVybkZvY3VzQWZ0ZXJEaWFsb2coKSB7XG4gICAgY29uc3QgdG9Gb2N1cyA9IHRoaXMuX2VsZW1lbnRGb2N1c2VkQmVmb3JlRGlhbG9nV2FzT3BlbmVkO1xuICAgIC8vIFdlIG5lZWQgdGhlIGV4dHJhIGNoZWNrLCBiZWNhdXNlIElFIGNhbiBzZXQgdGhlIGBhY3RpdmVFbGVtZW50YCB0byBudWxsIGluIHNvbWUgY2FzZXMuXG4gICAgaWYgKHRvRm9jdXMgJiYgdHlwZW9mIHRvRm9jdXMuZm9jdXMgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGNvbnN0IGFjdGl2ZUVsZW1lbnQgPSBfZ2V0Rm9jdXNlZEVsZW1lbnRQaWVyY2VTaGFkb3dEb20oKTtcbiAgICAgIGNvbnN0IGVsZW1lbnQgPSB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQ7XG5cbiAgICAgIC8vIE1ha2Ugc3VyZSB0aGF0IGZvY3VzIGlzIHN0aWxsIGluc2lkZSB0aGUgZGlhbG9nIG9yIGlzIG9uIHRoZSBib2R5ICh1c3VhbGx5IGJlY2F1c2UgYVxuICAgICAgLy8gbm9uLWZvY3VzYWJsZSBlbGVtZW50IGxpa2UgdGhlIGJhY2tkcm9wIHdhcyBjbGlja2VkKSBiZWZvcmUgbW92aW5nIGl0LiBJdCdzIHBvc3NpYmxlIHRoYXRcbiAgICAgIC8vIHRoZSBjb25zdW1lciBtb3ZlZCBpdCB0aGVtc2VsdmVzIGJlZm9yZSB0aGUgYW5pbWF0aW9uIHdhcyBkb25lLCBpbiB3aGljaCBjYXNlIHdlIHNob3VsZG4ndFxuICAgICAgLy8gZG8gYW55dGhpbmcuXG4gICAgICBpZiAoXG4gICAgICAgICFhY3RpdmVFbGVtZW50IHx8XG4gICAgICAgIGFjdGl2ZUVsZW1lbnQgPT09IHRoaXMuX2RvY3VtZW50LmJvZHkgfHxcbiAgICAgICAgYWN0aXZlRWxlbWVudCA9PT0gZWxlbWVudCB8fFxuICAgICAgICBlbGVtZW50LmNvbnRhaW5zKGFjdGl2ZUVsZW1lbnQpXG4gICAgICApIHtcbiAgICAgICAgdG9Gb2N1cy5mb2N1cygpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIiwiPG5nLXRlbXBsYXRlIGNka1BvcnRhbE91dGxldD48L25nLXRlbXBsYXRlPlxuIl19