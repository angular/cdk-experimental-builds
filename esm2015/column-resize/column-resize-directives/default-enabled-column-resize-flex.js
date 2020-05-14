/**
 * @fileoverview added by tsickle
 * Generated from: src/cdk-experimental/column-resize/column-resize-directives/default-enabled-column-resize-flex.ts
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
 * Implicitly enables column resizing for a flex cdk-table.
 * Individual columns will be resizable unless opted out.
 */
export class CdkDefaultEnabledColumnResizeFlex extends ColumnResize {
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
CdkDefaultEnabledColumnResizeFlex.decorators = [
    { type: Directive, args: [{
                selector: 'cdk-table',
                providers: [
                    ...FLEX_PROVIDERS,
                    { provide: ColumnResize, useExisting: CdkDefaultEnabledColumnResizeFlex },
                ],
            },] }
];
/** @nocollapse */
CdkDefaultEnabledColumnResizeFlex.ctorParameters = () => [
    { type: ColumnResizeNotifier },
    { type: ElementRef },
    { type: HeaderRowEventDispatcher },
    { type: NgZone },
    { type: ColumnResizeNotifierSource }
];
if (false) {
    /** @type {?} */
    CdkDefaultEnabledColumnResizeFlex.prototype.columnResizeNotifier;
    /** @type {?} */
    CdkDefaultEnabledColumnResizeFlex.prototype.elementRef;
    /**
     * @type {?}
     * @protected
     */
    CdkDefaultEnabledColumnResizeFlex.prototype.eventDispatcher;
    /**
     * @type {?}
     * @protected
     */
    CdkDefaultEnabledColumnResizeFlex.prototype.ngZone;
    /**
     * @type {?}
     * @protected
     */
    CdkDefaultEnabledColumnResizeFlex.prototype.notifier;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVmYXVsdC1lbmFibGVkLWNvbHVtbi1yZXNpemUtZmxleC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL2NvbHVtbi1yZXNpemUvY29sdW1uLXJlc2l6ZS1kaXJlY3RpdmVzL2RlZmF1bHQtZW5hYmxlZC1jb2x1bW4tcmVzaXplLWZsZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBUUEsT0FBTyxFQUFDLFNBQVMsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRTVELE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUM5QyxPQUFPLEVBQUMsb0JBQW9CLEVBQUUsMEJBQTBCLEVBQUMsTUFBTSwyQkFBMkIsQ0FBQztBQUMzRixPQUFPLEVBQUMsd0JBQXdCLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUM3RCxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sYUFBYSxDQUFDOzs7OztBQWEzQyxNQUFNLE9BQU8saUNBQWtDLFNBQVEsWUFBWTs7Ozs7Ozs7SUFDakUsWUFDYSxvQkFBMEMsRUFDMUMsVUFBbUMsRUFDekIsZUFBeUMsRUFDekMsTUFBYyxFQUNkLFFBQW9DO1FBQ3pELEtBQUssRUFBRSxDQUFDO1FBTEcseUJBQW9CLEdBQXBCLG9CQUFvQixDQUFzQjtRQUMxQyxlQUFVLEdBQVYsVUFBVSxDQUF5QjtRQUN6QixvQkFBZSxHQUFmLGVBQWUsQ0FBMEI7UUFDekMsV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQUNkLGFBQVEsR0FBUixRQUFRLENBQTRCO0lBRTNELENBQUM7OztZQWZGLFNBQVMsU0FBQztnQkFDVCxRQUFRLEVBQUUsV0FBVztnQkFDckIsU0FBUyxFQUFFO29CQUNULEdBQUcsY0FBYztvQkFDakIsRUFBQyxPQUFPLEVBQUUsWUFBWSxFQUFFLFdBQVcsRUFBRSxpQ0FBaUMsRUFBQztpQkFDeEU7YUFDRjs7OztZQWRPLG9CQUFvQjtZQUhULFVBQVU7WUFJckIsd0JBQXdCO1lBSkQsTUFBTTtZQUdQLDBCQUEwQjs7OztJQWlCbEQsaUVBQW1EOztJQUNuRCx1REFBNEM7Ozs7O0lBQzVDLDREQUE0RDs7Ozs7SUFDNUQsbURBQWlDOzs7OztJQUNqQyxxREFBdUQiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtEaXJlY3RpdmUsIEVsZW1lbnRSZWYsIE5nWm9uZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7Q29sdW1uUmVzaXplfSBmcm9tICcuLi9jb2x1bW4tcmVzaXplJztcbmltcG9ydCB7Q29sdW1uUmVzaXplTm90aWZpZXIsIENvbHVtblJlc2l6ZU5vdGlmaWVyU291cmNlfSBmcm9tICcuLi9jb2x1bW4tcmVzaXplLW5vdGlmaWVyJztcbmltcG9ydCB7SGVhZGVyUm93RXZlbnREaXNwYXRjaGVyfSBmcm9tICcuLi9ldmVudC1kaXNwYXRjaGVyJztcbmltcG9ydCB7RkxFWF9QUk9WSURFUlN9IGZyb20gJy4vY29uc3RhbnRzJztcblxuLyoqXG4gKiBJbXBsaWNpdGx5IGVuYWJsZXMgY29sdW1uIHJlc2l6aW5nIGZvciBhIGZsZXggY2RrLXRhYmxlLlxuICogSW5kaXZpZHVhbCBjb2x1bW5zIHdpbGwgYmUgcmVzaXphYmxlIHVubGVzcyBvcHRlZCBvdXQuXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ2Nkay10YWJsZScsXG4gIHByb3ZpZGVyczogW1xuICAgIC4uLkZMRVhfUFJPVklERVJTLFxuICAgIHtwcm92aWRlOiBDb2x1bW5SZXNpemUsIHVzZUV4aXN0aW5nOiBDZGtEZWZhdWx0RW5hYmxlZENvbHVtblJlc2l6ZUZsZXh9LFxuICBdLFxufSlcbmV4cG9ydCBjbGFzcyBDZGtEZWZhdWx0RW5hYmxlZENvbHVtblJlc2l6ZUZsZXggZXh0ZW5kcyBDb2x1bW5SZXNpemUge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHJlYWRvbmx5IGNvbHVtblJlc2l6ZU5vdGlmaWVyOiBDb2x1bW5SZXNpemVOb3RpZmllcixcbiAgICAgIHJlYWRvbmx5IGVsZW1lbnRSZWY6IEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+LFxuICAgICAgcHJvdGVjdGVkIHJlYWRvbmx5IGV2ZW50RGlzcGF0Y2hlcjogSGVhZGVyUm93RXZlbnREaXNwYXRjaGVyLFxuICAgICAgcHJvdGVjdGVkIHJlYWRvbmx5IG5nWm9uZTogTmdab25lLFxuICAgICAgcHJvdGVjdGVkIHJlYWRvbmx5IG5vdGlmaWVyOiBDb2x1bW5SZXNpemVOb3RpZmllclNvdXJjZSkge1xuICAgIHN1cGVyKCk7XG4gIH1cbn1cbiJdfQ==