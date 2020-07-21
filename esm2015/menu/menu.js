/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, Input, Output, EventEmitter, QueryList, ContentChildren, Optional, } from '@angular/core';
import { FocusKeyManager } from '@angular/cdk/a11y';
import { LEFT_ARROW, RIGHT_ARROW, UP_ARROW, DOWN_ARROW, ESCAPE, TAB, hasModifierKey, } from '@angular/cdk/keycodes';
import { Directionality } from '@angular/cdk/bidi';
import { take, takeUntil, startWith, mergeMap, mapTo, mergeAll, switchMap } from 'rxjs/operators';
import { merge } from 'rxjs';
import { CdkMenuGroup } from './menu-group';
import { CdkMenuPanel } from './menu-panel';
import { CDK_MENU } from './menu-interface';
import { throwMissingMenuPanelError } from './menu-errors';
import { CdkMenuItem } from './menu-item';
/**
 * Directive which configures the element as a Menu which should contain child elements marked as
 * CdkMenuItem or CdkMenuGroup. Sets the appropriate role and aria-attributes for a menu and
 * contains accessible keyboard and mouse handling logic.
 *
 * It also acts as a RadioGroup for elements marked with role `menuitemradio`.
 */
export class CdkMenu extends CdkMenuGroup {
    constructor(_dir, _menuPanel) {
        super();
        this._dir = _dir;
        this._menuPanel = _menuPanel;
        /**
         * Sets the aria-orientation attribute and determines where menus will be opened.
         * Does not affect styling/layout.
         */
        this.orientation = 'vertical';
        /** Event emitted when the menu is closed. */
        this.closed = new EventEmitter();
    }
    ngOnInit() {
        this._registerWithParentPanel();
    }
    ngAfterContentInit() {
        super.ngAfterContentInit();
        this._completeChangeEmitter();
        this._setKeyManager();
        this._subscribeToMenuOpen();
        this._subscribeToMenuStack();
    }
    /** Place focus on the first MenuItem in the menu and set the focus origin. */
    focusFirstItem(focusOrigin = 'program') {
        this._keyManager.setFocusOrigin(focusOrigin);
        this._keyManager.setFirstItemActive();
    }
    /** Place focus on the last MenuItem in the menu and set the focus origin. */
    focusLastItem(focusOrigin = 'program') {
        this._keyManager.setFocusOrigin(focusOrigin);
        this._keyManager.setLastItemActive();
    }
    /** Handle keyboard events for the Menu. */
    _handleKeyEvent(event) {
        const keyManager = this._keyManager;
        switch (event.keyCode) {
            case LEFT_ARROW:
            case RIGHT_ARROW:
                if (this._isHorizontal()) {
                    event.preventDefault();
                    keyManager.setFocusOrigin('keyboard');
                    keyManager.onKeydown(event);
                }
                break;
            case UP_ARROW:
            case DOWN_ARROW:
                if (!this._isHorizontal()) {
                    event.preventDefault();
                    keyManager.setFocusOrigin('keyboard');
                    keyManager.onKeydown(event);
                }
                break;
            case ESCAPE:
                if (!hasModifierKey(event)) {
                    event.preventDefault();
                    this._menuStack.closeLatest(2 /* currentItem */);
                }
                break;
            case TAB:
                this._menuStack.closeAll();
                break;
            default:
                keyManager.onKeydown(event);
        }
    }
    /** Register this menu with its enclosing parent menu panel */
    _registerWithParentPanel() {
        const parent = this._getMenuPanel();
        if (parent) {
            parent._registerMenu(this);
        }
        else {
            throwMissingMenuPanelError();
        }
    }
    /**
     * Get the enclosing CdkMenuPanel defaulting to the injected reference over the developer
     * provided reference.
     */
    _getMenuPanel() {
        return this._menuPanel || this._explicitPanel;
    }
    /**
     * Complete the change emitter if there are any nested MenuGroups or register to complete the
     * change emitter if a MenuGroup is rendered at some point
     */
    _completeChangeEmitter() {
        if (this._hasNestedGroups()) {
            this.change.complete();
        }
        else {
            this._nestedGroups.changes.pipe(take(1)).subscribe(() => this.change.complete());
        }
    }
    /** Return true if there are nested CdkMenuGroup elements within the Menu */
    _hasNestedGroups() {
        // view engine has a bug where @ContentChildren will return the current element
        // along with children if the selectors match - not just the children.
        // Here, if there is at least one element, we check to see if the first element is a CdkMenu in
        // order to ensure that we return true iff there are child CdkMenuGroup elements.
        return this._nestedGroups.length > 0 && !(this._nestedGroups.first instanceof CdkMenu);
    }
    /** Setup the FocusKeyManager with the correct orientation for the menu. */
    _setKeyManager() {
        var _a;
        this._keyManager = new FocusKeyManager(this._allItems)
            .withWrap()
            .withTypeAhead()
            .withHomeAndEnd();
        if (this._isHorizontal()) {
            this._keyManager.withHorizontalOrientation(((_a = this._dir) === null || _a === void 0 ? void 0 : _a.value) || 'ltr');
        }
        else {
            this._keyManager.withVerticalOrientation();
        }
    }
    /** Subscribe to the MenuStack close and empty observables. */
    _subscribeToMenuStack() {
        this._menuStack.close
            .pipe(takeUntil(this.closed))
            .subscribe((item) => this._closeOpenMenu(item));
        this._menuStack.empty
            .pipe(takeUntil(this.closed))
            .subscribe((event) => this._toggleMenuFocus(event));
    }
    /**
     * Close the open menu if the current active item opened the requested MenuStackItem.
     * @param item the MenuStackItem requested to be closed.
     */
    _closeOpenMenu(menu) {
        var _a, _b;
        const keyManager = this._keyManager;
        const trigger = this._openItem;
        if (menu === ((_a = trigger === null || trigger === void 0 ? void 0 : trigger.getMenuTrigger()) === null || _a === void 0 ? void 0 : _a.getMenu())) {
            (_b = trigger.getMenuTrigger()) === null || _b === void 0 ? void 0 : _b.closeMenu();
            keyManager.setFocusOrigin('keyboard');
            keyManager.setActiveItem(trigger);
        }
    }
    /** Set focus the either the current, previous or next item based on the FocusNext event. */
    _toggleMenuFocus(event) {
        const keyManager = this._keyManager;
        switch (event) {
            case 0 /* nextItem */:
                keyManager.setFocusOrigin('keyboard');
                keyManager.setNextItemActive();
                break;
            case 1 /* previousItem */:
                keyManager.setFocusOrigin('keyboard');
                keyManager.setPreviousItemActive();
                break;
            case 2 /* currentItem */:
                if (keyManager.activeItem) {
                    keyManager.setFocusOrigin('keyboard');
                    keyManager.setActiveItem(keyManager.activeItem);
                }
                break;
        }
    }
    // TODO(andy9775): remove duplicate logic between menu an menu bar
    /**
     * Subscribe to the menu trigger's open events in order to track the trigger which opened the menu
     * and stop tracking it when the menu is closed.
     */
    _subscribeToMenuOpen() {
        const exitCondition = merge(this._allItems.changes, this.closed);
        this._allItems.changes
            .pipe(startWith(this._allItems), mergeMap((list) => list
            .filter(item => item.hasMenu())
            .map(item => item.getMenuTrigger().opened.pipe(mapTo(item), takeUntil(exitCondition)))), mergeAll(), switchMap((item) => {
            this._openItem = item;
            return item.getMenuTrigger().closed;
        }), takeUntil(this.closed))
            .subscribe(() => (this._openItem = undefined));
    }
    /** Return true if this menu has been configured in a horizontal orientation. */
    _isHorizontal() {
        return this.orientation === 'horizontal';
    }
    ngOnDestroy() {
        this._emitClosedEvent();
    }
    /** Emit and complete the closed event emitter */
    _emitClosedEvent() {
        this.closed.next();
        this.closed.complete();
    }
}
CdkMenu.decorators = [
    { type: Directive, args: [{
                selector: '[cdkMenu]',
                exportAs: 'cdkMenu',
                host: {
                    '(keydown)': '_handleKeyEvent($event)',
                    'role': 'menu',
                    '[attr.aria-orientation]': 'orientation',
                },
                providers: [
                    { provide: CdkMenuGroup, useExisting: CdkMenu },
                    { provide: CDK_MENU, useExisting: CdkMenu },
                ],
            },] }
];
CdkMenu.ctorParameters = () => [
    { type: Directionality, decorators: [{ type: Optional }] },
    { type: CdkMenuPanel, decorators: [{ type: Optional }] }
];
CdkMenu.propDecorators = {
    orientation: [{ type: Input, args: ['cdkMenuOrientation',] }],
    closed: [{ type: Output }],
    _nestedGroups: [{ type: ContentChildren, args: [CdkMenuGroup, { descendants: true },] }],
    _allItems: [{ type: ContentChildren, args: [CdkMenuItem, { descendants: true },] }],
    _explicitPanel: [{ type: Input, args: ['cdkMenuPanel',] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL21lbnUvbWVudS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQ0wsU0FBUyxFQUNULEtBQUssRUFDTCxNQUFNLEVBQ04sWUFBWSxFQUNaLFNBQVMsRUFDVCxlQUFlLEVBR2YsUUFBUSxHQUVULE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBQyxlQUFlLEVBQWMsTUFBTSxtQkFBbUIsQ0FBQztBQUMvRCxPQUFPLEVBQ0wsVUFBVSxFQUNWLFdBQVcsRUFDWCxRQUFRLEVBQ1IsVUFBVSxFQUNWLE1BQU0sRUFDTixHQUFHLEVBQ0gsY0FBYyxHQUNmLE1BQU0sdUJBQXVCLENBQUM7QUFDL0IsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQ2pELE9BQU8sRUFBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUNoRyxPQUFPLEVBQUMsS0FBSyxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQzNCLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFDMUMsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGNBQWMsQ0FBQztBQUMxQyxPQUFPLEVBQU8sUUFBUSxFQUFDLE1BQU0sa0JBQWtCLENBQUM7QUFDaEQsT0FBTyxFQUFDLDBCQUEwQixFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3pELE9BQU8sRUFBQyxXQUFXLEVBQUMsTUFBTSxhQUFhLENBQUM7QUFHeEM7Ozs7OztHQU1HO0FBY0gsTUFBTSxPQUFPLE9BQVEsU0FBUSxZQUFZO0lBb0N2QyxZQUMrQixJQUFxQixFQUNyQixVQUF5QjtRQUV0RCxLQUFLLEVBQUUsQ0FBQztRQUhxQixTQUFJ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VCxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztJQUMxQixDQUFDO0lBRUQsaURBQWlEO0lBQ3pDLGdCQUFnQjtRQUN0QixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ25CLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDekIsQ0FBQzs7O1lBbFFGLFNBQVMsU0FBQztnQkFDVCxRQUFRLEVBQUUsV0FBVztnQkFDckIsUUFBUSxFQUFFLFNBQVM7Z0JBQ25CLElBQUksRUFBRTtvQkFDSixXQUFXLEVBQUUseUJBQXlCO29CQUN0QyxNQUFNLEVBQUUsTUFBTTtvQkFDZCx5QkFBeUIsRUFBRSxhQUFhO2lCQUN6QztnQkFDRCxTQUFTLEVBQUU7b0JBQ1QsRUFBQyxPQUFPLEVBQUUsWUFBWSxFQUFFLFdBQVcsRUFBRSxPQUFPLEVBQUM7b0JBQzdDLEVBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsT0FBTyxFQUFDO2lCQUMxQzthQUNGOzs7WUE3Qk8sY0FBYyx1QkFtRWpCLFFBQVE7WUEvREwsWUFBWSx1QkFnRWYsUUFBUTs7OzBCQWpDVixLQUFLLFNBQUMsb0JBQW9CO3FCQUcxQixNQUFNOzRCQVNOLGVBQWUsU0FBQyxZQUFZLEVBQUUsRUFBQyxXQUFXLEVBQUUsSUFBSSxFQUFDO3dCQUlqRCxlQUFlLFNBQUMsV0FBVyxFQUFFLEVBQUMsV0FBVyxFQUFFLElBQUksRUFBQzs2QkFhaEQsS0FBSyxTQUFDLGNBQWMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtcbiAgRGlyZWN0aXZlLFxuICBJbnB1dCxcbiAgT3V0cHV0LFxuICBFdmVudEVtaXR0ZXIsXG4gIFF1ZXJ5TGlzdCxcbiAgQ29udGVudENoaWxkcmVuLFxuICBBZnRlckNvbnRlbnRJbml0LFxuICBPbkRlc3Ryb3ksXG4gIE9wdGlvbmFsLFxuICBPbkluaXQsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtGb2N1c0tleU1hbmFnZXIsIEZvY3VzT3JpZ2lufSBmcm9tICdAYW5ndWxhci9jZGsvYTExeSc7XG5pbXBvcnQge1xuICBMRUZUX0FSUk9XLFxuICBSSUdIVF9BUlJPVyxcbiAgVVBfQVJST1csXG4gIERPV05fQVJST1csXG4gIEVTQ0FQRSxcbiAgVEFCLFxuICBoYXNNb2RpZmllcktleSxcbn0gZnJvbSAnQGFuZ3VsYXIvY2RrL2tleWNvZGVzJztcbmltcG9ydCB7RGlyZWN0aW9uYWxpdHl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9iaWRpJztcbmltcG9ydCB7dGFrZSwgdGFrZVVudGlsLCBzdGFydFdpdGgsIG1lcmdlTWFwLCBtYXBUbywgbWVyZ2VBbGwsIHN3aXRjaE1hcH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuaW1wb3J0IHttZXJnZX0gZnJvbSAncnhqcyc7XG5pbXBvcnQge0Nka01lbnVHcm91cH0gZnJvbSAnLi9tZW51LWdyb3VwJztcbmltcG9ydCB7Q2RrTWVudVBhbmVsfSBmcm9tICcuL21lbnUtcGFuZWwnO1xuaW1wb3J0IHtNZW51LCBDREtfTUVOVX0gZnJvbSAnLi9tZW51LWludGVyZmFjZSc7XG5pbXBvcnQge3Rocm93TWlzc2luZ01lbnVQYW5lbEVycm9yfSBmcm9tICcuL21lbnUtZXJyb3JzJztcbmltcG9ydCB7Q2RrTWVudUl0ZW19IGZyb20gJy4vbWVudS1pdGVtJztcbmltcG9ydCB7TWVudVN0YWNrLCBNZW51U3RhY2tJdGVtLCBGb2N1c05leHR9IGZyb20gJy4vbWVudS1zdGFjayc7XG5cbi8qKlxuICogRGlyZWN0aXZlIHdoaWNoIGNvbmZpZ3VyZXMgdGhlIGVsZW1lbnQgYXMgYSBNZW51IHdoaWNoIHNob3VsZCBjb250YWluIGNoaWxkIGVsZW1lbnRzIG1hcmtlZCBhc1xuICogQ2RrTWVudUl0ZW0gb3IgQ2RrTWVudUdyb3VwLiBTZXRzIHRoZSBhcHByb3ByaWF0ZSByb2xlIGFuZCBhcmlhLWF0dHJpYnV0ZXMgZm9yIGEgbWVudSBhbmRcbiAqIGNvbnRhaW5zIGFjY2Vzc2libGUga2V5Ym9hcmQgYW5kIG1vdXNlIGhhbmRsaW5nIGxvZ2ljLlxuICpcbiAqIEl0IGFsc28gYWN0cyBhcyBhIFJhZGlvR3JvdXAgZm9yIGVsZW1lbnRzIG1hcmtlZCB3aXRoIHJvbGUgYG1lbnVpdGVtcmFkaW9gLlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbY2RrTWVudV0nLFxuICBleHBvcnRBczogJ2Nka01lbnUnLFxuICBob3N0OiB7XG4gICAgJyhrZXlkb3duKSc6ICdfaGFuZGxlS2V5RXZlbnQoJGV2ZW50KScsXG4gICAgJ3JvbGUnOiAnbWVudScsXG4gICAgJ1thdHRyLmFyaWEtb3JpZW50YXRpb25dJzogJ29yaWVudGF0aW9uJyxcbiAgfSxcbiAgcHJvdmlkZXJzOiBbXG4gICAge3Byb3ZpZGU6IENka01lbnVHcm91cCwgdXNlRXhpc3Rpbmc6IENka01lbnV9LFxuICAgIHtwcm92aWRlOiBDREtfTUVOVSwgdXNlRXhpc3Rpbmc6IENka01lbnV9LFxuICBdLFxufSlcbmV4cG9ydCBjbGFzcyBDZGtNZW51IGV4dGVuZHMgQ2RrTWVudUdyb3VwIGltcGxlbWVudHMgTWVudSwgQWZ0ZXJDb250ZW50SW5pdCwgT25Jbml0LCBPbkRlc3Ryb3kge1xuICAvKipcbiAgICogU2V0cyB0aGUgYXJpYS1vcmllbnRhdGlvbiBhdHRyaWJ1dGUgYW5kIGRldGVybWluZXMgd2hlcmUgbWVudXMgd2lsbCBiZSBvcGVuZWQuXG4gICAqIERvZXMgbm90IGFmZmVjdCBzdHlsaW5nL2xheW91dC5cbiAgICovXG4gIEBJbnB1dCgnY2RrTWVudU9yaWVudGF0aW9uJykgb3JpZW50YXRpb246ICdob3Jpem9udGFsJyB8ICd2ZXJ0aWNhbCcgPSAndmVydGljYWwnO1xuXG4gIC8qKiBFdmVudCBlbWl0dGVkIHdoZW4gdGhlIG1lbnUgaXMgY2xvc2VkLiAqL1xuICBAT3V0cHV0KCkgcmVhZG9ubHkgY2xvc2VkOiBFdmVudEVtaXR0ZXI8dm9pZCB8ICdjbGljaycgfCAndGFiJyB8ICdlc2NhcGUnPiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuICAvKiogVHJhY2sgdGhlIE1lbnVzIG1ha2luZyB1cCB0aGUgb3BlbiBtZW51IHN0YWNrLiAqL1xuICBfbWVudVN0YWNrOiBNZW51U3RhY2s7XG5cbiAgLyoqIEhhbmRsZXMga2V5Ym9hcmQgZXZlbnRzIGZvciB0aGUgbWVudS4gKi9cbiAgcHJpdmF0ZSBfa2V5TWFuYWdlcjogRm9jdXNLZXlNYW5hZ2VyPENka01lbnVJdGVtPjtcblxuICAvKiogTGlzdCBvZiBuZXN0ZWQgQ2RrTWVudUdyb3VwIGVsZW1lbnRzICovXG4gIEBDb250ZW50Q2hpbGRyZW4oQ2RrTWVudUdyb3VwLCB7ZGVzY2VuZGFudHM6IHRydWV9KVxuICBwcml2YXRlIHJlYWRvbmx5IF9uZXN0ZWRHcm91cHM6IFF1ZXJ5TGlzdDxDZGtNZW51R3JvdXA+O1xuXG4gIC8qKiBBbGwgY2hpbGQgTWVudUl0ZW0gZWxlbWVudHMgbmVzdGVkIGluIHRoaXMgTWVudS4gKi9cbiAgQENvbnRlbnRDaGlsZHJlbihDZGtNZW51SXRlbSwge2Rlc2NlbmRhbnRzOiB0cnVlfSlcbiAgcHJpdmF0ZSByZWFkb25seSBfYWxsSXRlbXM6IFF1ZXJ5TGlzdDxDZGtNZW51SXRlbT47XG5cbiAgLyoqIFRoZSBNZW51IEl0ZW0gd2hpY2ggdHJpZ2dlcmVkIHRoZSBvcGVuIHN1Ym1lbnUuICovXG4gIHByaXZhdGUgX29wZW5JdGVtPzogQ2RrTWVudUl0ZW07XG5cbiAgLyoqXG4gICAqIEEgcmVmZXJlbmNlIHRvIHRoZSBlbmNsb3NpbmcgcGFyZW50IG1lbnUgcGFuZWwuXG4gICAqXG4gICAqIFJlcXVpcmVkIHRvIGJlIHNldCB3aGVuIHVzaW5nIFZpZXdFbmdpbmUgc2luY2UgVmlld0VuZ2luZSBkb2VzIHN1cHBvcnQgaW5qZWN0aW5nIGEgcmVmZXJlbmNlIHRvXG4gICAqIHRoZSBwYXJlbnQgZGlyZWN0aXZlIGlmIHRoZSBwYXJlbnQgZGlyZWN0aXZlIGlzIHBsYWNlZCBvbiBhbiBgbmctdGVtcGxhdGVgLiBJZiB1c2luZyBJdnksIHRoZVxuICAgKiBpbmplY3RlZCB2YWx1ZSB3aWxsIGJlIHVzZWQgb3ZlciB0aGlzIG9uZS5cbiAgICovXG4gIEBJbnB1dCgnY2RrTWVudVBhbmVsJykgcHJpdmF0ZSByZWFkb25seSBfZXhwbGljaXRQYW5lbD86IENka01lbnVQYW5lbDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBAT3B0aW9uYWwoKSBwcml2YXRlIHJlYWRvbmx5IF9kaXI/OiBEaXJlY3Rpb25hbGl0eSxcbiAgICBAT3B0aW9uYWwoKSBwcml2YXRlIHJlYWRvbmx5IF9tZW51UGFuZWw/OiBDZGtNZW51UGFuZWxcbiAgKSB7XG4gICAgc3VwZXIoKTtcbiAgfVxuXG4gIG5nT25Jbml0KCkge1xuICAgIHRoaXMuX3JlZ2lzdGVyV2l0aFBhcmVudFBhbmVsKCk7XG4gIH1cblxuICBuZ0FmdGVyQ29udGVudEluaXQoKSB7XG4gICAgc3VwZXIubmdBZnRlckNvbnRlbnRJbml0KCk7XG5cbiAgICB0aGlzLl9jb21wbGV0ZUNoYW5nZUVtaXR0ZXIoKTtcbiAgICB0aGlzLl9zZXRLZXlNYW5hZ2VyKCk7XG4gICAgdGhpcy5fc3Vic2NyaWJlVG9NZW51T3BlbigpO1xuICAgIHRoaXMuX3N1YnNjcmliZVRvTWVudVN0YWNrKCk7XG4gIH1cblxuICAvKiogUGxhY2UgZm9jdXMgb24gdGhlIGZpcnN0IE1lbnVJdGVtIGluIHRoZSBtZW51IGFuZCBzZXQgdGhlIGZvY3VzIG9yaWdpbi4gKi9cbiAgZm9jdXNGaXJzdEl0ZW0oZm9jdXNPcmlnaW46IEZvY3VzT3JpZ2luID0gJ3Byb2dyYW0nKSB7XG4gICAgdGhpcy5fa2V5TWFuYWdlci5zZXRGb2N1c09yaWdpbihmb2N1c09yaWdpbik7XG4gICAgdGhpcy5fa2V5TWFuYWdlci5zZXRGaXJzdEl0ZW1BY3RpdmUoKTtcbiAgfVxuXG4gIC8qKiBQbGFjZSBmb2N1cyBvbiB0aGUgbGFzdCBNZW51SXRlbSBpbiB0aGUgbWVudSBhbmQgc2V0IHRoZSBmb2N1cyBvcmlnaW4uICovXG4gIGZvY3VzTGFzdEl0ZW0oZm9jdXNPcmlnaW46IEZvY3VzT3JpZ2luID0gJ3Byb2dyYW0nKSB7XG4gICAgdGhpcy5fa2V5TWFuYWdlci5zZXRGb2N1c09yaWdpbihmb2N1c09yaWdpbik7XG4gICAgdGhpcy5fa2V5TWFuYWdlci5zZXRMYXN0SXRlbUFjdGl2ZSgpO1xuICB9XG5cbiAgLyoqIEhhbmRsZSBrZXlib2FyZCBldmVudHMgZm9yIHRoZSBNZW51LiAqL1xuICBfaGFuZGxlS2V5RXZlbnQoZXZlbnQ6IEtleWJvYXJkRXZlbnQpIHtcbiAgICBjb25zdCBrZXlNYW5hZ2VyID0gdGhpcy5fa2V5TWFuYWdlcjtcbiAgICBzd2l0Y2ggKGV2ZW50LmtleUNvZGUpIHtcbiAgICAgIGNhc2UgTEVGVF9BUlJPVzpcbiAgICAgIGNhc2UgUklHSFRfQVJST1c6XG4gICAgICAgIGlmICh0aGlzLl9pc0hvcml6b250YWwoKSkge1xuICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAga2V5TWFuYWdlci5zZXRGb2N1c09yaWdpbigna2V5Ym9hcmQnKTtcbiAgICAgICAgICBrZXlNYW5hZ2VyLm9uS2V5ZG93bihldmVudCk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgVVBfQVJST1c6XG4gICAgICBjYXNlIERPV05fQVJST1c6XG4gICAgICAgIGlmICghdGhpcy5faXNIb3Jpem9udGFsKCkpIHtcbiAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgIGtleU1hbmFnZXIuc2V0Rm9jdXNPcmlnaW4oJ2tleWJvYXJkJyk7XG4gICAgICAgICAga2V5TWFuYWdlci5vbktleWRvd24oZXZlbnQpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIEVTQ0FQRTpcbiAgICAgICAgaWYgKCFoYXNNb2RpZmllcktleShldmVudCkpIHtcbiAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgIHRoaXMuX21lbnVTdGFjay5jbG9zZUxhdGVzdChGb2N1c05leHQuY3VycmVudEl0ZW0pO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIFRBQjpcbiAgICAgICAgdGhpcy5fbWVudVN0YWNrLmNsb3NlQWxsKCk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBrZXlNYW5hZ2VyLm9uS2V5ZG93bihldmVudCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFJlZ2lzdGVyIHRoaXMgbWVudSB3aXRoIGl0cyBlbmNsb3NpbmcgcGFyZW50IG1lbnUgcGFuZWwgKi9cbiAgcHJpdmF0ZSBfcmVnaXN0ZXJXaXRoUGFyZW50UGFuZWwoKSB7XG4gICAgY29uc3QgcGFyZW50ID0gdGhpcy5fZ2V0TWVudVBhbmVsKCk7XG4gICAgaWYgKHBhcmVudCkge1xuICAgICAgcGFyZW50Ll9yZWdpc3Rlck1lbnUodGhpcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93TWlzc2luZ01lbnVQYW5lbEVycm9yKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgZW5jbG9zaW5nIENka01lbnVQYW5lbCBkZWZhdWx0aW5nIHRvIHRoZSBpbmplY3RlZCByZWZlcmVuY2Ugb3ZlciB0aGUgZGV2ZWxvcGVyXG4gICAqIHByb3ZpZGVkIHJlZmVyZW5jZS5cbiAgICovXG4gIHByaXZhdGUgX2dldE1lbnVQYW5lbCgpIHtcbiAgICByZXR1cm4gdGhpcy5fbWVudVBhbmVsIHx8IHRoaXMuX2V4cGxpY2l0UGFuZWw7XG4gIH1cblxuICAvKipcbiAgICogQ29tcGxldGUgdGhlIGNoYW5nZSBlbWl0dGVyIGlmIHRoZXJlIGFyZSBhbnkgbmVzdGVkIE1lbnVHcm91cHMgb3IgcmVnaXN0ZXIgdG8gY29tcGxldGUgdGhlXG4gICAqIGNoYW5nZSBlbWl0dGVyIGlmIGEgTWVudUdyb3VwIGlzIHJlbmRlcmVkIGF0IHNvbWUgcG9pbnRcbiAgICovXG4gIHByaXZhdGUgX2NvbXBsZXRlQ2hhbmdlRW1pdHRlcigpIHtcbiAgICBpZiAodGhpcy5faGFzTmVzdGVkR3JvdXBzKCkpIHtcbiAgICAgIHRoaXMuY2hhbmdlLmNvbXBsZXRlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX25lc3RlZEdyb3Vwcy5jaGFuZ2VzLnBpcGUodGFrZSgxKSkuc3Vic2NyaWJlKCgpID0+IHRoaXMuY2hhbmdlLmNvbXBsZXRlKCkpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBSZXR1cm4gdHJ1ZSBpZiB0aGVyZSBhcmUgbmVzdGVkIENka01lbnVHcm91cCBlbGVtZW50cyB3aXRoaW4gdGhlIE1lbnUgKi9cbiAgcHJpdmF0ZSBfaGFzTmVzdGVkR3JvdXBzKCkge1xuICAgIC8vIHZpZXcgZW5naW5lIGhhcyBhIGJ1ZyB3aGVyZSBAQ29udGVudENoaWxkcmVuIHdpbGwgcmV0dXJuIHRoZSBjdXJyZW50IGVsZW1lbnRcbiAgICAvLyBhbG9uZyB3aXRoIGNoaWxkcmVuIGlmIHRoZSBzZWxlY3RvcnMgbWF0Y2ggLSBub3QganVzdCB0aGUgY2hpbGRyZW4uXG4gICAgLy8gSGVyZSwgaWYgdGhlcmUgaXMgYXQgbGVhc3Qgb25lIGVsZW1lbnQsIHdlIGNoZWNrIHRvIHNlZSBpZiB0aGUgZmlyc3QgZWxlbWVudCBpcyBhIENka01lbnUgaW5cbiAgICAvLyBvcmRlciB0byBlbnN1cmUgdGhhdCB3ZSByZXR1cm4gdHJ1ZSBpZmYgdGhlcmUgYXJlIGNoaWxkIENka01lbnVHcm91cCBlbGVtZW50cy5cbiAgICByZXR1cm4gdGhpcy5fbmVzdGVkR3JvdXBzLmxlbmd0aCA+IDAgJiYgISh0aGlzLl9uZXN0ZWRHcm91cHMuZmlyc3QgaW5zdGFuY2VvZiBDZGtNZW51KTtcbiAgfVxuXG4gIC8qKiBTZXR1cCB0aGUgRm9jdXNLZXlNYW5hZ2VyIHdpdGggdGhlIGNvcnJlY3Qgb3JpZW50YXRpb24gZm9yIHRoZSBtZW51LiAqL1xuICBwcml2YXRlIF9zZXRLZXlNYW5hZ2VyKCkge1xuICAgIHRoaXMuX2tleU1hbmFnZXIgPSBuZXcgRm9jdXNLZXlNYW5hZ2VyKHRoaXMuX2FsbEl0ZW1zKVxuICAgICAgLndpdGhXcmFwKClcbiAgICAgIC53aXRoVHlwZUFoZWFkKClcbiAgICAgIC53aXRoSG9tZUFuZEVuZCgpO1xuXG4gICAgaWYgKHRoaXMuX2lzSG9yaXpvbnRhbCgpKSB7XG4gICAgICB0aGlzLl9rZXlNYW5hZ2VyLndpdGhIb3Jpem9udGFsT3JpZW50YXRpb24odGhpcy5fZGlyPy52YWx1ZSB8fCAnbHRyJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2tleU1hbmFnZXIud2l0aFZlcnRpY2FsT3JpZW50YXRpb24oKTtcbiAgICB9XG4gIH1cblxuICAvKiogU3Vic2NyaWJlIHRvIHRoZSBNZW51U3RhY2sgY2xvc2UgYW5kIGVtcHR5IG9ic2VydmFibGVzLiAqL1xuICBwcml2YXRlIF9zdWJzY3JpYmVUb01lbnVTdGFjaygpIHtcbiAgICB0aGlzLl9tZW51U3RhY2suY2xvc2VcbiAgICAgIC5waXBlKHRha2VVbnRpbCh0aGlzLmNsb3NlZCkpXG4gICAgICAuc3Vic2NyaWJlKChpdGVtOiBNZW51U3RhY2tJdGVtKSA9PiB0aGlzLl9jbG9zZU9wZW5NZW51KGl0ZW0pKTtcblxuICAgIHRoaXMuX21lbnVTdGFjay5lbXB0eVxuICAgICAgLnBpcGUodGFrZVVudGlsKHRoaXMuY2xvc2VkKSlcbiAgICAgIC5zdWJzY3JpYmUoKGV2ZW50OiBGb2N1c05leHQpID0+IHRoaXMuX3RvZ2dsZU1lbnVGb2N1cyhldmVudCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIENsb3NlIHRoZSBvcGVuIG1lbnUgaWYgdGhlIGN1cnJlbnQgYWN0aXZlIGl0ZW0gb3BlbmVkIHRoZSByZXF1ZXN0ZWQgTWVudVN0YWNrSXRlbS5cbiAgICogQHBhcmFtIGl0ZW0gdGhlIE1lbnVTdGFja0l0ZW0gcmVxdWVzdGVkIHRvIGJlIGNsb3NlZC5cbiAgICovXG4gIHByaXZhdGUgX2Nsb3NlT3Blbk1lbnUobWVudTogTWVudVN0YWNrSXRlbSkge1xuICAgIGNvbnN0IGtleU1hbmFnZXIgPSB0aGlzLl9rZXlNYW5hZ2VyO1xuICAgIGNvbnN0IHRyaWdnZXIgPSB0aGlzLl9vcGVuSXRlbTtcbiAgICBpZiAobWVudSA9PT0gdHJpZ2dlcj8uZ2V0TWVudVRyaWdnZXIoKT8uZ2V0TWVudSgpKSB7XG4gICAgICB0cmlnZ2VyLmdldE1lbnVUcmlnZ2VyKCk/LmNsb3NlTWVudSgpO1xuICAgICAga2V5TWFuYWdlci5zZXRGb2N1c09yaWdpbigna2V5Ym9hcmQnKTtcbiAgICAgIGtleU1hbmFnZXIuc2V0QWN0aXZlSXRlbSh0cmlnZ2VyKTtcbiAgICB9XG4gIH1cblxuICAvKiogU2V0IGZvY3VzIHRoZSBlaXRoZXIgdGhlIGN1cnJlbnQsIHByZXZpb3VzIG9yIG5leHQgaXRlbSBiYXNlZCBvbiB0aGUgRm9jdXNOZXh0IGV2ZW50LiAqL1xuICBwcml2YXRlIF90b2dnbGVNZW51Rm9jdXMoZXZlbnQ6IEZvY3VzTmV4dCkge1xuICAgIGNvbnN0IGtleU1hbmFnZXIgPSB0aGlzLl9rZXlNYW5hZ2VyO1xuICAgIHN3aXRjaCAoZXZlbnQpIHtcbiAgICAgIGNhc2UgRm9jdXNOZXh0Lm5leHRJdGVtOlxuICAgICAgICBrZXlNYW5hZ2VyLnNldEZvY3VzT3JpZ2luKCdrZXlib2FyZCcpO1xuICAgICAgICBrZXlNYW5hZ2VyLnNldE5leHRJdGVtQWN0aXZlKCk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIEZvY3VzTmV4dC5wcmV2aW91c0l0ZW06XG4gICAgICAgIGtleU1hbmFnZXIuc2V0Rm9jdXNPcmlnaW4oJ2tleWJvYXJkJyk7XG4gICAgICAgIGtleU1hbmFnZXIuc2V0UHJldmlvdXNJdGVtQWN0aXZlKCk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIEZvY3VzTmV4dC5jdXJyZW50SXRlbTpcbiAgICAgICAgaWYgKGtleU1hbmFnZXIuYWN0aXZlSXRlbSkge1xuICAgICAgICAgIGtleU1hbmFnZXIuc2V0Rm9jdXNPcmlnaW4oJ2tleWJvYXJkJyk7XG4gICAgICAgICAga2V5TWFuYWdlci5zZXRBY3RpdmVJdGVtKGtleU1hbmFnZXIuYWN0aXZlSXRlbSk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgLy8gVE9ETyhhbmR5OTc3NSk6IHJlbW92ZSBkdXBsaWNhdGUgbG9naWMgYmV0d2VlbiBtZW51IGFuIG1lbnUgYmFyXG4gIC8qKlxuICAgKiBTdWJzY3JpYmUgdG8gdGhlIG1lbnUgdHJpZ2dlcidzIG9wZW4gZXZlbnRzIGluIG9yZGVyIHRvIHRyYWNrIHRoZSB0cmlnZ2VyIHdoaWNoIG9wZW5lZCB0aGUgbWVudVxuICAgKiBhbmQgc3RvcCB0cmFja2luZyBpdCB3aGVuIHRoZSBtZW51IGlzIGNsb3NlZC5cbiAgICovXG4gIHByaXZhdGUgX3N1YnNjcmliZVRvTWVudU9wZW4oKSB7XG4gICAgY29uc3QgZXhpdENvbmRpdGlvbiA9IG1lcmdlKHRoaXMuX2FsbEl0ZW1zLmNoYW5nZXMsIHRoaXMuY2xvc2VkKTtcbiAgICB0aGlzLl9hbGxJdGVtcy5jaGFuZ2VzXG4gICAgICAucGlwZShcbiAgICAgICAgc3RhcnRXaXRoKHRoaXMuX2FsbEl0ZW1zKSxcbiAgICAgICAgbWVyZ2VNYXAoKGxpc3Q6IFF1ZXJ5TGlzdDxDZGtNZW51SXRlbT4pID0+XG4gICAgICAgICAgbGlzdFxuICAgICAgICAgICAgLmZpbHRlcihpdGVtID0+IGl0ZW0uaGFzTWVudSgpKVxuICAgICAgICAgICAgLm1hcChpdGVtID0+IGl0ZW0uZ2V0TWVudVRyaWdnZXIoKSEub3BlbmVkLnBpcGUobWFwVG8oaXRlbSksIHRha2VVbnRpbChleGl0Q29uZGl0aW9uKSkpXG4gICAgICAgICksXG4gICAgICAgIG1lcmdlQWxsKCksXG4gICAgICAgIHN3aXRjaE1hcCgoaXRlbTogQ2RrTWVudUl0ZW0pID0+IHtcbiAgICAgICAgICB0aGlzLl9vcGVuSXRlbSA9IGl0ZW07XG4gICAgICAgICAgcmV0dXJuIGl0ZW0uZ2V0TWVudVRyaWdnZXIoKSEuY2xvc2VkO1xuICAgICAgICB9KSxcbiAgICAgICAgdGFrZVVudGlsKHRoaXMuY2xvc2VkKVxuICAgICAgKVxuICAgICAgLnN1YnNjcmliZSgoKSA9PiAodGhpcy5fb3Blbkl0ZW0gPSB1bmRlZmluZWQpKTtcbiAgfVxuXG4gIC8qKiBSZXR1cm4gdHJ1ZSBpZiB0aGlzIG1lbnUgaGFzIGJlZW4gY29uZmlndXJlZCBpbiBhIGhvcml6b250YWwgb3JpZW50YXRpb24uICovXG4gIHByaXZhdGUgX2lzSG9yaXpvbnRhbCgpIHtcbiAgICByZXR1cm4gdGhpcy5vcmllbnRhdGlvbiA9PT0gJ2hvcml6b250YWwnO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgdGhpcy5fZW1pdENsb3NlZEV2ZW50KCk7XG4gIH1cblxuICAvKiogRW1pdCBhbmQgY29tcGxldGUgdGhlIGNsb3NlZCBldmVudCBlbWl0dGVyICovXG4gIHByaXZhdGUgX2VtaXRDbG9zZWRFdmVudCgpIHtcbiAgICB0aGlzLmNsb3NlZC5uZXh0KCk7XG4gICAgdGhpcy5jbG9zZWQuY29tcGxldGUoKTtcbiAgfVxufVxuIl19