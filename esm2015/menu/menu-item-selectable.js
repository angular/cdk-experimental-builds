/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { Input, Directive, Output, EventEmitter } from '@angular/core';
import { CdkMenuItem } from './menu-item';
/** Counter used to set a unique id and name for a selectable item */
let nextId = 0;
/**
 * Base class providing checked state for MenuItems along with outputting a clicked event when the
 * element is triggered. It provides functionality for selectable elements.
 */
export class CdkMenuItemSelectable extends CdkMenuItem {
    constructor() {
        super(...arguments);
        /** Event emitted when the selectable item is clicked */
        this.toggled = new EventEmitter();
        this._checked = false;
        /** The name of the selectable element with a default value */
        this.name = `cdk-selectable-item-${nextId++}`;
        /** The id of the selectable element with a default value */
        this.id = `cdk-selectable-item-${nextId++}`;
    }
    /** Whether the element is checked */
    get checked() {
        return this._checked;
    }
    set checked(value) {
        this._checked = coerceBooleanProperty(value);
    }
    /** If the element is not disabled emit the click event */
    trigger() {
        if (!this.disabled) {
            this.toggled.next(this);
        }
    }
}
CdkMenuItemSelectable.decorators = [
    { type: Directive }
];
CdkMenuItemSelectable.propDecorators = {
    toggled: [{ type: Output, args: ['cdkMenuItemToggled',] }],
    checked: [{ type: Input }],
    name: [{ type: Input }],
    id: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1pdGVtLXNlbGVjdGFibGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrLWV4cGVyaW1lbnRhbC9tZW51L21lbnUtaXRlbS1zZWxlY3RhYmxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxxQkFBcUIsRUFBZSxNQUFNLHVCQUF1QixDQUFDO0FBQzFFLE9BQU8sRUFBQyxLQUFLLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxZQUFZLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDckUsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLGFBQWEsQ0FBQztBQUV4QyxxRUFBcUU7QUFDckUsSUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDO0FBRWY7OztHQUdHO0FBRUgsTUFBTSxPQUFnQixxQkFBc0IsU0FBUSxXQUFXO0lBRC9EOztRQUVFLHdEQUF3RDtRQUMxQixZQUFPLEdBQXdDLElBQUksWUFBWSxFQUFFLENBQUM7UUFVeEYsYUFBUSxHQUFHLEtBQUssQ0FBQztRQUV6Qiw4REFBOEQ7UUFDckQsU0FBSSxHQUFXLHVCQUF1QixNQUFNLEVBQUUsRUFBRSxDQUFDO1FBRTFELDREQUE0RDtRQUNuRCxPQUFFLEdBQVcsdUJBQXVCLE1BQU0sRUFBRSxFQUFFLENBQUM7SUFVMUQsQ0FBQztJQXhCQyxxQ0FBcUM7SUFDckMsSUFDSSxPQUFPO1FBQ1QsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDO0lBQ3ZCLENBQUM7SUFDRCxJQUFJLE9BQU8sQ0FBQyxLQUFjO1FBQ3hCLElBQUksQ0FBQyxRQUFRLEdBQUcscUJBQXFCLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDL0MsQ0FBQztJQVNELDBEQUEwRDtJQUMxRCxPQUFPO1FBQ0wsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDbEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDekI7SUFDSCxDQUFDOzs7WUExQkYsU0FBUzs7O3NCQUdQLE1BQU0sU0FBQyxvQkFBb0I7c0JBRzNCLEtBQUs7bUJBVUwsS0FBSztpQkFHTCxLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Y29lcmNlQm9vbGVhblByb3BlcnR5LCBCb29sZWFuSW5wdXR9IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2VyY2lvbic7XG5pbXBvcnQge0lucHV0LCBEaXJlY3RpdmUsIE91dHB1dCwgRXZlbnRFbWl0dGVyfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7Q2RrTWVudUl0ZW19IGZyb20gJy4vbWVudS1pdGVtJztcblxuLyoqIENvdW50ZXIgdXNlZCB0byBzZXQgYSB1bmlxdWUgaWQgYW5kIG5hbWUgZm9yIGEgc2VsZWN0YWJsZSBpdGVtICovXG5sZXQgbmV4dElkID0gMDtcblxuLyoqXG4gKiBCYXNlIGNsYXNzIHByb3ZpZGluZyBjaGVja2VkIHN0YXRlIGZvciBNZW51SXRlbXMgYWxvbmcgd2l0aCBvdXRwdXR0aW5nIGEgY2xpY2tlZCBldmVudCB3aGVuIHRoZVxuICogZWxlbWVudCBpcyB0cmlnZ2VyZWQuIEl0IHByb3ZpZGVzIGZ1bmN0aW9uYWxpdHkgZm9yIHNlbGVjdGFibGUgZWxlbWVudHMuXG4gKi9cbkBEaXJlY3RpdmUoKVxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIENka01lbnVJdGVtU2VsZWN0YWJsZSBleHRlbmRzIENka01lbnVJdGVtIHtcbiAgLyoqIEV2ZW50IGVtaXR0ZWQgd2hlbiB0aGUgc2VsZWN0YWJsZSBpdGVtIGlzIGNsaWNrZWQgKi9cbiAgQE91dHB1dCgnY2RrTWVudUl0ZW1Ub2dnbGVkJykgdG9nZ2xlZDogRXZlbnRFbWl0dGVyPENka01lbnVJdGVtU2VsZWN0YWJsZT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGVsZW1lbnQgaXMgY2hlY2tlZCAqL1xuICBASW5wdXQoKVxuICBnZXQgY2hlY2tlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5fY2hlY2tlZDtcbiAgfVxuICBzZXQgY2hlY2tlZCh2YWx1ZTogYm9vbGVhbikge1xuICAgIHRoaXMuX2NoZWNrZWQgPSBjb2VyY2VCb29sZWFuUHJvcGVydHkodmFsdWUpO1xuICB9XG4gIHByaXZhdGUgX2NoZWNrZWQgPSBmYWxzZTtcblxuICAvKiogVGhlIG5hbWUgb2YgdGhlIHNlbGVjdGFibGUgZWxlbWVudCB3aXRoIGEgZGVmYXVsdCB2YWx1ZSAqL1xuICBASW5wdXQoKSBuYW1lOiBzdHJpbmcgPSBgY2RrLXNlbGVjdGFibGUtaXRlbS0ke25leHRJZCsrfWA7XG5cbiAgLyoqIFRoZSBpZCBvZiB0aGUgc2VsZWN0YWJsZSBlbGVtZW50IHdpdGggYSBkZWZhdWx0IHZhbHVlICovXG4gIEBJbnB1dCgpIGlkOiBzdHJpbmcgPSBgY2RrLXNlbGVjdGFibGUtaXRlbS0ke25leHRJZCsrfWA7XG5cbiAgLyoqIElmIHRoZSBlbGVtZW50IGlzIG5vdCBkaXNhYmxlZCBlbWl0IHRoZSBjbGljayBldmVudCAqL1xuICB0cmlnZ2VyKCkge1xuICAgIGlmICghdGhpcy5kaXNhYmxlZCkge1xuICAgICAgdGhpcy50b2dnbGVkLm5leHQodGhpcyk7XG4gICAgfVxuICB9XG5cbiAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2NoZWNrZWQ6IEJvb2xlYW5JbnB1dDtcbn1cbiJdfQ==