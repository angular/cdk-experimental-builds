/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { AfterContentInit } from '@angular/core';
import { CdkMenuPanel } from './menu-panel';
import { CdkMenuItem } from './menu-item';
/**
 * A directive to be combined with CdkMenuItem which opens the Menu it is bound to. If the
 * element is in a top level MenuBar it will open the menu on click, or if a sibling is already
 * opened it will open on hover. If it is inside of a Menu it will open the attached Submenu on
 * hover regardless of its sibling state.
 *
 * The directive must be placed along with the `cdkMenuItem` directive in order to enable full
 * functionality.
 */
export declare class CdkMenuItemTrigger implements AfterContentInit {
    /** The MenuItem instance which is the trigger  */
    private _menuItemInstance?;
    /** Template reference variable to the menu this trigger opens */
    _menuPanel?: CdkMenuPanel;
    constructor(
    /** The MenuItem instance which is the trigger  */
    _menuItemInstance?: CdkMenuItem | undefined);
    ngAfterContentInit(): void;
    /** Set the hasSubmenu property on the menuitem  */
    private _setHasSubmenu;
    /** Return true if the trigger has an attached menu */
    private _hasSubmenu;
}
