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
export class CdkColumnResizeFlex extends ColumnResize {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sdW1uLXJlc2l6ZS1mbGV4LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvY29sdW1uLXJlc2l6ZS9jb2x1bW4tcmVzaXplLWRpcmVjdGl2ZXMvY29sdW1uLXJlc2l6ZS1mbGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQVFBLE9BQU8sRUFBQyxTQUFTLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUU1RCxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sa0JBQWtCLENBQUM7QUFDOUMsT0FBTyxFQUFDLG9CQUFvQixFQUFFLDBCQUEwQixFQUFDLE1BQU0sMkJBQTJCLENBQUM7QUFDM0YsT0FBTyxFQUFDLHdCQUF3QixFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDN0QsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLGFBQWEsQ0FBQzs7Ozs7QUFhM0MsTUFBTSxPQUFPLG1CQUFvQixTQUFRLFlBQVk7Ozs7Ozs7O0lBQ25ELFlBQ2Esb0JBQTBDLEVBQzFDLFVBQW1DLEVBQ3pCLGVBQXlDLEVBQ3pDLE1BQWMsRUFDZCxRQUFvQztRQUN6RCxLQUFLLEVBQUUsQ0FBQztRQUxHLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBc0I7UUFDMUMsZUFBVSxHQUFWLFVBQVUsQ0FBeUI7UUFDekIsb0JBQWUsR0FBZixlQUFlLENBQTBCO1FBQ3pDLFdBQU0sR0FBTixNQUFNLENBQVE7UUFDZCxhQUFRLEdBQVIsUUFBUSxDQUE0QjtJQUUzRCxDQUFDOzs7WUFmRixTQUFTLFNBQUM7Z0JBQ1QsUUFBUSxFQUFFLHlCQUF5QjtnQkFDbkMsU0FBUyxFQUFFO29CQUNULEdBQUcsY0FBYztvQkFDakIsRUFBQyxPQUFPLEVBQUUsWUFBWSxFQUFFLFdBQVcsRUFBRSxtQkFBbUIsRUFBQztpQkFDMUQ7YUFDRjs7OztZQWRPLG9CQUFvQjtZQUhULFVBQVU7WUFJckIsd0JBQXdCO1lBSkQsTUFBTTtZQUdQLDBCQUEwQjs7OztJQWlCbEQsbURBQW1EOztJQUNuRCx5Q0FBNEM7Ozs7O0lBQzVDLDhDQUE0RDs7Ozs7SUFDNUQscUNBQWlDOzs7OztJQUNqQyx1Q0FBdUQiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtEaXJlY3RpdmUsIEVsZW1lbnRSZWYsIE5nWm9uZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7Q29sdW1uUmVzaXplfSBmcm9tICcuLi9jb2x1bW4tcmVzaXplJztcbmltcG9ydCB7Q29sdW1uUmVzaXplTm90aWZpZXIsIENvbHVtblJlc2l6ZU5vdGlmaWVyU291cmNlfSBmcm9tICcuLi9jb2x1bW4tcmVzaXplLW5vdGlmaWVyJztcbmltcG9ydCB7SGVhZGVyUm93RXZlbnREaXNwYXRjaGVyfSBmcm9tICcuLi9ldmVudC1kaXNwYXRjaGVyJztcbmltcG9ydCB7RkxFWF9QUk9WSURFUlN9IGZyb20gJy4vY29uc3RhbnRzJztcblxuLyoqXG4gKiBFeHBsaWNpdGx5IGVuYWJsZXMgY29sdW1uIHJlc2l6aW5nIGZvciBhIGZsZXhib3gtYmFzZWQgY2RrLXRhYmxlLlxuICogSW5kaXZpZHVhbCBjb2x1bW5zIG11c3QgYmUgYW5ub3RhdGVkIHNwZWNpZmljYWxseS5cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnY2RrLXRhYmxlW2NvbHVtblJlc2l6ZV0nLFxuICBwcm92aWRlcnM6IFtcbiAgICAuLi5GTEVYX1BST1ZJREVSUyxcbiAgICB7cHJvdmlkZTogQ29sdW1uUmVzaXplLCB1c2VFeGlzdGluZzogQ2RrQ29sdW1uUmVzaXplRmxleH0sXG4gIF0sXG59KVxuZXhwb3J0IGNsYXNzIENka0NvbHVtblJlc2l6ZUZsZXggZXh0ZW5kcyBDb2x1bW5SZXNpemUge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHJlYWRvbmx5IGNvbHVtblJlc2l6ZU5vdGlmaWVyOiBDb2x1bW5SZXNpemVOb3RpZmllcixcbiAgICAgIHJlYWRvbmx5IGVsZW1lbnRSZWY6IEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+LFxuICAgICAgcHJvdGVjdGVkIHJlYWRvbmx5IGV2ZW50RGlzcGF0Y2hlcjogSGVhZGVyUm93RXZlbnREaXNwYXRjaGVyLFxuICAgICAgcHJvdGVjdGVkIHJlYWRvbmx5IG5nWm9uZTogTmdab25lLFxuICAgICAgcHJvdGVjdGVkIHJlYWRvbmx5IG5vdGlmaWVyOiBDb2x1bW5SZXNpemVOb3RpZmllclNvdXJjZSkge1xuICAgIHN1cGVyKCk7XG4gIH1cbn1cbiJdfQ==