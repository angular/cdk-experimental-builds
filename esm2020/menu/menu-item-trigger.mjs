/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, ElementRef, EventEmitter, Inject, Injector, Input, NgZone, Optional, Output, SkipSelf, TemplateRef, ViewContainerRef, } from '@angular/core';
import { Directionality } from '@angular/cdk/bidi';
import { TemplatePortal } from '@angular/cdk/portal';
import { Overlay, OverlayConfig, STANDARD_DROPDOWN_ADJACENT_POSITIONS, STANDARD_DROPDOWN_BELOW_POSITIONS, } from '@angular/cdk/overlay';
import { DOWN_ARROW, ENTER, LEFT_ARROW, RIGHT_ARROW, SPACE, UP_ARROW } from '@angular/cdk/keycodes';
import { fromEvent, merge, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { CDK_MENU } from './menu-interface';
import { MENU_STACK, MenuStack } from './menu-stack';
import { MENU_AIM } from './menu-aim';
import { MENU_TRIGGER, MenuTrigger } from './menu-trigger';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/overlay";
import * as i2 from "@angular/cdk/bidi";
import * as i3 from "./menu-stack";
/**
 * Whether the target element is a menu item to be ignored by the overlay background click handler.
 */
export function isClickInsideMenuOverlay(target) {
    while (target?.parentElement) {
        const isOpenTrigger = target.getAttribute('aria-expanded') === 'true' &&
            target.classList.contains('cdk-menu-trigger');
        const isOverlayMenu = target.classList.contains('cdk-menu') && !target.classList.contains('cdk-menu-inline');
        if (isOpenTrigger || isOverlayMenu) {
            return true;
        }
        target = target.parentElement;
    }
    return false;
}
/**
 * A directive to be combined with CdkMenuItem which opens the Menu it is bound to. If the
 * element is in a top level MenuBar it will open the menu on click, or if a sibling is already
 * opened it will open on hover. If it is inside of a Menu it will open the attached Submenu on
 * hover regardless of its sibling state.
 *
 * The directive must be placed along with the `cdkMenuItem` directive in order to enable full
 * functionality.
 */
export class CdkMenuItemTrigger extends MenuTrigger {
    constructor(injector, _elementRef, _viewContainerRef, _overlay, _ngZone, menuStack, _parentMenu, _menuAim, _directionality) {
        super(injector, menuStack);
        this._elementRef = _elementRef;
        this._viewContainerRef = _viewContainerRef;
        this._overlay = _overlay;
        this._ngZone = _ngZone;
        this._parentMenu = _parentMenu;
        this._menuAim = _menuAim;
        this._directionality = _directionality;
        /** Emits when the attached menu is requested to open */
        this.opened = new EventEmitter();
        /** Emits when the attached menu is requested to close */
        this.closed = new EventEmitter();
        /** A reference to the overlay which manages the triggered menu */
        this._overlayRef = null;
        /** Emits when this trigger is destroyed. */
        this._destroyed = new Subject();
        /** Emits when the outside pointer events listener on the overlay should be stopped. */
        this._stopOutsideClicksListener = merge(this.closed, this._destroyed);
        this._registerCloseHandler();
        this._subscribeToMouseEnter();
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
            this._subscribeToOutsideClicks();
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
        return !!this._menuTemplateRef;
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
        return this.childMenu;
    }
    /**
     * Subscribe to the mouseenter events and close any sibling menu items if this element is moused
     * into.
     */
    _subscribeToMouseEnter() {
        // Closes any sibling menu items and opens the menu associated with this trigger.
        const toggleMenus = () => this._ngZone.run(() => {
            this._closeSiblingTriggers();
            this.openMenu();
        });
        this._ngZone.runOutsideAngular(() => {
            fromEvent(this._elementRef.nativeElement, 'mouseenter')
                .pipe(filter(() => !this.menuStack.isEmpty() && !this.isMenuOpen()), takeUntil(this._destroyed))
                .subscribe(() => {
                if (this._menuAim) {
                    this._menuAim.toggle(toggleMenus);
                }
                else {
                    toggleMenus();
                }
            });
        });
    }
    /**
     * Handles keyboard events for the menu item, specifically opening/closing the attached menu and
     * focusing the appropriate submenu item.
     * @param event the keyboard event to handle
     */
    _toggleOnKeydown(event) {
        const keyCode = event.keyCode;
        switch (keyCode) {
            case SPACE:
            case ENTER:
                event.preventDefault();
                this.toggle();
                this.childMenu?.focusFirstItem('keyboard');
                break;
            case RIGHT_ARROW:
                if (this._parentMenu && this._isParentVertical() && this._directionality?.value !== 'rtl') {
                    event.preventDefault();
                    this.openMenu();
                    this.childMenu?.focusFirstItem('keyboard');
                }
                break;
            case LEFT_ARROW:
                if (this._parentMenu && this._isParentVertical() && this._directionality?.value === 'rtl') {
                    event.preventDefault();
                    this.openMenu();
                    this.childMenu?.focusFirstItem('keyboard');
                }
                break;
            case DOWN_ARROW:
            case UP_ARROW:
                if (!this._isParentVertical()) {
                    event.preventDefault();
                    this.openMenu();
                    keyCode === DOWN_ARROW
                        ? this.childMenu?.focusFirstItem('keyboard')
                        : this.childMenu?.focusLastItem('keyboard');
                }
                break;
        }
    }
    /** Close out any sibling menu trigger menus. */
    _closeSiblingTriggers() {
        if (this._parentMenu) {
            // If nothing was removed from the stack and the last element is not the parent item
            // that means that the parent menu is a menu bar since we don't put the menu bar on the
            // stack
            const isParentMenuBar = !this.menuStack.closeSubMenuOf(this._parentMenu) &&
                this.menuStack.peek() !== this._parentMenu;
            if (isParentMenuBar) {
                this.menuStack.closeAll();
            }
        }
        else {
            this.menuStack.closeAll();
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
        return (this.menuPosition ??
            (!this._parentMenu || this._parentMenu.orientation === 'horizontal'
                ? STANDARD_DROPDOWN_BELOW_POSITIONS
                : STANDARD_DROPDOWN_ADJACENT_POSITIONS));
    }
    /**
     * Get the portal to be attached to the overlay which contains the menu. Allows for the menu
     * content to change dynamically and be reflected in the application.
     */
    _getPortal() {
        const hasMenuContentChanged = this._menuTemplateRef !== this._menuPortal?.templateRef;
        if (this._menuTemplateRef && (!this._menuPortal || hasMenuContentChanged)) {
            this._menuPortal = new TemplatePortal(this._menuTemplateRef, this._viewContainerRef, undefined, this.getChildMenuInjector());
        }
        return this._menuPortal;
    }
    /**
     * @return true if if the enclosing parent menu is configured in a vertical orientation.
     */
    _isParentVertical() {
        return this._parentMenu?.orientation === 'vertical';
    }
    /**
     * Subscribe to the MenuStack close events if this is a standalone trigger and close out the menu
     * this triggers when requested.
     */
    _registerCloseHandler() {
        if (!this._parentMenu) {
            this.menuStack.closed.pipe(takeUntil(this._destroyed)).subscribe(item => {
                if (item === this.childMenu) {
                    this.closeMenu();
                }
            });
        }
    }
    ngOnDestroy() {
        this._destroyOverlay();
        this._destroyed.next();
        this._destroyed.complete();
    }
    /**
     * Subscribe to the overlays outside pointer events stream and handle closing out the stack if a
     * click occurs outside the menus.
     */
    _subscribeToOutsideClicks() {
        if (this._overlayRef) {
            this._overlayRef
                .outsidePointerEvents()
                .pipe(takeUntil(this._stopOutsideClicksListener))
                .subscribe(event => {
                if (!isClickInsideMenuOverlay(event.target)) {
                    this.menuStack.closeAll();
                }
            });
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
CdkMenuItemTrigger.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.0.0-next.9", ngImport: i0, type: CdkMenuItemTrigger, deps: [{ token: i0.Injector }, { token: i0.ElementRef }, { token: i0.ViewContainerRef }, { token: i1.Overlay }, { token: i0.NgZone }, { token: MENU_STACK }, { token: CDK_MENU, optional: true }, { token: MENU_AIM, optional: true }, { token: i2.Directionality, optional: true }], target: i0.ɵɵFactoryTarget.Directive });
CdkMenuItemTrigger.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "14.0.0-next.9", type: CdkMenuItemTrigger, selector: "[cdkMenuTriggerFor]", inputs: { _menuTemplateRef: ["cdkMenuTriggerFor", "_menuTemplateRef"], menuPosition: ["cdkMenuPosition", "menuPosition"] }, outputs: { opened: "cdkMenuOpened", closed: "cdkMenuClosed" }, host: { attributes: { "aria-haspopup": "menu" }, listeners: { "keydown": "_toggleOnKeydown($event)", "click": "toggle()" }, properties: { "attr.aria-expanded": "isMenuOpen()" }, classAttribute: "cdk-menu-trigger" }, providers: [
        { provide: MENU_TRIGGER, useExisting: CdkMenuItemTrigger },
        {
            provide: MENU_STACK,
            deps: [[new Optional(), new SkipSelf(), new Inject(MENU_STACK)]],
            useFactory: (parentMenuStack) => parentMenuStack || new MenuStack(),
        },
    ], exportAs: ["cdkMenuTriggerFor"], usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.0.0-next.9", ngImport: i0, type: CdkMenuItemTrigger, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkMenuTriggerFor]',
                    exportAs: 'cdkMenuTriggerFor',
                    host: {
                        '(keydown)': '_toggleOnKeydown($event)',
                        '(click)': 'toggle()',
                        'class': 'cdk-menu-trigger',
                        'aria-haspopup': 'menu',
                        '[attr.aria-expanded]': 'isMenuOpen()',
                    },
                    providers: [
                        { provide: MENU_TRIGGER, useExisting: CdkMenuItemTrigger },
                        {
                            provide: MENU_STACK,
                            deps: [[new Optional(), new SkipSelf(), new Inject(MENU_STACK)]],
                            useFactory: (parentMenuStack) => parentMenuStack || new MenuStack(),
                        },
                    ],
                }]
        }], ctorParameters: function () { return [{ type: i0.Injector }, { type: i0.ElementRef }, { type: i0.ViewContainerRef }, { type: i1.Overlay }, { type: i0.NgZone }, { type: i3.MenuStack, decorators: [{
                    type: Inject,
                    args: [MENU_STACK]
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [CDK_MENU]
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [MENU_AIM]
                }] }, { type: i2.Directionality, decorators: [{
                    type: Optional
                }] }]; }, propDecorators: { _menuTemplateRef: [{
                type: Input,
                args: ['cdkMenuTriggerFor']
            }], menuPosition: [{
                type: Input,
                args: ['cdkMenuPosition']
            }], opened: [{
                type: Output,
                args: ['cdkMenuOpened']
            }], closed: [{
                type: Output,
                args: ['cdkMenuClosed']
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1pdGVtLXRyaWdnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrLWV4cGVyaW1lbnRhbC9tZW51L21lbnUtaXRlbS10cmlnZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFDTCxTQUFTLEVBQ1QsVUFBVSxFQUNWLFlBQVksRUFDWixNQUFNLEVBQ04sUUFBUSxFQUNSLEtBQUssRUFDTCxNQUFNLEVBRU4sUUFBUSxFQUNSLE1BQU0sRUFDTixRQUFRLEVBQ1IsV0FBVyxFQUNYLGdCQUFnQixHQUNqQixNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDakQsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQ25ELE9BQU8sRUFHTCxPQUFPLEVBQ1AsYUFBYSxFQUViLG9DQUFvQyxFQUNwQyxpQ0FBaUMsR0FDbEMsTUFBTSxzQkFBc0IsQ0FBQztBQUM5QixPQUFPLEVBQUMsVUFBVSxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUNsRyxPQUFPLEVBQUMsU0FBUyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDL0MsT0FBTyxFQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUNqRCxPQUFPLEVBQUMsUUFBUSxFQUFPLE1BQU0sa0JBQWtCLENBQUM7QUFDaEQsT0FBTyxFQUFDLFVBQVUsRUFBRSxTQUFTLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFDbkQsT0FBTyxFQUFDLFFBQVEsRUFBVSxNQUFNLFlBQVksQ0FBQztBQUM3QyxPQUFPLEVBQUMsWUFBWSxFQUFFLFdBQVcsRUFBQyxNQUFNLGdCQUFnQixDQUFDOzs7OztBQUV6RDs7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Iiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7XG4gIERpcmVjdGl2ZSxcbiAgRWxlbWVudFJlZixcbiAgRXZlbnRFbWl0dGVyLFxuICBJbmplY3QsXG4gIEluamVjdG9yLFxuICBJbnB1dCxcbiAgTmdab25lLFxuICBPbkRlc3Ryb3ksXG4gIE9wdGlvbmFsLFxuICBPdXRwdXQsXG4gIFNraXBTZWxmLFxuICBUZW1wbGF0ZVJlZixcbiAgVmlld0NvbnRhaW5lclJlZixcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0RpcmVjdGlvbmFsaXR5fSBmcm9tICdAYW5ndWxhci9jZGsvYmlkaSc7XG5pbXBvcnQge1RlbXBsYXRlUG9ydGFsfSBmcm9tICdAYW5ndWxhci9jZGsvcG9ydGFsJztcbmltcG9ydCB7XG4gIENvbm5lY3RlZFBvc2l0aW9uLFxuICBGbGV4aWJsZUNvbm5lY3RlZFBvc2l0aW9uU3RyYXRlZ3ksXG4gIE92ZXJsYXksXG4gIE92ZXJsYXlDb25maWcsXG4gIE92ZXJsYXlSZWYsXG4gIFNUQU5EQVJEX0RST1BET1dOX0FESkFDRU5UX1BPU0lUSU9OUyxcbiAgU1RBTkRBUkRfRFJPUERPV05fQkVMT1dfUE9TSVRJT05TLFxufSBmcm9tICdAYW5ndWxhci9jZGsvb3ZlcmxheSc7XG5pbXBvcnQge0RPV05fQVJST1csIEVOVEVSLCBMRUZUX0FSUk9XLCBSSUdIVF9BUlJPVywgU1BBQ0UsIFVQX0FSUk9XfSBmcm9tICdAYW5ndWxhci9jZGsva2V5Y29kZXMnO1xuaW1wb3J0IHtmcm9tRXZlbnQsIG1lcmdlLCBTdWJqZWN0fSBmcm9tICdyeGpzJztcbmltcG9ydCB7ZmlsdGVyLCB0YWtlVW50aWx9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7Q0RLX01FTlUsIE1lbnV9IGZyb20gJy4vbWVudS1pbnRlcmZhY2UnO1xuaW1wb3J0IHtNRU5VX1NUQUNLLCBNZW51U3RhY2t9IGZyb20gJy4vbWVudS1zdGFjayc7XG5pbXBvcnQge01FTlVfQUlNLCBNZW51QWltfSBmcm9tICcuL21lbnUtYWltJztcbmltcG9ydCB7TUVOVV9UUklHR0VSLCBNZW51VHJpZ2dlcn0gZnJvbSAnLi9tZW51LXRyaWdnZXInO1xuXG4vKipcbiAqIFdoZXRoZXIgdGhlIHRhcmdldCBlbGVtZW50IGlzIGEgbWVudSBpdGVtIHRvIGJlIGlnbm9yZWQgYnkgdGhlIG92ZXJsYXkgYmFja2dyb3VuZCBjbGljayBoYW5kbGVyLlxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNDbGlja0luc2lkZU1lbnVPdmVybGF5KHRhcmdldDogRWxlbWVudCk6IGJvb2xlYW4ge1xuICB3aGlsZSAodGFyZ2V0Py5wYXJlbnRFbGVtZW50KSB7XG4gICAgY29uc3QgaXNPcGVuVHJpZ2dlciA9XG4gICAgICB0YXJnZXQuZ2V0QXR0cmlidXRlKCdhcmlhLWV4cGFuZGVkJykgPT09ICd0cnVlJyAmJlxuICAgICAgdGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucygnY2RrLW1lbnUtdHJpZ2dlcicpO1xuICAgIGNvbnN0IGlzT3ZlcmxheU1lbnUgPVxuICAgICAgdGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucygnY2RrLW1lbnUnKSAmJiAhdGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucygnY2RrLW1lbnUtaW5saW5lJyk7XG5cbiAgICBpZiAoaXNPcGVuVHJpZ2dlciB8fCBpc092ZXJsYXlNZW51KSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgdGFyZ2V0ID0gdGFyZ2V0LnBhcmVudEVsZW1lbnQ7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG4vKipcbiAqIEEgZGlyZWN0aXZlIHRvIGJlIGNvbWJpbmVkIHdpdGggQ2RrTWVudUl0ZW0gd2hpY2ggb3BlbnMgdGhlIE1lbnUgaXQgaXMgYm91bmQgdG8uIElmIHRoZVxuICogZWxlbWVudCBpcyBpbiBhIHRvcCBsZXZlbCBNZW51QmFyIGl0IHdpbGwgb3BlbiB0aGUgbWVudSBvbiBjbGljaywgb3IgaWYgYSBzaWJsaW5nIGlzIGFscmVhZHlcbiAqIG9wZW5lZCBpdCB3aWxsIG9wZW4gb24gaG92ZXIuIElmIGl0IGlzIGluc2lkZSBvZiBhIE1lbnUgaXQgd2lsbCBvcGVuIHRoZSBhdHRhY2hlZCBTdWJtZW51IG9uXG4gKiBob3ZlciByZWdhcmRsZXNzIG9mIGl0cyBzaWJsaW5nIHN0YXRlLlxuICpcbiAqIFRoZSBkaXJlY3RpdmUgbXVzdCBiZSBwbGFjZWQgYWxvbmcgd2l0aCB0aGUgYGNka01lbnVJdGVtYCBkaXJlY3RpdmUgaW4gb3JkZXIgdG8gZW5hYmxlIGZ1bGxcbiAqIGZ1bmN0aW9uYWxpdHkuXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tjZGtNZW51VHJpZ2dlckZvcl0nLFxuICBleHBvcnRBczogJ2Nka01lbnVUcmlnZ2VyRm9yJyxcbiAgaG9zdDoge1xuICAgICcoa2V5ZG93biknOiAnX3RvZ2dsZU9uS2V5ZG93bigkZXZlbnQpJyxcbiAgICAnKGNsaWNrKSc6ICd0b2dnbGUoKScsXG4gICAgJ2NsYXNzJzogJ2Nkay1tZW51LXRyaWdnZXInLFxuICAgICdhcmlhLWhhc3BvcHVwJzogJ21lbnUnLFxuICAgICdbYXR0ci5hcmlhLWV4cGFuZGVkXSc6ICdpc01lbnVPcGVuKCknLFxuICB9LFxuICBwcm92aWRlcnM6IFtcbiAgICB7cHJvdmlkZTogTUVOVV9UUklHR0VSLCB1c2VFeGlzdGluZzogQ2RrTWVudUl0ZW1UcmlnZ2VyfSxcbiAgICB7XG4gICAgICBwcm92aWRlOiBNRU5VX1NUQUNLLFxuICAgICAgZGVwczogW1tuZXcgT3B0aW9uYWwoKSwgbmV3IFNraXBTZWxmKCksIG5ldyBJbmplY3QoTUVOVV9TVEFDSyldXSxcbiAgICAgIHVzZUZhY3Rvcnk6IChwYXJlbnRNZW51U3RhY2s/OiBNZW51U3RhY2spID0+IHBhcmVudE1lbnVTdGFjayB8fCBuZXcgTWVudVN0YWNrKCksXG4gICAgfSxcbiAgXSxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrTWVudUl0ZW1UcmlnZ2VyIGV4dGVuZHMgTWVudVRyaWdnZXIgaW1wbGVtZW50cyBPbkRlc3Ryb3kge1xuICAvKiogVGVtcGxhdGUgcmVmZXJlbmNlIHZhcmlhYmxlIHRvIHRoZSBtZW51IHRoaXMgdHJpZ2dlciBvcGVucyAqL1xuICBASW5wdXQoJ2Nka01lbnVUcmlnZ2VyRm9yJylcbiAgX21lbnVUZW1wbGF0ZVJlZj86IFRlbXBsYXRlUmVmPHVua25vd24+O1xuXG4gIC8qKiBBIGxpc3Qgb2YgcHJlZmVycmVkIG1lbnUgcG9zaXRpb25zIHRvIGJlIHVzZWQgd2hlbiBjb25zdHJ1Y3RpbmcgdGhlIGBGbGV4aWJsZUNvbm5lY3RlZFBvc2l0aW9uU3RyYXRlZ3lgIGZvciB0aGlzIHRyaWdnZXIncyBtZW51LiAqL1xuICBASW5wdXQoJ2Nka01lbnVQb3NpdGlvbicpIG1lbnVQb3NpdGlvbjogQ29ubmVjdGVkUG9zaXRpb25bXTtcblxuICAvKiogRW1pdHMgd2hlbiB0aGUgYXR0YWNoZWQgbWVudSBpcyByZXF1ZXN0ZWQgdG8gb3BlbiAqL1xuICBAT3V0cHV0KCdjZGtNZW51T3BlbmVkJykgcmVhZG9ubHkgb3BlbmVkOiBFdmVudEVtaXR0ZXI8dm9pZD4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG5cbiAgLyoqIEVtaXRzIHdoZW4gdGhlIGF0dGFjaGVkIG1lbnUgaXMgcmVxdWVzdGVkIHRvIGNsb3NlICovXG4gIEBPdXRwdXQoJ2Nka01lbnVDbG9zZWQnKSByZWFkb25seSBjbG9zZWQ6IEV2ZW50RW1pdHRlcjx2b2lkPiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuICAvKiogQSByZWZlcmVuY2UgdG8gdGhlIG92ZXJsYXkgd2hpY2ggbWFuYWdlcyB0aGUgdHJpZ2dlcmVkIG1lbnUgKi9cbiAgcHJpdmF0ZSBfb3ZlcmxheVJlZjogT3ZlcmxheVJlZiB8IG51bGwgPSBudWxsO1xuXG4gIC8qKiBUaGUgY29udGVudCBvZiB0aGUgbWVudSBwYW5lbCBvcGVuZWQgYnkgdGhpcyB0cmlnZ2VyLiAqL1xuICBwcml2YXRlIF9tZW51UG9ydGFsOiBUZW1wbGF0ZVBvcnRhbDtcblxuICAvKiogRW1pdHMgd2hlbiB0aGlzIHRyaWdnZXIgaXMgZGVzdHJveWVkLiAqL1xuICBwcml2YXRlIHJlYWRvbmx5IF9kZXN0cm95ZWQ6IFN1YmplY3Q8dm9pZD4gPSBuZXcgU3ViamVjdCgpO1xuXG4gIC8qKiBFbWl0cyB3aGVuIHRoZSBvdXRzaWRlIHBvaW50ZXIgZXZlbnRzIGxpc3RlbmVyIG9uIHRoZSBvdmVybGF5IHNob3VsZCBiZSBzdG9wcGVkLiAqL1xuICBwcml2YXRlIHJlYWRvbmx5IF9zdG9wT3V0c2lkZUNsaWNrc0xpc3RlbmVyID0gbWVyZ2UodGhpcy5jbG9zZWQsIHRoaXMuX2Rlc3Ryb3llZCk7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgaW5qZWN0b3I6IEluamVjdG9yLFxuICAgIHByaXZhdGUgcmVhZG9ubHkgX2VsZW1lbnRSZWY6IEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+LFxuICAgIHByb3RlY3RlZCByZWFkb25seSBfdmlld0NvbnRhaW5lclJlZjogVmlld0NvbnRhaW5lclJlZixcbiAgICBwcml2YXRlIHJlYWRvbmx5IF9vdmVybGF5OiBPdmVybGF5LFxuICAgIHByaXZhdGUgcmVhZG9ubHkgX25nWm9uZTogTmdab25lLFxuICAgIEBJbmplY3QoTUVOVV9TVEFDSykgbWVudVN0YWNrOiBNZW51U3RhY2ssXG4gICAgQE9wdGlvbmFsKCkgQEluamVjdChDREtfTUVOVSkgcHJpdmF0ZSByZWFkb25seSBfcGFyZW50TWVudT86IE1lbnUsXG4gICAgQE9wdGlvbmFsKCkgQEluamVjdChNRU5VX0FJTSkgcHJpdmF0ZSByZWFkb25seSBfbWVudUFpbT86IE1lbnVBaW0sXG4gICAgQE9wdGlvbmFsKCkgcHJpdmF0ZSByZWFkb25seSBfZGlyZWN0aW9uYWxpdHk/OiBEaXJlY3Rpb25hbGl0eSxcbiAgKSB7XG4gICAgc3VwZXIoaW5qZWN0b3IsIG1lbnVTdGFjayk7XG4gICAgdGhpcy5fcmVnaXN0ZXJDbG9zZUhhbmRsZXIoKTtcbiAgICB0aGlzLl9zdWJzY3JpYmVUb01vdXNlRW50ZXIoKTtcbiAgfVxuXG4gIC8qKiBPcGVuL2Nsb3NlIHRoZSBhdHRhY2hlZCBtZW51IGlmIHRoZSB0cmlnZ2VyIGhhcyBiZWVuIGNvbmZpZ3VyZWQgd2l0aCBvbmUgKi9cbiAgdG9nZ2xlKCkge1xuICAgIGlmICh0aGlzLmhhc01lbnUoKSkge1xuICAgICAgdGhpcy5pc01lbnVPcGVuKCkgPyB0aGlzLmNsb3NlTWVudSgpIDogdGhpcy5vcGVuTWVudSgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBPcGVuIHRoZSBhdHRhY2hlZCBtZW51LiAqL1xuICBvcGVuTWVudSgpIHtcbiAgICBpZiAoIXRoaXMuaXNNZW51T3BlbigpKSB7XG4gICAgICB0aGlzLm9wZW5lZC5uZXh0KCk7XG5cbiAgICAgIHRoaXMuX292ZXJsYXlSZWYgPSB0aGlzLl9vdmVybGF5UmVmIHx8IHRoaXMuX292ZXJsYXkuY3JlYXRlKHRoaXMuX2dldE92ZXJsYXlDb25maWcoKSk7XG4gICAgICB0aGlzLl9vdmVybGF5UmVmLmF0dGFjaCh0aGlzLl9nZXRQb3J0YWwoKSk7XG4gICAgICB0aGlzLl9zdWJzY3JpYmVUb091dHNpZGVDbGlja3MoKTtcbiAgICB9XG4gIH1cblxuICAvKiogQ2xvc2UgdGhlIG9wZW5lZCBtZW51LiAqL1xuICBjbG9zZU1lbnUoKSB7XG4gICAgaWYgKHRoaXMuaXNNZW51T3BlbigpKSB7XG4gICAgICB0aGlzLmNsb3NlZC5uZXh0KCk7XG5cbiAgICAgIHRoaXMuX292ZXJsYXlSZWYhLmRldGFjaCgpO1xuICAgIH1cbiAgICB0aGlzLl9jbG9zZVNpYmxpbmdUcmlnZ2VycygpO1xuICB9XG5cbiAgLyoqIFJldHVybiB0cnVlIGlmIHRoZSB0cmlnZ2VyIGhhcyBhbiBhdHRhY2hlZCBtZW51ICovXG4gIGhhc01lbnUoKSB7XG4gICAgcmV0dXJuICEhdGhpcy5fbWVudVRlbXBsYXRlUmVmO1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhlIG1lbnUgdGhpcyBidXR0b24gaXMgYSB0cmlnZ2VyIGZvciBpcyBvcGVuICovXG4gIGlzTWVudU9wZW4oKSB7XG4gICAgcmV0dXJuIHRoaXMuX292ZXJsYXlSZWYgPyB0aGlzLl9vdmVybGF5UmVmLmhhc0F0dGFjaGVkKCkgOiBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYSByZWZlcmVuY2UgdG8gdGhlIHJlbmRlcmVkIE1lbnUgaWYgdGhlIE1lbnUgaXMgb3BlbiBhbmQgaXQgaXMgdmlzaWJsZSBpbiB0aGUgRE9NLlxuICAgKiBAcmV0dXJuIHRoZSBtZW51IGlmIGl0IGlzIG9wZW4sIG90aGVyd2lzZSB1bmRlZmluZWQuXG4gICAqL1xuICBnZXRNZW51KCk6IE1lbnUgfCB1bmRlZmluZWQge1xuICAgIHJldHVybiB0aGlzLmNoaWxkTWVudTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdWJzY3JpYmUgdG8gdGhlIG1vdXNlZW50ZXIgZXZlbnRzIGFuZCBjbG9zZSBhbnkgc2libGluZyBtZW51IGl0ZW1zIGlmIHRoaXMgZWxlbWVudCBpcyBtb3VzZWRcbiAgICogaW50by5cbiAgICovXG4gIHByaXZhdGUgX3N1YnNjcmliZVRvTW91c2VFbnRlcigpIHtcbiAgICAvLyBDbG9zZXMgYW55IHNpYmxpbmcgbWVudSBpdGVtcyBhbmQgb3BlbnMgdGhlIG1lbnUgYXNzb2NpYXRlZCB3aXRoIHRoaXMgdHJpZ2dlci5cbiAgICBjb25zdCB0b2dnbGVNZW51cyA9ICgpID0+XG4gICAgICB0aGlzLl9uZ1pvbmUucnVuKCgpID0+IHtcbiAgICAgICAgdGhpcy5fY2xvc2VTaWJsaW5nVHJpZ2dlcnMoKTtcbiAgICAgICAgdGhpcy5vcGVuTWVudSgpO1xuICAgICAgfSk7XG5cbiAgICB0aGlzLl9uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgZnJvbUV2ZW50KHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudCwgJ21vdXNlZW50ZXInKVxuICAgICAgICAucGlwZShcbiAgICAgICAgICBmaWx0ZXIoKCkgPT4gIXRoaXMubWVudVN0YWNrLmlzRW1wdHkoKSAmJiAhdGhpcy5pc01lbnVPcGVuKCkpLFxuICAgICAgICAgIHRha2VVbnRpbCh0aGlzLl9kZXN0cm95ZWQpLFxuICAgICAgICApXG4gICAgICAgIC5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgICAgIGlmICh0aGlzLl9tZW51QWltKSB7XG4gICAgICAgICAgICB0aGlzLl9tZW51QWltLnRvZ2dsZSh0b2dnbGVNZW51cyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRvZ2dsZU1lbnVzKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGVzIGtleWJvYXJkIGV2ZW50cyBmb3IgdGhlIG1lbnUgaXRlbSwgc3BlY2lmaWNhbGx5IG9wZW5pbmcvY2xvc2luZyB0aGUgYXR0YWNoZWQgbWVudSBhbmRcbiAgICogZm9jdXNpbmcgdGhlIGFwcHJvcHJpYXRlIHN1Ym1lbnUgaXRlbS5cbiAgICogQHBhcmFtIGV2ZW50IHRoZSBrZXlib2FyZCBldmVudCB0byBoYW5kbGVcbiAgICovXG4gIF90b2dnbGVPbktleWRvd24oZXZlbnQ6IEtleWJvYXJkRXZlbnQpIHtcbiAgICBjb25zdCBrZXlDb2RlID0gZXZlbnQua2V5Q29kZTtcbiAgICBzd2l0Y2ggKGtleUNvZGUpIHtcbiAgICAgIGNhc2UgU1BBQ0U6XG4gICAgICBjYXNlIEVOVEVSOlxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB0aGlzLnRvZ2dsZSgpO1xuICAgICAgICB0aGlzLmNoaWxkTWVudT8uZm9jdXNGaXJzdEl0ZW0oJ2tleWJvYXJkJyk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIFJJR0hUX0FSUk9XOlxuICAgICAgICBpZiAodGhpcy5fcGFyZW50TWVudSAmJiB0aGlzLl9pc1BhcmVudFZlcnRpY2FsKCkgJiYgdGhpcy5fZGlyZWN0aW9uYWxpdHk/LnZhbHVlICE9PSAncnRsJykge1xuICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgdGhpcy5vcGVuTWVudSgpO1xuICAgICAgICAgIHRoaXMuY2hpbGRNZW51Py5mb2N1c0ZpcnN0SXRlbSgna2V5Ym9hcmQnKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBMRUZUX0FSUk9XOlxuICAgICAgICBpZiAodGhpcy5fcGFyZW50TWVudSAmJiB0aGlzLl9pc1BhcmVudFZlcnRpY2FsKCkgJiYgdGhpcy5fZGlyZWN0aW9uYWxpdHk/LnZhbHVlID09PSAncnRsJykge1xuICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgdGhpcy5vcGVuTWVudSgpO1xuICAgICAgICAgIHRoaXMuY2hpbGRNZW51Py5mb2N1c0ZpcnN0SXRlbSgna2V5Ym9hcmQnKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBET1dOX0FSUk9XOlxuICAgICAgY2FzZSBVUF9BUlJPVzpcbiAgICAgICAgaWYgKCF0aGlzLl9pc1BhcmVudFZlcnRpY2FsKCkpIHtcbiAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgIHRoaXMub3Blbk1lbnUoKTtcbiAgICAgICAgICBrZXlDb2RlID09PSBET1dOX0FSUk9XXG4gICAgICAgICAgICA/IHRoaXMuY2hpbGRNZW51Py5mb2N1c0ZpcnN0SXRlbSgna2V5Ym9hcmQnKVxuICAgICAgICAgICAgOiB0aGlzLmNoaWxkTWVudT8uZm9jdXNMYXN0SXRlbSgna2V5Ym9hcmQnKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICAvKiogQ2xvc2Ugb3V0IGFueSBzaWJsaW5nIG1lbnUgdHJpZ2dlciBtZW51cy4gKi9cbiAgcHJpdmF0ZSBfY2xvc2VTaWJsaW5nVHJpZ2dlcnMoKSB7XG4gICAgaWYgKHRoaXMuX3BhcmVudE1lbnUpIHtcbiAgICAgIC8vIElmIG5vdGhpbmcgd2FzIHJlbW92ZWQgZnJvbSB0aGUgc3RhY2sgYW5kIHRoZSBsYXN0IGVsZW1lbnQgaXMgbm90IHRoZSBwYXJlbnQgaXRlbVxuICAgICAgLy8gdGhhdCBtZWFucyB0aGF0IHRoZSBwYXJlbnQgbWVudSBpcyBhIG1lbnUgYmFyIHNpbmNlIHdlIGRvbid0IHB1dCB0aGUgbWVudSBiYXIgb24gdGhlXG4gICAgICAvLyBzdGFja1xuICAgICAgY29uc3QgaXNQYXJlbnRNZW51QmFyID1cbiAgICAgICAgIXRoaXMubWVudVN0YWNrLmNsb3NlU3ViTWVudU9mKHRoaXMuX3BhcmVudE1lbnUpICYmXG4gICAgICAgIHRoaXMubWVudVN0YWNrLnBlZWsoKSAhPT0gdGhpcy5fcGFyZW50TWVudTtcblxuICAgICAgaWYgKGlzUGFyZW50TWVudUJhcikge1xuICAgICAgICB0aGlzLm1lbnVTdGFjay5jbG9zZUFsbCgpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLm1lbnVTdGFjay5jbG9zZUFsbCgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBHZXQgdGhlIGNvbmZpZ3VyYXRpb24gb2JqZWN0IHVzZWQgdG8gY3JlYXRlIHRoZSBvdmVybGF5ICovXG4gIHByaXZhdGUgX2dldE92ZXJsYXlDb25maWcoKSB7XG4gICAgcmV0dXJuIG5ldyBPdmVybGF5Q29uZmlnKHtcbiAgICAgIHBvc2l0aW9uU3RyYXRlZ3k6IHRoaXMuX2dldE92ZXJsYXlQb3NpdGlvblN0cmF0ZWd5KCksXG4gICAgICBzY3JvbGxTdHJhdGVneTogdGhpcy5fb3ZlcmxheS5zY3JvbGxTdHJhdGVnaWVzLmJsb2NrKCksXG4gICAgICBkaXJlY3Rpb246IHRoaXMuX2RpcmVjdGlvbmFsaXR5LFxuICAgIH0pO1xuICB9XG5cbiAgLyoqIEJ1aWxkIHRoZSBwb3NpdGlvbiBzdHJhdGVneSBmb3IgdGhlIG92ZXJsYXkgd2hpY2ggc3BlY2lmaWVzIHdoZXJlIHRvIHBsYWNlIHRoZSBtZW51ICovXG4gIHByaXZhdGUgX2dldE92ZXJsYXlQb3NpdGlvblN0cmF0ZWd5KCk6IEZsZXhpYmxlQ29ubmVjdGVkUG9zaXRpb25TdHJhdGVneSB7XG4gICAgcmV0dXJuIHRoaXMuX292ZXJsYXlcbiAgICAgIC5wb3NpdGlvbigpXG4gICAgICAuZmxleGlibGVDb25uZWN0ZWRUbyh0aGlzLl9lbGVtZW50UmVmKVxuICAgICAgLndpdGhQb3NpdGlvbnModGhpcy5fZ2V0T3ZlcmxheVBvc2l0aW9ucygpKTtcbiAgfVxuXG4gIC8qKiBEZXRlcm1pbmUgYW5kIHJldHVybiB3aGVyZSB0byBwb3NpdGlvbiB0aGUgb3BlbmVkIG1lbnUgcmVsYXRpdmUgdG8gdGhlIG1lbnUgaXRlbSAqL1xuICBwcml2YXRlIF9nZXRPdmVybGF5UG9zaXRpb25zKCk6IENvbm5lY3RlZFBvc2l0aW9uW10ge1xuICAgIHJldHVybiAoXG4gICAgICB0aGlzLm1lbnVQb3NpdGlvbiA/P1xuICAgICAgKCF0aGlzLl9wYXJlbnRNZW51IHx8IHRoaXMuX3BhcmVudE1lbnUub3JpZW50YXRpb24gPT09ICdob3Jpem9udGFsJ1xuICAgICAgICA/IFNUQU5EQVJEX0RST1BET1dOX0JFTE9XX1BPU0lUSU9OU1xuICAgICAgICA6IFNUQU5EQVJEX0RST1BET1dOX0FESkFDRU5UX1BPU0lUSU9OUylcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgcG9ydGFsIHRvIGJlIGF0dGFjaGVkIHRvIHRoZSBvdmVybGF5IHdoaWNoIGNvbnRhaW5zIHRoZSBtZW51LiBBbGxvd3MgZm9yIHRoZSBtZW51XG4gICAqIGNvbnRlbnQgdG8gY2hhbmdlIGR5bmFtaWNhbGx5IGFuZCBiZSByZWZsZWN0ZWQgaW4gdGhlIGFwcGxpY2F0aW9uLlxuICAgKi9cbiAgcHJpdmF0ZSBfZ2V0UG9ydGFsKCkge1xuICAgIGNvbnN0IGhhc01lbnVDb250ZW50Q2hhbmdlZCA9IHRoaXMuX21lbnVUZW1wbGF0ZVJlZiAhPT0gdGhpcy5fbWVudVBvcnRhbD8udGVtcGxhdGVSZWY7XG4gICAgaWYgKHRoaXMuX21lbnVUZW1wbGF0ZVJlZiAmJiAoIXRoaXMuX21lbnVQb3J0YWwgfHwgaGFzTWVudUNvbnRlbnRDaGFuZ2VkKSkge1xuICAgICAgdGhpcy5fbWVudVBvcnRhbCA9IG5ldyBUZW1wbGF0ZVBvcnRhbChcbiAgICAgICAgdGhpcy5fbWVudVRlbXBsYXRlUmVmLFxuICAgICAgICB0aGlzLl92aWV3Q29udGFpbmVyUmVmLFxuICAgICAgICB1bmRlZmluZWQsXG4gICAgICAgIHRoaXMuZ2V0Q2hpbGRNZW51SW5qZWN0b3IoKSxcbiAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX21lbnVQb3J0YWw7XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybiB0cnVlIGlmIGlmIHRoZSBlbmNsb3NpbmcgcGFyZW50IG1lbnUgaXMgY29uZmlndXJlZCBpbiBhIHZlcnRpY2FsIG9yaWVudGF0aW9uLlxuICAgKi9cbiAgcHJpdmF0ZSBfaXNQYXJlbnRWZXJ0aWNhbCgpIHtcbiAgICByZXR1cm4gdGhpcy5fcGFyZW50TWVudT8ub3JpZW50YXRpb24gPT09ICd2ZXJ0aWNhbCc7XG4gIH1cblxuICAvKipcbiAgICogU3Vic2NyaWJlIHRvIHRoZSBNZW51U3RhY2sgY2xvc2UgZXZlbnRzIGlmIHRoaXMgaXMgYSBzdGFuZGFsb25lIHRyaWdnZXIgYW5kIGNsb3NlIG91dCB0aGUgbWVudVxuICAgKiB0aGlzIHRyaWdnZXJzIHdoZW4gcmVxdWVzdGVkLlxuICAgKi9cbiAgcHJpdmF0ZSBfcmVnaXN0ZXJDbG9zZUhhbmRsZXIoKSB7XG4gICAgaWYgKCF0aGlzLl9wYXJlbnRNZW51KSB7XG4gICAgICB0aGlzLm1lbnVTdGFjay5jbG9zZWQucGlwZSh0YWtlVW50aWwodGhpcy5fZGVzdHJveWVkKSkuc3Vic2NyaWJlKGl0ZW0gPT4ge1xuICAgICAgICBpZiAoaXRlbSA9PT0gdGhpcy5jaGlsZE1lbnUpIHtcbiAgICAgICAgICB0aGlzLmNsb3NlTWVudSgpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICB0aGlzLl9kZXN0cm95T3ZlcmxheSgpO1xuXG4gICAgdGhpcy5fZGVzdHJveWVkLm5leHQoKTtcbiAgICB0aGlzLl9kZXN0cm95ZWQuY29tcGxldGUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdWJzY3JpYmUgdG8gdGhlIG92ZXJsYXlzIG91dHNpZGUgcG9pbnRlciBldmVudHMgc3RyZWFtIGFuZCBoYW5kbGUgY2xvc2luZyBvdXQgdGhlIHN0YWNrIGlmIGFcbiAgICogY2xpY2sgb2NjdXJzIG91dHNpZGUgdGhlIG1lbnVzLlxuICAgKi9cbiAgcHJpdmF0ZSBfc3Vic2NyaWJlVG9PdXRzaWRlQ2xpY2tzKCkge1xuICAgIGlmICh0aGlzLl9vdmVybGF5UmVmKSB7XG4gICAgICB0aGlzLl9vdmVybGF5UmVmXG4gICAgICAgIC5vdXRzaWRlUG9pbnRlckV2ZW50cygpXG4gICAgICAgIC5waXBlKHRha2VVbnRpbCh0aGlzLl9zdG9wT3V0c2lkZUNsaWNrc0xpc3RlbmVyKSlcbiAgICAgICAgLnN1YnNjcmliZShldmVudCA9PiB7XG4gICAgICAgICAgaWYgKCFpc0NsaWNrSW5zaWRlTWVudU92ZXJsYXkoZXZlbnQudGFyZ2V0IGFzIEVsZW1lbnQpKSB7XG4gICAgICAgICAgICB0aGlzLm1lbnVTdGFjay5jbG9zZUFsbCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqIERlc3Ryb3kgYW5kIHVuc2V0IHRoZSBvdmVybGF5IHJlZmVyZW5jZSBpdCBpZiBleGlzdHMgKi9cbiAgcHJpdmF0ZSBfZGVzdHJveU92ZXJsYXkoKSB7XG4gICAgaWYgKHRoaXMuX292ZXJsYXlSZWYpIHtcbiAgICAgIHRoaXMuX292ZXJsYXlSZWYuZGlzcG9zZSgpO1xuICAgICAgdGhpcy5fb3ZlcmxheVJlZiA9IG51bGw7XG4gICAgfVxuICB9XG59XG4iXX0=