/**
 * @fileoverview added by tsickle
 * Generated from: src/cdk-experimental/column-resize/column-size-store.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Injectable } from '@angular/core';
/**
 * Can be provided by the host application to enable persistence of column resize state.
 * @abstract
 */
export class ColumnSizeStore {
}
ColumnSizeStore.decorators = [
    { type: Injectable }
];
if (false) {
    /**
     * Returns the persisted size of the specified column in the specified table.
     * @abstract
     * @param {?} tableId
     * @param {?} columnId
     * @return {?}
     */
    ColumnSizeStore.prototype.getSize = function (tableId, columnId) { };
    /**
     * Persists the size of the specified column in the specified table.
     * @abstract
     * @param {?} tableId
     * @param {?} columnId
     * @return {?}
     */
    ColumnSizeStore.prototype.setSize = function (tableId, columnId) { };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sdW1uLXNpemUtc3RvcmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrLWV4cGVyaW1lbnRhbC9jb2x1bW4tcmVzaXplL2NvbHVtbi1zaXplLXN0b3JlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQVFBLE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxlQUFlLENBQUM7Ozs7O0FBTXpDLE1BQU0sT0FBZ0IsZUFBZTs7O1lBRHBDLFVBQVU7Ozs7Ozs7Ozs7SUFHVCxxRUFBNEQ7Ozs7Ozs7O0lBRzVELHFFQUEwRCIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0luamVjdGFibGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG4vKipcbiAqIENhbiBiZSBwcm92aWRlZCBieSB0aGUgaG9zdCBhcHBsaWNhdGlvbiB0byBlbmFibGUgcGVyc2lzdGVuY2Ugb2YgY29sdW1uIHJlc2l6ZSBzdGF0ZS5cbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIENvbHVtblNpemVTdG9yZSB7XG4gIC8qKiBSZXR1cm5zIHRoZSBwZXJzaXN0ZWQgc2l6ZSBvZiB0aGUgc3BlY2lmaWVkIGNvbHVtbiBpbiB0aGUgc3BlY2lmaWVkIHRhYmxlLiAqL1xuICBhYnN0cmFjdCBnZXRTaXplKHRhYmxlSWQ6IHN0cmluZywgY29sdW1uSWQ6IHN0cmluZyk6IG51bWJlcjtcblxuICAvKiogUGVyc2lzdHMgdGhlIHNpemUgb2YgdGhlIHNwZWNpZmllZCBjb2x1bW4gaW4gdGhlIHNwZWNpZmllZCB0YWJsZS4gKi9cbiAgYWJzdHJhY3Qgc2V0U2l6ZSh0YWJsZUlkOiBzdHJpbmcsIGNvbHVtbklkOiBzdHJpbmcpOiB2b2lkO1xufVxuIl19