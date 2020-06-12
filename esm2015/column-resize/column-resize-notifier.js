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
 * Originating source of column resize events within a table.
 * @docs-private
 */
let ColumnResizeNotifierSource = /** @class */ (() => {
    class ColumnResizeNotifierSource {
        constructor() {
            /** Emits when an in-progress resize is canceled. */
            this.resizeCanceled = new Subject();
            /** Emits when a resize is applied. */
            this.resizeCompleted = new Subject();
            /** Triggers a resize action. */
            this.triggerResize = new Subject();
        }
    }
    ColumnResizeNotifierSource.decorators = [
        { type: Injectable }
    ];
    return ColumnResizeNotifierSource;
})();
export { ColumnResizeNotifierSource };
/** Service for triggering column resizes imperatively or being notified of them. */
let ColumnResizeNotifier = /** @class */ (() => {
    class ColumnResizeNotifier {
        constructor(_source) {
            this._source = _source;
            /** Emits whenever a column is resized. */
            this.resizeCompleted = this._source.resizeCompleted.asObservable();
        }
        /** Instantly resizes the specified column. */
        resize(columnId, size) {
            this._source.triggerResize.next({ columnId, size, completeImmediately: true });
        }
    }
    ColumnResizeNotifier.decorators = [
        { type: Injectable }
    ];
    ColumnResizeNotifier.ctorParameters = () => [
        { type: ColumnResizeNotifierSource }
    ];
    return ColumnResizeNotifier;
})();
export { ColumnResizeNotifier };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sdW1uLXJlc2l6ZS1ub3RpZmllci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL2NvbHVtbi1yZXNpemUvY29sdW1uLXJlc2l6ZS1ub3RpZmllci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3pDLE9BQU8sRUFBYSxPQUFPLEVBQUMsTUFBTSxNQUFNLENBQUM7QUF3QnpDOzs7R0FHRztBQUNIO0lBQUEsTUFDYSwwQkFBMEI7UUFEdkM7WUFFRSxvREFBb0Q7WUFDM0MsbUJBQWMsR0FBRyxJQUFJLE9BQU8sRUFBb0IsQ0FBQztZQUUxRCxzQ0FBc0M7WUFDN0Isb0JBQWUsR0FBRyxJQUFJLE9BQU8sRUFBYyxDQUFDO1lBRXJELGdDQUFnQztZQUN2QixrQkFBYSxHQUFHLElBQUksT0FBTyxFQUFvQixDQUFDO1FBQzNELENBQUM7OztnQkFWQSxVQUFVOztJQVVYLGlDQUFDO0tBQUE7U0FUWSwwQkFBMEI7QUFXdkMsb0ZBQW9GO0FBQ3BGO0lBQUEsTUFDYSxvQkFBb0I7UUFJL0IsWUFBNkIsT0FBbUM7WUFBbkMsWUFBTyxHQUFQLE9BQU8sQ0FBNEI7WUFIaEUsMENBQTBDO1lBQ2pDLG9CQUFlLEdBQTJCLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBRTVCLENBQUM7UUFFcEUsOENBQThDO1FBQzlDLE1BQU0sQ0FBQyxRQUFnQixFQUFFLElBQVk7WUFDbkMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLEVBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxtQkFBbUIsRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO1FBQy9FLENBQUM7OztnQkFWRixVQUFVOzs7Z0JBSzZCLDBCQUEwQjs7SUFNbEUsMkJBQUM7S0FBQTtTQVZZLG9CQUFvQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0luamVjdGFibGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtPYnNlcnZhYmxlLCBTdWJqZWN0fSBmcm9tICdyeGpzJztcblxuLyoqIEluZGljYXRlcyB0aGUgd2lkdGggb2YgYSBjb2x1bW4uICovXG5leHBvcnQgaW50ZXJmYWNlIENvbHVtblNpemUge1xuICAvKiogVGhlIElEL25hbWUgb2YgdGhlIGNvbHVtbiwgYXMgZGVmaW5lZCBpbiBDZGtDb2x1bW5EZWYuICovXG4gIHJlYWRvbmx5IGNvbHVtbklkOiBzdHJpbmc7XG5cbiAgLyoqIFRoZSB3aWR0aCBpbiBwaXhlbHMgb2YgdGhlIGNvbHVtbi4gKi9cbiAgcmVhZG9ubHkgc2l6ZTogbnVtYmVyO1xuXG4gIC8qKiBUaGUgd2lkdGggaW4gcGl4ZWxzIG9mIHRoZSBjb2x1bW4gcHJpb3IgdG8gdGhpcyB1cGRhdGUsIGlmIGtub3duLiAqL1xuICByZWFkb25seSBwcmV2aW91c1NpemU/OiBudW1iZXI7XG59XG5cbi8qKiBJbnRlcmZhY2UgZGVzY3JpYmluZyBjb2x1bW4gc2l6ZSBjaGFuZ2VzLiAqL1xuZXhwb3J0IGludGVyZmFjZSBDb2x1bW5TaXplQWN0aW9uIGV4dGVuZHMgQ29sdW1uU2l6ZSB7XG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoZSByZXNpemUgYWN0aW9uIHNob3VsZCBiZSBhcHBsaWVkIGluc3RhbnRhbmVvdXNseS4gRmFsc2UgZm9yIGV2ZW50cyB0cmlnZ2VyZWQgZHVyaW5nXG4gICAqIGEgVUktdHJpZ2dlcmVkIHJlc2l6ZSAoc3VjaCBhcyB3aXRoIHRoZSBtb3VzZSkgdW50aWwgdGhlIG1vdXNlIGJ1dHRvbiBpcyByZWxlYXNlZC4gVHJ1ZVxuICAgKiBmb3IgYWxsIHByb2dyYW1hdGljYWxseSB0cmlnZ2VyZWQgcmVzaXplcy5cbiAgICovXG4gIHJlYWRvbmx5IGNvbXBsZXRlSW1tZWRpYXRlbHk/OiBib29sZWFuO1xufVxuXG4vKipcbiAqIE9yaWdpbmF0aW5nIHNvdXJjZSBvZiBjb2x1bW4gcmVzaXplIGV2ZW50cyB3aXRoaW4gYSB0YWJsZS5cbiAqIEBkb2NzLXByaXZhdGVcbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIENvbHVtblJlc2l6ZU5vdGlmaWVyU291cmNlIHtcbiAgLyoqIEVtaXRzIHdoZW4gYW4gaW4tcHJvZ3Jlc3MgcmVzaXplIGlzIGNhbmNlbGVkLiAqL1xuICByZWFkb25seSByZXNpemVDYW5jZWxlZCA9IG5ldyBTdWJqZWN0PENvbHVtblNpemVBY3Rpb24+KCk7XG5cbiAgLyoqIEVtaXRzIHdoZW4gYSByZXNpemUgaXMgYXBwbGllZC4gKi9cbiAgcmVhZG9ubHkgcmVzaXplQ29tcGxldGVkID0gbmV3IFN1YmplY3Q8Q29sdW1uU2l6ZT4oKTtcblxuICAvKiogVHJpZ2dlcnMgYSByZXNpemUgYWN0aW9uLiAqL1xuICByZWFkb25seSB0cmlnZ2VyUmVzaXplID0gbmV3IFN1YmplY3Q8Q29sdW1uU2l6ZUFjdGlvbj4oKTtcbn1cblxuLyoqIFNlcnZpY2UgZm9yIHRyaWdnZXJpbmcgY29sdW1uIHJlc2l6ZXMgaW1wZXJhdGl2ZWx5IG9yIGJlaW5nIG5vdGlmaWVkIG9mIHRoZW0uICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgQ29sdW1uUmVzaXplTm90aWZpZXIge1xuICAvKiogRW1pdHMgd2hlbmV2ZXIgYSBjb2x1bW4gaXMgcmVzaXplZC4gKi9cbiAgcmVhZG9ubHkgcmVzaXplQ29tcGxldGVkOiBPYnNlcnZhYmxlPENvbHVtblNpemU+ID0gdGhpcy5fc291cmNlLnJlc2l6ZUNvbXBsZXRlZC5hc09ic2VydmFibGUoKTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHJlYWRvbmx5IF9zb3VyY2U6IENvbHVtblJlc2l6ZU5vdGlmaWVyU291cmNlKSB7fVxuXG4gIC8qKiBJbnN0YW50bHkgcmVzaXplcyB0aGUgc3BlY2lmaWVkIGNvbHVtbi4gKi9cbiAgcmVzaXplKGNvbHVtbklkOiBzdHJpbmcsIHNpemU6IG51bWJlcik6IHZvaWQge1xuICAgIHRoaXMuX3NvdXJjZS50cmlnZ2VyUmVzaXplLm5leHQoe2NvbHVtbklkLCBzaXplLCBjb21wbGV0ZUltbWVkaWF0ZWx5OiB0cnVlfSk7XG4gIH1cbn1cbiJdfQ==