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
    constructor(
    /** The Angular zone. */
    _ngZone) {
        this._ngZone = _ngZone;
        /** The last NUM_POINTS mouse move events. */
        this._points = [];
        /** Emits when this service is destroyed. */
        this._destroyed = new Subject();
    }
    ngOnDestroy() {
        this._destroyed.next();
        this._destroyed.complete();
    }
    /**
     * Set the Menu and its PointerFocusTracker.
     * @param menu The menu that this menu aim service controls.
     * @param pointerTracker The `PointerFocusTracker` for the given menu.
     */
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
     *
     * @param doToggle the function called when the user is not moving towards the submenu.
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
        return this._pointerTracker?.previousElement?.getMenu()?.nativeElement.getBoundingClientRect();
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
            fromEvent(this._menu.nativeElement, 'mousemove')
                .pipe(filter((_, index) => index % MOUSE_MOVE_SAMPLE_FREQUENCY === 0), takeUntil(this._destroyed))
                .subscribe((event) => {
                this._points.push({ x: event.clientX, y: event.clientY });
                if (this._points.length > NUM_POINTS) {
                    this._points.shift();
                }
            });
        });
    }
}
TargetMenuAim.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.0.0-next.13", ngImport: i0, type: TargetMenuAim, deps: [{ token: i0.NgZone }], target: i0.ɵɵFactoryTarget.Injectable });
TargetMenuAim.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "14.0.0-next.13", ngImport: i0, type: TargetMenuAim });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.0.0-next.13", ngImport: i0, type: TargetMenuAim, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: i0.NgZone }]; } });
/**
 * CdkTargetMenuAim is a provider for the TargetMenuAim service. It can be added to an
 * element with either the `cdkMenu` or `cdkMenuBar` directive and child menu items.
 */
export class CdkTargetMenuAim {
}
CdkTargetMenuAim.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.0.0-next.13", ngImport: i0, type: CdkTargetMenuAim, deps: [], target: i0.ɵɵFactoryTarget.Directive });
CdkTargetMenuAim.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "14.0.0-next.13", type: CdkTargetMenuAim, selector: "[cdkTargetMenuAim]", providers: [{ provide: MENU_AIM, useClass: TargetMenuAim }], exportAs: ["cdkTargetMenuAim"], ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.0.0-next.13", ngImport: i0, type: CdkTargetMenuAim, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkTargetMenuAim]',
                    exportAs: 'cdkTargetMenuAim',
                    providers: [{ provide: MENU_AIM, useClass: TargetMenuAim }],
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1haW0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrLWV4cGVyaW1lbnRhbC9tZW51L21lbnUtYWltLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxVQUFVLEVBQUUsTUFBTSxFQUFhLGNBQWMsRUFBRSxTQUFTLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDdkYsT0FBTyxFQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDeEMsT0FBTyxFQUFDLFNBQVMsRUFBRSxNQUFNLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUdqRCxPQUFPLEVBQUMsK0JBQStCLEVBQUUseUJBQXlCLEVBQUMsTUFBTSxlQUFlLENBQUM7O0FBdUJ6Riw2REFBNkQ7QUFDN0QsTUFBTSxDQUFDLE1BQU0sUUFBUSxHQUFHLElBQUksY0FBYyxDQUFVLGNBQWMsQ0FBQyxDQUFDO0FBRXBFLDBDQUEwQztBQUMxQyxNQUFNLDJCQUEyQixHQUFHLENBQUMsQ0FBQztBQUV0QyxnREFBZ0Q7QUFDaEQsTUFBTSxVQUFVLEdBQUcsQ0FBQyxDQUFDO0FBRXJCOzs7R0FHRztBQUNILE1BQU0sV0FBVyxHQUFHLEdBQUcsQ0FBQztBQVF4QixpREFBaUQ7QUFDakQsU0FBUyxRQUFRLENBQUMsQ0FBUSxFQUFFLENBQVE7SUFDbEMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbkMsQ0FBQztBQUVELCtEQUErRDtBQUMvRCxTQUFTLGFBQWEsQ0FBQyxLQUFZLEVBQUUsS0FBYTtJQUNoRCxPQUFPLEtBQUssQ0FBQyxDQUFDLEdBQUcsS0FBSyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUM7QUFDbkMsQ0FBQztBQUtEOzs7Ozs7O0dB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LEVBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsYUFBYSxFQUFDLENBQUM7bUdBRTlDLGdCQUFnQjtrQkFMNUIsU0FBUzttQkFBQztvQkFDVCxRQUFRLEVBQUUsb0JBQW9CO29CQUM5QixRQUFRLEVBQUUsa0JBQWtCO29CQUM1QixTQUFTLEVBQUUsQ0FBQyxFQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLGFBQWEsRUFBQyxDQUFDO2lCQUMxRCIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0luamVjdGFibGUsIE5nWm9uZSwgT25EZXN0cm95LCBJbmplY3Rpb25Ub2tlbiwgRGlyZWN0aXZlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7ZnJvbUV2ZW50LCBTdWJqZWN0fSBmcm9tICdyeGpzJztcbmltcG9ydCB7dGFrZVVudGlsLCBmaWx0ZXJ9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7UG9pbnRlckZvY3VzVHJhY2tlciwgRm9jdXNhYmxlRWxlbWVudH0gZnJvbSAnLi9wb2ludGVyLWZvY3VzLXRyYWNrZXInO1xuaW1wb3J0IHtNZW51fSBmcm9tICcuL21lbnUtaW50ZXJmYWNlJztcbmltcG9ydCB7dGhyb3dNaXNzaW5nUG9pbnRlckZvY3VzVHJhY2tlciwgdGhyb3dNaXNzaW5nTWVudVJlZmVyZW5jZX0gZnJvbSAnLi9tZW51LWVycm9ycyc7XG5cbi8qKlxuICogTWVudUFpbSBpcyByZXNwb25zaWJsZSBmb3IgZGV0ZXJtaW5pbmcgaWYgYSBzaWJsaW5nIG1lbnVpdGVtJ3MgbWVudSBzaG91bGQgYmUgY2xvc2VkIHdoZW4gYVxuICogVG9nZ2xlciBpdGVtIGlzIGhvdmVyZWQgaW50by4gSXQgaXMgdXAgdG8gdGhlIGhvdmVyZWQgaW4gaXRlbSB0byBjYWxsIHRoZSBNZW51QWltIHNlcnZpY2UgaW5cbiAqIG9yZGVyIHRvIGRldGVybWluZSBpZiBpdCBtYXkgcGVyZm9ybSBpdHMgY2xvc2UgYWN0aW9ucy5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBNZW51QWltIHtcbiAgLyoqXG4gICAqIFNldCB0aGUgTWVudSBhbmQgaXRzIFBvaW50ZXJGb2N1c1RyYWNrZXIuXG4gICAqIEBwYXJhbSBtZW51IFRoZSBtZW51IHRoYXQgdGhpcyBtZW51IGFpbSBzZXJ2aWNlIGNvbnRyb2xzLlxuICAgKiBAcGFyYW0gcG9pbnRlclRyYWNrZXIgVGhlIGBQb2ludGVyRm9jdXNUcmFja2VyYCBmb3IgdGhlIGdpdmVuIG1lbnUuXG4gICAqL1xuICBpbml0aWFsaXplKG1lbnU6IE1lbnUsIHBvaW50ZXJUcmFja2VyOiBQb2ludGVyRm9jdXNUcmFja2VyPEZvY3VzYWJsZUVsZW1lbnQgJiBUb2dnbGVyPik6IHZvaWQ7XG5cbiAgLyoqXG4gICAqIENhbGxzIHRoZSBgZG9Ub2dnbGVgIGNhbGxiYWNrIHdoZW4gaXQgaXMgZGVlbWVkIHRoYXQgdGhlIHVzZXIgaXMgbm90IG1vdmluZyB0b3dhcmRzXG4gICAqIHRoZSBzdWJtZW51LlxuICAgKiBAcGFyYW0gZG9Ub2dnbGUgdGhlIGZ1bmN0aW9uIGNhbGxlZCB3aGVuIHRoZSB1c2VyIGlzIG5vdCBtb3ZpbmcgdG93YXJkcyB0aGUgc3VibWVudS5cbiAgICovXG4gIHRvZ2dsZShkb1RvZ2dsZTogKCkgPT4gdm9pZCk6IHZvaWQ7XG59XG5cbi8qKiBJbmplY3Rpb24gdG9rZW4gdXNlZCBmb3IgYW4gaW1wbGVtZW50YXRpb24gb2YgTWVudUFpbS4gKi9cbmV4cG9ydCBjb25zdCBNRU5VX0FJTSA9IG5ldyBJbmplY3Rpb25Ub2tlbjxNZW51QWltPignY2RrLW1lbnUtYWltJyk7XG5cbi8qKiBDYXB0dXJlIGV2ZXJ5IG50aCBtb3VzZSBtb3ZlIGV2ZW50LiAqL1xuY29uc3QgTU9VU0VfTU9WRV9TQU1QTEVfRlJFUVVFTkNZID0gMztcblxuLyoqIFRoZSBudW1iZXIgb2YgbW91c2UgbW92ZSBldmVudHMgdG8gdHJhY2suICovXG5jb25zdCBOVU1fUE9JTlRTID0gNTtcblxuLyoqXG4gKiBIb3cgbG9uZyB0byB3YWl0IGJlZm9yZSBjbG9zaW5nIGEgc2libGluZyBtZW51IGlmIGEgdXNlciBzdG9wcyBzaG9ydCBvZiB0aGUgc3VibWVudSB0aGV5IHdlcmVcbiAqIHByZWRpY3RlZCB0byBnbyBpbnRvLlxuICovXG5jb25zdCBDTE9TRV9ERUxBWSA9IDMwMDtcblxuLyoqIEFuIGVsZW1lbnQgd2hpY2ggd2hlbiBob3ZlcmVkIG92ZXIgbWF5IG9wZW4gb3IgY2xvc2UgYSBtZW51LiAqL1xuZXhwb3J0IGludGVyZmFjZSBUb2dnbGVyIHtcbiAgLyoqIEdldHMgdGhlIG9wZW4gbWVudSwgb3IgdW5kZWZpbmVkIGlmIG5vIG1lbnUgaXMgb3Blbi4gKi9cbiAgZ2V0TWVudSgpOiBNZW51IHwgdW5kZWZpbmVkO1xufVxuXG4vKiogQ2FsY3VsYXRlIHRoZSBzbG9wZSBiZXR3ZWVuIHBvaW50IGEgYW5kIGIuICovXG5mdW5jdGlvbiBnZXRTbG9wZShhOiBQb2ludCwgYjogUG9pbnQpIHtcbiAgcmV0dXJuIChiLnkgLSBhLnkpIC8gKGIueCAtIGEueCk7XG59XG5cbi8qKiBDYWxjdWxhdGUgdGhlIHkgaW50ZXJjZXB0IGZvciB0aGUgZ2l2ZW4gcG9pbnQgYW5kIHNsb3BlLiAqL1xuZnVuY3Rpb24gZ2V0WUludGVyY2VwdChwb2ludDogUG9pbnQsIHNsb3BlOiBudW1iZXIpIHtcbiAgcmV0dXJuIHBvaW50LnkgLSBzbG9wZSAqIHBvaW50Lng7XG59XG5cbi8qKiBSZXByZXNlbnRzIGEgY29vcmRpbmF0ZSBvZiBtb3VzZSB0cmF2ZWwuICovXG50eXBlIFBvaW50ID0ge3g6IG51bWJlcjsgeTogbnVtYmVyfTtcblxuLyoqXG4gKiBXaGV0aGVyIHRoZSBnaXZlbiBtb3VzZSB0cmFqZWN0b3J5IGxpbmUgZGVmaW5lZCBieSB0aGUgc2xvcGUgYW5kIHkgaW50ZXJjZXB0IGZhbGxzIHdpdGhpbiB0aGVcbiAqIHN1Ym1lbnUgYXMgZGVmaW5lZCBieSBgc3VibWVudVBvaW50c2BcbiAqIEBwYXJhbSBzdWJtZW51UG9pbnRzIHRoZSBzdWJtZW51IERPTVJlY3QgcG9pbnRzLlxuICogQHBhcmFtIG0gdGhlIHNsb3BlIG9mIHRoZSB0cmFqZWN0b3J5IGxpbmUuXG4gKiBAcGFyYW0gYiB0aGUgeSBpbnRlcmNlcHQgb2YgdGhlIHRyYWplY3RvcnkgbGluZS5cbiAqIEByZXR1cm4gdHJ1ZSBpZiBhbnkgcG9pbnQgb24gdGhlIGxpbmUgZmFsbHMgd2l0aGluIHRoZSBzdWJtZW51LlxuICovXG5mdW5jdGlvbiBpc1dpdGhpblN1Ym1lbnUoc3VibWVudVBvaW50czogRE9NUmVjdCwgbTogbnVtYmVyLCBiOiBudW1iZXIpIHtcbiAgY29uc3Qge2xlZnQsIHJpZ2h0LCB0b3AsIGJvdHRvbX0gPSBzdWJtZW51UG9pbnRzO1xuXG4gIC8vIENoZWNrIGZvciBpbnRlcnNlY3Rpb24gd2l0aCBlYWNoIGVkZ2Ugb2YgdGhlIHN1Ym1lbnUgKGxlZnQsIHJpZ2h0LCB0b3AsIGJvdHRvbSlcbiAgLy8gYnkgZml4aW5nIG9uZSBjb29yZGluYXRlIHRvIHRoYXQgZWRnZSdzIGNvb3JkaW5hdGUgKGVpdGhlciB4IG9yIHkpIGFuZCBjaGVja2luZyBpZiB0aGVcbiAgLy8gb3RoZXIgY29vcmRpbmF0ZSBpcyB3aXRoaW4gYm91bmRzLlxuICByZXR1cm4gKFxuICAgIChtICogbGVmdCArIGIgPj0gdG9wICYmIG0gKiBsZWZ0ICsgYiA8PSBib3R0b20pIHx8XG4gICAgKG0gKiByaWdodCArIGIgPj0gdG9wICYmIG0gKiByaWdodCArIGIgPD0gYm90dG9tKSB8fFxuICAgICgodG9wIC0gYikgLyBtID49IGxlZnQgJiYgKHRvcCAtIGIpIC8gbSA8PSByaWdodCkgfHxcbiAgICAoKGJvdHRvbSAtIGIpIC8gbSA+PSBsZWZ0ICYmIChib3R0b20gLSBiKSAvIG0gPD0gcmlnaHQpXG4gICk7XG59XG5cbi8qKlxuICogVGFyZ2V0TWVudUFpbSBwcmVkaWN0cyBpZiBhIHVzZXIgaXMgbW92aW5nIGludG8gYSBzdWJtZW51LiBJdCBjYWxjdWxhdGVzIHRoZVxuICogdHJhamVjdG9yeSBvZiB0aGUgdXNlcidzIG1vdXNlIG1vdmVtZW50IGluIHRoZSBjdXJyZW50IG1lbnUgdG8gZGV0ZXJtaW5lIGlmIHRoZVxuICogbW91c2UgaXMgbW92aW5nIHRvd2FyZHMgYW4gb3BlbiBzdWJtZW51LlxuICpcbiAqIFRoZSBkZXRlcm1pbmF0aW9uIGlzIG1hZGUgYnkgY2FsY3VsYXRpbmcgdGhlIHNsb3BlIG9mIHRoZSB1c2VycyBsYXN0IE5VTV9QT0lOVFMgbW92ZXMgd2hlcmUgZWFjaFxuICogcGFpciBvZiBwb2ludHMgZGV0ZXJtaW5lcyBpZiB0aGUgdHJhamVjdG9yeSBsaW5lIHBvaW50cyBpbnRvIHRoZSBzdWJtZW51LiBJdCB1c2VzIGNvbnNlbnN1c1xuICogYXBwcm9hY2ggYnkgY2hlY2tpbmcgaWYgYXQgbGVhc3QgTlVNX1BPSU5UUyAvIDIgcGFpcnMgZGV0ZXJtaW5lIHRoYXQgdGhlIHVzZXIgaXMgbW92aW5nIHRvd2FyZHNcbiAqIHRvIHN1Ym1lbnUuXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBUYXJnZXRNZW51QWltIGltcGxlbWVudHMgTWVudUFpbSwgT25EZXN0cm95IHtcbiAgLyoqIFRoZSBsYXN0IE5VTV9QT0lOVFMgbW91c2UgbW92ZSBldmVudHMuICovXG4gIHByaXZhdGUgcmVhZG9ubHkgX3BvaW50czogUG9pbnRbXSA9IFtdO1xuXG4gIC8qKiBSZWZlcmVuY2UgdG8gdGhlIHJvb3QgbWVudSBpbiB3aGljaCB3ZSBhcmUgdHJhY2tpbmcgbW91c2UgbW92ZXMuICovXG4gIHByaXZhdGUgX21lbnU6IE1lbnU7XG5cbiAgLyoqIFJlZmVyZW5jZSB0byB0aGUgcm9vdCBtZW51J3MgbW91c2UgbWFuYWdlci4gKi9cbiAgcHJpdmF0ZSBfcG9pbnRlclRyYWNrZXI6IFBvaW50ZXJGb2N1c1RyYWNrZXI8VG9nZ2xlciAmIEZvY3VzYWJsZUVsZW1lbnQ+O1xuXG4gIC8qKiBUaGUgaWQgYXNzb2NpYXRlZCB3aXRoIHRoZSBjdXJyZW50IHRpbWVvdXQgY2FsbCB3YWl0aW5nIHRvIHJlc29sdmUuICovXG4gIHByaXZhdGUgX3RpbWVvdXRJZDogbnVtYmVyIHwgbnVsbDtcblxuICAvKiogRW1pdHMgd2hlbiB0aGlzIHNlcnZpY2UgaXMgZGVzdHJveWVkLiAqL1xuICBwcml2YXRlIHJlYWRvbmx5IF9kZXN0cm95ZWQ6IFN1YmplY3Q8dm9pZD4gPSBuZXcgU3ViamVjdCgpO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIC8qKiBUaGUgQW5ndWxhciB6b25lLiAqL1xuICAgIHByaXZhdGUgcmVhZG9ubHkgX25nWm9uZTogTmdab25lLFxuICApIHt9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgdGhpcy5fZGVzdHJveWVkLm5leHQoKTtcbiAgICB0aGlzLl9kZXN0cm95ZWQuY29tcGxldGUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgdGhlIE1lbnUgYW5kIGl0cyBQb2ludGVyRm9jdXNUcmFja2VyLlxuICAgKiBAcGFyYW0gbWVudSBUaGUgbWVudSB0aGF0IHRoaXMgbWVudSBhaW0gc2VydmljZSBjb250cm9scy5cbiAgICogQHBhcmFtIHBvaW50ZXJUcmFja2VyIFRoZSBgUG9pbnRlckZvY3VzVHJhY2tlcmAgZm9yIHRoZSBnaXZlbiBtZW51LlxuICAgKi9cbiAgaW5pdGlhbGl6ZShtZW51OiBNZW51LCBwb2ludGVyVHJhY2tlcjogUG9pbnRlckZvY3VzVHJhY2tlcjxGb2N1c2FibGVFbGVtZW50ICYgVG9nZ2xlcj4pIHtcbiAgICB0aGlzLl9tZW51ID0gbWVudTtcbiAgICB0aGlzLl9wb2ludGVyVHJhY2tlciA9IHBvaW50ZXJUcmFja2VyO1xuICAgIHRoaXMuX3N1YnNjcmliZVRvTW91c2VNb3ZlcygpO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxzIHRoZSBgZG9Ub2dnbGVgIGNhbGxiYWNrIHdoZW4gaXQgaXMgZGVlbWVkIHRoYXQgdGhlIHVzZXIgaXMgbm90IG1vdmluZyB0b3dhcmRzXG4gICAqIHRoZSBzdWJtZW51LlxuICAgKiBAcGFyYW0gZG9Ub2dnbGUgdGhlIGZ1bmN0aW9uIGNhbGxlZCB3aGVuIHRoZSB1c2VyIGlzIG5vdCBtb3ZpbmcgdG93YXJkcyB0aGUgc3VibWVudS5cbiAgICovXG4gIHRvZ2dsZShkb1RvZ2dsZTogKCkgPT4gdm9pZCkge1xuICAgIC8vIElmIHRoZSBtZW51IGlzIGhvcml6b250YWwgdGhlIHN1Yi1tZW51cyBvcGVuIGJlbG93IGFuZCB0aGVyZSBpcyBubyByaXNrIG9mIHByZW1hdHVyZVxuICAgIC8vIGNsb3Npbmcgb2YgYW55IHN1Yi1tZW51cyB0aGVyZWZvcmUgd2UgYXV0b21hdGljYWxseSByZXNvbHZlIHRoZSBjYWxsYmFjay5cbiAgICBpZiAodGhpcy5fbWVudS5vcmllbnRhdGlvbiA9PT0gJ2hvcml6b250YWwnKSB7XG4gICAgICBkb1RvZ2dsZSgpO1xuICAgIH1cblxuICAgIHRoaXMuX2NoZWNrQ29uZmlndXJlZCgpO1xuXG4gICAgY29uc3Qgc2libGluZ0l0ZW1Jc1dhaXRpbmcgPSAhIXRoaXMuX3RpbWVvdXRJZDtcbiAgICBjb25zdCBoYXNQb2ludHMgPSB0aGlzLl9wb2ludHMubGVuZ3RoID4gMTtcblxuICAgIGlmIChoYXNQb2ludHMgJiYgIXNpYmxpbmdJdGVtSXNXYWl0aW5nKSB7XG4gICAgICBpZiAodGhpcy5faXNNb3ZpbmdUb1N1Ym1lbnUoKSkge1xuICAgICAgICB0aGlzLl9zdGFydFRpbWVvdXQoZG9Ub2dnbGUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZG9Ub2dnbGUoKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKCFzaWJsaW5nSXRlbUlzV2FpdGluZykge1xuICAgICAgZG9Ub2dnbGUoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU3RhcnQgdGhlIGRlbGF5ZWQgdG9nZ2xlIGhhbmRsZXIgaWYgb25lIGlzbid0IHJ1bm5pbmcgYWxyZWFkeS5cbiAgICpcbiAgICogVGhlIGRlbGF5ZWQgdG9nZ2xlIGhhbmRsZXIgZXhlY3V0ZXMgdGhlIGBkb1RvZ2dsZWAgY2FsbGJhY2sgYWZ0ZXIgc29tZSBwZXJpb2Qgb2YgdGltZSBpZmYgdGhlXG4gICAqIHVzZXJzIG1vdXNlIGlzIG9uIGFuIGl0ZW0gaW4gdGhlIGN1cnJlbnQgbWVudS5cbiAgICpcbiAgICogQHBhcmFtIGRvVG9nZ2xlIHRoZSBmdW5jdGlvbiBjYWxsZWQgd2hlbiB0aGUgdXNlciBpcyBub3QgbW92aW5nIHRvd2FyZHMgdGhlIHN1Ym1lbnUuXG4gICAqL1xuICBwcml2YXRlIF9zdGFydFRpbWVvdXQoZG9Ub2dnbGU6ICgpID0+IHZvaWQpIHtcbiAgICAvLyBJZiB0aGUgdXNlcnMgbW91c2UgaXMgbW92aW5nIHRvd2FyZHMgYSBzdWJtZW51IHdlIGRvbid0IHdhbnQgdG8gaW1tZWRpYXRlbHkgcmVzb2x2ZS5cbiAgICAvLyBXYWl0IGZvciBzb21lIHBlcmlvZCBvZiB0aW1lIGJlZm9yZSBkZXRlcm1pbmluZyBpZiB0aGUgcHJldmlvdXMgbWVudSBzaG91bGQgY2xvc2UgaW5cbiAgICAvLyBjYXNlcyB3aGVyZSB0aGUgdXNlciBtYXkgaGF2ZSBtb3ZlZCB0b3dhcmRzIHRoZSBzdWJtZW51IGJ1dCBzdG9wcGVkIG9uIGEgc2libGluZyBtZW51XG4gICAgLy8gaXRlbSBpbnRlbnRpb25hbGx5LlxuICAgIGNvbnN0IHRpbWVvdXRJZCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgLy8gUmVzb2x2ZSBpZiB0aGUgdXNlciBpcyBjdXJyZW50bHkgbW91c2VkIG92ZXIgc29tZSBlbGVtZW50IGluIHRoZSByb290IG1lbnVcbiAgICAgIGlmICh0aGlzLl9wb2ludGVyVHJhY2tlciEuYWN0aXZlRWxlbWVudCAmJiB0aW1lb3V0SWQgPT09IHRoaXMuX3RpbWVvdXRJZCkge1xuICAgICAgICBkb1RvZ2dsZSgpO1xuICAgICAgfVxuICAgICAgdGhpcy5fdGltZW91dElkID0gbnVsbDtcbiAgICB9LCBDTE9TRV9ERUxBWSkgYXMgYW55IGFzIG51bWJlcjtcblxuICAgIHRoaXMuX3RpbWVvdXRJZCA9IHRpbWVvdXRJZDtcbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoZSB1c2VyIGlzIGhlYWRpbmcgdG93YXJkcyB0aGUgb3BlbiBzdWJtZW51LiAqL1xuICBwcml2YXRlIF9pc01vdmluZ1RvU3VibWVudSgpIHtcbiAgICBjb25zdCBzdWJtZW51UG9pbnRzID0gdGhpcy5fZ2V0U3VibWVudUJvdW5kcygpO1xuICAgIGlmICghc3VibWVudVBvaW50cykge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGxldCBudW1Nb3ZpbmcgPSAwO1xuICAgIGNvbnN0IGN1cnJQb2ludCA9IHRoaXMuX3BvaW50c1t0aGlzLl9wb2ludHMubGVuZ3RoIC0gMV07XG4gICAgLy8gc3RhcnQgZnJvbSB0aGUgc2Vjb25kIGxhc3QgcG9pbnQgYW5kIGNhbGN1bGF0ZSB0aGUgc2xvcGUgYmV0d2VlbiBlYWNoIHBvaW50IGFuZCB0aGUgbGFzdFxuICAgIC8vIHBvaW50LlxuICAgIGZvciAobGV0IGkgPSB0aGlzLl9wb2ludHMubGVuZ3RoIC0gMjsgaSA+PSAwOyBpLS0pIHtcbiAgICAgIGNvbnN0IHByZXZpb3VzID0gdGhpcy5fcG9pbnRzW2ldO1xuICAgICAgY29uc3Qgc2xvcGUgPSBnZXRTbG9wZShjdXJyUG9pbnQsIHByZXZpb3VzKTtcbiAgICAgIGlmIChpc1dpdGhpblN1Ym1lbnUoc3VibWVudVBvaW50cywgc2xvcGUsIGdldFlJbnRlcmNlcHQoY3VyclBvaW50LCBzbG9wZSkpKSB7XG4gICAgICAgIG51bU1vdmluZysrO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVtTW92aW5nID49IE1hdGguZmxvb3IoTlVNX1BPSU5UUyAvIDIpO1xuICB9XG5cbiAgLyoqIEdldCB0aGUgYm91bmRpbmcgRE9NUmVjdCBmb3IgdGhlIG9wZW4gc3VibWVudS4gKi9cbiAgcHJpdmF0ZSBfZ2V0U3VibWVudUJvdW5kcygpOiBET01SZWN0IHwgdW5kZWZpbmVkIHtcbiAgICByZXR1cm4gdGhpcy5fcG9pbnRlclRyYWNrZXI/LnByZXZpb3VzRWxlbWVudD8uZ2V0TWVudSgpPy5uYXRpdmVFbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIGEgcmVmZXJlbmNlIHRvIHRoZSBQb2ludGVyRm9jdXNUcmFja2VyIGFuZCBtZW51IGVsZW1lbnQgaXMgcHJvdmlkZWQuXG4gICAqIEB0aHJvd3MgYW4gZXJyb3IgaWYgbmVpdGhlciByZWZlcmVuY2UgaXMgcHJvdmlkZWQuXG4gICAqL1xuICBwcml2YXRlIF9jaGVja0NvbmZpZ3VyZWQoKSB7XG4gICAgaWYgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkge1xuICAgICAgaWYgKCF0aGlzLl9wb2ludGVyVHJhY2tlcikge1xuICAgICAgICB0aHJvd01pc3NpbmdQb2ludGVyRm9jdXNUcmFja2VyKCk7XG4gICAgICB9XG4gICAgICBpZiAoIXRoaXMuX21lbnUpIHtcbiAgICAgICAgdGhyb3dNaXNzaW5nTWVudVJlZmVyZW5jZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKiBTdWJzY3JpYmUgdG8gdGhlIHJvb3QgbWVudXMgbW91c2UgbW92ZSBldmVudHMgYW5kIHVwZGF0ZSB0aGUgdHJhY2tlZCBtb3VzZSBwb2ludHMuICovXG4gIHByaXZhdGUgX3N1YnNjcmliZVRvTW91c2VNb3ZlcygpIHtcbiAgICB0aGlzLl9uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgZnJvbUV2ZW50PE1vdXNlRXZlbnQ+KHRoaXMuX21lbnUubmF0aXZlRWxlbWVudCwgJ21vdXNlbW92ZScpXG4gICAgICAgIC5waXBlKFxuICAgICAgICAgIGZpbHRlcigoXzogTW91c2VFdmVudCwgaW5kZXg6IG51bWJlcikgPT4gaW5kZXggJSBNT1VTRV9NT1ZFX1NBTVBMRV9GUkVRVUVOQ1kgPT09IDApLFxuICAgICAgICAgIHRha2VVbnRpbCh0aGlzLl9kZXN0cm95ZWQpLFxuICAgICAgICApXG4gICAgICAgIC5zdWJzY3JpYmUoKGV2ZW50OiBNb3VzZUV2ZW50KSA9PiB7XG4gICAgICAgICAgdGhpcy5fcG9pbnRzLnB1c2goe3g6IGV2ZW50LmNsaWVudFgsIHk6IGV2ZW50LmNsaWVudFl9KTtcbiAgICAgICAgICBpZiAodGhpcy5fcG9pbnRzLmxlbmd0aCA+IE5VTV9QT0lOVFMpIHtcbiAgICAgICAgICAgIHRoaXMuX3BvaW50cy5zaGlmdCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSk7XG4gIH1cbn1cblxuLyoqXG4gKiBDZGtUYXJnZXRNZW51QWltIGlzIGEgcHJvdmlkZXIgZm9yIHRoZSBUYXJnZXRNZW51QWltIHNlcnZpY2UuIEl0IGNhbiBiZSBhZGRlZCB0byBhblxuICogZWxlbWVudCB3aXRoIGVpdGhlciB0aGUgYGNka01lbnVgIG9yIGBjZGtNZW51QmFyYCBkaXJlY3RpdmUgYW5kIGNoaWxkIG1lbnUgaXRlbXMuXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tjZGtUYXJnZXRNZW51QWltXScsXG4gIGV4cG9ydEFzOiAnY2RrVGFyZ2V0TWVudUFpbScsXG4gIHByb3ZpZGVyczogW3twcm92aWRlOiBNRU5VX0FJTSwgdXNlQ2xhc3M6IFRhcmdldE1lbnVBaW19XSxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrVGFyZ2V0TWVudUFpbSB7fVxuIl19