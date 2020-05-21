/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __decorate, __metadata } from "tslib";
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
let EditServices = /** @class */ (() => {
    let EditServices = class EditServices {
        constructor(directionality, editEventDispatcher, focusDispatcher, focusTrapFactory, ngZone, overlay, positionFactory, scrollDispatcher, viewportRuler) {
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
    };
    EditServices = __decorate([
        Injectable(),
        __metadata("design:paramtypes", [Directionality,
            EditEventDispatcher, FocusDispatcher,
            FocusTrapFactory, NgZone,
            Overlay, PopoverEditPositionStrategyFactory,
            ScrollDispatcher, ViewportRuler])
    ], EditServices);
    return EditServices;
})();
export { EditServices };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdC1zZXJ2aWNlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL3BvcG92ZXItZWRpdC9lZGl0LXNlcnZpY2VzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFFSCxPQUFPLEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUNqRCxPQUFPLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUNuRCxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDakQsT0FBTyxFQUFDLE9BQU8sRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBQzdDLE9BQU8sRUFBQyxnQkFBZ0IsRUFBRSxhQUFhLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQztBQUV2RSxPQUFPLEVBQUMsbUJBQW1CLEVBQUMsTUFBTSx5QkFBeUIsQ0FBQztBQUM1RCxPQUFPLEVBQUMsZUFBZSxFQUFDLE1BQU0sb0JBQW9CLENBQUM7QUFDbkQsT0FBTyxFQUFDLGtDQUFrQyxFQUFDLE1BQU0sMENBQTBDLENBQUM7QUFFNUY7Ozs7O0dBS0c7QUFFSDtJQUFBLElBQWEsWUFBWSxHQUF6QixNQUFhLFlBQVk7UUFDdkIsWUFDYSxjQUE4QixFQUM5QixtQkFBd0MsRUFBVyxlQUFnQyxFQUNuRixnQkFBa0MsRUFBVyxNQUFjLEVBQzNELE9BQWdCLEVBQVcsZUFBbUQsRUFDOUUsZ0JBQWtDLEVBQVcsYUFBNEI7WUFKekUsbUJBQWMsR0FBZCxjQUFjLENBQWdCO1lBQzlCLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBcUI7WUFBVyxvQkFBZSxHQUFmLGVBQWUsQ0FBaUI7WUFDbkYscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtZQUFXLFdBQU0sR0FBTixNQUFNLENBQVE7WUFDM0QsWUFBTyxHQUFQLE9BQU8sQ0FBUztZQUFXLG9CQUFlLEdBQWYsZUFBZSxDQUFvQztZQUM5RSxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1lBQVcsa0JBQWEsR0FBYixhQUFhLENBQWU7UUFBRyxDQUFDO0tBQzNGLENBQUE7SUFQWSxZQUFZO1FBRHhCLFVBQVUsRUFBRTt5Q0FHa0IsY0FBYztZQUNULG1CQUFtQixFQUE0QixlQUFlO1lBQ2pFLGdCQUFnQixFQUFtQixNQUFNO1lBQ2xELE9BQU8sRUFBNEIsa0NBQWtDO1lBQzVELGdCQUFnQixFQUEwQixhQUFhO09BTjNFLFlBQVksQ0FPeEI7SUFBRCxtQkFBQztLQUFBO1NBUFksWUFBWSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0luamVjdGFibGUsIE5nWm9uZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0ZvY3VzVHJhcEZhY3Rvcnl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9hMTF5JztcbmltcG9ydCB7RGlyZWN0aW9uYWxpdHl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9iaWRpJztcbmltcG9ydCB7T3ZlcmxheX0gZnJvbSAnQGFuZ3VsYXIvY2RrL292ZXJsYXknO1xuaW1wb3J0IHtTY3JvbGxEaXNwYXRjaGVyLCBWaWV3cG9ydFJ1bGVyfSBmcm9tICdAYW5ndWxhci9jZGsvc2Nyb2xsaW5nJztcblxuaW1wb3J0IHtFZGl0RXZlbnREaXNwYXRjaGVyfSBmcm9tICcuL2VkaXQtZXZlbnQtZGlzcGF0Y2hlcic7XG5pbXBvcnQge0ZvY3VzRGlzcGF0Y2hlcn0gZnJvbSAnLi9mb2N1cy1kaXNwYXRjaGVyJztcbmltcG9ydCB7UG9wb3ZlckVkaXRQb3NpdGlvblN0cmF0ZWd5RmFjdG9yeX0gZnJvbSAnLi9wb3BvdmVyLWVkaXQtcG9zaXRpb24tc3RyYXRlZ3ktZmFjdG9yeSc7XG5cbi8qKlxuICogT3B0aW1pemF0aW9uXG4gKiBDb2xsZWN0cyBtdWx0aXBsZSBJbmplY3RhYmxlcyBpbnRvIGEgc2luZ2xldG9uIHNoYXJlZCBhY3Jvc3MgdGhlIHRhYmxlLiBCeSByZWR1Y2luZyB0aGVcbiAqIG51bWJlciBvZiBzZXJ2aWNlcyBpbmplY3RlZCBpbnRvIGVhY2ggQ2RrUG9wb3ZlckVkaXQsIHRoaXMgc2F2ZXMgYWJvdXQgMC4wMjNtcyBvZiBjcHUgdGltZVxuICogYW5kIDU2IGJ5dGVzIG9mIG1lbW9yeSBwZXIgaW5zdGFuY2UuXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBFZGl0U2VydmljZXMge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHJlYWRvbmx5IGRpcmVjdGlvbmFsaXR5OiBEaXJlY3Rpb25hbGl0eSxcbiAgICAgIHJlYWRvbmx5IGVkaXRFdmVudERpc3BhdGNoZXI6IEVkaXRFdmVudERpc3BhdGNoZXIsIHJlYWRvbmx5IGZvY3VzRGlzcGF0Y2hlcjogRm9jdXNEaXNwYXRjaGVyLFxuICAgICAgcmVhZG9ubHkgZm9jdXNUcmFwRmFjdG9yeTogRm9jdXNUcmFwRmFjdG9yeSwgcmVhZG9ubHkgbmdab25lOiBOZ1pvbmUsXG4gICAgICByZWFkb25seSBvdmVybGF5OiBPdmVybGF5LCByZWFkb25seSBwb3NpdGlvbkZhY3Rvcnk6IFBvcG92ZXJFZGl0UG9zaXRpb25TdHJhdGVneUZhY3RvcnksXG4gICAgICByZWFkb25seSBzY3JvbGxEaXNwYXRjaGVyOiBTY3JvbGxEaXNwYXRjaGVyLCByZWFkb25seSB2aWV3cG9ydFJ1bGVyOiBWaWV3cG9ydFJ1bGVyKSB7fVxufVxuIl19