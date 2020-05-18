/**
 * @fileoverview added by tsickle
 * Generated from: src/cdk-experimental/column-resize/column-resize-directives/column-resize-flex.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
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
import { FLEX_PROVIDERS } from './constants';
/**
 * Explicitly enables column resizing for a flexbox-based cdk-table.
 * Individual columns must be annotated specifically.
 */
let CdkColumnResizeFlex = /** @class */ (() => {
    /**
     * Explicitly enables column resizing for a flexbox-based cdk-table.
     * Individual columns must be annotated specifically.
     */
    class CdkColumnResizeFlex extends ColumnResize {
        /**
         * @param {?} columnResizeNotifier
         * @param {?} elementRef
         * @param {?} eventDispatcher
         * @param {?} ngZone
         * @param {?} notifier
         */
        constructor(columnResizeNotifier, elementRef, eventDispatcher, ngZone, notifier) {
            super();
            this.columnResizeNotifier = columnResizeNotifier;
            this.elementRef = elementRef;
            this.eventDispatcher = eventDispatcher;
            this.ngZone = ngZone;
            this.notifier = notifier;
        }
    }
    CdkColumnResizeFlex.decorators = [
        { type: Directive, args: [{
                    selector: 'cdk-table[columnResize]',
                    providers: [
                        ...FLEX_PROVIDERS,
                        { provide: ColumnResize, useExisting: CdkColumnResizeFlex },
                    ],
                },] }
    ];
    /** @nocollapse */
    CdkColumnResizeFlex.ctorParameters = () => [
        { type: ColumnResizeNotifier },
        { type: ElementRef },
        { type: HeaderRowEventDispatcher },
        { type: NgZone },
        { type: ColumnResizeNotifierSource }
    ];
    return CdkColumnResizeFlex;
})();
export { CdkColumnResizeFlex };
if (false) {
    /** @type {?} */
    CdkColumnResizeFlex.prototype.columnResizeNotifier;
    /** @type {?} */
    CdkColumnResizeFlex.prototype.elementRef;
    /**
     * @type {?}
     * @protected
     */
    CdkColumnResizeFlex.prototype.eventDispatcher;
    /**
     * @type {?}
     * @protected
     */
    CdkColumnResizeFlex.prototype.ngZone;
    /**
     * @type {?}
     * @protected
     */
    CdkColumnResizeFlex.prototype.notifier;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sdW1uLXJlc2l6ZS1mbGV4LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvY29sdW1uLXJlc2l6ZS9jb2x1bW4tcmVzaXplLWRpcmVjdGl2ZXMvY29sdW1uLXJlc2l6ZS1mbGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQVFBLE9BQU8sRUFBQyxTQUFTLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUU1RCxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sa0JBQWtCLENBQUM7QUFDOUMsT0FBTyxFQUFDLG9CQUFvQixFQUFFLDBCQUEwQixFQUFDLE1BQU0sMkJBQTJCLENBQUM7QUFDM0YsT0FBTyxFQUFDLHdCQUF3QixFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDN0QsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLGFBQWEsQ0FBQzs7Ozs7QUFNM0M7Ozs7O0lBQUEsTUFPYSxtQkFBb0IsU0FBUSxZQUFZOzs7Ozs7OztRQUNuRCxZQUNhLG9CQUEwQyxFQUMxQyxVQUFtQyxFQUN6QixlQUF5QyxFQUN6QyxNQUFjLEVBQ2QsUUFBb0M7WUFDekQsS0FBSyxFQUFFLENBQUM7WUFMRyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXNCO1lBQzFDLGVBQVUsR0FBVixVQUFVLENBQXlCO1lBQ3pCLG9CQUFlLEdBQWYsZUFBZSxDQUEwQjtZQUN6QyxXQUFNLEdBQU4sTUFBTSxDQUFRO1lBQ2QsYUFBUSxHQUFSLFFBQVEsQ0FBNEI7UUFFM0QsQ0FBQzs7O2dCQWZGLFNBQVMsU0FBQztvQkFDVCxRQUFRLEVBQUUseUJBQXlCO29CQUNuQyxTQUFTLEVBQUU7d0JBQ1QsR0FBRyxjQUFjO3dCQUNqQixFQUFDLE9BQU8sRUFBRSxZQUFZLEVBQUUsV0FBVyxFQUFFLG1CQUFtQixFQUFDO3FCQUMxRDtpQkFDRjs7OztnQkFkTyxvQkFBb0I7Z0JBSFQsVUFBVTtnQkFJckIsd0JBQXdCO2dCQUpELE1BQU07Z0JBR1AsMEJBQTBCOztJQXdCeEQsMEJBQUM7S0FBQTtTQVRZLG1CQUFtQjs7O0lBRTFCLG1EQUFtRDs7SUFDbkQseUNBQTRDOzs7OztJQUM1Qyw4Q0FBNEQ7Ozs7O0lBQzVELHFDQUFpQzs7Ozs7SUFDakMsdUNBQXVEIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RGlyZWN0aXZlLCBFbGVtZW50UmVmLCBOZ1pvbmV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge0NvbHVtblJlc2l6ZX0gZnJvbSAnLi4vY29sdW1uLXJlc2l6ZSc7XG5pbXBvcnQge0NvbHVtblJlc2l6ZU5vdGlmaWVyLCBDb2x1bW5SZXNpemVOb3RpZmllclNvdXJjZX0gZnJvbSAnLi4vY29sdW1uLXJlc2l6ZS1ub3RpZmllcic7XG5pbXBvcnQge0hlYWRlclJvd0V2ZW50RGlzcGF0Y2hlcn0gZnJvbSAnLi4vZXZlbnQtZGlzcGF0Y2hlcic7XG5pbXBvcnQge0ZMRVhfUFJPVklERVJTfSBmcm9tICcuL2NvbnN0YW50cyc7XG5cbi8qKlxuICogRXhwbGljaXRseSBlbmFibGVzIGNvbHVtbiByZXNpemluZyBmb3IgYSBmbGV4Ym94LWJhc2VkIGNkay10YWJsZS5cbiAqIEluZGl2aWR1YWwgY29sdW1ucyBtdXN0IGJlIGFubm90YXRlZCBzcGVjaWZpY2FsbHkuXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ2Nkay10YWJsZVtjb2x1bW5SZXNpemVdJyxcbiAgcHJvdmlkZXJzOiBbXG4gICAgLi4uRkxFWF9QUk9WSURFUlMsXG4gICAge3Byb3ZpZGU6IENvbHVtblJlc2l6ZSwgdXNlRXhpc3Rpbmc6IENka0NvbHVtblJlc2l6ZUZsZXh9LFxuICBdLFxufSlcbmV4cG9ydCBjbGFzcyBDZGtDb2x1bW5SZXNpemVGbGV4IGV4dGVuZHMgQ29sdW1uUmVzaXplIHtcbiAgY29uc3RydWN0b3IoXG4gICAgICByZWFkb25seSBjb2x1bW5SZXNpemVOb3RpZmllcjogQ29sdW1uUmVzaXplTm90aWZpZXIsXG4gICAgICByZWFkb25seSBlbGVtZW50UmVmOiBFbGVtZW50UmVmPEhUTUxFbGVtZW50PixcbiAgICAgIHByb3RlY3RlZCByZWFkb25seSBldmVudERpc3BhdGNoZXI6IEhlYWRlclJvd0V2ZW50RGlzcGF0Y2hlcixcbiAgICAgIHByb3RlY3RlZCByZWFkb25seSBuZ1pvbmU6IE5nWm9uZSxcbiAgICAgIHByb3RlY3RlZCByZWFkb25seSBub3RpZmllcjogQ29sdW1uUmVzaXplTm90aWZpZXJTb3VyY2UpIHtcbiAgICBzdXBlcigpO1xuICB9XG59XG4iXX0=