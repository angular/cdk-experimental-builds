/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { EventEmitter, AfterContentInit, OnDestroy } from '@angular/core';
import { CdkMenuGroup } from './menu-group';
import { CdkMenuPanel } from './menu-panel';
import { Menu } from './menu-interface';
/**
 * Directive which configures the element as a Menu which should contain child elements marked as
 * CdkMenuItem or CdkMenuGroup. Sets the appropriate role and aria-attributes for a menu and
 * contains accessible keyboard and mouse handling logic.
 *
 * It also acts as a RadioGroup for elements marked with role `menuitemradio`.
 */
export declare class CdkMenu extends CdkMenuGroup implements Menu, AfterContentInit, OnDestroy {
    private readonly _menuPanel?;
    /**
     * Sets the aria-orientation attribute and determines where sub-menus will be opened.
     * Does not affect styling/layout.
     */
    orientation: 'horizontal' | 'vertical';
    /** Event emitted when the menu is closed. */
    readonly closed: EventEmitter<void | 'click' | 'tab' | 'escape'>;
    /** List of nested CdkMenuGroup elements */
    private readonly _nestedGroups;
    /**
     * A reference to the enclosing parent menu panel.
     *
     * Required to be set when using ViewEngine since ViewEngine does support injecting a reference to
     * the parent directive if the parent directive is placed on an `ng-template`. If using Ivy, the
     * injected value will be used over this one.
     */
    private readonly _explicitPanel?;
    constructor(_menuPanel?: CdkMenuPanel | undefined);
    ngAfterContentInit(): void;
    /** Register this menu with its enclosing parent menu panel */
    private _registerWithParentPanel;
    /**
     * Get the enclosing CdkMenuPanel defaulting to the injected reference over the developer
     * provided reference.
     */
    private _getMenuPanel;
    /**
     * Complete the change emitter if there are any nested MenuGroups or register to complete the
     * change emitter if a MenuGroup is rendered at some point
     */
    private _completeChangeEmitter;
    /** Return true if there are nested CdkMenuGroup elements within the Menu */
    private _hasNestedGroups;
    ngOnDestroy(): void;
    /** Emit and complete the closed event emitter */
    private _emitClosedEvent;
}
