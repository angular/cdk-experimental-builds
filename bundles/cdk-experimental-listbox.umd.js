(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('@angular/cdk/coercion')) :
    typeof define === 'function' && define.amd ? define('@angular/cdk-experimental/listbox', ['exports', '@angular/core', '@angular/cdk/coercion'], factory) :
    (global = global || self, factory((global.ng = global.ng || {}, global.ng.cdkExperimental = global.ng.cdkExperimental || {}, global.ng.cdkExperimental.listbox = {}), global.ng.core, global.ng.cdk.coercion));
}(this, (function (exports, core, coercion) { 'use strict';

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var nextId = 0;
    /**
     * Directive that applies interaction patterns to an element following the aria role of option.
     * Typically meant to be placed inside a listbox. Logic handling selection, disabled state, and
     * value is built in.
     */
    var CdkOption = /** @class */ (function () {
        function CdkOption(listbox) {
            this.listbox = listbox;
            this._selected = false;
            /** The id of the option, set to a uniqueid if the user does not provide one */
            this.id = "cdk-option-" + nextId++;
        }
        Object.defineProperty(CdkOption.prototype, "selected", {
            /** Whether the option is selected or not */
            get: function () {
                return this._selected;
            },
            set: function (value) {
                this._selected = coercion.coerceBooleanProperty(value);
            },
            enumerable: false,
            configurable: true
        });
        /** Toggles the selected state, emits a change event through the injected listbox */
        CdkOption.prototype.toggle = function () {
            this.selected = !this.selected;
            this.listbox._emitChangeEvent(this);
        };
        CdkOption.decorators = [
            { type: core.Directive, args: [{
                        selector: '[cdkOption]',
                        exportAs: 'cdkOption',
                        host: {
                            role: 'option',
                            '(click)': 'toggle()',
                            '[attr.aria-selected]': 'selected || null',
                            '[id]': 'id',
                        }
                    },] }
        ];
        CdkOption.ctorParameters = function () { return [
            { type: CdkListbox, decorators: [{ type: core.Inject, args: [core.forwardRef(function () { return CdkListbox; }),] }] }
        ]; };
        CdkOption.propDecorators = {
            selected: [{ type: core.Input }],
            id: [{ type: core.Input }]
        };
        return CdkOption;
    }());
    /**
     * Directive that applies interaction patterns to an element following the aria role of listbox.
     * Typically CdkOption elements are placed inside the listbox. Logic to handle keyboard navigation,
     * selection of options, active options, and disabled states is built in.
     */
    var CdkListbox = /** @class */ (function () {
        function CdkListbox() {
            this.selectionChange = new core.EventEmitter();
        }
        /** Emits a selection change event, called when an option has its selected state changed */
        CdkListbox.prototype._emitChangeEvent = function (option) {
            this.selectionChange.emit(new ListboxSelectionChangeEvent(this, option));
        };
        /** Sets the given option's selected state to true */
        CdkListbox.prototype.select = function (option) {
            option.selected = true;
        };
        /** Sets the given option's selected state to null. Null is preferable for screen readers */
        CdkListbox.prototype.deselect = function (option) {
            option.selected = false;
        };
        CdkListbox.decorators = [
            { type: core.Directive, args: [{
                        selector: '[cdkListbox]',
                        exportAs: 'cdkListbox',
                        host: {
                            role: 'listbox',
                        }
                    },] }
        ];
        CdkListbox.propDecorators = {
            _options: [{ type: core.ContentChildren, args: [CdkOption, { descendants: true },] }],
            selectionChange: [{ type: core.Output }]
        };
        return CdkListbox;
    }());
    /** Change event that is being fired whenever the selected state of an option changes. */
    var ListboxSelectionChangeEvent = /** @class */ (function () {
        function ListboxSelectionChangeEvent(
        /** Reference to the listbox that emitted the event. */
        source, 
        /** Reference to the option that has been changed. */
        option) {
            this.source = source;
            this.option = option;
        }
        return ListboxSelectionChangeEvent;
    }());

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var EXPORTED_DECLARATIONS = [CdkListbox, CdkOption];
    var CdkListboxModule = /** @class */ (function () {
        function CdkListboxModule() {
        }
        CdkListboxModule.decorators = [
            { type: core.NgModule, args: [{
                        exports: EXPORTED_DECLARATIONS,
                        declarations: EXPORTED_DECLARATIONS,
                    },] }
        ];
        return CdkListboxModule;
    }());

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

    exports.CdkListbox = CdkListbox;
    exports.CdkListboxModule = CdkListboxModule;
    exports.CdkOption = CdkOption;
    exports.ListboxSelectionChangeEvent = ListboxSelectionChangeEvent;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=cdk-experimental-listbox.umd.js.map
