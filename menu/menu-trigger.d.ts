/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { InjectionToken, Injector } from '@angular/core';
import { Menu } from './menu-interface';
import { MenuStack } from './menu-stack';
import * as i0 from "@angular/core";
/** Injection token used for an implementation of MenuStack. */
export declare const MENU_TRIGGER: InjectionToken<MenuTrigger>;
export declare class MenuTrigger {
    protected injector: Injector;
    protected menuStack: MenuStack;
    private _childMenuInjector?;
    protected childMenu?: Menu;
    constructor(injector: Injector, menuStack: MenuStack);
    protected getChildMenuInjector(): Injector;
    registerChildMenu(child: Menu): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<MenuTrigger, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<MenuTrigger>;
}
