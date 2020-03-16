/**
 * @fileoverview added by tsickle
 * Generated from: src/cdk-experimental/column-resize/column-resize-directives/default-enabled-column-resize.ts
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
 * Implicitly enables column resizing for a table-based cdk-table.
 * Individual columns will be resizable unless opted out.
 */
export class CdkDefaultEnabledColumnResize extends ColumnResize {
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
CdkDefaultEnabledColumnResize.decorators = [
    { type: Directive, args: [{
                selector: 'table[cdk-table]',
                providers: [
                    ...TABLE_PROVIDERS,
                    { provide: ColumnResize, useExisting: CdkDefaultEnabledColumnResize },
                ],
            },] }
];
/** @nocollapse */
CdkDefaultEnabledColumnResize.ctorParameters = () => [
    { type: ColumnResizeNotifier },
    { type: ElementRef },
    { type: HeaderRowEventDispatcher },
    { type: NgZone },
    { type: ColumnResizeNotifierSource }
];
if (false) {
    /** @type {?} */
    CdkDefaultEnabledColumnResize.prototype.columnResizeNotifier;
    /**
     * @type {?}
     * @protected
     */
    CdkDefaultEnabledColumnResize.prototype.elementRef;
    /**
     * @type {?}
     * @protected
     */
    CdkDefaultEnabledColumnResize.prototype.eventDispatcher;
    /**
     * @type {?}
     * @protected
     */
    CdkDefaultEnabledColumnResize.prototype.ngZone;
    /**
     * @type {?}
     * @protected
     */
    CdkDefaultEnabledColumnResize.prototype.notifier;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVmYXVsdC1lbmFibGVkLWNvbHVtbi1yZXNpemUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrLWV4cGVyaW1lbnRhbC9jb2x1bW4tcmVzaXplL2NvbHVtbi1yZXNpemUtZGlyZWN0aXZlcy9kZWZhdWx0LWVuYWJsZWQtY29sdW1uLXJlc2l6ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFRQSxPQUFPLEVBQUMsU0FBUyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFNUQsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBQzlDLE9BQU8sRUFBQyxvQkFBb0IsRUFBRSwwQkFBMEIsRUFBQyxNQUFNLDJCQUEyQixDQUFDO0FBQzNGLE9BQU8sRUFBQyx3QkFBd0IsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQzdELE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSxhQUFhLENBQUM7Ozs7O0FBYTVDLE1BQU0sT0FBTyw2QkFBOEIsU0FBUSxZQUFZOzs7Ozs7OztJQUM3RCxZQUNhLG9CQUEwQyxFQUNoQyxVQUFzQixFQUN0QixlQUF5QyxFQUN6QyxNQUFjLEVBQ2QsUUFBb0M7UUFDekQsS0FBSyxFQUFFLENBQUM7UUFMRyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXNCO1FBQ2hDLGVBQVUsR0FBVixVQUFVLENBQVk7UUFDdEIsb0JBQWUsR0FBZixlQUFlLENBQTBCO1FBQ3pDLFdBQU0sR0FBTixNQUFNLENBQVE7UUFDZCxhQUFRLEdBQVIsUUFBUSxDQUE0QjtJQUUzRCxDQUFDOzs7WUFmRixTQUFTLFNBQUM7Z0JBQ1QsUUFBUSxFQUFFLGtCQUFrQjtnQkFDNUIsU0FBUyxFQUFFO29CQUNULEdBQUcsZUFBZTtvQkFDbEIsRUFBQyxPQUFPLEVBQUUsWUFBWSxFQUFFLFdBQVcsRUFBRSw2QkFBNkIsRUFBQztpQkFDcEU7YUFDRjs7OztZQWRPLG9CQUFvQjtZQUhULFVBQVU7WUFJckIsd0JBQXdCO1lBSkQsTUFBTTtZQUdQLDBCQUEwQjs7OztJQWlCbEQsNkRBQW1EOzs7OztJQUNuRCxtREFBeUM7Ozs7O0lBQ3pDLHdEQUE0RDs7Ozs7SUFDNUQsK0NBQWlDOzs7OztJQUNqQyxpREFBdUQiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtEaXJlY3RpdmUsIEVsZW1lbnRSZWYsIE5nWm9uZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7Q29sdW1uUmVzaXplfSBmcm9tICcuLi9jb2x1bW4tcmVzaXplJztcbmltcG9ydCB7Q29sdW1uUmVzaXplTm90aWZpZXIsIENvbHVtblJlc2l6ZU5vdGlmaWVyU291cmNlfSBmcm9tICcuLi9jb2x1bW4tcmVzaXplLW5vdGlmaWVyJztcbmltcG9ydCB7SGVhZGVyUm93RXZlbnREaXNwYXRjaGVyfSBmcm9tICcuLi9ldmVudC1kaXNwYXRjaGVyJztcbmltcG9ydCB7VEFCTEVfUFJPVklERVJTfSBmcm9tICcuL2NvbnN0YW50cyc7XG5cbi8qKlxuICogSW1wbGljaXRseSBlbmFibGVzIGNvbHVtbiByZXNpemluZyBmb3IgYSB0YWJsZS1iYXNlZCBjZGstdGFibGUuXG4gKiBJbmRpdmlkdWFsIGNvbHVtbnMgd2lsbCBiZSByZXNpemFibGUgdW5sZXNzIG9wdGVkIG91dC5cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAndGFibGVbY2RrLXRhYmxlXScsXG4gIHByb3ZpZGVyczogW1xuICAgIC4uLlRBQkxFX1BST1ZJREVSUyxcbiAgICB7cHJvdmlkZTogQ29sdW1uUmVzaXplLCB1c2VFeGlzdGluZzogQ2RrRGVmYXVsdEVuYWJsZWRDb2x1bW5SZXNpemV9LFxuICBdLFxufSlcbmV4cG9ydCBjbGFzcyBDZGtEZWZhdWx0RW5hYmxlZENvbHVtblJlc2l6ZSBleHRlbmRzIENvbHVtblJlc2l6ZSB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcmVhZG9ubHkgY29sdW1uUmVzaXplTm90aWZpZXI6IENvbHVtblJlc2l6ZU5vdGlmaWVyLFxuICAgICAgcHJvdGVjdGVkIHJlYWRvbmx5IGVsZW1lbnRSZWY6IEVsZW1lbnRSZWYsXG4gICAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgZXZlbnREaXNwYXRjaGVyOiBIZWFkZXJSb3dFdmVudERpc3BhdGNoZXIsXG4gICAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgbmdab25lOiBOZ1pvbmUsXG4gICAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgbm90aWZpZXI6IENvbHVtblJlc2l6ZU5vdGlmaWVyU291cmNlKSB7XG4gICAgc3VwZXIoKTtcbiAgfVxufVxuIl19