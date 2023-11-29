/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Subject } from 'rxjs';
import { Directive, ElementRef, EventEmitter, Input } from '@angular/core';
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.0.4", ngImport: i0, type: CdkEditControl, deps: [{ token: i0.ElementRef }, { token: i1.EditRef }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "17.0.4", type: CdkEditControl, isStandalone: true, selector: "form[cdkEditControl]", inputs: { clickOutBehavior: ["cdkEditControlClickOutBehavior", "clickOutBehavior"], preservedFormValue: ["cdkEditControlPreservedFormValue", "preservedFormValue"], ignoreSubmitUnlessValid: ["cdkEditControlIgnoreSubmitUnlessValid", "ignoreSubmitUnlessValid"] }, outputs: { preservedFormValueChange: "cdkEditControlPreservedFormValueChange" }, host: { listeners: { "ngSubmit": "handleFormSubmit()", "document:click": "handlePossibleClickOut($event)", "keydown": "_handleKeydown($event)" } }, providers: [EditRef], ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.0.4", ngImport: i0, type: CdkEditControl, decorators: [{
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
                    host: {
                        '(ngSubmit)': 'handleFormSubmit()',
                        '(document:click)': 'handlePossibleClickOut($event)',
                        '(keydown)': '_handleKeydown($event)',
                    },
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: i1.EditRef }] });
/** Reverts the form to its initial or previously submitted state on click. */
export class CdkEditRevert {
    constructor(editRef) {
        this.editRef = editRef;
        /** Type of the button. Defaults to `button` to avoid accident form submits. */
        this.type = 'button';
    }
    revertEdit() {
        this.editRef.reset();
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.0.4", ngImport: i0, type: CdkEditRevert, deps: [{ token: i1.EditRef }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "17.0.4", type: CdkEditRevert, isStandalone: true, selector: "button[cdkEditRevert]", inputs: { type: "type" }, host: { attributes: { "type": "button" }, listeners: { "click": "revertEdit()" } }, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.0.4", ngImport: i0, type: CdkEditRevert, decorators: [{
            type: Directive,
            args: [{
                    selector: 'button[cdkEditRevert]',
                    host: {
                        'type': 'button',
                        '(click)': 'revertEdit()',
                    },
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: i1.EditRef }], propDecorators: { type: [{
                type: Input
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
    closeEdit() {
        // Note that we use `click` here, rather than a keyboard event, because some screen readers
        // will emit a fake click event instead of an enter keyboard event on buttons. For the keyboard
        // events we use `keydown`, rather than `keyup`, because we use `keydown` to open the overlay
        // as well. If we were to use `keyup`, the user could end up opening and closing within
        // the same event sequence if focus was moved quickly.
        this.editRef.close();
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.0.4", ngImport: i0, type: CdkEditClose, deps: [{ token: i0.ElementRef }, { token: i1.EditRef }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "17.0.4", type: CdkEditClose, isStandalone: true, selector: "[cdkEditClose]", host: { listeners: { "click": "closeEdit()", "keydown.enter": "closeEdit()", "keydown.space": "closeEdit()" } }, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.0.4", ngImport: i0, type: CdkEditClose, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkEditClose]',
                    host: {
                        '(click)': 'closeEdit()',
                        '(keydown.enter)': 'closeEdit()',
                        '(keydown.space)': 'closeEdit()',
                    },
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: i1.EditRef }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGVucy1kaXJlY3RpdmVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvcG9wb3Zlci1lZGl0L2xlbnMtZGlyZWN0aXZlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQzdCLE9BQU8sRUFBQyxTQUFTLEVBQUUsVUFBVSxFQUFFLFlBQVksRUFBcUIsS0FBSyxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQzVGLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUNyRCxPQUFPLEVBQUMsa0JBQWtCLEVBQUMsTUFBTSxhQUFhLENBQUM7QUFDL0MsT0FBTyxFQUFDLE9BQU8sRUFBQyxNQUFNLFlBQVksQ0FBQztBQUNuQyxPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sWUFBWSxDQUFDOzs7QUFLbkM7Ozs7O0dBS0c7QUFpQkgsTUFBTSxPQUFPLGNBQWM7SUF1QnpCLFlBQ3FCLFVBQXNCLEVBQ2hDLE9BQTJCO1FBRGpCLGVBQVUsR0FBVixVQUFVLENBQVk7UUFDaEMsWUFBTyxHQUFQLE9BQU8sQ0FBb0I7UUF4Qm5CLGNBQVMsR0FBRyxJQUFJLE9BQU8sRUFBUSxDQUFDO1FBRW5EOzs7V0FHRztRQUNILHFCQUFnQixHQUFnQyxPQUFPLENBQUM7UUFRL0MsNkJBQXdCLEdBQUcsSUFBSSxZQUFZLEVBQWEsQ0FBQztRQUVsRTs7O1dBR0c7UUFDSCw0QkFBdUIsR0FBRyxJQUFJLENBQUM7SUFLNUIsQ0FBQztJQUVKLFFBQVE7UUFDTixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUMzQyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLENBQUM7UUFDakUs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IExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtTdWJqZWN0fSBmcm9tICdyeGpzJztcbmltcG9ydCB7RGlyZWN0aXZlLCBFbGVtZW50UmVmLCBFdmVudEVtaXR0ZXIsIE9uRGVzdHJveSwgT25Jbml0LCBJbnB1dH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge2hhc01vZGlmaWVyS2V5fSBmcm9tICdAYW5ndWxhci9jZGsva2V5Y29kZXMnO1xuaW1wb3J0IHtFRElUX1BBTkVfU0VMRUNUT1J9IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCB7Y2xvc2VzdH0gZnJvbSAnLi9wb2x5ZmlsbCc7XG5pbXBvcnQge0VkaXRSZWZ9IGZyb20gJy4vZWRpdC1yZWYnO1xuXG4vKiogT3B0aW9ucyBmb3Igd2hhdCBkbyB0byB3aGVuIHRoZSB1c2VyIGNsaWNrcyBvdXRzaWRlIG9mIGFuIGVkaXQgbGVucy4gKi9cbmV4cG9ydCB0eXBlIFBvcG92ZXJFZGl0Q2xpY2tPdXRCZWhhdmlvciA9ICdjbG9zZScgfCAnc3VibWl0JyB8ICdub29wJztcblxuLyoqXG4gKiBBIGRpcmVjdGl2ZSB0aGF0IGF0dGFjaGVzIHRvIGEgZm9ybSB3aXRoaW4gdGhlIGVkaXQgbGVucy5cbiAqIEl0IGNvb3JkaW5hdGVzIHRoZSBmb3JtIHN0YXRlIHdpdGggdGhlIHRhYmxlLXdpZGUgZWRpdCBzeXN0ZW0gYW5kIGhhbmRsZXNcbiAqIGNsb3NpbmcgdGhlIGVkaXQgbGVucyB3aGVuIHRoZSBmb3JtIGlzIHN1Ym1pdHRlZCBvciB0aGUgdXNlciBjbGlja3NcbiAqIG91dC5cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnZm9ybVtjZGtFZGl0Q29udHJvbF0nLFxuICBpbnB1dHM6IFtcbiAgICAnY2xpY2tPdXRCZWhhdmlvcjogY2RrRWRpdENvbnRyb2xDbGlja091dEJlaGF2aW9yJyxcbiAgICAncHJlc2VydmVkRm9ybVZhbHVlOiBjZGtFZGl0Q29udHJvbFByZXNlcnZlZEZvcm1WYWx1ZScsXG4gICAgJ2lnbm9yZVN1Ym1pdFVubGVzc1ZhbGlkOiBjZGtFZGl0Q29udHJvbElnbm9yZVN1Ym1pdFVubGVzc1ZhbGlkJyxcbiAgXSxcbiAgb3V0cHV0czogWydwcmVzZXJ2ZWRGb3JtVmFsdWVDaGFuZ2U6IGNka0VkaXRDb250cm9sUHJlc2VydmVkRm9ybVZhbHVlQ2hhbmdlJ10sXG4gIHByb3ZpZGVyczogW0VkaXRSZWZdLFxuICBob3N0OiB7XG4gICAgJyhuZ1N1Ym1pdCknOiAnaGFuZGxlRm9ybVN1Ym1pdCgpJyxcbiAgICAnKGRvY3VtZW50OmNsaWNrKSc6ICdoYW5kbGVQb3NzaWJsZUNsaWNrT3V0KCRldmVudCknLFxuICAgICcoa2V5ZG93biknOiAnX2hhbmRsZUtleWRvd24oJGV2ZW50KScsXG4gIH0sXG4gIHN0YW5kYWxvbmU6IHRydWUsXG59KVxuZXhwb3J0IGNsYXNzIENka0VkaXRDb250cm9sPEZvcm1WYWx1ZT4gaW1wbGVtZW50cyBPbkRlc3Ryb3ksIE9uSW5pdCB7XG4gIHByb3RlY3RlZCByZWFkb25seSBkZXN0cm95ZWQgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xuXG4gIC8qKlxuICAgKiBTcGVjaWZpZXMgd2hhdCBzaG91bGQgaGFwcGVuIHdoZW4gdGhlIHVzZXIgY2xpY2tzIG91dHNpZGUgb2YgdGhlIGVkaXQgbGVucy5cbiAgICogVGhlIGRlZmF1bHQgYmVoYXZpb3IgaXMgdG8gY2xvc2UgdGhlIGxlbnMgd2l0aG91dCBzdWJtaXR0aW5nIHRoZSBmb3JtLlxuICAgKi9cbiAgY2xpY2tPdXRCZWhhdmlvcjogUG9wb3ZlckVkaXRDbGlja091dEJlaGF2aW9yID0gJ2Nsb3NlJztcblxuICAvKipcbiAgICogQSB0d28td2F5IGJpbmRpbmcgZm9yIHN0b3JpbmcgdW5zdWJtaXR0ZWQgZm9ybSBzdGF0ZS4gSWYgbm90IHByb3ZpZGVkXG4gICAqIHRoZW4gZm9ybSBzdGF0ZSB3aWxsIGJlIGRpc2NhcmRlZCBvbiBjbG9zZS4gVGhlIFBlcmlzdEJ5IGRpcmVjdGl2ZSBpcyBvZmZlcmVkXG4gICAqIGFzIGEgY29udmVuaWVudCBzaG9ydGN1dCBmb3IgdGhlc2UgYmluZGluZ3MuXG4gICAqL1xuICBwcmVzZXJ2ZWRGb3JtVmFsdWU/OiBGb3JtVmFsdWU7XG4gIHJlYWRvbmx5IHByZXNlcnZlZEZvcm1WYWx1ZUNoYW5nZSA9IG5ldyBFdmVudEVtaXR0ZXI8Rm9ybVZhbHVlPigpO1xuXG4gIC8qKlxuICAgKiBEZXRlcm1pbmVzIHdoZXRoZXIgdGhlIGxlbnMgd2lsbCBjbG9zZSBvbiBmb3JtIHN1Ym1pdCBpZiB0aGUgZm9ybSBpcyBub3QgaW4gYSB2YWxpZFxuICAgKiBzdGF0ZS4gQnkgZGVmYXVsdCB0aGUgbGVucyB3aWxsIHJlbWFpbiBvcGVuLlxuICAgKi9cbiAgaWdub3JlU3VibWl0VW5sZXNzVmFsaWQgPSB0cnVlO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByb3RlY3RlZCByZWFkb25seSBlbGVtZW50UmVmOiBFbGVtZW50UmVmLFxuICAgIHJlYWRvbmx5IGVkaXRSZWY6IEVkaXRSZWY8Rm9ybVZhbHVlPixcbiAgKSB7fVxuXG4gIG5nT25Jbml0KCk6IHZvaWQge1xuICAgIHRoaXMuZWRpdFJlZi5pbml0KHRoaXMucHJlc2VydmVkRm9ybVZhbHVlKTtcbiAgICB0aGlzLmVkaXRSZWYuZmluYWxWYWx1ZS5zdWJzY3JpYmUodGhpcy5wcmVzZXJ2ZWRGb3JtVmFsdWVDaGFuZ2UpO1xuICAgIHRoaXMuZWRpdFJlZi5ibHVycmVkLnN1YnNjcmliZSgoKSA9PiB0aGlzLl9oYW5kbGVCbHVyKCkpO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgdGhpcy5kZXN0cm95ZWQubmV4dCgpO1xuICAgIHRoaXMuZGVzdHJveWVkLmNvbXBsZXRlKCk7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gdGhlIGZvcm0gc3VibWl0cy4gSWYgaWdub3JlU3VibWl0VW5sZXNzVmFsaWQgaXMgdHJ1ZSwgY2hlY2tzXG4gICAqIHRoZSBmb3JtIGZvciB2YWxpZGl0eSBiZWZvcmUgcHJvY2VlZGluZy5cbiAgICogVXBkYXRlcyB0aGUgcmV2ZXJ0IHN0YXRlIHdpdGggdGhlIGxhdGVzdCBzdWJtaXR0ZWQgdmFsdWUgdGhlbiBjbG9zZXMgdGhlIGVkaXQuXG4gICAqL1xuICBoYW5kbGVGb3JtU3VibWl0KCk6IHZvaWQge1xuICAgIGlmICh0aGlzLmlnbm9yZVN1Ym1pdFVubGVzc1ZhbGlkICYmICF0aGlzLmVkaXRSZWYuaXNWYWxpZCgpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5lZGl0UmVmLnVwZGF0ZVJldmVydFZhbHVlKCk7XG4gICAgdGhpcy5lZGl0UmVmLmNsb3NlKCk7XG4gIH1cblxuICAvKiogQ2FsbGVkIG9uIEVzY2FwZSBrZXl1cC4gQ2xvc2VzIHRoZSBlZGl0LiAqL1xuICBjbG9zZSgpOiB2b2lkIHtcbiAgICAvLyB0b2RvIC0gYWxsb3cgdGhpcyBiZWhhdmlvciB0byBiZSBjdXN0b21pemVkIGFzIHdlbGwsIHN1Y2ggYXMgY2FsbGluZ1xuICAgIC8vIHJlc2V0IGJlZm9yZSBjbG9zZVxuICAgIHRoaXMuZWRpdFJlZi5jbG9zZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxlZCBvbiBjbGljayBhbnl3aGVyZSBpbiB0aGUgZG9jdW1lbnQuXG4gICAqIElmIHRoZSBjbGljayB3YXMgb3V0c2lkZSBvZiB0aGUgbGVucywgdHJpZ2dlciB0aGUgc3BlY2lmaWVkIGNsaWNrIG91dCBiZWhhdmlvci5cbiAgICovXG4gIGhhbmRsZVBvc3NpYmxlQ2xpY2tPdXQoZXZ0OiBFdmVudCk6IHZvaWQge1xuICAgIGlmIChjbG9zZXN0KGV2dC50YXJnZXQsIEVESVRfUEFORV9TRUxFQ1RPUikpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgc3dpdGNoICh0aGlzLmNsaWNrT3V0QmVoYXZpb3IpIHtcbiAgICAgIGNhc2UgJ3N1Ym1pdCc6XG4gICAgICAgIC8vIE1hbnVhbGx5IGNhdXNlIHRoZSBmb3JtIHRvIHN1Ym1pdCBiZWZvcmUgY2xvc2luZy5cbiAgICAgICAgdGhpcy5fdHJpZ2dlckZvcm1TdWJtaXQoKTtcbiAgICAgICAgdGhpcy5lZGl0UmVmLmNsb3NlKCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnY2xvc2UnOlxuICAgICAgICB0aGlzLmVkaXRSZWYuY2xvc2UoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICBfaGFuZGxlS2V5ZG93bihldmVudDogS2V5Ym9hcmRFdmVudCkge1xuICAgIGlmIChldmVudC5rZXkgPT09ICdFc2NhcGUnICYmICFoYXNNb2RpZmllcktleShldmVudCkpIHtcbiAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFRyaWdnZXJzIHN1Ym1pdCBvbiB0YWIgb3V0IGlmIGNsaWNrT3V0QmVoYXZpb3IgaXMgJ3N1Ym1pdCcuICovXG4gIHByaXZhdGUgX2hhbmRsZUJsdXIoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuY2xpY2tPdXRCZWhhdmlvciA9PT0gJ3N1Ym1pdCcpIHtcbiAgICAgIC8vIE1hbnVhbGx5IGNhdXNlIHRoZSBmb3JtIHRvIHN1Ym1pdCBiZWZvcmUgY2xvc2luZy5cbiAgICAgIHRoaXMuX3RyaWdnZXJGb3JtU3VibWl0KCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfdHJpZ2dlckZvcm1TdWJtaXQoKSB7XG4gICAgdGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQhLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCdzdWJtaXQnKSk7XG4gIH1cbn1cblxuLyoqIFJldmVydHMgdGhlIGZvcm0gdG8gaXRzIGluaXRpYWwgb3IgcHJldmlvdXNseSBzdWJtaXR0ZWQgc3RhdGUgb24gY2xpY2suICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdidXR0b25bY2RrRWRpdFJldmVydF0nLFxuICBob3N0OiB7XG4gICAgJ3R5cGUnOiAnYnV0dG9uJyxcbiAgICAnKGNsaWNrKSc6ICdyZXZlcnRFZGl0KCknLFxuICB9LFxuICBzdGFuZGFsb25lOiB0cnVlLFxufSlcbmV4cG9ydCBjbGFzcyBDZGtFZGl0UmV2ZXJ0PEZvcm1WYWx1ZT4ge1xuICAvKiogVHlwZSBvZiB0aGUgYnV0dG9uLiBEZWZhdWx0cyB0byBgYnV0dG9uYCB0byBhdm9pZCBhY2NpZGVudCBmb3JtIHN1Ym1pdHMuICovXG4gIEBJbnB1dCgpIHR5cGU6IHN0cmluZyA9ICdidXR0b24nO1xuXG4gIGNvbnN0cnVjdG9yKHByb3RlY3RlZCByZWFkb25seSBlZGl0UmVmOiBFZGl0UmVmPEZvcm1WYWx1ZT4pIHt9XG5cbiAgcmV2ZXJ0RWRpdCgpOiB2b2lkIHtcbiAgICB0aGlzLmVkaXRSZWYucmVzZXQoKTtcbiAgfVxufVxuXG4vKiogQ2xvc2VzIHRoZSBsZW5zIG9uIGNsaWNrLiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW2Nka0VkaXRDbG9zZV0nLFxuICBob3N0OiB7XG4gICAgJyhjbGljayknOiAnY2xvc2VFZGl0KCknLFxuICAgICcoa2V5ZG93bi5lbnRlciknOiAnY2xvc2VFZGl0KCknLFxuICAgICcoa2V5ZG93bi5zcGFjZSknOiAnY2xvc2VFZGl0KCknLFxuICB9LFxuICBzdGFuZGFsb25lOiB0cnVlLFxufSlcbmV4cG9ydCBjbGFzcyBDZGtFZGl0Q2xvc2U8Rm9ybVZhbHVlPiB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHByb3RlY3RlZCByZWFkb25seSBlbGVtZW50UmVmOiBFbGVtZW50UmVmPEhUTUxFbGVtZW50PixcbiAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgZWRpdFJlZjogRWRpdFJlZjxGb3JtVmFsdWU+LFxuICApIHtcbiAgICBjb25zdCBuYXRpdmVFbGVtZW50ID0gZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50O1xuXG4gICAgLy8gUHJldmVudCBhY2NpZGVudGFsIGZvcm0gc3VibWl0cy5cbiAgICBpZiAobmF0aXZlRWxlbWVudC5ub2RlTmFtZSA9PT0gJ0JVVFRPTicgJiYgIW5hdGl2ZUVsZW1lbnQuZ2V0QXR0cmlidXRlKCd0eXBlJykpIHtcbiAgICAgIG5hdGl2ZUVsZW1lbnQuc2V0QXR0cmlidXRlKCd0eXBlJywgJ2J1dHRvbicpO1xuICAgIH1cbiAgfVxuXG4gIGNsb3NlRWRpdCgpOiB2b2lkIHtcbiAgICAvLyBOb3RlIHRoYXQgd2UgdXNlIGBjbGlja2AgaGVyZSwgcmF0aGVyIHRoYW4gYSBrZXlib2FyZCBldmVudCwgYmVjYXVzZSBzb21lIHNjcmVlbiByZWFkZXJzXG4gICAgLy8gd2lsbCBlbWl0IGEgZmFrZSBjbGljayBldmVudCBpbnN0ZWFkIG9mIGFuIGVudGVyIGtleWJvYXJkIGV2ZW50IG9uIGJ1dHRvbnMuIEZvciB0aGUga2V5Ym9hcmRcbiAgICAvLyBldmVudHMgd2UgdXNlIGBrZXlkb3duYCwgcmF0aGVyIHRoYW4gYGtleXVwYCwgYmVjYXVzZSB3ZSB1c2UgYGtleWRvd25gIHRvIG9wZW4gdGhlIG92ZXJsYXlcbiAgICAvLyBhcyB3ZWxsLiBJZiB3ZSB3ZXJlIHRvIHVzZSBga2V5dXBgLCB0aGUgdXNlciBjb3VsZCBlbmQgdXAgb3BlbmluZyBhbmQgY2xvc2luZyB3aXRoaW5cbiAgICAvLyB0aGUgc2FtZSBldmVudCBzZXF1ZW5jZSBpZiBmb2N1cyB3YXMgbW92ZWQgcXVpY2tseS5cbiAgICB0aGlzLmVkaXRSZWYuY2xvc2UoKTtcbiAgfVxufVxuIl19