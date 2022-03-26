/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Inject, Injectable, InjectionToken, Injector } from '@angular/core';
import { MENU_STACK, MenuStack } from './menu-stack';
import * as i0 from "@angular/core";
import * as i1 from "./menu-stack";
/** Injection token used for an implementation of MenuStack. */
export const MENU_TRIGGER = new InjectionToken('cdk-menu-trigger');
export class MenuTrigger {
    constructor(injector, menuStack) {
        this.injector = injector;
        this.menuStack = menuStack;
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
    registerChildMenu(child) {
        this.childMenu = child;
    }
}
MenuTrigger.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.0.0-next.9", ngImport: i0, type: MenuTrigger, deps: [{ token: i0.Injector }, { token: MENU_STACK }], target: i0.ɵɵFactoryTarget.Injectable });
MenuTrigger.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "14.0.0-next.9", ngImport: i0, type: MenuTrigger });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.0.0-next.9", ngImport: i0, type: MenuTrigger, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: i0.Injector }, { type: i1.MenuStack, decorators: [{
                    type: Inject,
                    args: [MENU_STACK]
                }] }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS10cmlnZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvbWVudS9tZW51LXRyaWdnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUUsY0FBYyxFQUFFLFFBQVEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUUzRSxPQUFPLEVBQUMsVUFBVSxFQUFFLFNBQVMsRUFBQyxNQUFNLGNBQWMsQ0FBQzs7O0FBRW5ELCtEQUErRDtBQUMvRCxNQUFNLENBQUMsTUFBTSxZQUFZLEdBQUcsSUFBSSxjQUFjLENBQWMsa0JBQWtCLENBQUMsQ0FBQztBQUdoRixNQUFNLE9BQU8sV0FBVztJQUt0QixZQUFzQixRQUFrQixFQUFnQyxTQUFvQjtRQUF0RSxhQUFRLEdBQVIsUUFBUSxDQUFVO1FBQWdDLGNBQVMsR0FBVCxTQUFTLENBQVc7SUFBRyxDQUFDO0lBRXRGLG9CQUFvQjtRQUM1QixJQUFJLENBQUMsa0JBQWtCO1lBQ3JCLElBQUksQ0FBQyxrQkFBa0I7Z0JBQ3ZCLFFBQVEsQ0FBQyxNQUFNLENBQUM7b0JBQ2QsU0FBUyxFQUFFO3dCQUNULEVBQUMsT0FBTyxFQUFFLFlBQVksRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFDO3dCQUN2QyxFQUFDLE9BQU8sRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUM7cUJBQ2hEO29CQUNELE1BQU0sRUFBRSxJQUFJLENBQUMsUUFBUTtpQkFDdEIsQ0FBQyxDQUFDO1FBQ0wsT0FBTyxJQUFJLENBQUMsa0JBQWtCLENBQUM7SUFDakMsQ0FBQztJQUVELGlCQUFpQixDQUFDLEtBQVc7UUFDM0IsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7SUFDekIsQ0FBQzs7K0dBdEJVLFdBQVcsMENBSzRCLFVBQVU7bUhBTGpELFdBQVc7a0dBQVgsV0FBVztrQkFEdkIsVUFBVTs7MEJBTWtDLE1BQU07MkJBQUMsVUFBVSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0luamVjdCwgSW5qZWN0YWJsZSwgSW5qZWN0aW9uVG9rZW4sIEluamVjdG9yfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7TWVudX0gZnJvbSAnLi9tZW51LWludGVyZmFjZSc7XG5pbXBvcnQge01FTlVfU1RBQ0ssIE1lbnVTdGFja30gZnJvbSAnLi9tZW51LXN0YWNrJztcblxuLyoqIEluamVjdGlvbiB0b2tlbiB1c2VkIGZvciBhbiBpbXBsZW1lbnRhdGlvbiBvZiBNZW51U3RhY2suICovXG5leHBvcnQgY29uc3QgTUVOVV9UUklHR0VSID0gbmV3IEluamVjdGlvblRva2VuPE1lbnVUcmlnZ2VyPignY2RrLW1lbnUtdHJpZ2dlcicpO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgTWVudVRyaWdnZXIge1xuICBwcml2YXRlIF9jaGlsZE1lbnVJbmplY3Rvcj86IEluamVjdG9yO1xuXG4gIHByb3RlY3RlZCBjaGlsZE1lbnU/OiBNZW51O1xuXG4gIGNvbnN0cnVjdG9yKHByb3RlY3RlZCBpbmplY3RvcjogSW5qZWN0b3IsIEBJbmplY3QoTUVOVV9TVEFDSykgcHJvdGVjdGVkIG1lbnVTdGFjazogTWVudVN0YWNrKSB7fVxuXG4gIHByb3RlY3RlZCBnZXRDaGlsZE1lbnVJbmplY3RvcigpIHtcbiAgICB0aGlzLl9jaGlsZE1lbnVJbmplY3RvciA9XG4gICAgICB0aGlzLl9jaGlsZE1lbnVJbmplY3RvciB8fFxuICAgICAgSW5qZWN0b3IuY3JlYXRlKHtcbiAgICAgICAgcHJvdmlkZXJzOiBbXG4gICAgICAgICAge3Byb3ZpZGU6IE1FTlVfVFJJR0dFUiwgdXNlVmFsdWU6IHRoaXN9LFxuICAgICAgICAgIHtwcm92aWRlOiBNRU5VX1NUQUNLLCB1c2VWYWx1ZTogdGhpcy5tZW51U3RhY2t9LFxuICAgICAgICBdLFxuICAgICAgICBwYXJlbnQ6IHRoaXMuaW5qZWN0b3IsXG4gICAgICB9KTtcbiAgICByZXR1cm4gdGhpcy5fY2hpbGRNZW51SW5qZWN0b3I7XG4gIH1cblxuICByZWdpc3RlckNoaWxkTWVudShjaGlsZDogTWVudSkge1xuICAgIHRoaXMuY2hpbGRNZW51ID0gY2hpbGQ7XG4gIH1cbn1cbiJdfQ==