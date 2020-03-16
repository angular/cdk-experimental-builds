/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __extends, __read, __spread } from "tslib";
import { Directive, ElementRef, NgZone } from '@angular/core';
import { ColumnResize } from '../column-resize';
import { ColumnResizeNotifier, ColumnResizeNotifierSource } from '../column-resize-notifier';
import { HeaderRowEventDispatcher } from '../event-dispatcher';
import { TABLE_PROVIDERS } from './constants';
/**
 * Implicitly enables column resizing for a table-based cdk-table.
 * Individual columns will be resizable unless opted out.
 */
var CdkDefaultEnabledColumnResize = /** @class */ (function (_super) {
    __extends(CdkDefaultEnabledColumnResize, _super);
    function CdkDefaultEnabledColumnResize(columnResizeNotifier, elementRef, eventDispatcher, ngZone, notifier) {
        var _this = _super.call(this) || this;
        _this.columnResizeNotifier = columnResizeNotifier;
        _this.elementRef = elementRef;
        _this.eventDispatcher = eventDispatcher;
        _this.ngZone = ngZone;
        _this.notifier = notifier;
        return _this;
    }
    CdkDefaultEnabledColumnResize.decorators = [
        { type: Directive, args: [{
                    selector: 'table[cdk-table]',
                    providers: __spread(TABLE_PROVIDERS, [
                        { provide: ColumnResize, useExisting: CdkDefaultEnabledColumnResize },
                    ]),
                },] }
    ];
    /** @nocollapse */
    CdkDefaultEnabledColumnResize.ctorParameters = function () { return [
        { type: ColumnResizeNotifier },
        { type: ElementRef },
        { type: HeaderRowEventDispatcher },
        { type: NgZone },
        { type: ColumnResizeNotifierSource }
    ]; };
    return CdkDefaultEnabledColumnResize;
}(ColumnResize));
export { CdkDefaultEnabledColumnResize };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVmYXVsdC1lbmFibGVkLWNvbHVtbi1yZXNpemUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrLWV4cGVyaW1lbnRhbC9jb2x1bW4tcmVzaXplL2NvbHVtbi1yZXNpemUtZGlyZWN0aXZlcy9kZWZhdWx0LWVuYWJsZWQtY29sdW1uLXJlc2l6ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7O0FBRUgsT0FBTyxFQUFDLFNBQVMsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRTVELE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUM5QyxPQUFPLEVBQUMsb0JBQW9CLEVBQUUsMEJBQTBCLEVBQUMsTUFBTSwyQkFBMkIsQ0FBQztBQUMzRixPQUFPLEVBQUMsd0JBQXdCLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUM3RCxPQUFPLEVBQUMsZUFBZSxFQUFDLE1BQU0sYUFBYSxDQUFDO0FBRTVDOzs7R0FHRztBQUNIO0lBT21ELGlEQUFZO0lBQzdELHVDQUNhLG9CQUEwQyxFQUNoQyxVQUFzQixFQUN0QixlQUF5QyxFQUN6QyxNQUFjLEVBQ2QsUUFBb0M7UUFMM0QsWUFNRSxpQkFBTyxTQUNSO1FBTlksMEJBQW9CLEdBQXBCLG9CQUFvQixDQUFzQjtRQUNoQyxnQkFBVSxHQUFWLFVBQVUsQ0FBWTtRQUN0QixxQkFBZSxHQUFmLGVBQWUsQ0FBMEI7UUFDekMsWUFBTSxHQUFOLE1BQU0sQ0FBUTtRQUNkLGNBQVEsR0FBUixRQUFRLENBQTRCOztJQUUzRCxDQUFDOztnQkFmRixTQUFTLFNBQUM7b0JBQ1QsUUFBUSxFQUFFLGtCQUFrQjtvQkFDNUIsU0FBUyxXQUNKLGVBQWU7d0JBQ2xCLEVBQUMsT0FBTyxFQUFFLFlBQVksRUFBRSxXQUFXLEVBQUUsNkJBQTZCLEVBQUM7c0JBQ3BFO2lCQUNGOzs7O2dCQWRPLG9CQUFvQjtnQkFIVCxVQUFVO2dCQUlyQix3QkFBd0I7Z0JBSkQsTUFBTTtnQkFHUCwwQkFBMEI7O0lBd0J4RCxvQ0FBQztDQUFBLEFBaEJELENBT21ELFlBQVksR0FTOUQ7U0FUWSw2QkFBNkIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtEaXJlY3RpdmUsIEVsZW1lbnRSZWYsIE5nWm9uZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7Q29sdW1uUmVzaXplfSBmcm9tICcuLi9jb2x1bW4tcmVzaXplJztcbmltcG9ydCB7Q29sdW1uUmVzaXplTm90aWZpZXIsIENvbHVtblJlc2l6ZU5vdGlmaWVyU291cmNlfSBmcm9tICcuLi9jb2x1bW4tcmVzaXplLW5vdGlmaWVyJztcbmltcG9ydCB7SGVhZGVyUm93RXZlbnREaXNwYXRjaGVyfSBmcm9tICcuLi9ldmVudC1kaXNwYXRjaGVyJztcbmltcG9ydCB7VEFCTEVfUFJPVklERVJTfSBmcm9tICcuL2NvbnN0YW50cyc7XG5cbi8qKlxuICogSW1wbGljaXRseSBlbmFibGVzIGNvbHVtbiByZXNpemluZyBmb3IgYSB0YWJsZS1iYXNlZCBjZGstdGFibGUuXG4gKiBJbmRpdmlkdWFsIGNvbHVtbnMgd2lsbCBiZSByZXNpemFibGUgdW5sZXNzIG9wdGVkIG91dC5cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAndGFibGVbY2RrLXRhYmxlXScsXG4gIHByb3ZpZGVyczogW1xuICAgIC4uLlRBQkxFX1BST1ZJREVSUyxcbiAgICB7cHJvdmlkZTogQ29sdW1uUmVzaXplLCB1c2VFeGlzdGluZzogQ2RrRGVmYXVsdEVuYWJsZWRDb2x1bW5SZXNpemV9LFxuICBdLFxufSlcbmV4cG9ydCBjbGFzcyBDZGtEZWZhdWx0RW5hYmxlZENvbHVtblJlc2l6ZSBleHRlbmRzIENvbHVtblJlc2l6ZSB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcmVhZG9ubHkgY29sdW1uUmVzaXplTm90aWZpZXI6IENvbHVtblJlc2l6ZU5vdGlmaWVyLFxuICAgICAgcHJvdGVjdGVkIHJlYWRvbmx5IGVsZW1lbnRSZWY6IEVsZW1lbnRSZWYsXG4gICAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgZXZlbnREaXNwYXRjaGVyOiBIZWFkZXJSb3dFdmVudERpc3BhdGNoZXIsXG4gICAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgbmdab25lOiBOZ1pvbmUsXG4gICAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgbm90aWZpZXI6IENvbHVtblJlc2l6ZU5vdGlmaWVyU291cmNlKSB7XG4gICAgc3VwZXIoKTtcbiAgfVxufVxuIl19