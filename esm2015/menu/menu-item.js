/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, Input, Optional, Self, ElementRef, Output, EventEmitter, Inject, HostListener, } from '@angular/core';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { SPACE, ENTER, RIGHT_ARROW, LEFT_ARROW } from '@angular/cdk/keycodes';
import { Directionality } from '@angular/cdk/bidi';
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
    constructor(_elementRef, _parentMenu, _dir, 
    /** Reference to the CdkMenuItemTrigger directive if one is added to the same element */
    // `CdkMenuItem` is commonly used in combination with a `CdkMenuItemTrigger`.
    // tslint:disable-next-line: lightweight-tokens
    _menuTrigger) {
        this._elementRef = _elementRef;
        this._parentMenu = _parentMenu;
        this._dir = _dir;
        this._menuTrigger = _menuTrigger;
        this._disabled = false;
        /**
         * If this MenuItem is a regular MenuItem, outputs when it is triggered by a keyboard or mouse
         * event.
         */
        this.triggered = new EventEmitter();
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
}
CdkMenuItem.decorators = [
    { type: Directive, args: [{
                selector: '[cdkMenuItem]',
                exportAs: 'cdkMenuItem',
                host: {
                    'tabindex': '-1',
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
    { type: Directionality, decorators: [{ type: Optional }] },
    { type: CdkMenuItemTrigger, decorators: [{ type: Self }, { type: Optional }] }
];
CdkMenuItem.propDecorators = {
    disabled: [{ type: Input }],
    triggered: [{ type: Output, args: ['cdkMenuItemTriggered',] }],
    _onKeydown: [{ type: HostListener, args: ['keydown', ['$event'],] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1pdGVtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvbWVudS9tZW51LWl0ZW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUNMLFNBQVMsRUFDVCxLQUFLLEVBQ0wsUUFBUSxFQUNSLElBQUksRUFDSixVQUFVLEVBQ1YsTUFBTSxFQUNOLFlBQVksRUFDWixNQUFNLEVBQ04sWUFBWSxHQUNiLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBQyxxQkFBcUIsRUFBZSxNQUFNLHVCQUF1QixDQUFDO0FBRTFFLE9BQU8sRUFBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUM1RSxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDakQsT0FBTyxFQUFDLGtCQUFrQixFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDdkQsT0FBTyxFQUFPLFFBQVEsRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBR2hELG1GQUFtRjtBQUNuRix1REFBdUQ7QUFDdkQsU0FBUyxXQUFXLENBQUMsT0FBZ0I7O0lBQ25DLEtBQUssTUFBTSxJQUFJLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsMkJBQTJCLENBQUMsQ0FBQyxFQUFFO1FBQ3BGLE1BQUEsSUFBSSxDQUFDLFVBQVUsMENBQUUsV0FBVyxDQUFDLElBQUksRUFBRTtLQUNwQztBQUNILENBQUM7QUFFRDs7OztHQUlHO0FBWUgsTUFBTSxPQUFPLFdBQVc7SUFpQnRCLFlBQ21CLFdBQW9DLEVBQ2xCLFdBQWlCLEVBQ3ZCLElBQXFCO0lBQ2xELHdGQUF3RjtJQUN4Riw2RUFBNkU7SUFDN0UsK0NBQStDO0lBQ1YsWUFBaUM7UUFOckQsZ0JBQVcsR0FBWCxXQUFXLENBQXlCO1FBQ2xC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b0JBQ3ZCLE9BQUEsSUFBSSxDQUFDLElBQUksMENBQUUsS0FBSyxNQUFLLEtBQUs7d0JBQ3hCLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUMsUUFBUSxrQkFBb0I7d0JBQ25ELENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxXQUFXLHVCQUF5QixDQUFDO2lCQUMxRTtnQkFDRCxNQUFNO1NBQ1Q7SUFDSCxDQUFDO0lBRUQsMEZBQTBGO0lBQ2xGLGlCQUFpQjtRQUN2QixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsV0FBVyxLQUFLLFVBQVUsQ0FBQztJQUNyRCxDQUFDO0lBRUQsOENBQThDO0lBQ3RDLGFBQWE7UUFDbkIsZ0dBQWdHO1FBQ2hHLDhGQUE4RjtRQUM5RixxQkFBcUI7UUFDckIsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQztJQUNyQyxDQUFDOzs7WUF6SUYsU0FBUyxTQUFDO2dCQUNULFFBQVEsRUFBRSxlQUFlO2dCQUN6QixRQUFRLEVBQUUsYUFBYTtnQkFDdkIsSUFBSSxFQUFFO29CQUNKLFVBQVUsRUFBRSxJQUFJO29CQUNoQixNQUFNLEVBQUUsUUFBUTtvQkFDaEIsTUFBTSxFQUFFLFVBQVU7b0JBQ2xCLE9BQU8sRUFBRSxlQUFlO29CQUN4QixzQkFBc0IsRUFBRSxrQkFBa0I7aUJBQzNDO2FBQ0Y7OztZQXJDQyxVQUFVOzRDQXlEUCxNQUFNLFNBQUMsUUFBUTtZQWhEWixjQUFjLHVCQWlEakIsUUFBUTtZQWhETCxrQkFBa0IsdUJBb0RyQixJQUFJLFlBQUksUUFBUTs7O3VCQXRCbEIsS0FBSzt3QkFhTCxNQUFNLFNBQUMsc0JBQXNCO3lCQWlFN0IsWUFBWSxTQUFDLFNBQVMsRUFBRSxDQUFDLFFBQVEsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1xuICBEaXJlY3RpdmUsXG4gIElucHV0LFxuICBPcHRpb25hbCxcbiAgU2VsZixcbiAgRWxlbWVudFJlZixcbiAgT3V0cHV0LFxuICBFdmVudEVtaXR0ZXIsXG4gIEluamVjdCxcbiAgSG9zdExpc3RlbmVyLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7Y29lcmNlQm9vbGVhblByb3BlcnR5LCBCb29sZWFuSW5wdXR9IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2VyY2lvbic7XG5pbXBvcnQge0ZvY3VzYWJsZU9wdGlvbn0gZnJvbSAnQGFuZ3VsYXIvY2RrL2ExMXknO1xuaW1wb3J0IHtTUEFDRSwgRU5URVIsIFJJR0hUX0FSUk9XLCBMRUZUX0FSUk9XfSBmcm9tICdAYW5ndWxhci9jZGsva2V5Y29kZXMnO1xuaW1wb3J0IHtEaXJlY3Rpb25hbGl0eX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2JpZGknO1xuaW1wb3J0IHtDZGtNZW51SXRlbVRyaWdnZXJ9IGZyb20gJy4vbWVudS1pdGVtLXRyaWdnZXInO1xuaW1wb3J0IHtNZW51LCBDREtfTUVOVX0gZnJvbSAnLi9tZW51LWludGVyZmFjZSc7XG5pbXBvcnQge0ZvY3VzTmV4dH0gZnJvbSAnLi9tZW51LXN0YWNrJztcblxuLy8gVE9ETyByZWZhY3RvciB0aGlzIHRvIGJlIGNvbmZpZ3VyYWJsZSBhbGxvd2luZyBmb3IgY3VzdG9tIGVsZW1lbnRzIHRvIGJlIHJlbW92ZWRcbi8qKiBSZW1vdmVzIGFsbCBpY29ucyBmcm9tIHdpdGhpbiB0aGUgZ2l2ZW4gZWxlbWVudC4gKi9cbmZ1bmN0aW9uIHJlbW92ZUljb25zKGVsZW1lbnQ6IEVsZW1lbnQpIHtcbiAgZm9yIChjb25zdCBpY29uIG9mIEFycmF5LmZyb20oZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKCdtYXQtaWNvbiwgLm1hdGVyaWFsLWljb25zJykpKSB7XG4gICAgaWNvbi5wYXJlbnROb2RlPy5yZW1vdmVDaGlsZChpY29uKTtcbiAgfVxufVxuXG4vKipcbiAqIERpcmVjdGl2ZSB3aGljaCBwcm92aWRlcyB0aGUgYWJpbGl0eSBmb3IgYW4gZWxlbWVudCB0byBiZSBmb2N1c2VkIGFuZCBuYXZpZ2F0ZWQgdG8gdXNpbmcgdGhlXG4gKiBrZXlib2FyZCB3aGVuIHJlc2lkaW5nIGluIGEgQ2RrTWVudSwgQ2RrTWVudUJhciwgb3IgQ2RrTWVudUdyb3VwLiBJdCBwZXJmb3JtcyB1c2VyIGRlZmluZWRcbiAqIGJlaGF2aW9yIHdoZW4gY2xpY2tlZC5cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW2Nka01lbnVJdGVtXScsXG4gIGV4cG9ydEFzOiAnY2RrTWVudUl0ZW0nLFxuICBob3N0OiB7XG4gICAgJ3RhYmluZGV4JzogJy0xJyxcbiAgICAndHlwZSc6ICdidXR0b24nLFxuICAgICdyb2xlJzogJ21lbnVpdGVtJyxcbiAgICAnY2xhc3MnOiAnY2RrLW1lbnUtaXRlbScsXG4gICAgJ1thdHRyLmFyaWEtZGlzYWJsZWRdJzogJ2Rpc2FibGVkIHx8IG51bGwnLFxuICB9LFxufSlcbmV4cG9ydCBjbGFzcyBDZGtNZW51SXRlbSBpbXBsZW1lbnRzIEZvY3VzYWJsZU9wdGlvbiB7XG4gIC8qKiAgV2hldGhlciB0aGUgQ2RrTWVudUl0ZW0gaXMgZGlzYWJsZWQgLSBkZWZhdWx0cyB0byBmYWxzZSAqL1xuICBASW5wdXQoKVxuICBnZXQgZGlzYWJsZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2Rpc2FibGVkO1xuICB9XG4gIHNldCBkaXNhYmxlZCh2YWx1ZTogYm9vbGVhbikge1xuICAgIHRoaXMuX2Rpc2FibGVkID0gY29lcmNlQm9vbGVhblByb3BlcnR5KHZhbHVlKTtcbiAgfVxuICBwcml2YXRlIF9kaXNhYmxlZCA9IGZhbHNlO1xuXG4gIC8qKlxuICAgKiBJZiB0aGlzIE1lbnVJdGVtIGlzIGEgcmVndWxhciBNZW51SXRlbSwgb3V0cHV0cyB3aGVuIGl0IGlzIHRyaWdnZXJlZCBieSBhIGtleWJvYXJkIG9yIG1vdXNlXG4gICAqIGV2ZW50LlxuICAgKi9cbiAgQE91dHB1dCgnY2RrTWVudUl0ZW1UcmlnZ2VyZWQnKSB0cmlnZ2VyZWQ6IEV2ZW50RW1pdHRlcjx2b2lkPiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIHJlYWRvbmx5IF9lbGVtZW50UmVmOiBFbGVtZW50UmVmPEhUTUxFbGVtZW50PixcbiAgICBASW5qZWN0KENES19NRU5VKSBwcml2YXRlIHJlYWRvbmx5IF9wYXJlbnRNZW51OiBNZW51LFxuICAgIEBPcHRpb25hbCgpIHByaXZhdGUgcmVhZG9ubHkgX2Rpcj86IERpcmVjdGlvbmFsaXR5LFxuICAgIC8qKiBSZWZlcmVuY2UgdG8gdGhlIENka01lbnVJdGVtVHJpZ2dlciBkaXJlY3RpdmUgaWYgb25lIGlzIGFkZGVkIHRvIHRoZSBzYW1lIGVsZW1lbnQgKi9cbiAgICAvLyBgQ2RrTWVudUl0ZW1gIGlzIGNvbW1vbmx5IHVzZWQgaW4gY29tYmluYXRpb24gd2l0aCBhIGBDZGtNZW51SXRlbVRyaWdnZXJgLlxuICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTogbGlnaHR3ZWlnaHQtdG9rZW5zXG4gICAgQFNlbGYoKSBAT3B0aW9uYWwoKSBwcml2YXRlIHJlYWRvbmx5IF9tZW51VHJpZ2dlcj86IENka01lbnVJdGVtVHJpZ2dlclxuICApIHt9XG5cbiAgLyoqIFBsYWNlIGZvY3VzIG9uIHRoZSBlbGVtZW50LiAqL1xuICBmb2N1cygpIHtcbiAgICB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQuZm9jdXMoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJZiB0aGUgbWVudSBpdGVtIGlzIG5vdCBkaXNhYmxlZCBhbmQgdGhlIGVsZW1lbnQgZG9lcyBub3QgaGF2ZSBhIG1lbnUgdHJpZ2dlciBhdHRhY2hlZCwgZW1pdFxuICAgKiBvbiB0aGUgY2RrTWVudUl0ZW1UcmlnZ2VyZWQgZW1pdHRlciBhbmQgY2xvc2UgYWxsIG9wZW4gbWVudXMuXG4gICAqL1xuICB0cmlnZ2VyKCkge1xuICAgIGlmICghdGhpcy5kaXNhYmxlZCAmJiAhdGhpcy5oYXNNZW51KCkpIHtcbiAgICAgIHRoaXMudHJpZ2dlcmVkLm5leHQoKTtcbiAgICAgIHRoaXMuX2dldE1lbnVTdGFjaygpLmNsb3NlQWxsKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhlIG1lbnUgaXRlbSBvcGVucyBhIG1lbnUuICovXG4gIGhhc01lbnUoKSB7XG4gICAgcmV0dXJuICEhdGhpcy5fbWVudVRyaWdnZXI/Lmhhc01lbnUoKTtcbiAgfVxuXG4gIC8qKiBSZXR1cm4gdHJ1ZSBpZiB0aGlzIE1lbnVJdGVtIGhhcyBhbiBhdHRhY2hlZCBtZW51IGFuZCBpdCBpcyBvcGVuLiAqL1xuICBpc01lbnVPcGVuKCkge1xuICAgIHJldHVybiAhIXRoaXMuX21lbnVUcmlnZ2VyPy5pc01lbnVPcGVuKCk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGEgcmVmZXJlbmNlIHRvIHRoZSByZW5kZXJlZCBNZW51IGlmIHRoZSBNZW51IGlzIG9wZW4gYW5kIGl0IGlzIHZpc2libGUgaW4gdGhlIERPTS5cbiAgICogQHJldHVybiB0aGUgbWVudSBpZiBpdCBpcyBvcGVuLCBvdGhlcndpc2UgdW5kZWZpbmVkLlxuICAgKi9cbiAgZ2V0TWVudSgpOiBNZW51IHwgdW5kZWZpbmVkIHtcbiAgICByZXR1cm4gdGhpcy5fbWVudVRyaWdnZXI/LmdldE1lbnUoKTtcbiAgfVxuXG4gIC8qKiBHZXQgdGhlIE1lbnVJdGVtVHJpZ2dlciBhc3NvY2lhdGVkIHdpdGggdGhpcyBlbGVtZW50LiAqL1xuICBnZXRNZW51VHJpZ2dlcigpOiBDZGtNZW51SXRlbVRyaWdnZXIgfCB1bmRlZmluZWQge1xuICAgIHJldHVybiB0aGlzLl9tZW51VHJpZ2dlcjtcbiAgfVxuXG4gIC8qKiBHZXQgdGhlIGxhYmVsIGZvciB0aGlzIGVsZW1lbnQgd2hpY2ggaXMgcmVxdWlyZWQgYnkgdGhlIEZvY3VzYWJsZU9wdGlvbiBpbnRlcmZhY2UuICovXG4gIGdldExhYmVsKCk6IHN0cmluZyB7XG4gICAgLy8gVE9ETyBjbG9uaW5nIHRoZSB0cmVlIG1heSBiZSBleHBlbnNpdmU7IGltcGxlbWVudCBhIGJldHRlciBtZXRob2RcbiAgICAvLyB3ZSBrbm93IHRoYXQgdGhlIGN1cnJlbnQgbm9kZSBpcyBhbiBlbGVtZW50IHR5cGVcbiAgICBjb25zdCBjbG9uZSA9IHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5jbG9uZU5vZGUodHJ1ZSkgYXMgRWxlbWVudDtcbiAgICByZW1vdmVJY29ucyhjbG9uZSk7XG5cbiAgICByZXR1cm4gY2xvbmUudGV4dENvbnRlbnQ/LnRyaW0oKSB8fCAnJztcbiAgfVxuXG4gIC8vIEluIEl2eSB0aGUgYGhvc3RgIG1ldGFkYXRhIHdpbGwgYmUgbWVyZ2VkLCB3aGVyZWFzIGluIFZpZXdFbmdpbmUgaXQgaXMgb3ZlcnJpZGRlbi4gSW4gb3JkZXJcbiAgLy8gdG8gYXZvaWQgZG91YmxlIGV2ZW50IGxpc3RlbmVycywgd2UgbmVlZCB0byB1c2UgYEhvc3RMaXN0ZW5lcmAuIE9uY2UgSXZ5IGlzIHRoZSBkZWZhdWx0LCB3ZVxuICAvLyBjYW4gbW92ZSB0aGlzIGJhY2sgaW50byBgaG9zdGAuXG4gIC8vIHRzbGludDpkaXNhYmxlOm5vLWhvc3QtZGVjb3JhdG9yLWluLWNvbmNyZXRlXG4gIEBIb3N0TGlzdGVuZXIoJ2tleWRvd24nLCBbJyRldmVudCddKVxuICAvKipcbiAgICogSGFuZGxlcyBrZXlib2FyZCBldmVudHMgZm9yIHRoZSBtZW51IGl0ZW0sIHNwZWNpZmljYWxseSBlaXRoZXIgdHJpZ2dlcmluZyB0aGUgdXNlciBkZWZpbmVkXG4gICAqIGNhbGxiYWNrIG9yIG9wZW5pbmcvY2xvc2luZyB0aGUgY3VycmVudCBtZW51IGJhc2VkIG9uIHdoZXRoZXIgdGhlIGxlZnQgb3IgcmlnaHQgYXJyb3cga2V5IHdhc1xuICAgKiBwcmVzc2VkLlxuICAgKiBAcGFyYW0gZXZlbnQgdGhlIGtleWJvYXJkIGV2ZW50IHRvIGhhbmRsZVxuICAgKi9cbiAgX29uS2V5ZG93bihldmVudDogS2V5Ym9hcmRFdmVudCkge1xuICAgIHN3aXRjaCAoZXZlbnQua2V5Q29kZSkge1xuICAgICAgY2FzZSBTUEFDRTpcbiAgICAgIGNhc2UgRU5URVI6XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHRoaXMudHJpZ2dlcigpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBSSUdIVF9BUlJPVzpcbiAgICAgICAgaWYgKHRoaXMuX2lzUGFyZW50VmVydGljYWwoKSAmJiAhdGhpcy5oYXNNZW51KCkpIHtcbiAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgIHRoaXMuX2Rpcj8udmFsdWUgPT09ICdydGwnXG4gICAgICAgICAgICA/IHRoaXMuX2dldE1lbnVTdGFjaygpLmNsb3NlKHRoaXMuX3BhcmVudE1lbnUsIEZvY3VzTmV4dC5wcmV2aW91c0l0ZW0pXG4gICAgICAgICAgICA6IHRoaXMuX2dldE1lbnVTdGFjaygpLmNsb3NlQWxsKEZvY3VzTmV4dC5uZXh0SXRlbSk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgTEVGVF9BUlJPVzpcbiAgICAgICAgaWYgKHRoaXMuX2lzUGFyZW50VmVydGljYWwoKSAmJiAhdGhpcy5oYXNNZW51KCkpIHtcbiAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgIHRoaXMuX2Rpcj8udmFsdWUgPT09ICdydGwnXG4gICAgICAgICAgICA/IHRoaXMuX2dldE1lbnVTdGFjaygpLmNsb3NlQWxsKEZvY3VzTmV4dC5uZXh0SXRlbSlcbiAgICAgICAgICAgIDogdGhpcy5fZ2V0TWVudVN0YWNrKCkuY2xvc2UodGhpcy5fcGFyZW50TWVudSwgRm9jdXNOZXh0LnByZXZpb3VzSXRlbSk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgLyoqIFJldHVybiB0cnVlIGlmIHRoZSBlbmNsb3NpbmcgcGFyZW50IG1lbnUgaXMgY29uZmlndXJlZCBpbiBhIGhvcml6b250YWwgb3JpZW50YXRpb24uICovXG4gIHByaXZhdGUgX2lzUGFyZW50VmVydGljYWwoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3BhcmVudE1lbnUub3JpZW50YXRpb24gPT09ICd2ZXJ0aWNhbCc7XG4gIH1cblxuICAvKiogR2V0IHRoZSBNZW51U3RhY2sgZnJvbSB0aGUgcGFyZW50IG1lbnUuICovXG4gIHByaXZhdGUgX2dldE1lbnVTdGFjaygpIHtcbiAgICAvLyBXZSB1c2UgYSBmdW5jdGlvbiBzaW5jZSBhdCB0aGUgY29uc3RydWN0aW9uIG9mIHRoZSBNZW51SXRlbVRyaWdnZXIgdGhlIHBhcmVudCBNZW51IHdvbid0IGhhdmVcbiAgICAvLyBpdHMgbWVudSBzdGFjayBzZXQuIFRoZXJlZm9yZSB3ZSBuZWVkIHRvIHJlZmVyZW5jZSB0aGUgbWVudSBzdGFjayBmcm9tIHRoZSBwYXJlbnQgZWFjaCB0aW1lXG4gICAgLy8gd2Ugd2FudCB0byB1c2UgaXQuXG4gICAgcmV0dXJuIHRoaXMuX3BhcmVudE1lbnUuX21lbnVTdGFjaztcbiAgfVxuXG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9kaXNhYmxlZDogQm9vbGVhbklucHV0O1xufVxuIl19