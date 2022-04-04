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
/** Counter used to set a unique id and name for a selectable item */
let nextId = 0;
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
        this._id = `${nextId++}`;
        this._registerDispatcherListener();
    }
    /** Configure the unique selection dispatcher listener in order to toggle the checked state  */
    _registerDispatcherListener() {
        this._removeDispatcherListener = this._selectionDispatcher.listen((id) => {
            this.checked = this._id === id;
        });
    }
    /** Toggles the checked state of the radio-button. */
    trigger(options) {
        super.trigger(options);
        if (!this.disabled) {
            this._selectionDispatcher.notify(this._id, '');
        }
    }
    ngOnDestroy() {
        super.ngOnDestroy();
        this._removeDispatcherListener();
    }
}
CdkMenuItemRadio.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.0.0-next.9", ngImport: i0, type: CdkMenuItemRadio, deps: [{ token: i1.UniqueSelectionDispatcher }, { token: i0.ElementRef }, { token: i0.NgZone }, { token: MENU_STACK }, { token: CDK_MENU, optional: true }, { token: MENU_AIM, optional: true }, { token: i2.Directionality, optional: true }, { token: i3.CdkMenuItemTrigger, optional: true, self: true }], target: i0.ɵɵFactoryTarget.Directive });
CdkMenuItemRadio.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "14.0.0-next.9", type: CdkMenuItemRadio, selector: "[cdkMenuItemRadio]", host: { attributes: { "role": "menuitemradio" } }, providers: [
        { provide: CdkMenuItemSelectable, useExisting: CdkMenuItemRadio },
        { provide: CdkMenuItem, useExisting: CdkMenuItemSelectable },
    ], exportAs: ["cdkMenuItemRadio"], usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.0.0-next.9", ngImport: i0, type: CdkMenuItemRadio, decorators: [{
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
        }], ctorParameters: function () { return [{ type: i1.UniqueSelectionDispatcher }, { type: i0.ElementRef }, { type: i0.NgZone }, { type: i4.MenuStack, decorators: [{
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1pdGVtLXJhZGlvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvbWVudS9tZW51LWl0ZW0tcmFkaW8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLHlCQUF5QixFQUFDLE1BQU0sMEJBQTBCLENBQUM7QUFDbkUsT0FBTyxFQUFDLFNBQVMsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBYSxRQUFRLEVBQUUsSUFBSSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQy9GLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUNqRCxPQUFPLEVBQUMscUJBQXFCLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQztBQUM3RCxPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0sYUFBYSxDQUFDO0FBQ3hDLE9BQU8sRUFBQyxrQkFBa0IsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQ3ZELE9BQU8sRUFBQyxRQUFRLEVBQU8sTUFBTSxrQkFBa0IsQ0FBQztBQUNoRCxPQUFPLEVBQUMsUUFBUSxFQUFVLE1BQU0sWUFBWSxDQUFDO0FBQzdDLE9BQU8sRUFBQyxVQUFVLEVBQUUsU0FBUyxFQUFDLE1BQU0sY0FBYyxDQUFDOzs7Ozs7QUFFbkQscUVBQXFFO0FBQ3JFLElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQztBQUVmOzs7O0dBSUc7QUFZSCxNQUFNLE9BQU8sZ0JBQWlCLFNBQVEscUJBQXFCO0lBTXpELFlBQ21CLG9CQUErQyxFQUNoRSxPQUFnQyxFQUNoQyxNQUFjLEVBQ00sU0FBb0IsRUFDVixVQUFpQixFQUNqQixPQUFpQixFQUNuQyxHQUFvQjtJQUNoQyx3RkFBd0Y7SUFDeEYsa0ZBQWtGO0lBQ2xGLCtDQUErQztJQUMzQixXQUFnQztRQUVwRCxLQUFLLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLE9BQU8sRUFBRSxHQUFHLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFaeEQseUJBQW9CLEdBQXBCLG9CQUFvQixDQUEyQjtRQU4xRCxRQUFHLEdBQUcsR0FBRyxNQUFNLEVBQUUsRUFBRSxDQUFDO1FBb0IxQixJQUFJLENBQUMsMkJBQTJCLEVBQUUsQ0FBQztJQUNyQyxDQUFDO0lBRUQsK0ZBQStGO0lBQ3ZGLDJCQUEyQjtRQUNqQyxJQUFJLENBQUMseUJBQXlCLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQVUsRUFBRSxFQUFFO1lBQy9FLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsS0FBSyxFQUFFLENBQUM7UUFDakMsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQscURBQXFEO0lBQzVDLE9BQU8sQ0FBQyxPQUE2QjtRQUM1QyxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRXZCLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ2xCLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQztTQUNoRDtJQUNILENBQUM7SUFFUSxXQUFXO1FBQ2xCLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUVwQixJQUFJLENBQUMseUJBQXlCLEVBQUUsQ0FBQztJQUNuQyxDQUFDOztvSEE1Q1UsZ0JBQWdCLDJHQVVqQixVQUFVLGFBQ0UsUUFBUSw2QkFDUixRQUFRO3dHQVpuQixnQkFBZ0IsZ0dBTGhCO1FBQ1QsRUFBQyxPQUFPLEVBQUUscUJBQXFCLEVBQUUsV0FBVyxFQUFFLGdCQUFnQixFQUFDO1FBQy9ELEVBQUMsT0FBTyxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUscUJBQXFCLEVBQUM7S0FDM0Q7a0dBRVUsZ0JBQWdCO2tCQVg1QixTQUFTO21CQUFDO29CQUNULFFBQVEsRUFBRSxvQkFBb0I7b0JBQzlCLFFBQVEsRUFBRSxrQkFBa0I7b0JBQzVCLElBQUksRUFBRTt3QkFDSixNQUFNLEVBQUUsZUFBZTtxQkFDeEI7b0JBQ0QsU0FBUyxFQUFFO3dCQUNULEVBQUMsT0FBTyxFQUFFLHFCQUFxQixFQUFFLFdBQVcsa0JBQWtCLEVBQUM7d0JBQy9ELEVBQUMsT0FBTyxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUscUJBQXFCLEVBQUM7cUJBQzNEO2lCQUNGOzswQkFXSSxNQUFNOzJCQUFDLFVBQVU7OzBCQUNqQixRQUFROzswQkFBSSxNQUFNOzJCQUFDLFFBQVE7OzBCQUMzQixRQUFROzswQkFBSSxNQUFNOzJCQUFDLFFBQVE7OzBCQUMzQixRQUFROzswQkFJUixJQUFJOzswQkFBSSxRQUFRIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7VW5pcXVlU2VsZWN0aW9uRGlzcGF0Y2hlcn0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvbGxlY3Rpb25zJztcbmltcG9ydCB7RGlyZWN0aXZlLCBFbGVtZW50UmVmLCBJbmplY3QsIE5nWm9uZSwgT25EZXN0cm95LCBPcHRpb25hbCwgU2VsZn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0RpcmVjdGlvbmFsaXR5fSBmcm9tICdAYW5ndWxhci9jZGsvYmlkaSc7XG5pbXBvcnQge0Nka01lbnVJdGVtU2VsZWN0YWJsZX0gZnJvbSAnLi9tZW51LWl0ZW0tc2VsZWN0YWJsZSc7XG5pbXBvcnQge0Nka01lbnVJdGVtfSBmcm9tICcuL21lbnUtaXRlbSc7XG5pbXBvcnQge0Nka01lbnVJdGVtVHJpZ2dlcn0gZnJvbSAnLi9tZW51LWl0ZW0tdHJpZ2dlcic7XG5pbXBvcnQge0NES19NRU5VLCBNZW51fSBmcm9tICcuL21lbnUtaW50ZXJmYWNlJztcbmltcG9ydCB7TUVOVV9BSU0sIE1lbnVBaW19IGZyb20gJy4vbWVudS1haW0nO1xuaW1wb3J0IHtNRU5VX1NUQUNLLCBNZW51U3RhY2t9IGZyb20gJy4vbWVudS1zdGFjayc7XG5cbi8qKiBDb3VudGVyIHVzZWQgdG8gc2V0IGEgdW5pcXVlIGlkIGFuZCBuYW1lIGZvciBhIHNlbGVjdGFibGUgaXRlbSAqL1xubGV0IG5leHRJZCA9IDA7XG5cbi8qKlxuICogQSBkaXJlY3RpdmUgcHJvdmlkaW5nIGJlaGF2aW9yIGZvciB0aGUgXCJtZW51aXRlbXJhZGlvXCIgQVJJQSByb2xlLCB3aGljaCBiZWhhdmVzIHNpbWlsYXJseSB0b1xuICogYSBjb252ZW50aW9uYWwgcmFkaW8tYnV0dG9uLiBBbnkgc2libGluZyBgQ2RrTWVudUl0ZW1SYWRpb2AgaW5zdGFuY2VzIHdpdGhpbiB0aGUgc2FtZSBgQ2RrTWVudWBcbiAqIG9yIGBDZGtNZW51R3JvdXBgIGNvbXByaXNlIGEgcmFkaW8gZ3JvdXAgd2l0aCB1bmlxdWUgc2VsZWN0aW9uIGVuZm9yY2VkLlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbY2RrTWVudUl0ZW1SYWRpb10nLFxuICBleHBvcnRBczogJ2Nka01lbnVJdGVtUmFkaW8nLFxuICBob3N0OiB7XG4gICAgJ3JvbGUnOiAnbWVudWl0ZW1yYWRpbycsXG4gIH0sXG4gIHByb3ZpZGVyczogW1xuICAgIHtwcm92aWRlOiBDZGtNZW51SXRlbVNlbGVjdGFibGUsIHVzZUV4aXN0aW5nOiBDZGtNZW51SXRlbVJhZGlvfSxcbiAgICB7cHJvdmlkZTogQ2RrTWVudUl0ZW0sIHVzZUV4aXN0aW5nOiBDZGtNZW51SXRlbVNlbGVjdGFibGV9LFxuICBdLFxufSlcbmV4cG9ydCBjbGFzcyBDZGtNZW51SXRlbVJhZGlvIGV4dGVuZHMgQ2RrTWVudUl0ZW1TZWxlY3RhYmxlIGltcGxlbWVudHMgT25EZXN0cm95IHtcbiAgcHJpdmF0ZSBfaWQgPSBgJHtuZXh0SWQrK31gO1xuXG4gIC8qKiBGdW5jdGlvbiB0byB1bnJlZ2lzdGVyIHRoZSBzZWxlY3Rpb24gZGlzcGF0Y2hlciAqL1xuICBwcml2YXRlIF9yZW1vdmVEaXNwYXRjaGVyTGlzdGVuZXI6ICgpID0+IHZvaWQ7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSByZWFkb25seSBfc2VsZWN0aW9uRGlzcGF0Y2hlcjogVW5pcXVlU2VsZWN0aW9uRGlzcGF0Y2hlcixcbiAgICBlbGVtZW50OiBFbGVtZW50UmVmPEhUTUxFbGVtZW50PixcbiAgICBuZ1pvbmU6IE5nWm9uZSxcbiAgICBASW5qZWN0KE1FTlVfU1RBQ0spIG1lbnVTdGFjazogTWVudVN0YWNrLFxuICAgIEBPcHRpb25hbCgpIEBJbmplY3QoQ0RLX01FTlUpIHBhcmVudE1lbnU/OiBNZW51LFxuICAgIEBPcHRpb25hbCgpIEBJbmplY3QoTUVOVV9BSU0pIG1lbnVBaW0/OiBNZW51QWltLFxuICAgIEBPcHRpb25hbCgpIGRpcj86IERpcmVjdGlvbmFsaXR5LFxuICAgIC8qKiBSZWZlcmVuY2UgdG8gdGhlIENka01lbnVJdGVtVHJpZ2dlciBkaXJlY3RpdmUgaWYgb25lIGlzIGFkZGVkIHRvIHRoZSBzYW1lIGVsZW1lbnQgKi9cbiAgICAvLyBgQ2RrTWVudUl0ZW1SYWRpb2AgaXMgY29tbW9ubHkgdXNlZCBpbiBjb21iaW5hdGlvbiB3aXRoIGEgYENka01lbnVJdGVtVHJpZ2dlcmAuXG4gICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOiBsaWdodHdlaWdodC10b2tlbnNcbiAgICBAU2VsZigpIEBPcHRpb25hbCgpIG1lbnVUcmlnZ2VyPzogQ2RrTWVudUl0ZW1UcmlnZ2VyLFxuICApIHtcbiAgICBzdXBlcihlbGVtZW50LCBuZ1pvbmUsIG1lbnVTdGFjaywgcGFyZW50TWVudSwgbWVudUFpbSwgZGlyLCBtZW51VHJpZ2dlcik7XG5cbiAgICB0aGlzLl9yZWdpc3RlckRpc3BhdGNoZXJMaXN0ZW5lcigpO1xuICB9XG5cbiAgLyoqIENvbmZpZ3VyZSB0aGUgdW5pcXVlIHNlbGVjdGlvbiBkaXNwYXRjaGVyIGxpc3RlbmVyIGluIG9yZGVyIHRvIHRvZ2dsZSB0aGUgY2hlY2tlZCBzdGF0ZSAgKi9cbiAgcHJpdmF0ZSBfcmVnaXN0ZXJEaXNwYXRjaGVyTGlzdGVuZXIoKSB7XG4gICAgdGhpcy5fcmVtb3ZlRGlzcGF0Y2hlckxpc3RlbmVyID0gdGhpcy5fc2VsZWN0aW9uRGlzcGF0Y2hlci5saXN0ZW4oKGlkOiBzdHJpbmcpID0+IHtcbiAgICAgIHRoaXMuY2hlY2tlZCA9IHRoaXMuX2lkID09PSBpZDtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBUb2dnbGVzIHRoZSBjaGVja2VkIHN0YXRlIG9mIHRoZSByYWRpby1idXR0b24uICovXG4gIG92ZXJyaWRlIHRyaWdnZXIob3B0aW9ucz86IHtrZWVwT3BlbjogYm9vbGVhbn0pIHtcbiAgICBzdXBlci50cmlnZ2VyKG9wdGlvbnMpO1xuXG4gICAgaWYgKCF0aGlzLmRpc2FibGVkKSB7XG4gICAgICB0aGlzLl9zZWxlY3Rpb25EaXNwYXRjaGVyLm5vdGlmeSh0aGlzLl9pZCwgJycpO1xuICAgIH1cbiAgfVxuXG4gIG92ZXJyaWRlIG5nT25EZXN0cm95KCkge1xuICAgIHN1cGVyLm5nT25EZXN0cm95KCk7XG5cbiAgICB0aGlzLl9yZW1vdmVEaXNwYXRjaGVyTGlzdGVuZXIoKTtcbiAgfVxufVxuIl19