import { EventEmitter, Directive, Output, Input, NgModule } from '@angular/core';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { takeUntil } from 'rxjs/operators';

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
let CdkMenuGroup = /** @class */ (() => {
    class CdkMenuGroup {
        constructor() {
            /** Emits the element when checkbox or radiobutton state changed  */
            this.change = new EventEmitter();
        }
        /**
         * Emits events for the clicked MenuItem
         * @param menuItem The clicked MenuItem to handle
         */
        _registerTriggeredItem(menuItem) {
            if (menuItem.role !== 'menuitem') {
                this.change.emit(menuItem);
            }
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
    return CdkMenuGroup;
})();

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
let CdkMenu = /** @class */ (() => {
    class CdkMenu extends CdkMenuGroup {
        constructor() {
            super(...arguments);
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
                        'role': 'menu',
                        '[attr.aria-orientation]': 'orientation',
                    },
                    providers: [{ provide: CdkMenuGroup, useExisting: CdkMenu }],
                },] }
    ];
    CdkMenu.propDecorators = {
        orientation: [{ type: Input, args: ['cdkMenuOrientation',] }],
        closed: [{ type: Output }]
    };
    return CdkMenu;
})();

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
let CdkMenuBar = /** @class */ (() => {
    class CdkMenuBar extends CdkMenuGroup {
        constructor() {
            super(...arguments);
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
                    providers: [{ provide: CdkMenuGroup, useExisting: CdkMenuBar }],
                },] }
    ];
    CdkMenuBar.propDecorators = {
        orientation: [{ type: Input, args: ['cdkMenuBarOrientation',] }]
    };
    return CdkMenuBar;
})();

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
let CdkMenuPanel = /** @class */ (() => {
    class CdkMenuPanel {
    }
    CdkMenuPanel.decorators = [
        { type: Directive, args: [{ selector: 'ng-template[cdkMenuPanel]', exportAs: 'cdkMenuPanel' },] }
    ];
    return CdkMenuPanel;
})();

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
let CdkMenuItem = /** @class */ (() => {
    class CdkMenuItem {
        constructor(
        /** reference a parent CdkMenuGroup component */
        _menuGroup) {
            this._menuGroup = _menuGroup;
            /** ARIA role for the menu item. */
            this.role = 'menuitem';
            this._checked = false;
            this._disabled = false;
            /** Emits when the attached submenu is opened */
            this.opened = new EventEmitter();
            /** Emits when the component gets destroyed */
            this._destroyed = new EventEmitter();
        }
        /** Whether the checkbox or radiobutton is checked */
        get checked() {
            return this._checked;
        }
        set checked(value) {
            this._checked = coerceBooleanProperty(value);
        }
        /**  Whether the CdkMenuItem is disabled - defaults to false */
        get disabled() {
            return this._disabled;
        }
        set disabled(value) {
            this._disabled = coerceBooleanProperty(value);
        }
        /** Configure event subscriptions */
        ngAfterContentInit() {
            if (this.role !== 'menuitem') {
                this._menuGroup.change
                    .pipe(takeUntil(this._destroyed))
                    .subscribe((button) => this._toggleCheckedState(button));
            }
        }
        /**
         * If the role is menuitemcheckbox or menuitemradio and not disabled, emits a change event
         * on the enclosing parent MenuGroup.
         */
        trigger() {
            if (this.disabled) {
                return;
            }
            if (this.hasSubmenu()) {
                // TODO(andy): open the menu
            }
            this._menuGroup._registerTriggeredItem(this);
        }
        /** Whether the menu item opens a menu */
        hasSubmenu() {
            return !!this._menuPanel;
        }
        /** get the aria-checked value only if element is `menuitemradio` or `menuitemcheckbox` */
        _getAriaChecked() {
            if (this.role === 'menuitem') {
                return null;
            }
            return this.checked;
        }
        /**
         * Toggle the checked state of the menuitemradio or menuitemcheckbox component
         */
        _toggleCheckedState(selected) {
            if (this.role === 'menuitemradio') {
                this.checked = selected === this;
            }
            else if (this.role === 'menuitemcheckbox' && selected === this) {
                this.checked = !this.checked;
            }
        }
        ngOnDestroy() {
            this._destroyed.next();
            this._destroyed.complete();
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
                        '[attr.aria-disabled]': 'disabled || null',
                    },
                },] }
    ];
    CdkMenuItem.ctorParameters = () => [
        { type: CdkMenuGroup }
    ];
    CdkMenuItem.propDecorators = {
        _menuPanel: [{ type: Input, args: ['cdkMenuTriggerFor',] }],
        role: [{ type: Input }],
        checked: [{ type: Input }],
        disabled: [{ type: Input }],
        opened: [{ type: Output }]
    };
    return CdkMenuItem;
})();

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const EXPORTED_DECLARATIONS = [CdkMenuBar, CdkMenu, CdkMenuPanel, CdkMenuItem, CdkMenuGroup];
let CdkMenuModule = /** @class */ (() => {
    class CdkMenuModule {
    }
    CdkMenuModule.decorators = [
        { type: NgModule, args: [{
                    exports: EXPORTED_DECLARATIONS,
                    declarations: EXPORTED_DECLARATIONS,
                },] }
    ];
    return CdkMenuModule;
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

export { CdkMenu, CdkMenuBar, CdkMenuGroup, CdkMenuItem, CdkMenuModule, CdkMenuPanel };
//# sourceMappingURL=menu.js.map
