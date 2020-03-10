/**
 * @fileoverview added by tsickle
 * Generated from: src/cdk-experimental/popover-edit/edit-services.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
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
    /**
     * @param {?} directionality
     * @param {?} editEventDispatcher
     * @param {?} focusDispatcher
     * @param {?} focusTrapFactory
     * @param {?} ngZone
     * @param {?} overlay
     * @param {?} positionFactory
     * @param {?} scrollDispatcher
     * @param {?} viewportRuler
     */
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
/** @nocollapse */
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
if (false) {
    /** @type {?} */
    EditServices.prototype.directionality;
    /** @type {?} */
    EditServices.prototype.editEventDispatcher;
    /** @type {?} */
    EditServices.prototype.focusDispatcher;
    /** @type {?} */
    EditServices.prototype.focusTrapFactory;
    /** @type {?} */
    EditServices.prototype.ngZone;
    /** @type {?} */
    EditServices.prototype.overlay;
    /** @type {?} */
    EditServices.prototype.positionFactory;
    /** @type {?} */
    EditServices.prototype.scrollDispatcher;
    /** @type {?} */
    EditServices.prototype.viewportRuler;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdC1zZXJ2aWNlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL3BvcG92ZXItZWRpdC9lZGl0LXNlcnZpY2VzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQVFBLE9BQU8sRUFBQyxVQUFVLEVBQUUsTUFBTSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ2pELE9BQU8sRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQ25ELE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUNqRCxPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFDN0MsT0FBTyxFQUFDLGdCQUFnQixFQUFFLGFBQWEsRUFBQyxNQUFNLHdCQUF3QixDQUFDO0FBRXZFLE9BQU8sRUFBQyxtQkFBbUIsRUFBQyxNQUFNLHlCQUF5QixDQUFDO0FBQzVELE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSxvQkFBb0IsQ0FBQztBQUNuRCxPQUFPLEVBQUMsa0NBQWtDLEVBQUMsTUFBTSwwQ0FBMEMsQ0FBQzs7Ozs7OztBQVM1RixNQUFNLE9BQU8sWUFBWTs7Ozs7Ozs7Ozs7O0lBQ3ZCLFlBQ2EsY0FBOEIsRUFDOUIsbUJBQXdDLEVBQVcsZUFBZ0MsRUFDbkYsZ0JBQWtDLEVBQVcsTUFBYyxFQUMzRCxPQUFnQixFQUFXLGVBQW1ELEVBQzlFLGdCQUFrQyxFQUFXLGFBQTRCO1FBSnpFLG1CQUFjLEdBQWQsY0FBYyxDQUFnQjtRQUM5Qix3QkFBbUIsR0FBbkIsbUJBQW1CLENBQXFCO1FBQVcsb0JBQWUsR0FBZixlQUFlLENBQWlCO1FBQ25GLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7UUFBVyxXQUFNLEdBQU4sTUFBTSxDQUFRO1FBQzNELFlBQU8sR0FBUCxPQUFPLENBQVM7UUFBVyxvQkFBZSxHQUFmLGVBQWUsQ0FBb0M7UUFDOUUscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtRQUFXLGtCQUFhLEdBQWIsYUFBYSxDQUFlO0lBQUcsQ0FBQzs7O1lBUDNGLFVBQVU7Ozs7WUFkSCxjQUFjO1lBSWQsbUJBQW1CO1lBQ25CLGVBQWU7WUFOZixnQkFBZ0I7WUFESixNQUFNO1lBR2xCLE9BQU87WUFLUCxrQ0FBa0M7WUFKbEMsZ0JBQWdCO1lBQUUsYUFBYTs7OztJQWVqQyxzQ0FBdUM7O0lBQ3ZDLDJDQUFpRDs7SUFBRSx1Q0FBeUM7O0lBQzVGLHdDQUEyQzs7SUFBRSw4QkFBdUI7O0lBQ3BFLCtCQUF5Qjs7SUFBRSx1Q0FBNEQ7O0lBQ3ZGLHdDQUEyQzs7SUFBRSxxQ0FBcUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtJbmplY3RhYmxlLCBOZ1pvbmV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtGb2N1c1RyYXBGYWN0b3J5fSBmcm9tICdAYW5ndWxhci9jZGsvYTExeSc7XG5pbXBvcnQge0RpcmVjdGlvbmFsaXR5fSBmcm9tICdAYW5ndWxhci9jZGsvYmlkaSc7XG5pbXBvcnQge092ZXJsYXl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9vdmVybGF5JztcbmltcG9ydCB7U2Nyb2xsRGlzcGF0Y2hlciwgVmlld3BvcnRSdWxlcn0gZnJvbSAnQGFuZ3VsYXIvY2RrL3Njcm9sbGluZyc7XG5cbmltcG9ydCB7RWRpdEV2ZW50RGlzcGF0Y2hlcn0gZnJvbSAnLi9lZGl0LWV2ZW50LWRpc3BhdGNoZXInO1xuaW1wb3J0IHtGb2N1c0Rpc3BhdGNoZXJ9IGZyb20gJy4vZm9jdXMtZGlzcGF0Y2hlcic7XG5pbXBvcnQge1BvcG92ZXJFZGl0UG9zaXRpb25TdHJhdGVneUZhY3Rvcnl9IGZyb20gJy4vcG9wb3Zlci1lZGl0LXBvc2l0aW9uLXN0cmF0ZWd5LWZhY3RvcnknO1xuXG4vKipcbiAqIE9wdGltaXphdGlvblxuICogQ29sbGVjdHMgbXVsdGlwbGUgSW5qZWN0YWJsZXMgaW50byBhIHNpbmdsZXRvbiBzaGFyZWQgYWNyb3NzIHRoZSB0YWJsZS4gQnkgcmVkdWNpbmcgdGhlXG4gKiBudW1iZXIgb2Ygc2VydmljZXMgaW5qZWN0ZWQgaW50byBlYWNoIENka1BvcG92ZXJFZGl0LCB0aGlzIHNhdmVzIGFib3V0IDAuMDIzbXMgb2YgY3B1IHRpbWVcbiAqIGFuZCA1NiBieXRlcyBvZiBtZW1vcnkgcGVyIGluc3RhbmNlLlxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgRWRpdFNlcnZpY2VzIHtcbiAgY29uc3RydWN0b3IoXG4gICAgICByZWFkb25seSBkaXJlY3Rpb25hbGl0eTogRGlyZWN0aW9uYWxpdHksXG4gICAgICByZWFkb25seSBlZGl0RXZlbnREaXNwYXRjaGVyOiBFZGl0RXZlbnREaXNwYXRjaGVyLCByZWFkb25seSBmb2N1c0Rpc3BhdGNoZXI6IEZvY3VzRGlzcGF0Y2hlcixcbiAgICAgIHJlYWRvbmx5IGZvY3VzVHJhcEZhY3Rvcnk6IEZvY3VzVHJhcEZhY3RvcnksIHJlYWRvbmx5IG5nWm9uZTogTmdab25lLFxuICAgICAgcmVhZG9ubHkgb3ZlcmxheTogT3ZlcmxheSwgcmVhZG9ubHkgcG9zaXRpb25GYWN0b3J5OiBQb3BvdmVyRWRpdFBvc2l0aW9uU3RyYXRlZ3lGYWN0b3J5LFxuICAgICAgcmVhZG9ubHkgc2Nyb2xsRGlzcGF0Y2hlcjogU2Nyb2xsRGlzcGF0Y2hlciwgcmVhZG9ubHkgdmlld3BvcnRSdWxlcjogVmlld3BvcnRSdWxlcikge31cbn1cbiJdfQ==