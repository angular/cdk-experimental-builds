/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, TemplateRef } from '@angular/core';
import * as i0 from "@angular/core";
/**
 * Directive applied to an ng-template which wraps a CdkMenu and provides a reference to the
 * child element it wraps which allows for opening of the CdkMenu in an overlay.
 */
export class CdkMenuPanel {
    constructor(_templateRef) {
        this._templateRef = _templateRef;
    }
    /**
     * Set the Menu component on the menu panel. Since we cannot use ContentChild to fetch the
     * child Menu component, the child Menu must register its self with the parent MenuPanel.
     */
    _registerMenu(child) {
        this._menu = child;
        // The ideal solution would be to affect the CdkMenuPanel injector from the CdkMenuTrigger and
        // inject the menu stack reference into the child menu and menu items, however this isn't
        // possible at this time.
        this._menu._menuStack = this._menuStack;
        this._menuStack?.push(child);
    }
}
CdkMenuPanel.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.3.0", ngImport: i0, type: CdkMenuPanel, deps: [{ token: i0.TemplateRef }], target: i0.ɵɵFactoryTarget.Directive });
CdkMenuPanel.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "13.3.0", type: CdkMenuPanel, selector: "ng-template[cdkMenuPanel]", exportAs: ["cdkMenuPanel"], ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.3.0", ngImport: i0, type: CdkMenuPanel, decorators: [{
            type: Directive,
            args: [{ selector: 'ng-template[cdkMenuPanel]', exportAs: 'cdkMenuPanel' }]
        }], ctorParameters: function () { return [{ type: i0.TemplateRef }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1wYW5lbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL21lbnUvbWVudS1wYW5lbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsU0FBUyxFQUFFLFdBQVcsRUFBQyxNQUFNLGVBQWUsQ0FBQzs7QUFJckQ7OztHQUdHO0FBRUgsTUFBTSxPQUFPLFlBQVk7SUFPdkIsWUFBcUIsWUFBa0M7UUFBbEMsaUJBQVksR0FBWixZQUFZLENBQXNCO0lBQUcsQ0FBQztJQUUzRDs7O09BR0c7SUFDSCxhQUFhLENBQUMsS0FBVztRQUN2QixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUVuQiw4RkFBOEY7UUFDOUYseUZBQXlGO1FBQ3pGLHlCQUF5QjtRQUN6QixJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO1FBQ3hDLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQy9CLENBQUM7O3lHQXJCVSxZQUFZOzZGQUFaLFlBQVk7MkZBQVosWUFBWTtrQkFEeEIsU0FBUzttQkFBQyxFQUFDLFFBQVEsRUFBRSwyQkFBMkIsRUFBRSxRQUFRLEVBQUUsY0FBYyxFQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RGlyZWN0aXZlLCBUZW1wbGF0ZVJlZn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge01lbnV9IGZyb20gJy4vbWVudS1pbnRlcmZhY2UnO1xuaW1wb3J0IHtNZW51U3RhY2t9IGZyb20gJy4vbWVudS1zdGFjayc7XG5cbi8qKlxuICogRGlyZWN0aXZlIGFwcGxpZWQgdG8gYW4gbmctdGVtcGxhdGUgd2hpY2ggd3JhcHMgYSBDZGtNZW51IGFuZCBwcm92aWRlcyBhIHJlZmVyZW5jZSB0byB0aGVcbiAqIGNoaWxkIGVsZW1lbnQgaXQgd3JhcHMgd2hpY2ggYWxsb3dzIGZvciBvcGVuaW5nIG9mIHRoZSBDZGtNZW51IGluIGFuIG92ZXJsYXkuXG4gKi9cbkBEaXJlY3RpdmUoe3NlbGVjdG9yOiAnbmctdGVtcGxhdGVbY2RrTWVudVBhbmVsXScsIGV4cG9ydEFzOiAnY2RrTWVudVBhbmVsJ30pXG5leHBvcnQgY2xhc3MgQ2RrTWVudVBhbmVsIHtcbiAgLyoqIFJlZmVyZW5jZSB0byB0aGUgY2hpbGQgbWVudSBjb21wb25lbnQgKi9cbiAgX21lbnU/OiBNZW51O1xuXG4gIC8qKiBLZWVwIHRyYWNrIG9mIG9wZW4gTWVudXMuICovXG4gIF9tZW51U3RhY2s6IE1lbnVTdGFjayB8IG51bGw7XG5cbiAgY29uc3RydWN0b3IocmVhZG9ubHkgX3RlbXBsYXRlUmVmOiBUZW1wbGF0ZVJlZjx1bmtub3duPikge31cblxuICAvKipcbiAgICogU2V0IHRoZSBNZW51IGNvbXBvbmVudCBvbiB0aGUgbWVudSBwYW5lbC4gU2luY2Ugd2UgY2Fubm90IHVzZSBDb250ZW50Q2hpbGQgdG8gZmV0Y2ggdGhlXG4gICAqIGNoaWxkIE1lbnUgY29tcG9uZW50LCB0aGUgY2hpbGQgTWVudSBtdXN0IHJlZ2lzdGVyIGl0cyBzZWxmIHdpdGggdGhlIHBhcmVudCBNZW51UGFuZWwuXG4gICAqL1xuICBfcmVnaXN0ZXJNZW51KGNoaWxkOiBNZW51KSB7XG4gICAgdGhpcy5fbWVudSA9IGNoaWxkO1xuXG4gICAgLy8gVGhlIGlkZWFsIHNvbHV0aW9uIHdvdWxkIGJlIHRvIGFmZmVjdCB0aGUgQ2RrTWVudVBhbmVsIGluamVjdG9yIGZyb20gdGhlIENka01lbnVUcmlnZ2VyIGFuZFxuICAgIC8vIGluamVjdCB0aGUgbWVudSBzdGFjayByZWZlcmVuY2UgaW50byB0aGUgY2hpbGQgbWVudSBhbmQgbWVudSBpdGVtcywgaG93ZXZlciB0aGlzIGlzbid0XG4gICAgLy8gcG9zc2libGUgYXQgdGhpcyB0aW1lLlxuICAgIHRoaXMuX21lbnUuX21lbnVTdGFjayA9IHRoaXMuX21lbnVTdGFjaztcbiAgICB0aGlzLl9tZW51U3RhY2s/LnB1c2goY2hpbGQpO1xuICB9XG59XG4iXX0=