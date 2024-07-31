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
import * as i0 from "@angular/core";
/**
 * One of two NgModules for use with CdkColumnResize.
 * When using this module, columns are resizable by default.
 */
export class CdkColumnResizeDefaultEnabledModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkColumnResizeDefaultEnabledModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkColumnResizeDefaultEnabledModule, imports: [CdkDefaultEnabledColumnResize, CdkDefaultEnabledColumnResizeFlex], exports: [CdkDefaultEnabledColumnResize, CdkDefaultEnabledColumnResizeFlex] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkColumnResizeDefaultEnabledModule }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkColumnResizeDefaultEnabledModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [CdkDefaultEnabledColumnResize, CdkDefaultEnabledColumnResizeFlex],
                    exports: [CdkDefaultEnabledColumnResize, CdkDefaultEnabledColumnResizeFlex],
                }]
        }] });
/**
 * One of two NgModules for use with CdkColumnResize.
 * When using this module, columns are not resizable by default.
 */
export class CdkColumnResizeModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkColumnResizeModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkColumnResizeModule, imports: [CdkColumnResize, CdkColumnResizeFlex], exports: [CdkColumnResize, CdkColumnResizeFlex] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkColumnResizeModule }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.0-next.2", ngImport: i0, type: CdkColumnResizeModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [CdkColumnResize, CdkColumnResizeFlex],
                    exports: [CdkColumnResize, CdkColumnResizeFlex],
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sdW1uLXJlc2l6ZS1tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrLWV4cGVyaW1lbnRhbC9jb2x1bW4tcmVzaXplL2NvbHVtbi1yZXNpemUtbW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFdkMsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLDBDQUEwQyxDQUFDO0FBQ3pFLE9BQU8sRUFBQyxtQkFBbUIsRUFBQyxNQUFNLCtDQUErQyxDQUFDO0FBQ2xGLE9BQU8sRUFBQyw2QkFBNkIsRUFBQyxNQUFNLDBEQUEwRCxDQUFDO0FBQ3ZHLE9BQU8sRUFBQyxpQ0FBaUMsRUFBQyxNQUFNLCtEQUErRCxDQUFDOztBQUVoSDs7O0dBR0c7QUFLSCxNQUFNLE9BQU8sbUNBQW1DO3FIQUFuQyxtQ0FBbUM7c0hBQW5DLG1DQUFtQyxZQUhwQyw2QkFBNkIsRUFBRSxpQ0FBaUMsYUFDaEUsNkJBQTZCLEVBQUUsaUNBQWlDO3NIQUUvRCxtQ0FBbUM7O2tHQUFuQyxtQ0FBbUM7a0JBSi9DLFFBQVE7bUJBQUM7b0JBQ1IsT0FBTyxFQUFFLENBQUMsNkJBQTZCLEVBQUUsaUNBQWlDLENBQUM7b0JBQzNFLE9BQU8sRUFBRSxDQUFDLDZCQUE2QixFQUFFLGlDQUFpQyxDQUFDO2lCQUM1RTs7QUFHRDs7O0dBR0c7QUFLSCxNQUFNLE9BQU8scUJBQXFCO3FIQUFyQixxQkFBcUI7c0hBQXJCLHFCQUFxQixZQUh0QixlQUFlLEVBQUUsbUJBQW1CLGFBQ3BDLGVBQWUsRUFBRSxtQkFBbUI7c0hBRW5DLHFCQUFxQjs7a0dBQXJCLHFCQUFxQjtrQkFKakMsUUFBUTttQkFBQztvQkFDUixPQUFPLEVBQUUsQ0FBQyxlQUFlLEVBQUUsbUJBQW1CLENBQUM7b0JBQy9DLE9BQU8sRUFBRSxDQUFDLGVBQWUsRUFBRSxtQkFBbUIsQ0FBQztpQkFDaEQiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtOZ01vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7Q2RrQ29sdW1uUmVzaXplfSBmcm9tICcuL2NvbHVtbi1yZXNpemUtZGlyZWN0aXZlcy9jb2x1bW4tcmVzaXplJztcbmltcG9ydCB7Q2RrQ29sdW1uUmVzaXplRmxleH0gZnJvbSAnLi9jb2x1bW4tcmVzaXplLWRpcmVjdGl2ZXMvY29sdW1uLXJlc2l6ZS1mbGV4JztcbmltcG9ydCB7Q2RrRGVmYXVsdEVuYWJsZWRDb2x1bW5SZXNpemV9IGZyb20gJy4vY29sdW1uLXJlc2l6ZS1kaXJlY3RpdmVzL2RlZmF1bHQtZW5hYmxlZC1jb2x1bW4tcmVzaXplJztcbmltcG9ydCB7Q2RrRGVmYXVsdEVuYWJsZWRDb2x1bW5SZXNpemVGbGV4fSBmcm9tICcuL2NvbHVtbi1yZXNpemUtZGlyZWN0aXZlcy9kZWZhdWx0LWVuYWJsZWQtY29sdW1uLXJlc2l6ZS1mbGV4JztcblxuLyoqXG4gKiBPbmUgb2YgdHdvIE5nTW9kdWxlcyBmb3IgdXNlIHdpdGggQ2RrQ29sdW1uUmVzaXplLlxuICogV2hlbiB1c2luZyB0aGlzIG1vZHVsZSwgY29sdW1ucyBhcmUgcmVzaXphYmxlIGJ5IGRlZmF1bHQuXG4gKi9cbkBOZ01vZHVsZSh7XG4gIGltcG9ydHM6IFtDZGtEZWZhdWx0RW5hYmxlZENvbHVtblJlc2l6ZSwgQ2RrRGVmYXVsdEVuYWJsZWRDb2x1bW5SZXNpemVGbGV4XSxcbiAgZXhwb3J0czogW0Nka0RlZmF1bHRFbmFibGVkQ29sdW1uUmVzaXplLCBDZGtEZWZhdWx0RW5hYmxlZENvbHVtblJlc2l6ZUZsZXhdLFxufSlcbmV4cG9ydCBjbGFzcyBDZGtDb2x1bW5SZXNpemVEZWZhdWx0RW5hYmxlZE1vZHVsZSB7fVxuXG4vKipcbiAqIE9uZSBvZiB0d28gTmdNb2R1bGVzIGZvciB1c2Ugd2l0aCBDZGtDb2x1bW5SZXNpemUuXG4gKiBXaGVuIHVzaW5nIHRoaXMgbW9kdWxlLCBjb2x1bW5zIGFyZSBub3QgcmVzaXphYmxlIGJ5IGRlZmF1bHQuXG4gKi9cbkBOZ01vZHVsZSh7XG4gIGltcG9ydHM6IFtDZGtDb2x1bW5SZXNpemUsIENka0NvbHVtblJlc2l6ZUZsZXhdLFxuICBleHBvcnRzOiBbQ2RrQ29sdW1uUmVzaXplLCBDZGtDb2x1bW5SZXNpemVGbGV4XSxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrQ29sdW1uUmVzaXplTW9kdWxlIHt9XG4iXX0=