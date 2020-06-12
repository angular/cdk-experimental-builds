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
let CdkDefaultEnabledColumnResize = /** @class */ (() => {
    class CdkDefaultEnabledColumnResize extends ColumnResize {
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
    CdkDefaultEnabledColumnResize.ctorParameters = () => [
        { type: ColumnResizeNotifier },
        { type: ElementRef },
        { type: HeaderRowEventDispatcher },
        { type: NgZone },
        { type: ColumnResizeNotifierSource }
    ];
    return CdkDefaultEnabledColumnResize;
})();
export { CdkDefaultEnabledColumnResize };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVmYXVsdC1lbmFibGVkLWNvbHVtbi1yZXNpemUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrLWV4cGVyaW1lbnRhbC9jb2x1bW4tcmVzaXplL2NvbHVtbi1yZXNpemUtZGlyZWN0aXZlcy9kZWZhdWx0LWVuYWJsZWQtY29sdW1uLXJlc2l6ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsU0FBUyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFNUQsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBQzlDLE9BQU8sRUFBQyxvQkFBb0IsRUFBRSwwQkFBMEIsRUFBQyxNQUFNLDJCQUEyQixDQUFDO0FBQzNGLE9BQU8sRUFBQyx3QkFBd0IsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQzdELE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSxhQUFhLENBQUM7QUFFNUM7OztHQUdHO0FBQ0g7SUFBQSxNQU9hLDZCQUE4QixTQUFRLFlBQVk7UUFDN0QsWUFDYSxvQkFBMEMsRUFDMUMsVUFBbUMsRUFDekIsZUFBeUMsRUFDekMsTUFBYyxFQUNkLFFBQW9DO1lBQ3pELEtBQUssRUFBRSxDQUFDO1lBTEcseUJBQW9CLEdBQXBCLG9CQUFvQixDQUFzQjtZQUMxQyxlQUFVLEdBQVYsVUFBVSxDQUF5QjtZQUN6QixvQkFBZSxHQUFmLGVBQWUsQ0FBMEI7WUFDekMsV0FBTSxHQUFOLE1BQU0sQ0FBUTtZQUNkLGFBQVEsR0FBUixRQUFRLENBQTRCO1FBRTNELENBQUM7OztnQkFmRixTQUFTLFNBQUM7b0JBQ1QsUUFBUSxFQUFFLGtCQUFrQjtvQkFDNUIsU0FBUyxFQUFFO3dCQUNULEdBQUcsZUFBZTt3QkFDbEIsRUFBQyxPQUFPLEVBQUUsWUFBWSxFQUFFLFdBQVcsRUFBRSw2QkFBNkIsRUFBQztxQkFDcEU7aUJBQ0Y7OztnQkFkTyxvQkFBb0I7Z0JBSFQsVUFBVTtnQkFJckIsd0JBQXdCO2dCQUpELE1BQU07Z0JBR1AsMEJBQTBCOztJQXdCeEQsb0NBQUM7S0FBQTtTQVRZLDZCQUE2QiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0RpcmVjdGl2ZSwgRWxlbWVudFJlZiwgTmdab25lfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtDb2x1bW5SZXNpemV9IGZyb20gJy4uL2NvbHVtbi1yZXNpemUnO1xuaW1wb3J0IHtDb2x1bW5SZXNpemVOb3RpZmllciwgQ29sdW1uUmVzaXplTm90aWZpZXJTb3VyY2V9IGZyb20gJy4uL2NvbHVtbi1yZXNpemUtbm90aWZpZXInO1xuaW1wb3J0IHtIZWFkZXJSb3dFdmVudERpc3BhdGNoZXJ9IGZyb20gJy4uL2V2ZW50LWRpc3BhdGNoZXInO1xuaW1wb3J0IHtUQUJMRV9QUk9WSURFUlN9IGZyb20gJy4vY29uc3RhbnRzJztcblxuLyoqXG4gKiBJbXBsaWNpdGx5IGVuYWJsZXMgY29sdW1uIHJlc2l6aW5nIGZvciBhIHRhYmxlLWJhc2VkIGNkay10YWJsZS5cbiAqIEluZGl2aWR1YWwgY29sdW1ucyB3aWxsIGJlIHJlc2l6YWJsZSB1bmxlc3Mgb3B0ZWQgb3V0LlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICd0YWJsZVtjZGstdGFibGVdJyxcbiAgcHJvdmlkZXJzOiBbXG4gICAgLi4uVEFCTEVfUFJPVklERVJTLFxuICAgIHtwcm92aWRlOiBDb2x1bW5SZXNpemUsIHVzZUV4aXN0aW5nOiBDZGtEZWZhdWx0RW5hYmxlZENvbHVtblJlc2l6ZX0sXG4gIF0sXG59KVxuZXhwb3J0IGNsYXNzIENka0RlZmF1bHRFbmFibGVkQ29sdW1uUmVzaXplIGV4dGVuZHMgQ29sdW1uUmVzaXplIHtcbiAgY29uc3RydWN0b3IoXG4gICAgICByZWFkb25seSBjb2x1bW5SZXNpemVOb3RpZmllcjogQ29sdW1uUmVzaXplTm90aWZpZXIsXG4gICAgICByZWFkb25seSBlbGVtZW50UmVmOiBFbGVtZW50UmVmPEhUTUxFbGVtZW50PixcbiAgICAgIHByb3RlY3RlZCByZWFkb25seSBldmVudERpc3BhdGNoZXI6IEhlYWRlclJvd0V2ZW50RGlzcGF0Y2hlcixcbiAgICAgIHByb3RlY3RlZCByZWFkb25seSBuZ1pvbmU6IE5nWm9uZSxcbiAgICAgIHByb3RlY3RlZCByZWFkb25seSBub3RpZmllcjogQ29sdW1uUmVzaXplTm90aWZpZXJTb3VyY2UpIHtcbiAgICBzdXBlcigpO1xuICB9XG59XG4iXX0=