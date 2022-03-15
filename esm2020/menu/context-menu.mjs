/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, EventEmitter, Inject, Injectable, InjectionToken, Injector, Input, Optional, Output, TemplateRef, ViewContainerRef, } from '@angular/core';
import { Directionality } from '@angular/cdk/bidi';
import { Overlay, OverlayConfig, } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { merge, partition, Subject } from 'rxjs';
import { skip, takeUntil } from 'rxjs/operators';
import { MENU_STACK, MenuStack } from './menu-stack';
import { isClickInsideMenuOverlay } from './menu-item-trigger';
import { MENU_TRIGGER, MenuTrigger } from './menu-trigger';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/overlay";
import * as i2 from "@angular/cdk/bidi";
import * as i3 from "./menu-stack";
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
ContextMenuTracker.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.0.0-next.6", ngImport: i0, type: ContextMenuTracker, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
ContextMenuTracker.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "14.0.0-next.6", ngImport: i0, type: ContextMenuTracker, providedIn: 'root' });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.0.0-next.6", ngImport: i0, type: ContextMenuTracker, decorators: [{
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
export class CdkContextMenuTrigger extends MenuTrigger {
    constructor(injector, _viewContainerRef, _overlay, _contextMenuTracker, menuStack, _options, _directionality) {
        super(injector, menuStack);
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
        /** Emits when the outside pointer events listener on the overlay should be stopped. */
        this._stopOutsideClicksListener = merge(this.closed, this._destroyed);
        this._setMenuStackListener();
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
        this._open(coordinates, false);
    }
    _open(coordinates, ignoreFirstOutsideAuxClick) {
        if (this.disabled) {
            return;
        }
        else if (this.isOpen()) {
            // since we're moving this menu we need to close any submenus first otherwise they end up
            // disconnected from this one.
            this.menuStack.closeSubMenuOf(this.childMenu);
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
            this._subscribeToOutsideClicks(ignoreFirstOutsideAuxClick);
        }
    }
    /** Close the opened menu. */
    close() {
        this.menuStack.closeAll();
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
            this._open({ x: event.clientX, y: event.clientY }, true);
            // A context menu can be triggered via a mouse right click or a keyboard shortcut.
            if (event.button === 2) {
                this.childMenu?.focusFirstItem('mouse');
            }
            else if (event.button === 0) {
                this.childMenu?.focusFirstItem('keyboard');
            }
            else {
                this.childMenu?.focusFirstItem('program');
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
        const hasMenuContentChanged = this._menuTemplateRef !== this._menuPortal?.templateRef;
        if (this._menuTemplateRef && (!this._menuPortal || hasMenuContentChanged)) {
            this._menuPortal = new TemplatePortal(this._menuTemplateRef, this._viewContainerRef, undefined, this.getChildMenuInjector());
        }
        return this._menuPortal;
    }
    /** Subscribe to the menu stack close events and close this menu when requested. */
    _setMenuStackListener() {
        this.menuStack.closed.pipe(takeUntil(this._destroyed)).subscribe(item => {
            if (item === this.childMenu && this.isOpen()) {
                this.closed.next();
                this._overlayRef.detach();
            }
        });
    }
    /**
     * Subscribe to the overlays outside pointer events stream and handle closing out the stack if a
     * click occurs outside the menus.
     */
    _subscribeToOutsideClicks(ignoreFirstAuxClick) {
        if (this._overlayRef) {
            let outsideClicks = this._overlayRef.outsidePointerEvents();
            // If the menu was triggered by the `contextmenu` event, skip the first `auxclick` event
            // because it fires when the mouse is released on the same click that opened the menu.
            if (ignoreFirstAuxClick) {
                const [auxClicks, nonAuxClicks] = partition(outsideClicks, ({ type }) => type === 'auxclick');
                outsideClicks = merge(nonAuxClicks, auxClicks.pipe(skip(1)));
            }
            outsideClicks.pipe(takeUntil(this._stopOutsideClicksListener)).subscribe(event => {
                if (!isClickInsideMenuOverlay(event.target)) {
                    this.menuStack.closeAll();
                }
            });
        }
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
CdkContextMenuTrigger.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.0.0-next.6", ngImport: i0, type: CdkContextMenuTrigger, deps: [{ token: i0.Injector }, { token: i0.ViewContainerRef }, { token: i1.Overlay }, { token: ContextMenuTracker }, { token: MENU_STACK }, { token: CDK_CONTEXT_MENU_DEFAULT_OPTIONS }, { token: i2.Directionality, optional: true }], target: i0.ɵɵFactoryTarget.Directive });
CdkContextMenuTrigger.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "14.0.0-next.6", type: CdkContextMenuTrigger, selector: "[cdkContextMenuTriggerFor]", inputs: { _menuTemplateRef: ["cdkContextMenuTriggerFor", "_menuTemplateRef"], disabled: ["cdkContextMenuDisabled", "disabled"] }, outputs: { opened: "cdkContextMenuOpened", closed: "cdkContextMenuClosed" }, host: { listeners: { "contextmenu": "_openOnContextMenu($event)" } }, providers: [
        // In cases where the first menu item in the context menu is a trigger the submenu opens on a
        // hover event. Offsetting the opened context menu by 2px prevents this from occurring.
        { provide: CDK_CONTEXT_MENU_DEFAULT_OPTIONS, useValue: { offsetX: 2, offsetY: 2 } },
        { provide: MENU_TRIGGER, useExisting: CdkContextMenuTrigger },
        { provide: MENU_STACK, useClass: MenuStack },
    ], exportAs: ["cdkContextMenuTriggerFor"], usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.0.0-next.6", ngImport: i0, type: CdkContextMenuTrigger, decorators: [{
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
                        { provide: MENU_TRIGGER, useExisting: CdkContextMenuTrigger },
                        { provide: MENU_STACK, useClass: MenuStack },
                    ],
                }]
        }], ctorParameters: function () { return [{ type: i0.Injector }, { type: i0.ViewContainerRef }, { type: i1.Overlay }, { type: ContextMenuTracker }, { type: i3.MenuStack, decorators: [{
                    type: Inject,
                    args: [MENU_STACK]
                }] }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [CDK_CONTEXT_MENU_DEFAULT_OPTIONS]
                }] }, { type: i2.Directionality, decorators: [{
                    type: Optional
                }] }]; }, propDecorators: { _menuTemplateRef: [{
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGV4dC1tZW51LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvbWVudS9jb250ZXh0LW1lbnUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUNMLFNBQVMsRUFDVCxZQUFZLEVBQ1osTUFBTSxFQUNOLFVBQVUsRUFDVixjQUFjLEVBQ2QsUUFBUSxFQUNSLEtBQUssRUFFTCxRQUFRLEVBQ1IsTUFBTSxFQUNOLFdBQVcsRUFDWCxnQkFBZ0IsR0FDakIsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQ2pELE9BQU8sRUFHTCxPQUFPLEVBQ1AsYUFBYSxHQUVkLE1BQU0sc0JBQXNCLENBQUM7QUFDOUIsT0FBTyxFQUFTLGNBQWMsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQzNELE9BQU8sRUFBZSxxQkFBcUIsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQzFFLE9BQU8sRUFBQyxLQUFLLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUMvQyxPQUFPLEVBQUMsSUFBSSxFQUFFLFNBQVMsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQy9DLE9BQU8sRUFBQyxVQUFVLEVBQUUsU0FBUyxFQUFDLE1BQU0sY0FBYyxDQUFDO0FBQ25ELE9BQU8sRUFBQyx3QkFBd0IsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQzdELE9BQU8sRUFBQyxZQUFZLEVBQUUsV0FBVyxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7Ozs7O0FBRXpELCtFQUErRTtBQUUvRSxNQUFNLE9BQU8sa0JBQWtCO0lBSTdCOzs7T0FHRztJQUNILE1BQU0sQ0FBQyxPQUE4QjtRQUNuQyxJQUFJLGtCQUFrQixDQUFDLHVCQUF1QixLQUFLLE9BQU8sRUFBRTtZQUMxRCxrQkFBa0IsQ0FBQyx1QkFBdUIs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QUMsRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFDLEVBQUM7UUFDL0UsRUFBQyxPQUFPLEVBQUUsWUFBWSxFQUFFLFdBQVcsRUFBRSxxQkFBcUIsRUFBQztRQUMzRCxFQUFDLE9BQU8sRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBQztLQUMzQztrR0FFVSxxQkFBcUI7a0JBZGpDLFNBQVM7bUJBQUM7b0JBQ1QsUUFBUSxFQUFFLDRCQUE0QjtvQkFDdEMsUUFBUSxFQUFFLDBCQUEwQjtvQkFDcEMsSUFBSSxFQUFFO3dCQUNKLGVBQWUsRUFBRSw0QkFBNEI7cUJBQzlDO29CQUNELFNBQVMsRUFBRTt3QkFDVCw2RkFBNkY7d0JBQzdGLHVGQUF1Rjt3QkFDdkYsRUFBQyxPQUFPLEVBQUUsZ0NBQWdDLEVBQUUsUUFBUSxFQUFFLEVBQUMsT0FBTyxFQUFFLENBQUMsRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFDLEVBQUM7d0JBQy9FLEVBQUMsT0FBTyxFQUFFLFlBQVksRUFBRSxXQUFXLHVCQUF1QixFQUFDO3dCQUMzRCxFQUFDLE9BQU8sRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBQztxQkFDM0M7aUJBQ0Y7c0lBc0N5QyxrQkFBa0I7MEJBQ3ZELE1BQU07MkJBQUMsVUFBVTs7MEJBQ2pCLE1BQU07MkJBQUMsZ0NBQWdDOzswQkFDdkMsUUFBUTs0Q0FyQ0gsZ0JBQWdCO3NCQUR2QixLQUFLO3VCQUFDLDBCQUEwQjtnQkFJUSxNQUFNO3NCQUE5QyxNQUFNO3VCQUFDLHNCQUFzQjtnQkFHVyxNQUFNO3NCQUE5QyxNQUFNO3VCQUFDLHNCQUFzQjtnQkFJMUIsUUFBUTtzQkFEWCxLQUFLO3VCQUFDLHdCQUF3QiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1xuICBEaXJlY3RpdmUsXG4gIEV2ZW50RW1pdHRlcixcbiAgSW5qZWN0LFxuICBJbmplY3RhYmxlLFxuICBJbmplY3Rpb25Ub2tlbixcbiAgSW5qZWN0b3IsXG4gIElucHV0LFxuICBPbkRlc3Ryb3ksXG4gIE9wdGlvbmFsLFxuICBPdXRwdXQsXG4gIFRlbXBsYXRlUmVmLFxuICBWaWV3Q29udGFpbmVyUmVmLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7RGlyZWN0aW9uYWxpdHl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9iaWRpJztcbmltcG9ydCB7XG4gIENvbm5lY3RlZFBvc2l0aW9uLFxuICBGbGV4aWJsZUNvbm5lY3RlZFBvc2l0aW9uU3RyYXRlZ3ksXG4gIE92ZXJsYXksXG4gIE92ZXJsYXlDb25maWcsXG4gIE92ZXJsYXlSZWYsXG59IGZyb20gJ0Bhbmd1bGFyL2Nkay9vdmVybGF5JztcbmltcG9ydCB7UG9ydGFsLCBUZW1wbGF0ZVBvcnRhbH0gZnJvbSAnQGFuZ3VsYXIvY2RrL3BvcnRhbCc7XG5pbXBvcnQge0Jvb2xlYW5JbnB1dCwgY29lcmNlQm9vbGVhblByb3BlcnR5fSBmcm9tICdAYW5ndWxhci9jZGsvY29lcmNpb24nO1xuaW1wb3J0IHttZXJnZSwgcGFydGl0aW9uLCBTdWJqZWN0fSBmcm9tICdyeGpzJztcbmltcG9ydCB7c2tpcCwgdGFrZVVudGlsfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5pbXBvcnQge01FTlVfU1RBQ0ssIE1lbnVTdGFja30gZnJvbSAnLi9tZW51LXN0YWNrJztcbmltcG9ydCB7aXNDbGlja0luc2lkZU1lbnVPdmVybGF5fSBmcm9tICcuL21lbnUtaXRlbS10cmlnZ2VyJztcbmltcG9ydCB7TUVOVV9UUklHR0VSLCBNZW51VHJpZ2dlcn0gZnJvbSAnLi9tZW51LXRyaWdnZXInO1xuXG4vKiogVHJhY2tzIHRoZSBsYXN0IG9wZW4gY29udGV4dCBtZW51IHRyaWdnZXIgYWNyb3NzIHRoZSBlbnRpcmUgYXBwbGljYXRpb24uICovXG5ASW5qZWN0YWJsZSh7cHJvdmlkZWRJbjogJ3Jvb3QnfSlcbmV4cG9ydCBjbGFzcyBDb250ZXh0TWVudVRyYWNrZXIge1xuICAvKiogVGhlIGxhc3Qgb3BlbiBjb250ZXh0IG1lbnUgdHJpZ2dlci4gKi9cbiAgcHJpdmF0ZSBzdGF0aWMgX29wZW5Db250ZXh0TWVudVRyaWdnZXI/OiBDZGtDb250ZXh0TWVudVRyaWdnZXI7XG5cbiAgLyoqXG4gICAqIENsb3NlIHRoZSBwcmV2aW91cyBvcGVuIGNvbnRleHQgbWVudSBhbmQgc2V0IHRoZSBnaXZlbiBvbmUgYXMgYmVpbmcgb3Blbi5cbiAgICogQHBhcmFtIHRyaWdnZXIgdGhlIHRyaWdnZXIgZm9yIHRoZSBjdXJyZW50bHkgb3BlbiBDb250ZXh0IE1lbnUuXG4gICAqL1xuICB1cGRhdGUodHJpZ2dlcjogQ2RrQ29udGV4dE1lbnVUcmlnZ2VyKSB7XG4gICAgaWYgKENvbnRleHRNZW51VHJhY2tlci5fb3BlbkNvbnRleHRNZW51VHJpZ2dlciAhPT0gdHJpZ2dlcikge1xuICAgICAgQ29udGV4dE1lbnVUcmFja2VyLl9vcGVuQ29udGV4dE1lbnVUcmlnZ2VyPy5jbG9zZSgpO1xuICAgICAgQ29udGV4dE1lbnVUcmFja2VyLl9vcGVuQ29udGV4dE1lbnVUcmlnZ2VyID0gdHJpZ2dlcjtcbiAgICB9XG4gIH1cbn1cblxuLyoqIENvbmZpZ3VyYXRpb24gb3B0aW9ucyBwYXNzZWQgdG8gdGhlIGNvbnRleHQgbWVudS4gKi9cbmV4cG9ydCB0eXBlIENvbnRleHRNZW51T3B0aW9ucyA9IHtcbiAgLyoqIFRoZSBvcGVuZWQgbWVudXMgWCBjb29yZGluYXRlIG9mZnNldCBmcm9tIHRoZSB0cmlnZ2VyaW5nIHBvc2l0aW9uLiAqL1xuICBvZmZzZXRYOiBudW1iZXI7XG5cbiAgLyoqIFRoZSBvcGVuZWQgbWVudXMgWSBjb29yZGluYXRlIG9mZnNldCBmcm9tIHRoZSB0cmlnZ2VyaW5nIHBvc2l0aW9uLiAqL1xuICBvZmZzZXRZOiBudW1iZXI7XG59O1xuXG4vKiogSW5qZWN0aW9uIHRva2VuIGZvciB0aGUgQ29udGV4dE1lbnUgb3B0aW9ucyBvYmplY3QuICovXG5leHBvcnQgY29uc3QgQ0RLX0NPTlRFWFRfTUVOVV9ERUZBVUxUX09QVElPTlMgPSBuZXcgSW5qZWN0aW9uVG9rZW48Q29udGV4dE1lbnVPcHRpb25zPihcbiAgJ2Nkay1jb250ZXh0LW1lbnUtZGVmYXVsdC1vcHRpb25zJyxcbik7XG5cbi8qKiBUaGUgY29vcmRpbmF0ZXMgb2Ygd2hlcmUgdGhlIGNvbnRleHQgbWVudSBzaG91bGQgb3Blbi4gKi9cbmV4cG9ydCB0eXBlIENvbnRleHRNZW51Q29vcmRpbmF0ZXMgPSB7eDogbnVtYmVyOyB5OiBudW1iZXJ9O1xuXG4vKipcbiAqIEEgZGlyZWN0aXZlIHdoaWNoIHdoZW4gcGxhY2VkIG9uIHNvbWUgZWxlbWVudCBvcGVucyBhIHRoZSBNZW51IGl0IGlzIGJvdW5kIHRvIHdoZW4gYSB1c2VyXG4gKiByaWdodC1jbGlja3Mgd2l0aGluIHRoYXQgZWxlbWVudC4gSXQgaXMgYXdhcmUgb2YgbmVzdGVkIENvbnRleHQgTWVudXMgYW5kIHRoZSBsb3dlc3QgbGV2ZWxcbiAqIG5vbi1kaXNhYmxlZCBjb250ZXh0IG1lbnUgd2lsbCB0cmlnZ2VyLlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbY2RrQ29udGV4dE1lbnVUcmlnZ2VyRm9yXScsXG4gIGV4cG9ydEFzOiAnY2RrQ29udGV4dE1lbnVUcmlnZ2VyRm9yJyxcbiAgaG9zdDoge1xuICAgICcoY29udGV4dG1lbnUpJzogJ19vcGVuT25Db250ZXh0TWVudSgkZXZlbnQpJyxcbiAgfSxcbiAgcHJvdmlkZXJzOiBbXG4gICAgLy8gSW4gY2FzZXMgd2hlcmUgdGhlIGZpcnN0IG1lbnUgaXRlbSBpbiB0aGUgY29udGV4dCBtZW51IGlzIGEgdHJpZ2dlciB0aGUgc3VibWVudSBvcGVucyBvbiBhXG4gICAgLy8gaG92ZXIgZXZlbnQuIE9mZnNldHRpbmcgdGhlIG9wZW5lZCBjb250ZXh0IG1lbnUgYnkgMnB4IHByZXZlbnRzIHRoaXMgZnJvbSBvY2N1cnJpbmcuXG4gICAge3Byb3ZpZGU6IENES19DT05URVhUX01FTlVfREVGQVVMVF9PUFRJT05TLCB1c2VWYWx1ZToge29mZnNldFg6IDIsIG9mZnNldFk6IDJ9fSxcbiAgICB7cHJvdmlkZTogTUVOVV9UUklHR0VSLCB1c2VFeGlzdGluZzogQ2RrQ29udGV4dE1lbnVUcmlnZ2VyfSxcbiAgICB7cHJvdmlkZTogTUVOVV9TVEFDSywgdXNlQ2xhc3M6IE1lbnVTdGFja30sXG4gIF0sXG59KVxuZXhwb3J0IGNsYXNzIENka0NvbnRleHRNZW51VHJpZ2dlciBleHRlbmRzIE1lbnVUcmlnZ2VyIGltcGxlbWVudHMgT25EZXN0cm95IHtcbiAgLyoqIFRlbXBsYXRlIHJlZmVyZW5jZSB2YXJpYWJsZSB0byB0aGUgbWVudSB0byBvcGVuIG9uIHJpZ2h0IGNsaWNrLiAqL1xuICBASW5wdXQoJ2Nka0NvbnRleHRNZW51VHJpZ2dlckZvcicpXG4gIHByaXZhdGUgX21lbnVUZW1wbGF0ZVJlZjogVGVtcGxhdGVSZWY8dW5rbm93bj47XG5cbiAgLyoqIEVtaXRzIHdoZW4gdGhlIGF0dGFjaGVkIG1lbnUgaXMgcmVxdWVzdGVkIHRvIG9wZW4uICovXG4gIEBPdXRwdXQoJ2Nka0NvbnRleHRNZW51T3BlbmVkJykgcmVhZG9ubHkgb3BlbmVkOiBFdmVudEVtaXR0ZXI8dm9pZD4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG5cbiAgLyoqIEVtaXRzIHdoZW4gdGhlIGF0dGFjaGVkIG1lbnUgaXMgcmVxdWVzdGVkIHRvIGNsb3NlLiAqL1xuICBAT3V0cHV0KCdjZGtDb250ZXh0TWVudUNsb3NlZCcpIHJlYWRvbmx5IGNsb3NlZDogRXZlbnRFbWl0dGVyPHZvaWQ+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSBjb250ZXh0IG1lbnUgc2hvdWxkIGJlIGRpc2FibGVkLiAqL1xuICBASW5wdXQoJ2Nka0NvbnRleHRNZW51RGlzYWJsZWQnKVxuICBnZXQgZGlzYWJsZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2Rpc2FibGVkO1xuICB9XG4gIHNldCBkaXNhYmxlZCh2YWx1ZTogQm9vbGVhbklucHV0KSB7XG4gICAgdGhpcy5fZGlzYWJsZWQgPSBjb2VyY2VCb29sZWFuUHJvcGVydHkodmFsdWUpO1xuICB9XG4gIHByaXZhdGUgX2Rpc2FibGVkID0gZmFsc2U7XG5cbiAgLyoqIEEgcmVmZXJlbmNlIHRvIHRoZSBvdmVybGF5IHdoaWNoIG1hbmFnZXMgdGhlIHRyaWdnZXJlZCBtZW51LiAqL1xuICBwcml2YXRlIF9vdmVybGF5UmVmOiBPdmVybGF5UmVmIHwgbnVsbCA9IG51bGw7XG5cbiAgLyoqIFRoZSBjb250ZW50IG9mIHRoZSBtZW51IHBhbmVsIG9wZW5lZCBieSB0aGlzIHRyaWdnZXIuICovXG4gIHByaXZhdGUgX21lbnVQb3J0YWw6IFRlbXBsYXRlUG9ydGFsO1xuXG4gIC8qKiBFbWl0cyB3aGVuIHRoZSBlbGVtZW50IGlzIGRlc3Ryb3llZC4gKi9cbiAgcHJpdmF0ZSByZWFkb25seSBfZGVzdHJveWVkID0gbmV3IFN1YmplY3Q8dm9pZD4oKTtcblxuICAvKiogRW1pdHMgd2hlbiB0aGUgb3V0c2lkZSBwb2ludGVyIGV2ZW50cyBsaXN0ZW5lciBvbiB0aGUgb3ZlcmxheSBzaG91bGQgYmUgc3RvcHBlZC4gKi9cbiAgcHJpdmF0ZSByZWFkb25seSBfc3RvcE91dHNpZGVDbGlja3NMaXN0ZW5lciA9IG1lcmdlKHRoaXMuY2xvc2VkLCB0aGlzLl9kZXN0cm95ZWQpO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIGluamVjdG9yOiBJbmplY3RvcixcbiAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgX3ZpZXdDb250YWluZXJSZWY6IFZpZXdDb250YWluZXJSZWYsXG4gICAgcHJpdmF0ZSByZWFkb25seSBfb3ZlcmxheTogT3ZlcmxheSxcbiAgICBwcml2YXRlIHJlYWRvbmx5IF9jb250ZXh0TWVudVRyYWNrZXI6IENvbnRleHRNZW51VHJhY2tlcixcbiAgICBASW5qZWN0KE1FTlVfU1RBQ0spIG1lbnVTdGFjazogTWVudVN0YWNrLFxuICAgIEBJbmplY3QoQ0RLX0NPTlRFWFRfTUVOVV9ERUZBVUxUX09QVElPTlMpIHByaXZhdGUgcmVhZG9ubHkgX29wdGlvbnM6IENvbnRleHRNZW51T3B0aW9ucyxcbiAgICBAT3B0aW9uYWwoKSBwcml2YXRlIHJlYWRvbmx5IF9kaXJlY3Rpb25hbGl0eT86IERpcmVjdGlvbmFsaXR5LFxuICApIHtcbiAgICBzdXBlcihpbmplY3RvciwgbWVudVN0YWNrKTtcbiAgICB0aGlzLl9zZXRNZW51U3RhY2tMaXN0ZW5lcigpO1xuICB9XG5cbiAgLyoqXG4gICAqIE9wZW4gdGhlIGF0dGFjaGVkIG1lbnUgYXQgdGhlIHNwZWNpZmllZCBsb2NhdGlvbi5cbiAgICogQHBhcmFtIGNvb3JkaW5hdGVzIHdoZXJlIHRvIG9wZW4gdGhlIGNvbnRleHQgbWVudVxuICAgKi9cbiAgb3Blbihjb29yZGluYXRlczogQ29udGV4dE1lbnVDb29yZGluYXRlcykge1xuICAgIHRoaXMuX29wZW4oY29vcmRpbmF0ZXMsIGZhbHNlKTtcbiAgfVxuXG4gIHByaXZhdGUgX29wZW4oY29vcmRpbmF0ZXM6IENvbnRleHRNZW51Q29vcmRpbmF0ZXMsIGlnbm9yZUZpcnN0T3V0c2lkZUF1eENsaWNrOiBib29sZWFuKSB7XG4gICAgaWYgKHRoaXMuZGlzYWJsZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9IGVsc2UgaWYgKHRoaXMuaXNPcGVuKCkpIHtcbiAgICAgIC8vIHNpbmNlIHdlJ3JlIG1vdmluZyB0aGlzIG1lbnUgd2UgbmVlZCB0byBjbG9zZSBhbnkgc3VibWVudXMgZmlyc3Qgb3RoZXJ3aXNlIHRoZXkgZW5kIHVwXG4gICAgICAvLyBkaXNjb25uZWN0ZWQgZnJvbSB0aGlzIG9uZS5cbiAgICAgIHRoaXMubWVudVN0YWNrLmNsb3NlU3ViTWVudU9mKHRoaXMuY2hpbGRNZW51ISk7XG5cbiAgICAgIChcbiAgICAgICAgdGhpcy5fb3ZlcmxheVJlZiEuZ2V0Q29uZmlnKCkucG9zaXRpb25TdHJhdGVneSBhcyBGbGV4aWJsZUNvbm5lY3RlZFBvc2l0aW9uU3RyYXRlZ3lcbiAgICAgICkuc2V0T3JpZ2luKGNvb3JkaW5hdGVzKTtcbiAgICAgIHRoaXMuX292ZXJsYXlSZWYhLnVwZGF0ZVBvc2l0aW9uKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMub3BlbmVkLm5leHQoKTtcblxuICAgICAgaWYgKHRoaXMuX292ZXJsYXlSZWYpIHtcbiAgICAgICAgKFxuICAgICAgICAgIHRoaXMuX292ZXJsYXlSZWYuZ2V0Q29uZmlnKCkucG9zaXRpb25TdHJhdGVneSBhcyBGbGV4aWJsZUNvbm5lY3RlZFBvc2l0aW9uU3RyYXRlZ3lcbiAgICAgICAgKS5zZXRPcmlnaW4oY29vcmRpbmF0ZXMpO1xuICAgICAgICB0aGlzLl9vdmVybGF5UmVmLnVwZGF0ZVBvc2l0aW9uKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9vdmVybGF5UmVmID0gdGhpcy5fb3ZlcmxheS5jcmVhdGUodGhpcy5fZ2V0T3ZlcmxheUNvbmZpZyhjb29yZGluYXRlcykpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9vdmVybGF5UmVmLmF0dGFjaCh0aGlzLl9nZXRNZW51Q29udGVudCgpKTtcbiAgICAgIHRoaXMuX3N1YnNjcmliZVRvT3V0c2lkZUNsaWNrcyhpZ25vcmVGaXJzdE91dHNpZGVBdXhDbGljayk7XG4gICAgfVxuICB9XG5cbiAgLyoqIENsb3NlIHRoZSBvcGVuZWQgbWVudS4gKi9cbiAgY2xvc2UoKSB7XG4gICAgdGhpcy5tZW51U3RhY2suY2xvc2VBbGwoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBPcGVuIHRoZSBjb250ZXh0IG1lbnUgYW5kIGNsb3NlIGFueSBwcmV2aW91c2x5IG9wZW4gbWVudXMuXG4gICAqIEBwYXJhbSBldmVudCB0aGUgbW91c2UgZXZlbnQgd2hpY2ggb3BlbnMgdGhlIGNvbnRleHQgbWVudS5cbiAgICovXG4gIF9vcGVuT25Db250ZXh0TWVudShldmVudDogTW91c2VFdmVudCkge1xuICAgIGlmICghdGhpcy5kaXNhYmxlZCkge1xuICAgICAgLy8gUHJldmVudCB0aGUgbmF0aXZlIGNvbnRleHQgbWVudSBmcm9tIG9wZW5pbmcgYmVjYXVzZSB3ZSdyZSBvcGVuaW5nIGEgY3VzdG9tIG9uZS5cbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgIC8vIFN0b3AgZXZlbnQgcHJvcGFnYXRpb24gdG8gZW5zdXJlIHRoYXQgb25seSB0aGUgY2xvc2VzdCBlbmFibGVkIGNvbnRleHQgbWVudSBvcGVucy5cbiAgICAgIC8vIE90aGVyd2lzZSwgYW55IGNvbnRleHQgbWVudXMgYXR0YWNoZWQgdG8gY29udGFpbmluZyBlbGVtZW50cyB3b3VsZCAqYWxzbyogb3BlbixcbiAgICAgIC8vIHJlc3VsdGluZyBpbiBtdWx0aXBsZSBzdGFja2VkIGNvbnRleHQgbWVudXMgYmVpbmcgZGlzcGxheWVkLlxuICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICAgIHRoaXMuX2NvbnRleHRNZW51VHJhY2tlci51cGRhdGUodGhpcyk7XG4gICAgICB0aGlzLl9vcGVuKHt4OiBldmVudC5jbGllbnRYLCB5OiBldmVudC5jbGllbnRZfSwgdHJ1ZSk7XG5cbiAgICAgIC8vIEEgY29udGV4dCBtZW51IGNhbiBiZSB0cmlnZ2VyZWQgdmlhIGEgbW91c2UgcmlnaHQgY2xpY2sgb3IgYSBrZXlib2FyZCBzaG9ydGN1dC5cbiAgICAgIGlmIChldmVudC5idXR0b24gPT09IDIpIHtcbiAgICAgICAgdGhpcy5jaGlsZE1lbnU/LmZvY3VzRmlyc3RJdGVtKCdtb3VzZScpO1xuICAgICAgfSBlbHNlIGlmIChldmVudC5idXR0b24gPT09IDApIHtcbiAgICAgICAgdGhpcy5jaGlsZE1lbnU/LmZvY3VzRmlyc3RJdGVtKCdrZXlib2FyZCcpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5jaGlsZE1lbnU/LmZvY3VzRmlyc3RJdGVtKCdwcm9ncmFtJyk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGF0dGFjaGVkIG1lbnUgaXMgb3Blbi4gKi9cbiAgaXNPcGVuKCkge1xuICAgIHJldHVybiAhIXRoaXMuX292ZXJsYXlSZWY/Lmhhc0F0dGFjaGVkKCk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBjb25maWd1cmF0aW9uIG9iamVjdCB1c2VkIHRvIGNyZWF0ZSB0aGUgb3ZlcmxheS5cbiAgICogQHBhcmFtIGNvb3JkaW5hdGVzIHRoZSBsb2NhdGlvbiB0byBwbGFjZSB0aGUgb3BlbmVkIG1lbnVcbiAgICovXG4gIHByaXZhdGUgX2dldE92ZXJsYXlDb25maWcoY29vcmRpbmF0ZXM6IENvbnRleHRNZW51Q29vcmRpbmF0ZXMpIHtcbiAgICByZXR1cm4gbmV3IE92ZXJsYXlDb25maWcoe1xuICAgICAgcG9zaXRpb25TdHJhdGVneTogdGhpcy5fZ2V0T3ZlcmxheVBvc2l0aW9uU3RyYXRlZ3koY29vcmRpbmF0ZXMpLFxuICAgICAgc2Nyb2xsU3RyYXRlZ3k6IHRoaXMuX292ZXJsYXkuc2Nyb2xsU3RyYXRlZ2llcy5ibG9jaygpLFxuICAgICAgZGlyZWN0aW9uOiB0aGlzLl9kaXJlY3Rpb25hbGl0eSxcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBCdWlsZCB0aGUgcG9zaXRpb24gc3RyYXRlZ3kgZm9yIHRoZSBvdmVybGF5IHdoaWNoIHNwZWNpZmllcyB3aGVyZSB0byBwbGFjZSB0aGUgbWVudS5cbiAgICogQHBhcmFtIGNvb3JkaW5hdGVzIHRoZSBsb2NhdGlvbiB0byBwbGFjZSB0aGUgb3BlbmVkIG1lbnVcbiAgICovXG4gIHByaXZhdGUgX2dldE92ZXJsYXlQb3NpdGlvblN0cmF0ZWd5KFxuICAgIGNvb3JkaW5hdGVzOiBDb250ZXh0TWVudUNvb3JkaW5hdGVzLFxuICApOiBGbGV4aWJsZUNvbm5lY3RlZFBvc2l0aW9uU3RyYXRlZ3kge1xuICAgIHJldHVybiB0aGlzLl9vdmVybGF5XG4gICAgICAucG9zaXRpb24oKVxuICAgICAgLmZsZXhpYmxlQ29ubmVjdGVkVG8oY29vcmRpbmF0ZXMpXG4gICAgICAud2l0aERlZmF1bHRPZmZzZXRYKHRoaXMuX29wdGlvbnMub2Zmc2V0WClcbiAgICAgIC53aXRoRGVmYXVsdE9mZnNldFkodGhpcy5fb3B0aW9ucy5vZmZzZXRZKVxuICAgICAgLndpdGhQb3NpdGlvbnModGhpcy5fZ2V0T3ZlcmxheVBvc2l0aW9ucygpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXRlcm1pbmUgYW5kIHJldHVybiB3aGVyZSB0byBwb3NpdGlvbiB0aGUgb3BlbmVkIG1lbnUgcmVsYXRpdmUgdG8gdGhlIG1vdXNlIGxvY2F0aW9uLlxuICAgKi9cbiAgcHJpdmF0ZSBfZ2V0T3ZlcmxheVBvc2l0aW9ucygpOiBDb25uZWN0ZWRQb3NpdGlvbltdIHtcbiAgICAvLyBUT0RPOiB0aGlzIHNob3VsZCBiZSBjb25maWd1cmFibGUgdGhyb3VnaCB0aGUgaW5qZWN0ZWQgY29udGV4dCBtZW51IG9wdGlvbnNcbiAgICByZXR1cm4gW1xuICAgICAge29yaWdpblg6ICdlbmQnLCBvcmlnaW5ZOiAndG9wJywgb3ZlcmxheVg6ICdzdGFydCcsIG92ZXJsYXlZOiAndG9wJ30sXG4gICAgICB7b3JpZ2luWDogJ3N0YXJ0Jywgb3JpZ2luWTogJ3RvcCcsIG92ZXJsYXlYOiAnZW5kJywgb3ZlcmxheVk6ICd0b3AnfSxcbiAgICAgIHtvcmlnaW5YOiAnZW5kJywgb3JpZ2luWTogJ2JvdHRvbScsIG92ZXJsYXlYOiAnc3RhcnQnLCBvdmVybGF5WTogJ2JvdHRvbSd9LFxuICAgICAge29yaWdpblg6ICdzdGFydCcsIG9yaWdpblk6ICdib3R0b20nLCBvdmVybGF5WDogJ2VuZCcsIG92ZXJsYXlZOiAnYm90dG9tJ30sXG4gICAgXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIHBvcnRhbCB0byBiZSBhdHRhY2hlZCB0byB0aGUgb3ZlcmxheSB3aGljaCBjb250YWlucyB0aGUgbWVudS4gQWxsb3dzIGZvciB0aGUgbWVudVxuICAgKiBjb250ZW50IHRvIGNoYW5nZSBkeW5hbWljYWxseSBhbmQgYmUgcmVmbGVjdGVkIGluIHRoZSBhcHBsaWNhdGlvbi5cbiAgICovXG4gIHByaXZhdGUgX2dldE1lbnVDb250ZW50KCk6IFBvcnRhbDx1bmtub3duPiB7XG4gICAgY29uc3QgaGFzTWVudUNvbnRlbnRDaGFuZ2VkID0gdGhpcy5fbWVudVRlbXBsYXRlUmVmICE9PSB0aGlzLl9tZW51UG9ydGFsPy50ZW1wbGF0ZVJlZjtcbiAgICBpZiAodGhpcy5fbWVudVRlbXBsYXRlUmVmICYmICghdGhpcy5fbWVudVBvcnRhbCB8fCBoYXNNZW51Q29udGVudENoYW5nZWQpKSB7XG4gICAgICB0aGlzLl9tZW51UG9ydGFsID0gbmV3IFRlbXBsYXRlUG9ydGFsKFxuICAgICAgICB0aGlzLl9tZW51VGVtcGxhdGVSZWYsXG4gICAgICAgIHRoaXMuX3ZpZXdDb250YWluZXJSZWYsXG4gICAgICAgIHVuZGVmaW5lZCxcbiAgICAgICAgdGhpcy5nZXRDaGlsZE1lbnVJbmplY3RvcigpLFxuICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fbWVudVBvcnRhbDtcbiAgfVxuXG4gIC8qKiBTdWJzY3JpYmUgdG8gdGhlIG1lbnUgc3RhY2sgY2xvc2UgZXZlbnRzIGFuZCBjbG9zZSB0aGlzIG1lbnUgd2hlbiByZXF1ZXN0ZWQuICovXG4gIHByaXZhdGUgX3NldE1lbnVTdGFja0xpc3RlbmVyKCkge1xuICAgIHRoaXMubWVudVN0YWNrLmNsb3NlZC5waXBlKHRha2VVbnRpbCh0aGlzLl9kZXN0cm95ZWQpKS5zdWJzY3JpYmUoaXRlbSA9PiB7XG4gICAgICBpZiAoaXRlbSA9PT0gdGhpcy5jaGlsZE1lbnUgJiYgdGhpcy5pc09wZW4oKSkge1xuICAgICAgICB0aGlzLmNsb3NlZC5uZXh0KCk7XG4gICAgICAgIHRoaXMuX292ZXJsYXlSZWYhLmRldGFjaCgpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFN1YnNjcmliZSB0byB0aGUgb3ZlcmxheXMgb3V0c2lkZSBwb2ludGVyIGV2ZW50cyBzdHJlYW0gYW5kIGhhbmRsZSBjbG9zaW5nIG91dCB0aGUgc3RhY2sgaWYgYVxuICAgKiBjbGljayBvY2N1cnMgb3V0c2lkZSB0aGUgbWVudXMuXG4gICAqL1xuICBwcml2YXRlIF9zdWJzY3JpYmVUb091dHNpZGVDbGlja3MoaWdub3JlRmlyc3RBdXhDbGljazogYm9vbGVhbikge1xuICAgIGlmICh0aGlzLl9vdmVybGF5UmVmKSB7XG4gICAgICBsZXQgb3V0c2lkZUNsaWNrcyA9IHRoaXMuX292ZXJsYXlSZWYub3V0c2lkZVBvaW50ZXJFdmVudHMoKTtcbiAgICAgIC8vIElmIHRoZSBtZW51IHdhcyB0cmlnZ2VyZWQgYnkgdGhlIGBjb250ZXh0bWVudWAgZXZlbnQsIHNraXAgdGhlIGZpcnN0IGBhdXhjbGlja2AgZXZlbnRcbiAgICAgIC8vIGJlY2F1c2UgaXQgZmlyZXMgd2hlbiB0aGUgbW91c2UgaXMgcmVsZWFzZWQgb24gdGhlIHNhbWUgY2xpY2sgdGhhdCBvcGVuZWQgdGhlIG1lbnUuXG4gICAgICBpZiAoaWdub3JlRmlyc3RBdXhDbGljaykge1xuICAgICAgICBjb25zdCBbYXV4Q2xpY2tzLCBub25BdXhDbGlja3NdID0gcGFydGl0aW9uKG91dHNpZGVDbGlja3MsICh7dHlwZX0pID0+IHR5cGUgPT09ICdhdXhjbGljaycpO1xuICAgICAgICBvdXRzaWRlQ2xpY2tzID0gbWVyZ2Uobm9uQXV4Q2xpY2tzLCBhdXhDbGlja3MucGlwZShza2lwKDEpKSk7XG4gICAgICB9XG4gICAgICBvdXRzaWRlQ2xpY2tzLnBpcGUodGFrZVVudGlsKHRoaXMuX3N0b3BPdXRzaWRlQ2xpY2tzTGlzdGVuZXIpKS5zdWJzY3JpYmUoZXZlbnQgPT4ge1xuICAgICAgICBpZiAoIWlzQ2xpY2tJbnNpZGVNZW51T3ZlcmxheShldmVudC50YXJnZXQgYXMgRWxlbWVudCkpIHtcbiAgICAgICAgICB0aGlzLm1lbnVTdGFjay5jbG9zZUFsbCgpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICB0aGlzLl9kZXN0cm95T3ZlcmxheSgpO1xuXG4gICAgdGhpcy5fZGVzdHJveWVkLm5leHQoKTtcbiAgICB0aGlzLl9kZXN0cm95ZWQuY29tcGxldGUoKTtcbiAgfVxuXG4gIC8qKiBEZXN0cm95IGFuZCB1bnNldCB0aGUgb3ZlcmxheSByZWZlcmVuY2UgaXQgaWYgZXhpc3RzLiAqL1xuICBwcml2YXRlIF9kZXN0cm95T3ZlcmxheSgpIHtcbiAgICBpZiAodGhpcy5fb3ZlcmxheVJlZikge1xuICAgICAgdGhpcy5fb3ZlcmxheVJlZi5kaXNwb3NlKCk7XG4gICAgICB0aGlzLl9vdmVybGF5UmVmID0gbnVsbDtcbiAgICB9XG4gIH1cbn1cbiJdfQ==