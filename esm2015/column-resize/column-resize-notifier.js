/**
 * @fileoverview added by tsickle
 * Generated from: src/cdk-experimental/column-resize/column-resize-notifier.ts
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
import { Subject } from 'rxjs';
/**
 * Indicates the width of a column.
 * @record
 */
export function ColumnSize() { }
if (false) {
    /**
     * The ID/name of the column, as defined in CdkColumnDef.
     * @type {?}
     */
    ColumnSize.prototype.columnId;
    /**
     * The width in pixels of the column.
     * @type {?}
     */
    ColumnSize.prototype.size;
    /**
     * The width in pixels of the column prior to this update, if known.
     * @type {?|undefined}
     */
    ColumnSize.prototype.previousSize;
}
/**
 * Interface describing column size changes.
 * @record
 */
export function ColumnSizeAction() { }
if (false) {
    /**
     * Whether the resize action should be applied instantaneously. False for events triggered during
     * a UI-triggered resize (such as with the mouse) until the mouse button is released. True
     * for all programatically triggered resizes.
     * @type {?|undefined}
     */
    ColumnSizeAction.prototype.completeImmediately;
}
/**
 * Originating source of column resize events within a table.
 * \@docs-private
 */
export class ColumnResizeNotifierSource {
    constructor() {
        /**
         * Emits when an in-progress resize is canceled.
         */
        this.resizeCanceled = new Subject();
        /**
         * Emits when a resize is applied.
         */
        this.resizeCompleted = new Subject();
        /**
         * Triggers a resize action.
         */
        this.triggerResize = new Subject();
    }
}
ColumnResizeNotifierSource.decorators = [
    { type: Injectable }
];
if (false) {
    /**
     * Emits when an in-progress resize is canceled.
     * @type {?}
     */
    ColumnResizeNotifierSource.prototype.resizeCanceled;
    /**
     * Emits when a resize is applied.
     * @type {?}
     */
    ColumnResizeNotifierSource.prototype.resizeCompleted;
    /**
     * Triggers a resize action.
     * @type {?}
     */
    ColumnResizeNotifierSource.prototype.triggerResize;
}
/**
 * Service for triggering column resizes imperatively or being notified of them.
 */
export class ColumnResizeNotifier {
    /**
     * @param {?} _source
     */
    constructor(_source) {
        this._source = _source;
        /**
         * Emits whenever a column is resized.
         */
        this.resizeCompleted = this._source.resizeCompleted.asObservable();
    }
    /**
     * Instantly resizes the specified column.
     * @param {?} columnId
     * @param {?} size
     * @return {?}
     */
    resize(columnId, size) {
        this._source.triggerResize.next({ columnId, size, completeImmediately: true });
    }
}
ColumnResizeNotifier.decorators = [
    { type: Injectable }
];
/** @nocollapse */
ColumnResizeNotifier.ctorParameters = () => [
    { type: ColumnResizeNotifierSource }
];
if (false) {
    /**
     * Emits whenever a column is resized.
     * @type {?}
     */
    ColumnResizeNotifier.prototype.resizeCompleted;
    /**
     * @type {?}
     * @private
     */
    ColumnResizeNotifier.prototype._source;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sdW1uLXJlc2l6ZS1ub3RpZmllci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL2NvbHVtbi1yZXNpemUvY29sdW1uLXJlc2l6ZS1ub3RpZmllci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFRQSxPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3pDLE9BQU8sRUFBYSxPQUFPLEVBQUMsTUFBTSxNQUFNLENBQUM7Ozs7O0FBR3pDLGdDQVNDOzs7Ozs7SUFQQyw4QkFBMEI7Ozs7O0lBRzFCLDBCQUFzQjs7Ozs7SUFHdEIsa0NBQStCOzs7Ozs7QUFJakMsc0NBT0M7Ozs7Ozs7O0lBREMsK0NBQXVDOzs7Ozs7QUFRekMsTUFBTSxPQUFPLDBCQUEwQjtJQUR2Qzs7OztRQUdXLG1CQUFjLEdBQUcsSUFBSSxPQUFPLEVBQW9CLENBQUM7Ozs7UUFHakQsb0JBQWUsR0FBRyxJQUFJLE9BQU8sRUFBYyxDQUFDOzs7O1FBRzVDLGtCQUFhLEdBQUcsSUFBSSxPQUFPLEVBQW9CLENBQUM7SUFDM0QsQ0FBQzs7O1lBVkEsVUFBVTs7Ozs7OztJQUdULG9EQUEwRDs7Ozs7SUFHMUQscURBQXFEOzs7OztJQUdyRCxtREFBeUQ7Ozs7O0FBSzNELE1BQU0sT0FBTyxvQkFBb0I7Ozs7SUFJL0IsWUFBNkIsT0FBbUM7UUFBbkMsWUFBTyxHQUFQLE9BQU8sQ0FBNEI7Ozs7UUFGdkQsb0JBQWUsR0FBMkIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsWUFBWSxFQUFFLENBQUM7SUFFNUIsQ0FBQzs7Ozs7OztJQUdwRSxNQUFNLENBQUMsUUFBZ0IsRUFBRSxJQUFZO1FBQ25DLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxFQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsbUJBQW1CLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQztJQUMvRSxDQUFDOzs7WUFWRixVQUFVOzs7O1lBSzZCLDBCQUEwQjs7Ozs7OztJQUZoRSwrQ0FBK0Y7Ozs7O0lBRW5GLHVDQUFvRCIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0luamVjdGFibGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtPYnNlcnZhYmxlLCBTdWJqZWN0fSBmcm9tICdyeGpzJztcblxuLyoqIEluZGljYXRlcyB0aGUgd2lkdGggb2YgYSBjb2x1bW4uICovXG5leHBvcnQgaW50ZXJmYWNlIENvbHVtblNpemUge1xuICAvKiogVGhlIElEL25hbWUgb2YgdGhlIGNvbHVtbiwgYXMgZGVmaW5lZCBpbiBDZGtDb2x1bW5EZWYuICovXG4gIHJlYWRvbmx5IGNvbHVtbklkOiBzdHJpbmc7XG5cbiAgLyoqIFRoZSB3aWR0aCBpbiBwaXhlbHMgb2YgdGhlIGNvbHVtbi4gKi9cbiAgcmVhZG9ubHkgc2l6ZTogbnVtYmVyO1xuXG4gIC8qKiBUaGUgd2lkdGggaW4gcGl4ZWxzIG9mIHRoZSBjb2x1bW4gcHJpb3IgdG8gdGhpcyB1cGRhdGUsIGlmIGtub3duLiAqL1xuICByZWFkb25seSBwcmV2aW91c1NpemU/OiBudW1iZXI7XG59XG5cbi8qKiBJbnRlcmZhY2UgZGVzY3JpYmluZyBjb2x1bW4gc2l6ZSBjaGFuZ2VzLiAqL1xuZXhwb3J0IGludGVyZmFjZSBDb2x1bW5TaXplQWN0aW9uIGV4dGVuZHMgQ29sdW1uU2l6ZSB7XG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoZSByZXNpemUgYWN0aW9uIHNob3VsZCBiZSBhcHBsaWVkIGluc3RhbnRhbmVvdXNseS4gRmFsc2UgZm9yIGV2ZW50cyB0cmlnZ2VyZWQgZHVyaW5nXG4gICAqIGEgVUktdHJpZ2dlcmVkIHJlc2l6ZSAoc3VjaCBhcyB3aXRoIHRoZSBtb3VzZSkgdW50aWwgdGhlIG1vdXNlIGJ1dHRvbiBpcyByZWxlYXNlZC4gVHJ1ZVxuICAgKiBmb3IgYWxsIHByb2dyYW1hdGljYWxseSB0cmlnZ2VyZWQgcmVzaXplcy5cbiAgICovXG4gIHJlYWRvbmx5IGNvbXBsZXRlSW1tZWRpYXRlbHk/OiBib29sZWFuO1xufVxuXG4vKipcbiAqIE9yaWdpbmF0aW5nIHNvdXJjZSBvZiBjb2x1bW4gcmVzaXplIGV2ZW50cyB3aXRoaW4gYSB0YWJsZS5cbiAqIEBkb2NzLXByaXZhdGVcbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIENvbHVtblJlc2l6ZU5vdGlmaWVyU291cmNlIHtcbiAgLyoqIEVtaXRzIHdoZW4gYW4gaW4tcHJvZ3Jlc3MgcmVzaXplIGlzIGNhbmNlbGVkLiAqL1xuICByZWFkb25seSByZXNpemVDYW5jZWxlZCA9IG5ldyBTdWJqZWN0PENvbHVtblNpemVBY3Rpb24+KCk7XG5cbiAgLyoqIEVtaXRzIHdoZW4gYSByZXNpemUgaXMgYXBwbGllZC4gKi9cbiAgcmVhZG9ubHkgcmVzaXplQ29tcGxldGVkID0gbmV3IFN1YmplY3Q8Q29sdW1uU2l6ZT4oKTtcblxuICAvKiogVHJpZ2dlcnMgYSByZXNpemUgYWN0aW9uLiAqL1xuICByZWFkb25seSB0cmlnZ2VyUmVzaXplID0gbmV3IFN1YmplY3Q8Q29sdW1uU2l6ZUFjdGlvbj4oKTtcbn1cblxuLyoqIFNlcnZpY2UgZm9yIHRyaWdnZXJpbmcgY29sdW1uIHJlc2l6ZXMgaW1wZXJhdGl2ZWx5IG9yIGJlaW5nIG5vdGlmaWVkIG9mIHRoZW0uICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgQ29sdW1uUmVzaXplTm90aWZpZXIge1xuICAvKiogRW1pdHMgd2hlbmV2ZXIgYSBjb2x1bW4gaXMgcmVzaXplZC4gKi9cbiAgcmVhZG9ubHkgcmVzaXplQ29tcGxldGVkOiBPYnNlcnZhYmxlPENvbHVtblNpemU+ID0gdGhpcy5fc291cmNlLnJlc2l6ZUNvbXBsZXRlZC5hc09ic2VydmFibGUoKTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHJlYWRvbmx5IF9zb3VyY2U6IENvbHVtblJlc2l6ZU5vdGlmaWVyU291cmNlKSB7fVxuXG4gIC8qKiBJbnN0YW50bHkgcmVzaXplcyB0aGUgc3BlY2lmaWVkIGNvbHVtbi4gKi9cbiAgcmVzaXplKGNvbHVtbklkOiBzdHJpbmcsIHNpemU6IG51bWJlcik6IHZvaWQge1xuICAgIHRoaXMuX3NvdXJjZS50cmlnZ2VyUmVzaXplLm5leHQoe2NvbHVtbklkLCBzaXplLCBjb21wbGV0ZUltbWVkaWF0ZWx5OiB0cnVlfSk7XG4gIH1cbn1cbiJdfQ==