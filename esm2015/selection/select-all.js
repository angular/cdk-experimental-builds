/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, Inject, isDevMode, Optional, Self } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { of as observableOf, Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { CdkSelection } from './selection';
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
        if (!this._selection && isDevMode()) {
            throw Error('CdkSelectAll: missing CdkSelection in the parent');
        }
        if (!this._selection.multiple && isDevMode()) {
            throw Error('CdkSelectAll: CdkSelection must have cdkSelectionMultiple set to true');
        }
    }
    ngOnDestroy() {
        this._destroyed.next();
        this._destroyed.complete();
    }
}
CdkSelectAll.decorators = [
    { type: Directive, args: [{
                selector: '[cdkSelectAll]',
                exportAs: 'cdkSelectAll',
            },] }
];
CdkSelectAll.ctorParameters = () => [
    { type: CdkSelection, decorators: [{ type: Optional }, { type: Inject, args: [CdkSelection,] }] },
    { type: Array, decorators: [{ type: Optional }, { type: Self }, { type: Inject, args: [NG_VALUE_ACCESSOR,] }] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VsZWN0LWFsbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL3NlbGVjdGlvbi9zZWxlY3QtYWxsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxTQUFTLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBcUIsUUFBUSxFQUFFLElBQUksRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUM5RixPQUFPLEVBQXVCLGlCQUFpQixFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDdkUsT0FBTyxFQUFhLEVBQUUsSUFBSSxZQUFZLEVBQUUsT0FBTyxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQzdELE9BQU8sRUFBQyxTQUFTLEVBQUUsU0FBUyxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFFcEQsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGFBQWEsQ0FBQztBQUV6Qzs7Ozs7Ozs7O0dBU0c7QUFLSCxNQUFNLE9BQU8sWUFBWTtJQXVDdkIsWUFDdUQsVUFBMkIsRUFDZCxxQkFDdEM7UUFGeUIsZUFBVSxHQUFWLFVBQVUsQ0FBaUI7UUFDZCwwQkFBcUIsR0FBckIscUJBQXFCLENBQzNEO1FBekM5Qjs7O1dBR0c7UUFDTSxZQUFPLEdBQXdCLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLElBQUksQ0FDL0QsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUMsQ0FDakUsQ0FBQztRQUVGOzs7O1dBSUc7UUFDTSxrQkFBYSxHQUF3QixJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQ3JFLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLENBQUMsQ0FDckUsQ0FBQztRQXFCZSxlQUFVLEdBQUcsSUFBSSxPQUFPLEVBQVEsQ0FBQztJQUtqQixDQUFDO0lBeEJsQzs7Ozs7T0FLRztJQUNILE1BQU0sQ0FBQyxLQUFrQjtRQUN2QixpRkFBaUY7UUFDakYsNkZBQTZGO1FBQzdGLCtFQUErRTtRQUMvRSxJQUFJLEtBQUssRUFBRTtZQUNULEtBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQztTQUN4QjtRQUVELFVBQVUsQ0FBQyxHQUFHLEVBQUU7WUFDZCxJQUFJLENBQUMsVUFBVSxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQ3BDLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQVNELFFBQVE7UUFDTixJQUFJLENBQUMsMkJBQTJCLEVBQUUsQ0FBQztRQUNuQyxJQUFJLENBQUMsOEJBQThCLEVBQUUsQ0FBQztJQUN4QyxDQUFDO0lBRU8sOEJBQThCO1FBQ3BDLElBQUksSUFBSSxDQUFDLHFCQUFxQixJQUFJLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxNQUFNLEVBQUU7WUFDbkUsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBVSxFQUFFLEVBQUU7Z0JBQzVELElBQUksQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLEtBQUssS0FBSyxFQUFFO29CQUM3QixJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7aUJBQ2Y7WUFDSCxDQUFDLENBQUMsQ0FBQztZQUNILElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRTtnQkFDaEUsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNsRCxDQUFDLENBQUMsQ0FBQztTQUNKO0lBQ0gsQ0FBQztJQUVPLDJCQUEyQjtRQUNqQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsSUFBSSxTQUFTLEVBQUUsRUFBRTtZQUNuQyxNQUFNLEtBQUssQ0FBQyxrREFBa0QsQ0FBQyxDQUFDO1NBQ2pFO1FBRUQsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxJQUFJLFNBQVMsRUFBRSxFQUFFO1lBQzVDLE1BQU0sS0FBSyxDQUFDLHVFQUF1RSxDQUFDLENBQUM7U0FDdEY7SUFDSCxDQUFDO0lBRUQsV0FBVztRQUNULElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDdkIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUM3QixDQUFDOzs7WUEvRUYsU0FBUyxTQUFDO2dCQUNULFFBQVEsRUFBRSxnQkFBZ0I7Z0JBQzFCLFFBQVEsRUFBRSxjQUFjO2FBQ3pCOzs7WUFmTyxZQUFZLHVCQXdEYixRQUFRLFlBQUksTUFBTSxTQUFDLFlBQVk7d0NBQy9CLFFBQVEsWUFBSSxJQUFJLFlBQUksTUFBTSxTQUFDLGlCQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0RpcmVjdGl2ZSwgSW5qZWN0LCBpc0Rldk1vZGUsIE9uRGVzdHJveSwgT25Jbml0LCBPcHRpb25hbCwgU2VsZn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0NvbnRyb2xWYWx1ZUFjY2Vzc29yLCBOR19WQUxVRV9BQ0NFU1NPUn0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xuaW1wb3J0IHtPYnNlcnZhYmxlLCBvZiBhcyBvYnNlcnZhYmxlT2YsIFN1YmplY3R9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHtzd2l0Y2hNYXAsIHRha2VVbnRpbH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuXG5pbXBvcnQge0Nka1NlbGVjdGlvbn0gZnJvbSAnLi9zZWxlY3Rpb24nO1xuXG4vKipcbiAqIE1ha2VzIHRoZSBlbGVtZW50IGEgc2VsZWN0LWFsbCB0b2dnbGUuXG4gKlxuICogTXVzdCBiZSB1c2VkIHdpdGhpbiBhIHBhcmVudCBgQ2RrU2VsZWN0aW9uYCBkaXJlY3RpdmUuIEl0IHRvZ2dsZXMgdGhlIHNlbGVjdGlvbiBzdGF0ZXNcbiAqIG9mIGFsbCB0aGUgc2VsZWN0aW9uIHRvZ2dsZXMgY29ubmVjdGVkIHdpdGggdGhlIGBDZGtTZWxlY3Rpb25gIGRpcmVjdGl2ZS5cbiAqIElmIHRoZSBlbGVtZW50IGltcGxlbWVudHMgYENvbnRyb2xWYWx1ZUFjY2Vzc29yYCwgZS5nLiBgTWF0Q2hlY2tib3hgLCB0aGUgZGlyZWN0aXZlXG4gKiBhdXRvbWF0aWNhbGx5IGNvbm5lY3RzIGl0IHdpdGggdGhlIHNlbGVjdC1hbGwgc3RhdGUgcHJvdmlkZWQgYnkgdGhlIGBDZGtTZWxlY3Rpb25gIGRpcmVjdGl2ZS4gSWZcbiAqIG5vdCwgdXNlIGBjaGVja2VkJGAgdG8gZ2V0IHRoZSBjaGVja2VkIHN0YXRlLCBgaW5kZXRlcm1pbmF0ZSRgIHRvIGdldCB0aGUgaW5kZXRlcm1pbmF0ZSBzdGF0ZSxcbiAqIGFuZCBgdG9nZ2xlKClgIHRvIGNoYW5nZSB0aGUgc2VsZWN0aW9uIHN0YXRlLlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbY2RrU2VsZWN0QWxsXScsXG4gIGV4cG9ydEFzOiAnY2RrU2VsZWN0QWxsJyxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrU2VsZWN0QWxsPFQ+IGltcGxlbWVudHMgT25EZXN0cm95LCBPbkluaXQge1xuICAvKipcbiAgICogVGhlIGNoZWNrZWQgc3RhdGUgb2YgdGhlIHRvZ2dsZS5cbiAgICogUmVzb2x2ZXMgdG8gYHRydWVgIGlmIGFsbCB0aGUgdmFsdWVzIGFyZSBzZWxlY3RlZCwgYGZhbHNlYCBpZiBubyB2YWx1ZSBpcyBzZWxlY3RlZC5cbiAgICovXG4gIHJlYWRvbmx5IGNoZWNrZWQ6IE9ic2VydmFibGU8Ym9vbGVhbj4gPSB0aGlzLl9zZWxlY3Rpb24uY2hhbmdlLnBpcGUoXG4gICAgICBzd2l0Y2hNYXAoKCkgPT4gb2JzZXJ2YWJsZU9mKHRoaXMuX3NlbGVjdGlvbi5pc0FsbFNlbGVjdGVkKCkpKSxcbiAgKTtcblxuICAvKipcbiAgICogVGhlIGluZGV0ZXJtaW5hdGUgc3RhdGUgb2YgdGhlIHRvZ2dsZS5cbiAgICogUmVzb2x2ZXMgdG8gYHRydWVgIGlmIHBhcnQgKG5vdCBhbGwpIG9mIHRoZSB2YWx1ZXMgYXJlIHNlbGVjdGVkLCBgZmFsc2VgIGlmIGFsbCB2YWx1ZXMgb3Igbm9cbiAgICogdmFsdWUgYXQgYWxsIGFyZSBzZWxlY3RlZC5cbiAgICovXG4gIHJlYWRvbmx5IGluZGV0ZXJtaW5hdGU6IE9ic2VydmFibGU8Ym9vbGVhbj4gPSB0aGlzLl9zZWxlY3Rpb24uY2hhbmdlLnBpcGUoXG4gICAgICBzd2l0Y2hNYXAoKCkgPT4gb2JzZXJ2YWJsZU9mKHRoaXMuX3NlbGVjdGlvbi5pc1BhcnRpYWxTZWxlY3RlZCgpKSksXG4gICk7XG5cbiAgLyoqXG4gICAqIFRvZ2dsZXMgdGhlIHNlbGVjdC1hbGwgc3RhdGUuXG4gICAqIEBwYXJhbSBldmVudCBUaGUgY2xpY2sgZXZlbnQgaWYgdGhlIHRvZ2dsZSBpcyB0cmlnZ2VyZWQgYnkgYSAobW91c2Ugb3Iga2V5Ym9hcmQpIGNsaWNrLiBJZlxuICAgKiAgICAgdXNpbmcgd2l0aCBhIG5hdGl2ZSBgPGlucHV0IHR5cGU9XCJjaGVja2JveFwiPmAsIHRoZSBwYXJhbWV0ZXIgaXMgcmVxdWlyZWQgZm9yIHRoZVxuICAgKiAgICAgaW5kZXRlcm1pbmF0ZSBzdGF0ZSB0byB3b3JrIHByb3Blcmx5LlxuICAgKi9cbiAgdG9nZ2xlKGV2ZW50PzogTW91c2VFdmVudCkge1xuICAgIC8vIFRoaXMgaXMgbmVlZGVkIHdoZW4gYXBwbHlpbmcgdGhlIGRpcmVjdGl2ZSBvbiBhIG5hdGl2ZSA8aW5wdXQgdHlwZT1cImNoZWNrYm94XCI+XG4gICAgLy8gY2hlY2tib3guIFRoZSBkZWZhdWx0IGJlaGF2aW9yIG5lZWRzIHRvIGJlIHByZXZlbnRlZCBpbiBvcmRlciB0byBzdXBwb3J0IHRoZSBpbmRldGVybWluYXRlXG4gICAgLy8gc3RhdGUuIFRoZSB0aW1lb3V0IGlzIGFsc28gbmVlZGVkIHNvIHRoZSBjaGVja2JveCBjYW4gc2hvdyB0aGUgbGF0ZXN0IHN0YXRlLlxuICAgIGlmIChldmVudCkge1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICB9XG5cbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHRoaXMuX3NlbGVjdGlvbi50b2dnbGVTZWxlY3RBbGwoKTtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgcmVhZG9ubHkgX2Rlc3Ryb3llZCA9IG5ldyBTdWJqZWN0PHZvaWQ+KCk7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBAT3B0aW9uYWwoKSBASW5qZWN0KENka1NlbGVjdGlvbikgcHJpdmF0ZSByZWFkb25seSBfc2VsZWN0aW9uOiBDZGtTZWxlY3Rpb248VD4sXG4gICAgICBAT3B0aW9uYWwoKSBAU2VsZigpIEBJbmplY3QoTkdfVkFMVUVfQUNDRVNTT1IpIHByaXZhdGUgcmVhZG9ubHkgX2NvbnRyb2xWYWx1ZUFjY2Vzc29yOlxuICAgICAgICAgIENvbnRyb2xWYWx1ZUFjY2Vzc29yW10pIHt9XG5cbiAgbmdPbkluaXQoKSB7XG4gICAgdGhpcy5fYXNzZXJ0VmFsaWRQYXJlbnRTZWxlY3Rpb24oKTtcbiAgICB0aGlzLl9jb25maWd1cmVDb250cm9sVmFsdWVBY2Nlc3NvcigpO1xuICB9XG5cbiAgcHJpdmF0ZSBfY29uZmlndXJlQ29udHJvbFZhbHVlQWNjZXNzb3IoKSB7XG4gICAgaWYgKHRoaXMuX2NvbnRyb2xWYWx1ZUFjY2Vzc29yICYmIHRoaXMuX2NvbnRyb2xWYWx1ZUFjY2Vzc29yLmxlbmd0aCkge1xuICAgICAgdGhpcy5fY29udHJvbFZhbHVlQWNjZXNzb3JbMF0ucmVnaXN0ZXJPbkNoYW5nZSgoZTogdW5rbm93bikgPT4ge1xuICAgICAgICBpZiAoZSA9PT0gdHJ1ZSB8fCBlID09PSBmYWxzZSkge1xuICAgICAgICAgIHRoaXMudG9nZ2xlKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgdGhpcy5jaGVja2VkLnBpcGUodGFrZVVudGlsKHRoaXMuX2Rlc3Ryb3llZCkpLnN1YnNjcmliZSgoc3RhdGUpID0+IHtcbiAgICAgICAgdGhpcy5fY29udHJvbFZhbHVlQWNjZXNzb3JbMF0ud3JpdGVWYWx1ZShzdGF0ZSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9hc3NlcnRWYWxpZFBhcmVudFNlbGVjdGlvbigpIHtcbiAgICBpZiAoIXRoaXMuX3NlbGVjdGlvbiAmJiBpc0Rldk1vZGUoKSkge1xuICAgICAgdGhyb3cgRXJyb3IoJ0Nka1NlbGVjdEFsbDogbWlzc2luZyBDZGtTZWxlY3Rpb24gaW4gdGhlIHBhcmVudCcpO1xuICAgIH1cblxuICAgIGlmICghdGhpcy5fc2VsZWN0aW9uLm11bHRpcGxlICYmIGlzRGV2TW9kZSgpKSB7XG4gICAgICB0aHJvdyBFcnJvcignQ2RrU2VsZWN0QWxsOiBDZGtTZWxlY3Rpb24gbXVzdCBoYXZlIGNka1NlbGVjdGlvbk11bHRpcGxlIHNldCB0byB0cnVlJyk7XG4gICAgfVxuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgdGhpcy5fZGVzdHJveWVkLm5leHQoKTtcbiAgICB0aGlzLl9kZXN0cm95ZWQuY29tcGxldGUoKTtcbiAgfVxufVxuIl19