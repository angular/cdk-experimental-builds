/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, Input } from '@angular/core';
/**
 * Directive applied to an element which configures it as a MenuBar by setting the appropriate
 * role, aria attributes, and accessable keyboard and mouse handling logic. The component that
 * this directive is applied to should contain components marked with CdkMenuItem.
 *
 */
export class CdkMenuBar {
    constructor() {
        /**
         * Sets the aria-orientation attribute and determines where sub-menus will be opened.
         * Does not affect styling/layout.
         */
        this.orientation = 'horizontal';
    }
}
CdkMenuBar.decorators = [
    { type: Directive, args: [{
                selector: '[cdkMenuBar]',
                exportAs: 'cdkMenuBar',
                host: {
                    'role': 'menubar',
                    '[attr.aria-orientation]': 'orientation',
                },
            },] }
];
CdkMenuBar.propDecorators = {
    orientation: [{ type: Input, args: ['cdkMenuBarOrientation',] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1iYXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrLWV4cGVyaW1lbnRhbC9tZW51L21lbnUtYmFyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxTQUFTLEVBQUUsS0FBSyxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRS9DOzs7OztHQUtHO0FBU0gsTUFBTSxPQUFPLFVBQVU7SUFSdkI7UUFTRTs7O1dBR0c7UUFDNkIsZ0JBQVcsR0FBOEIsWUFBWSxDQUFDO0lBQ3hGLENBQUM7OztZQWRBLFNBQVMsU0FBQztnQkFDVCxRQUFRLEVBQUUsY0FBYztnQkFDeEIsUUFBUSxFQUFFLFlBQVk7Z0JBQ3RCLElBQUksRUFBRTtvQkFDSixNQUFNLEVBQUUsU0FBUztvQkFDakIseUJBQXlCLEVBQUUsYUFBYTtpQkFDekM7YUFDRjs7OzBCQU1FLEtBQUssU0FBQyx1QkFBdUIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtEaXJlY3RpdmUsIElucHV0fSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuLyoqXG4gKiBEaXJlY3RpdmUgYXBwbGllZCB0byBhbiBlbGVtZW50IHdoaWNoIGNvbmZpZ3VyZXMgaXQgYXMgYSBNZW51QmFyIGJ5IHNldHRpbmcgdGhlIGFwcHJvcHJpYXRlXG4gKiByb2xlLCBhcmlhIGF0dHJpYnV0ZXMsIGFuZCBhY2Nlc3NhYmxlIGtleWJvYXJkIGFuZCBtb3VzZSBoYW5kbGluZyBsb2dpYy4gVGhlIGNvbXBvbmVudCB0aGF0XG4gKiB0aGlzIGRpcmVjdGl2ZSBpcyBhcHBsaWVkIHRvIHNob3VsZCBjb250YWluIGNvbXBvbmVudHMgbWFya2VkIHdpdGggQ2RrTWVudUl0ZW0uXG4gKlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbY2RrTWVudUJhcl0nLFxuICBleHBvcnRBczogJ2Nka01lbnVCYXInLFxuICBob3N0OiB7XG4gICAgJ3JvbGUnOiAnbWVudWJhcicsXG4gICAgJ1thdHRyLmFyaWEtb3JpZW50YXRpb25dJzogJ29yaWVudGF0aW9uJyxcbiAgfSxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrTWVudUJhciB7XG4gIC8qKlxuICAgKiBTZXRzIHRoZSBhcmlhLW9yaWVudGF0aW9uIGF0dHJpYnV0ZSBhbmQgZGV0ZXJtaW5lcyB3aGVyZSBzdWItbWVudXMgd2lsbCBiZSBvcGVuZWQuXG4gICAqIERvZXMgbm90IGFmZmVjdCBzdHlsaW5nL2xheW91dC5cbiAgICovXG4gIEBJbnB1dCgnY2RrTWVudUJhck9yaWVudGF0aW9uJykgb3JpZW50YXRpb246ICdob3Jpem9udGFsJyB8ICd2ZXJ0aWNhbCcgPSAnaG9yaXpvbnRhbCc7XG59XG4iXX0=