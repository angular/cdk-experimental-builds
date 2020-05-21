/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __decorate, __metadata } from "tslib";
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
/**
 * Originating source of column resize events within a table.
 * @docs-private
 */
let ColumnResizeNotifierSource = /** @class */ (() => {
    let ColumnResizeNotifierSource = class ColumnResizeNotifierSource {
        constructor() {
            /** Emits when an in-progress resize is canceled. */
            this.resizeCanceled = new Subject();
            /** Emits when a resize is applied. */
            this.resizeCompleted = new Subject();
            /** Triggers a resize action. */
            this.triggerResize = new Subject();
        }
    };
    ColumnResizeNotifierSource = __decorate([
        Injectable()
    ], ColumnResizeNotifierSource);
    return ColumnResizeNotifierSource;
})();
export { ColumnResizeNotifierSource };
/** Service for triggering column resizes imperatively or being notified of them. */
let ColumnResizeNotifier = /** @class */ (() => {
    let ColumnResizeNotifier = class ColumnResizeNotifier {
        constructor(_source) {
            this._source = _source;
            /** Emits whenever a column is resized. */
            this.resizeCompleted = this._source.resizeCompleted.asObservable();
        }
        /** Instantly resizes the specified column. */
        resize(columnId, size) {
            this._source.triggerResize.next({ columnId, size, completeImmediately: true });
        }
    };
    ColumnResizeNotifier = __decorate([
        Injectable(),
        __metadata("design:paramtypes", [ColumnResizeNotifierSource])
    ], ColumnResizeNotifier);
    return ColumnResizeNotifier;
})();
export { ColumnResizeNotifier };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sdW1uLXJlc2l6ZS1ub3RpZmllci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL2NvbHVtbi1yZXNpemUvY29sdW1uLXJlc2l6ZS1ub3RpZmllci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7O0FBRUgsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUN6QyxPQUFPLEVBQWEsT0FBTyxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBd0J6Qzs7O0dBR0c7QUFFSDtJQUFBLElBQWEsMEJBQTBCLEdBQXZDLE1BQWEsMEJBQTBCO1FBQXZDO1lBQ0Usb0RBQW9EO1lBQzNDLG1CQUFjLEdBQUcsSUFBSSxPQUFPLEVBQW9CLENBQUM7WUFFMUQsc0NBQXNDO1lBQzdCLG9CQUFlLEdBQUcsSUFBSSxPQUFPLEVBQWMsQ0FBQztZQUVyRCxnQ0FBZ0M7WUFDdkIsa0JBQWEsR0FBRyxJQUFJLE9BQU8sRUFBb0IsQ0FBQztRQUMzRCxDQUFDO0tBQUEsQ0FBQTtJQVRZLDBCQUEwQjtRQUR0QyxVQUFVLEVBQUU7T0FDQSwwQkFBMEIsQ0FTdEM7SUFBRCxpQ0FBQztLQUFBO1NBVFksMEJBQTBCO0FBV3ZDLG9GQUFvRjtBQUVwRjtJQUFBLElBQWEsb0JBQW9CLEdBQWpDLE1BQWEsb0JBQW9CO1FBSS9CLFlBQTZCLE9BQW1DO1lBQW5DLFlBQU8sR0FBUCxPQUFPLENBQTRCO1lBSGhFLDBDQUEwQztZQUNqQyxvQkFBZSxHQUEyQixJQUFJLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUU1QixDQUFDO1FBRXBFLDhDQUE4QztRQUM5QyxNQUFNLENBQUMsUUFBZ0IsRUFBRSxJQUFZO1lBQ25DLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxFQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsbUJBQW1CLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQztRQUMvRSxDQUFDO0tBQ0YsQ0FBQTtJQVZZLG9CQUFvQjtRQURoQyxVQUFVLEVBQUU7eUNBSzJCLDBCQUEwQjtPQUpyRCxvQkFBb0IsQ0FVaEM7SUFBRCwyQkFBQztLQUFBO1NBVlksb0JBQW9CIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge09ic2VydmFibGUsIFN1YmplY3R9IGZyb20gJ3J4anMnO1xuXG4vKiogSW5kaWNhdGVzIHRoZSB3aWR0aCBvZiBhIGNvbHVtbi4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ29sdW1uU2l6ZSB7XG4gIC8qKiBUaGUgSUQvbmFtZSBvZiB0aGUgY29sdW1uLCBhcyBkZWZpbmVkIGluIENka0NvbHVtbkRlZi4gKi9cbiAgcmVhZG9ubHkgY29sdW1uSWQ6IHN0cmluZztcblxuICAvKiogVGhlIHdpZHRoIGluIHBpeGVscyBvZiB0aGUgY29sdW1uLiAqL1xuICByZWFkb25seSBzaXplOiBudW1iZXI7XG5cbiAgLyoqIFRoZSB3aWR0aCBpbiBwaXhlbHMgb2YgdGhlIGNvbHVtbiBwcmlvciB0byB0aGlzIHVwZGF0ZSwgaWYga25vd24uICovXG4gIHJlYWRvbmx5IHByZXZpb3VzU2l6ZT86IG51bWJlcjtcbn1cblxuLyoqIEludGVyZmFjZSBkZXNjcmliaW5nIGNvbHVtbiBzaXplIGNoYW5nZXMuICovXG5leHBvcnQgaW50ZXJmYWNlIENvbHVtblNpemVBY3Rpb24gZXh0ZW5kcyBDb2x1bW5TaXplIHtcbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhlIHJlc2l6ZSBhY3Rpb24gc2hvdWxkIGJlIGFwcGxpZWQgaW5zdGFudGFuZW91c2x5LiBGYWxzZSBmb3IgZXZlbnRzIHRyaWdnZXJlZCBkdXJpbmdcbiAgICogYSBVSS10cmlnZ2VyZWQgcmVzaXplIChzdWNoIGFzIHdpdGggdGhlIG1vdXNlKSB1bnRpbCB0aGUgbW91c2UgYnV0dG9uIGlzIHJlbGVhc2VkLiBUcnVlXG4gICAqIGZvciBhbGwgcHJvZ3JhbWF0aWNhbGx5IHRyaWdnZXJlZCByZXNpemVzLlxuICAgKi9cbiAgcmVhZG9ubHkgY29tcGxldGVJbW1lZGlhdGVseT86IGJvb2xlYW47XG59XG5cbi8qKlxuICogT3JpZ2luYXRpbmcgc291cmNlIG9mIGNvbHVtbiByZXNpemUgZXZlbnRzIHdpdGhpbiBhIHRhYmxlLlxuICogQGRvY3MtcHJpdmF0ZVxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgQ29sdW1uUmVzaXplTm90aWZpZXJTb3VyY2Uge1xuICAvKiogRW1pdHMgd2hlbiBhbiBpbi1wcm9ncmVzcyByZXNpemUgaXMgY2FuY2VsZWQuICovXG4gIHJlYWRvbmx5IHJlc2l6ZUNhbmNlbGVkID0gbmV3IFN1YmplY3Q8Q29sdW1uU2l6ZUFjdGlvbj4oKTtcblxuICAvKiogRW1pdHMgd2hlbiBhIHJlc2l6ZSBpcyBhcHBsaWVkLiAqL1xuICByZWFkb25seSByZXNpemVDb21wbGV0ZWQgPSBuZXcgU3ViamVjdDxDb2x1bW5TaXplPigpO1xuXG4gIC8qKiBUcmlnZ2VycyBhIHJlc2l6ZSBhY3Rpb24uICovXG4gIHJlYWRvbmx5IHRyaWdnZXJSZXNpemUgPSBuZXcgU3ViamVjdDxDb2x1bW5TaXplQWN0aW9uPigpO1xufVxuXG4vKiogU2VydmljZSBmb3IgdHJpZ2dlcmluZyBjb2x1bW4gcmVzaXplcyBpbXBlcmF0aXZlbHkgb3IgYmVpbmcgbm90aWZpZWQgb2YgdGhlbS4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBDb2x1bW5SZXNpemVOb3RpZmllciB7XG4gIC8qKiBFbWl0cyB3aGVuZXZlciBhIGNvbHVtbiBpcyByZXNpemVkLiAqL1xuICByZWFkb25seSByZXNpemVDb21wbGV0ZWQ6IE9ic2VydmFibGU8Q29sdW1uU2l6ZT4gPSB0aGlzLl9zb3VyY2UucmVzaXplQ29tcGxldGVkLmFzT2JzZXJ2YWJsZSgpO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgX3NvdXJjZTogQ29sdW1uUmVzaXplTm90aWZpZXJTb3VyY2UpIHt9XG5cbiAgLyoqIEluc3RhbnRseSByZXNpemVzIHRoZSBzcGVjaWZpZWQgY29sdW1uLiAqL1xuICByZXNpemUoY29sdW1uSWQ6IHN0cmluZywgc2l6ZTogbnVtYmVyKTogdm9pZCB7XG4gICAgdGhpcy5fc291cmNlLnRyaWdnZXJSZXNpemUubmV4dCh7Y29sdW1uSWQsIHNpemUsIGNvbXBsZXRlSW1tZWRpYXRlbHk6IHRydWV9KTtcbiAgfVxufVxuIl19