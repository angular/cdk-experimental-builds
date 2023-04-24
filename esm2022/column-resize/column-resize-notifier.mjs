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
class ColumnResizeNotifierSource {
    constructor() {
        /** Emits when an in-progress resize is canceled. */
        this.resizeCanceled = new Subject();
        /** Emits when a resize is applied. */
        this.resizeCompleted = new Subject();
        /** Triggers a resize action. */
        this.triggerResize = new Subject();
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.0.0-rc.2", ngImport: i0, type: ColumnResizeNotifierSource, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "16.0.0-rc.2", ngImport: i0, type: ColumnResizeNotifierSource }); }
}
export { ColumnResizeNotifierSource };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.0.0-rc.2", ngImport: i0, type: ColumnResizeNotifierSource, decorators: [{
            type: Injectable
        }] });
/** Service for triggering column resizes imperatively or being notified of them. */
class ColumnResizeNotifier {
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.0.0-rc.2", ngImport: i0, type: ColumnResizeNotifier, deps: [{ token: ColumnResizeNotifierSource }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "16.0.0-rc.2", ngImport: i0, type: ColumnResizeNotifier }); }
}
export { ColumnResizeNotifier };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.0.0-rc.2", ngImport: i0, type: ColumnResizeNotifier, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: ColumnResizeNotifierSource }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sdW1uLXJlc2l6ZS1ub3RpZmllci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL2NvbHVtbi1yZXNpemUvY29sdW1uLXJlc2l6ZS1ub3RpZmllci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3pDLE9BQU8sRUFBYSxPQUFPLEVBQUMsTUFBTSxNQUFNLENBQUM7O0FBNkJ6Qzs7O0dBR0c7QUFDSCxNQUNhLDBCQUEwQjtJQUR2QztRQUVFLG9EQUFvRDtRQUMzQyxtQkFBYyxHQUFHLElBQUksT0FBTyxFQUFvQixDQUFDO1FBRTFELHNDQUFzQztRQUM3QixvQkFBZSxHQUFHLElBQUksT0FBTyxFQUFjLENBQUM7UUFFckQsZ0NBQWdDO1FBQ3ZCLGtCQUFhLEdBQUcsSUFBSSxPQUFPLEVBQW9CLENBQUM7S0FDMUQ7bUhBVFksMEJBQTBCO3VIQUExQiwwQkFBMEI7O1NBQTFCLDBCQUEwQjtnR0FBMUIsMEJBQTBCO2tCQUR0QyxVQUFVOztBQVlYLG9GQUFvRjtBQUNwRixNQUNhLG9CQUFvQjtJQUkvQixZQUE2QixPQUFtQztRQUFuQyxZQUFPLEdBQVAsT0FBTyxDQUE0QjtRQUhoRSwwQ0FBMEM7UUFDakMsb0JBQWUsR0FBMkIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUM7SUFFYixDQUFDO0lBRXBFLDhDQUE4QztJQUM5QyxNQUFNLENBQUMsUUFBZ0IsRUFBRSxJQUFZO1FBQ25DLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQztZQUM5QixRQUFRO1lBQ1IsSUFBSTtZQUNKLG1CQUFtQixFQUFFLElBQUk7WUFDekIsY0FBYyxFQUFFLElBQUk7U0FDckIsQ0FBQyxDQUFDO0lBQ0wsQ0FBQzttSEFkVSxvQkFBb0I7dUhBQXBCLG9CQUFvQjs7U0FBcEIsb0JBQW9CO2dHQUFwQixvQkFBb0I7a0JBRGhDLFVBQVUiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7T2JzZXJ2YWJsZSwgU3ViamVjdH0gZnJvbSAncnhqcyc7XG5cbi8qKiBJbmRpY2F0ZXMgdGhlIHdpZHRoIG9mIGEgY29sdW1uLiAqL1xuZXhwb3J0IGludGVyZmFjZSBDb2x1bW5TaXplIHtcbiAgLyoqIFRoZSBJRC9uYW1lIG9mIHRoZSBjb2x1bW4sIGFzIGRlZmluZWQgaW4gQ2RrQ29sdW1uRGVmLiAqL1xuICByZWFkb25seSBjb2x1bW5JZDogc3RyaW5nO1xuXG4gIC8qKiBUaGUgd2lkdGggaW4gcGl4ZWxzIG9mIHRoZSBjb2x1bW4uICovXG4gIHJlYWRvbmx5IHNpemU6IG51bWJlcjtcblxuICAvKiogVGhlIHdpZHRoIGluIHBpeGVscyBvZiB0aGUgY29sdW1uIHByaW9yIHRvIHRoaXMgdXBkYXRlLCBpZiBrbm93bi4gKi9cbiAgcmVhZG9ubHkgcHJldmlvdXNTaXplPzogbnVtYmVyO1xufVxuXG4vKiogSW50ZXJmYWNlIGRlc2NyaWJpbmcgY29sdW1uIHNpemUgY2hhbmdlcy4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ29sdW1uU2l6ZUFjdGlvbiBleHRlbmRzIENvbHVtblNpemUge1xuICAvKipcbiAgICogV2hldGhlciB0aGUgcmVzaXplIGFjdGlvbiBzaG91bGQgYmUgYXBwbGllZCBpbnN0YW50YW5lb3VzbHkuIEZhbHNlIGZvciBldmVudHMgdHJpZ2dlcmVkIGR1cmluZ1xuICAgKiBhIFVJLXRyaWdnZXJlZCByZXNpemUgKHN1Y2ggYXMgd2l0aCB0aGUgbW91c2UpIHVudGlsIHRoZSBtb3VzZSBidXR0b24gaXMgcmVsZWFzZWQuIFRydWVcbiAgICogZm9yIGFsbCBwcm9ncmFtbWF0aWNhbGx5IHRyaWdnZXJlZCByZXNpemVzLlxuICAgKi9cbiAgcmVhZG9ubHkgY29tcGxldGVJbW1lZGlhdGVseT86IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhlIHJlc2l6ZSBhY3Rpb24gaXMgYmVpbmcgYXBwbGllZCB0byBhIHN0aWNreS9zdGlja3lFbmQgY29sdW1uLlxuICAgKi9cbiAgcmVhZG9ubHkgaXNTdGlja3lDb2x1bW4/OiBib29sZWFuO1xufVxuXG4vKipcbiAqIE9yaWdpbmF0aW5nIHNvdXJjZSBvZiBjb2x1bW4gcmVzaXplIGV2ZW50cyB3aXRoaW4gYSB0YWJsZS5cbiAqIEBkb2NzLXByaXZhdGVcbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIENvbHVtblJlc2l6ZU5vdGlmaWVyU291cmNlIHtcbiAgLyoqIEVtaXRzIHdoZW4gYW4gaW4tcHJvZ3Jlc3MgcmVzaXplIGlzIGNhbmNlbGVkLiAqL1xuICByZWFkb25seSByZXNpemVDYW5jZWxlZCA9IG5ldyBTdWJqZWN0PENvbHVtblNpemVBY3Rpb24+KCk7XG5cbiAgLyoqIEVtaXRzIHdoZW4gYSByZXNpemUgaXMgYXBwbGllZC4gKi9cbiAgcmVhZG9ubHkgcmVzaXplQ29tcGxldGVkID0gbmV3IFN1YmplY3Q8Q29sdW1uU2l6ZT4oKTtcblxuICAvKiogVHJpZ2dlcnMgYSByZXNpemUgYWN0aW9uLiAqL1xuICByZWFkb25seSB0cmlnZ2VyUmVzaXplID0gbmV3IFN1YmplY3Q8Q29sdW1uU2l6ZUFjdGlvbj4oKTtcbn1cblxuLyoqIFNlcnZpY2UgZm9yIHRyaWdnZXJpbmcgY29sdW1uIHJlc2l6ZXMgaW1wZXJhdGl2ZWx5IG9yIGJlaW5nIG5vdGlmaWVkIG9mIHRoZW0uICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgQ29sdW1uUmVzaXplTm90aWZpZXIge1xuICAvKiogRW1pdHMgd2hlbmV2ZXIgYSBjb2x1bW4gaXMgcmVzaXplZC4gKi9cbiAgcmVhZG9ubHkgcmVzaXplQ29tcGxldGVkOiBPYnNlcnZhYmxlPENvbHVtblNpemU+ID0gdGhpcy5fc291cmNlLnJlc2l6ZUNvbXBsZXRlZDtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHJlYWRvbmx5IF9zb3VyY2U6IENvbHVtblJlc2l6ZU5vdGlmaWVyU291cmNlKSB7fVxuXG4gIC8qKiBJbnN0YW50bHkgcmVzaXplcyB0aGUgc3BlY2lmaWVkIGNvbHVtbi4gKi9cbiAgcmVzaXplKGNvbHVtbklkOiBzdHJpbmcsIHNpemU6IG51bWJlcik6IHZvaWQge1xuICAgIHRoaXMuX3NvdXJjZS50cmlnZ2VyUmVzaXplLm5leHQoe1xuICAgICAgY29sdW1uSWQsXG4gICAgICBzaXplLFxuICAgICAgY29tcGxldGVJbW1lZGlhdGVseTogdHJ1ZSxcbiAgICAgIGlzU3RpY2t5Q29sdW1uOiB0cnVlLFxuICAgIH0pO1xuICB9XG59XG4iXX0=