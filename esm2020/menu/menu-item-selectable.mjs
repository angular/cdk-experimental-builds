/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { Directive, Input } from '@angular/core';
import { CdkMenuItem } from './menu-item';
import * as i0 from "@angular/core";
/** Base class providing checked state for selectable MenuItems. */
export class CdkMenuItemSelectable extends CdkMenuItem {
    constructor() {
        super(...arguments);
        this._checked = false;
        /** Whether the item should close the menu if triggered by the spacebar. */
        this.closeOnSpacebarTrigger = false;
    }
    /** Whether the element is checked */
    get checked() {
        return this._checked;
    }
    set checked(value) {
        this._checked = coerceBooleanProperty(value);
    }
}
CdkMenuItemSelectable.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.0.0-next.14", ngImport: i0, type: CdkMenuItemSelectable, deps: null, target: i0.ɵɵFactoryTarget.Directive });
CdkMenuItemSelectable.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "14.0.0-next.14", type: CdkMenuItemSelectable, inputs: { checked: ["cdkMenuItemChecked", "checked"] }, host: { properties: { "attr.aria-checked": "!!checked", "attr.aria-disabled": "disabled || null" } }, usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.0.0-next.14", ngImport: i0, type: CdkMenuItemSelectable, decorators: [{
            type: Directive,
            args: [{
                    host: {
                        '[attr.aria-checked]': '!!checked',
                        '[attr.aria-disabled]': 'disabled || null',
                    },
                }]
        }], propDecorators: { checked: [{
                type: Input,
                args: ['cdkMenuItemChecked']
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1pdGVtLXNlbGVjdGFibGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrLWV4cGVyaW1lbnRhbC9tZW51L21lbnUtaXRlbS1zZWxlY3RhYmxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBZSxxQkFBcUIsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQzFFLE9BQU8sRUFBQyxTQUFTLEVBQUUsS0FBSyxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQy9DLE9BQU8sRUFBQyxXQUFXLEVBQUMsTUFBTSxhQUFhLENBQUM7O0FBRXhDLG1FQUFtRTtBQU9uRSxNQUFNLE9BQWdCLHFCQUFzQixTQUFRLFdBQVc7SUFOL0Q7O1FBZVUsYUFBUSxHQUFHLEtBQUssQ0FBQztRQUV6QiwyRUFBMkU7UUFDeEQsMkJBQXNCLEdBQUcsS0FBSyxDQUFDO0tBQ25EO0lBWkMscUNBQXFDO0lBQ3JDLElBQ0ksT0FBTztRQUNULE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztJQUN2QixDQUFDO0lBQ0QsSUFBSSxPQUFPLENBQUMsS0FBbUI7UUFDN0IsSUFBSSxDQUFDLFFBQVEsR0FBRyxxQkFBcUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUMvQyxDQUFDOzswSEFSbUIscUJBQXFCOzhHQUFyQixxQkFBcUI7bUdBQXJCLHFCQUFxQjtrQkFOMUMsU0FBUzttQkFBQztvQkFDVCxJQUFJLEVBQUU7d0JBQ0oscUJBQXFCLEVBQUUsV0FBVzt3QkFDbEMsc0JBQXNCLEVBQUUsa0JBQWtCO3FCQUMzQztpQkFDRjs4QkFJSyxPQUFPO3NCQURWLEtBQUs7dUJBQUMsb0JBQW9CIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Qm9vbGVhbklucHV0LCBjb2VyY2VCb29sZWFuUHJvcGVydHl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2VyY2lvbic7XG5pbXBvcnQge0RpcmVjdGl2ZSwgSW5wdXR9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtDZGtNZW51SXRlbX0gZnJvbSAnLi9tZW51LWl0ZW0nO1xuXG4vKiogQmFzZSBjbGFzcyBwcm92aWRpbmcgY2hlY2tlZCBzdGF0ZSBmb3Igc2VsZWN0YWJsZSBNZW51SXRlbXMuICovXG5ARGlyZWN0aXZlKHtcbiAgaG9zdDoge1xuICAgICdbYXR0ci5hcmlhLWNoZWNrZWRdJzogJyEhY2hlY2tlZCcsXG4gICAgJ1thdHRyLmFyaWEtZGlzYWJsZWRdJzogJ2Rpc2FibGVkIHx8IG51bGwnLFxuICB9LFxufSlcbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBDZGtNZW51SXRlbVNlbGVjdGFibGUgZXh0ZW5kcyBDZGtNZW51SXRlbSB7XG4gIC8qKiBXaGV0aGVyIHRoZSBlbGVtZW50IGlzIGNoZWNrZWQgKi9cbiAgQElucHV0KCdjZGtNZW51SXRlbUNoZWNrZWQnKVxuICBnZXQgY2hlY2tlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fY2hlY2tlZDtcbiAgfVxuICBzZXQgY2hlY2tlZCh2YWx1ZTogQm9vbGVhbklucHV0KSB7XG4gICAgdGhpcy5fY2hlY2tlZCA9IGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eSh2YWx1ZSk7XG4gIH1cbiAgcHJpdmF0ZSBfY2hlY2tlZCA9IGZhbHNlO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSBpdGVtIHNob3VsZCBjbG9zZSB0aGUgbWVudSBpZiB0cmlnZ2VyZWQgYnkgdGhlIHNwYWNlYmFyLiAqL1xuICBwcm90ZWN0ZWQgb3ZlcnJpZGUgY2xvc2VPblNwYWNlYmFyVHJpZ2dlciA9IGZhbHNlO1xufVxuIl19