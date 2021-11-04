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
import * as i1 from "@angular/cdk/overlay";
import * as i2 from "@angular/cdk/bidi";
/** Tracks the last open context menu trigger across the entire application. */
export class ContextMenuTracker {
    /**
     * Close the previous open context menu and set the given one as being open.
     * @param trigger the trigger for the currently open Context Menu.
     */
    update(trigger) {
        if (ContextMenuTracker._openContextMenuTrigger !== trigger) {
            ContextMenuTracker._openContextMenuTrigger?.close();
            ContextMenuTracker._openContextMenuTrigger = trigger;
        }
    }
}
ContextMenuTracker.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.0", ngImport: i0, type: ContextMenuTracker, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
ContextMenuTracker.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.0", ngImport: i0, type: ContextMenuTracker, providedIn: 'root' });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.0", ngImport: i0, type: ContextMenuTracker, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });
/** Injection token for the ContextMenu options object. */
export const CDK_CONTEXT_MENU_DEFAULT_OPTIONS = new InjectionToken('cdk-context-menu-default-options');
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
            this._overlayRef.getConfig().positionStrategy.setOrigin(coordinates);
            this._overlayRef.updatePosition();
        }
        else {
            this.opened.next();
            if (this._overlayRef) {
                this._overlayRef.getConfig().positionStrategy.setOrigin(coordinates);
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
                this._menuPanel._menu?.focusFirstItem('mouse');
            }
            else if (event.button === 0) {
                this._menuPanel._menu?.focusFirstItem('keyboard');
            }
            else {
                this._menuPanel._menu?.focusFirstItem('program');
            }
        }
    }
    /** Whether the attached menu is open. */
    isOpen() {
        return !!this._overlayRef?.hasAttached();
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
        const hasMenuContentChanged = this.menuPanel._templateRef !== this._panelContent?.templateRef;
        if (this.menuPanel && (!this._panelContent || hasMenuContentChanged)) {
            this._panelContent = new TemplatePortal(this.menuPanel._templateRef, this._viewContainerRef);
        }
        return this._panelContent;
    }
    /** Subscribe to the menu stack close events and close this menu when requested. */
    _setMenuStackListener() {
        this._menuStack.closed.pipe(takeUntil(this._destroyed)).subscribe(item => {
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
CdkContextMenuTrigger.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.0", ngImport: i0, type: CdkContextMenuTrigger, deps: [{ token: i0.ViewContainerRef }, { token: i1.Overlay }, { token: ContextMenuTracker }, { token: CDK_CONTEXT_MENU_DEFAULT_OPTIONS }, { token: i2.Directionality, optional: true }], target: i0.ɵɵFactoryTarget.Directive });
CdkContextMenuTrigger.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "13.0.0", type: CdkContextMenuTrigger, selector: "[cdkContextMenuTriggerFor]", inputs: { menuPanel: ["cdkContextMenuTriggerFor", "menuPanel"], disabled: ["cdkContextMenuDisabled", "disabled"] }, outputs: { opened: "cdkContextMenuOpened", closed: "cdkContextMenuClosed" }, host: { listeners: { "contextmenu": "_openOnContextMenu($event)" } }, providers: [
        // In cases where the first menu item in the context menu is a trigger the submenu opens on a
        // hover event. Offsetting the opened context menu by 2px prevents this from occurring.
        { provide: CDK_CONTEXT_MENU_DEFAULT_OPTIONS, useValue: { offsetX: 2, offsetY: 2 } },
    ], exportAs: ["cdkContextMenuTriggerFor"], ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.0", ngImport: i0, type: CdkContextMenuTrigger, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkContextMenuTriggerFor]',
                    exportAs: 'cdkContextMenuTriggerFor',
                    host: {
                        '(contextmenu)': '_openOnContextMenu($event)',
                    },
                    providers: [
                        // In cases where the first menu item in the context menu is a trigger the submenu opens on a
                        // hover event. Offsetting the opened context menu by 2px prevents this from occurring.
                        { provide: CDK_CONTEXT_MENU_DEFAULT_OPTIONS, useValue: { offsetX: 2, offsetY: 2 } },
                    ],
                }]
        }], ctorParameters: function () { return [{ type: i0.ViewContainerRef }, { type: i1.Overlay }, { type: ContextMenuTracker }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [CDK_CONTEXT_MENU_DEFAULT_OPTIONS]
                }] }, { type: i2.Directionality, decorators: [{
                    type: Optional
                }] }]; }, propDecorators: { menuPanel: [{
                type: Input,
                args: ['cdkContextMenuTriggerFor']
            }], opened: [{
                type: Output,
                args: ['cdkContextMenuOpened']
            }], closed: [{
                type: Output,
                args: ['cdkContextMenuClosed']
            }], disabled: [{
                type: Input,
                args: ['cdkContextMenuDisabled']
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGV4dC1tZW51LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvbWVudS9jb250ZXh0LW1lbnUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUNMLFNBQVMsRUFDVCxLQUFLLEVBQ0wsZ0JBQWdCLEVBQ2hCLE1BQU0sRUFDTixZQUFZLEVBQ1osUUFBUSxFQUVSLE1BQU0sRUFDTixVQUFVLEVBQ1YsY0FBYyxHQUNmLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUNqRCxPQUFPLEVBRUwsT0FBTyxFQUNQLGFBQWEsR0FHZCxNQUFNLHNCQUFzQixDQUFDO0FBQzlCLE9BQU8sRUFBQyxjQUFjLEVBQVMsTUFBTSxxQkFBcUIsQ0FBQztBQUMzRCxPQUFPLEVBQUMscUJBQXFCLEVBQWUsTUFBTSx1QkFBdUIsQ0FBQztBQUMxRSxPQUFPLEVBQUMsT0FBTyxFQUFFLEtBQUssRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUNwQyxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDekMsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGNBQWMsQ0FBQztBQUMxQyxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sY0FBYyxDQUFDO0FBQ3ZDLE9BQU8sRUFBQywyQkFBMkIsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUMxRCxPQUFPLEVBQUMsd0JBQXdCLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQzs7OztBQUU3RCwrRUFBK0U7QUFFL0UsTUFBTSxPQUFPLGtCQUFrQjtJQUk3Qjs7O09BR0c7SUFDSCxNQUFNLENBQUMsT0FBOEI7UUFDbkMsSUFBSSxrQkFBa0IsQ0FBQyx1QkFBdUIsS0FBSyxPQUFPLEVBQUU7WUFDMUQsa0JBQWtCLENBQUMsdUJBQXVCLEVBQUUsS0FBSyxFQUFFLENBQUM7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Q0FBZ0M7c0dBdEQvQixxQkFBcUIsNFRBTnJCO1FBQ1QsNkZBQTZGO1FBQzdGLHVGQUF1RjtRQUN2RixFQUFDLE9BQU8sRUFBRSxnQ0FBZ0MsRUFBRSxRQUFRLEVBQUUsRUFBQyxPQUFPLEVBQUUsQ0FBQyxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUMsRUFBQztLQUNoRjsyRkFFVSxxQkFBcUI7a0JBWmpDLFNBQVM7bUJBQUM7b0JBQ1QsUUFBUSxFQUFFLDRCQUE0QjtvQkFDdEMsUUFBUSxFQUFFLDBCQUEwQjtvQkFDcEMsSUFBSSxFQUFFO3dCQUNKLGVBQWUsRUFBRSw0QkFBNEI7cUJBQzlDO29CQUNELFNBQVMsRUFBRTt3QkFDVCw2RkFBNkY7d0JBQzdGLHVGQUF1Rjt3QkFDdkYsRUFBQyxPQUFPLEVBQUUsZ0NBQWdDLEVBQUUsUUFBUSxFQUFFLEVBQUMsT0FBTyxFQUFFLENBQUMsRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFDLEVBQUM7cUJBQ2hGO2lCQUNGOytHQXNEeUMsa0JBQWtCOzBCQUN2RCxNQUFNOzJCQUFDLGdDQUFnQzs7MEJBQ3ZDLFFBQVE7NENBcERQLFNBQVM7c0JBRFosS0FBSzt1QkFBQywwQkFBMEI7Z0JBa0JRLE1BQU07c0JBQTlDLE1BQU07dUJBQUMsc0JBQXNCO2dCQUdXLE1BQU07c0JBQTlDLE1BQU07dUJBQUMsc0JBQXNCO2dCQUkxQixRQUFRO3NCQURYLEtBQUs7dUJBQUMsd0JBQXdCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7XG4gIERpcmVjdGl2ZSxcbiAgSW5wdXQsXG4gIFZpZXdDb250YWluZXJSZWYsXG4gIE91dHB1dCxcbiAgRXZlbnRFbWl0dGVyLFxuICBPcHRpb25hbCxcbiAgT25EZXN0cm95LFxuICBJbmplY3QsXG4gIEluamVjdGFibGUsXG4gIEluamVjdGlvblRva2VuLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7RGlyZWN0aW9uYWxpdHl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9iaWRpJztcbmltcG9ydCB7XG4gIE92ZXJsYXlSZWYsXG4gIE92ZXJsYXksXG4gIE92ZXJsYXlDb25maWcsXG4gIEZsZXhpYmxlQ29ubmVjdGVkUG9zaXRpb25TdHJhdGVneSxcbiAgQ29ubmVjdGVkUG9zaXRpb24sXG59IGZyb20gJ0Bhbmd1bGFyL2Nkay9vdmVybGF5JztcbmltcG9ydCB7VGVtcGxhdGVQb3J0YWwsIFBvcnRhbH0gZnJvbSAnQGFuZ3VsYXIvY2RrL3BvcnRhbCc7XG5pbXBvcnQge2NvZXJjZUJvb2xlYW5Qcm9wZXJ0eSwgQm9vbGVhbklucHV0fSBmcm9tICdAYW5ndWxhci9jZGsvY29lcmNpb24nO1xuaW1wb3J0IHtTdWJqZWN0LCBtZXJnZX0gZnJvbSAncnhqcyc7XG5pbXBvcnQge3Rha2VVbnRpbH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuaW1wb3J0IHtDZGtNZW51UGFuZWx9IGZyb20gJy4vbWVudS1wYW5lbCc7XG5pbXBvcnQge01lbnVTdGFja30gZnJvbSAnLi9tZW51LXN0YWNrJztcbmltcG9ydCB7dGhyb3dFeGlzdGluZ01lbnVTdGFja0Vycm9yfSBmcm9tICcuL21lbnUtZXJyb3JzJztcbmltcG9ydCB7aXNDbGlja0luc2lkZU1lbnVPdmVybGF5fSBmcm9tICcuL21lbnUtaXRlbS10cmlnZ2VyJztcblxuLyoqIFRyYWNrcyB0aGUgbGFzdCBvcGVuIGNvbnRleHQgbWVudSB0cmlnZ2VyIGFjcm9zcyB0aGUgZW50aXJlIGFwcGxpY2F0aW9uLiAqL1xuQEluamVjdGFibGUoe3Byb3ZpZGVkSW46ICdyb290J30pXG5leHBvcnQgY2xhc3MgQ29udGV4dE1lbnVUcmFja2VyIHtcbiAgLyoqIFRoZSBsYXN0IG9wZW4gY29udGV4dCBtZW51IHRyaWdnZXIuICovXG4gIHByaXZhdGUgc3RhdGljIF9vcGVuQ29udGV4dE1lbnVUcmlnZ2VyPzogQ2RrQ29udGV4dE1lbnVUcmlnZ2VyO1xuXG4gIC8qKlxuICAgKiBDbG9zZSB0aGUgcHJldmlvdXMgb3BlbiBjb250ZXh0IG1lbnUgYW5kIHNldCB0aGUgZ2l2ZW4gb25lIGFzIGJlaW5nIG9wZW4uXG4gICAqIEBwYXJhbSB0cmlnZ2VyIHRoZSB0cmlnZ2VyIGZvciB0aGUgY3VycmVudGx5IG9wZW4gQ29udGV4dCBNZW51LlxuICAgKi9cbiAgdXBkYXRlKHRyaWdnZXI6IENka0NvbnRleHRNZW51VHJpZ2dlcikge1xuICAgIGlmIChDb250ZXh0TWVudVRyYWNrZXIuX29wZW5Db250ZXh0TWVudVRyaWdnZXIgIT09IHRyaWdnZXIpIHtcbiAgICAgIENvbnRleHRNZW51VHJhY2tlci5fb3BlbkNvbnRleHRNZW51VHJpZ2dlcj8uY2xvc2UoKTtcbiAgICAgIENvbnRleHRNZW51VHJhY2tlci5fb3BlbkNvbnRleHRNZW51VHJpZ2dlciA9IHRyaWdnZXI7XG4gICAgfVxuICB9XG59XG5cbi8qKiBDb25maWd1cmF0aW9uIG9wdGlvbnMgcGFzc2VkIHRvIHRoZSBjb250ZXh0IG1lbnUuICovXG5leHBvcnQgdHlwZSBDb250ZXh0TWVudU9wdGlvbnMgPSB7XG4gIC8qKiBUaGUgb3BlbmVkIG1lbnVzIFggY29vcmRpbmF0ZSBvZmZzZXQgZnJvbSB0aGUgdHJpZ2dlcmluZyBwb3NpdGlvbi4gKi9cbiAgb2Zmc2V0WDogbnVtYmVyO1xuXG4gIC8qKiBUaGUgb3BlbmVkIG1lbnVzIFkgY29vcmRpbmF0ZSBvZmZzZXQgZnJvbSB0aGUgdHJpZ2dlcmluZyBwb3NpdGlvbi4gKi9cbiAgb2Zmc2V0WTogbnVtYmVyO1xufTtcblxuLyoqIEluamVjdGlvbiB0b2tlbiBmb3IgdGhlIENvbnRleHRNZW51IG9wdGlvbnMgb2JqZWN0LiAqL1xuZXhwb3J0IGNvbnN0IENES19DT05URVhUX01FTlVfREVGQVVMVF9PUFRJT05TID0gbmV3IEluamVjdGlvblRva2VuPENvbnRleHRNZW51T3B0aW9ucz4oXG4gICdjZGstY29udGV4dC1tZW51LWRlZmF1bHQtb3B0aW9ucycsXG4pO1xuXG4vKiogVGhlIGNvb3JkaW5hdGVzIG9mIHdoZXJlIHRoZSBjb250ZXh0IG1lbnUgc2hvdWxkIG9wZW4uICovXG5leHBvcnQgdHlwZSBDb250ZXh0TWVudUNvb3JkaW5hdGVzID0ge3g6IG51bWJlcjsgeTogbnVtYmVyfTtcblxuLyoqXG4gKiBBIGRpcmVjdGl2ZSB3aGljaCB3aGVuIHBsYWNlZCBvbiBzb21lIGVsZW1lbnQgb3BlbnMgYSB0aGUgTWVudSBpdCBpcyBib3VuZCB0byB3aGVuIGEgdXNlclxuICogcmlnaHQtY2xpY2tzIHdpdGhpbiB0aGF0IGVsZW1lbnQuIEl0IGlzIGF3YXJlIG9mIG5lc3RlZCBDb250ZXh0IE1lbnVzIGFuZCB0aGUgbG93ZXN0IGxldmVsXG4gKiBub24tZGlzYWJsZWQgY29udGV4dCBtZW51IHdpbGwgdHJpZ2dlci5cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW2Nka0NvbnRleHRNZW51VHJpZ2dlckZvcl0nLFxuICBleHBvcnRBczogJ2Nka0NvbnRleHRNZW51VHJpZ2dlckZvcicsXG4gIGhvc3Q6IHtcbiAgICAnKGNvbnRleHRtZW51KSc6ICdfb3Blbk9uQ29udGV4dE1lbnUoJGV2ZW50KScsXG4gIH0sXG4gIHByb3ZpZGVyczogW1xuICAgIC8vIEluIGNhc2VzIHdoZXJlIHRoZSBmaXJzdCBtZW51IGl0ZW0gaW4gdGhlIGNvbnRleHQgbWVudSBpcyBhIHRyaWdnZXIgdGhlIHN1Ym1lbnUgb3BlbnMgb24gYVxuICAgIC8vIGhvdmVyIGV2ZW50LiBPZmZzZXR0aW5nIHRoZSBvcGVuZWQgY29udGV4dCBtZW51IGJ5IDJweCBwcmV2ZW50cyB0aGlzIGZyb20gb2NjdXJyaW5nLlxuICAgIHtwcm92aWRlOiBDREtfQ09OVEVYVF9NRU5VX0RFRkFVTFRfT1BUSU9OUywgdXNlVmFsdWU6IHtvZmZzZXRYOiAyLCBvZmZzZXRZOiAyfX0sXG4gIF0sXG59KVxuZXhwb3J0IGNsYXNzIENka0NvbnRleHRNZW51VHJpZ2dlciBpbXBsZW1lbnRzIE9uRGVzdHJveSB7XG4gIC8qKiBUZW1wbGF0ZSByZWZlcmVuY2UgdmFyaWFibGUgdG8gdGhlIG1lbnUgdG8gb3BlbiBvbiByaWdodCBjbGljay4gKi9cbiAgQElucHV0KCdjZGtDb250ZXh0TWVudVRyaWdnZXJGb3InKVxuICBnZXQgbWVudVBhbmVsKCk6IENka01lbnVQYW5lbCB7XG4gICAgcmV0dXJuIHRoaXMuX21lbnVQYW5lbDtcbiAgfVxuICBzZXQgbWVudVBhbmVsKHBhbmVsOiBDZGtNZW51UGFuZWwpIHtcbiAgICBpZiAoKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkgJiYgcGFuZWwuX21lbnVTdGFjaykge1xuICAgICAgdGhyb3dFeGlzdGluZ01lbnVTdGFja0Vycm9yKCk7XG4gICAgfVxuICAgIHRoaXMuX21lbnVQYW5lbCA9IHBhbmVsO1xuXG4gICAgaWYgKHRoaXMuX21lbnVQYW5lbCkge1xuICAgICAgdGhpcy5fbWVudVBhbmVsLl9tZW51U3RhY2sgPSB0aGlzLl9tZW51U3RhY2s7XG4gICAgfVxuICB9XG4gIC8qKiBSZWZlcmVuY2UgdG8gdGhlIE1lbnVQYW5lbCB0aGlzIHRyaWdnZXIgdG9nZ2xlcy4gKi9cbiAgcHJpdmF0ZSBfbWVudVBhbmVsOiBDZGtNZW51UGFuZWw7XG5cbiAgLyoqIEVtaXRzIHdoZW4gdGhlIGF0dGFjaGVkIG1lbnUgaXMgcmVxdWVzdGVkIHRvIG9wZW4uICovXG4gIEBPdXRwdXQoJ2Nka0NvbnRleHRNZW51T3BlbmVkJykgcmVhZG9ubHkgb3BlbmVkOiBFdmVudEVtaXR0ZXI8dm9pZD4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG5cbiAgLyoqIEVtaXRzIHdoZW4gdGhlIGF0dGFjaGVkIG1lbnUgaXMgcmVxdWVzdGVkIHRvIGNsb3NlLiAqL1xuICBAT3V0cHV0KCdjZGtDb250ZXh0TWVudUNsb3NlZCcpIHJlYWRvbmx5IGNsb3NlZDogRXZlbnRFbWl0dGVyPHZvaWQ+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSBjb250ZXh0IG1lbnUgc2hvdWxkIGJlIGRpc2FibGVkLiAqL1xuICBASW5wdXQoJ2Nka0NvbnRleHRNZW51RGlzYWJsZWQnKVxuICBnZXQgZGlzYWJsZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2Rpc2FibGVkO1xuICB9XG4gIHNldCBkaXNhYmxlZCh2YWx1ZTogYm9vbGVhbikge1xuICAgIHRoaXMuX2Rpc2FibGVkID0gY29lcmNlQm9vbGVhblByb3BlcnR5KHZhbHVlKTtcbiAgfVxuICBwcml2YXRlIF9kaXNhYmxlZCA9IGZhbHNlO1xuXG4gIC8qKiBBIHJlZmVyZW5jZSB0byB0aGUgb3ZlcmxheSB3aGljaCBtYW5hZ2VzIHRoZSB0cmlnZ2VyZWQgbWVudS4gKi9cbiAgcHJpdmF0ZSBfb3ZlcmxheVJlZjogT3ZlcmxheVJlZiB8IG51bGwgPSBudWxsO1xuXG4gIC8qKiBUaGUgY29udGVudCBvZiB0aGUgbWVudSBwYW5lbCBvcGVuZWQgYnkgdGhpcyB0cmlnZ2VyLiAqL1xuICBwcml2YXRlIF9wYW5lbENvbnRlbnQ6IFRlbXBsYXRlUG9ydGFsO1xuXG4gIC8qKiBFbWl0cyB3aGVuIHRoZSBlbGVtZW50IGlzIGRlc3Ryb3llZC4gKi9cbiAgcHJpdmF0ZSByZWFkb25seSBfZGVzdHJveWVkID0gbmV3IFN1YmplY3Q8dm9pZD4oKTtcblxuICAvKiogVGhlIG1lbnUgc3RhY2sgZm9yIHRoaXMgdHJpZ2dlciBhbmQgaXRzIGFzc29jaWF0ZWQgbWVudXMuICovXG4gIHByaXZhdGUgcmVhZG9ubHkgX21lbnVTdGFjayA9IG5ldyBNZW51U3RhY2soKTtcblxuICAvKiogRW1pdHMgd2hlbiB0aGUgb3V0c2lkZSBwb2ludGVyIGV2ZW50cyBsaXN0ZW5lciBvbiB0aGUgb3ZlcmxheSBzaG91bGQgYmUgc3RvcHBlZC4gKi9cbiAgcHJpdmF0ZSByZWFkb25seSBfc3RvcE91dHNpZGVDbGlja3NMaXN0ZW5lciA9IG1lcmdlKHRoaXMuY2xvc2VkLCB0aGlzLl9kZXN0cm95ZWQpO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByb3RlY3RlZCByZWFkb25seSBfdmlld0NvbnRhaW5lclJlZjogVmlld0NvbnRhaW5lclJlZixcbiAgICBwcml2YXRlIHJlYWRvbmx5IF9vdmVybGF5OiBPdmVybGF5LFxuICAgIHByaXZhdGUgcmVhZG9ubHkgX2NvbnRleHRNZW51VHJhY2tlcjogQ29udGV4dE1lbnVUcmFja2VyLFxuICAgIEBJbmplY3QoQ0RLX0NPTlRFWFRfTUVOVV9ERUZBVUxUX09QVElPTlMpIHByaXZhdGUgcmVhZG9ubHkgX29wdGlvbnM6IENvbnRleHRNZW51T3B0aW9ucyxcbiAgICBAT3B0aW9uYWwoKSBwcml2YXRlIHJlYWRvbmx5IF9kaXJlY3Rpb25hbGl0eT86IERpcmVjdGlvbmFsaXR5LFxuICApIHtcbiAgICB0aGlzLl9zZXRNZW51U3RhY2tMaXN0ZW5lcigpO1xuICB9XG5cbiAgLyoqXG4gICAqIE9wZW4gdGhlIGF0dGFjaGVkIG1lbnUgYXQgdGhlIHNwZWNpZmllZCBsb2NhdGlvbi5cbiAgICogQHBhcmFtIGNvb3JkaW5hdGVzIHdoZXJlIHRvIG9wZW4gdGhlIGNvbnRleHQgbWVudVxuICAgKi9cbiAgb3Blbihjb29yZGluYXRlczogQ29udGV4dE1lbnVDb29yZGluYXRlcykge1xuICAgIGlmICh0aGlzLmRpc2FibGVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfSBlbHNlIGlmICh0aGlzLmlzT3BlbigpKSB7XG4gICAgICAvLyBzaW5jZSB3ZSdyZSBtb3ZpbmcgdGhpcyBtZW51IHdlIG5lZWQgdG8gY2xvc2UgYW55IHN1Ym1lbnVzIGZpcnN0IG90aGVyd2lzZSB0aGV5IGVuZCB1cFxuICAgICAgLy8gZGlzY29ubmVjdGVkIGZyb20gdGhpcyBvbmUuXG4gICAgICB0aGlzLl9tZW51U3RhY2suY2xvc2VTdWJNZW51T2YodGhpcy5fbWVudVBhbmVsLl9tZW51ISk7XG5cbiAgICAgIChcbiAgICAgICAgdGhpcy5fb3ZlcmxheVJlZiEuZ2V0Q29uZmlnKCkucG9zaXRpb25TdHJhdGVneSBhcyBGbGV4aWJsZUNvbm5lY3RlZFBvc2l0aW9uU3RyYXRlZ3lcbiAgICAgICkuc2V0T3JpZ2luKGNvb3JkaW5hdGVzKTtcbiAgICAgIHRoaXMuX292ZXJsYXlSZWYhLnVwZGF0ZVBvc2l0aW9uKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMub3BlbmVkLm5leHQoKTtcblxuICAgICAgaWYgKHRoaXMuX292ZXJsYXlSZWYpIHtcbiAgICAgICAgKFxuICAgICAgICAgIHRoaXMuX292ZXJsYXlSZWYuZ2V0Q29uZmlnKCkucG9zaXRpb25TdHJhdGVneSBhcyBGbGV4aWJsZUNvbm5lY3RlZFBvc2l0aW9uU3RyYXRlZ3lcbiAgICAgICAgKS5zZXRPcmlnaW4oY29vcmRpbmF0ZXMpO1xuICAgICAgICB0aGlzLl9vdmVybGF5UmVmLnVwZGF0ZVBvc2l0aW9uKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9vdmVybGF5UmVmID0gdGhpcy5fb3ZlcmxheS5jcmVhdGUodGhpcy5fZ2V0T3ZlcmxheUNvbmZpZyhjb29yZGluYXRlcykpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9vdmVybGF5UmVmLmF0dGFjaCh0aGlzLl9nZXRNZW51Q29udGVudCgpKTtcbiAgICAgIHRoaXMuX3N1YnNjcmliZVRvT3V0c2lkZUNsaWNrcygpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBDbG9zZSB0aGUgb3BlbmVkIG1lbnUuICovXG4gIGNsb3NlKCkge1xuICAgIHRoaXMuX21lbnVTdGFjay5jbG9zZUFsbCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIE9wZW4gdGhlIGNvbnRleHQgbWVudSBhbmQgY2xvc2UgYW55IHByZXZpb3VzbHkgb3BlbiBtZW51cy5cbiAgICogQHBhcmFtIGV2ZW50IHRoZSBtb3VzZSBldmVudCB3aGljaCBvcGVucyB0aGUgY29udGV4dCBtZW51LlxuICAgKi9cbiAgX29wZW5PbkNvbnRleHRNZW51KGV2ZW50OiBNb3VzZUV2ZW50KSB7XG4gICAgaWYgKCF0aGlzLmRpc2FibGVkKSB7XG4gICAgICAvLyBQcmV2ZW50IHRoZSBuYXRpdmUgY29udGV4dCBtZW51IGZyb20gb3BlbmluZyBiZWNhdXNlIHdlJ3JlIG9wZW5pbmcgYSBjdXN0b20gb25lLlxuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgLy8gU3RvcCBldmVudCBwcm9wYWdhdGlvbiB0byBlbnN1cmUgdGhhdCBvbmx5IHRoZSBjbG9zZXN0IGVuYWJsZWQgY29udGV4dCBtZW51IG9wZW5zLlxuICAgICAgLy8gT3RoZXJ3aXNlLCBhbnkgY29udGV4dCBtZW51cyBhdHRhY2hlZCB0byBjb250YWluaW5nIGVsZW1lbnRzIHdvdWxkICphbHNvKiBvcGVuLFxuICAgICAgLy8gcmVzdWx0aW5nIGluIG11bHRpcGxlIHN0YWNrZWQgY29udGV4dCBtZW51cyBiZWluZyBkaXNwbGF5ZWQuXG4gICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgICAgdGhpcy5fY29udGV4dE1lbnVUcmFja2VyLnVwZGF0ZSh0aGlzKTtcbiAgICAgIHRoaXMub3Blbih7eDogZXZlbnQuY2xpZW50WCwgeTogZXZlbnQuY2xpZW50WX0pO1xuXG4gICAgICAvLyBBIGNvbnRleHQgbWVudSBjYW4gYmUgdHJpZ2dlcmVkIHZpYSBhIG1vdXNlIHJpZ2h0IGNsaWNrIG9yIGEga2V5Ym9hcmQgc2hvcnRjdXQuXG4gICAgICBpZiAoZXZlbnQuYnV0dG9uID09PSAyKSB7XG4gICAgICAgIHRoaXMuX21lbnVQYW5lbC5fbWVudT8uZm9jdXNGaXJzdEl0ZW0oJ21vdXNlJyk7XG4gICAgICB9IGVsc2UgaWYgKGV2ZW50LmJ1dHRvbiA9PT0gMCkge1xuICAgICAgICB0aGlzLl9tZW51UGFuZWwuX21lbnU/LmZvY3VzRmlyc3RJdGVtKCdrZXlib2FyZCcpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fbWVudVBhbmVsLl9tZW51Py5mb2N1c0ZpcnN0SXRlbSgncHJvZ3JhbScpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoZSBhdHRhY2hlZCBtZW51IGlzIG9wZW4uICovXG4gIGlzT3BlbigpIHtcbiAgICByZXR1cm4gISF0aGlzLl9vdmVybGF5UmVmPy5oYXNBdHRhY2hlZCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgY29uZmlndXJhdGlvbiBvYmplY3QgdXNlZCB0byBjcmVhdGUgdGhlIG92ZXJsYXkuXG4gICAqIEBwYXJhbSBjb29yZGluYXRlcyB0aGUgbG9jYXRpb24gdG8gcGxhY2UgdGhlIG9wZW5lZCBtZW51XG4gICAqL1xuICBwcml2YXRlIF9nZXRPdmVybGF5Q29uZmlnKGNvb3JkaW5hdGVzOiBDb250ZXh0TWVudUNvb3JkaW5hdGVzKSB7XG4gICAgcmV0dXJuIG5ldyBPdmVybGF5Q29uZmlnKHtcbiAgICAgIHBvc2l0aW9uU3RyYXRlZ3k6IHRoaXMuX2dldE92ZXJsYXlQb3NpdGlvblN0cmF0ZWd5KGNvb3JkaW5hdGVzKSxcbiAgICAgIHNjcm9sbFN0cmF0ZWd5OiB0aGlzLl9vdmVybGF5LnNjcm9sbFN0cmF0ZWdpZXMuYmxvY2soKSxcbiAgICAgIGRpcmVjdGlvbjogdGhpcy5fZGlyZWN0aW9uYWxpdHksXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQnVpbGQgdGhlIHBvc2l0aW9uIHN0cmF0ZWd5IGZvciB0aGUgb3ZlcmxheSB3aGljaCBzcGVjaWZpZXMgd2hlcmUgdG8gcGxhY2UgdGhlIG1lbnUuXG4gICAqIEBwYXJhbSBjb29yZGluYXRlcyB0aGUgbG9jYXRpb24gdG8gcGxhY2UgdGhlIG9wZW5lZCBtZW51XG4gICAqL1xuICBwcml2YXRlIF9nZXRPdmVybGF5UG9zaXRpb25TdHJhdGVneShcbiAgICBjb29yZGluYXRlczogQ29udGV4dE1lbnVDb29yZGluYXRlcyxcbiAgKTogRmxleGlibGVDb25uZWN0ZWRQb3NpdGlvblN0cmF0ZWd5IHtcbiAgICByZXR1cm4gdGhpcy5fb3ZlcmxheVxuICAgICAgLnBvc2l0aW9uKClcbiAgICAgIC5mbGV4aWJsZUNvbm5lY3RlZFRvKGNvb3JkaW5hdGVzKVxuICAgICAgLndpdGhEZWZhdWx0T2Zmc2V0WCh0aGlzLl9vcHRpb25zLm9mZnNldFgpXG4gICAgICAud2l0aERlZmF1bHRPZmZzZXRZKHRoaXMuX29wdGlvbnMub2Zmc2V0WSlcbiAgICAgIC53aXRoUG9zaXRpb25zKHRoaXMuX2dldE92ZXJsYXlQb3NpdGlvbnMoKSk7XG4gIH1cblxuICAvKipcbiAgICogRGV0ZXJtaW5lIGFuZCByZXR1cm4gd2hlcmUgdG8gcG9zaXRpb24gdGhlIG9wZW5lZCBtZW51IHJlbGF0aXZlIHRvIHRoZSBtb3VzZSBsb2NhdGlvbi5cbiAgICovXG4gIHByaXZhdGUgX2dldE92ZXJsYXlQb3NpdGlvbnMoKTogQ29ubmVjdGVkUG9zaXRpb25bXSB7XG4gICAgLy8gVE9ETzogdGhpcyBzaG91bGQgYmUgY29uZmlndXJhYmxlIHRocm91Z2ggdGhlIGluamVjdGVkIGNvbnRleHQgbWVudSBvcHRpb25zXG4gICAgcmV0dXJuIFtcbiAgICAgIHtvcmlnaW5YOiAnZW5kJywgb3JpZ2luWTogJ3RvcCcsIG92ZXJsYXlYOiAnc3RhcnQnLCBvdmVybGF5WTogJ3RvcCd9LFxuICAgICAge29yaWdpblg6ICdzdGFydCcsIG9yaWdpblk6ICd0b3AnLCBvdmVybGF5WDogJ2VuZCcsIG92ZXJsYXlZOiAndG9wJ30sXG4gICAgICB7b3JpZ2luWDogJ2VuZCcsIG9yaWdpblk6ICdib3R0b20nLCBvdmVybGF5WDogJ3N0YXJ0Jywgb3ZlcmxheVk6ICdib3R0b20nfSxcbiAgICAgIHtvcmlnaW5YOiAnc3RhcnQnLCBvcmlnaW5ZOiAnYm90dG9tJywgb3ZlcmxheVg6ICdlbmQnLCBvdmVybGF5WTogJ2JvdHRvbSd9LFxuICAgIF07XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBwb3J0YWwgdG8gYmUgYXR0YWNoZWQgdG8gdGhlIG92ZXJsYXkgd2hpY2ggY29udGFpbnMgdGhlIG1lbnUuIEFsbG93cyBmb3IgdGhlIG1lbnVcbiAgICogY29udGVudCB0byBjaGFuZ2UgZHluYW1pY2FsbHkgYW5kIGJlIHJlZmxlY3RlZCBpbiB0aGUgYXBwbGljYXRpb24uXG4gICAqL1xuICBwcml2YXRlIF9nZXRNZW51Q29udGVudCgpOiBQb3J0YWw8dW5rbm93bj4ge1xuICAgIGNvbnN0IGhhc01lbnVDb250ZW50Q2hhbmdlZCA9IHRoaXMubWVudVBhbmVsLl90ZW1wbGF0ZVJlZiAhPT0gdGhpcy5fcGFuZWxDb250ZW50Py50ZW1wbGF0ZVJlZjtcbiAgICBpZiAodGhpcy5tZW51UGFuZWwgJiYgKCF0aGlzLl9wYW5lbENvbnRlbnQgfHwgaGFzTWVudUNvbnRlbnRDaGFuZ2VkKSkge1xuICAgICAgdGhpcy5fcGFuZWxDb250ZW50ID0gbmV3IFRlbXBsYXRlUG9ydGFsKHRoaXMubWVudVBhbmVsLl90ZW1wbGF0ZVJlZiwgdGhpcy5fdmlld0NvbnRhaW5lclJlZik7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX3BhbmVsQ29udGVudDtcbiAgfVxuXG4gIC8qKiBTdWJzY3JpYmUgdG8gdGhlIG1lbnUgc3RhY2sgY2xvc2UgZXZlbnRzIGFuZCBjbG9zZSB0aGlzIG1lbnUgd2hlbiByZXF1ZXN0ZWQuICovXG4gIHByaXZhdGUgX3NldE1lbnVTdGFja0xpc3RlbmVyKCkge1xuICAgIHRoaXMuX21lbnVTdGFjay5jbG9zZWQucGlwZSh0YWtlVW50aWwodGhpcy5fZGVzdHJveWVkKSkuc3Vic2NyaWJlKGl0ZW0gPT4ge1xuICAgICAgaWYgKGl0ZW0gPT09IHRoaXMuX21lbnVQYW5lbC5fbWVudSAmJiB0aGlzLmlzT3BlbigpKSB7XG4gICAgICAgIHRoaXMuY2xvc2VkLm5leHQoKTtcbiAgICAgICAgdGhpcy5fb3ZlcmxheVJlZiEuZGV0YWNoKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogU3Vic2NyaWJlIHRvIHRoZSBvdmVybGF5cyBvdXRzaWRlIHBvaW50ZXIgZXZlbnRzIHN0cmVhbSBhbmQgaGFuZGxlIGNsb3Npbmcgb3V0IHRoZSBzdGFjayBpZiBhXG4gICAqIGNsaWNrIG9jY3VycyBvdXRzaWRlIHRoZSBtZW51cy5cbiAgICovXG4gIHByaXZhdGUgX3N1YnNjcmliZVRvT3V0c2lkZUNsaWNrcygpIHtcbiAgICBpZiAodGhpcy5fb3ZlcmxheVJlZikge1xuICAgICAgdGhpcy5fb3ZlcmxheVJlZlxuICAgICAgICAub3V0c2lkZVBvaW50ZXJFdmVudHMoKVxuICAgICAgICAucGlwZSh0YWtlVW50aWwodGhpcy5fc3RvcE91dHNpZGVDbGlja3NMaXN0ZW5lcikpXG4gICAgICAgIC5zdWJzY3JpYmUoZXZlbnQgPT4ge1xuICAgICAgICAgIGlmICghaXNDbGlja0luc2lkZU1lbnVPdmVybGF5KGV2ZW50LnRhcmdldCBhcyBFbGVtZW50KSkge1xuICAgICAgICAgICAgdGhpcy5fbWVudVN0YWNrLmNsb3NlQWxsKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICB0aGlzLl9kZXN0cm95T3ZlcmxheSgpO1xuICAgIHRoaXMuX3Jlc2V0UGFuZWxNZW51U3RhY2soKTtcblxuICAgIHRoaXMuX2Rlc3Ryb3llZC5uZXh0KCk7XG4gICAgdGhpcy5fZGVzdHJveWVkLmNvbXBsZXRlKCk7XG4gIH1cblxuICAvKiogRGVzdHJveSBhbmQgdW5zZXQgdGhlIG92ZXJsYXkgcmVmZXJlbmNlIGl0IGlmIGV4aXN0cy4gKi9cbiAgcHJpdmF0ZSBfZGVzdHJveU92ZXJsYXkoKSB7XG4gICAgaWYgKHRoaXMuX292ZXJsYXlSZWYpIHtcbiAgICAgIHRoaXMuX292ZXJsYXlSZWYuZGlzcG9zZSgpO1xuICAgICAgdGhpcy5fb3ZlcmxheVJlZiA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgLyoqIFNldCB0aGUgbWVudSBwYW5lbHMgbWVudSBzdGFjayBiYWNrIHRvIG51bGwuICovXG4gIHByaXZhdGUgX3Jlc2V0UGFuZWxNZW51U3RhY2soKSB7XG4gICAgLy8gSWYgYSBDb250ZXh0TWVudVRyaWdnZXIgaXMgcGxhY2VkIGluIGEgY29uZGl0aW9uYWxseSByZW5kZXJlZCB2aWV3LCBlYWNoIHRpbWUgdGhlIHRyaWdnZXIgaXNcbiAgICAvLyByZW5kZXJlZCB0aGUgcGFuZWwgc2V0dGVyIGZvciBDb250ZXh0TWVudVRyaWdnZXIgaXMgY2FsbGVkLiBGcm9tIHRoZSBmaXJzdCByZW5kZXIgb253YXJkLFxuICAgIC8vIHRoZSBhdHRhY2hlZCBDZGtNZW51UGFuZWwgaGFzIHRoZSBNZW51U3RhY2sgc2V0LiBTaW5jZSB3ZSB0aHJvdyBhbiBlcnJvciBpZiBhIHBhbmVsIGFscmVhZHlcbiAgICAvLyBoYXMgYSBzdGFjayBzZXQsIHdlIHdhbnQgdG8gcmVzZXQgdGhlIGF0dGFjaGVkIHN0YWNrIGhlcmUgdG8gcHJldmVudCB0aGUgZXJyb3IgZnJvbSBiZWluZ1xuICAgIC8vIHRocm93biBpZiB0aGUgdHJpZ2dlciByZS1jb25maWd1cmVzIGl0cyBhdHRhY2hlZCBwYW5lbCAoaW4gdGhlIGNhc2Ugd2hlcmUgdGhlcmUgaXMgYSAxOjFcbiAgICAvLyByZWxhdGlvbnNoaXAgYmV0d2VlbiB0aGUgcGFuZWwgYW5kIHRyaWdnZXIpLlxuICAgIGlmICh0aGlzLl9tZW51UGFuZWwpIHtcbiAgICAgIHRoaXMuX21lbnVQYW5lbC5fbWVudVN0YWNrID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZGlzYWJsZWQ6IEJvb2xlYW5JbnB1dDtcbn1cbiJdfQ==