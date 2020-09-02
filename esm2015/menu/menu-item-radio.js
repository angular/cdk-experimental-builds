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
/**
 * A directive providing behavior for the the "menuitemradio" ARIA role, which behaves similarly to
 * a conventional radio-button. Any sibling `CdkMenuItemRadio` instances within the same `CdkMenu`
 * or `CdkMenuGroup` comprise a radio group with unique selection enforced.
 */
export class CdkMenuItemRadio extends CdkMenuItemSelectable {
    constructor(_selectionDispatcher, element, ngZone, parentMenu, dir, 
    /** Reference to the CdkMenuItemTrigger directive if one is added to the same element */
    // `CdkMenuItemRadio` is commonly used in combination with a `CdkMenuItemTrigger`.
    // tslint:disable-next-line: lightweight-tokens
    menuTrigger) {
        super(element, parentMenu, ngZone, dir, menuTrigger);
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
    { type: undefined, decorators: [{ type: Inject, args: [CDK_MENU,] }] },
    { type: Directionality, decorators: [{ type: Optional }] },
    { type: CdkMenuItemTrigger, decorators: [{ type: Self }, { type: Optional }] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1pdGVtLXJhZGlvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvbWVudS9tZW51LWl0ZW0tcmFkaW8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBQ0gsT0FBTyxFQUFDLHlCQUF5QixFQUFDLE1BQU0sMEJBQTBCLENBQUM7QUFDbkUsT0FBTyxFQUFDLFNBQVMsRUFBYSxVQUFVLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQy9GLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUNqRCxPQUFPLEVBQUMscUJBQXFCLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQztBQUM3RCxPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0sYUFBYSxDQUFDO0FBQ3hDLE9BQU8sRUFBQyxrQkFBa0IsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQ3ZELE9BQU8sRUFBQyxRQUFRLEVBQU8sTUFBTSxrQkFBa0IsQ0FBQztBQUVoRDs7OztHQUlHO0FBZ0JILE1BQU0sT0FBTyxnQkFBaUIsU0FBUSxxQkFBcUI7SUFJekQsWUFDbUIsb0JBQStDLEVBQ2hFLE9BQWdDLEVBQ2hDLE1BQWMsRUFDSSxVQUFnQixFQUN0QixHQUFvQjtJQUNoQyx3RkFBd0Y7SUFDeEYsa0ZBQWtGO0lBQ2xGLCtDQUErQztJQUMzQixXQUFnQztRQUVwRCxLQUFLLENBQUMsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBVnBDLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBMkI7UUFZaEUsSUFBSSxDQUFDLDJCQUEyQixFQUFFLENBQUM7SUFDckMsQ0FBQztJQUVELCtGQUErRjtJQUN2RiwyQkFBMkI7UUFDakMsSUFBSSxDQUFDLHlCQUF5QixHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLENBQy9ELENBQUMsRUFBVSxFQUFFLElBQVksRUFBRSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxFQUFFLEtBQUssRUFBRSxJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssSUFBSSxDQUFDLENBQ3BGLENBQUM7SUFDSixDQUFDO0lBRUQscURBQXFEO0lBQ3JELE9BQU87UUFDTCxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7UUFFaEIsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDbEIsSUFBSSxDQUFDLG9CQUFvQixDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN0RDtJQUNILENBQUM7SUFFRCxXQUFXO1FBQ1QsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ3BCLElBQUksQ0FBQyx5QkFBeUIsRUFBRSxDQUFDO0lBQ25DLENBQUM7OztZQXRERixTQUFTLFNBQUM7Z0JBQ1QsUUFBUSxFQUFFLG9CQUFvQjtnQkFDOUIsUUFBUSxFQUFFLGtCQUFrQjtnQkFDNUIsSUFBSSxFQUFFO29CQUNKLFlBQVksRUFBRSxXQUFXO29CQUN6QixNQUFNLEVBQUUsUUFBUTtvQkFDaEIsTUFBTSxFQUFFLGVBQWU7b0JBQ3ZCLHFCQUFxQixFQUFFLGlCQUFpQjtvQkFDeEMsc0JBQXNCLEVBQUUsa0JBQWtCO2lCQUMzQztnQkFDRCxTQUFTLEVBQUU7b0JBQ1QsRUFBQyxPQUFPLEVBQUUscUJBQXFCLEVBQUUsV0FBVyxFQUFFLGdCQUFnQixFQUFDO29CQUMvRCxFQUFDLE9BQU8sRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLHFCQUFxQixFQUFDO2lCQUMzRDthQUNGOzs7WUEzQk8seUJBQXlCO1lBQ0gsVUFBVTtZQUEwQixNQUFNOzRDQW1DbkUsTUFBTSxTQUFDLFFBQVE7WUFsQ1osY0FBYyx1QkFtQ2pCLFFBQVE7WUFoQ0wsa0JBQWtCLHVCQW9DckIsSUFBSSxZQUFJLFFBQVEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7VW5pcXVlU2VsZWN0aW9uRGlzcGF0Y2hlcn0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvbGxlY3Rpb25zJztcbmltcG9ydCB7RGlyZWN0aXZlLCBPbkRlc3Ryb3ksIEVsZW1lbnRSZWYsIFNlbGYsIE9wdGlvbmFsLCBJbmplY3QsIE5nWm9uZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0RpcmVjdGlvbmFsaXR5fSBmcm9tICdAYW5ndWxhci9jZGsvYmlkaSc7XG5pbXBvcnQge0Nka01lbnVJdGVtU2VsZWN0YWJsZX0gZnJvbSAnLi9tZW51LWl0ZW0tc2VsZWN0YWJsZSc7XG5pbXBvcnQge0Nka01lbnVJdGVtfSBmcm9tICcuL21lbnUtaXRlbSc7XG5pbXBvcnQge0Nka01lbnVJdGVtVHJpZ2dlcn0gZnJvbSAnLi9tZW51LWl0ZW0tdHJpZ2dlcic7XG5pbXBvcnQge0NES19NRU5VLCBNZW51fSBmcm9tICcuL21lbnUtaW50ZXJmYWNlJztcblxuLyoqXG4gKiBBIGRpcmVjdGl2ZSBwcm92aWRpbmcgYmVoYXZpb3IgZm9yIHRoZSB0aGUgXCJtZW51aXRlbXJhZGlvXCIgQVJJQSByb2xlLCB3aGljaCBiZWhhdmVzIHNpbWlsYXJseSB0b1xuICogYSBjb252ZW50aW9uYWwgcmFkaW8tYnV0dG9uLiBBbnkgc2libGluZyBgQ2RrTWVudUl0ZW1SYWRpb2AgaW5zdGFuY2VzIHdpdGhpbiB0aGUgc2FtZSBgQ2RrTWVudWBcbiAqIG9yIGBDZGtNZW51R3JvdXBgIGNvbXByaXNlIGEgcmFkaW8gZ3JvdXAgd2l0aCB1bmlxdWUgc2VsZWN0aW9uIGVuZm9yY2VkLlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbY2RrTWVudUl0ZW1SYWRpb10nLFxuICBleHBvcnRBczogJ2Nka01lbnVJdGVtUmFkaW8nLFxuICBob3N0OiB7XG4gICAgJ1t0YWJpbmRleF0nOiAnX3RhYmluZGV4JyxcbiAgICAndHlwZSc6ICdidXR0b24nLFxuICAgICdyb2xlJzogJ21lbnVpdGVtcmFkaW8nLFxuICAgICdbYXR0ci5hcmlhLWNoZWNrZWRdJzogJ2NoZWNrZWQgfHwgbnVsbCcsXG4gICAgJ1thdHRyLmFyaWEtZGlzYWJsZWRdJzogJ2Rpc2FibGVkIHx8IG51bGwnLFxuICB9LFxuICBwcm92aWRlcnM6IFtcbiAgICB7cHJvdmlkZTogQ2RrTWVudUl0ZW1TZWxlY3RhYmxlLCB1c2VFeGlzdGluZzogQ2RrTWVudUl0ZW1SYWRpb30sXG4gICAge3Byb3ZpZGU6IENka01lbnVJdGVtLCB1c2VFeGlzdGluZzogQ2RrTWVudUl0ZW1TZWxlY3RhYmxlfSxcbiAgXSxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrTWVudUl0ZW1SYWRpbyBleHRlbmRzIENka01lbnVJdGVtU2VsZWN0YWJsZSBpbXBsZW1lbnRzIE9uRGVzdHJveSB7XG4gIC8qKiBGdW5jdGlvbiB0byB1bnJlZ2lzdGVyIHRoZSBzZWxlY3Rpb24gZGlzcGF0Y2hlciAqL1xuICBwcml2YXRlIF9yZW1vdmVEaXNwYXRjaGVyTGlzdGVuZXI6ICgpID0+IHZvaWQ7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSByZWFkb25seSBfc2VsZWN0aW9uRGlzcGF0Y2hlcjogVW5pcXVlU2VsZWN0aW9uRGlzcGF0Y2hlcixcbiAgICBlbGVtZW50OiBFbGVtZW50UmVmPEhUTUxFbGVtZW50PixcbiAgICBuZ1pvbmU6IE5nWm9uZSxcbiAgICBASW5qZWN0KENES19NRU5VKSBwYXJlbnRNZW51OiBNZW51LFxuICAgIEBPcHRpb25hbCgpIGRpcj86IERpcmVjdGlvbmFsaXR5LFxuICAgIC8qKiBSZWZlcmVuY2UgdG8gdGhlIENka01lbnVJdGVtVHJpZ2dlciBkaXJlY3RpdmUgaWYgb25lIGlzIGFkZGVkIHRvIHRoZSBzYW1lIGVsZW1lbnQgKi9cbiAgICAvLyBgQ2RrTWVudUl0ZW1SYWRpb2AgaXMgY29tbW9ubHkgdXNlZCBpbiBjb21iaW5hdGlvbiB3aXRoIGEgYENka01lbnVJdGVtVHJpZ2dlcmAuXG4gICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOiBsaWdodHdlaWdodC10b2tlbnNcbiAgICBAU2VsZigpIEBPcHRpb25hbCgpIG1lbnVUcmlnZ2VyPzogQ2RrTWVudUl0ZW1UcmlnZ2VyXG4gICkge1xuICAgIHN1cGVyKGVsZW1lbnQsIHBhcmVudE1lbnUsIG5nWm9uZSwgZGlyLCBtZW51VHJpZ2dlcik7XG5cbiAgICB0aGlzLl9yZWdpc3RlckRpc3BhdGNoZXJMaXN0ZW5lcigpO1xuICB9XG5cbiAgLyoqIENvbmZpZ3VyZSB0aGUgdW5pcXVlIHNlbGVjdGlvbiBkaXNwYXRjaGVyIGxpc3RlbmVyIGluIG9yZGVyIHRvIHRvZ2dsZSB0aGUgY2hlY2tlZCBzdGF0ZSAgKi9cbiAgcHJpdmF0ZSBfcmVnaXN0ZXJEaXNwYXRjaGVyTGlzdGVuZXIoKSB7XG4gICAgdGhpcy5fcmVtb3ZlRGlzcGF0Y2hlckxpc3RlbmVyID0gdGhpcy5fc2VsZWN0aW9uRGlzcGF0Y2hlci5saXN0ZW4oXG4gICAgICAoaWQ6IHN0cmluZywgbmFtZTogc3RyaW5nKSA9PiAodGhpcy5jaGVja2VkID0gdGhpcy5pZCA9PT0gaWQgJiYgdGhpcy5uYW1lID09PSBuYW1lKVxuICAgICk7XG4gIH1cblxuICAvKiogVG9nZ2xlcyB0aGUgY2hlY2tlZCBzdGF0ZSBvZiB0aGUgcmFkaW8tYnV0dG9uLiAqL1xuICB0cmlnZ2VyKCkge1xuICAgIHN1cGVyLnRyaWdnZXIoKTtcblxuICAgIGlmICghdGhpcy5kaXNhYmxlZCkge1xuICAgICAgdGhpcy5fc2VsZWN0aW9uRGlzcGF0Y2hlci5ub3RpZnkodGhpcy5pZCwgdGhpcy5uYW1lKTtcbiAgICB9XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICBzdXBlci5uZ09uRGVzdHJveSgpO1xuICAgIHRoaXMuX3JlbW92ZURpc3BhdGNoZXJMaXN0ZW5lcigpO1xuICB9XG59XG4iXX0=