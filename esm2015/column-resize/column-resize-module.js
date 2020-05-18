/**
 * @fileoverview added by tsickle
 * Generated from: src/cdk-experimental/column-resize/column-resize-module.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
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
let CdkColumnResizeDefaultEnabledModule = /** @class */ (() => {
    /**
     * One of two NgModules for use with CdkColumnResize.
     * When using this module, columns are resizable by default.
     */
    class CdkColumnResizeDefaultEnabledModule {
    }
    CdkColumnResizeDefaultEnabledModule.decorators = [
        { type: NgModule, args: [{
                    declarations: [CdkDefaultEnabledColumnResize, CdkDefaultEnabledColumnResizeFlex],
                    exports: [CdkDefaultEnabledColumnResize, CdkDefaultEnabledColumnResizeFlex],
                },] }
    ];
    return CdkColumnResizeDefaultEnabledModule;
})();
export { CdkColumnResizeDefaultEnabledModule };
/**
 * One of two NgModules for use with CdkColumnResize.
 * When using this module, columns are not resizable by default.
 */
let CdkColumnResizeModule = /** @class */ (() => {
    /**
     * One of two NgModules for use with CdkColumnResize.
     * When using this module, columns are not resizable by default.
     */
    class CdkColumnResizeModule {
    }
    CdkColumnResizeModule.decorators = [
        { type: NgModule, args: [{
                    declarations: [CdkColumnResize, CdkColumnResizeFlex],
                    exports: [CdkColumnResize, CdkColumnResizeFlex],
                },] }
    ];
    return CdkColumnResizeModule;
})();
export { CdkColumnResizeModule };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sdW1uLXJlc2l6ZS1tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrLWV4cGVyaW1lbnRhbC9jb2x1bW4tcmVzaXplL2NvbHVtbi1yZXNpemUtbW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQVFBLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFdkMsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLDBDQUEwQyxDQUFDO0FBQ3pFLE9BQU8sRUFBQyxtQkFBbUIsRUFBQyxNQUFNLCtDQUErQyxDQUFDO0FBQ2xGLE9BQU8sRUFDTCw2QkFBNkIsRUFDOUIsTUFBTSwwREFBMEQsQ0FBQztBQUNsRSxPQUFPLEVBQ0wsaUNBQWlDLEVBQ2xDLE1BQU0sK0RBQStELENBQUM7Ozs7O0FBTXZFOzs7OztJQUFBLE1BSWEsbUNBQW1DOzs7Z0JBSi9DLFFBQVEsU0FBQztvQkFDUixZQUFZLEVBQUUsQ0FBQyw2QkFBNkIsRUFBRSxpQ0FBaUMsQ0FBQztvQkFDaEYsT0FBTyxFQUFFLENBQUMsNkJBQTZCLEVBQUUsaUNBQWlDLENBQUM7aUJBQzVFOztJQUNpRCwwQ0FBQztLQUFBO1NBQXRDLG1DQUFtQzs7Ozs7QUFNaEQ7Ozs7O0lBQUEsTUFJYSxxQkFBcUI7OztnQkFKakMsUUFBUSxTQUFDO29CQUNSLFlBQVksRUFBRSxDQUFDLGVBQWUsRUFBRSxtQkFBbUIsQ0FBQztvQkFDcEQsT0FBTyxFQUFFLENBQUMsZUFBZSxFQUFFLG1CQUFtQixDQUFDO2lCQUNoRDs7SUFDbUMsNEJBQUM7S0FBQTtTQUF4QixxQkFBcUIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtOZ01vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7Q2RrQ29sdW1uUmVzaXplfSBmcm9tICcuL2NvbHVtbi1yZXNpemUtZGlyZWN0aXZlcy9jb2x1bW4tcmVzaXplJztcbmltcG9ydCB7Q2RrQ29sdW1uUmVzaXplRmxleH0gZnJvbSAnLi9jb2x1bW4tcmVzaXplLWRpcmVjdGl2ZXMvY29sdW1uLXJlc2l6ZS1mbGV4JztcbmltcG9ydCB7XG4gIENka0RlZmF1bHRFbmFibGVkQ29sdW1uUmVzaXplXG59IGZyb20gJy4vY29sdW1uLXJlc2l6ZS1kaXJlY3RpdmVzL2RlZmF1bHQtZW5hYmxlZC1jb2x1bW4tcmVzaXplJztcbmltcG9ydCB7XG4gIENka0RlZmF1bHRFbmFibGVkQ29sdW1uUmVzaXplRmxleFxufSBmcm9tICcuL2NvbHVtbi1yZXNpemUtZGlyZWN0aXZlcy9kZWZhdWx0LWVuYWJsZWQtY29sdW1uLXJlc2l6ZS1mbGV4JztcblxuLyoqXG4gKiBPbmUgb2YgdHdvIE5nTW9kdWxlcyBmb3IgdXNlIHdpdGggQ2RrQ29sdW1uUmVzaXplLlxuICogV2hlbiB1c2luZyB0aGlzIG1vZHVsZSwgY29sdW1ucyBhcmUgcmVzaXphYmxlIGJ5IGRlZmF1bHQuXG4gKi9cbkBOZ01vZHVsZSh7XG4gIGRlY2xhcmF0aW9uczogW0Nka0RlZmF1bHRFbmFibGVkQ29sdW1uUmVzaXplLCBDZGtEZWZhdWx0RW5hYmxlZENvbHVtblJlc2l6ZUZsZXhdLFxuICBleHBvcnRzOiBbQ2RrRGVmYXVsdEVuYWJsZWRDb2x1bW5SZXNpemUsIENka0RlZmF1bHRFbmFibGVkQ29sdW1uUmVzaXplRmxleF0sXG59KVxuZXhwb3J0IGNsYXNzIENka0NvbHVtblJlc2l6ZURlZmF1bHRFbmFibGVkTW9kdWxlIHt9XG5cbi8qKlxuICogT25lIG9mIHR3byBOZ01vZHVsZXMgZm9yIHVzZSB3aXRoIENka0NvbHVtblJlc2l6ZS5cbiAqIFdoZW4gdXNpbmcgdGhpcyBtb2R1bGUsIGNvbHVtbnMgYXJlIG5vdCByZXNpemFibGUgYnkgZGVmYXVsdC5cbiAqL1xuQE5nTW9kdWxlKHtcbiAgZGVjbGFyYXRpb25zOiBbQ2RrQ29sdW1uUmVzaXplLCBDZGtDb2x1bW5SZXNpemVGbGV4XSxcbiAgZXhwb3J0czogW0Nka0NvbHVtblJlc2l6ZSwgQ2RrQ29sdW1uUmVzaXplRmxleF0sXG59KVxuZXhwb3J0IGNsYXNzIENka0NvbHVtblJlc2l6ZU1vZHVsZSB7fVxuIl19