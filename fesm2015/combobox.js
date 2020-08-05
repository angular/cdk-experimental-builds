import { Directive, NgModule } from '@angular/core';

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class CdkCombobox {
}
CdkCombobox.decorators = [
    { type: Directive, args: [{
                selector: '[cdkCombobox]',
                exportAs: 'cdkCombobox',
                host: {
                    'role': 'combobox'
                }
            },] }
];

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class CdkComboboxPanel {
}
CdkComboboxPanel.decorators = [
    { type: Directive, args: [{
                selector: 'ng-template[cdkComboboxPanel]',
                exportAs: 'cdkComboboxPanel',
            },] }
];

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const EXPORTED_DECLARATIONS = [CdkCombobox, CdkComboboxPanel];
class CdkComboboxModule {
}
CdkComboboxModule.decorators = [
    { type: NgModule, args: [{
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

export { CdkCombobox, CdkComboboxModule, CdkComboboxPanel };
//# sourceMappingURL=combobox.js.map
