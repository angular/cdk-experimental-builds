/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, TemplateRef } from '@angular/core';
/**
 * Directive applied to an ng-template which wraps a CdkMenu and provides a reference to the
 * child element it wraps which allows for opening of the CdkMenu in an overlay.
 */
let CdkMenuPanel = /** @class */ (() => {
    class CdkMenuPanel {
        constructor(_templateRef) {
            this._templateRef = _templateRef;
        }
        /**
         * Set the Menu component on the menu panel. Since we cannot use ContentChild to fetch the
         * child Menu component, the child Menu must register its self with the parent MenuPanel.
         */
        _registerMenu(child) {
            this._menu = child;
        }
    }
    CdkMenuPanel.decorators = [
        { type: Directive, args: [{ selector: 'ng-template[cdkMenuPanel]', exportAs: 'cdkMenuPanel' },] }
    ];
    CdkMenuPanel.ctorParameters = () => [
        { type: TemplateRef }
    ];
    return CdkMenuPanel;
})();
export { CdkMenuPanel };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1wYW5lbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL21lbnUvbWVudS1wYW5lbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsU0FBUyxFQUFFLFdBQVcsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUdyRDs7O0dBR0c7QUFDSDtJQUFBLE1BQ2EsWUFBWTtRQUl2QixZQUFxQixZQUFrQztZQUFsQyxpQkFBWSxHQUFaLFlBQVksQ0FBc0I7UUFBRyxDQUFDO1FBRTNEOzs7V0FHRztRQUNILGFBQWEsQ0FBQyxLQUFXO1lBQ3ZCLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBQ3JCLENBQUM7OztnQkFiRixTQUFTLFNBQUMsRUFBQyxRQUFRLEVBQUUsMkJBQTJCLEVBQUUsUUFBUSxFQUFFLGNBQWMsRUFBQzs7O2dCQVB6RCxXQUFXOztJQXFCOUIsbUJBQUM7S0FBQTtTQWJZLFlBQVkiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtEaXJlY3RpdmUsIFRlbXBsYXRlUmVmfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7TWVudX0gZnJvbSAnLi9tZW51LWludGVyZmFjZSc7XG5cbi8qKlxuICogRGlyZWN0aXZlIGFwcGxpZWQgdG8gYW4gbmctdGVtcGxhdGUgd2hpY2ggd3JhcHMgYSBDZGtNZW51IGFuZCBwcm92aWRlcyBhIHJlZmVyZW5jZSB0byB0aGVcbiAqIGNoaWxkIGVsZW1lbnQgaXQgd3JhcHMgd2hpY2ggYWxsb3dzIGZvciBvcGVuaW5nIG9mIHRoZSBDZGtNZW51IGluIGFuIG92ZXJsYXkuXG4gKi9cbkBEaXJlY3RpdmUoe3NlbGVjdG9yOiAnbmctdGVtcGxhdGVbY2RrTWVudVBhbmVsXScsIGV4cG9ydEFzOiAnY2RrTWVudVBhbmVsJ30pXG5leHBvcnQgY2xhc3MgQ2RrTWVudVBhbmVsIHtcbiAgLyoqIFJlZmVyZW5jZSB0byB0aGUgY2hpbGQgbWVudSBjb21wb25lbnQgKi9cbiAgX21lbnU/OiBNZW51O1xuXG4gIGNvbnN0cnVjdG9yKHJlYWRvbmx5IF90ZW1wbGF0ZVJlZjogVGVtcGxhdGVSZWY8dW5rbm93bj4pIHt9XG5cbiAgLyoqXG4gICAqIFNldCB0aGUgTWVudSBjb21wb25lbnQgb24gdGhlIG1lbnUgcGFuZWwuIFNpbmNlIHdlIGNhbm5vdCB1c2UgQ29udGVudENoaWxkIHRvIGZldGNoIHRoZVxuICAgKiBjaGlsZCBNZW51IGNvbXBvbmVudCwgdGhlIGNoaWxkIE1lbnUgbXVzdCByZWdpc3RlciBpdHMgc2VsZiB3aXRoIHRoZSBwYXJlbnQgTWVudVBhbmVsLlxuICAgKi9cbiAgX3JlZ2lzdGVyTWVudShjaGlsZDogTWVudSkge1xuICAgIHRoaXMuX21lbnUgPSBjaGlsZDtcbiAgfVxufVxuIl19