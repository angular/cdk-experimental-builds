/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, ElementRef, EventEmitter, Input, isDevMode, Optional, Output, ViewContainerRef } from '@angular/core';
import { TemplatePortal } from '@angular/cdk/portal';
import { Overlay, OverlayConfig } from '@angular/cdk/overlay';
import { Directionality } from '@angular/cdk/bidi';
import { coerceBooleanProperty, coerceArray } from '@angular/cdk/coercion';
import { DOWN_ARROW, ESCAPE } from '@angular/cdk/keycodes';
const allowedOpenActions = ['focus', 'click', 'downKey', 'toggle'];
export class CdkCombobox {
    constructor(_elementRef, _overlay, _viewContainerRef, _directionality) {
        this._elementRef = _elementRef;
        this._overlay = _overlay;
        this._viewContainerRef = _viewContainerRef;
        this._directionality = _directionality;
        this._disabled = false;
        this._openActions = ['click'];
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
        const { keyCode } = event;
        if (keyCode === DOWN_ARROW && this._openActions.indexOf('downKey') !== -1) {
            this.open();
        }
        else if (keyCode === ESCAPE) {
            event.preventDefault();
            this.close();
        }
    }
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
            (_a = this._panel) === null || _a === void 0 ? void 0 : _a.focusContent();
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
            this.panelValueChanged.emit(value);
            this._setTextContent(value);
        }
    }
    _setTextContent(content) {
        const contentArray = coerceArray(content);
        this._elementRef.nativeElement.textContent = contentArray.join(' ');
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
        if (isDevMode() && actions.some(a => allowedOpenActions.indexOf(a) === -1)) {
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
    opened: [{ type: Output, args: ['comboboxPanelOpened',] }],
    closed: [{ type: Output, args: ['comboboxPanelClosed',] }],
    panelValueChanged: [{ type: Output, args: ['panelValueChanged',] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tYm9ib3guanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrLWV4cGVyaW1lbnRhbC9jb21ib2JveC9jb21ib2JveC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFNSCxPQUFPLEVBRUwsU0FBUyxFQUNULFVBQVUsRUFDVixZQUFZLEVBQ1osS0FBSyxFQUFFLFNBQVMsRUFFaEIsUUFBUSxFQUNSLE1BQU0sRUFBRSxnQkFBZ0IsRUFDekIsTUFBTSxlQUFlLENBQUM7QUFFdkIsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQ25ELE9BQU8sRUFHTCxPQUFPLEVBQ1AsYUFBYSxFQUVkLE1BQU0sc0JBQXNCLENBQUM7QUFDOUIsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQ2pELE9BQU8sRUFBZSxxQkFBcUIsRUFBRSxXQUFXLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUN2RixPQUFPLEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBRXpELE1BQU0sa0JBQWtCLEdBQUcsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQztBQW1CbkUsTUFBTSxPQUFPLFdBQVc7SUFnQ3RCLFlBQ21CLFdBQW9DLEVBQ3BDLFFBQWlCLEVBQ2YsaUJBQW1DLEVBQ3pCLGVBQWdDO1FBSDVDLGdCQUFXLEdBQVgsV0FBVyxDQUF5QjtRQUNwQyxhQUFRLEdBQVIsUUFBUSxDQUFTO1FBQ2Ysc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFrQjtRQUN6QixvQkFBZSxHQUFmLGVBQWUsQ0FBaUI7UUF4QnZELGNBQVMsR0FBWSxLQUFLLENBQUM7UUFTM0IsaUJBQVksR0FBaUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUVQLFdBQU0sR0FBdUIsSUFBSSxZQUFZLEVBQVEsQ0FBQztRQUN0RCxXQUFNLEdB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QjtpQkFDcEM7YUFDRjs7O1lBdENDLFVBQVU7WUFZVixPQUFPO1lBUEMsZ0JBQWdCO1lBV2xCLGNBQWMsdUJBMkRqQixRQUFROzs7b0JBbkNWLEtBQUssU0FBQyx1QkFBdUI7b0JBSzdCLEtBQUs7dUJBR0wsS0FBSzswQkFLTCxLQUFLO3FCQVNMLE1BQU0sU0FBQyxxQkFBcUI7cUJBQzVCLE1BQU0sU0FBQyxxQkFBcUI7Z0NBQzVCLE1BQU0sU0FBQyxtQkFBbUIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuXG5leHBvcnQgdHlwZSBPcGVuQWN0aW9uID0gJ2ZvY3VzJyB8ICdjbGljaycgfCAnZG93bktleScgfCAndG9nZ2xlJztcbmV4cG9ydCB0eXBlIE9wZW5BY3Rpb25JbnB1dCA9IE9wZW5BY3Rpb24gfCBPcGVuQWN0aW9uW10gfCBzdHJpbmcgfCBudWxsIHwgdW5kZWZpbmVkO1xuXG5pbXBvcnQge1xuICBBZnRlckNvbnRlbnRJbml0LFxuICBEaXJlY3RpdmUsXG4gIEVsZW1lbnRSZWYsXG4gIEV2ZW50RW1pdHRlcixcbiAgSW5wdXQsIGlzRGV2TW9kZSxcbiAgT25EZXN0cm95LFxuICBPcHRpb25hbCxcbiAgT3V0cHV0LCBWaWV3Q29udGFpbmVyUmVmXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtDZGtDb21ib2JveFBhbmVsLCBBcmlhSGFzUG9wdXBWYWx1ZX0gZnJvbSAnLi9jb21ib2JveC1wYW5lbCc7XG5pbXBvcnQge1RlbXBsYXRlUG9ydGFsfSBmcm9tICdAYW5ndWxhci9jZGsvcG9ydGFsJztcbmltcG9ydCB7XG4gIENvbm5lY3RlZFBvc2l0aW9uLFxuICBGbGV4aWJsZUNvbm5lY3RlZFBvc2l0aW9uU3RyYXRlZ3ksXG4gIE92ZXJsYXksXG4gIE92ZXJsYXlDb25maWcsXG4gIE92ZXJsYXlSZWZcbn0gZnJvbSAnQGFuZ3VsYXIvY2RrL292ZXJsYXknO1xuaW1wb3J0IHtEaXJlY3Rpb25hbGl0eX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2JpZGknO1xuaW1wb3J0IHtCb29sZWFuSW5wdXQsIGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eSwgY29lcmNlQXJyYXl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2VyY2lvbic7XG5pbXBvcnQge0RPV05fQVJST1csIEVTQ0FQRX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2tleWNvZGVzJztcblxuY29uc3QgYWxsb3dlZE9wZW5BY3Rpb25zID0gWydmb2N1cycsICdjbGljaycsICdkb3duS2V5JywgJ3RvZ2dsZSddO1xuXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbY2RrQ29tYm9ib3hdJyxcbiAgZXhwb3J0QXM6ICdjZGtDb21ib2JveCcsXG4gIGhvc3Q6IHtcbiAgICAncm9sZSc6ICdjb21ib2JveCcsXG4gICAgJ2NsYXNzJzogJ2Nkay1jb21ib2JveCcsXG4gICAgJyhjbGljayknOiAnX2hhbmRsZUludGVyYWN0aW9ucyhcImNsaWNrXCIpJyxcbiAgICAnKGZvY3VzKSc6ICdfaGFuZGxlSW50ZXJhY3Rpb25zKFwiZm9jdXNcIiknLFxuICAgICcoa2V5ZG93biknOiAnX2tleWRvd24oJGV2ZW50KScsXG4gICAgJyhkb2N1bWVudDpjbGljayknOiAnX2F0dGVtcHRDbG9zZSgkZXZlbnQpJyxcbiAgICAnW2F0dHIuYXJpYS1kaXNhYmxlZF0nOiAnZGlzYWJsZWQnLFxuICAgICdbYXR0ci5hcmlhLW93bnNdJzogJ2NvbnRlbnRJZCcsXG4gICAgJ1thdHRyLmFyaWEtaGFzcG9wdXBdJzogJ2NvbnRlbnRUeXBlJyxcbiAgICAnW2F0dHIuYXJpYS1leHBhbmRlZF0nOiAnaXNPcGVuKCknLFxuICAgICdbYXR0ci50YWJpbmRleF0nOiAnX2dldFRhYkluZGV4KCknXG4gIH1cbn0pXG5leHBvcnQgY2xhc3MgQ2RrQ29tYm9ib3g8VCA9IHVua25vd24+IGltcGxlbWVudHMgT25EZXN0cm95LCBBZnRlckNvbnRlbnRJbml0IHtcbiAgQElucHV0KCdjZGtDb21ib2JveFRyaWdnZXJGb3InKVxuICBnZXQgcGFuZWwoKTogQ2RrQ29tYm9ib3hQYW5lbDxUPiB8IHVuZGVmaW5lZCB7IHJldHVybiB0aGlzLl9wYW5lbDsgfVxuICBzZXQgcGFuZWwocGFuZWw6IENka0NvbWJvYm94UGFuZWw8VD4gfCB1bmRlZmluZWQpIHsgdGhpcy5fcGFuZWwgPSBwYW5lbDsgfVxuICBwcml2YXRlIF9wYW5lbDogQ2RrQ29tYm9ib3hQYW5lbDxUPiB8IHVuZGVmaW5lZDtcblxuICBASW5wdXQoKVxuICB2YWx1ZTogVDtcblxuICBASW5wdXQoKVxuICBnZXQgZGlzYWJsZWQoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLl9kaXNhYmxlZDsgfVxuICBzZXQgZGlzYWJsZWQodmFsdWU6IGJvb2xlYW4pIHsgdGhpcy5fZGlzYWJsZWQgPSBjb2VyY2VCb29sZWFuUHJvcGVydHkodmFsdWUpOyB9XG4gIHByaXZhdGUgX2Rpc2FibGVkOiBib29sZWFuID0gZmFsc2U7XG5cbiAgQElucHV0KClcbiAgZ2V0IG9wZW5BY3Rpb25zKCk6IE9wZW5BY3Rpb25bXSB7XG4gICAgcmV0dXJuIHRoaXMuX29wZW5BY3Rpb25zO1xuICB9XG4gIHNldCBvcGVuQWN0aW9ucyhhY3Rpb246IE9wZW5BY3Rpb25bXSkge1xuICAgIHRoaXMuX29wZW5BY3Rpb25zID0gdGhpcy5fY29lcmNlT3BlbkFjdGlvblByb3BlcnR5KGFjdGlvbik7XG4gIH1cbiAgcHJpdmF0ZSBfb3BlbkFjdGlvbnM6IE9wZW5BY3Rpb25bXSA9IFsnY2xpY2snXTtcblxuICBAT3V0cHV0KCdjb21ib2JveFBhbmVsT3BlbmVkJykgcmVhZG9ubHkgb3BlbmVkOiBFdmVudEVtaXR0ZXI8dm9pZD4gPSBuZXcgRXZlbnRFbWl0dGVyPHZvaWQ+KCk7XG4gIEBPdXRwdXQoJ2NvbWJvYm94UGFuZWxDbG9zZWQnKSByZWFkb25seSBjbG9zZWQ6IEV2ZW50RW1pdHRlcjx2b2lkPiA9IG5ldyBFdmVudEVtaXR0ZXI8dm9pZD4oKTtcbiAgQE91dHB1dCgncGFuZWxWYWx1ZUNoYW5nZWQnKSByZWFkb25seSBwYW5lbFZhbHVlQ2hhbmdlZDogRXZlbnRFbWl0dGVyPFQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxUPigpO1xuXG4gIHByaXZhdGUgX292ZXJsYXlSZWY6IE92ZXJsYXlSZWY7XG4gIHByaXZhdGUgX3BhbmVsQ29udGVudDogVGVtcGxhdGVQb3J0YWw7XG4gIGNvbnRlbnRJZDogc3RyaW5nID0gJyc7XG4gIGNvbnRlbnRUeXBlOiBBcmlhSGFzUG9wdXBWYWx1ZTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIHJlYWRvbmx5IF9lbGVtZW50UmVmOiBFbGVtZW50UmVmPEhUTUxFbGVtZW50PixcbiAgICBwcml2YXRlIHJlYWRvbmx5IF9vdmVybGF5OiBPdmVybGF5LFxuICAgIHByb3RlY3RlZCByZWFkb25seSBfdmlld0NvbnRhaW5lclJlZjogVmlld0NvbnRhaW5lclJlZixcbiAgICBAT3B0aW9uYWwoKSBwcml2YXRlIHJlYWRvbmx5IF9kaXJlY3Rpb25hbGl0eT86IERpcmVjdGlvbmFsaXR5XG4gICkge31cblxuICBuZ0FmdGVyQ29udGVudEluaXQoKSB7XG4gICAgdGhpcy5fcGFuZWw/LnZhbHVlVXBkYXRlZC5zdWJzY3JpYmUoZGF0YSA9PiB7XG4gICAgICB0aGlzLl9zZXRDb21ib2JveFZhbHVlKGRhdGEpO1xuICAgICAgdGhpcy5jbG9zZSgpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5fcGFuZWw/LmNvbnRlbnRJZFVwZGF0ZWQuc3Vic2NyaWJlKGlkID0+IHtcbiAgICAgIHRoaXMuY29udGVudElkID0gaWQ7XG4gICAgfSk7XG5cbiAgICB0aGlzLl9wYW5lbD8uY29udGVudFR5cGVVcGRhdGVkLnN1YnNjcmliZSh0eXBlID0+IHtcbiAgICAgIHRoaXMuY29udGVudFR5cGUgPSB0eXBlO1xuICAgIH0pO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgdGhpcy5vcGVuZWQuY29tcGxldGUoKTtcbiAgICB0aGlzLmNsb3NlZC5jb21wbGV0ZSgpO1xuICAgIHRoaXMucGFuZWxWYWx1ZUNoYW5nZWQuY29tcGxldGUoKTtcbiAgfVxuXG4gIF9rZXlkb3duKGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XG4gICAgY29uc3Qge2tleUNvZGV9ID0gZXZlbnQ7XG5cbiAgICBpZiAoa2V5Q29kZSA9PT0gRE9XTl9BUlJPVyAmJiB0aGlzLl9vcGVuQWN0aW9ucy5pbmRleE9mKCdkb3duS2V5JykgIT09IC0xKSB7XG4gICAgICB0aGlzLm9wZW4oKTtcbiAgICB9IGVsc2UgaWYgKGtleUNvZGUgPT09IEVTQ0FQRSkge1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICB9XG4gIH1cblxuICBfaGFuZGxlSW50ZXJhY3Rpb25zKGludGVyYWN0aW9uOiBPcGVuQWN0aW9uKSB7XG4gICAgaWYgKGludGVyYWN0aW9uID09PSAnY2xpY2snKSB7XG4gICAgICBpZiAodGhpcy5fb3BlbkFjdGlvbnMuaW5kZXhPZigndG9nZ2xlJykgIT09IC0xKSB7XG4gICAgICAgIHRoaXMudG9nZ2xlKCk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuX29wZW5BY3Rpb25zLmluZGV4T2YoJ2NsaWNrJykgIT09IC0xKSB7XG4gICAgICAgIHRoaXMub3BlbigpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoaW50ZXJhY3Rpb24gPT09ICdmb2N1cycpIHtcbiAgICAgIGlmICh0aGlzLl9vcGVuQWN0aW9ucy5pbmRleE9mKCdmb2N1cycpICE9PSAtMSkge1xuICAgICAgICB0aGlzLm9wZW4oKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBfYXR0ZW1wdENsb3NlKGV2ZW50OiBNb3VzZUV2ZW50KSB7XG4gICAgaWYgKHRoaXMuaXNPcGVuKCkpIHtcbiAgICAgIGxldCB0YXJnZXQgPSBldmVudC5jb21wb3NlZFBhdGggPyBldmVudC5jb21wb3NlZFBhdGgoKVswXSA6IGV2ZW50LnRhcmdldDtcbiAgICAgIHdoaWxlICh0YXJnZXQgaW5zdGFuY2VvZiBFbGVtZW50KSB7XG4gICAgICAgIGlmICh0YXJnZXQuY2xhc3NOYW1lLmluZGV4T2YoJ2Nkay1jb21ib2JveCcpICE9PSAtMSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0YXJnZXQgPSB0YXJnZXQucGFyZW50RWxlbWVudDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmNsb3NlKCk7XG4gIH1cblxuICAvKiogVG9nZ2xlcyB0aGUgb3BlbiBzdGF0ZSBvZiB0aGUgcGFuZWwuICovXG4gIHRvZ2dsZSgpIHtcbiAgICBpZiAodGhpcy5oYXNQYW5lbCgpKSB7XG4gICAgICB0aGlzLmlzT3BlbigpID8gdGhpcy5jbG9zZSgpIDogdGhpcy5vcGVuKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIElmIHRoZSBjb21ib2JveCBpcyBjbG9zZWQgYW5kIG5vdCBkaXNhYmxlZCwgb3BlbnMgdGhlIHBhbmVsLiAqL1xuICBvcGVuKCkge1xuICAgIGlmICghdGhpcy5pc09wZW4oKSAmJiAhdGhpcy5kaXNhYmxlZCkge1xuICAgICAgdGhpcy5vcGVuZWQubmV4dCgpO1xuICAgICAgdGhpcy5fb3ZlcmxheVJlZiA9IHRoaXMuX292ZXJsYXlSZWYgfHwgdGhpcy5fb3ZlcmxheS5jcmVhdGUodGhpcy5fZ2V0T3ZlcmxheUNvbmZpZygpKTtcbiAgICAgIHRoaXMuX292ZXJsYXlSZWYuYXR0YWNoKHRoaXMuX2dldFBhbmVsQ29udGVudCgpKTtcbiAgICAgIHRoaXMuX3BhbmVsPy5mb2N1c0NvbnRlbnQoKTtcbiAgICB9XG4gIH1cblxuICAvKiogSWYgdGhlIGNvbWJvYm94IGlzIG9wZW4gYW5kIG5vdCBkaXNhYmxlZCwgY2xvc2VzIHRoZSBwYW5lbC4gKi9cbiAgY2xvc2UoKSB7XG4gICAgaWYgKHRoaXMuaXNPcGVuKCkgJiYgIXRoaXMuZGlzYWJsZWQpIHtcbiAgICAgIHRoaXMuY2xvc2VkLm5leHQoKTtcbiAgICAgIHRoaXMuX292ZXJsYXlSZWYuZGV0YWNoKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFJldHVybnMgdHJ1ZSBpZiBwYW5lbCBpcyBjdXJyZW50bHkgb3BlbmVkLiAqL1xuICBpc09wZW4oKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX292ZXJsYXlSZWYgPyB0aGlzLl9vdmVybGF5UmVmLmhhc0F0dGFjaGVkKCkgOiBmYWxzZTtcbiAgfVxuXG4gIC8qKiBSZXR1cm5zIHRydWUgaWYgY29tYm9ib3ggaGFzIGEgY2hpbGQgcGFuZWwuICovXG4gIGhhc1BhbmVsKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAhIXRoaXMucGFuZWw7XG4gIH1cblxuICBfZ2V0VGFiSW5kZXgoKTogc3RyaW5nIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuZGlzYWJsZWQgPyBudWxsIDogJzAnO1xuICB9XG5cbiAgcHJpdmF0ZSBfc2V0Q29tYm9ib3hWYWx1ZSh2YWx1ZTogVCkge1xuXG4gICAgY29uc3QgdmFsdWVDaGFuZ2VkID0gKHRoaXMudmFsdWUgIT09IHZhbHVlKTtcbiAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG5cbiAgICBpZiAodmFsdWVDaGFuZ2VkKSB7XG4gICAgICB0aGlzLnBhbmVsVmFsdWVDaGFuZ2VkLmVtaXQodmFsdWUpO1xuICAgICAgdGhpcy5fc2V0VGV4dENvbnRlbnQodmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3NldFRleHRDb250ZW50KGNvbnRlbnQ6IFQpIHtcbiAgICBjb25zdCBjb250ZW50QXJyYXkgPSBjb2VyY2VBcnJheShjb250ZW50KTtcbiAgICB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQudGV4dENvbnRlbnQgPSBjb250ZW50QXJyYXkuam9pbignICcpO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0T3ZlcmxheUNvbmZpZygpIHtcbiAgICByZXR1cm4gbmV3IE92ZXJsYXlDb25maWcoe1xuICAgICAgcG9zaXRpb25TdHJhdGVneTogdGhpcy5fZ2V0T3ZlcmxheVBvc2l0aW9uU3RyYXRlZ3koKSxcbiAgICAgIHNjcm9sbFN0cmF0ZWd5OiB0aGlzLl9vdmVybGF5LnNjcm9sbFN0cmF0ZWdpZXMuYmxvY2soKSxcbiAgICAgIGRpcmVjdGlvbjogdGhpcy5fZGlyZWN0aW9uYWxpdHksXG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIF9nZXRPdmVybGF5UG9zaXRpb25TdHJhdGVneSgpOiBGbGV4aWJsZUNvbm5lY3RlZFBvc2l0aW9uU3RyYXRlZ3kge1xuICAgIHJldHVybiB0aGlzLl9vdmVybGF5XG4gICAgICAgIC5wb3NpdGlvbigpXG4gICAgICAgIC5mbGV4aWJsZUNvbm5lY3RlZFRvKHRoaXMuX2VsZW1lbnRSZWYpXG4gICAgICAgIC53aXRoUG9zaXRpb25zKHRoaXMuX2dldE92ZXJsYXlQb3NpdGlvbnMoKSk7XG4gIH1cblxuICBwcml2YXRlIF9nZXRPdmVybGF5UG9zaXRpb25zKCk6IENvbm5lY3RlZFBvc2l0aW9uW10ge1xuICAgIHJldHVybiBbXG4gICAgICB7b3JpZ2luWDogJ3N0YXJ0Jywgb3JpZ2luWTogJ2JvdHRvbScsIG92ZXJsYXlYOiAnc3RhcnQnLCBvdmVybGF5WTogJ3RvcCd9LFxuICAgICAge29yaWdpblg6ICdzdGFydCcsIG9yaWdpblk6ICd0b3AnLCBvdmVybGF5WDogJ3N0YXJ0Jywgb3ZlcmxheVk6ICdib3R0b20nfSxcbiAgICAgIHtvcmlnaW5YOiAnZW5kJywgb3JpZ2luWTogJ2JvdHRvbScsIG92ZXJsYXlYOiAnZW5kJywgb3ZlcmxheVk6ICd0b3AnfSxcbiAgICAgIHtvcmlnaW5YOiAnZW5kJywgb3JpZ2luWTogJ3RvcCcsIG92ZXJsYXlYOiAnZW5kJywgb3ZlcmxheVk6ICdib3R0b20nfSxcbiAgICBdO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0UGFuZWxDb250ZW50KCkge1xuICAgIGNvbnN0IGhhc1BhbmVsQ2hhbmdlZCA9IHRoaXMuX3BhbmVsPy5fdGVtcGxhdGVSZWYgIT09IHRoaXMuX3BhbmVsQ29udGVudD8udGVtcGxhdGVSZWY7XG4gICAgaWYgKHRoaXMuX3BhbmVsICYmICghdGhpcy5fcGFuZWwgfHwgaGFzUGFuZWxDaGFuZ2VkKSkge1xuICAgICAgdGhpcy5fcGFuZWxDb250ZW50ID0gbmV3IFRlbXBsYXRlUG9ydGFsKHRoaXMuX3BhbmVsLl90ZW1wbGF0ZVJlZiwgdGhpcy5fdmlld0NvbnRhaW5lclJlZik7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX3BhbmVsQ29udGVudDtcbiAgfVxuXG4gIHByaXZhdGUgX2NvZXJjZU9wZW5BY3Rpb25Qcm9wZXJ0eShpbnB1dDogc3RyaW5nIHwgT3BlbkFjdGlvbltdKTogT3BlbkFjdGlvbltdIHtcbiAgICBsZXQgYWN0aW9ucyA9IHR5cGVvZiBpbnB1dCA9PT0gJ3N0cmluZycgPyBpbnB1dC50cmltKCkuc3BsaXQoL1sgLF0rLykgOiBpbnB1dDtcbiAgICBpZiAoaXNEZXZNb2RlKCkgJiYgYWN0aW9ucy5zb21lKGEgPT4gYWxsb3dlZE9wZW5BY3Rpb25zLmluZGV4T2YoYSkgPT09IC0xKSkge1xuICAgICAgdGhyb3cgRXJyb3IoYCR7aW5wdXR9IGlzIG5vdCBhIHN1cHBvcnQgb3BlbiBhY3Rpb24gZm9yIENka0NvbWJvYm94YCk7XG4gICAgfVxuICAgIHJldHVybiBhY3Rpb25zIGFzIE9wZW5BY3Rpb25bXTtcbiAgfVxuXG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9vcGVuQWN0aW9uczogT3BlbkFjdGlvbklucHV0O1xuICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZGlzYWJsZWQ6IEJvb2xlYW5JbnB1dDtcbn1cbiJdfQ==