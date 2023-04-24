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
class CdkSelectAll {
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.0.0-rc.2", ngImport: i0, type: CdkSelectAll, deps: [{ token: CdkSelection, optional: true }, { token: NG_VALUE_ACCESSOR, optional: true, self: true }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "16.0.0-rc.2", type: CdkSelectAll, selector: "[cdkSelectAll]", exportAs: ["cdkSelectAll"], ngImport: i0 }); }
}
export { CdkSelectAll };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.0.0-rc.2", ngImport: i0, type: CdkSelectAll, decorators: [{
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VsZWN0LWFsbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL3NlbGVjdGlvbi9zZWxlY3QtYWxsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxTQUFTLEVBQUUsTUFBTSxFQUFxQixRQUFRLEVBQUUsSUFBSSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ25GLE9BQU8sRUFBdUIsaUJBQWlCLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUN2RSxPQUFPLEVBQWEsRUFBRSxJQUFJLFlBQVksRUFBRSxPQUFPLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDN0QsT0FBTyxFQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUVwRCxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sYUFBYSxDQUFDOzs7QUFFekM7Ozs7Ozs7OztHQVNHO0FBQ0gsTUFJYSxZQUFZO0lBY3ZCOzs7OztPQUtHO0lBQ0gsTUFBTSxDQUFDLEtBQWtCO1FBQ3ZCLGlGQUFpRjtRQUNqRiw2RkFBNkY7UUFDN0YsK0VBQStFO1FBQy9FLElBQUksS0FBSyxFQUFFO1lBQ1QsS0FBSyxDQUFDLGNBQWMsRUFBRSxDQUFDO1NBQ3hCO1FBRUQsVUFBVSxDQUFDLEdBQUcsRUFBRTtZQUNkLElBQUksQ0FBQyxVQUFVLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDcEMsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBSUQsWUFDcUQsVUFBMkIsRUFJN0QscUJBQTZDO1FBSlgsZUFBVSxHQUFWLFVBQVUsQ0FBaUI7UUFJN0QsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF3QjtRQVAvQyxlQUFVLEdBQUcsSUFBSSxPQUFPLEVBQVEsQ0FBQztRQVNoRCxJQUFJLENBQUMsT0FBTyxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUNuQyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDLENBQzFELENBQUM7UUFFRixJQUFJLENBQUMsYUFBYSxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUN6QyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLENBQUMsQ0FDOUQsQ0FBQztJQUNKLENBQUM7SUFFRCxRQUFRO1FBQ04sSUFBSSxDQUFDLDJCQUEyQixFQUFFLENBQUM7UUFDbkMsSUFBSSxDQUFDLDhCQUE4QixFQUFFLENBQUM7SUFDeEMsQ0FBQztJQUVPLDhCQUE4QjtRQUNwQyxJQUFJLElBQUksQ0FBQyxxQkFBcUIsSUFBSSxJQUFJLENBQUMscUJBQXFCLENBQUMsTUFBTSxFQUFFO1lBQ25FLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQVUsRUFBRSxFQUFFO2dCQUM1RCxJQUFJLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxLQUFLLEtBQUssRUFBRTtvQkFDN0IsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO2lCQUNmO1lBQ0gsQ0FBQyxDQUFDLENBQUM7WUFDSCxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUM5RCxJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ2xELENBQUMsQ0FBQyxDQUFDO1NBQ0o7SUFDSCxDQUFDO0lBRU8sMkJBQTJCO1FBQ2pDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxJQUFJLENBQUMsT0FBTyxTQUFTLEtBQUssV0FBVyxJQUFJLFNBQVMsQ0FBQyxFQUFFO1lBQ3ZFLE1BQU0sS0FBSyxDQUFDLGtEQUFrRCxDQUFDLENBQUM7U0FDakU7UUFFRCxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLElBQUksQ0FBQyxPQUFPLFNBQVMsS0FBSyxXQUFXLElBQUksU0FBUyxDQUFDLEVBQUU7WUFDaEYsTUFBTSxLQUFLLENBQUMsdUVBQXVFLENBQUMsQ0FBQztTQUN0RjtJQUNILENBQUM7SUFFRCxXQUFXO1FBQ1QsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUN2QixJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQzdCLENBQUM7bUhBbEZVLFlBQVksa0JBb0NELFlBQVksNkJBR3hCLGlCQUFpQjt1R0F2Q2hCLFlBQVk7O1NBQVosWUFBWTtnR0FBWixZQUFZO2tCQUp4QixTQUFTO21CQUFDO29CQUNULFFBQVEsRUFBRSxnQkFBZ0I7b0JBQzFCLFFBQVEsRUFBRSxjQUFjO2lCQUN6Qjs7MEJBcUNJLFFBQVE7OzBCQUFJLE1BQU07MkJBQUMsWUFBWTs7MEJBQy9CLFFBQVE7OzBCQUNSLElBQUk7OzBCQUNKLE1BQU07MkJBQUMsaUJBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RGlyZWN0aXZlLCBJbmplY3QsIE9uRGVzdHJveSwgT25Jbml0LCBPcHRpb25hbCwgU2VsZn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0NvbnRyb2xWYWx1ZUFjY2Vzc29yLCBOR19WQUxVRV9BQ0NFU1NPUn0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xuaW1wb3J0IHtPYnNlcnZhYmxlLCBvZiBhcyBvYnNlcnZhYmxlT2YsIFN1YmplY3R9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHtzd2l0Y2hNYXAsIHRha2VVbnRpbH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuXG5pbXBvcnQge0Nka1NlbGVjdGlvbn0gZnJvbSAnLi9zZWxlY3Rpb24nO1xuXG4vKipcbiAqIE1ha2VzIHRoZSBlbGVtZW50IGEgc2VsZWN0LWFsbCB0b2dnbGUuXG4gKlxuICogTXVzdCBiZSB1c2VkIHdpdGhpbiBhIHBhcmVudCBgQ2RrU2VsZWN0aW9uYCBkaXJlY3RpdmUuIEl0IHRvZ2dsZXMgdGhlIHNlbGVjdGlvbiBzdGF0ZXNcbiAqIG9mIGFsbCB0aGUgc2VsZWN0aW9uIHRvZ2dsZXMgY29ubmVjdGVkIHdpdGggdGhlIGBDZGtTZWxlY3Rpb25gIGRpcmVjdGl2ZS5cbiAqIElmIHRoZSBlbGVtZW50IGltcGxlbWVudHMgYENvbnRyb2xWYWx1ZUFjY2Vzc29yYCwgZS5nLiBgTWF0Q2hlY2tib3hgLCB0aGUgZGlyZWN0aXZlXG4gKiBhdXRvbWF0aWNhbGx5IGNvbm5lY3RzIGl0IHdpdGggdGhlIHNlbGVjdC1hbGwgc3RhdGUgcHJvdmlkZWQgYnkgdGhlIGBDZGtTZWxlY3Rpb25gIGRpcmVjdGl2ZS4gSWZcbiAqIG5vdCwgdXNlIGBjaGVja2VkJGAgdG8gZ2V0IHRoZSBjaGVja2VkIHN0YXRlLCBgaW5kZXRlcm1pbmF0ZSRgIHRvIGdldCB0aGUgaW5kZXRlcm1pbmF0ZSBzdGF0ZSxcbiAqIGFuZCBgdG9nZ2xlKClgIHRvIGNoYW5nZSB0aGUgc2VsZWN0aW9uIHN0YXRlLlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbY2RrU2VsZWN0QWxsXScsXG4gIGV4cG9ydEFzOiAnY2RrU2VsZWN0QWxsJyxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrU2VsZWN0QWxsPFQ+IGltcGxlbWVudHMgT25EZXN0cm95LCBPbkluaXQge1xuICAvKipcbiAgICogVGhlIGNoZWNrZWQgc3RhdGUgb2YgdGhlIHRvZ2dsZS5cbiAgICogUmVzb2x2ZXMgdG8gYHRydWVgIGlmIGFsbCB0aGUgdmFsdWVzIGFyZSBzZWxlY3RlZCwgYGZhbHNlYCBpZiBubyB2YWx1ZSBpcyBzZWxlY3RlZC5cbiAgICovXG4gIHJlYWRvbmx5IGNoZWNrZWQ6IE9ic2VydmFibGU8Ym9vbGVhbj47XG5cbiAgLyoqXG4gICAqIFRoZSBpbmRldGVybWluYXRlIHN0YXRlIG9mIHRoZSB0b2dnbGUuXG4gICAqIFJlc29sdmVzIHRvIGB0cnVlYCBpZiBwYXJ0IChub3QgYWxsKSBvZiB0aGUgdmFsdWVzIGFyZSBzZWxlY3RlZCwgYGZhbHNlYCBpZiBhbGwgdmFsdWVzIG9yIG5vXG4gICAqIHZhbHVlIGF0IGFsbCBhcmUgc2VsZWN0ZWQuXG4gICAqL1xuICByZWFkb25seSBpbmRldGVybWluYXRlOiBPYnNlcnZhYmxlPGJvb2xlYW4+O1xuXG4gIC8qKlxuICAgKiBUb2dnbGVzIHRoZSBzZWxlY3QtYWxsIHN0YXRlLlxuICAgKiBAcGFyYW0gZXZlbnQgVGhlIGNsaWNrIGV2ZW50IGlmIHRoZSB0b2dnbGUgaXMgdHJpZ2dlcmVkIGJ5IGEgKG1vdXNlIG9yIGtleWJvYXJkKSBjbGljay4gSWZcbiAgICogICAgIHVzaW5nIHdpdGggYSBuYXRpdmUgYDxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIj5gLCB0aGUgcGFyYW1ldGVyIGlzIHJlcXVpcmVkIGZvciB0aGVcbiAgICogICAgIGluZGV0ZXJtaW5hdGUgc3RhdGUgdG8gd29yayBwcm9wZXJseS5cbiAgICovXG4gIHRvZ2dsZShldmVudD86IE1vdXNlRXZlbnQpIHtcbiAgICAvLyBUaGlzIGlzIG5lZWRlZCB3aGVuIGFwcGx5aW5nIHRoZSBkaXJlY3RpdmUgb24gYSBuYXRpdmUgPGlucHV0IHR5cGU9XCJjaGVja2JveFwiPlxuICAgIC8vIGNoZWNrYm94LiBUaGUgZGVmYXVsdCBiZWhhdmlvciBuZWVkcyB0byBiZSBwcmV2ZW50ZWQgaW4gb3JkZXIgdG8gc3VwcG9ydCB0aGUgaW5kZXRlcm1pbmF0ZVxuICAgIC8vIHN0YXRlLiBUaGUgdGltZW91dCBpcyBhbHNvIG5lZWRlZCBzbyB0aGUgY2hlY2tib3ggY2FuIHNob3cgdGhlIGxhdGVzdCBzdGF0ZS5cbiAgICBpZiAoZXZlbnQpIHtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgfVxuXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICB0aGlzLl9zZWxlY3Rpb24udG9nZ2xlU2VsZWN0QWxsKCk7XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIHJlYWRvbmx5IF9kZXN0cm95ZWQgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIEBPcHRpb25hbCgpIEBJbmplY3QoQ2RrU2VsZWN0aW9uKSBwcml2YXRlIHJlYWRvbmx5IF9zZWxlY3Rpb246IENka1NlbGVjdGlvbjxUPixcbiAgICBAT3B0aW9uYWwoKVxuICAgIEBTZWxmKClcbiAgICBASW5qZWN0KE5HX1ZBTFVFX0FDQ0VTU09SKVxuICAgIHByaXZhdGUgcmVhZG9ubHkgX2NvbnRyb2xWYWx1ZUFjY2Vzc29yOiBDb250cm9sVmFsdWVBY2Nlc3NvcltdLFxuICApIHtcbiAgICB0aGlzLmNoZWNrZWQgPSBfc2VsZWN0aW9uLmNoYW5nZS5waXBlKFxuICAgICAgc3dpdGNoTWFwKCgpID0+IG9ic2VydmFibGVPZihfc2VsZWN0aW9uLmlzQWxsU2VsZWN0ZWQoKSkpLFxuICAgICk7XG5cbiAgICB0aGlzLmluZGV0ZXJtaW5hdGUgPSBfc2VsZWN0aW9uLmNoYW5nZS5waXBlKFxuICAgICAgc3dpdGNoTWFwKCgpID0+IG9ic2VydmFibGVPZihfc2VsZWN0aW9uLmlzUGFydGlhbFNlbGVjdGVkKCkpKSxcbiAgICApO1xuICB9XG5cbiAgbmdPbkluaXQoKSB7XG4gICAgdGhpcy5fYXNzZXJ0VmFsaWRQYXJlbnRTZWxlY3Rpb24oKTtcbiAgICB0aGlzLl9jb25maWd1cmVDb250cm9sVmFsdWVBY2Nlc3NvcigpO1xuICB9XG5cbiAgcHJpdmF0ZSBfY29uZmlndXJlQ29udHJvbFZhbHVlQWNjZXNzb3IoKSB7XG4gICAgaWYgKHRoaXMuX2NvbnRyb2xWYWx1ZUFjY2Vzc29yICYmIHRoaXMuX2NvbnRyb2xWYWx1ZUFjY2Vzc29yLmxlbmd0aCkge1xuICAgICAgdGhpcy5fY29udHJvbFZhbHVlQWNjZXNzb3JbMF0ucmVnaXN0ZXJPbkNoYW5nZSgoZTogdW5rbm93bikgPT4ge1xuICAgICAgICBpZiAoZSA9PT0gdHJ1ZSB8fCBlID09PSBmYWxzZSkge1xuICAgICAgICAgIHRoaXMudG9nZ2xlKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgdGhpcy5jaGVja2VkLnBpcGUodGFrZVVudGlsKHRoaXMuX2Rlc3Ryb3llZCkpLnN1YnNjcmliZShzdGF0ZSA9PiB7XG4gICAgICAgIHRoaXMuX2NvbnRyb2xWYWx1ZUFjY2Vzc29yWzBdLndyaXRlVmFsdWUoc3RhdGUpO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfYXNzZXJ0VmFsaWRQYXJlbnRTZWxlY3Rpb24oKSB7XG4gICAgaWYgKCF0aGlzLl9zZWxlY3Rpb24gJiYgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkpIHtcbiAgICAgIHRocm93IEVycm9yKCdDZGtTZWxlY3RBbGw6IG1pc3NpbmcgQ2RrU2VsZWN0aW9uIGluIHRoZSBwYXJlbnQnKTtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMuX3NlbGVjdGlvbi5tdWx0aXBsZSAmJiAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSkge1xuICAgICAgdGhyb3cgRXJyb3IoJ0Nka1NlbGVjdEFsbDogQ2RrU2VsZWN0aW9uIG11c3QgaGF2ZSBjZGtTZWxlY3Rpb25NdWx0aXBsZSBzZXQgdG8gdHJ1ZScpO1xuICAgIH1cbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIHRoaXMuX2Rlc3Ryb3llZC5uZXh0KCk7XG4gICAgdGhpcy5fZGVzdHJveWVkLmNvbXBsZXRlKCk7XG4gIH1cbn1cbiJdfQ==