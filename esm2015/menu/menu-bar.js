/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, Input, ContentChildren, QueryList, Optional, NgZone, HostListener, } from '@angular/core';
import { Directionality } from '@angular/cdk/bidi';
import { FocusKeyManager } from '@angular/cdk/a11y';
import { LEFT_ARROW, RIGHT_ARROW, UP_ARROW, DOWN_ARROW, ESCAPE, TAB } from '@angular/cdk/keycodes';
import { takeUntil, mergeAll, mapTo, startWith, mergeMap, switchMap } from 'rxjs/operators';
import { Subject, merge } from 'rxjs';
import { CdkMenuGroup } from './menu-group';
import { CDK_MENU } from './menu-interface';
import { CdkMenuItem } from './menu-item';
import { MenuStack } from './menu-stack';
import { getItemPointerEntries } from './item-pointer-entries';
/**
 * Directive applied to an element which configures it as a MenuBar by setting the appropriate
 * role, aria attributes, and accessible keyboard and mouse handling logic. The component that
 * this directive is applied to should contain components marked with CdkMenuItem.
 *
 */
export class CdkMenuBar extends CdkMenuGroup {
    constructor(_menuStack, _ngZone, _dir) {
        super();
        this._menuStack = _menuStack;
        this._ngZone = _ngZone;
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
        this._subscribeToMouseManager();
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
     * Set the FocusMouseManager and ensure that when mouse focus changes the key manager is updated
     * with the latest menu item under mouse focus.
     */
    _subscribeToMouseManager() {
        this._ngZone.runOutsideAngular(() => {
            this._mouseFocusChanged = getItemPointerEntries(this._allItems);
            this._mouseFocusChanged.pipe(takeUntil(this._destroyed)).subscribe(item => {
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
    /** Return true if the MenuBar has an open submenu. */
    _hasOpenSubmenu() {
        return !!this._openItem;
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
    { type: Directionality, decorators: [{ type: Optional }] }
];
CdkMenuBar.propDecorators = {
    orientation: [{ type: Input, args: ['cdkMenuBarOrientation',] }],
    _allItems: [{ type: ContentChildren, args: [CdkMenuItem, { descendants: true },] }],
    focusFirstItem: [{ type: HostListener, args: ['focus',] }],
    _handleKeyEvent: [{ type: HostListener, args: ['keydown', ['$event'],] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1iYXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrLWV4cGVyaW1lbnRhbC9tZW51L21lbnUtYmFyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFDTCxTQUFTLEVBQ1QsS0FBSyxFQUNMLGVBQWUsRUFDZixTQUFTLEVBR1QsUUFBUSxFQUNSLE1BQU0sRUFDTixZQUFZLEdBQ2IsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQ2pELE9BQU8sRUFBQyxlQUFlLEVBQWMsTUFBTSxtQkFBbUIsQ0FBQztBQUMvRCxPQUFPLEVBQUMsVUFBVSxFQUFFLFdBQVcsRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUNqRyxPQUFPLEVBQUMsU0FBUyxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUMxRixPQUFPLEVBQUMsT0FBTyxFQUFFLEtBQUssRUFBYSxNQUFNLE1BQU0sQ0FBQztBQUNoRCxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sY0FBYyxDQUFDO0FBQzFDLE9BQU8sRUFBQyxRQUFRLEVBQU8sTUFBTSxrQkFBa0IsQ0FBQztBQUNoRCxPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0sYUFBYSxDQUFDO0FBQ3hDLE9BQU8sRUFBQyxTQUFTLEVBQTJCLE1BQU0sY0FBYyxDQUFDO0FBQ2pFLE9BQU8sRUFBQyxxQkFBcUIsRUFBQyxNQUFNLHdCQUF3QixDQUFDO0FBRTdEOzs7OztHQUtHO0FBZ0JILE1BQU0sT0FBTyxVQUFXLFNBQVEsWUFBWTtJQXVCMUMsWUFDVyxVQUFxQixFQUNiLE9BQWUsRUFDSCxJQUFxQjtRQUVsRCxLQUFLLEVBQUUsQ0FBQztR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QyxDQUFDO0lBQ25ELENBQUM7SUFFRCxzREFBc0Q7SUFDOUMsZUFBZTtRQUNyQixPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDO0lBQzFCLENBQUM7SUFFRCxXQUFXO1FBQ1QsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ3BCLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDdkIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUM3QixDQUFDOzs7WUF0UEYsU0FBUyxTQUFDO2dCQUNULFFBQVEsRUFBRSxjQUFjO2dCQUN4QixRQUFRLEVBQUUsWUFBWTtnQkFDdEIsSUFBSSxFQUFFO29CQUNKLE1BQU0sRUFBRSxTQUFTO29CQUNqQixPQUFPLEVBQUUsY0FBYztvQkFDdkIsVUFBVSxFQUFFLEdBQUc7b0JBQ2YseUJBQXlCLEVBQUUsYUFBYTtpQkFDekM7Z0JBQ0QsU0FBUyxFQUFFO29CQUNULEVBQUMsT0FBTyxFQUFFLFlBQVksRUFBRSxXQUFXLEVBQUUsVUFBVSxFQUFDO29CQUNoRCxFQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLFVBQVUsRUFBQztvQkFDNUMsRUFBQyxPQUFPLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUM7aUJBQzFDO2FBQ0Y7OztZQXZCTyxTQUFTO1lBWGYsTUFBTTtZQUdBLGNBQWMsdUJBMERqQixRQUFROzs7MEJBckJWLEtBQUssU0FBQyx1QkFBdUI7d0JBWTdCLGVBQWUsU0FBQyxXQUFXLEVBQUUsRUFBQyxXQUFXLEVBQUUsSUFBSSxFQUFDOzZCQTJCaEQsWUFBWSxTQUFDLE9BQU87OEJBaUJwQixZQUFZLFNBQUMsU0FBUyxFQUFFLENBQUMsUUFBUSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7XG4gIERpcmVjdGl2ZSxcbiAgSW5wdXQsXG4gIENvbnRlbnRDaGlsZHJlbixcbiAgUXVlcnlMaXN0LFxuICBBZnRlckNvbnRlbnRJbml0LFxuICBPbkRlc3Ryb3ksXG4gIE9wdGlvbmFsLFxuICBOZ1pvbmUsXG4gIEhvc3RMaXN0ZW5lcixcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0RpcmVjdGlvbmFsaXR5fSBmcm9tICdAYW5ndWxhci9jZGsvYmlkaSc7XG5pbXBvcnQge0ZvY3VzS2V5TWFuYWdlciwgRm9jdXNPcmlnaW59IGZyb20gJ0Bhbmd1bGFyL2Nkay9hMTF5JztcbmltcG9ydCB7TEVGVF9BUlJPVywgUklHSFRfQVJST1csIFVQX0FSUk9XLCBET1dOX0FSUk9XLCBFU0NBUEUsIFRBQn0gZnJvbSAnQGFuZ3VsYXIvY2RrL2tleWNvZGVzJztcbmltcG9ydCB7dGFrZVVudGlsLCBtZXJnZUFsbCwgbWFwVG8sIHN0YXJ0V2l0aCwgbWVyZ2VNYXAsIHN3aXRjaE1hcH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuaW1wb3J0IHtTdWJqZWN0LCBtZXJnZSwgT2JzZXJ2YWJsZX0gZnJvbSAncnhqcyc7XG5pbXBvcnQge0Nka01lbnVHcm91cH0gZnJvbSAnLi9tZW51LWdyb3VwJztcbmltcG9ydCB7Q0RLX01FTlUsIE1lbnV9IGZyb20gJy4vbWVudS1pbnRlcmZhY2UnO1xuaW1wb3J0IHtDZGtNZW51SXRlbX0gZnJvbSAnLi9tZW51LWl0ZW0nO1xuaW1wb3J0IHtNZW51U3RhY2ssIE1lbnVTdGFja0l0ZW0sIEZvY3VzTmV4dH0gZnJvbSAnLi9tZW51LXN0YWNrJztcbmltcG9ydCB7Z2V0SXRlbVBvaW50ZXJFbnRyaWVzfSBmcm9tICcuL2l0ZW0tcG9pbnRlci1lbnRyaWVzJztcblxuLyoqXG4gKiBEaXJlY3RpdmUgYXBwbGllZCB0byBhbiBlbGVtZW50IHdoaWNoIGNvbmZpZ3VyZXMgaXQgYXMgYSBNZW51QmFyIGJ5IHNldHRpbmcgdGhlIGFwcHJvcHJpYXRlXG4gKiByb2xlLCBhcmlhIGF0dHJpYnV0ZXMsIGFuZCBhY2Nlc3NpYmxlIGtleWJvYXJkIGFuZCBtb3VzZSBoYW5kbGluZyBsb2dpYy4gVGhlIGNvbXBvbmVudCB0aGF0XG4gKiB0aGlzIGRpcmVjdGl2ZSBpcyBhcHBsaWVkIHRvIHNob3VsZCBjb250YWluIGNvbXBvbmVudHMgbWFya2VkIHdpdGggQ2RrTWVudUl0ZW0uXG4gKlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbY2RrTWVudUJhcl0nLFxuICBleHBvcnRBczogJ2Nka01lbnVCYXInLFxuICBob3N0OiB7XG4gICAgJ3JvbGUnOiAnbWVudWJhcicsXG4gICAgJ2NsYXNzJzogJ2Nkay1tZW51LWJhcicsXG4gICAgJ3RhYmluZGV4JzogJzAnLFxuICAgICdbYXR0ci5hcmlhLW9yaWVudGF0aW9uXSc6ICdvcmllbnRhdGlvbicsXG4gIH0sXG4gIHByb3ZpZGVyczogW1xuICAgIHtwcm92aWRlOiBDZGtNZW51R3JvdXAsIHVzZUV4aXN0aW5nOiBDZGtNZW51QmFyfSxcbiAgICB7cHJvdmlkZTogQ0RLX01FTlUsIHVzZUV4aXN0aW5nOiBDZGtNZW51QmFyfSxcbiAgICB7cHJvdmlkZTogTWVudVN0YWNrLCB1c2VDbGFzczogTWVudVN0YWNrfSxcbiAgXSxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrTWVudUJhciBleHRlbmRzIENka01lbnVHcm91cCBpbXBsZW1lbnRzIE1lbnUsIEFmdGVyQ29udGVudEluaXQsIE9uRGVzdHJveSB7XG4gIC8qKlxuICAgKiBTZXRzIHRoZSBhcmlhLW9yaWVudGF0aW9uIGF0dHJpYnV0ZSBhbmQgZGV0ZXJtaW5lcyB3aGVyZSBtZW51cyB3aWxsIGJlIG9wZW5lZC5cbiAgICogRG9lcyBub3QgYWZmZWN0IHN0eWxpbmcvbGF5b3V0LlxuICAgKi9cbiAgQElucHV0KCdjZGtNZW51QmFyT3JpZW50YXRpb24nKSBvcmllbnRhdGlvbjogJ2hvcml6b250YWwnIHwgJ3ZlcnRpY2FsJyA9ICdob3Jpem9udGFsJztcblxuICAvKiogSGFuZGxlcyBrZXlib2FyZCBldmVudHMgZm9yIHRoZSBNZW51QmFyLiAqL1xuICBwcml2YXRlIF9rZXlNYW5hZ2VyOiBGb2N1c0tleU1hbmFnZXI8Q2RrTWVudUl0ZW0+O1xuXG4gIC8qKiBFbWl0cyB3aGVuIGEgY2hpbGQgTWVudUl0ZW0gaXMgbW91c2VkIG92ZXIuICovXG4gIHByaXZhdGUgX21vdXNlRm9jdXNDaGFuZ2VkOiBPYnNlcnZhYmxlPENka01lbnVJdGVtPjtcblxuICAvKiogRW1pdHMgd2hlbiB0aGUgTWVudUJhciBpcyBkZXN0cm95ZWQuICovXG4gIHByaXZhdGUgcmVhZG9ubHkgX2Rlc3Ryb3llZDogU3ViamVjdDx2b2lkPiA9IG5ldyBTdWJqZWN0KCk7XG5cbiAgLyoqIEFsbCBjaGlsZCBNZW51SXRlbSBlbGVtZW50cyBuZXN0ZWQgaW4gdGhpcyBNZW51QmFyLiAqL1xuICBAQ29udGVudENoaWxkcmVuKENka01lbnVJdGVtLCB7ZGVzY2VuZGFudHM6IHRydWV9KVxuICBwcml2YXRlIHJlYWRvbmx5IF9hbGxJdGVtczogUXVlcnlMaXN0PENka01lbnVJdGVtPjtcblxuICAvKiogVGhlIE1lbnUgSXRlbSB3aGljaCB0cmlnZ2VyZWQgdGhlIG9wZW4gc3VibWVudS4gKi9cbiAgcHJpdmF0ZSBfb3Blbkl0ZW0/OiBDZGtNZW51SXRlbTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICByZWFkb25seSBfbWVudVN0YWNrOiBNZW51U3RhY2ssXG4gICAgcHJpdmF0ZSByZWFkb25seSBfbmdab25lOiBOZ1pvbmUsXG4gICAgQE9wdGlvbmFsKCkgcHJpdmF0ZSByZWFkb25seSBfZGlyPzogRGlyZWN0aW9uYWxpdHlcbiAgKSB7XG4gICAgc3VwZXIoKTtcbiAgfVxuXG4gIG5nQWZ0ZXJDb250ZW50SW5pdCgpIHtcbiAgICBzdXBlci5uZ0FmdGVyQ29udGVudEluaXQoKTtcblxuICAgIHRoaXMuX3NldEtleU1hbmFnZXIoKTtcbiAgICB0aGlzLl9zdWJzY3JpYmVUb01lbnVPcGVuKCk7XG4gICAgdGhpcy5fc3Vic2NyaWJlVG9NZW51U3RhY2soKTtcbiAgICB0aGlzLl9zdWJzY3JpYmVUb01vdXNlTWFuYWdlcigpO1xuICB9XG5cbiAgLy8gSW4gSXZ5IHRoZSBgaG9zdGAgbWV0YWRhdGEgd2lsbCBiZSBtZXJnZWQsIHdoZXJlYXMgaW4gVmlld0VuZ2luZSBpdCBpcyBvdmVycmlkZGVuLiBJbiBvcmRlclxuICAvLyB0byBhdm9pZCBkb3VibGUgZXZlbnQgbGlzdGVuZXJzLCB3ZSBuZWVkIHRvIHVzZSBgSG9zdExpc3RlbmVyYC4gT25jZSBJdnkgaXMgdGhlIGRlZmF1bHQsIHdlXG4gIC8vIGNhbiBtb3ZlIHRoaXMgYmFjayBpbnRvIGBob3N0YC5cbiAgLy8gdHNsaW50OmRpc2FibGU6bm8taG9zdC1kZWNvcmF0b3ItaW4tY29uY3JldGVcbiAgQEhvc3RMaXN0ZW5lcignZm9jdXMnKVxuICAvKiogUGxhY2UgZm9jdXMgb24gdGhlIGZpcnN0IE1lbnVJdGVtIGluIHRoZSBtZW51IGFuZCBzZXQgdGhlIGZvY3VzIG9yaWdpbi4gKi9cbiAgZm9jdXNGaXJzdEl0ZW0oZm9jdXNPcmlnaW46IEZvY3VzT3JpZ2luID0gJ3Byb2dyYW0nKSB7XG4gICAgdGhpcy5fa2V5TWFuYWdlci5zZXRGb2N1c09yaWdpbihmb2N1c09yaWdpbik7XG4gICAgdGhpcy5fa2V5TWFuYWdlci5zZXRGaXJzdEl0ZW1BY3RpdmUoKTtcbiAgfVxuXG4gIC8qKiBQbGFjZSBmb2N1cyBvbiB0aGUgbGFzdCBNZW51SXRlbSBpbiB0aGUgbWVudSBhbmQgc2V0IHRoZSBmb2N1cyBvcmlnaW4uICovXG4gIGZvY3VzTGFzdEl0ZW0oZm9jdXNPcmlnaW46IEZvY3VzT3JpZ2luID0gJ3Byb2dyYW0nKSB7XG4gICAgdGhpcy5fa2V5TWFuYWdlci5zZXRGb2N1c09yaWdpbihmb2N1c09yaWdpbik7XG4gICAgdGhpcy5fa2V5TWFuYWdlci5zZXRMYXN0SXRlbUFjdGl2ZSgpO1xuICB9XG5cbiAgLy8gSW4gSXZ5IHRoZSBgaG9zdGAgbWV0YWRhdGEgd2lsbCBiZSBtZXJnZWQsIHdoZXJlYXMgaW4gVmlld0VuZ2luZSBpdCBpcyBvdmVycmlkZGVuLiBJbiBvcmRlclxuICAvLyB0byBhdm9pZCBkb3VibGUgZXZlbnQgbGlzdGVuZXJzLCB3ZSBuZWVkIHRvIHVzZSBgSG9zdExpc3RlbmVyYC4gT25jZSBJdnkgaXMgdGhlIGRlZmF1bHQsIHdlXG4gIC8vIGNhbiBtb3ZlIHRoaXMgYmFjayBpbnRvIGBob3N0YC5cbiAgLy8gdHNsaW50OmRpc2FibGU6bm8taG9zdC1kZWNvcmF0b3ItaW4tY29uY3JldGVcbiAgQEhvc3RMaXN0ZW5lcigna2V5ZG93bicsIFsnJGV2ZW50J10pXG4gIC8qKlxuICAgKiBIYW5kbGUga2V5Ym9hcmQgZXZlbnRzLCBzcGVjaWZpY2FsbHkgY2hhbmdpbmcgdGhlIGZvY3VzZWQgZWxlbWVudCBhbmQvb3IgdG9nZ2xpbmcgdGhlIGFjdGl2ZVxuICAgKiBpdGVtcyBtZW51LlxuICAgKiBAcGFyYW0gZXZlbnQgdGhlIEtleWJvYXJkRXZlbnQgdG8gaGFuZGxlLlxuICAgKi9cbiAgX2hhbmRsZUtleUV2ZW50KGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XG4gICAgY29uc3Qga2V5TWFuYWdlciA9IHRoaXMuX2tleU1hbmFnZXI7XG4gICAgc3dpdGNoIChldmVudC5rZXlDb2RlKSB7XG4gICAgICBjYXNlIFVQX0FSUk9XOlxuICAgICAgY2FzZSBET1dOX0FSUk9XOlxuICAgICAgY2FzZSBMRUZUX0FSUk9XOlxuICAgICAgY2FzZSBSSUdIVF9BUlJPVzpcbiAgICAgICAgY29uc3QgaG9yaXpvbnRhbEFycm93cyA9IGV2ZW50LmtleUNvZGUgPT09IExFRlRfQVJST1cgfHwgZXZlbnQua2V5Q29kZSA9PT0gUklHSFRfQVJST1c7XG4gICAgICAgIC8vIEZvciBhIGhvcml6b250YWwgbWVudSBpZiB0aGUgbGVmdC9yaWdodCBrZXlzIHdlcmUgY2xpY2tlZCwgb3IgYSB2ZXJ0aWNhbCBtZW51IGlmIHRoZVxuICAgICAgICAvLyB1cC9kb3duIGtleXMgd2VyZSBjbGlja2VkOiBpZiB0aGUgY3VycmVudCBtZW51IGlzIG9wZW4sIGNsb3NlIGl0IHRoZW4gZm9jdXMgYW5kIG9wZW4gdGhlXG4gICAgICAgIC8vIG5leHQgIG1lbnUuXG4gICAgICAgIGlmIChcbiAgICAgICAgICAodGhpcy5faXNIb3Jpem9udGFsKCkgJiYgaG9yaXpvbnRhbEFycm93cykgfHxcbiAgICAgICAgICAoIXRoaXMuX2lzSG9yaXpvbnRhbCgpICYmICFob3Jpem9udGFsQXJyb3dzKVxuICAgICAgICApIHtcbiAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgICAgY29uc3QgcHJldklzT3BlbiA9IGtleU1hbmFnZXIuYWN0aXZlSXRlbT8uaXNNZW51T3BlbigpO1xuICAgICAgICAgIGtleU1hbmFnZXIuYWN0aXZlSXRlbT8uZ2V0TWVudVRyaWdnZXIoKT8uY2xvc2VNZW51KCk7XG5cbiAgICAgICAgICBrZXlNYW5hZ2VyLnNldEZvY3VzT3JpZ2luKCdrZXlib2FyZCcpO1xuICAgICAgICAgIGtleU1hbmFnZXIub25LZXlkb3duKGV2ZW50KTtcbiAgICAgICAgICBpZiAocHJldklzT3Blbikge1xuICAgICAgICAgICAga2V5TWFuYWdlci5hY3RpdmVJdGVtPy5nZXRNZW51VHJpZ2dlcigpPy5vcGVuTWVudSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBFU0NBUEU6XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGtleU1hbmFnZXIuYWN0aXZlSXRlbT8uZ2V0TWVudVRyaWdnZXIoKT8uY2xvc2VNZW51KCk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIFRBQjpcbiAgICAgICAga2V5TWFuYWdlci5hY3RpdmVJdGVtPy5nZXRNZW51VHJpZ2dlcigpPy5jbG9zZU1lbnUoKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGtleU1hbmFnZXIub25LZXlkb3duKGV2ZW50KTtcbiAgICB9XG4gIH1cblxuICAvKiogU2V0dXAgdGhlIEZvY3VzS2V5TWFuYWdlciB3aXRoIHRoZSBjb3JyZWN0IG9yaWVudGF0aW9uIGZvciB0aGUgbWVudSBiYXIuICovXG4gIHByaXZhdGUgX3NldEtleU1hbmFnZXIoKSB7XG4gICAgdGhpcy5fa2V5TWFuYWdlciA9IG5ldyBGb2N1c0tleU1hbmFnZXIodGhpcy5fYWxsSXRlbXMpXG4gICAgICAud2l0aFdyYXAoKVxuICAgICAgLndpdGhUeXBlQWhlYWQoKVxuICAgICAgLndpdGhIb21lQW5kRW5kKCk7XG5cbiAgICBpZiAodGhpcy5faXNIb3Jpem9udGFsKCkpIHtcbiAgICAgIHRoaXMuX2tleU1hbmFnZXIud2l0aEhvcml6b250YWxPcmllbnRhdGlvbih0aGlzLl9kaXI/LnZhbHVlIHx8ICdsdHInKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fa2V5TWFuYWdlci53aXRoVmVydGljYWxPcmllbnRhdGlvbigpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgdGhlIEZvY3VzTW91c2VNYW5hZ2VyIGFuZCBlbnN1cmUgdGhhdCB3aGVuIG1vdXNlIGZvY3VzIGNoYW5nZXMgdGhlIGtleSBtYW5hZ2VyIGlzIHVwZGF0ZWRcbiAgICogd2l0aCB0aGUgbGF0ZXN0IG1lbnUgaXRlbSB1bmRlciBtb3VzZSBmb2N1cy5cbiAgICovXG4gIHByaXZhdGUgX3N1YnNjcmliZVRvTW91c2VNYW5hZ2VyKCkge1xuICAgIHRoaXMuX25nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgICB0aGlzLl9tb3VzZUZvY3VzQ2hhbmdlZCA9IGdldEl0ZW1Qb2ludGVyRW50cmllcyh0aGlzLl9hbGxJdGVtcyk7XG4gICAgICB0aGlzLl9tb3VzZUZvY3VzQ2hhbmdlZC5waXBlKHRha2VVbnRpbCh0aGlzLl9kZXN0cm95ZWQpKS5zdWJzY3JpYmUoaXRlbSA9PiB7XG4gICAgICAgIGlmICh0aGlzLl9oYXNPcGVuU3VibWVudSgpKSB7XG4gICAgICAgICAgdGhpcy5fa2V5TWFuYWdlci5zZXRBY3RpdmVJdGVtKGl0ZW0pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBTdWJzY3JpYmUgdG8gdGhlIE1lbnVTdGFjayBjbG9zZSBhbmQgZW1wdHkgb2JzZXJ2YWJsZXMuICovXG4gIHByaXZhdGUgX3N1YnNjcmliZVRvTWVudVN0YWNrKCkge1xuICAgIHRoaXMuX21lbnVTdGFjay5jbG9zZWRcbiAgICAgIC5waXBlKHRha2VVbnRpbCh0aGlzLl9kZXN0cm95ZWQpKVxuICAgICAgLnN1YnNjcmliZSgoaXRlbTogTWVudVN0YWNrSXRlbSkgPT4gdGhpcy5fY2xvc2VPcGVuTWVudShpdGVtKSk7XG5cbiAgICB0aGlzLl9tZW51U3RhY2suZW1wdGllZFxuICAgICAgLnBpcGUodGFrZVVudGlsKHRoaXMuX2Rlc3Ryb3llZCkpXG4gICAgICAuc3Vic2NyaWJlKChldmVudDogRm9jdXNOZXh0KSA9PiB0aGlzLl90b2dnbGVPcGVuTWVudShldmVudCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIENsb3NlIHRoZSBvcGVuIG1lbnUgaWYgdGhlIGN1cnJlbnQgYWN0aXZlIGl0ZW0gb3BlbmVkIHRoZSByZXF1ZXN0ZWQgTWVudVN0YWNrSXRlbS5cbiAgICogQHBhcmFtIGl0ZW0gdGhlIE1lbnVTdGFja0l0ZW0gcmVxdWVzdGVkIHRvIGJlIGNsb3NlZC5cbiAgICovXG4gIHByaXZhdGUgX2Nsb3NlT3Blbk1lbnUobWVudTogTWVudVN0YWNrSXRlbSkge1xuICAgIGNvbnN0IHRyaWdnZXIgPSB0aGlzLl9vcGVuSXRlbTtcbiAgICBjb25zdCBrZXlNYW5hZ2VyID0gdGhpcy5fa2V5TWFuYWdlcjtcbiAgICBpZiAobWVudSA9PT0gdHJpZ2dlcj8uZ2V0TWVudVRyaWdnZXIoKT8uZ2V0TWVudSgpKSB7XG4gICAgICB0cmlnZ2VyLmdldE1lbnVUcmlnZ2VyKCk/LmNsb3NlTWVudSgpO1xuICAgICAga2V5TWFuYWdlci5zZXRGb2N1c09yaWdpbigna2V5Ym9hcmQnKTtcbiAgICAgIGtleU1hbmFnZXIuc2V0QWN0aXZlSXRlbSh0cmlnZ2VyKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2V0IGZvY3VzIHRvIGVpdGhlciB0aGUgY3VycmVudCwgcHJldmlvdXMgb3IgbmV4dCBpdGVtIGJhc2VkIG9uIHRoZSBGb2N1c05leHQgZXZlbnQsIHRoZW5cbiAgICogb3BlbiB0aGUgcHJldmlvdXMgb3IgbmV4dCBpdGVtLlxuICAgKi9cbiAgcHJpdmF0ZSBfdG9nZ2xlT3Blbk1lbnUoZXZlbnQ6IEZvY3VzTmV4dCkge1xuICAgIGNvbnN0IGtleU1hbmFnZXIgPSB0aGlzLl9rZXlNYW5hZ2VyO1xuICAgIHN3aXRjaCAoZXZlbnQpIHtcbiAgICAgIGNhc2UgRm9jdXNOZXh0Lm5leHRJdGVtOlxuICAgICAgICBrZXlNYW5hZ2VyLnNldEZvY3VzT3JpZ2luKCdrZXlib2FyZCcpO1xuICAgICAgICBrZXlNYW5hZ2VyLnNldE5leHRJdGVtQWN0aXZlKCk7XG4gICAgICAgIGtleU1hbmFnZXIuYWN0aXZlSXRlbT8uZ2V0TWVudVRyaWdnZXIoKT8ub3Blbk1lbnUoKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgRm9jdXNOZXh0LnByZXZpb3VzSXRlbTpcbiAgICAgICAga2V5TWFuYWdlci5zZXRGb2N1c09yaWdpbigna2V5Ym9hcmQnKTtcbiAgICAgICAga2V5TWFuYWdlci5zZXRQcmV2aW91c0l0ZW1BY3RpdmUoKTtcbiAgICAgICAga2V5TWFuYWdlci5hY3RpdmVJdGVtPy5nZXRNZW51VHJpZ2dlcigpPy5vcGVuTWVudSgpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBGb2N1c05leHQuY3VycmVudEl0ZW06XG4gICAgICAgIGlmIChrZXlNYW5hZ2VyLmFjdGl2ZUl0ZW0pIHtcbiAgICAgICAgICBrZXlNYW5hZ2VyLnNldEZvY3VzT3JpZ2luKCdrZXlib2FyZCcpO1xuICAgICAgICAgIGtleU1hbmFnZXIuc2V0QWN0aXZlSXRlbShrZXlNYW5hZ2VyLmFjdGl2ZUl0ZW0pO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJuIHRydWUgaWYgdGhlIG1lbnUgYmFyIGlzIGNvbmZpZ3VyZWQgdG8gYmUgaG9yaXpvbnRhbC5cbiAgICovXG4gIHByaXZhdGUgX2lzSG9yaXpvbnRhbCgpIHtcbiAgICByZXR1cm4gdGhpcy5vcmllbnRhdGlvbiA9PT0gJ2hvcml6b250YWwnO1xuICB9XG5cbiAgLyoqXG4gICAqIFN1YnNjcmliZSB0byB0aGUgbWVudSB0cmlnZ2VyJ3Mgb3BlbiBldmVudHMgaW4gb3JkZXIgdG8gdHJhY2sgdGhlIHRyaWdnZXIgd2hpY2ggb3BlbmVkIHRoZSBtZW51XG4gICAqIGFuZCBzdG9wIHRyYWNraW5nIGl0IHdoZW4gdGhlIG1lbnUgaXMgY2xvc2VkLlxuICAgKi9cbiAgcHJpdmF0ZSBfc3Vic2NyaWJlVG9NZW51T3BlbigpIHtcbiAgICBjb25zdCBleGl0Q29uZGl0aW9uID0gbWVyZ2UodGhpcy5fYWxsSXRlbXMuY2hhbmdlcywgdGhpcy5fZGVzdHJveWVkKTtcbiAgICB0aGlzLl9hbGxJdGVtcy5jaGFuZ2VzXG4gICAgICAucGlwZShcbiAgICAgICAgc3RhcnRXaXRoKHRoaXMuX2FsbEl0ZW1zKSxcbiAgICAgICAgbWVyZ2VNYXAoKGxpc3Q6IFF1ZXJ5TGlzdDxDZGtNZW51SXRlbT4pID0+XG4gICAgICAgICAgbGlzdFxuICAgICAgICAgICAgLmZpbHRlcihpdGVtID0+IGl0ZW0uaGFzTWVudSgpKVxuICAgICAgICAgICAgLm1hcChpdGVtID0+IGl0ZW0uZ2V0TWVudVRyaWdnZXIoKSEub3BlbmVkLnBpcGUobWFwVG8oaXRlbSksIHRha2VVbnRpbChleGl0Q29uZGl0aW9uKSkpXG4gICAgICAgICksXG4gICAgICAgIG1lcmdlQWxsKCksXG4gICAgICAgIHN3aXRjaE1hcCgoaXRlbTogQ2RrTWVudUl0ZW0pID0+IHtcbiAgICAgICAgICB0aGlzLl9vcGVuSXRlbSA9IGl0ZW07XG4gICAgICAgICAgcmV0dXJuIGl0ZW0uZ2V0TWVudVRyaWdnZXIoKSEuY2xvc2VkO1xuICAgICAgICB9KSxcbiAgICAgICAgdGFrZVVudGlsKHRoaXMuX2Rlc3Ryb3llZClcbiAgICAgIClcbiAgICAgIC5zdWJzY3JpYmUoKCkgPT4gKHRoaXMuX29wZW5JdGVtID0gdW5kZWZpbmVkKSk7XG4gIH1cblxuICAvKiogUmV0dXJuIHRydWUgaWYgdGhlIE1lbnVCYXIgaGFzIGFuIG9wZW4gc3VibWVudS4gKi9cbiAgcHJpdmF0ZSBfaGFzT3BlblN1Ym1lbnUoKSB7XG4gICAgcmV0dXJuICEhdGhpcy5fb3Blbkl0ZW07XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICBzdXBlci5uZ09uRGVzdHJveSgpO1xuICAgIHRoaXMuX2Rlc3Ryb3llZC5uZXh0KCk7XG4gICAgdGhpcy5fZGVzdHJveWVkLmNvbXBsZXRlKCk7XG4gIH1cbn1cbiJdfQ==