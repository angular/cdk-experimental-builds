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
        this._animationDone.pipe(distinctUntilChanged((x, y) => {
            return x.fromState === y.fromState && x.toState === y.toState;
        })).subscribe(event => {
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
    get _ariaLabel() { return this._config.ariaLabel || null; }
    get _ariaDescribedBy() { return this._config.ariaDescribedBy; }
    get _role() { return this._config.role; }
    get _tabindex() { return -1; }
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
                this._focusTrap.focusInitialElementWhenReady()
                    .then(hasMovedFocus => {
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
            if (!activeElement || activeElement === this._document.body || activeElement === element ||
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
        ])
    ], changeDetection: i0.ChangeDetectionStrategy.Default, encapsulation: i0.ViewEncapsulation.None });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.0-next.15", ngImport: i0, type: CdkDialogContainer, decorators: [{
            type: Component,
            args: [{ selector: 'cdk-dialog-container', encapsulation: ViewEncapsulation.None, changeDetection: ChangeDetectionStrategy.Default, animations: [
                        trigger('dialog', [
                            state('enter', style({ opacity: 1 })),
                            state('exit, void', style({ opacity: 0 })),
                            transition('* => enter', animate('{{enterAnimationDuration}}')),
                            transition('* => exit, * => void', animate('{{exitAnimationDuration}}')),
                        ])
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhbG9nLWNvbnRhaW5lci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL2RpYWxvZy9kaWFsb2ctY29udGFpbmVyLnRzIiwiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvZGlhbG9nL2RpYWxvZy1jb250YWluZXIuaHRtbCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsT0FBTyxFQUFrQixLQUFLLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxPQUFPLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUMvRixPQUFPLEVBQUMsZ0JBQWdCLEVBQUUsb0JBQW9CLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUN6RSxPQUFPLEVBQUMsaUNBQWlDLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUN4RSxPQUFPLEVBQ0wsZ0JBQWdCLEVBQ2hCLGVBQWUsR0FJaEIsTUFBTSxxQkFBcUIsQ0FBQztBQUM3QixPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDekMsT0FBTyxFQUNMLHVCQUF1QixFQUN2QixpQkFBaUIsRUFDakIsU0FBUyxFQUVULFVBQVUsRUFFVixXQUFXLEVBQ1gsTUFBTSxFQUNOLE1BQU0sRUFFTixRQUFRLEVBQ1IsU0FBUyxFQUNULGlCQUFpQixHQUNsQixNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQzdCLE9BQU8sRUFBQyxvQkFBb0IsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQ3BELE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQzs7Ozs7QUFHN0MsTUFBTSxVQUFVLHNDQUFzQztJQUNwRCxNQUFNLEtBQUssQ0FBQyx1RUFBdUUsQ0FBQyxDQUFDO0FBQ3ZGLENBQUM7QUFHRDs7O0dBR0c7QUE2QkgsTUFBTSxP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SixXQUFXLEVBQUU7Ozs7OztNQU1YO3dCQUNGLGlCQUFpQixFQUFFLDJCQUEyQjt3QkFDOUMsZ0JBQWdCLEVBQUUsNkJBQTZCO3FCQUNoRDs7MEJBc0RFLFFBQVE7OzBCQUFJLE1BQU07MkJBQUMsUUFBUTt1RUFwQ00sVUFBVTtzQkFBN0MsV0FBVzt1QkFBQyxpQkFBaUI7Z0JBRzFCLGdCQUFnQjtzQkFEbkIsV0FBVzt1QkFBQyx1QkFBdUI7Z0JBR04sS0FBSztzQkFBbEMsV0FBVzt1QkFBQyxXQUFXO2dCQUVRLFVBQVU7c0JBQXpDLFdBQVc7dUJBQUMsaUJBQWlCO2dCQUVJLFNBQVM7c0JBQTFDLFdBQVc7dUJBQUMsZUFBZTtnQkFJZ0IsV0FBVztzQkFBdEQsU0FBUzt1QkFBQyxlQUFlLEVBQUUsRUFBQyxNQUFNLEVBQUUsSUFBSSxFQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7YW5pbWF0ZSwgQW5pbWF0aW9uRXZlbnQsIHN0YXRlLCBzdHlsZSwgdHJhbnNpdGlvbiwgdHJpZ2dlcn0gZnJvbSAnQGFuZ3VsYXIvYW5pbWF0aW9ucyc7XG5pbXBvcnQge0ZvY3VzVHJhcEZhY3RvcnksIEludGVyYWN0aXZpdHlDaGVja2VyfSBmcm9tICdAYW5ndWxhci9jZGsvYTExeSc7XG5pbXBvcnQge19nZXRGb2N1c2VkRWxlbWVudFBpZXJjZVNoYWRvd0RvbX0gZnJvbSAnQGFuZ3VsYXIvY2RrL3BsYXRmb3JtJztcbmltcG9ydCB7XG4gIEJhc2VQb3J0YWxPdXRsZXQsXG4gIENka1BvcnRhbE91dGxldCxcbiAgQ29tcG9uZW50UG9ydGFsLFxuICBEb21Qb3J0YWwsXG4gIFRlbXBsYXRlUG9ydGFsLFxufSBmcm9tICdAYW5ndWxhci9jZGsvcG9ydGFsJztcbmltcG9ydCB7RE9DVU1FTlR9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQge1xuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gIENvbXBvbmVudCxcbiAgQ29tcG9uZW50UmVmLFxuICBFbGVtZW50UmVmLFxuICBFbWJlZGRlZFZpZXdSZWYsXG4gIEhvc3RCaW5kaW5nLFxuICBJbmplY3QsXG4gIE5nWm9uZSxcbiAgT25EZXN0cm95LFxuICBPcHRpb25hbCxcbiAgVmlld0NoaWxkLFxuICBWaWV3RW5jYXBzdWxhdGlvbixcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge1N1YmplY3R9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHtkaXN0aW5jdFVudGlsQ2hhbmdlZH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuaW1wb3J0IHtEaWFsb2dDb25maWd9IGZyb20gJy4vZGlhbG9nLWNvbmZpZyc7XG5cblxuZXhwb3J0IGZ1bmN0aW9uIHRocm93RGlhbG9nQ29udGVudEFscmVhZHlBdHRhY2hlZEVycm9yKCkge1xuICB0aHJvdyBFcnJvcignQXR0ZW1wdGluZyB0byBhdHRhY2ggZGlhbG9nIGNvbnRlbnQgYWZ0ZXIgY29udGVudCBpcyBhbHJlYWR5IGF0dGFjaGVkJyk7XG59XG5cblxuLyoqXG4gKiBJbnRlcm5hbCBjb21wb25lbnQgdGhhdCB3cmFwcyB1c2VyLXByb3ZpZGVkIGRpYWxvZyBjb250ZW50LlxuICogQGRvY3MtcHJpdmF0ZVxuICovXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdjZGstZGlhbG9nLWNvbnRhaW5lcicsXG4gIHRlbXBsYXRlVXJsOiAnLi9kaWFsb2ctY29udGFpbmVyLmh0bWwnLFxuICBzdHlsZVVybHM6IFsnZGlhbG9nLWNvbnRhaW5lci5jc3MnXSxcbiAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZSxcbiAgLy8gVXNpbmcgT25QdXNoIGZvciBkaWFsb2dzIGNhdXNlZCBzb21lIEczIHN5bmMgaXNzdWVzLiBEaXNhYmxlZCB1bnRpbCB3ZSBjYW4gdHJhY2sgdGhlbSBkb3duLlxuICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6dmFsaWRhdGUtZGVjb3JhdG9yc1xuICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5LkRlZmF1bHQsXG4gIGFuaW1hdGlvbnM6IFtcbiAgICB0cmlnZ2VyKCdkaWFsb2cnLCBbXG4gICAgICBzdGF0ZSgnZW50ZXInLCBzdHlsZSh7b3BhY2l0eTogMX0pKSxcbiAgICAgIHN0YXRlKCdleGl0LCB2b2lkJywgc3R5bGUoe29wYWNpdHk6IDB9KSksXG4gICAgICB0cmFuc2l0aW9uKCcqID0+IGVudGVyJywgYW5pbWF0ZSgne3tlbnRlckFuaW1hdGlvbkR1cmF0aW9ufX0nKSksXG4gICAgICB0cmFuc2l0aW9uKCcqID0+IGV4aXQsICogPT4gdm9pZCcsIGFuaW1hdGUoJ3t7ZXhpdEFuaW1hdGlvbkR1cmF0aW9ufX0nKSksXG4gICAgXSlcbiAgXSxcbiAgaG9zdDoge1xuICAgICdbQGRpYWxvZ10nOiBge1xuICAgICAgdmFsdWU6IF9zdGF0ZSxcbiAgICAgIHBhcmFtczoge1xuICAgICAgICBlbnRlckFuaW1hdGlvbkR1cmF0aW9uOiBfY29uZmlnLmVudGVyQW5pbWF0aW9uRHVyYXRpb24sXG4gICAgICAgIGV4aXRBbmltYXRpb25EdXJhdGlvbjogX2NvbmZpZy5leGl0QW5pbWF0aW9uRHVyYXRpb25cbiAgICAgIH1cbiAgICB9YCxcbiAgICAnKEBkaWFsb2cuc3RhcnQpJzogJ19vbkFuaW1hdGlvblN0YXJ0KCRldmVudCknLFxuICAgICcoQGRpYWxvZy5kb25lKSc6ICdfYW5pbWF0aW9uRG9uZS5uZXh0KCRldmVudCknLFxuICB9LFxufSlcbmV4cG9ydCBjbGFzcyBDZGtEaWFsb2dDb250YWluZXIgZXh0ZW5kcyBCYXNlUG9ydGFsT3V0bGV0IGltcGxlbWVudHMgT25EZXN0cm95IHtcbiAgcHJpdmF0ZSByZWFkb25seSBfZG9jdW1lbnQ6IERvY3VtZW50O1xuXG4gIC8qKiBTdGF0ZSBvZiB0aGUgZGlhbG9nIGFuaW1hdGlvbi4gKi9cbiAgX3N0YXRlOiAndm9pZCcgfCAnZW50ZXInIHwgJ2V4aXQnID0gJ2VudGVyJztcblxuICAvKiogRWxlbWVudCB0aGF0IHdhcyBmb2N1c2VkIGJlZm9yZSB0aGUgZGlhbG9nIHdhcyBvcGVuZWQuIFNhdmUgdGhpcyB0byByZXN0b3JlIHVwb24gY2xvc2UuICovXG4gIHByaXZhdGUgX2VsZW1lbnRGb2N1c2VkQmVmb3JlRGlhbG9nV2FzT3BlbmVkOiBIVE1MRWxlbWVudCB8IG51bGwgPSBudWxsO1xuXG4gICAvKiogVGhlIGNsYXNzIHRoYXQgdHJhcHMgYW5kIG1hbmFnZXMgZm9jdXMgd2l0aGluIHRoZSBkaWFsb2cuICovXG4gIHByaXZhdGUgX2ZvY3VzVHJhcCA9IHRoaXMuX2ZvY3VzVHJhcEZhY3RvcnkuY3JlYXRlKHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudCk7XG5cbiAgLy8gQEhvc3RCaW5kaW5nIGlzIHVzZWQgaW4gdGhlIGNsYXNzIGFzIGl0IGlzIGV4cGVjdGVkIHRvIGJlIGV4dGVuZGVkLiBTaW5jZSBAQ29tcG9uZW50IGRlY29yYXRvclxuICAvLyBtZXRhZGF0YSBpcyBub3QgaW5oZXJpdGVkIGJ5IGNoaWxkIGNsYXNzZXMsIGluc3RlYWQgdGhlIGhvc3QgYmluZGluZyBkYXRhIGlzIGRlZmluZWQgaW4gYSB3YXlcbiAgLy8gdGhhdCBjYW4gYmUgaW5oZXJpdGVkLlxuICAvLyB0c2xpbnQ6ZGlzYWJsZTpuby1ob3N0LWRlY29yYXRvci1pbi1jb25jcmV0ZSBuby1wcml2YXRlLWdldHRlcnNcbiAgQEhvc3RCaW5kaW5nKCdhdHRyLmFyaWEtbGFiZWwnKSBnZXQgX2FyaWFMYWJlbCgpIHsgcmV0dXJuIHRoaXMuX2NvbmZpZy5hcmlhTGFiZWwgfHwgbnVsbDsgfVxuXG4gIEBIb3N0QmluZGluZygnYXR0ci5hcmlhLWRlc2NyaWJlZGJ5JylcbiAgZ2V0IF9hcmlhRGVzY3JpYmVkQnkoKSB7IHJldHVybiB0aGlzLl9jb25maWcuYXJpYURlc2NyaWJlZEJ5OyB9XG5cbiAgQEhvc3RCaW5kaW5nKCdhdHRyLnJvbGUnKSBnZXQgX3JvbGUoKSB7IHJldHVybiB0aGlzLl9jb25maWcucm9sZTsgfVxuXG4gIEBIb3N0QmluZGluZygnYXR0ci5hcmlhLW1vZGFsJykgX2FyaWFNb2RhbDogYm9vbGVhbiA9IHRydWU7XG5cbiAgQEhvc3RCaW5kaW5nKCdhdHRyLnRhYmluZGV4JykgZ2V0IF90YWJpbmRleCgpIHsgcmV0dXJuIC0xOyB9XG4gIC8vIHRzbGludDpkaXNhYmxlOm5vLWhvc3QtZGVjb3JhdG9yLWluLWNvbmNyZXRlIG5vLXByaXZhdGUtZ2V0dGVyc1xuXG4gIC8qKiBUaGUgcG9ydGFsIGhvc3QgaW5zaWRlIG9mIHRoaXMgY29udGFpbmVyIGludG8gd2hpY2ggdGhlIGRpYWxvZyBjb250ZW50IHdpbGwgYmUgbG9hZGVkLiAqL1xuICBAVmlld0NoaWxkKENka1BvcnRhbE91dGxldCwge3N0YXRpYzogdHJ1ZX0pIF9wb3J0YWxIb3N0OiBDZGtQb3J0YWxPdXRsZXQ7XG5cbiAgLyoqIEEgc3ViamVjdCBlbWl0dGluZyBiZWZvcmUgdGhlIGRpYWxvZyBlbnRlcnMgdGhlIHZpZXcuICovXG4gIHJlYWRvbmx5IF9iZWZvcmVFbnRlciA9IG5ldyBTdWJqZWN0PHZvaWQ+KCk7XG5cbiAgLyoqIEEgc3ViamVjdCBlbWl0dGluZyBhZnRlciB0aGUgZGlhbG9nIGVudGVycyB0aGUgdmlldy4gKi9cbiAgcmVhZG9ubHkgX2FmdGVyRW50ZXIgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xuXG4gIC8qKiBBIHN1YmplY3QgZW1pdHRpbmcgYmVmb3JlIHRoZSBkaWFsb2cgZXhpdHMgdGhlIHZpZXcuICovXG4gIHJlYWRvbmx5IF9iZWZvcmVFeGl0ID0gbmV3IFN1YmplY3Q8dm9pZD4oKTtcblxuICAvKiogQSBzdWJqZWN0IGVtaXR0aW5nIGFmdGVyIHRoZSBkaWFsb2cgZXhpdHMgdGhlIHZpZXcuICovXG4gIHJlYWRvbmx5IF9hZnRlckV4aXQgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xuXG4gIC8qKiBTdHJlYW0gb2YgYW5pbWF0aW9uIGBkb25lYCBldmVudHMuICovXG4gIHJlYWRvbmx5IF9hbmltYXRpb25Eb25lID0gbmV3IFN1YmplY3Q8QW5pbWF0aW9uRXZlbnQ+KCk7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBfZWxlbWVudFJlZjogRWxlbWVudFJlZjxIVE1MRWxlbWVudD4sXG4gICAgcHJpdmF0ZSBfZm9jdXNUcmFwRmFjdG9yeTogRm9jdXNUcmFwRmFjdG9yeSxcbiAgICBwcml2YXRlIF9jaGFuZ2VEZXRlY3RvclJlZjogQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gICAgcHJpdmF0ZSByZWFkb25seSBfaW50ZXJhY3Rpdml0eUNoZWNrZXI6IEludGVyYWN0aXZpdHlDaGVja2VyLFxuICAgIHByaXZhdGUgcmVhZG9ubHkgX25nWm9uZTogTmdab25lLFxuICAgIEBPcHRpb25hbCgpIEBJbmplY3QoRE9DVU1FTlQpIF9kb2N1bWVudDogYW55LFxuICAgIC8qKiBUaGUgZGlhbG9nIGNvbmZpZ3VyYXRpb24uICovXG4gICAgcHVibGljIF9jb25maWc6IERpYWxvZ0NvbmZpZykge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLl9kb2N1bWVudCA9IF9kb2N1bWVudDtcblxuICAgIC8vIFdlIHVzZSBhIFN1YmplY3Qgd2l0aCBhIGRpc3RpbmN0VW50aWxDaGFuZ2VkLCByYXRoZXIgdGhhbiBhIGNhbGxiYWNrIGF0dGFjaGVkIHRvIC5kb25lLFxuICAgIC8vIGJlY2F1c2Ugc29tZSBicm93c2VycyBmaXJlIHRoZSBkb25lIGV2ZW50IHR3aWNlIGFuZCB3ZSBkb24ndCB3YW50IHRvIGVtaXQgZHVwbGljYXRlIGV2ZW50cy5cbiAgICAvLyBTZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIvaXNzdWVzLzI0MDg0XG4gICAgdGhpcy5fYW5pbWF0aW9uRG9uZS5waXBlKGRpc3RpbmN0VW50aWxDaGFuZ2VkKCh4LCB5KSA9PiB7XG4gICAgICByZXR1cm4geC5mcm9tU3RhdGUgPT09IHkuZnJvbVN0YXRlICYmIHgudG9TdGF0ZSA9PT0geS50b1N0YXRlO1xuICAgIH0pKS5zdWJzY3JpYmUoZXZlbnQgPT4ge1xuICAgICAgLy8gRW1pdCBsaWZlY3ljbGUgZXZlbnRzIGJhc2VkIG9uIGFuaW1hdGlvbiBgZG9uZWAgY2FsbGJhY2suXG4gICAgICBpZiAoZXZlbnQudG9TdGF0ZSA9PT0gJ2VudGVyJykge1xuICAgICAgICB0aGlzLl9hdXRvRm9jdXMoKTtcbiAgICAgICAgdGhpcy5fYWZ0ZXJFbnRlci5uZXh0KCk7XG4gICAgICAgIHRoaXMuX2FmdGVyRW50ZXIuY29tcGxldGUoKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGV2ZW50LmZyb21TdGF0ZSA9PT0gJ2VudGVyJyAmJiAoZXZlbnQudG9TdGF0ZSA9PT0gJ3ZvaWQnIHx8IGV2ZW50LnRvU3RhdGUgPT09ICdleGl0JykpIHtcbiAgICAgICAgdGhpcy5fcmV0dXJuRm9jdXNBZnRlckRpYWxvZygpO1xuICAgICAgICB0aGlzLl9hZnRlckV4aXQubmV4dCgpO1xuICAgICAgICB0aGlzLl9hZnRlckV4aXQuY29tcGxldGUoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBJbml0aWFsaXplcyB0aGUgZGlhbG9nIGNvbnRhaW5lciB3aXRoIHRoZSBhdHRhY2hlZCBjb250ZW50LiAqL1xuICBfaW5pdGlhbGl6ZVdpdGhBdHRhY2hlZENvbnRlbnQoKSB7XG4gICAgLy8gU2F2ZSB0aGUgcHJldmlvdXNseSBmb2N1c2VkIGVsZW1lbnQuIFRoaXMgZWxlbWVudCB3aWxsIGJlIHJlLWZvY3VzZWRcbiAgICAvLyB3aGVuIHRoZSBkaWFsb2cgY2xvc2VzLlxuICAgIHRoaXMuX3NhdmVQcmV2aW91c2x5Rm9jdXNlZEVsZW1lbnQoKTtcbiAgICAvLyBNb3ZlIGZvY3VzIG9udG8gdGhlIGRpYWxvZyBpbW1lZGlhdGVseSBpbiBvcmRlciB0byBwcmV2ZW50IHRoZSB1c2VyXG4gICAgLy8gZnJvbSBhY2NpZGVudGFsbHkgb3BlbmluZyBtdWx0aXBsZSBkaWFsb2dzIGF0IHRoZSBzYW1lIHRpbWUuXG4gICAgdGhpcy5fZm9jdXNEaWFsb2dDb250YWluZXIoKTtcbiAgfVxuXG4gIC8qKiBEZXN0cm95IGZvY3VzIHRyYXAgdG8gcGxhY2UgZm9jdXMgYmFjayB0byB0aGUgZWxlbWVudCBmb2N1c2VkIGJlZm9yZSB0aGUgZGlhbG9nIG9wZW5lZC4gKi9cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgdGhpcy5fZm9jdXNUcmFwLmRlc3Ryb3koKTtcbiAgICB0aGlzLl9hbmltYXRpb25Eb25lLmNvbXBsZXRlKCk7XG4gIH1cblxuICAvKipcbiAgICogQXR0YWNoIGEgQ29tcG9uZW50UG9ydGFsIGFzIGNvbnRlbnQgdG8gdGhpcyBkaWFsb2cgY29udGFpbmVyLlxuICAgKiBAcGFyYW0gcG9ydGFsIFBvcnRhbCB0byBiZSBhdHRhY2hlZCBhcyB0aGUgZGlhbG9nIGNvbnRlbnQuXG4gICAqL1xuICBhdHRhY2hDb21wb25lbnRQb3J0YWw8VD4ocG9ydGFsOiBDb21wb25lbnRQb3J0YWw8VD4pOiBDb21wb25lbnRSZWY8VD4ge1xuICAgIGlmICh0aGlzLl9wb3J0YWxIb3N0Lmhhc0F0dGFjaGVkKCkgJiYgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkpIHtcbiAgICAgIHRocm93RGlhbG9nQ29udGVudEFscmVhZHlBdHRhY2hlZEVycm9yKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX3BvcnRhbEhvc3QuYXR0YWNoQ29tcG9uZW50UG9ydGFsKHBvcnRhbCk7XG4gIH1cblxuICAvKipcbiAgICogQXR0YWNoIGEgVGVtcGxhdGVQb3J0YWwgYXMgY29udGVudCB0byB0aGlzIGRpYWxvZyBjb250YWluZXIuXG4gICAqIEBwYXJhbSBwb3J0YWwgUG9ydGFsIHRvIGJlIGF0dGFjaGVkIGFzIHRoZSBkaWFsb2cgY29udGVudC5cbiAgICovXG4gIGF0dGFjaFRlbXBsYXRlUG9ydGFsPEM+KHBvcnRhbDogVGVtcGxhdGVQb3J0YWw8Qz4pOiBFbWJlZGRlZFZpZXdSZWY8Qz4ge1xuICAgIGlmICh0aGlzLl9wb3J0YWxIb3N0Lmhhc0F0dGFjaGVkKCkgJiYgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkpIHtcbiAgICAgIHRocm93RGlhbG9nQ29udGVudEFscmVhZHlBdHRhY2hlZEVycm9yKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX3BvcnRhbEhvc3QuYXR0YWNoVGVtcGxhdGVQb3J0YWwocG9ydGFsKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBdHRhY2hlcyBhIERPTSBwb3J0YWwgdG8gdGhlIGRpYWxvZyBjb250YWluZXIuXG4gICAqIEBwYXJhbSBwb3J0YWwgUG9ydGFsIHRvIGJlIGF0dGFjaGVkLlxuICAgKiBAZGVwcmVjYXRlZCBUbyBiZSB0dXJuZWQgaW50byBhIG1ldGhvZC5cbiAgICogQGJyZWFraW5nLWNoYW5nZSAxMC4wLjBcbiAgICovXG4gIG92ZXJyaWRlIGF0dGFjaERvbVBvcnRhbCA9IChwb3J0YWw6IERvbVBvcnRhbCkgPT4ge1xuICAgIGlmICh0aGlzLl9wb3J0YWxIb3N0Lmhhc0F0dGFjaGVkKCkgJiYgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkpIHtcbiAgICAgIHRocm93RGlhbG9nQ29udGVudEFscmVhZHlBdHRhY2hlZEVycm9yKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX3BvcnRhbEhvc3QuYXR0YWNoRG9tUG9ydGFsKHBvcnRhbCk7XG4gIH1cblxuICAvKiogRW1pdCBsaWZlY3ljbGUgZXZlbnRzIGJhc2VkIG9uIGFuaW1hdGlvbiBgc3RhcnRgIGNhbGxiYWNrLiAqL1xuICBfb25BbmltYXRpb25TdGFydChldmVudDogQW5pbWF0aW9uRXZlbnQpIHtcbiAgICBpZiAoZXZlbnQudG9TdGF0ZSA9PT0gJ2VudGVyJykge1xuICAgICAgdGhpcy5fYmVmb3JlRW50ZXIubmV4dCgpO1xuICAgICAgdGhpcy5fYmVmb3JlRW50ZXIuY29tcGxldGUoKTtcbiAgICB9XG4gICAgaWYgKGV2ZW50LmZyb21TdGF0ZSA9PT0gJ2VudGVyJyAmJiAoZXZlbnQudG9TdGF0ZSA9PT0gJ3ZvaWQnIHx8IGV2ZW50LnRvU3RhdGUgPT09ICdleGl0JykpIHtcbiAgICAgIHRoaXMuX2JlZm9yZUV4aXQubmV4dCgpO1xuICAgICAgdGhpcy5fYmVmb3JlRXhpdC5jb21wbGV0ZSgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBTdGFydHMgdGhlIGRpYWxvZyBleGl0IGFuaW1hdGlvbi4gKi9cbiAgX3N0YXJ0RXhpdGluZygpOiB2b2lkIHtcbiAgICB0aGlzLl9zdGF0ZSA9ICdleGl0JztcblxuICAgIC8vIE1hcmsgdGhlIGNvbnRhaW5lciBmb3IgY2hlY2sgc28gaXQgY2FuIHJlYWN0IGlmIHRoZVxuICAgIC8vIHZpZXcgY29udGFpbmVyIGlzIHVzaW5nIE9uUHVzaCBjaGFuZ2UgZGV0ZWN0aW9uLlxuICAgIHRoaXMuX2NoYW5nZURldGVjdG9yUmVmLm1hcmtGb3JDaGVjaygpO1xuICB9XG5cbiAgLyoqIFNhdmVzIGEgcmVmZXJlbmNlIHRvIHRoZSBlbGVtZW50IHRoYXQgd2FzIGZvY3VzZWQgYmVmb3JlIHRoZSBkaWFsb2cgd2FzIG9wZW5lZC4gKi9cbiAgcHJpdmF0ZSBfc2F2ZVByZXZpb3VzbHlGb2N1c2VkRWxlbWVudCgpIHtcbiAgICBpZiAodGhpcy5fZG9jdW1lbnQpIHtcbiAgICAgIHRoaXMuX2VsZW1lbnRGb2N1c2VkQmVmb3JlRGlhbG9nV2FzT3BlbmVkID0gX2dldEZvY3VzZWRFbGVtZW50UGllcmNlU2hhZG93RG9tKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEZvY3VzZXMgdGhlIGRpYWxvZyBjb250YWluZXIuICovXG4gIHByaXZhdGUgX2ZvY3VzRGlhbG9nQ29udGFpbmVyKCkge1xuICAgIC8vIE5vdGUgdGhhdCB0aGVyZSBpcyBubyBmb2N1cyBtZXRob2Qgd2hlbiByZW5kZXJpbmcgb24gdGhlIHNlcnZlci5cbiAgICBpZiAodGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LmZvY3VzKSB7XG4gICAgICB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQuZm9jdXMoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRm9jdXNlcyB0aGUgcHJvdmlkZWQgZWxlbWVudC4gSWYgdGhlIGVsZW1lbnQgaXMgbm90IGZvY3VzYWJsZSwgaXQgd2lsbCBhZGQgYSB0YWJJbmRleFxuICAgKiBhdHRyaWJ1dGUgdG8gZm9yY2VmdWxseSBmb2N1cyBpdC4gVGhlIGF0dHJpYnV0ZSBpcyByZW1vdmVkIGFmdGVyIGZvY3VzIGlzIG1vdmVkLlxuICAgKiBAcGFyYW0gZWxlbWVudCBUaGUgZWxlbWVudCB0byBmb2N1cy5cbiAgICovXG4gIHByaXZhdGUgX2ZvcmNlRm9jdXMoZWxlbWVudDogSFRNTEVsZW1lbnQsIG9wdGlvbnM/OiBGb2N1c09wdGlvbnMpIHtcbiAgICBpZiAoIXRoaXMuX2ludGVyYWN0aXZpdHlDaGVja2VyLmlzRm9jdXNhYmxlKGVsZW1lbnQpKSB7XG4gICAgICBlbGVtZW50LnRhYkluZGV4ID0gLTE7XG4gICAgICAvLyBUaGUgdGFiaW5kZXggYXR0cmlidXRlIHNob3VsZCBiZSByZW1vdmVkIHRvIGF2b2lkIG5hdmlnYXRpbmcgdG8gdGhhdCBlbGVtZW50IGFnYWluXG4gICAgICB0aGlzLl9uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2JsdXInLCAoKSA9PiBlbGVtZW50LnJlbW92ZUF0dHJpYnV0ZSgndGFiaW5kZXgnKSk7XG4gICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgKCkgPT4gZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoJ3RhYmluZGV4JykpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIGVsZW1lbnQuZm9jdXMob3B0aW9ucyk7XG4gIH1cblxuICAvKipcbiAgICogRm9jdXNlcyB0aGUgZmlyc3QgZWxlbWVudCB0aGF0IG1hdGNoZXMgdGhlIGdpdmVuIHNlbGVjdG9yIHdpdGhpbiB0aGUgZm9jdXMgdHJhcC5cbiAgICogQHBhcmFtIHNlbGVjdG9yIFRoZSBDU1Mgc2VsZWN0b3IgZm9yIHRoZSBlbGVtZW50IHRvIHNldCBmb2N1cyB0by5cbiAgICovXG4gIHByaXZhdGUgX2ZvY3VzQnlDc3NTZWxlY3RvcihzZWxlY3Rvcjogc3RyaW5nLCBvcHRpb25zPzogRm9jdXNPcHRpb25zKSB7XG4gICAgbGV0IGVsZW1lbnRUb0ZvY3VzID1cbiAgICAgIHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKSBhcyBIVE1MRWxlbWVudCB8IG51bGw7XG4gICAgaWYgKGVsZW1lbnRUb0ZvY3VzKSB7XG4gICAgICB0aGlzLl9mb3JjZUZvY3VzKGVsZW1lbnRUb0ZvY3VzLCBvcHRpb25zKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQXV0b2ZvY3VzIHRoZSBlbGVtZW50IHNwZWNpZmllZCBieSB0aGUgYXV0b0ZvY3VzIGZpZWxkLiBXaGVuIGF1dG9Gb2N1cyBpcyBub3QgJ2RpYWxvZycsIGlmXG4gICAqIGZvciBzb21lIHJlYXNvbiB0aGUgZWxlbWVudCBjYW5ub3QgYmUgZm9jdXNlZCwgdGhlIGRpYWxvZyBjb250YWluZXIgd2lsbCBiZSBmb2N1c2VkLlxuICAgKi9cbiAgcHJpdmF0ZSBfYXV0b0ZvY3VzKCkge1xuICAgIGNvbnN0IGVsZW1lbnQgPSB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQ7XG5cbiAgICAvLyBJZiB3ZXJlIHRvIGF0dGVtcHQgdG8gZm9jdXMgaW1tZWRpYXRlbHksIHRoZW4gdGhlIGNvbnRlbnQgb2YgdGhlIGRpYWxvZyB3b3VsZCBub3QgeWV0IGJlXG4gICAgLy8gcmVhZHkgaW4gaW5zdGFuY2VzIHdoZXJlIGNoYW5nZSBkZXRlY3Rpb24gaGFzIHRvIHJ1biBmaXJzdC4gVG8gZGVhbCB3aXRoIHRoaXMsIHdlIHNpbXBseVxuICAgIC8vIHdhaXQgZm9yIHRoZSBtaWNyb3Rhc2sgcXVldWUgdG8gYmUgZW1wdHkgd2hlbiBzZXR0aW5nIGZvY3VzIHdoZW4gYXV0b0ZvY3VzIGlzbid0IHNldCB0b1xuICAgIC8vIGRpYWxvZy4gSWYgdGhlIGVsZW1lbnQgaW5zaWRlIHRoZSBkaWFsb2cgY2FuJ3QgYmUgZm9jdXNlZCwgdGhlbiB0aGUgY29udGFpbmVyIGlzIGZvY3VzZWRcbiAgICAvLyBzbyB0aGUgdXNlciBjYW4ndCB0YWIgaW50byBvdGhlciBlbGVtZW50cyBiZWhpbmQgaXQuXG4gICAgc3dpdGNoICh0aGlzLl9jb25maWcuYXV0b0ZvY3VzKSB7XG4gICAgICBjYXNlIGZhbHNlOlxuICAgICAgY2FzZSAnZGlhbG9nJzpcbiAgICAgICAgY29uc3QgYWN0aXZlRWxlbWVudCA9IF9nZXRGb2N1c2VkRWxlbWVudFBpZXJjZVNoYWRvd0RvbSgpO1xuICAgICAgICAvLyBFbnN1cmUgdGhhdCBmb2N1cyBpcyBvbiB0aGUgZGlhbG9nIGNvbnRhaW5lci4gSXQncyBwb3NzaWJsZSB0aGF0IGEgZGlmZmVyZW50XG4gICAgICAgIC8vIGNvbXBvbmVudCB0cmllZCB0byBtb3ZlIGZvY3VzIHdoaWxlIHRoZSBvcGVuIGFuaW1hdGlvbiB3YXMgcnVubmluZy4gU2VlOlxuICAgICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9jb21wb25lbnRzL2lzc3Vlcy8xNjIxNS4gTm90ZSB0aGF0IHdlIG9ubHkgd2FudCB0byBkbyB0aGlzXG4gICAgICAgIC8vIGlmIHRoZSBmb2N1cyBpc24ndCBpbnNpZGUgdGhlIGRpYWxvZyBhbHJlYWR5LCBiZWNhdXNlIGl0J3MgcG9zc2libGUgdGhhdCB0aGUgY29uc3VtZXJcbiAgICAgICAgLy8gdHVybmVkIG9mZiBgYXV0b0ZvY3VzYCBpbiBvcmRlciB0byBtb3ZlIGZvY3VzIHRoZW1zZWx2ZXMuXG4gICAgICAgIGlmIChhY3RpdmVFbGVtZW50ICE9PSBlbGVtZW50ICYmICFlbGVtZW50LmNvbnRhaW5zKGFjdGl2ZUVsZW1lbnQpKSB7XG4gICAgICAgICAgZWxlbWVudC5mb2N1cygpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSB0cnVlOlxuICAgICAgY2FzZSAnZmlyc3QtdGFiYmFibGUnOlxuICAgICAgICB0aGlzLl9mb2N1c1RyYXAuZm9jdXNJbml0aWFsRWxlbWVudFdoZW5SZWFkeSgpXG4gICAgICAgICAgLnRoZW4oaGFzTW92ZWRGb2N1cyA9PiB7XG4gICAgICAgICAgICBpZiAoIWhhc01vdmVkRm9jdXMpIHtcbiAgICAgICAgICAgICAgZWxlbWVudC5mb2N1cygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnZmlyc3QtaGVhZGluZyc6XG4gICAgICAgICAgdGhpcy5fZm9jdXNCeUNzc1NlbGVjdG9yKCdoMSwgaDIsIGgzLCBoNCwgaDUsIGg2LCBbcm9sZT1cImhlYWRpbmdcIl0nKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICB0aGlzLl9mb2N1c0J5Q3NzU2VsZWN0b3IodGhpcy5fY29uZmlnLmF1dG9Gb2N1cyEpO1xuICAgICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBSZXR1cm5zIHRoZSBmb2N1cyB0byB0aGUgZWxlbWVudCBmb2N1c2VkIGJlZm9yZSB0aGUgZGlhbG9nIHdhcyBvcGVuLiAqL1xuICBwcml2YXRlIF9yZXR1cm5Gb2N1c0FmdGVyRGlhbG9nKCkge1xuICAgIGNvbnN0IHRvRm9jdXMgPSB0aGlzLl9lbGVtZW50Rm9jdXNlZEJlZm9yZURpYWxvZ1dhc09wZW5lZDtcbiAgICAvLyBXZSBuZWVkIHRoZSBleHRyYSBjaGVjaywgYmVjYXVzZSBJRSBjYW4gc2V0IHRoZSBgYWN0aXZlRWxlbWVudGAgdG8gbnVsbCBpbiBzb21lIGNhc2VzLlxuICAgIGlmICh0b0ZvY3VzICYmIHR5cGVvZiB0b0ZvY3VzLmZvY3VzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBjb25zdCBhY3RpdmVFbGVtZW50ID0gX2dldEZvY3VzZWRFbGVtZW50UGllcmNlU2hhZG93RG9tKCk7XG4gICAgICBjb25zdCBlbGVtZW50ID0gdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50O1xuXG4gICAgICAvLyBNYWtlIHN1cmUgdGhhdCBmb2N1cyBpcyBzdGlsbCBpbnNpZGUgdGhlIGRpYWxvZyBvciBpcyBvbiB0aGUgYm9keSAodXN1YWxseSBiZWNhdXNlIGFcbiAgICAgIC8vIG5vbi1mb2N1c2FibGUgZWxlbWVudCBsaWtlIHRoZSBiYWNrZHJvcCB3YXMgY2xpY2tlZCkgYmVmb3JlIG1vdmluZyBpdC4gSXQncyBwb3NzaWJsZSB0aGF0XG4gICAgICAvLyB0aGUgY29uc3VtZXIgbW92ZWQgaXQgdGhlbXNlbHZlcyBiZWZvcmUgdGhlIGFuaW1hdGlvbiB3YXMgZG9uZSwgaW4gd2hpY2ggY2FzZSB3ZSBzaG91bGRuJ3RcbiAgICAgIC8vIGRvIGFueXRoaW5nLlxuICAgICAgaWYgKCFhY3RpdmVFbGVtZW50IHx8IGFjdGl2ZUVsZW1lbnQgPT09IHRoaXMuX2RvY3VtZW50LmJvZHkgfHwgYWN0aXZlRWxlbWVudCA9PT0gZWxlbWVudCB8fFxuICAgICAgICBlbGVtZW50LmNvbnRhaW5zKGFjdGl2ZUVsZW1lbnQpKSB7XG4gICAgICAgIHRvRm9jdXMuZm9jdXMoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiIsIjxuZy10ZW1wbGF0ZSBjZGtQb3J0YWxPdXRsZXQ+PC9uZy10ZW1wbGF0ZT5cbiJdfQ==