/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, ElementRef, Inject, Injector, NgZone, Optional, ViewContainerRef, } from '@angular/core';
import { Directionality } from '@angular/cdk/bidi';
import { Overlay, OverlayConfig, STANDARD_DROPDOWN_ADJACENT_POSITIONS, STANDARD_DROPDOWN_BELOW_POSITIONS, } from '@angular/cdk/overlay';
import { DOWN_ARROW, ENTER, hasModifierKey, LEFT_ARROW, RIGHT_ARROW, SPACE, UP_ARROW, } from '@angular/cdk/keycodes';
import { fromEvent } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { CDK_MENU } from './menu-interface';
import { MENU_STACK, MenuStack, PARENT_OR_NEW_MENU_STACK_PROVIDER } from './menu-stack';
import { MENU_AIM } from './menu-aim';
import { CdkMenuTriggerBase, MENU_TRIGGER } from './menu-trigger-base';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/overlay";
import * as i2 from "@angular/cdk/bidi";
import * as i3 from "./menu-stack";
/**
 * A directive that turns its host element into a trigger for a popup menu.
 * It can be combined with cdkMenuItem to create sub-menus. If the element is in a top level
 * MenuBar it will open the menu on click, or if a sibling is already opened it will open on hover.
 * If it is inside of a Menu it will open the attached Submenu on hover regardless of its sibling
 * state.
 */
export class CdkMenuTrigger extends CdkMenuTriggerBase {
    constructor(
    /** The DI injector for this component. */
    injector, 
    /** The host element. */
    _elementRef, 
    /** The view container ref for this component. */
    viewContainerRef, 
    /** The CDK overlay service. */
    _overlay, 
    /** The Angular zone. */
    _ngZone, 
    /** The menu stack this trigger belongs to. */
    menuStack, 
    /** The parent menu this trigger belongs to. */
    _parentMenu, 
    /** The menu aim service used by this menu. */
    _menuAim, 
    /** The directionality of the page. */
    _directionality) {
        super(injector, viewContainerRef, menuStack);
        this._elementRef = _elementRef;
        this._overlay = _overlay;
        this._ngZone = _ngZone;
        this._parentMenu = _parentMenu;
        this._menuAim = _menuAim;
        this._directionality = _directionality;
        this._registerCloseHandler();
        this._subscribeToMenuStackClosed();
        this._subscribeToMouseEnter();
        this._subscribeToMenuStackHasFocus();
    }
    /** Toggle the attached menu. */
    toggle() {
        this.isOpen() ? this.close() : this.open();
    }
    /** Open the attached menu. */
    open() {
        if (!this.isOpen()) {
            this.opened.next();
            this.overlayRef = this.overlayRef || this._overlay.create(this._getOverlayConfig());
            this.overlayRef.attach(this.getMenuContentPortal());
            this._subscribeToOutsideClicks();
        }
    }
    /** Close the opened menu. */
    close() {
        if (this.isOpen()) {
            this.closed.next();
            this.overlayRef.detach();
        }
        this._closeSiblingTriggers();
    }
    /**
     * Get a reference to the rendered Menu if the Menu is open and rendered in the DOM.
     */
    getMenu() {
        return this.childMenu;
    }
    /**
     * Handles keyboard events for the menu item.
     * @param event The keyboard event to handle
     */
    _toggleOnKeydown(event) {
        const isParentVertical = this._parentMenu?.orientation === 'vertical';
        const keyCode = event.keyCode;
        switch (keyCode) {
            case SPACE:
            case ENTER:
                if (!hasModifierKey(event)) {
                    event.preventDefault();
                    this.toggle();
                    this.childMenu?.focusFirstItem('keyboard');
                }
                break;
            case RIGHT_ARROW:
                if (!hasModifierKey(event)) {
                    if (this._parentMenu && isParentVertical && this._directionality?.value !== 'rtl') {
                        event.preventDefault();
                        this.open();
                        this.childMenu?.focusFirstItem('keyboard');
                    }
                }
                break;
            case LEFT_ARROW:
                if (!hasModifierKey(event)) {
                    if (this._parentMenu && isParentVertical && this._directionality?.value === 'rtl') {
                        event.preventDefault();
                        this.open();
                        this.childMenu?.focusFirstItem('keyboard');
                    }
                }
                break;
            case DOWN_ARROW:
            case UP_ARROW:
                if (!hasModifierKey(event)) {
                    if (!isParentVertical) {
                        event.preventDefault();
                        this.open();
                        keyCode === DOWN_ARROW
                            ? this.childMenu?.focusFirstItem('keyboard')
                            : this.childMenu?.focusLastItem('keyboard');
                    }
                }
                break;
        }
    }
    /**
     * Sets whether the trigger's menu stack has focus.
     * @param hasFocus Whether the menu stack has focus.
     */
    _setHasFocus(hasFocus) {
        if (!this._parentMenu) {
            this.menuStack.setHasFocus(hasFocus);
        }
    }
    /**
     * Subscribe to the mouseenter events and close any sibling menu items if this element is moused
     * into.
     */
    _subscribeToMouseEnter() {
        // Closes any sibling menu items and opens the menu associated with this trigger.
        const toggleMenus = () => this._ngZone.run(() => {
            this._closeSiblingTriggers();
            this.open();
        });
        this._ngZone.runOutsideAngular(() => {
            fromEvent(this._elementRef.nativeElement, 'mouseenter')
                .pipe(filter(() => !this.menuStack.isEmpty() && !this.isOpen()), takeUntil(this.destroyed))
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
    /** Get the configuration object used to create the overlay. */
    _getOverlayConfig() {
        return new OverlayConfig({
            positionStrategy: this._getOverlayPositionStrategy(),
            scrollStrategy: this._overlay.scrollStrategies.block(),
            direction: this._directionality,
        });
    }
    /** Build the position strategy for the overlay which specifies where to place the menu. */
    _getOverlayPositionStrategy() {
        return this._overlay
            .position()
            .flexibleConnectedTo(this._elementRef)
            .withPositions(this._getOverlayPositions());
    }
    /** Get the preferred positions for the opened menu relative to the menu item. */
    _getOverlayPositions() {
        return (this.menuPosition ??
            (!this._parentMenu || this._parentMenu.orientation === 'horizontal'
                ? STANDARD_DROPDOWN_BELOW_POSITIONS
                : STANDARD_DROPDOWN_ADJACENT_POSITIONS));
    }
    /**
     * Subscribe to the MenuStack close events if this is a standalone trigger and close out the menu
     * this triggers when requested.
     */
    _registerCloseHandler() {
        if (!this._parentMenu) {
            this.menuStack.closed.pipe(takeUntil(this.destroyed)).subscribe(({ item }) => {
                if (item === this.childMenu) {
                    this.close();
                }
            });
        }
    }
    /**
     * Subscribe to the overlays outside pointer events stream and handle closing out the stack if a
     * click occurs outside the menus.
     */
    _subscribeToOutsideClicks() {
        if (this.overlayRef) {
            this.overlayRef
                .outsidePointerEvents()
                .pipe(filter(e => e.target != this._elementRef.nativeElement &&
                !this._elementRef.nativeElement.contains(e.target)), takeUntil(this.stopOutsideClicksListener))
                .subscribe(event => {
                if (!this.isElementInsideMenuStack(event.target)) {
                    this.menuStack.closeAll();
                }
                else {
                    this._closeSiblingTriggers();
                }
            });
        }
    }
    /** Subscribe to the MenuStack hasFocus events. */
    _subscribeToMenuStackHasFocus() {
        if (!this._parentMenu) {
            this.menuStack.hasFocus.pipe(takeUntil(this.destroyed)).subscribe(hasFocus => {
                if (!hasFocus) {
                    this.menuStack.closeAll();
                }
            });
        }
    }
    /** Subscribe to the MenuStack closed events. */
    _subscribeToMenuStackClosed() {
        if (!this._parentMenu) {
            this.menuStack.closed.subscribe(({ focusParentTrigger }) => {
                if (focusParentTrigger && !this.menuStack.length()) {
                    this._elementRef.nativeElement.focus();
                }
            });
        }
    }
}
CdkMenuTrigger.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.0.0-next.9", ngImport: i0, type: CdkMenuTrigger, deps: [{ token: i0.Injector }, { token: i0.ElementRef }, { token: i0.ViewContainerRef }, { token: i1.Overlay }, { token: i0.NgZone }, { token: MENU_STACK }, { token: CDK_MENU, optional: true }, { token: MENU_AIM, optional: true }, { token: i2.Directionality, optional: true }], target: i0.ɵɵFactoryTarget.Directive });
CdkMenuTrigger.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "14.0.0-next.9", type: CdkMenuTrigger, selector: "[cdkMenuTriggerFor]", inputs: { menuTemplateRef: ["cdkMenuTriggerFor", "menuTemplateRef"], menuPosition: ["cdkMenuPosition", "menuPosition"] }, outputs: { opened: "cdkMenuOpened", closed: "cdkMenuClosed" }, host: { attributes: { "aria-haspopup": "menu" }, listeners: { "focusin": "_setHasFocus(true)", "focusout": "_setHasFocus(false)", "keydown": "_toggleOnKeydown($event)", "click": "toggle()" }, properties: { "attr.aria-expanded": "isOpen()" }, classAttribute: "cdk-menu-trigger" }, providers: [
        { provide: MENU_TRIGGER, useExisting: CdkMenuTrigger },
        PARENT_OR_NEW_MENU_STACK_PROVIDER,
    ], exportAs: ["cdkMenuTriggerFor"], usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.0.0-next.9", ngImport: i0, type: CdkMenuTrigger, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkMenuTriggerFor]',
                    exportAs: 'cdkMenuTriggerFor',
                    host: {
                        'class': 'cdk-menu-trigger',
                        'aria-haspopup': 'menu',
                        '[attr.aria-expanded]': 'isOpen()',
                        '(focusin)': '_setHasFocus(true)',
                        '(focusout)': '_setHasFocus(false)',
                        '(keydown)': '_toggleOnKeydown($event)',
                        '(click)': 'toggle()',
                    },
                    inputs: ['menuTemplateRef: cdkMenuTriggerFor', 'menuPosition: cdkMenuPosition'],
                    outputs: ['opened: cdkMenuOpened', 'closed: cdkMenuClosed'],
                    providers: [
                        { provide: MENU_TRIGGER, useExisting: CdkMenuTrigger },
                        PARENT_OR_NEW_MENU_STACK_PROVIDER,
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
                }] }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS10cmlnZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvbWVudS9tZW51LXRyaWdnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUNMLFNBQVMsRUFDVCxVQUFVLEVBQ1YsTUFBTSxFQUNOLFFBQVEsRUFDUixNQUFNLEVBRU4sUUFBUSxFQUNSLGdCQUFnQixHQUNqQixNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDakQsT0FBTyxFQUdMLE9BQU8sRUFDUCxhQUFhLEVBQ2Isb0NBQW9DLEVBQ3BDLGlDQUFpQyxHQUNsQyxNQUFNLHNCQUFzQixDQUFDO0FBQzlCLE9BQU8sRUFDTCxVQUFVLEVBQ1YsS0FBSyxFQUNMLGNBQWMsRUFDZCxVQUFVLEVBQ1YsV0FBVyxFQUNYLEtBQUssRUFDTCxRQUFRLEdBQ1QsTUFBTSx1QkFBdUIsQ0FBQztBQUMvQixPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQy9CLE9BQU8sRUFBQyxNQUFNLEVBQUUsU0FBUyxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDakQsT0FBTyxFQUFDLFFBQVEsRUFBTyxNQUFNLGtCQUFrQixDQUFDO0FBQ2hELE9BQU8sRUFBQyxVQUFVLEVBQUUsU0FBUyxFQUFFLGlDQUFpQyxFQUFDLE1BQU0sY0FBYyxDQUFDO0FBQ3RGLE9BQU8sRUFBQyxRQUFRLEVBQVUsTUFBTSxZQUFZLENBQUM7QUFDN0MsT0FBTyxFQUFDLGtCQUFrQixFQUFFLFlBQVksRUFBQyxNQUFNLHFCQUFxQixDQUFDOzs7OztBQUVyRTs7Ozs7O0dBTUc7QUFvQkgsTUFBTSxPQUFPLGNBQWUsU0FBUSxrQkFBa0I7SUFDcEQ7SUFDRSwwQ0FBMEM7SUFDMUMsUUFBa0I7SUFDbEIsd0JBQXdCO0lBQ1AsV0FBb0M7SUFD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LFFBQVE7OzBCQUFJLE1BQU07MkJBQUMsUUFBUTs7MEJBRTNCLFFBQVEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtcbiAgRGlyZWN0aXZlLFxuICBFbGVtZW50UmVmLFxuICBJbmplY3QsXG4gIEluamVjdG9yLFxuICBOZ1pvbmUsXG4gIE9uRGVzdHJveSxcbiAgT3B0aW9uYWwsXG4gIFZpZXdDb250YWluZXJSZWYsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtEaXJlY3Rpb25hbGl0eX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2JpZGknO1xuaW1wb3J0IHtcbiAgQ29ubmVjdGVkUG9zaXRpb24sXG4gIEZsZXhpYmxlQ29ubmVjdGVkUG9zaXRpb25TdHJhdGVneSxcbiAgT3ZlcmxheSxcbiAgT3ZlcmxheUNvbmZpZyxcbiAgU1RBTkRBUkRfRFJPUERPV05fQURKQUNFTlRfUE9TSVRJT05TLFxuICBTVEFOREFSRF9EUk9QRE9XTl9CRUxPV19QT1NJVElPTlMsXG59IGZyb20gJ0Bhbmd1bGFyL2Nkay9vdmVybGF5JztcbmltcG9ydCB7XG4gIERPV05fQVJST1csXG4gIEVOVEVSLFxuICBoYXNNb2RpZmllcktleSxcbiAgTEVGVF9BUlJPVyxcbiAgUklHSFRfQVJST1csXG4gIFNQQUNFLFxuICBVUF9BUlJPVyxcbn0gZnJvbSAnQGFuZ3VsYXIvY2RrL2tleWNvZGVzJztcbmltcG9ydCB7ZnJvbUV2ZW50fSBmcm9tICdyeGpzJztcbmltcG9ydCB7ZmlsdGVyLCB0YWtlVW50aWx9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7Q0RLX01FTlUsIE1lbnV9IGZyb20gJy4vbWVudS1pbnRlcmZhY2UnO1xuaW1wb3J0IHtNRU5VX1NUQUNLLCBNZW51U3RhY2ssIFBBUkVOVF9PUl9ORVdfTUVOVV9TVEFDS19QUk9WSURFUn0gZnJvbSAnLi9tZW51LXN0YWNrJztcbmltcG9ydCB7TUVOVV9BSU0sIE1lbnVBaW19IGZyb20gJy4vbWVudS1haW0nO1xuaW1wb3J0IHtDZGtNZW51VHJpZ2dlckJhc2UsIE1FTlVfVFJJR0dFUn0gZnJvbSAnLi9tZW51LXRyaWdnZXItYmFzZSc7XG5cbi8qKlxuICogQSBkaXJlY3RpdmUgdGhhdCB0dXJucyBpdHMgaG9zdCBlbGVtZW50IGludG8gYSB0cmlnZ2VyIGZvciBhIHBvcHVwIG1lbnUuXG4gKiBJdCBjYW4gYmUgY29tYmluZWQgd2l0aCBjZGtNZW51SXRlbSB0byBjcmVhdGUgc3ViLW1lbnVzLiBJZiB0aGUgZWxlbWVudCBpcyBpbiBhIHRvcCBsZXZlbFxuICogTWVudUJhciBpdCB3aWxsIG9wZW4gdGhlIG1lbnUgb24gY2xpY2ssIG9yIGlmIGEgc2libGluZyBpcyBhbHJlYWR5IG9wZW5lZCBpdCB3aWxsIG9wZW4gb24gaG92ZXIuXG4gKiBJZiBpdCBpcyBpbnNpZGUgb2YgYSBNZW51IGl0IHdpbGwgb3BlbiB0aGUgYXR0YWNoZWQgU3VibWVudSBvbiBob3ZlciByZWdhcmRsZXNzIG9mIGl0cyBzaWJsaW5nXG4gKiBzdGF0ZS5cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW2Nka01lbnVUcmlnZ2VyRm9yXScsXG4gIGV4cG9ydEFzOiAnY2RrTWVudVRyaWdnZXJGb3InLFxuICBob3N0OiB7XG4gICAgJ2NsYXNzJzogJ2Nkay1tZW51LXRyaWdnZXInLFxuICAgICdhcmlhLWhhc3BvcHVwJzogJ21lbnUnLFxuICAgICdbYXR0ci5hcmlhLWV4cGFuZGVkXSc6ICdpc09wZW4oKScsXG4gICAgJyhmb2N1c2luKSc6ICdfc2V0SGFzRm9jdXModHJ1ZSknLFxuICAgICcoZm9jdXNvdXQpJzogJ19zZXRIYXNGb2N1cyhmYWxzZSknLFxuICAgICcoa2V5ZG93biknOiAnX3RvZ2dsZU9uS2V5ZG93bigkZXZlbnQpJyxcbiAgICAnKGNsaWNrKSc6ICd0b2dnbGUoKScsXG4gIH0sXG4gIGlucHV0czogWydtZW51VGVtcGxhdGVSZWY6IGNka01lbnVUcmlnZ2VyRm9yJywgJ21lbnVQb3NpdGlvbjogY2RrTWVudVBvc2l0aW9uJ10sXG4gIG91dHB1dHM6IFsnb3BlbmVkOiBjZGtNZW51T3BlbmVkJywgJ2Nsb3NlZDogY2RrTWVudUNsb3NlZCddLFxuICBwcm92aWRlcnM6IFtcbiAgICB7cHJvdmlkZTogTUVOVV9UUklHR0VSLCB1c2VFeGlzdGluZzogQ2RrTWVudVRyaWdnZXJ9LFxuICAgIFBBUkVOVF9PUl9ORVdfTUVOVV9TVEFDS19QUk9WSURFUixcbiAgXSxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrTWVudVRyaWdnZXIgZXh0ZW5kcyBDZGtNZW51VHJpZ2dlckJhc2UgaW1wbGVtZW50cyBPbkRlc3Ryb3kge1xuICBjb25zdHJ1Y3RvcihcbiAgICAvKiogVGhlIERJIGluamVjdG9yIGZvciB0aGlzIGNvbXBvbmVudC4gKi9cbiAgICBpbmplY3RvcjogSW5qZWN0b3IsXG4gICAgLyoqIFRoZSBob3N0IGVsZW1lbnQuICovXG4gICAgcHJpdmF0ZSByZWFkb25seSBfZWxlbWVudFJlZjogRWxlbWVudFJlZjxIVE1MRWxlbWVudD4sXG4gICAgLyoqIFRoZSB2aWV3IGNvbnRhaW5lciByZWYgZm9yIHRoaXMgY29tcG9uZW50LiAqL1xuICAgIHZpZXdDb250YWluZXJSZWY6IFZpZXdDb250YWluZXJSZWYsXG4gICAgLyoqIFRoZSBDREsgb3ZlcmxheSBzZXJ2aWNlLiAqL1xuICAgIHByaXZhdGUgcmVhZG9ubHkgX292ZXJsYXk6IE92ZXJsYXksXG4gICAgLyoqIFRoZSBBbmd1bGFyIHpvbmUuICovXG4gICAgcHJpdmF0ZSByZWFkb25seSBfbmdab25lOiBOZ1pvbmUsXG4gICAgLyoqIFRoZSBtZW51IHN0YWNrIHRoaXMgdHJpZ2dlciBiZWxvbmdzIHRvLiAqL1xuICAgIEBJbmplY3QoTUVOVV9TVEFDSykgbWVudVN0YWNrOiBNZW51U3RhY2ssXG4gICAgLyoqIFRoZSBwYXJlbnQgbWVudSB0aGlzIHRyaWdnZXIgYmVsb25ncyB0by4gKi9cbiAgICBAT3B0aW9uYWwoKSBASW5qZWN0KENES19NRU5VKSBwcml2YXRlIHJlYWRvbmx5IF9wYXJlbnRNZW51PzogTWVudSxcbiAgICAvKiogVGhlIG1lbnUgYWltIHNlcnZpY2UgdXNlZCBieSB0aGlzIG1lbnUuICovXG4gICAgQE9wdGlvbmFsKCkgQEluamVjdChNRU5VX0FJTSkgcHJpdmF0ZSByZWFkb25seSBfbWVudUFpbT86IE1lbnVBaW0sXG4gICAgLyoqIFRoZSBkaXJlY3Rpb25hbGl0eSBvZiB0aGUgcGFnZS4gKi9cbiAgICBAT3B0aW9uYWwoKSBwcml2YXRlIHJlYWRvbmx5IF9kaXJlY3Rpb25hbGl0eT86IERpcmVjdGlvbmFsaXR5LFxuICApIHtcbiAgICBzdXBlcihpbmplY3Rvciwgdmlld0NvbnRhaW5lclJlZiwgbWVudVN0YWNrKTtcbiAgICB0aGlzLl9yZWdpc3RlckNsb3NlSGFuZGxlcigpO1xuICAgIHRoaXMuX3N1YnNjcmliZVRvTWVudVN0YWNrQ2xvc2VkKCk7XG4gICAgdGhpcy5fc3Vic2NyaWJlVG9Nb3VzZUVudGVyKCk7XG4gICAgdGhpcy5fc3Vic2NyaWJlVG9NZW51U3RhY2tIYXNGb2N1cygpO1xuICB9XG5cbiAgLyoqIFRvZ2dsZSB0aGUgYXR0YWNoZWQgbWVudS4gKi9cbiAgdG9nZ2xlKCkge1xuICAgIHRoaXMuaXNPcGVuKCkgPyB0aGlzLmNsb3NlKCkgOiB0aGlzLm9wZW4oKTtcbiAgfVxuXG4gIC8qKiBPcGVuIHRoZSBhdHRhY2hlZCBtZW51LiAqL1xuICBvcGVuKCkge1xuICAgIGlmICghdGhpcy5pc09wZW4oKSkge1xuICAgICAgdGhpcy5vcGVuZWQubmV4dCgpO1xuXG4gICAgICB0aGlzLm92ZXJsYXlSZWYgPSB0aGlzLm92ZXJsYXlSZWYgfHwgdGhpcy5fb3ZlcmxheS5jcmVhdGUodGhpcy5fZ2V0T3ZlcmxheUNvbmZpZygpKTtcbiAgICAgIHRoaXMub3ZlcmxheVJlZi5hdHRhY2godGhpcy5nZXRNZW51Q29udGVudFBvcnRhbCgpKTtcbiAgICAgIHRoaXMuX3N1YnNjcmliZVRvT3V0c2lkZUNsaWNrcygpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBDbG9zZSB0aGUgb3BlbmVkIG1lbnUuICovXG4gIGNsb3NlKCkge1xuICAgIGlmICh0aGlzLmlzT3BlbigpKSB7XG4gICAgICB0aGlzLmNsb3NlZC5uZXh0KCk7XG5cbiAgICAgIHRoaXMub3ZlcmxheVJlZiEuZGV0YWNoKCk7XG4gICAgfVxuICAgIHRoaXMuX2Nsb3NlU2libGluZ1RyaWdnZXJzKCk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGEgcmVmZXJlbmNlIHRvIHRoZSByZW5kZXJlZCBNZW51IGlmIHRoZSBNZW51IGlzIG9wZW4gYW5kIHJlbmRlcmVkIGluIHRoZSBET00uXG4gICAqL1xuICBnZXRNZW51KCk6IE1lbnUgfCB1bmRlZmluZWQge1xuICAgIHJldHVybiB0aGlzLmNoaWxkTWVudTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGVzIGtleWJvYXJkIGV2ZW50cyBmb3IgdGhlIG1lbnUgaXRlbS5cbiAgICogQHBhcmFtIGV2ZW50IFRoZSBrZXlib2FyZCBldmVudCB0byBoYW5kbGVcbiAgICovXG4gIF90b2dnbGVPbktleWRvd24oZXZlbnQ6IEtleWJvYXJkRXZlbnQpIHtcbiAgICBjb25zdCBpc1BhcmVudFZlcnRpY2FsID0gdGhpcy5fcGFyZW50TWVudT8ub3JpZW50YXRpb24gPT09ICd2ZXJ0aWNhbCc7XG4gICAgY29uc3Qga2V5Q29kZSA9IGV2ZW50LmtleUNvZGU7XG4gICAgc3dpdGNoIChrZXlDb2RlKSB7XG4gICAgICBjYXNlIFNQQUNFOlxuICAgICAgY2FzZSBFTlRFUjpcbiAgICAgICAgaWYgKCFoYXNNb2RpZmllcktleShldmVudCkpIHtcbiAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgIHRoaXMudG9nZ2xlKCk7XG4gICAgICAgICAgdGhpcy5jaGlsZE1lbnU/LmZvY3VzRmlyc3RJdGVtKCdrZXlib2FyZCcpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIFJJR0hUX0FSUk9XOlxuICAgICAgICBpZiAoIWhhc01vZGlmaWVyS2V5KGV2ZW50KSkge1xuICAgICAgICAgIGlmICh0aGlzLl9wYXJlbnRNZW51ICYmIGlzUGFyZW50VmVydGljYWwgJiYgdGhpcy5fZGlyZWN0aW9uYWxpdHk/LnZhbHVlICE9PSAncnRsJykge1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIHRoaXMub3BlbigpO1xuICAgICAgICAgICAgdGhpcy5jaGlsZE1lbnU/LmZvY3VzRmlyc3RJdGVtKCdrZXlib2FyZCcpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBMRUZUX0FSUk9XOlxuICAgICAgICBpZiAoIWhhc01vZGlmaWVyS2V5KGV2ZW50KSkge1xuICAgICAgICAgIGlmICh0aGlzLl9wYXJlbnRNZW51ICYmIGlzUGFyZW50VmVydGljYWwgJiYgdGhpcy5fZGlyZWN0aW9uYWxpdHk/LnZhbHVlID09PSAncnRsJykge1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIHRoaXMub3BlbigpO1xuICAgICAgICAgICAgdGhpcy5jaGlsZE1lbnU/LmZvY3VzRmlyc3RJdGVtKCdrZXlib2FyZCcpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBET1dOX0FSUk9XOlxuICAgICAgY2FzZSBVUF9BUlJPVzpcbiAgICAgICAgaWYgKCFoYXNNb2RpZmllcktleShldmVudCkpIHtcbiAgICAgICAgICBpZiAoIWlzUGFyZW50VmVydGljYWwpIHtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICB0aGlzLm9wZW4oKTtcbiAgICAgICAgICAgIGtleUNvZGUgPT09IERPV05fQVJST1dcbiAgICAgICAgICAgICAgPyB0aGlzLmNoaWxkTWVudT8uZm9jdXNGaXJzdEl0ZW0oJ2tleWJvYXJkJylcbiAgICAgICAgICAgICAgOiB0aGlzLmNoaWxkTWVudT8uZm9jdXNMYXN0SXRlbSgna2V5Ym9hcmQnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgd2hldGhlciB0aGUgdHJpZ2dlcidzIG1lbnUgc3RhY2sgaGFzIGZvY3VzLlxuICAgKiBAcGFyYW0gaGFzRm9jdXMgV2hldGhlciB0aGUgbWVudSBzdGFjayBoYXMgZm9jdXMuXG4gICAqL1xuICBfc2V0SGFzRm9jdXMoaGFzRm9jdXM6IGJvb2xlYW4pIHtcbiAgICBpZiAoIXRoaXMuX3BhcmVudE1lbnUpIHtcbiAgICAgIHRoaXMubWVudVN0YWNrLnNldEhhc0ZvY3VzKGhhc0ZvY3VzKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU3Vic2NyaWJlIHRvIHRoZSBtb3VzZWVudGVyIGV2ZW50cyBhbmQgY2xvc2UgYW55IHNpYmxpbmcgbWVudSBpdGVtcyBpZiB0aGlzIGVsZW1lbnQgaXMgbW91c2VkXG4gICAqIGludG8uXG4gICAqL1xuICBwcml2YXRlIF9zdWJzY3JpYmVUb01vdXNlRW50ZXIoKSB7XG4gICAgLy8gQ2xvc2VzIGFueSBzaWJsaW5nIG1lbnUgaXRlbXMgYW5kIG9wZW5zIHRoZSBtZW51IGFzc29jaWF0ZWQgd2l0aCB0aGlzIHRyaWdnZXIuXG4gICAgY29uc3QgdG9nZ2xlTWVudXMgPSAoKSA9PlxuICAgICAgdGhpcy5fbmdab25lLnJ1bigoKSA9PiB7XG4gICAgICAgIHRoaXMuX2Nsb3NlU2libGluZ1RyaWdnZXJzKCk7XG4gICAgICAgIHRoaXMub3BlbigpO1xuICAgICAgfSk7XG5cbiAgICB0aGlzLl9uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgZnJvbUV2ZW50KHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudCwgJ21vdXNlZW50ZXInKVxuICAgICAgICAucGlwZShcbiAgICAgICAgICBmaWx0ZXIoKCkgPT4gIXRoaXMubWVudVN0YWNrLmlzRW1wdHkoKSAmJiAhdGhpcy5pc09wZW4oKSksXG4gICAgICAgICAgdGFrZVVudGlsKHRoaXMuZGVzdHJveWVkKSxcbiAgICAgICAgKVxuICAgICAgICAuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgICAgICBpZiAodGhpcy5fbWVudUFpbSkge1xuICAgICAgICAgICAgdGhpcy5fbWVudUFpbS50b2dnbGUodG9nZ2xlTWVudXMpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0b2dnbGVNZW51cygpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICAvKiogQ2xvc2Ugb3V0IGFueSBzaWJsaW5nIG1lbnUgdHJpZ2dlciBtZW51cy4gKi9cbiAgcHJpdmF0ZSBfY2xvc2VTaWJsaW5nVHJpZ2dlcnMoKSB7XG4gICAgaWYgKHRoaXMuX3BhcmVudE1lbnUpIHtcbiAgICAgIC8vIElmIG5vdGhpbmcgd2FzIHJlbW92ZWQgZnJvbSB0aGUgc3RhY2sgYW5kIHRoZSBsYXN0IGVsZW1lbnQgaXMgbm90IHRoZSBwYXJlbnQgaXRlbVxuICAgICAgLy8gdGhhdCBtZWFucyB0aGF0IHRoZSBwYXJlbnQgbWVudSBpcyBhIG1lbnUgYmFyIHNpbmNlIHdlIGRvbid0IHB1dCB0aGUgbWVudSBiYXIgb24gdGhlXG4gICAgICAvLyBzdGFja1xuICAgICAgY29uc3QgaXNQYXJlbnRNZW51QmFyID1cbiAgICAgICAgIXRoaXMubWVudVN0YWNrLmNsb3NlU3ViTWVudU9mKHRoaXMuX3BhcmVudE1lbnUpICYmXG4gICAgICAgIHRoaXMubWVudVN0YWNrLnBlZWsoKSAhPT0gdGhpcy5fcGFyZW50TWVudTtcblxuICAgICAgaWYgKGlzUGFyZW50TWVudUJhcikge1xuICAgICAgICB0aGlzLm1lbnVTdGFjay5jbG9zZUFsbCgpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLm1lbnVTdGFjay5jbG9zZUFsbCgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBHZXQgdGhlIGNvbmZpZ3VyYXRpb24gb2JqZWN0IHVzZWQgdG8gY3JlYXRlIHRoZSBvdmVybGF5LiAqL1xuICBwcml2YXRlIF9nZXRPdmVybGF5Q29uZmlnKCkge1xuICAgIHJldHVybiBuZXcgT3ZlcmxheUNvbmZpZyh7XG4gICAgICBwb3NpdGlvblN0cmF0ZWd5OiB0aGlzLl9nZXRPdmVybGF5UG9zaXRpb25TdHJhdGVneSgpLFxuICAgICAgc2Nyb2xsU3RyYXRlZ3k6IHRoaXMuX292ZXJsYXkuc2Nyb2xsU3RyYXRlZ2llcy5ibG9jaygpLFxuICAgICAgZGlyZWN0aW9uOiB0aGlzLl9kaXJlY3Rpb25hbGl0eSxcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBCdWlsZCB0aGUgcG9zaXRpb24gc3RyYXRlZ3kgZm9yIHRoZSBvdmVybGF5IHdoaWNoIHNwZWNpZmllcyB3aGVyZSB0byBwbGFjZSB0aGUgbWVudS4gKi9cbiAgcHJpdmF0ZSBfZ2V0T3ZlcmxheVBvc2l0aW9uU3RyYXRlZ3koKTogRmxleGlibGVDb25uZWN0ZWRQb3NpdGlvblN0cmF0ZWd5IHtcbiAgICByZXR1cm4gdGhpcy5fb3ZlcmxheVxuICAgICAgLnBvc2l0aW9uKClcbiAgICAgIC5mbGV4aWJsZUNvbm5lY3RlZFRvKHRoaXMuX2VsZW1lbnRSZWYpXG4gICAgICAud2l0aFBvc2l0aW9ucyh0aGlzLl9nZXRPdmVybGF5UG9zaXRpb25zKCkpO1xuICB9XG5cbiAgLyoqIEdldCB0aGUgcHJlZmVycmVkIHBvc2l0aW9ucyBmb3IgdGhlIG9wZW5lZCBtZW51IHJlbGF0aXZlIHRvIHRoZSBtZW51IGl0ZW0uICovXG4gIHByaXZhdGUgX2dldE92ZXJsYXlQb3NpdGlvbnMoKTogQ29ubmVjdGVkUG9zaXRpb25bXSB7XG4gICAgcmV0dXJuIChcbiAgICAgIHRoaXMubWVudVBvc2l0aW9uID8/XG4gICAgICAoIXRoaXMuX3BhcmVudE1lbnUgfHwgdGhpcy5fcGFyZW50TWVudS5vcmllbnRhdGlvbiA9PT0gJ2hvcml6b250YWwnXG4gICAgICAgID8gU1RBTkRBUkRfRFJPUERPV05fQkVMT1dfUE9TSVRJT05TXG4gICAgICAgIDogU1RBTkRBUkRfRFJPUERPV05fQURKQUNFTlRfUE9TSVRJT05TKVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogU3Vic2NyaWJlIHRvIHRoZSBNZW51U3RhY2sgY2xvc2UgZXZlbnRzIGlmIHRoaXMgaXMgYSBzdGFuZGFsb25lIHRyaWdnZXIgYW5kIGNsb3NlIG91dCB0aGUgbWVudVxuICAgKiB0aGlzIHRyaWdnZXJzIHdoZW4gcmVxdWVzdGVkLlxuICAgKi9cbiAgcHJpdmF0ZSBfcmVnaXN0ZXJDbG9zZUhhbmRsZXIoKSB7XG4gICAgaWYgKCF0aGlzLl9wYXJlbnRNZW51KSB7XG4gICAgICB0aGlzLm1lbnVTdGFjay5jbG9zZWQucGlwZSh0YWtlVW50aWwodGhpcy5kZXN0cm95ZWQpKS5zdWJzY3JpYmUoKHtpdGVtfSkgPT4ge1xuICAgICAgICBpZiAoaXRlbSA9PT0gdGhpcy5jaGlsZE1lbnUpIHtcbiAgICAgICAgICB0aGlzLmNsb3NlKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTdWJzY3JpYmUgdG8gdGhlIG92ZXJsYXlzIG91dHNpZGUgcG9pbnRlciBldmVudHMgc3RyZWFtIGFuZCBoYW5kbGUgY2xvc2luZyBvdXQgdGhlIHN0YWNrIGlmIGFcbiAgICogY2xpY2sgb2NjdXJzIG91dHNpZGUgdGhlIG1lbnVzLlxuICAgKi9cbiAgcHJpdmF0ZSBfc3Vic2NyaWJlVG9PdXRzaWRlQ2xpY2tzKCkge1xuICAgIGlmICh0aGlzLm92ZXJsYXlSZWYpIHtcbiAgICAgIHRoaXMub3ZlcmxheVJlZlxuICAgICAgICAub3V0c2lkZVBvaW50ZXJFdmVudHMoKVxuICAgICAgICAucGlwZShcbiAgICAgICAgICBmaWx0ZXIoXG4gICAgICAgICAgICBlID0+XG4gICAgICAgICAgICAgIGUudGFyZ2V0ICE9IHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudCAmJlxuICAgICAgICAgICAgICAhdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LmNvbnRhaW5zKGUudGFyZ2V0IGFzIEVsZW1lbnQpLFxuICAgICAgICAgICksXG4gICAgICAgICAgdGFrZVVudGlsKHRoaXMuc3RvcE91dHNpZGVDbGlja3NMaXN0ZW5lciksXG4gICAgICAgIClcbiAgICAgICAgLnN1YnNjcmliZShldmVudCA9PiB7XG4gICAgICAgICAgaWYgKCF0aGlzLmlzRWxlbWVudEluc2lkZU1lbnVTdGFjayhldmVudC50YXJnZXQgYXMgRWxlbWVudCkpIHtcbiAgICAgICAgICAgIHRoaXMubWVudVN0YWNrLmNsb3NlQWxsKCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX2Nsb3NlU2libGluZ1RyaWdnZXJzKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvKiogU3Vic2NyaWJlIHRvIHRoZSBNZW51U3RhY2sgaGFzRm9jdXMgZXZlbnRzLiAqL1xuICBwcml2YXRlIF9zdWJzY3JpYmVUb01lbnVTdGFja0hhc0ZvY3VzKCkge1xuICAgIGlmICghdGhpcy5fcGFyZW50TWVudSkge1xuICAgICAgdGhpcy5tZW51U3RhY2suaGFzRm9jdXMucGlwZSh0YWtlVW50aWwodGhpcy5kZXN0cm95ZWQpKS5zdWJzY3JpYmUoaGFzRm9jdXMgPT4ge1xuICAgICAgICBpZiAoIWhhc0ZvY3VzKSB7XG4gICAgICAgICAgdGhpcy5tZW51U3RhY2suY2xvc2VBbGwoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFN1YnNjcmliZSB0byB0aGUgTWVudVN0YWNrIGNsb3NlZCBldmVudHMuICovXG4gIHByaXZhdGUgX3N1YnNjcmliZVRvTWVudVN0YWNrQ2xvc2VkKCkge1xuICAgIGlmICghdGhpcy5fcGFyZW50TWVudSkge1xuICAgICAgdGhpcy5tZW51U3RhY2suY2xvc2VkLnN1YnNjcmliZSgoe2ZvY3VzUGFyZW50VHJpZ2dlcn0pID0+IHtcbiAgICAgICAgaWYgKGZvY3VzUGFyZW50VHJpZ2dlciAmJiAhdGhpcy5tZW51U3RhY2subGVuZ3RoKCkpIHtcbiAgICAgICAgICB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQuZm9jdXMoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG59XG4iXX0=