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
MenuTrigger.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "14.0.0-next.9", type: MenuTrigger, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.0.0-next.9", ngImport: i0, type: MenuTrigger, decorators: [{
            type: Directive
        }], ctorParameters: function () { return [{ type: i0.Injector }, { type: i1.MenuStack, decorators: [{
                    type: Inject,
                    args: [MENU_STACK]
                }] }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS10cmlnZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvbWVudS9tZW51LXRyaWdnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUNMLFNBQVMsRUFDVCxZQUFZLEVBQ1osTUFBTSxFQUNOLGNBQWMsRUFDZCxRQUFRLEdBR1QsTUFBTSxlQUFlLENBQUM7QUFFdkIsT0FBTyxFQUFDLFVBQVUsRUFBRSxTQUFTLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFHbkQsT0FBTyxFQUFDLEtBQUssRUFBRSxPQUFPLEVBQUMsTUFBTSxNQUFNLENBQUM7OztBQUVwQywrREFBK0Q7QUFDL0QsTUFBTSxDQUFDLE1BQU0sWUFBWSxHQUFHLElBQUksY0FBYyxDQUFjLGtCQUFrQixDQUFDLENBQUM7QUFHaEYsTUFBTSxPQUFnQixXQUFXO0lBNkIvQixZQUNZLFFBQWtCLEVBQ0UsU0FBb0I7UUFEeEMsYUFBUSxHQUFSLFFBQVEsQ0FBVTtRQUNFLGNBQVMsR0FBVCxTQUFTLENBQVc7UUEzQnBELHdEQUF3RDtRQUMvQyxXQUFNLEdBQXVCLElBQUksWUFBWSxFQUFFLENBQUM7UUFFekQseURBQXlEO1FBQ2hELFdBQU0sR0FBdUIsSUFBSSxZQUFZLEVBQUUsQ0FBQztRQUt6RCxrRUFBa0U7UUFDeEQsZ0JBQVcsR0FBc0IsSUFBSSxDQUFDO1FBS2hELDRDQUE0QztRQUN6QixlQUFVLEdBQWtCLElBQUksT0FBTyxFQUFFLENBQUM7UUFFN0QsdUZBQXVGO1FBQ3BFLCtCQUEwQixHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztJQVNqRixDQUFDO0lBRUosV0FBVztRQUNULElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUV2QixJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDN0IsQ0FBQztJQUVELHlDQUF5QztJQUN6QyxNQUFNO1FBQ0osT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxXQUFXLEVBQUUsQ0FBQztJQUMzQyxDQUFDO0lBRUQsaUJBQWlCLENBQUMsS0FBVztRQUMzQixJQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztJQUN6QixDQUFDO0lBRVMsb0JBQW9CO1FBQzVCLElBQUksQ0FBQyxrQkFBa0I7WUFDckIsSUFBSSxDQUFDLGtCQUFrQjtnQkFDdkIsUUFBUSxDQUFDLE1BQU0sQ0FBQztvQkFDZCxTQUFTLEVBQUU7d0JBQ1QsRUFBQyxPQUFPLEVBQUUsWUFBWSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUM7d0JBQ3ZDLEVBQUMsT0FBTyxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVMsRUFBQztxQkFDaEQ7b0JBQ0QsTUFBTSxFQUFFLElBQUksQ0FBQyxRQUFRO2lCQUN0QixDQUFDLENBQUM7UUFDTCxPQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQztJQUNqQyxDQUFDO0lBRUQsMkRBQTJEO0lBQ25ELGVBQWU7UUFDckIsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFO1lBQ3BCLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDM0IsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7U0FDekI7SUFDSCxDQUFDOzsrR0FyRW1CLFdBQVcsMENBK0JyQixVQUFVO21HQS9CQSxXQUFXO2tHQUFYLFdBQVc7a0JBRGhDLFNBQVM7OzBCQWdDTCxNQUFNOzJCQUFDLFVBQVUiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtcbiAgRGlyZWN0aXZlLFxuICBFdmVudEVtaXR0ZXIsXG4gIEluamVjdCxcbiAgSW5qZWN0aW9uVG9rZW4sXG4gIEluamVjdG9yLFxuICBPbkRlc3Ryb3ksXG4gIFRlbXBsYXRlUmVmLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7TWVudX0gZnJvbSAnLi9tZW51LWludGVyZmFjZSc7XG5pbXBvcnQge01FTlVfU1RBQ0ssIE1lbnVTdGFja30gZnJvbSAnLi9tZW51LXN0YWNrJztcbmltcG9ydCB7Q29ubmVjdGVkUG9zaXRpb24sIE92ZXJsYXlSZWZ9IGZyb20gJ0Bhbmd1bGFyL2Nkay9vdmVybGF5JztcbmltcG9ydCB7VGVtcGxhdGVQb3J0YWx9IGZyb20gJ0Bhbmd1bGFyL2Nkay9wb3J0YWwnO1xuaW1wb3J0IHttZXJnZSwgU3ViamVjdH0gZnJvbSAncnhqcyc7XG5cbi8qKiBJbmplY3Rpb24gdG9rZW4gdXNlZCBmb3IgYW4gaW1wbGVtZW50YXRpb24gb2YgTWVudVN0YWNrLiAqL1xuZXhwb3J0IGNvbnN0IE1FTlVfVFJJR0dFUiA9IG5ldyBJbmplY3Rpb25Ub2tlbjxNZW51VHJpZ2dlcj4oJ2Nkay1tZW51LXRyaWdnZXInKTtcblxuQERpcmVjdGl2ZSgpXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgTWVudVRyaWdnZXIgaW1wbGVtZW50cyBPbkRlc3Ryb3kge1xuICAvKiogQSBsaXN0IG9mIHByZWZlcnJlZCBtZW51IHBvc2l0aW9ucyB0byBiZSB1c2VkIHdoZW4gY29uc3RydWN0aW5nIHRoZSBgRmxleGlibGVDb25uZWN0ZWRQb3NpdGlvblN0cmF0ZWd5YCBmb3IgdGhpcyB0cmlnZ2VyJ3MgbWVudS4gKi9cbiAgbWVudVBvc2l0aW9uOiBDb25uZWN0ZWRQb3NpdGlvbltdO1xuXG4gIC8qKiBFbWl0cyB3aGVuIHRoZSBhdHRhY2hlZCBtZW51IGlzIHJlcXVlc3RlZCB0byBvcGVuICovXG4gIHJlYWRvbmx5IG9wZW5lZDogRXZlbnRFbWl0dGVyPHZvaWQ+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4gIC8qKiBFbWl0cyB3aGVuIHRoZSBhdHRhY2hlZCBtZW51IGlzIHJlcXVlc3RlZCB0byBjbG9zZSAqL1xuICByZWFkb25seSBjbG9zZWQ6IEV2ZW50RW1pdHRlcjx2b2lkPiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuICAvKiogVGVtcGxhdGUgcmVmZXJlbmNlIHZhcmlhYmxlIHRvIHRoZSBtZW51IHRoaXMgdHJpZ2dlciBvcGVucyAqL1xuICBwcm90ZWN0ZWQgX21lbnVUZW1wbGF0ZVJlZjogVGVtcGxhdGVSZWY8dW5rbm93bj47XG5cbiAgLyoqIEEgcmVmZXJlbmNlIHRvIHRoZSBvdmVybGF5IHdoaWNoIG1hbmFnZXMgdGhlIHRyaWdnZXJlZCBtZW51ICovXG4gIHByb3RlY3RlZCBfb3ZlcmxheVJlZjogT3ZlcmxheVJlZiB8IG51bGwgPSBudWxsO1xuXG4gIC8qKiBUaGUgY29udGVudCBvZiB0aGUgbWVudSBwYW5lbCBvcGVuZWQgYnkgdGhpcyB0cmlnZ2VyLiAqL1xuICBwcm90ZWN0ZWQgX21lbnVQb3J0YWw6IFRlbXBsYXRlUG9ydGFsO1xuXG4gIC8qKiBFbWl0cyB3aGVuIHRoaXMgdHJpZ2dlciBpcyBkZXN0cm95ZWQuICovXG4gIHByb3RlY3RlZCByZWFkb25seSBfZGVzdHJveWVkOiBTdWJqZWN0PHZvaWQ+ID0gbmV3IFN1YmplY3QoKTtcblxuICAvKiogRW1pdHMgd2hlbiB0aGUgb3V0c2lkZSBwb2ludGVyIGV2ZW50cyBsaXN0ZW5lciBvbiB0aGUgb3ZlcmxheSBzaG91bGQgYmUgc3RvcHBlZC4gKi9cbiAgcHJvdGVjdGVkIHJlYWRvbmx5IF9zdG9wT3V0c2lkZUNsaWNrc0xpc3RlbmVyID0gbWVyZ2UodGhpcy5jbG9zZWQsIHRoaXMuX2Rlc3Ryb3llZCk7XG5cbiAgcHJpdmF0ZSBfY2hpbGRNZW51SW5qZWN0b3I/OiBJbmplY3RvcjtcblxuICBwcm90ZWN0ZWQgY2hpbGRNZW51PzogTWVudTtcblxuICBwcm90ZWN0ZWQgY29uc3RydWN0b3IoXG4gICAgcHJvdGVjdGVkIGluamVjdG9yOiBJbmplY3RvcixcbiAgICBASW5qZWN0KE1FTlVfU1RBQ0spIHByb3RlY3RlZCBtZW51U3RhY2s6IE1lbnVTdGFjayxcbiAgKSB7fVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIHRoaXMuX2Rlc3Ryb3lPdmVybGF5KCk7XG5cbiAgICB0aGlzLl9kZXN0cm95ZWQubmV4dCgpO1xuICAgIHRoaXMuX2Rlc3Ryb3llZC5jb21wbGV0ZSgpO1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGF0dGFjaGVkIG1lbnUgaXMgb3Blbi4gKi9cbiAgaXNPcGVuKCkge1xuICAgIHJldHVybiAhIXRoaXMuX292ZXJsYXlSZWY/Lmhhc0F0dGFjaGVkKCk7XG4gIH1cblxuICByZWdpc3RlckNoaWxkTWVudShjaGlsZDogTWVudSkge1xuICAgIHRoaXMuY2hpbGRNZW51ID0gY2hpbGQ7XG4gIH1cblxuICBwcm90ZWN0ZWQgZ2V0Q2hpbGRNZW51SW5qZWN0b3IoKSB7XG4gICAgdGhpcy5fY2hpbGRNZW51SW5qZWN0b3IgPVxuICAgICAgdGhpcy5fY2hpbGRNZW51SW5qZWN0b3IgfHxcbiAgICAgIEluamVjdG9yLmNyZWF0ZSh7XG4gICAgICAgIHByb3ZpZGVyczogW1xuICAgICAgICAgIHtwcm92aWRlOiBNRU5VX1RSSUdHRVIsIHVzZVZhbHVlOiB0aGlzfSxcbiAgICAgICAgICB7cHJvdmlkZTogTUVOVV9TVEFDSywgdXNlVmFsdWU6IHRoaXMubWVudVN0YWNrfSxcbiAgICAgICAgXSxcbiAgICAgICAgcGFyZW50OiB0aGlzLmluamVjdG9yLFxuICAgICAgfSk7XG4gICAgcmV0dXJuIHRoaXMuX2NoaWxkTWVudUluamVjdG9yO1xuICB9XG5cbiAgLyoqIERlc3Ryb3kgYW5kIHVuc2V0IHRoZSBvdmVybGF5IHJlZmVyZW5jZSBpdCBpZiBleGlzdHMgKi9cbiAgcHJpdmF0ZSBfZGVzdHJveU92ZXJsYXkoKSB7XG4gICAgaWYgKHRoaXMuX292ZXJsYXlSZWYpIHtcbiAgICAgIHRoaXMuX292ZXJsYXlSZWYuZGlzcG9zZSgpO1xuICAgICAgdGhpcy5fb3ZlcmxheVJlZiA9IG51bGw7XG4gICAgfVxuICB9XG59XG4iXX0=