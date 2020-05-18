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
let ColumnResizeNotifierSource = /** @class */ (() => {
    /**
     * Originating source of column resize events within a table.
     * \@docs-private
     */
    class ColumnResizeNotifierSource {
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
    return ColumnResizeNotifierSource;
})();
export { ColumnResizeNotifierSource };
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
let ColumnResizeNotifier = /** @class */ (() => {
    /**
     * Service for triggering column resizes imperatively or being notified of them.
     */
    class ColumnResizeNotifier {
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
    return ColumnResizeNotifier;
})();
export { ColumnResizeNotifier };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sdW1uLXJlc2l6ZS1ub3RpZmllci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL2NvbHVtbi1yZXNpemUvY29sdW1uLXJlc2l6ZS1ub3RpZmllci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFRQSxPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3pDLE9BQU8sRUFBYSxPQUFPLEVBQUMsTUFBTSxNQUFNLENBQUM7Ozs7O0FBR3pDLGdDQVNDOzs7Ozs7SUFQQyw4QkFBMEI7Ozs7O0lBRzFCLDBCQUFzQjs7Ozs7SUFHdEIsa0NBQStCOzs7Ozs7QUFJakMsc0NBT0M7Ozs7Ozs7O0lBREMsK0NBQXVDOzs7Ozs7QUFPekM7Ozs7O0lBQUEsTUFDYSwwQkFBMEI7UUFEdkM7Ozs7WUFHVyxtQkFBYyxHQUFHLElBQUksT0FBTyxFQUFvQixDQUFDOzs7O1lBR2pELG9CQUFlLEdBQUcsSUFBSSxPQUFPLEVBQWMsQ0FBQzs7OztZQUc1QyxrQkFBYSxHQUFHLElBQUksT0FBTyxFQUFvQixDQUFDO1FBQzNELENBQUM7OztnQkFWQSxVQUFVOztJQVVYLGlDQUFDO0tBQUE7U0FUWSwwQkFBMEI7Ozs7OztJQUVyQyxvREFBMEQ7Ozs7O0lBRzFELHFEQUFxRDs7Ozs7SUFHckQsbURBQXlEOzs7OztBQUkzRDs7OztJQUFBLE1BQ2Esb0JBQW9COzs7O1FBSS9CLFlBQTZCLE9BQW1DO1lBQW5DLFlBQU8sR0FBUCxPQUFPLENBQTRCOzs7O1lBRnZELG9CQUFlLEdBQTJCLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBRTVCLENBQUM7Ozs7Ozs7UUFHcEUsTUFBTSxDQUFDLFFBQWdCLEVBQUUsSUFBWTtZQUNuQyxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsRUFBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLG1CQUFtQixFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7UUFDL0UsQ0FBQzs7O2dCQVZGLFVBQVU7Ozs7Z0JBSzZCLDBCQUEwQjs7SUFNbEUsMkJBQUM7S0FBQTtTQVZZLG9CQUFvQjs7Ozs7O0lBRS9CLCtDQUErRjs7Ozs7SUFFbkYsdUNBQW9EIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge09ic2VydmFibGUsIFN1YmplY3R9IGZyb20gJ3J4anMnO1xuXG4vKiogSW5kaWNhdGVzIHRoZSB3aWR0aCBvZiBhIGNvbHVtbi4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ29sdW1uU2l6ZSB7XG4gIC8qKiBUaGUgSUQvbmFtZSBvZiB0aGUgY29sdW1uLCBhcyBkZWZpbmVkIGluIENka0NvbHVtbkRlZi4gKi9cbiAgcmVhZG9ubHkgY29sdW1uSWQ6IHN0cmluZztcblxuICAvKiogVGhlIHdpZHRoIGluIHBpeGVscyBvZiB0aGUgY29sdW1uLiAqL1xuICByZWFkb25seSBzaXplOiBudW1iZXI7XG5cbiAgLyoqIFRoZSB3aWR0aCBpbiBwaXhlbHMgb2YgdGhlIGNvbHVtbiBwcmlvciB0byB0aGlzIHVwZGF0ZSwgaWYga25vd24uICovXG4gIHJlYWRvbmx5IHByZXZpb3VzU2l6ZT86IG51bWJlcjtcbn1cblxuLyoqIEludGVyZmFjZSBkZXNjcmliaW5nIGNvbHVtbiBzaXplIGNoYW5nZXMuICovXG5leHBvcnQgaW50ZXJmYWNlIENvbHVtblNpemVBY3Rpb24gZXh0ZW5kcyBDb2x1bW5TaXplIHtcbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhlIHJlc2l6ZSBhY3Rpb24gc2hvdWxkIGJlIGFwcGxpZWQgaW5zdGFudGFuZW91c2x5LiBGYWxzZSBmb3IgZXZlbnRzIHRyaWdnZXJlZCBkdXJpbmdcbiAgICogYSBVSS10cmlnZ2VyZWQgcmVzaXplIChzdWNoIGFzIHdpdGggdGhlIG1vdXNlKSB1bnRpbCB0aGUgbW91c2UgYnV0dG9uIGlzIHJlbGVhc2VkLiBUcnVlXG4gICAqIGZvciBhbGwgcHJvZ3JhbWF0aWNhbGx5IHRyaWdnZXJlZCByZXNpemVzLlxuICAgKi9cbiAgcmVhZG9ubHkgY29tcGxldGVJbW1lZGlhdGVseT86IGJvb2xlYW47XG59XG5cbi8qKlxuICogT3JpZ2luYXRpbmcgc291cmNlIG9mIGNvbHVtbiByZXNpemUgZXZlbnRzIHdpdGhpbiBhIHRhYmxlLlxuICogQGRvY3MtcHJpdmF0ZVxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgQ29sdW1uUmVzaXplTm90aWZpZXJTb3VyY2Uge1xuICAvKiogRW1pdHMgd2hlbiBhbiBpbi1wcm9ncmVzcyByZXNpemUgaXMgY2FuY2VsZWQuICovXG4gIHJlYWRvbmx5IHJlc2l6ZUNhbmNlbGVkID0gbmV3IFN1YmplY3Q8Q29sdW1uU2l6ZUFjdGlvbj4oKTtcblxuICAvKiogRW1pdHMgd2hlbiBhIHJlc2l6ZSBpcyBhcHBsaWVkLiAqL1xuICByZWFkb25seSByZXNpemVDb21wbGV0ZWQgPSBuZXcgU3ViamVjdDxDb2x1bW5TaXplPigpO1xuXG4gIC8qKiBUcmlnZ2VycyBhIHJlc2l6ZSBhY3Rpb24uICovXG4gIHJlYWRvbmx5IHRyaWdnZXJSZXNpemUgPSBuZXcgU3ViamVjdDxDb2x1bW5TaXplQWN0aW9uPigpO1xufVxuXG4vKiogU2VydmljZSBmb3IgdHJpZ2dlcmluZyBjb2x1bW4gcmVzaXplcyBpbXBlcmF0aXZlbHkgb3IgYmVpbmcgbm90aWZpZWQgb2YgdGhlbS4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBDb2x1bW5SZXNpemVOb3RpZmllciB7XG4gIC8qKiBFbWl0cyB3aGVuZXZlciBhIGNvbHVtbiBpcyByZXNpemVkLiAqL1xuICByZWFkb25seSByZXNpemVDb21wbGV0ZWQ6IE9ic2VydmFibGU8Q29sdW1uU2l6ZT4gPSB0aGlzLl9zb3VyY2UucmVzaXplQ29tcGxldGVkLmFzT2JzZXJ2YWJsZSgpO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgX3NvdXJjZTogQ29sdW1uUmVzaXplTm90aWZpZXJTb3VyY2UpIHt9XG5cbiAgLyoqIEluc3RhbnRseSByZXNpemVzIHRoZSBzcGVjaWZpZWQgY29sdW1uLiAqL1xuICByZXNpemUoY29sdW1uSWQ6IHN0cmluZywgc2l6ZTogbnVtYmVyKTogdm9pZCB7XG4gICAgdGhpcy5fc291cmNlLnRyaWdnZXJSZXNpemUubmV4dCh7Y29sdW1uSWQsIHNpemUsIGNvbXBsZXRlSW1tZWRpYXRlbHk6IHRydWV9KTtcbiAgfVxufVxuIl19