/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, Input, Output, EventEmitter, QueryList, ContentChildren, Optional, NgZone, HostListener, ElementRef, Inject, Self, } from '@angular/core';
import { FocusKeyManager } from '@angular/cdk/a11y';
import { LEFT_ARROW, RIGHT_ARROW, UP_ARROW, DOWN_ARROW, ESCAPE, TAB, hasModifierKey, } from '@angular/cdk/keycodes';
import { Directionality } from '@angular/cdk/bidi';
import { merge } from 'rxjs';
import { take, takeUntil, startWith, mergeMap, mapTo, mergeAll, switchMap } from 'rxjs/operators';
import { CdkMenuGroup } from './menu-group';
import { CdkMenuPanel } from './menu-panel';
import { CDK_MENU } from './menu-interface';
import { CdkMenuItem } from './menu-item';
import { NoopMenuStack } from './menu-stack';
import { PointerFocusTracker } from './pointer-focus-tracker';
import { MENU_AIM } from './menu-aim';
/**
 * Directive which configures the element as a Menu which should contain child elements marked as
 * CdkMenuItem or CdkMenuGroup. Sets the appropriate role and aria-attributes for a menu and
 * contains accessible keyboard and mouse handling logic.
 *
 * It also acts as a RadioGroup for elements marked with role `menuitemradio`.
 */
export class CdkMenu extends CdkMenuGroup {
    constructor(_ngZone, _elementRef, _menuAim, _dir, 
    // `CdkMenuPanel` is always used in combination with a `CdkMenu`.
    // tslint:disable-next-line: lightweight-tokens
    _menuPanel) {
        super();
        this._ngZone = _ngZone;
        this._elementRef = _elementRef;
        this._menuAim = _menuAim;
        this._dir = _dir;
        this._menuPanel = _menuPanel;
        /**
         * Sets the aria-orientation attribute and determines where menus will be opened.
         * Does not affect styling/layout.
         */
        this.orientation = 'vertical';
        /** Event emitted when the menu is closed. */
        this.closed = new EventEmitter();
        // We provide a default MenuStack implementation in case the menu is an inline menu.
        // For Menus part of a MenuBar nested within a MenuPanel this will be overwritten
        // to the correct parent MenuStack.
        /** Track the Menus making up the open menu stack. */
        this._menuStack = new NoopMenuStack();
    }
    ngOnInit() {
        this._registerWithParentPanel();
    }
    ngAfterContentInit() {
        var _a;
        super.ngAfterContentInit();
        this._completeChangeEmitter();
        this._setKeyManager();
        this._subscribeToMenuOpen();
        this._subscribeToMenuStack();
        this._subscribeToMouseManager();
        (_a = this._menuAim) === null || _a === void 0 ? void 0 : _a.initialize(this, this._pointerTracker);
    }
    // In Ivy the `host` metadata will be merged, whereas in ViewEngine it is overridden. In order
    // to avoid double event listeners, we need to use `HostListener`. Once Ivy is the default, we
    // can move this back into `host`.
    // tslint:disable:no-host-decorator-in-concrete
    /** Place focus on the first MenuItem in the menu and set the focus origin. */
    focusFirstItem(focusOrigin = 'program') {
        this._keyManager.setFocusOrigin(focusOrigin);
        this._keyManager.setFirstItemActive();
    }
    /** Place focus on the last MenuItem in the menu and set the focus origin. */
    focusLastItem(focusOrigin = 'program') {
        this._keyManager.setFocusOrigin(focusOrigin);
        this._keyManager.setLastItemActive();
    }
    // In Ivy the `host` metadata will be merged, whereas in ViewEngine it is overridden. In order
    // to avoid double event listeners, we need to use `HostListener`. Once Ivy is the default, we
    // can move this back into `host`.
    // tslint:disable:no-host-decorator-in-concrete
    /** Handle keyboard events for the Menu. */
    _handleKeyEvent(event) {
        const keyManager = this._keyManager;
        switch (event.keyCode) {
            case LEFT_ARROW:
            case RIGHT_ARROW:
                if (this._isHorizontal()) {
                    event.preventDefault();
                    keyManager.setFocusOrigin('keyboard');
                    keyManager.onKeydown(event);
                }
                break;
            case UP_ARROW:
            case DOWN_ARROW:
                if (!this._isHorizontal()) {
                    event.preventDefault();
                    keyManager.setFocusOrigin('keyboard');
                    keyManager.onKeydown(event);
                }
                break;
            case ESCAPE:
                if (!hasModifierKey(event)) {
                    event.preventDefault();
                    this._menuStack.close(this, 2 /* currentItem */);
                }
                break;
            case TAB:
                this._menuStack.closeAll();
                break;
            default:
                keyManager.onKeydown(event);
        }
    }
    /** Register this menu with its enclosing parent menu panel */
    _registerWithParentPanel() {
        var _a;
        (_a = this._getMenuPanel()) === null || _a === void 0 ? void 0 : _a._registerMenu(this);
    }
    /**
     * Get the enclosing CdkMenuPanel defaulting to the injected reference over the developer
     * provided reference.
     */
    _getMenuPanel() {
        return this._menuPanel || this._explicitPanel;
    }
    /**
     * Complete the change emitter if there are any nested MenuGroups or register to complete the
     * change emitter if a MenuGroup is rendered at some point
     */
    _completeChangeEmitter() {
        if (this._hasNestedGroups()) {
            this.change.complete();
        }
        else {
            this._nestedGroups.changes.pipe(take(1)).subscribe(() => this.change.complete());
        }
    }
    /** Return true if there are nested CdkMenuGroup elements within the Menu */
    _hasNestedGroups() {
        // view engine has a bug where @ContentChildren will return the current element
        // along with children if the selectors match - not just the children.
        // Here, if there is at least one element, we check to see if the first element is a CdkMenu in
        // order to ensure that we return true iff there are child CdkMenuGroup elements.
        return this._nestedGroups.length > 0 && !(this._nestedGroups.first instanceof CdkMenu);
    }
    /** Setup the FocusKeyManager with the correct orientation for the menu. */
    _setKeyManager() {
        var _a;
        this._keyManager = new FocusKeyManager(this._allItems)
            .withWrap()
            .withTypeAhead()
            .withHomeAndEnd();
        if (this._isHorizontal()) {
            this._keyManager.withHorizontalOrientation(((_a = this._dir) === null || _a === void 0 ? void 0 : _a.value) || 'ltr');
        }
        else {
            this._keyManager.withVerticalOrientation();
        }
    }
    /**
     * Set the PointerFocusTracker and ensure that when mouse focus changes the key manager is updated
     * with the latest menu item under mouse focus.
     */
    _subscribeToMouseManager() {
        this._ngZone.runOutsideAngular(() => {
            this._pointerTracker = new PointerFocusTracker(this._allItems);
            this._pointerTracker.entered
                .pipe(takeUntil(this.closed))
                .subscribe(item => this._keyManager.setActiveItem(item));
        });
    }
    /** Subscribe to the MenuStack close and empty observables. */
    _subscribeToMenuStack() {
        this._menuStack.closed
            .pipe(takeUntil(this.closed))
            .subscribe(item => this._closeOpenMenu(item));
        this._menuStack.emptied
            .pipe(takeUntil(this.closed))
            .subscribe(event => this._toggleMenuFocus(event));
    }
    /**
     * Close the open menu if the current active item opened the requested MenuStackItem.
     * @param item the MenuStackItem requested to be closed.
     */
    _closeOpenMenu(menu) {
        var _a, _b, _c;
        const keyManager = this._keyManager;
        const trigger = this._openItem;
        if (menu === ((_a = trigger === null || trigger === void 0 ? void 0 : trigger.getMenuTrigger()) === null || _a === void 0 ? void 0 : _a.getMenu())) {
            (_b = trigger === null || trigger === void 0 ? void 0 : trigger.getMenuTrigger()) === null || _b === void 0 ? void 0 : _b.closeMenu();
            // If the user has moused over a sibling item we want to focus the element under mouse focus
            // not the trigger which previously opened the now closed menu.
            if (trigger) {
                keyManager.setActiveItem(((_c = this._pointerTracker) === null || _c === void 0 ? void 0 : _c.activeElement) || trigger);
            }
        }
    }
    /** Set focus the either the current, previous or next item based on the FocusNext event. */
    _toggleMenuFocus(event) {
        const keyManager = this._keyManager;
        switch (event) {
            case 0 /* nextItem */:
                keyManager.setFocusOrigin('keyboard');
                keyManager.setNextItemActive();
                break;
            case 1 /* previousItem */:
                keyManager.setFocusOrigin('keyboard');
                keyManager.setPreviousItemActive();
                break;
            case 2 /* currentItem */:
                if (keyManager.activeItem) {
                    keyManager.setFocusOrigin('keyboard');
                    keyManager.setActiveItem(keyManager.activeItem);
                }
                break;
        }
    }
    // TODO(andy9775): remove duplicate logic between menu an menu bar
    /**
     * Subscribe to the menu trigger's open events in order to track the trigger which opened the menu
     * and stop tracking it when the menu is closed.
     */
    _subscribeToMenuOpen() {
        const exitCondition = merge(this._allItems.changes, this.closed);
        this._allItems.changes
            .pipe(startWith(this._allItems), mergeMap((list) => list
            .filter(item => item.hasMenu())
            .map(item => item.getMenuTrigger().opened.pipe(mapTo(item), takeUntil(exitCondition)))), mergeAll(), switchMap((item) => {
            this._openItem = item;
            return item.getMenuTrigger().closed;
        }), takeUntil(this.closed))
            .subscribe(() => (this._openItem = undefined));
    }
    /** Return true if this menu has been configured in a horizontal orientation. */
    _isHorizontal() {
        return this.orientation === 'horizontal';
    }
    /**
     * Return true if this menu is an inline menu. That is, it does not exist in a pop-up and is
     * always visible in the dom.
     */
    _isInline() {
        // NoopMenuStack is the default. If this menu is not inline than the NoopMenuStack is replaced
        // automatically.
        return this._menuStack instanceof NoopMenuStack;
    }
    ngOnDestroy() {
        var _a;
        this._emitClosedEvent();
        (_a = this._pointerTracker) === null || _a === void 0 ? void 0 : _a.destroy();
    }
    /** Emit and complete the closed event emitter */
    _emitClosedEvent() {
        this.closed.next();
        this.closed.complete();
    }
}
CdkMenu.decorators = [
    { type: Directive, args: [{
                selector: '[cdkMenu]',
                exportAs: 'cdkMenu',
                host: {
                    '[tabindex]': '_isInline() ? 0 : null',
                    'role': 'menu',
                    'class': 'cdk-menu',
                    '[class.cdk-menu-inline]': '_isInline()',
                    '[attr.aria-orientation]': 'orientation',
                },
                providers: [
                    { provide: CdkMenuGroup, useExisting: CdkMenu },
                    { provide: CDK_MENU, useExisting: CdkMenu },
                ],
            },] }
];
CdkMenu.ctorParameters = () => [
    { type: NgZone },
    { type: ElementRef },
    { type: undefined, decorators: [{ type: Self }, { type: Optional }, { type: Inject, args: [MENU_AIM,] }] },
    { type: Directionality, decorators: [{ type: Optional }] },
    { type: CdkMenuPanel, decorators: [{ type: Optional }] }
];
CdkMenu.propDecorators = {
    orientation: [{ type: Input, args: ['cdkMenuOrientation',] }],
    closed: [{ type: Output }],
    _nestedGroups: [{ type: ContentChildren, args: [CdkMenuGroup, { descendants: true },] }],
    _allItems: [{ type: ContentChildren, args: [CdkMenuItem, { descendants: true },] }],
    _explicitPanel: [{ type: Input, args: ['cdkMenuPanel',] }],
    focusFirstItem: [{ type: HostListener, args: ['focus',] }],
    _handleKeyEvent: [{ type: HostListener, args: ['keydown', ['$event'],] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL21lbnUvbWVudS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQ0wsU0FBUyxFQUNULEtBQUssRUFDTCxNQUFNLEVBQ04sWUFBWSxFQUNaLFNBQVMsRUFDVCxlQUFlLEVBR2YsUUFBUSxFQUVSLE1BQU0sRUFDTixZQUFZLEVBQ1osVUFBVSxFQUNWLE1BQU0sRUFDTixJQUFJLEdBQ0wsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFDLGVBQWUsRUFBYyxNQUFNLG1CQUFtQixDQUFDO0FBQy9ELE9BQU8sRUFDTCxVQUFVLEVBQ1YsV0FBVyxFQUNYLFFBQVEsRUFDUixVQUFVLEVBQ1YsTUFBTSxFQUNOLEdBQUcsRUFDSCxjQUFjLEdBQ2YsTUFBTSx1QkFBdUIsQ0FBQztBQUMvQixPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDakQsT0FBTyxFQUFDLEtBQUssRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUMzQixPQUFPLEVBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDaEcsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGNBQWMsQ0FBQztBQUMxQyxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sY0FBYyxDQUFDO0FBQzFDLE9BQU8sRUFBTyxRQUFRLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUNoRCxPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0sYUFBYSxDQUFDO0FBQ3hDLE9BQU8sRUFBc0MsYUFBYSxFQUFDLE1BQU0sY0FBYyxDQUFDO0FBQ2hGLE9BQU8sRUFBQyxtQkFBbUIsRUFBQyxNQUFNLHlCQUF5QixDQUFDO0FBQzVELE9BQU8sRUFBQyxRQUFRLEVBQVUsTUFBTSxZQUFZLENBQUM7QUFFN0M7Ozs7OztHQU1HO0FBZ0JILE1BQU0sT0FBTyxPQUFRLFNBQVEsWUFBWTtJQTBDdkMsWUFDbUIsT0FBZSxFQUN2QixXQUFvQyxFQUNVLFFBQWtCLEVBQzVDLElBQXFCO0lBQ2xELGlFQUFpRTtJQUNqRSwrQ0FBK0M7SUFDbEIsVUFBeUI7UUFFdEQsS0FBSyxFQUFFLENBQUM7UUFSUyxZQUFPLEdBQVAsT0FBTyxDQUFRO1FBQ3ZCLGdCQUFXLEdBQVgsV0FBVyxDQUF5QjtRQUNVLGFBQVEsR0FBUixRQUFRLENBQVU7UUFDNUMsU0FBSSxHQUFKLElBQUksQ0FBaUI7UUFHckIsZUFBVSxHQUFWLFVBQVUsQ0FBZTtRQWhEeEQ7OztXQUdHO1FBQzBCLGdCQUFXLEdBQThCLFVBQVUsQ0FBQztRQUVqRiw2Q0FBNkM7UUFDMUIsV0FBTSxHQUFvRCxJQUFJLFlBQVksRUFBRSxDQUFDO1FBRWhHLG9GQUFvRjtRQUNwRixpRkFBaUY7UUFDakYsbUNBQW1DO1FBQ25DLHFEQUFxRDtRQUNyRCxlQUFVLEdBQWMsSUFBSSxhQUFhLEVBQUUsQ0FBQztJQXNDNUMsQ0FBQztJQUVELFFBQVE7UUFDTixJQUFJLENBQUMsd0JBQXdCLEVBQUUsQ0FBQztJQUNsQyxDQUFDO0lBRVEsa0JBQWtCOztRQUN6QixLQUFLLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztRQUUzQixJQUFJLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztRQUM5QixJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDdEIsSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUM7UUFDNUIsSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7UUFDN0IsSUFBSSxDQUFDLHdCQUF3QixFQUFFLENBQUM7UUFFaEMsTUFBQSxJQUFJLENBQUMsUUFBUSwwQ0FBRSxVQUFVLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxlQUFnQixDQUFDLENBQUM7SUFDekQsQ0FBQztJQUVELDhGQUE4RjtJQUM5Riw4RkFBOEY7SUFDOUYsa0NBQWtDO0lBQ2xDLCtDQUErQztJQUUvQyw4RUFBOEU7SUFDOUUsY0FBYyxDQUFDLGNBQTJCLFNBQVM7UUFDakQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDN0MsSUFBSSxDQUFDLFdBQVcsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO0lBQ3hDLENBQUM7SUFFRCw2RUFBNkU7SUFDN0UsYUFBYSxDQUFDLGNBQTJCLFNBQVM7UUFDaEQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDN0MsSUFBSSxDQUFDLFdBQVcsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO0lBQ3ZDLENBQUM7SUFFRCw4RkFBOEY7SUFDOUYsOEZBQThGO0lBQzlGLGtDQUFrQztJQUNsQywrQ0FBK0M7SUFFL0MsMkNBQTJDO0lBQzNDLGVBQWUsQ0FBQyxLQUFvQjtRQUNsQyxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO1FBQ3BDLFFBQVEsS0FBSyxDQUFDLE9BQU8sRUFBRTtZQUNyQixLQUFLLFVBQVUsQ0FBQztZQUNoQixLQUFLLFdBQVc7Z0JBQ2QsSUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFLEVBQUU7b0JBQ3hCLEtBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQztvQkFDdkIsVUFBVSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQztvQkFDdEMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztpQkFDN0I7Z0JBQ0QsTUFBTTtZQUVSLEtBQUssUUFBUSxDQUFDO1lBQ2QsS0FBSyxVQUFVO2dCQUNiLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLEVBQUU7b0JBQ3pCLEtBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQztvQkFDdkIsVUFBVSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQztvQkFDdEMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztpQkFDN0I7Z0JBQ0QsTUFBTTtZQUVSLEtBQUssTUFBTTtnQkFDVCxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxFQUFFO29CQUMxQixLQUFLLENBQUMsY0FBYyxFQUFFLENBQUM7b0JBQ3ZCLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLElBQUksc0JBQXdCLENBQUM7aUJBQ3BEO2dCQUNELE1BQU07WUFFUixLQUFLLEdBQUc7Z0JBQ04sSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFDM0IsTUFBTTtZQUVSO2dCQUNFLFVBQVUsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDL0I7SUFDSCxDQUFDO0lBRUQsOERBQThEO0lBQ3RELHdCQUF3Qjs7UUFDOUIsTUFBQSxJQUFJLENBQUMsYUFBYSxFQUFFLDBDQUFFLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM1QyxDQUFDO0lBRUQ7OztPQUdHO0lBQ0ssYUFBYTtRQUNuQixPQUFPLElBQUksQ0FBQyxVQUFVLElBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQztJQUNoRCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0ssc0JBQXNCO1FBQzVCLElBQUksSUFBSSxDQUFDLGdCQUFnQixFQUFFLEVBQUU7WUFDM0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQztTQUN4QjthQUFNO1lBQ0wsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7U0FDbEY7SUFDSCxDQUFDO0lBRUQsNEVBQTRFO0lBQ3BFLGdCQUFnQjtRQUN0QiwrRUFBK0U7UUFDL0Usc0VBQXNFO1FBQ3RFLCtGQUErRjtRQUMvRixpRkFBaUY7UUFDakYsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxZQUFZLE9BQU8sQ0FBQyxDQUFDO0lBQ3pGLENBQUM7SUFFRCwyRUFBMkU7SUFDbkUsY0FBYzs7UUFDcEIsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLGVBQWUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDO2FBQ25ELFFBQVEsRUFBRTthQUNWLGFBQWEsRUFBRTthQUNmLGNBQWMsRUFBRSxDQUFDO1FBRXBCLElBQUksSUFBSSxDQUFDLGFBQWEsRUFBRSxFQUFFO1lBQ3hCLElBQUksQ0FBQyxXQUFXLENBQUMseUJBQXlCLENBQUMsQ0FBQSxNQUFBLElBQUksQ0FBQyxJQUFJLDBDQUFFLEtBQUssS0FBSSxLQUFLLENBQUMsQ0FBQztTQUN2RTthQUFNO1lBQ0wsSUFBSSxDQUFDLFdBQVcsQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO1NBQzVDO0lBQ0gsQ0FBQztJQUVEOzs7T0FHRztJQUNLLHdCQUF3QjtRQUM5QixJQUFJLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLEdBQUcsRUFBRTtZQUNsQyxJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksbUJBQW1CLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQy9ELElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTztpQkFDekIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7aUJBQzVCLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDN0QsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQsOERBQThEO0lBQ3RELHFCQUFxQjtRQUMzQixJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU07YUFDbkIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7YUFDNUIsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBRWhELElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTzthQUNwQixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQzthQUM1QixTQUFTLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUN0RCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0ssY0FBYyxDQUFDLElBQStCOztRQUNwRCxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO1FBQ3BDLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7UUFDL0IsSUFBSSxJQUFJLE1BQUssTUFBQSxPQUFPLGFBQVAsT0FBTyx1QkFBUCxPQUFPLENBQUUsY0FBYyxFQUFFLDBDQUFFLE9BQU8sRUFBRSxDQUFBLEVBQUU7WUFDakQsTUFBQSxPQUFPLGFBQVAsT0FBTyx1QkFBUCxPQUFPLENBQUUsY0FBYyxFQUFFLDBDQUFFLFNBQVMsRUFBRSxDQUFDO1lBQ3ZDLDRGQUE0RjtZQUM1RiwrREFBK0Q7WUFDL0QsSUFBSSxPQUFPLEVBQUU7Z0JBQ1gsVUFBVSxDQUFDLGFBQWEsQ0FBQyxDQUFBLE1BQUEsSUFBSSxDQUFDLGVBQWUsMENBQUUsYUFBYSxLQUFJLE9BQU8sQ0FBQyxDQUFDO2FBQzFFO1NBQ0Y7SUFDSCxDQUFDO0lBRUQsNEZBQTRGO0lBQ3BGLGdCQUFnQixDQUFDLEtBQTRCO1FBQ25ELE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7UUFDcEMsUUFBUSxLQUFLLEVBQUU7WUFDYjtnQkFDRSxVQUFVLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUN0QyxVQUFVLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztnQkFDL0IsTUFBTTtZQUVSO2dCQUNFLFVBQVUsQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQ3RDLFVBQVUsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO2dCQUNuQyxNQUFNO1lBRVI7Z0JBQ0UsSUFBSSxVQUFVLENBQUMsVUFBVSxFQUFFO29CQUN6QixVQUFVLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxDQUFDO29CQUN0QyxVQUFVLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQztpQkFDakQ7Z0JBQ0QsTUFBTTtTQUNUO0lBQ0gsQ0FBQztJQUVELGtFQUFrRTtJQUNsRTs7O09BR0c7SUFDSyxvQkFBb0I7UUFDMUIsTUFBTSxhQUFhLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNqRSxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU87YUFDbkIsSUFBSSxDQUNILFNBQVMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQ3pCLFFBQVEsQ0FBQyxDQUFDLElBQTRCLEVBQUUsRUFBRSxDQUN4QyxJQUFJO2FBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO2FBQzlCLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxTQUFTLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUMxRixFQUNELFFBQVEsRUFBRSxFQUNWLFNBQVMsQ0FBQyxDQUFDLElBQWlCLEVBQUUsRUFBRTtZQUM5QixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztZQUN0QixPQUFPLElBQUksQ0FBQyxjQUFjLEVBQUcsQ0FBQyxNQUFNLENBQUM7UUFDdkMsQ0FBQyxDQUFDLEVBQ0YsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FDdkI7YUFDQSxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUM7SUFDbkQsQ0FBQztJQUVELGdGQUFnRjtJQUN4RSxhQUFhO1FBQ25CLE9BQU8sSUFBSSxDQUFDLFdBQVcsS0FBSyxZQUFZLENBQUM7SUFDM0MsQ0FBQztJQUVEOzs7T0FHRztJQUNILFNBQVM7UUFDUCw4RkFBOEY7UUFDOUYsaUJBQWlCO1FBQ2pCLE9BQU8sSUFBSSxDQUFDLFVBQVUsWUFBWSxhQUFhLENBQUM7SUFDbEQsQ0FBQztJQUVRLFdBQVc7O1FBQ2xCLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBQ3hCLE1BQUEsSUFBSSxDQUFDLGVBQWUsMENBQUUsT0FBTyxFQUFFLENBQUM7SUFDbEMsQ0FBQztJQUVELGlEQUFpRDtJQUN6QyxnQkFBZ0I7UUFDdEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNuQixJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ3pCLENBQUM7OztZQWxURixTQUFTLFNBQUM7Z0JBQ1QsUUFBUSxFQUFFLFdBQVc7Z0JBQ3JCLFFBQVEsRUFBRSxTQUFTO2dCQUNuQixJQUFJLEVBQUU7b0JBQ0osWUFBWSxFQUFFLHdCQUF3QjtvQkFDdEMsTUFBTSxFQUFFLE1BQU07b0JBQ2QsT0FBTyxFQUFFLFVBQVU7b0JBQ25CLHlCQUF5QixFQUFFLGFBQWE7b0JBQ3hDLHlCQUF5QixFQUFFLGFBQWE7aUJBQ3pDO2dCQUNELFNBQVMsRUFBRTtvQkFDVCxFQUFDLE9BQU8sRUFBRSxZQUFZLEVBQUUsV0FBVyxFQUFFLE9BQU8sRUFBQztvQkFDN0MsRUFBQyxPQUFPLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxPQUFPLEVBQUM7aUJBQzFDO2FBQ0Y7OztZQWhEQyxNQUFNO1lBRU4sVUFBVTs0Q0E0RlAsSUFBSSxZQUFJLFFBQVEsWUFBSSxNQUFNLFNBQUMsUUFBUTtZQTlFaEMsY0FBYyx1QkErRWpCLFFBQVE7WUEzRUwsWUFBWSx1QkE4RWYsUUFBUTs7OzBCQTVDVixLQUFLLFNBQUMsb0JBQW9CO3FCQUcxQixNQUFNOzRCQWVOLGVBQWUsU0FBQyxZQUFZLEVBQUUsRUFBQyxXQUFXLEVBQUUsSUFBSSxFQUFDO3dCQUlqRCxlQUFlLFNBQUMsV0FBVyxFQUFFLEVBQUMsV0FBVyxFQUFFLElBQUksRUFBQzs2QkFhaEQsS0FBSyxTQUFDLGNBQWM7NkJBa0NwQixZQUFZLFNBQUMsT0FBTzs4QkFpQnBCLFlBQVksU0FBQyxTQUFTLEVBQUUsQ0FBQyxRQUFRLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtcbiAgRGlyZWN0aXZlLFxuICBJbnB1dCxcbiAgT3V0cHV0LFxuICBFdmVudEVtaXR0ZXIsXG4gIFF1ZXJ5TGlzdCxcbiAgQ29udGVudENoaWxkcmVuLFxuICBBZnRlckNvbnRlbnRJbml0LFxuICBPbkRlc3Ryb3ksXG4gIE9wdGlvbmFsLFxuICBPbkluaXQsXG4gIE5nWm9uZSxcbiAgSG9zdExpc3RlbmVyLFxuICBFbGVtZW50UmVmLFxuICBJbmplY3QsXG4gIFNlbGYsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtGb2N1c0tleU1hbmFnZXIsIEZvY3VzT3JpZ2lufSBmcm9tICdAYW5ndWxhci9jZGsvYTExeSc7XG5pbXBvcnQge1xuICBMRUZUX0FSUk9XLFxuICBSSUdIVF9BUlJPVyxcbiAgVVBfQVJST1csXG4gIERPV05fQVJST1csXG4gIEVTQ0FQRSxcbiAgVEFCLFxuICBoYXNNb2RpZmllcktleSxcbn0gZnJvbSAnQGFuZ3VsYXIvY2RrL2tleWNvZGVzJztcbmltcG9ydCB7RGlyZWN0aW9uYWxpdHl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9iaWRpJztcbmltcG9ydCB7bWVyZ2V9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHt0YWtlLCB0YWtlVW50aWwsIHN0YXJ0V2l0aCwgbWVyZ2VNYXAsIG1hcFRvLCBtZXJnZUFsbCwgc3dpdGNoTWFwfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5pbXBvcnQge0Nka01lbnVHcm91cH0gZnJvbSAnLi9tZW51LWdyb3VwJztcbmltcG9ydCB7Q2RrTWVudVBhbmVsfSBmcm9tICcuL21lbnUtcGFuZWwnO1xuaW1wb3J0IHtNZW51LCBDREtfTUVOVX0gZnJvbSAnLi9tZW51LWludGVyZmFjZSc7XG5pbXBvcnQge0Nka01lbnVJdGVtfSBmcm9tICcuL21lbnUtaXRlbSc7XG5pbXBvcnQge01lbnVTdGFjaywgTWVudVN0YWNrSXRlbSwgRm9jdXNOZXh0LCBOb29wTWVudVN0YWNrfSBmcm9tICcuL21lbnUtc3RhY2snO1xuaW1wb3J0IHtQb2ludGVyRm9jdXNUcmFja2VyfSBmcm9tICcuL3BvaW50ZXItZm9jdXMtdHJhY2tlcic7XG5pbXBvcnQge01FTlVfQUlNLCBNZW51QWltfSBmcm9tICcuL21lbnUtYWltJztcblxuLyoqXG4gKiBEaXJlY3RpdmUgd2hpY2ggY29uZmlndXJlcyB0aGUgZWxlbWVudCBhcyBhIE1lbnUgd2hpY2ggc2hvdWxkIGNvbnRhaW4gY2hpbGQgZWxlbWVudHMgbWFya2VkIGFzXG4gKiBDZGtNZW51SXRlbSBvciBDZGtNZW51R3JvdXAuIFNldHMgdGhlIGFwcHJvcHJpYXRlIHJvbGUgYW5kIGFyaWEtYXR0cmlidXRlcyBmb3IgYSBtZW51IGFuZFxuICogY29udGFpbnMgYWNjZXNzaWJsZSBrZXlib2FyZCBhbmQgbW91c2UgaGFuZGxpbmcgbG9naWMuXG4gKlxuICogSXQgYWxzbyBhY3RzIGFzIGEgUmFkaW9Hcm91cCBmb3IgZWxlbWVudHMgbWFya2VkIHdpdGggcm9sZSBgbWVudWl0ZW1yYWRpb2AuXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tjZGtNZW51XScsXG4gIGV4cG9ydEFzOiAnY2RrTWVudScsXG4gIGhvc3Q6IHtcbiAgICAnW3RhYmluZGV4XSc6ICdfaXNJbmxpbmUoKSA/IDAgOiBudWxsJyxcbiAgICAncm9sZSc6ICdtZW51JyxcbiAgICAnY2xhc3MnOiAnY2RrLW1lbnUnLFxuICAgICdbY2xhc3MuY2RrLW1lbnUtaW5saW5lXSc6ICdfaXNJbmxpbmUoKScsXG4gICAgJ1thdHRyLmFyaWEtb3JpZW50YXRpb25dJzogJ29yaWVudGF0aW9uJyxcbiAgfSxcbiAgcHJvdmlkZXJzOiBbXG4gICAge3Byb3ZpZGU6IENka01lbnVHcm91cCwgdXNlRXhpc3Rpbmc6IENka01lbnV9LFxuICAgIHtwcm92aWRlOiBDREtfTUVOVSwgdXNlRXhpc3Rpbmc6IENka01lbnV9LFxuICBdLFxufSlcbmV4cG9ydCBjbGFzcyBDZGtNZW51IGV4dGVuZHMgQ2RrTWVudUdyb3VwIGltcGxlbWVudHMgTWVudSwgQWZ0ZXJDb250ZW50SW5pdCwgT25Jbml0LCBPbkRlc3Ryb3kge1xuICAvKipcbiAgICogU2V0cyB0aGUgYXJpYS1vcmllbnRhdGlvbiBhdHRyaWJ1dGUgYW5kIGRldGVybWluZXMgd2hlcmUgbWVudXMgd2lsbCBiZSBvcGVuZWQuXG4gICAqIERvZXMgbm90IGFmZmVjdCBzdHlsaW5nL2xheW91dC5cbiAgICovXG4gIEBJbnB1dCgnY2RrTWVudU9yaWVudGF0aW9uJykgb3JpZW50YXRpb246ICdob3Jpem9udGFsJyB8ICd2ZXJ0aWNhbCcgPSAndmVydGljYWwnO1xuXG4gIC8qKiBFdmVudCBlbWl0dGVkIHdoZW4gdGhlIG1lbnUgaXMgY2xvc2VkLiAqL1xuICBAT3V0cHV0KCkgcmVhZG9ubHkgY2xvc2VkOiBFdmVudEVtaXR0ZXI8dm9pZCB8ICdjbGljaycgfCAndGFiJyB8ICdlc2NhcGUnPiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuICAvLyBXZSBwcm92aWRlIGEgZGVmYXVsdCBNZW51U3RhY2sgaW1wbGVtZW50YXRpb24gaW4gY2FzZSB0aGUgbWVudSBpcyBhbiBpbmxpbmUgbWVudS5cbiAgLy8gRm9yIE1lbnVzIHBhcnQgb2YgYSBNZW51QmFyIG5lc3RlZCB3aXRoaW4gYSBNZW51UGFuZWwgdGhpcyB3aWxsIGJlIG92ZXJ3cml0dGVuXG4gIC8vIHRvIHRoZSBjb3JyZWN0IHBhcmVudCBNZW51U3RhY2suXG4gIC8qKiBUcmFjayB0aGUgTWVudXMgbWFraW5nIHVwIHRoZSBvcGVuIG1lbnUgc3RhY2suICovXG4gIF9tZW51U3RhY2s6IE1lbnVTdGFjayA9IG5ldyBOb29wTWVudVN0YWNrKCk7XG5cbiAgLyoqIEhhbmRsZXMga2V5Ym9hcmQgZXZlbnRzIGZvciB0aGUgbWVudS4gKi9cbiAgcHJpdmF0ZSBfa2V5TWFuYWdlcjogRm9jdXNLZXlNYW5hZ2VyPENka01lbnVJdGVtPjtcblxuICAvKiogTWFuYWdlcyBpdGVtcyB1bmRlciBtb3VzZSBmb2N1cy4gKi9cbiAgcHJpdmF0ZSBfcG9pbnRlclRyYWNrZXI/OiBQb2ludGVyRm9jdXNUcmFja2VyPENka01lbnVJdGVtPjtcblxuICAvKiogTGlzdCBvZiBuZXN0ZWQgQ2RrTWVudUdyb3VwIGVsZW1lbnRzICovXG4gIEBDb250ZW50Q2hpbGRyZW4oQ2RrTWVudUdyb3VwLCB7ZGVzY2VuZGFudHM6IHRydWV9KVxuICBwcml2YXRlIHJlYWRvbmx5IF9uZXN0ZWRHcm91cHM6IFF1ZXJ5TGlzdDxDZGtNZW51R3JvdXA+O1xuXG4gIC8qKiBBbGwgY2hpbGQgTWVudUl0ZW0gZWxlbWVudHMgbmVzdGVkIGluIHRoaXMgTWVudS4gKi9cbiAgQENvbnRlbnRDaGlsZHJlbihDZGtNZW51SXRlbSwge2Rlc2NlbmRhbnRzOiB0cnVlfSlcbiAgcHJpdmF0ZSByZWFkb25seSBfYWxsSXRlbXM6IFF1ZXJ5TGlzdDxDZGtNZW51SXRlbT47XG5cbiAgLyoqIFRoZSBNZW51IEl0ZW0gd2hpY2ggdHJpZ2dlcmVkIHRoZSBvcGVuIHN1Ym1lbnUuICovXG4gIHByaXZhdGUgX29wZW5JdGVtPzogQ2RrTWVudUl0ZW07XG5cbiAgLyoqXG4gICAqIEEgcmVmZXJlbmNlIHRvIHRoZSBlbmNsb3NpbmcgcGFyZW50IG1lbnUgcGFuZWwuXG4gICAqXG4gICAqIFJlcXVpcmVkIHRvIGJlIHNldCB3aGVuIHVzaW5nIFZpZXdFbmdpbmUgc2luY2UgVmlld0VuZ2luZSBkb2VzIHN1cHBvcnQgaW5qZWN0aW5nIGEgcmVmZXJlbmNlIHRvXG4gICAqIHRoZSBwYXJlbnQgZGlyZWN0aXZlIGlmIHRoZSBwYXJlbnQgZGlyZWN0aXZlIGlzIHBsYWNlZCBvbiBhbiBgbmctdGVtcGxhdGVgLiBJZiB1c2luZyBJdnksIHRoZVxuICAgKiBpbmplY3RlZCB2YWx1ZSB3aWxsIGJlIHVzZWQgb3ZlciB0aGlzIG9uZS5cbiAgICovXG4gIEBJbnB1dCgnY2RrTWVudVBhbmVsJykgcHJpdmF0ZSByZWFkb25seSBfZXhwbGljaXRQYW5lbD86IENka01lbnVQYW5lbDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIHJlYWRvbmx5IF9uZ1pvbmU6IE5nWm9uZSxcbiAgICByZWFkb25seSBfZWxlbWVudFJlZjogRWxlbWVudFJlZjxIVE1MRWxlbWVudD4sXG4gICAgQFNlbGYoKSBAT3B0aW9uYWwoKSBASW5qZWN0KE1FTlVfQUlNKSBwcml2YXRlIHJlYWRvbmx5IF9tZW51QWltPzogTWVudUFpbSxcbiAgICBAT3B0aW9uYWwoKSBwcml2YXRlIHJlYWRvbmx5IF9kaXI/OiBEaXJlY3Rpb25hbGl0eSxcbiAgICAvLyBgQ2RrTWVudVBhbmVsYCBpcyBhbHdheXMgdXNlZCBpbiBjb21iaW5hdGlvbiB3aXRoIGEgYENka01lbnVgLlxuICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTogbGlnaHR3ZWlnaHQtdG9rZW5zXG4gICAgQE9wdGlvbmFsKCkgcHJpdmF0ZSByZWFkb25seSBfbWVudVBhbmVsPzogQ2RrTWVudVBhbmVsXG4gICkge1xuICAgIHN1cGVyKCk7XG4gIH1cblxuICBuZ09uSW5pdCgpIHtcbiAgICB0aGlzLl9yZWdpc3RlcldpdGhQYXJlbnRQYW5lbCgpO1xuICB9XG5cbiAgb3ZlcnJpZGUgbmdBZnRlckNvbnRlbnRJbml0KCkge1xuICAgIHN1cGVyLm5nQWZ0ZXJDb250ZW50SW5pdCgpO1xuXG4gICAgdGhpcy5fY29tcGxldGVDaGFuZ2VFbWl0dGVyKCk7XG4gICAgdGhpcy5fc2V0S2V5TWFuYWdlcigpO1xuICAgIHRoaXMuX3N1YnNjcmliZVRvTWVudU9wZW4oKTtcbiAgICB0aGlzLl9zdWJzY3JpYmVUb01lbnVTdGFjaygpO1xuICAgIHRoaXMuX3N1YnNjcmliZVRvTW91c2VNYW5hZ2VyKCk7XG5cbiAgICB0aGlzLl9tZW51QWltPy5pbml0aWFsaXplKHRoaXMsIHRoaXMuX3BvaW50ZXJUcmFja2VyISk7XG4gIH1cblxuICAvLyBJbiBJdnkgdGhlIGBob3N0YCBtZXRhZGF0YSB3aWxsIGJlIG1lcmdlZCwgd2hlcmVhcyBpbiBWaWV3RW5naW5lIGl0IGlzIG92ZXJyaWRkZW4uIEluIG9yZGVyXG4gIC8vIHRvIGF2b2lkIGRvdWJsZSBldmVudCBsaXN0ZW5lcnMsIHdlIG5lZWQgdG8gdXNlIGBIb3N0TGlzdGVuZXJgLiBPbmNlIEl2eSBpcyB0aGUgZGVmYXVsdCwgd2VcbiAgLy8gY2FuIG1vdmUgdGhpcyBiYWNrIGludG8gYGhvc3RgLlxuICAvLyB0c2xpbnQ6ZGlzYWJsZTpuby1ob3N0LWRlY29yYXRvci1pbi1jb25jcmV0ZVxuICBASG9zdExpc3RlbmVyKCdmb2N1cycpXG4gIC8qKiBQbGFjZSBmb2N1cyBvbiB0aGUgZmlyc3QgTWVudUl0ZW0gaW4gdGhlIG1lbnUgYW5kIHNldCB0aGUgZm9jdXMgb3JpZ2luLiAqL1xuICBmb2N1c0ZpcnN0SXRlbShmb2N1c09yaWdpbjogRm9jdXNPcmlnaW4gPSAncHJvZ3JhbScpIHtcbiAgICB0aGlzLl9rZXlNYW5hZ2VyLnNldEZvY3VzT3JpZ2luKGZvY3VzT3JpZ2luKTtcbiAgICB0aGlzLl9rZXlNYW5hZ2VyLnNldEZpcnN0SXRlbUFjdGl2ZSgpO1xuICB9XG5cbiAgLyoqIFBsYWNlIGZvY3VzIG9uIHRoZSBsYXN0IE1lbnVJdGVtIGluIHRoZSBtZW51IGFuZCBzZXQgdGhlIGZvY3VzIG9yaWdpbi4gKi9cbiAgZm9jdXNMYXN0SXRlbShmb2N1c09yaWdpbjogRm9jdXNPcmlnaW4gPSAncHJvZ3JhbScpIHtcbiAgICB0aGlzLl9rZXlNYW5hZ2VyLnNldEZvY3VzT3JpZ2luKGZvY3VzT3JpZ2luKTtcbiAgICB0aGlzLl9rZXlNYW5hZ2VyLnNldExhc3RJdGVtQWN0aXZlKCk7XG4gIH1cblxuICAvLyBJbiBJdnkgdGhlIGBob3N0YCBtZXRhZGF0YSB3aWxsIGJlIG1lcmdlZCwgd2hlcmVhcyBpbiBWaWV3RW5naW5lIGl0IGlzIG92ZXJyaWRkZW4uIEluIG9yZGVyXG4gIC8vIHRvIGF2b2lkIGRvdWJsZSBldmVudCBsaXN0ZW5lcnMsIHdlIG5lZWQgdG8gdXNlIGBIb3N0TGlzdGVuZXJgLiBPbmNlIEl2eSBpcyB0aGUgZGVmYXVsdCwgd2VcbiAgLy8gY2FuIG1vdmUgdGhpcyBiYWNrIGludG8gYGhvc3RgLlxuICAvLyB0c2xpbnQ6ZGlzYWJsZTpuby1ob3N0LWRlY29yYXRvci1pbi1jb25jcmV0ZVxuICBASG9zdExpc3RlbmVyKCdrZXlkb3duJywgWyckZXZlbnQnXSlcbiAgLyoqIEhhbmRsZSBrZXlib2FyZCBldmVudHMgZm9yIHRoZSBNZW51LiAqL1xuICBfaGFuZGxlS2V5RXZlbnQoZXZlbnQ6IEtleWJvYXJkRXZlbnQpIHtcbiAgICBjb25zdCBrZXlNYW5hZ2VyID0gdGhpcy5fa2V5TWFuYWdlcjtcbiAgICBzd2l0Y2ggKGV2ZW50LmtleUNvZGUpIHtcbiAgICAgIGNhc2UgTEVGVF9BUlJPVzpcbiAgICAgIGNhc2UgUklHSFRfQVJST1c6XG4gICAgICAgIGlmICh0aGlzLl9pc0hvcml6b250YWwoKSkge1xuICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAga2V5TWFuYWdlci5zZXRGb2N1c09yaWdpbigna2V5Ym9hcmQnKTtcbiAgICAgICAgICBrZXlNYW5hZ2VyLm9uS2V5ZG93bihldmVudCk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgVVBfQVJST1c6XG4gICAgICBjYXNlIERPV05fQVJST1c6XG4gICAgICAgIGlmICghdGhpcy5faXNIb3Jpem9udGFsKCkpIHtcbiAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgIGtleU1hbmFnZXIuc2V0Rm9jdXNPcmlnaW4oJ2tleWJvYXJkJyk7XG4gICAgICAgICAga2V5TWFuYWdlci5vbktleWRvd24oZXZlbnQpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIEVTQ0FQRTpcbiAgICAgICAgaWYgKCFoYXNNb2RpZmllcktleShldmVudCkpIHtcbiAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgIHRoaXMuX21lbnVTdGFjay5jbG9zZSh0aGlzLCBGb2N1c05leHQuY3VycmVudEl0ZW0pO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIFRBQjpcbiAgICAgICAgdGhpcy5fbWVudVN0YWNrLmNsb3NlQWxsKCk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBrZXlNYW5hZ2VyLm9uS2V5ZG93bihldmVudCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFJlZ2lzdGVyIHRoaXMgbWVudSB3aXRoIGl0cyBlbmNsb3NpbmcgcGFyZW50IG1lbnUgcGFuZWwgKi9cbiAgcHJpdmF0ZSBfcmVnaXN0ZXJXaXRoUGFyZW50UGFuZWwoKSB7XG4gICAgdGhpcy5fZ2V0TWVudVBhbmVsKCk/Ll9yZWdpc3Rlck1lbnUodGhpcyk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBlbmNsb3NpbmcgQ2RrTWVudVBhbmVsIGRlZmF1bHRpbmcgdG8gdGhlIGluamVjdGVkIHJlZmVyZW5jZSBvdmVyIHRoZSBkZXZlbG9wZXJcbiAgICogcHJvdmlkZWQgcmVmZXJlbmNlLlxuICAgKi9cbiAgcHJpdmF0ZSBfZ2V0TWVudVBhbmVsKCkge1xuICAgIHJldHVybiB0aGlzLl9tZW51UGFuZWwgfHwgdGhpcy5fZXhwbGljaXRQYW5lbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb21wbGV0ZSB0aGUgY2hhbmdlIGVtaXR0ZXIgaWYgdGhlcmUgYXJlIGFueSBuZXN0ZWQgTWVudUdyb3VwcyBvciByZWdpc3RlciB0byBjb21wbGV0ZSB0aGVcbiAgICogY2hhbmdlIGVtaXR0ZXIgaWYgYSBNZW51R3JvdXAgaXMgcmVuZGVyZWQgYXQgc29tZSBwb2ludFxuICAgKi9cbiAgcHJpdmF0ZSBfY29tcGxldGVDaGFuZ2VFbWl0dGVyKCkge1xuICAgIGlmICh0aGlzLl9oYXNOZXN0ZWRHcm91cHMoKSkge1xuICAgICAgdGhpcy5jaGFuZ2UuY29tcGxldGUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fbmVzdGVkR3JvdXBzLmNoYW5nZXMucGlwZSh0YWtlKDEpKS5zdWJzY3JpYmUoKCkgPT4gdGhpcy5jaGFuZ2UuY29tcGxldGUoKSk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFJldHVybiB0cnVlIGlmIHRoZXJlIGFyZSBuZXN0ZWQgQ2RrTWVudUdyb3VwIGVsZW1lbnRzIHdpdGhpbiB0aGUgTWVudSAqL1xuICBwcml2YXRlIF9oYXNOZXN0ZWRHcm91cHMoKSB7XG4gICAgLy8gdmlldyBlbmdpbmUgaGFzIGEgYnVnIHdoZXJlIEBDb250ZW50Q2hpbGRyZW4gd2lsbCByZXR1cm4gdGhlIGN1cnJlbnQgZWxlbWVudFxuICAgIC8vIGFsb25nIHdpdGggY2hpbGRyZW4gaWYgdGhlIHNlbGVjdG9ycyBtYXRjaCAtIG5vdCBqdXN0IHRoZSBjaGlsZHJlbi5cbiAgICAvLyBIZXJlLCBpZiB0aGVyZSBpcyBhdCBsZWFzdCBvbmUgZWxlbWVudCwgd2UgY2hlY2sgdG8gc2VlIGlmIHRoZSBmaXJzdCBlbGVtZW50IGlzIGEgQ2RrTWVudSBpblxuICAgIC8vIG9yZGVyIHRvIGVuc3VyZSB0aGF0IHdlIHJldHVybiB0cnVlIGlmZiB0aGVyZSBhcmUgY2hpbGQgQ2RrTWVudUdyb3VwIGVsZW1lbnRzLlxuICAgIHJldHVybiB0aGlzLl9uZXN0ZWRHcm91cHMubGVuZ3RoID4gMCAmJiAhKHRoaXMuX25lc3RlZEdyb3Vwcy5maXJzdCBpbnN0YW5jZW9mIENka01lbnUpO1xuICB9XG5cbiAgLyoqIFNldHVwIHRoZSBGb2N1c0tleU1hbmFnZXIgd2l0aCB0aGUgY29ycmVjdCBvcmllbnRhdGlvbiBmb3IgdGhlIG1lbnUuICovXG4gIHByaXZhdGUgX3NldEtleU1hbmFnZXIoKSB7XG4gICAgdGhpcy5fa2V5TWFuYWdlciA9IG5ldyBGb2N1c0tleU1hbmFnZXIodGhpcy5fYWxsSXRlbXMpXG4gICAgICAud2l0aFdyYXAoKVxuICAgICAgLndpdGhUeXBlQWhlYWQoKVxuICAgICAgLndpdGhIb21lQW5kRW5kKCk7XG5cbiAgICBpZiAodGhpcy5faXNIb3Jpem9udGFsKCkpIHtcbiAgICAgIHRoaXMuX2tleU1hbmFnZXIud2l0aEhvcml6b250YWxPcmllbnRhdGlvbih0aGlzLl9kaXI/LnZhbHVlIHx8ICdsdHInKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fa2V5TWFuYWdlci53aXRoVmVydGljYWxPcmllbnRhdGlvbigpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgdGhlIFBvaW50ZXJGb2N1c1RyYWNrZXIgYW5kIGVuc3VyZSB0aGF0IHdoZW4gbW91c2UgZm9jdXMgY2hhbmdlcyB0aGUga2V5IG1hbmFnZXIgaXMgdXBkYXRlZFxuICAgKiB3aXRoIHRoZSBsYXRlc3QgbWVudSBpdGVtIHVuZGVyIG1vdXNlIGZvY3VzLlxuICAgKi9cbiAgcHJpdmF0ZSBfc3Vic2NyaWJlVG9Nb3VzZU1hbmFnZXIoKSB7XG4gICAgdGhpcy5fbmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgIHRoaXMuX3BvaW50ZXJUcmFja2VyID0gbmV3IFBvaW50ZXJGb2N1c1RyYWNrZXIodGhpcy5fYWxsSXRlbXMpO1xuICAgICAgdGhpcy5fcG9pbnRlclRyYWNrZXIuZW50ZXJlZFxuICAgICAgICAucGlwZSh0YWtlVW50aWwodGhpcy5jbG9zZWQpKVxuICAgICAgICAuc3Vic2NyaWJlKGl0ZW0gPT4gdGhpcy5fa2V5TWFuYWdlci5zZXRBY3RpdmVJdGVtKGl0ZW0pKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBTdWJzY3JpYmUgdG8gdGhlIE1lbnVTdGFjayBjbG9zZSBhbmQgZW1wdHkgb2JzZXJ2YWJsZXMuICovXG4gIHByaXZhdGUgX3N1YnNjcmliZVRvTWVudVN0YWNrKCkge1xuICAgIHRoaXMuX21lbnVTdGFjay5jbG9zZWRcbiAgICAgIC5waXBlKHRha2VVbnRpbCh0aGlzLmNsb3NlZCkpXG4gICAgICAuc3Vic2NyaWJlKGl0ZW0gPT4gdGhpcy5fY2xvc2VPcGVuTWVudShpdGVtKSk7XG5cbiAgICB0aGlzLl9tZW51U3RhY2suZW1wdGllZFxuICAgICAgLnBpcGUodGFrZVVudGlsKHRoaXMuY2xvc2VkKSlcbiAgICAgIC5zdWJzY3JpYmUoZXZlbnQgPT4gdGhpcy5fdG9nZ2xlTWVudUZvY3VzKGV2ZW50KSk7XG4gIH1cblxuICAvKipcbiAgICogQ2xvc2UgdGhlIG9wZW4gbWVudSBpZiB0aGUgY3VycmVudCBhY3RpdmUgaXRlbSBvcGVuZWQgdGhlIHJlcXVlc3RlZCBNZW51U3RhY2tJdGVtLlxuICAgKiBAcGFyYW0gaXRlbSB0aGUgTWVudVN0YWNrSXRlbSByZXF1ZXN0ZWQgdG8gYmUgY2xvc2VkLlxuICAgKi9cbiAgcHJpdmF0ZSBfY2xvc2VPcGVuTWVudShtZW51OiBNZW51U3RhY2tJdGVtIHwgdW5kZWZpbmVkKSB7XG4gICAgY29uc3Qga2V5TWFuYWdlciA9IHRoaXMuX2tleU1hbmFnZXI7XG4gICAgY29uc3QgdHJpZ2dlciA9IHRoaXMuX29wZW5JdGVtO1xuICAgIGlmIChtZW51ID09PSB0cmlnZ2VyPy5nZXRNZW51VHJpZ2dlcigpPy5nZXRNZW51KCkpIHtcbiAgICAgIHRyaWdnZXI/LmdldE1lbnVUcmlnZ2VyKCk/LmNsb3NlTWVudSgpO1xuICAgICAgLy8gSWYgdGhlIHVzZXIgaGFzIG1vdXNlZCBvdmVyIGEgc2libGluZyBpdGVtIHdlIHdhbnQgdG8gZm9jdXMgdGhlIGVsZW1lbnQgdW5kZXIgbW91c2UgZm9jdXNcbiAgICAgIC8vIG5vdCB0aGUgdHJpZ2dlciB3aGljaCBwcmV2aW91c2x5IG9wZW5lZCB0aGUgbm93IGNsb3NlZCBtZW51LlxuICAgICAgaWYgKHRyaWdnZXIpIHtcbiAgICAgICAga2V5TWFuYWdlci5zZXRBY3RpdmVJdGVtKHRoaXMuX3BvaW50ZXJUcmFja2VyPy5hY3RpdmVFbGVtZW50IHx8IHRyaWdnZXIpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKiBTZXQgZm9jdXMgdGhlIGVpdGhlciB0aGUgY3VycmVudCwgcHJldmlvdXMgb3IgbmV4dCBpdGVtIGJhc2VkIG9uIHRoZSBGb2N1c05leHQgZXZlbnQuICovXG4gIHByaXZhdGUgX3RvZ2dsZU1lbnVGb2N1cyhldmVudDogRm9jdXNOZXh0IHwgdW5kZWZpbmVkKSB7XG4gICAgY29uc3Qga2V5TWFuYWdlciA9IHRoaXMuX2tleU1hbmFnZXI7XG4gICAgc3dpdGNoIChldmVudCkge1xuICAgICAgY2FzZSBGb2N1c05leHQubmV4dEl0ZW06XG4gICAgICAgIGtleU1hbmFnZXIuc2V0Rm9jdXNPcmlnaW4oJ2tleWJvYXJkJyk7XG4gICAgICAgIGtleU1hbmFnZXIuc2V0TmV4dEl0ZW1BY3RpdmUoKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgRm9jdXNOZXh0LnByZXZpb3VzSXRlbTpcbiAgICAgICAga2V5TWFuYWdlci5zZXRGb2N1c09yaWdpbigna2V5Ym9hcmQnKTtcbiAgICAgICAga2V5TWFuYWdlci5zZXRQcmV2aW91c0l0ZW1BY3RpdmUoKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgRm9jdXNOZXh0LmN1cnJlbnRJdGVtOlxuICAgICAgICBpZiAoa2V5TWFuYWdlci5hY3RpdmVJdGVtKSB7XG4gICAgICAgICAga2V5TWFuYWdlci5zZXRGb2N1c09yaWdpbigna2V5Ym9hcmQnKTtcbiAgICAgICAgICBrZXlNYW5hZ2VyLnNldEFjdGl2ZUl0ZW0oa2V5TWFuYWdlci5hY3RpdmVJdGVtKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICAvLyBUT0RPKGFuZHk5Nzc1KTogcmVtb3ZlIGR1cGxpY2F0ZSBsb2dpYyBiZXR3ZWVuIG1lbnUgYW4gbWVudSBiYXJcbiAgLyoqXG4gICAqIFN1YnNjcmliZSB0byB0aGUgbWVudSB0cmlnZ2VyJ3Mgb3BlbiBldmVudHMgaW4gb3JkZXIgdG8gdHJhY2sgdGhlIHRyaWdnZXIgd2hpY2ggb3BlbmVkIHRoZSBtZW51XG4gICAqIGFuZCBzdG9wIHRyYWNraW5nIGl0IHdoZW4gdGhlIG1lbnUgaXMgY2xvc2VkLlxuICAgKi9cbiAgcHJpdmF0ZSBfc3Vic2NyaWJlVG9NZW51T3BlbigpIHtcbiAgICBjb25zdCBleGl0Q29uZGl0aW9uID0gbWVyZ2UodGhpcy5fYWxsSXRlbXMuY2hhbmdlcywgdGhpcy5jbG9zZWQpO1xuICAgIHRoaXMuX2FsbEl0ZW1zLmNoYW5nZXNcbiAgICAgIC5waXBlKFxuICAgICAgICBzdGFydFdpdGgodGhpcy5fYWxsSXRlbXMpLFxuICAgICAgICBtZXJnZU1hcCgobGlzdDogUXVlcnlMaXN0PENka01lbnVJdGVtPikgPT5cbiAgICAgICAgICBsaXN0XG4gICAgICAgICAgICAuZmlsdGVyKGl0ZW0gPT4gaXRlbS5oYXNNZW51KCkpXG4gICAgICAgICAgICAubWFwKGl0ZW0gPT4gaXRlbS5nZXRNZW51VHJpZ2dlcigpIS5vcGVuZWQucGlwZShtYXBUbyhpdGVtKSwgdGFrZVVudGlsKGV4aXRDb25kaXRpb24pKSlcbiAgICAgICAgKSxcbiAgICAgICAgbWVyZ2VBbGwoKSxcbiAgICAgICAgc3dpdGNoTWFwKChpdGVtOiBDZGtNZW51SXRlbSkgPT4ge1xuICAgICAgICAgIHRoaXMuX29wZW5JdGVtID0gaXRlbTtcbiAgICAgICAgICByZXR1cm4gaXRlbS5nZXRNZW51VHJpZ2dlcigpIS5jbG9zZWQ7XG4gICAgICAgIH0pLFxuICAgICAgICB0YWtlVW50aWwodGhpcy5jbG9zZWQpXG4gICAgICApXG4gICAgICAuc3Vic2NyaWJlKCgpID0+ICh0aGlzLl9vcGVuSXRlbSA9IHVuZGVmaW5lZCkpO1xuICB9XG5cbiAgLyoqIFJldHVybiB0cnVlIGlmIHRoaXMgbWVudSBoYXMgYmVlbiBjb25maWd1cmVkIGluIGEgaG9yaXpvbnRhbCBvcmllbnRhdGlvbi4gKi9cbiAgcHJpdmF0ZSBfaXNIb3Jpem9udGFsKCkge1xuICAgIHJldHVybiB0aGlzLm9yaWVudGF0aW9uID09PSAnaG9yaXpvbnRhbCc7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIHRydWUgaWYgdGhpcyBtZW51IGlzIGFuIGlubGluZSBtZW51LiBUaGF0IGlzLCBpdCBkb2VzIG5vdCBleGlzdCBpbiBhIHBvcC11cCBhbmQgaXNcbiAgICogYWx3YXlzIHZpc2libGUgaW4gdGhlIGRvbS5cbiAgICovXG4gIF9pc0lubGluZSgpIHtcbiAgICAvLyBOb29wTWVudVN0YWNrIGlzIHRoZSBkZWZhdWx0LiBJZiB0aGlzIG1lbnUgaXMgbm90IGlubGluZSB0aGFuIHRoZSBOb29wTWVudVN0YWNrIGlzIHJlcGxhY2VkXG4gICAgLy8gYXV0b21hdGljYWxseS5cbiAgICByZXR1cm4gdGhpcy5fbWVudVN0YWNrIGluc3RhbmNlb2YgTm9vcE1lbnVTdGFjaztcbiAgfVxuXG4gIG92ZXJyaWRlIG5nT25EZXN0cm95KCkge1xuICAgIHRoaXMuX2VtaXRDbG9zZWRFdmVudCgpO1xuICAgIHRoaXMuX3BvaW50ZXJUcmFja2VyPy5kZXN0cm95KCk7XG4gIH1cblxuICAvKiogRW1pdCBhbmQgY29tcGxldGUgdGhlIGNsb3NlZCBldmVudCBlbWl0dGVyICovXG4gIHByaXZhdGUgX2VtaXRDbG9zZWRFdmVudCgpIHtcbiAgICB0aGlzLmNsb3NlZC5uZXh0KCk7XG4gICAgdGhpcy5jbG9zZWQuY29tcGxldGUoKTtcbiAgfVxufVxuIl19