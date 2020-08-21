/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, Input, Output, EventEmitter, ElementRef, ViewContainerRef, Inject, Optional, } from '@angular/core';
import { Directionality } from '@angular/cdk/bidi';
import { TemplatePortal } from '@angular/cdk/portal';
import { Overlay, OverlayConfig, } from '@angular/cdk/overlay';
import { SPACE, ENTER, RIGHT_ARROW, LEFT_ARROW, DOWN_ARROW, UP_ARROW } from '@angular/cdk/keycodes';
import { CDK_MENU } from './menu-interface';
import { throwExistingMenuStackError } from './menu-errors';
/**
 * A directive to be combined with CdkMenuItem which opens the Menu it is bound to. If the
 * element is in a top level MenuBar it will open the menu on click, or if a sibling is already
 * opened it will open on hover. If it is inside of a Menu it will open the attached Submenu on
 * hover regardless of its sibling state.
 *
 * The directive must be placed along with the `cdkMenuItem` directive in order to enable full
 * functionality.
 */
export class CdkMenuItemTrigger {
    constructor(_elementRef, _viewContainerRef, _overlay, _parentMenu, _directionality) {
        this._elementRef = _elementRef;
        this._viewContainerRef = _viewContainerRef;
        this._overlay = _overlay;
        this._parentMenu = _parentMenu;
        this._directionality = _directionality;
        /** Emits when the attached menu is requested to open */
        this.opened = new EventEmitter();
        /** Emits when the attached menu is requested to close */
        this.closed = new EventEmitter();
        /** A reference to the overlay which manages the triggered menu */
        this._overlayRef = null;
    }
    /** Template reference variable to the menu this trigger opens */
    get menuPanel() {
        return this._menuPanel;
    }
    set menuPanel(panel) {
        // If the provided panel already has a stack, that means it already has a trigger configured.
        // Note however that there are some edge cases where two triggers **may** share the same menu,
        // e.g. two triggers in two separate menus.
        if ((typeof ngDevMode === 'undefined' || ngDevMode) && (panel === null || panel === void 0 ? void 0 : panel._menuStack)) {
            throwExistingMenuStackError();
        }
        this._menuPanel = panel;
        if (this._menuPanel) {
            this._menuPanel._menuStack = this._getMenuStack();
        }
    }
    /** Open/close the attached menu if the trigger has been configured with one */
    toggle() {
        if (this.hasMenu()) {
            this.isMenuOpen() ? this.closeMenu() : this.openMenu();
        }
    }
    /** Open the attached menu. */
    openMenu() {
        if (!this.isMenuOpen()) {
            this.opened.next();
            this._overlayRef = this._overlayRef || this._overlay.create(this._getOverlayConfig());
            this._overlayRef.attach(this._getPortal());
        }
    }
    /** Close the opened menu. */
    closeMenu() {
        if (this.isMenuOpen()) {
            this.closed.next();
            this._overlayRef.detach();
        }
        this._closeSiblingTriggers();
    }
    /** Return true if the trigger has an attached menu */
    hasMenu() {
        return !!this.menuPanel;
    }
    /** Whether the menu this button is a trigger for is open */
    isMenuOpen() {
        return this._overlayRef ? this._overlayRef.hasAttached() : false;
    }
    /**
     * Get a reference to the rendered Menu if the Menu is open and it is visible in the DOM.
     * @return the menu if it is open, otherwise undefined.
     */
    getMenu() {
        var _a;
        return (_a = this.menuPanel) === null || _a === void 0 ? void 0 : _a._menu;
    }
    /**
     * If there are existing open menus and this menu is not open, close sibling menus and open
     * this one.
     */
    _toggleOnMouseEnter() {
        const menuStack = this._getMenuStack();
        const isSiblingMenuOpen = !(menuStack === null || menuStack === void 0 ? void 0 : menuStack.isEmpty()) && !this.isMenuOpen();
        if (isSiblingMenuOpen) {
            this._closeSiblingTriggers();
            this.openMenu();
        }
    }
    /**
     * Handles keyboard events for the menu item, specifically opening/closing the attached menu and
     * focusing the appropriate submenu item.
     * @param event the keyboard event to handle
     */
    _toggleOnKeydown(event) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
        const keyCode = event.keyCode;
        switch (keyCode) {
            case SPACE:
            case ENTER:
                event.preventDefault();
                this.toggle();
                (_b = (_a = this.menuPanel) === null || _a === void 0 ? void 0 : _a._menu) === null || _b === void 0 ? void 0 : _b.focusFirstItem('keyboard');
                break;
            case RIGHT_ARROW:
                if (this._isParentVertical()) {
                    event.preventDefault();
                    if (((_c = this._directionality) === null || _c === void 0 ? void 0 : _c.value) === 'rtl') {
                        (_d = this._getMenuStack()) === null || _d === void 0 ? void 0 : _d.close(this._parentMenu, 2 /* currentItem */);
                    }
                    else {
                        this.openMenu();
                        (_f = (_e = this.menuPanel) === null || _e === void 0 ? void 0 : _e._menu) === null || _f === void 0 ? void 0 : _f.focusFirstItem('keyboard');
                    }
                }
                break;
            case LEFT_ARROW:
                if (this._isParentVertical()) {
                    event.preventDefault();
                    if (((_g = this._directionality) === null || _g === void 0 ? void 0 : _g.value) === 'rtl') {
                        this.openMenu();
                        (_j = (_h = this.menuPanel) === null || _h === void 0 ? void 0 : _h._menu) === null || _j === void 0 ? void 0 : _j.focusFirstItem('keyboard');
                    }
                    else {
                        (_k = this._getMenuStack()) === null || _k === void 0 ? void 0 : _k.close(this._parentMenu, 2 /* currentItem */);
                    }
                }
                break;
            case DOWN_ARROW:
            case UP_ARROW:
                if (!this._isParentVertical()) {
                    event.preventDefault();
                    this.openMenu();
                    keyCode === DOWN_ARROW
                        ? (_m = (_l = this.menuPanel) === null || _l === void 0 ? void 0 : _l._menu) === null || _m === void 0 ? void 0 : _m.focusFirstItem('keyboard') : (_p = (_o = this.menuPanel) === null || _o === void 0 ? void 0 : _o._menu) === null || _p === void 0 ? void 0 : _p.focusLastItem('keyboard');
                }
                break;
        }
    }
    /** Close out any sibling menu trigger menus. */
    _closeSiblingTriggers() {
        const menuStack = this._getMenuStack();
        // If nothing was removed from the stack and the last element is not the parent item
        // that means that the parent menu is a menu bar since we don't put the menu bar on the
        // stack
        const isParentMenuBar = !(menuStack === null || menuStack === void 0 ? void 0 : menuStack.closeSubMenuOf(this._parentMenu)) && (menuStack === null || menuStack === void 0 ? void 0 : menuStack.peek()) !== this._parentMenu;
        if (isParentMenuBar) {
            menuStack === null || menuStack === void 0 ? void 0 : menuStack.closeAll();
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
        var _a, _b;
        const hasMenuContentChanged = ((_a = this.menuPanel) === null || _a === void 0 ? void 0 : _a._templateRef) !== ((_b = this._panelContent) === null || _b === void 0 ? void 0 : _b.templateRef);
        if (this.menuPanel && (!this._panelContent || hasMenuContentChanged)) {
            this._panelContent = new TemplatePortal(this.menuPanel._templateRef, this._viewContainerRef);
        }
        return this._panelContent;
    }
    /**
     * @return true if if the enclosing parent menu is configured in a vertical orientation.
     */
    _isParentVertical() {
        return this._parentMenu.orientation === 'vertical';
    }
    /** Get the menu stack from the parent. */
    _getMenuStack() {
        // We use a function since at the construction of the MenuItemTrigger the parent Menu won't have
        // its menu stack set. Therefore we need to reference the menu stack from the parent each time
        // we want to use it.
        return this._parentMenu._menuStack;
    }
    ngOnDestroy() {
        this._destroyOverlay();
        this._resetPanelMenuStack();
    }
    /** Set the menu panels menu stack back to null. */
    _resetPanelMenuStack() {
        // If a CdkMenuTrigger is placed in a submenu, each time the trigger is rendered (its parent
        // menu is opened) the panel setter for CdkMenuPanel is called. From the first render onward,
        // the attached CdkMenuPanel has the MenuStack set. Since we throw an error if a panel already
        // has a stack set, we want to reset the attached stack here to prevent the error from being
        // thrown if the trigger re-configures its attached panel (in the case where there is a 1:1
        // relationship between the panel and trigger).
        if (this._menuPanel) {
            this._menuPanel._menuStack = null;
        }
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
                selector: '[cdkMenuTriggerFor]',
                exportAs: 'cdkMenuTriggerFor',
                host: {
                    '(keydown)': '_toggleOnKeydown($event)',
                    '(mouseenter)': '_toggleOnMouseEnter()',
                    '(click)': 'toggle()',
                    'tabindex': '-1',
                    'aria-haspopup': 'menu',
                    '[attr.aria-expanded]': 'isMenuOpen()',
                },
            },] }
];
CdkMenuItemTrigger.ctorParameters = () => [
    { type: ElementRef },
    { type: ViewContainerRef },
    { type: Overlay },
    { type: undefined, decorators: [{ type: Inject, args: [CDK_MENU,] }] },
    { type: Directionality, decorators: [{ type: Optional }] }
];
CdkMenuItemTrigger.propDecorators = {
    menuPanel: [{ type: Input, args: ['cdkMenuTriggerFor',] }],
    opened: [{ type: Output, args: ['cdkMenuOpened',] }],
    closed: [{ type: Output, args: ['cdkMenuClosed',] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1pdGVtLXRyaWdnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrLWV4cGVyaW1lbnRhbC9tZW51L21lbnUtaXRlbS10cmlnZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFDTCxTQUFTLEVBQ1QsS0FBSyxFQUNMLE1BQU0sRUFDTixZQUFZLEVBQ1osVUFBVSxFQUNWLGdCQUFnQixFQUNoQixNQUFNLEVBRU4sUUFBUSxHQUNULE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUNqRCxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDbkQsT0FBTyxFQUVMLE9BQU8sRUFDUCxhQUFhLEdBR2QsTUFBTSxzQkFBc0IsQ0FBQztBQUM5QixPQUFPLEVBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUVsRyxPQUFPLEVBQU8sUUFBUSxFQUFDLE1BQU0sa0JBQWtCLENBQUM7QUFFaEQsT0FBTyxFQUFDLDJCQUEyQixFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRTFEOzs7Ozs7OztHQVFHO0FBYUgsTUFBTSxPQUFPLGtCQUFrQjtJQW1DN0IsWUFDbUIsV0FBb0MsRUFDbEMsaUJBQW1DLEVBQ3JDLFFBQWlCLEVBQ0MsV0FBaUIsRUFDdkIsZUFBZ0M7UUFKNUMsZ0JBQVcsR0FBWCxXQUFXLENBQXlCO1FBQ2xDLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBa0I7UUFDckMsYUFBUSxHQUFSLFFBQVEsQ0FBUztRQUNDLGdCQUFXLEdBQVgsV0FBVyxDQUFNO1FBQ3ZCLG9CQUFlLEdBQWYsZUFBZSxDQUFpQjtRQWpCL0Qsd0RBQXdEO1FBQ3RCLFdBQU0sR0FBdUIsSUFBSSxZQUFZLEVBQUUs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LENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztTQUNuQztJQUNILENBQUM7SUFFRCwyREFBMkQ7SUFDbkQsZUFBZTtRQUNyQixJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUU7WUFDcEIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUMzQixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztTQUN6QjtJQUNILENBQUM7OztZQTNRRixTQUFTLFNBQUM7Z0JBQ1QsUUFBUSxFQUFFLHFCQUFxQjtnQkFDL0IsUUFBUSxFQUFFLG1CQUFtQjtnQkFDN0IsSUFBSSxFQUFFO29CQUNKLFdBQVcsRUFBRSwwQkFBMEI7b0JBQ3ZDLGNBQWMsRUFBRSx1QkFBdUI7b0JBQ3ZDLFNBQVMsRUFBRSxVQUFVO29CQUNyQixVQUFVLEVBQUUsSUFBSTtvQkFDaEIsZUFBZSxFQUFFLE1BQU07b0JBQ3ZCLHNCQUFzQixFQUFFLGNBQWM7aUJBQ3ZDO2FBQ0Y7OztZQXpDQyxVQUFVO1lBQ1YsZ0JBQWdCO1lBU2hCLE9BQU87NENBdUVKLE1BQU0sU0FBQyxRQUFRO1lBM0VaLGNBQWMsdUJBNEVqQixRQUFROzs7d0JBdENWLEtBQUssU0FBQyxtQkFBbUI7cUJBc0J6QixNQUFNLFNBQUMsZUFBZTtxQkFHdEIsTUFBTSxTQUFDLGVBQWUiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtcbiAgRGlyZWN0aXZlLFxuICBJbnB1dCxcbiAgT3V0cHV0LFxuICBFdmVudEVtaXR0ZXIsXG4gIEVsZW1lbnRSZWYsXG4gIFZpZXdDb250YWluZXJSZWYsXG4gIEluamVjdCxcbiAgT25EZXN0cm95LFxuICBPcHRpb25hbCxcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0RpcmVjdGlvbmFsaXR5fSBmcm9tICdAYW5ndWxhci9jZGsvYmlkaSc7XG5pbXBvcnQge1RlbXBsYXRlUG9ydGFsfSBmcm9tICdAYW5ndWxhci9jZGsvcG9ydGFsJztcbmltcG9ydCB7XG4gIE92ZXJsYXlSZWYsXG4gIE92ZXJsYXksXG4gIE92ZXJsYXlDb25maWcsXG4gIENvbm5lY3RlZFBvc2l0aW9uLFxuICBGbGV4aWJsZUNvbm5lY3RlZFBvc2l0aW9uU3RyYXRlZ3ksXG59IGZyb20gJ0Bhbmd1bGFyL2Nkay9vdmVybGF5JztcbmltcG9ydCB7U1BBQ0UsIEVOVEVSLCBSSUdIVF9BUlJPVywgTEVGVF9BUlJPVywgRE9XTl9BUlJPVywgVVBfQVJST1d9IGZyb20gJ0Bhbmd1bGFyL2Nkay9rZXljb2Rlcyc7XG5pbXBvcnQge0Nka01lbnVQYW5lbH0gZnJvbSAnLi9tZW51LXBhbmVsJztcbmltcG9ydCB7TWVudSwgQ0RLX01FTlV9IGZyb20gJy4vbWVudS1pbnRlcmZhY2UnO1xuaW1wb3J0IHtGb2N1c05leHR9IGZyb20gJy4vbWVudS1zdGFjayc7XG5pbXBvcnQge3Rocm93RXhpc3RpbmdNZW51U3RhY2tFcnJvcn0gZnJvbSAnLi9tZW51LWVycm9ycyc7XG5cbi8qKlxuICogQSBkaXJlY3RpdmUgdG8gYmUgY29tYmluZWQgd2l0aCBDZGtNZW51SXRlbSB3aGljaCBvcGVucyB0aGUgTWVudSBpdCBpcyBib3VuZCB0by4gSWYgdGhlXG4gKiBlbGVtZW50IGlzIGluIGEgdG9wIGxldmVsIE1lbnVCYXIgaXQgd2lsbCBvcGVuIHRoZSBtZW51IG9uIGNsaWNrLCBvciBpZiBhIHNpYmxpbmcgaXMgYWxyZWFkeVxuICogb3BlbmVkIGl0IHdpbGwgb3BlbiBvbiBob3Zlci4gSWYgaXQgaXMgaW5zaWRlIG9mIGEgTWVudSBpdCB3aWxsIG9wZW4gdGhlIGF0dGFjaGVkIFN1Ym1lbnUgb25cbiAqIGhvdmVyIHJlZ2FyZGxlc3Mgb2YgaXRzIHNpYmxpbmcgc3RhdGUuXG4gKlxuICogVGhlIGRpcmVjdGl2ZSBtdXN0IGJlIHBsYWNlZCBhbG9uZyB3aXRoIHRoZSBgY2RrTWVudUl0ZW1gIGRpcmVjdGl2ZSBpbiBvcmRlciB0byBlbmFibGUgZnVsbFxuICogZnVuY3Rpb25hbGl0eS5cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW2Nka01lbnVUcmlnZ2VyRm9yXScsXG4gIGV4cG9ydEFzOiAnY2RrTWVudVRyaWdnZXJGb3InLFxuICBob3N0OiB7XG4gICAgJyhrZXlkb3duKSc6ICdfdG9nZ2xlT25LZXlkb3duKCRldmVudCknLFxuICAgICcobW91c2VlbnRlciknOiAnX3RvZ2dsZU9uTW91c2VFbnRlcigpJyxcbiAgICAnKGNsaWNrKSc6ICd0b2dnbGUoKScsXG4gICAgJ3RhYmluZGV4JzogJy0xJyxcbiAgICAnYXJpYS1oYXNwb3B1cCc6ICdtZW51JyxcbiAgICAnW2F0dHIuYXJpYS1leHBhbmRlZF0nOiAnaXNNZW51T3BlbigpJyxcbiAgfSxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrTWVudUl0ZW1UcmlnZ2VyIGltcGxlbWVudHMgT25EZXN0cm95IHtcbiAgLyoqIFRlbXBsYXRlIHJlZmVyZW5jZSB2YXJpYWJsZSB0byB0aGUgbWVudSB0aGlzIHRyaWdnZXIgb3BlbnMgKi9cbiAgQElucHV0KCdjZGtNZW51VHJpZ2dlckZvcicpXG4gIGdldCBtZW51UGFuZWwoKTogQ2RrTWVudVBhbmVsIHwgdW5kZWZpbmVkIHtcbiAgICByZXR1cm4gdGhpcy5fbWVudVBhbmVsO1xuICB9XG4gIHNldCBtZW51UGFuZWwocGFuZWw6IENka01lbnVQYW5lbCB8IHVuZGVmaW5lZCkge1xuICAgIC8vIElmIHRoZSBwcm92aWRlZCBwYW5lbCBhbHJlYWR5IGhhcyBhIHN0YWNrLCB0aGF0IG1lYW5zIGl0IGFscmVhZHkgaGFzIGEgdHJpZ2dlciBjb25maWd1cmVkLlxuICAgIC8vIE5vdGUgaG93ZXZlciB0aGF0IHRoZXJlIGFyZSBzb21lIGVkZ2UgY2FzZXMgd2hlcmUgdHdvIHRyaWdnZXJzICoqbWF5Kiogc2hhcmUgdGhlIHNhbWUgbWVudSxcbiAgICAvLyBlLmcuIHR3byB0cmlnZ2VycyBpbiB0d28gc2VwYXJhdGUgbWVudXMuXG4gICAgaWYgKCh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpICYmIHBhbmVsPy5fbWVudVN0YWNrKSB7XG4gICAgICB0aHJvd0V4aXN0aW5nTWVudVN0YWNrRXJyb3IoKTtcbiAgICB9XG5cbiAgICB0aGlzLl9tZW51UGFuZWwgPSBwYW5lbDtcbiAgICBpZiAodGhpcy5fbWVudVBhbmVsKSB7XG4gICAgICB0aGlzLl9tZW51UGFuZWwuX21lbnVTdGFjayA9IHRoaXMuX2dldE1lbnVTdGFjaygpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBSZWZlcmVuY2UgdG8gdGhlIE1lbnVQYW5lbCB0aGlzIHRyaWdnZXIgdG9nZ2xlcy4gKi9cbiAgcHJpdmF0ZSBfbWVudVBhbmVsPzogQ2RrTWVudVBhbmVsO1xuXG4gIC8qKiBFbWl0cyB3aGVuIHRoZSBhdHRhY2hlZCBtZW51IGlzIHJlcXVlc3RlZCB0byBvcGVuICovXG4gIEBPdXRwdXQoJ2Nka01lbnVPcGVuZWQnKSByZWFkb25seSBvcGVuZWQ6IEV2ZW50RW1pdHRlcjx2b2lkPiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuICAvKiogRW1pdHMgd2hlbiB0aGUgYXR0YWNoZWQgbWVudSBpcyByZXF1ZXN0ZWQgdG8gY2xvc2UgKi9cbiAgQE91dHB1dCgnY2RrTWVudUNsb3NlZCcpIHJlYWRvbmx5IGNsb3NlZDogRXZlbnRFbWl0dGVyPHZvaWQ+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4gIC8qKiBBIHJlZmVyZW5jZSB0byB0aGUgb3ZlcmxheSB3aGljaCBtYW5hZ2VzIHRoZSB0cmlnZ2VyZWQgbWVudSAqL1xuICBwcml2YXRlIF9vdmVybGF5UmVmOiBPdmVybGF5UmVmIHwgbnVsbCA9IG51bGw7XG5cbiAgLyoqIFRoZSBjb250ZW50IG9mIHRoZSBtZW51IHBhbmVsIG9wZW5lZCBieSB0aGlzIHRyaWdnZXIuICovXG4gIHByaXZhdGUgX3BhbmVsQ29udGVudDogVGVtcGxhdGVQb3J0YWw7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSByZWFkb25seSBfZWxlbWVudFJlZjogRWxlbWVudFJlZjxIVE1MRWxlbWVudD4sXG4gICAgcHJvdGVjdGVkIHJlYWRvbmx5IF92aWV3Q29udGFpbmVyUmVmOiBWaWV3Q29udGFpbmVyUmVmLFxuICAgIHByaXZhdGUgcmVhZG9ubHkgX292ZXJsYXk6IE92ZXJsYXksXG4gICAgQEluamVjdChDREtfTUVOVSkgcHJpdmF0ZSByZWFkb25seSBfcGFyZW50TWVudTogTWVudSxcbiAgICBAT3B0aW9uYWwoKSBwcml2YXRlIHJlYWRvbmx5IF9kaXJlY3Rpb25hbGl0eT86IERpcmVjdGlvbmFsaXR5XG4gICkge31cblxuICAvKiogT3Blbi9jbG9zZSB0aGUgYXR0YWNoZWQgbWVudSBpZiB0aGUgdHJpZ2dlciBoYXMgYmVlbiBjb25maWd1cmVkIHdpdGggb25lICovXG4gIHRvZ2dsZSgpIHtcbiAgICBpZiAodGhpcy5oYXNNZW51KCkpIHtcbiAgICAgIHRoaXMuaXNNZW51T3BlbigpID8gdGhpcy5jbG9zZU1lbnUoKSA6IHRoaXMub3Blbk1lbnUoKTtcbiAgICB9XG4gIH1cblxuICAvKiogT3BlbiB0aGUgYXR0YWNoZWQgbWVudS4gKi9cbiAgb3Blbk1lbnUoKSB7XG4gICAgaWYgKCF0aGlzLmlzTWVudU9wZW4oKSkge1xuICAgICAgdGhpcy5vcGVuZWQubmV4dCgpO1xuXG4gICAgICB0aGlzLl9vdmVybGF5UmVmID0gdGhpcy5fb3ZlcmxheVJlZiB8fCB0aGlzLl9vdmVybGF5LmNyZWF0ZSh0aGlzLl9nZXRPdmVybGF5Q29uZmlnKCkpO1xuICAgICAgdGhpcy5fb3ZlcmxheVJlZi5hdHRhY2godGhpcy5fZ2V0UG9ydGFsKCkpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBDbG9zZSB0aGUgb3BlbmVkIG1lbnUuICovXG4gIGNsb3NlTWVudSgpIHtcbiAgICBpZiAodGhpcy5pc01lbnVPcGVuKCkpIHtcbiAgICAgIHRoaXMuY2xvc2VkLm5leHQoKTtcblxuICAgICAgdGhpcy5fb3ZlcmxheVJlZiEuZGV0YWNoKCk7XG4gICAgfVxuICAgIHRoaXMuX2Nsb3NlU2libGluZ1RyaWdnZXJzKCk7XG4gIH1cblxuICAvKiogUmV0dXJuIHRydWUgaWYgdGhlIHRyaWdnZXIgaGFzIGFuIGF0dGFjaGVkIG1lbnUgKi9cbiAgaGFzTWVudSgpIHtcbiAgICByZXR1cm4gISF0aGlzLm1lbnVQYW5lbDtcbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoZSBtZW51IHRoaXMgYnV0dG9uIGlzIGEgdHJpZ2dlciBmb3IgaXMgb3BlbiAqL1xuICBpc01lbnVPcGVuKCkge1xuICAgIHJldHVybiB0aGlzLl9vdmVybGF5UmVmID8gdGhpcy5fb3ZlcmxheVJlZi5oYXNBdHRhY2hlZCgpIDogZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGEgcmVmZXJlbmNlIHRvIHRoZSByZW5kZXJlZCBNZW51IGlmIHRoZSBNZW51IGlzIG9wZW4gYW5kIGl0IGlzIHZpc2libGUgaW4gdGhlIERPTS5cbiAgICogQHJldHVybiB0aGUgbWVudSBpZiBpdCBpcyBvcGVuLCBvdGhlcndpc2UgdW5kZWZpbmVkLlxuICAgKi9cbiAgZ2V0TWVudSgpOiBNZW51IHwgdW5kZWZpbmVkIHtcbiAgICByZXR1cm4gdGhpcy5tZW51UGFuZWw/Ll9tZW51O1xuICB9XG5cbiAgLyoqXG4gICAqIElmIHRoZXJlIGFyZSBleGlzdGluZyBvcGVuIG1lbnVzIGFuZCB0aGlzIG1lbnUgaXMgbm90IG9wZW4sIGNsb3NlIHNpYmxpbmcgbWVudXMgYW5kIG9wZW5cbiAgICogdGhpcyBvbmUuXG4gICAqL1xuICBfdG9nZ2xlT25Nb3VzZUVudGVyKCkge1xuICAgIGNvbnN0IG1lbnVTdGFjayA9IHRoaXMuX2dldE1lbnVTdGFjaygpO1xuICAgIGNvbnN0IGlzU2libGluZ01lbnVPcGVuID0gIW1lbnVTdGFjaz8uaXNFbXB0eSgpICYmICF0aGlzLmlzTWVudU9wZW4oKTtcbiAgICBpZiAoaXNTaWJsaW5nTWVudU9wZW4pIHtcbiAgICAgIHRoaXMuX2Nsb3NlU2libGluZ1RyaWdnZXJzKCk7XG4gICAgICB0aGlzLm9wZW5NZW51KCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZXMga2V5Ym9hcmQgZXZlbnRzIGZvciB0aGUgbWVudSBpdGVtLCBzcGVjaWZpY2FsbHkgb3BlbmluZy9jbG9zaW5nIHRoZSBhdHRhY2hlZCBtZW51IGFuZFxuICAgKiBmb2N1c2luZyB0aGUgYXBwcm9wcmlhdGUgc3VibWVudSBpdGVtLlxuICAgKiBAcGFyYW0gZXZlbnQgdGhlIGtleWJvYXJkIGV2ZW50IHRvIGhhbmRsZVxuICAgKi9cbiAgX3RvZ2dsZU9uS2V5ZG93bihldmVudDogS2V5Ym9hcmRFdmVudCkge1xuICAgIGNvbnN0IGtleUNvZGUgPSBldmVudC5rZXlDb2RlO1xuICAgIHN3aXRjaCAoa2V5Q29kZSkge1xuICAgICAgY2FzZSBTUEFDRTpcbiAgICAgIGNhc2UgRU5URVI6XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHRoaXMudG9nZ2xlKCk7XG4gICAgICAgIHRoaXMubWVudVBhbmVsPy5fbWVudT8uZm9jdXNGaXJzdEl0ZW0oJ2tleWJvYXJkJyk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIFJJR0hUX0FSUk9XOlxuICAgICAgICBpZiAodGhpcy5faXNQYXJlbnRWZXJ0aWNhbCgpKSB7XG4gICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICBpZiAodGhpcy5fZGlyZWN0aW9uYWxpdHk/LnZhbHVlID09PSAncnRsJykge1xuICAgICAgICAgICAgdGhpcy5fZ2V0TWVudVN0YWNrKCk/LmNsb3NlKHRoaXMuX3BhcmVudE1lbnUsIEZvY3VzTmV4dC5jdXJyZW50SXRlbSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMub3Blbk1lbnUoKTtcbiAgICAgICAgICAgIHRoaXMubWVudVBhbmVsPy5fbWVudT8uZm9jdXNGaXJzdEl0ZW0oJ2tleWJvYXJkJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIExFRlRfQVJST1c6XG4gICAgICAgIGlmICh0aGlzLl9pc1BhcmVudFZlcnRpY2FsKCkpIHtcbiAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgIGlmICh0aGlzLl9kaXJlY3Rpb25hbGl0eT8udmFsdWUgPT09ICdydGwnKSB7XG4gICAgICAgICAgICB0aGlzLm9wZW5NZW51KCk7XG4gICAgICAgICAgICB0aGlzLm1lbnVQYW5lbD8uX21lbnU/LmZvY3VzRmlyc3RJdGVtKCdrZXlib2FyZCcpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9nZXRNZW51U3RhY2soKT8uY2xvc2UodGhpcy5fcGFyZW50TWVudSwgRm9jdXNOZXh0LmN1cnJlbnRJdGVtKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgRE9XTl9BUlJPVzpcbiAgICAgIGNhc2UgVVBfQVJST1c6XG4gICAgICAgIGlmICghdGhpcy5faXNQYXJlbnRWZXJ0aWNhbCgpKSB7XG4gICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICB0aGlzLm9wZW5NZW51KCk7XG4gICAgICAgICAga2V5Q29kZSA9PT0gRE9XTl9BUlJPV1xuICAgICAgICAgICAgPyB0aGlzLm1lbnVQYW5lbD8uX21lbnU/LmZvY3VzRmlyc3RJdGVtKCdrZXlib2FyZCcpXG4gICAgICAgICAgICA6IHRoaXMubWVudVBhbmVsPy5fbWVudT8uZm9jdXNMYXN0SXRlbSgna2V5Ym9hcmQnKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICAvKiogQ2xvc2Ugb3V0IGFueSBzaWJsaW5nIG1lbnUgdHJpZ2dlciBtZW51cy4gKi9cbiAgcHJpdmF0ZSBfY2xvc2VTaWJsaW5nVHJpZ2dlcnMoKSB7XG4gICAgY29uc3QgbWVudVN0YWNrID0gdGhpcy5fZ2V0TWVudVN0YWNrKCk7XG5cbiAgICAvLyBJZiBub3RoaW5nIHdhcyByZW1vdmVkIGZyb20gdGhlIHN0YWNrIGFuZCB0aGUgbGFzdCBlbGVtZW50IGlzIG5vdCB0aGUgcGFyZW50IGl0ZW1cbiAgICAvLyB0aGF0IG1lYW5zIHRoYXQgdGhlIHBhcmVudCBtZW51IGlzIGEgbWVudSBiYXIgc2luY2Ugd2UgZG9uJ3QgcHV0IHRoZSBtZW51IGJhciBvbiB0aGVcbiAgICAvLyBzdGFja1xuICAgIGNvbnN0IGlzUGFyZW50TWVudUJhciA9XG4gICAgICAhbWVudVN0YWNrPy5jbG9zZVN1Yk1lbnVPZih0aGlzLl9wYXJlbnRNZW51KSAmJiBtZW51U3RhY2s/LnBlZWsoKSAhPT0gdGhpcy5fcGFyZW50TWVudTtcblxuICAgIGlmIChpc1BhcmVudE1lbnVCYXIpIHtcbiAgICAgIG1lbnVTdGFjaz8uY2xvc2VBbGwoKTtcbiAgICB9XG4gIH1cblxuICAvKiogR2V0IHRoZSBjb25maWd1cmF0aW9uIG9iamVjdCB1c2VkIHRvIGNyZWF0ZSB0aGUgb3ZlcmxheSAqL1xuICBwcml2YXRlIF9nZXRPdmVybGF5Q29uZmlnKCkge1xuICAgIHJldHVybiBuZXcgT3ZlcmxheUNvbmZpZyh7XG4gICAgICBwb3NpdGlvblN0cmF0ZWd5OiB0aGlzLl9nZXRPdmVybGF5UG9zaXRpb25TdHJhdGVneSgpLFxuICAgICAgc2Nyb2xsU3RyYXRlZ3k6IHRoaXMuX292ZXJsYXkuc2Nyb2xsU3RyYXRlZ2llcy5ibG9jaygpLFxuICAgICAgZGlyZWN0aW9uOiB0aGlzLl9kaXJlY3Rpb25hbGl0eSxcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBCdWlsZCB0aGUgcG9zaXRpb24gc3RyYXRlZ3kgZm9yIHRoZSBvdmVybGF5IHdoaWNoIHNwZWNpZmllcyB3aGVyZSB0byBwbGFjZSB0aGUgbWVudSAqL1xuICBwcml2YXRlIF9nZXRPdmVybGF5UG9zaXRpb25TdHJhdGVneSgpOiBGbGV4aWJsZUNvbm5lY3RlZFBvc2l0aW9uU3RyYXRlZ3kge1xuICAgIHJldHVybiB0aGlzLl9vdmVybGF5XG4gICAgICAucG9zaXRpb24oKVxuICAgICAgLmZsZXhpYmxlQ29ubmVjdGVkVG8odGhpcy5fZWxlbWVudFJlZilcbiAgICAgIC53aXRoUG9zaXRpb25zKHRoaXMuX2dldE92ZXJsYXlQb3NpdGlvbnMoKSk7XG4gIH1cblxuICAvKiogRGV0ZXJtaW5lIGFuZCByZXR1cm4gd2hlcmUgdG8gcG9zaXRpb24gdGhlIG9wZW5lZCBtZW51IHJlbGF0aXZlIHRvIHRoZSBtZW51IGl0ZW0gKi9cbiAgcHJpdmF0ZSBfZ2V0T3ZlcmxheVBvc2l0aW9ucygpOiBDb25uZWN0ZWRQb3NpdGlvbltdIHtcbiAgICAvLyBUT0RPOiB1c2UgYSBjb21tb24gcG9zaXRpb25pbmcgY29uZmlnIGZyb20gKHBvc3NpYmx5KSBjZGsvb3ZlcmxheVxuICAgIHJldHVybiB0aGlzLl9wYXJlbnRNZW51Lm9yaWVudGF0aW9uID09PSAnaG9yaXpvbnRhbCdcbiAgICAgID8gW1xuICAgICAgICAgIHtvcmlnaW5YOiAnc3RhcnQnLCBvcmlnaW5ZOiAnYm90dG9tJywgb3ZlcmxheVg6ICdzdGFydCcsIG92ZXJsYXlZOiAndG9wJ30sXG4gICAgICAgICAge29yaWdpblg6ICdzdGFydCcsIG9yaWdpblk6ICd0b3AnLCBvdmVybGF5WDogJ3N0YXJ0Jywgb3ZlcmxheVk6ICdib3R0b20nfSxcbiAgICAgICAgICB7b3JpZ2luWDogJ2VuZCcsIG9yaWdpblk6ICdib3R0b20nLCBvdmVybGF5WDogJ2VuZCcsIG92ZXJsYXlZOiAndG9wJ30sXG4gICAgICAgICAge29yaWdpblg6ICdlbmQnLCBvcmlnaW5ZOiAndG9wJywgb3ZlcmxheVg6ICdlbmQnLCBvdmVybGF5WTogJ2JvdHRvbSd9LFxuICAgICAgICBdXG4gICAgICA6IFtcbiAgICAgICAgICB7b3JpZ2luWDogJ2VuZCcsIG9yaWdpblk6ICd0b3AnLCBvdmVybGF5WDogJ3N0YXJ0Jywgb3ZlcmxheVk6ICd0b3AnfSxcbiAgICAgICAgICB7b3JpZ2luWDogJ2VuZCcsIG9yaWdpblk6ICdib3R0b20nLCBvdmVybGF5WDogJ3N0YXJ0Jywgb3ZlcmxheVk6ICdib3R0b20nfSxcbiAgICAgICAgICB7b3JpZ2luWDogJ3N0YXJ0Jywgb3JpZ2luWTogJ3RvcCcsIG92ZXJsYXlYOiAnZW5kJywgb3ZlcmxheVk6ICd0b3AnfSxcbiAgICAgICAgICB7b3JpZ2luWDogJ3N0YXJ0Jywgb3JpZ2luWTogJ2JvdHRvbScsIG92ZXJsYXlYOiAnZW5kJywgb3ZlcmxheVk6ICdib3R0b20nfSxcbiAgICAgICAgXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIHBvcnRhbCB0byBiZSBhdHRhY2hlZCB0byB0aGUgb3ZlcmxheSB3aGljaCBjb250YWlucyB0aGUgbWVudS4gQWxsb3dzIGZvciB0aGUgbWVudVxuICAgKiBjb250ZW50IHRvIGNoYW5nZSBkeW5hbWljYWxseSBhbmQgYmUgcmVmbGVjdGVkIGluIHRoZSBhcHBsaWNhdGlvbi5cbiAgICovXG4gIHByaXZhdGUgX2dldFBvcnRhbCgpIHtcbiAgICBjb25zdCBoYXNNZW51Q29udGVudENoYW5nZWQgPSB0aGlzLm1lbnVQYW5lbD8uX3RlbXBsYXRlUmVmICE9PSB0aGlzLl9wYW5lbENvbnRlbnQ/LnRlbXBsYXRlUmVmO1xuICAgIGlmICh0aGlzLm1lbnVQYW5lbCAmJiAoIXRoaXMuX3BhbmVsQ29udGVudCB8fCBoYXNNZW51Q29udGVudENoYW5nZWQpKSB7XG4gICAgICB0aGlzLl9wYW5lbENvbnRlbnQgPSBuZXcgVGVtcGxhdGVQb3J0YWwodGhpcy5tZW51UGFuZWwuX3RlbXBsYXRlUmVmLCB0aGlzLl92aWV3Q29udGFpbmVyUmVmKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fcGFuZWxDb250ZW50O1xuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm4gdHJ1ZSBpZiBpZiB0aGUgZW5jbG9zaW5nIHBhcmVudCBtZW51IGlzIGNvbmZpZ3VyZWQgaW4gYSB2ZXJ0aWNhbCBvcmllbnRhdGlvbi5cbiAgICovXG4gIHByaXZhdGUgX2lzUGFyZW50VmVydGljYWwoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3BhcmVudE1lbnUub3JpZW50YXRpb24gPT09ICd2ZXJ0aWNhbCc7XG4gIH1cblxuICAvKiogR2V0IHRoZSBtZW51IHN0YWNrIGZyb20gdGhlIHBhcmVudC4gKi9cbiAgcHJpdmF0ZSBfZ2V0TWVudVN0YWNrKCkge1xuICAgIC8vIFdlIHVzZSBhIGZ1bmN0aW9uIHNpbmNlIGF0IHRoZSBjb25zdHJ1Y3Rpb24gb2YgdGhlIE1lbnVJdGVtVHJpZ2dlciB0aGUgcGFyZW50IE1lbnUgd29uJ3QgaGF2ZVxuICAgIC8vIGl0cyBtZW51IHN0YWNrIHNldC4gVGhlcmVmb3JlIHdlIG5lZWQgdG8gcmVmZXJlbmNlIHRoZSBtZW51IHN0YWNrIGZyb20gdGhlIHBhcmVudCBlYWNoIHRpbWVcbiAgICAvLyB3ZSB3YW50IHRvIHVzZSBpdC5cbiAgICByZXR1cm4gdGhpcy5fcGFyZW50TWVudS5fbWVudVN0YWNrO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgdGhpcy5fZGVzdHJveU92ZXJsYXkoKTtcbiAgICB0aGlzLl9yZXNldFBhbmVsTWVudVN0YWNrKCk7XG4gIH1cblxuICAvKiogU2V0IHRoZSBtZW51IHBhbmVscyBtZW51IHN0YWNrIGJhY2sgdG8gbnVsbC4gKi9cbiAgcHJpdmF0ZSBfcmVzZXRQYW5lbE1lbnVTdGFjaygpIHtcbiAgICAvLyBJZiBhIENka01lbnVUcmlnZ2VyIGlzIHBsYWNlZCBpbiBhIHN1Ym1lbnUsIGVhY2ggdGltZSB0aGUgdHJpZ2dlciBpcyByZW5kZXJlZCAoaXRzIHBhcmVudFxuICAgIC8vIG1lbnUgaXMgb3BlbmVkKSB0aGUgcGFuZWwgc2V0dGVyIGZvciBDZGtNZW51UGFuZWwgaXMgY2FsbGVkLiBGcm9tIHRoZSBmaXJzdCByZW5kZXIgb253YXJkLFxuICAgIC8vIHRoZSBhdHRhY2hlZCBDZGtNZW51UGFuZWwgaGFzIHRoZSBNZW51U3RhY2sgc2V0LiBTaW5jZSB3ZSB0aHJvdyBhbiBlcnJvciBpZiBhIHBhbmVsIGFscmVhZHlcbiAgICAvLyBoYXMgYSBzdGFjayBzZXQsIHdlIHdhbnQgdG8gcmVzZXQgdGhlIGF0dGFjaGVkIHN0YWNrIGhlcmUgdG8gcHJldmVudCB0aGUgZXJyb3IgZnJvbSBiZWluZ1xuICAgIC8vIHRocm93biBpZiB0aGUgdHJpZ2dlciByZS1jb25maWd1cmVzIGl0cyBhdHRhY2hlZCBwYW5lbCAoaW4gdGhlIGNhc2Ugd2hlcmUgdGhlcmUgaXMgYSAxOjFcbiAgICAvLyByZWxhdGlvbnNoaXAgYmV0d2VlbiB0aGUgcGFuZWwgYW5kIHRyaWdnZXIpLlxuICAgIGlmICh0aGlzLl9tZW51UGFuZWwpIHtcbiAgICAgIHRoaXMuX21lbnVQYW5lbC5fbWVudVN0YWNrID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICAvKiogRGVzdHJveSBhbmQgdW5zZXQgdGhlIG92ZXJsYXkgcmVmZXJlbmNlIGl0IGlmIGV4aXN0cyAqL1xuICBwcml2YXRlIF9kZXN0cm95T3ZlcmxheSgpIHtcbiAgICBpZiAodGhpcy5fb3ZlcmxheVJlZikge1xuICAgICAgdGhpcy5fb3ZlcmxheVJlZi5kaXNwb3NlKCk7XG4gICAgICB0aGlzLl9vdmVybGF5UmVmID0gbnVsbDtcbiAgICB9XG4gIH1cbn1cbiJdfQ==