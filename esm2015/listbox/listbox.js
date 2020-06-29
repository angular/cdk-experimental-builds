/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ContentChildren, Directive, EventEmitter, forwardRef, Inject, Input, Output, QueryList } from '@angular/core';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
let nextId = 0;
/**
 * Directive that applies interaction patterns to an element following the aria role of option.
 * Typically meant to be placed inside a listbox. Logic handling selection, disabled state, and
 * value is built in.
 */
export class CdkOption {
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
/**
 * Directive that applies interaction patterns to an element following the aria role of listbox.
 * Typically CdkOption elements are placed inside the listbox. Logic to handle keyboard navigation,
 * selection of options, active options, and disabled states is built in.
 */
export class CdkListbox {
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
/** Change event that is being fired whenever the selected state of an option changes. */
export class ListboxSelectionChangeEvent {
    constructor(
    /** Reference to the listbox that emitted the event. */
    source, 
    /** Reference to the option that has been changed. */
    option) {
        this.source = source;
        this.option = option;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdGJveC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL2xpc3Rib3gvbGlzdGJveC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQ0wsZUFBZSxFQUNmLFNBQVMsRUFDVCxZQUFZLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFDaEMsS0FBSyxFQUFFLE1BQU0sRUFDYixTQUFTLEVBQ1YsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFlLHFCQUFxQixFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFFMUUsSUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDO0FBRWY7Ozs7R0FJRztBQVdILE1BQU0sT0FBTyxTQUFTO0lBZXBCLFlBQXlELE9BQW1CO1FBQW5CLFlBQU8sR0FBUCxPQUFPLENBQVk7UUFkcEUsY0FBUyxHQUFZLEtBQUssQ0FBQztRQVduQywrRUFBK0U7UUFDdEUsT0FBRSxHQUFHLGNBQWMsTUFBTSxFQUFFLEVBQUUsQ0FBQztJQUV3QyxDQUFDO0lBWmhGLDRDQUE0QztJQUM1QyxJQUNJLFFBQVE7UUFDVixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUM7SUFDeEIsQ0FBQztJQUNELElBQUksUUFBUSxDQUFDLEtBQWM7UUFDekIsSUFBSSxDQUFDLFNBQVMsR0FBRyxxQkFBcUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNoRCxDQUFDO0lBT0Qsb0ZBQW9GO0lBQ3BGLE1BQU07UUFDSixJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQztRQUMvQixJQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3RDLENBQUM7OztZQS9CRixTQUFTLFNBQUM7Z0JBQ1QsUUFBUSxFQUFFLGFBQWE7Z0JBQ3ZCLFFBQVEsRUFBRSxXQUFXO2dCQUNyQixJQUFJLEVBQUU7b0JBQ0osSUFBSSxFQUFFLFFBQVE7b0JBQ2QsU0FBUyxFQUFFLFVBQVU7b0JBQ3JCLHNCQUFzQixFQUFFLGtCQUFrQjtvQkFDMUMsTUFBTSxFQUFFLElBQUk7aUJBQ2I7YUFDRjs7O1lBZ0JtRSxVQUFVLHVCQUEvRCxNQUFNLFNBQUMsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDLFVBQVUsQ0FBQzs7O3VCQVgvQyxLQUFLO2lCQVNMLEtBQUs7O0FBYVI7Ozs7R0FJRztBQVFILE1BQU0sT0FBTyxVQUFVO0lBUHZCO1FBWXFCLG9CQUFlLEdBQzlCLElBQUksWUFBWSxFQUErQixDQUFDO0lBZ0J0RCxDQUFDO0lBZEMsMkZBQTJGO0lBQzNGLGdCQUFnQixDQUFDLE1BQWlCO1FBQ2hDLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLElBQUksMkJBQTJCLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFDM0UsQ0FBQztJQUVELHFEQUFxRDtJQUNyRCxNQUFNLENBQUMsTUFBaUI7UUFDdEIsTUFBTSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7SUFDekIsQ0FBQztJQUVELDRGQUE0RjtJQUM1RixRQUFRLENBQUMsTUFBaUI7UUFDeEIsTUFBTSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7SUFDMUIsQ0FBQzs7O1lBNUJGLFNBQVMsU0FBQztnQkFDVCxRQUFRLEVBQUUsY0FBYztnQkFDeEIsUUFBUSxFQUFFLFlBQVk7Z0JBQ3RCLElBQUksRUFBRTtvQkFDSixJQUFJLEVBQUUsU0FBUztpQkFDaEI7YUFDRjs7O3VCQUlFLGVBQWUsU0FBQyxTQUFTLEVBQUUsRUFBQyxXQUFXLEVBQUUsSUFBSSxFQUFDOzhCQUU5QyxNQUFNOztBQW1CVCx5RkFBeUY7QUFDekYsTUFBTSxPQUFPLDJCQUEyQjtJQUN0QztJQUNFLHVEQUF1RDtJQUNoRCxNQUFrQjtJQUN6QixxREFBcUQ7SUFDOUMsTUFBaUI7UUFGakIsV0FBTSxHQUFOLE1BQU0sQ0FBWTtRQUVsQixXQUFNLEdBQU4sTUFBTSxDQUFXO0lBQUcsQ0FBQztDQUMvQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1xuICBDb250ZW50Q2hpbGRyZW4sXG4gIERpcmVjdGl2ZSxcbiAgRXZlbnRFbWl0dGVyLCBmb3J3YXJkUmVmLCBJbmplY3QsXG4gIElucHV0LCBPdXRwdXQsXG4gIFF1ZXJ5TGlzdFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7Qm9vbGVhbklucHV0LCBjb2VyY2VCb29sZWFuUHJvcGVydHl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2VyY2lvbic7XG5cbmxldCBuZXh0SWQgPSAwO1xuXG4vKipcbiAqIERpcmVjdGl2ZSB0aGF0IGFwcGxpZXMgaW50ZXJhY3Rpb24gcGF0dGVybnMgdG8gYW4gZWxlbWVudCBmb2xsb3dpbmcgdGhlIGFyaWEgcm9sZSBvZiBvcHRpb24uXG4gKiBUeXBpY2FsbHkgbWVhbnQgdG8gYmUgcGxhY2VkIGluc2lkZSBhIGxpc3Rib3guIExvZ2ljIGhhbmRsaW5nIHNlbGVjdGlvbiwgZGlzYWJsZWQgc3RhdGUsIGFuZFxuICogdmFsdWUgaXMgYnVpbHQgaW4uXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tjZGtPcHRpb25dJyxcbiAgZXhwb3J0QXM6ICdjZGtPcHRpb24nLFxuICBob3N0OiB7XG4gICAgcm9sZTogJ29wdGlvbicsXG4gICAgJyhjbGljayknOiAndG9nZ2xlKCknLFxuICAgICdbYXR0ci5hcmlhLXNlbGVjdGVkXSc6ICdzZWxlY3RlZCB8fCBudWxsJyxcbiAgICAnW2lkXSc6ICdpZCcsXG4gIH1cbn0pXG5leHBvcnQgY2xhc3MgQ2RrT3B0aW9uIHtcbiAgcHJpdmF0ZSBfc2VsZWN0ZWQ6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAvKiogV2hldGhlciB0aGUgb3B0aW9uIGlzIHNlbGVjdGVkIG9yIG5vdCAqL1xuICBASW5wdXQoKVxuICBnZXQgc2VsZWN0ZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX3NlbGVjdGVkO1xuICB9XG4gIHNldCBzZWxlY3RlZCh2YWx1ZTogYm9vbGVhbikge1xuICAgIHRoaXMuX3NlbGVjdGVkID0gY29lcmNlQm9vbGVhblByb3BlcnR5KHZhbHVlKTtcbiAgfVxuXG4gIC8qKiBUaGUgaWQgb2YgdGhlIG9wdGlvbiwgc2V0IHRvIGEgdW5pcXVlaWQgaWYgdGhlIHVzZXIgZG9lcyBub3QgcHJvdmlkZSBvbmUgKi9cbiAgQElucHV0KCkgaWQgPSBgY2RrLW9wdGlvbi0ke25leHRJZCsrfWA7XG5cbiAgY29uc3RydWN0b3IoQEluamVjdChmb3J3YXJkUmVmKCgpID0+IENka0xpc3Rib3gpKSBwdWJsaWMgbGlzdGJveDogQ2RrTGlzdGJveCkge31cblxuICAvKiogVG9nZ2xlcyB0aGUgc2VsZWN0ZWQgc3RhdGUsIGVtaXRzIGEgY2hhbmdlIGV2ZW50IHRocm91Z2ggdGhlIGluamVjdGVkIGxpc3Rib3ggKi9cbiAgdG9nZ2xlKCkge1xuICAgIHRoaXMuc2VsZWN0ZWQgPSAhdGhpcy5zZWxlY3RlZDtcbiAgICB0aGlzLmxpc3Rib3guX2VtaXRDaGFuZ2VFdmVudCh0aGlzKTtcbiAgfVxuXG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zZWxlY3RlZDogQm9vbGVhbklucHV0O1xufVxuXG4vKipcbiAqIERpcmVjdGl2ZSB0aGF0IGFwcGxpZXMgaW50ZXJhY3Rpb24gcGF0dGVybnMgdG8gYW4gZWxlbWVudCBmb2xsb3dpbmcgdGhlIGFyaWEgcm9sZSBvZiBsaXN0Ym94LlxuICogVHlwaWNhbGx5IENka09wdGlvbiBlbGVtZW50cyBhcmUgcGxhY2VkIGluc2lkZSB0aGUgbGlzdGJveC4gTG9naWMgdG8gaGFuZGxlIGtleWJvYXJkIG5hdmlnYXRpb24sXG4gKiBzZWxlY3Rpb24gb2Ygb3B0aW9ucywgYWN0aXZlIG9wdGlvbnMsIGFuZCBkaXNhYmxlZCBzdGF0ZXMgaXMgYnVpbHQgaW4uXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tjZGtMaXN0Ym94XScsXG4gIGV4cG9ydEFzOiAnY2RrTGlzdGJveCcsXG4gIGhvc3Q6IHtcbiAgICByb2xlOiAnbGlzdGJveCcsXG4gIH1cbn0pXG5leHBvcnQgY2xhc3MgQ2RrTGlzdGJveCB7XG5cbiAgLyoqIEEgcXVlcnkgbGlzdCBjb250YWluaW5nIGFsbCBDZGtPcHRpb24gZWxlbWVudHMgd2l0aGluIHRoaXMgbGlzdGJveCAqL1xuICBAQ29udGVudENoaWxkcmVuKENka09wdGlvbiwge2Rlc2NlbmRhbnRzOiB0cnVlfSkgX29wdGlvbnM6IFF1ZXJ5TGlzdDxDZGtPcHRpb24+O1xuXG4gIEBPdXRwdXQoKSByZWFkb25seSBzZWxlY3Rpb25DaGFuZ2U6IEV2ZW50RW1pdHRlcjxMaXN0Ym94U2VsZWN0aW9uQ2hhbmdlRXZlbnQ+ID1cbiAgICAgIG5ldyBFdmVudEVtaXR0ZXI8TGlzdGJveFNlbGVjdGlvbkNoYW5nZUV2ZW50PigpO1xuXG4gIC8qKiBFbWl0cyBhIHNlbGVjdGlvbiBjaGFuZ2UgZXZlbnQsIGNhbGxlZCB3aGVuIGFuIG9wdGlvbiBoYXMgaXRzIHNlbGVjdGVkIHN0YXRlIGNoYW5nZWQgKi9cbiAgX2VtaXRDaGFuZ2VFdmVudChvcHRpb246IENka09wdGlvbikge1xuICAgIHRoaXMuc2VsZWN0aW9uQ2hhbmdlLmVtaXQobmV3IExpc3Rib3hTZWxlY3Rpb25DaGFuZ2VFdmVudCh0aGlzLCBvcHRpb24pKTtcbiAgfVxuXG4gIC8qKiBTZXRzIHRoZSBnaXZlbiBvcHRpb24ncyBzZWxlY3RlZCBzdGF0ZSB0byB0cnVlICovXG4gIHNlbGVjdChvcHRpb246IENka09wdGlvbikge1xuICAgIG9wdGlvbi5zZWxlY3RlZCA9IHRydWU7XG4gIH1cblxuICAvKiogU2V0cyB0aGUgZ2l2ZW4gb3B0aW9uJ3Mgc2VsZWN0ZWQgc3RhdGUgdG8gbnVsbC4gTnVsbCBpcyBwcmVmZXJhYmxlIGZvciBzY3JlZW4gcmVhZGVycyAqL1xuICBkZXNlbGVjdChvcHRpb246IENka09wdGlvbikge1xuICAgIG9wdGlvbi5zZWxlY3RlZCA9IGZhbHNlO1xuICB9XG59XG5cbi8qKiBDaGFuZ2UgZXZlbnQgdGhhdCBpcyBiZWluZyBmaXJlZCB3aGVuZXZlciB0aGUgc2VsZWN0ZWQgc3RhdGUgb2YgYW4gb3B0aW9uIGNoYW5nZXMuICovXG5leHBvcnQgY2xhc3MgTGlzdGJveFNlbGVjdGlvbkNoYW5nZUV2ZW50IHtcbiAgY29uc3RydWN0b3IoXG4gICAgLyoqIFJlZmVyZW5jZSB0byB0aGUgbGlzdGJveCB0aGF0IGVtaXR0ZWQgdGhlIGV2ZW50LiAqL1xuICAgIHB1YmxpYyBzb3VyY2U6IENka0xpc3Rib3gsXG4gICAgLyoqIFJlZmVyZW5jZSB0byB0aGUgb3B0aW9uIHRoYXQgaGFzIGJlZW4gY2hhbmdlZC4gKi9cbiAgICBwdWJsaWMgb3B0aW9uOiBDZGtPcHRpb24pIHt9XG59XG4iXX0=