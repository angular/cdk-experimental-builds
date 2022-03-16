/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import * as i0 from "@angular/core";
/**
 * Originating source of column resize events within a table.
 * @docs-private
 */
export class ColumnResizeNotifierSource {
    constructor() {
        /** Emits when an in-progress resize is canceled. */
        this.resizeCanceled = new Subject();
        /** Emits when a resize is applied. */
        this.resizeCompleted = new Subject();
        /** Triggers a resize action. */
        this.triggerResize = new Subject();
    }
}
ColumnResizeNotifierSource.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.3.0", ngImport: i0, type: ColumnResizeNotifierSource, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
ColumnResizeNotifierSource.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.3.0", ngImport: i0, type: ColumnResizeNotifierSource });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.3.0", ngImport: i0, type: ColumnResizeNotifierSource, decorators: [{
            type: Injectable
        }] });
/** Service for triggering column resizes imperatively or being notified of them. */
export class ColumnResizeNotifier {
    constructor(_source) {
        this._source = _source;
        /** Emits whenever a column is resized. */
        this.resizeCompleted = this._source.resizeCompleted;
    }
    /** Instantly resizes the specified column. */
    resize(columnId, size) {
        this._source.triggerResize.next({
            columnId,
            size,
            completeImmediately: true,
            isStickyColumn: true,
        });
    }
}
ColumnResizeNotifier.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.3.0", ngImport: i0, type: ColumnResizeNotifier, deps: [{ token: ColumnResizeNotifierSource }], target: i0.ɵɵFactoryTarget.Injectable });
ColumnResizeNotifier.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.3.0", ngImport: i0, type: ColumnResizeNotifier });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.3.0", ngImport: i0, type: ColumnResizeNotifier, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: ColumnResizeNotifierSource }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sdW1uLXJlc2l6ZS1ub3RpZmllci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL2NvbHVtbi1yZXNpemUvY29sdW1uLXJlc2l6ZS1ub3RpZmllci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3pDLE9BQU8sRUFBYSxPQUFPLEVBQUMsTUFBTSxNQUFNLENBQUM7O0FBNkJ6Qzs7O0dBR0c7QUFFSCxNQUFNLE9BQU8sMEJBQTBCO0lBRHZDO1FBRUUsb0RBQW9EO1FBQzNDLG1CQUFjLEdBQUcsSUFBSSxPQUFPLEVBQW9CLENBQUM7UUFFMUQsc0NBQXNDO1FBQzdCLG9CQUFlLEdBQUcsSUFBSSxPQUFPLEVBQWMsQ0FBQztRQUVyRCxnQ0FBZ0M7UUFDdkIsa0JBQWEsR0FBRyxJQUFJLE9BQU8sRUFBb0IsQ0FBQztLQUMxRDs7dUhBVFksMEJBQTBCOzJIQUExQiwwQkFBMEI7MkZBQTFCLDBCQUEwQjtrQkFEdEMsVUFBVTs7QUFZWCxvRkFBb0Y7QUFFcEYsTUFBTSxPQUFPLG9CQUFvQjtJQUkvQixZQUE2QixPQUFtQztRQUFuQyxZQUFPLEdBQVAsT0FBTyxDQUE0QjtRQUhoRSwwQ0FBMEM7UUFDakMsb0JBQWUsR0FBMkIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUM7SUFFYixDQUFDO0lBRXBFLDhDQUE4QztJQUM5QyxNQUFNLENBQUMsUUFBZ0IsRUFBRSxJQUFZO1FBQ25DLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQztZQUM5QixRQUFRO1lBQ1IsSUFBSTtZQUNKLG1CQUFtQixFQUFFLElBQUk7WUFDekIsY0FBYyxFQUFFLElBQUk7U0FDckIsQ0FBQyxDQUFDO0lBQ0wsQ0FBQzs7aUhBZFUsb0JBQW9CLGtCQUlPLDBCQUEwQjtxSEFKckQsb0JBQW9COzJGQUFwQixvQkFBb0I7a0JBRGhDLFVBQVU7MERBSzZCLDBCQUEwQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0luamVjdGFibGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtPYnNlcnZhYmxlLCBTdWJqZWN0fSBmcm9tICdyeGpzJztcblxuLyoqIEluZGljYXRlcyB0aGUgd2lkdGggb2YgYSBjb2x1bW4uICovXG5leHBvcnQgaW50ZXJmYWNlIENvbHVtblNpemUge1xuICAvKiogVGhlIElEL25hbWUgb2YgdGhlIGNvbHVtbiwgYXMgZGVmaW5lZCBpbiBDZGtDb2x1bW5EZWYuICovXG4gIHJlYWRvbmx5IGNvbHVtbklkOiBzdHJpbmc7XG5cbiAgLyoqIFRoZSB3aWR0aCBpbiBwaXhlbHMgb2YgdGhlIGNvbHVtbi4gKi9cbiAgcmVhZG9ubHkgc2l6ZTogbnVtYmVyO1xuXG4gIC8qKiBUaGUgd2lkdGggaW4gcGl4ZWxzIG9mIHRoZSBjb2x1bW4gcHJpb3IgdG8gdGhpcyB1cGRhdGUsIGlmIGtub3duLiAqL1xuICByZWFkb25seSBwcmV2aW91c1NpemU/OiBudW1iZXI7XG59XG5cbi8qKiBJbnRlcmZhY2UgZGVzY3JpYmluZyBjb2x1bW4gc2l6ZSBjaGFuZ2VzLiAqL1xuZXhwb3J0IGludGVyZmFjZSBDb2x1bW5TaXplQWN0aW9uIGV4dGVuZHMgQ29sdW1uU2l6ZSB7XG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoZSByZXNpemUgYWN0aW9uIHNob3VsZCBiZSBhcHBsaWVkIGluc3RhbnRhbmVvdXNseS4gRmFsc2UgZm9yIGV2ZW50cyB0cmlnZ2VyZWQgZHVyaW5nXG4gICAqIGEgVUktdHJpZ2dlcmVkIHJlc2l6ZSAoc3VjaCBhcyB3aXRoIHRoZSBtb3VzZSkgdW50aWwgdGhlIG1vdXNlIGJ1dHRvbiBpcyByZWxlYXNlZC4gVHJ1ZVxuICAgKiBmb3IgYWxsIHByb2dyYW1tYXRpY2FsbHkgdHJpZ2dlcmVkIHJlc2l6ZXMuXG4gICAqL1xuICByZWFkb25seSBjb21wbGV0ZUltbWVkaWF0ZWx5PzogYm9vbGVhbjtcblxuICAvKipcbiAgICogV2hldGhlciB0aGUgcmVzaXplIGFjdGlvbiBpcyBiZWluZyBhcHBsaWVkIHRvIGEgc3RpY2t5L3N0aWNreUVuZCBjb2x1bW4uXG4gICAqL1xuICByZWFkb25seSBpc1N0aWNreUNvbHVtbj86IGJvb2xlYW47XG59XG5cbi8qKlxuICogT3JpZ2luYXRpbmcgc291cmNlIG9mIGNvbHVtbiByZXNpemUgZXZlbnRzIHdpdGhpbiBhIHRhYmxlLlxuICogQGRvY3MtcHJpdmF0ZVxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgQ29sdW1uUmVzaXplTm90aWZpZXJTb3VyY2Uge1xuICAvKiogRW1pdHMgd2hlbiBhbiBpbi1wcm9ncmVzcyByZXNpemUgaXMgY2FuY2VsZWQuICovXG4gIHJlYWRvbmx5IHJlc2l6ZUNhbmNlbGVkID0gbmV3IFN1YmplY3Q8Q29sdW1uU2l6ZUFjdGlvbj4oKTtcblxuICAvKiogRW1pdHMgd2hlbiBhIHJlc2l6ZSBpcyBhcHBsaWVkLiAqL1xuICByZWFkb25seSByZXNpemVDb21wbGV0ZWQgPSBuZXcgU3ViamVjdDxDb2x1bW5TaXplPigpO1xuXG4gIC8qKiBUcmlnZ2VycyBhIHJlc2l6ZSBhY3Rpb24uICovXG4gIHJlYWRvbmx5IHRyaWdnZXJSZXNpemUgPSBuZXcgU3ViamVjdDxDb2x1bW5TaXplQWN0aW9uPigpO1xufVxuXG4vKiogU2VydmljZSBmb3IgdHJpZ2dlcmluZyBjb2x1bW4gcmVzaXplcyBpbXBlcmF0aXZlbHkgb3IgYmVpbmcgbm90aWZpZWQgb2YgdGhlbS4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBDb2x1bW5SZXNpemVOb3RpZmllciB7XG4gIC8qKiBFbWl0cyB3aGVuZXZlciBhIGNvbHVtbiBpcyByZXNpemVkLiAqL1xuICByZWFkb25seSByZXNpemVDb21wbGV0ZWQ6IE9ic2VydmFibGU8Q29sdW1uU2l6ZT4gPSB0aGlzLl9zb3VyY2UucmVzaXplQ29tcGxldGVkO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgX3NvdXJjZTogQ29sdW1uUmVzaXplTm90aWZpZXJTb3VyY2UpIHt9XG5cbiAgLyoqIEluc3RhbnRseSByZXNpemVzIHRoZSBzcGVjaWZpZWQgY29sdW1uLiAqL1xuICByZXNpemUoY29sdW1uSWQ6IHN0cmluZywgc2l6ZTogbnVtYmVyKTogdm9pZCB7XG4gICAgdGhpcy5fc291cmNlLnRyaWdnZXJSZXNpemUubmV4dCh7XG4gICAgICBjb2x1bW5JZCxcbiAgICAgIHNpemUsXG4gICAgICBjb21wbGV0ZUltbWVkaWF0ZWx5OiB0cnVlLFxuICAgICAgaXNTdGlja3lDb2x1bW46IHRydWUsXG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==