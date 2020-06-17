/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { AfterContentInit, EventEmitter, OnDestroy } from '@angular/core';
import { BooleanInput } from '@angular/cdk/coercion';
import { CdkMenuPanel } from './menu-panel';
import { CdkMenuGroup } from './menu-group';
import { MenuItem } from './menu-item-interface';
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
export declare class CdkMenuItem implements AfterContentInit, MenuItem, OnDestroy {
    /** reference a parent CdkMenuGroup component */
    private readonly _menuGroup;
    /** Template reference variable to the menu this trigger opens */
    _menuPanel?: CdkMenuPanel;
    /** ARIA role for the menu item. */
    role: 'menuitem' | 'menuitemradio' | 'menuitemcheckbox';
    /** Whether the checkbox or radiobutton is checked */
    get checked(): boolean;
    set checked(value: boolean);
    private _checked;
    /**  Whether the CdkMenuItem is disabled - defaults to false */
    get disabled(): boolean;
    set disabled(value: boolean);
    private _disabled;
    /** Emits when the attached submenu is opened */
    opened: EventEmitter<void>;
    /** Emits when the component gets destroyed */
    private readonly _destroyed;
    constructor(
    /** reference a parent CdkMenuGroup component */
    _menuGroup: CdkMenuGroup);
    /** Configure event subscriptions */
    ngAfterContentInit(): void;
    /**
     * If the role is menuitemcheckbox or menuitemradio and not disabled, emits a change event
     * on the enclosing parent MenuGroup.
     */
    trigger(): void;
    /** Whether the menu item opens a menu */
    hasSubmenu(): boolean;
    /** get the aria-checked value only if element is `menuitemradio` or `menuitemcheckbox` */
    _getAriaChecked(): boolean | null;
    /**
     * Toggle the checked state of the menuitemradio or menuitemcheckbox component
     */
    private _toggleCheckedState;
    ngOnDestroy(): void;
    static ngAcceptInputType_checked: BooleanInput;
    static ngAcceptInputType_disabled: BooleanInput;
}
