/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { BooleanInput } from '@angular/cdk/coercion';
import { CdkMenuItemTrigger } from './menu-item-trigger';
/**
 * Directive which provides the ability for an element to be focused and navigated to using the
 * keyboard when residing in a CdkMenu, CdkMenuBar, or CdkMenuGroup. It performs user defined
 * behavior when clicked.
 */
export declare class CdkMenuItem {
    /** Reference to the CdkMenuItemTrigger directive if one is added to the same element */
    private readonly _menuTrigger?;
    /**  Whether the CdkMenuItem is disabled - defaults to false */
    get disabled(): boolean;
    set disabled(value: boolean);
    private _disabled;
    constructor(
    /** Reference to the CdkMenuItemTrigger directive if one is added to the same element */
    _menuTrigger?: CdkMenuItemTrigger | undefined);
    /** Open the menu if one is attached */
    trigger(): void;
    /** Whether the menu item opens a menu. */
    hasMenu(): boolean;
    static ngAcceptInputType_disabled: BooleanInput;
}
