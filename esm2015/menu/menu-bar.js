/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, Input, ContentChildren, QueryList, Optional, NgZone, HostListener, ElementRef, Inject, Self, } from '@angular/core';
import { Directionality } from '@angular/cdk/bidi';
import { FocusKeyManager } from '@angular/cdk/a11y';
import { LEFT_ARROW, RIGHT_ARROW, UP_ARROW, DOWN_ARROW, ESCAPE, TAB } from '@angular/cdk/keycodes';
import { takeUntil, mergeAll, mapTo, startWith, mergeMap, switchMap } from 'rxjs/operators';
import { Subject, merge } from 'rxjs';
import { CdkMenuGroup } from './menu-group';
import { CDK_MENU } from './menu-interface';
import { CdkMenuItem } from './menu-item';
import { MenuStack } from './menu-stack';
import { PointerFocusTracker } from './pointer-focus-tracker';
import { MENU_AIM } from './menu-aim';
/**
 * Directive applied to an element which configures it as a MenuBar by setting the appropriate
 * role, aria attributes, and accessible keyboard and mouse handling logic. The component that
 * this directive is applied to should contain components marked with CdkMenuItem.
 *
 */
export class CdkMenuBar extends CdkMenuGroup {
    constructor(_menuStack, _ngZone, _elementRef, _menuAim, _dir) {
        super();
        this._menuStack = _menuStack;
        this._ngZone = _ngZone;
        this._elementRef = _elementRef;
        this._menuAim = _menuAim;
        this._dir = _dir;
        /**
         * Sets the aria-orientation attribute and determines where menus will be opened.
         * Does not affect styling/layout.
         */
        this.orientation = 'horizontal';
        /** Emits when the MenuBar is destroyed. */
        this._destroyed = new Subject();
    }
    ngAfterContentInit() {
        var _a;
        super.ngAfterContentInit();
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
    /**
     * Handle keyboard events, specifically changing the focused element and/or toggling the active
     * items menu.
     * @param event the KeyboardEvent to handle.
     */
    _handleKeyEvent(event) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        const keyManager = this._keyManager;
        switch (event.keyCode) {
            case UP_ARROW:
            case DOWN_ARROW:
            case LEFT_ARROW:
            case RIGHT_ARROW:
                const horizontalArrows = event.keyCode === LEFT_ARROW || event.keyCode === RIGHT_ARROW;
                // For a horizontal menu if the left/right keys were clicked, or a vertical menu if the
                // up/down keys were clicked: if the current menu is open, close it then focus and open the
                // next  menu.
                if ((this._isHorizontal() && horizontalArrows) ||
                    (!this._isHorizontal() && !horizontalArrows)) {
                    event.preventDefault();
                    const prevIsOpen = (_a = keyManager.activeItem) === null || _a === void 0 ? void 0 : _a.isMenuOpen();
                    (_c = (_b = keyManager.activeItem) === null || _b === void 0 ? void 0 : _b.getMenuTrigger()) === null || _c === void 0 ? void 0 : _c.closeMenu();
                    keyManager.setFocusOrigin('keyboard');
                    keyManager.onKeydown(event);
                    if (prevIsOpen) {
                        (_e = (_d = keyManager.activeItem) === null || _d === void 0 ? void 0 : _d.getMenuTrigger()) === null || _e === void 0 ? void 0 : _e.openMenu();
                    }
                }
                break;
            case ESCAPE:
                event.preventDefault();
                (_g = (_f = keyManager.activeItem) === null || _f === void 0 ? void 0 : _f.getMenuTrigger()) === null || _g === void 0 ? void 0 : _g.closeMenu();
                break;
            case TAB:
                (_j = (_h = keyManager.activeItem) === null || _h === void 0 ? void 0 : _h.getMenuTrigger()) === null || _j === void 0 ? void 0 : _j.closeMenu();
                break;
            default:
                keyManager.onKeydown(event);
        }
    }
    /** Setup the FocusKeyManager with the correct orientation for the menu bar. */
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
            this._pointerTracker.entered.pipe(takeUntil(this._destroyed)).subscribe(item => {
                if (this._hasOpenSubmenu()) {
                    this._keyManager.setActiveItem(item);
                }
            });
        });
    }
    /** Subscribe to the MenuStack close and empty observables. */
    _subscribeToMenuStack() {
        this._menuStack.closed
            .pipe(takeUntil(this._destroyed))
            .subscribe((item) => this._closeOpenMenu(item));
        this._menuStack.emptied
            .pipe(takeUntil(this._destroyed))
            .subscribe((event) => this._toggleOpenMenu(event));
    }
    /**
     * Close the open menu if the current active item opened the requested MenuStackItem.
     * @param item the MenuStackItem requested to be closed.
     */
    _closeOpenMenu(menu) {
        var _a, _b, _c;
        const trigger = this._openItem;
        const keyManager = this._keyManager;
        if (menu === ((_a = trigger === null || trigger === void 0 ? void 0 : trigger.getMenuTrigger()) === null || _a === void 0 ? void 0 : _a.getMenu())) {
            (_b = trigger.getMenuTrigger()) === null || _b === void 0 ? void 0 : _b.closeMenu();
            // If the user has moused over a sibling item we want to focus the element under mouse focus
            // not the trigger which previously opened the now closed menu.
            keyManager.setActiveItem(((_c = this._pointerTracker) === null || _c === void 0 ? void 0 : _c.activeElement) || trigger);
        }
    }
    /**
     * Set focus to either the current, previous or next item based on the FocusNext event, then
     * open the previous or next item.
     */
    _toggleOpenMenu(event) {
        var _a, _b, _c, _d;
        const keyManager = this._keyManager;
        switch (event) {
            case 0 /* nextItem */:
                keyManager.setFocusOrigin('keyboard');
                keyManager.setNextItemActive();
                (_b = (_a = keyManager.activeItem) === null || _a === void 0 ? void 0 : _a.getMenuTrigger()) === null || _b === void 0 ? void 0 : _b.openMenu();
                break;
            case 1 /* previousItem */:
                keyManager.setFocusOrigin('keyboard');
                keyManager.setPreviousItemActive();
                (_d = (_c = keyManager.activeItem) === null || _c === void 0 ? void 0 : _c.getMenuTrigger()) === null || _d === void 0 ? void 0 : _d.openMenu();
                break;
            case 2 /* currentItem */:
                if (keyManager.activeItem) {
                    keyManager.setFocusOrigin('keyboard');
                    keyManager.setActiveItem(keyManager.activeItem);
                }
                break;
        }
    }
    /**
     * @return true if the menu bar is configured to be horizontal.
     */
    _isHorizontal() {
        return this.orientation === 'horizontal';
    }
    /**
     * Subscribe to the menu trigger's open events in order to track the trigger which opened the menu
     * and stop tracking it when the menu is closed.
     */
    _subscribeToMenuOpen() {
        const exitCondition = merge(this._allItems.changes, this._destroyed);
        this._allItems.changes
            .pipe(startWith(this._allItems), mergeMap((list) => list
            .filter(item => item.hasMenu())
            .map(item => item.getMenuTrigger().opened.pipe(mapTo(item), takeUntil(exitCondition)))), mergeAll(), switchMap((item) => {
            this._openItem = item;
            return item.getMenuTrigger().closed;
        }), takeUntil(this._destroyed))
            .subscribe(() => (this._openItem = undefined));
    }
    /** Return true if the MenuBar has an open submenu. */
    _hasOpenSubmenu() {
        return !!this._openItem;
    }
    ngOnDestroy() {
        var _a;
        super.ngOnDestroy();
        this._destroyed.next();
        this._destroyed.complete();
        (_a = this._pointerTracker) === null || _a === void 0 ? void 0 : _a.destroy();
    }
}
CdkMenuBar.decorators = [
    { type: Directive, args: [{
                selector: '[cdkMenuBar]',
                exportAs: 'cdkMenuBar',
                host: {
                    'role': 'menubar',
                    'class': 'cdk-menu-bar',
                    'tabindex': '0',
                    '[attr.aria-orientation]': 'orientation',
                },
                providers: [
                    { provide: CdkMenuGroup, useExisting: CdkMenuBar },
                    { provide: CDK_MENU, useExisting: CdkMenuBar },
                    { provide: MenuStack, useClass: MenuStack },
                ],
            },] }
];
CdkMenuBar.ctorParameters = () => [
    { type: MenuStack },
    { type: NgZone },
    { type: ElementRef },
    { type: undefined, decorators: [{ type: Self }, { type: Optional }, { type: Inject, args: [MENU_AIM,] }] },
    { type: Directionality, decorators: [{ type: Optional }] }
];
CdkMenuBar.propDecorators = {
    orientation: [{ type: Input, args: ['cdkMenuBarOrientation',] }],
    _allItems: [{ type: ContentChildren, args: [CdkMenuItem, { descendants: true },] }],
    focusFirstItem: [{ type: HostListener, args: ['focus',] }],
    _handleKeyEvent: [{ type: HostListener, args: ['keydown', ['$event'],] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1iYXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrLWV4cGVyaW1lbnRhbC9tZW51L21lbnUtYmFyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFDTCxTQUFTLEVBQ1QsS0FBSyxFQUNMLGVBQWUsRUFDZixTQUFTLEVBR1QsUUFBUSxFQUNSLE1BQU0sRUFDTixZQUFZLEVBQ1osVUFBVSxFQUNWLE1BQU0sRUFDTixJQUFJLEdBQ0wsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQ2pELE9BQU8sRUFBQyxlQUFlLEVBQWMsTUFBTSxtQkFBbUIsQ0FBQztBQUMvRCxPQUFPLEVBQUMsVUFBVSxFQUFFLFdBQVcsRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUNqRyxPQUFPLEVBQUMsU0FBUyxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUMxRixPQUFPLEVBQUMsT0FBTyxFQUFFLEtBQUssRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUNwQyxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sY0FBYyxDQUFDO0FBQzFDLE9BQU8sRUFBQyxRQUFRLEVBQU8sTUFBTSxrQkFBa0IsQ0FBQztBQUNoRCxPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0sYUFBYSxDQUFDO0FBQ3hDLE9BQU8sRUFBQyxTQUFTLEVBQTJCLE1BQU0sY0FBYyxDQUFDO0FBQ2pFLE9BQU8sRUFBQyxtQkFBbUIsRUFBQyxNQUFNLHlCQUF5QixDQUFDO0FBQzVELE9BQU8sRUFBVSxRQUFRLEVBQUMsTUFBTSxZQUFZLENBQUM7QUFFN0M7Ozs7O0dBS0c7QUFnQkgsTUFBTSxPQUFPLFVBQVcsU0FBUSxZQUFZO0lBdUIxQyxZQUNXLFVBQXFCLEVBQ2IsT0FBZSxFQUN2QixXQUFvQyxFQUNVLFFBQWtCLEVBQzVDLElBQXFCO1FBRWxELEtBQUssRUFBRSxDQUFDO1FBTkMsZUFBVSxHQUFWLFVBQVUsQ0FBVztRQUNiLFlBQU8sR0FBUCxPQUFPLENBQVE7UUFDdkIsZ0JBQVcsR0FBWCxXQUFXLENBQXlCO1FBQ1UsYUFBUSxHQUFSLFFBQVEsQ0FBVTtRQUM1QyxTQUFJLEdBQUosSUFBSSxDQUFpQjtRQTNCcEQ7OztXQUdHO1FBQzZCLGdCQUFXLEdBQThCLFlBQVksQ0FBQztRQVF0RiwyQ0FBMkM7UUFDMUIsZUFBVSxHQUFrQixJQUFJLE9BQU8sRUFBRSxDQUFDO0lBaUIzRCxDQUFDO0lBRUQsa0JBQWtCOztRQUNoQixLQUFLLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztRQUUzQixJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDdEIsSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUM7UUFDNUIsSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7UUFDN0IsSUFBSSxDQUFDLHdCQUF3QixFQUFFLENBQUM7UUFFaEMsTUFBQSxJQUFJLENBQUMsUUFBUSwwQ0FBRSxVQUFVLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxlQUFnQixFQUFFO0lBQ3pELENBQUM7SUFFRCw4RkFBOEY7SUFDOUYsOEZBQThGO0lBQzlGLGtDQUFrQztJQUNsQywrQ0FBK0M7SUFFL0MsOEVBQThFO0lBQzlFLGNBQWMsQ0FBQyxjQUEyQixTQUFTO1FBQ2pELElBQUksQ0FBQyxXQUFXLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQzdDLElBQUksQ0FBQyxXQUFXLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztJQUN4QyxDQUFDO0lBRUQsNkVBQTZFO0lBQzdFLGFBQWEsQ0FBQyxjQUEyQixTQUFTO1FBQ2hELElBQUksQ0FBQyxXQUFXLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQzdDLElBQUksQ0FBQyxXQUFXLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztJQUN2QyxDQUFDO0lBRUQsOEZBQThGO0lBQzlGLDhGQUE4RjtJQUM5RixrQ0FBa0M7SUFDbEMsK0NBQStDO0lBRS9DOzs7O09BSUc7SUFDSCxlQUFlLENBQUMsS0FBb0I7O1FBQ2xDLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7UUFDcEMsUUFBUSxLQUFLLENBQUMsT0FBTyxFQUFFO1lBQ3JCLEtBQUssUUFBUSxDQUFDO1lBQ2QsS0FBSyxVQUFVLENBQUM7WUFDaEIsS0FBSyxVQUFVLENBQUM7WUFDaEIsS0FBSyxXQUFXO2dCQUNkLE1BQU0sZ0JBQWdCLEdBQUcsS0FBSyxDQUFDLE9BQU8sS0FBSyxVQUFVLElBQUksS0FBSyxDQUFDLE9BQU8sS0FBSyxXQUFXLENBQUM7Z0JBQ3ZGLHVGQUF1RjtnQkFDdkYsMkZBQTJGO2dCQUMzRixjQUFjO2dCQUNkLElBQ0UsQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLElBQUksZ0JBQWdCLENBQUM7b0JBQzFDLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxFQUM1QztvQkFDQSxLQUFLLENBQUMsY0FBYyxFQUFFLENBQUM7b0JBRXZCLE1BQU0sVUFBVSxTQUFHLFVBQVUsQ0FBQyxVQUFVLDBDQUFFLFVBQVUsRUFBRSxDQUFDO29CQUN2RCxZQUFBLFVBQVUsQ0FBQyxVQUFVLDBDQUFFLGNBQWMsNENBQUksU0FBUyxHQUFHO29CQUVyRCxVQUFVLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxDQUFDO29CQUN0QyxVQUFVLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUM1QixJQUFJLFVBQVUsRUFBRTt3QkFDZCxZQUFBLFVBQVUsQ0FBQyxVQUFVLDBDQUFFLGNBQWMsNENBQUksUUFBUSxHQUFHO3FCQUNyRDtpQkFDRjtnQkFDRCxNQUFNO1lBRVIsS0FBSyxNQUFNO2dCQUNULEtBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQztnQkFDdkIsWUFBQSxVQUFVLENBQUMsVUFBVSwwQ0FBRSxjQUFjLDRDQUFJLFNBQVMsR0FBRztnQkFDckQsTUFBTTtZQUVSLEtBQUssR0FBRztnQkFDTixZQUFBLFVBQVUsQ0FBQyxVQUFVLDBDQUFFLGNBQWMsNENBQUksU0FBUyxHQUFHO2dCQUNyRCxNQUFNO1lBRVI7Z0JBQ0UsVUFBVSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUMvQjtJQUNILENBQUM7SUFFRCwrRUFBK0U7SUFDdkUsY0FBYzs7UUFDcEIsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLGVBQWUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDO2FBQ25ELFFBQVEsRUFBRTthQUNWLGFBQWEsRUFBRTthQUNmLGNBQWMsRUFBRSxDQUFDO1FBRXBCLElBQUksSUFBSSxDQUFDLGFBQWEsRUFBRSxFQUFFO1lBQ3hCLElBQUksQ0FBQyxXQUFXLENBQUMseUJBQXlCLENBQUMsT0FBQSxJQUFJLENBQUMsSUFBSSwwQ0FBRSxLQUFLLEtBQUksS0FBSyxDQUFDLENBQUM7U0FDdkU7YUFBTTtZQUNMLElBQUksQ0FBQyxXQUFXLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztTQUM1QztJQUNILENBQUM7SUFFRDs7O09BR0c7SUFDSyx3QkFBd0I7UUFDOUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLEVBQUU7WUFDbEMsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLG1CQUFtQixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUMvRCxJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDN0UsSUFBSSxJQUFJLENBQUMsZUFBZSxFQUFFLEVBQUU7b0JBQzFCLElBQUksQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO2lCQUN0QztZQUNILENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQsOERBQThEO0lBQ3RELHFCQUFxQjtRQUMzQixJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU07YUFDbkIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7YUFDaEMsU0FBUyxDQUFDLENBQUMsSUFBbUIsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBRWpFLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTzthQUNwQixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQzthQUNoQyxTQUFTLENBQUMsQ0FBQyxLQUFnQixFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDbEUsQ0FBQztJQUVEOzs7T0FHRztJQUNLLGNBQWMsQ0FBQyxJQUFtQjs7UUFDeEMsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUMvQixNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO1FBQ3BDLElBQUksSUFBSSxZQUFLLE9BQU8sYUFBUCxPQUFPLHVCQUFQLE9BQU8sQ0FBRSxjQUFjLDRDQUFJLE9BQU8sR0FBRSxFQUFFO1lBQ2pELE1BQUEsT0FBTyxDQUFDLGNBQWMsRUFBRSwwQ0FBRSxTQUFTLEdBQUc7WUFDdEMsNEZBQTRGO1lBQzVGLCtEQUErRDtZQUMvRCxVQUFVLENBQUMsYUFBYSxDQUFDLE9BQUEsSUFBSSxDQUFDLGVBQWUsMENBQUUsYUFBYSxLQUFJLE9BQU8sQ0FBQyxDQUFDO1NBQzFFO0lBQ0gsQ0FBQztJQUVEOzs7T0FHRztJQUNLLGVBQWUsQ0FBQyxLQUFnQjs7UUFDdEMsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztRQUNwQyxRQUFRLEtBQUssRUFBRTtZQUNiO2dCQUNFLFVBQVUsQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQ3RDLFVBQVUsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO2dCQUMvQixZQUFBLFVBQVUsQ0FBQyxVQUFVLDBDQUFFLGNBQWMsNENBQUksUUFBUSxHQUFHO2dCQUNwRCxNQUFNO1lBRVI7Z0JBQ0UsVUFBVSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFDdEMsVUFBVSxDQUFDLHFCQUFxQixFQUFFLENBQUM7Z0JBQ25DLFlBQUEsVUFBVSxDQUFDLFVBQVUsMENBQUUsY0FBYyw0Q0FBSSxRQUFRLEdBQUc7Z0JBQ3BELE1BQU07WUFFUjtnQkFDRSxJQUFJLFVBQVUsQ0FBQyxVQUFVLEVBQUU7b0JBQ3pCLFVBQVUsQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUM7b0JBQ3RDLFVBQVUsQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2lCQUNqRDtnQkFDRCxNQUFNO1NBQ1Q7SUFDSCxDQUFDO0lBRUQ7O09BRUc7SUFDSyxhQUFhO1FBQ25CLE9BQU8sSUFBSSxDQUFDLFdBQVcsS0FBSyxZQUFZLENBQUM7SUFDM0MsQ0FBQztJQUVEOzs7T0FHRztJQUNLLG9CQUFvQjtRQUMxQixNQUFNLGFBQWEsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3JFLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTzthQUNuQixJQUFJLENBQ0gsU0FBUyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFDekIsUUFBUSxDQUFDLENBQUMsSUFBNEIsRUFBRSxFQUFFLENBQ3hDLElBQUk7YUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7YUFDOUIsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLFNBQVMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQzFGLEVBQ0QsUUFBUSxFQUFFLEVBQ1YsU0FBUyxDQUFDLENBQUMsSUFBaUIsRUFBRSxFQUFFO1lBQzlCLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO1lBQ3RCLE9BQU8sSUFBSSxDQUFDLGNBQWMsRUFBRyxDQUFDLE1BQU0sQ0FBQztRQUN2QyxDQUFDLENBQUMsRUFDRixTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUMzQjthQUNBLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQztJQUNuRCxDQUFDO0lBRUQsc0RBQXNEO0lBQzlDLGVBQWU7UUFDckIsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQztJQUMxQixDQUFDO0lBRUQsV0FBVzs7UUFDVCxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7UUFFcEIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUN2QixJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBRTNCLE1BQUEsSUFBSSxDQUFDLGVBQWUsMENBQUUsT0FBTyxHQUFHO0lBQ2xDLENBQUM7OztZQTlQRixTQUFTLFNBQUM7Z0JBQ1QsUUFBUSxFQUFFLGNBQWM7Z0JBQ3hCLFFBQVEsRUFBRSxZQUFZO2dCQUN0QixJQUFJLEVBQUU7b0JBQ0osTUFBTSxFQUFFLFNBQVM7b0JBQ2pCLE9BQU8sRUFBRSxjQUFjO29CQUN2QixVQUFVLEVBQUUsR0FBRztvQkFDZix5QkFBeUIsRUFBRSxhQUFhO2lCQUN6QztnQkFDRCxTQUFTLEVBQUU7b0JBQ1QsRUFBQyxPQUFPLEVBQUUsWUFBWSxFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQUM7b0JBQ2hELEVBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsVUFBVSxFQUFDO29CQUM1QyxFQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBQztpQkFDMUM7YUFDRjs7O1lBeEJPLFNBQVM7WUFkZixNQUFNO1lBRU4sVUFBVTs0Q0FnRVAsSUFBSSxZQUFJLFFBQVEsWUFBSSxNQUFNLFNBQUMsUUFBUTtZQTVEaEMsY0FBYyx1QkE2RGpCLFFBQVE7OzswQkF2QlYsS0FBSyxTQUFDLHVCQUF1Qjt3QkFZN0IsZUFBZSxTQUFDLFdBQVcsRUFBRSxFQUFDLFdBQVcsRUFBRSxJQUFJLEVBQUM7NkJBK0JoRCxZQUFZLFNBQUMsT0FBTzs4QkFpQnBCLFlBQVksU0FBQyxTQUFTLEVBQUUsQ0FBQyxRQUFRLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtcbiAgRGlyZWN0aXZlLFxuICBJbnB1dCxcbiAgQ29udGVudENoaWxkcmVuLFxuICBRdWVyeUxpc3QsXG4gIEFmdGVyQ29udGVudEluaXQsXG4gIE9uRGVzdHJveSxcbiAgT3B0aW9uYWwsXG4gIE5nWm9uZSxcbiAgSG9zdExpc3RlbmVyLFxuICBFbGVtZW50UmVmLFxuICBJbmplY3QsXG4gIFNlbGYsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtEaXJlY3Rpb25hbGl0eX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2JpZGknO1xuaW1wb3J0IHtGb2N1c0tleU1hbmFnZXIsIEZvY3VzT3JpZ2lufSBmcm9tICdAYW5ndWxhci9jZGsvYTExeSc7XG5pbXBvcnQge0xFRlRfQVJST1csIFJJR0hUX0FSUk9XLCBVUF9BUlJPVywgRE9XTl9BUlJPVywgRVNDQVBFLCBUQUJ9IGZyb20gJ0Bhbmd1bGFyL2Nkay9rZXljb2Rlcyc7XG5pbXBvcnQge3Rha2VVbnRpbCwgbWVyZ2VBbGwsIG1hcFRvLCBzdGFydFdpdGgsIG1lcmdlTWFwLCBzd2l0Y2hNYXB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7U3ViamVjdCwgbWVyZ2V9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHtDZGtNZW51R3JvdXB9IGZyb20gJy4vbWVudS1ncm91cCc7XG5pbXBvcnQge0NES19NRU5VLCBNZW51fSBmcm9tICcuL21lbnUtaW50ZXJmYWNlJztcbmltcG9ydCB7Q2RrTWVudUl0ZW19IGZyb20gJy4vbWVudS1pdGVtJztcbmltcG9ydCB7TWVudVN0YWNrLCBNZW51U3RhY2tJdGVtLCBGb2N1c05leHR9IGZyb20gJy4vbWVudS1zdGFjayc7XG5pbXBvcnQge1BvaW50ZXJGb2N1c1RyYWNrZXJ9IGZyb20gJy4vcG9pbnRlci1mb2N1cy10cmFja2VyJztcbmltcG9ydCB7TWVudUFpbSwgTUVOVV9BSU19IGZyb20gJy4vbWVudS1haW0nO1xuXG4vKipcbiAqIERpcmVjdGl2ZSBhcHBsaWVkIHRvIGFuIGVsZW1lbnQgd2hpY2ggY29uZmlndXJlcyBpdCBhcyBhIE1lbnVCYXIgYnkgc2V0dGluZyB0aGUgYXBwcm9wcmlhdGVcbiAqIHJvbGUsIGFyaWEgYXR0cmlidXRlcywgYW5kIGFjY2Vzc2libGUga2V5Ym9hcmQgYW5kIG1vdXNlIGhhbmRsaW5nIGxvZ2ljLiBUaGUgY29tcG9uZW50IHRoYXRcbiAqIHRoaXMgZGlyZWN0aXZlIGlzIGFwcGxpZWQgdG8gc2hvdWxkIGNvbnRhaW4gY29tcG9uZW50cyBtYXJrZWQgd2l0aCBDZGtNZW51SXRlbS5cbiAqXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tjZGtNZW51QmFyXScsXG4gIGV4cG9ydEFzOiAnY2RrTWVudUJhcicsXG4gIGhvc3Q6IHtcbiAgICAncm9sZSc6ICdtZW51YmFyJyxcbiAgICAnY2xhc3MnOiAnY2RrLW1lbnUtYmFyJyxcbiAgICAndGFiaW5kZXgnOiAnMCcsXG4gICAgJ1thdHRyLmFyaWEtb3JpZW50YXRpb25dJzogJ29yaWVudGF0aW9uJyxcbiAgfSxcbiAgcHJvdmlkZXJzOiBbXG4gICAge3Byb3ZpZGU6IENka01lbnVHcm91cCwgdXNlRXhpc3Rpbmc6IENka01lbnVCYXJ9LFxuICAgIHtwcm92aWRlOiBDREtfTUVOVSwgdXNlRXhpc3Rpbmc6IENka01lbnVCYXJ9LFxuICAgIHtwcm92aWRlOiBNZW51U3RhY2ssIHVzZUNsYXNzOiBNZW51U3RhY2t9LFxuICBdLFxufSlcbmV4cG9ydCBjbGFzcyBDZGtNZW51QmFyIGV4dGVuZHMgQ2RrTWVudUdyb3VwIGltcGxlbWVudHMgTWVudSwgQWZ0ZXJDb250ZW50SW5pdCwgT25EZXN0cm95IHtcbiAgLyoqXG4gICAqIFNldHMgdGhlIGFyaWEtb3JpZW50YXRpb24gYXR0cmlidXRlIGFuZCBkZXRlcm1pbmVzIHdoZXJlIG1lbnVzIHdpbGwgYmUgb3BlbmVkLlxuICAgKiBEb2VzIG5vdCBhZmZlY3Qgc3R5bGluZy9sYXlvdXQuXG4gICAqL1xuICBASW5wdXQoJ2Nka01lbnVCYXJPcmllbnRhdGlvbicpIG9yaWVudGF0aW9uOiAnaG9yaXpvbnRhbCcgfCAndmVydGljYWwnID0gJ2hvcml6b250YWwnO1xuXG4gIC8qKiBIYW5kbGVzIGtleWJvYXJkIGV2ZW50cyBmb3IgdGhlIE1lbnVCYXIuICovXG4gIHByaXZhdGUgX2tleU1hbmFnZXI6IEZvY3VzS2V5TWFuYWdlcjxDZGtNZW51SXRlbT47XG5cbiAgLyoqIE1hbmFnZXMgaXRlbXMgdW5kZXIgbW91c2UgZm9jdXMgKi9cbiAgcHJpdmF0ZSBfcG9pbnRlclRyYWNrZXI/OiBQb2ludGVyRm9jdXNUcmFja2VyPENka01lbnVJdGVtPjtcblxuICAvKiogRW1pdHMgd2hlbiB0aGUgTWVudUJhciBpcyBkZXN0cm95ZWQuICovXG4gIHByaXZhdGUgcmVhZG9ubHkgX2Rlc3Ryb3llZDogU3ViamVjdDx2b2lkPiA9IG5ldyBTdWJqZWN0KCk7XG5cbiAgLyoqIEFsbCBjaGlsZCBNZW51SXRlbSBlbGVtZW50cyBuZXN0ZWQgaW4gdGhpcyBNZW51QmFyLiAqL1xuICBAQ29udGVudENoaWxkcmVuKENka01lbnVJdGVtLCB7ZGVzY2VuZGFudHM6IHRydWV9KVxuICBwcml2YXRlIHJlYWRvbmx5IF9hbGxJdGVtczogUXVlcnlMaXN0PENka01lbnVJdGVtPjtcblxuICAvKiogVGhlIE1lbnUgSXRlbSB3aGljaCB0cmlnZ2VyZWQgdGhlIG9wZW4gc3VibWVudS4gKi9cbiAgcHJpdmF0ZSBfb3Blbkl0ZW0/OiBDZGtNZW51SXRlbTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICByZWFkb25seSBfbWVudVN0YWNrOiBNZW51U3RhY2ssXG4gICAgcHJpdmF0ZSByZWFkb25seSBfbmdab25lOiBOZ1pvbmUsXG4gICAgcmVhZG9ubHkgX2VsZW1lbnRSZWY6IEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+LFxuICAgIEBTZWxmKCkgQE9wdGlvbmFsKCkgQEluamVjdChNRU5VX0FJTSkgcHJpdmF0ZSByZWFkb25seSBfbWVudUFpbT86IE1lbnVBaW0sXG4gICAgQE9wdGlvbmFsKCkgcHJpdmF0ZSByZWFkb25seSBfZGlyPzogRGlyZWN0aW9uYWxpdHlcbiAgKSB7XG4gICAgc3VwZXIoKTtcbiAgfVxuXG4gIG5nQWZ0ZXJDb250ZW50SW5pdCgpIHtcbiAgICBzdXBlci5uZ0FmdGVyQ29udGVudEluaXQoKTtcblxuICAgIHRoaXMuX3NldEtleU1hbmFnZXIoKTtcbiAgICB0aGlzLl9zdWJzY3JpYmVUb01lbnVPcGVuKCk7XG4gICAgdGhpcy5fc3Vic2NyaWJlVG9NZW51U3RhY2soKTtcbiAgICB0aGlzLl9zdWJzY3JpYmVUb01vdXNlTWFuYWdlcigpO1xuXG4gICAgdGhpcy5fbWVudUFpbT8uaW5pdGlhbGl6ZSh0aGlzLCB0aGlzLl9wb2ludGVyVHJhY2tlciEpO1xuICB9XG5cbiAgLy8gSW4gSXZ5IHRoZSBgaG9zdGAgbWV0YWRhdGEgd2lsbCBiZSBtZXJnZWQsIHdoZXJlYXMgaW4gVmlld0VuZ2luZSBpdCBpcyBvdmVycmlkZGVuLiBJbiBvcmRlclxuICAvLyB0byBhdm9pZCBkb3VibGUgZXZlbnQgbGlzdGVuZXJzLCB3ZSBuZWVkIHRvIHVzZSBgSG9zdExpc3RlbmVyYC4gT25jZSBJdnkgaXMgdGhlIGRlZmF1bHQsIHdlXG4gIC8vIGNhbiBtb3ZlIHRoaXMgYmFjayBpbnRvIGBob3N0YC5cbiAgLy8gdHNsaW50OmRpc2FibGU6bm8taG9zdC1kZWNvcmF0b3ItaW4tY29uY3JldGVcbiAgQEhvc3RMaXN0ZW5lcignZm9jdXMnKVxuICAvKiogUGxhY2UgZm9jdXMgb24gdGhlIGZpcnN0IE1lbnVJdGVtIGluIHRoZSBtZW51IGFuZCBzZXQgdGhlIGZvY3VzIG9yaWdpbi4gKi9cbiAgZm9jdXNGaXJzdEl0ZW0oZm9jdXNPcmlnaW46IEZvY3VzT3JpZ2luID0gJ3Byb2dyYW0nKSB7XG4gICAgdGhpcy5fa2V5TWFuYWdlci5zZXRGb2N1c09yaWdpbihmb2N1c09yaWdpbik7XG4gICAgdGhpcy5fa2V5TWFuYWdlci5zZXRGaXJzdEl0ZW1BY3RpdmUoKTtcbiAgfVxuXG4gIC8qKiBQbGFjZSBmb2N1cyBvbiB0aGUgbGFzdCBNZW51SXRlbSBpbiB0aGUgbWVudSBhbmQgc2V0IHRoZSBmb2N1cyBvcmlnaW4uICovXG4gIGZvY3VzTGFzdEl0ZW0oZm9jdXNPcmlnaW46IEZvY3VzT3JpZ2luID0gJ3Byb2dyYW0nKSB7XG4gICAgdGhpcy5fa2V5TWFuYWdlci5zZXRGb2N1c09yaWdpbihmb2N1c09yaWdpbik7XG4gICAgdGhpcy5fa2V5TWFuYWdlci5zZXRMYXN0SXRlbUFjdGl2ZSgpO1xuICB9XG5cbiAgLy8gSW4gSXZ5IHRoZSBgaG9zdGAgbWV0YWRhdGEgd2lsbCBiZSBtZXJnZWQsIHdoZXJlYXMgaW4gVmlld0VuZ2luZSBpdCBpcyBvdmVycmlkZGVuLiBJbiBvcmRlclxuICAvLyB0byBhdm9pZCBkb3VibGUgZXZlbnQgbGlzdGVuZXJzLCB3ZSBuZWVkIHRvIHVzZSBgSG9zdExpc3RlbmVyYC4gT25jZSBJdnkgaXMgdGhlIGRlZmF1bHQsIHdlXG4gIC8vIGNhbiBtb3ZlIHRoaXMgYmFjayBpbnRvIGBob3N0YC5cbiAgLy8gdHNsaW50OmRpc2FibGU6bm8taG9zdC1kZWNvcmF0b3ItaW4tY29uY3JldGVcbiAgQEhvc3RMaXN0ZW5lcigna2V5ZG93bicsIFsnJGV2ZW50J10pXG4gIC8qKlxuICAgKiBIYW5kbGUga2V5Ym9hcmQgZXZlbnRzLCBzcGVjaWZpY2FsbHkgY2hhbmdpbmcgdGhlIGZvY3VzZWQgZWxlbWVudCBhbmQvb3IgdG9nZ2xpbmcgdGhlIGFjdGl2ZVxuICAgKiBpdGVtcyBtZW51LlxuICAgKiBAcGFyYW0gZXZlbnQgdGhlIEtleWJvYXJkRXZlbnQgdG8gaGFuZGxlLlxuICAgKi9cbiAgX2hhbmRsZUtleUV2ZW50KGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XG4gICAgY29uc3Qga2V5TWFuYWdlciA9IHRoaXMuX2tleU1hbmFnZXI7XG4gICAgc3dpdGNoIChldmVudC5rZXlDb2RlKSB7XG4gICAgICBjYXNlIFVQX0FSUk9XOlxuICAgICAgY2FzZSBET1dOX0FSUk9XOlxuICAgICAgY2FzZSBMRUZUX0FSUk9XOlxuICAgICAgY2FzZSBSSUdIVF9BUlJPVzpcbiAgICAgICAgY29uc3QgaG9yaXpvbnRhbEFycm93cyA9IGV2ZW50LmtleUNvZGUgPT09IExFRlRfQVJST1cgfHwgZXZlbnQua2V5Q29kZSA9PT0gUklHSFRfQVJST1c7XG4gICAgICAgIC8vIEZvciBhIGhvcml6b250YWwgbWVudSBpZiB0aGUgbGVmdC9yaWdodCBrZXlzIHdlcmUgY2xpY2tlZCwgb3IgYSB2ZXJ0aWNhbCBtZW51IGlmIHRoZVxuICAgICAgICAvLyB1cC9kb3duIGtleXMgd2VyZSBjbGlja2VkOiBpZiB0aGUgY3VycmVudCBtZW51IGlzIG9wZW4sIGNsb3NlIGl0IHRoZW4gZm9jdXMgYW5kIG9wZW4gdGhlXG4gICAgICAgIC8vIG5leHQgIG1lbnUuXG4gICAgICAgIGlmIChcbiAgICAgICAgICAodGhpcy5faXNIb3Jpem9udGFsKCkgJiYgaG9yaXpvbnRhbEFycm93cykgfHxcbiAgICAgICAgICAoIXRoaXMuX2lzSG9yaXpvbnRhbCgpICYmICFob3Jpem9udGFsQXJyb3dzKVxuICAgICAgICApIHtcbiAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgICAgY29uc3QgcHJldklzT3BlbiA9IGtleU1hbmFnZXIuYWN0aXZlSXRlbT8uaXNNZW51T3BlbigpO1xuICAgICAgICAgIGtleU1hbmFnZXIuYWN0aXZlSXRlbT8uZ2V0TWVudVRyaWdnZXIoKT8uY2xvc2VNZW51KCk7XG5cbiAgICAgICAgICBrZXlNYW5hZ2VyLnNldEZvY3VzT3JpZ2luKCdrZXlib2FyZCcpO1xuICAgICAgICAgIGtleU1hbmFnZXIub25LZXlkb3duKGV2ZW50KTtcbiAgICAgICAgICBpZiAocHJldklzT3Blbikge1xuICAgICAgICAgICAga2V5TWFuYWdlci5hY3RpdmVJdGVtPy5nZXRNZW51VHJpZ2dlcigpPy5vcGVuTWVudSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBFU0NBUEU6XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGtleU1hbmFnZXIuYWN0aXZlSXRlbT8uZ2V0TWVudVRyaWdnZXIoKT8uY2xvc2VNZW51KCk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIFRBQjpcbiAgICAgICAga2V5TWFuYWdlci5hY3RpdmVJdGVtPy5nZXRNZW51VHJpZ2dlcigpPy5jbG9zZU1lbnUoKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGtleU1hbmFnZXIub25LZXlkb3duKGV2ZW50KTtcbiAgICB9XG4gIH1cblxuICAvKiogU2V0dXAgdGhlIEZvY3VzS2V5TWFuYWdlciB3aXRoIHRoZSBjb3JyZWN0IG9yaWVudGF0aW9uIGZvciB0aGUgbWVudSBiYXIuICovXG4gIHByaXZhdGUgX3NldEtleU1hbmFnZXIoKSB7XG4gICAgdGhpcy5fa2V5TWFuYWdlciA9IG5ldyBGb2N1c0tleU1hbmFnZXIodGhpcy5fYWxsSXRlbXMpXG4gICAgICAud2l0aFdyYXAoKVxuICAgICAgLndpdGhUeXBlQWhlYWQoKVxuICAgICAgLndpdGhIb21lQW5kRW5kKCk7XG5cbiAgICBpZiAodGhpcy5faXNIb3Jpem9udGFsKCkpIHtcbiAgICAgIHRoaXMuX2tleU1hbmFnZXIud2l0aEhvcml6b250YWxPcmllbnRhdGlvbih0aGlzLl9kaXI/LnZhbHVlIHx8ICdsdHInKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fa2V5TWFuYWdlci53aXRoVmVydGljYWxPcmllbnRhdGlvbigpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgdGhlIFBvaW50ZXJGb2N1c1RyYWNrZXIgYW5kIGVuc3VyZSB0aGF0IHdoZW4gbW91c2UgZm9jdXMgY2hhbmdlcyB0aGUga2V5IG1hbmFnZXIgaXMgdXBkYXRlZFxuICAgKiB3aXRoIHRoZSBsYXRlc3QgbWVudSBpdGVtIHVuZGVyIG1vdXNlIGZvY3VzLlxuICAgKi9cbiAgcHJpdmF0ZSBfc3Vic2NyaWJlVG9Nb3VzZU1hbmFnZXIoKSB7XG4gICAgdGhpcy5fbmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgIHRoaXMuX3BvaW50ZXJUcmFja2VyID0gbmV3IFBvaW50ZXJGb2N1c1RyYWNrZXIodGhpcy5fYWxsSXRlbXMpO1xuICAgICAgdGhpcy5fcG9pbnRlclRyYWNrZXIuZW50ZXJlZC5waXBlKHRha2VVbnRpbCh0aGlzLl9kZXN0cm95ZWQpKS5zdWJzY3JpYmUoaXRlbSA9PiB7XG4gICAgICAgIGlmICh0aGlzLl9oYXNPcGVuU3VibWVudSgpKSB7XG4gICAgICAgICAgdGhpcy5fa2V5TWFuYWdlci5zZXRBY3RpdmVJdGVtKGl0ZW0pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBTdWJzY3JpYmUgdG8gdGhlIE1lbnVTdGFjayBjbG9zZSBhbmQgZW1wdHkgb2JzZXJ2YWJsZXMuICovXG4gIHByaXZhdGUgX3N1YnNjcmliZVRvTWVudVN0YWNrKCkge1xuICAgIHRoaXMuX21lbnVTdGFjay5jbG9zZWRcbiAgICAgIC5waXBlKHRha2VVbnRpbCh0aGlzLl9kZXN0cm95ZWQpKVxuICAgICAgLnN1YnNjcmliZSgoaXRlbTogTWVudVN0YWNrSXRlbSkgPT4gdGhpcy5fY2xvc2VPcGVuTWVudShpdGVtKSk7XG5cbiAgICB0aGlzLl9tZW51U3RhY2suZW1wdGllZFxuICAgICAgLnBpcGUodGFrZVVudGlsKHRoaXMuX2Rlc3Ryb3llZCkpXG4gICAgICAuc3Vic2NyaWJlKChldmVudDogRm9jdXNOZXh0KSA9PiB0aGlzLl90b2dnbGVPcGVuTWVudShldmVudCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIENsb3NlIHRoZSBvcGVuIG1lbnUgaWYgdGhlIGN1cnJlbnQgYWN0aXZlIGl0ZW0gb3BlbmVkIHRoZSByZXF1ZXN0ZWQgTWVudVN0YWNrSXRlbS5cbiAgICogQHBhcmFtIGl0ZW0gdGhlIE1lbnVTdGFja0l0ZW0gcmVxdWVzdGVkIHRvIGJlIGNsb3NlZC5cbiAgICovXG4gIHByaXZhdGUgX2Nsb3NlT3Blbk1lbnUobWVudTogTWVudVN0YWNrSXRlbSkge1xuICAgIGNvbnN0IHRyaWdnZXIgPSB0aGlzLl9vcGVuSXRlbTtcbiAgICBjb25zdCBrZXlNYW5hZ2VyID0gdGhpcy5fa2V5TWFuYWdlcjtcbiAgICBpZiAobWVudSA9PT0gdHJpZ2dlcj8uZ2V0TWVudVRyaWdnZXIoKT8uZ2V0TWVudSgpKSB7XG4gICAgICB0cmlnZ2VyLmdldE1lbnVUcmlnZ2VyKCk/LmNsb3NlTWVudSgpO1xuICAgICAgLy8gSWYgdGhlIHVzZXIgaGFzIG1vdXNlZCBvdmVyIGEgc2libGluZyBpdGVtIHdlIHdhbnQgdG8gZm9jdXMgdGhlIGVsZW1lbnQgdW5kZXIgbW91c2UgZm9jdXNcbiAgICAgIC8vIG5vdCB0aGUgdHJpZ2dlciB3aGljaCBwcmV2aW91c2x5IG9wZW5lZCB0aGUgbm93IGNsb3NlZCBtZW51LlxuICAgICAga2V5TWFuYWdlci5zZXRBY3RpdmVJdGVtKHRoaXMuX3BvaW50ZXJUcmFja2VyPy5hY3RpdmVFbGVtZW50IHx8IHRyaWdnZXIpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgZm9jdXMgdG8gZWl0aGVyIHRoZSBjdXJyZW50LCBwcmV2aW91cyBvciBuZXh0IGl0ZW0gYmFzZWQgb24gdGhlIEZvY3VzTmV4dCBldmVudCwgdGhlblxuICAgKiBvcGVuIHRoZSBwcmV2aW91cyBvciBuZXh0IGl0ZW0uXG4gICAqL1xuICBwcml2YXRlIF90b2dnbGVPcGVuTWVudShldmVudDogRm9jdXNOZXh0KSB7XG4gICAgY29uc3Qga2V5TWFuYWdlciA9IHRoaXMuX2tleU1hbmFnZXI7XG4gICAgc3dpdGNoIChldmVudCkge1xuICAgICAgY2FzZSBGb2N1c05leHQubmV4dEl0ZW06XG4gICAgICAgIGtleU1hbmFnZXIuc2V0Rm9jdXNPcmlnaW4oJ2tleWJvYXJkJyk7XG4gICAgICAgIGtleU1hbmFnZXIuc2V0TmV4dEl0ZW1BY3RpdmUoKTtcbiAgICAgICAga2V5TWFuYWdlci5hY3RpdmVJdGVtPy5nZXRNZW51VHJpZ2dlcigpPy5vcGVuTWVudSgpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBGb2N1c05leHQucHJldmlvdXNJdGVtOlxuICAgICAgICBrZXlNYW5hZ2VyLnNldEZvY3VzT3JpZ2luKCdrZXlib2FyZCcpO1xuICAgICAgICBrZXlNYW5hZ2VyLnNldFByZXZpb3VzSXRlbUFjdGl2ZSgpO1xuICAgICAgICBrZXlNYW5hZ2VyLmFjdGl2ZUl0ZW0/LmdldE1lbnVUcmlnZ2VyKCk/Lm9wZW5NZW51KCk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIEZvY3VzTmV4dC5jdXJyZW50SXRlbTpcbiAgICAgICAgaWYgKGtleU1hbmFnZXIuYWN0aXZlSXRlbSkge1xuICAgICAgICAgIGtleU1hbmFnZXIuc2V0Rm9jdXNPcmlnaW4oJ2tleWJvYXJkJyk7XG4gICAgICAgICAga2V5TWFuYWdlci5zZXRBY3RpdmVJdGVtKGtleU1hbmFnZXIuYWN0aXZlSXRlbSk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm4gdHJ1ZSBpZiB0aGUgbWVudSBiYXIgaXMgY29uZmlndXJlZCB0byBiZSBob3Jpem9udGFsLlxuICAgKi9cbiAgcHJpdmF0ZSBfaXNIb3Jpem9udGFsKCkge1xuICAgIHJldHVybiB0aGlzLm9yaWVudGF0aW9uID09PSAnaG9yaXpvbnRhbCc7XG4gIH1cblxuICAvKipcbiAgICogU3Vic2NyaWJlIHRvIHRoZSBtZW51IHRyaWdnZXIncyBvcGVuIGV2ZW50cyBpbiBvcmRlciB0byB0cmFjayB0aGUgdHJpZ2dlciB3aGljaCBvcGVuZWQgdGhlIG1lbnVcbiAgICogYW5kIHN0b3AgdHJhY2tpbmcgaXQgd2hlbiB0aGUgbWVudSBpcyBjbG9zZWQuXG4gICAqL1xuICBwcml2YXRlIF9zdWJzY3JpYmVUb01lbnVPcGVuKCkge1xuICAgIGNvbnN0IGV4aXRDb25kaXRpb24gPSBtZXJnZSh0aGlzLl9hbGxJdGVtcy5jaGFuZ2VzLCB0aGlzLl9kZXN0cm95ZWQpO1xuICAgIHRoaXMuX2FsbEl0ZW1zLmNoYW5nZXNcbiAgICAgIC5waXBlKFxuICAgICAgICBzdGFydFdpdGgodGhpcy5fYWxsSXRlbXMpLFxuICAgICAgICBtZXJnZU1hcCgobGlzdDogUXVlcnlMaXN0PENka01lbnVJdGVtPikgPT5cbiAgICAgICAgICBsaXN0XG4gICAgICAgICAgICAuZmlsdGVyKGl0ZW0gPT4gaXRlbS5oYXNNZW51KCkpXG4gICAgICAgICAgICAubWFwKGl0ZW0gPT4gaXRlbS5nZXRNZW51VHJpZ2dlcigpIS5vcGVuZWQucGlwZShtYXBUbyhpdGVtKSwgdGFrZVVudGlsKGV4aXRDb25kaXRpb24pKSlcbiAgICAgICAgKSxcbiAgICAgICAgbWVyZ2VBbGwoKSxcbiAgICAgICAgc3dpdGNoTWFwKChpdGVtOiBDZGtNZW51SXRlbSkgPT4ge1xuICAgICAgICAgIHRoaXMuX29wZW5JdGVtID0gaXRlbTtcbiAgICAgICAgICByZXR1cm4gaXRlbS5nZXRNZW51VHJpZ2dlcigpIS5jbG9zZWQ7XG4gICAgICAgIH0pLFxuICAgICAgICB0YWtlVW50aWwodGhpcy5fZGVzdHJveWVkKVxuICAgICAgKVxuICAgICAgLnN1YnNjcmliZSgoKSA9PiAodGhpcy5fb3Blbkl0ZW0gPSB1bmRlZmluZWQpKTtcbiAgfVxuXG4gIC8qKiBSZXR1cm4gdHJ1ZSBpZiB0aGUgTWVudUJhciBoYXMgYW4gb3BlbiBzdWJtZW51LiAqL1xuICBwcml2YXRlIF9oYXNPcGVuU3VibWVudSgpIHtcbiAgICByZXR1cm4gISF0aGlzLl9vcGVuSXRlbTtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIHN1cGVyLm5nT25EZXN0cm95KCk7XG5cbiAgICB0aGlzLl9kZXN0cm95ZWQubmV4dCgpO1xuICAgIHRoaXMuX2Rlc3Ryb3llZC5jb21wbGV0ZSgpO1xuXG4gICAgdGhpcy5fcG9pbnRlclRyYWNrZXI/LmRlc3Ryb3koKTtcbiAgfVxufVxuIl19