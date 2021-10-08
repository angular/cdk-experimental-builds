/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, ElementRef, NgZone } from '@angular/core';
import { CdkTable } from '@angular/cdk/table';
import { ColumnResize } from '../column-resize';
import { ColumnResizeNotifier, ColumnResizeNotifierSource } from '../column-resize-notifier';
import { HeaderRowEventDispatcher } from '../event-dispatcher';
import { TABLE_PROVIDERS } from './constants';
import * as i0 from "@angular/core";
import * as i1 from "../column-resize-notifier";
import * as i2 from "../event-dispatcher";
import * as i3 from "@angular/cdk/table";
/**
 * Explicitly enables column resizing for a table-based cdk-table.
 * Individual columns must be annotated specifically.
 */
export class CdkColumnResize extends ColumnResize {
    constructor(columnResizeNotifier, elementRef, eventDispatcher, ngZone, notifier, table) {
        super();
        this.columnResizeNotifier = columnResizeNotifier;
        this.elementRef = elementRef;
        this.eventDispatcher = eventDispatcher;
        this.ngZone = ngZone;
        this.notifier = notifier;
        this.table = table;
    }
}
CdkColumnResize.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.0-next.15", ngImport: i0, type: CdkColumnResize, deps: [{ token: i1.ColumnResizeNotifier }, { token: i0.ElementRef }, { token: i2.HeaderRowEventDispatcher }, { token: i0.NgZone }, { token: i1.ColumnResizeNotifierSource }, { token: i3.CdkTable }], target: i0.ɵɵFactoryTarget.Directive });
CdkColumnResize.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "13.0.0-next.15", type: CdkColumnResize, selector: "table[cdk-table][columnResize]", providers: [
        ...TABLE_PROVIDERS,
        { provide: ColumnResize, useExisting: CdkColumnResize },
    ], usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.0-next.15", ngImport: i0, type: CdkColumnResize, decorators: [{
            type: Directive,
            args: [{
                    selector: 'table[cdk-table][columnResize]',
                    providers: [
                        ...TABLE_PROVIDERS,
                        { provide: ColumnResize, useExisting: CdkColumnResize },
                    ],
                }]
        }], ctorParameters: function () { return [{ type: i1.ColumnResizeNotifier }, { type: i0.ElementRef }, { type: i2.HeaderRowEventDispatcher }, { type: i0.NgZone }, { type: i1.ColumnResizeNotifierSource }, { type: i3.CdkTable }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sdW1uLXJlc2l6ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL2NvbHVtbi1yZXNpemUvY29sdW1uLXJlc2l6ZS1kaXJlY3RpdmVzL2NvbHVtbi1yZXNpemUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFNBQVMsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQzVELE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxvQkFBb0IsQ0FBQztBQUU1QyxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sa0JBQWtCLENBQUM7QUFDOUMsT0FBTyxFQUFDLG9CQUFvQixFQUFFLDBCQUEwQixFQUFDLE1BQU0sMkJBQTJCLENBQUM7QUFDM0YsT0FBTyxFQUFDLHdCQUF3QixFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDN0QsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLGFBQWEsQ0FBQzs7Ozs7QUFFNUM7OztHQUdHO0FBUUgsTUFBTSxPQUFPLGVBQWdCLFNBQVEsWUFBWTtJQUMvQyxZQUNhLG9CQUEwQyxFQUMxQyxVQUFtQyxFQUN6QixlQUF5QyxFQUN6QyxNQUFjLEVBQ2QsUUFBb0MsRUFDcEMsS0FBd0I7UUFDN0MsS0FBSyxFQUFFLENBQUM7UUFORyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXNCO1FBQzFDLGVBQVUsR0FBVixVQUFVLENBQXlCO1FBQ3pCLG9CQUFlLEdBQWYsZUFBZSxDQUEwQjtRQUN6QyxXQUFNLEdBQU4sTUFBTSxDQUFRO1FBQ2QsYUFBUSxHQUFSLFFBQVEsQ0FBNEI7UUFDcEMsVUFBSyxHQUFMLEtBQUssQ0FBbUI7SUFFL0MsQ0FBQzs7b0hBVFUsZUFBZTt3R0FBZixlQUFlLHlEQUxmO1FBQ1QsR0FBRyxlQUFlO1FBQ2xCLEVBQUMsT0FBTyxFQUFFLFlBQVksRUFBRSxXQUFXLEVBQUUsZUFBZSxFQUFDO0tBQ3REO21HQUVVLGVBQWU7a0JBUDNCLFNBQVM7bUJBQUM7b0JBQ1QsUUFBUSxFQUFFLGdDQUFnQztvQkFDMUMsU0FBUyxFQUFFO3dCQUNULEdBQUcsZUFBZTt3QkFDbEIsRUFBQyxPQUFPLEVBQUUsWUFBWSxFQUFFLFdBQVcsaUJBQWlCLEVBQUM7cUJBQ3REO2lCQUNGIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RGlyZWN0aXZlLCBFbGVtZW50UmVmLCBOZ1pvbmV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtDZGtUYWJsZX0gZnJvbSAnQGFuZ3VsYXIvY2RrL3RhYmxlJztcblxuaW1wb3J0IHtDb2x1bW5SZXNpemV9IGZyb20gJy4uL2NvbHVtbi1yZXNpemUnO1xuaW1wb3J0IHtDb2x1bW5SZXNpemVOb3RpZmllciwgQ29sdW1uUmVzaXplTm90aWZpZXJTb3VyY2V9IGZyb20gJy4uL2NvbHVtbi1yZXNpemUtbm90aWZpZXInO1xuaW1wb3J0IHtIZWFkZXJSb3dFdmVudERpc3BhdGNoZXJ9IGZyb20gJy4uL2V2ZW50LWRpc3BhdGNoZXInO1xuaW1wb3J0IHtUQUJMRV9QUk9WSURFUlN9IGZyb20gJy4vY29uc3RhbnRzJztcblxuLyoqXG4gKiBFeHBsaWNpdGx5IGVuYWJsZXMgY29sdW1uIHJlc2l6aW5nIGZvciBhIHRhYmxlLWJhc2VkIGNkay10YWJsZS5cbiAqIEluZGl2aWR1YWwgY29sdW1ucyBtdXN0IGJlIGFubm90YXRlZCBzcGVjaWZpY2FsbHkuXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ3RhYmxlW2Nkay10YWJsZV1bY29sdW1uUmVzaXplXScsXG4gIHByb3ZpZGVyczogW1xuICAgIC4uLlRBQkxFX1BST1ZJREVSUyxcbiAgICB7cHJvdmlkZTogQ29sdW1uUmVzaXplLCB1c2VFeGlzdGluZzogQ2RrQ29sdW1uUmVzaXplfSxcbiAgXSxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrQ29sdW1uUmVzaXplIGV4dGVuZHMgQ29sdW1uUmVzaXplIHtcbiAgY29uc3RydWN0b3IoXG4gICAgICByZWFkb25seSBjb2x1bW5SZXNpemVOb3RpZmllcjogQ29sdW1uUmVzaXplTm90aWZpZXIsXG4gICAgICByZWFkb25seSBlbGVtZW50UmVmOiBFbGVtZW50UmVmPEhUTUxFbGVtZW50PixcbiAgICAgIHByb3RlY3RlZCByZWFkb25seSBldmVudERpc3BhdGNoZXI6IEhlYWRlclJvd0V2ZW50RGlzcGF0Y2hlcixcbiAgICAgIHByb3RlY3RlZCByZWFkb25seSBuZ1pvbmU6IE5nWm9uZSxcbiAgICAgIHByb3RlY3RlZCByZWFkb25seSBub3RpZmllcjogQ29sdW1uUmVzaXplTm90aWZpZXJTb3VyY2UsXG4gICAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgdGFibGU6IENka1RhYmxlPHVua25vd24+KSB7XG4gICAgc3VwZXIoKTtcbiAgfVxufVxuIl19