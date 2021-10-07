/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { SkipSelf, Optional, Injectable, Injector, Inject, Type, InjectFlags } from '@angular/core';
import { ComponentPortal, TemplatePortal } from '@angular/cdk/portal';
import { of as observableOf, Subject, defer } from 'rxjs';
import { Location } from '@angular/common';
import { DialogConfig } from './dialog-config';
import { Directionality } from '@angular/cdk/bidi';
import { Overlay, OverlayConfig, } from '@angular/cdk/overlay';
import { startWith } from 'rxjs/operators';
import { DIALOG_SCROLL_STRATEGY, DIALOG_DATA, DIALOG_REF, DIALOG_CONTAINER, DIALOG_CONFIG, } from './dialog-injectors';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/overlay";
import * as i2 from "@angular/common";
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
        if (config.direction && (!userInjector ||
            !userInjector.get(Directionality, null, InjectFlags.Optional))) {
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
        return { ...new dialogConfig(), ...config };
    }
}
Dialog.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.0-next.15", ngImport: i0, type: Dialog, deps: [{ token: i1.Overlay }, { token: i0.Injector }, { token: DIALOG_REF }, { token: DIALOG_SCROLL_STRATEGY }, { token: Dialog, optional: true, skipSelf: true }, { token: i2.Location, optional: true }], target: i0.ɵɵFactoryTarget.Injectable });
Dialog.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.0-next.15", ngImport: i0, type: Dialog });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.0-next.15", ngImport: i0, type: Dialog, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: i1.Overlay }, { type: i0.Injector }, { type: i0.Type, decorators: [{
                    type: Inject,
                    args: [DIALOG_REF]
                }] }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [DIALOG_SCROLL_STRATEGY]
                }] }, { type: Dialog, decorators: [{
                    type: Optional
                }, {
                    type: SkipSelf
                }] }, { type: i2.Location, decorators: [{
                    type: Optional
                }] }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhbG9nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvZGlhbG9nL2RpYWxvZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBRUwsUUFBUSxFQUNSLFFBQVEsRUFDUixVQUFVLEVBQ1YsUUFBUSxFQUNSLE1BQU0sRUFHTixJQUFJLEVBRUosV0FBVyxFQUNaLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBQyxlQUFlLEVBQUUsY0FBYyxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDcEUsT0FBTyxFQUFDLEVBQUUsSUFBSSxZQUFZLEVBQWMsT0FBTyxFQUFFLEtBQUssRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUVwRSxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDekMsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQzdDLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUVqRCxPQUFPLEVBRUwsT0FBTyxFQUVQLGFBQWEsR0FFZCxNQUFNLHNCQUFzQixDQUFDO0FBQzlCLE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUV6QyxPQUFPLEVBQ0wsc0JBQXNCLEVBQ3RCLFdBQVcsRUFDWCxVQUFVLEVBQ1YsZ0JBQWdCLEVBQ2hCLGFBQWEsR0FDZCxNQUFNLG9CQUFvQixDQUFDOzs7O0FBRzVCOztHQUVHO0FBRUgsTUFBTSxPQUFPLE1BQU07SUF5QmpCLFlBQ1ksUUFBaUIsRUFDakIsU0FBbUIsRUFDQyxxQkFBMkM7SUFDdkUsaURBQWlEO0lBQ2pELGdEQUFnRDtJQUNoQixjQUFtQixFQUNuQixhQUFxQixFQUN6QyxRQUFrQjtRQVB0QixhQUFRLEdBQVIsUUFBUSxDQUFTO1FBQ2pCLGNBQVMsR0FBVCxTQUFTLENBQVU7UUFDQywwQkFBcUIsR0FB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QUFNLFlBQVksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQXdCLENBQUM7UUFDOUUsT0FBTyxFQUFDLEdBQUcsSUFBSSxZQUFZLEVBQUUsRUFBRSxHQUFHLE1BQU0sRUFBQyxDQUFDO0lBQzVDLENBQUM7OzJHQTFRVSxNQUFNLGlFQTRCTCxVQUFVLGFBR1Ysc0JBQXNCLGFBQ2lCLE1BQU07K0dBaEM5QyxNQUFNO21HQUFOLE1BQU07a0JBRGxCLFVBQVU7OzBCQTZCSixNQUFNOzJCQUFDLFVBQVU7OzBCQUdqQixNQUFNOzJCQUFDLHNCQUFzQjs4QkFDaUIsTUFBTTswQkFBcEQsUUFBUTs7MEJBQUksUUFBUTs7MEJBQ3BCLFFBQVEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtcbiAgVGVtcGxhdGVSZWYsXG4gIFNraXBTZWxmLFxuICBPcHRpb25hbCxcbiAgSW5qZWN0YWJsZSxcbiAgSW5qZWN0b3IsXG4gIEluamVjdCxcbiAgQ29tcG9uZW50UmVmLFxuICBPbkRlc3Ryb3ksXG4gIFR5cGUsXG4gIFN0YXRpY1Byb3ZpZGVyLFxuICBJbmplY3RGbGFnc1xufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7Q29tcG9uZW50UG9ydGFsLCBUZW1wbGF0ZVBvcnRhbH0gZnJvbSAnQGFuZ3VsYXIvY2RrL3BvcnRhbCc7XG5pbXBvcnQge29mIGFzIG9ic2VydmFibGVPZiwgT2JzZXJ2YWJsZSwgU3ViamVjdCwgZGVmZXJ9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHtEaWFsb2dSZWZ9IGZyb20gJy4vZGlhbG9nLXJlZic7XG5pbXBvcnQge0xvY2F0aW9ufSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHtEaWFsb2dDb25maWd9IGZyb20gJy4vZGlhbG9nLWNvbmZpZyc7XG5pbXBvcnQge0RpcmVjdGlvbmFsaXR5fSBmcm9tICdAYW5ndWxhci9jZGsvYmlkaSc7XG5pbXBvcnQge0Nka0RpYWxvZ0NvbnRhaW5lcn0gZnJvbSAnLi9kaWFsb2ctY29udGFpbmVyJztcbmltcG9ydCB7XG4gIENvbXBvbmVudFR5cGUsXG4gIE92ZXJsYXksXG4gIE92ZXJsYXlSZWYsXG4gIE92ZXJsYXlDb25maWcsXG4gIFNjcm9sbFN0cmF0ZWd5LFxufSBmcm9tICdAYW5ndWxhci9jZGsvb3ZlcmxheSc7XG5pbXBvcnQge3N0YXJ0V2l0aH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuXG5pbXBvcnQge1xuICBESUFMT0dfU0NST0xMX1NUUkFURUdZLFxuICBESUFMT0dfREFUQSxcbiAgRElBTE9HX1JFRixcbiAgRElBTE9HX0NPTlRBSU5FUixcbiAgRElBTE9HX0NPTkZJRyxcbn0gZnJvbSAnLi9kaWFsb2ctaW5qZWN0b3JzJztcblxuXG4vKipcbiAqIFNlcnZpY2UgdG8gb3BlbiBtb2RhbCBkaWFsb2dzLlxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgRGlhbG9nIGltcGxlbWVudHMgT25EZXN0cm95IHtcbiAgcHJpdmF0ZSBfc2Nyb2xsU3RyYXRlZ3k6ICgpID0+IFNjcm9sbFN0cmF0ZWd5O1xuXG4gIC8qKiBTdHJlYW0gdGhhdCBlbWl0cyB3aGVuIGFsbCBkaWFsb2dzIGFyZSBjbG9zZWQuICovXG4gIF9nZXRBZnRlckFsbENsb3NlZCgpOiBPYnNlcnZhYmxlPHZvaWQ+IHtcbiAgICByZXR1cm4gdGhpcy5fcGFyZW50RGlhbG9nID8gdGhpcy5fcGFyZW50RGlhbG9nLmFmdGVyQWxsQ2xvc2VkIDogdGhpcy5fYWZ0ZXJBbGxDbG9zZWRCYXNlO1xuICB9XG4gIHJlYWRvbmx5IF9hZnRlckFsbENsb3NlZEJhc2UgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xuXG4gIC8vIFRPRE8oamVsYm91cm4pOiB0aWdodGVuIHRoZSB0eXBlIG9uIHRoZSByaWdodC1oYW5kIHNpZGUgb2YgdGhpcyBleHByZXNzaW9uLlxuICBhZnRlckFsbENsb3NlZDogT2JzZXJ2YWJsZTx2b2lkPiA9IGRlZmVyKCgpID0+IHRoaXMub3BlbkRpYWxvZ3MubGVuZ3RoID9cbiAgICAgIHRoaXMuX2dldEFmdGVyQWxsQ2xvc2VkKCkgOiB0aGlzLl9nZXRBZnRlckFsbENsb3NlZCgpLnBpcGUoc3RhcnRXaXRoKHVuZGVmaW5lZCkpKTtcblxuICAvKiogU3RyZWFtIHRoYXQgZW1pdHMgd2hlbiBhIGRpYWxvZyBpcyBvcGVuZWQuICovXG4gIGdldCBhZnRlck9wZW5lZCgpOiBTdWJqZWN0PERpYWxvZ1JlZjxhbnk+PiB7XG4gICAgcmV0dXJuIHRoaXMuX3BhcmVudERpYWxvZyA/IHRoaXMuX3BhcmVudERpYWxvZy5hZnRlck9wZW5lZCA6IHRoaXMuX2FmdGVyT3BlbmVkO1xuICB9XG4gIHJlYWRvbmx5IF9hZnRlck9wZW5lZCA9IG5ldyBTdWJqZWN0PERpYWxvZ1JlZjxhbnk+PigpO1xuXG4gIC8qKiBTdHJlYW0gdGhhdCBlbWl0cyB3aGVuIGEgZGlhbG9nIGlzIG9wZW5lZC4gKi9cbiAgZ2V0IG9wZW5EaWFsb2dzKCk6IERpYWxvZ1JlZjxhbnk+W10ge1xuICAgIHJldHVybiB0aGlzLl9wYXJlbnREaWFsb2cgPyB0aGlzLl9wYXJlbnREaWFsb2cub3BlbkRpYWxvZ3MgOiB0aGlzLl9vcGVuRGlhbG9ncztcbiAgfVxuICBfb3BlbkRpYWxvZ3M6IERpYWxvZ1JlZjxhbnk+W10gPSBbXTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgX292ZXJsYXk6IE92ZXJsYXksXG4gICAgICBwcml2YXRlIF9pbmplY3RvcjogSW5qZWN0b3IsXG4gICAgICBASW5qZWN0KERJQUxPR19SRUYpIHByaXZhdGUgX2RpYWxvZ1JlZkNvbnN0cnVjdG9yOiBUeXBlPERpYWxvZ1JlZjxhbnk+PixcbiAgICAgIC8vIFRPRE8oY3Jpc2JldG8pOiB0aGUgYGFueWAgaGVyZSBjYW4gYmUgcmVwbGFjZWRcbiAgICAgIC8vIHdpdGggdGhlIHByb3BlciB0eXBlIG9uY2Ugd2Ugc3RhcnQgdXNpbmcgSXZ5LlxuICAgICAgQEluamVjdChESUFMT0dfU0NST0xMX1NUUkFURUdZKSBzY3JvbGxTdHJhdGVneTogYW55LFxuICAgICAgQE9wdGlvbmFsKCkgQFNraXBTZWxmKCkgcHJpdmF0ZSBfcGFyZW50RGlhbG9nOiBEaWFsb2csXG4gICAgICBAT3B0aW9uYWwoKSBsb2NhdGlvbjogTG9jYXRpb24pIHtcblxuICAgIC8vIENsb3NlIGFsbCBvZiB0aGUgZGlhbG9ncyB3aGVuIHRoZSB1c2VyIGdvZXMgZm9yd2FyZHMvYmFja3dhcmRzIGluIGhpc3Rvcnkgb3Igd2hlbiB0aGVcbiAgICAvLyBsb2NhdGlvbiBoYXNoIGNoYW5nZXMuIE5vdGUgdGhhdCB0aGlzIHVzdWFsbHkgZG9lc24ndCBpbmNsdWRlIGNsaWNraW5nIG9uIGxpbmtzICh1bmxlc3NcbiAgICAvLyB0aGUgdXNlciBpcyB1c2luZyB0aGUgYEhhc2hMb2NhdGlvblN0cmF0ZWd5YCkuXG4gICAgaWYgKCFfcGFyZW50RGlhbG9nICYmIGxvY2F0aW9uKSB7XG4gICAgICBsb2NhdGlvbi5zdWJzY3JpYmUoKCkgPT4gdGhpcy5jbG9zZUFsbCgpKTtcbiAgICB9XG5cbiAgICB0aGlzLl9zY3JvbGxTdHJhdGVneSA9IHNjcm9sbFN0cmF0ZWd5O1xuICB9XG5cbiAgLyoqIEdldHMgYW4gb3BlbiBkaWFsb2cgYnkgaWQuICovXG4gIGdldEJ5SWQoaWQ6IHN0cmluZyk6IERpYWxvZ1JlZjxhbnk+IHwgdW5kZWZpbmVkIHtcbiAgICByZXR1cm4gdGhpcy5fb3BlbkRpYWxvZ3MuZmluZChyZWYgID0+IHJlZi5pZCA9PT0gaWQpO1xuICB9XG5cbiAgLyoqIENsb3NlcyBhbGwgb3BlbiBkaWFsb2dzLiAqL1xuICBjbG9zZUFsbCgpOiB2b2lkIHtcbiAgICB0aGlzLm9wZW5EaWFsb2dzLmZvckVhY2gocmVmID0+IHJlZi5jbG9zZSgpKTtcbiAgfVxuXG4gIC8qKiBPcGVucyBhIGRpYWxvZyBmcm9tIGEgY29tcG9uZW50LiAqL1xuICBvcGVuRnJvbUNvbXBvbmVudDxUPihjb21wb25lbnQ6IENvbXBvbmVudFR5cGU8VD4sIGNvbmZpZz86IERpYWxvZ0NvbmZpZyk6IERpYWxvZ1JlZjxhbnk+IHtcbiAgICBjb25maWcgPSB0aGlzLl9hcHBseUNvbmZpZ0RlZmF1bHRzKGNvbmZpZyk7XG5cbiAgICBpZiAoY29uZmlnLmlkICYmIHRoaXMuZ2V0QnlJZChjb25maWcuaWQpICYmICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpKSB7XG4gICAgICB0aHJvdyBFcnJvcihgRGlhbG9nIHdpdGggaWQgXCIke2NvbmZpZy5pZH1cIiBleGlzdHMgYWxyZWFkeS4gVGhlIGRpYWxvZyBpZCBtdXN0IGJlIHVuaXF1ZS5gKTtcbiAgICB9XG5cbiAgICBjb25zdCBvdmVybGF5UmVmID0gdGhpcy5fY3JlYXRlT3ZlcmxheShjb25maWcpO1xuICAgIGNvbnN0IGRpYWxvZ0NvbnRhaW5lciA9IHRoaXMuX2F0dGFjaERpYWxvZ0NvbnRhaW5lcihvdmVybGF5UmVmLCBjb25maWcpO1xuICAgIGNvbnN0IGRpYWxvZ1JlZiA9IHRoaXMuX2F0dGFjaERpYWxvZ0NvbnRlbnRGb3JDb21wb25lbnQoY29tcG9uZW50LCBkaWFsb2dDb250YWluZXIsXG4gICAgICBvdmVybGF5UmVmLCBjb25maWcpO1xuXG4gICAgdGhpcy5fcmVnaXN0ZXJEaWFsb2dSZWYoZGlhbG9nUmVmKTtcbiAgICBkaWFsb2dDb250YWluZXIuX2luaXRpYWxpemVXaXRoQXR0YWNoZWRDb250ZW50KCk7XG5cbiAgICByZXR1cm4gZGlhbG9nUmVmO1xuICB9XG5cbiAgLyoqIE9wZW5zIGEgZGlhbG9nIGZyb20gYSB0ZW1wbGF0ZS4gKi9cbiAgb3BlbkZyb21UZW1wbGF0ZTxUPih0ZW1wbGF0ZTogVGVtcGxhdGVSZWY8VD4sIGNvbmZpZz86IERpYWxvZ0NvbmZpZyk6IERpYWxvZ1JlZjxhbnk+IHtcbiAgICBjb25maWcgPSB0aGlzLl9hcHBseUNvbmZpZ0RlZmF1bHRzKGNvbmZpZyk7XG5cbiAgICBpZiAoY29uZmlnLmlkICYmIHRoaXMuZ2V0QnlJZChjb25maWcuaWQpICYmICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpKSB7XG4gICAgICB0aHJvdyBFcnJvcihgRGlhbG9nIHdpdGggaWQgXCIke2NvbmZpZy5pZH1cIiBleGlzdHMgYWxyZWFkeS4gVGhlIGRpYWxvZyBpZCBtdXN0IGJlIHVuaXF1ZS5gKTtcbiAgICB9XG5cbiAgICBjb25zdCBvdmVybGF5UmVmID0gdGhpcy5fY3JlYXRlT3ZlcmxheShjb25maWcpO1xuICAgIGNvbnN0IGRpYWxvZ0NvbnRhaW5lciA9IHRoaXMuX2F0dGFjaERpYWxvZ0NvbnRhaW5lcihvdmVybGF5UmVmLCBjb25maWcpO1xuICAgIGNvbnN0IGRpYWxvZ1JlZiA9IHRoaXMuX2F0dGFjaERpYWxvZ0NvbnRlbnRGb3JUZW1wbGF0ZSh0ZW1wbGF0ZSwgZGlhbG9nQ29udGFpbmVyLFxuICAgICAgb3ZlcmxheVJlZiwgY29uZmlnKTtcblxuICAgIHRoaXMuX3JlZ2lzdGVyRGlhbG9nUmVmKGRpYWxvZ1JlZik7XG4gICAgZGlhbG9nQ29udGFpbmVyLl9pbml0aWFsaXplV2l0aEF0dGFjaGVkQ29udGVudCgpO1xuXG4gICAgcmV0dXJuIGRpYWxvZ1JlZjtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIC8vIE9ubHkgY2xvc2UgYWxsIHRoZSBkaWFsb2dzIGF0IHRoaXMgbGV2ZWwuXG4gICAgdGhpcy5fb3BlbkRpYWxvZ3MuZm9yRWFjaChyZWYgPT4gcmVmLmNsb3NlKCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIEZvcndhcmRzIGVtaXR0aW5nIGV2ZW50cyBmb3Igd2hlbiBkaWFsb2dzIGFyZSBvcGVuZWQgYW5kIGFsbCBkaWFsb2dzIGFyZSBjbG9zZWQuXG4gICAqL1xuICBwcml2YXRlIF9yZWdpc3RlckRpYWxvZ1JlZihkaWFsb2dSZWY6IERpYWxvZ1JlZjxhbnk+KTogdm9pZCB7XG4gICAgdGhpcy5vcGVuRGlhbG9ncy5wdXNoKGRpYWxvZ1JlZik7XG5cbiAgICBjb25zdCBkaWFsb2dPcGVuU3ViID0gZGlhbG9nUmVmLmFmdGVyT3BlbmVkKCkuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgIHRoaXMuYWZ0ZXJPcGVuZWQubmV4dChkaWFsb2dSZWYpO1xuICAgICAgZGlhbG9nT3BlblN1Yi51bnN1YnNjcmliZSgpO1xuICAgIH0pO1xuXG4gICAgY29uc3QgZGlhbG9nQ2xvc2VTdWIgPSBkaWFsb2dSZWYuYWZ0ZXJDbG9zZWQoKS5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgbGV0IGRpYWxvZ0luZGV4ID0gdGhpcy5fb3BlbkRpYWxvZ3MuaW5kZXhPZihkaWFsb2dSZWYpO1xuXG4gICAgICBpZiAoZGlhbG9nSW5kZXggPiAtMSkge1xuICAgICAgICB0aGlzLl9vcGVuRGlhbG9ncy5zcGxpY2UoZGlhbG9nSW5kZXgsIDEpO1xuICAgICAgfVxuXG4gICAgICBpZiAoIXRoaXMuX29wZW5EaWFsb2dzLmxlbmd0aCkge1xuICAgICAgICB0aGlzLl9hZnRlckFsbENsb3NlZEJhc2UubmV4dCgpO1xuICAgICAgICBkaWFsb2dDbG9zZVN1Yi51bnN1YnNjcmliZSgpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYW4gb3ZlcmxheSBjb25maWcgZnJvbSBhIGRpYWxvZyBjb25maWcuXG4gICAqIEBwYXJhbSBjb25maWcgVGhlIGRpYWxvZyBjb25maWd1cmF0aW9uLlxuICAgKiBAcmV0dXJucyBUaGUgb3ZlcmxheSBjb25maWd1cmF0aW9uLlxuICAgKi9cbiAgcHJvdGVjdGVkIF9jcmVhdGVPdmVybGF5KGNvbmZpZzogRGlhbG9nQ29uZmlnKTogT3ZlcmxheVJlZiB7XG4gICAgY29uc3Qgb3ZlcmxheUNvbmZpZyA9IG5ldyBPdmVybGF5Q29uZmlnKHtcbiAgICAgIHBvc2l0aW9uU3RyYXRlZ3k6IHRoaXMuX292ZXJsYXkucG9zaXRpb24oKS5nbG9iYWwoKSxcbiAgICAgIHNjcm9sbFN0cmF0ZWd5OiB0aGlzLl9zY3JvbGxTdHJhdGVneSgpLFxuICAgICAgcGFuZWxDbGFzczogY29uZmlnLnBhbmVsQ2xhc3MsXG4gICAgICBoYXNCYWNrZHJvcDogY29uZmlnLmhhc0JhY2tkcm9wLFxuICAgICAgZGlyZWN0aW9uOiBjb25maWcuZGlyZWN0aW9uLFxuICAgICAgbWluV2lkdGg6IGNvbmZpZy5taW5XaWR0aCxcbiAgICAgIG1pbkhlaWdodDogY29uZmlnLm1pbkhlaWdodCxcbiAgICAgIG1heFdpZHRoOiBjb25maWcubWF4V2lkdGgsXG4gICAgICBtYXhIZWlnaHQ6IGNvbmZpZy5tYXhIZWlnaHRcbiAgICB9KTtcblxuICAgIGlmIChjb25maWcuYmFja2Ryb3BDbGFzcykge1xuICAgICAgb3ZlcmxheUNvbmZpZy5iYWNrZHJvcENsYXNzID0gY29uZmlnLmJhY2tkcm9wQ2xhc3M7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9vdmVybGF5LmNyZWF0ZShvdmVybGF5Q29uZmlnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBdHRhY2hlcyBhbiBNYXREaWFsb2dDb250YWluZXIgdG8gYSBkaWFsb2cncyBhbHJlYWR5LWNyZWF0ZWQgb3ZlcmxheS5cbiAgICogQHBhcmFtIG92ZXJsYXkgUmVmZXJlbmNlIHRvIHRoZSBkaWFsb2cncyB1bmRlcmx5aW5nIG92ZXJsYXkuXG4gICAqIEBwYXJhbSBjb25maWcgVGhlIGRpYWxvZyBjb25maWd1cmF0aW9uLlxuICAgKiBAcmV0dXJucyBBIHByb21pc2UgcmVzb2x2aW5nIHRvIGEgQ29tcG9uZW50UmVmIGZvciB0aGUgYXR0YWNoZWQgY29udGFpbmVyLlxuICAgKi9cbiAgcHJvdGVjdGVkIF9hdHRhY2hEaWFsb2dDb250YWluZXIob3ZlcmxheTogT3ZlcmxheVJlZiwgY29uZmlnOiBEaWFsb2dDb25maWcpOiBDZGtEaWFsb2dDb250YWluZXIge1xuICAgIGNvbnN0IGNvbnRhaW5lciA9IGNvbmZpZy5jb250YWluZXJDb21wb25lbnQgfHwgdGhpcy5faW5qZWN0b3IuZ2V0KERJQUxPR19DT05UQUlORVIpO1xuICAgIGNvbnN0IHVzZXJJbmplY3RvciA9IGNvbmZpZyAmJiBjb25maWcudmlld0NvbnRhaW5lclJlZiAmJiBjb25maWcudmlld0NvbnRhaW5lclJlZi5pbmplY3RvcjtcbiAgICBjb25zdCBpbmplY3RvciA9IEluamVjdG9yLmNyZWF0ZSh7XG4gICAgICBwYXJlbnQ6IHVzZXJJbmplY3RvciB8fCB0aGlzLl9pbmplY3RvcixcbiAgICAgIHByb3ZpZGVyczogW3twcm92aWRlOiBEaWFsb2dDb25maWcsIHVzZVZhbHVlOiBjb25maWd9XVxuICAgIH0pO1xuICAgIGNvbnN0IGNvbnRhaW5lclBvcnRhbCA9IG5ldyBDb21wb25lbnRQb3J0YWwoY29udGFpbmVyLCBjb25maWcudmlld0NvbnRhaW5lclJlZiwgaW5qZWN0b3IpO1xuICAgIGNvbnN0IGNvbnRhaW5lclJlZjogQ29tcG9uZW50UmVmPENka0RpYWxvZ0NvbnRhaW5lcj4gPSBvdmVybGF5LmF0dGFjaChjb250YWluZXJQb3J0YWwpO1xuICAgIGNvbnRhaW5lclJlZi5pbnN0YW5jZS5fY29uZmlnID0gY29uZmlnO1xuXG4gICAgcmV0dXJuIGNvbnRhaW5lclJlZi5pbnN0YW5jZTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIEF0dGFjaGVzIHRoZSB1c2VyLXByb3ZpZGVkIGNvbXBvbmVudCB0byB0aGUgYWxyZWFkeS1jcmVhdGVkIE1hdERpYWxvZ0NvbnRhaW5lci5cbiAgICogQHBhcmFtIGNvbXBvbmVudE9yVGVtcGxhdGVSZWYgVGhlIHR5cGUgb2YgY29tcG9uZW50IGJlaW5nIGxvYWRlZCBpbnRvIHRoZSBkaWFsb2csXG4gICAqICAgICBvciBhIFRlbXBsYXRlUmVmIHRvIGluc3RhbnRpYXRlIGFzIHRoZSBjb250ZW50LlxuICAgKiBAcGFyYW0gZGlhbG9nQ29udGFpbmVyIFJlZmVyZW5jZSB0byB0aGUgd3JhcHBpbmcgTWF0RGlhbG9nQ29udGFpbmVyLlxuICAgKiBAcGFyYW0gb3ZlcmxheVJlZiBSZWZlcmVuY2UgdG8gdGhlIG92ZXJsYXkgaW4gd2hpY2ggdGhlIGRpYWxvZyByZXNpZGVzLlxuICAgKiBAcGFyYW0gY29uZmlnIFRoZSBkaWFsb2cgY29uZmlndXJhdGlvbi5cbiAgICogQHJldHVybnMgQSBwcm9taXNlIHJlc29sdmluZyB0byB0aGUgTWF0RGlhbG9nUmVmIHRoYXQgc2hvdWxkIGJlIHJldHVybmVkIHRvIHRoZSB1c2VyLlxuICAgKi9cbiAgcHJvdGVjdGVkIF9hdHRhY2hEaWFsb2dDb250ZW50Rm9yQ29tcG9uZW50PFQ+KFxuICAgICAgY29tcG9uZW50T3JUZW1wbGF0ZVJlZjogQ29tcG9uZW50VHlwZTxUPixcbiAgICAgIGRpYWxvZ0NvbnRhaW5lcjogQ2RrRGlhbG9nQ29udGFpbmVyLFxuICAgICAgb3ZlcmxheVJlZjogT3ZlcmxheVJlZixcbiAgICAgIGNvbmZpZzogRGlhbG9nQ29uZmlnKTogRGlhbG9nUmVmPGFueT4ge1xuXG4gICAgLy8gQ3JlYXRlIGEgcmVmZXJlbmNlIHRvIHRoZSBkaWFsb2cgd2UncmUgY3JlYXRpbmcgaW4gb3JkZXIgdG8gZ2l2ZSB0aGUgdXNlciBhIGhhbmRsZVxuICAgIC8vIHRvIG1vZGlmeSBhbmQgY2xvc2UgaXQuXG4gICAgY29uc3QgZGlhbG9nUmVmID0gdGhpcy5fY3JlYXRlRGlhbG9nUmVmKG92ZXJsYXlSZWYsIGRpYWxvZ0NvbnRhaW5lciwgY29uZmlnKTtcbiAgICBjb25zdCBpbmplY3RvciA9IHRoaXMuX2NyZWF0ZUluamVjdG9yPFQ+KGNvbmZpZywgZGlhbG9nUmVmLCBkaWFsb2dDb250YWluZXIpO1xuICAgIGNvbnN0IGNvbnRlbnRSZWYgPSBkaWFsb2dDb250YWluZXIuYXR0YWNoQ29tcG9uZW50UG9ydGFsKFxuICAgICAgICBuZXcgQ29tcG9uZW50UG9ydGFsKGNvbXBvbmVudE9yVGVtcGxhdGVSZWYsIHVuZGVmaW5lZCwgaW5qZWN0b3IpKTtcbiAgICBkaWFsb2dSZWYuY29tcG9uZW50SW5zdGFuY2UgPSBjb250ZW50UmVmLmluc3RhbmNlO1xuICAgIHJldHVybiBkaWFsb2dSZWY7XG4gIH1cblxuICAvKipcbiAgICogQXR0YWNoZXMgdGhlIHVzZXItcHJvdmlkZWQgY29tcG9uZW50IHRvIHRoZSBhbHJlYWR5LWNyZWF0ZWQgTWF0RGlhbG9nQ29udGFpbmVyLlxuICAgKiBAcGFyYW0gY29tcG9uZW50T3JUZW1wbGF0ZVJlZiBUaGUgdHlwZSBvZiBjb21wb25lbnQgYmVpbmcgbG9hZGVkIGludG8gdGhlIGRpYWxvZyxcbiAgICogICAgIG9yIGEgVGVtcGxhdGVSZWYgdG8gaW5zdGFudGlhdGUgYXMgdGhlIGNvbnRlbnQuXG4gICAqIEBwYXJhbSBkaWFsb2dDb250YWluZXIgUmVmZXJlbmNlIHRvIHRoZSB3cmFwcGluZyBNYXREaWFsb2dDb250YWluZXIuXG4gICAqIEBwYXJhbSBvdmVybGF5UmVmIFJlZmVyZW5jZSB0byB0aGUgb3ZlcmxheSBpbiB3aGljaCB0aGUgZGlhbG9nIHJlc2lkZXMuXG4gICAqIEBwYXJhbSBjb25maWcgVGhlIGRpYWxvZyBjb25maWd1cmF0aW9uLlxuICAgKiBAcmV0dXJucyBBIHByb21pc2UgcmVzb2x2aW5nIHRvIHRoZSBNYXREaWFsb2dSZWYgdGhhdCBzaG91bGQgYmUgcmV0dXJuZWQgdG8gdGhlIHVzZXIuXG4gICAqL1xuICBwcm90ZWN0ZWQgX2F0dGFjaERpYWxvZ0NvbnRlbnRGb3JUZW1wbGF0ZTxUPihcbiAgICAgIGNvbXBvbmVudE9yVGVtcGxhdGVSZWY6IFRlbXBsYXRlUmVmPFQ+LFxuICAgICAgZGlhbG9nQ29udGFpbmVyOiBDZGtEaWFsb2dDb250YWluZXIsXG4gICAgICBvdmVybGF5UmVmOiBPdmVybGF5UmVmLFxuICAgICAgY29uZmlnOiBEaWFsb2dDb25maWcpOiBEaWFsb2dSZWY8YW55PiB7XG5cbiAgICAvLyBDcmVhdGUgYSByZWZlcmVuY2UgdG8gdGhlIGRpYWxvZyB3ZSdyZSBjcmVhdGluZyBpbiBvcmRlciB0byBnaXZlIHRoZSB1c2VyIGEgaGFuZGxlXG4gICAgLy8gdG8gbW9kaWZ5IGFuZCBjbG9zZSBpdC5cbiAgICBjb25zdCBkaWFsb2dSZWYgPSB0aGlzLl9jcmVhdGVEaWFsb2dSZWYob3ZlcmxheVJlZiwgZGlhbG9nQ29udGFpbmVyLCBjb25maWcpO1xuICAgIGRpYWxvZ0NvbnRhaW5lci5hdHRhY2hUZW1wbGF0ZVBvcnRhbChcbiAgICAgIG5ldyBUZW1wbGF0ZVBvcnRhbDxUPihjb21wb25lbnRPclRlbXBsYXRlUmVmLCBudWxsISxcbiAgICAgICAgPGFueT57JGltcGxpY2l0OiBjb25maWcuZGF0YSwgZGlhbG9nUmVmfSkpO1xuICAgIHJldHVybiBkaWFsb2dSZWY7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgY3VzdG9tIGluamVjdG9yIHRvIGJlIHVzZWQgaW5zaWRlIHRoZSBkaWFsb2cuIFRoaXMgYWxsb3dzIGEgY29tcG9uZW50IGxvYWRlZCBpbnNpZGVcbiAgICogb2YgYSBkaWFsb2cgdG8gY2xvc2UgaXRzZWxmIGFuZCwgb3B0aW9uYWxseSwgdG8gcmV0dXJuIGEgdmFsdWUuXG4gICAqIEBwYXJhbSBjb25maWcgQ29uZmlnIG9iamVjdCB0aGF0IGlzIHVzZWQgdG8gY29uc3RydWN0IHRoZSBkaWFsb2cuXG4gICAqIEBwYXJhbSBkaWFsb2dSZWYgUmVmZXJlbmNlIHRvIHRoZSBkaWFsb2cuXG4gICAqIEBwYXJhbSBjb250YWluZXIgRGlhbG9nIGNvbnRhaW5lciBlbGVtZW50IHRoYXQgd3JhcHMgYWxsIG9mIHRoZSBjb250ZW50cy5cbiAgICogQHJldHVybnMgVGhlIGN1c3RvbSBpbmplY3RvciB0aGF0IGNhbiBiZSB1c2VkIGluc2lkZSB0aGUgZGlhbG9nLlxuICAgKi9cbiAgcHJpdmF0ZSBfY3JlYXRlSW5qZWN0b3I8VD4oXG4gICAgICBjb25maWc6IERpYWxvZ0NvbmZpZyxcbiAgICAgIGRpYWxvZ1JlZjogRGlhbG9nUmVmPFQ+LFxuICAgICAgZGlhbG9nQ29udGFpbmVyOiBDZGtEaWFsb2dDb250YWluZXIpOiBJbmplY3RvciB7XG5cbiAgICBjb25zdCB1c2VySW5qZWN0b3IgPSBjb25maWcgJiYgY29uZmlnLnZpZXdDb250YWluZXJSZWYgJiYgY29uZmlnLnZpZXdDb250YWluZXJSZWYuaW5qZWN0b3I7XG4gICAgY29uc3QgcHJvdmlkZXJzOiBTdGF0aWNQcm92aWRlcltdID0gW1xuICAgICAge3Byb3ZpZGU6IHRoaXMuX2luamVjdG9yLmdldChESUFMT0dfUkVGKSwgdXNlVmFsdWU6IGRpYWxvZ1JlZn0sXG4gICAgICB7cHJvdmlkZTogdGhpcy5faW5qZWN0b3IuZ2V0KERJQUxPR19DT05UQUlORVIpLCB1c2VWYWx1ZTogZGlhbG9nQ29udGFpbmVyfSxcbiAgICAgIHtwcm92aWRlOiBESUFMT0dfREFUQSwgdXNlVmFsdWU6IGNvbmZpZy5kYXRhfVxuICAgIF07XG5cbiAgICBpZiAoY29uZmlnLmRpcmVjdGlvbiAmJiAoIXVzZXJJbmplY3RvciB8fFxuICAgICAgIXVzZXJJbmplY3Rvci5nZXQ8RGlyZWN0aW9uYWxpdHkgfCBudWxsPihEaXJlY3Rpb25hbGl0eSwgbnVsbCwgSW5qZWN0RmxhZ3MuT3B0aW9uYWwpKSkge1xuICAgICAgcHJvdmlkZXJzLnB1c2goe1xuICAgICAgICBwcm92aWRlOiBEaXJlY3Rpb25hbGl0eSxcbiAgICAgICAgdXNlVmFsdWU6IHt2YWx1ZTogY29uZmlnLmRpcmVjdGlvbiwgY2hhbmdlOiBvYnNlcnZhYmxlT2YoKX1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBJbmplY3Rvci5jcmVhdGUoe3BhcmVudDogdXNlckluamVjdG9yIHx8IHRoaXMuX2luamVjdG9yLCBwcm92aWRlcnN9KTtcbiAgfVxuXG4gIC8qKiBDcmVhdGVzIGEgbmV3IGRpYWxvZyByZWYuICovXG4gIHByaXZhdGUgX2NyZWF0ZURpYWxvZ1JlZihvdmVybGF5UmVmOiBPdmVybGF5UmVmLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlhbG9nQ29udGFpbmVyOiBDZGtEaWFsb2dDb250YWluZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWc6IERpYWxvZ0NvbmZpZykge1xuICAgIGNvbnN0IGRpYWxvZ1JlZiA9IG5ldyB0aGlzLl9kaWFsb2dSZWZDb25zdHJ1Y3RvcihvdmVybGF5UmVmLCBkaWFsb2dDb250YWluZXIsIGNvbmZpZy5pZCk7XG4gICAgZGlhbG9nUmVmLmRpc2FibGVDbG9zZSA9IGNvbmZpZy5kaXNhYmxlQ2xvc2U7XG4gICAgZGlhbG9nUmVmLnVwZGF0ZVNpemUoY29uZmlnKS51cGRhdGVQb3NpdGlvbihjb25maWcucG9zaXRpb24pO1xuICAgIHJldHVybiBkaWFsb2dSZWY7XG4gIH1cblxuICAvKipcbiAgICogRXhwYW5kcyB0aGUgcHJvdmlkZWQgY29uZmlndXJhdGlvbiBvYmplY3QgdG8gaW5jbHVkZSB0aGUgZGVmYXVsdCB2YWx1ZXMgZm9yIHByb3BlcnRpZXMgd2hpY2hcbiAgICogYXJlIHVuZGVmaW5lZC5cbiAgICovXG4gIHByaXZhdGUgX2FwcGx5Q29uZmlnRGVmYXVsdHMoY29uZmlnPzogRGlhbG9nQ29uZmlnKTogRGlhbG9nQ29uZmlnIHtcbiAgICBjb25zdCBkaWFsb2dDb25maWcgPSB0aGlzLl9pbmplY3Rvci5nZXQoRElBTE9HX0NPTkZJRykgYXMgdHlwZW9mIERpYWxvZ0NvbmZpZztcbiAgICByZXR1cm4gey4uLm5ldyBkaWFsb2dDb25maWcoKSwgLi4uY29uZmlnfTtcbiAgfVxufVxuIl19