/**
 * @fileoverview added by tsickle
 * Generated from: src/cdk-experimental/popover-edit/edit-ref.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
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
 * @template FormValue
 */
export class EditRef {
    /**
     * @param {?} _form
     * @param {?} _editEventDispatcher
     * @param {?} _ngZone
     */
    constructor(_form, _editEventDispatcher, _ngZone) {
        this._form = _form;
        this._editEventDispatcher = _editEventDispatcher;
        this._ngZone = _ngZone;
        /**
         * Emits the final value of this edit instance before closing.
         */
        this._finalValueSubject = new Subject();
        this.finalValue = this._finalValueSubject.asObservable();
        /**
         * Emits when the user tabs out of this edit lens before closing.
         */
        this._blurredSubject = new Subject();
        this.blurred = this._blurredSubject.asObservable();
        this._editEventDispatcher.setActiveEditRef(this);
    }
    /**
     * Called by the host directive's OnInit hook. Reads the initial state of the
     * form and overrides it with persisted state from previous openings, if
     * applicable.
     * @param {?} previousFormValue
     * @return {?}
     */
    init(previousFormValue) {
        // Wait for the zone to stabilize before caching the initial value.
        // This ensures that all form controls have been initialized.
        this._ngZone.onStable.pipe(take(1)).subscribe((/**
         * @return {?}
         */
        () => {
            this.updateRevertValue();
            if (previousFormValue) {
                this.reset(previousFormValue);
            }
        }));
    }
    /**
     * @return {?}
     */
    ngOnDestroy() {
        this._editEventDispatcher.unsetActiveEditRef(this);
        this._finalValueSubject.next(this._form.value);
        this._finalValueSubject.complete();
    }
    /**
     * Whether the attached form is in a valid state.
     * @return {?}
     */
    isValid() {
        return this._form.valid;
    }
    /**
     * Set the form's current value as what it will be set to on revert/reset.
     * @return {?}
     */
    updateRevertValue() {
        this._revertFormValue = this._form.value;
    }
    /**
     * Tells the table to close the edit popup.
     * @return {?}
     */
    close() {
        this._editEventDispatcher.editing.next(null);
    }
    /**
     * Notifies the active edit that the user has moved focus out of the lens.
     * @return {?}
     */
    blur() {
        this._blurredSubject.next();
    }
    /**
     * Resets the form value to the specified value or the previously set
     * revert value.
     * @param {?=} value
     * @return {?}
     */
    reset(value) {
        this._form.reset(value || this._revertFormValue);
    }
}
EditRef.decorators = [
    { type: Injectable }
];
/** @nocollapse */
EditRef.ctorParameters = () => [
    { type: ControlContainer, decorators: [{ type: Self }] },
    { type: EditEventDispatcher },
    { type: NgZone }
];
if (false) {
    /**
     * Emits the final value of this edit instance before closing.
     * @type {?}
     * @private
     */
    EditRef.prototype._finalValueSubject;
    /** @type {?} */
    EditRef.prototype.finalValue;
    /**
     * Emits when the user tabs out of this edit lens before closing.
     * @type {?}
     * @private
     */
    EditRef.prototype._blurredSubject;
    /** @type {?} */
    EditRef.prototype.blurred;
    /**
     * The value to set the form back to on revert.
     * @type {?}
     * @private
     */
    EditRef.prototype._revertFormValue;
    /**
     * @type {?}
     * @private
     */
    EditRef.prototype._form;
    /**
     * @type {?}
     * @private
     */
    EditRef.prototype._editEventDispatcher;
    /**
     * @type {?}
     * @private
     */
    EditRef.prototype._ngZone;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdC1yZWYuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrLWV4cGVyaW1lbnRhbC9wb3BvdmVyLWVkaXQvZWRpdC1yZWYudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBUUEsT0FBTyxFQUFDLFVBQVUsRUFBYSxJQUFJLEVBQUUsTUFBTSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ2xFLE9BQU8sRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQ2hELE9BQU8sRUFBYSxPQUFPLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDekMsT0FBTyxFQUFDLElBQUksRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBRXBDLE9BQU8sRUFBQyxtQkFBbUIsRUFBQyxNQUFNLHlCQUF5QixDQUFDOzs7Ozs7QUFPNUQsTUFBTSxPQUFPLE9BQU87Ozs7OztJQVlsQixZQUM2QixLQUF1QixFQUMvQixvQkFBeUMsRUFDekMsT0FBZTtRQUZQLFVBQUssR0FBTCxLQUFLLENBQWtCO1FBQy9CLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBcUI7UUFDekMsWUFBTyxHQUFQLE9BQU8sQ0FBUTs7OztRQWJuQix1QkFBa0IsR0FBRyxJQUFJLE9BQU8sRUFBYSxDQUFDO1FBQ3RELGVBQVUsR0FBMEIsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFlBQVksRUFBRSxDQUFDOzs7O1FBR25FLG9CQUFlLEdBQUcsSUFBSSxPQUFPLEVBQVEsQ0FBQztRQUM5QyxZQUFPLEdBQXFCLElBQUksQ0FBQyxlQUFlLENBQUMsWUFBWSxFQUFFLENBQUM7UUFTdkUsSUFBSSxDQUFDLG9CQUFvQixDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ25ELENBQUM7Ozs7Ozs7O0lBT0QsSUFBSSxDQUFDLGlCQUFzQztRQUN6QyxtRUFBbUU7UUFDbkUsNkRBQTZEO1FBQzdELElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTOzs7UUFBQyxHQUFHLEVBQUU7WUFDakQsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7WUFDekIsSUFBSSxpQkFBaUIsRUFBRTtnQkFDckIsSUFBSSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO2FBQy9CO1FBQ0gsQ0FBQyxFQUFDLENBQUM7SUFDTCxDQUFDOzs7O0lBRUQsV0FBVztRQUNULElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNuRCxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDL0MsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ3JDLENBQUM7Ozs7O0lBR0QsT0FBTztRQUNMLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUM7SUFDMUIsQ0FBQzs7Ozs7SUFHRCxpQkFBaUI7UUFDZixJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUM7SUFDM0MsQ0FBQzs7Ozs7SUFHRCxLQUFLO1FBQ0gsSUFBSSxDQUFDLG9CQUFvQixDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDL0MsQ0FBQzs7Ozs7SUFHRCxJQUFJO1FBQ0YsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUM5QixDQUFDOzs7Ozs7O0lBTUQsS0FBSyxDQUFDLEtBQWlCO1FBQ3JCLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUNuRCxDQUFDOzs7WUFwRUYsVUFBVTs7OztZQVZILGdCQUFnQix1QkF3QmpCLElBQUk7WUFwQkgsbUJBQW1CO1lBTFUsTUFBTTs7Ozs7Ozs7SUFjekMscUNBQStEOztJQUMvRCw2QkFBb0Y7Ozs7OztJQUdwRixrQ0FBdUQ7O0lBQ3ZELDBCQUF5RTs7Ozs7O0lBR3pFLG1DQUFvQzs7Ozs7SUFHaEMsd0JBQWdEOzs7OztJQUNoRCx1Q0FBMEQ7Ozs7O0lBQzFELDBCQUFnQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0luamVjdGFibGUsIE9uRGVzdHJveSwgU2VsZiwgTmdab25lfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7Q29udHJvbENvbnRhaW5lcn0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xuaW1wb3J0IHtPYnNlcnZhYmxlLCBTdWJqZWN0fSBmcm9tICdyeGpzJztcbmltcG9ydCB7dGFrZX0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuXG5pbXBvcnQge0VkaXRFdmVudERpc3BhdGNoZXJ9IGZyb20gJy4vZWRpdC1ldmVudC1kaXNwYXRjaGVyJztcblxuLyoqXG4gKiBVc2VkIGZvciBjb21tdW5pY2F0aW9uIGJldHdlZW4gdGhlIGZvcm0gd2l0aGluIHRoZSBlZGl0IGxlbnMgYW5kIHRoZVxuICogdGFibGUgdGhhdCBsYXVuY2hlZCBpdC4gUHJvdmlkZWQgYnkgQ2RrRWRpdENvbnRyb2wgd2l0aGluIHRoZSBsZW5zLlxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgRWRpdFJlZjxGb3JtVmFsdWU+IGltcGxlbWVudHMgT25EZXN0cm95IHtcbiAgLyoqIEVtaXRzIHRoZSBmaW5hbCB2YWx1ZSBvZiB0aGlzIGVkaXQgaW5zdGFuY2UgYmVmb3JlIGNsb3NpbmcuICovXG4gIHByaXZhdGUgcmVhZG9ubHkgX2ZpbmFsVmFsdWVTdWJqZWN0ID0gbmV3IFN1YmplY3Q8Rm9ybVZhbHVlPigpO1xuICByZWFkb25seSBmaW5hbFZhbHVlOiBPYnNlcnZhYmxlPEZvcm1WYWx1ZT4gPSB0aGlzLl9maW5hbFZhbHVlU3ViamVjdC5hc09ic2VydmFibGUoKTtcblxuICAvKiogRW1pdHMgd2hlbiB0aGUgdXNlciB0YWJzIG91dCBvZiB0aGlzIGVkaXQgbGVucyBiZWZvcmUgY2xvc2luZy4gKi9cbiAgcHJpdmF0ZSByZWFkb25seSBfYmx1cnJlZFN1YmplY3QgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xuICByZWFkb25seSBibHVycmVkOiBPYnNlcnZhYmxlPHZvaWQ+ID0gdGhpcy5fYmx1cnJlZFN1YmplY3QuYXNPYnNlcnZhYmxlKCk7XG5cbiAgLyoqIFRoZSB2YWx1ZSB0byBzZXQgdGhlIGZvcm0gYmFjayB0byBvbiByZXZlcnQuICovXG4gIHByaXZhdGUgX3JldmVydEZvcm1WYWx1ZTogRm9ybVZhbHVlO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgQFNlbGYoKSBwcml2YXRlIHJlYWRvbmx5IF9mb3JtOiBDb250cm9sQ29udGFpbmVyLFxuICAgICAgcHJpdmF0ZSByZWFkb25seSBfZWRpdEV2ZW50RGlzcGF0Y2hlcjogRWRpdEV2ZW50RGlzcGF0Y2hlcixcbiAgICAgIHByaXZhdGUgcmVhZG9ubHkgX25nWm9uZTogTmdab25lKSB7XG4gICAgdGhpcy5fZWRpdEV2ZW50RGlzcGF0Y2hlci5zZXRBY3RpdmVFZGl0UmVmKHRoaXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxlZCBieSB0aGUgaG9zdCBkaXJlY3RpdmUncyBPbkluaXQgaG9vay4gUmVhZHMgdGhlIGluaXRpYWwgc3RhdGUgb2YgdGhlXG4gICAqIGZvcm0gYW5kIG92ZXJyaWRlcyBpdCB3aXRoIHBlcnNpc3RlZCBzdGF0ZSBmcm9tIHByZXZpb3VzIG9wZW5pbmdzLCBpZlxuICAgKiBhcHBsaWNhYmxlLlxuICAgKi9cbiAgaW5pdChwcmV2aW91c0Zvcm1WYWx1ZTogRm9ybVZhbHVlfHVuZGVmaW5lZCk6IHZvaWQge1xuICAgIC8vIFdhaXQgZm9yIHRoZSB6b25lIHRvIHN0YWJpbGl6ZSBiZWZvcmUgY2FjaGluZyB0aGUgaW5pdGlhbCB2YWx1ZS5cbiAgICAvLyBUaGlzIGVuc3VyZXMgdGhhdCBhbGwgZm9ybSBjb250cm9scyBoYXZlIGJlZW4gaW5pdGlhbGl6ZWQuXG4gICAgdGhpcy5fbmdab25lLm9uU3RhYmxlLnBpcGUodGFrZSgxKSkuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgIHRoaXMudXBkYXRlUmV2ZXJ0VmFsdWUoKTtcbiAgICAgIGlmIChwcmV2aW91c0Zvcm1WYWx1ZSkge1xuICAgICAgICB0aGlzLnJlc2V0KHByZXZpb3VzRm9ybVZhbHVlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCk6IHZvaWQge1xuICAgIHRoaXMuX2VkaXRFdmVudERpc3BhdGNoZXIudW5zZXRBY3RpdmVFZGl0UmVmKHRoaXMpO1xuICAgIHRoaXMuX2ZpbmFsVmFsdWVTdWJqZWN0Lm5leHQodGhpcy5fZm9ybS52YWx1ZSk7XG4gICAgdGhpcy5fZmluYWxWYWx1ZVN1YmplY3QuY29tcGxldGUoKTtcbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoZSBhdHRhY2hlZCBmb3JtIGlzIGluIGEgdmFsaWQgc3RhdGUuICovXG4gIGlzVmFsaWQoKTogYm9vbGVhbnxudWxsIHtcbiAgICByZXR1cm4gdGhpcy5fZm9ybS52YWxpZDtcbiAgfVxuXG4gIC8qKiBTZXQgdGhlIGZvcm0ncyBjdXJyZW50IHZhbHVlIGFzIHdoYXQgaXQgd2lsbCBiZSBzZXQgdG8gb24gcmV2ZXJ0L3Jlc2V0LiAqL1xuICB1cGRhdGVSZXZlcnRWYWx1ZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9yZXZlcnRGb3JtVmFsdWUgPSB0aGlzLl9mb3JtLnZhbHVlO1xuICB9XG5cbiAgLyoqIFRlbGxzIHRoZSB0YWJsZSB0byBjbG9zZSB0aGUgZWRpdCBwb3B1cC4gKi9cbiAgY2xvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5fZWRpdEV2ZW50RGlzcGF0Y2hlci5lZGl0aW5nLm5leHQobnVsbCk7XG4gIH1cblxuICAvKiogTm90aWZpZXMgdGhlIGFjdGl2ZSBlZGl0IHRoYXQgdGhlIHVzZXIgaGFzIG1vdmVkIGZvY3VzIG91dCBvZiB0aGUgbGVucy4gKi9cbiAgYmx1cigpOiB2b2lkIHtcbiAgICB0aGlzLl9ibHVycmVkU3ViamVjdC5uZXh0KCk7XG4gIH1cblxuICAvKipcbiAgICogUmVzZXRzIHRoZSBmb3JtIHZhbHVlIHRvIHRoZSBzcGVjaWZpZWQgdmFsdWUgb3IgdGhlIHByZXZpb3VzbHkgc2V0XG4gICAqIHJldmVydCB2YWx1ZS5cbiAgICovXG4gIHJlc2V0KHZhbHVlPzogRm9ybVZhbHVlKTogdm9pZCB7XG4gICAgdGhpcy5fZm9ybS5yZXNldCh2YWx1ZSB8fCB0aGlzLl9yZXZlcnRGb3JtVmFsdWUpO1xuICB9XG59XG4iXX0=