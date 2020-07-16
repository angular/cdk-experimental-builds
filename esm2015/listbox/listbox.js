/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ContentChildren, Directive, ElementRef, EventEmitter, forwardRef, Inject, Input, Output, QueryList } from '@angular/core';
import { ActiveDescendantKeyManager } from '@angular/cdk/a11y';
import { END, ENTER, HOME, SPACE } from '@angular/cdk/keycodes';
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
                    '[attr.aria-selected]': '_selected || null',
                    '[attr.tabindex]': '_getTabIndex()',
                    '[attr.aria-disabled]': '_isInteractionDisabled()',
                    '[class.cdk-option-disabled]': '_isInteractionDisabled()',
                    '[class.cdk-option-active]': '_active'
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
            .withWrap().withVerticalOrientation().withTypeAhead();
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
                    '[attr.aria-disabled]': '_disabled',
                    '[attr.aria-multiselectable]': '_multiple',
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdGJveC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL2xpc3Rib3gvbGlzdGJveC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBRUwsZUFBZSxFQUNmLFNBQVMsRUFDVCxVQUFVLEVBQUUsWUFBWSxFQUFFLFVBQVUsRUFDcEMsTUFBTSxFQUNOLEtBQUssRUFBcUIsTUFBTSxFQUNoQyxTQUFTLEVBQ1YsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFDLDBCQUEwQixFQUFzQyxNQUFNLG1CQUFtQixDQUFDO0FBQ2xHLE9BQU8sRUFBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUM5RCxPQUFPLEVBQWUscUJBQXFCLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUMxRSxPQUFPLEVBQWtCLGNBQWMsRUFBQyxNQUFNLDBCQUEwQixDQUFDO0FBQ3pFLE9BQU8sRUFBQyxLQUFLLEVBQUUsS0FBSyxFQUFjLE9BQU8sRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUN2RCxPQUFPLEVBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUUvRCxJQUFJLE1BQU0sR0FBRyxDQUFDLENBQUM7QUFrQmYsTUFBTSxPQUFPLFNBQVM7SUE2QnBCLFlBQTZCLFdBQXVCLEVBQ08sT0FBbUI7UUFEakQsZ0JBQVcsR0FBWCxXQUFXLENBQVk7UUFDTyxZQUFPLEdBQVAsT0FBTyxDQUFZO1FBN0J0RSxjQUFTLEdBQVksS0FBSyxDQUFDO1FBQzNCLGNBQVMsR0FBWSxLQUFLLENBQUM7UUFDbkMsWUFBTyxHQUFZLEtBQUssQ0FBQztRQUV6QixnRkFBZ0Y7UUFDdkUsT0FBRSxHQUFHLGNBQWMsTUFBTSxFQUFFLEVBQUUsQ0FBQztRQW9CcEIsb0JBQWUsR0FDOUIs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QyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRXpELElBQUksV0FBVyxLQUFLLFVBQVUsRUFBRTtnQkFDOUIsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUM5QixJQUFJLENBQUMscUJBQXFCLENBQUMsTUFBTSxDQUFDLENBQUM7YUFDcEM7U0FDRjtJQUNILENBQUM7SUFFRCxpRUFBaUU7SUFDakUsZUFBZSxDQUFDLE1BQWlCO1FBQy9CLElBQUksQ0FBQyxlQUFlLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDaEQsQ0FBQzs7O1lBN05GLFNBQVMsU0FBQztnQkFDUCxRQUFRLEVBQUUsY0FBYztnQkFDeEIsUUFBUSxFQUFFLFlBQVk7Z0JBQ3RCLElBQUksRUFBRTtvQkFDSixNQUFNLEVBQUUsU0FBUztvQkFDakIsV0FBVyxFQUFFLGtCQUFrQjtvQkFDL0Isc0JBQXNCLEVBQUUsV0FBVztvQkFDbkMsNkJBQTZCLEVBQUUsV0FBVztvQkFDMUMsOEJBQThCLEVBQUUsNEJBQTRCO2lCQUM3RDthQUNKOzs7dUJBdUJFLGVBQWUsU0FBQyxTQUFTLEVBQUUsRUFBQyxXQUFXLEVBQUUsSUFBSSxFQUFDOzhCQUU5QyxNQUFNO3VCQU9OLEtBQUs7dUJBU0wsS0FBSztrQ0FTTCxLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7XG4gIEFmdGVyQ29udGVudEluaXQsXG4gIENvbnRlbnRDaGlsZHJlbixcbiAgRGlyZWN0aXZlLFxuICBFbGVtZW50UmVmLCBFdmVudEVtaXR0ZXIsIGZvcndhcmRSZWYsXG4gIEluamVjdCxcbiAgSW5wdXQsIE9uRGVzdHJveSwgT25Jbml0LCBPdXRwdXQsXG4gIFF1ZXJ5TGlzdFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7QWN0aXZlRGVzY2VuZGFudEtleU1hbmFnZXIsIEhpZ2hsaWdodGFibGUsIExpc3RLZXlNYW5hZ2VyT3B0aW9ufSBmcm9tICdAYW5ndWxhci9jZGsvYTExeSc7XG5pbXBvcnQge0VORCwgRU5URVIsIEhPTUUsIFNQQUNFfSBmcm9tICdAYW5ndWxhci9jZGsva2V5Y29kZXMnO1xuaW1wb3J0IHtCb29sZWFuSW5wdXQsIGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvZXJjaW9uJztcbmltcG9ydCB7U2VsZWN0aW9uQ2hhbmdlLCBTZWxlY3Rpb25Nb2RlbH0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvbGxlY3Rpb25zJztcbmltcG9ydCB7ZGVmZXIsIG1lcmdlLCBPYnNlcnZhYmxlLCBTdWJqZWN0fSBmcm9tICdyeGpzJztcbmltcG9ydCB7c3RhcnRXaXRoLCBzd2l0Y2hNYXAsIHRha2VVbnRpbH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuXG5sZXQgbmV4dElkID0gMDtcblxuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW2Nka09wdGlvbl0nLFxuICBleHBvcnRBczogJ2Nka09wdGlvbicsXG4gIGhvc3Q6IHtcbiAgICAncm9sZSc6ICdvcHRpb24nLFxuICAgICcoY2xpY2spJzogJ3RvZ2dsZSgpJyxcbiAgICAnKGZvY3VzKSc6ICdhY3RpdmF0ZSgpJyxcbiAgICAnKGJsdXIpJzogJ2RlYWN0aXZhdGUoKScsXG4gICAgJ1tpZF0nOiAnaWQnLFxuICAgICdbYXR0ci5hcmlhLXNlbGVjdGVkXSc6ICdfc2VsZWN0ZWQgfHwgbnVsbCcsXG4gICAgJ1thdHRyLnRhYmluZGV4XSc6ICdfZ2V0VGFiSW5kZXgoKScsXG4gICAgJ1thdHRyLmFyaWEtZGlzYWJsZWRdJzogJ19pc0ludGVyYWN0aW9uRGlzYWJsZWQoKScsXG4gICAgJ1tjbGFzcy5jZGstb3B0aW9uLWRpc2FibGVkXSc6ICdfaXNJbnRlcmFjdGlvbkRpc2FibGVkKCknLFxuICAgICdbY2xhc3MuY2RrLW9wdGlvbi1hY3RpdmVdJzogJ19hY3RpdmUnXG4gIH1cbn0pXG5leHBvcnQgY2xhc3MgQ2RrT3B0aW9uIGltcGxlbWVudHMgTGlzdEtleU1hbmFnZXJPcHRpb24sIEhpZ2hsaWdodGFibGUge1xuICBwcml2YXRlIF9zZWxlY3RlZDogYm9vbGVhbiA9IGZhbHNlO1xuICBwcml2YXRlIF9kaXNhYmxlZDogYm9vbGVhbiA9IGZhbHNlO1xuICBfYWN0aXZlOiBib29sZWFuID0gZmFsc2U7XG5cbiAgLyoqIFRoZSBpZCBvZiB0aGUgb3B0aW9uLCBzZXQgdG8gYSB1bmlxdWVpZCBpZiB0aGUgdXNlciBkb2VzIG5vdCBwcm92aWRlIG9uZS4gKi9cbiAgQElucHV0KCkgaWQgPSBgY2RrLW9wdGlvbi0ke25leHRJZCsrfWA7XG5cbiAgQElucHV0KClcbiAgZ2V0IHNlbGVjdGVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9zZWxlY3RlZDtcbiAgfVxuICBzZXQgc2VsZWN0ZWQodmFsdWU6IGJvb2xlYW4pIHtcbiAgICBpZiAoIXRoaXMuX2Rpc2FibGVkKSB7XG4gICAgICB0aGlzLl9zZWxlY3RlZCA9IGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eSh2YWx1ZSk7XG4gICAgfVxuICB9XG5cbiAgQElucHV0KClcbiAgZ2V0IGRpc2FibGVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9kaXNhYmxlZDtcbiAgfVxuICBzZXQgZGlzYWJsZWQodmFsdWU6IGJvb2xlYW4pIHtcbiAgICB0aGlzLl9kaXNhYmxlZCA9IGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eSh2YWx1ZSk7XG4gIH1cblxuICBAT3V0cHV0KCkgcmVhZG9ubHkgc2VsZWN0aW9uQ2hhbmdlOiBFdmVudEVtaXR0ZXI8T3B0aW9uU2VsZWN0aW9uQ2hhbmdlRXZlbnQ+ID1cbiAgICAgIG5ldyBFdmVudEVtaXR0ZXI8T3B0aW9uU2VsZWN0aW9uQ2hhbmdlRXZlbnQ+KCk7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSByZWFkb25seSBfZWxlbWVudFJlZjogRWxlbWVudFJlZixcbiAgICAgICAgICAgICAgQEluamVjdChmb3J3YXJkUmVmKCgpID0+IENka0xpc3Rib3gpKSByZWFkb25seSBsaXN0Ym94OiBDZGtMaXN0Ym94KSB7XG4gIH1cblxuICAvKiogVG9nZ2xlcyB0aGUgc2VsZWN0ZWQgc3RhdGUsIGVtaXRzIGEgY2hhbmdlIGV2ZW50IHRocm91Z2ggdGhlIGluamVjdGVkIGxpc3Rib3guICovXG4gIHRvZ2dsZSgpIHtcbiAgICBpZiAoIXRoaXMuX2lzSW50ZXJhY3Rpb25EaXNhYmxlZCgpKSB7XG4gICAgICB0aGlzLnNlbGVjdGVkID0gIXRoaXMuc2VsZWN0ZWQ7XG4gICAgICB0aGlzLl9lbWl0U2VsZWN0aW9uQ2hhbmdlKHRydWUpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBTZXRzIHRoZSBhY3RpdmUgcHJvcGVydHkgdHJ1ZSBpZiB0aGUgb3B0aW9uIGFuZCBsaXN0Ym94IGFyZW4ndCBkaXNhYmxlZC4gKi9cbiAgYWN0aXZhdGUoKSB7XG4gICAgaWYgKCF0aGlzLl9pc0ludGVyYWN0aW9uRGlzYWJsZWQoKSkge1xuICAgICAgdGhpcy5fYWN0aXZlID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICAvKiogU2V0cyB0aGUgYWN0aXZlIHByb3BlcnR5IGZhbHNlLiAqL1xuICBkZWFjdGl2YXRlKCkge1xuICAgIGlmICghdGhpcy5faXNJbnRlcmFjdGlvbkRpc2FibGVkKCkpIHtcbiAgICAgIHRoaXMuX2FjdGl2ZSA9IGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBTZXRzIHRoZSBzZWxlY3RlZCBwcm9wZXJ0eSB0cnVlIGlmIGl0IHdhcyBmYWxzZS4gKi9cbiAgc2VsZWN0KCkge1xuICAgIGlmICghdGhpcy5zZWxlY3RlZCkge1xuICAgICAgdGhpcy5zZWxlY3RlZCA9IHRydWU7XG4gICAgICB0aGlzLl9lbWl0U2VsZWN0aW9uQ2hhbmdlKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFNldHMgdGhlIHNlbGVjdGVkIHByb3BlcnR5IGZhbHNlIGlmIGl0IHdhcyB0cnVlLiAqL1xuICBkZXNlbGVjdCgpIHtcbiAgICBpZiAodGhpcy5zZWxlY3RlZCkge1xuICAgICAgdGhpcy5zZWxlY3RlZCA9IGZhbHNlO1xuICAgICAgdGhpcy5fZW1pdFNlbGVjdGlvbkNoYW5nZSgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBBcHBsaWVzIGZvY3VzIHRvIHRoZSBvcHRpb24uICovXG4gIGZvY3VzKCkge1xuICAgIHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5mb2N1cygpO1xuICB9XG5cbiAgLyoqIFJldHVybnMgdHJ1ZSBpZiB0aGUgb3B0aW9uIG9yIGxpc3Rib3ggYXJlIGRpc2FibGVkLCBhbmQgZmFsc2Ugb3RoZXJ3aXNlLiAqL1xuICBfaXNJbnRlcmFjdGlvbkRpc2FibGVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAodGhpcy5saXN0Ym94LmRpc2FibGVkIHx8IHRoaXMuX2Rpc2FibGVkKTtcbiAgfVxuXG4gIC8qKiBFbWl0cyBhIGNoYW5nZSBldmVudCBleHRlbmRpbmcgdGhlIE9wdGlvbiBTZWxlY3Rpb24gQ2hhbmdlIEV2ZW50IGludGVyZmFjZS4gKi9cbiAgcHJpdmF0ZSBfZW1pdFNlbGVjdGlvbkNoYW5nZShpc1VzZXJJbnB1dCA9IGZhbHNlKSB7XG4gICAgdGhpcy5zZWxlY3Rpb25DaGFuZ2UuZW1pdCh7XG4gICAgICBzb3VyY2U6IHRoaXMsXG4gICAgICBpc1VzZXJJbnB1dDogaXNVc2VySW5wdXRcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBSZXR1cm5zIHRoZSB0YWIgaW5kZXggd2hpY2ggZGVwZW5kcyBvbiB0aGUgZGlzYWJsZWQgcHJvcGVydHkuICovXG4gIF9nZXRUYWJJbmRleCgpOiBzdHJpbmcgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5faXNJbnRlcmFjdGlvbkRpc2FibGVkKCkgPyBudWxsIDogJy0xJztcbiAgfVxuXG4gIC8qKiBHZXQgdGhlIGxhYmVsIGZvciB0aGlzIGVsZW1lbnQgd2hpY2ggaXMgcmVxdWlyZWQgYnkgdGhlIEZvY3VzYWJsZU9wdGlvbiBpbnRlcmZhY2UuICovXG4gIGdldExhYmVsKCkge1xuICAgIC8vIHdlIGtub3cgdGhhdCB0aGUgY3VycmVudCBub2RlIGlzIGFuIGVsZW1lbnQgdHlwZVxuICAgIGNvbnN0IGNsb25lID0gdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LmNsb25lTm9kZSh0cnVlKSBhcyBFbGVtZW50O1xuICAgIHRoaXMuX3JlbW92ZUljb25zKGNsb25lKTtcblxuICAgIHJldHVybiBjbG9uZS50ZXh0Q29udGVudD8udHJpbSgpIHx8ICcnO1xuICB9XG5cbiAgLyoqIFJlbW92ZSBhbnkgY2hpbGQgZnJvbSB0aGUgZ2l2ZW4gZWxlbWVudCB3aGljaCBjYW4gYmUgaWRlbnRpZmllZCBhcyBhbiBpY29uLiAqL1xuICBwcml2YXRlIF9yZW1vdmVJY29ucyhlbGVtZW50OiBFbGVtZW50KSB7XG4gICAgLy8gVE9ETzogbWFrZSB0aGlzIGEgY29uZmlndXJhYmxlIGZ1bmN0aW9uIHRoYXQgY2FuIHJlbW92ZWQgYW55IGRlc2lyZWQgdHlwZSBvZiBub2RlLlxuICAgIGZvciAoY29uc3QgaWNvbiBvZiBBcnJheS5mcm9tKGVsZW1lbnQucXVlcnlTZWxlY3RvckFsbCgnbWF0LWljb24sIC5tYXRlcmlhbC1pY29ucycpKSkge1xuICAgICAgaWNvbi5wYXJlbnROb2RlPy5yZW1vdmVDaGlsZChpY29uKTtcbiAgICB9XG4gIH1cblxuICAvKiogU2V0cyB0aGUgYWN0aXZlIHByb3BlcnR5IHRvIHRydWUgdG8gZW5hYmxlIHRoZSBhY3RpdmUgY3NzIGNsYXNzLiAqL1xuICBzZXRBY3RpdmVTdHlsZXMoKSB7XG4gICAgdGhpcy5fYWN0aXZlID0gdHJ1ZTtcbiAgfVxuXG4gIC8qKiBTZXRzIHRoZSBhY3RpdmUgcHJvcGVydHkgdG8gZmFsc2UgdG8gZGlzYWJsZSB0aGUgYWN0aXZlIGNzcyBjbGFzcy4gKi9cbiAgc2V0SW5hY3RpdmVTdHlsZXMoKSB7XG4gICAgdGhpcy5fYWN0aXZlID0gZmFsc2U7XG4gIH1cblxuICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc2VsZWN0ZWQ6IEJvb2xlYW5JbnB1dDtcbiAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2Rpc2FibGVkOiBCb29sZWFuSW5wdXQ7XG59XG5cbkBEaXJlY3RpdmUoe1xuICAgIHNlbGVjdG9yOiAnW2Nka0xpc3Rib3hdJyxcbiAgICBleHBvcnRBczogJ2Nka0xpc3Rib3gnLFxuICAgIGhvc3Q6IHtcbiAgICAgICdyb2xlJzogJ2xpc3Rib3gnLFxuICAgICAgJyhrZXlkb3duKSc6ICdfa2V5ZG93bigkZXZlbnQpJyxcbiAgICAgICdbYXR0ci5hcmlhLWRpc2FibGVkXSc6ICdfZGlzYWJsZWQnLFxuICAgICAgJ1thdHRyLmFyaWEtbXVsdGlzZWxlY3RhYmxlXSc6ICdfbXVsdGlwbGUnLFxuICAgICAgJ1thdHRyLmFyaWEtYWN0aXZlZGVzY2VuZGFudF0nOiAnX2dldEFyaWFBY3RpdmVEZXNjZW5kYW50KCknXG4gICAgfVxufSlcbmV4cG9ydCBjbGFzcyBDZGtMaXN0Ym94IGltcGxlbWVudHMgQWZ0ZXJDb250ZW50SW5pdCwgT25EZXN0cm95LCBPbkluaXQge1xuXG4gIF9saXN0S2V5TWFuYWdlcjogQWN0aXZlRGVzY2VuZGFudEtleU1hbmFnZXI8Q2RrT3B0aW9uPjtcbiAgX3NlbGVjdGlvbk1vZGVsOiBTZWxlY3Rpb25Nb2RlbDxDZGtPcHRpb24+O1xuXG4gIHJlYWRvbmx5IG9wdGlvblNlbGVjdGlvbkNoYW5nZXM6IE9ic2VydmFibGU8T3B0aW9uU2VsZWN0aW9uQ2hhbmdlRXZlbnQ+ID0gZGVmZXIoKCkgPT4ge1xuICAgICAgY29uc3Qgb3B0aW9ucyA9IHRoaXMuX29wdGlvbnM7XG5cbiAgICAgIHJldHVybiBvcHRpb25zLmNoYW5nZXMucGlwZShcbiAgICAgICAgICBzdGFydFdpdGgob3B0aW9ucyksXG4gICAgICAgICAgc3dpdGNoTWFwKCgpID0+IG1lcmdlKC4uLm9wdGlvbnMubWFwKG9wdGlvbiA9PiBvcHRpb24uc2VsZWN0aW9uQ2hhbmdlKSkpXG4gICAgICApO1xuICB9KSBhcyBPYnNlcnZhYmxlPE9wdGlvblNlbGVjdGlvbkNoYW5nZUV2ZW50PjtcblxuXG4gIHByaXZhdGUgX2Rpc2FibGVkOiBib29sZWFuID0gZmFsc2U7XG4gIHByaXZhdGUgX211bHRpcGxlOiBib29sZWFuID0gZmFsc2U7XG4gIHByaXZhdGUgX3VzZUFjdGl2ZURlc2NlbmRhbnQ6IGJvb2xlYW4gPSB0cnVlO1xuICBwcml2YXRlIF9hY3RpdmVPcHRpb246IENka09wdGlvbjtcblxuICBwcml2YXRlIHJlYWRvbmx5IF9kZXN0cm95ZWQgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xuXG4gIEBDb250ZW50Q2hpbGRyZW4oQ2RrT3B0aW9uLCB7ZGVzY2VuZGFudHM6IHRydWV9KSBfb3B0aW9uczogUXVlcnlMaXN0PENka09wdGlvbj47XG5cbiAgQE91dHB1dCgpIHJlYWRvbmx5IHNlbGVjdGlvbkNoYW5nZTogRXZlbnRFbWl0dGVyPExpc3Rib3hTZWxlY3Rpb25DaGFuZ2VFdmVudD4gPVxuICAgICAgbmV3IEV2ZW50RW1pdHRlcjxMaXN0Ym94U2VsZWN0aW9uQ2hhbmdlRXZlbnQ+KCk7XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhlIGxpc3Rib3ggYWxsb3dzIG11bHRpcGxlIG9wdGlvbnMgdG8gYmUgc2VsZWN0ZWQuXG4gICAqIElmIGBtdWx0aXBsZWAgc3dpdGNoZXMgZnJvbSBgdHJ1ZWAgdG8gYGZhbHNlYCwgYWxsIG9wdGlvbnMgYXJlIGRlc2VsZWN0ZWQuXG4gICAqL1xuICBASW5wdXQoKVxuICBnZXQgbXVsdGlwbGUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX211bHRpcGxlO1xuICB9XG4gIHNldCBtdWx0aXBsZSh2YWx1ZTogYm9vbGVhbikge1xuICAgIHRoaXMuX3VwZGF0ZVNlbGVjdGlvbk9uTXVsdGlTZWxlY3Rpb25DaGFuZ2UodmFsdWUpO1xuICAgIHRoaXMuX211bHRpcGxlID0gY29lcmNlQm9vbGVhblByb3BlcnR5KHZhbHVlKTtcbiAgfVxuXG4gIEBJbnB1dCgpXG4gIGdldCBkaXNhYmxlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fZGlzYWJsZWQ7XG4gIH1cbiAgc2V0IGRpc2FibGVkKHZhbHVlOiBib29sZWFuKSB7XG4gICAgdGhpcy5fZGlzYWJsZWQgPSBjb2VyY2VCb29sZWFuUHJvcGVydHkodmFsdWUpO1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGxpc3Rib3ggd2lsbCB1c2UgYWN0aXZlIGRlc2NlbmRhbnQgb3Igd2lsbCBtb3ZlIGZvY3VzIG9udG8gdGhlIG9wdGlvbnMuICovXG4gIEBJbnB1dCgpXG4gIGdldCB1c2VBY3RpdmVEZXNjZW5kYW50KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl91c2VBY3RpdmVEZXNjZW5kYW50O1xuICB9XG4gIHNldCB1c2VBY3RpdmVEZXNjZW5kYW50KHNob3VsZFVzZUFjdGl2ZURlc2NlbmRhbnQ6IGJvb2xlYW4pIHtcbiAgICB0aGlzLl91c2VBY3RpdmVEZXNjZW5kYW50ID0gY29lcmNlQm9vbGVhblByb3BlcnR5KHNob3VsZFVzZUFjdGl2ZURlc2NlbmRhbnQpO1xuICB9XG5cbiAgbmdPbkluaXQoKSB7XG4gICAgdGhpcy5fc2VsZWN0aW9uTW9kZWwgPSBuZXcgU2VsZWN0aW9uTW9kZWw8Q2RrT3B0aW9uPih0aGlzLm11bHRpcGxlKTtcbiAgfVxuXG4gIG5nQWZ0ZXJDb250ZW50SW5pdCgpIHtcbiAgICB0aGlzLl9pbml0S2V5TWFuYWdlcigpO1xuICAgIHRoaXMuX2luaXRTZWxlY3Rpb25Nb2RlbCgpO1xuXG4gICAgdGhpcy5vcHRpb25TZWxlY3Rpb25DaGFuZ2VzLnN1YnNjcmliZShldmVudCA9PiB7XG4gICAgICB0aGlzLl9lbWl0Q2hhbmdlRXZlbnQoZXZlbnQuc291cmNlKTtcbiAgICAgIHRoaXMuX3VwZGF0ZVNlbGVjdGlvbk1vZGVsKGV2ZW50LnNvdXJjZSk7XG4gICAgICB0aGlzLnNldEFjdGl2ZU9wdGlvbihldmVudC5zb3VyY2UpO1xuICAgIH0pO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgdGhpcy5fbGlzdEtleU1hbmFnZXIuY2hhbmdlLmNvbXBsZXRlKCk7XG4gICAgdGhpcy5fZGVzdHJveWVkLm5leHQoKTtcbiAgICB0aGlzLl9kZXN0cm95ZWQuY29tcGxldGUoKTtcbiAgfVxuXG4gIHByaXZhdGUgX2luaXRLZXlNYW5hZ2VyKCkge1xuICAgIHRoaXMuX2xpc3RLZXlNYW5hZ2VyID0gbmV3IEFjdGl2ZURlc2NlbmRhbnRLZXlNYW5hZ2VyKHRoaXMuX29wdGlvbnMpXG4gICAgICAgIC53aXRoV3JhcCgpLndpdGhWZXJ0aWNhbE9yaWVudGF0aW9uKCkud2l0aFR5cGVBaGVhZCgpO1xuXG4gICAgdGhpcy5fbGlzdEtleU1hbmFnZXIuY2hhbmdlLnBpcGUodGFrZVVudGlsKHRoaXMuX2Rlc3Ryb3llZCkpLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICB0aGlzLl91cGRhdGVBY3RpdmVPcHRpb24oKTtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX2luaXRTZWxlY3Rpb25Nb2RlbCgpIHtcbiAgICB0aGlzLl9zZWxlY3Rpb25Nb2RlbC5jaGFuZ2VkLnBpcGUodGFrZVVudGlsKHRoaXMuX2Rlc3Ryb3llZCkpXG4gICAgICAgIC5zdWJzY3JpYmUoKGV2ZW50OiBTZWxlY3Rpb25DaGFuZ2U8Q2RrT3B0aW9uPikgPT4ge1xuXG4gICAgICBmb3IgKGNvbnN0IG9wdGlvbiBvZiBldmVudC5hZGRlZCkge1xuICAgICAgICBvcHRpb24uc2VsZWN0ZWQgPSB0cnVlO1xuICAgICAgfVxuXG4gICAgICBmb3IgKGNvbnN0IG9wdGlvbiBvZiBldmVudC5yZW1vdmVkKSB7XG4gICAgICAgIG9wdGlvbi5zZWxlY3RlZCA9IGZhbHNlO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgX2tleWRvd24oZXZlbnQ6IEtleWJvYXJkRXZlbnQpIHtcbiAgICBpZiAodGhpcy5fZGlzYWJsZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBtYW5hZ2VyID0gdGhpcy5fbGlzdEtleU1hbmFnZXI7XG4gICAgY29uc3Qge2tleUNvZGV9ID0gZXZlbnQ7XG5cbiAgICBpZiAoa2V5Q29kZSA9PT0gSE9NRSB8fCBrZXlDb2RlID09PSBFTkQpIHtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBrZXlDb2RlID09PSBIT01FID8gbWFuYWdlci5zZXRGaXJzdEl0ZW1BY3RpdmUoKSA6IG1hbmFnZXIuc2V0TGFzdEl0ZW1BY3RpdmUoKTtcblxuICAgIH0gZWxzZSBpZiAoa2V5Q29kZSA9PT0gU1BBQ0UgfHwga2V5Q29kZSA9PT0gRU5URVIpIHtcbiAgICAgIGlmIChtYW5hZ2VyLmFjdGl2ZUl0ZW0gJiYgIW1hbmFnZXIuaXNUeXBpbmcoKSkge1xuICAgICAgICB0aGlzLl90b2dnbGVBY3RpdmVPcHRpb24oKTtcbiAgICAgIH1cblxuICAgIH0gZWxzZSB7XG4gICAgICBtYW5hZ2VyLm9uS2V5ZG93bihldmVudCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEVtaXRzIGEgc2VsZWN0aW9uIGNoYW5nZSBldmVudCwgY2FsbGVkIHdoZW4gYW4gb3B0aW9uIGhhcyBpdHMgc2VsZWN0ZWQgc3RhdGUgY2hhbmdlZC4gKi9cbiAgX2VtaXRDaGFuZ2VFdmVudChvcHRpb246IENka09wdGlvbikge1xuICAgIHRoaXMuc2VsZWN0aW9uQ2hhbmdlLmVtaXQoe1xuICAgICAgc291cmNlOiB0aGlzLFxuICAgICAgb3B0aW9uOiBvcHRpb25cbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBVcGRhdGVzIHRoZSBzZWxlY3Rpb24gbW9kZWwgYWZ0ZXIgYSB0b2dnbGUuICovXG4gIF91cGRhdGVTZWxlY3Rpb25Nb2RlbChvcHRpb246IENka09wdGlvbikge1xuICAgIGlmICghdGhpcy5tdWx0aXBsZSAmJiB0aGlzLl9zZWxlY3Rpb25Nb2RlbC5zZWxlY3RlZC5sZW5ndGggIT09IDApIHtcbiAgICAgIGNvbnN0IHByZXZpb3VzbHlTZWxlY3RlZCA9IHRoaXMuX3NlbGVjdGlvbk1vZGVsLnNlbGVjdGVkWzBdO1xuICAgICAgdGhpcy5kZXNlbGVjdChwcmV2aW91c2x5U2VsZWN0ZWQpO1xuICAgIH1cblxuICAgIG9wdGlvbi5zZWxlY3RlZCA/IHRoaXMuX3NlbGVjdGlvbk1vZGVsLnNlbGVjdChvcHRpb24pIDpcbiAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9zZWxlY3Rpb25Nb2RlbC5kZXNlbGVjdChvcHRpb24pO1xuICB9XG5cbiAgLyoqIFRvZ2dsZXMgdGhlIHNlbGVjdGVkIHN0YXRlIG9mIHRoZSBhY3RpdmUgb3B0aW9uIGlmIG5vdCBkaXNhYmxlZC4gKi9cbiAgcHJpdmF0ZSBfdG9nZ2xlQWN0aXZlT3B0aW9uKCkge1xuICAgIGNvbnN0IGFjdGl2ZU9wdGlvbiA9IHRoaXMuX2xpc3RLZXlNYW5hZ2VyLmFjdGl2ZUl0ZW07XG4gICAgaWYgKGFjdGl2ZU9wdGlvbiAmJiAhYWN0aXZlT3B0aW9uLmRpc2FibGVkKSB7XG4gICAgICBhY3RpdmVPcHRpb24udG9nZ2xlKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFJldHVybnMgdGhlIGlkIG9mIHRoZSBhY3RpdmUgb3B0aW9uIGlmIGFjdGl2ZSBkZXNjZW5kYW50IGlzIGJlaW5nIHVzZWQuICovXG4gIF9nZXRBcmlhQWN0aXZlRGVzY2VuZGFudCgpOiBzdHJpbmcgfCBudWxsIHwgdW5kZWZpbmVkIHtcbiAgICByZXR1cm4gdGhpcy5fdXNlQWN0aXZlRGVzY2VuZGFudCA/IHRoaXMuX2xpc3RLZXlNYW5hZ2VyPy5hY3RpdmVJdGVtPy5pZCA6IG51bGw7XG4gIH1cblxuICAvKiogVXBkYXRlcyB0aGUgYWN0aXZlT3B0aW9uIGFuZCB0aGUgYWN0aXZlIGFuZCBmb2N1cyBwcm9wZXJ0aWVzIG9mIHRoZSBvcHRpb24uICovXG4gIHByaXZhdGUgX3VwZGF0ZUFjdGl2ZU9wdGlvbigpIHtcbiAgICBpZiAoIXRoaXMuX2xpc3RLZXlNYW5hZ2VyLmFjdGl2ZUl0ZW0pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl9hY3RpdmVPcHRpb24/LmRlYWN0aXZhdGUoKTtcbiAgICB0aGlzLl9hY3RpdmVPcHRpb24gPSB0aGlzLl9saXN0S2V5TWFuYWdlci5hY3RpdmVJdGVtO1xuICAgIHRoaXMuX2FjdGl2ZU9wdGlvbi5hY3RpdmF0ZSgpO1xuXG4gICAgaWYgKCF0aGlzLnVzZUFjdGl2ZURlc2NlbmRhbnQpIHtcbiAgICAgIHRoaXMuX2FjdGl2ZU9wdGlvbi5mb2N1cygpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBVcGRhdGVzIHNlbGVjdGlvbiBzdGF0ZXMgb2Ygb3B0aW9ucyB3aGVuIHRoZSAnbXVsdGlwbGUnIHByb3BlcnR5IGNoYW5nZXMuICovXG4gIHByaXZhdGUgX3VwZGF0ZVNlbGVjdGlvbk9uTXVsdGlTZWxlY3Rpb25DaGFuZ2UodmFsdWU6IGJvb2xlYW4pIHtcbiAgICBpZiAodGhpcy5tdWx0aXBsZSAmJiAhdmFsdWUpIHtcbiAgICAgIC8vIERlc2VsZWN0IGFsbCBvcHRpb25zIGluc3RlYWQgb2YgYXJiaXRyYXJpbHkga2VlcGluZyBvbmUgb2YgdGhlIHNlbGVjdGVkIG9wdGlvbnMuXG4gICAgICB0aGlzLnNldEFsbFNlbGVjdGVkKGZhbHNlKTtcbiAgICB9IGVsc2UgaWYgKCF0aGlzLm11bHRpcGxlICYmIHZhbHVlKSB7XG4gICAgICB0aGlzLl9zZWxlY3Rpb25Nb2RlbCA9IG5ldyBTZWxlY3Rpb25Nb2RlbDxDZGtPcHRpb24+KHZhbHVlLCB0aGlzLl9zZWxlY3Rpb25Nb2RlbC5zZWxlY3RlZCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFNlbGVjdHMgdGhlIGdpdmVuIG9wdGlvbiBpZiB0aGUgb3B0aW9uIGFuZCBsaXN0Ym94IGFyZW4ndCBkaXNhYmxlZC4gKi9cbiAgc2VsZWN0KG9wdGlvbjogQ2RrT3B0aW9uKSB7XG4gICAgaWYgKCF0aGlzLmRpc2FibGVkICYmICFvcHRpb24uZGlzYWJsZWQpIHtcbiAgICAgIG9wdGlvbi5zZWxlY3QoKTtcbiAgICB9XG4gIH1cblxuICAvKiogRGVzZWxlY3RzIHRoZSBnaXZlbiBvcHRpb24gaWYgdGhlIG9wdGlvbiBhbmQgbGlzdGJveCBhcmVuJ3QgZGlzYWJsZWQuICovXG4gIGRlc2VsZWN0KG9wdGlvbjogQ2RrT3B0aW9uKSB7XG4gICAgaWYgKCF0aGlzLmRpc2FibGVkICYmICFvcHRpb24uZGlzYWJsZWQpIHtcbiAgICAgIG9wdGlvbi5kZXNlbGVjdCgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBTZXRzIHRoZSBzZWxlY3RlZCBzdGF0ZSBvZiBhbGwgb3B0aW9ucyB0byBiZSB0aGUgZ2l2ZW4gdmFsdWUuICovXG4gIHNldEFsbFNlbGVjdGVkKGlzU2VsZWN0ZWQ6IGJvb2xlYW4pIHtcbiAgICBmb3IgKGNvbnN0IG9wdGlvbiBvZiB0aGlzLl9vcHRpb25zLnRvQXJyYXkoKSkge1xuICAgICAgY29uc3Qgd2FzU2VsZWN0ZWQgPSBvcHRpb24uc2VsZWN0ZWQ7XG4gICAgICBpc1NlbGVjdGVkID8gdGhpcy5zZWxlY3Qob3B0aW9uKSA6IHRoaXMuZGVzZWxlY3Qob3B0aW9uKTtcblxuICAgICAgaWYgKHdhc1NlbGVjdGVkICE9PSBpc1NlbGVjdGVkKSB7XG4gICAgICAgIHRoaXMuX2VtaXRDaGFuZ2VFdmVudChvcHRpb24pO1xuICAgICAgICB0aGlzLl91cGRhdGVTZWxlY3Rpb25Nb2RlbChvcHRpb24pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKiBVcGRhdGVzIHRoZSBrZXkgbWFuYWdlcidzIGFjdGl2ZSBpdGVtIHRvIHRoZSBnaXZlbiBvcHRpb24uICovXG4gIHNldEFjdGl2ZU9wdGlvbihvcHRpb246IENka09wdGlvbikge1xuICAgIHRoaXMuX2xpc3RLZXlNYW5hZ2VyLnVwZGF0ZUFjdGl2ZUl0ZW0ob3B0aW9uKTtcbiAgfVxuXG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9kaXNhYmxlZDogQm9vbGVhbklucHV0O1xuICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfbXVsdGlwbGU6IEJvb2xlYW5JbnB1dDtcbiAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3VzZUFjdGl2ZURlc2NlbmRhbnQ6IEJvb2xlYW5JbnB1dDtcbn1cblxuLyoqIENoYW5nZSBldmVudCB0aGF0IGlzIGJlaW5nIGZpcmVkIHdoZW5ldmVyIHRoZSBzZWxlY3RlZCBzdGF0ZSBvZiBhbiBvcHRpb24gY2hhbmdlcy4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTGlzdGJveFNlbGVjdGlvbkNoYW5nZUV2ZW50IHtcbiAgLyoqIFJlZmVyZW5jZSB0byB0aGUgbGlzdGJveCB0aGF0IGVtaXR0ZWQgdGhlIGV2ZW50LiAqL1xuICByZWFkb25seSBzb3VyY2U6IENka0xpc3Rib3g7XG5cbiAgLyoqIFJlZmVyZW5jZSB0byB0aGUgb3B0aW9uIHRoYXQgaGFzIGJlZW4gY2hhbmdlZC4gKi9cbiAgcmVhZG9ubHkgb3B0aW9uOiBDZGtPcHRpb247XG59XG5cbi8qKiBFdmVudCBvYmplY3QgZW1pdHRlZCBieSBNYXRPcHRpb24gd2hlbiBzZWxlY3RlZCBvciBkZXNlbGVjdGVkLiAqL1xuZXhwb3J0IGludGVyZmFjZSBPcHRpb25TZWxlY3Rpb25DaGFuZ2VFdmVudCB7XG4gIC8qKiBSZWZlcmVuY2UgdG8gdGhlIG9wdGlvbiB0aGF0IGVtaXR0ZWQgdGhlIGV2ZW50LiAqL1xuICBzb3VyY2U6IENka09wdGlvbjtcblxuICAvKiogV2hldGhlciB0aGUgY2hhbmdlIGluIHRoZSBvcHRpb24ncyB2YWx1ZSB3YXMgYSByZXN1bHQgb2YgYSB1c2VyIGFjdGlvbi4gKi9cbiAgaXNVc2VySW5wdXQ6IGJvb2xlYW47XG59XG4iXX0=