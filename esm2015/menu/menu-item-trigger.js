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
            /** Emits when the attached menu is requested to open */
            this.opened = new EventEmitter();
            /** Emits when the attached menu is requested to close */
            this.closed = new EventEmitter();
            /** A reference to the overlay which manages the triggered menu */
            this._overlayRef = null;
        }
        /** Open/close the attached menu if the trigger has been configured with one */
        toggle() {
            if (this.hasMenu()) {
                this.isMenuOpen() ? this._closeMenu() : this._openMenu();
            }
        }
        /** Return true if the trigger has an attached menu */
        hasMenu() {
            return !!this._menuPanel;
        }
        /** Whether the menu this button is a trigger for is open */
        isMenuOpen() {
            return this._overlayRef ? this._overlayRef.hasAttached() : false;
        }
        /** Open the attached menu */
        _openMenu() {
            this.opened.next();
            this._overlayRef = this._overlay.create(this._getOverlayConfig());
            this._overlayRef.attach(this._getPortal());
        }
        /** Close the opened menu */
        _closeMenu() {
            if (this.isMenuOpen()) {
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
        /** Build the position strategy for the overlay which specifies where to place the menu */
        _getOverlayPositionStrategy() {
            return this._overlay
                .position()
                .flexibleConnectedTo(this._elementRef)
                .withPositions(this._getOverlayPositions());
        }
        /** Determine and return where to position the opened menu relative to the menu item */
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
                        '[attr.aria-expanded]': 'isMenuOpen()',
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1pdGVtLXRyaWdnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrLWV4cGVyaW1lbnRhbC9tZW51L21lbnUtaXRlbS10cmlnZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFDTCxTQUFTLEVBQ1QsS0FBSyxFQUNMLE1BQU0sRUFDTixZQUFZLEVBQ1osVUFBVSxFQUNWLGdCQUFnQixFQUNoQixNQUFNLEdBRVAsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQ2pELE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUNuRCxPQUFPLEVBRUwsT0FBTyxFQUNQLGFBQWEsR0FHZCxNQUFNLHNCQUFzQixDQUFDO0FBQzlCLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFDMUMsT0FBTyxFQUFPLFFBQVEsRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBRWhEOzs7Ozs7OztHQVFHO0FBQ0g7SUFBQSxNQVFhLGtCQUFrQjtRQWdCN0IsWUFDbUIsV0FBb0MsRUFDbEMsaUJBQW1DLEVBQ3JDLFFBQWlCLEVBQ2pCLGVBQStCLEVBQ2IsV0FBaUI7WUFKbkMsZ0JBQVcsR0FBWCxXQUFXLENBQXlCO1lBQ2xDLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBa0I7WUFDckMsYUFBUSxHQUFSLFFBQVEsQ0FBUztZQUNqQixvQkFBZSxHQUFmLGVBQWUsQ0FBZ0I7WUFDYixnQkFBVyxHQUFYLFdBQVcsQ0FBTTtZQWpCdEQsd0RBQXdEO1lBQ3RCLFdBQU0sR0FBdUIsSUFBSSxZQUFZLEVBQUUsQ0FBQztZQUVsRix5REFBeUQ7WUFDdkIsV0FBTSxHQUF1QixJQUFJLFlBQVksRUFBRSxDQUFDO1lBRWxGLGtFQUFrRTtZQUMxRCxnQkFBVyxHQUFzQixJQUFJLENBQUM7UUFXM0MsQ0FB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U0FBQyxRQUFROzs7NkJBbkJqQixLQUFLLFNBQUMsbUJBQW1CO3lCQUd6QixNQUFNLFNBQUMsZUFBZTt5QkFHdEIsTUFBTSxTQUFDLGVBQWU7O0lBOEd6Qix5QkFBQztLQUFBO1NBdEhZLGtCQUFrQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1xuICBEaXJlY3RpdmUsXG4gIElucHV0LFxuICBPdXRwdXQsXG4gIEV2ZW50RW1pdHRlcixcbiAgRWxlbWVudFJlZixcbiAgVmlld0NvbnRhaW5lclJlZixcbiAgSW5qZWN0LFxuICBPbkRlc3Ryb3ksXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtEaXJlY3Rpb25hbGl0eX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2JpZGknO1xuaW1wb3J0IHtUZW1wbGF0ZVBvcnRhbH0gZnJvbSAnQGFuZ3VsYXIvY2RrL3BvcnRhbCc7XG5pbXBvcnQge1xuICBPdmVybGF5UmVmLFxuICBPdmVybGF5LFxuICBPdmVybGF5Q29uZmlnLFxuICBDb25uZWN0ZWRQb3NpdGlvbixcbiAgRmxleGlibGVDb25uZWN0ZWRQb3NpdGlvblN0cmF0ZWd5LFxufSBmcm9tICdAYW5ndWxhci9jZGsvb3ZlcmxheSc7XG5pbXBvcnQge0Nka01lbnVQYW5lbH0gZnJvbSAnLi9tZW51LXBhbmVsJztcbmltcG9ydCB7TWVudSwgQ0RLX01FTlV9IGZyb20gJy4vbWVudS1pbnRlcmZhY2UnO1xuXG4vKipcbiAqIEEgZGlyZWN0aXZlIHRvIGJlIGNvbWJpbmVkIHdpdGggQ2RrTWVudUl0ZW0gd2hpY2ggb3BlbnMgdGhlIE1lbnUgaXQgaXMgYm91bmQgdG8uIElmIHRoZVxuICogZWxlbWVudCBpcyBpbiBhIHRvcCBsZXZlbCBNZW51QmFyIGl0IHdpbGwgb3BlbiB0aGUgbWVudSBvbiBjbGljaywgb3IgaWYgYSBzaWJsaW5nIGlzIGFscmVhZHlcbiAqIG9wZW5lZCBpdCB3aWxsIG9wZW4gb24gaG92ZXIuIElmIGl0IGlzIGluc2lkZSBvZiBhIE1lbnUgaXQgd2lsbCBvcGVuIHRoZSBhdHRhY2hlZCBTdWJtZW51IG9uXG4gKiBob3ZlciByZWdhcmRsZXNzIG9mIGl0cyBzaWJsaW5nIHN0YXRlLlxuICpcbiAqIFRoZSBkaXJlY3RpdmUgbXVzdCBiZSBwbGFjZWQgYWxvbmcgd2l0aCB0aGUgYGNka01lbnVJdGVtYCBkaXJlY3RpdmUgaW4gb3JkZXIgdG8gZW5hYmxlIGZ1bGxcbiAqIGZ1bmN0aW9uYWxpdHkuXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tjZGtNZW51SXRlbV1bY2RrTWVudVRyaWdnZXJGb3JdJyxcbiAgZXhwb3J0QXM6ICdjZGtNZW51VHJpZ2dlckZvcicsXG4gIGhvc3Q6IHtcbiAgICAnYXJpYS1oYXNwb3B1cCc6ICdtZW51JyxcbiAgICAnW2F0dHIuYXJpYS1leHBhbmRlZF0nOiAnaXNNZW51T3BlbigpJyxcbiAgfSxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrTWVudUl0ZW1UcmlnZ2VyIGltcGxlbWVudHMgT25EZXN0cm95IHtcbiAgLyoqIFRlbXBsYXRlIHJlZmVyZW5jZSB2YXJpYWJsZSB0byB0aGUgbWVudSB0aGlzIHRyaWdnZXIgb3BlbnMgKi9cbiAgQElucHV0KCdjZGtNZW51VHJpZ2dlckZvcicpIF9tZW51UGFuZWw/OiBDZGtNZW51UGFuZWw7XG5cbiAgLyoqIEVtaXRzIHdoZW4gdGhlIGF0dGFjaGVkIG1lbnUgaXMgcmVxdWVzdGVkIHRvIG9wZW4gKi9cbiAgQE91dHB1dCgnY2RrTWVudU9wZW5lZCcpIHJlYWRvbmx5IG9wZW5lZDogRXZlbnRFbWl0dGVyPHZvaWQ+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4gIC8qKiBFbWl0cyB3aGVuIHRoZSBhdHRhY2hlZCBtZW51IGlzIHJlcXVlc3RlZCB0byBjbG9zZSAqL1xuICBAT3V0cHV0KCdjZGtNZW51Q2xvc2VkJykgcmVhZG9ubHkgY2xvc2VkOiBFdmVudEVtaXR0ZXI8dm9pZD4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG5cbiAgLyoqIEEgcmVmZXJlbmNlIHRvIHRoZSBvdmVybGF5IHdoaWNoIG1hbmFnZXMgdGhlIHRyaWdnZXJlZCBtZW51ICovXG4gIHByaXZhdGUgX292ZXJsYXlSZWY6IE92ZXJsYXlSZWYgfCBudWxsID0gbnVsbDtcblxuICAvKiogVGhlIGNvbnRlbnQgb2YgdGhlIG1lbnUgcGFuZWwgb3BlbmVkIGJ5IHRoaXMgdHJpZ2dlci4gKi9cbiAgcHJpdmF0ZSBfcGFuZWxDb250ZW50OiBUZW1wbGF0ZVBvcnRhbDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIHJlYWRvbmx5IF9lbGVtZW50UmVmOiBFbGVtZW50UmVmPEhUTUxFbGVtZW50PixcbiAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgX3ZpZXdDb250YWluZXJSZWY6IFZpZXdDb250YWluZXJSZWYsXG4gICAgcHJpdmF0ZSByZWFkb25seSBfb3ZlcmxheTogT3ZlcmxheSxcbiAgICBwcml2YXRlIHJlYWRvbmx5IF9kaXJlY3Rpb25hbGl0eTogRGlyZWN0aW9uYWxpdHksXG4gICAgQEluamVjdChDREtfTUVOVSkgcHJpdmF0ZSByZWFkb25seSBfcGFyZW50TWVudTogTWVudVxuICApIHt9XG5cbiAgLyoqIE9wZW4vY2xvc2UgdGhlIGF0dGFjaGVkIG1lbnUgaWYgdGhlIHRyaWdnZXIgaGFzIGJlZW4gY29uZmlndXJlZCB3aXRoIG9uZSAqL1xuICB0b2dnbGUoKSB7XG4gICAgaWYgKHRoaXMuaGFzTWVudSgpKSB7XG4gICAgICB0aGlzLmlzTWVudU9wZW4oKSA/IHRoaXMuX2Nsb3NlTWVudSgpIDogdGhpcy5fb3Blbk1lbnUoKTtcbiAgICB9XG4gIH1cblxuICAvKiogUmV0dXJuIHRydWUgaWYgdGhlIHRyaWdnZXIgaGFzIGFuIGF0dGFjaGVkIG1lbnUgKi9cbiAgaGFzTWVudSgpIHtcbiAgICByZXR1cm4gISF0aGlzLl9tZW51UGFuZWw7XG4gIH1cblxuICAvKiogV2hldGhlciB0aGUgbWVudSB0aGlzIGJ1dHRvbiBpcyBhIHRyaWdnZXIgZm9yIGlzIG9wZW4gKi9cbiAgaXNNZW51T3BlbigpIHtcbiAgICByZXR1cm4gdGhpcy5fb3ZlcmxheVJlZiA/IHRoaXMuX292ZXJsYXlSZWYuaGFzQXR0YWNoZWQoKSA6IGZhbHNlO1xuICB9XG5cbiAgLyoqIE9wZW4gdGhlIGF0dGFjaGVkIG1lbnUgKi9cbiAgcHJpdmF0ZSBfb3Blbk1lbnUoKSB7XG4gICAgdGhpcy5vcGVuZWQubmV4dCgpO1xuXG4gICAgdGhpcy5fb3ZlcmxheVJlZiA9IHRoaXMuX292ZXJsYXkuY3JlYXRlKHRoaXMuX2dldE92ZXJsYXlDb25maWcoKSk7XG4gICAgdGhpcy5fb3ZlcmxheVJlZi5hdHRhY2godGhpcy5fZ2V0UG9ydGFsKCkpO1xuICB9XG5cbiAgLyoqIENsb3NlIHRoZSBvcGVuZWQgbWVudSAqL1xuICBwcml2YXRlIF9jbG9zZU1lbnUoKSB7XG4gICAgaWYgKHRoaXMuaXNNZW51T3BlbigpKSB7XG4gICAgICB0aGlzLmNsb3NlZC5uZXh0KCk7XG5cbiAgICAgIHRoaXMuX292ZXJsYXlSZWYhLmRldGFjaCgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBHZXQgdGhlIGNvbmZpZ3VyYXRpb24gb2JqZWN0IHVzZWQgdG8gY3JlYXRlIHRoZSBvdmVybGF5ICovXG4gIHByaXZhdGUgX2dldE92ZXJsYXlDb25maWcoKSB7XG4gICAgcmV0dXJuIG5ldyBPdmVybGF5Q29uZmlnKHtcbiAgICAgIHBvc2l0aW9uU3RyYXRlZ3k6IHRoaXMuX2dldE92ZXJsYXlQb3NpdGlvblN0cmF0ZWd5KCksXG4gICAgICBzY3JvbGxTdHJhdGVneTogdGhpcy5fb3ZlcmxheS5zY3JvbGxTdHJhdGVnaWVzLmJsb2NrKCksXG4gICAgICBkaXJlY3Rpb246IHRoaXMuX2RpcmVjdGlvbmFsaXR5LFxuICAgIH0pO1xuICB9XG5cbiAgLyoqIEJ1aWxkIHRoZSBwb3NpdGlvbiBzdHJhdGVneSBmb3IgdGhlIG92ZXJsYXkgd2hpY2ggc3BlY2lmaWVzIHdoZXJlIHRvIHBsYWNlIHRoZSBtZW51ICovXG4gIHByaXZhdGUgX2dldE92ZXJsYXlQb3NpdGlvblN0cmF0ZWd5KCk6IEZsZXhpYmxlQ29ubmVjdGVkUG9zaXRpb25TdHJhdGVneSB7XG4gICAgcmV0dXJuIHRoaXMuX292ZXJsYXlcbiAgICAgIC5wb3NpdGlvbigpXG4gICAgICAuZmxleGlibGVDb25uZWN0ZWRUbyh0aGlzLl9lbGVtZW50UmVmKVxuICAgICAgLndpdGhQb3NpdGlvbnModGhpcy5fZ2V0T3ZlcmxheVBvc2l0aW9ucygpKTtcbiAgfVxuXG4gIC8qKiBEZXRlcm1pbmUgYW5kIHJldHVybiB3aGVyZSB0byBwb3NpdGlvbiB0aGUgb3BlbmVkIG1lbnUgcmVsYXRpdmUgdG8gdGhlIG1lbnUgaXRlbSAqL1xuICBwcml2YXRlIF9nZXRPdmVybGF5UG9zaXRpb25zKCk6IENvbm5lY3RlZFBvc2l0aW9uW10ge1xuICAgIC8vIFRPRE86IHVzZSBhIGNvbW1vbiBwb3NpdGlvbmluZyBjb25maWcgZnJvbSAocG9zc2libHkpIGNkay9vdmVybGF5XG4gICAgcmV0dXJuIHRoaXMuX3BhcmVudE1lbnUub3JpZW50YXRpb24gPT09ICdob3Jpem9udGFsJ1xuICAgICAgPyBbXG4gICAgICAgICAge29yaWdpblg6ICdzdGFydCcsIG9yaWdpblk6ICdib3R0b20nLCBvdmVybGF5WDogJ3N0YXJ0Jywgb3ZlcmxheVk6ICd0b3AnfSxcbiAgICAgICAgICB7b3JpZ2luWDogJ3N0YXJ0Jywgb3JpZ2luWTogJ3RvcCcsIG92ZXJsYXlYOiAnc3RhcnQnLCBvdmVybGF5WTogJ2JvdHRvbSd9LFxuICAgICAgICAgIHtvcmlnaW5YOiAnZW5kJywgb3JpZ2luWTogJ2JvdHRvbScsIG92ZXJsYXlYOiAnZW5kJywgb3ZlcmxheVk6ICd0b3AnfSxcbiAgICAgICAgICB7b3JpZ2luWDogJ2VuZCcsIG9yaWdpblk6ICd0b3AnLCBvdmVybGF5WDogJ2VuZCcsIG92ZXJsYXlZOiAnYm90dG9tJ30sXG4gICAgICAgIF1cbiAgICAgIDogW1xuICAgICAgICAgIHtvcmlnaW5YOiAnZW5kJywgb3JpZ2luWTogJ3RvcCcsIG92ZXJsYXlYOiAnc3RhcnQnLCBvdmVybGF5WTogJ3RvcCd9LFxuICAgICAgICAgIHtvcmlnaW5YOiAnZW5kJywgb3JpZ2luWTogJ2JvdHRvbScsIG92ZXJsYXlYOiAnc3RhcnQnLCBvdmVybGF5WTogJ2JvdHRvbSd9LFxuICAgICAgICAgIHtvcmlnaW5YOiAnc3RhcnQnLCBvcmlnaW5ZOiAndG9wJywgb3ZlcmxheVg6ICdlbmQnLCBvdmVybGF5WTogJ3RvcCd9LFxuICAgICAgICAgIHtvcmlnaW5YOiAnc3RhcnQnLCBvcmlnaW5ZOiAnYm90dG9tJywgb3ZlcmxheVg6ICdlbmQnLCBvdmVybGF5WTogJ2JvdHRvbSd9LFxuICAgICAgICBdO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgcG9ydGFsIHRvIGJlIGF0dGFjaGVkIHRvIHRoZSBvdmVybGF5IHdoaWNoIGNvbnRhaW5zIHRoZSBtZW51LiBBbGxvd3MgZm9yIHRoZSBtZW51XG4gICAqIGNvbnRlbnQgdG8gY2hhbmdlIGR5bmFtaWNhbGx5IGFuZCBiZSByZWZsZWN0ZWQgaW4gdGhlIGFwcGxpY2F0aW9uLlxuICAgKi9cbiAgcHJpdmF0ZSBfZ2V0UG9ydGFsKCkge1xuICAgIGlmICghdGhpcy5fcGFuZWxDb250ZW50IHx8IHRoaXMuX3BhbmVsQ29udGVudC50ZW1wbGF0ZVJlZiAhPT0gdGhpcy5fbWVudVBhbmVsPy5fdGVtcGxhdGVSZWYpIHtcbiAgICAgIHRoaXMuX3BhbmVsQ29udGVudCA9IG5ldyBUZW1wbGF0ZVBvcnRhbChcbiAgICAgICAgdGhpcy5fbWVudVBhbmVsIS5fdGVtcGxhdGVSZWYsXG4gICAgICAgIHRoaXMuX3ZpZXdDb250YWluZXJSZWZcbiAgICAgICk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9wYW5lbENvbnRlbnQ7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICB0aGlzLl9kZXN0cm95T3ZlcmxheSgpO1xuICB9XG5cbiAgLyoqIERlc3Ryb3kgYW5kIHVuc2V0IHRoZSBvdmVybGF5IHJlZmVyZW5jZSBpdCBpZiBleGlzdHMgKi9cbiAgcHJpdmF0ZSBfZGVzdHJveU92ZXJsYXkoKSB7XG4gICAgaWYgKHRoaXMuX292ZXJsYXlSZWYpIHtcbiAgICAgIHRoaXMuX292ZXJsYXlSZWYuZGlzcG9zZSgpO1xuICAgICAgdGhpcy5fb3ZlcmxheVJlZiA9IG51bGw7XG4gICAgfVxuICB9XG59XG4iXX0=