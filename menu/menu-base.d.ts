/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { CdkMenuGroup } from './menu-group';
import { AfterContentInit, ElementRef, OnDestroy, QueryList } from '@angular/core';
import { FocusKeyManager, FocusOrigin } from '@angular/cdk/a11y';
import { CdkMenuItem } from './menu-item';
import { Subject } from 'rxjs';
import { Directionality } from '@angular/cdk/bidi';
import { MenuStack, MenuStackItem } from './menu-stack';
import { Menu } from './menu-interface';
import { PointerFocusTracker } from './pointer-focus-tracker';
import * as i0 from "@angular/core";
export declare abstract class CdkMenuBase extends CdkMenuGroup implements Menu, AfterContentInit, OnDestroy {
    readonly _elementRef: ElementRef<HTMLElement>;
    readonly menuStack: MenuStack;
    protected readonly dir?: Directionality | undefined;
    id: string;
    /**
     * Sets the aria-orientation attribute and determines where menus will be opened.
     * Does not affect styling/layout.
     */
    orientation: 'horizontal' | 'vertical';
    _isInline: boolean;
    _hasFocus: boolean;
    /** All child MenuItem elements nested in this Menu. */
    protected readonly items: QueryList<CdkMenuItem>;
    /** Handles keyboard events for the menu. */
    protected keyManager: FocusKeyManager<CdkMenuItem>;
    /** Emits when the MenuBar is destroyed. */
    protected readonly destroyed: Subject<void>;
    /** The Menu Item which triggered the open submenu. */
    protected openItem?: CdkMenuItem;
    /** Manages items under mouse focus */
    protected pointerTracker?: PointerFocusTracker<CdkMenuItem>;
    protected constructor(_elementRef: ElementRef<HTMLElement>, menuStack: MenuStack, dir?: Directionality | undefined);
    ngAfterContentInit(): void;
    ngOnDestroy(): void;
    /** Place focus on the first MenuItem in the menu and set the focus origin. */
    focusFirstItem(focusOrigin?: FocusOrigin): void;
    /** Place focus on the last MenuItem in the menu and set the focus origin. */
    focusLastItem(focusOrigin?: FocusOrigin): void;
    /** Return true if this menu has been configured in a horizontal orientation. */
    protected isHorizontal(): boolean;
    /** Return true if the MenuBar has an open submenu. */
    protected hasOpenSubmenu(): boolean;
    /**
     * Close the open menu if the current active item opened the requested MenuStackItem.
     * @param menu the MenuStackItem requested to be closed.
     * @param focusParentTrigger whether to focus the parent trigger after closing the menu.
     */
    protected closeOpenMenu(menu?: MenuStackItem, focusParentTrigger?: boolean): void;
    /** Setup the FocusKeyManager with the correct orientation for the menu. */
    private _setKeyManager;
    /**
     * Subscribe to the menu trigger's open events in order to track the trigger which opened the menu
     * and stop tracking it when the menu is closed.
     */
    private _subscribeToMenuOpen;
    /** Subscribe to the MenuStack close and empty observables. */
    private _subscribeToMenuStackClosed;
    private _subscribeToHasFocus;
    static ɵfac: i0.ɵɵFactoryDeclaration<CdkMenuBase, [null, null, { optional: true; }]>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<CdkMenuBase, never, never, { "id": "id"; }, {}, ["items"]>;
}
