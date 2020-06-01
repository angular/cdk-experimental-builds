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
    /** @nocollapse */
    EditRef.ctorParameters = () => [
        { type: ControlContainer, decorators: [{ type: Self }] },
        { type: EditEventDispatcher },
        { type: NgZone }
    ];
    return EditRef;
})();
export { EditRef };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdC1yZWYuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrLWV4cGVyaW1lbnRhbC9wb3BvdmVyLWVkaXQvZWRpdC1yZWYudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFVBQVUsRUFBYSxJQUFJLEVBQUUsTUFBTSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ2xFLE9BQU8sRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQ2hELE9BQU8sRUFBYSxPQUFPLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDekMsT0FBTyxFQUFDLElBQUksRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBRXBDLE9BQU8sRUFBQyxtQkFBbUIsRUFBQyxNQUFNLHlCQUF5QixDQUFDO0FBRTVEOzs7R0FHRztBQUNIO0lBQUEsTUFDYSxPQUFPO1FBWWxCLFlBQzZCLEtBQXVCLEVBQy9CLG9CQUF5QyxFQUN6QyxPQUFlO1lBRlAsVUFBSyxHQUFMLEtBQUssQ0FBa0I7WUFDL0IseUJBQW9CLEdBQXBCLG9CQUFvQixDQUFxQjtZQUN6QyxZQUFPLEdBQVAsT0FBTyxDQUFRO1lBZHBDLGtFQUFrRTtZQUNqRCx1QkFBa0IsR0FBRyxJQUFJLE9BQU8sRUFBYSxDQUFDO1lBQ3RELGVBQVUsR0FBMEIsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFlBQVksRUFBRSxDQUFDO1lBRXBGLHFFQUFxRTtZQUNwRCxvQkFBZSxHQUFHLElBQUksT0FBTyxFQUFRLENBQUM7WUFDOUMsWUFBTyxHQUFxQixJQUFJLENBQUMsZUFBZSxDQUFDLFlBQVksRUFBRSxDQUFDO1lBU3ZFLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNuRCxDQUFDO1FBRUQ7Ozs7V0FJRztRQUNILElBQUksQ0FBQyxpQkFBc0M7WUFDekMsbUVBQW1FO1lBQ25FLDZEQUE2RDtZQUM3RCxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRTtnQkFDakQsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7Z0JBQ3pCLElBQUksaUJBQWlCLEVBQUU7b0JBQ3JCLElBQUksQ0FBQyxLQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQztpQkFDL0I7WUFDSCxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7UUFFRCxXQUFXO1lBQ1QsSUFBSSxDQUFDLG9CQUFvQixDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ25ELElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUMvQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDckMsQ0FBQztRQUVELHFEQUFxRDtRQUNyRCxPQUFPO1lBQ0wsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQztRQUMxQixDQUFDO1FBRUQsOEVBQThFO1FBQzlFLGlCQUFpQjtZQUNmLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQztRQUMzQyxDQUFDO1FBRUQsK0NBQStDO1FBQy9DLEtBQUs7WUFDSCxJQUFJLENBQUMsb0JBQW9CLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMvQyxDQUFDO1FBRUQsOEVBQThFO1FBQzlFLElBQUk7WUFDRixJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQzlCLENBQUM7UUFFRDs7O1dBR0c7UUFDSCxLQUFLLENBQUMsS0FBaUI7WUFDckIsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ25ELENBQUM7OztnQkFwRUYsVUFBVTs7OztnQkFWSCxnQkFBZ0IsdUJBd0JqQixJQUFJO2dCQXBCSCxtQkFBbUI7Z0JBTFUsTUFBTTs7SUFnRjNDLGNBQUM7S0FBQTtTQXBFWSxPQUFPIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SW5qZWN0YWJsZSwgT25EZXN0cm95LCBTZWxmLCBOZ1pvbmV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtDb250cm9sQ29udGFpbmVyfSBmcm9tICdAYW5ndWxhci9mb3Jtcyc7XG5pbXBvcnQge09ic2VydmFibGUsIFN1YmplY3R9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHt0YWtlfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbmltcG9ydCB7RWRpdEV2ZW50RGlzcGF0Y2hlcn0gZnJvbSAnLi9lZGl0LWV2ZW50LWRpc3BhdGNoZXInO1xuXG4vKipcbiAqIFVzZWQgZm9yIGNvbW11bmljYXRpb24gYmV0d2VlbiB0aGUgZm9ybSB3aXRoaW4gdGhlIGVkaXQgbGVucyBhbmQgdGhlXG4gKiB0YWJsZSB0aGF0IGxhdW5jaGVkIGl0LiBQcm92aWRlZCBieSBDZGtFZGl0Q29udHJvbCB3aXRoaW4gdGhlIGxlbnMuXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBFZGl0UmVmPEZvcm1WYWx1ZT4gaW1wbGVtZW50cyBPbkRlc3Ryb3kge1xuICAvKiogRW1pdHMgdGhlIGZpbmFsIHZhbHVlIG9mIHRoaXMgZWRpdCBpbnN0YW5jZSBiZWZvcmUgY2xvc2luZy4gKi9cbiAgcHJpdmF0ZSByZWFkb25seSBfZmluYWxWYWx1ZVN1YmplY3QgPSBuZXcgU3ViamVjdDxGb3JtVmFsdWU+KCk7XG4gIHJlYWRvbmx5IGZpbmFsVmFsdWU6IE9ic2VydmFibGU8Rm9ybVZhbHVlPiA9IHRoaXMuX2ZpbmFsVmFsdWVTdWJqZWN0LmFzT2JzZXJ2YWJsZSgpO1xuXG4gIC8qKiBFbWl0cyB3aGVuIHRoZSB1c2VyIHRhYnMgb3V0IG9mIHRoaXMgZWRpdCBsZW5zIGJlZm9yZSBjbG9zaW5nLiAqL1xuICBwcml2YXRlIHJlYWRvbmx5IF9ibHVycmVkU3ViamVjdCA9IG5ldyBTdWJqZWN0PHZvaWQ+KCk7XG4gIHJlYWRvbmx5IGJsdXJyZWQ6IE9ic2VydmFibGU8dm9pZD4gPSB0aGlzLl9ibHVycmVkU3ViamVjdC5hc09ic2VydmFibGUoKTtcblxuICAvKiogVGhlIHZhbHVlIHRvIHNldCB0aGUgZm9ybSBiYWNrIHRvIG9uIHJldmVydC4gKi9cbiAgcHJpdmF0ZSBfcmV2ZXJ0Rm9ybVZhbHVlOiBGb3JtVmFsdWU7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBAU2VsZigpIHByaXZhdGUgcmVhZG9ubHkgX2Zvcm06IENvbnRyb2xDb250YWluZXIsXG4gICAgICBwcml2YXRlIHJlYWRvbmx5IF9lZGl0RXZlbnREaXNwYXRjaGVyOiBFZGl0RXZlbnREaXNwYXRjaGVyLFxuICAgICAgcHJpdmF0ZSByZWFkb25seSBfbmdab25lOiBOZ1pvbmUpIHtcbiAgICB0aGlzLl9lZGl0RXZlbnREaXNwYXRjaGVyLnNldEFjdGl2ZUVkaXRSZWYodGhpcyk7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIGJ5IHRoZSBob3N0IGRpcmVjdGl2ZSdzIE9uSW5pdCBob29rLiBSZWFkcyB0aGUgaW5pdGlhbCBzdGF0ZSBvZiB0aGVcbiAgICogZm9ybSBhbmQgb3ZlcnJpZGVzIGl0IHdpdGggcGVyc2lzdGVkIHN0YXRlIGZyb20gcHJldmlvdXMgb3BlbmluZ3MsIGlmXG4gICAqIGFwcGxpY2FibGUuXG4gICAqL1xuICBpbml0KHByZXZpb3VzRm9ybVZhbHVlOiBGb3JtVmFsdWV8dW5kZWZpbmVkKTogdm9pZCB7XG4gICAgLy8gV2FpdCBmb3IgdGhlIHpvbmUgdG8gc3RhYmlsaXplIGJlZm9yZSBjYWNoaW5nIHRoZSBpbml0aWFsIHZhbHVlLlxuICAgIC8vIFRoaXMgZW5zdXJlcyB0aGF0IGFsbCBmb3JtIGNvbnRyb2xzIGhhdmUgYmVlbiBpbml0aWFsaXplZC5cbiAgICB0aGlzLl9uZ1pvbmUub25TdGFibGUucGlwZSh0YWtlKDEpKS5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgdGhpcy51cGRhdGVSZXZlcnRWYWx1ZSgpO1xuICAgICAgaWYgKHByZXZpb3VzRm9ybVZhbHVlKSB7XG4gICAgICAgIHRoaXMucmVzZXQocHJldmlvdXNGb3JtVmFsdWUpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgdGhpcy5fZWRpdEV2ZW50RGlzcGF0Y2hlci51bnNldEFjdGl2ZUVkaXRSZWYodGhpcyk7XG4gICAgdGhpcy5fZmluYWxWYWx1ZVN1YmplY3QubmV4dCh0aGlzLl9mb3JtLnZhbHVlKTtcbiAgICB0aGlzLl9maW5hbFZhbHVlU3ViamVjdC5jb21wbGV0ZSgpO1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGF0dGFjaGVkIGZvcm0gaXMgaW4gYSB2YWxpZCBzdGF0ZS4gKi9cbiAgaXNWYWxpZCgpOiBib29sZWFufG51bGwge1xuICAgIHJldHVybiB0aGlzLl9mb3JtLnZhbGlkO1xuICB9XG5cbiAgLyoqIFNldCB0aGUgZm9ybSdzIGN1cnJlbnQgdmFsdWUgYXMgd2hhdCBpdCB3aWxsIGJlIHNldCB0byBvbiByZXZlcnQvcmVzZXQuICovXG4gIHVwZGF0ZVJldmVydFZhbHVlKCk6IHZvaWQge1xuICAgIHRoaXMuX3JldmVydEZvcm1WYWx1ZSA9IHRoaXMuX2Zvcm0udmFsdWU7XG4gIH1cblxuICAvKiogVGVsbHMgdGhlIHRhYmxlIHRvIGNsb3NlIHRoZSBlZGl0IHBvcHVwLiAqL1xuICBjbG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9lZGl0RXZlbnREaXNwYXRjaGVyLmVkaXRpbmcubmV4dChudWxsKTtcbiAgfVxuXG4gIC8qKiBOb3RpZmllcyB0aGUgYWN0aXZlIGVkaXQgdGhhdCB0aGUgdXNlciBoYXMgbW92ZWQgZm9jdXMgb3V0IG9mIHRoZSBsZW5zLiAqL1xuICBibHVyKCk6IHZvaWQge1xuICAgIHRoaXMuX2JsdXJyZWRTdWJqZWN0Lm5leHQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXNldHMgdGhlIGZvcm0gdmFsdWUgdG8gdGhlIHNwZWNpZmllZCB2YWx1ZSBvciB0aGUgcHJldmlvdXNseSBzZXRcbiAgICogcmV2ZXJ0IHZhbHVlLlxuICAgKi9cbiAgcmVzZXQodmFsdWU/OiBGb3JtVmFsdWUpOiB2b2lkIHtcbiAgICB0aGlzLl9mb3JtLnJlc2V0KHZhbHVlIHx8IHRoaXMuX3JldmVydEZvcm1WYWx1ZSk7XG4gIH1cbn1cbiJdfQ==