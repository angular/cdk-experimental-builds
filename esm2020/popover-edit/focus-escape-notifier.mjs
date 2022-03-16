/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Inject, Injectable, NgZone } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { FocusTrap, InteractivityChecker } from '@angular/cdk/a11y';
import { Subject } from 'rxjs';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/a11y";
/**
 * Like FocusTrap, but rather than trapping focus within a dom region, notifies subscribers when
 * focus leaves the region.
 */
export class FocusEscapeNotifier extends FocusTrap {
    constructor(element, checker, ngZone, document) {
        super(element, checker, ngZone, document, true /* deferAnchors */);
        this._escapeSubject = new Subject();
        // The focus trap adds "anchors" at the beginning and end of a trapped region that redirect
        // focus. We override that redirect behavior here with simply emitting on a stream.
        this.startAnchorListener = () => {
            this._escapeSubject.next(0 /* START */);
            return true;
        };
        this.endAnchorListener = () => {
            this._escapeSubject.next(1 /* END */);
            return true;
        };
        this.attachAnchors();
    }
    escapes() {
        return this._escapeSubject;
    }
}
/** Factory that allows easy instantiation of focus escape notifiers. */
export class FocusEscapeNotifierFactory {
    constructor(_checker, _ngZone, _document) {
        this._checker = _checker;
        this._ngZone = _ngZone;
        this._document = _document;
    }
    /**
     * Creates a focus escape notifier region around the given element.
     * @param element The element around which focus will be monitored.
     * @returns The created focus escape notifier instance.
     */
    create(element) {
        return new FocusEscapeNotifier(element, this._checker, this._ngZone, this._document);
    }
}
FocusEscapeNotifierFactory.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.3.0", ngImport: i0, type: FocusEscapeNotifierFactory, deps: [{ token: i1.InteractivityChecker }, { token: i0.NgZone }, { token: DOCUMENT }], target: i0.ɵɵFactoryTarget.Injectable });
FocusEscapeNotifierFactory.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.3.0", ngImport: i0, type: FocusEscapeNotifierFactory, providedIn: 'root' });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.3.0", ngImport: i0, type: FocusEscapeNotifierFactory, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: function () { return [{ type: i1.InteractivityChecker }, { type: i0.NgZone }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [DOCUMENT]
                }] }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9jdXMtZXNjYXBlLW5vdGlmaWVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvcG9wb3Zlci1lZGl0L2ZvY3VzLWVzY2FwZS1ub3RpZmllci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsTUFBTSxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDekQsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQ3pDLE9BQU8sRUFBQyxTQUFTLEVBQUUsb0JBQW9CLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUNsRSxPQUFPLEVBQWEsT0FBTyxFQUFDLE1BQU0sTUFBTSxDQUFDOzs7QUFRekM7OztHQUdHO0FBQ0gsTUFBTSxPQUFPLG1CQUFvQixTQUFRLFNBQVM7SUFHaEQsWUFDRSxPQUFvQixFQUNwQixPQUE2QixFQUM3QixNQUFjLEVBQ2QsUUFBa0I7UUFFbEIsS0FBSyxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQVJwRCxtQkFBYyxHQUFHLElBQUksT0FBTyxFQUFnQyxDQUFDO1FBVTVFLDJGQUEyRjtRQUMzRixtRkFBbUY7UUFDbkYsSUFBSSxDQUFDLG1CQUFtQixHQUFHLEdBQUcsRUFBRTtZQUM5QixJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksZUFBb0MsQ0FBQztZQUM3RCxPQUFPLElBQUksQ0FBQztRQUNkLENBQUMsQ0FBQztRQUNGLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxHQUFHLEVBQUU7WUFDNUIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLGFBQWtDLENBQUM7WUFDM0QsT0FBTyxJQUFJLENBQUM7UUFDZCxDQUFDLENBQUM7UUFFRixJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7SUFDdkIsQ0FBQztJQUVELE9BQU87UUFDTCxPQUFPLElBQUksQ0FBQyxjQUFjLENBQUM7SUFDN0IsQ0FBQztDQUNGO0FBRUQsd0VBQXdFO0FBRXhFLE1BQU0sT0FBTywwQkFBMEI7SUFHckMsWUFDVSxRQUE4QixFQUM5QixPQUFlLEVBQ0wsU0FBYztRQUZ4QixhQUFRLEdBQVIsUUFBUSxDQUFzQjtRQUM5QixZQUFPLEdBQVAsT0FBTyxDQUFRO1FBR3ZCLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO0lBQzdCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsTUFBTSxDQUFDLE9BQW9CO1FBQ3pCLE9BQU8sSUFBSSxtQkFBbUIsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUN2RixDQUFDOzt1SEFsQlUsMEJBQTBCLDRFQU0zQixRQUFROzJIQU5QLDBCQUEwQixjQURkLE1BQU07MkZBQ2xCLDBCQUEwQjtrQkFEdEMsVUFBVTttQkFBQyxFQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUM7OzBCQU8zQixNQUFNOzJCQUFDLFFBQVEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtJbmplY3QsIEluamVjdGFibGUsIE5nWm9uZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0RPQ1VNRU5UfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHtGb2N1c1RyYXAsIEludGVyYWN0aXZpdHlDaGVja2VyfSBmcm9tICdAYW5ndWxhci9jZGsvYTExeSc7XG5pbXBvcnQge09ic2VydmFibGUsIFN1YmplY3R9IGZyb20gJ3J4anMnO1xuXG4vKiogVmFsdWUgaW5kaWNhdGluZyB3aGV0aGVyIGZvY3VzIGxlZnQgdGhlIHRhcmdldCBhcmVhIGJlZm9yZSBvciBhZnRlciB0aGUgZW5jbG9zZWQgZWxlbWVudHMuICovXG5leHBvcnQgY29uc3QgZW51bSBGb2N1c0VzY2FwZU5vdGlmaWVyRGlyZWN0aW9uIHtcbiAgU1RBUlQsXG4gIEVORCxcbn1cblxuLyoqXG4gKiBMaWtlIEZvY3VzVHJhcCwgYnV0IHJhdGhlciB0aGFuIHRyYXBwaW5nIGZvY3VzIHdpdGhpbiBhIGRvbSByZWdpb24sIG5vdGlmaWVzIHN1YnNjcmliZXJzIHdoZW5cbiAqIGZvY3VzIGxlYXZlcyB0aGUgcmVnaW9uLlxuICovXG5leHBvcnQgY2xhc3MgRm9jdXNFc2NhcGVOb3RpZmllciBleHRlbmRzIEZvY3VzVHJhcCB7XG4gIHByaXZhdGUgcmVhZG9ubHkgX2VzY2FwZVN1YmplY3QgPSBuZXcgU3ViamVjdDxGb2N1c0VzY2FwZU5vdGlmaWVyRGlyZWN0aW9uPigpO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIGVsZW1lbnQ6IEhUTUxFbGVtZW50LFxuICAgIGNoZWNrZXI6IEludGVyYWN0aXZpdHlDaGVja2VyLFxuICAgIG5nWm9uZTogTmdab25lLFxuICAgIGRvY3VtZW50OiBEb2N1bWVudCxcbiAgKSB7XG4gICAgc3VwZXIoZWxlbWVudCwgY2hlY2tlciwgbmdab25lLCBkb2N1bWVudCwgdHJ1ZSAvKiBkZWZlckFuY2hvcnMgKi8pO1xuXG4gICAgLy8gVGhlIGZvY3VzIHRyYXAgYWRkcyBcImFuY2hvcnNcIiBhdCB0aGUgYmVnaW5uaW5nIGFuZCBlbmQgb2YgYSB0cmFwcGVkIHJlZ2lvbiB0aGF0IHJlZGlyZWN0XG4gICAgLy8gZm9jdXMuIFdlIG92ZXJyaWRlIHRoYXQgcmVkaXJlY3QgYmVoYXZpb3IgaGVyZSB3aXRoIHNpbXBseSBlbWl0dGluZyBvbiBhIHN0cmVhbS5cbiAgICB0aGlzLnN0YXJ0QW5jaG9yTGlzdGVuZXIgPSAoKSA9PiB7XG4gICAgICB0aGlzLl9lc2NhcGVTdWJqZWN0Lm5leHQoRm9jdXNFc2NhcGVOb3RpZmllckRpcmVjdGlvbi5TVEFSVCk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9O1xuICAgIHRoaXMuZW5kQW5jaG9yTGlzdGVuZXIgPSAoKSA9PiB7XG4gICAgICB0aGlzLl9lc2NhcGVTdWJqZWN0Lm5leHQoRm9jdXNFc2NhcGVOb3RpZmllckRpcmVjdGlvbi5FTkQpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfTtcblxuICAgIHRoaXMuYXR0YWNoQW5jaG9ycygpO1xuICB9XG5cbiAgZXNjYXBlcygpOiBPYnNlcnZhYmxlPEZvY3VzRXNjYXBlTm90aWZpZXJEaXJlY3Rpb24+IHtcbiAgICByZXR1cm4gdGhpcy5fZXNjYXBlU3ViamVjdDtcbiAgfVxufVxuXG4vKiogRmFjdG9yeSB0aGF0IGFsbG93cyBlYXN5IGluc3RhbnRpYXRpb24gb2YgZm9jdXMgZXNjYXBlIG5vdGlmaWVycy4gKi9cbkBJbmplY3RhYmxlKHtwcm92aWRlZEluOiAncm9vdCd9KVxuZXhwb3J0IGNsYXNzIEZvY3VzRXNjYXBlTm90aWZpZXJGYWN0b3J5IHtcbiAgcHJpdmF0ZSBfZG9jdW1lbnQ6IERvY3VtZW50O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgX2NoZWNrZXI6IEludGVyYWN0aXZpdHlDaGVja2VyLFxuICAgIHByaXZhdGUgX25nWm9uZTogTmdab25lLFxuICAgIEBJbmplY3QoRE9DVU1FTlQpIF9kb2N1bWVudDogYW55LFxuICApIHtcbiAgICB0aGlzLl9kb2N1bWVudCA9IF9kb2N1bWVudDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgZm9jdXMgZXNjYXBlIG5vdGlmaWVyIHJlZ2lvbiBhcm91bmQgdGhlIGdpdmVuIGVsZW1lbnQuXG4gICAqIEBwYXJhbSBlbGVtZW50IFRoZSBlbGVtZW50IGFyb3VuZCB3aGljaCBmb2N1cyB3aWxsIGJlIG1vbml0b3JlZC5cbiAgICogQHJldHVybnMgVGhlIGNyZWF0ZWQgZm9jdXMgZXNjYXBlIG5vdGlmaWVyIGluc3RhbmNlLlxuICAgKi9cbiAgY3JlYXRlKGVsZW1lbnQ6IEhUTUxFbGVtZW50KTogRm9jdXNFc2NhcGVOb3RpZmllciB7XG4gICAgcmV0dXJuIG5ldyBGb2N1c0VzY2FwZU5vdGlmaWVyKGVsZW1lbnQsIHRoaXMuX2NoZWNrZXIsIHRoaXMuX25nWm9uZSwgdGhpcy5fZG9jdW1lbnQpO1xuICB9XG59XG4iXX0=