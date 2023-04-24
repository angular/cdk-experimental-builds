/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { isDataSource } from '@angular/cdk/collections';
import { Directive, EventEmitter, Input, Output, } from '@angular/core';
import { Observable, of as observableOf, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SelectionSet } from './selection-set';
import * as i0 from "@angular/core";
/**
 * Manages the selection states of the items and provides methods to check and update the selection
 * states.
 * It must be applied to the parent element if `cdkSelectionToggle`, `cdkSelectAll`,
 * `cdkRowSelection` and `cdkSelectionColumn` are applied.
 */
class CdkSelection {
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
        this._renderChangeSubscription = dataStream
            .pipe(takeUntil(this._destroyed))
            .subscribe(data => {
            this._data = data || [];
        });
    }
    ngOnInit() {
        this._selection = new SelectionSet(this._multiple, this.trackByFn);
        this._selection.changed.pipe(takeUntil(this._destroyed)).subscribe(change => {
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
        if (!!this.trackByFn && index == null && (typeof ngDevMode === 'undefined' || ngDevMode)) {
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
        if (!!this.trackByFn && index == null && (typeof ngDevMode === 'undefined' || ngDevMode)) {
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
        return (!this.isAllSelected() &&
            this._data.some((value, index) => this._selection.isSelected({ value, index })));
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.0.0-rc.2", ngImport: i0, type: CdkSelection, deps: [], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "16.0.0-rc.2", type: CdkSelection, selector: "[cdkSelection]", inputs: { dataSource: "dataSource", trackByFn: ["trackBy", "trackByFn"], multiple: ["cdkSelectionMultiple", "multiple"] }, outputs: { change: "cdkSelectionChange" }, exportAs: ["cdkSelection"], ngImport: i0 }); }
}
export { CdkSelection };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.0.0-rc.2", ngImport: i0, type: CdkSelection, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkSelection]',
                    exportAs: 'cdkSelection',
                }]
        }], propDecorators: { dataSource: [{
                type: Input
            }], trackByFn: [{
                type: Input,
                args: ['trackBy']
            }], multiple: [{
                type: Input,
                args: ['cdkSelectionMultiple']
            }], change: [{
                type: Output,
                args: ['cdkSelectionChange']
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VsZWN0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvc2VsZWN0aW9uL3NlbGVjdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQWUscUJBQXFCLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUMxRSxPQUFPLEVBQStCLFlBQVksRUFBWSxNQUFNLDBCQUEwQixDQUFDO0FBQy9GLE9BQU8sRUFFTCxTQUFTLEVBQ1QsWUFBWSxFQUNaLEtBQUssRUFHTCxNQUFNLEdBRVAsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFDLFVBQVUsRUFBRSxFQUFFLElBQUksWUFBWSxFQUFFLE9BQU8sRUFBZSxNQUFNLE1BQU0sQ0FBQztBQUMzRSxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFFekMsT0FBTyxFQUF1QyxZQUFZLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQzs7QUFFbkY7Ozs7O0dBS0c7QUFDSCxNQUlhLFlBQVk7SUFKekI7UUE4QkUsb0NBQW9DO1FBQ0csV0FBTSxHQUFHLElBQUksWUFBWSxFQUFzQixDQUFDO1FBUS9FLGVBQVUsR0FBRyxJQUFJLE9BQU8sRUFBUSxDQUFDO1FBb0p6QyxtQkFBYyxHQUFtQixNQUFNLENBQUM7S0FDekM7SUFyTEMsSUFDSSxVQUFVO1FBQ1osT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDO0lBQzFCLENBQUM7SUFDRCxJQUFJLFVBQVUsQ0FBQyxVQUE4QjtRQUMzQyxJQUFJLElBQUksQ0FBQyxXQUFXLEtBQUssVUFBVSxFQUFFO1lBQ25DLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxVQUFVLENBQUMsQ0FBQztTQUNwQztJQUNILENBQUM7SUFLRCw0Q0FBNEM7SUFDNUMsSUFDSSxRQUFRO1FBQ1YsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDO0lBQ3hCLENBQUM7SUFDRCxJQUFJ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QVUsQ0FBQyxRQUFRLENBQUMsR0FBRyxVQUFVLENBQUMsQ0FBQztJQUMxQyxDQUFDO0lBRU8scUJBQXFCO1FBQzNCLElBQUksSUFBSSxDQUFDLGFBQWEsRUFBRSxFQUFFO1lBQ3hCLElBQUksQ0FBQyxjQUFjLEdBQUcsS0FBSyxDQUFDO1NBQzdCO2FBQU0sSUFBSSxJQUFJLENBQUMsaUJBQWlCLEVBQUUsRUFBRTtZQUNuQyxJQUFJLENBQUMsY0FBYyxHQUFHLFNBQVMsQ0FBQztTQUNqQzthQUFNO1lBQ0wsSUFBSSxDQUFDLGNBQWMsR0FBRyxNQUFNLENBQUM7U0FDOUI7SUFDSCxDQUFDO21IQXJMVSxZQUFZO3VHQUFaLFlBQVk7O1NBQVosWUFBWTtnR0FBWixZQUFZO2tCQUp4QixTQUFTO21CQUFDO29CQUNULFFBQVEsRUFBRSxnQkFBZ0I7b0JBQzFCLFFBQVEsRUFBRSxjQUFjO2lCQUN6Qjs4QkFLSyxVQUFVO3NCQURiLEtBQUs7Z0JBV1ksU0FBUztzQkFBMUIsS0FBSzt1QkFBQyxTQUFTO2dCQUlaLFFBQVE7c0JBRFgsS0FBSzt1QkFBQyxzQkFBc0I7Z0JBVVUsTUFBTTtzQkFBNUMsTUFBTTt1QkFBQyxvQkFBb0IiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtCb29sZWFuSW5wdXQsIGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvZXJjaW9uJztcbmltcG9ydCB7Q29sbGVjdGlvblZpZXdlciwgRGF0YVNvdXJjZSwgaXNEYXRhU291cmNlLCBMaXN0UmFuZ2V9IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2xsZWN0aW9ucyc7XG5pbXBvcnQge1xuICBBZnRlckNvbnRlbnRDaGVja2VkLFxuICBEaXJlY3RpdmUsXG4gIEV2ZW50RW1pdHRlcixcbiAgSW5wdXQsXG4gIE9uRGVzdHJveSxcbiAgT25Jbml0LFxuICBPdXRwdXQsXG4gIFRyYWNrQnlGdW5jdGlvbixcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge09ic2VydmFibGUsIG9mIGFzIG9ic2VydmFibGVPZiwgU3ViamVjdCwgU3Vic2NyaXB0aW9ufSBmcm9tICdyeGpzJztcbmltcG9ydCB7dGFrZVVudGlsfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbmltcG9ydCB7U2VsZWN0YWJsZVdpdGhJbmRleCwgU2VsZWN0aW9uQ2hhbmdlLCBTZWxlY3Rpb25TZXR9IGZyb20gJy4vc2VsZWN0aW9uLXNldCc7XG5cbi8qKlxuICogTWFuYWdlcyB0aGUgc2VsZWN0aW9uIHN0YXRlcyBvZiB0aGUgaXRlbXMgYW5kIHByb3ZpZGVzIG1ldGhvZHMgdG8gY2hlY2sgYW5kIHVwZGF0ZSB0aGUgc2VsZWN0aW9uXG4gKiBzdGF0ZXMuXG4gKiBJdCBtdXN0IGJlIGFwcGxpZWQgdG8gdGhlIHBhcmVudCBlbGVtZW50IGlmIGBjZGtTZWxlY3Rpb25Ub2dnbGVgLCBgY2RrU2VsZWN0QWxsYCxcbiAqIGBjZGtSb3dTZWxlY3Rpb25gIGFuZCBgY2RrU2VsZWN0aW9uQ29sdW1uYCBhcmUgYXBwbGllZC5cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW2Nka1NlbGVjdGlvbl0nLFxuICBleHBvcnRBczogJ2Nka1NlbGVjdGlvbicsXG59KVxuZXhwb3J0IGNsYXNzIENka1NlbGVjdGlvbjxUPiBpbXBsZW1lbnRzIE9uSW5pdCwgQWZ0ZXJDb250ZW50Q2hlY2tlZCwgQ29sbGVjdGlvblZpZXdlciwgT25EZXN0cm95IHtcbiAgdmlld0NoYW5nZTogT2JzZXJ2YWJsZTxMaXN0UmFuZ2U+O1xuXG4gIEBJbnB1dCgpXG4gIGdldCBkYXRhU291cmNlKCk6IFRhYmxlRGF0YVNvdXJjZTxUPiB7XG4gICAgcmV0dXJuIHRoaXMuX2RhdGFTb3VyY2U7XG4gIH1cbiAgc2V0IGRhdGFTb3VyY2UoZGF0YVNvdXJjZTogVGFibGVEYXRhU291cmNlPFQ+KSB7XG4gICAgaWYgKHRoaXMuX2RhdGFTb3VyY2UgIT09IGRhdGFTb3VyY2UpIHtcbiAgICAgIHRoaXMuX3N3aXRjaERhdGFTb3VyY2UoZGF0YVNvdXJjZSk7XG4gICAgfVxuICB9XG4gIHByaXZhdGUgX2RhdGFTb3VyY2U6IFRhYmxlRGF0YVNvdXJjZTxUPjtcblxuICBASW5wdXQoJ3RyYWNrQnknKSB0cmFja0J5Rm46IFRyYWNrQnlGdW5jdGlvbjxUPjtcblxuICAvKiogV2hldGhlciB0byBzdXBwb3J0IG11bHRpcGxlIHNlbGVjdGlvbiAqL1xuICBASW5wdXQoJ2Nka1NlbGVjdGlvbk11bHRpcGxlJylcbiAgZ2V0IG11bHRpcGxlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9tdWx0aXBsZTtcbiAgfVxuICBzZXQgbXVsdGlwbGUobXVsdGlwbGU6IEJvb2xlYW5JbnB1dCkge1xuICAgIHRoaXMuX211bHRpcGxlID0gY29lcmNlQm9vbGVhblByb3BlcnR5KG11bHRpcGxlKTtcbiAgfVxuICBwcm90ZWN0ZWQgX211bHRpcGxlOiBib29sZWFuO1xuXG4gIC8qKiBFbWl0cyB3aGVuIHNlbGVjdGlvbiBjaGFuZ2VzLiAqL1xuICBAT3V0cHV0KCdjZGtTZWxlY3Rpb25DaGFuZ2UnKSByZWFkb25seSBjaGFuZ2UgPSBuZXcgRXZlbnRFbWl0dGVyPFNlbGVjdGlvbkNoYW5nZTxUPj4oKTtcblxuICAvKiogTGF0ZXN0IGRhdGEgcHJvdmlkZWQgYnkgdGhlIGRhdGEgc291cmNlLiAqL1xuICBwcml2YXRlIF9kYXRhOiBUW10gfCByZWFkb25seSBUW107XG5cbiAgLyoqIFN1YnNjcmlwdGlvbiB0aGF0IGxpc3RlbnMgZm9yIHRoZSBkYXRhIHByb3ZpZGVkIGJ5IHRoZSBkYXRhIHNvdXJjZS4gICovXG4gIHByaXZhdGUgX3JlbmRlckNoYW5nZVN1YnNjcmlwdGlvbjogU3Vic2NyaXB0aW9uIHwgbnVsbDtcblxuICBwcml2YXRlIF9kZXN0cm95ZWQgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xuXG4gIHByaXZhdGUgX3NlbGVjdGlvbjogU2VsZWN0aW9uU2V0PFQ+O1xuXG4gIHByaXZhdGUgX3N3aXRjaERhdGFTb3VyY2UoZGF0YVNvdXJjZTogVGFibGVEYXRhU291cmNlPFQ+KSB7XG4gICAgdGhpcy5fZGF0YSA9IFtdO1xuXG4gICAgLy8gVE9ETzogTW92ZSB0aGlzIGxvZ2ljIHRvIGEgc2hhcmVkIGZ1bmN0aW9uIGluIGBjZGsvY29sbGVjdGlvbnNgLlxuICAgIGlmIChpc0RhdGFTb3VyY2UodGhpcy5fZGF0YVNvdXJjZSkpIHtcbiAgICAgIHRoaXMuX2RhdGFTb3VyY2UuZGlzY29ubmVjdCh0aGlzKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fcmVuZGVyQ2hhbmdlU3Vic2NyaXB0aW9uKSB7XG4gICAgICB0aGlzLl9yZW5kZXJDaGFuZ2VTdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcbiAgICAgIHRoaXMuX3JlbmRlckNoYW5nZVN1YnNjcmlwdGlvbiA9IG51bGw7XG4gICAgfVxuXG4gICAgdGhpcy5fZGF0YVNvdXJjZSA9IGRhdGFTb3VyY2U7XG4gIH1cblxuICBwcml2YXRlIF9vYnNlcnZlUmVuZGVyQ2hhbmdlcygpIHtcbiAgICBpZiAoIXRoaXMuX2RhdGFTb3VyY2UpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgZGF0YVN0cmVhbTogT2JzZXJ2YWJsZTxyZWFkb25seSBUW10+IHwgdW5kZWZpbmVkO1xuXG4gICAgaWYgKGlzRGF0YVNvdXJjZSh0aGlzLl9kYXRhU291cmNlKSkge1xuICAgICAgZGF0YVN0cmVhbSA9IHRoaXMuX2RhdGFTb3VyY2UuY29ubmVjdCh0aGlzKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuX2RhdGFTb3VyY2UgaW5zdGFuY2VvZiBPYnNlcnZhYmxlKSB7XG4gICAgICBkYXRhU3RyZWFtID0gdGhpcy5fZGF0YVNvdXJjZTtcbiAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkodGhpcy5fZGF0YVNvdXJjZSkpIHtcbiAgICAgIGRhdGFTdHJlYW0gPSBvYnNlcnZhYmxlT2YodGhpcy5fZGF0YVNvdXJjZSk7XG4gICAgfVxuXG4gICAgaWYgKGRhdGFTdHJlYW0gPT0gbnVsbCAmJiAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSkge1xuICAgICAgdGhyb3cgRXJyb3IoJ1Vua25vd24gZGF0YSBzb3VyY2UnKTtcbiAgICB9XG5cbiAgICB0aGlzLl9yZW5kZXJDaGFuZ2VTdWJzY3JpcHRpb24gPSBkYXRhU3RyZWFtIVxuICAgICAgLnBpcGUodGFrZVVudGlsKHRoaXMuX2Rlc3Ryb3llZCkpXG4gICAgICAuc3Vic2NyaWJlKGRhdGEgPT4ge1xuICAgICAgICB0aGlzLl9kYXRhID0gZGF0YSB8fCBbXTtcbiAgICAgIH0pO1xuICB9XG5cbiAgbmdPbkluaXQoKSB7XG4gICAgdGhpcy5fc2VsZWN0aW9uID0gbmV3IFNlbGVjdGlvblNldDxUPih0aGlzLl9tdWx0aXBsZSwgdGhpcy50cmFja0J5Rm4pO1xuICAgIHRoaXMuX3NlbGVjdGlvbi5jaGFuZ2VkLnBpcGUodGFrZVVudGlsKHRoaXMuX2Rlc3Ryb3llZCkpLnN1YnNjcmliZShjaGFuZ2UgPT4ge1xuICAgICAgdGhpcy5fdXBkYXRlU2VsZWN0QWxsU3RhdGUoKTtcbiAgICAgIHRoaXMuY2hhbmdlLmVtaXQoY2hhbmdlKTtcbiAgICB9KTtcbiAgfVxuXG4gIG5nQWZ0ZXJDb250ZW50Q2hlY2tlZCgpIHtcbiAgICBpZiAodGhpcy5fZGF0YVNvdXJjZSAmJiAhdGhpcy5fcmVuZGVyQ2hhbmdlU3Vic2NyaXB0aW9uKSB7XG4gICAgICB0aGlzLl9vYnNlcnZlUmVuZGVyQ2hhbmdlcygpO1xuICAgIH1cbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIHRoaXMuX2Rlc3Ryb3llZC5uZXh0KCk7XG4gICAgdGhpcy5fZGVzdHJveWVkLmNvbXBsZXRlKCk7XG5cbiAgICBpZiAoaXNEYXRhU291cmNlKHRoaXMuX2RhdGFTb3VyY2UpKSB7XG4gICAgICB0aGlzLl9kYXRhU291cmNlLmRpc2Nvbm5lY3QodGhpcyk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFRvZ2dsZXMgc2VsZWN0aW9uIGZvciBhIGdpdmVuIHZhbHVlLiBgaW5kZXhgIGlzIHJlcXVpcmVkIGlmIGB0cmFja0J5YCBpcyB1c2VkLiAqL1xuICB0b2dnbGVTZWxlY3Rpb24odmFsdWU6IFQsIGluZGV4PzogbnVtYmVyKSB7XG4gICAgaWYgKCEhdGhpcy50cmFja0J5Rm4gJiYgaW5kZXggPT0gbnVsbCAmJiAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSkge1xuICAgICAgdGhyb3cgRXJyb3IoJ0Nka1NlbGVjdGlvbjogaW5kZXggcmVxdWlyZWQgd2hlbiB0cmFja0J5IGlzIHVzZWQnKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5pc1NlbGVjdGVkKHZhbHVlLCBpbmRleCkpIHtcbiAgICAgIHRoaXMuX3NlbGVjdGlvbi5kZXNlbGVjdCh7dmFsdWUsIGluZGV4fSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3NlbGVjdGlvbi5zZWxlY3Qoe3ZhbHVlLCBpbmRleH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUb2dnbGVzIHNlbGVjdC1hbGwuIElmIG5vIHZhbHVlIGlzIHNlbGVjdGVkLCBzZWxlY3QgYWxsIHZhbHVlcy4gSWYgYWxsIHZhbHVlcyBvciBzb21lIG9mIHRoZVxuICAgKiB2YWx1ZXMgYXJlIHNlbGVjdGVkLCBkZS1zZWxlY3QgYWxsIHZhbHVlcy5cbiAgICovXG4gIHRvZ2dsZVNlbGVjdEFsbCgpIHtcbiAgICBpZiAoIXRoaXMuX211bHRpcGxlICYmICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpKSB7XG4gICAgICB0aHJvdyBFcnJvcignQ2RrU2VsZWN0aW9uOiBtdWx0aXBsZSBzZWxlY3Rpb24gbm90IGVuYWJsZWQnKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5zZWxlY3RBbGxTdGF0ZSA9PT0gJ25vbmUnKSB7XG4gICAgICB0aGlzLl9zZWxlY3RBbGwoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fY2xlYXJBbGwoKTtcbiAgICB9XG4gIH1cblxuICAvKiogQ2hlY2tzIHdoZXRoZXIgYSB2YWx1ZSBpcyBzZWxlY3RlZC4gYGluZGV4YCBpcyByZXF1aXJlZCBpZiBgdHJhY2tCeWAgaXMgdXNlZC4gKi9cbiAgaXNTZWxlY3RlZCh2YWx1ZTogVCwgaW5kZXg/OiBudW1iZXIpIHtcbiAgICBpZiAoISF0aGlzLnRyYWNrQnlGbiAmJiBpbmRleCA9PSBudWxsICYmICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpKSB7XG4gICAgICB0aHJvdyBFcnJvcignQ2RrU2VsZWN0aW9uOiBpbmRleCByZXF1aXJlZCB3aGVuIHRyYWNrQnkgaXMgdXNlZCcpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9zZWxlY3Rpb24uaXNTZWxlY3RlZCh7dmFsdWUsIGluZGV4fSk7XG4gIH1cblxuICAvKiogQ2hlY2tzIHdoZXRoZXIgYWxsIHZhbHVlcyBhcmUgc2VsZWN0ZWQuICovXG4gIGlzQWxsU2VsZWN0ZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2RhdGEuZXZlcnkoKHZhbHVlLCBpbmRleCkgPT4gdGhpcy5fc2VsZWN0aW9uLmlzU2VsZWN0ZWQoe3ZhbHVlLCBpbmRleH0pKTtcbiAgfVxuXG4gIC8qKiBDaGVja3Mgd2hldGhlciBwYXJ0aWFsbHkgc2VsZWN0ZWQuICovXG4gIGlzUGFydGlhbFNlbGVjdGVkKCkge1xuICAgIHJldHVybiAoXG4gICAgICAhdGhpcy5pc0FsbFNlbGVjdGVkKCkgJiZcbiAgICAgIHRoaXMuX2RhdGEuc29tZSgodmFsdWUsIGluZGV4KSA9PiB0aGlzLl9zZWxlY3Rpb24uaXNTZWxlY3RlZCh7dmFsdWUsIGluZGV4fSkpXG4gICAgKTtcbiAgfVxuXG4gIHByaXZhdGUgX3NlbGVjdEFsbCgpIHtcbiAgICBjb25zdCB0b1NlbGVjdDogU2VsZWN0YWJsZVdpdGhJbmRleDxUPltdID0gW107XG4gICAgdGhpcy5fZGF0YS5mb3JFYWNoKCh2YWx1ZSwgaW5kZXgpID0+IHtcbiAgICAgIHRvU2VsZWN0LnB1c2goe3ZhbHVlLCBpbmRleH0pO1xuICAgIH0pO1xuXG4gICAgdGhpcy5fc2VsZWN0aW9uLnNlbGVjdCguLi50b1NlbGVjdCk7XG4gIH1cblxuICBwcml2YXRlIF9jbGVhckFsbCgpIHtcbiAgICBjb25zdCB0b0Rlc2VsZWN0OiBTZWxlY3RhYmxlV2l0aEluZGV4PFQ+W10gPSBbXTtcbiAgICB0aGlzLl9kYXRhLmZvckVhY2goKHZhbHVlLCBpbmRleCkgPT4ge1xuICAgICAgdG9EZXNlbGVjdC5wdXNoKHt2YWx1ZSwgaW5kZXh9KTtcbiAgICB9KTtcblxuICAgIHRoaXMuX3NlbGVjdGlvbi5kZXNlbGVjdCguLi50b0Rlc2VsZWN0KTtcbiAgfVxuXG4gIHByaXZhdGUgX3VwZGF0ZVNlbGVjdEFsbFN0YXRlKCkge1xuICAgIGlmICh0aGlzLmlzQWxsU2VsZWN0ZWQoKSkge1xuICAgICAgdGhpcy5zZWxlY3RBbGxTdGF0ZSA9ICdhbGwnO1xuICAgIH0gZWxzZSBpZiAodGhpcy5pc1BhcnRpYWxTZWxlY3RlZCgpKSB7XG4gICAgICB0aGlzLnNlbGVjdEFsbFN0YXRlID0gJ3BhcnRpYWwnO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnNlbGVjdEFsbFN0YXRlID0gJ25vbmUnO1xuICAgIH1cbiAgfVxuXG4gIHNlbGVjdEFsbFN0YXRlOiBTZWxlY3RBbGxTdGF0ZSA9ICdub25lJztcbn1cblxudHlwZSBTZWxlY3RBbGxTdGF0ZSA9ICdhbGwnIHwgJ25vbmUnIHwgJ3BhcnRpYWwnO1xudHlwZSBUYWJsZURhdGFTb3VyY2U8VD4gPSBEYXRhU291cmNlPFQ+IHwgT2JzZXJ2YWJsZTxyZWFkb25seSBUW10+IHwgcmVhZG9ubHkgVFtdO1xuIl19