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
    }
}
CdkMenuPanel.decorators = [
    { type: Directive, args: [{ selector: 'ng-template[cdkMenuPanel]', exportAs: 'cdkMenuPanel' },] }
];
CdkMenuPanel.ctorParameters = () => [
    { type: TemplateRef }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1wYW5lbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL21lbnUvbWVudS1wYW5lbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsU0FBUyxFQUFFLFdBQVcsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUdyRDs7O0dBR0c7QUFFSCxNQUFNLE9BQU8sWUFBWTtJQUl2QixZQUFxQixZQUFrQztRQUFsQyxpQkFBWSxHQUFaLFlBQVksQ0FBc0I7SUFBRyxDQUFDO0lBRTNEOzs7T0FHRztJQUNILGFBQWEsQ0FBQyxLQUFXO1FBQ3ZCLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0lBQ3JCLENBQUM7OztZQWJGLFNBQVMsU0FBQyxFQUFDLFFBQVEsRUFBRSwyQkFBMkIsRUFBRSxRQUFRLEVBQUUsY0FBYyxFQUFDOzs7WUFQekQsV0FBVyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0RpcmVjdGl2ZSwgVGVtcGxhdGVSZWZ9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtNZW51fSBmcm9tICcuL21lbnUtaW50ZXJmYWNlJztcblxuLyoqXG4gKiBEaXJlY3RpdmUgYXBwbGllZCB0byBhbiBuZy10ZW1wbGF0ZSB3aGljaCB3cmFwcyBhIENka01lbnUgYW5kIHByb3ZpZGVzIGEgcmVmZXJlbmNlIHRvIHRoZVxuICogY2hpbGQgZWxlbWVudCBpdCB3cmFwcyB3aGljaCBhbGxvd3MgZm9yIG9wZW5pbmcgb2YgdGhlIENka01lbnUgaW4gYW4gb3ZlcmxheS5cbiAqL1xuQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICduZy10ZW1wbGF0ZVtjZGtNZW51UGFuZWxdJywgZXhwb3J0QXM6ICdjZGtNZW51UGFuZWwnfSlcbmV4cG9ydCBjbGFzcyBDZGtNZW51UGFuZWwge1xuICAvKiogUmVmZXJlbmNlIHRvIHRoZSBjaGlsZCBtZW51IGNvbXBvbmVudCAqL1xuICBfbWVudT86IE1lbnU7XG5cbiAgY29uc3RydWN0b3IocmVhZG9ubHkgX3RlbXBsYXRlUmVmOiBUZW1wbGF0ZVJlZjx1bmtub3duPikge31cblxuICAvKipcbiAgICogU2V0IHRoZSBNZW51IGNvbXBvbmVudCBvbiB0aGUgbWVudSBwYW5lbC4gU2luY2Ugd2UgY2Fubm90IHVzZSBDb250ZW50Q2hpbGQgdG8gZmV0Y2ggdGhlXG4gICAqIGNoaWxkIE1lbnUgY29tcG9uZW50LCB0aGUgY2hpbGQgTWVudSBtdXN0IHJlZ2lzdGVyIGl0cyBzZWxmIHdpdGggdGhlIHBhcmVudCBNZW51UGFuZWwuXG4gICAqL1xuICBfcmVnaXN0ZXJNZW51KGNoaWxkOiBNZW51KSB7XG4gICAgdGhpcy5fbWVudSA9IGNoaWxkO1xuICB9XG59XG4iXX0=