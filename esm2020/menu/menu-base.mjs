/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { CdkMenuGroup } from './menu-group';
import { ContentChildren, Directive, ElementRef, Inject, Input, Optional, QueryList, } from '@angular/core';
import { FocusKeyManager } from '@angular/cdk/a11y';
import { CdkMenuItem } from './menu-item';
import { merge, Subject } from 'rxjs';
import { Directionality } from '@angular/cdk/bidi';
import { mapTo, mergeAll, mergeMap, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { MENU_STACK, MenuStack } from './menu-stack';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/bidi";
import * as i2 from "./menu-stack";
let nextId = 0;
export class CdkMenuBase extends CdkMenuGroup {
    constructor(_elementRef, menuStack, dir) {
        super();
        this._elementRef = _elementRef;
        this.menuStack = menuStack;
        this.dir = dir;
        this.id = `cdk-menu-${nextId++}`;
        /**
         * Sets the aria-orientation attribute and determines where menus will be opened.
         * Does not affect styling/layout.
         */
        this.orientation = 'vertical';
        this._isInline = false;
        this._hasFocus = false;
        /** Emits when the MenuBar is destroyed. */
        this.destroyed = new Subject();
    }
    ngAfterContentInit() {
        this._setKeyManager();
        this._subscribeToHasFocus();
        this._subscribeToMenuOpen();
        this._subscribeToMenuStackClosed();
    }
    ngOnDestroy() {
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
     * @param menu the MenuStackItem requested to be closed.
     * @param focusParentTrigger whether to focus the parent trigger after closing the menu.
     */
    closeOpenMenu(menu, focusParentTrigger) {
        const keyManager = this.keyManager;
        const trigger = this.openItem;
        if (menu === trigger?.getMenuTrigger()?.getMenu()) {
            trigger?.getMenuTrigger()?.close();
            // If the user has moused over a sibling item we want to focus the element under mouse focus
            // not the trigger which previously opened the now closed menu.
            if (focusParentTrigger) {
                if (trigger) {
                    keyManager.setActiveItem(trigger);
                }
                else {
                    keyManager.setFirstItemActive();
                }
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
        this.menuStack.closed
            .pipe(takeUntil(this.destroyed))
            .subscribe(({ item, focusParentTrigger }) => this.closeOpenMenu(item, focusParentTrigger));
    }
    _subscribeToHasFocus() {
        if (this._isInline) {
            this.menuStack.hasFocus.pipe(takeUntil(this.destroyed)).subscribe(hasFocus => {
                this._hasFocus = hasFocus;
            });
        }
    }
}
CdkMenuBase.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.0.0-next.9", ngImport: i0, type: CdkMenuBase, deps: [{ token: i0.ElementRef }, { token: MENU_STACK }, { token: i1.Directionality, optional: true }], target: i0.ɵɵFactoryTarget.Directive });
CdkMenuBase.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "14.0.0-next.9", type: CdkMenuBase, inputs: { id: "id" }, host: { listeners: { "focus": "focusFirstItem()", "focusin": "menuStack.setHasFocus(true)", "focusout": "menuStack.setHasFocus(false)" }, properties: { "tabindex": "_isInline ? (_hasFocus ? -1 : 0) : null", "id": "id", "attr.aria-orientation": "orientation" } }, queries: [{ propertyName: "items", predicate: CdkMenuItem, descendants: true }], usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.0.0-next.9", ngImport: i0, type: CdkMenuBase, decorators: [{
            type: Directive,
            args: [{
                    host: {
                        '[tabindex]': '_isInline ? (_hasFocus ? -1 : 0) : null',
                        '[id]': 'id',
                        '[attr.aria-orientation]': 'orientation',
                        '(focus)': 'focusFirstItem()',
                        '(focusin)': 'menuStack.setHasFocus(true)',
                        '(focusout)': 'menuStack.setHasFocus(false)',
                    },
                }]
        }], ctorParameters: function () { return [{ type: i0.ElementRef }, { type: i2.MenuStack, decorators: [{
                    type: Inject,
                    args: [MENU_STACK]
                }] }, { type: i1.Directionality, decorators: [{
                    type: Optional
                }] }]; }, propDecorators: { id: [{
                type: Input
            }], items: [{
                type: ContentChildren,
                args: [CdkMenuItem, { descendants: true }]
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1iYXNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvbWVudS9tZW51LWJhc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGNBQWMsQ0FBQztBQUMxQyxPQUFPLEVBRUwsZUFBZSxFQUNmLFNBQVMsRUFDVCxVQUFVLEVBQ1YsTUFBTSxFQUNOLEtBQUssRUFFTCxRQUFRLEVBQ1IsU0FBUyxHQUNWLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBQyxlQUFlLEVBQWMsTUFBTSxtQkFBbUIsQ0FBQztBQUMvRCxPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0sYUFBYSxDQUFDO0FBQ3hDLE9BQU8sRUFBQyxLQUFLLEVBQUUsT0FBTyxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQ3BDLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUNqRCxPQUFPLEVBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUMxRixPQUFPLEVBQUMsVUFBVSxFQUFFLFNBQVMsRUFBZ0IsTUFBTSxjQUFjLENBQUM7Ozs7QUFJbEUsSUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDO0FBWWYsTUFBTSxPQUFnQixXQUNwQixTQUFRLFlBQVk7SUErQnBCLFlBQ1csV0FBb0MsRUFDaEIsU0FBb0IsRUFDbEIsR0FBb0I7UUFFbkQsS0FBSyxFQUFFLENBQUM7UUFKQyxnQkFBVyxHQUFYLFdBQVcsQ0FBeUI7UUFDaEIsY0FBUyxHQUFULFNBQVMsQ0FBVztRQUNsQixRQUFHLEdBQUgsR0FBRyxDQUFpQjtRQS9CNUMsT0FBRSxHQUFHLFlBQVksTUFBTSxFQUFFLEVBQUUsQ0FBQztRQUVyQzs7O1dBR0c7UUFDSCxnQkFBVyxH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QUM1QixDQUFDLENBQUMsQ0FBQztTQUNKO0lBQ0gsQ0FBQzs7K0dBaEptQixXQUFXLDRDQWtDckIsVUFBVTttR0FsQ0EsV0FBVyw2VUFpQmQsV0FBVztrR0FqQlIsV0FBVztrQkFWaEMsU0FBUzttQkFBQztvQkFDVCxJQUFJLEVBQUU7d0JBQ0osWUFBWSxFQUFFLHlDQUF5Qzt3QkFDdkQsTUFBTSxFQUFFLElBQUk7d0JBQ1oseUJBQXlCLEVBQUUsYUFBYTt3QkFDeEMsU0FBUyxFQUFFLGtCQUFrQjt3QkFDN0IsV0FBVyxFQUFFLDZCQUE2Qjt3QkFDMUMsWUFBWSxFQUFFLDhCQUE4QjtxQkFDN0M7aUJBQ0Y7OzBCQW1DSSxNQUFNOzJCQUFDLFVBQVU7OzBCQUNqQixRQUFROzRDQS9CRixFQUFFO3NCQUFWLEtBQUs7Z0JBY2EsS0FBSztzQkFEdkIsZUFBZTt1QkFBQyxXQUFXLEVBQUUsRUFBQyxXQUFXLEVBQUUsSUFBSSxFQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Q2RrTWVudUdyb3VwfSBmcm9tICcuL21lbnUtZ3JvdXAnO1xuaW1wb3J0IHtcbiAgQWZ0ZXJDb250ZW50SW5pdCxcbiAgQ29udGVudENoaWxkcmVuLFxuICBEaXJlY3RpdmUsXG4gIEVsZW1lbnRSZWYsXG4gIEluamVjdCxcbiAgSW5wdXQsXG4gIE9uRGVzdHJveSxcbiAgT3B0aW9uYWwsXG4gIFF1ZXJ5TGlzdCxcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0ZvY3VzS2V5TWFuYWdlciwgRm9jdXNPcmlnaW59IGZyb20gJ0Bhbmd1bGFyL2Nkay9hMTF5JztcbmltcG9ydCB7Q2RrTWVudUl0ZW19IGZyb20gJy4vbWVudS1pdGVtJztcbmltcG9ydCB7bWVyZ2UsIFN1YmplY3R9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHtEaXJlY3Rpb25hbGl0eX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2JpZGknO1xuaW1wb3J0IHttYXBUbywgbWVyZ2VBbGwsIG1lcmdlTWFwLCBzdGFydFdpdGgsIHN3aXRjaE1hcCwgdGFrZVVudGlsfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5pbXBvcnQge01FTlVfU1RBQ0ssIE1lbnVTdGFjaywgTWVudVN0YWNrSXRlbX0gZnJvbSAnLi9tZW51LXN0YWNrJztcbmltcG9ydCB7TWVudX0gZnJvbSAnLi9tZW51LWludGVyZmFjZSc7XG5pbXBvcnQge1BvaW50ZXJGb2N1c1RyYWNrZXJ9IGZyb20gJy4vcG9pbnRlci1mb2N1cy10cmFja2VyJztcblxubGV0IG5leHRJZCA9IDA7XG5cbkBEaXJlY3RpdmUoe1xuICBob3N0OiB7XG4gICAgJ1t0YWJpbmRleF0nOiAnX2lzSW5saW5lID8gKF9oYXNGb2N1cyA/IC0xIDogMCkgOiBudWxsJyxcbiAgICAnW2lkXSc6ICdpZCcsXG4gICAgJ1thdHRyLmFyaWEtb3JpZW50YXRpb25dJzogJ29yaWVudGF0aW9uJyxcbiAgICAnKGZvY3VzKSc6ICdmb2N1c0ZpcnN0SXRlbSgpJyxcbiAgICAnKGZvY3VzaW4pJzogJ21lbnVTdGFjay5zZXRIYXNGb2N1cyh0cnVlKScsXG4gICAgJyhmb2N1c291dCknOiAnbWVudVN0YWNrLnNldEhhc0ZvY3VzKGZhbHNlKScsXG4gIH0sXG59KVxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIENka01lbnVCYXNlXG4gIGV4dGVuZHMgQ2RrTWVudUdyb3VwXG4gIGltcGxlbWVudHMgTWVudSwgQWZ0ZXJDb250ZW50SW5pdCwgT25EZXN0cm95XG57XG4gIEBJbnB1dCgpIGlkID0gYGNkay1tZW51LSR7bmV4dElkKyt9YDtcblxuICAvKipcbiAgICogU2V0cyB0aGUgYXJpYS1vcmllbnRhdGlvbiBhdHRyaWJ1dGUgYW5kIGRldGVybWluZXMgd2hlcmUgbWVudXMgd2lsbCBiZSBvcGVuZWQuXG4gICAqIERvZXMgbm90IGFmZmVjdCBzdHlsaW5nL2xheW91dC5cbiAgICovXG4gIG9yaWVudGF0aW9uOiAnaG9yaXpvbnRhbCcgfCAndmVydGljYWwnID0gJ3ZlcnRpY2FsJztcblxuICBfaXNJbmxpbmUgPSBmYWxzZTtcblxuICBfaGFzRm9jdXMgPSBmYWxzZTtcblxuICAvKiogQWxsIGNoaWxkIE1lbnVJdGVtIGVsZW1lbnRzIG5lc3RlZCBpbiB0aGlzIE1lbnUuICovXG4gIEBDb250ZW50Q2hpbGRyZW4oQ2RrTWVudUl0ZW0sIHtkZXNjZW5kYW50czogdHJ1ZX0pXG4gIHByb3RlY3RlZCByZWFkb25seSBpdGVtczogUXVlcnlMaXN0PENka01lbnVJdGVtPjtcblxuICAvKiogSGFuZGxlcyBrZXlib2FyZCBldmVudHMgZm9yIHRoZSBtZW51LiAqL1xuICBwcm90ZWN0ZWQga2V5TWFuYWdlcjogRm9jdXNLZXlNYW5hZ2VyPENka01lbnVJdGVtPjtcblxuICAvKiogRW1pdHMgd2hlbiB0aGUgTWVudUJhciBpcyBkZXN0cm95ZWQuICovXG4gIHByb3RlY3RlZCByZWFkb25seSBkZXN0cm95ZWQ6IFN1YmplY3Q8dm9pZD4gPSBuZXcgU3ViamVjdCgpO1xuXG4gIC8qKiBUaGUgTWVudSBJdGVtIHdoaWNoIHRyaWdnZXJlZCB0aGUgb3BlbiBzdWJtZW51LiAqL1xuICBwcm90ZWN0ZWQgb3Blbkl0ZW0/OiBDZGtNZW51SXRlbTtcblxuICAvKiogTWFuYWdlcyBpdGVtcyB1bmRlciBtb3VzZSBmb2N1cyAqL1xuICBwcm90ZWN0ZWQgcG9pbnRlclRyYWNrZXI/OiBQb2ludGVyRm9jdXNUcmFja2VyPENka01lbnVJdGVtPjtcblxuICBwcm90ZWN0ZWQgY29uc3RydWN0b3IoXG4gICAgcmVhZG9ubHkgX2VsZW1lbnRSZWY6IEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+LFxuICAgIEBJbmplY3QoTUVOVV9TVEFDSykgcmVhZG9ubHkgbWVudVN0YWNrOiBNZW51U3RhY2ssXG4gICAgQE9wdGlvbmFsKCkgcHJvdGVjdGVkIHJlYWRvbmx5IGRpcj86IERpcmVjdGlvbmFsaXR5LFxuICApIHtcbiAgICBzdXBlcigpO1xuICB9XG5cbiAgbmdBZnRlckNvbnRlbnRJbml0KCkge1xuICAgIHRoaXMuX3NldEtleU1hbmFnZXIoKTtcbiAgICB0aGlzLl9zdWJzY3JpYmVUb0hhc0ZvY3VzKCk7XG4gICAgdGhpcy5fc3Vic2NyaWJlVG9NZW51T3BlbigpO1xuICAgIHRoaXMuX3N1YnNjcmliZVRvTWVudVN0YWNrQ2xvc2VkKCk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICB0aGlzLmRlc3Ryb3llZC5uZXh0KCk7XG4gICAgdGhpcy5kZXN0cm95ZWQuY29tcGxldGUoKTtcbiAgfVxuXG4gIC8qKiBQbGFjZSBmb2N1cyBvbiB0aGUgZmlyc3QgTWVudUl0ZW0gaW4gdGhlIG1lbnUgYW5kIHNldCB0aGUgZm9jdXMgb3JpZ2luLiAqL1xuICBmb2N1c0ZpcnN0SXRlbShmb2N1c09yaWdpbjogRm9jdXNPcmlnaW4gPSAncHJvZ3JhbScpIHtcbiAgICB0aGlzLmtleU1hbmFnZXIuc2V0Rm9jdXNPcmlnaW4oZm9jdXNPcmlnaW4pO1xuICAgIHRoaXMua2V5TWFuYWdlci5zZXRGaXJzdEl0ZW1BY3RpdmUoKTtcbiAgfVxuXG4gIC8qKiBQbGFjZSBmb2N1cyBvbiB0aGUgbGFzdCBNZW51SXRlbSBpbiB0aGUgbWVudSBhbmQgc2V0IHRoZSBmb2N1cyBvcmlnaW4uICovXG4gIGZvY3VzTGFzdEl0ZW0oZm9jdXNPcmlnaW46IEZvY3VzT3JpZ2luID0gJ3Byb2dyYW0nKSB7XG4gICAgdGhpcy5rZXlNYW5hZ2VyLnNldEZvY3VzT3JpZ2luKGZvY3VzT3JpZ2luKTtcbiAgICB0aGlzLmtleU1hbmFnZXIuc2V0TGFzdEl0ZW1BY3RpdmUoKTtcbiAgfVxuXG4gIC8qKiBSZXR1cm4gdHJ1ZSBpZiB0aGlzIG1lbnUgaGFzIGJlZW4gY29uZmlndXJlZCBpbiBhIGhvcml6b250YWwgb3JpZW50YXRpb24uICovXG4gIHByb3RlY3RlZCBpc0hvcml6b250YWwoKSB7XG4gICAgcmV0dXJuIHRoaXMub3JpZW50YXRpb24gPT09ICdob3Jpem9udGFsJztcbiAgfVxuXG4gIC8qKiBSZXR1cm4gdHJ1ZSBpZiB0aGUgTWVudUJhciBoYXMgYW4gb3BlbiBzdWJtZW51LiAqL1xuICBwcm90ZWN0ZWQgaGFzT3BlblN1Ym1lbnUoKSB7XG4gICAgcmV0dXJuICEhdGhpcy5vcGVuSXRlbTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbG9zZSB0aGUgb3BlbiBtZW51IGlmIHRoZSBjdXJyZW50IGFjdGl2ZSBpdGVtIG9wZW5lZCB0aGUgcmVxdWVzdGVkIE1lbnVTdGFja0l0ZW0uXG4gICAqIEBwYXJhbSBtZW51IHRoZSBNZW51U3RhY2tJdGVtIHJlcXVlc3RlZCB0byBiZSBjbG9zZWQuXG4gICAqIEBwYXJhbSBmb2N1c1BhcmVudFRyaWdnZXIgd2hldGhlciB0byBmb2N1cyB0aGUgcGFyZW50IHRyaWdnZXIgYWZ0ZXIgY2xvc2luZyB0aGUgbWVudS5cbiAgICovXG4gIHByb3RlY3RlZCBjbG9zZU9wZW5NZW51KG1lbnU/OiBNZW51U3RhY2tJdGVtLCBmb2N1c1BhcmVudFRyaWdnZXI/OiBib29sZWFuKSB7XG4gICAgY29uc3Qga2V5TWFuYWdlciA9IHRoaXMua2V5TWFuYWdlcjtcbiAgICBjb25zdCB0cmlnZ2VyID0gdGhpcy5vcGVuSXRlbTtcbiAgICBpZiAobWVudSA9PT0gdHJpZ2dlcj8uZ2V0TWVudVRyaWdnZXIoKT8uZ2V0TWVudSgpKSB7XG4gICAgICB0cmlnZ2VyPy5nZXRNZW51VHJpZ2dlcigpPy5jbG9zZSgpO1xuICAgICAgLy8gSWYgdGhlIHVzZXIgaGFzIG1vdXNlZCBvdmVyIGEgc2libGluZyBpdGVtIHdlIHdhbnQgdG8gZm9jdXMgdGhlIGVsZW1lbnQgdW5kZXIgbW91c2UgZm9jdXNcbiAgICAgIC8vIG5vdCB0aGUgdHJpZ2dlciB3aGljaCBwcmV2aW91c2x5IG9wZW5lZCB0aGUgbm93IGNsb3NlZCBtZW51LlxuICAgICAgaWYgKGZvY3VzUGFyZW50VHJpZ2dlcikge1xuICAgICAgICBpZiAodHJpZ2dlcikge1xuICAgICAgICAgIGtleU1hbmFnZXIuc2V0QWN0aXZlSXRlbSh0cmlnZ2VyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBrZXlNYW5hZ2VyLnNldEZpcnN0SXRlbUFjdGl2ZSgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqIFNldHVwIHRoZSBGb2N1c0tleU1hbmFnZXIgd2l0aCB0aGUgY29ycmVjdCBvcmllbnRhdGlvbiBmb3IgdGhlIG1lbnUuICovXG4gIHByaXZhdGUgX3NldEtleU1hbmFnZXIoKSB7XG4gICAgdGhpcy5rZXlNYW5hZ2VyID0gbmV3IEZvY3VzS2V5TWFuYWdlcih0aGlzLml0ZW1zKS53aXRoV3JhcCgpLndpdGhUeXBlQWhlYWQoKS53aXRoSG9tZUFuZEVuZCgpO1xuXG4gICAgaWYgKHRoaXMuaXNIb3Jpem9udGFsKCkpIHtcbiAgICAgIHRoaXMua2V5TWFuYWdlci53aXRoSG9yaXpvbnRhbE9yaWVudGF0aW9uKHRoaXMuZGlyPy52YWx1ZSB8fCAnbHRyJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMua2V5TWFuYWdlci53aXRoVmVydGljYWxPcmllbnRhdGlvbigpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTdWJzY3JpYmUgdG8gdGhlIG1lbnUgdHJpZ2dlcidzIG9wZW4gZXZlbnRzIGluIG9yZGVyIHRvIHRyYWNrIHRoZSB0cmlnZ2VyIHdoaWNoIG9wZW5lZCB0aGUgbWVudVxuICAgKiBhbmQgc3RvcCB0cmFja2luZyBpdCB3aGVuIHRoZSBtZW51IGlzIGNsb3NlZC5cbiAgICovXG4gIHByaXZhdGUgX3N1YnNjcmliZVRvTWVudU9wZW4oKSB7XG4gICAgY29uc3QgZXhpdENvbmRpdGlvbiA9IG1lcmdlKHRoaXMuaXRlbXMuY2hhbmdlcywgdGhpcy5kZXN0cm95ZWQpO1xuICAgIHRoaXMuaXRlbXMuY2hhbmdlc1xuICAgICAgLnBpcGUoXG4gICAgICAgIHN0YXJ0V2l0aCh0aGlzLml0ZW1zKSxcbiAgICAgICAgbWVyZ2VNYXAoKGxpc3Q6IFF1ZXJ5TGlzdDxDZGtNZW51SXRlbT4pID0+XG4gICAgICAgICAgbGlzdFxuICAgICAgICAgICAgLmZpbHRlcihpdGVtID0+IGl0ZW0uaGFzTWVudSgpKVxuICAgICAgICAgICAgLm1hcChpdGVtID0+IGl0ZW0uZ2V0TWVudVRyaWdnZXIoKSEub3BlbmVkLnBpcGUobWFwVG8oaXRlbSksIHRha2VVbnRpbChleGl0Q29uZGl0aW9uKSkpLFxuICAgICAgICApLFxuICAgICAgICBtZXJnZUFsbCgpLFxuICAgICAgICBzd2l0Y2hNYXAoKGl0ZW06IENka01lbnVJdGVtKSA9PiB7XG4gICAgICAgICAgdGhpcy5vcGVuSXRlbSA9IGl0ZW07XG4gICAgICAgICAgcmV0dXJuIGl0ZW0uZ2V0TWVudVRyaWdnZXIoKSEuY2xvc2VkO1xuICAgICAgICB9KSxcbiAgICAgICAgdGFrZVVudGlsKHRoaXMuZGVzdHJveWVkKSxcbiAgICAgIClcbiAgICAgIC5zdWJzY3JpYmUoKCkgPT4gKHRoaXMub3Blbkl0ZW0gPSB1bmRlZmluZWQpKTtcbiAgfVxuXG4gIC8qKiBTdWJzY3JpYmUgdG8gdGhlIE1lbnVTdGFjayBjbG9zZSBhbmQgZW1wdHkgb2JzZXJ2YWJsZXMuICovXG4gIHByaXZhdGUgX3N1YnNjcmliZVRvTWVudVN0YWNrQ2xvc2VkKCkge1xuICAgIHRoaXMubWVudVN0YWNrLmNsb3NlZFxuICAgICAgLnBpcGUodGFrZVVudGlsKHRoaXMuZGVzdHJveWVkKSlcbiAgICAgIC5zdWJzY3JpYmUoKHtpdGVtLCBmb2N1c1BhcmVudFRyaWdnZXJ9KSA9PiB0aGlzLmNsb3NlT3Blbk1lbnUoaXRlbSwgZm9jdXNQYXJlbnRUcmlnZ2VyKSk7XG4gIH1cblxuICBwcml2YXRlIF9zdWJzY3JpYmVUb0hhc0ZvY3VzKCkge1xuICAgIGlmICh0aGlzLl9pc0lubGluZSkge1xuICAgICAgdGhpcy5tZW51U3RhY2suaGFzRm9jdXMucGlwZSh0YWtlVW50aWwodGhpcy5kZXN0cm95ZWQpKS5zdWJzY3JpYmUoaGFzRm9jdXMgPT4ge1xuICAgICAgICB0aGlzLl9oYXNGb2N1cyA9IGhhc0ZvY3VzO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG59XG4iXX0=