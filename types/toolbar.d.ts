import * as _angular_core from '@angular/core';
import { Signal, OnInit, OnDestroy } from '@angular/core';
import * as _angular_cdk_bidi from '@angular/cdk/bidi';
import { ToolbarWidgetPattern, ToolbarWidgetGroupPattern, ToolbarPattern, ToolbarWidgetGroupControls } from './toolbar.d-DwYBYyA2.js';
import './list-navigation.d-v7LRaIQt.js';
import './list.d-B9T5bCJD.js';

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
    readonly textDirection: _angular_core.WritableSignal<_angular_cdk_bidi.Direction>;
    /** Sorted UIPatterns of the child widgets */
    readonly items: Signal<(ToolbarWidgetPattern<V> | ToolbarWidgetGroupPattern<V>)[]>;
    /** Whether the toolbar is vertically or horizontally oriented. */
    readonly orientation: _angular_core.InputSignal<"vertical" | "horizontal">;
    /** Whether disabled items in the group should be skipped when navigating. */
    readonly skipDisabled: _angular_core.InputSignalWithTransform<boolean, unknown>;
    /** Whether the toolbar is disabled. */
    readonly disabled: _angular_core.InputSignalWithTransform<boolean, unknown>;
    /** Whether focus should wrap when navigating. */
    readonly wrap: _angular_core.InputSignalWithTransform<boolean, unknown>;
    /** The toolbar UIPattern. */
    readonly pattern: ToolbarPattern<V>;
    /** Whether the toolbar has received focus yet. */
    private _hasFocused;
    constructor();
    onFocus(): void;
    register(widget: CdkToolbarWidget<V> | CdkToolbarWidgetGroup<V>): void;
    unregister(widget: CdkToolbarWidget<V> | CdkToolbarWidgetGroup<V>): void;
    /** Finds the toolbar item associated with a given element. */
    private _getItem;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CdkToolbar<any>, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<CdkToolbar<any>, "[cdkToolbar]", ["cdkToolbar"], { "orientation": { "alias": "orientation"; "required": false; "isSignal": true; }; "skipDisabled": { "alias": "skipDisabled"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "wrap": { "alias": "wrap"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}
/**
 * A widget within a toolbar.
 *
 * A widget is anything that is within a toolbar. It should be applied to any native HTML element
 * that has the purpose of acting as a widget navigatable within a toolbar.
 */
declare class CdkToolbarWidget<V> implements OnInit, OnDestroy {
    /** A reference to the widget element. */
    private readonly _elementRef;
    /** The parent CdkToolbar. */
    private readonly _cdkToolbar;
    /** A unique identifier for the widget. */
    private readonly _generatedId;
    /** A unique identifier for the widget. */
    readonly id: Signal<string>;
    /** The parent Toolbar UIPattern. */
    readonly toolbar: Signal<ToolbarPattern<any>>;
    /** A reference to the widget element to be focused on navigation. */
    readonly element: Signal<any>;
    /** Whether the widget is disabled. */
    readonly disabled: _angular_core.InputSignalWithTransform<boolean, unknown>;
    /** Whether the widget is 'hard' disabled, which is different from `aria-disabled`. A hard disabled widget cannot receive focus. */
    readonly hardDisabled: Signal<boolean>;
    /** The ToolbarWidget UIPattern. */
    readonly pattern: ToolbarWidgetPattern<V>;
    ngOnInit(): void;
    ngOnDestroy(): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CdkToolbarWidget<any>, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<CdkToolbarWidget<any>, "[cdkToolbarWidget]", ["cdkToolbarWidget"], { "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}
/**
 * A directive that groups toolbar widgets, used for more complex widgets like radio groups that
 * have their own internal navigation.
 */
declare class CdkToolbarWidgetGroup<V> implements OnInit, OnDestroy {
    /** A reference to the widget element. */
    private readonly _elementRef;
    /** The parent CdkToolbar. */
    private readonly _cdkToolbar;
    /** A unique identifier for the widget. */
    private readonly _generatedId;
    /** A unique identifier for the widget. */
    readonly id: Signal<string>;
    /** The parent Toolbar UIPattern. */
    readonly toolbar: Signal<ToolbarPattern<any> | undefined>;
    /** A reference to the widget element to be focused on navigation. */
    readonly element: Signal<any>;
    /** Whether the widget group is disabled. */
    readonly disabled: _angular_core.InputSignalWithTransform<boolean, unknown>;
    /** The controls that can be performed on the widget group. */
    readonly controls: _angular_core.WritableSignal<ToolbarWidgetGroupControls | undefined>;
    /** The ToolbarWidgetGroup UIPattern. */
    readonly pattern: ToolbarWidgetGroupPattern<V>;
    ngOnInit(): void;
    ngOnDestroy(): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CdkToolbarWidgetGroup<any>, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<CdkToolbarWidgetGroup<any>, never, never, { "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}

export { CdkToolbar, CdkToolbarWidget, CdkToolbarWidgetGroup };
