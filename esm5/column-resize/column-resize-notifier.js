/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
/** Originating source of column resize events within a table. */
var ColumnResizeNotifierSource = /** @class */ (function () {
    function ColumnResizeNotifierSource() {
        /** Emits when an in-progress resize is canceled. */
        this.resizeCanceled = new Subject();
        /** Emits when a resize is applied. */
        this.resizeCompleted = new Subject();
        /** Triggers a resize action. */
        this.triggerResize = new Subject();
    }
    ColumnResizeNotifierSource.decorators = [
        { type: Injectable }
    ];
    return ColumnResizeNotifierSource;
}());
export { ColumnResizeNotifierSource };
/** Service for triggering column resizes imperatively or being notified of them. */
var ColumnResizeNotifier = /** @class */ (function () {
    function ColumnResizeNotifier(_source) {
        this._source = _source;
        /** Emits whenever a column is resized. */
        this.resizeCompleted = this._source.resizeCompleted.asObservable();
    }
    /** Instantly resizes the specified column. */
    ColumnResizeNotifier.prototype.resize = function (columnId, size) {
        this._source.triggerResize.next({ columnId: columnId, size: size, completeImmediately: true });
    };
    ColumnResizeNotifier.decorators = [
        { type: Injectable }
    ];
    /** @nocollapse */
    ColumnResizeNotifier.ctorParameters = function () { return [
        { type: ColumnResizeNotifierSource }
    ]; };
    return ColumnResizeNotifier;
}());
export { ColumnResizeNotifier };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sdW1uLXJlc2l6ZS1ub3RpZmllci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL2NvbHVtbi1yZXNpemUvY29sdW1uLXJlc2l6ZS1ub3RpZmllci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3pDLE9BQU8sRUFBYSxPQUFPLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFxQnpDLGlFQUFpRTtBQUNqRTtJQUFBO1FBRUUsb0RBQW9EO1FBQzNDLG1CQUFjLEdBQUcsSUFBSSxPQUFPLEVBQW9CLENBQUM7UUFFMUQsc0NBQXNDO1FBQzdCLG9CQUFlLEdBQUcsSUFBSSxPQUFPLEVBQWMsQ0FBQztRQUVyRCxnQ0FBZ0M7UUFDdkIsa0JBQWEsR0FBRyxJQUFJLE9BQU8sRUFBb0IsQ0FBQztJQUMzRCxDQUFDOztnQkFWQSxVQUFVOztJQVVYLGlDQUFDO0NBQUEsQUFWRCxJQVVDO1NBVFksMEJBQTBCO0FBV3ZDLG9GQUFvRjtBQUNwRjtJQUtFLDhCQUE2QixPQUFtQztRQUFuQyxZQUFPLEdBQVAsT0FBTyxDQUE0QjtRQUhoRSwwQ0FBMEM7UUFDakMsb0JBQWUsR0FBMkIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsWUFBWSxFQUFFLENBQUM7SUFFNUIsQ0FBQztJQUVwRSw4Q0FBOEM7SUFDOUMscUNBQU0sR0FBTixVQUFPLFFBQWdCLEVBQUUsSUFBWTtRQUNuQyxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsRUFBQyxRQUFRLFVBQUEsRUFBRSxJQUFJLE1BQUEsRUFBRSxtQkFBbUIsRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO0lBQy9FLENBQUM7O2dCQVZGLFVBQVU7Ozs7Z0JBSzZCLDBCQUEwQjs7SUFNbEUsMkJBQUM7Q0FBQSxBQVhELElBV0M7U0FWWSxvQkFBb0IiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7T2JzZXJ2YWJsZSwgU3ViamVjdH0gZnJvbSAncnhqcyc7XG5cbi8qKiBJbmRpY2F0ZXMgdGhlIHdpZHRoIG9mIGEgY29sdW1uLiAqL1xuZXhwb3J0IGludGVyZmFjZSBDb2x1bW5TaXplIHtcbiAgLyoqIFRoZSBJRC9uYW1lIG9mIHRoZSBjb2x1bW4sIGFzIGRlZmluZWQgaW4gQ2RrQ29sdW1uRGVmLiAqL1xuICByZWFkb25seSBjb2x1bW5JZDogc3RyaW5nO1xuXG4gIC8qKiBUaGUgd2lkdGggaW4gcGl4ZWxzIG9mIHRoZSBjb2x1bW4uICovXG4gIHJlYWRvbmx5IHNpemU6IG51bWJlcjtcbn1cblxuLyoqIEludGVyZmFjZSBkZXNjcmliaW5nIGNvbHVtbiBzaXplIGNoYW5nZXMuICovXG5leHBvcnQgaW50ZXJmYWNlIENvbHVtblNpemVBY3Rpb24gZXh0ZW5kcyBDb2x1bW5TaXplIHtcbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhlIHJlc2l6ZSBhY3Rpb24gc2hvdWxkIGJlIGFwcGxpZWQgaW5zdGFudGFuZW91c2x5LiBGYWxzZSBmb3IgZXZlbnRzIHRyaWdnZXJlZCBkdXJpbmdcbiAgICogYSBVSS10cmlnZ2VyZWQgcmVzaXplIChzdWNoIGFzIHdpdGggdGhlIG1vdXNlKSB1bnRpbCB0aGUgbW91c2UgYnV0dG9uIGlzIHJlbGVhc2VkLiBUcnVlXG4gICAqIGZvciBhbGwgcHJvZ3JhbWF0aWNhbGx5IHRyaWdnZXJlZCByZXNpemVzLlxuICAgKi9cbiAgcmVhZG9ubHkgY29tcGxldGVJbW1lZGlhdGVseT86IGJvb2xlYW47XG59XG5cbi8qKiBPcmlnaW5hdGluZyBzb3VyY2Ugb2YgY29sdW1uIHJlc2l6ZSBldmVudHMgd2l0aGluIGEgdGFibGUuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgQ29sdW1uUmVzaXplTm90aWZpZXJTb3VyY2Uge1xuICAvKiogRW1pdHMgd2hlbiBhbiBpbi1wcm9ncmVzcyByZXNpemUgaXMgY2FuY2VsZWQuICovXG4gIHJlYWRvbmx5IHJlc2l6ZUNhbmNlbGVkID0gbmV3IFN1YmplY3Q8Q29sdW1uU2l6ZUFjdGlvbj4oKTtcblxuICAvKiogRW1pdHMgd2hlbiBhIHJlc2l6ZSBpcyBhcHBsaWVkLiAqL1xuICByZWFkb25seSByZXNpemVDb21wbGV0ZWQgPSBuZXcgU3ViamVjdDxDb2x1bW5TaXplPigpO1xuXG4gIC8qKiBUcmlnZ2VycyBhIHJlc2l6ZSBhY3Rpb24uICovXG4gIHJlYWRvbmx5IHRyaWdnZXJSZXNpemUgPSBuZXcgU3ViamVjdDxDb2x1bW5TaXplQWN0aW9uPigpO1xufVxuXG4vKiogU2VydmljZSBmb3IgdHJpZ2dlcmluZyBjb2x1bW4gcmVzaXplcyBpbXBlcmF0aXZlbHkgb3IgYmVpbmcgbm90aWZpZWQgb2YgdGhlbS4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBDb2x1bW5SZXNpemVOb3RpZmllciB7XG4gIC8qKiBFbWl0cyB3aGVuZXZlciBhIGNvbHVtbiBpcyByZXNpemVkLiAqL1xuICByZWFkb25seSByZXNpemVDb21wbGV0ZWQ6IE9ic2VydmFibGU8Q29sdW1uU2l6ZT4gPSB0aGlzLl9zb3VyY2UucmVzaXplQ29tcGxldGVkLmFzT2JzZXJ2YWJsZSgpO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgX3NvdXJjZTogQ29sdW1uUmVzaXplTm90aWZpZXJTb3VyY2UpIHt9XG5cbiAgLyoqIEluc3RhbnRseSByZXNpemVzIHRoZSBzcGVjaWZpZWQgY29sdW1uLiAqL1xuICByZXNpemUoY29sdW1uSWQ6IHN0cmluZywgc2l6ZTogbnVtYmVyKTogdm9pZCB7XG4gICAgdGhpcy5fc291cmNlLnRyaWdnZXJSZXNpemUubmV4dCh7Y29sdW1uSWQsIHNpemUsIGNvbXBsZXRlSW1tZWRpYXRlbHk6IHRydWV9KTtcbiAgfVxufVxuIl19