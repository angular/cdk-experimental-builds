/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ContentChildren, Directive, ElementRef, EventEmitter, forwardRef, Inject, Input, Output, QueryList } from '@angular/core';
import { ActiveDescendantKeyManager } from '@angular/cdk/a11y';
import { DOWN_ARROW, END, ENTER, HOME, SPACE, UP_ARROW } from '@angular/cdk/keycodes';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { SelectionModel } from '@angular/cdk/collections';
import { defer, merge, Subject } from 'rxjs';
import { startWith, switchMap, takeUntil } from 'rxjs/operators';
let nextId = 0;
export class CdkOption {
    constructor(_elementRef, listbox) {
        this._elementRef = _elementRef;
        this.listbox = listbox;
        this._selected = false;
        this._disabled = false;
        this._active = false;
        /** The id of the option, set to a uniqueid if the user does not provide one. */
        this.id = `cdk-option-${nextId++}`;
        this.selectionChange = new EventEmitter();
    }
    get selected() {
        return this._selected;
    }
    set selected(value) {
        if (!this._disabled) {
            this._selected = coerceBooleanProperty(value);
        }
    }
    get disabled() {
        return this._disabled;
    }
    set disabled(value) {
        this._disabled = coerceBooleanProperty(value);
    }
    /** Toggles the selected state, emits a change event through the injected listbox. */
    toggle() {
        if (!this._isInteractionDisabled()) {
            this.selected = !this.selected;
            this._emitSelectionChange(true);
        }
    }
    /** Sets the active property true if the option and listbox aren't disabled. */
    activate() {
        if (!this._isInteractionDisabled()) {
            this._active = true;
        }
    }
    /** Sets the active property false. */
    deactivate() {
        if (!this._isInteractionDisabled()) {
            this._active = false;
        }
    }
    /** Sets the selected property true if it was false. */
    select() {
        if (!this.selected) {
            this.selected = true;
            this._emitSelectionChange();
        }
    }
    /** Sets the selected property false if it was true. */
    deselect() {
        if (this.selected) {
            this.selected = false;
            this._emitSelectionChange();
        }
    }
    /** Applies focus to the option. */
    focus() {
        this._elementRef.nativeElement.focus();
    }
    /** Returns true if the option or listbox are disabled, and false otherwise. */
    _isInteractionDisabled() {
        return (this.listbox.disabled || this._disabled);
    }
    /** Emits a change event extending the Option Selection Change Event interface. */
    _emitSelectionChange(isUserInput = false) {
        this.selectionChange.emit({
            source: this,
            isUserInput: isUserInput
        });
    }
    /** Returns the tab index which depends on the disabled property. */
    _getTabIndex() {
        return this._isInteractionDisabled() ? null : '-1';
    }
    /** Get the label for this element which is required by the FocusableOption interface. */
    getLabel() {
        var _a;
        // we know that the current node is an element type
        const clone = this._elementRef.nativeElement.cloneNode(true);
        this._removeIcons(clone);
        return ((_a = clone.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || '';
    }
    /** Remove any child from the given element which can be identified as an icon. */
    _removeIcons(element) {
        var _a;
        // TODO: make this a configurable function that can removed any desired type of node.
        for (const icon of Array.from(element.querySelectorAll('mat-icon, .material-icons'))) {
            (_a = icon.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild(icon);
        }
    }
    /** Sets the active property to true to enable the active css class. */
    setActiveStyles() {
        this._active = true;
    }
    /** Sets the active property to false to disable the active css class. */
    setInactiveStyles() {
        this._active = false;
    }
}
CdkOption.decorators = [
    { type: Directive, args: [{
                selector: '[cdkOption]',
                exportAs: 'cdkOption',
                host: {
                    'role': 'option',
                    '(click)': 'toggle()',
                    '(focus)': 'activate()',
                    '(blur)': 'deactivate()',
                    '[id]': 'id',
                    '[attr.aria-selected]': 'selected || null',
                    '[attr.tabindex]': '_getTabIndex()',
                    '[attr.aria-disabled]': '_isInteractionDisabled()',
                    '[class.cdk-option-disabled]': '_isInteractionDisabled()',
                    '[class.cdk-option-active]': '_active',
                    '[class.cdk-option-selected]': 'selected'
                }
            },] }
];
CdkOption.ctorParameters = () => [
    { type: ElementRef },
    { type: CdkListbox, decorators: [{ type: Inject, args: [forwardRef(() => CdkListbox),] }] }
];
CdkOption.propDecorators = {
    id: [{ type: Input }],
    selected: [{ type: Input }],
    disabled: [{ type: Input }],
    selectionChange: [{ type: Output }]
};
export class CdkListbox {
    constructor() {
        this._tabIndex = 0;
        this.optionSelectionChanges = defer(() => {
            const options = this._options;
            return options.changes.pipe(startWith(options), switchMap(() => merge(...options.map(option => option.selectionChange))));
        });
        this._disabled = false;
        this._multiple = false;
        this._useActiveDescendant = true;
        this._destroyed = new Subject();
        this.selectionChange = new EventEmitter();
    }
    /**
     * Whether the listbox allows multiple options to be selected.
     * If `multiple` switches from `true` to `false`, all options are deselected.
     */
    get multiple() {
        return this._multiple;
    }
    set multiple(value) {
        this._updateSelectionOnMultiSelectionChange(value);
        this._multiple = coerceBooleanProperty(value);
    }
    get disabled() {
        return this._disabled;
    }
    set disabled(value) {
        this._disabled = coerceBooleanProperty(value);
    }
    /** Whether the listbox will use active descendant or will move focus onto the options. */
    get useActiveDescendant() {
        return this._useActiveDescendant;
    }
    set useActiveDescendant(shouldUseActiveDescendant) {
        this._useActiveDescendant = coerceBooleanProperty(shouldUseActiveDescendant);
    }
    ngOnInit() {
        this._selectionModel = new SelectionModel(this.multiple);
    }
    ngAfterContentInit() {
        this._initKeyManager();
        this._initSelectionModel();
        this.optionSelectionChanges.subscribe(event => {
            this._emitChangeEvent(event.source);
            this._updateSelectionModel(event.source);
            this.setActiveOption(event.source);
        });
    }
    ngOnDestroy() {
        this._listKeyManager.change.complete();
        this._destroyed.next();
        this._destroyed.complete();
    }
    _initKeyManager() {
        this._listKeyManager = new ActiveDescendantKeyManager(this._options)
            .withWrap()
            .withVerticalOrientation()
            .withTypeAhead()
            .withAllowedModifierKeys(['shiftKey']);
        this._listKeyManager.change.pipe(takeUntil(this._destroyed)).subscribe(() => {
            this._updateActiveOption();
        });
    }
    _initSelectionModel() {
        this._selectionModel.changed.pipe(takeUntil(this._destroyed))
            .subscribe((event) => {
            for (const option of event.added) {
                option.selected = true;
            }
            for (const option of event.removed) {
                option.selected = false;
            }
        });
    }
    _keydown(event) {
        if (this._disabled) {
            return;
        }
        const manager = this._listKeyManager;
        const { keyCode } = event;
        const previousActiveIndex = manager.activeItemIndex;
        if (keyCode === HOME || keyCode === END) {
            event.preventDefault();
            keyCode === HOME ? manager.setFirstItemActive() : manager.setLastItemActive();
        }
        else if (keyCode === SPACE || keyCode === ENTER) {
            if (manager.activeItem && !manager.isTyping()) {
                this._toggleActiveOption();
            }
        }
        else {
            manager.onKeydown(event);
        }
        /** Will select an option if shift was pressed while navigating to the option */
        const isArrow = (keyCode === UP_ARROW || keyCode === DOWN_ARROW);
        if (isArrow && event.shiftKey && previousActiveIndex !== this._listKeyManager.activeItemIndex) {
            this._toggleActiveOption();
        }
    }
    /** Emits a selection change event, called when an option has its selected state changed. */
    _emitChangeEvent(option) {
        this.selectionChange.emit({
            source: this,
            option: option
        });
    }
    /** Updates the selection model after a toggle. */
    _updateSelectionModel(option) {
        if (!this.multiple && this._selectionModel.selected.length !== 0) {
            const previouslySelected = this._selectionModel.selected[0];
            this.deselect(previouslySelected);
        }
        option.selected ? this._selectionModel.select(option) :
            this._selectionModel.deselect(option);
    }
    /** Toggles the selected state of the active option if not disabled. */
    _toggleActiveOption() {
        const activeOption = this._listKeyManager.activeItem;
        if (activeOption && !activeOption.disabled) {
            activeOption.toggle();
        }
    }
    /** Returns the id of the active option if active descendant is being used. */
    _getAriaActiveDescendant() {
        var _a, _b;
        return this._useActiveDescendant ? (_b = (_a = this._listKeyManager) === null || _a === void 0 ? void 0 : _a.activeItem) === null || _b === void 0 ? void 0 : _b.id : null;
    }
    /** Updates the activeOption and the active and focus properties of the option. */
    _updateActiveOption() {
        var _a;
        if (!this._listKeyManager.activeItem) {
            return;
        }
        (_a = this._activeOption) === null || _a === void 0 ? void 0 : _a.deactivate();
        this._activeOption = this._listKeyManager.activeItem;
        this._activeOption.activate();
        if (!this.useActiveDescendant) {
            this._activeOption.focus();
        }
    }
    /** Updates selection states of options when the 'multiple' property changes. */
    _updateSelectionOnMultiSelectionChange(value) {
        if (this.multiple && !value) {
            // Deselect all options instead of arbitrarily keeping one of the selected options.
            this.setAllSelected(false);
        }
        else if (!this.multiple && value) {
            this._selectionModel = new SelectionModel(value, this._selectionModel.selected);
        }
    }
    /** Selects the given option if the option and listbox aren't disabled. */
    select(option) {
        if (!this.disabled && !option.disabled) {
            option.select();
        }
    }
    /** Deselects the given option if the option and listbox aren't disabled. */
    deselect(option) {
        if (!this.disabled && !option.disabled) {
            option.deselect();
        }
    }
    /** Sets the selected state of all options to be the given value. */
    setAllSelected(isSelected) {
        for (const option of this._options.toArray()) {
            const wasSelected = option.selected;
            isSelected ? this.select(option) : this.deselect(option);
            if (wasSelected !== isSelected) {
                this._emitChangeEvent(option);
                this._updateSelectionModel(option);
            }
        }
    }
    /** Updates the key manager's active item to the given option. */
    setActiveOption(option) {
        this._listKeyManager.updateActiveItem(option);
    }
}
CdkListbox.decorators = [
    { type: Directive, args: [{
                selector: '[cdkListbox]',
                exportAs: 'cdkListbox',
                host: {
                    'role': 'listbox',
                    '(keydown)': '_keydown($event)',
                    '[attr.tabindex]': '_tabIndex',
                    '[attr.aria-disabled]': 'disabled',
                    '[attr.aria-multiselectable]': 'multiple',
                    '[attr.aria-activedescendant]': '_getAriaActiveDescendant()'
                }
            },] }
];
CdkListbox.propDecorators = {
    _options: [{ type: ContentChildren, args: [CdkOption, { descendants: true },] }],
    selectionChange: [{ type: Output }],
    multiple: [{ type: Input }],
    disabled: [{ type: Input }],
    useActiveDescendant: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdGJveC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL2xpc3Rib3gvbGlzdGJveC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBRUwsZUFBZSxFQUNmLFNBQVMsRUFDVCxVQUFVLEVBQUUsWUFBWSxFQUFFLFVBQVUsRUFDcEMsTUFBTSxFQUNOLEtBQUssRUFBcUIsTUFBTSxFQUNoQyxTQUFTLEVBQ1YsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFDLDBCQUEwQixFQUFzQyxNQUFNLG1CQUFtQixDQUFDO0FBQ2xHLE9BQU8sRUFBQyxVQUFVLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQ3BGLE9BQU8sRUFBZSxxQkFBcUIsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQzFFLE9BQU8sRUFBa0IsY0FBYyxFQUFDLE1BQU0sMEJBQTBCLENBQUM7QUFDekUsT0FBTyxFQUFDLEtBQUssRUFBRSxLQUFLLEVBQWMsT0FBTyxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQ3ZELE9BQU8sRUFBQyxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBRS9ELElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQztBQW1CZixNQUFNLE9BQU8sU0FBUztJQTZCcEIsWUFBNkIsV0FBdUIsRUFDTyxPQUFtQjtRQURqRCxnQkFBVyxHQUFYLFdBQVcsQ0FBWTtRQUNPLFlBQU8sR0FBUCxPQUFPLENBQVk7UUE3QnRFLGNBQVMsR0FBWSxLQUFLLENBQUM7UUFDM0IsY0FBUyxHQUFZLEtBQUssQ0FBQztRQUNuQyxZQUFPLEdBQVksS0FBSyxDQUFDO1FBRXpCLGdGQUFnRjtRQUN2RSxPQUFFLEdBQUcsY0FBYyxNQUFNLEVBQUUsRUFBRSxDQUFD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VyxFQUFFLElBQUksRUFBQzs4QkFFOUMsTUFBTTt1QkFPTixLQUFLO3VCQVNMLEtBQUs7a0NBU0wsS0FBSyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1xuICBBZnRlckNvbnRlbnRJbml0LFxuICBDb250ZW50Q2hpbGRyZW4sXG4gIERpcmVjdGl2ZSxcbiAgRWxlbWVudFJlZiwgRXZlbnRFbWl0dGVyLCBmb3J3YXJkUmVmLFxuICBJbmplY3QsXG4gIElucHV0LCBPbkRlc3Ryb3ksIE9uSW5pdCwgT3V0cHV0LFxuICBRdWVyeUxpc3Rcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0FjdGl2ZURlc2NlbmRhbnRLZXlNYW5hZ2VyLCBIaWdobGlnaHRhYmxlLCBMaXN0S2V5TWFuYWdlck9wdGlvbn0gZnJvbSAnQGFuZ3VsYXIvY2RrL2ExMXknO1xuaW1wb3J0IHtET1dOX0FSUk9XLCBFTkQsIEVOVEVSLCBIT01FLCBTUEFDRSwgVVBfQVJST1d9IGZyb20gJ0Bhbmd1bGFyL2Nkay9rZXljb2Rlcyc7XG5pbXBvcnQge0Jvb2xlYW5JbnB1dCwgY29lcmNlQm9vbGVhblByb3BlcnR5fSBmcm9tICdAYW5ndWxhci9jZGsvY29lcmNpb24nO1xuaW1wb3J0IHtTZWxlY3Rpb25DaGFuZ2UsIFNlbGVjdGlvbk1vZGVsfSBmcm9tICdAYW5ndWxhci9jZGsvY29sbGVjdGlvbnMnO1xuaW1wb3J0IHtkZWZlciwgbWVyZ2UsIE9ic2VydmFibGUsIFN1YmplY3R9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHtzdGFydFdpdGgsIHN3aXRjaE1hcCwgdGFrZVVudGlsfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbmxldCBuZXh0SWQgPSAwO1xuXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbY2RrT3B0aW9uXScsXG4gIGV4cG9ydEFzOiAnY2RrT3B0aW9uJyxcbiAgaG9zdDoge1xuICAgICdyb2xlJzogJ29wdGlvbicsXG4gICAgJyhjbGljayknOiAndG9nZ2xlKCknLFxuICAgICcoZm9jdXMpJzogJ2FjdGl2YXRlKCknLFxuICAgICcoYmx1ciknOiAnZGVhY3RpdmF0ZSgpJyxcbiAgICAnW2lkXSc6ICdpZCcsXG4gICAgJ1thdHRyLmFyaWEtc2VsZWN0ZWRdJzogJ3NlbGVjdGVkIHx8IG51bGwnLFxuICAgICdbYXR0ci50YWJpbmRleF0nOiAnX2dldFRhYkluZGV4KCknLFxuICAgICdbYXR0ci5hcmlhLWRpc2FibGVkXSc6ICdfaXNJbnRlcmFjdGlvbkRpc2FibGVkKCknLFxuICAgICdbY2xhc3MuY2RrLW9wdGlvbi1kaXNhYmxlZF0nOiAnX2lzSW50ZXJhY3Rpb25EaXNhYmxlZCgpJyxcbiAgICAnW2NsYXNzLmNkay1vcHRpb24tYWN0aXZlXSc6ICdfYWN0aXZlJyxcbiAgICAnW2NsYXNzLmNkay1vcHRpb24tc2VsZWN0ZWRdJzogJ3NlbGVjdGVkJ1xuICB9XG59KVxuZXhwb3J0IGNsYXNzIENka09wdGlvbiBpbXBsZW1lbnRzIExpc3RLZXlNYW5hZ2VyT3B0aW9uLCBIaWdobGlnaHRhYmxlIHtcbiAgcHJpdmF0ZSBfc2VsZWN0ZWQ6IGJvb2xlYW4gPSBmYWxzZTtcbiAgcHJpdmF0ZSBfZGlzYWJsZWQ6IGJvb2xlYW4gPSBmYWxzZTtcbiAgX2FjdGl2ZTogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIC8qKiBUaGUgaWQgb2YgdGhlIG9wdGlvbiwgc2V0IHRvIGEgdW5pcXVlaWQgaWYgdGhlIHVzZXIgZG9lcyBub3QgcHJvdmlkZSBvbmUuICovXG4gIEBJbnB1dCgpIGlkID0gYGNkay1vcHRpb24tJHtuZXh0SWQrK31gO1xuXG4gIEBJbnB1dCgpXG4gIGdldCBzZWxlY3RlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fc2VsZWN0ZWQ7XG4gIH1cbiAgc2V0IHNlbGVjdGVkKHZhbHVlOiBib29sZWFuKSB7XG4gICAgaWYgKCF0aGlzLl9kaXNhYmxlZCkge1xuICAgICAgdGhpcy5fc2VsZWN0ZWQgPSBjb2VyY2VCb29sZWFuUHJvcGVydHkodmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIEBJbnB1dCgpXG4gIGdldCBkaXNhYmxlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fZGlzYWJsZWQ7XG4gIH1cbiAgc2V0IGRpc2FibGVkKHZhbHVlOiBib29sZWFuKSB7XG4gICAgdGhpcy5fZGlzYWJsZWQgPSBjb2VyY2VCb29sZWFuUHJvcGVydHkodmFsdWUpO1xuICB9XG5cbiAgQE91dHB1dCgpIHJlYWRvbmx5IHNlbGVjdGlvbkNoYW5nZTogRXZlbnRFbWl0dGVyPE9wdGlvblNlbGVjdGlvbkNoYW5nZUV2ZW50PiA9XG4gICAgICBuZXcgRXZlbnRFbWl0dGVyPE9wdGlvblNlbGVjdGlvbkNoYW5nZUV2ZW50PigpO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgX2VsZW1lbnRSZWY6IEVsZW1lbnRSZWYsXG4gICAgICAgICAgICAgIEBJbmplY3QoZm9yd2FyZFJlZigoKSA9PiBDZGtMaXN0Ym94KSkgcmVhZG9ubHkgbGlzdGJveDogQ2RrTGlzdGJveCkge1xuICB9XG5cbiAgLyoqIFRvZ2dsZXMgdGhlIHNlbGVjdGVkIHN0YXRlLCBlbWl0cyBhIGNoYW5nZSBldmVudCB0aHJvdWdoIHRoZSBpbmplY3RlZCBsaXN0Ym94LiAqL1xuICB0b2dnbGUoKSB7XG4gICAgaWYgKCF0aGlzLl9pc0ludGVyYWN0aW9uRGlzYWJsZWQoKSkge1xuICAgICAgdGhpcy5zZWxlY3RlZCA9ICF0aGlzLnNlbGVjdGVkO1xuICAgICAgdGhpcy5fZW1pdFNlbGVjdGlvbkNoYW5nZSh0cnVlKTtcbiAgICB9XG4gIH1cblxuICAvKiogU2V0cyB0aGUgYWN0aXZlIHByb3BlcnR5IHRydWUgaWYgdGhlIG9wdGlvbiBhbmQgbGlzdGJveCBhcmVuJ3QgZGlzYWJsZWQuICovXG4gIGFjdGl2YXRlKCkge1xuICAgIGlmICghdGhpcy5faXNJbnRlcmFjdGlvbkRpc2FibGVkKCkpIHtcbiAgICAgIHRoaXMuX2FjdGl2ZSA9IHRydWU7XG4gICAgfVxuICB9XG5cbiAgLyoqIFNldHMgdGhlIGFjdGl2ZSBwcm9wZXJ0eSBmYWxzZS4gKi9cbiAgZGVhY3RpdmF0ZSgpIHtcbiAgICBpZiAoIXRoaXMuX2lzSW50ZXJhY3Rpb25EaXNhYmxlZCgpKSB7XG4gICAgICB0aGlzLl9hY3RpdmUgPSBmYWxzZTtcbiAgICB9XG4gIH1cblxuICAvKiogU2V0cyB0aGUgc2VsZWN0ZWQgcHJvcGVydHkgdHJ1ZSBpZiBpdCB3YXMgZmFsc2UuICovXG4gIHNlbGVjdCgpIHtcbiAgICBpZiAoIXRoaXMuc2VsZWN0ZWQpIHtcbiAgICAgIHRoaXMuc2VsZWN0ZWQgPSB0cnVlO1xuICAgICAgdGhpcy5fZW1pdFNlbGVjdGlvbkNoYW5nZSgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBTZXRzIHRoZSBzZWxlY3RlZCBwcm9wZXJ0eSBmYWxzZSBpZiBpdCB3YXMgdHJ1ZS4gKi9cbiAgZGVzZWxlY3QoKSB7XG4gICAgaWYgKHRoaXMuc2VsZWN0ZWQpIHtcbiAgICAgIHRoaXMuc2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAgIHRoaXMuX2VtaXRTZWxlY3Rpb25DaGFuZ2UoKTtcbiAgICB9XG4gIH1cblxuICAvKiogQXBwbGllcyBmb2N1cyB0byB0aGUgb3B0aW9uLiAqL1xuICBmb2N1cygpIHtcbiAgICB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQuZm9jdXMoKTtcbiAgfVxuXG4gIC8qKiBSZXR1cm5zIHRydWUgaWYgdGhlIG9wdGlvbiBvciBsaXN0Ym94IGFyZSBkaXNhYmxlZCwgYW5kIGZhbHNlIG90aGVyd2lzZS4gKi9cbiAgX2lzSW50ZXJhY3Rpb25EaXNhYmxlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gKHRoaXMubGlzdGJveC5kaXNhYmxlZCB8fCB0aGlzLl9kaXNhYmxlZCk7XG4gIH1cblxuICAvKiogRW1pdHMgYSBjaGFuZ2UgZXZlbnQgZXh0ZW5kaW5nIHRoZSBPcHRpb24gU2VsZWN0aW9uIENoYW5nZSBFdmVudCBpbnRlcmZhY2UuICovXG4gIHByaXZhdGUgX2VtaXRTZWxlY3Rpb25DaGFuZ2UoaXNVc2VySW5wdXQgPSBmYWxzZSkge1xuICAgIHRoaXMuc2VsZWN0aW9uQ2hhbmdlLmVtaXQoe1xuICAgICAgc291cmNlOiB0aGlzLFxuICAgICAgaXNVc2VySW5wdXQ6IGlzVXNlcklucHV0XG4gICAgfSk7XG4gIH1cblxuICAvKiogUmV0dXJucyB0aGUgdGFiIGluZGV4IHdoaWNoIGRlcGVuZHMgb24gdGhlIGRpc2FibGVkIHByb3BlcnR5LiAqL1xuICBfZ2V0VGFiSW5kZXgoKTogc3RyaW5nIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuX2lzSW50ZXJhY3Rpb25EaXNhYmxlZCgpID8gbnVsbCA6ICctMSc7XG4gIH1cblxuICAvKiogR2V0IHRoZSBsYWJlbCBmb3IgdGhpcyBlbGVtZW50IHdoaWNoIGlzIHJlcXVpcmVkIGJ5IHRoZSBGb2N1c2FibGVPcHRpb24gaW50ZXJmYWNlLiAqL1xuICBnZXRMYWJlbCgpIHtcbiAgICAvLyB3ZSBrbm93IHRoYXQgdGhlIGN1cnJlbnQgbm9kZSBpcyBhbiBlbGVtZW50IHR5cGVcbiAgICBjb25zdCBjbG9uZSA9IHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5jbG9uZU5vZGUodHJ1ZSkgYXMgRWxlbWVudDtcbiAgICB0aGlzLl9yZW1vdmVJY29ucyhjbG9uZSk7XG5cbiAgICByZXR1cm4gY2xvbmUudGV4dENvbnRlbnQ/LnRyaW0oKSB8fCAnJztcbiAgfVxuXG4gIC8qKiBSZW1vdmUgYW55IGNoaWxkIGZyb20gdGhlIGdpdmVuIGVsZW1lbnQgd2hpY2ggY2FuIGJlIGlkZW50aWZpZWQgYXMgYW4gaWNvbi4gKi9cbiAgcHJpdmF0ZSBfcmVtb3ZlSWNvbnMoZWxlbWVudDogRWxlbWVudCkge1xuICAgIC8vIFRPRE86IG1ha2UgdGhpcyBhIGNvbmZpZ3VyYWJsZSBmdW5jdGlvbiB0aGF0IGNhbiByZW1vdmVkIGFueSBkZXNpcmVkIHR5cGUgb2Ygbm9kZS5cbiAgICBmb3IgKGNvbnN0IGljb24gb2YgQXJyYXkuZnJvbShlbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ21hdC1pY29uLCAubWF0ZXJpYWwtaWNvbnMnKSkpIHtcbiAgICAgIGljb24ucGFyZW50Tm9kZT8ucmVtb3ZlQ2hpbGQoaWNvbik7XG4gICAgfVxuICB9XG5cbiAgLyoqIFNldHMgdGhlIGFjdGl2ZSBwcm9wZXJ0eSB0byB0cnVlIHRvIGVuYWJsZSB0aGUgYWN0aXZlIGNzcyBjbGFzcy4gKi9cbiAgc2V0QWN0aXZlU3R5bGVzKCkge1xuICAgIHRoaXMuX2FjdGl2ZSA9IHRydWU7XG4gIH1cblxuICAvKiogU2V0cyB0aGUgYWN0aXZlIHByb3BlcnR5IHRvIGZhbHNlIHRvIGRpc2FibGUgdGhlIGFjdGl2ZSBjc3MgY2xhc3MuICovXG4gIHNldEluYWN0aXZlU3R5bGVzKCkge1xuICAgIHRoaXMuX2FjdGl2ZSA9IGZhbHNlO1xuICB9XG5cbiAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3NlbGVjdGVkOiBCb29sZWFuSW5wdXQ7XG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9kaXNhYmxlZDogQm9vbGVhbklucHV0O1xufVxuXG5ARGlyZWN0aXZlKHtcbiAgICBzZWxlY3RvcjogJ1tjZGtMaXN0Ym94XScsXG4gICAgZXhwb3J0QXM6ICdjZGtMaXN0Ym94JyxcbiAgICBob3N0OiB7XG4gICAgICAncm9sZSc6ICdsaXN0Ym94JyxcbiAgICAgICcoa2V5ZG93biknOiAnX2tleWRvd24oJGV2ZW50KScsXG4gICAgICAnW2F0dHIudGFiaW5kZXhdJzogJ190YWJJbmRleCcsXG4gICAgICAnW2F0dHIuYXJpYS1kaXNhYmxlZF0nOiAnZGlzYWJsZWQnLFxuICAgICAgJ1thdHRyLmFyaWEtbXVsdGlzZWxlY3RhYmxlXSc6ICdtdWx0aXBsZScsXG4gICAgICAnW2F0dHIuYXJpYS1hY3RpdmVkZXNjZW5kYW50XSc6ICdfZ2V0QXJpYUFjdGl2ZURlc2NlbmRhbnQoKSdcbiAgICB9XG59KVxuZXhwb3J0IGNsYXNzIENka0xpc3Rib3ggaW1wbGVtZW50cyBBZnRlckNvbnRlbnRJbml0LCBPbkRlc3Ryb3ksIE9uSW5pdCB7XG5cbiAgX2xpc3RLZXlNYW5hZ2VyOiBBY3RpdmVEZXNjZW5kYW50S2V5TWFuYWdlcjxDZGtPcHRpb24+O1xuICBfc2VsZWN0aW9uTW9kZWw6IFNlbGVjdGlvbk1vZGVsPENka09wdGlvbj47XG4gIF90YWJJbmRleCA9IDA7XG5cbiAgcmVhZG9ubHkgb3B0aW9uU2VsZWN0aW9uQ2hhbmdlczogT2JzZXJ2YWJsZTxPcHRpb25TZWxlY3Rpb25DaGFuZ2VFdmVudD4gPSBkZWZlcigoKSA9PiB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHRoaXMuX29wdGlvbnM7XG5cbiAgICByZXR1cm4gb3B0aW9ucy5jaGFuZ2VzLnBpcGUoXG4gICAgICBzdGFydFdpdGgob3B0aW9ucyksXG4gICAgICBzd2l0Y2hNYXAoKCkgPT4gbWVyZ2UoLi4ub3B0aW9ucy5tYXAob3B0aW9uID0+IG9wdGlvbi5zZWxlY3Rpb25DaGFuZ2UpKSlcbiAgICApO1xuICB9KSBhcyBPYnNlcnZhYmxlPE9wdGlvblNlbGVjdGlvbkNoYW5nZUV2ZW50PjtcblxuICBwcml2YXRlIF9kaXNhYmxlZDogYm9vbGVhbiA9IGZhbHNlO1xuICBwcml2YXRlIF9tdWx0aXBsZTogYm9vbGVhbiA9IGZhbHNlO1xuICBwcml2YXRlIF91c2VBY3RpdmVEZXNjZW5kYW50OiBib29sZWFuID0gdHJ1ZTtcbiAgcHJpdmF0ZSBfYWN0aXZlT3B0aW9uOiBDZGtPcHRpb247XG5cbiAgcHJpdmF0ZSByZWFkb25seSBfZGVzdHJveWVkID0gbmV3IFN1YmplY3Q8dm9pZD4oKTtcblxuICBAQ29udGVudENoaWxkcmVuKENka09wdGlvbiwge2Rlc2NlbmRhbnRzOiB0cnVlfSkgX29wdGlvbnM6IFF1ZXJ5TGlzdDxDZGtPcHRpb24+O1xuXG4gIEBPdXRwdXQoKSByZWFkb25seSBzZWxlY3Rpb25DaGFuZ2U6IEV2ZW50RW1pdHRlcjxMaXN0Ym94U2VsZWN0aW9uQ2hhbmdlRXZlbnQ+ID1cbiAgICAgIG5ldyBFdmVudEVtaXR0ZXI8TGlzdGJveFNlbGVjdGlvbkNoYW5nZUV2ZW50PigpO1xuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoZSBsaXN0Ym94IGFsbG93cyBtdWx0aXBsZSBvcHRpb25zIHRvIGJlIHNlbGVjdGVkLlxuICAgKiBJZiBgbXVsdGlwbGVgIHN3aXRjaGVzIGZyb20gYHRydWVgIHRvIGBmYWxzZWAsIGFsbCBvcHRpb25zIGFyZSBkZXNlbGVjdGVkLlxuICAgKi9cbiAgQElucHV0KClcbiAgZ2V0IG11bHRpcGxlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9tdWx0aXBsZTtcbiAgfVxuICBzZXQgbXVsdGlwbGUodmFsdWU6IGJvb2xlYW4pIHtcbiAgICB0aGlzLl91cGRhdGVTZWxlY3Rpb25Pbk11bHRpU2VsZWN0aW9uQ2hhbmdlKHZhbHVlKTtcbiAgICB0aGlzLl9tdWx0aXBsZSA9IGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eSh2YWx1ZSk7XG4gIH1cblxuICBASW5wdXQoKVxuICBnZXQgZGlzYWJsZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2Rpc2FibGVkO1xuICB9XG4gIHNldCBkaXNhYmxlZCh2YWx1ZTogYm9vbGVhbikge1xuICAgIHRoaXMuX2Rpc2FibGVkID0gY29lcmNlQm9vbGVhblByb3BlcnR5KHZhbHVlKTtcbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoZSBsaXN0Ym94IHdpbGwgdXNlIGFjdGl2ZSBkZXNjZW5kYW50IG9yIHdpbGwgbW92ZSBmb2N1cyBvbnRvIHRoZSBvcHRpb25zLiAqL1xuICBASW5wdXQoKVxuICBnZXQgdXNlQWN0aXZlRGVzY2VuZGFudCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fdXNlQWN0aXZlRGVzY2VuZGFudDtcbiAgfVxuICBzZXQgdXNlQWN0aXZlRGVzY2VuZGFudChzaG91bGRVc2VBY3RpdmVEZXNjZW5kYW50OiBib29sZWFuKSB7XG4gICAgdGhpcy5fdXNlQWN0aXZlRGVzY2VuZGFudCA9IGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eShzaG91bGRVc2VBY3RpdmVEZXNjZW5kYW50KTtcbiAgfVxuXG4gIG5nT25Jbml0KCkge1xuICAgIHRoaXMuX3NlbGVjdGlvbk1vZGVsID0gbmV3IFNlbGVjdGlvbk1vZGVsPENka09wdGlvbj4odGhpcy5tdWx0aXBsZSk7XG4gIH1cblxuICBuZ0FmdGVyQ29udGVudEluaXQoKSB7XG4gICAgdGhpcy5faW5pdEtleU1hbmFnZXIoKTtcbiAgICB0aGlzLl9pbml0U2VsZWN0aW9uTW9kZWwoKTtcblxuICAgIHRoaXMub3B0aW9uU2VsZWN0aW9uQ2hhbmdlcy5zdWJzY3JpYmUoZXZlbnQgPT4ge1xuICAgICAgdGhpcy5fZW1pdENoYW5nZUV2ZW50KGV2ZW50LnNvdXJjZSk7XG4gICAgICB0aGlzLl91cGRhdGVTZWxlY3Rpb25Nb2RlbChldmVudC5zb3VyY2UpO1xuICAgICAgdGhpcy5zZXRBY3RpdmVPcHRpb24oZXZlbnQuc291cmNlKTtcbiAgICB9KTtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIHRoaXMuX2xpc3RLZXlNYW5hZ2VyLmNoYW5nZS5jb21wbGV0ZSgpO1xuICAgIHRoaXMuX2Rlc3Ryb3llZC5uZXh0KCk7XG4gICAgdGhpcy5fZGVzdHJveWVkLmNvbXBsZXRlKCk7XG4gIH1cblxuICBwcml2YXRlIF9pbml0S2V5TWFuYWdlcigpIHtcbiAgICB0aGlzLl9saXN0S2V5TWFuYWdlciA9IG5ldyBBY3RpdmVEZXNjZW5kYW50S2V5TWFuYWdlcih0aGlzLl9vcHRpb25zKVxuICAgICAgICAud2l0aFdyYXAoKVxuICAgICAgICAud2l0aFZlcnRpY2FsT3JpZW50YXRpb24oKVxuICAgICAgICAud2l0aFR5cGVBaGVhZCgpXG4gICAgICAgIC53aXRoQWxsb3dlZE1vZGlmaWVyS2V5cyhbJ3NoaWZ0S2V5J10pO1xuXG4gICAgdGhpcy5fbGlzdEtleU1hbmFnZXIuY2hhbmdlLnBpcGUodGFrZVVudGlsKHRoaXMuX2Rlc3Ryb3llZCkpLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICB0aGlzLl91cGRhdGVBY3RpdmVPcHRpb24oKTtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX2luaXRTZWxlY3Rpb25Nb2RlbCgpIHtcbiAgICB0aGlzLl9zZWxlY3Rpb25Nb2RlbC5jaGFuZ2VkLnBpcGUodGFrZVVudGlsKHRoaXMuX2Rlc3Ryb3llZCkpXG4gICAgICAgIC5zdWJzY3JpYmUoKGV2ZW50OiBTZWxlY3Rpb25DaGFuZ2U8Q2RrT3B0aW9uPikgPT4ge1xuXG4gICAgICBmb3IgKGNvbnN0IG9wdGlvbiBvZiBldmVudC5hZGRlZCkge1xuICAgICAgICBvcHRpb24uc2VsZWN0ZWQgPSB0cnVlO1xuICAgICAgfVxuXG4gICAgICBmb3IgKGNvbnN0IG9wdGlvbiBvZiBldmVudC5yZW1vdmVkKSB7XG4gICAgICAgIG9wdGlvbi5zZWxlY3RlZCA9IGZhbHNlO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgX2tleWRvd24oZXZlbnQ6IEtleWJvYXJkRXZlbnQpIHtcbiAgICBpZiAodGhpcy5fZGlzYWJsZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBtYW5hZ2VyID0gdGhpcy5fbGlzdEtleU1hbmFnZXI7XG4gICAgY29uc3Qge2tleUNvZGV9ID0gZXZlbnQ7XG4gICAgY29uc3QgcHJldmlvdXNBY3RpdmVJbmRleCA9IG1hbmFnZXIuYWN0aXZlSXRlbUluZGV4O1xuXG4gICAgaWYgKGtleUNvZGUgPT09IEhPTUUgfHwga2V5Q29kZSA9PT0gRU5EKSB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAga2V5Q29kZSA9PT0gSE9NRSA/IG1hbmFnZXIuc2V0Rmlyc3RJdGVtQWN0aXZlKCkgOiBtYW5hZ2VyLnNldExhc3RJdGVtQWN0aXZlKCk7XG5cbiAgICB9IGVsc2UgaWYgKGtleUNvZGUgPT09IFNQQUNFIHx8IGtleUNvZGUgPT09IEVOVEVSKSB7XG4gICAgICBpZiAobWFuYWdlci5hY3RpdmVJdGVtICYmICFtYW5hZ2VyLmlzVHlwaW5nKCkpIHtcbiAgICAgICAgdGhpcy5fdG9nZ2xlQWN0aXZlT3B0aW9uKCk7XG4gICAgICB9XG5cbiAgICB9IGVsc2Uge1xuICAgICAgbWFuYWdlci5vbktleWRvd24oZXZlbnQpO1xuICAgIH1cblxuICAgIC8qKiBXaWxsIHNlbGVjdCBhbiBvcHRpb24gaWYgc2hpZnQgd2FzIHByZXNzZWQgd2hpbGUgbmF2aWdhdGluZyB0byB0aGUgb3B0aW9uICovXG4gICAgY29uc3QgaXNBcnJvdyA9IChrZXlDb2RlID09PSBVUF9BUlJPVyB8fCBrZXlDb2RlID09PSBET1dOX0FSUk9XKTtcbiAgICBpZiAoaXNBcnJvdyAmJiBldmVudC5zaGlmdEtleSAmJiBwcmV2aW91c0FjdGl2ZUluZGV4ICE9PSB0aGlzLl9saXN0S2V5TWFuYWdlci5hY3RpdmVJdGVtSW5kZXgpIHtcbiAgICAgIHRoaXMuX3RvZ2dsZUFjdGl2ZU9wdGlvbigpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBFbWl0cyBhIHNlbGVjdGlvbiBjaGFuZ2UgZXZlbnQsIGNhbGxlZCB3aGVuIGFuIG9wdGlvbiBoYXMgaXRzIHNlbGVjdGVkIHN0YXRlIGNoYW5nZWQuICovXG4gIF9lbWl0Q2hhbmdlRXZlbnQob3B0aW9uOiBDZGtPcHRpb24pIHtcbiAgICB0aGlzLnNlbGVjdGlvbkNoYW5nZS5lbWl0KHtcbiAgICAgIHNvdXJjZTogdGhpcyxcbiAgICAgIG9wdGlvbjogb3B0aW9uXG4gICAgfSk7XG4gIH1cblxuICAvKiogVXBkYXRlcyB0aGUgc2VsZWN0aW9uIG1vZGVsIGFmdGVyIGEgdG9nZ2xlLiAqL1xuICBfdXBkYXRlU2VsZWN0aW9uTW9kZWwob3B0aW9uOiBDZGtPcHRpb24pIHtcbiAgICBpZiAoIXRoaXMubXVsdGlwbGUgJiYgdGhpcy5fc2VsZWN0aW9uTW9kZWwuc2VsZWN0ZWQubGVuZ3RoICE9PSAwKSB7XG4gICAgICBjb25zdCBwcmV2aW91c2x5U2VsZWN0ZWQgPSB0aGlzLl9zZWxlY3Rpb25Nb2RlbC5zZWxlY3RlZFswXTtcbiAgICAgIHRoaXMuZGVzZWxlY3QocHJldmlvdXNseVNlbGVjdGVkKTtcbiAgICB9XG5cbiAgICBvcHRpb24uc2VsZWN0ZWQgPyB0aGlzLl9zZWxlY3Rpb25Nb2RlbC5zZWxlY3Qob3B0aW9uKSA6XG4gICAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2VsZWN0aW9uTW9kZWwuZGVzZWxlY3Qob3B0aW9uKTtcbiAgfVxuXG4gIC8qKiBUb2dnbGVzIHRoZSBzZWxlY3RlZCBzdGF0ZSBvZiB0aGUgYWN0aXZlIG9wdGlvbiBpZiBub3QgZGlzYWJsZWQuICovXG4gIHByaXZhdGUgX3RvZ2dsZUFjdGl2ZU9wdGlvbigpIHtcbiAgICBjb25zdCBhY3RpdmVPcHRpb24gPSB0aGlzLl9saXN0S2V5TWFuYWdlci5hY3RpdmVJdGVtO1xuICAgIGlmIChhY3RpdmVPcHRpb24gJiYgIWFjdGl2ZU9wdGlvbi5kaXNhYmxlZCkge1xuICAgICAgYWN0aXZlT3B0aW9uLnRvZ2dsZSgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBSZXR1cm5zIHRoZSBpZCBvZiB0aGUgYWN0aXZlIG9wdGlvbiBpZiBhY3RpdmUgZGVzY2VuZGFudCBpcyBiZWluZyB1c2VkLiAqL1xuICBfZ2V0QXJpYUFjdGl2ZURlc2NlbmRhbnQoKTogc3RyaW5nIHwgbnVsbCB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIHRoaXMuX3VzZUFjdGl2ZURlc2NlbmRhbnQgPyB0aGlzLl9saXN0S2V5TWFuYWdlcj8uYWN0aXZlSXRlbT8uaWQgOiBudWxsO1xuICB9XG5cbiAgLyoqIFVwZGF0ZXMgdGhlIGFjdGl2ZU9wdGlvbiBhbmQgdGhlIGFjdGl2ZSBhbmQgZm9jdXMgcHJvcGVydGllcyBvZiB0aGUgb3B0aW9uLiAqL1xuICBwcml2YXRlIF91cGRhdGVBY3RpdmVPcHRpb24oKSB7XG4gICAgaWYgKCF0aGlzLl9saXN0S2V5TWFuYWdlci5hY3RpdmVJdGVtKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5fYWN0aXZlT3B0aW9uPy5kZWFjdGl2YXRlKCk7XG4gICAgdGhpcy5fYWN0aXZlT3B0aW9uID0gdGhpcy5fbGlzdEtleU1hbmFnZXIuYWN0aXZlSXRlbTtcbiAgICB0aGlzLl9hY3RpdmVPcHRpb24uYWN0aXZhdGUoKTtcblxuICAgIGlmICghdGhpcy51c2VBY3RpdmVEZXNjZW5kYW50KSB7XG4gICAgICB0aGlzLl9hY3RpdmVPcHRpb24uZm9jdXMoKTtcbiAgICB9XG4gIH1cblxuICAvKiogVXBkYXRlcyBzZWxlY3Rpb24gc3RhdGVzIG9mIG9wdGlvbnMgd2hlbiB0aGUgJ211bHRpcGxlJyBwcm9wZXJ0eSBjaGFuZ2VzLiAqL1xuICBwcml2YXRlIF91cGRhdGVTZWxlY3Rpb25Pbk11bHRpU2VsZWN0aW9uQ2hhbmdlKHZhbHVlOiBib29sZWFuKSB7XG4gICAgaWYgKHRoaXMubXVsdGlwbGUgJiYgIXZhbHVlKSB7XG4gICAgICAvLyBEZXNlbGVjdCBhbGwgb3B0aW9ucyBpbnN0ZWFkIG9mIGFyYml0cmFyaWx5IGtlZXBpbmcgb25lIG9mIHRoZSBzZWxlY3RlZCBvcHRpb25zLlxuICAgICAgdGhpcy5zZXRBbGxTZWxlY3RlZChmYWxzZSk7XG4gICAgfSBlbHNlIGlmICghdGhpcy5tdWx0aXBsZSAmJiB2YWx1ZSkge1xuICAgICAgdGhpcy5fc2VsZWN0aW9uTW9kZWwgPSBuZXcgU2VsZWN0aW9uTW9kZWw8Q2RrT3B0aW9uPih2YWx1ZSwgdGhpcy5fc2VsZWN0aW9uTW9kZWwuc2VsZWN0ZWQpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBTZWxlY3RzIHRoZSBnaXZlbiBvcHRpb24gaWYgdGhlIG9wdGlvbiBhbmQgbGlzdGJveCBhcmVuJ3QgZGlzYWJsZWQuICovXG4gIHNlbGVjdChvcHRpb246IENka09wdGlvbikge1xuICAgIGlmICghdGhpcy5kaXNhYmxlZCAmJiAhb3B0aW9uLmRpc2FibGVkKSB7XG4gICAgICBvcHRpb24uc2VsZWN0KCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIERlc2VsZWN0cyB0aGUgZ2l2ZW4gb3B0aW9uIGlmIHRoZSBvcHRpb24gYW5kIGxpc3Rib3ggYXJlbid0IGRpc2FibGVkLiAqL1xuICBkZXNlbGVjdChvcHRpb246IENka09wdGlvbikge1xuICAgIGlmICghdGhpcy5kaXNhYmxlZCAmJiAhb3B0aW9uLmRpc2FibGVkKSB7XG4gICAgICBvcHRpb24uZGVzZWxlY3QoKTtcbiAgICB9XG4gIH1cblxuICAvKiogU2V0cyB0aGUgc2VsZWN0ZWQgc3RhdGUgb2YgYWxsIG9wdGlvbnMgdG8gYmUgdGhlIGdpdmVuIHZhbHVlLiAqL1xuICBzZXRBbGxTZWxlY3RlZChpc1NlbGVjdGVkOiBib29sZWFuKSB7XG4gICAgZm9yIChjb25zdCBvcHRpb24gb2YgdGhpcy5fb3B0aW9ucy50b0FycmF5KCkpIHtcbiAgICAgIGNvbnN0IHdhc1NlbGVjdGVkID0gb3B0aW9uLnNlbGVjdGVkO1xuICAgICAgaXNTZWxlY3RlZCA/IHRoaXMuc2VsZWN0KG9wdGlvbikgOiB0aGlzLmRlc2VsZWN0KG9wdGlvbik7XG5cbiAgICAgIGlmICh3YXNTZWxlY3RlZCAhPT0gaXNTZWxlY3RlZCkge1xuICAgICAgICB0aGlzLl9lbWl0Q2hhbmdlRXZlbnQob3B0aW9uKTtcbiAgICAgICAgdGhpcy5fdXBkYXRlU2VsZWN0aW9uTW9kZWwob3B0aW9uKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKiogVXBkYXRlcyB0aGUga2V5IG1hbmFnZXIncyBhY3RpdmUgaXRlbSB0byB0aGUgZ2l2ZW4gb3B0aW9uLiAqL1xuICBzZXRBY3RpdmVPcHRpb24ob3B0aW9uOiBDZGtPcHRpb24pIHtcbiAgICB0aGlzLl9saXN0S2V5TWFuYWdlci51cGRhdGVBY3RpdmVJdGVtKG9wdGlvbik7XG4gIH1cblxuICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZGlzYWJsZWQ6IEJvb2xlYW5JbnB1dDtcbiAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX211bHRpcGxlOiBCb29sZWFuSW5wdXQ7XG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV91c2VBY3RpdmVEZXNjZW5kYW50OiBCb29sZWFuSW5wdXQ7XG59XG5cbi8qKiBDaGFuZ2UgZXZlbnQgdGhhdCBpcyBiZWluZyBmaXJlZCB3aGVuZXZlciB0aGUgc2VsZWN0ZWQgc3RhdGUgb2YgYW4gb3B0aW9uIGNoYW5nZXMuICovXG5leHBvcnQgaW50ZXJmYWNlIExpc3Rib3hTZWxlY3Rpb25DaGFuZ2VFdmVudCB7XG4gIC8qKiBSZWZlcmVuY2UgdG8gdGhlIGxpc3Rib3ggdGhhdCBlbWl0dGVkIHRoZSBldmVudC4gKi9cbiAgcmVhZG9ubHkgc291cmNlOiBDZGtMaXN0Ym94O1xuXG4gIC8qKiBSZWZlcmVuY2UgdG8gdGhlIG9wdGlvbiB0aGF0IGhhcyBiZWVuIGNoYW5nZWQuICovXG4gIHJlYWRvbmx5IG9wdGlvbjogQ2RrT3B0aW9uO1xufVxuXG4vKiogRXZlbnQgb2JqZWN0IGVtaXR0ZWQgYnkgTWF0T3B0aW9uIHdoZW4gc2VsZWN0ZWQgb3IgZGVzZWxlY3RlZC4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgT3B0aW9uU2VsZWN0aW9uQ2hhbmdlRXZlbnQge1xuICAvKiogUmVmZXJlbmNlIHRvIHRoZSBvcHRpb24gdGhhdCBlbWl0dGVkIHRoZSBldmVudC4gKi9cbiAgc291cmNlOiBDZGtPcHRpb247XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGNoYW5nZSBpbiB0aGUgb3B0aW9uJ3MgdmFsdWUgd2FzIGEgcmVzdWx0IG9mIGEgdXNlciBhY3Rpb24uICovXG4gIGlzVXNlcklucHV0OiBib29sZWFuO1xufVxuIl19