/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, Inject, Optional, Self } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { of as observableOf, Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { CdkSelection } from './selection';
import * as i0 from "@angular/core";
import * as i1 from "./selection";
/**
 * Makes the element a select-all toggle.
 *
 * Must be used within a parent `CdkSelection` directive. It toggles the selection states
 * of all the selection toggles connected with the `CdkSelection` directive.
 * If the element implements `ControlValueAccessor`, e.g. `MatCheckbox`, the directive
 * automatically connects it with the select-all state provided by the `CdkSelection` directive. If
 * not, use `checked$` to get the checked state, `indeterminate$` to get the indeterminate state,
 * and `toggle()` to change the selection state.
 */
export class CdkSelectAll {
    /**
     * Toggles the select-all state.
     * @param event The click event if the toggle is triggered by a (mouse or keyboard) click. If
     *     using with a native `<input type="checkbox">`, the parameter is required for the
     *     indeterminate state to work properly.
     */
    toggle(event) {
        // This is needed when applying the directive on a native <input type="checkbox">
        // checkbox. The default behavior needs to be prevented in order to support the indeterminate
        // state. The timeout is also needed so the checkbox can show the latest state.
        if (event) {
            event.preventDefault();
        }
        setTimeout(() => {
            this._selection.toggleSelectAll();
        });
    }
    constructor(_selection, _controlValueAccessor) {
        this._selection = _selection;
        this._controlValueAccessor = _controlValueAccessor;
        this._destroyed = new Subject();
        this.checked = _selection.change.pipe(switchMap(() => observableOf(_selection.isAllSelected())));
        this.indeterminate = _selection.change.pipe(switchMap(() => observableOf(_selection.isPartialSelected())));
    }
    ngOnInit() {
        this._assertValidParentSelection();
        this._configureControlValueAccessor();
    }
    _configureControlValueAccessor() {
        if (this._controlValueAccessor && this._controlValueAccessor.length) {
            this._controlValueAccessor[0].registerOnChange((e) => {
                if (e === true || e === false) {
                    this.toggle();
                }
            });
            this.checked.pipe(takeUntil(this._destroyed)).subscribe(state => {
                this._controlValueAccessor[0].writeValue(state);
            });
        }
    }
    _assertValidParentSelection() {
        if (!this._selection && (typeof ngDevMode === 'undefined' || ngDevMode)) {
            throw Error('CdkSelectAll: missing CdkSelection in the parent');
        }
        if (!this._selection.multiple && (typeof ngDevMode === 'undefined' || ngDevMode)) {
            throw Error('CdkSelectAll: CdkSelection must have cdkSelectionMultiple set to true');
        }
    }
    ngOnDestroy() {
        this._destroyed.next();
        this._destroyed.complete();
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: CdkSelectAll, deps: [{ token: CdkSelection, optional: true }, { token: NG_VALUE_ACCESSOR, optional: true, self: true }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.1.0", type: CdkSelectAll, isStandalone: true, selector: "[cdkSelectAll]", exportAs: ["cdkSelectAll"], ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: CdkSelectAll, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkSelectAll]',
                    exportAs: 'cdkSelectAll',
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: i1.CdkSelection, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [CdkSelection]
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Self
                }, {
                    type: Inject,
                    args: [NG_VALUE_ACCESSOR]
                }] }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VsZWN0LWFsbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL3NlbGVjdGlvbi9zZWxlY3QtYWxsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxTQUFTLEVBQUUsTUFBTSxFQUFxQixRQUFRLEVBQUUsSUFBSSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ25GLE9BQU8sRUFBdUIsaUJBQWlCLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUN2RSxPQUFPLEVBQWEsRUFBRSxJQUFJLFlBQVksRUFBRSxPQUFPLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDN0QsT0FBTyxFQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUVwRCxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sYUFBYSxDQUFDOzs7QUFFekM7Ozs7Ozs7OztHQVNHO0FBTUgsTUFBTSxPQUFPLFlBQVk7SUFjdkI7Ozs7O09BS0c7SUFDSCxNQUFNLENBQUMsS0FBa0I7UUFDdkIsaUZBQWlGO1FBQ2pGLDZGQUE2RjtRQUM3RiwrRUFBK0U7UUFDL0UsSUFBSSxLQUFLLEVBQUUsQ0FBQztZQUNWLEtBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUN6QixDQUFDO1FBRUQsVUFBVSxDQUFDLEdBQUcsRUFBRTtZQUNkLElBQUksQ0FBQyxVQUFVLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDcEMsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBSUQsWUFDcUQsVUFBMkIsRUFJN0QscUJBQTZDO1FBSlgsZUFBVSxHQUFWLFVBQVUsQ0FBaUI7UUFJN0QsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF3QjtRQVAvQyxlQUFVLEdBQUcsSUFBSSxPQUFPLEVBQVEsQ0FBQztRQVNoRCxJQUFJLENBQUMsT0FBTyxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUNuQyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDLENBQzFELENBQUM7UUFFRixJQUFJLENBQUMsYUFBYSxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUN6QyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLENBQUMsQ0FDOUQsQ0FBQztJQUNKLENBQUM7SUFFRCxRQUFRO1FBQ04sSUFBSSxDQUFDLDJCQUEyQixFQUFFLENBQUM7UUFDbkMsSUFBSSxDQUFDLDhCQUE4QixFQUFFLENBQUM7SUFDeEMsQ0FBQztJQUVPLDhCQUE4QjtRQUNwQyxJQUFJLElBQUksQ0FBQyxxQkFBcUIsSUFBSSxJQUFJLENBQUMscUJBQXFCLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDcEUsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBVSxFQUFFLEVBQUU7Z0JBQzVELElBQUksQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLEtBQUssS0FBSyxFQUFFLENBQUM7b0JBQzlCLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDaEIsQ0FBQztZQUNILENBQUMsQ0FBQyxDQUFDO1lBQ0gsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsRUFBRTtnQkFDOUQsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNsRCxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7SUFDSCxDQUFDO0lBRU8sMkJBQTJCO1FBQ2pDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxJQUFJLENBQUMsT0FBTyxTQUFTLEtBQUssV0FBVyxJQUFJLFNBQVMsQ0FBQyxFQUFFLENBQUM7WUFDeEUsTUFBTSxLQUFLLENBQUMsa0RBQWtELENBQUMsQ0FBQztRQUNsRSxDQUFDO1FBRUQsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxJQUFJLENBQUMsT0FBTyxTQUFTLEtBQUssV0FBVyxJQUFJLFNBQVMsQ0FBQyxFQUFFLENBQUM7WUFDakYsTUFBTSxLQUFLLENBQUMsdUVBQXVFLENBQUMsQ0FBQztRQUN2RixDQUFDO0lBQ0gsQ0FBQztJQUVELFdBQVc7UUFDVCxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDN0IsQ0FBQzs4R0FsRlUsWUFBWSxrQkFvQ0QsWUFBWSw2QkFHeEIsaUJBQWlCO2tHQXZDaEIsWUFBWTs7MkZBQVosWUFBWTtrQkFMeEIsU0FBUzttQkFBQztvQkFDVCxRQUFRLEVBQUUsZ0JBQWdCO29CQUMxQixRQUFRLEVBQUUsY0FBYztvQkFDeEIsVUFBVSxFQUFFLElBQUk7aUJBQ2pCOzswQkFxQ0ksUUFBUTs7MEJBQUksTUFBTTsyQkFBQyxZQUFZOzswQkFDL0IsUUFBUTs7MEJBQ1IsSUFBSTs7MEJBQ0osTUFBTTsyQkFBQyxpQkFBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtEaXJlY3RpdmUsIEluamVjdCwgT25EZXN0cm95LCBPbkluaXQsIE9wdGlvbmFsLCBTZWxmfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7Q29udHJvbFZhbHVlQWNjZXNzb3IsIE5HX1ZBTFVFX0FDQ0VTU09SfSBmcm9tICdAYW5ndWxhci9mb3Jtcyc7XG5pbXBvcnQge09ic2VydmFibGUsIG9mIGFzIG9ic2VydmFibGVPZiwgU3ViamVjdH0gZnJvbSAncnhqcyc7XG5pbXBvcnQge3N3aXRjaE1hcCwgdGFrZVVudGlsfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbmltcG9ydCB7Q2RrU2VsZWN0aW9ufSBmcm9tICcuL3NlbGVjdGlvbic7XG5cbi8qKlxuICogTWFrZXMgdGhlIGVsZW1lbnQgYSBzZWxlY3QtYWxsIHRvZ2dsZS5cbiAqXG4gKiBNdXN0IGJlIHVzZWQgd2l0aGluIGEgcGFyZW50IGBDZGtTZWxlY3Rpb25gIGRpcmVjdGl2ZS4gSXQgdG9nZ2xlcyB0aGUgc2VsZWN0aW9uIHN0YXRlc1xuICogb2YgYWxsIHRoZSBzZWxlY3Rpb24gdG9nZ2xlcyBjb25uZWN0ZWQgd2l0aCB0aGUgYENka1NlbGVjdGlvbmAgZGlyZWN0aXZlLlxuICogSWYgdGhlIGVsZW1lbnQgaW1wbGVtZW50cyBgQ29udHJvbFZhbHVlQWNjZXNzb3JgLCBlLmcuIGBNYXRDaGVja2JveGAsIHRoZSBkaXJlY3RpdmVcbiAqIGF1dG9tYXRpY2FsbHkgY29ubmVjdHMgaXQgd2l0aCB0aGUgc2VsZWN0LWFsbCBzdGF0ZSBwcm92aWRlZCBieSB0aGUgYENka1NlbGVjdGlvbmAgZGlyZWN0aXZlLiBJZlxuICogbm90LCB1c2UgYGNoZWNrZWQkYCB0byBnZXQgdGhlIGNoZWNrZWQgc3RhdGUsIGBpbmRldGVybWluYXRlJGAgdG8gZ2V0IHRoZSBpbmRldGVybWluYXRlIHN0YXRlLFxuICogYW5kIGB0b2dnbGUoKWAgdG8gY2hhbmdlIHRoZSBzZWxlY3Rpb24gc3RhdGUuXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tjZGtTZWxlY3RBbGxdJyxcbiAgZXhwb3J0QXM6ICdjZGtTZWxlY3RBbGwnLFxuICBzdGFuZGFsb25lOiB0cnVlLFxufSlcbmV4cG9ydCBjbGFzcyBDZGtTZWxlY3RBbGw8VD4gaW1wbGVtZW50cyBPbkRlc3Ryb3ksIE9uSW5pdCB7XG4gIC8qKlxuICAgKiBUaGUgY2hlY2tlZCBzdGF0ZSBvZiB0aGUgdG9nZ2xlLlxuICAgKiBSZXNvbHZlcyB0byBgdHJ1ZWAgaWYgYWxsIHRoZSB2YWx1ZXMgYXJlIHNlbGVjdGVkLCBgZmFsc2VgIGlmIG5vIHZhbHVlIGlzIHNlbGVjdGVkLlxuICAgKi9cbiAgcmVhZG9ubHkgY2hlY2tlZDogT2JzZXJ2YWJsZTxib29sZWFuPjtcblxuICAvKipcbiAgICogVGhlIGluZGV0ZXJtaW5hdGUgc3RhdGUgb2YgdGhlIHRvZ2dsZS5cbiAgICogUmVzb2x2ZXMgdG8gYHRydWVgIGlmIHBhcnQgKG5vdCBhbGwpIG9mIHRoZSB2YWx1ZXMgYXJlIHNlbGVjdGVkLCBgZmFsc2VgIGlmIGFsbCB2YWx1ZXMgb3Igbm9cbiAgICogdmFsdWUgYXQgYWxsIGFyZSBzZWxlY3RlZC5cbiAgICovXG4gIHJlYWRvbmx5IGluZGV0ZXJtaW5hdGU6IE9ic2VydmFibGU8Ym9vbGVhbj47XG5cbiAgLyoqXG4gICAqIFRvZ2dsZXMgdGhlIHNlbGVjdC1hbGwgc3RhdGUuXG4gICAqIEBwYXJhbSBldmVudCBUaGUgY2xpY2sgZXZlbnQgaWYgdGhlIHRvZ2dsZSBpcyB0cmlnZ2VyZWQgYnkgYSAobW91c2Ugb3Iga2V5Ym9hcmQpIGNsaWNrLiBJZlxuICAgKiAgICAgdXNpbmcgd2l0aCBhIG5hdGl2ZSBgPGlucHV0IHR5cGU9XCJjaGVja2JveFwiPmAsIHRoZSBwYXJhbWV0ZXIgaXMgcmVxdWlyZWQgZm9yIHRoZVxuICAgKiAgICAgaW5kZXRlcm1pbmF0ZSBzdGF0ZSB0byB3b3JrIHByb3Blcmx5LlxuICAgKi9cbiAgdG9nZ2xlKGV2ZW50PzogTW91c2VFdmVudCkge1xuICAgIC8vIFRoaXMgaXMgbmVlZGVkIHdoZW4gYXBwbHlpbmcgdGhlIGRpcmVjdGl2ZSBvbiBhIG5hdGl2ZSA8aW5wdXQgdHlwZT1cImNoZWNrYm94XCI+XG4gICAgLy8gY2hlY2tib3guIFRoZSBkZWZhdWx0IGJlaGF2aW9yIG5lZWRzIHRvIGJlIHByZXZlbnRlZCBpbiBvcmRlciB0byBzdXBwb3J0IHRoZSBpbmRldGVybWluYXRlXG4gICAgLy8gc3RhdGUuIFRoZSB0aW1lb3V0IGlzIGFsc28gbmVlZGVkIHNvIHRoZSBjaGVja2JveCBjYW4gc2hvdyB0aGUgbGF0ZXN0IHN0YXRlLlxuICAgIGlmIChldmVudCkge1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICB9XG5cbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHRoaXMuX3NlbGVjdGlvbi50b2dnbGVTZWxlY3RBbGwoKTtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgcmVhZG9ubHkgX2Rlc3Ryb3llZCA9IG5ldyBTdWJqZWN0PHZvaWQ+KCk7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgQE9wdGlvbmFsKCkgQEluamVjdChDZGtTZWxlY3Rpb24pIHByaXZhdGUgcmVhZG9ubHkgX3NlbGVjdGlvbjogQ2RrU2VsZWN0aW9uPFQ+LFxuICAgIEBPcHRpb25hbCgpXG4gICAgQFNlbGYoKVxuICAgIEBJbmplY3QoTkdfVkFMVUVfQUNDRVNTT1IpXG4gICAgcHJpdmF0ZSByZWFkb25seSBfY29udHJvbFZhbHVlQWNjZXNzb3I6IENvbnRyb2xWYWx1ZUFjY2Vzc29yW10sXG4gICkge1xuICAgIHRoaXMuY2hlY2tlZCA9IF9zZWxlY3Rpb24uY2hhbmdlLnBpcGUoXG4gICAgICBzd2l0Y2hNYXAoKCkgPT4gb2JzZXJ2YWJsZU9mKF9zZWxlY3Rpb24uaXNBbGxTZWxlY3RlZCgpKSksXG4gICAgKTtcblxuICAgIHRoaXMuaW5kZXRlcm1pbmF0ZSA9IF9zZWxlY3Rpb24uY2hhbmdlLnBpcGUoXG4gICAgICBzd2l0Y2hNYXAoKCkgPT4gb2JzZXJ2YWJsZU9mKF9zZWxlY3Rpb24uaXNQYXJ0aWFsU2VsZWN0ZWQoKSkpLFxuICAgICk7XG4gIH1cblxuICBuZ09uSW5pdCgpIHtcbiAgICB0aGlzLl9hc3NlcnRWYWxpZFBhcmVudFNlbGVjdGlvbigpO1xuICAgIHRoaXMuX2NvbmZpZ3VyZUNvbnRyb2xWYWx1ZUFjY2Vzc29yKCk7XG4gIH1cblxuICBwcml2YXRlIF9jb25maWd1cmVDb250cm9sVmFsdWVBY2Nlc3NvcigpIHtcbiAgICBpZiAodGhpcy5fY29udHJvbFZhbHVlQWNjZXNzb3IgJiYgdGhpcy5fY29udHJvbFZhbHVlQWNjZXNzb3IubGVuZ3RoKSB7XG4gICAgICB0aGlzLl9jb250cm9sVmFsdWVBY2Nlc3NvclswXS5yZWdpc3Rlck9uQ2hhbmdlKChlOiB1bmtub3duKSA9PiB7XG4gICAgICAgIGlmIChlID09PSB0cnVlIHx8IGUgPT09IGZhbHNlKSB7XG4gICAgICAgICAgdGhpcy50b2dnbGUoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICB0aGlzLmNoZWNrZWQucGlwZSh0YWtlVW50aWwodGhpcy5fZGVzdHJveWVkKSkuc3Vic2NyaWJlKHN0YXRlID0+IHtcbiAgICAgICAgdGhpcy5fY29udHJvbFZhbHVlQWNjZXNzb3JbMF0ud3JpdGVWYWx1ZShzdGF0ZSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9hc3NlcnRWYWxpZFBhcmVudFNlbGVjdGlvbigpIHtcbiAgICBpZiAoIXRoaXMuX3NlbGVjdGlvbiAmJiAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSkge1xuICAgICAgdGhyb3cgRXJyb3IoJ0Nka1NlbGVjdEFsbDogbWlzc2luZyBDZGtTZWxlY3Rpb24gaW4gdGhlIHBhcmVudCcpO1xuICAgIH1cblxuICAgIGlmICghdGhpcy5fc2VsZWN0aW9uLm11bHRpcGxlICYmICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpKSB7XG4gICAgICB0aHJvdyBFcnJvcignQ2RrU2VsZWN0QWxsOiBDZGtTZWxlY3Rpb24gbXVzdCBoYXZlIGNka1NlbGVjdGlvbk11bHRpcGxlIHNldCB0byB0cnVlJyk7XG4gICAgfVxuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgdGhpcy5fZGVzdHJveWVkLm5leHQoKTtcbiAgICB0aGlzLl9kZXN0cm95ZWQuY29tcGxldGUoKTtcbiAgfVxufVxuIl19