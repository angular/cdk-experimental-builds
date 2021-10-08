/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, Input, Output, EventEmitter, ElementRef, ViewContainerRef, Inject, Optional, NgZone, } from '@angular/core';
import { Directionality } from '@angular/cdk/bidi';
import { TemplatePortal } from '@angular/cdk/portal';
import { Overlay, OverlayConfig, } from '@angular/cdk/overlay';
import { SPACE, ENTER, RIGHT_ARROW, LEFT_ARROW, DOWN_ARROW, UP_ARROW } from '@angular/cdk/keycodes';
import { fromEvent, Subject, merge } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { CDK_MENU } from './menu-interface';
import { MenuStack } from './menu-stack';
import { throwExistingMenuStackError } from './menu-errors';
import { MENU_AIM } from './menu-aim';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/overlay";
import * as i2 from "@angular/cdk/bidi";
/**
 * Whether the target element is a menu item to be ignored by the overlay background click handler.
 */
export function isClickInsideMenuOverlay(target) {
    while (target?.parentElement) {
        const isOpenTrigger = target.getAttribute('aria-expanded') === 'true' &&
            target.classList.contains('cdk-menu-trigger');
        const isOverlayMenu = target.classList.contains('cdk-menu') && !target.classList.contains('cdk-menu-inline');
        if (isOpenTrigger || isOverlayMenu) {
            return true;
        }
        target = target.parentElement;
    }
    return false;
}
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
    constructor(_elementRef, _viewContainerRef, _overlay, _ngZone, _parentMenu, _menuAim, _directionality) {
        this._elementRef = _elementRef;
        this._viewContainerRef = _viewContainerRef;
        this._overlay = _overlay;
        this._ngZone = _ngZone;
        this._parentMenu = _parentMenu;
        this._menuAim = _menuAim;
        this._directionality = _directionality;
        /** Emits when the attached menu is requested to open */
        this.opened = new EventEmitter();
        /** Emits when the attached menu is requested to close */
        this.closed = new EventEmitter();
        /** The menu stack for this trigger and its sub-menus. */
        this._menuStack = new MenuStack();
        /** A reference to the overlay which manages the triggered menu */
        this._overlayRef = null;
        /** Emits when this trigger is destroyed. */
        this._destroyed = new Subject();
        /** Emits when the outside pointer events listener on the overlay should be stopped. */
        this._stopOutsideClicksListener = merge(this.closed, this._destroyed);
        this._registerCloseHandler();
        this._subscribeToMouseEnter();
    }
    /** Template reference variable to the menu this trigger opens */
    get menuPanel() {
        return this._menuPanel;
    }
    set menuPanel(panel) {
        // If the provided panel already has a stack, that means it already has a trigger configured.
        // Note however that there are some edge cases where two triggers **may** share the same menu,
        // e.g. two triggers in two separate menus.
        if ((typeof ngDevMode === 'undefined' || ngDevMode) && panel?._menuStack) {
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
            this._subscribeToOutsideClicks();
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
        return this.menuPanel?._menu;
    }
    /**
     * Subscribe to the mouseenter events and close any sibling menu items if this element is moused
     * into.
     */
    _subscribeToMouseEnter() {
        // Closes any sibling menu items and opens the menu associated with this trigger.
        const toggleMenus = () => this._ngZone.run(() => {
            this._closeSiblingTriggers();
            this.openMenu();
        });
        this._ngZone.runOutsideAngular(() => {
            fromEvent(this._elementRef.nativeElement, 'mouseenter')
                .pipe(filter(() => !this._getMenuStack()?.isEmpty() && !this.isMenuOpen()), takeUntil(this._destroyed))
                .subscribe(() => {
                if (this._menuAim) {
                    this._menuAim.toggle(toggleMenus);
                }
                else {
                    toggleMenus();
                }
            });
        });
    }
    /**
     * Handles keyboard events for the menu item, specifically opening/closing the attached menu and
     * focusing the appropriate submenu item.
     * @param event the keyboard event to handle
     */
    _toggleOnKeydown(event) {
        const keyCode = event.keyCode;
        switch (keyCode) {
            case SPACE:
            case ENTER:
                event.preventDefault();
                this.toggle();
                this.menuPanel?._menu?.focusFirstItem('keyboard');
                break;
            case RIGHT_ARROW:
                if (this._parentMenu && this._isParentVertical()) {
                    event.preventDefault();
                    if (this._directionality?.value === 'rtl') {
                        this._getMenuStack().close(this._parentMenu, 2 /* currentItem */);
                    }
                    else {
                        this.openMenu();
                        this.menuPanel?._menu?.focusFirstItem('keyboard');
                    }
                }
                break;
            case LEFT_ARROW:
                if (this._parentMenu && this._isParentVertical()) {
                    event.preventDefault();
                    if (this._directionality?.value === 'rtl') {
                        this.openMenu();
                        this.menuPanel?._menu?.focusFirstItem('keyboard');
                    }
                    else {
                        this._getMenuStack().close(this._parentMenu, 2 /* currentItem */);
                    }
                }
                break;
            case DOWN_ARROW:
            case UP_ARROW:
                if (!this._isParentVertical()) {
                    event.preventDefault();
                    this.openMenu();
                    keyCode === DOWN_ARROW
                        ? this.menuPanel?._menu?.focusFirstItem('keyboard')
                        : this.menuPanel?._menu?.focusLastItem('keyboard');
                }
                break;
        }
    }
    /** Close out any sibling menu trigger menus. */
    _closeSiblingTriggers() {
        if (this._parentMenu) {
            const menuStack = this._getMenuStack();
            // If nothing was removed from the stack and the last element is not the parent item
            // that means that the parent menu is a menu bar since we don't put the menu bar on the
            // stack
            const isParentMenuBar = !menuStack.closeSubMenuOf(this._parentMenu) && menuStack.peek() !== this._parentMenu;
            if (isParentMenuBar) {
                menuStack.closeAll();
            }
        }
        else {
            this._getMenuStack().closeAll();
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
        return !this._parentMenu || this._parentMenu.orientation === 'horizontal'
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
        const hasMenuContentChanged = this.menuPanel?._templateRef !== this._panelContent?.templateRef;
        if (this.menuPanel && (!this._panelContent || hasMenuContentChanged)) {
            this._panelContent = new TemplatePortal(this.menuPanel._templateRef, this._viewContainerRef);
        }
        return this._panelContent;
    }
    /**
     * @return true if if the enclosing parent menu is configured in a vertical orientation.
     */
    _isParentVertical() {
        return this._parentMenu?.orientation === 'vertical';
    }
    /**
     * Subscribe to the MenuStack close events if this is a standalone trigger and close out the menu
     * this triggers when requested.
     */
    _registerCloseHandler() {
        if (!this._parentMenu) {
            this._menuStack.closed.pipe(takeUntil(this._destroyed)).subscribe(item => {
                if (item === this._menuPanel?._menu) {
                    this.closeMenu();
                }
            });
        }
    }
    /** Get the menu stack for this trigger - either from the parent or this trigger. */
    _getMenuStack() {
        // We use a function since at the construction of the MenuItemTrigger the parent Menu won't have
        // its menu stack set. Therefore we need to reference the menu stack from the parent each time
        // we want to use it.
        return this._parentMenu?._menuStack || this._menuStack;
    }
    ngOnDestroy() {
        this._destroyOverlay();
        this._resetPanelMenuStack();
        this._destroyed.next();
        this._destroyed.complete();
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
    /**
     * Subscribe to the overlays outside pointer events stream and handle closing out the stack if a
     * click occurs outside the menus.
     */
    _subscribeToOutsideClicks() {
        if (this._overlayRef) {
            this._overlayRef
                .outsidePointerEvents()
                .pipe(takeUntil(this._stopOutsideClicksListener))
                .subscribe(event => {
                if (!isClickInsideMenuOverlay(event.target)) {
                    this._getMenuStack().closeAll();
                }
            });
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
CdkMenuItemTrigger.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.0-next.15", ngImport: i0, type: CdkMenuItemTrigger, deps: [{ token: i0.ElementRef }, { token: i0.ViewContainerRef }, { token: i1.Overlay }, { token: i0.NgZone }, { token: CDK_MENU, optional: true }, { token: MENU_AIM, optional: true }, { token: i2.Directionality, optional: true }], target: i0.ɵɵFactoryTarget.Directive });
CdkMenuItemTrigger.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "13.0.0-next.15", type: CdkMenuItemTrigger, selector: "[cdkMenuTriggerFor]", inputs: { menuPanel: ["cdkMenuTriggerFor", "menuPanel"] }, outputs: { opened: "cdkMenuOpened", closed: "cdkMenuClosed" }, host: { attributes: { "aria-haspopup": "menu" }, listeners: { "keydown": "_toggleOnKeydown($event)", "click": "toggle()" }, properties: { "attr.aria-expanded": "isMenuOpen()" }, classAttribute: "cdk-menu-trigger" }, exportAs: ["cdkMenuTriggerFor"], ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.0-next.15", ngImport: i0, type: CdkMenuItemTrigger, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkMenuTriggerFor]',
                    exportAs: 'cdkMenuTriggerFor',
                    host: {
                        '(keydown)': '_toggleOnKeydown($event)',
                        '(click)': 'toggle()',
                        'class': 'cdk-menu-trigger',
                        'aria-haspopup': 'menu',
                        '[attr.aria-expanded]': 'isMenuOpen()',
                    },
                }]
        }], ctorParameters: function () { return [{ type: i0.ElementRef }, { type: i0.ViewContainerRef }, { type: i1.Overlay }, { type: i0.NgZone }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [CDK_MENU]
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [MENU_AIM]
                }] }, { type: i2.Directionality, decorators: [{
                    type: Optional
                }] }]; }, propDecorators: { menuPanel: [{
                type: Input,
                args: ['cdkMenuTriggerFor']
            }], opened: [{
                type: Output,
                args: ['cdkMenuOpened']
            }], closed: [{
                type: Output,
                args: ['cdkMenuClosed']
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1pdGVtLXRyaWdnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrLWV4cGVyaW1lbnRhbC9tZW51L21lbnUtaXRlbS10cmlnZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFDTCxTQUFTLEVBQ1QsS0FBSyxFQUNMLE1BQU0sRUFDTixZQUFZLEVBQ1osVUFBVSxFQUNWLGdCQUFnQixFQUNoQixNQUFNLEVBRU4sUUFBUSxFQUNSLE1BQU0sR0FDUCxNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDakQsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQ25ELE9BQU8sRUFFTCxPQUFPLEVBQ1AsYUFBYSxHQUdkLE1BQU0sc0JBQXNCLENBQUM7QUFDOUIsT0FBTyxFQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDbEcsT0FBTyxFQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQy9DLE9BQU8sRUFBQyxTQUFTLEVBQUUsTUFBTSxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFFakQsT0FBTyxFQUFPLFFBQVEsRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBQ2hELE9BQU8sRUFBWSxTQUFTLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFDbEQsT0FBTyxFQUFDLDJCQUEyQixFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQzFELE9BQU8sRUFBQyxRQUFRLEVBQVUsTUFBTSxZQUFZLENBQUM7Ozs7QUFFN0M7O0dBRUc7QUFDSCxNQUFNLFVBQVUsd0JBQXdCLENBQUMsTUFBZTtJQUN0RCxPQUFPLE1BQU0sRUFBRSxhQUFhLEVBQUU7UUFDNUIsTUFB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OzRDQWhEUCxTQUFTO3NCQURaLEtBQUs7dUJBQUMsbUJBQW1CO2dCQXNCUSxNQUFNO3NCQUF2QyxNQUFNO3VCQUFDLGVBQWU7Z0JBR1csTUFBTTtzQkFBdkMsTUFBTTt1QkFBQyxlQUFlIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7XG4gIERpcmVjdGl2ZSxcbiAgSW5wdXQsXG4gIE91dHB1dCxcbiAgRXZlbnRFbWl0dGVyLFxuICBFbGVtZW50UmVmLFxuICBWaWV3Q29udGFpbmVyUmVmLFxuICBJbmplY3QsXG4gIE9uRGVzdHJveSxcbiAgT3B0aW9uYWwsXG4gIE5nWm9uZSxcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0RpcmVjdGlvbmFsaXR5fSBmcm9tICdAYW5ndWxhci9jZGsvYmlkaSc7XG5pbXBvcnQge1RlbXBsYXRlUG9ydGFsfSBmcm9tICdAYW5ndWxhci9jZGsvcG9ydGFsJztcbmltcG9ydCB7XG4gIE92ZXJsYXlSZWYsXG4gIE92ZXJsYXksXG4gIE92ZXJsYXlDb25maWcsXG4gIENvbm5lY3RlZFBvc2l0aW9uLFxuICBGbGV4aWJsZUNvbm5lY3RlZFBvc2l0aW9uU3RyYXRlZ3ksXG59IGZyb20gJ0Bhbmd1bGFyL2Nkay9vdmVybGF5JztcbmltcG9ydCB7U1BBQ0UsIEVOVEVSLCBSSUdIVF9BUlJPVywgTEVGVF9BUlJPVywgRE9XTl9BUlJPVywgVVBfQVJST1d9IGZyb20gJ0Bhbmd1bGFyL2Nkay9rZXljb2Rlcyc7XG5pbXBvcnQge2Zyb21FdmVudCwgU3ViamVjdCwgbWVyZ2V9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHt0YWtlVW50aWwsIGZpbHRlcn0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuaW1wb3J0IHtDZGtNZW51UGFuZWx9IGZyb20gJy4vbWVudS1wYW5lbCc7XG5pbXBvcnQge01lbnUsIENES19NRU5VfSBmcm9tICcuL21lbnUtaW50ZXJmYWNlJztcbmltcG9ydCB7Rm9jdXNOZXh0LCBNZW51U3RhY2t9IGZyb20gJy4vbWVudS1zdGFjayc7XG5pbXBvcnQge3Rocm93RXhpc3RpbmdNZW51U3RhY2tFcnJvcn0gZnJvbSAnLi9tZW51LWVycm9ycyc7XG5pbXBvcnQge01FTlVfQUlNLCBNZW51QWltfSBmcm9tICcuL21lbnUtYWltJztcblxuLyoqXG4gKiBXaGV0aGVyIHRoZSB0YXJnZXQgZWxlbWVudCBpcyBhIG1lbnUgaXRlbSB0byBiZSBpZ25vcmVkIGJ5IHRoZSBvdmVybGF5IGJhY2tncm91bmQgY2xpY2sgaGFuZGxlci5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzQ2xpY2tJbnNpZGVNZW51T3ZlcmxheSh0YXJnZXQ6IEVsZW1lbnQpOiBib29sZWFuIHtcbiAgd2hpbGUgKHRhcmdldD8ucGFyZW50RWxlbWVudCkge1xuICAgIGNvbnN0IGlzT3BlblRyaWdnZXIgPVxuICAgICAgdGFyZ2V0LmdldEF0dHJpYnV0ZSgnYXJpYS1leHBhbmRlZCcpID09PSAndHJ1ZScgJiZcbiAgICAgIHRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoJ2Nkay1tZW51LXRyaWdnZXInKTtcbiAgICBjb25zdCBpc092ZXJsYXlNZW51ID1cbiAgICAgIHRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoJ2Nkay1tZW51JykgJiYgIXRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoJ2Nkay1tZW51LWlubGluZScpO1xuXG4gICAgaWYgKGlzT3BlblRyaWdnZXIgfHwgaXNPdmVybGF5TWVudSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHRhcmdldCA9IHRhcmdldC5wYXJlbnRFbGVtZW50O1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuLyoqXG4gKiBBIGRpcmVjdGl2ZSB0byBiZSBjb21iaW5lZCB3aXRoIENka01lbnVJdGVtIHdoaWNoIG9wZW5zIHRoZSBNZW51IGl0IGlzIGJvdW5kIHRvLiBJZiB0aGVcbiAqIGVsZW1lbnQgaXMgaW4gYSB0b3AgbGV2ZWwgTWVudUJhciBpdCB3aWxsIG9wZW4gdGhlIG1lbnUgb24gY2xpY2ssIG9yIGlmIGEgc2libGluZyBpcyBhbHJlYWR5XG4gKiBvcGVuZWQgaXQgd2lsbCBvcGVuIG9uIGhvdmVyLiBJZiBpdCBpcyBpbnNpZGUgb2YgYSBNZW51IGl0IHdpbGwgb3BlbiB0aGUgYXR0YWNoZWQgU3VibWVudSBvblxuICogaG92ZXIgcmVnYXJkbGVzcyBvZiBpdHMgc2libGluZyBzdGF0ZS5cbiAqXG4gKiBUaGUgZGlyZWN0aXZlIG11c3QgYmUgcGxhY2VkIGFsb25nIHdpdGggdGhlIGBjZGtNZW51SXRlbWAgZGlyZWN0aXZlIGluIG9yZGVyIHRvIGVuYWJsZSBmdWxsXG4gKiBmdW5jdGlvbmFsaXR5LlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbY2RrTWVudVRyaWdnZXJGb3JdJyxcbiAgZXhwb3J0QXM6ICdjZGtNZW51VHJpZ2dlckZvcicsXG4gIGhvc3Q6IHtcbiAgICAnKGtleWRvd24pJzogJ190b2dnbGVPbktleWRvd24oJGV2ZW50KScsXG4gICAgJyhjbGljayknOiAndG9nZ2xlKCknLFxuICAgICdjbGFzcyc6ICdjZGstbWVudS10cmlnZ2VyJyxcbiAgICAnYXJpYS1oYXNwb3B1cCc6ICdtZW51JyxcbiAgICAnW2F0dHIuYXJpYS1leHBhbmRlZF0nOiAnaXNNZW51T3BlbigpJyxcbiAgfSxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrTWVudUl0ZW1UcmlnZ2VyIGltcGxlbWVudHMgT25EZXN0cm95IHtcbiAgLyoqIFRlbXBsYXRlIHJlZmVyZW5jZSB2YXJpYWJsZSB0byB0aGUgbWVudSB0aGlzIHRyaWdnZXIgb3BlbnMgKi9cbiAgQElucHV0KCdjZGtNZW51VHJpZ2dlckZvcicpXG4gIGdldCBtZW51UGFuZWwoKTogQ2RrTWVudVBhbmVsIHwgdW5kZWZpbmVkIHtcbiAgICByZXR1cm4gdGhpcy5fbWVudVBhbmVsO1xuICB9XG4gIHNldCBtZW51UGFuZWwocGFuZWw6IENka01lbnVQYW5lbCB8IHVuZGVmaW5lZCkge1xuICAgIC8vIElmIHRoZSBwcm92aWRlZCBwYW5lbCBhbHJlYWR5IGhhcyBhIHN0YWNrLCB0aGF0IG1lYW5zIGl0IGFscmVhZHkgaGFzIGEgdHJpZ2dlciBjb25maWd1cmVkLlxuICAgIC8vIE5vdGUgaG93ZXZlciB0aGF0IHRoZXJlIGFyZSBzb21lIGVkZ2UgY2FzZXMgd2hlcmUgdHdvIHRyaWdnZXJzICoqbWF5Kiogc2hhcmUgdGhlIHNhbWUgbWVudSxcbiAgICAvLyBlLmcuIHR3byB0cmlnZ2VycyBpbiB0d28gc2VwYXJhdGUgbWVudXMuXG4gICAgaWYgKCh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpICYmIHBhbmVsPy5fbWVudVN0YWNrKSB7XG4gICAgICB0aHJvd0V4aXN0aW5nTWVudVN0YWNrRXJyb3IoKTtcbiAgICB9XG5cbiAgICB0aGlzLl9tZW51UGFuZWwgPSBwYW5lbDtcbiAgICBpZiAodGhpcy5fbWVudVBhbmVsKSB7XG4gICAgICB0aGlzLl9tZW51UGFuZWwuX21lbnVTdGFjayA9IHRoaXMuX2dldE1lbnVTdGFjaygpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBSZWZlcmVuY2UgdG8gdGhlIE1lbnVQYW5lbCB0aGlzIHRyaWdnZXIgdG9nZ2xlcy4gKi9cbiAgcHJpdmF0ZSBfbWVudVBhbmVsPzogQ2RrTWVudVBhbmVsO1xuXG4gIC8qKiBFbWl0cyB3aGVuIHRoZSBhdHRhY2hlZCBtZW51IGlzIHJlcXVlc3RlZCB0byBvcGVuICovXG4gIEBPdXRwdXQoJ2Nka01lbnVPcGVuZWQnKSByZWFkb25seSBvcGVuZWQ6IEV2ZW50RW1pdHRlcjx2b2lkPiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuICAvKiogRW1pdHMgd2hlbiB0aGUgYXR0YWNoZWQgbWVudSBpcyByZXF1ZXN0ZWQgdG8gY2xvc2UgKi9cbiAgQE91dHB1dCgnY2RrTWVudUNsb3NlZCcpIHJlYWRvbmx5IGNsb3NlZDogRXZlbnRFbWl0dGVyPHZvaWQ+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4gIC8qKiBUaGUgbWVudSBzdGFjayBmb3IgdGhpcyB0cmlnZ2VyIGFuZCBpdHMgc3ViLW1lbnVzLiAqL1xuICBfbWVudVN0YWNrOiBNZW51U3RhY2sgPSBuZXcgTWVudVN0YWNrKCk7XG5cbiAgLyoqIEEgcmVmZXJlbmNlIHRvIHRoZSBvdmVybGF5IHdoaWNoIG1hbmFnZXMgdGhlIHRyaWdnZXJlZCBtZW51ICovXG4gIHByaXZhdGUgX292ZXJsYXlSZWY6IE92ZXJsYXlSZWYgfCBudWxsID0gbnVsbDtcblxuICAvKiogVGhlIGNvbnRlbnQgb2YgdGhlIG1lbnUgcGFuZWwgb3BlbmVkIGJ5IHRoaXMgdHJpZ2dlci4gKi9cbiAgcHJpdmF0ZSBfcGFuZWxDb250ZW50OiBUZW1wbGF0ZVBvcnRhbDtcblxuICAvKiogRW1pdHMgd2hlbiB0aGlzIHRyaWdnZXIgaXMgZGVzdHJveWVkLiAqL1xuICBwcml2YXRlIHJlYWRvbmx5IF9kZXN0cm95ZWQ6IFN1YmplY3Q8dm9pZD4gPSBuZXcgU3ViamVjdCgpO1xuXG4gIC8qKiBFbWl0cyB3aGVuIHRoZSBvdXRzaWRlIHBvaW50ZXIgZXZlbnRzIGxpc3RlbmVyIG9uIHRoZSBvdmVybGF5IHNob3VsZCBiZSBzdG9wcGVkLiAqL1xuICBwcml2YXRlIHJlYWRvbmx5IF9zdG9wT3V0c2lkZUNsaWNrc0xpc3RlbmVyID0gbWVyZ2UodGhpcy5jbG9zZWQsIHRoaXMuX2Rlc3Ryb3llZCk7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSByZWFkb25seSBfZWxlbWVudFJlZjogRWxlbWVudFJlZjxIVE1MRWxlbWVudD4sXG4gICAgcHJvdGVjdGVkIHJlYWRvbmx5IF92aWV3Q29udGFpbmVyUmVmOiBWaWV3Q29udGFpbmVyUmVmLFxuICAgIHByaXZhdGUgcmVhZG9ubHkgX292ZXJsYXk6IE92ZXJsYXksXG4gICAgcHJpdmF0ZSByZWFkb25seSBfbmdab25lOiBOZ1pvbmUsXG4gICAgQE9wdGlvbmFsKCkgQEluamVjdChDREtfTUVOVSkgcHJpdmF0ZSByZWFkb25seSBfcGFyZW50TWVudT86IE1lbnUsXG4gICAgQE9wdGlvbmFsKCkgQEluamVjdChNRU5VX0FJTSkgcHJpdmF0ZSByZWFkb25seSBfbWVudUFpbT86IE1lbnVBaW0sXG4gICAgQE9wdGlvbmFsKCkgcHJpdmF0ZSByZWFkb25seSBfZGlyZWN0aW9uYWxpdHk/OiBEaXJlY3Rpb25hbGl0eVxuICApIHtcbiAgICB0aGlzLl9yZWdpc3RlckNsb3NlSGFuZGxlcigpO1xuICAgIHRoaXMuX3N1YnNjcmliZVRvTW91c2VFbnRlcigpO1xuICB9XG5cbiAgLyoqIE9wZW4vY2xvc2UgdGhlIGF0dGFjaGVkIG1lbnUgaWYgdGhlIHRyaWdnZXIgaGFzIGJlZW4gY29uZmlndXJlZCB3aXRoIG9uZSAqL1xuICB0b2dnbGUoKSB7XG4gICAgaWYgKHRoaXMuaGFzTWVudSgpKSB7XG4gICAgICB0aGlzLmlzTWVudU9wZW4oKSA/IHRoaXMuY2xvc2VNZW51KCkgOiB0aGlzLm9wZW5NZW51KCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIE9wZW4gdGhlIGF0dGFjaGVkIG1lbnUuICovXG4gIG9wZW5NZW51KCkge1xuICAgIGlmICghdGhpcy5pc01lbnVPcGVuKCkpIHtcbiAgICAgIHRoaXMub3BlbmVkLm5leHQoKTtcblxuICAgICAgdGhpcy5fb3ZlcmxheVJlZiA9IHRoaXMuX292ZXJsYXlSZWYgfHwgdGhpcy5fb3ZlcmxheS5jcmVhdGUodGhpcy5fZ2V0T3ZlcmxheUNvbmZpZygpKTtcbiAgICAgIHRoaXMuX292ZXJsYXlSZWYuYXR0YWNoKHRoaXMuX2dldFBvcnRhbCgpKTtcbiAgICAgIHRoaXMuX3N1YnNjcmliZVRvT3V0c2lkZUNsaWNrcygpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBDbG9zZSB0aGUgb3BlbmVkIG1lbnUuICovXG4gIGNsb3NlTWVudSgpIHtcbiAgICBpZiAodGhpcy5pc01lbnVPcGVuKCkpIHtcbiAgICAgIHRoaXMuY2xvc2VkLm5leHQoKTtcblxuICAgICAgdGhpcy5fb3ZlcmxheVJlZiEuZGV0YWNoKCk7XG4gICAgfVxuICAgIHRoaXMuX2Nsb3NlU2libGluZ1RyaWdnZXJzKCk7XG4gIH1cblxuICAvKiogUmV0dXJuIHRydWUgaWYgdGhlIHRyaWdnZXIgaGFzIGFuIGF0dGFjaGVkIG1lbnUgKi9cbiAgaGFzTWVudSgpIHtcbiAgICByZXR1cm4gISF0aGlzLm1lbnVQYW5lbDtcbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoZSBtZW51IHRoaXMgYnV0dG9uIGlzIGEgdHJpZ2dlciBmb3IgaXMgb3BlbiAqL1xuICBpc01lbnVPcGVuKCkge1xuICAgIHJldHVybiB0aGlzLl9vdmVybGF5UmVmID8gdGhpcy5fb3ZlcmxheVJlZi5oYXNBdHRhY2hlZCgpIDogZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGEgcmVmZXJlbmNlIHRvIHRoZSByZW5kZXJlZCBNZW51IGlmIHRoZSBNZW51IGlzIG9wZW4gYW5kIGl0IGlzIHZpc2libGUgaW4gdGhlIERPTS5cbiAgICogQHJldHVybiB0aGUgbWVudSBpZiBpdCBpcyBvcGVuLCBvdGhlcndpc2UgdW5kZWZpbmVkLlxuICAgKi9cbiAgZ2V0TWVudSgpOiBNZW51IHwgdW5kZWZpbmVkIHtcbiAgICByZXR1cm4gdGhpcy5tZW51UGFuZWw/Ll9tZW51O1xuICB9XG5cbiAgLyoqXG4gICAqIFN1YnNjcmliZSB0byB0aGUgbW91c2VlbnRlciBldmVudHMgYW5kIGNsb3NlIGFueSBzaWJsaW5nIG1lbnUgaXRlbXMgaWYgdGhpcyBlbGVtZW50IGlzIG1vdXNlZFxuICAgKiBpbnRvLlxuICAgKi9cbiAgcHJpdmF0ZSBfc3Vic2NyaWJlVG9Nb3VzZUVudGVyKCkge1xuICAgIC8vIENsb3NlcyBhbnkgc2libGluZyBtZW51IGl0ZW1zIGFuZCBvcGVucyB0aGUgbWVudSBhc3NvY2lhdGVkIHdpdGggdGhpcyB0cmlnZ2VyLlxuICAgIGNvbnN0IHRvZ2dsZU1lbnVzID0gKCkgPT5cbiAgICAgIHRoaXMuX25nWm9uZS5ydW4oKCkgPT4ge1xuICAgICAgICB0aGlzLl9jbG9zZVNpYmxpbmdUcmlnZ2VycygpO1xuICAgICAgICB0aGlzLm9wZW5NZW51KCk7XG4gICAgICB9KTtcblxuICAgIHRoaXMuX25nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgICBmcm9tRXZlbnQodGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LCAnbW91c2VlbnRlcicpXG4gICAgICAgIC5waXBlKFxuICAgICAgICAgIGZpbHRlcigoKSA9PiAhdGhpcy5fZ2V0TWVudVN0YWNrKCk/LmlzRW1wdHkoKSAmJiAhdGhpcy5pc01lbnVPcGVuKCkpLFxuICAgICAgICAgIHRha2VVbnRpbCh0aGlzLl9kZXN0cm95ZWQpXG4gICAgICAgIClcbiAgICAgICAgLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgICAgaWYgKHRoaXMuX21lbnVBaW0pIHtcbiAgICAgICAgICAgIHRoaXMuX21lbnVBaW0udG9nZ2xlKHRvZ2dsZU1lbnVzKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdG9nZ2xlTWVudXMoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZXMga2V5Ym9hcmQgZXZlbnRzIGZvciB0aGUgbWVudSBpdGVtLCBzcGVjaWZpY2FsbHkgb3BlbmluZy9jbG9zaW5nIHRoZSBhdHRhY2hlZCBtZW51IGFuZFxuICAgKiBmb2N1c2luZyB0aGUgYXBwcm9wcmlhdGUgc3VibWVudSBpdGVtLlxuICAgKiBAcGFyYW0gZXZlbnQgdGhlIGtleWJvYXJkIGV2ZW50IHRvIGhhbmRsZVxuICAgKi9cbiAgX3RvZ2dsZU9uS2V5ZG93bihldmVudDogS2V5Ym9hcmRFdmVudCkge1xuICAgIGNvbnN0IGtleUNvZGUgPSBldmVudC5rZXlDb2RlO1xuICAgIHN3aXRjaCAoa2V5Q29kZSkge1xuICAgICAgY2FzZSBTUEFDRTpcbiAgICAgIGNhc2UgRU5URVI6XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHRoaXMudG9nZ2xlKCk7XG4gICAgICAgIHRoaXMubWVudVBhbmVsPy5fbWVudT8uZm9jdXNGaXJzdEl0ZW0oJ2tleWJvYXJkJyk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIFJJR0hUX0FSUk9XOlxuICAgICAgICBpZiAodGhpcy5fcGFyZW50TWVudSAmJiB0aGlzLl9pc1BhcmVudFZlcnRpY2FsKCkpIHtcbiAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgIGlmICh0aGlzLl9kaXJlY3Rpb25hbGl0eT8udmFsdWUgPT09ICdydGwnKSB7XG4gICAgICAgICAgICB0aGlzLl9nZXRNZW51U3RhY2soKS5jbG9zZSh0aGlzLl9wYXJlbnRNZW51LCBGb2N1c05leHQuY3VycmVudEl0ZW0pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLm9wZW5NZW51KCk7XG4gICAgICAgICAgICB0aGlzLm1lbnVQYW5lbD8uX21lbnU/LmZvY3VzRmlyc3RJdGVtKCdrZXlib2FyZCcpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBMRUZUX0FSUk9XOlxuICAgICAgICBpZiAodGhpcy5fcGFyZW50TWVudSAmJiB0aGlzLl9pc1BhcmVudFZlcnRpY2FsKCkpIHtcbiAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgIGlmICh0aGlzLl9kaXJlY3Rpb25hbGl0eT8udmFsdWUgPT09ICdydGwnKSB7XG4gICAgICAgICAgICB0aGlzLm9wZW5NZW51KCk7XG4gICAgICAgICAgICB0aGlzLm1lbnVQYW5lbD8uX21lbnU/LmZvY3VzRmlyc3RJdGVtKCdrZXlib2FyZCcpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9nZXRNZW51U3RhY2soKS5jbG9zZSh0aGlzLl9wYXJlbnRNZW51LCBGb2N1c05leHQuY3VycmVudEl0ZW0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBET1dOX0FSUk9XOlxuICAgICAgY2FzZSBVUF9BUlJPVzpcbiAgICAgICAgaWYgKCF0aGlzLl9pc1BhcmVudFZlcnRpY2FsKCkpIHtcbiAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgIHRoaXMub3Blbk1lbnUoKTtcbiAgICAgICAgICBrZXlDb2RlID09PSBET1dOX0FSUk9XXG4gICAgICAgICAgICA/IHRoaXMubWVudVBhbmVsPy5fbWVudT8uZm9jdXNGaXJzdEl0ZW0oJ2tleWJvYXJkJylcbiAgICAgICAgICAgIDogdGhpcy5tZW51UGFuZWw/Ll9tZW51Py5mb2N1c0xhc3RJdGVtKCdrZXlib2FyZCcpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBDbG9zZSBvdXQgYW55IHNpYmxpbmcgbWVudSB0cmlnZ2VyIG1lbnVzLiAqL1xuICBwcml2YXRlIF9jbG9zZVNpYmxpbmdUcmlnZ2VycygpIHtcbiAgICBpZiAodGhpcy5fcGFyZW50TWVudSkge1xuICAgICAgY29uc3QgbWVudVN0YWNrID0gdGhpcy5fZ2V0TWVudVN0YWNrKCk7XG5cbiAgICAgIC8vIElmIG5vdGhpbmcgd2FzIHJlbW92ZWQgZnJvbSB0aGUgc3RhY2sgYW5kIHRoZSBsYXN0IGVsZW1lbnQgaXMgbm90IHRoZSBwYXJlbnQgaXRlbVxuICAgICAgLy8gdGhhdCBtZWFucyB0aGF0IHRoZSBwYXJlbnQgbWVudSBpcyBhIG1lbnUgYmFyIHNpbmNlIHdlIGRvbid0IHB1dCB0aGUgbWVudSBiYXIgb24gdGhlXG4gICAgICAvLyBzdGFja1xuICAgICAgY29uc3QgaXNQYXJlbnRNZW51QmFyID1cbiAgICAgICAgIW1lbnVTdGFjay5jbG9zZVN1Yk1lbnVPZih0aGlzLl9wYXJlbnRNZW51KSAmJiBtZW51U3RhY2sucGVlaygpICE9PSB0aGlzLl9wYXJlbnRNZW51O1xuXG4gICAgICBpZiAoaXNQYXJlbnRNZW51QmFyKSB7XG4gICAgICAgIG1lbnVTdGFjay5jbG9zZUFsbCgpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9nZXRNZW51U3RhY2soKS5jbG9zZUFsbCgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBHZXQgdGhlIGNvbmZpZ3VyYXRpb24gb2JqZWN0IHVzZWQgdG8gY3JlYXRlIHRoZSBvdmVybGF5ICovXG4gIHByaXZhdGUgX2dldE92ZXJsYXlDb25maWcoKSB7XG4gICAgcmV0dXJuIG5ldyBPdmVybGF5Q29uZmlnKHtcbiAgICAgIHBvc2l0aW9uU3RyYXRlZ3k6IHRoaXMuX2dldE92ZXJsYXlQb3NpdGlvblN0cmF0ZWd5KCksXG4gICAgICBzY3JvbGxTdHJhdGVneTogdGhpcy5fb3ZlcmxheS5zY3JvbGxTdHJhdGVnaWVzLmJsb2NrKCksXG4gICAgICBkaXJlY3Rpb246IHRoaXMuX2RpcmVjdGlvbmFsaXR5LFxuICAgIH0pO1xuICB9XG5cbiAgLyoqIEJ1aWxkIHRoZSBwb3NpdGlvbiBzdHJhdGVneSBmb3IgdGhlIG92ZXJsYXkgd2hpY2ggc3BlY2lmaWVzIHdoZXJlIHRvIHBsYWNlIHRoZSBtZW51ICovXG4gIHByaXZhdGUgX2dldE92ZXJsYXlQb3NpdGlvblN0cmF0ZWd5KCk6IEZsZXhpYmxlQ29ubmVjdGVkUG9zaXRpb25TdHJhdGVneSB7XG4gICAgcmV0dXJuIHRoaXMuX292ZXJsYXlcbiAgICAgIC5wb3NpdGlvbigpXG4gICAgICAuZmxleGlibGVDb25uZWN0ZWRUbyh0aGlzLl9lbGVtZW50UmVmKVxuICAgICAgLndpdGhQb3NpdGlvbnModGhpcy5fZ2V0T3ZlcmxheVBvc2l0aW9ucygpKTtcbiAgfVxuXG4gIC8qKiBEZXRlcm1pbmUgYW5kIHJldHVybiB3aGVyZSB0byBwb3NpdGlvbiB0aGUgb3BlbmVkIG1lbnUgcmVsYXRpdmUgdG8gdGhlIG1lbnUgaXRlbSAqL1xuICBwcml2YXRlIF9nZXRPdmVybGF5UG9zaXRpb25zKCk6IENvbm5lY3RlZFBvc2l0aW9uW10ge1xuICAgIC8vIFRPRE86IHVzZSBhIGNvbW1vbiBwb3NpdGlvbmluZyBjb25maWcgZnJvbSAocG9zc2libHkpIGNkay9vdmVybGF5XG4gICAgcmV0dXJuICF0aGlzLl9wYXJlbnRNZW51IHx8IHRoaXMuX3BhcmVudE1lbnUub3JpZW50YXRpb24gPT09ICdob3Jpem9udGFsJ1xuICAgICAgPyBbXG4gICAgICAgICAge29yaWdpblg6ICdzdGFydCcsIG9yaWdpblk6ICdib3R0b20nLCBvdmVybGF5WDogJ3N0YXJ0Jywgb3ZlcmxheVk6ICd0b3AnfSxcbiAgICAgICAgICB7b3JpZ2luWDogJ3N0YXJ0Jywgb3JpZ2luWTogJ3RvcCcsIG92ZXJsYXlYOiAnc3RhcnQnLCBvdmVybGF5WTogJ2JvdHRvbSd9LFxuICAgICAgICAgIHtvcmlnaW5YOiAnZW5kJywgb3JpZ2luWTogJ2JvdHRvbScsIG92ZXJsYXlYOiAnZW5kJywgb3ZlcmxheVk6ICd0b3AnfSxcbiAgICAgICAgICB7b3JpZ2luWDogJ2VuZCcsIG9yaWdpblk6ICd0b3AnLCBvdmVybGF5WDogJ2VuZCcsIG92ZXJsYXlZOiAnYm90dG9tJ30sXG4gICAgICAgIF1cbiAgICAgIDogW1xuICAgICAgICAgIHtvcmlnaW5YOiAnZW5kJywgb3JpZ2luWTogJ3RvcCcsIG92ZXJsYXlYOiAnc3RhcnQnLCBvdmVybGF5WTogJ3RvcCd9LFxuICAgICAgICAgIHtvcmlnaW5YOiAnZW5kJywgb3JpZ2luWTogJ2JvdHRvbScsIG92ZXJsYXlYOiAnc3RhcnQnLCBvdmVybGF5WTogJ2JvdHRvbSd9LFxuICAgICAgICAgIHtvcmlnaW5YOiAnc3RhcnQnLCBvcmlnaW5ZOiAndG9wJywgb3ZlcmxheVg6ICdlbmQnLCBvdmVybGF5WTogJ3RvcCd9LFxuICAgICAgICAgIHtvcmlnaW5YOiAnc3RhcnQnLCBvcmlnaW5ZOiAnYm90dG9tJywgb3ZlcmxheVg6ICdlbmQnLCBvdmVybGF5WTogJ2JvdHRvbSd9LFxuICAgICAgICBdO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgcG9ydGFsIHRvIGJlIGF0dGFjaGVkIHRvIHRoZSBvdmVybGF5IHdoaWNoIGNvbnRhaW5zIHRoZSBtZW51LiBBbGxvd3MgZm9yIHRoZSBtZW51XG4gICAqIGNvbnRlbnQgdG8gY2hhbmdlIGR5bmFtaWNhbGx5IGFuZCBiZSByZWZsZWN0ZWQgaW4gdGhlIGFwcGxpY2F0aW9uLlxuICAgKi9cbiAgcHJpdmF0ZSBfZ2V0UG9ydGFsKCkge1xuICAgIGNvbnN0IGhhc01lbnVDb250ZW50Q2hhbmdlZCA9IHRoaXMubWVudVBhbmVsPy5fdGVtcGxhdGVSZWYgIT09IHRoaXMuX3BhbmVsQ29udGVudD8udGVtcGxhdGVSZWY7XG4gICAgaWYgKHRoaXMubWVudVBhbmVsICYmICghdGhpcy5fcGFuZWxDb250ZW50IHx8IGhhc01lbnVDb250ZW50Q2hhbmdlZCkpIHtcbiAgICAgIHRoaXMuX3BhbmVsQ29udGVudCA9IG5ldyBUZW1wbGF0ZVBvcnRhbCh0aGlzLm1lbnVQYW5lbC5fdGVtcGxhdGVSZWYsIHRoaXMuX3ZpZXdDb250YWluZXJSZWYpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9wYW5lbENvbnRlbnQ7XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybiB0cnVlIGlmIGlmIHRoZSBlbmNsb3NpbmcgcGFyZW50IG1lbnUgaXMgY29uZmlndXJlZCBpbiBhIHZlcnRpY2FsIG9yaWVudGF0aW9uLlxuICAgKi9cbiAgcHJpdmF0ZSBfaXNQYXJlbnRWZXJ0aWNhbCgpIHtcbiAgICByZXR1cm4gdGhpcy5fcGFyZW50TWVudT8ub3JpZW50YXRpb24gPT09ICd2ZXJ0aWNhbCc7XG4gIH1cblxuICAvKipcbiAgICogU3Vic2NyaWJlIHRvIHRoZSBNZW51U3RhY2sgY2xvc2UgZXZlbnRzIGlmIHRoaXMgaXMgYSBzdGFuZGFsb25lIHRyaWdnZXIgYW5kIGNsb3NlIG91dCB0aGUgbWVudVxuICAgKiB0aGlzIHRyaWdnZXJzIHdoZW4gcmVxdWVzdGVkLlxuICAgKi9cbiAgcHJpdmF0ZSBfcmVnaXN0ZXJDbG9zZUhhbmRsZXIoKSB7XG4gICAgaWYgKCF0aGlzLl9wYXJlbnRNZW51KSB7XG4gICAgICB0aGlzLl9tZW51U3RhY2suY2xvc2VkLnBpcGUodGFrZVVudGlsKHRoaXMuX2Rlc3Ryb3llZCkpLnN1YnNjcmliZShpdGVtID0+IHtcbiAgICAgICAgaWYgKGl0ZW0gPT09IHRoaXMuX21lbnVQYW5lbD8uX21lbnUpIHtcbiAgICAgICAgICB0aGlzLmNsb3NlTWVudSgpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvKiogR2V0IHRoZSBtZW51IHN0YWNrIGZvciB0aGlzIHRyaWdnZXIgLSBlaXRoZXIgZnJvbSB0aGUgcGFyZW50IG9yIHRoaXMgdHJpZ2dlci4gKi9cbiAgcHJpdmF0ZSBfZ2V0TWVudVN0YWNrKCkge1xuICAgIC8vIFdlIHVzZSBhIGZ1bmN0aW9uIHNpbmNlIGF0IHRoZSBjb25zdHJ1Y3Rpb24gb2YgdGhlIE1lbnVJdGVtVHJpZ2dlciB0aGUgcGFyZW50IE1lbnUgd29uJ3QgaGF2ZVxuICAgIC8vIGl0cyBtZW51IHN0YWNrIHNldC4gVGhlcmVmb3JlIHdlIG5lZWQgdG8gcmVmZXJlbmNlIHRoZSBtZW51IHN0YWNrIGZyb20gdGhlIHBhcmVudCBlYWNoIHRpbWVcbiAgICAvLyB3ZSB3YW50IHRvIHVzZSBpdC5cbiAgICByZXR1cm4gdGhpcy5fcGFyZW50TWVudT8uX21lbnVTdGFjayB8fCB0aGlzLl9tZW51U3RhY2s7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICB0aGlzLl9kZXN0cm95T3ZlcmxheSgpO1xuICAgIHRoaXMuX3Jlc2V0UGFuZWxNZW51U3RhY2soKTtcblxuICAgIHRoaXMuX2Rlc3Ryb3llZC5uZXh0KCk7XG4gICAgdGhpcy5fZGVzdHJveWVkLmNvbXBsZXRlKCk7XG4gIH1cblxuICAvKiogU2V0IHRoZSBtZW51IHBhbmVscyBtZW51IHN0YWNrIGJhY2sgdG8gbnVsbC4gKi9cbiAgcHJpdmF0ZSBfcmVzZXRQYW5lbE1lbnVTdGFjaygpIHtcbiAgICAvLyBJZiBhIENka01lbnVUcmlnZ2VyIGlzIHBsYWNlZCBpbiBhIHN1Ym1lbnUsIGVhY2ggdGltZSB0aGUgdHJpZ2dlciBpcyByZW5kZXJlZCAoaXRzIHBhcmVudFxuICAgIC8vIG1lbnUgaXMgb3BlbmVkKSB0aGUgcGFuZWwgc2V0dGVyIGZvciBDZGtNZW51UGFuZWwgaXMgY2FsbGVkLiBGcm9tIHRoZSBmaXJzdCByZW5kZXIgb253YXJkLFxuICAgIC8vIHRoZSBhdHRhY2hlZCBDZGtNZW51UGFuZWwgaGFzIHRoZSBNZW51U3RhY2sgc2V0LiBTaW5jZSB3ZSB0aHJvdyBhbiBlcnJvciBpZiBhIHBhbmVsIGFscmVhZHlcbiAgICAvLyBoYXMgYSBzdGFjayBzZXQsIHdlIHdhbnQgdG8gcmVzZXQgdGhlIGF0dGFjaGVkIHN0YWNrIGhlcmUgdG8gcHJldmVudCB0aGUgZXJyb3IgZnJvbSBiZWluZ1xuICAgIC8vIHRocm93biBpZiB0aGUgdHJpZ2dlciByZS1jb25maWd1cmVzIGl0cyBhdHRhY2hlZCBwYW5lbCAoaW4gdGhlIGNhc2Ugd2hlcmUgdGhlcmUgaXMgYSAxOjFcbiAgICAvLyByZWxhdGlvbnNoaXAgYmV0d2VlbiB0aGUgcGFuZWwgYW5kIHRyaWdnZXIpLlxuICAgIGlmICh0aGlzLl9tZW51UGFuZWwpIHtcbiAgICAgIHRoaXMuX21lbnVQYW5lbC5fbWVudVN0YWNrID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU3Vic2NyaWJlIHRvIHRoZSBvdmVybGF5cyBvdXRzaWRlIHBvaW50ZXIgZXZlbnRzIHN0cmVhbSBhbmQgaGFuZGxlIGNsb3Npbmcgb3V0IHRoZSBzdGFjayBpZiBhXG4gICAqIGNsaWNrIG9jY3VycyBvdXRzaWRlIHRoZSBtZW51cy5cbiAgICovXG4gIHByaXZhdGUgX3N1YnNjcmliZVRvT3V0c2lkZUNsaWNrcygpIHtcbiAgICBpZiAodGhpcy5fb3ZlcmxheVJlZikge1xuICAgICAgdGhpcy5fb3ZlcmxheVJlZlxuICAgICAgICAub3V0c2lkZVBvaW50ZXJFdmVudHMoKVxuICAgICAgICAucGlwZSh0YWtlVW50aWwodGhpcy5fc3RvcE91dHNpZGVDbGlja3NMaXN0ZW5lcikpXG4gICAgICAgIC5zdWJzY3JpYmUoZXZlbnQgPT4ge1xuICAgICAgICAgIGlmICghaXNDbGlja0luc2lkZU1lbnVPdmVybGF5KGV2ZW50LnRhcmdldCBhcyBFbGVtZW50KSkge1xuICAgICAgICAgICAgdGhpcy5fZ2V0TWVudVN0YWNrKCkuY2xvc2VBbGwoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBEZXN0cm95IGFuZCB1bnNldCB0aGUgb3ZlcmxheSByZWZlcmVuY2UgaXQgaWYgZXhpc3RzICovXG4gIHByaXZhdGUgX2Rlc3Ryb3lPdmVybGF5KCkge1xuICAgIGlmICh0aGlzLl9vdmVybGF5UmVmKSB7XG4gICAgICB0aGlzLl9vdmVybGF5UmVmLmRpc3Bvc2UoKTtcbiAgICAgIHRoaXMuX292ZXJsYXlSZWYgPSBudWxsO1xuICAgIH1cbiAgfVxufVxuIl19