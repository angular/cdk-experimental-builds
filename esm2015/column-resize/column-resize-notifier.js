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
    /** @nocollapse */
    ColumnResizeNotifier.ctorParameters = () => [
        { type: ColumnResizeNotifierSource }
    ];
    return ColumnResizeNotifier;
})();
export { ColumnResizeNotifier };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sdW1uLXJlc2l6ZS1ub3RpZmllci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL2NvbHVtbi1yZXNpemUvY29sdW1uLXJlc2l6ZS1ub3RpZmllci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3pDLE9BQU8sRUFBYSxPQUFPLEVBQUMsTUFBTSxNQUFNLENBQUM7QUF3QnpDOzs7R0FHRztBQUNIO0lBQUEsTUFDYSwwQkFBMEI7UUFEdkM7WUFFRSxvREFBb0Q7WUFDM0MsbUJBQWMsR0FBRyxJQUFJLE9BQU8sRUFBb0IsQ0FBQztZQUUxRCxzQ0FBc0M7WUFDN0Isb0JBQWUsR0FBRyxJQUFJLE9BQU8sRUFBYyxDQUFDO1lBRXJELGdDQUFnQztZQUN2QixrQkFBYSxHQUFHLElBQUksT0FBTyxFQUFvQixDQUFDO1FBQzNELENBQUM7OztnQkFWQSxVQUFVOztJQVVYLGlDQUFDO0tBQUE7U0FUWSwwQkFBMEI7QUFXdkMsb0ZBQW9GO0FBQ3BGO0lBQUEsTUFDYSxvQkFBb0I7UUFJL0IsWUFBNkIsT0FBbUM7WUFBbkMsWUFBTyxHQUFQLE9BQU8sQ0FBNEI7WUFIaEUsMENBQTBDO1lBQ2pDLG9CQUFlLEdBQTJCLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBRTVCLENBQUM7UUFFcEUsOENBQThDO1FBQzlDLE1BQU0sQ0FBQyxRQUFnQixFQUFFLElBQVk7WUFDbkMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLEVBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxtQkFBbUIsRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO1FBQy9FLENBQUM7OztnQkFWRixVQUFVOzs7O2dCQUs2QiwwQkFBMEI7O0lBTWxFLDJCQUFDO0tBQUE7U0FWWSxvQkFBb0IiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7T2JzZXJ2YWJsZSwgU3ViamVjdH0gZnJvbSAncnhqcyc7XG5cbi8qKiBJbmRpY2F0ZXMgdGhlIHdpZHRoIG9mIGEgY29sdW1uLiAqL1xuZXhwb3J0IGludGVyZmFjZSBDb2x1bW5TaXplIHtcbiAgLyoqIFRoZSBJRC9uYW1lIG9mIHRoZSBjb2x1bW4sIGFzIGRlZmluZWQgaW4gQ2RrQ29sdW1uRGVmLiAqL1xuICByZWFkb25seSBjb2x1bW5JZDogc3RyaW5nO1xuXG4gIC8qKiBUaGUgd2lkdGggaW4gcGl4ZWxzIG9mIHRoZSBjb2x1bW4uICovXG4gIHJlYWRvbmx5IHNpemU6IG51bWJlcjtcblxuICAvKiogVGhlIHdpZHRoIGluIHBpeGVscyBvZiB0aGUgY29sdW1uIHByaW9yIHRvIHRoaXMgdXBkYXRlLCBpZiBrbm93bi4gKi9cbiAgcmVhZG9ubHkgcHJldmlvdXNTaXplPzogbnVtYmVyO1xufVxuXG4vKiogSW50ZXJmYWNlIGRlc2NyaWJpbmcgY29sdW1uIHNpemUgY2hhbmdlcy4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ29sdW1uU2l6ZUFjdGlvbiBleHRlbmRzIENvbHVtblNpemUge1xuICAvKipcbiAgICogV2hldGhlciB0aGUgcmVzaXplIGFjdGlvbiBzaG91bGQgYmUgYXBwbGllZCBpbnN0YW50YW5lb3VzbHkuIEZhbHNlIGZvciBldmVudHMgdHJpZ2dlcmVkIGR1cmluZ1xuICAgKiBhIFVJLXRyaWdnZXJlZCByZXNpemUgKHN1Y2ggYXMgd2l0aCB0aGUgbW91c2UpIHVudGlsIHRoZSBtb3VzZSBidXR0b24gaXMgcmVsZWFzZWQuIFRydWVcbiAgICogZm9yIGFsbCBwcm9ncmFtYXRpY2FsbHkgdHJpZ2dlcmVkIHJlc2l6ZXMuXG4gICAqL1xuICByZWFkb25seSBjb21wbGV0ZUltbWVkaWF0ZWx5PzogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBPcmlnaW5hdGluZyBzb3VyY2Ugb2YgY29sdW1uIHJlc2l6ZSBldmVudHMgd2l0aGluIGEgdGFibGUuXG4gKiBAZG9jcy1wcml2YXRlXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBDb2x1bW5SZXNpemVOb3RpZmllclNvdXJjZSB7XG4gIC8qKiBFbWl0cyB3aGVuIGFuIGluLXByb2dyZXNzIHJlc2l6ZSBpcyBjYW5jZWxlZC4gKi9cbiAgcmVhZG9ubHkgcmVzaXplQ2FuY2VsZWQgPSBuZXcgU3ViamVjdDxDb2x1bW5TaXplQWN0aW9uPigpO1xuXG4gIC8qKiBFbWl0cyB3aGVuIGEgcmVzaXplIGlzIGFwcGxpZWQuICovXG4gIHJlYWRvbmx5IHJlc2l6ZUNvbXBsZXRlZCA9IG5ldyBTdWJqZWN0PENvbHVtblNpemU+KCk7XG5cbiAgLyoqIFRyaWdnZXJzIGEgcmVzaXplIGFjdGlvbi4gKi9cbiAgcmVhZG9ubHkgdHJpZ2dlclJlc2l6ZSA9IG5ldyBTdWJqZWN0PENvbHVtblNpemVBY3Rpb24+KCk7XG59XG5cbi8qKiBTZXJ2aWNlIGZvciB0cmlnZ2VyaW5nIGNvbHVtbiByZXNpemVzIGltcGVyYXRpdmVseSBvciBiZWluZyBub3RpZmllZCBvZiB0aGVtLiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIENvbHVtblJlc2l6ZU5vdGlmaWVyIHtcbiAgLyoqIEVtaXRzIHdoZW5ldmVyIGEgY29sdW1uIGlzIHJlc2l6ZWQuICovXG4gIHJlYWRvbmx5IHJlc2l6ZUNvbXBsZXRlZDogT2JzZXJ2YWJsZTxDb2x1bW5TaXplPiA9IHRoaXMuX3NvdXJjZS5yZXNpemVDb21wbGV0ZWQuYXNPYnNlcnZhYmxlKCk7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSByZWFkb25seSBfc291cmNlOiBDb2x1bW5SZXNpemVOb3RpZmllclNvdXJjZSkge31cblxuICAvKiogSW5zdGFudGx5IHJlc2l6ZXMgdGhlIHNwZWNpZmllZCBjb2x1bW4uICovXG4gIHJlc2l6ZShjb2x1bW5JZDogc3RyaW5nLCBzaXplOiBudW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLl9zb3VyY2UudHJpZ2dlclJlc2l6ZS5uZXh0KHtjb2x1bW5JZCwgc2l6ZSwgY29tcGxldGVJbW1lZGlhdGVseTogdHJ1ZX0pO1xuICB9XG59XG4iXX0=