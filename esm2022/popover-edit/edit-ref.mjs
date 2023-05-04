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
import * as i0 from "@angular/core";
import * as i1 from "@angular/forms";
import * as i2 from "./edit-event-dispatcher";
/**
 * Used for communication between the form within the edit lens and the
 * table that launched it. Provided by CdkEditControl within the lens.
 */
class EditRef {
    constructor(_form, _editEventDispatcher, _ngZone) {
        this._form = _form;
        this._editEventDispatcher = _editEventDispatcher;
        this._ngZone = _ngZone;
        /** Emits the final value of this edit instance before closing. */
        this._finalValueSubject = new Subject();
        this.finalValue = this._finalValueSubject;
        /** Emits when the user tabs out of this edit lens before closing. */
        this._blurredSubject = new Subject();
        this.blurred = this._blurredSubject;
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.0.0", ngImport: i0, type: EditRef, deps: [{ token: i1.ControlContainer, self: true }, { token: i2.EditEventDispatcher }, { token: i0.NgZone }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "16.0.0", ngImport: i0, type: EditRef }); }
}
export { EditRef };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.0.0", ngImport: i0, type: EditRef, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: i1.ControlContainer, decorators: [{
                    type: Self
                }] }, { type: i2.EditEventDispatcher }, { type: i0.NgZone }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdC1yZWYuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrLWV4cGVyaW1lbnRhbC9wb3BvdmVyLWVkaXQvZWRpdC1yZWYudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFVBQVUsRUFBYSxJQUFJLEVBQUUsTUFBTSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ2xFLE9BQU8sRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQ2hELE9BQU8sRUFBYSxPQUFPLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDekMsT0FBTyxFQUFDLElBQUksRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBRXBDLE9BQU8sRUFBQyxtQkFBbUIsRUFBQyxNQUFNLHlCQUF5QixDQUFDOzs7O0FBRTVEOzs7R0FHRztBQUNILE1BQ2EsT0FBTztJQVlsQixZQUMyQixLQUF1QixFQUMvQixvQkFBNkQsRUFDN0QsT0FBZTtRQUZQLFVBQUssR0FBTCxLQUFLLENBQWtCO1FBQy9CLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBeUM7UUFDN0QsWUFBTyxHQUFQLE9BQU8sQ0FBUTtRQWRsQyxrRUFBa0U7UUFDakQsdUJBQWtCLEdBQUcsSUFBSSxPQUFPLEVBQWEsQ0FBQztRQUN0RCxlQUFVLEdBQTBCLElBQUksQ0FBQyxrQkFBa0IsQ0FBQztRQUVyRSxxRUFBcUU7UUFDcEQsb0JBQWUsR0FBRyxJQUFJLE9BQU8sRUFBUSxDQUFDO1FBQzlDLFlBQU8sR0FBcUIsSUFBSSxDQUFDLGVBQWUsQ0FBQztRQVV4RCxJQUFJLENBQUMsb0JBQW9CLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDbkQsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxJQUFJLENBQUMsaUJBQXdDO1FBQzNDLG1FQUFtRTtRQUNuRSw2REFBNkQ7UUFDN0QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUU7WUFDakQsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7WUFDekIsSUFBSSxpQkFBaUIsRUFBRTtnQkFDckIsSUFBSSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO2FBQy9CO1FBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQsV0FBVztRQUNULElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNuRCxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDL0MsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ3JDLENBQUM7SUFFRCxxREFBcUQ7SUFDckQsT0FBTztRQUNMLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUM7SUFDMUIsQ0FBQztJQUVELDhFQUE4RTtJQUM5RSxpQkFBaUI7UUFDZixJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUM7SUFDM0MsQ0FBQztJQUVELCtDQUErQztJQUMvQyxLQUFLO1FBQ0gsSUFBSSxDQUFDLG9CQUFvQixDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDL0MsQ0FBQztJQUVELDhFQUE4RTtJQUM5RSxJQUFJO1FBQ0YsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUM5QixDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsS0FBSyxDQUFDLEtBQWlCO1FBQ3JCLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUNuRCxDQUFDOzhHQXBFVSxPQUFPO2tIQUFQLE9BQU87O1NBQVAsT0FBTzsyRkFBUCxPQUFPO2tCQURuQixVQUFVOzswQkFjTixJQUFJIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SW5qZWN0YWJsZSwgT25EZXN0cm95LCBTZWxmLCBOZ1pvbmV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtDb250cm9sQ29udGFpbmVyfSBmcm9tICdAYW5ndWxhci9mb3Jtcyc7XG5pbXBvcnQge09ic2VydmFibGUsIFN1YmplY3R9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHt0YWtlfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbmltcG9ydCB7RWRpdEV2ZW50RGlzcGF0Y2hlcn0gZnJvbSAnLi9lZGl0LWV2ZW50LWRpc3BhdGNoZXInO1xuXG4vKipcbiAqIFVzZWQgZm9yIGNvbW11bmljYXRpb24gYmV0d2VlbiB0aGUgZm9ybSB3aXRoaW4gdGhlIGVkaXQgbGVucyBhbmQgdGhlXG4gKiB0YWJsZSB0aGF0IGxhdW5jaGVkIGl0LiBQcm92aWRlZCBieSBDZGtFZGl0Q29udHJvbCB3aXRoaW4gdGhlIGxlbnMuXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBFZGl0UmVmPEZvcm1WYWx1ZT4gaW1wbGVtZW50cyBPbkRlc3Ryb3kge1xuICAvKiogRW1pdHMgdGhlIGZpbmFsIHZhbHVlIG9mIHRoaXMgZWRpdCBpbnN0YW5jZSBiZWZvcmUgY2xvc2luZy4gKi9cbiAgcHJpdmF0ZSByZWFkb25seSBfZmluYWxWYWx1ZVN1YmplY3QgPSBuZXcgU3ViamVjdDxGb3JtVmFsdWU+KCk7XG4gIHJlYWRvbmx5IGZpbmFsVmFsdWU6IE9ic2VydmFibGU8Rm9ybVZhbHVlPiA9IHRoaXMuX2ZpbmFsVmFsdWVTdWJqZWN0O1xuXG4gIC8qKiBFbWl0cyB3aGVuIHRoZSB1c2VyIHRhYnMgb3V0IG9mIHRoaXMgZWRpdCBsZW5zIGJlZm9yZSBjbG9zaW5nLiAqL1xuICBwcml2YXRlIHJlYWRvbmx5IF9ibHVycmVkU3ViamVjdCA9IG5ldyBTdWJqZWN0PHZvaWQ+KCk7XG4gIHJlYWRvbmx5IGJsdXJyZWQ6IE9ic2VydmFibGU8dm9pZD4gPSB0aGlzLl9ibHVycmVkU3ViamVjdDtcblxuICAvKiogVGhlIHZhbHVlIHRvIHNldCB0aGUgZm9ybSBiYWNrIHRvIG9uIHJldmVydC4gKi9cbiAgcHJpdmF0ZSBfcmV2ZXJ0Rm9ybVZhbHVlOiBGb3JtVmFsdWU7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgQFNlbGYoKSBwcml2YXRlIHJlYWRvbmx5IF9mb3JtOiBDb250cm9sQ29udGFpbmVyLFxuICAgIHByaXZhdGUgcmVhZG9ubHkgX2VkaXRFdmVudERpc3BhdGNoZXI6IEVkaXRFdmVudERpc3BhdGNoZXI8RWRpdFJlZjxGb3JtVmFsdWU+PixcbiAgICBwcml2YXRlIHJlYWRvbmx5IF9uZ1pvbmU6IE5nWm9uZSxcbiAgKSB7XG4gICAgdGhpcy5fZWRpdEV2ZW50RGlzcGF0Y2hlci5zZXRBY3RpdmVFZGl0UmVmKHRoaXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxlZCBieSB0aGUgaG9zdCBkaXJlY3RpdmUncyBPbkluaXQgaG9vay4gUmVhZHMgdGhlIGluaXRpYWwgc3RhdGUgb2YgdGhlXG4gICAqIGZvcm0gYW5kIG92ZXJyaWRlcyBpdCB3aXRoIHBlcnNpc3RlZCBzdGF0ZSBmcm9tIHByZXZpb3VzIG9wZW5pbmdzLCBpZlxuICAgKiBhcHBsaWNhYmxlLlxuICAgKi9cbiAgaW5pdChwcmV2aW91c0Zvcm1WYWx1ZTogRm9ybVZhbHVlIHwgdW5kZWZpbmVkKTogdm9pZCB7XG4gICAgLy8gV2FpdCBmb3IgdGhlIHpvbmUgdG8gc3RhYmlsaXplIGJlZm9yZSBjYWNoaW5nIHRoZSBpbml0aWFsIHZhbHVlLlxuICAgIC8vIFRoaXMgZW5zdXJlcyB0aGF0IGFsbCBmb3JtIGNvbnRyb2xzIGhhdmUgYmVlbiBpbml0aWFsaXplZC5cbiAgICB0aGlzLl9uZ1pvbmUub25TdGFibGUucGlwZSh0YWtlKDEpKS5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgdGhpcy51cGRhdGVSZXZlcnRWYWx1ZSgpO1xuICAgICAgaWYgKHByZXZpb3VzRm9ybVZhbHVlKSB7XG4gICAgICAgIHRoaXMucmVzZXQocHJldmlvdXNGb3JtVmFsdWUpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgdGhpcy5fZWRpdEV2ZW50RGlzcGF0Y2hlci51bnNldEFjdGl2ZUVkaXRSZWYodGhpcyk7XG4gICAgdGhpcy5fZmluYWxWYWx1ZVN1YmplY3QubmV4dCh0aGlzLl9mb3JtLnZhbHVlKTtcbiAgICB0aGlzLl9maW5hbFZhbHVlU3ViamVjdC5jb21wbGV0ZSgpO1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGF0dGFjaGVkIGZvcm0gaXMgaW4gYSB2YWxpZCBzdGF0ZS4gKi9cbiAgaXNWYWxpZCgpOiBib29sZWFuIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuX2Zvcm0udmFsaWQ7XG4gIH1cblxuICAvKiogU2V0IHRoZSBmb3JtJ3MgY3VycmVudCB2YWx1ZSBhcyB3aGF0IGl0IHdpbGwgYmUgc2V0IHRvIG9uIHJldmVydC9yZXNldC4gKi9cbiAgdXBkYXRlUmV2ZXJ0VmFsdWUoKTogdm9pZCB7XG4gICAgdGhpcy5fcmV2ZXJ0Rm9ybVZhbHVlID0gdGhpcy5fZm9ybS52YWx1ZTtcbiAgfVxuXG4gIC8qKiBUZWxscyB0aGUgdGFibGUgdG8gY2xvc2UgdGhlIGVkaXQgcG9wdXAuICovXG4gIGNsb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuX2VkaXRFdmVudERpc3BhdGNoZXIuZWRpdGluZy5uZXh0KG51bGwpO1xuICB9XG5cbiAgLyoqIE5vdGlmaWVzIHRoZSBhY3RpdmUgZWRpdCB0aGF0IHRoZSB1c2VyIGhhcyBtb3ZlZCBmb2N1cyBvdXQgb2YgdGhlIGxlbnMuICovXG4gIGJsdXIoKTogdm9pZCB7XG4gICAgdGhpcy5fYmx1cnJlZFN1YmplY3QubmV4dCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlc2V0cyB0aGUgZm9ybSB2YWx1ZSB0byB0aGUgc3BlY2lmaWVkIHZhbHVlIG9yIHRoZSBwcmV2aW91c2x5IHNldFxuICAgKiByZXZlcnQgdmFsdWUuXG4gICAqL1xuICByZXNldCh2YWx1ZT86IEZvcm1WYWx1ZSk6IHZvaWQge1xuICAgIHRoaXMuX2Zvcm0ucmVzZXQodmFsdWUgfHwgdGhpcy5fcmV2ZXJ0Rm9ybVZhbHVlKTtcbiAgfVxufVxuIl19