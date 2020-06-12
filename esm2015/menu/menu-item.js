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
let CdkMenuItem = /** @class */ (() => {
    class CdkMenuItem {
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
    return CdkMenuItem;
})();
export { CdkMenuItem };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1pdGVtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvbWVudS9tZW51LWl0ZW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFNBQVMsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLFlBQVksRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUNyRSxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sY0FBYyxDQUFDO0FBQzFDLE9BQU8sRUFBQyxxQkFBcUIsRUFBZSxNQUFNLHVCQUF1QixDQUFDO0FBRTFFOzs7Ozs7Ozs7Ozs7O0dBYUc7QUFDSDtJQUFBLE1BU2EsV0FBVztRQVR4QjtZQWFFLG1DQUFtQztZQUMxQixTQUFJLEdBQXNELFVBQVUsQ0FBQztZQVV0RSxhQUFRLEdBQUcsS0FBSyxDQUFDO1lBRXpCLGdEQUFnRDtZQUN0QyxXQUFNLEdBQXVCLElBQUksWUFBWSxFQUFFLENBQUM7UUFnQjVELENBQUM7UUEzQkMscURBQXFEO1FBQ3JELElBQ0ksT0FBTztZQUNULE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztRQUN2QixDQUFDO1FBQ0QsSUFBSSxPQUFPLENBQUMsS0FBYztZQUN4QixJQUFJLENBQUMsUUFBUSxHQUFHLHFCQUFxQixDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQy9DLENBQUM7UUFNRCwwRkFBMEY7UUFDMUYsZUFBZTtZQUNiLElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxVQUFVLEVBQUU7Z0JBQzVCLE9BQU8sSUFBSSxDQUFDO2FBQ2I7WUFDRCxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUM7UUFDdEIsQ0FBQztRQUVELHlDQUF5QztRQUN6QyxVQUFVO1lBQ1IsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQztRQUMzQixDQUFDOzs7Z0JBeENGLFNBQVMsU0FBQztvQkFDVCxRQUFRLEVBQUUsb0NBQW9DO29CQUM5QyxRQUFRLEVBQUUsYUFBYTtvQkFDdkIsSUFBSSxFQUFFO3dCQUNKLE1BQU0sRUFBRSxRQUFRO3dCQUNoQixhQUFhLEVBQUUsTUFBTTt3QkFDckIscUJBQXFCLEVBQUUsbUJBQW1CO3FCQUMzQztpQkFDRjs7OzZCQUdFLEtBQUssU0FBQyxtQkFBbUI7dUJBR3pCLEtBQUs7MEJBR0wsS0FBSzt5QkFVTCxNQUFNOztJQWdCVCxrQkFBQztLQUFBO1NBbENZLFdBQVciLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtEaXJlY3RpdmUsIE91dHB1dCwgSW5wdXQsIEV2ZW50RW1pdHRlcn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0Nka01lbnVQYW5lbH0gZnJvbSAnLi9tZW51LXBhbmVsJztcbmltcG9ydCB7Y29lcmNlQm9vbGVhblByb3BlcnR5LCBCb29sZWFuSW5wdXR9IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2VyY2lvbic7XG5cbi8qKlxuICogRGlyZWN0aXZlIHdoaWNoIHByb3ZpZGVzIGJlaGF2aW9yIGZvciBhbiBlbGVtZW50IHdoaWNoIHdoZW4gY2xpY2tlZDpcbiAqICBJZiBsb2NhdGVkIGluIGEgQ2RrTWVudUJhcjpcbiAqICAgIC0gb3BlbnMgdXAgYW4gYXR0YWNoZWQgc3VibWVudVxuICpcbiAqICBJZiBsb2NhdGVkIGluIGEgQ2RrTWVudS9DZGtNZW51R3JvdXAsIG9uZSBvZjpcbiAqICAgIC0gZXhlY3V0ZXMgdGhlIHVzZXIgZGVmaW5lZCBjbGljayBoYW5kbGVyXG4gKiAgICAtIHRvZ2dsZXMgaXRzIGNoZWNrYm94IHN0YXRlXG4gKiAgICAtIHRvZ2dsZXMgaXRzIHJhZGlvIGJ1dHRvbiBzdGF0ZSAoaW4gcmVsYXRpb24gdG8gc2libGluZ3MpXG4gKlxuICogSWYgaXQncyBpbiBhIENka01lbnUgYW5kIGl0IHRyaWdnZXJzIGEgc3ViLW1lbnUsIGhvdmVyaW5nIG92ZXIgdGhlXG4gKiBDZGtNZW51SXRlbSB3aWxsIG9wZW4gdGhlIHN1Ym1lbnUuXG4gKlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbY2RrTWVudUl0ZW1dLCBbY2RrTWVudVRyaWdnZXJGb3JdJyxcbiAgZXhwb3J0QXM6ICdjZGtNZW51SXRlbScsXG4gIGhvc3Q6IHtcbiAgICAndHlwZSc6ICdidXR0b24nLFxuICAgICdbYXR0ci5yb2xlXSc6ICdyb2xlJyxcbiAgICAnW2F0dHIuYXJpYS1jaGVja2VkXSc6ICdfZ2V0QXJpYUNoZWNrZWQoKScsXG4gIH0sXG59KVxuZXhwb3J0IGNsYXNzIENka01lbnVJdGVtIHtcbiAgLyoqIFRlbXBsYXRlIHJlZmVyZW5jZSB2YXJpYWJsZSB0byB0aGUgbWVudSB0aGlzIHRyaWdnZXIgb3BlbnMgKi9cbiAgQElucHV0KCdjZGtNZW51VHJpZ2dlckZvcicpIF9tZW51UGFuZWw6IENka01lbnVQYW5lbDtcblxuICAvKiogQVJJQSByb2xlIGZvciB0aGUgbWVudSBpdGVtLiAqL1xuICBASW5wdXQoKSByb2xlOiAnbWVudWl0ZW0nIHwgJ21lbnVpdGVtcmFkaW8nIHwgJ21lbnVpdGVtY2hlY2tib3gnID0gJ21lbnVpdGVtJztcblxuICAvKiogV2hldGhlciB0aGUgY2hlY2tib3ggb3IgcmFkaW9idXR0b24gaXMgY2hlY2tlZCAqL1xuICBASW5wdXQoKVxuICBnZXQgY2hlY2tlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5fY2hlY2tlZDtcbiAgfVxuICBzZXQgY2hlY2tlZCh2YWx1ZTogYm9vbGVhbikge1xuICAgIHRoaXMuX2NoZWNrZWQgPSBjb2VyY2VCb29sZWFuUHJvcGVydHkodmFsdWUpO1xuICB9XG4gIHByaXZhdGUgX2NoZWNrZWQgPSBmYWxzZTtcblxuICAvKiogRW1pdHMgd2hlbiB0aGUgYXR0YWNoZWQgc3VibWVudSBpcyBvcGVuZWQgKi9cbiAgQE91dHB1dCgpIG9wZW5lZDogRXZlbnRFbWl0dGVyPHZvaWQ+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4gIC8qKiBnZXQgdGhlIGFyaWEtY2hlY2tlZCB2YWx1ZSBvbmx5IGlmIGVsZW1lbnQgaXMgYG1lbnVpdGVtcmFkaW9gIG9yIGBtZW51aXRlbWNoZWNrYm94YCAqL1xuICBfZ2V0QXJpYUNoZWNrZWQoKTogYm9vbGVhbiB8IG51bGwge1xuICAgIGlmICh0aGlzLnJvbGUgPT09ICdtZW51aXRlbScpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5jaGVja2VkO1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhlIG1lbnUgaXRlbSBvcGVucyBhIG1lbnUgKi9cbiAgaGFzU3VibWVudSgpIHtcbiAgICByZXR1cm4gISF0aGlzLl9tZW51UGFuZWw7XG4gIH1cblxuICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfY2hlY2tlZDogQm9vbGVhbklucHV0O1xufVxuIl19