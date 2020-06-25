/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, Input, Output, EventEmitter, ElementRef, ViewContainerRef, Inject, } from '@angular/core';
import { Directionality } from '@angular/cdk/bidi';
import { TemplatePortal } from '@angular/cdk/portal';
import { Overlay, OverlayConfig, } from '@angular/cdk/overlay';
import { CdkMenuPanel } from './menu-panel';
import { CDK_MENU } from './menu-interface';
/**
 * A directive to be combined with CdkMenuItem which opens the Menu it is bound to. If the
 * element is in a top level MenuBar it will open the menu on click, or if a sibling is already
 * opened it will open on hover. If it is inside of a Menu it will open the attached Submenu on
 * hover regardless of its sibling state.
 *
 * The directive must be placed along with the `cdkMenuItem` directive in order to enable full
 * functionality.
 */
let CdkMenuItemTrigger = /** @class */ (() => {
    class CdkMenuItemTrigger {
        constructor(_elementRef, _viewContainerRef, _overlay, _directionality, _parentMenu) {
            this._elementRef = _elementRef;
            this._viewContainerRef = _viewContainerRef;
            this._overlay = _overlay;
            this._directionality = _directionality;
            this._parentMenu = _parentMenu;
            /** Emits when the attached submenu is requested to open */
            this.opened = new EventEmitter();
            /** Emits when the attached submenu is requested to close  */
            this.closed = new EventEmitter();
            /** A reference to the overlay which manages the triggered submenu */
            this._overlayRef = null;
        }
        /** Open/close the attached submenu if the trigger has been configured with one */
        toggle() {
            if (this.hasSubmenu()) {
                this.isSubmenuOpen() ? this._closeSubmenu() : this._openSubmenu();
            }
        }
        /** Return true if the trigger has an attached menu */
        hasSubmenu() {
            return !!this._menuPanel;
        }
        /** Whether the submenu this button is a trigger for is open */
        isSubmenuOpen() {
            return this._overlayRef ? this._overlayRef.hasAttached() : false;
        }
        /** Open the attached submenu */
        _openSubmenu() {
            this.opened.next();
            this._overlayRef = this._overlay.create(this._getOverlayConfig());
            this._overlayRef.attach(this._getPortal());
        }
        /** Close the opened submenu */
        _closeSubmenu() {
            if (this.isSubmenuOpen()) {
                this.closed.next();
                this._overlayRef.detach();
            }
        }
        /** Get the configuration object used to create the overlay */
        _getOverlayConfig() {
            return new OverlayConfig({
                positionStrategy: this._getOverlayPositionStrategy(),
                scrollStrategy: this._overlay.scrollStrategies.block(),
                direction: this._directionality,
            });
        }
        /** Build the position strategy for the overlay which specifies where to place the submenu */
        _getOverlayPositionStrategy() {
            return this._overlay
                .position()
                .flexibleConnectedTo(this._elementRef)
                .withPositions(this._getOverlayPositions());
        }
        /** Determine and return where to position the submenu relative to the menu item */
        _getOverlayPositions() {
            // TODO: use a common positioning config from (possibly) cdk/overlay
            return this._parentMenu.orientation === 'horizontal'
                ? [
                    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' },
                    { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom' },
                    { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top' },
                    { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom' },
                ]
                : [
                    { originX: 'end', originY: 'top', overlayX: 'start', overlayY: 'top' },
                    { originX: 'end', originY: 'bottom', overlayX: 'start', overlayY: 'bottom' },
                    { originX: 'start', originY: 'top', overlayX: 'end', overlayY: 'top' },
                    { originX: 'start', originY: 'bottom', overlayX: 'end', overlayY: 'bottom' },
                ];
        }
        /**
         * Get the portal to be attached to the overlay which contains the menu. Allows for the menu
         * content to change dynamically and be reflected in the application.
         */
        _getPortal() {
            var _a;
            if (!this._panelContent || this._panelContent.templateRef !== ((_a = this._menuPanel) === null || _a === void 0 ? void 0 : _a._templateRef)) {
                this._panelContent = new TemplatePortal(this._menuPanel._templateRef, this._viewContainerRef);
            }
            return this._panelContent;
        }
        ngOnDestroy() {
            this._destroyOverlay();
        }
        /** Destroy and unset the overlay reference it if exists */
        _destroyOverlay() {
            if (this._overlayRef) {
                this._overlayRef.dispose();
                this._overlayRef = null;
            }
        }
    }
    CdkMenuItemTrigger.decorators = [
        { type: Directive, args: [{
                    selector: '[cdkMenuItem][cdkMenuTriggerFor]',
                    exportAs: 'cdkMenuTriggerFor',
                    host: {
                        'aria-haspopup': 'menu',
                        '[attr.aria-expanded]': 'isSubmenuOpen()',
                    },
                },] }
    ];
    CdkMenuItemTrigger.ctorParameters = () => [
        { type: ElementRef },
        { type: ViewContainerRef },
        { type: Overlay },
        { type: Directionality },
        { type: undefined, decorators: [{ type: Inject, args: [CDK_MENU,] }] }
    ];
    CdkMenuItemTrigger.propDecorators = {
        _menuPanel: [{ type: Input, args: ['cdkMenuTriggerFor',] }],
        opened: [{ type: Output, args: ['cdkMenuOpened',] }],
        closed: [{ type: Output, args: ['cdkMenuClosed',] }]
    };
    return CdkMenuItemTrigger;
})();
export { CdkMenuItemTrigger };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1pdGVtLXRyaWdnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrLWV4cGVyaW1lbnRhbC9tZW51L21lbnUtaXRlbS10cmlnZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFDTCxTQUFTLEVBQ1QsS0FBSyxFQUNMLE1BQU0sRUFDTixZQUFZLEVBQ1osVUFBVSxFQUNWLGdCQUFnQixFQUNoQixNQUFNLEdBRVAsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQ2pELE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUNuRCxPQUFPLEVBRUwsT0FBTyxFQUNQLGFBQWEsR0FHZCxNQUFNLHNCQUFzQixDQUFDO0FBQzlCLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFDMUMsT0FBTyxFQUFPLFFBQVEsRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBRWhEOzs7Ozs7OztHQVFHO0FBQ0g7SUFBQSxNQVFhLGtCQUFrQjtRQWdCN0IsWUFDbUIsV0FBb0MsRUFDbEMsaUJBQW1DLEVBQ3JDLFFBQWlCLEVBQ2pCLGVBQStCLEVBQ2IsV0FBaUI7WUFKbkMsZ0JBQVcsR0FBWCxXQUFXLENBQXlCO1lBQ2xDLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBa0I7WUFDckMsYUFBUSxHQUFSLFFBQVEsQ0FBUztZQUNqQixvQkFBZSxHQUFmLGVBQWUsQ0FBZ0I7WUFDYixnQkFBVyxHQUFYLFdBQVcsQ0FBTTtZQWpCdEQsMkRBQTJEO1lBQ3pCLFdBQU0sR0FBdUIsSUFBSSxZQUFZLEVBQUUsQ0FBQztZQUVsRiw2REFBNkQ7WUFDM0IsV0FBTSxHQUF1QixJQUFJLFlBQVksRUFBRSxDQUFDO1lBRWxGLHFFQUFxRTtZQUM3RCxnQkFBVyxHQUFzQixJQUFJLENBQUM7UUFXM0MsQ0FB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QU0sU0FBQyxRQUFROzs7NkJBbkJqQixLQUFLLFNBQUMsbUJBQW1CO3lCQUd6QixNQUFNLFNBQUMsZUFBZTt5QkFHdEIsTUFBTSxTQUFDLGVBQWU7O0lBOEd6Qix5QkFBQztLQUFBO1NBdEhZLGtCQUFrQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1xuICBEaXJlY3RpdmUsXG4gIElucHV0LFxuICBPdXRwdXQsXG4gIEV2ZW50RW1pdHRlcixcbiAgRWxlbWVudFJlZixcbiAgVmlld0NvbnRhaW5lclJlZixcbiAgSW5qZWN0LFxuICBPbkRlc3Ryb3ksXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtEaXJlY3Rpb25hbGl0eX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2JpZGknO1xuaW1wb3J0IHtUZW1wbGF0ZVBvcnRhbH0gZnJvbSAnQGFuZ3VsYXIvY2RrL3BvcnRhbCc7XG5pbXBvcnQge1xuICBPdmVybGF5UmVmLFxuICBPdmVybGF5LFxuICBPdmVybGF5Q29uZmlnLFxuICBDb25uZWN0ZWRQb3NpdGlvbixcbiAgRmxleGlibGVDb25uZWN0ZWRQb3NpdGlvblN0cmF0ZWd5LFxufSBmcm9tICdAYW5ndWxhci9jZGsvb3ZlcmxheSc7XG5pbXBvcnQge0Nka01lbnVQYW5lbH0gZnJvbSAnLi9tZW51LXBhbmVsJztcbmltcG9ydCB7TWVudSwgQ0RLX01FTlV9IGZyb20gJy4vbWVudS1pbnRlcmZhY2UnO1xuXG4vKipcbiAqIEEgZGlyZWN0aXZlIHRvIGJlIGNvbWJpbmVkIHdpdGggQ2RrTWVudUl0ZW0gd2hpY2ggb3BlbnMgdGhlIE1lbnUgaXQgaXMgYm91bmQgdG8uIElmIHRoZVxuICogZWxlbWVudCBpcyBpbiBhIHRvcCBsZXZlbCBNZW51QmFyIGl0IHdpbGwgb3BlbiB0aGUgbWVudSBvbiBjbGljaywgb3IgaWYgYSBzaWJsaW5nIGlzIGFscmVhZHlcbiAqIG9wZW5lZCBpdCB3aWxsIG9wZW4gb24gaG92ZXIuIElmIGl0IGlzIGluc2lkZSBvZiBhIE1lbnUgaXQgd2lsbCBvcGVuIHRoZSBhdHRhY2hlZCBTdWJtZW51IG9uXG4gKiBob3ZlciByZWdhcmRsZXNzIG9mIGl0cyBzaWJsaW5nIHN0YXRlLlxuICpcbiAqIFRoZSBkaXJlY3RpdmUgbXVzdCBiZSBwbGFjZWQgYWxvbmcgd2l0aCB0aGUgYGNka01lbnVJdGVtYCBkaXJlY3RpdmUgaW4gb3JkZXIgdG8gZW5hYmxlIGZ1bGxcbiAqIGZ1bmN0aW9uYWxpdHkuXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tjZGtNZW51SXRlbV1bY2RrTWVudVRyaWdnZXJGb3JdJyxcbiAgZXhwb3J0QXM6ICdjZGtNZW51VHJpZ2dlckZvcicsXG4gIGhvc3Q6IHtcbiAgICAnYXJpYS1oYXNwb3B1cCc6ICdtZW51JyxcbiAgICAnW2F0dHIuYXJpYS1leHBhbmRlZF0nOiAnaXNTdWJtZW51T3BlbigpJyxcbiAgfSxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrTWVudUl0ZW1UcmlnZ2VyIGltcGxlbWVudHMgT25EZXN0cm95IHtcbiAgLyoqIFRlbXBsYXRlIHJlZmVyZW5jZSB2YXJpYWJsZSB0byB0aGUgbWVudSB0aGlzIHRyaWdnZXIgb3BlbnMgKi9cbiAgQElucHV0KCdjZGtNZW51VHJpZ2dlckZvcicpIF9tZW51UGFuZWw/OiBDZGtNZW51UGFuZWw7XG5cbiAgLyoqIEVtaXRzIHdoZW4gdGhlIGF0dGFjaGVkIHN1Ym1lbnUgaXMgcmVxdWVzdGVkIHRvIG9wZW4gKi9cbiAgQE91dHB1dCgnY2RrTWVudU9wZW5lZCcpIHJlYWRvbmx5IG9wZW5lZDogRXZlbnRFbWl0dGVyPHZvaWQ+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4gIC8qKiBFbWl0cyB3aGVuIHRoZSBhdHRhY2hlZCBzdWJtZW51IGlzIHJlcXVlc3RlZCB0byBjbG9zZSAgKi9cbiAgQE91dHB1dCgnY2RrTWVudUNsb3NlZCcpIHJlYWRvbmx5IGNsb3NlZDogRXZlbnRFbWl0dGVyPHZvaWQ+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4gIC8qKiBBIHJlZmVyZW5jZSB0byB0aGUgb3ZlcmxheSB3aGljaCBtYW5hZ2VzIHRoZSB0cmlnZ2VyZWQgc3VibWVudSAqL1xuICBwcml2YXRlIF9vdmVybGF5UmVmOiBPdmVybGF5UmVmIHwgbnVsbCA9IG51bGw7XG5cbiAgLyoqIFRoZSBjb250ZW50IG9mIHRoZSBtZW51IHBhbmVsIG9wZW5lZCBieSB0aGlzIHRyaWdnZXIuICovXG4gIHByaXZhdGUgX3BhbmVsQ29udGVudDogVGVtcGxhdGVQb3J0YWw7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSByZWFkb25seSBfZWxlbWVudFJlZjogRWxlbWVudFJlZjxIVE1MRWxlbWVudD4sXG4gICAgcHJvdGVjdGVkIHJlYWRvbmx5IF92aWV3Q29udGFpbmVyUmVmOiBWaWV3Q29udGFpbmVyUmVmLFxuICAgIHByaXZhdGUgcmVhZG9ubHkgX292ZXJsYXk6IE92ZXJsYXksXG4gICAgcHJpdmF0ZSByZWFkb25seSBfZGlyZWN0aW9uYWxpdHk6IERpcmVjdGlvbmFsaXR5LFxuICAgIEBJbmplY3QoQ0RLX01FTlUpIHByaXZhdGUgcmVhZG9ubHkgX3BhcmVudE1lbnU6IE1lbnVcbiAgKSB7fVxuXG4gIC8qKiBPcGVuL2Nsb3NlIHRoZSBhdHRhY2hlZCBzdWJtZW51IGlmIHRoZSB0cmlnZ2VyIGhhcyBiZWVuIGNvbmZpZ3VyZWQgd2l0aCBvbmUgKi9cbiAgdG9nZ2xlKCkge1xuICAgIGlmICh0aGlzLmhhc1N1Ym1lbnUoKSkge1xuICAgICAgdGhpcy5pc1N1Ym1lbnVPcGVuKCkgPyB0aGlzLl9jbG9zZVN1Ym1lbnUoKSA6IHRoaXMuX29wZW5TdWJtZW51KCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFJldHVybiB0cnVlIGlmIHRoZSB0cmlnZ2VyIGhhcyBhbiBhdHRhY2hlZCBtZW51ICovXG4gIGhhc1N1Ym1lbnUoKSB7XG4gICAgcmV0dXJuICEhdGhpcy5fbWVudVBhbmVsO1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhlIHN1Ym1lbnUgdGhpcyBidXR0b24gaXMgYSB0cmlnZ2VyIGZvciBpcyBvcGVuICovXG4gIGlzU3VibWVudU9wZW4oKSB7XG4gICAgcmV0dXJuIHRoaXMuX292ZXJsYXlSZWYgPyB0aGlzLl9vdmVybGF5UmVmLmhhc0F0dGFjaGVkKCkgOiBmYWxzZTtcbiAgfVxuXG4gIC8qKiBPcGVuIHRoZSBhdHRhY2hlZCBzdWJtZW51ICovXG4gIHByaXZhdGUgX29wZW5TdWJtZW51KCkge1xuICAgIHRoaXMub3BlbmVkLm5leHQoKTtcblxuICAgIHRoaXMuX292ZXJsYXlSZWYgPSB0aGlzLl9vdmVybGF5LmNyZWF0ZSh0aGlzLl9nZXRPdmVybGF5Q29uZmlnKCkpO1xuICAgIHRoaXMuX292ZXJsYXlSZWYuYXR0YWNoKHRoaXMuX2dldFBvcnRhbCgpKTtcbiAgfVxuXG4gIC8qKiBDbG9zZSB0aGUgb3BlbmVkIHN1Ym1lbnUgKi9cbiAgcHJpdmF0ZSBfY2xvc2VTdWJtZW51KCkge1xuICAgIGlmICh0aGlzLmlzU3VibWVudU9wZW4oKSkge1xuICAgICAgdGhpcy5jbG9zZWQubmV4dCgpO1xuXG4gICAgICB0aGlzLl9vdmVybGF5UmVmIS5kZXRhY2goKTtcbiAgICB9XG4gIH1cblxuICAvKiogR2V0IHRoZSBjb25maWd1cmF0aW9uIG9iamVjdCB1c2VkIHRvIGNyZWF0ZSB0aGUgb3ZlcmxheSAqL1xuICBwcml2YXRlIF9nZXRPdmVybGF5Q29uZmlnKCkge1xuICAgIHJldHVybiBuZXcgT3ZlcmxheUNvbmZpZyh7XG4gICAgICBwb3NpdGlvblN0cmF0ZWd5OiB0aGlzLl9nZXRPdmVybGF5UG9zaXRpb25TdHJhdGVneSgpLFxuICAgICAgc2Nyb2xsU3RyYXRlZ3k6IHRoaXMuX292ZXJsYXkuc2Nyb2xsU3RyYXRlZ2llcy5ibG9jaygpLFxuICAgICAgZGlyZWN0aW9uOiB0aGlzLl9kaXJlY3Rpb25hbGl0eSxcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBCdWlsZCB0aGUgcG9zaXRpb24gc3RyYXRlZ3kgZm9yIHRoZSBvdmVybGF5IHdoaWNoIHNwZWNpZmllcyB3aGVyZSB0byBwbGFjZSB0aGUgc3VibWVudSAqL1xuICBwcml2YXRlIF9nZXRPdmVybGF5UG9zaXRpb25TdHJhdGVneSgpOiBGbGV4aWJsZUNvbm5lY3RlZFBvc2l0aW9uU3RyYXRlZ3kge1xuICAgIHJldHVybiB0aGlzLl9vdmVybGF5XG4gICAgICAucG9zaXRpb24oKVxuICAgICAgLmZsZXhpYmxlQ29ubmVjdGVkVG8odGhpcy5fZWxlbWVudFJlZilcbiAgICAgIC53aXRoUG9zaXRpb25zKHRoaXMuX2dldE92ZXJsYXlQb3NpdGlvbnMoKSk7XG4gIH1cblxuICAvKiogRGV0ZXJtaW5lIGFuZCByZXR1cm4gd2hlcmUgdG8gcG9zaXRpb24gdGhlIHN1Ym1lbnUgcmVsYXRpdmUgdG8gdGhlIG1lbnUgaXRlbSAqL1xuICBwcml2YXRlIF9nZXRPdmVybGF5UG9zaXRpb25zKCk6IENvbm5lY3RlZFBvc2l0aW9uW10ge1xuICAgIC8vIFRPRE86IHVzZSBhIGNvbW1vbiBwb3NpdGlvbmluZyBjb25maWcgZnJvbSAocG9zc2libHkpIGNkay9vdmVybGF5XG4gICAgcmV0dXJuIHRoaXMuX3BhcmVudE1lbnUub3JpZW50YXRpb24gPT09ICdob3Jpem9udGFsJ1xuICAgICAgPyBbXG4gICAgICAgICAge29yaWdpblg6ICdzdGFydCcsIG9yaWdpblk6ICdib3R0b20nLCBvdmVybGF5WDogJ3N0YXJ0Jywgb3ZlcmxheVk6ICd0b3AnfSxcbiAgICAgICAgICB7b3JpZ2luWDogJ3N0YXJ0Jywgb3JpZ2luWTogJ3RvcCcsIG92ZXJsYXlYOiAnc3RhcnQnLCBvdmVybGF5WTogJ2JvdHRvbSd9LFxuICAgICAgICAgIHtvcmlnaW5YOiAnZW5kJywgb3JpZ2luWTogJ2JvdHRvbScsIG92ZXJsYXlYOiAnZW5kJywgb3ZlcmxheVk6ICd0b3AnfSxcbiAgICAgICAgICB7b3JpZ2luWDogJ2VuZCcsIG9yaWdpblk6ICd0b3AnLCBvdmVybGF5WDogJ2VuZCcsIG92ZXJsYXlZOiAnYm90dG9tJ30sXG4gICAgICAgIF1cbiAgICAgIDogW1xuICAgICAgICAgIHtvcmlnaW5YOiAnZW5kJywgb3JpZ2luWTogJ3RvcCcsIG92ZXJsYXlYOiAnc3RhcnQnLCBvdmVybGF5WTogJ3RvcCd9LFxuICAgICAgICAgIHtvcmlnaW5YOiAnZW5kJywgb3JpZ2luWTogJ2JvdHRvbScsIG92ZXJsYXlYOiAnc3RhcnQnLCBvdmVybGF5WTogJ2JvdHRvbSd9LFxuICAgICAgICAgIHtvcmlnaW5YOiAnc3RhcnQnLCBvcmlnaW5ZOiAndG9wJywgb3ZlcmxheVg6ICdlbmQnLCBvdmVybGF5WTogJ3RvcCd9LFxuICAgICAgICAgIHtvcmlnaW5YOiAnc3RhcnQnLCBvcmlnaW5ZOiAnYm90dG9tJywgb3ZlcmxheVg6ICdlbmQnLCBvdmVybGF5WTogJ2JvdHRvbSd9LFxuICAgICAgICBdO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgcG9ydGFsIHRvIGJlIGF0dGFjaGVkIHRvIHRoZSBvdmVybGF5IHdoaWNoIGNvbnRhaW5zIHRoZSBtZW51LiBBbGxvd3MgZm9yIHRoZSBtZW51XG4gICAqIGNvbnRlbnQgdG8gY2hhbmdlIGR5bmFtaWNhbGx5IGFuZCBiZSByZWZsZWN0ZWQgaW4gdGhlIGFwcGxpY2F0aW9uLlxuICAgKi9cbiAgcHJpdmF0ZSBfZ2V0UG9ydGFsKCkge1xuICAgIGlmICghdGhpcy5fcGFuZWxDb250ZW50IHx8IHRoaXMuX3BhbmVsQ29udGVudC50ZW1wbGF0ZVJlZiAhPT0gdGhpcy5fbWVudVBhbmVsPy5fdGVtcGxhdGVSZWYpIHtcbiAgICAgIHRoaXMuX3BhbmVsQ29udGVudCA9IG5ldyBUZW1wbGF0ZVBvcnRhbChcbiAgICAgICAgdGhpcy5fbWVudVBhbmVsIS5fdGVtcGxhdGVSZWYsXG4gICAgICAgIHRoaXMuX3ZpZXdDb250YWluZXJSZWZcbiAgICAgICk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9wYW5lbENvbnRlbnQ7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICB0aGlzLl9kZXN0cm95T3ZlcmxheSgpO1xuICB9XG5cbiAgLyoqIERlc3Ryb3kgYW5kIHVuc2V0IHRoZSBvdmVybGF5IHJlZmVyZW5jZSBpdCBpZiBleGlzdHMgKi9cbiAgcHJpdmF0ZSBfZGVzdHJveU92ZXJsYXkoKSB7XG4gICAgaWYgKHRoaXMuX292ZXJsYXlSZWYpIHtcbiAgICAgIHRoaXMuX292ZXJsYXlSZWYuZGlzcG9zZSgpO1xuICAgICAgdGhpcy5fb3ZlcmxheVJlZiA9IG51bGw7XG4gICAgfVxuICB9XG59XG4iXX0=