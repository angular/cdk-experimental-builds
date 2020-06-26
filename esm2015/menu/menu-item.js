/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, Input, Optional, Self } from '@angular/core';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { CdkMenuItemTrigger } from './menu-item-trigger';
/**
 * Directive which provides the ability for an element to be focused and navigated to using the
 * keyboard when residing in a CdkMenu, CdkMenuBar, or CdkMenuGroup. It performs user defined
 * behavior when clicked.
 */
let CdkMenuItem = /** @class */ (() => {
    class CdkMenuItem {
        constructor(
        /** Reference to the CdkMenuItemTrigger directive if one is added to the same element */
        _menuTrigger) {
            this._menuTrigger = _menuTrigger;
            this._disabled = false;
        }
        /**  Whether the CdkMenuItem is disabled - defaults to false */
        get disabled() {
            return this._disabled;
        }
        set disabled(value) {
            this._disabled = coerceBooleanProperty(value);
        }
        /** Open the menu if one is attached */
        trigger() {
            if (!this.disabled && this.hasMenu()) {
                this._menuTrigger.toggle();
            }
        }
        /** Whether the menu item opens a menu. */
        hasMenu() {
            return !!this._menuTrigger && this._menuTrigger.hasMenu();
        }
    }
    CdkMenuItem.decorators = [
        { type: Directive, args: [{
                    selector: '[cdkMenuItem]',
                    exportAs: 'cdkMenuItem',
                    host: {
                        'type': 'button',
                        'role': 'menuitem',
                        '[attr.aria-disabled]': 'disabled || null',
                    },
                },] }
    ];
    CdkMenuItem.ctorParameters = () => [
        { type: CdkMenuItemTrigger, decorators: [{ type: Self }, { type: Optional }] }
    ];
    CdkMenuItem.propDecorators = {
        disabled: [{ type: Input }]
    };
    return CdkMenuItem;
})();
export { CdkMenuItem };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1pdGVtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvbWVudS9tZW51LWl0ZW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFNBQVMsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUMvRCxPQUFPLEVBQUMscUJBQXFCLEVBQWUsTUFBTSx1QkFBdUIsQ0FBQztBQUMxRSxPQUFPLEVBQUMsa0JBQWtCLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUV2RDs7OztHQUlHO0FBQ0g7SUFBQSxNQVNhLFdBQVc7UUFXdEI7UUFDRSx3RkFBd0Y7UUFDbkQsWUFBaUM7WUFBakMsaUJBQVksR0FBWixZQUFZLENBQXFCO1lBSmhFLGNBQVMsR0FBRyxLQUFLLENBQUM7UUFLdkIsQ0FBQztRQWJKLCtEQUErRDtRQUMvRCxJQUNJLFFBQVE7WUFDVixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUM7UUFDeEIsQ0FBQztRQUNELElBQUksUUFBUSxDQUFDLEtBQWM7WUFDekIsSUFBSSxDQUFDLFNBQVMsR0FBRyxxQkFBcUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNoRCxDQUFDO1FBUUQsdUNBQXVDO1FBQ3ZDLE9BQU87WUFDTCxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUU7Z0JBQ3BDLElBQUksQ0FBQyxZQUFhLENBQUMsTUFBTSxFQUFFLENBQUM7YUFDN0I7UUFDSCxDQUFDO1FBRUQsMENBQTBDO1FBQzFDLE9BQU87WUFDTCxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDNUQsQ0FBQzs7O2dCQW5DRixTQUFTLFNBQUM7b0JBQ1QsUUFBUSxFQUFFLGVBQWU7b0JBQ3pCLFFBQVEsRUFBRSxhQUFhO29CQUN2QixJQUFJLEVBQUU7d0JBQ0osTUFBTSxFQUFFLFFBQVE7d0JBQ2hCLE1BQU0sRUFBRSxVQUFVO3dCQUNsQixzQkFBc0IsRUFBRSxrQkFBa0I7cUJBQzNDO2lCQUNGOzs7Z0JBZk8sa0JBQWtCLHVCQTZCckIsSUFBSSxZQUFJLFFBQVE7OzsyQkFYbEIsS0FBSzs7SUEyQlIsa0JBQUM7S0FBQTtTQTdCWSxXQUFXIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RGlyZWN0aXZlLCBJbnB1dCwgT3B0aW9uYWwsIFNlbGZ9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtjb2VyY2VCb29sZWFuUHJvcGVydHksIEJvb2xlYW5JbnB1dH0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvZXJjaW9uJztcbmltcG9ydCB7Q2RrTWVudUl0ZW1UcmlnZ2VyfSBmcm9tICcuL21lbnUtaXRlbS10cmlnZ2VyJztcblxuLyoqXG4gKiBEaXJlY3RpdmUgd2hpY2ggcHJvdmlkZXMgdGhlIGFiaWxpdHkgZm9yIGFuIGVsZW1lbnQgdG8gYmUgZm9jdXNlZCBhbmQgbmF2aWdhdGVkIHRvIHVzaW5nIHRoZVxuICoga2V5Ym9hcmQgd2hlbiByZXNpZGluZyBpbiBhIENka01lbnUsIENka01lbnVCYXIsIG9yIENka01lbnVHcm91cC4gSXQgcGVyZm9ybXMgdXNlciBkZWZpbmVkXG4gKiBiZWhhdmlvciB3aGVuIGNsaWNrZWQuXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tjZGtNZW51SXRlbV0nLFxuICBleHBvcnRBczogJ2Nka01lbnVJdGVtJyxcbiAgaG9zdDoge1xuICAgICd0eXBlJzogJ2J1dHRvbicsXG4gICAgJ3JvbGUnOiAnbWVudWl0ZW0nLFxuICAgICdbYXR0ci5hcmlhLWRpc2FibGVkXSc6ICdkaXNhYmxlZCB8fCBudWxsJyxcbiAgfSxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrTWVudUl0ZW0ge1xuICAvKiogIFdoZXRoZXIgdGhlIENka01lbnVJdGVtIGlzIGRpc2FibGVkIC0gZGVmYXVsdHMgdG8gZmFsc2UgKi9cbiAgQElucHV0KClcbiAgZ2V0IGRpc2FibGVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9kaXNhYmxlZDtcbiAgfVxuICBzZXQgZGlzYWJsZWQodmFsdWU6IGJvb2xlYW4pIHtcbiAgICB0aGlzLl9kaXNhYmxlZCA9IGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eSh2YWx1ZSk7XG4gIH1cbiAgcHJpdmF0ZSBfZGlzYWJsZWQgPSBmYWxzZTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAvKiogUmVmZXJlbmNlIHRvIHRoZSBDZGtNZW51SXRlbVRyaWdnZXIgZGlyZWN0aXZlIGlmIG9uZSBpcyBhZGRlZCB0byB0aGUgc2FtZSBlbGVtZW50ICovXG4gICAgQFNlbGYoKSBAT3B0aW9uYWwoKSBwcml2YXRlIHJlYWRvbmx5IF9tZW51VHJpZ2dlcj86IENka01lbnVJdGVtVHJpZ2dlclxuICApIHt9XG5cbiAgLyoqIE9wZW4gdGhlIG1lbnUgaWYgb25lIGlzIGF0dGFjaGVkICovXG4gIHRyaWdnZXIoKSB7XG4gICAgaWYgKCF0aGlzLmRpc2FibGVkICYmIHRoaXMuaGFzTWVudSgpKSB7XG4gICAgICB0aGlzLl9tZW51VHJpZ2dlciEudG9nZ2xlKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhlIG1lbnUgaXRlbSBvcGVucyBhIG1lbnUuICovXG4gIGhhc01lbnUoKSB7XG4gICAgcmV0dXJuICEhdGhpcy5fbWVudVRyaWdnZXIgJiYgdGhpcy5fbWVudVRyaWdnZXIuaGFzTWVudSgpO1xuICB9XG5cbiAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2Rpc2FibGVkOiBCb29sZWFuSW5wdXQ7XG59XG4iXX0=