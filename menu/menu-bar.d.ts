/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { AfterContentInit, ElementRef, NgZone, OnDestroy } from '@angular/core';
import { Directionality } from '@angular/cdk/bidi';
import { MenuStack } from './menu-stack';
import { MenuAim } from './menu-aim';
import { CdkMenuBase } from './menu-base';
import * as i0 from "@angular/core";
/**
 * Directive applied to an element which configures it as a MenuBar by setting the appropriate
 * role, aria attributes, and accessible keyboard and mouse handling logic. The component that
 * this directive is applied to should contain components marked with CdkMenuItem.
 *
 */
export declare class CdkMenuBar extends CdkMenuBase implements AfterContentInit, OnDestroy {
    private readonly _ngZone;
    private readonly _menuAim?;
    readonly orientation: 'horizontal' | 'vertical';
    menuStack: MenuStack;
    constructor(_ngZone: NgZone, elementRef: ElementRef<HTMLElement>, menuStack: MenuStack, _menuAim?: MenuAim | undefined, dir?: Directionality);
    ngAfterContentInit(): void;
    ngOnDestroy(): void;
    /**
     * Handle keyboard events, specifically changing the focused element and/or toggling the active
     * items menu.
     * @param event the KeyboardEvent to handle.
     */
    _handleKeyEvent(event: KeyboardEvent): void;
    /**
     * Set the PointerFocusTracker and ensure that when mouse focus changes the key manager is updated
     * with the latest menu item under mouse focus.
     */
    private _subscribeToMouseManager;
    /**
     * Set focus to either the current, previous or next item based on the FocusNext event, then
     * open the previous or next item.
     */
    private _toggleOpenMenu;
    private _subscribeToMenuStackEmptied;
    static ɵfac: i0.ɵɵFactoryDeclaration<CdkMenuBar, [null, null, null, { optional: true; self: true; }, { optional: true; }]>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<CdkMenuBar, "[cdkMenuBar]", ["cdkMenuBar"], {}, {}, never>;
}
