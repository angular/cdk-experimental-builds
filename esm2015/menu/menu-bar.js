/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, Input } from '@angular/core';
import { CdkMenuGroup } from './menu-group';
import { CDK_MENU } from './menu-interface';
/**
 * Directive applied to an element which configures it as a MenuBar by setting the appropriate
 * role, aria attributes, and accessible keyboard and mouse handling logic. The component that
 * this directive is applied to should contain components marked with CdkMenuItem.
 *
 */
let CdkMenuBar = /** @class */ (() => {
    class CdkMenuBar extends CdkMenuGroup {
        constructor() {
            super(...arguments);
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
                    providers: [
                        { provide: CdkMenuGroup, useExisting: CdkMenuBar },
                        { provide: CDK_MENU, useExisting: CdkMenuBar },
                    ],
                },] }
    ];
    CdkMenuBar.propDecorators = {
        orientation: [{ type: Input, args: ['cdkMenuBarOrientation',] }]
    };
    return CdkMenuBar;
})();
export { CdkMenuBar };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1iYXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrLWV4cGVyaW1lbnRhbC9tZW51L21lbnUtYmFyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxTQUFTLEVBQUUsS0FBSyxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQy9DLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFDMUMsT0FBTyxFQUFDLFFBQVEsRUFBTyxNQUFNLGtCQUFrQixDQUFDO0FBRWhEOzs7OztHQUtHO0FBQ0g7SUFBQSxNQVlhLFVBQVcsU0FBUSxZQUFZO1FBWjVDOztZQWFFOzs7ZUFHRztZQUM2QixnQkFBVyxHQUE4QixZQUFZLENBQUM7UUFDeEYsQ0FBQzs7O2dCQWxCQSxTQUFTLFNBQUM7b0JBQ1QsUUFBUSxFQUFFLGNBQWM7b0JBQ3hCLFFBQVEsRUFBRSxZQUFZO29CQUN0QixJQUFJLEVBQUU7d0JBQ0osTUFBTSxFQUFFLFNBQVM7d0JBQ2pCLHlCQUF5QixFQUFFLGFBQWE7cUJBQ3pDO29CQUNELFNBQVMsRUFBRTt3QkFDVCxFQUFDLE9BQU8sRUFBRSxZQUFZLEVBQUUsV0FBVyxFQUFFLFVBQVUsRUFBQzt3QkFDaEQsRUFBQyxPQUFPLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQUM7cUJBQzdDO2lCQUNGOzs7OEJBTUUsS0FBSyxTQUFDLHVCQUF1Qjs7SUFDaEMsaUJBQUM7S0FBQTtTQU5ZLFVBQVUiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtEaXJlY3RpdmUsIElucHV0fSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7Q2RrTWVudUdyb3VwfSBmcm9tICcuL21lbnUtZ3JvdXAnO1xuaW1wb3J0IHtDREtfTUVOVSwgTWVudX0gZnJvbSAnLi9tZW51LWludGVyZmFjZSc7XG5cbi8qKlxuICogRGlyZWN0aXZlIGFwcGxpZWQgdG8gYW4gZWxlbWVudCB3aGljaCBjb25maWd1cmVzIGl0IGFzIGEgTWVudUJhciBieSBzZXR0aW5nIHRoZSBhcHByb3ByaWF0ZVxuICogcm9sZSwgYXJpYSBhdHRyaWJ1dGVzLCBhbmQgYWNjZXNzaWJsZSBrZXlib2FyZCBhbmQgbW91c2UgaGFuZGxpbmcgbG9naWMuIFRoZSBjb21wb25lbnQgdGhhdFxuICogdGhpcyBkaXJlY3RpdmUgaXMgYXBwbGllZCB0byBzaG91bGQgY29udGFpbiBjb21wb25lbnRzIG1hcmtlZCB3aXRoIENka01lbnVJdGVtLlxuICpcbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW2Nka01lbnVCYXJdJyxcbiAgZXhwb3J0QXM6ICdjZGtNZW51QmFyJyxcbiAgaG9zdDoge1xuICAgICdyb2xlJzogJ21lbnViYXInLFxuICAgICdbYXR0ci5hcmlhLW9yaWVudGF0aW9uXSc6ICdvcmllbnRhdGlvbicsXG4gIH0sXG4gIHByb3ZpZGVyczogW1xuICAgIHtwcm92aWRlOiBDZGtNZW51R3JvdXAsIHVzZUV4aXN0aW5nOiBDZGtNZW51QmFyfSxcbiAgICB7cHJvdmlkZTogQ0RLX01FTlUsIHVzZUV4aXN0aW5nOiBDZGtNZW51QmFyfSxcbiAgXSxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrTWVudUJhciBleHRlbmRzIENka01lbnVHcm91cCBpbXBsZW1lbnRzIE1lbnUge1xuICAvKipcbiAgICogU2V0cyB0aGUgYXJpYS1vcmllbnRhdGlvbiBhdHRyaWJ1dGUgYW5kIGRldGVybWluZXMgd2hlcmUgc3ViLW1lbnVzIHdpbGwgYmUgb3BlbmVkLlxuICAgKiBEb2VzIG5vdCBhZmZlY3Qgc3R5bGluZy9sYXlvdXQuXG4gICAqL1xuICBASW5wdXQoJ2Nka01lbnVCYXJPcmllbnRhdGlvbicpIG9yaWVudGF0aW9uOiAnaG9yaXpvbnRhbCcgfCAndmVydGljYWwnID0gJ2hvcml6b250YWwnO1xufVxuIl19