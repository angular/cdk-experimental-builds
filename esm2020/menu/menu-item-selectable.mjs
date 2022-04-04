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
/**
 * Base class providing checked state for MenuItems along with outputting a clicked event when the
 * element is triggered. It provides functionality for selectable elements.
 */
export class CdkMenuItemSelectable extends CdkMenuItem {
    constructor() {
        super(...arguments);
        this._checked = false;
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
CdkMenuItemSelectable.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.0.0-next.9", ngImport: i0, type: CdkMenuItemSelectable, deps: null, target: i0.ɵɵFactoryTarget.Directive });
CdkMenuItemSelectable.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "14.0.0-next.9", type: CdkMenuItemSelectable, inputs: { checked: ["cdkMenuItemChecked", "checked"] }, host: { properties: { "attr.aria-checked": "!!checked", "attr.aria-disabled": "disabled || null" } }, usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.0.0-next.9", ngImport: i0, type: CdkMenuItemSelectable, decorators: [{
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1pdGVtLXNlbGVjdGFibGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrLWV4cGVyaW1lbnRhbC9tZW51L21lbnUtaXRlbS1zZWxlY3RhYmxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBZSxxQkFBcUIsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQzFFLE9BQU8sRUFBQyxTQUFTLEVBQUUsS0FBSyxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQy9DLE9BQU8sRUFBQyxXQUFXLEVBQUMsTUFBTSxhQUFhLENBQUM7O0FBRXhDOzs7R0FHRztBQU9ILE1BQU0sT0FBZ0IscUJBQXNCLFNBQVEsV0FBVztJQU4vRDs7UUFlVSxhQUFRLEdBQUcsS0FBSyxDQUFDO1FBRU4sMkJBQXNCLEdBQUcsS0FBSyxDQUFDO0tBQ25EO0lBWEMscUNBQXFDO0lBQ3JDLElBQ0ksT0FBTztRQUNULE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztJQUN2QixDQUFDO0lBQ0QsSUFBSSxPQUFPLENBQUMsS0FBbUI7UUFDN0IsSUFBSSxDQUFDLFFBQVEsR0FBRyxxQkFBcUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUMvQyxDQUFDOzt5SEFSbUIscUJBQXFCOzZHQUFyQixxQkFBcUI7a0dBQXJCLHFCQUFxQjtrQkFOMUMsU0FBUzttQkFBQztvQkFDVCxJQUFJLEVBQUU7d0JBQ0oscUJBQXFCLEVBQUUsV0FBVzt3QkFDbEMsc0JBQXNCLEVBQUUsa0JBQWtCO3FCQUMzQztpQkFDRjs4QkFJSyxPQUFPO3NCQURWLEtBQUs7dUJBQUMsb0JBQW9CIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Qm9vbGVhbklucHV0LCBjb2VyY2VCb29sZWFuUHJvcGVydHl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2VyY2lvbic7XG5pbXBvcnQge0RpcmVjdGl2ZSwgSW5wdXR9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtDZGtNZW51SXRlbX0gZnJvbSAnLi9tZW51LWl0ZW0nO1xuXG4vKipcbiAqIEJhc2UgY2xhc3MgcHJvdmlkaW5nIGNoZWNrZWQgc3RhdGUgZm9yIE1lbnVJdGVtcyBhbG9uZyB3aXRoIG91dHB1dHRpbmcgYSBjbGlja2VkIGV2ZW50IHdoZW4gdGhlXG4gKiBlbGVtZW50IGlzIHRyaWdnZXJlZC4gSXQgcHJvdmlkZXMgZnVuY3Rpb25hbGl0eSBmb3Igc2VsZWN0YWJsZSBlbGVtZW50cy5cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIGhvc3Q6IHtcbiAgICAnW2F0dHIuYXJpYS1jaGVja2VkXSc6ICchIWNoZWNrZWQnLFxuICAgICdbYXR0ci5hcmlhLWRpc2FibGVkXSc6ICdkaXNhYmxlZCB8fCBudWxsJyxcbiAgfSxcbn0pXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQ2RrTWVudUl0ZW1TZWxlY3RhYmxlIGV4dGVuZHMgQ2RrTWVudUl0ZW0ge1xuICAvKiogV2hldGhlciB0aGUgZWxlbWVudCBpcyBjaGVja2VkICovXG4gIEBJbnB1dCgnY2RrTWVudUl0ZW1DaGVja2VkJylcbiAgZ2V0IGNoZWNrZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2NoZWNrZWQ7XG4gIH1cbiAgc2V0IGNoZWNrZWQodmFsdWU6IEJvb2xlYW5JbnB1dCkge1xuICAgIHRoaXMuX2NoZWNrZWQgPSBjb2VyY2VCb29sZWFuUHJvcGVydHkodmFsdWUpO1xuICB9XG4gIHByaXZhdGUgX2NoZWNrZWQgPSBmYWxzZTtcblxuICBwcm90ZWN0ZWQgb3ZlcnJpZGUgY2xvc2VPblNwYWNlYmFyVHJpZ2dlciA9IGZhbHNlO1xufVxuIl19