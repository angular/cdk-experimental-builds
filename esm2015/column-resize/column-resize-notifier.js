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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sdW1uLXJlc2l6ZS1ub3RpZmllci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL2NvbHVtbi1yZXNpemUvY29sdW1uLXJlc2l6ZS1ub3RpZmllci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFRQSxPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3pDLE9BQU8sRUFBYSxPQUFPLEVBQUMsTUFBTSxNQUFNLENBQUM7Ozs7O0FBR3pDLGdDQU1DOzs7Ozs7SUFKQyw4QkFBMEI7Ozs7O0lBRzFCLDBCQUFzQjs7Ozs7O0FBSXhCLHNDQU9DOzs7Ozs7OztJQURDLCtDQUF1Qzs7Ozs7QUFLekMsTUFBTSxPQUFPLDBCQUEwQjtJQUR2Qzs7OztRQUdXLG1CQUFjLEdBQUcsSUFBSSxPQUFPLEVBQW9CLENBQUM7Ozs7UUFHakQsb0JBQWUsR0FBRyxJQUFJLE9BQU8sRUFBYyxDQUFDOzs7O1FBRzVDLGtCQUFhLEdBQUcsSUFBSSxPQUFPLEVBQW9CLENBQUM7SUFDM0QsQ0FBQzs7O1lBVkEsVUFBVTs7Ozs7OztJQUdULG9EQUEwRDs7Ozs7SUFHMUQscURBQXFEOzs7OztJQUdyRCxtREFBeUQ7Ozs7O0FBSzNELE1BQU0sT0FBTyxvQkFBb0I7Ozs7SUFJL0IsWUFBNkIsT0FBbUM7UUFBbkMsWUFBTyxHQUFQLE9BQU8sQ0FBNEI7Ozs7UUFGdkQsb0JBQWUsR0FBMkIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsWUFBWSxFQUFFLENBQUM7SUFFNUIsQ0FBQzs7Ozs7OztJQUdwRSxNQUFNLENBQUMsUUFBZ0IsRUFBRSxJQUFZO1FBQ25DLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxFQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsbUJBQW1CLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQztJQUMvRSxDQUFDOzs7WUFWRixVQUFVOzs7O1lBSzZCLDBCQUEwQjs7Ozs7OztJQUZoRSwrQ0FBK0Y7Ozs7O0lBRW5GLHVDQUFvRCIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0luamVjdGFibGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtPYnNlcnZhYmxlLCBTdWJqZWN0fSBmcm9tICdyeGpzJztcblxuLyoqIEluZGljYXRlcyB0aGUgd2lkdGggb2YgYSBjb2x1bW4uICovXG5leHBvcnQgaW50ZXJmYWNlIENvbHVtblNpemUge1xuICAvKiogVGhlIElEL25hbWUgb2YgdGhlIGNvbHVtbiwgYXMgZGVmaW5lZCBpbiBDZGtDb2x1bW5EZWYuICovXG4gIHJlYWRvbmx5IGNvbHVtbklkOiBzdHJpbmc7XG5cbiAgLyoqIFRoZSB3aWR0aCBpbiBwaXhlbHMgb2YgdGhlIGNvbHVtbi4gKi9cbiAgcmVhZG9ubHkgc2l6ZTogbnVtYmVyO1xufVxuXG4vKiogSW50ZXJmYWNlIGRlc2NyaWJpbmcgY29sdW1uIHNpemUgY2hhbmdlcy4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ29sdW1uU2l6ZUFjdGlvbiBleHRlbmRzIENvbHVtblNpemUge1xuICAvKipcbiAgICogV2hldGhlciB0aGUgcmVzaXplIGFjdGlvbiBzaG91bGQgYmUgYXBwbGllZCBpbnN0YW50YW5lb3VzbHkuIEZhbHNlIGZvciBldmVudHMgdHJpZ2dlcmVkIGR1cmluZ1xuICAgKiBhIFVJLXRyaWdnZXJlZCByZXNpemUgKHN1Y2ggYXMgd2l0aCB0aGUgbW91c2UpIHVudGlsIHRoZSBtb3VzZSBidXR0b24gaXMgcmVsZWFzZWQuIFRydWVcbiAgICogZm9yIGFsbCBwcm9ncmFtYXRpY2FsbHkgdHJpZ2dlcmVkIHJlc2l6ZXMuXG4gICAqL1xuICByZWFkb25seSBjb21wbGV0ZUltbWVkaWF0ZWx5PzogYm9vbGVhbjtcbn1cblxuLyoqIE9yaWdpbmF0aW5nIHNvdXJjZSBvZiBjb2x1bW4gcmVzaXplIGV2ZW50cyB3aXRoaW4gYSB0YWJsZS4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBDb2x1bW5SZXNpemVOb3RpZmllclNvdXJjZSB7XG4gIC8qKiBFbWl0cyB3aGVuIGFuIGluLXByb2dyZXNzIHJlc2l6ZSBpcyBjYW5jZWxlZC4gKi9cbiAgcmVhZG9ubHkgcmVzaXplQ2FuY2VsZWQgPSBuZXcgU3ViamVjdDxDb2x1bW5TaXplQWN0aW9uPigpO1xuXG4gIC8qKiBFbWl0cyB3aGVuIGEgcmVzaXplIGlzIGFwcGxpZWQuICovXG4gIHJlYWRvbmx5IHJlc2l6ZUNvbXBsZXRlZCA9IG5ldyBTdWJqZWN0PENvbHVtblNpemU+KCk7XG5cbiAgLyoqIFRyaWdnZXJzIGEgcmVzaXplIGFjdGlvbi4gKi9cbiAgcmVhZG9ubHkgdHJpZ2dlclJlc2l6ZSA9IG5ldyBTdWJqZWN0PENvbHVtblNpemVBY3Rpb24+KCk7XG59XG5cbi8qKiBTZXJ2aWNlIGZvciB0cmlnZ2VyaW5nIGNvbHVtbiByZXNpemVzIGltcGVyYXRpdmVseSBvciBiZWluZyBub3RpZmllZCBvZiB0aGVtLiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIENvbHVtblJlc2l6ZU5vdGlmaWVyIHtcbiAgLyoqIEVtaXRzIHdoZW5ldmVyIGEgY29sdW1uIGlzIHJlc2l6ZWQuICovXG4gIHJlYWRvbmx5IHJlc2l6ZUNvbXBsZXRlZDogT2JzZXJ2YWJsZTxDb2x1bW5TaXplPiA9IHRoaXMuX3NvdXJjZS5yZXNpemVDb21wbGV0ZWQuYXNPYnNlcnZhYmxlKCk7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSByZWFkb25seSBfc291cmNlOiBDb2x1bW5SZXNpemVOb3RpZmllclNvdXJjZSkge31cblxuICAvKiogSW5zdGFudGx5IHJlc2l6ZXMgdGhlIHNwZWNpZmllZCBjb2x1bW4uICovXG4gIHJlc2l6ZShjb2x1bW5JZDogc3RyaW5nLCBzaXplOiBudW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLl9zb3VyY2UudHJpZ2dlclJlc2l6ZS5uZXh0KHtjb2x1bW5JZCwgc2l6ZSwgY29tcGxldGVJbW1lZGlhdGVseTogdHJ1ZX0pO1xuICB9XG59XG4iXX0=