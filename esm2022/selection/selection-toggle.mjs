/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { coerceNumberProperty } from '@angular/cdk/coercion';
import { Directive, Inject, Input, Optional, Self } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { of as observableOf, Subject } from 'rxjs';
import { distinctUntilChanged, switchMap, takeUntil } from 'rxjs/operators';
import { CdkSelection } from './selection';
import * as i0 from "@angular/core";
import * as i1 from "./selection";
/**
 * Makes the element a selection toggle.
 *
 * Must be used within a parent `CdkSelection` directive.
 * Must be provided with the value. If `trackBy` is used on `CdkSelection`, the index of the value
 * is required. If the element implements `ControlValueAccessor`, e.g. `MatCheckbox`, the directive
 * automatically connects it with the selection state provided by the `CdkSelection` directive. If
 * not, use `checked$` to get the checked state of the value, and `toggle()` to change the selection
 * state.
 */
export class CdkSelectionToggle {
    /** The index of the value in the list. Required when used with `trackBy` */
    get index() {
        return this._index;
    }
    set index(index) {
        this._index = coerceNumberProperty(index);
    }
    /** Toggles the selection */
    toggle() {
        this._selection.toggleSelection(this.value, this.index);
    }
    constructor(_selection, _controlValueAccessors) {
        this._selection = _selection;
        this._controlValueAccessors = _controlValueAccessors;
        this._destroyed = new Subject();
        this.checked = _selection.change.pipe(switchMap(() => observableOf(this._isSelected())), distinctUntilChanged());
    }
    ngOnInit() {
        this._assertValidParentSelection();
        this._configureControlValueAccessor();
    }
    ngOnDestroy() {
        this._destroyed.next();
        this._destroyed.complete();
    }
    _assertValidParentSelection() {
        if (!this._selection && (typeof ngDevMode === 'undefined' || ngDevMode)) {
            throw Error('CdkSelectAll: missing CdkSelection in the parent');
        }
    }
    _configureControlValueAccessor() {
        if (this._controlValueAccessors && this._controlValueAccessors.length) {
            this._controlValueAccessors[0].registerOnChange((e) => {
                if (typeof e === 'boolean') {
                    this.toggle();
                }
            });
            this.checked.pipe(takeUntil(this._destroyed)).subscribe(state => {
                this._controlValueAccessors[0].writeValue(state);
            });
        }
    }
    _isSelected() {
        return this._selection.isSelected(this.value, this.index);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.2.0-rc.1", ngImport: i0, type: CdkSelectionToggle, deps: [{ token: CdkSelection, optional: true }, { token: NG_VALUE_ACCESSOR, optional: true, self: true }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "17.2.0-rc.1", type: CdkSelectionToggle, isStandalone: true, selector: "[cdkSelectionToggle]", inputs: { value: ["cdkSelectionToggleValue", "value"], index: ["cdkSelectionToggleIndex", "index"] }, exportAs: ["cdkSelectionToggle"], ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.2.0-rc.1", ngImport: i0, type: CdkSelectionToggle, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkSelectionToggle]',
                    exportAs: 'cdkSelectionToggle',
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: i1.CdkSelection, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [CdkSelection]
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Self
                }, {
                    type: Inject,
                    args: [NG_VALUE_ACCESSOR]
                }] }], propDecorators: { value: [{
                type: Input,
                args: ['cdkSelectionToggleValue']
            }], index: [{
                type: Input,
                args: ['cdkSelectionToggleIndex']
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VsZWN0aW9uLXRvZ2dsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL3NlbGVjdGlvbi9zZWxlY3Rpb24tdG9nZ2xlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxvQkFBb0IsRUFBYyxNQUFNLHVCQUF1QixDQUFDO0FBQ3hFLE9BQU8sRUFBQyxTQUFTLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBcUIsUUFBUSxFQUFFLElBQUksRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUMxRixPQUFPLEVBQXVCLGlCQUFpQixFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDdkUsT0FBTyxFQUFhLEVBQUUsSUFBSSxZQUFZLEVBQUUsT0FBTyxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQzdELE9BQU8sRUFBQyxvQkFBb0IsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFFMUUsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGFBQWEsQ0FBQzs7O0FBRXpDOzs7Ozs7Ozs7R0FTRztBQU1ILE1BQU0sT0FBTyxrQkFBa0I7SUFJN0IsNEVBQTRFO0lBQzVFLElBQ0ksS0FBSztRQUNQLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQztJQUNyQixDQUFDO0lBQ0QsSUFBSSxLQUFLLENBQUMsS0FBa0I7UUFDMUIsSUFBSSxDQUFDLE1BQU0sR0FBRyxvQkFBb0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUM1QyxDQUFDO0lBTUQsNEJBQTRCO0lBQzVCLE1BQU07UUFDSixJQUFJLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUMxRCxDQUFDO0lBSUQsWUFDNEMsVUFBMkIsRUFJN0Qsc0JBQThDO1FBSlosZUFBVSxHQUFWLFVBQVUsQ0FBaUI7UUFJN0QsMkJBQXNCLEdBQXRCLHNCQUFzQixDQUF3QjtRQVBoRCxlQUFVLEdBQUcsSUFBSSxPQUFPLEVBQVEsQ0FBQztRQVN2QyxJQUFJLENBQUMsT0FBTyxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUNuQyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLEVBQ2pELG9CQUFvQixFQUFFLENBQ3ZCLENBQUM7SUFDSixDQUFDO0lBRUQsUUFBUTtRQUNOLElBQUksQ0FBQywyQkFBMkIsRUFBRSxDQUFDO1FBQ25DLElBQUksQ0FBQyw4QkFBOEIsRUFBRSxDQUFDO0lBQ3hDLENBQUM7SUFFRCxXQUFXO1FBQ1QsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUN2QixJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQzdCLENBQUM7SUFFTywyQkFBMkI7UUFDakMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLElBQUksQ0FBQyxPQUFPLFNBQVMsS0FBSyxXQUFXLElBQUksU0FBUyxDQUFDLEVBQUUsQ0FBQztZQUN4RSxNQUFNLEtBQUssQ0FBQyxrREFBa0QsQ0FBQyxDQUFDO1FBQ2xFLENBQUM7SUFDSCxDQUFDO0lBRU8sOEJBQThCO1FBQ3BDLElBQUksSUFBSSxDQUFDLHNCQUFzQixJQUFJLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUN0RSxJQUFJLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFVLEVBQUUsRUFBRTtnQkFDN0QsSUFBSSxPQUFPLENBQUMsS0FBSyxTQUFTLEVBQUUsQ0FBQztvQkFDM0IsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUNoQixDQUFDO1lBQ0gsQ0FBQyxDQUFDLENBQUM7WUFFSCxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUM5RCxJQUFJLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ25ELENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztJQUNILENBQUM7SUFFTyxXQUFXO1FBQ2pCLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDNUQsQ0FBQzttSEFyRVUsa0JBQWtCLGtCQXlCUCxZQUFZLDZCQUd4QixpQkFBaUI7dUdBNUJoQixrQkFBa0I7O2dHQUFsQixrQkFBa0I7a0JBTDlCLFNBQVM7bUJBQUM7b0JBQ1QsUUFBUSxFQUFFLHNCQUFzQjtvQkFDaEMsUUFBUSxFQUFFLG9CQUFvQjtvQkFDOUIsVUFBVSxFQUFFLElBQUk7aUJBQ2pCOzswQkEwQkksUUFBUTs7MEJBQUksTUFBTTsyQkFBQyxZQUFZOzswQkFDL0IsUUFBUTs7MEJBQ1IsSUFBSTs7MEJBQ0osTUFBTTsyQkFBQyxpQkFBaUI7eUNBMUJPLEtBQUs7c0JBQXRDLEtBQUs7dUJBQUMseUJBQXlCO2dCQUk1QixLQUFLO3NCQURSLEtBQUs7dUJBQUMseUJBQXlCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Y29lcmNlTnVtYmVyUHJvcGVydHksIE51bWJlcklucHV0fSBmcm9tICdAYW5ndWxhci9jZGsvY29lcmNpb24nO1xuaW1wb3J0IHtEaXJlY3RpdmUsIEluamVjdCwgSW5wdXQsIE9uRGVzdHJveSwgT25Jbml0LCBPcHRpb25hbCwgU2VsZn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0NvbnRyb2xWYWx1ZUFjY2Vzc29yLCBOR19WQUxVRV9BQ0NFU1NPUn0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xuaW1wb3J0IHtPYnNlcnZhYmxlLCBvZiBhcyBvYnNlcnZhYmxlT2YsIFN1YmplY3R9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHtkaXN0aW5jdFVudGlsQ2hhbmdlZCwgc3dpdGNoTWFwLCB0YWtlVW50aWx9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcblxuaW1wb3J0IHtDZGtTZWxlY3Rpb259IGZyb20gJy4vc2VsZWN0aW9uJztcblxuLyoqXG4gKiBNYWtlcyB0aGUgZWxlbWVudCBhIHNlbGVjdGlvbiB0b2dnbGUuXG4gKlxuICogTXVzdCBiZSB1c2VkIHdpdGhpbiBhIHBhcmVudCBgQ2RrU2VsZWN0aW9uYCBkaXJlY3RpdmUuXG4gKiBNdXN0IGJlIHByb3ZpZGVkIHdpdGggdGhlIHZhbHVlLiBJZiBgdHJhY2tCeWAgaXMgdXNlZCBvbiBgQ2RrU2VsZWN0aW9uYCwgdGhlIGluZGV4IG9mIHRoZSB2YWx1ZVxuICogaXMgcmVxdWlyZWQuIElmIHRoZSBlbGVtZW50IGltcGxlbWVudHMgYENvbnRyb2xWYWx1ZUFjY2Vzc29yYCwgZS5nLiBgTWF0Q2hlY2tib3hgLCB0aGUgZGlyZWN0aXZlXG4gKiBhdXRvbWF0aWNhbGx5IGNvbm5lY3RzIGl0IHdpdGggdGhlIHNlbGVjdGlvbiBzdGF0ZSBwcm92aWRlZCBieSB0aGUgYENka1NlbGVjdGlvbmAgZGlyZWN0aXZlLiBJZlxuICogbm90LCB1c2UgYGNoZWNrZWQkYCB0byBnZXQgdGhlIGNoZWNrZWQgc3RhdGUgb2YgdGhlIHZhbHVlLCBhbmQgYHRvZ2dsZSgpYCB0byBjaGFuZ2UgdGhlIHNlbGVjdGlvblxuICogc3RhdGUuXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tjZGtTZWxlY3Rpb25Ub2dnbGVdJyxcbiAgZXhwb3J0QXM6ICdjZGtTZWxlY3Rpb25Ub2dnbGUnLFxuICBzdGFuZGFsb25lOiB0cnVlLFxufSlcbmV4cG9ydCBjbGFzcyBDZGtTZWxlY3Rpb25Ub2dnbGU8VD4gaW1wbGVtZW50cyBPbkRlc3Ryb3ksIE9uSW5pdCB7XG4gIC8qKiBUaGUgdmFsdWUgdGhhdCBpcyBhc3NvY2lhdGVkIHdpdGggdGhlIHRvZ2dsZSAqL1xuICBASW5wdXQoJ2Nka1NlbGVjdGlvblRvZ2dsZVZhbHVlJykgdmFsdWU6IFQ7XG5cbiAgLyoqIFRoZSBpbmRleCBvZiB0aGUgdmFsdWUgaW4gdGhlIGxpc3QuIFJlcXVpcmVkIHdoZW4gdXNlZCB3aXRoIGB0cmFja0J5YCAqL1xuICBASW5wdXQoJ2Nka1NlbGVjdGlvblRvZ2dsZUluZGV4JylcbiAgZ2V0IGluZGV4KCk6IG51bWJlciB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIHRoaXMuX2luZGV4O1xuICB9XG4gIHNldCBpbmRleChpbmRleDogTnVtYmVySW5wdXQpIHtcbiAgICB0aGlzLl9pbmRleCA9IGNvZXJjZU51bWJlclByb3BlcnR5KGluZGV4KTtcbiAgfVxuICBwcm90ZWN0ZWQgX2luZGV4PzogbnVtYmVyO1xuXG4gIC8qKiBUaGUgY2hlY2tlZCBzdGF0ZSBvZiB0aGUgc2VsZWN0aW9uIHRvZ2dsZSAqL1xuICByZWFkb25seSBjaGVja2VkOiBPYnNlcnZhYmxlPGJvb2xlYW4+O1xuXG4gIC8qKiBUb2dnbGVzIHRoZSBzZWxlY3Rpb24gKi9cbiAgdG9nZ2xlKCkge1xuICAgIHRoaXMuX3NlbGVjdGlvbi50b2dnbGVTZWxlY3Rpb24odGhpcy52YWx1ZSwgdGhpcy5pbmRleCk7XG4gIH1cblxuICBwcml2YXRlIF9kZXN0cm95ZWQgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIEBPcHRpb25hbCgpIEBJbmplY3QoQ2RrU2VsZWN0aW9uKSBwcml2YXRlIF9zZWxlY3Rpb246IENka1NlbGVjdGlvbjxUPixcbiAgICBAT3B0aW9uYWwoKVxuICAgIEBTZWxmKClcbiAgICBASW5qZWN0KE5HX1ZBTFVFX0FDQ0VTU09SKVxuICAgIHByaXZhdGUgX2NvbnRyb2xWYWx1ZUFjY2Vzc29yczogQ29udHJvbFZhbHVlQWNjZXNzb3JbXSxcbiAgKSB7XG4gICAgdGhpcy5jaGVja2VkID0gX3NlbGVjdGlvbi5jaGFuZ2UucGlwZShcbiAgICAgIHN3aXRjaE1hcCgoKSA9PiBvYnNlcnZhYmxlT2YodGhpcy5faXNTZWxlY3RlZCgpKSksXG4gICAgICBkaXN0aW5jdFVudGlsQ2hhbmdlZCgpLFxuICAgICk7XG4gIH1cblxuICBuZ09uSW5pdCgpIHtcbiAgICB0aGlzLl9hc3NlcnRWYWxpZFBhcmVudFNlbGVjdGlvbigpO1xuICAgIHRoaXMuX2NvbmZpZ3VyZUNvbnRyb2xWYWx1ZUFjY2Vzc29yKCk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICB0aGlzLl9kZXN0cm95ZWQubmV4dCgpO1xuICAgIHRoaXMuX2Rlc3Ryb3llZC5jb21wbGV0ZSgpO1xuICB9XG5cbiAgcHJpdmF0ZSBfYXNzZXJ0VmFsaWRQYXJlbnRTZWxlY3Rpb24oKSB7XG4gICAgaWYgKCF0aGlzLl9zZWxlY3Rpb24gJiYgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkpIHtcbiAgICAgIHRocm93IEVycm9yKCdDZGtTZWxlY3RBbGw6IG1pc3NpbmcgQ2RrU2VsZWN0aW9uIGluIHRoZSBwYXJlbnQnKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9jb25maWd1cmVDb250cm9sVmFsdWVBY2Nlc3NvcigpIHtcbiAgICBpZiAodGhpcy5fY29udHJvbFZhbHVlQWNjZXNzb3JzICYmIHRoaXMuX2NvbnRyb2xWYWx1ZUFjY2Vzc29ycy5sZW5ndGgpIHtcbiAgICAgIHRoaXMuX2NvbnRyb2xWYWx1ZUFjY2Vzc29yc1swXS5yZWdpc3Rlck9uQ2hhbmdlKChlOiB1bmtub3duKSA9PiB7XG4gICAgICAgIGlmICh0eXBlb2YgZSA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgICAgICAgdGhpcy50b2dnbGUoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIHRoaXMuY2hlY2tlZC5waXBlKHRha2VVbnRpbCh0aGlzLl9kZXN0cm95ZWQpKS5zdWJzY3JpYmUoc3RhdGUgPT4ge1xuICAgICAgICB0aGlzLl9jb250cm9sVmFsdWVBY2Nlc3NvcnNbMF0ud3JpdGVWYWx1ZShzdGF0ZSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9pc1NlbGVjdGVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9zZWxlY3Rpb24uaXNTZWxlY3RlZCh0aGlzLnZhbHVlLCB0aGlzLmluZGV4KTtcbiAgfVxufVxuIl19