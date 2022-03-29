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
        if (!event || !this._menuStack?.isEmpty()) {
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
    trigger() {
        if (!this.disabled && !this.hasMenu()) {
            this.triggered.next();
            this._menuStack?.closeAll();
        }
    }
    /** Whether the menu item opens a menu. */
    hasMenu() {
        return !!this._menuTrigger?.hasMenu();
    }
    /** Return true if this MenuItem has an attached menu and it is open. */
    isMenuOpen() {
        return !!this._menuTrigger?.isMenuOpen();
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
                this.trigger();
                break;
            case RIGHT_ARROW:
                if (this._parentMenu && this._isParentVertical()) {
                    if (this._dir?.value === 'rtl') {
                        event.preventDefault();
                        this._menuStack?.close(this._parentMenu, 1 /* previousItem */);
                    }
                    else if (!this.hasMenu()) {
                        event.preventDefault();
                        this._menuStack?.closeAll(0 /* nextItem */);
                    }
                }
                break;
            case LEFT_ARROW:
                if (this._parentMenu && this._isParentVertical()) {
                    if (this._dir?.value !== 'rtl') {
                        event.preventDefault();
                        this._menuStack?.close(this._parentMenu, 1 /* previousItem */);
                    }
                    else if (!this.hasMenu()) {
                        event.preventDefault();
                        this._menuStack?.closeAll(0 /* nextItem */);
                    }
                }
                break;
        }
    }
    /**
     * Subscribe to the mouseenter events and close any sibling menu items if this element is moused
     * into.
     */
    _setupMouseEnter() {
        if (!this._isStandaloneItem()) {
            const closeOpenSiblings = () => this._ngZone.run(() => this._menuStack?.closeSubMenuOf(this._parentMenu));
            this._ngZone.runOutsideAngular(() => fromEvent(this._elementRef.nativeElement, 'mouseenter')
                .pipe(filter(() => !this._menuStack?.isEmpty() && !this.hasMenu()), takeUntil(this._destroyed))
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
CdkMenuItem.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.0.0-next.9", ngImport: i0, type: CdkMenuItem, deps: [{ token: i0.ElementRef }, { token: i0.NgZone }, { token: MENU_STACK, optional: true }, { token: CDK_MENU, optional: true }, { token: MENU_AIM, optional: true }, { token: i1.Directionality, optional: true }, { token: i2.CdkMenuItemTrigger, optional: true, self: true }], target: i0.ɵɵFactoryTarget.Directive });
CdkMenuItem.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "14.0.0-next.9", type: CdkMenuItem, selector: "[cdkMenuItem]", inputs: { disabled: "disabled", typeahead: "typeahead" }, outputs: { triggered: "cdkMenuItemTriggered" }, host: { attributes: { "type": "button", "role": "menuitem" }, listeners: { "blur": "_resetTabIndex()", "mouseout": "_resetTabIndex()", "focus": "_setTabIndex()", "mouseenter": "_setTabIndex($event)", "click": "trigger()", "keydown": "_onKeydown($event)" }, properties: { "tabindex": "_tabindex", "attr.aria-disabled": "disabled || null" }, classAttribute: "cdk-menu-item" }, exportAs: ["cdkMenuItem"], ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.0.0-next.9", ngImport: i0, type: CdkMenuItem, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkMenuItem]',
                    exportAs: 'cdkMenuItem',
                    host: {
                        '[tabindex]': '_tabindex',
                        'type': 'button',
                        'role': 'menuitem',
                        'class': 'cdk-menu-item',
                        '[attr.aria-disabled]': 'disabled || null',
                        '(blur)': '_resetTabIndex()',
                        '(mouseout)': '_resetTabIndex()',
                        '(focus)': '_setTabIndex()',
                        '(mouseenter)': '_setTabIndex($event)',
                        '(click)': 'trigger()',
                        '(keydown)': '_onKeydown($event)',
                    },
                }]
        }], ctorParameters: function () { return [{ type: i0.ElementRef }, { type: i0.NgZone }, { type: i3.MenuStack, decorators: [{
                    type: Optional
                }, {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1pdGVtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvbWVudS9tZW51LWl0ZW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUNMLFNBQVMsRUFDVCxVQUFVLEVBQ1YsWUFBWSxFQUNaLE1BQU0sRUFDTixLQUFLLEVBQ0wsTUFBTSxFQUVOLFFBQVEsRUFDUixNQUFNLEVBQ04sSUFBSSxHQUNMLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBZSxxQkFBcUIsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBRTFFLE9BQU8sRUFBQyxLQUFLLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUM1RSxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDakQsT0FBTyxFQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDeEMsT0FBTyxFQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUNqRCxPQUFPLEVBQUMsa0JBQWtCLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUN2RCxPQUFPLEVBQUMsUUFBUSxFQUFPLE1BQU0sa0JBQWtCLENBQUM7QUFDaEQsT0FBTyxFQUFZLFVBQVUsRUFBRSxTQUFTLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFFOUQsT0FBTyxFQUFDLFFBQVEsRUFBbUIsTUFBTSxZQUFZLENBQUM7Ozs7O0FBRXREOzs7O0dBSUc7QUFrQkgsTUFBTSxPQUFPLFdBQVc7SUFnQ3RCLFlBQ1csV0FBb0MsRUFDNUIsT0FBZSxFQUNpQixVQUFzQixFQUN4QixXQUFrQixFQUNsQixRQUFrQixFQUNwQyxJQUFxQjtJQUNsRCx3RkFBd0Y7SUFDeEYsNkVBQTZFO0lBQzdFLCtDQUErQztJQUNWLFlBQWlDO1FBVDdELGdC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QWU7b0JBQ3pCLFFBQVEsRUFBRSxhQUFhO29CQUN2QixJQUFJLEVBQUU7d0JBQ0osWUFBWSxFQUFFLFdBQVc7d0JBQ3pCLE1BQU0sRUFBRSxRQUFRO3dCQUNoQixNQUFNLEVBQUUsVUFBVTt3QkFDbEIsT0FBTyxFQUFFLGVBQWU7d0JBQ3hCLHNCQUFzQixFQUFFLGtCQUFrQjt3QkFDMUMsUUFBUSxFQUFFLGtCQUFrQjt3QkFDNUIsWUFBWSxFQUFFLGtCQUFrQjt3QkFDaEMsU0FBUyxFQUFFLGdCQUFnQjt3QkFDM0IsY0FBYyxFQUFFLHNCQUFzQjt3QkFDdEMsU0FBUyxFQUFFLFdBQVc7d0JBQ3RCLFdBQVcsRUFBRSxvQkFBb0I7cUJBQ2xDO2lCQUNGOzswQkFvQ0ksUUFBUTs7MEJBQUksTUFBTTsyQkFBQyxVQUFVOzswQkFDN0IsUUFBUTs7MEJBQUksTUFBTTsyQkFBQyxRQUFROzswQkFDM0IsUUFBUTs7MEJBQUksTUFBTTsyQkFBQyxRQUFROzswQkFDM0IsUUFBUTs7MEJBSVIsSUFBSTs7MEJBQUksUUFBUTs0Q0F2Q2YsUUFBUTtzQkFEWCxLQUFLO2dCQWFHLFNBQVM7c0JBQWpCLEtBQUs7Z0JBTW1DLFNBQVM7c0JBQWpELE1BQU07dUJBQUMsc0JBQXNCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7XG4gIERpcmVjdGl2ZSxcbiAgRWxlbWVudFJlZixcbiAgRXZlbnRFbWl0dGVyLFxuICBJbmplY3QsXG4gIElucHV0LFxuICBOZ1pvbmUsXG4gIE9uRGVzdHJveSxcbiAgT3B0aW9uYWwsXG4gIE91dHB1dCxcbiAgU2VsZixcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0Jvb2xlYW5JbnB1dCwgY29lcmNlQm9vbGVhblByb3BlcnR5fSBmcm9tICdAYW5ndWxhci9jZGsvY29lcmNpb24nO1xuaW1wb3J0IHtGb2N1c2FibGVPcHRpb259IGZyb20gJ0Bhbmd1bGFyL2Nkay9hMTF5JztcbmltcG9ydCB7RU5URVIsIExFRlRfQVJST1csIFJJR0hUX0FSUk9XLCBTUEFDRX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2tleWNvZGVzJztcbmltcG9ydCB7RGlyZWN0aW9uYWxpdHl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9iaWRpJztcbmltcG9ydCB7ZnJvbUV2ZW50LCBTdWJqZWN0fSBmcm9tICdyeGpzJztcbmltcG9ydCB7ZmlsdGVyLCB0YWtlVW50aWx9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7Q2RrTWVudUl0ZW1UcmlnZ2VyfSBmcm9tICcuL21lbnUtaXRlbS10cmlnZ2VyJztcbmltcG9ydCB7Q0RLX01FTlUsIE1lbnV9IGZyb20gJy4vbWVudS1pbnRlcmZhY2UnO1xuaW1wb3J0IHtGb2N1c05leHQsIE1FTlVfU1RBQ0ssIE1lbnVTdGFja30gZnJvbSAnLi9tZW51LXN0YWNrJztcbmltcG9ydCB7Rm9jdXNhYmxlRWxlbWVudH0gZnJvbSAnLi9wb2ludGVyLWZvY3VzLXRyYWNrZXInO1xuaW1wb3J0IHtNRU5VX0FJTSwgTWVudUFpbSwgVG9nZ2xlcn0gZnJvbSAnLi9tZW51LWFpbSc7XG5cbi8qKlxuICogRGlyZWN0aXZlIHdoaWNoIHByb3ZpZGVzIHRoZSBhYmlsaXR5IGZvciBhbiBlbGVtZW50IHRvIGJlIGZvY3VzZWQgYW5kIG5hdmlnYXRlZCB0byB1c2luZyB0aGVcbiAqIGtleWJvYXJkIHdoZW4gcmVzaWRpbmcgaW4gYSBDZGtNZW51LCBDZGtNZW51QmFyLCBvciBDZGtNZW51R3JvdXAuIEl0IHBlcmZvcm1zIHVzZXIgZGVmaW5lZFxuICogYmVoYXZpb3Igd2hlbiBjbGlja2VkLlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbY2RrTWVudUl0ZW1dJyxcbiAgZXhwb3J0QXM6ICdjZGtNZW51SXRlbScsXG4gIGhvc3Q6IHtcbiAgICAnW3RhYmluZGV4XSc6ICdfdGFiaW5kZXgnLFxuICAgICd0eXBlJzogJ2J1dHRvbicsXG4gICAgJ3JvbGUnOiAnbWVudWl0ZW0nLFxuICAgICdjbGFzcyc6ICdjZGstbWVudS1pdGVtJyxcbiAgICAnW2F0dHIuYXJpYS1kaXNhYmxlZF0nOiAnZGlzYWJsZWQgfHwgbnVsbCcsXG4gICAgJyhibHVyKSc6ICdfcmVzZXRUYWJJbmRleCgpJyxcbiAgICAnKG1vdXNlb3V0KSc6ICdfcmVzZXRUYWJJbmRleCgpJyxcbiAgICAnKGZvY3VzKSc6ICdfc2V0VGFiSW5kZXgoKScsXG4gICAgJyhtb3VzZWVudGVyKSc6ICdfc2V0VGFiSW5kZXgoJGV2ZW50KScsXG4gICAgJyhjbGljayknOiAndHJpZ2dlcigpJyxcbiAgICAnKGtleWRvd24pJzogJ19vbktleWRvd24oJGV2ZW50KScsXG4gIH0sXG59KVxuZXhwb3J0IGNsYXNzIENka01lbnVJdGVtIGltcGxlbWVudHMgRm9jdXNhYmxlT3B0aW9uLCBGb2N1c2FibGVFbGVtZW50LCBUb2dnbGVyLCBPbkRlc3Ryb3kge1xuICAvKiogIFdoZXRoZXIgdGhlIENka01lbnVJdGVtIGlzIGRpc2FibGVkIC0gZGVmYXVsdHMgdG8gZmFsc2UgKi9cbiAgQElucHV0KClcbiAgZ2V0IGRpc2FibGVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9kaXNhYmxlZDtcbiAgfVxuICBzZXQgZGlzYWJsZWQodmFsdWU6IEJvb2xlYW5JbnB1dCkge1xuICAgIHRoaXMuX2Rpc2FibGVkID0gY29lcmNlQm9vbGVhblByb3BlcnR5KHZhbHVlKTtcbiAgfVxuICBwcml2YXRlIF9kaXNhYmxlZCA9IGZhbHNlO1xuXG4gIC8qKlxuICAgKiBUaGUgdGV4dCB1c2VkIHRvIGxvY2F0ZSB0aGlzIGl0ZW0gZHVyaW5nIG1lbnUgdHlwZWFoZWFkLiBJZiBub3Qgc3BlY2lmaWVkLFxuICAgKiB0aGUgYHRleHRDb250ZW50YCBvZiB0aGUgaXRlbSB3aWxsIGJlIHVzZWQuXG4gICAqL1xuICBASW5wdXQoKSB0eXBlYWhlYWQ6IHN0cmluZztcblxuICAvKipcbiAgICogSWYgdGhpcyBNZW51SXRlbSBpcyBhIHJlZ3VsYXIgTWVudUl0ZW0sIG91dHB1dHMgd2hlbiBpdCBpcyB0cmlnZ2VyZWQgYnkgYSBrZXlib2FyZCBvciBtb3VzZVxuICAgKiBldmVudC5cbiAgICovXG4gIEBPdXRwdXQoJ2Nka01lbnVJdGVtVHJpZ2dlcmVkJykgcmVhZG9ubHkgdHJpZ2dlcmVkOiBFdmVudEVtaXR0ZXI8dm9pZD4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG5cbiAgLyoqXG4gICAqIFRoZSB0YWJpbmRleCBmb3IgdGhpcyBtZW51IGl0ZW0gbWFuYWdlZCBpbnRlcm5hbGx5IGFuZCB1c2VkIGZvciBpbXBsZW1lbnRpbmcgcm92aW5nIGFcbiAgICogdGFiIGluZGV4LlxuICAgKi9cbiAgX3RhYmluZGV4OiAwIHwgLTEgPSAtMTtcblxuICAvKiogRW1pdHMgd2hlbiB0aGUgbWVudSBpdGVtIGlzIGRlc3Ryb3llZC4gKi9cbiAgcHJpdmF0ZSByZWFkb25seSBfZGVzdHJveWVkID0gbmV3IFN1YmplY3Q8dm9pZD4oKTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICByZWFkb25seSBfZWxlbWVudFJlZjogRWxlbWVudFJlZjxIVE1MRWxlbWVudD4sXG4gICAgcHJpdmF0ZSByZWFkb25seSBfbmdab25lOiBOZ1pvbmUsXG4gICAgQE9wdGlvbmFsKCkgQEluamVjdChNRU5VX1NUQUNLKSBwcml2YXRlIHJlYWRvbmx5IF9tZW51U3RhY2s/OiBNZW51U3RhY2ssXG4gICAgQE9wdGlvbmFsKCkgQEluamVjdChDREtfTUVOVSkgcHJpdmF0ZSByZWFkb25seSBfcGFyZW50TWVudT86IE1lbnUsXG4gICAgQE9wdGlvbmFsKCkgQEluamVjdChNRU5VX0FJTSkgcHJpdmF0ZSByZWFkb25seSBfbWVudUFpbT86IE1lbnVBaW0sXG4gICAgQE9wdGlvbmFsKCkgcHJpdmF0ZSByZWFkb25seSBfZGlyPzogRGlyZWN0aW9uYWxpdHksXG4gICAgLyoqIFJlZmVyZW5jZSB0byB0aGUgQ2RrTWVudUl0ZW1UcmlnZ2VyIGRpcmVjdGl2ZSBpZiBvbmUgaXMgYWRkZWQgdG8gdGhlIHNhbWUgZWxlbWVudCAqL1xuICAgIC8vIGBDZGtNZW51SXRlbWAgaXMgY29tbW9ubHkgdXNlZCBpbiBjb21iaW5hdGlvbiB3aXRoIGEgYENka01lbnVJdGVtVHJpZ2dlcmAuXG4gICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOiBsaWdodHdlaWdodC10b2tlbnNcbiAgICBAU2VsZigpIEBPcHRpb25hbCgpIHByaXZhdGUgcmVhZG9ubHkgX21lbnVUcmlnZ2VyPzogQ2RrTWVudUl0ZW1UcmlnZ2VyLFxuICApIHtcbiAgICB0aGlzLl9zZXR1cE1vdXNlRW50ZXIoKTtcblxuICAgIGlmICh0aGlzLl9pc1N0YW5kYWxvbmVJdGVtKCkpIHtcbiAgICAgIHRoaXMuX3RhYmluZGV4ID0gMDtcbiAgICB9XG4gIH1cblxuICAvKiogUGxhY2UgZm9jdXMgb24gdGhlIGVsZW1lbnQuICovXG4gIGZvY3VzKCkge1xuICAgIHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5mb2N1cygpO1xuICB9XG5cbiAgLyoqIFJlc2V0IHRoZSBfdGFiaW5kZXggdG8gLTEuICovXG4gIF9yZXNldFRhYkluZGV4KCkge1xuICAgIGlmICghdGhpcy5faXNTdGFuZGFsb25lSXRlbSgpKSB7XG4gICAgICB0aGlzLl90YWJpbmRleCA9IC0xO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgdGhlIHRhYiBpbmRleCB0byAwIGlmIG5vdCBkaXNhYmxlZCBhbmQgaXQncyBhIGZvY3VzIGV2ZW50LCBvciBhIG1vdXNlIGVudGVyIGlmIHRoaXMgZWxlbWVudFxuICAgKiBpcyBub3QgaW4gYSBtZW51IGJhci5cbiAgICovXG4gIF9zZXRUYWJJbmRleChldmVudD86IE1vdXNlRXZlbnQpIHtcbiAgICBpZiAodGhpcy5kaXNhYmxlZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIGRvbid0IHNldCB0aGUgdGFiaW5kZXggaWYgdGhlcmUgYXJlIG5vIG9wZW4gc2libGluZyBvciBwYXJlbnQgbWVudXNcbiAgICBpZiAoIWV2ZW50IHx8ICF0aGlzLl9tZW51U3RhY2s/LmlzRW1wdHkoKSkge1xuICAgICAgdGhpcy5fdGFiaW5kZXggPSAwO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoaXMgbWVudSBpdGVtIGlzIHN0YW5kYWxvbmUgb3Igd2l0aGluIGEgbWVudSBvciBtZW51IGJhci4gKi9cbiAgX2lzU3RhbmRhbG9uZUl0ZW0oKSB7XG4gICAgcmV0dXJuICF0aGlzLl9wYXJlbnRNZW51O1xuICB9XG5cbiAgLyoqXG4gICAqIElmIHRoZSBtZW51IGl0ZW0gaXMgbm90IGRpc2FibGVkIGFuZCB0aGUgZWxlbWVudCBkb2VzIG5vdCBoYXZlIGEgbWVudSB0cmlnZ2VyIGF0dGFjaGVkLCBlbWl0XG4gICAqIG9uIHRoZSBjZGtNZW51SXRlbVRyaWdnZXJlZCBlbWl0dGVyIGFuZCBjbG9zZSBhbGwgb3BlbiBtZW51cy5cbiAgICovXG4gIHRyaWdnZXIoKSB7XG4gICAgaWYgKCF0aGlzLmRpc2FibGVkICYmICF0aGlzLmhhc01lbnUoKSkge1xuICAgICAgdGhpcy50cmlnZ2VyZWQubmV4dCgpO1xuICAgICAgdGhpcy5fbWVudVN0YWNrPy5jbG9zZUFsbCgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoZSBtZW51IGl0ZW0gb3BlbnMgYSBtZW51LiAqL1xuICBoYXNNZW51KCkge1xuICAgIHJldHVybiAhIXRoaXMuX21lbnVUcmlnZ2VyPy5oYXNNZW51KCk7XG4gIH1cblxuICAvKiogUmV0dXJuIHRydWUgaWYgdGhpcyBNZW51SXRlbSBoYXMgYW4gYXR0YWNoZWQgbWVudSBhbmQgaXQgaXMgb3Blbi4gKi9cbiAgaXNNZW51T3BlbigpIHtcbiAgICByZXR1cm4gISF0aGlzLl9tZW51VHJpZ2dlcj8uaXNNZW51T3BlbigpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhIHJlZmVyZW5jZSB0byB0aGUgcmVuZGVyZWQgTWVudSBpZiB0aGUgTWVudSBpcyBvcGVuIGFuZCBpdCBpcyB2aXNpYmxlIGluIHRoZSBET00uXG4gICAqIEByZXR1cm4gdGhlIG1lbnUgaWYgaXQgaXMgb3Blbiwgb3RoZXJ3aXNlIHVuZGVmaW5lZC5cbiAgICovXG4gIGdldE1lbnUoKTogTWVudSB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIHRoaXMuX21lbnVUcmlnZ2VyPy5nZXRNZW51KCk7XG4gIH1cblxuICAvKiogR2V0IHRoZSBNZW51SXRlbVRyaWdnZXIgYXNzb2NpYXRlZCB3aXRoIHRoaXMgZWxlbWVudC4gKi9cbiAgZ2V0TWVudVRyaWdnZXIoKTogQ2RrTWVudUl0ZW1UcmlnZ2VyIHwgdW5kZWZpbmVkIHtcbiAgICByZXR1cm4gdGhpcy5fbWVudVRyaWdnZXI7XG4gIH1cblxuICAvKiogR2V0IHRoZSBsYWJlbCBmb3IgdGhpcyBlbGVtZW50IHdoaWNoIGlzIHJlcXVpcmVkIGJ5IHRoZSBGb2N1c2FibGVPcHRpb24gaW50ZXJmYWNlLiAqL1xuICBnZXRMYWJlbCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLnR5cGVhaGVhZCB8fCB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQudGV4dENvbnRlbnQ/LnRyaW0oKSB8fCAnJztcbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGVzIGtleWJvYXJkIGV2ZW50cyBmb3IgdGhlIG1lbnUgaXRlbSwgc3BlY2lmaWNhbGx5IGVpdGhlciB0cmlnZ2VyaW5nIHRoZSB1c2VyIGRlZmluZWRcbiAgICogY2FsbGJhY2sgb3Igb3BlbmluZy9jbG9zaW5nIHRoZSBjdXJyZW50IG1lbnUgYmFzZWQgb24gd2hldGhlciB0aGUgbGVmdCBvciByaWdodCBhcnJvdyBrZXkgd2FzXG4gICAqIHByZXNzZWQuXG4gICAqIEBwYXJhbSBldmVudCB0aGUga2V5Ym9hcmQgZXZlbnQgdG8gaGFuZGxlXG4gICAqL1xuICBfb25LZXlkb3duKGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XG4gICAgc3dpdGNoIChldmVudC5rZXlDb2RlKSB7XG4gICAgICBjYXNlIFNQQUNFOlxuICAgICAgY2FzZSBFTlRFUjpcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdGhpcy50cmlnZ2VyKCk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIFJJR0hUX0FSUk9XOlxuICAgICAgICBpZiAodGhpcy5fcGFyZW50TWVudSAmJiB0aGlzLl9pc1BhcmVudFZlcnRpY2FsKCkpIHtcbiAgICAgICAgICBpZiAodGhpcy5fZGlyPy52YWx1ZSA9PT0gJ3J0bCcpIHtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICB0aGlzLl9tZW51U3RhY2s/LmNsb3NlKHRoaXMuX3BhcmVudE1lbnUsIEZvY3VzTmV4dC5wcmV2aW91c0l0ZW0pO1xuICAgICAgICAgIH0gZWxzZSBpZiAoIXRoaXMuaGFzTWVudSgpKSB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgdGhpcy5fbWVudVN0YWNrPy5jbG9zZUFsbChGb2N1c05leHQubmV4dEl0ZW0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBMRUZUX0FSUk9XOlxuICAgICAgICBpZiAodGhpcy5fcGFyZW50TWVudSAmJiB0aGlzLl9pc1BhcmVudFZlcnRpY2FsKCkpIHtcbiAgICAgICAgICBpZiAodGhpcy5fZGlyPy52YWx1ZSAhPT0gJ3J0bCcpIHtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICB0aGlzLl9tZW51U3RhY2s/LmNsb3NlKHRoaXMuX3BhcmVudE1lbnUsIEZvY3VzTmV4dC5wcmV2aW91c0l0ZW0pO1xuICAgICAgICAgIH0gZWxzZSBpZiAoIXRoaXMuaGFzTWVudSgpKSB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgdGhpcy5fbWVudVN0YWNrPy5jbG9zZUFsbChGb2N1c05leHQubmV4dEl0ZW0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU3Vic2NyaWJlIHRvIHRoZSBtb3VzZWVudGVyIGV2ZW50cyBhbmQgY2xvc2UgYW55IHNpYmxpbmcgbWVudSBpdGVtcyBpZiB0aGlzIGVsZW1lbnQgaXMgbW91c2VkXG4gICAqIGludG8uXG4gICAqL1xuICBwcml2YXRlIF9zZXR1cE1vdXNlRW50ZXIoKSB7XG4gICAgaWYgKCF0aGlzLl9pc1N0YW5kYWxvbmVJdGVtKCkpIHtcbiAgICAgIGNvbnN0IGNsb3NlT3BlblNpYmxpbmdzID0gKCkgPT5cbiAgICAgICAgdGhpcy5fbmdab25lLnJ1bigoKSA9PiB0aGlzLl9tZW51U3RhY2s/LmNsb3NlU3ViTWVudU9mKHRoaXMuX3BhcmVudE1lbnUhKSk7XG5cbiAgICAgIHRoaXMuX25nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PlxuICAgICAgICBmcm9tRXZlbnQodGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LCAnbW91c2VlbnRlcicpXG4gICAgICAgICAgLnBpcGUoXG4gICAgICAgICAgICBmaWx0ZXIoKCkgPT4gIXRoaXMuX21lbnVTdGFjaz8uaXNFbXB0eSgpICYmICF0aGlzLmhhc01lbnUoKSksXG4gICAgICAgICAgICB0YWtlVW50aWwodGhpcy5fZGVzdHJveWVkKSxcbiAgICAgICAgICApXG4gICAgICAgICAgLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy5fbWVudUFpbSkge1xuICAgICAgICAgICAgICB0aGlzLl9tZW51QWltLnRvZ2dsZShjbG9zZU9wZW5TaWJsaW5ncyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBjbG9zZU9wZW5TaWJsaW5ncygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pLFxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIHRydWUgaWYgdGhlIGVuY2xvc2luZyBwYXJlbnQgbWVudSBpcyBjb25maWd1cmVkIGluIGEgaG9yaXpvbnRhbCBvcmllbnRhdGlvbiwgZmFsc2VcbiAgICogb3RoZXJ3aXNlIG9yIGlmIG5vIHBhcmVudC5cbiAgICovXG4gIHByaXZhdGUgX2lzUGFyZW50VmVydGljYWwoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3BhcmVudE1lbnU/Lm9yaWVudGF0aW9uID09PSAndmVydGljYWwnO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgdGhpcy5fZGVzdHJveWVkLm5leHQoKTtcbiAgfVxufVxuIl19