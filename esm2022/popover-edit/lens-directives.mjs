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
class CdkEditControl {
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.0.0", ngImport: i0, type: CdkEditControl, deps: [{ token: i0.ElementRef }, { token: i1.EditRef }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "16.0.0", type: CdkEditControl, selector: "form[cdkEditControl]", inputs: { clickOutBehavior: ["cdkEditControlClickOutBehavior", "clickOutBehavior"], preservedFormValue: ["cdkEditControlPreservedFormValue", "preservedFormValue"], ignoreSubmitUnlessValid: ["cdkEditControlIgnoreSubmitUnlessValid", "ignoreSubmitUnlessValid"] }, outputs: { preservedFormValueChange: "cdkEditControlPreservedFormValueChange" }, host: { listeners: { "ngSubmit": "handleFormSubmit()", "document:click": "handlePossibleClickOut($event)", "keydown": "_handleKeydown($event)" } }, providers: [EditRef], ngImport: i0 }); }
}
export { CdkEditControl };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.0.0", ngImport: i0, type: CdkEditControl, decorators: [{
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
                }]
        }], ctorParameters: function () { return [{ type: i0.ElementRef }, { type: i1.EditRef }]; } });
/** Reverts the form to its initial or previously submitted state on click. */
class CdkEditRevert {
    constructor(editRef) {
        this.editRef = editRef;
        /** Type of the button. Defaults to `button` to avoid accident form submits. */
        this.type = 'button';
    }
    revertEdit() {
        this.editRef.reset();
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.0.0", ngImport: i0, type: CdkEditRevert, deps: [{ token: i1.EditRef }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "16.0.0", type: CdkEditRevert, selector: "button[cdkEditRevert]", inputs: { type: "type" }, host: { attributes: { "type": "button" }, listeners: { "click": "revertEdit()" } }, ngImport: i0 }); }
}
export { CdkEditRevert };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.0.0", ngImport: i0, type: CdkEditRevert, decorators: [{
            type: Directive,
            args: [{
                    selector: 'button[cdkEditRevert]',
                    host: {
                        'type': 'button',
                        '(click)': 'revertEdit()',
                    },
                }]
        }], ctorParameters: function () { return [{ type: i1.EditRef }]; }, propDecorators: { type: [{
                type: Input
            }] } });
/** Closes the lens on click. */
class CdkEditClose {
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.0.0", ngImport: i0, type: CdkEditClose, deps: [{ token: i0.ElementRef }, { token: i1.EditRef }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "16.0.0", type: CdkEditClose, selector: "[cdkEditClose]", host: { listeners: { "click": "closeEdit()", "keydown.enter": "closeEdit()", "keydown.space": "closeEdit()" } }, ngImport: i0 }); }
}
export { CdkEditClose };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.0.0", ngImport: i0, type: CdkEditClose, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkEditClose]',
                    host: {
                        '(click)': 'closeEdit()',
                        '(keydown.enter)': 'closeEdit()',
                        '(keydown.space)': 'closeEdit()',
                    },
                }]
        }], ctorParameters: function () { return [{ type: i0.ElementRef }, { type: i1.EditRef }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGVucy1kaXJlY3RpdmVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvcG9wb3Zlci1lZGl0L2xlbnMtZGlyZWN0aXZlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQzdCLE9BQU8sRUFBQyxTQUFTLEVBQUUsVUFBVSxFQUFFLFlBQVksRUFBcUIsS0FBSyxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQzVGLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUNyRCxPQUFPLEVBQUMsa0JBQWtCLEVBQUMsTUFBTSxhQUFhLENBQUM7QUFDL0MsT0FBTyxFQUFDLE9BQU8sRUFBQyxNQUFNLFlBQVksQ0FBQztBQUNuQyxPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sWUFBWSxDQUFDOzs7QUFLbkM7Ozs7O0dBS0c7QUFDSCxNQWVhLGNBQWM7SUF1QnpCLFlBQStCLFVBQXNCLEVBQVcsT0FBMkI7UUFBNUQsZUFBVSxHQUFWLFVBQVUsQ0FBWTtRQUFXLFlBQU8sR0FBUCxPQUFPLENBQW9CO1FBdEJ4RSxjQUFTLEdBQUcsSUFBSSxPQUFPLEVBQVEsQ0FBQztRQUVuRDs7O1dBR0c7UUFDSCxxQkFBZ0IsR0FBZ0MsT0FBTyxDQUFDO1FBUS9DLDZCQUF3QixHQUFHLElBQUksWUFBWSxFQUFhLENBQUM7UUFFbEU7OztXQUdHO1FBQ0gsNEJBQXVCLEdBQUcsSUFBSSxDQUFDO0lBRStELENBQUM7SUFFL0YsUUFBUTtRQUNOLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1FBQzNDLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsd0JBQXdCLENBQUMsQ0FBQztRQUNqRSxJQUFJLENB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YUFBYTs7U0FBYixhQUFhOzJGQUFiLGFBQWE7a0JBUHpCLFNBQVM7bUJBQUM7b0JBQ1QsUUFBUSxFQUFFLHVCQUF1QjtvQkFDakMsSUFBSSxFQUFFO3dCQUNKLE1BQU0sRUFBRSxRQUFRO3dCQUNoQixTQUFTLEVBQUUsY0FBYztxQkFDMUI7aUJBQ0Y7OEZBR1UsSUFBSTtzQkFBWixLQUFLOztBQVNSLGdDQUFnQztBQUNoQyxNQVFhLFlBQVk7SUFDdkIsWUFDcUIsVUFBbUMsRUFDbkMsT0FBMkI7UUFEM0IsZUFBVSxHQUFWLFVBQVUsQ0FBeUI7UUFDbkMsWUFBTyxHQUFQLE9BQU8sQ0FBb0I7UUFFOUMsTUFBTSxhQUFhLEdBQUcsVUFBVSxDQUFDLGFBQWEsQ0FBQztRQUUvQyxtQ0FBbUM7UUFDbkMsSUFBSSxhQUFhLENBQUMsUUFBUSxLQUFLLFFBQVEsSUFBSSxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLEVBQUU7WUFDOUUsYUFBYSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUM7U0FDOUM7SUFDSCxDQUFDO0lBRUQsU0FBUztRQUNQLDJGQUEyRjtRQUMzRiwrRkFBK0Y7UUFDL0YsNkZBQTZGO1FBQzdGLHVGQUF1RjtRQUN2RixzREFBc0Q7UUFDdEQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUN2QixDQUFDOzhHQXBCVSxZQUFZO2tHQUFaLFlBQVk7O1NBQVosWUFBWTsyRkFBWixZQUFZO2tCQVJ4QixTQUFTO21CQUFDO29CQUNULFFBQVEsRUFBRSxnQkFBZ0I7b0JBQzFCLElBQUksRUFBRTt3QkFDSixTQUFTLEVBQUUsYUFBYTt3QkFDeEIsaUJBQWlCLEVBQUUsYUFBYTt3QkFDaEMsaUJBQWlCLEVBQUUsYUFBYTtxQkFDakM7aUJBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtTdWJqZWN0fSBmcm9tICdyeGpzJztcbmltcG9ydCB7RGlyZWN0aXZlLCBFbGVtZW50UmVmLCBFdmVudEVtaXR0ZXIsIE9uRGVzdHJveSwgT25Jbml0LCBJbnB1dH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge2hhc01vZGlmaWVyS2V5fSBmcm9tICdAYW5ndWxhci9jZGsva2V5Y29kZXMnO1xuaW1wb3J0IHtFRElUX1BBTkVfU0VMRUNUT1J9IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCB7Y2xvc2VzdH0gZnJvbSAnLi9wb2x5ZmlsbCc7XG5pbXBvcnQge0VkaXRSZWZ9IGZyb20gJy4vZWRpdC1yZWYnO1xuXG4vKiogT3B0aW9ucyBmb3Igd2hhdCBkbyB0byB3aGVuIHRoZSB1c2VyIGNsaWNrcyBvdXRzaWRlIG9mIGFuIGVkaXQgbGVucy4gKi9cbmV4cG9ydCB0eXBlIFBvcG92ZXJFZGl0Q2xpY2tPdXRCZWhhdmlvciA9ICdjbG9zZScgfCAnc3VibWl0JyB8ICdub29wJztcblxuLyoqXG4gKiBBIGRpcmVjdGl2ZSB0aGF0IGF0dGFjaGVzIHRvIGEgZm9ybSB3aXRoaW4gdGhlIGVkaXQgbGVucy5cbiAqIEl0IGNvb3JkaW5hdGVzIHRoZSBmb3JtIHN0YXRlIHdpdGggdGhlIHRhYmxlLXdpZGUgZWRpdCBzeXN0ZW0gYW5kIGhhbmRsZXNcbiAqIGNsb3NpbmcgdGhlIGVkaXQgbGVucyB3aGVuIHRoZSBmb3JtIGlzIHN1Ym1pdHRlZCBvciB0aGUgdXNlciBjbGlja3NcbiAqIG91dC5cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnZm9ybVtjZGtFZGl0Q29udHJvbF0nLFxuICBpbnB1dHM6IFtcbiAgICAnY2xpY2tPdXRCZWhhdmlvcjogY2RrRWRpdENvbnRyb2xDbGlja091dEJlaGF2aW9yJyxcbiAgICAncHJlc2VydmVkRm9ybVZhbHVlOiBjZGtFZGl0Q29udHJvbFByZXNlcnZlZEZvcm1WYWx1ZScsXG4gICAgJ2lnbm9yZVN1Ym1pdFVubGVzc1ZhbGlkOiBjZGtFZGl0Q29udHJvbElnbm9yZVN1Ym1pdFVubGVzc1ZhbGlkJyxcbiAgXSxcbiAgb3V0cHV0czogWydwcmVzZXJ2ZWRGb3JtVmFsdWVDaGFuZ2U6IGNka0VkaXRDb250cm9sUHJlc2VydmVkRm9ybVZhbHVlQ2hhbmdlJ10sXG4gIHByb3ZpZGVyczogW0VkaXRSZWZdLFxuICBob3N0OiB7XG4gICAgJyhuZ1N1Ym1pdCknOiAnaGFuZGxlRm9ybVN1Ym1pdCgpJyxcbiAgICAnKGRvY3VtZW50OmNsaWNrKSc6ICdoYW5kbGVQb3NzaWJsZUNsaWNrT3V0KCRldmVudCknLFxuICAgICcoa2V5ZG93biknOiAnX2hhbmRsZUtleWRvd24oJGV2ZW50KScsXG4gIH0sXG59KVxuZXhwb3J0IGNsYXNzIENka0VkaXRDb250cm9sPEZvcm1WYWx1ZT4gaW1wbGVtZW50cyBPbkRlc3Ryb3ksIE9uSW5pdCB7XG4gIHByb3RlY3RlZCByZWFkb25seSBkZXN0cm95ZWQgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xuXG4gIC8qKlxuICAgKiBTcGVjaWZpZXMgd2hhdCBzaG91bGQgaGFwcGVuIHdoZW4gdGhlIHVzZXIgY2xpY2tzIG91dHNpZGUgb2YgdGhlIGVkaXQgbGVucy5cbiAgICogVGhlIGRlZmF1bHQgYmVoYXZpb3IgaXMgdG8gY2xvc2UgdGhlIGxlbnMgd2l0aG91dCBzdWJtaXR0aW5nIHRoZSBmb3JtLlxuICAgKi9cbiAgY2xpY2tPdXRCZWhhdmlvcjogUG9wb3ZlckVkaXRDbGlja091dEJlaGF2aW9yID0gJ2Nsb3NlJztcblxuICAvKipcbiAgICogQSB0d28td2F5IGJpbmRpbmcgZm9yIHN0b3JpbmcgdW5zdWJtaXR0ZWQgZm9ybSBzdGF0ZS4gSWYgbm90IHByb3ZpZGVkXG4gICAqIHRoZW4gZm9ybSBzdGF0ZSB3aWxsIGJlIGRpc2NhcmRlZCBvbiBjbG9zZS4gVGhlIFBlcmlzdEJ5IGRpcmVjdGl2ZSBpcyBvZmZlcmVkXG4gICAqIGFzIGEgY29udmVuaWVudCBzaG9ydGN1dCBmb3IgdGhlc2UgYmluZGluZ3MuXG4gICAqL1xuICBwcmVzZXJ2ZWRGb3JtVmFsdWU/OiBGb3JtVmFsdWU7XG4gIHJlYWRvbmx5IHByZXNlcnZlZEZvcm1WYWx1ZUNoYW5nZSA9IG5ldyBFdmVudEVtaXR0ZXI8Rm9ybVZhbHVlPigpO1xuXG4gIC8qKlxuICAgKiBEZXRlcm1pbmVzIHdoZXRoZXIgdGhlIGxlbnMgd2lsbCBjbG9zZSBvbiBmb3JtIHN1Ym1pdCBpZiB0aGUgZm9ybSBpcyBub3QgaW4gYSB2YWxpZFxuICAgKiBzdGF0ZS4gQnkgZGVmYXVsdCB0aGUgbGVucyB3aWxsIHJlbWFpbiBvcGVuLlxuICAgKi9cbiAgaWdub3JlU3VibWl0VW5sZXNzVmFsaWQgPSB0cnVlO1xuXG4gIGNvbnN0cnVjdG9yKHByb3RlY3RlZCByZWFkb25seSBlbGVtZW50UmVmOiBFbGVtZW50UmVmLCByZWFkb25seSBlZGl0UmVmOiBFZGl0UmVmPEZvcm1WYWx1ZT4pIHt9XG5cbiAgbmdPbkluaXQoKTogdm9pZCB7XG4gICAgdGhpcy5lZGl0UmVmLmluaXQodGhpcy5wcmVzZXJ2ZWRGb3JtVmFsdWUpO1xuICAgIHRoaXMuZWRpdFJlZi5maW5hbFZhbHVlLnN1YnNjcmliZSh0aGlzLnByZXNlcnZlZEZvcm1WYWx1ZUNoYW5nZSk7XG4gICAgdGhpcy5lZGl0UmVmLmJsdXJyZWQuc3Vic2NyaWJlKCgpID0+IHRoaXMuX2hhbmRsZUJsdXIoKSk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLmRlc3Ryb3llZC5uZXh0KCk7XG4gICAgdGhpcy5kZXN0cm95ZWQuY29tcGxldGUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiB0aGUgZm9ybSBzdWJtaXRzLiBJZiBpZ25vcmVTdWJtaXRVbmxlc3NWYWxpZCBpcyB0cnVlLCBjaGVja3NcbiAgICogdGhlIGZvcm0gZm9yIHZhbGlkaXR5IGJlZm9yZSBwcm9jZWVkaW5nLlxuICAgKiBVcGRhdGVzIHRoZSByZXZlcnQgc3RhdGUgd2l0aCB0aGUgbGF0ZXN0IHN1Ym1pdHRlZCB2YWx1ZSB0aGVuIGNsb3NlcyB0aGUgZWRpdC5cbiAgICovXG4gIGhhbmRsZUZvcm1TdWJtaXQoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuaWdub3JlU3VibWl0VW5sZXNzVmFsaWQgJiYgIXRoaXMuZWRpdFJlZi5pc1ZhbGlkKCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLmVkaXRSZWYudXBkYXRlUmV2ZXJ0VmFsdWUoKTtcbiAgICB0aGlzLmVkaXRSZWYuY2xvc2UoKTtcbiAgfVxuXG4gIC8qKiBDYWxsZWQgb24gRXNjYXBlIGtleXVwLiBDbG9zZXMgdGhlIGVkaXQuICovXG4gIGNsb3NlKCk6IHZvaWQge1xuICAgIC8vIHRvZG8gLSBhbGxvdyB0aGlzIGJlaGF2aW9yIHRvIGJlIGN1c3RvbWl6ZWQgYXMgd2VsbCwgc3VjaCBhcyBjYWxsaW5nXG4gICAgLy8gcmVzZXQgYmVmb3JlIGNsb3NlXG4gICAgdGhpcy5lZGl0UmVmLmNsb3NlKCk7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIG9uIGNsaWNrIGFueXdoZXJlIGluIHRoZSBkb2N1bWVudC5cbiAgICogSWYgdGhlIGNsaWNrIHdhcyBvdXRzaWRlIG9mIHRoZSBsZW5zLCB0cmlnZ2VyIHRoZSBzcGVjaWZpZWQgY2xpY2sgb3V0IGJlaGF2aW9yLlxuICAgKi9cbiAgaGFuZGxlUG9zc2libGVDbGlja091dChldnQ6IEV2ZW50KTogdm9pZCB7XG4gICAgaWYgKGNsb3Nlc3QoZXZ0LnRhcmdldCwgRURJVF9QQU5FX1NFTEVDVE9SKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBzd2l0Y2ggKHRoaXMuY2xpY2tPdXRCZWhhdmlvcikge1xuICAgICAgY2FzZSAnc3VibWl0JzpcbiAgICAgICAgLy8gTWFudWFsbHkgY2F1c2UgdGhlIGZvcm0gdG8gc3VibWl0IGJlZm9yZSBjbG9zaW5nLlxuICAgICAgICB0aGlzLl90cmlnZ2VyRm9ybVN1Ym1pdCgpO1xuICAgICAgICB0aGlzLmVkaXRSZWYuY2xvc2UoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdjbG9zZSc6XG4gICAgICAgIHRoaXMuZWRpdFJlZi5jbG9zZSgpO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIF9oYW5kbGVLZXlkb3duKGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XG4gICAgaWYgKGV2ZW50LmtleSA9PT0gJ0VzY2FwZScgJiYgIWhhc01vZGlmaWVyS2V5KGV2ZW50KSkge1xuICAgICAgdGhpcy5jbG9zZSgpO1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICB9XG4gIH1cblxuICAvKiogVHJpZ2dlcnMgc3VibWl0IG9uIHRhYiBvdXQgaWYgY2xpY2tPdXRCZWhhdmlvciBpcyAnc3VibWl0Jy4gKi9cbiAgcHJpdmF0ZSBfaGFuZGxlQmx1cigpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5jbGlja091dEJlaGF2aW9yID09PSAnc3VibWl0Jykge1xuICAgICAgLy8gTWFudWFsbHkgY2F1c2UgdGhlIGZvcm0gdG8gc3VibWl0IGJlZm9yZSBjbG9zaW5nLlxuICAgICAgdGhpcy5fdHJpZ2dlckZvcm1TdWJtaXQoKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF90cmlnZ2VyRm9ybVN1Ym1pdCgpIHtcbiAgICB0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCEuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ3N1Ym1pdCcpKTtcbiAgfVxufVxuXG4vKiogUmV2ZXJ0cyB0aGUgZm9ybSB0byBpdHMgaW5pdGlhbCBvciBwcmV2aW91c2x5IHN1Ym1pdHRlZCBzdGF0ZSBvbiBjbGljay4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ2J1dHRvbltjZGtFZGl0UmV2ZXJ0XScsXG4gIGhvc3Q6IHtcbiAgICAndHlwZSc6ICdidXR0b24nLCAvLyBQcmV2ZW50cyBhY2NpZGVudGFsIGZvcm0gc3VibWl0cy5cbiAgICAnKGNsaWNrKSc6ICdyZXZlcnRFZGl0KCknLFxuICB9LFxufSlcbmV4cG9ydCBjbGFzcyBDZGtFZGl0UmV2ZXJ0PEZvcm1WYWx1ZT4ge1xuICAvKiogVHlwZSBvZiB0aGUgYnV0dG9uLiBEZWZhdWx0cyB0byBgYnV0dG9uYCB0byBhdm9pZCBhY2NpZGVudCBmb3JtIHN1Ym1pdHMuICovXG4gIEBJbnB1dCgpIHR5cGU6IHN0cmluZyA9ICdidXR0b24nO1xuXG4gIGNvbnN0cnVjdG9yKHByb3RlY3RlZCByZWFkb25seSBlZGl0UmVmOiBFZGl0UmVmPEZvcm1WYWx1ZT4pIHt9XG5cbiAgcmV2ZXJ0RWRpdCgpOiB2b2lkIHtcbiAgICB0aGlzLmVkaXRSZWYucmVzZXQoKTtcbiAgfVxufVxuXG4vKiogQ2xvc2VzIHRoZSBsZW5zIG9uIGNsaWNrLiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW2Nka0VkaXRDbG9zZV0nLFxuICBob3N0OiB7XG4gICAgJyhjbGljayknOiAnY2xvc2VFZGl0KCknLFxuICAgICcoa2V5ZG93bi5lbnRlciknOiAnY2xvc2VFZGl0KCknLFxuICAgICcoa2V5ZG93bi5zcGFjZSknOiAnY2xvc2VFZGl0KCknLFxuICB9LFxufSlcbmV4cG9ydCBjbGFzcyBDZGtFZGl0Q2xvc2U8Rm9ybVZhbHVlPiB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHByb3RlY3RlZCByZWFkb25seSBlbGVtZW50UmVmOiBFbGVtZW50UmVmPEhUTUxFbGVtZW50PixcbiAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgZWRpdFJlZjogRWRpdFJlZjxGb3JtVmFsdWU+LFxuICApIHtcbiAgICBjb25zdCBuYXRpdmVFbGVtZW50ID0gZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50O1xuXG4gICAgLy8gUHJldmVudCBhY2NpZGVudGFsIGZvcm0gc3VibWl0cy5cbiAgICBpZiAobmF0aXZlRWxlbWVudC5ub2RlTmFtZSA9PT0gJ0JVVFRPTicgJiYgIW5hdGl2ZUVsZW1lbnQuZ2V0QXR0cmlidXRlKCd0eXBlJykpIHtcbiAgICAgIG5hdGl2ZUVsZW1lbnQuc2V0QXR0cmlidXRlKCd0eXBlJywgJ2J1dHRvbicpO1xuICAgIH1cbiAgfVxuXG4gIGNsb3NlRWRpdCgpOiB2b2lkIHtcbiAgICAvLyBOb3RlIHRoYXQgd2UgdXNlIGBjbGlja2AgaGVyZSwgcmF0aGVyIHRoYW4gYSBrZXlib2FyZCBldmVudCwgYmVjYXVzZSBzb21lIHNjcmVlbiByZWFkZXJzXG4gICAgLy8gd2lsbCBlbWl0IGEgZmFrZSBjbGljayBldmVudCBpbnN0ZWFkIG9mIGFuIGVudGVyIGtleWJvYXJkIGV2ZW50IG9uIGJ1dHRvbnMuIEZvciB0aGUga2V5Ym9hcmRcbiAgICAvLyBldmVudHMgd2UgdXNlIGBrZXlkb3duYCwgcmF0aGVyIHRoYW4gYGtleXVwYCwgYmVjYXVzZSB3ZSB1c2UgYGtleWRvd25gIHRvIG9wZW4gdGhlIG92ZXJsYXlcbiAgICAvLyBhcyB3ZWxsLiBJZiB3ZSB3ZXJlIHRvIHVzZSBga2V5dXBgLCB0aGUgdXNlciBjb3VsZCBlbmQgdXAgb3BlbmluZyBhbmQgY2xvc2luZyB3aXRoaW5cbiAgICAvLyB0aGUgc2FtZSBldmVudCBzZXF1ZW5jZSBpZiBmb2N1cyB3YXMgbW92ZWQgcXVpY2tseS5cbiAgICB0aGlzLmVkaXRSZWYuY2xvc2UoKTtcbiAgfVxufVxuIl19