/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, ElementRef, EventEmitter, Inject, Input, NgZone, Optional, Output, Self, } from '@angular/core';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { ENTER, LEFT_ARROW, RIGHT_ARROW, SPACE } from '@angular/cdk/keycodes';
import { Directionality } from '@angular/cdk/bidi';
import { fromEvent, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { CdkMenuItemTrigger } from './menu-item-trigger';
import { CDK_MENU } from './menu-interface';
import { MENU_STACK, MenuStack } from './menu-stack';
import { MENU_AIM } from './menu-aim';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/bidi";
import * as i2 from "./menu-item-trigger";
import * as i3 from "./menu-stack";
/**
 * Directive which provides the ability for an element to be focused and navigated to using the
 * keyboard when residing in a CdkMenu, CdkMenuBar, or CdkMenuGroup. It performs user defined
 * behavior when clicked.
 */
export class CdkMenuItem {
    constructor(_elementRef, _ngZone, _menuStack, _parentMenu, _menuAim, _dir, 
    /** Reference to the CdkMenuItemTrigger directive if one is added to the same element */
    // `CdkMenuItem` is commonly used in combination with a `CdkMenuItemTrigger`.
    // tslint:disable-next-line: lightweight-tokens
    _menuTrigger) {
        this._elementRef = _elementRef;
        this._ngZone = _ngZone;
        this._menuStack = _menuStack;
        this._parentMenu = _parentMenu;
        this._menuAim = _menuAim;
        this._dir = _dir;
        this._menuTrigger = _menuTrigger;
        this._disabled = false;
        /**
         * If this MenuItem is a regular MenuItem, outputs when it is triggered by a keyboard or mouse
         * event.
         */
        this.triggered = new EventEmitter();
        /**
         * The tabindex for this menu item managed internally and used for implementing roving a
         * tab index.
         */
        this._tabindex = -1;
        /** Whether the item should close the menu if triggered by the spacebar. */
        this.closeOnSpacebarTrigger = true;
        /** Emits when the menu item is destroyed. */
        this._destroyed = new Subject();
        this._setupMouseEnter();
        if (this._isStandaloneItem()) {
            this._tabindex = 0;
        }
    }
    /**  Whether the CdkMenuItem is disabled - defaults to false */
    get disabled() {
        return this._disabled;
    }
    set disabled(value) {
        this._disabled = coerceBooleanProperty(value);
    }
    /** Place focus on the element. */
    focus() {
        this._elementRef.nativeElement.focus();
    }
    /** Reset the _tabindex to -1. */
    _resetTabIndex() {
        if (!this._isStandaloneItem()) {
            this._tabindex = -1;
        }
    }
    /**
     * Set the tab index to 0 if not disabled and it's a focus event, or a mouse enter if this element
     * is not in a menu bar.
     */
    _setTabIndex(event) {
        if (this.disabled) {
            return;
        }
        // don't set the tabindex if there are no open sibling or parent menus
        if (!event || !this._menuStack.isEmpty()) {
            this._tabindex = 0;
        }
    }
    /** Whether this menu item is standalone or within a menu or menu bar. */
    _isStandaloneItem() {
        return !this._parentMenu;
    }
    /**
     * If the menu item is not disabled and the element does not have a menu trigger attached, emit
     * on the cdkMenuItemTriggered emitter and close all open menus.
     */
    trigger(options) {
        const { keepOpen } = { ...options };
        if (!this.disabled && !this.hasMenu()) {
            this.triggered.next();
            if (!keepOpen) {
                this._menuStack.closeAll({ focusParentTrigger: true });
            }
        }
    }
    /** Whether the menu item opens a menu. */
    hasMenu() {
        return !!this._menuTrigger;
    }
    /** Return true if this MenuItem has an attached menu and it is open. */
    isMenuOpen() {
        return !!this._menuTrigger?.isOpen();
    }
    /**
     * Get a reference to the rendered Menu if the Menu is open and it is visible in the DOM.
     * @return the menu if it is open, otherwise undefined.
     */
    getMenu() {
        return this._menuTrigger?.getMenu();
    }
    /** Get the MenuItemTrigger associated with this element. */
    getMenuTrigger() {
        return this._menuTrigger;
    }
    /** Get the label for this element which is required by the FocusableOption interface. */
    getLabel() {
        return this.typeahead || this._elementRef.nativeElement.textContent?.trim() || '';
    }
    /**
     * Handles keyboard events for the menu item, specifically either triggering the user defined
     * callback or opening/closing the current menu based on whether the left or right arrow key was
     * pressed.
     * @param event the keyboard event to handle
     */
    _onKeydown(event) {
        switch (event.keyCode) {
            case SPACE:
            case ENTER:
                event.preventDefault();
                this.trigger({ keepOpen: event.keyCode === SPACE && !this.closeOnSpacebarTrigger });
                break;
            case RIGHT_ARROW:
                if (this._parentMenu && this._isParentVertical()) {
                    if (this._dir?.value !== 'rtl') {
                        this._forwardArrowPressed(event);
                    }
                    else {
                        this._backArrowPressed(event);
                    }
                }
                break;
            case LEFT_ARROW:
                if (this._parentMenu && this._isParentVertical()) {
                    if (this._dir?.value !== 'rtl') {
                        this._backArrowPressed(event);
                    }
                    else {
                        this._forwardArrowPressed(event);
                    }
                }
                break;
        }
    }
    _backArrowPressed(event) {
        const parentMenu = this._parentMenu;
        if (this._menuStack.hasInlineMenu() || this._menuStack.length() > 1) {
            event.preventDefault();
            this._menuStack.close(parentMenu, {
                focusNextOnEmpty: 1 /* previousItem */,
                focusParentTrigger: true,
            });
        }
    }
    _forwardArrowPressed(event) {
        if (!this.hasMenu() && this._menuStack.hasInlineMenu()) {
            event.preventDefault();
            this._menuStack.closeAll({ focusNextOnEmpty: 0 /* nextItem */, focusParentTrigger: true });
        }
    }
    /**
     * Subscribe to the mouseenter events and close any sibling menu items if this element is moused
     * into.
     */
    _setupMouseEnter() {
        if (!this._isStandaloneItem()) {
            const closeOpenSiblings = () => this._ngZone.run(() => this._menuStack.closeSubMenuOf(this._parentMenu));
            this._ngZone.runOutsideAngular(() => fromEvent(this._elementRef.nativeElement, 'mouseenter')
                .pipe(filter(() => !this._menuStack.isEmpty() && !this.hasMenu()), takeUntil(this._destroyed))
                .subscribe(() => {
                if (this._menuAim) {
                    this._menuAim.toggle(closeOpenSiblings);
                }
                else {
                    closeOpenSiblings();
                }
            }));
        }
    }
    /**
     * Return true if the enclosing parent menu is configured in a horizontal orientation, false
     * otherwise or if no parent.
     */
    _isParentVertical() {
        return this._parentMenu?.orientation === 'vertical';
    }
    ngOnDestroy() {
        this._destroyed.next();
    }
}
CdkMenuItem.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.0.0-next.9", ngImport: i0, type: CdkMenuItem, deps: [{ token: i0.ElementRef }, { token: i0.NgZone }, { token: MENU_STACK }, { token: CDK_MENU, optional: true }, { token: MENU_AIM, optional: true }, { token: i1.Directionality, optional: true }, { token: i2.CdkMenuItemTrigger, optional: true, self: true }], target: i0.ɵɵFactoryTarget.Directive });
CdkMenuItem.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "14.0.0-next.9", type: CdkMenuItem, selector: "[cdkMenuItem]", inputs: { disabled: "disabled", typeahead: "typeahead" }, outputs: { triggered: "cdkMenuItemTriggered" }, host: { attributes: { "role": "menuitem" }, listeners: { "blur": "_resetTabIndex()", "focus": "_setTabIndex()", "click": "trigger()", "keydown": "_onKeydown($event)" }, properties: { "tabindex": "_tabindex", "attr.aria-disabled": "disabled || null" }, classAttribute: "cdk-menu-item" }, exportAs: ["cdkMenuItem"], ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.0.0-next.9", ngImport: i0, type: CdkMenuItem, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkMenuItem]',
                    exportAs: 'cdkMenuItem',
                    host: {
                        'role': 'menuitem',
                        'class': 'cdk-menu-item',
                        '[tabindex]': '_tabindex',
                        '[attr.aria-disabled]': 'disabled || null',
                        '(blur)': '_resetTabIndex()',
                        '(focus)': '_setTabIndex()',
                        '(click)': 'trigger()',
                        '(keydown)': '_onKeydown($event)',
                    },
                }]
        }], ctorParameters: function () { return [{ type: i0.ElementRef }, { type: i0.NgZone }, { type: i3.MenuStack, decorators: [{
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
                }] }, { type: i1.Directionality, decorators: [{
                    type: Optional
                }] }, { type: i2.CdkMenuItemTrigger, decorators: [{
                    type: Self
                }, {
                    type: Optional
                }] }]; }, propDecorators: { disabled: [{
                type: Input
            }], typeahead: [{
                type: Input
            }], triggered: [{
                type: Output,
                args: ['cdkMenuItemTriggered']
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1pdGVtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvbWVudS9tZW51LWl0ZW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUNMLFNBQVMsRUFDVCxVQUFVLEVBQ1YsWUFBWSxFQUNaLE1BQU0sRUFDTixLQUFLLEVBQ0wsTUFBTSxFQUVOLFFBQVEsRUFDUixNQUFNLEVBQ04sSUFBSSxHQUNMLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBZSxxQkFBcUIsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBRTFFLE9BQU8sRUFBQyxLQUFLLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUM1RSxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDakQsT0FBTyxFQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDeEMsT0FBTyxFQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUNqRCxPQUFPLEVBQUMsa0JBQWtCLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUN2RCxPQUFPLEVBQUMsUUFBUSxFQUFPLE1BQU0sa0JBQWtCLENBQUM7QUFDaEQsT0FBTyxFQUFZLFVBQVUsRUFBRSxTQUFTLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFFOUQsT0FBTyxFQUFDLFFBQVEsRUFBbUIsTUFBTSxZQUFZLENBQUM7Ozs7O0FBRXREOzs7O0dBSUc7QUFlSCxNQUFNLE9BQU8sV0FBVztJQW1DdEIsWUFDVyxXQUFvQyxFQUM1QixPQUFlLEVBQ0ssVUFBcUIsRUFDWCxXQUFrQixFQUNsQixRQUFrQixFQUNwQyxJQUFxQjtJQUNsRCx3RkFBd0Y7SUFDeEYsNkVBQTZFO0lBQzdFLCtDQUErQztJQUNWLFlBQWlDO1FBVDdELGdCQUFX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SSxRQUFROzRDQTFDZixRQUFRO3NCQURYLEtBQUs7Z0JBYUcsU0FBUztzQkFBakIsS0FBSztnQkFNbUMsU0FBUztzQkFBakQsTUFBTTt1QkFBQyxzQkFBc0IiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtcbiAgRGlyZWN0aXZlLFxuICBFbGVtZW50UmVmLFxuICBFdmVudEVtaXR0ZXIsXG4gIEluamVjdCxcbiAgSW5wdXQsXG4gIE5nWm9uZSxcbiAgT25EZXN0cm95LFxuICBPcHRpb25hbCxcbiAgT3V0cHV0LFxuICBTZWxmLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7Qm9vbGVhbklucHV0LCBjb2VyY2VCb29sZWFuUHJvcGVydHl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2VyY2lvbic7XG5pbXBvcnQge0ZvY3VzYWJsZU9wdGlvbn0gZnJvbSAnQGFuZ3VsYXIvY2RrL2ExMXknO1xuaW1wb3J0IHtFTlRFUiwgTEVGVF9BUlJPVywgUklHSFRfQVJST1csIFNQQUNFfSBmcm9tICdAYW5ndWxhci9jZGsva2V5Y29kZXMnO1xuaW1wb3J0IHtEaXJlY3Rpb25hbGl0eX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2JpZGknO1xuaW1wb3J0IHtmcm9tRXZlbnQsIFN1YmplY3R9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHtmaWx0ZXIsIHRha2VVbnRpbH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuaW1wb3J0IHtDZGtNZW51SXRlbVRyaWdnZXJ9IGZyb20gJy4vbWVudS1pdGVtLXRyaWdnZXInO1xuaW1wb3J0IHtDREtfTUVOVSwgTWVudX0gZnJvbSAnLi9tZW51LWludGVyZmFjZSc7XG5pbXBvcnQge0ZvY3VzTmV4dCwgTUVOVV9TVEFDSywgTWVudVN0YWNrfSBmcm9tICcuL21lbnUtc3RhY2snO1xuaW1wb3J0IHtGb2N1c2FibGVFbGVtZW50fSBmcm9tICcuL3BvaW50ZXItZm9jdXMtdHJhY2tlcic7XG5pbXBvcnQge01FTlVfQUlNLCBNZW51QWltLCBUb2dnbGVyfSBmcm9tICcuL21lbnUtYWltJztcblxuLyoqXG4gKiBEaXJlY3RpdmUgd2hpY2ggcHJvdmlkZXMgdGhlIGFiaWxpdHkgZm9yIGFuIGVsZW1lbnQgdG8gYmUgZm9jdXNlZCBhbmQgbmF2aWdhdGVkIHRvIHVzaW5nIHRoZVxuICoga2V5Ym9hcmQgd2hlbiByZXNpZGluZyBpbiBhIENka01lbnUsIENka01lbnVCYXIsIG9yIENka01lbnVHcm91cC4gSXQgcGVyZm9ybXMgdXNlciBkZWZpbmVkXG4gKiBiZWhhdmlvciB3aGVuIGNsaWNrZWQuXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tjZGtNZW51SXRlbV0nLFxuICBleHBvcnRBczogJ2Nka01lbnVJdGVtJyxcbiAgaG9zdDoge1xuICAgICdyb2xlJzogJ21lbnVpdGVtJyxcbiAgICAnY2xhc3MnOiAnY2RrLW1lbnUtaXRlbScsXG4gICAgJ1t0YWJpbmRleF0nOiAnX3RhYmluZGV4JyxcbiAgICAnW2F0dHIuYXJpYS1kaXNhYmxlZF0nOiAnZGlzYWJsZWQgfHwgbnVsbCcsXG4gICAgJyhibHVyKSc6ICdfcmVzZXRUYWJJbmRleCgpJyxcbiAgICAnKGZvY3VzKSc6ICdfc2V0VGFiSW5kZXgoKScsXG4gICAgJyhjbGljayknOiAndHJpZ2dlcigpJyxcbiAgICAnKGtleWRvd24pJzogJ19vbktleWRvd24oJGV2ZW50KScsXG4gIH0sXG59KVxuZXhwb3J0IGNsYXNzIENka01lbnVJdGVtIGltcGxlbWVudHMgRm9jdXNhYmxlT3B0aW9uLCBGb2N1c2FibGVFbGVtZW50LCBUb2dnbGVyLCBPbkRlc3Ryb3kge1xuICAvKiogIFdoZXRoZXIgdGhlIENka01lbnVJdGVtIGlzIGRpc2FibGVkIC0gZGVmYXVsdHMgdG8gZmFsc2UgKi9cbiAgQElucHV0KClcbiAgZ2V0IGRpc2FibGVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9kaXNhYmxlZDtcbiAgfVxuICBzZXQgZGlzYWJsZWQodmFsdWU6IEJvb2xlYW5JbnB1dCkge1xuICAgIHRoaXMuX2Rpc2FibGVkID0gY29lcmNlQm9vbGVhblByb3BlcnR5KHZhbHVlKTtcbiAgfVxuICBwcml2YXRlIF9kaXNhYmxlZCA9IGZhbHNlO1xuXG4gIC8qKlxuICAgKiBUaGUgdGV4dCB1c2VkIHRvIGxvY2F0ZSB0aGlzIGl0ZW0gZHVyaW5nIG1lbnUgdHlwZWFoZWFkLiBJZiBub3Qgc3BlY2lmaWVkLFxuICAgKiB0aGUgYHRleHRDb250ZW50YCBvZiB0aGUgaXRlbSB3aWxsIGJlIHVzZWQuXG4gICAqL1xuICBASW5wdXQoKSB0eXBlYWhlYWQ6IHN0cmluZztcblxuICAvKipcbiAgICogSWYgdGhpcyBNZW51SXRlbSBpcyBhIHJlZ3VsYXIgTWVudUl0ZW0sIG91dHB1dHMgd2hlbiBpdCBpcyB0cmlnZ2VyZWQgYnkgYSBrZXlib2FyZCBvciBtb3VzZVxuICAgKiBldmVudC5cbiAgICovXG4gIEBPdXRwdXQoJ2Nka01lbnVJdGVtVHJpZ2dlcmVkJykgcmVhZG9ubHkgdHJpZ2dlcmVkOiBFdmVudEVtaXR0ZXI8dm9pZD4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG5cbiAgLyoqXG4gICAqIFRoZSB0YWJpbmRleCBmb3IgdGhpcyBtZW51IGl0ZW0gbWFuYWdlZCBpbnRlcm5hbGx5IGFuZCB1c2VkIGZvciBpbXBsZW1lbnRpbmcgcm92aW5nIGFcbiAgICogdGFiIGluZGV4LlxuICAgKi9cbiAgX3RhYmluZGV4OiAwIHwgLTEgPSAtMTtcblxuICAvKiogV2hldGhlciB0aGUgaXRlbSBzaG91bGQgY2xvc2UgdGhlIG1lbnUgaWYgdHJpZ2dlcmVkIGJ5IHRoZSBzcGFjZWJhci4gKi9cbiAgcHJvdGVjdGVkIGNsb3NlT25TcGFjZWJhclRyaWdnZXIgPSB0cnVlO1xuXG4gIC8qKiBFbWl0cyB3aGVuIHRoZSBtZW51IGl0ZW0gaXMgZGVzdHJveWVkLiAqL1xuICBwcml2YXRlIHJlYWRvbmx5IF9kZXN0cm95ZWQgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHJlYWRvbmx5IF9lbGVtZW50UmVmOiBFbGVtZW50UmVmPEhUTUxFbGVtZW50PixcbiAgICBwcml2YXRlIHJlYWRvbmx5IF9uZ1pvbmU6IE5nWm9uZSxcbiAgICBASW5qZWN0KE1FTlVfU1RBQ0spIHByaXZhdGUgcmVhZG9ubHkgX21lbnVTdGFjazogTWVudVN0YWNrLFxuICAgIEBPcHRpb25hbCgpIEBJbmplY3QoQ0RLX01FTlUpIHByaXZhdGUgcmVhZG9ubHkgX3BhcmVudE1lbnU/OiBNZW51LFxuICAgIEBPcHRpb25hbCgpIEBJbmplY3QoTUVOVV9BSU0pIHByaXZhdGUgcmVhZG9ubHkgX21lbnVBaW0/OiBNZW51QWltLFxuICAgIEBPcHRpb25hbCgpIHByaXZhdGUgcmVhZG9ubHkgX2Rpcj86IERpcmVjdGlvbmFsaXR5LFxuICAgIC8qKiBSZWZlcmVuY2UgdG8gdGhlIENka01lbnVJdGVtVHJpZ2dlciBkaXJlY3RpdmUgaWYgb25lIGlzIGFkZGVkIHRvIHRoZSBzYW1lIGVsZW1lbnQgKi9cbiAgICAvLyBgQ2RrTWVudUl0ZW1gIGlzIGNvbW1vbmx5IHVzZWQgaW4gY29tYmluYXRpb24gd2l0aCBhIGBDZGtNZW51SXRlbVRyaWdnZXJgLlxuICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTogbGlnaHR3ZWlnaHQtdG9rZW5zXG4gICAgQFNlbGYoKSBAT3B0aW9uYWwoKSBwcml2YXRlIHJlYWRvbmx5IF9tZW51VHJpZ2dlcj86IENka01lbnVJdGVtVHJpZ2dlcixcbiAgKSB7XG4gICAgdGhpcy5fc2V0dXBNb3VzZUVudGVyKCk7XG5cbiAgICBpZiAodGhpcy5faXNTdGFuZGFsb25lSXRlbSgpKSB7XG4gICAgICB0aGlzLl90YWJpbmRleCA9IDA7XG4gICAgfVxuICB9XG5cbiAgLyoqIFBsYWNlIGZvY3VzIG9uIHRoZSBlbGVtZW50LiAqL1xuICBmb2N1cygpIHtcbiAgICB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQuZm9jdXMoKTtcbiAgfVxuXG4gIC8qKiBSZXNldCB0aGUgX3RhYmluZGV4IHRvIC0xLiAqL1xuICBfcmVzZXRUYWJJbmRleCgpIHtcbiAgICBpZiAoIXRoaXMuX2lzU3RhbmRhbG9uZUl0ZW0oKSkge1xuICAgICAgdGhpcy5fdGFiaW5kZXggPSAtMTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2V0IHRoZSB0YWIgaW5kZXggdG8gMCBpZiBub3QgZGlzYWJsZWQgYW5kIGl0J3MgYSBmb2N1cyBldmVudCwgb3IgYSBtb3VzZSBlbnRlciBpZiB0aGlzIGVsZW1lbnRcbiAgICogaXMgbm90IGluIGEgbWVudSBiYXIuXG4gICAqL1xuICBfc2V0VGFiSW5kZXgoZXZlbnQ/OiBNb3VzZUV2ZW50KSB7XG4gICAgaWYgKHRoaXMuZGlzYWJsZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBkb24ndCBzZXQgdGhlIHRhYmluZGV4IGlmIHRoZXJlIGFyZSBubyBvcGVuIHNpYmxpbmcgb3IgcGFyZW50IG1lbnVzXG4gICAgaWYgKCFldmVudCB8fCAhdGhpcy5fbWVudVN0YWNrLmlzRW1wdHkoKSkge1xuICAgICAgdGhpcy5fdGFiaW5kZXggPSAwO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoaXMgbWVudSBpdGVtIGlzIHN0YW5kYWxvbmUgb3Igd2l0aGluIGEgbWVudSBvciBtZW51IGJhci4gKi9cbiAgX2lzU3RhbmRhbG9uZUl0ZW0oKSB7XG4gICAgcmV0dXJuICF0aGlzLl9wYXJlbnRNZW51O1xuICB9XG5cbiAgLyoqXG4gICAqIElmIHRoZSBtZW51IGl0ZW0gaXMgbm90IGRpc2FibGVkIGFuZCB0aGUgZWxlbWVudCBkb2VzIG5vdCBoYXZlIGEgbWVudSB0cmlnZ2VyIGF0dGFjaGVkLCBlbWl0XG4gICAqIG9uIHRoZSBjZGtNZW51SXRlbVRyaWdnZXJlZCBlbWl0dGVyIGFuZCBjbG9zZSBhbGwgb3BlbiBtZW51cy5cbiAgICovXG4gIHRyaWdnZXIob3B0aW9ucz86IHtrZWVwT3BlbjogYm9vbGVhbn0pIHtcbiAgICBjb25zdCB7a2VlcE9wZW59ID0gey4uLm9wdGlvbnN9O1xuICAgIGlmICghdGhpcy5kaXNhYmxlZCAmJiAhdGhpcy5oYXNNZW51KCkpIHtcbiAgICAgIHRoaXMudHJpZ2dlcmVkLm5leHQoKTtcbiAgICAgIGlmICgha2VlcE9wZW4pIHtcbiAgICAgICAgdGhpcy5fbWVudVN0YWNrLmNsb3NlQWxsKHtmb2N1c1BhcmVudFRyaWdnZXI6IHRydWV9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKiogV2hldGhlciB0aGUgbWVudSBpdGVtIG9wZW5zIGEgbWVudS4gKi9cbiAgaGFzTWVudSgpIHtcbiAgICByZXR1cm4gISF0aGlzLl9tZW51VHJpZ2dlcjtcbiAgfVxuXG4gIC8qKiBSZXR1cm4gdHJ1ZSBpZiB0aGlzIE1lbnVJdGVtIGhhcyBhbiBhdHRhY2hlZCBtZW51IGFuZCBpdCBpcyBvcGVuLiAqL1xuICBpc01lbnVPcGVuKCkge1xuICAgIHJldHVybiAhIXRoaXMuX21lbnVUcmlnZ2VyPy5pc09wZW4oKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYSByZWZlcmVuY2UgdG8gdGhlIHJlbmRlcmVkIE1lbnUgaWYgdGhlIE1lbnUgaXMgb3BlbiBhbmQgaXQgaXMgdmlzaWJsZSBpbiB0aGUgRE9NLlxuICAgKiBAcmV0dXJuIHRoZSBtZW51IGlmIGl0IGlzIG9wZW4sIG90aGVyd2lzZSB1bmRlZmluZWQuXG4gICAqL1xuICBnZXRNZW51KCk6IE1lbnUgfCB1bmRlZmluZWQge1xuICAgIHJldHVybiB0aGlzLl9tZW51VHJpZ2dlcj8uZ2V0TWVudSgpO1xuICB9XG5cbiAgLyoqIEdldCB0aGUgTWVudUl0ZW1UcmlnZ2VyIGFzc29jaWF0ZWQgd2l0aCB0aGlzIGVsZW1lbnQuICovXG4gIGdldE1lbnVUcmlnZ2VyKCk6IENka01lbnVJdGVtVHJpZ2dlciB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIHRoaXMuX21lbnVUcmlnZ2VyO1xuICB9XG5cbiAgLyoqIEdldCB0aGUgbGFiZWwgZm9yIHRoaXMgZWxlbWVudCB3aGljaCBpcyByZXF1aXJlZCBieSB0aGUgRm9jdXNhYmxlT3B0aW9uIGludGVyZmFjZS4gKi9cbiAgZ2V0TGFiZWwoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy50eXBlYWhlYWQgfHwgdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LnRleHRDb250ZW50Py50cmltKCkgfHwgJyc7XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlcyBrZXlib2FyZCBldmVudHMgZm9yIHRoZSBtZW51IGl0ZW0sIHNwZWNpZmljYWxseSBlaXRoZXIgdHJpZ2dlcmluZyB0aGUgdXNlciBkZWZpbmVkXG4gICAqIGNhbGxiYWNrIG9yIG9wZW5pbmcvY2xvc2luZyB0aGUgY3VycmVudCBtZW51IGJhc2VkIG9uIHdoZXRoZXIgdGhlIGxlZnQgb3IgcmlnaHQgYXJyb3cga2V5IHdhc1xuICAgKiBwcmVzc2VkLlxuICAgKiBAcGFyYW0gZXZlbnQgdGhlIGtleWJvYXJkIGV2ZW50IHRvIGhhbmRsZVxuICAgKi9cbiAgX29uS2V5ZG93bihldmVudDogS2V5Ym9hcmRFdmVudCkge1xuICAgIHN3aXRjaCAoZXZlbnQua2V5Q29kZSkge1xuICAgICAgY2FzZSBTUEFDRTpcbiAgICAgIGNhc2UgRU5URVI6XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHRoaXMudHJpZ2dlcih7a2VlcE9wZW46IGV2ZW50LmtleUNvZGUgPT09IFNQQUNFICYmICF0aGlzLmNsb3NlT25TcGFjZWJhclRyaWdnZXJ9KTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgUklHSFRfQVJST1c6XG4gICAgICAgIGlmICh0aGlzLl9wYXJlbnRNZW51ICYmIHRoaXMuX2lzUGFyZW50VmVydGljYWwoKSkge1xuICAgICAgICAgIGlmICh0aGlzLl9kaXI/LnZhbHVlICE9PSAncnRsJykge1xuICAgICAgICAgICAgdGhpcy5fZm9yd2FyZEFycm93UHJlc3NlZChldmVudCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX2JhY2tBcnJvd1ByZXNzZWQoZXZlbnQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBMRUZUX0FSUk9XOlxuICAgICAgICBpZiAodGhpcy5fcGFyZW50TWVudSAmJiB0aGlzLl9pc1BhcmVudFZlcnRpY2FsKCkpIHtcbiAgICAgICAgICBpZiAodGhpcy5fZGlyPy52YWx1ZSAhPT0gJ3J0bCcpIHtcbiAgICAgICAgICAgIHRoaXMuX2JhY2tBcnJvd1ByZXNzZWQoZXZlbnQpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9mb3J3YXJkQXJyb3dQcmVzc2VkKGV2ZW50KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfYmFja0Fycm93UHJlc3NlZChldmVudDogS2V5Ym9hcmRFdmVudCkge1xuICAgIGNvbnN0IHBhcmVudE1lbnUgPSB0aGlzLl9wYXJlbnRNZW51ITtcbiAgICBpZiAodGhpcy5fbWVudVN0YWNrLmhhc0lubGluZU1lbnUoKSB8fCB0aGlzLl9tZW51U3RhY2subGVuZ3RoKCkgPiAxKSB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgdGhpcy5fbWVudVN0YWNrLmNsb3NlKHBhcmVudE1lbnUsIHtcbiAgICAgICAgZm9jdXNOZXh0T25FbXB0eTogRm9jdXNOZXh0LnByZXZpb3VzSXRlbSxcbiAgICAgICAgZm9jdXNQYXJlbnRUcmlnZ2VyOiB0cnVlLFxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfZm9yd2FyZEFycm93UHJlc3NlZChldmVudDogS2V5Ym9hcmRFdmVudCkge1xuICAgIGlmICghdGhpcy5oYXNNZW51KCkgJiYgdGhpcy5fbWVudVN0YWNrLmhhc0lubGluZU1lbnUoKSkge1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIHRoaXMuX21lbnVTdGFjay5jbG9zZUFsbCh7Zm9jdXNOZXh0T25FbXB0eTogRm9jdXNOZXh0Lm5leHRJdGVtLCBmb2N1c1BhcmVudFRyaWdnZXI6IHRydWV9KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU3Vic2NyaWJlIHRvIHRoZSBtb3VzZWVudGVyIGV2ZW50cyBhbmQgY2xvc2UgYW55IHNpYmxpbmcgbWVudSBpdGVtcyBpZiB0aGlzIGVsZW1lbnQgaXMgbW91c2VkXG4gICAqIGludG8uXG4gICAqL1xuICBwcml2YXRlIF9zZXR1cE1vdXNlRW50ZXIoKSB7XG4gICAgaWYgKCF0aGlzLl9pc1N0YW5kYWxvbmVJdGVtKCkpIHtcbiAgICAgIGNvbnN0IGNsb3NlT3BlblNpYmxpbmdzID0gKCkgPT5cbiAgICAgICAgdGhpcy5fbmdab25lLnJ1bigoKSA9PiB0aGlzLl9tZW51U3RhY2suY2xvc2VTdWJNZW51T2YodGhpcy5fcGFyZW50TWVudSEpKTtcblxuICAgICAgdGhpcy5fbmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+XG4gICAgICAgIGZyb21FdmVudCh0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQsICdtb3VzZWVudGVyJylcbiAgICAgICAgICAucGlwZShcbiAgICAgICAgICAgIGZpbHRlcigoKSA9PiAhdGhpcy5fbWVudVN0YWNrLmlzRW1wdHkoKSAmJiAhdGhpcy5oYXNNZW51KCkpLFxuICAgICAgICAgICAgdGFrZVVudGlsKHRoaXMuX2Rlc3Ryb3llZCksXG4gICAgICAgICAgKVxuICAgICAgICAgIC5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgICAgICAgaWYgKHRoaXMuX21lbnVBaW0pIHtcbiAgICAgICAgICAgICAgdGhpcy5fbWVudUFpbS50b2dnbGUoY2xvc2VPcGVuU2libGluZ3MpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgY2xvc2VPcGVuU2libGluZ3MoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KSxcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybiB0cnVlIGlmIHRoZSBlbmNsb3NpbmcgcGFyZW50IG1lbnUgaXMgY29uZmlndXJlZCBpbiBhIGhvcml6b250YWwgb3JpZW50YXRpb24sIGZhbHNlXG4gICAqIG90aGVyd2lzZSBvciBpZiBubyBwYXJlbnQuXG4gICAqL1xuICBwcml2YXRlIF9pc1BhcmVudFZlcnRpY2FsKCkge1xuICAgIHJldHVybiB0aGlzLl9wYXJlbnRNZW51Py5vcmllbnRhdGlvbiA9PT0gJ3ZlcnRpY2FsJztcbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIHRoaXMuX2Rlc3Ryb3llZC5uZXh0KCk7XG4gIH1cbn1cbiJdfQ==