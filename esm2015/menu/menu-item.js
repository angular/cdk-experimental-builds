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
    var _a;
    for (const icon of Array.from(element.querySelectorAll('mat-icon, .material-icons'))) {
        (_a = icon.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild(icon);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1pdGVtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvbWVudS9tZW51LWl0ZW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUNMLFNBQVMsRUFDVCxLQUFLLEVBQ0wsUUFBUSxFQUNSLElBQUksRUFDSixVQUFVLEVBQ1YsTUFBTSxFQUNOLFlBQVksRUFDWixNQUFNLEVBQ04sWUFBWSxFQUNaLE1BQU0sR0FFUCxNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUMscUJBQXFCLEVBQWUsTUFBTSx1QkFBdUIsQ0FBQztBQUUxRSxPQUFPLEVBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsVUFBVSxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDNUUsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQ2pELE9BQU8sRUFBQyxPQUFPLEVBQUUsU0FBUyxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQ3hDLE9BQU8sRUFBQyxTQUFTLEVBQUUsTUFBTSxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDakQsT0FBTyxFQUFDLGtCQUFrQixFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDdkQsT0FBTyxFQUFPLFFBQVEsRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBR2hELE9BQU8sRUFBVSxRQUFRLEVBQVUsTUFBTSxZQUFZLENBQUM7QUFFdEQsbUZBQW1GO0FBQ25GLHVEQUF1RDtBQUN2RCxTQUFTLFdBQVcsQ0FBQyxPQUFnQjs7SUFDbkMsS0FBSyxNQUFNLElBQUksSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDLEVBQUU7UUFDcEYsTUFBQSxJQUFJLENBQUMsVUFBVSwwQ0FBRSxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDcEM7QUFDSCxDQUFD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aUVyQixJQUFJLFlBQUksUUFBUTs7O3VCQWpDbEIsS0FBSzt3QkFhTCxNQUFNLFNBQUMsc0JBQXNCOzZCQXNDN0IsWUFBWSxTQUFDLE1BQU0sY0FDbkIsWUFBWSxTQUFDLFVBQVU7MkJBWXZCLFlBQVksU0FBQyxPQUFPLGNBQ3BCLFlBQVksU0FBQyxZQUFZLEVBQUUsQ0FBQyxRQUFRLENBQUM7c0JBeUJyQyxZQUFZLFNBQUMsT0FBTzt5QkFpRHBCLFlBQVksU0FBQyxTQUFTLEVBQUUsQ0FBQyxRQUFRLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtcbiAgRGlyZWN0aXZlLFxuICBJbnB1dCxcbiAgT3B0aW9uYWwsXG4gIFNlbGYsXG4gIEVsZW1lbnRSZWYsXG4gIE91dHB1dCxcbiAgRXZlbnRFbWl0dGVyLFxuICBJbmplY3QsXG4gIEhvc3RMaXN0ZW5lcixcbiAgTmdab25lLFxuICBPbkRlc3Ryb3ksXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtjb2VyY2VCb29sZWFuUHJvcGVydHksIEJvb2xlYW5JbnB1dH0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvZXJjaW9uJztcbmltcG9ydCB7Rm9jdXNhYmxlT3B0aW9ufSBmcm9tICdAYW5ndWxhci9jZGsvYTExeSc7XG5pbXBvcnQge1NQQUNFLCBFTlRFUiwgUklHSFRfQVJST1csIExFRlRfQVJST1d9IGZyb20gJ0Bhbmd1bGFyL2Nkay9rZXljb2Rlcyc7XG5pbXBvcnQge0RpcmVjdGlvbmFsaXR5fSBmcm9tICdAYW5ndWxhci9jZGsvYmlkaSc7XG5pbXBvcnQge1N1YmplY3QsIGZyb21FdmVudH0gZnJvbSAncnhqcyc7XG5pbXBvcnQge3Rha2VVbnRpbCwgZmlsdGVyfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5pbXBvcnQge0Nka01lbnVJdGVtVHJpZ2dlcn0gZnJvbSAnLi9tZW51LWl0ZW0tdHJpZ2dlcic7XG5pbXBvcnQge01lbnUsIENES19NRU5VfSBmcm9tICcuL21lbnUtaW50ZXJmYWNlJztcbmltcG9ydCB7Rm9jdXNOZXh0fSBmcm9tICcuL21lbnUtc3RhY2snO1xuaW1wb3J0IHtGb2N1c2FibGVFbGVtZW50fSBmcm9tICcuL3BvaW50ZXItZm9jdXMtdHJhY2tlcic7XG5pbXBvcnQge1RvZ2dsZXIsIE1FTlVfQUlNLCBNZW51QWltfSBmcm9tICcuL21lbnUtYWltJztcblxuLy8gVE9ETyByZWZhY3RvciB0aGlzIHRvIGJlIGNvbmZpZ3VyYWJsZSBhbGxvd2luZyBmb3IgY3VzdG9tIGVsZW1lbnRzIHRvIGJlIHJlbW92ZWRcbi8qKiBSZW1vdmVzIGFsbCBpY29ucyBmcm9tIHdpdGhpbiB0aGUgZ2l2ZW4gZWxlbWVudC4gKi9cbmZ1bmN0aW9uIHJlbW92ZUljb25zKGVsZW1lbnQ6IEVsZW1lbnQpIHtcbiAgZm9yIChjb25zdCBpY29uIG9mIEFycmF5LmZyb20oZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKCdtYXQtaWNvbiwgLm1hdGVyaWFsLWljb25zJykpKSB7XG4gICAgaWNvbi5wYXJlbnROb2RlPy5yZW1vdmVDaGlsZChpY29uKTtcbiAgfVxufVxuXG4vKipcbiAqIERpcmVjdGl2ZSB3aGljaCBwcm92aWRlcyB0aGUgYWJpbGl0eSBmb3IgYW4gZWxlbWVudCB0byBiZSBmb2N1c2VkIGFuZCBuYXZpZ2F0ZWQgdG8gdXNpbmcgdGhlXG4gKiBrZXlib2FyZCB3aGVuIHJlc2lkaW5nIGluIGEgQ2RrTWVudSwgQ2RrTWVudUJhciwgb3IgQ2RrTWVudUdyb3VwLiBJdCBwZXJmb3JtcyB1c2VyIGRlZmluZWRcbiAqIGJlaGF2aW9yIHdoZW4gY2xpY2tlZC5cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW2Nka01lbnVJdGVtXScsXG4gIGV4cG9ydEFzOiAnY2RrTWVudUl0ZW0nLFxuICBob3N0OiB7XG4gICAgJ1t0YWJpbmRleF0nOiAnX3RhYmluZGV4JyxcbiAgICAndHlwZSc6ICdidXR0b24nLFxuICAgICdyb2xlJzogJ21lbnVpdGVtJyxcbiAgICAnY2xhc3MnOiAnY2RrLW1lbnUtaXRlbScsXG4gICAgJ1thdHRyLmFyaWEtZGlzYWJsZWRdJzogJ2Rpc2FibGVkIHx8IG51bGwnLFxuICB9LFxufSlcbmV4cG9ydCBjbGFzcyBDZGtNZW51SXRlbSBpbXBsZW1lbnRzIEZvY3VzYWJsZU9wdGlvbiwgRm9jdXNhYmxlRWxlbWVudCwgVG9nZ2xlciwgT25EZXN0cm95IHtcbiAgLyoqICBXaGV0aGVyIHRoZSBDZGtNZW51SXRlbSBpcyBkaXNhYmxlZCAtIGRlZmF1bHRzIHRvIGZhbHNlICovXG4gIEBJbnB1dCgpXG4gIGdldCBkaXNhYmxlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fZGlzYWJsZWQ7XG4gIH1cbiAgc2V0IGRpc2FibGVkKHZhbHVlOiBib29sZWFuKSB7XG4gICAgdGhpcy5fZGlzYWJsZWQgPSBjb2VyY2VCb29sZWFuUHJvcGVydHkodmFsdWUpO1xuICB9XG4gIHByaXZhdGUgX2Rpc2FibGVkID0gZmFsc2U7XG5cbiAgLyoqXG4gICAqIElmIHRoaXMgTWVudUl0ZW0gaXMgYSByZWd1bGFyIE1lbnVJdGVtLCBvdXRwdXRzIHdoZW4gaXQgaXMgdHJpZ2dlcmVkIGJ5IGEga2V5Ym9hcmQgb3IgbW91c2VcbiAgICogZXZlbnQuXG4gICAqL1xuICBAT3V0cHV0KCdjZGtNZW51SXRlbVRyaWdnZXJlZCcpIHRyaWdnZXJlZDogRXZlbnRFbWl0dGVyPHZvaWQ+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4gIC8qKlxuICAgKiBUaGUgdGFiaW5kZXggZm9yIHRoaXMgbWVudSBpdGVtIG1hbmFnZWQgaW50ZXJuYWxseSBhbmQgdXNlZCBmb3IgaW1wbGVtZW50aW5nIHJvdmluZyBhXG4gICAqIHRhYiBpbmRleC5cbiAgICovXG4gIF90YWJpbmRleDogMCB8IC0xID0gLTE7XG5cbiAgLyoqIEVtaXRzIHdoZW4gdGhlIG1lbnUgaXRlbSBpcyBkZXN0cm95ZWQuICovXG4gIHByaXZhdGUgcmVhZG9ubHkgX2Rlc3Ryb3llZDogU3ViamVjdDx2b2lkPiA9IG5ldyBTdWJqZWN0KCk7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcmVhZG9ubHkgX2VsZW1lbnRSZWY6IEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+LFxuICAgIHByaXZhdGUgcmVhZG9ubHkgX25nWm9uZTogTmdab25lLFxuICAgIEBPcHRpb25hbCgpIEBJbmplY3QoQ0RLX01FTlUpIHByaXZhdGUgcmVhZG9ubHkgX3BhcmVudE1lbnU/OiBNZW51LFxuICAgIEBPcHRpb25hbCgpIEBJbmplY3QoTUVOVV9BSU0pIHByaXZhdGUgcmVhZG9ubHkgX21lbnVBaW0/OiBNZW51QWltLFxuICAgIEBPcHRpb25hbCgpIHByaXZhdGUgcmVhZG9ubHkgX2Rpcj86IERpcmVjdGlvbmFsaXR5LFxuICAgIC8qKiBSZWZlcmVuY2UgdG8gdGhlIENka01lbnVJdGVtVHJpZ2dlciBkaXJlY3RpdmUgaWYgb25lIGlzIGFkZGVkIHRvIHRoZSBzYW1lIGVsZW1lbnQgKi9cbiAgICAvLyBgQ2RrTWVudUl0ZW1gIGlzIGNvbW1vbmx5IHVzZWQgaW4gY29tYmluYXRpb24gd2l0aCBhIGBDZGtNZW51SXRlbVRyaWdnZXJgLlxuICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTogbGlnaHR3ZWlnaHQtdG9rZW5zXG4gICAgQFNlbGYoKSBAT3B0aW9uYWwoKSBwcml2YXRlIHJlYWRvbmx5IF9tZW51VHJpZ2dlcj86IENka01lbnVJdGVtVHJpZ2dlclxuICApIHtcbiAgICB0aGlzLl9zZXR1cE1vdXNlRW50ZXIoKTtcblxuICAgIGlmICh0aGlzLl9pc1N0YW5kYWxvbmVJdGVtKCkpIHtcbiAgICAgIHRoaXMuX3RhYmluZGV4ID0gMDtcbiAgICB9XG4gIH1cblxuICAvKiogUGxhY2UgZm9jdXMgb24gdGhlIGVsZW1lbnQuICovXG4gIGZvY3VzKCkge1xuICAgIHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5mb2N1cygpO1xuICB9XG5cbiAgLy8gSW4gSXZ5IHRoZSBgaG9zdGAgbWV0YWRhdGEgd2lsbCBiZSBtZXJnZWQsIHdoZXJlYXMgaW4gVmlld0VuZ2luZSBpdCBpcyBvdmVycmlkZGVuLiBJbiBvcmRlclxuICAvLyB0byBhdm9pZCBkb3VibGUgZXZlbnQgbGlzdGVuZXJzLCB3ZSBuZWVkIHRvIHVzZSBgSG9zdExpc3RlbmVyYC4gT25jZSBJdnkgaXMgdGhlIGRlZmF1bHQsIHdlXG4gIC8vIGNhbiBtb3ZlIHRoaXMgYmFjayBpbnRvIGBob3N0YC5cbiAgLy8gdHNsaW50OmRpc2FibGU6bm8taG9zdC1kZWNvcmF0b3ItaW4tY29uY3JldGVcbiAgQEhvc3RMaXN0ZW5lcignYmx1cicpXG4gIEBIb3N0TGlzdGVuZXIoJ21vdXNlb3V0JylcbiAgLyoqIFJlc2V0IHRoZSBfdGFiaW5kZXggdG8gLTEuICovXG4gIF9yZXNldFRhYkluZGV4KCkge1xuICAgIGlmICghdGhpcy5faXNTdGFuZGFsb25lSXRlbSgpKSB7XG4gICAgICB0aGlzLl90YWJpbmRleCA9IC0xO1xuICAgIH1cbiAgfVxuXG4gIC8vIEluIEl2eSB0aGUgYGhvc3RgIG1ldGFkYXRhIHdpbGwgYmUgbWVyZ2VkLCB3aGVyZWFzIGluIFZpZXdFbmdpbmUgaXQgaXMgb3ZlcnJpZGRlbi4gSW4gb3JkZXJcbiAgLy8gdG8gYXZvaWQgZG91YmxlIGV2ZW50IGxpc3RlbmVycywgd2UgbmVlZCB0byB1c2UgYEhvc3RMaXN0ZW5lcmAuIE9uY2UgSXZ5IGlzIHRoZSBkZWZhdWx0LCB3ZVxuICAvLyBjYW4gbW92ZSB0aGlzIGJhY2sgaW50byBgaG9zdGAuXG4gIC8vIHRzbGludDpkaXNhYmxlOm5vLWhvc3QtZGVjb3JhdG9yLWluLWNvbmNyZXRlXG4gIEBIb3N0TGlzdGVuZXIoJ2ZvY3VzJylcbiAgQEhvc3RMaXN0ZW5lcignbW91c2VlbnRlcicsIFsnJGV2ZW50J10pXG4gIC8qKlxuICAgKiBTZXQgdGhlIHRhYiBpbmRleCB0byAwIGlmIG5vdCBkaXNhYmxlZCBhbmQgaXQncyBhIGZvY3VzIGV2ZW50LCBvciBhIG1vdXNlIGVudGVyIGlmIHRoaXMgZWxlbWVudFxuICAgKiBpcyBub3QgaW4gYSBtZW51IGJhci5cbiAgICovXG4gIF9zZXRUYWJJbmRleChldmVudD86IE1vdXNlRXZlbnQpIHtcbiAgICBpZiAodGhpcy5kaXNhYmxlZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIGRvbid0IHNldCB0aGUgdGFiaW5kZXggaWYgdGhlcmUgYXJlIG5vIG9wZW4gc2libGluZyBvciBwYXJlbnQgbWVudXNcbiAgICBpZiAoIWV2ZW50IHx8ICF0aGlzLl9nZXRNZW51U3RhY2soKT8uaXNFbXB0eSgpKSB7XG4gICAgICB0aGlzLl90YWJpbmRleCA9IDA7XG4gICAgfVxuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhpcyBtZW51IGl0ZW0gaXMgc3RhbmRhbG9uZSBvciB3aXRoaW4gYSBtZW51IG9yIG1lbnUgYmFyLiAqL1xuICBfaXNTdGFuZGFsb25lSXRlbSgpIHtcbiAgICByZXR1cm4gIXRoaXMuX3BhcmVudE1lbnU7XG4gIH1cblxuICAvLyBJbiBJdnkgdGhlIGBob3N0YCBtZXRhZGF0YSB3aWxsIGJlIG1lcmdlZCwgd2hlcmVhcyBpbiBWaWV3RW5naW5lIGl0IGlzIG92ZXJyaWRkZW4uIEluIG9yZGVyXG4gIC8vIHRvIGF2b2lkIGRvdWJsZSBldmVudCBsaXN0ZW5lcnMsIHdlIG5lZWQgdG8gdXNlIGBIb3N0TGlzdGVuZXJgLiBPbmNlIEl2eSBpcyB0aGUgZGVmYXVsdCwgd2VcbiAgLy8gY2FuIG1vdmUgdGhpcyBiYWNrIGludG8gYGhvc3RgLlxuICAvLyB0c2xpbnQ6ZGlzYWJsZTpuby1ob3N0LWRlY29yYXRvci1pbi1jb25jcmV0ZVxuICBASG9zdExpc3RlbmVyKCdjbGljaycpXG4gIC8qKlxuICAgKiBJZiB0aGUgbWVudSBpdGVtIGlzIG5vdCBkaXNhYmxlZCBhbmQgdGhlIGVsZW1lbnQgZG9lcyBub3QgaGF2ZSBhIG1lbnUgdHJpZ2dlciBhdHRhY2hlZCwgZW1pdFxuICAgKiBvbiB0aGUgY2RrTWVudUl0ZW1UcmlnZ2VyZWQgZW1pdHRlciBhbmQgY2xvc2UgYWxsIG9wZW4gbWVudXMuXG4gICAqL1xuICB0cmlnZ2VyKCkge1xuICAgIGlmICghdGhpcy5kaXNhYmxlZCAmJiAhdGhpcy5oYXNNZW51KCkpIHtcbiAgICAgIHRoaXMudHJpZ2dlcmVkLm5leHQoKTtcbiAgICAgIHRoaXMuX2dldE1lbnVTdGFjaygpPy5jbG9zZUFsbCgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoZSBtZW51IGl0ZW0gb3BlbnMgYSBtZW51LiAqL1xuICBoYXNNZW51KCkge1xuICAgIHJldHVybiAhIXRoaXMuX21lbnVUcmlnZ2VyPy5oYXNNZW51KCk7XG4gIH1cblxuICAvKiogUmV0dXJuIHRydWUgaWYgdGhpcyBNZW51SXRlbSBoYXMgYW4gYXR0YWNoZWQgbWVudSBhbmQgaXQgaXMgb3Blbi4gKi9cbiAgaXNNZW51T3BlbigpIHtcbiAgICByZXR1cm4gISF0aGlzLl9tZW51VHJpZ2dlcj8uaXNNZW51T3BlbigpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhIHJlZmVyZW5jZSB0byB0aGUgcmVuZGVyZWQgTWVudSBpZiB0aGUgTWVudSBpcyBvcGVuIGFuZCBpdCBpcyB2aXNpYmxlIGluIHRoZSBET00uXG4gICAqIEByZXR1cm4gdGhlIG1lbnUgaWYgaXQgaXMgb3Blbiwgb3RoZXJ3aXNlIHVuZGVmaW5lZC5cbiAgICovXG4gIGdldE1lbnUoKTogTWVudSB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIHRoaXMuX21lbnVUcmlnZ2VyPy5nZXRNZW51KCk7XG4gIH1cblxuICAvKiogR2V0IHRoZSBNZW51SXRlbVRyaWdnZXIgYXNzb2NpYXRlZCB3aXRoIHRoaXMgZWxlbWVudC4gKi9cbiAgZ2V0TWVudVRyaWdnZXIoKTogQ2RrTWVudUl0ZW1UcmlnZ2VyIHwgdW5kZWZpbmVkIHtcbiAgICByZXR1cm4gdGhpcy5fbWVudVRyaWdnZXI7XG4gIH1cblxuICAvKiogR2V0IHRoZSBsYWJlbCBmb3IgdGhpcyBlbGVtZW50IHdoaWNoIGlzIHJlcXVpcmVkIGJ5IHRoZSBGb2N1c2FibGVPcHRpb24gaW50ZXJmYWNlLiAqL1xuICBnZXRMYWJlbCgpOiBzdHJpbmcge1xuICAgIC8vIFRPRE8gY2xvbmluZyB0aGUgdHJlZSBtYXkgYmUgZXhwZW5zaXZlOyBpbXBsZW1lbnQgYSBiZXR0ZXIgbWV0aG9kXG4gICAgLy8gd2Uga25vdyB0aGF0IHRoZSBjdXJyZW50IG5vZGUgaXMgYW4gZWxlbWVudCB0eXBlXG4gICAgY29uc3QgY2xvbmUgPSB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQuY2xvbmVOb2RlKHRydWUpIGFzIEVsZW1lbnQ7XG4gICAgcmVtb3ZlSWNvbnMoY2xvbmUpO1xuXG4gICAgcmV0dXJuIGNsb25lLnRleHRDb250ZW50Py50cmltKCkgfHwgJyc7XG4gIH1cblxuICAvLyBJbiBJdnkgdGhlIGBob3N0YCBtZXRhZGF0YSB3aWxsIGJlIG1lcmdlZCwgd2hlcmVhcyBpbiBWaWV3RW5naW5lIGl0IGlzIG92ZXJyaWRkZW4uIEluIG9yZGVyXG4gIC8vIHRvIGF2b2lkIGRvdWJsZSBldmVudCBsaXN0ZW5lcnMsIHdlIG5lZWQgdG8gdXNlIGBIb3N0TGlzdGVuZXJgLiBPbmNlIEl2eSBpcyB0aGUgZGVmYXVsdCwgd2VcbiAgLy8gY2FuIG1vdmUgdGhpcyBiYWNrIGludG8gYGhvc3RgLlxuICAvLyB0c2xpbnQ6ZGlzYWJsZTpuby1ob3N0LWRlY29yYXRvci1pbi1jb25jcmV0ZVxuICBASG9zdExpc3RlbmVyKCdrZXlkb3duJywgWyckZXZlbnQnXSlcbiAgLyoqXG4gICAqIEhhbmRsZXMga2V5Ym9hcmQgZXZlbnRzIGZvciB0aGUgbWVudSBpdGVtLCBzcGVjaWZpY2FsbHkgZWl0aGVyIHRyaWdnZXJpbmcgdGhlIHVzZXIgZGVmaW5lZFxuICAgKiBjYWxsYmFjayBvciBvcGVuaW5nL2Nsb3NpbmcgdGhlIGN1cnJlbnQgbWVudSBiYXNlZCBvbiB3aGV0aGVyIHRoZSBsZWZ0IG9yIHJpZ2h0IGFycm93IGtleSB3YXNcbiAgICogcHJlc3NlZC5cbiAgICogQHBhcmFtIGV2ZW50IHRoZSBrZXlib2FyZCBldmVudCB0byBoYW5kbGVcbiAgICovXG4gIF9vbktleWRvd24oZXZlbnQ6IEtleWJvYXJkRXZlbnQpIHtcbiAgICBzd2l0Y2ggKGV2ZW50LmtleUNvZGUpIHtcbiAgICAgIGNhc2UgU1BBQ0U6XG4gICAgICBjYXNlIEVOVEVSOlxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB0aGlzLnRyaWdnZXIoKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgUklHSFRfQVJST1c6XG4gICAgICAgIGlmICh0aGlzLl9wYXJlbnRNZW51ICYmIHRoaXMuX2lzUGFyZW50VmVydGljYWwoKSAmJiAhdGhpcy5oYXNNZW51KCkpIHtcbiAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgIHRoaXMuX2Rpcj8udmFsdWUgPT09ICdydGwnXG4gICAgICAgICAgICA/IHRoaXMuX2dldE1lbnVTdGFjaygpPy5jbG9zZSh0aGlzLl9wYXJlbnRNZW51LCBGb2N1c05leHQucHJldmlvdXNJdGVtKVxuICAgICAgICAgICAgOiB0aGlzLl9nZXRNZW51U3RhY2soKT8uY2xvc2VBbGwoRm9jdXNOZXh0Lm5leHRJdGVtKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBMRUZUX0FSUk9XOlxuICAgICAgICBpZiAodGhpcy5fcGFyZW50TWVudSAmJiB0aGlzLl9pc1BhcmVudFZlcnRpY2FsKCkgJiYgIXRoaXMuaGFzTWVudSgpKSB7XG4gICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICB0aGlzLl9kaXI/LnZhbHVlID09PSAncnRsJ1xuICAgICAgICAgICAgPyB0aGlzLl9nZXRNZW51U3RhY2soKT8uY2xvc2VBbGwoRm9jdXNOZXh0Lm5leHRJdGVtKVxuICAgICAgICAgICAgOiB0aGlzLl9nZXRNZW51U3RhY2soKT8uY2xvc2UodGhpcy5fcGFyZW50TWVudSwgRm9jdXNOZXh0LnByZXZpb3VzSXRlbSk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFN1YnNjcmliZSB0byB0aGUgbW91c2VlbnRlciBldmVudHMgYW5kIGNsb3NlIGFueSBzaWJsaW5nIG1lbnUgaXRlbXMgaWYgdGhpcyBlbGVtZW50IGlzIG1vdXNlZFxuICAgKiBpbnRvLlxuICAgKi9cbiAgcHJpdmF0ZSBfc2V0dXBNb3VzZUVudGVyKCkge1xuICAgIGlmICghdGhpcy5faXNTdGFuZGFsb25lSXRlbSgpKSB7XG4gICAgICBjb25zdCBjbG9zZU9wZW5TaWJsaW5ncyA9ICgpID0+XG4gICAgICAgIHRoaXMuX25nWm9uZS5ydW4oKCkgPT4gdGhpcy5fZ2V0TWVudVN0YWNrKCk/LmNsb3NlU3ViTWVudU9mKHRoaXMuX3BhcmVudE1lbnUhKSk7XG5cbiAgICAgIHRoaXMuX25nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PlxuICAgICAgICBmcm9tRXZlbnQodGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LCAnbW91c2VlbnRlcicpXG4gICAgICAgICAgLnBpcGUoXG4gICAgICAgICAgICBmaWx0ZXIoKCkgPT4gIXRoaXMuX2dldE1lbnVTdGFjaygpPy5pc0VtcHR5KCkgJiYgIXRoaXMuaGFzTWVudSgpKSxcbiAgICAgICAgICAgIHRha2VVbnRpbCh0aGlzLl9kZXN0cm95ZWQpXG4gICAgICAgICAgKVxuICAgICAgICAgIC5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgICAgICAgaWYgKHRoaXMuX21lbnVBaW0pIHtcbiAgICAgICAgICAgICAgdGhpcy5fbWVudUFpbS50b2dnbGUoY2xvc2VPcGVuU2libGluZ3MpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgY2xvc2VPcGVuU2libGluZ3MoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KVxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIHRydWUgaWYgdGhlIGVuY2xvc2luZyBwYXJlbnQgbWVudSBpcyBjb25maWd1cmVkIGluIGEgaG9yaXpvbnRhbCBvcmllbnRhdGlvbiwgZmFsc2VcbiAgICogb3RoZXJ3aXNlIG9yIGlmIG5vIHBhcmVudC5cbiAgICovXG4gIHByaXZhdGUgX2lzUGFyZW50VmVydGljYWwoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3BhcmVudE1lbnU/Lm9yaWVudGF0aW9uID09PSAndmVydGljYWwnO1xuICB9XG5cbiAgLyoqIEdldCB0aGUgTWVudVN0YWNrIGZyb20gdGhlIHBhcmVudCBtZW51LiAqL1xuICBwcml2YXRlIF9nZXRNZW51U3RhY2soKSB7XG4gICAgLy8gV2UgdXNlIGEgZnVuY3Rpb24gc2luY2UgYXQgdGhlIGNvbnN0cnVjdGlvbiBvZiB0aGUgTWVudUl0ZW1UcmlnZ2VyIHRoZSBwYXJlbnQgTWVudSB3b24ndCBoYXZlXG4gICAgLy8gaXRzIG1lbnUgc3RhY2sgc2V0LiBUaGVyZWZvcmUgd2UgbmVlZCB0byByZWZlcmVuY2UgdGhlIG1lbnUgc3RhY2sgZnJvbSB0aGUgcGFyZW50IGVhY2ggdGltZVxuICAgIC8vIHdlIHdhbnQgdG8gdXNlIGl0LlxuICAgIHJldHVybiB0aGlzLl9wYXJlbnRNZW51Py5fbWVudVN0YWNrO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgdGhpcy5fZGVzdHJveWVkLm5leHQoKTtcbiAgfVxuXG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9kaXNhYmxlZDogQm9vbGVhbklucHV0O1xufVxuIl19