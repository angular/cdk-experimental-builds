/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { SkipSelf, Optional, Injectable, Injector, Inject, Type } from '@angular/core';
import { ComponentPortal, TemplatePortal } from '@angular/cdk/portal';
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
            this._getAfterAllClosed() : this._getAfterAllClosed().pipe(startWith(undefined)));
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
    _getAfterAllClosed() {
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
        if (config.id && this.getById(config.id) && (typeof ngDevMode === 'undefined' || ngDevMode)) {
            throw Error(`Dialog with id "${config.id}" exists already. The dialog id must be unique.`);
        }
        const overlayRef = this._createOverlay(config);
        const dialogContainer = this._attachDialogContainer(overlayRef, config);
        const dialogRef = this._attachDialogContentForComponent(component, dialogContainer, overlayRef, config);
        this._registerDialogRef(dialogRef);
        dialogContainer._initializeWithAttachedContent();
        return dialogRef;
    }
    /** Opens a dialog from a template. */
    openFromTemplate(template, config) {
        config = this._applyConfigDefaults(config);
        if (config.id && this.getById(config.id) && (typeof ngDevMode === 'undefined' || ngDevMode)) {
            throw Error(`Dialog with id "${config.id}" exists already. The dialog id must be unique.`);
        }
        const overlayRef = this._createOverlay(config);
        const dialogContainer = this._attachDialogContainer(overlayRef, config);
        const dialogRef = this._attachDialogContentForTemplate(template, dialogContainer, overlayRef, config);
        this._registerDialogRef(dialogRef);
        dialogContainer._initializeWithAttachedContent();
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
        const injector = Injector.create({
            parent: userInjector || this._injector,
            providers: [{ provide: DialogConfig, useValue: config }]
        });
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
        const providers = [
            { provide: this._injector.get(DIALOG_REF), useValue: dialogRef },
            { provide: this._injector.get(DIALOG_CONTAINER), useValue: dialogContainer },
            { provide: DIALOG_DATA, useValue: config.data }
        ];
        if (config.direction &&
            (!userInjector || !userInjector.get(Directionality, null))) {
            providers.push({
                provide: Directionality,
                useValue: { value: config.direction, change: observableOf() }
            });
        }
        return Injector.create({ parent: userInjector || this._injector, providers });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhbG9nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvZGlhbG9nL2RpYWxvZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBRUwsUUFBUSxFQUNSLFFBQVEsRUFDUixVQUFVLEVBQ1YsUUFBUSxFQUNSLE1BQU0sRUFHTixJQUFJLEVBRUwsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFDLGVBQWUsRUFBRSxjQUFjLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUNwRSxPQUFPLEVBQUMsRUFBRSxJQUFJLFlBQVksRUFBYyxPQUFPLEVBQUUsS0FBSyxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBRXBFLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUN6QyxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDN0MsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBRWpELE9BQU8sRUFFTCxPQUFPLEVBRVAsYUFBYSxHQUVkLE1BQU0sc0JBQXNCLENBQUM7QUFDOUIsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBRXpDLE9BQU8sRUFDTCxzQkFBc0IsRUFDdEIsV0FBVyxFQUNYLFVBQVUsRUFDVixnQkFBZ0IsRUFDaEIsYUFBYSxHQUNkLE1BQU0sb0JBQW9CLENBQUM7QUFHNUI7O0dBRUc7QUFFSCxNQUFNLE9BQU8sTUFBTTtJQXlCakIsWUFDWSxRQUFpQixFQUNqQixTQUFtQixFQUNDLHFCQUEyQztJQUN2RSxpREFBaUQ7SUFDakQsZ0RBQWdEO0lBQ2hCLGNBQW1CLEVBQ25CLGFBQXFCLEVBQ3pDLFFBQWtCO1FBUHRCLGFBQVEsR0FBUixRQUFRLENBQVM7UUFDakIsY0FBUyxHQUFULFNBQVMsQ0FBVTtRQUNDLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FB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LEdBQUcsQ0FBQyxhQUFhLENBQXdCLENBQUM7UUFDOUUsdUNBQVcsSUFBSSxZQUFZLEVBQUUsR0FBSyxNQUFNLEVBQUU7SUFDNUMsQ0FBQzs7O1lBM1FGLFVBQVU7OztZQW5CVCxPQUFPO1lBaEJQLFFBQVE7WUFJUixJQUFJLHVCQTREQyxNQUFNLFNBQUMsVUFBVTs0Q0FHakIsTUFBTSxTQUFDLHNCQUFzQjtZQUNpQixNQUFNLHVCQUFwRCxRQUFRLFlBQUksUUFBUTtZQTFEbkIsUUFBUSx1QkEyRFQsUUFBUSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1xuICBUZW1wbGF0ZVJlZixcbiAgU2tpcFNlbGYsXG4gIE9wdGlvbmFsLFxuICBJbmplY3RhYmxlLFxuICBJbmplY3RvcixcbiAgSW5qZWN0LFxuICBDb21wb25lbnRSZWYsXG4gIE9uRGVzdHJveSxcbiAgVHlwZSxcbiAgU3RhdGljUHJvdmlkZXJcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0NvbXBvbmVudFBvcnRhbCwgVGVtcGxhdGVQb3J0YWx9IGZyb20gJ0Bhbmd1bGFyL2Nkay9wb3J0YWwnO1xuaW1wb3J0IHtvZiBhcyBvYnNlcnZhYmxlT2YsIE9ic2VydmFibGUsIFN1YmplY3QsIGRlZmVyfSBmcm9tICdyeGpzJztcbmltcG9ydCB7RGlhbG9nUmVmfSBmcm9tICcuL2RpYWxvZy1yZWYnO1xuaW1wb3J0IHtMb2NhdGlvbn0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7RGlhbG9nQ29uZmlnfSBmcm9tICcuL2RpYWxvZy1jb25maWcnO1xuaW1wb3J0IHtEaXJlY3Rpb25hbGl0eX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2JpZGknO1xuaW1wb3J0IHtDZGtEaWFsb2dDb250YWluZXJ9IGZyb20gJy4vZGlhbG9nLWNvbnRhaW5lcic7XG5pbXBvcnQge1xuICBDb21wb25lbnRUeXBlLFxuICBPdmVybGF5LFxuICBPdmVybGF5UmVmLFxuICBPdmVybGF5Q29uZmlnLFxuICBTY3JvbGxTdHJhdGVneSxcbn0gZnJvbSAnQGFuZ3VsYXIvY2RrL292ZXJsYXknO1xuaW1wb3J0IHtzdGFydFdpdGh9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcblxuaW1wb3J0IHtcbiAgRElBTE9HX1NDUk9MTF9TVFJBVEVHWSxcbiAgRElBTE9HX0RBVEEsXG4gIERJQUxPR19SRUYsXG4gIERJQUxPR19DT05UQUlORVIsXG4gIERJQUxPR19DT05GSUcsXG59IGZyb20gJy4vZGlhbG9nLWluamVjdG9ycyc7XG5cblxuLyoqXG4gKiBTZXJ2aWNlIHRvIG9wZW4gbW9kYWwgZGlhbG9ncy5cbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIERpYWxvZyBpbXBsZW1lbnRzIE9uRGVzdHJveSB7XG4gIHByaXZhdGUgX3Njcm9sbFN0cmF0ZWd5OiAoKSA9PiBTY3JvbGxTdHJhdGVneTtcblxuICAvKiogU3RyZWFtIHRoYXQgZW1pdHMgd2hlbiBhbGwgZGlhbG9ncyBhcmUgY2xvc2VkLiAqL1xuICBfZ2V0QWZ0ZXJBbGxDbG9zZWQoKTogT2JzZXJ2YWJsZTx2b2lkPiB7XG4gICAgcmV0dXJuIHRoaXMuX3BhcmVudERpYWxvZyA/IHRoaXMuX3BhcmVudERpYWxvZy5hZnRlckFsbENsb3NlZCA6IHRoaXMuX2FmdGVyQWxsQ2xvc2VkQmFzZTtcbiAgfVxuICBfYWZ0ZXJBbGxDbG9zZWRCYXNlID0gbmV3IFN1YmplY3Q8dm9pZD4oKTtcblxuICAvLyBUT0RPKGplbGJvdXJuKTogdGlnaHRlbiB0aGUgdHlwZSBvbiB0aGUgcmlnaHQtaGFuZCBzaWRlIG9mIHRoaXMgZXhwcmVzc2lvbi5cbiAgYWZ0ZXJBbGxDbG9zZWQ6IE9ic2VydmFibGU8dm9pZD4gPSBkZWZlcigoKSA9PiB0aGlzLm9wZW5EaWFsb2dzLmxlbmd0aCA/XG4gICAgICB0aGlzLl9nZXRBZnRlckFsbENsb3NlZCgpIDogdGhpcy5fZ2V0QWZ0ZXJBbGxDbG9zZWQoKS5waXBlKHN0YXJ0V2l0aCh1bmRlZmluZWQpKSk7XG5cbiAgLyoqIFN0cmVhbSB0aGF0IGVtaXRzIHdoZW4gYSBkaWFsb2cgaXMgb3BlbmVkLiAqL1xuICBnZXQgYWZ0ZXJPcGVuZWQoKTogU3ViamVjdDxEaWFsb2dSZWY8YW55Pj4ge1xuICAgIHJldHVybiB0aGlzLl9wYXJlbnREaWFsb2cgPyB0aGlzLl9wYXJlbnREaWFsb2cuYWZ0ZXJPcGVuZWQgOiB0aGlzLl9hZnRlck9wZW5lZDtcbiAgfVxuICBfYWZ0ZXJPcGVuZWQ6IFN1YmplY3Q8RGlhbG9nUmVmPGFueT4+ID0gbmV3IFN1YmplY3QoKTtcblxuICAvKiogU3RyZWFtIHRoYXQgZW1pdHMgd2hlbiBhIGRpYWxvZyBpcyBvcGVuZWQuICovXG4gIGdldCBvcGVuRGlhbG9ncygpOiBEaWFsb2dSZWY8YW55PltdIHtcbiAgICByZXR1cm4gdGhpcy5fcGFyZW50RGlhbG9nID8gdGhpcy5fcGFyZW50RGlhbG9nLm9wZW5EaWFsb2dzIDogdGhpcy5fb3BlbkRpYWxvZ3M7XG4gIH1cbiAgX29wZW5EaWFsb2dzOiBEaWFsb2dSZWY8YW55PltdID0gW107XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIF9vdmVybGF5OiBPdmVybGF5LFxuICAgICAgcHJpdmF0ZSBfaW5qZWN0b3I6IEluamVjdG9yLFxuICAgICAgQEluamVjdChESUFMT0dfUkVGKSBwcml2YXRlIF9kaWFsb2dSZWZDb25zdHJ1Y3RvcjogVHlwZTxEaWFsb2dSZWY8YW55Pj4sXG4gICAgICAvLyBUT0RPKGNyaXNiZXRvKTogdGhlIGBhbnlgIGhlcmUgY2FuIGJlIHJlcGxhY2VkXG4gICAgICAvLyB3aXRoIHRoZSBwcm9wZXIgdHlwZSBvbmNlIHdlIHN0YXJ0IHVzaW5nIEl2eS5cbiAgICAgIEBJbmplY3QoRElBTE9HX1NDUk9MTF9TVFJBVEVHWSkgc2Nyb2xsU3RyYXRlZ3k6IGFueSxcbiAgICAgIEBPcHRpb25hbCgpIEBTa2lwU2VsZigpIHByaXZhdGUgX3BhcmVudERpYWxvZzogRGlhbG9nLFxuICAgICAgQE9wdGlvbmFsKCkgbG9jYXRpb246IExvY2F0aW9uKSB7XG5cbiAgICAvLyBDbG9zZSBhbGwgb2YgdGhlIGRpYWxvZ3Mgd2hlbiB0aGUgdXNlciBnb2VzIGZvcndhcmRzL2JhY2t3YXJkcyBpbiBoaXN0b3J5IG9yIHdoZW4gdGhlXG4gICAgLy8gbG9jYXRpb24gaGFzaCBjaGFuZ2VzLiBOb3RlIHRoYXQgdGhpcyB1c3VhbGx5IGRvZXNuJ3QgaW5jbHVkZSBjbGlja2luZyBvbiBsaW5rcyAodW5sZXNzXG4gICAgLy8gdGhlIHVzZXIgaXMgdXNpbmcgdGhlIGBIYXNoTG9jYXRpb25TdHJhdGVneWApLlxuICAgIGlmICghX3BhcmVudERpYWxvZyAmJiBsb2NhdGlvbikge1xuICAgICAgbG9jYXRpb24uc3Vic2NyaWJlKCgpID0+IHRoaXMuY2xvc2VBbGwoKSk7XG4gICAgfVxuXG4gICAgdGhpcy5fc2Nyb2xsU3RyYXRlZ3kgPSBzY3JvbGxTdHJhdGVneTtcbiAgfVxuXG4gIC8qKiBHZXRzIGFuIG9wZW4gZGlhbG9nIGJ5IGlkLiAqL1xuICBnZXRCeUlkKGlkOiBzdHJpbmcpOiBEaWFsb2dSZWY8YW55PiB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIHRoaXMuX29wZW5EaWFsb2dzLmZpbmQocmVmICA9PiByZWYuaWQgPT09IGlkKTtcbiAgfVxuXG4gIC8qKiBDbG9zZXMgYWxsIG9wZW4gZGlhbG9ncy4gKi9cbiAgY2xvc2VBbGwoKTogdm9pZCB7XG4gICAgdGhpcy5vcGVuRGlhbG9ncy5mb3JFYWNoKHJlZiA9PiByZWYuY2xvc2UoKSk7XG4gIH1cblxuICAvKiogT3BlbnMgYSBkaWFsb2cgZnJvbSBhIGNvbXBvbmVudC4gKi9cbiAgb3BlbkZyb21Db21wb25lbnQ8VD4oY29tcG9uZW50OiBDb21wb25lbnRUeXBlPFQ+LCBjb25maWc/OiBEaWFsb2dDb25maWcpOiBEaWFsb2dSZWY8YW55PiB7XG4gICAgY29uZmlnID0gdGhpcy5fYXBwbHlDb25maWdEZWZhdWx0cyhjb25maWcpO1xuXG4gICAgaWYgKGNvbmZpZy5pZCAmJiB0aGlzLmdldEJ5SWQoY29uZmlnLmlkKSAmJiAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSkge1xuICAgICAgdGhyb3cgRXJyb3IoYERpYWxvZyB3aXRoIGlkIFwiJHtjb25maWcuaWR9XCIgZXhpc3RzIGFscmVhZHkuIFRoZSBkaWFsb2cgaWQgbXVzdCBiZSB1bmlxdWUuYCk7XG4gICAgfVxuXG4gICAgY29uc3Qgb3ZlcmxheVJlZiA9IHRoaXMuX2NyZWF0ZU92ZXJsYXkoY29uZmlnKTtcbiAgICBjb25zdCBkaWFsb2dDb250YWluZXIgPSB0aGlzLl9hdHRhY2hEaWFsb2dDb250YWluZXIob3ZlcmxheVJlZiwgY29uZmlnKTtcbiAgICBjb25zdCBkaWFsb2dSZWYgPSB0aGlzLl9hdHRhY2hEaWFsb2dDb250ZW50Rm9yQ29tcG9uZW50KGNvbXBvbmVudCwgZGlhbG9nQ29udGFpbmVyLFxuICAgICAgb3ZlcmxheVJlZiwgY29uZmlnKTtcblxuICAgIHRoaXMuX3JlZ2lzdGVyRGlhbG9nUmVmKGRpYWxvZ1JlZik7XG4gICAgZGlhbG9nQ29udGFpbmVyLl9pbml0aWFsaXplV2l0aEF0dGFjaGVkQ29udGVudCgpO1xuXG4gICAgcmV0dXJuIGRpYWxvZ1JlZjtcbiAgfVxuXG4gIC8qKiBPcGVucyBhIGRpYWxvZyBmcm9tIGEgdGVtcGxhdGUuICovXG4gIG9wZW5Gcm9tVGVtcGxhdGU8VD4odGVtcGxhdGU6IFRlbXBsYXRlUmVmPFQ+LCBjb25maWc/OiBEaWFsb2dDb25maWcpOiBEaWFsb2dSZWY8YW55PiB7XG4gICAgY29uZmlnID0gdGhpcy5fYXBwbHlDb25maWdEZWZhdWx0cyhjb25maWcpO1xuXG4gICAgaWYgKGNvbmZpZy5pZCAmJiB0aGlzLmdldEJ5SWQoY29uZmlnLmlkKSAmJiAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSkge1xuICAgICAgdGhyb3cgRXJyb3IoYERpYWxvZyB3aXRoIGlkIFwiJHtjb25maWcuaWR9XCIgZXhpc3RzIGFscmVhZHkuIFRoZSBkaWFsb2cgaWQgbXVzdCBiZSB1bmlxdWUuYCk7XG4gICAgfVxuXG4gICAgY29uc3Qgb3ZlcmxheVJlZiA9IHRoaXMuX2NyZWF0ZU92ZXJsYXkoY29uZmlnKTtcbiAgICBjb25zdCBkaWFsb2dDb250YWluZXIgPSB0aGlzLl9hdHRhY2hEaWFsb2dDb250YWluZXIob3ZlcmxheVJlZiwgY29uZmlnKTtcbiAgICBjb25zdCBkaWFsb2dSZWYgPSB0aGlzLl9hdHRhY2hEaWFsb2dDb250ZW50Rm9yVGVtcGxhdGUodGVtcGxhdGUsIGRpYWxvZ0NvbnRhaW5lcixcbiAgICAgIG92ZXJsYXlSZWYsIGNvbmZpZyk7XG5cbiAgICB0aGlzLl9yZWdpc3RlckRpYWxvZ1JlZihkaWFsb2dSZWYpO1xuICAgIGRpYWxvZ0NvbnRhaW5lci5faW5pdGlhbGl6ZVdpdGhBdHRhY2hlZENvbnRlbnQoKTtcblxuICAgIHJldHVybiBkaWFsb2dSZWY7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICAvLyBPbmx5IGNsb3NlIGFsbCB0aGUgZGlhbG9ncyBhdCB0aGlzIGxldmVsLlxuICAgIHRoaXMuX29wZW5EaWFsb2dzLmZvckVhY2gocmVmID0+IHJlZi5jbG9zZSgpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGb3J3YXJkcyBlbWl0dGluZyBldmVudHMgZm9yIHdoZW4gZGlhbG9ncyBhcmUgb3BlbmVkIGFuZCBhbGwgZGlhbG9ncyBhcmUgY2xvc2VkLlxuICAgKi9cbiAgcHJpdmF0ZSBfcmVnaXN0ZXJEaWFsb2dSZWYoZGlhbG9nUmVmOiBEaWFsb2dSZWY8YW55Pik6IHZvaWQge1xuICAgIHRoaXMub3BlbkRpYWxvZ3MucHVzaChkaWFsb2dSZWYpO1xuXG4gICAgY29uc3QgZGlhbG9nT3BlblN1YiA9IGRpYWxvZ1JlZi5hZnRlck9wZW5lZCgpLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICB0aGlzLmFmdGVyT3BlbmVkLm5leHQoZGlhbG9nUmVmKTtcbiAgICAgIGRpYWxvZ09wZW5TdWIudW5zdWJzY3JpYmUoKTtcbiAgICB9KTtcblxuICAgIGNvbnN0IGRpYWxvZ0Nsb3NlU3ViID0gZGlhbG9nUmVmLmFmdGVyQ2xvc2VkKCkuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgIGxldCBkaWFsb2dJbmRleCA9IHRoaXMuX29wZW5EaWFsb2dzLmluZGV4T2YoZGlhbG9nUmVmKTtcblxuICAgICAgaWYgKGRpYWxvZ0luZGV4ID4gLTEpIHtcbiAgICAgICAgdGhpcy5fb3BlbkRpYWxvZ3Muc3BsaWNlKGRpYWxvZ0luZGV4LCAxKTtcbiAgICAgIH1cblxuICAgICAgaWYgKCF0aGlzLl9vcGVuRGlhbG9ncy5sZW5ndGgpIHtcbiAgICAgICAgdGhpcy5fYWZ0ZXJBbGxDbG9zZWRCYXNlLm5leHQoKTtcbiAgICAgICAgZGlhbG9nQ2xvc2VTdWIudW5zdWJzY3JpYmUoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGFuIG92ZXJsYXkgY29uZmlnIGZyb20gYSBkaWFsb2cgY29uZmlnLlxuICAgKiBAcGFyYW0gY29uZmlnIFRoZSBkaWFsb2cgY29uZmlndXJhdGlvbi5cbiAgICogQHJldHVybnMgVGhlIG92ZXJsYXkgY29uZmlndXJhdGlvbi5cbiAgICovXG4gIHByb3RlY3RlZCBfY3JlYXRlT3ZlcmxheShjb25maWc6IERpYWxvZ0NvbmZpZyk6IE92ZXJsYXlSZWYge1xuICAgIGNvbnN0IG92ZXJsYXlDb25maWcgPSBuZXcgT3ZlcmxheUNvbmZpZyh7XG4gICAgICBwb3NpdGlvblN0cmF0ZWd5OiB0aGlzLl9vdmVybGF5LnBvc2l0aW9uKCkuZ2xvYmFsKCksXG4gICAgICBzY3JvbGxTdHJhdGVneTogdGhpcy5fc2Nyb2xsU3RyYXRlZ3koKSxcbiAgICAgIHBhbmVsQ2xhc3M6IGNvbmZpZy5wYW5lbENsYXNzLFxuICAgICAgaGFzQmFja2Ryb3A6IGNvbmZpZy5oYXNCYWNrZHJvcCxcbiAgICAgIGRpcmVjdGlvbjogY29uZmlnLmRpcmVjdGlvbixcbiAgICAgIG1pbldpZHRoOiBjb25maWcubWluV2lkdGgsXG4gICAgICBtaW5IZWlnaHQ6IGNvbmZpZy5taW5IZWlnaHQsXG4gICAgICBtYXhXaWR0aDogY29uZmlnLm1heFdpZHRoLFxuICAgICAgbWF4SGVpZ2h0OiBjb25maWcubWF4SGVpZ2h0XG4gICAgfSk7XG5cbiAgICBpZiAoY29uZmlnLmJhY2tkcm9wQ2xhc3MpIHtcbiAgICAgIG92ZXJsYXlDb25maWcuYmFja2Ryb3BDbGFzcyA9IGNvbmZpZy5iYWNrZHJvcENsYXNzO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fb3ZlcmxheS5jcmVhdGUob3ZlcmxheUNvbmZpZyk7XG4gIH1cblxuICAvKipcbiAgICogQXR0YWNoZXMgYW4gTWF0RGlhbG9nQ29udGFpbmVyIHRvIGEgZGlhbG9nJ3MgYWxyZWFkeS1jcmVhdGVkIG92ZXJsYXkuXG4gICAqIEBwYXJhbSBvdmVybGF5IFJlZmVyZW5jZSB0byB0aGUgZGlhbG9nJ3MgdW5kZXJseWluZyBvdmVybGF5LlxuICAgKiBAcGFyYW0gY29uZmlnIFRoZSBkaWFsb2cgY29uZmlndXJhdGlvbi5cbiAgICogQHJldHVybnMgQSBwcm9taXNlIHJlc29sdmluZyB0byBhIENvbXBvbmVudFJlZiBmb3IgdGhlIGF0dGFjaGVkIGNvbnRhaW5lci5cbiAgICovXG4gIHByb3RlY3RlZCBfYXR0YWNoRGlhbG9nQ29udGFpbmVyKG92ZXJsYXk6IE92ZXJsYXlSZWYsIGNvbmZpZzogRGlhbG9nQ29uZmlnKTogQ2RrRGlhbG9nQ29udGFpbmVyIHtcbiAgICBjb25zdCBjb250YWluZXIgPSBjb25maWcuY29udGFpbmVyQ29tcG9uZW50IHx8IHRoaXMuX2luamVjdG9yLmdldChESUFMT0dfQ09OVEFJTkVSKTtcbiAgICBjb25zdCB1c2VySW5qZWN0b3IgPSBjb25maWcgJiYgY29uZmlnLnZpZXdDb250YWluZXJSZWYgJiYgY29uZmlnLnZpZXdDb250YWluZXJSZWYuaW5qZWN0b3I7XG4gICAgY29uc3QgaW5qZWN0b3IgPSBJbmplY3Rvci5jcmVhdGUoe1xuICAgICAgcGFyZW50OiB1c2VySW5qZWN0b3IgfHwgdGhpcy5faW5qZWN0b3IsXG4gICAgICBwcm92aWRlcnM6IFt7cHJvdmlkZTogRGlhbG9nQ29uZmlnLCB1c2VWYWx1ZTogY29uZmlnfV1cbiAgICB9KTtcbiAgICBjb25zdCBjb250YWluZXJQb3J0YWwgPSBuZXcgQ29tcG9uZW50UG9ydGFsKGNvbnRhaW5lciwgY29uZmlnLnZpZXdDb250YWluZXJSZWYsIGluamVjdG9yKTtcbiAgICBjb25zdCBjb250YWluZXJSZWY6IENvbXBvbmVudFJlZjxDZGtEaWFsb2dDb250YWluZXI+ID0gb3ZlcmxheS5hdHRhY2goY29udGFpbmVyUG9ydGFsKTtcbiAgICBjb250YWluZXJSZWYuaW5zdGFuY2UuX2NvbmZpZyA9IGNvbmZpZztcblxuICAgIHJldHVybiBjb250YWluZXJSZWYuaW5zdGFuY2U7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBBdHRhY2hlcyB0aGUgdXNlci1wcm92aWRlZCBjb21wb25lbnQgdG8gdGhlIGFscmVhZHktY3JlYXRlZCBNYXREaWFsb2dDb250YWluZXIuXG4gICAqIEBwYXJhbSBjb21wb25lbnRPclRlbXBsYXRlUmVmIFRoZSB0eXBlIG9mIGNvbXBvbmVudCBiZWluZyBsb2FkZWQgaW50byB0aGUgZGlhbG9nLFxuICAgKiAgICAgb3IgYSBUZW1wbGF0ZVJlZiB0byBpbnN0YW50aWF0ZSBhcyB0aGUgY29udGVudC5cbiAgICogQHBhcmFtIGRpYWxvZ0NvbnRhaW5lciBSZWZlcmVuY2UgdG8gdGhlIHdyYXBwaW5nIE1hdERpYWxvZ0NvbnRhaW5lci5cbiAgICogQHBhcmFtIG92ZXJsYXlSZWYgUmVmZXJlbmNlIHRvIHRoZSBvdmVybGF5IGluIHdoaWNoIHRoZSBkaWFsb2cgcmVzaWRlcy5cbiAgICogQHBhcmFtIGNvbmZpZyBUaGUgZGlhbG9nIGNvbmZpZ3VyYXRpb24uXG4gICAqIEByZXR1cm5zIEEgcHJvbWlzZSByZXNvbHZpbmcgdG8gdGhlIE1hdERpYWxvZ1JlZiB0aGF0IHNob3VsZCBiZSByZXR1cm5lZCB0byB0aGUgdXNlci5cbiAgICovXG4gIHByb3RlY3RlZCBfYXR0YWNoRGlhbG9nQ29udGVudEZvckNvbXBvbmVudDxUPihcbiAgICAgIGNvbXBvbmVudE9yVGVtcGxhdGVSZWY6IENvbXBvbmVudFR5cGU8VD4sXG4gICAgICBkaWFsb2dDb250YWluZXI6IENka0RpYWxvZ0NvbnRhaW5lcixcbiAgICAgIG92ZXJsYXlSZWY6IE92ZXJsYXlSZWYsXG4gICAgICBjb25maWc6IERpYWxvZ0NvbmZpZyk6IERpYWxvZ1JlZjxhbnk+IHtcblxuICAgIC8vIENyZWF0ZSBhIHJlZmVyZW5jZSB0byB0aGUgZGlhbG9nIHdlJ3JlIGNyZWF0aW5nIGluIG9yZGVyIHRvIGdpdmUgdGhlIHVzZXIgYSBoYW5kbGVcbiAgICAvLyB0byBtb2RpZnkgYW5kIGNsb3NlIGl0LlxuICAgIGNvbnN0IGRpYWxvZ1JlZiA9IHRoaXMuX2NyZWF0ZURpYWxvZ1JlZihvdmVybGF5UmVmLCBkaWFsb2dDb250YWluZXIsIGNvbmZpZyk7XG4gICAgY29uc3QgaW5qZWN0b3IgPSB0aGlzLl9jcmVhdGVJbmplY3RvcjxUPihjb25maWcsIGRpYWxvZ1JlZiwgZGlhbG9nQ29udGFpbmVyKTtcbiAgICBjb25zdCBjb250ZW50UmVmID0gZGlhbG9nQ29udGFpbmVyLmF0dGFjaENvbXBvbmVudFBvcnRhbChcbiAgICAgICAgbmV3IENvbXBvbmVudFBvcnRhbChjb21wb25lbnRPclRlbXBsYXRlUmVmLCB1bmRlZmluZWQsIGluamVjdG9yKSk7XG4gICAgZGlhbG9nUmVmLmNvbXBvbmVudEluc3RhbmNlID0gY29udGVudFJlZi5pbnN0YW5jZTtcbiAgICByZXR1cm4gZGlhbG9nUmVmO1xuICB9XG5cbiAgLyoqXG4gICAqIEF0dGFjaGVzIHRoZSB1c2VyLXByb3ZpZGVkIGNvbXBvbmVudCB0byB0aGUgYWxyZWFkeS1jcmVhdGVkIE1hdERpYWxvZ0NvbnRhaW5lci5cbiAgICogQHBhcmFtIGNvbXBvbmVudE9yVGVtcGxhdGVSZWYgVGhlIHR5cGUgb2YgY29tcG9uZW50IGJlaW5nIGxvYWRlZCBpbnRvIHRoZSBkaWFsb2csXG4gICAqICAgICBvciBhIFRlbXBsYXRlUmVmIHRvIGluc3RhbnRpYXRlIGFzIHRoZSBjb250ZW50LlxuICAgKiBAcGFyYW0gZGlhbG9nQ29udGFpbmVyIFJlZmVyZW5jZSB0byB0aGUgd3JhcHBpbmcgTWF0RGlhbG9nQ29udGFpbmVyLlxuICAgKiBAcGFyYW0gb3ZlcmxheVJlZiBSZWZlcmVuY2UgdG8gdGhlIG92ZXJsYXkgaW4gd2hpY2ggdGhlIGRpYWxvZyByZXNpZGVzLlxuICAgKiBAcGFyYW0gY29uZmlnIFRoZSBkaWFsb2cgY29uZmlndXJhdGlvbi5cbiAgICogQHJldHVybnMgQSBwcm9taXNlIHJlc29sdmluZyB0byB0aGUgTWF0RGlhbG9nUmVmIHRoYXQgc2hvdWxkIGJlIHJldHVybmVkIHRvIHRoZSB1c2VyLlxuICAgKi9cbiAgcHJvdGVjdGVkIF9hdHRhY2hEaWFsb2dDb250ZW50Rm9yVGVtcGxhdGU8VD4oXG4gICAgICBjb21wb25lbnRPclRlbXBsYXRlUmVmOiBUZW1wbGF0ZVJlZjxUPixcbiAgICAgIGRpYWxvZ0NvbnRhaW5lcjogQ2RrRGlhbG9nQ29udGFpbmVyLFxuICAgICAgb3ZlcmxheVJlZjogT3ZlcmxheVJlZixcbiAgICAgIGNvbmZpZzogRGlhbG9nQ29uZmlnKTogRGlhbG9nUmVmPGFueT4ge1xuXG4gICAgLy8gQ3JlYXRlIGEgcmVmZXJlbmNlIHRvIHRoZSBkaWFsb2cgd2UncmUgY3JlYXRpbmcgaW4gb3JkZXIgdG8gZ2l2ZSB0aGUgdXNlciBhIGhhbmRsZVxuICAgIC8vIHRvIG1vZGlmeSBhbmQgY2xvc2UgaXQuXG4gICAgY29uc3QgZGlhbG9nUmVmID0gdGhpcy5fY3JlYXRlRGlhbG9nUmVmKG92ZXJsYXlSZWYsIGRpYWxvZ0NvbnRhaW5lciwgY29uZmlnKTtcbiAgICBkaWFsb2dDb250YWluZXIuYXR0YWNoVGVtcGxhdGVQb3J0YWwoXG4gICAgICBuZXcgVGVtcGxhdGVQb3J0YWw8VD4oY29tcG9uZW50T3JUZW1wbGF0ZVJlZiwgbnVsbCEsXG4gICAgICAgIDxhbnk+eyRpbXBsaWNpdDogY29uZmlnLmRhdGEsIGRpYWxvZ1JlZn0pKTtcbiAgICByZXR1cm4gZGlhbG9nUmVmO1xuICB9XG5cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIGN1c3RvbSBpbmplY3RvciB0byBiZSB1c2VkIGluc2lkZSB0aGUgZGlhbG9nLiBUaGlzIGFsbG93cyBhIGNvbXBvbmVudCBsb2FkZWQgaW5zaWRlXG4gICAqIG9mIGEgZGlhbG9nIHRvIGNsb3NlIGl0c2VsZiBhbmQsIG9wdGlvbmFsbHksIHRvIHJldHVybiBhIHZhbHVlLlxuICAgKiBAcGFyYW0gY29uZmlnIENvbmZpZyBvYmplY3QgdGhhdCBpcyB1c2VkIHRvIGNvbnN0cnVjdCB0aGUgZGlhbG9nLlxuICAgKiBAcGFyYW0gZGlhbG9nUmVmIFJlZmVyZW5jZSB0byB0aGUgZGlhbG9nLlxuICAgKiBAcGFyYW0gY29udGFpbmVyIERpYWxvZyBjb250YWluZXIgZWxlbWVudCB0aGF0IHdyYXBzIGFsbCBvZiB0aGUgY29udGVudHMuXG4gICAqIEByZXR1cm5zIFRoZSBjdXN0b20gaW5qZWN0b3IgdGhhdCBjYW4gYmUgdXNlZCBpbnNpZGUgdGhlIGRpYWxvZy5cbiAgICovXG4gIHByaXZhdGUgX2NyZWF0ZUluamVjdG9yPFQ+KFxuICAgICAgY29uZmlnOiBEaWFsb2dDb25maWcsXG4gICAgICBkaWFsb2dSZWY6IERpYWxvZ1JlZjxUPixcbiAgICAgIGRpYWxvZ0NvbnRhaW5lcjogQ2RrRGlhbG9nQ29udGFpbmVyKTogSW5qZWN0b3Ige1xuXG4gICAgY29uc3QgdXNlckluamVjdG9yID0gY29uZmlnICYmIGNvbmZpZy52aWV3Q29udGFpbmVyUmVmICYmIGNvbmZpZy52aWV3Q29udGFpbmVyUmVmLmluamVjdG9yO1xuICAgIGNvbnN0IHByb3ZpZGVyczogU3RhdGljUHJvdmlkZXJbXSA9IFtcbiAgICAgIHtwcm92aWRlOiB0aGlzLl9pbmplY3Rvci5nZXQoRElBTE9HX1JFRiksIHVzZVZhbHVlOiBkaWFsb2dSZWZ9LFxuICAgICAge3Byb3ZpZGU6IHRoaXMuX2luamVjdG9yLmdldChESUFMT0dfQ09OVEFJTkVSKSwgdXNlVmFsdWU6IGRpYWxvZ0NvbnRhaW5lcn0sXG4gICAgICB7cHJvdmlkZTogRElBTE9HX0RBVEEsIHVzZVZhbHVlOiBjb25maWcuZGF0YX1cbiAgICBdO1xuXG4gICAgaWYgKGNvbmZpZy5kaXJlY3Rpb24gJiZcbiAgICAgICAgKCF1c2VySW5qZWN0b3IgfHwgIXVzZXJJbmplY3Rvci5nZXQ8RGlyZWN0aW9uYWxpdHkgfCBudWxsPihEaXJlY3Rpb25hbGl0eSwgbnVsbCkpKSB7XG4gICAgICBwcm92aWRlcnMucHVzaCh7XG4gICAgICAgIHByb3ZpZGU6IERpcmVjdGlvbmFsaXR5LFxuICAgICAgICB1c2VWYWx1ZToge3ZhbHVlOiBjb25maWcuZGlyZWN0aW9uLCBjaGFuZ2U6IG9ic2VydmFibGVPZigpfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIEluamVjdG9yLmNyZWF0ZSh7cGFyZW50OiB1c2VySW5qZWN0b3IgfHwgdGhpcy5faW5qZWN0b3IsIHByb3ZpZGVyc30pO1xuICB9XG5cbiAgLyoqIENyZWF0ZXMgYSBuZXcgZGlhbG9nIHJlZi4gKi9cbiAgcHJpdmF0ZSBfY3JlYXRlRGlhbG9nUmVmKG92ZXJsYXlSZWY6IE92ZXJsYXlSZWYsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBkaWFsb2dDb250YWluZXI6IENka0RpYWxvZ0NvbnRhaW5lcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZzogRGlhbG9nQ29uZmlnKSB7XG4gICAgY29uc3QgZGlhbG9nUmVmID0gbmV3IHRoaXMuX2RpYWxvZ1JlZkNvbnN0cnVjdG9yKG92ZXJsYXlSZWYsIGRpYWxvZ0NvbnRhaW5lciwgY29uZmlnLmlkKTtcbiAgICBkaWFsb2dSZWYuZGlzYWJsZUNsb3NlID0gY29uZmlnLmRpc2FibGVDbG9zZTtcbiAgICBkaWFsb2dSZWYudXBkYXRlU2l6ZShjb25maWcpLnVwZGF0ZVBvc2l0aW9uKGNvbmZpZy5wb3NpdGlvbik7XG4gICAgcmV0dXJuIGRpYWxvZ1JlZjtcbiAgfVxuXG4gIC8qKlxuICAgKiBFeHBhbmRzIHRoZSBwcm92aWRlZCBjb25maWd1cmF0aW9uIG9iamVjdCB0byBpbmNsdWRlIHRoZSBkZWZhdWx0IHZhbHVlcyBmb3IgcHJvcGVydGllcyB3aGljaFxuICAgKiBhcmUgdW5kZWZpbmVkLlxuICAgKi9cbiAgcHJpdmF0ZSBfYXBwbHlDb25maWdEZWZhdWx0cyhjb25maWc/OiBEaWFsb2dDb25maWcpOiBEaWFsb2dDb25maWcge1xuICAgIGNvbnN0IGRpYWxvZ0NvbmZpZyA9IHRoaXMuX2luamVjdG9yLmdldChESUFMT0dfQ09ORklHKSBhcyB0eXBlb2YgRGlhbG9nQ29uZmlnO1xuICAgIHJldHVybiB7Li4ubmV3IGRpYWxvZ0NvbmZpZygpLCAuLi5jb25maWd9O1xuICB9XG59XG4iXX0=