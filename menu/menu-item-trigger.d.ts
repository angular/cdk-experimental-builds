/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ElementRef, Injector, NgZone, OnDestroy, ViewContainerRef } from '@angular/core';
import { Directionality } from '@angular/cdk/bidi';
import { Overlay } from '@angular/cdk/overlay';
import { Menu } from './menu-interface';
import { MenuStack } from './menu-stack';
import { MenuAim } from './menu-aim';
import { MenuTrigger } from './menu-trigger';
import * as i0 from "@angular/core";
/**
 * Whether the target element is a menu item to be ignored by the overlay background click handler.
 */
export declare function isClickInsideMenuOverlay(target: Element): boolean;
/**
 * A directive to be combined with CdkMenuItem which opens the Menu it is bound to. If the
 * element is in a top level MenuBar it will open the menu on click, or if a sibling is already
 * opened it will open on hover. If it is inside of a Menu it will open the attached Submenu on
 * hover regardless of its sibling state.
 *
 * The directive must be placed along with the `cdkMenuItem` directive in order to enable full
 * functionality.
 */
export declare class CdkMenuItemTrigger extends MenuTrigger implements OnDestroy {
    private readonly _elementRef;
    protected readonly _viewContainerRef: ViewContainerRef;
    private readonly _overlay;
    private readonly _ngZone;
    private readonly _parentMenu?;
    private readonly _menuAim?;
    private readonly _directionality?;
    constructor(injector: Injector, _elementRef: ElementRef<HTMLElement>, _viewContainerRef: ViewContainerRef, _overlay: Overlay, _ngZone: NgZone, menuStack: MenuStack, _parentMenu?: Menu | undefined, _menuAim?: MenuAim | undefined, _directionality?: Directionality | undefined);
    /** Open/close the attached menu if the trigger has been configured with one */
    toggle(): void;
    /** Open the attached menu. */
    open(): void;
    /** Close the opened menu. */
    close(): void;
    /**
     * Get a reference to the rendered Menu if the Menu is open and it is visible in the DOM.
     * @return the menu if it is open, otherwise undefined.
     */
    getMenu(): Menu | undefined;
    /**
     * Subscribe to the mouseenter events and close any sibling menu items if this element is moused
     * into.
     */
    private _subscribeToMouseEnter;
    /**
     * Handles keyboard events for the menu item, specifically opening/closing the attached menu and
     * focusing the appropriate submenu item.
     * @param event the keyboard event to handle
     */
    _toggleOnKeydown(event: KeyboardEvent): void;
    /** Close out any sibling menu trigger menus. */
    private _closeSiblingTriggers;
    /** Get the configuration object used to create the overlay */
    private _getOverlayConfig;
    /** Build the position strategy for the overlay which specifies where to place the menu */
    private _getOverlayPositionStrategy;
    /** Determine and return where to position the opened menu relative to the menu item */
    private _getOverlayPositions;
    /**
     * Get the portal to be attached to the overlay which contains the menu. Allows for the menu
     * content to change dynamically and be reflected in the application.
     */
    private _getPortal;
    /**
     * @return true if if the enclosing parent menu is configured in a vertical orientation.
     */
    private _isParentVertical;
    /**
     * Subscribe to the MenuStack close events if this is a standalone trigger and close out the menu
     * this triggers when requested.
     */
    private _registerCloseHandler;
    /**
     * Subscribe to the overlays outside pointer events stream and handle closing out the stack if a
     * click occurs outside the menus.
     */
    private _subscribeToOutsideClicks;
    static ɵfac: i0.ɵɵFactoryDeclaration<CdkMenuItemTrigger, [null, null, null, null, null, null, { optional: true; }, { optional: true; }, { optional: true; }]>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<CdkMenuItemTrigger, "[cdkMenuTriggerFor]", ["cdkMenuTriggerFor"], { "_menuTemplateRef": "cdkMenuTriggerFor"; "menuPosition": "cdkMenuPosition"; }, { "opened": "cdkMenuOpened"; "closed": "cdkMenuClosed"; }, never>;
}
