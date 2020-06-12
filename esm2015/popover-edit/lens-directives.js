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
/**
 * A directive that attaches to a form within the edit lens.
 * It coordinates the form state with the table-wide edit system and handles
 * closing the edit lens when the form is submitted or the user clicks
 * out.
 */
let CdkEditControl = /** @class */ (() => {
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
    }
    CdkEditControl.decorators = [
        { type: Directive, args: [{
                    selector: 'form[cdkEditControl]',
                    inputs: [
                        'clickOutBehavior: cdkEditControlClickOutBehavior',
                        'preservedFormValue: cdkEditControlPreservedFormValue',
                        'ignoreSubmitUnlessValid: cdkEditControlIgnoreSubmitUnlessValid',
                    ],
                    outputs: ['preservedFormValueChange: cdkEditControlPreservedFormValueChange'],
                    providers: [EditRef],
                },] }
    ];
    CdkEditControl.ctorParameters = () => [
        { type: ElementRef },
        { type: EditRef }
    ];
    CdkEditControl.propDecorators = {
        handleFormSubmit: [{ type: HostListener, args: ['ngSubmit',] }],
        handlePossibleClickOut: [{ type: HostListener, args: ['document:click', ['$event'],] }],
        _handleKeydown: [{ type: HostListener, args: ['keydown', ['$event'],] }]
    };
    return CdkEditControl;
})();
export { CdkEditControl };
/** Reverts the form to its initial or previously submitted state on click. */
let CdkEditRevert = /** @class */ (() => {
    class CdkEditRevert {
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
    }
    CdkEditRevert.decorators = [
        { type: Directive, args: [{
                    selector: 'button[cdkEditRevert]',
                    host: {
                        'type': 'button',
                    }
                },] }
    ];
    CdkEditRevert.ctorParameters = () => [
        { type: EditRef }
    ];
    CdkEditRevert.propDecorators = {
        type: [{ type: Input }],
        revertEdit: [{ type: HostListener, args: ['click',] }]
    };
    return CdkEditRevert;
})();
export { CdkEditRevert };
/** Closes the lens on click. */
let CdkEditClose = /** @class */ (() => {
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
        // In Ivy the `host` metadata will be merged, whereas in ViewEngine it is overridden. In order
        // to avoid double event listeners, we need to use `HostListener`. Once Ivy is the default, we
        // can move this back into `host`.
        // tslint:disable:no-host-decorator-in-concrete
        closeEdit() {
            // Note that we use `click` here, rather than a keyboard event, because some screen readers
            // will emit a fake click event instead of an enter keyboard event on buttons.
            this.editRef.close();
        }
    }
    CdkEditClose.decorators = [
        { type: Directive, args: [{ selector: '[cdkEditClose]' },] }
    ];
    CdkEditClose.ctorParameters = () => [
        { type: ElementRef },
        { type: EditRef }
    ];
    CdkEditClose.propDecorators = {
        closeEdit: [{ type: HostListener, args: ['click',] }, { type: HostListener, args: ['keyup.enter',] }, { type: HostListener, args: ['keyup.space',] }]
    };
    return CdkEditClose;
})();
export { CdkEditClose };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGVucy1kaXJlY3RpdmVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvcG9wb3Zlci1lZGl0L2xlbnMtZGlyZWN0aXZlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQzdCLE9BQU8sRUFDTCxTQUFTLEVBQ1QsVUFBVSxFQUNWLFlBQVksRUFHWixLQUFLLEVBQ0wsWUFBWSxHQUNiLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUNyRCxPQUFPLEVBQUMsa0JBQWtCLEVBQUMsTUFBTSxhQUFhLENBQUM7QUFDL0MsT0FBTyxFQUFDLE9BQU8sRUFBQyxNQUFNLFlBQVksQ0FBQztBQUNuQyxPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sWUFBWSxDQUFDO0FBS25DOzs7OztHQUtHO0FBQ0g7SUFBQSxNQVVhLGNBQWM7UUF1QnpCLFlBQStCLFVBQXNCLEVBQVcsT0FBMkI7WUFBNUQsZUFBVSxHQUFWLFVBQVUsQ0FBWTtZQUFXLFlBQU8sR0FBUCxPQUFPLENBQW9CO1lBdEJ4RSxjQUFTLEdBQUcsSUFBSSxPQUFPLEVBQVEsQ0FBQztZQUVuRDs7O2VBR0c7WUFDSCxxQkFBZ0IsR0FBZ0MsT0FBTyxDQUFDO1lBUS9DLDZCQUF3QixHQUFHLElBQUksWUFBWSxFQUFhLENBQUM7WUFFbEU7OztlQUdHO1lBQ0gsNEJBQXVCLEdBQUcsSUFBSSxDQUFDO1FBRStELENBQUM7UUFFL0YsUUFBUTtZQUNOLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1lBQzNDLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsd0JBQXdCLENBQUMsQ0FBQztZ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O2dCQXRLckMsVUFBVTtnQkFVSixPQUFPOzs7NEJBOEtaLFlBQVksU0FBQyxPQUFPLGNBQ3BCLFlBQVksU0FBQyxhQUFhLGNBQzFCLFlBQVksU0FBQyxhQUFhOztJQU03QixtQkFBQztLQUFBO1NBekJZLFlBQVkiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtTdWJqZWN0fSBmcm9tICdyeGpzJztcbmltcG9ydCB7XG4gIERpcmVjdGl2ZSxcbiAgRWxlbWVudFJlZixcbiAgRXZlbnRFbWl0dGVyLFxuICBPbkRlc3Ryb3ksXG4gIE9uSW5pdCxcbiAgSW5wdXQsXG4gIEhvc3RMaXN0ZW5lcixcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge2hhc01vZGlmaWVyS2V5fSBmcm9tICdAYW5ndWxhci9jZGsva2V5Y29kZXMnO1xuaW1wb3J0IHtFRElUX1BBTkVfU0VMRUNUT1J9IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCB7Y2xvc2VzdH0gZnJvbSAnLi9wb2x5ZmlsbCc7XG5pbXBvcnQge0VkaXRSZWZ9IGZyb20gJy4vZWRpdC1yZWYnO1xuXG4vKiogT3B0aW9ucyBmb3Igd2hhdCBkbyB0byB3aGVuIHRoZSB1c2VyIGNsaWNrcyBvdXRzaWRlIG9mIGFuIGVkaXQgbGVucy4gKi9cbmV4cG9ydCB0eXBlIFBvcG92ZXJFZGl0Q2xpY2tPdXRCZWhhdmlvciA9ICdjbG9zZScgfCAnc3VibWl0JyB8ICdub29wJztcblxuLyoqXG4gKiBBIGRpcmVjdGl2ZSB0aGF0IGF0dGFjaGVzIHRvIGEgZm9ybSB3aXRoaW4gdGhlIGVkaXQgbGVucy5cbiAqIEl0IGNvb3JkaW5hdGVzIHRoZSBmb3JtIHN0YXRlIHdpdGggdGhlIHRhYmxlLXdpZGUgZWRpdCBzeXN0ZW0gYW5kIGhhbmRsZXNcbiAqIGNsb3NpbmcgdGhlIGVkaXQgbGVucyB3aGVuIHRoZSBmb3JtIGlzIHN1Ym1pdHRlZCBvciB0aGUgdXNlciBjbGlja3NcbiAqIG91dC5cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnZm9ybVtjZGtFZGl0Q29udHJvbF0nLFxuICBpbnB1dHM6IFtcbiAgICAnY2xpY2tPdXRCZWhhdmlvcjogY2RrRWRpdENvbnRyb2xDbGlja091dEJlaGF2aW9yJyxcbiAgICAncHJlc2VydmVkRm9ybVZhbHVlOiBjZGtFZGl0Q29udHJvbFByZXNlcnZlZEZvcm1WYWx1ZScsXG4gICAgJ2lnbm9yZVN1Ym1pdFVubGVzc1ZhbGlkOiBjZGtFZGl0Q29udHJvbElnbm9yZVN1Ym1pdFVubGVzc1ZhbGlkJyxcbiAgXSxcbiAgb3V0cHV0czogWydwcmVzZXJ2ZWRGb3JtVmFsdWVDaGFuZ2U6IGNka0VkaXRDb250cm9sUHJlc2VydmVkRm9ybVZhbHVlQ2hhbmdlJ10sXG4gIHByb3ZpZGVyczogW0VkaXRSZWZdLFxufSlcbmV4cG9ydCBjbGFzcyBDZGtFZGl0Q29udHJvbDxGb3JtVmFsdWU+IGltcGxlbWVudHMgT25EZXN0cm95LCBPbkluaXQge1xuICBwcm90ZWN0ZWQgcmVhZG9ubHkgZGVzdHJveWVkID0gbmV3IFN1YmplY3Q8dm9pZD4oKTtcblxuICAvKipcbiAgICogU3BlY2lmaWVzIHdoYXQgc2hvdWxkIGhhcHBlbiB3aGVuIHRoZSB1c2VyIGNsaWNrcyBvdXRzaWRlIG9mIHRoZSBlZGl0IGxlbnMuXG4gICAqIFRoZSBkZWZhdWx0IGJlaGF2aW9yIGlzIHRvIGNsb3NlIHRoZSBsZW5zIHdpdGhvdXQgc3VibWl0dGluZyB0aGUgZm9ybS5cbiAgICovXG4gIGNsaWNrT3V0QmVoYXZpb3I6IFBvcG92ZXJFZGl0Q2xpY2tPdXRCZWhhdmlvciA9ICdjbG9zZSc7XG5cbiAgLyoqXG4gICAqIEEgdHdvLXdheSBiaW5kaW5nIGZvciBzdG9yaW5nIHVuc3VibWl0dGVkIGZvcm0gc3RhdGUuIElmIG5vdCBwcm92aWRlZFxuICAgKiB0aGVuIGZvcm0gc3RhdGUgd2lsbCBiZSBkaXNjYXJkZWQgb24gY2xvc2UuIFRoZSBQZXJpc3RCeSBkaXJlY3RpdmUgaXMgb2ZmZXJlZFxuICAgKiBhcyBhIGNvbnZlbmllbnQgc2hvcnRjdXQgZm9yIHRoZXNlIGJpbmRpbmdzLlxuICAgKi9cbiAgcHJlc2VydmVkRm9ybVZhbHVlPzogRm9ybVZhbHVlO1xuICByZWFkb25seSBwcmVzZXJ2ZWRGb3JtVmFsdWVDaGFuZ2UgPSBuZXcgRXZlbnRFbWl0dGVyPEZvcm1WYWx1ZT4oKTtcblxuICAvKipcbiAgICogRGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSBsZW5zIHdpbGwgY2xvc2Ugb24gZm9ybSBzdWJtaXQgaWYgdGhlIGZvcm0gaXMgbm90IGluIGEgdmFsaWRcbiAgICogc3RhdGUuIEJ5IGRlZmF1bHQgdGhlIGxlbnMgd2lsbCByZW1haW4gb3Blbi5cbiAgICovXG4gIGlnbm9yZVN1Ym1pdFVubGVzc1ZhbGlkID0gdHJ1ZTtcblxuICBjb25zdHJ1Y3Rvcihwcm90ZWN0ZWQgcmVhZG9ubHkgZWxlbWVudFJlZjogRWxlbWVudFJlZiwgcmVhZG9ubHkgZWRpdFJlZjogRWRpdFJlZjxGb3JtVmFsdWU+KSB7fVxuXG4gIG5nT25Jbml0KCk6IHZvaWQge1xuICAgIHRoaXMuZWRpdFJlZi5pbml0KHRoaXMucHJlc2VydmVkRm9ybVZhbHVlKTtcbiAgICB0aGlzLmVkaXRSZWYuZmluYWxWYWx1ZS5zdWJzY3JpYmUodGhpcy5wcmVzZXJ2ZWRGb3JtVmFsdWVDaGFuZ2UpO1xuICAgIHRoaXMuZWRpdFJlZi5ibHVycmVkLnN1YnNjcmliZSgoKSA9PiB0aGlzLl9oYW5kbGVCbHVyKCkpO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgdGhpcy5kZXN0cm95ZWQubmV4dCgpO1xuICAgIHRoaXMuZGVzdHJveWVkLmNvbXBsZXRlKCk7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gdGhlIGZvcm0gc3VibWl0cy4gSWYgaWdub3JlU3VibWl0VW5sZXNzVmFsaWQgaXMgdHJ1ZSwgY2hlY2tzXG4gICAqIHRoZSBmb3JtIGZvciB2YWxpZGl0eSBiZWZvcmUgcHJvY2VlZGluZy5cbiAgICogVXBkYXRlcyB0aGUgcmV2ZXJ0IHN0YXRlIHdpdGggdGhlIGxhdGVzdCBzdWJtaXR0ZWQgdmFsdWUgdGhlbiBjbG9zZXMgdGhlIGVkaXQuXG4gICAqL1xuICAvLyBJbiBJdnkgdGhlIGBob3N0YCBtZXRhZGF0YSB3aWxsIGJlIG1lcmdlZCwgd2hlcmVhcyBpbiBWaWV3RW5naW5lIGl0IGlzIG92ZXJyaWRkZW4uIEluIG9yZGVyXG4gIC8vIHRvIGF2b2lkIGRvdWJsZSBldmVudCBsaXN0ZW5lcnMsIHdlIG5lZWQgdG8gdXNlIGBIb3N0TGlzdGVuZXJgLiBPbmNlIEl2eSBpcyB0aGUgZGVmYXVsdCwgd2VcbiAgLy8gY2FuIG1vdmUgdGhpcyBiYWNrIGludG8gYGhvc3RgLlxuICAvLyB0c2xpbnQ6ZGlzYWJsZTpuby1ob3N0LWRlY29yYXRvci1pbi1jb25jcmV0ZVxuICBASG9zdExpc3RlbmVyKCduZ1N1Ym1pdCcpXG4gIGhhbmRsZUZvcm1TdWJtaXQoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuaWdub3JlU3VibWl0VW5sZXNzVmFsaWQgJiYgIXRoaXMuZWRpdFJlZi5pc1ZhbGlkKCkpIHsgcmV0dXJuOyB9XG5cbiAgICB0aGlzLmVkaXRSZWYudXBkYXRlUmV2ZXJ0VmFsdWUoKTtcbiAgICB0aGlzLmVkaXRSZWYuY2xvc2UoKTtcbiAgfVxuXG4gIC8qKiBDYWxsZWQgb24gRXNjYXBlIGtleXVwLiBDbG9zZXMgdGhlIGVkaXQuICovXG4gIGNsb3NlKCk6IHZvaWQge1xuICAgIC8vIHRvZG8gLSBhbGxvdyB0aGlzIGJlaGF2aW9yIHRvIGJlIGN1c3RvbWl6ZWQgYXMgd2VsbCwgc3VjaCBhcyBjYWxsaW5nXG4gICAgLy8gcmVzZXQgYmVmb3JlIGNsb3NlXG4gICAgdGhpcy5lZGl0UmVmLmNsb3NlKCk7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIG9uIGNsaWNrIGFueXdoZXJlIGluIHRoZSBkb2N1bWVudC5cbiAgICogSWYgdGhlIGNsaWNrIHdhcyBvdXRzaWRlIG9mIHRoZSBsZW5zLCB0cmlnZ2VyIHRoZSBzcGVjaWZpZWQgY2xpY2sgb3V0IGJlaGF2aW9yLlxuICAgKi9cbiAgLy8gSW4gSXZ5IHRoZSBgaG9zdGAgbWV0YWRhdGEgd2lsbCBiZSBtZXJnZWQsIHdoZXJlYXMgaW4gVmlld0VuZ2luZSBpdCBpcyBvdmVycmlkZGVuLiBJbiBvcmRlclxuICAvLyB0byBhdm9pZCBkb3VibGUgZXZlbnQgbGlzdGVuZXJzLCB3ZSBuZWVkIHRvIHVzZSBgSG9zdExpc3RlbmVyYC4gT25jZSBJdnkgaXMgdGhlIGRlZmF1bHQsIHdlXG4gIC8vIGNhbiBtb3ZlIHRoaXMgYmFjayBpbnRvIGBob3N0YC5cbiAgLy8gdHNsaW50OmRpc2FibGU6bm8taG9zdC1kZWNvcmF0b3ItaW4tY29uY3JldGVcbiAgQEhvc3RMaXN0ZW5lcignZG9jdW1lbnQ6Y2xpY2snLCBbJyRldmVudCddKVxuICBoYW5kbGVQb3NzaWJsZUNsaWNrT3V0KGV2dDogRXZlbnQpOiB2b2lkIHtcbiAgICBpZiAoY2xvc2VzdChldnQudGFyZ2V0LCBFRElUX1BBTkVfU0VMRUNUT1IpKSB7IHJldHVybjsgfVxuICAgIHN3aXRjaCAodGhpcy5jbGlja091dEJlaGF2aW9yKSB7XG4gICAgICBjYXNlICdzdWJtaXQnOlxuICAgICAgICAvLyBNYW51YWxseSBjYXVzZSB0aGUgZm9ybSB0byBzdWJtaXQgYmVmb3JlIGNsb3NpbmcuXG4gICAgICAgIHRoaXMuX3RyaWdnZXJGb3JtU3VibWl0KCk7XG4gICAgICAgIHRoaXMuZWRpdFJlZi5jbG9zZSgpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2Nsb3NlJzpcbiAgICAgICAgdGhpcy5lZGl0UmVmLmNsb3NlKCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgLy8gSW4gSXZ5IHRoZSBgaG9zdGAgbWV0YWRhdGEgd2lsbCBiZSBtZXJnZWQsIHdoZXJlYXMgaW4gVmlld0VuZ2luZSBpdCBpcyBvdmVycmlkZGVuLiBJbiBvcmRlclxuICAvLyB0byBhdm9pZCBkb3VibGUgZXZlbnQgbGlzdGVuZXJzLCB3ZSBuZWVkIHRvIHVzZSBgSG9zdExpc3RlbmVyYC4gT25jZSBJdnkgaXMgdGhlIGRlZmF1bHQsIHdlXG4gIC8vIGNhbiBtb3ZlIHRoaXMgYmFjayBpbnRvIGBob3N0YC5cbiAgLy8gdHNsaW50OmRpc2FibGU6bm8taG9zdC1kZWNvcmF0b3ItaW4tY29uY3JldGVcbiAgQEhvc3RMaXN0ZW5lcigna2V5ZG93bicsIFsnJGV2ZW50J10pXG4gIF9oYW5kbGVLZXlkb3duKGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XG4gICAgaWYgKGV2ZW50LmtleSA9PT0gJ0VzY2FwZScgJiYgIWhhc01vZGlmaWVyS2V5KGV2ZW50KSkge1xuICAgICAgdGhpcy5jbG9zZSgpO1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICB9XG4gIH1cblxuICAvKiogVHJpZ2dlcnMgc3VibWl0IG9uIHRhYiBvdXQgaWYgY2xpY2tPdXRCZWhhdmlvciBpcyAnc3VibWl0Jy4gKi9cbiAgcHJpdmF0ZSBfaGFuZGxlQmx1cigpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5jbGlja091dEJlaGF2aW9yID09PSAnc3VibWl0Jykge1xuICAgICAgLy8gTWFudWFsbHkgY2F1c2UgdGhlIGZvcm0gdG8gc3VibWl0IGJlZm9yZSBjbG9zaW5nLlxuICAgICAgdGhpcy5fdHJpZ2dlckZvcm1TdWJtaXQoKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF90cmlnZ2VyRm9ybVN1Ym1pdCgpIHtcbiAgICB0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCEuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ3N1Ym1pdCcpKTtcbiAgfVxufVxuXG4vKiogUmV2ZXJ0cyB0aGUgZm9ybSB0byBpdHMgaW5pdGlhbCBvciBwcmV2aW91c2x5IHN1Ym1pdHRlZCBzdGF0ZSBvbiBjbGljay4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ2J1dHRvbltjZGtFZGl0UmV2ZXJ0XScsXG4gIGhvc3Q6IHtcbiAgICAndHlwZSc6ICdidXR0b24nLCAvLyBQcmV2ZW50cyBhY2NpZGVudGFsIGZvcm0gc3VibWl0cy5cbiAgfVxufSlcbmV4cG9ydCBjbGFzcyBDZGtFZGl0UmV2ZXJ0PEZvcm1WYWx1ZT4ge1xuICAvKiogVHlwZSBvZiB0aGUgYnV0dG9uLiBEZWZhdWx0cyB0byBgYnV0dG9uYCB0byBhdm9pZCBhY2NpZGVudCBmb3JtIHN1Ym1pdHMuICovXG4gIEBJbnB1dCgpIHR5cGU6IHN0cmluZyA9ICdidXR0b24nO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJvdGVjdGVkIHJlYWRvbmx5IGVkaXRSZWY6IEVkaXRSZWY8Rm9ybVZhbHVlPikge31cblxuICAvLyBJbiBJdnkgdGhlIGBob3N0YCBtZXRhZGF0YSB3aWxsIGJlIG1lcmdlZCwgd2hlcmVhcyBpbiBWaWV3RW5naW5lIGl0IGlzIG92ZXJyaWRkZW4uIEluIG9yZGVyXG4gIC8vIHRvIGF2b2lkIGRvdWJsZSBldmVudCBsaXN0ZW5lcnMsIHdlIG5lZWQgdG8gdXNlIGBIb3N0TGlzdGVuZXJgLiBPbmNlIEl2eSBpcyB0aGUgZGVmYXVsdCwgd2VcbiAgLy8gY2FuIG1vdmUgdGhpcyBiYWNrIGludG8gYGhvc3RgLlxuICAvLyB0c2xpbnQ6ZGlzYWJsZTpuby1ob3N0LWRlY29yYXRvci1pbi1jb25jcmV0ZVxuICBASG9zdExpc3RlbmVyKCdjbGljaycpXG4gIHJldmVydEVkaXQoKTogdm9pZCB7XG4gICAgdGhpcy5lZGl0UmVmLnJlc2V0KCk7XG4gIH1cbn1cblxuLyoqIENsb3NlcyB0aGUgbGVucyBvbiBjbGljay4gKi9cbkBEaXJlY3RpdmUoe3NlbGVjdG9yOiAnW2Nka0VkaXRDbG9zZV0nfSlcbmV4cG9ydCBjbGFzcyBDZGtFZGl0Q2xvc2U8Rm9ybVZhbHVlPiB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJvdGVjdGVkIHJlYWRvbmx5IGVsZW1lbnRSZWY6IEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+LFxuICAgICAgcHJvdGVjdGVkIHJlYWRvbmx5IGVkaXRSZWY6IEVkaXRSZWY8Rm9ybVZhbHVlPikge1xuXG4gICAgY29uc3QgbmF0aXZlRWxlbWVudCA9IGVsZW1lbnRSZWYubmF0aXZlRWxlbWVudDtcblxuICAgIC8vIFByZXZlbnQgYWNjaWRlbnRhbCBmb3JtIHN1Ym1pdHMuXG4gICAgaWYgKG5hdGl2ZUVsZW1lbnQubm9kZU5hbWUgPT09ICdCVVRUT04nICYmICFuYXRpdmVFbGVtZW50LmdldEF0dHJpYnV0ZSgndHlwZScpKSB7XG4gICAgICBuYXRpdmVFbGVtZW50LnNldEF0dHJpYnV0ZSgndHlwZScsICdidXR0b24nKTtcbiAgICB9XG4gIH1cblxuICAvLyBJbiBJdnkgdGhlIGBob3N0YCBtZXRhZGF0YSB3aWxsIGJlIG1lcmdlZCwgd2hlcmVhcyBpbiBWaWV3RW5naW5lIGl0IGlzIG92ZXJyaWRkZW4uIEluIG9yZGVyXG4gIC8vIHRvIGF2b2lkIGRvdWJsZSBldmVudCBsaXN0ZW5lcnMsIHdlIG5lZWQgdG8gdXNlIGBIb3N0TGlzdGVuZXJgLiBPbmNlIEl2eSBpcyB0aGUgZGVmYXVsdCwgd2VcbiAgLy8gY2FuIG1vdmUgdGhpcyBiYWNrIGludG8gYGhvc3RgLlxuICAvLyB0c2xpbnQ6ZGlzYWJsZTpuby1ob3N0LWRlY29yYXRvci1pbi1jb25jcmV0ZVxuICBASG9zdExpc3RlbmVyKCdjbGljaycpXG4gIEBIb3N0TGlzdGVuZXIoJ2tleXVwLmVudGVyJylcbiAgQEhvc3RMaXN0ZW5lcigna2V5dXAuc3BhY2UnKVxuICBjbG9zZUVkaXQoKTogdm9pZCB7XG4gICAgLy8gTm90ZSB0aGF0IHdlIHVzZSBgY2xpY2tgIGhlcmUsIHJhdGhlciB0aGFuIGEga2V5Ym9hcmQgZXZlbnQsIGJlY2F1c2Ugc29tZSBzY3JlZW4gcmVhZGVyc1xuICAgIC8vIHdpbGwgZW1pdCBhIGZha2UgY2xpY2sgZXZlbnQgaW5zdGVhZCBvZiBhbiBlbnRlciBrZXlib2FyZCBldmVudCBvbiBidXR0b25zLlxuICAgIHRoaXMuZWRpdFJlZi5jbG9zZSgpO1xuICB9XG59XG4iXX0=