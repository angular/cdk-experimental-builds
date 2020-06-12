(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('@angular/cdk/coercion')) :
    typeof define === 'function' && define.amd ? define('@angular/cdk-experimental/menu', ['exports', '@angular/core', '@angular/cdk/coercion'], factory) :
    (global = global || self, factory((global.ng = global.ng || {}, global.ng.cdkExperimental = global.ng.cdkExperimental || {}, global.ng.cdkExperimental.menu = {}), global.ng.core, global.ng.cdk.coercion));
}(this, (function (exports, core, coercion) { 'use strict';

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
    var CdkMenu = /** @class */ (function () {
        function CdkMenu() {
            /**
             * Sets the aria-orientation attribute and determines where sub-menus will be opened.
             * Does not affect styling/layout.
             */
            this.orientation = 'vertical';
            /** Event emitted when the menu is closed. */
            this.closed = new core.EventEmitter();
        }
        CdkMenu.decorators = [
            { type: core.Directive, args: [{
                        selector: '[cdkMenu]',
                        exportAs: 'cdkMenu',
                        host: {
                            'role': 'menubar',
                            '[attr.aria-orientation]': 'orientation',
                        },
                    },] }
        ];
        CdkMenu.propDecorators = {
            orientation: [{ type: core.Input, args: ['cdkMenuOrientation',] }],
            closed: [{ type: core.Output }],
            change: [{ type: core.Output }]
        };
        return CdkMenu;
    }());

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
    var CdkMenuBar = /** @class */ (function () {
        function CdkMenuBar() {
            /**
             * Sets the aria-orientation attribute and determines where sub-menus will be opened.
             * Does not affect styling/layout.
             */
            this.orientation = 'horizontal';
        }
        CdkMenuBar.decorators = [
            { type: core.Directive, args: [{
                        selector: '[cdkMenuBar]',
                        exportAs: 'cdkMenuBar',
                        host: {
                            'role': 'menubar',
                            '[attr.aria-orientation]': 'orientation',
                        },
                    },] }
        ];
        CdkMenuBar.propDecorators = {
            orientation: [{ type: core.Input, args: ['cdkMenuBarOrientation',] }]
        };
        return CdkMenuBar;
    }());

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
        function CdkMenuItem() {
            /** ARIA role for the menu item. */
            this.role = 'menuitem';
            this._checked = false;
            /** Emits when the attached submenu is opened */
            this.opened = new core.EventEmitter();
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
        /** get the aria-checked value only if element is `menuitemradio` or `menuitemcheckbox` */
        CdkMenuItem.prototype._getAriaChecked = function () {
            if (this.role === 'menuitem') {
                return null;
            }
            return this.checked;
        };
        /** Whether the menu item opens a menu */
        CdkMenuItem.prototype.hasSubmenu = function () {
            return !!this._menuPanel;
        };
        CdkMenuItem.decorators = [
            { type: core.Directive, args: [{
                        selector: '[cdkMenuItem], [cdkMenuTriggerFor]',
                        exportAs: 'cdkMenuItem',
                        host: {
                            'type': 'button',
                            '[attr.role]': 'role',
                            '[attr.aria-checked]': '_getAriaChecked()',
                        },
                    },] }
        ];
        CdkMenuItem.propDecorators = {
            _menuPanel: [{ type: core.Input, args: ['cdkMenuTriggerFor',] }],
            role: [{ type: core.Input }],
            checked: [{ type: core.Input }],
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
    /**
     * Directive which acts as a grouping container for `CdkMenuItem` instances with
     * `role="menuitemradio"`, similar to a `role="radiogroup"` element.
     */
    var CdkMenuGroup = /** @class */ (function () {
        function CdkMenuGroup() {
            /** Emits the element when checkbox or radiobutton state changed  */
            this.change = new core.EventEmitter();
        }
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
