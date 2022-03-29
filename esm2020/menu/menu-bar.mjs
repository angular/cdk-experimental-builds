/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, ElementRef, Inject, NgZone, Optional, Self, } from '@angular/core';
import { Directionality } from '@angular/cdk/bidi';
import { DOWN_ARROW, ESCAPE, LEFT_ARROW, RIGHT_ARROW, TAB, UP_ARROW } from '@angular/cdk/keycodes';
import { takeUntil } from 'rxjs/operators';
import { CdkMenuGroup } from './menu-group';
import { CDK_MENU } from './menu-interface';
import { MENU_STACK, MenuStack } from './menu-stack';
import { PointerFocusTracker } from './pointer-focus-tracker';
import { MENU_AIM } from './menu-aim';
import { CdkMenuBase } from './menu-base';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/bidi";
import * as i2 from "./menu-stack";
/**
 * Directive applied to an element which configures it as a MenuBar by setting the appropriate
 * role, aria attributes, and accessible keyboard and mouse handling logic. The component that
 * this directive is applied to should contain components marked with CdkMenuItem.
 *
 */
export class CdkMenuBar extends CdkMenuBase {
    constructor(_ngZone, elementRef, menuStack, _menuAim, dir) {
        super(elementRef, menuStack, dir);
        this._ngZone = _ngZone;
        this._menuAim = _menuAim;
        this.orientation = 'horizontal';
    }
    ngAfterContentInit() {
        super.ngAfterContentInit();
        this._subscribeToMenuStackEmptied();
        this._subscribeToMouseManager();
        this._menuAim?.initialize(this, this.pointerTracker);
    }
    ngOnDestroy() {
        super.ngOnDestroy();
        this.pointerTracker?.destroy();
    }
    /**
     * Handle keyboard events, specifically changing the focused element and/or toggling the active
     * items menu.
     * @param event the KeyboardEvent to handle.
     */
    _handleKeyEvent(event) {
        const keyManager = this.keyManager;
        switch (event.keyCode) {
            case UP_ARROW:
            case DOWN_ARROW:
            case LEFT_ARROW:
            case RIGHT_ARROW:
                const horizontalArrows = event.keyCode === LEFT_ARROW || event.keyCode === RIGHT_ARROW;
                // For a horizontal menu if the left/right keys were clicked, or a vertical menu if the
                // up/down keys were clicked: if the current menu is open, close it then focus and open the
                // next  menu.
                if ((this.isHorizontal() && horizontalArrows) ||
                    (!this.isHorizontal() && !horizontalArrows)) {
                    event.preventDefault();
                    const prevIsOpen = keyManager.activeItem?.isMenuOpen();
                    keyManager.activeItem?.getMenuTrigger()?.closeMenu();
                    keyManager.setFocusOrigin('keyboard');
                    keyManager.onKeydown(event);
                    if (prevIsOpen) {
                        keyManager.activeItem?.getMenuTrigger()?.openMenu();
                    }
                }
                break;
            case ESCAPE:
                event.preventDefault();
                keyManager.activeItem?.getMenuTrigger()?.closeMenu();
                break;
            case TAB:
                keyManager.activeItem?.getMenuTrigger()?.closeMenu();
                break;
            default:
                keyManager.onKeydown(event);
        }
    }
    /**
     * Set the PointerFocusTracker and ensure that when mouse focus changes the key manager is updated
     * with the latest menu item under mouse focus.
     */
    _subscribeToMouseManager() {
        this._ngZone.runOutsideAngular(() => {
            this.pointerTracker = new PointerFocusTracker(this.items);
            this.pointerTracker.entered.pipe(takeUntil(this.destroyed)).subscribe(item => {
                if (this.hasOpenSubmenu()) {
                    this.keyManager.setActiveItem(item);
                }
            });
        });
    }
    /**
     * Set focus to either the current, previous or next item based on the FocusNext event, then
     * open the previous or next item.
     */
    _toggleOpenMenu(event) {
        const keyManager = this.keyManager;
        switch (event) {
            case 0 /* nextItem */:
                keyManager.setFocusOrigin('keyboard');
                keyManager.setNextItemActive();
                keyManager.activeItem?.getMenuTrigger()?.openMenu();
                break;
            case 1 /* previousItem */:
                keyManager.setFocusOrigin('keyboard');
                keyManager.setPreviousItemActive();
                keyManager.activeItem?.getMenuTrigger()?.openMenu();
                break;
            case 2 /* currentItem */:
                if (keyManager.activeItem) {
                    keyManager.setFocusOrigin('keyboard');
                    keyManager.setActiveItem(keyManager.activeItem);
                }
                break;
        }
    }
    _subscribeToMenuStackEmptied() {
        this.menuStack?.emptied
            .pipe(takeUntil(this.destroyed))
            .subscribe(event => this._toggleOpenMenu(event));
    }
}
CdkMenuBar.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.0.0-next.9", ngImport: i0, type: CdkMenuBar, deps: [{ token: i0.NgZone }, { token: i0.ElementRef }, { token: MENU_STACK }, { token: MENU_AIM, optional: true, self: true }, { token: i1.Directionality, optional: true }], target: i0.ɵɵFactoryTarget.Directive });
CdkMenuBar.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "14.0.0-next.9", type: CdkMenuBar, selector: "[cdkMenuBar]", host: { attributes: { "role": "menubar", "tabindex": "0" }, listeners: { "keydown": "_handleKeyEvent($event)" }, classAttribute: "cdk-menu-bar" }, providers: [
        { provide: CdkMenuGroup, useExisting: CdkMenuBar },
        { provide: CDK_MENU, useExisting: CdkMenuBar },
        { provide: MENU_STACK, useClass: MenuStack },
    ], exportAs: ["cdkMenuBar"], usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.0.0-next.9", ngImport: i0, type: CdkMenuBar, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkMenuBar]',
                    exportAs: 'cdkMenuBar',
                    host: {
                        'role': 'menubar',
                        'class': 'cdk-menu-bar',
                        'tabindex': '0',
                        '(keydown)': '_handleKeyEvent($event)',
                    },
                    providers: [
                        { provide: CdkMenuGroup, useExisting: CdkMenuBar },
                        { provide: CDK_MENU, useExisting: CdkMenuBar },
                        { provide: MENU_STACK, useClass: MenuStack },
                    ],
                }]
        }], ctorParameters: function () { return [{ type: i0.NgZone }, { type: i0.ElementRef }, { type: i2.MenuStack, decorators: [{
                    type: Inject,
                    args: [MENU_STACK]
                }] }, { type: undefined, decorators: [{
                    type: Self
                }, {
                    type: Optional
                }, {
                    type: Inject,
                    args: [MENU_AIM]
                }] }, { type: i1.Directionality, decorators: [{
                    type: Optional
                }] }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1iYXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrLWV4cGVyaW1lbnRhbC9tZW51L21lbnUtYmFyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFFTCxTQUFTLEVBQ1QsVUFBVSxFQUNWLE1BQU0sRUFDTixNQUFNLEVBRU4sUUFBUSxFQUNSLElBQUksR0FDTCxNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDakQsT0FBTyxFQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDakcsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQ3pDLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFDMUMsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBQzFDLE9BQU8sRUFBWSxVQUFVLEVBQUUsU0FBUyxFQUFDLE1BQU0sY0FBYyxDQUFDO0FBQzlELE9BQU8sRUFBQyxtQkFBbUIsRUFBQyxNQUFNLHlCQUF5QixDQUFDO0FBQzVELE9BQU8sRUFBQyxRQUFRLEVBQVUsTUFBTSxZQUFZLENBQUM7QUFDN0MsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLGFBQWEsQ0FBQzs7OztBQUV4Qzs7Ozs7R0FLRztBQWdCSCxNQUFNLE9BQU8sVUFBVyxTQUFRLFdBQVc7SUFLekMsWUFDbUIsT0FBZSxFQUNoQyxVQUFtQyxFQUNmLFNBQW9CLEVBQ2UsUUFBa0IsRUFDN0QsR0FBb0I7UUFFaEMsS0FBSyxDQUFDLFVBQVUsRUFBRSxTQUFTLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFOakIsWUFBTyxHQUFQLE9BQU8sQ0FBUTtRQUd1QixhQUFRLEdBQVIsUUFBUSxD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a0JBZnRCLFNBQVM7bUJBQUM7b0JBQ1QsUUFBUSxFQUFFLGNBQWM7b0JBQ3hCLFFBQVEsRUFBRSxZQUFZO29CQUN0QixJQUFJLEVBQUU7d0JBQ0osTUFBTSxFQUFFLFNBQVM7d0JBQ2pCLE9BQU8sRUFBRSxjQUFjO3dCQUN2QixVQUFVLEVBQUUsR0FBRzt3QkFDZixXQUFXLEVBQUUseUJBQXlCO3FCQUN2QztvQkFDRCxTQUFTLEVBQUU7d0JBQ1QsRUFBQyxPQUFPLEVBQUUsWUFBWSxFQUFFLFdBQVcsWUFBWSxFQUFDO3dCQUNoRCxFQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsV0FBVyxZQUFZLEVBQUM7d0JBQzVDLEVBQUMsT0FBTyxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFDO3FCQUMzQztpQkFDRjs7MEJBU0ksTUFBTTsyQkFBQyxVQUFVOzswQkFDakIsSUFBSTs7MEJBQUksUUFBUTs7MEJBQUksTUFBTTsyQkFBQyxRQUFROzswQkFDbkMsUUFBUSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1xuICBBZnRlckNvbnRlbnRJbml0LFxuICBEaXJlY3RpdmUsXG4gIEVsZW1lbnRSZWYsXG4gIEluamVjdCxcbiAgTmdab25lLFxuICBPbkRlc3Ryb3ksXG4gIE9wdGlvbmFsLFxuICBTZWxmLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7RGlyZWN0aW9uYWxpdHl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9iaWRpJztcbmltcG9ydCB7RE9XTl9BUlJPVywgRVNDQVBFLCBMRUZUX0FSUk9XLCBSSUdIVF9BUlJPVywgVEFCLCBVUF9BUlJPV30gZnJvbSAnQGFuZ3VsYXIvY2RrL2tleWNvZGVzJztcbmltcG9ydCB7dGFrZVVudGlsfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5pbXBvcnQge0Nka01lbnVHcm91cH0gZnJvbSAnLi9tZW51LWdyb3VwJztcbmltcG9ydCB7Q0RLX01FTlV9IGZyb20gJy4vbWVudS1pbnRlcmZhY2UnO1xuaW1wb3J0IHtGb2N1c05leHQsIE1FTlVfU1RBQ0ssIE1lbnVTdGFja30gZnJvbSAnLi9tZW51LXN0YWNrJztcbmltcG9ydCB7UG9pbnRlckZvY3VzVHJhY2tlcn0gZnJvbSAnLi9wb2ludGVyLWZvY3VzLXRyYWNrZXInO1xuaW1wb3J0IHtNRU5VX0FJTSwgTWVudUFpbX0gZnJvbSAnLi9tZW51LWFpbSc7XG5pbXBvcnQge0Nka01lbnVCYXNlfSBmcm9tICcuL21lbnUtYmFzZSc7XG5cbi8qKlxuICogRGlyZWN0aXZlIGFwcGxpZWQgdG8gYW4gZWxlbWVudCB3aGljaCBjb25maWd1cmVzIGl0IGFzIGEgTWVudUJhciBieSBzZXR0aW5nIHRoZSBhcHByb3ByaWF0ZVxuICogcm9sZSwgYXJpYSBhdHRyaWJ1dGVzLCBhbmQgYWNjZXNzaWJsZSBrZXlib2FyZCBhbmQgbW91c2UgaGFuZGxpbmcgbG9naWMuIFRoZSBjb21wb25lbnQgdGhhdFxuICogdGhpcyBkaXJlY3RpdmUgaXMgYXBwbGllZCB0byBzaG91bGQgY29udGFpbiBjb21wb25lbnRzIG1hcmtlZCB3aXRoIENka01lbnVJdGVtLlxuICpcbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW2Nka01lbnVCYXJdJyxcbiAgZXhwb3J0QXM6ICdjZGtNZW51QmFyJyxcbiAgaG9zdDoge1xuICAgICdyb2xlJzogJ21lbnViYXInLFxuICAgICdjbGFzcyc6ICdjZGstbWVudS1iYXInLFxuICAgICd0YWJpbmRleCc6ICcwJyxcbiAgICAnKGtleWRvd24pJzogJ19oYW5kbGVLZXlFdmVudCgkZXZlbnQpJyxcbiAgfSxcbiAgcHJvdmlkZXJzOiBbXG4gICAge3Byb3ZpZGU6IENka01lbnVHcm91cCwgdXNlRXhpc3Rpbmc6IENka01lbnVCYXJ9LFxuICAgIHtwcm92aWRlOiBDREtfTUVOVSwgdXNlRXhpc3Rpbmc6IENka01lbnVCYXJ9LFxuICAgIHtwcm92aWRlOiBNRU5VX1NUQUNLLCB1c2VDbGFzczogTWVudVN0YWNrfSxcbiAgXSxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrTWVudUJhciBleHRlbmRzIENka01lbnVCYXNlIGltcGxlbWVudHMgQWZ0ZXJDb250ZW50SW5pdCwgT25EZXN0cm95IHtcbiAgb3ZlcnJpZGUgcmVhZG9ubHkgb3JpZW50YXRpb246ICdob3Jpem9udGFsJyB8ICd2ZXJ0aWNhbCcgPSAnaG9yaXpvbnRhbCc7XG5cbiAgb3ZlcnJpZGUgbWVudVN0YWNrOiBNZW51U3RhY2s7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSByZWFkb25seSBfbmdab25lOiBOZ1pvbmUsXG4gICAgZWxlbWVudFJlZjogRWxlbWVudFJlZjxIVE1MRWxlbWVudD4sXG4gICAgQEluamVjdChNRU5VX1NUQUNLKSBtZW51U3RhY2s6IE1lbnVTdGFjayxcbiAgICBAU2VsZigpIEBPcHRpb25hbCgpIEBJbmplY3QoTUVOVV9BSU0pIHByaXZhdGUgcmVhZG9ubHkgX21lbnVBaW0/OiBNZW51QWltLFxuICAgIEBPcHRpb25hbCgpIGRpcj86IERpcmVjdGlvbmFsaXR5LFxuICApIHtcbiAgICBzdXBlcihlbGVtZW50UmVmLCBtZW51U3RhY2ssIGRpcik7XG4gIH1cblxuICBvdmVycmlkZSBuZ0FmdGVyQ29udGVudEluaXQoKSB7XG4gICAgc3VwZXIubmdBZnRlckNvbnRlbnRJbml0KCk7XG4gICAgdGhpcy5fc3Vic2NyaWJlVG9NZW51U3RhY2tFbXB0aWVkKCk7XG4gICAgdGhpcy5fc3Vic2NyaWJlVG9Nb3VzZU1hbmFnZXIoKTtcbiAgICB0aGlzLl9tZW51QWltPy5pbml0aWFsaXplKHRoaXMsIHRoaXMucG9pbnRlclRyYWNrZXIhKTtcbiAgfVxuXG4gIG92ZXJyaWRlIG5nT25EZXN0cm95KCkge1xuICAgIHN1cGVyLm5nT25EZXN0cm95KCk7XG4gICAgdGhpcy5wb2ludGVyVHJhY2tlcj8uZGVzdHJveSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZSBrZXlib2FyZCBldmVudHMsIHNwZWNpZmljYWxseSBjaGFuZ2luZyB0aGUgZm9jdXNlZCBlbGVtZW50IGFuZC9vciB0b2dnbGluZyB0aGUgYWN0aXZlXG4gICAqIGl0ZW1zIG1lbnUuXG4gICAqIEBwYXJhbSBldmVudCB0aGUgS2V5Ym9hcmRFdmVudCB0byBoYW5kbGUuXG4gICAqL1xuICBfaGFuZGxlS2V5RXZlbnQoZXZlbnQ6IEtleWJvYXJkRXZlbnQpIHtcbiAgICBjb25zdCBrZXlNYW5hZ2VyID0gdGhpcy5rZXlNYW5hZ2VyO1xuICAgIHN3aXRjaCAoZXZlbnQua2V5Q29kZSkge1xuICAgICAgY2FzZSBVUF9BUlJPVzpcbiAgICAgIGNhc2UgRE9XTl9BUlJPVzpcbiAgICAgIGNhc2UgTEVGVF9BUlJPVzpcbiAgICAgIGNhc2UgUklHSFRfQVJST1c6XG4gICAgICAgIGNvbnN0IGhvcml6b250YWxBcnJvd3MgPSBldmVudC5rZXlDb2RlID09PSBMRUZUX0FSUk9XIHx8IGV2ZW50LmtleUNvZGUgPT09IFJJR0hUX0FSUk9XO1xuICAgICAgICAvLyBGb3IgYSBob3Jpem9udGFsIG1lbnUgaWYgdGhlIGxlZnQvcmlnaHQga2V5cyB3ZXJlIGNsaWNrZWQsIG9yIGEgdmVydGljYWwgbWVudSBpZiB0aGVcbiAgICAgICAgLy8gdXAvZG93biBrZXlzIHdlcmUgY2xpY2tlZDogaWYgdGhlIGN1cnJlbnQgbWVudSBpcyBvcGVuLCBjbG9zZSBpdCB0aGVuIGZvY3VzIGFuZCBvcGVuIHRoZVxuICAgICAgICAvLyBuZXh0ICBtZW51LlxuICAgICAgICBpZiAoXG4gICAgICAgICAgKHRoaXMuaXNIb3Jpem9udGFsKCkgJiYgaG9yaXpvbnRhbEFycm93cykgfHxcbiAgICAgICAgICAoIXRoaXMuaXNIb3Jpem9udGFsKCkgJiYgIWhvcml6b250YWxBcnJvd3MpXG4gICAgICAgICkge1xuICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgICBjb25zdCBwcmV2SXNPcGVuID0ga2V5TWFuYWdlci5hY3RpdmVJdGVtPy5pc01lbnVPcGVuKCk7XG4gICAgICAgICAga2V5TWFuYWdlci5hY3RpdmVJdGVtPy5nZXRNZW51VHJpZ2dlcigpPy5jbG9zZU1lbnUoKTtcblxuICAgICAgICAgIGtleU1hbmFnZXIuc2V0Rm9jdXNPcmlnaW4oJ2tleWJvYXJkJyk7XG4gICAgICAgICAga2V5TWFuYWdlci5vbktleWRvd24oZXZlbnQpO1xuICAgICAgICAgIGlmIChwcmV2SXNPcGVuKSB7XG4gICAgICAgICAgICBrZXlNYW5hZ2VyLmFjdGl2ZUl0ZW0/LmdldE1lbnVUcmlnZ2VyKCk/Lm9wZW5NZW51KCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIEVTQ0FQRTpcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAga2V5TWFuYWdlci5hY3RpdmVJdGVtPy5nZXRNZW51VHJpZ2dlcigpPy5jbG9zZU1lbnUoKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgVEFCOlxuICAgICAgICBrZXlNYW5hZ2VyLmFjdGl2ZUl0ZW0/LmdldE1lbnVUcmlnZ2VyKCk/LmNsb3NlTWVudSgpO1xuICAgICAgICBicmVhaztcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAga2V5TWFuYWdlci5vbktleWRvd24oZXZlbnQpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgdGhlIFBvaW50ZXJGb2N1c1RyYWNrZXIgYW5kIGVuc3VyZSB0aGF0IHdoZW4gbW91c2UgZm9jdXMgY2hhbmdlcyB0aGUga2V5IG1hbmFnZXIgaXMgdXBkYXRlZFxuICAgKiB3aXRoIHRoZSBsYXRlc3QgbWVudSBpdGVtIHVuZGVyIG1vdXNlIGZvY3VzLlxuICAgKi9cbiAgcHJpdmF0ZSBfc3Vic2NyaWJlVG9Nb3VzZU1hbmFnZXIoKSB7XG4gICAgdGhpcy5fbmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgIHRoaXMucG9pbnRlclRyYWNrZXIgPSBuZXcgUG9pbnRlckZvY3VzVHJhY2tlcih0aGlzLml0ZW1zKTtcbiAgICAgIHRoaXMucG9pbnRlclRyYWNrZXIuZW50ZXJlZC5waXBlKHRha2VVbnRpbCh0aGlzLmRlc3Ryb3llZCkpLnN1YnNjcmliZShpdGVtID0+IHtcbiAgICAgICAgaWYgKHRoaXMuaGFzT3BlblN1Ym1lbnUoKSkge1xuICAgICAgICAgIHRoaXMua2V5TWFuYWdlci5zZXRBY3RpdmVJdGVtKGl0ZW0pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgZm9jdXMgdG8gZWl0aGVyIHRoZSBjdXJyZW50LCBwcmV2aW91cyBvciBuZXh0IGl0ZW0gYmFzZWQgb24gdGhlIEZvY3VzTmV4dCBldmVudCwgdGhlblxuICAgKiBvcGVuIHRoZSBwcmV2aW91cyBvciBuZXh0IGl0ZW0uXG4gICAqL1xuICBwcml2YXRlIF90b2dnbGVPcGVuTWVudShldmVudDogRm9jdXNOZXh0IHwgdW5kZWZpbmVkKSB7XG4gICAgY29uc3Qga2V5TWFuYWdlciA9IHRoaXMua2V5TWFuYWdlcjtcbiAgICBzd2l0Y2ggKGV2ZW50KSB7XG4gICAgICBjYXNlIEZvY3VzTmV4dC5uZXh0SXRlbTpcbiAgICAgICAga2V5TWFuYWdlci5zZXRGb2N1c09yaWdpbigna2V5Ym9hcmQnKTtcbiAgICAgICAga2V5TWFuYWdlci5zZXROZXh0SXRlbUFjdGl2ZSgpO1xuICAgICAgICBrZXlNYW5hZ2VyLmFjdGl2ZUl0ZW0/LmdldE1lbnVUcmlnZ2VyKCk/Lm9wZW5NZW51KCk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIEZvY3VzTmV4dC5wcmV2aW91c0l0ZW06XG4gICAgICAgIGtleU1hbmFnZXIuc2V0Rm9jdXNPcmlnaW4oJ2tleWJvYXJkJyk7XG4gICAgICAgIGtleU1hbmFnZXIuc2V0UHJldmlvdXNJdGVtQWN0aXZlKCk7XG4gICAgICAgIGtleU1hbmFnZXIuYWN0aXZlSXRlbT8uZ2V0TWVudVRyaWdnZXIoKT8ub3Blbk1lbnUoKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgRm9jdXNOZXh0LmN1cnJlbnRJdGVtOlxuICAgICAgICBpZiAoa2V5TWFuYWdlci5hY3RpdmVJdGVtKSB7XG4gICAgICAgICAga2V5TWFuYWdlci5zZXRGb2N1c09yaWdpbigna2V5Ym9hcmQnKTtcbiAgICAgICAgICBrZXlNYW5hZ2VyLnNldEFjdGl2ZUl0ZW0oa2V5TWFuYWdlci5hY3RpdmVJdGVtKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9zdWJzY3JpYmVUb01lbnVTdGFja0VtcHRpZWQoKSB7XG4gICAgdGhpcy5tZW51U3RhY2s/LmVtcHRpZWRcbiAgICAgIC5waXBlKHRha2VVbnRpbCh0aGlzLmRlc3Ryb3llZCkpXG4gICAgICAuc3Vic2NyaWJlKGV2ZW50ID0+IHRoaXMuX3RvZ2dsZU9wZW5NZW51KGV2ZW50KSk7XG4gIH1cbn1cbiJdfQ==