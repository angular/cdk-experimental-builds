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
import { coerceBooleanProperty } from '@angular/cdk/coercion';
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
    _setComboboxValue(value) {
        const valueChanged = (this.value !== value);
        this.value = value;
        if (valueChanged) {
            this.panelValueChanged.emit(value);
            this._setTextContent(value);
        }
    }
    _setTextContent(content) {
        if (typeof content === 'string') {
            this._elementRef.nativeElement.textContent = `${content}`;
        }
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
        let actions = [];
        if (typeof input === 'string') {
            actions.push(input);
        }
        else {
            actions = input;
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
                    '(click)': 'toggle()',
                    '[attr.aria-disabled]': 'disabled',
                    '[attr.aria-controls]': 'contentId',
                    '[attr.aria-haspopup]': 'contentType'
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tYm9ib3guanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrLWV4cGVyaW1lbnRhbC9jb21ib2JveC9jb21ib2JveC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFLSCxPQUFPLEVBRUwsU0FBUyxFQUNULFVBQVUsRUFDVixZQUFZLEVBQ1osS0FBSyxFQUVMLFFBQVEsRUFDUixNQUFNLEVBQUUsZ0JBQWdCLEVBQ3pCLE1BQU0sZUFBZSxDQUFDO0FBRXZCLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUNuRCxPQUFPLEVBR0wsT0FBTyxFQUNQLGFBQWEsRUFFZCxNQUFNLHNCQUFzQixDQUFDO0FBQzlCLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUNqRCxPQUFPLEVBQWUscUJBQXFCLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQWMxRSxNQUFNLE9BQU8sV0FBVztJQWdDdEIsWUFDbUIsV0FBb0MsRUFDcEMsUUFBaUIsRUFDZixpQkFBbUMsRUFDekIsZUFBZ0M7UUFINUMsZ0JBQVcsR0FBWCxXQUFXLENBQXlCO1FBQ3BDLGFBQVEsR0FBUixRQUFRLENBQVM7UUFDZixzQkFBaUIsR0FBakIsaUJBQWlCLENBQWtCO1FBQ3pCLG9CQUFlLEdBQWYsZUFBZSxDQUFpQjtRQXhCdkQsY0FBUyxHQUFZLEtBQUssQ0FBQztRQVMzQixpQkFBWSxHQUFpQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRVAsV0FBTSxHQUF1QixJQUFJLFlBQVksRUFBUSxDQUFDO1FBQ3RELFdBQU0sR0FBdUIsSUFBSSxZQUFZLEVBQVEsQ0FBQztRQUN4RCxzQkFBaUIsR0FBb0IsSUFBSSxZQUFZLEVBQUssQ0FBQztRQUlqRyxjQUFTLEdBQVcsRUFBRSxDQUFDO0lBUXBCLENBQUM7SUFwQ0osSUFDSSxLQUFLLEtBQXNDLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxD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bEIsU0FBUyxFQUFFLFVBQVU7b0JBQ3JCLHNCQUFzQixFQUFFLFVBQVU7b0JBQ2xDLHNCQUFzQixFQUFFLFdBQVc7b0JBQ25DLHNCQUFzQixFQUFFLGFBQWE7aUJBQ3RDO2FBQ0Y7OztZQTlCQyxVQUFVO1lBWVYsT0FBTztZQVBDLGdCQUFnQjtZQVdsQixjQUFjLHVCQW1EakIsUUFBUTs7O29CQW5DVixLQUFLLFNBQUMsdUJBQXVCO29CQUs3QixLQUFLO3VCQUdMLEtBQUs7MEJBS0wsS0FBSztxQkFTTCxNQUFNLFNBQUMscUJBQXFCO3FCQUM1QixNQUFNLFNBQUMscUJBQXFCO2dDQUM1QixNQUFNLFNBQUMsbUJBQW1CIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmV4cG9ydCB0eXBlIE9wZW5BY3Rpb24gPSAnZm9jdXMnIHwgJ2NsaWNrJyB8ICdkb3duS2V5JyB8ICd0b2dnbGUnO1xuZXhwb3J0IHR5cGUgT3BlbkFjdGlvbklucHV0ID0gT3BlbkFjdGlvbiB8IE9wZW5BY3Rpb25bXSB8IHN0cmluZyB8IG51bGwgfCB1bmRlZmluZWQ7XG5cbmltcG9ydCB7XG4gIEFmdGVyQ29udGVudEluaXQsXG4gIERpcmVjdGl2ZSxcbiAgRWxlbWVudFJlZixcbiAgRXZlbnRFbWl0dGVyLFxuICBJbnB1dCxcbiAgT25EZXN0cm95LFxuICBPcHRpb25hbCxcbiAgT3V0cHV0LCBWaWV3Q29udGFpbmVyUmVmXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtDZGtDb21ib2JveFBhbmVsLCBBcmlhSGFzUG9wdXBWYWx1ZX0gZnJvbSAnLi9jb21ib2JveC1wYW5lbCc7XG5pbXBvcnQge1RlbXBsYXRlUG9ydGFsfSBmcm9tICdAYW5ndWxhci9jZGsvcG9ydGFsJztcbmltcG9ydCB7XG4gIENvbm5lY3RlZFBvc2l0aW9uLFxuICBGbGV4aWJsZUNvbm5lY3RlZFBvc2l0aW9uU3RyYXRlZ3ksXG4gIE92ZXJsYXksXG4gIE92ZXJsYXlDb25maWcsXG4gIE92ZXJsYXlSZWZcbn0gZnJvbSAnQGFuZ3VsYXIvY2RrL292ZXJsYXknO1xuaW1wb3J0IHtEaXJlY3Rpb25hbGl0eX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2JpZGknO1xuaW1wb3J0IHtCb29sZWFuSW5wdXQsIGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvZXJjaW9uJztcblxuXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbY2RrQ29tYm9ib3hdJyxcbiAgZXhwb3J0QXM6ICdjZGtDb21ib2JveCcsXG4gIGhvc3Q6IHtcbiAgICAncm9sZSc6ICdjb21ib2JveCcsXG4gICAgJyhjbGljayknOiAndG9nZ2xlKCknLFxuICAgICdbYXR0ci5hcmlhLWRpc2FibGVkXSc6ICdkaXNhYmxlZCcsXG4gICAgJ1thdHRyLmFyaWEtY29udHJvbHNdJzogJ2NvbnRlbnRJZCcsXG4gICAgJ1thdHRyLmFyaWEtaGFzcG9wdXBdJzogJ2NvbnRlbnRUeXBlJ1xuICB9XG59KVxuZXhwb3J0IGNsYXNzIENka0NvbWJvYm94PFQgPSB1bmtub3duPiBpbXBsZW1lbnRzIE9uRGVzdHJveSwgQWZ0ZXJDb250ZW50SW5pdCB7XG4gIEBJbnB1dCgnY2RrQ29tYm9ib3hUcmlnZ2VyRm9yJylcbiAgZ2V0IHBhbmVsKCk6IENka0NvbWJvYm94UGFuZWw8VD4gfCB1bmRlZmluZWQgeyByZXR1cm4gdGhpcy5fcGFuZWw7IH1cbiAgc2V0IHBhbmVsKHBhbmVsOiBDZGtDb21ib2JveFBhbmVsPFQ+IHwgdW5kZWZpbmVkKSB7IHRoaXMuX3BhbmVsID0gcGFuZWw7IH1cbiAgcHJpdmF0ZSBfcGFuZWw6IENka0NvbWJvYm94UGFuZWw8VD4gfCB1bmRlZmluZWQ7XG5cbiAgQElucHV0KClcbiAgdmFsdWU6IFQ7XG5cbiAgQElucHV0KClcbiAgZ2V0IGRpc2FibGVkKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5fZGlzYWJsZWQ7IH1cbiAgc2V0IGRpc2FibGVkKHZhbHVlOiBib29sZWFuKSB7IHRoaXMuX2Rpc2FibGVkID0gY29lcmNlQm9vbGVhblByb3BlcnR5KHZhbHVlKTsgfVxuICBwcml2YXRlIF9kaXNhYmxlZDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIEBJbnB1dCgpXG4gIGdldCBvcGVuQWN0aW9ucygpOiBPcGVuQWN0aW9uW10ge1xuICAgIHJldHVybiB0aGlzLl9vcGVuQWN0aW9ucztcbiAgfVxuICBzZXQgb3BlbkFjdGlvbnMoYWN0aW9uOiBPcGVuQWN0aW9uW10pIHtcbiAgICB0aGlzLl9vcGVuQWN0aW9ucyA9IHRoaXMuX2NvZXJjZU9wZW5BY3Rpb25Qcm9wZXJ0eShhY3Rpb24pO1xuICB9XG4gIHByaXZhdGUgX29wZW5BY3Rpb25zOiBPcGVuQWN0aW9uW10gPSBbJ2NsaWNrJ107XG5cbiAgQE91dHB1dCgnY29tYm9ib3hQYW5lbE9wZW5lZCcpIHJlYWRvbmx5IG9wZW5lZDogRXZlbnRFbWl0dGVyPHZvaWQ+ID0gbmV3IEV2ZW50RW1pdHRlcjx2b2lkPigpO1xuICBAT3V0cHV0KCdjb21ib2JveFBhbmVsQ2xvc2VkJykgcmVhZG9ubHkgY2xvc2VkOiBFdmVudEVtaXR0ZXI8dm9pZD4gPSBuZXcgRXZlbnRFbWl0dGVyPHZvaWQ+KCk7XG4gIEBPdXRwdXQoJ3BhbmVsVmFsdWVDaGFuZ2VkJykgcmVhZG9ubHkgcGFuZWxWYWx1ZUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxUPiA9IG5ldyBFdmVudEVtaXR0ZXI8VD4oKTtcblxuICBwcml2YXRlIF9vdmVybGF5UmVmOiBPdmVybGF5UmVmO1xuICBwcml2YXRlIF9wYW5lbENvbnRlbnQ6IFRlbXBsYXRlUG9ydGFsO1xuICBjb250ZW50SWQ6IHN0cmluZyA9ICcnO1xuICBjb250ZW50VHlwZTogQXJpYUhhc1BvcHVwVmFsdWU7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSByZWFkb25seSBfZWxlbWVudFJlZjogRWxlbWVudFJlZjxIVE1MRWxlbWVudD4sXG4gICAgcHJpdmF0ZSByZWFkb25seSBfb3ZlcmxheTogT3ZlcmxheSxcbiAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgX3ZpZXdDb250YWluZXJSZWY6IFZpZXdDb250YWluZXJSZWYsXG4gICAgQE9wdGlvbmFsKCkgcHJpdmF0ZSByZWFkb25seSBfZGlyZWN0aW9uYWxpdHk/OiBEaXJlY3Rpb25hbGl0eVxuICApIHt9XG5cbiAgbmdBZnRlckNvbnRlbnRJbml0KCkge1xuICAgIHRoaXMuX3BhbmVsPy52YWx1ZVVwZGF0ZWQuc3Vic2NyaWJlKGRhdGEgPT4ge1xuICAgICAgdGhpcy5fc2V0Q29tYm9ib3hWYWx1ZShkYXRhKTtcbiAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICB9KTtcblxuICAgIHRoaXMuX3BhbmVsPy5jb250ZW50SWRVcGRhdGVkLnN1YnNjcmliZShpZCA9PiB7XG4gICAgICB0aGlzLmNvbnRlbnRJZCA9IGlkO1xuICAgIH0pO1xuXG4gICAgdGhpcy5fcGFuZWw/LmNvbnRlbnRUeXBlVXBkYXRlZC5zdWJzY3JpYmUodHlwZSA9PiB7XG4gICAgICB0aGlzLmNvbnRlbnRUeXBlID0gdHlwZTtcbiAgICB9KTtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIHRoaXMub3BlbmVkLmNvbXBsZXRlKCk7XG4gICAgdGhpcy5jbG9zZWQuY29tcGxldGUoKTtcbiAgICB0aGlzLnBhbmVsVmFsdWVDaGFuZ2VkLmNvbXBsZXRlKCk7XG4gIH1cblxuICAvKiogVG9nZ2xlcyB0aGUgb3BlbiBzdGF0ZSBvZiB0aGUgcGFuZWwuICovXG4gIHRvZ2dsZSgpIHtcbiAgICBpZiAodGhpcy5oYXNQYW5lbCgpKSB7XG4gICAgICB0aGlzLmlzT3BlbigpID8gdGhpcy5jbG9zZSgpIDogdGhpcy5vcGVuKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIElmIHRoZSBjb21ib2JveCBpcyBjbG9zZWQgYW5kIG5vdCBkaXNhYmxlZCwgb3BlbnMgdGhlIHBhbmVsLiAqL1xuICBvcGVuKCkge1xuICAgIGlmICghdGhpcy5pc09wZW4oKSAmJiAhdGhpcy5kaXNhYmxlZCkge1xuICAgICAgdGhpcy5vcGVuZWQubmV4dCgpO1xuICAgICAgdGhpcy5fb3ZlcmxheVJlZiA9IHRoaXMuX292ZXJsYXlSZWYgfHwgdGhpcy5fb3ZlcmxheS5jcmVhdGUodGhpcy5fZ2V0T3ZlcmxheUNvbmZpZygpKTtcbiAgICAgIHRoaXMuX292ZXJsYXlSZWYuYXR0YWNoKHRoaXMuX2dldFBhbmVsQ29udGVudCgpKTtcbiAgICB9XG4gIH1cblxuICAvKiogSWYgdGhlIGNvbWJvYm94IGlzIG9wZW4gYW5kIG5vdCBkaXNhYmxlZCwgY2xvc2VzIHRoZSBwYW5lbC4gKi9cbiAgY2xvc2UoKSB7XG4gICAgaWYgKHRoaXMuaXNPcGVuKCkgJiYgIXRoaXMuZGlzYWJsZWQpIHtcbiAgICAgIHRoaXMuY2xvc2VkLm5leHQoKTtcbiAgICAgIHRoaXMuX292ZXJsYXlSZWYuZGV0YWNoKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFJldHVybnMgdHJ1ZSBpZiBwYW5lbCBpcyBjdXJyZW50bHkgb3BlbmVkLiAqL1xuICBpc09wZW4oKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX292ZXJsYXlSZWYgPyB0aGlzLl9vdmVybGF5UmVmLmhhc0F0dGFjaGVkKCkgOiBmYWxzZTtcbiAgfVxuXG4gIC8qKiBSZXR1cm5zIHRydWUgaWYgY29tYm9ib3ggaGFzIGEgY2hpbGQgcGFuZWwuICovXG4gIGhhc1BhbmVsKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAhIXRoaXMucGFuZWw7XG4gIH1cblxuICBwcml2YXRlIF9zZXRDb21ib2JveFZhbHVlKHZhbHVlOiBUKSB7XG4gICAgY29uc3QgdmFsdWVDaGFuZ2VkID0gKHRoaXMudmFsdWUgIT09IHZhbHVlKTtcbiAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG5cbiAgICBpZiAodmFsdWVDaGFuZ2VkKSB7XG4gICAgICB0aGlzLnBhbmVsVmFsdWVDaGFuZ2VkLmVtaXQodmFsdWUpO1xuICAgICAgdGhpcy5fc2V0VGV4dENvbnRlbnQodmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3NldFRleHRDb250ZW50KGNvbnRlbnQ6IFQpIHtcbiAgICBpZiAodHlwZW9mIGNvbnRlbnQgPT09ICdzdHJpbmcnKSB7XG4gICAgICB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQudGV4dENvbnRlbnQgPSBgJHtjb250ZW50fWA7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0T3ZlcmxheUNvbmZpZygpIHtcbiAgICByZXR1cm4gbmV3IE92ZXJsYXlDb25maWcoe1xuICAgICAgcG9zaXRpb25TdHJhdGVneTogdGhpcy5fZ2V0T3ZlcmxheVBvc2l0aW9uU3RyYXRlZ3koKSxcbiAgICAgIHNjcm9sbFN0cmF0ZWd5OiB0aGlzLl9vdmVybGF5LnNjcm9sbFN0cmF0ZWdpZXMuYmxvY2soKSxcbiAgICAgIGRpcmVjdGlvbjogdGhpcy5fZGlyZWN0aW9uYWxpdHksXG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIF9nZXRPdmVybGF5UG9zaXRpb25TdHJhdGVneSgpOiBGbGV4aWJsZUNvbm5lY3RlZFBvc2l0aW9uU3RyYXRlZ3kge1xuICAgIHJldHVybiB0aGlzLl9vdmVybGF5XG4gICAgICAgIC5wb3NpdGlvbigpXG4gICAgICAgIC5mbGV4aWJsZUNvbm5lY3RlZFRvKHRoaXMuX2VsZW1lbnRSZWYpXG4gICAgICAgIC53aXRoUG9zaXRpb25zKHRoaXMuX2dldE92ZXJsYXlQb3NpdGlvbnMoKSk7XG4gIH1cblxuICBwcml2YXRlIF9nZXRPdmVybGF5UG9zaXRpb25zKCk6IENvbm5lY3RlZFBvc2l0aW9uW10ge1xuICAgIHJldHVybiBbXG4gICAgICB7b3JpZ2luWDogJ3N0YXJ0Jywgb3JpZ2luWTogJ2JvdHRvbScsIG92ZXJsYXlYOiAnc3RhcnQnLCBvdmVybGF5WTogJ3RvcCd9LFxuICAgICAge29yaWdpblg6ICdzdGFydCcsIG9yaWdpblk6ICd0b3AnLCBvdmVybGF5WDogJ3N0YXJ0Jywgb3ZlcmxheVk6ICdib3R0b20nfSxcbiAgICAgIHtvcmlnaW5YOiAnZW5kJywgb3JpZ2luWTogJ2JvdHRvbScsIG92ZXJsYXlYOiAnZW5kJywgb3ZlcmxheVk6ICd0b3AnfSxcbiAgICAgIHtvcmlnaW5YOiAnZW5kJywgb3JpZ2luWTogJ3RvcCcsIG92ZXJsYXlYOiAnZW5kJywgb3ZlcmxheVk6ICdib3R0b20nfSxcbiAgICBdO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0UGFuZWxDb250ZW50KCkge1xuICAgIGNvbnN0IGhhc1BhbmVsQ2hhbmdlZCA9IHRoaXMuX3BhbmVsPy5fdGVtcGxhdGVSZWYgIT09IHRoaXMuX3BhbmVsQ29udGVudD8udGVtcGxhdGVSZWY7XG4gICAgaWYgKHRoaXMuX3BhbmVsICYmICghdGhpcy5fcGFuZWwgfHwgaGFzUGFuZWxDaGFuZ2VkKSkge1xuICAgICAgdGhpcy5fcGFuZWxDb250ZW50ID0gbmV3IFRlbXBsYXRlUG9ydGFsKHRoaXMuX3BhbmVsLl90ZW1wbGF0ZVJlZiwgdGhpcy5fdmlld0NvbnRhaW5lclJlZik7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX3BhbmVsQ29udGVudDtcbiAgfVxuXG4gIHByaXZhdGUgX2NvZXJjZU9wZW5BY3Rpb25Qcm9wZXJ0eShpbnB1dDogc3RyaW5nIHwgT3BlbkFjdGlvbltdKTogT3BlbkFjdGlvbltdIHtcbiAgICBsZXQgYWN0aW9uczogT3BlbkFjdGlvbltdID0gW107XG4gICAgaWYgKHR5cGVvZiBpbnB1dCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGFjdGlvbnMucHVzaChpbnB1dCBhcyBPcGVuQWN0aW9uKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYWN0aW9ucyA9IGlucHV0O1xuICAgIH1cbiAgICByZXR1cm4gYWN0aW9ucztcbiAgfVxuXG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9vcGVuQWN0aW9uczogT3BlbkFjdGlvbklucHV0O1xuICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZGlzYWJsZWQ6IEJvb2xlYW5JbnB1dDtcbn1cbiJdfQ==