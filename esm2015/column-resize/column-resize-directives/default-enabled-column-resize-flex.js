/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __decorate, __metadata } from "tslib";
import { Directive, ElementRef, NgZone } from '@angular/core';
import { ColumnResize } from '../column-resize';
import { ColumnResizeNotifier, ColumnResizeNotifierSource } from '../column-resize-notifier';
import { HeaderRowEventDispatcher } from '../event-dispatcher';
import { FLEX_PROVIDERS } from './constants';
/**
 * Implicitly enables column resizing for a flex cdk-table.
 * Individual columns will be resizable unless opted out.
 */
let CdkDefaultEnabledColumnResizeFlex = /** @class */ (() => {
    var CdkDefaultEnabledColumnResizeFlex_1;
    let CdkDefaultEnabledColumnResizeFlex = CdkDefaultEnabledColumnResizeFlex_1 = class CdkDefaultEnabledColumnResizeFlex extends ColumnResize {
        constructor(columnResizeNotifier, elementRef, eventDispatcher, ngZone, notifier) {
            super();
            this.columnResizeNotifier = columnResizeNotifier;
            this.elementRef = elementRef;
            this.eventDispatcher = eventDispatcher;
            this.ngZone = ngZone;
            this.notifier = notifier;
        }
    };
    CdkDefaultEnabledColumnResizeFlex = CdkDefaultEnabledColumnResizeFlex_1 = __decorate([
        Directive({
            selector: 'cdk-table',
            providers: [
                ...FLEX_PROVIDERS,
                { provide: ColumnResize, useExisting: CdkDefaultEnabledColumnResizeFlex_1 },
            ],
        }),
        __metadata("design:paramtypes", [ColumnResizeNotifier,
            ElementRef,
            HeaderRowEventDispatcher,
            NgZone,
            ColumnResizeNotifierSource])
    ], CdkDefaultEnabledColumnResizeFlex);
    return CdkDefaultEnabledColumnResizeFlex;
})();
export { CdkDefaultEnabledColumnResizeFlex };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVmYXVsdC1lbmFibGVkLWNvbHVtbi1yZXNpemUtZmxleC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL2NvbHVtbi1yZXNpemUvY29sdW1uLXJlc2l6ZS1kaXJlY3RpdmVzL2RlZmF1bHQtZW5hYmxlZC1jb2x1bW4tcmVzaXplLWZsZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUVILE9BQU8sRUFBQyxTQUFTLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUU1RCxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sa0JBQWtCLENBQUM7QUFDOUMsT0FBTyxFQUFDLG9CQUFvQixFQUFFLDBCQUEwQixFQUFDLE1BQU0sMkJBQTJCLENBQUM7QUFDM0YsT0FBTyxFQUFDLHdCQUF3QixFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDN0QsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLGFBQWEsQ0FBQztBQUUzQzs7O0dBR0c7QUFRSDs7SUFBQSxJQUFhLGlDQUFpQyx5Q0FBOUMsTUFBYSxpQ0FBa0MsU0FBUSxZQUFZO1FBQ2pFLFlBQ2Esb0JBQTBDLEVBQzFDLFVBQW1DLEVBQ3pCLGVBQXlDLEVBQ3pDLE1BQWMsRUFDZCxRQUFvQztZQUN6RCxLQUFLLEVBQUUsQ0FBQztZQUxHLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBc0I7WUFDMUMsZUFBVSxHQUFWLFVBQVUsQ0FBeUI7WUFDekIsb0JBQWUsR0FBZixlQUFlLENBQTBCO1lBQ3pDLFdBQU0sR0FBTixNQUFNLENBQVE7WUFDZCxhQUFRLEdBQVIsUUFBUSxDQUE0QjtRQUUzRCxDQUFDO0tBQ0YsQ0FBQTtJQVRZLGlDQUFpQztRQVA3QyxTQUFTLENBQUM7WUFDVCxRQUFRLEVBQUUsV0FBVztZQUNyQixTQUFTLEVBQUU7Z0JBQ1QsR0FBRyxjQUFjO2dCQUNqQixFQUFDLE9BQU8sRUFBRSxZQUFZLEVBQUUsV0FBVyxFQUFFLG1DQUFpQyxFQUFDO2FBQ3hFO1NBQ0YsQ0FBQzt5Q0FHbUMsb0JBQW9CO1lBQzlCLFVBQVU7WUFDSyx3QkFBd0I7WUFDakMsTUFBTTtZQUNKLDBCQUEwQjtPQU5oRCxpQ0FBaUMsQ0FTN0M7SUFBRCx3Q0FBQztLQUFBO1NBVFksaUNBQWlDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RGlyZWN0aXZlLCBFbGVtZW50UmVmLCBOZ1pvbmV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge0NvbHVtblJlc2l6ZX0gZnJvbSAnLi4vY29sdW1uLXJlc2l6ZSc7XG5pbXBvcnQge0NvbHVtblJlc2l6ZU5vdGlmaWVyLCBDb2x1bW5SZXNpemVOb3RpZmllclNvdXJjZX0gZnJvbSAnLi4vY29sdW1uLXJlc2l6ZS1ub3RpZmllcic7XG5pbXBvcnQge0hlYWRlclJvd0V2ZW50RGlzcGF0Y2hlcn0gZnJvbSAnLi4vZXZlbnQtZGlzcGF0Y2hlcic7XG5pbXBvcnQge0ZMRVhfUFJPVklERVJTfSBmcm9tICcuL2NvbnN0YW50cyc7XG5cbi8qKlxuICogSW1wbGljaXRseSBlbmFibGVzIGNvbHVtbiByZXNpemluZyBmb3IgYSBmbGV4IGNkay10YWJsZS5cbiAqIEluZGl2aWR1YWwgY29sdW1ucyB3aWxsIGJlIHJlc2l6YWJsZSB1bmxlc3Mgb3B0ZWQgb3V0LlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdjZGstdGFibGUnLFxuICBwcm92aWRlcnM6IFtcbiAgICAuLi5GTEVYX1BST1ZJREVSUyxcbiAgICB7cHJvdmlkZTogQ29sdW1uUmVzaXplLCB1c2VFeGlzdGluZzogQ2RrRGVmYXVsdEVuYWJsZWRDb2x1bW5SZXNpemVGbGV4fSxcbiAgXSxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrRGVmYXVsdEVuYWJsZWRDb2x1bW5SZXNpemVGbGV4IGV4dGVuZHMgQ29sdW1uUmVzaXplIHtcbiAgY29uc3RydWN0b3IoXG4gICAgICByZWFkb25seSBjb2x1bW5SZXNpemVOb3RpZmllcjogQ29sdW1uUmVzaXplTm90aWZpZXIsXG4gICAgICByZWFkb25seSBlbGVtZW50UmVmOiBFbGVtZW50UmVmPEhUTUxFbGVtZW50PixcbiAgICAgIHByb3RlY3RlZCByZWFkb25seSBldmVudERpc3BhdGNoZXI6IEhlYWRlclJvd0V2ZW50RGlzcGF0Y2hlcixcbiAgICAgIHByb3RlY3RlZCByZWFkb25seSBuZ1pvbmU6IE5nWm9uZSxcbiAgICAgIHByb3RlY3RlZCByZWFkb25seSBub3RpZmllcjogQ29sdW1uUmVzaXplTm90aWZpZXJTb3VyY2UpIHtcbiAgICBzdXBlcigpO1xuICB9XG59XG4iXX0=