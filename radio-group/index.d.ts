import * as _angular_core from '@angular/core';
import { WritableSignal } from '@angular/core';
import * as _angular_cdk_bidi from '@angular/cdk/bidi';
import { c as RadioButtonPattern, a as RadioGroupPattern } from '../radio-group.d-CcY7mCC2.js';
import '../list-navigation.d-tcweHm4g.js';
import '../list-selection.d-BBLdeUeF.js';

/**
 * A radio button group container.
 *
 * Radio groups are used to group multiple radio buttons or radio group labels so they function as
 * a single form control. The CdkRadioGroup is meant to be used in conjunction with CdkRadioButton
 * as follows:
 *
 * ```html
 * <div cdkRadioGroup>
 *   <label cdkRadioButton value="1">Option 1</label>
 *   <label cdkRadioButton value="2">Option 2</label>
 *   <label cdkRadioButton value="3">Option 3</label>
 * </div>
 * ```
 */
declare class CdkRadioGroup<V> {
    /** The CdkRadioButtons nested inside of the CdkRadioGroup. */
    private readonly _cdkRadioButtons;
    /** A signal wrapper for directionality. */
    protected textDirection: WritableSignal<_angular_cdk_bidi.Direction>;
    /** The RadioButton UIPatterns of the child CdkRadioButtons. */
    protected items: _angular_core.Signal<RadioButtonPattern<any>[]>;
    /** Whether the radio group is vertically or horizontally oriented. */
    orientation: _angular_core.InputSignal<"vertical" | "horizontal">;
    /** Whether disabled items in the group should be skipped when navigating. */
    skipDisabled: _angular_core.InputSignalWithTransform<boolean, unknown>;
    /** The focus strategy used by the radio group. */
    focusMode: _angular_core.InputSignal<"roving" | "activedescendant">;
    /** Whether the radio group is disabled. */
    disabled: _angular_core.InputSignalWithTransform<boolean, unknown>;
    /** Whether the radio group is readonly. */
    readonly: _angular_core.InputSignalWithTransform<boolean, unknown>;
    /** The value of the currently selected radio button. */
    value: _angular_core.ModelSignal<V | null>;
    /** The internal selection state for the radio group. */
    private readonly _value;
    /** The RadioGroup UIPattern. */
    pattern: RadioGroupPattern<V>;
    /** Whether the radio group has received focus yet. */
    private _hasFocused;
    constructor();
    onFocus(): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CdkRadioGroup<any>, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<CdkRadioGroup<any>, "[cdkRadioGroup]", ["cdkRadioGroup"], { "orientation": { "alias": "orientation"; "required": false; "isSignal": true; }; "skipDisabled": { "alias": "skipDisabled"; "required": false; "isSignal": true; }; "focusMode": { "alias": "focusMode"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "readonly": { "alias": "readonly"; "required": false; "isSignal": true; }; "value": { "alias": "value"; "required": false; "isSignal": true; }; }, { "value": "valueChange"; }, ["_cdkRadioButtons"], never, true, never>;
}
/** A selectable radio button in a CdkRadioGroup. */
declare class CdkRadioButton<V> {
    /** A reference to the radio button element. */
    private readonly _elementRef;
    /** The parent CdkRadioGroup. */
    private readonly _cdkRadioGroup;
    /** A unique identifier for the radio button. */
    private readonly _generatedId;
    /** A unique identifier for the radio button. */
    protected id: _angular_core.Signal<string>;
    /** The value associated with the radio button. */
    protected value: _angular_core.InputSignal<V>;
    /** The parent RadioGroup UIPattern. */
    protected group: _angular_core.Signal<RadioGroupPattern<any>>;
    /** A reference to the radio button element to be focused on navigation. */
    protected element: _angular_core.Signal<any>;
    /** Whether the radio button is disabled. */
    disabled: _angular_core.InputSignalWithTransform<boolean, unknown>;
    /** The RadioButton UIPattern. */
    pattern: RadioButtonPattern<V>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CdkRadioButton<any>, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<CdkRadioButton<any>, "[cdkRadioButton]", ["cdkRadioButton"], { "value": { "alias": "value"; "required": true; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}

export { CdkRadioButton, CdkRadioGroup };
