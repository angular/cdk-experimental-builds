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
export class CdkMenuGroup {
    constructor() {
        /** Emits the element when checkbox or radiobutton state changed  */
        this.change = new EventEmitter();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1ncm91cC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL21lbnUvbWVudS1ncm91cC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsU0FBUyxFQUFFLE1BQU0sRUFBRSxZQUFZLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFHOUQ7OztHQUdHO0FBUUgsTUFBTSxPQUFPLFlBQVk7SUFQekI7UUFRRSxvRUFBb0U7UUFDMUQsV0FBTSxHQUE4QixJQUFJLFlBQVksRUFBRSxDQUFDO0lBQ25FLENBQUM7OztZQVZBLFNBQVMsU0FBQztnQkFDVCxRQUFRLEVBQUUsZ0JBQWdCO2dCQUMxQixRQUFRLEVBQUUsY0FBYztnQkFDeEIsSUFBSSxFQUFFO29CQUNKLE1BQU0sRUFBRSxPQUFPO2lCQUNoQjthQUNGOzs7cUJBR0UsTUFBTSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0RpcmVjdGl2ZSwgT3V0cHV0LCBFdmVudEVtaXR0ZXJ9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtDZGtNZW51SXRlbX0gZnJvbSAnLi9tZW51LWl0ZW0nO1xuXG4vKipcbiAqIERpcmVjdGl2ZSB3aGljaCBhY3RzIGFzIGEgZ3JvdXBpbmcgY29udGFpbmVyIGZvciBgQ2RrTWVudUl0ZW1gIGluc3RhbmNlcyB3aXRoXG4gKiBgcm9sZT1cIm1lbnVpdGVtcmFkaW9cImAsIHNpbWlsYXIgdG8gYSBgcm9sZT1cInJhZGlvZ3JvdXBcImAgZWxlbWVudC5cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW2Nka01lbnVHcm91cF0nLFxuICBleHBvcnRBczogJ2Nka01lbnVHcm91cCcsXG4gIGhvc3Q6IHtcbiAgICAncm9sZSc6ICdncm91cCcsXG4gIH0sXG59KVxuZXhwb3J0IGNsYXNzIENka01lbnVHcm91cCB7XG4gIC8qKiBFbWl0cyB0aGUgZWxlbWVudCB3aGVuIGNoZWNrYm94IG9yIHJhZGlvYnV0dG9uIHN0YXRlIGNoYW5nZWQgICovXG4gIEBPdXRwdXQoKSBjaGFuZ2U6IEV2ZW50RW1pdHRlcjxDZGtNZW51SXRlbT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG59XG4iXX0=