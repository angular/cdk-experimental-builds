/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __decorate, __metadata } from "tslib";
import { Subject } from 'rxjs';
import { Directive, ElementRef, EventEmitter, Input, HostListener, } from '@angular/core';
import { hasModifierKey } from '@angular/cdk/keycodes';
import { EDIT_PANE_SELECTOR } from './constants';
import { closest } from './polyfill';
import { EditRef } from './edit-ref';
/**
 * A directive that attaches to a form within the edit lens.
 * It coordinates the form state with the table-wide edit system and handles
 * closing the edit lens when the form is submitted or the user clicks
 * out.
 */
let CdkEditControl = /** @class */ (() => {
    let CdkEditControl = class CdkEditControl {
        constructor(elementRef, editRef) {
            this.elementRef = elementRef;
            this.editRef = editRef;
            this.destroyed = new Subject();
            /**
             * Specifies what should happen when the user clicks outside of the edit lens.
             * The default behavior is to close the lens without submitting the form.
             */
            this.clickOutBehavior = 'close';
            this.preservedFormValueChange = new EventEmitter();
            /**
             * Determines whether the lens will close on form submit if the form is not in a valid
             * state. By default the lens will remain open.
             */
            this.ignoreSubmitUnlessValid = true;
        }
        ngOnInit() {
            this.editRef.init(this.preservedFormValue);
            this.editRef.finalValue.subscribe(this.preservedFormValueChange);
            this.editRef.blurred.subscribe(() => this._handleBlur());
        }
        ngOnDestroy() {
            this.destroyed.next();
            this.destroyed.complete();
        }
        /**
         * Called when the form submits. If ignoreSubmitUnlessValid is true, checks
         * the form for validity before proceeding.
         * Updates the revert state with the latest submitted value then closes the edit.
         */
        // In Ivy the `host` metadata will be merged, whereas in ViewEngine it is overridden. In order
        // to avoid double event listeners, we need to use `HostListener`. Once Ivy is the default, we
        // can move this back into `host`.
        // tslint:disable:no-host-decorator-in-concrete
        handleFormSubmit() {
            if (this.ignoreSubmitUnlessValid && !this.editRef.isValid()) {
                return;
            }
            this.editRef.updateRevertValue();
            this.editRef.close();
        }
        /** Called on Escape keyup. Closes the edit. */
        close() {
            // todo - allow this behavior to be customized as well, such as calling
            // reset before close
            this.editRef.close();
        }
        /**
         * Called on click anywhere in the document.
         * If the click was outside of the lens, trigger the specified click out behavior.
         */
        // In Ivy the `host` metadata will be merged, whereas in ViewEngine it is overridden. In order
        // to avoid double event listeners, we need to use `HostListener`. Once Ivy is the default, we
        // can move this back into `host`.
        // tslint:disable:no-host-decorator-in-concrete
        handlePossibleClickOut(evt) {
            if (closest(evt.target, EDIT_PANE_SELECTOR)) {
                return;
            }
            switch (this.clickOutBehavior) {
                case 'submit':
                    // Manually cause the form to submit before closing.
                    this._triggerFormSubmit();
                    this.editRef.close();
                    break;
                case 'close':
                    this.editRef.close();
                    break;
                default:
                    break;
            }
        }
        // In Ivy the `host` metadata will be merged, whereas in ViewEngine it is overridden. In order
        // to avoid double event listeners, we need to use `HostListener`. Once Ivy is the default, we
        // can move this back into `host`.
        // tslint:disable:no-host-decorator-in-concrete
        _handleKeydown(event) {
            if (event.key === 'Escape' && !hasModifierKey(event)) {
                this.close();
                event.preventDefault();
            }
        }
        /** Triggers submit on tab out if clickOutBehavior is 'submit'. */
        _handleBlur() {
            if (this.clickOutBehavior === 'submit') {
                // Manually cause the form to submit before closing.
                this._triggerFormSubmit();
            }
        }
        _triggerFormSubmit() {
            this.elementRef.nativeElement.dispatchEvent(new Event('submit'));
        }
    };
    __decorate([
        HostListener('ngSubmit'),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], CdkEditControl.prototype, "handleFormSubmit", null);
    __decorate([
        HostListener('document:click', ['$event']),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Event]),
        __metadata("design:returntype", void 0)
    ], CdkEditControl.prototype, "handlePossibleClickOut", null);
    __decorate([
        HostListener('keydown', ['$event']),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [KeyboardEvent]),
        __metadata("design:returntype", void 0)
    ], CdkEditControl.prototype, "_handleKeydown", null);
    CdkEditControl = __decorate([
        Directive({
            selector: 'form[cdkEditControl]',
            inputs: [
                'clickOutBehavior: cdkEditControlClickOutBehavior',
                'preservedFormValue: cdkEditControlPreservedFormValue',
                'ignoreSubmitUnlessValid: cdkEditControlIgnoreSubmitUnlessValid',
            ],
            outputs: ['preservedFormValueChange: cdkEditControlPreservedFormValueChange'],
            providers: [EditRef],
        }),
        __metadata("design:paramtypes", [ElementRef, EditRef])
    ], CdkEditControl);
    return CdkEditControl;
})();
export { CdkEditControl };
/** Reverts the form to its initial or previously submitted state on click. */
let CdkEditRevert = /** @class */ (() => {
    let CdkEditRevert = class CdkEditRevert {
        constructor(editRef) {
            this.editRef = editRef;
            /** Type of the button. Defaults to `button` to avoid accident form submits. */
            this.type = 'button';
        }
        // In Ivy the `host` metadata will be merged, whereas in ViewEngine it is overridden. In order
        // to avoid double event listeners, we need to use `HostListener`. Once Ivy is the default, we
        // can move this back into `host`.
        // tslint:disable:no-host-decorator-in-concrete
        revertEdit() {
            this.editRef.reset();
        }
    };
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], CdkEditRevert.prototype, "type", void 0);
    __decorate([
        HostListener('click'),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], CdkEditRevert.prototype, "revertEdit", null);
    CdkEditRevert = __decorate([
        Directive({
            selector: 'button[cdkEditRevert]',
            host: {
                'type': 'button',
            }
        }),
        __metadata("design:paramtypes", [EditRef])
    ], CdkEditRevert);
    return CdkEditRevert;
})();
export { CdkEditRevert };
/** Closes the lens on click. */
let CdkEditClose = /** @class */ (() => {
    let CdkEditClose = class CdkEditClose {
        constructor(elementRef, editRef) {
            this.elementRef = elementRef;
            this.editRef = editRef;
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
        closeEdit() {
            // Note that we use `click` here, rather than a keyboard event, because some screen readers
            // will emit a fake click event instead of an enter keyboard event on buttons.
            this.editRef.close();
        }
    };
    __decorate([
        HostListener('click'),
        HostListener('keyup.enter'),
        HostListener('keyup.space'),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], CdkEditClose.prototype, "closeEdit", null);
    CdkEditClose = __decorate([
        Directive({ selector: '[cdkEditClose]' }),
        __metadata("design:paramtypes", [ElementRef,
            EditRef])
    ], CdkEditClose);
    return CdkEditClose;
})();
export { CdkEditClose };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGVucy1kaXJlY3RpdmVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvcG9wb3Zlci1lZGl0L2xlbnMtZGlyZWN0aXZlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7O0FBRUgsT0FBTyxFQUFDLE9BQU8sRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUM3QixPQUFPLEVBQ0wsU0FBUyxFQUNULFVBQVUsRUFDVixZQUFZLEVBR1osS0FBSyxFQUNMLFlBQVksR0FDYixNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDckQsT0FBTyxFQUFDLGtCQUFrQixFQUFDLE1BQU0sYUFBYSxDQUFDO0FBQy9DLE9BQU8sRUFBQyxPQUFPLEVBQUMsTUFBTSxZQUFZLENBQUM7QUFDbkMsT0FBTyxFQUFDLE9BQU8sRUFBQyxNQUFNLFlBQVksQ0FBQztBQUtuQzs7Ozs7R0FLRztBQVdIO0lBQUEsSUFBYSxjQUFjLEdBQTNCLE1BQWEsY0FBYztRQXVCekIsWUFBK0IsVUFBc0IsRUFBVyxPQUEyQjtZQUE1RCxlQUFVLEdBQVYsVUFBVSxDQUFZO1lBQVcsWUFBTyxHQUFQLE9BQU8sQ0FBb0I7WUF0QnhFLGNBQVMsR0FBRyxJQUFJLE9BQU8sRUFBUSxDQUFDO1lBRW5EOzs7ZUFHRztZQUNILHFCQUFnQixHQUFnQyxPQUFPLENBQUM7WUFRL0MsNkJBQXdCLEdBQUcsSUFBSSxZQUFZLEVBQWEsQ0FBQztZQUVsRTs7O2VBR0c7WUFDSCw0QkFBdUIsR0FBRyxJQUFJLENBQUM7UUFFK0QsQ0FBQztRQUUvRixRQUFRO1lBQ04sSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7WUFDM0MsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyx3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LFFBQVEsQ0FBQyxDQUFDO2FBQzlDO1FBQ0gsQ0FBQztRQUVELDhGQUE4RjtRQUM5Riw4RkFBOEY7UUFDOUYsa0NBQWtDO1FBQ2xDLCtDQUErQztRQUkvQyxTQUFTO1lBQ1AsMkZBQTJGO1lBQzNGLDhFQUE4RTtZQUM5RSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ3ZCLENBQUM7S0FDRixDQUFBO0lBTEM7UUFIQyxZQUFZLENBQUMsT0FBTyxDQUFDO1FBQ3JCLFlBQVksQ0FBQyxhQUFhLENBQUM7UUFDM0IsWUFBWSxDQUFDLGFBQWEsQ0FBQzs7OztpREFLM0I7SUF4QlUsWUFBWTtRQUR4QixTQUFTLENBQUMsRUFBQyxRQUFRLEVBQUUsZ0JBQWdCLEVBQUMsQ0FBQzt5Q0FHSCxVQUFVO1lBQ2IsT0FBTztPQUg1QixZQUFZLENBeUJ4QjtJQUFELG1CQUFDO0tBQUE7U0F6QlksWUFBWSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1N1YmplY3R9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHtcbiAgRGlyZWN0aXZlLFxuICBFbGVtZW50UmVmLFxuICBFdmVudEVtaXR0ZXIsXG4gIE9uRGVzdHJveSxcbiAgT25Jbml0LFxuICBJbnB1dCxcbiAgSG9zdExpc3RlbmVyLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7aGFzTW9kaWZpZXJLZXl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9rZXljb2Rlcyc7XG5pbXBvcnQge0VESVRfUEFORV9TRUxFQ1RPUn0gZnJvbSAnLi9jb25zdGFudHMnO1xuaW1wb3J0IHtjbG9zZXN0fSBmcm9tICcuL3BvbHlmaWxsJztcbmltcG9ydCB7RWRpdFJlZn0gZnJvbSAnLi9lZGl0LXJlZic7XG5cbi8qKiBPcHRpb25zIGZvciB3aGF0IGRvIHRvIHdoZW4gdGhlIHVzZXIgY2xpY2tzIG91dHNpZGUgb2YgYW4gZWRpdCBsZW5zLiAqL1xuZXhwb3J0IHR5cGUgUG9wb3ZlckVkaXRDbGlja091dEJlaGF2aW9yID0gJ2Nsb3NlJyB8ICdzdWJtaXQnIHwgJ25vb3AnO1xuXG4vKipcbiAqIEEgZGlyZWN0aXZlIHRoYXQgYXR0YWNoZXMgdG8gYSBmb3JtIHdpdGhpbiB0aGUgZWRpdCBsZW5zLlxuICogSXQgY29vcmRpbmF0ZXMgdGhlIGZvcm0gc3RhdGUgd2l0aCB0aGUgdGFibGUtd2lkZSBlZGl0IHN5c3RlbSBhbmQgaGFuZGxlc1xuICogY2xvc2luZyB0aGUgZWRpdCBsZW5zIHdoZW4gdGhlIGZvcm0gaXMgc3VibWl0dGVkIG9yIHRoZSB1c2VyIGNsaWNrc1xuICogb3V0LlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdmb3JtW2Nka0VkaXRDb250cm9sXScsXG4gIGlucHV0czogW1xuICAgICdjbGlja091dEJlaGF2aW9yOiBjZGtFZGl0Q29udHJvbENsaWNrT3V0QmVoYXZpb3InLFxuICAgICdwcmVzZXJ2ZWRGb3JtVmFsdWU6IGNka0VkaXRDb250cm9sUHJlc2VydmVkRm9ybVZhbHVlJyxcbiAgICAnaWdub3JlU3VibWl0VW5sZXNzVmFsaWQ6IGNka0VkaXRDb250cm9sSWdub3JlU3VibWl0VW5sZXNzVmFsaWQnLFxuICBdLFxuICBvdXRwdXRzOiBbJ3ByZXNlcnZlZEZvcm1WYWx1ZUNoYW5nZTogY2RrRWRpdENvbnRyb2xQcmVzZXJ2ZWRGb3JtVmFsdWVDaGFuZ2UnXSxcbiAgcHJvdmlkZXJzOiBbRWRpdFJlZl0sXG59KVxuZXhwb3J0IGNsYXNzIENka0VkaXRDb250cm9sPEZvcm1WYWx1ZT4gaW1wbGVtZW50cyBPbkRlc3Ryb3ksIE9uSW5pdCB7XG4gIHByb3RlY3RlZCByZWFkb25seSBkZXN0cm95ZWQgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xuXG4gIC8qKlxuICAgKiBTcGVjaWZpZXMgd2hhdCBzaG91bGQgaGFwcGVuIHdoZW4gdGhlIHVzZXIgY2xpY2tzIG91dHNpZGUgb2YgdGhlIGVkaXQgbGVucy5cbiAgICogVGhlIGRlZmF1bHQgYmVoYXZpb3IgaXMgdG8gY2xvc2UgdGhlIGxlbnMgd2l0aG91dCBzdWJtaXR0aW5nIHRoZSBmb3JtLlxuICAgKi9cbiAgY2xpY2tPdXRCZWhhdmlvcjogUG9wb3ZlckVkaXRDbGlja091dEJlaGF2aW9yID0gJ2Nsb3NlJztcblxuICAvKipcbiAgICogQSB0d28td2F5IGJpbmRpbmcgZm9yIHN0b3JpbmcgdW5zdWJtaXR0ZWQgZm9ybSBzdGF0ZS4gSWYgbm90IHByb3ZpZGVkXG4gICAqIHRoZW4gZm9ybSBzdGF0ZSB3aWxsIGJlIGRpc2NhcmRlZCBvbiBjbG9zZS4gVGhlIFBlcmlzdEJ5IGRpcmVjdGl2ZSBpcyBvZmZlcmVkXG4gICAqIGFzIGEgY29udmVuaWVudCBzaG9ydGN1dCBmb3IgdGhlc2UgYmluZGluZ3MuXG4gICAqL1xuICBwcmVzZXJ2ZWRGb3JtVmFsdWU/OiBGb3JtVmFsdWU7XG4gIHJlYWRvbmx5IHByZXNlcnZlZEZvcm1WYWx1ZUNoYW5nZSA9IG5ldyBFdmVudEVtaXR0ZXI8Rm9ybVZhbHVlPigpO1xuXG4gIC8qKlxuICAgKiBEZXRlcm1pbmVzIHdoZXRoZXIgdGhlIGxlbnMgd2lsbCBjbG9zZSBvbiBmb3JtIHN1Ym1pdCBpZiB0aGUgZm9ybSBpcyBub3QgaW4gYSB2YWxpZFxuICAgKiBzdGF0ZS4gQnkgZGVmYXVsdCB0aGUgbGVucyB3aWxsIHJlbWFpbiBvcGVuLlxuICAgKi9cbiAgaWdub3JlU3VibWl0VW5sZXNzVmFsaWQgPSB0cnVlO1xuXG4gIGNvbnN0cnVjdG9yKHByb3RlY3RlZCByZWFkb25seSBlbGVtZW50UmVmOiBFbGVtZW50UmVmLCByZWFkb25seSBlZGl0UmVmOiBFZGl0UmVmPEZvcm1WYWx1ZT4pIHt9XG5cbiAgbmdPbkluaXQoKTogdm9pZCB7XG4gICAgdGhpcy5lZGl0UmVmLmluaXQodGhpcy5wcmVzZXJ2ZWRGb3JtVmFsdWUpO1xuICAgIHRoaXMuZWRpdFJlZi5maW5hbFZhbHVlLnN1YnNjcmliZSh0aGlzLnByZXNlcnZlZEZvcm1WYWx1ZUNoYW5nZSk7XG4gICAgdGhpcy5lZGl0UmVmLmJsdXJyZWQuc3Vic2NyaWJlKCgpID0+IHRoaXMuX2hhbmRsZUJsdXIoKSk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLmRlc3Ryb3llZC5uZXh0KCk7XG4gICAgdGhpcy5kZXN0cm95ZWQuY29tcGxldGUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiB0aGUgZm9ybSBzdWJtaXRzLiBJZiBpZ25vcmVTdWJtaXRVbmxlc3NWYWxpZCBpcyB0cnVlLCBjaGVja3NcbiAgICogdGhlIGZvcm0gZm9yIHZhbGlkaXR5IGJlZm9yZSBwcm9jZWVkaW5nLlxuICAgKiBVcGRhdGVzIHRoZSByZXZlcnQgc3RhdGUgd2l0aCB0aGUgbGF0ZXN0IHN1Ym1pdHRlZCB2YWx1ZSB0aGVuIGNsb3NlcyB0aGUgZWRpdC5cbiAgICovXG4gIC8vIEluIEl2eSB0aGUgYGhvc3RgIG1ldGFkYXRhIHdpbGwgYmUgbWVyZ2VkLCB3aGVyZWFzIGluIFZpZXdFbmdpbmUgaXQgaXMgb3ZlcnJpZGRlbi4gSW4gb3JkZXJcbiAgLy8gdG8gYXZvaWQgZG91YmxlIGV2ZW50IGxpc3RlbmVycywgd2UgbmVlZCB0byB1c2UgYEhvc3RMaXN0ZW5lcmAuIE9uY2UgSXZ5IGlzIHRoZSBkZWZhdWx0LCB3ZVxuICAvLyBjYW4gbW92ZSB0aGlzIGJhY2sgaW50byBgaG9zdGAuXG4gIC8vIHRzbGludDpkaXNhYmxlOm5vLWhvc3QtZGVjb3JhdG9yLWluLWNvbmNyZXRlXG4gIEBIb3N0TGlzdGVuZXIoJ25nU3VibWl0JylcbiAgaGFuZGxlRm9ybVN1Ym1pdCgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5pZ25vcmVTdWJtaXRVbmxlc3NWYWxpZCAmJiAhdGhpcy5lZGl0UmVmLmlzVmFsaWQoKSkgeyByZXR1cm47IH1cblxuICAgIHRoaXMuZWRpdFJlZi51cGRhdGVSZXZlcnRWYWx1ZSgpO1xuICAgIHRoaXMuZWRpdFJlZi5jbG9zZSgpO1xuICB9XG5cbiAgLyoqIENhbGxlZCBvbiBFc2NhcGUga2V5dXAuIENsb3NlcyB0aGUgZWRpdC4gKi9cbiAgY2xvc2UoKTogdm9pZCB7XG4gICAgLy8gdG9kbyAtIGFsbG93IHRoaXMgYmVoYXZpb3IgdG8gYmUgY3VzdG9taXplZCBhcyB3ZWxsLCBzdWNoIGFzIGNhbGxpbmdcbiAgICAvLyByZXNldCBiZWZvcmUgY2xvc2VcbiAgICB0aGlzLmVkaXRSZWYuY2xvc2UoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgb24gY2xpY2sgYW55d2hlcmUgaW4gdGhlIGRvY3VtZW50LlxuICAgKiBJZiB0aGUgY2xpY2sgd2FzIG91dHNpZGUgb2YgdGhlIGxlbnMsIHRyaWdnZXIgdGhlIHNwZWNpZmllZCBjbGljayBvdXQgYmVoYXZpb3IuXG4gICAqL1xuICAvLyBJbiBJdnkgdGhlIGBob3N0YCBtZXRhZGF0YSB3aWxsIGJlIG1lcmdlZCwgd2hlcmVhcyBpbiBWaWV3RW5naW5lIGl0IGlzIG92ZXJyaWRkZW4uIEluIG9yZGVyXG4gIC8vIHRvIGF2b2lkIGRvdWJsZSBldmVudCBsaXN0ZW5lcnMsIHdlIG5lZWQgdG8gdXNlIGBIb3N0TGlzdGVuZXJgLiBPbmNlIEl2eSBpcyB0aGUgZGVmYXVsdCwgd2VcbiAgLy8gY2FuIG1vdmUgdGhpcyBiYWNrIGludG8gYGhvc3RgLlxuICAvLyB0c2xpbnQ6ZGlzYWJsZTpuby1ob3N0LWRlY29yYXRvci1pbi1jb25jcmV0ZVxuICBASG9zdExpc3RlbmVyKCdkb2N1bWVudDpjbGljaycsIFsnJGV2ZW50J10pXG4gIGhhbmRsZVBvc3NpYmxlQ2xpY2tPdXQoZXZ0OiBFdmVudCk6IHZvaWQge1xuICAgIGlmIChjbG9zZXN0KGV2dC50YXJnZXQsIEVESVRfUEFORV9TRUxFQ1RPUikpIHsgcmV0dXJuOyB9XG4gICAgc3dpdGNoICh0aGlzLmNsaWNrT3V0QmVoYXZpb3IpIHtcbiAgICAgIGNhc2UgJ3N1Ym1pdCc6XG4gICAgICAgIC8vIE1hbnVhbGx5IGNhdXNlIHRoZSBmb3JtIHRvIHN1Ym1pdCBiZWZvcmUgY2xvc2luZy5cbiAgICAgICAgdGhpcy5fdHJpZ2dlckZvcm1TdWJtaXQoKTtcbiAgICAgICAgdGhpcy5lZGl0UmVmLmNsb3NlKCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnY2xvc2UnOlxuICAgICAgICB0aGlzLmVkaXRSZWYuY2xvc2UoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICAvLyBJbiBJdnkgdGhlIGBob3N0YCBtZXRhZGF0YSB3aWxsIGJlIG1lcmdlZCwgd2hlcmVhcyBpbiBWaWV3RW5naW5lIGl0IGlzIG92ZXJyaWRkZW4uIEluIG9yZGVyXG4gIC8vIHRvIGF2b2lkIGRvdWJsZSBldmVudCBsaXN0ZW5lcnMsIHdlIG5lZWQgdG8gdXNlIGBIb3N0TGlzdGVuZXJgLiBPbmNlIEl2eSBpcyB0aGUgZGVmYXVsdCwgd2VcbiAgLy8gY2FuIG1vdmUgdGhpcyBiYWNrIGludG8gYGhvc3RgLlxuICAvLyB0c2xpbnQ6ZGlzYWJsZTpuby1ob3N0LWRlY29yYXRvci1pbi1jb25jcmV0ZVxuICBASG9zdExpc3RlbmVyKCdrZXlkb3duJywgWyckZXZlbnQnXSlcbiAgX2hhbmRsZUtleWRvd24oZXZlbnQ6IEtleWJvYXJkRXZlbnQpIHtcbiAgICBpZiAoZXZlbnQua2V5ID09PSAnRXNjYXBlJyAmJiAhaGFzTW9kaWZpZXJLZXkoZXZlbnQpKSB7XG4gICAgICB0aGlzLmNsb3NlKCk7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBUcmlnZ2VycyBzdWJtaXQgb24gdGFiIG91dCBpZiBjbGlja091dEJlaGF2aW9yIGlzICdzdWJtaXQnLiAqL1xuICBwcml2YXRlIF9oYW5kbGVCbHVyKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLmNsaWNrT3V0QmVoYXZpb3IgPT09ICdzdWJtaXQnKSB7XG4gICAgICAvLyBNYW51YWxseSBjYXVzZSB0aGUgZm9ybSB0byBzdWJtaXQgYmVmb3JlIGNsb3NpbmcuXG4gICAgICB0aGlzLl90cmlnZ2VyRm9ybVN1Ym1pdCgpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3RyaWdnZXJGb3JtU3VibWl0KCkge1xuICAgIHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50IS5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnc3VibWl0JykpO1xuICB9XG59XG5cbi8qKiBSZXZlcnRzIHRoZSBmb3JtIHRvIGl0cyBpbml0aWFsIG9yIHByZXZpb3VzbHkgc3VibWl0dGVkIHN0YXRlIG9uIGNsaWNrLiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnYnV0dG9uW2Nka0VkaXRSZXZlcnRdJyxcbiAgaG9zdDoge1xuICAgICd0eXBlJzogJ2J1dHRvbicsIC8vIFByZXZlbnRzIGFjY2lkZW50YWwgZm9ybSBzdWJtaXRzLlxuICB9XG59KVxuZXhwb3J0IGNsYXNzIENka0VkaXRSZXZlcnQ8Rm9ybVZhbHVlPiB7XG4gIC8qKiBUeXBlIG9mIHRoZSBidXR0b24uIERlZmF1bHRzIHRvIGBidXR0b25gIHRvIGF2b2lkIGFjY2lkZW50IGZvcm0gc3VibWl0cy4gKi9cbiAgQElucHV0KCkgdHlwZTogc3RyaW5nID0gJ2J1dHRvbic7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgZWRpdFJlZjogRWRpdFJlZjxGb3JtVmFsdWU+KSB7fVxuXG4gIC8vIEluIEl2eSB0aGUgYGhvc3RgIG1ldGFkYXRhIHdpbGwgYmUgbWVyZ2VkLCB3aGVyZWFzIGluIFZpZXdFbmdpbmUgaXQgaXMgb3ZlcnJpZGRlbi4gSW4gb3JkZXJcbiAgLy8gdG8gYXZvaWQgZG91YmxlIGV2ZW50IGxpc3RlbmVycywgd2UgbmVlZCB0byB1c2UgYEhvc3RMaXN0ZW5lcmAuIE9uY2UgSXZ5IGlzIHRoZSBkZWZhdWx0LCB3ZVxuICAvLyBjYW4gbW92ZSB0aGlzIGJhY2sgaW50byBgaG9zdGAuXG4gIC8vIHRzbGludDpkaXNhYmxlOm5vLWhvc3QtZGVjb3JhdG9yLWluLWNvbmNyZXRlXG4gIEBIb3N0TGlzdGVuZXIoJ2NsaWNrJylcbiAgcmV2ZXJ0RWRpdCgpOiB2b2lkIHtcbiAgICB0aGlzLmVkaXRSZWYucmVzZXQoKTtcbiAgfVxufVxuXG4vKiogQ2xvc2VzIHRoZSBsZW5zIG9uIGNsaWNrLiAqL1xuQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICdbY2RrRWRpdENsb3NlXSd9KVxuZXhwb3J0IGNsYXNzIENka0VkaXRDbG9zZTxGb3JtVmFsdWU+IHtcbiAgY29uc3RydWN0b3IoXG4gICAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgZWxlbWVudFJlZjogRWxlbWVudFJlZjxIVE1MRWxlbWVudD4sXG4gICAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgZWRpdFJlZjogRWRpdFJlZjxGb3JtVmFsdWU+KSB7XG5cbiAgICBjb25zdCBuYXRpdmVFbGVtZW50ID0gZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50O1xuXG4gICAgLy8gUHJldmVudCBhY2NpZGVudGFsIGZvcm0gc3VibWl0cy5cbiAgICBpZiAobmF0aXZlRWxlbWVudC5ub2RlTmFtZSA9PT0gJ0JVVFRPTicgJiYgIW5hdGl2ZUVsZW1lbnQuZ2V0QXR0cmlidXRlKCd0eXBlJykpIHtcbiAgICAgIG5hdGl2ZUVsZW1lbnQuc2V0QXR0cmlidXRlKCd0eXBlJywgJ2J1dHRvbicpO1xuICAgIH1cbiAgfVxuXG4gIC8vIEluIEl2eSB0aGUgYGhvc3RgIG1ldGFkYXRhIHdpbGwgYmUgbWVyZ2VkLCB3aGVyZWFzIGluIFZpZXdFbmdpbmUgaXQgaXMgb3ZlcnJpZGRlbi4gSW4gb3JkZXJcbiAgLy8gdG8gYXZvaWQgZG91YmxlIGV2ZW50IGxpc3RlbmVycywgd2UgbmVlZCB0byB1c2UgYEhvc3RMaXN0ZW5lcmAuIE9uY2UgSXZ5IGlzIHRoZSBkZWZhdWx0LCB3ZVxuICAvLyBjYW4gbW92ZSB0aGlzIGJhY2sgaW50byBgaG9zdGAuXG4gIC8vIHRzbGludDpkaXNhYmxlOm5vLWhvc3QtZGVjb3JhdG9yLWluLWNvbmNyZXRlXG4gIEBIb3N0TGlzdGVuZXIoJ2NsaWNrJylcbiAgQEhvc3RMaXN0ZW5lcigna2V5dXAuZW50ZXInKVxuICBASG9zdExpc3RlbmVyKCdrZXl1cC5zcGFjZScpXG4gIGNsb3NlRWRpdCgpOiB2b2lkIHtcbiAgICAvLyBOb3RlIHRoYXQgd2UgdXNlIGBjbGlja2AgaGVyZSwgcmF0aGVyIHRoYW4gYSBrZXlib2FyZCBldmVudCwgYmVjYXVzZSBzb21lIHNjcmVlbiByZWFkZXJzXG4gICAgLy8gd2lsbCBlbWl0IGEgZmFrZSBjbGljayBldmVudCBpbnN0ZWFkIG9mIGFuIGVudGVyIGtleWJvYXJkIGV2ZW50IG9uIGJ1dHRvbnMuXG4gICAgdGhpcy5lZGl0UmVmLmNsb3NlKCk7XG4gIH1cbn1cbiJdfQ==