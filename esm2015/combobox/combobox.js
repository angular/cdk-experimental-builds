/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, ElementRef, EventEmitter, Input, Optional, Output, ViewContainerRef } from '@angular/core';
import { TemplatePortal } from '@angular/cdk/portal';
import { Overlay, OverlayConfig } from '@angular/cdk/overlay';
import { Directionality } from '@angular/cdk/bidi';
import { coerceBooleanProperty, coerceArray } from '@angular/cdk/coercion';
import { _getEventTarget } from '@angular/cdk/platform';
import { DOWN_ARROW, ENTER, ESCAPE, TAB } from '@angular/cdk/keycodes';
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
    get panel() { return this._panel; }
    set panel(panel) { this._panel = panel; }
    get disabled() { return this._disabled; }
    set disabled(value) { this._disabled = coerceBooleanProperty(value); }
    get openActions() {
        return this._openActions;
    }
    set openActions(action) {
        this._openActions = this._coerceOpenActionProperty(action);
    }
    /** Whether the textContent is automatically updated upon change of the combobox value. */
    get autoSetText() { return this._autoSetText; }
    set autoSetText(value) { this._autoSetText = coerceBooleanProperty(value); }
    ngAfterContentInit() {
        var _a, _b, _c;
        (_a = this._panel) === null || _a === void 0 ? void 0 : _a.valueUpdated.subscribe(data => {
            this._setComboboxValue(data);
            this.close();
        });
        (_b = this._panel) === null || _b === void 0 ? void 0 : _b.contentIdUpdated.subscribe(id => {
            this.contentId = id;
        });
        (_c = this._panel) === null || _c === void 0 ? void 0 : _c.contentTypeUpdated.subscribe(type => {
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
        var _a;
        const { keyCode } = event;
        if (keyCode === DOWN_ARROW) {
            if (this.isOpen()) {
                (_a = this._panel) === null || _a === void 0 ? void 0 : _a.focusContent();
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
        var _a;
        if (!this.isOpen() && !this.disabled) {
            this.opened.next();
            this._overlayRef = this._overlayRef || this._overlay.create(this._getOverlayConfig());
            this._overlayRef.attach(this._getPanelContent());
            if (!this._isTextTrigger()) {
                (_a = this._panel) === null || _a === void 0 ? void 0 : _a.focusContent();
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
        const valueChanged = (this.value !== value);
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
        var _a, _b;
        const hasPanelChanged = ((_a = this._panel) === null || _a === void 0 ? void 0 : _a._templateRef) !== ((_b = this._panelContent) === null || _b === void 0 ? void 0 : _b.templateRef);
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
CdkCombobox.decorators = [
    { type: Directive, args: [{
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
                    '[attr.tabindex]': '_getTabIndex()'
                }
            },] }
];
CdkCombobox.ctorParameters = () => [
    { type: ElementRef },
    { type: Overlay },
    { type: ViewContainerRef },
    { type: Directionality, decorators: [{ type: Optional }] }
];
CdkCombobox.propDecorators = {
    panel: [{ type: Input, args: ['cdkComboboxTriggerFor',] }],
    value: [{ type: Input }],
    disabled: [{ type: Input }],
    openActions: [{ type: Input }],
    autoSetText: [{ type: Input }],
    opened: [{ type: Output, args: ['comboboxPanelOpened',] }],
    closed: [{ type: Output, args: ['comboboxPanelClosed',] }],
    panelValueChanged: [{ type: Output, args: ['panelValueChanged',] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tYm9ib3guanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrLWV4cGVyaW1lbnRhbC9jb21ib2JveC9jb21ib2JveC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFNSCxPQUFPLEVBRUwsU0FBUyxFQUNULFVBQVUsRUFDVixZQUFZLEVBQ1osS0FBSyxFQUVMLFFBQVEsRUFDUixNQUFNLEVBQUUsZ0JBQWdCLEVBQ3pCLE1BQU0sZUFBZSxDQUFDO0FBRXZCLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUNuRCxPQUFPLEVBR0wsT0FBTyxFQUNQLGFBQWEsRUFFZCxNQUFNLHNCQUFzQixDQUFDO0FBQzlCLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUNqRCxPQUFPLEVBQWUscUJBQXFCLEVBQUUsV0FBVyxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDdkYsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQ3RELE9BQU8sRUFBQyxVQUFVLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUVyRSxNQUFNLGtCQUFrQixHQUFHLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFtQm5FLE1BQU0sT0FBTyxXQUFXO0lBdUN0QixZQUNtQixXQUFvQyxFQUNwQyxRQUFpQixFQUNmLGlCQUFtQyxFQUN6QixlQUFnQztRQUg1QyxnQkFBVyxHQUFYLFdBQVcsQ0FBeUI7UUFDcEMsYUFBUSxHQUFSLFFBQVEsQ0FBUztRQUNmLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBa0I7UUFDekIsb0JBQWUsR0FBZixlQUFlLENBQWlCO1FBL0J2RCxjQUFTLEdBQVksS0FBSyxDQUFDO1FBUzNCLGlCQUFZLEdBQWlCLENBQUMsT0FBTyxDQUFDLENB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QUFrQjtvQkFDL0Isa0JBQWtCLEVBQUUsdUJBQXVCO29CQUMzQyxzQkFBc0IsRUFBRSxVQUFVO29CQUNsQyxrQkFBa0IsRUFBRSxXQUFXO29CQUMvQixzQkFBc0IsRUFBRSxhQUFhO29CQUNyQyxzQkFBc0IsRUFBRSxVQUFVO29CQUNsQyxpQkFBaUIsRUFBRSxnQkFBZ0I7aUJBQ3BDO2FBQ0Y7OztZQXZDQyxVQUFVO1lBWVYsT0FBTztZQVBDLGdCQUFnQjtZQVdsQixjQUFjLHVCQW1FakIsUUFBUTs7O29CQTFDVixLQUFLLFNBQUMsdUJBQXVCO29CQUs3QixLQUFLO3VCQUdMLEtBQUs7MEJBS0wsS0FBSzswQkFVTCxLQUFLO3FCQUtMLE1BQU0sU0FBQyxxQkFBcUI7cUJBQzVCLE1BQU0sU0FBQyxxQkFBcUI7Z0NBQzVCLE1BQU0sU0FBQyxtQkFBbUIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuXG5leHBvcnQgdHlwZSBPcGVuQWN0aW9uID0gJ2ZvY3VzJyB8ICdjbGljaycgfCAnZG93bktleScgfCAndG9nZ2xlJztcbmV4cG9ydCB0eXBlIE9wZW5BY3Rpb25JbnB1dCA9IE9wZW5BY3Rpb24gfCBPcGVuQWN0aW9uW10gfCBzdHJpbmcgfCBudWxsIHwgdW5kZWZpbmVkO1xuXG5pbXBvcnQge1xuICBBZnRlckNvbnRlbnRJbml0LFxuICBEaXJlY3RpdmUsXG4gIEVsZW1lbnRSZWYsXG4gIEV2ZW50RW1pdHRlcixcbiAgSW5wdXQsXG4gIE9uRGVzdHJveSxcbiAgT3B0aW9uYWwsXG4gIE91dHB1dCwgVmlld0NvbnRhaW5lclJlZlxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7Q2RrQ29tYm9ib3hQYW5lbCwgQXJpYUhhc1BvcHVwVmFsdWV9IGZyb20gJy4vY29tYm9ib3gtcGFuZWwnO1xuaW1wb3J0IHtUZW1wbGF0ZVBvcnRhbH0gZnJvbSAnQGFuZ3VsYXIvY2RrL3BvcnRhbCc7XG5pbXBvcnQge1xuICBDb25uZWN0ZWRQb3NpdGlvbixcbiAgRmxleGlibGVDb25uZWN0ZWRQb3NpdGlvblN0cmF0ZWd5LFxuICBPdmVybGF5LFxuICBPdmVybGF5Q29uZmlnLFxuICBPdmVybGF5UmVmXG59IGZyb20gJ0Bhbmd1bGFyL2Nkay9vdmVybGF5JztcbmltcG9ydCB7RGlyZWN0aW9uYWxpdHl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9iaWRpJztcbmltcG9ydCB7Qm9vbGVhbklucHV0LCBjb2VyY2VCb29sZWFuUHJvcGVydHksIGNvZXJjZUFycmF5fSBmcm9tICdAYW5ndWxhci9jZGsvY29lcmNpb24nO1xuaW1wb3J0IHtfZ2V0RXZlbnRUYXJnZXR9IGZyb20gJ0Bhbmd1bGFyL2Nkay9wbGF0Zm9ybSc7XG5pbXBvcnQge0RPV05fQVJST1csIEVOVEVSLCBFU0NBUEUsIFRBQn0gZnJvbSAnQGFuZ3VsYXIvY2RrL2tleWNvZGVzJztcblxuY29uc3QgYWxsb3dlZE9wZW5BY3Rpb25zID0gWydmb2N1cycsICdjbGljaycsICdkb3duS2V5JywgJ3RvZ2dsZSddO1xuXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbY2RrQ29tYm9ib3hdJyxcbiAgZXhwb3J0QXM6ICdjZGtDb21ib2JveCcsXG4gIGhvc3Q6IHtcbiAgICAncm9sZSc6ICdjb21ib2JveCcsXG4gICAgJ2NsYXNzJzogJ2Nkay1jb21ib2JveCcsXG4gICAgJyhjbGljayknOiAnX2hhbmRsZUludGVyYWN0aW9ucyhcImNsaWNrXCIpJyxcbiAgICAnKGZvY3VzKSc6ICdfaGFuZGxlSW50ZXJhY3Rpb25zKFwiZm9jdXNcIiknLFxuICAgICcoa2V5ZG93biknOiAnX2tleWRvd24oJGV2ZW50KScsXG4gICAgJyhkb2N1bWVudDpjbGljayknOiAnX2F0dGVtcHRDbG9zZSgkZXZlbnQpJyxcbiAgICAnW2F0dHIuYXJpYS1kaXNhYmxlZF0nOiAnZGlzYWJsZWQnLFxuICAgICdbYXR0ci5hcmlhLW93bnNdJzogJ2NvbnRlbnRJZCcsXG4gICAgJ1thdHRyLmFyaWEtaGFzcG9wdXBdJzogJ2NvbnRlbnRUeXBlJyxcbiAgICAnW2F0dHIuYXJpYS1leHBhbmRlZF0nOiAnaXNPcGVuKCknLFxuICAgICdbYXR0ci50YWJpbmRleF0nOiAnX2dldFRhYkluZGV4KCknXG4gIH1cbn0pXG5leHBvcnQgY2xhc3MgQ2RrQ29tYm9ib3g8VCA9IHVua25vd24+IGltcGxlbWVudHMgT25EZXN0cm95LCBBZnRlckNvbnRlbnRJbml0IHtcbiAgQElucHV0KCdjZGtDb21ib2JveFRyaWdnZXJGb3InKVxuICBnZXQgcGFuZWwoKTogQ2RrQ29tYm9ib3hQYW5lbDxUPiB8IHVuZGVmaW5lZCB7IHJldHVybiB0aGlzLl9wYW5lbDsgfVxuICBzZXQgcGFuZWwocGFuZWw6IENka0NvbWJvYm94UGFuZWw8VD4gfCB1bmRlZmluZWQpIHsgdGhpcy5fcGFuZWwgPSBwYW5lbDsgfVxuICBwcml2YXRlIF9wYW5lbDogQ2RrQ29tYm9ib3hQYW5lbDxUPiB8IHVuZGVmaW5lZDtcblxuICBASW5wdXQoKVxuICB2YWx1ZTogVCB8IFRbXTtcblxuICBASW5wdXQoKVxuICBnZXQgZGlzYWJsZWQoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLl9kaXNhYmxlZDsgfVxuICBzZXQgZGlzYWJsZWQodmFsdWU6IGJvb2xlYW4pIHsgdGhpcy5fZGlzYWJsZWQgPSBjb2VyY2VCb29sZWFuUHJvcGVydHkodmFsdWUpOyB9XG4gIHByaXZhdGUgX2Rpc2FibGVkOiBib29sZWFuID0gZmFsc2U7XG5cbiAgQElucHV0KClcbiAgZ2V0IG9wZW5BY3Rpb25zKCk6IE9wZW5BY3Rpb25bXSB7XG4gICAgcmV0dXJuIHRoaXMuX29wZW5BY3Rpb25zO1xuICB9XG4gIHNldCBvcGVuQWN0aW9ucyhhY3Rpb246IE9wZW5BY3Rpb25bXSkge1xuICAgIHRoaXMuX29wZW5BY3Rpb25zID0gdGhpcy5fY29lcmNlT3BlbkFjdGlvblByb3BlcnR5KGFjdGlvbik7XG4gIH1cbiAgcHJpdmF0ZSBfb3BlbkFjdGlvbnM6IE9wZW5BY3Rpb25bXSA9IFsnY2xpY2snXTtcblxuICAvKiogV2hldGhlciB0aGUgdGV4dENvbnRlbnQgaXMgYXV0b21hdGljYWxseSB1cGRhdGVkIHVwb24gY2hhbmdlIG9mIHRoZSBjb21ib2JveCB2YWx1ZS4gKi9cbiAgQElucHV0KClcbiAgZ2V0IGF1dG9TZXRUZXh0KCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5fYXV0b1NldFRleHQ7IH1cbiAgc2V0IGF1dG9TZXRUZXh0KHZhbHVlOiBib29sZWFuKSB7IHRoaXMuX2F1dG9TZXRUZXh0ID0gY29lcmNlQm9vbGVhblByb3BlcnR5KHZhbHVlKTsgfVxuICBwcml2YXRlIF9hdXRvU2V0VGV4dDogYm9vbGVhbiA9IHRydWU7XG5cbiAgQE91dHB1dCgnY29tYm9ib3hQYW5lbE9wZW5lZCcpIHJlYWRvbmx5IG9wZW5lZDogRXZlbnRFbWl0dGVyPHZvaWQ+ID0gbmV3IEV2ZW50RW1pdHRlcjx2b2lkPigpO1xuICBAT3V0cHV0KCdjb21ib2JveFBhbmVsQ2xvc2VkJykgcmVhZG9ubHkgY2xvc2VkOiBFdmVudEVtaXR0ZXI8dm9pZD4gPSBuZXcgRXZlbnRFbWl0dGVyPHZvaWQ+KCk7XG4gIEBPdXRwdXQoJ3BhbmVsVmFsdWVDaGFuZ2VkJykgcmVhZG9ubHkgcGFuZWxWYWx1ZUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxUW10+XG4gICAgICA9IG5ldyBFdmVudEVtaXR0ZXI8VFtdPigpO1xuXG4gIHByaXZhdGUgX292ZXJsYXlSZWY6IE92ZXJsYXlSZWY7XG4gIHByaXZhdGUgX3BhbmVsQ29udGVudDogVGVtcGxhdGVQb3J0YWw7XG4gIGNvbnRlbnRJZDogc3RyaW5nID0gJyc7XG4gIGNvbnRlbnRUeXBlOiBBcmlhSGFzUG9wdXBWYWx1ZTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIHJlYWRvbmx5IF9lbGVtZW50UmVmOiBFbGVtZW50UmVmPEhUTUxFbGVtZW50PixcbiAgICBwcml2YXRlIHJlYWRvbmx5IF9vdmVybGF5OiBPdmVybGF5LFxuICAgIHByb3RlY3RlZCByZWFkb25seSBfdmlld0NvbnRhaW5lclJlZjogVmlld0NvbnRhaW5lclJlZixcbiAgICBAT3B0aW9uYWwoKSBwcml2YXRlIHJlYWRvbmx5IF9kaXJlY3Rpb25hbGl0eT86IERpcmVjdGlvbmFsaXR5XG4gICkge31cblxuICBuZ0FmdGVyQ29udGVudEluaXQoKSB7XG4gICAgdGhpcy5fcGFuZWw/LnZhbHVlVXBkYXRlZC5zdWJzY3JpYmUoZGF0YSA9PiB7XG4gICAgICB0aGlzLl9zZXRDb21ib2JveFZhbHVlKGRhdGEpO1xuICAgICAgdGhpcy5jbG9zZSgpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5fcGFuZWw/LmNvbnRlbnRJZFVwZGF0ZWQuc3Vic2NyaWJlKGlkID0+IHtcbiAgICAgIHRoaXMuY29udGVudElkID0gaWQ7XG4gICAgfSk7XG5cbiAgICB0aGlzLl9wYW5lbD8uY29udGVudFR5cGVVcGRhdGVkLnN1YnNjcmliZSh0eXBlID0+IHtcbiAgICAgIHRoaXMuY29udGVudFR5cGUgPSB0eXBlO1xuICAgIH0pO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgaWYgKHRoaXMuX292ZXJsYXlSZWYpIHtcbiAgICAgIHRoaXMuX292ZXJsYXlSZWYuZGlzcG9zZSgpO1xuICAgIH1cblxuICAgIHRoaXMub3BlbmVkLmNvbXBsZXRlKCk7XG4gICAgdGhpcy5jbG9zZWQuY29tcGxldGUoKTtcbiAgICB0aGlzLnBhbmVsVmFsdWVDaGFuZ2VkLmNvbXBsZXRlKCk7XG4gIH1cblxuICBfa2V5ZG93bihldmVudDogS2V5Ym9hcmRFdmVudCkge1xuICAgIGNvbnN0IHtrZXlDb2RlfSA9IGV2ZW50O1xuXG4gICAgaWYgKGtleUNvZGUgPT09IERPV05fQVJST1cpIHtcbiAgICAgIGlmICh0aGlzLmlzT3BlbigpKSB7XG4gICAgICAgIHRoaXMuX3BhbmVsPy5mb2N1c0NvbnRlbnQoKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5fb3BlbkFjdGlvbnMuaW5kZXhPZignZG93bktleScpICE9PSAtMSkge1xuICAgICAgICB0aGlzLm9wZW4oKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGtleUNvZGUgPT09IEVOVEVSKSB7XG4gICAgICBpZiAodGhpcy5fb3BlbkFjdGlvbnMuaW5kZXhPZigndG9nZ2xlJykgIT09IC0xKSB7XG4gICAgICAgIHRoaXMudG9nZ2xlKCk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuX29wZW5BY3Rpb25zLmluZGV4T2YoJ2NsaWNrJykgIT09IC0xKSB7XG4gICAgICAgIHRoaXMub3BlbigpO1xuICAgICAgfVxuXG4gICAgfSBlbHNlIGlmIChrZXlDb2RlID09PSBFU0NBUEUpIHtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB0aGlzLmNsb3NlKCk7XG4gICAgfSBlbHNlIGlmIChrZXlDb2RlID09PSBUQUIpIHtcbiAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICB9XG4gIH1cblxuICAvKiogSGFuZGxlcyBjbGljayBvciBmb2N1cyBpbnRlcmFjdGlvbnMuICovXG4gIF9oYW5kbGVJbnRlcmFjdGlvbnMoaW50ZXJhY3Rpb246IE9wZW5BY3Rpb24pIHtcbiAgICBpZiAoaW50ZXJhY3Rpb24gPT09ICdjbGljaycpIHtcbiAgICAgIGlmICh0aGlzLl9vcGVuQWN0aW9ucy5pbmRleE9mKCd0b2dnbGUnKSAhPT0gLTEpIHtcbiAgICAgICAgdGhpcy50b2dnbGUoKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5fb3BlbkFjdGlvbnMuaW5kZXhPZignY2xpY2snKSAhPT0gLTEpIHtcbiAgICAgICAgdGhpcy5vcGVuKCk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChpbnRlcmFjdGlvbiA9PT0gJ2ZvY3VzJykge1xuICAgICAgaWYgKHRoaXMuX29wZW5BY3Rpb25zLmluZGV4T2YoJ2ZvY3VzJykgIT09IC0xKSB7XG4gICAgICAgIHRoaXMub3BlbigpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKiBHaXZlbiBhIGNsaWNrIGluIHRoZSBkb2N1bWVudCwgZGV0ZXJtaW5lcyBpZiB0aGUgY2xpY2sgd2FzIGluc2lkZSBhIGNvbWJvYm94LiAqL1xuICBfYXR0ZW1wdENsb3NlKGV2ZW50OiBNb3VzZUV2ZW50KSB7XG4gICAgaWYgKHRoaXMuaXNPcGVuKCkpIHtcbiAgICAgIGxldCB0YXJnZXQgPSBfZ2V0RXZlbnRUYXJnZXQoZXZlbnQpO1xuICAgICAgd2hpbGUgKHRhcmdldCBpbnN0YW5jZW9mIEVsZW1lbnQpIHtcbiAgICAgICAgaWYgKHRhcmdldC5jbGFzc05hbWUuaW5kZXhPZignY2RrLWNvbWJvYm94JykgIT09IC0xKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRhcmdldCA9IHRhcmdldC5wYXJlbnRFbGVtZW50O1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuY2xvc2UoKTtcbiAgfVxuXG4gIC8qKiBUb2dnbGVzIHRoZSBvcGVuIHN0YXRlIG9mIHRoZSBwYW5lbC4gKi9cbiAgdG9nZ2xlKCkge1xuICAgIGlmICh0aGlzLmhhc1BhbmVsKCkpIHtcbiAgICAgIHRoaXMuaXNPcGVuKCkgPyB0aGlzLmNsb3NlKCkgOiB0aGlzLm9wZW4oKTtcbiAgICB9XG4gIH1cblxuICAvKiogSWYgdGhlIGNvbWJvYm94IGlzIGNsb3NlZCBhbmQgbm90IGRpc2FibGVkLCBvcGVucyB0aGUgcGFuZWwuICovXG4gIG9wZW4oKSB7XG4gICAgaWYgKCF0aGlzLmlzT3BlbigpICYmICF0aGlzLmRpc2FibGVkKSB7XG4gICAgICB0aGlzLm9wZW5lZC5uZXh0KCk7XG4gICAgICB0aGlzLl9vdmVybGF5UmVmID0gdGhpcy5fb3ZlcmxheVJlZiB8fCB0aGlzLl9vdmVybGF5LmNyZWF0ZSh0aGlzLl9nZXRPdmVybGF5Q29uZmlnKCkpO1xuICAgICAgdGhpcy5fb3ZlcmxheVJlZi5hdHRhY2godGhpcy5fZ2V0UGFuZWxDb250ZW50KCkpO1xuICAgICAgaWYgKCF0aGlzLl9pc1RleHRUcmlnZ2VyKCkpIHtcbiAgICAgICAgdGhpcy5fcGFuZWw/LmZvY3VzQ29udGVudCgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKiBJZiB0aGUgY29tYm9ib3ggaXMgb3BlbiBhbmQgbm90IGRpc2FibGVkLCBjbG9zZXMgdGhlIHBhbmVsLiAqL1xuICBjbG9zZSgpIHtcbiAgICBpZiAodGhpcy5pc09wZW4oKSAmJiAhdGhpcy5kaXNhYmxlZCkge1xuICAgICAgdGhpcy5jbG9zZWQubmV4dCgpO1xuICAgICAgdGhpcy5fb3ZlcmxheVJlZi5kZXRhY2goKTtcbiAgICB9XG4gIH1cblxuICAvKiogUmV0dXJucyB0cnVlIGlmIHBhbmVsIGlzIGN1cnJlbnRseSBvcGVuZWQuICovXG4gIGlzT3BlbigpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fb3ZlcmxheVJlZiA/IHRoaXMuX292ZXJsYXlSZWYuaGFzQXR0YWNoZWQoKSA6IGZhbHNlO1xuICB9XG5cbiAgLyoqIFJldHVybnMgdHJ1ZSBpZiBjb21ib2JveCBoYXMgYSBjaGlsZCBwYW5lbC4gKi9cbiAgaGFzUGFuZWwoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuICEhdGhpcy5wYW5lbDtcbiAgfVxuXG4gIF9nZXRUYWJJbmRleCgpOiBzdHJpbmcgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5kaXNhYmxlZCA/IG51bGwgOiAnMCc7XG4gIH1cblxuICBwcml2YXRlIF9zZXRDb21ib2JveFZhbHVlKHZhbHVlOiBUIHwgVFtdKSB7XG5cbiAgICBjb25zdCB2YWx1ZUNoYW5nZWQgPSAodGhpcy52YWx1ZSAhPT0gdmFsdWUpO1xuICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcblxuICAgIGlmICh2YWx1ZUNoYW5nZWQpIHtcbiAgICAgIHRoaXMucGFuZWxWYWx1ZUNoYW5nZWQuZW1pdChjb2VyY2VBcnJheSh2YWx1ZSkpO1xuICAgICAgaWYgKHRoaXMuX2F1dG9TZXRUZXh0KSB7XG4gICAgICAgIHRoaXMuX3NldFRleHRDb250ZW50KHZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9zZXRUZXh0Q29udGVudChjb250ZW50OiBUIHwgVFtdKSB7XG4gICAgY29uc3QgY29udGVudEFycmF5ID0gY29lcmNlQXJyYXkoY29udGVudCk7XG4gICAgdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LnRleHRDb250ZW50ID0gY29udGVudEFycmF5LmpvaW4oJyAnKTtcbiAgfVxuXG4gIHByaXZhdGUgX2lzVGV4dFRyaWdnZXIoKSB7XG4gICAgLy8gVE9ETzogU2hvdWxkIGNoZWNrIGlmIHRoZSB0cmlnZ2VyIGlzIGNvbnRlbnRlZGl0YWJsZS5cbiAgICBjb25zdCB0YWdOYW1lID0gdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LnRhZ05hbWUudG9Mb3dlckNhc2UoKTtcbiAgICByZXR1cm4gdGFnTmFtZSA9PT0gJ2lucHV0JyB8fCB0YWdOYW1lID09PSAndGV4dGFyZWEnID8gdHJ1ZSA6IGZhbHNlO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0T3ZlcmxheUNvbmZpZygpIHtcbiAgICByZXR1cm4gbmV3IE92ZXJsYXlDb25maWcoe1xuICAgICAgcG9zaXRpb25TdHJhdGVneTogdGhpcy5fZ2V0T3ZlcmxheVBvc2l0aW9uU3RyYXRlZ3koKSxcbiAgICAgIHNjcm9sbFN0cmF0ZWd5OiB0aGlzLl9vdmVybGF5LnNjcm9sbFN0cmF0ZWdpZXMuYmxvY2soKSxcbiAgICAgIGRpcmVjdGlvbjogdGhpcy5fZGlyZWN0aW9uYWxpdHksXG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIF9nZXRPdmVybGF5UG9zaXRpb25TdHJhdGVneSgpOiBGbGV4aWJsZUNvbm5lY3RlZFBvc2l0aW9uU3RyYXRlZ3kge1xuICAgIHJldHVybiB0aGlzLl9vdmVybGF5XG4gICAgICAgIC5wb3NpdGlvbigpXG4gICAgICAgIC5mbGV4aWJsZUNvbm5lY3RlZFRvKHRoaXMuX2VsZW1lbnRSZWYpXG4gICAgICAgIC53aXRoUG9zaXRpb25zKHRoaXMuX2dldE92ZXJsYXlQb3NpdGlvbnMoKSk7XG4gIH1cblxuICBwcml2YXRlIF9nZXRPdmVybGF5UG9zaXRpb25zKCk6IENvbm5lY3RlZFBvc2l0aW9uW10ge1xuICAgIHJldHVybiBbXG4gICAgICB7b3JpZ2luWDogJ3N0YXJ0Jywgb3JpZ2luWTogJ2JvdHRvbScsIG92ZXJsYXlYOiAnc3RhcnQnLCBvdmVybGF5WTogJ3RvcCd9LFxuICAgICAge29yaWdpblg6ICdzdGFydCcsIG9yaWdpblk6ICd0b3AnLCBvdmVybGF5WDogJ3N0YXJ0Jywgb3ZlcmxheVk6ICdib3R0b20nfSxcbiAgICAgIHtvcmlnaW5YOiAnZW5kJywgb3JpZ2luWTogJ2JvdHRvbScsIG92ZXJsYXlYOiAnZW5kJywgb3ZlcmxheVk6ICd0b3AnfSxcbiAgICAgIHtvcmlnaW5YOiAnZW5kJywgb3JpZ2luWTogJ3RvcCcsIG92ZXJsYXlYOiAnZW5kJywgb3ZlcmxheVk6ICdib3R0b20nfSxcbiAgICBdO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0UGFuZWxDb250ZW50KCkge1xuICAgIGNvbnN0IGhhc1BhbmVsQ2hhbmdlZCA9IHRoaXMuX3BhbmVsPy5fdGVtcGxhdGVSZWYgIT09IHRoaXMuX3BhbmVsQ29udGVudD8udGVtcGxhdGVSZWY7XG4gICAgaWYgKHRoaXMuX3BhbmVsICYmICghdGhpcy5fcGFuZWwgfHwgaGFzUGFuZWxDaGFuZ2VkKSkge1xuICAgICAgdGhpcy5fcGFuZWxDb250ZW50ID0gbmV3IFRlbXBsYXRlUG9ydGFsKHRoaXMuX3BhbmVsLl90ZW1wbGF0ZVJlZiwgdGhpcy5fdmlld0NvbnRhaW5lclJlZik7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX3BhbmVsQ29udGVudDtcbiAgfVxuXG4gIHByaXZhdGUgX2NvZXJjZU9wZW5BY3Rpb25Qcm9wZXJ0eShpbnB1dDogc3RyaW5nIHwgT3BlbkFjdGlvbltdKTogT3BlbkFjdGlvbltdIHtcbiAgICBsZXQgYWN0aW9ucyA9IHR5cGVvZiBpbnB1dCA9PT0gJ3N0cmluZycgPyBpbnB1dC50cmltKCkuc3BsaXQoL1sgLF0rLykgOiBpbnB1dDtcbiAgICBpZiAoKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkgJiZcbiAgICAgIGFjdGlvbnMuc29tZShhID0+IGFsbG93ZWRPcGVuQWN0aW9ucy5pbmRleE9mKGEpID09PSAtMSkpIHtcbiAgICAgIHRocm93IEVycm9yKGAke2lucHV0fSBpcyBub3QgYSBzdXBwb3J0IG9wZW4gYWN0aW9uIGZvciBDZGtDb21ib2JveGApO1xuICAgIH1cbiAgICByZXR1cm4gYWN0aW9ucyBhcyBPcGVuQWN0aW9uW107XG4gIH1cblxuICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfb3BlbkFjdGlvbnM6IE9wZW5BY3Rpb25JbnB1dDtcbiAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2F1dG9TZXRUZXh0OiBPcGVuQWN0aW9uSW5wdXQ7XG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9kaXNhYmxlZDogQm9vbGVhbklucHV0O1xufVxuIl19