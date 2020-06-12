/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Directive applied to an element which configures it as a MenuBar by setting the appropriate
 * role, aria attributes, and accessable keyboard and mouse handling logic. The component that
 * this directive is applied to should contain components marked with CdkMenuItem.
 *
 */
export declare class CdkMenuBar {
    /**
     * Sets the aria-orientation attribute and determines where sub-menus will be opened.
     * Does not affect styling/layout.
     */
    orientation: 'horizontal' | 'vertical';
}
