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
        this._menuStack.push(child);
    }
}
CdkMenuPanel.decorators = [
    { type: Directive, args: [{ selector: 'ng-template[cdkMenuPanel]', exportAs: 'cdkMenuPanel' },] }
];
CdkMenuPanel.ctorParameters = () => [
    { type: TemplateRef }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1wYW5lbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL21lbnUvbWVudS1wYW5lbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsU0FBUyxFQUFFLFdBQVcsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUlyRDs7O0dBR0c7QUFFSCxNQUFNLE9BQU8sWUFBWTtJQU92QixZQUFxQixZQUFrQztRQUFsQyxpQkFBWSxHQUFaLFlBQVksQ0FBc0I7SUFBRyxDQUFDO0lBRTNEOzs7T0FHRztJQUNILGFBQWEsQ0FBQyxLQUFXO1FBQ3ZCLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBRW5CLDhGQUE4RjtRQUM5Rix5RkFBeUY7UUFDekYseUJBQXlCO1FBQ3pCLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7UUFDeEMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDOUIsQ0FBQzs7O1lBdEJGLFNBQVMsU0FBQyxFQUFDLFFBQVEsRUFBRSwyQkFBMkIsRUFBRSxRQUFRLEVBQUUsY0FBYyxFQUFDOzs7WUFSekQsV0FBVyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0RpcmVjdGl2ZSwgVGVtcGxhdGVSZWZ9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtNZW51fSBmcm9tICcuL21lbnUtaW50ZXJmYWNlJztcbmltcG9ydCB7TWVudVN0YWNrfSBmcm9tICcuL21lbnUtc3RhY2snO1xuXG4vKipcbiAqIERpcmVjdGl2ZSBhcHBsaWVkIHRvIGFuIG5nLXRlbXBsYXRlIHdoaWNoIHdyYXBzIGEgQ2RrTWVudSBhbmQgcHJvdmlkZXMgYSByZWZlcmVuY2UgdG8gdGhlXG4gKiBjaGlsZCBlbGVtZW50IGl0IHdyYXBzIHdoaWNoIGFsbG93cyBmb3Igb3BlbmluZyBvZiB0aGUgQ2RrTWVudSBpbiBhbiBvdmVybGF5LlxuICovXG5ARGlyZWN0aXZlKHtzZWxlY3RvcjogJ25nLXRlbXBsYXRlW2Nka01lbnVQYW5lbF0nLCBleHBvcnRBczogJ2Nka01lbnVQYW5lbCd9KVxuZXhwb3J0IGNsYXNzIENka01lbnVQYW5lbCB7XG4gIC8qKiBSZWZlcmVuY2UgdG8gdGhlIGNoaWxkIG1lbnUgY29tcG9uZW50ICovXG4gIF9tZW51PzogTWVudTtcblxuICAvKiogS2VlcCB0cmFjayBvZiBvcGVuIE1lbnVzLiAqL1xuICBfbWVudVN0YWNrOiBNZW51U3RhY2s7XG5cbiAgY29uc3RydWN0b3IocmVhZG9ubHkgX3RlbXBsYXRlUmVmOiBUZW1wbGF0ZVJlZjx1bmtub3duPikge31cblxuICAvKipcbiAgICogU2V0IHRoZSBNZW51IGNvbXBvbmVudCBvbiB0aGUgbWVudSBwYW5lbC4gU2luY2Ugd2UgY2Fubm90IHVzZSBDb250ZW50Q2hpbGQgdG8gZmV0Y2ggdGhlXG4gICAqIGNoaWxkIE1lbnUgY29tcG9uZW50LCB0aGUgY2hpbGQgTWVudSBtdXN0IHJlZ2lzdGVyIGl0cyBzZWxmIHdpdGggdGhlIHBhcmVudCBNZW51UGFuZWwuXG4gICAqL1xuICBfcmVnaXN0ZXJNZW51KGNoaWxkOiBNZW51KSB7XG4gICAgdGhpcy5fbWVudSA9IGNoaWxkO1xuXG4gICAgLy8gVGhlIGlkZWFsIHNvbHV0aW9uIHdvdWxkIGJlIHRvIGFmZmVjdCB0aGUgQ2RrTWVudVBhbmVsIGluamVjdG9yIGZyb20gdGhlIENka01lbnVUcmlnZ2VyIGFuZFxuICAgIC8vIGluamVjdCB0aGUgbWVudSBzdGFjayByZWZlcmVuY2UgaW50byB0aGUgY2hpbGQgbWVudSBhbmQgbWVudSBpdGVtcywgaG93ZXZlciB0aGlzIGlzbid0XG4gICAgLy8gcG9zc2libGUgYXQgdGhpcyB0aW1lLlxuICAgIHRoaXMuX21lbnUuX21lbnVTdGFjayA9IHRoaXMuX21lbnVTdGFjaztcbiAgICB0aGlzLl9tZW51U3RhY2sucHVzaChjaGlsZCk7XG4gIH1cbn1cbiJdfQ==