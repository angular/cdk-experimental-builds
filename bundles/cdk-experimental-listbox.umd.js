(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('@angular/cdk/a11y'), require('@angular/cdk/keycodes'), require('@angular/cdk/coercion')) :
    typeof define === 'function' && define.amd ? define('@angular/cdk-experimental/listbox', ['exports', '@angular/core', '@angular/cdk/a11y', '@angular/cdk/keycodes', '@angular/cdk/coercion'], factory) :
    (global = global || self, factory((global.ng = global.ng || {}, global.ng.cdkExperimental = global.ng.cdkExperimental || {}, global.ng.cdkExperimental.listbox = {}), global.ng.core, global.ng.cdk.a11y, global.ng.cdk.keycodes, global.ng.cdk.coercion));
}(this, (function (exports, core, a11y, keycodes, coercion) { 'use strict';

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var nextId = 0;
    var CdkOption = /** @class */ (function () {
        function CdkOption(_elementRef, listbox) {
            this._elementRef = _elementRef;
            this.listbox = listbox;
            this._selected = false;
            this._disabled = false;
            this._active = false;
            /** The id of the option, set to a uniqueid if the user does not provide one. */
            this.id = "cdk-option-" + nextId++;
        }
        Object.defineProperty(CdkOption.prototype, "selected", {
            get: function () {
                return this._selected;
            },
            set: function (value) {
                if (!this._disabled) {
                    this._selected = coercion.coerceBooleanProperty(value);
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(CdkOption.prototype, "disabled", {
            get: function () {
                return this._disabled;
            },
            set: function (value) {
                this._disabled = coercion.coerceBooleanProperty(value);
            },
            enumerable: false,
            configurable: true
        });
        /** Toggles the selected state, emits a change event through the injected listbox. */
        CdkOption.prototype.toggle = function () {
            if (!this._isInteractionDisabled()) {
                this.selected = !this.selected;
                this.listbox._emitChangeEvent(this);
            }
        };
        /** Sets the active property true if the option and listbox aren't disabled. */
        CdkOption.prototype.activate = function () {
            if (!this._isInteractionDisabled()) {
                this._active = true;
                this.listbox.setActiveOption(this);
            }
        };
        /** Sets the active property false. */
        CdkOption.prototype.deactivate = function () {
            this._active = false;
        };
        /** Returns true if the option or listbox are disabled, and false otherwise. */
        CdkOption.prototype._isInteractionDisabled = function () {
            return (this.listbox.disabled || this._disabled);
        };
        /** Returns the tab index which depends on the disabled property. */
        CdkOption.prototype._getTabIndex = function () {
            return (this.listbox.disabled || this._disabled) ? null : '-1';
        };
        CdkOption.prototype.getLabel = function () {
            // TODO: improve to method to handle more complex combinations of elements and text
            return this._elementRef.nativeElement.textContent;
        };
        CdkOption.prototype.setActiveStyles = function () {
            this._active = true;
        };
        CdkOption.prototype.setInactiveStyles = function () {
            this._active = false;
        };
        CdkOption.decorators = [
            { type: core.Directive, args: [{
                        selector: '[cdkOption]',
                        exportAs: 'cdkOption',
                        host: {
                            'role': 'option',
                            '(click)': 'toggle()',
                            '(focus)': 'activate()',
                            '(blur)': 'deactivate()',
                            '[id]': 'id',
                            '[attr.aria-selected]': '_selected || null',
                            '[attr.tabindex]': '_getTabIndex()',
                            '[attr.aria-disabled]': '_isInteractionDisabled()',
                            '[class.cdk-option-disabled]': '_isInteractionDisabled()',
                            '[class.cdk-option-active]': '_active'
                        }
                    },] }
        ];
        CdkOption.ctorParameters = function () { return [
            { type: core.ElementRef },
            { type: CdkListbox, decorators: [{ type: core.Inject, args: [core.forwardRef(function () { return CdkListbox; }),] }] }
        ]; };
        CdkOption.propDecorators = {
            selected: [{ type: core.Input }],
            id: [{ type: core.Input }],
            disabled: [{ type: core.Input }]
        };
        return CdkOption;
    }());
    var CdkListbox = /** @class */ (function () {
        function CdkListbox() {
            this._disabled = false;
            this.selectionChange = new core.EventEmitter();
        }
        Object.defineProperty(CdkListbox.prototype, "disabled", {
            get: function () {
                return this._disabled;
            },
            set: function (value) {
                this._disabled = coercion.coerceBooleanProperty(value);
            },
            enumerable: false,
            configurable: true
        });
        CdkListbox.prototype.ngAfterContentInit = function () {
            this._listKeyManager = new a11y.ActiveDescendantKeyManager(this._options)
                .withWrap().withVerticalOrientation().withTypeAhead();
        };
        CdkListbox.prototype.ngOnDestroy = function () {
            this._listKeyManager.change.complete();
        };
        CdkListbox.prototype._keydown = function (event) {
            if (this._disabled) {
                return;
            }
            var manager = this._listKeyManager;
            var keyCode = event.keyCode;
            if (keyCode === keycodes.HOME || keyCode === keycodes.END) {
                event.preventDefault();
                keyCode === keycodes.HOME ? manager.setFirstItemActive() : manager.setLastItemActive();
            }
            else if (keyCode === keycodes.SPACE || keyCode === keycodes.ENTER) {
                if (manager.activeItem && !manager.isTyping()) {
                    this._toggleActiveOption();
                }
            }
            else {
                manager.onKeydown(event);
            }
        };
        /** Emits a selection change event, called when an option has its selected state changed. */
        CdkListbox.prototype._emitChangeEvent = function (option) {
            this.selectionChange.emit(new ListboxSelectionChangeEvent(this, option));
        };
        CdkListbox.prototype._toggleActiveOption = function () {
            var activeOption = this._listKeyManager.activeItem;
            if (activeOption && !activeOption.disabled) {
                activeOption.toggle();
                this._emitChangeEvent(activeOption);
            }
        };
        /** Selects the given option if the option and listbox aren't disabled. */
        CdkListbox.prototype.select = function (option) {
            if (!this.disabled && !option.disabled) {
                option.selected = true;
            }
        };
        /** Deselects the given option if the option and listbox aren't disabled. */
        CdkListbox.prototype.deselect = function (option) {
            if (!this.disabled && !option.disabled) {
                option.selected = false;
            }
        };
        /** Updates the key manager's active item to the given option. */
        CdkListbox.prototype.setActiveOption = function (option) {
            this._listKeyManager.updateActiveItem(option);
        };
        CdkListbox.decorators = [
            { type: core.Directive, args: [{
                        selector: '[cdkListbox]',
                        exportAs: 'cdkListbox',
                        host: {
                            'role': 'listbox',
                            '(keydown)': '_keydown($event)',
                            '[attr.aria-disabled]': '_disabled',
                        }
                    },] }
        ];
        CdkListbox.propDecorators = {
            _options: [{ type: core.ContentChildren, args: [CdkOption, { descendants: true },] }],
            selectionChange: [{ type: core.Output }],
            disabled: [{ type: core.Input }]
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
