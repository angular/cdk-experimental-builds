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
    constructor(_selection, _controlValueAccessors) {
        this._selection = _selection;
        this._controlValueAccessors = _controlValueAccessors;
        /** The checked state of the selection toggle */
        this.checked = this._selection.change.pipe(switchMap(() => observableOf(this._isSelected())), distinctUntilChanged());
        this._destroyed = new Subject();
    }
    /** The index of the value in the list. Required when used with `trackBy` */
    get index() { return this._index; }
    set index(index) { this._index = coerceNumberProperty(index); }
    /** Toggles the selection */
    toggle() {
        this._selection.toggleSelection(this.value, this.index);
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
            this.checked.pipe(takeUntil(this._destroyed)).subscribe((state) => {
                this._controlValueAccessors[0].writeValue(state);
            });
        }
    }
    _isSelected() {
        return this._selection.isSelected(this.value, this.index);
    }
}
CdkSelectionToggle.decorators = [
    { type: Directive, args: [{
                selector: '[cdkSelectionToggle]',
                exportAs: 'cdkSelectionToggle',
            },] }
];
CdkSelectionToggle.ctorParameters = () => [
    { type: CdkSelection, decorators: [{ type: Optional }, { type: Inject, args: [CdkSelection,] }] },
    { type: Array, decorators: [{ type: Optional }, { type: Self }, { type: Inject, args: [NG_VALUE_ACCESSOR,] }] }
];
CdkSelectionToggle.propDecorators = {
    value: [{ type: Input, args: ['cdkSelectionToggleValue',] }],
    index: [{ type: Input, args: ['cdkSelectionToggleIndex',] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VsZWN0aW9uLXRvZ2dsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL3NlbGVjdGlvbi9zZWxlY3Rpb24tdG9nZ2xlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxvQkFBb0IsRUFBYyxNQUFNLHVCQUF1QixDQUFDO0FBQ3hFLE9BQU8sRUFDTCxTQUFTLEVBQ1QsTUFBTSxFQUNOLEtBQUssRUFHTCxRQUFRLEVBQ1IsSUFBSSxFQUNMLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBdUIsaUJBQWlCLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUN2RSxPQUFPLEVBQWEsRUFBRSxJQUFJLFlBQVksRUFBRSxPQUFPLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDN0QsT0FBTyxFQUFDLG9CQUFvQixFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUUxRSxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sYUFBYSxDQUFDO0FBRXpDOzs7Ozs7Ozs7R0FTRztBQUtILE1BQU0sT0FBTyxrQkFBa0I7SUF1QjdCLFlBQzhDLFVBQTJCLEVBQ2Qsc0JBQzdCO1FBRmdCLGVBQVUsR0FBVixVQUFVLENBQWlCO1FBQ2QsMkJBQXNCLEdBQXRCLHNCQUFzQixDQUNuRDtRQWhCOUIsZ0RBQWdEO1FBQ3ZDLFlBQU8sR0FBd0IsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUMvRCxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLEVBQ2pELG9CQUFvQixFQUFFLENBQ3pCLENBQUM7UUFPTSxlQUFVLEdBQUcsSUFBSSxPQUFPLEVBQVEsQ0FBQztJQU10QyxDQUFDO0lBdkJKLDRFQUE0RTtJQUM1RSxJQUNJLEtBQUssS0FBdUIsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUNyRCxJQUFJLEtBQUssQ0FBQyxLQUF1QixJQUFJLElBQUksQ0FBQyxNQUFNLEdBQUcsb0JBQW9CLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBU2pGLDRCQUE0QjtJQUM1QixNQUFNO1FBQ0osSUFBSSxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDMUQsQ0FBQztJQVVELFFBQVE7UUFDTixJQUFJLENBQUMsMkJBQTJCLEVBQUUsQ0FBQztRQUNuQyxJQUFJLENBQUMsOEJBQThCLEVBQUUsQ0FBQztJQUN4QyxDQUFDO0lBRUQsV0FBVztRQUNULElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDdkIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUM3QixDQUFDO0lBRU8sMkJBQTJCO1FBQ2pDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxJQUFJLENBQUMsT0FBTyxTQUFTLEtBQUssV0FBVyxJQUFJLFNBQVMsQ0FBQyxFQUFFO1lBQ3ZFLE1BQU0sS0FBSyxDQUFDLGtEQUFrRCxDQUFDLENBQUM7U0FDakU7SUFDSCxDQUFDO0lBRU8sOEJBQThCO1FBQ3BDLElBQUksSUFBSSxDQUFDLHNCQUFzQixJQUFJLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxNQUFNLEVBQUU7WUFDckUsSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBVSxFQUFFLEVBQUU7Z0JBQzdELElBQUksT0FBTyxDQUFDLEtBQUssU0FBUyxFQUFFO29CQUMxQixJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7aUJBQ2Y7WUFDSCxDQUFDLENBQUMsQ0FBQztZQUVILElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRTtnQkFDaEUsSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNuRCxDQUFDLENBQUMsQ0FBQztTQUNKO0lBQ0gsQ0FBQztJQUVPLFdBQVc7UUFDakIsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUM1RCxDQUFDOzs7WUFqRUYsU0FBUyxTQUFDO2dCQUNULFFBQVEsRUFBRSxzQkFBc0I7Z0JBQ2hDLFFBQVEsRUFBRSxvQkFBb0I7YUFDL0I7OztZQWZPLFlBQVksdUJBd0NiLFFBQVEsWUFBSSxNQUFNLFNBQUMsWUFBWTt3Q0FDL0IsUUFBUSxZQUFJLElBQUksWUFBSSxNQUFNLFNBQUMsaUJBQWlCOzs7b0JBdkJoRCxLQUFLLFNBQUMseUJBQXlCO29CQUcvQixLQUFLLFNBQUMseUJBQXlCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Y29lcmNlTnVtYmVyUHJvcGVydHksIE51bWJlcklucHV0fSBmcm9tICdAYW5ndWxhci9jZGsvY29lcmNpb24nO1xuaW1wb3J0IHtcbiAgRGlyZWN0aXZlLFxuICBJbmplY3QsXG4gIElucHV0LFxuICBPbkRlc3Ryb3ksXG4gIE9uSW5pdCxcbiAgT3B0aW9uYWwsXG4gIFNlbGZcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0NvbnRyb2xWYWx1ZUFjY2Vzc29yLCBOR19WQUxVRV9BQ0NFU1NPUn0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xuaW1wb3J0IHtPYnNlcnZhYmxlLCBvZiBhcyBvYnNlcnZhYmxlT2YsIFN1YmplY3R9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHtkaXN0aW5jdFVudGlsQ2hhbmdlZCwgc3dpdGNoTWFwLCB0YWtlVW50aWx9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcblxuaW1wb3J0IHtDZGtTZWxlY3Rpb259IGZyb20gJy4vc2VsZWN0aW9uJztcblxuLyoqXG4gKiBNYWtlcyB0aGUgZWxlbWVudCBhIHNlbGVjdGlvbiB0b2dnbGUuXG4gKlxuICogTXVzdCBiZSB1c2VkIHdpdGhpbiBhIHBhcmVudCBgQ2RrU2VsZWN0aW9uYCBkaXJlY3RpdmUuXG4gKiBNdXN0IGJlIHByb3ZpZGVkIHdpdGggdGhlIHZhbHVlLiBJZiBgdHJhY2tCeWAgaXMgdXNlZCBvbiBgQ2RrU2VsZWN0aW9uYCwgdGhlIGluZGV4IG9mIHRoZSB2YWx1ZVxuICogaXMgcmVxdWlyZWQuIElmIHRoZSBlbGVtZW50IGltcGxlbWVudHMgYENvbnRyb2xWYWx1ZUFjY2Vzc29yYCwgZS5nLiBgTWF0Q2hlY2tib3hgLCB0aGUgZGlyZWN0aXZlXG4gKiBhdXRvbWF0aWNhbGx5IGNvbm5lY3RzIGl0IHdpdGggdGhlIHNlbGVjdGlvbiBzdGF0ZSBwcm92aWRlZCBieSB0aGUgYENka1NlbGVjdGlvbmAgZGlyZWN0aXZlLiBJZlxuICogbm90LCB1c2UgYGNoZWNrZWQkYCB0byBnZXQgdGhlIGNoZWNrZWQgc3RhdGUgb2YgdGhlIHZhbHVlLCBhbmQgYHRvZ2dsZSgpYCB0byBjaGFuZ2UgdGhlIHNlbGVjdGlvblxuICogc3RhdGUuXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tjZGtTZWxlY3Rpb25Ub2dnbGVdJyxcbiAgZXhwb3J0QXM6ICdjZGtTZWxlY3Rpb25Ub2dnbGUnLFxufSlcbmV4cG9ydCBjbGFzcyBDZGtTZWxlY3Rpb25Ub2dnbGU8VD4gaW1wbGVtZW50cyBPbkRlc3Ryb3ksIE9uSW5pdCB7XG4gIC8qKiBUaGUgdmFsdWUgdGhhdCBpcyBhc3NvY2lhdGVkIHdpdGggdGhlIHRvZ2dsZSAqL1xuICBASW5wdXQoJ2Nka1NlbGVjdGlvblRvZ2dsZVZhbHVlJykgdmFsdWU6IFQ7XG5cbiAgLyoqIFRoZSBpbmRleCBvZiB0aGUgdmFsdWUgaW4gdGhlIGxpc3QuIFJlcXVpcmVkIHdoZW4gdXNlZCB3aXRoIGB0cmFja0J5YCAqL1xuICBASW5wdXQoJ2Nka1NlbGVjdGlvblRvZ2dsZUluZGV4JylcbiAgZ2V0IGluZGV4KCk6IG51bWJlcnx1bmRlZmluZWQgeyByZXR1cm4gdGhpcy5faW5kZXg7IH1cbiAgc2V0IGluZGV4KGluZGV4OiBudW1iZXJ8dW5kZWZpbmVkKSB7IHRoaXMuX2luZGV4ID0gY29lcmNlTnVtYmVyUHJvcGVydHkoaW5kZXgpOyB9XG4gIHByaXZhdGUgX2luZGV4PzogbnVtYmVyO1xuXG4gIC8qKiBUaGUgY2hlY2tlZCBzdGF0ZSBvZiB0aGUgc2VsZWN0aW9uIHRvZ2dsZSAqL1xuICByZWFkb25seSBjaGVja2VkOiBPYnNlcnZhYmxlPGJvb2xlYW4+ID0gdGhpcy5fc2VsZWN0aW9uLmNoYW5nZS5waXBlKFxuICAgICAgc3dpdGNoTWFwKCgpID0+IG9ic2VydmFibGVPZih0aGlzLl9pc1NlbGVjdGVkKCkpKSxcbiAgICAgIGRpc3RpbmN0VW50aWxDaGFuZ2VkKCksXG4gICk7XG5cbiAgLyoqIFRvZ2dsZXMgdGhlIHNlbGVjdGlvbiAqL1xuICB0b2dnbGUoKSB7XG4gICAgdGhpcy5fc2VsZWN0aW9uLnRvZ2dsZVNlbGVjdGlvbih0aGlzLnZhbHVlLCB0aGlzLmluZGV4KTtcbiAgfVxuXG4gIHByaXZhdGUgX2Rlc3Ryb3llZCA9IG5ldyBTdWJqZWN0PHZvaWQ+KCk7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBAT3B0aW9uYWwoKSBASW5qZWN0KENka1NlbGVjdGlvbikgcHJpdmF0ZSBfc2VsZWN0aW9uOiBDZGtTZWxlY3Rpb248VD4sXG4gICAgICBAT3B0aW9uYWwoKSBAU2VsZigpIEBJbmplY3QoTkdfVkFMVUVfQUNDRVNTT1IpIHByaXZhdGUgX2NvbnRyb2xWYWx1ZUFjY2Vzc29yczpcbiAgICAgICAgICBDb250cm9sVmFsdWVBY2Nlc3NvcltdLFxuICApIHt9XG5cbiAgbmdPbkluaXQoKSB7XG4gICAgdGhpcy5fYXNzZXJ0VmFsaWRQYXJlbnRTZWxlY3Rpb24oKTtcbiAgICB0aGlzLl9jb25maWd1cmVDb250cm9sVmFsdWVBY2Nlc3NvcigpO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgdGhpcy5fZGVzdHJveWVkLm5leHQoKTtcbiAgICB0aGlzLl9kZXN0cm95ZWQuY29tcGxldGUoKTtcbiAgfVxuXG4gIHByaXZhdGUgX2Fzc2VydFZhbGlkUGFyZW50U2VsZWN0aW9uKCkge1xuICAgIGlmICghdGhpcy5fc2VsZWN0aW9uICYmICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpKSB7XG4gICAgICB0aHJvdyBFcnJvcignQ2RrU2VsZWN0QWxsOiBtaXNzaW5nIENka1NlbGVjdGlvbiBpbiB0aGUgcGFyZW50Jyk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfY29uZmlndXJlQ29udHJvbFZhbHVlQWNjZXNzb3IoKSB7XG4gICAgaWYgKHRoaXMuX2NvbnRyb2xWYWx1ZUFjY2Vzc29ycyAmJiB0aGlzLl9jb250cm9sVmFsdWVBY2Nlc3NvcnMubGVuZ3RoKSB7XG4gICAgICB0aGlzLl9jb250cm9sVmFsdWVBY2Nlc3NvcnNbMF0ucmVnaXN0ZXJPbkNoYW5nZSgoZTogdW5rbm93bikgPT4ge1xuICAgICAgICBpZiAodHlwZW9mIGUgPT09ICdib29sZWFuJykge1xuICAgICAgICAgIHRoaXMudG9nZ2xlKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLmNoZWNrZWQucGlwZSh0YWtlVW50aWwodGhpcy5fZGVzdHJveWVkKSkuc3Vic2NyaWJlKChzdGF0ZSkgPT4ge1xuICAgICAgICB0aGlzLl9jb250cm9sVmFsdWVBY2Nlc3NvcnNbMF0ud3JpdGVWYWx1ZShzdGF0ZSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9pc1NlbGVjdGVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9zZWxlY3Rpb24uaXNTZWxlY3RlZCh0aGlzLnZhbHVlLCB0aGlzLmluZGV4KTtcbiAgfVxuXG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9pbmRleDogTnVtYmVySW5wdXQ7XG59XG4iXX0=