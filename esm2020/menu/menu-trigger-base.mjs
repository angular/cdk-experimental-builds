/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, EventEmitter, Inject, InjectionToken, Injector, ViewContainerRef, } from '@angular/core';
import { MENU_STACK, MenuStack } from './menu-stack';
import { TemplatePortal } from '@angular/cdk/portal';
import { merge, Subject } from 'rxjs';
import * as i0 from "@angular/core";
import * as i1 from "./menu-stack";
/** Injection token used for an implementation of MenuStack. */
export const MENU_TRIGGER = new InjectionToken('cdk-menu-trigger');
/**
 * Abstract directive that implements shared logic common to all menu triggers.
 * This class can be extended to create custom menu trigger types.
 */
export class CdkMenuTriggerBase {
    constructor(
    /** The DI injector for this component */
    injector, 
    /** The view container ref for this component */
    viewContainerRef, 
    /** The menu stack this menu is part of. */
    menuStack) {
        this.injector = injector;
        this.viewContainerRef = viewContainerRef;
        this.menuStack = menuStack;
        /** Emits when the attached menu is requested to open */
        this.opened = new EventEmitter();
        /** Emits when the attached menu is requested to close */
        this.closed = new EventEmitter();
        /** A reference to the overlay which manages the triggered menu */
        this.overlayRef = null;
        /** Emits when this trigger is destroyed. */
        this.destroyed = new Subject();
        /** Emits when the outside pointer events listener on the overlay should be stopped. */
        this.stopOutsideClicksListener = merge(this.closed, this.destroyed);
    }
    ngOnDestroy() {
        this._destroyOverlay();
        this.destroyed.next();
        this.destroyed.complete();
    }
    /** Whether the attached menu is open. */
    isOpen() {
        return !!this.overlayRef?.hasAttached();
    }
    /** Registers a child menu as having been opened by this trigger. */
    registerChildMenu(child) {
        this.childMenu = child;
    }
    /**
     * Get the portal to be attached to the overlay which contains the menu. Allows for the menu
     * content to change dynamically and be reflected in the application.
     */
    getMenuContentPortal() {
        const hasMenuContentChanged = this.menuTemplateRef !== this._menuPortal?.templateRef;
        if (this.menuTemplateRef && (!this._menuPortal || hasMenuContentChanged)) {
            this._menuPortal = new TemplatePortal(this.menuTemplateRef, this.viewContainerRef, undefined, this._getChildMenuInjector());
        }
        return this._menuPortal;
    }
    /**
     * Whether the given element is inside the scope of this trigger's menu stack.
     * @param element The element to check.
     * @return Whether the element is inside the scope of this trigger's menu stack.
     */
    isElementInsideMenuStack(element) {
        for (let el = element; el; el = el?.parentElement ?? null) {
            if (el.getAttribute('data-cdk-menu-stack-id') === this.menuStack.id) {
                return true;
            }
        }
        return false;
    }
    /** Destroy and unset the overlay reference it if exists */
    _destroyOverlay() {
        if (this.overlayRef) {
            this.overlayRef.dispose();
            this.overlayRef = null;
        }
    }
    /** Gets the injector to use when creating a child menu. */
    _getChildMenuInjector() {
        this._childMenuInjector =
            this._childMenuInjector ||
                Injector.create({
                    providers: [
                        { provide: MENU_TRIGGER, useValue: this },
                        { provide: MENU_STACK, useValue: this.menuStack },
                    ],
                    parent: this.injector,
                });
        return this._childMenuInjector;
    }
}
CdkMenuTriggerBase.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.0.0-next.13", ngImport: i0, type: CdkMenuTriggerBase, deps: [{ token: i0.Injector }, { token: i0.ViewContainerRef }, { token: MENU_STACK }], target: i0.ɵɵFactoryTarget.Directive });
CdkMenuTriggerBase.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "14.0.0-next.13", type: CdkMenuTriggerBase, host: { properties: { "attr.aria-controls": "childMenu?.id", "attr.data-cdk-menu-stack-id": "menuStack.id" } }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.0.0-next.13", ngImport: i0, type: CdkMenuTriggerBase, decorators: [{
            type: Directive,
            args: [{
                    host: {
                        '[attr.aria-controls]': 'childMenu?.id',
                        '[attr.data-cdk-menu-stack-id]': 'menuStack.id',
                    },
                }]
        }], ctorParameters: function () { return [{ type: i0.Injector }, { type: i0.ViewContainerRef }, { type: i1.MenuStack, decorators: [{
                    type: Inject,
                    args: [MENU_STACK]
                }] }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS10cmlnZ2VyLWJhc2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrLWV4cGVyaW1lbnRhbC9tZW51L21lbnUtdHJpZ2dlci1iYXNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFDTCxTQUFTLEVBQ1QsWUFBWSxFQUNaLE1BQU0sRUFDTixjQUFjLEVBQ2QsUUFBUSxFQUdSLGdCQUFnQixHQUNqQixNQUFNLGVBQWUsQ0FBQztBQUV2QixPQUFPLEVBQUMsVUFBVSxFQUFFLFNBQVMsRUFBQyxNQUFNLGNBQWMsQ0FBQztBQUVuRCxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDbkQsT0FBTyxFQUFDLEtBQUssRUFBRSxPQUFPLEVBQUMsTUFBTSxNQUFNLENBQUM7OztBQUVwQywrREFBK0Q7QUFDL0QsTUFBTSxDQUFDLE1BQU0sWUFBWSxHQUFHLElBQUksY0FBYyxDQUFxQixrQkFBa0IsQ0FBQyxDQUFDO0FBRXZGOzs7R0FHRztBQU9ILE1BQU0sT0FBZ0Isa0JBQWtCO0lBK0J0QztJQUNFLHlDQUF5QztJQUN0QixRQUFrQjtJQUNyQyxnREFBZ0Q7SUFDN0IsZ0JBQWtDO0lBQ3JELDJDQUEyQztJQUNKLFNBQW9CO1FBSnhDLGFBQVEsR0FBUixRQUFRLENBQVU7UUFFbEIscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtRQUVkLGNBQVMsR0FBVCxTQUFTLENBQVc7UUFqQzdELHdEQUF3RDtRQUMvQyxXQUFNLEdBQXVCLElBQUksWUFBWSxFQUFFLENBQUM7UUFFekQseURBQXlEO1FBQ2hELFdBQU0sR0FBdUIsSUFBSSxZQUFZLEVBQUUsQ0FBQztRQUt6RCxrRUFBa0U7UUFDeEQsZUFBVSxHQUFzQixJQUFJLENBQUM7UUFFL0MsNENBQTRDO1FBQ3pCLGNBQVMsR0FBa0IsSUFBSSxPQUFPLEVBQUUsQ0FBQztRQUU1RCx1RkFBdUY7UUFDcEUsOEJBQXlCLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBa0IvRSxDQUFDO0lBRUosV0FBVztRQUNULElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUV2QixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3RCLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDNUIsQ0FBQztJQUVELHlDQUF5QztJQUN6QyxNQUFNO1FBQ0osT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxXQUFXLEVBQUUsQ0FBQztJQUMxQyxDQUFDO0lBRUQsb0VBQW9FO0lBQ3BFLGlCQUFpQixDQUFDLEtBQVc7UUFDM0IsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7SUFDekIsQ0FBQztJQUVEOzs7T0FHRztJQUNPLG9CQUFvQjtRQUM1QixNQUFNLHFCQUFxQixHQUFHLElBQUksQ0FBQyxlQUFlLEtBQUssSUFBSSxDQUFDLFdBQVcsRUFBRSxXQUFXLENBQUM7UUFDckYsSUFBSSxJQUFJLENBQUMsZUFBZSxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxJQUFJLHFCQUFxQixDQUFDLEVBQUU7WUFDeEUsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLGNBQWMsQ0FDbkMsSUFBSSxDQUFDLGVBQWUsRUFDcEIsSUFBSSxDQUFDLGdCQUFnQixFQUNyQixTQUFTLEVBQ1QsSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQzdCLENBQUM7U0FDSDtRQUVELE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQztJQUMxQixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNPLHdCQUF3QixDQUFDLE9BQWdCO1FBQ2pELEtBQUssSUFBSSxFQUFFLEdBQW1CLE9BQU8sRUFBRSxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxhQUFhLElBQUksSUFBSSxFQUFFO1lBQ3pFLElBQUksRUFBRSxDQUFDLFlBQVksQ0FBQyx3QkFBd0IsQ0FBQyxLQUFLLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxFQUFFO2dCQUNuRSxPQUFPLElBQUksQ0FBQzthQUNiO1NBQ0Y7UUFDRCxPQUFPLEtBQUssQ0FBQztJQUNmLENBQUM7SUFFRCwyREFBMkQ7SUFDbkQsZUFBZTtRQUNyQixJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUU7WUFDbkIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUMxQixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztTQUN4QjtJQUNILENBQUM7SUFFRCwyREFBMkQ7SUFDbkQscUJBQXFCO1FBQzNCLElBQUksQ0FBQyxrQkFBa0I7WUFDckIsSUFBSSxDQUFDLGtCQUFrQjtnQkFDdkIsUUFBUSxDQUFDLE1BQU0sQ0FBQztvQkFDZCxTQUFTLEVBQUU7d0JBQ1QsRUFBQyxPQUFPLEVBQUUsWUFBWSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUM7d0JBQ3ZDLEVBQUMsT0FBTyxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVMsRUFBQztxQkFDaEQ7b0JBQ0QsTUFBTSxFQUFFLElBQUksQ0FBQyxRQUFRO2lCQUN0QixDQUFDLENBQUM7UUFDTCxPQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQztJQUNqQyxDQUFDOzt1SEE3R21CLGtCQUFrQiwwRUFxQzVCLFVBQVU7MkdBckNBLGtCQUFrQjttR0FBbEIsa0JBQWtCO2tCQU52QyxTQUFTO21CQUFDO29CQUNULElBQUksRUFBRTt3QkFDSixzQkFBc0IsRUFBRSxlQUFlO3dCQUN2QywrQkFBK0IsRUFBRSxjQUFjO3FCQUNoRDtpQkFDRjs7MEJBc0NJLE1BQU07MkJBQUMsVUFBVSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1xuICBEaXJlY3RpdmUsXG4gIEV2ZW50RW1pdHRlcixcbiAgSW5qZWN0LFxuICBJbmplY3Rpb25Ub2tlbixcbiAgSW5qZWN0b3IsXG4gIE9uRGVzdHJveSxcbiAgVGVtcGxhdGVSZWYsXG4gIFZpZXdDb250YWluZXJSZWYsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtNZW51fSBmcm9tICcuL21lbnUtaW50ZXJmYWNlJztcbmltcG9ydCB7TUVOVV9TVEFDSywgTWVudVN0YWNrfSBmcm9tICcuL21lbnUtc3RhY2snO1xuaW1wb3J0IHtDb25uZWN0ZWRQb3NpdGlvbiwgT3ZlcmxheVJlZn0gZnJvbSAnQGFuZ3VsYXIvY2RrL292ZXJsYXknO1xuaW1wb3J0IHtUZW1wbGF0ZVBvcnRhbH0gZnJvbSAnQGFuZ3VsYXIvY2RrL3BvcnRhbCc7XG5pbXBvcnQge21lcmdlLCBTdWJqZWN0fSBmcm9tICdyeGpzJztcblxuLyoqIEluamVjdGlvbiB0b2tlbiB1c2VkIGZvciBhbiBpbXBsZW1lbnRhdGlvbiBvZiBNZW51U3RhY2suICovXG5leHBvcnQgY29uc3QgTUVOVV9UUklHR0VSID0gbmV3IEluamVjdGlvblRva2VuPENka01lbnVUcmlnZ2VyQmFzZT4oJ2Nkay1tZW51LXRyaWdnZXInKTtcblxuLyoqXG4gKiBBYnN0cmFjdCBkaXJlY3RpdmUgdGhhdCBpbXBsZW1lbnRzIHNoYXJlZCBsb2dpYyBjb21tb24gdG8gYWxsIG1lbnUgdHJpZ2dlcnMuXG4gKiBUaGlzIGNsYXNzIGNhbiBiZSBleHRlbmRlZCB0byBjcmVhdGUgY3VzdG9tIG1lbnUgdHJpZ2dlciB0eXBlcy5cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIGhvc3Q6IHtcbiAgICAnW2F0dHIuYXJpYS1jb250cm9sc10nOiAnY2hpbGRNZW51Py5pZCcsXG4gICAgJ1thdHRyLmRhdGEtY2RrLW1lbnUtc3RhY2staWRdJzogJ21lbnVTdGFjay5pZCcsXG4gIH0sXG59KVxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIENka01lbnVUcmlnZ2VyQmFzZSBpbXBsZW1lbnRzIE9uRGVzdHJveSB7XG4gIC8qKiBBIGxpc3Qgb2YgcHJlZmVycmVkIG1lbnUgcG9zaXRpb25zIHRvIGJlIHVzZWQgd2hlbiBjb25zdHJ1Y3RpbmcgdGhlIGBGbGV4aWJsZUNvbm5lY3RlZFBvc2l0aW9uU3RyYXRlZ3lgIGZvciB0aGlzIHRyaWdnZXIncyBtZW51LiAqL1xuICBtZW51UG9zaXRpb246IENvbm5lY3RlZFBvc2l0aW9uW107XG5cbiAgLyoqIEVtaXRzIHdoZW4gdGhlIGF0dGFjaGVkIG1lbnUgaXMgcmVxdWVzdGVkIHRvIG9wZW4gKi9cbiAgcmVhZG9ubHkgb3BlbmVkOiBFdmVudEVtaXR0ZXI8dm9pZD4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG5cbiAgLyoqIEVtaXRzIHdoZW4gdGhlIGF0dGFjaGVkIG1lbnUgaXMgcmVxdWVzdGVkIHRvIGNsb3NlICovXG4gIHJlYWRvbmx5IGNsb3NlZDogRXZlbnRFbWl0dGVyPHZvaWQ+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4gIC8qKiBUZW1wbGF0ZSByZWZlcmVuY2UgdmFyaWFibGUgdG8gdGhlIG1lbnUgdGhpcyB0cmlnZ2VyIG9wZW5zICovXG4gIG1lbnVUZW1wbGF0ZVJlZjogVGVtcGxhdGVSZWY8dW5rbm93bj47XG5cbiAgLyoqIEEgcmVmZXJlbmNlIHRvIHRoZSBvdmVybGF5IHdoaWNoIG1hbmFnZXMgdGhlIHRyaWdnZXJlZCBtZW51ICovXG4gIHByb3RlY3RlZCBvdmVybGF5UmVmOiBPdmVybGF5UmVmIHwgbnVsbCA9IG51bGw7XG5cbiAgLyoqIEVtaXRzIHdoZW4gdGhpcyB0cmlnZ2VyIGlzIGRlc3Ryb3llZC4gKi9cbiAgcHJvdGVjdGVkIHJlYWRvbmx5IGRlc3Ryb3llZDogU3ViamVjdDx2b2lkPiA9IG5ldyBTdWJqZWN0KCk7XG5cbiAgLyoqIEVtaXRzIHdoZW4gdGhlIG91dHNpZGUgcG9pbnRlciBldmVudHMgbGlzdGVuZXIgb24gdGhlIG92ZXJsYXkgc2hvdWxkIGJlIHN0b3BwZWQuICovXG4gIHByb3RlY3RlZCByZWFkb25seSBzdG9wT3V0c2lkZUNsaWNrc0xpc3RlbmVyID0gbWVyZ2UodGhpcy5jbG9zZWQsIHRoaXMuZGVzdHJveWVkKTtcblxuICAvKiogVGhlIGNoaWxkIG1lbnUgb3BlbmVkIGJ5IHRoaXMgdHJpZ2dlci4gKi9cbiAgcHJvdGVjdGVkIGNoaWxkTWVudT86IE1lbnU7XG5cbiAgLyoqIFRoZSBjb250ZW50IG9mIHRoZSBtZW51IHBhbmVsIG9wZW5lZCBieSB0aGlzIHRyaWdnZXIuICovXG4gIHByaXZhdGUgX21lbnVQb3J0YWw6IFRlbXBsYXRlUG9ydGFsO1xuXG4gIC8qKiBUaGUgaW5qZWN0b3IgdG8gdXNlIGZvciB0aGUgY2hpbGQgbWVudSBvcGVuZWQgYnkgdGhpcyB0cmlnZ2VyLiAqL1xuICBwcml2YXRlIF9jaGlsZE1lbnVJbmplY3Rvcj86IEluamVjdG9yO1xuXG4gIHByb3RlY3RlZCBjb25zdHJ1Y3RvcihcbiAgICAvKiogVGhlIERJIGluamVjdG9yIGZvciB0aGlzIGNvbXBvbmVudCAqL1xuICAgIHByb3RlY3RlZCByZWFkb25seSBpbmplY3RvcjogSW5qZWN0b3IsXG4gICAgLyoqIFRoZSB2aWV3IGNvbnRhaW5lciByZWYgZm9yIHRoaXMgY29tcG9uZW50ICovXG4gICAgcHJvdGVjdGVkIHJlYWRvbmx5IHZpZXdDb250YWluZXJSZWY6IFZpZXdDb250YWluZXJSZWYsXG4gICAgLyoqIFRoZSBtZW51IHN0YWNrIHRoaXMgbWVudSBpcyBwYXJ0IG9mLiAqL1xuICAgIEBJbmplY3QoTUVOVV9TVEFDSykgcHJvdGVjdGVkIHJlYWRvbmx5IG1lbnVTdGFjazogTWVudVN0YWNrLFxuICApIHt9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgdGhpcy5fZGVzdHJveU92ZXJsYXkoKTtcblxuICAgIHRoaXMuZGVzdHJveWVkLm5leHQoKTtcbiAgICB0aGlzLmRlc3Ryb3llZC5jb21wbGV0ZSgpO1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGF0dGFjaGVkIG1lbnUgaXMgb3Blbi4gKi9cbiAgaXNPcGVuKCkge1xuICAgIHJldHVybiAhIXRoaXMub3ZlcmxheVJlZj8uaGFzQXR0YWNoZWQoKTtcbiAgfVxuXG4gIC8qKiBSZWdpc3RlcnMgYSBjaGlsZCBtZW51IGFzIGhhdmluZyBiZWVuIG9wZW5lZCBieSB0aGlzIHRyaWdnZXIuICovXG4gIHJlZ2lzdGVyQ2hpbGRNZW51KGNoaWxkOiBNZW51KSB7XG4gICAgdGhpcy5jaGlsZE1lbnUgPSBjaGlsZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIHBvcnRhbCB0byBiZSBhdHRhY2hlZCB0byB0aGUgb3ZlcmxheSB3aGljaCBjb250YWlucyB0aGUgbWVudS4gQWxsb3dzIGZvciB0aGUgbWVudVxuICAgKiBjb250ZW50IHRvIGNoYW5nZSBkeW5hbWljYWxseSBhbmQgYmUgcmVmbGVjdGVkIGluIHRoZSBhcHBsaWNhdGlvbi5cbiAgICovXG4gIHByb3RlY3RlZCBnZXRNZW51Q29udGVudFBvcnRhbCgpIHtcbiAgICBjb25zdCBoYXNNZW51Q29udGVudENoYW5nZWQgPSB0aGlzLm1lbnVUZW1wbGF0ZVJlZiAhPT0gdGhpcy5fbWVudVBvcnRhbD8udGVtcGxhdGVSZWY7XG4gICAgaWYgKHRoaXMubWVudVRlbXBsYXRlUmVmICYmICghdGhpcy5fbWVudVBvcnRhbCB8fCBoYXNNZW51Q29udGVudENoYW5nZWQpKSB7XG4gICAgICB0aGlzLl9tZW51UG9ydGFsID0gbmV3IFRlbXBsYXRlUG9ydGFsKFxuICAgICAgICB0aGlzLm1lbnVUZW1wbGF0ZVJlZixcbiAgICAgICAgdGhpcy52aWV3Q29udGFpbmVyUmVmLFxuICAgICAgICB1bmRlZmluZWQsXG4gICAgICAgIHRoaXMuX2dldENoaWxkTWVudUluamVjdG9yKCksXG4gICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9tZW51UG9ydGFsO1xuICB9XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhlIGdpdmVuIGVsZW1lbnQgaXMgaW5zaWRlIHRoZSBzY29wZSBvZiB0aGlzIHRyaWdnZXIncyBtZW51IHN0YWNrLlxuICAgKiBAcGFyYW0gZWxlbWVudCBUaGUgZWxlbWVudCB0byBjaGVjay5cbiAgICogQHJldHVybiBXaGV0aGVyIHRoZSBlbGVtZW50IGlzIGluc2lkZSB0aGUgc2NvcGUgb2YgdGhpcyB0cmlnZ2VyJ3MgbWVudSBzdGFjay5cbiAgICovXG4gIHByb3RlY3RlZCBpc0VsZW1lbnRJbnNpZGVNZW51U3RhY2soZWxlbWVudDogRWxlbWVudCkge1xuICAgIGZvciAobGV0IGVsOiBFbGVtZW50IHwgbnVsbCA9IGVsZW1lbnQ7IGVsOyBlbCA9IGVsPy5wYXJlbnRFbGVtZW50ID8/IG51bGwpIHtcbiAgICAgIGlmIChlbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtY2RrLW1lbnUtc3RhY2staWQnKSA9PT0gdGhpcy5tZW51U3RhY2suaWQpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKiBEZXN0cm95IGFuZCB1bnNldCB0aGUgb3ZlcmxheSByZWZlcmVuY2UgaXQgaWYgZXhpc3RzICovXG4gIHByaXZhdGUgX2Rlc3Ryb3lPdmVybGF5KCkge1xuICAgIGlmICh0aGlzLm92ZXJsYXlSZWYpIHtcbiAgICAgIHRoaXMub3ZlcmxheVJlZi5kaXNwb3NlKCk7XG4gICAgICB0aGlzLm92ZXJsYXlSZWYgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBpbmplY3RvciB0byB1c2Ugd2hlbiBjcmVhdGluZyBhIGNoaWxkIG1lbnUuICovXG4gIHByaXZhdGUgX2dldENoaWxkTWVudUluamVjdG9yKCkge1xuICAgIHRoaXMuX2NoaWxkTWVudUluamVjdG9yID1cbiAgICAgIHRoaXMuX2NoaWxkTWVudUluamVjdG9yIHx8XG4gICAgICBJbmplY3Rvci5jcmVhdGUoe1xuICAgICAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgICB7cHJvdmlkZTogTUVOVV9UUklHR0VSLCB1c2VWYWx1ZTogdGhpc30sXG4gICAgICAgICAge3Byb3ZpZGU6IE1FTlVfU1RBQ0ssIHVzZVZhbHVlOiB0aGlzLm1lbnVTdGFja30sXG4gICAgICAgIF0sXG4gICAgICAgIHBhcmVudDogdGhpcy5pbmplY3RvcixcbiAgICAgIH0pO1xuICAgIHJldHVybiB0aGlzLl9jaGlsZE1lbnVJbmplY3RvcjtcbiAgfVxufVxuIl19