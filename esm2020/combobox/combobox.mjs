import { Directive, ElementRef, EventEmitter, Input, Optional, Output, ViewContainerRef, } from '@angular/core';
import { TemplatePortal } from '@angular/cdk/portal';
import { Overlay, OverlayConfig, } from '@angular/cdk/overlay';
import { Directionality } from '@angular/cdk/bidi';
import { coerceBooleanProperty, coerceArray } from '@angular/cdk/coercion';
import { _getEventTarget } from '@angular/cdk/platform';
import { DOWN_ARROW, ENTER, ESCAPE, TAB } from '@angular/cdk/keycodes';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/overlay";
import * as i2 from "@angular/cdk/bidi";
const allowedOpenActions = ['focus', 'click', 'downKey', 'toggle'];
export class CdkCombobox {
    constructor(_elementRef, _overlay, _viewContainerRef, _directionality) {
        this._elementRef = _elementRef;
        this._overlay = _overlay;
        this._viewContainerRef = _viewContainerRef;
        this._directionality = _directionality;
        this._disabled = false;
        this._openActions = ['click'];
        this._autoSetText = true;
        this.opened = new EventEmitter();
        this.closed = new EventEmitter();
        this.panelValueChanged = new EventEmitter();
        this.contentId = '';
    }
    get panel() {
        return this._panel;
    }
    set panel(panel) {
        this._panel = panel;
    }
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
    ngAfterContentInit() {
        this._panel?.valueUpdated.subscribe(data => {
            this._setComboboxValue(data);
            this.close();
        });
        this._panel?.contentIdUpdated.subscribe(id => {
            this.contentId = id;
        });
        this._panel?.contentTypeUpdated.subscribe(type => {
            this.contentType = type;
        });
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
                this._panel?.focusContent();
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
                this._panel?.focusContent();
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
        return !!this.panel;
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
    _getPanelContent() {
        const hasPanelChanged = this._panel?._templateRef !== this._panelContent?.templateRef;
        if (this._panel && (!this._panel || hasPanelChanged)) {
            this._panelContent = new TemplatePortal(this._panel._templateRef, this._viewContainerRef);
        }
        return this._panelContent;
    }
    _coerceOpenActionProperty(input) {
        let actions = typeof input === 'string' ? input.trim().split(/[ ,]+/) : input;
        if ((typeof ngDevMode === 'undefined' || ngDevMode) &&
            actions.some(a => allowedOpenActions.indexOf(a) === -1)) {
            throw Error(`${input} is not a support open action for CdkCombobox`);
        }
        return actions;
    }
}
CdkCombobox.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.0", ngImport: i0, type: CdkCombobox, deps: [{ token: i0.ElementRef }, { token: i1.Overlay }, { token: i0.ViewContainerRef }, { token: i2.Directionality, optional: true }], target: i0.ɵɵFactoryTarget.Directive });
CdkCombobox.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "13.0.0", type: CdkCombobox, selector: "[cdkCombobox]", inputs: { panel: ["cdkComboboxTriggerFor", "panel"], value: "value", disabled: "disabled", openActions: "openActions", autoSetText: "autoSetText" }, outputs: { opened: "comboboxPanelOpened", closed: "comboboxPanelClosed", panelValueChanged: "panelValueChanged" }, host: { attributes: { "role": "combobox" }, listeners: { "click": "_handleInteractions(\"click\")", "focus": "_handleInteractions(\"focus\")", "keydown": "_keydown($event)", "document:click": "_attemptClose($event)" }, properties: { "attr.aria-disabled": "disabled", "attr.aria-owns": "contentId", "attr.aria-haspopup": "contentType", "attr.aria-expanded": "isOpen()", "attr.tabindex": "_getTabIndex()" }, classAttribute: "cdk-combobox" }, exportAs: ["cdkCombobox"], ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.0", ngImport: i0, type: CdkCombobox, decorators: [{
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
                }]
        }], ctorParameters: function () { return [{ type: i0.ElementRef }, { type: i1.Overlay }, { type: i0.ViewContainerRef }, { type: i2.Directionality, decorators: [{
                    type: Optional
                }] }]; }, propDecorators: { panel: [{
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tYm9ib3guanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrLWV4cGVyaW1lbnRhbC9jb21ib2JveC9jb21ib2JveC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFXQSxPQUFPLEVBRUwsU0FBUyxFQUNULFVBQVUsRUFDVixZQUFZLEVBQ1osS0FBSyxFQUVMLFFBQVEsRUFDUixNQUFNLEVBQ04sZ0JBQWdCLEdBQ2pCLE1BQU0sZUFBZSxDQUFDO0FBRXZCLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUNuRCxPQUFPLEVBR0wsT0FBTyxFQUNQLGFBQWEsR0FFZCxNQUFNLHNCQUFzQixDQUFDO0FBQzlCLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUNqRCxPQUFPLEVBQWUscUJBQXFCLEVBQUUsV0FBVyxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDdkYsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQ3RELE9BQU8sRUFBQyxVQUFVLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQzs7OztBQUVyRSxNQUFNLGtCQUFrQixHQUFHLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFtQm5FLE1BQU0sT0FBTyxXQUFXO0lBb0R0QixZQUNtQixXQUFvQyxFQUNwQyxRQUFpQixFQUNmLGlCQUFtQyxFQUN6QixlQUFnQztRQUg1QyxnQkFBVyxHQUFYLFdBQVcsQ0FBeUI7UUFDcEMsYUFBUSxHQUFSLFFBQVEsQ0FBUztRQUNmLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBa0I7UUFDekIsb0JBQWUsR0FBZixlQUFlLENBQWlCO1FBcEN2RCxjQUFTLEdBQVksS0FBSyxDQUFDO1FBUzNCLGlCQUFZLEdBQWlCLENBQUMsT0FBTyxDQUFDLENBQUM7UUFVdkMsaUJB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QkFBc0IsRUFBRSxVQUFVO3dCQUNsQyxrQkFBa0IsRUFBRSxXQUFXO3dCQUMvQixzQkFBc0IsRUFBRSxhQUFhO3dCQUNyQyxzQkFBc0IsRUFBRSxVQUFVO3dCQUNsQyxpQkFBaUIsRUFBRSxnQkFBZ0I7cUJBQ3BDO2lCQUNGOzswQkF5REksUUFBUTs0Q0F0RFAsS0FBSztzQkFEUixLQUFLO3VCQUFDLHVCQUF1QjtnQkFVOUIsS0FBSztzQkFESixLQUFLO2dCQUlGLFFBQVE7c0JBRFgsS0FBSztnQkFVRixXQUFXO3NCQURkLEtBQUs7Z0JBV0YsV0FBVztzQkFEZCxLQUFLO2dCQVNrQyxNQUFNO3NCQUE3QyxNQUFNO3VCQUFDLHFCQUFxQjtnQkFDVyxNQUFNO3NCQUE3QyxNQUFNO3VCQUFDLHFCQUFxQjtnQkFDUyxpQkFBaUI7c0JBQXRELE1BQU07dUJBQUMsbUJBQW1CIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmV4cG9ydCB0eXBlIE9wZW5BY3Rpb24gPSAnZm9jdXMnIHwgJ2NsaWNrJyB8ICdkb3duS2V5JyB8ICd0b2dnbGUnO1xuZXhwb3J0IHR5cGUgT3BlbkFjdGlvbklucHV0ID0gT3BlbkFjdGlvbiB8IE9wZW5BY3Rpb25bXSB8IHN0cmluZyB8IG51bGwgfCB1bmRlZmluZWQ7XG5cbmltcG9ydCB7XG4gIEFmdGVyQ29udGVudEluaXQsXG4gIERpcmVjdGl2ZSxcbiAgRWxlbWVudFJlZixcbiAgRXZlbnRFbWl0dGVyLFxuICBJbnB1dCxcbiAgT25EZXN0cm95LFxuICBPcHRpb25hbCxcbiAgT3V0cHV0LFxuICBWaWV3Q29udGFpbmVyUmVmLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7Q2RrQ29tYm9ib3hQYW5lbCwgQXJpYUhhc1BvcHVwVmFsdWV9IGZyb20gJy4vY29tYm9ib3gtcGFuZWwnO1xuaW1wb3J0IHtUZW1wbGF0ZVBvcnRhbH0gZnJvbSAnQGFuZ3VsYXIvY2RrL3BvcnRhbCc7XG5pbXBvcnQge1xuICBDb25uZWN0ZWRQb3NpdGlvbixcbiAgRmxleGlibGVDb25uZWN0ZWRQb3NpdGlvblN0cmF0ZWd5LFxuICBPdmVybGF5LFxuICBPdmVybGF5Q29uZmlnLFxuICBPdmVybGF5UmVmLFxufSBmcm9tICdAYW5ndWxhci9jZGsvb3ZlcmxheSc7XG5pbXBvcnQge0RpcmVjdGlvbmFsaXR5fSBmcm9tICdAYW5ndWxhci9jZGsvYmlkaSc7XG5pbXBvcnQge0Jvb2xlYW5JbnB1dCwgY29lcmNlQm9vbGVhblByb3BlcnR5LCBjb2VyY2VBcnJheX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvZXJjaW9uJztcbmltcG9ydCB7X2dldEV2ZW50VGFyZ2V0fSBmcm9tICdAYW5ndWxhci9jZGsvcGxhdGZvcm0nO1xuaW1wb3J0IHtET1dOX0FSUk9XLCBFTlRFUiwgRVNDQVBFLCBUQUJ9IGZyb20gJ0Bhbmd1bGFyL2Nkay9rZXljb2Rlcyc7XG5cbmNvbnN0IGFsbG93ZWRPcGVuQWN0aW9ucyA9IFsnZm9jdXMnLCAnY2xpY2snLCAnZG93bktleScsICd0b2dnbGUnXTtcblxuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW2Nka0NvbWJvYm94XScsXG4gIGV4cG9ydEFzOiAnY2RrQ29tYm9ib3gnLFxuICBob3N0OiB7XG4gICAgJ3JvbGUnOiAnY29tYm9ib3gnLFxuICAgICdjbGFzcyc6ICdjZGstY29tYm9ib3gnLFxuICAgICcoY2xpY2spJzogJ19oYW5kbGVJbnRlcmFjdGlvbnMoXCJjbGlja1wiKScsXG4gICAgJyhmb2N1cyknOiAnX2hhbmRsZUludGVyYWN0aW9ucyhcImZvY3VzXCIpJyxcbiAgICAnKGtleWRvd24pJzogJ19rZXlkb3duKCRldmVudCknLFxuICAgICcoZG9jdW1lbnQ6Y2xpY2spJzogJ19hdHRlbXB0Q2xvc2UoJGV2ZW50KScsXG4gICAgJ1thdHRyLmFyaWEtZGlzYWJsZWRdJzogJ2Rpc2FibGVkJyxcbiAgICAnW2F0dHIuYXJpYS1vd25zXSc6ICdjb250ZW50SWQnLFxuICAgICdbYXR0ci5hcmlhLWhhc3BvcHVwXSc6ICdjb250ZW50VHlwZScsXG4gICAgJ1thdHRyLmFyaWEtZXhwYW5kZWRdJzogJ2lzT3BlbigpJyxcbiAgICAnW2F0dHIudGFiaW5kZXhdJzogJ19nZXRUYWJJbmRleCgpJyxcbiAgfSxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrQ29tYm9ib3g8VCA9IHVua25vd24+IGltcGxlbWVudHMgT25EZXN0cm95LCBBZnRlckNvbnRlbnRJbml0IHtcbiAgQElucHV0KCdjZGtDb21ib2JveFRyaWdnZXJGb3InKVxuICBnZXQgcGFuZWwoKTogQ2RrQ29tYm9ib3hQYW5lbDxUPiB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIHRoaXMuX3BhbmVsO1xuICB9XG4gIHNldCBwYW5lbChwYW5lbDogQ2RrQ29tYm9ib3hQYW5lbDxUPiB8IHVuZGVmaW5lZCkge1xuICAgIHRoaXMuX3BhbmVsID0gcGFuZWw7XG4gIH1cbiAgcHJpdmF0ZSBfcGFuZWw6IENka0NvbWJvYm94UGFuZWw8VD4gfCB1bmRlZmluZWQ7XG5cbiAgQElucHV0KClcbiAgdmFsdWU6IFQgfCBUW107XG5cbiAgQElucHV0KClcbiAgZ2V0IGRpc2FibGVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9kaXNhYmxlZDtcbiAgfVxuICBzZXQgZGlzYWJsZWQodmFsdWU6IGJvb2xlYW4pIHtcbiAgICB0aGlzLl9kaXNhYmxlZCA9IGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eSh2YWx1ZSk7XG4gIH1cbiAgcHJpdmF0ZSBfZGlzYWJsZWQ6IGJvb2xlYW4gPSBmYWxzZTtcblxuICBASW5wdXQoKVxuICBnZXQgb3BlbkFjdGlvbnMoKTogT3BlbkFjdGlvbltdIHtcbiAgICByZXR1cm4gdGhpcy5fb3BlbkFjdGlvbnM7XG4gIH1cbiAgc2V0IG9wZW5BY3Rpb25zKGFjdGlvbjogT3BlbkFjdGlvbltdKSB7XG4gICAgdGhpcy5fb3BlbkFjdGlvbnMgPSB0aGlzLl9jb2VyY2VPcGVuQWN0aW9uUHJvcGVydHkoYWN0aW9uKTtcbiAgfVxuICBwcml2YXRlIF9vcGVuQWN0aW9uczogT3BlbkFjdGlvbltdID0gWydjbGljayddO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSB0ZXh0Q29udGVudCBpcyBhdXRvbWF0aWNhbGx5IHVwZGF0ZWQgdXBvbiBjaGFuZ2Ugb2YgdGhlIGNvbWJvYm94IHZhbHVlLiAqL1xuICBASW5wdXQoKVxuICBnZXQgYXV0b1NldFRleHQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2F1dG9TZXRUZXh0O1xuICB9XG4gIHNldCBhdXRvU2V0VGV4dCh2YWx1ZTogYm9vbGVhbikge1xuICAgIHRoaXMuX2F1dG9TZXRUZXh0ID0gY29lcmNlQm9vbGVhblByb3BlcnR5KHZhbHVlKTtcbiAgfVxuICBwcml2YXRlIF9hdXRvU2V0VGV4dDogYm9vbGVhbiA9IHRydWU7XG5cbiAgQE91dHB1dCgnY29tYm9ib3hQYW5lbE9wZW5lZCcpIHJlYWRvbmx5IG9wZW5lZDogRXZlbnRFbWl0dGVyPHZvaWQ+ID0gbmV3IEV2ZW50RW1pdHRlcjx2b2lkPigpO1xuICBAT3V0cHV0KCdjb21ib2JveFBhbmVsQ2xvc2VkJykgcmVhZG9ubHkgY2xvc2VkOiBFdmVudEVtaXR0ZXI8dm9pZD4gPSBuZXcgRXZlbnRFbWl0dGVyPHZvaWQ+KCk7XG4gIEBPdXRwdXQoJ3BhbmVsVmFsdWVDaGFuZ2VkJykgcmVhZG9ubHkgcGFuZWxWYWx1ZUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxUW10+ID0gbmV3IEV2ZW50RW1pdHRlcjxcbiAgICBUW11cbiAgPigpO1xuXG4gIHByaXZhdGUgX292ZXJsYXlSZWY6IE92ZXJsYXlSZWY7XG4gIHByaXZhdGUgX3BhbmVsQ29udGVudDogVGVtcGxhdGVQb3J0YWw7XG4gIGNvbnRlbnRJZDogc3RyaW5nID0gJyc7XG4gIGNvbnRlbnRUeXBlOiBBcmlhSGFzUG9wdXBWYWx1ZTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIHJlYWRvbmx5IF9lbGVtZW50UmVmOiBFbGVtZW50UmVmPEhUTUxFbGVtZW50PixcbiAgICBwcml2YXRlIHJlYWRvbmx5IF9vdmVybGF5OiBPdmVybGF5LFxuICAgIHByb3RlY3RlZCByZWFkb25seSBfdmlld0NvbnRhaW5lclJlZjogVmlld0NvbnRhaW5lclJlZixcbiAgICBAT3B0aW9uYWwoKSBwcml2YXRlIHJlYWRvbmx5IF9kaXJlY3Rpb25hbGl0eT86IERpcmVjdGlvbmFsaXR5LFxuICApIHt9XG5cbiAgbmdBZnRlckNvbnRlbnRJbml0KCkge1xuICAgIHRoaXMuX3BhbmVsPy52YWx1ZVVwZGF0ZWQuc3Vic2NyaWJlKGRhdGEgPT4ge1xuICAgICAgdGhpcy5fc2V0Q29tYm9ib3hWYWx1ZShkYXRhKTtcbiAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICB9KTtcblxuICAgIHRoaXMuX3BhbmVsPy5jb250ZW50SWRVcGRhdGVkLnN1YnNjcmliZShpZCA9PiB7XG4gICAgICB0aGlzLmNvbnRlbnRJZCA9IGlkO1xuICAgIH0pO1xuXG4gICAgdGhpcy5fcGFuZWw/LmNvbnRlbnRUeXBlVXBkYXRlZC5zdWJzY3JpYmUodHlwZSA9PiB7XG4gICAgICB0aGlzLmNvbnRlbnRUeXBlID0gdHlwZTtcbiAgICB9KTtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIGlmICh0aGlzLl9vdmVybGF5UmVmKSB7XG4gICAgICB0aGlzLl9vdmVybGF5UmVmLmRpc3Bvc2UoKTtcbiAgICB9XG5cbiAgICB0aGlzLm9wZW5lZC5jb21wbGV0ZSgpO1xuICAgIHRoaXMuY2xvc2VkLmNvbXBsZXRlKCk7XG4gICAgdGhpcy5wYW5lbFZhbHVlQ2hhbmdlZC5jb21wbGV0ZSgpO1xuICB9XG5cbiAgX2tleWRvd24oZXZlbnQ6IEtleWJvYXJkRXZlbnQpIHtcbiAgICBjb25zdCB7a2V5Q29kZX0gPSBldmVudDtcblxuICAgIGlmIChrZXlDb2RlID09PSBET1dOX0FSUk9XKSB7XG4gICAgICBpZiAodGhpcy5pc09wZW4oKSkge1xuICAgICAgICB0aGlzLl9wYW5lbD8uZm9jdXNDb250ZW50KCk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuX29wZW5BY3Rpb25zLmluZGV4T2YoJ2Rvd25LZXknKSAhPT0gLTEpIHtcbiAgICAgICAgdGhpcy5vcGVuKCk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChrZXlDb2RlID09PSBFTlRFUikge1xuICAgICAgaWYgKHRoaXMuX29wZW5BY3Rpb25zLmluZGV4T2YoJ3RvZ2dsZScpICE9PSAtMSkge1xuICAgICAgICB0aGlzLnRvZ2dsZSgpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLl9vcGVuQWN0aW9ucy5pbmRleE9mKCdjbGljaycpICE9PSAtMSkge1xuICAgICAgICB0aGlzLm9wZW4oKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGtleUNvZGUgPT09IEVTQ0FQRSkge1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICB9IGVsc2UgaWYgKGtleUNvZGUgPT09IFRBQikge1xuICAgICAgdGhpcy5jbG9zZSgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBIYW5kbGVzIGNsaWNrIG9yIGZvY3VzIGludGVyYWN0aW9ucy4gKi9cbiAgX2hhbmRsZUludGVyYWN0aW9ucyhpbnRlcmFjdGlvbjogT3BlbkFjdGlvbikge1xuICAgIGlmIChpbnRlcmFjdGlvbiA9PT0gJ2NsaWNrJykge1xuICAgICAgaWYgKHRoaXMuX29wZW5BY3Rpb25zLmluZGV4T2YoJ3RvZ2dsZScpICE9PSAtMSkge1xuICAgICAgICB0aGlzLnRvZ2dsZSgpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLl9vcGVuQWN0aW9ucy5pbmRleE9mKCdjbGljaycpICE9PSAtMSkge1xuICAgICAgICB0aGlzLm9wZW4oKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGludGVyYWN0aW9uID09PSAnZm9jdXMnKSB7XG4gICAgICBpZiAodGhpcy5fb3BlbkFjdGlvbnMuaW5kZXhPZignZm9jdXMnKSAhPT0gLTEpIHtcbiAgICAgICAgdGhpcy5vcGVuKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqIEdpdmVuIGEgY2xpY2sgaW4gdGhlIGRvY3VtZW50LCBkZXRlcm1pbmVzIGlmIHRoZSBjbGljayB3YXMgaW5zaWRlIGEgY29tYm9ib3guICovXG4gIF9hdHRlbXB0Q2xvc2UoZXZlbnQ6IE1vdXNlRXZlbnQpIHtcbiAgICBpZiAodGhpcy5pc09wZW4oKSkge1xuICAgICAgbGV0IHRhcmdldCA9IF9nZXRFdmVudFRhcmdldChldmVudCk7XG4gICAgICB3aGlsZSAodGFyZ2V0IGluc3RhbmNlb2YgRWxlbWVudCkge1xuICAgICAgICBpZiAodGFyZ2V0LmNsYXNzTmFtZS5pbmRleE9mKCdjZGstY29tYm9ib3gnKSAhPT0gLTEpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGFyZ2V0ID0gdGFyZ2V0LnBhcmVudEVsZW1lbnQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5jbG9zZSgpO1xuICB9XG5cbiAgLyoqIFRvZ2dsZXMgdGhlIG9wZW4gc3RhdGUgb2YgdGhlIHBhbmVsLiAqL1xuICB0b2dnbGUoKSB7XG4gICAgaWYgKHRoaXMuaGFzUGFuZWwoKSkge1xuICAgICAgdGhpcy5pc09wZW4oKSA/IHRoaXMuY2xvc2UoKSA6IHRoaXMub3BlbigpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBJZiB0aGUgY29tYm9ib3ggaXMgY2xvc2VkIGFuZCBub3QgZGlzYWJsZWQsIG9wZW5zIHRoZSBwYW5lbC4gKi9cbiAgb3BlbigpIHtcbiAgICBpZiAoIXRoaXMuaXNPcGVuKCkgJiYgIXRoaXMuZGlzYWJsZWQpIHtcbiAgICAgIHRoaXMub3BlbmVkLm5leHQoKTtcbiAgICAgIHRoaXMuX292ZXJsYXlSZWYgPSB0aGlzLl9vdmVybGF5UmVmIHx8IHRoaXMuX292ZXJsYXkuY3JlYXRlKHRoaXMuX2dldE92ZXJsYXlDb25maWcoKSk7XG4gICAgICB0aGlzLl9vdmVybGF5UmVmLmF0dGFjaCh0aGlzLl9nZXRQYW5lbENvbnRlbnQoKSk7XG4gICAgICBpZiAoIXRoaXMuX2lzVGV4dFRyaWdnZXIoKSkge1xuICAgICAgICB0aGlzLl9wYW5lbD8uZm9jdXNDb250ZW50KCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqIElmIHRoZSBjb21ib2JveCBpcyBvcGVuIGFuZCBub3QgZGlzYWJsZWQsIGNsb3NlcyB0aGUgcGFuZWwuICovXG4gIGNsb3NlKCkge1xuICAgIGlmICh0aGlzLmlzT3BlbigpICYmICF0aGlzLmRpc2FibGVkKSB7XG4gICAgICB0aGlzLmNsb3NlZC5uZXh0KCk7XG4gICAgICB0aGlzLl9vdmVybGF5UmVmLmRldGFjaCgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBSZXR1cm5zIHRydWUgaWYgcGFuZWwgaXMgY3VycmVudGx5IG9wZW5lZC4gKi9cbiAgaXNPcGVuKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9vdmVybGF5UmVmID8gdGhpcy5fb3ZlcmxheVJlZi5oYXNBdHRhY2hlZCgpIDogZmFsc2U7XG4gIH1cblxuICAvKiogUmV0dXJucyB0cnVlIGlmIGNvbWJvYm94IGhhcyBhIGNoaWxkIHBhbmVsLiAqL1xuICBoYXNQYW5lbCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gISF0aGlzLnBhbmVsO1xuICB9XG5cbiAgX2dldFRhYkluZGV4KCk6IHN0cmluZyB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLmRpc2FibGVkID8gbnVsbCA6ICcwJztcbiAgfVxuXG4gIHByaXZhdGUgX3NldENvbWJvYm94VmFsdWUodmFsdWU6IFQgfCBUW10pIHtcbiAgICBjb25zdCB2YWx1ZUNoYW5nZWQgPSB0aGlzLnZhbHVlICE9PSB2YWx1ZTtcbiAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG5cbiAgICBpZiAodmFsdWVDaGFuZ2VkKSB7XG4gICAgICB0aGlzLnBhbmVsVmFsdWVDaGFuZ2VkLmVtaXQoY29lcmNlQXJyYXkodmFsdWUpKTtcbiAgICAgIGlmICh0aGlzLl9hdXRvU2V0VGV4dCkge1xuICAgICAgICB0aGlzLl9zZXRUZXh0Q29udGVudCh2YWx1ZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfc2V0VGV4dENvbnRlbnQoY29udGVudDogVCB8IFRbXSkge1xuICAgIGNvbnN0IGNvbnRlbnRBcnJheSA9IGNvZXJjZUFycmF5KGNvbnRlbnQpO1xuICAgIHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudC50ZXh0Q29udGVudCA9IGNvbnRlbnRBcnJheS5qb2luKCcgJyk7XG4gIH1cblxuICBwcml2YXRlIF9pc1RleHRUcmlnZ2VyKCkge1xuICAgIC8vIFRPRE86IFNob3VsZCBjaGVjayBpZiB0aGUgdHJpZ2dlciBpcyBjb250ZW50ZWRpdGFibGUuXG4gICAgY29uc3QgdGFnTmFtZSA9IHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudC50YWdOYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgcmV0dXJuIHRhZ05hbWUgPT09ICdpbnB1dCcgfHwgdGFnTmFtZSA9PT0gJ3RleHRhcmVhJyA/IHRydWUgOiBmYWxzZTtcbiAgfVxuXG4gIHByaXZhdGUgX2dldE92ZXJsYXlDb25maWcoKSB7XG4gICAgcmV0dXJuIG5ldyBPdmVybGF5Q29uZmlnKHtcbiAgICAgIHBvc2l0aW9uU3RyYXRlZ3k6IHRoaXMuX2dldE92ZXJsYXlQb3NpdGlvblN0cmF0ZWd5KCksXG4gICAgICBzY3JvbGxTdHJhdGVneTogdGhpcy5fb3ZlcmxheS5zY3JvbGxTdHJhdGVnaWVzLmJsb2NrKCksXG4gICAgICBkaXJlY3Rpb246IHRoaXMuX2RpcmVjdGlvbmFsaXR5LFxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0T3ZlcmxheVBvc2l0aW9uU3RyYXRlZ3koKTogRmxleGlibGVDb25uZWN0ZWRQb3NpdGlvblN0cmF0ZWd5IHtcbiAgICByZXR1cm4gdGhpcy5fb3ZlcmxheVxuICAgICAgLnBvc2l0aW9uKClcbiAgICAgIC5mbGV4aWJsZUNvbm5lY3RlZFRvKHRoaXMuX2VsZW1lbnRSZWYpXG4gICAgICAud2l0aFBvc2l0aW9ucyh0aGlzLl9nZXRPdmVybGF5UG9zaXRpb25zKCkpO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0T3ZlcmxheVBvc2l0aW9ucygpOiBDb25uZWN0ZWRQb3NpdGlvbltdIHtcbiAgICByZXR1cm4gW1xuICAgICAge29yaWdpblg6ICdzdGFydCcsIG9yaWdpblk6ICdib3R0b20nLCBvdmVybGF5WDogJ3N0YXJ0Jywgb3ZlcmxheVk6ICd0b3AnfSxcbiAgICAgIHtvcmlnaW5YOiAnc3RhcnQnLCBvcmlnaW5ZOiAndG9wJywgb3ZlcmxheVg6ICdzdGFydCcsIG92ZXJsYXlZOiAnYm90dG9tJ30sXG4gICAgICB7b3JpZ2luWDogJ2VuZCcsIG9yaWdpblk6ICdib3R0b20nLCBvdmVybGF5WDogJ2VuZCcsIG92ZXJsYXlZOiAndG9wJ30sXG4gICAgICB7b3JpZ2luWDogJ2VuZCcsIG9yaWdpblk6ICd0b3AnLCBvdmVybGF5WDogJ2VuZCcsIG92ZXJsYXlZOiAnYm90dG9tJ30sXG4gICAgXTtcbiAgfVxuXG4gIHByaXZhdGUgX2dldFBhbmVsQ29udGVudCgpIHtcbiAgICBjb25zdCBoYXNQYW5lbENoYW5nZWQgPSB0aGlzLl9wYW5lbD8uX3RlbXBsYXRlUmVmICE9PSB0aGlzLl9wYW5lbENvbnRlbnQ/LnRlbXBsYXRlUmVmO1xuICAgIGlmICh0aGlzLl9wYW5lbCAmJiAoIXRoaXMuX3BhbmVsIHx8IGhhc1BhbmVsQ2hhbmdlZCkpIHtcbiAgICAgIHRoaXMuX3BhbmVsQ29udGVudCA9IG5ldyBUZW1wbGF0ZVBvcnRhbCh0aGlzLl9wYW5lbC5fdGVtcGxhdGVSZWYsIHRoaXMuX3ZpZXdDb250YWluZXJSZWYpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9wYW5lbENvbnRlbnQ7XG4gIH1cblxuICBwcml2YXRlIF9jb2VyY2VPcGVuQWN0aW9uUHJvcGVydHkoaW5wdXQ6IHN0cmluZyB8IE9wZW5BY3Rpb25bXSk6IE9wZW5BY3Rpb25bXSB7XG4gICAgbGV0IGFjdGlvbnMgPSB0eXBlb2YgaW5wdXQgPT09ICdzdHJpbmcnID8gaW5wdXQudHJpbSgpLnNwbGl0KC9bICxdKy8pIDogaW5wdXQ7XG4gICAgaWYgKFxuICAgICAgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkgJiZcbiAgICAgIGFjdGlvbnMuc29tZShhID0+IGFsbG93ZWRPcGVuQWN0aW9ucy5pbmRleE9mKGEpID09PSAtMSlcbiAgICApIHtcbiAgICAgIHRocm93IEVycm9yKGAke2lucHV0fSBpcyBub3QgYSBzdXBwb3J0IG9wZW4gYWN0aW9uIGZvciBDZGtDb21ib2JveGApO1xuICAgIH1cbiAgICByZXR1cm4gYWN0aW9ucyBhcyBPcGVuQWN0aW9uW107XG4gIH1cblxuICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfb3BlbkFjdGlvbnM6IE9wZW5BY3Rpb25JbnB1dDtcbiAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2F1dG9TZXRUZXh0OiBPcGVuQWN0aW9uSW5wdXQ7XG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9kaXNhYmxlZDogQm9vbGVhbklucHV0O1xufVxuIl19