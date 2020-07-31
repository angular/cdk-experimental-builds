/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, Input, ViewContainerRef, Output, EventEmitter, Optional, Inject, Injectable, InjectionToken, } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Directionality } from '@angular/cdk/bidi';
import { Overlay, OverlayConfig, } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { fromEvent, merge, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CdkMenuPanel } from './menu-panel';
import { MenuStack } from './menu-stack';
import * as i0 from "@angular/core";
/**
 * Check if the given element is part of the cdk menu module or nested within a cdk menu element.
 * @param target the element to check.
 * @return true if the given element is part of the menu module or nested within a cdk menu element.
 */
function isWithinMenuElement(target) {
    while (target instanceof Element) {
        if (target.className.indexOf('cdk-menu') !== -1) {
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
        if (!this.disabled) {
            // Prevent the native context menu from opening because we're opening a custom one.
            event.preventDefault();
            // Stop event propagation to ensure that only the closest enabled context menu opens.
            // Otherwise, any context menus attached to containing elements would *also* open,
            // resulting in multiple stacked context menus being displayed.
            event.stopPropagation();
            this._contextMenuTracker.update(this);
            this.open({ x: event.clientX, y: event.clientY });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGV4dC1tZW51LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvbWVudS9jb250ZXh0LW1lbnUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUNMLFNBQVMsRUFDVCxLQUFLLEVBQ0wsZ0JBQWdCLEVBQ2hCLE1BQU0sRUFDTixZQUFZLEVBQ1osUUFBUSxFQUVSLE1BQU0sRUFDTixVQUFVLEVBQ1YsY0FBYyxHQUNmLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUN6QyxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDakQsT0FBTyxFQUVMLE9BQU8sRUFDUCxhQUFhLEdBR2QsTUFBTSxzQkFBc0IsQ0FBQztBQUM5QixPQUFPLEVBQUMsY0FBYyxFQUFTLE1BQU0scUJBQXFCLENBQUM7QUFDM0QsT0FBTyxFQUFDLHFCQUFxQixFQUFlLE1BQU0sdUJBQXVCLENBQUM7QUFDMUUsT0FBTyxFQUFDLFNBQVMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQy9DLE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUN6QyxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sY0FBYyxDQUFDO0FBQzFDLE9BQU8sRUFBQyxTQUFTLEVBQWdCLE1BQU0sY0FBYyxDQUFDOztBQUV0RDs7OztHQUlHO0FBQ0gsU0FBUyxtQkFBbUIsQ0FBQyxNQUFzQjtJQUNqRCxPQUFPLE1BQU0sWUFBWSxPQUFPLEVBQUU7UUFDaEMsSUFBSSxNQUFNLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtZQUMvQyxPQUFPLElBQUksQ0FBQztTQUNiO1FBQ0QsTUFBTSxHQUFHLE1BQU0sQ0FBQyxh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T0YsU0FBUyxTQUFDO2dCQUNULFFBQVEsRUFBRSw0QkFBNEI7Z0JBQ3RDLFFBQVEsRUFBRSwwQkFBMEI7Z0JBQ3BDLElBQUksRUFBRTtvQkFDSixlQUFlLEVBQUUsNEJBQTRCO2lCQUM5QztnQkFDRCxTQUFTLEVBQUU7b0JBQ1QsNkZBQTZGO29CQUM3Rix1RkFBdUY7b0JBQ3ZGLEVBQUMsT0FBTyxFQUFFLGdDQUFnQyxFQUFFLFFBQVEsSUFBMEIsRUFBQztpQkFDaEY7YUFDRjs7O1lBM0ZDLGdCQUFnQjtZQWFoQixPQUFPO1lBb0lpQyxrQkFBa0I7NENBQ3ZELE1BQU0sU0FBQyxnQ0FBZ0M7NENBQ3ZDLE1BQU0sU0FBQyxRQUFRO1lBeklaLGNBQWMsdUJBMElqQixRQUFROzs7d0JBdERWLEtBQUssU0FBQywwQkFBMEI7cUJBZWhDLE1BQU0sU0FBQyxzQkFBc0I7cUJBRzdCLE1BQU0sU0FBQyxzQkFBc0I7dUJBRzdCLEtBQUssU0FBQyx3QkFBd0IiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtcbiAgRGlyZWN0aXZlLFxuICBJbnB1dCxcbiAgVmlld0NvbnRhaW5lclJlZixcbiAgT3V0cHV0LFxuICBFdmVudEVtaXR0ZXIsXG4gIE9wdGlvbmFsLFxuICBPbkRlc3Ryb3ksXG4gIEluamVjdCxcbiAgSW5qZWN0YWJsZSxcbiAgSW5qZWN0aW9uVG9rZW4sXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtET0NVTUVOVH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7RGlyZWN0aW9uYWxpdHl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9iaWRpJztcbmltcG9ydCB7XG4gIE92ZXJsYXlSZWYsXG4gIE92ZXJsYXksXG4gIE92ZXJsYXlDb25maWcsXG4gIEZsZXhpYmxlQ29ubmVjdGVkUG9zaXRpb25TdHJhdGVneSxcbiAgQ29ubmVjdGVkUG9zaXRpb24sXG59IGZyb20gJ0Bhbmd1bGFyL2Nkay9vdmVybGF5JztcbmltcG9ydCB7VGVtcGxhdGVQb3J0YWwsIFBvcnRhbH0gZnJvbSAnQGFuZ3VsYXIvY2RrL3BvcnRhbCc7XG5pbXBvcnQge2NvZXJjZUJvb2xlYW5Qcm9wZXJ0eSwgQm9vbGVhbklucHV0fSBmcm9tICdAYW5ndWxhci9jZGsvY29lcmNpb24nO1xuaW1wb3J0IHtmcm9tRXZlbnQsIG1lcmdlLCBTdWJqZWN0fSBmcm9tICdyeGpzJztcbmltcG9ydCB7dGFrZVVudGlsfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5pbXBvcnQge0Nka01lbnVQYW5lbH0gZnJvbSAnLi9tZW51LXBhbmVsJztcbmltcG9ydCB7TWVudVN0YWNrLCBNZW51U3RhY2tJdGVtfSBmcm9tICcuL21lbnUtc3RhY2snO1xuXG4vKipcbiAqIENoZWNrIGlmIHRoZSBnaXZlbiBlbGVtZW50IGlzIHBhcnQgb2YgdGhlIGNkayBtZW51IG1vZHVsZSBvciBuZXN0ZWQgd2l0aGluIGEgY2RrIG1lbnUgZWxlbWVudC5cbiAqIEBwYXJhbSB0YXJnZXQgdGhlIGVsZW1lbnQgdG8gY2hlY2suXG4gKiBAcmV0dXJuIHRydWUgaWYgdGhlIGdpdmVuIGVsZW1lbnQgaXMgcGFydCBvZiB0aGUgbWVudSBtb2R1bGUgb3IgbmVzdGVkIHdpdGhpbiBhIGNkayBtZW51IGVsZW1lbnQuXG4gKi9cbmZ1bmN0aW9uIGlzV2l0aGluTWVudUVsZW1lbnQodGFyZ2V0OiBFbGVtZW50IHwgbnVsbCkge1xuICB3aGlsZSAodGFyZ2V0IGluc3RhbmNlb2YgRWxlbWVudCkge1xuICAgIGlmICh0YXJnZXQuY2xhc3NOYW1lLmluZGV4T2YoJ2Nkay1tZW51JykgIT09IC0xKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgdGFyZ2V0ID0gdGFyZ2V0LnBhcmVudEVsZW1lbnQ7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG4vKiogVHJhY2tzIHRoZSBsYXN0IG9wZW4gY29udGV4dCBtZW51IHRyaWdnZXIgYWNyb3NzIHRoZSBlbnRpcmUgYXBwbGljYXRpb24uICovXG5ASW5qZWN0YWJsZSh7cHJvdmlkZWRJbjogJ3Jvb3QnfSlcbmV4cG9ydCBjbGFzcyBDb250ZXh0TWVudVRyYWNrZXIge1xuICAvKiogVGhlIGxhc3Qgb3BlbiBjb250ZXh0IG1lbnUgdHJpZ2dlci4gKi9cbiAgcHJpdmF0ZSBzdGF0aWMgX29wZW5Db250ZXh0TWVudVRyaWdnZXI/OiBDZGtDb250ZXh0TWVudVRyaWdnZXI7XG5cbiAgLyoqXG4gICAqIENsb3NlIHRoZSBwcmV2aW91cyBvcGVuIGNvbnRleHQgbWVudSBhbmQgc2V0IHRoZSBnaXZlbiBvbmUgYXMgYmVpbmcgb3Blbi5cbiAgICogQHBhcmFtIHRyaWdnZXIgdGhlIHRyaWdnZXIgZm9yIHRoZSBjdXJyZW50bHkgb3BlbiBDb250ZXh0IE1lbnUuXG4gICAqL1xuICB1cGRhdGUodHJpZ2dlcjogQ2RrQ29udGV4dE1lbnVUcmlnZ2VyKSB7XG4gICAgaWYgKENvbnRleHRNZW51VHJhY2tlci5fb3BlbkNvbnRleHRNZW51VHJpZ2dlciAhPT0gdHJpZ2dlcikge1xuICAgICAgQ29udGV4dE1lbnVUcmFja2VyLl9vcGVuQ29udGV4dE1lbnVUcmlnZ2VyPy5jbG9zZSgpO1xuICAgICAgQ29udGV4dE1lbnVUcmFja2VyLl9vcGVuQ29udGV4dE1lbnVUcmlnZ2VyID0gdHJpZ2dlcjtcbiAgICB9XG4gIH1cbn1cblxuLyoqIENvbmZpZ3VyYXRpb24gb3B0aW9ucyBwYXNzZWQgdG8gdGhlIGNvbnRleHQgbWVudS4gKi9cbmV4cG9ydCB0eXBlIENvbnRleHRNZW51T3B0aW9ucyA9IHtcbiAgLyoqIFRoZSBvcGVuZWQgbWVudXMgWCBjb29yZGluYXRlIG9mZnNldCBmcm9tIHRoZSB0cmlnZ2VyaW5nIHBvc2l0aW9uLiAqL1xuICBvZmZzZXRYOiBudW1iZXI7XG5cbiAgLyoqIFRoZSBvcGVuZWQgbWVudXMgWSBjb29yZGluYXRlIG9mZnNldCBmcm9tIHRoZSB0cmlnZ2VyaW5nIHBvc2l0aW9uLiAqL1xuICBvZmZzZXRZOiBudW1iZXI7XG59O1xuXG4vKiogSW5qZWN0aW9uIHRva2VuIGZvciB0aGUgQ29udGV4dE1lbnUgb3B0aW9ucyBvYmplY3QuICovXG5leHBvcnQgY29uc3QgQ0RLX0NPTlRFWFRfTUVOVV9ERUZBVUxUX09QVElPTlMgPSBuZXcgSW5qZWN0aW9uVG9rZW48Q29udGV4dE1lbnVPcHRpb25zPihcbiAgJ2Nkay1jb250ZXh0LW1lbnUtZGVmYXVsdC1vcHRpb25zJ1xuKTtcblxuLyoqIFRoZSBjb29yZGluYXRlcyBvZiB3aGVyZSB0aGUgY29udGV4dCBtZW51IHNob3VsZCBvcGVuLiAqL1xuZXhwb3J0IHR5cGUgQ29udGV4dE1lbnVDb29yZGluYXRlcyA9IHt4OiBudW1iZXI7IHk6IG51bWJlcn07XG5cbi8qKlxuICogQSBkaXJlY3RpdmUgd2hpY2ggd2hlbiBwbGFjZWQgb24gc29tZSBlbGVtZW50IG9wZW5zIGEgdGhlIE1lbnUgaXQgaXMgYm91bmQgdG8gd2hlbiBhIHVzZXJcbiAqIHJpZ2h0LWNsaWNrcyB3aXRoaW4gdGhhdCBlbGVtZW50LiBJdCBpcyBhd2FyZSBvZiBuZXN0ZWQgQ29udGV4dCBNZW51cyBhbmQgdGhlIGxvd2VzdCBsZXZlbFxuICogbm9uLWRpc2FibGVkIGNvbnRleHQgbWVudSB3aWxsIHRyaWdnZXIuXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tjZGtDb250ZXh0TWVudVRyaWdnZXJGb3JdJyxcbiAgZXhwb3J0QXM6ICdjZGtDb250ZXh0TWVudVRyaWdnZXJGb3InLFxuICBob3N0OiB7XG4gICAgJyhjb250ZXh0bWVudSknOiAnX29wZW5PbkNvbnRleHRNZW51KCRldmVudCknLFxuICB9LFxuICBwcm92aWRlcnM6IFtcbiAgICAvLyBJbiBjYXNlcyB3aGVyZSB0aGUgZmlyc3QgbWVudSBpdGVtIGluIHRoZSBjb250ZXh0IG1lbnUgaXMgYSB0cmlnZ2VyIHRoZSBzdWJtZW51IG9wZW5zIG9uIGFcbiAgICAvLyBob3ZlciBldmVudC4gT2Zmc2V0dGluZyB0aGUgb3BlbmVkIGNvbnRleHQgbWVudSBieSAycHggcHJldmVudHMgdGhpcyBmcm9tIG9jY3VycmluZy5cbiAgICB7cHJvdmlkZTogQ0RLX0NPTlRFWFRfTUVOVV9ERUZBVUxUX09QVElPTlMsIHVzZVZhbHVlOiB7b2Zmc2V0WDogMiwgb2Zmc2V0WTogMn19LFxuICBdLFxufSlcbmV4cG9ydCBjbGFzcyBDZGtDb250ZXh0TWVudVRyaWdnZXIgaW1wbGVtZW50cyBPbkRlc3Ryb3kge1xuICAvKiogVGVtcGxhdGUgcmVmZXJlbmNlIHZhcmlhYmxlIHRvIHRoZSBtZW51IHRvIG9wZW4gb24gcmlnaHQgY2xpY2suICovXG4gIEBJbnB1dCgnY2RrQ29udGV4dE1lbnVUcmlnZ2VyRm9yJylcbiAgZ2V0IG1lbnVQYW5lbCgpOiBDZGtNZW51UGFuZWwge1xuICAgIHJldHVybiB0aGlzLl9tZW51UGFuZWw7XG4gIH1cbiAgc2V0IG1lbnVQYW5lbChwYW5lbDogQ2RrTWVudVBhbmVsKSB7XG4gICAgdGhpcy5fbWVudVBhbmVsID0gcGFuZWw7XG5cbiAgICBpZiAodGhpcy5fbWVudVBhbmVsKSB7XG4gICAgICB0aGlzLl9tZW51UGFuZWwuX21lbnVTdGFjayA9IHRoaXMuX21lbnVTdGFjaztcbiAgICB9XG4gIH1cbiAgLyoqIFJlZmVyZW5jZSB0byB0aGUgTWVudVBhbmVsIHRoaXMgdHJpZ2dlciB0b2dnbGVzLiAqL1xuICBwcml2YXRlIF9tZW51UGFuZWw6IENka01lbnVQYW5lbDtcblxuICAvKiogRW1pdHMgd2hlbiB0aGUgYXR0YWNoZWQgbWVudSBpcyByZXF1ZXN0ZWQgdG8gb3Blbi4gKi9cbiAgQE91dHB1dCgnY2RrQ29udGV4dE1lbnVPcGVuZWQnKSByZWFkb25seSBvcGVuZWQ6IEV2ZW50RW1pdHRlcjx2b2lkPiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuICAvKiogRW1pdHMgd2hlbiB0aGUgYXR0YWNoZWQgbWVudSBpcyByZXF1ZXN0ZWQgdG8gY2xvc2UuICovXG4gIEBPdXRwdXQoJ2Nka0NvbnRleHRNZW51Q2xvc2VkJykgcmVhZG9ubHkgY2xvc2VkOiBFdmVudEVtaXR0ZXI8dm9pZD4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGNvbnRleHQgbWVudSBzaG91bGQgYmUgZGlzYWJsZWQuICovXG4gIEBJbnB1dCgnY2RrQ29udGV4dE1lbnVEaXNhYmxlZCcpXG4gIGdldCBkaXNhYmxlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5fZGlzYWJsZWQ7XG4gIH1cbiAgc2V0IGRpc2FibGVkKHZhbHVlOiBib29sZWFuKSB7XG4gICAgdGhpcy5fZGlzYWJsZWQgPSBjb2VyY2VCb29sZWFuUHJvcGVydHkodmFsdWUpO1xuICB9XG4gIHByaXZhdGUgX2Rpc2FibGVkID0gZmFsc2U7XG5cbiAgLyoqIEEgcmVmZXJlbmNlIHRvIHRoZSBvdmVybGF5IHdoaWNoIG1hbmFnZXMgdGhlIHRyaWdnZXJlZCBtZW51LiAqL1xuICBwcml2YXRlIF9vdmVybGF5UmVmOiBPdmVybGF5UmVmIHwgbnVsbCA9IG51bGw7XG5cbiAgLyoqIFRoZSBjb250ZW50IG9mIHRoZSBtZW51IHBhbmVsIG9wZW5lZCBieSB0aGlzIHRyaWdnZXIuICovXG4gIHByaXZhdGUgX3BhbmVsQ29udGVudDogVGVtcGxhdGVQb3J0YWw7XG5cbiAgLyoqIEVtaXRzIHdoZW4gdGhlIGVsZW1lbnQgaXMgZGVzdHJveWVkLiAqL1xuICBwcml2YXRlIHJlYWRvbmx5IF9kZXN0cm95ZWQ6IFN1YmplY3Q8dm9pZD4gPSBuZXcgU3ViamVjdCgpO1xuXG4gIC8qKiBSZWZlcmVuY2UgdG8gdGhlIGRvY3VtZW50LiAqL1xuICBwcml2YXRlIHJlYWRvbmx5IF9kb2N1bWVudDogRG9jdW1lbnQ7XG5cbiAgLyoqIEVtaXRzIHdoZW4gdGhlIGRvY3VtZW50IGxpc3RlbmVyIHNob3VsZCBzdG9wLiAqL1xuICBwcml2YXRlIHJlYWRvbmx5IF9zdG9wRG9jdW1lbnRMaXN0ZW5lciA9IG1lcmdlKHRoaXMuY2xvc2VkLCB0aGlzLl9kZXN0cm95ZWQpO1xuXG4gIC8qKiBUaGUgbWVudSBzdGFjayBmb3IgdGhpcyB0cmlnZ2VyIGFuZCBpdHMgYXNzb2NpYXRlZCBtZW51cy4gKi9cbiAgcHJpdmF0ZSByZWFkb25seSBfbWVudVN0YWNrID0gbmV3IE1lbnVTdGFjaygpO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByb3RlY3RlZCByZWFkb25seSBfdmlld0NvbnRhaW5lclJlZjogVmlld0NvbnRhaW5lclJlZixcbiAgICBwcml2YXRlIHJlYWRvbmx5IF9vdmVybGF5OiBPdmVybGF5LFxuICAgIHByaXZhdGUgcmVhZG9ubHkgX2NvbnRleHRNZW51VHJhY2tlcjogQ29udGV4dE1lbnVUcmFja2VyLFxuICAgIEBJbmplY3QoQ0RLX0NPTlRFWFRfTUVOVV9ERUZBVUxUX09QVElPTlMpIHByaXZhdGUgcmVhZG9ubHkgX29wdGlvbnM6IENvbnRleHRNZW51T3B0aW9ucyxcbiAgICBASW5qZWN0KERPQ1VNRU5UKSBkb2N1bWVudDogYW55LFxuICAgIEBPcHRpb25hbCgpIHByaXZhdGUgcmVhZG9ubHkgX2RpcmVjdGlvbmFsaXR5PzogRGlyZWN0aW9uYWxpdHlcbiAgKSB7XG4gICAgdGhpcy5fZG9jdW1lbnQgPSBkb2N1bWVudDtcblxuICAgIHRoaXMuX3NldE1lbnVTdGFja0xpc3RlbmVyKCk7XG4gIH1cblxuICAvKipcbiAgICogT3BlbiB0aGUgYXR0YWNoZWQgbWVudSBhdCB0aGUgc3BlY2lmaWVkIGxvY2F0aW9uLlxuICAgKiBAcGFyYW0gY29vcmRpbmF0ZXMgd2hlcmUgdG8gb3BlbiB0aGUgY29udGV4dCBtZW51XG4gICAqL1xuICBvcGVuKGNvb3JkaW5hdGVzOiBDb250ZXh0TWVudUNvb3JkaW5hdGVzKSB7XG4gICAgaWYgKHRoaXMuZGlzYWJsZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9IGVsc2UgaWYgKHRoaXMuaXNPcGVuKCkpIHtcbiAgICAgIC8vIHNpbmNlIHdlJ3JlIG1vdmluZyB0aGlzIG1lbnUgd2UgbmVlZCB0byBjbG9zZSBhbnkgc3VibWVudXMgZmlyc3Qgb3RoZXJ3aXNlIHRoZXkgZW5kIHVwXG4gICAgICAvLyBkaXNjb25uZWN0ZWQgZnJvbSB0aGlzIG9uZS5cbiAgICAgIHRoaXMuX21lbnVTdGFjay5jbG9zZVN1Yk1lbnVPZih0aGlzLl9tZW51UGFuZWwuX21lbnUhKTtcblxuICAgICAgKHRoaXMuX292ZXJsYXlSZWYhLmdldENvbmZpZygpXG4gICAgICAgIC5wb3NpdGlvblN0cmF0ZWd5IGFzIEZsZXhpYmxlQ29ubmVjdGVkUG9zaXRpb25TdHJhdGVneSkuc2V0T3JpZ2luKGNvb3JkaW5hdGVzKTtcbiAgICAgIHRoaXMuX292ZXJsYXlSZWYhLnVwZGF0ZVBvc2l0aW9uKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMub3BlbmVkLm5leHQoKTtcblxuICAgICAgaWYgKHRoaXMuX292ZXJsYXlSZWYpIHtcbiAgICAgICAgKHRoaXMuX292ZXJsYXlSZWYuZ2V0Q29uZmlnKClcbiAgICAgICAgICAucG9zaXRpb25TdHJhdGVneSBhcyBGbGV4aWJsZUNvbm5lY3RlZFBvc2l0aW9uU3RyYXRlZ3kpLnNldE9yaWdpbihjb29yZGluYXRlcyk7XG4gICAgICAgIHRoaXMuX292ZXJsYXlSZWYudXBkYXRlUG9zaXRpb24oKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX292ZXJsYXlSZWYgPSB0aGlzLl9vdmVybGF5LmNyZWF0ZSh0aGlzLl9nZXRPdmVybGF5Q29uZmlnKGNvb3JkaW5hdGVzKSk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX292ZXJsYXlSZWYuYXR0YWNoKHRoaXMuX2dldE1lbnVDb250ZW50KCkpO1xuICAgICAgdGhpcy5fc2V0Q2xvc2VMaXN0ZW5lcigpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBDbG9zZSB0aGUgb3BlbmVkIG1lbnUuICovXG4gIGNsb3NlKCkge1xuICAgIHRoaXMuX21lbnVTdGFjay5jbG9zZUFsbCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIE9wZW4gdGhlIGNvbnRleHQgbWVudSBhbmQgY2xvc2UgYW55IHByZXZpb3VzbHkgb3BlbiBtZW51cy5cbiAgICogQHBhcmFtIGV2ZW50IHRoZSBtb3VzZSBldmVudCB3aGljaCBvcGVucyB0aGUgY29udGV4dCBtZW51LlxuICAgKi9cbiAgX29wZW5PbkNvbnRleHRNZW51KGV2ZW50OiBNb3VzZUV2ZW50KSB7XG4gICAgaWYgKCF0aGlzLmRpc2FibGVkKSB7XG4gICAgICAvLyBQcmV2ZW50IHRoZSBuYXRpdmUgY29udGV4dCBtZW51IGZyb20gb3BlbmluZyBiZWNhdXNlIHdlJ3JlIG9wZW5pbmcgYSBjdXN0b20gb25lLlxuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgLy8gU3RvcCBldmVudCBwcm9wYWdhdGlvbiB0byBlbnN1cmUgdGhhdCBvbmx5IHRoZSBjbG9zZXN0IGVuYWJsZWQgY29udGV4dCBtZW51IG9wZW5zLlxuICAgICAgLy8gT3RoZXJ3aXNlLCBhbnkgY29udGV4dCBtZW51cyBhdHRhY2hlZCB0byBjb250YWluaW5nIGVsZW1lbnRzIHdvdWxkICphbHNvKiBvcGVuLFxuICAgICAgLy8gcmVzdWx0aW5nIGluIG11bHRpcGxlIHN0YWNrZWQgY29udGV4dCBtZW51cyBiZWluZyBkaXNwbGF5ZWQuXG4gICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgICAgdGhpcy5fY29udGV4dE1lbnVUcmFja2VyLnVwZGF0ZSh0aGlzKTtcbiAgICAgIHRoaXMub3Blbih7eDogZXZlbnQuY2xpZW50WCwgeTogZXZlbnQuY2xpZW50WX0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoZSBhdHRhY2hlZCBtZW51IGlzIG9wZW4uICovXG4gIGlzT3BlbigpIHtcbiAgICByZXR1cm4gISF0aGlzLl9vdmVybGF5UmVmPy5oYXNBdHRhY2hlZCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgY29uZmlndXJhdGlvbiBvYmplY3QgdXNlZCB0byBjcmVhdGUgdGhlIG92ZXJsYXkuXG4gICAqIEBwYXJhbSBjb29yZGluYXRlcyB0aGUgbG9jYXRpb24gdG8gcGxhY2UgdGhlIG9wZW5lZCBtZW51XG4gICAqL1xuICBwcml2YXRlIF9nZXRPdmVybGF5Q29uZmlnKGNvb3JkaW5hdGVzOiBDb250ZXh0TWVudUNvb3JkaW5hdGVzKSB7XG4gICAgcmV0dXJuIG5ldyBPdmVybGF5Q29uZmlnKHtcbiAgICAgIHBvc2l0aW9uU3RyYXRlZ3k6IHRoaXMuX2dldE92ZXJsYXlQb3NpdGlvblN0cmF0ZWd5KGNvb3JkaW5hdGVzKSxcbiAgICAgIHNjcm9sbFN0cmF0ZWd5OiB0aGlzLl9vdmVybGF5LnNjcm9sbFN0cmF0ZWdpZXMuYmxvY2soKSxcbiAgICAgIGRpcmVjdGlvbjogdGhpcy5fZGlyZWN0aW9uYWxpdHksXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQnVpbGQgdGhlIHBvc2l0aW9uIHN0cmF0ZWd5IGZvciB0aGUgb3ZlcmxheSB3aGljaCBzcGVjaWZpZXMgd2hlcmUgdG8gcGxhY2UgdGhlIG1lbnUuXG4gICAqIEBwYXJhbSBjb29yZGluYXRlcyB0aGUgbG9jYXRpb24gdG8gcGxhY2UgdGhlIG9wZW5lZCBtZW51XG4gICAqL1xuICBwcml2YXRlIF9nZXRPdmVybGF5UG9zaXRpb25TdHJhdGVneShcbiAgICBjb29yZGluYXRlczogQ29udGV4dE1lbnVDb29yZGluYXRlc1xuICApOiBGbGV4aWJsZUNvbm5lY3RlZFBvc2l0aW9uU3RyYXRlZ3kge1xuICAgIHJldHVybiB0aGlzLl9vdmVybGF5XG4gICAgICAucG9zaXRpb24oKVxuICAgICAgLmZsZXhpYmxlQ29ubmVjdGVkVG8oY29vcmRpbmF0ZXMpXG4gICAgICAud2l0aERlZmF1bHRPZmZzZXRYKHRoaXMuX29wdGlvbnMub2Zmc2V0WClcbiAgICAgIC53aXRoRGVmYXVsdE9mZnNldFkodGhpcy5fb3B0aW9ucy5vZmZzZXRZKVxuICAgICAgLndpdGhQb3NpdGlvbnModGhpcy5fZ2V0T3ZlcmxheVBvc2l0aW9ucygpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXRlcm1pbmUgYW5kIHJldHVybiB3aGVyZSB0byBwb3NpdGlvbiB0aGUgb3BlbmVkIG1lbnUgcmVsYXRpdmUgdG8gdGhlIG1vdXNlIGxvY2F0aW9uLlxuICAgKi9cbiAgcHJpdmF0ZSBfZ2V0T3ZlcmxheVBvc2l0aW9ucygpOiBDb25uZWN0ZWRQb3NpdGlvbltdIHtcbiAgICAvLyBUT0RPOiB0aGlzIHNob3VsZCBiZSBjb25maWd1cmFibGUgdGhyb3VnaCB0aGUgaW5qZWN0ZWQgY29udGV4dCBtZW51IG9wdGlvbnNcbiAgICByZXR1cm4gW1xuICAgICAge29yaWdpblg6ICdlbmQnLCBvcmlnaW5ZOiAndG9wJywgb3ZlcmxheVg6ICdzdGFydCcsIG92ZXJsYXlZOiAndG9wJ30sXG4gICAgICB7b3JpZ2luWDogJ3N0YXJ0Jywgb3JpZ2luWTogJ3RvcCcsIG92ZXJsYXlYOiAnZW5kJywgb3ZlcmxheVk6ICd0b3AnfSxcbiAgICAgIHtvcmlnaW5YOiAnZW5kJywgb3JpZ2luWTogJ2JvdHRvbScsIG92ZXJsYXlYOiAnc3RhcnQnLCBvdmVybGF5WTogJ2JvdHRvbSd9LFxuICAgICAge29yaWdpblg6ICdzdGFydCcsIG9yaWdpblk6ICdib3R0b20nLCBvdmVybGF5WDogJ2VuZCcsIG92ZXJsYXlZOiAnYm90dG9tJ30sXG4gICAgXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIHBvcnRhbCB0byBiZSBhdHRhY2hlZCB0byB0aGUgb3ZlcmxheSB3aGljaCBjb250YWlucyB0aGUgbWVudS4gQWxsb3dzIGZvciB0aGUgbWVudVxuICAgKiBjb250ZW50IHRvIGNoYW5nZSBkeW5hbWljYWxseSBhbmQgYmUgcmVmbGVjdGVkIGluIHRoZSBhcHBsaWNhdGlvbi5cbiAgICovXG4gIHByaXZhdGUgX2dldE1lbnVDb250ZW50KCk6IFBvcnRhbDx1bmtub3duPiB7XG4gICAgY29uc3QgaGFzTWVudUNvbnRlbnRDaGFuZ2VkID0gdGhpcy5tZW51UGFuZWwuX3RlbXBsYXRlUmVmICE9PSB0aGlzLl9wYW5lbENvbnRlbnQ/LnRlbXBsYXRlUmVmO1xuICAgIGlmICh0aGlzLm1lbnVQYW5lbCAmJiAoIXRoaXMuX3BhbmVsQ29udGVudCB8fCBoYXNNZW51Q29udGVudENoYW5nZWQpKSB7XG4gICAgICB0aGlzLl9wYW5lbENvbnRlbnQgPSBuZXcgVGVtcGxhdGVQb3J0YWwodGhpcy5tZW51UGFuZWwuX3RlbXBsYXRlUmVmLCB0aGlzLl92aWV3Q29udGFpbmVyUmVmKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fcGFuZWxDb250ZW50O1xuICB9XG5cbiAgLyoqXG4gICAqIFN1YnNjcmliZSB0byB0aGUgZG9jdW1lbnQgY2xpY2sgYW5kIGNvbnRleHQgbWVudSBldmVudHMgYW5kIGNsb3NlIG91dCB0aGUgbWVudSB3aGVuIGVtaXR0ZWQuXG4gICAqL1xuICBwcml2YXRlIF9zZXRDbG9zZUxpc3RlbmVyKCkge1xuICAgIG1lcmdlKGZyb21FdmVudCh0aGlzLl9kb2N1bWVudCwgJ2NsaWNrJyksIGZyb21FdmVudCh0aGlzLl9kb2N1bWVudCwgJ2NvbnRleHRtZW51JykpXG4gICAgICAucGlwZSh0YWtlVW50aWwodGhpcy5fc3RvcERvY3VtZW50TGlzdGVuZXIpKVxuICAgICAgLnN1YnNjcmliZShldmVudCA9PiB7XG4gICAgICAgIGNvbnN0IHRhcmdldCA9IGV2ZW50LmNvbXBvc2VkUGF0aCA/IGV2ZW50LmNvbXBvc2VkUGF0aCgpWzBdIDogZXZlbnQudGFyZ2V0O1xuICAgICAgICAvLyBzdG9wIHRoZSBkZWZhdWx0IGNvbnRleHQgbWVudSBmcm9tIGFwcGVhcmluZyBpZiB1c2VyIHJpZ2h0LWNsaWNrZWQgc29tZXdoZXJlIG91dHNpZGUgb2ZcbiAgICAgICAgLy8gYW55IGNvbnRleHQgbWVudSBkaXJlY3RpdmUgb3IgaWYgYSB1c2VyIHJpZ2h0LWNsaWNrZWQgaW5zaWRlIG9mIHRoZSBvcGVuZWQgbWVudSBhbmQganVzdFxuICAgICAgICAvLyBjbG9zZSBpdC5cbiAgICAgICAgaWYgKGV2ZW50LnR5cGUgPT09ICdjb250ZXh0bWVudScpIHtcbiAgICAgICAgICBpZiAodGFyZ2V0IGluc3RhbmNlb2YgRWxlbWVudCAmJiBpc1dpdGhpbk1lbnVFbGVtZW50KHRhcmdldCkpIHtcbiAgICAgICAgICAgIC8vIFByZXZlbnQgdGhlIG5hdGl2ZSBjb250ZXh0IG1lbnUgZnJvbSBvcGVuaW5nIHdpdGhpbiBhbnkgb3BlbiBjb250ZXh0IG1lbnUgb3Igc3VibWVudVxuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5jbG9zZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAodGFyZ2V0IGluc3RhbmNlb2YgRWxlbWVudCAmJiAhaXNXaXRoaW5NZW51RWxlbWVudCh0YXJnZXQpKSB7XG4gICAgICAgICAgICB0aGlzLmNsb3NlKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgfVxuXG4gIC8qKiBTdWJzY3JpYmUgdG8gdGhlIG1lbnUgc3RhY2sgY2xvc2UgZXZlbnRzIGFuZCBjbG9zZSB0aGlzIG1lbnUgd2hlbiByZXF1ZXN0ZWQuICovXG4gIHByaXZhdGUgX3NldE1lbnVTdGFja0xpc3RlbmVyKCkge1xuICAgIHRoaXMuX21lbnVTdGFjay5jbG9zZWQucGlwZSh0YWtlVW50aWwodGhpcy5fZGVzdHJveWVkKSkuc3Vic2NyaWJlKChpdGVtOiBNZW51U3RhY2tJdGVtKSA9PiB7XG4gICAgICBpZiAoaXRlbSA9PT0gdGhpcy5fbWVudVBhbmVsLl9tZW51ICYmIHRoaXMuaXNPcGVuKCkpIHtcbiAgICAgICAgdGhpcy5jbG9zZWQubmV4dCgpO1xuICAgICAgICB0aGlzLl9vdmVybGF5UmVmIS5kZXRhY2goKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIHRoaXMuX2Rlc3Ryb3lPdmVybGF5KCk7XG5cbiAgICB0aGlzLl9kZXN0cm95ZWQubmV4dCgpO1xuICAgIHRoaXMuX2Rlc3Ryb3llZC5jb21wbGV0ZSgpO1xuICB9XG5cbiAgLyoqIERlc3Ryb3kgYW5kIHVuc2V0IHRoZSBvdmVybGF5IHJlZmVyZW5jZSBpdCBpZiBleGlzdHMuICovXG4gIHByaXZhdGUgX2Rlc3Ryb3lPdmVybGF5KCkge1xuICAgIGlmICh0aGlzLl9vdmVybGF5UmVmKSB7XG4gICAgICB0aGlzLl9vdmVybGF5UmVmLmRpc3Bvc2UoKTtcbiAgICAgIHRoaXMuX292ZXJsYXlSZWYgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9kaXNhYmxlZDogQm9vbGVhbklucHV0O1xufVxuIl19