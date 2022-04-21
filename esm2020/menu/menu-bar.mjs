/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, ElementRef, Inject, NgZone, Optional, Self, } from '@angular/core';
import { Directionality } from '@angular/cdk/bidi';
import { DOWN_ARROW, ESCAPE, hasModifierKey, LEFT_ARROW, RIGHT_ARROW, TAB, UP_ARROW, } from '@angular/cdk/keycodes';
import { takeUntil } from 'rxjs/operators';
import { CdkMenuGroup } from './menu-group';
import { CDK_MENU } from './menu-interface';
import { MENU_STACK, MenuStack } from './menu-stack';
import { MENU_AIM } from './menu-aim';
import { CdkMenuBase } from './menu-base';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/bidi";
import * as i2 from "./menu-stack";
/**
 * Directive applied to an element which configures it as a MenuBar by setting the appropriate
 * role, aria attributes, and accessible keyboard and mouse handling logic. The component that
 * this directive is applied to should contain components marked with CdkMenuItem.
 *
 */
export class CdkMenuBar extends CdkMenuBase {
    constructor(
    /** The host element. */
    elementRef, 
    /** The Angular zone. */
    ngZone, 
    /** The menu stack this menu is part of. */
    menuStack, 
    /** The menu aim service used by this menu. */
    menuAim, 
    /** The directionality of the page. */
    dir) {
        super(elementRef, ngZone, menuStack, menuAim, dir);
        /** The direction items in the menu flow. */
        this.orientation = 'horizontal';
        /** Whether the menu is displayed inline (i.e. always present vs a conditional popup that the user triggers with a trigger element). */
        this.isInline = true;
    }
    ngAfterContentInit() {
        super.ngAfterContentInit();
        this._subscribeToMenuStackEmptied();
    }
    /**
     * Handle keyboard events for the Menu.
     * @param event The keyboard event to be handled.
     */
    _handleKeyEvent(event) {
        const keyManager = this.keyManager;
        switch (event.keyCode) {
            case UP_ARROW:
            case DOWN_ARROW:
            case LEFT_ARROW:
            case RIGHT_ARROW:
                if (!hasModifierKey(event)) {
                    const horizontalArrows = event.keyCode === LEFT_ARROW || event.keyCode === RIGHT_ARROW;
                    // For a horizontal menu if the left/right keys were clicked, or a vertical menu if the
                    // up/down keys were clicked: if the current menu is open, close it then focus and open the
                    // next  menu.
                    if (horizontalArrows) {
                        event.preventDefault();
                        const prevIsOpen = keyManager.activeItem?.isMenuOpen();
                        keyManager.activeItem?.getMenuTrigger()?.close();
                        keyManager.setFocusOrigin('keyboard');
                        keyManager.onKeydown(event);
                        if (prevIsOpen) {
                            keyManager.activeItem?.getMenuTrigger()?.open();
                        }
                    }
                }
                break;
            case ESCAPE:
                if (!hasModifierKey(event)) {
                    event.preventDefault();
                    keyManager.activeItem?.getMenuTrigger()?.close();
                }
                break;
            case TAB:
                if (!hasModifierKey(event, 'altKey', 'metaKey', 'ctrlKey')) {
                    keyManager.activeItem?.getMenuTrigger()?.close();
                }
                break;
            default:
                keyManager.onKeydown(event);
        }
    }
    /**
     * Set focus to either the current, previous or next item based on the FocusNext event, then
     * open the previous or next item.
     * @param focusNext The element to focus.
     */
    _toggleOpenMenu(focusNext) {
        const keyManager = this.keyManager;
        switch (focusNext) {
            case 0 /* nextItem */:
                keyManager.setFocusOrigin('keyboard');
                keyManager.setNextItemActive();
                keyManager.activeItem?.getMenuTrigger()?.open();
                break;
            case 1 /* previousItem */:
                keyManager.setFocusOrigin('keyboard');
                keyManager.setPreviousItemActive();
                keyManager.activeItem?.getMenuTrigger()?.open();
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
        this.menuStack?.emptied
            .pipe(takeUntil(this.destroyed))
            .subscribe(event => this._toggleOpenMenu(event));
    }
}
CdkMenuBar.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.0.0-next.14", ngImport: i0, type: CdkMenuBar, deps: [{ token: i0.ElementRef }, { token: i0.NgZone }, { token: MENU_STACK }, { token: MENU_AIM, optional: true, self: true }, { token: i1.Directionality, optional: true }], target: i0.ɵɵFactoryTarget.Directive });
CdkMenuBar.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "14.0.0-next.14", type: CdkMenuBar, selector: "[cdkMenuBar]", host: { attributes: { "role": "menubar" }, listeners: { "keydown": "_handleKeyEvent($event)" }, classAttribute: "cdk-menu-bar" }, providers: [
        { provide: CdkMenuGroup, useExisting: CdkMenuBar },
        { provide: CDK_MENU, useExisting: CdkMenuBar },
        { provide: MENU_STACK, useFactory: () => MenuStack.inline('horizontal') },
    ], exportAs: ["cdkMenuBar"], usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.0.0-next.14", ngImport: i0, type: CdkMenuBar, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkMenuBar]',
                    exportAs: 'cdkMenuBar',
                    host: {
                        'role': 'menubar',
                        'class': 'cdk-menu-bar',
                        '(keydown)': '_handleKeyEvent($event)',
                    },
                    providers: [
                        { provide: CdkMenuGroup, useExisting: CdkMenuBar },
                        { provide: CDK_MENU, useExisting: CdkMenuBar },
                        { provide: MENU_STACK, useFactory: () => MenuStack.inline('horizontal') },
                    ],
                }]
        }], ctorParameters: function () { return [{ type: i0.ElementRef }, { type: i0.NgZone }, { type: i2.MenuStack, decorators: [{
                    type: Inject,
                    args: [MENU_STACK]
                }] }, { type: undefined, decorators: [{
                    type: Self
                }, {
                    type: Optional
                }, {
                    type: Inject,
                    args: [MENU_AIM]
                }] }, { type: i1.Directionality, decorators: [{
                    type: Optional
                }] }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1iYXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrLWV4cGVyaW1lbnRhbC9tZW51L21lbnUtYmFyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFFTCxTQUFTLEVBQ1QsVUFBVSxFQUNWLE1BQU0sRUFDTixNQUFNLEVBQ04sUUFBUSxFQUNSLElBQUksR0FDTCxNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDakQsT0FBTyxFQUNMLFVBQVUsRUFDVixNQUFNLEVBQ04sY0FBYyxFQUNkLFVBQVUsRUFDVixXQUFXLEVBQ1gsR0FBRyxFQUNILFFBQVEsR0FDVCxNQUFNLHVCQUF1QixDQUFDO0FBQy9CLE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUN6QyxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sY0FBYyxDQUFDO0FBQzFDLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUMxQyxPQUFPLEVBQVksVUFBVSxFQUFFLFNBQVMsRUFBQyxNQUFNLGNBQWMsQ0FBQztBQUM5RCxPQUFPLEVBQUMsUUFBUSxFQUFVLE1BQU0sWUFBWSxDQUFDO0FBQzdDLE9BQU8sRUFBQyxXQUFXLEVBQUMsTUFBTSxhQUFhLENBQUM7Ozs7QUFFeEM7Ozs7O0dBS0c7QUFlSCxNQUFNLE9BQU8sVUFBVyxTQUFRLFdBQVc7SUFPekM7SUFDRSx3QkFBd0I7SUFDeEIsVUFBbUM7SUFDbkMsd0JBQXdCO0lBQ3hCLE1BQWM7SUFDZCwyQ0FBMkM7SUFDdkIsU0FBb0I7SUFDeEMsOENBQThDO0lBQ1IsT0FBaUI7SUFDdkQsc0NBQXNDO0lBQzFCLEdBQW9CO1FBRWhDLEtBQUssQ0FBQyxVQUFVLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFsQnJELDRDQUE0QztRQUMxQixnQkFBVyxHQUFHLFlBQVksQ0FBQztRQUU3Qyx1SUFBdUk7UUFDckgsYUFBUSxHQUFHLElBQUksQ0FBQztJQWVsQyxDQUFDO0lBRVEsa0JBQWtCO1FBQ3pCLEtBQUssQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBQzNCLElBQUksQ0FBQyw0QkFBNEIsRUFBRSxDQUFDO0lBQ3RDLENBQUM7SUFFRDs7O09BR0c7SUFDSCxlQUFlLENBQUMsS0FBb0I7UUFDbEMsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQztRQUNuQyxRQUFRLEtBQUssQ0FBQyxPQUFPLEVBQUU7WUFDckIsS0FBSyxRQUFRLENBQUM7WUFDZCxLQUFLLFVBQVUsQ0FBQztZQUNoQixLQUFLLFVBQVUsQ0FBQztZQUNoQixLQUFLLFdBQVc7Z0JBQ2QsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsRUFBRTtvQkFDMUIsTUFBTSxnQkFBZ0IsR0FBRyxLQUFLLENBQUMsT0FBTyxLQUFLLFVBQVUsSUFBSSxLQUFLLENBQUMsT0FBTyxLQUFLLFdBQVcsQ0FBQztvQkFDdkYsdUZBQXVGO29CQUN2RiwyRkFBMkY7b0JBQzNGLGNBQWM7b0JBQ2QsSUFBSSxnQkFBZ0IsRUFBRTt3QkFDcEIsS0FBSyxDQUFDLGNBQWMsRUFBRSxDQUFDO3dCQUV2QixNQUFNLFVBQVUsR0FBRyxVQUFVLENBQUMsVUFBVSxFQUFFLFVBQVUsRUFBRSxDQUFDO3dCQUN2RCxVQUFVLENBQUMsVUFBVSxFQUFFLGNBQWMsRUFBRSxFQUFFLEtBQUssRUFBRSxDQUFDO3dCQUVqRCxVQUFVLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxDQUFDO3dCQUN0QyxVQUFVLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO3dCQUM1QixJQUFJLFVBQVUsRUFBRTs0QkFDZCxVQUFVLENBQUMsVUFBVSxFQUFFLGNBQWMsRUFBRSxFQUFFLElBQUksRUFBRSxDQUFDO3lCQUNqRDtxQkFDRjtpQkFDRjtnQkFDRCxNQUFNO1lBRVIsS0FBSyxNQUFNO2dCQUNULElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLEVBQUU7b0JBQzFCLEtBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQztvQkFDdkIsVUFBVSxDQUFDLFVBQVUsRUFBRSxjQUFjLEVBQUUsRUFBRSxLQUFLLEVBQUUsQ0FBQztpQkFDbEQ7Z0JBQ0QsTUFBTTtZQUVSLEtBQUssR0FBRztnQkFDTixJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLFNBQVMsQ0FBQyxFQUFFO29CQUMxRCxVQUFVLENBQUMsVUFBVSxFQUFFLGNBQWMsRUFBRSxFQUFFLEtBQUssRUFBRSxDQUFDO2lCQUNsRDtnQkFDRCxNQUFNO1lBRVI7Z0JBQ0UsVUFBVSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUMvQjtJQUNILENBQUM7SUFFRDs7OztPQUlHO0lBQ0ssZUFBZSxDQUFDLFNBQWdDO1FBQ3RELE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7UUFDbkMsUUFBUSxTQUFTLEVBQUU7WUFDakI7Z0JBQ0UsVUFBVSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFDdEMsVUFBVSxDQUFDLGlCQUFpQixFQUFFLENBQUM7Z0JBQy9CLFVBQVUsQ0FBQyxVQUFVLEVBQUUsY0FBYyxFQUFFLEVBQUUsSUFBSSxFQUFFLENBQUM7Z0JBQ2hELE1BQU07WUFFUjtnQkFDRSxVQUFVLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUN0QyxVQUFVLENBQUMscUJBQXFCLEVBQUUsQ0FBQztnQkFDbkMsVUFBVSxDQUFDLFVBQVUsRUFBRSxjQUFjLEVBQUUsRUFBRSxJQUFJLEVBQUUsQ0FBQztnQkFDaEQsTUFBTTtZQUVSO2dCQUNFLElBQUksVUFBVSxDQUFDLFVBQVUsRUFBRTtvQkFDekIsVUFBVSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQztvQkFDdEMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUM7aUJBQ2pEO2dCQUNELE1BQU07U0FDVDtJQUNILENBQUM7SUFFRCxpREFBaUQ7SUFDekMsNEJBQTRCO1FBQ2xDLElBQUksQ0FBQyxTQUFTLEVBQUUsT0FBTzthQUNwQixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQzthQUMvQixTQUFTLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDckQsQ0FBQzs7K0dBOUdVLFVBQVUsa0VBYVgsVUFBVSxhQUVVLFFBQVE7bUdBZjNCLFVBQVUseUtBTlY7UUFDVCxFQUFDLE9BQU8sRUFBRSxZQUFZLEVBQUUsV0FBVyxFQUFFLFVBQVUsRUFBQztRQUNoRCxFQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLFVBQVUsRUFBQztRQUM1QyxFQUFDLE9BQU8sRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLEdBQUcsRUFBRSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLEVBQUM7S0FDeEU7bUdBRVUsVUFBVTtrQkFkdEIsU0FBUzttQkFBQztvQkFDVCxRQUFRLEVBQUUsY0FBYztvQkFDeEIsUUFBUSxFQUFFLFlBQVk7b0JBQ3RCLElBQUksRUFBRTt3QkFDSixNQUFNLEVBQUUsU0FBUzt3QkFDakIsT0FBTyxFQUFFLGNBQWM7d0JBQ3ZCLFdBQVcsRUFBRSx5QkFBeUI7cUJBQ3ZDO29CQUNELFNBQVMsRUFBRTt3QkFDVCxFQUFDLE9BQU8sRUFBRSxZQUFZLEVBQUUsV0FBVyxZQUFZLEVBQUM7d0JBQ2hELEVBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxXQUFXLFlBQVksRUFBQzt3QkFDNUMsRUFBQyxPQUFPLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxFQUFDO3FCQUN4RTtpQkFDRjs7MEJBY0ksTUFBTTsyQkFBQyxVQUFVOzswQkFFakIsSUFBSTs7MEJBQUksUUFBUTs7MEJBQUksTUFBTTsyQkFBQyxRQUFROzswQkFFbkMsUUFBUSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1xuICBBZnRlckNvbnRlbnRJbml0LFxuICBEaXJlY3RpdmUsXG4gIEVsZW1lbnRSZWYsXG4gIEluamVjdCxcbiAgTmdab25lLFxuICBPcHRpb25hbCxcbiAgU2VsZixcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0RpcmVjdGlvbmFsaXR5fSBmcm9tICdAYW5ndWxhci9jZGsvYmlkaSc7XG5pbXBvcnQge1xuICBET1dOX0FSUk9XLFxuICBFU0NBUEUsXG4gIGhhc01vZGlmaWVyS2V5LFxuICBMRUZUX0FSUk9XLFxuICBSSUdIVF9BUlJPVyxcbiAgVEFCLFxuICBVUF9BUlJPVyxcbn0gZnJvbSAnQGFuZ3VsYXIvY2RrL2tleWNvZGVzJztcbmltcG9ydCB7dGFrZVVudGlsfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5pbXBvcnQge0Nka01lbnVHcm91cH0gZnJvbSAnLi9tZW51LWdyb3VwJztcbmltcG9ydCB7Q0RLX01FTlV9IGZyb20gJy4vbWVudS1pbnRlcmZhY2UnO1xuaW1wb3J0IHtGb2N1c05leHQsIE1FTlVfU1RBQ0ssIE1lbnVTdGFja30gZnJvbSAnLi9tZW51LXN0YWNrJztcbmltcG9ydCB7TUVOVV9BSU0sIE1lbnVBaW19IGZyb20gJy4vbWVudS1haW0nO1xuaW1wb3J0IHtDZGtNZW51QmFzZX0gZnJvbSAnLi9tZW51LWJhc2UnO1xuXG4vKipcbiAqIERpcmVjdGl2ZSBhcHBsaWVkIHRvIGFuIGVsZW1lbnQgd2hpY2ggY29uZmlndXJlcyBpdCBhcyBhIE1lbnVCYXIgYnkgc2V0dGluZyB0aGUgYXBwcm9wcmlhdGVcbiAqIHJvbGUsIGFyaWEgYXR0cmlidXRlcywgYW5kIGFjY2Vzc2libGUga2V5Ym9hcmQgYW5kIG1vdXNlIGhhbmRsaW5nIGxvZ2ljLiBUaGUgY29tcG9uZW50IHRoYXRcbiAqIHRoaXMgZGlyZWN0aXZlIGlzIGFwcGxpZWQgdG8gc2hvdWxkIGNvbnRhaW4gY29tcG9uZW50cyBtYXJrZWQgd2l0aCBDZGtNZW51SXRlbS5cbiAqXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tjZGtNZW51QmFyXScsXG4gIGV4cG9ydEFzOiAnY2RrTWVudUJhcicsXG4gIGhvc3Q6IHtcbiAgICAncm9sZSc6ICdtZW51YmFyJyxcbiAgICAnY2xhc3MnOiAnY2RrLW1lbnUtYmFyJyxcbiAgICAnKGtleWRvd24pJzogJ19oYW5kbGVLZXlFdmVudCgkZXZlbnQpJyxcbiAgfSxcbiAgcHJvdmlkZXJzOiBbXG4gICAge3Byb3ZpZGU6IENka01lbnVHcm91cCwgdXNlRXhpc3Rpbmc6IENka01lbnVCYXJ9LFxuICAgIHtwcm92aWRlOiBDREtfTUVOVSwgdXNlRXhpc3Rpbmc6IENka01lbnVCYXJ9LFxuICAgIHtwcm92aWRlOiBNRU5VX1NUQUNLLCB1c2VGYWN0b3J5OiAoKSA9PiBNZW51U3RhY2suaW5saW5lKCdob3Jpem9udGFsJyl9LFxuICBdLFxufSlcbmV4cG9ydCBjbGFzcyBDZGtNZW51QmFyIGV4dGVuZHMgQ2RrTWVudUJhc2UgaW1wbGVtZW50cyBBZnRlckNvbnRlbnRJbml0IHtcbiAgLyoqIFRoZSBkaXJlY3Rpb24gaXRlbXMgaW4gdGhlIG1lbnUgZmxvdy4gKi9cbiAgb3ZlcnJpZGUgcmVhZG9ubHkgb3JpZW50YXRpb24gPSAnaG9yaXpvbnRhbCc7XG5cbiAgLyoqIFdoZXRoZXIgdGhlIG1lbnUgaXMgZGlzcGxheWVkIGlubGluZSAoaS5lLiBhbHdheXMgcHJlc2VudCB2cyBhIGNvbmRpdGlvbmFsIHBvcHVwIHRoYXQgdGhlIHVzZXIgdHJpZ2dlcnMgd2l0aCBhIHRyaWdnZXIgZWxlbWVudCkuICovXG4gIG92ZXJyaWRlIHJlYWRvbmx5IGlzSW5saW5lID0gdHJ1ZTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAvKiogVGhlIGhvc3QgZWxlbWVudC4gKi9cbiAgICBlbGVtZW50UmVmOiBFbGVtZW50UmVmPEhUTUxFbGVtZW50PixcbiAgICAvKiogVGhlIEFuZ3VsYXIgem9uZS4gKi9cbiAgICBuZ1pvbmU6IE5nWm9uZSxcbiAgICAvKiogVGhlIG1lbnUgc3RhY2sgdGhpcyBtZW51IGlzIHBhcnQgb2YuICovXG4gICAgQEluamVjdChNRU5VX1NUQUNLKSBtZW51U3RhY2s6IE1lbnVTdGFjayxcbiAgICAvKiogVGhlIG1lbnUgYWltIHNlcnZpY2UgdXNlZCBieSB0aGlzIG1lbnUuICovXG4gICAgQFNlbGYoKSBAT3B0aW9uYWwoKSBASW5qZWN0KE1FTlVfQUlNKSBtZW51QWltPzogTWVudUFpbSxcbiAgICAvKiogVGhlIGRpcmVjdGlvbmFsaXR5IG9mIHRoZSBwYWdlLiAqL1xuICAgIEBPcHRpb25hbCgpIGRpcj86IERpcmVjdGlvbmFsaXR5LFxuICApIHtcbiAgICBzdXBlcihlbGVtZW50UmVmLCBuZ1pvbmUsIG1lbnVTdGFjaywgbWVudUFpbSwgZGlyKTtcbiAgfVxuXG4gIG92ZXJyaWRlIG5nQWZ0ZXJDb250ZW50SW5pdCgpIHtcbiAgICBzdXBlci5uZ0FmdGVyQ29udGVudEluaXQoKTtcbiAgICB0aGlzLl9zdWJzY3JpYmVUb01lbnVTdGFja0VtcHRpZWQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGUga2V5Ym9hcmQgZXZlbnRzIGZvciB0aGUgTWVudS5cbiAgICogQHBhcmFtIGV2ZW50IFRoZSBrZXlib2FyZCBldmVudCB0byBiZSBoYW5kbGVkLlxuICAgKi9cbiAgX2hhbmRsZUtleUV2ZW50KGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XG4gICAgY29uc3Qga2V5TWFuYWdlciA9IHRoaXMua2V5TWFuYWdlcjtcbiAgICBzd2l0Y2ggKGV2ZW50LmtleUNvZGUpIHtcbiAgICAgIGNhc2UgVVBfQVJST1c6XG4gICAgICBjYXNlIERPV05fQVJST1c6XG4gICAgICBjYXNlIExFRlRfQVJST1c6XG4gICAgICBjYXNlIFJJR0hUX0FSUk9XOlxuICAgICAgICBpZiAoIWhhc01vZGlmaWVyS2V5KGV2ZW50KSkge1xuICAgICAgICAgIGNvbnN0IGhvcml6b250YWxBcnJvd3MgPSBldmVudC5rZXlDb2RlID09PSBMRUZUX0FSUk9XIHx8IGV2ZW50LmtleUNvZGUgPT09IFJJR0hUX0FSUk9XO1xuICAgICAgICAgIC8vIEZvciBhIGhvcml6b250YWwgbWVudSBpZiB0aGUgbGVmdC9yaWdodCBrZXlzIHdlcmUgY2xpY2tlZCwgb3IgYSB2ZXJ0aWNhbCBtZW51IGlmIHRoZVxuICAgICAgICAgIC8vIHVwL2Rvd24ga2V5cyB3ZXJlIGNsaWNrZWQ6IGlmIHRoZSBjdXJyZW50IG1lbnUgaXMgb3BlbiwgY2xvc2UgaXQgdGhlbiBmb2N1cyBhbmQgb3BlbiB0aGVcbiAgICAgICAgICAvLyBuZXh0ICBtZW51LlxuICAgICAgICAgIGlmIChob3Jpem9udGFsQXJyb3dzKSB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgICAgICBjb25zdCBwcmV2SXNPcGVuID0ga2V5TWFuYWdlci5hY3RpdmVJdGVtPy5pc01lbnVPcGVuKCk7XG4gICAgICAgICAgICBrZXlNYW5hZ2VyLmFjdGl2ZUl0ZW0/LmdldE1lbnVUcmlnZ2VyKCk/LmNsb3NlKCk7XG5cbiAgICAgICAgICAgIGtleU1hbmFnZXIuc2V0Rm9jdXNPcmlnaW4oJ2tleWJvYXJkJyk7XG4gICAgICAgICAgICBrZXlNYW5hZ2VyLm9uS2V5ZG93bihldmVudCk7XG4gICAgICAgICAgICBpZiAocHJldklzT3Blbikge1xuICAgICAgICAgICAgICBrZXlNYW5hZ2VyLmFjdGl2ZUl0ZW0/LmdldE1lbnVUcmlnZ2VyKCk/Lm9wZW4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgRVNDQVBFOlxuICAgICAgICBpZiAoIWhhc01vZGlmaWVyS2V5KGV2ZW50KSkge1xuICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAga2V5TWFuYWdlci5hY3RpdmVJdGVtPy5nZXRNZW51VHJpZ2dlcigpPy5jbG9zZSgpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIFRBQjpcbiAgICAgICAgaWYgKCFoYXNNb2RpZmllcktleShldmVudCwgJ2FsdEtleScsICdtZXRhS2V5JywgJ2N0cmxLZXknKSkge1xuICAgICAgICAgIGtleU1hbmFnZXIuYWN0aXZlSXRlbT8uZ2V0TWVudVRyaWdnZXIoKT8uY2xvc2UoKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAga2V5TWFuYWdlci5vbktleWRvd24oZXZlbnQpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgZm9jdXMgdG8gZWl0aGVyIHRoZSBjdXJyZW50LCBwcmV2aW91cyBvciBuZXh0IGl0ZW0gYmFzZWQgb24gdGhlIEZvY3VzTmV4dCBldmVudCwgdGhlblxuICAgKiBvcGVuIHRoZSBwcmV2aW91cyBvciBuZXh0IGl0ZW0uXG4gICAqIEBwYXJhbSBmb2N1c05leHQgVGhlIGVsZW1lbnQgdG8gZm9jdXMuXG4gICAqL1xuICBwcml2YXRlIF90b2dnbGVPcGVuTWVudShmb2N1c05leHQ6IEZvY3VzTmV4dCB8IHVuZGVmaW5lZCkge1xuICAgIGNvbnN0IGtleU1hbmFnZXIgPSB0aGlzLmtleU1hbmFnZXI7XG4gICAgc3dpdGNoIChmb2N1c05leHQpIHtcbiAgICAgIGNhc2UgRm9jdXNOZXh0Lm5leHRJdGVtOlxuICAgICAgICBrZXlNYW5hZ2VyLnNldEZvY3VzT3JpZ2luKCdrZXlib2FyZCcpO1xuICAgICAgICBrZXlNYW5hZ2VyLnNldE5leHRJdGVtQWN0aXZlKCk7XG4gICAgICAgIGtleU1hbmFnZXIuYWN0aXZlSXRlbT8uZ2V0TWVudVRyaWdnZXIoKT8ub3BlbigpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBGb2N1c05leHQucHJldmlvdXNJdGVtOlxuICAgICAgICBrZXlNYW5hZ2VyLnNldEZvY3VzT3JpZ2luKCdrZXlib2FyZCcpO1xuICAgICAgICBrZXlNYW5hZ2VyLnNldFByZXZpb3VzSXRlbUFjdGl2ZSgpO1xuICAgICAgICBrZXlNYW5hZ2VyLmFjdGl2ZUl0ZW0/LmdldE1lbnVUcmlnZ2VyKCk/Lm9wZW4oKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgRm9jdXNOZXh0LmN1cnJlbnRJdGVtOlxuICAgICAgICBpZiAoa2V5TWFuYWdlci5hY3RpdmVJdGVtKSB7XG4gICAgICAgICAga2V5TWFuYWdlci5zZXRGb2N1c09yaWdpbigna2V5Ym9hcmQnKTtcbiAgICAgICAgICBrZXlNYW5hZ2VyLnNldEFjdGl2ZUl0ZW0oa2V5TWFuYWdlci5hY3RpdmVJdGVtKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICAvKiogU3Vic2NyaWJlIHRvIHRoZSBNZW51U3RhY2sgZW1wdGllZCBldmVudHMuICovXG4gIHByaXZhdGUgX3N1YnNjcmliZVRvTWVudVN0YWNrRW1wdGllZCgpIHtcbiAgICB0aGlzLm1lbnVTdGFjaz8uZW1wdGllZFxuICAgICAgLnBpcGUodGFrZVVudGlsKHRoaXMuZGVzdHJveWVkKSlcbiAgICAgIC5zdWJzY3JpYmUoZXZlbnQgPT4gdGhpcy5fdG9nZ2xlT3Blbk1lbnUoZXZlbnQpKTtcbiAgfVxufVxuIl19