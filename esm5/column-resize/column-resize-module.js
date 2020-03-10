/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { NgModule } from '@angular/core';
import { CdkColumnResize } from './column-resize-directives/column-resize';
import { CdkColumnResizeFlex } from './column-resize-directives/column-resize-flex';
import { CdkDefaultEnabledColumnResize } from './column-resize-directives/default-enabled-column-resize';
import { CdkDefaultEnabledColumnResizeFlex } from './column-resize-directives/default-enabled-column-resize-flex';
/**
 * One of two NgModules for use with CdkColumnResize.
 * When using this module, columns are resizable by default.
 */
var CdkColumnResizeDefaultEnabledModule = /** @class */ (function () {
    function CdkColumnResizeDefaultEnabledModule() {
    }
    CdkColumnResizeDefaultEnabledModule.decorators = [
        { type: NgModule, args: [{
                    declarations: [CdkDefaultEnabledColumnResize, CdkDefaultEnabledColumnResizeFlex],
                    exports: [CdkDefaultEnabledColumnResize, CdkDefaultEnabledColumnResizeFlex],
                },] }
    ];
    return CdkColumnResizeDefaultEnabledModule;
}());
export { CdkColumnResizeDefaultEnabledModule };
/**
 * One of two NgModules for use with CdkColumnResize.
 * When using this module, columns are not resizable by default.
 */
var CdkColumnResizeModule = /** @class */ (function () {
    function CdkColumnResizeModule() {
    }
    CdkColumnResizeModule.decorators = [
        { type: NgModule, args: [{
                    declarations: [CdkColumnResize, CdkColumnResizeFlex],
                    exports: [CdkColumnResize, CdkColumnResizeFlex],
                },] }
    ];
    return CdkColumnResizeModule;
}());
export { CdkColumnResizeModule };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sdW1uLXJlc2l6ZS1tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrLWV4cGVyaW1lbnRhbC9jb2x1bW4tcmVzaXplL2NvbHVtbi1yZXNpemUtbW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFdkMsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLDBDQUEwQyxDQUFDO0FBQ3pFLE9BQU8sRUFBQyxtQkFBbUIsRUFBQyxNQUFNLCtDQUErQyxDQUFDO0FBQ2xGLE9BQU8sRUFDTCw2QkFBNkIsRUFDOUIsTUFBTSwwREFBMEQsQ0FBQztBQUNsRSxPQUFPLEVBQ0wsaUNBQWlDLEVBQ2xDLE1BQU0sK0RBQStELENBQUM7QUFFdkU7OztHQUdHO0FBQ0g7SUFBQTtJQUlrRCxDQUFDOztnQkFKbEQsUUFBUSxTQUFDO29CQUNSLFlBQVksRUFBRSxDQUFDLDZCQUE2QixFQUFFLGlDQUFpQyxDQUFDO29CQUNoRixPQUFPLEVBQUUsQ0FBQyw2QkFBNkIsRUFBRSxpQ0FBaUMsQ0FBQztpQkFDNUU7O0lBQ2lELDBDQUFDO0NBQUEsQUFKbkQsSUFJbUQ7U0FBdEMsbUNBQW1DO0FBRWhEOzs7R0FHRztBQUNIO0lBQUE7SUFJb0MsQ0FBQzs7Z0JBSnBDLFFBQVEsU0FBQztvQkFDUixZQUFZLEVBQUUsQ0FBQyxlQUFlLEVBQUUsbUJBQW1CLENBQUM7b0JBQ3BELE9BQU8sRUFBRSxDQUFDLGVBQWUsRUFBRSxtQkFBbUIsQ0FBQztpQkFDaEQ7O0lBQ21DLDRCQUFDO0NBQUEsQUFKckMsSUFJcUM7U0FBeEIscUJBQXFCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7TmdNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge0Nka0NvbHVtblJlc2l6ZX0gZnJvbSAnLi9jb2x1bW4tcmVzaXplLWRpcmVjdGl2ZXMvY29sdW1uLXJlc2l6ZSc7XG5pbXBvcnQge0Nka0NvbHVtblJlc2l6ZUZsZXh9IGZyb20gJy4vY29sdW1uLXJlc2l6ZS1kaXJlY3RpdmVzL2NvbHVtbi1yZXNpemUtZmxleCc7XG5pbXBvcnQge1xuICBDZGtEZWZhdWx0RW5hYmxlZENvbHVtblJlc2l6ZVxufSBmcm9tICcuL2NvbHVtbi1yZXNpemUtZGlyZWN0aXZlcy9kZWZhdWx0LWVuYWJsZWQtY29sdW1uLXJlc2l6ZSc7XG5pbXBvcnQge1xuICBDZGtEZWZhdWx0RW5hYmxlZENvbHVtblJlc2l6ZUZsZXhcbn0gZnJvbSAnLi9jb2x1bW4tcmVzaXplLWRpcmVjdGl2ZXMvZGVmYXVsdC1lbmFibGVkLWNvbHVtbi1yZXNpemUtZmxleCc7XG5cbi8qKlxuICogT25lIG9mIHR3byBOZ01vZHVsZXMgZm9yIHVzZSB3aXRoIENka0NvbHVtblJlc2l6ZS5cbiAqIFdoZW4gdXNpbmcgdGhpcyBtb2R1bGUsIGNvbHVtbnMgYXJlIHJlc2l6YWJsZSBieSBkZWZhdWx0LlxuICovXG5ATmdNb2R1bGUoe1xuICBkZWNsYXJhdGlvbnM6IFtDZGtEZWZhdWx0RW5hYmxlZENvbHVtblJlc2l6ZSwgQ2RrRGVmYXVsdEVuYWJsZWRDb2x1bW5SZXNpemVGbGV4XSxcbiAgZXhwb3J0czogW0Nka0RlZmF1bHRFbmFibGVkQ29sdW1uUmVzaXplLCBDZGtEZWZhdWx0RW5hYmxlZENvbHVtblJlc2l6ZUZsZXhdLFxufSlcbmV4cG9ydCBjbGFzcyBDZGtDb2x1bW5SZXNpemVEZWZhdWx0RW5hYmxlZE1vZHVsZSB7fVxuXG4vKipcbiAqIE9uZSBvZiB0d28gTmdNb2R1bGVzIGZvciB1c2Ugd2l0aCBDZGtDb2x1bW5SZXNpemUuXG4gKiBXaGVuIHVzaW5nIHRoaXMgbW9kdWxlLCBjb2x1bW5zIGFyZSBub3QgcmVzaXphYmxlIGJ5IGRlZmF1bHQuXG4gKi9cbkBOZ01vZHVsZSh7XG4gIGRlY2xhcmF0aW9uczogW0Nka0NvbHVtblJlc2l6ZSwgQ2RrQ29sdW1uUmVzaXplRmxleF0sXG4gIGV4cG9ydHM6IFtDZGtDb2x1bW5SZXNpemUsIENka0NvbHVtblJlc2l6ZUZsZXhdLFxufSlcbmV4cG9ydCBjbGFzcyBDZGtDb2x1bW5SZXNpemVNb2R1bGUge31cbiJdfQ==