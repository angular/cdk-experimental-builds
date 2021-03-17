/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, Input, ViewContainerRef, Output, EventEmitter, Optional, Inject, Injectable, InjectionToken, } from '@angular/core';
import { Directionality } from '@angular/cdk/bidi';
import { Overlay, OverlayConfig, } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { Subject, merge } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CdkMenuPanel } from './menu-panel';
import { MenuStack } from './menu-stack';
import { throwExistingMenuStackError } from './menu-errors';
import { isClickInsideMenuOverlay } from './menu-item-trigger';
import * as i0 from "@angular/core";
/** Tracks the last open context menu trigger across the entire application. */
export class ContextMenuTracker {
    /**
     * Close the previous open context menu and set the given one as being open.
     * @param trigger the trigger for the currently open Context Menu.
     */
    update(trigger) {
        var _a;
        if (ContextMenuTracker._openContextMenuTrigger !== trigger) {
            (_a = ContextMenuTracker._openContextMenuTrigger) === null || _a === void 0 ? void 0 : _a.close();
            ContextMenuTracker._openContextMenuTrigger = trigger;
        }
    }
}
ContextMenuTracker.ɵprov = i0.ɵɵdefineInjectable({ factory: function ContextMenuTracker_Factory() { return new ContextMenuTracker(); }, token: ContextMenuTracker, providedIn: "root" });
ContextMenuTracker.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] }
];
/** Injection token for the ContextMenu options object. */
export const CDK_CONTEXT_MENU_DEFAULT_OPTIONS = new InjectionToken('cdk-context-menu-default-options');
const ɵ0 = { offsetX: 2, offsetY: 2 };
/**
 * A directive which when placed on some element opens a the Menu it is bound to when a user
 * right-clicks within that element. It is aware of nested Context Menus and the lowest level
 * non-disabled context menu will trigger.
 */
export class CdkContextMenuTrigger {
    constructor(_viewContainerRef, _overlay, _contextMenuTracker, _options, _directionality) {
        this._viewContainerRef = _viewContainerRef;
        this._overlay = _overlay;
        this._contextMenuTracker = _contextMenuTracker;
        this._options = _options;
        this._directionality = _directionality;
        /** Emits when the attached menu is requested to open. */
        this.opened = new EventEmitter();
        /** Emits when the attached menu is requested to close. */
        this.closed = new EventEmitter();
        this._disabled = false;
        /** A reference to the overlay which manages the triggered menu. */
        this._overlayRef = null;
        /** Emits when the element is destroyed. */
        this._destroyed = new Subject();
        /** The menu stack for this trigger and its associated menus. */
        this._menuStack = new MenuStack();
        /** Emits when the outside pointer events listener on the overlay should be stopped. */
        this._stopOutsideClicksListener = merge(this.closed, this._destroyed);
        this._setMenuStackListener();
    }
    /** Template reference variable to the menu to open on right click. */
    get menuPanel() {
        return this._menuPanel;
    }
    set menuPanel(panel) {
        if ((typeof ngDevMode === 'undefined' || ngDevMode) && panel._menuStack) {
            throwExistingMenuStackError();
        }
        this._menuPanel = panel;
        if (this._menuPanel) {
            this._menuPanel._menuStack = this._menuStack;
        }
    }
    /** Whether the context menu should be disabled. */
    get disabled() {
        return this._disabled;
    }
    set disabled(value) {
        this._disabled = coerceBooleanProperty(value);
    }
    /**
     * Open the attached menu at the specified location.
     * @param coordinates where to open the context menu
     */
    open(coordinates) {
        if (this.disabled) {
            return;
        }
        else if (this.isOpen()) {
            // since we're moving this menu we need to close any submenus first otherwise they end up
            // disconnected from this one.
            this._menuStack.closeSubMenuOf(this._menuPanel._menu);
            this._overlayRef.getConfig()
                .positionStrategy.setOrigin(coordinates);
            this._overlayRef.updatePosition();
        }
        else {
            this.opened.next();
            if (this._overlayRef) {
                this._overlayRef.getConfig()
                    .positionStrategy.setOrigin(coordinates);
                this._overlayRef.updatePosition();
            }
            else {
                this._overlayRef = this._overlay.create(this._getOverlayConfig(coordinates));
            }
            this._overlayRef.attach(this._getMenuContent());
            this._subscribeToOutsideClicks();
        }
    }
    /** Close the opened menu. */
    close() {
        this._menuStack.closeAll();
    }
    /**
     * Open the context menu and close any previously open menus.
     * @param event the mouse event which opens the context menu.
     */
    _openOnContextMenu(event) {
        var _a, _b, _c;
        if (!this.disabled) {
            // Prevent the native context menu from opening because we're opening a custom one.
            event.preventDefault();
            // Stop event propagation to ensure that only the closest enabled context menu opens.
            // Otherwise, any context menus attached to containing elements would *also* open,
            // resulting in multiple stacked context menus being displayed.
            event.stopPropagation();
            this._contextMenuTracker.update(this);
            this.open({ x: event.clientX, y: event.clientY });
            // A context menu can be triggered via a mouse right click or a keyboard shortcut.
            if (event.button === 2) {
                (_a = this._menuPanel._menu) === null || _a === void 0 ? void 0 : _a.focusFirstItem('mouse');
            }
            else if (event.button === 0) {
                (_b = this._menuPanel._menu) === null || _b === void 0 ? void 0 : _b.focusFirstItem('keyboard');
            }
            else {
                (_c = this._menuPanel._menu) === null || _c === void 0 ? void 0 : _c.focusFirstItem('program');
            }
        }
    }
    /** Whether the attached menu is open. */
    isOpen() {
        var _a;
        return !!((_a = this._overlayRef) === null || _a === void 0 ? void 0 : _a.hasAttached());
    }
    /**
     * Get the configuration object used to create the overlay.
     * @param coordinates the location to place the opened menu
     */
    _getOverlayConfig(coordinates) {
        return new OverlayConfig({
            positionStrategy: this._getOverlayPositionStrategy(coordinates),
            scrollStrategy: this._overlay.scrollStrategies.block(),
            direction: this._directionality,
        });
    }
    /**
     * Build the position strategy for the overlay which specifies where to place the menu.
     * @param coordinates the location to place the opened menu
     */
    _getOverlayPositionStrategy(coordinates) {
        return this._overlay
            .position()
            .flexibleConnectedTo(coordinates)
            .withDefaultOffsetX(this._options.offsetX)
            .withDefaultOffsetY(this._options.offsetY)
            .withPositions(this._getOverlayPositions());
    }
    /**
     * Determine and return where to position the opened menu relative to the mouse location.
     */
    _getOverlayPositions() {
        // TODO: this should be configurable through the injected context menu options
        return [
            { originX: 'end', originY: 'top', overlayX: 'start', overlayY: 'top' },
            { originX: 'start', originY: 'top', overlayX: 'end', overlayY: 'top' },
            { originX: 'end', originY: 'bottom', overlayX: 'start', overlayY: 'bottom' },
            { originX: 'start', originY: 'bottom', overlayX: 'end', overlayY: 'bottom' },
        ];
    }
    /**
     * Get the portal to be attached to the overlay which contains the menu. Allows for the menu
     * content to change dynamically and be reflected in the application.
     */
    _getMenuContent() {
        var _a;
        const hasMenuContentChanged = this.menuPanel._templateRef !== ((_a = this._panelContent) === null || _a === void 0 ? void 0 : _a.templateRef);
        if (this.menuPanel && (!this._panelContent || hasMenuContentChanged)) {
            this._panelContent = new TemplatePortal(this.menuPanel._templateRef, this._viewContainerRef);
        }
        return this._panelContent;
    }
    /** Subscribe to the menu stack close events and close this menu when requested. */
    _setMenuStackListener() {
        this._menuStack.closed.pipe(takeUntil(this._destroyed)).subscribe((item) => {
            if (item === this._menuPanel._menu && this.isOpen()) {
                this.closed.next();
                this._overlayRef.detach();
            }
        });
    }
    /**
     * Subscribe to the overlays outside pointer events stream and handle closing out the stack if a
     * click occurs outside the menus.
     */
    _subscribeToOutsideClicks() {
        if (this._overlayRef) {
            this._overlayRef
                .outsidePointerEvents()
                .pipe(takeUntil(this._stopOutsideClicksListener))
                .subscribe(event => {
                if (!isClickInsideMenuOverlay(event.target)) {
                    this._menuStack.closeAll();
                }
            });
        }
    }
    ngOnDestroy() {
        this._destroyOverlay();
        this._resetPanelMenuStack();
        this._destroyed.next();
        this._destroyed.complete();
    }
    /** Destroy and unset the overlay reference it if exists. */
    _destroyOverlay() {
        if (this._overlayRef) {
            this._overlayRef.dispose();
            this._overlayRef = null;
        }
    }
    /** Set the menu panels menu stack back to null. */
    _resetPanelMenuStack() {
        // If a ContextMenuTrigger is placed in a conditionally rendered view, each time the trigger is
        // rendered the panel setter for ContextMenuTrigger is called. From the first render onward,
        // the attached CdkMenuPanel has the MenuStack set. Since we throw an error if a panel already
        // has a stack set, we want to reset the attached stack here to prevent the error from being
        // thrown if the trigger re-configures its attached panel (in the case where there is a 1:1
        // relationship between the panel and trigger).
        if (this._menuPanel) {
            this._menuPanel._menuStack = null;
        }
    }
}
CdkContextMenuTrigger.decorators = [
    { type: Directive, args: [{
                selector: '[cdkContextMenuTriggerFor]',
                exportAs: 'cdkContextMenuTriggerFor',
                host: {
                    '(contextmenu)': '_openOnContextMenu($event)',
                },
                providers: [
                    // In cases where the first menu item in the context menu is a trigger the submenu opens on a
                    // hover event. Offsetting the opened context menu by 2px prevents this from occurring.
                    { provide: CDK_CONTEXT_MENU_DEFAULT_OPTIONS, useValue: ɵ0 },
                ],
            },] }
];
CdkContextMenuTrigger.ctorParameters = () => [
    { type: ViewContainerRef },
    { type: Overlay },
    { type: ContextMenuTracker },
    { type: undefined, decorators: [{ type: Inject, args: [CDK_CONTEXT_MENU_DEFAULT_OPTIONS,] }] },
    { type: Directionality, decorators: [{ type: Optional }] }
];
CdkContextMenuTrigger.propDecorators = {
    menuPanel: [{ type: Input, args: ['cdkContextMenuTriggerFor',] }],
    opened: [{ type: Output, args: ['cdkContextMenuOpened',] }],
    closed: [{ type: Output, args: ['cdkContextMenuClosed',] }],
    disabled: [{ type: Input, args: ['cdkContextMenuDisabled',] }]
};
export { ɵ0 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGV4dC1tZW51LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvbWVudS9jb250ZXh0LW1lbnUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUNMLFNBQVMsRUFDVCxLQUFLLEVBQ0wsZ0JBQWdCLEVBQ2hCLE1BQU0sRUFDTixZQUFZLEVBQ1osUUFBUSxFQUVSLE1BQU0sRUFDTixVQUFVLEVBQ1YsY0FBYyxHQUNmLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUNqRCxPQUFPLEVBRUwsT0FBTyxFQUNQLGFBQWEsR0FHZCxNQUFNLHNCQUFzQixDQUFDO0FBQzlCLE9BQU8sRUFBQyxjQUFjLEVBQVMsTUFBTSxxQkFBcUIsQ0FBQztBQUMzRCxPQUFPLEVBQUMscUJBQXFCLEVBQWUsTUFBTSx1QkFBdUIsQ0FBQztBQUMxRSxPQUFPLEVBQUMsT0FBTyxFQUFFLEtBQUssRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUNwQyxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDekMsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGNBQWMsQ0FBQztBQUMxQyxPQUFPLEVBQUMsU0FBUyxFQUFnQixNQUFNLGNBQWMsQ0FBQztBQUN0RCxPQUFPLEVBQUMsMkJBQTJCLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDMUQsT0FBTyxFQUFDLHdCQUF3QixFQUFDLE1BQU0scUJBQXFCLENBQUM7O0FBRTdELCtFQUErRTtBQUUvRSxNQUFNLE9BQU8sa0JBQWtCO0lBSTdCOzs7T0FHRztJQUNILE1BQU0sQ0FBQyxPQUE4Qjs7UUFDbkMsSUFBSSxrQkFBa0IsQ0FBQyx1QkFBdUIsS0FBSyxPQUFPLEVBQUU7WUFDMUQsTUFBQSxrQkFBa0IsQ0FBQyx1QkFBdUIsMENBQUUsS0FBSyxFQUFF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QUFHLElBQUksQ0FBQztTQUNuQztJQUNILENBQUM7OztZQXhQRixTQUFTLFNBQUM7Z0JBQ1QsUUFBUSxFQUFFLDRCQUE0QjtnQkFDdEMsUUFBUSxFQUFFLDBCQUEwQjtnQkFDcEMsSUFBSSxFQUFFO29CQUNKLGVBQWUsRUFBRSw0QkFBNEI7aUJBQzlDO2dCQUNELFNBQVMsRUFBRTtvQkFDVCw2RkFBNkY7b0JBQzdGLHVGQUF1RjtvQkFDdkYsRUFBQyxPQUFPLEVBQUUsZ0NBQWdDLEVBQUUsUUFBUSxJQUEwQixFQUFDO2lCQUNoRjthQUNGOzs7WUE3RUMsZ0JBQWdCO1lBWWhCLE9BQU87WUF1SGlDLGtCQUFrQjs0Q0FDdkQsTUFBTSxTQUFDLGdDQUFnQztZQTNIcEMsY0FBYyx1QkE0SGpCLFFBQVE7Ozt3QkFyRFYsS0FBSyxTQUFDLDBCQUEwQjtxQkFrQmhDLE1BQU0sU0FBQyxzQkFBc0I7cUJBRzdCLE1BQU0sU0FBQyxzQkFBc0I7dUJBRzdCLEtBQUssU0FBQyx3QkFBd0IiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtcbiAgRGlyZWN0aXZlLFxuICBJbnB1dCxcbiAgVmlld0NvbnRhaW5lclJlZixcbiAgT3V0cHV0LFxuICBFdmVudEVtaXR0ZXIsXG4gIE9wdGlvbmFsLFxuICBPbkRlc3Ryb3ksXG4gIEluamVjdCxcbiAgSW5qZWN0YWJsZSxcbiAgSW5qZWN0aW9uVG9rZW4sXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtEaXJlY3Rpb25hbGl0eX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2JpZGknO1xuaW1wb3J0IHtcbiAgT3ZlcmxheVJlZixcbiAgT3ZlcmxheSxcbiAgT3ZlcmxheUNvbmZpZyxcbiAgRmxleGlibGVDb25uZWN0ZWRQb3NpdGlvblN0cmF0ZWd5LFxuICBDb25uZWN0ZWRQb3NpdGlvbixcbn0gZnJvbSAnQGFuZ3VsYXIvY2RrL292ZXJsYXknO1xuaW1wb3J0IHtUZW1wbGF0ZVBvcnRhbCwgUG9ydGFsfSBmcm9tICdAYW5ndWxhci9jZGsvcG9ydGFsJztcbmltcG9ydCB7Y29lcmNlQm9vbGVhblByb3BlcnR5LCBCb29sZWFuSW5wdXR9IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2VyY2lvbic7XG5pbXBvcnQge1N1YmplY3QsIG1lcmdlfSBmcm9tICdyeGpzJztcbmltcG9ydCB7dGFrZVVudGlsfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5pbXBvcnQge0Nka01lbnVQYW5lbH0gZnJvbSAnLi9tZW51LXBhbmVsJztcbmltcG9ydCB7TWVudVN0YWNrLCBNZW51U3RhY2tJdGVtfSBmcm9tICcuL21lbnUtc3RhY2snO1xuaW1wb3J0IHt0aHJvd0V4aXN0aW5nTWVudVN0YWNrRXJyb3J9IGZyb20gJy4vbWVudS1lcnJvcnMnO1xuaW1wb3J0IHtpc0NsaWNrSW5zaWRlTWVudU92ZXJsYXl9IGZyb20gJy4vbWVudS1pdGVtLXRyaWdnZXInO1xuXG4vKiogVHJhY2tzIHRoZSBsYXN0IG9wZW4gY29udGV4dCBtZW51IHRyaWdnZXIgYWNyb3NzIHRoZSBlbnRpcmUgYXBwbGljYXRpb24uICovXG5ASW5qZWN0YWJsZSh7cHJvdmlkZWRJbjogJ3Jvb3QnfSlcbmV4cG9ydCBjbGFzcyBDb250ZXh0TWVudVRyYWNrZXIge1xuICAvKiogVGhlIGxhc3Qgb3BlbiBjb250ZXh0IG1lbnUgdHJpZ2dlci4gKi9cbiAgcHJpdmF0ZSBzdGF0aWMgX29wZW5Db250ZXh0TWVudVRyaWdnZXI/OiBDZGtDb250ZXh0TWVudVRyaWdnZXI7XG5cbiAgLyoqXG4gICAqIENsb3NlIHRoZSBwcmV2aW91cyBvcGVuIGNvbnRleHQgbWVudSBhbmQgc2V0IHRoZSBnaXZlbiBvbmUgYXMgYmVpbmcgb3Blbi5cbiAgICogQHBhcmFtIHRyaWdnZXIgdGhlIHRyaWdnZXIgZm9yIHRoZSBjdXJyZW50bHkgb3BlbiBDb250ZXh0IE1lbnUuXG4gICAqL1xuICB1cGRhdGUodHJpZ2dlcjogQ2RrQ29udGV4dE1lbnVUcmlnZ2VyKSB7XG4gICAgaWYgKENvbnRleHRNZW51VHJhY2tlci5fb3BlbkNvbnRleHRNZW51VHJpZ2dlciAhPT0gdHJpZ2dlcikge1xuICAgICAgQ29udGV4dE1lbnVUcmFja2VyLl9vcGVuQ29udGV4dE1lbnVUcmlnZ2VyPy5jbG9zZSgpO1xuICAgICAgQ29udGV4dE1lbnVUcmFja2VyLl9vcGVuQ29udGV4dE1lbnVUcmlnZ2VyID0gdHJpZ2dlcjtcbiAgICB9XG4gIH1cbn1cblxuLyoqIENvbmZpZ3VyYXRpb24gb3B0aW9ucyBwYXNzZWQgdG8gdGhlIGNvbnRleHQgbWVudS4gKi9cbmV4cG9ydCB0eXBlIENvbnRleHRNZW51T3B0aW9ucyA9IHtcbiAgLyoqIFRoZSBvcGVuZWQgbWVudXMgWCBjb29yZGluYXRlIG9mZnNldCBmcm9tIHRoZSB0cmlnZ2VyaW5nIHBvc2l0aW9uLiAqL1xuICBvZmZzZXRYOiBudW1iZXI7XG5cbiAgLyoqIFRoZSBvcGVuZWQgbWVudXMgWSBjb29yZGluYXRlIG9mZnNldCBmcm9tIHRoZSB0cmlnZ2VyaW5nIHBvc2l0aW9uLiAqL1xuICBvZmZzZXRZOiBudW1iZXI7XG59O1xuXG4vKiogSW5qZWN0aW9uIHRva2VuIGZvciB0aGUgQ29udGV4dE1lbnUgb3B0aW9ucyBvYmplY3QuICovXG5leHBvcnQgY29uc3QgQ0RLX0NPTlRFWFRfTUVOVV9ERUZBVUxUX09QVElPTlMgPSBuZXcgSW5qZWN0aW9uVG9rZW48Q29udGV4dE1lbnVPcHRpb25zPihcbiAgJ2Nkay1jb250ZXh0LW1lbnUtZGVmYXVsdC1vcHRpb25zJ1xuKTtcblxuLyoqIFRoZSBjb29yZGluYXRlcyBvZiB3aGVyZSB0aGUgY29udGV4dCBtZW51IHNob3VsZCBvcGVuLiAqL1xuZXhwb3J0IHR5cGUgQ29udGV4dE1lbnVDb29yZGluYXRlcyA9IHt4OiBudW1iZXI7IHk6IG51bWJlcn07XG5cbi8qKlxuICogQSBkaXJlY3RpdmUgd2hpY2ggd2hlbiBwbGFjZWQgb24gc29tZSBlbGVtZW50IG9wZW5zIGEgdGhlIE1lbnUgaXQgaXMgYm91bmQgdG8gd2hlbiBhIHVzZXJcbiAqIHJpZ2h0LWNsaWNrcyB3aXRoaW4gdGhhdCBlbGVtZW50LiBJdCBpcyBhd2FyZSBvZiBuZXN0ZWQgQ29udGV4dCBNZW51cyBhbmQgdGhlIGxvd2VzdCBsZXZlbFxuICogbm9uLWRpc2FibGVkIGNvbnRleHQgbWVudSB3aWxsIHRyaWdnZXIuXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tjZGtDb250ZXh0TWVudVRyaWdnZXJGb3JdJyxcbiAgZXhwb3J0QXM6ICdjZGtDb250ZXh0TWVudVRyaWdnZXJGb3InLFxuICBob3N0OiB7XG4gICAgJyhjb250ZXh0bWVudSknOiAnX29wZW5PbkNvbnRleHRNZW51KCRldmVudCknLFxuICB9LFxuICBwcm92aWRlcnM6IFtcbiAgICAvLyBJbiBjYXNlcyB3aGVyZSB0aGUgZmlyc3QgbWVudSBpdGVtIGluIHRoZSBjb250ZXh0IG1lbnUgaXMgYSB0cmlnZ2VyIHRoZSBzdWJtZW51IG9wZW5zIG9uIGFcbiAgICAvLyBob3ZlciBldmVudC4gT2Zmc2V0dGluZyB0aGUgb3BlbmVkIGNvbnRleHQgbWVudSBieSAycHggcHJldmVudHMgdGhpcyBmcm9tIG9jY3VycmluZy5cbiAgICB7cHJvdmlkZTogQ0RLX0NPTlRFWFRfTUVOVV9ERUZBVUxUX09QVElPTlMsIHVzZVZhbHVlOiB7b2Zmc2V0WDogMiwgb2Zmc2V0WTogMn19LFxuICBdLFxufSlcbmV4cG9ydCBjbGFzcyBDZGtDb250ZXh0TWVudVRyaWdnZXIgaW1wbGVtZW50cyBPbkRlc3Ryb3kge1xuICAvKiogVGVtcGxhdGUgcmVmZXJlbmNlIHZhcmlhYmxlIHRvIHRoZSBtZW51IHRvIG9wZW4gb24gcmlnaHQgY2xpY2suICovXG4gIEBJbnB1dCgnY2RrQ29udGV4dE1lbnVUcmlnZ2VyRm9yJylcbiAgZ2V0IG1lbnVQYW5lbCgpOiBDZGtNZW51UGFuZWwge1xuICAgIHJldHVybiB0aGlzLl9tZW51UGFuZWw7XG4gIH1cbiAgc2V0IG1lbnVQYW5lbChwYW5lbDogQ2RrTWVudVBhbmVsKSB7XG4gICAgaWYgKCh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpICYmIHBhbmVsLl9tZW51U3RhY2spIHtcbiAgICAgIHRocm93RXhpc3RpbmdNZW51U3RhY2tFcnJvcigpO1xuICAgIH1cbiAgICB0aGlzLl9tZW51UGFuZWwgPSBwYW5lbDtcblxuICAgIGlmICh0aGlzLl9tZW51UGFuZWwpIHtcbiAgICAgIHRoaXMuX21lbnVQYW5lbC5fbWVudVN0YWNrID0gdGhpcy5fbWVudVN0YWNrO1xuICAgIH1cbiAgfVxuICAvKiogUmVmZXJlbmNlIHRvIHRoZSBNZW51UGFuZWwgdGhpcyB0cmlnZ2VyIHRvZ2dsZXMuICovXG4gIHByaXZhdGUgX21lbnVQYW5lbDogQ2RrTWVudVBhbmVsO1xuXG4gIC8qKiBFbWl0cyB3aGVuIHRoZSBhdHRhY2hlZCBtZW51IGlzIHJlcXVlc3RlZCB0byBvcGVuLiAqL1xuICBAT3V0cHV0KCdjZGtDb250ZXh0TWVudU9wZW5lZCcpIHJlYWRvbmx5IG9wZW5lZDogRXZlbnRFbWl0dGVyPHZvaWQ+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4gIC8qKiBFbWl0cyB3aGVuIHRoZSBhdHRhY2hlZCBtZW51IGlzIHJlcXVlc3RlZCB0byBjbG9zZS4gKi9cbiAgQE91dHB1dCgnY2RrQ29udGV4dE1lbnVDbG9zZWQnKSByZWFkb25seSBjbG9zZWQ6IEV2ZW50RW1pdHRlcjx2b2lkPiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuICAvKiogV2hldGhlciB0aGUgY29udGV4dCBtZW51IHNob3VsZCBiZSBkaXNhYmxlZC4gKi9cbiAgQElucHV0KCdjZGtDb250ZXh0TWVudURpc2FibGVkJylcbiAgZ2V0IGRpc2FibGVkKCkge1xuICAgIHJldHVybiB0aGlzLl9kaXNhYmxlZDtcbiAgfVxuICBzZXQgZGlzYWJsZWQodmFsdWU6IGJvb2xlYW4pIHtcbiAgICB0aGlzLl9kaXNhYmxlZCA9IGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eSh2YWx1ZSk7XG4gIH1cbiAgcHJpdmF0ZSBfZGlzYWJsZWQgPSBmYWxzZTtcblxuICAvKiogQSByZWZlcmVuY2UgdG8gdGhlIG92ZXJsYXkgd2hpY2ggbWFuYWdlcyB0aGUgdHJpZ2dlcmVkIG1lbnUuICovXG4gIHByaXZhdGUgX292ZXJsYXlSZWY6IE92ZXJsYXlSZWYgfCBudWxsID0gbnVsbDtcblxuICAvKiogVGhlIGNvbnRlbnQgb2YgdGhlIG1lbnUgcGFuZWwgb3BlbmVkIGJ5IHRoaXMgdHJpZ2dlci4gKi9cbiAgcHJpdmF0ZSBfcGFuZWxDb250ZW50OiBUZW1wbGF0ZVBvcnRhbDtcblxuICAvKiogRW1pdHMgd2hlbiB0aGUgZWxlbWVudCBpcyBkZXN0cm95ZWQuICovXG4gIHByaXZhdGUgcmVhZG9ubHkgX2Rlc3Ryb3llZDogU3ViamVjdDx2b2lkPiA9IG5ldyBTdWJqZWN0KCk7XG5cbiAgLyoqIFRoZSBtZW51IHN0YWNrIGZvciB0aGlzIHRyaWdnZXIgYW5kIGl0cyBhc3NvY2lhdGVkIG1lbnVzLiAqL1xuICBwcml2YXRlIHJlYWRvbmx5IF9tZW51U3RhY2sgPSBuZXcgTWVudVN0YWNrKCk7XG5cbiAgLyoqIEVtaXRzIHdoZW4gdGhlIG91dHNpZGUgcG9pbnRlciBldmVudHMgbGlzdGVuZXIgb24gdGhlIG92ZXJsYXkgc2hvdWxkIGJlIHN0b3BwZWQuICovXG4gIHByaXZhdGUgcmVhZG9ubHkgX3N0b3BPdXRzaWRlQ2xpY2tzTGlzdGVuZXIgPSBtZXJnZSh0aGlzLmNsb3NlZCwgdGhpcy5fZGVzdHJveWVkKTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgX3ZpZXdDb250YWluZXJSZWY6IFZpZXdDb250YWluZXJSZWYsXG4gICAgcHJpdmF0ZSByZWFkb25seSBfb3ZlcmxheTogT3ZlcmxheSxcbiAgICBwcml2YXRlIHJlYWRvbmx5IF9jb250ZXh0TWVudVRyYWNrZXI6IENvbnRleHRNZW51VHJhY2tlcixcbiAgICBASW5qZWN0KENES19DT05URVhUX01FTlVfREVGQVVMVF9PUFRJT05TKSBwcml2YXRlIHJlYWRvbmx5IF9vcHRpb25zOiBDb250ZXh0TWVudU9wdGlvbnMsXG4gICAgQE9wdGlvbmFsKCkgcHJpdmF0ZSByZWFkb25seSBfZGlyZWN0aW9uYWxpdHk/OiBEaXJlY3Rpb25hbGl0eVxuICApIHtcbiAgICB0aGlzLl9zZXRNZW51U3RhY2tMaXN0ZW5lcigpO1xuICB9XG5cbiAgLyoqXG4gICAqIE9wZW4gdGhlIGF0dGFjaGVkIG1lbnUgYXQgdGhlIHNwZWNpZmllZCBsb2NhdGlvbi5cbiAgICogQHBhcmFtIGNvb3JkaW5hdGVzIHdoZXJlIHRvIG9wZW4gdGhlIGNvbnRleHQgbWVudVxuICAgKi9cbiAgb3Blbihjb29yZGluYXRlczogQ29udGV4dE1lbnVDb29yZGluYXRlcykge1xuICAgIGlmICh0aGlzLmRpc2FibGVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfSBlbHNlIGlmICh0aGlzLmlzT3BlbigpKSB7XG4gICAgICAvLyBzaW5jZSB3ZSdyZSBtb3ZpbmcgdGhpcyBtZW51IHdlIG5lZWQgdG8gY2xvc2UgYW55IHN1Ym1lbnVzIGZpcnN0IG90aGVyd2lzZSB0aGV5IGVuZCB1cFxuICAgICAgLy8gZGlzY29ubmVjdGVkIGZyb20gdGhpcyBvbmUuXG4gICAgICB0aGlzLl9tZW51U3RhY2suY2xvc2VTdWJNZW51T2YodGhpcy5fbWVudVBhbmVsLl9tZW51ISk7XG5cbiAgICAgICh0aGlzLl9vdmVybGF5UmVmIS5nZXRDb25maWcoKVxuICAgICAgICAucG9zaXRpb25TdHJhdGVneSBhcyBGbGV4aWJsZUNvbm5lY3RlZFBvc2l0aW9uU3RyYXRlZ3kpLnNldE9yaWdpbihjb29yZGluYXRlcyk7XG4gICAgICB0aGlzLl9vdmVybGF5UmVmIS51cGRhdGVQb3NpdGlvbigpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLm9wZW5lZC5uZXh0KCk7XG5cbiAgICAgIGlmICh0aGlzLl9vdmVybGF5UmVmKSB7XG4gICAgICAgICh0aGlzLl9vdmVybGF5UmVmLmdldENvbmZpZygpXG4gICAgICAgICAgLnBvc2l0aW9uU3RyYXRlZ3kgYXMgRmxleGlibGVDb25uZWN0ZWRQb3NpdGlvblN0cmF0ZWd5KS5zZXRPcmlnaW4oY29vcmRpbmF0ZXMpO1xuICAgICAgICB0aGlzLl9vdmVybGF5UmVmLnVwZGF0ZVBvc2l0aW9uKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9vdmVybGF5UmVmID0gdGhpcy5fb3ZlcmxheS5jcmVhdGUodGhpcy5fZ2V0T3ZlcmxheUNvbmZpZyhjb29yZGluYXRlcykpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9vdmVybGF5UmVmLmF0dGFjaCh0aGlzLl9nZXRNZW51Q29udGVudCgpKTtcbiAgICAgIHRoaXMuX3N1YnNjcmliZVRvT3V0c2lkZUNsaWNrcygpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBDbG9zZSB0aGUgb3BlbmVkIG1lbnUuICovXG4gIGNsb3NlKCkge1xuICAgIHRoaXMuX21lbnVTdGFjay5jbG9zZUFsbCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIE9wZW4gdGhlIGNvbnRleHQgbWVudSBhbmQgY2xvc2UgYW55IHByZXZpb3VzbHkgb3BlbiBtZW51cy5cbiAgICogQHBhcmFtIGV2ZW50IHRoZSBtb3VzZSBldmVudCB3aGljaCBvcGVucyB0aGUgY29udGV4dCBtZW51LlxuICAgKi9cbiAgX29wZW5PbkNvbnRleHRNZW51KGV2ZW50OiBNb3VzZUV2ZW50KSB7XG4gICAgaWYgKCF0aGlzLmRpc2FibGVkKSB7XG4gICAgICAvLyBQcmV2ZW50IHRoZSBuYXRpdmUgY29udGV4dCBtZW51IGZyb20gb3BlbmluZyBiZWNhdXNlIHdlJ3JlIG9wZW5pbmcgYSBjdXN0b20gb25lLlxuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgLy8gU3RvcCBldmVudCBwcm9wYWdhdGlvbiB0byBlbnN1cmUgdGhhdCBvbmx5IHRoZSBjbG9zZXN0IGVuYWJsZWQgY29udGV4dCBtZW51IG9wZW5zLlxuICAgICAgLy8gT3RoZXJ3aXNlLCBhbnkgY29udGV4dCBtZW51cyBhdHRhY2hlZCB0byBjb250YWluaW5nIGVsZW1lbnRzIHdvdWxkICphbHNvKiBvcGVuLFxuICAgICAgLy8gcmVzdWx0aW5nIGluIG11bHRpcGxlIHN0YWNrZWQgY29udGV4dCBtZW51cyBiZWluZyBkaXNwbGF5ZWQuXG4gICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgICAgdGhpcy5fY29udGV4dE1lbnVUcmFja2VyLnVwZGF0ZSh0aGlzKTtcbiAgICAgIHRoaXMub3Blbih7eDogZXZlbnQuY2xpZW50WCwgeTogZXZlbnQuY2xpZW50WX0pO1xuXG4gICAgICAvLyBBIGNvbnRleHQgbWVudSBjYW4gYmUgdHJpZ2dlcmVkIHZpYSBhIG1vdXNlIHJpZ2h0IGNsaWNrIG9yIGEga2V5Ym9hcmQgc2hvcnRjdXQuXG4gICAgICBpZiAoZXZlbnQuYnV0dG9uID09PSAyKSB7XG4gICAgICAgIHRoaXMuX21lbnVQYW5lbC5fbWVudT8uZm9jdXNGaXJzdEl0ZW0oJ21vdXNlJyk7XG4gICAgICB9IGVsc2UgaWYgKGV2ZW50LmJ1dHRvbiA9PT0gMCkge1xuICAgICAgICB0aGlzLl9tZW51UGFuZWwuX21lbnU/LmZvY3VzRmlyc3RJdGVtKCdrZXlib2FyZCcpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fbWVudVBhbmVsLl9tZW51Py5mb2N1c0ZpcnN0SXRlbSgncHJvZ3JhbScpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoZSBhdHRhY2hlZCBtZW51IGlzIG9wZW4uICovXG4gIGlzT3BlbigpIHtcbiAgICByZXR1cm4gISF0aGlzLl9vdmVybGF5UmVmPy5oYXNBdHRhY2hlZCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgY29uZmlndXJhdGlvbiBvYmplY3QgdXNlZCB0byBjcmVhdGUgdGhlIG92ZXJsYXkuXG4gICAqIEBwYXJhbSBjb29yZGluYXRlcyB0aGUgbG9jYXRpb24gdG8gcGxhY2UgdGhlIG9wZW5lZCBtZW51XG4gICAqL1xuICBwcml2YXRlIF9nZXRPdmVybGF5Q29uZmlnKGNvb3JkaW5hdGVzOiBDb250ZXh0TWVudUNvb3JkaW5hdGVzKSB7XG4gICAgcmV0dXJuIG5ldyBPdmVybGF5Q29uZmlnKHtcbiAgICAgIHBvc2l0aW9uU3RyYXRlZ3k6IHRoaXMuX2dldE92ZXJsYXlQb3NpdGlvblN0cmF0ZWd5KGNvb3JkaW5hdGVzKSxcbiAgICAgIHNjcm9sbFN0cmF0ZWd5OiB0aGlzLl9vdmVybGF5LnNjcm9sbFN0cmF0ZWdpZXMuYmxvY2soKSxcbiAgICAgIGRpcmVjdGlvbjogdGhpcy5fZGlyZWN0aW9uYWxpdHksXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQnVpbGQgdGhlIHBvc2l0aW9uIHN0cmF0ZWd5IGZvciB0aGUgb3ZlcmxheSB3aGljaCBzcGVjaWZpZXMgd2hlcmUgdG8gcGxhY2UgdGhlIG1lbnUuXG4gICAqIEBwYXJhbSBjb29yZGluYXRlcyB0aGUgbG9jYXRpb24gdG8gcGxhY2UgdGhlIG9wZW5lZCBtZW51XG4gICAqL1xuICBwcml2YXRlIF9nZXRPdmVybGF5UG9zaXRpb25TdHJhdGVneShcbiAgICBjb29yZGluYXRlczogQ29udGV4dE1lbnVDb29yZGluYXRlc1xuICApOiBGbGV4aWJsZUNvbm5lY3RlZFBvc2l0aW9uU3RyYXRlZ3kge1xuICAgIHJldHVybiB0aGlzLl9vdmVybGF5XG4gICAgICAucG9zaXRpb24oKVxuICAgICAgLmZsZXhpYmxlQ29ubmVjdGVkVG8oY29vcmRpbmF0ZXMpXG4gICAgICAud2l0aERlZmF1bHRPZmZzZXRYKHRoaXMuX29wdGlvbnMub2Zmc2V0WClcbiAgICAgIC53aXRoRGVmYXVsdE9mZnNldFkodGhpcy5fb3B0aW9ucy5vZmZzZXRZKVxuICAgICAgLndpdGhQb3NpdGlvbnModGhpcy5fZ2V0T3ZlcmxheVBvc2l0aW9ucygpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXRlcm1pbmUgYW5kIHJldHVybiB3aGVyZSB0byBwb3NpdGlvbiB0aGUgb3BlbmVkIG1lbnUgcmVsYXRpdmUgdG8gdGhlIG1vdXNlIGxvY2F0aW9uLlxuICAgKi9cbiAgcHJpdmF0ZSBfZ2V0T3ZlcmxheVBvc2l0aW9ucygpOiBDb25uZWN0ZWRQb3NpdGlvbltdIHtcbiAgICAvLyBUT0RPOiB0aGlzIHNob3VsZCBiZSBjb25maWd1cmFibGUgdGhyb3VnaCB0aGUgaW5qZWN0ZWQgY29udGV4dCBtZW51IG9wdGlvbnNcbiAgICByZXR1cm4gW1xuICAgICAge29yaWdpblg6ICdlbmQnLCBvcmlnaW5ZOiAndG9wJywgb3ZlcmxheVg6ICdzdGFydCcsIG92ZXJsYXlZOiAndG9wJ30sXG4gICAgICB7b3JpZ2luWDogJ3N0YXJ0Jywgb3JpZ2luWTogJ3RvcCcsIG92ZXJsYXlYOiAnZW5kJywgb3ZlcmxheVk6ICd0b3AnfSxcbiAgICAgIHtvcmlnaW5YOiAnZW5kJywgb3JpZ2luWTogJ2JvdHRvbScsIG92ZXJsYXlYOiAnc3RhcnQnLCBvdmVybGF5WTogJ2JvdHRvbSd9LFxuICAgICAge29yaWdpblg6ICdzdGFydCcsIG9yaWdpblk6ICdib3R0b20nLCBvdmVybGF5WDogJ2VuZCcsIG92ZXJsYXlZOiAnYm90dG9tJ30sXG4gICAgXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIHBvcnRhbCB0byBiZSBhdHRhY2hlZCB0byB0aGUgb3ZlcmxheSB3aGljaCBjb250YWlucyB0aGUgbWVudS4gQWxsb3dzIGZvciB0aGUgbWVudVxuICAgKiBjb250ZW50IHRvIGNoYW5nZSBkeW5hbWljYWxseSBhbmQgYmUgcmVmbGVjdGVkIGluIHRoZSBhcHBsaWNhdGlvbi5cbiAgICovXG4gIHByaXZhdGUgX2dldE1lbnVDb250ZW50KCk6IFBvcnRhbDx1bmtub3duPiB7XG4gICAgY29uc3QgaGFzTWVudUNvbnRlbnRDaGFuZ2VkID0gdGhpcy5tZW51UGFuZWwuX3RlbXBsYXRlUmVmICE9PSB0aGlzLl9wYW5lbENvbnRlbnQ/LnRlbXBsYXRlUmVmO1xuICAgIGlmICh0aGlzLm1lbnVQYW5lbCAmJiAoIXRoaXMuX3BhbmVsQ29udGVudCB8fCBoYXNNZW51Q29udGVudENoYW5nZWQpKSB7XG4gICAgICB0aGlzLl9wYW5lbENvbnRlbnQgPSBuZXcgVGVtcGxhdGVQb3J0YWwodGhpcy5tZW51UGFuZWwuX3RlbXBsYXRlUmVmLCB0aGlzLl92aWV3Q29udGFpbmVyUmVmKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fcGFuZWxDb250ZW50O1xuICB9XG5cbiAgLyoqIFN1YnNjcmliZSB0byB0aGUgbWVudSBzdGFjayBjbG9zZSBldmVudHMgYW5kIGNsb3NlIHRoaXMgbWVudSB3aGVuIHJlcXVlc3RlZC4gKi9cbiAgcHJpdmF0ZSBfc2V0TWVudVN0YWNrTGlzdGVuZXIoKSB7XG4gICAgdGhpcy5fbWVudVN0YWNrLmNsb3NlZC5waXBlKHRha2VVbnRpbCh0aGlzLl9kZXN0cm95ZWQpKS5zdWJzY3JpYmUoKGl0ZW06IE1lbnVTdGFja0l0ZW0pID0+IHtcbiAgICAgIGlmIChpdGVtID09PSB0aGlzLl9tZW51UGFuZWwuX21lbnUgJiYgdGhpcy5pc09wZW4oKSkge1xuICAgICAgICB0aGlzLmNsb3NlZC5uZXh0KCk7XG4gICAgICAgIHRoaXMuX292ZXJsYXlSZWYhLmRldGFjaCgpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFN1YnNjcmliZSB0byB0aGUgb3ZlcmxheXMgb3V0c2lkZSBwb2ludGVyIGV2ZW50cyBzdHJlYW0gYW5kIGhhbmRsZSBjbG9zaW5nIG91dCB0aGUgc3RhY2sgaWYgYVxuICAgKiBjbGljayBvY2N1cnMgb3V0c2lkZSB0aGUgbWVudXMuXG4gICAqL1xuICBwcml2YXRlIF9zdWJzY3JpYmVUb091dHNpZGVDbGlja3MoKSB7XG4gICAgaWYgKHRoaXMuX292ZXJsYXlSZWYpIHtcbiAgICAgIHRoaXMuX292ZXJsYXlSZWZcbiAgICAgICAgLm91dHNpZGVQb2ludGVyRXZlbnRzKClcbiAgICAgICAgLnBpcGUodGFrZVVudGlsKHRoaXMuX3N0b3BPdXRzaWRlQ2xpY2tzTGlzdGVuZXIpKVxuICAgICAgICAuc3Vic2NyaWJlKGV2ZW50ID0+IHtcbiAgICAgICAgICBpZiAoIWlzQ2xpY2tJbnNpZGVNZW51T3ZlcmxheShldmVudC50YXJnZXQgYXMgRWxlbWVudCkpIHtcbiAgICAgICAgICAgIHRoaXMuX21lbnVTdGFjay5jbG9zZUFsbCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgdGhpcy5fZGVzdHJveU92ZXJsYXkoKTtcbiAgICB0aGlzLl9yZXNldFBhbmVsTWVudVN0YWNrKCk7XG5cbiAgICB0aGlzLl9kZXN0cm95ZWQubmV4dCgpO1xuICAgIHRoaXMuX2Rlc3Ryb3llZC5jb21wbGV0ZSgpO1xuICB9XG5cbiAgLyoqIERlc3Ryb3kgYW5kIHVuc2V0IHRoZSBvdmVybGF5IHJlZmVyZW5jZSBpdCBpZiBleGlzdHMuICovXG4gIHByaXZhdGUgX2Rlc3Ryb3lPdmVybGF5KCkge1xuICAgIGlmICh0aGlzLl9vdmVybGF5UmVmKSB7XG4gICAgICB0aGlzLl9vdmVybGF5UmVmLmRpc3Bvc2UoKTtcbiAgICAgIHRoaXMuX292ZXJsYXlSZWYgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBTZXQgdGhlIG1lbnUgcGFuZWxzIG1lbnUgc3RhY2sgYmFjayB0byBudWxsLiAqL1xuICBwcml2YXRlIF9yZXNldFBhbmVsTWVudVN0YWNrKCkge1xuICAgIC8vIElmIGEgQ29udGV4dE1lbnVUcmlnZ2VyIGlzIHBsYWNlZCBpbiBhIGNvbmRpdGlvbmFsbHkgcmVuZGVyZWQgdmlldywgZWFjaCB0aW1lIHRoZSB0cmlnZ2VyIGlzXG4gICAgLy8gcmVuZGVyZWQgdGhlIHBhbmVsIHNldHRlciBmb3IgQ29udGV4dE1lbnVUcmlnZ2VyIGlzIGNhbGxlZC4gRnJvbSB0aGUgZmlyc3QgcmVuZGVyIG9ud2FyZCxcbiAgICAvLyB0aGUgYXR0YWNoZWQgQ2RrTWVudVBhbmVsIGhhcyB0aGUgTWVudVN0YWNrIHNldC4gU2luY2Ugd2UgdGhyb3cgYW4gZXJyb3IgaWYgYSBwYW5lbCBhbHJlYWR5XG4gICAgLy8gaGFzIGEgc3RhY2sgc2V0LCB3ZSB3YW50IHRvIHJlc2V0IHRoZSBhdHRhY2hlZCBzdGFjayBoZXJlIHRvIHByZXZlbnQgdGhlIGVycm9yIGZyb20gYmVpbmdcbiAgICAvLyB0aHJvd24gaWYgdGhlIHRyaWdnZXIgcmUtY29uZmlndXJlcyBpdHMgYXR0YWNoZWQgcGFuZWwgKGluIHRoZSBjYXNlIHdoZXJlIHRoZXJlIGlzIGEgMToxXG4gICAgLy8gcmVsYXRpb25zaGlwIGJldHdlZW4gdGhlIHBhbmVsIGFuZCB0cmlnZ2VyKS5cbiAgICBpZiAodGhpcy5fbWVudVBhbmVsKSB7XG4gICAgICB0aGlzLl9tZW51UGFuZWwuX21lbnVTdGFjayA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2Rpc2FibGVkOiBCb29sZWFuSW5wdXQ7XG59XG4iXX0=