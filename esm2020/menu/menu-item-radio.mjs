/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { UniqueSelectionDispatcher } from '@angular/cdk/collections';
import { Directive, ElementRef, Inject, NgZone, Optional, Self } from '@angular/core';
import { Directionality } from '@angular/cdk/bidi';
import { CdkMenuItemSelectable } from './menu-item-selectable';
import { CdkMenuItem } from './menu-item';
import { CdkMenuTrigger } from './menu-trigger';
import { CDK_MENU } from './menu-interface';
import { MENU_AIM } from './menu-aim';
import { MENU_STACK, MenuStack } from './menu-stack';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/collections";
import * as i2 from "@angular/cdk/bidi";
import * as i3 from "./menu-trigger";
import * as i4 from "./menu-stack";
/** Counter used to set a unique id and name for a selectable item */
let nextId = 0;
/**
 * A directive providing behavior for the "menuitemradio" ARIA role, which behaves similarly to
 * a conventional radio-button. Any sibling `CdkMenuItemRadio` instances within the same `CdkMenu`
 * or `CdkMenuGroup` comprise a radio group with unique selection enforced.
 */
export class CdkMenuItemRadio extends CdkMenuItemSelectable {
    constructor(
    /** The host element for this radio item. */
    element, 
    /** The Angular zone. */
    ngZone, 
    /** The unique selection dispatcher for this radio's `CdkMenuGroup`. */
    _selectionDispatcher, 
    /** The menu stack this item belongs to. */
    menuStack, 
    /** The parent menu for this item. */
    parentMenu, 
    /** The menu aim used for this item. */
    menuAim, 
    /** The directionality of the page. */
    dir, 
    /** Reference to the CdkMenuItemTrigger directive if one is added to the same element */
    // tslint:disable-next-line: lightweight-tokens
    menuTrigger) {
        super(element, ngZone, menuStack, parentMenu, menuAim, dir, menuTrigger);
        this._selectionDispatcher = _selectionDispatcher;
        /** An ID to identify this radio item to the `UniqueSelectionDisptcher`. */
        this._id = `${nextId++}`;
        this._registerDispatcherListener();
    }
    ngOnDestroy() {
        super.ngOnDestroy();
        this._removeDispatcherListener();
    }
    /**
     * Toggles the checked state of the radio-button.
     * @param options Options the configure how the item is triggered
     *   - keepOpen: specifies that the menu should be kept open after triggering the item.
     */
    trigger(options) {
        super.trigger(options);
        if (!this.disabled) {
            this._selectionDispatcher.notify(this._id, '');
        }
    }
    /** Configure the unique selection dispatcher listener in order to toggle the checked state  */
    _registerDispatcherListener() {
        this._removeDispatcherListener = this._selectionDispatcher.listen((id) => {
            this.checked = this._id === id;
        });
    }
}
CdkMenuItemRadio.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.0.0-next.14", ngImport: i0, type: CdkMenuItemRadio, deps: [{ token: i0.ElementRef }, { token: i0.NgZone }, { token: i1.UniqueSelectionDispatcher }, { token: MENU_STACK }, { token: CDK_MENU, optional: true }, { token: MENU_AIM, optional: true }, { token: i2.Directionality, optional: true }, { token: i3.CdkMenuTrigger, optional: true, self: true }], target: i0.ɵɵFactoryTarget.Directive });
CdkMenuItemRadio.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "14.0.0-next.14", type: CdkMenuItemRadio, selector: "[cdkMenuItemRadio]", host: { attributes: { "role": "menuitemradio" } }, providers: [
        { provide: CdkMenuItemSelectable, useExisting: CdkMenuItemRadio },
        { provide: CdkMenuItem, useExisting: CdkMenuItemSelectable },
    ], exportAs: ["cdkMenuItemRadio"], usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.0.0-next.14", ngImport: i0, type: CdkMenuItemRadio, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkMenuItemRadio]',
                    exportAs: 'cdkMenuItemRadio',
                    host: {
                        'role': 'menuitemradio',
                    },
                    providers: [
                        { provide: CdkMenuItemSelectable, useExisting: CdkMenuItemRadio },
                        { provide: CdkMenuItem, useExisting: CdkMenuItemSelectable },
                    ],
                }]
        }], ctorParameters: function () { return [{ type: i0.ElementRef }, { type: i0.NgZone }, { type: i1.UniqueSelectionDispatcher }, { type: i4.MenuStack, decorators: [{
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
                }] }, { type: i2.Directionality, decorators: [{
                    type: Optional
                }] }, { type: i3.CdkMenuTrigger, decorators: [{
                    type: Self
                }, {
                    type: Optional
                }] }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1pdGVtLXJhZGlvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvbWVudS9tZW51LWl0ZW0tcmFkaW8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLHlCQUF5QixFQUFDLE1BQU0sMEJBQTBCLENBQUM7QUFDbkUsT0FBTyxFQUFDLFNBQVMsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBYSxRQUFRLEVBQUUsSUFBSSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQy9GLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUNqRCxPQUFPLEVBQUMscUJBQXFCLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQztBQUM3RCxPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0sYUFBYSxDQUFDO0FBQ3hDLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUM5QyxPQUFPLEVBQUMsUUFBUSxFQUFPLE1BQU0sa0JBQWtCLENBQUM7QUFDaEQsT0FBTyxFQUFDLFFBQVEsRUFBVSxNQUFNLFlBQVksQ0FBQztBQUM3QyxPQUFPLEVBQUMsVUFBVSxFQUFFLFNBQVMsRUFBQyxNQUFNLGNBQWMsQ0FBQzs7Ozs7O0FBRW5ELHFFQUFxRTtBQUNyRSxJQUFJLE1BQU0sR0FBRyxDQUFDLENBQUM7QUFFZjs7OztHQUlHO0FBWUgsTUFBTSxPQUFPLGdCQUFpQixTQUFRLHFCQUFxQjtJQU96RDtJQUNFLDRDQUE0QztJQUM1QyxPQUFnQztJQUNoQyx3QkFBd0I7SUFDeEIsTUFBYztJQUNkLHVFQUF1RTtJQUN0RCxvQkFBK0M7SUFDaEUsMkNBQTJDO0lBQ3ZCLFNBQW9CO0lBQ3hDLHFDQUFxQztJQUNQLFVBQWlCO0lBQy9DLHVDQUF1QztJQUNULE9BQWlCO0lBQy9DLHNDQUFzQztJQUMxQixHQUFvQjtJQUNoQyx3RkFBd0Y7SUFDeEYsK0NBQStDO0lBQzNCLFdBQTRCO1FBRWhELEtBQUssQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFFLEdBQUcsRUFBRSxXQUFXLENBQUMsQ0FBQztRQWJ4RCx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQTJCO1FBWmxFLDJFQUEyRTtRQUNuRSxRQUFHLEdBQUcsR0FBRyxNQUFNLEVBQUUsRUFBRSxDQUFDO1FBMEIxQixJQUFJLENBQUMsMkJBQTJCLEVBQUUsQ0FBQztJQUNyQyxDQUFDO0lBRVEsV0FBVztRQUNsQixLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7UUFFcEIsSUFBSSxDQUFDLHlCQUF5QixFQUFFLENBQUM7SUFDbkMsQ0FBQztJQUVEOzs7O09BSUc7SUFDTSxPQUFPLENBQUMsT0FBNkI7UUFDNUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUV2QixJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNsQixJQUFJLENBQUMsb0JBQW9CLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUM7U0FDaEQ7SUFDSCxDQUFDO0lBRUQsK0ZBQStGO0lBQ3ZGLDJCQUEyQjtRQUNqQyxJQUFJLENBQUMseUJBQXlCLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQVUsRUFBRSxFQUFFO1lBQy9FLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsS0FBSyxFQUFFLENBQUM7UUFDakMsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDOztxSEF2RFUsZ0JBQWdCLDJHQWVqQixVQUFVLGFBRUUsUUFBUSw2QkFFUixRQUFRO3lHQW5CbkIsZ0JBQWdCLGdHQUxoQjtRQUNULEVBQUMsT0FBTyxFQUFFLHFCQUFxQixFQUFFLFdBQVcsRUFBRSxnQkFBZ0IsRUFBQztRQUMvRCxFQUFDLE9BQU8sRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLHFCQUFxQixFQUFDO0tBQzNEO21HQUVVLGdCQUFnQjtrQkFYNUIsU0FBUzttQkFBQztvQkFDVCxRQUFRLEVBQUUsb0JBQW9CO29CQUM5QixRQUFRLEVBQUUsa0JBQWtCO29CQUM1QixJQUFJLEVBQUU7d0JBQ0osTUFBTSxFQUFFLGVBQWU7cUJBQ3hCO29CQUNELFNBQVMsRUFBRTt3QkFDVCxFQUFDLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxXQUFXLGtCQUFrQixFQUFDO3dCQUMvRCxFQUFDLE9BQU8sRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLHFCQUFxQixFQUFDO3FCQUMzRDtpQkFDRjs7MEJBZ0JJLE1BQU07MkJBQUMsVUFBVTs7MEJBRWpCLFFBQVE7OzBCQUFJLE1BQU07MkJBQUMsUUFBUTs7MEJBRTNCLFFBQVE7OzBCQUFJLE1BQU07MkJBQUMsUUFBUTs7MEJBRTNCLFFBQVE7OzBCQUdSLElBQUk7OzBCQUFJLFFBQVEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtVbmlxdWVTZWxlY3Rpb25EaXNwYXRjaGVyfSBmcm9tICdAYW5ndWxhci9jZGsvY29sbGVjdGlvbnMnO1xuaW1wb3J0IHtEaXJlY3RpdmUsIEVsZW1lbnRSZWYsIEluamVjdCwgTmdab25lLCBPbkRlc3Ryb3ksIE9wdGlvbmFsLCBTZWxmfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7RGlyZWN0aW9uYWxpdHl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9iaWRpJztcbmltcG9ydCB7Q2RrTWVudUl0ZW1TZWxlY3RhYmxlfSBmcm9tICcuL21lbnUtaXRlbS1zZWxlY3RhYmxlJztcbmltcG9ydCB7Q2RrTWVudUl0ZW19IGZyb20gJy4vbWVudS1pdGVtJztcbmltcG9ydCB7Q2RrTWVudVRyaWdnZXJ9IGZyb20gJy4vbWVudS10cmlnZ2VyJztcbmltcG9ydCB7Q0RLX01FTlUsIE1lbnV9IGZyb20gJy4vbWVudS1pbnRlcmZhY2UnO1xuaW1wb3J0IHtNRU5VX0FJTSwgTWVudUFpbX0gZnJvbSAnLi9tZW51LWFpbSc7XG5pbXBvcnQge01FTlVfU1RBQ0ssIE1lbnVTdGFja30gZnJvbSAnLi9tZW51LXN0YWNrJztcblxuLyoqIENvdW50ZXIgdXNlZCB0byBzZXQgYSB1bmlxdWUgaWQgYW5kIG5hbWUgZm9yIGEgc2VsZWN0YWJsZSBpdGVtICovXG5sZXQgbmV4dElkID0gMDtcblxuLyoqXG4gKiBBIGRpcmVjdGl2ZSBwcm92aWRpbmcgYmVoYXZpb3IgZm9yIHRoZSBcIm1lbnVpdGVtcmFkaW9cIiBBUklBIHJvbGUsIHdoaWNoIGJlaGF2ZXMgc2ltaWxhcmx5IHRvXG4gKiBhIGNvbnZlbnRpb25hbCByYWRpby1idXR0b24uIEFueSBzaWJsaW5nIGBDZGtNZW51SXRlbVJhZGlvYCBpbnN0YW5jZXMgd2l0aGluIHRoZSBzYW1lIGBDZGtNZW51YFxuICogb3IgYENka01lbnVHcm91cGAgY29tcHJpc2UgYSByYWRpbyBncm91cCB3aXRoIHVuaXF1ZSBzZWxlY3Rpb24gZW5mb3JjZWQuXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tjZGtNZW51SXRlbVJhZGlvXScsXG4gIGV4cG9ydEFzOiAnY2RrTWVudUl0ZW1SYWRpbycsXG4gIGhvc3Q6IHtcbiAgICAncm9sZSc6ICdtZW51aXRlbXJhZGlvJyxcbiAgfSxcbiAgcHJvdmlkZXJzOiBbXG4gICAge3Byb3ZpZGU6IENka01lbnVJdGVtU2VsZWN0YWJsZSwgdXNlRXhpc3Rpbmc6IENka01lbnVJdGVtUmFkaW99LFxuICAgIHtwcm92aWRlOiBDZGtNZW51SXRlbSwgdXNlRXhpc3Rpbmc6IENka01lbnVJdGVtU2VsZWN0YWJsZX0sXG4gIF0sXG59KVxuZXhwb3J0IGNsYXNzIENka01lbnVJdGVtUmFkaW8gZXh0ZW5kcyBDZGtNZW51SXRlbVNlbGVjdGFibGUgaW1wbGVtZW50cyBPbkRlc3Ryb3kge1xuICAvKiogQW4gSUQgdG8gaWRlbnRpZnkgdGhpcyByYWRpbyBpdGVtIHRvIHRoZSBgVW5pcXVlU2VsZWN0aW9uRGlzcHRjaGVyYC4gKi9cbiAgcHJpdmF0ZSBfaWQgPSBgJHtuZXh0SWQrK31gO1xuXG4gIC8qKiBGdW5jdGlvbiB0byB1bnJlZ2lzdGVyIHRoZSBzZWxlY3Rpb24gZGlzcGF0Y2hlciAqL1xuICBwcml2YXRlIF9yZW1vdmVEaXNwYXRjaGVyTGlzdGVuZXI6ICgpID0+IHZvaWQ7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgLyoqIFRoZSBob3N0IGVsZW1lbnQgZm9yIHRoaXMgcmFkaW8gaXRlbS4gKi9cbiAgICBlbGVtZW50OiBFbGVtZW50UmVmPEhUTUxFbGVtZW50PixcbiAgICAvKiogVGhlIEFuZ3VsYXIgem9uZS4gKi9cbiAgICBuZ1pvbmU6IE5nWm9uZSxcbiAgICAvKiogVGhlIHVuaXF1ZSBzZWxlY3Rpb24gZGlzcGF0Y2hlciBmb3IgdGhpcyByYWRpbydzIGBDZGtNZW51R3JvdXBgLiAqL1xuICAgIHByaXZhdGUgcmVhZG9ubHkgX3NlbGVjdGlvbkRpc3BhdGNoZXI6IFVuaXF1ZVNlbGVjdGlvbkRpc3BhdGNoZXIsXG4gICAgLyoqIFRoZSBtZW51IHN0YWNrIHRoaXMgaXRlbSBiZWxvbmdzIHRvLiAqL1xuICAgIEBJbmplY3QoTUVOVV9TVEFDSykgbWVudVN0YWNrOiBNZW51U3RhY2ssXG4gICAgLyoqIFRoZSBwYXJlbnQgbWVudSBmb3IgdGhpcyBpdGVtLiAqL1xuICAgIEBPcHRpb25hbCgpIEBJbmplY3QoQ0RLX01FTlUpIHBhcmVudE1lbnU/OiBNZW51LFxuICAgIC8qKiBUaGUgbWVudSBhaW0gdXNlZCBmb3IgdGhpcyBpdGVtLiAqL1xuICAgIEBPcHRpb25hbCgpIEBJbmplY3QoTUVOVV9BSU0pIG1lbnVBaW0/OiBNZW51QWltLFxuICAgIC8qKiBUaGUgZGlyZWN0aW9uYWxpdHkgb2YgdGhlIHBhZ2UuICovXG4gICAgQE9wdGlvbmFsKCkgZGlyPzogRGlyZWN0aW9uYWxpdHksXG4gICAgLyoqIFJlZmVyZW5jZSB0byB0aGUgQ2RrTWVudUl0ZW1UcmlnZ2VyIGRpcmVjdGl2ZSBpZiBvbmUgaXMgYWRkZWQgdG8gdGhlIHNhbWUgZWxlbWVudCAqL1xuICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTogbGlnaHR3ZWlnaHQtdG9rZW5zXG4gICAgQFNlbGYoKSBAT3B0aW9uYWwoKSBtZW51VHJpZ2dlcj86IENka01lbnVUcmlnZ2VyLFxuICApIHtcbiAgICBzdXBlcihlbGVtZW50LCBuZ1pvbmUsIG1lbnVTdGFjaywgcGFyZW50TWVudSwgbWVudUFpbSwgZGlyLCBtZW51VHJpZ2dlcik7XG5cbiAgICB0aGlzLl9yZWdpc3RlckRpc3BhdGNoZXJMaXN0ZW5lcigpO1xuICB9XG5cbiAgb3ZlcnJpZGUgbmdPbkRlc3Ryb3koKSB7XG4gICAgc3VwZXIubmdPbkRlc3Ryb3koKTtcblxuICAgIHRoaXMuX3JlbW92ZURpc3BhdGNoZXJMaXN0ZW5lcigpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRvZ2dsZXMgdGhlIGNoZWNrZWQgc3RhdGUgb2YgdGhlIHJhZGlvLWJ1dHRvbi5cbiAgICogQHBhcmFtIG9wdGlvbnMgT3B0aW9ucyB0aGUgY29uZmlndXJlIGhvdyB0aGUgaXRlbSBpcyB0cmlnZ2VyZWRcbiAgICogICAtIGtlZXBPcGVuOiBzcGVjaWZpZXMgdGhhdCB0aGUgbWVudSBzaG91bGQgYmUga2VwdCBvcGVuIGFmdGVyIHRyaWdnZXJpbmcgdGhlIGl0ZW0uXG4gICAqL1xuICBvdmVycmlkZSB0cmlnZ2VyKG9wdGlvbnM/OiB7a2VlcE9wZW46IGJvb2xlYW59KSB7XG4gICAgc3VwZXIudHJpZ2dlcihvcHRpb25zKTtcblxuICAgIGlmICghdGhpcy5kaXNhYmxlZCkge1xuICAgICAgdGhpcy5fc2VsZWN0aW9uRGlzcGF0Y2hlci5ub3RpZnkodGhpcy5faWQsICcnKTtcbiAgICB9XG4gIH1cblxuICAvKiogQ29uZmlndXJlIHRoZSB1bmlxdWUgc2VsZWN0aW9uIGRpc3BhdGNoZXIgbGlzdGVuZXIgaW4gb3JkZXIgdG8gdG9nZ2xlIHRoZSBjaGVja2VkIHN0YXRlICAqL1xuICBwcml2YXRlIF9yZWdpc3RlckRpc3BhdGNoZXJMaXN0ZW5lcigpIHtcbiAgICB0aGlzLl9yZW1vdmVEaXNwYXRjaGVyTGlzdGVuZXIgPSB0aGlzLl9zZWxlY3Rpb25EaXNwYXRjaGVyLmxpc3RlbigoaWQ6IHN0cmluZykgPT4ge1xuICAgICAgdGhpcy5jaGVja2VkID0gdGhpcy5faWQgPT09IGlkO1xuICAgIH0pO1xuICB9XG59XG4iXX0=