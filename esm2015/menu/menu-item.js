/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, Output, Input, EventEmitter } from '@angular/core';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { CdkMenuPanel } from './menu-panel';
import { CdkMenuGroup } from './menu-group';
import { takeUntil } from 'rxjs/operators';
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
        constructor(
        /** reference a parent CdkMenuGroup component */
        _menuGroup) {
            this._menuGroup = _menuGroup;
            /** ARIA role for the menu item. */
            this.role = 'menuitem';
            this._checked = false;
            this._disabled = false;
            /** Emits when the attached submenu is opened */
            this.opened = new EventEmitter();
            /** Emits when the component gets destroyed */
            this._destroyed = new EventEmitter();
        }
        /** Whether the checkbox or radiobutton is checked */
        get checked() {
            return this._checked;
        }
        set checked(value) {
            this._checked = coerceBooleanProperty(value);
        }
        /**  Whether the CdkMenuItem is disabled - defaults to false */
        get disabled() {
            return this._disabled;
        }
        set disabled(value) {
            this._disabled = coerceBooleanProperty(value);
        }
        /** Configure event subscriptions */
        ngAfterContentInit() {
            if (this.role !== 'menuitem') {
                this._menuGroup.change
                    .pipe(takeUntil(this._destroyed))
                    .subscribe((button) => this._toggleCheckedState(button));
            }
        }
        /**
         * If the role is menuitemcheckbox or menuitemradio and not disabled, emits a change event
         * on the enclosing parent MenuGroup.
         */
        trigger() {
            if (this.disabled) {
                return;
            }
            if (this.hasSubmenu()) {
                // TODO(andy): open the menu
            }
            this._menuGroup._registerTriggeredItem(this);
        }
        /** Whether the menu item opens a menu */
        hasSubmenu() {
            return !!this._menuPanel;
        }
        /** get the aria-checked value only if element is `menuitemradio` or `menuitemcheckbox` */
        _getAriaChecked() {
            if (this.role === 'menuitem') {
                return null;
            }
            return this.checked;
        }
        /**
         * Toggle the checked state of the menuitemradio or menuitemcheckbox component
         */
        _toggleCheckedState(selected) {
            if (this.role === 'menuitemradio') {
                this.checked = selected === this;
            }
            else if (this.role === 'menuitemcheckbox' && selected === this) {
                this.checked = !this.checked;
            }
        }
        ngOnDestroy() {
            this._destroyed.next();
            this._destroyed.complete();
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
                        '[attr.aria-disabled]': 'disabled || null',
                    },
                },] }
    ];
    CdkMenuItem.ctorParameters = () => [
        { type: CdkMenuGroup }
    ];
    CdkMenuItem.propDecorators = {
        _menuPanel: [{ type: Input, args: ['cdkMenuTriggerFor',] }],
        role: [{ type: Input }],
        checked: [{ type: Input }],
        disabled: [{ type: Input }],
        opened: [{ type: Output }]
    };
    return CdkMenuItem;
})();
export { CdkMenuItem };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1pdGVtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvbWVudS9tZW51LWl0ZW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFNBQVMsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFvQixZQUFZLEVBQVksTUFBTSxlQUFlLENBQUM7QUFDbEcsT0FBTyxFQUFDLHFCQUFxQixFQUFlLE1BQU0sdUJBQXVCLENBQUM7QUFDMUUsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGNBQWMsQ0FBQztBQUMxQyxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sY0FBYyxDQUFDO0FBRTFDLE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUV6Qzs7Ozs7Ozs7Ozs7OztHQWFHO0FBQ0g7SUFBQSxNQVVhLFdBQVc7UUFpQ3RCO1FBQ0UsZ0RBQWdEO1FBQy9CLFVBQXdCO1lBQXhCLGVBQVUsR0FBVixVQUFVLENBQWM7WUEvQjNDLG1DQUFtQztZQUMxQixTQUFJLEdBQXNELFVBQVUsQ0FBQztZQVV0RSxhQUFRLEdBQUcsS0FBSyxDQUFDO1lBVWpCLGNBQVMsR0FBRyxLQUFLLENBQUM7WUFFMUIsZ0RBQWdEO1lBQ3RDLFdBQU0sR0FBdUIsSUFBSSxZQUFZLEVBQUUsQ0FBQztZQUUxRCw4Q0FBOEM7WUFDN0IsZUFBVSxHQUF1QixJQUFJLFlBQVksRUFBRSxDQUFDO1FBS2xFLENBQUM7UUE3QkoscURBQXFEO1FBQ3JELElBQ0ksT0FBTztZQUNULE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztRQUN2QixDQUFDO1FBQ0QsSUFBSSxPQUFPLENBQUMsS0FBYztZQUN4QixJQUFJLENBQUMsUUFBUSxHQUFHLHFCQUFxQixDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQy9DLENBQUM7UUFHRCwrREFBK0Q7UUFDL0QsSUFDSSxRQUFRO1lBQ1YsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBQ3hCLENBQUM7UUFDRCxJQUFJLFFBQVEsQ0FBQyxLQUFjO1lBQ3pCLElBQUksQ0FBQyxTQUFTLEdBQUcscUJBQXFCLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDaEQsQ0FBQztRQWNELG9DQUFvQztRQUNwQyxrQkFBa0I7WUFDaEIsSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLFVBQVUsRUFBRTtnQkFDNUIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNO3FCQUNuQixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztxQkFDaEMsU0FBUyxDQUFDLENBQUMsTUFBZ0IsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7YUFDdEU7UUFDSCxDQUFDO1FBRUQ7OztXQUdHO1FBQ0gsT0FBTztZQUNMLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtnQkFDakIsT0FBTzthQUNSO1lBRUQsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFLEVBQUU7Z0JBQ3JCLDRCQUE0QjthQUM3QjtZQUNELElBQUksQ0FBQyxVQUFVLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDL0MsQ0FBQztRQUVELHlDQUF5QztRQUN6QyxVQUFVO1lBQ1IsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQztRQUMzQixDQUFDO1FBRUQsMEZBQTBGO1FBQzFGLGVBQWU7WUFDYixJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssVUFBVSxFQUFFO2dCQUM1QixPQUFPLElBQUksQ0FBQzthQUNiO1lBQ0QsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBQ3RCLENBQUM7UUFFRDs7V0FFRztRQUNLLG1CQUFtQixDQUFDLFFBQWtCO1lBQzVDLElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxlQUFlLEVBQUU7Z0JBQ2pDLElBQUksQ0FBQyxPQUFPLEdBQUcsUUFBUSxLQUFLLElBQUksQ0FBQzthQUNsQztpQkFBTSxJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssa0JBQWtCLElBQUksUUFBUSxLQUFLLElBQUksRUFBRTtnQkFDaEUsSUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7YUFDOUI7UUFDSCxDQUFDO1FBRUQsV0FBVztZQUNULElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDdkIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUM3QixDQUFDOzs7Z0JBbkdGLFNBQVMsU0FBQztvQkFDVCxRQUFRLEVBQUUsb0NBQW9DO29CQUM5QyxRQUFRLEVBQUUsYUFBYTtvQkFDdkIsSUFBSSxFQUFFO3dCQUNKLE1BQU0sRUFBRSxRQUFRO3dCQUNoQixhQUFhLEVBQUUsTUFBTTt3QkFDckIscUJBQXFCLEVBQUUsbUJBQW1CO3dCQUMxQyxzQkFBc0IsRUFBRSxrQkFBa0I7cUJBQzNDO2lCQUNGOzs7Z0JBM0JPLFlBQVk7Ozs2QkE4QmpCLEtBQUssU0FBQyxtQkFBbUI7dUJBR3pCLEtBQUs7MEJBR0wsS0FBSzsyQkFVTCxLQUFLO3lCQVVMLE1BQU07O0lBaUVULGtCQUFDO0tBQUE7U0E3RlksV0FBVyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0RpcmVjdGl2ZSwgT3V0cHV0LCBJbnB1dCwgQWZ0ZXJDb250ZW50SW5pdCwgRXZlbnRFbWl0dGVyLCBPbkRlc3Ryb3l9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtjb2VyY2VCb29sZWFuUHJvcGVydHksIEJvb2xlYW5JbnB1dH0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvZXJjaW9uJztcbmltcG9ydCB7Q2RrTWVudVBhbmVsfSBmcm9tICcuL21lbnUtcGFuZWwnO1xuaW1wb3J0IHtDZGtNZW51R3JvdXB9IGZyb20gJy4vbWVudS1ncm91cCc7XG5pbXBvcnQge01lbnVJdGVtfSBmcm9tICcuL21lbnUtaXRlbS1pbnRlcmZhY2UnO1xuaW1wb3J0IHt0YWtlVW50aWx9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcblxuLyoqXG4gKiBEaXJlY3RpdmUgd2hpY2ggcHJvdmlkZXMgYmVoYXZpb3IgZm9yIGFuIGVsZW1lbnQgd2hpY2ggd2hlbiBjbGlja2VkOlxuICogIElmIGxvY2F0ZWQgaW4gYSBDZGtNZW51QmFyOlxuICogICAgLSBvcGVucyB1cCBhbiBhdHRhY2hlZCBzdWJtZW51XG4gKlxuICogIElmIGxvY2F0ZWQgaW4gYSBDZGtNZW51L0Nka01lbnVHcm91cCwgb25lIG9mOlxuICogICAgLSBleGVjdXRlcyB0aGUgdXNlciBkZWZpbmVkIGNsaWNrIGhhbmRsZXJcbiAqICAgIC0gdG9nZ2xlcyBpdHMgY2hlY2tib3ggc3RhdGVcbiAqICAgIC0gdG9nZ2xlcyBpdHMgcmFkaW8gYnV0dG9uIHN0YXRlIChpbiByZWxhdGlvbiB0byBzaWJsaW5ncylcbiAqXG4gKiBJZiBpdCdzIGluIGEgQ2RrTWVudSBhbmQgaXQgdHJpZ2dlcnMgYSBzdWItbWVudSwgaG92ZXJpbmcgb3ZlciB0aGVcbiAqIENka01lbnVJdGVtIHdpbGwgb3BlbiB0aGUgc3VibWVudS5cbiAqXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tjZGtNZW51SXRlbV0sIFtjZGtNZW51VHJpZ2dlckZvcl0nLFxuICBleHBvcnRBczogJ2Nka01lbnVJdGVtJyxcbiAgaG9zdDoge1xuICAgICd0eXBlJzogJ2J1dHRvbicsXG4gICAgJ1thdHRyLnJvbGVdJzogJ3JvbGUnLFxuICAgICdbYXR0ci5hcmlhLWNoZWNrZWRdJzogJ19nZXRBcmlhQ2hlY2tlZCgpJyxcbiAgICAnW2F0dHIuYXJpYS1kaXNhYmxlZF0nOiAnZGlzYWJsZWQgfHwgbnVsbCcsXG4gIH0sXG59KVxuZXhwb3J0IGNsYXNzIENka01lbnVJdGVtIGltcGxlbWVudHMgQWZ0ZXJDb250ZW50SW5pdCwgTWVudUl0ZW0sIE9uRGVzdHJveSB7XG4gIC8qKiBUZW1wbGF0ZSByZWZlcmVuY2UgdmFyaWFibGUgdG8gdGhlIG1lbnUgdGhpcyB0cmlnZ2VyIG9wZW5zICovXG4gIEBJbnB1dCgnY2RrTWVudVRyaWdnZXJGb3InKSBfbWVudVBhbmVsPzogQ2RrTWVudVBhbmVsO1xuXG4gIC8qKiBBUklBIHJvbGUgZm9yIHRoZSBtZW51IGl0ZW0uICovXG4gIEBJbnB1dCgpIHJvbGU6ICdtZW51aXRlbScgfCAnbWVudWl0ZW1yYWRpbycgfCAnbWVudWl0ZW1jaGVja2JveCcgPSAnbWVudWl0ZW0nO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSBjaGVja2JveCBvciByYWRpb2J1dHRvbiBpcyBjaGVja2VkICovXG4gIEBJbnB1dCgpXG4gIGdldCBjaGVja2VkKCkge1xuICAgIHJldHVybiB0aGlzLl9jaGVja2VkO1xuICB9XG4gIHNldCBjaGVja2VkKHZhbHVlOiBib29sZWFuKSB7XG4gICAgdGhpcy5fY2hlY2tlZCA9IGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eSh2YWx1ZSk7XG4gIH1cbiAgcHJpdmF0ZSBfY2hlY2tlZCA9IGZhbHNlO1xuXG4gIC8qKiAgV2hldGhlciB0aGUgQ2RrTWVudUl0ZW0gaXMgZGlzYWJsZWQgLSBkZWZhdWx0cyB0byBmYWxzZSAqL1xuICBASW5wdXQoKVxuICBnZXQgZGlzYWJsZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2Rpc2FibGVkO1xuICB9XG4gIHNldCBkaXNhYmxlZCh2YWx1ZTogYm9vbGVhbikge1xuICAgIHRoaXMuX2Rpc2FibGVkID0gY29lcmNlQm9vbGVhblByb3BlcnR5KHZhbHVlKTtcbiAgfVxuICBwcml2YXRlIF9kaXNhYmxlZCA9IGZhbHNlO1xuXG4gIC8qKiBFbWl0cyB3aGVuIHRoZSBhdHRhY2hlZCBzdWJtZW51IGlzIG9wZW5lZCAqL1xuICBAT3V0cHV0KCkgb3BlbmVkOiBFdmVudEVtaXR0ZXI8dm9pZD4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG5cbiAgLyoqIEVtaXRzIHdoZW4gdGhlIGNvbXBvbmVudCBnZXRzIGRlc3Ryb3llZCAqL1xuICBwcml2YXRlIHJlYWRvbmx5IF9kZXN0cm95ZWQ6IEV2ZW50RW1pdHRlcjx2b2lkPiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAvKiogcmVmZXJlbmNlIGEgcGFyZW50IENka01lbnVHcm91cCBjb21wb25lbnQgKi9cbiAgICBwcml2YXRlIHJlYWRvbmx5IF9tZW51R3JvdXA6IENka01lbnVHcm91cFxuICApIHt9XG5cbiAgLyoqIENvbmZpZ3VyZSBldmVudCBzdWJzY3JpcHRpb25zICovXG4gIG5nQWZ0ZXJDb250ZW50SW5pdCgpIHtcbiAgICBpZiAodGhpcy5yb2xlICE9PSAnbWVudWl0ZW0nKSB7XG4gICAgICB0aGlzLl9tZW51R3JvdXAuY2hhbmdlXG4gICAgICAgIC5waXBlKHRha2VVbnRpbCh0aGlzLl9kZXN0cm95ZWQpKVxuICAgICAgICAuc3Vic2NyaWJlKChidXR0b246IE1lbnVJdGVtKSA9PiB0aGlzLl90b2dnbGVDaGVja2VkU3RhdGUoYnV0dG9uKSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIElmIHRoZSByb2xlIGlzIG1lbnVpdGVtY2hlY2tib3ggb3IgbWVudWl0ZW1yYWRpbyBhbmQgbm90IGRpc2FibGVkLCBlbWl0cyBhIGNoYW5nZSBldmVudFxuICAgKiBvbiB0aGUgZW5jbG9zaW5nIHBhcmVudCBNZW51R3JvdXAuXG4gICAqL1xuICB0cmlnZ2VyKCkge1xuICAgIGlmICh0aGlzLmRpc2FibGVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuaGFzU3VibWVudSgpKSB7XG4gICAgICAvLyBUT0RPKGFuZHkpOiBvcGVuIHRoZSBtZW51XG4gICAgfVxuICAgIHRoaXMuX21lbnVHcm91cC5fcmVnaXN0ZXJUcmlnZ2VyZWRJdGVtKHRoaXMpO1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhlIG1lbnUgaXRlbSBvcGVucyBhIG1lbnUgKi9cbiAgaGFzU3VibWVudSgpIHtcbiAgICByZXR1cm4gISF0aGlzLl9tZW51UGFuZWw7XG4gIH1cblxuICAvKiogZ2V0IHRoZSBhcmlhLWNoZWNrZWQgdmFsdWUgb25seSBpZiBlbGVtZW50IGlzIGBtZW51aXRlbXJhZGlvYCBvciBgbWVudWl0ZW1jaGVja2JveGAgKi9cbiAgX2dldEFyaWFDaGVja2VkKCk6IGJvb2xlYW4gfCBudWxsIHtcbiAgICBpZiAodGhpcy5yb2xlID09PSAnbWVudWl0ZW0nKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuY2hlY2tlZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBUb2dnbGUgdGhlIGNoZWNrZWQgc3RhdGUgb2YgdGhlIG1lbnVpdGVtcmFkaW8gb3IgbWVudWl0ZW1jaGVja2JveCBjb21wb25lbnRcbiAgICovXG4gIHByaXZhdGUgX3RvZ2dsZUNoZWNrZWRTdGF0ZShzZWxlY3RlZDogTWVudUl0ZW0pIHtcbiAgICBpZiAodGhpcy5yb2xlID09PSAnbWVudWl0ZW1yYWRpbycpIHtcbiAgICAgIHRoaXMuY2hlY2tlZCA9IHNlbGVjdGVkID09PSB0aGlzO1xuICAgIH0gZWxzZSBpZiAodGhpcy5yb2xlID09PSAnbWVudWl0ZW1jaGVja2JveCcgJiYgc2VsZWN0ZWQgPT09IHRoaXMpIHtcbiAgICAgIHRoaXMuY2hlY2tlZCA9ICF0aGlzLmNoZWNrZWQ7XG4gICAgfVxuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgdGhpcy5fZGVzdHJveWVkLm5leHQoKTtcbiAgICB0aGlzLl9kZXN0cm95ZWQuY29tcGxldGUoKTtcbiAgfVxuXG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9jaGVja2VkOiBCb29sZWFuSW5wdXQ7XG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9kaXNhYmxlZDogQm9vbGVhbklucHV0O1xufVxuIl19