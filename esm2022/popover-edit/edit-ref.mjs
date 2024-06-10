/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Injectable, Self, afterNextRender, inject, Injector } from '@angular/core';
import { ControlContainer } from '@angular/forms';
import { Subject } from 'rxjs';
import { EditEventDispatcher } from './edit-event-dispatcher';
import * as i0 from "@angular/core";
import * as i1 from "@angular/forms";
import * as i2 from "./edit-event-dispatcher";
/**
 * Used for communication between the form within the edit lens and the
 * table that launched it. Provided by CdkEditControl within the lens.
 */
export class EditRef {
    constructor(_form, _editEventDispatcher) {
        this._form = _form;
        this._editEventDispatcher = _editEventDispatcher;
        /** Emits the final value of this edit instance before closing. */
        this._finalValueSubject = new Subject();
        this.finalValue = this._finalValueSubject;
        /** Emits when the user tabs out of this edit lens before closing. */
        this._blurredSubject = new Subject();
        this.blurred = this._blurredSubject;
        this._injector = inject(Injector);
        this._editEventDispatcher.setActiveEditRef(this);
    }
    /**
     * Called by the host directive's OnInit hook. Reads the initial state of the
     * form and overrides it with persisted state from previous openings, if
     * applicable.
     */
    init(previousFormValue) {
        // Wait for the next render before caching the initial value.
        // This ensures that all form controls have been initialized.
        afterNextRender(() => {
            this.updateRevertValue();
            if (previousFormValue) {
                this.reset(previousFormValue);
            }
        }, { injector: this._injector });
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.0-next.1", ngImport: i0, type: EditRef, deps: [{ token: i1.ControlContainer, self: true }, { token: i2.EditEventDispatcher }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.1.0-next.1", ngImport: i0, type: EditRef }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.0-next.1", ngImport: i0, type: EditRef, decorators: [{
            type: Injectable
        }], ctorParameters: () => [{ type: i1.ControlContainer, decorators: [{
                    type: Self
                }] }, { type: i2.EditEventDispatcher }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdC1yZWYuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrLWV4cGVyaW1lbnRhbC9wb3BvdmVyLWVkaXQvZWRpdC1yZWYudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFVBQVUsRUFBYSxJQUFJLEVBQUUsZUFBZSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDN0YsT0FBTyxFQUFDLGdCQUFnQixFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDaEQsT0FBTyxFQUFhLE9BQU8sRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUV6QyxPQUFPLEVBQUMsbUJBQW1CLEVBQUMsTUFBTSx5QkFBeUIsQ0FBQzs7OztBQUU1RDs7O0dBR0c7QUFFSCxNQUFNLE9BQU8sT0FBTztJQWNsQixZQUMyQixLQUF1QixFQUMvQixvQkFBNkQ7UUFEckQsVUFBSyxHQUFMLEtBQUssQ0FBa0I7UUFDL0IseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF5QztRQWZoRixrRUFBa0U7UUFDakQsdUJBQWtCLEdBQUcsSUFBSSxPQUFPLEVBQWEsQ0FBQztRQUN0RCxlQUFVLEdBQTBCLElBQUksQ0FBQyxrQkFBa0IsQ0FBQztRQUVyRSxxRUFBcUU7UUFDcEQsb0JBQWUsR0FBRyxJQUFJLE9BQU8sRUFBUSxDQUFDO1FBQzlDLFlBQU8sR0FBcUIsSUFBSSxDQUFDLGVBQWUsQ0FBQztRQUtsRCxjQUFTLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBTW5DLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNuRCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILElBQUksQ0FBQyxpQkFBd0M7UUFDM0MsNkRBQTZEO1FBQzdELDZEQUE2RDtRQUM3RCxlQUFlLENBQ2IsR0FBRyxFQUFFO1lBQ0gsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7WUFDekIsSUFBSSxpQkFBaUIsRUFBRSxDQUFDO2dCQUN0QixJQUFJLENBQUMsS0FBSyxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDaEMsQ0FBQztRQUNILENBQUMsRUFDRCxFQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFDLENBQzNCLENBQUM7SUFDSixDQUFDO0lBRUQsV0FBVztRQUNULElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNuRCxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDL0MsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ3JDLENBQUM7SUFFRCxxREFBcUQ7SUFDckQsT0FBTztRQUNMLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUM7SUFDMUIsQ0FBQztJQUVELDhFQUE4RTtJQUM5RSxpQkFBaUI7UUFDZixJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUM7SUFDM0MsQ0FBQztJQUVELCtDQUErQztJQUMvQyxLQUFLO1FBQ0gsSUFBSSxDQUFDLG9CQUFvQixDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDL0MsQ0FBQztJQUVELDhFQUE4RTtJQUM5RSxJQUFJO1FBQ0YsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUM5QixDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsS0FBSyxDQUFDLEtBQWlCO1FBQ3JCLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUNuRCxDQUFDO3FIQXhFVSxPQUFPO3lIQUFQLE9BQU87O2tHQUFQLE9BQU87a0JBRG5CLFVBQVU7OzBCQWdCTixJQUFJIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SW5qZWN0YWJsZSwgT25EZXN0cm95LCBTZWxmLCBhZnRlck5leHRSZW5kZXIsIGluamVjdCwgSW5qZWN0b3J9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtDb250cm9sQ29udGFpbmVyfSBmcm9tICdAYW5ndWxhci9mb3Jtcyc7XG5pbXBvcnQge09ic2VydmFibGUsIFN1YmplY3R9IGZyb20gJ3J4anMnO1xuXG5pbXBvcnQge0VkaXRFdmVudERpc3BhdGNoZXJ9IGZyb20gJy4vZWRpdC1ldmVudC1kaXNwYXRjaGVyJztcblxuLyoqXG4gKiBVc2VkIGZvciBjb21tdW5pY2F0aW9uIGJldHdlZW4gdGhlIGZvcm0gd2l0aGluIHRoZSBlZGl0IGxlbnMgYW5kIHRoZVxuICogdGFibGUgdGhhdCBsYXVuY2hlZCBpdC4gUHJvdmlkZWQgYnkgQ2RrRWRpdENvbnRyb2wgd2l0aGluIHRoZSBsZW5zLlxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgRWRpdFJlZjxGb3JtVmFsdWU+IGltcGxlbWVudHMgT25EZXN0cm95IHtcbiAgLyoqIEVtaXRzIHRoZSBmaW5hbCB2YWx1ZSBvZiB0aGlzIGVkaXQgaW5zdGFuY2UgYmVmb3JlIGNsb3NpbmcuICovXG4gIHByaXZhdGUgcmVhZG9ubHkgX2ZpbmFsVmFsdWVTdWJqZWN0ID0gbmV3IFN1YmplY3Q8Rm9ybVZhbHVlPigpO1xuICByZWFkb25seSBmaW5hbFZhbHVlOiBPYnNlcnZhYmxlPEZvcm1WYWx1ZT4gPSB0aGlzLl9maW5hbFZhbHVlU3ViamVjdDtcblxuICAvKiogRW1pdHMgd2hlbiB0aGUgdXNlciB0YWJzIG91dCBvZiB0aGlzIGVkaXQgbGVucyBiZWZvcmUgY2xvc2luZy4gKi9cbiAgcHJpdmF0ZSByZWFkb25seSBfYmx1cnJlZFN1YmplY3QgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xuICByZWFkb25seSBibHVycmVkOiBPYnNlcnZhYmxlPHZvaWQ+ID0gdGhpcy5fYmx1cnJlZFN1YmplY3Q7XG5cbiAgLyoqIFRoZSB2YWx1ZSB0byBzZXQgdGhlIGZvcm0gYmFjayB0byBvbiByZXZlcnQuICovXG4gIHByaXZhdGUgX3JldmVydEZvcm1WYWx1ZTogRm9ybVZhbHVlO1xuXG4gIHByaXZhdGUgX2luamVjdG9yID0gaW5qZWN0KEluamVjdG9yKTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBAU2VsZigpIHByaXZhdGUgcmVhZG9ubHkgX2Zvcm06IENvbnRyb2xDb250YWluZXIsXG4gICAgcHJpdmF0ZSByZWFkb25seSBfZWRpdEV2ZW50RGlzcGF0Y2hlcjogRWRpdEV2ZW50RGlzcGF0Y2hlcjxFZGl0UmVmPEZvcm1WYWx1ZT4+LFxuICApIHtcbiAgICB0aGlzLl9lZGl0RXZlbnREaXNwYXRjaGVyLnNldEFjdGl2ZUVkaXRSZWYodGhpcyk7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIGJ5IHRoZSBob3N0IGRpcmVjdGl2ZSdzIE9uSW5pdCBob29rLiBSZWFkcyB0aGUgaW5pdGlhbCBzdGF0ZSBvZiB0aGVcbiAgICogZm9ybSBhbmQgb3ZlcnJpZGVzIGl0IHdpdGggcGVyc2lzdGVkIHN0YXRlIGZyb20gcHJldmlvdXMgb3BlbmluZ3MsIGlmXG4gICAqIGFwcGxpY2FibGUuXG4gICAqL1xuICBpbml0KHByZXZpb3VzRm9ybVZhbHVlOiBGb3JtVmFsdWUgfCB1bmRlZmluZWQpOiB2b2lkIHtcbiAgICAvLyBXYWl0IGZvciB0aGUgbmV4dCByZW5kZXIgYmVmb3JlIGNhY2hpbmcgdGhlIGluaXRpYWwgdmFsdWUuXG4gICAgLy8gVGhpcyBlbnN1cmVzIHRoYXQgYWxsIGZvcm0gY29udHJvbHMgaGF2ZSBiZWVuIGluaXRpYWxpemVkLlxuICAgIGFmdGVyTmV4dFJlbmRlcihcbiAgICAgICgpID0+IHtcbiAgICAgICAgdGhpcy51cGRhdGVSZXZlcnRWYWx1ZSgpO1xuICAgICAgICBpZiAocHJldmlvdXNGb3JtVmFsdWUpIHtcbiAgICAgICAgICB0aGlzLnJlc2V0KHByZXZpb3VzRm9ybVZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHtpbmplY3RvcjogdGhpcy5faW5qZWN0b3J9LFxuICAgICk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLl9lZGl0RXZlbnREaXNwYXRjaGVyLnVuc2V0QWN0aXZlRWRpdFJlZih0aGlzKTtcbiAgICB0aGlzLl9maW5hbFZhbHVlU3ViamVjdC5uZXh0KHRoaXMuX2Zvcm0udmFsdWUpO1xuICAgIHRoaXMuX2ZpbmFsVmFsdWVTdWJqZWN0LmNvbXBsZXRlKCk7XG4gIH1cblxuICAvKiogV2hldGhlciB0aGUgYXR0YWNoZWQgZm9ybSBpcyBpbiBhIHZhbGlkIHN0YXRlLiAqL1xuICBpc1ZhbGlkKCk6IGJvb2xlYW4gfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5fZm9ybS52YWxpZDtcbiAgfVxuXG4gIC8qKiBTZXQgdGhlIGZvcm0ncyBjdXJyZW50IHZhbHVlIGFzIHdoYXQgaXQgd2lsbCBiZSBzZXQgdG8gb24gcmV2ZXJ0L3Jlc2V0LiAqL1xuICB1cGRhdGVSZXZlcnRWYWx1ZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9yZXZlcnRGb3JtVmFsdWUgPSB0aGlzLl9mb3JtLnZhbHVlO1xuICB9XG5cbiAgLyoqIFRlbGxzIHRoZSB0YWJsZSB0byBjbG9zZSB0aGUgZWRpdCBwb3B1cC4gKi9cbiAgY2xvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5fZWRpdEV2ZW50RGlzcGF0Y2hlci5lZGl0aW5nLm5leHQobnVsbCk7XG4gIH1cblxuICAvKiogTm90aWZpZXMgdGhlIGFjdGl2ZSBlZGl0IHRoYXQgdGhlIHVzZXIgaGFzIG1vdmVkIGZvY3VzIG91dCBvZiB0aGUgbGVucy4gKi9cbiAgYmx1cigpOiB2b2lkIHtcbiAgICB0aGlzLl9ibHVycmVkU3ViamVjdC5uZXh0KCk7XG4gIH1cblxuICAvKipcbiAgICogUmVzZXRzIHRoZSBmb3JtIHZhbHVlIHRvIHRoZSBzcGVjaWZpZWQgdmFsdWUgb3IgdGhlIHByZXZpb3VzbHkgc2V0XG4gICAqIHJldmVydCB2YWx1ZS5cbiAgICovXG4gIHJlc2V0KHZhbHVlPzogRm9ybVZhbHVlKTogdm9pZCB7XG4gICAgdGhpcy5fZm9ybS5yZXNldCh2YWx1ZSB8fCB0aGlzLl9yZXZlcnRGb3JtVmFsdWUpO1xuICB9XG59XG4iXX0=