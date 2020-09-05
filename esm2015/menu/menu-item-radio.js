/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { UniqueSelectionDispatcher } from '@angular/cdk/collections';
import { Directive, ElementRef, Self, Optional, Inject, NgZone } from '@angular/core';
import { Directionality } from '@angular/cdk/bidi';
import { CdkMenuItemSelectable } from './menu-item-selectable';
import { CdkMenuItem } from './menu-item';
import { CdkMenuItemTrigger } from './menu-item-trigger';
import { CDK_MENU } from './menu-interface';
import { MENU_AIM } from './menu-aim';
/**
 * A directive providing behavior for the the "menuitemradio" ARIA role, which behaves similarly to
 * a conventional radio-button. Any sibling `CdkMenuItemRadio` instances within the same `CdkMenu`
 * or `CdkMenuGroup` comprise a radio group with unique selection enforced.
 */
export class CdkMenuItemRadio extends CdkMenuItemSelectable {
    constructor(_selectionDispatcher, element, ngZone, parentMenu, menuAim, dir, 
    /** Reference to the CdkMenuItemTrigger directive if one is added to the same element */
    // `CdkMenuItemRadio` is commonly used in combination with a `CdkMenuItemTrigger`.
    // tslint:disable-next-line: lightweight-tokens
    menuTrigger) {
        super(element, ngZone, parentMenu, menuAim, dir, menuTrigger);
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
CdkMenuItemRadio.decorators = [
    { type: Directive, args: [{
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
            },] }
];
CdkMenuItemRadio.ctorParameters = () => [
    { type: UniqueSelectionDispatcher },
    { type: ElementRef },
    { type: NgZone },
    { type: undefined, decorators: [{ type: Optional }, { type: Inject, args: [CDK_MENU,] }] },
    { type: undefined, decorators: [{ type: Optional }, { type: Inject, args: [MENU_AIM,] }] },
    { type: Directionality, decorators: [{ type: Optional }] },
    { type: CdkMenuItemTrigger, decorators: [{ type: Self }, { type: Optional }] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1pdGVtLXJhZGlvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvbWVudS9tZW51LWl0ZW0tcmFkaW8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBQ0gsT0FBTyxFQUFDLHlCQUF5QixFQUFDLE1BQU0sMEJBQTBCLENBQUM7QUFDbkUsT0FBTyxFQUFDLFNBQVMsRUFBYSxVQUFVLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQy9GLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUNqRCxPQUFPLEVBQUMscUJBQXFCLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQztBQUM3RCxPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0sYUFBYSxDQUFDO0FBQ3hDLE9BQU8sRUFBQyxrQkFBa0IsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQ3ZELE9BQU8sRUFBQyxRQUFRLEVBQU8sTUFBTSxrQkFBa0IsQ0FBQztBQUNoRCxPQUFPLEVBQUMsUUFBUSxFQUFVLE1BQU0sWUFBWSxDQUFDO0FBRTdDOzs7O0dBSUc7QUFnQkgsTUFBTSxPQUFPLGdCQUFpQixTQUFRLHFCQUFxQjtJQUl6RCxZQUNtQixvQkFBK0MsRUFDaEUsT0FBZ0MsRUFDaEMsTUFBYyxFQUNnQixVQUFpQixFQUNqQixPQUFpQixFQUNuQyxHQUFvQjtJQUNoQyx3RkFBd0Y7SUFDeEYsa0ZBQWtGO0lBQ2xGLCtDQUErQztJQUMzQixXQUFnQztRQUVwRCxLQUFLLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFFLEdBQUcsRUFBRSxXQUFXLENBQUMsQ0FBQztRQVg3Qyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQTJCO1FBYWhFLElBQUksQ0FBQywyQkFBMkIsRUFBRSxDQUFDO0lBQ3JDLENBQUM7SUFFRCwrRkFBK0Y7SUFDdkYsMkJBQTJCO1FBQ2pDLElBQUksQ0FBQyx5QkFBeUIsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsTUFBTSxDQUMvRCxDQUFDLEVBQVUsRUFBRSxJQUFZLEVBQUUsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxDQUNwRixDQUFDO0lBQ0osQ0FBQztJQUVELHFEQUFxRDtJQUNyRCxPQUFPO1FBQ0wsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBRWhCLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ2xCLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDdEQ7SUFDSCxDQUFDO0lBRUQsV0FBVztRQUNULEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUNwQixJQUFJLENBQUMseUJBQXlCLEVBQUUsQ0FBQztJQUNuQyxDQUFDOzs7WUF2REYsU0FBUyxTQUFDO2dCQUNULFFBQVEsRUFBRSxvQkFBb0I7Z0JBQzlCLFFBQVEsRUFBRSxrQkFBa0I7Z0JBQzVCLElBQUksRUFBRTtvQkFDSixZQUFZLEVBQUUsV0FBVztvQkFDekIsTUFBTSxFQUFFLFFBQVE7b0JBQ2hCLE1BQU0sRUFBRSxlQUFlO29CQUN2QixxQkFBcUIsRUFBRSxpQkFBaUI7b0JBQ3hDLHNCQUFzQixFQUFFLGtCQUFrQjtpQkFDM0M7Z0JBQ0QsU0FBUyxFQUFFO29CQUNULEVBQUMsT0FBTyxFQUFFLHFCQUFxQixFQUFFLFdBQVcsRUFBRSxnQkFBZ0IsRUFBQztvQkFDL0QsRUFBQyxPQUFPLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBRSxxQkFBcUIsRUFBQztpQkFDM0Q7YUFDRjs7O1lBNUJPLHlCQUF5QjtZQUNILFVBQVU7WUFBMEIsTUFBTTs0Q0FvQ25FLFFBQVEsWUFBSSxNQUFNLFNBQUMsUUFBUTs0Q0FDM0IsUUFBUSxZQUFJLE1BQU0sU0FBQyxRQUFRO1lBcEN4QixjQUFjLHVCQXFDakIsUUFBUTtZQWxDTCxrQkFBa0IsdUJBc0NyQixJQUFJLFlBQUksUUFBUSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtVbmlxdWVTZWxlY3Rpb25EaXNwYXRjaGVyfSBmcm9tICdAYW5ndWxhci9jZGsvY29sbGVjdGlvbnMnO1xuaW1wb3J0IHtEaXJlY3RpdmUsIE9uRGVzdHJveSwgRWxlbWVudFJlZiwgU2VsZiwgT3B0aW9uYWwsIEluamVjdCwgTmdab25lfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7RGlyZWN0aW9uYWxpdHl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9iaWRpJztcbmltcG9ydCB7Q2RrTWVudUl0ZW1TZWxlY3RhYmxlfSBmcm9tICcuL21lbnUtaXRlbS1zZWxlY3RhYmxlJztcbmltcG9ydCB7Q2RrTWVudUl0ZW19IGZyb20gJy4vbWVudS1pdGVtJztcbmltcG9ydCB7Q2RrTWVudUl0ZW1UcmlnZ2VyfSBmcm9tICcuL21lbnUtaXRlbS10cmlnZ2VyJztcbmltcG9ydCB7Q0RLX01FTlUsIE1lbnV9IGZyb20gJy4vbWVudS1pbnRlcmZhY2UnO1xuaW1wb3J0IHtNRU5VX0FJTSwgTWVudUFpbX0gZnJvbSAnLi9tZW51LWFpbSc7XG5cbi8qKlxuICogQSBkaXJlY3RpdmUgcHJvdmlkaW5nIGJlaGF2aW9yIGZvciB0aGUgdGhlIFwibWVudWl0ZW1yYWRpb1wiIEFSSUEgcm9sZSwgd2hpY2ggYmVoYXZlcyBzaW1pbGFybHkgdG9cbiAqIGEgY29udmVudGlvbmFsIHJhZGlvLWJ1dHRvbi4gQW55IHNpYmxpbmcgYENka01lbnVJdGVtUmFkaW9gIGluc3RhbmNlcyB3aXRoaW4gdGhlIHNhbWUgYENka01lbnVgXG4gKiBvciBgQ2RrTWVudUdyb3VwYCBjb21wcmlzZSBhIHJhZGlvIGdyb3VwIHdpdGggdW5pcXVlIHNlbGVjdGlvbiBlbmZvcmNlZC5cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW2Nka01lbnVJdGVtUmFkaW9dJyxcbiAgZXhwb3J0QXM6ICdjZGtNZW51SXRlbVJhZGlvJyxcbiAgaG9zdDoge1xuICAgICdbdGFiaW5kZXhdJzogJ190YWJpbmRleCcsXG4gICAgJ3R5cGUnOiAnYnV0dG9uJyxcbiAgICAncm9sZSc6ICdtZW51aXRlbXJhZGlvJyxcbiAgICAnW2F0dHIuYXJpYS1jaGVja2VkXSc6ICdjaGVja2VkIHx8IG51bGwnLFxuICAgICdbYXR0ci5hcmlhLWRpc2FibGVkXSc6ICdkaXNhYmxlZCB8fCBudWxsJyxcbiAgfSxcbiAgcHJvdmlkZXJzOiBbXG4gICAge3Byb3ZpZGU6IENka01lbnVJdGVtU2VsZWN0YWJsZSwgdXNlRXhpc3Rpbmc6IENka01lbnVJdGVtUmFkaW99LFxuICAgIHtwcm92aWRlOiBDZGtNZW51SXRlbSwgdXNlRXhpc3Rpbmc6IENka01lbnVJdGVtU2VsZWN0YWJsZX0sXG4gIF0sXG59KVxuZXhwb3J0IGNsYXNzIENka01lbnVJdGVtUmFkaW8gZXh0ZW5kcyBDZGtNZW51SXRlbVNlbGVjdGFibGUgaW1wbGVtZW50cyBPbkRlc3Ryb3kge1xuICAvKiogRnVuY3Rpb24gdG8gdW5yZWdpc3RlciB0aGUgc2VsZWN0aW9uIGRpc3BhdGNoZXIgKi9cbiAgcHJpdmF0ZSBfcmVtb3ZlRGlzcGF0Y2hlckxpc3RlbmVyOiAoKSA9PiB2b2lkO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgcmVhZG9ubHkgX3NlbGVjdGlvbkRpc3BhdGNoZXI6IFVuaXF1ZVNlbGVjdGlvbkRpc3BhdGNoZXIsXG4gICAgZWxlbWVudDogRWxlbWVudFJlZjxIVE1MRWxlbWVudD4sXG4gICAgbmdab25lOiBOZ1pvbmUsXG4gICAgQE9wdGlvbmFsKCkgQEluamVjdChDREtfTUVOVSkgcGFyZW50TWVudT86IE1lbnUsXG4gICAgQE9wdGlvbmFsKCkgQEluamVjdChNRU5VX0FJTSkgbWVudUFpbT86IE1lbnVBaW0sXG4gICAgQE9wdGlvbmFsKCkgZGlyPzogRGlyZWN0aW9uYWxpdHksXG4gICAgLyoqIFJlZmVyZW5jZSB0byB0aGUgQ2RrTWVudUl0ZW1UcmlnZ2VyIGRpcmVjdGl2ZSBpZiBvbmUgaXMgYWRkZWQgdG8gdGhlIHNhbWUgZWxlbWVudCAqL1xuICAgIC8vIGBDZGtNZW51SXRlbVJhZGlvYCBpcyBjb21tb25seSB1c2VkIGluIGNvbWJpbmF0aW9uIHdpdGggYSBgQ2RrTWVudUl0ZW1UcmlnZ2VyYC5cbiAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6IGxpZ2h0d2VpZ2h0LXRva2Vuc1xuICAgIEBTZWxmKCkgQE9wdGlvbmFsKCkgbWVudVRyaWdnZXI/OiBDZGtNZW51SXRlbVRyaWdnZXJcbiAgKSB7XG4gICAgc3VwZXIoZWxlbWVudCwgbmdab25lLCBwYXJlbnRNZW51LCBtZW51QWltLCBkaXIsIG1lbnVUcmlnZ2VyKTtcblxuICAgIHRoaXMuX3JlZ2lzdGVyRGlzcGF0Y2hlckxpc3RlbmVyKCk7XG4gIH1cblxuICAvKiogQ29uZmlndXJlIHRoZSB1bmlxdWUgc2VsZWN0aW9uIGRpc3BhdGNoZXIgbGlzdGVuZXIgaW4gb3JkZXIgdG8gdG9nZ2xlIHRoZSBjaGVja2VkIHN0YXRlICAqL1xuICBwcml2YXRlIF9yZWdpc3RlckRpc3BhdGNoZXJMaXN0ZW5lcigpIHtcbiAgICB0aGlzLl9yZW1vdmVEaXNwYXRjaGVyTGlzdGVuZXIgPSB0aGlzLl9zZWxlY3Rpb25EaXNwYXRjaGVyLmxpc3RlbihcbiAgICAgIChpZDogc3RyaW5nLCBuYW1lOiBzdHJpbmcpID0+ICh0aGlzLmNoZWNrZWQgPSB0aGlzLmlkID09PSBpZCAmJiB0aGlzLm5hbWUgPT09IG5hbWUpXG4gICAgKTtcbiAgfVxuXG4gIC8qKiBUb2dnbGVzIHRoZSBjaGVja2VkIHN0YXRlIG9mIHRoZSByYWRpby1idXR0b24uICovXG4gIHRyaWdnZXIoKSB7XG4gICAgc3VwZXIudHJpZ2dlcigpO1xuXG4gICAgaWYgKCF0aGlzLmRpc2FibGVkKSB7XG4gICAgICB0aGlzLl9zZWxlY3Rpb25EaXNwYXRjaGVyLm5vdGlmeSh0aGlzLmlkLCB0aGlzLm5hbWUpO1xuICAgIH1cbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIHN1cGVyLm5nT25EZXN0cm95KCk7XG4gICAgdGhpcy5fcmVtb3ZlRGlzcGF0Y2hlckxpc3RlbmVyKCk7XG4gIH1cbn1cbiJdfQ==