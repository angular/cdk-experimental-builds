import * as i0 from '@angular/core';
import { inject, ElementRef, contentChild, input, signal, afterRenderEffect, Directive, model, untracked } from '@angular/core';
import * as i1 from '@angular/cdk-experimental/deferred-content';
import { DeferredContentAware, DeferredContent } from '@angular/cdk-experimental/deferred-content';
import { ComboboxPattern } from './combobox-ZZC2YlgZ.mjs';
import './pointer-event-manager-B6GE9jDm.mjs';

class CdkCombobox {
    /** The element that the combobox is attached to. */
    _elementRef = inject(ElementRef);
    /** The DeferredContentAware host directive. */
    _deferredContentAware = inject(DeferredContentAware, { optional: true });
    /** The combobox popup. */
    popup = contentChild(CdkComboboxPopup, ...(ngDevMode ? [{ debugName: "popup" }] : []));
    /** The filter mode for the combobox. */
    filterMode = input('manual', ...(ngDevMode ? [{ debugName: "filterMode" }] : []));
    /** Whether the combobox is focused. */
    isFocused = signal(false, ...(ngDevMode ? [{ debugName: "isFocused" }] : []));
    /** The value of the first matching item in the popup. */
    firstMatch = input(undefined, ...(ngDevMode ? [{ debugName: "firstMatch" }] : []));
    /** Whether the listbox has received focus yet. */
    _hasBeenFocused = signal(false, ...(ngDevMode ? [{ debugName: "_hasBeenFocused" }] : []));
    /** The combobox ui pattern. */
    pattern = new ComboboxPattern({
        ...this,
        inputValue: signal(''),
        inputEl: signal(undefined),
        containerEl: () => this._elementRef.nativeElement,
        popupControls: () => this.popup()?.controls(),
    });
    constructor() {
        afterRenderEffect(() => {
            if (!this._deferredContentAware?.contentVisible() && this.pattern.isFocused()) {
                this._deferredContentAware?.contentVisible.set(true);
            }
        });
        afterRenderEffect(() => {
            if (!this._hasBeenFocused() && this.pattern.isFocused()) {
                this._hasBeenFocused.set(true);
            }
        });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.2.0-next.2", ngImport: i0, type: CdkCombobox, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.2.0", version: "20.2.0-next.2", type: CdkCombobox, isStandalone: true, selector: "[cdkCombobox]", inputs: { filterMode: { classPropertyName: "filterMode", publicName: "filterMode", isSignal: true, isRequired: false, transformFunction: null }, firstMatch: { classPropertyName: "firstMatch", publicName: "firstMatch", isSignal: true, isRequired: false, transformFunction: null } }, host: { listeners: { "input": "pattern.onInput($event)", "keydown": "pattern.onKeydown($event)", "pointerup": "pattern.onPointerup($event)", "focusin": "pattern.onFocusIn()", "focusout": "pattern.onFocusOut($event)" }, properties: { "attr.data-expanded": "pattern.expanded()" } }, queries: [{ propertyName: "popup", first: true, predicate: CdkComboboxPopup, descendants: true, isSignal: true }], exportAs: ["cdkCombobox"], hostDirectives: [{ directive: i1.DeferredContentAware, inputs: ["preserveContent", "preserveContent"] }], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.2.0-next.2", ngImport: i0, type: CdkCombobox, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkCombobox]',
                    exportAs: 'cdkCombobox',
                    hostDirectives: [
                        {
                            directive: DeferredContentAware,
                            inputs: ['preserveContent'],
                        },
                    ],
                    host: {
                        '[attr.data-expanded]': 'pattern.expanded()',
                        '(input)': 'pattern.onInput($event)',
                        '(keydown)': 'pattern.onKeydown($event)',
                        '(pointerup)': 'pattern.onPointerup($event)',
                        '(focusin)': 'pattern.onFocusIn()',
                        '(focusout)': 'pattern.onFocusOut($event)',
                    },
                }]
        }], ctorParameters: () => [] });
class CdkComboboxInput {
    /** The element that the combobox is attached to. */
    _elementRef = inject(ElementRef);
    /** The combobox that the input belongs to. */
    combobox = inject(CdkCombobox);
    /** The value of the input. */
    value = model('', ...(ngDevMode ? [{ debugName: "value" }] : []));
    constructor() {
        this.combobox.pattern.inputs.inputEl.set(this._elementRef.nativeElement);
        this.combobox.pattern.inputs.inputValue = this.value;
        /** Focuses & selects the first item in the combobox if the user changes the input value. */
        afterRenderEffect(() => {
            this.combobox.popup()?.controls()?.items();
            untracked(() => this.combobox.pattern.onFilter());
        });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.2.0-next.2", ngImport: i0, type: CdkComboboxInput, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.1.0", version: "20.2.0-next.2", type: CdkComboboxInput, isStandalone: true, selector: "input[cdkComboboxInput]", inputs: { value: { classPropertyName: "value", publicName: "value", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { value: "valueChange" }, host: { attributes: { "role": "combobox" }, properties: { "value": "value()", "attr.aria-expanded": "combobox.pattern.expanded()", "attr.aria-activedescendant": "combobox.pattern.activedescendant()", "attr.aria-controls": "combobox.pattern.popupId()", "attr.aria-haspopup": "combobox.pattern.hasPopup()", "attr.aria-autocomplete": "combobox.pattern.autocomplete()" } }, exportAs: ["cdkComboboxInput"], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.2.0-next.2", ngImport: i0, type: CdkComboboxInput, decorators: [{
            type: Directive,
            args: [{
                    selector: 'input[cdkComboboxInput]',
                    exportAs: 'cdkComboboxInput',
                    host: {
                        'role': 'combobox',
                        '[value]': 'value()',
                        '[attr.aria-expanded]': 'combobox.pattern.expanded()',
                        '[attr.aria-activedescendant]': 'combobox.pattern.activedescendant()',
                        '[attr.aria-controls]': 'combobox.pattern.popupId()',
                        '[attr.aria-haspopup]': 'combobox.pattern.hasPopup()',
                        '[attr.aria-autocomplete]': 'combobox.pattern.autocomplete()',
                    },
                }]
        }], ctorParameters: () => [] });
class CdkComboboxPopupContainer {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.2.0-next.2", ngImport: i0, type: CdkComboboxPopupContainer, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "20.2.0-next.2", type: CdkComboboxPopupContainer, isStandalone: true, selector: "ng-template[cdkComboboxPopupContainer]", exportAs: ["cdkComboboxPopupContainer"], hostDirectives: [{ directive: i1.DeferredContent }], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.2.0-next.2", ngImport: i0, type: CdkComboboxPopupContainer, decorators: [{
            type: Directive,
            args: [{
                    selector: 'ng-template[cdkComboboxPopupContainer]',
                    exportAs: 'cdkComboboxPopupContainer',
                    hostDirectives: [DeferredContent],
                }]
        }] });
class CdkComboboxPopup {
    /** The combobox that the popup belongs to. */
    combobox = inject(CdkCombobox, { optional: true });
    /** The controls the popup exposes to the combobox. */
    controls = signal(undefined, ...(ngDevMode ? [{ debugName: "controls" }] : []));
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.2.0-next.2", ngImport: i0, type: CdkComboboxPopup, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "20.2.0-next.2", type: CdkComboboxPopup, isStandalone: true, selector: "[cdkComboboxPopup]", exportAs: ["cdkComboboxPopup"], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.2.0-next.2", ngImport: i0, type: CdkComboboxPopup, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkComboboxPopup]',
                    exportAs: 'cdkComboboxPopup',
                }]
        }] });

export { CdkCombobox, CdkComboboxInput, CdkComboboxPopup, CdkComboboxPopupContainer };
//# sourceMappingURL=combobox.mjs.map
