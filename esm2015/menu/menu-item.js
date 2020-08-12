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
    constructor(_elementRef, _parentMenu, _ngZone, _dir, 
    /** Reference to the CdkMenuItemTrigger directive if one is added to the same element */
    // `CdkMenuItem` is commonly used in combination with a `CdkMenuItemTrigger`.
    // tslint:disable-next-line: lightweight-tokens
    _menuTrigger) {
        this._elementRef = _elementRef;
        this._parentMenu = _parentMenu;
        this._ngZone = _ngZone;
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
        this._tabindex = -1;
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
        if (this.disabled) {
            return;
        }
        // don't set the tabindex if there are no open sibling or parent menus
        if (!event || (event && !this._getMenuStack().isEmpty())) {
            this._tabindex = 0;
        }
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
        if (!this.disabled && !this.hasMenu()) {
            this.triggered.next();
            this._getMenuStack().closeAll();
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
        var _a, _b;
        switch (event.keyCode) {
            case SPACE:
            case ENTER:
                event.preventDefault();
                this.trigger();
                break;
            case RIGHT_ARROW:
                if (this._isParentVertical() && !this.hasMenu()) {
                    event.preventDefault();
                    ((_a = this._dir) === null || _a === void 0 ? void 0 : _a.value) === 'rtl'
                        ? this._getMenuStack().close(this._parentMenu, 1 /* previousItem */)
                        : this._getMenuStack().closeAll(0 /* nextItem */);
                }
                break;
            case LEFT_ARROW:
                if (this._isParentVertical() && !this.hasMenu()) {
                    event.preventDefault();
                    ((_b = this._dir) === null || _b === void 0 ? void 0 : _b.value) === 'rtl'
                        ? this._getMenuStack().closeAll(0 /* nextItem */)
                        : this._getMenuStack().close(this._parentMenu, 1 /* previousItem */);
                }
                break;
        }
    }
    /**
     * Subscribe to the mouseenter events and close any sibling menu items if this element is moused
     * into.
     */
    _setupMouseEnter() {
        this._ngZone.runOutsideAngular(() => fromEvent(this._elementRef.nativeElement, 'mouseenter')
            .pipe(filter(() => !this._getMenuStack().isEmpty() && !this.hasMenu()), takeUntil(this._destroyed))
            .subscribe(() => {
            this._ngZone.run(() => this._getMenuStack().closeSubMenuOf(this._parentMenu));
        }));
    }
    /** Return true if the enclosing parent menu is configured in a horizontal orientation. */
    _isParentVertical() {
        return this._parentMenu.orientation === 'vertical';
    }
    /** Get the MenuStack from the parent menu. */
    _getMenuStack() {
        // We use a function since at the construction of the MenuItemTrigger the parent Menu won't have
        // its menu stack set. Therefore we need to reference the menu stack from the parent each time
        // we want to use it.
        return this._parentMenu._menuStack;
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
    { type: undefined, decorators: [{ type: Inject, args: [CDK_MENU,] }] },
    { type: NgZone },
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1pdGVtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvbWVudS9tZW51LWl0ZW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUNMLFNBQVMsRUFDVCxLQUFLLEVBQ0wsUUFBUSxFQUNSLElBQUksRUFDSixVQUFVLEVBQ1YsTUFBTSxFQUNOLFlBQVksRUFDWixNQUFNLEVBQ04sWUFBWSxFQUNaLE1BQU0sR0FFUCxNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUMscUJBQXFCLEVBQWUsTUFBTSx1QkFBdUIsQ0FBQztBQUUxRSxPQUFPLEVBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsVUFBVSxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDNUUsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQ2pELE9BQU8sRUFBQyxPQUFPLEVBQUUsU0FBUyxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQ3hDLE9BQU8sRUFBQyxTQUFTLEVBQUUsTUFBTSxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDakQsT0FBTyxFQUFDLGtCQUFrQixFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDdkQsT0FBTyxFQUFPLFFBQVEsRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBSWhELG1GQUFtRjtBQUNuRix1REFBdUQ7QUFDdkQsU0FBUyxXQUFXLENBQUMsT0FBZ0I7O0lBQ25DLEtBQUssTUFBTSxJQUFJLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsMkJBQTJCLENBQUMsQ0FBQyxFQUFFO1FBQ3BGLE1BQUEsSUFBSSxDQUFDLFVBQVUsMENBQUUsV0FBVyxDQUFDLElBQUksRUFBRTtLQUNwQztBQUNILENBQUM7QUFFRDs7OztHQUlHO0FBWUgsTUFBTSxPQUFPLFdBQVc7SUEwQnRCLFlBQ1cs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Q2hCLE1BQU0sRUFBRSxVQUFVO29CQUNsQixPQUFPLEVBQUUsZUFBZTtvQkFDeEIsc0JBQXNCLEVBQUUsa0JBQWtCO2lCQUMzQzthQUNGOzs7WUExQ0MsVUFBVTs0Q0F1RVAsTUFBTSxTQUFDLFFBQVE7WUFsRWxCLE1BQU07WUFNQSxjQUFjLHVCQThEakIsUUFBUTtZQTNETCxrQkFBa0IsdUJBK0RyQixJQUFJLFlBQUksUUFBUTs7O3VCQWhDbEIsS0FBSzt3QkFhTCxNQUFNLFNBQUMsc0JBQXNCOzZCQWlDN0IsWUFBWSxTQUFDLE1BQU0sY0FDbkIsWUFBWSxTQUFDLFVBQVU7MkJBVXZCLFlBQVksU0FBQyxPQUFPLGNBQ3BCLFlBQVksU0FBQyxZQUFZLEVBQUUsQ0FBQyxRQUFRLENBQUM7c0JBb0JyQyxZQUFZLFNBQUMsT0FBTzt5QkFpRHBCLFlBQVksU0FBQyxTQUFTLEVBQUUsQ0FBQyxRQUFRLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtcbiAgRGlyZWN0aXZlLFxuICBJbnB1dCxcbiAgT3B0aW9uYWwsXG4gIFNlbGYsXG4gIEVsZW1lbnRSZWYsXG4gIE91dHB1dCxcbiAgRXZlbnRFbWl0dGVyLFxuICBJbmplY3QsXG4gIEhvc3RMaXN0ZW5lcixcbiAgTmdab25lLFxuICBPbkRlc3Ryb3ksXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtjb2VyY2VCb29sZWFuUHJvcGVydHksIEJvb2xlYW5JbnB1dH0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvZXJjaW9uJztcbmltcG9ydCB7Rm9jdXNhYmxlT3B0aW9ufSBmcm9tICdAYW5ndWxhci9jZGsvYTExeSc7XG5pbXBvcnQge1NQQUNFLCBFTlRFUiwgUklHSFRfQVJST1csIExFRlRfQVJST1d9IGZyb20gJ0Bhbmd1bGFyL2Nkay9rZXljb2Rlcyc7XG5pbXBvcnQge0RpcmVjdGlvbmFsaXR5fSBmcm9tICdAYW5ndWxhci9jZGsvYmlkaSc7XG5pbXBvcnQge1N1YmplY3QsIGZyb21FdmVudH0gZnJvbSAncnhqcyc7XG5pbXBvcnQge3Rha2VVbnRpbCwgZmlsdGVyfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5pbXBvcnQge0Nka01lbnVJdGVtVHJpZ2dlcn0gZnJvbSAnLi9tZW51LWl0ZW0tdHJpZ2dlcic7XG5pbXBvcnQge01lbnUsIENES19NRU5VfSBmcm9tICcuL21lbnUtaW50ZXJmYWNlJztcbmltcG9ydCB7Rm9jdXNOZXh0fSBmcm9tICcuL21lbnUtc3RhY2snO1xuaW1wb3J0IHtGb2N1c2FibGVFbGVtZW50fSBmcm9tICcuL2l0ZW0tcG9pbnRlci1lbnRyaWVzJztcblxuLy8gVE9ETyByZWZhY3RvciB0aGlzIHRvIGJlIGNvbmZpZ3VyYWJsZSBhbGxvd2luZyBmb3IgY3VzdG9tIGVsZW1lbnRzIHRvIGJlIHJlbW92ZWRcbi8qKiBSZW1vdmVzIGFsbCBpY29ucyBmcm9tIHdpdGhpbiB0aGUgZ2l2ZW4gZWxlbWVudC4gKi9cbmZ1bmN0aW9uIHJlbW92ZUljb25zKGVsZW1lbnQ6IEVsZW1lbnQpIHtcbiAgZm9yIChjb25zdCBpY29uIG9mIEFycmF5LmZyb20oZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKCdtYXQtaWNvbiwgLm1hdGVyaWFsLWljb25zJykpKSB7XG4gICAgaWNvbi5wYXJlbnROb2RlPy5yZW1vdmVDaGlsZChpY29uKTtcbiAgfVxufVxuXG4vKipcbiAqIERpcmVjdGl2ZSB3aGljaCBwcm92aWRlcyB0aGUgYWJpbGl0eSBmb3IgYW4gZWxlbWVudCB0byBiZSBmb2N1c2VkIGFuZCBuYXZpZ2F0ZWQgdG8gdXNpbmcgdGhlXG4gKiBrZXlib2FyZCB3aGVuIHJlc2lkaW5nIGluIGEgQ2RrTWVudSwgQ2RrTWVudUJhciwgb3IgQ2RrTWVudUdyb3VwLiBJdCBwZXJmb3JtcyB1c2VyIGRlZmluZWRcbiAqIGJlaGF2aW9yIHdoZW4gY2xpY2tlZC5cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW2Nka01lbnVJdGVtXScsXG4gIGV4cG9ydEFzOiAnY2RrTWVudUl0ZW0nLFxuICBob3N0OiB7XG4gICAgJ1t0YWJpbmRleF0nOiAnX3RhYmluZGV4JyxcbiAgICAndHlwZSc6ICdidXR0b24nLFxuICAgICdyb2xlJzogJ21lbnVpdGVtJyxcbiAgICAnY2xhc3MnOiAnY2RrLW1lbnUtaXRlbScsXG4gICAgJ1thdHRyLmFyaWEtZGlzYWJsZWRdJzogJ2Rpc2FibGVkIHx8IG51bGwnLFxuICB9LFxufSlcbmV4cG9ydCBjbGFzcyBDZGtNZW51SXRlbSBpbXBsZW1lbnRzIEZvY3VzYWJsZU9wdGlvbiwgRm9jdXNhYmxlRWxlbWVudCwgT25EZXN0cm95IHtcbiAgLyoqICBXaGV0aGVyIHRoZSBDZGtNZW51SXRlbSBpcyBkaXNhYmxlZCAtIGRlZmF1bHRzIHRvIGZhbHNlICovXG4gIEBJbnB1dCgpXG4gIGdldCBkaXNhYmxlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fZGlzYWJsZWQ7XG4gIH1cbiAgc2V0IGRpc2FibGVkKHZhbHVlOiBib29sZWFuKSB7XG4gICAgdGhpcy5fZGlzYWJsZWQgPSBjb2VyY2VCb29sZWFuUHJvcGVydHkodmFsdWUpO1xuICB9XG4gIHByaXZhdGUgX2Rpc2FibGVkID0gZmFsc2U7XG5cbiAgLyoqXG4gICAqIElmIHRoaXMgTWVudUl0ZW0gaXMgYSByZWd1bGFyIE1lbnVJdGVtLCBvdXRwdXRzIHdoZW4gaXQgaXMgdHJpZ2dlcmVkIGJ5IGEga2V5Ym9hcmQgb3IgbW91c2VcbiAgICogZXZlbnQuXG4gICAqL1xuICBAT3V0cHV0KCdjZGtNZW51SXRlbVRyaWdnZXJlZCcpIHRyaWdnZXJlZDogRXZlbnRFbWl0dGVyPHZvaWQ+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4gIC8qKlxuICAgKiBUaGUgdGFiaW5kZXggZm9yIHRoaXMgbWVudSBpdGVtIG1hbmFnZWQgaW50ZXJuYWxseSBhbmQgdXNlZCBmb3IgaW1wbGVtZW50aW5nIHJvdmluZyBhXG4gICAqIHRhYiBpbmRleC5cbiAgICovXG4gIF90YWJpbmRleDogMCB8IC0xID0gLTE7XG5cbiAgLyoqIEVtaXRzIHdoZW4gdGhlIG1lbnUgaXRlbSBpcyBkZXN0cm95ZWQuICovXG4gIHByaXZhdGUgcmVhZG9ubHkgX2Rlc3Ryb3llZDogU3ViamVjdDx2b2lkPiA9IG5ldyBTdWJqZWN0KCk7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcmVhZG9ubHkgX2VsZW1lbnRSZWY6IEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+LFxuICAgIEBJbmplY3QoQ0RLX01FTlUpIHByaXZhdGUgcmVhZG9ubHkgX3BhcmVudE1lbnU6IE1lbnUsXG4gICAgcHJpdmF0ZSByZWFkb25seSBfbmdab25lOiBOZ1pvbmUsXG4gICAgQE9wdGlvbmFsKCkgcHJpdmF0ZSByZWFkb25seSBfZGlyPzogRGlyZWN0aW9uYWxpdHksXG4gICAgLyoqIFJlZmVyZW5jZSB0byB0aGUgQ2RrTWVudUl0ZW1UcmlnZ2VyIGRpcmVjdGl2ZSBpZiBvbmUgaXMgYWRkZWQgdG8gdGhlIHNhbWUgZWxlbWVudCAqL1xuICAgIC8vIGBDZGtNZW51SXRlbWAgaXMgY29tbW9ubHkgdXNlZCBpbiBjb21iaW5hdGlvbiB3aXRoIGEgYENka01lbnVJdGVtVHJpZ2dlcmAuXG4gICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOiBsaWdodHdlaWdodC10b2tlbnNcbiAgICBAU2VsZigpIEBPcHRpb25hbCgpIHByaXZhdGUgcmVhZG9ubHkgX21lbnVUcmlnZ2VyPzogQ2RrTWVudUl0ZW1UcmlnZ2VyXG4gICkge1xuICAgIHRoaXMuX3NldHVwTW91c2VFbnRlcigpO1xuICB9XG5cbiAgLyoqIFBsYWNlIGZvY3VzIG9uIHRoZSBlbGVtZW50LiAqL1xuICBmb2N1cygpIHtcbiAgICB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQuZm9jdXMoKTtcbiAgfVxuXG4gIC8vIEluIEl2eSB0aGUgYGhvc3RgIG1ldGFkYXRhIHdpbGwgYmUgbWVyZ2VkLCB3aGVyZWFzIGluIFZpZXdFbmdpbmUgaXQgaXMgb3ZlcnJpZGRlbi4gSW4gb3JkZXJcbiAgLy8gdG8gYXZvaWQgZG91YmxlIGV2ZW50IGxpc3RlbmVycywgd2UgbmVlZCB0byB1c2UgYEhvc3RMaXN0ZW5lcmAuIE9uY2UgSXZ5IGlzIHRoZSBkZWZhdWx0LCB3ZVxuICAvLyBjYW4gbW92ZSB0aGlzIGJhY2sgaW50byBgaG9zdGAuXG4gIC8vIHRzbGludDpkaXNhYmxlOm5vLWhvc3QtZGVjb3JhdG9yLWluLWNvbmNyZXRlXG4gIEBIb3N0TGlzdGVuZXIoJ2JsdXInKVxuICBASG9zdExpc3RlbmVyKCdtb3VzZW91dCcpXG4gIC8qKiBSZXNldCB0aGUgX3RhYmluZGV4IHRvIC0xLiAqL1xuICBfcmVzZXRUYWJJbmRleCgpIHtcbiAgICB0aGlzLl90YWJpbmRleCA9IC0xO1xuICB9XG5cbiAgLy8gSW4gSXZ5IHRoZSBgaG9zdGAgbWV0YWRhdGEgd2lsbCBiZSBtZXJnZWQsIHdoZXJlYXMgaW4gVmlld0VuZ2luZSBpdCBpcyBvdmVycmlkZGVuLiBJbiBvcmRlclxuICAvLyB0byBhdm9pZCBkb3VibGUgZXZlbnQgbGlzdGVuZXJzLCB3ZSBuZWVkIHRvIHVzZSBgSG9zdExpc3RlbmVyYC4gT25jZSBJdnkgaXMgdGhlIGRlZmF1bHQsIHdlXG4gIC8vIGNhbiBtb3ZlIHRoaXMgYmFjayBpbnRvIGBob3N0YC5cbiAgLy8gdHNsaW50OmRpc2FibGU6bm8taG9zdC1kZWNvcmF0b3ItaW4tY29uY3JldGVcbiAgQEhvc3RMaXN0ZW5lcignZm9jdXMnKVxuICBASG9zdExpc3RlbmVyKCdtb3VzZWVudGVyJywgWyckZXZlbnQnXSlcbiAgLyoqXG4gICAqIFNldCB0aGUgdGFiIGluZGV4IHRvIDAgaWYgbm90IGRpc2FibGVkIGFuZCBpdCdzIGEgZm9jdXMgZXZlbnQsIG9yIGEgbW91c2UgZW50ZXIgaWYgdGhpcyBlbGVtZW50XG4gICAqIGlzIG5vdCBpbiBhIG1lbnUgYmFyLlxuICAgKi9cbiAgX3NldFRhYkluZGV4KGV2ZW50PzogTW91c2VFdmVudCkge1xuICAgIGlmICh0aGlzLmRpc2FibGVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gZG9uJ3Qgc2V0IHRoZSB0YWJpbmRleCBpZiB0aGVyZSBhcmUgbm8gb3BlbiBzaWJsaW5nIG9yIHBhcmVudCBtZW51c1xuICAgIGlmICghZXZlbnQgfHwgKGV2ZW50ICYmICF0aGlzLl9nZXRNZW51U3RhY2soKS5pc0VtcHR5KCkpKSB7XG4gICAgICB0aGlzLl90YWJpbmRleCA9IDA7XG4gICAgfVxuICB9XG5cbiAgLy8gSW4gSXZ5IHRoZSBgaG9zdGAgbWV0YWRhdGEgd2lsbCBiZSBtZXJnZWQsIHdoZXJlYXMgaW4gVmlld0VuZ2luZSBpdCBpcyBvdmVycmlkZGVuLiBJbiBvcmRlclxuICAvLyB0byBhdm9pZCBkb3VibGUgZXZlbnQgbGlzdGVuZXJzLCB3ZSBuZWVkIHRvIHVzZSBgSG9zdExpc3RlbmVyYC4gT25jZSBJdnkgaXMgdGhlIGRlZmF1bHQsIHdlXG4gIC8vIGNhbiBtb3ZlIHRoaXMgYmFjayBpbnRvIGBob3N0YC5cbiAgLy8gdHNsaW50OmRpc2FibGU6bm8taG9zdC1kZWNvcmF0b3ItaW4tY29uY3JldGVcbiAgQEhvc3RMaXN0ZW5lcignY2xpY2snKVxuICAvKipcbiAgICogSWYgdGhlIG1lbnUgaXRlbSBpcyBub3QgZGlzYWJsZWQgYW5kIHRoZSBlbGVtZW50IGRvZXMgbm90IGhhdmUgYSBtZW51IHRyaWdnZXIgYXR0YWNoZWQsIGVtaXRcbiAgICogb24gdGhlIGNka01lbnVJdGVtVHJpZ2dlcmVkIGVtaXR0ZXIgYW5kIGNsb3NlIGFsbCBvcGVuIG1lbnVzLlxuICAgKi9cbiAgdHJpZ2dlcigpIHtcbiAgICBpZiAoIXRoaXMuZGlzYWJsZWQgJiYgIXRoaXMuaGFzTWVudSgpKSB7XG4gICAgICB0aGlzLnRyaWdnZXJlZC5uZXh0KCk7XG4gICAgICB0aGlzLl9nZXRNZW51U3RhY2soKS5jbG9zZUFsbCgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoZSBtZW51IGl0ZW0gb3BlbnMgYSBtZW51LiAqL1xuICBoYXNNZW51KCkge1xuICAgIHJldHVybiAhIXRoaXMuX21lbnVUcmlnZ2VyPy5oYXNNZW51KCk7XG4gIH1cblxuICAvKiogUmV0dXJuIHRydWUgaWYgdGhpcyBNZW51SXRlbSBoYXMgYW4gYXR0YWNoZWQgbWVudSBhbmQgaXQgaXMgb3Blbi4gKi9cbiAgaXNNZW51T3BlbigpIHtcbiAgICByZXR1cm4gISF0aGlzLl9tZW51VHJpZ2dlcj8uaXNNZW51T3BlbigpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhIHJlZmVyZW5jZSB0byB0aGUgcmVuZGVyZWQgTWVudSBpZiB0aGUgTWVudSBpcyBvcGVuIGFuZCBpdCBpcyB2aXNpYmxlIGluIHRoZSBET00uXG4gICAqIEByZXR1cm4gdGhlIG1lbnUgaWYgaXQgaXMgb3Blbiwgb3RoZXJ3aXNlIHVuZGVmaW5lZC5cbiAgICovXG4gIGdldE1lbnUoKTogTWVudSB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIHRoaXMuX21lbnVUcmlnZ2VyPy5nZXRNZW51KCk7XG4gIH1cblxuICAvKiogR2V0IHRoZSBNZW51SXRlbVRyaWdnZXIgYXNzb2NpYXRlZCB3aXRoIHRoaXMgZWxlbWVudC4gKi9cbiAgZ2V0TWVudVRyaWdnZXIoKTogQ2RrTWVudUl0ZW1UcmlnZ2VyIHwgdW5kZWZpbmVkIHtcbiAgICByZXR1cm4gdGhpcy5fbWVudVRyaWdnZXI7XG4gIH1cblxuICAvKiogR2V0IHRoZSBsYWJlbCBmb3IgdGhpcyBlbGVtZW50IHdoaWNoIGlzIHJlcXVpcmVkIGJ5IHRoZSBGb2N1c2FibGVPcHRpb24gaW50ZXJmYWNlLiAqL1xuICBnZXRMYWJlbCgpOiBzdHJpbmcge1xuICAgIC8vIFRPRE8gY2xvbmluZyB0aGUgdHJlZSBtYXkgYmUgZXhwZW5zaXZlOyBpbXBsZW1lbnQgYSBiZXR0ZXIgbWV0aG9kXG4gICAgLy8gd2Uga25vdyB0aGF0IHRoZSBjdXJyZW50IG5vZGUgaXMgYW4gZWxlbWVudCB0eXBlXG4gICAgY29uc3QgY2xvbmUgPSB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQuY2xvbmVOb2RlKHRydWUpIGFzIEVsZW1lbnQ7XG4gICAgcmVtb3ZlSWNvbnMoY2xvbmUpO1xuXG4gICAgcmV0dXJuIGNsb25lLnRleHRDb250ZW50Py50cmltKCkgfHwgJyc7XG4gIH1cblxuICAvLyBJbiBJdnkgdGhlIGBob3N0YCBtZXRhZGF0YSB3aWxsIGJlIG1lcmdlZCwgd2hlcmVhcyBpbiBWaWV3RW5naW5lIGl0IGlzIG92ZXJyaWRkZW4uIEluIG9yZGVyXG4gIC8vIHRvIGF2b2lkIGRvdWJsZSBldmVudCBsaXN0ZW5lcnMsIHdlIG5lZWQgdG8gdXNlIGBIb3N0TGlzdGVuZXJgLiBPbmNlIEl2eSBpcyB0aGUgZGVmYXVsdCwgd2VcbiAgLy8gY2FuIG1vdmUgdGhpcyBiYWNrIGludG8gYGhvc3RgLlxuICAvLyB0c2xpbnQ6ZGlzYWJsZTpuby1ob3N0LWRlY29yYXRvci1pbi1jb25jcmV0ZVxuICBASG9zdExpc3RlbmVyKCdrZXlkb3duJywgWyckZXZlbnQnXSlcbiAgLyoqXG4gICAqIEhhbmRsZXMga2V5Ym9hcmQgZXZlbnRzIGZvciB0aGUgbWVudSBpdGVtLCBzcGVjaWZpY2FsbHkgZWl0aGVyIHRyaWdnZXJpbmcgdGhlIHVzZXIgZGVmaW5lZFxuICAgKiBjYWxsYmFjayBvciBvcGVuaW5nL2Nsb3NpbmcgdGhlIGN1cnJlbnQgbWVudSBiYXNlZCBvbiB3aGV0aGVyIHRoZSBsZWZ0IG9yIHJpZ2h0IGFycm93IGtleSB3YXNcbiAgICogcHJlc3NlZC5cbiAgICogQHBhcmFtIGV2ZW50IHRoZSBrZXlib2FyZCBldmVudCB0byBoYW5kbGVcbiAgICovXG4gIF9vbktleWRvd24oZXZlbnQ6IEtleWJvYXJkRXZlbnQpIHtcbiAgICBzd2l0Y2ggKGV2ZW50LmtleUNvZGUpIHtcbiAgICAgIGNhc2UgU1BBQ0U6XG4gICAgICBjYXNlIEVOVEVSOlxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB0aGlzLnRyaWdnZXIoKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgUklHSFRfQVJST1c6XG4gICAgICAgIGlmICh0aGlzLl9pc1BhcmVudFZlcnRpY2FsKCkgJiYgIXRoaXMuaGFzTWVudSgpKSB7XG4gICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICB0aGlzLl9kaXI/LnZhbHVlID09PSAncnRsJ1xuICAgICAgICAgICAgPyB0aGlzLl9nZXRNZW51U3RhY2soKS5jbG9zZSh0aGlzLl9wYXJlbnRNZW51LCBGb2N1c05leHQucHJldmlvdXNJdGVtKVxuICAgICAgICAgICAgOiB0aGlzLl9nZXRNZW51U3RhY2soKS5jbG9zZUFsbChGb2N1c05leHQubmV4dEl0ZW0pO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIExFRlRfQVJST1c6XG4gICAgICAgIGlmICh0aGlzLl9pc1BhcmVudFZlcnRpY2FsKCkgJiYgIXRoaXMuaGFzTWVudSgpKSB7XG4gICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICB0aGlzLl9kaXI/LnZhbHVlID09PSAncnRsJ1xuICAgICAgICAgICAgPyB0aGlzLl9nZXRNZW51U3RhY2soKS5jbG9zZUFsbChGb2N1c05leHQubmV4dEl0ZW0pXG4gICAgICAgICAgICA6IHRoaXMuX2dldE1lbnVTdGFjaygpLmNsb3NlKHRoaXMuX3BhcmVudE1lbnUsIEZvY3VzTmV4dC5wcmV2aW91c0l0ZW0pO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTdWJzY3JpYmUgdG8gdGhlIG1vdXNlZW50ZXIgZXZlbnRzIGFuZCBjbG9zZSBhbnkgc2libGluZyBtZW51IGl0ZW1zIGlmIHRoaXMgZWxlbWVudCBpcyBtb3VzZWRcbiAgICogaW50by5cbiAgICovXG4gIHByaXZhdGUgX3NldHVwTW91c2VFbnRlcigpIHtcbiAgICB0aGlzLl9uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT5cbiAgICAgIGZyb21FdmVudCh0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQsICdtb3VzZWVudGVyJylcbiAgICAgICAgLnBpcGUoXG4gICAgICAgICAgZmlsdGVyKCgpID0+ICF0aGlzLl9nZXRNZW51U3RhY2soKS5pc0VtcHR5KCkgJiYgIXRoaXMuaGFzTWVudSgpKSxcbiAgICAgICAgICB0YWtlVW50aWwodGhpcy5fZGVzdHJveWVkKVxuICAgICAgICApXG4gICAgICAgIC5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgICAgIHRoaXMuX25nWm9uZS5ydW4oKCkgPT4gdGhpcy5fZ2V0TWVudVN0YWNrKCkuY2xvc2VTdWJNZW51T2YodGhpcy5fcGFyZW50TWVudSkpO1xuICAgICAgICB9KVxuICAgICk7XG4gIH1cblxuICAvKiogUmV0dXJuIHRydWUgaWYgdGhlIGVuY2xvc2luZyBwYXJlbnQgbWVudSBpcyBjb25maWd1cmVkIGluIGEgaG9yaXpvbnRhbCBvcmllbnRhdGlvbi4gKi9cbiAgcHJpdmF0ZSBfaXNQYXJlbnRWZXJ0aWNhbCgpIHtcbiAgICByZXR1cm4gdGhpcy5fcGFyZW50TWVudS5vcmllbnRhdGlvbiA9PT0gJ3ZlcnRpY2FsJztcbiAgfVxuXG4gIC8qKiBHZXQgdGhlIE1lbnVTdGFjayBmcm9tIHRoZSBwYXJlbnQgbWVudS4gKi9cbiAgcHJpdmF0ZSBfZ2V0TWVudVN0YWNrKCkge1xuICAgIC8vIFdlIHVzZSBhIGZ1bmN0aW9uIHNpbmNlIGF0IHRoZSBjb25zdHJ1Y3Rpb24gb2YgdGhlIE1lbnVJdGVtVHJpZ2dlciB0aGUgcGFyZW50IE1lbnUgd29uJ3QgaGF2ZVxuICAgIC8vIGl0cyBtZW51IHN0YWNrIHNldC4gVGhlcmVmb3JlIHdlIG5lZWQgdG8gcmVmZXJlbmNlIHRoZSBtZW51IHN0YWNrIGZyb20gdGhlIHBhcmVudCBlYWNoIHRpbWVcbiAgICAvLyB3ZSB3YW50IHRvIHVzZSBpdC5cbiAgICByZXR1cm4gdGhpcy5fcGFyZW50TWVudS5fbWVudVN0YWNrO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgdGhpcy5fZGVzdHJveWVkLm5leHQoKTtcbiAgfVxuXG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9kaXNhYmxlZDogQm9vbGVhbklucHV0O1xufVxuIl19