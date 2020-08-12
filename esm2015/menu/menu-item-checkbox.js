/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive } from '@angular/core';
import { CdkMenuItemSelectable } from './menu-item-selectable';
import { CdkMenuItem } from './menu-item';
/**
 * A directive providing behavior for the "menuitemcheckbox" ARIA role, which behaves similarly to a
 * conventional checkbox.
 */
export class CdkMenuItemCheckbox extends CdkMenuItemSelectable {
    /** Toggle the checked state of the checkbox. */
    trigger() {
        super.trigger();
        if (!this.disabled) {
            this.checked = !this.checked;
        }
    }
}
CdkMenuItemCheckbox.decorators = [
    { type: Directive, args: [{
                selector: '[cdkMenuItemCheckbox]',
                exportAs: 'cdkMenuItemCheckbox',
                host: {
                    'type': 'button',
                    'role': 'menuitemcheckbox',
                    '[attr.aria-checked]': 'checked || null',
                    '[attr.aria-disabled]': 'disabled || null',
                },
                providers: [
                    { provide: CdkMenuItemSelectable, useExisting: CdkMenuItemCheckbox },
                    { provide: CdkMenuItem, useExisting: CdkMenuItemSelectable },
                ],
            },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1pdGVtLWNoZWNrYm94LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvbWVudS9tZW51LWl0ZW0tY2hlY2tib3gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUN4QyxPQUFPLEVBQUMscUJBQXFCLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQztBQUM3RCxPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0sYUFBYSxDQUFDO0FBRXhDOzs7R0FHRztBQWVILE1BQU0sT0FBTyxtQkFBb0IsU0FBUSxxQkFBcUI7SUFDNUQsZ0RBQWdEO0lBQ2hELE9BQU87UUFDTCxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7UUFFaEIsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDbEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7U0FDOUI7SUFDSCxDQUFDOzs7WUF0QkYsU0FBUyxTQUFDO2dCQUNULFFBQVEsRUFBRSx1QkFBdUI7Z0JBQ2pDLFFBQVEsRUFBRSxxQkFBcUI7Z0JBQy9CLElBQUksRUFBRTtvQkFDSixNQUFNLEVBQUUsUUFBUTtvQkFDaEIsTUFBTSxFQUFFLGtCQUFrQjtvQkFDMUIscUJBQXFCLEVBQUUsaUJBQWlCO29CQUN4QyxzQkFBc0IsRUFBRSxrQkFBa0I7aUJBQzNDO2dCQUNELFNBQVMsRUFBRTtvQkFDVCxFQUFDLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxXQUFXLEVBQUUsbUJBQW1CLEVBQUM7b0JBQ2xFLEVBQUMsT0FBTyxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUscUJBQXFCLEVBQUM7aUJBQzNEO2FBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtEaXJlY3RpdmV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtDZGtNZW51SXRlbVNlbGVjdGFibGV9IGZyb20gJy4vbWVudS1pdGVtLXNlbGVjdGFibGUnO1xuaW1wb3J0IHtDZGtNZW51SXRlbX0gZnJvbSAnLi9tZW51LWl0ZW0nO1xuXG4vKipcbiAqIEEgZGlyZWN0aXZlIHByb3ZpZGluZyBiZWhhdmlvciBmb3IgdGhlIFwibWVudWl0ZW1jaGVja2JveFwiIEFSSUEgcm9sZSwgd2hpY2ggYmVoYXZlcyBzaW1pbGFybHkgdG8gYVxuICogY29udmVudGlvbmFsIGNoZWNrYm94LlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbY2RrTWVudUl0ZW1DaGVja2JveF0nLFxuICBleHBvcnRBczogJ2Nka01lbnVJdGVtQ2hlY2tib3gnLFxuICBob3N0OiB7XG4gICAgJ3R5cGUnOiAnYnV0dG9uJyxcbiAgICAncm9sZSc6ICdtZW51aXRlbWNoZWNrYm94JyxcbiAgICAnW2F0dHIuYXJpYS1jaGVja2VkXSc6ICdjaGVja2VkIHx8IG51bGwnLFxuICAgICdbYXR0ci5hcmlhLWRpc2FibGVkXSc6ICdkaXNhYmxlZCB8fCBudWxsJyxcbiAgfSxcbiAgcHJvdmlkZXJzOiBbXG4gICAge3Byb3ZpZGU6IENka01lbnVJdGVtU2VsZWN0YWJsZSwgdXNlRXhpc3Rpbmc6IENka01lbnVJdGVtQ2hlY2tib3h9LFxuICAgIHtwcm92aWRlOiBDZGtNZW51SXRlbSwgdXNlRXhpc3Rpbmc6IENka01lbnVJdGVtU2VsZWN0YWJsZX0sXG4gIF0sXG59KVxuZXhwb3J0IGNsYXNzIENka01lbnVJdGVtQ2hlY2tib3ggZXh0ZW5kcyBDZGtNZW51SXRlbVNlbGVjdGFibGUge1xuICAvKiogVG9nZ2xlIHRoZSBjaGVja2VkIHN0YXRlIG9mIHRoZSBjaGVja2JveC4gKi9cbiAgdHJpZ2dlcigpIHtcbiAgICBzdXBlci50cmlnZ2VyKCk7XG5cbiAgICBpZiAoIXRoaXMuZGlzYWJsZWQpIHtcbiAgICAgIHRoaXMuY2hlY2tlZCA9ICF0aGlzLmNoZWNrZWQ7XG4gICAgfVxuICB9XG59XG4iXX0=