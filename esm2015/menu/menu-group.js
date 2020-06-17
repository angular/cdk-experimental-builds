/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, Output, EventEmitter } from '@angular/core';
/**
 * Directive which acts as a grouping container for `CdkMenuItem` instances with
 * `role="menuitemradio"`, similar to a `role="radiogroup"` element.
 */
let CdkMenuGroup = /** @class */ (() => {
    class CdkMenuGroup {
        constructor() {
            /** Emits the element when checkbox or radiobutton state changed  */
            this.change = new EventEmitter();
        }
        /**
         * Emits events for the clicked MenuItem
         * @param menuItem The clicked MenuItem to handle
         */
        _registerTriggeredItem(menuItem) {
            if (menuItem.role !== 'menuitem') {
                this.change.emit(menuItem);
            }
        }
    }
    CdkMenuGroup.decorators = [
        { type: Directive, args: [{
                    selector: '[cdkMenuGroup]',
                    exportAs: 'cdkMenuGroup',
                    host: {
                        'role': 'group',
                    },
                },] }
    ];
    CdkMenuGroup.propDecorators = {
        change: [{ type: Output }]
    };
    return CdkMenuGroup;
})();
export { CdkMenuGroup };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1ncm91cC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL21lbnUvbWVudS1ncm91cC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsU0FBUyxFQUFFLE1BQU0sRUFBRSxZQUFZLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFHOUQ7OztHQUdHO0FBQ0g7SUFBQSxNQU9hLFlBQVk7UUFQekI7WUFRRSxvRUFBb0U7WUFDMUQsV0FBTSxHQUEyQixJQUFJLFlBQVksRUFBRSxDQUFDO1FBV2hFLENBQUM7UUFUQzs7O1dBR0c7UUFDSCxzQkFBc0IsQ0FBQyxRQUFrQjtZQUN2QyxJQUFJLFFBQVEsQ0FBQyxJQUFJLEtBQUssVUFBVSxFQUFFO2dCQUNoQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQzthQUM1QjtRQUNILENBQUM7OztnQkFuQkYsU0FBUyxTQUFDO29CQUNULFFBQVEsRUFBRSxnQkFBZ0I7b0JBQzFCLFFBQVEsRUFBRSxjQUFjO29CQUN4QixJQUFJLEVBQUU7d0JBQ0osTUFBTSxFQUFFLE9BQU87cUJBQ2hCO2lCQUNGOzs7eUJBR0UsTUFBTTs7SUFXVCxtQkFBQztLQUFBO1NBYlksWUFBWSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0RpcmVjdGl2ZSwgT3V0cHV0LCBFdmVudEVtaXR0ZXJ9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtNZW51SXRlbX0gZnJvbSAnLi9tZW51LWl0ZW0taW50ZXJmYWNlJztcblxuLyoqXG4gKiBEaXJlY3RpdmUgd2hpY2ggYWN0cyBhcyBhIGdyb3VwaW5nIGNvbnRhaW5lciBmb3IgYENka01lbnVJdGVtYCBpbnN0YW5jZXMgd2l0aFxuICogYHJvbGU9XCJtZW51aXRlbXJhZGlvXCJgLCBzaW1pbGFyIHRvIGEgYHJvbGU9XCJyYWRpb2dyb3VwXCJgIGVsZW1lbnQuXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tjZGtNZW51R3JvdXBdJyxcbiAgZXhwb3J0QXM6ICdjZGtNZW51R3JvdXAnLFxuICBob3N0OiB7XG4gICAgJ3JvbGUnOiAnZ3JvdXAnLFxuICB9LFxufSlcbmV4cG9ydCBjbGFzcyBDZGtNZW51R3JvdXAge1xuICAvKiogRW1pdHMgdGhlIGVsZW1lbnQgd2hlbiBjaGVja2JveCBvciByYWRpb2J1dHRvbiBzdGF0ZSBjaGFuZ2VkICAqL1xuICBAT3V0cHV0KCkgY2hhbmdlOiBFdmVudEVtaXR0ZXI8TWVudUl0ZW0+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4gIC8qKlxuICAgKiBFbWl0cyBldmVudHMgZm9yIHRoZSBjbGlja2VkIE1lbnVJdGVtXG4gICAqIEBwYXJhbSBtZW51SXRlbSBUaGUgY2xpY2tlZCBNZW51SXRlbSB0byBoYW5kbGVcbiAgICovXG4gIF9yZWdpc3RlclRyaWdnZXJlZEl0ZW0obWVudUl0ZW06IE1lbnVJdGVtKSB7XG4gICAgaWYgKG1lbnVJdGVtLnJvbGUgIT09ICdtZW51aXRlbScpIHtcbiAgICAgIHRoaXMuY2hhbmdlLmVtaXQobWVudUl0ZW0pO1xuICAgIH1cbiAgfVxufVxuIl19