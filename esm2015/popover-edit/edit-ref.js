/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Injectable, Self, NgZone } from '@angular/core';
import { ControlContainer } from '@angular/forms';
import { Subject } from 'rxjs';
import { take } from 'rxjs/operators';
import { EditEventDispatcher } from './edit-event-dispatcher';
/**
 * Used for communication between the form within the edit lens and the
 * table that launched it. Provided by CdkEditControl within the lens.
 */
let EditRef = /** @class */ (() => {
    class EditRef {
        constructor(_form, _editEventDispatcher, _ngZone) {
            this._form = _form;
            this._editEventDispatcher = _editEventDispatcher;
            this._ngZone = _ngZone;
            /** Emits the final value of this edit instance before closing. */
            this._finalValueSubject = new Subject();
            this.finalValue = this._finalValueSubject.asObservable();
            /** Emits when the user tabs out of this edit lens before closing. */
            this._blurredSubject = new Subject();
            this.blurred = this._blurredSubject.asObservable();
            this._editEventDispatcher.setActiveEditRef(this);
        }
        /**
         * Called by the host directive's OnInit hook. Reads the initial state of the
         * form and overrides it with persisted state from previous openings, if
         * applicable.
         */
        init(previousFormValue) {
            // Wait for the zone to stabilize before caching the initial value.
            // This ensures that all form controls have been initialized.
            this._ngZone.onStable.pipe(take(1)).subscribe(() => {
                this.updateRevertValue();
                if (previousFormValue) {
                    this.reset(previousFormValue);
                }
            });
        }
        ngOnDestroy() {
            this._editEventDispatcher.unsetActiveEditRef(this);
            this._finalValueSubject.next(this._form.value);
            this._finalValueSubject.complete();
        }
        /** Whether the attached form is in a valid state. */
        isValid() {
            return this._form.valid;
        }
        /** Set the form's current value as what it will be set to on revert/reset. */
        updateRevertValue() {
            this._revertFormValue = this._form.value;
        }
        /** Tells the table to close the edit popup. */
        close() {
            this._editEventDispatcher.editing.next(null);
        }
        /** Notifies the active edit that the user has moved focus out of the lens. */
        blur() {
            this._blurredSubject.next();
        }
        /**
         * Resets the form value to the specified value or the previously set
         * revert value.
         */
        reset(value) {
            this._form.reset(value || this._revertFormValue);
        }
    }
    EditRef.decorators = [
        { type: Injectable }
    ];
    EditRef.ctorParameters = () => [
        { type: ControlContainer, decorators: [{ type: Self }] },
        { type: EditEventDispatcher },
        { type: NgZone }
    ];
    return EditRef;
})();
export { EditRef };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdC1yZWYuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrLWV4cGVyaW1lbnRhbC9wb3BvdmVyLWVkaXQvZWRpdC1yZWYudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFVBQVUsRUFBYSxJQUFJLEVBQUUsTUFBTSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ2xFLE9BQU8sRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQ2hELE9BQU8sRUFBYSxPQUFPLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDekMsT0FBTyxFQUFDLElBQUksRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBRXBDLE9BQU8sRUFBQyxtQkFBbUIsRUFBQyxNQUFNLHlCQUF5QixDQUFDO0FBRTVEOzs7R0FHRztBQUNIO0lBQUEsTUFDYSxPQUFPO1FBWWxCLFlBQzZCLEtBQXVCLEVBQy9CLG9CQUF5QyxFQUN6QyxPQUFlO1lBRlAsVUFBSyxHQUFMLEtBQUssQ0FBa0I7WUFDL0IseUJBQW9CLEdBQXBCLG9CQUFvQixDQUFxQjtZQUN6QyxZQUFPLEdBQVAsT0FBTyxDQUFRO1lBZHBDLGtFQUFrRTtZQUNqRCx1QkFBa0IsR0FBRyxJQUFJLE9BQU8sRUFBYSxDQUFDO1lBQ3RELGVBQVUsR0FBMEIsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFlBQVksRUFBRSxDQUFDO1lBRXBGLHFFQUFxRTtZQUNwRCxvQkFBZSxHQUFHLElBQUksT0FBTyxFQUFRLENBQUM7WUFDOUMsWUFBTyxHQUFxQixJQUFJLENBQUMsZUFBZSxDQUFDLFlBQVksRUFBRSxDQUFDO1lBU3ZFLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNuRCxDQUFDO1FBRUQ7Ozs7V0FJRztRQUNILElBQUksQ0FBQyxpQkFBc0M7WUFDekMsbUVBQW1FO1lBQ25FLDZEQUE2RDtZQUM3RCxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRTtnQkFDakQsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7Z0JBQ3pCLElBQUksaUJBQWlCLEVBQUU7b0JBQ3JCLElBQUksQ0FBQyxLQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQztpQkFDL0I7WUFDSCxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7UUFFRCxXQUFXO1lBQ1QsSUFBSSxDQUFDLG9CQUFvQixDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ25ELElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUMvQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDckMsQ0FBQztRQUVELHFEQUFxRDtRQUNyRCxPQUFPO1lBQ0wsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQztRQUMxQixDQUFDO1FBRUQsOEVBQThFO1FBQzlFLGlCQUFpQjtZQUNmLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQztRQUMzQyxDQUFDO1FBRUQsK0NBQStDO1FBQy9DLEtBQUs7WUFDSCxJQUFJLENBQUMsb0JBQW9CLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMvQyxDQUFDO1FBRUQsOEVBQThFO1FBQzlFLElBQUk7WUFDRixJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQzlCLENBQUM7UUFFRDs7O1dBR0c7UUFDSCxLQUFLLENBQUMsS0FBaUI7WUFDckIsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ25ELENBQUM7OztnQkFwRUYsVUFBVTs7O2dCQVZILGdCQUFnQix1QkF3QmpCLElBQUk7Z0JBcEJILG1CQUFtQjtnQkFMVSxNQUFNOztJQWdGM0MsY0FBQztLQUFBO1NBcEVZLE9BQU8iLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtJbmplY3RhYmxlLCBPbkRlc3Ryb3ksIFNlbGYsIE5nWm9uZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0NvbnRyb2xDb250YWluZXJ9IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcbmltcG9ydCB7T2JzZXJ2YWJsZSwgU3ViamVjdH0gZnJvbSAncnhqcyc7XG5pbXBvcnQge3Rha2V9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcblxuaW1wb3J0IHtFZGl0RXZlbnREaXNwYXRjaGVyfSBmcm9tICcuL2VkaXQtZXZlbnQtZGlzcGF0Y2hlcic7XG5cbi8qKlxuICogVXNlZCBmb3IgY29tbXVuaWNhdGlvbiBiZXR3ZWVuIHRoZSBmb3JtIHdpdGhpbiB0aGUgZWRpdCBsZW5zIGFuZCB0aGVcbiAqIHRhYmxlIHRoYXQgbGF1bmNoZWQgaXQuIFByb3ZpZGVkIGJ5IENka0VkaXRDb250cm9sIHdpdGhpbiB0aGUgbGVucy5cbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEVkaXRSZWY8Rm9ybVZhbHVlPiBpbXBsZW1lbnRzIE9uRGVzdHJveSB7XG4gIC8qKiBFbWl0cyB0aGUgZmluYWwgdmFsdWUgb2YgdGhpcyBlZGl0IGluc3RhbmNlIGJlZm9yZSBjbG9zaW5nLiAqL1xuICBwcml2YXRlIHJlYWRvbmx5IF9maW5hbFZhbHVlU3ViamVjdCA9IG5ldyBTdWJqZWN0PEZvcm1WYWx1ZT4oKTtcbiAgcmVhZG9ubHkgZmluYWxWYWx1ZTogT2JzZXJ2YWJsZTxGb3JtVmFsdWU+ID0gdGhpcy5fZmluYWxWYWx1ZVN1YmplY3QuYXNPYnNlcnZhYmxlKCk7XG5cbiAgLyoqIEVtaXRzIHdoZW4gdGhlIHVzZXIgdGFicyBvdXQgb2YgdGhpcyBlZGl0IGxlbnMgYmVmb3JlIGNsb3NpbmcuICovXG4gIHByaXZhdGUgcmVhZG9ubHkgX2JsdXJyZWRTdWJqZWN0ID0gbmV3IFN1YmplY3Q8dm9pZD4oKTtcbiAgcmVhZG9ubHkgYmx1cnJlZDogT2JzZXJ2YWJsZTx2b2lkPiA9IHRoaXMuX2JsdXJyZWRTdWJqZWN0LmFzT2JzZXJ2YWJsZSgpO1xuXG4gIC8qKiBUaGUgdmFsdWUgdG8gc2V0IHRoZSBmb3JtIGJhY2sgdG8gb24gcmV2ZXJ0LiAqL1xuICBwcml2YXRlIF9yZXZlcnRGb3JtVmFsdWU6IEZvcm1WYWx1ZTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIEBTZWxmKCkgcHJpdmF0ZSByZWFkb25seSBfZm9ybTogQ29udHJvbENvbnRhaW5lcixcbiAgICAgIHByaXZhdGUgcmVhZG9ubHkgX2VkaXRFdmVudERpc3BhdGNoZXI6IEVkaXRFdmVudERpc3BhdGNoZXIsXG4gICAgICBwcml2YXRlIHJlYWRvbmx5IF9uZ1pvbmU6IE5nWm9uZSkge1xuICAgIHRoaXMuX2VkaXRFdmVudERpc3BhdGNoZXIuc2V0QWN0aXZlRWRpdFJlZih0aGlzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgYnkgdGhlIGhvc3QgZGlyZWN0aXZlJ3MgT25Jbml0IGhvb2suIFJlYWRzIHRoZSBpbml0aWFsIHN0YXRlIG9mIHRoZVxuICAgKiBmb3JtIGFuZCBvdmVycmlkZXMgaXQgd2l0aCBwZXJzaXN0ZWQgc3RhdGUgZnJvbSBwcmV2aW91cyBvcGVuaW5ncywgaWZcbiAgICogYXBwbGljYWJsZS5cbiAgICovXG4gIGluaXQocHJldmlvdXNGb3JtVmFsdWU6IEZvcm1WYWx1ZXx1bmRlZmluZWQpOiB2b2lkIHtcbiAgICAvLyBXYWl0IGZvciB0aGUgem9uZSB0byBzdGFiaWxpemUgYmVmb3JlIGNhY2hpbmcgdGhlIGluaXRpYWwgdmFsdWUuXG4gICAgLy8gVGhpcyBlbnN1cmVzIHRoYXQgYWxsIGZvcm0gY29udHJvbHMgaGF2ZSBiZWVuIGluaXRpYWxpemVkLlxuICAgIHRoaXMuX25nWm9uZS5vblN0YWJsZS5waXBlKHRha2UoMSkpLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICB0aGlzLnVwZGF0ZVJldmVydFZhbHVlKCk7XG4gICAgICBpZiAocHJldmlvdXNGb3JtVmFsdWUpIHtcbiAgICAgICAgdGhpcy5yZXNldChwcmV2aW91c0Zvcm1WYWx1ZSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLl9lZGl0RXZlbnREaXNwYXRjaGVyLnVuc2V0QWN0aXZlRWRpdFJlZih0aGlzKTtcbiAgICB0aGlzLl9maW5hbFZhbHVlU3ViamVjdC5uZXh0KHRoaXMuX2Zvcm0udmFsdWUpO1xuICAgIHRoaXMuX2ZpbmFsVmFsdWVTdWJqZWN0LmNvbXBsZXRlKCk7XG4gIH1cblxuICAvKiogV2hldGhlciB0aGUgYXR0YWNoZWQgZm9ybSBpcyBpbiBhIHZhbGlkIHN0YXRlLiAqL1xuICBpc1ZhbGlkKCk6IGJvb2xlYW58bnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuX2Zvcm0udmFsaWQ7XG4gIH1cblxuICAvKiogU2V0IHRoZSBmb3JtJ3MgY3VycmVudCB2YWx1ZSBhcyB3aGF0IGl0IHdpbGwgYmUgc2V0IHRvIG9uIHJldmVydC9yZXNldC4gKi9cbiAgdXBkYXRlUmV2ZXJ0VmFsdWUoKTogdm9pZCB7XG4gICAgdGhpcy5fcmV2ZXJ0Rm9ybVZhbHVlID0gdGhpcy5fZm9ybS52YWx1ZTtcbiAgfVxuXG4gIC8qKiBUZWxscyB0aGUgdGFibGUgdG8gY2xvc2UgdGhlIGVkaXQgcG9wdXAuICovXG4gIGNsb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuX2VkaXRFdmVudERpc3BhdGNoZXIuZWRpdGluZy5uZXh0KG51bGwpO1xuICB9XG5cbiAgLyoqIE5vdGlmaWVzIHRoZSBhY3RpdmUgZWRpdCB0aGF0IHRoZSB1c2VyIGhhcyBtb3ZlZCBmb2N1cyBvdXQgb2YgdGhlIGxlbnMuICovXG4gIGJsdXIoKTogdm9pZCB7XG4gICAgdGhpcy5fYmx1cnJlZFN1YmplY3QubmV4dCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlc2V0cyB0aGUgZm9ybSB2YWx1ZSB0byB0aGUgc3BlY2lmaWVkIHZhbHVlIG9yIHRoZSBwcmV2aW91c2x5IHNldFxuICAgKiByZXZlcnQgdmFsdWUuXG4gICAqL1xuICByZXNldCh2YWx1ZT86IEZvcm1WYWx1ZSk6IHZvaWQge1xuICAgIHRoaXMuX2Zvcm0ucmVzZXQodmFsdWUgfHwgdGhpcy5fcmV2ZXJ0Rm9ybVZhbHVlKTtcbiAgfVxufVxuIl19