/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { CdkMenuGroup } from './menu-group';
import { ContentChildren, Directive, ElementRef, Inject, Optional, QueryList, } from '@angular/core';
import { FocusKeyManager } from '@angular/cdk/a11y';
import { CdkMenuItem } from './menu-item';
import { merge, Subject } from 'rxjs';
import { Directionality } from '@angular/cdk/bidi';
import { mapTo, mergeAll, mergeMap, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { MENU_STACK, MenuStack } from './menu-stack';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/bidi";
import * as i2 from "./menu-stack";
export class CdkMenuBase extends CdkMenuGroup {
    constructor(_elementRef, menuStack, dir) {
        super();
        this._elementRef = _elementRef;
        this.menuStack = menuStack;
        this.dir = dir;
        /**
         * Sets the aria-orientation attribute and determines where menus will be opened.
         * Does not affect styling/layout.
         */
        this.orientation = 'vertical';
        /** Emits when the MenuBar is destroyed. */
        this.destroyed = new Subject();
    }
    ngAfterContentInit() {
        super.ngAfterContentInit();
        this._setKeyManager();
        this._subscribeToMenuOpen();
        this._subscribeToMenuStackClosed();
    }
    ngOnDestroy() {
        super.ngOnDestroy();
        this.destroyed.next();
        this.destroyed.complete();
    }
    /** Place focus on the first MenuItem in the menu and set the focus origin. */
    focusFirstItem(focusOrigin = 'program') {
        this.keyManager.setFocusOrigin(focusOrigin);
        this.keyManager.setFirstItemActive();
    }
    /** Place focus on the last MenuItem in the menu and set the focus origin. */
    focusLastItem(focusOrigin = 'program') {
        this.keyManager.setFocusOrigin(focusOrigin);
        this.keyManager.setLastItemActive();
    }
    /** Return true if this menu has been configured in a horizontal orientation. */
    isHorizontal() {
        return this.orientation === 'horizontal';
    }
    /** Return true if the MenuBar has an open submenu. */
    hasOpenSubmenu() {
        return !!this.openItem;
    }
    /**
     * Close the open menu if the current active item opened the requested MenuStackItem.
     * @param item the MenuStackItem requested to be closed.
     */
    closeOpenMenu(menu) {
        const keyManager = this.keyManager;
        const trigger = this.openItem;
        if (menu === trigger?.getMenuTrigger()?.getMenu()) {
            trigger?.getMenuTrigger()?.closeMenu();
            // If the user has moused over a sibling item we want to focus the element under mouse focus
            // not the trigger which previously opened the now closed menu.
            if (trigger) {
                keyManager.setActiveItem(this.pointerTracker?.activeElement || trigger);
            }
        }
    }
    /** Setup the FocusKeyManager with the correct orientation for the menu. */
    _setKeyManager() {
        this.keyManager = new FocusKeyManager(this.items).withWrap().withTypeAhead().withHomeAndEnd();
        if (this.isHorizontal()) {
            this.keyManager.withHorizontalOrientation(this.dir?.value || 'ltr');
        }
        else {
            this.keyManager.withVerticalOrientation();
        }
    }
    /**
     * Subscribe to the menu trigger's open events in order to track the trigger which opened the menu
     * and stop tracking it when the menu is closed.
     */
    _subscribeToMenuOpen() {
        const exitCondition = merge(this.items.changes, this.destroyed);
        this.items.changes
            .pipe(startWith(this.items), mergeMap((list) => list
            .filter(item => item.hasMenu())
            .map(item => item.getMenuTrigger().opened.pipe(mapTo(item), takeUntil(exitCondition)))), mergeAll(), switchMap((item) => {
            this.openItem = item;
            return item.getMenuTrigger().closed;
        }), takeUntil(this.destroyed))
            .subscribe(() => (this.openItem = undefined));
    }
    /** Subscribe to the MenuStack close and empty observables. */
    _subscribeToMenuStackClosed() {
        this.menuStack?.closed
            .pipe(takeUntil(this.destroyed))
            .subscribe(item => this.closeOpenMenu(item));
    }
}
CdkMenuBase.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.0.0-next.9", ngImport: i0, type: CdkMenuBase, deps: [{ token: i0.ElementRef }, { token: MENU_STACK, optional: true }, { token: i1.Directionality, optional: true }], target: i0.ɵɵFactoryTarget.Directive });
CdkMenuBase.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "14.0.0-next.9", type: CdkMenuBase, host: { listeners: { "focus": "focusFirstItem()" }, properties: { "attr.aria-orientation": "orientation" } }, queries: [{ propertyName: "items", predicate: CdkMenuItem, descendants: true }], usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.0.0-next.9", ngImport: i0, type: CdkMenuBase, decorators: [{
            type: Directive,
            args: [{
                    host: {
                        '[attr.aria-orientation]': 'orientation',
                        '(focus)': 'focusFirstItem()',
                    },
                }]
        }], ctorParameters: function () { return [{ type: i0.ElementRef }, { type: i2.MenuStack, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [MENU_STACK]
                }] }, { type: i1.Directionality, decorators: [{
                    type: Optional
                }] }]; }, propDecorators: { items: [{
                type: ContentChildren,
                args: [CdkMenuItem, { descendants: true }]
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1iYXNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvbWVudS9tZW51LWJhc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGNBQWMsQ0FBQztBQUMxQyxPQUFPLEVBRUwsZUFBZSxFQUNmLFNBQVMsRUFDVCxVQUFVLEVBQ1YsTUFBTSxFQUVOLFFBQVEsRUFDUixTQUFTLEdBQ1YsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFDLGVBQWUsRUFBYyxNQUFNLG1CQUFtQixDQUFDO0FBQy9ELE9BQU8sRUFBQyxXQUFXLEVBQUMsTUFBTSxhQUFhLENBQUM7QUFDeEMsT0FBTyxFQUFDLEtBQUssRUFBRSxPQUFPLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDcEMsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQ2pELE9BQU8sRUFBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQzFGLE9BQU8sRUFBQyxVQUFVLEVBQUUsU0FBUyxFQUFnQixNQUFNLGNBQWMsQ0FBQzs7OztBQVVsRSxNQUFNLE9BQWdCLFdBQ3BCLFNBQVEsWUFBWTtJQXlCcEIsWUFDVyxXQUFvQyxFQUNKLFNBQXFCLEVBQy9CLEdBQW9CO1FBRW5ELEtBQUssRUFBRSxDQUFDO1FBSkMsZ0JBQVcsR0FBWCxXQUFXLENBQXlCO1FBQ0osY0FBUyxHQUFULFNBQVMsQ0FBWTtRQUMvQixRQUFHLEdBQUgsR0FBRyxDQUFpQjtRQXpCckQ7OztXQUdHO1FBQ00sZ0JBQVcsR0FBOEIsVUFBVSxDQUFDO1FBUzdELDJDQUEyQztRQUN4QixjQUFTLEdBQWtCLElBQUksT0FBTyxFQUFFLENBQUM7SUFjNUQsQ0FBQztJQUVRLGtC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LFNBQVMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQzFGLEVBQ0QsUUFBUSxFQUFFLEVBQ1YsU0FBUyxDQUFDLENBQUMsSUFBaUIsRUFBRSxFQUFFO1lBQzlCLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO1lBQ3JCLE9BQU8sSUFBSSxDQUFDLGNBQWMsRUFBRyxDQUFDLE1BQU0sQ0FBQztRQUN2QyxDQUFDLENBQUMsRUFDRixTQUFTLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUMxQjthQUNBLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQztJQUNsRCxDQUFDO0lBRUQsOERBQThEO0lBQ3RELDJCQUEyQjtRQUNqQyxJQUFJLENBQUMsU0FBUyxFQUFFLE1BQU07YUFDbkIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7YUFDL0IsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ2pELENBQUM7OytHQTlIbUIsV0FBVyw0Q0E0QlQsVUFBVTttR0E1QlosV0FBVyw4SkFXZCxXQUFXO2tHQVhSLFdBQVc7a0JBTmhDLFNBQVM7bUJBQUM7b0JBQ1QsSUFBSSxFQUFFO3dCQUNKLHlCQUF5QixFQUFFLGFBQWE7d0JBQ3hDLFNBQVMsRUFBRSxrQkFBa0I7cUJBQzlCO2lCQUNGOzswQkE2QkksUUFBUTs7MEJBQUksTUFBTTsyQkFBQyxVQUFVOzswQkFDN0IsUUFBUTs0Q0FqQlEsS0FBSztzQkFEdkIsZUFBZTt1QkFBQyxXQUFXLEVBQUUsRUFBQyxXQUFXLEVBQUUsSUFBSSxFQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Q2RrTWVudUdyb3VwfSBmcm9tICcuL21lbnUtZ3JvdXAnO1xuaW1wb3J0IHtcbiAgQWZ0ZXJDb250ZW50SW5pdCxcbiAgQ29udGVudENoaWxkcmVuLFxuICBEaXJlY3RpdmUsXG4gIEVsZW1lbnRSZWYsXG4gIEluamVjdCxcbiAgT25EZXN0cm95LFxuICBPcHRpb25hbCxcbiAgUXVlcnlMaXN0LFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7Rm9jdXNLZXlNYW5hZ2VyLCBGb2N1c09yaWdpbn0gZnJvbSAnQGFuZ3VsYXIvY2RrL2ExMXknO1xuaW1wb3J0IHtDZGtNZW51SXRlbX0gZnJvbSAnLi9tZW51LWl0ZW0nO1xuaW1wb3J0IHttZXJnZSwgU3ViamVjdH0gZnJvbSAncnhqcyc7XG5pbXBvcnQge0RpcmVjdGlvbmFsaXR5fSBmcm9tICdAYW5ndWxhci9jZGsvYmlkaSc7XG5pbXBvcnQge21hcFRvLCBtZXJnZUFsbCwgbWVyZ2VNYXAsIHN0YXJ0V2l0aCwgc3dpdGNoTWFwLCB0YWtlVW50aWx9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7TUVOVV9TVEFDSywgTWVudVN0YWNrLCBNZW51U3RhY2tJdGVtfSBmcm9tICcuL21lbnUtc3RhY2snO1xuaW1wb3J0IHtNZW51fSBmcm9tICcuL21lbnUtaW50ZXJmYWNlJztcbmltcG9ydCB7UG9pbnRlckZvY3VzVHJhY2tlcn0gZnJvbSAnLi9wb2ludGVyLWZvY3VzLXRyYWNrZXInO1xuXG5ARGlyZWN0aXZlKHtcbiAgaG9zdDoge1xuICAgICdbYXR0ci5hcmlhLW9yaWVudGF0aW9uXSc6ICdvcmllbnRhdGlvbicsXG4gICAgJyhmb2N1cyknOiAnZm9jdXNGaXJzdEl0ZW0oKScsXG4gIH0sXG59KVxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIENka01lbnVCYXNlXG4gIGV4dGVuZHMgQ2RrTWVudUdyb3VwXG4gIGltcGxlbWVudHMgTWVudSwgQWZ0ZXJDb250ZW50SW5pdCwgT25EZXN0cm95XG57XG4gIC8qKlxuICAgKiBTZXRzIHRoZSBhcmlhLW9yaWVudGF0aW9uIGF0dHJpYnV0ZSBhbmQgZGV0ZXJtaW5lcyB3aGVyZSBtZW51cyB3aWxsIGJlIG9wZW5lZC5cbiAgICogRG9lcyBub3QgYWZmZWN0IHN0eWxpbmcvbGF5b3V0LlxuICAgKi9cbiAgcmVhZG9ubHkgb3JpZW50YXRpb246ICdob3Jpem9udGFsJyB8ICd2ZXJ0aWNhbCcgPSAndmVydGljYWwnO1xuXG4gIC8qKiBBbGwgY2hpbGQgTWVudUl0ZW0gZWxlbWVudHMgbmVzdGVkIGluIHRoaXMgTWVudS4gKi9cbiAgQENvbnRlbnRDaGlsZHJlbihDZGtNZW51SXRlbSwge2Rlc2NlbmRhbnRzOiB0cnVlfSlcbiAgcHJvdGVjdGVkIHJlYWRvbmx5IGl0ZW1zOiBRdWVyeUxpc3Q8Q2RrTWVudUl0ZW0+O1xuXG4gIC8qKiBIYW5kbGVzIGtleWJvYXJkIGV2ZW50cyBmb3IgdGhlIG1lbnUuICovXG4gIHByb3RlY3RlZCBrZXlNYW5hZ2VyOiBGb2N1c0tleU1hbmFnZXI8Q2RrTWVudUl0ZW0+O1xuXG4gIC8qKiBFbWl0cyB3aGVuIHRoZSBNZW51QmFyIGlzIGRlc3Ryb3llZC4gKi9cbiAgcHJvdGVjdGVkIHJlYWRvbmx5IGRlc3Ryb3llZDogU3ViamVjdDx2b2lkPiA9IG5ldyBTdWJqZWN0KCk7XG5cbiAgLyoqIFRoZSBNZW51IEl0ZW0gd2hpY2ggdHJpZ2dlcmVkIHRoZSBvcGVuIHN1Ym1lbnUuICovXG4gIHByb3RlY3RlZCBvcGVuSXRlbT86IENka01lbnVJdGVtO1xuXG4gIC8qKiBNYW5hZ2VzIGl0ZW1zIHVuZGVyIG1vdXNlIGZvY3VzICovXG4gIHByb3RlY3RlZCBwb2ludGVyVHJhY2tlcj86IFBvaW50ZXJGb2N1c1RyYWNrZXI8Q2RrTWVudUl0ZW0+O1xuXG4gIHByb3RlY3RlZCBjb25zdHJ1Y3RvcihcbiAgICByZWFkb25seSBfZWxlbWVudFJlZjogRWxlbWVudFJlZjxIVE1MRWxlbWVudD4sXG4gICAgQE9wdGlvbmFsKCkgQEluamVjdChNRU5VX1NUQUNLKSByZWFkb25seSBtZW51U3RhY2s/OiBNZW51U3RhY2ssXG4gICAgQE9wdGlvbmFsKCkgcHJvdGVjdGVkIHJlYWRvbmx5IGRpcj86IERpcmVjdGlvbmFsaXR5LFxuICApIHtcbiAgICBzdXBlcigpO1xuICB9XG5cbiAgb3ZlcnJpZGUgbmdBZnRlckNvbnRlbnRJbml0KCkge1xuICAgIHN1cGVyLm5nQWZ0ZXJDb250ZW50SW5pdCgpO1xuICAgIHRoaXMuX3NldEtleU1hbmFnZXIoKTtcbiAgICB0aGlzLl9zdWJzY3JpYmVUb01lbnVPcGVuKCk7XG4gICAgdGhpcy5fc3Vic2NyaWJlVG9NZW51U3RhY2tDbG9zZWQoKTtcbiAgfVxuXG4gIG92ZXJyaWRlIG5nT25EZXN0cm95KCkge1xuICAgIHN1cGVyLm5nT25EZXN0cm95KCk7XG4gICAgdGhpcy5kZXN0cm95ZWQubmV4dCgpO1xuICAgIHRoaXMuZGVzdHJveWVkLmNvbXBsZXRlKCk7XG4gIH1cblxuICAvKiogUGxhY2UgZm9jdXMgb24gdGhlIGZpcnN0IE1lbnVJdGVtIGluIHRoZSBtZW51IGFuZCBzZXQgdGhlIGZvY3VzIG9yaWdpbi4gKi9cbiAgZm9jdXNGaXJzdEl0ZW0oZm9jdXNPcmlnaW46IEZvY3VzT3JpZ2luID0gJ3Byb2dyYW0nKSB7XG4gICAgdGhpcy5rZXlNYW5hZ2VyLnNldEZvY3VzT3JpZ2luKGZvY3VzT3JpZ2luKTtcbiAgICB0aGlzLmtleU1hbmFnZXIuc2V0Rmlyc3RJdGVtQWN0aXZlKCk7XG4gIH1cblxuICAvKiogUGxhY2UgZm9jdXMgb24gdGhlIGxhc3QgTWVudUl0ZW0gaW4gdGhlIG1lbnUgYW5kIHNldCB0aGUgZm9jdXMgb3JpZ2luLiAqL1xuICBmb2N1c0xhc3RJdGVtKGZvY3VzT3JpZ2luOiBGb2N1c09yaWdpbiA9ICdwcm9ncmFtJykge1xuICAgIHRoaXMua2V5TWFuYWdlci5zZXRGb2N1c09yaWdpbihmb2N1c09yaWdpbik7XG4gICAgdGhpcy5rZXlNYW5hZ2VyLnNldExhc3RJdGVtQWN0aXZlKCk7XG4gIH1cblxuICAvKiogUmV0dXJuIHRydWUgaWYgdGhpcyBtZW51IGhhcyBiZWVuIGNvbmZpZ3VyZWQgaW4gYSBob3Jpem9udGFsIG9yaWVudGF0aW9uLiAqL1xuICBwcm90ZWN0ZWQgaXNIb3Jpem9udGFsKCkge1xuICAgIHJldHVybiB0aGlzLm9yaWVudGF0aW9uID09PSAnaG9yaXpvbnRhbCc7XG4gIH1cblxuICAvKiogUmV0dXJuIHRydWUgaWYgdGhlIE1lbnVCYXIgaGFzIGFuIG9wZW4gc3VibWVudS4gKi9cbiAgcHJvdGVjdGVkIGhhc09wZW5TdWJtZW51KCkge1xuICAgIHJldHVybiAhIXRoaXMub3Blbkl0ZW07XG4gIH1cblxuICAvKipcbiAgICogQ2xvc2UgdGhlIG9wZW4gbWVudSBpZiB0aGUgY3VycmVudCBhY3RpdmUgaXRlbSBvcGVuZWQgdGhlIHJlcXVlc3RlZCBNZW51U3RhY2tJdGVtLlxuICAgKiBAcGFyYW0gaXRlbSB0aGUgTWVudVN0YWNrSXRlbSByZXF1ZXN0ZWQgdG8gYmUgY2xvc2VkLlxuICAgKi9cbiAgcHJvdGVjdGVkIGNsb3NlT3Blbk1lbnUobWVudTogTWVudVN0YWNrSXRlbSB8IHVuZGVmaW5lZCkge1xuICAgIGNvbnN0IGtleU1hbmFnZXIgPSB0aGlzLmtleU1hbmFnZXI7XG4gICAgY29uc3QgdHJpZ2dlciA9IHRoaXMub3Blbkl0ZW07XG4gICAgaWYgKG1lbnUgPT09IHRyaWdnZXI/LmdldE1lbnVUcmlnZ2VyKCk/LmdldE1lbnUoKSkge1xuICAgICAgdHJpZ2dlcj8uZ2V0TWVudVRyaWdnZXIoKT8uY2xvc2VNZW51KCk7XG4gICAgICAvLyBJZiB0aGUgdXNlciBoYXMgbW91c2VkIG92ZXIgYSBzaWJsaW5nIGl0ZW0gd2Ugd2FudCB0byBmb2N1cyB0aGUgZWxlbWVudCB1bmRlciBtb3VzZSBmb2N1c1xuICAgICAgLy8gbm90IHRoZSB0cmlnZ2VyIHdoaWNoIHByZXZpb3VzbHkgb3BlbmVkIHRoZSBub3cgY2xvc2VkIG1lbnUuXG4gICAgICBpZiAodHJpZ2dlcikge1xuICAgICAgICBrZXlNYW5hZ2VyLnNldEFjdGl2ZUl0ZW0odGhpcy5wb2ludGVyVHJhY2tlcj8uYWN0aXZlRWxlbWVudCB8fCB0cmlnZ2VyKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKiogU2V0dXAgdGhlIEZvY3VzS2V5TWFuYWdlciB3aXRoIHRoZSBjb3JyZWN0IG9yaWVudGF0aW9uIGZvciB0aGUgbWVudS4gKi9cbiAgcHJpdmF0ZSBfc2V0S2V5TWFuYWdlcigpIHtcbiAgICB0aGlzLmtleU1hbmFnZXIgPSBuZXcgRm9jdXNLZXlNYW5hZ2VyKHRoaXMuaXRlbXMpLndpdGhXcmFwKCkud2l0aFR5cGVBaGVhZCgpLndpdGhIb21lQW5kRW5kKCk7XG5cbiAgICBpZiAodGhpcy5pc0hvcml6b250YWwoKSkge1xuICAgICAgdGhpcy5rZXlNYW5hZ2VyLndpdGhIb3Jpem9udGFsT3JpZW50YXRpb24odGhpcy5kaXI/LnZhbHVlIHx8ICdsdHInKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5rZXlNYW5hZ2VyLndpdGhWZXJ0aWNhbE9yaWVudGF0aW9uKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFN1YnNjcmliZSB0byB0aGUgbWVudSB0cmlnZ2VyJ3Mgb3BlbiBldmVudHMgaW4gb3JkZXIgdG8gdHJhY2sgdGhlIHRyaWdnZXIgd2hpY2ggb3BlbmVkIHRoZSBtZW51XG4gICAqIGFuZCBzdG9wIHRyYWNraW5nIGl0IHdoZW4gdGhlIG1lbnUgaXMgY2xvc2VkLlxuICAgKi9cbiAgcHJpdmF0ZSBfc3Vic2NyaWJlVG9NZW51T3BlbigpIHtcbiAgICBjb25zdCBleGl0Q29uZGl0aW9uID0gbWVyZ2UodGhpcy5pdGVtcy5jaGFuZ2VzLCB0aGlzLmRlc3Ryb3llZCk7XG4gICAgdGhpcy5pdGVtcy5jaGFuZ2VzXG4gICAgICAucGlwZShcbiAgICAgICAgc3RhcnRXaXRoKHRoaXMuaXRlbXMpLFxuICAgICAgICBtZXJnZU1hcCgobGlzdDogUXVlcnlMaXN0PENka01lbnVJdGVtPikgPT5cbiAgICAgICAgICBsaXN0XG4gICAgICAgICAgICAuZmlsdGVyKGl0ZW0gPT4gaXRlbS5oYXNNZW51KCkpXG4gICAgICAgICAgICAubWFwKGl0ZW0gPT4gaXRlbS5nZXRNZW51VHJpZ2dlcigpIS5vcGVuZWQucGlwZShtYXBUbyhpdGVtKSwgdGFrZVVudGlsKGV4aXRDb25kaXRpb24pKSksXG4gICAgICAgICksXG4gICAgICAgIG1lcmdlQWxsKCksXG4gICAgICAgIHN3aXRjaE1hcCgoaXRlbTogQ2RrTWVudUl0ZW0pID0+IHtcbiAgICAgICAgICB0aGlzLm9wZW5JdGVtID0gaXRlbTtcbiAgICAgICAgICByZXR1cm4gaXRlbS5nZXRNZW51VHJpZ2dlcigpIS5jbG9zZWQ7XG4gICAgICAgIH0pLFxuICAgICAgICB0YWtlVW50aWwodGhpcy5kZXN0cm95ZWQpLFxuICAgICAgKVxuICAgICAgLnN1YnNjcmliZSgoKSA9PiAodGhpcy5vcGVuSXRlbSA9IHVuZGVmaW5lZCkpO1xuICB9XG5cbiAgLyoqIFN1YnNjcmliZSB0byB0aGUgTWVudVN0YWNrIGNsb3NlIGFuZCBlbXB0eSBvYnNlcnZhYmxlcy4gKi9cbiAgcHJpdmF0ZSBfc3Vic2NyaWJlVG9NZW51U3RhY2tDbG9zZWQoKSB7XG4gICAgdGhpcy5tZW51U3RhY2s/LmNsb3NlZFxuICAgICAgLnBpcGUodGFrZVVudGlsKHRoaXMuZGVzdHJveWVkKSlcbiAgICAgIC5zdWJzY3JpYmUoaXRlbSA9PiB0aGlzLmNsb3NlT3Blbk1lbnUoaXRlbSkpO1xuICB9XG59XG4iXX0=