(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('rxjs/operators'), require('@angular/cdk/collections'), require('@angular/cdk/coercion')) :
    typeof define === 'function' && define.amd ? define('@angular/cdk-experimental/menu', ['exports', '@angular/core', 'rxjs/operators', '@angular/cdk/collections', '@angular/cdk/coercion'], factory) :
    (global = global || self, factory((global.ng = global.ng || {}, global.ng.cdkExperimental = global.ng.cdkExperimental || {}, global.ng.cdkExperimental.menu = {}), global.ng.core, global.rxjs.operators, global.ng.cdk.collections, global.ng.cdk.coercion));
}(this, (function (exports, core, operators, collections, coercion) { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    function __rest(s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    }

    function __decorate(decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    }

    function __param(paramIndex, decorator) {
        return function (target, key) { decorator(target, key, paramIndex); }
    }

    function __metadata(metadataKey, metadataValue) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
    }

    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    function __generator(thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    }

    var __createBinding = Object.create ? (function(o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
    }) : (function(o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
    });

    function __exportStar(m, exports) {
        for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
    }

    function __values(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m) return m.call(o);
        if (o && typeof o.length === "number") return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    }

    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    }

    function __spread() {
        for (var ar = [], i = 0; i < arguments.length; i++)
            ar = ar.concat(__read(arguments[i]));
        return ar;
    }

    function __spreadArrays() {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                r[k] = a[j];
        return r;
    };

    function __await(v) {
        return this instanceof __await ? (this.v = v, this) : new __await(v);
    }

    function __asyncGenerator(thisArg, _arguments, generator) {
        if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
        var g = generator.apply(thisArg, _arguments || []), i, q = [];
        return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
        function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
        function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
        function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
        function fulfill(value) { resume("next", value); }
        function reject(value) { resume("throw", value); }
        function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
    }

    function __asyncDelegator(o) {
        var i, p;
        return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
        function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
    }

    function __asyncValues(o) {
        if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
        var m = o[Symbol.asyncIterator], i;
        return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
        function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
        function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
    }

    function __makeTemplateObject(cooked, raw) {
        if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
        return cooked;
    };

    var __setModuleDefault = Object.create ? (function(o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
        o["default"] = v;
    };

    function __importStar(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
        __setModuleDefault(result, mod);
        return result;
    }

    function __importDefault(mod) {
        return (mod && mod.__esModule) ? mod : { default: mod };
    }

    function __classPrivateFieldGet(receiver, privateMap) {
        if (!privateMap.has(receiver)) {
            throw new TypeError("attempted to get private field on non-instance");
        }
        return privateMap.get(receiver);
    }

    function __classPrivateFieldSet(receiver, privateMap, value) {
        if (!privateMap.has(receiver)) {
            throw new TypeError("attempted to set private field on non-instance");
        }
        privateMap.set(receiver, value);
        return value;
    }

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    /**
     * Directive which provides the ability for an element to be focused and navigated to using the
     * keyboard when residing in a CdkMenu, CdkMenuBar, or CdkMenuGroup. It performs user defined
     * behavior when clicked.
     */
    var CdkMenuItem = /** @class */ (function () {
        function CdkMenuItem() {
            this._disabled = false;
            /** Whether the menu item opens a menu */
            this.hasSubmenu = false;
        }
        Object.defineProperty(CdkMenuItem.prototype, "disabled", {
            /**  Whether the CdkMenuItem is disabled - defaults to false */
            get: function () {
                return this._disabled;
            },
            set: function (value) {
                this._disabled = coercion.coerceBooleanProperty(value);
            },
            enumerable: false,
            configurable: true
        });
        CdkMenuItem.decorators = [
            { type: core.Directive, args: [{
                        selector: '[cdkMenuItem]',
                        exportAs: 'cdkMenuItem',
                        host: {
                            'type': 'button',
                            'role': 'menuitem',
                            '[attr.aria-disabled]': 'disabled || null',
                        },
                    },] }
        ];
        CdkMenuItem.propDecorators = {
            disabled: [{ type: core.Input }]
        };
        return CdkMenuItem;
    }());

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    /** Counter used to set a unique id and name for a selectable item */
    var nextId = 0;
    /**
     * Base class providing checked state for MenuItems along with outputting a clicked event when the
     * element is triggered. It provides functionality for selectable elements.
     */
    var CdkMenuItemSelectable = /** @class */ (function (_super) {
        __extends(CdkMenuItemSelectable, _super);
        function CdkMenuItemSelectable() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            /** Event emitted when the selectable item is clicked */
            _this.clicked = new core.EventEmitter();
            _this._checked = false;
            /** The name of the selectable element with a default value */
            _this.name = "cdk-selectable-item-" + nextId++;
            /** The id of the selectable element with a default value */
            _this.id = "cdk-selectable-item-" + nextId++;
            return _this;
        }
        Object.defineProperty(CdkMenuItemSelectable.prototype, "checked", {
            /** Whether the element is checked */
            get: function () {
                return this._checked;
            },
            set: function (value) {
                this._checked = coercion.coerceBooleanProperty(value);
            },
            enumerable: false,
            configurable: true
        });
        /** If the element is not disabled emit the click event */
        CdkMenuItemSelectable.prototype.trigger = function () {
            if (!this.disabled) {
                this.clicked.next(this);
            }
        };
        CdkMenuItemSelectable.decorators = [
            { type: core.Directive }
        ];
        CdkMenuItemSelectable.propDecorators = {
            clicked: [{ type: core.Output }],
            checked: [{ type: core.Input }],
            name: [{ type: core.Input }],
            id: [{ type: core.Input }]
        };
        return CdkMenuItemSelectable;
    }(CdkMenuItem));

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    /**
     * Directive which acts as a grouping container for `CdkMenuItem` instances with
     * `role="menuitemradio"`, similar to a `role="radiogroup"` element.
     */
    var CdkMenuGroup = /** @class */ (function () {
        function CdkMenuGroup() {
            /** Emits the element when checkbox or radiobutton state changed  */
            this.change = new core.EventEmitter();
            /** Emits when the _selectableItems QueryList triggers a change */
            this._selectableChanges = new core.EventEmitter();
        }
        CdkMenuGroup.prototype.ngAfterContentInit = function () {
            this._registerMenuSelectionListeners();
        };
        /**
         * Register the child selectable elements with the change emitter and ensure any new child
         * elements do so as well.
         */
        CdkMenuGroup.prototype._registerMenuSelectionListeners = function () {
            var _this = this;
            this._selectableItems.forEach(function (selectable) { return _this._registerClickListener(selectable); });
            this._selectableItems.changes.subscribe(function (selectableItems) {
                _this._selectableChanges.next();
                selectableItems.forEach(function (selectable) { return _this._registerClickListener(selectable); });
            });
        };
        /** Register each selectable to emit on the change Emitter when clicked */
        CdkMenuGroup.prototype._registerClickListener = function (selectable) {
            var _this = this;
            selectable.clicked
                .pipe(operators.takeUntil(this._selectableChanges))
                .subscribe(function () { return _this.change.next(selectable); });
        };
        CdkMenuGroup.prototype.ngOnDestroy = function () {
            this._selectableChanges.next();
            this._selectableChanges.complete();
        };
        CdkMenuGroup.decorators = [
            { type: core.Directive, args: [{
                        selector: '[cdkMenuGroup]',
                        exportAs: 'cdkMenuGroup',
                        host: {
                            'role': 'group',
                        },
                        providers: [{ provide: collections.UniqueSelectionDispatcher, useClass: collections.UniqueSelectionDispatcher }],
                    },] }
        ];
        CdkMenuGroup.propDecorators = {
            change: [{ type: core.Output }],
            _selectableItems: [{ type: core.ContentChildren, args: [CdkMenuItemSelectable, { descendants: true },] }]
        };
        return CdkMenuGroup;
    }());

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    /**
     * Directive which configures the element as a Menu which should contain child elements marked as
     * CdkMenuItem or CdkMenuGroup. Sets the appropriate role and aria-attributes for a menu and
     * contains accessible keyboard and mouse handling logic.
     *
     * It also acts as a RadioGroup for elements marked with role `menuitemradio`.
     */
    var CdkMenu = /** @class */ (function (_super) {
        __extends(CdkMenu, _super);
        function CdkMenu() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            /**
             * Sets the aria-orientation attribute and determines where sub-menus will be opened.
             * Does not affect styling/layout.
             */
            _this.orientation = 'vertical';
            /** Event emitted when the menu is closed. */
            _this.closed = new core.EventEmitter();
            return _this;
        }
        CdkMenu.prototype.ngAfterContentInit = function () {
            _super.prototype.ngAfterContentInit.call(this);
            this._completeChangeEmitter();
        };
        /**
         * Complete the change emitter if there are any nested MenuGroups or register to complete the
         * change emitter if a MenuGroup is rendered at some point
         */
        CdkMenu.prototype._completeChangeEmitter = function () {
            var _this = this;
            if (this._hasNestedGroups()) {
                this.change.complete();
            }
            else {
                this._nestedGroups.changes.pipe(operators.take(1)).subscribe(function () { return _this.change.complete(); });
            }
        };
        /** Return true if there are nested CdkMenuGroup elements within the Menu */
        CdkMenu.prototype._hasNestedGroups = function () {
            // view engine has a bug where @ContentChildren will return the current element
            // along with children if the selectors match - not just the children.
            // Here, if there is at least one element, we check to see if the first element is a CdkMenu in
            // order to ensure that we return true iff there are child CdkMenuGroup elements.
            return this._nestedGroups.length > 0 && !(this._nestedGroups.first instanceof CdkMenu);
        };
        CdkMenu.decorators = [
            { type: core.Directive, args: [{
                        selector: '[cdkMenu]',
                        exportAs: 'cdkMenu',
                        host: {
                            'role': 'menu',
                            '[attr.aria-orientation]': 'orientation',
                        },
                        providers: [{ provide: CdkMenuGroup, useExisting: CdkMenu }],
                    },] }
        ];
        CdkMenu.propDecorators = {
            orientation: [{ type: core.Input, args: ['cdkMenuOrientation',] }],
            closed: [{ type: core.Output }],
            _nestedGroups: [{ type: core.ContentChildren, args: [CdkMenuGroup, { descendants: true },] }]
        };
        return CdkMenu;
    }(CdkMenuGroup));

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    /**
     * Directive applied to an element which configures it as a MenuBar by setting the appropriate
     * role, aria attributes, and accessible keyboard and mouse handling logic. The component that
     * this directive is applied to should contain components marked with CdkMenuItem.
     *
     */
    var CdkMenuBar = /** @class */ (function (_super) {
        __extends(CdkMenuBar, _super);
        function CdkMenuBar() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            /**
             * Sets the aria-orientation attribute and determines where sub-menus will be opened.
             * Does not affect styling/layout.
             */
            _this.orientation = 'horizontal';
            return _this;
        }
        CdkMenuBar.decorators = [
            { type: core.Directive, args: [{
                        selector: '[cdkMenuBar]',
                        exportAs: 'cdkMenuBar',
                        host: {
                            'role': 'menubar',
                            '[attr.aria-orientation]': 'orientation',
                        },
                        providers: [{ provide: CdkMenuGroup, useExisting: CdkMenuBar }],
                    },] }
        ];
        CdkMenuBar.propDecorators = {
            orientation: [{ type: core.Input, args: ['cdkMenuBarOrientation',] }]
        };
        return CdkMenuBar;
    }(CdkMenuGroup));

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    /**
     * Directive applied to an ng-template which wraps a CdkMenu and provides a reference to the
     * child element it wraps which allows for opening of the CdkMenu in an overlay.
     */
    var CdkMenuPanel = /** @class */ (function () {
        function CdkMenuPanel() {
        }
        CdkMenuPanel.decorators = [
            { type: core.Directive, args: [{ selector: 'ng-template[cdkMenuPanel]', exportAs: 'cdkMenuPanel' },] }
        ];
        return CdkMenuPanel;
    }());

    /**
     * A directive providing behavior for the the "menuitemradio" ARIA role, which behaves similarly to
     * a conventional radio-button. Any sibling `CdkMenuItemRadio` instances within the same `CdkMenu`
     * or `CdkMenuGroup` comprise a radio group with unique selection enforced.
     */
    var CdkMenuItemRadio = /** @class */ (function (_super) {
        __extends(CdkMenuItemRadio, _super);
        function CdkMenuItemRadio(_selectionDispatcher) {
            var _this = _super.call(this) || this;
            _this._selectionDispatcher = _selectionDispatcher;
            _this._registerDispatcherListener();
            return _this;
        }
        /** Configure the unique selection dispatcher listener in order to toggle the checked state  */
        CdkMenuItemRadio.prototype._registerDispatcherListener = function () {
            var _this = this;
            this._removeDispatcherListener = this._selectionDispatcher.listen(function (id, name) { return (_this.checked = _this.id === id && _this.name === name); });
        };
        /** Toggles the checked state of the radio-button. */
        CdkMenuItemRadio.prototype.trigger = function () {
            _super.prototype.trigger.call(this);
            if (!this.disabled) {
                this._selectionDispatcher.notify(this.id, this.name);
            }
        };
        CdkMenuItemRadio.prototype.ngOnDestroy = function () {
            this._removeDispatcherListener();
        };
        CdkMenuItemRadio.decorators = [
            { type: core.Directive, args: [{
                        selector: '[cdkMenuItemRadio]',
                        exportAs: 'cdkMenuItemRadio',
                        host: {
                            '(click)': 'trigger()',
                            'type': 'button',
                            'role': 'menuitemradio',
                            '[attr.aria-checked]': 'checked || null',
                            '[attr.aria-disabled]': 'disabled || null',
                        },
                        providers: [{ provide: CdkMenuItemSelectable, useExisting: CdkMenuItemRadio }],
                    },] }
        ];
        CdkMenuItemRadio.ctorParameters = function () { return [
            { type: collections.UniqueSelectionDispatcher }
        ]; };
        return CdkMenuItemRadio;
    }(CdkMenuItemSelectable));

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    /**
     * A directive providing behavior for the "menuitemcheckbox" ARIA role, which behaves similarly to a
     * conventional checkbox.
     */
    var CdkMenuItemCheckbox = /** @class */ (function (_super) {
        __extends(CdkMenuItemCheckbox, _super);
        function CdkMenuItemCheckbox() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        CdkMenuItemCheckbox.prototype.trigger = function () {
            _super.prototype.trigger.call(this);
            if (!this.disabled) {
                this.checked = !this.checked;
            }
        };
        CdkMenuItemCheckbox.decorators = [
            { type: core.Directive, args: [{
                        selector: '[cdkMenuItemCheckbox]',
                        exportAs: 'cdkMenuItemCheckbox',
                        host: {
                            '(click)': 'trigger()',
                            'type': 'button',
                            'role': 'menuitemcheckbox',
                            '[attr.aria-checked]': 'checked || null',
                            '[attr.aria-disabled]': 'disabled || null',
                        },
                        providers: [{ provide: CdkMenuItemSelectable, useExisting: CdkMenuItemCheckbox }],
                    },] }
        ];
        return CdkMenuItemCheckbox;
    }(CdkMenuItemSelectable));

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    /**
     * A directive to be combined with CdkMenuItem which opens the Menu it is bound to. If the
     * element is in a top level MenuBar it will open the menu on click, or if a sibling is already
     * opened it will open on hover. If it is inside of a Menu it will open the attached Submenu on
     * hover regardless of its sibling state.
     *
     * The directive must be placed along with the `cdkMenuItem` directive in order to enable full
     * functionality.
     */
    var CdkMenuItemTrigger = /** @class */ (function () {
        function CdkMenuItemTrigger(
        /** The MenuItem instance which is the trigger  */
        _menuItemInstance) {
            this._menuItemInstance = _menuItemInstance;
        }
        CdkMenuItemTrigger.prototype.ngAfterContentInit = function () {
            this._setHasSubmenu();
        };
        /** Set the hasSubmenu property on the menuitem  */
        CdkMenuItemTrigger.prototype._setHasSubmenu = function () {
            if (this._menuItemInstance) {
                this._menuItemInstance.hasSubmenu = this._hasSubmenu();
            }
        };
        /** Return true if the trigger has an attached menu */
        CdkMenuItemTrigger.prototype._hasSubmenu = function () {
            return !!this._menuPanel;
        };
        CdkMenuItemTrigger.decorators = [
            { type: core.Directive, args: [{
                        selector: '[cdkMenuItem][cdkMenuTriggerFor]',
                        exportAs: 'cdkMenuTriggerFor',
                        host: {
                            'aria-haspopup': 'menu',
                        },
                    },] }
        ];
        CdkMenuItemTrigger.ctorParameters = function () { return [
            { type: CdkMenuItem, decorators: [{ type: core.Self }, { type: core.Optional }] }
        ]; };
        CdkMenuItemTrigger.propDecorators = {
            _menuPanel: [{ type: core.Input, args: ['cdkMenuTriggerFor',] }]
        };
        return CdkMenuItemTrigger;
    }());

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var EXPORTED_DECLARATIONS = [
        CdkMenuBar,
        CdkMenu,
        CdkMenuPanel,
        CdkMenuItem,
        CdkMenuItemRadio,
        CdkMenuItemCheckbox,
        CdkMenuItemTrigger,
        CdkMenuGroup,
    ];
    var CdkMenuModule = /** @class */ (function () {
        function CdkMenuModule() {
        }
        CdkMenuModule.decorators = [
            { type: core.NgModule, args: [{
                        exports: EXPORTED_DECLARATIONS,
                        declarations: EXPORTED_DECLARATIONS,
                    },] }
        ];
        return CdkMenuModule;
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

    exports.CdkMenu = CdkMenu;
    exports.CdkMenuBar = CdkMenuBar;
    exports.CdkMenuGroup = CdkMenuGroup;
    exports.CdkMenuItem = CdkMenuItem;
    exports.CdkMenuItemCheckbox = CdkMenuItemCheckbox;
    exports.CdkMenuItemRadio = CdkMenuItemRadio;
    exports.CdkMenuItemTrigger = CdkMenuItemTrigger;
    exports.CdkMenuModule = CdkMenuModule;
    exports.CdkMenuPanel = CdkMenuPanel;
    exports.ɵangular_material_src_cdk_experimental_menu_menu_a = CdkMenuItemSelectable;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=cdk-experimental-menu.umd.js.map
