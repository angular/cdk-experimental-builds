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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.0.0-next.4", ngImport: i0, type: CdkSelectAll, deps: [{ token: CdkSelection, optional: true }, { token: NG_VALUE_ACCESSOR, optional: true, self: true }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "17.0.0-next.4", type: CdkSelectAll, selector: "[cdkSelectAll]", exportAs: ["cdkSelectAll"], ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.0.0-next.4", ngImport: i0, type: CdkSelectAll, decorators: [{
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VsZWN0LWFsbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL3NlbGVjdGlvbi9zZWxlY3QtYWxsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxTQUFTLEVBQUUsTUFBTSxFQUFxQixRQUFRLEVBQUUsSUFBSSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ25GLE9BQU8sRUFBdUIsaUJBQWlCLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUN2RSxPQUFPLEVBQWEsRUFBRSxJQUFJLFlBQVksRUFBRSxPQUFPLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDN0QsT0FBTyxFQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUVwRCxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sYUFBYSxDQUFDOzs7QUFFekM7Ozs7Ozs7OztHQVNHO0FBS0gsTUFBTSxPQUFPLFlBQVk7SUFjdkI7Ozs7O09BS0c7SUFDSCxNQUFNLENBQUMsS0FBa0I7UUFDdkIsaUZBQWlGO1FBQ2pGLDZGQUE2RjtRQUM3RiwrRUFBK0U7UUFDL0UsSUFBSSxLQUFLLEVBQUU7WUFDVCxLQUFLLENBQUMsY0FBYyxFQUFFLENBQUM7U0FDeEI7UUFFRCxVQUFVLENBQUMsR0FBRyxFQUFFO1lBQ2QsSUFBSSxDQUFDLFVBQVUsQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUNwQyxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFJRCxZQUNxRCxVQUEyQixFQUk3RCxxQkFBNkM7UUFKWCxlQUFVLEdBQVYsVUFBVSxDQUFpQjtRQUk3RCwwQkFBcUIsR0FBckIscUJBQXFCLENBQXdCO1FBUC9DLGVBQVUsR0FBRyxJQUFJLE9BQU8sRUFBUSxDQUFDO1FBU2hELElBQUksQ0FBQyxPQUFPLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQ25DLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUMsQ0FDMUQsQ0FBQztRQUVGLElBQUksQ0FBQyxhQUFhLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQ3pDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLGlCQUFpQixFQUFFLENBQUMsQ0FBQyxDQUM5RCxDQUFDO0lBQ0osQ0FBQztJQUVELFFBQVE7UUFDTixJQUFJLENBQUMsMkJBQTJCLEVBQUUsQ0FBQztRQUNuQyxJQUFJLENBQUMsOEJBQThCLEVBQUUsQ0FBQztJQUN4QyxDQUFDO0lBRU8sOEJBQThCO1FBQ3BDLElBQUksSUFBSSxDQUFDLHFCQUFxQixJQUFJLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxNQUFNLEVBQUU7WUFDbkUsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBVSxFQUFFLEVBQUU7Z0JBQzVELElBQUksQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLEtBQUssS0FBSyxFQUFFO29CQUM3QixJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7aUJBQ2Y7WUFDSCxDQUFDLENBQUMsQ0FBQztZQUNILElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQzlELElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDbEQsQ0FBQyxDQUFDLENBQUM7U0FDSjtJQUNILENBQUM7SUFFTywyQkFBMkI7UUFDakMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLElBQUksQ0FBQyxPQUFPLFNBQVMsS0FBSyxXQUFXLElBQUksU0FBUyxDQUFDLEVBQUU7WUFDdkUsTUFBTSxLQUFLLENBQUMsa0RBQWtELENBQUMsQ0FBQztTQUNqRTtRQUVELElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsSUFBSSxDQUFDLE9BQU8sU0FBUyxLQUFLLFdBQVcsSUFBSSxTQUFTLENBQUMsRUFBRTtZQUNoRixNQUFNLEtBQUssQ0FBQyx1RUFBdUUsQ0FBQyxDQUFDO1NBQ3RGO0lBQ0gsQ0FBQztJQUVELFdBQVc7UUFDVCxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDN0IsQ0FBQztxSEFsRlUsWUFBWSxrQkFvQ0QsWUFBWSw2QkFHeEIsaUJBQWlCO3lHQXZDaEIsWUFBWTs7a0dBQVosWUFBWTtrQkFKeEIsU0FBUzttQkFBQztvQkFDVCxRQUFRLEVBQUUsZ0JBQWdCO29CQUMxQixRQUFRLEVBQUUsY0FBYztpQkFDekI7OzBCQXFDSSxRQUFROzswQkFBSSxNQUFNOzJCQUFDLFlBQVk7OzBCQUMvQixRQUFROzswQkFDUixJQUFJOzswQkFDSixNQUFNOzJCQUFDLGlCQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0RpcmVjdGl2ZSwgSW5qZWN0LCBPbkRlc3Ryb3ksIE9uSW5pdCwgT3B0aW9uYWwsIFNlbGZ9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtDb250cm9sVmFsdWVBY2Nlc3NvciwgTkdfVkFMVUVfQUNDRVNTT1J9IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcbmltcG9ydCB7T2JzZXJ2YWJsZSwgb2YgYXMgb2JzZXJ2YWJsZU9mLCBTdWJqZWN0fSBmcm9tICdyeGpzJztcbmltcG9ydCB7c3dpdGNoTWFwLCB0YWtlVW50aWx9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcblxuaW1wb3J0IHtDZGtTZWxlY3Rpb259IGZyb20gJy4vc2VsZWN0aW9uJztcblxuLyoqXG4gKiBNYWtlcyB0aGUgZWxlbWVudCBhIHNlbGVjdC1hbGwgdG9nZ2xlLlxuICpcbiAqIE11c3QgYmUgdXNlZCB3aXRoaW4gYSBwYXJlbnQgYENka1NlbGVjdGlvbmAgZGlyZWN0aXZlLiBJdCB0b2dnbGVzIHRoZSBzZWxlY3Rpb24gc3RhdGVzXG4gKiBvZiBhbGwgdGhlIHNlbGVjdGlvbiB0b2dnbGVzIGNvbm5lY3RlZCB3aXRoIHRoZSBgQ2RrU2VsZWN0aW9uYCBkaXJlY3RpdmUuXG4gKiBJZiB0aGUgZWxlbWVudCBpbXBsZW1lbnRzIGBDb250cm9sVmFsdWVBY2Nlc3NvcmAsIGUuZy4gYE1hdENoZWNrYm94YCwgdGhlIGRpcmVjdGl2ZVxuICogYXV0b21hdGljYWxseSBjb25uZWN0cyBpdCB3aXRoIHRoZSBzZWxlY3QtYWxsIHN0YXRlIHByb3ZpZGVkIGJ5IHRoZSBgQ2RrU2VsZWN0aW9uYCBkaXJlY3RpdmUuIElmXG4gKiBub3QsIHVzZSBgY2hlY2tlZCRgIHRvIGdldCB0aGUgY2hlY2tlZCBzdGF0ZSwgYGluZGV0ZXJtaW5hdGUkYCB0byBnZXQgdGhlIGluZGV0ZXJtaW5hdGUgc3RhdGUsXG4gKiBhbmQgYHRvZ2dsZSgpYCB0byBjaGFuZ2UgdGhlIHNlbGVjdGlvbiBzdGF0ZS5cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW2Nka1NlbGVjdEFsbF0nLFxuICBleHBvcnRBczogJ2Nka1NlbGVjdEFsbCcsXG59KVxuZXhwb3J0IGNsYXNzIENka1NlbGVjdEFsbDxUPiBpbXBsZW1lbnRzIE9uRGVzdHJveSwgT25Jbml0IHtcbiAgLyoqXG4gICAqIFRoZSBjaGVja2VkIHN0YXRlIG9mIHRoZSB0b2dnbGUuXG4gICAqIFJlc29sdmVzIHRvIGB0cnVlYCBpZiBhbGwgdGhlIHZhbHVlcyBhcmUgc2VsZWN0ZWQsIGBmYWxzZWAgaWYgbm8gdmFsdWUgaXMgc2VsZWN0ZWQuXG4gICAqL1xuICByZWFkb25seSBjaGVja2VkOiBPYnNlcnZhYmxlPGJvb2xlYW4+O1xuXG4gIC8qKlxuICAgKiBUaGUgaW5kZXRlcm1pbmF0ZSBzdGF0ZSBvZiB0aGUgdG9nZ2xlLlxuICAgKiBSZXNvbHZlcyB0byBgdHJ1ZWAgaWYgcGFydCAobm90IGFsbCkgb2YgdGhlIHZhbHVlcyBhcmUgc2VsZWN0ZWQsIGBmYWxzZWAgaWYgYWxsIHZhbHVlcyBvciBub1xuICAgKiB2YWx1ZSBhdCBhbGwgYXJlIHNlbGVjdGVkLlxuICAgKi9cbiAgcmVhZG9ubHkgaW5kZXRlcm1pbmF0ZTogT2JzZXJ2YWJsZTxib29sZWFuPjtcblxuICAvKipcbiAgICogVG9nZ2xlcyB0aGUgc2VsZWN0LWFsbCBzdGF0ZS5cbiAgICogQHBhcmFtIGV2ZW50IFRoZSBjbGljayBldmVudCBpZiB0aGUgdG9nZ2xlIGlzIHRyaWdnZXJlZCBieSBhIChtb3VzZSBvciBrZXlib2FyZCkgY2xpY2suIElmXG4gICAqICAgICB1c2luZyB3aXRoIGEgbmF0aXZlIGA8aW5wdXQgdHlwZT1cImNoZWNrYm94XCI+YCwgdGhlIHBhcmFtZXRlciBpcyByZXF1aXJlZCBmb3IgdGhlXG4gICAqICAgICBpbmRldGVybWluYXRlIHN0YXRlIHRvIHdvcmsgcHJvcGVybHkuXG4gICAqL1xuICB0b2dnbGUoZXZlbnQ/OiBNb3VzZUV2ZW50KSB7XG4gICAgLy8gVGhpcyBpcyBuZWVkZWQgd2hlbiBhcHBseWluZyB0aGUgZGlyZWN0aXZlIG9uIGEgbmF0aXZlIDxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIj5cbiAgICAvLyBjaGVja2JveC4gVGhlIGRlZmF1bHQgYmVoYXZpb3IgbmVlZHMgdG8gYmUgcHJldmVudGVkIGluIG9yZGVyIHRvIHN1cHBvcnQgdGhlIGluZGV0ZXJtaW5hdGVcbiAgICAvLyBzdGF0ZS4gVGhlIHRpbWVvdXQgaXMgYWxzbyBuZWVkZWQgc28gdGhlIGNoZWNrYm94IGNhbiBzaG93IHRoZSBsYXRlc3Qgc3RhdGUuXG4gICAgaWYgKGV2ZW50KSB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH1cblxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgdGhpcy5fc2VsZWN0aW9uLnRvZ2dsZVNlbGVjdEFsbCgpO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSByZWFkb25seSBfZGVzdHJveWVkID0gbmV3IFN1YmplY3Q8dm9pZD4oKTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBAT3B0aW9uYWwoKSBASW5qZWN0KENka1NlbGVjdGlvbikgcHJpdmF0ZSByZWFkb25seSBfc2VsZWN0aW9uOiBDZGtTZWxlY3Rpb248VD4sXG4gICAgQE9wdGlvbmFsKClcbiAgICBAU2VsZigpXG4gICAgQEluamVjdChOR19WQUxVRV9BQ0NFU1NPUilcbiAgICBwcml2YXRlIHJlYWRvbmx5IF9jb250cm9sVmFsdWVBY2Nlc3NvcjogQ29udHJvbFZhbHVlQWNjZXNzb3JbXSxcbiAgKSB7XG4gICAgdGhpcy5jaGVja2VkID0gX3NlbGVjdGlvbi5jaGFuZ2UucGlwZShcbiAgICAgIHN3aXRjaE1hcCgoKSA9PiBvYnNlcnZhYmxlT2YoX3NlbGVjdGlvbi5pc0FsbFNlbGVjdGVkKCkpKSxcbiAgICApO1xuXG4gICAgdGhpcy5pbmRldGVybWluYXRlID0gX3NlbGVjdGlvbi5jaGFuZ2UucGlwZShcbiAgICAgIHN3aXRjaE1hcCgoKSA9PiBvYnNlcnZhYmxlT2YoX3NlbGVjdGlvbi5pc1BhcnRpYWxTZWxlY3RlZCgpKSksXG4gICAgKTtcbiAgfVxuXG4gIG5nT25Jbml0KCkge1xuICAgIHRoaXMuX2Fzc2VydFZhbGlkUGFyZW50U2VsZWN0aW9uKCk7XG4gICAgdGhpcy5fY29uZmlndXJlQ29udHJvbFZhbHVlQWNjZXNzb3IoKTtcbiAgfVxuXG4gIHByaXZhdGUgX2NvbmZpZ3VyZUNvbnRyb2xWYWx1ZUFjY2Vzc29yKCkge1xuICAgIGlmICh0aGlzLl9jb250cm9sVmFsdWVBY2Nlc3NvciAmJiB0aGlzLl9jb250cm9sVmFsdWVBY2Nlc3Nvci5sZW5ndGgpIHtcbiAgICAgIHRoaXMuX2NvbnRyb2xWYWx1ZUFjY2Vzc29yWzBdLnJlZ2lzdGVyT25DaGFuZ2UoKGU6IHVua25vd24pID0+IHtcbiAgICAgICAgaWYgKGUgPT09IHRydWUgfHwgZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICB0aGlzLnRvZ2dsZSgpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHRoaXMuY2hlY2tlZC5waXBlKHRha2VVbnRpbCh0aGlzLl9kZXN0cm95ZWQpKS5zdWJzY3JpYmUoc3RhdGUgPT4ge1xuICAgICAgICB0aGlzLl9jb250cm9sVmFsdWVBY2Nlc3NvclswXS53cml0ZVZhbHVlKHN0YXRlKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2Fzc2VydFZhbGlkUGFyZW50U2VsZWN0aW9uKCkge1xuICAgIGlmICghdGhpcy5fc2VsZWN0aW9uICYmICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpKSB7XG4gICAgICB0aHJvdyBFcnJvcignQ2RrU2VsZWN0QWxsOiBtaXNzaW5nIENka1NlbGVjdGlvbiBpbiB0aGUgcGFyZW50Jyk7XG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLl9zZWxlY3Rpb24ubXVsdGlwbGUgJiYgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkpIHtcbiAgICAgIHRocm93IEVycm9yKCdDZGtTZWxlY3RBbGw6IENka1NlbGVjdGlvbiBtdXN0IGhhdmUgY2RrU2VsZWN0aW9uTXVsdGlwbGUgc2V0IHRvIHRydWUnKTtcbiAgICB9XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICB0aGlzLl9kZXN0cm95ZWQubmV4dCgpO1xuICAgIHRoaXMuX2Rlc3Ryb3llZC5jb21wbGV0ZSgpO1xuICB9XG59XG4iXX0=