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
import { CdkMenuItemTrigger } from './menu-item-trigger';
import { CDK_MENU } from './menu-interface';
import { MENU_AIM } from './menu-aim';
import { MENU_STACK, MenuStack } from './menu-stack';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/collections";
import * as i2 from "@angular/cdk/bidi";
import * as i3 from "./menu-item-trigger";
import * as i4 from "./menu-stack";
/**
 * A directive providing behavior for the "menuitemradio" ARIA role, which behaves similarly to
 * a conventional radio-button. Any sibling `CdkMenuItemRadio` instances within the same `CdkMenu`
 * or `CdkMenuGroup` comprise a radio group with unique selection enforced.
 */
export class CdkMenuItemRadio extends CdkMenuItemSelectable {
    constructor(_selectionDispatcher, element, ngZone, menuStack, parentMenu, menuAim, dir, 
    /** Reference to the CdkMenuItemTrigger directive if one is added to the same element */
    // `CdkMenuItemRadio` is commonly used in combination with a `CdkMenuItemTrigger`.
    // tslint:disable-next-line: lightweight-tokens
    menuTrigger) {
        super(element, ngZone, menuStack, parentMenu, menuAim, dir, menuTrigger);
        this._selectionDispatcher = _selectionDispatcher;
        this._registerDispatcherListener();
    }
    /** Configure the unique selection dispatcher listener in order to toggle the checked state  */
    _registerDispatcherListener() {
        this._removeDispatcherListener = this._selectionDispatcher.listen((id, name) => (this.checked = this.id === id && this.name === name));
    }
    /** Toggles the checked state of the radio-button. */
    trigger() {
        super.trigger();
        if (!this.disabled) {
            this._selectionDispatcher.notify(this.id, this.name);
        }
    }
    ngOnDestroy() {
        super.ngOnDestroy();
        this._removeDispatcherListener();
    }
}
CdkMenuItemRadio.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.0.0-next.6", ngImport: i0, type: CdkMenuItemRadio, deps: [{ token: i1.UniqueSelectionDispatcher }, { token: i0.ElementRef }, { token: i0.NgZone }, { token: MENU_STACK, optional: true }, { token: CDK_MENU, optional: true }, { token: MENU_AIM, optional: true }, { token: i2.Directionality, optional: true }, { token: i3.CdkMenuItemTrigger, optional: true, self: true }], target: i0.ɵɵFactoryTarget.Directive });
CdkMenuItemRadio.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "14.0.0-next.6", type: CdkMenuItemRadio, selector: "[cdkMenuItemRadio]", host: { attributes: { "type": "button", "role": "menuitemradio" }, properties: { "tabindex": "_tabindex", "attr.aria-checked": "checked || null", "attr.aria-disabled": "disabled || null" } }, providers: [
        { provide: CdkMenuItemSelectable, useExisting: CdkMenuItemRadio },
        { provide: CdkMenuItem, useExisting: CdkMenuItemSelectable },
    ], exportAs: ["cdkMenuItemRadio"], usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.0.0-next.6", ngImport: i0, type: CdkMenuItemRadio, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkMenuItemRadio]',
                    exportAs: 'cdkMenuItemRadio',
                    host: {
                        '[tabindex]': '_tabindex',
                        'type': 'button',
                        'role': 'menuitemradio',
                        '[attr.aria-checked]': 'checked || null',
                        '[attr.aria-disabled]': 'disabled || null',
                    },
                    providers: [
                        { provide: CdkMenuItemSelectable, useExisting: CdkMenuItemRadio },
                        { provide: CdkMenuItem, useExisting: CdkMenuItemSelectable },
                    ],
                }]
        }], ctorParameters: function () { return [{ type: i1.UniqueSelectionDispatcher }, { type: i0.ElementRef }, { type: i0.NgZone }, { type: i4.MenuStack, decorators: [{
                    type: Optional
                }, {
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
                }] }, { type: i3.CdkMenuItemTrigger, decorators: [{
                    type: Self
                }, {
                    type: Optional
                }] }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1pdGVtLXJhZGlvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvbWVudS9tZW51LWl0ZW0tcmFkaW8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLHlCQUF5QixFQUFDLE1BQU0sMEJBQTBCLENBQUM7QUFDbkUsT0FBTyxFQUFDLFNBQVMsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBYSxRQUFRLEVBQUUsSUFBSSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQy9GLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUNqRCxPQUFPLEVBQUMscUJBQXFCLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQztBQUM3RCxPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0sYUFBYSxDQUFDO0FBQ3hDLE9BQU8sRUFBQyxrQkFBa0IsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQ3ZELE9BQU8sRUFBQyxRQUFRLEVBQU8sTUFBTSxrQkFBa0IsQ0FBQztBQUNoRCxPQUFPLEVBQUMsUUFBUSxFQUFVLE1BQU0sWUFBWSxDQUFDO0FBQzdDLE9BQU8sRUFBQyxVQUFVLEVBQUUsU0FBUyxFQUFDLE1BQU0sY0FBYyxDQUFDOzs7Ozs7QUFFbkQ7Ozs7R0FJRztBQWdCSCxNQUFNLE9BQU8sZ0JBQWlCLFNBQVEscUJBQXFCO0lBSXpELFlBQ21CLG9CQUErQyxFQUNoRSxPQUFnQyxFQUNoQyxNQUFjLEVBQ2tCLFNBQXFCLEVBQ3ZCLFVBQWlCLEVBQ2pCLE9BQWlCLEVBQ25DLEdBQW9CO0lBQ2hDLHdGQUF3RjtJQUN4RixrRkFBa0Y7SUFDbEYsK0NBQStDO0lBQzNCLFdBQWdDO1FBRXBELEtBQUssQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFFLEdBQUcsRUFBRSxXQUFXLENBQUMsQ0FBQztRQVp4RCx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQTJCO1FBY2hFLElBQUksQ0FBQywyQkFBMkIsRUFBRSxDQUFDO0lBQ3JDLENBQUM7SUFFRCwrRkFBK0Y7SUFDdkYsMkJBQTJCO1FBQ2pDLElBQUksQ0FBQyx5QkFBeUIsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsTUFBTSxDQUMvRCxDQUFDLEVBQVUsRUFBRSxJQUFZLEVBQUUsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxDQUNwRixDQUFDO0lBQ0osQ0FBQztJQUVELHFEQUFxRDtJQUM1QyxPQUFPO1FBQ2QsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBRWhCLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ2xCLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDdEQ7SUFDSCxDQUFDO0lBRVEsV0FBVztRQUNsQixLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDcEIsSUFBSSxDQUFDLHlCQUF5QixFQUFFLENBQUM7SUFDbkMsQ0FBQzs7b0hBekNVLGdCQUFnQiwyR0FRTCxVQUFVLDZCQUNWLFFBQVEsNkJBQ1IsUUFBUTt3R0FWbkIsZ0JBQWdCLDZPQUxoQjtRQUNULEVBQUMsT0FBTyxFQUFFLHFCQUFxQixFQUFFLFdBQVcsRUFBRSxnQkFBZ0IsRUFBQztRQUMvRCxFQUFDLE9BQU8sRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLHFCQUFxQixFQUFDO0tBQzNEO2tHQUVVLGdCQUFnQjtrQkFmNUIsU0FBUzttQkFBQztvQkFDVCxRQUFRLEVBQUUsb0JBQW9CO29CQUM5QixRQUFRLEVBQUUsa0JBQWtCO29CQUM1QixJQUFJLEVBQUU7d0JBQ0osWUFBWSxFQUFFLFdBQVc7d0JBQ3pCLE1BQU0sRUFBRSxRQUFRO3dCQUNoQixNQUFNLEVBQUUsZUFBZTt3QkFDdkIscUJBQXFCLEVBQUUsaUJBQWlCO3dCQUN4QyxzQkFBc0IsRUFBRSxrQkFBa0I7cUJBQzNDO29CQUNELFNBQVMsRUFBRTt3QkFDVCxFQUFDLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxXQUFXLGtCQUFrQixFQUFDO3dCQUMvRCxFQUFDLE9BQU8sRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLHFCQUFxQixFQUFDO3FCQUMzRDtpQkFDRjs7MEJBU0ksUUFBUTs7MEJBQUksTUFBTTsyQkFBQyxVQUFVOzswQkFDN0IsUUFBUTs7MEJBQUksTUFBTTsyQkFBQyxRQUFROzswQkFDM0IsUUFBUTs7MEJBQUksTUFBTTsyQkFBQyxRQUFROzswQkFDM0IsUUFBUTs7MEJBSVIsSUFBSTs7MEJBQUksUUFBUSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1VuaXF1ZVNlbGVjdGlvbkRpc3BhdGNoZXJ9IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2xsZWN0aW9ucyc7XG5pbXBvcnQge0RpcmVjdGl2ZSwgRWxlbWVudFJlZiwgSW5qZWN0LCBOZ1pvbmUsIE9uRGVzdHJveSwgT3B0aW9uYWwsIFNlbGZ9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtEaXJlY3Rpb25hbGl0eX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2JpZGknO1xuaW1wb3J0IHtDZGtNZW51SXRlbVNlbGVjdGFibGV9IGZyb20gJy4vbWVudS1pdGVtLXNlbGVjdGFibGUnO1xuaW1wb3J0IHtDZGtNZW51SXRlbX0gZnJvbSAnLi9tZW51LWl0ZW0nO1xuaW1wb3J0IHtDZGtNZW51SXRlbVRyaWdnZXJ9IGZyb20gJy4vbWVudS1pdGVtLXRyaWdnZXInO1xuaW1wb3J0IHtDREtfTUVOVSwgTWVudX0gZnJvbSAnLi9tZW51LWludGVyZmFjZSc7XG5pbXBvcnQge01FTlVfQUlNLCBNZW51QWltfSBmcm9tICcuL21lbnUtYWltJztcbmltcG9ydCB7TUVOVV9TVEFDSywgTWVudVN0YWNrfSBmcm9tICcuL21lbnUtc3RhY2snO1xuXG4vKipcbiAqIEEgZGlyZWN0aXZlIHByb3ZpZGluZyBiZWhhdmlvciBmb3IgdGhlIFwibWVudWl0ZW1yYWRpb1wiIEFSSUEgcm9sZSwgd2hpY2ggYmVoYXZlcyBzaW1pbGFybHkgdG9cbiAqIGEgY29udmVudGlvbmFsIHJhZGlvLWJ1dHRvbi4gQW55IHNpYmxpbmcgYENka01lbnVJdGVtUmFkaW9gIGluc3RhbmNlcyB3aXRoaW4gdGhlIHNhbWUgYENka01lbnVgXG4gKiBvciBgQ2RrTWVudUdyb3VwYCBjb21wcmlzZSBhIHJhZGlvIGdyb3VwIHdpdGggdW5pcXVlIHNlbGVjdGlvbiBlbmZvcmNlZC5cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW2Nka01lbnVJdGVtUmFkaW9dJyxcbiAgZXhwb3J0QXM6ICdjZGtNZW51SXRlbVJhZGlvJyxcbiAgaG9zdDoge1xuICAgICdbdGFiaW5kZXhdJzogJ190YWJpbmRleCcsXG4gICAgJ3R5cGUnOiAnYnV0dG9uJyxcbiAgICAncm9sZSc6ICdtZW51aXRlbXJhZGlvJyxcbiAgICAnW2F0dHIuYXJpYS1jaGVja2VkXSc6ICdjaGVja2VkIHx8IG51bGwnLFxuICAgICdbYXR0ci5hcmlhLWRpc2FibGVkXSc6ICdkaXNhYmxlZCB8fCBudWxsJyxcbiAgfSxcbiAgcHJvdmlkZXJzOiBbXG4gICAge3Byb3ZpZGU6IENka01lbnVJdGVtU2VsZWN0YWJsZSwgdXNlRXhpc3Rpbmc6IENka01lbnVJdGVtUmFkaW99LFxuICAgIHtwcm92aWRlOiBDZGtNZW51SXRlbSwgdXNlRXhpc3Rpbmc6IENka01lbnVJdGVtU2VsZWN0YWJsZX0sXG4gIF0sXG59KVxuZXhwb3J0IGNsYXNzIENka01lbnVJdGVtUmFkaW8gZXh0ZW5kcyBDZGtNZW51SXRlbVNlbGVjdGFibGUgaW1wbGVtZW50cyBPbkRlc3Ryb3kge1xuICAvKiogRnVuY3Rpb24gdG8gdW5yZWdpc3RlciB0aGUgc2VsZWN0aW9uIGRpc3BhdGNoZXIgKi9cbiAgcHJpdmF0ZSBfcmVtb3ZlRGlzcGF0Y2hlckxpc3RlbmVyOiAoKSA9PiB2b2lkO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgcmVhZG9ubHkgX3NlbGVjdGlvbkRpc3BhdGNoZXI6IFVuaXF1ZVNlbGVjdGlvbkRpc3BhdGNoZXIsXG4gICAgZWxlbWVudDogRWxlbWVudFJlZjxIVE1MRWxlbWVudD4sXG4gICAgbmdab25lOiBOZ1pvbmUsXG4gICAgQE9wdGlvbmFsKCkgQEluamVjdChNRU5VX1NUQUNLKSBtZW51U3RhY2s/OiBNZW51U3RhY2ssXG4gICAgQE9wdGlvbmFsKCkgQEluamVjdChDREtfTUVOVSkgcGFyZW50TWVudT86IE1lbnUsXG4gICAgQE9wdGlvbmFsKCkgQEluamVjdChNRU5VX0FJTSkgbWVudUFpbT86IE1lbnVBaW0sXG4gICAgQE9wdGlvbmFsKCkgZGlyPzogRGlyZWN0aW9uYWxpdHksXG4gICAgLyoqIFJlZmVyZW5jZSB0byB0aGUgQ2RrTWVudUl0ZW1UcmlnZ2VyIGRpcmVjdGl2ZSBpZiBvbmUgaXMgYWRkZWQgdG8gdGhlIHNhbWUgZWxlbWVudCAqL1xuICAgIC8vIGBDZGtNZW51SXRlbVJhZGlvYCBpcyBjb21tb25seSB1c2VkIGluIGNvbWJpbmF0aW9uIHdpdGggYSBgQ2RrTWVudUl0ZW1UcmlnZ2VyYC5cbiAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6IGxpZ2h0d2VpZ2h0LXRva2Vuc1xuICAgIEBTZWxmKCkgQE9wdGlvbmFsKCkgbWVudVRyaWdnZXI/OiBDZGtNZW51SXRlbVRyaWdnZXIsXG4gICkge1xuICAgIHN1cGVyKGVsZW1lbnQsIG5nWm9uZSwgbWVudVN0YWNrLCBwYXJlbnRNZW51LCBtZW51QWltLCBkaXIsIG1lbnVUcmlnZ2VyKTtcblxuICAgIHRoaXMuX3JlZ2lzdGVyRGlzcGF0Y2hlckxpc3RlbmVyKCk7XG4gIH1cblxuICAvKiogQ29uZmlndXJlIHRoZSB1bmlxdWUgc2VsZWN0aW9uIGRpc3BhdGNoZXIgbGlzdGVuZXIgaW4gb3JkZXIgdG8gdG9nZ2xlIHRoZSBjaGVja2VkIHN0YXRlICAqL1xuICBwcml2YXRlIF9yZWdpc3RlckRpc3BhdGNoZXJMaXN0ZW5lcigpIHtcbiAgICB0aGlzLl9yZW1vdmVEaXNwYXRjaGVyTGlzdGVuZXIgPSB0aGlzLl9zZWxlY3Rpb25EaXNwYXRjaGVyLmxpc3RlbihcbiAgICAgIChpZDogc3RyaW5nLCBuYW1lOiBzdHJpbmcpID0+ICh0aGlzLmNoZWNrZWQgPSB0aGlzLmlkID09PSBpZCAmJiB0aGlzLm5hbWUgPT09IG5hbWUpLFxuICAgICk7XG4gIH1cblxuICAvKiogVG9nZ2xlcyB0aGUgY2hlY2tlZCBzdGF0ZSBvZiB0aGUgcmFkaW8tYnV0dG9uLiAqL1xuICBvdmVycmlkZSB0cmlnZ2VyKCkge1xuICAgIHN1cGVyLnRyaWdnZXIoKTtcblxuICAgIGlmICghdGhpcy5kaXNhYmxlZCkge1xuICAgICAgdGhpcy5fc2VsZWN0aW9uRGlzcGF0Y2hlci5ub3RpZnkodGhpcy5pZCwgdGhpcy5uYW1lKTtcbiAgICB9XG4gIH1cblxuICBvdmVycmlkZSBuZ09uRGVzdHJveSgpIHtcbiAgICBzdXBlci5uZ09uRGVzdHJveSgpO1xuICAgIHRoaXMuX3JlbW92ZURpc3BhdGNoZXJMaXN0ZW5lcigpO1xuICB9XG59XG4iXX0=