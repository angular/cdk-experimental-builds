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
}
CdkSelectAll.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.0.0-next.2", ngImport: i0, type: CdkSelectAll, deps: [{ token: CdkSelection, optional: true }, { token: NG_VALUE_ACCESSOR, optional: true, self: true }], target: i0.ɵɵFactoryTarget.Directive });
CdkSelectAll.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "16.0.0-next.2", type: CdkSelectAll, selector: "[cdkSelectAll]", exportAs: ["cdkSelectAll"], ngImport: i0 });
export { CdkSelectAll };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.0.0-next.2", ngImport: i0, type: CdkSelectAll, decorators: [{
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VsZWN0LWFsbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL3NlbGVjdGlvbi9zZWxlY3QtYWxsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxTQUFTLEVBQUUsTUFBTSxFQUFxQixRQUFRLEVBQUUsSUFBSSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ25GLE9BQU8sRUFBdUIsaUJBQWlCLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUN2RSxPQUFPLEVBQWEsRUFBRSxJQUFJLFlBQVksRUFBRSxPQUFPLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDN0QsT0FBTyxFQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUVwRCxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sYUFBYSxDQUFDOzs7QUFFekM7Ozs7Ozs7OztHQVNHO0FBQ0gsTUFJYSxZQUFZO0lBa0J2Qjs7Ozs7T0FLRztJQUNILE1BQU0sQ0FBQyxLQUFrQjtRQUN2QixpRkFBaUY7UUFDakYsNkZBQTZGO1FBQzdGLCtFQUErRTtRQUMvRSxJQUFJLEtBQUssRUFBRTtZQUNULEtBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQztTQUN4QjtRQUVELFVBQVUsQ0FBQyxHQUFHLEVBQUU7WUFDZCxJQUFJLENBQUMsVUFBVSxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQ3BDLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUlELFlBQ3FELFVBQTJCLEVBSTdELHFCQUE2QztRQUpYLGVBQVUsR0FBVixVQUFVLENBQWlCO1FBSTdELDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBd0I7UUEzQ2hFOzs7V0FHRztRQUNNLFlBQU8sR0FBd0IsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUNqRSxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQyxDQUMvRCxDQUFDO1FBRUY7Ozs7V0FJRztRQUNNLGtCQUFhLEdBQXdCLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLElBQUksQ0FDdkUsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLGlCQUFpQixFQUFFLENBQUMsQ0FBQyxDQUNuRSxDQUFDO1FBcUJlLGVBQVUsR0FBRyxJQUFJLE9BQU8sRUFBUSxDQUFDO0lBUS9DLENBQUM7SUFFSixRQUFRO1FBQ04sSUFBSSxDQUFDLDJCQUEyQixFQUFFLENBQUM7UUFDbkMsSUFBSSxDQUFDLDhCQUE4QixFQUFFLENBQUM7SUFDeEMsQ0FBQztJQUVPLDhCQUE4QjtRQUNwQyxJQUFJLElBQUksQ0FBQyxxQkFBcUIsSUFBSSxJQUFJLENBQUMscUJBQXFCLENBQUMsTUFBTSxFQUFFO1lBQ25FLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQVUsRUFBRSxFQUFFO2dCQUM1RCxJQUFJLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxLQUFLLEtBQUssRUFBRTtvQkFDN0IsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO2lCQUNmO1lBQ0gsQ0FBQyxDQUFDLENBQUM7WUFDSCxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUM5RCxJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ2xELENBQUMsQ0FBQyxDQUFDO1NBQ0o7SUFDSCxDQUFDO0lBRU8sMkJBQTJCO1FBQ2pDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxJQUFJLENBQUMsT0FBTyxTQUFTLEtBQUssV0FBVyxJQUFJLFNBQVMsQ0FBQyxFQUFFO1lBQ3ZFLE1BQU0sS0FBSyxDQUFDLGtEQUFrRCxDQUFDLENBQUM7U0FDakU7UUFFRCxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLElBQUksQ0FBQyxPQUFPLFNBQVMsS0FBSyxXQUFXLElBQUksU0FBUyxDQUFDLEVBQUU7WUFDaEYsTUFBTSxLQUFLLENBQUMsdUVBQXVFLENBQUMsQ0FBQztTQUN0RjtJQUNILENBQUM7SUFFRCxXQUFXO1FBQ1QsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUN2QixJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQzdCLENBQUM7O2dIQTlFVSxZQUFZLGtCQXdDRCxZQUFZLDZCQUd4QixpQkFBaUI7b0dBM0NoQixZQUFZO1NBQVosWUFBWTtrR0FBWixZQUFZO2tCQUp4QixTQUFTO21CQUFDO29CQUNULFFBQVEsRUFBRSxnQkFBZ0I7b0JBQzFCLFFBQVEsRUFBRSxjQUFjO2lCQUN6Qjs7MEJBeUNJLFFBQVE7OzBCQUFJLE1BQU07MkJBQUMsWUFBWTs7MEJBQy9CLFFBQVE7OzBCQUNSLElBQUk7OzBCQUNKLE1BQU07MkJBQUMsaUJBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RGlyZWN0aXZlLCBJbmplY3QsIE9uRGVzdHJveSwgT25Jbml0LCBPcHRpb25hbCwgU2VsZn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0NvbnRyb2xWYWx1ZUFjY2Vzc29yLCBOR19WQUxVRV9BQ0NFU1NPUn0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xuaW1wb3J0IHtPYnNlcnZhYmxlLCBvZiBhcyBvYnNlcnZhYmxlT2YsIFN1YmplY3R9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHtzd2l0Y2hNYXAsIHRha2VVbnRpbH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuXG5pbXBvcnQge0Nka1NlbGVjdGlvbn0gZnJvbSAnLi9zZWxlY3Rpb24nO1xuXG4vKipcbiAqIE1ha2VzIHRoZSBlbGVtZW50IGEgc2VsZWN0LWFsbCB0b2dnbGUuXG4gKlxuICogTXVzdCBiZSB1c2VkIHdpdGhpbiBhIHBhcmVudCBgQ2RrU2VsZWN0aW9uYCBkaXJlY3RpdmUuIEl0IHRvZ2dsZXMgdGhlIHNlbGVjdGlvbiBzdGF0ZXNcbiAqIG9mIGFsbCB0aGUgc2VsZWN0aW9uIHRvZ2dsZXMgY29ubmVjdGVkIHdpdGggdGhlIGBDZGtTZWxlY3Rpb25gIGRpcmVjdGl2ZS5cbiAqIElmIHRoZSBlbGVtZW50IGltcGxlbWVudHMgYENvbnRyb2xWYWx1ZUFjY2Vzc29yYCwgZS5nLiBgTWF0Q2hlY2tib3hgLCB0aGUgZGlyZWN0aXZlXG4gKiBhdXRvbWF0aWNhbGx5IGNvbm5lY3RzIGl0IHdpdGggdGhlIHNlbGVjdC1hbGwgc3RhdGUgcHJvdmlkZWQgYnkgdGhlIGBDZGtTZWxlY3Rpb25gIGRpcmVjdGl2ZS4gSWZcbiAqIG5vdCwgdXNlIGBjaGVja2VkJGAgdG8gZ2V0IHRoZSBjaGVja2VkIHN0YXRlLCBgaW5kZXRlcm1pbmF0ZSRgIHRvIGdldCB0aGUgaW5kZXRlcm1pbmF0ZSBzdGF0ZSxcbiAqIGFuZCBgdG9nZ2xlKClgIHRvIGNoYW5nZSB0aGUgc2VsZWN0aW9uIHN0YXRlLlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbY2RrU2VsZWN0QWxsXScsXG4gIGV4cG9ydEFzOiAnY2RrU2VsZWN0QWxsJyxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrU2VsZWN0QWxsPFQ+IGltcGxlbWVudHMgT25EZXN0cm95LCBPbkluaXQge1xuICAvKipcbiAgICogVGhlIGNoZWNrZWQgc3RhdGUgb2YgdGhlIHRvZ2dsZS5cbiAgICogUmVzb2x2ZXMgdG8gYHRydWVgIGlmIGFsbCB0aGUgdmFsdWVzIGFyZSBzZWxlY3RlZCwgYGZhbHNlYCBpZiBubyB2YWx1ZSBpcyBzZWxlY3RlZC5cbiAgICovXG4gIHJlYWRvbmx5IGNoZWNrZWQ6IE9ic2VydmFibGU8Ym9vbGVhbj4gPSB0aGlzLl9zZWxlY3Rpb24uY2hhbmdlLnBpcGUoXG4gICAgc3dpdGNoTWFwKCgpID0+IG9ic2VydmFibGVPZih0aGlzLl9zZWxlY3Rpb24uaXNBbGxTZWxlY3RlZCgpKSksXG4gICk7XG5cbiAgLyoqXG4gICAqIFRoZSBpbmRldGVybWluYXRlIHN0YXRlIG9mIHRoZSB0b2dnbGUuXG4gICAqIFJlc29sdmVzIHRvIGB0cnVlYCBpZiBwYXJ0IChub3QgYWxsKSBvZiB0aGUgdmFsdWVzIGFyZSBzZWxlY3RlZCwgYGZhbHNlYCBpZiBhbGwgdmFsdWVzIG9yIG5vXG4gICAqIHZhbHVlIGF0IGFsbCBhcmUgc2VsZWN0ZWQuXG4gICAqL1xuICByZWFkb25seSBpbmRldGVybWluYXRlOiBPYnNlcnZhYmxlPGJvb2xlYW4+ID0gdGhpcy5fc2VsZWN0aW9uLmNoYW5nZS5waXBlKFxuICAgIHN3aXRjaE1hcCgoKSA9PiBvYnNlcnZhYmxlT2YodGhpcy5fc2VsZWN0aW9uLmlzUGFydGlhbFNlbGVjdGVkKCkpKSxcbiAgKTtcblxuICAvKipcbiAgICogVG9nZ2xlcyB0aGUgc2VsZWN0LWFsbCBzdGF0ZS5cbiAgICogQHBhcmFtIGV2ZW50IFRoZSBjbGljayBldmVudCBpZiB0aGUgdG9nZ2xlIGlzIHRyaWdnZXJlZCBieSBhIChtb3VzZSBvciBrZXlib2FyZCkgY2xpY2suIElmXG4gICAqICAgICB1c2luZyB3aXRoIGEgbmF0aXZlIGA8aW5wdXQgdHlwZT1cImNoZWNrYm94XCI+YCwgdGhlIHBhcmFtZXRlciBpcyByZXF1aXJlZCBmb3IgdGhlXG4gICAqICAgICBpbmRldGVybWluYXRlIHN0YXRlIHRvIHdvcmsgcHJvcGVybHkuXG4gICAqL1xuICB0b2dnbGUoZXZlbnQ/OiBNb3VzZUV2ZW50KSB7XG4gICAgLy8gVGhpcyBpcyBuZWVkZWQgd2hlbiBhcHBseWluZyB0aGUgZGlyZWN0aXZlIG9uIGEgbmF0aXZlIDxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIj5cbiAgICAvLyBjaGVja2JveC4gVGhlIGRlZmF1bHQgYmVoYXZpb3IgbmVlZHMgdG8gYmUgcHJldmVudGVkIGluIG9yZGVyIHRvIHN1cHBvcnQgdGhlIGluZGV0ZXJtaW5hdGVcbiAgICAvLyBzdGF0ZS4gVGhlIHRpbWVvdXQgaXMgYWxzbyBuZWVkZWQgc28gdGhlIGNoZWNrYm94IGNhbiBzaG93IHRoZSBsYXRlc3Qgc3RhdGUuXG4gICAgaWYgKGV2ZW50KSB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH1cblxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgdGhpcy5fc2VsZWN0aW9uLnRvZ2dsZVNlbGVjdEFsbCgpO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSByZWFkb25seSBfZGVzdHJveWVkID0gbmV3IFN1YmplY3Q8dm9pZD4oKTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBAT3B0aW9uYWwoKSBASW5qZWN0KENka1NlbGVjdGlvbikgcHJpdmF0ZSByZWFkb25seSBfc2VsZWN0aW9uOiBDZGtTZWxlY3Rpb248VD4sXG4gICAgQE9wdGlvbmFsKClcbiAgICBAU2VsZigpXG4gICAgQEluamVjdChOR19WQUxVRV9BQ0NFU1NPUilcbiAgICBwcml2YXRlIHJlYWRvbmx5IF9jb250cm9sVmFsdWVBY2Nlc3NvcjogQ29udHJvbFZhbHVlQWNjZXNzb3JbXSxcbiAgKSB7fVxuXG4gIG5nT25Jbml0KCkge1xuICAgIHRoaXMuX2Fzc2VydFZhbGlkUGFyZW50U2VsZWN0aW9uKCk7XG4gICAgdGhpcy5fY29uZmlndXJlQ29udHJvbFZhbHVlQWNjZXNzb3IoKTtcbiAgfVxuXG4gIHByaXZhdGUgX2NvbmZpZ3VyZUNvbnRyb2xWYWx1ZUFjY2Vzc29yKCkge1xuICAgIGlmICh0aGlzLl9jb250cm9sVmFsdWVBY2Nlc3NvciAmJiB0aGlzLl9jb250cm9sVmFsdWVBY2Nlc3Nvci5sZW5ndGgpIHtcbiAgICAgIHRoaXMuX2NvbnRyb2xWYWx1ZUFjY2Vzc29yWzBdLnJlZ2lzdGVyT25DaGFuZ2UoKGU6IHVua25vd24pID0+IHtcbiAgICAgICAgaWYgKGUgPT09IHRydWUgfHwgZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICB0aGlzLnRvZ2dsZSgpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHRoaXMuY2hlY2tlZC5waXBlKHRha2VVbnRpbCh0aGlzLl9kZXN0cm95ZWQpKS5zdWJzY3JpYmUoc3RhdGUgPT4ge1xuICAgICAgICB0aGlzLl9jb250cm9sVmFsdWVBY2Nlc3NvclswXS53cml0ZVZhbHVlKHN0YXRlKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2Fzc2VydFZhbGlkUGFyZW50U2VsZWN0aW9uKCkge1xuICAgIGlmICghdGhpcy5fc2VsZWN0aW9uICYmICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpKSB7XG4gICAgICB0aHJvdyBFcnJvcignQ2RrU2VsZWN0QWxsOiBtaXNzaW5nIENka1NlbGVjdGlvbiBpbiB0aGUgcGFyZW50Jyk7XG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLl9zZWxlY3Rpb24ubXVsdGlwbGUgJiYgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkpIHtcbiAgICAgIHRocm93IEVycm9yKCdDZGtTZWxlY3RBbGw6IENka1NlbGVjdGlvbiBtdXN0IGhhdmUgY2RrU2VsZWN0aW9uTXVsdGlwbGUgc2V0IHRvIHRydWUnKTtcbiAgICB9XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICB0aGlzLl9kZXN0cm95ZWQubmV4dCgpO1xuICAgIHRoaXMuX2Rlc3Ryb3llZC5jb21wbGV0ZSgpO1xuICB9XG59XG4iXX0=