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
import { FLEX_PROVIDERS } from './constants';
import * as i0 from "@angular/core";
import * as i1 from "../column-resize-notifier";
import * as i2 from "../event-dispatcher";
import * as i3 from "@angular/cdk/table";
/**
 * Explicitly enables column resizing for a flexbox-based cdk-table.
 * Individual columns must be annotated specifically.
 */
class CdkColumnResizeFlex extends ColumnResize {
    constructor(columnResizeNotifier, elementRef, eventDispatcher, ngZone, notifier, table) {
        super();
        this.columnResizeNotifier = columnResizeNotifier;
        this.elementRef = elementRef;
        this.eventDispatcher = eventDispatcher;
        this.ngZone = ngZone;
        this.notifier = notifier;
        this.table = table;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.0.0", ngImport: i0, type: CdkColumnResizeFlex, deps: [{ token: i1.ColumnResizeNotifier }, { token: i0.ElementRef }, { token: i2.HeaderRowEventDispatcher }, { token: i0.NgZone }, { token: i1.ColumnResizeNotifierSource }, { token: i3.CdkTable }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "16.0.0", type: CdkColumnResizeFlex, selector: "cdk-table[columnResize]", providers: [...FLEX_PROVIDERS, { provide: ColumnResize, useExisting: CdkColumnResizeFlex }], usesInheritance: true, ngImport: i0 }); }
}
export { CdkColumnResizeFlex };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.0.0", ngImport: i0, type: CdkColumnResizeFlex, decorators: [{
            type: Directive,
            args: [{
                    selector: 'cdk-table[columnResize]',
                    providers: [...FLEX_PROVIDERS, { provide: ColumnResize, useExisting: CdkColumnResizeFlex }],
                }]
        }], ctorParameters: function () { return [{ type: i1.ColumnResizeNotifier }, { type: i0.ElementRef }, { type: i2.HeaderRowEventDispatcher }, { type: i0.NgZone }, { type: i1.ColumnResizeNotifierSource }, { type: i3.CdkTable }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sdW1uLXJlc2l6ZS1mbGV4LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvY29sdW1uLXJlc2l6ZS9jb2x1bW4tcmVzaXplLWRpcmVjdGl2ZXMvY29sdW1uLXJlc2l6ZS1mbGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxTQUFTLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUM1RCxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sb0JBQW9CLENBQUM7QUFFNUMsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBQzlDLE9BQU8sRUFBQyxvQkFBb0IsRUFBRSwwQkFBMEIsRUFBQyxNQUFNLDJCQUEyQixDQUFDO0FBQzNGLE9BQU8sRUFBQyx3QkFBd0IsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQzdELE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxhQUFhLENBQUM7Ozs7O0FBRTNDOzs7R0FHRztBQUNILE1BSWEsbUJBQW9CLFNBQVEsWUFBWTtJQUNuRCxZQUNXLG9CQUEwQyxFQUMxQyxVQUFtQyxFQUN6QixlQUF5QyxFQUN6QyxNQUFjLEVBQ2QsUUFBb0MsRUFDcEMsS0FBd0I7UUFFM0MsS0FBSyxFQUFFLENBQUM7UUFQQyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXNCO1FBQzFDLGVBQVUsR0FBVixVQUFVLENBQXlCO1FBQ3pCLG9CQUFlLEdBQWYsZUFBZSxDQUEwQjtRQUN6QyxXQUFNLEdBQU4sTUFBTSxDQUFRO1FBQ2QsYUFBUSxHQUFSLFFBQVEsQ0FBNEI7UUFDcEMsVUFBSyxHQUFMLEtBQUssQ0FBbUI7SUFHN0MsQ0FBQzs4R0FWVSxtQkFBbUI7a0dBQW5CLG1CQUFtQixrREFGbkIsQ0FBQyxHQUFHLGNBQWMsRUFBRSxFQUFDLE9BQU8sRUFBRSxZQUFZLEVBQUUsV0FBVyxFQUFFLG1CQUFtQixFQUFDLENBQUM7O1NBRTlFLG1CQUFtQjsyRkFBbkIsbUJBQW1CO2tCQUovQixTQUFTO21CQUFDO29CQUNULFFBQVEsRUFBRSx5QkFBeUI7b0JBQ25DLFNBQVMsRUFBRSxDQUFDLEdBQUcsY0FBYyxFQUFFLEVBQUMsT0FBTyxFQUFFLFlBQVksRUFBRSxXQUFXLHFCQUFxQixFQUFDLENBQUM7aUJBQzFGIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RGlyZWN0aXZlLCBFbGVtZW50UmVmLCBOZ1pvbmV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtDZGtUYWJsZX0gZnJvbSAnQGFuZ3VsYXIvY2RrL3RhYmxlJztcblxuaW1wb3J0IHtDb2x1bW5SZXNpemV9IGZyb20gJy4uL2NvbHVtbi1yZXNpemUnO1xuaW1wb3J0IHtDb2x1bW5SZXNpemVOb3RpZmllciwgQ29sdW1uUmVzaXplTm90aWZpZXJTb3VyY2V9IGZyb20gJy4uL2NvbHVtbi1yZXNpemUtbm90aWZpZXInO1xuaW1wb3J0IHtIZWFkZXJSb3dFdmVudERpc3BhdGNoZXJ9IGZyb20gJy4uL2V2ZW50LWRpc3BhdGNoZXInO1xuaW1wb3J0IHtGTEVYX1BST1ZJREVSU30gZnJvbSAnLi9jb25zdGFudHMnO1xuXG4vKipcbiAqIEV4cGxpY2l0bHkgZW5hYmxlcyBjb2x1bW4gcmVzaXppbmcgZm9yIGEgZmxleGJveC1iYXNlZCBjZGstdGFibGUuXG4gKiBJbmRpdmlkdWFsIGNvbHVtbnMgbXVzdCBiZSBhbm5vdGF0ZWQgc3BlY2lmaWNhbGx5LlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdjZGstdGFibGVbY29sdW1uUmVzaXplXScsXG4gIHByb3ZpZGVyczogWy4uLkZMRVhfUFJPVklERVJTLCB7cHJvdmlkZTogQ29sdW1uUmVzaXplLCB1c2VFeGlzdGluZzogQ2RrQ29sdW1uUmVzaXplRmxleH1dLFxufSlcbmV4cG9ydCBjbGFzcyBDZGtDb2x1bW5SZXNpemVGbGV4IGV4dGVuZHMgQ29sdW1uUmVzaXplIHtcbiAgY29uc3RydWN0b3IoXG4gICAgcmVhZG9ubHkgY29sdW1uUmVzaXplTm90aWZpZXI6IENvbHVtblJlc2l6ZU5vdGlmaWVyLFxuICAgIHJlYWRvbmx5IGVsZW1lbnRSZWY6IEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+LFxuICAgIHByb3RlY3RlZCByZWFkb25seSBldmVudERpc3BhdGNoZXI6IEhlYWRlclJvd0V2ZW50RGlzcGF0Y2hlcixcbiAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgbmdab25lOiBOZ1pvbmUsXG4gICAgcHJvdGVjdGVkIHJlYWRvbmx5IG5vdGlmaWVyOiBDb2x1bW5SZXNpemVOb3RpZmllclNvdXJjZSxcbiAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgdGFibGU6IENka1RhYmxlPHVua25vd24+LFxuICApIHtcbiAgICBzdXBlcigpO1xuICB9XG59XG4iXX0=