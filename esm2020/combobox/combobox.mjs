import { Directive, ElementRef, EventEmitter, Input, Optional, Output, ViewContainerRef } from '@angular/core';
import { TemplatePortal } from '@angular/cdk/portal';
import { Overlay, OverlayConfig } from '@angular/cdk/overlay';
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
CdkCombobox.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.0-next.15", ngImport: i0, type: CdkCombobox, deps: [{ token: i0.ElementRef }, { token: i1.Overlay }, { token: i0.ViewContainerRef }, { token: i2.Directionality, optional: true }], target: i0.ɵɵFactoryTarget.Directive });
CdkCombobox.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "13.0.0-next.15", type: CdkCombobox, selector: "[cdkCombobox]", inputs: { panel: ["cdkComboboxTriggerFor", "panel"], value: "value", disabled: "disabled", openActions: "openActions", autoSetText: "autoSetText" }, outputs: { opened: "comboboxPanelOpened", closed: "comboboxPanelClosed", panelValueChanged: "panelValueChanged" }, host: { attributes: { "role": "combobox" }, listeners: { "click": "_handleInteractions(\"click\")", "focus": "_handleInteractions(\"focus\")", "keydown": "_keydown($event)", "document:click": "_attemptClose($event)" }, properties: { "attr.aria-disabled": "disabled", "attr.aria-owns": "contentId", "attr.aria-haspopup": "contentType", "attr.aria-expanded": "isOpen()", "attr.tabindex": "_getTabIndex()" }, classAttribute: "cdk-combobox" }, exportAs: ["cdkCombobox"], ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.0-next.15", ngImport: i0, type: CdkCombobox, decorators: [{
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
                        '[attr.tabindex]': '_getTabIndex()'
                    }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tYm9ib3guanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrLWV4cGVyaW1lbnRhbC9jb21ib2JveC9jb21ib2JveC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFZQSxPQUFPLEVBRUwsU0FBUyxFQUNULFVBQVUsRUFDVixZQUFZLEVBQ1osS0FBSyxFQUVMLFFBQVEsRUFDUixNQUFNLEVBQUUsZ0JBQWdCLEVBQ3pCLE1BQU0sZUFBZSxDQUFDO0FBRXZCLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUNuRCxPQUFPLEVBR0wsT0FBTyxFQUNQLGFBQWEsRUFFZCxNQUFNLHNCQUFzQixDQUFDO0FBQzlCLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUNqRCxPQUFPLEVBQWUscUJBQXFCLEVBQUUsV0FBVyxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDdkYsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQ3RELE9BQU8sRUFBQyxVQUFVLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQzs7OztBQUVyRSxNQUFNLGtCQUFrQixHQUFHLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFtQm5FLE1BQU0sT0FBTyxXQUFXO0lBdUN0QixZQUNtQixXQUFvQyxFQUNwQyxRQUFpQixFQUNmLGlCQUFtQyxFQUN6QixlQUFnQztRQUg1QyxnQkFBVyxHQUFYLFdBQVcsQ0FBeUI7UUFDcEMsYUFBUSxHQUFSLFFBQVEsQ0FBUztRQUNmLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBa0I7UUFDekIsb0JBQWUsR0FBZixlQUFlLENBQWlCO1FBL0J2RCxjQUFTLEdBQVksS0FBSyxDQUFDO1FBUzNCLGlCQUFZLEdBQWlCLENBQUMsT0FBTyxDQUFDLENBQUM7UUFNdkMsaUJBQVksR0FBWSxJQUFJLENBQUM7UUFFRyxXQUFNLEdBQXVCLElBQUksWUFBWSxFQUFRLENBQUM7UUFDdEQsV0FBTSxHQUF1QixJQUFJLFlBQVksRUFBUSxDQUFDO1FBQ3hELHNCQUFpQixHQUNqRCxJQUFJLFlBQVksRUFBTyxDQUFDO1FBSTlCLGNBQVMsR0FBVyxFQUFFLENBQUM7SUFRcEIsQ0FBQztJQTNDSixJQUNJLEtBQUssS0FBc0MsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUNwRSxJQUFJLEtBQUssQ0FBQyxLQUFzQyxJQUFJLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQztJQU0xRSxJQUNJLFFBQVEsS0FBYyxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO0lBQ2xELElBQUksUUFBUSxDQUFDLEtBQWMsSUFBSSxJQUFJLENBQUMsU0FBUyxHQUFHLHFCQUFxQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUcvRSxJQUNJLFdBQVc7UUFDYixPQUFPLElBQUksQ0FBQyxZQUFZLENBQUM7SUFDM0IsQ0FBQztJQUNELElBQUksV0FBVyxDQUFDLE1BQW9CO1FBQ2xDLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLHlCQUF5QixDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQzdELENBQUM7SUFHRCwwRkFBMEY7SUFDMUYsSUFDSSxXQUFXLEtBQWMsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztJQUN4RCxJQUFJLFdBQVcsQ0FBQyxLQUFjLElBQUksSUFBSSxDQUFDLFlBQVksR0FBRyxxQkFBcUIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFvQnJGLGtCQUFrQjtRQUNoQixJQUFJLENBQUMsTUFBTSxFQUFFLFlBQVksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDekMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzdCLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNmLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLE1BQU0sRUFBRSxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLEVBQUU7WUFDM0MsSUFBSSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7UUFDdEIsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsTUFBTSxFQUFFLGtCQUFrQixDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUMvQyxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztRQUMxQixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCxXQUFXO1FBQ1QsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFO1lBQ3BCLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLENBQUM7U0FDNUI7UUFFRCxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDdkIsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ3BDLENBQUM7SUFFRCxRQUFRLENBQUMsS0FBb0I7UUFDM0IsTUFBTSxFQUFDLE9BQU8sRUFBQyxHQUFHLEtBQUssQ0FBQztRQUV4QixJQUFJLE9BQU8sS0FBSyxVQUFVLEVBQUU7WUFDMUIsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLEVBQUU7Z0JBQ2pCLElBQUksQ0FBQyxNQUFNLEVBQUUsWUFBWSxFQUFFLENBQUM7YUFDN0I7aUJBQU0sSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtnQkFDdEQsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO2FBQ2I7U0FDRjthQUFNLElBQUksT0FBTyxLQUFLLEtBQUssRUFBRTtZQUM1QixJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO2dCQUM5QyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7YUFDZjtpQkFBTSxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO2dCQUNwRCxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7YUFDYjtTQUVGO2FBQU0sSUFBSSxPQUFPLEtBQUssTUFBTSxFQUFFO1lBQzdCLEtBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUN2QixJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7U0FDZDthQUFNLElBQUksT0FBTyxLQUFLLEdBQUcsRUFBRTtZQUMxQixJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7U0FDZDtJQUNILENBQUM7SUFFRCwyQ0FBMkM7SUFDM0MsbUJBQW1CLENBQUMsV0FBdUI7UUFDekMsSUFBSSxXQUFXLEtBQUssT0FBTyxFQUFFO1lBQzNCLElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7Z0JBQzlDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQzthQUNmO2lCQUFNLElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7Z0JBQ3BELElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQzthQUNiO1NBQ0Y7YUFBTSxJQUFJLFdBQVcsS0FBSyxPQUFPLEVBQUU7WUFDbEMsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtnQkFDN0MsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO2FBQ2I7U0FDRjtJQUNILENBQUM7SUFFRCxvRkFBb0Y7SUFDcEYsYUFBYSxDQUFDLEtBQWlCO1FBQzdCLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFFO1lBQ2pCLElBQUksTUFBTSxHQUFHLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNwQyxPQUFPLE1BQU0sWUFBWSxPQUFPLEVBQUU7Z0JBQ2hDLElBQUksTUFBTSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7b0JBQ25ELE9BQU87aUJBQ1I7Z0JBQ0QsTUFBTSxHQUFHLE1BQU0sQ0FBQyxhQUFhLENBQUM7YUFDL0I7U0FDRjtRQUVELElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNmLENBQUM7SUFFRCwyQ0FBMkM7SUFDM0MsTUFBTTtRQUNKLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRSxFQUFFO1lBQ25CLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7U0FDNUM7SUFDSCxDQUFDO0lBRUQsbUVBQW1FO0lBQ25FLElBQUk7UUFDRixJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNwQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ25CLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVcsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDO1lBQ3RGLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUM7WUFDakQsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsRUFBRTtnQkFDMUIsSUFBSSxDQUFDLE1BQU0sRUFBRSxZQUFZLEVBQUUsQ0FBQzthQUM3QjtTQUNGO0lBQ0gsQ0FBQztJQUVELGtFQUFrRTtJQUNsRSxLQUFLO1FBQ0gsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ25DLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDbkIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsQ0FBQztTQUMzQjtJQUNILENBQUM7SUFFRCxpREFBaUQ7SUFDakQsTUFBTTtRQUNKLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO0lBQ25FLENBQUM7SUFFRCxrREFBa0Q7SUFDbEQsUUFBUTtRQUNOLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7SUFDdEIsQ0FBQztJQUVELFlBQVk7UUFDVixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO0lBQ3BDLENBQUM7SUFFTyxpQkFBaUIsQ0FBQyxLQUFjO1FBRXRDLE1BQU0sWUFBWSxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssS0FBSyxLQUFLLENBQUMsQ0FBQztRQUM1QyxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUVuQixJQUFJLFlBQVksRUFBRTtZQUNoQixJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQ2hELElBQUksSUFBSSxDQUFDLFlBQVksRUFBRTtnQkFDckIsSUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUM3QjtTQUNGO0lBQ0gsQ0FBQztJQUVPLGVBQWUsQ0FBQyxPQUFnQjtRQUN0QyxNQUFNLFlBQVksR0FBRyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDMUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsV0FBVyxHQUFHLFlBQVksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDdEUsQ0FBQztJQUVPLGNBQWM7UUFDcEIsd0RBQXdEO1FBQ3hELE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUNyRSxPQUFPLE9BQU8sS0FBSyxPQUFPLElBQUksT0FBTyxLQUFLLFVBQVUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7SUFDdEUsQ0FBQztJQUVPLGlCQUFpQjtRQUN2QixPQUFPLElBQUksYUFBYSxDQUFDO1lBQ3ZCLGdCQUFnQixFQUFFLElBQUksQ0FBQywyQkFBMkIsRUFBRTtZQUNwRCxjQUFjLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLEVBQUU7WUFDdEQsU0FBUyxFQUFFLElBQUksQ0FBQyxlQUFlO1NBQ2hDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFTywyQkFBMkI7UUFDakMsT0FBTyxJQUFJLENBQUMsUUFBUTthQUNmLFFBQVEsRUFBRTthQUNWLG1CQUFtQixDQUFDLElBQUksQ0FBQyxXQUFXLENBQUM7YUFDckMsYUFBYSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLENBQUM7SUFDbEQsQ0FBQztJQUVPLG9CQUFvQjtRQUMxQixPQUFPO1lBQ0wsRUFBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFDO1lBQ3pFLEVBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBQztZQUN6RSxFQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUM7WUFDckUsRUFBQyxPQUFPLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFDO1NBQ3RFLENBQUM7SUFDSixDQUFDO0lBRU8sZ0JBQWdCO1FBQ3RCLE1BQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsWUFBWSxLQUFLLElBQUksQ0FBQyxhQUFhLEVBQUUsV0FBVyxDQUFDO1FBQ3RGLElBQUksSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sSUFBSSxlQUFlLENBQUMsRUFBRTtZQUNwRCxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksY0FBYyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1NBQzNGO1FBRUQsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDO0lBQzVCLENBQUM7SUFFTyx5QkFBeUIsQ0FBQyxLQUE0QjtRQUM1RCxJQUFJLE9BQU8sR0FBRyxPQUFPLEtBQUssS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUM5RSxJQUFJLENBQUMsT0FBTyxTQUFTLEtBQUssV0FBVyxJQUFJLFNBQVMsQ0FBQztZQUNqRCxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDekQsTUFBTSxLQUFLLENBQUMsR0FBRyxLQUFLLCtDQUErQyxDQUFDLENBQUM7U0FDdEU7UUFDRCxPQUFPLE9BQXVCLENBQUM7SUFDakMsQ0FBQzs7Z0hBdE9VLFdBQVc7b0dBQVgsV0FBVzttR0FBWCxXQUFXO2tCQWpCdkIsU0FBUzttQkFBQztvQkFDVCxRQUFRLEVBQUUsZUFBZTtvQkFDekIsUUFBUSxFQUFFLGFBQWE7b0JBQ3ZCLElBQUksRUFBRTt3QkFDSixNQUFNLEVBQUUsVUFBVTt3QkFDbEIsT0FBTyxFQUFFLGNBQWM7d0JBQ3ZCLFNBQVMsRUFBRSw4QkFBOEI7d0JBQ3pDLFNBQVMsRUFBRSw4QkFBOEI7d0JBQ3pDLFdBQVcsRUFBRSxrQkFBa0I7d0JBQy9CLGtCQUFrQixFQUFFLHVCQUF1Qjt3QkFDM0Msc0JBQXNCLEVBQUUsVUFBVTt3QkFDbEMsa0JBQWtCLEVBQUUsV0FBVzt3QkFDL0Isc0JBQXNCLEVBQUUsYUFBYTt3QkFDckMsc0JBQXNCLEVBQUUsVUFBVTt3QkFDbEMsaUJBQWlCLEVBQUUsZ0JBQWdCO3FCQUNwQztpQkFDRjs7MEJBNENJLFFBQVE7NENBekNQLEtBQUs7c0JBRFIsS0FBSzt1QkFBQyx1QkFBdUI7Z0JBTTlCLEtBQUs7c0JBREosS0FBSztnQkFJRixRQUFRO3NCQURYLEtBQUs7Z0JBTUYsV0FBVztzQkFEZCxLQUFLO2dCQVdGLFdBQVc7c0JBRGQsS0FBSztnQkFLa0MsTUFBTTtzQkFBN0MsTUFBTTt1QkFBQyxxQkFBcUI7Z0JBQ1csTUFBTTtzQkFBN0MsTUFBTTt1QkFBQyxxQkFBcUI7Z0JBQ1MsaUJBQWlCO3NCQUF0RCxNQUFNO3VCQUFDLG1CQUFtQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5cbmV4cG9ydCB0eXBlIE9wZW5BY3Rpb24gPSAnZm9jdXMnIHwgJ2NsaWNrJyB8ICdkb3duS2V5JyB8ICd0b2dnbGUnO1xuZXhwb3J0IHR5cGUgT3BlbkFjdGlvbklucHV0ID0gT3BlbkFjdGlvbiB8IE9wZW5BY3Rpb25bXSB8IHN0cmluZyB8IG51bGwgfCB1bmRlZmluZWQ7XG5cbmltcG9ydCB7XG4gIEFmdGVyQ29udGVudEluaXQsXG4gIERpcmVjdGl2ZSxcbiAgRWxlbWVudFJlZixcbiAgRXZlbnRFbWl0dGVyLFxuICBJbnB1dCxcbiAgT25EZXN0cm95LFxuICBPcHRpb25hbCxcbiAgT3V0cHV0LCBWaWV3Q29udGFpbmVyUmVmXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtDZGtDb21ib2JveFBhbmVsLCBBcmlhSGFzUG9wdXBWYWx1ZX0gZnJvbSAnLi9jb21ib2JveC1wYW5lbCc7XG5pbXBvcnQge1RlbXBsYXRlUG9ydGFsfSBmcm9tICdAYW5ndWxhci9jZGsvcG9ydGFsJztcbmltcG9ydCB7XG4gIENvbm5lY3RlZFBvc2l0aW9uLFxuICBGbGV4aWJsZUNvbm5lY3RlZFBvc2l0aW9uU3RyYXRlZ3ksXG4gIE92ZXJsYXksXG4gIE92ZXJsYXlDb25maWcsXG4gIE92ZXJsYXlSZWZcbn0gZnJvbSAnQGFuZ3VsYXIvY2RrL292ZXJsYXknO1xuaW1wb3J0IHtEaXJlY3Rpb25hbGl0eX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2JpZGknO1xuaW1wb3J0IHtCb29sZWFuSW5wdXQsIGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eSwgY29lcmNlQXJyYXl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2VyY2lvbic7XG5pbXBvcnQge19nZXRFdmVudFRhcmdldH0gZnJvbSAnQGFuZ3VsYXIvY2RrL3BsYXRmb3JtJztcbmltcG9ydCB7RE9XTl9BUlJPVywgRU5URVIsIEVTQ0FQRSwgVEFCfSBmcm9tICdAYW5ndWxhci9jZGsva2V5Y29kZXMnO1xuXG5jb25zdCBhbGxvd2VkT3BlbkFjdGlvbnMgPSBbJ2ZvY3VzJywgJ2NsaWNrJywgJ2Rvd25LZXknLCAndG9nZ2xlJ107XG5cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tjZGtDb21ib2JveF0nLFxuICBleHBvcnRBczogJ2Nka0NvbWJvYm94JyxcbiAgaG9zdDoge1xuICAgICdyb2xlJzogJ2NvbWJvYm94JyxcbiAgICAnY2xhc3MnOiAnY2RrLWNvbWJvYm94JyxcbiAgICAnKGNsaWNrKSc6ICdfaGFuZGxlSW50ZXJhY3Rpb25zKFwiY2xpY2tcIiknLFxuICAgICcoZm9jdXMpJzogJ19oYW5kbGVJbnRlcmFjdGlvbnMoXCJmb2N1c1wiKScsXG4gICAgJyhrZXlkb3duKSc6ICdfa2V5ZG93bigkZXZlbnQpJyxcbiAgICAnKGRvY3VtZW50OmNsaWNrKSc6ICdfYXR0ZW1wdENsb3NlKCRldmVudCknLFxuICAgICdbYXR0ci5hcmlhLWRpc2FibGVkXSc6ICdkaXNhYmxlZCcsXG4gICAgJ1thdHRyLmFyaWEtb3duc10nOiAnY29udGVudElkJyxcbiAgICAnW2F0dHIuYXJpYS1oYXNwb3B1cF0nOiAnY29udGVudFR5cGUnLFxuICAgICdbYXR0ci5hcmlhLWV4cGFuZGVkXSc6ICdpc09wZW4oKScsXG4gICAgJ1thdHRyLnRhYmluZGV4XSc6ICdfZ2V0VGFiSW5kZXgoKSdcbiAgfVxufSlcbmV4cG9ydCBjbGFzcyBDZGtDb21ib2JveDxUID0gdW5rbm93bj4gaW1wbGVtZW50cyBPbkRlc3Ryb3ksIEFmdGVyQ29udGVudEluaXQge1xuICBASW5wdXQoJ2Nka0NvbWJvYm94VHJpZ2dlckZvcicpXG4gIGdldCBwYW5lbCgpOiBDZGtDb21ib2JveFBhbmVsPFQ+IHwgdW5kZWZpbmVkIHsgcmV0dXJuIHRoaXMuX3BhbmVsOyB9XG4gIHNldCBwYW5lbChwYW5lbDogQ2RrQ29tYm9ib3hQYW5lbDxUPiB8IHVuZGVmaW5lZCkgeyB0aGlzLl9wYW5lbCA9IHBhbmVsOyB9XG4gIHByaXZhdGUgX3BhbmVsOiBDZGtDb21ib2JveFBhbmVsPFQ+IHwgdW5kZWZpbmVkO1xuXG4gIEBJbnB1dCgpXG4gIHZhbHVlOiBUIHwgVFtdO1xuXG4gIEBJbnB1dCgpXG4gIGdldCBkaXNhYmxlZCgpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuX2Rpc2FibGVkOyB9XG4gIHNldCBkaXNhYmxlZCh2YWx1ZTogYm9vbGVhbikgeyB0aGlzLl9kaXNhYmxlZCA9IGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eSh2YWx1ZSk7IH1cbiAgcHJpdmF0ZSBfZGlzYWJsZWQ6IGJvb2xlYW4gPSBmYWxzZTtcblxuICBASW5wdXQoKVxuICBnZXQgb3BlbkFjdGlvbnMoKTogT3BlbkFjdGlvbltdIHtcbiAgICByZXR1cm4gdGhpcy5fb3BlbkFjdGlvbnM7XG4gIH1cbiAgc2V0IG9wZW5BY3Rpb25zKGFjdGlvbjogT3BlbkFjdGlvbltdKSB7XG4gICAgdGhpcy5fb3BlbkFjdGlvbnMgPSB0aGlzLl9jb2VyY2VPcGVuQWN0aW9uUHJvcGVydHkoYWN0aW9uKTtcbiAgfVxuICBwcml2YXRlIF9vcGVuQWN0aW9uczogT3BlbkFjdGlvbltdID0gWydjbGljayddO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSB0ZXh0Q29udGVudCBpcyBhdXRvbWF0aWNhbGx5IHVwZGF0ZWQgdXBvbiBjaGFuZ2Ugb2YgdGhlIGNvbWJvYm94IHZhbHVlLiAqL1xuICBASW5wdXQoKVxuICBnZXQgYXV0b1NldFRleHQoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLl9hdXRvU2V0VGV4dDsgfVxuICBzZXQgYXV0b1NldFRleHQodmFsdWU6IGJvb2xlYW4pIHsgdGhpcy5fYXV0b1NldFRleHQgPSBjb2VyY2VCb29sZWFuUHJvcGVydHkodmFsdWUpOyB9XG4gIHByaXZhdGUgX2F1dG9TZXRUZXh0OiBib29sZWFuID0gdHJ1ZTtcblxuICBAT3V0cHV0KCdjb21ib2JveFBhbmVsT3BlbmVkJykgcmVhZG9ubHkgb3BlbmVkOiBFdmVudEVtaXR0ZXI8dm9pZD4gPSBuZXcgRXZlbnRFbWl0dGVyPHZvaWQ+KCk7XG4gIEBPdXRwdXQoJ2NvbWJvYm94UGFuZWxDbG9zZWQnKSByZWFkb25seSBjbG9zZWQ6IEV2ZW50RW1pdHRlcjx2b2lkPiA9IG5ldyBFdmVudEVtaXR0ZXI8dm9pZD4oKTtcbiAgQE91dHB1dCgncGFuZWxWYWx1ZUNoYW5nZWQnKSByZWFkb25seSBwYW5lbFZhbHVlQ2hhbmdlZDogRXZlbnRFbWl0dGVyPFRbXT5cbiAgICAgID0gbmV3IEV2ZW50RW1pdHRlcjxUW10+KCk7XG5cbiAgcHJpdmF0ZSBfb3ZlcmxheVJlZjogT3ZlcmxheVJlZjtcbiAgcHJpdmF0ZSBfcGFuZWxDb250ZW50OiBUZW1wbGF0ZVBvcnRhbDtcbiAgY29udGVudElkOiBzdHJpbmcgPSAnJztcbiAgY29udGVudFR5cGU6IEFyaWFIYXNQb3B1cFZhbHVlO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgcmVhZG9ubHkgX2VsZW1lbnRSZWY6IEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+LFxuICAgIHByaXZhdGUgcmVhZG9ubHkgX292ZXJsYXk6IE92ZXJsYXksXG4gICAgcHJvdGVjdGVkIHJlYWRvbmx5IF92aWV3Q29udGFpbmVyUmVmOiBWaWV3Q29udGFpbmVyUmVmLFxuICAgIEBPcHRpb25hbCgpIHByaXZhdGUgcmVhZG9ubHkgX2RpcmVjdGlvbmFsaXR5PzogRGlyZWN0aW9uYWxpdHlcbiAgKSB7fVxuXG4gIG5nQWZ0ZXJDb250ZW50SW5pdCgpIHtcbiAgICB0aGlzLl9wYW5lbD8udmFsdWVVcGRhdGVkLnN1YnNjcmliZShkYXRhID0+IHtcbiAgICAgIHRoaXMuX3NldENvbWJvYm94VmFsdWUoZGF0YSk7XG4gICAgICB0aGlzLmNsb3NlKCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLl9wYW5lbD8uY29udGVudElkVXBkYXRlZC5zdWJzY3JpYmUoaWQgPT4ge1xuICAgICAgdGhpcy5jb250ZW50SWQgPSBpZDtcbiAgICB9KTtcblxuICAgIHRoaXMuX3BhbmVsPy5jb250ZW50VHlwZVVwZGF0ZWQuc3Vic2NyaWJlKHR5cGUgPT4ge1xuICAgICAgdGhpcy5jb250ZW50VHlwZSA9IHR5cGU7XG4gICAgfSk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICBpZiAodGhpcy5fb3ZlcmxheVJlZikge1xuICAgICAgdGhpcy5fb3ZlcmxheVJlZi5kaXNwb3NlKCk7XG4gICAgfVxuXG4gICAgdGhpcy5vcGVuZWQuY29tcGxldGUoKTtcbiAgICB0aGlzLmNsb3NlZC5jb21wbGV0ZSgpO1xuICAgIHRoaXMucGFuZWxWYWx1ZUNoYW5nZWQuY29tcGxldGUoKTtcbiAgfVxuXG4gIF9rZXlkb3duKGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XG4gICAgY29uc3Qge2tleUNvZGV9ID0gZXZlbnQ7XG5cbiAgICBpZiAoa2V5Q29kZSA9PT0gRE9XTl9BUlJPVykge1xuICAgICAgaWYgKHRoaXMuaXNPcGVuKCkpIHtcbiAgICAgICAgdGhpcy5fcGFuZWw/LmZvY3VzQ29udGVudCgpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLl9vcGVuQWN0aW9ucy5pbmRleE9mKCdkb3duS2V5JykgIT09IC0xKSB7XG4gICAgICAgIHRoaXMub3BlbigpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoa2V5Q29kZSA9PT0gRU5URVIpIHtcbiAgICAgIGlmICh0aGlzLl9vcGVuQWN0aW9ucy5pbmRleE9mKCd0b2dnbGUnKSAhPT0gLTEpIHtcbiAgICAgICAgdGhpcy50b2dnbGUoKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5fb3BlbkFjdGlvbnMuaW5kZXhPZignY2xpY2snKSAhPT0gLTEpIHtcbiAgICAgICAgdGhpcy5vcGVuKCk7XG4gICAgICB9XG5cbiAgICB9IGVsc2UgaWYgKGtleUNvZGUgPT09IEVTQ0FQRSkge1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICB9IGVsc2UgaWYgKGtleUNvZGUgPT09IFRBQikge1xuICAgICAgdGhpcy5jbG9zZSgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBIYW5kbGVzIGNsaWNrIG9yIGZvY3VzIGludGVyYWN0aW9ucy4gKi9cbiAgX2hhbmRsZUludGVyYWN0aW9ucyhpbnRlcmFjdGlvbjogT3BlbkFjdGlvbikge1xuICAgIGlmIChpbnRlcmFjdGlvbiA9PT0gJ2NsaWNrJykge1xuICAgICAgaWYgKHRoaXMuX29wZW5BY3Rpb25zLmluZGV4T2YoJ3RvZ2dsZScpICE9PSAtMSkge1xuICAgICAgICB0aGlzLnRvZ2dsZSgpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLl9vcGVuQWN0aW9ucy5pbmRleE9mKCdjbGljaycpICE9PSAtMSkge1xuICAgICAgICB0aGlzLm9wZW4oKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGludGVyYWN0aW9uID09PSAnZm9jdXMnKSB7XG4gICAgICBpZiAodGhpcy5fb3BlbkFjdGlvbnMuaW5kZXhPZignZm9jdXMnKSAhPT0gLTEpIHtcbiAgICAgICAgdGhpcy5vcGVuKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqIEdpdmVuIGEgY2xpY2sgaW4gdGhlIGRvY3VtZW50LCBkZXRlcm1pbmVzIGlmIHRoZSBjbGljayB3YXMgaW5zaWRlIGEgY29tYm9ib3guICovXG4gIF9hdHRlbXB0Q2xvc2UoZXZlbnQ6IE1vdXNlRXZlbnQpIHtcbiAgICBpZiAodGhpcy5pc09wZW4oKSkge1xuICAgICAgbGV0IHRhcmdldCA9IF9nZXRFdmVudFRhcmdldChldmVudCk7XG4gICAgICB3aGlsZSAodGFyZ2V0IGluc3RhbmNlb2YgRWxlbWVudCkge1xuICAgICAgICBpZiAodGFyZ2V0LmNsYXNzTmFtZS5pbmRleE9mKCdjZGstY29tYm9ib3gnKSAhPT0gLTEpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGFyZ2V0ID0gdGFyZ2V0LnBhcmVudEVsZW1lbnQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5jbG9zZSgpO1xuICB9XG5cbiAgLyoqIFRvZ2dsZXMgdGhlIG9wZW4gc3RhdGUgb2YgdGhlIHBhbmVsLiAqL1xuICB0b2dnbGUoKSB7XG4gICAgaWYgKHRoaXMuaGFzUGFuZWwoKSkge1xuICAgICAgdGhpcy5pc09wZW4oKSA/IHRoaXMuY2xvc2UoKSA6IHRoaXMub3BlbigpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBJZiB0aGUgY29tYm9ib3ggaXMgY2xvc2VkIGFuZCBub3QgZGlzYWJsZWQsIG9wZW5zIHRoZSBwYW5lbC4gKi9cbiAgb3BlbigpIHtcbiAgICBpZiAoIXRoaXMuaXNPcGVuKCkgJiYgIXRoaXMuZGlzYWJsZWQpIHtcbiAgICAgIHRoaXMub3BlbmVkLm5leHQoKTtcbiAgICAgIHRoaXMuX292ZXJsYXlSZWYgPSB0aGlzLl9vdmVybGF5UmVmIHx8IHRoaXMuX292ZXJsYXkuY3JlYXRlKHRoaXMuX2dldE92ZXJsYXlDb25maWcoKSk7XG4gICAgICB0aGlzLl9vdmVybGF5UmVmLmF0dGFjaCh0aGlzLl9nZXRQYW5lbENvbnRlbnQoKSk7XG4gICAgICBpZiAoIXRoaXMuX2lzVGV4dFRyaWdnZXIoKSkge1xuICAgICAgICB0aGlzLl9wYW5lbD8uZm9jdXNDb250ZW50KCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqIElmIHRoZSBjb21ib2JveCBpcyBvcGVuIGFuZCBub3QgZGlzYWJsZWQsIGNsb3NlcyB0aGUgcGFuZWwuICovXG4gIGNsb3NlKCkge1xuICAgIGlmICh0aGlzLmlzT3BlbigpICYmICF0aGlzLmRpc2FibGVkKSB7XG4gICAgICB0aGlzLmNsb3NlZC5uZXh0KCk7XG4gICAgICB0aGlzLl9vdmVybGF5UmVmLmRldGFjaCgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBSZXR1cm5zIHRydWUgaWYgcGFuZWwgaXMgY3VycmVudGx5IG9wZW5lZC4gKi9cbiAgaXNPcGVuKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9vdmVybGF5UmVmID8gdGhpcy5fb3ZlcmxheVJlZi5oYXNBdHRhY2hlZCgpIDogZmFsc2U7XG4gIH1cblxuICAvKiogUmV0dXJucyB0cnVlIGlmIGNvbWJvYm94IGhhcyBhIGNoaWxkIHBhbmVsLiAqL1xuICBoYXNQYW5lbCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gISF0aGlzLnBhbmVsO1xuICB9XG5cbiAgX2dldFRhYkluZGV4KCk6IHN0cmluZyB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLmRpc2FibGVkID8gbnVsbCA6ICcwJztcbiAgfVxuXG4gIHByaXZhdGUgX3NldENvbWJvYm94VmFsdWUodmFsdWU6IFQgfCBUW10pIHtcblxuICAgIGNvbnN0IHZhbHVlQ2hhbmdlZCA9ICh0aGlzLnZhbHVlICE9PSB2YWx1ZSk7XG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuXG4gICAgaWYgKHZhbHVlQ2hhbmdlZCkge1xuICAgICAgdGhpcy5wYW5lbFZhbHVlQ2hhbmdlZC5lbWl0KGNvZXJjZUFycmF5KHZhbHVlKSk7XG4gICAgICBpZiAodGhpcy5fYXV0b1NldFRleHQpIHtcbiAgICAgICAgdGhpcy5fc2V0VGV4dENvbnRlbnQodmFsdWUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3NldFRleHRDb250ZW50KGNvbnRlbnQ6IFQgfCBUW10pIHtcbiAgICBjb25zdCBjb250ZW50QXJyYXkgPSBjb2VyY2VBcnJheShjb250ZW50KTtcbiAgICB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQudGV4dENvbnRlbnQgPSBjb250ZW50QXJyYXkuam9pbignICcpO1xuICB9XG5cbiAgcHJpdmF0ZSBfaXNUZXh0VHJpZ2dlcigpIHtcbiAgICAvLyBUT0RPOiBTaG91bGQgY2hlY2sgaWYgdGhlIHRyaWdnZXIgaXMgY29udGVudGVkaXRhYmxlLlxuICAgIGNvbnN0IHRhZ05hbWUgPSB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQudGFnTmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgIHJldHVybiB0YWdOYW1lID09PSAnaW5wdXQnIHx8IHRhZ05hbWUgPT09ICd0ZXh0YXJlYScgPyB0cnVlIDogZmFsc2U7XG4gIH1cblxuICBwcml2YXRlIF9nZXRPdmVybGF5Q29uZmlnKCkge1xuICAgIHJldHVybiBuZXcgT3ZlcmxheUNvbmZpZyh7XG4gICAgICBwb3NpdGlvblN0cmF0ZWd5OiB0aGlzLl9nZXRPdmVybGF5UG9zaXRpb25TdHJhdGVneSgpLFxuICAgICAgc2Nyb2xsU3RyYXRlZ3k6IHRoaXMuX292ZXJsYXkuc2Nyb2xsU3RyYXRlZ2llcy5ibG9jaygpLFxuICAgICAgZGlyZWN0aW9uOiB0aGlzLl9kaXJlY3Rpb25hbGl0eSxcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX2dldE92ZXJsYXlQb3NpdGlvblN0cmF0ZWd5KCk6IEZsZXhpYmxlQ29ubmVjdGVkUG9zaXRpb25TdHJhdGVneSB7XG4gICAgcmV0dXJuIHRoaXMuX292ZXJsYXlcbiAgICAgICAgLnBvc2l0aW9uKClcbiAgICAgICAgLmZsZXhpYmxlQ29ubmVjdGVkVG8odGhpcy5fZWxlbWVudFJlZilcbiAgICAgICAgLndpdGhQb3NpdGlvbnModGhpcy5fZ2V0T3ZlcmxheVBvc2l0aW9ucygpKTtcbiAgfVxuXG4gIHByaXZhdGUgX2dldE92ZXJsYXlQb3NpdGlvbnMoKTogQ29ubmVjdGVkUG9zaXRpb25bXSB7XG4gICAgcmV0dXJuIFtcbiAgICAgIHtvcmlnaW5YOiAnc3RhcnQnLCBvcmlnaW5ZOiAnYm90dG9tJywgb3ZlcmxheVg6ICdzdGFydCcsIG92ZXJsYXlZOiAndG9wJ30sXG4gICAgICB7b3JpZ2luWDogJ3N0YXJ0Jywgb3JpZ2luWTogJ3RvcCcsIG92ZXJsYXlYOiAnc3RhcnQnLCBvdmVybGF5WTogJ2JvdHRvbSd9LFxuICAgICAge29yaWdpblg6ICdlbmQnLCBvcmlnaW5ZOiAnYm90dG9tJywgb3ZlcmxheVg6ICdlbmQnLCBvdmVybGF5WTogJ3RvcCd9LFxuICAgICAge29yaWdpblg6ICdlbmQnLCBvcmlnaW5ZOiAndG9wJywgb3ZlcmxheVg6ICdlbmQnLCBvdmVybGF5WTogJ2JvdHRvbSd9LFxuICAgIF07XG4gIH1cblxuICBwcml2YXRlIF9nZXRQYW5lbENvbnRlbnQoKSB7XG4gICAgY29uc3QgaGFzUGFuZWxDaGFuZ2VkID0gdGhpcy5fcGFuZWw/Ll90ZW1wbGF0ZVJlZiAhPT0gdGhpcy5fcGFuZWxDb250ZW50Py50ZW1wbGF0ZVJlZjtcbiAgICBpZiAodGhpcy5fcGFuZWwgJiYgKCF0aGlzLl9wYW5lbCB8fCBoYXNQYW5lbENoYW5nZWQpKSB7XG4gICAgICB0aGlzLl9wYW5lbENvbnRlbnQgPSBuZXcgVGVtcGxhdGVQb3J0YWwodGhpcy5fcGFuZWwuX3RlbXBsYXRlUmVmLCB0aGlzLl92aWV3Q29udGFpbmVyUmVmKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fcGFuZWxDb250ZW50O1xuICB9XG5cbiAgcHJpdmF0ZSBfY29lcmNlT3BlbkFjdGlvblByb3BlcnR5KGlucHV0OiBzdHJpbmcgfCBPcGVuQWN0aW9uW10pOiBPcGVuQWN0aW9uW10ge1xuICAgIGxldCBhY3Rpb25zID0gdHlwZW9mIGlucHV0ID09PSAnc3RyaW5nJyA/IGlucHV0LnRyaW0oKS5zcGxpdCgvWyAsXSsvKSA6IGlucHV0O1xuICAgIGlmICgodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSAmJlxuICAgICAgYWN0aW9ucy5zb21lKGEgPT4gYWxsb3dlZE9wZW5BY3Rpb25zLmluZGV4T2YoYSkgPT09IC0xKSkge1xuICAgICAgdGhyb3cgRXJyb3IoYCR7aW5wdXR9IGlzIG5vdCBhIHN1cHBvcnQgb3BlbiBhY3Rpb24gZm9yIENka0NvbWJvYm94YCk7XG4gICAgfVxuICAgIHJldHVybiBhY3Rpb25zIGFzIE9wZW5BY3Rpb25bXTtcbiAgfVxuXG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9vcGVuQWN0aW9uczogT3BlbkFjdGlvbklucHV0O1xuICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfYXV0b1NldFRleHQ6IE9wZW5BY3Rpb25JbnB1dDtcbiAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2Rpc2FibGVkOiBCb29sZWFuSW5wdXQ7XG59XG4iXX0=