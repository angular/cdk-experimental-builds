/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { UniqueSelectionDispatcher } from '@angular/cdk/collections';
import { OnDestroy } from '@angular/core';
import { CdkMenuItemSelectable } from './menu-item-selectable';
/**
 * A directive providing behavior for the the "menuitemradio" ARIA role, which behaves similarly to
 * a conventional radio-button. Any sibling `CdkMenuItemRadio` instances within the same `CdkMenu`
 * or `CdkMenuGroup` comprise a radio group with unique selection enforced.
 */
export declare class CdkMenuItemRadio extends CdkMenuItemSelectable implements OnDestroy {
    private readonly _selectionDispatcher;
    /** Function to unregister the selection dispatcher */
    private _removeDispatcherListener;
    constructor(_selectionDispatcher: UniqueSelectionDispatcher);
    /** Configure the unique selection dispatcher listener in order to toggle the checked state  */
    private _registerDispatcherListener;
    /** Toggles the checked state of the radio-button. */
    trigger(): void;
    ngOnDestroy(): void;
}
