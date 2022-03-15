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
// TODO refactor this to be configurable allowing for custom elements to be removed
/** Removes all icons from within the given element. */
function removeIcons(element) {
    for (const icon of Array.from(element.querySelectorAll('mat-icon, .material-icons'))) {
        icon.remove();
    }
}
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
        // TODO cloning the tree may be expensive; implement a better method
        // we know that the current node is an element type
        const clone = this._elementRef.nativeElement.cloneNode(true);
        removeIcons(clone);
        return clone.textContent?.trim() || '';
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
                if (this._parentMenu && this._isParentVertical() && !this.hasMenu()) {
                    event.preventDefault();
                    this._dir?.value === 'rtl'
                        ? this._menuStack?.close(this._parentMenu, 1 /* previousItem */)
                        : this._menuStack?.closeAll(0 /* nextItem */);
                }
                break;
            case LEFT_ARROW:
                if (this._parentMenu && this._isParentVertical() && !this.hasMenu()) {
                    event.preventDefault();
                    this._dir?.value === 'rtl'
                        ? this._menuStack?.closeAll(0 /* nextItem */)
                        : this._menuStack?.close(this._parentMenu, 1 /* previousItem */);
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
CdkMenuItem.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.0.0-next.6", ngImport: i0, type: CdkMenuItem, deps: [{ token: i0.ElementRef }, { token: i0.NgZone }, { token: MENU_STACK, optional: true }, { token: CDK_MENU, optional: true }, { token: MENU_AIM, optional: true }, { token: i1.Directionality, optional: true }, { token: i2.CdkMenuItemTrigger, optional: true, self: true }], target: i0.ɵɵFactoryTarget.Directive });
CdkMenuItem.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "14.0.0-next.6", type: CdkMenuItem, selector: "[cdkMenuItem]", inputs: { disabled: "disabled" }, outputs: { triggered: "cdkMenuItemTriggered" }, host: { attributes: { "type": "button", "role": "menuitem" }, listeners: { "blur": "_resetTabIndex()", "mouseout": "_resetTabIndex()", "focus": "_setTabIndex()", "mouseenter": "_setTabIndex($event)", "click": "trigger()", "keydown": "_onKeydown($event)" }, properties: { "tabindex": "_tabindex", "attr.aria-disabled": "disabled || null" }, classAttribute: "cdk-menu-item" }, exportAs: ["cdkMenuItem"], ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.0.0-next.6", ngImport: i0, type: CdkMenuItem, decorators: [{
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
            }], triggered: [{
                type: Output,
                args: ['cdkMenuItemTriggered']
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1pdGVtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvbWVudS9tZW51LWl0ZW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUNMLFNBQVMsRUFDVCxVQUFVLEVBQ1YsWUFBWSxFQUNaLE1BQU0sRUFDTixLQUFLLEVBQ0wsTUFBTSxFQUVOLFFBQVEsRUFDUixNQUFNLEVBQ04sSUFBSSxHQUNMLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBZSxxQkFBcUIsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBRTFFLE9BQU8sRUFBQyxLQUFLLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUM1RSxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDakQsT0FBTyxFQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDeEMsT0FBTyxFQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUNqRCxPQUFPLEVBQUMsa0JBQWtCLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUN2RCxPQUFPLEVBQUMsUUFBUSxFQUFPLE1BQU0sa0JBQWtCLENBQUM7QUFDaEQsT0FBTyxFQUFZLFVBQVUsRUFBRSxTQUFTLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFFOUQsT0FBTyxFQUFDLFFBQVEsRUFBbUIsTUFBTSxZQUFZLENBQUM7Ozs7O0FBRXRELG1GQUFtRjtBQUNuRix1REFBdUQ7QUFDdkQsU0FBUyxXQUFXLENBQUMsT0FBZ0I7SUFDbkMsS0FBSyxNQUFNLElBQUksSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDLEVBQUU7UUFDcEYsSUFBSSxDQUFDLE1BQU0sRUFBRSxD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QUN0RCxDQUFDO0lBRUQsV0FBVztRQUNULElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDekIsQ0FBQzs7K0dBL0xVLFdBQVcsa0VBNkJBLFVBQVUsNkJBQ1YsUUFBUSw2QkFDUixRQUFRO21HQS9CbkIsV0FBVztrR0FBWCxXQUFXO2tCQWpCdkIsU0FBUzttQkFBQztvQkFDVCxRQUFRLEVBQUUsZUFBZTtvQkFDekIsUUFBUSxFQUFFLGFBQWE7b0JBQ3ZCLElBQUksRUFBRTt3QkFDSixZQUFZLEVBQUUsV0FBVzt3QkFDekIsTUFBTSxFQUFFLFFBQVE7d0JBQ2hCLE1BQU0sRUFBRSxVQUFVO3dCQUNsQixPQUFPLEVBQUUsZUFBZTt3QkFDeEIsc0JBQXNCLEVBQUUsa0JBQWtCO3dCQUMxQyxRQUFRLEVBQUUsa0JBQWtCO3dCQUM1QixZQUFZLEVBQUUsa0JBQWtCO3dCQUNoQyxTQUFTLEVBQUUsZ0JBQWdCO3dCQUMzQixjQUFjLEVBQUUsc0JBQXNCO3dCQUN0QyxTQUFTLEVBQUUsV0FBVzt3QkFDdEIsV0FBVyxFQUFFLG9CQUFvQjtxQkFDbEM7aUJBQ0Y7OzBCQThCSSxRQUFROzswQkFBSSxNQUFNOzJCQUFDLFVBQVU7OzBCQUM3QixRQUFROzswQkFBSSxNQUFNOzJCQUFDLFFBQVE7OzBCQUMzQixRQUFROzswQkFBSSxNQUFNOzJCQUFDLFFBQVE7OzBCQUMzQixRQUFROzswQkFJUixJQUFJOzswQkFBSSxRQUFROzRDQWpDZixRQUFRO3NCQURYLEtBQUs7Z0JBYW1DLFNBQVM7c0JBQWpELE1BQU07dUJBQUMsc0JBQXNCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7XG4gIERpcmVjdGl2ZSxcbiAgRWxlbWVudFJlZixcbiAgRXZlbnRFbWl0dGVyLFxuICBJbmplY3QsXG4gIElucHV0LFxuICBOZ1pvbmUsXG4gIE9uRGVzdHJveSxcbiAgT3B0aW9uYWwsXG4gIE91dHB1dCxcbiAgU2VsZixcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0Jvb2xlYW5JbnB1dCwgY29lcmNlQm9vbGVhblByb3BlcnR5fSBmcm9tICdAYW5ndWxhci9jZGsvY29lcmNpb24nO1xuaW1wb3J0IHtGb2N1c2FibGVPcHRpb259IGZyb20gJ0Bhbmd1bGFyL2Nkay9hMTF5JztcbmltcG9ydCB7RU5URVIsIExFRlRfQVJST1csIFJJR0hUX0FSUk9XLCBTUEFDRX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2tleWNvZGVzJztcbmltcG9ydCB7RGlyZWN0aW9uYWxpdHl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9iaWRpJztcbmltcG9ydCB7ZnJvbUV2ZW50LCBTdWJqZWN0fSBmcm9tICdyeGpzJztcbmltcG9ydCB7ZmlsdGVyLCB0YWtlVW50aWx9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7Q2RrTWVudUl0ZW1UcmlnZ2VyfSBmcm9tICcuL21lbnUtaXRlbS10cmlnZ2VyJztcbmltcG9ydCB7Q0RLX01FTlUsIE1lbnV9IGZyb20gJy4vbWVudS1pbnRlcmZhY2UnO1xuaW1wb3J0IHtGb2N1c05leHQsIE1FTlVfU1RBQ0ssIE1lbnVTdGFja30gZnJvbSAnLi9tZW51LXN0YWNrJztcbmltcG9ydCB7Rm9jdXNhYmxlRWxlbWVudH0gZnJvbSAnLi9wb2ludGVyLWZvY3VzLXRyYWNrZXInO1xuaW1wb3J0IHtNRU5VX0FJTSwgTWVudUFpbSwgVG9nZ2xlcn0gZnJvbSAnLi9tZW51LWFpbSc7XG5cbi8vIFRPRE8gcmVmYWN0b3IgdGhpcyB0byBiZSBjb25maWd1cmFibGUgYWxsb3dpbmcgZm9yIGN1c3RvbSBlbGVtZW50cyB0byBiZSByZW1vdmVkXG4vKiogUmVtb3ZlcyBhbGwgaWNvbnMgZnJvbSB3aXRoaW4gdGhlIGdpdmVuIGVsZW1lbnQuICovXG5mdW5jdGlvbiByZW1vdmVJY29ucyhlbGVtZW50OiBFbGVtZW50KSB7XG4gIGZvciAoY29uc3QgaWNvbiBvZiBBcnJheS5mcm9tKGVsZW1lbnQucXVlcnlTZWxlY3RvckFsbCgnbWF0LWljb24sIC5tYXRlcmlhbC1pY29ucycpKSkge1xuICAgIGljb24ucmVtb3ZlKCk7XG4gIH1cbn1cblxuLyoqXG4gKiBEaXJlY3RpdmUgd2hpY2ggcHJvdmlkZXMgdGhlIGFiaWxpdHkgZm9yIGFuIGVsZW1lbnQgdG8gYmUgZm9jdXNlZCBhbmQgbmF2aWdhdGVkIHRvIHVzaW5nIHRoZVxuICoga2V5Ym9hcmQgd2hlbiByZXNpZGluZyBpbiBhIENka01lbnUsIENka01lbnVCYXIsIG9yIENka01lbnVHcm91cC4gSXQgcGVyZm9ybXMgdXNlciBkZWZpbmVkXG4gKiBiZWhhdmlvciB3aGVuIGNsaWNrZWQuXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tjZGtNZW51SXRlbV0nLFxuICBleHBvcnRBczogJ2Nka01lbnVJdGVtJyxcbiAgaG9zdDoge1xuICAgICdbdGFiaW5kZXhdJzogJ190YWJpbmRleCcsXG4gICAgJ3R5cGUnOiAnYnV0dG9uJyxcbiAgICAncm9sZSc6ICdtZW51aXRlbScsXG4gICAgJ2NsYXNzJzogJ2Nkay1tZW51LWl0ZW0nLFxuICAgICdbYXR0ci5hcmlhLWRpc2FibGVkXSc6ICdkaXNhYmxlZCB8fCBudWxsJyxcbiAgICAnKGJsdXIpJzogJ19yZXNldFRhYkluZGV4KCknLFxuICAgICcobW91c2VvdXQpJzogJ19yZXNldFRhYkluZGV4KCknLFxuICAgICcoZm9jdXMpJzogJ19zZXRUYWJJbmRleCgpJyxcbiAgICAnKG1vdXNlZW50ZXIpJzogJ19zZXRUYWJJbmRleCgkZXZlbnQpJyxcbiAgICAnKGNsaWNrKSc6ICd0cmlnZ2VyKCknLFxuICAgICcoa2V5ZG93biknOiAnX29uS2V5ZG93bigkZXZlbnQpJyxcbiAgfSxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrTWVudUl0ZW0gaW1wbGVtZW50cyBGb2N1c2FibGVPcHRpb24sIEZvY3VzYWJsZUVsZW1lbnQsIFRvZ2dsZXIsIE9uRGVzdHJveSB7XG4gIC8qKiAgV2hldGhlciB0aGUgQ2RrTWVudUl0ZW0gaXMgZGlzYWJsZWQgLSBkZWZhdWx0cyB0byBmYWxzZSAqL1xuICBASW5wdXQoKVxuICBnZXQgZGlzYWJsZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2Rpc2FibGVkO1xuICB9XG4gIHNldCBkaXNhYmxlZCh2YWx1ZTogQm9vbGVhbklucHV0KSB7XG4gICAgdGhpcy5fZGlzYWJsZWQgPSBjb2VyY2VCb29sZWFuUHJvcGVydHkodmFsdWUpO1xuICB9XG4gIHByaXZhdGUgX2Rpc2FibGVkID0gZmFsc2U7XG5cbiAgLyoqXG4gICAqIElmIHRoaXMgTWVudUl0ZW0gaXMgYSByZWd1bGFyIE1lbnVJdGVtLCBvdXRwdXRzIHdoZW4gaXQgaXMgdHJpZ2dlcmVkIGJ5IGEga2V5Ym9hcmQgb3IgbW91c2VcbiAgICogZXZlbnQuXG4gICAqL1xuICBAT3V0cHV0KCdjZGtNZW51SXRlbVRyaWdnZXJlZCcpIHJlYWRvbmx5IHRyaWdnZXJlZDogRXZlbnRFbWl0dGVyPHZvaWQ+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4gIC8qKlxuICAgKiBUaGUgdGFiaW5kZXggZm9yIHRoaXMgbWVudSBpdGVtIG1hbmFnZWQgaW50ZXJuYWxseSBhbmQgdXNlZCBmb3IgaW1wbGVtZW50aW5nIHJvdmluZyBhXG4gICAqIHRhYiBpbmRleC5cbiAgICovXG4gIF90YWJpbmRleDogMCB8IC0xID0gLTE7XG5cbiAgLyoqIEVtaXRzIHdoZW4gdGhlIG1lbnUgaXRlbSBpcyBkZXN0cm95ZWQuICovXG4gIHByaXZhdGUgcmVhZG9ubHkgX2Rlc3Ryb3llZCA9IG5ldyBTdWJqZWN0PHZvaWQ+KCk7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcmVhZG9ubHkgX2VsZW1lbnRSZWY6IEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+LFxuICAgIHByaXZhdGUgcmVhZG9ubHkgX25nWm9uZTogTmdab25lLFxuICAgIEBPcHRpb25hbCgpIEBJbmplY3QoTUVOVV9TVEFDSykgcHJpdmF0ZSByZWFkb25seSBfbWVudVN0YWNrPzogTWVudVN0YWNrLFxuICAgIEBPcHRpb25hbCgpIEBJbmplY3QoQ0RLX01FTlUpIHByaXZhdGUgcmVhZG9ubHkgX3BhcmVudE1lbnU/OiBNZW51LFxuICAgIEBPcHRpb25hbCgpIEBJbmplY3QoTUVOVV9BSU0pIHByaXZhdGUgcmVhZG9ubHkgX21lbnVBaW0/OiBNZW51QWltLFxuICAgIEBPcHRpb25hbCgpIHByaXZhdGUgcmVhZG9ubHkgX2Rpcj86IERpcmVjdGlvbmFsaXR5LFxuICAgIC8qKiBSZWZlcmVuY2UgdG8gdGhlIENka01lbnVJdGVtVHJpZ2dlciBkaXJlY3RpdmUgaWYgb25lIGlzIGFkZGVkIHRvIHRoZSBzYW1lIGVsZW1lbnQgKi9cbiAgICAvLyBgQ2RrTWVudUl0ZW1gIGlzIGNvbW1vbmx5IHVzZWQgaW4gY29tYmluYXRpb24gd2l0aCBhIGBDZGtNZW51SXRlbVRyaWdnZXJgLlxuICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTogbGlnaHR3ZWlnaHQtdG9rZW5zXG4gICAgQFNlbGYoKSBAT3B0aW9uYWwoKSBwcml2YXRlIHJlYWRvbmx5IF9tZW51VHJpZ2dlcj86IENka01lbnVJdGVtVHJpZ2dlcixcbiAgKSB7XG4gICAgdGhpcy5fc2V0dXBNb3VzZUVudGVyKCk7XG5cbiAgICBpZiAodGhpcy5faXNTdGFuZGFsb25lSXRlbSgpKSB7XG4gICAgICB0aGlzLl90YWJpbmRleCA9IDA7XG4gICAgfVxuICB9XG5cbiAgLyoqIFBsYWNlIGZvY3VzIG9uIHRoZSBlbGVtZW50LiAqL1xuICBmb2N1cygpIHtcbiAgICB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQuZm9jdXMoKTtcbiAgfVxuXG4gIC8qKiBSZXNldCB0aGUgX3RhYmluZGV4IHRvIC0xLiAqL1xuICBfcmVzZXRUYWJJbmRleCgpIHtcbiAgICBpZiAoIXRoaXMuX2lzU3RhbmRhbG9uZUl0ZW0oKSkge1xuICAgICAgdGhpcy5fdGFiaW5kZXggPSAtMTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2V0IHRoZSB0YWIgaW5kZXggdG8gMCBpZiBub3QgZGlzYWJsZWQgYW5kIGl0J3MgYSBmb2N1cyBldmVudCwgb3IgYSBtb3VzZSBlbnRlciBpZiB0aGlzIGVsZW1lbnRcbiAgICogaXMgbm90IGluIGEgbWVudSBiYXIuXG4gICAqL1xuICBfc2V0VGFiSW5kZXgoZXZlbnQ/OiBNb3VzZUV2ZW50KSB7XG4gICAgaWYgKHRoaXMuZGlzYWJsZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBkb24ndCBzZXQgdGhlIHRhYmluZGV4IGlmIHRoZXJlIGFyZSBubyBvcGVuIHNpYmxpbmcgb3IgcGFyZW50IG1lbnVzXG4gICAgaWYgKCFldmVudCB8fCAhdGhpcy5fbWVudVN0YWNrPy5pc0VtcHR5KCkpIHtcbiAgICAgIHRoaXMuX3RhYmluZGV4ID0gMDtcbiAgICB9XG4gIH1cblxuICAvKiogV2hldGhlciB0aGlzIG1lbnUgaXRlbSBpcyBzdGFuZGFsb25lIG9yIHdpdGhpbiBhIG1lbnUgb3IgbWVudSBiYXIuICovXG4gIF9pc1N0YW5kYWxvbmVJdGVtKCkge1xuICAgIHJldHVybiAhdGhpcy5fcGFyZW50TWVudTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJZiB0aGUgbWVudSBpdGVtIGlzIG5vdCBkaXNhYmxlZCBhbmQgdGhlIGVsZW1lbnQgZG9lcyBub3QgaGF2ZSBhIG1lbnUgdHJpZ2dlciBhdHRhY2hlZCwgZW1pdFxuICAgKiBvbiB0aGUgY2RrTWVudUl0ZW1UcmlnZ2VyZWQgZW1pdHRlciBhbmQgY2xvc2UgYWxsIG9wZW4gbWVudXMuXG4gICAqL1xuICB0cmlnZ2VyKCkge1xuICAgIGlmICghdGhpcy5kaXNhYmxlZCAmJiAhdGhpcy5oYXNNZW51KCkpIHtcbiAgICAgIHRoaXMudHJpZ2dlcmVkLm5leHQoKTtcbiAgICAgIHRoaXMuX21lbnVTdGFjaz8uY2xvc2VBbGwoKTtcbiAgICB9XG4gIH1cblxuICAvKiogV2hldGhlciB0aGUgbWVudSBpdGVtIG9wZW5zIGEgbWVudS4gKi9cbiAgaGFzTWVudSgpIHtcbiAgICByZXR1cm4gISF0aGlzLl9tZW51VHJpZ2dlcj8uaGFzTWVudSgpO1xuICB9XG5cbiAgLyoqIFJldHVybiB0cnVlIGlmIHRoaXMgTWVudUl0ZW0gaGFzIGFuIGF0dGFjaGVkIG1lbnUgYW5kIGl0IGlzIG9wZW4uICovXG4gIGlzTWVudU9wZW4oKSB7XG4gICAgcmV0dXJuICEhdGhpcy5fbWVudVRyaWdnZXI/LmlzTWVudU9wZW4oKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYSByZWZlcmVuY2UgdG8gdGhlIHJlbmRlcmVkIE1lbnUgaWYgdGhlIE1lbnUgaXMgb3BlbiBhbmQgaXQgaXMgdmlzaWJsZSBpbiB0aGUgRE9NLlxuICAgKiBAcmV0dXJuIHRoZSBtZW51IGlmIGl0IGlzIG9wZW4sIG90aGVyd2lzZSB1bmRlZmluZWQuXG4gICAqL1xuICBnZXRNZW51KCk6IE1lbnUgfCB1bmRlZmluZWQge1xuICAgIHJldHVybiB0aGlzLl9tZW51VHJpZ2dlcj8uZ2V0TWVudSgpO1xuICB9XG5cbiAgLyoqIEdldCB0aGUgTWVudUl0ZW1UcmlnZ2VyIGFzc29jaWF0ZWQgd2l0aCB0aGlzIGVsZW1lbnQuICovXG4gIGdldE1lbnVUcmlnZ2VyKCk6IENka01lbnVJdGVtVHJpZ2dlciB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIHRoaXMuX21lbnVUcmlnZ2VyO1xuICB9XG5cbiAgLyoqIEdldCB0aGUgbGFiZWwgZm9yIHRoaXMgZWxlbWVudCB3aGljaCBpcyByZXF1aXJlZCBieSB0aGUgRm9jdXNhYmxlT3B0aW9uIGludGVyZmFjZS4gKi9cbiAgZ2V0TGFiZWwoKTogc3RyaW5nIHtcbiAgICAvLyBUT0RPIGNsb25pbmcgdGhlIHRyZWUgbWF5IGJlIGV4cGVuc2l2ZTsgaW1wbGVtZW50IGEgYmV0dGVyIG1ldGhvZFxuICAgIC8vIHdlIGtub3cgdGhhdCB0aGUgY3VycmVudCBub2RlIGlzIGFuIGVsZW1lbnQgdHlwZVxuICAgIGNvbnN0IGNsb25lID0gdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LmNsb25lTm9kZSh0cnVlKSBhcyBFbGVtZW50O1xuICAgIHJlbW92ZUljb25zKGNsb25lKTtcblxuICAgIHJldHVybiBjbG9uZS50ZXh0Q29udGVudD8udHJpbSgpIHx8ICcnO1xuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZXMga2V5Ym9hcmQgZXZlbnRzIGZvciB0aGUgbWVudSBpdGVtLCBzcGVjaWZpY2FsbHkgZWl0aGVyIHRyaWdnZXJpbmcgdGhlIHVzZXIgZGVmaW5lZFxuICAgKiBjYWxsYmFjayBvciBvcGVuaW5nL2Nsb3NpbmcgdGhlIGN1cnJlbnQgbWVudSBiYXNlZCBvbiB3aGV0aGVyIHRoZSBsZWZ0IG9yIHJpZ2h0IGFycm93IGtleSB3YXNcbiAgICogcHJlc3NlZC5cbiAgICogQHBhcmFtIGV2ZW50IHRoZSBrZXlib2FyZCBldmVudCB0byBoYW5kbGVcbiAgICovXG4gIF9vbktleWRvd24oZXZlbnQ6IEtleWJvYXJkRXZlbnQpIHtcbiAgICBzd2l0Y2ggKGV2ZW50LmtleUNvZGUpIHtcbiAgICAgIGNhc2UgU1BBQ0U6XG4gICAgICBjYXNlIEVOVEVSOlxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB0aGlzLnRyaWdnZXIoKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgUklHSFRfQVJST1c6XG4gICAgICAgIGlmICh0aGlzLl9wYXJlbnRNZW51ICYmIHRoaXMuX2lzUGFyZW50VmVydGljYWwoKSAmJiAhdGhpcy5oYXNNZW51KCkpIHtcbiAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgIHRoaXMuX2Rpcj8udmFsdWUgPT09ICdydGwnXG4gICAgICAgICAgICA/IHRoaXMuX21lbnVTdGFjaz8uY2xvc2UodGhpcy5fcGFyZW50TWVudSwgRm9jdXNOZXh0LnByZXZpb3VzSXRlbSlcbiAgICAgICAgICAgIDogdGhpcy5fbWVudVN0YWNrPy5jbG9zZUFsbChGb2N1c05leHQubmV4dEl0ZW0pO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIExFRlRfQVJST1c6XG4gICAgICAgIGlmICh0aGlzLl9wYXJlbnRNZW51ICYmIHRoaXMuX2lzUGFyZW50VmVydGljYWwoKSAmJiAhdGhpcy5oYXNNZW51KCkpIHtcbiAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgIHRoaXMuX2Rpcj8udmFsdWUgPT09ICdydGwnXG4gICAgICAgICAgICA/IHRoaXMuX21lbnVTdGFjaz8uY2xvc2VBbGwoRm9jdXNOZXh0Lm5leHRJdGVtKVxuICAgICAgICAgICAgOiB0aGlzLl9tZW51U3RhY2s/LmNsb3NlKHRoaXMuX3BhcmVudE1lbnUsIEZvY3VzTmV4dC5wcmV2aW91c0l0ZW0pO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTdWJzY3JpYmUgdG8gdGhlIG1vdXNlZW50ZXIgZXZlbnRzIGFuZCBjbG9zZSBhbnkgc2libGluZyBtZW51IGl0ZW1zIGlmIHRoaXMgZWxlbWVudCBpcyBtb3VzZWRcbiAgICogaW50by5cbiAgICovXG4gIHByaXZhdGUgX3NldHVwTW91c2VFbnRlcigpIHtcbiAgICBpZiAoIXRoaXMuX2lzU3RhbmRhbG9uZUl0ZW0oKSkge1xuICAgICAgY29uc3QgY2xvc2VPcGVuU2libGluZ3MgPSAoKSA9PlxuICAgICAgICB0aGlzLl9uZ1pvbmUucnVuKCgpID0+IHRoaXMuX21lbnVTdGFjaz8uY2xvc2VTdWJNZW51T2YodGhpcy5fcGFyZW50TWVudSEpKTtcblxuICAgICAgdGhpcy5fbmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+XG4gICAgICAgIGZyb21FdmVudCh0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQsICdtb3VzZWVudGVyJylcbiAgICAgICAgICAucGlwZShcbiAgICAgICAgICAgIGZpbHRlcigoKSA9PiAhdGhpcy5fbWVudVN0YWNrPy5pc0VtcHR5KCkgJiYgIXRoaXMuaGFzTWVudSgpKSxcbiAgICAgICAgICAgIHRha2VVbnRpbCh0aGlzLl9kZXN0cm95ZWQpLFxuICAgICAgICAgIClcbiAgICAgICAgICAuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9tZW51QWltKSB7XG4gICAgICAgICAgICAgIHRoaXMuX21lbnVBaW0udG9nZ2xlKGNsb3NlT3BlblNpYmxpbmdzKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGNsb3NlT3BlblNpYmxpbmdzKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSksXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm4gdHJ1ZSBpZiB0aGUgZW5jbG9zaW5nIHBhcmVudCBtZW51IGlzIGNvbmZpZ3VyZWQgaW4gYSBob3Jpem9udGFsIG9yaWVudGF0aW9uLCBmYWxzZVxuICAgKiBvdGhlcndpc2Ugb3IgaWYgbm8gcGFyZW50LlxuICAgKi9cbiAgcHJpdmF0ZSBfaXNQYXJlbnRWZXJ0aWNhbCgpIHtcbiAgICByZXR1cm4gdGhpcy5fcGFyZW50TWVudT8ub3JpZW50YXRpb24gPT09ICd2ZXJ0aWNhbCc7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICB0aGlzLl9kZXN0cm95ZWQubmV4dCgpO1xuICB9XG59XG4iXX0=