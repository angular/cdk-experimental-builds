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
            let target = event.composedPath ? event.composedPath()[0] : event.target;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tYm9ib3guanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrLWV4cGVyaW1lbnRhbC9jb21ib2JveC9jb21ib2JveC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFNSCxPQUFPLEVBRUwsU0FBUyxFQUNULFVBQVUsRUFDVixZQUFZLEVBQ1osS0FBSyxFQUVMLFFBQVEsRUFDUixNQUFNLEVBQUUsZ0JBQWdCLEVBQ3pCLE1BQU0sZUFBZSxDQUFDO0FBRXZCLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUNuRCxPQUFPLEVBR0wsT0FBTyxFQUNQLGFBQWEsRUFFZCxNQUFNLHNCQUFzQixDQUFDO0FBQzlCLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUNqRCxPQUFPLEVBQWUscUJBQXFCLEVBQUUsV0FBVyxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDdkYsT0FBTyxFQUFDLFVBQVUsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBRXJFLE1BQU0sa0JBQWtCLEdBQUcsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQztBQW1CbkUsTUFBTSxPQUFPLFdBQVc7SUF1Q3RCLFlBQ21CLFdBQW9DLEVBQ3BDLFFBQWlCLEVBQ2YsaUJBQW1DLEVBQ3pCLGVBQWdDO1FBSDVDLGdCQUFXLEdBQVgsV0FBVyxDQUF5QjtRQUNwQyxhQUFRLEdBQVIsUUFBUSxDQUFTO1FBQ2Ysc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFrQjtRQUN6QixvQkFBZSxHQUFmLGVBQWUsQ0FBaUI7UUEvQnZELGNBQVMsR0FBWSxLQUFLLENBQUM7UUFTM0IsaUJBQVksR0FBaUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQU12QyxpQkFBWSxHQUFZLElBQUksQ0FBQztRQUVHLFdBQU0sR0FB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QkFDL0Isc0JBQXNCLEVBQUUsYUFBYTtvQkFDckMsc0JBQXNCLEVBQUUsVUFBVTtvQkFDbEMsaUJBQWlCLEVBQUUsZ0JBQWdCO2lCQUNwQzthQUNGOzs7WUF0Q0MsVUFBVTtZQVlWLE9BQU87WUFQQyxnQkFBZ0I7WUFXbEIsY0FBYyx1QkFrRWpCLFFBQVE7OztvQkExQ1YsS0FBSyxTQUFDLHVCQUF1QjtvQkFLN0IsS0FBSzt1QkFHTCxLQUFLOzBCQUtMLEtBQUs7MEJBVUwsS0FBSztxQkFLTCxNQUFNLFNBQUMscUJBQXFCO3FCQUM1QixNQUFNLFNBQUMscUJBQXFCO2dDQUM1QixNQUFNLFNBQUMsbUJBQW1CIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cblxuZXhwb3J0IHR5cGUgT3BlbkFjdGlvbiA9ICdmb2N1cycgfCAnY2xpY2snIHwgJ2Rvd25LZXknIHwgJ3RvZ2dsZSc7XG5leHBvcnQgdHlwZSBPcGVuQWN0aW9uSW5wdXQgPSBPcGVuQWN0aW9uIHwgT3BlbkFjdGlvbltdIHwgc3RyaW5nIHwgbnVsbCB8IHVuZGVmaW5lZDtcblxuaW1wb3J0IHtcbiAgQWZ0ZXJDb250ZW50SW5pdCxcbiAgRGlyZWN0aXZlLFxuICBFbGVtZW50UmVmLFxuICBFdmVudEVtaXR0ZXIsXG4gIElucHV0LFxuICBPbkRlc3Ryb3ksXG4gIE9wdGlvbmFsLFxuICBPdXRwdXQsIFZpZXdDb250YWluZXJSZWZcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0Nka0NvbWJvYm94UGFuZWwsIEFyaWFIYXNQb3B1cFZhbHVlfSBmcm9tICcuL2NvbWJvYm94LXBhbmVsJztcbmltcG9ydCB7VGVtcGxhdGVQb3J0YWx9IGZyb20gJ0Bhbmd1bGFyL2Nkay9wb3J0YWwnO1xuaW1wb3J0IHtcbiAgQ29ubmVjdGVkUG9zaXRpb24sXG4gIEZsZXhpYmxlQ29ubmVjdGVkUG9zaXRpb25TdHJhdGVneSxcbiAgT3ZlcmxheSxcbiAgT3ZlcmxheUNvbmZpZyxcbiAgT3ZlcmxheVJlZlxufSBmcm9tICdAYW5ndWxhci9jZGsvb3ZlcmxheSc7XG5pbXBvcnQge0RpcmVjdGlvbmFsaXR5fSBmcm9tICdAYW5ndWxhci9jZGsvYmlkaSc7XG5pbXBvcnQge0Jvb2xlYW5JbnB1dCwgY29lcmNlQm9vbGVhblByb3BlcnR5LCBjb2VyY2VBcnJheX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvZXJjaW9uJztcbmltcG9ydCB7RE9XTl9BUlJPVywgRU5URVIsIEVTQ0FQRSwgVEFCfSBmcm9tICdAYW5ndWxhci9jZGsva2V5Y29kZXMnO1xuXG5jb25zdCBhbGxvd2VkT3BlbkFjdGlvbnMgPSBbJ2ZvY3VzJywgJ2NsaWNrJywgJ2Rvd25LZXknLCAndG9nZ2xlJ107XG5cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tjZGtDb21ib2JveF0nLFxuICBleHBvcnRBczogJ2Nka0NvbWJvYm94JyxcbiAgaG9zdDoge1xuICAgICdyb2xlJzogJ2NvbWJvYm94JyxcbiAgICAnY2xhc3MnOiAnY2RrLWNvbWJvYm94JyxcbiAgICAnKGNsaWNrKSc6ICdfaGFuZGxlSW50ZXJhY3Rpb25zKFwiY2xpY2tcIiknLFxuICAgICcoZm9jdXMpJzogJ19oYW5kbGVJbnRlcmFjdGlvbnMoXCJmb2N1c1wiKScsXG4gICAgJyhrZXlkb3duKSc6ICdfa2V5ZG93bigkZXZlbnQpJyxcbiAgICAnKGRvY3VtZW50OmNsaWNrKSc6ICdfYXR0ZW1wdENsb3NlKCRldmVudCknLFxuICAgICdbYXR0ci5hcmlhLWRpc2FibGVkXSc6ICdkaXNhYmxlZCcsXG4gICAgJ1thdHRyLmFyaWEtb3duc10nOiAnY29udGVudElkJyxcbiAgICAnW2F0dHIuYXJpYS1oYXNwb3B1cF0nOiAnY29udGVudFR5cGUnLFxuICAgICdbYXR0ci5hcmlhLWV4cGFuZGVkXSc6ICdpc09wZW4oKScsXG4gICAgJ1thdHRyLnRhYmluZGV4XSc6ICdfZ2V0VGFiSW5kZXgoKSdcbiAgfVxufSlcbmV4cG9ydCBjbGFzcyBDZGtDb21ib2JveDxUID0gdW5rbm93bj4gaW1wbGVtZW50cyBPbkRlc3Ryb3ksIEFmdGVyQ29udGVudEluaXQge1xuICBASW5wdXQoJ2Nka0NvbWJvYm94VHJpZ2dlckZvcicpXG4gIGdldCBwYW5lbCgpOiBDZGtDb21ib2JveFBhbmVsPFQ+IHwgdW5kZWZpbmVkIHsgcmV0dXJuIHRoaXMuX3BhbmVsOyB9XG4gIHNldCBwYW5lbChwYW5lbDogQ2RrQ29tYm9ib3hQYW5lbDxUPiB8IHVuZGVmaW5lZCkgeyB0aGlzLl9wYW5lbCA9IHBhbmVsOyB9XG4gIHByaXZhdGUgX3BhbmVsOiBDZGtDb21ib2JveFBhbmVsPFQ+IHwgdW5kZWZpbmVkO1xuXG4gIEBJbnB1dCgpXG4gIHZhbHVlOiBUIHwgVFtdO1xuXG4gIEBJbnB1dCgpXG4gIGdldCBkaXNhYmxlZCgpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuX2Rpc2FibGVkOyB9XG4gIHNldCBkaXNhYmxlZCh2YWx1ZTogYm9vbGVhbikgeyB0aGlzLl9kaXNhYmxlZCA9IGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eSh2YWx1ZSk7IH1cbiAgcHJpdmF0ZSBfZGlzYWJsZWQ6IGJvb2xlYW4gPSBmYWxzZTtcblxuICBASW5wdXQoKVxuICBnZXQgb3BlbkFjdGlvbnMoKTogT3BlbkFjdGlvbltdIHtcbiAgICByZXR1cm4gdGhpcy5fb3BlbkFjdGlvbnM7XG4gIH1cbiAgc2V0IG9wZW5BY3Rpb25zKGFjdGlvbjogT3BlbkFjdGlvbltdKSB7XG4gICAgdGhpcy5fb3BlbkFjdGlvbnMgPSB0aGlzLl9jb2VyY2VPcGVuQWN0aW9uUHJvcGVydHkoYWN0aW9uKTtcbiAgfVxuICBwcml2YXRlIF9vcGVuQWN0aW9uczogT3BlbkFjdGlvbltdID0gWydjbGljayddO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSB0ZXh0Q29udGVudCBpcyBhdXRvbWF0aWNhbGx5IHVwZGF0ZWQgdXBvbiBjaGFuZ2Ugb2YgdGhlIGNvbWJvYm94IHZhbHVlLiAqL1xuICBASW5wdXQoKVxuICBnZXQgYXV0b1NldFRleHQoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLl9hdXRvU2V0VGV4dDsgfVxuICBzZXQgYXV0b1NldFRleHQodmFsdWU6IGJvb2xlYW4pIHsgdGhpcy5fYXV0b1NldFRleHQgPSBjb2VyY2VCb29sZWFuUHJvcGVydHkodmFsdWUpOyB9XG4gIHByaXZhdGUgX2F1dG9TZXRUZXh0OiBib29sZWFuID0gdHJ1ZTtcblxuICBAT3V0cHV0KCdjb21ib2JveFBhbmVsT3BlbmVkJykgcmVhZG9ubHkgb3BlbmVkOiBFdmVudEVtaXR0ZXI8dm9pZD4gPSBuZXcgRXZlbnRFbWl0dGVyPHZvaWQ+KCk7XG4gIEBPdXRwdXQoJ2NvbWJvYm94UGFuZWxDbG9zZWQnKSByZWFkb25seSBjbG9zZWQ6IEV2ZW50RW1pdHRlcjx2b2lkPiA9IG5ldyBFdmVudEVtaXR0ZXI8dm9pZD4oKTtcbiAgQE91dHB1dCgncGFuZWxWYWx1ZUNoYW5nZWQnKSByZWFkb25seSBwYW5lbFZhbHVlQ2hhbmdlZDogRXZlbnRFbWl0dGVyPFRbXT5cbiAgICAgID0gbmV3IEV2ZW50RW1pdHRlcjxUW10+KCk7XG5cbiAgcHJpdmF0ZSBfb3ZlcmxheVJlZjogT3ZlcmxheVJlZjtcbiAgcHJpdmF0ZSBfcGFuZWxDb250ZW50OiBUZW1wbGF0ZVBvcnRhbDtcbiAgY29udGVudElkOiBzdHJpbmcgPSAnJztcbiAgY29udGVudFR5cGU6IEFyaWFIYXNQb3B1cFZhbHVlO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgcmVhZG9ubHkgX2VsZW1lbnRSZWY6IEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+LFxuICAgIHByaXZhdGUgcmVhZG9ubHkgX292ZXJsYXk6IE92ZXJsYXksXG4gICAgcHJvdGVjdGVkIHJlYWRvbmx5IF92aWV3Q29udGFpbmVyUmVmOiBWaWV3Q29udGFpbmVyUmVmLFxuICAgIEBPcHRpb25hbCgpIHByaXZhdGUgcmVhZG9ubHkgX2RpcmVjdGlvbmFsaXR5PzogRGlyZWN0aW9uYWxpdHlcbiAgKSB7fVxuXG4gIG5nQWZ0ZXJDb250ZW50SW5pdCgpIHtcbiAgICB0aGlzLl9wYW5lbD8udmFsdWVVcGRhdGVkLnN1YnNjcmliZShkYXRhID0+IHtcbiAgICAgIHRoaXMuX3NldENvbWJvYm94VmFsdWUoZGF0YSk7XG4gICAgICB0aGlzLmNsb3NlKCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLl9wYW5lbD8uY29udGVudElkVXBkYXRlZC5zdWJzY3JpYmUoaWQgPT4ge1xuICAgICAgdGhpcy5jb250ZW50SWQgPSBpZDtcbiAgICB9KTtcblxuICAgIHRoaXMuX3BhbmVsPy5jb250ZW50VHlwZVVwZGF0ZWQuc3Vic2NyaWJlKHR5cGUgPT4ge1xuICAgICAgdGhpcy5jb250ZW50VHlwZSA9IHR5cGU7XG4gICAgfSk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICB0aGlzLm9wZW5lZC5jb21wbGV0ZSgpO1xuICAgIHRoaXMuY2xvc2VkLmNvbXBsZXRlKCk7XG4gICAgdGhpcy5wYW5lbFZhbHVlQ2hhbmdlZC5jb21wbGV0ZSgpO1xuICB9XG5cbiAgX2tleWRvd24oZXZlbnQ6IEtleWJvYXJkRXZlbnQpIHtcbiAgICBjb25zdCB7a2V5Q29kZX0gPSBldmVudDtcblxuICAgIGlmIChrZXlDb2RlID09PSBET1dOX0FSUk9XKSB7XG4gICAgICBpZiAodGhpcy5pc09wZW4oKSkge1xuICAgICAgICB0aGlzLl9wYW5lbD8uZm9jdXNDb250ZW50KCk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuX29wZW5BY3Rpb25zLmluZGV4T2YoJ2Rvd25LZXknKSAhPT0gLTEpIHtcbiAgICAgICAgdGhpcy5vcGVuKCk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChrZXlDb2RlID09PSBFTlRFUikge1xuICAgICAgaWYgKHRoaXMuX29wZW5BY3Rpb25zLmluZGV4T2YoJ3RvZ2dsZScpICE9PSAtMSkge1xuICAgICAgICB0aGlzLnRvZ2dsZSgpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLl9vcGVuQWN0aW9ucy5pbmRleE9mKCdjbGljaycpICE9PSAtMSkge1xuICAgICAgICB0aGlzLm9wZW4oKTtcbiAgICAgIH1cblxuICAgIH0gZWxzZSBpZiAoa2V5Q29kZSA9PT0gRVNDQVBFKSB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgdGhpcy5jbG9zZSgpO1xuICAgIH0gZWxzZSBpZiAoa2V5Q29kZSA9PT0gVEFCKSB7XG4gICAgICB0aGlzLmNsb3NlKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEhhbmRsZXMgY2xpY2sgb3IgZm9jdXMgaW50ZXJhY3Rpb25zLiAqL1xuICBfaGFuZGxlSW50ZXJhY3Rpb25zKGludGVyYWN0aW9uOiBPcGVuQWN0aW9uKSB7XG4gICAgaWYgKGludGVyYWN0aW9uID09PSAnY2xpY2snKSB7XG4gICAgICBpZiAodGhpcy5fb3BlbkFjdGlvbnMuaW5kZXhPZigndG9nZ2xlJykgIT09IC0xKSB7XG4gICAgICAgIHRoaXMudG9nZ2xlKCk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuX29wZW5BY3Rpb25zLmluZGV4T2YoJ2NsaWNrJykgIT09IC0xKSB7XG4gICAgICAgIHRoaXMub3BlbigpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoaW50ZXJhY3Rpb24gPT09ICdmb2N1cycpIHtcbiAgICAgIGlmICh0aGlzLl9vcGVuQWN0aW9ucy5pbmRleE9mKCdmb2N1cycpICE9PSAtMSkge1xuICAgICAgICB0aGlzLm9wZW4oKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKiogR2l2ZW4gYSBjbGljayBpbiB0aGUgZG9jdW1lbnQsIGRldGVybWluZXMgaWYgdGhlIGNsaWNrIHdhcyBpbnNpZGUgYSBjb21ib2JveC4gKi9cbiAgX2F0dGVtcHRDbG9zZShldmVudDogTW91c2VFdmVudCkge1xuICAgIGlmICh0aGlzLmlzT3BlbigpKSB7XG4gICAgICBsZXQgdGFyZ2V0ID0gZXZlbnQuY29tcG9zZWRQYXRoID8gZXZlbnQuY29tcG9zZWRQYXRoKClbMF0gOiBldmVudC50YXJnZXQ7XG4gICAgICB3aGlsZSAodGFyZ2V0IGluc3RhbmNlb2YgRWxlbWVudCkge1xuICAgICAgICBpZiAodGFyZ2V0LmNsYXNzTmFtZS5pbmRleE9mKCdjZGstY29tYm9ib3gnKSAhPT0gLTEpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGFyZ2V0ID0gdGFyZ2V0LnBhcmVudEVsZW1lbnQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5jbG9zZSgpO1xuICB9XG5cbiAgLyoqIFRvZ2dsZXMgdGhlIG9wZW4gc3RhdGUgb2YgdGhlIHBhbmVsLiAqL1xuICB0b2dnbGUoKSB7XG4gICAgaWYgKHRoaXMuaGFzUGFuZWwoKSkge1xuICAgICAgdGhpcy5pc09wZW4oKSA/IHRoaXMuY2xvc2UoKSA6IHRoaXMub3BlbigpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBJZiB0aGUgY29tYm9ib3ggaXMgY2xvc2VkIGFuZCBub3QgZGlzYWJsZWQsIG9wZW5zIHRoZSBwYW5lbC4gKi9cbiAgb3BlbigpIHtcbiAgICBpZiAoIXRoaXMuaXNPcGVuKCkgJiYgIXRoaXMuZGlzYWJsZWQpIHtcbiAgICAgIHRoaXMub3BlbmVkLm5leHQoKTtcbiAgICAgIHRoaXMuX292ZXJsYXlSZWYgPSB0aGlzLl9vdmVybGF5UmVmIHx8IHRoaXMuX292ZXJsYXkuY3JlYXRlKHRoaXMuX2dldE92ZXJsYXlDb25maWcoKSk7XG4gICAgICB0aGlzLl9vdmVybGF5UmVmLmF0dGFjaCh0aGlzLl9nZXRQYW5lbENvbnRlbnQoKSk7XG4gICAgICBpZiAoIXRoaXMuX2lzVGV4dFRyaWdnZXIoKSkge1xuICAgICAgICB0aGlzLl9wYW5lbD8uZm9jdXNDb250ZW50KCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqIElmIHRoZSBjb21ib2JveCBpcyBvcGVuIGFuZCBub3QgZGlzYWJsZWQsIGNsb3NlcyB0aGUgcGFuZWwuICovXG4gIGNsb3NlKCkge1xuICAgIGlmICh0aGlzLmlzT3BlbigpICYmICF0aGlzLmRpc2FibGVkKSB7XG4gICAgICB0aGlzLmNsb3NlZC5uZXh0KCk7XG4gICAgICB0aGlzLl9vdmVybGF5UmVmLmRldGFjaCgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBSZXR1cm5zIHRydWUgaWYgcGFuZWwgaXMgY3VycmVudGx5IG9wZW5lZC4gKi9cbiAgaXNPcGVuKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9vdmVybGF5UmVmID8gdGhpcy5fb3ZlcmxheVJlZi5oYXNBdHRhY2hlZCgpIDogZmFsc2U7XG4gIH1cblxuICAvKiogUmV0dXJucyB0cnVlIGlmIGNvbWJvYm94IGhhcyBhIGNoaWxkIHBhbmVsLiAqL1xuICBoYXNQYW5lbCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gISF0aGlzLnBhbmVsO1xuICB9XG5cbiAgX2dldFRhYkluZGV4KCk6IHN0cmluZyB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLmRpc2FibGVkID8gbnVsbCA6ICcwJztcbiAgfVxuXG4gIHByaXZhdGUgX3NldENvbWJvYm94VmFsdWUodmFsdWU6IFQgfCBUW10pIHtcblxuICAgIGNvbnN0IHZhbHVlQ2hhbmdlZCA9ICh0aGlzLnZhbHVlICE9PSB2YWx1ZSk7XG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuXG4gICAgaWYgKHZhbHVlQ2hhbmdlZCkge1xuICAgICAgdGhpcy5wYW5lbFZhbHVlQ2hhbmdlZC5lbWl0KGNvZXJjZUFycmF5KHZhbHVlKSk7XG4gICAgICBpZiAodGhpcy5fYXV0b1NldFRleHQpIHtcbiAgICAgICAgdGhpcy5fc2V0VGV4dENvbnRlbnQodmFsdWUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3NldFRleHRDb250ZW50KGNvbnRlbnQ6IFQgfCBUW10pIHtcbiAgICBjb25zdCBjb250ZW50QXJyYXkgPSBjb2VyY2VBcnJheShjb250ZW50KTtcbiAgICB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQudGV4dENvbnRlbnQgPSBjb250ZW50QXJyYXkuam9pbignICcpO1xuICB9XG5cbiAgcHJpdmF0ZSBfaXNUZXh0VHJpZ2dlcigpIHtcbiAgICAvLyBUT0RPOiBTaG91bGQgY2hlY2sgaWYgdGhlIHRyaWdnZXIgaXMgY29udGVudGVkaXRhYmxlLlxuICAgIGNvbnN0IHRhZ05hbWUgPSB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQudGFnTmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgIHJldHVybiB0YWdOYW1lID09PSAnaW5wdXQnIHx8IHRhZ05hbWUgPT09ICd0ZXh0YXJlYScgPyB0cnVlIDogZmFsc2U7XG4gIH1cblxuICBwcml2YXRlIF9nZXRPdmVybGF5Q29uZmlnKCkge1xuICAgIHJldHVybiBuZXcgT3ZlcmxheUNvbmZpZyh7XG4gICAgICBwb3NpdGlvblN0cmF0ZWd5OiB0aGlzLl9nZXRPdmVybGF5UG9zaXRpb25TdHJhdGVneSgpLFxuICAgICAgc2Nyb2xsU3RyYXRlZ3k6IHRoaXMuX292ZXJsYXkuc2Nyb2xsU3RyYXRlZ2llcy5ibG9jaygpLFxuICAgICAgZGlyZWN0aW9uOiB0aGlzLl9kaXJlY3Rpb25hbGl0eSxcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX2dldE92ZXJsYXlQb3NpdGlvblN0cmF0ZWd5KCk6IEZsZXhpYmxlQ29ubmVjdGVkUG9zaXRpb25TdHJhdGVneSB7XG4gICAgcmV0dXJuIHRoaXMuX292ZXJsYXlcbiAgICAgICAgLnBvc2l0aW9uKClcbiAgICAgICAgLmZsZXhpYmxlQ29ubmVjdGVkVG8odGhpcy5fZWxlbWVudFJlZilcbiAgICAgICAgLndpdGhQb3NpdGlvbnModGhpcy5fZ2V0T3ZlcmxheVBvc2l0aW9ucygpKTtcbiAgfVxuXG4gIHByaXZhdGUgX2dldE92ZXJsYXlQb3NpdGlvbnMoKTogQ29ubmVjdGVkUG9zaXRpb25bXSB7XG4gICAgcmV0dXJuIFtcbiAgICAgIHtvcmlnaW5YOiAnc3RhcnQnLCBvcmlnaW5ZOiAnYm90dG9tJywgb3ZlcmxheVg6ICdzdGFydCcsIG92ZXJsYXlZOiAndG9wJ30sXG4gICAgICB7b3JpZ2luWDogJ3N0YXJ0Jywgb3JpZ2luWTogJ3RvcCcsIG92ZXJsYXlYOiAnc3RhcnQnLCBvdmVybGF5WTogJ2JvdHRvbSd9LFxuICAgICAge29yaWdpblg6ICdlbmQnLCBvcmlnaW5ZOiAnYm90dG9tJywgb3ZlcmxheVg6ICdlbmQnLCBvdmVybGF5WTogJ3RvcCd9LFxuICAgICAge29yaWdpblg6ICdlbmQnLCBvcmlnaW5ZOiAndG9wJywgb3ZlcmxheVg6ICdlbmQnLCBvdmVybGF5WTogJ2JvdHRvbSd9LFxuICAgIF07XG4gIH1cblxuICBwcml2YXRlIF9nZXRQYW5lbENvbnRlbnQoKSB7XG4gICAgY29uc3QgaGFzUGFuZWxDaGFuZ2VkID0gdGhpcy5fcGFuZWw/Ll90ZW1wbGF0ZVJlZiAhPT0gdGhpcy5fcGFuZWxDb250ZW50Py50ZW1wbGF0ZVJlZjtcbiAgICBpZiAodGhpcy5fcGFuZWwgJiYgKCF0aGlzLl9wYW5lbCB8fCBoYXNQYW5lbENoYW5nZWQpKSB7XG4gICAgICB0aGlzLl9wYW5lbENvbnRlbnQgPSBuZXcgVGVtcGxhdGVQb3J0YWwodGhpcy5fcGFuZWwuX3RlbXBsYXRlUmVmLCB0aGlzLl92aWV3Q29udGFpbmVyUmVmKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fcGFuZWxDb250ZW50O1xuICB9XG5cbiAgcHJpdmF0ZSBfY29lcmNlT3BlbkFjdGlvblByb3BlcnR5KGlucHV0OiBzdHJpbmcgfCBPcGVuQWN0aW9uW10pOiBPcGVuQWN0aW9uW10ge1xuICAgIGxldCBhY3Rpb25zID0gdHlwZW9mIGlucHV0ID09PSAnc3RyaW5nJyA/IGlucHV0LnRyaW0oKS5zcGxpdCgvWyAsXSsvKSA6IGlucHV0O1xuICAgIGlmICgodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSAmJlxuICAgICAgYWN0aW9ucy5zb21lKGEgPT4gYWxsb3dlZE9wZW5BY3Rpb25zLmluZGV4T2YoYSkgPT09IC0xKSkge1xuICAgICAgdGhyb3cgRXJyb3IoYCR7aW5wdXR9IGlzIG5vdCBhIHN1cHBvcnQgb3BlbiBhY3Rpb24gZm9yIENka0NvbWJvYm94YCk7XG4gICAgfVxuICAgIHJldHVybiBhY3Rpb25zIGFzIE9wZW5BY3Rpb25bXTtcbiAgfVxuXG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9vcGVuQWN0aW9uczogT3BlbkFjdGlvbklucHV0O1xuICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfYXV0b1NldFRleHQ6IE9wZW5BY3Rpb25JbnB1dDtcbiAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2Rpc2FibGVkOiBCb29sZWFuSW5wdXQ7XG59XG4iXX0=