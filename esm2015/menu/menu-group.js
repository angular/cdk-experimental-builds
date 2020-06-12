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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1ncm91cC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL21lbnUvbWVudS1ncm91cC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsU0FBUyxFQUFFLE1BQU0sRUFBRSxZQUFZLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFHOUQ7OztHQUdHO0FBQ0g7SUFBQSxNQU9hLFlBQVk7UUFQekI7WUFRRSxvRUFBb0U7WUFDMUQsV0FBTSxHQUE4QixJQUFJLFlBQVksRUFBRSxDQUFDO1FBQ25FLENBQUM7OztnQkFWQSxTQUFTLFNBQUM7b0JBQ1QsUUFBUSxFQUFFLGdCQUFnQjtvQkFDMUIsUUFBUSxFQUFFLGNBQWM7b0JBQ3hCLElBQUksRUFBRTt3QkFDSixNQUFNLEVBQUUsT0FBTztxQkFDaEI7aUJBQ0Y7Ozt5QkFHRSxNQUFNOztJQUNULG1CQUFDO0tBQUE7U0FIWSxZQUFZIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RGlyZWN0aXZlLCBPdXRwdXQsIEV2ZW50RW1pdHRlcn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0Nka01lbnVJdGVtfSBmcm9tICcuL21lbnUtaXRlbSc7XG5cbi8qKlxuICogRGlyZWN0aXZlIHdoaWNoIGFjdHMgYXMgYSBncm91cGluZyBjb250YWluZXIgZm9yIGBDZGtNZW51SXRlbWAgaW5zdGFuY2VzIHdpdGhcbiAqIGByb2xlPVwibWVudWl0ZW1yYWRpb1wiYCwgc2ltaWxhciB0byBhIGByb2xlPVwicmFkaW9ncm91cFwiYCBlbGVtZW50LlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbY2RrTWVudUdyb3VwXScsXG4gIGV4cG9ydEFzOiAnY2RrTWVudUdyb3VwJyxcbiAgaG9zdDoge1xuICAgICdyb2xlJzogJ2dyb3VwJyxcbiAgfSxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrTWVudUdyb3VwIHtcbiAgLyoqIEVtaXRzIHRoZSBlbGVtZW50IHdoZW4gY2hlY2tib3ggb3IgcmFkaW9idXR0b24gc3RhdGUgY2hhbmdlZCAgKi9cbiAgQE91dHB1dCgpIGNoYW5nZTogRXZlbnRFbWl0dGVyPENka01lbnVJdGVtPiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbn1cbiJdfQ==