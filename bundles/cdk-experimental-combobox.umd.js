(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core')) :
    typeof define === 'function' && define.amd ? define('@angular/cdk-experimental/combobox', ['exports', '@angular/core'], factory) :
    (global = global || self, factory((global.ng = global.ng || {}, global.ng.cdkExperimental = global.ng.cdkExperimental || {}, global.ng.cdkExperimental.combobox = {}), global.ng.core));
}(this, (function (exports, core) { 'use strict';

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var CdkCombobox = /** @class */ (function () {
        function CdkCombobox() {
        }
        CdkCombobox.decorators = [
            { type: core.Directive, args: [{
                        selector: '[cdkCombobox]',
                        exportAs: 'cdkCombobox',
                        host: {
                            'role': 'combobox'
                        }
                    },] }
        ];
        return CdkCombobox;
    }());

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var CdkComboboxPanel = /** @class */ (function () {
        function CdkComboboxPanel() {
        }
        CdkComboboxPanel.decorators = [
            { type: core.Directive, args: [{
                        selector: 'ng-template[cdkComboboxPanel]',
                        exportAs: 'cdkComboboxPanel',
                    },] }
        ];
        return CdkComboboxPanel;
    }());

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
        CdkComboboxModule.decorators = [
            { type: core.NgModule, args: [{
                        exports: EXPORTED_DECLARATIONS,
                        declarations: EXPORTED_DECLARATIONS,
                    },] }
        ];
        return CdkComboboxModule;
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

    exports.CdkCombobox = CdkCombobox;
    exports.CdkComboboxModule = CdkComboboxModule;
    exports.CdkComboboxPanel = CdkComboboxPanel;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=cdk-experimental-combobox.umd.js.map
