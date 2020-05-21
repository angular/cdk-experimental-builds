/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __decorate, __metadata, __param } from "tslib";
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
let CdkDialogContainer = /** @class */ (() => {
    let CdkDialogContainer = class CdkDialogContainer extends BasePortalOutlet {
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
    };
    __decorate([
        HostBinding('attr.aria-label'),
        __metadata("design:type", Object),
        __metadata("design:paramtypes", [])
    ], CdkDialogContainer.prototype, "_ariaLabel", null);
    __decorate([
        HostBinding('attr.aria-describedby'),
        __metadata("design:type", Object),
        __metadata("design:paramtypes", [])
    ], CdkDialogContainer.prototype, "_ariaDescribedBy", null);
    __decorate([
        HostBinding('attr.role'),
        __metadata("design:type", Object),
        __metadata("design:paramtypes", [])
    ], CdkDialogContainer.prototype, "_role", null);
    __decorate([
        HostBinding('attr.aria-modal'),
        __metadata("design:type", Boolean)
    ], CdkDialogContainer.prototype, "_ariaModal", void 0);
    __decorate([
        HostBinding('attr.tabindex'),
        __metadata("design:type", Object),
        __metadata("design:paramtypes", [])
    ], CdkDialogContainer.prototype, "_tabindex", null);
    __decorate([
        ViewChild(CdkPortalOutlet, { static: true }),
        __metadata("design:type", CdkPortalOutlet)
    ], CdkDialogContainer.prototype, "_portalHost", void 0);
    CdkDialogContainer = __decorate([
        Component({
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
        }),
        __param(3, Optional()), __param(3, Inject(DOCUMENT)),
        __metadata("design:paramtypes", [ElementRef,
            FocusTrapFactory,
            ChangeDetectorRef, Object, DialogConfig])
    ], CdkDialogContainer);
    return CdkDialogContainer;
})();
export { CdkDialogContainer };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhbG9nLWNvbnRhaW5lci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL2RpYWxvZy9kaWFsb2ctY29udGFpbmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFFSCxPQUFPLEVBQUMsT0FBTyxFQUFrQixLQUFLLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxPQUFPLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUMvRixPQUFPLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUNuRCxPQUFPLEVBQ0wsZ0JBQWdCLEVBRWhCLGVBQWUsR0FHaEIsTUFBTSxxQkFBcUIsQ0FBQztBQUM3QixPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDekMsT0FBTyxFQUNMLHVCQUF1QixFQUN2QixpQkFBaUIsRUFDakIsU0FBUyxFQUVULFVBQVUsRUFFVixXQUFXLEVBQ1gsTUFBTSxFQUVOLFFBQVEsRUFDUixTQUFTLEVBQ1QsaUJBQWlCLEdBQ2xCLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBQyxPQUFPLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDN0IsT0FBTyxFQUFDLG9CQUFvQixFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDcEQsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBRzdDLE1BQU0sVUFBVSxzQ0FBc0M7SUFDcEQsTUFBTSxLQUFLLENBQUMsdUVBQXVFLENBQUMsQ0FBQztBQUN2RixDQUFDO0FBR0Q7OztHQUdHO0FBNkJIO0lBQUEsSUFBYSxrQkFBa0IsR0FBL0IsTUFBYSxrQkFBbUIsU0FBUSxnQkFBZ0I7UUE4Q3RELFlBQ1UsV0FBb0MsRUFDcEMsaUJBQW1DLEVBQ25DLGtCQUFxQyxFQUNmLFNBQWM7UUFDNUMsZ0NBQWdDO1FBQ3pCLE9BQXFCO1lBQzVCLEtBQUssRUFBRSxDQUFD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QjtRQUEzQyxTQUFTLENBQUMsZUFBZSxFQUFFLEVBQUMsTUFBTSxFQUFFLElBQUksRUFBQyxDQUFDO2tDQUFjLGVBQWU7MkRBQUM7SUE3QjlELGtCQUFrQjtRQTVCOUIsU0FBUyxDQUFDO1lBQ1QsUUFBUSxFQUFFLHNCQUFzQjtZQUNoQyx5REFBc0M7WUFFdEMsYUFBYSxFQUFFLGlCQUFpQixDQUFDLElBQUk7WUFDckMsOEZBQThGO1lBQzlGLCtDQUErQztZQUMvQyxlQUFlLEVBQUUsdUJBQXVCLENBQUMsT0FBTztZQUNoRCxVQUFVLEVBQUU7Z0JBQ1YsT0FBTyxDQUFDLFFBQVEsRUFBRTtvQkFDaEIsS0FBSyxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsRUFBQyxPQUFPLEVBQUUsQ0FBQyxFQUFDLENBQUMsQ0FBQztvQkFDbkMsS0FBSyxDQUFDLFlBQVksRUFBRSxLQUFLLENBQUMsRUFBQyxPQUFPLEVBQUUsQ0FBQyxFQUFDLENBQUMsQ0FBQztvQkFDeEMsVUFBVSxDQUFDLFlBQVksRUFBRSxPQUFPLENBQUMsNEJBQTRCLENBQUMsQ0FBQztvQkFDL0QsVUFBVSxDQUFDLHNCQUFzQixFQUFFLE9BQU8sQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO2lCQUN6RSxDQUFDO2FBQ0g7WUFDRCxJQUFJLEVBQUU7Z0JBQ0osV0FBVyxFQUFFOzs7Ozs7TUFNWDtnQkFDRixpQkFBaUIsRUFBRSwyQkFBMkI7Z0JBQzlDLGdCQUFnQixFQUFFLDZCQUE2QjthQUNoRDs7U0FDRixDQUFDO1FBbURHLFdBQUEsUUFBUSxFQUFFLENBQUEsRUFBRSxXQUFBLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQTt5Q0FIUixVQUFVO1lBQ0osZ0JBQWdCO1lBQ2YsaUJBQWlCLFVBRzdCLFlBQVk7T0FwRG5CLGtCQUFrQixDQWdOOUI7SUFBRCx5QkFBQztLQUFBO1NBaE5ZLGtCQUFrQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2FuaW1hdGUsIEFuaW1hdGlvbkV2ZW50LCBzdGF0ZSwgc3R5bGUsIHRyYW5zaXRpb24sIHRyaWdnZXJ9IGZyb20gJ0Bhbmd1bGFyL2FuaW1hdGlvbnMnO1xuaW1wb3J0IHtGb2N1c1RyYXBGYWN0b3J5fSBmcm9tICdAYW5ndWxhci9jZGsvYTExeSc7XG5pbXBvcnQge1xuICBCYXNlUG9ydGFsT3V0bGV0LFxuICBDb21wb25lbnRQb3J0YWwsXG4gIENka1BvcnRhbE91dGxldCxcbiAgVGVtcGxhdGVQb3J0YWwsXG4gIERvbVBvcnRhbCxcbn0gZnJvbSAnQGFuZ3VsYXIvY2RrL3BvcnRhbCc7XG5pbXBvcnQge0RPQ1VNRU5UfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHtcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gIENoYW5nZURldGVjdG9yUmVmLFxuICBDb21wb25lbnQsXG4gIENvbXBvbmVudFJlZixcbiAgRWxlbWVudFJlZixcbiAgRW1iZWRkZWRWaWV3UmVmLFxuICBIb3N0QmluZGluZyxcbiAgSW5qZWN0LFxuICBPbkRlc3Ryb3ksXG4gIE9wdGlvbmFsLFxuICBWaWV3Q2hpbGQsXG4gIFZpZXdFbmNhcHN1bGF0aW9uLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7U3ViamVjdH0gZnJvbSAncnhqcyc7XG5pbXBvcnQge2Rpc3RpbmN0VW50aWxDaGFuZ2VkfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5pbXBvcnQge0RpYWxvZ0NvbmZpZ30gZnJvbSAnLi9kaWFsb2ctY29uZmlnJztcblxuXG5leHBvcnQgZnVuY3Rpb24gdGhyb3dEaWFsb2dDb250ZW50QWxyZWFkeUF0dGFjaGVkRXJyb3IoKSB7XG4gIHRocm93IEVycm9yKCdBdHRlbXB0aW5nIHRvIGF0dGFjaCBkaWFsb2cgY29udGVudCBhZnRlciBjb250ZW50IGlzIGFscmVhZHkgYXR0YWNoZWQnKTtcbn1cblxuXG4vKipcbiAqIEludGVybmFsIGNvbXBvbmVudCB0aGF0IHdyYXBzIHVzZXItcHJvdmlkZWQgZGlhbG9nIGNvbnRlbnQuXG4gKiBAZG9jcy1wcml2YXRlXG4gKi9cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2Nkay1kaWFsb2ctY29udGFpbmVyJyxcbiAgdGVtcGxhdGVVcmw6ICcuL2RpYWxvZy1jb250YWluZXIuaHRtbCcsXG4gIHN0eWxlVXJsczogWydkaWFsb2ctY29udGFpbmVyLmNzcyddLFxuICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lLFxuICAvLyBVc2luZyBPblB1c2ggZm9yIGRpYWxvZ3MgY2F1c2VkIHNvbWUgRzMgc3luYyBpc3N1ZXMuIERpc2FibGVkIHVudGlsIHdlIGNhbiB0cmFjayB0aGVtIGRvd24uXG4gIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTp2YWxpZGF0ZS1kZWNvcmF0b3JzXG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuRGVmYXVsdCxcbiAgYW5pbWF0aW9uczogW1xuICAgIHRyaWdnZXIoJ2RpYWxvZycsIFtcbiAgICAgIHN0YXRlKCdlbnRlcicsIHN0eWxlKHtvcGFjaXR5OiAxfSkpLFxuICAgICAgc3RhdGUoJ2V4aXQsIHZvaWQnLCBzdHlsZSh7b3BhY2l0eTogMH0pKSxcbiAgICAgIHRyYW5zaXRpb24oJyogPT4gZW50ZXInLCBhbmltYXRlKCd7e2VudGVyQW5pbWF0aW9uRHVyYXRpb259fScpKSxcbiAgICAgIHRyYW5zaXRpb24oJyogPT4gZXhpdCwgKiA9PiB2b2lkJywgYW5pbWF0ZSgne3tleGl0QW5pbWF0aW9uRHVyYXRpb259fScpKSxcbiAgICBdKVxuICBdLFxuICBob3N0OiB7XG4gICAgJ1tAZGlhbG9nXSc6IGB7XG4gICAgICB2YWx1ZTogX3N0YXRlLFxuICAgICAgcGFyYW1zOiB7XG4gICAgICAgIGVudGVyQW5pbWF0aW9uRHVyYXRpb246IF9jb25maWcuZW50ZXJBbmltYXRpb25EdXJhdGlvbixcbiAgICAgICAgZXhpdEFuaW1hdGlvbkR1cmF0aW9uOiBfY29uZmlnLmV4aXRBbmltYXRpb25EdXJhdGlvblxuICAgICAgfVxuICAgIH1gLFxuICAgICcoQGRpYWxvZy5zdGFydCknOiAnX29uQW5pbWF0aW9uU3RhcnQoJGV2ZW50KScsXG4gICAgJyhAZGlhbG9nLmRvbmUpJzogJ19hbmltYXRpb25Eb25lLm5leHQoJGV2ZW50KScsXG4gIH0sXG59KVxuZXhwb3J0IGNsYXNzIENka0RpYWxvZ0NvbnRhaW5lciBleHRlbmRzIEJhc2VQb3J0YWxPdXRsZXQgaW1wbGVtZW50cyBPbkRlc3Ryb3kge1xuICBwcml2YXRlIHJlYWRvbmx5IF9kb2N1bWVudDogRG9jdW1lbnQ7XG5cbiAgLyoqIFN0YXRlIG9mIHRoZSBkaWFsb2cgYW5pbWF0aW9uLiAqL1xuICBfc3RhdGU6ICd2b2lkJyB8ICdlbnRlcicgfCAnZXhpdCcgPSAnZW50ZXInO1xuXG4gIC8qKiBFbGVtZW50IHRoYXQgd2FzIGZvY3VzZWQgYmVmb3JlIHRoZSBkaWFsb2cgd2FzIG9wZW5lZC4gU2F2ZSB0aGlzIHRvIHJlc3RvcmUgdXBvbiBjbG9zZS4gKi9cbiAgcHJpdmF0ZSBfZWxlbWVudEZvY3VzZWRCZWZvcmVEaWFsb2dXYXNPcGVuZWQ6IEhUTUxFbGVtZW50IHwgbnVsbCA9IG51bGw7XG5cbiAgIC8qKiBUaGUgY2xhc3MgdGhhdCB0cmFwcyBhbmQgbWFuYWdlcyBmb2N1cyB3aXRoaW4gdGhlIGRpYWxvZy4gKi9cbiAgcHJpdmF0ZSBfZm9jdXNUcmFwID0gdGhpcy5fZm9jdXNUcmFwRmFjdG9yeS5jcmVhdGUodGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50KTtcblxuICAvLyBASG9zdEJpbmRpbmcgaXMgdXNlZCBpbiB0aGUgY2xhc3MgYXMgaXQgaXMgZXhwZWN0ZWQgdG8gYmUgZXh0ZW5kZWQuIFNpbmNlIEBDb21wb25lbnQgZGVjb3JhdG9yXG4gIC8vIG1ldGFkYXRhIGlzIG5vdCBpbmhlcml0ZWQgYnkgY2hpbGQgY2xhc3NlcywgaW5zdGVhZCB0aGUgaG9zdCBiaW5kaW5nIGRhdGEgaXMgZGVmaW5lZCBpbiBhIHdheVxuICAvLyB0aGF0IGNhbiBiZSBpbmhlcml0ZWQuXG4gIC8vIHRzbGludDpkaXNhYmxlOm5vLWhvc3QtZGVjb3JhdG9yLWluLWNvbmNyZXRlXG4gIEBIb3N0QmluZGluZygnYXR0ci5hcmlhLWxhYmVsJykgZ2V0IF9hcmlhTGFiZWwoKSB7IHJldHVybiB0aGlzLl9jb25maWcuYXJpYUxhYmVsIHx8IG51bGw7IH1cblxuICBASG9zdEJpbmRpbmcoJ2F0dHIuYXJpYS1kZXNjcmliZWRieScpXG4gIGdldCBfYXJpYURlc2NyaWJlZEJ5KCkgeyByZXR1cm4gdGhpcy5fY29uZmlnLmFyaWFEZXNjcmliZWRCeTsgfVxuXG4gIEBIb3N0QmluZGluZygnYXR0ci5yb2xlJykgZ2V0IF9yb2xlKCkgeyByZXR1cm4gdGhpcy5fY29uZmlnLnJvbGU7IH1cblxuICBASG9zdEJpbmRpbmcoJ2F0dHIuYXJpYS1tb2RhbCcpIF9hcmlhTW9kYWw6IGJvb2xlYW4gPSB0cnVlO1xuXG4gIEBIb3N0QmluZGluZygnYXR0ci50YWJpbmRleCcpIGdldCBfdGFiaW5kZXgoKSB7IHJldHVybiAtMTsgfVxuICAvLyB0c2xpbnQ6ZGlzYWJsZTpuby1ob3N0LWRlY29yYXRvci1pbi1jb25jcmV0ZVxuXG4gIC8qKiBUaGUgcG9ydGFsIGhvc3QgaW5zaWRlIG9mIHRoaXMgY29udGFpbmVyIGludG8gd2hpY2ggdGhlIGRpYWxvZyBjb250ZW50IHdpbGwgYmUgbG9hZGVkLiAqL1xuICBAVmlld0NoaWxkKENka1BvcnRhbE91dGxldCwge3N0YXRpYzogdHJ1ZX0pIF9wb3J0YWxIb3N0OiBDZGtQb3J0YWxPdXRsZXQ7XG5cbiAgLyoqIEEgc3ViamVjdCBlbWl0dGluZyBiZWZvcmUgdGhlIGRpYWxvZyBlbnRlcnMgdGhlIHZpZXcuICovXG4gIF9iZWZvcmVFbnRlcjogU3ViamVjdDx2b2lkPiA9IG5ldyBTdWJqZWN0KCk7XG5cbiAgLyoqIEEgc3ViamVjdCBlbWl0dGluZyBhZnRlciB0aGUgZGlhbG9nIGVudGVycyB0aGUgdmlldy4gKi9cbiAgX2FmdGVyRW50ZXI6IFN1YmplY3Q8dm9pZD4gPSBuZXcgU3ViamVjdCgpO1xuXG4gIC8qKiBBIHN1YmplY3QgZW1pdHRpbmcgYmVmb3JlIHRoZSBkaWFsb2cgZXhpdHMgdGhlIHZpZXcuICovXG4gIF9iZWZvcmVFeGl0OiBTdWJqZWN0PHZvaWQ+ID0gbmV3IFN1YmplY3QoKTtcblxuICAvKiogQSBzdWJqZWN0IGVtaXR0aW5nIGFmdGVyIHRoZSBkaWFsb2cgZXhpdHMgdGhlIHZpZXcuICovXG4gIF9hZnRlckV4aXQ6IFN1YmplY3Q8dm9pZD4gPSBuZXcgU3ViamVjdCgpO1xuXG4gIC8qKiBTdHJlYW0gb2YgYW5pbWF0aW9uIGBkb25lYCBldmVudHMuICovXG4gIF9hbmltYXRpb25Eb25lID0gbmV3IFN1YmplY3Q8QW5pbWF0aW9uRXZlbnQ+KCk7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBfZWxlbWVudFJlZjogRWxlbWVudFJlZjxIVE1MRWxlbWVudD4sXG4gICAgcHJpdmF0ZSBfZm9jdXNUcmFwRmFjdG9yeTogRm9jdXNUcmFwRmFjdG9yeSxcbiAgICBwcml2YXRlIF9jaGFuZ2VEZXRlY3RvclJlZjogQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gICAgQE9wdGlvbmFsKCkgQEluamVjdChET0NVTUVOVCkgX2RvY3VtZW50OiBhbnksXG4gICAgLyoqIFRoZSBkaWFsb2cgY29uZmlndXJhdGlvbi4gKi9cbiAgICBwdWJsaWMgX2NvbmZpZzogRGlhbG9nQ29uZmlnKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuX2RvY3VtZW50ID0gX2RvY3VtZW50O1xuXG4gICAgLy8gV2UgdXNlIGEgU3ViamVjdCB3aXRoIGEgZGlzdGluY3RVbnRpbENoYW5nZWQsIHJhdGhlciB0aGFuIGEgY2FsbGJhY2sgYXR0YWNoZWQgdG8gLmRvbmUsXG4gICAgLy8gYmVjYXVzZSBzb21lIGJyb3dzZXJzIGZpcmUgdGhlIGRvbmUgZXZlbnQgdHdpY2UgYW5kIHdlIGRvbid0IHdhbnQgdG8gZW1pdCBkdXBsaWNhdGUgZXZlbnRzLlxuICAgIC8vIFNlZTogaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci9pc3N1ZXMvMjQwODRcbiAgICB0aGlzLl9hbmltYXRpb25Eb25lLnBpcGUoZGlzdGluY3RVbnRpbENoYW5nZWQoKHgsIHkpID0+IHtcbiAgICAgIHJldHVybiB4LmZyb21TdGF0ZSA9PT0geS5mcm9tU3RhdGUgJiYgeC50b1N0YXRlID09PSB5LnRvU3RhdGU7XG4gICAgfSkpLnN1YnNjcmliZShldmVudCA9PiB7XG4gICAgICAvLyBFbWl0IGxpZmVjeWNsZSBldmVudHMgYmFzZWQgb24gYW5pbWF0aW9uIGBkb25lYCBjYWxsYmFjay5cbiAgICAgIGlmIChldmVudC50b1N0YXRlID09PSAnZW50ZXInKSB7XG4gICAgICAgIHRoaXMuX2F1dG9Gb2N1c0ZpcnN0VGFiYmFibGVFbGVtZW50KCk7XG4gICAgICAgIHRoaXMuX2FmdGVyRW50ZXIubmV4dCgpO1xuICAgICAgICB0aGlzLl9hZnRlckVudGVyLmNvbXBsZXRlKCk7XG4gICAgICB9XG5cbiAgICAgIGlmIChldmVudC5mcm9tU3RhdGUgPT09ICdlbnRlcicgJiYgKGV2ZW50LnRvU3RhdGUgPT09ICd2b2lkJyB8fCBldmVudC50b1N0YXRlID09PSAnZXhpdCcpKSB7XG4gICAgICAgIHRoaXMuX3JldHVybkZvY3VzQWZ0ZXJEaWFsb2coKTtcbiAgICAgICAgdGhpcy5fYWZ0ZXJFeGl0Lm5leHQoKTtcbiAgICAgICAgdGhpcy5fYWZ0ZXJFeGl0LmNvbXBsZXRlKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKiogRGVzdHJveSBmb2N1cyB0cmFwIHRvIHBsYWNlIGZvY3VzIGJhY2sgdG8gdGhlIGVsZW1lbnQgZm9jdXNlZCBiZWZvcmUgdGhlIGRpYWxvZyBvcGVuZWQuICovXG4gIG5nT25EZXN0cm95KCkge1xuICAgIHRoaXMuX2ZvY3VzVHJhcC5kZXN0cm95KCk7XG4gICAgdGhpcy5fYW5pbWF0aW9uRG9uZS5jb21wbGV0ZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEF0dGFjaCBhIENvbXBvbmVudFBvcnRhbCBhcyBjb250ZW50IHRvIHRoaXMgZGlhbG9nIGNvbnRhaW5lci5cbiAgICogQHBhcmFtIHBvcnRhbCBQb3J0YWwgdG8gYmUgYXR0YWNoZWQgYXMgdGhlIGRpYWxvZyBjb250ZW50LlxuICAgKi9cbiAgYXR0YWNoQ29tcG9uZW50UG9ydGFsPFQ+KHBvcnRhbDogQ29tcG9uZW50UG9ydGFsPFQ+KTogQ29tcG9uZW50UmVmPFQ+IHtcbiAgICBpZiAodGhpcy5fcG9ydGFsSG9zdC5oYXNBdHRhY2hlZCgpKSB7XG4gICAgICB0aHJvd0RpYWxvZ0NvbnRlbnRBbHJlYWR5QXR0YWNoZWRFcnJvcigpO1xuICAgIH1cblxuICAgIHRoaXMuX3NhdmVQcmV2aW91c2x5Rm9jdXNlZEVsZW1lbnQoKTtcbiAgICByZXR1cm4gdGhpcy5fcG9ydGFsSG9zdC5hdHRhY2hDb21wb25lbnRQb3J0YWwocG9ydGFsKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBdHRhY2ggYSBUZW1wbGF0ZVBvcnRhbCBhcyBjb250ZW50IHRvIHRoaXMgZGlhbG9nIGNvbnRhaW5lci5cbiAgICogQHBhcmFtIHBvcnRhbCBQb3J0YWwgdG8gYmUgYXR0YWNoZWQgYXMgdGhlIGRpYWxvZyBjb250ZW50LlxuICAgKi9cbiAgYXR0YWNoVGVtcGxhdGVQb3J0YWw8Qz4ocG9ydGFsOiBUZW1wbGF0ZVBvcnRhbDxDPik6IEVtYmVkZGVkVmlld1JlZjxDPiB7XG4gICAgaWYgKHRoaXMuX3BvcnRhbEhvc3QuaGFzQXR0YWNoZWQoKSkge1xuICAgICAgdGhyb3dEaWFsb2dDb250ZW50QWxyZWFkeUF0dGFjaGVkRXJyb3IoKTtcbiAgICB9XG5cbiAgICB0aGlzLl9zYXZlUHJldmlvdXNseUZvY3VzZWRFbGVtZW50KCk7XG4gICAgcmV0dXJuIHRoaXMuX3BvcnRhbEhvc3QuYXR0YWNoVGVtcGxhdGVQb3J0YWwocG9ydGFsKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBdHRhY2hlcyBhIERPTSBwb3J0YWwgdG8gdGhlIGRpYWxvZyBjb250YWluZXIuXG4gICAqIEBwYXJhbSBwb3J0YWwgUG9ydGFsIHRvIGJlIGF0dGFjaGVkLlxuICAgKiBAZGVwcmVjYXRlZCBUbyBiZSB0dXJuZWQgaW50byBhIG1ldGhvZC5cbiAgICogQGJyZWFraW5nLWNoYW5nZSAxMC4wLjBcbiAgICovXG4gIGF0dGFjaERvbVBvcnRhbCA9IChwb3J0YWw6IERvbVBvcnRhbCkgPT4ge1xuICAgIGlmICh0aGlzLl9wb3J0YWxIb3N0Lmhhc0F0dGFjaGVkKCkpIHtcbiAgICAgIHRocm93RGlhbG9nQ29udGVudEFscmVhZHlBdHRhY2hlZEVycm9yKCk7XG4gICAgfVxuXG4gICAgdGhpcy5fc2F2ZVByZXZpb3VzbHlGb2N1c2VkRWxlbWVudCgpO1xuICAgIHJldHVybiB0aGlzLl9wb3J0YWxIb3N0LmF0dGFjaERvbVBvcnRhbChwb3J0YWwpO1xuICB9XG5cbiAgLyoqIEVtaXQgbGlmZWN5Y2xlIGV2ZW50cyBiYXNlZCBvbiBhbmltYXRpb24gYHN0YXJ0YCBjYWxsYmFjay4gKi9cbiAgX29uQW5pbWF0aW9uU3RhcnQoZXZlbnQ6IEFuaW1hdGlvbkV2ZW50KSB7XG4gICAgaWYgKGV2ZW50LnRvU3RhdGUgPT09ICdlbnRlcicpIHtcbiAgICAgIHRoaXMuX2JlZm9yZUVudGVyLm5leHQoKTtcbiAgICAgIHRoaXMuX2JlZm9yZUVudGVyLmNvbXBsZXRlKCk7XG4gICAgfVxuICAgIGlmIChldmVudC5mcm9tU3RhdGUgPT09ICdlbnRlcicgJiYgKGV2ZW50LnRvU3RhdGUgPT09ICd2b2lkJyB8fCBldmVudC50b1N0YXRlID09PSAnZXhpdCcpKSB7XG4gICAgICB0aGlzLl9iZWZvcmVFeGl0Lm5leHQoKTtcbiAgICAgIHRoaXMuX2JlZm9yZUV4aXQuY29tcGxldGUoKTtcbiAgICB9XG4gIH1cblxuICAvKiogU3RhcnRzIHRoZSBkaWFsb2cgZXhpdCBhbmltYXRpb24uICovXG4gIF9zdGFydEV4aXRpbmcoKTogdm9pZCB7XG4gICAgdGhpcy5fc3RhdGUgPSAnZXhpdCc7XG5cbiAgICAvLyBNYXJrIHRoZSBjb250YWluZXIgZm9yIGNoZWNrIHNvIGl0IGNhbiByZWFjdCBpZiB0aGVcbiAgICAvLyB2aWV3IGNvbnRhaW5lciBpcyB1c2luZyBPblB1c2ggY2hhbmdlIGRldGVjdGlvbi5cbiAgICB0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZi5tYXJrRm9yQ2hlY2soKTtcbiAgfVxuXG4gIC8qKiBTYXZlcyBhIHJlZmVyZW5jZSB0byB0aGUgZWxlbWVudCB0aGF0IHdhcyBmb2N1c2VkIGJlZm9yZSB0aGUgZGlhbG9nIHdhcyBvcGVuZWQuICovXG4gIHByaXZhdGUgX3NhdmVQcmV2aW91c2x5Rm9jdXNlZEVsZW1lbnQoKSB7XG4gICAgaWYgKHRoaXMuX2RvY3VtZW50KSB7XG4gICAgICB0aGlzLl9lbGVtZW50Rm9jdXNlZEJlZm9yZURpYWxvZ1dhc09wZW5lZCA9IHRoaXMuX2RvY3VtZW50LmFjdGl2ZUVsZW1lbnQgYXMgSFRNTEVsZW1lbnQ7XG5cbiAgICAgIC8vIE1vdmUgZm9jdXMgb250byB0aGUgZGlhbG9nIGltbWVkaWF0ZWx5IGluIG9yZGVyIHRvIHByZXZlbnQgdGhlIHVzZXIgZnJvbSBhY2NpZGVudGFsbHlcbiAgICAgIC8vIG9wZW5pbmcgbXVsdGlwbGUgZGlhbG9ncyBhdCB0aGUgc2FtZSB0aW1lLiBOZWVkcyB0byBiZSBhc3luYywgYmVjYXVzZSB0aGUgZWxlbWVudFxuICAgICAgLy8gbWF5IG5vdCBiZSBmb2N1c2FibGUgaW1tZWRpYXRlbHkuXG4gICAgICBQcm9taXNlLnJlc29sdmUoKS50aGVuKCgpID0+IHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5mb2N1cygpKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQXV0b2ZvY3VzIHRoZSBmaXJzdCB0YWJiYWJsZSBlbGVtZW50IGluc2lkZSBvZiB0aGUgZGlhbG9nLCBpZiB0aGVyZSBpcyBub3QgYSB0YWJiYWJsZSBlbGVtZW50LFxuICAgKiBmb2N1cyB0aGUgZGlhbG9nIGluc3RlYWQuXG4gICAqL1xuICBwcml2YXRlIF9hdXRvRm9jdXNGaXJzdFRhYmJhYmxlRWxlbWVudCgpIHtcbiAgICBjb25zdCBlbGVtZW50ID0gdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50O1xuXG4gICAgLy8gSWYgd2VyZSB0byBhdHRlbXB0IHRvIGZvY3VzIGltbWVkaWF0ZWx5LCB0aGVuIHRoZSBjb250ZW50IG9mIHRoZSBkaWFsb2cgd291bGQgbm90IHlldCBiZVxuICAgIC8vIHJlYWR5IGluIGluc3RhbmNlcyB3aGVyZSBjaGFuZ2UgZGV0ZWN0aW9uIGhhcyB0byBydW4gZmlyc3QuIFRvIGRlYWwgd2l0aCB0aGlzLCB3ZSBzaW1wbHlcbiAgICAvLyB3YWl0IGZvciB0aGUgbWljcm90YXNrIHF1ZXVlIHRvIGJlIGVtcHR5LlxuICAgIGlmICh0aGlzLl9jb25maWcuYXV0b0ZvY3VzKSB7XG4gICAgICB0aGlzLl9mb2N1c1RyYXAuZm9jdXNJbml0aWFsRWxlbWVudFdoZW5SZWFkeSgpLnRoZW4oaGFzTW92ZWRGb2N1cyA9PiB7XG4gICAgICAgIC8vIElmIHdlIGRpZG4ndCBmaW5kIGFueSBmb2N1c2FibGUgZWxlbWVudHMgaW5zaWRlIHRoZSBkaWFsb2csIGZvY3VzIHRoZVxuICAgICAgICAvLyBjb250YWluZXIgc28gdGhlIHVzZXIgY2FuJ3QgdGFiIGludG8gb3RoZXIgZWxlbWVudHMgYmVoaW5kIGl0LlxuICAgICAgICBpZiAoIWhhc01vdmVkRm9jdXMpIHtcbiAgICAgICAgICBlbGVtZW50LmZvY3VzKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBhY3RpdmVFbGVtZW50ID0gdGhpcy5fZG9jdW1lbnQuYWN0aXZlRWxlbWVudDtcblxuICAgICAgLy8gT3RoZXJ3aXNlIGVuc3VyZSB0aGF0IGZvY3VzIGlzIG9uIHRoZSBkaWFsb2cgY29udGFpbmVyLiBJdCdzIHBvc3NpYmxlIHRoYXQgYSBkaWZmZXJlbnRcbiAgICAgIC8vIGNvbXBvbmVudCB0cmllZCB0byBtb3ZlIGZvY3VzIHdoaWxlIHRoZSBvcGVuIGFuaW1hdGlvbiB3YXMgcnVubmluZy4gU2VlOlxuICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvY29tcG9uZW50cy9pc3N1ZXMvMTYyMTUuIE5vdGUgdGhhdCB3ZSBvbmx5IHdhbnQgdG8gZG8gdGhpc1xuICAgICAgLy8gaWYgdGhlIGZvY3VzIGlzbid0IGluc2lkZSB0aGUgZGlhbG9nIGFscmVhZHksIGJlY2F1c2UgaXQncyBwb3NzaWJsZSB0aGF0IHRoZSBjb25zdW1lclxuICAgICAgLy8gdHVybmVkIG9mZiBgYXV0b0ZvY3VzYCBpbiBvcmRlciB0byBtb3ZlIGZvY3VzIHRoZW1zZWx2ZXMuXG4gICAgICBpZiAoYWN0aXZlRWxlbWVudCAhPT0gZWxlbWVudCAmJiAhZWxlbWVudC5jb250YWlucyhhY3RpdmVFbGVtZW50KSkge1xuICAgICAgICBlbGVtZW50LmZvY3VzKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqIFJldHVybnMgdGhlIGZvY3VzIHRvIHRoZSBlbGVtZW50IGZvY3VzZWQgYmVmb3JlIHRoZSBkaWFsb2cgd2FzIG9wZW4uICovXG4gIHByaXZhdGUgX3JldHVybkZvY3VzQWZ0ZXJEaWFsb2coKSB7XG4gICAgY29uc3QgdG9Gb2N1cyA9IHRoaXMuX2VsZW1lbnRGb2N1c2VkQmVmb3JlRGlhbG9nV2FzT3BlbmVkO1xuICAgIC8vIFdlIG5lZWQgdGhlIGV4dHJhIGNoZWNrLCBiZWNhdXNlIElFIGNhbiBzZXQgdGhlIGBhY3RpdmVFbGVtZW50YCB0byBudWxsIGluIHNvbWUgY2FzZXMuXG4gICAgaWYgKHRvRm9jdXMgJiYgdHlwZW9mIHRvRm9jdXMuZm9jdXMgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGNvbnN0IGFjdGl2ZUVsZW1lbnQgPSB0aGlzLl9kb2N1bWVudC5hY3RpdmVFbGVtZW50O1xuICAgICAgY29uc3QgZWxlbWVudCA9IHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudDtcblxuICAgICAgLy8gTWFrZSBzdXJlIHRoYXQgZm9jdXMgaXMgc3RpbGwgaW5zaWRlIHRoZSBkaWFsb2cgb3IgaXMgb24gdGhlIGJvZHkgKHVzdWFsbHkgYmVjYXVzZSBhXG4gICAgICAvLyBub24tZm9jdXNhYmxlIGVsZW1lbnQgbGlrZSB0aGUgYmFja2Ryb3Agd2FzIGNsaWNrZWQpIGJlZm9yZSBtb3ZpbmcgaXQuIEl0J3MgcG9zc2libGUgdGhhdFxuICAgICAgLy8gdGhlIGNvbnN1bWVyIG1vdmVkIGl0IHRoZW1zZWx2ZXMgYmVmb3JlIHRoZSBhbmltYXRpb24gd2FzIGRvbmUsIGluIHdoaWNoIGNhc2Ugd2Ugc2hvdWxkbid0XG4gICAgICAvLyBkbyBhbnl0aGluZy5cbiAgICAgIGlmICghYWN0aXZlRWxlbWVudCB8fCBhY3RpdmVFbGVtZW50ID09PSB0aGlzLl9kb2N1bWVudC5ib2R5IHx8IGFjdGl2ZUVsZW1lbnQgPT09IGVsZW1lbnQgfHxcbiAgICAgICAgZWxlbWVudC5jb250YWlucyhhY3RpdmVFbGVtZW50KSkge1xuICAgICAgICB0b0ZvY3VzLmZvY3VzKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iXX0=