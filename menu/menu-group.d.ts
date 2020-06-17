/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { EventEmitter } from '@angular/core';
import { MenuItem } from './menu-item-interface';
/**
 * Directive which acts as a grouping container for `CdkMenuItem` instances with
 * `role="menuitemradio"`, similar to a `role="radiogroup"` element.
 */
export declare class CdkMenuGroup {
    /** Emits the element when checkbox or radiobutton state changed  */
    change: EventEmitter<MenuItem>;
    /**
     * Emits events for the clicked MenuItem
     * @param menuItem The clicked MenuItem to handle
     */
    _registerTriggeredItem(menuItem: MenuItem): void;
}
