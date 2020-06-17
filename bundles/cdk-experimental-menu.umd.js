(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('@angular/cdk/coercion'), require('rxjs/operators')) :
    typeof define === 'function' && define.amd ? define('@angular/cdk-experimental/menu', ['exports', '@angular/core', '@angular/cdk/coercion', 'rxjs/operators'], factory) :
    (global = global || self, factory((global.ng = global.ng || {}, global.ng.cdkExperimental = global.ng.cdkExperimental || {}, global.ng.cdkExperimental.menu = {}), global.ng.core, global.ng.cdk.coercion, global.rxjs.operators));
}(this, (function (exports, core, coercion, operators) { 'use strict';

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
     * Directive which acts as a grouping container for `CdkMenuItem` instances with
     * `role="menuitemradio"`, similar to a `role="radiogroup"` element.
     */
    var CdkMenuGroup = /** @class */ (function () {
        function CdkMenuGroup() {
            /** Emits the element when checkbox or radiobutton state changed  */
            this.change = new core.EventEmitter();
        }
        /**
         * Emits events for the clicked MenuItem
         * @param menuItem The clicked MenuItem to handle
         */
        CdkMenuGroup.prototype._registerTriggeredItem = function (menuItem) {
            if (menuItem.role !== 'menuitem') {
                this.change.emit(menuItem);
            }
        };
        CdkMenuGroup.decorators = [
            { type: core.Directive, args: [{
                        selector: '[cdkMenuGroup]',
                        exportAs: 'cdkMenuGroup',
                        host: {
                            'role': 'group',
                        },
                    },] }
        ];
        CdkMenuGroup.propDecorators = {
            change: [{ type: core.Output }]
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
     * contains accessable keyboard and mouse handling logic.
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
            closed: [{ type: core.Output }]
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
     * role, aria attributes, and accessable keyboard and mouse handling logic. The component that
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
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    /**
     * Directive which provides behavior for an element which when clicked:
     *  If located in a CdkMenuBar:
     *    - opens up an attached submenu
     *
     *  If located in a CdkMenu/CdkMenuGroup, one of:
     *    - executes the user defined click handler
     *    - toggles its checkbox state
     *    - toggles its radio button state (in relation to siblings)
     *
     * If it's in a CdkMenu and it triggers a sub-menu, hovering over the
     * CdkMenuItem will open the submenu.
     *
     */
    var CdkMenuItem = /** @class */ (function () {
        function CdkMenuItem(
        /** reference a parent CdkMenuGroup component */
        _menuGroup) {
            this._menuGroup = _menuGroup;
            /** ARIA role for the menu item. */
            this.role = 'menuitem';
            this._checked = false;
            this._disabled = false;
            /** Emits when the attached submenu is opened */
            this.opened = new core.EventEmitter();
            /** Emits when the component gets destroyed */
            this._destroyed = new core.EventEmitter();
        }
        Object.defineProperty(CdkMenuItem.prototype, "checked", {
            /** Whether the checkbox or radiobutton is checked */
            get: function () {
                return this._checked;
            },
            set: function (value) {
                this._checked = coercion.coerceBooleanProperty(value);
            },
            enumerable: false,
            configurable: true
        });
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
        /** Configure event subscriptions */
        CdkMenuItem.prototype.ngAfterContentInit = function () {
            var _this = this;
            if (this.role !== 'menuitem') {
                this._menuGroup.change
                    .pipe(operators.takeUntil(this._destroyed))
                    .subscribe(function (button) { return _this._toggleCheckedState(button); });
            }
        };
        /**
         * If the role is menuitemcheckbox or menuitemradio and not disabled, emits a change event
         * on the enclosing parent MenuGroup.
         */
        CdkMenuItem.prototype.trigger = function () {
            if (this.disabled) {
                return;
            }
            if (this.hasSubmenu()) {
                // TODO(andy): open the menu
            }
            this._menuGroup._registerTriggeredItem(this);
        };
        /** Whether the menu item opens a menu */
        CdkMenuItem.prototype.hasSubmenu = function () {
            return !!this._menuPanel;
        };
        /** get the aria-checked value only if element is `menuitemradio` or `menuitemcheckbox` */
        CdkMenuItem.prototype._getAriaChecked = function () {
            if (this.role === 'menuitem') {
                return null;
            }
            return this.checked;
        };
        /**
         * Toggle the checked state of the menuitemradio or menuitemcheckbox component
         */
        CdkMenuItem.prototype._toggleCheckedState = function (selected) {
            if (this.role === 'menuitemradio') {
                this.checked = selected === this;
            }
            else if (this.role === 'menuitemcheckbox' && selected === this) {
                this.checked = !this.checked;
            }
        };
        CdkMenuItem.prototype.ngOnDestroy = function () {
            this._destroyed.next();
            this._destroyed.complete();
        };
        CdkMenuItem.decorators = [
            { type: core.Directive, args: [{
                        selector: '[cdkMenuItem], [cdkMenuTriggerFor]',
                        exportAs: 'cdkMenuItem',
                        host: {
                            'type': 'button',
                            '[attr.role]': 'role',
                            '[attr.aria-checked]': '_getAriaChecked()',
                            '[attr.aria-disabled]': 'disabled || null',
                        },
                    },] }
        ];
        CdkMenuItem.ctorParameters = function () { return [
            { type: CdkMenuGroup }
        ]; };
        CdkMenuItem.propDecorators = {
            _menuPanel: [{ type: core.Input, args: ['cdkMenuTriggerFor',] }],
            role: [{ type: core.Input }],
            checked: [{ type: core.Input }],
            disabled: [{ type: core.Input }],
            opened: [{ type: core.Output }]
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
    var EXPORTED_DECLARATIONS = [CdkMenuBar, CdkMenu, CdkMenuPanel, CdkMenuItem, CdkMenuGroup];
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
    exports.CdkMenuModule = CdkMenuModule;
    exports.CdkMenuPanel = CdkMenuPanel;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=cdk-experimental-menu.umd.js.map
