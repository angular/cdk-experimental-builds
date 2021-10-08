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
ColumnResizeNotifierSource.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.0-next.15", ngImport: i0, type: ColumnResizeNotifierSource, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
ColumnResizeNotifierSource.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.0-next.15", ngImport: i0, type: ColumnResizeNotifierSource });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.0-next.15", ngImport: i0, type: ColumnResizeNotifierSource, decorators: [{
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
        this._source.triggerResize.next({ columnId, size, completeImmediately: true, isStickyColumn: true });
    }
}
ColumnResizeNotifier.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.0-next.15", ngImport: i0, type: ColumnResizeNotifier, deps: [{ token: ColumnResizeNotifierSource }], target: i0.ɵɵFactoryTarget.Injectable });
ColumnResizeNotifier.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.0-next.15", ngImport: i0, type: ColumnResizeNotifier });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.0-next.15", ngImport: i0, type: ColumnResizeNotifier, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: ColumnResizeNotifierSource }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sdW1uLXJlc2l6ZS1ub3RpZmllci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL2NvbHVtbi1yZXNpemUvY29sdW1uLXJlc2l6ZS1ub3RpZmllci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3pDLE9BQU8sRUFBYSxPQUFPLEVBQUMsTUFBTSxNQUFNLENBQUM7O0FBNkJ6Qzs7O0dBR0c7QUFFSCxNQUFNLE9BQU8sMEJBQTBCO0lBRHZDO1FBRUUsb0RBQW9EO1FBQzNDLG1CQUFjLEdBQUcsSUFBSSxPQUFPLEVBQW9CLENBQUM7UUFFMUQsc0NBQXNDO1FBQzdCLG9CQUFlLEdBQUcsSUFBSSxPQUFPLEVBQWMsQ0FBQztRQUVyRCxnQ0FBZ0M7UUFDdkIsa0JBQWEsR0FBRyxJQUFJLE9BQU8sRUFBb0IsQ0FBQztLQUMxRDs7K0hBVFksMEJBQTBCO21JQUExQiwwQkFBMEI7bUdBQTFCLDBCQUEwQjtrQkFEdEMsVUFBVTs7QUFZWCxvRkFBb0Y7QUFFcEYsTUFBTSxPQUFPLG9CQUFvQjtJQUkvQixZQUE2QixPQUFtQztRQUFuQyxZQUFPLEdBQVAsT0FBTyxDQUE0QjtRQUhoRSwwQ0FBMEM7UUFDakMsb0JBQWUsR0FBMkIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUM7SUFFYixDQUFDO0lBRXBFLDhDQUE4QztJQUM5QyxNQUFNLENBQUMsUUFBZ0IsRUFBRSxJQUFZO1FBQ25DLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLElBQUksQ0FDM0IsRUFBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLG1CQUFtQixFQUFFLElBQUksRUFBRSxjQUFjLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQztJQUN6RSxDQUFDOzt5SEFWVSxvQkFBb0Isa0JBSU8sMEJBQTBCOzZIQUpyRCxvQkFBb0I7bUdBQXBCLG9CQUFvQjtrQkFEaEMsVUFBVTswREFLNkIsMEJBQTBCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge09ic2VydmFibGUsIFN1YmplY3R9IGZyb20gJ3J4anMnO1xuXG4vKiogSW5kaWNhdGVzIHRoZSB3aWR0aCBvZiBhIGNvbHVtbi4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ29sdW1uU2l6ZSB7XG4gIC8qKiBUaGUgSUQvbmFtZSBvZiB0aGUgY29sdW1uLCBhcyBkZWZpbmVkIGluIENka0NvbHVtbkRlZi4gKi9cbiAgcmVhZG9ubHkgY29sdW1uSWQ6IHN0cmluZztcblxuICAvKiogVGhlIHdpZHRoIGluIHBpeGVscyBvZiB0aGUgY29sdW1uLiAqL1xuICByZWFkb25seSBzaXplOiBudW1iZXI7XG5cbiAgLyoqIFRoZSB3aWR0aCBpbiBwaXhlbHMgb2YgdGhlIGNvbHVtbiBwcmlvciB0byB0aGlzIHVwZGF0ZSwgaWYga25vd24uICovXG4gIHJlYWRvbmx5IHByZXZpb3VzU2l6ZT86IG51bWJlcjtcbn1cblxuLyoqIEludGVyZmFjZSBkZXNjcmliaW5nIGNvbHVtbiBzaXplIGNoYW5nZXMuICovXG5leHBvcnQgaW50ZXJmYWNlIENvbHVtblNpemVBY3Rpb24gZXh0ZW5kcyBDb2x1bW5TaXplIHtcbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhlIHJlc2l6ZSBhY3Rpb24gc2hvdWxkIGJlIGFwcGxpZWQgaW5zdGFudGFuZW91c2x5LiBGYWxzZSBmb3IgZXZlbnRzIHRyaWdnZXJlZCBkdXJpbmdcbiAgICogYSBVSS10cmlnZ2VyZWQgcmVzaXplIChzdWNoIGFzIHdpdGggdGhlIG1vdXNlKSB1bnRpbCB0aGUgbW91c2UgYnV0dG9uIGlzIHJlbGVhc2VkLiBUcnVlXG4gICAqIGZvciBhbGwgcHJvZ3JhbW1hdGljYWxseSB0cmlnZ2VyZWQgcmVzaXplcy5cbiAgICovXG4gIHJlYWRvbmx5IGNvbXBsZXRlSW1tZWRpYXRlbHk/OiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoZSByZXNpemUgYWN0aW9uIGlzIGJlaW5nIGFwcGxpZWQgdG8gYSBzdGlja3kvc3RpY2t5RW5kIGNvbHVtbi5cbiAgICovXG4gIHJlYWRvbmx5IGlzU3RpY2t5Q29sdW1uPzogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBPcmlnaW5hdGluZyBzb3VyY2Ugb2YgY29sdW1uIHJlc2l6ZSBldmVudHMgd2l0aGluIGEgdGFibGUuXG4gKiBAZG9jcy1wcml2YXRlXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBDb2x1bW5SZXNpemVOb3RpZmllclNvdXJjZSB7XG4gIC8qKiBFbWl0cyB3aGVuIGFuIGluLXByb2dyZXNzIHJlc2l6ZSBpcyBjYW5jZWxlZC4gKi9cbiAgcmVhZG9ubHkgcmVzaXplQ2FuY2VsZWQgPSBuZXcgU3ViamVjdDxDb2x1bW5TaXplQWN0aW9uPigpO1xuXG4gIC8qKiBFbWl0cyB3aGVuIGEgcmVzaXplIGlzIGFwcGxpZWQuICovXG4gIHJlYWRvbmx5IHJlc2l6ZUNvbXBsZXRlZCA9IG5ldyBTdWJqZWN0PENvbHVtblNpemU+KCk7XG5cbiAgLyoqIFRyaWdnZXJzIGEgcmVzaXplIGFjdGlvbi4gKi9cbiAgcmVhZG9ubHkgdHJpZ2dlclJlc2l6ZSA9IG5ldyBTdWJqZWN0PENvbHVtblNpemVBY3Rpb24+KCk7XG59XG5cbi8qKiBTZXJ2aWNlIGZvciB0cmlnZ2VyaW5nIGNvbHVtbiByZXNpemVzIGltcGVyYXRpdmVseSBvciBiZWluZyBub3RpZmllZCBvZiB0aGVtLiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIENvbHVtblJlc2l6ZU5vdGlmaWVyIHtcbiAgLyoqIEVtaXRzIHdoZW5ldmVyIGEgY29sdW1uIGlzIHJlc2l6ZWQuICovXG4gIHJlYWRvbmx5IHJlc2l6ZUNvbXBsZXRlZDogT2JzZXJ2YWJsZTxDb2x1bW5TaXplPiA9IHRoaXMuX3NvdXJjZS5yZXNpemVDb21wbGV0ZWQ7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSByZWFkb25seSBfc291cmNlOiBDb2x1bW5SZXNpemVOb3RpZmllclNvdXJjZSkge31cblxuICAvKiogSW5zdGFudGx5IHJlc2l6ZXMgdGhlIHNwZWNpZmllZCBjb2x1bW4uICovXG4gIHJlc2l6ZShjb2x1bW5JZDogc3RyaW5nLCBzaXplOiBudW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLl9zb3VyY2UudHJpZ2dlclJlc2l6ZS5uZXh0KFxuICAgICAgICB7Y29sdW1uSWQsIHNpemUsIGNvbXBsZXRlSW1tZWRpYXRlbHk6IHRydWUsIGlzU3RpY2t5Q29sdW1uOiB0cnVlfSk7XG4gIH1cbn1cbiJdfQ==