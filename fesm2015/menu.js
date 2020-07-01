import { EventEmitter, Directive, Input, Output, NgModule } from '@angular/core';
import { coerceBooleanProperty } from '@angular/cdk/coercion';

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
class CdkMenu {
    constructor() {
        /**
         * Sets the aria-orientation attribute and determines where sub-menus will be opened.
         * Does not affect styling/layout.
         */
        this.orientation = 'vertical';
        /** Event emitted when the menu is closed. */
        this.closed = new EventEmitter();
    }
}
CdkMenu.decorators = [
    { type: Directive, args: [{
                selector: '[cdkMenu]',
                exportAs: 'cdkMenu',
                host: {
                    'role': 'menubar',
                    '[attr.aria-orientation]': 'orientation',
                },
            },] }
];
CdkMenu.propDecorators = {
    orientation: [{ type: Input, args: ['cdkMenuOrientation',] }],
    closed: [{ type: Output }],
    change: [{ type: Output }]
};

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
class CdkMenuBar {
    constructor() {
        /**
         * Sets the aria-orientation attribute and determines where sub-menus will be opened.
         * Does not affect styling/layout.
         */
        this.orientation = 'horizontal';
    }
}
CdkMenuBar.decorators = [
    { type: Directive, args: [{
                selector: '[cdkMenuBar]',
                exportAs: 'cdkMenuBar',
                host: {
                    'role': 'menubar',
                    '[attr.aria-orientation]': 'orientation',
                },
            },] }
];
CdkMenuBar.propDecorators = {
    orientation: [{ type: Input, args: ['cdkMenuBarOrientation',] }]
};

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
class CdkMenuPanel {
}
CdkMenuPanel.decorators = [
    { type: Directive, args: [{ selector: 'ng-template[cdkMenuPanel]', exportAs: 'cdkMenuPanel' },] }
];

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
class CdkMenuItem {
    constructor() {
        /** ARIA role for the menu item. */
        this.role = 'menuitem';
        this._checked = false;
        /** Emits when the attached submenu is opened */
        this.opened = new EventEmitter();
    }
    /** Whether the checkbox or radiobutton is checked */
    get checked() {
        return this._checked;
    }
    set checked(value) {
        this._checked = coerceBooleanProperty(value);
    }
    /** get the aria-checked value only if element is `menuitemradio` or `menuitemcheckbox` */
    _getAriaChecked() {
        if (this.role === 'menuitem') {
            return null;
        }
        return this.checked;
    }
    /** Whether the menu item opens a menu */
    hasSubmenu() {
        return !!this._menuPanel;
    }
}
CdkMenuItem.decorators = [
    { type: Directive, args: [{
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
    _menuPanel: [{ type: Input, args: ['cdkMenuTriggerFor',] }],
    role: [{ type: Input }],
    checked: [{ type: Input }],
    opened: [{ type: Output }]
};

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
class CdkMenuGroup {
    constructor() {
        /** Emits the element when checkbox or radiobutton state changed  */
        this.change = new EventEmitter();
    }
}
CdkMenuGroup.decorators = [
    { type: Directive, args: [{
                selector: '[cdkMenuGroup]',
                exportAs: 'cdkMenuGroup',
                host: {
                    'role': 'group',
                },
            },] }
];
CdkMenuGroup.propDecorators = {
    change: [{ type: Output }]
};

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const EXPORTED_DECLARATIONS = [CdkMenuBar, CdkMenu, CdkMenuPanel, CdkMenuItem, CdkMenuGroup];
class CdkMenuModule {
}
CdkMenuModule.decorators = [
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

export { CdkMenu, CdkMenuBar, CdkMenuGroup, CdkMenuItem, CdkMenuModule, CdkMenuPanel };
//# sourceMappingURL=menu.js.map
