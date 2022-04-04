/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, EventEmitter, Inject, InjectionToken, Injector, } from '@angular/core';
import { MENU_STACK, MenuStack } from './menu-stack';
import { merge, Subject } from 'rxjs';
import * as i0 from "@angular/core";
import * as i1 from "./menu-stack";
/** Injection token used for an implementation of MenuStack. */
export const MENU_TRIGGER = new InjectionToken('cdk-menu-trigger');
export class MenuTrigger {
    constructor(injector, menuStack) {
        this.injector = injector;
        this.menuStack = menuStack;
        /** Emits when the attached menu is requested to open */
        this.opened = new EventEmitter();
        /** Emits when the attached menu is requested to close */
        this.closed = new EventEmitter();
        /** A reference to the overlay which manages the triggered menu */
        this._overlayRef = null;
        /** Emits when this trigger is destroyed. */
        this._destroyed = new Subject();
        /** Emits when the outside pointer events listener on the overlay should be stopped. */
        this._stopOutsideClicksListener = merge(this.closed, this._destroyed);
    }
    ngOnDestroy() {
        this._destroyOverlay();
        this._destroyed.next();
        this._destroyed.complete();
    }
    /** Whether the attached menu is open. */
    isOpen() {
        return !!this._overlayRef?.hasAttached();
    }
    registerChildMenu(child) {
        this.childMenu = child;
    }
    getChildMenuInjector() {
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
    /** Destroy and unset the overlay reference it if exists */
    _destroyOverlay() {
        if (this._overlayRef) {
            this._overlayRef.dispose();
            this._overlayRef = null;
        }
    }
}
MenuTrigger.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.0.0-next.9", ngImport: i0, type: MenuTrigger, deps: [{ token: i0.Injector }, { token: MENU_STACK }], target: i0.ɵɵFactoryTarget.Directive });
MenuTrigger.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "14.0.0-next.9", type: MenuTrigger, host: { properties: { "attr.aria-controls": "childMenu?.id" } }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.0.0-next.9", ngImport: i0, type: MenuTrigger, decorators: [{
            type: Directive,
            args: [{
                    host: {
                        '[attr.aria-controls]': 'childMenu?.id',
                    },
                }]
        }], ctorParameters: function () { return [{ type: i0.Injector }, { type: i1.MenuStack, decorators: [{
                    type: Inject,
                    args: [MENU_STACK]
                }] }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS10cmlnZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvbWVudS9tZW51LXRyaWdnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUNMLFNBQVMsRUFDVCxZQUFZLEVBQ1osTUFBTSxFQUNOLGNBQWMsRUFDZCxRQUFRLEdBR1QsTUFBTSxlQUFlLENBQUM7QUFFdkIsT0FBTyxFQUFDLFVBQVUsRUFBRSxTQUFTLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFHbkQsT0FBTyxFQUFDLEtBQUssRUFBRSxPQUFPLEVBQUMsTUFBTSxNQUFNLENBQUM7OztBQUVwQywrREFBK0Q7QUFDL0QsTUFBTSxDQUFDLE1BQU0sWUFBWSxHQUFHLElBQUksY0FBYyxDQUFjLGtCQUFrQixDQUFDLENBQUM7QUFPaEYsTUFBTSxPQUFnQixXQUFXO0lBNkIvQixZQUNZLFFBQWtCLEVBQ0UsU0FBb0I7UUFEeEMsYUFBUSxHQUFSLFFBQVEsQ0FBVTtRQUNFLGNBQVMsR0FBVCxTQUFTLENBQVc7UUEzQnBELHdEQUF3RDtRQUMvQyxXQUFNLEdBQXVCLElBQUksWUFBWSxFQUFFLENBQUM7UUFFekQseURBQXlEO1FBQ2hELFdBQU0sR0FBdUIsSUFBSSxZQUFZLEVBQUUsQ0FBQztRQUt6RCxrRUFBa0U7UUFDeEQsZ0JBQVcsR0FBc0IsSUFBSSxDQUFDO1FBS2hELDRDQUE0QztRQUN6QixlQUFVLEdBQWtCLElBQUksT0FBTyxFQUFFLENBQUM7UUFFN0QsdUZBQXVGO1FBQ3BFLCtCQUEwQixHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztJQVNqRixDQUFDO0lBRUosV0FBVztRQUNULElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUV2QixJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDN0IsQ0FBQztJQUVELHlDQUF5QztJQUN6QyxNQUFNO1FBQ0osT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxXQUFXLEVBQUUsQ0FBQztJQUMzQyxDQUFDO0lBRUQsaUJBQWlCLENBQUMsS0FBVztRQUMzQixJQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztJQUN6QixDQUFDO0lBRVMsb0JBQW9CO1FBQzVCLElBQUksQ0FBQyxrQkFBa0I7WUFDckIsSUFBSSxDQUFDLGtCQUFrQjtnQkFDdkIsUUFBUSxDQUFDLE1BQU0sQ0FBQztvQkFDZCxTQUFTLEVBQUU7d0JBQ1QsRUFBQyxPQUFPLEVBQUUsWUFBWSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUM7d0JBQ3ZDLEVBQUMsT0FBTyxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVMsRUFBQztxQkFDaEQ7b0JBQ0QsTUFBTSxFQUFFLElBQUksQ0FBQyxRQUFRO2lCQUN0QixDQUFDLENBQUM7UUFDTCxPQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQztJQUNqQyxDQUFDO0lBRUQsMkRBQTJEO0lBQ25ELGVBQWU7UUFDckIsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFO1lBQ3BCLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDM0IsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7U0FDekI7SUFDSCxDQUFDOzsrR0FyRW1CLFdBQVcsMENBK0JyQixVQUFVO21HQS9CQSxXQUFXO2tHQUFYLFdBQVc7a0JBTGhDLFNBQVM7bUJBQUM7b0JBQ1QsSUFBSSxFQUFFO3dCQUNKLHNCQUFzQixFQUFFLGVBQWU7cUJBQ3hDO2lCQUNGOzswQkFnQ0ksTUFBTTsyQkFBQyxVQUFVIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7XG4gIERpcmVjdGl2ZSxcbiAgRXZlbnRFbWl0dGVyLFxuICBJbmplY3QsXG4gIEluamVjdGlvblRva2VuLFxuICBJbmplY3RvcixcbiAgT25EZXN0cm95LFxuICBUZW1wbGF0ZVJlZixcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge01lbnV9IGZyb20gJy4vbWVudS1pbnRlcmZhY2UnO1xuaW1wb3J0IHtNRU5VX1NUQUNLLCBNZW51U3RhY2t9IGZyb20gJy4vbWVudS1zdGFjayc7XG5pbXBvcnQge0Nvbm5lY3RlZFBvc2l0aW9uLCBPdmVybGF5UmVmfSBmcm9tICdAYW5ndWxhci9jZGsvb3ZlcmxheSc7XG5pbXBvcnQge1RlbXBsYXRlUG9ydGFsfSBmcm9tICdAYW5ndWxhci9jZGsvcG9ydGFsJztcbmltcG9ydCB7bWVyZ2UsIFN1YmplY3R9IGZyb20gJ3J4anMnO1xuXG4vKiogSW5qZWN0aW9uIHRva2VuIHVzZWQgZm9yIGFuIGltcGxlbWVudGF0aW9uIG9mIE1lbnVTdGFjay4gKi9cbmV4cG9ydCBjb25zdCBNRU5VX1RSSUdHRVIgPSBuZXcgSW5qZWN0aW9uVG9rZW48TWVudVRyaWdnZXI+KCdjZGstbWVudS10cmlnZ2VyJyk7XG5cbkBEaXJlY3RpdmUoe1xuICBob3N0OiB7XG4gICAgJ1thdHRyLmFyaWEtY29udHJvbHNdJzogJ2NoaWxkTWVudT8uaWQnLFxuICB9LFxufSlcbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBNZW51VHJpZ2dlciBpbXBsZW1lbnRzIE9uRGVzdHJveSB7XG4gIC8qKiBBIGxpc3Qgb2YgcHJlZmVycmVkIG1lbnUgcG9zaXRpb25zIHRvIGJlIHVzZWQgd2hlbiBjb25zdHJ1Y3RpbmcgdGhlIGBGbGV4aWJsZUNvbm5lY3RlZFBvc2l0aW9uU3RyYXRlZ3lgIGZvciB0aGlzIHRyaWdnZXIncyBtZW51LiAqL1xuICBtZW51UG9zaXRpb246IENvbm5lY3RlZFBvc2l0aW9uW107XG5cbiAgLyoqIEVtaXRzIHdoZW4gdGhlIGF0dGFjaGVkIG1lbnUgaXMgcmVxdWVzdGVkIHRvIG9wZW4gKi9cbiAgcmVhZG9ubHkgb3BlbmVkOiBFdmVudEVtaXR0ZXI8dm9pZD4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG5cbiAgLyoqIEVtaXRzIHdoZW4gdGhlIGF0dGFjaGVkIG1lbnUgaXMgcmVxdWVzdGVkIHRvIGNsb3NlICovXG4gIHJlYWRvbmx5IGNsb3NlZDogRXZlbnRFbWl0dGVyPHZvaWQ+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4gIC8qKiBUZW1wbGF0ZSByZWZlcmVuY2UgdmFyaWFibGUgdG8gdGhlIG1lbnUgdGhpcyB0cmlnZ2VyIG9wZW5zICovXG4gIHByb3RlY3RlZCBfbWVudVRlbXBsYXRlUmVmOiBUZW1wbGF0ZVJlZjx1bmtub3duPjtcblxuICAvKiogQSByZWZlcmVuY2UgdG8gdGhlIG92ZXJsYXkgd2hpY2ggbWFuYWdlcyB0aGUgdHJpZ2dlcmVkIG1lbnUgKi9cbiAgcHJvdGVjdGVkIF9vdmVybGF5UmVmOiBPdmVybGF5UmVmIHwgbnVsbCA9IG51bGw7XG5cbiAgLyoqIFRoZSBjb250ZW50IG9mIHRoZSBtZW51IHBhbmVsIG9wZW5lZCBieSB0aGlzIHRyaWdnZXIuICovXG4gIHByb3RlY3RlZCBfbWVudVBvcnRhbDogVGVtcGxhdGVQb3J0YWw7XG5cbiAgLyoqIEVtaXRzIHdoZW4gdGhpcyB0cmlnZ2VyIGlzIGRlc3Ryb3llZC4gKi9cbiAgcHJvdGVjdGVkIHJlYWRvbmx5IF9kZXN0cm95ZWQ6IFN1YmplY3Q8dm9pZD4gPSBuZXcgU3ViamVjdCgpO1xuXG4gIC8qKiBFbWl0cyB3aGVuIHRoZSBvdXRzaWRlIHBvaW50ZXIgZXZlbnRzIGxpc3RlbmVyIG9uIHRoZSBvdmVybGF5IHNob3VsZCBiZSBzdG9wcGVkLiAqL1xuICBwcm90ZWN0ZWQgcmVhZG9ubHkgX3N0b3BPdXRzaWRlQ2xpY2tzTGlzdGVuZXIgPSBtZXJnZSh0aGlzLmNsb3NlZCwgdGhpcy5fZGVzdHJveWVkKTtcblxuICBwcml2YXRlIF9jaGlsZE1lbnVJbmplY3Rvcj86IEluamVjdG9yO1xuXG4gIHByb3RlY3RlZCBjaGlsZE1lbnU/OiBNZW51O1xuXG4gIHByb3RlY3RlZCBjb25zdHJ1Y3RvcihcbiAgICBwcm90ZWN0ZWQgaW5qZWN0b3I6IEluamVjdG9yLFxuICAgIEBJbmplY3QoTUVOVV9TVEFDSykgcHJvdGVjdGVkIG1lbnVTdGFjazogTWVudVN0YWNrLFxuICApIHt9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgdGhpcy5fZGVzdHJveU92ZXJsYXkoKTtcblxuICAgIHRoaXMuX2Rlc3Ryb3llZC5uZXh0KCk7XG4gICAgdGhpcy5fZGVzdHJveWVkLmNvbXBsZXRlKCk7XG4gIH1cblxuICAvKiogV2hldGhlciB0aGUgYXR0YWNoZWQgbWVudSBpcyBvcGVuLiAqL1xuICBpc09wZW4oKSB7XG4gICAgcmV0dXJuICEhdGhpcy5fb3ZlcmxheVJlZj8uaGFzQXR0YWNoZWQoKTtcbiAgfVxuXG4gIHJlZ2lzdGVyQ2hpbGRNZW51KGNoaWxkOiBNZW51KSB7XG4gICAgdGhpcy5jaGlsZE1lbnUgPSBjaGlsZDtcbiAgfVxuXG4gIHByb3RlY3RlZCBnZXRDaGlsZE1lbnVJbmplY3RvcigpIHtcbiAgICB0aGlzLl9jaGlsZE1lbnVJbmplY3RvciA9XG4gICAgICB0aGlzLl9jaGlsZE1lbnVJbmplY3RvciB8fFxuICAgICAgSW5qZWN0b3IuY3JlYXRlKHtcbiAgICAgICAgcHJvdmlkZXJzOiBbXG4gICAgICAgICAge3Byb3ZpZGU6IE1FTlVfVFJJR0dFUiwgdXNlVmFsdWU6IHRoaXN9LFxuICAgICAgICAgIHtwcm92aWRlOiBNRU5VX1NUQUNLLCB1c2VWYWx1ZTogdGhpcy5tZW51U3RhY2t9LFxuICAgICAgICBdLFxuICAgICAgICBwYXJlbnQ6IHRoaXMuaW5qZWN0b3IsXG4gICAgICB9KTtcbiAgICByZXR1cm4gdGhpcy5fY2hpbGRNZW51SW5qZWN0b3I7XG4gIH1cblxuICAvKiogRGVzdHJveSBhbmQgdW5zZXQgdGhlIG92ZXJsYXkgcmVmZXJlbmNlIGl0IGlmIGV4aXN0cyAqL1xuICBwcml2YXRlIF9kZXN0cm95T3ZlcmxheSgpIHtcbiAgICBpZiAodGhpcy5fb3ZlcmxheVJlZikge1xuICAgICAgdGhpcy5fb3ZlcmxheVJlZi5kaXNwb3NlKCk7XG4gICAgICB0aGlzLl9vdmVybGF5UmVmID0gbnVsbDtcbiAgICB9XG4gIH1cbn1cbiJdfQ==