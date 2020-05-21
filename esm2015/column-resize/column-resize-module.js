/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __decorate } from "tslib";
import { NgModule } from '@angular/core';
import { CdkColumnResize } from './column-resize-directives/column-resize';
import { CdkColumnResizeFlex } from './column-resize-directives/column-resize-flex';
import { CdkDefaultEnabledColumnResize } from './column-resize-directives/default-enabled-column-resize';
import { CdkDefaultEnabledColumnResizeFlex } from './column-resize-directives/default-enabled-column-resize-flex';
/**
 * One of two NgModules for use with CdkColumnResize.
 * When using this module, columns are resizable by default.
 */
let CdkColumnResizeDefaultEnabledModule = /** @class */ (() => {
    let CdkColumnResizeDefaultEnabledModule = class CdkColumnResizeDefaultEnabledModule {
    };
    CdkColumnResizeDefaultEnabledModule = __decorate([
        NgModule({
            declarations: [CdkDefaultEnabledColumnResize, CdkDefaultEnabledColumnResizeFlex],
            exports: [CdkDefaultEnabledColumnResize, CdkDefaultEnabledColumnResizeFlex],
        })
    ], CdkColumnResizeDefaultEnabledModule);
    return CdkColumnResizeDefaultEnabledModule;
})();
export { CdkColumnResizeDefaultEnabledModule };
/**
 * One of two NgModules for use with CdkColumnResize.
 * When using this module, columns are not resizable by default.
 */
let CdkColumnResizeModule = /** @class */ (() => {
    let CdkColumnResizeModule = class CdkColumnResizeModule {
    };
    CdkColumnResizeModule = __decorate([
        NgModule({
            declarations: [CdkColumnResize, CdkColumnResizeFlex],
            exports: [CdkColumnResize, CdkColumnResizeFlex],
        })
    ], CdkColumnResizeModule);
    return CdkColumnResizeModule;
})();
export { CdkColumnResizeModule };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sdW1uLXJlc2l6ZS1tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrLWV4cGVyaW1lbnRhbC9jb2x1bW4tcmVzaXplL2NvbHVtbi1yZXNpemUtbW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFFSCxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRXZDLE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSwwQ0FBMEMsQ0FBQztBQUN6RSxPQUFPLEVBQUMsbUJBQW1CLEVBQUMsTUFBTSwrQ0FBK0MsQ0FBQztBQUNsRixPQUFPLEVBQ0wsNkJBQTZCLEVBQzlCLE1BQU0sMERBQTBELENBQUM7QUFDbEUsT0FBTyxFQUNMLGlDQUFpQyxFQUNsQyxNQUFNLCtEQUErRCxDQUFDO0FBRXZFOzs7R0FHRztBQUtIO0lBQUEsSUFBYSxtQ0FBbUMsR0FBaEQsTUFBYSxtQ0FBbUM7S0FBRyxDQUFBO0lBQXRDLG1DQUFtQztRQUovQyxRQUFRLENBQUM7WUFDUixZQUFZLEVBQUUsQ0FBQyw2QkFBNkIsRUFBRSxpQ0FBaUMsQ0FBQztZQUNoRixPQUFPLEVBQUUsQ0FBQyw2QkFBNkIsRUFBRSxpQ0FBaUMsQ0FBQztTQUM1RSxDQUFDO09BQ1csbUNBQW1DLENBQUc7SUFBRCwwQ0FBQztLQUFBO1NBQXRDLG1DQUFtQztBQUVoRDs7O0dBR0c7QUFLSDtJQUFBLElBQWEscUJBQXFCLEdBQWxDLE1BQWEscUJBQXFCO0tBQUcsQ0FBQTtJQUF4QixxQkFBcUI7UUFKakMsUUFBUSxDQUFDO1lBQ1IsWUFBWSxFQUFFLENBQUMsZUFBZSxFQUFFLG1CQUFtQixDQUFDO1lBQ3BELE9BQU8sRUFBRSxDQUFDLGVBQWUsRUFBRSxtQkFBbUIsQ0FBQztTQUNoRCxDQUFDO09BQ1cscUJBQXFCLENBQUc7SUFBRCw0QkFBQztLQUFBO1NBQXhCLHFCQUFxQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge05nTW9kdWxlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtDZGtDb2x1bW5SZXNpemV9IGZyb20gJy4vY29sdW1uLXJlc2l6ZS1kaXJlY3RpdmVzL2NvbHVtbi1yZXNpemUnO1xuaW1wb3J0IHtDZGtDb2x1bW5SZXNpemVGbGV4fSBmcm9tICcuL2NvbHVtbi1yZXNpemUtZGlyZWN0aXZlcy9jb2x1bW4tcmVzaXplLWZsZXgnO1xuaW1wb3J0IHtcbiAgQ2RrRGVmYXVsdEVuYWJsZWRDb2x1bW5SZXNpemVcbn0gZnJvbSAnLi9jb2x1bW4tcmVzaXplLWRpcmVjdGl2ZXMvZGVmYXVsdC1lbmFibGVkLWNvbHVtbi1yZXNpemUnO1xuaW1wb3J0IHtcbiAgQ2RrRGVmYXVsdEVuYWJsZWRDb2x1bW5SZXNpemVGbGV4XG59IGZyb20gJy4vY29sdW1uLXJlc2l6ZS1kaXJlY3RpdmVzL2RlZmF1bHQtZW5hYmxlZC1jb2x1bW4tcmVzaXplLWZsZXgnO1xuXG4vKipcbiAqIE9uZSBvZiB0d28gTmdNb2R1bGVzIGZvciB1c2Ugd2l0aCBDZGtDb2x1bW5SZXNpemUuXG4gKiBXaGVuIHVzaW5nIHRoaXMgbW9kdWxlLCBjb2x1bW5zIGFyZSByZXNpemFibGUgYnkgZGVmYXVsdC5cbiAqL1xuQE5nTW9kdWxlKHtcbiAgZGVjbGFyYXRpb25zOiBbQ2RrRGVmYXVsdEVuYWJsZWRDb2x1bW5SZXNpemUsIENka0RlZmF1bHRFbmFibGVkQ29sdW1uUmVzaXplRmxleF0sXG4gIGV4cG9ydHM6IFtDZGtEZWZhdWx0RW5hYmxlZENvbHVtblJlc2l6ZSwgQ2RrRGVmYXVsdEVuYWJsZWRDb2x1bW5SZXNpemVGbGV4XSxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrQ29sdW1uUmVzaXplRGVmYXVsdEVuYWJsZWRNb2R1bGUge31cblxuLyoqXG4gKiBPbmUgb2YgdHdvIE5nTW9kdWxlcyBmb3IgdXNlIHdpdGggQ2RrQ29sdW1uUmVzaXplLlxuICogV2hlbiB1c2luZyB0aGlzIG1vZHVsZSwgY29sdW1ucyBhcmUgbm90IHJlc2l6YWJsZSBieSBkZWZhdWx0LlxuICovXG5ATmdNb2R1bGUoe1xuICBkZWNsYXJhdGlvbnM6IFtDZGtDb2x1bW5SZXNpemUsIENka0NvbHVtblJlc2l6ZUZsZXhdLFxuICBleHBvcnRzOiBbQ2RrQ29sdW1uUmVzaXplLCBDZGtDb2x1bW5SZXNpemVGbGV4XSxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrQ29sdW1uUmVzaXplTW9kdWxlIHt9XG4iXX0=