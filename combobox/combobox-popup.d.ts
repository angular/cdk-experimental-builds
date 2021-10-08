/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ElementRef, InjectionToken, OnInit } from '@angular/core';
import { AriaHasPopupValue, CdkComboboxPanel } from './combobox-panel';
import * as i0 from "@angular/core";
export declare const PANEL: InjectionToken<CdkComboboxPanel<unknown>>;
export declare class CdkComboboxPopup<T = unknown> implements OnInit {
    private readonly _elementRef;
    readonly _parentPanel?: CdkComboboxPanel<T> | undefined;
    get role(): AriaHasPopupValue;
    set role(value: AriaHasPopupValue);
    private _role;
    get firstFocus(): HTMLElement;
    set firstFocus(id: HTMLElement);
    private _firstFocusElement;
    id: string;
    private readonly _explicitPanel;
    constructor(_elementRef: ElementRef<HTMLElement>, _parentPanel?: CdkComboboxPanel<T> | undefined);
    ngOnInit(): void;
    registerWithPanel(): void;
    focusFirstElement(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<CdkComboboxPopup<any>, [null, { optional: true; }]>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<CdkComboboxPopup<any>, "[cdkComboboxPopup]", ["cdkComboboxPopup"], { "role": "role"; "firstFocus": "firstFocus"; "id": "id"; "_explicitPanel": "parentPanel"; }, {}, never>;
}
