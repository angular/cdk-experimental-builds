import * as _angular_core from '@angular/core';
import { WritableSignal } from '@angular/core';
import { ComboboxPattern, ComboboxListboxControls, ComboboxTreeControls } from './combobox.d-DU-Rmfjh.js';
import * as i1 from '@angular/cdk-experimental/deferred-content';
import './pointer-event-manager.d-DxLZK1bd.js';
import './list-navigation.d-v7LRaIQt.js';
import './list.d-CgeCwpQa.js';

declare class CdkCombobox<V> {
    /** The element that the combobox is attached to. */
    private readonly _elementRef;
    /** The DeferredContentAware host directive. */
    private readonly _deferredContentAware;
    /** The combobox popup. */
    readonly popup: _angular_core.Signal<CdkComboboxPopup<V> | undefined>;
    /** The filter mode for the combobox. */
    filterMode: _angular_core.InputSignal<"manual" | "auto-select" | "highlight">;
    /** Whether the combobox is focused. */
    readonly isFocused: WritableSignal<boolean>;
    /** The value of the first matching item in the popup. */
    firstMatch: _angular_core.InputSignal<V | undefined>;
    /** Whether the listbox has received focus yet. */
    private _hasBeenFocused;
    /** The combobox ui pattern. */
    readonly pattern: ComboboxPattern<any, V>;
    constructor();
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CdkCombobox<any>, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<CdkCombobox<any>, "[cdkCombobox]", ["cdkCombobox"], { "filterMode": { "alias": "filterMode"; "required": false; "isSignal": true; }; "firstMatch": { "alias": "firstMatch"; "required": false; "isSignal": true; }; }, {}, ["popup"], never, true, [{ directive: typeof i1.DeferredContentAware; inputs: { "preserveContent": "preserveContent"; }; outputs: {}; }]>;
}
declare class CdkComboboxInput {
    /** The element that the combobox is attached to. */
    private readonly _elementRef;
    /** The combobox that the input belongs to. */
    readonly combobox: CdkCombobox<any>;
    /** The value of the input. */
    value: _angular_core.ModelSignal<string>;
    constructor();
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CdkComboboxInput, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<CdkComboboxInput, "input[cdkComboboxInput]", ["cdkComboboxInput"], { "value": { "alias": "value"; "required": false; "isSignal": true; }; }, { "value": "valueChange"; }, never, never, true, never>;
}
declare class CdkComboboxPopupContainer {
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CdkComboboxPopupContainer, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<CdkComboboxPopupContainer, "ng-template[cdkComboboxPopupContainer]", ["cdkComboboxPopupContainer"], {}, {}, never, never, true, [{ directive: typeof i1.DeferredContent; inputs: {}; outputs: {}; }]>;
}
declare class CdkComboboxPopup<V> {
    /** The combobox that the popup belongs to. */
    readonly combobox: CdkCombobox<V> | null;
    /** The controls the popup exposes to the combobox. */
    readonly controls: WritableSignal<ComboboxListboxControls<any, V> | ComboboxTreeControls<any, V> | undefined>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CdkComboboxPopup<any>, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<CdkComboboxPopup<any>, "[cdkComboboxPopup]", ["cdkComboboxPopup"], {}, {}, never, never, true, never>;
}

export { CdkCombobox, CdkComboboxInput, CdkComboboxPopup, CdkComboboxPopupContainer };
