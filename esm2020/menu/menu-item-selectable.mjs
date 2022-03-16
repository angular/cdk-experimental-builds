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
import * as i0 from "@angular/core";
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
CdkMenuItemSelectable.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.3.0", ngImport: i0, type: CdkMenuItemSelectable, deps: null, target: i0.ɵɵFactoryTarget.Directive });
CdkMenuItemSelectable.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "13.3.0", type: CdkMenuItemSelectable, inputs: { checked: "checked", name: "name", id: "id" }, outputs: { toggled: "cdkMenuItemToggled" }, usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.3.0", ngImport: i0, type: CdkMenuItemSelectable, decorators: [{
            type: Directive
        }], propDecorators: { toggled: [{
                type: Output,
                args: ['cdkMenuItemToggled']
            }], checked: [{
                type: Input
            }], name: [{
                type: Input
            }], id: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1pdGVtLXNlbGVjdGFibGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrLWV4cGVyaW1lbnRhbC9tZW51L21lbnUtaXRlbS1zZWxlY3RhYmxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxxQkFBcUIsRUFBZSxNQUFNLHVCQUF1QixDQUFDO0FBQzFFLE9BQU8sRUFBQyxLQUFLLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxZQUFZLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDckUsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLGFBQWEsQ0FBQzs7QUFFeEMscUVBQXFFO0FBQ3JFLElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQztBQUVmOzs7R0FHRztBQUVILE1BQU0sT0FBZ0IscUJBQXNCLFNBQVEsV0FBVztJQUQvRDs7UUFFRSx3REFBd0Q7UUFDakIsWUFBTyxHQUM1QyxJQUFJLFlBQVksRUFBRSxDQUFDO1FBVWIsYUFBUSxHQUFHLEtBQUssQ0FBQztRQUV6Qiw4REFBOEQ7UUFDckQsU0FBSSxHQUFXLHVCQUF1QixNQUFNLEVBQUUsRUFBRSxDQUFDO1FBRTFELDREQUE0RDtRQUNuRCxPQUFFLEdBQVcsdUJBQXVCLE1BQU0sRUFBRSxFQUFFLENBQUM7S0FRekQ7SUF0QkMscUNBQXFDO0lBQ3JDLElBQ0ksT0FBTztRQUNULE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztJQUN2QixDQUFDO0lBQ0QsSUFBSSxPQUFPLENBQUMsS0FBbUI7UUFDN0IsSUFBSSxDQUFDLFFBQVEsR0FBRyxxQkFBcUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUMvQyxDQUFDO0lBU0QsMERBQTBEO0lBQ2pELE9BQU87UUFDZCxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNsQixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN6QjtJQUNILENBQUM7O2tIQTFCbUIscUJBQXFCO3NHQUFyQixxQkFBcUI7MkZBQXJCLHFCQUFxQjtrQkFEMUMsU0FBUzs4QkFHK0IsT0FBTztzQkFBN0MsTUFBTTt1QkFBQyxvQkFBb0I7Z0JBS3hCLE9BQU87c0JBRFYsS0FBSztnQkFVRyxJQUFJO3NCQUFaLEtBQUs7Z0JBR0csRUFBRTtzQkFBVixLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Y29lcmNlQm9vbGVhblByb3BlcnR5LCBCb29sZWFuSW5wdXR9IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2VyY2lvbic7XG5pbXBvcnQge0lucHV0LCBEaXJlY3RpdmUsIE91dHB1dCwgRXZlbnRFbWl0dGVyfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7Q2RrTWVudUl0ZW19IGZyb20gJy4vbWVudS1pdGVtJztcblxuLyoqIENvdW50ZXIgdXNlZCB0byBzZXQgYSB1bmlxdWUgaWQgYW5kIG5hbWUgZm9yIGEgc2VsZWN0YWJsZSBpdGVtICovXG5sZXQgbmV4dElkID0gMDtcblxuLyoqXG4gKiBCYXNlIGNsYXNzIHByb3ZpZGluZyBjaGVja2VkIHN0YXRlIGZvciBNZW51SXRlbXMgYWxvbmcgd2l0aCBvdXRwdXR0aW5nIGEgY2xpY2tlZCBldmVudCB3aGVuIHRoZVxuICogZWxlbWVudCBpcyB0cmlnZ2VyZWQuIEl0IHByb3ZpZGVzIGZ1bmN0aW9uYWxpdHkgZm9yIHNlbGVjdGFibGUgZWxlbWVudHMuXG4gKi9cbkBEaXJlY3RpdmUoKVxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIENka01lbnVJdGVtU2VsZWN0YWJsZSBleHRlbmRzIENka01lbnVJdGVtIHtcbiAgLyoqIEV2ZW50IGVtaXR0ZWQgd2hlbiB0aGUgc2VsZWN0YWJsZSBpdGVtIGlzIGNsaWNrZWQgKi9cbiAgQE91dHB1dCgnY2RrTWVudUl0ZW1Ub2dnbGVkJykgcmVhZG9ubHkgdG9nZ2xlZDogRXZlbnRFbWl0dGVyPENka01lbnVJdGVtU2VsZWN0YWJsZT4gPVxuICAgIG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuICAvKiogV2hldGhlciB0aGUgZWxlbWVudCBpcyBjaGVja2VkICovXG4gIEBJbnB1dCgpXG4gIGdldCBjaGVja2VkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9jaGVja2VkO1xuICB9XG4gIHNldCBjaGVja2VkKHZhbHVlOiBCb29sZWFuSW5wdXQpIHtcbiAgICB0aGlzLl9jaGVja2VkID0gY29lcmNlQm9vbGVhblByb3BlcnR5KHZhbHVlKTtcbiAgfVxuICBwcml2YXRlIF9jaGVja2VkID0gZmFsc2U7XG5cbiAgLyoqIFRoZSBuYW1lIG9mIHRoZSBzZWxlY3RhYmxlIGVsZW1lbnQgd2l0aCBhIGRlZmF1bHQgdmFsdWUgKi9cbiAgQElucHV0KCkgbmFtZTogc3RyaW5nID0gYGNkay1zZWxlY3RhYmxlLWl0ZW0tJHtuZXh0SWQrK31gO1xuXG4gIC8qKiBUaGUgaWQgb2YgdGhlIHNlbGVjdGFibGUgZWxlbWVudCB3aXRoIGEgZGVmYXVsdCB2YWx1ZSAqL1xuICBASW5wdXQoKSBpZDogc3RyaW5nID0gYGNkay1zZWxlY3RhYmxlLWl0ZW0tJHtuZXh0SWQrK31gO1xuXG4gIC8qKiBJZiB0aGUgZWxlbWVudCBpcyBub3QgZGlzYWJsZWQgZW1pdCB0aGUgY2xpY2sgZXZlbnQgKi9cbiAgb3ZlcnJpZGUgdHJpZ2dlcigpIHtcbiAgICBpZiAoIXRoaXMuZGlzYWJsZWQpIHtcbiAgICAgIHRoaXMudG9nZ2xlZC5uZXh0KHRoaXMpO1xuICAgIH1cbiAgfVxufVxuIl19