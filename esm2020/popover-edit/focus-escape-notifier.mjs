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
            this._escapeSubject.next(0 /* FocusEscapeNotifierDirection.START */);
            return true;
        };
        this.endAnchorListener = () => {
            this._escapeSubject.next(1 /* FocusEscapeNotifierDirection.END */);
            return true;
        };
        this.attachAnchors();
    }
    escapes() {
        return this._escapeSubject;
    }
}
/** Factory that allows easy instantiation of focus escape notifiers. */
class FocusEscapeNotifierFactory {
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
FocusEscapeNotifierFactory.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.0.0-next.7", ngImport: i0, type: FocusEscapeNotifierFactory, deps: [{ token: i1.InteractivityChecker }, { token: i0.NgZone }, { token: DOCUMENT }], target: i0.ɵɵFactoryTarget.Injectable });
FocusEscapeNotifierFactory.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "16.0.0-next.7", ngImport: i0, type: FocusEscapeNotifierFactory, providedIn: 'root' });
export { FocusEscapeNotifierFactory };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.0.0-next.7", ngImport: i0, type: FocusEscapeNotifierFactory, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: function () { return [{ type: i1.InteractivityChecker }, { type: i0.NgZone }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [DOCUMENT]
                }] }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9jdXMtZXNjYXBlLW5vdGlmaWVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvcG9wb3Zlci1lZGl0L2ZvY3VzLWVzY2FwZS1ub3RpZmllci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsTUFBTSxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDekQsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQ3pDLE9BQU8sRUFBQyxTQUFTLEVBQUUsb0JBQW9CLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUNsRSxPQUFPLEVBQWEsT0FBTyxFQUFDLE1BQU0sTUFBTSxDQUFDOzs7QUFRekM7OztHQUdHO0FBQ0gsTUFBTSxPQUFPLG1CQUFvQixTQUFRLFNBQVM7SUFHaEQsWUFDRSxPQUFvQixFQUNwQixPQUE2QixFQUM3QixNQUFjLEVBQ2QsUUFBa0I7UUFFbEIsS0FBSyxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQVJwRCxtQkFBYyxHQUFHLElBQUksT0FBTyxFQUFnQyxDQUFDO1FBVTVFLDJGQUEyRjtRQUMzRixtRkFBbUY7UUFDbkYsSUFBSSxDQUFDLG1CQUFtQixHQUFHLEdBQUcsRUFBRTtZQUM5QixJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksNENBQW9DLENBQUM7WUFDN0QsT0FBTyxJQUFJLENBQUM7UUFDZCxDQUFDLENBQUM7UUFDRixJQUFJLENBQUMsaUJBQWlCLEdBQUcsR0FBRyxFQUFFO1lBQzVCLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSwwQ0FBa0MsQ0FBQztZQUMzRCxPQUFPLElBQUksQ0FBQztRQUNkLENBQUMsQ0FBQztRQUVGLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztJQUN2QixDQUFDO0lBRUQsT0FBTztRQUNMLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQztJQUM3QixDQUFDO0NBQ0Y7QUFFRCx3RUFBd0U7QUFDeEUsTUFDYSwwQkFBMEI7SUFHckMsWUFDVSxRQUE4QixFQUM5QixPQUFlLEVBQ0wsU0FBYztRQUZ4QixhQUFRLEdBQVIsUUFBUSxDQUFzQjtRQUM5QixZQUFPLEdBQVAsT0FBTyxDQUFRO1FBR3ZCLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO0lBQzdCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsTUFBTSxDQUFDLE9BQW9CO1FBQ3pCLE9BQU8sSUFBSSxtQkFBbUIsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUN2RixDQUFDOzs4SEFsQlUsMEJBQTBCLDRFQU0zQixRQUFRO2tJQU5QLDBCQUEwQixjQURkLE1BQU07U0FDbEIsMEJBQTBCO2tHQUExQiwwQkFBMEI7a0JBRHRDLFVBQVU7bUJBQUMsRUFBQyxVQUFVLEVBQUUsTUFBTSxFQUFDOzswQkFPM0IsTUFBTTsyQkFBQyxRQUFRIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SW5qZWN0LCBJbmplY3RhYmxlLCBOZ1pvbmV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtET0NVTUVOVH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7Rm9jdXNUcmFwLCBJbnRlcmFjdGl2aXR5Q2hlY2tlcn0gZnJvbSAnQGFuZ3VsYXIvY2RrL2ExMXknO1xuaW1wb3J0IHtPYnNlcnZhYmxlLCBTdWJqZWN0fSBmcm9tICdyeGpzJztcblxuLyoqIFZhbHVlIGluZGljYXRpbmcgd2hldGhlciBmb2N1cyBsZWZ0IHRoZSB0YXJnZXQgYXJlYSBiZWZvcmUgb3IgYWZ0ZXIgdGhlIGVuY2xvc2VkIGVsZW1lbnRzLiAqL1xuZXhwb3J0IGNvbnN0IGVudW0gRm9jdXNFc2NhcGVOb3RpZmllckRpcmVjdGlvbiB7XG4gIFNUQVJULFxuICBFTkQsXG59XG5cbi8qKlxuICogTGlrZSBGb2N1c1RyYXAsIGJ1dCByYXRoZXIgdGhhbiB0cmFwcGluZyBmb2N1cyB3aXRoaW4gYSBkb20gcmVnaW9uLCBub3RpZmllcyBzdWJzY3JpYmVycyB3aGVuXG4gKiBmb2N1cyBsZWF2ZXMgdGhlIHJlZ2lvbi5cbiAqL1xuZXhwb3J0IGNsYXNzIEZvY3VzRXNjYXBlTm90aWZpZXIgZXh0ZW5kcyBGb2N1c1RyYXAge1xuICBwcml2YXRlIHJlYWRvbmx5IF9lc2NhcGVTdWJqZWN0ID0gbmV3IFN1YmplY3Q8Rm9jdXNFc2NhcGVOb3RpZmllckRpcmVjdGlvbj4oKTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBlbGVtZW50OiBIVE1MRWxlbWVudCxcbiAgICBjaGVja2VyOiBJbnRlcmFjdGl2aXR5Q2hlY2tlcixcbiAgICBuZ1pvbmU6IE5nWm9uZSxcbiAgICBkb2N1bWVudDogRG9jdW1lbnQsXG4gICkge1xuICAgIHN1cGVyKGVsZW1lbnQsIGNoZWNrZXIsIG5nWm9uZSwgZG9jdW1lbnQsIHRydWUgLyogZGVmZXJBbmNob3JzICovKTtcblxuICAgIC8vIFRoZSBmb2N1cyB0cmFwIGFkZHMgXCJhbmNob3JzXCIgYXQgdGhlIGJlZ2lubmluZyBhbmQgZW5kIG9mIGEgdHJhcHBlZCByZWdpb24gdGhhdCByZWRpcmVjdFxuICAgIC8vIGZvY3VzLiBXZSBvdmVycmlkZSB0aGF0IHJlZGlyZWN0IGJlaGF2aW9yIGhlcmUgd2l0aCBzaW1wbHkgZW1pdHRpbmcgb24gYSBzdHJlYW0uXG4gICAgdGhpcy5zdGFydEFuY2hvckxpc3RlbmVyID0gKCkgPT4ge1xuICAgICAgdGhpcy5fZXNjYXBlU3ViamVjdC5uZXh0KEZvY3VzRXNjYXBlTm90aWZpZXJEaXJlY3Rpb24uU1RBUlQpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfTtcbiAgICB0aGlzLmVuZEFuY2hvckxpc3RlbmVyID0gKCkgPT4ge1xuICAgICAgdGhpcy5fZXNjYXBlU3ViamVjdC5uZXh0KEZvY3VzRXNjYXBlTm90aWZpZXJEaXJlY3Rpb24uRU5EKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH07XG5cbiAgICB0aGlzLmF0dGFjaEFuY2hvcnMoKTtcbiAgfVxuXG4gIGVzY2FwZXMoKTogT2JzZXJ2YWJsZTxGb2N1c0VzY2FwZU5vdGlmaWVyRGlyZWN0aW9uPiB7XG4gICAgcmV0dXJuIHRoaXMuX2VzY2FwZVN1YmplY3Q7XG4gIH1cbn1cblxuLyoqIEZhY3RvcnkgdGhhdCBhbGxvd3MgZWFzeSBpbnN0YW50aWF0aW9uIG9mIGZvY3VzIGVzY2FwZSBub3RpZmllcnMuICovXG5ASW5qZWN0YWJsZSh7cHJvdmlkZWRJbjogJ3Jvb3QnfSlcbmV4cG9ydCBjbGFzcyBGb2N1c0VzY2FwZU5vdGlmaWVyRmFjdG9yeSB7XG4gIHByaXZhdGUgX2RvY3VtZW50OiBEb2N1bWVudDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIF9jaGVja2VyOiBJbnRlcmFjdGl2aXR5Q2hlY2tlcixcbiAgICBwcml2YXRlIF9uZ1pvbmU6IE5nWm9uZSxcbiAgICBASW5qZWN0KERPQ1VNRU5UKSBfZG9jdW1lbnQ6IGFueSxcbiAgKSB7XG4gICAgdGhpcy5fZG9jdW1lbnQgPSBfZG9jdW1lbnQ7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIGZvY3VzIGVzY2FwZSBub3RpZmllciByZWdpb24gYXJvdW5kIHRoZSBnaXZlbiBlbGVtZW50LlxuICAgKiBAcGFyYW0gZWxlbWVudCBUaGUgZWxlbWVudCBhcm91bmQgd2hpY2ggZm9jdXMgd2lsbCBiZSBtb25pdG9yZWQuXG4gICAqIEByZXR1cm5zIFRoZSBjcmVhdGVkIGZvY3VzIGVzY2FwZSBub3RpZmllciBpbnN0YW5jZS5cbiAgICovXG4gIGNyZWF0ZShlbGVtZW50OiBIVE1MRWxlbWVudCk6IEZvY3VzRXNjYXBlTm90aWZpZXIge1xuICAgIHJldHVybiBuZXcgRm9jdXNFc2NhcGVOb3RpZmllcihlbGVtZW50LCB0aGlzLl9jaGVja2VyLCB0aGlzLl9uZ1pvbmUsIHRoaXMuX2RvY3VtZW50KTtcbiAgfVxufVxuIl19