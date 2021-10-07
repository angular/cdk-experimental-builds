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
    constructor(_selection, _controlValueAccessor) {
        this._selection = _selection;
        this._controlValueAccessor = _controlValueAccessor;
        /**
         * The checked state of the toggle.
         * Resolves to `true` if all the values are selected, `false` if no value is selected.
         */
        this.checked = this._selection.change.pipe(switchMap(() => observableOf(this._selection.isAllSelected())));
        /**
         * The indeterminate state of the toggle.
         * Resolves to `true` if part (not all) of the values are selected, `false` if all values or no
         * value at all are selected.
         */
        this.indeterminate = this._selection.change.pipe(switchMap(() => observableOf(this._selection.isPartialSelected())));
        this._destroyed = new Subject();
    }
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
            this.checked.pipe(takeUntil(this._destroyed)).subscribe((state) => {
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
}
CdkSelectAll.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.0-next.15", ngImport: i0, type: CdkSelectAll, deps: [{ token: CdkSelection, optional: true }, { token: NG_VALUE_ACCESSOR, optional: true, self: true }], target: i0.ɵɵFactoryTarget.Directive });
CdkSelectAll.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "13.0.0-next.15", type: CdkSelectAll, selector: "[cdkSelectAll]", exportAs: ["cdkSelectAll"], ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.0-next.15", ngImport: i0, type: CdkSelectAll, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkSelectAll]',
                    exportAs: 'cdkSelectAll',
                }]
        }], ctorParameters: function () { return [{ type: i1.CdkSelection, decorators: [{
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
                }] }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VsZWN0LWFsbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL3NlbGVjdGlvbi9zZWxlY3QtYWxsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxTQUFTLEVBQUUsTUFBTSxFQUFxQixRQUFRLEVBQUUsSUFBSSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ25GLE9BQU8sRUFBdUIsaUJBQWlCLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUN2RSxPQUFPLEVBQWEsRUFBRSxJQUFJLFlBQVksRUFBRSxPQUFPLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDN0QsT0FBTyxFQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUVwRCxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sYUFBYSxDQUFDOzs7QUFFekM7Ozs7Ozs7OztHQVNHO0FBS0gsTUFBTSxPQUFPLFlBQVk7SUF1Q3ZCLFlBQ3VELFVBQTJCLEVBQ2QscUJBQ3RDO1FBRnlCLGVBQVUsR0FBVixVQUFVLENBQWlCO1FBQ2QsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUMzRDtRQXpDOUI7OztXQUdHO1FBQ00sWUFBTyxHQUF3QixJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQy9ELFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDLENBQ2pFLENBQUM7UUFFRjs7OztXQUlHO1FBQ00sa0JBQWEsR0FBd0IsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUNyRSxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDLENBQ3JFLENBQUM7UUFxQmUsZUFBVSxHQUFHLElBQUksT0FBTyxFQUFRLENBQUM7SUFLakIsQ0FBQztJQXhCbEM7Ozs7O09BS0c7SUFDSCxNQUFNLENBQUMsS0FBa0I7UUFDdkIsaUZBQWlGO1FBQ2pGLDZGQUE2RjtRQUM3RiwrRUFBK0U7UUFDL0UsSUFBSSxLQUFLLEVBQUU7WUFDVCxLQUFLLENBQUMsY0FBYyxFQUFFLENBQUM7U0FDeEI7UUFFRCxVQUFVLENBQUMsR0FBRyxFQUFFO1lBQ2QsSUFBSSxDQUFDLFVBQVUsQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUNwQyxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFTRCxRQUFRO1FBQ04sSUFBSSxDQUFDLDJCQUEyQixFQUFFLENBQUM7UUFDbkMsSUFBSSxDQUFDLDhCQUE4QixFQUFFLENBQUM7SUFDeEMsQ0FBQztJQUVPLDhCQUE4QjtRQUNwQyxJQUFJLElBQUksQ0FBQyxxQkFBcUIsSUFBSSxJQUFJLENBQUMscUJBQXFCLENBQUMsTUFBTSxFQUFFO1lBQ25FLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQVUsRUFBRSxFQUFFO2dCQUM1RCxJQUFJLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxLQUFLLEtBQUssRUFBRTtvQkFDN0IsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO2lCQUNmO1lBQ0gsQ0FBQyxDQUFDLENBQUM7WUFDSCxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUU7Z0JBQ2hFLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDbEQsQ0FBQyxDQUFDLENBQUM7U0FDSjtJQUNILENBQUM7SUFFTywyQkFBMkI7UUFDakMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLElBQUksQ0FBQyxPQUFPLFNBQVMsS0FBSyxXQUFXLElBQUksU0FBUyxDQUFDLEVBQUU7WUFDdkUsTUFBTSxLQUFLLENBQUMsa0RBQWtELENBQUMsQ0FBQztTQUNqRTtRQUVELElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsSUFBSSxDQUFDLE9BQU8sU0FBUyxLQUFLLFdBQVcsSUFBSSxTQUFTLENBQUMsRUFBRTtZQUNoRixNQUFNLEtBQUssQ0FBQyx1RUFBdUUsQ0FBQyxDQUFDO1NBQ3RGO0lBQ0gsQ0FBQztJQUVELFdBQVc7UUFDVCxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDN0IsQ0FBQzs7aUhBM0VVLFlBQVksa0JBd0NDLFlBQVksNkJBQ0osaUJBQWlCO3FHQXpDdEMsWUFBWTttR0FBWixZQUFZO2tCQUp4QixTQUFTO21CQUFDO29CQUNULFFBQVEsRUFBRSxnQkFBZ0I7b0JBQzFCLFFBQVEsRUFBRSxjQUFjO2lCQUN6Qjs7MEJBeUNNLFFBQVE7OzBCQUFJLE1BQU07MkJBQUMsWUFBWTs7MEJBQy9CLFFBQVE7OzBCQUFJLElBQUk7OzBCQUFJLE1BQU07MkJBQUMsaUJBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RGlyZWN0aXZlLCBJbmplY3QsIE9uRGVzdHJveSwgT25Jbml0LCBPcHRpb25hbCwgU2VsZn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0NvbnRyb2xWYWx1ZUFjY2Vzc29yLCBOR19WQUxVRV9BQ0NFU1NPUn0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xuaW1wb3J0IHtPYnNlcnZhYmxlLCBvZiBhcyBvYnNlcnZhYmxlT2YsIFN1YmplY3R9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHtzd2l0Y2hNYXAsIHRha2VVbnRpbH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuXG5pbXBvcnQge0Nka1NlbGVjdGlvbn0gZnJvbSAnLi9zZWxlY3Rpb24nO1xuXG4vKipcbiAqIE1ha2VzIHRoZSBlbGVtZW50IGEgc2VsZWN0LWFsbCB0b2dnbGUuXG4gKlxuICogTXVzdCBiZSB1c2VkIHdpdGhpbiBhIHBhcmVudCBgQ2RrU2VsZWN0aW9uYCBkaXJlY3RpdmUuIEl0IHRvZ2dsZXMgdGhlIHNlbGVjdGlvbiBzdGF0ZXNcbiAqIG9mIGFsbCB0aGUgc2VsZWN0aW9uIHRvZ2dsZXMgY29ubmVjdGVkIHdpdGggdGhlIGBDZGtTZWxlY3Rpb25gIGRpcmVjdGl2ZS5cbiAqIElmIHRoZSBlbGVtZW50IGltcGxlbWVudHMgYENvbnRyb2xWYWx1ZUFjY2Vzc29yYCwgZS5nLiBgTWF0Q2hlY2tib3hgLCB0aGUgZGlyZWN0aXZlXG4gKiBhdXRvbWF0aWNhbGx5IGNvbm5lY3RzIGl0IHdpdGggdGhlIHNlbGVjdC1hbGwgc3RhdGUgcHJvdmlkZWQgYnkgdGhlIGBDZGtTZWxlY3Rpb25gIGRpcmVjdGl2ZS4gSWZcbiAqIG5vdCwgdXNlIGBjaGVja2VkJGAgdG8gZ2V0IHRoZSBjaGVja2VkIHN0YXRlLCBgaW5kZXRlcm1pbmF0ZSRgIHRvIGdldCB0aGUgaW5kZXRlcm1pbmF0ZSBzdGF0ZSxcbiAqIGFuZCBgdG9nZ2xlKClgIHRvIGNoYW5nZSB0aGUgc2VsZWN0aW9uIHN0YXRlLlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbY2RrU2VsZWN0QWxsXScsXG4gIGV4cG9ydEFzOiAnY2RrU2VsZWN0QWxsJyxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrU2VsZWN0QWxsPFQ+IGltcGxlbWVudHMgT25EZXN0cm95LCBPbkluaXQge1xuICAvKipcbiAgICogVGhlIGNoZWNrZWQgc3RhdGUgb2YgdGhlIHRvZ2dsZS5cbiAgICogUmVzb2x2ZXMgdG8gYHRydWVgIGlmIGFsbCB0aGUgdmFsdWVzIGFyZSBzZWxlY3RlZCwgYGZhbHNlYCBpZiBubyB2YWx1ZSBpcyBzZWxlY3RlZC5cbiAgICovXG4gIHJlYWRvbmx5IGNoZWNrZWQ6IE9ic2VydmFibGU8Ym9vbGVhbj4gPSB0aGlzLl9zZWxlY3Rpb24uY2hhbmdlLnBpcGUoXG4gICAgICBzd2l0Y2hNYXAoKCkgPT4gb2JzZXJ2YWJsZU9mKHRoaXMuX3NlbGVjdGlvbi5pc0FsbFNlbGVjdGVkKCkpKSxcbiAgKTtcblxuICAvKipcbiAgICogVGhlIGluZGV0ZXJtaW5hdGUgc3RhdGUgb2YgdGhlIHRvZ2dsZS5cbiAgICogUmVzb2x2ZXMgdG8gYHRydWVgIGlmIHBhcnQgKG5vdCBhbGwpIG9mIHRoZSB2YWx1ZXMgYXJlIHNlbGVjdGVkLCBgZmFsc2VgIGlmIGFsbCB2YWx1ZXMgb3Igbm9cbiAgICogdmFsdWUgYXQgYWxsIGFyZSBzZWxlY3RlZC5cbiAgICovXG4gIHJlYWRvbmx5IGluZGV0ZXJtaW5hdGU6IE9ic2VydmFibGU8Ym9vbGVhbj4gPSB0aGlzLl9zZWxlY3Rpb24uY2hhbmdlLnBpcGUoXG4gICAgICBzd2l0Y2hNYXAoKCkgPT4gb2JzZXJ2YWJsZU9mKHRoaXMuX3NlbGVjdGlvbi5pc1BhcnRpYWxTZWxlY3RlZCgpKSksXG4gICk7XG5cbiAgLyoqXG4gICAqIFRvZ2dsZXMgdGhlIHNlbGVjdC1hbGwgc3RhdGUuXG4gICAqIEBwYXJhbSBldmVudCBUaGUgY2xpY2sgZXZlbnQgaWYgdGhlIHRvZ2dsZSBpcyB0cmlnZ2VyZWQgYnkgYSAobW91c2Ugb3Iga2V5Ym9hcmQpIGNsaWNrLiBJZlxuICAgKiAgICAgdXNpbmcgd2l0aCBhIG5hdGl2ZSBgPGlucHV0IHR5cGU9XCJjaGVja2JveFwiPmAsIHRoZSBwYXJhbWV0ZXIgaXMgcmVxdWlyZWQgZm9yIHRoZVxuICAgKiAgICAgaW5kZXRlcm1pbmF0ZSBzdGF0ZSB0byB3b3JrIHByb3Blcmx5LlxuICAgKi9cbiAgdG9nZ2xlKGV2ZW50PzogTW91c2VFdmVudCkge1xuICAgIC8vIFRoaXMgaXMgbmVlZGVkIHdoZW4gYXBwbHlpbmcgdGhlIGRpcmVjdGl2ZSBvbiBhIG5hdGl2ZSA8aW5wdXQgdHlwZT1cImNoZWNrYm94XCI+XG4gICAgLy8gY2hlY2tib3guIFRoZSBkZWZhdWx0IGJlaGF2aW9yIG5lZWRzIHRvIGJlIHByZXZlbnRlZCBpbiBvcmRlciB0byBzdXBwb3J0IHRoZSBpbmRldGVybWluYXRlXG4gICAgLy8gc3RhdGUuIFRoZSB0aW1lb3V0IGlzIGFsc28gbmVlZGVkIHNvIHRoZSBjaGVja2JveCBjYW4gc2hvdyB0aGUgbGF0ZXN0IHN0YXRlLlxuICAgIGlmIChldmVudCkge1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICB9XG5cbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHRoaXMuX3NlbGVjdGlvbi50b2dnbGVTZWxlY3RBbGwoKTtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgcmVhZG9ubHkgX2Rlc3Ryb3llZCA9IG5ldyBTdWJqZWN0PHZvaWQ+KCk7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBAT3B0aW9uYWwoKSBASW5qZWN0KENka1NlbGVjdGlvbikgcHJpdmF0ZSByZWFkb25seSBfc2VsZWN0aW9uOiBDZGtTZWxlY3Rpb248VD4sXG4gICAgICBAT3B0aW9uYWwoKSBAU2VsZigpIEBJbmplY3QoTkdfVkFMVUVfQUNDRVNTT1IpIHByaXZhdGUgcmVhZG9ubHkgX2NvbnRyb2xWYWx1ZUFjY2Vzc29yOlxuICAgICAgICAgIENvbnRyb2xWYWx1ZUFjY2Vzc29yW10pIHt9XG5cbiAgbmdPbkluaXQoKSB7XG4gICAgdGhpcy5fYXNzZXJ0VmFsaWRQYXJlbnRTZWxlY3Rpb24oKTtcbiAgICB0aGlzLl9jb25maWd1cmVDb250cm9sVmFsdWVBY2Nlc3NvcigpO1xuICB9XG5cbiAgcHJpdmF0ZSBfY29uZmlndXJlQ29udHJvbFZhbHVlQWNjZXNzb3IoKSB7XG4gICAgaWYgKHRoaXMuX2NvbnRyb2xWYWx1ZUFjY2Vzc29yICYmIHRoaXMuX2NvbnRyb2xWYWx1ZUFjY2Vzc29yLmxlbmd0aCkge1xuICAgICAgdGhpcy5fY29udHJvbFZhbHVlQWNjZXNzb3JbMF0ucmVnaXN0ZXJPbkNoYW5nZSgoZTogdW5rbm93bikgPT4ge1xuICAgICAgICBpZiAoZSA9PT0gdHJ1ZSB8fCBlID09PSBmYWxzZSkge1xuICAgICAgICAgIHRoaXMudG9nZ2xlKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgdGhpcy5jaGVja2VkLnBpcGUodGFrZVVudGlsKHRoaXMuX2Rlc3Ryb3llZCkpLnN1YnNjcmliZSgoc3RhdGUpID0+IHtcbiAgICAgICAgdGhpcy5fY29udHJvbFZhbHVlQWNjZXNzb3JbMF0ud3JpdGVWYWx1ZShzdGF0ZSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9hc3NlcnRWYWxpZFBhcmVudFNlbGVjdGlvbigpIHtcbiAgICBpZiAoIXRoaXMuX3NlbGVjdGlvbiAmJiAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSkge1xuICAgICAgdGhyb3cgRXJyb3IoJ0Nka1NlbGVjdEFsbDogbWlzc2luZyBDZGtTZWxlY3Rpb24gaW4gdGhlIHBhcmVudCcpO1xuICAgIH1cblxuICAgIGlmICghdGhpcy5fc2VsZWN0aW9uLm11bHRpcGxlICYmICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpKSB7XG4gICAgICB0aHJvdyBFcnJvcignQ2RrU2VsZWN0QWxsOiBDZGtTZWxlY3Rpb24gbXVzdCBoYXZlIGNka1NlbGVjdGlvbk11bHRpcGxlIHNldCB0byB0cnVlJyk7XG4gICAgfVxuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgdGhpcy5fZGVzdHJveWVkLm5leHQoKTtcbiAgICB0aGlzLl9kZXN0cm95ZWQuY29tcGxldGUoKTtcbiAgfVxufVxuIl19