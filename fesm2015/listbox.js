import { Directive, NgModule } from '@angular/core';

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
let CdkOption = /** @class */ (() => {
    class CdkOption {
    }
    CdkOption.decorators = [
        { type: Directive, args: [{
                    selector: '[cdkOption]',
                    exportAs: 'cdkOption',
                    host: {
                        role: 'option',
                    }
                },] }
    ];
    return CdkOption;
})();
let CdkListbox = /** @class */ (() => {
    class CdkListbox {
    }
    CdkListbox.decorators = [
        { type: Directive, args: [{
                    selector: '[cdkListbox]',
                    exportAs: 'cdkListbox',
                    host: {
                        role: 'listbox',
                    }
                },] }
    ];
    return CdkListbox;
})();

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const EXPORTED_DECLARATIONS = [CdkListbox, CdkOption];
let CdkListboxModule = /** @class */ (() => {
    class CdkListboxModule {
    }
    CdkListboxModule.decorators = [
        { type: NgModule, args: [{
                    exports: EXPORTED_DECLARATIONS,
                    declarations: EXPORTED_DECLARATIONS,
                },] }
    ];
    return CdkListboxModule;
})();

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

export { CdkListbox, CdkListboxModule, CdkOption };
//# sourceMappingURL=listbox.js.map
