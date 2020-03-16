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
 * Explicitly enables column resizing for a table-based cdk-table.
 * Individual columns must be annotated specifically.
 */
var CdkColumnResize = /** @class */ (function (_super) {
    __extends(CdkColumnResize, _super);
    function CdkColumnResize(columnResizeNotifier, elementRef, eventDispatcher, ngZone, notifier) {
        var _this = _super.call(this) || this;
        _this.columnResizeNotifier = columnResizeNotifier;
        _this.elementRef = elementRef;
        _this.eventDispatcher = eventDispatcher;
        _this.ngZone = ngZone;
        _this.notifier = notifier;
        return _this;
    }
    CdkColumnResize.decorators = [
        { type: Directive, args: [{
                    selector: 'table[cdk-table][columnResize]',
                    providers: __spread(TABLE_PROVIDERS, [
                        { provide: ColumnResize, useExisting: CdkColumnResize },
                    ]),
                },] }
    ];
    /** @nocollapse */
    CdkColumnResize.ctorParameters = function () { return [
        { type: ColumnResizeNotifier },
        { type: ElementRef },
        { type: HeaderRowEventDispatcher },
        { type: NgZone },
        { type: ColumnResizeNotifierSource }
    ]; };
    return CdkColumnResize;
}(ColumnResize));
export { CdkColumnResize };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sdW1uLXJlc2l6ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL2NvbHVtbi1yZXNpemUvY29sdW1uLXJlc2l6ZS1kaXJlY3RpdmVzL2NvbHVtbi1yZXNpemUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUVILE9BQU8sRUFBQyxTQUFTLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUU1RCxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sa0JBQWtCLENBQUM7QUFDOUMsT0FBTyxFQUFDLG9CQUFvQixFQUFFLDBCQUEwQixFQUFDLE1BQU0sMkJBQTJCLENBQUM7QUFDM0YsT0FBTyxFQUFDLHdCQUF3QixFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDN0QsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLGFBQWEsQ0FBQztBQUU1Qzs7O0dBR0c7QUFDSDtJQU9xQyxtQ0FBWTtJQUMvQyx5QkFDYSxvQkFBMEMsRUFDaEMsVUFBc0IsRUFDdEIsZUFBeUMsRUFDekMsTUFBYyxFQUNkLFFBQW9DO1FBTDNELFlBTUUsaUJBQU8sU0FDUjtRQU5ZLDBCQUFvQixHQUFwQixvQkFBb0IsQ0FBc0I7UUFDaEMsZ0JBQVUsR0FBVixVQUFVLENBQVk7UUFDdEIscUJBQWUsR0FBZixlQUFlLENBQTBCO1FBQ3pDLFlBQU0sR0FBTixNQUFNLENBQVE7UUFDZCxjQUFRLEdBQVIsUUFBUSxDQUE0Qjs7SUFFM0QsQ0FBQzs7Z0JBZkYsU0FBUyxTQUFDO29CQUNULFFBQVEsRUFBRSxnQ0FBZ0M7b0JBQzFDLFNBQVMsV0FDSixlQUFlO3dCQUNsQixFQUFDLE9BQU8sRUFBRSxZQUFZLEVBQUUsV0FBVyxFQUFFLGVBQWUsRUFBQztzQkFDdEQ7aUJBQ0Y7Ozs7Z0JBZE8sb0JBQW9CO2dCQUhULFVBQVU7Z0JBSXJCLHdCQUF3QjtnQkFKRCxNQUFNO2dCQUdQLDBCQUEwQjs7SUF3QnhELHNCQUFDO0NBQUEsQUFoQkQsQ0FPcUMsWUFBWSxHQVNoRDtTQVRZLGVBQWUiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtEaXJlY3RpdmUsIEVsZW1lbnRSZWYsIE5nWm9uZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7Q29sdW1uUmVzaXplfSBmcm9tICcuLi9jb2x1bW4tcmVzaXplJztcbmltcG9ydCB7Q29sdW1uUmVzaXplTm90aWZpZXIsIENvbHVtblJlc2l6ZU5vdGlmaWVyU291cmNlfSBmcm9tICcuLi9jb2x1bW4tcmVzaXplLW5vdGlmaWVyJztcbmltcG9ydCB7SGVhZGVyUm93RXZlbnREaXNwYXRjaGVyfSBmcm9tICcuLi9ldmVudC1kaXNwYXRjaGVyJztcbmltcG9ydCB7VEFCTEVfUFJPVklERVJTfSBmcm9tICcuL2NvbnN0YW50cyc7XG5cbi8qKlxuICogRXhwbGljaXRseSBlbmFibGVzIGNvbHVtbiByZXNpemluZyBmb3IgYSB0YWJsZS1iYXNlZCBjZGstdGFibGUuXG4gKiBJbmRpdmlkdWFsIGNvbHVtbnMgbXVzdCBiZSBhbm5vdGF0ZWQgc3BlY2lmaWNhbGx5LlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICd0YWJsZVtjZGstdGFibGVdW2NvbHVtblJlc2l6ZV0nLFxuICBwcm92aWRlcnM6IFtcbiAgICAuLi5UQUJMRV9QUk9WSURFUlMsXG4gICAge3Byb3ZpZGU6IENvbHVtblJlc2l6ZSwgdXNlRXhpc3Rpbmc6IENka0NvbHVtblJlc2l6ZX0sXG4gIF0sXG59KVxuZXhwb3J0IGNsYXNzIENka0NvbHVtblJlc2l6ZSBleHRlbmRzIENvbHVtblJlc2l6ZSB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcmVhZG9ubHkgY29sdW1uUmVzaXplTm90aWZpZXI6IENvbHVtblJlc2l6ZU5vdGlmaWVyLFxuICAgICAgcHJvdGVjdGVkIHJlYWRvbmx5IGVsZW1lbnRSZWY6IEVsZW1lbnRSZWYsXG4gICAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgZXZlbnREaXNwYXRjaGVyOiBIZWFkZXJSb3dFdmVudERpc3BhdGNoZXIsXG4gICAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgbmdab25lOiBOZ1pvbmUsXG4gICAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgbm90aWZpZXI6IENvbHVtblJlc2l6ZU5vdGlmaWVyU291cmNlKSB7XG4gICAgc3VwZXIoKTtcbiAgfVxufVxuIl19