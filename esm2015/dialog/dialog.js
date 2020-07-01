/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { SkipSelf, Optional, Injectable, Injector, Inject, Type } from '@angular/core';
import { ComponentPortal, PortalInjector, TemplatePortal } from '@angular/cdk/portal';
import { of as observableOf, Subject, defer } from 'rxjs';
import { Location } from '@angular/common';
import { DialogConfig } from './dialog-config';
import { Directionality } from '@angular/cdk/bidi';
import { Overlay, OverlayConfig, } from '@angular/cdk/overlay';
import { startWith } from 'rxjs/operators';
import { DIALOG_SCROLL_STRATEGY, DIALOG_DATA, DIALOG_REF, DIALOG_CONTAINER, DIALOG_CONFIG, } from './dialog-injectors';
/**
 * Service to open modal dialogs.
 */
export class Dialog {
    constructor(_overlay, _injector, _dialogRefConstructor, 
    // TODO(crisbeto): the `any` here can be replaced
    // with the proper type once we start using Ivy.
    scrollStrategy, _parentDialog, location) {
        this._overlay = _overlay;
        this._injector = _injector;
        this._dialogRefConstructor = _dialogRefConstructor;
        this._parentDialog = _parentDialog;
        this._afterAllClosedBase = new Subject();
        // TODO(jelbourn): tighten the type on the right-hand side of this expression.
        this.afterAllClosed = defer(() => this.openDialogs.length ?
            this._afterAllClosed : this._afterAllClosed.pipe(startWith(undefined)));
        this._afterOpened = new Subject();
        this._openDialogs = [];
        // Close all of the dialogs when the user goes forwards/backwards in history or when the
        // location hash changes. Note that this usually doesn't include clicking on links (unless
        // the user is using the `HashLocationStrategy`).
        if (!_parentDialog && location) {
            location.subscribe(() => this.closeAll());
        }
        this._scrollStrategy = scrollStrategy;
    }
    /** Stream that emits when all dialogs are closed. */
    get _afterAllClosed() {
        return this._parentDialog ? this._parentDialog.afterAllClosed : this._afterAllClosedBase;
    }
    /** Stream that emits when a dialog is opened. */
    get afterOpened() {
        return this._parentDialog ? this._parentDialog.afterOpened : this._afterOpened;
    }
    /** Stream that emits when a dialog is opened. */
    get openDialogs() {
        return this._parentDialog ? this._parentDialog.openDialogs : this._openDialogs;
    }
    /** Gets an open dialog by id. */
    getById(id) {
        return this._openDialogs.find(ref => ref.id === id);
    }
    /** Closes all open dialogs. */
    closeAll() {
        this.openDialogs.forEach(ref => ref.close());
    }
    /** Opens a dialog from a component. */
    openFromComponent(component, config) {
        config = this._applyConfigDefaults(config);
        if (config.id && this.getById(config.id)) {
            throw Error(`Dialog with id "${config.id}" exists already. The dialog id must be unique.`);
        }
        const overlayRef = this._createOverlay(config);
        const dialogContainer = this._attachDialogContainer(overlayRef, config);
        const dialogRef = this._attachDialogContentForComponent(component, dialogContainer, overlayRef, config);
        this._registerDialogRef(dialogRef);
        return dialogRef;
    }
    /** Opens a dialog from a template. */
    openFromTemplate(template, config) {
        config = this._applyConfigDefaults(config);
        if (config.id && this.getById(config.id)) {
            throw Error(`Dialog with id "${config.id}" exists already. The dialog id must be unique.`);
        }
        const overlayRef = this._createOverlay(config);
        const dialogContainer = this._attachDialogContainer(overlayRef, config);
        const dialogRef = this._attachDialogContentForTemplate(template, dialogContainer, overlayRef, config);
        this._registerDialogRef(dialogRef);
        return dialogRef;
    }
    ngOnDestroy() {
        // Only close all the dialogs at this level.
        this._openDialogs.forEach(ref => ref.close());
    }
    /**
     * Forwards emitting events for when dialogs are opened and all dialogs are closed.
     */
    _registerDialogRef(dialogRef) {
        this.openDialogs.push(dialogRef);
        const dialogOpenSub = dialogRef.afterOpened().subscribe(() => {
            this.afterOpened.next(dialogRef);
            dialogOpenSub.unsubscribe();
        });
        const dialogCloseSub = dialogRef.afterClosed().subscribe(() => {
            let dialogIndex = this._openDialogs.indexOf(dialogRef);
            if (dialogIndex > -1) {
                this._openDialogs.splice(dialogIndex, 1);
            }
            if (!this._openDialogs.length) {
                this._afterAllClosedBase.next();
                dialogCloseSub.unsubscribe();
            }
        });
    }
    /**
     * Creates an overlay config from a dialog config.
     * @param config The dialog configuration.
     * @returns The overlay configuration.
     */
    _createOverlay(config) {
        const overlayConfig = new OverlayConfig({
            positionStrategy: this._overlay.position().global(),
            scrollStrategy: this._scrollStrategy(),
            panelClass: config.panelClass,
            hasBackdrop: config.hasBackdrop,
            direction: config.direction,
            minWidth: config.minWidth,
            minHeight: config.minHeight,
            maxWidth: config.maxWidth,
            maxHeight: config.maxHeight
        });
        if (config.backdropClass) {
            overlayConfig.backdropClass = config.backdropClass;
        }
        return this._overlay.create(overlayConfig);
    }
    /**
     * Attaches an MatDialogContainer to a dialog's already-created overlay.
     * @param overlay Reference to the dialog's underlying overlay.
     * @param config The dialog configuration.
     * @returns A promise resolving to a ComponentRef for the attached container.
     */
    _attachDialogContainer(overlay, config) {
        const container = config.containerComponent || this._injector.get(DIALOG_CONTAINER);
        const userInjector = config && config.viewContainerRef && config.viewContainerRef.injector;
        const injector = new PortalInjector(userInjector || this._injector, new WeakMap([
            [DialogConfig, config]
        ]));
        const containerPortal = new ComponentPortal(container, config.viewContainerRef, injector);
        const containerRef = overlay.attach(containerPortal);
        containerRef.instance._config = config;
        return containerRef.instance;
    }
    /**
     * Attaches the user-provided component to the already-created MatDialogContainer.
     * @param componentOrTemplateRef The type of component being loaded into the dialog,
     *     or a TemplateRef to instantiate as the content.
     * @param dialogContainer Reference to the wrapping MatDialogContainer.
     * @param overlayRef Reference to the overlay in which the dialog resides.
     * @param config The dialog configuration.
     * @returns A promise resolving to the MatDialogRef that should be returned to the user.
     */
    _attachDialogContentForComponent(componentOrTemplateRef, dialogContainer, overlayRef, config) {
        // Create a reference to the dialog we're creating in order to give the user a handle
        // to modify and close it.
        const dialogRef = this._createDialogRef(overlayRef, dialogContainer, config);
        const injector = this._createInjector(config, dialogRef, dialogContainer);
        const contentRef = dialogContainer.attachComponentPortal(new ComponentPortal(componentOrTemplateRef, undefined, injector));
        dialogRef.componentInstance = contentRef.instance;
        return dialogRef;
    }
    /**
     * Attaches the user-provided component to the already-created MatDialogContainer.
     * @param componentOrTemplateRef The type of component being loaded into the dialog,
     *     or a TemplateRef to instantiate as the content.
     * @param dialogContainer Reference to the wrapping MatDialogContainer.
     * @param overlayRef Reference to the overlay in which the dialog resides.
     * @param config The dialog configuration.
     * @returns A promise resolving to the MatDialogRef that should be returned to the user.
     */
    _attachDialogContentForTemplate(componentOrTemplateRef, dialogContainer, overlayRef, config) {
        // Create a reference to the dialog we're creating in order to give the user a handle
        // to modify and close it.
        const dialogRef = this._createDialogRef(overlayRef, dialogContainer, config);
        dialogContainer.attachTemplatePortal(new TemplatePortal(componentOrTemplateRef, null, { $implicit: config.data, dialogRef }));
        return dialogRef;
    }
    /**
     * Creates a custom injector to be used inside the dialog. This allows a component loaded inside
     * of a dialog to close itself and, optionally, to return a value.
     * @param config Config object that is used to construct the dialog.
     * @param dialogRef Reference to the dialog.
     * @param container Dialog container element that wraps all of the contents.
     * @returns The custom injector that can be used inside the dialog.
     */
    _createInjector(config, dialogRef, dialogContainer) {
        const userInjector = config && config.viewContainerRef && config.viewContainerRef.injector;
        const injectionTokens = new WeakMap([
            [this._injector.get(DIALOG_REF), dialogRef],
            [this._injector.get(DIALOG_CONTAINER), dialogContainer],
            [DIALOG_DATA, config.data]
        ]);
        if (config.direction &&
            (!userInjector || !userInjector.get(Directionality, null))) {
            injectionTokens.set(Directionality, {
                value: config.direction,
                change: observableOf()
            });
        }
        return new PortalInjector(userInjector || this._injector, injectionTokens);
    }
    /** Creates a new dialog ref. */
    _createDialogRef(overlayRef, dialogContainer, config) {
        const dialogRef = new this._dialogRefConstructor(overlayRef, dialogContainer, config.id);
        dialogRef.disableClose = config.disableClose;
        dialogRef.updateSize(config).updatePosition(config.position);
        return dialogRef;
    }
    /**
     * Expands the provided configuration object to include the default values for properties which
     * are undefined.
     */
    _applyConfigDefaults(config) {
        const dialogConfig = this._injector.get(DIALOG_CONFIG);
        return Object.assign(Object.assign({}, new dialogConfig()), config);
    }
}
Dialog.decorators = [
    { type: Injectable }
];
Dialog.ctorParameters = () => [
    { type: Overlay },
    { type: Injector },
    { type: Type, decorators: [{ type: Inject, args: [DIALOG_REF,] }] },
    { type: undefined, decorators: [{ type: Inject, args: [DIALOG_SCROLL_STRATEGY,] }] },
    { type: Dialog, decorators: [{ type: Optional }, { type: SkipSelf }] },
    { type: Location, decorators: [{ type: Optional }] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhbG9nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvZGlhbG9nL2RpYWxvZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBRUwsUUFBUSxFQUNSLFFBQVEsRUFDUixVQUFVLEVBQ1YsUUFBUSxFQUNSLE1BQU0sRUFHTixJQUFJLEVBQ0wsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFDLGVBQWUsRUFBRSxjQUFjLEVBQUUsY0FBYyxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDcEYsT0FBTyxFQUFDLEVBQUUsSUFBSSxZQUFZLEVBQWMsT0FBTyxFQUFFLEtBQUssRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUVwRSxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDekMsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQzdDLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUVqRCxPQUFPLEVBRUwsT0FBTyxFQUVQLGFBQWEsR0FFZCxNQUFNLHNCQUFzQixDQUFDO0FBQzlCLE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUV6QyxPQUFPLEVBQ0wsc0JBQXNCLEVBQ3RCLFdBQVcsRUFDWCxVQUFVLEVBQ1YsZ0JBQWdCLEVBQ2hCLGFBQWEsR0FDZCxNQUFNLG9CQUFvQixDQUFDO0FBRzVCOztHQUVHO0FBRUgsTUFBTSxPQUFPLE1BQU07SUF5QmpCLFlBQ1ksUUFBaUIsRUFDakIsU0FBbUIsRUFDQyxxQkFBMkM7SUFDdkUsaURBQWlEO0lBQ2pELGdEQUFnRDtJQUNoQixjQUFtQixFQUNuQixhQUFxQixFQUN6QyxRQUFrQjtRQVB0QixhQUFRLEdBQVIsUUFBUSxDQUFTO1FBQ2pCLGNBQVMsR0FBVCxTQUFTLENBQVU7UUFDQywwQkFBcUIsR0FBckIs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TEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7XG4gIFRlbXBsYXRlUmVmLFxuICBTa2lwU2VsZixcbiAgT3B0aW9uYWwsXG4gIEluamVjdGFibGUsXG4gIEluamVjdG9yLFxuICBJbmplY3QsXG4gIENvbXBvbmVudFJlZixcbiAgT25EZXN0cm95LFxuICBUeXBlXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtDb21wb25lbnRQb3J0YWwsIFBvcnRhbEluamVjdG9yLCBUZW1wbGF0ZVBvcnRhbH0gZnJvbSAnQGFuZ3VsYXIvY2RrL3BvcnRhbCc7XG5pbXBvcnQge29mIGFzIG9ic2VydmFibGVPZiwgT2JzZXJ2YWJsZSwgU3ViamVjdCwgZGVmZXJ9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHtEaWFsb2dSZWZ9IGZyb20gJy4vZGlhbG9nLXJlZic7XG5pbXBvcnQge0xvY2F0aW9ufSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHtEaWFsb2dDb25maWd9IGZyb20gJy4vZGlhbG9nLWNvbmZpZyc7XG5pbXBvcnQge0RpcmVjdGlvbmFsaXR5fSBmcm9tICdAYW5ndWxhci9jZGsvYmlkaSc7XG5pbXBvcnQge0Nka0RpYWxvZ0NvbnRhaW5lcn0gZnJvbSAnLi9kaWFsb2ctY29udGFpbmVyJztcbmltcG9ydCB7XG4gIENvbXBvbmVudFR5cGUsXG4gIE92ZXJsYXksXG4gIE92ZXJsYXlSZWYsXG4gIE92ZXJsYXlDb25maWcsXG4gIFNjcm9sbFN0cmF0ZWd5LFxufSBmcm9tICdAYW5ndWxhci9jZGsvb3ZlcmxheSc7XG5pbXBvcnQge3N0YXJ0V2l0aH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuXG5pbXBvcnQge1xuICBESUFMT0dfU0NST0xMX1NUUkFURUdZLFxuICBESUFMT0dfREFUQSxcbiAgRElBTE9HX1JFRixcbiAgRElBTE9HX0NPTlRBSU5FUixcbiAgRElBTE9HX0NPTkZJRyxcbn0gZnJvbSAnLi9kaWFsb2ctaW5qZWN0b3JzJztcblxuXG4vKipcbiAqIFNlcnZpY2UgdG8gb3BlbiBtb2RhbCBkaWFsb2dzLlxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgRGlhbG9nIGltcGxlbWVudHMgT25EZXN0cm95IHtcbiAgcHJpdmF0ZSBfc2Nyb2xsU3RyYXRlZ3k6ICgpID0+IFNjcm9sbFN0cmF0ZWd5O1xuXG4gIC8qKiBTdHJlYW0gdGhhdCBlbWl0cyB3aGVuIGFsbCBkaWFsb2dzIGFyZSBjbG9zZWQuICovXG4gIGdldCBfYWZ0ZXJBbGxDbG9zZWQoKTogT2JzZXJ2YWJsZTx2b2lkPiB7XG4gICAgcmV0dXJuIHRoaXMuX3BhcmVudERpYWxvZyA/IHRoaXMuX3BhcmVudERpYWxvZy5hZnRlckFsbENsb3NlZCA6IHRoaXMuX2FmdGVyQWxsQ2xvc2VkQmFzZTtcbiAgfVxuICBfYWZ0ZXJBbGxDbG9zZWRCYXNlID0gbmV3IFN1YmplY3Q8dm9pZD4oKTtcblxuICAvLyBUT0RPKGplbGJvdXJuKTogdGlnaHRlbiB0aGUgdHlwZSBvbiB0aGUgcmlnaHQtaGFuZCBzaWRlIG9mIHRoaXMgZXhwcmVzc2lvbi5cbiAgYWZ0ZXJBbGxDbG9zZWQ6IE9ic2VydmFibGU8dm9pZD4gPSBkZWZlcigoKSA9PiB0aGlzLm9wZW5EaWFsb2dzLmxlbmd0aCA/XG4gICAgICB0aGlzLl9hZnRlckFsbENsb3NlZCA6IHRoaXMuX2FmdGVyQWxsQ2xvc2VkLnBpcGUoc3RhcnRXaXRoKHVuZGVmaW5lZCkpKTtcblxuICAvKiogU3RyZWFtIHRoYXQgZW1pdHMgd2hlbiBhIGRpYWxvZyBpcyBvcGVuZWQuICovXG4gIGdldCBhZnRlck9wZW5lZCgpOiBTdWJqZWN0PERpYWxvZ1JlZjxhbnk+PiB7XG4gICAgcmV0dXJuIHRoaXMuX3BhcmVudERpYWxvZyA/IHRoaXMuX3BhcmVudERpYWxvZy5hZnRlck9wZW5lZCA6IHRoaXMuX2FmdGVyT3BlbmVkO1xuICB9XG4gIF9hZnRlck9wZW5lZDogU3ViamVjdDxEaWFsb2dSZWY8YW55Pj4gPSBuZXcgU3ViamVjdCgpO1xuXG4gIC8qKiBTdHJlYW0gdGhhdCBlbWl0cyB3aGVuIGEgZGlhbG9nIGlzIG9wZW5lZC4gKi9cbiAgZ2V0IG9wZW5EaWFsb2dzKCk6IERpYWxvZ1JlZjxhbnk+W10ge1xuICAgIHJldHVybiB0aGlzLl9wYXJlbnREaWFsb2cgPyB0aGlzLl9wYXJlbnREaWFsb2cub3BlbkRpYWxvZ3MgOiB0aGlzLl9vcGVuRGlhbG9ncztcbiAgfVxuICBfb3BlbkRpYWxvZ3M6IERpYWxvZ1JlZjxhbnk+W10gPSBbXTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgX292ZXJsYXk6IE92ZXJsYXksXG4gICAgICBwcml2YXRlIF9pbmplY3RvcjogSW5qZWN0b3IsXG4gICAgICBASW5qZWN0KERJQUxPR19SRUYpIHByaXZhdGUgX2RpYWxvZ1JlZkNvbnN0cnVjdG9yOiBUeXBlPERpYWxvZ1JlZjxhbnk+PixcbiAgICAgIC8vIFRPRE8oY3Jpc2JldG8pOiB0aGUgYGFueWAgaGVyZSBjYW4gYmUgcmVwbGFjZWRcbiAgICAgIC8vIHdpdGggdGhlIHByb3BlciB0eXBlIG9uY2Ugd2Ugc3RhcnQgdXNpbmcgSXZ5LlxuICAgICAgQEluamVjdChESUFMT0dfU0NST0xMX1NUUkFURUdZKSBzY3JvbGxTdHJhdGVneTogYW55LFxuICAgICAgQE9wdGlvbmFsKCkgQFNraXBTZWxmKCkgcHJpdmF0ZSBfcGFyZW50RGlhbG9nOiBEaWFsb2csXG4gICAgICBAT3B0aW9uYWwoKSBsb2NhdGlvbjogTG9jYXRpb24pIHtcblxuICAgIC8vIENsb3NlIGFsbCBvZiB0aGUgZGlhbG9ncyB3aGVuIHRoZSB1c2VyIGdvZXMgZm9yd2FyZHMvYmFja3dhcmRzIGluIGhpc3Rvcnkgb3Igd2hlbiB0aGVcbiAgICAvLyBsb2NhdGlvbiBoYXNoIGNoYW5nZXMuIE5vdGUgdGhhdCB0aGlzIHVzdWFsbHkgZG9lc24ndCBpbmNsdWRlIGNsaWNraW5nIG9uIGxpbmtzICh1bmxlc3NcbiAgICAvLyB0aGUgdXNlciBpcyB1c2luZyB0aGUgYEhhc2hMb2NhdGlvblN0cmF0ZWd5YCkuXG4gICAgaWYgKCFfcGFyZW50RGlhbG9nICYmIGxvY2F0aW9uKSB7XG4gICAgICBsb2NhdGlvbi5zdWJzY3JpYmUoKCkgPT4gdGhpcy5jbG9zZUFsbCgpKTtcbiAgICB9XG5cbiAgICB0aGlzLl9zY3JvbGxTdHJhdGVneSA9IHNjcm9sbFN0cmF0ZWd5O1xuICB9XG5cbiAgLyoqIEdldHMgYW4gb3BlbiBkaWFsb2cgYnkgaWQuICovXG4gIGdldEJ5SWQoaWQ6IHN0cmluZyk6IERpYWxvZ1JlZjxhbnk+IHwgdW5kZWZpbmVkIHtcbiAgICByZXR1cm4gdGhpcy5fb3BlbkRpYWxvZ3MuZmluZChyZWYgID0+IHJlZi5pZCA9PT0gaWQpO1xuICB9XG5cbiAgLyoqIENsb3NlcyBhbGwgb3BlbiBkaWFsb2dzLiAqL1xuICBjbG9zZUFsbCgpOiB2b2lkIHtcbiAgICB0aGlzLm9wZW5EaWFsb2dzLmZvckVhY2gocmVmID0+IHJlZi5jbG9zZSgpKTtcbiAgfVxuXG4gIC8qKiBPcGVucyBhIGRpYWxvZyBmcm9tIGEgY29tcG9uZW50LiAqL1xuICBvcGVuRnJvbUNvbXBvbmVudDxUPihjb21wb25lbnQ6IENvbXBvbmVudFR5cGU8VD4sIGNvbmZpZz86IERpYWxvZ0NvbmZpZyk6IERpYWxvZ1JlZjxhbnk+IHtcbiAgICBjb25maWcgPSB0aGlzLl9hcHBseUNvbmZpZ0RlZmF1bHRzKGNvbmZpZyk7XG5cbiAgICBpZiAoY29uZmlnLmlkICYmIHRoaXMuZ2V0QnlJZChjb25maWcuaWQpKSB7XG4gICAgICB0aHJvdyBFcnJvcihgRGlhbG9nIHdpdGggaWQgXCIke2NvbmZpZy5pZH1cIiBleGlzdHMgYWxyZWFkeS4gVGhlIGRpYWxvZyBpZCBtdXN0IGJlIHVuaXF1ZS5gKTtcbiAgICB9XG5cbiAgICBjb25zdCBvdmVybGF5UmVmID0gdGhpcy5fY3JlYXRlT3ZlcmxheShjb25maWcpO1xuICAgIGNvbnN0IGRpYWxvZ0NvbnRhaW5lciA9IHRoaXMuX2F0dGFjaERpYWxvZ0NvbnRhaW5lcihvdmVybGF5UmVmLCBjb25maWcpO1xuICAgIGNvbnN0IGRpYWxvZ1JlZiA9IHRoaXMuX2F0dGFjaERpYWxvZ0NvbnRlbnRGb3JDb21wb25lbnQoY29tcG9uZW50LCBkaWFsb2dDb250YWluZXIsXG4gICAgICBvdmVybGF5UmVmLCBjb25maWcpO1xuXG4gICAgdGhpcy5fcmVnaXN0ZXJEaWFsb2dSZWYoZGlhbG9nUmVmKTtcbiAgICByZXR1cm4gZGlhbG9nUmVmO1xuICB9XG5cbiAgLyoqIE9wZW5zIGEgZGlhbG9nIGZyb20gYSB0ZW1wbGF0ZS4gKi9cbiAgb3BlbkZyb21UZW1wbGF0ZTxUPih0ZW1wbGF0ZTogVGVtcGxhdGVSZWY8VD4sIGNvbmZpZz86IERpYWxvZ0NvbmZpZyk6IERpYWxvZ1JlZjxhbnk+IHtcbiAgICBjb25maWcgPSB0aGlzLl9hcHBseUNvbmZpZ0RlZmF1bHRzKGNvbmZpZyk7XG5cbiAgICBpZiAoY29uZmlnLmlkICYmIHRoaXMuZ2V0QnlJZChjb25maWcuaWQpKSB7XG4gICAgICB0aHJvdyBFcnJvcihgRGlhbG9nIHdpdGggaWQgXCIke2NvbmZpZy5pZH1cIiBleGlzdHMgYWxyZWFkeS4gVGhlIGRpYWxvZyBpZCBtdXN0IGJlIHVuaXF1ZS5gKTtcbiAgICB9XG5cbiAgICBjb25zdCBvdmVybGF5UmVmID0gdGhpcy5fY3JlYXRlT3ZlcmxheShjb25maWcpO1xuICAgIGNvbnN0IGRpYWxvZ0NvbnRhaW5lciA9IHRoaXMuX2F0dGFjaERpYWxvZ0NvbnRhaW5lcihvdmVybGF5UmVmLCBjb25maWcpO1xuICAgIGNvbnN0IGRpYWxvZ1JlZiA9IHRoaXMuX2F0dGFjaERpYWxvZ0NvbnRlbnRGb3JUZW1wbGF0ZSh0ZW1wbGF0ZSwgZGlhbG9nQ29udGFpbmVyLFxuICAgICAgb3ZlcmxheVJlZiwgY29uZmlnKTtcblxuICAgIHRoaXMuX3JlZ2lzdGVyRGlhbG9nUmVmKGRpYWxvZ1JlZik7XG4gICAgcmV0dXJuIGRpYWxvZ1JlZjtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIC8vIE9ubHkgY2xvc2UgYWxsIHRoZSBkaWFsb2dzIGF0IHRoaXMgbGV2ZWwuXG4gICAgdGhpcy5fb3BlbkRpYWxvZ3MuZm9yRWFjaChyZWYgPT4gcmVmLmNsb3NlKCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIEZvcndhcmRzIGVtaXR0aW5nIGV2ZW50cyBmb3Igd2hlbiBkaWFsb2dzIGFyZSBvcGVuZWQgYW5kIGFsbCBkaWFsb2dzIGFyZSBjbG9zZWQuXG4gICAqL1xuICBwcml2YXRlIF9yZWdpc3RlckRpYWxvZ1JlZihkaWFsb2dSZWY6IERpYWxvZ1JlZjxhbnk+KTogdm9pZCB7XG4gICAgdGhpcy5vcGVuRGlhbG9ncy5wdXNoKGRpYWxvZ1JlZik7XG5cbiAgICBjb25zdCBkaWFsb2dPcGVuU3ViID0gZGlhbG9nUmVmLmFmdGVyT3BlbmVkKCkuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgIHRoaXMuYWZ0ZXJPcGVuZWQubmV4dChkaWFsb2dSZWYpO1xuICAgICAgZGlhbG9nT3BlblN1Yi51bnN1YnNjcmliZSgpO1xuICAgIH0pO1xuXG4gICAgY29uc3QgZGlhbG9nQ2xvc2VTdWIgPSBkaWFsb2dSZWYuYWZ0ZXJDbG9zZWQoKS5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgbGV0IGRpYWxvZ0luZGV4ID0gdGhpcy5fb3BlbkRpYWxvZ3MuaW5kZXhPZihkaWFsb2dSZWYpO1xuXG4gICAgICBpZiAoZGlhbG9nSW5kZXggPiAtMSkge1xuICAgICAgICB0aGlzLl9vcGVuRGlhbG9ncy5zcGxpY2UoZGlhbG9nSW5kZXgsIDEpO1xuICAgICAgfVxuXG4gICAgICBpZiAoIXRoaXMuX29wZW5EaWFsb2dzLmxlbmd0aCkge1xuICAgICAgICB0aGlzLl9hZnRlckFsbENsb3NlZEJhc2UubmV4dCgpO1xuICAgICAgICBkaWFsb2dDbG9zZVN1Yi51bnN1YnNjcmliZSgpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYW4gb3ZlcmxheSBjb25maWcgZnJvbSBhIGRpYWxvZyBjb25maWcuXG4gICAqIEBwYXJhbSBjb25maWcgVGhlIGRpYWxvZyBjb25maWd1cmF0aW9uLlxuICAgKiBAcmV0dXJucyBUaGUgb3ZlcmxheSBjb25maWd1cmF0aW9uLlxuICAgKi9cbiAgcHJvdGVjdGVkIF9jcmVhdGVPdmVybGF5KGNvbmZpZzogRGlhbG9nQ29uZmlnKTogT3ZlcmxheVJlZiB7XG4gICAgY29uc3Qgb3ZlcmxheUNvbmZpZyA9IG5ldyBPdmVybGF5Q29uZmlnKHtcbiAgICAgIHBvc2l0aW9uU3RyYXRlZ3k6IHRoaXMuX292ZXJsYXkucG9zaXRpb24oKS5nbG9iYWwoKSxcbiAgICAgIHNjcm9sbFN0cmF0ZWd5OiB0aGlzLl9zY3JvbGxTdHJhdGVneSgpLFxuICAgICAgcGFuZWxDbGFzczogY29uZmlnLnBhbmVsQ2xhc3MsXG4gICAgICBoYXNCYWNrZHJvcDogY29uZmlnLmhhc0JhY2tkcm9wLFxuICAgICAgZGlyZWN0aW9uOiBjb25maWcuZGlyZWN0aW9uLFxuICAgICAgbWluV2lkdGg6IGNvbmZpZy5taW5XaWR0aCxcbiAgICAgIG1pbkhlaWdodDogY29uZmlnLm1pbkhlaWdodCxcbiAgICAgIG1heFdpZHRoOiBjb25maWcubWF4V2lkdGgsXG4gICAgICBtYXhIZWlnaHQ6IGNvbmZpZy5tYXhIZWlnaHRcbiAgICB9KTtcblxuICAgIGlmIChjb25maWcuYmFja2Ryb3BDbGFzcykge1xuICAgICAgb3ZlcmxheUNvbmZpZy5iYWNrZHJvcENsYXNzID0gY29uZmlnLmJhY2tkcm9wQ2xhc3M7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9vdmVybGF5LmNyZWF0ZShvdmVybGF5Q29uZmlnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBdHRhY2hlcyBhbiBNYXREaWFsb2dDb250YWluZXIgdG8gYSBkaWFsb2cncyBhbHJlYWR5LWNyZWF0ZWQgb3ZlcmxheS5cbiAgICogQHBhcmFtIG92ZXJsYXkgUmVmZXJlbmNlIHRvIHRoZSBkaWFsb2cncyB1bmRlcmx5aW5nIG92ZXJsYXkuXG4gICAqIEBwYXJhbSBjb25maWcgVGhlIGRpYWxvZyBjb25maWd1cmF0aW9uLlxuICAgKiBAcmV0dXJucyBBIHByb21pc2UgcmVzb2x2aW5nIHRvIGEgQ29tcG9uZW50UmVmIGZvciB0aGUgYXR0YWNoZWQgY29udGFpbmVyLlxuICAgKi9cbiAgcHJvdGVjdGVkIF9hdHRhY2hEaWFsb2dDb250YWluZXIob3ZlcmxheTogT3ZlcmxheVJlZiwgY29uZmlnOiBEaWFsb2dDb25maWcpOiBDZGtEaWFsb2dDb250YWluZXIge1xuICAgIGNvbnN0IGNvbnRhaW5lciA9IGNvbmZpZy5jb250YWluZXJDb21wb25lbnQgfHwgdGhpcy5faW5qZWN0b3IuZ2V0KERJQUxPR19DT05UQUlORVIpO1xuICAgIGNvbnN0IHVzZXJJbmplY3RvciA9IGNvbmZpZyAmJiBjb25maWcudmlld0NvbnRhaW5lclJlZiAmJiBjb25maWcudmlld0NvbnRhaW5lclJlZi5pbmplY3RvcjtcbiAgICBjb25zdCBpbmplY3RvciA9IG5ldyBQb3J0YWxJbmplY3Rvcih1c2VySW5qZWN0b3IgfHwgdGhpcy5faW5qZWN0b3IsIG5ldyBXZWFrTWFwKFtcbiAgICAgIFtEaWFsb2dDb25maWcsIGNvbmZpZ11cbiAgICBdKSk7XG4gICAgY29uc3QgY29udGFpbmVyUG9ydGFsID0gbmV3IENvbXBvbmVudFBvcnRhbChjb250YWluZXIsIGNvbmZpZy52aWV3Q29udGFpbmVyUmVmLCBpbmplY3Rvcik7XG4gICAgY29uc3QgY29udGFpbmVyUmVmOiBDb21wb25lbnRSZWY8Q2RrRGlhbG9nQ29udGFpbmVyPiA9IG92ZXJsYXkuYXR0YWNoKGNvbnRhaW5lclBvcnRhbCk7XG4gICAgY29udGFpbmVyUmVmLmluc3RhbmNlLl9jb25maWcgPSBjb25maWc7XG5cbiAgICByZXR1cm4gY29udGFpbmVyUmVmLmluc3RhbmNlO1xuICB9XG5cblxuICAvKipcbiAgICogQXR0YWNoZXMgdGhlIHVzZXItcHJvdmlkZWQgY29tcG9uZW50IHRvIHRoZSBhbHJlYWR5LWNyZWF0ZWQgTWF0RGlhbG9nQ29udGFpbmVyLlxuICAgKiBAcGFyYW0gY29tcG9uZW50T3JUZW1wbGF0ZVJlZiBUaGUgdHlwZSBvZiBjb21wb25lbnQgYmVpbmcgbG9hZGVkIGludG8gdGhlIGRpYWxvZyxcbiAgICogICAgIG9yIGEgVGVtcGxhdGVSZWYgdG8gaW5zdGFudGlhdGUgYXMgdGhlIGNvbnRlbnQuXG4gICAqIEBwYXJhbSBkaWFsb2dDb250YWluZXIgUmVmZXJlbmNlIHRvIHRoZSB3cmFwcGluZyBNYXREaWFsb2dDb250YWluZXIuXG4gICAqIEBwYXJhbSBvdmVybGF5UmVmIFJlZmVyZW5jZSB0byB0aGUgb3ZlcmxheSBpbiB3aGljaCB0aGUgZGlhbG9nIHJlc2lkZXMuXG4gICAqIEBwYXJhbSBjb25maWcgVGhlIGRpYWxvZyBjb25maWd1cmF0aW9uLlxuICAgKiBAcmV0dXJucyBBIHByb21pc2UgcmVzb2x2aW5nIHRvIHRoZSBNYXREaWFsb2dSZWYgdGhhdCBzaG91bGQgYmUgcmV0dXJuZWQgdG8gdGhlIHVzZXIuXG4gICAqL1xuICBwcm90ZWN0ZWQgX2F0dGFjaERpYWxvZ0NvbnRlbnRGb3JDb21wb25lbnQ8VD4oXG4gICAgICBjb21wb25lbnRPclRlbXBsYXRlUmVmOiBDb21wb25lbnRUeXBlPFQ+LFxuICAgICAgZGlhbG9nQ29udGFpbmVyOiBDZGtEaWFsb2dDb250YWluZXIsXG4gICAgICBvdmVybGF5UmVmOiBPdmVybGF5UmVmLFxuICAgICAgY29uZmlnOiBEaWFsb2dDb25maWcpOiBEaWFsb2dSZWY8YW55PiB7XG5cbiAgICAvLyBDcmVhdGUgYSByZWZlcmVuY2UgdG8gdGhlIGRpYWxvZyB3ZSdyZSBjcmVhdGluZyBpbiBvcmRlciB0byBnaXZlIHRoZSB1c2VyIGEgaGFuZGxlXG4gICAgLy8gdG8gbW9kaWZ5IGFuZCBjbG9zZSBpdC5cbiAgICBjb25zdCBkaWFsb2dSZWYgPSB0aGlzLl9jcmVhdGVEaWFsb2dSZWYob3ZlcmxheVJlZiwgZGlhbG9nQ29udGFpbmVyLCBjb25maWcpO1xuICAgIGNvbnN0IGluamVjdG9yID0gdGhpcy5fY3JlYXRlSW5qZWN0b3I8VD4oY29uZmlnLCBkaWFsb2dSZWYsIGRpYWxvZ0NvbnRhaW5lcik7XG4gICAgY29uc3QgY29udGVudFJlZiA9IGRpYWxvZ0NvbnRhaW5lci5hdHRhY2hDb21wb25lbnRQb3J0YWwoXG4gICAgICAgIG5ldyBDb21wb25lbnRQb3J0YWwoY29tcG9uZW50T3JUZW1wbGF0ZVJlZiwgdW5kZWZpbmVkLCBpbmplY3RvcikpO1xuICAgIGRpYWxvZ1JlZi5jb21wb25lbnRJbnN0YW5jZSA9IGNvbnRlbnRSZWYuaW5zdGFuY2U7XG4gICAgcmV0dXJuIGRpYWxvZ1JlZjtcbiAgfVxuXG4gIC8qKlxuICAgKiBBdHRhY2hlcyB0aGUgdXNlci1wcm92aWRlZCBjb21wb25lbnQgdG8gdGhlIGFscmVhZHktY3JlYXRlZCBNYXREaWFsb2dDb250YWluZXIuXG4gICAqIEBwYXJhbSBjb21wb25lbnRPclRlbXBsYXRlUmVmIFRoZSB0eXBlIG9mIGNvbXBvbmVudCBiZWluZyBsb2FkZWQgaW50byB0aGUgZGlhbG9nLFxuICAgKiAgICAgb3IgYSBUZW1wbGF0ZVJlZiB0byBpbnN0YW50aWF0ZSBhcyB0aGUgY29udGVudC5cbiAgICogQHBhcmFtIGRpYWxvZ0NvbnRhaW5lciBSZWZlcmVuY2UgdG8gdGhlIHdyYXBwaW5nIE1hdERpYWxvZ0NvbnRhaW5lci5cbiAgICogQHBhcmFtIG92ZXJsYXlSZWYgUmVmZXJlbmNlIHRvIHRoZSBvdmVybGF5IGluIHdoaWNoIHRoZSBkaWFsb2cgcmVzaWRlcy5cbiAgICogQHBhcmFtIGNvbmZpZyBUaGUgZGlhbG9nIGNvbmZpZ3VyYXRpb24uXG4gICAqIEByZXR1cm5zIEEgcHJvbWlzZSByZXNvbHZpbmcgdG8gdGhlIE1hdERpYWxvZ1JlZiB0aGF0IHNob3VsZCBiZSByZXR1cm5lZCB0byB0aGUgdXNlci5cbiAgICovXG4gIHByb3RlY3RlZCBfYXR0YWNoRGlhbG9nQ29udGVudEZvclRlbXBsYXRlPFQ+KFxuICAgICAgY29tcG9uZW50T3JUZW1wbGF0ZVJlZjogVGVtcGxhdGVSZWY8VD4sXG4gICAgICBkaWFsb2dDb250YWluZXI6IENka0RpYWxvZ0NvbnRhaW5lcixcbiAgICAgIG92ZXJsYXlSZWY6IE92ZXJsYXlSZWYsXG4gICAgICBjb25maWc6IERpYWxvZ0NvbmZpZyk6IERpYWxvZ1JlZjxhbnk+IHtcblxuICAgIC8vIENyZWF0ZSBhIHJlZmVyZW5jZSB0byB0aGUgZGlhbG9nIHdlJ3JlIGNyZWF0aW5nIGluIG9yZGVyIHRvIGdpdmUgdGhlIHVzZXIgYSBoYW5kbGVcbiAgICAvLyB0byBtb2RpZnkgYW5kIGNsb3NlIGl0LlxuICAgIGNvbnN0IGRpYWxvZ1JlZiA9IHRoaXMuX2NyZWF0ZURpYWxvZ1JlZihvdmVybGF5UmVmLCBkaWFsb2dDb250YWluZXIsIGNvbmZpZyk7XG4gICAgZGlhbG9nQ29udGFpbmVyLmF0dGFjaFRlbXBsYXRlUG9ydGFsKFxuICAgICAgbmV3IFRlbXBsYXRlUG9ydGFsPFQ+KGNvbXBvbmVudE9yVGVtcGxhdGVSZWYsIG51bGwhLFxuICAgICAgICA8YW55PnskaW1wbGljaXQ6IGNvbmZpZy5kYXRhLCBkaWFsb2dSZWZ9KSk7XG4gICAgcmV0dXJuIGRpYWxvZ1JlZjtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBjdXN0b20gaW5qZWN0b3IgdG8gYmUgdXNlZCBpbnNpZGUgdGhlIGRpYWxvZy4gVGhpcyBhbGxvd3MgYSBjb21wb25lbnQgbG9hZGVkIGluc2lkZVxuICAgKiBvZiBhIGRpYWxvZyB0byBjbG9zZSBpdHNlbGYgYW5kLCBvcHRpb25hbGx5LCB0byByZXR1cm4gYSB2YWx1ZS5cbiAgICogQHBhcmFtIGNvbmZpZyBDb25maWcgb2JqZWN0IHRoYXQgaXMgdXNlZCB0byBjb25zdHJ1Y3QgdGhlIGRpYWxvZy5cbiAgICogQHBhcmFtIGRpYWxvZ1JlZiBSZWZlcmVuY2UgdG8gdGhlIGRpYWxvZy5cbiAgICogQHBhcmFtIGNvbnRhaW5lciBEaWFsb2cgY29udGFpbmVyIGVsZW1lbnQgdGhhdCB3cmFwcyBhbGwgb2YgdGhlIGNvbnRlbnRzLlxuICAgKiBAcmV0dXJucyBUaGUgY3VzdG9tIGluamVjdG9yIHRoYXQgY2FuIGJlIHVzZWQgaW5zaWRlIHRoZSBkaWFsb2cuXG4gICAqL1xuICBwcml2YXRlIF9jcmVhdGVJbmplY3RvcjxUPihcbiAgICAgIGNvbmZpZzogRGlhbG9nQ29uZmlnLFxuICAgICAgZGlhbG9nUmVmOiBEaWFsb2dSZWY8VD4sXG4gICAgICBkaWFsb2dDb250YWluZXI6IENka0RpYWxvZ0NvbnRhaW5lcik6IFBvcnRhbEluamVjdG9yIHtcblxuICAgIGNvbnN0IHVzZXJJbmplY3RvciA9IGNvbmZpZyAmJiBjb25maWcudmlld0NvbnRhaW5lclJlZiAmJiBjb25maWcudmlld0NvbnRhaW5lclJlZi5pbmplY3RvcjtcbiAgICBjb25zdCBpbmplY3Rpb25Ub2tlbnMgPSBuZXcgV2Vha01hcDxhbnksIGFueT4oW1xuICAgICAgW3RoaXMuX2luamVjdG9yLmdldChESUFMT0dfUkVGKSwgZGlhbG9nUmVmXSxcbiAgICAgIFt0aGlzLl9pbmplY3Rvci5nZXQoRElBTE9HX0NPTlRBSU5FUiksIGRpYWxvZ0NvbnRhaW5lcl0sXG4gICAgICBbRElBTE9HX0RBVEEsIGNvbmZpZy5kYXRhXVxuICAgIF0pO1xuXG4gICAgaWYgKGNvbmZpZy5kaXJlY3Rpb24gJiZcbiAgICAgICAgKCF1c2VySW5qZWN0b3IgfHwgIXVzZXJJbmplY3Rvci5nZXQ8RGlyZWN0aW9uYWxpdHkgfCBudWxsPihEaXJlY3Rpb25hbGl0eSwgbnVsbCkpKSB7XG4gICAgICBpbmplY3Rpb25Ub2tlbnMuc2V0KERpcmVjdGlvbmFsaXR5LCB7XG4gICAgICAgIHZhbHVlOiBjb25maWcuZGlyZWN0aW9uLFxuICAgICAgICBjaGFuZ2U6IG9ic2VydmFibGVPZigpXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IFBvcnRhbEluamVjdG9yKHVzZXJJbmplY3RvciB8fCB0aGlzLl9pbmplY3RvciwgaW5qZWN0aW9uVG9rZW5zKTtcbiAgfVxuXG4gIC8qKiBDcmVhdGVzIGEgbmV3IGRpYWxvZyByZWYuICovXG4gIHByaXZhdGUgX2NyZWF0ZURpYWxvZ1JlZihvdmVybGF5UmVmOiBPdmVybGF5UmVmLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlhbG9nQ29udGFpbmVyOiBDZGtEaWFsb2dDb250YWluZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWc6IERpYWxvZ0NvbmZpZykge1xuICAgIGNvbnN0IGRpYWxvZ1JlZiA9IG5ldyB0aGlzLl9kaWFsb2dSZWZDb25zdHJ1Y3RvcihvdmVybGF5UmVmLCBkaWFsb2dDb250YWluZXIsIGNvbmZpZy5pZCk7XG4gICAgZGlhbG9nUmVmLmRpc2FibGVDbG9zZSA9IGNvbmZpZy5kaXNhYmxlQ2xvc2U7XG4gICAgZGlhbG9nUmVmLnVwZGF0ZVNpemUoY29uZmlnKS51cGRhdGVQb3NpdGlvbihjb25maWcucG9zaXRpb24pO1xuICAgIHJldHVybiBkaWFsb2dSZWY7XG4gIH1cblxuICAvKipcbiAgICogRXhwYW5kcyB0aGUgcHJvdmlkZWQgY29uZmlndXJhdGlvbiBvYmplY3QgdG8gaW5jbHVkZSB0aGUgZGVmYXVsdCB2YWx1ZXMgZm9yIHByb3BlcnRpZXMgd2hpY2hcbiAgICogYXJlIHVuZGVmaW5lZC5cbiAgICovXG4gIHByaXZhdGUgX2FwcGx5Q29uZmlnRGVmYXVsdHMoY29uZmlnPzogRGlhbG9nQ29uZmlnKTogRGlhbG9nQ29uZmlnIHtcbiAgICBjb25zdCBkaWFsb2dDb25maWcgPSB0aGlzLl9pbmplY3Rvci5nZXQoRElBTE9HX0NPTkZJRykgYXMgdHlwZW9mIERpYWxvZ0NvbmZpZztcbiAgICByZXR1cm4gey4uLm5ldyBkaWFsb2dDb25maWcoKSwgLi4uY29uZmlnfTtcbiAgfVxufVxuIl19