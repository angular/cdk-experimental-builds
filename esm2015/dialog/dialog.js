/**
 * @fileoverview added by tsickle
 * Generated from: src/cdk-experimental/dialog/dialog.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
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
let Dialog = /** @class */ (() => {
    /**
     * Service to open modal dialogs.
     */
    class Dialog {
        /**
         * @param {?} _overlay
         * @param {?} _injector
         * @param {?} _dialogRefConstructor
         * @param {?} scrollStrategy
         * @param {?} _parentDialog
         * @param {?} location
         */
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
            this.afterAllClosed = defer((/**
             * @return {?}
             */
            () => this.openDialogs.length ?
                this._afterAllClosed : this._afterAllClosed.pipe(startWith(undefined))));
            this._afterOpened = new Subject();
            this._openDialogs = [];
            // Close all of the dialogs when the user goes forwards/backwards in history or when the
            // location hash changes. Note that this usually doesn't include clicking on links (unless
            // the user is using the `HashLocationStrategy`).
            if (!_parentDialog && location) {
                location.subscribe((/**
                 * @return {?}
                 */
                () => this.closeAll()));
            }
            this._scrollStrategy = scrollStrategy;
        }
        /**
         * Stream that emits when all dialogs are closed.
         * @return {?}
         */
        get _afterAllClosed() {
            return this._parentDialog ? this._parentDialog.afterAllClosed : this._afterAllClosedBase;
        }
        /**
         * Stream that emits when a dialog is opened.
         * @return {?}
         */
        get afterOpened() {
            return this._parentDialog ? this._parentDialog.afterOpened : this._afterOpened;
        }
        /**
         * Stream that emits when a dialog is opened.
         * @return {?}
         */
        get openDialogs() {
            return this._parentDialog ? this._parentDialog.openDialogs : this._openDialogs;
        }
        /**
         * Gets an open dialog by id.
         * @param {?} id
         * @return {?}
         */
        getById(id) {
            return this._openDialogs.find((/**
             * @param {?} ref
             * @return {?}
             */
            ref => ref.id === id));
        }
        /**
         * Closes all open dialogs.
         * @return {?}
         */
        closeAll() {
            this.openDialogs.forEach((/**
             * @param {?} ref
             * @return {?}
             */
            ref => ref.close()));
        }
        /**
         * Opens a dialog from a component.
         * @template T
         * @param {?} component
         * @param {?=} config
         * @return {?}
         */
        openFromComponent(component, config) {
            config = this._applyConfigDefaults(config);
            if (config.id && this.getById(config.id)) {
                throw Error(`Dialog with id "${config.id}" exists already. The dialog id must be unique.`);
            }
            /** @type {?} */
            const overlayRef = this._createOverlay(config);
            /** @type {?} */
            const dialogContainer = this._attachDialogContainer(overlayRef, config);
            /** @type {?} */
            const dialogRef = this._attachDialogContentForComponent(component, dialogContainer, overlayRef, config);
            this._registerDialogRef(dialogRef);
            return dialogRef;
        }
        /**
         * Opens a dialog from a template.
         * @template T
         * @param {?} template
         * @param {?=} config
         * @return {?}
         */
        openFromTemplate(template, config) {
            config = this._applyConfigDefaults(config);
            if (config.id && this.getById(config.id)) {
                throw Error(`Dialog with id "${config.id}" exists already. The dialog id must be unique.`);
            }
            /** @type {?} */
            const overlayRef = this._createOverlay(config);
            /** @type {?} */
            const dialogContainer = this._attachDialogContainer(overlayRef, config);
            /** @type {?} */
            const dialogRef = this._attachDialogContentForTemplate(template, dialogContainer, overlayRef, config);
            this._registerDialogRef(dialogRef);
            return dialogRef;
        }
        /**
         * @return {?}
         */
        ngOnDestroy() {
            // Only close all the dialogs at this level.
            this._openDialogs.forEach((/**
             * @param {?} ref
             * @return {?}
             */
            ref => ref.close()));
        }
        /**
         * Forwards emitting events for when dialogs are opened and all dialogs are closed.
         * @private
         * @param {?} dialogRef
         * @return {?}
         */
        _registerDialogRef(dialogRef) {
            this.openDialogs.push(dialogRef);
            /** @type {?} */
            const dialogOpenSub = dialogRef.afterOpened().subscribe((/**
             * @return {?}
             */
            () => {
                this.afterOpened.next(dialogRef);
                dialogOpenSub.unsubscribe();
            }));
            /** @type {?} */
            const dialogCloseSub = dialogRef.afterClosed().subscribe((/**
             * @return {?}
             */
            () => {
                /** @type {?} */
                let dialogIndex = this._openDialogs.indexOf(dialogRef);
                if (dialogIndex > -1) {
                    this._openDialogs.splice(dialogIndex, 1);
                }
                if (!this._openDialogs.length) {
                    this._afterAllClosedBase.next();
                    dialogCloseSub.unsubscribe();
                }
            }));
        }
        /**
         * Creates an overlay config from a dialog config.
         * @protected
         * @param {?} config The dialog configuration.
         * @return {?} The overlay configuration.
         */
        _createOverlay(config) {
            /** @type {?} */
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
         * @protected
         * @param {?} overlay Reference to the dialog's underlying overlay.
         * @param {?} config The dialog configuration.
         * @return {?} A promise resolving to a ComponentRef for the attached container.
         */
        _attachDialogContainer(overlay, config) {
            /** @type {?} */
            const container = config.containerComponent || this._injector.get(DIALOG_CONTAINER);
            /** @type {?} */
            const userInjector = config && config.viewContainerRef && config.viewContainerRef.injector;
            /** @type {?} */
            const injector = new PortalInjector(userInjector || this._injector, new WeakMap([
                [DialogConfig, config]
            ]));
            /** @type {?} */
            const containerPortal = new ComponentPortal(container, config.viewContainerRef, injector);
            /** @type {?} */
            const containerRef = overlay.attach(containerPortal);
            containerRef.instance._config = config;
            return containerRef.instance;
        }
        /**
         * Attaches the user-provided component to the already-created MatDialogContainer.
         * @protected
         * @template T
         * @param {?} componentOrTemplateRef The type of component being loaded into the dialog,
         *     or a TemplateRef to instantiate as the content.
         * @param {?} dialogContainer Reference to the wrapping MatDialogContainer.
         * @param {?} overlayRef Reference to the overlay in which the dialog resides.
         * @param {?} config The dialog configuration.
         * @return {?} A promise resolving to the MatDialogRef that should be returned to the user.
         */
        _attachDialogContentForComponent(componentOrTemplateRef, dialogContainer, overlayRef, config) {
            // Create a reference to the dialog we're creating in order to give the user a handle
            // to modify and close it.
            /** @type {?} */
            const dialogRef = this._createDialogRef(overlayRef, dialogContainer, config);
            /** @type {?} */
            const injector = this._createInjector(config, dialogRef, dialogContainer);
            /** @type {?} */
            const contentRef = dialogContainer.attachComponentPortal(new ComponentPortal(componentOrTemplateRef, undefined, injector));
            dialogRef.componentInstance = contentRef.instance;
            return dialogRef;
        }
        /**
         * Attaches the user-provided component to the already-created MatDialogContainer.
         * @protected
         * @template T
         * @param {?} componentOrTemplateRef The type of component being loaded into the dialog,
         *     or a TemplateRef to instantiate as the content.
         * @param {?} dialogContainer Reference to the wrapping MatDialogContainer.
         * @param {?} overlayRef Reference to the overlay in which the dialog resides.
         * @param {?} config The dialog configuration.
         * @return {?} A promise resolving to the MatDialogRef that should be returned to the user.
         */
        _attachDialogContentForTemplate(componentOrTemplateRef, dialogContainer, overlayRef, config) {
            // Create a reference to the dialog we're creating in order to give the user a handle
            // to modify and close it.
            /** @type {?} */
            const dialogRef = this._createDialogRef(overlayRef, dialogContainer, config);
            dialogContainer.attachTemplatePortal(new TemplatePortal(componentOrTemplateRef, (/** @type {?} */ (null)), (/** @type {?} */ ({ $implicit: config.data, dialogRef }))));
            return dialogRef;
        }
        /**
         * Creates a custom injector to be used inside the dialog. This allows a component loaded inside
         * of a dialog to close itself and, optionally, to return a value.
         * @private
         * @template T
         * @param {?} config Config object that is used to construct the dialog.
         * @param {?} dialogRef Reference to the dialog.
         * @param {?} dialogContainer
         * @return {?} The custom injector that can be used inside the dialog.
         */
        _createInjector(config, dialogRef, dialogContainer) {
            /** @type {?} */
            const userInjector = config && config.viewContainerRef && config.viewContainerRef.injector;
            /** @type {?} */
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
        /**
         * Creates a new dialog ref.
         * @private
         * @param {?} overlayRef
         * @param {?} dialogContainer
         * @param {?} config
         * @return {?}
         */
        _createDialogRef(overlayRef, dialogContainer, config) {
            /** @type {?} */
            const dialogRef = new this._dialogRefConstructor(overlayRef, dialogContainer, config.id);
            dialogRef.disableClose = config.disableClose;
            dialogRef.updateSize(config).updatePosition(config.position);
            return dialogRef;
        }
        /**
         * Expands the provided configuration object to include the default values for properties which
         * are undefined.
         * @private
         * @param {?=} config
         * @return {?}
         */
        _applyConfigDefaults(config) {
            /** @type {?} */
            const dialogConfig = (/** @type {?} */ (this._injector.get(DIALOG_CONFIG)));
            return Object.assign(Object.assign({}, new dialogConfig()), config);
        }
    }
    Dialog.decorators = [
        { type: Injectable }
    ];
    /** @nocollapse */
    Dialog.ctorParameters = () => [
        { type: Overlay },
        { type: Injector },
        { type: Type, decorators: [{ type: Inject, args: [DIALOG_REF,] }] },
        { type: undefined, decorators: [{ type: Inject, args: [DIALOG_SCROLL_STRATEGY,] }] },
        { type: Dialog, decorators: [{ type: Optional }, { type: SkipSelf }] },
        { type: Location, decorators: [{ type: Optional }] }
    ];
    return Dialog;
})();
export { Dialog };
if (false) {
    /**
     * @type {?}
     * @private
     */
    Dialog.prototype._scrollStrategy;
    /** @type {?} */
    Dialog.prototype._afterAllClosedBase;
    /** @type {?} */
    Dialog.prototype.afterAllClosed;
    /** @type {?} */
    Dialog.prototype._afterOpened;
    /** @type {?} */
    Dialog.prototype._openDialogs;
    /**
     * @type {?}
     * @private
     */
    Dialog.prototype._overlay;
    /**
     * @type {?}
     * @private
     */
    Dialog.prototype._injector;
    /**
     * @type {?}
     * @private
     */
    Dialog.prototype._dialogRefConstructor;
    /**
     * @type {?}
     * @private
     */
    Dialog.prototype._parentDialog;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhbG9nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvZGlhbG9nL2RpYWxvZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFRQSxPQUFPLEVBRUwsUUFBUSxFQUNSLFFBQVEsRUFDUixVQUFVLEVBQ1YsUUFBUSxFQUNSLE1BQU0sRUFHTixJQUFJLEVBQ0wsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFDLGVBQWUsRUFBRSxjQUFjLEVBQUUsY0FBYyxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDcEYsT0FBTyxFQUFDLEVBQUUsSUFBSSxZQUFZLEVBQWMsT0FBTyxFQUFFLEtBQUssRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUVwRSxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDekMsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQzdDLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUVqRCxPQUFPLEVBRUwsT0FBTyxFQUVQLGFBQWEsR0FFZCxNQUFNLHNCQUFzQixDQUFDO0FBQzlCLE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUV6QyxPQUFPLEVBQ0wsc0JBQXNCLEVBQ3RCLFdBQVcsRUFDWCxVQUFVLEVBQ1YsZ0JBQWdCLEVBQ2hCLGFBQWEsR0FDZCxNQUFNLG9CQUFvQixDQUFDOzs7O0FBTTVCOzs7O0lBQUEsTUFDYSxNQUFNOzs7Ozs7Ozs7UUF5QmpCLFlBQ1ksUUFBaUIsRUFDakIsU0FBbUIsRUFDQyxxQkFBMkM7UUFDdkUsaURBQWlEO1FBQ2pELGdEQUFnRDtRQUNoQixjQUFtQixFQUNuQixhQUFxQixFQUN6QyxRQUFrQjtZQVB0QixhQUFRLEdBQVIsUUFBUSxDQUFTO1lBQ2pCLGNBQVMsR0FBVCxTQUFTLENBQVU7WUFDQywwQkFBcUIsR0FBckIs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QUFDLFVBQXNCLEVBQ3RCLGVBQW1DLEVBQ25DLE1BQW9COztrQkFDckMsU0FBUyxHQUFHLElBQUksSUFBSSxDQUFDLHFCQUFxQixDQUFDLFVBQVUsRUFBRSxlQUFlLEVBQUUsTUFBTSxDQUFDLEVBQUUsQ0FBQztZQUN4RixTQUFTLENBQUMsWUFBWSxHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUM7WUFDN0MsU0FBUyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQzdELE9BQU8sU0FBUyxDQUFDO1FBQ25CLENBQUM7Ozs7Ozs7O1FBTU8sb0JBQW9CLENBQUMsTUFBcUI7O2tCQUMxQyxZQUFZLEdBQUcsbUJBQUEsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLEVBQXVCO1lBQzdFLHVDQUFXLElBQUksWUFBWSxFQUFFLEdBQUssTUFBTSxFQUFFO1FBQzVDLENBQUM7OztnQkF0UUYsVUFBVTs7OztnQkFuQlQsT0FBTztnQkFmUCxRQUFRO2dCQUlSLElBQUksdUJBMkRDLE1BQU0sU0FBQyxVQUFVO2dEQUdqQixNQUFNLFNBQUMsc0JBQXNCO2dCQUNpQixNQUFNLHVCQUFwRCxRQUFRLFlBQUksUUFBUTtnQkExRG5CLFFBQVEsdUJBMkRULFFBQVE7O0lBcU9mLGFBQUM7S0FBQTtTQXRRWSxNQUFNOzs7Ozs7SUFDakIsaUNBQThDOztJQU05QyxxQ0FBMEM7O0lBRzFDLGdDQUM0RTs7SUFNNUUsOEJBQXNEOztJQU10RCw4QkFBb0M7Ozs7O0lBR2hDLDBCQUF5Qjs7Ozs7SUFDekIsMkJBQTJCOzs7OztJQUMzQix1Q0FBdUU7Ozs7O0lBSXZFLCtCQUFxRCIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1xuICBUZW1wbGF0ZVJlZixcbiAgU2tpcFNlbGYsXG4gIE9wdGlvbmFsLFxuICBJbmplY3RhYmxlLFxuICBJbmplY3RvcixcbiAgSW5qZWN0LFxuICBDb21wb25lbnRSZWYsXG4gIE9uRGVzdHJveSxcbiAgVHlwZVxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7Q29tcG9uZW50UG9ydGFsLCBQb3J0YWxJbmplY3RvciwgVGVtcGxhdGVQb3J0YWx9IGZyb20gJ0Bhbmd1bGFyL2Nkay9wb3J0YWwnO1xuaW1wb3J0IHtvZiBhcyBvYnNlcnZhYmxlT2YsIE9ic2VydmFibGUsIFN1YmplY3QsIGRlZmVyfSBmcm9tICdyeGpzJztcbmltcG9ydCB7RGlhbG9nUmVmfSBmcm9tICcuL2RpYWxvZy1yZWYnO1xuaW1wb3J0IHtMb2NhdGlvbn0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7RGlhbG9nQ29uZmlnfSBmcm9tICcuL2RpYWxvZy1jb25maWcnO1xuaW1wb3J0IHtEaXJlY3Rpb25hbGl0eX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2JpZGknO1xuaW1wb3J0IHtDZGtEaWFsb2dDb250YWluZXJ9IGZyb20gJy4vZGlhbG9nLWNvbnRhaW5lcic7XG5pbXBvcnQge1xuICBDb21wb25lbnRUeXBlLFxuICBPdmVybGF5LFxuICBPdmVybGF5UmVmLFxuICBPdmVybGF5Q29uZmlnLFxuICBTY3JvbGxTdHJhdGVneSxcbn0gZnJvbSAnQGFuZ3VsYXIvY2RrL292ZXJsYXknO1xuaW1wb3J0IHtzdGFydFdpdGh9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcblxuaW1wb3J0IHtcbiAgRElBTE9HX1NDUk9MTF9TVFJBVEVHWSxcbiAgRElBTE9HX0RBVEEsXG4gIERJQUxPR19SRUYsXG4gIERJQUxPR19DT05UQUlORVIsXG4gIERJQUxPR19DT05GSUcsXG59IGZyb20gJy4vZGlhbG9nLWluamVjdG9ycyc7XG5cblxuLyoqXG4gKiBTZXJ2aWNlIHRvIG9wZW4gbW9kYWwgZGlhbG9ncy5cbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIERpYWxvZyBpbXBsZW1lbnRzIE9uRGVzdHJveSB7XG4gIHByaXZhdGUgX3Njcm9sbFN0cmF0ZWd5OiAoKSA9PiBTY3JvbGxTdHJhdGVneTtcblxuICAvKiogU3RyZWFtIHRoYXQgZW1pdHMgd2hlbiBhbGwgZGlhbG9ncyBhcmUgY2xvc2VkLiAqL1xuICBnZXQgX2FmdGVyQWxsQ2xvc2VkKCk6IE9ic2VydmFibGU8dm9pZD4ge1xuICAgIHJldHVybiB0aGlzLl9wYXJlbnREaWFsb2cgPyB0aGlzLl9wYXJlbnREaWFsb2cuYWZ0ZXJBbGxDbG9zZWQgOiB0aGlzLl9hZnRlckFsbENsb3NlZEJhc2U7XG4gIH1cbiAgX2FmdGVyQWxsQ2xvc2VkQmFzZSA9IG5ldyBTdWJqZWN0PHZvaWQ+KCk7XG5cbiAgLy8gVE9ETyhqZWxib3Vybik6IHRpZ2h0ZW4gdGhlIHR5cGUgb24gdGhlIHJpZ2h0LWhhbmQgc2lkZSBvZiB0aGlzIGV4cHJlc3Npb24uXG4gIGFmdGVyQWxsQ2xvc2VkOiBPYnNlcnZhYmxlPHZvaWQ+ID0gZGVmZXIoKCkgPT4gdGhpcy5vcGVuRGlhbG9ncy5sZW5ndGggP1xuICAgICAgdGhpcy5fYWZ0ZXJBbGxDbG9zZWQgOiB0aGlzLl9hZnRlckFsbENsb3NlZC5waXBlKHN0YXJ0V2l0aCh1bmRlZmluZWQpKSk7XG5cbiAgLyoqIFN0cmVhbSB0aGF0IGVtaXRzIHdoZW4gYSBkaWFsb2cgaXMgb3BlbmVkLiAqL1xuICBnZXQgYWZ0ZXJPcGVuZWQoKTogU3ViamVjdDxEaWFsb2dSZWY8YW55Pj4ge1xuICAgIHJldHVybiB0aGlzLl9wYXJlbnREaWFsb2cgPyB0aGlzLl9wYXJlbnREaWFsb2cuYWZ0ZXJPcGVuZWQgOiB0aGlzLl9hZnRlck9wZW5lZDtcbiAgfVxuICBfYWZ0ZXJPcGVuZWQ6IFN1YmplY3Q8RGlhbG9nUmVmPGFueT4+ID0gbmV3IFN1YmplY3QoKTtcblxuICAvKiogU3RyZWFtIHRoYXQgZW1pdHMgd2hlbiBhIGRpYWxvZyBpcyBvcGVuZWQuICovXG4gIGdldCBvcGVuRGlhbG9ncygpOiBEaWFsb2dSZWY8YW55PltdIHtcbiAgICByZXR1cm4gdGhpcy5fcGFyZW50RGlhbG9nID8gdGhpcy5fcGFyZW50RGlhbG9nLm9wZW5EaWFsb2dzIDogdGhpcy5fb3BlbkRpYWxvZ3M7XG4gIH1cbiAgX29wZW5EaWFsb2dzOiBEaWFsb2dSZWY8YW55PltdID0gW107XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIF9vdmVybGF5OiBPdmVybGF5LFxuICAgICAgcHJpdmF0ZSBfaW5qZWN0b3I6IEluamVjdG9yLFxuICAgICAgQEluamVjdChESUFMT0dfUkVGKSBwcml2YXRlIF9kaWFsb2dSZWZDb25zdHJ1Y3RvcjogVHlwZTxEaWFsb2dSZWY8YW55Pj4sXG4gICAgICAvLyBUT0RPKGNyaXNiZXRvKTogdGhlIGBhbnlgIGhlcmUgY2FuIGJlIHJlcGxhY2VkXG4gICAgICAvLyB3aXRoIHRoZSBwcm9wZXIgdHlwZSBvbmNlIHdlIHN0YXJ0IHVzaW5nIEl2eS5cbiAgICAgIEBJbmplY3QoRElBTE9HX1NDUk9MTF9TVFJBVEVHWSkgc2Nyb2xsU3RyYXRlZ3k6IGFueSxcbiAgICAgIEBPcHRpb25hbCgpIEBTa2lwU2VsZigpIHByaXZhdGUgX3BhcmVudERpYWxvZzogRGlhbG9nLFxuICAgICAgQE9wdGlvbmFsKCkgbG9jYXRpb246IExvY2F0aW9uKSB7XG5cbiAgICAvLyBDbG9zZSBhbGwgb2YgdGhlIGRpYWxvZ3Mgd2hlbiB0aGUgdXNlciBnb2VzIGZvcndhcmRzL2JhY2t3YXJkcyBpbiBoaXN0b3J5IG9yIHdoZW4gdGhlXG4gICAgLy8gbG9jYXRpb24gaGFzaCBjaGFuZ2VzLiBOb3RlIHRoYXQgdGhpcyB1c3VhbGx5IGRvZXNuJ3QgaW5jbHVkZSBjbGlja2luZyBvbiBsaW5rcyAodW5sZXNzXG4gICAgLy8gdGhlIHVzZXIgaXMgdXNpbmcgdGhlIGBIYXNoTG9jYXRpb25TdHJhdGVneWApLlxuICAgIGlmICghX3BhcmVudERpYWxvZyAmJiBsb2NhdGlvbikge1xuICAgICAgbG9jYXRpb24uc3Vic2NyaWJlKCgpID0+IHRoaXMuY2xvc2VBbGwoKSk7XG4gICAgfVxuXG4gICAgdGhpcy5fc2Nyb2xsU3RyYXRlZ3kgPSBzY3JvbGxTdHJhdGVneTtcbiAgfVxuXG4gIC8qKiBHZXRzIGFuIG9wZW4gZGlhbG9nIGJ5IGlkLiAqL1xuICBnZXRCeUlkKGlkOiBzdHJpbmcpOiBEaWFsb2dSZWY8YW55PiB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIHRoaXMuX29wZW5EaWFsb2dzLmZpbmQocmVmICA9PiByZWYuaWQgPT09IGlkKTtcbiAgfVxuXG4gIC8qKiBDbG9zZXMgYWxsIG9wZW4gZGlhbG9ncy4gKi9cbiAgY2xvc2VBbGwoKTogdm9pZCB7XG4gICAgdGhpcy5vcGVuRGlhbG9ncy5mb3JFYWNoKHJlZiA9PiByZWYuY2xvc2UoKSk7XG4gIH1cblxuICAvKiogT3BlbnMgYSBkaWFsb2cgZnJvbSBhIGNvbXBvbmVudC4gKi9cbiAgb3BlbkZyb21Db21wb25lbnQ8VD4oY29tcG9uZW50OiBDb21wb25lbnRUeXBlPFQ+LCBjb25maWc/OiBEaWFsb2dDb25maWcpOiBEaWFsb2dSZWY8YW55PiB7XG4gICAgY29uZmlnID0gdGhpcy5fYXBwbHlDb25maWdEZWZhdWx0cyhjb25maWcpO1xuXG4gICAgaWYgKGNvbmZpZy5pZCAmJiB0aGlzLmdldEJ5SWQoY29uZmlnLmlkKSkge1xuICAgICAgdGhyb3cgRXJyb3IoYERpYWxvZyB3aXRoIGlkIFwiJHtjb25maWcuaWR9XCIgZXhpc3RzIGFscmVhZHkuIFRoZSBkaWFsb2cgaWQgbXVzdCBiZSB1bmlxdWUuYCk7XG4gICAgfVxuXG4gICAgY29uc3Qgb3ZlcmxheVJlZiA9IHRoaXMuX2NyZWF0ZU92ZXJsYXkoY29uZmlnKTtcbiAgICBjb25zdCBkaWFsb2dDb250YWluZXIgPSB0aGlzLl9hdHRhY2hEaWFsb2dDb250YWluZXIob3ZlcmxheVJlZiwgY29uZmlnKTtcbiAgICBjb25zdCBkaWFsb2dSZWYgPSB0aGlzLl9hdHRhY2hEaWFsb2dDb250ZW50Rm9yQ29tcG9uZW50KGNvbXBvbmVudCwgZGlhbG9nQ29udGFpbmVyLFxuICAgICAgb3ZlcmxheVJlZiwgY29uZmlnKTtcblxuICAgIHRoaXMuX3JlZ2lzdGVyRGlhbG9nUmVmKGRpYWxvZ1JlZik7XG4gICAgcmV0dXJuIGRpYWxvZ1JlZjtcbiAgfVxuXG4gIC8qKiBPcGVucyBhIGRpYWxvZyBmcm9tIGEgdGVtcGxhdGUuICovXG4gIG9wZW5Gcm9tVGVtcGxhdGU8VD4odGVtcGxhdGU6IFRlbXBsYXRlUmVmPFQ+LCBjb25maWc/OiBEaWFsb2dDb25maWcpOiBEaWFsb2dSZWY8YW55PiB7XG4gICAgY29uZmlnID0gdGhpcy5fYXBwbHlDb25maWdEZWZhdWx0cyhjb25maWcpO1xuXG4gICAgaWYgKGNvbmZpZy5pZCAmJiB0aGlzLmdldEJ5SWQoY29uZmlnLmlkKSkge1xuICAgICAgdGhyb3cgRXJyb3IoYERpYWxvZyB3aXRoIGlkIFwiJHtjb25maWcuaWR9XCIgZXhpc3RzIGFscmVhZHkuIFRoZSBkaWFsb2cgaWQgbXVzdCBiZSB1bmlxdWUuYCk7XG4gICAgfVxuXG4gICAgY29uc3Qgb3ZlcmxheVJlZiA9IHRoaXMuX2NyZWF0ZU92ZXJsYXkoY29uZmlnKTtcbiAgICBjb25zdCBkaWFsb2dDb250YWluZXIgPSB0aGlzLl9hdHRhY2hEaWFsb2dDb250YWluZXIob3ZlcmxheVJlZiwgY29uZmlnKTtcbiAgICBjb25zdCBkaWFsb2dSZWYgPSB0aGlzLl9hdHRhY2hEaWFsb2dDb250ZW50Rm9yVGVtcGxhdGUodGVtcGxhdGUsIGRpYWxvZ0NvbnRhaW5lcixcbiAgICAgIG92ZXJsYXlSZWYsIGNvbmZpZyk7XG5cbiAgICB0aGlzLl9yZWdpc3RlckRpYWxvZ1JlZihkaWFsb2dSZWYpO1xuICAgIHJldHVybiBkaWFsb2dSZWY7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICAvLyBPbmx5IGNsb3NlIGFsbCB0aGUgZGlhbG9ncyBhdCB0aGlzIGxldmVsLlxuICAgIHRoaXMuX29wZW5EaWFsb2dzLmZvckVhY2gocmVmID0+IHJlZi5jbG9zZSgpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGb3J3YXJkcyBlbWl0dGluZyBldmVudHMgZm9yIHdoZW4gZGlhbG9ncyBhcmUgb3BlbmVkIGFuZCBhbGwgZGlhbG9ncyBhcmUgY2xvc2VkLlxuICAgKi9cbiAgcHJpdmF0ZSBfcmVnaXN0ZXJEaWFsb2dSZWYoZGlhbG9nUmVmOiBEaWFsb2dSZWY8YW55Pik6IHZvaWQge1xuICAgIHRoaXMub3BlbkRpYWxvZ3MucHVzaChkaWFsb2dSZWYpO1xuXG4gICAgY29uc3QgZGlhbG9nT3BlblN1YiA9IGRpYWxvZ1JlZi5hZnRlck9wZW5lZCgpLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICB0aGlzLmFmdGVyT3BlbmVkLm5leHQoZGlhbG9nUmVmKTtcbiAgICAgIGRpYWxvZ09wZW5TdWIudW5zdWJzY3JpYmUoKTtcbiAgICB9KTtcblxuICAgIGNvbnN0IGRpYWxvZ0Nsb3NlU3ViID0gZGlhbG9nUmVmLmFmdGVyQ2xvc2VkKCkuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgIGxldCBkaWFsb2dJbmRleCA9IHRoaXMuX29wZW5EaWFsb2dzLmluZGV4T2YoZGlhbG9nUmVmKTtcblxuICAgICAgaWYgKGRpYWxvZ0luZGV4ID4gLTEpIHtcbiAgICAgICAgdGhpcy5fb3BlbkRpYWxvZ3Muc3BsaWNlKGRpYWxvZ0luZGV4LCAxKTtcbiAgICAgIH1cblxuICAgICAgaWYgKCF0aGlzLl9vcGVuRGlhbG9ncy5sZW5ndGgpIHtcbiAgICAgICAgdGhpcy5fYWZ0ZXJBbGxDbG9zZWRCYXNlLm5leHQoKTtcbiAgICAgICAgZGlhbG9nQ2xvc2VTdWIudW5zdWJzY3JpYmUoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGFuIG92ZXJsYXkgY29uZmlnIGZyb20gYSBkaWFsb2cgY29uZmlnLlxuICAgKiBAcGFyYW0gY29uZmlnIFRoZSBkaWFsb2cgY29uZmlndXJhdGlvbi5cbiAgICogQHJldHVybnMgVGhlIG92ZXJsYXkgY29uZmlndXJhdGlvbi5cbiAgICovXG4gIHByb3RlY3RlZCBfY3JlYXRlT3ZlcmxheShjb25maWc6IERpYWxvZ0NvbmZpZyk6IE92ZXJsYXlSZWYge1xuICAgIGNvbnN0IG92ZXJsYXlDb25maWcgPSBuZXcgT3ZlcmxheUNvbmZpZyh7XG4gICAgICBwb3NpdGlvblN0cmF0ZWd5OiB0aGlzLl9vdmVybGF5LnBvc2l0aW9uKCkuZ2xvYmFsKCksXG4gICAgICBzY3JvbGxTdHJhdGVneTogdGhpcy5fc2Nyb2xsU3RyYXRlZ3koKSxcbiAgICAgIHBhbmVsQ2xhc3M6IGNvbmZpZy5wYW5lbENsYXNzLFxuICAgICAgaGFzQmFja2Ryb3A6IGNvbmZpZy5oYXNCYWNrZHJvcCxcbiAgICAgIGRpcmVjdGlvbjogY29uZmlnLmRpcmVjdGlvbixcbiAgICAgIG1pbldpZHRoOiBjb25maWcubWluV2lkdGgsXG4gICAgICBtaW5IZWlnaHQ6IGNvbmZpZy5taW5IZWlnaHQsXG4gICAgICBtYXhXaWR0aDogY29uZmlnLm1heFdpZHRoLFxuICAgICAgbWF4SGVpZ2h0OiBjb25maWcubWF4SGVpZ2h0XG4gICAgfSk7XG5cbiAgICBpZiAoY29uZmlnLmJhY2tkcm9wQ2xhc3MpIHtcbiAgICAgIG92ZXJsYXlDb25maWcuYmFja2Ryb3BDbGFzcyA9IGNvbmZpZy5iYWNrZHJvcENsYXNzO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fb3ZlcmxheS5jcmVhdGUob3ZlcmxheUNvbmZpZyk7XG4gIH1cblxuICAvKipcbiAgICogQXR0YWNoZXMgYW4gTWF0RGlhbG9nQ29udGFpbmVyIHRvIGEgZGlhbG9nJ3MgYWxyZWFkeS1jcmVhdGVkIG92ZXJsYXkuXG4gICAqIEBwYXJhbSBvdmVybGF5IFJlZmVyZW5jZSB0byB0aGUgZGlhbG9nJ3MgdW5kZXJseWluZyBvdmVybGF5LlxuICAgKiBAcGFyYW0gY29uZmlnIFRoZSBkaWFsb2cgY29uZmlndXJhdGlvbi5cbiAgICogQHJldHVybnMgQSBwcm9taXNlIHJlc29sdmluZyB0byBhIENvbXBvbmVudFJlZiBmb3IgdGhlIGF0dGFjaGVkIGNvbnRhaW5lci5cbiAgICovXG4gIHByb3RlY3RlZCBfYXR0YWNoRGlhbG9nQ29udGFpbmVyKG92ZXJsYXk6IE92ZXJsYXlSZWYsIGNvbmZpZzogRGlhbG9nQ29uZmlnKTogQ2RrRGlhbG9nQ29udGFpbmVyIHtcbiAgICBjb25zdCBjb250YWluZXIgPSBjb25maWcuY29udGFpbmVyQ29tcG9uZW50IHx8IHRoaXMuX2luamVjdG9yLmdldChESUFMT0dfQ09OVEFJTkVSKTtcbiAgICBjb25zdCB1c2VySW5qZWN0b3IgPSBjb25maWcgJiYgY29uZmlnLnZpZXdDb250YWluZXJSZWYgJiYgY29uZmlnLnZpZXdDb250YWluZXJSZWYuaW5qZWN0b3I7XG4gICAgY29uc3QgaW5qZWN0b3IgPSBuZXcgUG9ydGFsSW5qZWN0b3IodXNlckluamVjdG9yIHx8IHRoaXMuX2luamVjdG9yLCBuZXcgV2Vha01hcChbXG4gICAgICBbRGlhbG9nQ29uZmlnLCBjb25maWddXG4gICAgXSkpO1xuICAgIGNvbnN0IGNvbnRhaW5lclBvcnRhbCA9IG5ldyBDb21wb25lbnRQb3J0YWwoY29udGFpbmVyLCBjb25maWcudmlld0NvbnRhaW5lclJlZiwgaW5qZWN0b3IpO1xuICAgIGNvbnN0IGNvbnRhaW5lclJlZjogQ29tcG9uZW50UmVmPENka0RpYWxvZ0NvbnRhaW5lcj4gPSBvdmVybGF5LmF0dGFjaChjb250YWluZXJQb3J0YWwpO1xuICAgIGNvbnRhaW5lclJlZi5pbnN0YW5jZS5fY29uZmlnID0gY29uZmlnO1xuXG4gICAgcmV0dXJuIGNvbnRhaW5lclJlZi5pbnN0YW5jZTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIEF0dGFjaGVzIHRoZSB1c2VyLXByb3ZpZGVkIGNvbXBvbmVudCB0byB0aGUgYWxyZWFkeS1jcmVhdGVkIE1hdERpYWxvZ0NvbnRhaW5lci5cbiAgICogQHBhcmFtIGNvbXBvbmVudE9yVGVtcGxhdGVSZWYgVGhlIHR5cGUgb2YgY29tcG9uZW50IGJlaW5nIGxvYWRlZCBpbnRvIHRoZSBkaWFsb2csXG4gICAqICAgICBvciBhIFRlbXBsYXRlUmVmIHRvIGluc3RhbnRpYXRlIGFzIHRoZSBjb250ZW50LlxuICAgKiBAcGFyYW0gZGlhbG9nQ29udGFpbmVyIFJlZmVyZW5jZSB0byB0aGUgd3JhcHBpbmcgTWF0RGlhbG9nQ29udGFpbmVyLlxuICAgKiBAcGFyYW0gb3ZlcmxheVJlZiBSZWZlcmVuY2UgdG8gdGhlIG92ZXJsYXkgaW4gd2hpY2ggdGhlIGRpYWxvZyByZXNpZGVzLlxuICAgKiBAcGFyYW0gY29uZmlnIFRoZSBkaWFsb2cgY29uZmlndXJhdGlvbi5cbiAgICogQHJldHVybnMgQSBwcm9taXNlIHJlc29sdmluZyB0byB0aGUgTWF0RGlhbG9nUmVmIHRoYXQgc2hvdWxkIGJlIHJldHVybmVkIHRvIHRoZSB1c2VyLlxuICAgKi9cbiAgcHJvdGVjdGVkIF9hdHRhY2hEaWFsb2dDb250ZW50Rm9yQ29tcG9uZW50PFQ+KFxuICAgICAgY29tcG9uZW50T3JUZW1wbGF0ZVJlZjogQ29tcG9uZW50VHlwZTxUPixcbiAgICAgIGRpYWxvZ0NvbnRhaW5lcjogQ2RrRGlhbG9nQ29udGFpbmVyLFxuICAgICAgb3ZlcmxheVJlZjogT3ZlcmxheVJlZixcbiAgICAgIGNvbmZpZzogRGlhbG9nQ29uZmlnKTogRGlhbG9nUmVmPGFueT4ge1xuXG4gICAgLy8gQ3JlYXRlIGEgcmVmZXJlbmNlIHRvIHRoZSBkaWFsb2cgd2UncmUgY3JlYXRpbmcgaW4gb3JkZXIgdG8gZ2l2ZSB0aGUgdXNlciBhIGhhbmRsZVxuICAgIC8vIHRvIG1vZGlmeSBhbmQgY2xvc2UgaXQuXG4gICAgY29uc3QgZGlhbG9nUmVmID0gdGhpcy5fY3JlYXRlRGlhbG9nUmVmKG92ZXJsYXlSZWYsIGRpYWxvZ0NvbnRhaW5lciwgY29uZmlnKTtcbiAgICBjb25zdCBpbmplY3RvciA9IHRoaXMuX2NyZWF0ZUluamVjdG9yPFQ+KGNvbmZpZywgZGlhbG9nUmVmLCBkaWFsb2dDb250YWluZXIpO1xuICAgIGNvbnN0IGNvbnRlbnRSZWYgPSBkaWFsb2dDb250YWluZXIuYXR0YWNoQ29tcG9uZW50UG9ydGFsKFxuICAgICAgICBuZXcgQ29tcG9uZW50UG9ydGFsKGNvbXBvbmVudE9yVGVtcGxhdGVSZWYsIHVuZGVmaW5lZCwgaW5qZWN0b3IpKTtcbiAgICBkaWFsb2dSZWYuY29tcG9uZW50SW5zdGFuY2UgPSBjb250ZW50UmVmLmluc3RhbmNlO1xuICAgIHJldHVybiBkaWFsb2dSZWY7XG4gIH1cblxuICAvKipcbiAgICogQXR0YWNoZXMgdGhlIHVzZXItcHJvdmlkZWQgY29tcG9uZW50IHRvIHRoZSBhbHJlYWR5LWNyZWF0ZWQgTWF0RGlhbG9nQ29udGFpbmVyLlxuICAgKiBAcGFyYW0gY29tcG9uZW50T3JUZW1wbGF0ZVJlZiBUaGUgdHlwZSBvZiBjb21wb25lbnQgYmVpbmcgbG9hZGVkIGludG8gdGhlIGRpYWxvZyxcbiAgICogICAgIG9yIGEgVGVtcGxhdGVSZWYgdG8gaW5zdGFudGlhdGUgYXMgdGhlIGNvbnRlbnQuXG4gICAqIEBwYXJhbSBkaWFsb2dDb250YWluZXIgUmVmZXJlbmNlIHRvIHRoZSB3cmFwcGluZyBNYXREaWFsb2dDb250YWluZXIuXG4gICAqIEBwYXJhbSBvdmVybGF5UmVmIFJlZmVyZW5jZSB0byB0aGUgb3ZlcmxheSBpbiB3aGljaCB0aGUgZGlhbG9nIHJlc2lkZXMuXG4gICAqIEBwYXJhbSBjb25maWcgVGhlIGRpYWxvZyBjb25maWd1cmF0aW9uLlxuICAgKiBAcmV0dXJucyBBIHByb21pc2UgcmVzb2x2aW5nIHRvIHRoZSBNYXREaWFsb2dSZWYgdGhhdCBzaG91bGQgYmUgcmV0dXJuZWQgdG8gdGhlIHVzZXIuXG4gICAqL1xuICBwcm90ZWN0ZWQgX2F0dGFjaERpYWxvZ0NvbnRlbnRGb3JUZW1wbGF0ZTxUPihcbiAgICAgIGNvbXBvbmVudE9yVGVtcGxhdGVSZWY6IFRlbXBsYXRlUmVmPFQ+LFxuICAgICAgZGlhbG9nQ29udGFpbmVyOiBDZGtEaWFsb2dDb250YWluZXIsXG4gICAgICBvdmVybGF5UmVmOiBPdmVybGF5UmVmLFxuICAgICAgY29uZmlnOiBEaWFsb2dDb25maWcpOiBEaWFsb2dSZWY8YW55PiB7XG5cbiAgICAvLyBDcmVhdGUgYSByZWZlcmVuY2UgdG8gdGhlIGRpYWxvZyB3ZSdyZSBjcmVhdGluZyBpbiBvcmRlciB0byBnaXZlIHRoZSB1c2VyIGEgaGFuZGxlXG4gICAgLy8gdG8gbW9kaWZ5IGFuZCBjbG9zZSBpdC5cbiAgICBjb25zdCBkaWFsb2dSZWYgPSB0aGlzLl9jcmVhdGVEaWFsb2dSZWYob3ZlcmxheVJlZiwgZGlhbG9nQ29udGFpbmVyLCBjb25maWcpO1xuICAgIGRpYWxvZ0NvbnRhaW5lci5hdHRhY2hUZW1wbGF0ZVBvcnRhbChcbiAgICAgIG5ldyBUZW1wbGF0ZVBvcnRhbDxUPihjb21wb25lbnRPclRlbXBsYXRlUmVmLCBudWxsISxcbiAgICAgICAgPGFueT57JGltcGxpY2l0OiBjb25maWcuZGF0YSwgZGlhbG9nUmVmfSkpO1xuICAgIHJldHVybiBkaWFsb2dSZWY7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgY3VzdG9tIGluamVjdG9yIHRvIGJlIHVzZWQgaW5zaWRlIHRoZSBkaWFsb2cuIFRoaXMgYWxsb3dzIGEgY29tcG9uZW50IGxvYWRlZCBpbnNpZGVcbiAgICogb2YgYSBkaWFsb2cgdG8gY2xvc2UgaXRzZWxmIGFuZCwgb3B0aW9uYWxseSwgdG8gcmV0dXJuIGEgdmFsdWUuXG4gICAqIEBwYXJhbSBjb25maWcgQ29uZmlnIG9iamVjdCB0aGF0IGlzIHVzZWQgdG8gY29uc3RydWN0IHRoZSBkaWFsb2cuXG4gICAqIEBwYXJhbSBkaWFsb2dSZWYgUmVmZXJlbmNlIHRvIHRoZSBkaWFsb2cuXG4gICAqIEBwYXJhbSBjb250YWluZXIgRGlhbG9nIGNvbnRhaW5lciBlbGVtZW50IHRoYXQgd3JhcHMgYWxsIG9mIHRoZSBjb250ZW50cy5cbiAgICogQHJldHVybnMgVGhlIGN1c3RvbSBpbmplY3RvciB0aGF0IGNhbiBiZSB1c2VkIGluc2lkZSB0aGUgZGlhbG9nLlxuICAgKi9cbiAgcHJpdmF0ZSBfY3JlYXRlSW5qZWN0b3I8VD4oXG4gICAgICBjb25maWc6IERpYWxvZ0NvbmZpZyxcbiAgICAgIGRpYWxvZ1JlZjogRGlhbG9nUmVmPFQ+LFxuICAgICAgZGlhbG9nQ29udGFpbmVyOiBDZGtEaWFsb2dDb250YWluZXIpOiBQb3J0YWxJbmplY3RvciB7XG5cbiAgICBjb25zdCB1c2VySW5qZWN0b3IgPSBjb25maWcgJiYgY29uZmlnLnZpZXdDb250YWluZXJSZWYgJiYgY29uZmlnLnZpZXdDb250YWluZXJSZWYuaW5qZWN0b3I7XG4gICAgY29uc3QgaW5qZWN0aW9uVG9rZW5zID0gbmV3IFdlYWtNYXA8YW55LCBhbnk+KFtcbiAgICAgIFt0aGlzLl9pbmplY3Rvci5nZXQoRElBTE9HX1JFRiksIGRpYWxvZ1JlZl0sXG4gICAgICBbdGhpcy5faW5qZWN0b3IuZ2V0KERJQUxPR19DT05UQUlORVIpLCBkaWFsb2dDb250YWluZXJdLFxuICAgICAgW0RJQUxPR19EQVRBLCBjb25maWcuZGF0YV1cbiAgICBdKTtcblxuICAgIGlmIChjb25maWcuZGlyZWN0aW9uICYmXG4gICAgICAgICghdXNlckluamVjdG9yIHx8ICF1c2VySW5qZWN0b3IuZ2V0PERpcmVjdGlvbmFsaXR5IHwgbnVsbD4oRGlyZWN0aW9uYWxpdHksIG51bGwpKSkge1xuICAgICAgaW5qZWN0aW9uVG9rZW5zLnNldChEaXJlY3Rpb25hbGl0eSwge1xuICAgICAgICB2YWx1ZTogY29uZmlnLmRpcmVjdGlvbixcbiAgICAgICAgY2hhbmdlOiBvYnNlcnZhYmxlT2YoKVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBQb3J0YWxJbmplY3Rvcih1c2VySW5qZWN0b3IgfHwgdGhpcy5faW5qZWN0b3IsIGluamVjdGlvblRva2Vucyk7XG4gIH1cblxuICAvKiogQ3JlYXRlcyBhIG5ldyBkaWFsb2cgcmVmLiAqL1xuICBwcml2YXRlIF9jcmVhdGVEaWFsb2dSZWYob3ZlcmxheVJlZjogT3ZlcmxheVJlZixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpYWxvZ0NvbnRhaW5lcjogQ2RrRGlhbG9nQ29udGFpbmVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlnOiBEaWFsb2dDb25maWcpIHtcbiAgICBjb25zdCBkaWFsb2dSZWYgPSBuZXcgdGhpcy5fZGlhbG9nUmVmQ29uc3RydWN0b3Iob3ZlcmxheVJlZiwgZGlhbG9nQ29udGFpbmVyLCBjb25maWcuaWQpO1xuICAgIGRpYWxvZ1JlZi5kaXNhYmxlQ2xvc2UgPSBjb25maWcuZGlzYWJsZUNsb3NlO1xuICAgIGRpYWxvZ1JlZi51cGRhdGVTaXplKGNvbmZpZykudXBkYXRlUG9zaXRpb24oY29uZmlnLnBvc2l0aW9uKTtcbiAgICByZXR1cm4gZGlhbG9nUmVmO1xuICB9XG5cbiAgLyoqXG4gICAqIEV4cGFuZHMgdGhlIHByb3ZpZGVkIGNvbmZpZ3VyYXRpb24gb2JqZWN0IHRvIGluY2x1ZGUgdGhlIGRlZmF1bHQgdmFsdWVzIGZvciBwcm9wZXJ0aWVzIHdoaWNoXG4gICAqIGFyZSB1bmRlZmluZWQuXG4gICAqL1xuICBwcml2YXRlIF9hcHBseUNvbmZpZ0RlZmF1bHRzKGNvbmZpZz86IERpYWxvZ0NvbmZpZyk6IERpYWxvZ0NvbmZpZyB7XG4gICAgY29uc3QgZGlhbG9nQ29uZmlnID0gdGhpcy5faW5qZWN0b3IuZ2V0KERJQUxPR19DT05GSUcpIGFzIHR5cGVvZiBEaWFsb2dDb25maWc7XG4gICAgcmV0dXJuIHsuLi5uZXcgZGlhbG9nQ29uZmlnKCksIC4uLmNvbmZpZ307XG4gIH1cbn1cbiJdfQ==