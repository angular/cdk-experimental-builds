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
let CdkMenu = /** @class */ (() => {
    class CdkMenu extends CdkMenuGroup {
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
    return CdkMenu;
})();
export { CdkMenu };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL21lbnUvbWVudS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQ0wsU0FBUyxFQUNULEtBQUssRUFDTCxNQUFNLEVBQ04sWUFBWSxFQUNaLFNBQVMsRUFDVCxlQUFlLEVBR2YsUUFBUSxHQUNULE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBQyxJQUFJLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUNwQyxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sY0FBYyxDQUFDO0FBQzFDLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFDMUMsT0FBTyxFQUFPLFFBQVEsRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBQ2hELE9BQU8sRUFBQywwQkFBMEIsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUV6RDs7Ozs7O0dBTUc7QUFDSDtJQUFBLE1BWWEsT0FBUSxTQUFRLFlBQVk7UUF1QnZDLFlBQXlDLFVBQXlCO1lBQ2hFLEtBQUssRUFBRSxDQUFDO1lBRCtCLGVBQVUsR0FBVixVQUFVLENBQWU7WUF0QmxFOzs7ZUFHRztZQUMwQixnQkFBVyxHQUE4QixVQUFVLENBQUM7WUFFakYsNkNBQTZDO1lBQzFCLFdBQU0sR0FBb0QsSUFBSSxZQUFZLEVBQUUsQ0FBQztRQWlCaEcsQ0FBQztRQUVELGtCQUFrQjtZQUNoQixLQUFLLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztZQUUzQixJQUFJLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztZQUM5QixJQUFJLENBQUMsd0JBQXdCLEVBQUUsQ0FBQztRQUNsQyxDQUFDO1FBRUQsOERBQThEO1FBQ3RELHdCQUF3QjtZQUM5QixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDcEMsSUFBSSxNQUFNLEVBQUU7Z0JBQ1YsTUFBTSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUM1QjtpQkFBTTtnQkFDTCwwQkFBMEIsRUFBRSxDQUFDO2FBQzlCO1FBQ0gsQ0FBQztRQUVEOzs7V0FHRztRQUNLLGFBQWE7WUFDbkIsT0FBTyxJQUFJLENBQUMsVUFBVSxJQUFJLElBQUksQ0FBQyxjQUFjLENBQUM7UUFDaEQsQ0FBQztRQUVEOzs7V0FHRztRQUNLLHNCQUFzQjtZQUM1QixJQUFJLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFO2dCQUMzQixJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDO2FBQ3hCO2lCQUFNO2dCQUNMLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO2FBQ2xGO1FBQ0gsQ0FBQztRQUVELDRFQUE0RTtRQUNwRSxnQkFBZ0I7WUFDdEIsK0VBQStFO1lBQy9FLHNFQUFzRTtZQUN0RSwrRkFBK0Y7WUFDL0YsaUZBQWlGO1lBQ2pGLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssWUFBWSxPQUFPLENBQUMsQ0FBQztRQUN6RixDQUFDO1FBRUQsV0FBVztZQUNULElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBQzFCLENBQUM7UUFFRCxpREFBaUQ7UUFDekMsZ0JBQWdCO1lBQ3RCLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDbkIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUN6QixDQUFDOzs7Z0JBN0ZGLFNBQVMsU0FBQztvQkFDVCxRQUFRLEVBQUUsV0FBVztvQkFDckIsUUFBUSxFQUFFLFNBQVM7b0JBQ25CLElBQUksRUFBRTt3QkFDSixNQUFNLEVBQUUsTUFBTTt3QkFDZCx5QkFBeUIsRUFBRSxhQUFhO3FCQUN6QztvQkFDRCxTQUFTLEVBQUU7d0JBQ1QsRUFBQyxPQUFPLEVBQUUsWUFBWSxFQUFFLFdBQVcsRUFBRSxPQUFPLEVBQUM7d0JBQzdDLEVBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsT0FBTyxFQUFDO3FCQUMxQztpQkFDRjs7O2dCQXRCTyxZQUFZLHVCQThDTCxRQUFROzs7OEJBbEJwQixLQUFLLFNBQUMsb0JBQW9CO3lCQUcxQixNQUFNO2dDQUdOLGVBQWUsU0FBQyxZQUFZLEVBQUUsRUFBQyxXQUFXLEVBQUUsSUFBSSxFQUFDO2lDQVVqRCxLQUFLLFNBQUMsY0FBYzs7SUE2RHZCLGNBQUM7S0FBQTtTQWxGWSxPQUFPIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7XG4gIERpcmVjdGl2ZSxcbiAgSW5wdXQsXG4gIE91dHB1dCxcbiAgRXZlbnRFbWl0dGVyLFxuICBRdWVyeUxpc3QsXG4gIENvbnRlbnRDaGlsZHJlbixcbiAgQWZ0ZXJDb250ZW50SW5pdCxcbiAgT25EZXN0cm95LFxuICBPcHRpb25hbCxcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge3Rha2V9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7Q2RrTWVudUdyb3VwfSBmcm9tICcuL21lbnUtZ3JvdXAnO1xuaW1wb3J0IHtDZGtNZW51UGFuZWx9IGZyb20gJy4vbWVudS1wYW5lbCc7XG5pbXBvcnQge01lbnUsIENES19NRU5VfSBmcm9tICcuL21lbnUtaW50ZXJmYWNlJztcbmltcG9ydCB7dGhyb3dNaXNzaW5nTWVudVBhbmVsRXJyb3J9IGZyb20gJy4vbWVudS1lcnJvcnMnO1xuXG4vKipcbiAqIERpcmVjdGl2ZSB3aGljaCBjb25maWd1cmVzIHRoZSBlbGVtZW50IGFzIGEgTWVudSB3aGljaCBzaG91bGQgY29udGFpbiBjaGlsZCBlbGVtZW50cyBtYXJrZWQgYXNcbiAqIENka01lbnVJdGVtIG9yIENka01lbnVHcm91cC4gU2V0cyB0aGUgYXBwcm9wcmlhdGUgcm9sZSBhbmQgYXJpYS1hdHRyaWJ1dGVzIGZvciBhIG1lbnUgYW5kXG4gKiBjb250YWlucyBhY2Nlc3NpYmxlIGtleWJvYXJkIGFuZCBtb3VzZSBoYW5kbGluZyBsb2dpYy5cbiAqXG4gKiBJdCBhbHNvIGFjdHMgYXMgYSBSYWRpb0dyb3VwIGZvciBlbGVtZW50cyBtYXJrZWQgd2l0aCByb2xlIGBtZW51aXRlbXJhZGlvYC5cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW2Nka01lbnVdJyxcbiAgZXhwb3J0QXM6ICdjZGtNZW51JyxcbiAgaG9zdDoge1xuICAgICdyb2xlJzogJ21lbnUnLFxuICAgICdbYXR0ci5hcmlhLW9yaWVudGF0aW9uXSc6ICdvcmllbnRhdGlvbicsXG4gIH0sXG4gIHByb3ZpZGVyczogW1xuICAgIHtwcm92aWRlOiBDZGtNZW51R3JvdXAsIHVzZUV4aXN0aW5nOiBDZGtNZW51fSxcbiAgICB7cHJvdmlkZTogQ0RLX01FTlUsIHVzZUV4aXN0aW5nOiBDZGtNZW51fSxcbiAgXSxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrTWVudSBleHRlbmRzIENka01lbnVHcm91cCBpbXBsZW1lbnRzIE1lbnUsIEFmdGVyQ29udGVudEluaXQsIE9uRGVzdHJveSB7XG4gIC8qKlxuICAgKiBTZXRzIHRoZSBhcmlhLW9yaWVudGF0aW9uIGF0dHJpYnV0ZSBhbmQgZGV0ZXJtaW5lcyB3aGVyZSBtZW51cyB3aWxsIGJlIG9wZW5lZC5cbiAgICogRG9lcyBub3QgYWZmZWN0IHN0eWxpbmcvbGF5b3V0LlxuICAgKi9cbiAgQElucHV0KCdjZGtNZW51T3JpZW50YXRpb24nKSBvcmllbnRhdGlvbjogJ2hvcml6b250YWwnIHwgJ3ZlcnRpY2FsJyA9ICd2ZXJ0aWNhbCc7XG5cbiAgLyoqIEV2ZW50IGVtaXR0ZWQgd2hlbiB0aGUgbWVudSBpcyBjbG9zZWQuICovXG4gIEBPdXRwdXQoKSByZWFkb25seSBjbG9zZWQ6IEV2ZW50RW1pdHRlcjx2b2lkIHwgJ2NsaWNrJyB8ICd0YWInIHwgJ2VzY2FwZSc+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4gIC8qKiBMaXN0IG9mIG5lc3RlZCBDZGtNZW51R3JvdXAgZWxlbWVudHMgKi9cbiAgQENvbnRlbnRDaGlsZHJlbihDZGtNZW51R3JvdXAsIHtkZXNjZW5kYW50czogdHJ1ZX0pXG4gIHByaXZhdGUgcmVhZG9ubHkgX25lc3RlZEdyb3VwczogUXVlcnlMaXN0PENka01lbnVHcm91cD47XG5cbiAgLyoqXG4gICAqIEEgcmVmZXJlbmNlIHRvIHRoZSBlbmNsb3NpbmcgcGFyZW50IG1lbnUgcGFuZWwuXG4gICAqXG4gICAqIFJlcXVpcmVkIHRvIGJlIHNldCB3aGVuIHVzaW5nIFZpZXdFbmdpbmUgc2luY2UgVmlld0VuZ2luZSBkb2VzIHN1cHBvcnQgaW5qZWN0aW5nIGEgcmVmZXJlbmNlIHRvXG4gICAqIHRoZSBwYXJlbnQgZGlyZWN0aXZlIGlmIHRoZSBwYXJlbnQgZGlyZWN0aXZlIGlzIHBsYWNlZCBvbiBhbiBgbmctdGVtcGxhdGVgLiBJZiB1c2luZyBJdnksIHRoZVxuICAgKiBpbmplY3RlZCB2YWx1ZSB3aWxsIGJlIHVzZWQgb3ZlciB0aGlzIG9uZS5cbiAgICovXG4gIEBJbnB1dCgnY2RrTWVudVBhbmVsJykgcHJpdmF0ZSByZWFkb25seSBfZXhwbGljaXRQYW5lbD86IENka01lbnVQYW5lbDtcblxuICBjb25zdHJ1Y3RvcihAT3B0aW9uYWwoKSBwcml2YXRlIHJlYWRvbmx5IF9tZW51UGFuZWw/OiBDZGtNZW51UGFuZWwpIHtcbiAgICBzdXBlcigpO1xuICB9XG5cbiAgbmdBZnRlckNvbnRlbnRJbml0KCkge1xuICAgIHN1cGVyLm5nQWZ0ZXJDb250ZW50SW5pdCgpO1xuXG4gICAgdGhpcy5fY29tcGxldGVDaGFuZ2VFbWl0dGVyKCk7XG4gICAgdGhpcy5fcmVnaXN0ZXJXaXRoUGFyZW50UGFuZWwoKTtcbiAgfVxuXG4gIC8qKiBSZWdpc3RlciB0aGlzIG1lbnUgd2l0aCBpdHMgZW5jbG9zaW5nIHBhcmVudCBtZW51IHBhbmVsICovXG4gIHByaXZhdGUgX3JlZ2lzdGVyV2l0aFBhcmVudFBhbmVsKCkge1xuICAgIGNvbnN0IHBhcmVudCA9IHRoaXMuX2dldE1lbnVQYW5lbCgpO1xuICAgIGlmIChwYXJlbnQpIHtcbiAgICAgIHBhcmVudC5fcmVnaXN0ZXJNZW51KHRoaXMpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvd01pc3NpbmdNZW51UGFuZWxFcnJvcigpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGVuY2xvc2luZyBDZGtNZW51UGFuZWwgZGVmYXVsdGluZyB0byB0aGUgaW5qZWN0ZWQgcmVmZXJlbmNlIG92ZXIgdGhlIGRldmVsb3BlclxuICAgKiBwcm92aWRlZCByZWZlcmVuY2UuXG4gICAqL1xuICBwcml2YXRlIF9nZXRNZW51UGFuZWwoKSB7XG4gICAgcmV0dXJuIHRoaXMuX21lbnVQYW5lbCB8fCB0aGlzLl9leHBsaWNpdFBhbmVsO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbXBsZXRlIHRoZSBjaGFuZ2UgZW1pdHRlciBpZiB0aGVyZSBhcmUgYW55IG5lc3RlZCBNZW51R3JvdXBzIG9yIHJlZ2lzdGVyIHRvIGNvbXBsZXRlIHRoZVxuICAgKiBjaGFuZ2UgZW1pdHRlciBpZiBhIE1lbnVHcm91cCBpcyByZW5kZXJlZCBhdCBzb21lIHBvaW50XG4gICAqL1xuICBwcml2YXRlIF9jb21wbGV0ZUNoYW5nZUVtaXR0ZXIoKSB7XG4gICAgaWYgKHRoaXMuX2hhc05lc3RlZEdyb3VwcygpKSB7XG4gICAgICB0aGlzLmNoYW5nZS5jb21wbGV0ZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9uZXN0ZWRHcm91cHMuY2hhbmdlcy5waXBlKHRha2UoMSkpLnN1YnNjcmliZSgoKSA9PiB0aGlzLmNoYW5nZS5jb21wbGV0ZSgpKTtcbiAgICB9XG4gIH1cblxuICAvKiogUmV0dXJuIHRydWUgaWYgdGhlcmUgYXJlIG5lc3RlZCBDZGtNZW51R3JvdXAgZWxlbWVudHMgd2l0aGluIHRoZSBNZW51ICovXG4gIHByaXZhdGUgX2hhc05lc3RlZEdyb3VwcygpIHtcbiAgICAvLyB2aWV3IGVuZ2luZSBoYXMgYSBidWcgd2hlcmUgQENvbnRlbnRDaGlsZHJlbiB3aWxsIHJldHVybiB0aGUgY3VycmVudCBlbGVtZW50XG4gICAgLy8gYWxvbmcgd2l0aCBjaGlsZHJlbiBpZiB0aGUgc2VsZWN0b3JzIG1hdGNoIC0gbm90IGp1c3QgdGhlIGNoaWxkcmVuLlxuICAgIC8vIEhlcmUsIGlmIHRoZXJlIGlzIGF0IGxlYXN0IG9uZSBlbGVtZW50LCB3ZSBjaGVjayB0byBzZWUgaWYgdGhlIGZpcnN0IGVsZW1lbnQgaXMgYSBDZGtNZW51IGluXG4gICAgLy8gb3JkZXIgdG8gZW5zdXJlIHRoYXQgd2UgcmV0dXJuIHRydWUgaWZmIHRoZXJlIGFyZSBjaGlsZCBDZGtNZW51R3JvdXAgZWxlbWVudHMuXG4gICAgcmV0dXJuIHRoaXMuX25lc3RlZEdyb3Vwcy5sZW5ndGggPiAwICYmICEodGhpcy5fbmVzdGVkR3JvdXBzLmZpcnN0IGluc3RhbmNlb2YgQ2RrTWVudSk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICB0aGlzLl9lbWl0Q2xvc2VkRXZlbnQoKTtcbiAgfVxuXG4gIC8qKiBFbWl0IGFuZCBjb21wbGV0ZSB0aGUgY2xvc2VkIGV2ZW50IGVtaXR0ZXIgKi9cbiAgcHJpdmF0ZSBfZW1pdENsb3NlZEV2ZW50KCkge1xuICAgIHRoaXMuY2xvc2VkLm5leHQoKTtcbiAgICB0aGlzLmNsb3NlZC5jb21wbGV0ZSgpO1xuICB9XG59XG4iXX0=