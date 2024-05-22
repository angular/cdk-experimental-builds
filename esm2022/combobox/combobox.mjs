/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { DOCUMENT } from '@angular/common';
import { Directive, ElementRef, EventEmitter, Inject, InjectionToken, Injector, Input, Optional, Output, TemplateRef, ViewContainerRef, } from '@angular/core';
import { TemplatePortal } from '@angular/cdk/portal';
import { Overlay, OverlayConfig, } from '@angular/cdk/overlay';
import { Directionality } from '@angular/cdk/bidi';
import { coerceArray, coerceBooleanProperty } from '@angular/cdk/coercion';
import { _getEventTarget } from '@angular/cdk/platform';
import { DOWN_ARROW, ENTER, ESCAPE, TAB } from '@angular/cdk/keycodes';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/overlay";
import * as i2 from "@angular/cdk/bidi";
const allowedOpenActions = ['focus', 'click', 'downKey', 'toggle'];
export const CDK_COMBOBOX = new InjectionToken('CDK_COMBOBOX');
export class CdkCombobox {
    get disabled() {
        return this._disabled;
    }
    set disabled(value) {
        this._disabled = coerceBooleanProperty(value);
    }
    get openActions() {
        return this._openActions;
    }
    set openActions(action) {
        this._openActions = this._coerceOpenActionProperty(action);
    }
    /** Whether the textContent is automatically updated upon change of the combobox value. */
    get autoSetText() {
        return this._autoSetText;
    }
    set autoSetText(value) {
        this._autoSetText = coerceBooleanProperty(value);
    }
    constructor(_elementRef, _overlay, _viewContainerRef, _injector, _doc, _directionality) {
        this._elementRef = _elementRef;
        this._overlay = _overlay;
        this._viewContainerRef = _viewContainerRef;
        this._injector = _injector;
        this._doc = _doc;
        this._directionality = _directionality;
        this._disabled = false;
        this._openActions = ['click'];
        this._autoSetText = true;
        this.opened = new EventEmitter();
        this.closed = new EventEmitter();
        this.panelValueChanged = new EventEmitter();
        this.contentId = '';
    }
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
            direction: this._directionality,
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.0", ngImport: i0, type: CdkCombobox, deps: [{ token: i0.ElementRef }, { token: i1.Overlay }, { token: i0.ViewContainerRef }, { token: i0.Injector }, { token: DOCUMENT }, { token: i2.Directionality, optional: true }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.0.0", type: CdkCombobox, isStandalone: true, selector: "[cdkCombobox]", inputs: { _panelTemplateRef: ["cdkComboboxTriggerFor", "_panelTemplateRef"], value: "value", disabled: "disabled", openActions: "openActions", autoSetText: "autoSetText" }, outputs: { opened: "comboboxPanelOpened", closed: "comboboxPanelClosed", panelValueChanged: "panelValueChanged" }, host: { attributes: { "role": "combobox" }, listeners: { "click": "_handleInteractions(\"click\")", "focus": "_handleInteractions(\"focus\")", "keydown": "_keydown($event)", "document:click": "_attemptClose($event)" }, properties: { "attr.aria-disabled": "disabled", "attr.aria-owns": "contentId", "attr.aria-haspopup": "contentType", "attr.aria-expanded": "isOpen()", "attr.tabindex": "_getTabIndex()" }, classAttribute: "cdk-combobox" }, providers: [{ provide: CDK_COMBOBOX, useExisting: CdkCombobox }], exportAs: ["cdkCombobox"], ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.0", ngImport: i0, type: CdkCombobox, decorators: [{
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
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: i1.Overlay }, { type: i0.ViewContainerRef }, { type: i0.Injector }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [DOCUMENT]
                }] }, { type: i2.Directionality, decorators: [{
                    type: Optional
                }] }], propDecorators: { _panelTemplateRef: [{
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tYm9ib3guanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrLWV4cGVyaW1lbnRhbC9jb21ib2JveC9jb21ib2JveC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFDSCxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDekMsT0FBTyxFQUNMLFNBQVMsRUFDVCxVQUFVLEVBQ1YsWUFBWSxFQUNaLE1BQU0sRUFDTixjQUFjLEVBQ2QsUUFBUSxFQUNSLEtBQUssRUFFTCxRQUFRLEVBQ1IsTUFBTSxFQUNOLFdBQVcsRUFDWCxnQkFBZ0IsR0FDakIsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQ25ELE9BQU8sRUFHTCxPQUFPLEVBQ1AsYUFBYSxHQUVkLE1BQU0sc0JBQXNCLENBQUM7QUFDOUIsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQ2pELE9BQU8sRUFBZSxXQUFXLEVBQUUscUJBQXFCLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUN2RixPQUFPLEVBQUMsZUFBZSxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDdEQsT0FBTyxFQUFDLFVBQVUsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBQyxNQUFNLHVCQUF1QixDQUFDOzs7O0FBTXJFLE1BQU0sa0JBQWtCLEdBQUcsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQztBQUVuRSxNQUFNLENBQUMsTUFBTSxZQUFZLEdBQUcsSUFBSSxjQUFjLENBQWMsY0FBYyxDQUFDLENBQUM7QUFxQjVFLE1BQU0sT0FBTyxXQUFXO0lBT3RCLElBQ0ksUUFBUTtRQUNWLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQztJQUN4QixDQUFDO0lBQ0QsSUFBSSxRQUFRLENBQUMsS0FBbUI7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QVE7c0JBRFgsS0FBSztnQkFVRixXQUFXO3NCQURkLEtBQUs7Z0JBV0YsV0FBVztzQkFEZCxLQUFLO2dCQVNrQyxNQUFNO3NCQUE3QyxNQUFNO3VCQUFDLHFCQUFxQjtnQkFDVyxNQUFNO3NCQUE3QyxNQUFNO3VCQUFDLHFCQUFxQjtnQkFDUyxpQkFBaUI7c0JBQXRELE1BQU07dUJBQUMsbUJBQW1CIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge0RPQ1VNRU5UfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHtcbiAgRGlyZWN0aXZlLFxuICBFbGVtZW50UmVmLFxuICBFdmVudEVtaXR0ZXIsXG4gIEluamVjdCxcbiAgSW5qZWN0aW9uVG9rZW4sXG4gIEluamVjdG9yLFxuICBJbnB1dCxcbiAgT25EZXN0cm95LFxuICBPcHRpb25hbCxcbiAgT3V0cHV0LFxuICBUZW1wbGF0ZVJlZixcbiAgVmlld0NvbnRhaW5lclJlZixcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge1RlbXBsYXRlUG9ydGFsfSBmcm9tICdAYW5ndWxhci9jZGsvcG9ydGFsJztcbmltcG9ydCB7XG4gIENvbm5lY3RlZFBvc2l0aW9uLFxuICBGbGV4aWJsZUNvbm5lY3RlZFBvc2l0aW9uU3RyYXRlZ3ksXG4gIE92ZXJsYXksXG4gIE92ZXJsYXlDb25maWcsXG4gIE92ZXJsYXlSZWYsXG59IGZyb20gJ0Bhbmd1bGFyL2Nkay9vdmVybGF5JztcbmltcG9ydCB7RGlyZWN0aW9uYWxpdHl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9iaWRpJztcbmltcG9ydCB7Qm9vbGVhbklucHV0LCBjb2VyY2VBcnJheSwgY29lcmNlQm9vbGVhblByb3BlcnR5fSBmcm9tICdAYW5ndWxhci9jZGsvY29lcmNpb24nO1xuaW1wb3J0IHtfZ2V0RXZlbnRUYXJnZXR9IGZyb20gJ0Bhbmd1bGFyL2Nkay9wbGF0Zm9ybSc7XG5pbXBvcnQge0RPV05fQVJST1csIEVOVEVSLCBFU0NBUEUsIFRBQn0gZnJvbSAnQGFuZ3VsYXIvY2RrL2tleWNvZGVzJztcblxuZXhwb3J0IHR5cGUgQXJpYUhhc1BvcHVwVmFsdWUgPSAnZmFsc2UnIHwgJ3RydWUnIHwgJ21lbnUnIHwgJ2xpc3Rib3gnIHwgJ3RyZWUnIHwgJ2dyaWQnIHwgJ2RpYWxvZyc7XG5leHBvcnQgdHlwZSBPcGVuQWN0aW9uID0gJ2ZvY3VzJyB8ICdjbGljaycgfCAnZG93bktleScgfCAndG9nZ2xlJztcbmV4cG9ydCB0eXBlIE9wZW5BY3Rpb25JbnB1dCA9IE9wZW5BY3Rpb24gfCBPcGVuQWN0aW9uW10gfCBzdHJpbmcgfCBudWxsIHwgdW5kZWZpbmVkO1xuXG5jb25zdCBhbGxvd2VkT3BlbkFjdGlvbnMgPSBbJ2ZvY3VzJywgJ2NsaWNrJywgJ2Rvd25LZXknLCAndG9nZ2xlJ107XG5cbmV4cG9ydCBjb25zdCBDREtfQ09NQk9CT1ggPSBuZXcgSW5qZWN0aW9uVG9rZW48Q2RrQ29tYm9ib3g+KCdDREtfQ09NQk9CT1gnKTtcblxuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW2Nka0NvbWJvYm94XScsXG4gIGV4cG9ydEFzOiAnY2RrQ29tYm9ib3gnLFxuICBob3N0OiB7XG4gICAgJ3JvbGUnOiAnY29tYm9ib3gnLFxuICAgICdjbGFzcyc6ICdjZGstY29tYm9ib3gnLFxuICAgICcoY2xpY2spJzogJ19oYW5kbGVJbnRlcmFjdGlvbnMoXCJjbGlja1wiKScsXG4gICAgJyhmb2N1cyknOiAnX2hhbmRsZUludGVyYWN0aW9ucyhcImZvY3VzXCIpJyxcbiAgICAnKGtleWRvd24pJzogJ19rZXlkb3duKCRldmVudCknLFxuICAgICcoZG9jdW1lbnQ6Y2xpY2spJzogJ19hdHRlbXB0Q2xvc2UoJGV2ZW50KScsXG4gICAgJ1thdHRyLmFyaWEtZGlzYWJsZWRdJzogJ2Rpc2FibGVkJyxcbiAgICAnW2F0dHIuYXJpYS1vd25zXSc6ICdjb250ZW50SWQnLFxuICAgICdbYXR0ci5hcmlhLWhhc3BvcHVwXSc6ICdjb250ZW50VHlwZScsXG4gICAgJ1thdHRyLmFyaWEtZXhwYW5kZWRdJzogJ2lzT3BlbigpJyxcbiAgICAnW2F0dHIudGFiaW5kZXhdJzogJ19nZXRUYWJJbmRleCgpJyxcbiAgfSxcbiAgcHJvdmlkZXJzOiBbe3Byb3ZpZGU6IENES19DT01CT0JPWCwgdXNlRXhpc3Rpbmc6IENka0NvbWJvYm94fV0sXG4gIHN0YW5kYWxvbmU6IHRydWUsXG59KVxuZXhwb3J0IGNsYXNzIENka0NvbWJvYm94PFQgPSB1bmtub3duPiBpbXBsZW1lbnRzIE9uRGVzdHJveSB7XG4gIEBJbnB1dCgnY2RrQ29tYm9ib3hUcmlnZ2VyRm9yJylcbiAgX3BhbmVsVGVtcGxhdGVSZWY6IFRlbXBsYXRlUmVmPHVua25vd24+O1xuXG4gIEBJbnB1dCgpXG4gIHZhbHVlOiBUIHwgVFtdO1xuXG4gIEBJbnB1dCgpXG4gIGdldCBkaXNhYmxlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fZGlzYWJsZWQ7XG4gIH1cbiAgc2V0IGRpc2FibGVkKHZhbHVlOiBCb29sZWFuSW5wdXQpIHtcbiAgICB0aGlzLl9kaXNhYmxlZCA9IGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eSh2YWx1ZSk7XG4gIH1cbiAgcHJpdmF0ZSBfZGlzYWJsZWQ6IGJvb2xlYW4gPSBmYWxzZTtcblxuICBASW5wdXQoKVxuICBnZXQgb3BlbkFjdGlvbnMoKTogT3BlbkFjdGlvbltdIHtcbiAgICByZXR1cm4gdGhpcy5fb3BlbkFjdGlvbnM7XG4gIH1cbiAgc2V0IG9wZW5BY3Rpb25zKGFjdGlvbjogT3BlbkFjdGlvbklucHV0KSB7XG4gICAgdGhpcy5fb3BlbkFjdGlvbnMgPSB0aGlzLl9jb2VyY2VPcGVuQWN0aW9uUHJvcGVydHkoYWN0aW9uKTtcbiAgfVxuICBwcml2YXRlIF9vcGVuQWN0aW9uczogT3BlbkFjdGlvbltdID0gWydjbGljayddO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSB0ZXh0Q29udGVudCBpcyBhdXRvbWF0aWNhbGx5IHVwZGF0ZWQgdXBvbiBjaGFuZ2Ugb2YgdGhlIGNvbWJvYm94IHZhbHVlLiAqL1xuICBASW5wdXQoKVxuICBnZXQgYXV0b1NldFRleHQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2F1dG9TZXRUZXh0O1xuICB9XG4gIHNldCBhdXRvU2V0VGV4dCh2YWx1ZTogQm9vbGVhbklucHV0KSB7XG4gICAgdGhpcy5fYXV0b1NldFRleHQgPSBjb2VyY2VCb29sZWFuUHJvcGVydHkodmFsdWUpO1xuICB9XG4gIHByaXZhdGUgX2F1dG9TZXRUZXh0OiBib29sZWFuID0gdHJ1ZTtcblxuICBAT3V0cHV0KCdjb21ib2JveFBhbmVsT3BlbmVkJykgcmVhZG9ubHkgb3BlbmVkOiBFdmVudEVtaXR0ZXI8dm9pZD4gPSBuZXcgRXZlbnRFbWl0dGVyPHZvaWQ+KCk7XG4gIEBPdXRwdXQoJ2NvbWJvYm94UGFuZWxDbG9zZWQnKSByZWFkb25seSBjbG9zZWQ6IEV2ZW50RW1pdHRlcjx2b2lkPiA9IG5ldyBFdmVudEVtaXR0ZXI8dm9pZD4oKTtcbiAgQE91dHB1dCgncGFuZWxWYWx1ZUNoYW5nZWQnKSByZWFkb25seSBwYW5lbFZhbHVlQ2hhbmdlZDogRXZlbnRFbWl0dGVyPFRbXT4gPSBuZXcgRXZlbnRFbWl0dGVyPFxuICAgIFRbXVxuICA+KCk7XG5cbiAgcHJpdmF0ZSBfb3ZlcmxheVJlZjogT3ZlcmxheVJlZjtcbiAgcHJpdmF0ZSBfcGFuZWxQb3J0YWw6IFRlbXBsYXRlUG9ydGFsO1xuXG4gIGNvbnRlbnRJZDogc3RyaW5nID0gJyc7XG4gIGNvbnRlbnRUeXBlOiBBcmlhSGFzUG9wdXBWYWx1ZTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIHJlYWRvbmx5IF9lbGVtZW50UmVmOiBFbGVtZW50UmVmPEhUTUxFbGVtZW50PixcbiAgICBwcml2YXRlIHJlYWRvbmx5IF9vdmVybGF5OiBPdmVybGF5LFxuICAgIHByb3RlY3RlZCByZWFkb25seSBfdmlld0NvbnRhaW5lclJlZjogVmlld0NvbnRhaW5lclJlZixcbiAgICBwcml2YXRlIHJlYWRvbmx5IF9pbmplY3RvcjogSW5qZWN0b3IsXG4gICAgQEluamVjdChET0NVTUVOVCkgcHJpdmF0ZSByZWFkb25seSBfZG9jOiBhbnksXG4gICAgQE9wdGlvbmFsKCkgcHJpdmF0ZSByZWFkb25seSBfZGlyZWN0aW9uYWxpdHk/OiBEaXJlY3Rpb25hbGl0eSxcbiAgKSB7fVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIGlmICh0aGlzLl9vdmVybGF5UmVmKSB7XG4gICAgICB0aGlzLl9vdmVybGF5UmVmLmRpc3Bvc2UoKTtcbiAgICB9XG5cbiAgICB0aGlzLm9wZW5lZC5jb21wbGV0ZSgpO1xuICAgIHRoaXMuY2xvc2VkLmNvbXBsZXRlKCk7XG4gICAgdGhpcy5wYW5lbFZhbHVlQ2hhbmdlZC5jb21wbGV0ZSgpO1xuICB9XG5cbiAgX2tleWRvd24oZXZlbnQ6IEtleWJvYXJkRXZlbnQpIHtcbiAgICBjb25zdCB7a2V5Q29kZX0gPSBldmVudDtcblxuICAgIGlmIChrZXlDb2RlID09PSBET1dOX0FSUk9XKSB7XG4gICAgICBpZiAodGhpcy5pc09wZW4oKSkge1xuICAgICAgICAvLyBUT0RPOiBpbnN0ZWFkIG9mIHVzaW5nIGEgZm9jdXMgZnVuY3Rpb24sIHBvdGVudGlhbGx5IHVzZSBjZGsvYTExeSBmb2N1cyB0cmFwcGluZ1xuICAgICAgICB0aGlzLl9kb2MuZ2V0RWxlbWVudEJ5SWQodGhpcy5jb250ZW50SWQpPy5mb2N1cygpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLl9vcGVuQWN0aW9ucy5pbmRleE9mKCdkb3duS2V5JykgIT09IC0xKSB7XG4gICAgICAgIHRoaXMub3BlbigpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoa2V5Q29kZSA9PT0gRU5URVIpIHtcbiAgICAgIGlmICh0aGlzLl9vcGVuQWN0aW9ucy5pbmRleE9mKCd0b2dnbGUnKSAhPT0gLTEpIHtcbiAgICAgICAgdGhpcy50b2dnbGUoKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5fb3BlbkFjdGlvbnMuaW5kZXhPZignY2xpY2snKSAhPT0gLTEpIHtcbiAgICAgICAgdGhpcy5vcGVuKCk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChrZXlDb2RlID09PSBFU0NBUEUpIHtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB0aGlzLmNsb3NlKCk7XG4gICAgfSBlbHNlIGlmIChrZXlDb2RlID09PSBUQUIpIHtcbiAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICB9XG4gIH1cblxuICAvKiogSGFuZGxlcyBjbGljayBvciBmb2N1cyBpbnRlcmFjdGlvbnMuICovXG4gIF9oYW5kbGVJbnRlcmFjdGlvbnMoaW50ZXJhY3Rpb246IE9wZW5BY3Rpb24pIHtcbiAgICBpZiAoaW50ZXJhY3Rpb24gPT09ICdjbGljaycpIHtcbiAgICAgIGlmICh0aGlzLl9vcGVuQWN0aW9ucy5pbmRleE9mKCd0b2dnbGUnKSAhPT0gLTEpIHtcbiAgICAgICAgdGhpcy50b2dnbGUoKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5fb3BlbkFjdGlvbnMuaW5kZXhPZignY2xpY2snKSAhPT0gLTEpIHtcbiAgICAgICAgdGhpcy5vcGVuKCk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChpbnRlcmFjdGlvbiA9PT0gJ2ZvY3VzJykge1xuICAgICAgaWYgKHRoaXMuX29wZW5BY3Rpb25zLmluZGV4T2YoJ2ZvY3VzJykgIT09IC0xKSB7XG4gICAgICAgIHRoaXMub3BlbigpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKiBHaXZlbiBhIGNsaWNrIGluIHRoZSBkb2N1bWVudCwgZGV0ZXJtaW5lcyBpZiB0aGUgY2xpY2sgd2FzIGluc2lkZSBhIGNvbWJvYm94LiAqL1xuICBfYXR0ZW1wdENsb3NlKGV2ZW50OiBNb3VzZUV2ZW50KSB7XG4gICAgaWYgKHRoaXMuaXNPcGVuKCkpIHtcbiAgICAgIGxldCB0YXJnZXQgPSBfZ2V0RXZlbnRUYXJnZXQoZXZlbnQpO1xuICAgICAgd2hpbGUgKHRhcmdldCBpbnN0YW5jZW9mIEVsZW1lbnQpIHtcbiAgICAgICAgaWYgKHRhcmdldC5jbGFzc05hbWUuaW5kZXhPZignY2RrLWNvbWJvYm94JykgIT09IC0xKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRhcmdldCA9IHRhcmdldC5wYXJlbnRFbGVtZW50O1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuY2xvc2UoKTtcbiAgfVxuXG4gIC8qKiBUb2dnbGVzIHRoZSBvcGVuIHN0YXRlIG9mIHRoZSBwYW5lbC4gKi9cbiAgdG9nZ2xlKCkge1xuICAgIGlmICh0aGlzLmhhc1BhbmVsKCkpIHtcbiAgICAgIHRoaXMuaXNPcGVuKCkgPyB0aGlzLmNsb3NlKCkgOiB0aGlzLm9wZW4oKTtcbiAgICB9XG4gIH1cblxuICAvKiogSWYgdGhlIGNvbWJvYm94IGlzIGNsb3NlZCBhbmQgbm90IGRpc2FibGVkLCBvcGVucyB0aGUgcGFuZWwuICovXG4gIG9wZW4oKSB7XG4gICAgaWYgKCF0aGlzLmlzT3BlbigpICYmICF0aGlzLmRpc2FibGVkKSB7XG4gICAgICB0aGlzLm9wZW5lZC5uZXh0KCk7XG4gICAgICB0aGlzLl9vdmVybGF5UmVmID0gdGhpcy5fb3ZlcmxheVJlZiB8fCB0aGlzLl9vdmVybGF5LmNyZWF0ZSh0aGlzLl9nZXRPdmVybGF5Q29uZmlnKCkpO1xuICAgICAgdGhpcy5fb3ZlcmxheVJlZi5hdHRhY2godGhpcy5fZ2V0UGFuZWxDb250ZW50KCkpO1xuICAgICAgaWYgKCF0aGlzLl9pc1RleHRUcmlnZ2VyKCkpIHtcbiAgICAgICAgLy8gVE9ETzogaW5zdGVhZCBvZiB1c2luZyBhIGZvY3VzIGZ1bmN0aW9uLCBwb3RlbnRpYWxseSB1c2UgY2RrL2ExMXkgZm9jdXMgdHJhcHBpbmdcbiAgICAgICAgdGhpcy5fZG9jLmdldEVsZW1lbnRCeUlkKHRoaXMuY29udGVudElkKT8uZm9jdXMoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKiogSWYgdGhlIGNvbWJvYm94IGlzIG9wZW4gYW5kIG5vdCBkaXNhYmxlZCwgY2xvc2VzIHRoZSBwYW5lbC4gKi9cbiAgY2xvc2UoKSB7XG4gICAgaWYgKHRoaXMuaXNPcGVuKCkgJiYgIXRoaXMuZGlzYWJsZWQpIHtcbiAgICAgIHRoaXMuY2xvc2VkLm5leHQoKTtcbiAgICAgIHRoaXMuX292ZXJsYXlSZWYuZGV0YWNoKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFJldHVybnMgdHJ1ZSBpZiBwYW5lbCBpcyBjdXJyZW50bHkgb3BlbmVkLiAqL1xuICBpc09wZW4oKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX292ZXJsYXlSZWYgPyB0aGlzLl9vdmVybGF5UmVmLmhhc0F0dGFjaGVkKCkgOiBmYWxzZTtcbiAgfVxuXG4gIC8qKiBSZXR1cm5zIHRydWUgaWYgY29tYm9ib3ggaGFzIGEgY2hpbGQgcGFuZWwuICovXG4gIGhhc1BhbmVsKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAhIXRoaXMuX3BhbmVsVGVtcGxhdGVSZWY7XG4gIH1cblxuICBfZ2V0VGFiSW5kZXgoKTogc3RyaW5nIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuZGlzYWJsZWQgPyBudWxsIDogJzAnO1xuICB9XG5cbiAgcHJpdmF0ZSBfc2V0Q29tYm9ib3hWYWx1ZSh2YWx1ZTogVCB8IFRbXSkge1xuICAgIGNvbnN0IHZhbHVlQ2hhbmdlZCA9IHRoaXMudmFsdWUgIT09IHZhbHVlO1xuICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcblxuICAgIGlmICh2YWx1ZUNoYW5nZWQpIHtcbiAgICAgIHRoaXMucGFuZWxWYWx1ZUNoYW5nZWQuZW1pdChjb2VyY2VBcnJheSh2YWx1ZSkpO1xuICAgICAgaWYgKHRoaXMuX2F1dG9TZXRUZXh0KSB7XG4gICAgICAgIHRoaXMuX3NldFRleHRDb250ZW50KHZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICB1cGRhdGVBbmRDbG9zZSh2YWx1ZTogVCB8IFRbXSkge1xuICAgIHRoaXMuX3NldENvbWJvYm94VmFsdWUodmFsdWUpO1xuICAgIHRoaXMuY2xvc2UoKTtcbiAgfVxuXG4gIHByaXZhdGUgX3NldFRleHRDb250ZW50KGNvbnRlbnQ6IFQgfCBUW10pIHtcbiAgICBjb25zdCBjb250ZW50QXJyYXkgPSBjb2VyY2VBcnJheShjb250ZW50KTtcbiAgICB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQudGV4dENvbnRlbnQgPSBjb250ZW50QXJyYXkuam9pbignICcpO1xuICB9XG5cbiAgcHJpdmF0ZSBfaXNUZXh0VHJpZ2dlcigpIHtcbiAgICAvLyBUT0RPOiBTaG91bGQgY2hlY2sgaWYgdGhlIHRyaWdnZXIgaXMgY29udGVudGVkaXRhYmxlLlxuICAgIGNvbnN0IHRhZ05hbWUgPSB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQudGFnTmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgIHJldHVybiB0YWdOYW1lID09PSAnaW5wdXQnIHx8IHRhZ05hbWUgPT09ICd0ZXh0YXJlYScgPyB0cnVlIDogZmFsc2U7XG4gIH1cblxuICBwcml2YXRlIF9nZXRPdmVybGF5Q29uZmlnKCkge1xuICAgIHJldHVybiBuZXcgT3ZlcmxheUNvbmZpZyh7XG4gICAgICBwb3NpdGlvblN0cmF0ZWd5OiB0aGlzLl9nZXRPdmVybGF5UG9zaXRpb25TdHJhdGVneSgpLFxuICAgICAgc2Nyb2xsU3RyYXRlZ3k6IHRoaXMuX292ZXJsYXkuc2Nyb2xsU3RyYXRlZ2llcy5ibG9jaygpLFxuICAgICAgZGlyZWN0aW9uOiB0aGlzLl9kaXJlY3Rpb25hbGl0eSxcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX2dldE92ZXJsYXlQb3NpdGlvblN0cmF0ZWd5KCk6IEZsZXhpYmxlQ29ubmVjdGVkUG9zaXRpb25TdHJhdGVneSB7XG4gICAgcmV0dXJuIHRoaXMuX292ZXJsYXlcbiAgICAgIC5wb3NpdGlvbigpXG4gICAgICAuZmxleGlibGVDb25uZWN0ZWRUbyh0aGlzLl9lbGVtZW50UmVmKVxuICAgICAgLndpdGhQb3NpdGlvbnModGhpcy5fZ2V0T3ZlcmxheVBvc2l0aW9ucygpKTtcbiAgfVxuXG4gIHByaXZhdGUgX2dldE92ZXJsYXlQb3NpdGlvbnMoKTogQ29ubmVjdGVkUG9zaXRpb25bXSB7XG4gICAgcmV0dXJuIFtcbiAgICAgIHtvcmlnaW5YOiAnc3RhcnQnLCBvcmlnaW5ZOiAnYm90dG9tJywgb3ZlcmxheVg6ICdzdGFydCcsIG92ZXJsYXlZOiAndG9wJ30sXG4gICAgICB7b3JpZ2luWDogJ3N0YXJ0Jywgb3JpZ2luWTogJ3RvcCcsIG92ZXJsYXlYOiAnc3RhcnQnLCBvdmVybGF5WTogJ2JvdHRvbSd9LFxuICAgICAge29yaWdpblg6ICdlbmQnLCBvcmlnaW5ZOiAnYm90dG9tJywgb3ZlcmxheVg6ICdlbmQnLCBvdmVybGF5WTogJ3RvcCd9LFxuICAgICAge29yaWdpblg6ICdlbmQnLCBvcmlnaW5ZOiAndG9wJywgb3ZlcmxheVg6ICdlbmQnLCBvdmVybGF5WTogJ2JvdHRvbSd9LFxuICAgIF07XG4gIH1cblxuICBwcml2YXRlIF9nZXRQYW5lbEluamVjdG9yKCkge1xuICAgIHJldHVybiB0aGlzLl9pbmplY3RvcjtcbiAgfVxuXG4gIHByaXZhdGUgX2dldFBhbmVsQ29udGVudCgpIHtcbiAgICBjb25zdCBoYXNQYW5lbENoYW5nZWQgPSB0aGlzLl9wYW5lbFRlbXBsYXRlUmVmICE9PSB0aGlzLl9wYW5lbFBvcnRhbD8udGVtcGxhdGVSZWY7XG4gICAgaWYgKHRoaXMuX3BhbmVsVGVtcGxhdGVSZWYgJiYgKCF0aGlzLl9wYW5lbFBvcnRhbCB8fCBoYXNQYW5lbENoYW5nZWQpKSB7XG4gICAgICB0aGlzLl9wYW5lbFBvcnRhbCA9IG5ldyBUZW1wbGF0ZVBvcnRhbChcbiAgICAgICAgdGhpcy5fcGFuZWxUZW1wbGF0ZVJlZixcbiAgICAgICAgdGhpcy5fdmlld0NvbnRhaW5lclJlZixcbiAgICAgICAgdW5kZWZpbmVkLFxuICAgICAgICB0aGlzLl9nZXRQYW5lbEluamVjdG9yKCksXG4gICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9wYW5lbFBvcnRhbDtcbiAgfVxuXG4gIHByaXZhdGUgX2NvZXJjZU9wZW5BY3Rpb25Qcm9wZXJ0eShpbnB1dDogT3BlbkFjdGlvbklucHV0KTogT3BlbkFjdGlvbltdIHtcbiAgICBsZXQgYWN0aW9ucyA9IHR5cGVvZiBpbnB1dCA9PT0gJ3N0cmluZycgPyBpbnB1dC50cmltKCkuc3BsaXQoL1sgLF0rLykgOiBpbnB1dDtcbiAgICBpZiAoXG4gICAgICAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSAmJlxuICAgICAgYWN0aW9ucz8uc29tZShhID0+IGFsbG93ZWRPcGVuQWN0aW9ucy5pbmRleE9mKGEpID09PSAtMSlcbiAgICApIHtcbiAgICAgIHRocm93IEVycm9yKGAke2lucHV0fSBpcyBub3QgYSBzdXBwb3J0IG9wZW4gYWN0aW9uIGZvciBDZGtDb21ib2JveGApO1xuICAgIH1cbiAgICByZXR1cm4gYWN0aW9ucyBhcyBPcGVuQWN0aW9uW107XG4gIH1cblxuICAvKiogUmVnaXN0ZXJzIHRoZSBjb250ZW50J3MgaWQgYW5kIHRoZSBjb250ZW50IHR5cGUgd2l0aCB0aGUgcGFuZWwuICovXG4gIF9yZWdpc3RlckNvbnRlbnQoY29udGVudElkOiBzdHJpbmcsIGNvbnRlbnRUeXBlOiBBcmlhSGFzUG9wdXBWYWx1ZSkge1xuICAgIGlmIChcbiAgICAgICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpICYmXG4gICAgICBjb250ZW50VHlwZSAhPT0gJ2xpc3Rib3gnICYmXG4gICAgICBjb250ZW50VHlwZSAhPT0gJ2RpYWxvZydcbiAgICApIHtcbiAgICAgIHRocm93IEVycm9yKCdDZGtDb21ib2JveFBhbmVsIGN1cnJlbnRseSBvbmx5IHN1cHBvcnRzIGxpc3Rib3ggb3IgZGlhbG9nIGNvbnRlbnQuJyk7XG4gICAgfVxuICAgIHRoaXMuY29udGVudElkID0gY29udGVudElkO1xuICAgIHRoaXMuY29udGVudFR5cGUgPSBjb250ZW50VHlwZTtcbiAgfVxufVxuIl19