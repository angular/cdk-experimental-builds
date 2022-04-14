/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, ElementRef, EventEmitter, Inject, NgZone, Optional, Output, Self, } from '@angular/core';
import { ESCAPE, hasModifierKey, LEFT_ARROW, RIGHT_ARROW, TAB } from '@angular/cdk/keycodes';
import { Directionality } from '@angular/cdk/bidi';
import { takeUntil } from 'rxjs/operators';
import { CdkMenuGroup } from './menu-group';
import { CDK_MENU } from './menu-interface';
import { MENU_STACK, MenuStack, PARENT_OR_NEW_INLINE_MENU_STACK_PROVIDER, } from './menu-stack';
import { MENU_AIM } from './menu-aim';
import { MENU_TRIGGER, CdkMenuTriggerBase } from './menu-trigger-base';
import { CdkMenuBase } from './menu-base';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/bidi";
import * as i2 from "./menu-stack";
import * as i3 from "./menu-trigger-base";
/**
 * Directive which configures the element as a Menu which should contain child elements marked as
 * CdkMenuItem or CdkMenuGroup. Sets the appropriate role and aria-attributes for a menu and
 * contains accessible keyboard and mouse handling logic.
 *
 * It also acts as a RadioGroup for elements marked with role `menuitemradio`.
 */
export class CdkMenu extends CdkMenuBase {
    constructor(
    /** The host element. */
    elementRef, 
    /** The Angular zone. */
    ngZone, 
    /** The menu stack this menu is part of. */
    menuStack, 
    /** The trigger that opened this menu. */
    _parentTrigger, 
    /** The menu aim service used by this menu. */
    menuAim, 
    /** The directionality of the page. */
    dir) {
        super(elementRef, ngZone, menuStack, menuAim, dir);
        this._parentTrigger = _parentTrigger;
        /** Event emitted when the menu is closed. */
        this.closed = new EventEmitter();
        /** The direction items in the menu flow. */
        this.orientation = 'vertical';
        /** Whether the menu is displayed inline (i.e. always present vs a conditional popup that the user triggers with a trigger element). */
        this.isInline = !this._parentTrigger;
        this.destroyed.subscribe(this.closed);
        this._parentTrigger?.registerChildMenu(this);
    }
    ngAfterContentInit() {
        super.ngAfterContentInit();
        this._subscribeToMenuStackEmptied();
    }
    ngOnDestroy() {
        super.ngOnDestroy();
        this.closed.complete();
    }
    /**
     * Handle keyboard events for the Menu.
     * @param event The keyboard event to be handled.
     */
    _handleKeyEvent(event) {
        const keyManager = this.keyManager;
        switch (event.keyCode) {
            case LEFT_ARROW:
            case RIGHT_ARROW:
                if (!hasModifierKey(event)) {
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
                if (!hasModifierKey(event, 'altKey', 'metaKey', 'ctrlKey')) {
                    this.menuStack.closeAll({ focusParentTrigger: true });
                }
                break;
            default:
                keyManager.onKeydown(event);
        }
    }
    /**
     * Set focus the either the current, previous or next item based on the FocusNext event.
     * @param focusNext The element to focus.
     */
    _toggleMenuFocus(focusNext) {
        const keyManager = this.keyManager;
        switch (focusNext) {
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
    /** Subscribe to the MenuStack emptied events. */
    _subscribeToMenuStackEmptied() {
        this.menuStack.emptied
            .pipe(takeUntil(this.destroyed))
            .subscribe(event => this._toggleMenuFocus(event));
    }
}
CdkMenu.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.0.0-next.13", ngImport: i0, type: CdkMenu, deps: [{ token: i0.ElementRef }, { token: i0.NgZone }, { token: MENU_STACK }, { token: MENU_TRIGGER, optional: true }, { token: MENU_AIM, optional: true, self: true }, { token: i1.Directionality, optional: true }], target: i0.ɵɵFactoryTarget.Directive });
CdkMenu.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "14.0.0-next.13", type: CdkMenu, selector: "[cdkMenu]", outputs: { closed: "closed" }, host: { attributes: { "role": "menu" }, listeners: { "keydown": "_handleKeyEvent($event)" }, properties: { "class.cdk-menu-inline": "isInline" }, classAttribute: "cdk-menu" }, providers: [
        { provide: CdkMenuGroup, useExisting: CdkMenu },
        { provide: CDK_MENU, useExisting: CdkMenu },
        PARENT_OR_NEW_INLINE_MENU_STACK_PROVIDER('vertical'),
    ], exportAs: ["cdkMenu"], usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.0.0-next.13", ngImport: i0, type: CdkMenu, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkMenu]',
                    exportAs: 'cdkMenu',
                    host: {
                        'role': 'menu',
                        'class': 'cdk-menu',
                        '[class.cdk-menu-inline]': 'isInline',
                        '(keydown)': '_handleKeyEvent($event)',
                    },
                    providers: [
                        { provide: CdkMenuGroup, useExisting: CdkMenu },
                        { provide: CDK_MENU, useExisting: CdkMenu },
                        PARENT_OR_NEW_INLINE_MENU_STACK_PROVIDER('vertical'),
                    ],
                }]
        }], ctorParameters: function () { return [{ type: i0.ElementRef }, { type: i0.NgZone }, { type: i2.MenuStack, decorators: [{
                    type: Inject,
                    args: [MENU_STACK]
                }] }, { type: i3.CdkMenuTriggerBase, decorators: [{
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL21lbnUvbWVudS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBRUwsU0FBUyxFQUNULFVBQVUsRUFDVixZQUFZLEVBQ1osTUFBTSxFQUNOLE1BQU0sRUFFTixRQUFRLEVBQ1IsTUFBTSxFQUNOLElBQUksR0FDTCxNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUMsTUFBTSxFQUFFLGNBQWMsRUFBRSxVQUFVLEVBQUUsV0FBVyxFQUFFLEdBQUcsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQzNGLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUNqRCxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDekMsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGNBQWMsQ0FBQztBQUMxQyxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sa0JBQWtCLENBQUM7QUFDMUMsT0FBTyxFQUVMLFVBQVUsRUFDVixTQUFTLEVBQ1Qsd0NBQXdDLEdBQ3pDLE1BQU0sY0FBYyxDQUFDO0FBQ3RCLE9BQU8sRUFBQyxRQUFRLEVBQVUsTUFBTSxZQUFZLENBQUM7QUFDN0MsT0FBTyxFQUFDLFlBQVksRUFBRSxrQkFBa0IsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQ3JFLE9BQU8sRUFBQyxXQUFXLEVBQUMsTUFBTSxhQUFhLENBQUM7Ozs7O0FBRXhDOzs7Ozs7R0FNRztBQWdCSCxNQUFNLE9BQU8sT0FBUSxTQUFRLFdBQVc7SUFVdEM7SUFDRSx3QkFBd0I7SUFDeEIsVUFBbUM7SUFDbkMsd0JBQXdCO0lBQ3hCLE1BQWM7SUFDZCwyQ0FBMkM7SUFDdkIsU0FBb0I7SUFDeEMseUNBQXlDO0lBQ0MsY0FBbUM7SUFDN0UsOENBQThDO0lBQ1IsT0FBaUI7SUFDdkQsc0NB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KiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtcbiAgQWZ0ZXJDb250ZW50SW5pdCxcbiAgRGlyZWN0aXZlLFxuICBFbGVtZW50UmVmLFxuICBFdmVudEVtaXR0ZXIsXG4gIEluamVjdCxcbiAgTmdab25lLFxuICBPbkRlc3Ryb3ksXG4gIE9wdGlvbmFsLFxuICBPdXRwdXQsXG4gIFNlbGYsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtFU0NBUEUsIGhhc01vZGlmaWVyS2V5LCBMRUZUX0FSUk9XLCBSSUdIVF9BUlJPVywgVEFCfSBmcm9tICdAYW5ndWxhci9jZGsva2V5Y29kZXMnO1xuaW1wb3J0IHtEaXJlY3Rpb25hbGl0eX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2JpZGknO1xuaW1wb3J0IHt0YWtlVW50aWx9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7Q2RrTWVudUdyb3VwfSBmcm9tICcuL21lbnUtZ3JvdXAnO1xuaW1wb3J0IHtDREtfTUVOVX0gZnJvbSAnLi9tZW51LWludGVyZmFjZSc7XG5pbXBvcnQge1xuICBGb2N1c05leHQsXG4gIE1FTlVfU1RBQ0ssXG4gIE1lbnVTdGFjayxcbiAgUEFSRU5UX09SX05FV19JTkxJTkVfTUVOVV9TVEFDS19QUk9WSURFUixcbn0gZnJvbSAnLi9tZW51LXN0YWNrJztcbmltcG9ydCB7TUVOVV9BSU0sIE1lbnVBaW19IGZyb20gJy4vbWVudS1haW0nO1xuaW1wb3J0IHtNRU5VX1RSSUdHRVIsIENka01lbnVUcmlnZ2VyQmFzZX0gZnJvbSAnLi9tZW51LXRyaWdnZXItYmFzZSc7XG5pbXBvcnQge0Nka01lbnVCYXNlfSBmcm9tICcuL21lbnUtYmFzZSc7XG5cbi8qKlxuICogRGlyZWN0aXZlIHdoaWNoIGNvbmZpZ3VyZXMgdGhlIGVsZW1lbnQgYXMgYSBNZW51IHdoaWNoIHNob3VsZCBjb250YWluIGNoaWxkIGVsZW1lbnRzIG1hcmtlZCBhc1xuICogQ2RrTWVudUl0ZW0gb3IgQ2RrTWVudUdyb3VwLiBTZXRzIHRoZSBhcHByb3ByaWF0ZSByb2xlIGFuZCBhcmlhLWF0dHJpYnV0ZXMgZm9yIGEgbWVudSBhbmRcbiAqIGNvbnRhaW5zIGFjY2Vzc2libGUga2V5Ym9hcmQgYW5kIG1vdXNlIGhhbmRsaW5nIGxvZ2ljLlxuICpcbiAqIEl0IGFsc28gYWN0cyBhcyBhIFJhZGlvR3JvdXAgZm9yIGVsZW1lbnRzIG1hcmtlZCB3aXRoIHJvbGUgYG1lbnVpdGVtcmFkaW9gLlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbY2RrTWVudV0nLFxuICBleHBvcnRBczogJ2Nka01lbnUnLFxuICBob3N0OiB7XG4gICAgJ3JvbGUnOiAnbWVudScsXG4gICAgJ2NsYXNzJzogJ2Nkay1tZW51JyxcbiAgICAnW2NsYXNzLmNkay1tZW51LWlubGluZV0nOiAnaXNJbmxpbmUnLFxuICAgICcoa2V5ZG93biknOiAnX2hhbmRsZUtleUV2ZW50KCRldmVudCknLFxuICB9LFxuICBwcm92aWRlcnM6IFtcbiAgICB7cHJvdmlkZTogQ2RrTWVudUdyb3VwLCB1c2VFeGlzdGluZzogQ2RrTWVudX0sXG4gICAge3Byb3ZpZGU6IENES19NRU5VLCB1c2VFeGlzdGluZzogQ2RrTWVudX0sXG4gICAgUEFSRU5UX09SX05FV19JTkxJTkVfTUVOVV9TVEFDS19QUk9WSURFUigndmVydGljYWwnKSxcbiAgXSxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrTWVudSBleHRlbmRzIENka01lbnVCYXNlIGltcGxlbWVudHMgQWZ0ZXJDb250ZW50SW5pdCwgT25EZXN0cm95IHtcbiAgLyoqIEV2ZW50IGVtaXR0ZWQgd2hlbiB0aGUgbWVudSBpcyBjbG9zZWQuICovXG4gIEBPdXRwdXQoKSByZWFkb25seSBjbG9zZWQ6IEV2ZW50RW1pdHRlcjx2b2lkPiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuICAvKiogVGhlIGRpcmVjdGlvbiBpdGVtcyBpbiB0aGUgbWVudSBmbG93LiAqL1xuICBvdmVycmlkZSByZWFkb25seSBvcmllbnRhdGlvbiA9ICd2ZXJ0aWNhbCc7XG5cbiAgLyoqIFdoZXRoZXIgdGhlIG1lbnUgaXMgZGlzcGxheWVkIGlubGluZSAoaS5lLiBhbHdheXMgcHJlc2VudCB2cyBhIGNvbmRpdGlvbmFsIHBvcHVwIHRoYXQgdGhlIHVzZXIgdHJpZ2dlcnMgd2l0aCBhIHRyaWdnZXIgZWxlbWVudCkuICovXG4gIG92ZXJyaWRlIHJlYWRvbmx5IGlzSW5saW5lID0gIXRoaXMuX3BhcmVudFRyaWdnZXI7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgLyoqIFRoZSBob3N0IGVsZW1lbnQuICovXG4gICAgZWxlbWVudFJlZjogRWxlbWVudFJlZjxIVE1MRWxlbWVudD4sXG4gICAgLyoqIFRoZSBBbmd1bGFyIHpvbmUuICovXG4gICAgbmdab25lOiBOZ1pvbmUsXG4gICAgLyoqIFRoZSBtZW51IHN0YWNrIHRoaXMgbWVudSBpcyBwYXJ0IG9mLiAqL1xuICAgIEBJbmplY3QoTUVOVV9TVEFDSykgbWVudVN0YWNrOiBNZW51U3RhY2ssXG4gICAgLyoqIFRoZSB0cmlnZ2VyIHRoYXQgb3BlbmVkIHRoaXMgbWVudS4gKi9cbiAgICBAT3B0aW9uYWwoKSBASW5qZWN0KE1FTlVfVFJJR0dFUikgcHJpdmF0ZSBfcGFyZW50VHJpZ2dlcj86IENka01lbnVUcmlnZ2VyQmFzZSxcbiAgICAvKiogVGhlIG1lbnUgYWltIHNlcnZpY2UgdXNlZCBieSB0aGlzIG1lbnUuICovXG4gICAgQFNlbGYoKSBAT3B0aW9uYWwoKSBASW5qZWN0KE1FTlVfQUlNKSBtZW51QWltPzogTWVudUFpbSxcbiAgICAvKiogVGhlIGRpcmVjdGlvbmFsaXR5IG9mIHRoZSBwYWdlLiAqL1xuICAgIEBPcHRpb25hbCgpIGRpcj86IERpcmVjdGlvbmFsaXR5LFxuICApIHtcbiAgICBzdXBlcihlbGVtZW50UmVmLCBuZ1pvbmUsIG1lbnVTdGFjaywgbWVudUFpbSwgZGlyKTtcbiAgICB0aGlzLmRlc3Ryb3llZC5zdWJzY3JpYmUodGhpcy5jbG9zZWQpO1xuICAgIHRoaXMuX3BhcmVudFRyaWdnZXI/LnJlZ2lzdGVyQ2hpbGRNZW51KHRoaXMpO1xuICB9XG5cbiAgb3ZlcnJpZGUgbmdBZnRlckNvbnRlbnRJbml0KCkge1xuICAgIHN1cGVyLm5nQWZ0ZXJDb250ZW50SW5pdCgpO1xuICAgIHRoaXMuX3N1YnNjcmliZVRvTWVudVN0YWNrRW1wdGllZCgpO1xuICB9XG5cbiAgb3ZlcnJpZGUgbmdPbkRlc3Ryb3koKSB7XG4gICAgc3VwZXIubmdPbkRlc3Ryb3koKTtcbiAgICB0aGlzLmNsb3NlZC5jb21wbGV0ZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZSBrZXlib2FyZCBldmVudHMgZm9yIHRoZSBNZW51LlxuICAgKiBAcGFyYW0gZXZlbnQgVGhlIGtleWJvYXJkIGV2ZW50IHRvIGJlIGhhbmRsZWQuXG4gICAqL1xuICBfaGFuZGxlS2V5RXZlbnQoZXZlbnQ6IEtleWJvYXJkRXZlbnQpIHtcbiAgICBjb25zdCBrZXlNYW5hZ2VyID0gdGhpcy5rZXlNYW5hZ2VyO1xuICAgIHN3aXRjaCAoZXZlbnQua2V5Q29kZSkge1xuICAgICAgY2FzZSBMRUZUX0FSUk9XOlxuICAgICAgY2FzZSBSSUdIVF9BUlJPVzpcbiAgICAgICAgaWYgKCFoYXNNb2RpZmllcktleShldmVudCkpIHtcbiAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgIGtleU1hbmFnZXIuc2V0Rm9jdXNPcmlnaW4oJ2tleWJvYXJkJyk7XG4gICAgICAgICAga2V5TWFuYWdlci5vbktleWRvd24oZXZlbnQpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIEVTQ0FQRTpcbiAgICAgICAgaWYgKCFoYXNNb2RpZmllcktleShldmVudCkpIHtcbiAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgIHRoaXMubWVudVN0YWNrLmNsb3NlKHRoaXMsIHtcbiAgICAgICAgICAgIGZvY3VzTmV4dE9uRW1wdHk6IEZvY3VzTmV4dC5jdXJyZW50SXRlbSxcbiAgICAgICAgICAgIGZvY3VzUGFyZW50VHJpZ2dlcjogdHJ1ZSxcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBUQUI6XG4gICAgICAgIGlmICghaGFzTW9kaWZpZXJLZXkoZXZlbnQsICdhbHRLZXknLCAnbWV0YUtleScsICdjdHJsS2V5JykpIHtcbiAgICAgICAgICB0aGlzLm1lbnVTdGFjay5jbG9zZUFsbCh7Zm9jdXNQYXJlbnRUcmlnZ2VyOiB0cnVlfSk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGtleU1hbmFnZXIub25LZXlkb3duKGV2ZW50KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2V0IGZvY3VzIHRoZSBlaXRoZXIgdGhlIGN1cnJlbnQsIHByZXZpb3VzIG9yIG5leHQgaXRlbSBiYXNlZCBvbiB0aGUgRm9jdXNOZXh0IGV2ZW50LlxuICAgKiBAcGFyYW0gZm9jdXNOZXh0IFRoZSBlbGVtZW50IHRvIGZvY3VzLlxuICAgKi9cbiAgcHJpdmF0ZSBfdG9nZ2xlTWVudUZvY3VzKGZvY3VzTmV4dDogRm9jdXNOZXh0IHwgdW5kZWZpbmVkKSB7XG4gICAgY29uc3Qga2V5TWFuYWdlciA9IHRoaXMua2V5TWFuYWdlcjtcbiAgICBzd2l0Y2ggKGZvY3VzTmV4dCkge1xuICAgICAgY2FzZSBGb2N1c05leHQubmV4dEl0ZW06XG4gICAgICAgIGtleU1hbmFnZXIuc2V0Rm9jdXNPcmlnaW4oJ2tleWJvYXJkJyk7XG4gICAgICAgIGtleU1hbmFnZXIuc2V0TmV4dEl0ZW1BY3RpdmUoKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgRm9jdXNOZXh0LnByZXZpb3VzSXRlbTpcbiAgICAgICAga2V5TWFuYWdlci5zZXRGb2N1c09yaWdpbigna2V5Ym9hcmQnKTtcbiAgICAgICAga2V5TWFuYWdlci5zZXRQcmV2aW91c0l0ZW1BY3RpdmUoKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgRm9jdXNOZXh0LmN1cnJlbnRJdGVtOlxuICAgICAgICBpZiAoa2V5TWFuYWdlci5hY3RpdmVJdGVtKSB7XG4gICAgICAgICAga2V5TWFuYWdlci5zZXRGb2N1c09yaWdpbigna2V5Ym9hcmQnKTtcbiAgICAgICAgICBrZXlNYW5hZ2VyLnNldEFjdGl2ZUl0ZW0oa2V5TWFuYWdlci5hY3RpdmVJdGVtKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICAvKiogU3Vic2NyaWJlIHRvIHRoZSBNZW51U3RhY2sgZW1wdGllZCBldmVudHMuICovXG4gIHByaXZhdGUgX3N1YnNjcmliZVRvTWVudVN0YWNrRW1wdGllZCgpIHtcbiAgICB0aGlzLm1lbnVTdGFjay5lbXB0aWVkXG4gICAgICAucGlwZSh0YWtlVW50aWwodGhpcy5kZXN0cm95ZWQpKVxuICAgICAgLnN1YnNjcmliZShldmVudCA9PiB0aGlzLl90b2dnbGVNZW51Rm9jdXMoZXZlbnQpKTtcbiAgfVxufVxuIl19