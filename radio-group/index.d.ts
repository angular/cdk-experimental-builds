import * as _angular_core from '@angular/core';
import { WritableSignal } from '@angular/core';
import * as _angular_cdk_bidi from '@angular/cdk/bidi';
import { RadioButtonPattern, RadioGroupPattern } from '../radio-group.d.js';
import * as i1 from '@angular/cdk-experimental/toolbar';
import '../pointer-event-manager.d.js';
import '../list-navigation.d.js';
import '../list.d.js';

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
    /** A reference to the radio group element. */
    private readonly _elementRef;
    /** A reference to the CdkToolbarWidgetGroup, if the radio group is in a toolbar. */
    private readonly _cdkToolbarWidgetGroup;
    /** Whether the radio group is inside of a CdkToolbar. */
    private readonly _hasToolbar;
    /** The CdkRadioButtons nested inside of the CdkRadioGroup. */
    private readonly _cdkRadioButtons;
    /** A signal wrapper for directionality. */
    protected textDirection: WritableSignal<_angular_cdk_bidi.Direction>;
    /** The RadioButton UIPatterns of the child CdkRadioButtons. */
    protected items: _angular_core.Signal<RadioButtonPattern<any>[]>;
    /** Whether the radio group is vertically or horizontally oriented. */
    readonly orientation: _angular_core.InputSignal<"vertical" | "horizontal">;
    /** Whether disabled items in the group should be skipped when navigating. */
    readonly skipDisabled: _angular_core.InputSignalWithTransform<boolean, unknown>;
    /** The focus strategy used by the radio group. */
    readonly focusMode: _angular_core.InputSignal<"roving" | "activedescendant">;
    /** Whether the radio group is disabled. */
    readonly disabled: _angular_core.InputSignalWithTransform<boolean, unknown>;
    /** Whether the radio group is readonly. */
    readonly readonly: _angular_core.InputSignalWithTransform<boolean, unknown>;
    /** The value of the currently selected radio button. */
    readonly value: _angular_core.ModelSignal<V | null>;
    /** The internal selection state for the radio group. */
    private readonly _value;
    /** The RadioGroup UIPattern. */
    readonly pattern: RadioGroupPattern<V>;
    /** Whether the radio group has received focus yet. */
    private _hasFocused;
    constructor();
    onFocus(): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CdkRadioGroup<any>, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<CdkRadioGroup<any>, "[cdkRadioGroup]", ["cdkRadioGroup"], { "orientation": { "alias": "orientation"; "required": false; "isSignal": true; }; "skipDisabled": { "alias": "skipDisabled"; "required": false; "isSignal": true; }; "focusMode": { "alias": "focusMode"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "readonly": { "alias": "readonly"; "required": false; "isSignal": true; }; "value": { "alias": "value"; "required": false; "isSignal": true; }; }, { "value": "valueChange"; }, ["_cdkRadioButtons"], never, true, [{ directive: typeof i1.CdkToolbarWidgetGroup; inputs: { "disabled": "disabled"; }; outputs: {}; }]>;
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
    readonly id: _angular_core.Signal<string>;
    /** The value associated with the radio button. */
    readonly value: _angular_core.InputSignal<V>;
    /** The parent RadioGroup UIPattern. */
    readonly group: _angular_core.Signal<RadioGroupPattern<any>>;
    /** A reference to the radio button element to be focused on navigation. */
    element: _angular_core.Signal<any>;
    /** Whether the radio button is disabled. */
    disabled: _angular_core.InputSignalWithTransform<boolean, unknown>;
    /** The RadioButton UIPattern. */
    pattern: RadioButtonPattern<V>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CdkRadioButton<any>, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<CdkRadioButton<any>, "[cdkRadioButton]", ["cdkRadioButton"], { "value": { "alias": "value"; "required": true; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}

export { CdkRadioButton, CdkRadioGroup };
