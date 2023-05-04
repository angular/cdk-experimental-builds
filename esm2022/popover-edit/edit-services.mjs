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
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/bidi";
import * as i2 from "./edit-event-dispatcher";
import * as i3 from "./focus-dispatcher";
import * as i4 from "@angular/cdk/a11y";
import * as i5 from "@angular/cdk/overlay";
import * as i6 from "./popover-edit-position-strategy-factory";
import * as i7 from "@angular/cdk/scrolling";
/**
 * Optimization
 * Collects multiple Injectables into a singleton shared across the table. By reducing the
 * number of services injected into each CdkPopoverEdit, this saves about 0.023ms of cpu time
 * and 56 bytes of memory per instance.
 */
class EditServices {
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.0.0", ngImport: i0, type: EditServices, deps: [{ token: i1.Directionality }, { token: i2.EditEventDispatcher }, { token: i3.FocusDispatcher }, { token: i4.FocusTrapFactory }, { token: i0.NgZone }, { token: i5.Overlay }, { token: i6.PopoverEditPositionStrategyFactory }, { token: i7.ScrollDispatcher }, { token: i7.ViewportRuler }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "16.0.0", ngImport: i0, type: EditServices }); }
}
export { EditServices };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.0.0", ngImport: i0, type: EditServices, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: i1.Directionality }, { type: i2.EditEventDispatcher }, { type: i3.FocusDispatcher }, { type: i4.FocusTrapFactory }, { type: i0.NgZone }, { type: i5.Overlay }, { type: i6.PopoverEditPositionStrategyFactory }, { type: i7.ScrollDispatcher }, { type: i7.ViewportRuler }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdC1zZXJ2aWNlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL3BvcG92ZXItZWRpdC9lZGl0LXNlcnZpY2VzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxVQUFVLEVBQUUsTUFBTSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ2pELE9BQU8sRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQ25ELE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUNqRCxPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFDN0MsT0FBTyxFQUFDLGdCQUFnQixFQUFFLGFBQWEsRUFBQyxNQUFNLHdCQUF3QixDQUFDO0FBRXZFLE9BQU8sRUFBQyxtQkFBbUIsRUFBQyxNQUFNLHlCQUF5QixDQUFDO0FBQzVELE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSxvQkFBb0IsQ0FBQztBQUNuRCxPQUFPLEVBQUMsa0NBQWtDLEVBQUMsTUFBTSwwQ0FBMEMsQ0FBQzs7Ozs7Ozs7O0FBRzVGOzs7OztHQUtHO0FBQ0gsTUFDYSxZQUFZO0lBQ3ZCLFlBQ1csY0FBOEIsRUFDOUIsbUJBQTBELEVBQzFELGVBQWdDLEVBQ2hDLGdCQUFrQyxFQUNsQyxNQUFjLEVBQ2QsT0FBZ0IsRUFDaEIsZUFBbUQsRUFDbkQsZ0JBQWtDLEVBQ2xDLGFBQTRCO1FBUjVCLG1CQUFjLEdBQWQsY0FBYyxDQUFnQjtRQUM5Qix3QkFBbUIsR0FBbkIsbUJBQW1CLENBQXVDO1FBQzFELG9CQUFlLEdBQWYsZUFBZSxDQUFpQjtRQUNoQyxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1FBQ2xDLFdBQU0sR0FBTixNQUFNLENBQVE7UUFDZCxZQUFPLEdBQVAsT0FBTyxDQUFTO1FBQ2hCLG9CQUFlLEdBQWYsZUFBZSxDQUFvQztRQUNuRCxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1FBQ2xDLGtCQUFhLEdBQWIsYUFBYSxDQUFlO0lBQ3BDLENBQUM7OEdBWE8sWUFBWTtrSEFBWixZQUFZOztTQUFaLFlBQVk7MkZBQVosWUFBWTtrQkFEeEIsVUFBVSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0luamVjdGFibGUsIE5nWm9uZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0ZvY3VzVHJhcEZhY3Rvcnl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9hMTF5JztcbmltcG9ydCB7RGlyZWN0aW9uYWxpdHl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9iaWRpJztcbmltcG9ydCB7T3ZlcmxheX0gZnJvbSAnQGFuZ3VsYXIvY2RrL292ZXJsYXknO1xuaW1wb3J0IHtTY3JvbGxEaXNwYXRjaGVyLCBWaWV3cG9ydFJ1bGVyfSBmcm9tICdAYW5ndWxhci9jZGsvc2Nyb2xsaW5nJztcblxuaW1wb3J0IHtFZGl0RXZlbnREaXNwYXRjaGVyfSBmcm9tICcuL2VkaXQtZXZlbnQtZGlzcGF0Y2hlcic7XG5pbXBvcnQge0ZvY3VzRGlzcGF0Y2hlcn0gZnJvbSAnLi9mb2N1cy1kaXNwYXRjaGVyJztcbmltcG9ydCB7UG9wb3ZlckVkaXRQb3NpdGlvblN0cmF0ZWd5RmFjdG9yeX0gZnJvbSAnLi9wb3BvdmVyLWVkaXQtcG9zaXRpb24tc3RyYXRlZ3ktZmFjdG9yeSc7XG5pbXBvcnQge0VkaXRSZWZ9IGZyb20gJy4vZWRpdC1yZWYnO1xuXG4vKipcbiAqIE9wdGltaXphdGlvblxuICogQ29sbGVjdHMgbXVsdGlwbGUgSW5qZWN0YWJsZXMgaW50byBhIHNpbmdsZXRvbiBzaGFyZWQgYWNyb3NzIHRoZSB0YWJsZS4gQnkgcmVkdWNpbmcgdGhlXG4gKiBudW1iZXIgb2Ygc2VydmljZXMgaW5qZWN0ZWQgaW50byBlYWNoIENka1BvcG92ZXJFZGl0LCB0aGlzIHNhdmVzIGFib3V0IDAuMDIzbXMgb2YgY3B1IHRpbWVcbiAqIGFuZCA1NiBieXRlcyBvZiBtZW1vcnkgcGVyIGluc3RhbmNlLlxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgRWRpdFNlcnZpY2VzIHtcbiAgY29uc3RydWN0b3IoXG4gICAgcmVhZG9ubHkgZGlyZWN0aW9uYWxpdHk6IERpcmVjdGlvbmFsaXR5LFxuICAgIHJlYWRvbmx5IGVkaXRFdmVudERpc3BhdGNoZXI6IEVkaXRFdmVudERpc3BhdGNoZXI8RWRpdFJlZjx1bmtub3duPj4sXG4gICAgcmVhZG9ubHkgZm9jdXNEaXNwYXRjaGVyOiBGb2N1c0Rpc3BhdGNoZXIsXG4gICAgcmVhZG9ubHkgZm9jdXNUcmFwRmFjdG9yeTogRm9jdXNUcmFwRmFjdG9yeSxcbiAgICByZWFkb25seSBuZ1pvbmU6IE5nWm9uZSxcbiAgICByZWFkb25seSBvdmVybGF5OiBPdmVybGF5LFxuICAgIHJlYWRvbmx5IHBvc2l0aW9uRmFjdG9yeTogUG9wb3ZlckVkaXRQb3NpdGlvblN0cmF0ZWd5RmFjdG9yeSxcbiAgICByZWFkb25seSBzY3JvbGxEaXNwYXRjaGVyOiBTY3JvbGxEaXNwYXRjaGVyLFxuICAgIHJlYWRvbmx5IHZpZXdwb3J0UnVsZXI6IFZpZXdwb3J0UnVsZXIsXG4gICkge31cbn1cbiJdfQ==