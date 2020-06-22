/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive } from '@angular/core';
import { CdkMenuItemSelectable } from './menu-item-selectable';
/**
 * A directive providing behavior for the "menuitemcheckbox" ARIA role, which behaves similarly to a
 * conventional checkbox.
 */
let CdkMenuItemCheckbox = /** @class */ (() => {
    class CdkMenuItemCheckbox extends CdkMenuItemSelectable {
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
                        '(click)': 'trigger()',
                        'type': 'button',
                        'role': 'menuitemcheckbox',
                        '[attr.aria-checked]': 'checked || null',
                        '[attr.aria-disabled]': 'disabled || null',
                    },
                    providers: [{ provide: CdkMenuItemSelectable, useExisting: CdkMenuItemCheckbox }],
                },] }
    ];
    return CdkMenuItemCheckbox;
})();
export { CdkMenuItemCheckbox };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1pdGVtLWNoZWNrYm94LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvbWVudS9tZW51LWl0ZW0tY2hlY2tib3gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUN4QyxPQUFPLEVBQUMscUJBQXFCLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQztBQUU3RDs7O0dBR0c7QUFDSDtJQUFBLE1BWWEsbUJBQW9CLFNBQVEscUJBQXFCO1FBQzVELE9BQU87WUFDTCxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7WUFFaEIsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUU7Z0JBQ2xCLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO2FBQzlCO1FBQ0gsQ0FBQzs7O2dCQW5CRixTQUFTLFNBQUM7b0JBQ1QsUUFBUSxFQUFFLHVCQUF1QjtvQkFDakMsUUFBUSxFQUFFLHFCQUFxQjtvQkFDL0IsSUFBSSxFQUFFO3dCQUNKLFNBQVMsRUFBRSxXQUFXO3dCQUN0QixNQUFNLEVBQUUsUUFBUTt3QkFDaEIsTUFBTSxFQUFFLGtCQUFrQjt3QkFDMUIscUJBQXFCLEVBQUUsaUJBQWlCO3dCQUN4QyxzQkFBc0IsRUFBRSxrQkFBa0I7cUJBQzNDO29CQUNELFNBQVMsRUFBRSxDQUFDLEVBQUMsT0FBTyxFQUFFLHFCQUFxQixFQUFFLFdBQVcsRUFBRSxtQkFBbUIsRUFBQyxDQUFDO2lCQUNoRjs7SUFTRCwwQkFBQztLQUFBO1NBUlksbUJBQW1CIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RGlyZWN0aXZlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7Q2RrTWVudUl0ZW1TZWxlY3RhYmxlfSBmcm9tICcuL21lbnUtaXRlbS1zZWxlY3RhYmxlJztcblxuLyoqXG4gKiBBIGRpcmVjdGl2ZSBwcm92aWRpbmcgYmVoYXZpb3IgZm9yIHRoZSBcIm1lbnVpdGVtY2hlY2tib3hcIiBBUklBIHJvbGUsIHdoaWNoIGJlaGF2ZXMgc2ltaWxhcmx5IHRvIGFcbiAqIGNvbnZlbnRpb25hbCBjaGVja2JveC5cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW2Nka01lbnVJdGVtQ2hlY2tib3hdJyxcbiAgZXhwb3J0QXM6ICdjZGtNZW51SXRlbUNoZWNrYm94JyxcbiAgaG9zdDoge1xuICAgICcoY2xpY2spJzogJ3RyaWdnZXIoKScsXG4gICAgJ3R5cGUnOiAnYnV0dG9uJyxcbiAgICAncm9sZSc6ICdtZW51aXRlbWNoZWNrYm94JyxcbiAgICAnW2F0dHIuYXJpYS1jaGVja2VkXSc6ICdjaGVja2VkIHx8IG51bGwnLFxuICAgICdbYXR0ci5hcmlhLWRpc2FibGVkXSc6ICdkaXNhYmxlZCB8fCBudWxsJyxcbiAgfSxcbiAgcHJvdmlkZXJzOiBbe3Byb3ZpZGU6IENka01lbnVJdGVtU2VsZWN0YWJsZSwgdXNlRXhpc3Rpbmc6IENka01lbnVJdGVtQ2hlY2tib3h9XSxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrTWVudUl0ZW1DaGVja2JveCBleHRlbmRzIENka01lbnVJdGVtU2VsZWN0YWJsZSB7XG4gIHRyaWdnZXIoKSB7XG4gICAgc3VwZXIudHJpZ2dlcigpO1xuXG4gICAgaWYgKCF0aGlzLmRpc2FibGVkKSB7XG4gICAgICB0aGlzLmNoZWNrZWQgPSAhdGhpcy5jaGVja2VkO1xuICAgIH1cbiAgfVxufVxuIl19