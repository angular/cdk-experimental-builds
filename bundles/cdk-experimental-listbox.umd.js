(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core')) :
    typeof define === 'function' && define.amd ? define('@angular/cdk-experimental/listbox', ['exports', '@angular/core'], factory) :
    (global = global || self, factory((global.ng = global.ng || {}, global.ng.cdkExperimental = global.ng.cdkExperimental || {}, global.ng.cdkExperimental.listbox = {}), global.ng.core));
}(this, (function (exports, core) { 'use strict';

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var CdkOption = /** @class */ (function () {
        function CdkOption() {
        }
        CdkOption.decorators = [
            { type: core.Directive, args: [{
                        selector: '[cdkOption]',
                        exportAs: 'cdkOption',
                        host: {
                            role: 'option',
                        }
                    },] }
        ];
        return CdkOption;
    }());
    var CdkListbox = /** @class */ (function () {
        function CdkListbox() {
        }
        CdkListbox.decorators = [
            { type: core.Directive, args: [{
                        selector: '[cdkListbox]',
                        exportAs: 'cdkListbox',
                        host: {
                            role: 'listbox',
                        }
                    },] }
        ];
        return CdkListbox;
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

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=cdk-experimental-listbox.umd.js.map
