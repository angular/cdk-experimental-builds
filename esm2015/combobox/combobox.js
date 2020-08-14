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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tYm9ib3guanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrLWV4cGVyaW1lbnRhbC9jb21ib2JveC9jb21ib2JveC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFLSCxPQUFPLEVBRUwsU0FBUyxFQUNULFVBQVUsRUFDVixZQUFZLEVBQ1osS0FBSyxFQUFFLFNBQVMsRUFFaEIsUUFBUSxFQUNSLE1BQU0sRUFBRSxnQkFBZ0IsRUFDekIsTUFBTSxlQUFlLENBQUM7QUFFdkIsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQ25ELE9BQU8sRUFHTCxPQUFPLEVBQ1AsYUFBYSxFQUVkLE1BQU0sc0JBQXNCLENBQUM7QUFDOUIsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQ2pELE9BQU8sRUFBZSxxQkFBcUIsRUFBRSxXQUFXLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUN2RixPQUFPLEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBRXpELE1BQU0sa0JBQWtCLEdBQUcsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQztBQW1CbkUsTUFBTSxPQUFPLFdBQVc7SUFnQ3RCLFlBQ21CLFdBQW9DLEVBQ3BDLFFBQWlCLEVBQ2YsaUJBQW1DLEVBQ3pCLGVBQWdDO1FBSDVDLGdCQUFXLEdBQVgsV0FBVyxDQUF5QjtRQUNwQyxhQUFRLEdBQVIsUUFBUSxDQUFTO1FBQ2Ysc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFrQjtRQUN6QixvQkFBZSxHQUFmLGVBQWUsQ0FBaUI7UUF4QnZELGNBQVMsR0FBWSxLQUFLLENBQUM7UUFTM0IsaUJBQVksR0FBaUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUVQLFdBQU0sR0FBdUIsSUFBSSxZQUFZLEVBQVEsQ0FBQztRQUN0RCxXQUFNLEdB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QjtpQkFDcEM7YUFDRjs7O1lBdENDLFVBQVU7WUFZVixPQUFPO1lBUEMsZ0JBQWdCO1lBV2xCLGNBQWMsdUJBMkRqQixRQUFROzs7b0JBbkNWLEtBQUssU0FBQyx1QkFBdUI7b0JBSzdCLEtBQUs7dUJBR0wsS0FBSzswQkFLTCxLQUFLO3FCQVNMLE1BQU0sU0FBQyxxQkFBcUI7cUJBQzVCLE1BQU0sU0FBQyxxQkFBcUI7Z0NBQzVCLE1BQU0sU0FBQyxtQkFBbUIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuZXhwb3J0IHR5cGUgT3BlbkFjdGlvbiA9ICdmb2N1cycgfCAnY2xpY2snIHwgJ2Rvd25LZXknIHwgJ3RvZ2dsZSc7XG5leHBvcnQgdHlwZSBPcGVuQWN0aW9uSW5wdXQgPSBPcGVuQWN0aW9uIHwgT3BlbkFjdGlvbltdIHwgc3RyaW5nIHwgbnVsbCB8IHVuZGVmaW5lZDtcblxuaW1wb3J0IHtcbiAgQWZ0ZXJDb250ZW50SW5pdCxcbiAgRGlyZWN0aXZlLFxuICBFbGVtZW50UmVmLFxuICBFdmVudEVtaXR0ZXIsXG4gIElucHV0LCBpc0Rldk1vZGUsXG4gIE9uRGVzdHJveSxcbiAgT3B0aW9uYWwsXG4gIE91dHB1dCwgVmlld0NvbnRhaW5lclJlZlxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7Q2RrQ29tYm9ib3hQYW5lbCwgQXJpYUhhc1BvcHVwVmFsdWV9IGZyb20gJy4vY29tYm9ib3gtcGFuZWwnO1xuaW1wb3J0IHtUZW1wbGF0ZVBvcnRhbH0gZnJvbSAnQGFuZ3VsYXIvY2RrL3BvcnRhbCc7XG5pbXBvcnQge1xuICBDb25uZWN0ZWRQb3NpdGlvbixcbiAgRmxleGlibGVDb25uZWN0ZWRQb3NpdGlvblN0cmF0ZWd5LFxuICBPdmVybGF5LFxuICBPdmVybGF5Q29uZmlnLFxuICBPdmVybGF5UmVmXG59IGZyb20gJ0Bhbmd1bGFyL2Nkay9vdmVybGF5JztcbmltcG9ydCB7RGlyZWN0aW9uYWxpdHl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9iaWRpJztcbmltcG9ydCB7Qm9vbGVhbklucHV0LCBjb2VyY2VCb29sZWFuUHJvcGVydHksIGNvZXJjZUFycmF5fSBmcm9tICdAYW5ndWxhci9jZGsvY29lcmNpb24nO1xuaW1wb3J0IHtET1dOX0FSUk9XLCBFU0NBUEV9IGZyb20gJ0Bhbmd1bGFyL2Nkay9rZXljb2Rlcyc7XG5cbmNvbnN0IGFsbG93ZWRPcGVuQWN0aW9ucyA9IFsnZm9jdXMnLCAnY2xpY2snLCAnZG93bktleScsICd0b2dnbGUnXTtcblxuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW2Nka0NvbWJvYm94XScsXG4gIGV4cG9ydEFzOiAnY2RrQ29tYm9ib3gnLFxuICBob3N0OiB7XG4gICAgJ3JvbGUnOiAnY29tYm9ib3gnLFxuICAgICdjbGFzcyc6ICdjZGstY29tYm9ib3gnLFxuICAgICcoY2xpY2spJzogJ19oYW5kbGVJbnRlcmFjdGlvbnMoXCJjbGlja1wiKScsXG4gICAgJyhmb2N1cyknOiAnX2hhbmRsZUludGVyYWN0aW9ucyhcImZvY3VzXCIpJyxcbiAgICAnKGtleWRvd24pJzogJ19rZXlkb3duKCRldmVudCknLFxuICAgICcoZG9jdW1lbnQ6Y2xpY2spJzogJ19hdHRlbXB0Q2xvc2UoJGV2ZW50KScsXG4gICAgJ1thdHRyLmFyaWEtZGlzYWJsZWRdJzogJ2Rpc2FibGVkJyxcbiAgICAnW2F0dHIuYXJpYS1vd25zXSc6ICdjb250ZW50SWQnLFxuICAgICdbYXR0ci5hcmlhLWhhc3BvcHVwXSc6ICdjb250ZW50VHlwZScsXG4gICAgJ1thdHRyLmFyaWEtZXhwYW5kZWRdJzogJ2lzT3BlbigpJyxcbiAgICAnW2F0dHIudGFiaW5kZXhdJzogJ19nZXRUYWJJbmRleCgpJ1xuICB9XG59KVxuZXhwb3J0IGNsYXNzIENka0NvbWJvYm94PFQgPSB1bmtub3duPiBpbXBsZW1lbnRzIE9uRGVzdHJveSwgQWZ0ZXJDb250ZW50SW5pdCB7XG4gIEBJbnB1dCgnY2RrQ29tYm9ib3hUcmlnZ2VyRm9yJylcbiAgZ2V0IHBhbmVsKCk6IENka0NvbWJvYm94UGFuZWw8VD4gfCB1bmRlZmluZWQgeyByZXR1cm4gdGhpcy5fcGFuZWw7IH1cbiAgc2V0IHBhbmVsKHBhbmVsOiBDZGtDb21ib2JveFBhbmVsPFQ+IHwgdW5kZWZpbmVkKSB7IHRoaXMuX3BhbmVsID0gcGFuZWw7IH1cbiAgcHJpdmF0ZSBfcGFuZWw6IENka0NvbWJvYm94UGFuZWw8VD4gfCB1bmRlZmluZWQ7XG5cbiAgQElucHV0KClcbiAgdmFsdWU6IFQ7XG5cbiAgQElucHV0KClcbiAgZ2V0IGRpc2FibGVkKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5fZGlzYWJsZWQ7IH1cbiAgc2V0IGRpc2FibGVkKHZhbHVlOiBib29sZWFuKSB7IHRoaXMuX2Rpc2FibGVkID0gY29lcmNlQm9vbGVhblByb3BlcnR5KHZhbHVlKTsgfVxuICBwcml2YXRlIF9kaXNhYmxlZDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIEBJbnB1dCgpXG4gIGdldCBvcGVuQWN0aW9ucygpOiBPcGVuQWN0aW9uW10ge1xuICAgIHJldHVybiB0aGlzLl9vcGVuQWN0aW9ucztcbiAgfVxuICBzZXQgb3BlbkFjdGlvbnMoYWN0aW9uOiBPcGVuQWN0aW9uW10pIHtcbiAgICB0aGlzLl9vcGVuQWN0aW9ucyA9IHRoaXMuX2NvZXJjZU9wZW5BY3Rpb25Qcm9wZXJ0eShhY3Rpb24pO1xuICB9XG4gIHByaXZhdGUgX29wZW5BY3Rpb25zOiBPcGVuQWN0aW9uW10gPSBbJ2NsaWNrJ107XG5cbiAgQE91dHB1dCgnY29tYm9ib3hQYW5lbE9wZW5lZCcpIHJlYWRvbmx5IG9wZW5lZDogRXZlbnRFbWl0dGVyPHZvaWQ+ID0gbmV3IEV2ZW50RW1pdHRlcjx2b2lkPigpO1xuICBAT3V0cHV0KCdjb21ib2JveFBhbmVsQ2xvc2VkJykgcmVhZG9ubHkgY2xvc2VkOiBFdmVudEVtaXR0ZXI8dm9pZD4gPSBuZXcgRXZlbnRFbWl0dGVyPHZvaWQ+KCk7XG4gIEBPdXRwdXQoJ3BhbmVsVmFsdWVDaGFuZ2VkJykgcmVhZG9ubHkgcGFuZWxWYWx1ZUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxUPiA9IG5ldyBFdmVudEVtaXR0ZXI8VD4oKTtcblxuICBwcml2YXRlIF9vdmVybGF5UmVmOiBPdmVybGF5UmVmO1xuICBwcml2YXRlIF9wYW5lbENvbnRlbnQ6IFRlbXBsYXRlUG9ydGFsO1xuICBjb250ZW50SWQ6IHN0cmluZyA9ICcnO1xuICBjb250ZW50VHlwZTogQXJpYUhhc1BvcHVwVmFsdWU7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSByZWFkb25seSBfZWxlbWVudFJlZjogRWxlbWVudFJlZjxIVE1MRWxlbWVudD4sXG4gICAgcHJpdmF0ZSByZWFkb25seSBfb3ZlcmxheTogT3ZlcmxheSxcbiAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgX3ZpZXdDb250YWluZXJSZWY6IFZpZXdDb250YWluZXJSZWYsXG4gICAgQE9wdGlvbmFsKCkgcHJpdmF0ZSByZWFkb25seSBfZGlyZWN0aW9uYWxpdHk/OiBEaXJlY3Rpb25hbGl0eVxuICApIHt9XG5cbiAgbmdBZnRlckNvbnRlbnRJbml0KCkge1xuICAgIHRoaXMuX3BhbmVsPy52YWx1ZVVwZGF0ZWQuc3Vic2NyaWJlKGRhdGEgPT4ge1xuICAgICAgdGhpcy5fc2V0Q29tYm9ib3hWYWx1ZShkYXRhKTtcbiAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICB9KTtcblxuICAgIHRoaXMuX3BhbmVsPy5jb250ZW50SWRVcGRhdGVkLnN1YnNjcmliZShpZCA9PiB7XG4gICAgICB0aGlzLmNvbnRlbnRJZCA9IGlkO1xuICAgIH0pO1xuXG4gICAgdGhpcy5fcGFuZWw/LmNvbnRlbnRUeXBlVXBkYXRlZC5zdWJzY3JpYmUodHlwZSA9PiB7XG4gICAgICB0aGlzLmNvbnRlbnRUeXBlID0gdHlwZTtcbiAgICB9KTtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIHRoaXMub3BlbmVkLmNvbXBsZXRlKCk7XG4gICAgdGhpcy5jbG9zZWQuY29tcGxldGUoKTtcbiAgICB0aGlzLnBhbmVsVmFsdWVDaGFuZ2VkLmNvbXBsZXRlKCk7XG4gIH1cblxuICBfa2V5ZG93bihldmVudDogS2V5Ym9hcmRFdmVudCkge1xuICAgIGNvbnN0IHtrZXlDb2RlfSA9IGV2ZW50O1xuXG4gICAgaWYgKGtleUNvZGUgPT09IERPV05fQVJST1cgJiYgdGhpcy5fb3BlbkFjdGlvbnMuaW5kZXhPZignZG93bktleScpICE9PSAtMSkge1xuICAgICAgdGhpcy5vcGVuKCk7XG4gICAgfSBlbHNlIGlmIChrZXlDb2RlID09PSBFU0NBUEUpIHtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB0aGlzLmNsb3NlKCk7XG4gICAgfVxuICB9XG5cbiAgX2hhbmRsZUludGVyYWN0aW9ucyhpbnRlcmFjdGlvbjogT3BlbkFjdGlvbikge1xuICAgIGlmIChpbnRlcmFjdGlvbiA9PT0gJ2NsaWNrJykge1xuICAgICAgaWYgKHRoaXMuX29wZW5BY3Rpb25zLmluZGV4T2YoJ3RvZ2dsZScpICE9PSAtMSkge1xuICAgICAgICB0aGlzLnRvZ2dsZSgpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLl9vcGVuQWN0aW9ucy5pbmRleE9mKCdjbGljaycpICE9PSAtMSkge1xuICAgICAgICB0aGlzLm9wZW4oKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGludGVyYWN0aW9uID09PSAnZm9jdXMnKSB7XG4gICAgICBpZiAodGhpcy5fb3BlbkFjdGlvbnMuaW5kZXhPZignZm9jdXMnKSAhPT0gLTEpIHtcbiAgICAgICAgdGhpcy5vcGVuKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgX2F0dGVtcHRDbG9zZShldmVudDogTW91c2VFdmVudCkge1xuICAgIGlmICh0aGlzLmlzT3BlbigpKSB7XG4gICAgICBsZXQgdGFyZ2V0ID0gZXZlbnQuY29tcG9zZWRQYXRoID8gZXZlbnQuY29tcG9zZWRQYXRoKClbMF0gOiBldmVudC50YXJnZXQ7XG4gICAgICB3aGlsZSAodGFyZ2V0IGluc3RhbmNlb2YgRWxlbWVudCkge1xuICAgICAgICBpZiAodGFyZ2V0LmNsYXNzTmFtZS5pbmRleE9mKCdjZGstY29tYm9ib3gnKSAhPT0gLTEpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGFyZ2V0ID0gdGFyZ2V0LnBhcmVudEVsZW1lbnQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5jbG9zZSgpO1xuICB9XG5cbiAgLyoqIFRvZ2dsZXMgdGhlIG9wZW4gc3RhdGUgb2YgdGhlIHBhbmVsLiAqL1xuICB0b2dnbGUoKSB7XG4gICAgaWYgKHRoaXMuaGFzUGFuZWwoKSkge1xuICAgICAgdGhpcy5pc09wZW4oKSA/IHRoaXMuY2xvc2UoKSA6IHRoaXMub3BlbigpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBJZiB0aGUgY29tYm9ib3ggaXMgY2xvc2VkIGFuZCBub3QgZGlzYWJsZWQsIG9wZW5zIHRoZSBwYW5lbC4gKi9cbiAgb3BlbigpIHtcbiAgICBpZiAoIXRoaXMuaXNPcGVuKCkgJiYgIXRoaXMuZGlzYWJsZWQpIHtcbiAgICAgIHRoaXMub3BlbmVkLm5leHQoKTtcbiAgICAgIHRoaXMuX292ZXJsYXlSZWYgPSB0aGlzLl9vdmVybGF5UmVmIHx8IHRoaXMuX292ZXJsYXkuY3JlYXRlKHRoaXMuX2dldE92ZXJsYXlDb25maWcoKSk7XG4gICAgICB0aGlzLl9vdmVybGF5UmVmLmF0dGFjaCh0aGlzLl9nZXRQYW5lbENvbnRlbnQoKSk7XG4gICAgICB0aGlzLl9wYW5lbD8uZm9jdXNDb250ZW50KCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIElmIHRoZSBjb21ib2JveCBpcyBvcGVuIGFuZCBub3QgZGlzYWJsZWQsIGNsb3NlcyB0aGUgcGFuZWwuICovXG4gIGNsb3NlKCkge1xuICAgIGlmICh0aGlzLmlzT3BlbigpICYmICF0aGlzLmRpc2FibGVkKSB7XG4gICAgICB0aGlzLmNsb3NlZC5uZXh0KCk7XG4gICAgICB0aGlzLl9vdmVybGF5UmVmLmRldGFjaCgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBSZXR1cm5zIHRydWUgaWYgcGFuZWwgaXMgY3VycmVudGx5IG9wZW5lZC4gKi9cbiAgaXNPcGVuKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9vdmVybGF5UmVmID8gdGhpcy5fb3ZlcmxheVJlZi5oYXNBdHRhY2hlZCgpIDogZmFsc2U7XG4gIH1cblxuICAvKiogUmV0dXJucyB0cnVlIGlmIGNvbWJvYm94IGhhcyBhIGNoaWxkIHBhbmVsLiAqL1xuICBoYXNQYW5lbCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gISF0aGlzLnBhbmVsO1xuICB9XG5cbiAgX2dldFRhYkluZGV4KCk6IHN0cmluZyB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLmRpc2FibGVkID8gbnVsbCA6ICcwJztcbiAgfVxuXG4gIHByaXZhdGUgX3NldENvbWJvYm94VmFsdWUodmFsdWU6IFQpIHtcblxuICAgIGNvbnN0IHZhbHVlQ2hhbmdlZCA9ICh0aGlzLnZhbHVlICE9PSB2YWx1ZSk7XG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuXG4gICAgaWYgKHZhbHVlQ2hhbmdlZCkge1xuICAgICAgdGhpcy5wYW5lbFZhbHVlQ2hhbmdlZC5lbWl0KHZhbHVlKTtcbiAgICAgIHRoaXMuX3NldFRleHRDb250ZW50KHZhbHVlKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9zZXRUZXh0Q29udGVudChjb250ZW50OiBUKSB7XG4gICAgY29uc3QgY29udGVudEFycmF5ID0gY29lcmNlQXJyYXkoY29udGVudCk7XG4gICAgdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LnRleHRDb250ZW50ID0gY29udGVudEFycmF5LmpvaW4oJyAnKTtcbiAgfVxuXG4gIHByaXZhdGUgX2dldE92ZXJsYXlDb25maWcoKSB7XG4gICAgcmV0dXJuIG5ldyBPdmVybGF5Q29uZmlnKHtcbiAgICAgIHBvc2l0aW9uU3RyYXRlZ3k6IHRoaXMuX2dldE92ZXJsYXlQb3NpdGlvblN0cmF0ZWd5KCksXG4gICAgICBzY3JvbGxTdHJhdGVneTogdGhpcy5fb3ZlcmxheS5zY3JvbGxTdHJhdGVnaWVzLmJsb2NrKCksXG4gICAgICBkaXJlY3Rpb246IHRoaXMuX2RpcmVjdGlvbmFsaXR5LFxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0T3ZlcmxheVBvc2l0aW9uU3RyYXRlZ3koKTogRmxleGlibGVDb25uZWN0ZWRQb3NpdGlvblN0cmF0ZWd5IHtcbiAgICByZXR1cm4gdGhpcy5fb3ZlcmxheVxuICAgICAgICAucG9zaXRpb24oKVxuICAgICAgICAuZmxleGlibGVDb25uZWN0ZWRUbyh0aGlzLl9lbGVtZW50UmVmKVxuICAgICAgICAud2l0aFBvc2l0aW9ucyh0aGlzLl9nZXRPdmVybGF5UG9zaXRpb25zKCkpO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0T3ZlcmxheVBvc2l0aW9ucygpOiBDb25uZWN0ZWRQb3NpdGlvbltdIHtcbiAgICByZXR1cm4gW1xuICAgICAge29yaWdpblg6ICdzdGFydCcsIG9yaWdpblk6ICdib3R0b20nLCBvdmVybGF5WDogJ3N0YXJ0Jywgb3ZlcmxheVk6ICd0b3AnfSxcbiAgICAgIHtvcmlnaW5YOiAnc3RhcnQnLCBvcmlnaW5ZOiAndG9wJywgb3ZlcmxheVg6ICdzdGFydCcsIG92ZXJsYXlZOiAnYm90dG9tJ30sXG4gICAgICB7b3JpZ2luWDogJ2VuZCcsIG9yaWdpblk6ICdib3R0b20nLCBvdmVybGF5WDogJ2VuZCcsIG92ZXJsYXlZOiAndG9wJ30sXG4gICAgICB7b3JpZ2luWDogJ2VuZCcsIG9yaWdpblk6ICd0b3AnLCBvdmVybGF5WDogJ2VuZCcsIG92ZXJsYXlZOiAnYm90dG9tJ30sXG4gICAgXTtcbiAgfVxuXG4gIHByaXZhdGUgX2dldFBhbmVsQ29udGVudCgpIHtcbiAgICBjb25zdCBoYXNQYW5lbENoYW5nZWQgPSB0aGlzLl9wYW5lbD8uX3RlbXBsYXRlUmVmICE9PSB0aGlzLl9wYW5lbENvbnRlbnQ/LnRlbXBsYXRlUmVmO1xuICAgIGlmICh0aGlzLl9wYW5lbCAmJiAoIXRoaXMuX3BhbmVsIHx8IGhhc1BhbmVsQ2hhbmdlZCkpIHtcbiAgICAgIHRoaXMuX3BhbmVsQ29udGVudCA9IG5ldyBUZW1wbGF0ZVBvcnRhbCh0aGlzLl9wYW5lbC5fdGVtcGxhdGVSZWYsIHRoaXMuX3ZpZXdDb250YWluZXJSZWYpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9wYW5lbENvbnRlbnQ7XG4gIH1cblxuICBwcml2YXRlIF9jb2VyY2VPcGVuQWN0aW9uUHJvcGVydHkoaW5wdXQ6IHN0cmluZyB8IE9wZW5BY3Rpb25bXSk6IE9wZW5BY3Rpb25bXSB7XG4gICAgbGV0IGFjdGlvbnMgPSB0eXBlb2YgaW5wdXQgPT09ICdzdHJpbmcnID8gaW5wdXQudHJpbSgpLnNwbGl0KC9bICxdKy8pIDogaW5wdXQ7XG4gICAgaWYgKGlzRGV2TW9kZSgpICYmIGFjdGlvbnMuc29tZShhID0+IGFsbG93ZWRPcGVuQWN0aW9ucy5pbmRleE9mKGEpID09PSAtMSkpIHtcbiAgICAgIHRocm93IEVycm9yKGAke2lucHV0fSBpcyBub3QgYSBzdXBwb3J0IG9wZW4gYWN0aW9uIGZvciBDZGtDb21ib2JveGApO1xuICAgIH1cbiAgICByZXR1cm4gYWN0aW9ucyBhcyBPcGVuQWN0aW9uW107XG4gIH1cblxuICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfb3BlbkFjdGlvbnM6IE9wZW5BY3Rpb25JbnB1dDtcbiAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2Rpc2FibGVkOiBCb29sZWFuSW5wdXQ7XG59XG4iXX0=