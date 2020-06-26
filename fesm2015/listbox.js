import { Directive, Inject, forwardRef, Input, EventEmitter, ContentChildren, Output, NgModule } from '@angular/core';
import { coerceBooleanProperty } from '@angular/cdk/coercion';

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
let nextId = 0;
/**
 * Directive that applies interaction patterns to an element following the aria role of option.
 * Typically meant to be placed inside a listbox. Logic handling selection, disabled state, and
 * value is built in.
 */
let CdkOption = /** @class */ (() => {
    class CdkOption {
        constructor(listbox) {
            this.listbox = listbox;
            this._selected = false;
            /** The id of the option, set to a uniqueid if the user does not provide one */
            this.id = `cdk-option-${nextId++}`;
        }
        /** Whether the option is selected or not */
        get selected() {
            return this._selected;
        }
        set selected(value) {
            this._selected = coerceBooleanProperty(value);
        }
        /** Toggles the selected state, emits a change event through the injected listbox */
        toggle() {
            this.selected = !this.selected;
            this.listbox._emitChangeEvent(this);
        }
    }
    CdkOption.decorators = [
        { type: Directive, args: [{
                    selector: '[cdkOption]',
                    exportAs: 'cdkOption',
                    host: {
                        role: 'option',
                        '(click)': 'toggle()',
                        '[attr.aria-selected]': 'selected || null',
                        '[id]': 'id',
                    }
                },] }
    ];
    CdkOption.ctorParameters = () => [
        { type: CdkListbox, decorators: [{ type: Inject, args: [forwardRef(() => CdkListbox),] }] }
    ];
    CdkOption.propDecorators = {
        selected: [{ type: Input }],
        id: [{ type: Input }]
    };
    return CdkOption;
})();
/**
 * Directive that applies interaction patterns to an element following the aria role of listbox.
 * Typically CdkOption elements are placed inside the listbox. Logic to handle keyboard navigation,
 * selection of options, active options, and disabled states is built in.
 */
let CdkListbox = /** @class */ (() => {
    class CdkListbox {
        constructor() {
            this.selectionChange = new EventEmitter();
        }
        /** Emits a selection change event, called when an option has its selected state changed */
        _emitChangeEvent(option) {
            this.selectionChange.emit(new ListboxSelectionChangeEvent(this, option));
        }
        /** Sets the given option's selected state to true */
        select(option) {
            option.selected = true;
        }
        /** Sets the given option's selected state to null. Null is preferable for screen readers */
        deselect(option) {
            option.selected = false;
        }
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
    CdkListbox.propDecorators = {
        _options: [{ type: ContentChildren, args: [CdkOption, { descendants: true },] }],
        selectionChange: [{ type: Output }]
    };
    return CdkListbox;
})();
/** Change event that is being fired whenever the selected state of an option changes. */
class ListboxSelectionChangeEvent {
    constructor(
    /** Reference to the listbox that emitted the event. */
    source, 
    /** Reference to the option that has been changed. */
    option) {
        this.source = source;
        this.option = option;
    }
}

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

export { CdkListbox, CdkListboxModule, CdkOption, ListboxSelectionChangeEvent };
//# sourceMappingURL=listbox.js.map
