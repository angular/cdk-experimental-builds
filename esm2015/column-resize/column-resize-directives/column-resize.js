/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, ElementRef, NgZone } from '@angular/core';
import { ColumnResize } from '../column-resize';
import { ColumnResizeNotifier, ColumnResizeNotifierSource } from '../column-resize-notifier';
import { HeaderRowEventDispatcher } from '../event-dispatcher';
import { TABLE_PROVIDERS } from './constants';
/**
 * Explicitly enables column resizing for a table-based cdk-table.
 * Individual columns must be annotated specifically.
 */
let CdkColumnResize = /** @class */ (() => {
    class CdkColumnResize extends ColumnResize {
        constructor(columnResizeNotifier, elementRef, eventDispatcher, ngZone, notifier) {
            super();
            this.columnResizeNotifier = columnResizeNotifier;
            this.elementRef = elementRef;
            this.eventDispatcher = eventDispatcher;
            this.ngZone = ngZone;
            this.notifier = notifier;
        }
    }
    CdkColumnResize.decorators = [
        { type: Directive, args: [{
                    selector: 'table[cdk-table][columnResize]',
                    providers: [
                        ...TABLE_PROVIDERS,
                        { provide: ColumnResize, useExisting: CdkColumnResize },
                    ],
                },] }
    ];
    CdkColumnResize.ctorParameters = () => [
        { type: ColumnResizeNotifier },
        { type: ElementRef },
        { type: HeaderRowEventDispatcher },
        { type: NgZone },
        { type: ColumnResizeNotifierSource }
    ];
    return CdkColumnResize;
})();
export { CdkColumnResize };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sdW1uLXJlc2l6ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL2NvbHVtbi1yZXNpemUvY29sdW1uLXJlc2l6ZS1kaXJlY3RpdmVzL2NvbHVtbi1yZXNpemUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFNBQVMsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRTVELE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUM5QyxPQUFPLEVBQUMsb0JBQW9CLEVBQUUsMEJBQTBCLEVBQUMsTUFBTSwyQkFBMkIsQ0FBQztBQUMzRixPQUFPLEVBQUMsd0JBQXdCLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUM3RCxPQUFPLEVBQUMsZUFBZSxFQUFDLE1BQU0sYUFBYSxDQUFDO0FBRTVDOzs7R0FHRztBQUNIO0lBQUEsTUFPYSxlQUFnQixTQUFRLFlBQVk7UUFDL0MsWUFDYSxvQkFBMEMsRUFDMUMsVUFBbUMsRUFDekIsZUFBeUMsRUFDekMsTUFBYyxFQUNkLFFBQW9DO1lBQ3pELEtBQUssRUFBRSxDQUFDO1lBTEcseUJBQW9CLEdBQXBCLG9CQUFvQixDQUFzQjtZQUMxQyxlQUFVLEdBQVYsVUFBVSxDQUF5QjtZQUN6QixvQkFBZSxHQUFmLGVBQWUsQ0FBMEI7WUFDekMsV0FBTSxHQUFOLE1BQU0sQ0FBUTtZQUNkLGFBQVEsR0FBUixRQUFRLENBQTRCO1FBRTNELENBQUM7OztnQkFmRixTQUFTLFNBQUM7b0JBQ1QsUUFBUSxFQUFFLGdDQUFnQztvQkFDMUMsU0FBUyxFQUFFO3dCQUNULEdBQUcsZUFBZTt3QkFDbEIsRUFBQyxPQUFPLEVBQUUsWUFBWSxFQUFFLFdBQVcsRUFBRSxlQUFlLEVBQUM7cUJBQ3REO2lCQUNGOzs7Z0JBZE8sb0JBQW9CO2dCQUhULFVBQVU7Z0JBSXJCLHdCQUF3QjtnQkFKRCxNQUFNO2dCQUdQLDBCQUEwQjs7SUF3QnhELHNCQUFDO0tBQUE7U0FUWSxlQUFlIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RGlyZWN0aXZlLCBFbGVtZW50UmVmLCBOZ1pvbmV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge0NvbHVtblJlc2l6ZX0gZnJvbSAnLi4vY29sdW1uLXJlc2l6ZSc7XG5pbXBvcnQge0NvbHVtblJlc2l6ZU5vdGlmaWVyLCBDb2x1bW5SZXNpemVOb3RpZmllclNvdXJjZX0gZnJvbSAnLi4vY29sdW1uLXJlc2l6ZS1ub3RpZmllcic7XG5pbXBvcnQge0hlYWRlclJvd0V2ZW50RGlzcGF0Y2hlcn0gZnJvbSAnLi4vZXZlbnQtZGlzcGF0Y2hlcic7XG5pbXBvcnQge1RBQkxFX1BST1ZJREVSU30gZnJvbSAnLi9jb25zdGFudHMnO1xuXG4vKipcbiAqIEV4cGxpY2l0bHkgZW5hYmxlcyBjb2x1bW4gcmVzaXppbmcgZm9yIGEgdGFibGUtYmFzZWQgY2RrLXRhYmxlLlxuICogSW5kaXZpZHVhbCBjb2x1bW5zIG11c3QgYmUgYW5ub3RhdGVkIHNwZWNpZmljYWxseS5cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAndGFibGVbY2RrLXRhYmxlXVtjb2x1bW5SZXNpemVdJyxcbiAgcHJvdmlkZXJzOiBbXG4gICAgLi4uVEFCTEVfUFJPVklERVJTLFxuICAgIHtwcm92aWRlOiBDb2x1bW5SZXNpemUsIHVzZUV4aXN0aW5nOiBDZGtDb2x1bW5SZXNpemV9LFxuICBdLFxufSlcbmV4cG9ydCBjbGFzcyBDZGtDb2x1bW5SZXNpemUgZXh0ZW5kcyBDb2x1bW5SZXNpemUge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHJlYWRvbmx5IGNvbHVtblJlc2l6ZU5vdGlmaWVyOiBDb2x1bW5SZXNpemVOb3RpZmllcixcbiAgICAgIHJlYWRvbmx5IGVsZW1lbnRSZWY6IEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+LFxuICAgICAgcHJvdGVjdGVkIHJlYWRvbmx5IGV2ZW50RGlzcGF0Y2hlcjogSGVhZGVyUm93RXZlbnREaXNwYXRjaGVyLFxuICAgICAgcHJvdGVjdGVkIHJlYWRvbmx5IG5nWm9uZTogTmdab25lLFxuICAgICAgcHJvdGVjdGVkIHJlYWRvbmx5IG5vdGlmaWVyOiBDb2x1bW5SZXNpemVOb3RpZmllclNvdXJjZSkge1xuICAgIHN1cGVyKCk7XG4gIH1cbn1cbiJdfQ==