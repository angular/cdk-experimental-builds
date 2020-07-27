/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, Input, Output, EventEmitter, QueryList, ContentChildren, Optional, } from '@angular/core';
import { FocusKeyManager } from '@angular/cdk/a11y';
import { LEFT_ARROW, RIGHT_ARROW, UP_ARROW, DOWN_ARROW, ESCAPE, TAB, hasModifierKey, } from '@angular/cdk/keycodes';
import { Directionality } from '@angular/cdk/bidi';
import { take, takeUntil, startWith, mergeMap, mapTo, mergeAll, switchMap } from 'rxjs/operators';
import { merge } from 'rxjs';
import { CdkMenuGroup } from './menu-group';
import { CdkMenuPanel } from './menu-panel';
import { CDK_MENU } from './menu-interface';
import { throwMissingMenuPanelError } from './menu-errors';
import { CdkMenuItem } from './menu-item';
/**
 * Directive which configures the element as a Menu which should contain child elements marked as
 * CdkMenuItem or CdkMenuGroup. Sets the appropriate role and aria-attributes for a menu and
 * contains accessible keyboard and mouse handling logic.
 *
 * It also acts as a RadioGroup for elements marked with role `menuitemradio`.
 */
export class CdkMenu extends CdkMenuGroup {
    constructor(_dir, 
    // `CdkMenuPanel` is always used in combination with a `CdkMenu`.
    // tslint:disable-next-line: lightweight-tokens
    _menuPanel) {
        super();
        this._dir = _dir;
        this._menuPanel = _menuPanel;
        /**
         * Sets the aria-orientation attribute and determines where menus will be opened.
         * Does not affect styling/layout.
         */
        this.orientation = 'vertical';
        /** Event emitted when the menu is closed. */
        this.closed = new EventEmitter();
    }
    ngOnInit() {
        this._registerWithParentPanel();
    }
    ngAfterContentInit() {
        super.ngAfterContentInit();
        this._completeChangeEmitter();
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
        const parent = this._getMenuPanel();
        if (parent) {
            parent._registerMenu(this);
        }
        else {
            throwMissingMenuPanelError();
        }
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
    /** Subscribe to the MenuStack close and empty observables. */
    _subscribeToMenuStack() {
        this._menuStack.closed
            .pipe(takeUntil(this.closed))
            .subscribe((item) => this._closeOpenMenu(item));
        this._menuStack.emptied
            .pipe(takeUntil(this.closed))
            .subscribe((event) => this._toggleMenuFocus(event));
    }
    /**
     * Close the open menu if the current active item opened the requested MenuStackItem.
     * @param item the MenuStackItem requested to be closed.
     */
    _closeOpenMenu(menu) {
        var _a, _b;
        const keyManager = this._keyManager;
        const trigger = this._openItem;
        if (menu === ((_a = trigger === null || trigger === void 0 ? void 0 : trigger.getMenuTrigger()) === null || _a === void 0 ? void 0 : _a.getMenu())) {
            (_b = trigger.getMenuTrigger()) === null || _b === void 0 ? void 0 : _b.closeMenu();
            keyManager.setFocusOrigin('keyboard');
            keyManager.setActiveItem(trigger);
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
    ngOnDestroy() {
        this._emitClosedEvent();
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
                    '(keydown)': '_handleKeyEvent($event)',
                    'role': 'menu',
                    'class': 'cdk-menu',
                    '[attr.aria-orientation]': 'orientation',
                },
                providers: [
                    { provide: CdkMenuGroup, useExisting: CdkMenu },
                    { provide: CDK_MENU, useExisting: CdkMenu },
                ],
            },] }
];
CdkMenu.ctorParameters = () => [
    { type: Directionality, decorators: [{ type: Optional }] },
    { type: CdkMenuPanel, decorators: [{ type: Optional }] }
];
CdkMenu.propDecorators = {
    orientation: [{ type: Input, args: ['cdkMenuOrientation',] }],
    closed: [{ type: Output }],
    _nestedGroups: [{ type: ContentChildren, args: [CdkMenuGroup, { descendants: true },] }],
    _allItems: [{ type: ContentChildren, args: [CdkMenuItem, { descendants: true },] }],
    _explicitPanel: [{ type: Input, args: ['cdkMenuPanel',] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL21lbnUvbWVudS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQ0wsU0FBUyxFQUNULEtBQUssRUFDTCxNQUFNLEVBQ04sWUFBWSxFQUNaLFNBQVMsRUFDVCxlQUFlLEVBR2YsUUFBUSxHQUVULE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBQyxlQUFlLEVBQWMsTUFBTSxtQkFBbUIsQ0FBQztBQUMvRCxPQUFPLEVBQ0wsVUFBVSxFQUNWLFdBQVcsRUFDWCxRQUFRLEVBQ1IsVUFBVSxFQUNWLE1BQU0sRUFDTixHQUFHLEVBQ0gsY0FBYyxHQUNmLE1BQU0sdUJBQXVCLENBQUM7QUFDL0IsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQ2pELE9BQU8sRUFBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUNoRyxPQUFPLEVBQUMsS0FBSyxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQzNCLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFDMUMsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGNBQWMsQ0FBQztBQUMxQyxPQUFPLEVBQU8sUUFBUSxFQUFDLE1BQU0sa0JBQWtCLENBQUM7QUFDaEQsT0FBTyxFQUFDLDBCQUEwQixFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3pELE9BQU8sRUFBQyxXQUFXLEVBQUMsTUFBTSxhQUFhLENBQUM7QUFHeEM7Ozs7OztHQU1HO0FBZUgsTUFBTSxPQUFPLE9BQVEsU0FBUSxZQUFZO0lBb0N2QyxZQUMrQixJQUFxQjtJQUNsRCxpRUFBaUU7SUFDakUsK0NBQStDO0lBQ2xCLFVBQXlCO1FBRXRELEtBQUssRUFBRSxDQUFDO1FBTHFCLFNBQUksR0FBSixJQUFJLENBQWlCO1FBR3JCLGVBQVUsR0FBVixVQUFVLENBQWU7UUF2Q3hEOzs7V0FHRztRQUMwQixnQkFBVyxHQUE4QixVQUFVLENBQUM7UUFFakYsNkNBQTZDO1FBQzFCLFdBQU0sR0FBb0QsSUFBSSxZQUFZLEVBQUUsQ0FBQztJQW1DaEcsQ0FBQztJQUVELFFBQVE7UUFDTixJQUFJLENBQUMsd0JBQXdCLEVBQUUsQ0FBQztJQUNsQyxDQUFDO0lBRUQsa0JBQWtCO1FBQ2hCLEtBQUssQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBRTNCLElBQUksQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO1FBQzlCLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUN0QixJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztRQUM1QixJQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQztJQUMvQixDQUFDO0lBRUQsOEVBQThFO0lBQzlFLGNBQWMsQ0FBQyxjQUEyQixTQUFTO1FBQ2pELElBQUksQ0FBQyxXQUFXLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQzdDLElBQUksQ0FBQyxXQUFXLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztJQUN4QyxDQUFDO0lBRUQsNkVBQTZFO0lBQzdFLGFBQWEsQ0FBQyxjQUEyQixTQUFTO1FBQ2hELElBQUksQ0FBQyxXQUFXLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQzdDLElBQUksQ0FBQyxXQUFXLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztJQUN2QyxDQUFDO0lBRUQsMkNBQTJDO0lBQzNDLGVBQWUsQ0FBQyxLQUFvQjtRQUNsQyxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO1FBQ3BDLFFBQVEsS0FBSyxDQUFDLE9BQU8sRUFBRTtZQUNyQixLQUFLLFVBQVUsQ0FBQztZQUNoQixLQUFLLFdBQVc7Z0JBQ2QsSUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFLEVBQUU7b0JBQ3hCLEtBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQztvQkFDdkIsVUFBVSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQztvQkFDdEMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztpQkFDN0I7Z0JBQ0QsTUFBTTtZQUVSLEtBQUssUUFBUSxDQUFDO1lBQ2QsS0FBSyxVQUFVO2dCQUNiLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLEVBQUU7b0JBQ3pCLEtBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQztvQkFDdkIsVUFBVSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQztvQkFDdEMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztpQkFDN0I7Z0JBQ0QsTUFBTTtZQUVSLEtBQUssTUFBTTtnQkFDVCxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxFQUFFO29CQUMxQixLQUFLLENBQUMsY0FBYyxFQUFFLENBQUM7b0JBQ3ZCLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLElBQUksc0JBQXdCLENBQUM7aUJBQ3BEO2dCQUNELE1BQU07WUFFUixLQUFLLEdBQUc7Z0JBQ04sSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFDM0IsTUFBTTtZQUVSO2dCQUNFLFVBQVUsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDL0I7SUFDSCxDQUFDO0lBRUQsOERBQThEO0lBQ3RELHdCQUF3QjtRQUM5QixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7UUFDcEMsSUFBSSxNQUFNLEVBQUU7WUFDVixNQUFNLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQzVCO2FBQU07WUFDTCwwQkFBMEIsRUFBRSxDQUFDO1NBQzlCO0lBQ0gsQ0FBQztJQUVEOzs7T0FHRztJQUNLLGFBQWE7UUFDbkIsT0FBTyxJQUFJLENBQUMsVUFBVSxJQUFJLElBQUksQ0FBQyxjQUFjLENBQUM7SUFDaEQsQ0FBQztJQUVEOzs7T0FHRztJQUNLLHNCQUFzQjtRQUM1QixJQUFJLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFO1lBQzNCLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUM7U0FDeEI7YUFBTTtZQUNMLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1NBQ2xGO0lBQ0gsQ0FBQztJQUVELDRFQUE0RTtJQUNwRSxnQkFBZ0I7UUFDdEIsK0VBQStFO1FBQy9FLHNFQUFzRTtRQUN0RSwrRkFBK0Y7UUFDL0YsaUZBQWlGO1FBQ2pGLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssWUFBWSxPQUFPLENBQUMsQ0FBQztJQUN6RixDQUFDO0lBRUQsMkVBQTJFO0lBQ25FLGNBQWM7O1FBQ3BCLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxlQUFlLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQzthQUNuRCxRQUFRLEVBQUU7YUFDVixhQUFhLEVBQUU7YUFDZixjQUFjLEVBQUUsQ0FBQztRQUVwQixJQUFJLElBQUksQ0FBQyxhQUFhLEVBQUUsRUFBRTtZQUN4QixJQUFJLENBQUMsV0FBVyxDQUFDLHlCQUF5QixDQUFDLE9BQUEsSUFBSSxDQUFDLElBQUksMENBQUUsS0FBSyxLQUFJLEtBQUssQ0FBQyxDQUFDO1NBQ3ZFO2FBQU07WUFDTCxJQUFJLENBQUMsV0FBVyxDQUFDLHVCQUF1QixFQUFFLENBQUM7U0FDNUM7SUFDSCxDQUFDO0lBRUQsOERBQThEO0lBQ3RELHFCQUFxQjtRQUMzQixJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU07YUFDbkIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7YUFDNUIsU0FBUyxDQUFDLENBQUMsSUFBbUIsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBRWpFLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTzthQUNwQixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQzthQUM1QixTQUFTLENBQUMsQ0FBQyxLQUFnQixFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUNuRSxDQUFDO0lBRUQ7OztPQUdHO0lBQ0ssY0FBYyxDQUFDLElBQW1COztRQUN4QyxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO1FBQ3BDLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7UUFDL0IsSUFBSSxJQUFJLFlBQUssT0FBTyxhQUFQLE9BQU8sdUJBQVAsT0FBTyxDQUFFLGNBQWMsNENBQUksT0FBTyxHQUFFLEVBQUU7WUFDakQsTUFBQSxPQUFPLENBQUMsY0FBYyxFQUFFLDBDQUFFLFNBQVMsR0FBRztZQUN0QyxVQUFVLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3RDLFVBQVUsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDbkM7SUFDSCxDQUFDO0lBRUQsNEZBQTRGO0lBQ3BGLGdCQUFnQixDQUFDLEtBQWdCO1FBQ3ZDLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7UUFDcEMsUUFBUSxLQUFLLEVBQUU7WUFDYjtnQkFDRSxVQUFVLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUN0QyxVQUFVLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztnQkFDL0IsTUFBTTtZQUVSO2dCQUNFLFVBQVUsQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQ3RDLFVBQVUsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO2dCQUNuQyxNQUFNO1lBRVI7Z0JBQ0UsSUFBSSxVQUFVLENBQUMsVUFBVSxFQUFFO29CQUN6QixVQUFVLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxDQUFDO29CQUN0QyxVQUFVLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQztpQkFDakQ7Z0JBQ0QsTUFBTTtTQUNUO0lBQ0gsQ0FBQztJQUVELGtFQUFrRTtJQUNsRTs7O09BR0c7SUFDSyxvQkFBb0I7UUFDMUIsTUFBTSxhQUFhLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNqRSxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU87YUFDbkIsSUFBSSxDQUNILFNBQVMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQ3pCLFFBQVEsQ0FBQyxDQUFDLElBQTRCLEVBQUUsRUFBRSxDQUN4QyxJQUFJO2FBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO2FBQzlCLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxTQUFTLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUMxRixFQUNELFFBQVEsRUFBRSxFQUNWLFNBQVMsQ0FBQyxDQUFDLElBQWlCLEVBQUUsRUFBRTtZQUM5QixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztZQUN0QixPQUFPLElBQUksQ0FBQyxjQUFjLEVBQUcsQ0FBQyxNQUFNLENBQUM7UUFDdkMsQ0FBQyxDQUFDLEVBQ0YsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FDdkI7YUFDQSxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUM7SUFDbkQsQ0FBQztJQUVELGdGQUFnRjtJQUN4RSxhQUFhO1FBQ25CLE9BQU8sSUFBSSxDQUFDLFdBQVcsS0FBSyxZQUFZLENBQUM7SUFDM0MsQ0FBQztJQUVELFdBQVc7UUFDVCxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztJQUMxQixDQUFDO0lBRUQsaURBQWlEO0lBQ3pDLGdCQUFnQjtRQUN0QixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ25CLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDekIsQ0FBQzs7O1lBclFGLFNBQVMsU0FBQztnQkFDVCxRQUFRLEVBQUUsV0FBVztnQkFDckIsUUFBUSxFQUFFLFNBQVM7Z0JBQ25CLElBQUksRUFBRTtvQkFDSixXQUFXLEVBQUUseUJBQXlCO29CQUN0QyxNQUFNLEVBQUUsTUFBTTtvQkFDZCxPQUFPLEVBQUUsVUFBVTtvQkFDbkIseUJBQXlCLEVBQUUsYUFBYTtpQkFDekM7Z0JBQ0QsU0FBUyxFQUFFO29CQUNULEVBQUMsT0FBTyxFQUFFLFlBQVksRUFBRSxXQUFXLEVBQUUsT0FBTyxFQUFDO29CQUM3QyxFQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLE9BQU8sRUFBQztpQkFDMUM7YUFDRjs7O1lBOUJPLGNBQWMsdUJBb0VqQixRQUFRO1lBaEVMLFlBQVksdUJBbUVmLFFBQVE7OzswQkFuQ1YsS0FBSyxTQUFDLG9CQUFvQjtxQkFHMUIsTUFBTTs0QkFTTixlQUFlLFNBQUMsWUFBWSxFQUFFLEVBQUMsV0FBVyxFQUFFLElBQUksRUFBQzt3QkFJakQsZUFBZSxTQUFDLFdBQVcsRUFBRSxFQUFDLFdBQVcsRUFBRSxJQUFJLEVBQUM7NkJBYWhELEtBQUssU0FBQyxjQUFjIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7XG4gIERpcmVjdGl2ZSxcbiAgSW5wdXQsXG4gIE91dHB1dCxcbiAgRXZlbnRFbWl0dGVyLFxuICBRdWVyeUxpc3QsXG4gIENvbnRlbnRDaGlsZHJlbixcbiAgQWZ0ZXJDb250ZW50SW5pdCxcbiAgT25EZXN0cm95LFxuICBPcHRpb25hbCxcbiAgT25Jbml0LFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7Rm9jdXNLZXlNYW5hZ2VyLCBGb2N1c09yaWdpbn0gZnJvbSAnQGFuZ3VsYXIvY2RrL2ExMXknO1xuaW1wb3J0IHtcbiAgTEVGVF9BUlJPVyxcbiAgUklHSFRfQVJST1csXG4gIFVQX0FSUk9XLFxuICBET1dOX0FSUk9XLFxuICBFU0NBUEUsXG4gIFRBQixcbiAgaGFzTW9kaWZpZXJLZXksXG59IGZyb20gJ0Bhbmd1bGFyL2Nkay9rZXljb2Rlcyc7XG5pbXBvcnQge0RpcmVjdGlvbmFsaXR5fSBmcm9tICdAYW5ndWxhci9jZGsvYmlkaSc7XG5pbXBvcnQge3Rha2UsIHRha2VVbnRpbCwgc3RhcnRXaXRoLCBtZXJnZU1hcCwgbWFwVG8sIG1lcmdlQWxsLCBzd2l0Y2hNYXB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7bWVyZ2V9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHtDZGtNZW51R3JvdXB9IGZyb20gJy4vbWVudS1ncm91cCc7XG5pbXBvcnQge0Nka01lbnVQYW5lbH0gZnJvbSAnLi9tZW51LXBhbmVsJztcbmltcG9ydCB7TWVudSwgQ0RLX01FTlV9IGZyb20gJy4vbWVudS1pbnRlcmZhY2UnO1xuaW1wb3J0IHt0aHJvd01pc3NpbmdNZW51UGFuZWxFcnJvcn0gZnJvbSAnLi9tZW51LWVycm9ycyc7XG5pbXBvcnQge0Nka01lbnVJdGVtfSBmcm9tICcuL21lbnUtaXRlbSc7XG5pbXBvcnQge01lbnVTdGFjaywgTWVudVN0YWNrSXRlbSwgRm9jdXNOZXh0fSBmcm9tICcuL21lbnUtc3RhY2snO1xuXG4vKipcbiAqIERpcmVjdGl2ZSB3aGljaCBjb25maWd1cmVzIHRoZSBlbGVtZW50IGFzIGEgTWVudSB3aGljaCBzaG91bGQgY29udGFpbiBjaGlsZCBlbGVtZW50cyBtYXJrZWQgYXNcbiAqIENka01lbnVJdGVtIG9yIENka01lbnVHcm91cC4gU2V0cyB0aGUgYXBwcm9wcmlhdGUgcm9sZSBhbmQgYXJpYS1hdHRyaWJ1dGVzIGZvciBhIG1lbnUgYW5kXG4gKiBjb250YWlucyBhY2Nlc3NpYmxlIGtleWJvYXJkIGFuZCBtb3VzZSBoYW5kbGluZyBsb2dpYy5cbiAqXG4gKiBJdCBhbHNvIGFjdHMgYXMgYSBSYWRpb0dyb3VwIGZvciBlbGVtZW50cyBtYXJrZWQgd2l0aCByb2xlIGBtZW51aXRlbXJhZGlvYC5cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW2Nka01lbnVdJyxcbiAgZXhwb3J0QXM6ICdjZGtNZW51JyxcbiAgaG9zdDoge1xuICAgICcoa2V5ZG93biknOiAnX2hhbmRsZUtleUV2ZW50KCRldmVudCknLFxuICAgICdyb2xlJzogJ21lbnUnLFxuICAgICdjbGFzcyc6ICdjZGstbWVudScsXG4gICAgJ1thdHRyLmFyaWEtb3JpZW50YXRpb25dJzogJ29yaWVudGF0aW9uJyxcbiAgfSxcbiAgcHJvdmlkZXJzOiBbXG4gICAge3Byb3ZpZGU6IENka01lbnVHcm91cCwgdXNlRXhpc3Rpbmc6IENka01lbnV9LFxuICAgIHtwcm92aWRlOiBDREtfTUVOVSwgdXNlRXhpc3Rpbmc6IENka01lbnV9LFxuICBdLFxufSlcbmV4cG9ydCBjbGFzcyBDZGtNZW51IGV4dGVuZHMgQ2RrTWVudUdyb3VwIGltcGxlbWVudHMgTWVudSwgQWZ0ZXJDb250ZW50SW5pdCwgT25Jbml0LCBPbkRlc3Ryb3kge1xuICAvKipcbiAgICogU2V0cyB0aGUgYXJpYS1vcmllbnRhdGlvbiBhdHRyaWJ1dGUgYW5kIGRldGVybWluZXMgd2hlcmUgbWVudXMgd2lsbCBiZSBvcGVuZWQuXG4gICAqIERvZXMgbm90IGFmZmVjdCBzdHlsaW5nL2xheW91dC5cbiAgICovXG4gIEBJbnB1dCgnY2RrTWVudU9yaWVudGF0aW9uJykgb3JpZW50YXRpb246ICdob3Jpem9udGFsJyB8ICd2ZXJ0aWNhbCcgPSAndmVydGljYWwnO1xuXG4gIC8qKiBFdmVudCBlbWl0dGVkIHdoZW4gdGhlIG1lbnUgaXMgY2xvc2VkLiAqL1xuICBAT3V0cHV0KCkgcmVhZG9ubHkgY2xvc2VkOiBFdmVudEVtaXR0ZXI8dm9pZCB8ICdjbGljaycgfCAndGFiJyB8ICdlc2NhcGUnPiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuICAvKiogVHJhY2sgdGhlIE1lbnVzIG1ha2luZyB1cCB0aGUgb3BlbiBtZW51IHN0YWNrLiAqL1xuICBfbWVudVN0YWNrOiBNZW51U3RhY2s7XG5cbiAgLyoqIEhhbmRsZXMga2V5Ym9hcmQgZXZlbnRzIGZvciB0aGUgbWVudS4gKi9cbiAgcHJpdmF0ZSBfa2V5TWFuYWdlcjogRm9jdXNLZXlNYW5hZ2VyPENka01lbnVJdGVtPjtcblxuICAvKiogTGlzdCBvZiBuZXN0ZWQgQ2RrTWVudUdyb3VwIGVsZW1lbnRzICovXG4gIEBDb250ZW50Q2hpbGRyZW4oQ2RrTWVudUdyb3VwLCB7ZGVzY2VuZGFudHM6IHRydWV9KVxuICBwcml2YXRlIHJlYWRvbmx5IF9uZXN0ZWRHcm91cHM6IFF1ZXJ5TGlzdDxDZGtNZW51R3JvdXA+O1xuXG4gIC8qKiBBbGwgY2hpbGQgTWVudUl0ZW0gZWxlbWVudHMgbmVzdGVkIGluIHRoaXMgTWVudS4gKi9cbiAgQENvbnRlbnRDaGlsZHJlbihDZGtNZW51SXRlbSwge2Rlc2NlbmRhbnRzOiB0cnVlfSlcbiAgcHJpdmF0ZSByZWFkb25seSBfYWxsSXRlbXM6IFF1ZXJ5TGlzdDxDZGtNZW51SXRlbT47XG5cbiAgLyoqIFRoZSBNZW51IEl0ZW0gd2hpY2ggdHJpZ2dlcmVkIHRoZSBvcGVuIHN1Ym1lbnUuICovXG4gIHByaXZhdGUgX29wZW5JdGVtPzogQ2RrTWVudUl0ZW07XG5cbiAgLyoqXG4gICAqIEEgcmVmZXJlbmNlIHRvIHRoZSBlbmNsb3NpbmcgcGFyZW50IG1lbnUgcGFuZWwuXG4gICAqXG4gICAqIFJlcXVpcmVkIHRvIGJlIHNldCB3aGVuIHVzaW5nIFZpZXdFbmdpbmUgc2luY2UgVmlld0VuZ2luZSBkb2VzIHN1cHBvcnQgaW5qZWN0aW5nIGEgcmVmZXJlbmNlIHRvXG4gICAqIHRoZSBwYXJlbnQgZGlyZWN0aXZlIGlmIHRoZSBwYXJlbnQgZGlyZWN0aXZlIGlzIHBsYWNlZCBvbiBhbiBgbmctdGVtcGxhdGVgLiBJZiB1c2luZyBJdnksIHRoZVxuICAgKiBpbmplY3RlZCB2YWx1ZSB3aWxsIGJlIHVzZWQgb3ZlciB0aGlzIG9uZS5cbiAgICovXG4gIEBJbnB1dCgnY2RrTWVudVBhbmVsJykgcHJpdmF0ZSByZWFkb25seSBfZXhwbGljaXRQYW5lbD86IENka01lbnVQYW5lbDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBAT3B0aW9uYWwoKSBwcml2YXRlIHJlYWRvbmx5IF9kaXI/OiBEaXJlY3Rpb25hbGl0eSxcbiAgICAvLyBgQ2RrTWVudVBhbmVsYCBpcyBhbHdheXMgdXNlZCBpbiBjb21iaW5hdGlvbiB3aXRoIGEgYENka01lbnVgLlxuICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTogbGlnaHR3ZWlnaHQtdG9rZW5zXG4gICAgQE9wdGlvbmFsKCkgcHJpdmF0ZSByZWFkb25seSBfbWVudVBhbmVsPzogQ2RrTWVudVBhbmVsXG4gICkge1xuICAgIHN1cGVyKCk7XG4gIH1cblxuICBuZ09uSW5pdCgpIHtcbiAgICB0aGlzLl9yZWdpc3RlcldpdGhQYXJlbnRQYW5lbCgpO1xuICB9XG5cbiAgbmdBZnRlckNvbnRlbnRJbml0KCkge1xuICAgIHN1cGVyLm5nQWZ0ZXJDb250ZW50SW5pdCgpO1xuXG4gICAgdGhpcy5fY29tcGxldGVDaGFuZ2VFbWl0dGVyKCk7XG4gICAgdGhpcy5fc2V0S2V5TWFuYWdlcigpO1xuICAgIHRoaXMuX3N1YnNjcmliZVRvTWVudU9wZW4oKTtcbiAgICB0aGlzLl9zdWJzY3JpYmVUb01lbnVTdGFjaygpO1xuICB9XG5cbiAgLyoqIFBsYWNlIGZvY3VzIG9uIHRoZSBmaXJzdCBNZW51SXRlbSBpbiB0aGUgbWVudSBhbmQgc2V0IHRoZSBmb2N1cyBvcmlnaW4uICovXG4gIGZvY3VzRmlyc3RJdGVtKGZvY3VzT3JpZ2luOiBGb2N1c09yaWdpbiA9ICdwcm9ncmFtJykge1xuICAgIHRoaXMuX2tleU1hbmFnZXIuc2V0Rm9jdXNPcmlnaW4oZm9jdXNPcmlnaW4pO1xuICAgIHRoaXMuX2tleU1hbmFnZXIuc2V0Rmlyc3RJdGVtQWN0aXZlKCk7XG4gIH1cblxuICAvKiogUGxhY2UgZm9jdXMgb24gdGhlIGxhc3QgTWVudUl0ZW0gaW4gdGhlIG1lbnUgYW5kIHNldCB0aGUgZm9jdXMgb3JpZ2luLiAqL1xuICBmb2N1c0xhc3RJdGVtKGZvY3VzT3JpZ2luOiBGb2N1c09yaWdpbiA9ICdwcm9ncmFtJykge1xuICAgIHRoaXMuX2tleU1hbmFnZXIuc2V0Rm9jdXNPcmlnaW4oZm9jdXNPcmlnaW4pO1xuICAgIHRoaXMuX2tleU1hbmFnZXIuc2V0TGFzdEl0ZW1BY3RpdmUoKTtcbiAgfVxuXG4gIC8qKiBIYW5kbGUga2V5Ym9hcmQgZXZlbnRzIGZvciB0aGUgTWVudS4gKi9cbiAgX2hhbmRsZUtleUV2ZW50KGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XG4gICAgY29uc3Qga2V5TWFuYWdlciA9IHRoaXMuX2tleU1hbmFnZXI7XG4gICAgc3dpdGNoIChldmVudC5rZXlDb2RlKSB7XG4gICAgICBjYXNlIExFRlRfQVJST1c6XG4gICAgICBjYXNlIFJJR0hUX0FSUk9XOlxuICAgICAgICBpZiAodGhpcy5faXNIb3Jpem9udGFsKCkpIHtcbiAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgIGtleU1hbmFnZXIuc2V0Rm9jdXNPcmlnaW4oJ2tleWJvYXJkJyk7XG4gICAgICAgICAga2V5TWFuYWdlci5vbktleWRvd24oZXZlbnQpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIFVQX0FSUk9XOlxuICAgICAgY2FzZSBET1dOX0FSUk9XOlxuICAgICAgICBpZiAoIXRoaXMuX2lzSG9yaXpvbnRhbCgpKSB7XG4gICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICBrZXlNYW5hZ2VyLnNldEZvY3VzT3JpZ2luKCdrZXlib2FyZCcpO1xuICAgICAgICAgIGtleU1hbmFnZXIub25LZXlkb3duKGV2ZW50KTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBFU0NBUEU6XG4gICAgICAgIGlmICghaGFzTW9kaWZpZXJLZXkoZXZlbnQpKSB7XG4gICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICB0aGlzLl9tZW51U3RhY2suY2xvc2UodGhpcywgRm9jdXNOZXh0LmN1cnJlbnRJdGVtKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBUQUI6XG4gICAgICAgIHRoaXMuX21lbnVTdGFjay5jbG9zZUFsbCgpO1xuICAgICAgICBicmVhaztcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAga2V5TWFuYWdlci5vbktleWRvd24oZXZlbnQpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBSZWdpc3RlciB0aGlzIG1lbnUgd2l0aCBpdHMgZW5jbG9zaW5nIHBhcmVudCBtZW51IHBhbmVsICovXG4gIHByaXZhdGUgX3JlZ2lzdGVyV2l0aFBhcmVudFBhbmVsKCkge1xuICAgIGNvbnN0IHBhcmVudCA9IHRoaXMuX2dldE1lbnVQYW5lbCgpO1xuICAgIGlmIChwYXJlbnQpIHtcbiAgICAgIHBhcmVudC5fcmVnaXN0ZXJNZW51KHRoaXMpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvd01pc3NpbmdNZW51UGFuZWxFcnJvcigpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGVuY2xvc2luZyBDZGtNZW51UGFuZWwgZGVmYXVsdGluZyB0byB0aGUgaW5qZWN0ZWQgcmVmZXJlbmNlIG92ZXIgdGhlIGRldmVsb3BlclxuICAgKiBwcm92aWRlZCByZWZlcmVuY2UuXG4gICAqL1xuICBwcml2YXRlIF9nZXRNZW51UGFuZWwoKSB7XG4gICAgcmV0dXJuIHRoaXMuX21lbnVQYW5lbCB8fCB0aGlzLl9leHBsaWNpdFBhbmVsO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbXBsZXRlIHRoZSBjaGFuZ2UgZW1pdHRlciBpZiB0aGVyZSBhcmUgYW55IG5lc3RlZCBNZW51R3JvdXBzIG9yIHJlZ2lzdGVyIHRvIGNvbXBsZXRlIHRoZVxuICAgKiBjaGFuZ2UgZW1pdHRlciBpZiBhIE1lbnVHcm91cCBpcyByZW5kZXJlZCBhdCBzb21lIHBvaW50XG4gICAqL1xuICBwcml2YXRlIF9jb21wbGV0ZUNoYW5nZUVtaXR0ZXIoKSB7XG4gICAgaWYgKHRoaXMuX2hhc05lc3RlZEdyb3VwcygpKSB7XG4gICAgICB0aGlzLmNoYW5nZS5jb21wbGV0ZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9uZXN0ZWRHcm91cHMuY2hhbmdlcy5waXBlKHRha2UoMSkpLnN1YnNjcmliZSgoKSA9PiB0aGlzLmNoYW5nZS5jb21wbGV0ZSgpKTtcbiAgICB9XG4gIH1cblxuICAvKiogUmV0dXJuIHRydWUgaWYgdGhlcmUgYXJlIG5lc3RlZCBDZGtNZW51R3JvdXAgZWxlbWVudHMgd2l0aGluIHRoZSBNZW51ICovXG4gIHByaXZhdGUgX2hhc05lc3RlZEdyb3VwcygpIHtcbiAgICAvLyB2aWV3IGVuZ2luZSBoYXMgYSBidWcgd2hlcmUgQENvbnRlbnRDaGlsZHJlbiB3aWxsIHJldHVybiB0aGUgY3VycmVudCBlbGVtZW50XG4gICAgLy8gYWxvbmcgd2l0aCBjaGlsZHJlbiBpZiB0aGUgc2VsZWN0b3JzIG1hdGNoIC0gbm90IGp1c3QgdGhlIGNoaWxkcmVuLlxuICAgIC8vIEhlcmUsIGlmIHRoZXJlIGlzIGF0IGxlYXN0IG9uZSBlbGVtZW50LCB3ZSBjaGVjayB0byBzZWUgaWYgdGhlIGZpcnN0IGVsZW1lbnQgaXMgYSBDZGtNZW51IGluXG4gICAgLy8gb3JkZXIgdG8gZW5zdXJlIHRoYXQgd2UgcmV0dXJuIHRydWUgaWZmIHRoZXJlIGFyZSBjaGlsZCBDZGtNZW51R3JvdXAgZWxlbWVudHMuXG4gICAgcmV0dXJuIHRoaXMuX25lc3RlZEdyb3Vwcy5sZW5ndGggPiAwICYmICEodGhpcy5fbmVzdGVkR3JvdXBzLmZpcnN0IGluc3RhbmNlb2YgQ2RrTWVudSk7XG4gIH1cblxuICAvKiogU2V0dXAgdGhlIEZvY3VzS2V5TWFuYWdlciB3aXRoIHRoZSBjb3JyZWN0IG9yaWVudGF0aW9uIGZvciB0aGUgbWVudS4gKi9cbiAgcHJpdmF0ZSBfc2V0S2V5TWFuYWdlcigpIHtcbiAgICB0aGlzLl9rZXlNYW5hZ2VyID0gbmV3IEZvY3VzS2V5TWFuYWdlcih0aGlzLl9hbGxJdGVtcylcbiAgICAgIC53aXRoV3JhcCgpXG4gICAgICAud2l0aFR5cGVBaGVhZCgpXG4gICAgICAud2l0aEhvbWVBbmRFbmQoKTtcblxuICAgIGlmICh0aGlzLl9pc0hvcml6b250YWwoKSkge1xuICAgICAgdGhpcy5fa2V5TWFuYWdlci53aXRoSG9yaXpvbnRhbE9yaWVudGF0aW9uKHRoaXMuX2Rpcj8udmFsdWUgfHwgJ2x0cicpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9rZXlNYW5hZ2VyLndpdGhWZXJ0aWNhbE9yaWVudGF0aW9uKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFN1YnNjcmliZSB0byB0aGUgTWVudVN0YWNrIGNsb3NlIGFuZCBlbXB0eSBvYnNlcnZhYmxlcy4gKi9cbiAgcHJpdmF0ZSBfc3Vic2NyaWJlVG9NZW51U3RhY2soKSB7XG4gICAgdGhpcy5fbWVudVN0YWNrLmNsb3NlZFxuICAgICAgLnBpcGUodGFrZVVudGlsKHRoaXMuY2xvc2VkKSlcbiAgICAgIC5zdWJzY3JpYmUoKGl0ZW06IE1lbnVTdGFja0l0ZW0pID0+IHRoaXMuX2Nsb3NlT3Blbk1lbnUoaXRlbSkpO1xuXG4gICAgdGhpcy5fbWVudVN0YWNrLmVtcHRpZWRcbiAgICAgIC5waXBlKHRha2VVbnRpbCh0aGlzLmNsb3NlZCkpXG4gICAgICAuc3Vic2NyaWJlKChldmVudDogRm9jdXNOZXh0KSA9PiB0aGlzLl90b2dnbGVNZW51Rm9jdXMoZXZlbnQpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbG9zZSB0aGUgb3BlbiBtZW51IGlmIHRoZSBjdXJyZW50IGFjdGl2ZSBpdGVtIG9wZW5lZCB0aGUgcmVxdWVzdGVkIE1lbnVTdGFja0l0ZW0uXG4gICAqIEBwYXJhbSBpdGVtIHRoZSBNZW51U3RhY2tJdGVtIHJlcXVlc3RlZCB0byBiZSBjbG9zZWQuXG4gICAqL1xuICBwcml2YXRlIF9jbG9zZU9wZW5NZW51KG1lbnU6IE1lbnVTdGFja0l0ZW0pIHtcbiAgICBjb25zdCBrZXlNYW5hZ2VyID0gdGhpcy5fa2V5TWFuYWdlcjtcbiAgICBjb25zdCB0cmlnZ2VyID0gdGhpcy5fb3Blbkl0ZW07XG4gICAgaWYgKG1lbnUgPT09IHRyaWdnZXI/LmdldE1lbnVUcmlnZ2VyKCk/LmdldE1lbnUoKSkge1xuICAgICAgdHJpZ2dlci5nZXRNZW51VHJpZ2dlcigpPy5jbG9zZU1lbnUoKTtcbiAgICAgIGtleU1hbmFnZXIuc2V0Rm9jdXNPcmlnaW4oJ2tleWJvYXJkJyk7XG4gICAgICBrZXlNYW5hZ2VyLnNldEFjdGl2ZUl0ZW0odHJpZ2dlcik7XG4gICAgfVxuICB9XG5cbiAgLyoqIFNldCBmb2N1cyB0aGUgZWl0aGVyIHRoZSBjdXJyZW50LCBwcmV2aW91cyBvciBuZXh0IGl0ZW0gYmFzZWQgb24gdGhlIEZvY3VzTmV4dCBldmVudC4gKi9cbiAgcHJpdmF0ZSBfdG9nZ2xlTWVudUZvY3VzKGV2ZW50OiBGb2N1c05leHQpIHtcbiAgICBjb25zdCBrZXlNYW5hZ2VyID0gdGhpcy5fa2V5TWFuYWdlcjtcbiAgICBzd2l0Y2ggKGV2ZW50KSB7XG4gICAgICBjYXNlIEZvY3VzTmV4dC5uZXh0SXRlbTpcbiAgICAgICAga2V5TWFuYWdlci5zZXRGb2N1c09yaWdpbigna2V5Ym9hcmQnKTtcbiAgICAgICAga2V5TWFuYWdlci5zZXROZXh0SXRlbUFjdGl2ZSgpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBGb2N1c05leHQucHJldmlvdXNJdGVtOlxuICAgICAgICBrZXlNYW5hZ2VyLnNldEZvY3VzT3JpZ2luKCdrZXlib2FyZCcpO1xuICAgICAgICBrZXlNYW5hZ2VyLnNldFByZXZpb3VzSXRlbUFjdGl2ZSgpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBGb2N1c05leHQuY3VycmVudEl0ZW06XG4gICAgICAgIGlmIChrZXlNYW5hZ2VyLmFjdGl2ZUl0ZW0pIHtcbiAgICAgICAgICBrZXlNYW5hZ2VyLnNldEZvY3VzT3JpZ2luKCdrZXlib2FyZCcpO1xuICAgICAgICAgIGtleU1hbmFnZXIuc2V0QWN0aXZlSXRlbShrZXlNYW5hZ2VyLmFjdGl2ZUl0ZW0pO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIC8vIFRPRE8oYW5keTk3NzUpOiByZW1vdmUgZHVwbGljYXRlIGxvZ2ljIGJldHdlZW4gbWVudSBhbiBtZW51IGJhclxuICAvKipcbiAgICogU3Vic2NyaWJlIHRvIHRoZSBtZW51IHRyaWdnZXIncyBvcGVuIGV2ZW50cyBpbiBvcmRlciB0byB0cmFjayB0aGUgdHJpZ2dlciB3aGljaCBvcGVuZWQgdGhlIG1lbnVcbiAgICogYW5kIHN0b3AgdHJhY2tpbmcgaXQgd2hlbiB0aGUgbWVudSBpcyBjbG9zZWQuXG4gICAqL1xuICBwcml2YXRlIF9zdWJzY3JpYmVUb01lbnVPcGVuKCkge1xuICAgIGNvbnN0IGV4aXRDb25kaXRpb24gPSBtZXJnZSh0aGlzLl9hbGxJdGVtcy5jaGFuZ2VzLCB0aGlzLmNsb3NlZCk7XG4gICAgdGhpcy5fYWxsSXRlbXMuY2hhbmdlc1xuICAgICAgLnBpcGUoXG4gICAgICAgIHN0YXJ0V2l0aCh0aGlzLl9hbGxJdGVtcyksXG4gICAgICAgIG1lcmdlTWFwKChsaXN0OiBRdWVyeUxpc3Q8Q2RrTWVudUl0ZW0+KSA9PlxuICAgICAgICAgIGxpc3RcbiAgICAgICAgICAgIC5maWx0ZXIoaXRlbSA9PiBpdGVtLmhhc01lbnUoKSlcbiAgICAgICAgICAgIC5tYXAoaXRlbSA9PiBpdGVtLmdldE1lbnVUcmlnZ2VyKCkhLm9wZW5lZC5waXBlKG1hcFRvKGl0ZW0pLCB0YWtlVW50aWwoZXhpdENvbmRpdGlvbikpKVxuICAgICAgICApLFxuICAgICAgICBtZXJnZUFsbCgpLFxuICAgICAgICBzd2l0Y2hNYXAoKGl0ZW06IENka01lbnVJdGVtKSA9PiB7XG4gICAgICAgICAgdGhpcy5fb3Blbkl0ZW0gPSBpdGVtO1xuICAgICAgICAgIHJldHVybiBpdGVtLmdldE1lbnVUcmlnZ2VyKCkhLmNsb3NlZDtcbiAgICAgICAgfSksXG4gICAgICAgIHRha2VVbnRpbCh0aGlzLmNsb3NlZClcbiAgICAgIClcbiAgICAgIC5zdWJzY3JpYmUoKCkgPT4gKHRoaXMuX29wZW5JdGVtID0gdW5kZWZpbmVkKSk7XG4gIH1cblxuICAvKiogUmV0dXJuIHRydWUgaWYgdGhpcyBtZW51IGhhcyBiZWVuIGNvbmZpZ3VyZWQgaW4gYSBob3Jpem9udGFsIG9yaWVudGF0aW9uLiAqL1xuICBwcml2YXRlIF9pc0hvcml6b250YWwoKSB7XG4gICAgcmV0dXJuIHRoaXMub3JpZW50YXRpb24gPT09ICdob3Jpem9udGFsJztcbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIHRoaXMuX2VtaXRDbG9zZWRFdmVudCgpO1xuICB9XG5cbiAgLyoqIEVtaXQgYW5kIGNvbXBsZXRlIHRoZSBjbG9zZWQgZXZlbnQgZW1pdHRlciAqL1xuICBwcml2YXRlIF9lbWl0Q2xvc2VkRXZlbnQoKSB7XG4gICAgdGhpcy5jbG9zZWQubmV4dCgpO1xuICAgIHRoaXMuY2xvc2VkLmNvbXBsZXRlKCk7XG4gIH1cbn1cbiJdfQ==