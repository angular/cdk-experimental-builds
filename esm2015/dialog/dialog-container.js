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
export function throwDialogContentAlreadyAttachedError() {
    throw Error('Attempting to attach dialog content after content is already attached');
}
/**
 * Internal component that wraps user-provided dialog content.
 * @docs-private
 */
export class CdkDialogContainer extends BasePortalOutlet {
    constructor(_elementRef, _focusTrapFactory, _changeDetectorRef, _document, 
    /** The dialog configuration. */
    _config) {
        super();
        this._elementRef = _elementRef;
        this._focusTrapFactory = _focusTrapFactory;
        this._changeDetectorRef = _changeDetectorRef;
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
            if (this._portalHost.hasAttached()) {
                throwDialogContentAlreadyAttachedError();
            }
            this._savePreviouslyFocusedElement();
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
                this._autoFocusFirstTabbableElement();
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
    // tslint:disable:no-host-decorator-in-concrete
    get _ariaLabel() { return this._config.ariaLabel || null; }
    get _ariaDescribedBy() { return this._config.ariaDescribedBy; }
    get _role() { return this._config.role; }
    get _tabindex() { return -1; }
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
        if (this._portalHost.hasAttached()) {
            throwDialogContentAlreadyAttachedError();
        }
        this._savePreviouslyFocusedElement();
        return this._portalHost.attachComponentPortal(portal);
    }
    /**
     * Attach a TemplatePortal as content to this dialog container.
     * @param portal Portal to be attached as the dialog content.
     */
    attachTemplatePortal(portal) {
        if (this._portalHost.hasAttached()) {
            throwDialogContentAlreadyAttachedError();
        }
        this._savePreviouslyFocusedElement();
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
            this._elementFocusedBeforeDialogWasOpened = this._document.activeElement;
            // Move focus onto the dialog immediately in order to prevent the user from accidentally
            // opening multiple dialogs at the same time. Needs to be async, because the element
            // may not be focusable immediately.
            Promise.resolve().then(() => this._elementRef.nativeElement.focus());
        }
    }
    /**
     * Autofocus the first tabbable element inside of the dialog, if there is not a tabbable element,
     * focus the dialog instead.
     */
    _autoFocusFirstTabbableElement() {
        const element = this._elementRef.nativeElement;
        // If were to attempt to focus immediately, then the content of the dialog would not yet be
        // ready in instances where change detection has to run first. To deal with this, we simply
        // wait for the microtask queue to be empty.
        if (this._config.autoFocus) {
            this._focusTrap.focusInitialElementWhenReady().then(hasMovedFocus => {
                // If we didn't find any focusable elements inside the dialog, focus the
                // container so the user can't tab into other elements behind it.
                if (!hasMovedFocus) {
                    element.focus();
                }
            });
        }
        else {
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
    /** Returns the focus to the element focused before the dialog was open. */
    _returnFocusAfterDialog() {
        const toFocus = this._elementFocusedBeforeDialogWasOpened;
        // We need the extra check, because IE can set the `activeElement` to null in some cases.
        if (toFocus && typeof toFocus.focus === 'function') {
            const activeElement = this._document.activeElement;
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
            },] }
];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhbG9nLWNvbnRhaW5lci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL2RpYWxvZy9kaWFsb2ctY29udGFpbmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxPQUFPLEVBQWtCLEtBQUssRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLE9BQU8sRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQy9GLE9BQU8sRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQ25ELE9BQU8sRUFDTCxnQkFBZ0IsRUFFaEIsZUFBZSxHQUdoQixNQUFNLHFCQUFxQixDQUFDO0FBQzdCLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUN6QyxPQUFPLEVBQ0wsdUJBQXVCLEVBQ3ZCLGlCQUFpQixFQUNqQixTQUFTLEVBRVQsVUFBVSxFQUVWLFdBQVcsRUFDWCxNQUFNLEVBRU4sUUFBUSxFQUNSLFNBQVMsRUFDVCxpQkFBaUIsR0FDbEIsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFDLE9BQU8sRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUM3QixPQUFPLEVBQUMsb0JBQW9CLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUNwRCxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFHN0MsTUFBTSxVQUFVLHNDQUFzQztJQUNwRCxNQUFNLEtBQUssQ0FBQyx1RUFBdUUsQ0FBQyxDQUFDO0FBQ3ZGLENBQUM7QUFHRDs7O0dBR0c7QUE2QkgsTUFBTSxPQUFPLGtCQUFtQixTQUFRLGdCQUFnQjtJQThDdEQsWUFDVSxXQUFvQyxFQUNwQyxpQkFBbUMsRUFDbkMsa0JBQXFDLEVBQ2YsU0FBYztJQUM1QyxnQ0FBZ0M7SUFDekIsT0FBcUI7UUFDNUIsS0FBSyxFQUFFLENBQUM7UUFOQSxnQkFBVyxHQUFYLFdB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QUFDLFlBQVksRUFBRSxLQUFLLENBQUMsRUFBQyxPQUFPLEVBQUUsQ0FBQyxFQUFDLENBQUMsQ0FBQzt3QkFDeEMsVUFBVSxDQUFDLFlBQVksRUFBRSxPQUFPLENBQUMsNEJBQTRCLENBQUMsQ0FBQzt3QkFDL0QsVUFBVSxDQUFDLHNCQUFzQixFQUFFLE9BQU8sQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO3FCQUN6RSxDQUFDO2lCQUNIO2dCQUNELElBQUksRUFBRTtvQkFDSixXQUFXLEVBQUU7Ozs7OztNQU1YO29CQUNGLGlCQUFpQixFQUFFLDJCQUEyQjtvQkFDOUMsZ0JBQWdCLEVBQUUsNkJBQTZCO2lCQUNoRDs7YUFDRjs7O1lBbERDLFVBQVU7WUFkSixnQkFBZ0I7WUFXdEIsaUJBQWlCOzRDQXdHZCxRQUFRLFlBQUksTUFBTSxTQUFDLFFBQVE7WUExRnhCLFlBQVk7Ozt5QkF3RGpCLFdBQVcsU0FBQyxpQkFBaUI7K0JBRTdCLFdBQVcsU0FBQyx1QkFBdUI7b0JBR25DLFdBQVcsU0FBQyxXQUFXO3lCQUV2QixXQUFXLFNBQUMsaUJBQWlCO3dCQUU3QixXQUFXLFNBQUMsZUFBZTswQkFJM0IsU0FBUyxTQUFDLGVBQWUsRUFBRSxFQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHthbmltYXRlLCBBbmltYXRpb25FdmVudCwgc3RhdGUsIHN0eWxlLCB0cmFuc2l0aW9uLCB0cmlnZ2VyfSBmcm9tICdAYW5ndWxhci9hbmltYXRpb25zJztcbmltcG9ydCB7Rm9jdXNUcmFwRmFjdG9yeX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2ExMXknO1xuaW1wb3J0IHtcbiAgQmFzZVBvcnRhbE91dGxldCxcbiAgQ29tcG9uZW50UG9ydGFsLFxuICBDZGtQb3J0YWxPdXRsZXQsXG4gIFRlbXBsYXRlUG9ydGFsLFxuICBEb21Qb3J0YWwsXG59IGZyb20gJ0Bhbmd1bGFyL2Nkay9wb3J0YWwnO1xuaW1wb3J0IHtET0NVTUVOVH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7XG4gIENoYW5nZURldGVjdGlvblN0cmF0ZWd5LFxuICBDaGFuZ2VEZXRlY3RvclJlZixcbiAgQ29tcG9uZW50LFxuICBDb21wb25lbnRSZWYsXG4gIEVsZW1lbnRSZWYsXG4gIEVtYmVkZGVkVmlld1JlZixcbiAgSG9zdEJpbmRpbmcsXG4gIEluamVjdCxcbiAgT25EZXN0cm95LFxuICBPcHRpb25hbCxcbiAgVmlld0NoaWxkLFxuICBWaWV3RW5jYXBzdWxhdGlvbixcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge1N1YmplY3R9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHtkaXN0aW5jdFVudGlsQ2hhbmdlZH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuaW1wb3J0IHtEaWFsb2dDb25maWd9IGZyb20gJy4vZGlhbG9nLWNvbmZpZyc7XG5cblxuZXhwb3J0IGZ1bmN0aW9uIHRocm93RGlhbG9nQ29udGVudEFscmVhZHlBdHRhY2hlZEVycm9yKCkge1xuICB0aHJvdyBFcnJvcignQXR0ZW1wdGluZyB0byBhdHRhY2ggZGlhbG9nIGNvbnRlbnQgYWZ0ZXIgY29udGVudCBpcyBhbHJlYWR5IGF0dGFjaGVkJyk7XG59XG5cblxuLyoqXG4gKiBJbnRlcm5hbCBjb21wb25lbnQgdGhhdCB3cmFwcyB1c2VyLXByb3ZpZGVkIGRpYWxvZyBjb250ZW50LlxuICogQGRvY3MtcHJpdmF0ZVxuICovXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdjZGstZGlhbG9nLWNvbnRhaW5lcicsXG4gIHRlbXBsYXRlVXJsOiAnLi9kaWFsb2ctY29udGFpbmVyLmh0bWwnLFxuICBzdHlsZVVybHM6IFsnZGlhbG9nLWNvbnRhaW5lci5jc3MnXSxcbiAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZSxcbiAgLy8gVXNpbmcgT25QdXNoIGZvciBkaWFsb2dzIGNhdXNlZCBzb21lIEczIHN5bmMgaXNzdWVzLiBEaXNhYmxlZCB1bnRpbCB3ZSBjYW4gdHJhY2sgdGhlbSBkb3duLlxuICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6dmFsaWRhdGUtZGVjb3JhdG9yc1xuICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5LkRlZmF1bHQsXG4gIGFuaW1hdGlvbnM6IFtcbiAgICB0cmlnZ2VyKCdkaWFsb2cnLCBbXG4gICAgICBzdGF0ZSgnZW50ZXInLCBzdHlsZSh7b3BhY2l0eTogMX0pKSxcbiAgICAgIHN0YXRlKCdleGl0LCB2b2lkJywgc3R5bGUoe29wYWNpdHk6IDB9KSksXG4gICAgICB0cmFuc2l0aW9uKCcqID0+IGVudGVyJywgYW5pbWF0ZSgne3tlbnRlckFuaW1hdGlvbkR1cmF0aW9ufX0nKSksXG4gICAgICB0cmFuc2l0aW9uKCcqID0+IGV4aXQsICogPT4gdm9pZCcsIGFuaW1hdGUoJ3t7ZXhpdEFuaW1hdGlvbkR1cmF0aW9ufX0nKSksXG4gICAgXSlcbiAgXSxcbiAgaG9zdDoge1xuICAgICdbQGRpYWxvZ10nOiBge1xuICAgICAgdmFsdWU6IF9zdGF0ZSxcbiAgICAgIHBhcmFtczoge1xuICAgICAgICBlbnRlckFuaW1hdGlvbkR1cmF0aW9uOiBfY29uZmlnLmVudGVyQW5pbWF0aW9uRHVyYXRpb24sXG4gICAgICAgIGV4aXRBbmltYXRpb25EdXJhdGlvbjogX2NvbmZpZy5leGl0QW5pbWF0aW9uRHVyYXRpb25cbiAgICAgIH1cbiAgICB9YCxcbiAgICAnKEBkaWFsb2cuc3RhcnQpJzogJ19vbkFuaW1hdGlvblN0YXJ0KCRldmVudCknLFxuICAgICcoQGRpYWxvZy5kb25lKSc6ICdfYW5pbWF0aW9uRG9uZS5uZXh0KCRldmVudCknLFxuICB9LFxufSlcbmV4cG9ydCBjbGFzcyBDZGtEaWFsb2dDb250YWluZXIgZXh0ZW5kcyBCYXNlUG9ydGFsT3V0bGV0IGltcGxlbWVudHMgT25EZXN0cm95IHtcbiAgcHJpdmF0ZSByZWFkb25seSBfZG9jdW1lbnQ6IERvY3VtZW50O1xuXG4gIC8qKiBTdGF0ZSBvZiB0aGUgZGlhbG9nIGFuaW1hdGlvbi4gKi9cbiAgX3N0YXRlOiAndm9pZCcgfCAnZW50ZXInIHwgJ2V4aXQnID0gJ2VudGVyJztcblxuICAvKiogRWxlbWVudCB0aGF0IHdhcyBmb2N1c2VkIGJlZm9yZSB0aGUgZGlhbG9nIHdhcyBvcGVuZWQuIFNhdmUgdGhpcyB0byByZXN0b3JlIHVwb24gY2xvc2UuICovXG4gIHByaXZhdGUgX2VsZW1lbnRGb2N1c2VkQmVmb3JlRGlhbG9nV2FzT3BlbmVkOiBIVE1MRWxlbWVudCB8IG51bGwgPSBudWxsO1xuXG4gICAvKiogVGhlIGNsYXNzIHRoYXQgdHJhcHMgYW5kIG1hbmFnZXMgZm9jdXMgd2l0aGluIHRoZSBkaWFsb2cuICovXG4gIHByaXZhdGUgX2ZvY3VzVHJhcCA9IHRoaXMuX2ZvY3VzVHJhcEZhY3RvcnkuY3JlYXRlKHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudCk7XG5cbiAgLy8gQEhvc3RCaW5kaW5nIGlzIHVzZWQgaW4gdGhlIGNsYXNzIGFzIGl0IGlzIGV4cGVjdGVkIHRvIGJlIGV4dGVuZGVkLiBTaW5jZSBAQ29tcG9uZW50IGRlY29yYXRvclxuICAvLyBtZXRhZGF0YSBpcyBub3QgaW5oZXJpdGVkIGJ5IGNoaWxkIGNsYXNzZXMsIGluc3RlYWQgdGhlIGhvc3QgYmluZGluZyBkYXRhIGlzIGRlZmluZWQgaW4gYSB3YXlcbiAgLy8gdGhhdCBjYW4gYmUgaW5oZXJpdGVkLlxuICAvLyB0c2xpbnQ6ZGlzYWJsZTpuby1ob3N0LWRlY29yYXRvci1pbi1jb25jcmV0ZVxuICBASG9zdEJpbmRpbmcoJ2F0dHIuYXJpYS1sYWJlbCcpIGdldCBfYXJpYUxhYmVsKCkgeyByZXR1cm4gdGhpcy5fY29uZmlnLmFyaWFMYWJlbCB8fCBudWxsOyB9XG5cbiAgQEhvc3RCaW5kaW5nKCdhdHRyLmFyaWEtZGVzY3JpYmVkYnknKVxuICBnZXQgX2FyaWFEZXNjcmliZWRCeSgpIHsgcmV0dXJuIHRoaXMuX2NvbmZpZy5hcmlhRGVzY3JpYmVkQnk7IH1cblxuICBASG9zdEJpbmRpbmcoJ2F0dHIucm9sZScpIGdldCBfcm9sZSgpIHsgcmV0dXJuIHRoaXMuX2NvbmZpZy5yb2xlOyB9XG5cbiAgQEhvc3RCaW5kaW5nKCdhdHRyLmFyaWEtbW9kYWwnKSBfYXJpYU1vZGFsOiBib29sZWFuID0gdHJ1ZTtcblxuICBASG9zdEJpbmRpbmcoJ2F0dHIudGFiaW5kZXgnKSBnZXQgX3RhYmluZGV4KCkgeyByZXR1cm4gLTE7IH1cbiAgLy8gdHNsaW50OmRpc2FibGU6bm8taG9zdC1kZWNvcmF0b3ItaW4tY29uY3JldGVcblxuICAvKiogVGhlIHBvcnRhbCBob3N0IGluc2lkZSBvZiB0aGlzIGNvbnRhaW5lciBpbnRvIHdoaWNoIHRoZSBkaWFsb2cgY29udGVudCB3aWxsIGJlIGxvYWRlZC4gKi9cbiAgQFZpZXdDaGlsZChDZGtQb3J0YWxPdXRsZXQsIHtzdGF0aWM6IHRydWV9KSBfcG9ydGFsSG9zdDogQ2RrUG9ydGFsT3V0bGV0O1xuXG4gIC8qKiBBIHN1YmplY3QgZW1pdHRpbmcgYmVmb3JlIHRoZSBkaWFsb2cgZW50ZXJzIHRoZSB2aWV3LiAqL1xuICBfYmVmb3JlRW50ZXI6IFN1YmplY3Q8dm9pZD4gPSBuZXcgU3ViamVjdCgpO1xuXG4gIC8qKiBBIHN1YmplY3QgZW1pdHRpbmcgYWZ0ZXIgdGhlIGRpYWxvZyBlbnRlcnMgdGhlIHZpZXcuICovXG4gIF9hZnRlckVudGVyOiBTdWJqZWN0PHZvaWQ+ID0gbmV3IFN1YmplY3QoKTtcblxuICAvKiogQSBzdWJqZWN0IGVtaXR0aW5nIGJlZm9yZSB0aGUgZGlhbG9nIGV4aXRzIHRoZSB2aWV3LiAqL1xuICBfYmVmb3JlRXhpdDogU3ViamVjdDx2b2lkPiA9IG5ldyBTdWJqZWN0KCk7XG5cbiAgLyoqIEEgc3ViamVjdCBlbWl0dGluZyBhZnRlciB0aGUgZGlhbG9nIGV4aXRzIHRoZSB2aWV3LiAqL1xuICBfYWZ0ZXJFeGl0OiBTdWJqZWN0PHZvaWQ+ID0gbmV3IFN1YmplY3QoKTtcblxuICAvKiogU3RyZWFtIG9mIGFuaW1hdGlvbiBgZG9uZWAgZXZlbnRzLiAqL1xuICBfYW5pbWF0aW9uRG9uZSA9IG5ldyBTdWJqZWN0PEFuaW1hdGlvbkV2ZW50PigpO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgX2VsZW1lbnRSZWY6IEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+LFxuICAgIHByaXZhdGUgX2ZvY3VzVHJhcEZhY3Rvcnk6IEZvY3VzVHJhcEZhY3RvcnksXG4gICAgcHJpdmF0ZSBfY2hhbmdlRGV0ZWN0b3JSZWY6IENoYW5nZURldGVjdG9yUmVmLFxuICAgIEBPcHRpb25hbCgpIEBJbmplY3QoRE9DVU1FTlQpIF9kb2N1bWVudDogYW55LFxuICAgIC8qKiBUaGUgZGlhbG9nIGNvbmZpZ3VyYXRpb24uICovXG4gICAgcHVibGljIF9jb25maWc6IERpYWxvZ0NvbmZpZykge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLl9kb2N1bWVudCA9IF9kb2N1bWVudDtcblxuICAgIC8vIFdlIHVzZSBhIFN1YmplY3Qgd2l0aCBhIGRpc3RpbmN0VW50aWxDaGFuZ2VkLCByYXRoZXIgdGhhbiBhIGNhbGxiYWNrIGF0dGFjaGVkIHRvIC5kb25lLFxuICAgIC8vIGJlY2F1c2Ugc29tZSBicm93c2VycyBmaXJlIHRoZSBkb25lIGV2ZW50IHR3aWNlIGFuZCB3ZSBkb24ndCB3YW50IHRvIGVtaXQgZHVwbGljYXRlIGV2ZW50cy5cbiAgICAvLyBTZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIvaXNzdWVzLzI0MDg0XG4gICAgdGhpcy5fYW5pbWF0aW9uRG9uZS5waXBlKGRpc3RpbmN0VW50aWxDaGFuZ2VkKCh4LCB5KSA9PiB7XG4gICAgICByZXR1cm4geC5mcm9tU3RhdGUgPT09IHkuZnJvbVN0YXRlICYmIHgudG9TdGF0ZSA9PT0geS50b1N0YXRlO1xuICAgIH0pKS5zdWJzY3JpYmUoZXZlbnQgPT4ge1xuICAgICAgLy8gRW1pdCBsaWZlY3ljbGUgZXZlbnRzIGJhc2VkIG9uIGFuaW1hdGlvbiBgZG9uZWAgY2FsbGJhY2suXG4gICAgICBpZiAoZXZlbnQudG9TdGF0ZSA9PT0gJ2VudGVyJykge1xuICAgICAgICB0aGlzLl9hdXRvRm9jdXNGaXJzdFRhYmJhYmxlRWxlbWVudCgpO1xuICAgICAgICB0aGlzLl9hZnRlckVudGVyLm5leHQoKTtcbiAgICAgICAgdGhpcy5fYWZ0ZXJFbnRlci5jb21wbGV0ZSgpO1xuICAgICAgfVxuXG4gICAgICBpZiAoZXZlbnQuZnJvbVN0YXRlID09PSAnZW50ZXInICYmIChldmVudC50b1N0YXRlID09PSAndm9pZCcgfHwgZXZlbnQudG9TdGF0ZSA9PT0gJ2V4aXQnKSkge1xuICAgICAgICB0aGlzLl9yZXR1cm5Gb2N1c0FmdGVyRGlhbG9nKCk7XG4gICAgICAgIHRoaXMuX2FmdGVyRXhpdC5uZXh0KCk7XG4gICAgICAgIHRoaXMuX2FmdGVyRXhpdC5jb21wbGV0ZSgpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqIERlc3Ryb3kgZm9jdXMgdHJhcCB0byBwbGFjZSBmb2N1cyBiYWNrIHRvIHRoZSBlbGVtZW50IGZvY3VzZWQgYmVmb3JlIHRoZSBkaWFsb2cgb3BlbmVkLiAqL1xuICBuZ09uRGVzdHJveSgpIHtcbiAgICB0aGlzLl9mb2N1c1RyYXAuZGVzdHJveSgpO1xuICAgIHRoaXMuX2FuaW1hdGlvbkRvbmUuY29tcGxldGUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBdHRhY2ggYSBDb21wb25lbnRQb3J0YWwgYXMgY29udGVudCB0byB0aGlzIGRpYWxvZyBjb250YWluZXIuXG4gICAqIEBwYXJhbSBwb3J0YWwgUG9ydGFsIHRvIGJlIGF0dGFjaGVkIGFzIHRoZSBkaWFsb2cgY29udGVudC5cbiAgICovXG4gIGF0dGFjaENvbXBvbmVudFBvcnRhbDxUPihwb3J0YWw6IENvbXBvbmVudFBvcnRhbDxUPik6IENvbXBvbmVudFJlZjxUPiB7XG4gICAgaWYgKHRoaXMuX3BvcnRhbEhvc3QuaGFzQXR0YWNoZWQoKSkge1xuICAgICAgdGhyb3dEaWFsb2dDb250ZW50QWxyZWFkeUF0dGFjaGVkRXJyb3IoKTtcbiAgICB9XG5cbiAgICB0aGlzLl9zYXZlUHJldmlvdXNseUZvY3VzZWRFbGVtZW50KCk7XG4gICAgcmV0dXJuIHRoaXMuX3BvcnRhbEhvc3QuYXR0YWNoQ29tcG9uZW50UG9ydGFsKHBvcnRhbCk7XG4gIH1cblxuICAvKipcbiAgICogQXR0YWNoIGEgVGVtcGxhdGVQb3J0YWwgYXMgY29udGVudCB0byB0aGlzIGRpYWxvZyBjb250YWluZXIuXG4gICAqIEBwYXJhbSBwb3J0YWwgUG9ydGFsIHRvIGJlIGF0dGFjaGVkIGFzIHRoZSBkaWFsb2cgY29udGVudC5cbiAgICovXG4gIGF0dGFjaFRlbXBsYXRlUG9ydGFsPEM+KHBvcnRhbDogVGVtcGxhdGVQb3J0YWw8Qz4pOiBFbWJlZGRlZFZpZXdSZWY8Qz4ge1xuICAgIGlmICh0aGlzLl9wb3J0YWxIb3N0Lmhhc0F0dGFjaGVkKCkpIHtcbiAgICAgIHRocm93RGlhbG9nQ29udGVudEFscmVhZHlBdHRhY2hlZEVycm9yKCk7XG4gICAgfVxuXG4gICAgdGhpcy5fc2F2ZVByZXZpb3VzbHlGb2N1c2VkRWxlbWVudCgpO1xuICAgIHJldHVybiB0aGlzLl9wb3J0YWxIb3N0LmF0dGFjaFRlbXBsYXRlUG9ydGFsKHBvcnRhbCk7XG4gIH1cblxuICAvKipcbiAgICogQXR0YWNoZXMgYSBET00gcG9ydGFsIHRvIHRoZSBkaWFsb2cgY29udGFpbmVyLlxuICAgKiBAcGFyYW0gcG9ydGFsIFBvcnRhbCB0byBiZSBhdHRhY2hlZC5cbiAgICogQGRlcHJlY2F0ZWQgVG8gYmUgdHVybmVkIGludG8gYSBtZXRob2QuXG4gICAqIEBicmVha2luZy1jaGFuZ2UgMTAuMC4wXG4gICAqL1xuICBhdHRhY2hEb21Qb3J0YWwgPSAocG9ydGFsOiBEb21Qb3J0YWwpID0+IHtcbiAgICBpZiAodGhpcy5fcG9ydGFsSG9zdC5oYXNBdHRhY2hlZCgpKSB7XG4gICAgICB0aHJvd0RpYWxvZ0NvbnRlbnRBbHJlYWR5QXR0YWNoZWRFcnJvcigpO1xuICAgIH1cblxuICAgIHRoaXMuX3NhdmVQcmV2aW91c2x5Rm9jdXNlZEVsZW1lbnQoKTtcbiAgICByZXR1cm4gdGhpcy5fcG9ydGFsSG9zdC5hdHRhY2hEb21Qb3J0YWwocG9ydGFsKTtcbiAgfVxuXG4gIC8qKiBFbWl0IGxpZmVjeWNsZSBldmVudHMgYmFzZWQgb24gYW5pbWF0aW9uIGBzdGFydGAgY2FsbGJhY2suICovXG4gIF9vbkFuaW1hdGlvblN0YXJ0KGV2ZW50OiBBbmltYXRpb25FdmVudCkge1xuICAgIGlmIChldmVudC50b1N0YXRlID09PSAnZW50ZXInKSB7XG4gICAgICB0aGlzLl9iZWZvcmVFbnRlci5uZXh0KCk7XG4gICAgICB0aGlzLl9iZWZvcmVFbnRlci5jb21wbGV0ZSgpO1xuICAgIH1cbiAgICBpZiAoZXZlbnQuZnJvbVN0YXRlID09PSAnZW50ZXInICYmIChldmVudC50b1N0YXRlID09PSAndm9pZCcgfHwgZXZlbnQudG9TdGF0ZSA9PT0gJ2V4aXQnKSkge1xuICAgICAgdGhpcy5fYmVmb3JlRXhpdC5uZXh0KCk7XG4gICAgICB0aGlzLl9iZWZvcmVFeGl0LmNvbXBsZXRlKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFN0YXJ0cyB0aGUgZGlhbG9nIGV4aXQgYW5pbWF0aW9uLiAqL1xuICBfc3RhcnRFeGl0aW5nKCk6IHZvaWQge1xuICAgIHRoaXMuX3N0YXRlID0gJ2V4aXQnO1xuXG4gICAgLy8gTWFyayB0aGUgY29udGFpbmVyIGZvciBjaGVjayBzbyBpdCBjYW4gcmVhY3QgaWYgdGhlXG4gICAgLy8gdmlldyBjb250YWluZXIgaXMgdXNpbmcgT25QdXNoIGNoYW5nZSBkZXRlY3Rpb24uXG4gICAgdGhpcy5fY2hhbmdlRGV0ZWN0b3JSZWYubWFya0ZvckNoZWNrKCk7XG4gIH1cblxuICAvKiogU2F2ZXMgYSByZWZlcmVuY2UgdG8gdGhlIGVsZW1lbnQgdGhhdCB3YXMgZm9jdXNlZCBiZWZvcmUgdGhlIGRpYWxvZyB3YXMgb3BlbmVkLiAqL1xuICBwcml2YXRlIF9zYXZlUHJldmlvdXNseUZvY3VzZWRFbGVtZW50KCkge1xuICAgIGlmICh0aGlzLl9kb2N1bWVudCkge1xuICAgICAgdGhpcy5fZWxlbWVudEZvY3VzZWRCZWZvcmVEaWFsb2dXYXNPcGVuZWQgPSB0aGlzLl9kb2N1bWVudC5hY3RpdmVFbGVtZW50IGFzIEhUTUxFbGVtZW50O1xuXG4gICAgICAvLyBNb3ZlIGZvY3VzIG9udG8gdGhlIGRpYWxvZyBpbW1lZGlhdGVseSBpbiBvcmRlciB0byBwcmV2ZW50IHRoZSB1c2VyIGZyb20gYWNjaWRlbnRhbGx5XG4gICAgICAvLyBvcGVuaW5nIG11bHRpcGxlIGRpYWxvZ3MgYXQgdGhlIHNhbWUgdGltZS4gTmVlZHMgdG8gYmUgYXN5bmMsIGJlY2F1c2UgdGhlIGVsZW1lbnRcbiAgICAgIC8vIG1heSBub3QgYmUgZm9jdXNhYmxlIGltbWVkaWF0ZWx5LlxuICAgICAgUHJvbWlzZS5yZXNvbHZlKCkudGhlbigoKSA9PiB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQuZm9jdXMoKSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEF1dG9mb2N1cyB0aGUgZmlyc3QgdGFiYmFibGUgZWxlbWVudCBpbnNpZGUgb2YgdGhlIGRpYWxvZywgaWYgdGhlcmUgaXMgbm90IGEgdGFiYmFibGUgZWxlbWVudCxcbiAgICogZm9jdXMgdGhlIGRpYWxvZyBpbnN0ZWFkLlxuICAgKi9cbiAgcHJpdmF0ZSBfYXV0b0ZvY3VzRmlyc3RUYWJiYWJsZUVsZW1lbnQoKSB7XG4gICAgY29uc3QgZWxlbWVudCA9IHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudDtcblxuICAgIC8vIElmIHdlcmUgdG8gYXR0ZW1wdCB0byBmb2N1cyBpbW1lZGlhdGVseSwgdGhlbiB0aGUgY29udGVudCBvZiB0aGUgZGlhbG9nIHdvdWxkIG5vdCB5ZXQgYmVcbiAgICAvLyByZWFkeSBpbiBpbnN0YW5jZXMgd2hlcmUgY2hhbmdlIGRldGVjdGlvbiBoYXMgdG8gcnVuIGZpcnN0LiBUbyBkZWFsIHdpdGggdGhpcywgd2Ugc2ltcGx5XG4gICAgLy8gd2FpdCBmb3IgdGhlIG1pY3JvdGFzayBxdWV1ZSB0byBiZSBlbXB0eS5cbiAgICBpZiAodGhpcy5fY29uZmlnLmF1dG9Gb2N1cykge1xuICAgICAgdGhpcy5fZm9jdXNUcmFwLmZvY3VzSW5pdGlhbEVsZW1lbnRXaGVuUmVhZHkoKS50aGVuKGhhc01vdmVkRm9jdXMgPT4ge1xuICAgICAgICAvLyBJZiB3ZSBkaWRuJ3QgZmluZCBhbnkgZm9jdXNhYmxlIGVsZW1lbnRzIGluc2lkZSB0aGUgZGlhbG9nLCBmb2N1cyB0aGVcbiAgICAgICAgLy8gY29udGFpbmVyIHNvIHRoZSB1c2VyIGNhbid0IHRhYiBpbnRvIG90aGVyIGVsZW1lbnRzIGJlaGluZCBpdC5cbiAgICAgICAgaWYgKCFoYXNNb3ZlZEZvY3VzKSB7XG4gICAgICAgICAgZWxlbWVudC5mb2N1cygpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgYWN0aXZlRWxlbWVudCA9IHRoaXMuX2RvY3VtZW50LmFjdGl2ZUVsZW1lbnQ7XG5cbiAgICAgIC8vIE90aGVyd2lzZSBlbnN1cmUgdGhhdCBmb2N1cyBpcyBvbiB0aGUgZGlhbG9nIGNvbnRhaW5lci4gSXQncyBwb3NzaWJsZSB0aGF0IGEgZGlmZmVyZW50XG4gICAgICAvLyBjb21wb25lbnQgdHJpZWQgdG8gbW92ZSBmb2N1cyB3aGlsZSB0aGUgb3BlbiBhbmltYXRpb24gd2FzIHJ1bm5pbmcuIFNlZTpcbiAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2NvbXBvbmVudHMvaXNzdWVzLzE2MjE1LiBOb3RlIHRoYXQgd2Ugb25seSB3YW50IHRvIGRvIHRoaXNcbiAgICAgIC8vIGlmIHRoZSBmb2N1cyBpc24ndCBpbnNpZGUgdGhlIGRpYWxvZyBhbHJlYWR5LCBiZWNhdXNlIGl0J3MgcG9zc2libGUgdGhhdCB0aGUgY29uc3VtZXJcbiAgICAgIC8vIHR1cm5lZCBvZmYgYGF1dG9Gb2N1c2AgaW4gb3JkZXIgdG8gbW92ZSBmb2N1cyB0aGVtc2VsdmVzLlxuICAgICAgaWYgKGFjdGl2ZUVsZW1lbnQgIT09IGVsZW1lbnQgJiYgIWVsZW1lbnQuY29udGFpbnMoYWN0aXZlRWxlbWVudCkpIHtcbiAgICAgICAgZWxlbWVudC5mb2N1cygpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKiBSZXR1cm5zIHRoZSBmb2N1cyB0byB0aGUgZWxlbWVudCBmb2N1c2VkIGJlZm9yZSB0aGUgZGlhbG9nIHdhcyBvcGVuLiAqL1xuICBwcml2YXRlIF9yZXR1cm5Gb2N1c0FmdGVyRGlhbG9nKCkge1xuICAgIGNvbnN0IHRvRm9jdXMgPSB0aGlzLl9lbGVtZW50Rm9jdXNlZEJlZm9yZURpYWxvZ1dhc09wZW5lZDtcbiAgICAvLyBXZSBuZWVkIHRoZSBleHRyYSBjaGVjaywgYmVjYXVzZSBJRSBjYW4gc2V0IHRoZSBgYWN0aXZlRWxlbWVudGAgdG8gbnVsbCBpbiBzb21lIGNhc2VzLlxuICAgIGlmICh0b0ZvY3VzICYmIHR5cGVvZiB0b0ZvY3VzLmZvY3VzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBjb25zdCBhY3RpdmVFbGVtZW50ID0gdGhpcy5fZG9jdW1lbnQuYWN0aXZlRWxlbWVudDtcbiAgICAgIGNvbnN0IGVsZW1lbnQgPSB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQ7XG5cbiAgICAgIC8vIE1ha2Ugc3VyZSB0aGF0IGZvY3VzIGlzIHN0aWxsIGluc2lkZSB0aGUgZGlhbG9nIG9yIGlzIG9uIHRoZSBib2R5ICh1c3VhbGx5IGJlY2F1c2UgYVxuICAgICAgLy8gbm9uLWZvY3VzYWJsZSBlbGVtZW50IGxpa2UgdGhlIGJhY2tkcm9wIHdhcyBjbGlja2VkKSBiZWZvcmUgbW92aW5nIGl0LiBJdCdzIHBvc3NpYmxlIHRoYXRcbiAgICAgIC8vIHRoZSBjb25zdW1lciBtb3ZlZCBpdCB0aGVtc2VsdmVzIGJlZm9yZSB0aGUgYW5pbWF0aW9uIHdhcyBkb25lLCBpbiB3aGljaCBjYXNlIHdlIHNob3VsZG4ndFxuICAgICAgLy8gZG8gYW55dGhpbmcuXG4gICAgICBpZiAoIWFjdGl2ZUVsZW1lbnQgfHwgYWN0aXZlRWxlbWVudCA9PT0gdGhpcy5fZG9jdW1lbnQuYm9keSB8fCBhY3RpdmVFbGVtZW50ID09PSBlbGVtZW50IHx8XG4gICAgICAgIGVsZW1lbnQuY29udGFpbnMoYWN0aXZlRWxlbWVudCkpIHtcbiAgICAgICAgdG9Gb2N1cy5mb2N1cygpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIl19