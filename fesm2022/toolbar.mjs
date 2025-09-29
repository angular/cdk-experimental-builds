import * as i0 from '@angular/core';
import { inject, ElementRef, signal, computed, input, booleanAttribute, afterRenderEffect, Directive } from '@angular/core';
import { Directionality } from '@angular/cdk/bidi';
import { _IdGenerator } from '@angular/cdk/a11y';
import { ToolbarPattern, ToolbarWidgetPattern, ToolbarWidgetGroupPattern } from './toolbar-CGsEAlA3.mjs';
import './list-DDPL6e4b.mjs';
import './list-navigation-DFutf3ha.mjs';

/**
 * Sort directives by their document order.
 */
function sortDirectives(a, b) {
    return (a.element().compareDocumentPosition(b.element()) & Node.DOCUMENT_POSITION_PRECEDING) > 0
        ? 1
        : -1;
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
class CdkToolbar {
    /** A reference to the toolbar element. */
    _elementRef = inject(ElementRef);
    /** The CdkTabList nested inside of the container. */
    _cdkWidgets = signal(new Set(), ...(ngDevMode ? [{ debugName: "_cdkWidgets" }] : []));
    /** A signal wrapper for directionality. */
    textDirection = inject(Directionality).valueSignal;
    /** Sorted UIPatterns of the child widgets */
    items = computed(() => [...this._cdkWidgets()].sort(sortDirectives).map(widget => widget.pattern), ...(ngDevMode ? [{ debugName: "items" }] : []));
    /** Whether the toolbar is vertically or horizontally oriented. */
    orientation = input('horizontal', ...(ngDevMode ? [{ debugName: "orientation" }] : []));
    /** Whether disabled items in the group should be skipped when navigating. */
    skipDisabled = input(false, ...(ngDevMode ? [{ debugName: "skipDisabled", transform: booleanAttribute }] : [{ transform: booleanAttribute }]));
    /** Whether the toolbar is disabled. */
    disabled = input(false, ...(ngDevMode ? [{ debugName: "disabled", transform: booleanAttribute }] : [{ transform: booleanAttribute }]));
    /** Whether focus should wrap when navigating. */
    wrap = input(true, ...(ngDevMode ? [{ debugName: "wrap", transform: booleanAttribute }] : [{ transform: booleanAttribute }]));
    /** The toolbar UIPattern. */
    pattern = new ToolbarPattern({
        ...this,
        activeItem: signal(undefined),
        textDirection: this.textDirection,
        element: () => this._elementRef.nativeElement,
        getItem: e => this._getItem(e),
    });
    /** Whether the toolbar has received focus yet. */
    _hasFocused = signal(false, ...(ngDevMode ? [{ debugName: "_hasFocused" }] : []));
    constructor() {
        afterRenderEffect(() => {
            if (typeof ngDevMode === 'undefined' || ngDevMode) {
                const violations = this.pattern.validate();
                for (const violation of violations) {
                    console.error(violation);
                }
            }
        });
        afterRenderEffect(() => {
            if (!this._hasFocused()) {
                this.pattern.setDefaultState();
            }
        });
    }
    onFocus() {
        this._hasFocused.set(true);
    }
    register(widget) {
        const widgets = this._cdkWidgets();
        if (!widgets.has(widget)) {
            widgets.add(widget);
            this._cdkWidgets.set(new Set(widgets));
        }
    }
    unregister(widget) {
        const widgets = this._cdkWidgets();
        if (widgets.delete(widget)) {
            this._cdkWidgets.set(new Set(widgets));
        }
    }
    /** Finds the toolbar item associated with a given element. */
    _getItem(element) {
        const widgetTarget = element.closest('.cdk-toolbar-widget');
        const groupTarget = element.closest('.cdk-toolbar-widget-group');
        return this.items().find(widget => widget.element() === widgetTarget || widget.element() === groupTarget);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.2.0-next.2", ngImport: i0, type: CdkToolbar, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.1.0", version: "20.2.0-next.2", type: CdkToolbar, isStandalone: true, selector: "[cdkToolbar]", inputs: { orientation: { classPropertyName: "orientation", publicName: "orientation", isSignal: true, isRequired: false, transformFunction: null }, skipDisabled: { classPropertyName: "skipDisabled", publicName: "skipDisabled", isSignal: true, isRequired: false, transformFunction: null }, disabled: { classPropertyName: "disabled", publicName: "disabled", isSignal: true, isRequired: false, transformFunction: null }, wrap: { classPropertyName: "wrap", publicName: "wrap", isSignal: true, isRequired: false, transformFunction: null } }, host: { attributes: { "role": "toolbar" }, listeners: { "keydown": "pattern.onKeydown($event)", "pointerdown": "pattern.onPointerdown($event)", "focusin": "onFocus()" }, properties: { "attr.tabindex": "pattern.tabindex()", "attr.aria-disabled": "pattern.disabled()", "attr.aria-orientation": "pattern.orientation()" }, classAttribute: "cdk-toolbar" }, exportAs: ["cdkToolbar"], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.2.0-next.2", ngImport: i0, type: CdkToolbar, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkToolbar]',
                    exportAs: 'cdkToolbar',
                    host: {
                        'role': 'toolbar',
                        'class': 'cdk-toolbar',
                        '[attr.tabindex]': 'pattern.tabindex()',
                        '[attr.aria-disabled]': 'pattern.disabled()',
                        '[attr.aria-orientation]': 'pattern.orientation()',
                        '(keydown)': 'pattern.onKeydown($event)',
                        '(pointerdown)': 'pattern.onPointerdown($event)',
                        '(focusin)': 'onFocus()',
                    },
                }]
        }], ctorParameters: () => [] });
/**
 * A widget within a toolbar.
 *
 * A widget is anything that is within a toolbar. It should be applied to any native HTML element
 * that has the purpose of acting as a widget navigatable within a toolbar.
 */
class CdkToolbarWidget {
    /** A reference to the widget element. */
    _elementRef = inject(ElementRef);
    /** The parent CdkToolbar. */
    _cdkToolbar = inject(CdkToolbar);
    /** A unique identifier for the widget. */
    _generatedId = inject(_IdGenerator).getId('cdk-toolbar-widget-');
    /** A unique identifier for the widget. */
    id = computed(() => this._generatedId, ...(ngDevMode ? [{ debugName: "id" }] : []));
    /** The parent Toolbar UIPattern. */
    toolbar = computed(() => this._cdkToolbar.pattern, ...(ngDevMode ? [{ debugName: "toolbar" }] : []));
    /** A reference to the widget element to be focused on navigation. */
    element = computed(() => this._elementRef.nativeElement, ...(ngDevMode ? [{ debugName: "element" }] : []));
    /** Whether the widget is disabled. */
    disabled = input(false, ...(ngDevMode ? [{ debugName: "disabled", transform: booleanAttribute }] : [{ transform: booleanAttribute }]));
    /** Whether the widget is 'hard' disabled, which is different from `aria-disabled`. A hard disabled widget cannot receive focus. */
    hardDisabled = computed(() => this.pattern.disabled() && this._cdkToolbar.skipDisabled(), ...(ngDevMode ? [{ debugName: "hardDisabled" }] : []));
    /** The ToolbarWidget UIPattern. */
    pattern = new ToolbarWidgetPattern({
        ...this,
        id: this.id,
        element: this.element,
        disabled: computed(() => this._cdkToolbar.disabled() || this.disabled()),
    });
    ngOnInit() {
        this._cdkToolbar.register(this);
    }
    ngOnDestroy() {
        this._cdkToolbar.unregister(this);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.2.0-next.2", ngImport: i0, type: CdkToolbarWidget, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.1.0", version: "20.2.0-next.2", type: CdkToolbarWidget, isStandalone: true, selector: "[cdkToolbarWidget]", inputs: { disabled: { classPropertyName: "disabled", publicName: "disabled", isSignal: true, isRequired: false, transformFunction: null } }, host: { properties: { "class.cdk-active": "pattern.active()", "attr.tabindex": "pattern.tabindex()", "attr.inert": "hardDisabled() ? true : null", "attr.disabled": "hardDisabled() ? true : null", "attr.aria-disabled": "pattern.disabled()", "id": "pattern.id()" }, classAttribute: "cdk-toolbar-widget" }, exportAs: ["cdkToolbarWidget"], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.2.0-next.2", ngImport: i0, type: CdkToolbarWidget, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkToolbarWidget]',
                    exportAs: 'cdkToolbarWidget',
                    host: {
                        'class': 'cdk-toolbar-widget',
                        '[class.cdk-active]': 'pattern.active()',
                        '[attr.tabindex]': 'pattern.tabindex()',
                        '[attr.inert]': 'hardDisabled() ? true : null',
                        '[attr.disabled]': 'hardDisabled() ? true : null',
                        '[attr.aria-disabled]': 'pattern.disabled()',
                        '[id]': 'pattern.id()',
                    },
                }]
        }] });
/**
 * A directive that groups toolbar widgets, used for more complex widgets like radio groups that
 * have their own internal navigation.
 */
class CdkToolbarWidgetGroup {
    /** A reference to the widget element. */
    _elementRef = inject(ElementRef);
    /** The parent CdkToolbar. */
    _cdkToolbar = inject(CdkToolbar, { optional: true });
    /** A unique identifier for the widget. */
    _generatedId = inject(_IdGenerator).getId('cdk-toolbar-widget-group-');
    /** A unique identifier for the widget. */
    id = computed(() => this._generatedId, ...(ngDevMode ? [{ debugName: "id" }] : []));
    /** The parent Toolbar UIPattern. */
    toolbar = computed(() => this._cdkToolbar?.pattern, ...(ngDevMode ? [{ debugName: "toolbar" }] : []));
    /** A reference to the widget element to be focused on navigation. */
    element = computed(() => this._elementRef.nativeElement, ...(ngDevMode ? [{ debugName: "element" }] : []));
    /** Whether the widget group is disabled. */
    disabled = input(false, ...(ngDevMode ? [{ debugName: "disabled", transform: booleanAttribute }] : [{ transform: booleanAttribute }]));
    /** The controls that can be performed on the widget group. */
    controls = signal(undefined, ...(ngDevMode ? [{ debugName: "controls" }] : []));
    /** The ToolbarWidgetGroup UIPattern. */
    pattern = new ToolbarWidgetGroupPattern({
        ...this,
        id: this.id,
        element: this.element,
    });
    ngOnInit() {
        this._cdkToolbar?.register(this);
    }
    ngOnDestroy() {
        this._cdkToolbar?.unregister(this);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.2.0-next.2", ngImport: i0, type: CdkToolbarWidgetGroup, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.1.0", version: "20.2.0-next.2", type: CdkToolbarWidgetGroup, isStandalone: true, inputs: { disabled: { classPropertyName: "disabled", publicName: "disabled", isSignal: true, isRequired: false, transformFunction: null } }, host: { properties: { "class.cdk-toolbar-widget-group": "!!toolbar()" } }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.2.0-next.2", ngImport: i0, type: CdkToolbarWidgetGroup, decorators: [{
            type: Directive,
            args: [{
                    host: {
                        '[class.cdk-toolbar-widget-group]': '!!toolbar()',
                    },
                }]
        }] });

export { CdkToolbar, CdkToolbarWidget, CdkToolbarWidgetGroup };
//# sourceMappingURL=toolbar.mjs.map
