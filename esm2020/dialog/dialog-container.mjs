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
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostBinding, Inject, NgZone, Optional, ViewChild, ViewEncapsulation, } from '@angular/core';
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
        this._ariaModal = true;
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
    // @HostBinding is used in the class as it is expected to be extended. Since @Component decorator
    // metadata is not inherited by child classes, instead the host binding data is defined in a way
    // that can be inherited.
    // tslint:disable:no-host-decorator-in-concrete no-private-getters
    get _ariaLabel() {
        return this._config.ariaLabel || null;
    }
    get _ariaDescribedBy() {
        return this._config.ariaDescribedBy;
    }
    get _role() {
        return this._config.role;
    }
    get _tabindex() {
        return -1;
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
CdkDialogContainer.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.0-next.15", ngImport: i0, type: CdkDialogContainer, deps: [{ token: i0.ElementRef }, { token: i1.FocusTrapFactory }, { token: i0.ChangeDetectorRef }, { token: i1.InteractivityChecker }, { token: i0.NgZone }, { token: DOCUMENT, optional: true }, { token: i2.DialogConfig }], target: i0.ɵɵFactoryTarget.Component });
CdkDialogContainer.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "12.0.0", version: "13.0.0-next.15", type: CdkDialogContainer, selector: "cdk-dialog-container", host: { listeners: { "@dialog.start": "_onAnimationStart($event)", "@dialog.done": "_animationDone.next($event)" }, properties: { "@dialog": "{\n      value: _state,\n      params: {\n        enterAnimationDuration: _config.enterAnimationDuration,\n        exitAnimationDuration: _config.exitAnimationDuration\n      }\n    }", "attr.aria-label": "this._ariaLabel", "attr.aria-describedby": "this._ariaDescribedBy", "attr.role": "this._role", "attr.aria-modal": "this._ariaModal", "attr.tabindex": "this._tabindex" } }, viewQueries: [{ propertyName: "_portalHost", first: true, predicate: CdkPortalOutlet, descendants: true, static: true }], usesInheritance: true, ngImport: i0, template: "<ng-template cdkPortalOutlet></ng-template>\n", styles: ["cdk-dialog-container{background:#fff;border-radius:5px;display:block;padding:10px}\n"], directives: [{ type: i3.CdkPortalOutlet, selector: "[cdkPortalOutlet]", inputs: ["cdkPortalOutlet"], outputs: ["attached"], exportAs: ["cdkPortalOutlet"] }], animations: [
        trigger('dialog', [
            state('enter', style({ opacity: 1 })),
            state('exit, void', style({ opacity: 0 })),
            transition('* => enter', animate('{{enterAnimationDuration}}')),
            transition('* => exit, * => void', animate('{{exitAnimationDuration}}')),
        ]),
    ], changeDetection: i0.ChangeDetectionStrategy.Default, encapsulation: i0.ViewEncapsulation.None });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.0-next.15", ngImport: i0, type: CdkDialogContainer, decorators: [{
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
                    }, template: "<ng-template cdkPortalOutlet></ng-template>\n", styles: ["cdk-dialog-container{background:#fff;border-radius:5px;display:block;padding:10px}\n"] }]
        }], ctorParameters: function () { return [{ type: i0.ElementRef }, { type: i1.FocusTrapFactory }, { type: i0.ChangeDetectorRef }, { type: i1.InteractivityChecker }, { type: i0.NgZone }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [DOCUMENT]
                }] }, { type: i2.DialogConfig }]; }, propDecorators: { _ariaLabel: [{
                type: HostBinding,
                args: ['attr.aria-label']
            }], _ariaDescribedBy: [{
                type: HostBinding,
                args: ['attr.aria-describedby']
            }], _role: [{
                type: HostBinding,
                args: ['attr.role']
            }], _ariaModal: [{
                type: HostBinding,
                args: ['attr.aria-modal']
            }], _tabindex: [{
                type: HostBinding,
                args: ['attr.tabindex']
            }], _portalHost: [{
                type: ViewChild,
                args: [CdkPortalOutlet, { static: true }]
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhbG9nLWNvbnRhaW5lci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL2RpYWxvZy9kaWFsb2ctY29udGFpbmVyLnRzIiwiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvZGlhbG9nL2RpYWxvZy1jb250YWluZXIuaHRtbCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsT0FBTyxFQUFrQixLQUFLLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxPQUFPLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUMvRixPQUFPLEVBQUMsZ0JBQWdCLEVBQUUsb0JBQW9CLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUN6RSxPQUFPLEVBQUMsaUNBQWlDLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUN4RSxPQUFPLEVBQ0wsZ0JBQWdCLEVBQ2hCLGVBQWUsR0FJaEIsTUFBTSxxQkFBcUIsQ0FBQztBQUM3QixPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDekMsT0FBTyxFQUNMLHVCQUF1QixFQUN2QixpQkFBaUIsRUFDakIsU0FBUyxFQUVULFVBQVUsRUFFVixXQUFXLEVBQ1gsTUFBTSxFQUNOLE1BQU0sRUFFTixRQUFRLEVBQ1IsU0FBUyxFQUNULGlCQUFpQixHQUNsQixNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQzdCLE9BQU8sRUFBQyxvQkFBb0IsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQ3BELE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQzs7Ozs7QUFFN0MsTUFBTSxVQUFVLHNDQUFzQztJQUNwRCxNQUFNLEtBQUssQ0FBQyx1RUFBdUUsQ0FBQyxDQUFDO0FBQ3ZGLENBQUM7QUFFRDs7O0dBR0c7QUE2QkgsTUFBTSxP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O3dCQUNKLFdBQVcsRUFBRTs7Ozs7O01BTVg7d0JBQ0YsaUJBQWlCLEVBQUUsMkJBQTJCO3dCQUM5QyxnQkFBZ0IsRUFBRSw2QkFBNkI7cUJBQ2hEOzswQkE4REUsUUFBUTs7MEJBQUksTUFBTTsyQkFBQyxRQUFRO3VFQTVDTSxVQUFVO3NCQUE3QyxXQUFXO3VCQUFDLGlCQUFpQjtnQkFLMUIsZ0JBQWdCO3NCQURuQixXQUFXO3VCQUFDLHVCQUF1QjtnQkFLTixLQUFLO3NCQUFsQyxXQUFXO3VCQUFDLFdBQVc7Z0JBSVEsVUFBVTtzQkFBekMsV0FBVzt1QkFBQyxpQkFBaUI7Z0JBRUksU0FBUztzQkFBMUMsV0FBVzt1QkFBQyxlQUFlO2dCQU1nQixXQUFXO3NCQUF0RCxTQUFTO3VCQUFDLGVBQWUsRUFBRSxFQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHthbmltYXRlLCBBbmltYXRpb25FdmVudCwgc3RhdGUsIHN0eWxlLCB0cmFuc2l0aW9uLCB0cmlnZ2VyfSBmcm9tICdAYW5ndWxhci9hbmltYXRpb25zJztcbmltcG9ydCB7Rm9jdXNUcmFwRmFjdG9yeSwgSW50ZXJhY3Rpdml0eUNoZWNrZXJ9IGZyb20gJ0Bhbmd1bGFyL2Nkay9hMTF5JztcbmltcG9ydCB7X2dldEZvY3VzZWRFbGVtZW50UGllcmNlU2hhZG93RG9tfSBmcm9tICdAYW5ndWxhci9jZGsvcGxhdGZvcm0nO1xuaW1wb3J0IHtcbiAgQmFzZVBvcnRhbE91dGxldCxcbiAgQ2RrUG9ydGFsT3V0bGV0LFxuICBDb21wb25lbnRQb3J0YWwsXG4gIERvbVBvcnRhbCxcbiAgVGVtcGxhdGVQb3J0YWwsXG59IGZyb20gJ0Bhbmd1bGFyL2Nkay9wb3J0YWwnO1xuaW1wb3J0IHtET0NVTUVOVH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7XG4gIENoYW5nZURldGVjdGlvblN0cmF0ZWd5LFxuICBDaGFuZ2VEZXRlY3RvclJlZixcbiAgQ29tcG9uZW50LFxuICBDb21wb25lbnRSZWYsXG4gIEVsZW1lbnRSZWYsXG4gIEVtYmVkZGVkVmlld1JlZixcbiAgSG9zdEJpbmRpbmcsXG4gIEluamVjdCxcbiAgTmdab25lLFxuICBPbkRlc3Ryb3ksXG4gIE9wdGlvbmFsLFxuICBWaWV3Q2hpbGQsXG4gIFZpZXdFbmNhcHN1bGF0aW9uLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7U3ViamVjdH0gZnJvbSAncnhqcyc7XG5pbXBvcnQge2Rpc3RpbmN0VW50aWxDaGFuZ2VkfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5pbXBvcnQge0RpYWxvZ0NvbmZpZ30gZnJvbSAnLi9kaWFsb2ctY29uZmlnJztcblxuZXhwb3J0IGZ1bmN0aW9uIHRocm93RGlhbG9nQ29udGVudEFscmVhZHlBdHRhY2hlZEVycm9yKCkge1xuICB0aHJvdyBFcnJvcignQXR0ZW1wdGluZyB0byBhdHRhY2ggZGlhbG9nIGNvbnRlbnQgYWZ0ZXIgY29udGVudCBpcyBhbHJlYWR5IGF0dGFjaGVkJyk7XG59XG5cbi8qKlxuICogSW50ZXJuYWwgY29tcG9uZW50IHRoYXQgd3JhcHMgdXNlci1wcm92aWRlZCBkaWFsb2cgY29udGVudC5cbiAqIEBkb2NzLXByaXZhdGVcbiAqL1xuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnY2RrLWRpYWxvZy1jb250YWluZXInLFxuICB0ZW1wbGF0ZVVybDogJy4vZGlhbG9nLWNvbnRhaW5lci5odG1sJyxcbiAgc3R5bGVVcmxzOiBbJ2RpYWxvZy1jb250YWluZXIuY3NzJ10sXG4gIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmUsXG4gIC8vIFVzaW5nIE9uUHVzaCBmb3IgZGlhbG9ncyBjYXVzZWQgc29tZSBHMyBzeW5jIGlzc3Vlcy4gRGlzYWJsZWQgdW50aWwgd2UgY2FuIHRyYWNrIHRoZW0gZG93bi5cbiAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOnZhbGlkYXRlLWRlY29yYXRvcnNcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5EZWZhdWx0LFxuICBhbmltYXRpb25zOiBbXG4gICAgdHJpZ2dlcignZGlhbG9nJywgW1xuICAgICAgc3RhdGUoJ2VudGVyJywgc3R5bGUoe29wYWNpdHk6IDF9KSksXG4gICAgICBzdGF0ZSgnZXhpdCwgdm9pZCcsIHN0eWxlKHtvcGFjaXR5OiAwfSkpLFxuICAgICAgdHJhbnNpdGlvbignKiA9PiBlbnRlcicsIGFuaW1hdGUoJ3t7ZW50ZXJBbmltYXRpb25EdXJhdGlvbn19JykpLFxuICAgICAgdHJhbnNpdGlvbignKiA9PiBleGl0LCAqID0+IHZvaWQnLCBhbmltYXRlKCd7e2V4aXRBbmltYXRpb25EdXJhdGlvbn19JykpLFxuICAgIF0pLFxuICBdLFxuICBob3N0OiB7XG4gICAgJ1tAZGlhbG9nXSc6IGB7XG4gICAgICB2YWx1ZTogX3N0YXRlLFxuICAgICAgcGFyYW1zOiB7XG4gICAgICAgIGVudGVyQW5pbWF0aW9uRHVyYXRpb246IF9jb25maWcuZW50ZXJBbmltYXRpb25EdXJhdGlvbixcbiAgICAgICAgZXhpdEFuaW1hdGlvbkR1cmF0aW9uOiBfY29uZmlnLmV4aXRBbmltYXRpb25EdXJhdGlvblxuICAgICAgfVxuICAgIH1gLFxuICAgICcoQGRpYWxvZy5zdGFydCknOiAnX29uQW5pbWF0aW9uU3RhcnQoJGV2ZW50KScsXG4gICAgJyhAZGlhbG9nLmRvbmUpJzogJ19hbmltYXRpb25Eb25lLm5leHQoJGV2ZW50KScsXG4gIH0sXG59KVxuZXhwb3J0IGNsYXNzIENka0RpYWxvZ0NvbnRhaW5lciBleHRlbmRzIEJhc2VQb3J0YWxPdXRsZXQgaW1wbGVtZW50cyBPbkRlc3Ryb3kge1xuICBwcml2YXRlIHJlYWRvbmx5IF9kb2N1bWVudDogRG9jdW1lbnQ7XG5cbiAgLyoqIFN0YXRlIG9mIHRoZSBkaWFsb2cgYW5pbWF0aW9uLiAqL1xuICBfc3RhdGU6ICd2b2lkJyB8ICdlbnRlcicgfCAnZXhpdCcgPSAnZW50ZXInO1xuXG4gIC8qKiBFbGVtZW50IHRoYXQgd2FzIGZvY3VzZWQgYmVmb3JlIHRoZSBkaWFsb2cgd2FzIG9wZW5lZC4gU2F2ZSB0aGlzIHRvIHJlc3RvcmUgdXBvbiBjbG9zZS4gKi9cbiAgcHJpdmF0ZSBfZWxlbWVudEZvY3VzZWRCZWZvcmVEaWFsb2dXYXNPcGVuZWQ6IEhUTUxFbGVtZW50IHwgbnVsbCA9IG51bGw7XG5cbiAgLyoqIFRoZSBjbGFzcyB0aGF0IHRyYXBzIGFuZCBtYW5hZ2VzIGZvY3VzIHdpdGhpbiB0aGUgZGlhbG9nLiAqL1xuICBwcml2YXRlIF9mb2N1c1RyYXAgPSB0aGlzLl9mb2N1c1RyYXBGYWN0b3J5LmNyZWF0ZSh0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQpO1xuXG4gIC8vIEBIb3N0QmluZGluZyBpcyB1c2VkIGluIHRoZSBjbGFzcyBhcyBpdCBpcyBleHBlY3RlZCB0byBiZSBleHRlbmRlZC4gU2luY2UgQENvbXBvbmVudCBkZWNvcmF0b3JcbiAgLy8gbWV0YWRhdGEgaXMgbm90IGluaGVyaXRlZCBieSBjaGlsZCBjbGFzc2VzLCBpbnN0ZWFkIHRoZSBob3N0IGJpbmRpbmcgZGF0YSBpcyBkZWZpbmVkIGluIGEgd2F5XG4gIC8vIHRoYXQgY2FuIGJlIGluaGVyaXRlZC5cbiAgLy8gdHNsaW50OmRpc2FibGU6bm8taG9zdC1kZWNvcmF0b3ItaW4tY29uY3JldGUgbm8tcHJpdmF0ZS1nZXR0ZXJzXG4gIEBIb3N0QmluZGluZygnYXR0ci5hcmlhLWxhYmVsJykgZ2V0IF9hcmlhTGFiZWwoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2NvbmZpZy5hcmlhTGFiZWwgfHwgbnVsbDtcbiAgfVxuXG4gIEBIb3N0QmluZGluZygnYXR0ci5hcmlhLWRlc2NyaWJlZGJ5JylcbiAgZ2V0IF9hcmlhRGVzY3JpYmVkQnkoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2NvbmZpZy5hcmlhRGVzY3JpYmVkQnk7XG4gIH1cblxuICBASG9zdEJpbmRpbmcoJ2F0dHIucm9sZScpIGdldCBfcm9sZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fY29uZmlnLnJvbGU7XG4gIH1cblxuICBASG9zdEJpbmRpbmcoJ2F0dHIuYXJpYS1tb2RhbCcpIF9hcmlhTW9kYWw6IGJvb2xlYW4gPSB0cnVlO1xuXG4gIEBIb3N0QmluZGluZygnYXR0ci50YWJpbmRleCcpIGdldCBfdGFiaW5kZXgoKSB7XG4gICAgcmV0dXJuIC0xO1xuICB9XG4gIC8vIHRzbGludDpkaXNhYmxlOm5vLWhvc3QtZGVjb3JhdG9yLWluLWNvbmNyZXRlIG5vLXByaXZhdGUtZ2V0dGVyc1xuXG4gIC8qKiBUaGUgcG9ydGFsIGhvc3QgaW5zaWRlIG9mIHRoaXMgY29udGFpbmVyIGludG8gd2hpY2ggdGhlIGRpYWxvZyBjb250ZW50IHdpbGwgYmUgbG9hZGVkLiAqL1xuICBAVmlld0NoaWxkKENka1BvcnRhbE91dGxldCwge3N0YXRpYzogdHJ1ZX0pIF9wb3J0YWxIb3N0OiBDZGtQb3J0YWxPdXRsZXQ7XG5cbiAgLyoqIEEgc3ViamVjdCBlbWl0dGluZyBiZWZvcmUgdGhlIGRpYWxvZyBlbnRlcnMgdGhlIHZpZXcuICovXG4gIHJlYWRvbmx5IF9iZWZvcmVFbnRlciA9IG5ldyBTdWJqZWN0PHZvaWQ+KCk7XG5cbiAgLyoqIEEgc3ViamVjdCBlbWl0dGluZyBhZnRlciB0aGUgZGlhbG9nIGVudGVycyB0aGUgdmlldy4gKi9cbiAgcmVhZG9ubHkgX2FmdGVyRW50ZXIgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xuXG4gIC8qKiBBIHN1YmplY3QgZW1pdHRpbmcgYmVmb3JlIHRoZSBkaWFsb2cgZXhpdHMgdGhlIHZpZXcuICovXG4gIHJlYWRvbmx5IF9iZWZvcmVFeGl0ID0gbmV3IFN1YmplY3Q8dm9pZD4oKTtcblxuICAvKiogQSBzdWJqZWN0IGVtaXR0aW5nIGFmdGVyIHRoZSBkaWFsb2cgZXhpdHMgdGhlIHZpZXcuICovXG4gIHJlYWRvbmx5IF9hZnRlckV4aXQgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xuXG4gIC8qKiBTdHJlYW0gb2YgYW5pbWF0aW9uIGBkb25lYCBldmVudHMuICovXG4gIHJlYWRvbmx5IF9hbmltYXRpb25Eb25lID0gbmV3IFN1YmplY3Q8QW5pbWF0aW9uRXZlbnQ+KCk7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBfZWxlbWVudFJlZjogRWxlbWVudFJlZjxIVE1MRWxlbWVudD4sXG4gICAgcHJpdmF0ZSBfZm9jdXNUcmFwRmFjdG9yeTogRm9jdXNUcmFwRmFjdG9yeSxcbiAgICBwcml2YXRlIF9jaGFuZ2VEZXRlY3RvclJlZjogQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gICAgcHJpdmF0ZSByZWFkb25seSBfaW50ZXJhY3Rpdml0eUNoZWNrZXI6IEludGVyYWN0aXZpdHlDaGVja2VyLFxuICAgIHByaXZhdGUgcmVhZG9ubHkgX25nWm9uZTogTmdab25lLFxuICAgIEBPcHRpb25hbCgpIEBJbmplY3QoRE9DVU1FTlQpIF9kb2N1bWVudDogYW55LFxuICAgIC8qKiBUaGUgZGlhbG9nIGNvbmZpZ3VyYXRpb24uICovXG4gICAgcHVibGljIF9jb25maWc6IERpYWxvZ0NvbmZpZyxcbiAgKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuX2RvY3VtZW50ID0gX2RvY3VtZW50O1xuXG4gICAgLy8gV2UgdXNlIGEgU3ViamVjdCB3aXRoIGEgZGlzdGluY3RVbnRpbENoYW5nZWQsIHJhdGhlciB0aGFuIGEgY2FsbGJhY2sgYXR0YWNoZWQgdG8gLmRvbmUsXG4gICAgLy8gYmVjYXVzZSBzb21lIGJyb3dzZXJzIGZpcmUgdGhlIGRvbmUgZXZlbnQgdHdpY2UgYW5kIHdlIGRvbid0IHdhbnQgdG8gZW1pdCBkdXBsaWNhdGUgZXZlbnRzLlxuICAgIC8vIFNlZTogaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci9pc3N1ZXMvMjQwODRcbiAgICB0aGlzLl9hbmltYXRpb25Eb25lXG4gICAgICAucGlwZShcbiAgICAgICAgZGlzdGluY3RVbnRpbENoYW5nZWQoKHgsIHkpID0+IHtcbiAgICAgICAgICByZXR1cm4geC5mcm9tU3RhdGUgPT09IHkuZnJvbVN0YXRlICYmIHgudG9TdGF0ZSA9PT0geS50b1N0YXRlO1xuICAgICAgICB9KSxcbiAgICAgIClcbiAgICAgIC5zdWJzY3JpYmUoZXZlbnQgPT4ge1xuICAgICAgICAvLyBFbWl0IGxpZmVjeWNsZSBldmVudHMgYmFzZWQgb24gYW5pbWF0aW9uIGBkb25lYCBjYWxsYmFjay5cbiAgICAgICAgaWYgKGV2ZW50LnRvU3RhdGUgPT09ICdlbnRlcicpIHtcbiAgICAgICAgICB0aGlzLl9hdXRvRm9jdXMoKTtcbiAgICAgICAgICB0aGlzLl9hZnRlckVudGVyLm5leHQoKTtcbiAgICAgICAgICB0aGlzLl9hZnRlckVudGVyLmNvbXBsZXRlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZXZlbnQuZnJvbVN0YXRlID09PSAnZW50ZXInICYmIChldmVudC50b1N0YXRlID09PSAndm9pZCcgfHwgZXZlbnQudG9TdGF0ZSA9PT0gJ2V4aXQnKSkge1xuICAgICAgICAgIHRoaXMuX3JldHVybkZvY3VzQWZ0ZXJEaWFsb2coKTtcbiAgICAgICAgICB0aGlzLl9hZnRlckV4aXQubmV4dCgpO1xuICAgICAgICAgIHRoaXMuX2FmdGVyRXhpdC5jb21wbGV0ZSgpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgfVxuXG4gIC8qKiBJbml0aWFsaXplcyB0aGUgZGlhbG9nIGNvbnRhaW5lciB3aXRoIHRoZSBhdHRhY2hlZCBjb250ZW50LiAqL1xuICBfaW5pdGlhbGl6ZVdpdGhBdHRhY2hlZENvbnRlbnQoKSB7XG4gICAgLy8gU2F2ZSB0aGUgcHJldmlvdXNseSBmb2N1c2VkIGVsZW1lbnQuIFRoaXMgZWxlbWVudCB3aWxsIGJlIHJlLWZvY3VzZWRcbiAgICAvLyB3aGVuIHRoZSBkaWFsb2cgY2xvc2VzLlxuICAgIHRoaXMuX3NhdmVQcmV2aW91c2x5Rm9jdXNlZEVsZW1lbnQoKTtcbiAgICAvLyBNb3ZlIGZvY3VzIG9udG8gdGhlIGRpYWxvZyBpbW1lZGlhdGVseSBpbiBvcmRlciB0byBwcmV2ZW50IHRoZSB1c2VyXG4gICAgLy8gZnJvbSBhY2NpZGVudGFsbHkgb3BlbmluZyBtdWx0aXBsZSBkaWFsb2dzIGF0IHRoZSBzYW1lIHRpbWUuXG4gICAgdGhpcy5fZm9jdXNEaWFsb2dDb250YWluZXIoKTtcbiAgfVxuXG4gIC8qKiBEZXN0cm95IGZvY3VzIHRyYXAgdG8gcGxhY2UgZm9jdXMgYmFjayB0byB0aGUgZWxlbWVudCBmb2N1c2VkIGJlZm9yZSB0aGUgZGlhbG9nIG9wZW5lZC4gKi9cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgdGhpcy5fZm9jdXNUcmFwLmRlc3Ryb3koKTtcbiAgICB0aGlzLl9hbmltYXRpb25Eb25lLmNvbXBsZXRlKCk7XG4gIH1cblxuICAvKipcbiAgICogQXR0YWNoIGEgQ29tcG9uZW50UG9ydGFsIGFzIGNvbnRlbnQgdG8gdGhpcyBkaWFsb2cgY29udGFpbmVyLlxuICAgKiBAcGFyYW0gcG9ydGFsIFBvcnRhbCB0byBiZSBhdHRhY2hlZCBhcyB0aGUgZGlhbG9nIGNvbnRlbnQuXG4gICAqL1xuICBhdHRhY2hDb21wb25lbnRQb3J0YWw8VD4ocG9ydGFsOiBDb21wb25lbnRQb3J0YWw8VD4pOiBDb21wb25lbnRSZWY8VD4ge1xuICAgIGlmICh0aGlzLl9wb3J0YWxIb3N0Lmhhc0F0dGFjaGVkKCkgJiYgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkpIHtcbiAgICAgIHRocm93RGlhbG9nQ29udGVudEFscmVhZHlBdHRhY2hlZEVycm9yKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX3BvcnRhbEhvc3QuYXR0YWNoQ29tcG9uZW50UG9ydGFsKHBvcnRhbCk7XG4gIH1cblxuICAvKipcbiAgICogQXR0YWNoIGEgVGVtcGxhdGVQb3J0YWwgYXMgY29udGVudCB0byB0aGlzIGRpYWxvZyBjb250YWluZXIuXG4gICAqIEBwYXJhbSBwb3J0YWwgUG9ydGFsIHRvIGJlIGF0dGFjaGVkIGFzIHRoZSBkaWFsb2cgY29udGVudC5cbiAgICovXG4gIGF0dGFjaFRlbXBsYXRlUG9ydGFsPEM+KHBvcnRhbDogVGVtcGxhdGVQb3J0YWw8Qz4pOiBFbWJlZGRlZFZpZXdSZWY8Qz4ge1xuICAgIGlmICh0aGlzLl9wb3J0YWxIb3N0Lmhhc0F0dGFjaGVkKCkgJiYgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkpIHtcbiAgICAgIHRocm93RGlhbG9nQ29udGVudEFscmVhZHlBdHRhY2hlZEVycm9yKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX3BvcnRhbEhvc3QuYXR0YWNoVGVtcGxhdGVQb3J0YWwocG9ydGFsKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBdHRhY2hlcyBhIERPTSBwb3J0YWwgdG8gdGhlIGRpYWxvZyBjb250YWluZXIuXG4gICAqIEBwYXJhbSBwb3J0YWwgUG9ydGFsIHRvIGJlIGF0dGFjaGVkLlxuICAgKiBAZGVwcmVjYXRlZCBUbyBiZSB0dXJuZWQgaW50byBhIG1ldGhvZC5cbiAgICogQGJyZWFraW5nLWNoYW5nZSAxMC4wLjBcbiAgICovXG4gIG92ZXJyaWRlIGF0dGFjaERvbVBvcnRhbCA9IChwb3J0YWw6IERvbVBvcnRhbCkgPT4ge1xuICAgIGlmICh0aGlzLl9wb3J0YWxIb3N0Lmhhc0F0dGFjaGVkKCkgJiYgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkpIHtcbiAgICAgIHRocm93RGlhbG9nQ29udGVudEFscmVhZHlBdHRhY2hlZEVycm9yKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX3BvcnRhbEhvc3QuYXR0YWNoRG9tUG9ydGFsKHBvcnRhbCk7XG4gIH07XG5cbiAgLyoqIEVtaXQgbGlmZWN5Y2xlIGV2ZW50cyBiYXNlZCBvbiBhbmltYXRpb24gYHN0YXJ0YCBjYWxsYmFjay4gKi9cbiAgX29uQW5pbWF0aW9uU3RhcnQoZXZlbnQ6IEFuaW1hdGlvbkV2ZW50KSB7XG4gICAgaWYgKGV2ZW50LnRvU3RhdGUgPT09ICdlbnRlcicpIHtcbiAgICAgIHRoaXMuX2JlZm9yZUVudGVyLm5leHQoKTtcbiAgICAgIHRoaXMuX2JlZm9yZUVudGVyLmNvbXBsZXRlKCk7XG4gICAgfVxuICAgIGlmIChldmVudC5mcm9tU3RhdGUgPT09ICdlbnRlcicgJiYgKGV2ZW50LnRvU3RhdGUgPT09ICd2b2lkJyB8fCBldmVudC50b1N0YXRlID09PSAnZXhpdCcpKSB7XG4gICAgICB0aGlzLl9iZWZvcmVFeGl0Lm5leHQoKTtcbiAgICAgIHRoaXMuX2JlZm9yZUV4aXQuY29tcGxldGUoKTtcbiAgICB9XG4gIH1cblxuICAvKiogU3RhcnRzIHRoZSBkaWFsb2cgZXhpdCBhbmltYXRpb24uICovXG4gIF9zdGFydEV4aXRpbmcoKTogdm9pZCB7XG4gICAgdGhpcy5fc3RhdGUgPSAnZXhpdCc7XG5cbiAgICAvLyBNYXJrIHRoZSBjb250YWluZXIgZm9yIGNoZWNrIHNvIGl0IGNhbiByZWFjdCBpZiB0aGVcbiAgICAvLyB2aWV3IGNvbnRhaW5lciBpcyB1c2luZyBPblB1c2ggY2hhbmdlIGRldGVjdGlvbi5cbiAgICB0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZi5tYXJrRm9yQ2hlY2soKTtcbiAgfVxuXG4gIC8qKiBTYXZlcyBhIHJlZmVyZW5jZSB0byB0aGUgZWxlbWVudCB0aGF0IHdhcyBmb2N1c2VkIGJlZm9yZSB0aGUgZGlhbG9nIHdhcyBvcGVuZWQuICovXG4gIHByaXZhdGUgX3NhdmVQcmV2aW91c2x5Rm9jdXNlZEVsZW1lbnQoKSB7XG4gICAgaWYgKHRoaXMuX2RvY3VtZW50KSB7XG4gICAgICB0aGlzLl9lbGVtZW50Rm9jdXNlZEJlZm9yZURpYWxvZ1dhc09wZW5lZCA9IF9nZXRGb2N1c2VkRWxlbWVudFBpZXJjZVNoYWRvd0RvbSgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBGb2N1c2VzIHRoZSBkaWFsb2cgY29udGFpbmVyLiAqL1xuICBwcml2YXRlIF9mb2N1c0RpYWxvZ0NvbnRhaW5lcigpIHtcbiAgICAvLyBOb3RlIHRoYXQgdGhlcmUgaXMgbm8gZm9jdXMgbWV0aG9kIHdoZW4gcmVuZGVyaW5nIG9uIHRoZSBzZXJ2ZXIuXG4gICAgaWYgKHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5mb2N1cykge1xuICAgICAgdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LmZvY3VzKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEZvY3VzZXMgdGhlIHByb3ZpZGVkIGVsZW1lbnQuIElmIHRoZSBlbGVtZW50IGlzIG5vdCBmb2N1c2FibGUsIGl0IHdpbGwgYWRkIGEgdGFiSW5kZXhcbiAgICogYXR0cmlidXRlIHRvIGZvcmNlZnVsbHkgZm9jdXMgaXQuIFRoZSBhdHRyaWJ1dGUgaXMgcmVtb3ZlZCBhZnRlciBmb2N1cyBpcyBtb3ZlZC5cbiAgICogQHBhcmFtIGVsZW1lbnQgVGhlIGVsZW1lbnQgdG8gZm9jdXMuXG4gICAqL1xuICBwcml2YXRlIF9mb3JjZUZvY3VzKGVsZW1lbnQ6IEhUTUxFbGVtZW50LCBvcHRpb25zPzogRm9jdXNPcHRpb25zKSB7XG4gICAgaWYgKCF0aGlzLl9pbnRlcmFjdGl2aXR5Q2hlY2tlci5pc0ZvY3VzYWJsZShlbGVtZW50KSkge1xuICAgICAgZWxlbWVudC50YWJJbmRleCA9IC0xO1xuICAgICAgLy8gVGhlIHRhYmluZGV4IGF0dHJpYnV0ZSBzaG91bGQgYmUgcmVtb3ZlZCB0byBhdm9pZCBuYXZpZ2F0aW5nIHRvIHRoYXQgZWxlbWVudCBhZ2FpblxuICAgICAgdGhpcy5fbmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdibHVyJywgKCkgPT4gZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoJ3RhYmluZGV4JykpO1xuICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsICgpID0+IGVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKCd0YWJpbmRleCcpKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICBlbGVtZW50LmZvY3VzKG9wdGlvbnMpO1xuICB9XG5cbiAgLyoqXG4gICAqIEZvY3VzZXMgdGhlIGZpcnN0IGVsZW1lbnQgdGhhdCBtYXRjaGVzIHRoZSBnaXZlbiBzZWxlY3RvciB3aXRoaW4gdGhlIGZvY3VzIHRyYXAuXG4gICAqIEBwYXJhbSBzZWxlY3RvciBUaGUgQ1NTIHNlbGVjdG9yIGZvciB0aGUgZWxlbWVudCB0byBzZXQgZm9jdXMgdG8uXG4gICAqL1xuICBwcml2YXRlIF9mb2N1c0J5Q3NzU2VsZWN0b3Ioc2VsZWN0b3I6IHN0cmluZywgb3B0aW9ucz86IEZvY3VzT3B0aW9ucykge1xuICAgIGxldCBlbGVtZW50VG9Gb2N1cyA9IHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5xdWVyeVNlbGVjdG9yKFxuICAgICAgc2VsZWN0b3IsXG4gICAgKSBhcyBIVE1MRWxlbWVudCB8IG51bGw7XG4gICAgaWYgKGVsZW1lbnRUb0ZvY3VzKSB7XG4gICAgICB0aGlzLl9mb3JjZUZvY3VzKGVsZW1lbnRUb0ZvY3VzLCBvcHRpb25zKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQXV0b2ZvY3VzIHRoZSBlbGVtZW50IHNwZWNpZmllZCBieSB0aGUgYXV0b0ZvY3VzIGZpZWxkLiBXaGVuIGF1dG9Gb2N1cyBpcyBub3QgJ2RpYWxvZycsIGlmXG4gICAqIGZvciBzb21lIHJlYXNvbiB0aGUgZWxlbWVudCBjYW5ub3QgYmUgZm9jdXNlZCwgdGhlIGRpYWxvZyBjb250YWluZXIgd2lsbCBiZSBmb2N1c2VkLlxuICAgKi9cbiAgcHJpdmF0ZSBfYXV0b0ZvY3VzKCkge1xuICAgIGNvbnN0IGVsZW1lbnQgPSB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQ7XG5cbiAgICAvLyBJZiB3ZXJlIHRvIGF0dGVtcHQgdG8gZm9jdXMgaW1tZWRpYXRlbHksIHRoZW4gdGhlIGNvbnRlbnQgb2YgdGhlIGRpYWxvZyB3b3VsZCBub3QgeWV0IGJlXG4gICAgLy8gcmVhZHkgaW4gaW5zdGFuY2VzIHdoZXJlIGNoYW5nZSBkZXRlY3Rpb24gaGFzIHRvIHJ1biBmaXJzdC4gVG8gZGVhbCB3aXRoIHRoaXMsIHdlIHNpbXBseVxuICAgIC8vIHdhaXQgZm9yIHRoZSBtaWNyb3Rhc2sgcXVldWUgdG8gYmUgZW1wdHkgd2hlbiBzZXR0aW5nIGZvY3VzIHdoZW4gYXV0b0ZvY3VzIGlzbid0IHNldCB0b1xuICAgIC8vIGRpYWxvZy4gSWYgdGhlIGVsZW1lbnQgaW5zaWRlIHRoZSBkaWFsb2cgY2FuJ3QgYmUgZm9jdXNlZCwgdGhlbiB0aGUgY29udGFpbmVyIGlzIGZvY3VzZWRcbiAgICAvLyBzbyB0aGUgdXNlciBjYW4ndCB0YWIgaW50byBvdGhlciBlbGVtZW50cyBiZWhpbmQgaXQuXG4gICAgc3dpdGNoICh0aGlzLl9jb25maWcuYXV0b0ZvY3VzKSB7XG4gICAgICBjYXNlIGZhbHNlOlxuICAgICAgY2FzZSAnZGlhbG9nJzpcbiAgICAgICAgY29uc3QgYWN0aXZlRWxlbWVudCA9IF9nZXRGb2N1c2VkRWxlbWVudFBpZXJjZVNoYWRvd0RvbSgpO1xuICAgICAgICAvLyBFbnN1cmUgdGhhdCBmb2N1cyBpcyBvbiB0aGUgZGlhbG9nIGNvbnRhaW5lci4gSXQncyBwb3NzaWJsZSB0aGF0IGEgZGlmZmVyZW50XG4gICAgICAgIC8vIGNvbXBvbmVudCB0cmllZCB0byBtb3ZlIGZvY3VzIHdoaWxlIHRoZSBvcGVuIGFuaW1hdGlvbiB3YXMgcnVubmluZy4gU2VlOlxuICAgICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9jb21wb25lbnRzL2lzc3Vlcy8xNjIxNS4gTm90ZSB0aGF0IHdlIG9ubHkgd2FudCB0byBkbyB0aGlzXG4gICAgICAgIC8vIGlmIHRoZSBmb2N1cyBpc24ndCBpbnNpZGUgdGhlIGRpYWxvZyBhbHJlYWR5LCBiZWNhdXNlIGl0J3MgcG9zc2libGUgdGhhdCB0aGUgY29uc3VtZXJcbiAgICAgICAgLy8gdHVybmVkIG9mZiBgYXV0b0ZvY3VzYCBpbiBvcmRlciB0byBtb3ZlIGZvY3VzIHRoZW1zZWx2ZXMuXG4gICAgICAgIGlmIChhY3RpdmVFbGVtZW50ICE9PSBlbGVtZW50ICYmICFlbGVtZW50LmNvbnRhaW5zKGFjdGl2ZUVsZW1lbnQpKSB7XG4gICAgICAgICAgZWxlbWVudC5mb2N1cygpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSB0cnVlOlxuICAgICAgY2FzZSAnZmlyc3QtdGFiYmFibGUnOlxuICAgICAgICB0aGlzLl9mb2N1c1RyYXAuZm9jdXNJbml0aWFsRWxlbWVudFdoZW5SZWFkeSgpLnRoZW4oaGFzTW92ZWRGb2N1cyA9PiB7XG4gICAgICAgICAgaWYgKCFoYXNNb3ZlZEZvY3VzKSB7XG4gICAgICAgICAgICBlbGVtZW50LmZvY3VzKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdmaXJzdC1oZWFkaW5nJzpcbiAgICAgICAgdGhpcy5fZm9jdXNCeUNzc1NlbGVjdG9yKCdoMSwgaDIsIGgzLCBoNCwgaDUsIGg2LCBbcm9sZT1cImhlYWRpbmdcIl0nKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aGlzLl9mb2N1c0J5Q3NzU2VsZWN0b3IodGhpcy5fY29uZmlnLmF1dG9Gb2N1cyEpO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICAvKiogUmV0dXJucyB0aGUgZm9jdXMgdG8gdGhlIGVsZW1lbnQgZm9jdXNlZCBiZWZvcmUgdGhlIGRpYWxvZyB3YXMgb3Blbi4gKi9cbiAgcHJpdmF0ZSBfcmV0dXJuRm9jdXNBZnRlckRpYWxvZygpIHtcbiAgICBjb25zdCB0b0ZvY3VzID0gdGhpcy5fZWxlbWVudEZvY3VzZWRCZWZvcmVEaWFsb2dXYXNPcGVuZWQ7XG4gICAgLy8gV2UgbmVlZCB0aGUgZXh0cmEgY2hlY2ssIGJlY2F1c2UgSUUgY2FuIHNldCB0aGUgYGFjdGl2ZUVsZW1lbnRgIHRvIG51bGwgaW4gc29tZSBjYXNlcy5cbiAgICBpZiAodG9Gb2N1cyAmJiB0eXBlb2YgdG9Gb2N1cy5mb2N1cyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgY29uc3QgYWN0aXZlRWxlbWVudCA9IF9nZXRGb2N1c2VkRWxlbWVudFBpZXJjZVNoYWRvd0RvbSgpO1xuICAgICAgY29uc3QgZWxlbWVudCA9IHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudDtcblxuICAgICAgLy8gTWFrZSBzdXJlIHRoYXQgZm9jdXMgaXMgc3RpbGwgaW5zaWRlIHRoZSBkaWFsb2cgb3IgaXMgb24gdGhlIGJvZHkgKHVzdWFsbHkgYmVjYXVzZSBhXG4gICAgICAvLyBub24tZm9jdXNhYmxlIGVsZW1lbnQgbGlrZSB0aGUgYmFja2Ryb3Agd2FzIGNsaWNrZWQpIGJlZm9yZSBtb3ZpbmcgaXQuIEl0J3MgcG9zc2libGUgdGhhdFxuICAgICAgLy8gdGhlIGNvbnN1bWVyIG1vdmVkIGl0IHRoZW1zZWx2ZXMgYmVmb3JlIHRoZSBhbmltYXRpb24gd2FzIGRvbmUsIGluIHdoaWNoIGNhc2Ugd2Ugc2hvdWxkbid0XG4gICAgICAvLyBkbyBhbnl0aGluZy5cbiAgICAgIGlmIChcbiAgICAgICAgIWFjdGl2ZUVsZW1lbnQgfHxcbiAgICAgICAgYWN0aXZlRWxlbWVudCA9PT0gdGhpcy5fZG9jdW1lbnQuYm9keSB8fFxuICAgICAgICBhY3RpdmVFbGVtZW50ID09PSBlbGVtZW50IHx8XG4gICAgICAgIGVsZW1lbnQuY29udGFpbnMoYWN0aXZlRWxlbWVudClcbiAgICAgICkge1xuICAgICAgICB0b0ZvY3VzLmZvY3VzKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iLCI8bmctdGVtcGxhdGUgY2RrUG9ydGFsT3V0bGV0PjwvbmctdGVtcGxhdGU+XG4iXX0=