/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Injectable, NgZone } from '@angular/core';
import { FocusTrapFactory } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { Overlay } from '@angular/cdk/overlay';
import { ScrollDispatcher, ViewportRuler } from '@angular/cdk/scrolling';
import { EditEventDispatcher } from './edit-event-dispatcher';
import { FocusDispatcher } from './focus-dispatcher';
import { PopoverEditPositionStrategyFactory } from './popover-edit-position-strategy-factory';
/**
 * Optimization
 * Collects multiple Injectables into a singleton shared across the table. By reducing the
 * number of services injected into each CdkPopoverEdit, this saves about 0.023ms of cpu time
 * and 56 bytes of memory per instance.
 */
var EditServices = /** @class */ (function () {
    function EditServices(directionality, editEventDispatcher, focusDispatcher, focusTrapFactory, ngZone, overlay, positionFactory, scrollDispatcher, viewportRuler) {
        this.directionality = directionality;
        this.editEventDispatcher = editEventDispatcher;
        this.focusDispatcher = focusDispatcher;
        this.focusTrapFactory = focusTrapFactory;
        this.ngZone = ngZone;
        this.overlay = overlay;
        this.positionFactory = positionFactory;
        this.scrollDispatcher = scrollDispatcher;
        this.viewportRuler = viewportRuler;
    }
    EditServices.decorators = [
        { type: Injectable }
    ];
    /** @nocollapse */
    EditServices.ctorParameters = function () { return [
        { type: Directionality },
        { type: EditEventDispatcher },
        { type: FocusDispatcher },
        { type: FocusTrapFactory },
        { type: NgZone },
        { type: Overlay },
        { type: PopoverEditPositionStrategyFactory },
        { type: ScrollDispatcher },
        { type: ViewportRuler }
    ]; };
    return EditServices;
}());
export { EditServices };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdC1zZXJ2aWNlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL3BvcG92ZXItZWRpdC9lZGl0LXNlcnZpY2VzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxVQUFVLEVBQUUsTUFBTSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ2pELE9BQU8sRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQ25ELE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUNqRCxPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFDN0MsT0FBTyxFQUFDLGdCQUFnQixFQUFFLGFBQWEsRUFBQyxNQUFNLHdCQUF3QixDQUFDO0FBRXZFLE9BQU8sRUFBQyxtQkFBbUIsRUFBQyxNQUFNLHlCQUF5QixDQUFDO0FBQzVELE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSxvQkFBb0IsQ0FBQztBQUNuRCxPQUFPLEVBQUMsa0NBQWtDLEVBQUMsTUFBTSwwQ0FBMEMsQ0FBQztBQUU1Rjs7Ozs7R0FLRztBQUNIO0lBRUUsc0JBQ2EsY0FBOEIsRUFDOUIsbUJBQXdDLEVBQVcsZUFBZ0MsRUFDbkYsZ0JBQWtDLEVBQVcsTUFBYyxFQUMzRCxPQUFnQixFQUFXLGVBQW1ELEVBQzlFLGdCQUFrQyxFQUFXLGFBQTRCO1FBSnpFLG1CQUFjLEdBQWQsY0FBYyxDQUFnQjtRQUM5Qix3QkFBbUIsR0FBbkIsbUJBQW1CLENBQXFCO1FBQVcsb0JBQWUsR0FBZixlQUFlLENBQWlCO1FBQ25GLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7UUFBVyxXQUFNLEdBQU4sTUFBTSxDQUFRO1FBQzNELFlBQU8sR0FBUCxPQUFPLENBQVM7UUFBVyxvQkFBZSxHQUFmLGVBQWUsQ0FBb0M7UUFDOUUscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtRQUFXLGtCQUFhLEdBQWIsYUFBYSxDQUFlO0lBQUcsQ0FBQzs7Z0JBUDNGLFVBQVU7Ozs7Z0JBZEgsY0FBYztnQkFJZCxtQkFBbUI7Z0JBQ25CLGVBQWU7Z0JBTmYsZ0JBQWdCO2dCQURKLE1BQU07Z0JBR2xCLE9BQU87Z0JBS1Asa0NBQWtDO2dCQUpsQyxnQkFBZ0I7Z0JBQUUsYUFBYTs7SUFvQnZDLG1CQUFDO0NBQUEsQUFSRCxJQVFDO1NBUFksWUFBWSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0luamVjdGFibGUsIE5nWm9uZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0ZvY3VzVHJhcEZhY3Rvcnl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9hMTF5JztcbmltcG9ydCB7RGlyZWN0aW9uYWxpdHl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9iaWRpJztcbmltcG9ydCB7T3ZlcmxheX0gZnJvbSAnQGFuZ3VsYXIvY2RrL292ZXJsYXknO1xuaW1wb3J0IHtTY3JvbGxEaXNwYXRjaGVyLCBWaWV3cG9ydFJ1bGVyfSBmcm9tICdAYW5ndWxhci9jZGsvc2Nyb2xsaW5nJztcblxuaW1wb3J0IHtFZGl0RXZlbnREaXNwYXRjaGVyfSBmcm9tICcuL2VkaXQtZXZlbnQtZGlzcGF0Y2hlcic7XG5pbXBvcnQge0ZvY3VzRGlzcGF0Y2hlcn0gZnJvbSAnLi9mb2N1cy1kaXNwYXRjaGVyJztcbmltcG9ydCB7UG9wb3ZlckVkaXRQb3NpdGlvblN0cmF0ZWd5RmFjdG9yeX0gZnJvbSAnLi9wb3BvdmVyLWVkaXQtcG9zaXRpb24tc3RyYXRlZ3ktZmFjdG9yeSc7XG5cbi8qKlxuICogT3B0aW1pemF0aW9uXG4gKiBDb2xsZWN0cyBtdWx0aXBsZSBJbmplY3RhYmxlcyBpbnRvIGEgc2luZ2xldG9uIHNoYXJlZCBhY3Jvc3MgdGhlIHRhYmxlLiBCeSByZWR1Y2luZyB0aGVcbiAqIG51bWJlciBvZiBzZXJ2aWNlcyBpbmplY3RlZCBpbnRvIGVhY2ggQ2RrUG9wb3ZlckVkaXQsIHRoaXMgc2F2ZXMgYWJvdXQgMC4wMjNtcyBvZiBjcHUgdGltZVxuICogYW5kIDU2IGJ5dGVzIG9mIG1lbW9yeSBwZXIgaW5zdGFuY2UuXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBFZGl0U2VydmljZXMge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHJlYWRvbmx5IGRpcmVjdGlvbmFsaXR5OiBEaXJlY3Rpb25hbGl0eSxcbiAgICAgIHJlYWRvbmx5IGVkaXRFdmVudERpc3BhdGNoZXI6IEVkaXRFdmVudERpc3BhdGNoZXIsIHJlYWRvbmx5IGZvY3VzRGlzcGF0Y2hlcjogRm9jdXNEaXNwYXRjaGVyLFxuICAgICAgcmVhZG9ubHkgZm9jdXNUcmFwRmFjdG9yeTogRm9jdXNUcmFwRmFjdG9yeSwgcmVhZG9ubHkgbmdab25lOiBOZ1pvbmUsXG4gICAgICByZWFkb25seSBvdmVybGF5OiBPdmVybGF5LCByZWFkb25seSBwb3NpdGlvbkZhY3Rvcnk6IFBvcG92ZXJFZGl0UG9zaXRpb25TdHJhdGVneUZhY3RvcnksXG4gICAgICByZWFkb25seSBzY3JvbGxEaXNwYXRjaGVyOiBTY3JvbGxEaXNwYXRjaGVyLCByZWFkb25seSB2aWV3cG9ydFJ1bGVyOiBWaWV3cG9ydFJ1bGVyKSB7fVxufVxuIl19