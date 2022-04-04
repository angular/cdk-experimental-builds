/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, ElementRef, EventEmitter, Inject, NgZone, Optional, Output, Self, } from '@angular/core';
import { DOWN_ARROW, ESCAPE, hasModifierKey, LEFT_ARROW, RIGHT_ARROW, TAB, UP_ARROW, } from '@angular/cdk/keycodes';
import { Directionality } from '@angular/cdk/bidi';
import { takeUntil } from 'rxjs/operators';
import { CdkMenuGroup } from './menu-group';
import { CDK_MENU } from './menu-interface';
import { MENU_STACK, MenuStack, PARENT_OR_NEW_INLINE_MENU_STACK_PROVIDER, } from './menu-stack';
import { PointerFocusTracker } from './pointer-focus-tracker';
import { MENU_AIM } from './menu-aim';
import { MENU_TRIGGER, MenuTrigger } from './menu-trigger';
import { CdkMenuBase } from './menu-base';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/bidi";
import * as i2 from "./menu-stack";
import * as i3 from "./menu-trigger";
/**
 * Directive which configures the element as a Menu which should contain child elements marked as
 * CdkMenuItem or CdkMenuGroup. Sets the appropriate role and aria-attributes for a menu and
 * contains accessible keyboard and mouse handling logic.
 *
 * It also acts as a RadioGroup for elements marked with role `menuitemradio`.
 */
export class CdkMenu extends CdkMenuBase {
    constructor(_ngZone, elementRef, menuStack, _parentTrigger, _menuAim, dir) {
        super(elementRef, menuStack, dir);
        this._ngZone = _ngZone;
        this._parentTrigger = _parentTrigger;
        this._menuAim = _menuAim;
        /** Event emitted when the menu is closed. */
        this.closed = new EventEmitter();
        this._isInline = !this._parentTrigger;
        this.destroyed.subscribe(this.closed);
        if (!this._isInline) {
            this.menuStack.push(this);
        }
        this._parentTrigger?.registerChildMenu(this);
    }
    ngAfterContentInit() {
        super.ngAfterContentInit();
        this._subscribeToMenuStackEmptied();
        this._subscribeToMouseManager();
        this._menuAim?.initialize(this, this.pointerTracker);
    }
    ngOnDestroy() {
        super.ngOnDestroy();
        this.closed.complete();
        this.pointerTracker?.destroy();
    }
    /** Handle keyboard events for the Menu. */
    _handleKeyEvent(event) {
        const keyManager = this.keyManager;
        switch (event.keyCode) {
            case LEFT_ARROW:
            case RIGHT_ARROW:
                if (this.isHorizontal()) {
                    event.preventDefault();
                    keyManager.setFocusOrigin('keyboard');
                    keyManager.onKeydown(event);
                }
                break;
            case UP_ARROW:
            case DOWN_ARROW:
                if (!this.isHorizontal()) {
                    event.preventDefault();
                    keyManager.setFocusOrigin('keyboard');
                    keyManager.onKeydown(event);
                }
                break;
            case ESCAPE:
                if (!hasModifierKey(event)) {
                    event.preventDefault();
                    this.menuStack.close(this, {
                        focusNextOnEmpty: 2 /* currentItem */,
                        focusParentTrigger: true,
                    });
                }
                break;
            case TAB:
                this.menuStack.closeAll({ focusParentTrigger: true });
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
        });
    }
    /** Set focus the either the current, previous or next item based on the FocusNext event. */
    _toggleMenuFocus(event) {
        const keyManager = this.keyManager;
        switch (event) {
            case 0 /* nextItem */:
                keyManager.setFocusOrigin('keyboard');
                keyManager.setNextItemActive();
                break;
            case 1 /* previousItem */:
                keyManager.setFocusOrigin('keyboard');
                keyManager.setPreviousItemActive();
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
        this.menuStack.emptied
            .pipe(takeUntil(this.destroyed))
            .subscribe(event => this._toggleMenuFocus(event));
    }
}
CdkMenu.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.0.0-next.9", ngImport: i0, type: CdkMenu, deps: [{ token: i0.NgZone }, { token: i0.ElementRef }, { token: MENU_STACK }, { token: MENU_TRIGGER, optional: true }, { token: MENU_AIM, optional: true, self: true }, { token: i1.Directionality, optional: true }], target: i0.ɵɵFactoryTarget.Directive });
CdkMenu.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "14.0.0-next.9", type: CdkMenu, selector: "[cdkMenu]", outputs: { closed: "closed" }, host: { attributes: { "role": "menu" }, listeners: { "keydown": "_handleKeyEvent($event)" }, properties: { "class.cdk-menu-inline": "_isInline" }, classAttribute: "cdk-menu" }, providers: [
        { provide: CdkMenuGroup, useExisting: CdkMenu },
        { provide: CDK_MENU, useExisting: CdkMenu },
        PARENT_OR_NEW_INLINE_MENU_STACK_PROVIDER,
    ], exportAs: ["cdkMenu"], usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.0.0-next.9", ngImport: i0, type: CdkMenu, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkMenu]',
                    exportAs: 'cdkMenu',
                    host: {
                        'role': 'menu',
                        'class': 'cdk-menu',
                        '[class.cdk-menu-inline]': '_isInline',
                        '(keydown)': '_handleKeyEvent($event)',
                    },
                    providers: [
                        { provide: CdkMenuGroup, useExisting: CdkMenu },
                        { provide: CDK_MENU, useExisting: CdkMenu },
                        PARENT_OR_NEW_INLINE_MENU_STACK_PROVIDER,
                    ],
                }]
        }], ctorParameters: function () { return [{ type: i0.NgZone }, { type: i0.ElementRef }, { type: i2.MenuStack, decorators: [{
                    type: Inject,
                    args: [MENU_STACK]
                }] }, { type: i3.MenuTrigger, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [MENU_TRIGGER]
                }] }, { type: undefined, decorators: [{
                    type: Self
                }, {
                    type: Optional
                }, {
                    type: Inject,
                    args: [MENU_AIM]
                }] }, { type: i1.Directionality, decorators: [{
                    type: Optional
                }] }]; }, propDecorators: { closed: [{
                type: Output
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL21lbnUvbWVudS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBRUwsU0FBUyxFQUNULFVBQVUsRUFDVixZQUFZLEVBQ1osTUFBTSxFQUNOLE1BQU0sRUFFTixRQUFRLEVBQ1IsTUFBTSxFQUNOLElBQUksR0FDTCxNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQ0wsVUFBVSxFQUNWLE1BQU0sRUFDTixjQUFjLEVBQ2QsVUFBVSxFQUNWLFdBQVcsRUFDWCxHQUFHLEVBQ0gsUUFBUSxHQUNULE1BQU0sdUJBQXVCLENBQUM7QUFDL0IsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQ2pELE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUN6QyxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sY0FBYyxDQUFDO0FBQzFDLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUMxQyxPQUFPLEVBRUwsVUFBVSxFQUNWLFNBQVMsRUFDVCx3Q0FBd0MsR0FDekMsTUFBTSxjQUFjLENBQUM7QUFDdEIsT0FBTyxFQUFDLG1CQUFtQixFQUFDLE1BQU0seUJBQXlCLENBQUM7QUFDNUQsT0FBTyxFQUFDLFFBQVEsRUFBVSxNQUFNLFlBQVksQ0FBQztBQUM3QyxPQUFPLEVBQUMsWUFBWSxFQUFFLFdBQVcsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQ3pELE9BQU8sRUFBQyxXQUFXLEVBQUMsTUFBTSxhQUFhLENBQUM7Ozs7O0FBRXhDOzs7Ozs7R0FNRztBQWdCSCxNQUFNLE9BQU8sT0FBUSxTQUFRLFdBQVc7SUFNdEMsWUFDbUIsT0FBZSxFQUNoQyxVQUFtQyxFQUNmLFNBQW9CLEVBQ0UsY0FBNEIsRUFDZixRQUFrQixFQUM3RCxHQUFv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ckIsUUFBUSxFQUFFLFNBQVM7b0JBQ25CLElBQUksRUFBRTt3QkFDSixNQUFNLEVBQUUsTUFBTTt3QkFDZCxPQUFPLEVBQUUsVUFBVTt3QkFDbkIseUJBQXlCLEVBQUUsV0FBVzt3QkFDdEMsV0FBVyxFQUFFLHlCQUF5QjtxQkFDdkM7b0JBQ0QsU0FBUyxFQUFFO3dCQUNULEVBQUMsT0FBTyxFQUFFLFlBQVksRUFBRSxXQUFXLFNBQVMsRUFBQzt3QkFDN0MsRUFBQyxPQUFPLEVBQUUsUUFBUSxFQUFFLFdBQVcsU0FBUyxFQUFDO3dCQUN6Qyx3Q0FBd0M7cUJBQ3pDO2lCQUNGOzswQkFVSSxNQUFNOzJCQUFDLFVBQVU7OzBCQUNqQixRQUFROzswQkFBSSxNQUFNOzJCQUFDLFlBQVk7OzBCQUMvQixJQUFJOzswQkFBSSxRQUFROzswQkFBSSxNQUFNOzJCQUFDLFFBQVE7OzBCQUNuQyxRQUFROzRDQVZRLE1BQU07c0JBQXhCLE1BQU0iLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtcbiAgQWZ0ZXJDb250ZW50SW5pdCxcbiAgRGlyZWN0aXZlLFxuICBFbGVtZW50UmVmLFxuICBFdmVudEVtaXR0ZXIsXG4gIEluamVjdCxcbiAgTmdab25lLFxuICBPbkRlc3Ryb3ksXG4gIE9wdGlvbmFsLFxuICBPdXRwdXQsXG4gIFNlbGYsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtcbiAgRE9XTl9BUlJPVyxcbiAgRVNDQVBFLFxuICBoYXNNb2RpZmllcktleSxcbiAgTEVGVF9BUlJPVyxcbiAgUklHSFRfQVJST1csXG4gIFRBQixcbiAgVVBfQVJST1csXG59IGZyb20gJ0Bhbmd1bGFyL2Nkay9rZXljb2Rlcyc7XG5pbXBvcnQge0RpcmVjdGlvbmFsaXR5fSBmcm9tICdAYW5ndWxhci9jZGsvYmlkaSc7XG5pbXBvcnQge3Rha2VVbnRpbH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuaW1wb3J0IHtDZGtNZW51R3JvdXB9IGZyb20gJy4vbWVudS1ncm91cCc7XG5pbXBvcnQge0NES19NRU5VfSBmcm9tICcuL21lbnUtaW50ZXJmYWNlJztcbmltcG9ydCB7XG4gIEZvY3VzTmV4dCxcbiAgTUVOVV9TVEFDSyxcbiAgTWVudVN0YWNrLFxuICBQQVJFTlRfT1JfTkVXX0lOTElORV9NRU5VX1NUQUNLX1BST1ZJREVSLFxufSBmcm9tICcuL21lbnUtc3RhY2snO1xuaW1wb3J0IHtQb2ludGVyRm9jdXNUcmFja2VyfSBmcm9tICcuL3BvaW50ZXItZm9jdXMtdHJhY2tlcic7XG5pbXBvcnQge01FTlVfQUlNLCBNZW51QWltfSBmcm9tICcuL21lbnUtYWltJztcbmltcG9ydCB7TUVOVV9UUklHR0VSLCBNZW51VHJpZ2dlcn0gZnJvbSAnLi9tZW51LXRyaWdnZXInO1xuaW1wb3J0IHtDZGtNZW51QmFzZX0gZnJvbSAnLi9tZW51LWJhc2UnO1xuXG4vKipcbiAqIERpcmVjdGl2ZSB3aGljaCBjb25maWd1cmVzIHRoZSBlbGVtZW50IGFzIGEgTWVudSB3aGljaCBzaG91bGQgY29udGFpbiBjaGlsZCBlbGVtZW50cyBtYXJrZWQgYXNcbiAqIENka01lbnVJdGVtIG9yIENka01lbnVHcm91cC4gU2V0cyB0aGUgYXBwcm9wcmlhdGUgcm9sZSBhbmQgYXJpYS1hdHRyaWJ1dGVzIGZvciBhIG1lbnUgYW5kXG4gKiBjb250YWlucyBhY2Nlc3NpYmxlIGtleWJvYXJkIGFuZCBtb3VzZSBoYW5kbGluZyBsb2dpYy5cbiAqXG4gKiBJdCBhbHNvIGFjdHMgYXMgYSBSYWRpb0dyb3VwIGZvciBlbGVtZW50cyBtYXJrZWQgd2l0aCByb2xlIGBtZW51aXRlbXJhZGlvYC5cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW2Nka01lbnVdJyxcbiAgZXhwb3J0QXM6ICdjZGtNZW51JyxcbiAgaG9zdDoge1xuICAgICdyb2xlJzogJ21lbnUnLFxuICAgICdjbGFzcyc6ICdjZGstbWVudScsXG4gICAgJ1tjbGFzcy5jZGstbWVudS1pbmxpbmVdJzogJ19pc0lubGluZScsXG4gICAgJyhrZXlkb3duKSc6ICdfaGFuZGxlS2V5RXZlbnQoJGV2ZW50KScsXG4gIH0sXG4gIHByb3ZpZGVyczogW1xuICAgIHtwcm92aWRlOiBDZGtNZW51R3JvdXAsIHVzZUV4aXN0aW5nOiBDZGtNZW51fSxcbiAgICB7cHJvdmlkZTogQ0RLX01FTlUsIHVzZUV4aXN0aW5nOiBDZGtNZW51fSxcbiAgICBQQVJFTlRfT1JfTkVXX0lOTElORV9NRU5VX1NUQUNLX1BST1ZJREVSLFxuICBdLFxufSlcbmV4cG9ydCBjbGFzcyBDZGtNZW51IGV4dGVuZHMgQ2RrTWVudUJhc2UgaW1wbGVtZW50cyBBZnRlckNvbnRlbnRJbml0LCBPbkRlc3Ryb3kge1xuICAvKiogRXZlbnQgZW1pdHRlZCB3aGVuIHRoZSBtZW51IGlzIGNsb3NlZC4gKi9cbiAgQE91dHB1dCgpIHJlYWRvbmx5IGNsb3NlZDogRXZlbnRFbWl0dGVyPHZvaWQ+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4gIG92ZXJyaWRlIF9pc0lubGluZSA9ICF0aGlzLl9wYXJlbnRUcmlnZ2VyO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgcmVhZG9ubHkgX25nWm9uZTogTmdab25lLFxuICAgIGVsZW1lbnRSZWY6IEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+LFxuICAgIEBJbmplY3QoTUVOVV9TVEFDSykgbWVudVN0YWNrOiBNZW51U3RhY2ssXG4gICAgQE9wdGlvbmFsKCkgQEluamVjdChNRU5VX1RSSUdHRVIpIHByaXZhdGUgX3BhcmVudFRyaWdnZXI/OiBNZW51VHJpZ2dlcixcbiAgICBAU2VsZigpIEBPcHRpb25hbCgpIEBJbmplY3QoTUVOVV9BSU0pIHByaXZhdGUgcmVhZG9ubHkgX21lbnVBaW0/OiBNZW51QWltLFxuICAgIEBPcHRpb25hbCgpIGRpcj86IERpcmVjdGlvbmFsaXR5LFxuICApIHtcbiAgICBzdXBlcihlbGVtZW50UmVmLCBtZW51U3RhY2ssIGRpcik7XG4gICAgdGhpcy5kZXN0cm95ZWQuc3Vic2NyaWJlKHRoaXMuY2xvc2VkKTtcbiAgICBpZiAoIXRoaXMuX2lzSW5saW5lKSB7XG4gICAgICB0aGlzLm1lbnVTdGFjay5wdXNoKHRoaXMpO1xuICAgIH1cbiAgICB0aGlzLl9wYXJlbnRUcmlnZ2VyPy5yZWdpc3RlckNoaWxkTWVudSh0aGlzKTtcbiAgfVxuXG4gIG92ZXJyaWRlIG5nQWZ0ZXJDb250ZW50SW5pdCgpIHtcbiAgICBzdXBlci5uZ0FmdGVyQ29udGVudEluaXQoKTtcbiAgICB0aGlzLl9zdWJzY3JpYmVUb01lbnVTdGFja0VtcHRpZWQoKTtcbiAgICB0aGlzLl9zdWJzY3JpYmVUb01vdXNlTWFuYWdlcigpO1xuICAgIHRoaXMuX21lbnVBaW0/LmluaXRpYWxpemUodGhpcywgdGhpcy5wb2ludGVyVHJhY2tlciEpO1xuICB9XG5cbiAgb3ZlcnJpZGUgbmdPbkRlc3Ryb3koKSB7XG4gICAgc3VwZXIubmdPbkRlc3Ryb3koKTtcbiAgICB0aGlzLmNsb3NlZC5jb21wbGV0ZSgpO1xuICAgIHRoaXMucG9pbnRlclRyYWNrZXI/LmRlc3Ryb3koKTtcbiAgfVxuXG4gIC8qKiBIYW5kbGUga2V5Ym9hcmQgZXZlbnRzIGZvciB0aGUgTWVudS4gKi9cbiAgX2hhbmRsZUtleUV2ZW50KGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XG4gICAgY29uc3Qga2V5TWFuYWdlciA9IHRoaXMua2V5TWFuYWdlcjtcbiAgICBzd2l0Y2ggKGV2ZW50LmtleUNvZGUpIHtcbiAgICAgIGNhc2UgTEVGVF9BUlJPVzpcbiAgICAgIGNhc2UgUklHSFRfQVJST1c6XG4gICAgICAgIGlmICh0aGlzLmlzSG9yaXpvbnRhbCgpKSB7XG4gICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICBrZXlNYW5hZ2VyLnNldEZvY3VzT3JpZ2luKCdrZXlib2FyZCcpO1xuICAgICAgICAgIGtleU1hbmFnZXIub25LZXlkb3duKGV2ZW50KTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBVUF9BUlJPVzpcbiAgICAgIGNhc2UgRE9XTl9BUlJPVzpcbiAgICAgICAgaWYgKCF0aGlzLmlzSG9yaXpvbnRhbCgpKSB7XG4gICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICBrZXlNYW5hZ2VyLnNldEZvY3VzT3JpZ2luKCdrZXlib2FyZCcpO1xuICAgICAgICAgIGtleU1hbmFnZXIub25LZXlkb3duKGV2ZW50KTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBFU0NBUEU6XG4gICAgICAgIGlmICghaGFzTW9kaWZpZXJLZXkoZXZlbnQpKSB7XG4gICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICB0aGlzLm1lbnVTdGFjay5jbG9zZSh0aGlzLCB7XG4gICAgICAgICAgICBmb2N1c05leHRPbkVtcHR5OiBGb2N1c05leHQuY3VycmVudEl0ZW0sXG4gICAgICAgICAgICBmb2N1c1BhcmVudFRyaWdnZXI6IHRydWUsXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgVEFCOlxuICAgICAgICB0aGlzLm1lbnVTdGFjay5jbG9zZUFsbCh7Zm9jdXNQYXJlbnRUcmlnZ2VyOiB0cnVlfSk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBrZXlNYW5hZ2VyLm9uS2V5ZG93bihldmVudCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNldCB0aGUgUG9pbnRlckZvY3VzVHJhY2tlciBhbmQgZW5zdXJlIHRoYXQgd2hlbiBtb3VzZSBmb2N1cyBjaGFuZ2VzIHRoZSBrZXkgbWFuYWdlciBpcyB1cGRhdGVkXG4gICAqIHdpdGggdGhlIGxhdGVzdCBtZW51IGl0ZW0gdW5kZXIgbW91c2UgZm9jdXMuXG4gICAqL1xuICBwcml2YXRlIF9zdWJzY3JpYmVUb01vdXNlTWFuYWdlcigpIHtcbiAgICB0aGlzLl9uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgdGhpcy5wb2ludGVyVHJhY2tlciA9IG5ldyBQb2ludGVyRm9jdXNUcmFja2VyKHRoaXMuaXRlbXMpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqIFNldCBmb2N1cyB0aGUgZWl0aGVyIHRoZSBjdXJyZW50LCBwcmV2aW91cyBvciBuZXh0IGl0ZW0gYmFzZWQgb24gdGhlIEZvY3VzTmV4dCBldmVudC4gKi9cbiAgcHJpdmF0ZSBfdG9nZ2xlTWVudUZvY3VzKGV2ZW50OiBGb2N1c05leHQgfCB1bmRlZmluZWQpIHtcbiAgICBjb25zdCBrZXlNYW5hZ2VyID0gdGhpcy5rZXlNYW5hZ2VyO1xuICAgIHN3aXRjaCAoZXZlbnQpIHtcbiAgICAgIGNhc2UgRm9jdXNOZXh0Lm5leHRJdGVtOlxuICAgICAgICBrZXlNYW5hZ2VyLnNldEZvY3VzT3JpZ2luKCdrZXlib2FyZCcpO1xuICAgICAgICBrZXlNYW5hZ2VyLnNldE5leHRJdGVtQWN0aXZlKCk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIEZvY3VzTmV4dC5wcmV2aW91c0l0ZW06XG4gICAgICAgIGtleU1hbmFnZXIuc2V0Rm9jdXNPcmlnaW4oJ2tleWJvYXJkJyk7XG4gICAgICAgIGtleU1hbmFnZXIuc2V0UHJldmlvdXNJdGVtQWN0aXZlKCk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIEZvY3VzTmV4dC5jdXJyZW50SXRlbTpcbiAgICAgICAgaWYgKGtleU1hbmFnZXIuYWN0aXZlSXRlbSkge1xuICAgICAgICAgIGtleU1hbmFnZXIuc2V0Rm9jdXNPcmlnaW4oJ2tleWJvYXJkJyk7XG4gICAgICAgICAga2V5TWFuYWdlci5zZXRBY3RpdmVJdGVtKGtleU1hbmFnZXIuYWN0aXZlSXRlbSk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfc3Vic2NyaWJlVG9NZW51U3RhY2tFbXB0aWVkKCkge1xuICAgIHRoaXMubWVudVN0YWNrLmVtcHRpZWRcbiAgICAgIC5waXBlKHRha2VVbnRpbCh0aGlzLmRlc3Ryb3llZCkpXG4gICAgICAuc3Vic2NyaWJlKGV2ZW50ID0+IHRoaXMuX3RvZ2dsZU1lbnVGb2N1cyhldmVudCkpO1xuICB9XG59XG4iXX0=