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
var EditRef = /** @class */ (function () {
    function EditRef(_form, _editEventDispatcher, _ngZone) {
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
    EditRef.prototype.init = function (previousFormValue) {
        var _this = this;
        // Wait for the zone to stabilize before caching the initial value.
        // This ensures that all form controls have been initialized.
        this._ngZone.onStable.pipe(take(1)).subscribe(function () {
            _this.updateRevertValue();
            if (previousFormValue) {
                _this.reset(previousFormValue);
            }
        });
    };
    EditRef.prototype.ngOnDestroy = function () {
        this._editEventDispatcher.unsetActiveEditRef(this);
        this._finalValueSubject.next(this._form.value);
        this._finalValueSubject.complete();
    };
    /** Whether the attached form is in a valid state. */
    EditRef.prototype.isValid = function () {
        return this._form.valid;
    };
    /** Set the form's current value as what it will be set to on revert/reset. */
    EditRef.prototype.updateRevertValue = function () {
        this._revertFormValue = this._form.value;
    };
    /** Tells the table to close the edit popup. */
    EditRef.prototype.close = function () {
        this._editEventDispatcher.editing.next(null);
    };
    /** Notifies the active edit that the user has moved focus out of the lens. */
    EditRef.prototype.blur = function () {
        this._blurredSubject.next();
    };
    /**
     * Resets the form value to the specified value or the previously set
     * revert value.
     */
    EditRef.prototype.reset = function (value) {
        this._form.reset(value || this._revertFormValue);
    };
    EditRef.decorators = [
        { type: Injectable }
    ];
    /** @nocollapse */
    EditRef.ctorParameters = function () { return [
        { type: ControlContainer, decorators: [{ type: Self }] },
        { type: EditEventDispatcher },
        { type: NgZone }
    ]; };
    return EditRef;
}());
export { EditRef };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdC1yZWYuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrLWV4cGVyaW1lbnRhbC9wb3BvdmVyLWVkaXQvZWRpdC1yZWYudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFVBQVUsRUFBYSxJQUFJLEVBQUUsTUFBTSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ2xFLE9BQU8sRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQ2hELE9BQU8sRUFBYSxPQUFPLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDekMsT0FBTyxFQUFDLElBQUksRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBRXBDLE9BQU8sRUFBQyxtQkFBbUIsRUFBQyxNQUFNLHlCQUF5QixDQUFDO0FBRTVEOzs7R0FHRztBQUNIO0lBYUUsaUJBQzZCLEtBQXVCLEVBQy9CLG9CQUF5QyxFQUN6QyxPQUFlO1FBRlAsVUFBSyxHQUFMLEtBQUssQ0FBa0I7UUFDL0IseUJBQW9CLEdBQXBCLG9CQUFvQixDQUFxQjtRQUN6QyxZQUFPLEdBQVAsT0FBTyxDQUFRO1FBZHBDLGtFQUFrRTtRQUNqRCx1QkFBa0IsR0FBRyxJQUFJLE9BQU8sRUFBYSxDQUFDO1FBQ3RELGVBQVUsR0FBMEIsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFlBQVksRUFBRSxDQUFDO1FBRXBGLHFFQUFxRTtRQUNwRCxvQkFBZSxHQUFHLElBQUksT0FBTyxFQUFRLENBQUM7UUFDOUMsWUFBTyxHQUFxQixJQUFJLENBQUMsZUFBZSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBU3ZFLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNuRCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILHNCQUFJLEdBQUosVUFBSyxpQkFBc0M7UUFBM0MsaUJBU0M7UUFSQyxtRUFBbUU7UUFDbkUsNkRBQTZEO1FBQzdELElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7WUFDNUMsS0FBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7WUFDekIsSUFBSSxpQkFBaUIsRUFBRTtnQkFDckIsS0FBSSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO2FBQy9CO1FBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQsNkJBQVcsR0FBWDtRQUNFLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNuRCxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDL0MsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ3JDLENBQUM7SUFFRCxxREFBcUQ7SUFDckQseUJBQU8sR0FBUDtRQUNFLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUM7SUFDMUIsQ0FBQztJQUVELDhFQUE4RTtJQUM5RSxtQ0FBaUIsR0FBakI7UUFDRSxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUM7SUFDM0MsQ0FBQztJQUVELCtDQUErQztJQUMvQyx1QkFBSyxHQUFMO1FBQ0UsSUFBSSxDQUFDLG9CQUFvQixDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDL0MsQ0FBQztJQUVELDhFQUE4RTtJQUM5RSxzQkFBSSxHQUFKO1FBQ0UsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUM5QixDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsdUJBQUssR0FBTCxVQUFNLEtBQWlCO1FBQ3JCLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUNuRCxDQUFDOztnQkFwRUYsVUFBVTs7OztnQkFWSCxnQkFBZ0IsdUJBd0JqQixJQUFJO2dCQXBCSCxtQkFBbUI7Z0JBTFUsTUFBTTs7SUFnRjNDLGNBQUM7Q0FBQSxBQXJFRCxJQXFFQztTQXBFWSxPQUFPIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SW5qZWN0YWJsZSwgT25EZXN0cm95LCBTZWxmLCBOZ1pvbmV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtDb250cm9sQ29udGFpbmVyfSBmcm9tICdAYW5ndWxhci9mb3Jtcyc7XG5pbXBvcnQge09ic2VydmFibGUsIFN1YmplY3R9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHt0YWtlfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbmltcG9ydCB7RWRpdEV2ZW50RGlzcGF0Y2hlcn0gZnJvbSAnLi9lZGl0LWV2ZW50LWRpc3BhdGNoZXInO1xuXG4vKipcbiAqIFVzZWQgZm9yIGNvbW11bmljYXRpb24gYmV0d2VlbiB0aGUgZm9ybSB3aXRoaW4gdGhlIGVkaXQgbGVucyBhbmQgdGhlXG4gKiB0YWJsZSB0aGF0IGxhdW5jaGVkIGl0LiBQcm92aWRlZCBieSBDZGtFZGl0Q29udHJvbCB3aXRoaW4gdGhlIGxlbnMuXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBFZGl0UmVmPEZvcm1WYWx1ZT4gaW1wbGVtZW50cyBPbkRlc3Ryb3kge1xuICAvKiogRW1pdHMgdGhlIGZpbmFsIHZhbHVlIG9mIHRoaXMgZWRpdCBpbnN0YW5jZSBiZWZvcmUgY2xvc2luZy4gKi9cbiAgcHJpdmF0ZSByZWFkb25seSBfZmluYWxWYWx1ZVN1YmplY3QgPSBuZXcgU3ViamVjdDxGb3JtVmFsdWU+KCk7XG4gIHJlYWRvbmx5IGZpbmFsVmFsdWU6IE9ic2VydmFibGU8Rm9ybVZhbHVlPiA9IHRoaXMuX2ZpbmFsVmFsdWVTdWJqZWN0LmFzT2JzZXJ2YWJsZSgpO1xuXG4gIC8qKiBFbWl0cyB3aGVuIHRoZSB1c2VyIHRhYnMgb3V0IG9mIHRoaXMgZWRpdCBsZW5zIGJlZm9yZSBjbG9zaW5nLiAqL1xuICBwcml2YXRlIHJlYWRvbmx5IF9ibHVycmVkU3ViamVjdCA9IG5ldyBTdWJqZWN0PHZvaWQ+KCk7XG4gIHJlYWRvbmx5IGJsdXJyZWQ6IE9ic2VydmFibGU8dm9pZD4gPSB0aGlzLl9ibHVycmVkU3ViamVjdC5hc09ic2VydmFibGUoKTtcblxuICAvKiogVGhlIHZhbHVlIHRvIHNldCB0aGUgZm9ybSBiYWNrIHRvIG9uIHJldmVydC4gKi9cbiAgcHJpdmF0ZSBfcmV2ZXJ0Rm9ybVZhbHVlOiBGb3JtVmFsdWU7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBAU2VsZigpIHByaXZhdGUgcmVhZG9ubHkgX2Zvcm06IENvbnRyb2xDb250YWluZXIsXG4gICAgICBwcml2YXRlIHJlYWRvbmx5IF9lZGl0RXZlbnREaXNwYXRjaGVyOiBFZGl0RXZlbnREaXNwYXRjaGVyLFxuICAgICAgcHJpdmF0ZSByZWFkb25seSBfbmdab25lOiBOZ1pvbmUpIHtcbiAgICB0aGlzLl9lZGl0RXZlbnREaXNwYXRjaGVyLnNldEFjdGl2ZUVkaXRSZWYodGhpcyk7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIGJ5IHRoZSBob3N0IGRpcmVjdGl2ZSdzIE9uSW5pdCBob29rLiBSZWFkcyB0aGUgaW5pdGlhbCBzdGF0ZSBvZiB0aGVcbiAgICogZm9ybSBhbmQgb3ZlcnJpZGVzIGl0IHdpdGggcGVyc2lzdGVkIHN0YXRlIGZyb20gcHJldmlvdXMgb3BlbmluZ3MsIGlmXG4gICAqIGFwcGxpY2FibGUuXG4gICAqL1xuICBpbml0KHByZXZpb3VzRm9ybVZhbHVlOiBGb3JtVmFsdWV8dW5kZWZpbmVkKTogdm9pZCB7XG4gICAgLy8gV2FpdCBmb3IgdGhlIHpvbmUgdG8gc3RhYmlsaXplIGJlZm9yZSBjYWNoaW5nIHRoZSBpbml0aWFsIHZhbHVlLlxuICAgIC8vIFRoaXMgZW5zdXJlcyB0aGF0IGFsbCBmb3JtIGNvbnRyb2xzIGhhdmUgYmVlbiBpbml0aWFsaXplZC5cbiAgICB0aGlzLl9uZ1pvbmUub25TdGFibGUucGlwZSh0YWtlKDEpKS5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgdGhpcy51cGRhdGVSZXZlcnRWYWx1ZSgpO1xuICAgICAgaWYgKHByZXZpb3VzRm9ybVZhbHVlKSB7XG4gICAgICAgIHRoaXMucmVzZXQocHJldmlvdXNGb3JtVmFsdWUpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgdGhpcy5fZWRpdEV2ZW50RGlzcGF0Y2hlci51bnNldEFjdGl2ZUVkaXRSZWYodGhpcyk7XG4gICAgdGhpcy5fZmluYWxWYWx1ZVN1YmplY3QubmV4dCh0aGlzLl9mb3JtLnZhbHVlKTtcbiAgICB0aGlzLl9maW5hbFZhbHVlU3ViamVjdC5jb21wbGV0ZSgpO1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGF0dGFjaGVkIGZvcm0gaXMgaW4gYSB2YWxpZCBzdGF0ZS4gKi9cbiAgaXNWYWxpZCgpOiBib29sZWFufG51bGwge1xuICAgIHJldHVybiB0aGlzLl9mb3JtLnZhbGlkO1xuICB9XG5cbiAgLyoqIFNldCB0aGUgZm9ybSdzIGN1cnJlbnQgdmFsdWUgYXMgd2hhdCBpdCB3aWxsIGJlIHNldCB0byBvbiByZXZlcnQvcmVzZXQuICovXG4gIHVwZGF0ZVJldmVydFZhbHVlKCk6IHZvaWQge1xuICAgIHRoaXMuX3JldmVydEZvcm1WYWx1ZSA9IHRoaXMuX2Zvcm0udmFsdWU7XG4gIH1cblxuICAvKiogVGVsbHMgdGhlIHRhYmxlIHRvIGNsb3NlIHRoZSBlZGl0IHBvcHVwLiAqL1xuICBjbG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9lZGl0RXZlbnREaXNwYXRjaGVyLmVkaXRpbmcubmV4dChudWxsKTtcbiAgfVxuXG4gIC8qKiBOb3RpZmllcyB0aGUgYWN0aXZlIGVkaXQgdGhhdCB0aGUgdXNlciBoYXMgbW92ZWQgZm9jdXMgb3V0IG9mIHRoZSBsZW5zLiAqL1xuICBibHVyKCk6IHZvaWQge1xuICAgIHRoaXMuX2JsdXJyZWRTdWJqZWN0Lm5leHQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXNldHMgdGhlIGZvcm0gdmFsdWUgdG8gdGhlIHNwZWNpZmllZCB2YWx1ZSBvciB0aGUgcHJldmlvdXNseSBzZXRcbiAgICogcmV2ZXJ0IHZhbHVlLlxuICAgKi9cbiAgcmVzZXQodmFsdWU/OiBGb3JtVmFsdWUpOiB2b2lkIHtcbiAgICB0aGlzLl9mb3JtLnJlc2V0KHZhbHVlIHx8IHRoaXMuX3JldmVydEZvcm1WYWx1ZSk7XG4gIH1cbn1cbiJdfQ==