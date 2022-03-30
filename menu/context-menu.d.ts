/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Injector, OnDestroy, ViewContainerRef } from '@angular/core';
import { Directionality } from '@angular/cdk/bidi';
import { Overlay } from '@angular/cdk/overlay';
import { BooleanInput } from '@angular/cdk/coercion';
import { MenuStack } from './menu-stack';
import { MenuTrigger } from './menu-trigger';
import * as i0 from "@angular/core";
/** Tracks the last open context menu trigger across the entire application. */
export declare class ContextMenuTracker {
    /** The last open context menu trigger. */
    private static _openContextMenuTrigger?;
    /**
     * Close the previous open context menu and set the given one as being open.
     * @param trigger the trigger for the currently open Context Menu.
     */
    update(trigger: CdkContextMenuTrigger): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<ContextMenuTracker, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<ContextMenuTracker>;
}
/** The coordinates of where the context menu should open. */
export declare type ContextMenuCoordinates = {
    x: number;
    y: number;
};
/**
 * A directive which when placed on some element opens a the Menu it is bound to when a user
 * right-clicks within that element. It is aware of nested Context Menus and the lowest level
 * non-disabled context menu will trigger.
 */
export declare class CdkContextMenuTrigger extends MenuTrigger implements OnDestroy {
    protected readonly _viewContainerRef: ViewContainerRef;
    private readonly _overlay;
    private readonly _contextMenuTracker;
    private readonly _directionality?;
    /** Whether the context menu should be disabled. */
    get disabled(): boolean;
    set disabled(value: BooleanInput);
    private _disabled;
    constructor(injector: Injector, _viewContainerRef: ViewContainerRef, _overlay: Overlay, _contextMenuTracker: ContextMenuTracker, menuStack: MenuStack, _directionality?: Directionality | undefined);
    /**
     * Open the attached menu at the specified location.
     * @param coordinates where to open the context menu
     */
    open(coordinates: ContextMenuCoordinates): void;
    private _open;
    /** Close the opened menu. */
    close(): void;
    /**
     * Open the context menu and close any previously open menus.
     * @param event the mouse event which opens the context menu.
     */
    _openOnContextMenu(event: MouseEvent): void;
    /**
     * Get the configuration object used to create the overlay.
     * @param coordinates the location to place the opened menu
     */
    private _getOverlayConfig;
    /**
     * Build the position strategy for the overlay which specifies where to place the menu.
     * @param coordinates the location to place the opened menu
     */
    private _getOverlayPositionStrategy;
    /**
     * Get the portal to be attached to the overlay which contains the menu. Allows for the menu
     * content to change dynamically and be reflected in the application.
     */
    private _getMenuContent;
    /** Subscribe to the menu stack close events and close this menu when requested. */
    private _setMenuStackListener;
    /**
     * Subscribe to the overlays outside pointer events stream and handle closing out the stack if a
     * click occurs outside the menus.
     */
    private _subscribeToOutsideClicks;
    static ɵfac: i0.ɵɵFactoryDeclaration<CdkContextMenuTrigger, [null, null, null, null, null, { optional: true; }]>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<CdkContextMenuTrigger, "[cdkContextMenuTriggerFor]", ["cdkContextMenuTriggerFor"], { "_menuTemplateRef": "cdkContextMenuTriggerFor"; "menuPosition": "cdkContextMenuPosition"; "disabled": "cdkContextMenuDisabled"; }, { "opened": "cdkContextMenuOpened"; "closed": "cdkContextMenuClosed"; }, never>;
}
