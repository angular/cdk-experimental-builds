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
export class EditServices {
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
}
EditServices.decorators = [
    { type: Injectable }
];
EditServices.ctorParameters = () => [
    { type: Directionality },
    { type: EditEventDispatcher },
    { type: FocusDispatcher },
    { type: FocusTrapFactory },
    { type: NgZone },
    { type: Overlay },
    { type: PopoverEditPositionStrategyFactory },
    { type: ScrollDispatcher },
    { type: ViewportRuler }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdC1zZXJ2aWNlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL3BvcG92ZXItZWRpdC9lZGl0LXNlcnZpY2VzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxVQUFVLEVBQUUsTUFBTSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ2pELE9BQU8sRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQ25ELE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUNqRCxPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFDN0MsT0FBTyxFQUFDLGdCQUFnQixFQUFFLGFBQWEsRUFBQyxNQUFNLHdCQUF3QixDQUFDO0FBRXZFLE9BQU8sRUFBQyxtQkFBbUIsRUFBQyxNQUFNLHlCQUF5QixDQUFDO0FBQzVELE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSxvQkFBb0IsQ0FBQztBQUNuRCxPQUFPLEVBQUMsa0NBQWtDLEVBQUMsTUFBTSwwQ0FBMEMsQ0FBQztBQUU1Rjs7Ozs7R0FLRztBQUVILE1BQU0sT0FBTyxZQUFZO0lBQ3ZCLFlBQ2EsY0FBOEIsRUFDOUIsbUJBQXdDLEVBQVcsZUFBZ0MsRUFDbkYsZ0JBQWtDLEVBQVcsTUFBYyxFQUMzRCxPQUFnQixFQUFXLGVBQW1ELEVBQzlFLGdCQUFrQyxFQUFXLGFBQTRCO1FBSnpFLG1CQUFjLEdBQWQsY0FBYyxDQUFnQjtRQUM5Qix3QkFBbUIsR0FBbkIsbUJBQW1CLENBQXFCO1FBQVcsb0JBQWUsR0FBZixlQUFlLENBQWlCO1FBQ25GLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7UUFBVyxXQUFNLEdBQU4sTUFBTSxDQUFRO1FBQzNELFlBQU8sR0FBUCxPQUFPLENBQVM7UUFBVyxvQkFBZSxHQUFmLGVBQWUsQ0FBb0M7UUFDOUUscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtRQUFXLGtCQUFhLEdBQWIsYUFBYSxDQUFlO0lBQUcsQ0FBQzs7O1lBUDNGLFVBQVU7OztZQWRILGNBQWM7WUFJZCxtQkFBbUI7WUFDbkIsZUFBZTtZQU5mLGdCQUFnQjtZQURKLE1BQU07WUFHbEIsT0FBTztZQUtQLGtDQUFrQztZQUpsQyxnQkFBZ0I7WUFBRSxhQUFhIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SW5qZWN0YWJsZSwgTmdab25lfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7Rm9jdXNUcmFwRmFjdG9yeX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2ExMXknO1xuaW1wb3J0IHtEaXJlY3Rpb25hbGl0eX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2JpZGknO1xuaW1wb3J0IHtPdmVybGF5fSBmcm9tICdAYW5ndWxhci9jZGsvb3ZlcmxheSc7XG5pbXBvcnQge1Njcm9sbERpc3BhdGNoZXIsIFZpZXdwb3J0UnVsZXJ9IGZyb20gJ0Bhbmd1bGFyL2Nkay9zY3JvbGxpbmcnO1xuXG5pbXBvcnQge0VkaXRFdmVudERpc3BhdGNoZXJ9IGZyb20gJy4vZWRpdC1ldmVudC1kaXNwYXRjaGVyJztcbmltcG9ydCB7Rm9jdXNEaXNwYXRjaGVyfSBmcm9tICcuL2ZvY3VzLWRpc3BhdGNoZXInO1xuaW1wb3J0IHtQb3BvdmVyRWRpdFBvc2l0aW9uU3RyYXRlZ3lGYWN0b3J5fSBmcm9tICcuL3BvcG92ZXItZWRpdC1wb3NpdGlvbi1zdHJhdGVneS1mYWN0b3J5JztcblxuLyoqXG4gKiBPcHRpbWl6YXRpb25cbiAqIENvbGxlY3RzIG11bHRpcGxlIEluamVjdGFibGVzIGludG8gYSBzaW5nbGV0b24gc2hhcmVkIGFjcm9zcyB0aGUgdGFibGUuIEJ5IHJlZHVjaW5nIHRoZVxuICogbnVtYmVyIG9mIHNlcnZpY2VzIGluamVjdGVkIGludG8gZWFjaCBDZGtQb3BvdmVyRWRpdCwgdGhpcyBzYXZlcyBhYm91dCAwLjAyM21zIG9mIGNwdSB0aW1lXG4gKiBhbmQgNTYgYnl0ZXMgb2YgbWVtb3J5IHBlciBpbnN0YW5jZS5cbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEVkaXRTZXJ2aWNlcyB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcmVhZG9ubHkgZGlyZWN0aW9uYWxpdHk6IERpcmVjdGlvbmFsaXR5LFxuICAgICAgcmVhZG9ubHkgZWRpdEV2ZW50RGlzcGF0Y2hlcjogRWRpdEV2ZW50RGlzcGF0Y2hlciwgcmVhZG9ubHkgZm9jdXNEaXNwYXRjaGVyOiBGb2N1c0Rpc3BhdGNoZXIsXG4gICAgICByZWFkb25seSBmb2N1c1RyYXBGYWN0b3J5OiBGb2N1c1RyYXBGYWN0b3J5LCByZWFkb25seSBuZ1pvbmU6IE5nWm9uZSxcbiAgICAgIHJlYWRvbmx5IG92ZXJsYXk6IE92ZXJsYXksIHJlYWRvbmx5IHBvc2l0aW9uRmFjdG9yeTogUG9wb3ZlckVkaXRQb3NpdGlvblN0cmF0ZWd5RmFjdG9yeSxcbiAgICAgIHJlYWRvbmx5IHNjcm9sbERpc3BhdGNoZXI6IFNjcm9sbERpc3BhdGNoZXIsIHJlYWRvbmx5IHZpZXdwb3J0UnVsZXI6IFZpZXdwb3J0UnVsZXIpIHt9XG59XG4iXX0=