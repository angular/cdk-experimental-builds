/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Subject } from 'rxjs';
import { Directive, ElementRef, EventEmitter, Input, HostListener, } from '@angular/core';
import { hasModifierKey } from '@angular/cdk/keycodes';
import { EDIT_PANE_SELECTOR } from './constants';
import { closest } from './polyfill';
import { EditRef } from './edit-ref';
import * as i0 from "@angular/core";
import * as i1 from "./edit-ref";
/**
 * A directive that attaches to a form within the edit lens.
 * It coordinates the form state with the table-wide edit system and handles
 * closing the edit lens when the form is submitted or the user clicks
 * out.
 */
export class CdkEditControl {
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
    // tslint:disable-next-line:no-host-decorator-in-concrete
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
    // tslint:disable-next-line:no-host-decorator-in-concrete
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
    // tslint:disable-next-line:no-host-decorator-in-concrete
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
}
CdkEditControl.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.0-next.15", ngImport: i0, type: CdkEditControl, deps: [{ token: i0.ElementRef }, { token: i1.EditRef }], target: i0.ɵɵFactoryTarget.Directive });
CdkEditControl.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "13.0.0-next.15", type: CdkEditControl, selector: "form[cdkEditControl]", inputs: { clickOutBehavior: ["cdkEditControlClickOutBehavior", "clickOutBehavior"], preservedFormValue: ["cdkEditControlPreservedFormValue", "preservedFormValue"], ignoreSubmitUnlessValid: ["cdkEditControlIgnoreSubmitUnlessValid", "ignoreSubmitUnlessValid"] }, outputs: { preservedFormValueChange: "cdkEditControlPreservedFormValueChange" }, host: { listeners: { "ngSubmit": "handleFormSubmit()", "document:click": "handlePossibleClickOut($event)", "keydown": "_handleKeydown($event)" } }, providers: [EditRef], ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.0-next.15", ngImport: i0, type: CdkEditControl, decorators: [{
            type: Directive,
            args: [{
                    selector: 'form[cdkEditControl]',
                    inputs: [
                        'clickOutBehavior: cdkEditControlClickOutBehavior',
                        'preservedFormValue: cdkEditControlPreservedFormValue',
                        'ignoreSubmitUnlessValid: cdkEditControlIgnoreSubmitUnlessValid',
                    ],
                    outputs: ['preservedFormValueChange: cdkEditControlPreservedFormValueChange'],
                    providers: [EditRef],
                }]
        }], ctorParameters: function () { return [{ type: i0.ElementRef }, { type: i1.EditRef }]; }, propDecorators: { handleFormSubmit: [{
                type: HostListener,
                args: ['ngSubmit']
            }], handlePossibleClickOut: [{
                type: HostListener,
                args: ['document:click', ['$event']]
            }], _handleKeydown: [{
                type: HostListener,
                args: ['keydown', ['$event']]
            }] } });
/** Reverts the form to its initial or previously submitted state on click. */
export class CdkEditRevert {
    constructor(editRef) {
        this.editRef = editRef;
        /** Type of the button. Defaults to `button` to avoid accident form submits. */
        this.type = 'button';
    }
    // In Ivy the `host` metadata will be merged, whereas in ViewEngine it is overridden. In order
    // to avoid double event listeners, we need to use `HostListener`. Once Ivy is the default, we
    // can move this back into `host`.
    // tslint:disable-next-line:no-host-decorator-in-concrete
    revertEdit() {
        this.editRef.reset();
    }
}
CdkEditRevert.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.0-next.15", ngImport: i0, type: CdkEditRevert, deps: [{ token: i1.EditRef }], target: i0.ɵɵFactoryTarget.Directive });
CdkEditRevert.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "13.0.0-next.15", type: CdkEditRevert, selector: "button[cdkEditRevert]", inputs: { type: "type" }, host: { attributes: { "type": "button" }, listeners: { "click": "revertEdit()" } }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.0-next.15", ngImport: i0, type: CdkEditRevert, decorators: [{
            type: Directive,
            args: [{
                    selector: 'button[cdkEditRevert]',
                    host: {
                        'type': 'button', // Prevents accidental form submits.
                    }
                }]
        }], ctorParameters: function () { return [{ type: i1.EditRef }]; }, propDecorators: { type: [{
                type: Input
            }], revertEdit: [{
                type: HostListener,
                args: ['click']
            }] } });
/** Closes the lens on click. */
export class CdkEditClose {
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
    // tslint:disable-next-line:no-host-decorator-in-concrete
    closeEdit() {
        // Note that we use `click` here, rather than a keyboard event, because some screen readers
        // will emit a fake click event instead of an enter keyboard event on buttons. For the keyboard
        // events we use `keydown`, rather than `keyup`, because we use `keydown` to open the overlay
        // as well. If we were to use `keyup`, the user could end up opening and closing within
        // the same event sequence if focus was moved quickly.
        this.editRef.close();
    }
}
CdkEditClose.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.0-next.15", ngImport: i0, type: CdkEditClose, deps: [{ token: i0.ElementRef }, { token: i1.EditRef }], target: i0.ɵɵFactoryTarget.Directive });
CdkEditClose.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "13.0.0-next.15", type: CdkEditClose, selector: "[cdkEditClose]", host: { listeners: { "click": "closeEdit()", "keydown.enter": "closeEdit()", "keydown.space": "closeEdit()" } }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.0-next.15", ngImport: i0, type: CdkEditClose, decorators: [{
            type: Directive,
            args: [{ selector: '[cdkEditClose]' }]
        }], ctorParameters: function () { return [{ type: i0.ElementRef }, { type: i1.EditRef }]; }, propDecorators: { closeEdit: [{
                type: HostListener,
                args: ['click']
            }, {
                type: HostListener,
                args: ['keydown.enter']
            }, {
                type: HostListener,
                args: ['keydown.space']
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGVucy1kaXJlY3RpdmVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvcG9wb3Zlci1lZGl0L2xlbnMtZGlyZWN0aXZlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQzdCLE9BQU8sRUFDTCxTQUFTLEVBQ1QsVUFBVSxFQUNWLFlBQVksRUFHWixLQUFLLEVBQ0wsWUFBWSxHQUNiLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUNyRCxPQUFPLEVBQUMsa0JBQWtCLEVBQUMsTUFBTSxhQUFhLENBQUM7QUFDL0MsT0FBTyxFQUFDLE9BQU8sRUFBQyxNQUFNLFlBQVksQ0FBQztBQUNuQyxPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sWUFBWSxDQUFDOzs7QUFLbkM7Ozs7O0dBS0c7QUFXSCxNQUFNLE9BQU8sY0FBYztJQXVCekIsWUFBK0IsVUFBc0IsRUFBVyxPQUEyQjtRQUE1RCxlQUFVLEdBQVYsVUFBVSxDQUFZO1FBQVcsWUFBTyxHQUFQLE9BQU8sQ0FBb0I7UUF0QnhFLGNBQVMsR0FBRyxJQUFJLE9BQU8sRUFBUSxDQUFDO1FBRW5EOzs7V0FHRztRQUNILHFCQUFnQixHQUFnQyxPQUFPLENBQUM7UUFRL0MsNkJBQXdCLEdBQUcsSUFBSSxZQUFZLEVBQWEsQ0FBQztRQUVsRTs7O1dBR0c7UUFDSCw0QkFBdUIsR0FBRyxJQUFJLENBQUM7SUFFK0QsQ0FBQztJQUUvRixRQUFRO1FBQ04sSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFDM0MsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxDQUFD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RCxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQ3ZCLENBQUM7O2lIQXpCVSxZQUFZO3FHQUFaLFlBQVk7bUdBQVosWUFBWTtrQkFEeEIsU0FBUzttQkFBQyxFQUFDLFFBQVEsRUFBRSxnQkFBZ0IsRUFBQzt1SEFtQnJDLFNBQVM7c0JBRFIsWUFBWTt1QkFBQyxPQUFPOztzQkFBRyxZQUFZO3VCQUFDLGVBQWU7O3NCQUFHLFlBQVk7dUJBQUMsZUFBZSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1N1YmplY3R9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHtcbiAgRGlyZWN0aXZlLFxuICBFbGVtZW50UmVmLFxuICBFdmVudEVtaXR0ZXIsXG4gIE9uRGVzdHJveSxcbiAgT25Jbml0LFxuICBJbnB1dCxcbiAgSG9zdExpc3RlbmVyLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7aGFzTW9kaWZpZXJLZXl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9rZXljb2Rlcyc7XG5pbXBvcnQge0VESVRfUEFORV9TRUxFQ1RPUn0gZnJvbSAnLi9jb25zdGFudHMnO1xuaW1wb3J0IHtjbG9zZXN0fSBmcm9tICcuL3BvbHlmaWxsJztcbmltcG9ydCB7RWRpdFJlZn0gZnJvbSAnLi9lZGl0LXJlZic7XG5cbi8qKiBPcHRpb25zIGZvciB3aGF0IGRvIHRvIHdoZW4gdGhlIHVzZXIgY2xpY2tzIG91dHNpZGUgb2YgYW4gZWRpdCBsZW5zLiAqL1xuZXhwb3J0IHR5cGUgUG9wb3ZlckVkaXRDbGlja091dEJlaGF2aW9yID0gJ2Nsb3NlJyB8ICdzdWJtaXQnIHwgJ25vb3AnO1xuXG4vKipcbiAqIEEgZGlyZWN0aXZlIHRoYXQgYXR0YWNoZXMgdG8gYSBmb3JtIHdpdGhpbiB0aGUgZWRpdCBsZW5zLlxuICogSXQgY29vcmRpbmF0ZXMgdGhlIGZvcm0gc3RhdGUgd2l0aCB0aGUgdGFibGUtd2lkZSBlZGl0IHN5c3RlbSBhbmQgaGFuZGxlc1xuICogY2xvc2luZyB0aGUgZWRpdCBsZW5zIHdoZW4gdGhlIGZvcm0gaXMgc3VibWl0dGVkIG9yIHRoZSB1c2VyIGNsaWNrc1xuICogb3V0LlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdmb3JtW2Nka0VkaXRDb250cm9sXScsXG4gIGlucHV0czogW1xuICAgICdjbGlja091dEJlaGF2aW9yOiBjZGtFZGl0Q29udHJvbENsaWNrT3V0QmVoYXZpb3InLFxuICAgICdwcmVzZXJ2ZWRGb3JtVmFsdWU6IGNka0VkaXRDb250cm9sUHJlc2VydmVkRm9ybVZhbHVlJyxcbiAgICAnaWdub3JlU3VibWl0VW5sZXNzVmFsaWQ6IGNka0VkaXRDb250cm9sSWdub3JlU3VibWl0VW5sZXNzVmFsaWQnLFxuICBdLFxuICBvdXRwdXRzOiBbJ3ByZXNlcnZlZEZvcm1WYWx1ZUNoYW5nZTogY2RrRWRpdENvbnRyb2xQcmVzZXJ2ZWRGb3JtVmFsdWVDaGFuZ2UnXSxcbiAgcHJvdmlkZXJzOiBbRWRpdFJlZl0sXG59KVxuZXhwb3J0IGNsYXNzIENka0VkaXRDb250cm9sPEZvcm1WYWx1ZT4gaW1wbGVtZW50cyBPbkRlc3Ryb3ksIE9uSW5pdCB7XG4gIHByb3RlY3RlZCByZWFkb25seSBkZXN0cm95ZWQgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xuXG4gIC8qKlxuICAgKiBTcGVjaWZpZXMgd2hhdCBzaG91bGQgaGFwcGVuIHdoZW4gdGhlIHVzZXIgY2xpY2tzIG91dHNpZGUgb2YgdGhlIGVkaXQgbGVucy5cbiAgICogVGhlIGRlZmF1bHQgYmVoYXZpb3IgaXMgdG8gY2xvc2UgdGhlIGxlbnMgd2l0aG91dCBzdWJtaXR0aW5nIHRoZSBmb3JtLlxuICAgKi9cbiAgY2xpY2tPdXRCZWhhdmlvcjogUG9wb3ZlckVkaXRDbGlja091dEJlaGF2aW9yID0gJ2Nsb3NlJztcblxuICAvKipcbiAgICogQSB0d28td2F5IGJpbmRpbmcgZm9yIHN0b3JpbmcgdW5zdWJtaXR0ZWQgZm9ybSBzdGF0ZS4gSWYgbm90IHByb3ZpZGVkXG4gICAqIHRoZW4gZm9ybSBzdGF0ZSB3aWxsIGJlIGRpc2NhcmRlZCBvbiBjbG9zZS4gVGhlIFBlcmlzdEJ5IGRpcmVjdGl2ZSBpcyBvZmZlcmVkXG4gICAqIGFzIGEgY29udmVuaWVudCBzaG9ydGN1dCBmb3IgdGhlc2UgYmluZGluZ3MuXG4gICAqL1xuICBwcmVzZXJ2ZWRGb3JtVmFsdWU/OiBGb3JtVmFsdWU7XG4gIHJlYWRvbmx5IHByZXNlcnZlZEZvcm1WYWx1ZUNoYW5nZSA9IG5ldyBFdmVudEVtaXR0ZXI8Rm9ybVZhbHVlPigpO1xuXG4gIC8qKlxuICAgKiBEZXRlcm1pbmVzIHdoZXRoZXIgdGhlIGxlbnMgd2lsbCBjbG9zZSBvbiBmb3JtIHN1Ym1pdCBpZiB0aGUgZm9ybSBpcyBub3QgaW4gYSB2YWxpZFxuICAgKiBzdGF0ZS4gQnkgZGVmYXVsdCB0aGUgbGVucyB3aWxsIHJlbWFpbiBvcGVuLlxuICAgKi9cbiAgaWdub3JlU3VibWl0VW5sZXNzVmFsaWQgPSB0cnVlO1xuXG4gIGNvbnN0cnVjdG9yKHByb3RlY3RlZCByZWFkb25seSBlbGVtZW50UmVmOiBFbGVtZW50UmVmLCByZWFkb25seSBlZGl0UmVmOiBFZGl0UmVmPEZvcm1WYWx1ZT4pIHt9XG5cbiAgbmdPbkluaXQoKTogdm9pZCB7XG4gICAgdGhpcy5lZGl0UmVmLmluaXQodGhpcy5wcmVzZXJ2ZWRGb3JtVmFsdWUpO1xuICAgIHRoaXMuZWRpdFJlZi5maW5hbFZhbHVlLnN1YnNjcmliZSh0aGlzLnByZXNlcnZlZEZvcm1WYWx1ZUNoYW5nZSk7XG4gICAgdGhpcy5lZGl0UmVmLmJsdXJyZWQuc3Vic2NyaWJlKCgpID0+IHRoaXMuX2hhbmRsZUJsdXIoKSk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLmRlc3Ryb3llZC5uZXh0KCk7XG4gICAgdGhpcy5kZXN0cm95ZWQuY29tcGxldGUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiB0aGUgZm9ybSBzdWJtaXRzLiBJZiBpZ25vcmVTdWJtaXRVbmxlc3NWYWxpZCBpcyB0cnVlLCBjaGVja3NcbiAgICogdGhlIGZvcm0gZm9yIHZhbGlkaXR5IGJlZm9yZSBwcm9jZWVkaW5nLlxuICAgKiBVcGRhdGVzIHRoZSByZXZlcnQgc3RhdGUgd2l0aCB0aGUgbGF0ZXN0IHN1Ym1pdHRlZCB2YWx1ZSB0aGVuIGNsb3NlcyB0aGUgZWRpdC5cbiAgICovXG4gIC8vIEluIEl2eSB0aGUgYGhvc3RgIG1ldGFkYXRhIHdpbGwgYmUgbWVyZ2VkLCB3aGVyZWFzIGluIFZpZXdFbmdpbmUgaXQgaXMgb3ZlcnJpZGRlbi4gSW4gb3JkZXJcbiAgLy8gdG8gYXZvaWQgZG91YmxlIGV2ZW50IGxpc3RlbmVycywgd2UgbmVlZCB0byB1c2UgYEhvc3RMaXN0ZW5lcmAuIE9uY2UgSXZ5IGlzIHRoZSBkZWZhdWx0LCB3ZVxuICAvLyBjYW4gbW92ZSB0aGlzIGJhY2sgaW50byBgaG9zdGAuXG4gIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1ob3N0LWRlY29yYXRvci1pbi1jb25jcmV0ZVxuICBASG9zdExpc3RlbmVyKCduZ1N1Ym1pdCcpXG4gIGhhbmRsZUZvcm1TdWJtaXQoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuaWdub3JlU3VibWl0VW5sZXNzVmFsaWQgJiYgIXRoaXMuZWRpdFJlZi5pc1ZhbGlkKCkpIHsgcmV0dXJuOyB9XG5cbiAgICB0aGlzLmVkaXRSZWYudXBkYXRlUmV2ZXJ0VmFsdWUoKTtcbiAgICB0aGlzLmVkaXRSZWYuY2xvc2UoKTtcbiAgfVxuXG4gIC8qKiBDYWxsZWQgb24gRXNjYXBlIGtleXVwLiBDbG9zZXMgdGhlIGVkaXQuICovXG4gIGNsb3NlKCk6IHZvaWQge1xuICAgIC8vIHRvZG8gLSBhbGxvdyB0aGlzIGJlaGF2aW9yIHRvIGJlIGN1c3RvbWl6ZWQgYXMgd2VsbCwgc3VjaCBhcyBjYWxsaW5nXG4gICAgLy8gcmVzZXQgYmVmb3JlIGNsb3NlXG4gICAgdGhpcy5lZGl0UmVmLmNsb3NlKCk7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIG9uIGNsaWNrIGFueXdoZXJlIGluIHRoZSBkb2N1bWVudC5cbiAgICogSWYgdGhlIGNsaWNrIHdhcyBvdXRzaWRlIG9mIHRoZSBsZW5zLCB0cmlnZ2VyIHRoZSBzcGVjaWZpZWQgY2xpY2sgb3V0IGJlaGF2aW9yLlxuICAgKi9cbiAgLy8gSW4gSXZ5IHRoZSBgaG9zdGAgbWV0YWRhdGEgd2lsbCBiZSBtZXJnZWQsIHdoZXJlYXMgaW4gVmlld0VuZ2luZSBpdCBpcyBvdmVycmlkZGVuLiBJbiBvcmRlclxuICAvLyB0byBhdm9pZCBkb3VibGUgZXZlbnQgbGlzdGVuZXJzLCB3ZSBuZWVkIHRvIHVzZSBgSG9zdExpc3RlbmVyYC4gT25jZSBJdnkgaXMgdGhlIGRlZmF1bHQsIHdlXG4gIC8vIGNhbiBtb3ZlIHRoaXMgYmFjayBpbnRvIGBob3N0YC5cbiAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWhvc3QtZGVjb3JhdG9yLWluLWNvbmNyZXRlXG4gIEBIb3N0TGlzdGVuZXIoJ2RvY3VtZW50OmNsaWNrJywgWyckZXZlbnQnXSlcbiAgaGFuZGxlUG9zc2libGVDbGlja091dChldnQ6IEV2ZW50KTogdm9pZCB7XG4gICAgaWYgKGNsb3Nlc3QoZXZ0LnRhcmdldCwgRURJVF9QQU5FX1NFTEVDVE9SKSkgeyByZXR1cm47IH1cbiAgICBzd2l0Y2ggKHRoaXMuY2xpY2tPdXRCZWhhdmlvcikge1xuICAgICAgY2FzZSAnc3VibWl0JzpcbiAgICAgICAgLy8gTWFudWFsbHkgY2F1c2UgdGhlIGZvcm0gdG8gc3VibWl0IGJlZm9yZSBjbG9zaW5nLlxuICAgICAgICB0aGlzLl90cmlnZ2VyRm9ybVN1Ym1pdCgpO1xuICAgICAgICB0aGlzLmVkaXRSZWYuY2xvc2UoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdjbG9zZSc6XG4gICAgICAgIHRoaXMuZWRpdFJlZi5jbG9zZSgpO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIC8vIEluIEl2eSB0aGUgYGhvc3RgIG1ldGFkYXRhIHdpbGwgYmUgbWVyZ2VkLCB3aGVyZWFzIGluIFZpZXdFbmdpbmUgaXQgaXMgb3ZlcnJpZGRlbi4gSW4gb3JkZXJcbiAgLy8gdG8gYXZvaWQgZG91YmxlIGV2ZW50IGxpc3RlbmVycywgd2UgbmVlZCB0byB1c2UgYEhvc3RMaXN0ZW5lcmAuIE9uY2UgSXZ5IGlzIHRoZSBkZWZhdWx0LCB3ZVxuICAvLyBjYW4gbW92ZSB0aGlzIGJhY2sgaW50byBgaG9zdGAuXG4gIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1ob3N0LWRlY29yYXRvci1pbi1jb25jcmV0ZVxuICBASG9zdExpc3RlbmVyKCdrZXlkb3duJywgWyckZXZlbnQnXSlcbiAgX2hhbmRsZUtleWRvd24oZXZlbnQ6IEtleWJvYXJkRXZlbnQpIHtcbiAgICBpZiAoZXZlbnQua2V5ID09PSAnRXNjYXBlJyAmJiAhaGFzTW9kaWZpZXJLZXkoZXZlbnQpKSB7XG4gICAgICB0aGlzLmNsb3NlKCk7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBUcmlnZ2VycyBzdWJtaXQgb24gdGFiIG91dCBpZiBjbGlja091dEJlaGF2aW9yIGlzICdzdWJtaXQnLiAqL1xuICBwcml2YXRlIF9oYW5kbGVCbHVyKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLmNsaWNrT3V0QmVoYXZpb3IgPT09ICdzdWJtaXQnKSB7XG4gICAgICAvLyBNYW51YWxseSBjYXVzZSB0aGUgZm9ybSB0byBzdWJtaXQgYmVmb3JlIGNsb3NpbmcuXG4gICAgICB0aGlzLl90cmlnZ2VyRm9ybVN1Ym1pdCgpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3RyaWdnZXJGb3JtU3VibWl0KCkge1xuICAgIHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50IS5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnc3VibWl0JykpO1xuICB9XG59XG5cbi8qKiBSZXZlcnRzIHRoZSBmb3JtIHRvIGl0cyBpbml0aWFsIG9yIHByZXZpb3VzbHkgc3VibWl0dGVkIHN0YXRlIG9uIGNsaWNrLiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnYnV0dG9uW2Nka0VkaXRSZXZlcnRdJyxcbiAgaG9zdDoge1xuICAgICd0eXBlJzogJ2J1dHRvbicsIC8vIFByZXZlbnRzIGFjY2lkZW50YWwgZm9ybSBzdWJtaXRzLlxuICB9XG59KVxuZXhwb3J0IGNsYXNzIENka0VkaXRSZXZlcnQ8Rm9ybVZhbHVlPiB7XG4gIC8qKiBUeXBlIG9mIHRoZSBidXR0b24uIERlZmF1bHRzIHRvIGBidXR0b25gIHRvIGF2b2lkIGFjY2lkZW50IGZvcm0gc3VibWl0cy4gKi9cbiAgQElucHV0KCkgdHlwZTogc3RyaW5nID0gJ2J1dHRvbic7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgZWRpdFJlZjogRWRpdFJlZjxGb3JtVmFsdWU+KSB7fVxuXG4gIC8vIEluIEl2eSB0aGUgYGhvc3RgIG1ldGFkYXRhIHdpbGwgYmUgbWVyZ2VkLCB3aGVyZWFzIGluIFZpZXdFbmdpbmUgaXQgaXMgb3ZlcnJpZGRlbi4gSW4gb3JkZXJcbiAgLy8gdG8gYXZvaWQgZG91YmxlIGV2ZW50IGxpc3RlbmVycywgd2UgbmVlZCB0byB1c2UgYEhvc3RMaXN0ZW5lcmAuIE9uY2UgSXZ5IGlzIHRoZSBkZWZhdWx0LCB3ZVxuICAvLyBjYW4gbW92ZSB0aGlzIGJhY2sgaW50byBgaG9zdGAuXG4gIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1ob3N0LWRlY29yYXRvci1pbi1jb25jcmV0ZVxuICBASG9zdExpc3RlbmVyKCdjbGljaycpXG4gIHJldmVydEVkaXQoKTogdm9pZCB7XG4gICAgdGhpcy5lZGl0UmVmLnJlc2V0KCk7XG4gIH1cbn1cblxuLyoqIENsb3NlcyB0aGUgbGVucyBvbiBjbGljay4gKi9cbkBEaXJlY3RpdmUoe3NlbGVjdG9yOiAnW2Nka0VkaXRDbG9zZV0nfSlcbmV4cG9ydCBjbGFzcyBDZGtFZGl0Q2xvc2U8Rm9ybVZhbHVlPiB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJvdGVjdGVkIHJlYWRvbmx5IGVsZW1lbnRSZWY6IEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+LFxuICAgICAgcHJvdGVjdGVkIHJlYWRvbmx5IGVkaXRSZWY6IEVkaXRSZWY8Rm9ybVZhbHVlPikge1xuXG4gICAgY29uc3QgbmF0aXZlRWxlbWVudCA9IGVsZW1lbnRSZWYubmF0aXZlRWxlbWVudDtcblxuICAgIC8vIFByZXZlbnQgYWNjaWRlbnRhbCBmb3JtIHN1Ym1pdHMuXG4gICAgaWYgKG5hdGl2ZUVsZW1lbnQubm9kZU5hbWUgPT09ICdCVVRUT04nICYmICFuYXRpdmVFbGVtZW50LmdldEF0dHJpYnV0ZSgndHlwZScpKSB7XG4gICAgICBuYXRpdmVFbGVtZW50LnNldEF0dHJpYnV0ZSgndHlwZScsICdidXR0b24nKTtcbiAgICB9XG4gIH1cblxuICAvLyBJbiBJdnkgdGhlIGBob3N0YCBtZXRhZGF0YSB3aWxsIGJlIG1lcmdlZCwgd2hlcmVhcyBpbiBWaWV3RW5naW5lIGl0IGlzIG92ZXJyaWRkZW4uIEluIG9yZGVyXG4gIC8vIHRvIGF2b2lkIGRvdWJsZSBldmVudCBsaXN0ZW5lcnMsIHdlIG5lZWQgdG8gdXNlIGBIb3N0TGlzdGVuZXJgLiBPbmNlIEl2eSBpcyB0aGUgZGVmYXVsdCwgd2VcbiAgLy8gY2FuIG1vdmUgdGhpcyBiYWNrIGludG8gYGhvc3RgLlxuICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8taG9zdC1kZWNvcmF0b3ItaW4tY29uY3JldGVcbiAgQEhvc3RMaXN0ZW5lcignY2xpY2snKSBASG9zdExpc3RlbmVyKCdrZXlkb3duLmVudGVyJykgQEhvc3RMaXN0ZW5lcigna2V5ZG93bi5zcGFjZScpXG4gIGNsb3NlRWRpdCgpOiB2b2lkIHtcbiAgICAvLyBOb3RlIHRoYXQgd2UgdXNlIGBjbGlja2AgaGVyZSwgcmF0aGVyIHRoYW4gYSBrZXlib2FyZCBldmVudCwgYmVjYXVzZSBzb21lIHNjcmVlbiByZWFkZXJzXG4gICAgLy8gd2lsbCBlbWl0IGEgZmFrZSBjbGljayBldmVudCBpbnN0ZWFkIG9mIGFuIGVudGVyIGtleWJvYXJkIGV2ZW50IG9uIGJ1dHRvbnMuIEZvciB0aGUga2V5Ym9hcmRcbiAgICAvLyBldmVudHMgd2UgdXNlIGBrZXlkb3duYCwgcmF0aGVyIHRoYW4gYGtleXVwYCwgYmVjYXVzZSB3ZSB1c2UgYGtleWRvd25gIHRvIG9wZW4gdGhlIG92ZXJsYXlcbiAgICAvLyBhcyB3ZWxsLiBJZiB3ZSB3ZXJlIHRvIHVzZSBga2V5dXBgLCB0aGUgdXNlciBjb3VsZCBlbmQgdXAgb3BlbmluZyBhbmQgY2xvc2luZyB3aXRoaW5cbiAgICAvLyB0aGUgc2FtZSBldmVudCBzZXF1ZW5jZSBpZiBmb2N1cyB3YXMgbW92ZWQgcXVpY2tseS5cbiAgICB0aGlzLmVkaXRSZWYuY2xvc2UoKTtcbiAgfVxufVxuIl19