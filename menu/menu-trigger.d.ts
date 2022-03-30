/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { EventEmitter, InjectionToken, Injector, OnDestroy, TemplateRef } from '@angular/core';
import { Menu } from './menu-interface';
import { MenuStack } from './menu-stack';
import { ConnectedPosition, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { Subject } from 'rxjs';
import * as i0 from "@angular/core";
/** Injection token used for an implementation of MenuStack. */
export declare const MENU_TRIGGER: InjectionToken<MenuTrigger>;
export declare abstract class MenuTrigger implements OnDestroy {
    protected injector: Injector;
    protected menuStack: MenuStack;
    /** A list of preferred menu positions to be used when constructing the `FlexibleConnectedPositionStrategy` for this trigger's menu. */
    menuPosition: ConnectedPosition[];
    /** Emits when the attached menu is requested to open */
    readonly opened: EventEmitter<void>;
    /** Emits when the attached menu is requested to close */
    readonly closed: EventEmitter<void>;
    /** Template reference variable to the menu this trigger opens */
    protected _menuTemplateRef: TemplateRef<unknown>;
    /** A reference to the overlay which manages the triggered menu */
    protected _overlayRef: OverlayRef | null;
    /** The content of the menu panel opened by this trigger. */
    protected _menuPortal: TemplatePortal;
    /** Emits when this trigger is destroyed. */
    protected readonly _destroyed: Subject<void>;
    /** Emits when the outside pointer events listener on the overlay should be stopped. */
    protected readonly _stopOutsideClicksListener: import("rxjs").Observable<void>;
    private _childMenuInjector?;
    protected childMenu?: Menu;
    protected constructor(injector: Injector, menuStack: MenuStack);
    ngOnDestroy(): void;
    /** Whether the attached menu is open. */
    isOpen(): boolean;
    registerChildMenu(child: Menu): void;
    protected getChildMenuInjector(): Injector;
    /** Destroy and unset the overlay reference it if exists */
    private _destroyOverlay;
    static ɵfac: i0.ɵɵFactoryDeclaration<MenuTrigger, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<MenuTrigger, never, never, {}, {}, never>;
}
