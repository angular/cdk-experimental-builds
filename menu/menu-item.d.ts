/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { BooleanInput } from '@angular/cdk/coercion';
/**
 * Directive which provides the ability for an element to be focused and navigated to using the
 * keyboard when residing in a CdkMenu, CdkMenuBar, or CdkMenuGroup. It performs user defined
 * behavior when clicked.
 */
export declare class CdkMenuItem {
    /**  Whether the CdkMenuItem is disabled - defaults to false */
    get disabled(): boolean;
    set disabled(value: boolean);
    private _disabled;
    /** Whether the menu item opens a menu */
    hasSubmenu: boolean;
    static ngAcceptInputType_disabled: BooleanInput;
}
