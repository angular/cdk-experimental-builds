/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { BooleanInput } from '@angular/cdk/coercion';
import { CdkMenuItem } from './menu-item';
import * as i0 from "@angular/core";
/**
 * Base class providing checked state for MenuItems along with outputting a clicked event when the
 * element is triggered. It provides functionality for selectable elements.
 */
export declare abstract class CdkMenuItemSelectable extends CdkMenuItem {
    /** Whether the element is checked */
    get checked(): boolean;
    set checked(value: BooleanInput);
    private _checked;
    protected closeOnSpacebarTrigger: boolean;
    static ɵfac: i0.ɵɵFactoryDeclaration<CdkMenuItemSelectable, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<CdkMenuItemSelectable, never, never, { "checked": "cdkMenuItemChecked"; }, {}, never>;
}
