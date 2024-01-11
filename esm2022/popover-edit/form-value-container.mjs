/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * A convenience class for preserving unsaved form state while an edit lens is closed.
 *
 * Example usage:
 * class MyComponent {
 *   readonly nameEditValues = new FormValueContainer&lt;Item, {name: string}&gt;();
 * }
 *
 * &lt;form cdkEditControl [(cdkEditControlPreservedFormValue)]="nameEditValues.for(item).value"&gt;
 */
export class FormValueContainer {
    constructor() {
        this._formValues = new WeakMap();
    }
    for(key) {
        const _formValues = this._formValues;
        let entry = _formValues.get(key);
        if (!entry) {
            // Expose entry as an object so that we can [(two-way)] bind to its value member
            entry = {};
            _formValues.set(key, entry);
        }
        return entry;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybS12YWx1ZS1jb250YWluZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrLWV4cGVyaW1lbnRhbC9wb3BvdmVyLWVkaXQvZm9ybS12YWx1ZS1jb250YWluZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBTUg7Ozs7Ozs7OztHQVNHO0FBQ0gsTUFBTSxPQUFPLGtCQUFrQjtJQUEvQjtRQUNVLGdCQUFXLEdBQUcsSUFBSSxPQUFPLEVBQXlCLENBQUM7SUFjN0QsQ0FBQztJQVpDLEdBQUcsQ0FBQyxHQUFRO1FBQ1YsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztRQUVyQyxJQUFJLEtBQUssR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2pDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNYLGdGQUFnRjtZQUNoRixLQUFLLEdBQUcsRUFBRSxDQUFDO1lBQ1gsV0FBVyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDOUIsQ0FBQztRQUVELE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQztDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmV4cG9ydCBpbnRlcmZhY2UgRW50cnk8Rm9ybVZhbHVlPiB7XG4gIHZhbHVlPzogRm9ybVZhbHVlO1xufVxuXG4vKipcbiAqIEEgY29udmVuaWVuY2UgY2xhc3MgZm9yIHByZXNlcnZpbmcgdW5zYXZlZCBmb3JtIHN0YXRlIHdoaWxlIGFuIGVkaXQgbGVucyBpcyBjbG9zZWQuXG4gKlxuICogRXhhbXBsZSB1c2FnZTpcbiAqIGNsYXNzIE15Q29tcG9uZW50IHtcbiAqICAgcmVhZG9ubHkgbmFtZUVkaXRWYWx1ZXMgPSBuZXcgRm9ybVZhbHVlQ29udGFpbmVyJmx0O0l0ZW0sIHtuYW1lOiBzdHJpbmd9Jmd0OygpO1xuICogfVxuICpcbiAqICZsdDtmb3JtIGNka0VkaXRDb250cm9sIFsoY2RrRWRpdENvbnRyb2xQcmVzZXJ2ZWRGb3JtVmFsdWUpXT1cIm5hbWVFZGl0VmFsdWVzLmZvcihpdGVtKS52YWx1ZVwiJmd0O1xuICovXG5leHBvcnQgY2xhc3MgRm9ybVZhbHVlQ29udGFpbmVyPEtleSBleHRlbmRzIG9iamVjdCwgRm9ybVZhbHVlPiB7XG4gIHByaXZhdGUgX2Zvcm1WYWx1ZXMgPSBuZXcgV2Vha01hcDxLZXksIEVudHJ5PEZvcm1WYWx1ZT4+KCk7XG5cbiAgZm9yKGtleTogS2V5KTogRW50cnk8Rm9ybVZhbHVlPiB7XG4gICAgY29uc3QgX2Zvcm1WYWx1ZXMgPSB0aGlzLl9mb3JtVmFsdWVzO1xuXG4gICAgbGV0IGVudHJ5ID0gX2Zvcm1WYWx1ZXMuZ2V0KGtleSk7XG4gICAgaWYgKCFlbnRyeSkge1xuICAgICAgLy8gRXhwb3NlIGVudHJ5IGFzIGFuIG9iamVjdCBzbyB0aGF0IHdlIGNhbiBbKHR3by13YXkpXSBiaW5kIHRvIGl0cyB2YWx1ZSBtZW1iZXJcbiAgICAgIGVudHJ5ID0ge307XG4gICAgICBfZm9ybVZhbHVlcy5zZXQoa2V5LCBlbnRyeSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGVudHJ5O1xuICB9XG59XG4iXX0=