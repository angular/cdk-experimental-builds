import * as _angular_core from '@angular/core';
import { Signal, OnInit, OnDestroy } from '@angular/core';
import * as _angular_cdk_bidi from '@angular/cdk/bidi';
import { RadioButtonPattern, ToolbarWidgetPattern, ToolbarPattern } from '../toolbar.d.js';
import '../pointer-event-manager.d.js';
import '../list.d.js';

/** Interface for a radio button that can be used with a toolbar. Based on radio-button in ui-patterns */
interface CdkRadioButtonInterface<V> {
    /** The HTML element associated with the radio button. */
    element: Signal<HTMLElement>;
    /** Whether the radio button is disabled. */
    disabled: Signal<boolean>;
    pattern: RadioButtonPattern<V>;
}
/**
 * A toolbar widget container.
 *
 * Widgets such as radio groups or buttons are nested within a toolbar to allow for a single
 * place of reference for focus and navigation. The CdkToolbar is meant to be used in conjunction
 * with CdkToolbarWidget and CdkRadioGroup as follows:
 *
 * ```html
 * <div cdkToolbar>
 *  <button cdkToolbarWidget>Button</button>
 *  <div cdkRadioGroup>
 *    <label cdkRadioButton value="1">Option 1</label>
 *    <label cdkRadioButton value="2">Option 2</label>
 *    <label cdkRadioButton value="3">Option 3</label>
 *  </div>
 * </div>
 * ```
 */
declare class CdkToolbar<V> {
    /** A reference to the toolbar element. */
    private readonly _elementRef;
    /** The CdkTabList nested inside of the container. */
    private readonly _cdkWidgets;
    /** A signal wrapper for directionality. */
    textDirection: _angular_core.WritableSignal<_angular_cdk_bidi.Direction>;
    /** Sorted UIPatterns of the child widgets */
    items: Signal<(RadioButtonPattern<V> | ToolbarWidgetPattern)[]>;
    /** Whether the toolbar is vertically or horizontally oriented. */
    orientation: _angular_core.InputSignal<"vertical" | "horizontal">;
    /** Whether disabled items in the group should be skipped when navigating. */
    skipDisabled: _angular_core.InputSignalWithTransform<boolean, unknown>;
    /** Whether the toolbar is disabled. */
    disabled: _angular_core.InputSignalWithTransform<boolean, unknown>;
    /** Whether focus should wrap when navigating. */
    readonly wrap: _angular_core.InputSignalWithTransform<boolean, unknown>;
    /** The toolbar UIPattern. */
    pattern: ToolbarPattern<V>;
    /** Whether the toolbar has received focus yet. */
    private _hasFocused;
    onFocus(): void;
    constructor();
    register(widget: CdkRadioButtonInterface<V> | CdkToolbarWidget): void;
    unregister(widget: CdkRadioButtonInterface<V> | CdkToolbarWidget): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CdkToolbar<any>, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<CdkToolbar<any>, "[cdkToolbar]", ["cdkToolbar"], { "orientation": { "alias": "orientation"; "required": false; "isSignal": true; }; "skipDisabled": { "alias": "skipDisabled"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "wrap": { "alias": "wrap"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}
/**
 * A widget within a toolbar.
 *
 * A widget is anything that is within a toolbar. It should be applied to any native HTML element
 * that has the purpose of acting as a widget navigatable within a toolbar.
 */
declare class CdkToolbarWidget implements OnInit, OnDestroy {
    /** A reference to the widget element. */
    private readonly _elementRef;
    /** The parent CdkToolbar. */
    private readonly _cdkToolbar;
    /** A unique identifier for the widget. */
    private readonly _generatedId;
    /** A unique identifier for the widget. */
    protected id: Signal<string>;
    /** The parent Toolbar UIPattern. */
    protected parentToolbar: Signal<ToolbarPattern<any>>;
    /** A reference to the widget element to be focused on navigation. */
    element: Signal<any>;
    /** Whether the widget is disabled. */
    disabled: _angular_core.InputSignalWithTransform<boolean, unknown>;
    readonly hardDisabled: Signal<boolean>;
    pattern: ToolbarWidgetPattern;
    ngOnInit(): void;
    ngOnDestroy(): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CdkToolbarWidget, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<CdkToolbarWidget, "[cdkToolbarWidget]", ["cdkToolbarWidget"], { "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}

export { CdkToolbar, CdkToolbarWidget };
