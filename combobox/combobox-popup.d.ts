/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ElementRef, OnInit } from '@angular/core';
import { AriaHasPopupValue, CdkCombobox } from './combobox';
import * as i0 from "@angular/core";
export declare class CdkComboboxPopup<T = unknown> implements OnInit {
    private readonly _elementRef;
    private readonly _combobox;
    get role(): AriaHasPopupValue;
    set role(value: AriaHasPopupValue);
    private _role;
    get firstFocus(): HTMLElement;
    set firstFocus(id: HTMLElement);
    private _firstFocusElement;
    id: string;
    constructor(_elementRef: ElementRef<HTMLElement>, _combobox: CdkCombobox);
    ngOnInit(): void;
    registerWithPanel(): void;
    focusFirstElement(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<CdkComboboxPopup<any>, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<CdkComboboxPopup<any>, "[cdkComboboxPopup]", ["cdkComboboxPopup"], { "role": "role"; "firstFocus": "firstFocus"; "id": "id"; }, {}, never, never, false>;
}
