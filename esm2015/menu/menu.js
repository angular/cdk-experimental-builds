/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, Input, Output, EventEmitter, QueryList, ContentChildren, Optional, NgZone, HostListener, } from '@angular/core';
import { FocusKeyManager } from '@angular/cdk/a11y';
import { LEFT_ARROW, RIGHT_ARROW, UP_ARROW, DOWN_ARROW, ESCAPE, TAB, hasModifierKey, } from '@angular/cdk/keycodes';
import { Directionality } from '@angular/cdk/bidi';
import { take, takeUntil, startWith, mergeMap, mapTo, mergeAll, switchMap } from 'rxjs/operators';
import { merge } from 'rxjs';
import { CdkMenuGroup } from './menu-group';
import { CdkMenuPanel } from './menu-panel';
import { CDK_MENU } from './menu-interface';
import { CdkMenuItem } from './menu-item';
import { NoopMenuStack } from './menu-stack';
import { getItemPointerEntries } from './item-pointer-entries';
/**
 * Directive which configures the element as a Menu which should contain child elements marked as
 * CdkMenuItem or CdkMenuGroup. Sets the appropriate role and aria-attributes for a menu and
 * contains accessible keyboard and mouse handling logic.
 *
 * It also acts as a RadioGroup for elements marked with role `menuitemradio`.
 */
export class CdkMenu extends CdkMenuGroup {
    constructor(_ngZone, _dir, 
    // `CdkMenuPanel` is always used in combination with a `CdkMenu`.
    // tslint:disable-next-line: lightweight-tokens
    _menuPanel) {
        super();
        this._ngZone = _ngZone;
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
        super.ngAfterContentInit();
        this._completeChangeEmitter();
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
     * Set the FocusMouseManager and ensure that when mouse focus changes the key manager is updated
     * with the latest menu item under mouse focus.
     */
    _subscribeToMouseManager() {
        this._ngZone.runOutsideAngular(() => {
            this._mouseFocusChanged = getItemPointerEntries(this._allItems);
            this._mouseFocusChanged
                .pipe(takeUntil(this.closed))
                .subscribe(item => this._keyManager.setActiveItem(item));
        });
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
                    '[tabindex]': '_isInline() ? 0 : null',
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
    { type: NgZone },
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL21lbnUvbWVudS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQ0wsU0FBUyxFQUNULEtBQUssRUFDTCxNQUFNLEVBQ04sWUFBWSxFQUNaLFNBQVMsRUFDVCxlQUFlLEVBR2YsUUFBUSxFQUVSLE1BQU0sRUFDTixZQUFZLEdBQ2IsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFDLGVBQWUsRUFBYyxNQUFNLG1CQUFtQixDQUFDO0FBQy9ELE9BQU8sRUFDTCxVQUFVLEVBQ1YsV0FBVyxFQUNYLFFBQVEsRUFDUixVQUFVLEVBQ1YsTUFBTSxFQUNOLEdBQUcsRUFDSCxjQUFjLEdBQ2YsTUFBTSx1QkFBdUIsQ0FBQztBQUMvQixPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDakQsT0FBTyxFQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQ2hHLE9BQU8sRUFBQyxLQUFLLEVBQWEsTUFBTSxNQUFNLENBQUM7QUFDdkMsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGNBQWMsQ0FBQztBQUMxQyxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sY0FBYyxDQUFDO0FBQzFDLE9BQU8sRUFBTyxRQUFRLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUNoRCxPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0sYUFBYSxDQUFDO0FBQ3hDLE9BQU8sRUFBc0MsYUFBYSxFQUFDLE1BQU0sY0FBYyxDQUFDO0FBQ2hGLE9BQU8sRUFBQyxxQkFBcUIsRUFBQyxNQUFNLHdCQUF3QixDQUFDO0FBRTdEOzs7Ozs7R0FNRztBQWVILE1BQU0sT0FBTyxPQUFRLFNBQVEsWUFB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QUNyQixRQUFRLEVBQUUsU0FBUztnQkFDbkIsSUFBSSxFQUFFO29CQUNKLFlBQVksRUFBRSx3QkFBd0I7b0JBQ3RDLE1BQU0sRUFBRSxNQUFNO29CQUNkLE9BQU8sRUFBRSxVQUFVO29CQUNuQix5QkFBeUIsRUFBRSxhQUFhO2lCQUN6QztnQkFDRCxTQUFTLEVBQUU7b0JBQ1QsRUFBQyxPQUFPLEVBQUUsWUFBWSxFQUFFLFdBQVcsRUFBRSxPQUFPLEVBQUM7b0JBQzdDLEVBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsT0FBTyxFQUFDO2lCQUMxQzthQUNGOzs7WUEzQ0MsTUFBTTtZQWFBLGNBQWMsdUJBMkVqQixRQUFRO1lBdkVMLFlBQVksdUJBMEVmLFFBQVE7OzswQkExQ1YsS0FBSyxTQUFDLG9CQUFvQjtxQkFHMUIsTUFBTTs0QkFlTixlQUFlLFNBQUMsWUFBWSxFQUFFLEVBQUMsV0FBVyxFQUFFLElBQUksRUFBQzt3QkFJakQsZUFBZSxTQUFDLFdBQVcsRUFBRSxFQUFDLFdBQVcsRUFBRSxJQUFJLEVBQUM7NkJBYWhELEtBQUssU0FBQyxjQUFjOzZCQThCcEIsWUFBWSxTQUFDLE9BQU87OEJBaUJwQixZQUFZLFNBQUMsU0FBUyxFQUFFLENBQUMsUUFBUSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7XG4gIERpcmVjdGl2ZSxcbiAgSW5wdXQsXG4gIE91dHB1dCxcbiAgRXZlbnRFbWl0dGVyLFxuICBRdWVyeUxpc3QsXG4gIENvbnRlbnRDaGlsZHJlbixcbiAgQWZ0ZXJDb250ZW50SW5pdCxcbiAgT25EZXN0cm95LFxuICBPcHRpb25hbCxcbiAgT25Jbml0LFxuICBOZ1pvbmUsXG4gIEhvc3RMaXN0ZW5lcixcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0ZvY3VzS2V5TWFuYWdlciwgRm9jdXNPcmlnaW59IGZyb20gJ0Bhbmd1bGFyL2Nkay9hMTF5JztcbmltcG9ydCB7XG4gIExFRlRfQVJST1csXG4gIFJJR0hUX0FSUk9XLFxuICBVUF9BUlJPVyxcbiAgRE9XTl9BUlJPVyxcbiAgRVNDQVBFLFxuICBUQUIsXG4gIGhhc01vZGlmaWVyS2V5LFxufSBmcm9tICdAYW5ndWxhci9jZGsva2V5Y29kZXMnO1xuaW1wb3J0IHtEaXJlY3Rpb25hbGl0eX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2JpZGknO1xuaW1wb3J0IHt0YWtlLCB0YWtlVW50aWwsIHN0YXJ0V2l0aCwgbWVyZ2VNYXAsIG1hcFRvLCBtZXJnZUFsbCwgc3dpdGNoTWFwfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5pbXBvcnQge21lcmdlLCBPYnNlcnZhYmxlfSBmcm9tICdyeGpzJztcbmltcG9ydCB7Q2RrTWVudUdyb3VwfSBmcm9tICcuL21lbnUtZ3JvdXAnO1xuaW1wb3J0IHtDZGtNZW51UGFuZWx9IGZyb20gJy4vbWVudS1wYW5lbCc7XG5pbXBvcnQge01lbnUsIENES19NRU5VfSBmcm9tICcuL21lbnUtaW50ZXJmYWNlJztcbmltcG9ydCB7Q2RrTWVudUl0ZW19IGZyb20gJy4vbWVudS1pdGVtJztcbmltcG9ydCB7TWVudVN0YWNrLCBNZW51U3RhY2tJdGVtLCBGb2N1c05leHQsIE5vb3BNZW51U3RhY2t9IGZyb20gJy4vbWVudS1zdGFjayc7XG5pbXBvcnQge2dldEl0ZW1Qb2ludGVyRW50cmllc30gZnJvbSAnLi9pdGVtLXBvaW50ZXItZW50cmllcyc7XG5cbi8qKlxuICogRGlyZWN0aXZlIHdoaWNoIGNvbmZpZ3VyZXMgdGhlIGVsZW1lbnQgYXMgYSBNZW51IHdoaWNoIHNob3VsZCBjb250YWluIGNoaWxkIGVsZW1lbnRzIG1hcmtlZCBhc1xuICogQ2RrTWVudUl0ZW0gb3IgQ2RrTWVudUdyb3VwLiBTZXRzIHRoZSBhcHByb3ByaWF0ZSByb2xlIGFuZCBhcmlhLWF0dHJpYnV0ZXMgZm9yIGEgbWVudSBhbmRcbiAqIGNvbnRhaW5zIGFjY2Vzc2libGUga2V5Ym9hcmQgYW5kIG1vdXNlIGhhbmRsaW5nIGxvZ2ljLlxuICpcbiAqIEl0IGFsc28gYWN0cyBhcyBhIFJhZGlvR3JvdXAgZm9yIGVsZW1lbnRzIG1hcmtlZCB3aXRoIHJvbGUgYG1lbnVpdGVtcmFkaW9gLlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbY2RrTWVudV0nLFxuICBleHBvcnRBczogJ2Nka01lbnUnLFxuICBob3N0OiB7XG4gICAgJ1t0YWJpbmRleF0nOiAnX2lzSW5saW5lKCkgPyAwIDogbnVsbCcsXG4gICAgJ3JvbGUnOiAnbWVudScsXG4gICAgJ2NsYXNzJzogJ2Nkay1tZW51JyxcbiAgICAnW2F0dHIuYXJpYS1vcmllbnRhdGlvbl0nOiAnb3JpZW50YXRpb24nLFxuICB9LFxuICBwcm92aWRlcnM6IFtcbiAgICB7cHJvdmlkZTogQ2RrTWVudUdyb3VwLCB1c2VFeGlzdGluZzogQ2RrTWVudX0sXG4gICAge3Byb3ZpZGU6IENES19NRU5VLCB1c2VFeGlzdGluZzogQ2RrTWVudX0sXG4gIF0sXG59KVxuZXhwb3J0IGNsYXNzIENka01lbnUgZXh0ZW5kcyBDZGtNZW51R3JvdXAgaW1wbGVtZW50cyBNZW51LCBBZnRlckNvbnRlbnRJbml0LCBPbkluaXQsIE9uRGVzdHJveSB7XG4gIC8qKlxuICAgKiBTZXRzIHRoZSBhcmlhLW9yaWVudGF0aW9uIGF0dHJpYnV0ZSBhbmQgZGV0ZXJtaW5lcyB3aGVyZSBtZW51cyB3aWxsIGJlIG9wZW5lZC5cbiAgICogRG9lcyBub3QgYWZmZWN0IHN0eWxpbmcvbGF5b3V0LlxuICAgKi9cbiAgQElucHV0KCdjZGtNZW51T3JpZW50YXRpb24nKSBvcmllbnRhdGlvbjogJ2hvcml6b250YWwnIHwgJ3ZlcnRpY2FsJyA9ICd2ZXJ0aWNhbCc7XG5cbiAgLyoqIEV2ZW50IGVtaXR0ZWQgd2hlbiB0aGUgbWVudSBpcyBjbG9zZWQuICovXG4gIEBPdXRwdXQoKSByZWFkb25seSBjbG9zZWQ6IEV2ZW50RW1pdHRlcjx2b2lkIHwgJ2NsaWNrJyB8ICd0YWInIHwgJ2VzY2FwZSc+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4gIC8vIFdlIHByb3ZpZGUgYSBkZWZhdWx0IE1lbnVTdGFjayBpbXBsZW1lbnRhdGlvbiBpbiBjYXNlIHRoZSBtZW51IGlzIGFuIGlubGluZSBtZW51LlxuICAvLyBGb3IgTWVudXMgcGFydCBvZiBhIE1lbnVCYXIgbmVzdGVkIHdpdGhpbiBhIE1lbnVQYW5lbCB0aGlzIHdpbGwgYmUgb3ZlcndyaXR0ZW5cbiAgLy8gdG8gdGhlIGNvcnJlY3QgcGFyZW50IE1lbnVTdGFjay5cbiAgLyoqIFRyYWNrIHRoZSBNZW51cyBtYWtpbmcgdXAgdGhlIG9wZW4gbWVudSBzdGFjay4gKi9cbiAgX21lbnVTdGFjazogTWVudVN0YWNrID0gbmV3IE5vb3BNZW51U3RhY2soKTtcblxuICAvKiogSGFuZGxlcyBrZXlib2FyZCBldmVudHMgZm9yIHRoZSBtZW51LiAqL1xuICBwcml2YXRlIF9rZXlNYW5hZ2VyOiBGb2N1c0tleU1hbmFnZXI8Q2RrTWVudUl0ZW0+O1xuXG4gIC8qKiBFbWl0cyB3aGVuIGEgY2hpbGQgTWVudUl0ZW0gaXMgbW91c2VkIG92ZXIuICovXG4gIHByaXZhdGUgX21vdXNlRm9jdXNDaGFuZ2VkOiBPYnNlcnZhYmxlPENka01lbnVJdGVtPjtcblxuICAvKiogTGlzdCBvZiBuZXN0ZWQgQ2RrTWVudUdyb3VwIGVsZW1lbnRzICovXG4gIEBDb250ZW50Q2hpbGRyZW4oQ2RrTWVudUdyb3VwLCB7ZGVzY2VuZGFudHM6IHRydWV9KVxuICBwcml2YXRlIHJlYWRvbmx5IF9uZXN0ZWRHcm91cHM6IFF1ZXJ5TGlzdDxDZGtNZW51R3JvdXA+O1xuXG4gIC8qKiBBbGwgY2hpbGQgTWVudUl0ZW0gZWxlbWVudHMgbmVzdGVkIGluIHRoaXMgTWVudS4gKi9cbiAgQENvbnRlbnRDaGlsZHJlbihDZGtNZW51SXRlbSwge2Rlc2NlbmRhbnRzOiB0cnVlfSlcbiAgcHJpdmF0ZSByZWFkb25seSBfYWxsSXRlbXM6IFF1ZXJ5TGlzdDxDZGtNZW51SXRlbT47XG5cbiAgLyoqIFRoZSBNZW51IEl0ZW0gd2hpY2ggdHJpZ2dlcmVkIHRoZSBvcGVuIHN1Ym1lbnUuICovXG4gIHByaXZhdGUgX29wZW5JdGVtPzogQ2RrTWVudUl0ZW07XG5cbiAgLyoqXG4gICAqIEEgcmVmZXJlbmNlIHRvIHRoZSBlbmNsb3NpbmcgcGFyZW50IG1lbnUgcGFuZWwuXG4gICAqXG4gICAqIFJlcXVpcmVkIHRvIGJlIHNldCB3aGVuIHVzaW5nIFZpZXdFbmdpbmUgc2luY2UgVmlld0VuZ2luZSBkb2VzIHN1cHBvcnQgaW5qZWN0aW5nIGEgcmVmZXJlbmNlIHRvXG4gICAqIHRoZSBwYXJlbnQgZGlyZWN0aXZlIGlmIHRoZSBwYXJlbnQgZGlyZWN0aXZlIGlzIHBsYWNlZCBvbiBhbiBgbmctdGVtcGxhdGVgLiBJZiB1c2luZyBJdnksIHRoZVxuICAgKiBpbmplY3RlZCB2YWx1ZSB3aWxsIGJlIHVzZWQgb3ZlciB0aGlzIG9uZS5cbiAgICovXG4gIEBJbnB1dCgnY2RrTWVudVBhbmVsJykgcHJpdmF0ZSByZWFkb25seSBfZXhwbGljaXRQYW5lbD86IENka01lbnVQYW5lbDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIHJlYWRvbmx5IF9uZ1pvbmU6IE5nWm9uZSxcbiAgICBAT3B0aW9uYWwoKSBwcml2YXRlIHJlYWRvbmx5IF9kaXI/OiBEaXJlY3Rpb25hbGl0eSxcbiAgICAvLyBgQ2RrTWVudVBhbmVsYCBpcyBhbHdheXMgdXNlZCBpbiBjb21iaW5hdGlvbiB3aXRoIGEgYENka01lbnVgLlxuICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTogbGlnaHR3ZWlnaHQtdG9rZW5zXG4gICAgQE9wdGlvbmFsKCkgcHJpdmF0ZSByZWFkb25seSBfbWVudVBhbmVsPzogQ2RrTWVudVBhbmVsXG4gICkge1xuICAgIHN1cGVyKCk7XG4gIH1cblxuICBuZ09uSW5pdCgpIHtcbiAgICB0aGlzLl9yZWdpc3RlcldpdGhQYXJlbnRQYW5lbCgpO1xuICB9XG5cbiAgbmdBZnRlckNvbnRlbnRJbml0KCkge1xuICAgIHN1cGVyLm5nQWZ0ZXJDb250ZW50SW5pdCgpO1xuXG4gICAgdGhpcy5fY29tcGxldGVDaGFuZ2VFbWl0dGVyKCk7XG4gICAgdGhpcy5fc2V0S2V5TWFuYWdlcigpO1xuICAgIHRoaXMuX3N1YnNjcmliZVRvTWVudU9wZW4oKTtcbiAgICB0aGlzLl9zdWJzY3JpYmVUb01lbnVTdGFjaygpO1xuICAgIHRoaXMuX3N1YnNjcmliZVRvTW91c2VNYW5hZ2VyKCk7XG4gIH1cblxuICAvLyBJbiBJdnkgdGhlIGBob3N0YCBtZXRhZGF0YSB3aWxsIGJlIG1lcmdlZCwgd2hlcmVhcyBpbiBWaWV3RW5naW5lIGl0IGlzIG92ZXJyaWRkZW4uIEluIG9yZGVyXG4gIC8vIHRvIGF2b2lkIGRvdWJsZSBldmVudCBsaXN0ZW5lcnMsIHdlIG5lZWQgdG8gdXNlIGBIb3N0TGlzdGVuZXJgLiBPbmNlIEl2eSBpcyB0aGUgZGVmYXVsdCwgd2VcbiAgLy8gY2FuIG1vdmUgdGhpcyBiYWNrIGludG8gYGhvc3RgLlxuICAvLyB0c2xpbnQ6ZGlzYWJsZTpuby1ob3N0LWRlY29yYXRvci1pbi1jb25jcmV0ZVxuICBASG9zdExpc3RlbmVyKCdmb2N1cycpXG4gIC8qKiBQbGFjZSBmb2N1cyBvbiB0aGUgZmlyc3QgTWVudUl0ZW0gaW4gdGhlIG1lbnUgYW5kIHNldCB0aGUgZm9jdXMgb3JpZ2luLiAqL1xuICBmb2N1c0ZpcnN0SXRlbShmb2N1c09yaWdpbjogRm9jdXNPcmlnaW4gPSAncHJvZ3JhbScpIHtcbiAgICB0aGlzLl9rZXlNYW5hZ2VyLnNldEZvY3VzT3JpZ2luKGZvY3VzT3JpZ2luKTtcbiAgICB0aGlzLl9rZXlNYW5hZ2VyLnNldEZpcnN0SXRlbUFjdGl2ZSgpO1xuICB9XG5cbiAgLyoqIFBsYWNlIGZvY3VzIG9uIHRoZSBsYXN0IE1lbnVJdGVtIGluIHRoZSBtZW51IGFuZCBzZXQgdGhlIGZvY3VzIG9yaWdpbi4gKi9cbiAgZm9jdXNMYXN0SXRlbShmb2N1c09yaWdpbjogRm9jdXNPcmlnaW4gPSAncHJvZ3JhbScpIHtcbiAgICB0aGlzLl9rZXlNYW5hZ2VyLnNldEZvY3VzT3JpZ2luKGZvY3VzT3JpZ2luKTtcbiAgICB0aGlzLl9rZXlNYW5hZ2VyLnNldExhc3RJdGVtQWN0aXZlKCk7XG4gIH1cblxuICAvLyBJbiBJdnkgdGhlIGBob3N0YCBtZXRhZGF0YSB3aWxsIGJlIG1lcmdlZCwgd2hlcmVhcyBpbiBWaWV3RW5naW5lIGl0IGlzIG92ZXJyaWRkZW4uIEluIG9yZGVyXG4gIC8vIHRvIGF2b2lkIGRvdWJsZSBldmVudCBsaXN0ZW5lcnMsIHdlIG5lZWQgdG8gdXNlIGBIb3N0TGlzdGVuZXJgLiBPbmNlIEl2eSBpcyB0aGUgZGVmYXVsdCwgd2VcbiAgLy8gY2FuIG1vdmUgdGhpcyBiYWNrIGludG8gYGhvc3RgLlxuICAvLyB0c2xpbnQ6ZGlzYWJsZTpuby1ob3N0LWRlY29yYXRvci1pbi1jb25jcmV0ZVxuICBASG9zdExpc3RlbmVyKCdrZXlkb3duJywgWyckZXZlbnQnXSlcbiAgLyoqIEhhbmRsZSBrZXlib2FyZCBldmVudHMgZm9yIHRoZSBNZW51LiAqL1xuICBfaGFuZGxlS2V5RXZlbnQoZXZlbnQ6IEtleWJvYXJkRXZlbnQpIHtcbiAgICBjb25zdCBrZXlNYW5hZ2VyID0gdGhpcy5fa2V5TWFuYWdlcjtcbiAgICBzd2l0Y2ggKGV2ZW50LmtleUNvZGUpIHtcbiAgICAgIGNhc2UgTEVGVF9BUlJPVzpcbiAgICAgIGNhc2UgUklHSFRfQVJST1c6XG4gICAgICAgIGlmICh0aGlzLl9pc0hvcml6b250YWwoKSkge1xuICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAga2V5TWFuYWdlci5zZXRGb2N1c09yaWdpbigna2V5Ym9hcmQnKTtcbiAgICAgICAgICBrZXlNYW5hZ2VyLm9uS2V5ZG93bihldmVudCk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgVVBfQVJST1c6XG4gICAgICBjYXNlIERPV05fQVJST1c6XG4gICAgICAgIGlmICghdGhpcy5faXNIb3Jpem9udGFsKCkpIHtcbiAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgIGtleU1hbmFnZXIuc2V0Rm9jdXNPcmlnaW4oJ2tleWJvYXJkJyk7XG4gICAgICAgICAga2V5TWFuYWdlci5vbktleWRvd24oZXZlbnQpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIEVTQ0FQRTpcbiAgICAgICAgaWYgKCFoYXNNb2RpZmllcktleShldmVudCkpIHtcbiAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgIHRoaXMuX21lbnVTdGFjay5jbG9zZSh0aGlzLCBGb2N1c05leHQuY3VycmVudEl0ZW0pO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIFRBQjpcbiAgICAgICAgdGhpcy5fbWVudVN0YWNrLmNsb3NlQWxsKCk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBrZXlNYW5hZ2VyLm9uS2V5ZG93bihldmVudCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFJlZ2lzdGVyIHRoaXMgbWVudSB3aXRoIGl0cyBlbmNsb3NpbmcgcGFyZW50IG1lbnUgcGFuZWwgKi9cbiAgcHJpdmF0ZSBfcmVnaXN0ZXJXaXRoUGFyZW50UGFuZWwoKSB7XG4gICAgdGhpcy5fZ2V0TWVudVBhbmVsKCk/Ll9yZWdpc3Rlck1lbnUodGhpcyk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBlbmNsb3NpbmcgQ2RrTWVudVBhbmVsIGRlZmF1bHRpbmcgdG8gdGhlIGluamVjdGVkIHJlZmVyZW5jZSBvdmVyIHRoZSBkZXZlbG9wZXJcbiAgICogcHJvdmlkZWQgcmVmZXJlbmNlLlxuICAgKi9cbiAgcHJpdmF0ZSBfZ2V0TWVudVBhbmVsKCkge1xuICAgIHJldHVybiB0aGlzLl9tZW51UGFuZWwgfHwgdGhpcy5fZXhwbGljaXRQYW5lbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb21wbGV0ZSB0aGUgY2hhbmdlIGVtaXR0ZXIgaWYgdGhlcmUgYXJlIGFueSBuZXN0ZWQgTWVudUdyb3VwcyBvciByZWdpc3RlciB0byBjb21wbGV0ZSB0aGVcbiAgICogY2hhbmdlIGVtaXR0ZXIgaWYgYSBNZW51R3JvdXAgaXMgcmVuZGVyZWQgYXQgc29tZSBwb2ludFxuICAgKi9cbiAgcHJpdmF0ZSBfY29tcGxldGVDaGFuZ2VFbWl0dGVyKCkge1xuICAgIGlmICh0aGlzLl9oYXNOZXN0ZWRHcm91cHMoKSkge1xuICAgICAgdGhpcy5jaGFuZ2UuY29tcGxldGUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fbmVzdGVkR3JvdXBzLmNoYW5nZXMucGlwZSh0YWtlKDEpKS5zdWJzY3JpYmUoKCkgPT4gdGhpcy5jaGFuZ2UuY29tcGxldGUoKSk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFJldHVybiB0cnVlIGlmIHRoZXJlIGFyZSBuZXN0ZWQgQ2RrTWVudUdyb3VwIGVsZW1lbnRzIHdpdGhpbiB0aGUgTWVudSAqL1xuICBwcml2YXRlIF9oYXNOZXN0ZWRHcm91cHMoKSB7XG4gICAgLy8gdmlldyBlbmdpbmUgaGFzIGEgYnVnIHdoZXJlIEBDb250ZW50Q2hpbGRyZW4gd2lsbCByZXR1cm4gdGhlIGN1cnJlbnQgZWxlbWVudFxuICAgIC8vIGFsb25nIHdpdGggY2hpbGRyZW4gaWYgdGhlIHNlbGVjdG9ycyBtYXRjaCAtIG5vdCBqdXN0IHRoZSBjaGlsZHJlbi5cbiAgICAvLyBIZXJlLCBpZiB0aGVyZSBpcyBhdCBsZWFzdCBvbmUgZWxlbWVudCwgd2UgY2hlY2sgdG8gc2VlIGlmIHRoZSBmaXJzdCBlbGVtZW50IGlzIGEgQ2RrTWVudSBpblxuICAgIC8vIG9yZGVyIHRvIGVuc3VyZSB0aGF0IHdlIHJldHVybiB0cnVlIGlmZiB0aGVyZSBhcmUgY2hpbGQgQ2RrTWVudUdyb3VwIGVsZW1lbnRzLlxuICAgIHJldHVybiB0aGlzLl9uZXN0ZWRHcm91cHMubGVuZ3RoID4gMCAmJiAhKHRoaXMuX25lc3RlZEdyb3Vwcy5maXJzdCBpbnN0YW5jZW9mIENka01lbnUpO1xuICB9XG5cbiAgLyoqIFNldHVwIHRoZSBGb2N1c0tleU1hbmFnZXIgd2l0aCB0aGUgY29ycmVjdCBvcmllbnRhdGlvbiBmb3IgdGhlIG1lbnUuICovXG4gIHByaXZhdGUgX3NldEtleU1hbmFnZXIoKSB7XG4gICAgdGhpcy5fa2V5TWFuYWdlciA9IG5ldyBGb2N1c0tleU1hbmFnZXIodGhpcy5fYWxsSXRlbXMpXG4gICAgICAud2l0aFdyYXAoKVxuICAgICAgLndpdGhUeXBlQWhlYWQoKVxuICAgICAgLndpdGhIb21lQW5kRW5kKCk7XG5cbiAgICBpZiAodGhpcy5faXNIb3Jpem9udGFsKCkpIHtcbiAgICAgIHRoaXMuX2tleU1hbmFnZXIud2l0aEhvcml6b250YWxPcmllbnRhdGlvbih0aGlzLl9kaXI/LnZhbHVlIHx8ICdsdHInKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fa2V5TWFuYWdlci53aXRoVmVydGljYWxPcmllbnRhdGlvbigpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgdGhlIEZvY3VzTW91c2VNYW5hZ2VyIGFuZCBlbnN1cmUgdGhhdCB3aGVuIG1vdXNlIGZvY3VzIGNoYW5nZXMgdGhlIGtleSBtYW5hZ2VyIGlzIHVwZGF0ZWRcbiAgICogd2l0aCB0aGUgbGF0ZXN0IG1lbnUgaXRlbSB1bmRlciBtb3VzZSBmb2N1cy5cbiAgICovXG4gIHByaXZhdGUgX3N1YnNjcmliZVRvTW91c2VNYW5hZ2VyKCkge1xuICAgIHRoaXMuX25nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgICB0aGlzLl9tb3VzZUZvY3VzQ2hhbmdlZCA9IGdldEl0ZW1Qb2ludGVyRW50cmllcyh0aGlzLl9hbGxJdGVtcyk7XG4gICAgICB0aGlzLl9tb3VzZUZvY3VzQ2hhbmdlZFxuICAgICAgICAucGlwZSh0YWtlVW50aWwodGhpcy5jbG9zZWQpKVxuICAgICAgICAuc3Vic2NyaWJlKGl0ZW0gPT4gdGhpcy5fa2V5TWFuYWdlci5zZXRBY3RpdmVJdGVtKGl0ZW0pKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBTdWJzY3JpYmUgdG8gdGhlIE1lbnVTdGFjayBjbG9zZSBhbmQgZW1wdHkgb2JzZXJ2YWJsZXMuICovXG4gIHByaXZhdGUgX3N1YnNjcmliZVRvTWVudVN0YWNrKCkge1xuICAgIHRoaXMuX21lbnVTdGFjay5jbG9zZWRcbiAgICAgIC5waXBlKHRha2VVbnRpbCh0aGlzLmNsb3NlZCkpXG4gICAgICAuc3Vic2NyaWJlKChpdGVtOiBNZW51U3RhY2tJdGVtKSA9PiB0aGlzLl9jbG9zZU9wZW5NZW51KGl0ZW0pKTtcblxuICAgIHRoaXMuX21lbnVTdGFjay5lbXB0aWVkXG4gICAgICAucGlwZSh0YWtlVW50aWwodGhpcy5jbG9zZWQpKVxuICAgICAgLnN1YnNjcmliZSgoZXZlbnQ6IEZvY3VzTmV4dCkgPT4gdGhpcy5fdG9nZ2xlTWVudUZvY3VzKGV2ZW50KSk7XG4gIH1cblxuICAvKipcbiAgICogQ2xvc2UgdGhlIG9wZW4gbWVudSBpZiB0aGUgY3VycmVudCBhY3RpdmUgaXRlbSBvcGVuZWQgdGhlIHJlcXVlc3RlZCBNZW51U3RhY2tJdGVtLlxuICAgKiBAcGFyYW0gaXRlbSB0aGUgTWVudVN0YWNrSXRlbSByZXF1ZXN0ZWQgdG8gYmUgY2xvc2VkLlxuICAgKi9cbiAgcHJpdmF0ZSBfY2xvc2VPcGVuTWVudShtZW51OiBNZW51U3RhY2tJdGVtKSB7XG4gICAgY29uc3Qga2V5TWFuYWdlciA9IHRoaXMuX2tleU1hbmFnZXI7XG4gICAgY29uc3QgdHJpZ2dlciA9IHRoaXMuX29wZW5JdGVtO1xuICAgIGlmIChtZW51ID09PSB0cmlnZ2VyPy5nZXRNZW51VHJpZ2dlcigpPy5nZXRNZW51KCkpIHtcbiAgICAgIHRyaWdnZXIuZ2V0TWVudVRyaWdnZXIoKT8uY2xvc2VNZW51KCk7XG4gICAgICBrZXlNYW5hZ2VyLnNldEZvY3VzT3JpZ2luKCdrZXlib2FyZCcpO1xuICAgICAga2V5TWFuYWdlci5zZXRBY3RpdmVJdGVtKHRyaWdnZXIpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBTZXQgZm9jdXMgdGhlIGVpdGhlciB0aGUgY3VycmVudCwgcHJldmlvdXMgb3IgbmV4dCBpdGVtIGJhc2VkIG9uIHRoZSBGb2N1c05leHQgZXZlbnQuICovXG4gIHByaXZhdGUgX3RvZ2dsZU1lbnVGb2N1cyhldmVudDogRm9jdXNOZXh0KSB7XG4gICAgY29uc3Qga2V5TWFuYWdlciA9IHRoaXMuX2tleU1hbmFnZXI7XG4gICAgc3dpdGNoIChldmVudCkge1xuICAgICAgY2FzZSBGb2N1c05leHQubmV4dEl0ZW06XG4gICAgICAgIGtleU1hbmFnZXIuc2V0Rm9jdXNPcmlnaW4oJ2tleWJvYXJkJyk7XG4gICAgICAgIGtleU1hbmFnZXIuc2V0TmV4dEl0ZW1BY3RpdmUoKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgRm9jdXNOZXh0LnByZXZpb3VzSXRlbTpcbiAgICAgICAga2V5TWFuYWdlci5zZXRGb2N1c09yaWdpbigna2V5Ym9hcmQnKTtcbiAgICAgICAga2V5TWFuYWdlci5zZXRQcmV2aW91c0l0ZW1BY3RpdmUoKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgRm9jdXNOZXh0LmN1cnJlbnRJdGVtOlxuICAgICAgICBpZiAoa2V5TWFuYWdlci5hY3RpdmVJdGVtKSB7XG4gICAgICAgICAga2V5TWFuYWdlci5zZXRGb2N1c09yaWdpbigna2V5Ym9hcmQnKTtcbiAgICAgICAgICBrZXlNYW5hZ2VyLnNldEFjdGl2ZUl0ZW0oa2V5TWFuYWdlci5hY3RpdmVJdGVtKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICAvLyBUT0RPKGFuZHk5Nzc1KTogcmVtb3ZlIGR1cGxpY2F0ZSBsb2dpYyBiZXR3ZWVuIG1lbnUgYW4gbWVudSBiYXJcbiAgLyoqXG4gICAqIFN1YnNjcmliZSB0byB0aGUgbWVudSB0cmlnZ2VyJ3Mgb3BlbiBldmVudHMgaW4gb3JkZXIgdG8gdHJhY2sgdGhlIHRyaWdnZXIgd2hpY2ggb3BlbmVkIHRoZSBtZW51XG4gICAqIGFuZCBzdG9wIHRyYWNraW5nIGl0IHdoZW4gdGhlIG1lbnUgaXMgY2xvc2VkLlxuICAgKi9cbiAgcHJpdmF0ZSBfc3Vic2NyaWJlVG9NZW51T3BlbigpIHtcbiAgICBjb25zdCBleGl0Q29uZGl0aW9uID0gbWVyZ2UodGhpcy5fYWxsSXRlbXMuY2hhbmdlcywgdGhpcy5jbG9zZWQpO1xuICAgIHRoaXMuX2FsbEl0ZW1zLmNoYW5nZXNcbiAgICAgIC5waXBlKFxuICAgICAgICBzdGFydFdpdGgodGhpcy5fYWxsSXRlbXMpLFxuICAgICAgICBtZXJnZU1hcCgobGlzdDogUXVlcnlMaXN0PENka01lbnVJdGVtPikgPT5cbiAgICAgICAgICBsaXN0XG4gICAgICAgICAgICAuZmlsdGVyKGl0ZW0gPT4gaXRlbS5oYXNNZW51KCkpXG4gICAgICAgICAgICAubWFwKGl0ZW0gPT4gaXRlbS5nZXRNZW51VHJpZ2dlcigpIS5vcGVuZWQucGlwZShtYXBUbyhpdGVtKSwgdGFrZVVudGlsKGV4aXRDb25kaXRpb24pKSlcbiAgICAgICAgKSxcbiAgICAgICAgbWVyZ2VBbGwoKSxcbiAgICAgICAgc3dpdGNoTWFwKChpdGVtOiBDZGtNZW51SXRlbSkgPT4ge1xuICAgICAgICAgIHRoaXMuX29wZW5JdGVtID0gaXRlbTtcbiAgICAgICAgICByZXR1cm4gaXRlbS5nZXRNZW51VHJpZ2dlcigpIS5jbG9zZWQ7XG4gICAgICAgIH0pLFxuICAgICAgICB0YWtlVW50aWwodGhpcy5jbG9zZWQpXG4gICAgICApXG4gICAgICAuc3Vic2NyaWJlKCgpID0+ICh0aGlzLl9vcGVuSXRlbSA9IHVuZGVmaW5lZCkpO1xuICB9XG5cbiAgLyoqIFJldHVybiB0cnVlIGlmIHRoaXMgbWVudSBoYXMgYmVlbiBjb25maWd1cmVkIGluIGEgaG9yaXpvbnRhbCBvcmllbnRhdGlvbi4gKi9cbiAgcHJpdmF0ZSBfaXNIb3Jpem9udGFsKCkge1xuICAgIHJldHVybiB0aGlzLm9yaWVudGF0aW9uID09PSAnaG9yaXpvbnRhbCc7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIHRydWUgaWYgdGhpcyBtZW51IGlzIGFuIGlubGluZSBtZW51LiBUaGF0IGlzLCBpdCBkb2VzIG5vdCBleGlzdCBpbiBhIHBvcC11cCBhbmQgaXNcbiAgICogYWx3YXlzIHZpc2libGUgaW4gdGhlIGRvbS5cbiAgICovXG4gIF9pc0lubGluZSgpIHtcbiAgICAvLyBOb29wTWVudVN0YWNrIGlzIHRoZSBkZWZhdWx0LiBJZiB0aGlzIG1lbnUgaXMgbm90IGlubGluZSB0aGFuIHRoZSBOb29wTWVudVN0YWNrIGlzIHJlcGxhY2VkXG4gICAgLy8gYXV0b21hdGljYWxseS5cbiAgICByZXR1cm4gdGhpcy5fbWVudVN0YWNrIGluc3RhbmNlb2YgTm9vcE1lbnVTdGFjaztcbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIHRoaXMuX2VtaXRDbG9zZWRFdmVudCgpO1xuICB9XG5cbiAgLyoqIEVtaXQgYW5kIGNvbXBsZXRlIHRoZSBjbG9zZWQgZXZlbnQgZW1pdHRlciAqL1xuICBwcml2YXRlIF9lbWl0Q2xvc2VkRXZlbnQoKSB7XG4gICAgdGhpcy5jbG9zZWQubmV4dCgpO1xuICAgIHRoaXMuY2xvc2VkLmNvbXBsZXRlKCk7XG4gIH1cbn1cbiJdfQ==