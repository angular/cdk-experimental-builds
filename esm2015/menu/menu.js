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
             * Sets the aria-orientation attribute and determines where sub-menus will be opened.
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL21lbnUvbWVudS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQ0wsU0FBUyxFQUNULEtBQUssRUFDTCxNQUFNLEVBQ04sWUFBWSxFQUNaLFNBQVMsRUFDVCxlQUFlLEVBR2YsUUFBUSxHQUNULE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBQyxJQUFJLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUNwQyxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sY0FBYyxDQUFDO0FBQzFDLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFDMUMsT0FBTyxFQUFPLFFBQVEsRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBQ2hELE9BQU8sRUFBQywwQkFBMEIsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUV6RDs7Ozs7O0dBTUc7QUFDSDtJQUFBLE1BWWEsT0FBUSxTQUFRLFlBQVk7UUF1QnZDLFlBQXlDLFVBQXlCO1lBQ2hFLEtBQUssRUFBRSxDQUFDO1lBRCtCLGVBQVUsR0FBVixVQUFVLENBQWU7WUF0QmxFOzs7ZUFHRztZQUMwQixnQkFBVyxHQUE4QixVQUFVLENBQUM7WUFFakYsNkNBQTZDO1lBQzFCLFdBQU0sR0FBb0QsSUFBSSxZQUFZLEVBQUUsQ0FBQztRQWlCaEcsQ0FBQztRQUVELGtCQUFrQjtZQUNoQixLQUFLLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztZQUUzQixJQUFJLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztZQUM5QixJQUFJLENBQUMsd0JBQXdCLEVBQUUsQ0FBQztRQUNsQyxDQUFDO1FBRUQsOERBQThEO1FBQ3RELHdCQUF3QjtZQUM5QixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDcEMsSUFBSSxNQUFNLEVBQUU7Z0JBQ1YsTUFBTSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUM1QjtpQkFBTTtnQkFDTCwwQkFBMEIsRUFBRSxDQUFDO2FBQzlCO1FBQ0gsQ0FBQztRQUVEOzs7V0FHRztRQUNLLGFBQWE7WUFDbkIsT0FBTyxJQUFJLENBQUMsVUFBVSxJQUFJLElBQUksQ0FBQyxjQUFjLENBQUM7UUFDaEQsQ0FBQztRQUVEOzs7V0FHRztRQUNLLHNCQUFzQjtZQUM1QixJQUFJLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFO2dCQUMzQixJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDO2FBQ3hCO2lCQUFNO2dCQUNMLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO2FBQ2xGO1FBQ0gsQ0FBQztRQUVELDRFQUE0RTtRQUNwRSxnQkFBZ0I7WUFDdEIsK0VBQStFO1lBQy9FLHNFQUFzRTtZQUN0RSwrRkFBK0Y7WUFDL0YsaUZBQWlGO1lBQ2pGLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssWUFBWSxPQUFPLENBQUMsQ0FBQztRQUN6RixDQUFDO1FBRUQsV0FBVztZQUNULElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBQzFCLENBQUM7UUFFRCxpREFBaUQ7UUFDekMsZ0JBQWdCO1lBQ3RCLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDbkIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUN6QixDQUFDOzs7Z0JBN0ZGLFNBQVMsU0FBQztvQkFDVCxRQUFRLEVBQUUsV0FBVztvQkFDckIsUUFBUSxFQUFFLFNBQVM7b0JBQ25CLElBQUksRUFBRTt3QkFDSixNQUFNLEVBQUUsTUFBTTt3QkFDZCx5QkFBeUIsRUFBRSxhQUFhO3FCQUN6QztvQkFDRCxTQUFTLEVBQUU7d0JBQ1QsRUFBQyxPQUFPLEVBQUUsWUFBWSxFQUFFLFdBQVcsRUFBRSxPQUFPLEVBQUM7d0JBQzdDLEVBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsT0FBTyxFQUFDO3FCQUMxQztpQkFDRjs7O2dCQXRCTyxZQUFZLHVCQThDTCxRQUFROzs7OEJBbEJwQixLQUFLLFNBQUMsb0JBQW9CO3lCQUcxQixNQUFNO2dDQUdOLGVBQWUsU0FBQyxZQUFZLEVBQUUsRUFBQyxXQUFXLEVBQUUsSUFBSSxFQUFDO2lDQVVqRCxLQUFLLFNBQUMsY0FBYzs7SUE2RHZCLGNBQUM7S0FBQTtTQWxGWSxPQUFPIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7XG4gIERpcmVjdGl2ZSxcbiAgSW5wdXQsXG4gIE91dHB1dCxcbiAgRXZlbnRFbWl0dGVyLFxuICBRdWVyeUxpc3QsXG4gIENvbnRlbnRDaGlsZHJlbixcbiAgQWZ0ZXJDb250ZW50SW5pdCxcbiAgT25EZXN0cm95LFxuICBPcHRpb25hbCxcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge3Rha2V9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7Q2RrTWVudUdyb3VwfSBmcm9tICcuL21lbnUtZ3JvdXAnO1xuaW1wb3J0IHtDZGtNZW51UGFuZWx9IGZyb20gJy4vbWVudS1wYW5lbCc7XG5pbXBvcnQge01lbnUsIENES19NRU5VfSBmcm9tICcuL21lbnUtaW50ZXJmYWNlJztcbmltcG9ydCB7dGhyb3dNaXNzaW5nTWVudVBhbmVsRXJyb3J9IGZyb20gJy4vbWVudS1lcnJvcnMnO1xuXG4vKipcbiAqIERpcmVjdGl2ZSB3aGljaCBjb25maWd1cmVzIHRoZSBlbGVtZW50IGFzIGEgTWVudSB3aGljaCBzaG91bGQgY29udGFpbiBjaGlsZCBlbGVtZW50cyBtYXJrZWQgYXNcbiAqIENka01lbnVJdGVtIG9yIENka01lbnVHcm91cC4gU2V0cyB0aGUgYXBwcm9wcmlhdGUgcm9sZSBhbmQgYXJpYS1hdHRyaWJ1dGVzIGZvciBhIG1lbnUgYW5kXG4gKiBjb250YWlucyBhY2Nlc3NpYmxlIGtleWJvYXJkIGFuZCBtb3VzZSBoYW5kbGluZyBsb2dpYy5cbiAqXG4gKiBJdCBhbHNvIGFjdHMgYXMgYSBSYWRpb0dyb3VwIGZvciBlbGVtZW50cyBtYXJrZWQgd2l0aCByb2xlIGBtZW51aXRlbXJhZGlvYC5cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW2Nka01lbnVdJyxcbiAgZXhwb3J0QXM6ICdjZGtNZW51JyxcbiAgaG9zdDoge1xuICAgICdyb2xlJzogJ21lbnUnLFxuICAgICdbYXR0ci5hcmlhLW9yaWVudGF0aW9uXSc6ICdvcmllbnRhdGlvbicsXG4gIH0sXG4gIHByb3ZpZGVyczogW1xuICAgIHtwcm92aWRlOiBDZGtNZW51R3JvdXAsIHVzZUV4aXN0aW5nOiBDZGtNZW51fSxcbiAgICB7cHJvdmlkZTogQ0RLX01FTlUsIHVzZUV4aXN0aW5nOiBDZGtNZW51fSxcbiAgXSxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrTWVudSBleHRlbmRzIENka01lbnVHcm91cCBpbXBsZW1lbnRzIE1lbnUsIEFmdGVyQ29udGVudEluaXQsIE9uRGVzdHJveSB7XG4gIC8qKlxuICAgKiBTZXRzIHRoZSBhcmlhLW9yaWVudGF0aW9uIGF0dHJpYnV0ZSBhbmQgZGV0ZXJtaW5lcyB3aGVyZSBzdWItbWVudXMgd2lsbCBiZSBvcGVuZWQuXG4gICAqIERvZXMgbm90IGFmZmVjdCBzdHlsaW5nL2xheW91dC5cbiAgICovXG4gIEBJbnB1dCgnY2RrTWVudU9yaWVudGF0aW9uJykgb3JpZW50YXRpb246ICdob3Jpem9udGFsJyB8ICd2ZXJ0aWNhbCcgPSAndmVydGljYWwnO1xuXG4gIC8qKiBFdmVudCBlbWl0dGVkIHdoZW4gdGhlIG1lbnUgaXMgY2xvc2VkLiAqL1xuICBAT3V0cHV0KCkgcmVhZG9ubHkgY2xvc2VkOiBFdmVudEVtaXR0ZXI8dm9pZCB8ICdjbGljaycgfCAndGFiJyB8ICdlc2NhcGUnPiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuICAvKiogTGlzdCBvZiBuZXN0ZWQgQ2RrTWVudUdyb3VwIGVsZW1lbnRzICovXG4gIEBDb250ZW50Q2hpbGRyZW4oQ2RrTWVudUdyb3VwLCB7ZGVzY2VuZGFudHM6IHRydWV9KVxuICBwcml2YXRlIHJlYWRvbmx5IF9uZXN0ZWRHcm91cHM6IFF1ZXJ5TGlzdDxDZGtNZW51R3JvdXA+O1xuXG4gIC8qKlxuICAgKiBBIHJlZmVyZW5jZSB0byB0aGUgZW5jbG9zaW5nIHBhcmVudCBtZW51IHBhbmVsLlxuICAgKlxuICAgKiBSZXF1aXJlZCB0byBiZSBzZXQgd2hlbiB1c2luZyBWaWV3RW5naW5lIHNpbmNlIFZpZXdFbmdpbmUgZG9lcyBzdXBwb3J0IGluamVjdGluZyBhIHJlZmVyZW5jZSB0b1xuICAgKiB0aGUgcGFyZW50IGRpcmVjdGl2ZSBpZiB0aGUgcGFyZW50IGRpcmVjdGl2ZSBpcyBwbGFjZWQgb24gYW4gYG5nLXRlbXBsYXRlYC4gSWYgdXNpbmcgSXZ5LCB0aGVcbiAgICogaW5qZWN0ZWQgdmFsdWUgd2lsbCBiZSB1c2VkIG92ZXIgdGhpcyBvbmUuXG4gICAqL1xuICBASW5wdXQoJ2Nka01lbnVQYW5lbCcpIHByaXZhdGUgcmVhZG9ubHkgX2V4cGxpY2l0UGFuZWw/OiBDZGtNZW51UGFuZWw7XG5cbiAgY29uc3RydWN0b3IoQE9wdGlvbmFsKCkgcHJpdmF0ZSByZWFkb25seSBfbWVudVBhbmVsPzogQ2RrTWVudVBhbmVsKSB7XG4gICAgc3VwZXIoKTtcbiAgfVxuXG4gIG5nQWZ0ZXJDb250ZW50SW5pdCgpIHtcbiAgICBzdXBlci5uZ0FmdGVyQ29udGVudEluaXQoKTtcblxuICAgIHRoaXMuX2NvbXBsZXRlQ2hhbmdlRW1pdHRlcigpO1xuICAgIHRoaXMuX3JlZ2lzdGVyV2l0aFBhcmVudFBhbmVsKCk7XG4gIH1cblxuICAvKiogUmVnaXN0ZXIgdGhpcyBtZW51IHdpdGggaXRzIGVuY2xvc2luZyBwYXJlbnQgbWVudSBwYW5lbCAqL1xuICBwcml2YXRlIF9yZWdpc3RlcldpdGhQYXJlbnRQYW5lbCgpIHtcbiAgICBjb25zdCBwYXJlbnQgPSB0aGlzLl9nZXRNZW51UGFuZWwoKTtcbiAgICBpZiAocGFyZW50KSB7XG4gICAgICBwYXJlbnQuX3JlZ2lzdGVyTWVudSh0aGlzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3dNaXNzaW5nTWVudVBhbmVsRXJyb3IoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBlbmNsb3NpbmcgQ2RrTWVudVBhbmVsIGRlZmF1bHRpbmcgdG8gdGhlIGluamVjdGVkIHJlZmVyZW5jZSBvdmVyIHRoZSBkZXZlbG9wZXJcbiAgICogcHJvdmlkZWQgcmVmZXJlbmNlLlxuICAgKi9cbiAgcHJpdmF0ZSBfZ2V0TWVudVBhbmVsKCkge1xuICAgIHJldHVybiB0aGlzLl9tZW51UGFuZWwgfHwgdGhpcy5fZXhwbGljaXRQYW5lbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb21wbGV0ZSB0aGUgY2hhbmdlIGVtaXR0ZXIgaWYgdGhlcmUgYXJlIGFueSBuZXN0ZWQgTWVudUdyb3VwcyBvciByZWdpc3RlciB0byBjb21wbGV0ZSB0aGVcbiAgICogY2hhbmdlIGVtaXR0ZXIgaWYgYSBNZW51R3JvdXAgaXMgcmVuZGVyZWQgYXQgc29tZSBwb2ludFxuICAgKi9cbiAgcHJpdmF0ZSBfY29tcGxldGVDaGFuZ2VFbWl0dGVyKCkge1xuICAgIGlmICh0aGlzLl9oYXNOZXN0ZWRHcm91cHMoKSkge1xuICAgICAgdGhpcy5jaGFuZ2UuY29tcGxldGUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fbmVzdGVkR3JvdXBzLmNoYW5nZXMucGlwZSh0YWtlKDEpKS5zdWJzY3JpYmUoKCkgPT4gdGhpcy5jaGFuZ2UuY29tcGxldGUoKSk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFJldHVybiB0cnVlIGlmIHRoZXJlIGFyZSBuZXN0ZWQgQ2RrTWVudUdyb3VwIGVsZW1lbnRzIHdpdGhpbiB0aGUgTWVudSAqL1xuICBwcml2YXRlIF9oYXNOZXN0ZWRHcm91cHMoKSB7XG4gICAgLy8gdmlldyBlbmdpbmUgaGFzIGEgYnVnIHdoZXJlIEBDb250ZW50Q2hpbGRyZW4gd2lsbCByZXR1cm4gdGhlIGN1cnJlbnQgZWxlbWVudFxuICAgIC8vIGFsb25nIHdpdGggY2hpbGRyZW4gaWYgdGhlIHNlbGVjdG9ycyBtYXRjaCAtIG5vdCBqdXN0IHRoZSBjaGlsZHJlbi5cbiAgICAvLyBIZXJlLCBpZiB0aGVyZSBpcyBhdCBsZWFzdCBvbmUgZWxlbWVudCwgd2UgY2hlY2sgdG8gc2VlIGlmIHRoZSBmaXJzdCBlbGVtZW50IGlzIGEgQ2RrTWVudSBpblxuICAgIC8vIG9yZGVyIHRvIGVuc3VyZSB0aGF0IHdlIHJldHVybiB0cnVlIGlmZiB0aGVyZSBhcmUgY2hpbGQgQ2RrTWVudUdyb3VwIGVsZW1lbnRzLlxuICAgIHJldHVybiB0aGlzLl9uZXN0ZWRHcm91cHMubGVuZ3RoID4gMCAmJiAhKHRoaXMuX25lc3RlZEdyb3Vwcy5maXJzdCBpbnN0YW5jZW9mIENka01lbnUpO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgdGhpcy5fZW1pdENsb3NlZEV2ZW50KCk7XG4gIH1cblxuICAvKiogRW1pdCBhbmQgY29tcGxldGUgdGhlIGNsb3NlZCBldmVudCBlbWl0dGVyICovXG4gIHByaXZhdGUgX2VtaXRDbG9zZWRFdmVudCgpIHtcbiAgICB0aGlzLmNsb3NlZC5uZXh0KCk7XG4gICAgdGhpcy5jbG9zZWQuY29tcGxldGUoKTtcbiAgfVxufVxuIl19