/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { EventEmitter } from '@angular/core';
import { CdkMenuPanel } from './menu-panel';
import { BooleanInput } from '@angular/cdk/coercion';
/**
 * Directive which provides behavior for an element which when clicked:
 *  If located in a CdkMenuBar:
 *    - opens up an attached submenu
 *
 *  If located in a CdkMenu/CdkMenuGroup, one of:
 *    - executes the user defined click handler
 *    - toggles its checkbox state
 *    - toggles its radio button state (in relation to siblings)
 *
 * If it's in a CdkMenu and it triggers a sub-menu, hovering over the
 * CdkMenuItem will open the submenu.
 *
 */
export declare class CdkMenuItem {
    /** Template reference variable to the menu this trigger opens */
    _menuPanel: CdkMenuPanel;
    /** ARIA role for the menu item. */
    role: 'menuitem' | 'menuitemradio' | 'menuitemcheckbox';
    /** Whether the checkbox or radiobutton is checked */
    get checked(): boolean;
    set checked(value: boolean);
    private _checked;
    /** Emits when the attached submenu is opened */
    opened: EventEmitter<void>;
    /** get the aria-checked value only if element is `menuitemradio` or `menuitemcheckbox` */
    _getAriaChecked(): boolean | null;
    /** Whether the menu item opens a menu */
    hasSubmenu(): boolean;
    static ngAcceptInputType_checked: BooleanInput;
}
