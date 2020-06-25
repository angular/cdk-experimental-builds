/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { EventEmitter, ElementRef, ViewContainerRef, OnDestroy } from '@angular/core';
import { Directionality } from '@angular/cdk/bidi';
import { Overlay } from '@angular/cdk/overlay';
import { CdkMenuPanel } from './menu-panel';
import { Menu } from './menu-interface';
/**
 * A directive to be combined with CdkMenuItem which opens the Menu it is bound to. If the
 * element is in a top level MenuBar it will open the menu on click, or if a sibling is already
 * opened it will open on hover. If it is inside of a Menu it will open the attached Submenu on
 * hover regardless of its sibling state.
 *
 * The directive must be placed along with the `cdkMenuItem` directive in order to enable full
 * functionality.
 */
export declare class CdkMenuItemTrigger implements OnDestroy {
    private readonly _elementRef;
    protected readonly _viewContainerRef: ViewContainerRef;
    private readonly _overlay;
    private readonly _directionality;
    private readonly _parentMenu;
    /** Template reference variable to the menu this trigger opens */
    _menuPanel?: CdkMenuPanel;
    /** Emits when the attached submenu is requested to open */
    readonly opened: EventEmitter<void>;
    /** Emits when the attached submenu is requested to close  */
    readonly closed: EventEmitter<void>;
    /** A reference to the overlay which manages the triggered submenu */
    private _overlayRef;
    /** The content of the menu panel opened by this trigger. */
    private _panelContent;
    constructor(_elementRef: ElementRef<HTMLElement>, _viewContainerRef: ViewContainerRef, _overlay: Overlay, _directionality: Directionality, _parentMenu: Menu);
    /** Open/close the attached submenu if the trigger has been configured with one */
    toggle(): void;
    /** Return true if the trigger has an attached menu */
    hasSubmenu(): boolean;
    /** Whether the submenu this button is a trigger for is open */
    isSubmenuOpen(): boolean;
    /** Open the attached submenu */
    private _openSubmenu;
    /** Close the opened submenu */
    private _closeSubmenu;
    /** Get the configuration object used to create the overlay */
    private _getOverlayConfig;
    /** Build the position strategy for the overlay which specifies where to place the submenu */
    private _getOverlayPositionStrategy;
    /** Determine and return where to position the submenu relative to the menu item */
    private _getOverlayPositions;
    /**
     * Get the portal to be attached to the overlay which contains the menu. Allows for the menu
     * content to change dynamically and be reflected in the application.
     */
    private _getPortal;
    ngOnDestroy(): void;
    /** Destroy and unset the overlay reference it if exists */
    private _destroyOverlay;
}
