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
var FormValueContainer = /** @class */ (function () {
    function FormValueContainer() {
        this._formValues = new WeakMap();
    }
    FormValueContainer.prototype.for = function (key) {
        var _formValues = this._formValues;
        var entry = _formValues.get(key);
        if (!entry) {
            // Expose entry as an object so that we can [(two-way)] bind to its value member
            entry = {};
            _formValues.set(key, entry);
        }
        return entry;
    };
    return FormValueContainer;
}());
export { FormValueContainer };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybS12YWx1ZS1jb250YWluZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrLWV4cGVyaW1lbnRhbC9wb3BvdmVyLWVkaXQvZm9ybS12YWx1ZS1jb250YWluZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBTUg7Ozs7Ozs7OztHQVNHO0FBQ0g7SUFBQTtRQUNVLGdCQUFXLEdBQUcsSUFBSSxPQUFPLEVBQXlCLENBQUM7SUFjN0QsQ0FBQztJQVpDLGdDQUFHLEdBQUgsVUFBSSxHQUFRO1FBQ1YsSUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztRQUVyQyxJQUFJLEtBQUssR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2pDLElBQUksQ0FBQyxLQUFLLEVBQUU7WUFDVixnRkFBZ0Y7WUFDaEYsS0FBSyxHQUFHLEVBQUUsQ0FBQztZQUNYLFdBQVcsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO1NBQzdCO1FBRUQsT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDO0lBQ0gseUJBQUM7QUFBRCxDQUFDLEFBZkQsSUFlQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5leHBvcnQgaW50ZXJmYWNlIEVudHJ5PEZvcm1WYWx1ZT4ge1xuICB2YWx1ZT86IEZvcm1WYWx1ZTtcbn1cblxuLyoqXG4gKiBBIGNvbnZlbmllbmNlIGNsYXNzIGZvciBwcmVzZXJ2aW5nIHVuc2F2ZWQgZm9ybSBzdGF0ZSB3aGlsZSBhbiBlZGl0IGxlbnMgaXMgY2xvc2VkLlxuICpcbiAqIEV4YW1wbGUgdXNhZ2U6XG4gKiBjbGFzcyBNeUNvbXBvbmVudCB7XG4gKiAgIHJlYWRvbmx5IG5hbWVFZGl0VmFsdWVzID0gbmV3IEZvcm1WYWx1ZUNvbnRhaW5lciZsdDtJdGVtLCB7bmFtZTogc3RyaW5nfSZndDsoKTtcbiAqIH1cbiAqXG4gKiAmbHQ7Zm9ybSBjZGtFZGl0Q29udHJvbCBbKGNka0VkaXRDb250cm9sUHJlc2VydmVkRm9ybVZhbHVlKV09XCJuYW1lRWRpdFZhbHVlcy5mb3IoaXRlbSkudmFsdWVcIiZndDtcbiAqL1xuZXhwb3J0IGNsYXNzIEZvcm1WYWx1ZUNvbnRhaW5lcjxLZXkgZXh0ZW5kcyBvYmplY3QsIEZvcm1WYWx1ZT4ge1xuICBwcml2YXRlIF9mb3JtVmFsdWVzID0gbmV3IFdlYWtNYXA8S2V5LCBFbnRyeTxGb3JtVmFsdWU+PigpO1xuXG4gIGZvcihrZXk6IEtleSk6IEVudHJ5PEZvcm1WYWx1ZT4ge1xuICAgIGNvbnN0IF9mb3JtVmFsdWVzID0gdGhpcy5fZm9ybVZhbHVlcztcblxuICAgIGxldCBlbnRyeSA9IF9mb3JtVmFsdWVzLmdldChrZXkpO1xuICAgIGlmICghZW50cnkpIHtcbiAgICAgIC8vIEV4cG9zZSBlbnRyeSBhcyBhbiBvYmplY3Qgc28gdGhhdCB3ZSBjYW4gWyh0d28td2F5KV0gYmluZCB0byBpdHMgdmFsdWUgbWVtYmVyXG4gICAgICBlbnRyeSA9IHt9O1xuICAgICAgX2Zvcm1WYWx1ZXMuc2V0KGtleSwgZW50cnkpO1xuICAgIH1cblxuICAgIHJldHVybiBlbnRyeTtcbiAgfVxufVxuIl19