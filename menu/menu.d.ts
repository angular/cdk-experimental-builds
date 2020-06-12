/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { EventEmitter } from '@angular/core';
import { CdkMenuItem } from './menu-item';
/**
 * Directive which configures the element as a Menu which should contain child elements marked as
 * CdkMenuItem or CdkMenuGroup. Sets the appropriate role and aria-attributes for a menu and
 * contains accessable keyboard and mouse handling logic.
 *
 * It also acts as a RadioGroup for elements marked with role `menuitemradio`.
 */
export declare class CdkMenu {
    /**
     * Sets the aria-orientation attribute and determines where sub-menus will be opened.
     * Does not affect styling/layout.
     */
    orientation: 'horizontal' | 'vertical';
    /** Event emitted when the menu is closed. */
    readonly closed: EventEmitter<void | 'click' | 'tab' | 'escape'>;
    /** Emits the activated element when checkbox or radiobutton state changed  */
    change: EventEmitter<CdkMenuItem>;
}
