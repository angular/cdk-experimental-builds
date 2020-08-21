/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { isDataSource } from '@angular/cdk/collections';
import { Directive, EventEmitter, Input, Output } from '@angular/core';
import { Observable, of as observableOf, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SelectionSet } from './selection-set';
/**
 * Manages the selection states of the items and provides methods to check and update the selection
 * states.
 * It must be applied to the parent element if `cdkSelectionToggle`, `cdkSelectAll`,
 * `cdkRowSelection` and `cdkSelectionColumn` are applied.
 */
export class CdkSelection {
    constructor() {
        /** Emits when selection changes. */
        this.change = new EventEmitter();
        this._destroyed = new Subject();
        this.selectAllState = 'none';
    }
    get dataSource() {
        return this._dataSource;
    }
    set dataSource(dataSource) {
        if (this._dataSource !== dataSource) {
            this._switchDataSource(dataSource);
        }
    }
    /** Whether to support multiple selection */
    get multiple() {
        return this._multiple;
    }
    set multiple(multiple) {
        this._multiple = coerceBooleanProperty(multiple);
    }
    _switchDataSource(dataSource) {
        this._data = [];
        // TODO: Move this logic to a shared function in `cdk/collections`.
        if (isDataSource(this._dataSource)) {
            this._dataSource.disconnect(this);
        }
        if (this._renderChangeSubscription) {
            this._renderChangeSubscription.unsubscribe();
            this._renderChangeSubscription = null;
        }
        this._dataSource = dataSource;
    }
    _observeRenderChanges() {
        if (!this._dataSource) {
            return;
        }
        let dataStream;
        if (isDataSource(this._dataSource)) {
            dataStream = this._dataSource.connect(this);
        }
        else if (this._dataSource instanceof Observable) {
            dataStream = this._dataSource;
        }
        else if (Array.isArray(this._dataSource)) {
            dataStream = observableOf(this._dataSource);
        }
        if (dataStream == null && (typeof ngDevMode === 'undefined' || ngDevMode)) {
            throw Error('Unknown data source');
        }
        this._renderChangeSubscription =
            dataStream.pipe(takeUntil(this._destroyed)).subscribe((data) => {
                this._data = data || [];
            });
    }
    ngOnInit() {
        this._selection = new SelectionSet(this._multiple, this.trackByFn);
        this._selection.changed.pipe(takeUntil(this._destroyed)).subscribe((change) => {
            this._updateSelectAllState();
            this.change.emit(change);
        });
    }
    ngAfterContentChecked() {
        if (this._dataSource && !this._renderChangeSubscription) {
            this._observeRenderChanges();
        }
    }
    ngOnDestroy() {
        this._destroyed.next();
        this._destroyed.complete();
        if (isDataSource(this._dataSource)) {
            this._dataSource.disconnect(this);
        }
    }
    /** Toggles selection for a given value. `index` is required if `trackBy` is used. */
    toggleSelection(value, index) {
        if (this.trackByFn && index == null && (typeof ngDevMode === 'undefined' || ngDevMode)) {
            throw Error('CdkSelection: index required when trackBy is used');
        }
        if (this.isSelected(value, index)) {
            this._selection.deselect({ value, index });
        }
        else {
            this._selection.select({ value, index });
        }
    }
    /**
     * Toggles select-all. If no value is selected, select all values. If all values or some of the
     * values are selected, de-select all values.
     */
    toggleSelectAll() {
        if (!this._multiple && (typeof ngDevMode === 'undefined' || ngDevMode)) {
            throw Error('CdkSelection: multiple selection not enabled');
        }
        if (this.selectAllState === 'none') {
            this._selectAll();
        }
        else {
            this._clearAll();
        }
    }
    /** Checks whether a value is selected. `index` is required if `trackBy` is used. */
    isSelected(value, index) {
        if (this.trackByFn && index == null && (typeof ngDevMode === 'undefined' || ngDevMode)) {
            throw Error('CdkSelection: index required when trackBy is used');
        }
        return this._selection.isSelected({ value, index });
    }
    /** Checks whether all values are selected. */
    isAllSelected() {
        return this._data.every((value, index) => this._selection.isSelected({ value, index }));
    }
    /** Checks whether partially selected. */
    isPartialSelected() {
        return !this.isAllSelected() &&
            this._data.some((value, index) => this._selection.isSelected({ value, index }));
    }
    _selectAll() {
        const toSelect = [];
        this._data.forEach((value, index) => {
            toSelect.push({ value, index });
        });
        this._selection.select(...toSelect);
    }
    _clearAll() {
        const toDeselect = [];
        this._data.forEach((value, index) => {
            toDeselect.push({ value, index });
        });
        this._selection.deselect(...toDeselect);
    }
    _updateSelectAllState() {
        if (this.isAllSelected()) {
            this.selectAllState = 'all';
        }
        else if (this.isPartialSelected()) {
            this.selectAllState = 'partial';
        }
        else {
            this.selectAllState = 'none';
        }
    }
}
CdkSelection.decorators = [
    { type: Directive, args: [{
                selector: '[cdkSelection]',
                exportAs: 'cdkSelection',
            },] }
];
CdkSelection.propDecorators = {
    dataSource: [{ type: Input }],
    trackByFn: [{ type: Input, args: ['trackBy',] }],
    multiple: [{ type: Input, args: ['cdkSelectionMultiple',] }],
    change: [{ type: Output, args: ['cdkSelectionChange',] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VsZWN0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvc2VsZWN0aW9uL3NlbGVjdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQWUscUJBQXFCLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUMxRSxPQUFPLEVBQStCLFlBQVksRUFBWSxNQUFNLDBCQUEwQixDQUFDO0FBQy9GLE9BQU8sRUFFTCxTQUFTLEVBQ1QsWUFBWSxFQUNaLEtBQUssRUFHTCxNQUFNLEVBRVAsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFDLFVBQVUsRUFBRSxFQUFFLElBQUksWUFBWSxFQUFFLE9BQU8sRUFBZSxNQUFNLE1BQU0sQ0FBQztBQUMzRSxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFFekMsT0FBTyxFQUF1QyxZQUFZLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUVuRjs7Ozs7R0FLRztBQUtILE1BQU0sT0FBTyxZQUFZO0lBSnpCO1FBOEJFLG9DQUFvQztRQUNOLFdBQU0sR0FBRyxJQUFJLFlBQVksRUFBc0IsQ0FBQztRQVF0RSxlQUFVLEdBQUcsSUFBSSxPQUFPLEVBQVEsQ0FBQztRQWlKekMsbUJBQWMsR0FBbUIsTUFBTSxDQUFDO0lBRzFDLENBQUM7SUFwTEMsSUFDSSxVQUFVO1FBQ1osT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDO0lBQzFCLENBQUM7SUFDRCxJQUFJLFVBQVUsQ0FBQyxVQUE4QjtRQUMzQyxJQUFJLElBQUksQ0FBQyxXQUFXLEtBQUssVUFBVSxFQUFFO1lBQ25DLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxVQUFVLENBQUMsQ0FBQztTQUNwQztJQUNILENBQUM7SUFLRCw0Q0FBNEM7SUFDNUMsSUFDSSxRQUFRO1FBQ1YsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDO0lBQ3hCLENBQUM7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USxDQUFDLEdBQUcsVUFBVSxDQUFDLENBQUM7SUFDMUMsQ0FBQztJQUVPLHFCQUFxQjtRQUMzQixJQUFJLElBQUksQ0FBQyxhQUFhLEVBQUUsRUFBRTtZQUN4QixJQUFJLENBQUMsY0FBYyxHQUFHLEtBQUssQ0FBQztTQUM3QjthQUFNLElBQUksSUFBSSxDQUFDLGlCQUFpQixFQUFFLEVBQUU7WUFDbkMsSUFBSSxDQUFDLGNBQWMsR0FBRyxTQUFTLENBQUM7U0FDakM7YUFBTTtZQUNMLElBQUksQ0FBQyxjQUFjLEdBQUcsTUFBTSxDQUFDO1NBQzlCO0lBQ0gsQ0FBQzs7O1lBdExGLFNBQVMsU0FBQztnQkFDVCxRQUFRLEVBQUUsZ0JBQWdCO2dCQUMxQixRQUFRLEVBQUUsY0FBYzthQUN6Qjs7O3lCQUlFLEtBQUs7d0JBV0wsS0FBSyxTQUFDLFNBQVM7dUJBR2YsS0FBSyxTQUFDLHNCQUFzQjtxQkFVNUIsTUFBTSxTQUFDLG9CQUFvQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0Jvb2xlYW5JbnB1dCwgY29lcmNlQm9vbGVhblByb3BlcnR5fSBmcm9tICdAYW5ndWxhci9jZGsvY29lcmNpb24nO1xuaW1wb3J0IHtDb2xsZWN0aW9uVmlld2VyLCBEYXRhU291cmNlLCBpc0RhdGFTb3VyY2UsIExpc3RSYW5nZX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvbGxlY3Rpb25zJztcbmltcG9ydCB7XG4gIEFmdGVyQ29udGVudENoZWNrZWQsXG4gIERpcmVjdGl2ZSxcbiAgRXZlbnRFbWl0dGVyLFxuICBJbnB1dCxcbiAgT25EZXN0cm95LFxuICBPbkluaXQsXG4gIE91dHB1dCxcbiAgVHJhY2tCeUZ1bmN0aW9uXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtPYnNlcnZhYmxlLCBvZiBhcyBvYnNlcnZhYmxlT2YsIFN1YmplY3QsIFN1YnNjcmlwdGlvbn0gZnJvbSAncnhqcyc7XG5pbXBvcnQge3Rha2VVbnRpbH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuXG5pbXBvcnQge1NlbGVjdGFibGVXaXRoSW5kZXgsIFNlbGVjdGlvbkNoYW5nZSwgU2VsZWN0aW9uU2V0fSBmcm9tICcuL3NlbGVjdGlvbi1zZXQnO1xuXG4vKipcbiAqIE1hbmFnZXMgdGhlIHNlbGVjdGlvbiBzdGF0ZXMgb2YgdGhlIGl0ZW1zIGFuZCBwcm92aWRlcyBtZXRob2RzIHRvIGNoZWNrIGFuZCB1cGRhdGUgdGhlIHNlbGVjdGlvblxuICogc3RhdGVzLlxuICogSXQgbXVzdCBiZSBhcHBsaWVkIHRvIHRoZSBwYXJlbnQgZWxlbWVudCBpZiBgY2RrU2VsZWN0aW9uVG9nZ2xlYCwgYGNka1NlbGVjdEFsbGAsXG4gKiBgY2RrUm93U2VsZWN0aW9uYCBhbmQgYGNka1NlbGVjdGlvbkNvbHVtbmAgYXJlIGFwcGxpZWQuXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tjZGtTZWxlY3Rpb25dJyxcbiAgZXhwb3J0QXM6ICdjZGtTZWxlY3Rpb24nLFxufSlcbmV4cG9ydCBjbGFzcyBDZGtTZWxlY3Rpb248VD4gaW1wbGVtZW50cyBPbkluaXQsIEFmdGVyQ29udGVudENoZWNrZWQsIENvbGxlY3Rpb25WaWV3ZXIsIE9uRGVzdHJveSB7XG4gIHZpZXdDaGFuZ2U6IE9ic2VydmFibGU8TGlzdFJhbmdlPjtcblxuICBASW5wdXQoKVxuICBnZXQgZGF0YVNvdXJjZSgpOiBUYWJsZURhdGFTb3VyY2U8VD4ge1xuICAgIHJldHVybiB0aGlzLl9kYXRhU291cmNlO1xuICB9XG4gIHNldCBkYXRhU291cmNlKGRhdGFTb3VyY2U6IFRhYmxlRGF0YVNvdXJjZTxUPikge1xuICAgIGlmICh0aGlzLl9kYXRhU291cmNlICE9PSBkYXRhU291cmNlKSB7XG4gICAgICB0aGlzLl9zd2l0Y2hEYXRhU291cmNlKGRhdGFTb3VyY2UpO1xuICAgIH1cbiAgfVxuICBwcml2YXRlIF9kYXRhU291cmNlOiBUYWJsZURhdGFTb3VyY2U8VD47XG5cbiAgQElucHV0KCd0cmFja0J5JykgdHJhY2tCeUZuOiBUcmFja0J5RnVuY3Rpb248VD47XG5cbiAgLyoqIFdoZXRoZXIgdG8gc3VwcG9ydCBtdWx0aXBsZSBzZWxlY3Rpb24gKi9cbiAgQElucHV0KCdjZGtTZWxlY3Rpb25NdWx0aXBsZScpXG4gIGdldCBtdWx0aXBsZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fbXVsdGlwbGU7XG4gIH1cbiAgc2V0IG11bHRpcGxlKG11bHRpcGxlOiBib29sZWFuKSB7XG4gICAgdGhpcy5fbXVsdGlwbGUgPSBjb2VyY2VCb29sZWFuUHJvcGVydHkobXVsdGlwbGUpO1xuICB9XG4gIHByaXZhdGUgX211bHRpcGxlOiBib29sZWFuO1xuXG4gIC8qKiBFbWl0cyB3aGVuIHNlbGVjdGlvbiBjaGFuZ2VzLiAqL1xuICBAT3V0cHV0KCdjZGtTZWxlY3Rpb25DaGFuZ2UnKSBjaGFuZ2UgPSBuZXcgRXZlbnRFbWl0dGVyPFNlbGVjdGlvbkNoYW5nZTxUPj4oKTtcblxuICAvKiogTGF0ZXN0IGRhdGEgcHJvdmlkZWQgYnkgdGhlIGRhdGEgc291cmNlLiAqL1xuICBwcml2YXRlIF9kYXRhOiBUW118cmVhZG9ubHkgVFtdO1xuXG4gIC8qKiBTdWJzY3JpcHRpb24gdGhhdCBsaXN0ZW5zIGZvciB0aGUgZGF0YSBwcm92aWRlZCBieSB0aGUgZGF0YSBzb3VyY2UuICAqL1xuICBwcml2YXRlIF9yZW5kZXJDaGFuZ2VTdWJzY3JpcHRpb246IFN1YnNjcmlwdGlvbnxudWxsO1xuXG4gIHByaXZhdGUgX2Rlc3Ryb3llZCA9IG5ldyBTdWJqZWN0PHZvaWQ+KCk7XG5cbiAgcHJpdmF0ZSBfc2VsZWN0aW9uOiBTZWxlY3Rpb25TZXQ8VD47XG5cbiAgcHJpdmF0ZSBfc3dpdGNoRGF0YVNvdXJjZShkYXRhU291cmNlOiBUYWJsZURhdGFTb3VyY2U8VD4pIHtcbiAgICB0aGlzLl9kYXRhID0gW107XG5cbiAgICAvLyBUT0RPOiBNb3ZlIHRoaXMgbG9naWMgdG8gYSBzaGFyZWQgZnVuY3Rpb24gaW4gYGNkay9jb2xsZWN0aW9uc2AuXG4gICAgaWYgKGlzRGF0YVNvdXJjZSh0aGlzLl9kYXRhU291cmNlKSkge1xuICAgICAgdGhpcy5fZGF0YVNvdXJjZS5kaXNjb25uZWN0KHRoaXMpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9yZW5kZXJDaGFuZ2VTdWJzY3JpcHRpb24pIHtcbiAgICAgIHRoaXMuX3JlbmRlckNoYW5nZVN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICAgICAgdGhpcy5fcmVuZGVyQ2hhbmdlU3Vic2NyaXB0aW9uID0gbnVsbDtcbiAgICB9XG5cbiAgICB0aGlzLl9kYXRhU291cmNlID0gZGF0YVNvdXJjZTtcbiAgfVxuXG4gIHByaXZhdGUgX29ic2VydmVSZW5kZXJDaGFuZ2VzKCkge1xuICAgIGlmICghdGhpcy5fZGF0YVNvdXJjZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxldCBkYXRhU3RyZWFtOiBPYnNlcnZhYmxlPFRbXXxSZWFkb25seUFycmF5PFQ+Pnx1bmRlZmluZWQ7XG5cbiAgICBpZiAoaXNEYXRhU291cmNlKHRoaXMuX2RhdGFTb3VyY2UpKSB7XG4gICAgICBkYXRhU3RyZWFtID0gdGhpcy5fZGF0YVNvdXJjZS5jb25uZWN0KHRoaXMpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5fZGF0YVNvdXJjZSBpbnN0YW5jZW9mIE9ic2VydmFibGUpIHtcbiAgICAgIGRhdGFTdHJlYW0gPSB0aGlzLl9kYXRhU291cmNlO1xuICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheSh0aGlzLl9kYXRhU291cmNlKSkge1xuICAgICAgZGF0YVN0cmVhbSA9IG9ic2VydmFibGVPZih0aGlzLl9kYXRhU291cmNlKTtcbiAgICB9XG5cbiAgICBpZiAoZGF0YVN0cmVhbSA9PSBudWxsICYmICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpKSB7XG4gICAgICB0aHJvdyBFcnJvcignVW5rbm93biBkYXRhIHNvdXJjZScpO1xuICAgIH1cblxuICAgIHRoaXMuX3JlbmRlckNoYW5nZVN1YnNjcmlwdGlvbiA9XG4gICAgICAgIGRhdGFTdHJlYW0hLnBpcGUodGFrZVVudGlsKHRoaXMuX2Rlc3Ryb3llZCkpLnN1YnNjcmliZSgoZGF0YSkgPT4ge1xuICAgICAgICAgIHRoaXMuX2RhdGEgPSBkYXRhIHx8IFtdO1xuICAgICAgICB9KTtcbiAgfVxuXG4gIG5nT25Jbml0KCkge1xuICAgIHRoaXMuX3NlbGVjdGlvbiA9IG5ldyBTZWxlY3Rpb25TZXQ8VD4odGhpcy5fbXVsdGlwbGUsIHRoaXMudHJhY2tCeUZuKTtcbiAgICB0aGlzLl9zZWxlY3Rpb24uY2hhbmdlZC5waXBlKHRha2VVbnRpbCh0aGlzLl9kZXN0cm95ZWQpKS5zdWJzY3JpYmUoKGNoYW5nZSkgPT4ge1xuICAgICAgdGhpcy5fdXBkYXRlU2VsZWN0QWxsU3RhdGUoKTtcbiAgICAgIHRoaXMuY2hhbmdlLmVtaXQoY2hhbmdlKTtcbiAgICB9KTtcbiAgfVxuXG4gIG5nQWZ0ZXJDb250ZW50Q2hlY2tlZCgpIHtcbiAgICBpZiAodGhpcy5fZGF0YVNvdXJjZSAmJiAhdGhpcy5fcmVuZGVyQ2hhbmdlU3Vic2NyaXB0aW9uKSB7XG4gICAgICB0aGlzLl9vYnNlcnZlUmVuZGVyQ2hhbmdlcygpO1xuICAgIH1cbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIHRoaXMuX2Rlc3Ryb3llZC5uZXh0KCk7XG4gICAgdGhpcy5fZGVzdHJveWVkLmNvbXBsZXRlKCk7XG5cbiAgICBpZiAoaXNEYXRhU291cmNlKHRoaXMuX2RhdGFTb3VyY2UpKSB7XG4gICAgICB0aGlzLl9kYXRhU291cmNlLmRpc2Nvbm5lY3QodGhpcyk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFRvZ2dsZXMgc2VsZWN0aW9uIGZvciBhIGdpdmVuIHZhbHVlLiBgaW5kZXhgIGlzIHJlcXVpcmVkIGlmIGB0cmFja0J5YCBpcyB1c2VkLiAqL1xuICB0b2dnbGVTZWxlY3Rpb24odmFsdWU6IFQsIGluZGV4PzogbnVtYmVyKSB7XG4gICAgaWYgKHRoaXMudHJhY2tCeUZuICYmIGluZGV4ID09IG51bGwgJiYgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkpIHtcbiAgICAgIHRocm93IEVycm9yKCdDZGtTZWxlY3Rpb246IGluZGV4IHJlcXVpcmVkIHdoZW4gdHJhY2tCeSBpcyB1c2VkJyk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuaXNTZWxlY3RlZCh2YWx1ZSwgaW5kZXgpKSB7XG4gICAgICB0aGlzLl9zZWxlY3Rpb24uZGVzZWxlY3Qoe3ZhbHVlLCBpbmRleH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9zZWxlY3Rpb24uc2VsZWN0KHt2YWx1ZSwgaW5kZXh9KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVG9nZ2xlcyBzZWxlY3QtYWxsLiBJZiBubyB2YWx1ZSBpcyBzZWxlY3RlZCwgc2VsZWN0IGFsbCB2YWx1ZXMuIElmIGFsbCB2YWx1ZXMgb3Igc29tZSBvZiB0aGVcbiAgICogdmFsdWVzIGFyZSBzZWxlY3RlZCwgZGUtc2VsZWN0IGFsbCB2YWx1ZXMuXG4gICAqL1xuICB0b2dnbGVTZWxlY3RBbGwoKSB7XG4gICAgaWYgKCF0aGlzLl9tdWx0aXBsZSAmJiAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSkge1xuICAgICAgdGhyb3cgRXJyb3IoJ0Nka1NlbGVjdGlvbjogbXVsdGlwbGUgc2VsZWN0aW9uIG5vdCBlbmFibGVkJyk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuc2VsZWN0QWxsU3RhdGUgPT09ICdub25lJykge1xuICAgICAgdGhpcy5fc2VsZWN0QWxsKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2NsZWFyQWxsKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIENoZWNrcyB3aGV0aGVyIGEgdmFsdWUgaXMgc2VsZWN0ZWQuIGBpbmRleGAgaXMgcmVxdWlyZWQgaWYgYHRyYWNrQnlgIGlzIHVzZWQuICovXG4gIGlzU2VsZWN0ZWQodmFsdWU6IFQsIGluZGV4PzogbnVtYmVyKSB7XG4gICAgaWYgKHRoaXMudHJhY2tCeUZuICYmIGluZGV4ID09IG51bGwgJiYgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkpIHtcbiAgICAgIHRocm93IEVycm9yKCdDZGtTZWxlY3Rpb246IGluZGV4IHJlcXVpcmVkIHdoZW4gdHJhY2tCeSBpcyB1c2VkJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX3NlbGVjdGlvbi5pc1NlbGVjdGVkKHt2YWx1ZSwgaW5kZXh9KTtcbiAgfVxuXG4gIC8qKiBDaGVja3Mgd2hldGhlciBhbGwgdmFsdWVzIGFyZSBzZWxlY3RlZC4gKi9cbiAgaXNBbGxTZWxlY3RlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5fZGF0YS5ldmVyeSgodmFsdWUsIGluZGV4KSA9PiB0aGlzLl9zZWxlY3Rpb24uaXNTZWxlY3RlZCh7dmFsdWUsIGluZGV4fSkpO1xuICB9XG5cbiAgLyoqIENoZWNrcyB3aGV0aGVyIHBhcnRpYWxseSBzZWxlY3RlZC4gKi9cbiAgaXNQYXJ0aWFsU2VsZWN0ZWQoKSB7XG4gICAgcmV0dXJuICF0aGlzLmlzQWxsU2VsZWN0ZWQoKSAmJlxuICAgICAgICB0aGlzLl9kYXRhLnNvbWUoKHZhbHVlLCBpbmRleCkgPT4gdGhpcy5fc2VsZWN0aW9uLmlzU2VsZWN0ZWQoe3ZhbHVlLCBpbmRleH0pKTtcbiAgfVxuXG4gIHByaXZhdGUgX3NlbGVjdEFsbCgpIHtcbiAgICBjb25zdCB0b1NlbGVjdDogU2VsZWN0YWJsZVdpdGhJbmRleDxUPltdID0gW107XG4gICAgdGhpcy5fZGF0YS5mb3JFYWNoKCh2YWx1ZSwgaW5kZXgpID0+IHtcbiAgICAgIHRvU2VsZWN0LnB1c2goe3ZhbHVlLCBpbmRleH0pO1xuICAgIH0pO1xuXG4gICAgdGhpcy5fc2VsZWN0aW9uLnNlbGVjdCguLi50b1NlbGVjdCk7XG4gIH1cblxuICBwcml2YXRlIF9jbGVhckFsbCgpIHtcbiAgICBjb25zdCB0b0Rlc2VsZWN0OiBTZWxlY3RhYmxlV2l0aEluZGV4PFQ+W10gPSBbXTtcbiAgICB0aGlzLl9kYXRhLmZvckVhY2goKHZhbHVlLCBpbmRleCkgPT4ge1xuICAgICAgdG9EZXNlbGVjdC5wdXNoKHt2YWx1ZSwgaW5kZXh9KTtcbiAgICB9KTtcblxuICAgIHRoaXMuX3NlbGVjdGlvbi5kZXNlbGVjdCguLi50b0Rlc2VsZWN0KTtcbiAgfVxuXG4gIHByaXZhdGUgX3VwZGF0ZVNlbGVjdEFsbFN0YXRlKCkge1xuICAgIGlmICh0aGlzLmlzQWxsU2VsZWN0ZWQoKSkge1xuICAgICAgdGhpcy5zZWxlY3RBbGxTdGF0ZSA9ICdhbGwnO1xuICAgIH0gZWxzZSBpZiAodGhpcy5pc1BhcnRpYWxTZWxlY3RlZCgpKSB7XG4gICAgICB0aGlzLnNlbGVjdEFsbFN0YXRlID0gJ3BhcnRpYWwnO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnNlbGVjdEFsbFN0YXRlID0gJ25vbmUnO1xuICAgIH1cbiAgfVxuXG4gIHNlbGVjdEFsbFN0YXRlOiBTZWxlY3RBbGxTdGF0ZSA9ICdub25lJztcblxuICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfbXVsdGlwbGU6IEJvb2xlYW5JbnB1dDtcbn1cblxudHlwZSBTZWxlY3RBbGxTdGF0ZSA9ICdhbGwnfCdub25lJ3wncGFydGlhbCc7XG50eXBlIFRhYmxlRGF0YVNvdXJjZTxUPiA9IERhdGFTb3VyY2U8VD58T2JzZXJ2YWJsZTxSZWFkb25seUFycmF5PFQ+fFRbXT58UmVhZG9ubHlBcnJheTxUPnxUW107XG4iXX0=