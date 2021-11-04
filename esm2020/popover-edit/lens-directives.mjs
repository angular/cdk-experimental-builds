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
CdkEditControl.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.0", ngImport: i0, type: CdkEditControl, deps: [{ token: i0.ElementRef }, { token: i1.EditRef }], target: i0.ɵɵFactoryTarget.Directive });
CdkEditControl.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "13.0.0", type: CdkEditControl, selector: "form[cdkEditControl]", inputs: { clickOutBehavior: ["cdkEditControlClickOutBehavior", "clickOutBehavior"], preservedFormValue: ["cdkEditControlPreservedFormValue", "preservedFormValue"], ignoreSubmitUnlessValid: ["cdkEditControlIgnoreSubmitUnlessValid", "ignoreSubmitUnlessValid"] }, outputs: { preservedFormValueChange: "cdkEditControlPreservedFormValueChange" }, host: { listeners: { "ngSubmit": "handleFormSubmit()", "document:click": "handlePossibleClickOut($event)", "keydown": "_handleKeydown($event)" } }, providers: [EditRef], ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.0", ngImport: i0, type: CdkEditControl, decorators: [{
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
CdkEditRevert.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.0", ngImport: i0, type: CdkEditRevert, deps: [{ token: i1.EditRef }], target: i0.ɵɵFactoryTarget.Directive });
CdkEditRevert.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "13.0.0", type: CdkEditRevert, selector: "button[cdkEditRevert]", inputs: { type: "type" }, host: { attributes: { "type": "button" }, listeners: { "click": "revertEdit()" } }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.0", ngImport: i0, type: CdkEditRevert, decorators: [{
            type: Directive,
            args: [{
                    selector: 'button[cdkEditRevert]',
                    host: {
                        'type': 'button', // Prevents accidental form submits.
                    },
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
CdkEditClose.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.0", ngImport: i0, type: CdkEditClose, deps: [{ token: i0.ElementRef }, { token: i1.EditRef }], target: i0.ɵɵFactoryTarget.Directive });
CdkEditClose.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "13.0.0", type: CdkEditClose, selector: "[cdkEditClose]", host: { listeners: { "click": "closeEdit()", "keydown.enter": "closeEdit()", "keydown.space": "closeEdit()" } }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.0", ngImport: i0, type: CdkEditClose, decorators: [{
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGVucy1kaXJlY3RpdmVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvcG9wb3Zlci1lZGl0L2xlbnMtZGlyZWN0aXZlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQzdCLE9BQU8sRUFDTCxTQUFTLEVBQ1QsVUFBVSxFQUNWLFlBQVksRUFHWixLQUFLLEVBQ0wsWUFBWSxHQUNiLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUNyRCxPQUFPLEVBQUMsa0JBQWtCLEVBQUMsTUFBTSxhQUFhLENBQUM7QUFDL0MsT0FBTyxFQUFDLE9BQU8sRUFBQyxNQUFNLFlBQVksQ0FBQztBQUNuQyxPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sWUFBWSxDQUFDOzs7QUFLbkM7Ozs7O0dBS0c7QUFXSCxNQUFNLE9BQU8sY0FBYztJQXVCekIsWUFBK0IsVUFBc0IsRUFBVyxPQUEyQjtRQUE1RCxlQUFVLEdBQVYsVUFBVSxDQUFZO1FBQVcsWUFBTyxHQUFQLE9BQU8sQ0FBb0I7UUF0QnhFLGNBQVMsR0FBRyxJQUFJLE9BQU8sRUFBUSxDQUFDO1FBRW5EOzs7V0FHRztRQUNILHFCQUFnQixHQUFnQyxPQUFPLENBQUM7UUFRL0MsNkJBQXdCLEdBQUcsSUFBSSxZQUFZLEVBQWEsQ0FBQztRQUVsRTs7O1dBR0c7UUFDSCw0QkFBdUIsR0FBRyxJQUFJLENBQUM7SUFFK0QsQ0FBQztJQUUvRixRQUFRO1FBQ04sSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFDM0MsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxDQUFD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RCxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQ3ZCLENBQUM7O3lHQTdCVSxZQUFZOzZGQUFaLFlBQVk7MkZBQVosWUFBWTtrQkFEeEIsU0FBUzttQkFBQyxFQUFDLFFBQVEsRUFBRSxnQkFBZ0IsRUFBQzt1SEF1QnJDLFNBQVM7c0JBTFIsWUFBWTt1QkFBQyxPQUFPOztzQkFFcEIsWUFBWTt1QkFBQyxlQUFlOztzQkFFNUIsWUFBWTt1QkFBQyxlQUFlIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7U3ViamVjdH0gZnJvbSAncnhqcyc7XG5pbXBvcnQge1xuICBEaXJlY3RpdmUsXG4gIEVsZW1lbnRSZWYsXG4gIEV2ZW50RW1pdHRlcixcbiAgT25EZXN0cm95LFxuICBPbkluaXQsXG4gIElucHV0LFxuICBIb3N0TGlzdGVuZXIsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtoYXNNb2RpZmllcktleX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2tleWNvZGVzJztcbmltcG9ydCB7RURJVF9QQU5FX1NFTEVDVE9SfSBmcm9tICcuL2NvbnN0YW50cyc7XG5pbXBvcnQge2Nsb3Nlc3R9IGZyb20gJy4vcG9seWZpbGwnO1xuaW1wb3J0IHtFZGl0UmVmfSBmcm9tICcuL2VkaXQtcmVmJztcblxuLyoqIE9wdGlvbnMgZm9yIHdoYXQgZG8gdG8gd2hlbiB0aGUgdXNlciBjbGlja3Mgb3V0c2lkZSBvZiBhbiBlZGl0IGxlbnMuICovXG5leHBvcnQgdHlwZSBQb3BvdmVyRWRpdENsaWNrT3V0QmVoYXZpb3IgPSAnY2xvc2UnIHwgJ3N1Ym1pdCcgfCAnbm9vcCc7XG5cbi8qKlxuICogQSBkaXJlY3RpdmUgdGhhdCBhdHRhY2hlcyB0byBhIGZvcm0gd2l0aGluIHRoZSBlZGl0IGxlbnMuXG4gKiBJdCBjb29yZGluYXRlcyB0aGUgZm9ybSBzdGF0ZSB3aXRoIHRoZSB0YWJsZS13aWRlIGVkaXQgc3lzdGVtIGFuZCBoYW5kbGVzXG4gKiBjbG9zaW5nIHRoZSBlZGl0IGxlbnMgd2hlbiB0aGUgZm9ybSBpcyBzdWJtaXR0ZWQgb3IgdGhlIHVzZXIgY2xpY2tzXG4gKiBvdXQuXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ2Zvcm1bY2RrRWRpdENvbnRyb2xdJyxcbiAgaW5wdXRzOiBbXG4gICAgJ2NsaWNrT3V0QmVoYXZpb3I6IGNka0VkaXRDb250cm9sQ2xpY2tPdXRCZWhhdmlvcicsXG4gICAgJ3ByZXNlcnZlZEZvcm1WYWx1ZTogY2RrRWRpdENvbnRyb2xQcmVzZXJ2ZWRGb3JtVmFsdWUnLFxuICAgICdpZ25vcmVTdWJtaXRVbmxlc3NWYWxpZDogY2RrRWRpdENvbnRyb2xJZ25vcmVTdWJtaXRVbmxlc3NWYWxpZCcsXG4gIF0sXG4gIG91dHB1dHM6IFsncHJlc2VydmVkRm9ybVZhbHVlQ2hhbmdlOiBjZGtFZGl0Q29udHJvbFByZXNlcnZlZEZvcm1WYWx1ZUNoYW5nZSddLFxuICBwcm92aWRlcnM6IFtFZGl0UmVmXSxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrRWRpdENvbnRyb2w8Rm9ybVZhbHVlPiBpbXBsZW1lbnRzIE9uRGVzdHJveSwgT25Jbml0IHtcbiAgcHJvdGVjdGVkIHJlYWRvbmx5IGRlc3Ryb3llZCA9IG5ldyBTdWJqZWN0PHZvaWQ+KCk7XG5cbiAgLyoqXG4gICAqIFNwZWNpZmllcyB3aGF0IHNob3VsZCBoYXBwZW4gd2hlbiB0aGUgdXNlciBjbGlja3Mgb3V0c2lkZSBvZiB0aGUgZWRpdCBsZW5zLlxuICAgKiBUaGUgZGVmYXVsdCBiZWhhdmlvciBpcyB0byBjbG9zZSB0aGUgbGVucyB3aXRob3V0IHN1Ym1pdHRpbmcgdGhlIGZvcm0uXG4gICAqL1xuICBjbGlja091dEJlaGF2aW9yOiBQb3BvdmVyRWRpdENsaWNrT3V0QmVoYXZpb3IgPSAnY2xvc2UnO1xuXG4gIC8qKlxuICAgKiBBIHR3by13YXkgYmluZGluZyBmb3Igc3RvcmluZyB1bnN1Ym1pdHRlZCBmb3JtIHN0YXRlLiBJZiBub3QgcHJvdmlkZWRcbiAgICogdGhlbiBmb3JtIHN0YXRlIHdpbGwgYmUgZGlzY2FyZGVkIG9uIGNsb3NlLiBUaGUgUGVyaXN0QnkgZGlyZWN0aXZlIGlzIG9mZmVyZWRcbiAgICogYXMgYSBjb252ZW5pZW50IHNob3J0Y3V0IGZvciB0aGVzZSBiaW5kaW5ncy5cbiAgICovXG4gIHByZXNlcnZlZEZvcm1WYWx1ZT86IEZvcm1WYWx1ZTtcbiAgcmVhZG9ubHkgcHJlc2VydmVkRm9ybVZhbHVlQ2hhbmdlID0gbmV3IEV2ZW50RW1pdHRlcjxGb3JtVmFsdWU+KCk7XG5cbiAgLyoqXG4gICAqIERldGVybWluZXMgd2hldGhlciB0aGUgbGVucyB3aWxsIGNsb3NlIG9uIGZvcm0gc3VibWl0IGlmIHRoZSBmb3JtIGlzIG5vdCBpbiBhIHZhbGlkXG4gICAqIHN0YXRlLiBCeSBkZWZhdWx0IHRoZSBsZW5zIHdpbGwgcmVtYWluIG9wZW4uXG4gICAqL1xuICBpZ25vcmVTdWJtaXRVbmxlc3NWYWxpZCA9IHRydWU7XG5cbiAgY29uc3RydWN0b3IocHJvdGVjdGVkIHJlYWRvbmx5IGVsZW1lbnRSZWY6IEVsZW1lbnRSZWYsIHJlYWRvbmx5IGVkaXRSZWY6IEVkaXRSZWY8Rm9ybVZhbHVlPikge31cblxuICBuZ09uSW5pdCgpOiB2b2lkIHtcbiAgICB0aGlzLmVkaXRSZWYuaW5pdCh0aGlzLnByZXNlcnZlZEZvcm1WYWx1ZSk7XG4gICAgdGhpcy5lZGl0UmVmLmZpbmFsVmFsdWUuc3Vic2NyaWJlKHRoaXMucHJlc2VydmVkRm9ybVZhbHVlQ2hhbmdlKTtcbiAgICB0aGlzLmVkaXRSZWYuYmx1cnJlZC5zdWJzY3JpYmUoKCkgPT4gdGhpcy5faGFuZGxlQmx1cigpKTtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCk6IHZvaWQge1xuICAgIHRoaXMuZGVzdHJveWVkLm5leHQoKTtcbiAgICB0aGlzLmRlc3Ryb3llZC5jb21wbGV0ZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIHRoZSBmb3JtIHN1Ym1pdHMuIElmIGlnbm9yZVN1Ym1pdFVubGVzc1ZhbGlkIGlzIHRydWUsIGNoZWNrc1xuICAgKiB0aGUgZm9ybSBmb3IgdmFsaWRpdHkgYmVmb3JlIHByb2NlZWRpbmcuXG4gICAqIFVwZGF0ZXMgdGhlIHJldmVydCBzdGF0ZSB3aXRoIHRoZSBsYXRlc3Qgc3VibWl0dGVkIHZhbHVlIHRoZW4gY2xvc2VzIHRoZSBlZGl0LlxuICAgKi9cbiAgLy8gSW4gSXZ5IHRoZSBgaG9zdGAgbWV0YWRhdGEgd2lsbCBiZSBtZXJnZWQsIHdoZXJlYXMgaW4gVmlld0VuZ2luZSBpdCBpcyBvdmVycmlkZGVuLiBJbiBvcmRlclxuICAvLyB0byBhdm9pZCBkb3VibGUgZXZlbnQgbGlzdGVuZXJzLCB3ZSBuZWVkIHRvIHVzZSBgSG9zdExpc3RlbmVyYC4gT25jZSBJdnkgaXMgdGhlIGRlZmF1bHQsIHdlXG4gIC8vIGNhbiBtb3ZlIHRoaXMgYmFjayBpbnRvIGBob3N0YC5cbiAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWhvc3QtZGVjb3JhdG9yLWluLWNvbmNyZXRlXG4gIEBIb3N0TGlzdGVuZXIoJ25nU3VibWl0JylcbiAgaGFuZGxlRm9ybVN1Ym1pdCgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5pZ25vcmVTdWJtaXRVbmxlc3NWYWxpZCAmJiAhdGhpcy5lZGl0UmVmLmlzVmFsaWQoKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuZWRpdFJlZi51cGRhdGVSZXZlcnRWYWx1ZSgpO1xuICAgIHRoaXMuZWRpdFJlZi5jbG9zZSgpO1xuICB9XG5cbiAgLyoqIENhbGxlZCBvbiBFc2NhcGUga2V5dXAuIENsb3NlcyB0aGUgZWRpdC4gKi9cbiAgY2xvc2UoKTogdm9pZCB7XG4gICAgLy8gdG9kbyAtIGFsbG93IHRoaXMgYmVoYXZpb3IgdG8gYmUgY3VzdG9taXplZCBhcyB3ZWxsLCBzdWNoIGFzIGNhbGxpbmdcbiAgICAvLyByZXNldCBiZWZvcmUgY2xvc2VcbiAgICB0aGlzLmVkaXRSZWYuY2xvc2UoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgb24gY2xpY2sgYW55d2hlcmUgaW4gdGhlIGRvY3VtZW50LlxuICAgKiBJZiB0aGUgY2xpY2sgd2FzIG91dHNpZGUgb2YgdGhlIGxlbnMsIHRyaWdnZXIgdGhlIHNwZWNpZmllZCBjbGljayBvdXQgYmVoYXZpb3IuXG4gICAqL1xuICAvLyBJbiBJdnkgdGhlIGBob3N0YCBtZXRhZGF0YSB3aWxsIGJlIG1lcmdlZCwgd2hlcmVhcyBpbiBWaWV3RW5naW5lIGl0IGlzIG92ZXJyaWRkZW4uIEluIG9yZGVyXG4gIC8vIHRvIGF2b2lkIGRvdWJsZSBldmVudCBsaXN0ZW5lcnMsIHdlIG5lZWQgdG8gdXNlIGBIb3N0TGlzdGVuZXJgLiBPbmNlIEl2eSBpcyB0aGUgZGVmYXVsdCwgd2VcbiAgLy8gY2FuIG1vdmUgdGhpcyBiYWNrIGludG8gYGhvc3RgLlxuICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8taG9zdC1kZWNvcmF0b3ItaW4tY29uY3JldGVcbiAgQEhvc3RMaXN0ZW5lcignZG9jdW1lbnQ6Y2xpY2snLCBbJyRldmVudCddKVxuICBoYW5kbGVQb3NzaWJsZUNsaWNrT3V0KGV2dDogRXZlbnQpOiB2b2lkIHtcbiAgICBpZiAoY2xvc2VzdChldnQudGFyZ2V0LCBFRElUX1BBTkVfU0VMRUNUT1IpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHN3aXRjaCAodGhpcy5jbGlja091dEJlaGF2aW9yKSB7XG4gICAgICBjYXNlICdzdWJtaXQnOlxuICAgICAgICAvLyBNYW51YWxseSBjYXVzZSB0aGUgZm9ybSB0byBzdWJtaXQgYmVmb3JlIGNsb3NpbmcuXG4gICAgICAgIHRoaXMuX3RyaWdnZXJGb3JtU3VibWl0KCk7XG4gICAgICAgIHRoaXMuZWRpdFJlZi5jbG9zZSgpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2Nsb3NlJzpcbiAgICAgICAgdGhpcy5lZGl0UmVmLmNsb3NlKCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgLy8gSW4gSXZ5IHRoZSBgaG9zdGAgbWV0YWRhdGEgd2lsbCBiZSBtZXJnZWQsIHdoZXJlYXMgaW4gVmlld0VuZ2luZSBpdCBpcyBvdmVycmlkZGVuLiBJbiBvcmRlclxuICAvLyB0byBhdm9pZCBkb3VibGUgZXZlbnQgbGlzdGVuZXJzLCB3ZSBuZWVkIHRvIHVzZSBgSG9zdExpc3RlbmVyYC4gT25jZSBJdnkgaXMgdGhlIGRlZmF1bHQsIHdlXG4gIC8vIGNhbiBtb3ZlIHRoaXMgYmFjayBpbnRvIGBob3N0YC5cbiAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWhvc3QtZGVjb3JhdG9yLWluLWNvbmNyZXRlXG4gIEBIb3N0TGlzdGVuZXIoJ2tleWRvd24nLCBbJyRldmVudCddKVxuICBfaGFuZGxlS2V5ZG93bihldmVudDogS2V5Ym9hcmRFdmVudCkge1xuICAgIGlmIChldmVudC5rZXkgPT09ICdFc2NhcGUnICYmICFoYXNNb2RpZmllcktleShldmVudCkpIHtcbiAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFRyaWdnZXJzIHN1Ym1pdCBvbiB0YWIgb3V0IGlmIGNsaWNrT3V0QmVoYXZpb3IgaXMgJ3N1Ym1pdCcuICovXG4gIHByaXZhdGUgX2hhbmRsZUJsdXIoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuY2xpY2tPdXRCZWhhdmlvciA9PT0gJ3N1Ym1pdCcpIHtcbiAgICAgIC8vIE1hbnVhbGx5IGNhdXNlIHRoZSBmb3JtIHRvIHN1Ym1pdCBiZWZvcmUgY2xvc2luZy5cbiAgICAgIHRoaXMuX3RyaWdnZXJGb3JtU3VibWl0KCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfdHJpZ2dlckZvcm1TdWJtaXQoKSB7XG4gICAgdGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQhLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCdzdWJtaXQnKSk7XG4gIH1cbn1cblxuLyoqIFJldmVydHMgdGhlIGZvcm0gdG8gaXRzIGluaXRpYWwgb3IgcHJldmlvdXNseSBzdWJtaXR0ZWQgc3RhdGUgb24gY2xpY2suICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdidXR0b25bY2RrRWRpdFJldmVydF0nLFxuICBob3N0OiB7XG4gICAgJ3R5cGUnOiAnYnV0dG9uJywgLy8gUHJldmVudHMgYWNjaWRlbnRhbCBmb3JtIHN1Ym1pdHMuXG4gIH0sXG59KVxuZXhwb3J0IGNsYXNzIENka0VkaXRSZXZlcnQ8Rm9ybVZhbHVlPiB7XG4gIC8qKiBUeXBlIG9mIHRoZSBidXR0b24uIERlZmF1bHRzIHRvIGBidXR0b25gIHRvIGF2b2lkIGFjY2lkZW50IGZvcm0gc3VibWl0cy4gKi9cbiAgQElucHV0KCkgdHlwZTogc3RyaW5nID0gJ2J1dHRvbic7XG5cbiAgY29uc3RydWN0b3IocHJvdGVjdGVkIHJlYWRvbmx5IGVkaXRSZWY6IEVkaXRSZWY8Rm9ybVZhbHVlPikge31cblxuICAvLyBJbiBJdnkgdGhlIGBob3N0YCBtZXRhZGF0YSB3aWxsIGJlIG1lcmdlZCwgd2hlcmVhcyBpbiBWaWV3RW5naW5lIGl0IGlzIG92ZXJyaWRkZW4uIEluIG9yZGVyXG4gIC8vIHRvIGF2b2lkIGRvdWJsZSBldmVudCBsaXN0ZW5lcnMsIHdlIG5lZWQgdG8gdXNlIGBIb3N0TGlzdGVuZXJgLiBPbmNlIEl2eSBpcyB0aGUgZGVmYXVsdCwgd2VcbiAgLy8gY2FuIG1vdmUgdGhpcyBiYWNrIGludG8gYGhvc3RgLlxuICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8taG9zdC1kZWNvcmF0b3ItaW4tY29uY3JldGVcbiAgQEhvc3RMaXN0ZW5lcignY2xpY2snKVxuICByZXZlcnRFZGl0KCk6IHZvaWQge1xuICAgIHRoaXMuZWRpdFJlZi5yZXNldCgpO1xuICB9XG59XG5cbi8qKiBDbG9zZXMgdGhlIGxlbnMgb24gY2xpY2suICovXG5ARGlyZWN0aXZlKHtzZWxlY3RvcjogJ1tjZGtFZGl0Q2xvc2VdJ30pXG5leHBvcnQgY2xhc3MgQ2RrRWRpdENsb3NlPEZvcm1WYWx1ZT4ge1xuICBjb25zdHJ1Y3RvcihcbiAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgZWxlbWVudFJlZjogRWxlbWVudFJlZjxIVE1MRWxlbWVudD4sXG4gICAgcHJvdGVjdGVkIHJlYWRvbmx5IGVkaXRSZWY6IEVkaXRSZWY8Rm9ybVZhbHVlPixcbiAgKSB7XG4gICAgY29uc3QgbmF0aXZlRWxlbWVudCA9IGVsZW1lbnRSZWYubmF0aXZlRWxlbWVudDtcblxuICAgIC8vIFByZXZlbnQgYWNjaWRlbnRhbCBmb3JtIHN1Ym1pdHMuXG4gICAgaWYgKG5hdGl2ZUVsZW1lbnQubm9kZU5hbWUgPT09ICdCVVRUT04nICYmICFuYXRpdmVFbGVtZW50LmdldEF0dHJpYnV0ZSgndHlwZScpKSB7XG4gICAgICBuYXRpdmVFbGVtZW50LnNldEF0dHJpYnV0ZSgndHlwZScsICdidXR0b24nKTtcbiAgICB9XG4gIH1cblxuICAvLyBJbiBJdnkgdGhlIGBob3N0YCBtZXRhZGF0YSB3aWxsIGJlIG1lcmdlZCwgd2hlcmVhcyBpbiBWaWV3RW5naW5lIGl0IGlzIG92ZXJyaWRkZW4uIEluIG9yZGVyXG4gIC8vIHRvIGF2b2lkIGRvdWJsZSBldmVudCBsaXN0ZW5lcnMsIHdlIG5lZWQgdG8gdXNlIGBIb3N0TGlzdGVuZXJgLiBPbmNlIEl2eSBpcyB0aGUgZGVmYXVsdCwgd2VcbiAgLy8gY2FuIG1vdmUgdGhpcyBiYWNrIGludG8gYGhvc3RgLlxuICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8taG9zdC1kZWNvcmF0b3ItaW4tY29uY3JldGVcbiAgQEhvc3RMaXN0ZW5lcignY2xpY2snKVxuICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8taG9zdC1kZWNvcmF0b3ItaW4tY29uY3JldGVcbiAgQEhvc3RMaXN0ZW5lcigna2V5ZG93bi5lbnRlcicpXG4gIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1ob3N0LWRlY29yYXRvci1pbi1jb25jcmV0ZVxuICBASG9zdExpc3RlbmVyKCdrZXlkb3duLnNwYWNlJylcbiAgY2xvc2VFZGl0KCk6IHZvaWQge1xuICAgIC8vIE5vdGUgdGhhdCB3ZSB1c2UgYGNsaWNrYCBoZXJlLCByYXRoZXIgdGhhbiBhIGtleWJvYXJkIGV2ZW50LCBiZWNhdXNlIHNvbWUgc2NyZWVuIHJlYWRlcnNcbiAgICAvLyB3aWxsIGVtaXQgYSBmYWtlIGNsaWNrIGV2ZW50IGluc3RlYWQgb2YgYW4gZW50ZXIga2V5Ym9hcmQgZXZlbnQgb24gYnV0dG9ucy4gRm9yIHRoZSBrZXlib2FyZFxuICAgIC8vIGV2ZW50cyB3ZSB1c2UgYGtleWRvd25gLCByYXRoZXIgdGhhbiBga2V5dXBgLCBiZWNhdXNlIHdlIHVzZSBga2V5ZG93bmAgdG8gb3BlbiB0aGUgb3ZlcmxheVxuICAgIC8vIGFzIHdlbGwuIElmIHdlIHdlcmUgdG8gdXNlIGBrZXl1cGAsIHRoZSB1c2VyIGNvdWxkIGVuZCB1cCBvcGVuaW5nIGFuZCBjbG9zaW5nIHdpdGhpblxuICAgIC8vIHRoZSBzYW1lIGV2ZW50IHNlcXVlbmNlIGlmIGZvY3VzIHdhcyBtb3ZlZCBxdWlja2x5LlxuICAgIHRoaXMuZWRpdFJlZi5jbG9zZSgpO1xuICB9XG59XG4iXX0=