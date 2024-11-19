import * as i0 from '@angular/core';
import { InjectionToken, inject, ElementRef, ViewContainerRef, Injector, ChangeDetectorRef, EventEmitter, Directive, Input, Output, NgModule } from '@angular/core';
import { Overlay, OverlayConfig, OverlayModule } from '@angular/cdk/overlay';
import { Directionality } from '@angular/cdk/bidi';
import { coerceBooleanProperty, coerceArray } from '@angular/cdk/coercion';
import { DOWN_ARROW, ENTER, ESCAPE, TAB } from '@angular/cdk/keycodes';
import { _getEventTarget } from '@angular/cdk/platform';
import { TemplatePortal } from '@angular/cdk/portal';
import { DOCUMENT } from '@angular/common';
import { _IdGenerator } from '@angular/cdk/a11y';

const allowedOpenActions = ['focus', 'click', 'downKey', 'toggle'];
const CDK_COMBOBOX = new InjectionToken('CDK_COMBOBOX');
class CdkCombobox {
    _elementRef = inject(ElementRef);
    _overlay = inject(Overlay);
    _viewContainerRef = inject(ViewContainerRef);
    _injector = inject(Injector);
    _doc = inject(DOCUMENT);
    _directionality = inject(Directionality, { optional: true });
    _changeDetectorRef = inject(ChangeDetectorRef);
    _overlayRef;
    _panelPortal;
    _panelTemplateRef;
    value;
    get disabled() {
        return this._disabled;
    }
    set disabled(value) {
        this._disabled = coerceBooleanProperty(value);
    }
    _disabled = false;
    get openActions() {
        return this._openActions;
    }
    set openActions(action) {
        this._openActions = this._coerceOpenActionProperty(action);
    }
    _openActions = ['click'];
    /** Whether the textContent is automatically updated upon change of the combobox value. */
    get autoSetText() {
        return this._autoSetText;
    }
    set autoSetText(value) {
        this._autoSetText = coerceBooleanProperty(value);
    }
    _autoSetText = true;
    opened = new EventEmitter();
    closed = new EventEmitter();
    panelValueChanged = new EventEmitter();
    contentId = '';
    contentType;
    ngOnDestroy() {
        if (this._overlayRef) {
            this._overlayRef.dispose();
        }
        this.opened.complete();
        this.closed.complete();
        this.panelValueChanged.complete();
    }
    _keydown(event) {
        const { keyCode } = event;
        if (keyCode === DOWN_ARROW) {
            if (this.isOpen()) {
                // TODO: instead of using a focus function, potentially use cdk/a11y focus trapping
                this._doc.getElementById(this.contentId)?.focus();
            }
            else if (this._openActions.indexOf('downKey') !== -1) {
                this.open();
            }
        }
        else if (keyCode === ENTER) {
            if (this._openActions.indexOf('toggle') !== -1) {
                this.toggle();
            }
            else if (this._openActions.indexOf('click') !== -1) {
                this.open();
            }
        }
        else if (keyCode === ESCAPE) {
            event.preventDefault();
            this.close();
        }
        else if (keyCode === TAB) {
            this.close();
        }
    }
    /** Handles click or focus interactions. */
    _handleInteractions(interaction) {
        if (interaction === 'click') {
            if (this._openActions.indexOf('toggle') !== -1) {
                this.toggle();
            }
            else if (this._openActions.indexOf('click') !== -1) {
                this.open();
            }
        }
        else if (interaction === 'focus') {
            if (this._openActions.indexOf('focus') !== -1) {
                this.open();
            }
        }
    }
    /** Given a click in the document, determines if the click was inside a combobox. */
    _attemptClose(event) {
        if (this.isOpen()) {
            let target = _getEventTarget(event);
            while (target instanceof Element) {
                if (target.className.indexOf('cdk-combobox') !== -1) {
                    return;
                }
                target = target.parentElement;
            }
        }
        this.close();
    }
    /** Toggles the open state of the panel. */
    toggle() {
        if (this.hasPanel()) {
            this.isOpen() ? this.close() : this.open();
        }
    }
    /** If the combobox is closed and not disabled, opens the panel. */
    open() {
        if (!this.isOpen() && !this.disabled) {
            this.opened.next();
            this._overlayRef = this._overlayRef || this._overlay.create(this._getOverlayConfig());
            this._overlayRef.attach(this._getPanelContent());
            this._changeDetectorRef.markForCheck();
            if (!this._isTextTrigger()) {
                // TODO: instead of using a focus function, potentially use cdk/a11y focus trapping
                this._doc.getElementById(this.contentId)?.focus();
            }
        }
    }
    /** If the combobox is open and not disabled, closes the panel. */
    close() {
        if (this.isOpen() && !this.disabled) {
            this.closed.next();
            this._overlayRef.detach();
            this._changeDetectorRef.markForCheck();
        }
    }
    /** Returns true if panel is currently opened. */
    isOpen() {
        return this._overlayRef ? this._overlayRef.hasAttached() : false;
    }
    /** Returns true if combobox has a child panel. */
    hasPanel() {
        return !!this._panelTemplateRef;
    }
    _getTabIndex() {
        return this.disabled ? null : '0';
    }
    _setComboboxValue(value) {
        const valueChanged = this.value !== value;
        this.value = value;
        if (valueChanged) {
            this.panelValueChanged.emit(coerceArray(value));
            if (this._autoSetText) {
                this._setTextContent(value);
            }
        }
    }
    updateAndClose(value) {
        this._setComboboxValue(value);
        this.close();
    }
    _setTextContent(content) {
        const contentArray = coerceArray(content);
        this._elementRef.nativeElement.textContent = contentArray.join(' ');
    }
    _isTextTrigger() {
        // TODO: Should check if the trigger is contenteditable.
        const tagName = this._elementRef.nativeElement.tagName.toLowerCase();
        return tagName === 'input' || tagName === 'textarea' ? true : false;
    }
    _getOverlayConfig() {
        return new OverlayConfig({
            positionStrategy: this._getOverlayPositionStrategy(),
            scrollStrategy: this._overlay.scrollStrategies.block(),
            direction: this._directionality || undefined,
        });
    }
    _getOverlayPositionStrategy() {
        return this._overlay
            .position()
            .flexibleConnectedTo(this._elementRef)
            .withPositions(this._getOverlayPositions());
    }
    _getOverlayPositions() {
        return [
            { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' },
            { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom' },
            { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top' },
            { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom' },
        ];
    }
    _getPanelInjector() {
        return this._injector;
    }
    _getPanelContent() {
        const hasPanelChanged = this._panelTemplateRef !== this._panelPortal?.templateRef;
        if (this._panelTemplateRef && (!this._panelPortal || hasPanelChanged)) {
            this._panelPortal = new TemplatePortal(this._panelTemplateRef, this._viewContainerRef, undefined, this._getPanelInjector());
        }
        return this._panelPortal;
    }
    _coerceOpenActionProperty(input) {
        let actions = typeof input === 'string' ? input.trim().split(/[ ,]+/) : input;
        if ((typeof ngDevMode === 'undefined' || ngDevMode) &&
            actions?.some(a => allowedOpenActions.indexOf(a) === -1)) {
            throw Error(`${input} is not a support open action for CdkCombobox`);
        }
        return actions;
    }
    /** Registers the content's id and the content type with the panel. */
    _registerContent(contentId, contentType) {
        if ((typeof ngDevMode === 'undefined' || ngDevMode) &&
            contentType !== 'listbox' &&
            contentType !== 'dialog') {
            throw Error('CdkComboboxPanel currently only supports listbox or dialog content.');
        }
        this.contentId = contentId;
        this.contentType = contentType;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.0", ngImport: i0, type: CdkCombobox, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "19.0.0", type: CdkCombobox, isStandalone: true, selector: "[cdkCombobox]", inputs: { _panelTemplateRef: ["cdkComboboxTriggerFor", "_panelTemplateRef"], value: "value", disabled: "disabled", openActions: "openActions", autoSetText: "autoSetText" }, outputs: { opened: "comboboxPanelOpened", closed: "comboboxPanelClosed", panelValueChanged: "panelValueChanged" }, host: { attributes: { "role": "combobox" }, listeners: { "click": "_handleInteractions(\"click\")", "focus": "_handleInteractions(\"focus\")", "keydown": "_keydown($event)", "document:click": "_attemptClose($event)" }, properties: { "attr.aria-disabled": "disabled", "attr.aria-owns": "contentId", "attr.aria-haspopup": "contentType", "attr.aria-expanded": "isOpen()", "attr.tabindex": "_getTabIndex()" }, classAttribute: "cdk-combobox" }, providers: [{ provide: CDK_COMBOBOX, useExisting: CdkCombobox }], exportAs: ["cdkCombobox"], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.0", ngImport: i0, type: CdkCombobox, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkCombobox]',
                    exportAs: 'cdkCombobox',
                    host: {
                        'role': 'combobox',
                        'class': 'cdk-combobox',
                        '(click)': '_handleInteractions("click")',
                        '(focus)': '_handleInteractions("focus")',
                        '(keydown)': '_keydown($event)',
                        '(document:click)': '_attemptClose($event)',
                        '[attr.aria-disabled]': 'disabled',
                        '[attr.aria-owns]': 'contentId',
                        '[attr.aria-haspopup]': 'contentType',
                        '[attr.aria-expanded]': 'isOpen()',
                        '[attr.tabindex]': '_getTabIndex()',
                    },
                    providers: [{ provide: CDK_COMBOBOX, useExisting: CdkCombobox }],
                }]
        }], propDecorators: { _panelTemplateRef: [{
                type: Input,
                args: ['cdkComboboxTriggerFor']
            }], value: [{
                type: Input
            }], disabled: [{
                type: Input
            }], openActions: [{
                type: Input
            }], autoSetText: [{
                type: Input
            }], opened: [{
                type: Output,
                args: ['comboboxPanelOpened']
            }], closed: [{
                type: Output,
                args: ['comboboxPanelClosed']
            }], panelValueChanged: [{
                type: Output,
                args: ['panelValueChanged']
            }] } });

class CdkComboboxPopup {
    _elementRef = inject(ElementRef);
    _combobox = inject(CDK_COMBOBOX);
    get role() {
        return this._role;
    }
    set role(value) {
        this._role = value;
    }
    _role = 'dialog';
    get firstFocus() {
        return this._firstFocusElement;
    }
    set firstFocus(id) {
        this._firstFocusElement = id;
    }
    _firstFocusElement;
    id = inject(_IdGenerator).getId('cdk-combobox-popup-');
    ngOnInit() {
        this.registerWithPanel();
    }
    registerWithPanel() {
        this._combobox._registerContent(this.id, this._role);
    }
    focusFirstElement() {
        if (this._firstFocusElement) {
            this._firstFocusElement.focus();
        }
        else {
            this._elementRef.nativeElement.focus();
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.0", ngImport: i0, type: CdkComboboxPopup, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "19.0.0", type: CdkComboboxPopup, isStandalone: true, selector: "[cdkComboboxPopup]", inputs: { role: "role", firstFocus: "firstFocus", id: "id" }, host: { attributes: { "tabindex": "-1" }, listeners: { "focus": "focusFirstElement()" }, properties: { "attr.role": "role", "id": "id" }, classAttribute: "cdk-combobox-popup" }, exportAs: ["cdkComboboxPopup"], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.0", ngImport: i0, type: CdkComboboxPopup, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkComboboxPopup]',
                    exportAs: 'cdkComboboxPopup',
                    host: {
                        'class': 'cdk-combobox-popup',
                        '[attr.role]': 'role',
                        '[id]': 'id',
                        'tabindex': '-1',
                        '(focus)': 'focusFirstElement()',
                    },
                }]
        }], propDecorators: { role: [{
                type: Input
            }], firstFocus: [{
                type: Input
            }], id: [{
                type: Input
            }] } });

const EXPORTED_DECLARATIONS = [CdkCombobox, CdkComboboxPopup];
class CdkComboboxModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.0", ngImport: i0, type: CdkComboboxModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "19.0.0", ngImport: i0, type: CdkComboboxModule, imports: [OverlayModule, CdkCombobox, CdkComboboxPopup], exports: [CdkCombobox, CdkComboboxPopup] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "19.0.0", ngImport: i0, type: CdkComboboxModule, imports: [OverlayModule] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.0", ngImport: i0, type: CdkComboboxModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [OverlayModule, ...EXPORTED_DECLARATIONS],
                    exports: EXPORTED_DECLARATIONS,
                }]
        }] });

/**
 * Generated bundle index. Do not edit.
 */

export { CDK_COMBOBOX, CdkCombobox, CdkComboboxModule, CdkComboboxPopup };
//# sourceMappingURL=combobox.mjs.map
