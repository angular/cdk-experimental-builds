/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, Input, Optional, Self, ElementRef, Output, EventEmitter, Inject, HostListener, NgZone, } from '@angular/core';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { SPACE, ENTER, RIGHT_ARROW, LEFT_ARROW } from '@angular/cdk/keycodes';
import { Directionality } from '@angular/cdk/bidi';
import { Subject, fromEvent } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { CdkMenuItemTrigger } from './menu-item-trigger';
import { CDK_MENU } from './menu-interface';
import { MENU_AIM } from './menu-aim';
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
    constructor(_elementRef, _ngZone, _parentMenu, _menuAim, _dir, 
    /** Reference to the CdkMenuItemTrigger directive if one is added to the same element */
    // `CdkMenuItem` is commonly used in combination with a `CdkMenuItemTrigger`.
    // tslint:disable-next-line: lightweight-tokens
    _menuTrigger) {
        this._elementRef = _elementRef;
        this._ngZone = _ngZone;
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
    // In Ivy the `host` metadata will be merged, whereas in ViewEngine it is overridden. In order
    // to avoid double event listeners, we need to use `HostListener`. Once Ivy is the default, we
    // can move this back into `host`.
    // tslint:disable:no-host-decorator-in-concrete
    /** Reset the _tabindex to -1. */
    _resetTabIndex() {
        if (!this._isStandaloneItem()) {
            this._tabindex = -1;
        }
    }
    // In Ivy the `host` metadata will be merged, whereas in ViewEngine it is overridden. In order
    // to avoid double event listeners, we need to use `HostListener`. Once Ivy is the default, we
    // can move this back into `host`.
    // tslint:disable:no-host-decorator-in-concrete
    /**
     * Set the tab index to 0 if not disabled and it's a focus event, or a mouse enter if this element
     * is not in a menu bar.
     */
    _setTabIndex(event) {
        var _a;
        if (this.disabled) {
            return;
        }
        // don't set the tabindex if there are no open sibling or parent menus
        if (!event || !((_a = this._getMenuStack()) === null || _a === void 0 ? void 0 : _a.isEmpty())) {
            this._tabindex = 0;
        }
    }
    /** Whether this menu item is standalone or within a menu or menu bar. */
    _isStandaloneItem() {
        return !this._parentMenu;
    }
    // In Ivy the `host` metadata will be merged, whereas in ViewEngine it is overridden. In order
    // to avoid double event listeners, we need to use `HostListener`. Once Ivy is the default, we
    // can move this back into `host`.
    // tslint:disable:no-host-decorator-in-concrete
    /**
     * If the menu item is not disabled and the element does not have a menu trigger attached, emit
     * on the cdkMenuItemTriggered emitter and close all open menus.
     */
    trigger() {
        var _a;
        if (!this.disabled && !this.hasMenu()) {
            this.triggered.next();
            (_a = this._getMenuStack()) === null || _a === void 0 ? void 0 : _a.closeAll();
        }
    }
    /** Whether the menu item opens a menu. */
    hasMenu() {
        var _a;
        return !!((_a = this._menuTrigger) === null || _a === void 0 ? void 0 : _a.hasMenu());
    }
    /** Return true if this MenuItem has an attached menu and it is open. */
    isMenuOpen() {
        var _a;
        return !!((_a = this._menuTrigger) === null || _a === void 0 ? void 0 : _a.isMenuOpen());
    }
    /**
     * Get a reference to the rendered Menu if the Menu is open and it is visible in the DOM.
     * @return the menu if it is open, otherwise undefined.
     */
    getMenu() {
        var _a;
        return (_a = this._menuTrigger) === null || _a === void 0 ? void 0 : _a.getMenu();
    }
    /** Get the MenuItemTrigger associated with this element. */
    getMenuTrigger() {
        return this._menuTrigger;
    }
    /** Get the label for this element which is required by the FocusableOption interface. */
    getLabel() {
        var _a;
        // TODO cloning the tree may be expensive; implement a better method
        // we know that the current node is an element type
        const clone = this._elementRef.nativeElement.cloneNode(true);
        removeIcons(clone);
        return ((_a = clone.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || '';
    }
    // In Ivy the `host` metadata will be merged, whereas in ViewEngine it is overridden. In order
    // to avoid double event listeners, we need to use `HostListener`. Once Ivy is the default, we
    // can move this back into `host`.
    // tslint:disable:no-host-decorator-in-concrete
    /**
     * Handles keyboard events for the menu item, specifically either triggering the user defined
     * callback or opening/closing the current menu based on whether the left or right arrow key was
     * pressed.
     * @param event the keyboard event to handle
     */
    _onKeydown(event) {
        var _a, _b, _c, _d, _e, _f;
        switch (event.keyCode) {
            case SPACE:
            case ENTER:
                event.preventDefault();
                this.trigger();
                break;
            case RIGHT_ARROW:
                if (this._parentMenu && this._isParentVertical() && !this.hasMenu()) {
                    event.preventDefault();
                    ((_a = this._dir) === null || _a === void 0 ? void 0 : _a.value) === 'rtl'
                        ? (_b = this._getMenuStack()) === null || _b === void 0 ? void 0 : _b.close(this._parentMenu, 1 /* previousItem */)
                        : (_c = this._getMenuStack()) === null || _c === void 0 ? void 0 : _c.closeAll(0 /* nextItem */);
                }
                break;
            case LEFT_ARROW:
                if (this._parentMenu && this._isParentVertical() && !this.hasMenu()) {
                    event.preventDefault();
                    ((_d = this._dir) === null || _d === void 0 ? void 0 : _d.value) === 'rtl'
                        ? (_e = this._getMenuStack()) === null || _e === void 0 ? void 0 : _e.closeAll(0 /* nextItem */)
                        : (_f = this._getMenuStack()) === null || _f === void 0 ? void 0 : _f.close(this._parentMenu, 1 /* previousItem */);
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
            const closeOpenSiblings = () => this._ngZone.run(() => { var _a; return (_a = this._getMenuStack()) === null || _a === void 0 ? void 0 : _a.closeSubMenuOf(this._parentMenu); });
            this._ngZone.runOutsideAngular(() => fromEvent(this._elementRef.nativeElement, 'mouseenter')
                .pipe(filter(() => { var _a; return !((_a = this._getMenuStack()) === null || _a === void 0 ? void 0 : _a.isEmpty()) && !this.hasMenu(); }), takeUntil(this._destroyed))
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
        var _a;
        return ((_a = this._parentMenu) === null || _a === void 0 ? void 0 : _a.orientation) === 'vertical';
    }
    /** Get the MenuStack from the parent menu. */
    _getMenuStack() {
        var _a;
        // We use a function since at the construction of the MenuItemTrigger the parent Menu won't have
        // its menu stack set. Therefore we need to reference the menu stack from the parent each time
        // we want to use it.
        return (_a = this._parentMenu) === null || _a === void 0 ? void 0 : _a._menuStack;
    }
    ngOnDestroy() {
        this._destroyed.next();
    }
}
CdkMenuItem.decorators = [
    { type: Directive, args: [{
                selector: '[cdkMenuItem]',
                exportAs: 'cdkMenuItem',
                host: {
                    '[tabindex]': '_tabindex',
                    'type': 'button',
                    'role': 'menuitem',
                    'class': 'cdk-menu-item',
                    '[attr.aria-disabled]': 'disabled || null',
                },
            },] }
];
CdkMenuItem.ctorParameters = () => [
    { type: ElementRef },
    { type: NgZone },
    { type: undefined, decorators: [{ type: Optional }, { type: Inject, args: [CDK_MENU,] }] },
    { type: undefined, decorators: [{ type: Optional }, { type: Inject, args: [MENU_AIM,] }] },
    { type: Directionality, decorators: [{ type: Optional }] },
    { type: CdkMenuItemTrigger, decorators: [{ type: Self }, { type: Optional }] }
];
CdkMenuItem.propDecorators = {
    disabled: [{ type: Input }],
    triggered: [{ type: Output, args: ['cdkMenuItemTriggered',] }],
    _resetTabIndex: [{ type: HostListener, args: ['blur',] }, { type: HostListener, args: ['mouseout',] }],
    _setTabIndex: [{ type: HostListener, args: ['focus',] }, { type: HostListener, args: ['mouseenter', ['$event'],] }],
    trigger: [{ type: HostListener, args: ['click',] }],
    _onKeydown: [{ type: HostListener, args: ['keydown', ['$event'],] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1pdGVtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvbWVudS9tZW51LWl0ZW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUNMLFNBQVMsRUFDVCxLQUFLLEVBQ0wsUUFBUSxFQUNSLElBQUksRUFDSixVQUFVLEVBQ1YsTUFBTSxFQUNOLFlBQVksRUFDWixNQUFNLEVBQ04sWUFBWSxFQUNaLE1BQU0sR0FFUCxNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUMscUJBQXFCLEVBQWUsTUFBTSx1QkFBdUIsQ0FBQztBQUUxRSxPQUFPLEVBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsVUFBVSxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDNUUsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQ2pELE9BQU8sRUFBQyxPQUFPLEVBQUUsU0FBUyxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQ3hDLE9BQU8sRUFBQyxTQUFTLEVBQUUsTUFBTSxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDakQsT0FBTyxFQUFDLGtCQUFrQixFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDdkQsT0FBTyxFQUFPLFFBQVEsRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBR2hELE9BQU8sRUFBVSxRQUFRLEVBQVUsTUFBTSxZQUFZLENBQUM7QUFFdEQsbUZBQW1GO0FBQ25GLHVEQUF1RDtBQUN2RCxTQUFTLFdBQVcsQ0FBQyxPQUFnQjtJQUNuQyxLQUFLLE1BQU0sSUFBSSxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLDJCQUEyQixDQUFDLENBQUMsRUFBRTtRQUNwRixJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7S0FDZjtBQUNILENBQUM7QUFFRDs7OztHQUlHO0FBWUgsTUFBTSxPQUFP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LEtBQUs7d0JBYUwsTUFBTSxTQUFDLHNCQUFzQjs2QkFzQzdCLFlBQVksU0FBQyxNQUFNLGNBQ25CLFlBQVksU0FBQyxVQUFVOzJCQVl2QixZQUFZLFNBQUMsT0FBTyxjQUNwQixZQUFZLFNBQUMsWUFBWSxFQUFFLENBQUMsUUFBUSxDQUFDO3NCQXlCckMsWUFBWSxTQUFDLE9BQU87eUJBaURwQixZQUFZLFNBQUMsU0FBUyxFQUFFLENBQUMsUUFBUSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7XG4gIERpcmVjdGl2ZSxcbiAgSW5wdXQsXG4gIE9wdGlvbmFsLFxuICBTZWxmLFxuICBFbGVtZW50UmVmLFxuICBPdXRwdXQsXG4gIEV2ZW50RW1pdHRlcixcbiAgSW5qZWN0LFxuICBIb3N0TGlzdGVuZXIsXG4gIE5nWm9uZSxcbiAgT25EZXN0cm95LFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7Y29lcmNlQm9vbGVhblByb3BlcnR5LCBCb29sZWFuSW5wdXR9IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2VyY2lvbic7XG5pbXBvcnQge0ZvY3VzYWJsZU9wdGlvbn0gZnJvbSAnQGFuZ3VsYXIvY2RrL2ExMXknO1xuaW1wb3J0IHtTUEFDRSwgRU5URVIsIFJJR0hUX0FSUk9XLCBMRUZUX0FSUk9XfSBmcm9tICdAYW5ndWxhci9jZGsva2V5Y29kZXMnO1xuaW1wb3J0IHtEaXJlY3Rpb25hbGl0eX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2JpZGknO1xuaW1wb3J0IHtTdWJqZWN0LCBmcm9tRXZlbnR9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHt0YWtlVW50aWwsIGZpbHRlcn0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuaW1wb3J0IHtDZGtNZW51SXRlbVRyaWdnZXJ9IGZyb20gJy4vbWVudS1pdGVtLXRyaWdnZXInO1xuaW1wb3J0IHtNZW51LCBDREtfTUVOVX0gZnJvbSAnLi9tZW51LWludGVyZmFjZSc7XG5pbXBvcnQge0ZvY3VzTmV4dH0gZnJvbSAnLi9tZW51LXN0YWNrJztcbmltcG9ydCB7Rm9jdXNhYmxlRWxlbWVudH0gZnJvbSAnLi9wb2ludGVyLWZvY3VzLXRyYWNrZXInO1xuaW1wb3J0IHtUb2dnbGVyLCBNRU5VX0FJTSwgTWVudUFpbX0gZnJvbSAnLi9tZW51LWFpbSc7XG5cbi8vIFRPRE8gcmVmYWN0b3IgdGhpcyB0byBiZSBjb25maWd1cmFibGUgYWxsb3dpbmcgZm9yIGN1c3RvbSBlbGVtZW50cyB0byBiZSByZW1vdmVkXG4vKiogUmVtb3ZlcyBhbGwgaWNvbnMgZnJvbSB3aXRoaW4gdGhlIGdpdmVuIGVsZW1lbnQuICovXG5mdW5jdGlvbiByZW1vdmVJY29ucyhlbGVtZW50OiBFbGVtZW50KSB7XG4gIGZvciAoY29uc3QgaWNvbiBvZiBBcnJheS5mcm9tKGVsZW1lbnQucXVlcnlTZWxlY3RvckFsbCgnbWF0LWljb24sIC5tYXRlcmlhbC1pY29ucycpKSkge1xuICAgIGljb24ucmVtb3ZlKCk7XG4gIH1cbn1cblxuLyoqXG4gKiBEaXJlY3RpdmUgd2hpY2ggcHJvdmlkZXMgdGhlIGFiaWxpdHkgZm9yIGFuIGVsZW1lbnQgdG8gYmUgZm9jdXNlZCBhbmQgbmF2aWdhdGVkIHRvIHVzaW5nIHRoZVxuICoga2V5Ym9hcmQgd2hlbiByZXNpZGluZyBpbiBhIENka01lbnUsIENka01lbnVCYXIsIG9yIENka01lbnVHcm91cC4gSXQgcGVyZm9ybXMgdXNlciBkZWZpbmVkXG4gKiBiZWhhdmlvciB3aGVuIGNsaWNrZWQuXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tjZGtNZW51SXRlbV0nLFxuICBleHBvcnRBczogJ2Nka01lbnVJdGVtJyxcbiAgaG9zdDoge1xuICAgICdbdGFiaW5kZXhdJzogJ190YWJpbmRleCcsXG4gICAgJ3R5cGUnOiAnYnV0dG9uJyxcbiAgICAncm9sZSc6ICdtZW51aXRlbScsXG4gICAgJ2NsYXNzJzogJ2Nkay1tZW51LWl0ZW0nLFxuICAgICdbYXR0ci5hcmlhLWRpc2FibGVkXSc6ICdkaXNhYmxlZCB8fCBudWxsJyxcbiAgfSxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrTWVudUl0ZW0gaW1wbGVtZW50cyBGb2N1c2FibGVPcHRpb24sIEZvY3VzYWJsZUVsZW1lbnQsIFRvZ2dsZXIsIE9uRGVzdHJveSB7XG4gIC8qKiAgV2hldGhlciB0aGUgQ2RrTWVudUl0ZW0gaXMgZGlzYWJsZWQgLSBkZWZhdWx0cyB0byBmYWxzZSAqL1xuICBASW5wdXQoKVxuICBnZXQgZGlzYWJsZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2Rpc2FibGVkO1xuICB9XG4gIHNldCBkaXNhYmxlZCh2YWx1ZTogYm9vbGVhbikge1xuICAgIHRoaXMuX2Rpc2FibGVkID0gY29lcmNlQm9vbGVhblByb3BlcnR5KHZhbHVlKTtcbiAgfVxuICBwcml2YXRlIF9kaXNhYmxlZCA9IGZhbHNlO1xuXG4gIC8qKlxuICAgKiBJZiB0aGlzIE1lbnVJdGVtIGlzIGEgcmVndWxhciBNZW51SXRlbSwgb3V0cHV0cyB3aGVuIGl0IGlzIHRyaWdnZXJlZCBieSBhIGtleWJvYXJkIG9yIG1vdXNlXG4gICAqIGV2ZW50LlxuICAgKi9cbiAgQE91dHB1dCgnY2RrTWVudUl0ZW1UcmlnZ2VyZWQnKSByZWFkb25seSB0cmlnZ2VyZWQ6IEV2ZW50RW1pdHRlcjx2b2lkPiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuICAvKipcbiAgICogVGhlIHRhYmluZGV4IGZvciB0aGlzIG1lbnUgaXRlbSBtYW5hZ2VkIGludGVybmFsbHkgYW5kIHVzZWQgZm9yIGltcGxlbWVudGluZyByb3ZpbmcgYVxuICAgKiB0YWIgaW5kZXguXG4gICAqL1xuICBfdGFiaW5kZXg6IDAgfCAtMSA9IC0xO1xuXG4gIC8qKiBFbWl0cyB3aGVuIHRoZSBtZW51IGl0ZW0gaXMgZGVzdHJveWVkLiAqL1xuICBwcml2YXRlIHJlYWRvbmx5IF9kZXN0cm95ZWQgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHJlYWRvbmx5IF9lbGVtZW50UmVmOiBFbGVtZW50UmVmPEhUTUxFbGVtZW50PixcbiAgICBwcml2YXRlIHJlYWRvbmx5IF9uZ1pvbmU6IE5nWm9uZSxcbiAgICBAT3B0aW9uYWwoKSBASW5qZWN0KENES19NRU5VKSBwcml2YXRlIHJlYWRvbmx5IF9wYXJlbnRNZW51PzogTWVudSxcbiAgICBAT3B0aW9uYWwoKSBASW5qZWN0KE1FTlVfQUlNKSBwcml2YXRlIHJlYWRvbmx5IF9tZW51QWltPzogTWVudUFpbSxcbiAgICBAT3B0aW9uYWwoKSBwcml2YXRlIHJlYWRvbmx5IF9kaXI/OiBEaXJlY3Rpb25hbGl0eSxcbiAgICAvKiogUmVmZXJlbmNlIHRvIHRoZSBDZGtNZW51SXRlbVRyaWdnZXIgZGlyZWN0aXZlIGlmIG9uZSBpcyBhZGRlZCB0byB0aGUgc2FtZSBlbGVtZW50ICovXG4gICAgLy8gYENka01lbnVJdGVtYCBpcyBjb21tb25seSB1c2VkIGluIGNvbWJpbmF0aW9uIHdpdGggYSBgQ2RrTWVudUl0ZW1UcmlnZ2VyYC5cbiAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6IGxpZ2h0d2VpZ2h0LXRva2Vuc1xuICAgIEBTZWxmKCkgQE9wdGlvbmFsKCkgcHJpdmF0ZSByZWFkb25seSBfbWVudVRyaWdnZXI/OiBDZGtNZW51SXRlbVRyaWdnZXJcbiAgKSB7XG4gICAgdGhpcy5fc2V0dXBNb3VzZUVudGVyKCk7XG5cbiAgICBpZiAodGhpcy5faXNTdGFuZGFsb25lSXRlbSgpKSB7XG4gICAgICB0aGlzLl90YWJpbmRleCA9IDA7XG4gICAgfVxuICB9XG5cbiAgLyoqIFBsYWNlIGZvY3VzIG9uIHRoZSBlbGVtZW50LiAqL1xuICBmb2N1cygpIHtcbiAgICB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQuZm9jdXMoKTtcbiAgfVxuXG4gIC8vIEluIEl2eSB0aGUgYGhvc3RgIG1ldGFkYXRhIHdpbGwgYmUgbWVyZ2VkLCB3aGVyZWFzIGluIFZpZXdFbmdpbmUgaXQgaXMgb3ZlcnJpZGRlbi4gSW4gb3JkZXJcbiAgLy8gdG8gYXZvaWQgZG91YmxlIGV2ZW50IGxpc3RlbmVycywgd2UgbmVlZCB0byB1c2UgYEhvc3RMaXN0ZW5lcmAuIE9uY2UgSXZ5IGlzIHRoZSBkZWZhdWx0LCB3ZVxuICAvLyBjYW4gbW92ZSB0aGlzIGJhY2sgaW50byBgaG9zdGAuXG4gIC8vIHRzbGludDpkaXNhYmxlOm5vLWhvc3QtZGVjb3JhdG9yLWluLWNvbmNyZXRlXG4gIEBIb3N0TGlzdGVuZXIoJ2JsdXInKVxuICBASG9zdExpc3RlbmVyKCdtb3VzZW91dCcpXG4gIC8qKiBSZXNldCB0aGUgX3RhYmluZGV4IHRvIC0xLiAqL1xuICBfcmVzZXRUYWJJbmRleCgpIHtcbiAgICBpZiAoIXRoaXMuX2lzU3RhbmRhbG9uZUl0ZW0oKSkge1xuICAgICAgdGhpcy5fdGFiaW5kZXggPSAtMTtcbiAgICB9XG4gIH1cblxuICAvLyBJbiBJdnkgdGhlIGBob3N0YCBtZXRhZGF0YSB3aWxsIGJlIG1lcmdlZCwgd2hlcmVhcyBpbiBWaWV3RW5naW5lIGl0IGlzIG92ZXJyaWRkZW4uIEluIG9yZGVyXG4gIC8vIHRvIGF2b2lkIGRvdWJsZSBldmVudCBsaXN0ZW5lcnMsIHdlIG5lZWQgdG8gdXNlIGBIb3N0TGlzdGVuZXJgLiBPbmNlIEl2eSBpcyB0aGUgZGVmYXVsdCwgd2VcbiAgLy8gY2FuIG1vdmUgdGhpcyBiYWNrIGludG8gYGhvc3RgLlxuICAvLyB0c2xpbnQ6ZGlzYWJsZTpuby1ob3N0LWRlY29yYXRvci1pbi1jb25jcmV0ZVxuICBASG9zdExpc3RlbmVyKCdmb2N1cycpXG4gIEBIb3N0TGlzdGVuZXIoJ21vdXNlZW50ZXInLCBbJyRldmVudCddKVxuICAvKipcbiAgICogU2V0IHRoZSB0YWIgaW5kZXggdG8gMCBpZiBub3QgZGlzYWJsZWQgYW5kIGl0J3MgYSBmb2N1cyBldmVudCwgb3IgYSBtb3VzZSBlbnRlciBpZiB0aGlzIGVsZW1lbnRcbiAgICogaXMgbm90IGluIGEgbWVudSBiYXIuXG4gICAqL1xuICBfc2V0VGFiSW5kZXgoZXZlbnQ/OiBNb3VzZUV2ZW50KSB7XG4gICAgaWYgKHRoaXMuZGlzYWJsZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBkb24ndCBzZXQgdGhlIHRhYmluZGV4IGlmIHRoZXJlIGFyZSBubyBvcGVuIHNpYmxpbmcgb3IgcGFyZW50IG1lbnVzXG4gICAgaWYgKCFldmVudCB8fCAhdGhpcy5fZ2V0TWVudVN0YWNrKCk/LmlzRW1wdHkoKSkge1xuICAgICAgdGhpcy5fdGFiaW5kZXggPSAwO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoaXMgbWVudSBpdGVtIGlzIHN0YW5kYWxvbmUgb3Igd2l0aGluIGEgbWVudSBvciBtZW51IGJhci4gKi9cbiAgX2lzU3RhbmRhbG9uZUl0ZW0oKSB7XG4gICAgcmV0dXJuICF0aGlzLl9wYXJlbnRNZW51O1xuICB9XG5cbiAgLy8gSW4gSXZ5IHRoZSBgaG9zdGAgbWV0YWRhdGEgd2lsbCBiZSBtZXJnZWQsIHdoZXJlYXMgaW4gVmlld0VuZ2luZSBpdCBpcyBvdmVycmlkZGVuLiBJbiBvcmRlclxuICAvLyB0byBhdm9pZCBkb3VibGUgZXZlbnQgbGlzdGVuZXJzLCB3ZSBuZWVkIHRvIHVzZSBgSG9zdExpc3RlbmVyYC4gT25jZSBJdnkgaXMgdGhlIGRlZmF1bHQsIHdlXG4gIC8vIGNhbiBtb3ZlIHRoaXMgYmFjayBpbnRvIGBob3N0YC5cbiAgLy8gdHNsaW50OmRpc2FibGU6bm8taG9zdC1kZWNvcmF0b3ItaW4tY29uY3JldGVcbiAgQEhvc3RMaXN0ZW5lcignY2xpY2snKVxuICAvKipcbiAgICogSWYgdGhlIG1lbnUgaXRlbSBpcyBub3QgZGlzYWJsZWQgYW5kIHRoZSBlbGVtZW50IGRvZXMgbm90IGhhdmUgYSBtZW51IHRyaWdnZXIgYXR0YWNoZWQsIGVtaXRcbiAgICogb24gdGhlIGNka01lbnVJdGVtVHJpZ2dlcmVkIGVtaXR0ZXIgYW5kIGNsb3NlIGFsbCBvcGVuIG1lbnVzLlxuICAgKi9cbiAgdHJpZ2dlcigpIHtcbiAgICBpZiAoIXRoaXMuZGlzYWJsZWQgJiYgIXRoaXMuaGFzTWVudSgpKSB7XG4gICAgICB0aGlzLnRyaWdnZXJlZC5uZXh0KCk7XG4gICAgICB0aGlzLl9nZXRNZW51U3RhY2soKT8uY2xvc2VBbGwoKTtcbiAgICB9XG4gIH1cblxuICAvKiogV2hldGhlciB0aGUgbWVudSBpdGVtIG9wZW5zIGEgbWVudS4gKi9cbiAgaGFzTWVudSgpIHtcbiAgICByZXR1cm4gISF0aGlzLl9tZW51VHJpZ2dlcj8uaGFzTWVudSgpO1xuICB9XG5cbiAgLyoqIFJldHVybiB0cnVlIGlmIHRoaXMgTWVudUl0ZW0gaGFzIGFuIGF0dGFjaGVkIG1lbnUgYW5kIGl0IGlzIG9wZW4uICovXG4gIGlzTWVudU9wZW4oKSB7XG4gICAgcmV0dXJuICEhdGhpcy5fbWVudVRyaWdnZXI/LmlzTWVudU9wZW4oKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYSByZWZlcmVuY2UgdG8gdGhlIHJlbmRlcmVkIE1lbnUgaWYgdGhlIE1lbnUgaXMgb3BlbiBhbmQgaXQgaXMgdmlzaWJsZSBpbiB0aGUgRE9NLlxuICAgKiBAcmV0dXJuIHRoZSBtZW51IGlmIGl0IGlzIG9wZW4sIG90aGVyd2lzZSB1bmRlZmluZWQuXG4gICAqL1xuICBnZXRNZW51KCk6IE1lbnUgfCB1bmRlZmluZWQge1xuICAgIHJldHVybiB0aGlzLl9tZW51VHJpZ2dlcj8uZ2V0TWVudSgpO1xuICB9XG5cbiAgLyoqIEdldCB0aGUgTWVudUl0ZW1UcmlnZ2VyIGFzc29jaWF0ZWQgd2l0aCB0aGlzIGVsZW1lbnQuICovXG4gIGdldE1lbnVUcmlnZ2VyKCk6IENka01lbnVJdGVtVHJpZ2dlciB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIHRoaXMuX21lbnVUcmlnZ2VyO1xuICB9XG5cbiAgLyoqIEdldCB0aGUgbGFiZWwgZm9yIHRoaXMgZWxlbWVudCB3aGljaCBpcyByZXF1aXJlZCBieSB0aGUgRm9jdXNhYmxlT3B0aW9uIGludGVyZmFjZS4gKi9cbiAgZ2V0TGFiZWwoKTogc3RyaW5nIHtcbiAgICAvLyBUT0RPIGNsb25pbmcgdGhlIHRyZWUgbWF5IGJlIGV4cGVuc2l2ZTsgaW1wbGVtZW50IGEgYmV0dGVyIG1ldGhvZFxuICAgIC8vIHdlIGtub3cgdGhhdCB0aGUgY3VycmVudCBub2RlIGlzIGFuIGVsZW1lbnQgdHlwZVxuICAgIGNvbnN0IGNsb25lID0gdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LmNsb25lTm9kZSh0cnVlKSBhcyBFbGVtZW50O1xuICAgIHJlbW92ZUljb25zKGNsb25lKTtcblxuICAgIHJldHVybiBjbG9uZS50ZXh0Q29udGVudD8udHJpbSgpIHx8ICcnO1xuICB9XG5cbiAgLy8gSW4gSXZ5IHRoZSBgaG9zdGAgbWV0YWRhdGEgd2lsbCBiZSBtZXJnZWQsIHdoZXJlYXMgaW4gVmlld0VuZ2luZSBpdCBpcyBvdmVycmlkZGVuLiBJbiBvcmRlclxuICAvLyB0byBhdm9pZCBkb3VibGUgZXZlbnQgbGlzdGVuZXJzLCB3ZSBuZWVkIHRvIHVzZSBgSG9zdExpc3RlbmVyYC4gT25jZSBJdnkgaXMgdGhlIGRlZmF1bHQsIHdlXG4gIC8vIGNhbiBtb3ZlIHRoaXMgYmFjayBpbnRvIGBob3N0YC5cbiAgLy8gdHNsaW50OmRpc2FibGU6bm8taG9zdC1kZWNvcmF0b3ItaW4tY29uY3JldGVcbiAgQEhvc3RMaXN0ZW5lcigna2V5ZG93bicsIFsnJGV2ZW50J10pXG4gIC8qKlxuICAgKiBIYW5kbGVzIGtleWJvYXJkIGV2ZW50cyBmb3IgdGhlIG1lbnUgaXRlbSwgc3BlY2lmaWNhbGx5IGVpdGhlciB0cmlnZ2VyaW5nIHRoZSB1c2VyIGRlZmluZWRcbiAgICogY2FsbGJhY2sgb3Igb3BlbmluZy9jbG9zaW5nIHRoZSBjdXJyZW50IG1lbnUgYmFzZWQgb24gd2hldGhlciB0aGUgbGVmdCBvciByaWdodCBhcnJvdyBrZXkgd2FzXG4gICAqIHByZXNzZWQuXG4gICAqIEBwYXJhbSBldmVudCB0aGUga2V5Ym9hcmQgZXZlbnQgdG8gaGFuZGxlXG4gICAqL1xuICBfb25LZXlkb3duKGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XG4gICAgc3dpdGNoIChldmVudC5rZXlDb2RlKSB7XG4gICAgICBjYXNlIFNQQUNFOlxuICAgICAgY2FzZSBFTlRFUjpcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdGhpcy50cmlnZ2VyKCk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIFJJR0hUX0FSUk9XOlxuICAgICAgICBpZiAodGhpcy5fcGFyZW50TWVudSAmJiB0aGlzLl9pc1BhcmVudFZlcnRpY2FsKCkgJiYgIXRoaXMuaGFzTWVudSgpKSB7XG4gICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICB0aGlzLl9kaXI/LnZhbHVlID09PSAncnRsJ1xuICAgICAgICAgICAgPyB0aGlzLl9nZXRNZW51U3RhY2soKT8uY2xvc2UodGhpcy5fcGFyZW50TWVudSwgRm9jdXNOZXh0LnByZXZpb3VzSXRlbSlcbiAgICAgICAgICAgIDogdGhpcy5fZ2V0TWVudVN0YWNrKCk/LmNsb3NlQWxsKEZvY3VzTmV4dC5uZXh0SXRlbSk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgTEVGVF9BUlJPVzpcbiAgICAgICAgaWYgKHRoaXMuX3BhcmVudE1lbnUgJiYgdGhpcy5faXNQYXJlbnRWZXJ0aWNhbCgpICYmICF0aGlzLmhhc01lbnUoKSkge1xuICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgdGhpcy5fZGlyPy52YWx1ZSA9PT0gJ3J0bCdcbiAgICAgICAgICAgID8gdGhpcy5fZ2V0TWVudVN0YWNrKCk/LmNsb3NlQWxsKEZvY3VzTmV4dC5uZXh0SXRlbSlcbiAgICAgICAgICAgIDogdGhpcy5fZ2V0TWVudVN0YWNrKCk/LmNsb3NlKHRoaXMuX3BhcmVudE1lbnUsIEZvY3VzTmV4dC5wcmV2aW91c0l0ZW0pO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTdWJzY3JpYmUgdG8gdGhlIG1vdXNlZW50ZXIgZXZlbnRzIGFuZCBjbG9zZSBhbnkgc2libGluZyBtZW51IGl0ZW1zIGlmIHRoaXMgZWxlbWVudCBpcyBtb3VzZWRcbiAgICogaW50by5cbiAgICovXG4gIHByaXZhdGUgX3NldHVwTW91c2VFbnRlcigpIHtcbiAgICBpZiAoIXRoaXMuX2lzU3RhbmRhbG9uZUl0ZW0oKSkge1xuICAgICAgY29uc3QgY2xvc2VPcGVuU2libGluZ3MgPSAoKSA9PlxuICAgICAgICB0aGlzLl9uZ1pvbmUucnVuKCgpID0+IHRoaXMuX2dldE1lbnVTdGFjaygpPy5jbG9zZVN1Yk1lbnVPZih0aGlzLl9wYXJlbnRNZW51ISkpO1xuXG4gICAgICB0aGlzLl9uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT5cbiAgICAgICAgZnJvbUV2ZW50KHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudCwgJ21vdXNlZW50ZXInKVxuICAgICAgICAgIC5waXBlKFxuICAgICAgICAgICAgZmlsdGVyKCgpID0+ICF0aGlzLl9nZXRNZW51U3RhY2soKT8uaXNFbXB0eSgpICYmICF0aGlzLmhhc01lbnUoKSksXG4gICAgICAgICAgICB0YWtlVW50aWwodGhpcy5fZGVzdHJveWVkKVxuICAgICAgICAgIClcbiAgICAgICAgICAuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9tZW51QWltKSB7XG4gICAgICAgICAgICAgIHRoaXMuX21lbnVBaW0udG9nZ2xlKGNsb3NlT3BlblNpYmxpbmdzKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGNsb3NlT3BlblNpYmxpbmdzKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSlcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybiB0cnVlIGlmIHRoZSBlbmNsb3NpbmcgcGFyZW50IG1lbnUgaXMgY29uZmlndXJlZCBpbiBhIGhvcml6b250YWwgb3JpZW50YXRpb24sIGZhbHNlXG4gICAqIG90aGVyd2lzZSBvciBpZiBubyBwYXJlbnQuXG4gICAqL1xuICBwcml2YXRlIF9pc1BhcmVudFZlcnRpY2FsKCkge1xuICAgIHJldHVybiB0aGlzLl9wYXJlbnRNZW51Py5vcmllbnRhdGlvbiA9PT0gJ3ZlcnRpY2FsJztcbiAgfVxuXG4gIC8qKiBHZXQgdGhlIE1lbnVTdGFjayBmcm9tIHRoZSBwYXJlbnQgbWVudS4gKi9cbiAgcHJpdmF0ZSBfZ2V0TWVudVN0YWNrKCkge1xuICAgIC8vIFdlIHVzZSBhIGZ1bmN0aW9uIHNpbmNlIGF0IHRoZSBjb25zdHJ1Y3Rpb24gb2YgdGhlIE1lbnVJdGVtVHJpZ2dlciB0aGUgcGFyZW50IE1lbnUgd29uJ3QgaGF2ZVxuICAgIC8vIGl0cyBtZW51IHN0YWNrIHNldC4gVGhlcmVmb3JlIHdlIG5lZWQgdG8gcmVmZXJlbmNlIHRoZSBtZW51IHN0YWNrIGZyb20gdGhlIHBhcmVudCBlYWNoIHRpbWVcbiAgICAvLyB3ZSB3YW50IHRvIHVzZSBpdC5cbiAgICByZXR1cm4gdGhpcy5fcGFyZW50TWVudT8uX21lbnVTdGFjaztcbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIHRoaXMuX2Rlc3Ryb3llZC5uZXh0KCk7XG4gIH1cblxuICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZGlzYWJsZWQ6IEJvb2xlYW5JbnB1dDtcbn1cbiJdfQ==