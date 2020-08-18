/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, Input, ViewContainerRef, Output, EventEmitter, Optional, Inject, Injectable, InjectionToken, isDevMode, } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Directionality } from '@angular/cdk/bidi';
import { Overlay, OverlayConfig, } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { fromEvent, merge, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CdkMenuPanel } from './menu-panel';
import { MenuStack } from './menu-stack';
import { throwExistingMenuStackError } from './menu-errors';
import * as i0 from "@angular/core";
/**
 * Check if the given element is part of the cdk menu module or nested within a cdk menu element.
 * @param target the element to check.
 * @return true if the given element is part of the menu module or nested within a cdk menu element.
 */
function isWithinMenuElement(target) {
    while (target instanceof Element) {
        if (target.classList.contains('cdk-menu') && !target.classList.contains('cdk-menu-inline')) {
            return true;
        }
        target = target.parentElement;
    }
    return false;
}
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
    constructor(_viewContainerRef, _overlay, _contextMenuTracker, _options, document, _directionality) {
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
        /** Emits when the document listener should stop. */
        this._stopDocumentListener = merge(this.closed, this._destroyed);
        /** The menu stack for this trigger and its associated menus. */
        this._menuStack = new MenuStack();
        this._document = document;
        this._setMenuStackListener();
    }
    /** Template reference variable to the menu to open on right click. */
    get menuPanel() {
        return this._menuPanel;
    }
    set menuPanel(panel) {
        // If the provided panel already has a stack, that means it already has a trigger configured
        // TODO refactor once https://github.com/angular/components/pull/20146 lands
        if (isDevMode() && panel._menuStack) {
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
            this._setCloseListener();
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
    /**
     * Subscribe to the document click and context menu events and close out the menu when emitted.
     */
    _setCloseListener() {
        merge(fromEvent(this._document, 'click'), fromEvent(this._document, 'contextmenu'))
            .pipe(takeUntil(this._stopDocumentListener))
            .subscribe(event => {
            const target = event.composedPath ? event.composedPath()[0] : event.target;
            // stop the default context menu from appearing if user right-clicked somewhere outside of
            // any context menu directive or if a user right-clicked inside of the opened menu and just
            // close it.
            if (event.type === 'contextmenu') {
                if (target instanceof Element && isWithinMenuElement(target)) {
                    // Prevent the native context menu from opening within any open context menu or submenu
                    event.preventDefault();
                }
                else {
                    this.close();
                }
            }
            else {
                if (target instanceof Element && !isWithinMenuElement(target)) {
                    this.close();
                }
            }
        });
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
    { type: undefined, decorators: [{ type: Inject, args: [DOCUMENT,] }] },
    { type: Directionality, decorators: [{ type: Optional }] }
];
CdkContextMenuTrigger.propDecorators = {
    menuPanel: [{ type: Input, args: ['cdkContextMenuTriggerFor',] }],
    opened: [{ type: Output, args: ['cdkContextMenuOpened',] }],
    closed: [{ type: Output, args: ['cdkContextMenuClosed',] }],
    disabled: [{ type: Input, args: ['cdkContextMenuDisabled',] }]
};
export { ɵ0 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGV4dC1tZW51LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvbWVudS9jb250ZXh0LW1lbnUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUNMLFNBQVMsRUFDVCxLQUFLLEVBQ0wsZ0JBQWdCLEVBQ2hCLE1BQU0sRUFDTixZQUFZLEVBQ1osUUFBUSxFQUVSLE1BQU0sRUFDTixVQUFVLEVBQ1YsY0FBYyxFQUNkLFNBQVMsR0FDVixNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDekMsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQ2pELE9BQU8sRUFFTCxPQUFPLEVBQ1AsYUFBYSxHQUdkLE1BQU0sc0JBQXNCLENBQUM7QUFDOUIsT0FBTyxFQUFDLGNBQWMsRUFBUyxNQUFNLHFCQUFxQixDQUFDO0FBQzNELE9BQU8sRUFBQyxxQkFBcUIsRUFBZSxNQUFNLHVCQUF1QixDQUFDO0FBQzFFLE9BQU8sRUFBQyxTQUFTLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUMvQyxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDekMsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGNBQWMsQ0FBQztBQUMxQyxPQUFPLEVBQUMsU0FBUyxFQUFnQixNQUFNLGNBQWMsQ0FBQztBQUN0RCxPQUFPLEVBQUMsMkJBQTJCLEVBQUMsTUFBTSxlQUFlLENBQUM7O0FBRTFEOzs7O0dBSUc7QUFDSCxTQUFTLG1CQUFtQixDQUFDLE1BQXNCO0lBQ2pELE9BQU8sTUFBTSxZQUFZLE9BQU8sRUFBRTtRQUNoQyxJQUFJLE1BQU0sQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFD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QUFnQyxFQUFFLFFBQVEsSUFBMEIsRUFBQztpQkFDaEY7YUFDRjs7O1lBN0ZDLGdCQUFnQjtZQWNoQixPQUFPO1lBMElpQyxrQkFBa0I7NENBQ3ZELE1BQU0sU0FBQyxnQ0FBZ0M7NENBQ3ZDLE1BQU0sU0FBQyxRQUFRO1lBL0laLGNBQWMsdUJBZ0pqQixRQUFROzs7d0JBM0RWLEtBQUssU0FBQywwQkFBMEI7cUJBb0JoQyxNQUFNLFNBQUMsc0JBQXNCO3FCQUc3QixNQUFNLFNBQUMsc0JBQXNCO3VCQUc3QixLQUFLLFNBQUMsd0JBQXdCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7XG4gIERpcmVjdGl2ZSxcbiAgSW5wdXQsXG4gIFZpZXdDb250YWluZXJSZWYsXG4gIE91dHB1dCxcbiAgRXZlbnRFbWl0dGVyLFxuICBPcHRpb25hbCxcbiAgT25EZXN0cm95LFxuICBJbmplY3QsXG4gIEluamVjdGFibGUsXG4gIEluamVjdGlvblRva2VuLFxuICBpc0Rldk1vZGUsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtET0NVTUVOVH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7RGlyZWN0aW9uYWxpdHl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9iaWRpJztcbmltcG9ydCB7XG4gIE92ZXJsYXlSZWYsXG4gIE92ZXJsYXksXG4gIE92ZXJsYXlDb25maWcsXG4gIEZsZXhpYmxlQ29ubmVjdGVkUG9zaXRpb25TdHJhdGVneSxcbiAgQ29ubmVjdGVkUG9zaXRpb24sXG59IGZyb20gJ0Bhbmd1bGFyL2Nkay9vdmVybGF5JztcbmltcG9ydCB7VGVtcGxhdGVQb3J0YWwsIFBvcnRhbH0gZnJvbSAnQGFuZ3VsYXIvY2RrL3BvcnRhbCc7XG5pbXBvcnQge2NvZXJjZUJvb2xlYW5Qcm9wZXJ0eSwgQm9vbGVhbklucHV0fSBmcm9tICdAYW5ndWxhci9jZGsvY29lcmNpb24nO1xuaW1wb3J0IHtmcm9tRXZlbnQsIG1lcmdlLCBTdWJqZWN0fSBmcm9tICdyeGpzJztcbmltcG9ydCB7dGFrZVVudGlsfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5pbXBvcnQge0Nka01lbnVQYW5lbH0gZnJvbSAnLi9tZW51LXBhbmVsJztcbmltcG9ydCB7TWVudVN0YWNrLCBNZW51U3RhY2tJdGVtfSBmcm9tICcuL21lbnUtc3RhY2snO1xuaW1wb3J0IHt0aHJvd0V4aXN0aW5nTWVudVN0YWNrRXJyb3J9IGZyb20gJy4vbWVudS1lcnJvcnMnO1xuXG4vKipcbiAqIENoZWNrIGlmIHRoZSBnaXZlbiBlbGVtZW50IGlzIHBhcnQgb2YgdGhlIGNkayBtZW51IG1vZHVsZSBvciBuZXN0ZWQgd2l0aGluIGEgY2RrIG1lbnUgZWxlbWVudC5cbiAqIEBwYXJhbSB0YXJnZXQgdGhlIGVsZW1lbnQgdG8gY2hlY2suXG4gKiBAcmV0dXJuIHRydWUgaWYgdGhlIGdpdmVuIGVsZW1lbnQgaXMgcGFydCBvZiB0aGUgbWVudSBtb2R1bGUgb3IgbmVzdGVkIHdpdGhpbiBhIGNkayBtZW51IGVsZW1lbnQuXG4gKi9cbmZ1bmN0aW9uIGlzV2l0aGluTWVudUVsZW1lbnQodGFyZ2V0OiBFbGVtZW50IHwgbnVsbCkge1xuICB3aGlsZSAodGFyZ2V0IGluc3RhbmNlb2YgRWxlbWVudCkge1xuICAgIGlmICh0YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKCdjZGstbWVudScpICYmICF0YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKCdjZGstbWVudS1pbmxpbmUnKSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHRhcmdldCA9IHRhcmdldC5wYXJlbnRFbGVtZW50O1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuLyoqIFRyYWNrcyB0aGUgbGFzdCBvcGVuIGNvbnRleHQgbWVudSB0cmlnZ2VyIGFjcm9zcyB0aGUgZW50aXJlIGFwcGxpY2F0aW9uLiAqL1xuQEluamVjdGFibGUoe3Byb3ZpZGVkSW46ICdyb290J30pXG5leHBvcnQgY2xhc3MgQ29udGV4dE1lbnVUcmFja2VyIHtcbiAgLyoqIFRoZSBsYXN0IG9wZW4gY29udGV4dCBtZW51IHRyaWdnZXIuICovXG4gIHByaXZhdGUgc3RhdGljIF9vcGVuQ29udGV4dE1lbnVUcmlnZ2VyPzogQ2RrQ29udGV4dE1lbnVUcmlnZ2VyO1xuXG4gIC8qKlxuICAgKiBDbG9zZSB0aGUgcHJldmlvdXMgb3BlbiBjb250ZXh0IG1lbnUgYW5kIHNldCB0aGUgZ2l2ZW4gb25lIGFzIGJlaW5nIG9wZW4uXG4gICAqIEBwYXJhbSB0cmlnZ2VyIHRoZSB0cmlnZ2VyIGZvciB0aGUgY3VycmVudGx5IG9wZW4gQ29udGV4dCBNZW51LlxuICAgKi9cbiAgdXBkYXRlKHRyaWdnZXI6IENka0NvbnRleHRNZW51VHJpZ2dlcikge1xuICAgIGlmIChDb250ZXh0TWVudVRyYWNrZXIuX29wZW5Db250ZXh0TWVudVRyaWdnZXIgIT09IHRyaWdnZXIpIHtcbiAgICAgIENvbnRleHRNZW51VHJhY2tlci5fb3BlbkNvbnRleHRNZW51VHJpZ2dlcj8uY2xvc2UoKTtcbiAgICAgIENvbnRleHRNZW51VHJhY2tlci5fb3BlbkNvbnRleHRNZW51VHJpZ2dlciA9IHRyaWdnZXI7XG4gICAgfVxuICB9XG59XG5cbi8qKiBDb25maWd1cmF0aW9uIG9wdGlvbnMgcGFzc2VkIHRvIHRoZSBjb250ZXh0IG1lbnUuICovXG5leHBvcnQgdHlwZSBDb250ZXh0TWVudU9wdGlvbnMgPSB7XG4gIC8qKiBUaGUgb3BlbmVkIG1lbnVzIFggY29vcmRpbmF0ZSBvZmZzZXQgZnJvbSB0aGUgdHJpZ2dlcmluZyBwb3NpdGlvbi4gKi9cbiAgb2Zmc2V0WDogbnVtYmVyO1xuXG4gIC8qKiBUaGUgb3BlbmVkIG1lbnVzIFkgY29vcmRpbmF0ZSBvZmZzZXQgZnJvbSB0aGUgdHJpZ2dlcmluZyBwb3NpdGlvbi4gKi9cbiAgb2Zmc2V0WTogbnVtYmVyO1xufTtcblxuLyoqIEluamVjdGlvbiB0b2tlbiBmb3IgdGhlIENvbnRleHRNZW51IG9wdGlvbnMgb2JqZWN0LiAqL1xuZXhwb3J0IGNvbnN0IENES19DT05URVhUX01FTlVfREVGQVVMVF9PUFRJT05TID0gbmV3IEluamVjdGlvblRva2VuPENvbnRleHRNZW51T3B0aW9ucz4oXG4gICdjZGstY29udGV4dC1tZW51LWRlZmF1bHQtb3B0aW9ucydcbik7XG5cbi8qKiBUaGUgY29vcmRpbmF0ZXMgb2Ygd2hlcmUgdGhlIGNvbnRleHQgbWVudSBzaG91bGQgb3Blbi4gKi9cbmV4cG9ydCB0eXBlIENvbnRleHRNZW51Q29vcmRpbmF0ZXMgPSB7eDogbnVtYmVyOyB5OiBudW1iZXJ9O1xuXG4vKipcbiAqIEEgZGlyZWN0aXZlIHdoaWNoIHdoZW4gcGxhY2VkIG9uIHNvbWUgZWxlbWVudCBvcGVucyBhIHRoZSBNZW51IGl0IGlzIGJvdW5kIHRvIHdoZW4gYSB1c2VyXG4gKiByaWdodC1jbGlja3Mgd2l0aGluIHRoYXQgZWxlbWVudC4gSXQgaXMgYXdhcmUgb2YgbmVzdGVkIENvbnRleHQgTWVudXMgYW5kIHRoZSBsb3dlc3QgbGV2ZWxcbiAqIG5vbi1kaXNhYmxlZCBjb250ZXh0IG1lbnUgd2lsbCB0cmlnZ2VyLlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbY2RrQ29udGV4dE1lbnVUcmlnZ2VyRm9yXScsXG4gIGV4cG9ydEFzOiAnY2RrQ29udGV4dE1lbnVUcmlnZ2VyRm9yJyxcbiAgaG9zdDoge1xuICAgICcoY29udGV4dG1lbnUpJzogJ19vcGVuT25Db250ZXh0TWVudSgkZXZlbnQpJyxcbiAgfSxcbiAgcHJvdmlkZXJzOiBbXG4gICAgLy8gSW4gY2FzZXMgd2hlcmUgdGhlIGZpcnN0IG1lbnUgaXRlbSBpbiB0aGUgY29udGV4dCBtZW51IGlzIGEgdHJpZ2dlciB0aGUgc3VibWVudSBvcGVucyBvbiBhXG4gICAgLy8gaG92ZXIgZXZlbnQuIE9mZnNldHRpbmcgdGhlIG9wZW5lZCBjb250ZXh0IG1lbnUgYnkgMnB4IHByZXZlbnRzIHRoaXMgZnJvbSBvY2N1cnJpbmcuXG4gICAge3Byb3ZpZGU6IENES19DT05URVhUX01FTlVfREVGQVVMVF9PUFRJT05TLCB1c2VWYWx1ZToge29mZnNldFg6IDIsIG9mZnNldFk6IDJ9fSxcbiAgXSxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrQ29udGV4dE1lbnVUcmlnZ2VyIGltcGxlbWVudHMgT25EZXN0cm95IHtcbiAgLyoqIFRlbXBsYXRlIHJlZmVyZW5jZSB2YXJpYWJsZSB0byB0aGUgbWVudSB0byBvcGVuIG9uIHJpZ2h0IGNsaWNrLiAqL1xuICBASW5wdXQoJ2Nka0NvbnRleHRNZW51VHJpZ2dlckZvcicpXG4gIGdldCBtZW51UGFuZWwoKTogQ2RrTWVudVBhbmVsIHtcbiAgICByZXR1cm4gdGhpcy5fbWVudVBhbmVsO1xuICB9XG4gIHNldCBtZW51UGFuZWwocGFuZWw6IENka01lbnVQYW5lbCkge1xuICAgIC8vIElmIHRoZSBwcm92aWRlZCBwYW5lbCBhbHJlYWR5IGhhcyBhIHN0YWNrLCB0aGF0IG1lYW5zIGl0IGFscmVhZHkgaGFzIGEgdHJpZ2dlciBjb25maWd1cmVkXG4gICAgLy8gVE9ETyByZWZhY3RvciBvbmNlIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2NvbXBvbmVudHMvcHVsbC8yMDE0NiBsYW5kc1xuICAgIGlmIChpc0Rldk1vZGUoKSAmJiBwYW5lbC5fbWVudVN0YWNrKSB7XG4gICAgICB0aHJvd0V4aXN0aW5nTWVudVN0YWNrRXJyb3IoKTtcbiAgICB9XG4gICAgdGhpcy5fbWVudVBhbmVsID0gcGFuZWw7XG5cbiAgICBpZiAodGhpcy5fbWVudVBhbmVsKSB7XG4gICAgICB0aGlzLl9tZW51UGFuZWwuX21lbnVTdGFjayA9IHRoaXMuX21lbnVTdGFjaztcbiAgICB9XG4gIH1cbiAgLyoqIFJlZmVyZW5jZSB0byB0aGUgTWVudVBhbmVsIHRoaXMgdHJpZ2dlciB0b2dnbGVzLiAqL1xuICBwcml2YXRlIF9tZW51UGFuZWw6IENka01lbnVQYW5lbDtcblxuICAvKiogRW1pdHMgd2hlbiB0aGUgYXR0YWNoZWQgbWVudSBpcyByZXF1ZXN0ZWQgdG8gb3Blbi4gKi9cbiAgQE91dHB1dCgnY2RrQ29udGV4dE1lbnVPcGVuZWQnKSByZWFkb25seSBvcGVuZWQ6IEV2ZW50RW1pdHRlcjx2b2lkPiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuICAvKiogRW1pdHMgd2hlbiB0aGUgYXR0YWNoZWQgbWVudSBpcyByZXF1ZXN0ZWQgdG8gY2xvc2UuICovXG4gIEBPdXRwdXQoJ2Nka0NvbnRleHRNZW51Q2xvc2VkJykgcmVhZG9ubHkgY2xvc2VkOiBFdmVudEVtaXR0ZXI8dm9pZD4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGNvbnRleHQgbWVudSBzaG91bGQgYmUgZGlzYWJsZWQuICovXG4gIEBJbnB1dCgnY2RrQ29udGV4dE1lbnVEaXNhYmxlZCcpXG4gIGdldCBkaXNhYmxlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5fZGlzYWJsZWQ7XG4gIH1cbiAgc2V0IGRpc2FibGVkKHZhbHVlOiBib29sZWFuKSB7XG4gICAgdGhpcy5fZGlzYWJsZWQgPSBjb2VyY2VCb29sZWFuUHJvcGVydHkodmFsdWUpO1xuICB9XG4gIHByaXZhdGUgX2Rpc2FibGVkID0gZmFsc2U7XG5cbiAgLyoqIEEgcmVmZXJlbmNlIHRvIHRoZSBvdmVybGF5IHdoaWNoIG1hbmFnZXMgdGhlIHRyaWdnZXJlZCBtZW51LiAqL1xuICBwcml2YXRlIF9vdmVybGF5UmVmOiBPdmVybGF5UmVmIHwgbnVsbCA9IG51bGw7XG5cbiAgLyoqIFRoZSBjb250ZW50IG9mIHRoZSBtZW51IHBhbmVsIG9wZW5lZCBieSB0aGlzIHRyaWdnZXIuICovXG4gIHByaXZhdGUgX3BhbmVsQ29udGVudDogVGVtcGxhdGVQb3J0YWw7XG5cbiAgLyoqIEVtaXRzIHdoZW4gdGhlIGVsZW1lbnQgaXMgZGVzdHJveWVkLiAqL1xuICBwcml2YXRlIHJlYWRvbmx5IF9kZXN0cm95ZWQ6IFN1YmplY3Q8dm9pZD4gPSBuZXcgU3ViamVjdCgpO1xuXG4gIC8qKiBSZWZlcmVuY2UgdG8gdGhlIGRvY3VtZW50LiAqL1xuICBwcml2YXRlIHJlYWRvbmx5IF9kb2N1bWVudDogRG9jdW1lbnQ7XG5cbiAgLyoqIEVtaXRzIHdoZW4gdGhlIGRvY3VtZW50IGxpc3RlbmVyIHNob3VsZCBzdG9wLiAqL1xuICBwcml2YXRlIHJlYWRvbmx5IF9zdG9wRG9jdW1lbnRMaXN0ZW5lciA9IG1lcmdlKHRoaXMuY2xvc2VkLCB0aGlzLl9kZXN0cm95ZWQpO1xuXG4gIC8qKiBUaGUgbWVudSBzdGFjayBmb3IgdGhpcyB0cmlnZ2VyIGFuZCBpdHMgYXNzb2NpYXRlZCBtZW51cy4gKi9cbiAgcHJpdmF0ZSByZWFkb25seSBfbWVudVN0YWNrID0gbmV3IE1lbnVTdGFjaygpO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByb3RlY3RlZCByZWFkb25seSBfdmlld0NvbnRhaW5lclJlZjogVmlld0NvbnRhaW5lclJlZixcbiAgICBwcml2YXRlIHJlYWRvbmx5IF9vdmVybGF5OiBPdmVybGF5LFxuICAgIHByaXZhdGUgcmVhZG9ubHkgX2NvbnRleHRNZW51VHJhY2tlcjogQ29udGV4dE1lbnVUcmFja2VyLFxuICAgIEBJbmplY3QoQ0RLX0NPTlRFWFRfTUVOVV9ERUZBVUxUX09QVElPTlMpIHByaXZhdGUgcmVhZG9ubHkgX29wdGlvbnM6IENvbnRleHRNZW51T3B0aW9ucyxcbiAgICBASW5qZWN0KERPQ1VNRU5UKSBkb2N1bWVudDogYW55LFxuICAgIEBPcHRpb25hbCgpIHByaXZhdGUgcmVhZG9ubHkgX2RpcmVjdGlvbmFsaXR5PzogRGlyZWN0aW9uYWxpdHlcbiAgKSB7XG4gICAgdGhpcy5fZG9jdW1lbnQgPSBkb2N1bWVudDtcblxuICAgIHRoaXMuX3NldE1lbnVTdGFja0xpc3RlbmVyKCk7XG4gIH1cblxuICAvKipcbiAgICogT3BlbiB0aGUgYXR0YWNoZWQgbWVudSBhdCB0aGUgc3BlY2lmaWVkIGxvY2F0aW9uLlxuICAgKiBAcGFyYW0gY29vcmRpbmF0ZXMgd2hlcmUgdG8gb3BlbiB0aGUgY29udGV4dCBtZW51XG4gICAqL1xuICBvcGVuKGNvb3JkaW5hdGVzOiBDb250ZXh0TWVudUNvb3JkaW5hdGVzKSB7XG4gICAgaWYgKHRoaXMuZGlzYWJsZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9IGVsc2UgaWYgKHRoaXMuaXNPcGVuKCkpIHtcbiAgICAgIC8vIHNpbmNlIHdlJ3JlIG1vdmluZyB0aGlzIG1lbnUgd2UgbmVlZCB0byBjbG9zZSBhbnkgc3VibWVudXMgZmlyc3Qgb3RoZXJ3aXNlIHRoZXkgZW5kIHVwXG4gICAgICAvLyBkaXNjb25uZWN0ZWQgZnJvbSB0aGlzIG9uZS5cbiAgICAgIHRoaXMuX21lbnVTdGFjay5jbG9zZVN1Yk1lbnVPZih0aGlzLl9tZW51UGFuZWwuX21lbnUhKTtcblxuICAgICAgKHRoaXMuX292ZXJsYXlSZWYhLmdldENvbmZpZygpXG4gICAgICAgIC5wb3NpdGlvblN0cmF0ZWd5IGFzIEZsZXhpYmxlQ29ubmVjdGVkUG9zaXRpb25TdHJhdGVneSkuc2V0T3JpZ2luKGNvb3JkaW5hdGVzKTtcbiAgICAgIHRoaXMuX292ZXJsYXlSZWYhLnVwZGF0ZVBvc2l0aW9uKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMub3BlbmVkLm5leHQoKTtcblxuICAgICAgaWYgKHRoaXMuX292ZXJsYXlSZWYpIHtcbiAgICAgICAgKHRoaXMuX292ZXJsYXlSZWYuZ2V0Q29uZmlnKClcbiAgICAgICAgICAucG9zaXRpb25TdHJhdGVneSBhcyBGbGV4aWJsZUNvbm5lY3RlZFBvc2l0aW9uU3RyYXRlZ3kpLnNldE9yaWdpbihjb29yZGluYXRlcyk7XG4gICAgICAgIHRoaXMuX292ZXJsYXlSZWYudXBkYXRlUG9zaXRpb24oKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX292ZXJsYXlSZWYgPSB0aGlzLl9vdmVybGF5LmNyZWF0ZSh0aGlzLl9nZXRPdmVybGF5Q29uZmlnKGNvb3JkaW5hdGVzKSk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX292ZXJsYXlSZWYuYXR0YWNoKHRoaXMuX2dldE1lbnVDb250ZW50KCkpO1xuICAgICAgdGhpcy5fc2V0Q2xvc2VMaXN0ZW5lcigpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBDbG9zZSB0aGUgb3BlbmVkIG1lbnUuICovXG4gIGNsb3NlKCkge1xuICAgIHRoaXMuX21lbnVTdGFjay5jbG9zZUFsbCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIE9wZW4gdGhlIGNvbnRleHQgbWVudSBhbmQgY2xvc2UgYW55IHByZXZpb3VzbHkgb3BlbiBtZW51cy5cbiAgICogQHBhcmFtIGV2ZW50IHRoZSBtb3VzZSBldmVudCB3aGljaCBvcGVucyB0aGUgY29udGV4dCBtZW51LlxuICAgKi9cbiAgX29wZW5PbkNvbnRleHRNZW51KGV2ZW50OiBNb3VzZUV2ZW50KSB7XG4gICAgaWYgKCF0aGlzLmRpc2FibGVkKSB7XG4gICAgICAvLyBQcmV2ZW50IHRoZSBuYXRpdmUgY29udGV4dCBtZW51IGZyb20gb3BlbmluZyBiZWNhdXNlIHdlJ3JlIG9wZW5pbmcgYSBjdXN0b20gb25lLlxuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgLy8gU3RvcCBldmVudCBwcm9wYWdhdGlvbiB0byBlbnN1cmUgdGhhdCBvbmx5IHRoZSBjbG9zZXN0IGVuYWJsZWQgY29udGV4dCBtZW51IG9wZW5zLlxuICAgICAgLy8gT3RoZXJ3aXNlLCBhbnkgY29udGV4dCBtZW51cyBhdHRhY2hlZCB0byBjb250YWluaW5nIGVsZW1lbnRzIHdvdWxkICphbHNvKiBvcGVuLFxuICAgICAgLy8gcmVzdWx0aW5nIGluIG11bHRpcGxlIHN0YWNrZWQgY29udGV4dCBtZW51cyBiZWluZyBkaXNwbGF5ZWQuXG4gICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgICAgdGhpcy5fY29udGV4dE1lbnVUcmFja2VyLnVwZGF0ZSh0aGlzKTtcbiAgICAgIHRoaXMub3Blbih7eDogZXZlbnQuY2xpZW50WCwgeTogZXZlbnQuY2xpZW50WX0pO1xuXG4gICAgICAvLyBBIGNvbnRleHQgbWVudSBjYW4gYmUgdHJpZ2dlcmVkIHZpYSBhIG1vdXNlIHJpZ2h0IGNsaWNrIG9yIGEga2V5Ym9hcmQgc2hvcnRjdXQuXG4gICAgICBpZiAoZXZlbnQuYnV0dG9uID09PSAyKSB7XG4gICAgICAgIHRoaXMuX21lbnVQYW5lbC5fbWVudT8uZm9jdXNGaXJzdEl0ZW0oJ21vdXNlJyk7XG4gICAgICB9IGVsc2UgaWYgKGV2ZW50LmJ1dHRvbiA9PT0gMCkge1xuICAgICAgICB0aGlzLl9tZW51UGFuZWwuX21lbnU/LmZvY3VzRmlyc3RJdGVtKCdrZXlib2FyZCcpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fbWVudVBhbmVsLl9tZW51Py5mb2N1c0ZpcnN0SXRlbSgncHJvZ3JhbScpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoZSBhdHRhY2hlZCBtZW51IGlzIG9wZW4uICovXG4gIGlzT3BlbigpIHtcbiAgICByZXR1cm4gISF0aGlzLl9vdmVybGF5UmVmPy5oYXNBdHRhY2hlZCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgY29uZmlndXJhdGlvbiBvYmplY3QgdXNlZCB0byBjcmVhdGUgdGhlIG92ZXJsYXkuXG4gICAqIEBwYXJhbSBjb29yZGluYXRlcyB0aGUgbG9jYXRpb24gdG8gcGxhY2UgdGhlIG9wZW5lZCBtZW51XG4gICAqL1xuICBwcml2YXRlIF9nZXRPdmVybGF5Q29uZmlnKGNvb3JkaW5hdGVzOiBDb250ZXh0TWVudUNvb3JkaW5hdGVzKSB7XG4gICAgcmV0dXJuIG5ldyBPdmVybGF5Q29uZmlnKHtcbiAgICAgIHBvc2l0aW9uU3RyYXRlZ3k6IHRoaXMuX2dldE92ZXJsYXlQb3NpdGlvblN0cmF0ZWd5KGNvb3JkaW5hdGVzKSxcbiAgICAgIHNjcm9sbFN0cmF0ZWd5OiB0aGlzLl9vdmVybGF5LnNjcm9sbFN0cmF0ZWdpZXMuYmxvY2soKSxcbiAgICAgIGRpcmVjdGlvbjogdGhpcy5fZGlyZWN0aW9uYWxpdHksXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQnVpbGQgdGhlIHBvc2l0aW9uIHN0cmF0ZWd5IGZvciB0aGUgb3ZlcmxheSB3aGljaCBzcGVjaWZpZXMgd2hlcmUgdG8gcGxhY2UgdGhlIG1lbnUuXG4gICAqIEBwYXJhbSBjb29yZGluYXRlcyB0aGUgbG9jYXRpb24gdG8gcGxhY2UgdGhlIG9wZW5lZCBtZW51XG4gICAqL1xuICBwcml2YXRlIF9nZXRPdmVybGF5UG9zaXRpb25TdHJhdGVneShcbiAgICBjb29yZGluYXRlczogQ29udGV4dE1lbnVDb29yZGluYXRlc1xuICApOiBGbGV4aWJsZUNvbm5lY3RlZFBvc2l0aW9uU3RyYXRlZ3kge1xuICAgIHJldHVybiB0aGlzLl9vdmVybGF5XG4gICAgICAucG9zaXRpb24oKVxuICAgICAgLmZsZXhpYmxlQ29ubmVjdGVkVG8oY29vcmRpbmF0ZXMpXG4gICAgICAud2l0aERlZmF1bHRPZmZzZXRYKHRoaXMuX29wdGlvbnMub2Zmc2V0WClcbiAgICAgIC53aXRoRGVmYXVsdE9mZnNldFkodGhpcy5fb3B0aW9ucy5vZmZzZXRZKVxuICAgICAgLndpdGhQb3NpdGlvbnModGhpcy5fZ2V0T3ZlcmxheVBvc2l0aW9ucygpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXRlcm1pbmUgYW5kIHJldHVybiB3aGVyZSB0byBwb3NpdGlvbiB0aGUgb3BlbmVkIG1lbnUgcmVsYXRpdmUgdG8gdGhlIG1vdXNlIGxvY2F0aW9uLlxuICAgKi9cbiAgcHJpdmF0ZSBfZ2V0T3ZlcmxheVBvc2l0aW9ucygpOiBDb25uZWN0ZWRQb3NpdGlvbltdIHtcbiAgICAvLyBUT0RPOiB0aGlzIHNob3VsZCBiZSBjb25maWd1cmFibGUgdGhyb3VnaCB0aGUgaW5qZWN0ZWQgY29udGV4dCBtZW51IG9wdGlvbnNcbiAgICByZXR1cm4gW1xuICAgICAge29yaWdpblg6ICdlbmQnLCBvcmlnaW5ZOiAndG9wJywgb3ZlcmxheVg6ICdzdGFydCcsIG92ZXJsYXlZOiAndG9wJ30sXG4gICAgICB7b3JpZ2luWDogJ3N0YXJ0Jywgb3JpZ2luWTogJ3RvcCcsIG92ZXJsYXlYOiAnZW5kJywgb3ZlcmxheVk6ICd0b3AnfSxcbiAgICAgIHtvcmlnaW5YOiAnZW5kJywgb3JpZ2luWTogJ2JvdHRvbScsIG92ZXJsYXlYOiAnc3RhcnQnLCBvdmVybGF5WTogJ2JvdHRvbSd9LFxuICAgICAge29yaWdpblg6ICdzdGFydCcsIG9yaWdpblk6ICdib3R0b20nLCBvdmVybGF5WDogJ2VuZCcsIG92ZXJsYXlZOiAnYm90dG9tJ30sXG4gICAgXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIHBvcnRhbCB0byBiZSBhdHRhY2hlZCB0byB0aGUgb3ZlcmxheSB3aGljaCBjb250YWlucyB0aGUgbWVudS4gQWxsb3dzIGZvciB0aGUgbWVudVxuICAgKiBjb250ZW50IHRvIGNoYW5nZSBkeW5hbWljYWxseSBhbmQgYmUgcmVmbGVjdGVkIGluIHRoZSBhcHBsaWNhdGlvbi5cbiAgICovXG4gIHByaXZhdGUgX2dldE1lbnVDb250ZW50KCk6IFBvcnRhbDx1bmtub3duPiB7XG4gICAgY29uc3QgaGFzTWVudUNvbnRlbnRDaGFuZ2VkID0gdGhpcy5tZW51UGFuZWwuX3RlbXBsYXRlUmVmICE9PSB0aGlzLl9wYW5lbENvbnRlbnQ/LnRlbXBsYXRlUmVmO1xuICAgIGlmICh0aGlzLm1lbnVQYW5lbCAmJiAoIXRoaXMuX3BhbmVsQ29udGVudCB8fCBoYXNNZW51Q29udGVudENoYW5nZWQpKSB7XG4gICAgICB0aGlzLl9wYW5lbENvbnRlbnQgPSBuZXcgVGVtcGxhdGVQb3J0YWwodGhpcy5tZW51UGFuZWwuX3RlbXBsYXRlUmVmLCB0aGlzLl92aWV3Q29udGFpbmVyUmVmKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fcGFuZWxDb250ZW50O1xuICB9XG5cbiAgLyoqXG4gICAqIFN1YnNjcmliZSB0byB0aGUgZG9jdW1lbnQgY2xpY2sgYW5kIGNvbnRleHQgbWVudSBldmVudHMgYW5kIGNsb3NlIG91dCB0aGUgbWVudSB3aGVuIGVtaXR0ZWQuXG4gICAqL1xuICBwcml2YXRlIF9zZXRDbG9zZUxpc3RlbmVyKCkge1xuICAgIG1lcmdlKGZyb21FdmVudCh0aGlzLl9kb2N1bWVudCwgJ2NsaWNrJyksIGZyb21FdmVudCh0aGlzLl9kb2N1bWVudCwgJ2NvbnRleHRtZW51JykpXG4gICAgICAucGlwZSh0YWtlVW50aWwodGhpcy5fc3RvcERvY3VtZW50TGlzdGVuZXIpKVxuICAgICAgLnN1YnNjcmliZShldmVudCA9PiB7XG4gICAgICAgIGNvbnN0IHRhcmdldCA9IGV2ZW50LmNvbXBvc2VkUGF0aCA/IGV2ZW50LmNvbXBvc2VkUGF0aCgpWzBdIDogZXZlbnQudGFyZ2V0O1xuICAgICAgICAvLyBzdG9wIHRoZSBkZWZhdWx0IGNvbnRleHQgbWVudSBmcm9tIGFwcGVhcmluZyBpZiB1c2VyIHJpZ2h0LWNsaWNrZWQgc29tZXdoZXJlIG91dHNpZGUgb2ZcbiAgICAgICAgLy8gYW55IGNvbnRleHQgbWVudSBkaXJlY3RpdmUgb3IgaWYgYSB1c2VyIHJpZ2h0LWNsaWNrZWQgaW5zaWRlIG9mIHRoZSBvcGVuZWQgbWVudSBhbmQganVzdFxuICAgICAgICAvLyBjbG9zZSBpdC5cbiAgICAgICAgaWYgKGV2ZW50LnR5cGUgPT09ICdjb250ZXh0bWVudScpIHtcbiAgICAgICAgICBpZiAodGFyZ2V0IGluc3RhbmNlb2YgRWxlbWVudCAmJiBpc1dpdGhpbk1lbnVFbGVtZW50KHRhcmdldCkpIHtcbiAgICAgICAgICAgIC8vIFByZXZlbnQgdGhlIG5hdGl2ZSBjb250ZXh0IG1lbnUgZnJvbSBvcGVuaW5nIHdpdGhpbiBhbnkgb3BlbiBjb250ZXh0IG1lbnUgb3Igc3VibWVudVxuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5jbG9zZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAodGFyZ2V0IGluc3RhbmNlb2YgRWxlbWVudCAmJiAhaXNXaXRoaW5NZW51RWxlbWVudCh0YXJnZXQpKSB7XG4gICAgICAgICAgICB0aGlzLmNsb3NlKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgfVxuXG4gIC8qKiBTdWJzY3JpYmUgdG8gdGhlIG1lbnUgc3RhY2sgY2xvc2UgZXZlbnRzIGFuZCBjbG9zZSB0aGlzIG1lbnUgd2hlbiByZXF1ZXN0ZWQuICovXG4gIHByaXZhdGUgX3NldE1lbnVTdGFja0xpc3RlbmVyKCkge1xuICAgIHRoaXMuX21lbnVTdGFjay5jbG9zZWQucGlwZSh0YWtlVW50aWwodGhpcy5fZGVzdHJveWVkKSkuc3Vic2NyaWJlKChpdGVtOiBNZW51U3RhY2tJdGVtKSA9PiB7XG4gICAgICBpZiAoaXRlbSA9PT0gdGhpcy5fbWVudVBhbmVsLl9tZW51ICYmIHRoaXMuaXNPcGVuKCkpIHtcbiAgICAgICAgdGhpcy5jbG9zZWQubmV4dCgpO1xuICAgICAgICB0aGlzLl9vdmVybGF5UmVmIS5kZXRhY2goKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIHRoaXMuX2Rlc3Ryb3lPdmVybGF5KCk7XG4gICAgdGhpcy5fcmVzZXRQYW5lbE1lbnVTdGFjaygpO1xuXG4gICAgdGhpcy5fZGVzdHJveWVkLm5leHQoKTtcbiAgICB0aGlzLl9kZXN0cm95ZWQuY29tcGxldGUoKTtcbiAgfVxuXG4gIC8qKiBEZXN0cm95IGFuZCB1bnNldCB0aGUgb3ZlcmxheSByZWZlcmVuY2UgaXQgaWYgZXhpc3RzLiAqL1xuICBwcml2YXRlIF9kZXN0cm95T3ZlcmxheSgpIHtcbiAgICBpZiAodGhpcy5fb3ZlcmxheVJlZikge1xuICAgICAgdGhpcy5fb3ZlcmxheVJlZi5kaXNwb3NlKCk7XG4gICAgICB0aGlzLl9vdmVybGF5UmVmID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICAvKiogU2V0IHRoZSBtZW51IHBhbmVscyBtZW51IHN0YWNrIGJhY2sgdG8gbnVsbC4gKi9cbiAgcHJpdmF0ZSBfcmVzZXRQYW5lbE1lbnVTdGFjaygpIHtcbiAgICAvLyBJZiBhIENvbnRleHRNZW51VHJpZ2dlciBpcyBwbGFjZWQgaW4gYSBjb25kaXRpb25hbGx5IHJlbmRlcmVkIHZpZXcsIGVhY2ggdGltZSB0aGUgdHJpZ2dlciBpc1xuICAgIC8vIHJlbmRlcmVkIHRoZSBwYW5lbCBzZXR0ZXIgZm9yIENvbnRleHRNZW51VHJpZ2dlciBpcyBjYWxsZWQuIEZyb20gdGhlIGZpcnN0IHJlbmRlciBvbndhcmQsXG4gICAgLy8gdGhlIGF0dGFjaGVkIENka01lbnVQYW5lbCBoYXMgdGhlIE1lbnVTdGFjayBzZXQuIFNpbmNlIHdlIHRocm93IGFuIGVycm9yIGlmIGEgcGFuZWwgYWxyZWFkeVxuICAgIC8vIGhhcyBhIHN0YWNrIHNldCwgd2Ugd2FudCB0byByZXNldCB0aGUgYXR0YWNoZWQgc3RhY2sgaGVyZSB0byBwcmV2ZW50IHRoZSBlcnJvciBmcm9tIGJlaW5nXG4gICAgLy8gdGhyb3duIGlmIHRoZSB0cmlnZ2VyIHJlLWNvbmZpZ3VyZXMgaXRzIGF0dGFjaGVkIHBhbmVsIChpbiB0aGUgY2FzZSB3aGVyZSB0aGVyZSBpcyBhIDE6MVxuICAgIC8vIHJlbGF0aW9uc2hpcCBiZXR3ZWVuIHRoZSBwYW5lbCBhbmQgdHJpZ2dlcikuXG4gICAgaWYgKHRoaXMuX21lbnVQYW5lbCkge1xuICAgICAgdGhpcy5fbWVudVBhbmVsLl9tZW51U3RhY2sgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9kaXNhYmxlZDogQm9vbGVhbklucHV0O1xufVxuIl19