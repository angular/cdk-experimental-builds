/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, Input, Output, EventEmitter, QueryList, ContentChildren, Optional, } from '@angular/core';
import { take } from 'rxjs/operators';
import { CdkMenuGroup } from './menu-group';
import { CdkMenuPanel } from './menu-panel';
import { CDK_MENU } from './menu-interface';
import { throwMissingMenuPanelError } from './menu-errors';
/**
 * Directive which configures the element as a Menu which should contain child elements marked as
 * CdkMenuItem or CdkMenuGroup. Sets the appropriate role and aria-attributes for a menu and
 * contains accessible keyboard and mouse handling logic.
 *
 * It also acts as a RadioGroup for elements marked with role `menuitemradio`.
 */
export class CdkMenu extends CdkMenuGroup {
    constructor(_menuPanel) {
        super();
        this._menuPanel = _menuPanel;
        /**
         * Sets the aria-orientation attribute and determines where menus will be opened.
         * Does not affect styling/layout.
         */
        this.orientation = 'vertical';
        /** Event emitted when the menu is closed. */
        this.closed = new EventEmitter();
    }
    ngAfterContentInit() {
        super.ngAfterContentInit();
        this._completeChangeEmitter();
        this._registerWithParentPanel();
    }
    /** Register this menu with its enclosing parent menu panel */
    _registerWithParentPanel() {
        const parent = this._getMenuPanel();
        if (parent) {
            parent._registerMenu(this);
        }
        else {
            throwMissingMenuPanelError();
        }
    }
    /**
     * Get the enclosing CdkMenuPanel defaulting to the injected reference over the developer
     * provided reference.
     */
    _getMenuPanel() {
        return this._menuPanel || this._explicitPanel;
    }
    /**
     * Complete the change emitter if there are any nested MenuGroups or register to complete the
     * change emitter if a MenuGroup is rendered at some point
     */
    _completeChangeEmitter() {
        if (this._hasNestedGroups()) {
            this.change.complete();
        }
        else {
            this._nestedGroups.changes.pipe(take(1)).subscribe(() => this.change.complete());
        }
    }
    /** Return true if there are nested CdkMenuGroup elements within the Menu */
    _hasNestedGroups() {
        // view engine has a bug where @ContentChildren will return the current element
        // along with children if the selectors match - not just the children.
        // Here, if there is at least one element, we check to see if the first element is a CdkMenu in
        // order to ensure that we return true iff there are child CdkMenuGroup elements.
        return this._nestedGroups.length > 0 && !(this._nestedGroups.first instanceof CdkMenu);
    }
    ngOnDestroy() {
        this._emitClosedEvent();
    }
    /** Emit and complete the closed event emitter */
    _emitClosedEvent() {
        this.closed.next();
        this.closed.complete();
    }
}
CdkMenu.decorators = [
    { type: Directive, args: [{
                selector: '[cdkMenu]',
                exportAs: 'cdkMenu',
                host: {
                    'role': 'menu',
                    '[attr.aria-orientation]': 'orientation',
                },
                providers: [
                    { provide: CdkMenuGroup, useExisting: CdkMenu },
                    { provide: CDK_MENU, useExisting: CdkMenu },
                ],
            },] }
];
CdkMenu.ctorParameters = () => [
    { type: CdkMenuPanel, decorators: [{ type: Optional }] }
];
CdkMenu.propDecorators = {
    orientation: [{ type: Input, args: ['cdkMenuOrientation',] }],
    closed: [{ type: Output }],
    _nestedGroups: [{ type: ContentChildren, args: [CdkMenuGroup, { descendants: true },] }],
    _explicitPanel: [{ type: Input, args: ['cdkMenuPanel',] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL21lbnUvbWVudS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQ0wsU0FBUyxFQUNULEtBQUssRUFDTCxNQUFNLEVBQ04sWUFBWSxFQUNaLFNBQVMsRUFDVCxlQUFlLEVBR2YsUUFBUSxHQUNULE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBQyxJQUFJLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUNwQyxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sY0FBYyxDQUFDO0FBQzFDLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFDMUMsT0FBTyxFQUFPLFFBQVEsRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBQ2hELE9BQU8sRUFBQywwQkFBMEIsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUV6RDs7Ozs7O0dBTUc7QUFhSCxNQUFNLE9BQU8sT0FBUSxTQUFRLFlBQVk7SUF1QnZDLFlBQXlDLFVBQXlCO1FBQ2hFLEtBQUssRUFBRSxDQUFDO1FBRCtCLGVBQVUsR0FBVixVQUFVLENBQWU7UUF0QmxFOzs7V0FHRztRQUMwQixnQkFBVyxHQUE4QixVQUFVLENBQUM7UUFFakYsNkNBQTZDO1FBQzFCLFdBQU0sR0FBb0QsSUFBSSxZQUFZLEVBQUUsQ0FBQztJQWlCaEcsQ0FBQztJQUVELGtCQUFrQjtRQUNoQixLQUFLLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztRQUUzQixJQUFJLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztRQUM5QixJQUFJLENBQUMsd0JBQXdCLEVBQUUsQ0FBQztJQUNsQyxDQUFDO0lBRUQsOERBQThEO0lBQ3RELHdCQUF3QjtRQUM5QixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7UUFDcEMsSUFBSSxNQUFNLEVBQUU7WUFDVixNQUFNLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQzVCO2FBQU07WUFDTCwwQkFBMEIsRUFBRSxDQUFDO1NBQzlCO0lBQ0gsQ0FBQztJQUVEOzs7T0FHRztJQUNLLGFBQWE7UUFDbkIsT0FBTyxJQUFJLENBQUMsVUFBVSxJQUFJLElBQUksQ0FBQyxjQUFjLENBQUM7SUFDaEQsQ0FBQztJQUVEOzs7T0FHRztJQUNLLHNCQUFzQjtRQUM1QixJQUFJLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFO1lBQzNCLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUM7U0FDeEI7YUFBTTtZQUNMLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1NBQ2xGO0lBQ0gsQ0FBQztJQUVELDRFQUE0RTtJQUNwRSxnQkFBZ0I7UUFDdEIsK0VBQStFO1FBQy9FLHNFQUFzRTtRQUN0RSwrRkFBK0Y7UUFDL0YsaUZBQWlGO1FBQ2pGLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssWUFBWSxPQUFPLENBQUMsQ0FBQztJQUN6RixDQUFDO0lBRUQsV0FBVztRQUNULElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0lBQzFCLENBQUM7SUFFRCxpREFBaUQ7SUFDekMsZ0JBQWdCO1FBQ3RCLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDbkIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUN6QixDQUFDOzs7WUE3RkYsU0FBUyxTQUFDO2dCQUNULFFBQVEsRUFBRSxXQUFXO2dCQUNyQixRQUFRLEVBQUUsU0FBUztnQkFDbkIsSUFBSSxFQUFFO29CQUNKLE1BQU0sRUFBRSxNQUFNO29CQUNkLHlCQUF5QixFQUFFLGFBQWE7aUJBQ3pDO2dCQUNELFNBQVMsRUFBRTtvQkFDVCxFQUFDLE9BQU8sRUFBRSxZQUFZLEVBQUUsV0FBVyxFQUFFLE9BQU8sRUFBQztvQkFDN0MsRUFBQyxPQUFPLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxPQUFPLEVBQUM7aUJBQzFDO2FBQ0Y7OztZQXRCTyxZQUFZLHVCQThDTCxRQUFROzs7MEJBbEJwQixLQUFLLFNBQUMsb0JBQW9CO3FCQUcxQixNQUFNOzRCQUdOLGVBQWUsU0FBQyxZQUFZLEVBQUUsRUFBQyxXQUFXLEVBQUUsSUFBSSxFQUFDOzZCQVVqRCxLQUFLLFNBQUMsY0FBYyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1xuICBEaXJlY3RpdmUsXG4gIElucHV0LFxuICBPdXRwdXQsXG4gIEV2ZW50RW1pdHRlcixcbiAgUXVlcnlMaXN0LFxuICBDb250ZW50Q2hpbGRyZW4sXG4gIEFmdGVyQ29udGVudEluaXQsXG4gIE9uRGVzdHJveSxcbiAgT3B0aW9uYWwsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHt0YWtlfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5pbXBvcnQge0Nka01lbnVHcm91cH0gZnJvbSAnLi9tZW51LWdyb3VwJztcbmltcG9ydCB7Q2RrTWVudVBhbmVsfSBmcm9tICcuL21lbnUtcGFuZWwnO1xuaW1wb3J0IHtNZW51LCBDREtfTUVOVX0gZnJvbSAnLi9tZW51LWludGVyZmFjZSc7XG5pbXBvcnQge3Rocm93TWlzc2luZ01lbnVQYW5lbEVycm9yfSBmcm9tICcuL21lbnUtZXJyb3JzJztcblxuLyoqXG4gKiBEaXJlY3RpdmUgd2hpY2ggY29uZmlndXJlcyB0aGUgZWxlbWVudCBhcyBhIE1lbnUgd2hpY2ggc2hvdWxkIGNvbnRhaW4gY2hpbGQgZWxlbWVudHMgbWFya2VkIGFzXG4gKiBDZGtNZW51SXRlbSBvciBDZGtNZW51R3JvdXAuIFNldHMgdGhlIGFwcHJvcHJpYXRlIHJvbGUgYW5kIGFyaWEtYXR0cmlidXRlcyBmb3IgYSBtZW51IGFuZFxuICogY29udGFpbnMgYWNjZXNzaWJsZSBrZXlib2FyZCBhbmQgbW91c2UgaGFuZGxpbmcgbG9naWMuXG4gKlxuICogSXQgYWxzbyBhY3RzIGFzIGEgUmFkaW9Hcm91cCBmb3IgZWxlbWVudHMgbWFya2VkIHdpdGggcm9sZSBgbWVudWl0ZW1yYWRpb2AuXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tjZGtNZW51XScsXG4gIGV4cG9ydEFzOiAnY2RrTWVudScsXG4gIGhvc3Q6IHtcbiAgICAncm9sZSc6ICdtZW51JyxcbiAgICAnW2F0dHIuYXJpYS1vcmllbnRhdGlvbl0nOiAnb3JpZW50YXRpb24nLFxuICB9LFxuICBwcm92aWRlcnM6IFtcbiAgICB7cHJvdmlkZTogQ2RrTWVudUdyb3VwLCB1c2VFeGlzdGluZzogQ2RrTWVudX0sXG4gICAge3Byb3ZpZGU6IENES19NRU5VLCB1c2VFeGlzdGluZzogQ2RrTWVudX0sXG4gIF0sXG59KVxuZXhwb3J0IGNsYXNzIENka01lbnUgZXh0ZW5kcyBDZGtNZW51R3JvdXAgaW1wbGVtZW50cyBNZW51LCBBZnRlckNvbnRlbnRJbml0LCBPbkRlc3Ryb3kge1xuICAvKipcbiAgICogU2V0cyB0aGUgYXJpYS1vcmllbnRhdGlvbiBhdHRyaWJ1dGUgYW5kIGRldGVybWluZXMgd2hlcmUgbWVudXMgd2lsbCBiZSBvcGVuZWQuXG4gICAqIERvZXMgbm90IGFmZmVjdCBzdHlsaW5nL2xheW91dC5cbiAgICovXG4gIEBJbnB1dCgnY2RrTWVudU9yaWVudGF0aW9uJykgb3JpZW50YXRpb246ICdob3Jpem9udGFsJyB8ICd2ZXJ0aWNhbCcgPSAndmVydGljYWwnO1xuXG4gIC8qKiBFdmVudCBlbWl0dGVkIHdoZW4gdGhlIG1lbnUgaXMgY2xvc2VkLiAqL1xuICBAT3V0cHV0KCkgcmVhZG9ubHkgY2xvc2VkOiBFdmVudEVtaXR0ZXI8dm9pZCB8ICdjbGljaycgfCAndGFiJyB8ICdlc2NhcGUnPiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuICAvKiogTGlzdCBvZiBuZXN0ZWQgQ2RrTWVudUdyb3VwIGVsZW1lbnRzICovXG4gIEBDb250ZW50Q2hpbGRyZW4oQ2RrTWVudUdyb3VwLCB7ZGVzY2VuZGFudHM6IHRydWV9KVxuICBwcml2YXRlIHJlYWRvbmx5IF9uZXN0ZWRHcm91cHM6IFF1ZXJ5TGlzdDxDZGtNZW51R3JvdXA+O1xuXG4gIC8qKlxuICAgKiBBIHJlZmVyZW5jZSB0byB0aGUgZW5jbG9zaW5nIHBhcmVudCBtZW51IHBhbmVsLlxuICAgKlxuICAgKiBSZXF1aXJlZCB0byBiZSBzZXQgd2hlbiB1c2luZyBWaWV3RW5naW5lIHNpbmNlIFZpZXdFbmdpbmUgZG9lcyBzdXBwb3J0IGluamVjdGluZyBhIHJlZmVyZW5jZSB0b1xuICAgKiB0aGUgcGFyZW50IGRpcmVjdGl2ZSBpZiB0aGUgcGFyZW50IGRpcmVjdGl2ZSBpcyBwbGFjZWQgb24gYW4gYG5nLXRlbXBsYXRlYC4gSWYgdXNpbmcgSXZ5LCB0aGVcbiAgICogaW5qZWN0ZWQgdmFsdWUgd2lsbCBiZSB1c2VkIG92ZXIgdGhpcyBvbmUuXG4gICAqL1xuICBASW5wdXQoJ2Nka01lbnVQYW5lbCcpIHByaXZhdGUgcmVhZG9ubHkgX2V4cGxpY2l0UGFuZWw/OiBDZGtNZW51UGFuZWw7XG5cbiAgY29uc3RydWN0b3IoQE9wdGlvbmFsKCkgcHJpdmF0ZSByZWFkb25seSBfbWVudVBhbmVsPzogQ2RrTWVudVBhbmVsKSB7XG4gICAgc3VwZXIoKTtcbiAgfVxuXG4gIG5nQWZ0ZXJDb250ZW50SW5pdCgpIHtcbiAgICBzdXBlci5uZ0FmdGVyQ29udGVudEluaXQoKTtcblxuICAgIHRoaXMuX2NvbXBsZXRlQ2hhbmdlRW1pdHRlcigpO1xuICAgIHRoaXMuX3JlZ2lzdGVyV2l0aFBhcmVudFBhbmVsKCk7XG4gIH1cblxuICAvKiogUmVnaXN0ZXIgdGhpcyBtZW51IHdpdGggaXRzIGVuY2xvc2luZyBwYXJlbnQgbWVudSBwYW5lbCAqL1xuICBwcml2YXRlIF9yZWdpc3RlcldpdGhQYXJlbnRQYW5lbCgpIHtcbiAgICBjb25zdCBwYXJlbnQgPSB0aGlzLl9nZXRNZW51UGFuZWwoKTtcbiAgICBpZiAocGFyZW50KSB7XG4gICAgICBwYXJlbnQuX3JlZ2lzdGVyTWVudSh0aGlzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3dNaXNzaW5nTWVudVBhbmVsRXJyb3IoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBlbmNsb3NpbmcgQ2RrTWVudVBhbmVsIGRlZmF1bHRpbmcgdG8gdGhlIGluamVjdGVkIHJlZmVyZW5jZSBvdmVyIHRoZSBkZXZlbG9wZXJcbiAgICogcHJvdmlkZWQgcmVmZXJlbmNlLlxuICAgKi9cbiAgcHJpdmF0ZSBfZ2V0TWVudVBhbmVsKCkge1xuICAgIHJldHVybiB0aGlzLl9tZW51UGFuZWwgfHwgdGhpcy5fZXhwbGljaXRQYW5lbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb21wbGV0ZSB0aGUgY2hhbmdlIGVtaXR0ZXIgaWYgdGhlcmUgYXJlIGFueSBuZXN0ZWQgTWVudUdyb3VwcyBvciByZWdpc3RlciB0byBjb21wbGV0ZSB0aGVcbiAgICogY2hhbmdlIGVtaXR0ZXIgaWYgYSBNZW51R3JvdXAgaXMgcmVuZGVyZWQgYXQgc29tZSBwb2ludFxuICAgKi9cbiAgcHJpdmF0ZSBfY29tcGxldGVDaGFuZ2VFbWl0dGVyKCkge1xuICAgIGlmICh0aGlzLl9oYXNOZXN0ZWRHcm91cHMoKSkge1xuICAgICAgdGhpcy5jaGFuZ2UuY29tcGxldGUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fbmVzdGVkR3JvdXBzLmNoYW5nZXMucGlwZSh0YWtlKDEpKS5zdWJzY3JpYmUoKCkgPT4gdGhpcy5jaGFuZ2UuY29tcGxldGUoKSk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFJldHVybiB0cnVlIGlmIHRoZXJlIGFyZSBuZXN0ZWQgQ2RrTWVudUdyb3VwIGVsZW1lbnRzIHdpdGhpbiB0aGUgTWVudSAqL1xuICBwcml2YXRlIF9oYXNOZXN0ZWRHcm91cHMoKSB7XG4gICAgLy8gdmlldyBlbmdpbmUgaGFzIGEgYnVnIHdoZXJlIEBDb250ZW50Q2hpbGRyZW4gd2lsbCByZXR1cm4gdGhlIGN1cnJlbnQgZWxlbWVudFxuICAgIC8vIGFsb25nIHdpdGggY2hpbGRyZW4gaWYgdGhlIHNlbGVjdG9ycyBtYXRjaCAtIG5vdCBqdXN0IHRoZSBjaGlsZHJlbi5cbiAgICAvLyBIZXJlLCBpZiB0aGVyZSBpcyBhdCBsZWFzdCBvbmUgZWxlbWVudCwgd2UgY2hlY2sgdG8gc2VlIGlmIHRoZSBmaXJzdCBlbGVtZW50IGlzIGEgQ2RrTWVudSBpblxuICAgIC8vIG9yZGVyIHRvIGVuc3VyZSB0aGF0IHdlIHJldHVybiB0cnVlIGlmZiB0aGVyZSBhcmUgY2hpbGQgQ2RrTWVudUdyb3VwIGVsZW1lbnRzLlxuICAgIHJldHVybiB0aGlzLl9uZXN0ZWRHcm91cHMubGVuZ3RoID4gMCAmJiAhKHRoaXMuX25lc3RlZEdyb3Vwcy5maXJzdCBpbnN0YW5jZW9mIENka01lbnUpO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgdGhpcy5fZW1pdENsb3NlZEV2ZW50KCk7XG4gIH1cblxuICAvKiogRW1pdCBhbmQgY29tcGxldGUgdGhlIGNsb3NlZCBldmVudCBlbWl0dGVyICovXG4gIHByaXZhdGUgX2VtaXRDbG9zZWRFdmVudCgpIHtcbiAgICB0aGlzLmNsb3NlZC5uZXh0KCk7XG4gICAgdGhpcy5jbG9zZWQuY29tcGxldGUoKTtcbiAgfVxufVxuIl19