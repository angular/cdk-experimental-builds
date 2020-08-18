/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, Input, Output, EventEmitter, ElementRef, ViewContainerRef, Inject, Optional, isDevMode, } from '@angular/core';
import { Directionality } from '@angular/cdk/bidi';
import { TemplatePortal } from '@angular/cdk/portal';
import { Overlay, OverlayConfig, } from '@angular/cdk/overlay';
import { SPACE, ENTER, RIGHT_ARROW, LEFT_ARROW, DOWN_ARROW, UP_ARROW } from '@angular/cdk/keycodes';
import { CDK_MENU } from './menu-interface';
import { throwExistingMenuStackError } from './menu-errors';
/**
 * A directive to be combined with CdkMenuItem which opens the Menu it is bound to. If the
 * element is in a top level MenuBar it will open the menu on click, or if a sibling is already
 * opened it will open on hover. If it is inside of a Menu it will open the attached Submenu on
 * hover regardless of its sibling state.
 *
 * The directive must be placed along with the `cdkMenuItem` directive in order to enable full
 * functionality.
 */
export class CdkMenuItemTrigger {
    constructor(_elementRef, _viewContainerRef, _overlay, _parentMenu, _directionality) {
        this._elementRef = _elementRef;
        this._viewContainerRef = _viewContainerRef;
        this._overlay = _overlay;
        this._parentMenu = _parentMenu;
        this._directionality = _directionality;
        /** Emits when the attached menu is requested to open */
        this.opened = new EventEmitter();
        /** Emits when the attached menu is requested to close */
        this.closed = new EventEmitter();
        /** A reference to the overlay which manages the triggered menu */
        this._overlayRef = null;
    }
    /** Template reference variable to the menu this trigger opens */
    get menuPanel() {
        return this._menuPanel;
    }
    set menuPanel(panel) {
        // If the provided panel already has a stack, that means it already has a trigger configured.
        // Note however that there are some edge cases where two triggers **may** share the same menu,
        // e.g. two triggers in two separate menus.
        // TODO refactor once https://github.com/angular/components/pull/20146 lands
        if (isDevMode() && (panel === null || panel === void 0 ? void 0 : panel._menuStack)) {
            throwExistingMenuStackError();
        }
        this._menuPanel = panel;
        if (this._menuPanel) {
            this._menuPanel._menuStack = this._getMenuStack();
        }
    }
    /** Open/close the attached menu if the trigger has been configured with one */
    toggle() {
        if (this.hasMenu()) {
            this.isMenuOpen() ? this.closeMenu() : this.openMenu();
        }
    }
    /** Open the attached menu. */
    openMenu() {
        if (!this.isMenuOpen()) {
            this.opened.next();
            this._overlayRef = this._overlayRef || this._overlay.create(this._getOverlayConfig());
            this._overlayRef.attach(this._getPortal());
        }
    }
    /** Close the opened menu. */
    closeMenu() {
        if (this.isMenuOpen()) {
            this.closed.next();
            this._overlayRef.detach();
        }
        this._closeSiblingTriggers();
    }
    /** Return true if the trigger has an attached menu */
    hasMenu() {
        return !!this.menuPanel;
    }
    /** Whether the menu this button is a trigger for is open */
    isMenuOpen() {
        return this._overlayRef ? this._overlayRef.hasAttached() : false;
    }
    /**
     * Get a reference to the rendered Menu if the Menu is open and it is visible in the DOM.
     * @return the menu if it is open, otherwise undefined.
     */
    getMenu() {
        var _a;
        return (_a = this.menuPanel) === null || _a === void 0 ? void 0 : _a._menu;
    }
    /**
     * If there are existing open menus and this menu is not open, close sibling menus and open
     * this one.
     */
    _toggleOnMouseEnter() {
        const menuStack = this._getMenuStack();
        const isSiblingMenuOpen = !(menuStack === null || menuStack === void 0 ? void 0 : menuStack.isEmpty()) && !this.isMenuOpen();
        if (isSiblingMenuOpen) {
            this._closeSiblingTriggers();
            this.openMenu();
        }
    }
    /**
     * Handles keyboard events for the menu item, specifically opening/closing the attached menu and
     * focusing the appropriate submenu item.
     * @param event the keyboard event to handle
     */
    _toggleOnKeydown(event) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
        const keyCode = event.keyCode;
        switch (keyCode) {
            case SPACE:
            case ENTER:
                event.preventDefault();
                this.toggle();
                (_b = (_a = this.menuPanel) === null || _a === void 0 ? void 0 : _a._menu) === null || _b === void 0 ? void 0 : _b.focusFirstItem('keyboard');
                break;
            case RIGHT_ARROW:
                if (this._isParentVertical()) {
                    event.preventDefault();
                    if (((_c = this._directionality) === null || _c === void 0 ? void 0 : _c.value) === 'rtl') {
                        (_d = this._getMenuStack()) === null || _d === void 0 ? void 0 : _d.close(this._parentMenu, 2 /* currentItem */);
                    }
                    else {
                        this.openMenu();
                        (_f = (_e = this.menuPanel) === null || _e === void 0 ? void 0 : _e._menu) === null || _f === void 0 ? void 0 : _f.focusFirstItem('keyboard');
                    }
                }
                break;
            case LEFT_ARROW:
                if (this._isParentVertical()) {
                    event.preventDefault();
                    if (((_g = this._directionality) === null || _g === void 0 ? void 0 : _g.value) === 'rtl') {
                        this.openMenu();
                        (_j = (_h = this.menuPanel) === null || _h === void 0 ? void 0 : _h._menu) === null || _j === void 0 ? void 0 : _j.focusFirstItem('keyboard');
                    }
                    else {
                        (_k = this._getMenuStack()) === null || _k === void 0 ? void 0 : _k.close(this._parentMenu, 2 /* currentItem */);
                    }
                }
                break;
            case DOWN_ARROW:
            case UP_ARROW:
                if (!this._isParentVertical()) {
                    event.preventDefault();
                    this.openMenu();
                    keyCode === DOWN_ARROW
                        ? (_m = (_l = this.menuPanel) === null || _l === void 0 ? void 0 : _l._menu) === null || _m === void 0 ? void 0 : _m.focusFirstItem('keyboard') : (_p = (_o = this.menuPanel) === null || _o === void 0 ? void 0 : _o._menu) === null || _p === void 0 ? void 0 : _p.focusLastItem('keyboard');
                }
                break;
        }
    }
    /** Close out any sibling menu trigger menus. */
    _closeSiblingTriggers() {
        const menuStack = this._getMenuStack();
        // If nothing was removed from the stack and the last element is not the parent item
        // that means that the parent menu is a menu bar since we don't put the menu bar on the
        // stack
        const isParentMenuBar = !(menuStack === null || menuStack === void 0 ? void 0 : menuStack.closeSubMenuOf(this._parentMenu)) && (menuStack === null || menuStack === void 0 ? void 0 : menuStack.peek()) !== this._parentMenu;
        if (isParentMenuBar) {
            menuStack === null || menuStack === void 0 ? void 0 : menuStack.closeAll();
        }
    }
    /** Get the configuration object used to create the overlay */
    _getOverlayConfig() {
        return new OverlayConfig({
            positionStrategy: this._getOverlayPositionStrategy(),
            scrollStrategy: this._overlay.scrollStrategies.block(),
            direction: this._directionality,
        });
    }
    /** Build the position strategy for the overlay which specifies where to place the menu */
    _getOverlayPositionStrategy() {
        return this._overlay
            .position()
            .flexibleConnectedTo(this._elementRef)
            .withPositions(this._getOverlayPositions());
    }
    /** Determine and return where to position the opened menu relative to the menu item */
    _getOverlayPositions() {
        // TODO: use a common positioning config from (possibly) cdk/overlay
        return this._parentMenu.orientation === 'horizontal'
            ? [
                { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' },
                { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom' },
                { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top' },
                { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom' },
            ]
            : [
                { originX: 'end', originY: 'top', overlayX: 'start', overlayY: 'top' },
                { originX: 'end', originY: 'bottom', overlayX: 'start', overlayY: 'bottom' },
                { originX: 'start', originY: 'top', overlayX: 'end', overlayY: 'top' },
                { originX: 'start', originY: 'bottom', overlayX: 'end', overlayY: 'bottom' },
            ];
    }
    /**
     * Get the portal to be attached to the overlay which contains the menu. Allows for the menu
     * content to change dynamically and be reflected in the application.
     */
    _getPortal() {
        var _a, _b;
        const hasMenuContentChanged = ((_a = this.menuPanel) === null || _a === void 0 ? void 0 : _a._templateRef) !== ((_b = this._panelContent) === null || _b === void 0 ? void 0 : _b.templateRef);
        if (this.menuPanel && (!this._panelContent || hasMenuContentChanged)) {
            this._panelContent = new TemplatePortal(this.menuPanel._templateRef, this._viewContainerRef);
        }
        return this._panelContent;
    }
    /**
     * @return true if if the enclosing parent menu is configured in a vertical orientation.
     */
    _isParentVertical() {
        return this._parentMenu.orientation === 'vertical';
    }
    /** Get the menu stack from the parent. */
    _getMenuStack() {
        // We use a function since at the construction of the MenuItemTrigger the parent Menu won't have
        // its menu stack set. Therefore we need to reference the menu stack from the parent each time
        // we want to use it.
        return this._parentMenu._menuStack;
    }
    ngOnDestroy() {
        this._destroyOverlay();
        this._resetPanelMenuStack();
    }
    /** Set the menu panels menu stack back to null. */
    _resetPanelMenuStack() {
        // If a CdkMenuTrigger is placed in a submenu, each time the trigger is rendered (its parent
        // menu is opened) the panel setter for CdkMenuPanel is called. From the first render onward,
        // the attached CdkMenuPanel has the MenuStack set. Since we throw an error if a panel already
        // has a stack set, we want to reset the attached stack here to prevent the error from being
        // thrown if the trigger re-configures its attached panel (in the case where there is a 1:1
        // relationship between the panel and trigger).
        if (this._menuPanel) {
            this._menuPanel._menuStack = null;
        }
    }
    /** Destroy and unset the overlay reference it if exists */
    _destroyOverlay() {
        if (this._overlayRef) {
            this._overlayRef.dispose();
            this._overlayRef = null;
        }
    }
}
CdkMenuItemTrigger.decorators = [
    { type: Directive, args: [{
                selector: '[cdkMenuTriggerFor]',
                exportAs: 'cdkMenuTriggerFor',
                host: {
                    '(keydown)': '_toggleOnKeydown($event)',
                    '(mouseenter)': '_toggleOnMouseEnter()',
                    '(click)': 'toggle()',
                    'tabindex': '-1',
                    'aria-haspopup': 'menu',
                    '[attr.aria-expanded]': 'isMenuOpen()',
                },
            },] }
];
CdkMenuItemTrigger.ctorParameters = () => [
    { type: ElementRef },
    { type: ViewContainerRef },
    { type: Overlay },
    { type: undefined, decorators: [{ type: Inject, args: [CDK_MENU,] }] },
    { type: Directionality, decorators: [{ type: Optional }] }
];
CdkMenuItemTrigger.propDecorators = {
    menuPanel: [{ type: Input, args: ['cdkMenuTriggerFor',] }],
    opened: [{ type: Output, args: ['cdkMenuOpened',] }],
    closed: [{ type: Output, args: ['cdkMenuClosed',] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1pdGVtLXRyaWdnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrLWV4cGVyaW1lbnRhbC9tZW51L21lbnUtaXRlbS10cmlnZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFDTCxTQUFTLEVBQ1QsS0FBSyxFQUNMLE1BQU0sRUFDTixZQUFZLEVBQ1osVUFBVSxFQUNWLGdCQUFnQixFQUNoQixNQUFNLEVBRU4sUUFBUSxFQUNSLFNBQVMsR0FDVixNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDakQsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQ25ELE9BQU8sRUFFTCxPQUFPLEVBQ1AsYUFBYSxHQUdkLE1BQU0sc0JBQXNCLENBQUM7QUFDOUIsT0FBTyxFQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFFbEcsT0FBTyxFQUFPLFFBQVEsRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBRWhELE9BQU8sRUFBQywyQkFBMkIsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUUxRDs7Ozs7Ozs7R0FRRztBQWFILE1BQU0sT0FBTyxrQkFBa0I7SUFvQzdCLFlBQ21CLFdBQW9DLEVBQ2xDLGlCQUFtQyxFQUNyQyxRQUFpQixFQUNDLFdBQWlCLEVBQ3ZCLGVBQWdDO1FBSjVDLGdCQUFXLEdBQVgsV0FBVyxDQUF5QjtRQUNsQyxzQkFBaUIsR0FBakIsaUJBQWlCLENBQWtCO1FBQ3JDLGFBQVEsR0FBUixRQUFRLENBQVM7UUFDQyxnQkFBVyxHQUFYLFdBQVcsQ0FBTTtRQUN2QixvQkFBZSxHQUFmLGVBQWUsQ0FBaUI7UUFqQi9ELHdEQUF3RDtRQUN0QixXQUFNLEdBQXVCLElBQUks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QUFVLEdBQUcsSUFBSSxDQUFDO1NBQ25DO0lBQ0gsQ0FBQztJQUVELDJEQUEyRDtJQUNuRCxlQUFlO1FBQ3JCLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRTtZQUNwQixJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQzNCLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO1NBQ3pCO0lBQ0gsQ0FBQzs7O1lBNVFGLFNBQVMsU0FBQztnQkFDVCxRQUFRLEVBQUUscUJBQXFCO2dCQUMvQixRQUFRLEVBQUUsbUJBQW1CO2dCQUM3QixJQUFJLEVBQUU7b0JBQ0osV0FBVyxFQUFFLDBCQUEwQjtvQkFDdkMsY0FBYyxFQUFFLHVCQUF1QjtvQkFDdkMsU0FBUyxFQUFFLFVBQVU7b0JBQ3JCLFVBQVUsRUFBRSxJQUFJO29CQUNoQixlQUFlLEVBQUUsTUFBTTtvQkFDdkIsc0JBQXNCLEVBQUUsY0FBYztpQkFDdkM7YUFDRjs7O1lBMUNDLFVBQVU7WUFDVixnQkFBZ0I7WUFVaEIsT0FBTzs0Q0F3RUosTUFBTSxTQUFDLFFBQVE7WUE1RVosY0FBYyx1QkE2RWpCLFFBQVE7Ozt3QkF2Q1YsS0FBSyxTQUFDLG1CQUFtQjtxQkF1QnpCLE1BQU0sU0FBQyxlQUFlO3FCQUd0QixNQUFNLFNBQUMsZUFBZSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1xuICBEaXJlY3RpdmUsXG4gIElucHV0LFxuICBPdXRwdXQsXG4gIEV2ZW50RW1pdHRlcixcbiAgRWxlbWVudFJlZixcbiAgVmlld0NvbnRhaW5lclJlZixcbiAgSW5qZWN0LFxuICBPbkRlc3Ryb3ksXG4gIE9wdGlvbmFsLFxuICBpc0Rldk1vZGUsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtEaXJlY3Rpb25hbGl0eX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2JpZGknO1xuaW1wb3J0IHtUZW1wbGF0ZVBvcnRhbH0gZnJvbSAnQGFuZ3VsYXIvY2RrL3BvcnRhbCc7XG5pbXBvcnQge1xuICBPdmVybGF5UmVmLFxuICBPdmVybGF5LFxuICBPdmVybGF5Q29uZmlnLFxuICBDb25uZWN0ZWRQb3NpdGlvbixcbiAgRmxleGlibGVDb25uZWN0ZWRQb3NpdGlvblN0cmF0ZWd5LFxufSBmcm9tICdAYW5ndWxhci9jZGsvb3ZlcmxheSc7XG5pbXBvcnQge1NQQUNFLCBFTlRFUiwgUklHSFRfQVJST1csIExFRlRfQVJST1csIERPV05fQVJST1csIFVQX0FSUk9XfSBmcm9tICdAYW5ndWxhci9jZGsva2V5Y29kZXMnO1xuaW1wb3J0IHtDZGtNZW51UGFuZWx9IGZyb20gJy4vbWVudS1wYW5lbCc7XG5pbXBvcnQge01lbnUsIENES19NRU5VfSBmcm9tICcuL21lbnUtaW50ZXJmYWNlJztcbmltcG9ydCB7Rm9jdXNOZXh0fSBmcm9tICcuL21lbnUtc3RhY2snO1xuaW1wb3J0IHt0aHJvd0V4aXN0aW5nTWVudVN0YWNrRXJyb3J9IGZyb20gJy4vbWVudS1lcnJvcnMnO1xuXG4vKipcbiAqIEEgZGlyZWN0aXZlIHRvIGJlIGNvbWJpbmVkIHdpdGggQ2RrTWVudUl0ZW0gd2hpY2ggb3BlbnMgdGhlIE1lbnUgaXQgaXMgYm91bmQgdG8uIElmIHRoZVxuICogZWxlbWVudCBpcyBpbiBhIHRvcCBsZXZlbCBNZW51QmFyIGl0IHdpbGwgb3BlbiB0aGUgbWVudSBvbiBjbGljaywgb3IgaWYgYSBzaWJsaW5nIGlzIGFscmVhZHlcbiAqIG9wZW5lZCBpdCB3aWxsIG9wZW4gb24gaG92ZXIuIElmIGl0IGlzIGluc2lkZSBvZiBhIE1lbnUgaXQgd2lsbCBvcGVuIHRoZSBhdHRhY2hlZCBTdWJtZW51IG9uXG4gKiBob3ZlciByZWdhcmRsZXNzIG9mIGl0cyBzaWJsaW5nIHN0YXRlLlxuICpcbiAqIFRoZSBkaXJlY3RpdmUgbXVzdCBiZSBwbGFjZWQgYWxvbmcgd2l0aCB0aGUgYGNka01lbnVJdGVtYCBkaXJlY3RpdmUgaW4gb3JkZXIgdG8gZW5hYmxlIGZ1bGxcbiAqIGZ1bmN0aW9uYWxpdHkuXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tjZGtNZW51VHJpZ2dlckZvcl0nLFxuICBleHBvcnRBczogJ2Nka01lbnVUcmlnZ2VyRm9yJyxcbiAgaG9zdDoge1xuICAgICcoa2V5ZG93biknOiAnX3RvZ2dsZU9uS2V5ZG93bigkZXZlbnQpJyxcbiAgICAnKG1vdXNlZW50ZXIpJzogJ190b2dnbGVPbk1vdXNlRW50ZXIoKScsXG4gICAgJyhjbGljayknOiAndG9nZ2xlKCknLFxuICAgICd0YWJpbmRleCc6ICctMScsXG4gICAgJ2FyaWEtaGFzcG9wdXAnOiAnbWVudScsXG4gICAgJ1thdHRyLmFyaWEtZXhwYW5kZWRdJzogJ2lzTWVudU9wZW4oKScsXG4gIH0sXG59KVxuZXhwb3J0IGNsYXNzIENka01lbnVJdGVtVHJpZ2dlciBpbXBsZW1lbnRzIE9uRGVzdHJveSB7XG4gIC8qKiBUZW1wbGF0ZSByZWZlcmVuY2UgdmFyaWFibGUgdG8gdGhlIG1lbnUgdGhpcyB0cmlnZ2VyIG9wZW5zICovXG4gIEBJbnB1dCgnY2RrTWVudVRyaWdnZXJGb3InKVxuICBnZXQgbWVudVBhbmVsKCk6IENka01lbnVQYW5lbCB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIHRoaXMuX21lbnVQYW5lbDtcbiAgfVxuICBzZXQgbWVudVBhbmVsKHBhbmVsOiBDZGtNZW51UGFuZWwgfCB1bmRlZmluZWQpIHtcbiAgICAvLyBJZiB0aGUgcHJvdmlkZWQgcGFuZWwgYWxyZWFkeSBoYXMgYSBzdGFjaywgdGhhdCBtZWFucyBpdCBhbHJlYWR5IGhhcyBhIHRyaWdnZXIgY29uZmlndXJlZC5cbiAgICAvLyBOb3RlIGhvd2V2ZXIgdGhhdCB0aGVyZSBhcmUgc29tZSBlZGdlIGNhc2VzIHdoZXJlIHR3byB0cmlnZ2VycyAqKm1heSoqIHNoYXJlIHRoZSBzYW1lIG1lbnUsXG4gICAgLy8gZS5nLiB0d28gdHJpZ2dlcnMgaW4gdHdvIHNlcGFyYXRlIG1lbnVzLlxuICAgIC8vIFRPRE8gcmVmYWN0b3Igb25jZSBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9jb21wb25lbnRzL3B1bGwvMjAxNDYgbGFuZHNcbiAgICBpZiAoaXNEZXZNb2RlKCkgJiYgcGFuZWw/Ll9tZW51U3RhY2spIHtcbiAgICAgIHRocm93RXhpc3RpbmdNZW51U3RhY2tFcnJvcigpO1xuICAgIH1cblxuICAgIHRoaXMuX21lbnVQYW5lbCA9IHBhbmVsO1xuICAgIGlmICh0aGlzLl9tZW51UGFuZWwpIHtcbiAgICAgIHRoaXMuX21lbnVQYW5lbC5fbWVudVN0YWNrID0gdGhpcy5fZ2V0TWVudVN0YWNrKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFJlZmVyZW5jZSB0byB0aGUgTWVudVBhbmVsIHRoaXMgdHJpZ2dlciB0b2dnbGVzLiAqL1xuICBwcml2YXRlIF9tZW51UGFuZWw/OiBDZGtNZW51UGFuZWw7XG5cbiAgLyoqIEVtaXRzIHdoZW4gdGhlIGF0dGFjaGVkIG1lbnUgaXMgcmVxdWVzdGVkIHRvIG9wZW4gKi9cbiAgQE91dHB1dCgnY2RrTWVudU9wZW5lZCcpIHJlYWRvbmx5IG9wZW5lZDogRXZlbnRFbWl0dGVyPHZvaWQ+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4gIC8qKiBFbWl0cyB3aGVuIHRoZSBhdHRhY2hlZCBtZW51IGlzIHJlcXVlc3RlZCB0byBjbG9zZSAqL1xuICBAT3V0cHV0KCdjZGtNZW51Q2xvc2VkJykgcmVhZG9ubHkgY2xvc2VkOiBFdmVudEVtaXR0ZXI8dm9pZD4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG5cbiAgLyoqIEEgcmVmZXJlbmNlIHRvIHRoZSBvdmVybGF5IHdoaWNoIG1hbmFnZXMgdGhlIHRyaWdnZXJlZCBtZW51ICovXG4gIHByaXZhdGUgX292ZXJsYXlSZWY6IE92ZXJsYXlSZWYgfCBudWxsID0gbnVsbDtcblxuICAvKiogVGhlIGNvbnRlbnQgb2YgdGhlIG1lbnUgcGFuZWwgb3BlbmVkIGJ5IHRoaXMgdHJpZ2dlci4gKi9cbiAgcHJpdmF0ZSBfcGFuZWxDb250ZW50OiBUZW1wbGF0ZVBvcnRhbDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIHJlYWRvbmx5IF9lbGVtZW50UmVmOiBFbGVtZW50UmVmPEhUTUxFbGVtZW50PixcbiAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgX3ZpZXdDb250YWluZXJSZWY6IFZpZXdDb250YWluZXJSZWYsXG4gICAgcHJpdmF0ZSByZWFkb25seSBfb3ZlcmxheTogT3ZlcmxheSxcbiAgICBASW5qZWN0KENES19NRU5VKSBwcml2YXRlIHJlYWRvbmx5IF9wYXJlbnRNZW51OiBNZW51LFxuICAgIEBPcHRpb25hbCgpIHByaXZhdGUgcmVhZG9ubHkgX2RpcmVjdGlvbmFsaXR5PzogRGlyZWN0aW9uYWxpdHlcbiAgKSB7fVxuXG4gIC8qKiBPcGVuL2Nsb3NlIHRoZSBhdHRhY2hlZCBtZW51IGlmIHRoZSB0cmlnZ2VyIGhhcyBiZWVuIGNvbmZpZ3VyZWQgd2l0aCBvbmUgKi9cbiAgdG9nZ2xlKCkge1xuICAgIGlmICh0aGlzLmhhc01lbnUoKSkge1xuICAgICAgdGhpcy5pc01lbnVPcGVuKCkgPyB0aGlzLmNsb3NlTWVudSgpIDogdGhpcy5vcGVuTWVudSgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBPcGVuIHRoZSBhdHRhY2hlZCBtZW51LiAqL1xuICBvcGVuTWVudSgpIHtcbiAgICBpZiAoIXRoaXMuaXNNZW51T3BlbigpKSB7XG4gICAgICB0aGlzLm9wZW5lZC5uZXh0KCk7XG5cbiAgICAgIHRoaXMuX292ZXJsYXlSZWYgPSB0aGlzLl9vdmVybGF5UmVmIHx8IHRoaXMuX292ZXJsYXkuY3JlYXRlKHRoaXMuX2dldE92ZXJsYXlDb25maWcoKSk7XG4gICAgICB0aGlzLl9vdmVybGF5UmVmLmF0dGFjaCh0aGlzLl9nZXRQb3J0YWwoKSk7XG4gICAgfVxuICB9XG5cbiAgLyoqIENsb3NlIHRoZSBvcGVuZWQgbWVudS4gKi9cbiAgY2xvc2VNZW51KCkge1xuICAgIGlmICh0aGlzLmlzTWVudU9wZW4oKSkge1xuICAgICAgdGhpcy5jbG9zZWQubmV4dCgpO1xuXG4gICAgICB0aGlzLl9vdmVybGF5UmVmIS5kZXRhY2goKTtcbiAgICB9XG4gICAgdGhpcy5fY2xvc2VTaWJsaW5nVHJpZ2dlcnMoKTtcbiAgfVxuXG4gIC8qKiBSZXR1cm4gdHJ1ZSBpZiB0aGUgdHJpZ2dlciBoYXMgYW4gYXR0YWNoZWQgbWVudSAqL1xuICBoYXNNZW51KCkge1xuICAgIHJldHVybiAhIXRoaXMubWVudVBhbmVsO1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhlIG1lbnUgdGhpcyBidXR0b24gaXMgYSB0cmlnZ2VyIGZvciBpcyBvcGVuICovXG4gIGlzTWVudU9wZW4oKSB7XG4gICAgcmV0dXJuIHRoaXMuX292ZXJsYXlSZWYgPyB0aGlzLl9vdmVybGF5UmVmLmhhc0F0dGFjaGVkKCkgOiBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYSByZWZlcmVuY2UgdG8gdGhlIHJlbmRlcmVkIE1lbnUgaWYgdGhlIE1lbnUgaXMgb3BlbiBhbmQgaXQgaXMgdmlzaWJsZSBpbiB0aGUgRE9NLlxuICAgKiBAcmV0dXJuIHRoZSBtZW51IGlmIGl0IGlzIG9wZW4sIG90aGVyd2lzZSB1bmRlZmluZWQuXG4gICAqL1xuICBnZXRNZW51KCk6IE1lbnUgfCB1bmRlZmluZWQge1xuICAgIHJldHVybiB0aGlzLm1lbnVQYW5lbD8uX21lbnU7XG4gIH1cblxuICAvKipcbiAgICogSWYgdGhlcmUgYXJlIGV4aXN0aW5nIG9wZW4gbWVudXMgYW5kIHRoaXMgbWVudSBpcyBub3Qgb3BlbiwgY2xvc2Ugc2libGluZyBtZW51cyBhbmQgb3BlblxuICAgKiB0aGlzIG9uZS5cbiAgICovXG4gIF90b2dnbGVPbk1vdXNlRW50ZXIoKSB7XG4gICAgY29uc3QgbWVudVN0YWNrID0gdGhpcy5fZ2V0TWVudVN0YWNrKCk7XG4gICAgY29uc3QgaXNTaWJsaW5nTWVudU9wZW4gPSAhbWVudVN0YWNrPy5pc0VtcHR5KCkgJiYgIXRoaXMuaXNNZW51T3BlbigpO1xuICAgIGlmIChpc1NpYmxpbmdNZW51T3Blbikge1xuICAgICAgdGhpcy5fY2xvc2VTaWJsaW5nVHJpZ2dlcnMoKTtcbiAgICAgIHRoaXMub3Blbk1lbnUoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlcyBrZXlib2FyZCBldmVudHMgZm9yIHRoZSBtZW51IGl0ZW0sIHNwZWNpZmljYWxseSBvcGVuaW5nL2Nsb3NpbmcgdGhlIGF0dGFjaGVkIG1lbnUgYW5kXG4gICAqIGZvY3VzaW5nIHRoZSBhcHByb3ByaWF0ZSBzdWJtZW51IGl0ZW0uXG4gICAqIEBwYXJhbSBldmVudCB0aGUga2V5Ym9hcmQgZXZlbnQgdG8gaGFuZGxlXG4gICAqL1xuICBfdG9nZ2xlT25LZXlkb3duKGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XG4gICAgY29uc3Qga2V5Q29kZSA9IGV2ZW50LmtleUNvZGU7XG4gICAgc3dpdGNoIChrZXlDb2RlKSB7XG4gICAgICBjYXNlIFNQQUNFOlxuICAgICAgY2FzZSBFTlRFUjpcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdGhpcy50b2dnbGUoKTtcbiAgICAgICAgdGhpcy5tZW51UGFuZWw/Ll9tZW51Py5mb2N1c0ZpcnN0SXRlbSgna2V5Ym9hcmQnKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgUklHSFRfQVJST1c6XG4gICAgICAgIGlmICh0aGlzLl9pc1BhcmVudFZlcnRpY2FsKCkpIHtcbiAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgIGlmICh0aGlzLl9kaXJlY3Rpb25hbGl0eT8udmFsdWUgPT09ICdydGwnKSB7XG4gICAgICAgICAgICB0aGlzLl9nZXRNZW51U3RhY2soKT8uY2xvc2UodGhpcy5fcGFyZW50TWVudSwgRm9jdXNOZXh0LmN1cnJlbnRJdGVtKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5vcGVuTWVudSgpO1xuICAgICAgICAgICAgdGhpcy5tZW51UGFuZWw/Ll9tZW51Py5mb2N1c0ZpcnN0SXRlbSgna2V5Ym9hcmQnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgTEVGVF9BUlJPVzpcbiAgICAgICAgaWYgKHRoaXMuX2lzUGFyZW50VmVydGljYWwoKSkge1xuICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgaWYgKHRoaXMuX2RpcmVjdGlvbmFsaXR5Py52YWx1ZSA9PT0gJ3J0bCcpIHtcbiAgICAgICAgICAgIHRoaXMub3Blbk1lbnUoKTtcbiAgICAgICAgICAgIHRoaXMubWVudVBhbmVsPy5fbWVudT8uZm9jdXNGaXJzdEl0ZW0oJ2tleWJvYXJkJyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX2dldE1lbnVTdGFjaygpPy5jbG9zZSh0aGlzLl9wYXJlbnRNZW51LCBGb2N1c05leHQuY3VycmVudEl0ZW0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBET1dOX0FSUk9XOlxuICAgICAgY2FzZSBVUF9BUlJPVzpcbiAgICAgICAgaWYgKCF0aGlzLl9pc1BhcmVudFZlcnRpY2FsKCkpIHtcbiAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgIHRoaXMub3Blbk1lbnUoKTtcbiAgICAgICAgICBrZXlDb2RlID09PSBET1dOX0FSUk9XXG4gICAgICAgICAgICA/IHRoaXMubWVudVBhbmVsPy5fbWVudT8uZm9jdXNGaXJzdEl0ZW0oJ2tleWJvYXJkJylcbiAgICAgICAgICAgIDogdGhpcy5tZW51UGFuZWw/Ll9tZW51Py5mb2N1c0xhc3RJdGVtKCdrZXlib2FyZCcpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBDbG9zZSBvdXQgYW55IHNpYmxpbmcgbWVudSB0cmlnZ2VyIG1lbnVzLiAqL1xuICBwcml2YXRlIF9jbG9zZVNpYmxpbmdUcmlnZ2VycygpIHtcbiAgICBjb25zdCBtZW51U3RhY2sgPSB0aGlzLl9nZXRNZW51U3RhY2soKTtcblxuICAgIC8vIElmIG5vdGhpbmcgd2FzIHJlbW92ZWQgZnJvbSB0aGUgc3RhY2sgYW5kIHRoZSBsYXN0IGVsZW1lbnQgaXMgbm90IHRoZSBwYXJlbnQgaXRlbVxuICAgIC8vIHRoYXQgbWVhbnMgdGhhdCB0aGUgcGFyZW50IG1lbnUgaXMgYSBtZW51IGJhciBzaW5jZSB3ZSBkb24ndCBwdXQgdGhlIG1lbnUgYmFyIG9uIHRoZVxuICAgIC8vIHN0YWNrXG4gICAgY29uc3QgaXNQYXJlbnRNZW51QmFyID1cbiAgICAgICFtZW51U3RhY2s/LmNsb3NlU3ViTWVudU9mKHRoaXMuX3BhcmVudE1lbnUpICYmIG1lbnVTdGFjaz8ucGVlaygpICE9PSB0aGlzLl9wYXJlbnRNZW51O1xuXG4gICAgaWYgKGlzUGFyZW50TWVudUJhcikge1xuICAgICAgbWVudVN0YWNrPy5jbG9zZUFsbCgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBHZXQgdGhlIGNvbmZpZ3VyYXRpb24gb2JqZWN0IHVzZWQgdG8gY3JlYXRlIHRoZSBvdmVybGF5ICovXG4gIHByaXZhdGUgX2dldE92ZXJsYXlDb25maWcoKSB7XG4gICAgcmV0dXJuIG5ldyBPdmVybGF5Q29uZmlnKHtcbiAgICAgIHBvc2l0aW9uU3RyYXRlZ3k6IHRoaXMuX2dldE92ZXJsYXlQb3NpdGlvblN0cmF0ZWd5KCksXG4gICAgICBzY3JvbGxTdHJhdGVneTogdGhpcy5fb3ZlcmxheS5zY3JvbGxTdHJhdGVnaWVzLmJsb2NrKCksXG4gICAgICBkaXJlY3Rpb246IHRoaXMuX2RpcmVjdGlvbmFsaXR5LFxuICAgIH0pO1xuICB9XG5cbiAgLyoqIEJ1aWxkIHRoZSBwb3NpdGlvbiBzdHJhdGVneSBmb3IgdGhlIG92ZXJsYXkgd2hpY2ggc3BlY2lmaWVzIHdoZXJlIHRvIHBsYWNlIHRoZSBtZW51ICovXG4gIHByaXZhdGUgX2dldE92ZXJsYXlQb3NpdGlvblN0cmF0ZWd5KCk6IEZsZXhpYmxlQ29ubmVjdGVkUG9zaXRpb25TdHJhdGVneSB7XG4gICAgcmV0dXJuIHRoaXMuX292ZXJsYXlcbiAgICAgIC5wb3NpdGlvbigpXG4gICAgICAuZmxleGlibGVDb25uZWN0ZWRUbyh0aGlzLl9lbGVtZW50UmVmKVxuICAgICAgLndpdGhQb3NpdGlvbnModGhpcy5fZ2V0T3ZlcmxheVBvc2l0aW9ucygpKTtcbiAgfVxuXG4gIC8qKiBEZXRlcm1pbmUgYW5kIHJldHVybiB3aGVyZSB0byBwb3NpdGlvbiB0aGUgb3BlbmVkIG1lbnUgcmVsYXRpdmUgdG8gdGhlIG1lbnUgaXRlbSAqL1xuICBwcml2YXRlIF9nZXRPdmVybGF5UG9zaXRpb25zKCk6IENvbm5lY3RlZFBvc2l0aW9uW10ge1xuICAgIC8vIFRPRE86IHVzZSBhIGNvbW1vbiBwb3NpdGlvbmluZyBjb25maWcgZnJvbSAocG9zc2libHkpIGNkay9vdmVybGF5XG4gICAgcmV0dXJuIHRoaXMuX3BhcmVudE1lbnUub3JpZW50YXRpb24gPT09ICdob3Jpem9udGFsJ1xuICAgICAgPyBbXG4gICAgICAgICAge29yaWdpblg6ICdzdGFydCcsIG9yaWdpblk6ICdib3R0b20nLCBvdmVybGF5WDogJ3N0YXJ0Jywgb3ZlcmxheVk6ICd0b3AnfSxcbiAgICAgICAgICB7b3JpZ2luWDogJ3N0YXJ0Jywgb3JpZ2luWTogJ3RvcCcsIG92ZXJsYXlYOiAnc3RhcnQnLCBvdmVybGF5WTogJ2JvdHRvbSd9LFxuICAgICAgICAgIHtvcmlnaW5YOiAnZW5kJywgb3JpZ2luWTogJ2JvdHRvbScsIG92ZXJsYXlYOiAnZW5kJywgb3ZlcmxheVk6ICd0b3AnfSxcbiAgICAgICAgICB7b3JpZ2luWDogJ2VuZCcsIG9yaWdpblk6ICd0b3AnLCBvdmVybGF5WDogJ2VuZCcsIG92ZXJsYXlZOiAnYm90dG9tJ30sXG4gICAgICAgIF1cbiAgICAgIDogW1xuICAgICAgICAgIHtvcmlnaW5YOiAnZW5kJywgb3JpZ2luWTogJ3RvcCcsIG92ZXJsYXlYOiAnc3RhcnQnLCBvdmVybGF5WTogJ3RvcCd9LFxuICAgICAgICAgIHtvcmlnaW5YOiAnZW5kJywgb3JpZ2luWTogJ2JvdHRvbScsIG92ZXJsYXlYOiAnc3RhcnQnLCBvdmVybGF5WTogJ2JvdHRvbSd9LFxuICAgICAgICAgIHtvcmlnaW5YOiAnc3RhcnQnLCBvcmlnaW5ZOiAndG9wJywgb3ZlcmxheVg6ICdlbmQnLCBvdmVybGF5WTogJ3RvcCd9LFxuICAgICAgICAgIHtvcmlnaW5YOiAnc3RhcnQnLCBvcmlnaW5ZOiAnYm90dG9tJywgb3ZlcmxheVg6ICdlbmQnLCBvdmVybGF5WTogJ2JvdHRvbSd9LFxuICAgICAgICBdO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgcG9ydGFsIHRvIGJlIGF0dGFjaGVkIHRvIHRoZSBvdmVybGF5IHdoaWNoIGNvbnRhaW5zIHRoZSBtZW51LiBBbGxvd3MgZm9yIHRoZSBtZW51XG4gICAqIGNvbnRlbnQgdG8gY2hhbmdlIGR5bmFtaWNhbGx5IGFuZCBiZSByZWZsZWN0ZWQgaW4gdGhlIGFwcGxpY2F0aW9uLlxuICAgKi9cbiAgcHJpdmF0ZSBfZ2V0UG9ydGFsKCkge1xuICAgIGNvbnN0IGhhc01lbnVDb250ZW50Q2hhbmdlZCA9IHRoaXMubWVudVBhbmVsPy5fdGVtcGxhdGVSZWYgIT09IHRoaXMuX3BhbmVsQ29udGVudD8udGVtcGxhdGVSZWY7XG4gICAgaWYgKHRoaXMubWVudVBhbmVsICYmICghdGhpcy5fcGFuZWxDb250ZW50IHx8IGhhc01lbnVDb250ZW50Q2hhbmdlZCkpIHtcbiAgICAgIHRoaXMuX3BhbmVsQ29udGVudCA9IG5ldyBUZW1wbGF0ZVBvcnRhbCh0aGlzLm1lbnVQYW5lbC5fdGVtcGxhdGVSZWYsIHRoaXMuX3ZpZXdDb250YWluZXJSZWYpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9wYW5lbENvbnRlbnQ7XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybiB0cnVlIGlmIGlmIHRoZSBlbmNsb3NpbmcgcGFyZW50IG1lbnUgaXMgY29uZmlndXJlZCBpbiBhIHZlcnRpY2FsIG9yaWVudGF0aW9uLlxuICAgKi9cbiAgcHJpdmF0ZSBfaXNQYXJlbnRWZXJ0aWNhbCgpIHtcbiAgICByZXR1cm4gdGhpcy5fcGFyZW50TWVudS5vcmllbnRhdGlvbiA9PT0gJ3ZlcnRpY2FsJztcbiAgfVxuXG4gIC8qKiBHZXQgdGhlIG1lbnUgc3RhY2sgZnJvbSB0aGUgcGFyZW50LiAqL1xuICBwcml2YXRlIF9nZXRNZW51U3RhY2soKSB7XG4gICAgLy8gV2UgdXNlIGEgZnVuY3Rpb24gc2luY2UgYXQgdGhlIGNvbnN0cnVjdGlvbiBvZiB0aGUgTWVudUl0ZW1UcmlnZ2VyIHRoZSBwYXJlbnQgTWVudSB3b24ndCBoYXZlXG4gICAgLy8gaXRzIG1lbnUgc3RhY2sgc2V0LiBUaGVyZWZvcmUgd2UgbmVlZCB0byByZWZlcmVuY2UgdGhlIG1lbnUgc3RhY2sgZnJvbSB0aGUgcGFyZW50IGVhY2ggdGltZVxuICAgIC8vIHdlIHdhbnQgdG8gdXNlIGl0LlxuICAgIHJldHVybiB0aGlzLl9wYXJlbnRNZW51Ll9tZW51U3RhY2s7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICB0aGlzLl9kZXN0cm95T3ZlcmxheSgpO1xuICAgIHRoaXMuX3Jlc2V0UGFuZWxNZW51U3RhY2soKTtcbiAgfVxuXG4gIC8qKiBTZXQgdGhlIG1lbnUgcGFuZWxzIG1lbnUgc3RhY2sgYmFjayB0byBudWxsLiAqL1xuICBwcml2YXRlIF9yZXNldFBhbmVsTWVudVN0YWNrKCkge1xuICAgIC8vIElmIGEgQ2RrTWVudVRyaWdnZXIgaXMgcGxhY2VkIGluIGEgc3VibWVudSwgZWFjaCB0aW1lIHRoZSB0cmlnZ2VyIGlzIHJlbmRlcmVkIChpdHMgcGFyZW50XG4gICAgLy8gbWVudSBpcyBvcGVuZWQpIHRoZSBwYW5lbCBzZXR0ZXIgZm9yIENka01lbnVQYW5lbCBpcyBjYWxsZWQuIEZyb20gdGhlIGZpcnN0IHJlbmRlciBvbndhcmQsXG4gICAgLy8gdGhlIGF0dGFjaGVkIENka01lbnVQYW5lbCBoYXMgdGhlIE1lbnVTdGFjayBzZXQuIFNpbmNlIHdlIHRocm93IGFuIGVycm9yIGlmIGEgcGFuZWwgYWxyZWFkeVxuICAgIC8vIGhhcyBhIHN0YWNrIHNldCwgd2Ugd2FudCB0byByZXNldCB0aGUgYXR0YWNoZWQgc3RhY2sgaGVyZSB0byBwcmV2ZW50IHRoZSBlcnJvciBmcm9tIGJlaW5nXG4gICAgLy8gdGhyb3duIGlmIHRoZSB0cmlnZ2VyIHJlLWNvbmZpZ3VyZXMgaXRzIGF0dGFjaGVkIHBhbmVsIChpbiB0aGUgY2FzZSB3aGVyZSB0aGVyZSBpcyBhIDE6MVxuICAgIC8vIHJlbGF0aW9uc2hpcCBiZXR3ZWVuIHRoZSBwYW5lbCBhbmQgdHJpZ2dlcikuXG4gICAgaWYgKHRoaXMuX21lbnVQYW5lbCkge1xuICAgICAgdGhpcy5fbWVudVBhbmVsLl9tZW51U3RhY2sgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBEZXN0cm95IGFuZCB1bnNldCB0aGUgb3ZlcmxheSByZWZlcmVuY2UgaXQgaWYgZXhpc3RzICovXG4gIHByaXZhdGUgX2Rlc3Ryb3lPdmVybGF5KCkge1xuICAgIGlmICh0aGlzLl9vdmVybGF5UmVmKSB7XG4gICAgICB0aGlzLl9vdmVybGF5UmVmLmRpc3Bvc2UoKTtcbiAgICAgIHRoaXMuX292ZXJsYXlSZWYgPSBudWxsO1xuICAgIH1cbiAgfVxufVxuIl19