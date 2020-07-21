/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, Input, ContentChildren, QueryList, Optional, } from '@angular/core';
import { Directionality } from '@angular/cdk/bidi';
import { FocusKeyManager } from '@angular/cdk/a11y';
import { LEFT_ARROW, RIGHT_ARROW, UP_ARROW, DOWN_ARROW, ESCAPE, TAB } from '@angular/cdk/keycodes';
import { takeUntil, mergeAll, mapTo, startWith, mergeMap, switchMap } from 'rxjs/operators';
import { Subject, merge } from 'rxjs';
import { CdkMenuGroup } from './menu-group';
import { CDK_MENU } from './menu-interface';
import { CdkMenuItem } from './menu-item';
import { MenuStack } from './menu-stack';
/**
 * Directive applied to an element which configures it as a MenuBar by setting the appropriate
 * role, aria attributes, and accessible keyboard and mouse handling logic. The component that
 * this directive is applied to should contain components marked with CdkMenuItem.
 *
 */
export class CdkMenuBar extends CdkMenuGroup {
    constructor(_menuStack, _dir) {
        super();
        this._menuStack = _menuStack;
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
        super.ngAfterContentInit();
        this._setKeyManager();
        this._subscribeToMenuOpen();
        this._subscribeToMenuStack();
    }
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
        var _a, _b;
        const trigger = this._openItem;
        const keyManager = this._keyManager;
        if (menu === ((_a = trigger === null || trigger === void 0 ? void 0 : trigger.getMenuTrigger()) === null || _a === void 0 ? void 0 : _a.getMenu())) {
            (_b = trigger.getMenuTrigger()) === null || _b === void 0 ? void 0 : _b.closeMenu();
            keyManager.setFocusOrigin('keyboard');
            keyManager.setActiveItem(trigger);
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
    ngOnDestroy() {
        super.ngOnDestroy();
        this._destroyed.next();
        this._destroyed.complete();
    }
}
CdkMenuBar.decorators = [
    { type: Directive, args: [{
                selector: '[cdkMenuBar]',
                exportAs: 'cdkMenuBar',
                host: {
                    '(keydown)': '_handleKeyEvent($event)',
                    '(focus)': 'focusFirstItem()',
                    'role': 'menubar',
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
    { type: Directionality, decorators: [{ type: Optional }] }
];
CdkMenuBar.propDecorators = {
    orientation: [{ type: Input, args: ['cdkMenuBarOrientation',] }],
    _allItems: [{ type: ContentChildren, args: [CdkMenuItem, { descendants: true },] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1iYXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrLWV4cGVyaW1lbnRhbC9tZW51L21lbnUtYmFyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFDTCxTQUFTLEVBQ1QsS0FBSyxFQUNMLGVBQWUsRUFDZixTQUFTLEVBR1QsUUFBUSxHQUNULE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUNqRCxPQUFPLEVBQUMsZUFBZSxFQUFjLE1BQU0sbUJBQW1CLENBQUM7QUFDL0QsT0FBTyxFQUFDLFVBQVUsRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDakcsT0FBTyxFQUFDLFNBQVMsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDMUYsT0FBTyxFQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDcEMsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGNBQWMsQ0FBQztBQUMxQyxPQUFPLEVBQUMsUUFBUSxFQUFPLE1BQU0sa0JBQWtCLENBQUM7QUFDaEQsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLGFBQWEsQ0FBQztBQUN4QyxPQUFPLEVBQUMsU0FBUyxFQUEyQixNQUFNLGNBQWMsQ0FBQztBQUVqRTs7Ozs7R0FLRztBQWlCSCxNQUFNLE9BQU8sVUFBVyxTQUFRLFlBQVk7SUFvQjFDLFlBQXFCLFVBQXFCLEVBQStCLElBQXFCO1FBQzVGLEtBQUssRUFBRSxDQUFDO1FBRFcsZUFBVSxHQUFWLFVBQVUsQ0FBVztRQUErQixTQUFJLEdBQUosSUFBSSxDQUFpQjtRQW5COUY7OztXQUdHO1FBQzZCLGdCQUFXLEdBQThCLFlBQVksQ0FBQztRQUt0RiwyQ0FBMkM7UUFDMUIsZUFBVSxHQUFrQixJQUFJLE9BQU8sRUFBRSxDQUFDO0lBVzNELENBQUM7SUFFRCxrQkFBa0I7UUFDaEIsS0FBSyxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFFM0IsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQ3RCLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO1FBQzVCLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO0lBQy9CLENBQUM7SUFFRCw4RUFBOEU7SUFDOUUsY0FBYyxDQUFDLGNBQTJCLFNBQVM7UUFDakQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDN0MsSUFBSSxDQUFDLFdBQVcsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO0lBQ3hDLENBQUM7SUFFRCw2RUFBNkU7SUFDN0UsYUFBYSxDQUFDLGNBQTJCLFNBQVM7UUFDaEQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDN0MsSUFBSSxDQUFDLFdBQVcsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO0lBQ3ZDLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsZUFBZSxDQUFDLEtBQW9COztRQUNsQyxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO1FBQ3BDLFFBQVEsS0FBSyxDQUFDLE9BQU8sRUFBRTtZQUNyQixLQUFLLFFBQVEsQ0FBQztZQUNkLEtBQUssVUFBVSxDQUFDO1lBQ2hCLEtBQUssVUFBVSxDQUFDO1lBQ2hCLEtBQUssV0FBVztnQkFDZCxNQUFNLGdCQUFnQixHQUFHLEtBQUssQ0FBQyxPQUFPLEtBQUssVUFBVSxJQUFJLEtBQUssQ0FBQyxPQUFPLEtBQUssV0FBVyxDQUFDO2dCQUN2Rix1RkFBdUY7Z0JBQ3ZGLDJGQUEyRjtnQkFDM0YsY0FBYztnQkFDZCxJQUNFLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxJQUFJLGdCQUFnQixDQUFDO29CQUMxQyxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsRUFDNUM7b0JBQ0EsS0FBSyxDQUFDLGNBQWMsRUFBRSxDQUFDO29CQUV2QixNQUFNLFVBQVUsU0FBRyxVQUFVLENBQUMsVUFBVSwwQ0FBRSxVQUFVLEVBQUUsQ0FBQztvQkFDdkQsWUFBQSxVQUFVLENBQUMsVUFBVSwwQ0FBRSxjQUFjLDRDQUFJLFNBQVMsR0FBRztvQkFFckQsVUFBVSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQztvQkFDdEMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDNUIsSUFBSSxVQUFVLEVBQUU7d0JBQ2QsWUFBQSxVQUFVLENBQUMsVUFBVSwwQ0FBRSxjQUFjLDRDQUFJLFFBQVEsR0FBRztxQkFDckQ7aUJBQ0Y7Z0JBQ0QsTUFBTTtZQUVSLEtBQUssTUFBTTtnQkFDVCxLQUFLLENBQUMsY0FBYyxFQUFFLENBQUM7Z0JBQ3ZCLFlBQUEsVUFBVSxDQUFDLFVBQVUsMENBQUUsY0FBYyw0Q0FBSSxTQUFTLEdBQUc7Z0JBQ3JELE1BQU07WUFFUixLQUFLLEdBQUc7Z0JBQ04sWUFBQSxVQUFVLENBQUMsVUFBVSwwQ0FBRSxjQUFjLDRDQUFJLFNBQVMsR0FBRztnQkFDckQsTUFBTTtZQUVSO2dCQUNFLFVBQVUsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDL0I7SUFDSCxDQUFDO0lBRUQsK0VBQStFO0lBQ3ZFLGNBQWM7O1FBQ3BCLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxlQUFlLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQzthQUNuRCxRQUFRLEVBQUU7YUFDVixhQUFhLEVBQUU7YUFDZixjQUFjLEVBQUUsQ0FBQztRQUVwQixJQUFJLElBQUksQ0FBQyxhQUFhLEVBQUUsRUFBRTtZQUN4QixJQUFJLENBQUMsV0FBVyxDQUFDLHlCQUF5QixDQUFDLE9BQUEsSUFBSSxDQUFDLElBQUksMENBQUUsS0FBSyxLQUFJLEtBQUssQ0FBQyxDQUFDO1NBQ3ZFO2FBQU07WUFDTCxJQUFJLENBQUMsV0FBVyxDQUFDLHVCQUF1QixFQUFFLENBQUM7U0FDNUM7SUFDSCxDQUFDO0lBRUQsOERBQThEO0lBQ3RELHFCQUFxQjtRQUMzQixJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU07YUFDbkIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7YUFDaEMsU0FBUyxDQUFDLENBQUMsSUFBbUIsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBRWpFLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTzthQUNwQixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQzthQUNoQyxTQUFTLENBQUMsQ0FBQyxLQUFnQixFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDbEUsQ0FBQztJQUVEOzs7T0FHRztJQUNLLGNBQWMsQ0FBQyxJQUFtQjs7UUFDeEMsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUMvQixNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO1FBQ3BDLElBQUksSUFBSSxZQUFLLE9BQU8sYUFBUCxPQUFPLHVCQUFQLE9BQU8sQ0FBRSxjQUFjLDRDQUFJLE9BQU8sR0FBRSxFQUFFO1lBQ2pELE1BQUEsT0FBTyxDQUFDLGNBQWMsRUFBRSwwQ0FBRSxTQUFTLEdBQUc7WUFDdEMsVUFBVSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUN0QyxVQUFVLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQ25DO0lBQ0gsQ0FBQztJQUVEOzs7T0FHRztJQUNLLGVBQWUsQ0FBQyxLQUFnQjs7UUFDdEMsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztRQUNwQyxRQUFRLEtBQUssRUFBRTtZQUNiO2dCQUNFLFVBQVUsQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQ3RDLFVBQVUsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO2dCQUMvQixZQUFBLFVBQVUsQ0FBQyxVQUFVLDBDQUFFLGNBQWMsNENBQUksUUFBUSxHQUFHO2dCQUNwRCxNQUFNO1lBRVI7Z0JBQ0UsVUFBVSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFDdEMsVUFBVSxDQUFDLHFCQUFxQixFQUFFLENBQUM7Z0JBQ25DLFlBQUEsVUFBVSxDQUFDLFVBQVUsMENBQUUsY0FBYyw0Q0FBSSxRQUFRLEdBQUc7Z0JBQ3BELE1BQU07WUFFUjtnQkFDRSxJQUFJLFVBQVUsQ0FBQyxVQUFVLEVBQUU7b0JBQ3pCLFVBQVUsQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUM7b0JBQ3RDLFVBQVUsQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2lCQUNqRDtnQkFDRCxNQUFNO1NBQ1Q7SUFDSCxDQUFDO0lBRUQ7O09BRUc7SUFDSyxhQUFhO1FBQ25CLE9BQU8sSUFBSSxDQUFDLFdBQVcsS0FBSyxZQUFZLENBQUM7SUFDM0MsQ0FBQztJQUVEOzs7T0FHRztJQUNLLG9CQUFvQjtRQUMxQixNQUFNLGFBQWEsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3JFLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTzthQUNuQixJQUFJLENBQ0gsU0FBUyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFDekIsUUFBUSxDQUFDLENBQUMsSUFBNEIsRUFBRSxFQUFFLENBQ3hDLElBQUk7YUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7YUFDOUIsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLFNBQVMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQzFGLEVBQ0QsUUFBUSxFQUFFLEVBQ1YsU0FBUyxDQUFDLENBQUMsSUFBaUIsRUFBRSxFQUFFO1lBQzlCLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO1lBQ3RCLE9BQU8sSUFBSSxDQUFDLGNBQWMsRUFBRyxDQUFDLE1BQU0sQ0FBQztRQUN2QyxDQUFDLENBQUMsRUFDRixTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUMzQjthQUNBLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQztJQUNuRCxDQUFDO0lBRUQsV0FBVztRQUNULEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUNwQixJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDN0IsQ0FBQzs7O1lBak5GLFNBQVMsU0FBQztnQkFDVCxRQUFRLEVBQUUsY0FBYztnQkFDeEIsUUFBUSxFQUFFLFlBQVk7Z0JBQ3RCLElBQUksRUFBRTtvQkFDSixXQUFXLEVBQUUseUJBQXlCO29CQUN0QyxTQUFTLEVBQUUsa0JBQWtCO29CQUM3QixNQUFNLEVBQUUsU0FBUztvQkFDakIsVUFBVSxFQUFFLEdBQUc7b0JBQ2YseUJBQXlCLEVBQUUsYUFBYTtpQkFDekM7Z0JBQ0QsU0FBUyxFQUFFO29CQUNULEVBQUMsT0FBTyxFQUFFLFlBQVksRUFBRSxXQUFXLEVBQUUsVUFBVSxFQUFDO29CQUNoRCxFQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLFVBQVUsRUFBQztvQkFDNUMsRUFBQyxPQUFPLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUM7aUJBQzFDO2FBQ0Y7OztZQXZCTyxTQUFTO1lBUlQsY0FBYyx1QkFvRHlCLFFBQVE7OzswQkFmcEQsS0FBSyxTQUFDLHVCQUF1Qjt3QkFTN0IsZUFBZSxTQUFDLFdBQVcsRUFBRSxFQUFDLFdBQVcsRUFBRSxJQUFJLEVBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtcbiAgRGlyZWN0aXZlLFxuICBJbnB1dCxcbiAgQ29udGVudENoaWxkcmVuLFxuICBRdWVyeUxpc3QsXG4gIEFmdGVyQ29udGVudEluaXQsXG4gIE9uRGVzdHJveSxcbiAgT3B0aW9uYWwsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtEaXJlY3Rpb25hbGl0eX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2JpZGknO1xuaW1wb3J0IHtGb2N1c0tleU1hbmFnZXIsIEZvY3VzT3JpZ2lufSBmcm9tICdAYW5ndWxhci9jZGsvYTExeSc7XG5pbXBvcnQge0xFRlRfQVJST1csIFJJR0hUX0FSUk9XLCBVUF9BUlJPVywgRE9XTl9BUlJPVywgRVNDQVBFLCBUQUJ9IGZyb20gJ0Bhbmd1bGFyL2Nkay9rZXljb2Rlcyc7XG5pbXBvcnQge3Rha2VVbnRpbCwgbWVyZ2VBbGwsIG1hcFRvLCBzdGFydFdpdGgsIG1lcmdlTWFwLCBzd2l0Y2hNYXB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7U3ViamVjdCwgbWVyZ2V9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHtDZGtNZW51R3JvdXB9IGZyb20gJy4vbWVudS1ncm91cCc7XG5pbXBvcnQge0NES19NRU5VLCBNZW51fSBmcm9tICcuL21lbnUtaW50ZXJmYWNlJztcbmltcG9ydCB7Q2RrTWVudUl0ZW19IGZyb20gJy4vbWVudS1pdGVtJztcbmltcG9ydCB7TWVudVN0YWNrLCBNZW51U3RhY2tJdGVtLCBGb2N1c05leHR9IGZyb20gJy4vbWVudS1zdGFjayc7XG5cbi8qKlxuICogRGlyZWN0aXZlIGFwcGxpZWQgdG8gYW4gZWxlbWVudCB3aGljaCBjb25maWd1cmVzIGl0IGFzIGEgTWVudUJhciBieSBzZXR0aW5nIHRoZSBhcHByb3ByaWF0ZVxuICogcm9sZSwgYXJpYSBhdHRyaWJ1dGVzLCBhbmQgYWNjZXNzaWJsZSBrZXlib2FyZCBhbmQgbW91c2UgaGFuZGxpbmcgbG9naWMuIFRoZSBjb21wb25lbnQgdGhhdFxuICogdGhpcyBkaXJlY3RpdmUgaXMgYXBwbGllZCB0byBzaG91bGQgY29udGFpbiBjb21wb25lbnRzIG1hcmtlZCB3aXRoIENka01lbnVJdGVtLlxuICpcbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW2Nka01lbnVCYXJdJyxcbiAgZXhwb3J0QXM6ICdjZGtNZW51QmFyJyxcbiAgaG9zdDoge1xuICAgICcoa2V5ZG93biknOiAnX2hhbmRsZUtleUV2ZW50KCRldmVudCknLFxuICAgICcoZm9jdXMpJzogJ2ZvY3VzRmlyc3RJdGVtKCknLFxuICAgICdyb2xlJzogJ21lbnViYXInLFxuICAgICd0YWJpbmRleCc6ICcwJyxcbiAgICAnW2F0dHIuYXJpYS1vcmllbnRhdGlvbl0nOiAnb3JpZW50YXRpb24nLFxuICB9LFxuICBwcm92aWRlcnM6IFtcbiAgICB7cHJvdmlkZTogQ2RrTWVudUdyb3VwLCB1c2VFeGlzdGluZzogQ2RrTWVudUJhcn0sXG4gICAge3Byb3ZpZGU6IENES19NRU5VLCB1c2VFeGlzdGluZzogQ2RrTWVudUJhcn0sXG4gICAge3Byb3ZpZGU6IE1lbnVTdGFjaywgdXNlQ2xhc3M6IE1lbnVTdGFja30sXG4gIF0sXG59KVxuZXhwb3J0IGNsYXNzIENka01lbnVCYXIgZXh0ZW5kcyBDZGtNZW51R3JvdXAgaW1wbGVtZW50cyBNZW51LCBBZnRlckNvbnRlbnRJbml0LCBPbkRlc3Ryb3kge1xuICAvKipcbiAgICogU2V0cyB0aGUgYXJpYS1vcmllbnRhdGlvbiBhdHRyaWJ1dGUgYW5kIGRldGVybWluZXMgd2hlcmUgbWVudXMgd2lsbCBiZSBvcGVuZWQuXG4gICAqIERvZXMgbm90IGFmZmVjdCBzdHlsaW5nL2xheW91dC5cbiAgICovXG4gIEBJbnB1dCgnY2RrTWVudUJhck9yaWVudGF0aW9uJykgb3JpZW50YXRpb246ICdob3Jpem9udGFsJyB8ICd2ZXJ0aWNhbCcgPSAnaG9yaXpvbnRhbCc7XG5cbiAgLyoqIEhhbmRsZXMga2V5Ym9hcmQgZXZlbnRzIGZvciB0aGUgTWVudUJhci4gKi9cbiAgcHJpdmF0ZSBfa2V5TWFuYWdlcjogRm9jdXNLZXlNYW5hZ2VyPENka01lbnVJdGVtPjtcblxuICAvKiogRW1pdHMgd2hlbiB0aGUgTWVudUJhciBpcyBkZXN0cm95ZWQuICovXG4gIHByaXZhdGUgcmVhZG9ubHkgX2Rlc3Ryb3llZDogU3ViamVjdDx2b2lkPiA9IG5ldyBTdWJqZWN0KCk7XG5cbiAgLyoqIEFsbCBjaGlsZCBNZW51SXRlbSBlbGVtZW50cyBuZXN0ZWQgaW4gdGhpcyBNZW51QmFyLiAqL1xuICBAQ29udGVudENoaWxkcmVuKENka01lbnVJdGVtLCB7ZGVzY2VuZGFudHM6IHRydWV9KVxuICBwcml2YXRlIHJlYWRvbmx5IF9hbGxJdGVtczogUXVlcnlMaXN0PENka01lbnVJdGVtPjtcblxuICAvKiogVGhlIE1lbnUgSXRlbSB3aGljaCB0cmlnZ2VyZWQgdGhlIG9wZW4gc3VibWVudS4gKi9cbiAgcHJpdmF0ZSBfb3Blbkl0ZW0/OiBDZGtNZW51SXRlbTtcblxuICBjb25zdHJ1Y3RvcihyZWFkb25seSBfbWVudVN0YWNrOiBNZW51U3RhY2ssIEBPcHRpb25hbCgpIHByaXZhdGUgcmVhZG9ubHkgX2Rpcj86IERpcmVjdGlvbmFsaXR5KSB7XG4gICAgc3VwZXIoKTtcbiAgfVxuXG4gIG5nQWZ0ZXJDb250ZW50SW5pdCgpIHtcbiAgICBzdXBlci5uZ0FmdGVyQ29udGVudEluaXQoKTtcblxuICAgIHRoaXMuX3NldEtleU1hbmFnZXIoKTtcbiAgICB0aGlzLl9zdWJzY3JpYmVUb01lbnVPcGVuKCk7XG4gICAgdGhpcy5fc3Vic2NyaWJlVG9NZW51U3RhY2soKTtcbiAgfVxuXG4gIC8qKiBQbGFjZSBmb2N1cyBvbiB0aGUgZmlyc3QgTWVudUl0ZW0gaW4gdGhlIG1lbnUgYW5kIHNldCB0aGUgZm9jdXMgb3JpZ2luLiAqL1xuICBmb2N1c0ZpcnN0SXRlbShmb2N1c09yaWdpbjogRm9jdXNPcmlnaW4gPSAncHJvZ3JhbScpIHtcbiAgICB0aGlzLl9rZXlNYW5hZ2VyLnNldEZvY3VzT3JpZ2luKGZvY3VzT3JpZ2luKTtcbiAgICB0aGlzLl9rZXlNYW5hZ2VyLnNldEZpcnN0SXRlbUFjdGl2ZSgpO1xuICB9XG5cbiAgLyoqIFBsYWNlIGZvY3VzIG9uIHRoZSBsYXN0IE1lbnVJdGVtIGluIHRoZSBtZW51IGFuZCBzZXQgdGhlIGZvY3VzIG9yaWdpbi4gKi9cbiAgZm9jdXNMYXN0SXRlbShmb2N1c09yaWdpbjogRm9jdXNPcmlnaW4gPSAncHJvZ3JhbScpIHtcbiAgICB0aGlzLl9rZXlNYW5hZ2VyLnNldEZvY3VzT3JpZ2luKGZvY3VzT3JpZ2luKTtcbiAgICB0aGlzLl9rZXlNYW5hZ2VyLnNldExhc3RJdGVtQWN0aXZlKCk7XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlIGtleWJvYXJkIGV2ZW50cywgc3BlY2lmaWNhbGx5IGNoYW5naW5nIHRoZSBmb2N1c2VkIGVsZW1lbnQgYW5kL29yIHRvZ2dsaW5nIHRoZSBhY3RpdmVcbiAgICogaXRlbXMgbWVudS5cbiAgICogQHBhcmFtIGV2ZW50IHRoZSBLZXlib2FyZEV2ZW50IHRvIGhhbmRsZS5cbiAgICovXG4gIF9oYW5kbGVLZXlFdmVudChldmVudDogS2V5Ym9hcmRFdmVudCkge1xuICAgIGNvbnN0IGtleU1hbmFnZXIgPSB0aGlzLl9rZXlNYW5hZ2VyO1xuICAgIHN3aXRjaCAoZXZlbnQua2V5Q29kZSkge1xuICAgICAgY2FzZSBVUF9BUlJPVzpcbiAgICAgIGNhc2UgRE9XTl9BUlJPVzpcbiAgICAgIGNhc2UgTEVGVF9BUlJPVzpcbiAgICAgIGNhc2UgUklHSFRfQVJST1c6XG4gICAgICAgIGNvbnN0IGhvcml6b250YWxBcnJvd3MgPSBldmVudC5rZXlDb2RlID09PSBMRUZUX0FSUk9XIHx8IGV2ZW50LmtleUNvZGUgPT09IFJJR0hUX0FSUk9XO1xuICAgICAgICAvLyBGb3IgYSBob3Jpem9udGFsIG1lbnUgaWYgdGhlIGxlZnQvcmlnaHQga2V5cyB3ZXJlIGNsaWNrZWQsIG9yIGEgdmVydGljYWwgbWVudSBpZiB0aGVcbiAgICAgICAgLy8gdXAvZG93biBrZXlzIHdlcmUgY2xpY2tlZDogaWYgdGhlIGN1cnJlbnQgbWVudSBpcyBvcGVuLCBjbG9zZSBpdCB0aGVuIGZvY3VzIGFuZCBvcGVuIHRoZVxuICAgICAgICAvLyBuZXh0ICBtZW51LlxuICAgICAgICBpZiAoXG4gICAgICAgICAgKHRoaXMuX2lzSG9yaXpvbnRhbCgpICYmIGhvcml6b250YWxBcnJvd3MpIHx8XG4gICAgICAgICAgKCF0aGlzLl9pc0hvcml6b250YWwoKSAmJiAhaG9yaXpvbnRhbEFycm93cylcbiAgICAgICAgKSB7XG4gICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICAgIGNvbnN0IHByZXZJc09wZW4gPSBrZXlNYW5hZ2VyLmFjdGl2ZUl0ZW0/LmlzTWVudU9wZW4oKTtcbiAgICAgICAgICBrZXlNYW5hZ2VyLmFjdGl2ZUl0ZW0/LmdldE1lbnVUcmlnZ2VyKCk/LmNsb3NlTWVudSgpO1xuXG4gICAgICAgICAga2V5TWFuYWdlci5zZXRGb2N1c09yaWdpbigna2V5Ym9hcmQnKTtcbiAgICAgICAgICBrZXlNYW5hZ2VyLm9uS2V5ZG93bihldmVudCk7XG4gICAgICAgICAgaWYgKHByZXZJc09wZW4pIHtcbiAgICAgICAgICAgIGtleU1hbmFnZXIuYWN0aXZlSXRlbT8uZ2V0TWVudVRyaWdnZXIoKT8ub3Blbk1lbnUoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgRVNDQVBFOlxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBrZXlNYW5hZ2VyLmFjdGl2ZUl0ZW0/LmdldE1lbnVUcmlnZ2VyKCk/LmNsb3NlTWVudSgpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBUQUI6XG4gICAgICAgIGtleU1hbmFnZXIuYWN0aXZlSXRlbT8uZ2V0TWVudVRyaWdnZXIoKT8uY2xvc2VNZW51KCk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBrZXlNYW5hZ2VyLm9uS2V5ZG93bihldmVudCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFNldHVwIHRoZSBGb2N1c0tleU1hbmFnZXIgd2l0aCB0aGUgY29ycmVjdCBvcmllbnRhdGlvbiBmb3IgdGhlIG1lbnUgYmFyLiAqL1xuICBwcml2YXRlIF9zZXRLZXlNYW5hZ2VyKCkge1xuICAgIHRoaXMuX2tleU1hbmFnZXIgPSBuZXcgRm9jdXNLZXlNYW5hZ2VyKHRoaXMuX2FsbEl0ZW1zKVxuICAgICAgLndpdGhXcmFwKClcbiAgICAgIC53aXRoVHlwZUFoZWFkKClcbiAgICAgIC53aXRoSG9tZUFuZEVuZCgpO1xuXG4gICAgaWYgKHRoaXMuX2lzSG9yaXpvbnRhbCgpKSB7XG4gICAgICB0aGlzLl9rZXlNYW5hZ2VyLndpdGhIb3Jpem9udGFsT3JpZW50YXRpb24odGhpcy5fZGlyPy52YWx1ZSB8fCAnbHRyJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2tleU1hbmFnZXIud2l0aFZlcnRpY2FsT3JpZW50YXRpb24oKTtcbiAgICB9XG4gIH1cblxuICAvKiogU3Vic2NyaWJlIHRvIHRoZSBNZW51U3RhY2sgY2xvc2UgYW5kIGVtcHR5IG9ic2VydmFibGVzLiAqL1xuICBwcml2YXRlIF9zdWJzY3JpYmVUb01lbnVTdGFjaygpIHtcbiAgICB0aGlzLl9tZW51U3RhY2suY2xvc2VkXG4gICAgICAucGlwZSh0YWtlVW50aWwodGhpcy5fZGVzdHJveWVkKSlcbiAgICAgIC5zdWJzY3JpYmUoKGl0ZW06IE1lbnVTdGFja0l0ZW0pID0+IHRoaXMuX2Nsb3NlT3Blbk1lbnUoaXRlbSkpO1xuXG4gICAgdGhpcy5fbWVudVN0YWNrLmVtcHRpZWRcbiAgICAgIC5waXBlKHRha2VVbnRpbCh0aGlzLl9kZXN0cm95ZWQpKVxuICAgICAgLnN1YnNjcmliZSgoZXZlbnQ6IEZvY3VzTmV4dCkgPT4gdGhpcy5fdG9nZ2xlT3Blbk1lbnUoZXZlbnQpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbG9zZSB0aGUgb3BlbiBtZW51IGlmIHRoZSBjdXJyZW50IGFjdGl2ZSBpdGVtIG9wZW5lZCB0aGUgcmVxdWVzdGVkIE1lbnVTdGFja0l0ZW0uXG4gICAqIEBwYXJhbSBpdGVtIHRoZSBNZW51U3RhY2tJdGVtIHJlcXVlc3RlZCB0byBiZSBjbG9zZWQuXG4gICAqL1xuICBwcml2YXRlIF9jbG9zZU9wZW5NZW51KG1lbnU6IE1lbnVTdGFja0l0ZW0pIHtcbiAgICBjb25zdCB0cmlnZ2VyID0gdGhpcy5fb3Blbkl0ZW07XG4gICAgY29uc3Qga2V5TWFuYWdlciA9IHRoaXMuX2tleU1hbmFnZXI7XG4gICAgaWYgKG1lbnUgPT09IHRyaWdnZXI/LmdldE1lbnVUcmlnZ2VyKCk/LmdldE1lbnUoKSkge1xuICAgICAgdHJpZ2dlci5nZXRNZW51VHJpZ2dlcigpPy5jbG9zZU1lbnUoKTtcbiAgICAgIGtleU1hbmFnZXIuc2V0Rm9jdXNPcmlnaW4oJ2tleWJvYXJkJyk7XG4gICAgICBrZXlNYW5hZ2VyLnNldEFjdGl2ZUl0ZW0odHJpZ2dlcik7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNldCBmb2N1cyB0byBlaXRoZXIgdGhlIGN1cnJlbnQsIHByZXZpb3VzIG9yIG5leHQgaXRlbSBiYXNlZCBvbiB0aGUgRm9jdXNOZXh0IGV2ZW50LCB0aGVuXG4gICAqIG9wZW4gdGhlIHByZXZpb3VzIG9yIG5leHQgaXRlbS5cbiAgICovXG4gIHByaXZhdGUgX3RvZ2dsZU9wZW5NZW51KGV2ZW50OiBGb2N1c05leHQpIHtcbiAgICBjb25zdCBrZXlNYW5hZ2VyID0gdGhpcy5fa2V5TWFuYWdlcjtcbiAgICBzd2l0Y2ggKGV2ZW50KSB7XG4gICAgICBjYXNlIEZvY3VzTmV4dC5uZXh0SXRlbTpcbiAgICAgICAga2V5TWFuYWdlci5zZXRGb2N1c09yaWdpbigna2V5Ym9hcmQnKTtcbiAgICAgICAga2V5TWFuYWdlci5zZXROZXh0SXRlbUFjdGl2ZSgpO1xuICAgICAgICBrZXlNYW5hZ2VyLmFjdGl2ZUl0ZW0/LmdldE1lbnVUcmlnZ2VyKCk/Lm9wZW5NZW51KCk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIEZvY3VzTmV4dC5wcmV2aW91c0l0ZW06XG4gICAgICAgIGtleU1hbmFnZXIuc2V0Rm9jdXNPcmlnaW4oJ2tleWJvYXJkJyk7XG4gICAgICAgIGtleU1hbmFnZXIuc2V0UHJldmlvdXNJdGVtQWN0aXZlKCk7XG4gICAgICAgIGtleU1hbmFnZXIuYWN0aXZlSXRlbT8uZ2V0TWVudVRyaWdnZXIoKT8ub3Blbk1lbnUoKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgRm9jdXNOZXh0LmN1cnJlbnRJdGVtOlxuICAgICAgICBpZiAoa2V5TWFuYWdlci5hY3RpdmVJdGVtKSB7XG4gICAgICAgICAga2V5TWFuYWdlci5zZXRGb2N1c09yaWdpbigna2V5Ym9hcmQnKTtcbiAgICAgICAgICBrZXlNYW5hZ2VyLnNldEFjdGl2ZUl0ZW0oa2V5TWFuYWdlci5hY3RpdmVJdGVtKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybiB0cnVlIGlmIHRoZSBtZW51IGJhciBpcyBjb25maWd1cmVkIHRvIGJlIGhvcml6b250YWwuXG4gICAqL1xuICBwcml2YXRlIF9pc0hvcml6b250YWwoKSB7XG4gICAgcmV0dXJuIHRoaXMub3JpZW50YXRpb24gPT09ICdob3Jpem9udGFsJztcbiAgfVxuXG4gIC8qKlxuICAgKiBTdWJzY3JpYmUgdG8gdGhlIG1lbnUgdHJpZ2dlcidzIG9wZW4gZXZlbnRzIGluIG9yZGVyIHRvIHRyYWNrIHRoZSB0cmlnZ2VyIHdoaWNoIG9wZW5lZCB0aGUgbWVudVxuICAgKiBhbmQgc3RvcCB0cmFja2luZyBpdCB3aGVuIHRoZSBtZW51IGlzIGNsb3NlZC5cbiAgICovXG4gIHByaXZhdGUgX3N1YnNjcmliZVRvTWVudU9wZW4oKSB7XG4gICAgY29uc3QgZXhpdENvbmRpdGlvbiA9IG1lcmdlKHRoaXMuX2FsbEl0ZW1zLmNoYW5nZXMsIHRoaXMuX2Rlc3Ryb3llZCk7XG4gICAgdGhpcy5fYWxsSXRlbXMuY2hhbmdlc1xuICAgICAgLnBpcGUoXG4gICAgICAgIHN0YXJ0V2l0aCh0aGlzLl9hbGxJdGVtcyksXG4gICAgICAgIG1lcmdlTWFwKChsaXN0OiBRdWVyeUxpc3Q8Q2RrTWVudUl0ZW0+KSA9PlxuICAgICAgICAgIGxpc3RcbiAgICAgICAgICAgIC5maWx0ZXIoaXRlbSA9PiBpdGVtLmhhc01lbnUoKSlcbiAgICAgICAgICAgIC5tYXAoaXRlbSA9PiBpdGVtLmdldE1lbnVUcmlnZ2VyKCkhLm9wZW5lZC5waXBlKG1hcFRvKGl0ZW0pLCB0YWtlVW50aWwoZXhpdENvbmRpdGlvbikpKVxuICAgICAgICApLFxuICAgICAgICBtZXJnZUFsbCgpLFxuICAgICAgICBzd2l0Y2hNYXAoKGl0ZW06IENka01lbnVJdGVtKSA9PiB7XG4gICAgICAgICAgdGhpcy5fb3Blbkl0ZW0gPSBpdGVtO1xuICAgICAgICAgIHJldHVybiBpdGVtLmdldE1lbnVUcmlnZ2VyKCkhLmNsb3NlZDtcbiAgICAgICAgfSksXG4gICAgICAgIHRha2VVbnRpbCh0aGlzLl9kZXN0cm95ZWQpXG4gICAgICApXG4gICAgICAuc3Vic2NyaWJlKCgpID0+ICh0aGlzLl9vcGVuSXRlbSA9IHVuZGVmaW5lZCkpO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgc3VwZXIubmdPbkRlc3Ryb3koKTtcbiAgICB0aGlzLl9kZXN0cm95ZWQubmV4dCgpO1xuICAgIHRoaXMuX2Rlc3Ryb3llZC5jb21wbGV0ZSgpO1xuICB9XG59XG4iXX0=