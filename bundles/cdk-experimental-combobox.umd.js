(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('@angular/cdk/overlay'), require('@angular/cdk/portal'), require('@angular/cdk/bidi'), require('@angular/cdk/coercion'), require('rxjs')) :
    typeof define === 'function' && define.amd ? define('@angular/cdk-experimental/combobox', ['exports', '@angular/core', '@angular/cdk/overlay', '@angular/cdk/portal', '@angular/cdk/bidi', '@angular/cdk/coercion', 'rxjs'], factory) :
    (global = global || self, factory((global.ng = global.ng || {}, global.ng.cdkExperimental = global.ng.cdkExperimental || {}, global.ng.cdkExperimental.combobox = {}), global.ng.core, global.ng.cdk.overlay, global.ng.cdk.portal, global.ng.cdk.bidi, global.ng.cdk.coercion, global.rxjs));
}(this, (function (exports, core, overlay, portal, bidi, coercion, rxjs) { 'use strict';

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var CdkCombobox = /** @class */ (function () {
        function CdkCombobox(_elementRef, _overlay, _viewContainerRef, _directionality) {
            this._elementRef = _elementRef;
            this._overlay = _overlay;
            this._viewContainerRef = _viewContainerRef;
            this._directionality = _directionality;
            this._disabled = false;
            this._openActions = ['click'];
            this.opened = new core.EventEmitter();
            this.closed = new core.EventEmitter();
            this.panelValueChanged = new core.EventEmitter();
            this.contentId = '';
        }
        Object.defineProperty(CdkCombobox.prototype, "panel", {
            get: function () { return this._panel; },
            set: function (panel) { this._panel = panel; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(CdkCombobox.prototype, "disabled", {
            get: function () { return this._disabled; },
            set: function (value) { this._disabled = coercion.coerceBooleanProperty(value); },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(CdkCombobox.prototype, "openAction", {
            get: function () {
                return this._openActions;
            },
            set: function (action) {
                this._openActions = this._coerceOpenActionProperty(action);
            },
            enumerable: false,
            configurable: true
        });
        CdkCombobox.prototype.ngAfterContentInit = function () {
            var _this = this;
            var _a, _b, _c;
            (_a = this._panel) === null || _a === void 0 ? void 0 : _a.valueUpdated.subscribe(function (data) {
                _this._setComboboxValue(data);
                _this.close();
            });
            (_b = this._panel) === null || _b === void 0 ? void 0 : _b.contentIdUpdated.subscribe(function (id) {
                _this.contentId = id;
            });
            (_c = this._panel) === null || _c === void 0 ? void 0 : _c.contentTypeUpdated.subscribe(function (type) {
                _this.contentType = type;
            });
        };
        CdkCombobox.prototype.ngOnDestroy = function () {
            this.opened.complete();
            this.closed.complete();
            this.panelValueChanged.complete();
        };
        /** Toggles the open state of the panel. */
        CdkCombobox.prototype.toggle = function () {
            if (this.hasPanel()) {
                this.isOpen() ? this.close() : this.open();
            }
        };
        /** If the combobox is closed and not disabled, opens the panel. */
        CdkCombobox.prototype.open = function () {
            if (!this.isOpen() && !this.disabled) {
                this.opened.next();
                this._overlayRef = this._overlayRef || this._overlay.create(this._getOverlayConfig());
                this._overlayRef.attach(this._getPanelContent());
            }
        };
        /** If the combobox is open and not disabled, closes the panel. */
        CdkCombobox.prototype.close = function () {
            if (this.isOpen() && !this.disabled) {
                this.closed.next();
                this._overlayRef.detach();
            }
        };
        /** Returns true if panel is currently opened. */
        CdkCombobox.prototype.isOpen = function () {
            return this._overlayRef ? this._overlayRef.hasAttached() : false;
        };
        /** Returns true if combobox has a child panel. */
        CdkCombobox.prototype.hasPanel = function () {
            return !!this.panel;
        };
        CdkCombobox.prototype._setComboboxValue = function (value) {
            var valueChanged = (this.value !== value);
            this.value = value;
            if (valueChanged) {
                this.panelValueChanged.emit(value);
            }
        };
        CdkCombobox.prototype._getOverlayConfig = function () {
            return new overlay.OverlayConfig({
                positionStrategy: this._getOverlayPositionStrategy(),
                scrollStrategy: this._overlay.scrollStrategies.block(),
                direction: this._directionality,
            });
        };
        CdkCombobox.prototype._getOverlayPositionStrategy = function () {
            return this._overlay
                .position()
                .flexibleConnectedTo(this._elementRef)
                .withPositions(this._getOverlayPositions());
        };
        CdkCombobox.prototype._getOverlayPositions = function () {
            return [
                { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' },
                { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom' },
                { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top' },
                { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom' },
            ];
        };
        CdkCombobox.prototype._getPanelContent = function () {
            var _a, _b;
            var hasPanelChanged = ((_a = this._panel) === null || _a === void 0 ? void 0 : _a._templateRef) !== ((_b = this._panelContent) === null || _b === void 0 ? void 0 : _b.templateRef);
            if (this._panel && (!this._panel || hasPanelChanged)) {
                this._panelContent = new portal.TemplatePortal(this._panel._templateRef, this._viewContainerRef);
            }
            return this._panelContent;
        };
        CdkCombobox.prototype._coerceOpenActionProperty = function (input) {
            var actions = [];
            if (typeof input === 'string') {
                actions.push(input);
            }
            else {
                actions = input;
            }
            return actions;
        };
        return CdkCombobox;
    }());
    CdkCombobox.decorators = [
        { type: core.Directive, args: [{
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
    CdkCombobox.ctorParameters = function () { return [
        { type: core.ElementRef },
        { type: overlay.Overlay },
        { type: core.ViewContainerRef },
        { type: bidi.Directionality, decorators: [{ type: core.Optional }] }
    ]; };
    CdkCombobox.propDecorators = {
        panel: [{ type: core.Input, args: ['cdkComboboxTriggerFor',] }],
        value: [{ type: core.Input }],
        disabled: [{ type: core.Input }],
        openAction: [{ type: core.Input }],
        opened: [{ type: core.Output, args: ['comboboxPanelOpened',] }],
        closed: [{ type: core.Output, args: ['comboboxPanelClosed',] }],
        panelValueChanged: [{ type: core.Output, args: ['panelValueChanged',] }]
    };

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var CdkComboboxPanel = /** @class */ (function () {
        function CdkComboboxPanel(_templateRef) {
            this._templateRef = _templateRef;
            this.valueUpdated = new rxjs.Subject();
            this.contentIdUpdated = new rxjs.Subject();
            this.contentTypeUpdated = new rxjs.Subject();
            this.contentId = '';
        }
        /** Tells the parent combobox to closet he panel and sends back the content value. */
        CdkComboboxPanel.prototype.closePanel = function (data) {
            this.valueUpdated.next(data);
        };
        /** Registers the content's id and the content type with the panel. */
        CdkComboboxPanel.prototype._registerContent = function (contentId, contentType) {
            this.contentId = contentId;
            if (contentType !== 'listbox' && contentType !== 'dialog') {
                throw Error('CdkComboboxPanel currently only supports listbox or dialog content.');
            }
            this.contentType = contentType;
            this.contentIdUpdated.next(this.contentId);
            this.contentTypeUpdated.next(this.contentType);
        };
        return CdkComboboxPanel;
    }());
    CdkComboboxPanel.decorators = [
        { type: core.Directive, args: [{
                    selector: 'ng-template[cdkComboboxPanel]',
                    exportAs: 'cdkComboboxPanel',
                },] }
    ];
    CdkComboboxPanel.ctorParameters = function () { return [
        { type: core.TemplateRef }
    ]; };

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var EXPORTED_DECLARATIONS = [CdkCombobox, CdkComboboxPanel];
    var CdkComboboxModule = /** @class */ (function () {
        function CdkComboboxModule() {
        }
        return CdkComboboxModule;
    }());
    CdkComboboxModule.decorators = [
        { type: core.NgModule, args: [{
                    imports: [overlay.OverlayModule],
                    exports: EXPORTED_DECLARATIONS,
                    declarations: EXPORTED_DECLARATIONS,
                },] }
    ];

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */

    /**
     * Generated bundle index. Do not edit.
     */

    exports.CdkCombobox = CdkCombobox;
    exports.CdkComboboxModule = CdkComboboxModule;
    exports.CdkComboboxPanel = CdkComboboxPanel;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=cdk-experimental-combobox.umd.js.map
