/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, Input, Output, EventEmitter } from '@angular/core';
/**
 * Directive which configures the element as a Menu which should contain child elements marked as
 * CdkMenuItem or CdkMenuGroup. Sets the appropriate role and aria-attributes for a menu and
 * contains accessable keyboard and mouse handling logic.
 *
 * It also acts as a RadioGroup for elements marked with role `menuitemradio`.
 */
let CdkMenu = /** @class */ (() => {
    class CdkMenu {
        constructor() {
            /**
             * Sets the aria-orientation attribute and determines where sub-menus will be opened.
             * Does not affect styling/layout.
             */
            this.orientation = 'vertical';
            /** Event emitted when the menu is closed. */
            this.closed = new EventEmitter();
        }
    }
    CdkMenu.decorators = [
        { type: Directive, args: [{
                    selector: '[cdkMenu]',
                    exportAs: 'cdkMenu',
                    host: {
                        'role': 'menubar',
                        '[attr.aria-orientation]': 'orientation',
                    },
                },] }
    ];
    CdkMenu.propDecorators = {
        orientation: [{ type: Input, args: ['cdkMenuOrientation',] }],
        closed: [{ type: Output }],
        change: [{ type: Output }]
    };
    return CdkMenu;
})();
export { CdkMenu };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL21lbnUvbWVudS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsU0FBUyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsWUFBWSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBR3JFOzs7Ozs7R0FNRztBQUNIO0lBQUEsTUFRYSxPQUFPO1FBUnBCO1lBU0U7OztlQUdHO1lBQzBCLGdCQUFXLEdBQThCLFVBQVUsQ0FBQztZQUVqRiw2Q0FBNkM7WUFDMUIsV0FBTSxHQUFvRCxJQUFJLFlBQVksRUFBRSxDQUFDO1FBSWxHLENBQUM7OztnQkFwQkEsU0FBUyxTQUFDO29CQUNULFFBQVEsRUFBRSxXQUFXO29CQUNyQixRQUFRLEVBQUUsU0FBUztvQkFDbkIsSUFBSSxFQUFFO3dCQUNKLE1BQU0sRUFBRSxTQUFTO3dCQUNqQix5QkFBeUIsRUFBRSxhQUFhO3FCQUN6QztpQkFDRjs7OzhCQU1FLEtBQUssU0FBQyxvQkFBb0I7eUJBRzFCLE1BQU07eUJBR04sTUFBTTs7SUFDVCxjQUFDO0tBQUE7U0FaWSxPQUFPIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RGlyZWN0aXZlLCBJbnB1dCwgT3V0cHV0LCBFdmVudEVtaXR0ZXJ9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtDZGtNZW51SXRlbX0gZnJvbSAnLi9tZW51LWl0ZW0nO1xuXG4vKipcbiAqIERpcmVjdGl2ZSB3aGljaCBjb25maWd1cmVzIHRoZSBlbGVtZW50IGFzIGEgTWVudSB3aGljaCBzaG91bGQgY29udGFpbiBjaGlsZCBlbGVtZW50cyBtYXJrZWQgYXNcbiAqIENka01lbnVJdGVtIG9yIENka01lbnVHcm91cC4gU2V0cyB0aGUgYXBwcm9wcmlhdGUgcm9sZSBhbmQgYXJpYS1hdHRyaWJ1dGVzIGZvciBhIG1lbnUgYW5kXG4gKiBjb250YWlucyBhY2Nlc3NhYmxlIGtleWJvYXJkIGFuZCBtb3VzZSBoYW5kbGluZyBsb2dpYy5cbiAqXG4gKiBJdCBhbHNvIGFjdHMgYXMgYSBSYWRpb0dyb3VwIGZvciBlbGVtZW50cyBtYXJrZWQgd2l0aCByb2xlIGBtZW51aXRlbXJhZGlvYC5cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW2Nka01lbnVdJyxcbiAgZXhwb3J0QXM6ICdjZGtNZW51JyxcbiAgaG9zdDoge1xuICAgICdyb2xlJzogJ21lbnViYXInLFxuICAgICdbYXR0ci5hcmlhLW9yaWVudGF0aW9uXSc6ICdvcmllbnRhdGlvbicsXG4gIH0sXG59KVxuZXhwb3J0IGNsYXNzIENka01lbnUge1xuICAvKipcbiAgICogU2V0cyB0aGUgYXJpYS1vcmllbnRhdGlvbiBhdHRyaWJ1dGUgYW5kIGRldGVybWluZXMgd2hlcmUgc3ViLW1lbnVzIHdpbGwgYmUgb3BlbmVkLlxuICAgKiBEb2VzIG5vdCBhZmZlY3Qgc3R5bGluZy9sYXlvdXQuXG4gICAqL1xuICBASW5wdXQoJ2Nka01lbnVPcmllbnRhdGlvbicpIG9yaWVudGF0aW9uOiAnaG9yaXpvbnRhbCcgfCAndmVydGljYWwnID0gJ3ZlcnRpY2FsJztcblxuICAvKiogRXZlbnQgZW1pdHRlZCB3aGVuIHRoZSBtZW51IGlzIGNsb3NlZC4gKi9cbiAgQE91dHB1dCgpIHJlYWRvbmx5IGNsb3NlZDogRXZlbnRFbWl0dGVyPHZvaWQgfCAnY2xpY2snIHwgJ3RhYicgfCAnZXNjYXBlJz4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG5cbiAgLyoqIEVtaXRzIHRoZSBhY3RpdmF0ZWQgZWxlbWVudCB3aGVuIGNoZWNrYm94IG9yIHJhZGlvYnV0dG9uIHN0YXRlIGNoYW5nZWQgICovXG4gIEBPdXRwdXQoKSBjaGFuZ2U6IEV2ZW50RW1pdHRlcjxDZGtNZW51SXRlbT47XG59XG4iXX0=