/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, Input, Self, Optional } from '@angular/core';
import { CdkMenuPanel } from './menu-panel';
import { CdkMenuItem } from './menu-item';
/**
 * A directive to be combined with CdkMenuItem which opens the Menu it is bound to. If the
 * element is in a top level MenuBar it will open the menu on click, or if a sibling is already
 * opened it will open on hover. If it is inside of a Menu it will open the attached Submenu on
 * hover regardless of its sibling state.
 *
 * The directive must be placed along with the `cdkMenuItem` directive in order to enable full
 * functionality.
 */
let CdkMenuItemTrigger = /** @class */ (() => {
    class CdkMenuItemTrigger {
        constructor(
        /** The MenuItem instance which is the trigger  */
        _menuItemInstance) {
            this._menuItemInstance = _menuItemInstance;
        }
        ngAfterContentInit() {
            this._setHasSubmenu();
        }
        /** Set the hasSubmenu property on the menuitem  */
        _setHasSubmenu() {
            if (this._menuItemInstance) {
                this._menuItemInstance.hasSubmenu = this._hasSubmenu();
            }
        }
        /** Return true if the trigger has an attached menu */
        _hasSubmenu() {
            return !!this._menuPanel;
        }
    }
    CdkMenuItemTrigger.decorators = [
        { type: Directive, args: [{
                    selector: '[cdkMenuItem][cdkMenuTriggerFor]',
                    exportAs: 'cdkMenuTriggerFor',
                    host: {
                        'aria-haspopup': 'menu',
                    },
                },] }
    ];
    CdkMenuItemTrigger.ctorParameters = () => [
        { type: CdkMenuItem, decorators: [{ type: Self }, { type: Optional }] }
    ];
    CdkMenuItemTrigger.propDecorators = {
        _menuPanel: [{ type: Input, args: ['cdkMenuTriggerFor',] }]
    };
    return CdkMenuItemTrigger;
})();
export { CdkMenuItemTrigger };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1pdGVtLXRyaWdnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrLWV4cGVyaW1lbnRhbC9tZW51L21lbnUtaXRlbS10cmlnZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxTQUFTLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQW1CLE1BQU0sZUFBZSxDQUFDO0FBQ2pGLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFDMUMsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLGFBQWEsQ0FBQztBQUV4Qzs7Ozs7Ozs7R0FRRztBQUNIO0lBQUEsTUFPYSxrQkFBa0I7UUFJN0I7UUFDRSxrREFBa0Q7UUFDdEIsaUJBQStCO1lBQS9CLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBYztRQUMxRCxDQUFDO1FBRUosa0JBQWtCO1lBQ2hCLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUN4QixDQUFDO1FBRUQsbURBQW1EO1FBQzNDLGNBQWM7WUFDcEIsSUFBSSxJQUFJLENBQUMsaUJBQWlCLEVBQUU7Z0JBQzFCLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO2FBQ3hEO1FBQ0gsQ0FBQztRQUNELHNEQUFzRDtRQUM5QyxXQUFXO1lBQ2pCLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7UUFDM0IsQ0FBQzs7O2dCQTdCRixTQUFTLFNBQUM7b0JBQ1QsUUFBUSxFQUFFLGtDQUFrQztvQkFDNUMsUUFBUSxFQUFFLG1CQUFtQjtvQkFDN0IsSUFBSSxFQUFFO3dCQUNKLGVBQWUsRUFBRSxNQUFNO3FCQUN4QjtpQkFDRjs7O2dCQWpCTyxXQUFXLHVCQXdCZCxJQUFJLFlBQUksUUFBUTs7OzZCQUpsQixLQUFLLFNBQUMsbUJBQW1COztJQXFCNUIseUJBQUM7S0FBQTtTQXZCWSxrQkFBa0IiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtEaXJlY3RpdmUsIElucHV0LCBTZWxmLCBPcHRpb25hbCwgQWZ0ZXJDb250ZW50SW5pdH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0Nka01lbnVQYW5lbH0gZnJvbSAnLi9tZW51LXBhbmVsJztcbmltcG9ydCB7Q2RrTWVudUl0ZW19IGZyb20gJy4vbWVudS1pdGVtJztcblxuLyoqXG4gKiBBIGRpcmVjdGl2ZSB0byBiZSBjb21iaW5lZCB3aXRoIENka01lbnVJdGVtIHdoaWNoIG9wZW5zIHRoZSBNZW51IGl0IGlzIGJvdW5kIHRvLiBJZiB0aGVcbiAqIGVsZW1lbnQgaXMgaW4gYSB0b3AgbGV2ZWwgTWVudUJhciBpdCB3aWxsIG9wZW4gdGhlIG1lbnUgb24gY2xpY2ssIG9yIGlmIGEgc2libGluZyBpcyBhbHJlYWR5XG4gKiBvcGVuZWQgaXQgd2lsbCBvcGVuIG9uIGhvdmVyLiBJZiBpdCBpcyBpbnNpZGUgb2YgYSBNZW51IGl0IHdpbGwgb3BlbiB0aGUgYXR0YWNoZWQgU3VibWVudSBvblxuICogaG92ZXIgcmVnYXJkbGVzcyBvZiBpdHMgc2libGluZyBzdGF0ZS5cbiAqXG4gKiBUaGUgZGlyZWN0aXZlIG11c3QgYmUgcGxhY2VkIGFsb25nIHdpdGggdGhlIGBjZGtNZW51SXRlbWAgZGlyZWN0aXZlIGluIG9yZGVyIHRvIGVuYWJsZSBmdWxsXG4gKiBmdW5jdGlvbmFsaXR5LlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbY2RrTWVudUl0ZW1dW2Nka01lbnVUcmlnZ2VyRm9yXScsXG4gIGV4cG9ydEFzOiAnY2RrTWVudVRyaWdnZXJGb3InLFxuICBob3N0OiB7XG4gICAgJ2FyaWEtaGFzcG9wdXAnOiAnbWVudScsXG4gIH0sXG59KVxuZXhwb3J0IGNsYXNzIENka01lbnVJdGVtVHJpZ2dlciBpbXBsZW1lbnRzIEFmdGVyQ29udGVudEluaXQge1xuICAvKiogVGVtcGxhdGUgcmVmZXJlbmNlIHZhcmlhYmxlIHRvIHRoZSBtZW51IHRoaXMgdHJpZ2dlciBvcGVucyAqL1xuICBASW5wdXQoJ2Nka01lbnVUcmlnZ2VyRm9yJykgX21lbnVQYW5lbD86IENka01lbnVQYW5lbDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAvKiogVGhlIE1lbnVJdGVtIGluc3RhbmNlIHdoaWNoIGlzIHRoZSB0cmlnZ2VyICAqL1xuICAgIEBTZWxmKCkgQE9wdGlvbmFsKCkgcHJpdmF0ZSBfbWVudUl0ZW1JbnN0YW5jZT86IENka01lbnVJdGVtXG4gICkge31cblxuICBuZ0FmdGVyQ29udGVudEluaXQoKSB7XG4gICAgdGhpcy5fc2V0SGFzU3VibWVudSgpO1xuICB9XG5cbiAgLyoqIFNldCB0aGUgaGFzU3VibWVudSBwcm9wZXJ0eSBvbiB0aGUgbWVudWl0ZW0gICovXG4gIHByaXZhdGUgX3NldEhhc1N1Ym1lbnUoKSB7XG4gICAgaWYgKHRoaXMuX21lbnVJdGVtSW5zdGFuY2UpIHtcbiAgICAgIHRoaXMuX21lbnVJdGVtSW5zdGFuY2UuaGFzU3VibWVudSA9IHRoaXMuX2hhc1N1Ym1lbnUoKTtcbiAgICB9XG4gIH1cbiAgLyoqIFJldHVybiB0cnVlIGlmIHRoZSB0cmlnZ2VyIGhhcyBhbiBhdHRhY2hlZCBtZW51ICovXG4gIHByaXZhdGUgX2hhc1N1Ym1lbnUoKSB7XG4gICAgcmV0dXJuICEhdGhpcy5fbWVudVBhbmVsO1xuICB9XG59XG4iXX0=