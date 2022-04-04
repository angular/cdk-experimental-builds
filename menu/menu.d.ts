/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { AfterContentInit, ElementRef, EventEmitter, NgZone, OnDestroy } from '@angular/core';
import { Directionality } from '@angular/cdk/bidi';
import { MenuStack } from './menu-stack';
import { MenuAim } from './menu-aim';
import { MenuTrigger } from './menu-trigger';
import { CdkMenuBase } from './menu-base';
import * as i0 from "@angular/core";
/**
 * Directive which configures the element as a Menu which should contain child elements marked as
 * CdkMenuItem or CdkMenuGroup. Sets the appropriate role and aria-attributes for a menu and
 * contains accessible keyboard and mouse handling logic.
 *
 * It also acts as a RadioGroup for elements marked with role `menuitemradio`.
 */
export declare class CdkMenu extends CdkMenuBase implements AfterContentInit, OnDestroy {
    private readonly _ngZone;
    private _parentTrigger?;
    private readonly _menuAim?;
    /** Event emitted when the menu is closed. */
    readonly closed: EventEmitter<void>;
    _isInline: boolean;
    constructor(_ngZone: NgZone, elementRef: ElementRef<HTMLElement>, menuStack: MenuStack, _parentTrigger?: MenuTrigger | undefined, _menuAim?: MenuAim | undefined, dir?: Directionality);
    ngAfterContentInit(): void;
    ngOnDestroy(): void;
    /** Handle keyboard events for the Menu. */
    _handleKeyEvent(event: KeyboardEvent): void;
    /**
     * Set the PointerFocusTracker and ensure that when mouse focus changes the key manager is updated
     * with the latest menu item under mouse focus.
     */
    private _subscribeToMouseManager;
    /** Set focus the either the current, previous or next item based on the FocusNext event. */
    private _toggleMenuFocus;
    private _subscribeToMenuStackEmptied;
    static ɵfac: i0.ɵɵFactoryDeclaration<CdkMenu, [null, null, null, { optional: true; }, { optional: true; self: true; }, { optional: true; }]>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<CdkMenu, "[cdkMenu]", ["cdkMenu"], {}, { "closed": "closed"; }, never>;
}
