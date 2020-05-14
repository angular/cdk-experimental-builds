/**
 * @fileoverview added by tsickle
 * Generated from: src/cdk-experimental/column-resize/column-resize-directives/column-resize.ts
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
import { TABLE_PROVIDERS } from './constants';
/**
 * Explicitly enables column resizing for a table-based cdk-table.
 * Individual columns must be annotated specifically.
 */
export class CdkColumnResize extends ColumnResize {
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
CdkColumnResize.decorators = [
    { type: Directive, args: [{
                selector: 'table[cdk-table][columnResize]',
                providers: [
                    ...TABLE_PROVIDERS,
                    { provide: ColumnResize, useExisting: CdkColumnResize },
                ],
            },] }
];
/** @nocollapse */
CdkColumnResize.ctorParameters = () => [
    { type: ColumnResizeNotifier },
    { type: ElementRef },
    { type: HeaderRowEventDispatcher },
    { type: NgZone },
    { type: ColumnResizeNotifierSource }
];
if (false) {
    /** @type {?} */
    CdkColumnResize.prototype.columnResizeNotifier;
    /** @type {?} */
    CdkColumnResize.prototype.elementRef;
    /**
     * @type {?}
     * @protected
     */
    CdkColumnResize.prototype.eventDispatcher;
    /**
     * @type {?}
     * @protected
     */
    CdkColumnResize.prototype.ngZone;
    /**
     * @type {?}
     * @protected
     */
    CdkColumnResize.prototype.notifier;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sdW1uLXJlc2l6ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL2NvbHVtbi1yZXNpemUvY29sdW1uLXJlc2l6ZS1kaXJlY3RpdmVzL2NvbHVtbi1yZXNpemUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBUUEsT0FBTyxFQUFDLFNBQVMsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRTVELE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUM5QyxPQUFPLEVBQUMsb0JBQW9CLEVBQUUsMEJBQTBCLEVBQUMsTUFBTSwyQkFBMkIsQ0FBQztBQUMzRixPQUFPLEVBQUMsd0JBQXdCLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUM3RCxPQUFPLEVBQUMsZUFBZSxFQUFDLE1BQU0sYUFBYSxDQUFDOzs7OztBQWE1QyxNQUFNLE9BQU8sZUFBZ0IsU0FBUSxZQUFZOzs7Ozs7OztJQUMvQyxZQUNhLG9CQUEwQyxFQUMxQyxVQUFtQyxFQUN6QixlQUF5QyxFQUN6QyxNQUFjLEVBQ2QsUUFBb0M7UUFDekQsS0FBSyxFQUFFLENBQUM7UUFMRyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXNCO1FBQzFDLGVBQVUsR0FBVixVQUFVLENBQXlCO1FBQ3pCLG9CQUFlLEdBQWYsZUFBZSxDQUEwQjtRQUN6QyxXQUFNLEdBQU4sTUFBTSxDQUFRO1FBQ2QsYUFBUSxHQUFSLFFBQVEsQ0FBNEI7SUFFM0QsQ0FBQzs7O1lBZkYsU0FBUyxTQUFDO2dCQUNULFFBQVEsRUFBRSxnQ0FBZ0M7Z0JBQzFDLFNBQVMsRUFBRTtvQkFDVCxHQUFHLGVBQWU7b0JBQ2xCLEVBQUMsT0FBTyxFQUFFLFlBQVksRUFBRSxXQUFXLEVBQUUsZUFBZSxFQUFDO2lCQUN0RDthQUNGOzs7O1lBZE8sb0JBQW9CO1lBSFQsVUFBVTtZQUlyQix3QkFBd0I7WUFKRCxNQUFNO1lBR1AsMEJBQTBCOzs7O0lBaUJsRCwrQ0FBbUQ7O0lBQ25ELHFDQUE0Qzs7Ozs7SUFDNUMsMENBQTREOzs7OztJQUM1RCxpQ0FBaUM7Ozs7O0lBQ2pDLG1DQUF1RCIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0RpcmVjdGl2ZSwgRWxlbWVudFJlZiwgTmdab25lfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtDb2x1bW5SZXNpemV9IGZyb20gJy4uL2NvbHVtbi1yZXNpemUnO1xuaW1wb3J0IHtDb2x1bW5SZXNpemVOb3RpZmllciwgQ29sdW1uUmVzaXplTm90aWZpZXJTb3VyY2V9IGZyb20gJy4uL2NvbHVtbi1yZXNpemUtbm90aWZpZXInO1xuaW1wb3J0IHtIZWFkZXJSb3dFdmVudERpc3BhdGNoZXJ9IGZyb20gJy4uL2V2ZW50LWRpc3BhdGNoZXInO1xuaW1wb3J0IHtUQUJMRV9QUk9WSURFUlN9IGZyb20gJy4vY29uc3RhbnRzJztcblxuLyoqXG4gKiBFeHBsaWNpdGx5IGVuYWJsZXMgY29sdW1uIHJlc2l6aW5nIGZvciBhIHRhYmxlLWJhc2VkIGNkay10YWJsZS5cbiAqIEluZGl2aWR1YWwgY29sdW1ucyBtdXN0IGJlIGFubm90YXRlZCBzcGVjaWZpY2FsbHkuXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ3RhYmxlW2Nkay10YWJsZV1bY29sdW1uUmVzaXplXScsXG4gIHByb3ZpZGVyczogW1xuICAgIC4uLlRBQkxFX1BST1ZJREVSUyxcbiAgICB7cHJvdmlkZTogQ29sdW1uUmVzaXplLCB1c2VFeGlzdGluZzogQ2RrQ29sdW1uUmVzaXplfSxcbiAgXSxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrQ29sdW1uUmVzaXplIGV4dGVuZHMgQ29sdW1uUmVzaXplIHtcbiAgY29uc3RydWN0b3IoXG4gICAgICByZWFkb25seSBjb2x1bW5SZXNpemVOb3RpZmllcjogQ29sdW1uUmVzaXplTm90aWZpZXIsXG4gICAgICByZWFkb25seSBlbGVtZW50UmVmOiBFbGVtZW50UmVmPEhUTUxFbGVtZW50PixcbiAgICAgIHByb3RlY3RlZCByZWFkb25seSBldmVudERpc3BhdGNoZXI6IEhlYWRlclJvd0V2ZW50RGlzcGF0Y2hlcixcbiAgICAgIHByb3RlY3RlZCByZWFkb25seSBuZ1pvbmU6IE5nWm9uZSxcbiAgICAgIHByb3RlY3RlZCByZWFkb25seSBub3RpZmllcjogQ29sdW1uUmVzaXplTm90aWZpZXJTb3VyY2UpIHtcbiAgICBzdXBlcigpO1xuICB9XG59XG4iXX0=