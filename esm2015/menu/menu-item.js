/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, Output, Input, EventEmitter } from '@angular/core';
import { CdkMenuPanel } from './menu-panel';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
/**
 * Directive which provides behavior for an element which when clicked:
 *  If located in a CdkMenuBar:
 *    - opens up an attached submenu
 *
 *  If located in a CdkMenu/CdkMenuGroup, one of:
 *    - executes the user defined click handler
 *    - toggles its checkbox state
 *    - toggles its radio button state (in relation to siblings)
 *
 * If it's in a CdkMenu and it triggers a sub-menu, hovering over the
 * CdkMenuItem will open the submenu.
 *
 */
export class CdkMenuItem {
    constructor() {
        /** ARIA role for the menu item. */
        this.role = 'menuitem';
        this._checked = false;
        /** Emits when the attached submenu is opened */
        this.opened = new EventEmitter();
    }
    /** Whether the checkbox or radiobutton is checked */
    get checked() {
        return this._checked;
    }
    set checked(value) {
        this._checked = coerceBooleanProperty(value);
    }
    /** get the aria-checked value only if element is `menuitemradio` or `menuitemcheckbox` */
    _getAriaChecked() {
        if (this.role === 'menuitem') {
            return null;
        }
        return this.checked;
    }
    /** Whether the menu item opens a menu */
    hasSubmenu() {
        return !!this._menuPanel;
    }
}
CdkMenuItem.decorators = [
    { type: Directive, args: [{
                selector: '[cdkMenuItem], [cdkMenuTriggerFor]',
                exportAs: 'cdkMenuItem',
                host: {
                    'type': 'button',
                    '[attr.role]': 'role',
                    '[attr.aria-checked]': '_getAriaChecked()',
                },
            },] }
];
CdkMenuItem.propDecorators = {
    _menuPanel: [{ type: Input, args: ['cdkMenuTriggerFor',] }],
    role: [{ type: Input }],
    checked: [{ type: Input }],
    opened: [{ type: Output }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1pdGVtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvbWVudS9tZW51LWl0ZW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFNBQVMsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLFlBQVksRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUNyRSxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sY0FBYyxDQUFDO0FBQzFDLE9BQU8sRUFBQyxxQkFBcUIsRUFBZSxNQUFNLHVCQUF1QixDQUFDO0FBRTFFOzs7Ozs7Ozs7Ozs7O0dBYUc7QUFVSCxNQUFNLE9BQU8sV0FBVztJQVR4QjtRQWFFLG1DQUFtQztRQUMxQixTQUFJLEdBQXNELFVBQVUsQ0FBQztRQVV0RSxhQUFRLEdBQUcsS0FBSyxDQUFDO1FBRXpCLGdEQUFnRDtRQUN0QyxXQUFNLEdBQXVCLElBQUksWUFBWSxFQUFFLENBQUM7SUFnQjVELENBQUM7SUEzQkMscURBQXFEO0lBQ3JELElBQ0ksT0FBTztRQUNULE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztJQUN2QixDQUFDO0lBQ0QsSUFBSSxPQUFPLENBQUMsS0FBYztRQUN4QixJQUFJLENBQUMsUUFBUSxHQUFHLHFCQUFxQixDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQy9DLENBQUM7SUFNRCwwRkFBMEY7SUFDMUYsZUFBZTtRQUNiLElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxVQUFVLEVBQUU7WUFDNUIsT0FBTyxJQUFJLENBQUM7U0FDYjtRQUNELE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQztJQUN0QixDQUFDO0lBRUQseUNBQXlDO0lBQ3pDLFVBQVU7UUFDUixPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDO0lBQzNCLENBQUM7OztZQXhDRixTQUFTLFNBQUM7Z0JBQ1QsUUFBUSxFQUFFLG9DQUFvQztnQkFDOUMsUUFBUSxFQUFFLGFBQWE7Z0JBQ3ZCLElBQUksRUFBRTtvQkFDSixNQUFNLEVBQUUsUUFBUTtvQkFDaEIsYUFBYSxFQUFFLE1BQU07b0JBQ3JCLHFCQUFxQixFQUFFLG1CQUFtQjtpQkFDM0M7YUFDRjs7O3lCQUdFLEtBQUssU0FBQyxtQkFBbUI7bUJBR3pCLEtBQUs7c0JBR0wsS0FBSztxQkFVTCxNQUFNIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RGlyZWN0aXZlLCBPdXRwdXQsIElucHV0LCBFdmVudEVtaXR0ZXJ9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtDZGtNZW51UGFuZWx9IGZyb20gJy4vbWVudS1wYW5lbCc7XG5pbXBvcnQge2NvZXJjZUJvb2xlYW5Qcm9wZXJ0eSwgQm9vbGVhbklucHV0fSBmcm9tICdAYW5ndWxhci9jZGsvY29lcmNpb24nO1xuXG4vKipcbiAqIERpcmVjdGl2ZSB3aGljaCBwcm92aWRlcyBiZWhhdmlvciBmb3IgYW4gZWxlbWVudCB3aGljaCB3aGVuIGNsaWNrZWQ6XG4gKiAgSWYgbG9jYXRlZCBpbiBhIENka01lbnVCYXI6XG4gKiAgICAtIG9wZW5zIHVwIGFuIGF0dGFjaGVkIHN1Ym1lbnVcbiAqXG4gKiAgSWYgbG9jYXRlZCBpbiBhIENka01lbnUvQ2RrTWVudUdyb3VwLCBvbmUgb2Y6XG4gKiAgICAtIGV4ZWN1dGVzIHRoZSB1c2VyIGRlZmluZWQgY2xpY2sgaGFuZGxlclxuICogICAgLSB0b2dnbGVzIGl0cyBjaGVja2JveCBzdGF0ZVxuICogICAgLSB0b2dnbGVzIGl0cyByYWRpbyBidXR0b24gc3RhdGUgKGluIHJlbGF0aW9uIHRvIHNpYmxpbmdzKVxuICpcbiAqIElmIGl0J3MgaW4gYSBDZGtNZW51IGFuZCBpdCB0cmlnZ2VycyBhIHN1Yi1tZW51LCBob3ZlcmluZyBvdmVyIHRoZVxuICogQ2RrTWVudUl0ZW0gd2lsbCBvcGVuIHRoZSBzdWJtZW51LlxuICpcbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW2Nka01lbnVJdGVtXSwgW2Nka01lbnVUcmlnZ2VyRm9yXScsXG4gIGV4cG9ydEFzOiAnY2RrTWVudUl0ZW0nLFxuICBob3N0OiB7XG4gICAgJ3R5cGUnOiAnYnV0dG9uJyxcbiAgICAnW2F0dHIucm9sZV0nOiAncm9sZScsXG4gICAgJ1thdHRyLmFyaWEtY2hlY2tlZF0nOiAnX2dldEFyaWFDaGVja2VkKCknLFxuICB9LFxufSlcbmV4cG9ydCBjbGFzcyBDZGtNZW51SXRlbSB7XG4gIC8qKiBUZW1wbGF0ZSByZWZlcmVuY2UgdmFyaWFibGUgdG8gdGhlIG1lbnUgdGhpcyB0cmlnZ2VyIG9wZW5zICovXG4gIEBJbnB1dCgnY2RrTWVudVRyaWdnZXJGb3InKSBfbWVudVBhbmVsOiBDZGtNZW51UGFuZWw7XG5cbiAgLyoqIEFSSUEgcm9sZSBmb3IgdGhlIG1lbnUgaXRlbS4gKi9cbiAgQElucHV0KCkgcm9sZTogJ21lbnVpdGVtJyB8ICdtZW51aXRlbXJhZGlvJyB8ICdtZW51aXRlbWNoZWNrYm94JyA9ICdtZW51aXRlbSc7XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGNoZWNrYm94IG9yIHJhZGlvYnV0dG9uIGlzIGNoZWNrZWQgKi9cbiAgQElucHV0KClcbiAgZ2V0IGNoZWNrZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2NoZWNrZWQ7XG4gIH1cbiAgc2V0IGNoZWNrZWQodmFsdWU6IGJvb2xlYW4pIHtcbiAgICB0aGlzLl9jaGVja2VkID0gY29lcmNlQm9vbGVhblByb3BlcnR5KHZhbHVlKTtcbiAgfVxuICBwcml2YXRlIF9jaGVja2VkID0gZmFsc2U7XG5cbiAgLyoqIEVtaXRzIHdoZW4gdGhlIGF0dGFjaGVkIHN1Ym1lbnUgaXMgb3BlbmVkICovXG4gIEBPdXRwdXQoKSBvcGVuZWQ6IEV2ZW50RW1pdHRlcjx2b2lkPiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuICAvKiogZ2V0IHRoZSBhcmlhLWNoZWNrZWQgdmFsdWUgb25seSBpZiBlbGVtZW50IGlzIGBtZW51aXRlbXJhZGlvYCBvciBgbWVudWl0ZW1jaGVja2JveGAgKi9cbiAgX2dldEFyaWFDaGVja2VkKCk6IGJvb2xlYW4gfCBudWxsIHtcbiAgICBpZiAodGhpcy5yb2xlID09PSAnbWVudWl0ZW0nKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuY2hlY2tlZDtcbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoZSBtZW51IGl0ZW0gb3BlbnMgYSBtZW51ICovXG4gIGhhc1N1Ym1lbnUoKSB7XG4gICAgcmV0dXJuICEhdGhpcy5fbWVudVBhbmVsO1xuICB9XG5cbiAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2NoZWNrZWQ6IEJvb2xlYW5JbnB1dDtcbn1cbiJdfQ==