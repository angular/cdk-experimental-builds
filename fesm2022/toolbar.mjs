import * as i0 from '@angular/core';
import { signal, inject, computed, input, booleanAttribute, afterRenderEffect, Directive, ElementRef } from '@angular/core';
import { Directionality } from '@angular/cdk/bidi';
import { _IdGenerator } from '@angular/cdk/a11y';
import { ToolbarPattern, ToolbarWidgetPattern } from './toolbar2.mjs';
import './list.mjs';
import './list-navigation.mjs';

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
        focusMode: signal('roving'),
    });
    /** Whether the toolbar has received focus yet. */
    _hasFocused = signal(false, ...(ngDevMode ? [{ debugName: "_hasFocused" }] : []));
    onFocus() {
        this._hasFocused.set(true);
    }
    constructor() {
        afterRenderEffect(() => {
            if (!this._hasFocused()) {
                this.pattern.setDefaultState();
            }
        });
        afterRenderEffect(() => {
            if (typeof ngDevMode === 'undefined' || ngDevMode) {
                const violations = this.pattern.validate();
                for (const violation of violations) {
                    console.error(violation);
                }
            }
        });
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
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.2.0-next.2", ngImport: i0, type: CdkToolbar, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.1.0", version: "20.2.0-next.2", type: CdkToolbar, isStandalone: true, selector: "[cdkToolbar]", inputs: { orientation: { classPropertyName: "orientation", publicName: "orientation", isSignal: true, isRequired: false, transformFunction: null }, skipDisabled: { classPropertyName: "skipDisabled", publicName: "skipDisabled", isSignal: true, isRequired: false, transformFunction: null }, disabled: { classPropertyName: "disabled", publicName: "disabled", isSignal: true, isRequired: false, transformFunction: null }, wrap: { classPropertyName: "wrap", publicName: "wrap", isSignal: true, isRequired: false, transformFunction: null } }, host: { attributes: { "role": "toolbar" }, listeners: { "keydown": "pattern.onKeydown($event)", "pointerdown": "pattern.onPointerdown($event)", "focusin": "onFocus()" }, properties: { "attr.tabindex": "pattern.tabindex()", "attr.aria-disabled": "pattern.disabled()", "attr.aria-orientation": "pattern.orientation()", "attr.aria-activedescendant": "pattern.activedescendant()" }, classAttribute: "cdk-toolbar" }, exportAs: ["cdkToolbar"], ngImport: i0 });
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
                        '[attr.aria-activedescendant]': 'pattern.activedescendant()',
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
    parentToolbar = computed(() => this._cdkToolbar.pattern, ...(ngDevMode ? [{ debugName: "parentToolbar" }] : []));
    /** A reference to the widget element to be focused on navigation. */
    element = computed(() => this._elementRef.nativeElement, ...(ngDevMode ? [{ debugName: "element" }] : []));
    /** Whether the widget is disabled. */
    disabled = input(false, ...(ngDevMode ? [{ debugName: "disabled", transform: booleanAttribute }] : [{ transform: booleanAttribute }]));
    hardDisabled = computed(() => this.pattern.disabled() && this._cdkToolbar.skipDisabled(), ...(ngDevMode ? [{ debugName: "hardDisabled" }] : []));
    pattern = new ToolbarWidgetPattern({
        ...this,
        id: this.id,
        element: this.element,
        disabled: computed(() => this._cdkToolbar.disabled() || this.disabled()),
        parentToolbar: this.parentToolbar,
    });
    ngOnInit() {
        this._cdkToolbar.register(this);
    }
    ngOnDestroy() {
        this._cdkToolbar.unregister(this);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.2.0-next.2", ngImport: i0, type: CdkToolbarWidget, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.1.0", version: "20.2.0-next.2", type: CdkToolbarWidget, isStandalone: true, selector: "[cdkToolbarWidget]", inputs: { disabled: { classPropertyName: "disabled", publicName: "disabled", isSignal: true, isRequired: false, transformFunction: null } }, host: { attributes: { "role": "button" }, properties: { "class.cdk-active": "pattern.active()", "attr.tabindex": "pattern.tabindex()", "attr.inert": "hardDisabled() ? true : null", "attr.disabled": "hardDisabled() ? true : null", "attr.aria-disabled": "pattern.disabled()", "id": "pattern.id()" }, classAttribute: "cdk-toolbar-widget" }, exportAs: ["cdkToolbarWidget"], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.2.0-next.2", ngImport: i0, type: CdkToolbarWidget, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkToolbarWidget]',
                    exportAs: 'cdkToolbarWidget',
                    host: {
                        'role': 'button',
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

export { CdkToolbar, CdkToolbarWidget };
//# sourceMappingURL=toolbar.mjs.map
