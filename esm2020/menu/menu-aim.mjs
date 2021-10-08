/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Injectable, NgZone, InjectionToken, Directive } from '@angular/core';
import { fromEvent, Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { throwMissingPointerFocusTracker, throwMissingMenuReference } from './menu-errors';
import * as i0 from "@angular/core";
/** Injection token used for an implementation of MenuAim. */
export const MENU_AIM = new InjectionToken('cdk-menu-aim');
/** Capture every nth mouse move event. */
const MOUSE_MOVE_SAMPLE_FREQUENCY = 3;
/** The number of mouse move events to track. */
const NUM_POINTS = 5;
/**
 * How long to wait before closing a sibling menu if a user stops short of the submenu they were
 * predicted to go into.
 */
const CLOSE_DELAY = 300;
/** Calculate the slope between point a and b. */
function getSlope(a, b) {
    return (b.y - a.y) / (b.x - a.x);
}
/** Calculate the y intercept for the given point and slope. */
function getYIntercept(point, slope) {
    return point.y - slope * point.x;
}
/**
 * Whether the given mouse trajectory line defined by the slope and y intercept falls within the
 * submenu as defined by `submenuPoints`
 * @param submenuPoints the submenu DOMRect points.
 * @param m the slope of the trajectory line.
 * @param b the y intercept of the trajectory line.
 *
 * @return true if any point on the line falls within the submenu.
 */
function isWithinSubmenu(submenuPoints, m, b) {
    const { left, right, top, bottom } = submenuPoints;
    // Check for intersection with each edge of the submenu (left, right, top, bottom)
    // by fixing one coordinate to that edge's coordinate (either x or y) and checking if the
    // other coordinate is within bounds.
    return ((m * left + b >= top && m * left + b <= bottom) ||
        (m * right + b >= top && m * right + b <= bottom) ||
        ((top - b) / m >= left && (top - b) / m <= right) ||
        ((bottom - b) / m >= left && (bottom - b) / m <= right));
}
/**
 * TargetMenuAim predicts if a user is moving into a submenu. It calculates the
 * trajectory of the user's mouse movement in the current menu to determine if the
 * mouse is moving towards an open submenu.
 *
 * The determination is made by calculating the slope of the users last NUM_POINTS moves where each
 * pair of points determines if the trajectory line points into the submenu. It uses consensus
 * approach by checking if at least NUM_POINTS / 2 pairs determine that the user is moving towards
 * to submenu.
 */
export class TargetMenuAim {
    constructor(_ngZone) {
        this._ngZone = _ngZone;
        /** The last NUM_POINTS mouse move events. */
        this._points = [];
        /** Emits when this service is destroyed. */
        this._destroyed = new Subject();
    }
    /** Set the Menu and its PointerFocusTracker. */
    initialize(menu, pointerTracker) {
        this._menu = menu;
        this._pointerTracker = pointerTracker;
        this._subscribeToMouseMoves();
    }
    /**
     * Calls the `doToggle` callback when it is deemed that the user is not moving towards
     * the submenu.
     * @param doToggle the function called when the user is not moving towards the submenu.
     */
    toggle(doToggle) {
        // If the menu is horizontal the sub-menus open below and there is no risk of premature
        // closing of any sub-menus therefore we automatically resolve the callback.
        if (this._menu.orientation === 'horizontal') {
            doToggle();
        }
        this._checkConfigured();
        const siblingItemIsWaiting = !!this._timeoutId;
        const hasPoints = this._points.length > 1;
        if (hasPoints && !siblingItemIsWaiting) {
            if (this._isMovingToSubmenu()) {
                this._startTimeout(doToggle);
            }
            else {
                doToggle();
            }
        }
        else if (!siblingItemIsWaiting) {
            doToggle();
        }
    }
    /**
     * Start the delayed toggle handler if one isn't running already.
     *
     * The delayed toggle handler executes the `doToggle` callback after some period of time iff the
     * users mouse is on an item in the current menu.
     */
    _startTimeout(doToggle) {
        // If the users mouse is moving towards a submenu we don't want to immediately resolve.
        // Wait for some period of time before determining if the previous menu should close in
        // cases where the user may have moved towards the submenu but stopped on a sibling menu
        // item intentionally.
        const timeoutId = setTimeout(() => {
            // Resolve if the user is currently moused over some element in the root menu
            if (this._pointerTracker.activeElement && timeoutId === this._timeoutId) {
                doToggle();
            }
            this._timeoutId = null;
        }, CLOSE_DELAY);
        this._timeoutId = timeoutId;
    }
    /** Whether the user is heading towards the open submenu. */
    _isMovingToSubmenu() {
        const submenuPoints = this._getSubmenuBounds();
        if (!submenuPoints) {
            return false;
        }
        let numMoving = 0;
        const currPoint = this._points[this._points.length - 1];
        // start from the second last point and calculate the slope between each point and the last
        // point.
        for (let i = this._points.length - 2; i >= 0; i--) {
            const previous = this._points[i];
            const slope = getSlope(currPoint, previous);
            if (isWithinSubmenu(submenuPoints, slope, getYIntercept(currPoint, slope))) {
                numMoving++;
            }
        }
        return numMoving >= Math.floor(NUM_POINTS / 2);
    }
    /** Get the bounding DOMRect for the open submenu. */
    _getSubmenuBounds() {
        return this._pointerTracker?.previousElement
            ?.getMenu()
            ?._elementRef.nativeElement.getBoundingClientRect();
    }
    /**
     * Check if a reference to the PointerFocusTracker and menu element is provided.
     * @throws an error if neither reference is provided.
     */
    _checkConfigured() {
        if (typeof ngDevMode === 'undefined' || ngDevMode) {
            if (!this._pointerTracker) {
                throwMissingPointerFocusTracker();
            }
            if (!this._menu) {
                throwMissingMenuReference();
            }
        }
    }
    /** Subscribe to the root menus mouse move events and update the tracked mouse points. */
    _subscribeToMouseMoves() {
        this._ngZone.runOutsideAngular(() => {
            fromEvent(this._menu._elementRef.nativeElement, 'mousemove')
                .pipe(filter((_, index) => index % MOUSE_MOVE_SAMPLE_FREQUENCY === 0), takeUntil(this._destroyed))
                .subscribe((event) => {
                this._points.push({ x: event.clientX, y: event.clientY });
                if (this._points.length > NUM_POINTS) {
                    this._points.shift();
                }
            });
        });
    }
    ngOnDestroy() {
        this._destroyed.next();
        this._destroyed.complete();
    }
}
TargetMenuAim.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.0-next.15", ngImport: i0, type: TargetMenuAim, deps: [{ token: i0.NgZone }], target: i0.ɵɵFactoryTarget.Injectable });
TargetMenuAim.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.0-next.15", ngImport: i0, type: TargetMenuAim });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.0-next.15", ngImport: i0, type: TargetMenuAim, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: i0.NgZone }]; } });
/**
 * CdkTargetMenuAim is a provider for the TargetMenuAim service. It should be added to an
 * element with either the `cdkMenu` or `cdkMenuBar` directive and child menu items.
 */
export class CdkTargetMenuAim {
}
CdkTargetMenuAim.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.0-next.15", ngImport: i0, type: CdkTargetMenuAim, deps: [], target: i0.ɵɵFactoryTarget.Directive });
CdkTargetMenuAim.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "13.0.0-next.15", type: CdkTargetMenuAim, selector: "[cdkTargetMenuAim]", providers: [{ provide: MENU_AIM, useClass: TargetMenuAim }], exportAs: ["cdkTargetMenuAim"], ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.0-next.15", ngImport: i0, type: CdkTargetMenuAim, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkTargetMenuAim]',
                    exportAs: 'cdkTargetMenuAim',
                    providers: [{ provide: MENU_AIM, useClass: TargetMenuAim }],
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1haW0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrLWV4cGVyaW1lbnRhbC9tZW51L21lbnUtYWltLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxVQUFVLEVBQUUsTUFBTSxFQUFhLGNBQWMsRUFBRSxTQUFTLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDdkYsT0FBTyxFQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDeEMsT0FBTyxFQUFDLFNBQVMsRUFBRSxNQUFNLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUdqRCxPQUFPLEVBQUMsK0JBQStCLEVBQUUseUJBQXlCLEVBQUMsTUFBTSxlQUFlLENBQUM7O0FBbUJ6Riw2REFBNkQ7QUFDN0QsTUFBTSxDQUFDLE1BQU0sUUFBUSxHQUFHLElBQUksY0FBYyxDQUFVLGNBQWMsQ0FBQyxDQUFDO0FBRXBFLDBDQUEwQztBQUMxQyxNQUFNLDJCQUEyQixHQUFHLENBQUMsQ0FBQztBQUV0QyxnREFBZ0Q7QUFDaEQsTUFBTSxVQUFVLEdBQUcsQ0FBQyxDQUFDO0FBRXJCOzs7R0FHRztBQUNILE1BQU0sV0FBVyxHQUFHLEdBQUcsQ0FBQztBQVV4QixpREFBaUQ7QUFDakQsU0FBUyxRQUFRLENBQUMsQ0FBUSxFQUFFLENBQVE7SUFDbEMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbkMsQ0FBQztBQUVELCtEQUErRDtBQUMvRCxTQUFTLGFBQWEsQ0FBQyxLQUFZLEVBQUUsS0FBYTtJQUNoRCxPQUFPLEtBQUssQ0FBQyxDQUFDLEdBQUcsS0FBSyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUM7QUFDbkMsQ0FBQztBQUtEOzs7Ozs7OztH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Z0JBQWdCLDZDQUZoQixDQUFDLEVBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsYUFBYSxFQUFDLENBQUM7bUdBRTlDLGdCQUFnQjtrQkFMNUIsU0FBUzttQkFBQztvQkFDVCxRQUFRLEVBQUUsb0JBQW9CO29CQUM5QixRQUFRLEVBQUUsa0JBQWtCO29CQUM1QixTQUFTLEVBQUUsQ0FBQyxFQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLGFBQWEsRUFBQyxDQUFDO2lCQUMxRCIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0luamVjdGFibGUsIE5nWm9uZSwgT25EZXN0cm95LCBJbmplY3Rpb25Ub2tlbiwgRGlyZWN0aXZlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7ZnJvbUV2ZW50LCBTdWJqZWN0fSBmcm9tICdyeGpzJztcbmltcG9ydCB7dGFrZVVudGlsLCBmaWx0ZXJ9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7UG9pbnRlckZvY3VzVHJhY2tlciwgRm9jdXNhYmxlRWxlbWVudH0gZnJvbSAnLi9wb2ludGVyLWZvY3VzLXRyYWNrZXInO1xuaW1wb3J0IHtNZW51fSBmcm9tICcuL21lbnUtaW50ZXJmYWNlJztcbmltcG9ydCB7dGhyb3dNaXNzaW5nUG9pbnRlckZvY3VzVHJhY2tlciwgdGhyb3dNaXNzaW5nTWVudVJlZmVyZW5jZX0gZnJvbSAnLi9tZW51LWVycm9ycyc7XG5cbi8qKlxuICogTWVudUFpbSBpcyByZXNwb25zaWJsZSBmb3IgZGV0ZXJtaW5pbmcgaWYgYSBzaWJsaW5nIG1lbnVpdGVtJ3MgbWVudSBzaG91bGQgYmUgY2xvc2VkIHdoZW4gYVxuICogVG9nZ2xlciBpdGVtIGlzIGhvdmVyZWQgaW50by4gSXQgaXMgdXAgdG8gdGhlIGhvdmVyZWQgaW4gaXRlbSB0byBjYWxsIHRoZSBNZW51QWltIHNlcnZpY2UgaW5cbiAqIG9yZGVyIHRvIGRldGVybWluZSBpZiBpdCBtYXkgcGVyZm9ybSBpdHMgY2xvc2UgYWN0aW9ucy5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBNZW51QWltIHtcbiAgLyoqIFNldCB0aGUgTWVudSBhbmQgaXRzIFBvaW50ZXJGb2N1c1RyYWNrZXIuICovXG4gIGluaXRpYWxpemUobWVudTogTWVudSwgcG9pbnRlclRyYWNrZXI6IFBvaW50ZXJGb2N1c1RyYWNrZXI8Rm9jdXNhYmxlRWxlbWVudCAmIFRvZ2dsZXI+KTogdm9pZDtcblxuICAvKipcbiAgICogQ2FsbHMgdGhlIGBkb1RvZ2dsZWAgY2FsbGJhY2sgd2hlbiBpdCBpcyBkZWVtZWQgdGhhdCB0aGUgdXNlciBpcyBub3QgbW92aW5nIHRvd2FyZHNcbiAgICogdGhlIHN1Ym1lbnUuXG4gICAqIEBwYXJhbSBkb1RvZ2dsZSB0aGUgZnVuY3Rpb24gY2FsbGVkIHdoZW4gdGhlIHVzZXIgaXMgbm90IG1vdmluZyB0b3dhcmRzIHRoZSBzdWJtZW51LlxuICAgKi9cbiAgdG9nZ2xlKGRvVG9nZ2xlOiAoKSA9PiB2b2lkKTogdm9pZDtcbn1cblxuLyoqIEluamVjdGlvbiB0b2tlbiB1c2VkIGZvciBhbiBpbXBsZW1lbnRhdGlvbiBvZiBNZW51QWltLiAqL1xuZXhwb3J0IGNvbnN0IE1FTlVfQUlNID0gbmV3IEluamVjdGlvblRva2VuPE1lbnVBaW0+KCdjZGstbWVudS1haW0nKTtcblxuLyoqIENhcHR1cmUgZXZlcnkgbnRoIG1vdXNlIG1vdmUgZXZlbnQuICovXG5jb25zdCBNT1VTRV9NT1ZFX1NBTVBMRV9GUkVRVUVOQ1kgPSAzO1xuXG4vKiogVGhlIG51bWJlciBvZiBtb3VzZSBtb3ZlIGV2ZW50cyB0byB0cmFjay4gKi9cbmNvbnN0IE5VTV9QT0lOVFMgPSA1O1xuXG4vKipcbiAqIEhvdyBsb25nIHRvIHdhaXQgYmVmb3JlIGNsb3NpbmcgYSBzaWJsaW5nIG1lbnUgaWYgYSB1c2VyIHN0b3BzIHNob3J0IG9mIHRoZSBzdWJtZW51IHRoZXkgd2VyZVxuICogcHJlZGljdGVkIHRvIGdvIGludG8uXG4gKi9cbmNvbnN0IENMT1NFX0RFTEFZID0gMzAwO1xuXG4vKipcbiAqIEFuIGVsZW1lbnQgd2hpY2ggd2hlbiBob3ZlcmVkIG92ZXIgbWF5IHBlcmZvcm0gY2xvc2luZyBhY3Rpb25zIG9uIHRoZSBvcGVuIHN1Ym1lbnUgYW5kXG4gKiBwb3RlbnRpYWxseSBvcGVuIGl0cyBvd24gbWVudS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBUb2dnbGVyIHtcbiAgZ2V0TWVudSgpOiBNZW51IHwgdW5kZWZpbmVkO1xufVxuXG4vKiogQ2FsY3VsYXRlIHRoZSBzbG9wZSBiZXR3ZWVuIHBvaW50IGEgYW5kIGIuICovXG5mdW5jdGlvbiBnZXRTbG9wZShhOiBQb2ludCwgYjogUG9pbnQpIHtcbiAgcmV0dXJuIChiLnkgLSBhLnkpIC8gKGIueCAtIGEueCk7XG59XG5cbi8qKiBDYWxjdWxhdGUgdGhlIHkgaW50ZXJjZXB0IGZvciB0aGUgZ2l2ZW4gcG9pbnQgYW5kIHNsb3BlLiAqL1xuZnVuY3Rpb24gZ2V0WUludGVyY2VwdChwb2ludDogUG9pbnQsIHNsb3BlOiBudW1iZXIpIHtcbiAgcmV0dXJuIHBvaW50LnkgLSBzbG9wZSAqIHBvaW50Lng7XG59XG5cbi8qKiBSZXByZXNlbnRzIGEgY29vcmRpbmF0ZSBvZiBtb3VzZSB0cmF2ZWwuICovXG50eXBlIFBvaW50ID0ge3g6IG51bWJlcjsgeTogbnVtYmVyfTtcblxuLyoqXG4gKiBXaGV0aGVyIHRoZSBnaXZlbiBtb3VzZSB0cmFqZWN0b3J5IGxpbmUgZGVmaW5lZCBieSB0aGUgc2xvcGUgYW5kIHkgaW50ZXJjZXB0IGZhbGxzIHdpdGhpbiB0aGVcbiAqIHN1Ym1lbnUgYXMgZGVmaW5lZCBieSBgc3VibWVudVBvaW50c2BcbiAqIEBwYXJhbSBzdWJtZW51UG9pbnRzIHRoZSBzdWJtZW51IERPTVJlY3QgcG9pbnRzLlxuICogQHBhcmFtIG0gdGhlIHNsb3BlIG9mIHRoZSB0cmFqZWN0b3J5IGxpbmUuXG4gKiBAcGFyYW0gYiB0aGUgeSBpbnRlcmNlcHQgb2YgdGhlIHRyYWplY3RvcnkgbGluZS5cbiAqXG4gKiBAcmV0dXJuIHRydWUgaWYgYW55IHBvaW50IG9uIHRoZSBsaW5lIGZhbGxzIHdpdGhpbiB0aGUgc3VibWVudS5cbiAqL1xuZnVuY3Rpb24gaXNXaXRoaW5TdWJtZW51KHN1Ym1lbnVQb2ludHM6IERPTVJlY3QsIG06IG51bWJlciwgYjogbnVtYmVyKSB7XG4gIGNvbnN0IHtsZWZ0LCByaWdodCwgdG9wLCBib3R0b219ID0gc3VibWVudVBvaW50cztcblxuICAvLyBDaGVjayBmb3IgaW50ZXJzZWN0aW9uIHdpdGggZWFjaCBlZGdlIG9mIHRoZSBzdWJtZW51IChsZWZ0LCByaWdodCwgdG9wLCBib3R0b20pXG4gIC8vIGJ5IGZpeGluZyBvbmUgY29vcmRpbmF0ZSB0byB0aGF0IGVkZ2UncyBjb29yZGluYXRlIChlaXRoZXIgeCBvciB5KSBhbmQgY2hlY2tpbmcgaWYgdGhlXG4gIC8vIG90aGVyIGNvb3JkaW5hdGUgaXMgd2l0aGluIGJvdW5kcy5cbiAgcmV0dXJuIChcbiAgICAobSAqIGxlZnQgKyBiID49IHRvcCAmJiBtICogbGVmdCArIGIgPD0gYm90dG9tKSB8fFxuICAgIChtICogcmlnaHQgKyBiID49IHRvcCAmJiBtICogcmlnaHQgKyBiIDw9IGJvdHRvbSkgfHxcbiAgICAoKHRvcCAtIGIpIC8gbSA+PSBsZWZ0ICYmICh0b3AgLSBiKSAvIG0gPD0gcmlnaHQpIHx8XG4gICAgKChib3R0b20gLSBiKSAvIG0gPj0gbGVmdCAmJiAoYm90dG9tIC0gYikgLyBtIDw9IHJpZ2h0KVxuICApO1xufVxuLyoqXG4gKiBUYXJnZXRNZW51QWltIHByZWRpY3RzIGlmIGEgdXNlciBpcyBtb3ZpbmcgaW50byBhIHN1Ym1lbnUuIEl0IGNhbGN1bGF0ZXMgdGhlXG4gKiB0cmFqZWN0b3J5IG9mIHRoZSB1c2VyJ3MgbW91c2UgbW92ZW1lbnQgaW4gdGhlIGN1cnJlbnQgbWVudSB0byBkZXRlcm1pbmUgaWYgdGhlXG4gKiBtb3VzZSBpcyBtb3ZpbmcgdG93YXJkcyBhbiBvcGVuIHN1Ym1lbnUuXG4gKlxuICogVGhlIGRldGVybWluYXRpb24gaXMgbWFkZSBieSBjYWxjdWxhdGluZyB0aGUgc2xvcGUgb2YgdGhlIHVzZXJzIGxhc3QgTlVNX1BPSU5UUyBtb3ZlcyB3aGVyZSBlYWNoXG4gKiBwYWlyIG9mIHBvaW50cyBkZXRlcm1pbmVzIGlmIHRoZSB0cmFqZWN0b3J5IGxpbmUgcG9pbnRzIGludG8gdGhlIHN1Ym1lbnUuIEl0IHVzZXMgY29uc2Vuc3VzXG4gKiBhcHByb2FjaCBieSBjaGVja2luZyBpZiBhdCBsZWFzdCBOVU1fUE9JTlRTIC8gMiBwYWlycyBkZXRlcm1pbmUgdGhhdCB0aGUgdXNlciBpcyBtb3ZpbmcgdG93YXJkc1xuICogdG8gc3VibWVudS5cbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFRhcmdldE1lbnVBaW0gaW1wbGVtZW50cyBNZW51QWltLCBPbkRlc3Ryb3kge1xuICAvKiogVGhlIGxhc3QgTlVNX1BPSU5UUyBtb3VzZSBtb3ZlIGV2ZW50cy4gKi9cbiAgcHJpdmF0ZSByZWFkb25seSBfcG9pbnRzOiBQb2ludFtdID0gW107XG5cbiAgLyoqIFJlZmVyZW5jZSB0byB0aGUgcm9vdCBtZW51IGluIHdoaWNoIHdlIGFyZSB0cmFja2luZyBtb3VzZSBtb3Zlcy4gKi9cbiAgcHJpdmF0ZSBfbWVudTogTWVudTtcblxuICAvKiogUmVmZXJlbmNlIHRvIHRoZSByb290IG1lbnUncyBtb3VzZSBtYW5hZ2VyLiAqL1xuICBwcml2YXRlIF9wb2ludGVyVHJhY2tlcjogUG9pbnRlckZvY3VzVHJhY2tlcjxUb2dnbGVyICYgRm9jdXNhYmxlRWxlbWVudD47XG5cbiAgLyoqIFRoZSBpZCBhc3NvY2lhdGVkIHdpdGggdGhlIGN1cnJlbnQgdGltZW91dCBjYWxsIHdhaXRpbmcgdG8gcmVzb2x2ZS4gKi9cbiAgcHJpdmF0ZSBfdGltZW91dElkOiBudW1iZXIgfCBudWxsO1xuXG4gIC8qKiBFbWl0cyB3aGVuIHRoaXMgc2VydmljZSBpcyBkZXN0cm95ZWQuICovXG4gIHByaXZhdGUgcmVhZG9ubHkgX2Rlc3Ryb3llZDogU3ViamVjdDx2b2lkPiA9IG5ldyBTdWJqZWN0KCk7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSByZWFkb25seSBfbmdab25lOiBOZ1pvbmUpIHt9XG5cbiAgLyoqIFNldCB0aGUgTWVudSBhbmQgaXRzIFBvaW50ZXJGb2N1c1RyYWNrZXIuICovXG4gIGluaXRpYWxpemUobWVudTogTWVudSwgcG9pbnRlclRyYWNrZXI6IFBvaW50ZXJGb2N1c1RyYWNrZXI8Rm9jdXNhYmxlRWxlbWVudCAmIFRvZ2dsZXI+KSB7XG4gICAgdGhpcy5fbWVudSA9IG1lbnU7XG4gICAgdGhpcy5fcG9pbnRlclRyYWNrZXIgPSBwb2ludGVyVHJhY2tlcjtcbiAgICB0aGlzLl9zdWJzY3JpYmVUb01vdXNlTW92ZXMoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxscyB0aGUgYGRvVG9nZ2xlYCBjYWxsYmFjayB3aGVuIGl0IGlzIGRlZW1lZCB0aGF0IHRoZSB1c2VyIGlzIG5vdCBtb3ZpbmcgdG93YXJkc1xuICAgKiB0aGUgc3VibWVudS5cbiAgICogQHBhcmFtIGRvVG9nZ2xlIHRoZSBmdW5jdGlvbiBjYWxsZWQgd2hlbiB0aGUgdXNlciBpcyBub3QgbW92aW5nIHRvd2FyZHMgdGhlIHN1Ym1lbnUuXG4gICAqL1xuICB0b2dnbGUoZG9Ub2dnbGU6ICgpID0+IHZvaWQpIHtcbiAgICAvLyBJZiB0aGUgbWVudSBpcyBob3Jpem9udGFsIHRoZSBzdWItbWVudXMgb3BlbiBiZWxvdyBhbmQgdGhlcmUgaXMgbm8gcmlzayBvZiBwcmVtYXR1cmVcbiAgICAvLyBjbG9zaW5nIG9mIGFueSBzdWItbWVudXMgdGhlcmVmb3JlIHdlIGF1dG9tYXRpY2FsbHkgcmVzb2x2ZSB0aGUgY2FsbGJhY2suXG4gICAgaWYgKHRoaXMuX21lbnUub3JpZW50YXRpb24gPT09ICdob3Jpem9udGFsJykge1xuICAgICAgZG9Ub2dnbGUoKTtcbiAgICB9XG5cbiAgICB0aGlzLl9jaGVja0NvbmZpZ3VyZWQoKTtcblxuICAgIGNvbnN0IHNpYmxpbmdJdGVtSXNXYWl0aW5nID0gISF0aGlzLl90aW1lb3V0SWQ7XG4gICAgY29uc3QgaGFzUG9pbnRzID0gdGhpcy5fcG9pbnRzLmxlbmd0aCA+IDE7XG5cbiAgICBpZiAoaGFzUG9pbnRzICYmICFzaWJsaW5nSXRlbUlzV2FpdGluZykge1xuICAgICAgaWYgKHRoaXMuX2lzTW92aW5nVG9TdWJtZW51KCkpIHtcbiAgICAgICAgdGhpcy5fc3RhcnRUaW1lb3V0KGRvVG9nZ2xlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRvVG9nZ2xlKCk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICghc2libGluZ0l0ZW1Jc1dhaXRpbmcpIHtcbiAgICAgIGRvVG9nZ2xlKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFN0YXJ0IHRoZSBkZWxheWVkIHRvZ2dsZSBoYW5kbGVyIGlmIG9uZSBpc24ndCBydW5uaW5nIGFscmVhZHkuXG4gICAqXG4gICAqIFRoZSBkZWxheWVkIHRvZ2dsZSBoYW5kbGVyIGV4ZWN1dGVzIHRoZSBgZG9Ub2dnbGVgIGNhbGxiYWNrIGFmdGVyIHNvbWUgcGVyaW9kIG9mIHRpbWUgaWZmIHRoZVxuICAgKiB1c2VycyBtb3VzZSBpcyBvbiBhbiBpdGVtIGluIHRoZSBjdXJyZW50IG1lbnUuXG4gICAqL1xuICBwcml2YXRlIF9zdGFydFRpbWVvdXQoZG9Ub2dnbGU6ICgpID0+IHZvaWQpIHtcbiAgICAvLyBJZiB0aGUgdXNlcnMgbW91c2UgaXMgbW92aW5nIHRvd2FyZHMgYSBzdWJtZW51IHdlIGRvbid0IHdhbnQgdG8gaW1tZWRpYXRlbHkgcmVzb2x2ZS5cbiAgICAvLyBXYWl0IGZvciBzb21lIHBlcmlvZCBvZiB0aW1lIGJlZm9yZSBkZXRlcm1pbmluZyBpZiB0aGUgcHJldmlvdXMgbWVudSBzaG91bGQgY2xvc2UgaW5cbiAgICAvLyBjYXNlcyB3aGVyZSB0aGUgdXNlciBtYXkgaGF2ZSBtb3ZlZCB0b3dhcmRzIHRoZSBzdWJtZW51IGJ1dCBzdG9wcGVkIG9uIGEgc2libGluZyBtZW51XG4gICAgLy8gaXRlbSBpbnRlbnRpb25hbGx5LlxuICAgIGNvbnN0IHRpbWVvdXRJZCA9IChzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIC8vIFJlc29sdmUgaWYgdGhlIHVzZXIgaXMgY3VycmVudGx5IG1vdXNlZCBvdmVyIHNvbWUgZWxlbWVudCBpbiB0aGUgcm9vdCBtZW51XG4gICAgICBpZiAodGhpcy5fcG9pbnRlclRyYWNrZXIhLmFjdGl2ZUVsZW1lbnQgJiYgdGltZW91dElkID09PSB0aGlzLl90aW1lb3V0SWQpIHtcbiAgICAgICAgZG9Ub2dnbGUoKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX3RpbWVvdXRJZCA9IG51bGw7XG4gICAgfSwgQ0xPU0VfREVMQVkpIGFzIGFueSkgYXMgbnVtYmVyO1xuXG4gICAgdGhpcy5fdGltZW91dElkID0gdGltZW91dElkO1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhlIHVzZXIgaXMgaGVhZGluZyB0b3dhcmRzIHRoZSBvcGVuIHN1Ym1lbnUuICovXG4gIHByaXZhdGUgX2lzTW92aW5nVG9TdWJtZW51KCkge1xuICAgIGNvbnN0IHN1Ym1lbnVQb2ludHMgPSB0aGlzLl9nZXRTdWJtZW51Qm91bmRzKCk7XG4gICAgaWYgKCFzdWJtZW51UG9pbnRzKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgbGV0IG51bU1vdmluZyA9IDA7XG4gICAgY29uc3QgY3VyclBvaW50ID0gdGhpcy5fcG9pbnRzW3RoaXMuX3BvaW50cy5sZW5ndGggLSAxXTtcbiAgICAvLyBzdGFydCBmcm9tIHRoZSBzZWNvbmQgbGFzdCBwb2ludCBhbmQgY2FsY3VsYXRlIHRoZSBzbG9wZSBiZXR3ZWVuIGVhY2ggcG9pbnQgYW5kIHRoZSBsYXN0XG4gICAgLy8gcG9pbnQuXG4gICAgZm9yIChsZXQgaSA9IHRoaXMuX3BvaW50cy5sZW5ndGggLSAyOyBpID49IDA7IGktLSkge1xuICAgICAgY29uc3QgcHJldmlvdXMgPSB0aGlzLl9wb2ludHNbaV07XG4gICAgICBjb25zdCBzbG9wZSA9IGdldFNsb3BlKGN1cnJQb2ludCwgcHJldmlvdXMpO1xuICAgICAgaWYgKGlzV2l0aGluU3VibWVudShzdWJtZW51UG9pbnRzLCBzbG9wZSwgZ2V0WUludGVyY2VwdChjdXJyUG9pbnQsIHNsb3BlKSkpIHtcbiAgICAgICAgbnVtTW92aW5nKys7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudW1Nb3ZpbmcgPj0gTWF0aC5mbG9vcihOVU1fUE9JTlRTIC8gMik7XG4gIH1cblxuICAvKiogR2V0IHRoZSBib3VuZGluZyBET01SZWN0IGZvciB0aGUgb3BlbiBzdWJtZW51LiAqL1xuICBwcml2YXRlIF9nZXRTdWJtZW51Qm91bmRzKCk6IERPTVJlY3QgfCB1bmRlZmluZWQge1xuICAgIHJldHVybiB0aGlzLl9wb2ludGVyVHJhY2tlcj8ucHJldmlvdXNFbGVtZW50XG4gICAgICA/LmdldE1lbnUoKVxuICAgICAgPy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIGEgcmVmZXJlbmNlIHRvIHRoZSBQb2ludGVyRm9jdXNUcmFja2VyIGFuZCBtZW51IGVsZW1lbnQgaXMgcHJvdmlkZWQuXG4gICAqIEB0aHJvd3MgYW4gZXJyb3IgaWYgbmVpdGhlciByZWZlcmVuY2UgaXMgcHJvdmlkZWQuXG4gICAqL1xuICBwcml2YXRlIF9jaGVja0NvbmZpZ3VyZWQoKSB7XG4gICAgaWYgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkge1xuICAgICAgaWYgKCF0aGlzLl9wb2ludGVyVHJhY2tlcikge1xuICAgICAgICB0aHJvd01pc3NpbmdQb2ludGVyRm9jdXNUcmFja2VyKCk7XG4gICAgICB9XG4gICAgICBpZiAoIXRoaXMuX21lbnUpIHtcbiAgICAgICAgdGhyb3dNaXNzaW5nTWVudVJlZmVyZW5jZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKiBTdWJzY3JpYmUgdG8gdGhlIHJvb3QgbWVudXMgbW91c2UgbW92ZSBldmVudHMgYW5kIHVwZGF0ZSB0aGUgdHJhY2tlZCBtb3VzZSBwb2ludHMuICovXG4gIHByaXZhdGUgX3N1YnNjcmliZVRvTW91c2VNb3ZlcygpIHtcbiAgICB0aGlzLl9uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgZnJvbUV2ZW50PE1vdXNlRXZlbnQ+KHRoaXMuX21lbnUuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudCwgJ21vdXNlbW92ZScpXG4gICAgICAgIC5waXBlKFxuICAgICAgICAgIGZpbHRlcigoXzogTW91c2VFdmVudCwgaW5kZXg6IG51bWJlcikgPT4gaW5kZXggJSBNT1VTRV9NT1ZFX1NBTVBMRV9GUkVRVUVOQ1kgPT09IDApLFxuICAgICAgICAgIHRha2VVbnRpbCh0aGlzLl9kZXN0cm95ZWQpXG4gICAgICAgIClcbiAgICAgICAgLnN1YnNjcmliZSgoZXZlbnQ6IE1vdXNlRXZlbnQpID0+IHtcbiAgICAgICAgICB0aGlzLl9wb2ludHMucHVzaCh7eDogZXZlbnQuY2xpZW50WCwgeTogZXZlbnQuY2xpZW50WX0pO1xuICAgICAgICAgIGlmICh0aGlzLl9wb2ludHMubGVuZ3RoID4gTlVNX1BPSU5UUykge1xuICAgICAgICAgICAgdGhpcy5fcG9pbnRzLnNoaWZ0KCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIHRoaXMuX2Rlc3Ryb3llZC5uZXh0KCk7XG4gICAgdGhpcy5fZGVzdHJveWVkLmNvbXBsZXRlKCk7XG4gIH1cbn1cblxuLyoqXG4gKiBDZGtUYXJnZXRNZW51QWltIGlzIGEgcHJvdmlkZXIgZm9yIHRoZSBUYXJnZXRNZW51QWltIHNlcnZpY2UuIEl0IHNob3VsZCBiZSBhZGRlZCB0byBhblxuICogZWxlbWVudCB3aXRoIGVpdGhlciB0aGUgYGNka01lbnVgIG9yIGBjZGtNZW51QmFyYCBkaXJlY3RpdmUgYW5kIGNoaWxkIG1lbnUgaXRlbXMuXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tjZGtUYXJnZXRNZW51QWltXScsXG4gIGV4cG9ydEFzOiAnY2RrVGFyZ2V0TWVudUFpbScsXG4gIHByb3ZpZGVyczogW3twcm92aWRlOiBNRU5VX0FJTSwgdXNlQ2xhc3M6IFRhcmdldE1lbnVBaW19XSxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrVGFyZ2V0TWVudUFpbSB7fVxuIl19