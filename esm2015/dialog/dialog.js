/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __decorate, __metadata, __param } from "tslib";
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
    let Dialog = class Dialog {
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
    };
    Dialog = __decorate([
        Injectable(),
        __param(2, Inject(DIALOG_REF)),
        __param(3, Inject(DIALOG_SCROLL_STRATEGY)),
        __param(4, Optional()), __param(4, SkipSelf()),
        __param(5, Optional()),
        __metadata("design:paramtypes", [Overlay,
            Injector,
            Type, Object, Dialog,
            Location])
    ], Dialog);
    return Dialog;
})();
export { Dialog };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhbG9nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvZGlhbG9nL2RpYWxvZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7O0FBRUgsT0FBTyxFQUVMLFFBQVEsRUFDUixRQUFRLEVBQ1IsVUFBVSxFQUNWLFFBQVEsRUFDUixNQUFNLEVBR04sSUFBSSxFQUNMLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBQyxlQUFlLEVBQUUsY0FBYyxFQUFFLGNBQWMsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQ3BGLE9BQU8sRUFBQyxFQUFFLElBQUksWUFBWSxFQUFjLE9BQU8sRUFBRSxLQUFLLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFFcEUsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQ3pDLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUM3QyxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFFakQsT0FBTyxFQUVMLE9BQU8sRUFFUCxhQUFhLEdBRWQsTUFBTSxzQkFBc0IsQ0FBQztBQUM5QixPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFFekMsT0FBTyxFQUNMLHNCQUFzQixFQUN0QixXQUFXLEVBQ1gsVUFBVSxFQUNWLGdCQUFnQixFQUNoQixhQUFhLEdBQ2QsTUFBTSxvQkFBb0IsQ0FBQztBQUc1Qjs7R0FFRztBQUVIO0lBQUEsSUFBYSxNQUFNLEdBQW5CLE1BQWEsTUFBTTtRQXlCakIsWUFDWSxRQUFpQixFQUNqQixTQUFtQixFQUNDLHFCQUEyQztRQUN2RSxpREFBaUQ7UUFDakQsZ0RBQWdEO1FBQ2hCLGNBQW1CLEVBQ25CLGFBQXFCLEVBQ3pDLFFBQWtCO1lBUHRCLGFBQVEsR0FBUixRQUFRLENBQVM7WUFDakIsY0FBUyxHQUFULFNBQVMsQ0FBVTtZ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QUN0QixXQUFBLFFBQVEsRUFBRSxDQUFBO3lDQVBPLE9BQU87WUFDTixRQUFRO1lBQ3dCLElBQUksVUFJUixNQUFNO1lBQy9CLFFBQVE7T0FqQ3ZCLE1BQU0sQ0FzUWxCO0lBQUQsYUFBQztLQUFBO1NBdFFZLE1BQU0iLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtcbiAgVGVtcGxhdGVSZWYsXG4gIFNraXBTZWxmLFxuICBPcHRpb25hbCxcbiAgSW5qZWN0YWJsZSxcbiAgSW5qZWN0b3IsXG4gIEluamVjdCxcbiAgQ29tcG9uZW50UmVmLFxuICBPbkRlc3Ryb3ksXG4gIFR5cGVcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0NvbXBvbmVudFBvcnRhbCwgUG9ydGFsSW5qZWN0b3IsIFRlbXBsYXRlUG9ydGFsfSBmcm9tICdAYW5ndWxhci9jZGsvcG9ydGFsJztcbmltcG9ydCB7b2YgYXMgb2JzZXJ2YWJsZU9mLCBPYnNlcnZhYmxlLCBTdWJqZWN0LCBkZWZlcn0gZnJvbSAncnhqcyc7XG5pbXBvcnQge0RpYWxvZ1JlZn0gZnJvbSAnLi9kaWFsb2ctcmVmJztcbmltcG9ydCB7TG9jYXRpb259IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQge0RpYWxvZ0NvbmZpZ30gZnJvbSAnLi9kaWFsb2ctY29uZmlnJztcbmltcG9ydCB7RGlyZWN0aW9uYWxpdHl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9iaWRpJztcbmltcG9ydCB7Q2RrRGlhbG9nQ29udGFpbmVyfSBmcm9tICcuL2RpYWxvZy1jb250YWluZXInO1xuaW1wb3J0IHtcbiAgQ29tcG9uZW50VHlwZSxcbiAgT3ZlcmxheSxcbiAgT3ZlcmxheVJlZixcbiAgT3ZlcmxheUNvbmZpZyxcbiAgU2Nyb2xsU3RyYXRlZ3ksXG59IGZyb20gJ0Bhbmd1bGFyL2Nkay9vdmVybGF5JztcbmltcG9ydCB7c3RhcnRXaXRofSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbmltcG9ydCB7XG4gIERJQUxPR19TQ1JPTExfU1RSQVRFR1ksXG4gIERJQUxPR19EQVRBLFxuICBESUFMT0dfUkVGLFxuICBESUFMT0dfQ09OVEFJTkVSLFxuICBESUFMT0dfQ09ORklHLFxufSBmcm9tICcuL2RpYWxvZy1pbmplY3RvcnMnO1xuXG5cbi8qKlxuICogU2VydmljZSB0byBvcGVuIG1vZGFsIGRpYWxvZ3MuXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBEaWFsb2cgaW1wbGVtZW50cyBPbkRlc3Ryb3kge1xuICBwcml2YXRlIF9zY3JvbGxTdHJhdGVneTogKCkgPT4gU2Nyb2xsU3RyYXRlZ3k7XG5cbiAgLyoqIFN0cmVhbSB0aGF0IGVtaXRzIHdoZW4gYWxsIGRpYWxvZ3MgYXJlIGNsb3NlZC4gKi9cbiAgZ2V0IF9hZnRlckFsbENsb3NlZCgpOiBPYnNlcnZhYmxlPHZvaWQ+IHtcbiAgICByZXR1cm4gdGhpcy5fcGFyZW50RGlhbG9nID8gdGhpcy5fcGFyZW50RGlhbG9nLmFmdGVyQWxsQ2xvc2VkIDogdGhpcy5fYWZ0ZXJBbGxDbG9zZWRCYXNlO1xuICB9XG4gIF9hZnRlckFsbENsb3NlZEJhc2UgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xuXG4gIC8vIFRPRE8oamVsYm91cm4pOiB0aWdodGVuIHRoZSB0eXBlIG9uIHRoZSByaWdodC1oYW5kIHNpZGUgb2YgdGhpcyBleHByZXNzaW9uLlxuICBhZnRlckFsbENsb3NlZDogT2JzZXJ2YWJsZTx2b2lkPiA9IGRlZmVyKCgpID0+IHRoaXMub3BlbkRpYWxvZ3MubGVuZ3RoID9cbiAgICAgIHRoaXMuX2FmdGVyQWxsQ2xvc2VkIDogdGhpcy5fYWZ0ZXJBbGxDbG9zZWQucGlwZShzdGFydFdpdGgodW5kZWZpbmVkKSkpO1xuXG4gIC8qKiBTdHJlYW0gdGhhdCBlbWl0cyB3aGVuIGEgZGlhbG9nIGlzIG9wZW5lZC4gKi9cbiAgZ2V0IGFmdGVyT3BlbmVkKCk6IFN1YmplY3Q8RGlhbG9nUmVmPGFueT4+IHtcbiAgICByZXR1cm4gdGhpcy5fcGFyZW50RGlhbG9nID8gdGhpcy5fcGFyZW50RGlhbG9nLmFmdGVyT3BlbmVkIDogdGhpcy5fYWZ0ZXJPcGVuZWQ7XG4gIH1cbiAgX2FmdGVyT3BlbmVkOiBTdWJqZWN0PERpYWxvZ1JlZjxhbnk+PiA9IG5ldyBTdWJqZWN0KCk7XG5cbiAgLyoqIFN0cmVhbSB0aGF0IGVtaXRzIHdoZW4gYSBkaWFsb2cgaXMgb3BlbmVkLiAqL1xuICBnZXQgb3BlbkRpYWxvZ3MoKTogRGlhbG9nUmVmPGFueT5bXSB7XG4gICAgcmV0dXJuIHRoaXMuX3BhcmVudERpYWxvZyA/IHRoaXMuX3BhcmVudERpYWxvZy5vcGVuRGlhbG9ncyA6IHRoaXMuX29wZW5EaWFsb2dzO1xuICB9XG4gIF9vcGVuRGlhbG9nczogRGlhbG9nUmVmPGFueT5bXSA9IFtdO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSBfb3ZlcmxheTogT3ZlcmxheSxcbiAgICAgIHByaXZhdGUgX2luamVjdG9yOiBJbmplY3RvcixcbiAgICAgIEBJbmplY3QoRElBTE9HX1JFRikgcHJpdmF0ZSBfZGlhbG9nUmVmQ29uc3RydWN0b3I6IFR5cGU8RGlhbG9nUmVmPGFueT4+LFxuICAgICAgLy8gVE9ETyhjcmlzYmV0byk6IHRoZSBgYW55YCBoZXJlIGNhbiBiZSByZXBsYWNlZFxuICAgICAgLy8gd2l0aCB0aGUgcHJvcGVyIHR5cGUgb25jZSB3ZSBzdGFydCB1c2luZyBJdnkuXG4gICAgICBASW5qZWN0KERJQUxPR19TQ1JPTExfU1RSQVRFR1kpIHNjcm9sbFN0cmF0ZWd5OiBhbnksXG4gICAgICBAT3B0aW9uYWwoKSBAU2tpcFNlbGYoKSBwcml2YXRlIF9wYXJlbnREaWFsb2c6IERpYWxvZyxcbiAgICAgIEBPcHRpb25hbCgpIGxvY2F0aW9uOiBMb2NhdGlvbikge1xuXG4gICAgLy8gQ2xvc2UgYWxsIG9mIHRoZSBkaWFsb2dzIHdoZW4gdGhlIHVzZXIgZ29lcyBmb3J3YXJkcy9iYWNrd2FyZHMgaW4gaGlzdG9yeSBvciB3aGVuIHRoZVxuICAgIC8vIGxvY2F0aW9uIGhhc2ggY2hhbmdlcy4gTm90ZSB0aGF0IHRoaXMgdXN1YWxseSBkb2Vzbid0IGluY2x1ZGUgY2xpY2tpbmcgb24gbGlua3MgKHVubGVzc1xuICAgIC8vIHRoZSB1c2VyIGlzIHVzaW5nIHRoZSBgSGFzaExvY2F0aW9uU3RyYXRlZ3lgKS5cbiAgICBpZiAoIV9wYXJlbnREaWFsb2cgJiYgbG9jYXRpb24pIHtcbiAgICAgIGxvY2F0aW9uLnN1YnNjcmliZSgoKSA9PiB0aGlzLmNsb3NlQWxsKCkpO1xuICAgIH1cblxuICAgIHRoaXMuX3Njcm9sbFN0cmF0ZWd5ID0gc2Nyb2xsU3RyYXRlZ3k7XG4gIH1cblxuICAvKiogR2V0cyBhbiBvcGVuIGRpYWxvZyBieSBpZC4gKi9cbiAgZ2V0QnlJZChpZDogc3RyaW5nKTogRGlhbG9nUmVmPGFueT4gfCB1bmRlZmluZWQge1xuICAgIHJldHVybiB0aGlzLl9vcGVuRGlhbG9ncy5maW5kKHJlZiAgPT4gcmVmLmlkID09PSBpZCk7XG4gIH1cblxuICAvKiogQ2xvc2VzIGFsbCBvcGVuIGRpYWxvZ3MuICovXG4gIGNsb3NlQWxsKCk6IHZvaWQge1xuICAgIHRoaXMub3BlbkRpYWxvZ3MuZm9yRWFjaChyZWYgPT4gcmVmLmNsb3NlKCkpO1xuICB9XG5cbiAgLyoqIE9wZW5zIGEgZGlhbG9nIGZyb20gYSBjb21wb25lbnQuICovXG4gIG9wZW5Gcm9tQ29tcG9uZW50PFQ+KGNvbXBvbmVudDogQ29tcG9uZW50VHlwZTxUPiwgY29uZmlnPzogRGlhbG9nQ29uZmlnKTogRGlhbG9nUmVmPGFueT4ge1xuICAgIGNvbmZpZyA9IHRoaXMuX2FwcGx5Q29uZmlnRGVmYXVsdHMoY29uZmlnKTtcblxuICAgIGlmIChjb25maWcuaWQgJiYgdGhpcy5nZXRCeUlkKGNvbmZpZy5pZCkpIHtcbiAgICAgIHRocm93IEVycm9yKGBEaWFsb2cgd2l0aCBpZCBcIiR7Y29uZmlnLmlkfVwiIGV4aXN0cyBhbHJlYWR5LiBUaGUgZGlhbG9nIGlkIG11c3QgYmUgdW5pcXVlLmApO1xuICAgIH1cblxuICAgIGNvbnN0IG92ZXJsYXlSZWYgPSB0aGlzLl9jcmVhdGVPdmVybGF5KGNvbmZpZyk7XG4gICAgY29uc3QgZGlhbG9nQ29udGFpbmVyID0gdGhpcy5fYXR0YWNoRGlhbG9nQ29udGFpbmVyKG92ZXJsYXlSZWYsIGNvbmZpZyk7XG4gICAgY29uc3QgZGlhbG9nUmVmID0gdGhpcy5fYXR0YWNoRGlhbG9nQ29udGVudEZvckNvbXBvbmVudChjb21wb25lbnQsIGRpYWxvZ0NvbnRhaW5lcixcbiAgICAgIG92ZXJsYXlSZWYsIGNvbmZpZyk7XG5cbiAgICB0aGlzLl9yZWdpc3RlckRpYWxvZ1JlZihkaWFsb2dSZWYpO1xuICAgIHJldHVybiBkaWFsb2dSZWY7XG4gIH1cblxuICAvKiogT3BlbnMgYSBkaWFsb2cgZnJvbSBhIHRlbXBsYXRlLiAqL1xuICBvcGVuRnJvbVRlbXBsYXRlPFQ+KHRlbXBsYXRlOiBUZW1wbGF0ZVJlZjxUPiwgY29uZmlnPzogRGlhbG9nQ29uZmlnKTogRGlhbG9nUmVmPGFueT4ge1xuICAgIGNvbmZpZyA9IHRoaXMuX2FwcGx5Q29uZmlnRGVmYXVsdHMoY29uZmlnKTtcblxuICAgIGlmIChjb25maWcuaWQgJiYgdGhpcy5nZXRCeUlkKGNvbmZpZy5pZCkpIHtcbiAgICAgIHRocm93IEVycm9yKGBEaWFsb2cgd2l0aCBpZCBcIiR7Y29uZmlnLmlkfVwiIGV4aXN0cyBhbHJlYWR5LiBUaGUgZGlhbG9nIGlkIG11c3QgYmUgdW5pcXVlLmApO1xuICAgIH1cblxuICAgIGNvbnN0IG92ZXJsYXlSZWYgPSB0aGlzLl9jcmVhdGVPdmVybGF5KGNvbmZpZyk7XG4gICAgY29uc3QgZGlhbG9nQ29udGFpbmVyID0gdGhpcy5fYXR0YWNoRGlhbG9nQ29udGFpbmVyKG92ZXJsYXlSZWYsIGNvbmZpZyk7XG4gICAgY29uc3QgZGlhbG9nUmVmID0gdGhpcy5fYXR0YWNoRGlhbG9nQ29udGVudEZvclRlbXBsYXRlKHRlbXBsYXRlLCBkaWFsb2dDb250YWluZXIsXG4gICAgICBvdmVybGF5UmVmLCBjb25maWcpO1xuXG4gICAgdGhpcy5fcmVnaXN0ZXJEaWFsb2dSZWYoZGlhbG9nUmVmKTtcbiAgICByZXR1cm4gZGlhbG9nUmVmO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgLy8gT25seSBjbG9zZSBhbGwgdGhlIGRpYWxvZ3MgYXQgdGhpcyBsZXZlbC5cbiAgICB0aGlzLl9vcGVuRGlhbG9ncy5mb3JFYWNoKHJlZiA9PiByZWYuY2xvc2UoKSk7XG4gIH1cblxuICAvKipcbiAgICogRm9yd2FyZHMgZW1pdHRpbmcgZXZlbnRzIGZvciB3aGVuIGRpYWxvZ3MgYXJlIG9wZW5lZCBhbmQgYWxsIGRpYWxvZ3MgYXJlIGNsb3NlZC5cbiAgICovXG4gIHByaXZhdGUgX3JlZ2lzdGVyRGlhbG9nUmVmKGRpYWxvZ1JlZjogRGlhbG9nUmVmPGFueT4pOiB2b2lkIHtcbiAgICB0aGlzLm9wZW5EaWFsb2dzLnB1c2goZGlhbG9nUmVmKTtcblxuICAgIGNvbnN0IGRpYWxvZ09wZW5TdWIgPSBkaWFsb2dSZWYuYWZ0ZXJPcGVuZWQoKS5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgdGhpcy5hZnRlck9wZW5lZC5uZXh0KGRpYWxvZ1JlZik7XG4gICAgICBkaWFsb2dPcGVuU3ViLnVuc3Vic2NyaWJlKCk7XG4gICAgfSk7XG5cbiAgICBjb25zdCBkaWFsb2dDbG9zZVN1YiA9IGRpYWxvZ1JlZi5hZnRlckNsb3NlZCgpLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICBsZXQgZGlhbG9nSW5kZXggPSB0aGlzLl9vcGVuRGlhbG9ncy5pbmRleE9mKGRpYWxvZ1JlZik7XG5cbiAgICAgIGlmIChkaWFsb2dJbmRleCA+IC0xKSB7XG4gICAgICAgIHRoaXMuX29wZW5EaWFsb2dzLnNwbGljZShkaWFsb2dJbmRleCwgMSk7XG4gICAgICB9XG5cbiAgICAgIGlmICghdGhpcy5fb3BlbkRpYWxvZ3MubGVuZ3RoKSB7XG4gICAgICAgIHRoaXMuX2FmdGVyQWxsQ2xvc2VkQmFzZS5uZXh0KCk7XG4gICAgICAgIGRpYWxvZ0Nsb3NlU3ViLnVuc3Vic2NyaWJlKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhbiBvdmVybGF5IGNvbmZpZyBmcm9tIGEgZGlhbG9nIGNvbmZpZy5cbiAgICogQHBhcmFtIGNvbmZpZyBUaGUgZGlhbG9nIGNvbmZpZ3VyYXRpb24uXG4gICAqIEByZXR1cm5zIFRoZSBvdmVybGF5IGNvbmZpZ3VyYXRpb24uXG4gICAqL1xuICBwcm90ZWN0ZWQgX2NyZWF0ZU92ZXJsYXkoY29uZmlnOiBEaWFsb2dDb25maWcpOiBPdmVybGF5UmVmIHtcbiAgICBjb25zdCBvdmVybGF5Q29uZmlnID0gbmV3IE92ZXJsYXlDb25maWcoe1xuICAgICAgcG9zaXRpb25TdHJhdGVneTogdGhpcy5fb3ZlcmxheS5wb3NpdGlvbigpLmdsb2JhbCgpLFxuICAgICAgc2Nyb2xsU3RyYXRlZ3k6IHRoaXMuX3Njcm9sbFN0cmF0ZWd5KCksXG4gICAgICBwYW5lbENsYXNzOiBjb25maWcucGFuZWxDbGFzcyxcbiAgICAgIGhhc0JhY2tkcm9wOiBjb25maWcuaGFzQmFja2Ryb3AsXG4gICAgICBkaXJlY3Rpb246IGNvbmZpZy5kaXJlY3Rpb24sXG4gICAgICBtaW5XaWR0aDogY29uZmlnLm1pbldpZHRoLFxuICAgICAgbWluSGVpZ2h0OiBjb25maWcubWluSGVpZ2h0LFxuICAgICAgbWF4V2lkdGg6IGNvbmZpZy5tYXhXaWR0aCxcbiAgICAgIG1heEhlaWdodDogY29uZmlnLm1heEhlaWdodFxuICAgIH0pO1xuXG4gICAgaWYgKGNvbmZpZy5iYWNrZHJvcENsYXNzKSB7XG4gICAgICBvdmVybGF5Q29uZmlnLmJhY2tkcm9wQ2xhc3MgPSBjb25maWcuYmFja2Ryb3BDbGFzcztcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX292ZXJsYXkuY3JlYXRlKG92ZXJsYXlDb25maWcpO1xuICB9XG5cbiAgLyoqXG4gICAqIEF0dGFjaGVzIGFuIE1hdERpYWxvZ0NvbnRhaW5lciB0byBhIGRpYWxvZydzIGFscmVhZHktY3JlYXRlZCBvdmVybGF5LlxuICAgKiBAcGFyYW0gb3ZlcmxheSBSZWZlcmVuY2UgdG8gdGhlIGRpYWxvZydzIHVuZGVybHlpbmcgb3ZlcmxheS5cbiAgICogQHBhcmFtIGNvbmZpZyBUaGUgZGlhbG9nIGNvbmZpZ3VyYXRpb24uXG4gICAqIEByZXR1cm5zIEEgcHJvbWlzZSByZXNvbHZpbmcgdG8gYSBDb21wb25lbnRSZWYgZm9yIHRoZSBhdHRhY2hlZCBjb250YWluZXIuXG4gICAqL1xuICBwcm90ZWN0ZWQgX2F0dGFjaERpYWxvZ0NvbnRhaW5lcihvdmVybGF5OiBPdmVybGF5UmVmLCBjb25maWc6IERpYWxvZ0NvbmZpZyk6IENka0RpYWxvZ0NvbnRhaW5lciB7XG4gICAgY29uc3QgY29udGFpbmVyID0gY29uZmlnLmNvbnRhaW5lckNvbXBvbmVudCB8fCB0aGlzLl9pbmplY3Rvci5nZXQoRElBTE9HX0NPTlRBSU5FUik7XG4gICAgY29uc3QgdXNlckluamVjdG9yID0gY29uZmlnICYmIGNvbmZpZy52aWV3Q29udGFpbmVyUmVmICYmIGNvbmZpZy52aWV3Q29udGFpbmVyUmVmLmluamVjdG9yO1xuICAgIGNvbnN0IGluamVjdG9yID0gbmV3IFBvcnRhbEluamVjdG9yKHVzZXJJbmplY3RvciB8fCB0aGlzLl9pbmplY3RvciwgbmV3IFdlYWtNYXAoW1xuICAgICAgW0RpYWxvZ0NvbmZpZywgY29uZmlnXVxuICAgIF0pKTtcbiAgICBjb25zdCBjb250YWluZXJQb3J0YWwgPSBuZXcgQ29tcG9uZW50UG9ydGFsKGNvbnRhaW5lciwgY29uZmlnLnZpZXdDb250YWluZXJSZWYsIGluamVjdG9yKTtcbiAgICBjb25zdCBjb250YWluZXJSZWY6IENvbXBvbmVudFJlZjxDZGtEaWFsb2dDb250YWluZXI+ID0gb3ZlcmxheS5hdHRhY2goY29udGFpbmVyUG9ydGFsKTtcbiAgICBjb250YWluZXJSZWYuaW5zdGFuY2UuX2NvbmZpZyA9IGNvbmZpZztcblxuICAgIHJldHVybiBjb250YWluZXJSZWYuaW5zdGFuY2U7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBBdHRhY2hlcyB0aGUgdXNlci1wcm92aWRlZCBjb21wb25lbnQgdG8gdGhlIGFscmVhZHktY3JlYXRlZCBNYXREaWFsb2dDb250YWluZXIuXG4gICAqIEBwYXJhbSBjb21wb25lbnRPclRlbXBsYXRlUmVmIFRoZSB0eXBlIG9mIGNvbXBvbmVudCBiZWluZyBsb2FkZWQgaW50byB0aGUgZGlhbG9nLFxuICAgKiAgICAgb3IgYSBUZW1wbGF0ZVJlZiB0byBpbnN0YW50aWF0ZSBhcyB0aGUgY29udGVudC5cbiAgICogQHBhcmFtIGRpYWxvZ0NvbnRhaW5lciBSZWZlcmVuY2UgdG8gdGhlIHdyYXBwaW5nIE1hdERpYWxvZ0NvbnRhaW5lci5cbiAgICogQHBhcmFtIG92ZXJsYXlSZWYgUmVmZXJlbmNlIHRvIHRoZSBvdmVybGF5IGluIHdoaWNoIHRoZSBkaWFsb2cgcmVzaWRlcy5cbiAgICogQHBhcmFtIGNvbmZpZyBUaGUgZGlhbG9nIGNvbmZpZ3VyYXRpb24uXG4gICAqIEByZXR1cm5zIEEgcHJvbWlzZSByZXNvbHZpbmcgdG8gdGhlIE1hdERpYWxvZ1JlZiB0aGF0IHNob3VsZCBiZSByZXR1cm5lZCB0byB0aGUgdXNlci5cbiAgICovXG4gIHByb3RlY3RlZCBfYXR0YWNoRGlhbG9nQ29udGVudEZvckNvbXBvbmVudDxUPihcbiAgICAgIGNvbXBvbmVudE9yVGVtcGxhdGVSZWY6IENvbXBvbmVudFR5cGU8VD4sXG4gICAgICBkaWFsb2dDb250YWluZXI6IENka0RpYWxvZ0NvbnRhaW5lcixcbiAgICAgIG92ZXJsYXlSZWY6IE92ZXJsYXlSZWYsXG4gICAgICBjb25maWc6IERpYWxvZ0NvbmZpZyk6IERpYWxvZ1JlZjxhbnk+IHtcblxuICAgIC8vIENyZWF0ZSBhIHJlZmVyZW5jZSB0byB0aGUgZGlhbG9nIHdlJ3JlIGNyZWF0aW5nIGluIG9yZGVyIHRvIGdpdmUgdGhlIHVzZXIgYSBoYW5kbGVcbiAgICAvLyB0byBtb2RpZnkgYW5kIGNsb3NlIGl0LlxuICAgIGNvbnN0IGRpYWxvZ1JlZiA9IHRoaXMuX2NyZWF0ZURpYWxvZ1JlZihvdmVybGF5UmVmLCBkaWFsb2dDb250YWluZXIsIGNvbmZpZyk7XG4gICAgY29uc3QgaW5qZWN0b3IgPSB0aGlzLl9jcmVhdGVJbmplY3RvcjxUPihjb25maWcsIGRpYWxvZ1JlZiwgZGlhbG9nQ29udGFpbmVyKTtcbiAgICBjb25zdCBjb250ZW50UmVmID0gZGlhbG9nQ29udGFpbmVyLmF0dGFjaENvbXBvbmVudFBvcnRhbChcbiAgICAgICAgbmV3IENvbXBvbmVudFBvcnRhbChjb21wb25lbnRPclRlbXBsYXRlUmVmLCB1bmRlZmluZWQsIGluamVjdG9yKSk7XG4gICAgZGlhbG9nUmVmLmNvbXBvbmVudEluc3RhbmNlID0gY29udGVudFJlZi5pbnN0YW5jZTtcbiAgICByZXR1cm4gZGlhbG9nUmVmO1xuICB9XG5cbiAgLyoqXG4gICAqIEF0dGFjaGVzIHRoZSB1c2VyLXByb3ZpZGVkIGNvbXBvbmVudCB0byB0aGUgYWxyZWFkeS1jcmVhdGVkIE1hdERpYWxvZ0NvbnRhaW5lci5cbiAgICogQHBhcmFtIGNvbXBvbmVudE9yVGVtcGxhdGVSZWYgVGhlIHR5cGUgb2YgY29tcG9uZW50IGJlaW5nIGxvYWRlZCBpbnRvIHRoZSBkaWFsb2csXG4gICAqICAgICBvciBhIFRlbXBsYXRlUmVmIHRvIGluc3RhbnRpYXRlIGFzIHRoZSBjb250ZW50LlxuICAgKiBAcGFyYW0gZGlhbG9nQ29udGFpbmVyIFJlZmVyZW5jZSB0byB0aGUgd3JhcHBpbmcgTWF0RGlhbG9nQ29udGFpbmVyLlxuICAgKiBAcGFyYW0gb3ZlcmxheVJlZiBSZWZlcmVuY2UgdG8gdGhlIG92ZXJsYXkgaW4gd2hpY2ggdGhlIGRpYWxvZyByZXNpZGVzLlxuICAgKiBAcGFyYW0gY29uZmlnIFRoZSBkaWFsb2cgY29uZmlndXJhdGlvbi5cbiAgICogQHJldHVybnMgQSBwcm9taXNlIHJlc29sdmluZyB0byB0aGUgTWF0RGlhbG9nUmVmIHRoYXQgc2hvdWxkIGJlIHJldHVybmVkIHRvIHRoZSB1c2VyLlxuICAgKi9cbiAgcHJvdGVjdGVkIF9hdHRhY2hEaWFsb2dDb250ZW50Rm9yVGVtcGxhdGU8VD4oXG4gICAgICBjb21wb25lbnRPclRlbXBsYXRlUmVmOiBUZW1wbGF0ZVJlZjxUPixcbiAgICAgIGRpYWxvZ0NvbnRhaW5lcjogQ2RrRGlhbG9nQ29udGFpbmVyLFxuICAgICAgb3ZlcmxheVJlZjogT3ZlcmxheVJlZixcbiAgICAgIGNvbmZpZzogRGlhbG9nQ29uZmlnKTogRGlhbG9nUmVmPGFueT4ge1xuXG4gICAgLy8gQ3JlYXRlIGEgcmVmZXJlbmNlIHRvIHRoZSBkaWFsb2cgd2UncmUgY3JlYXRpbmcgaW4gb3JkZXIgdG8gZ2l2ZSB0aGUgdXNlciBhIGhhbmRsZVxuICAgIC8vIHRvIG1vZGlmeSBhbmQgY2xvc2UgaXQuXG4gICAgY29uc3QgZGlhbG9nUmVmID0gdGhpcy5fY3JlYXRlRGlhbG9nUmVmKG92ZXJsYXlSZWYsIGRpYWxvZ0NvbnRhaW5lciwgY29uZmlnKTtcbiAgICBkaWFsb2dDb250YWluZXIuYXR0YWNoVGVtcGxhdGVQb3J0YWwoXG4gICAgICBuZXcgVGVtcGxhdGVQb3J0YWw8VD4oY29tcG9uZW50T3JUZW1wbGF0ZVJlZiwgbnVsbCEsXG4gICAgICAgIDxhbnk+eyRpbXBsaWNpdDogY29uZmlnLmRhdGEsIGRpYWxvZ1JlZn0pKTtcbiAgICByZXR1cm4gZGlhbG9nUmVmO1xuICB9XG5cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIGN1c3RvbSBpbmplY3RvciB0byBiZSB1c2VkIGluc2lkZSB0aGUgZGlhbG9nLiBUaGlzIGFsbG93cyBhIGNvbXBvbmVudCBsb2FkZWQgaW5zaWRlXG4gICAqIG9mIGEgZGlhbG9nIHRvIGNsb3NlIGl0c2VsZiBhbmQsIG9wdGlvbmFsbHksIHRvIHJldHVybiBhIHZhbHVlLlxuICAgKiBAcGFyYW0gY29uZmlnIENvbmZpZyBvYmplY3QgdGhhdCBpcyB1c2VkIHRvIGNvbnN0cnVjdCB0aGUgZGlhbG9nLlxuICAgKiBAcGFyYW0gZGlhbG9nUmVmIFJlZmVyZW5jZSB0byB0aGUgZGlhbG9nLlxuICAgKiBAcGFyYW0gY29udGFpbmVyIERpYWxvZyBjb250YWluZXIgZWxlbWVudCB0aGF0IHdyYXBzIGFsbCBvZiB0aGUgY29udGVudHMuXG4gICAqIEByZXR1cm5zIFRoZSBjdXN0b20gaW5qZWN0b3IgdGhhdCBjYW4gYmUgdXNlZCBpbnNpZGUgdGhlIGRpYWxvZy5cbiAgICovXG4gIHByaXZhdGUgX2NyZWF0ZUluamVjdG9yPFQ+KFxuICAgICAgY29uZmlnOiBEaWFsb2dDb25maWcsXG4gICAgICBkaWFsb2dSZWY6IERpYWxvZ1JlZjxUPixcbiAgICAgIGRpYWxvZ0NvbnRhaW5lcjogQ2RrRGlhbG9nQ29udGFpbmVyKTogUG9ydGFsSW5qZWN0b3Ige1xuXG4gICAgY29uc3QgdXNlckluamVjdG9yID0gY29uZmlnICYmIGNvbmZpZy52aWV3Q29udGFpbmVyUmVmICYmIGNvbmZpZy52aWV3Q29udGFpbmVyUmVmLmluamVjdG9yO1xuICAgIGNvbnN0IGluamVjdGlvblRva2VucyA9IG5ldyBXZWFrTWFwPGFueSwgYW55PihbXG4gICAgICBbdGhpcy5faW5qZWN0b3IuZ2V0KERJQUxPR19SRUYpLCBkaWFsb2dSZWZdLFxuICAgICAgW3RoaXMuX2luamVjdG9yLmdldChESUFMT0dfQ09OVEFJTkVSKSwgZGlhbG9nQ29udGFpbmVyXSxcbiAgICAgIFtESUFMT0dfREFUQSwgY29uZmlnLmRhdGFdXG4gICAgXSk7XG5cbiAgICBpZiAoY29uZmlnLmRpcmVjdGlvbiAmJlxuICAgICAgICAoIXVzZXJJbmplY3RvciB8fCAhdXNlckluamVjdG9yLmdldDxEaXJlY3Rpb25hbGl0eSB8IG51bGw+KERpcmVjdGlvbmFsaXR5LCBudWxsKSkpIHtcbiAgICAgIGluamVjdGlvblRva2Vucy5zZXQoRGlyZWN0aW9uYWxpdHksIHtcbiAgICAgICAgdmFsdWU6IGNvbmZpZy5kaXJlY3Rpb24sXG4gICAgICAgIGNoYW5nZTogb2JzZXJ2YWJsZU9mKClcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgUG9ydGFsSW5qZWN0b3IodXNlckluamVjdG9yIHx8IHRoaXMuX2luamVjdG9yLCBpbmplY3Rpb25Ub2tlbnMpO1xuICB9XG5cbiAgLyoqIENyZWF0ZXMgYSBuZXcgZGlhbG9nIHJlZi4gKi9cbiAgcHJpdmF0ZSBfY3JlYXRlRGlhbG9nUmVmKG92ZXJsYXlSZWY6IE92ZXJsYXlSZWYsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBkaWFsb2dDb250YWluZXI6IENka0RpYWxvZ0NvbnRhaW5lcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZzogRGlhbG9nQ29uZmlnKSB7XG4gICAgY29uc3QgZGlhbG9nUmVmID0gbmV3IHRoaXMuX2RpYWxvZ1JlZkNvbnN0cnVjdG9yKG92ZXJsYXlSZWYsIGRpYWxvZ0NvbnRhaW5lciwgY29uZmlnLmlkKTtcbiAgICBkaWFsb2dSZWYuZGlzYWJsZUNsb3NlID0gY29uZmlnLmRpc2FibGVDbG9zZTtcbiAgICBkaWFsb2dSZWYudXBkYXRlU2l6ZShjb25maWcpLnVwZGF0ZVBvc2l0aW9uKGNvbmZpZy5wb3NpdGlvbik7XG4gICAgcmV0dXJuIGRpYWxvZ1JlZjtcbiAgfVxuXG4gIC8qKlxuICAgKiBFeHBhbmRzIHRoZSBwcm92aWRlZCBjb25maWd1cmF0aW9uIG9iamVjdCB0byBpbmNsdWRlIHRoZSBkZWZhdWx0IHZhbHVlcyBmb3IgcHJvcGVydGllcyB3aGljaFxuICAgKiBhcmUgdW5kZWZpbmVkLlxuICAgKi9cbiAgcHJpdmF0ZSBfYXBwbHlDb25maWdEZWZhdWx0cyhjb25maWc/OiBEaWFsb2dDb25maWcpOiBEaWFsb2dDb25maWcge1xuICAgIGNvbnN0IGRpYWxvZ0NvbmZpZyA9IHRoaXMuX2luamVjdG9yLmdldChESUFMT0dfQ09ORklHKSBhcyB0eXBlb2YgRGlhbG9nQ29uZmlnO1xuICAgIHJldHVybiB7Li4ubmV3IGRpYWxvZ0NvbmZpZygpLCAuLi5jb25maWd9O1xuICB9XG59XG4iXX0=