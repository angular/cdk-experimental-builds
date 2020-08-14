/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { CdkCellDef, CdkColumnDef, CdkHeaderCellDef, CdkTable } from '@angular/cdk/table';
import { Component, Input, isDevMode, Optional, ViewChild, ChangeDetectionStrategy, ViewEncapsulation, Inject, } from '@angular/core';
import { CdkSelection } from './selection';
/**
 * Column that adds row selecting checkboxes and a select-all checkbox if `cdkSelectionMultiple` is
 * `true`.
 *
 * Must be used within a parent `CdkSelection` directive.
 */
export class CdkSelectionColumn {
    constructor(_table, selection) {
        this._table = _table;
        this.selection = selection;
    }
    /** Column name that should be used to reference this column. */
    get name() {
        return this._name;
    }
    set name(name) {
        this._name = name;
        this._syncColumnDefName();
    }
    ngOnInit() {
        if (!this.selection && isDevMode()) {
            throw Error('CdkSelectionColumn: missing CdkSelection in the parent');
        }
        this._syncColumnDefName();
        if (this._table) {
            this._columnDef.cell = this._cell;
            this._columnDef.headerCell = this._headerCell;
            this._table.addColumnDef(this._columnDef);
        }
        else {
            if (isDevMode()) {
                throw Error('CdkSelectionColumn: missing parent table');
            }
        }
    }
    ngOnDestroy() {
        if (this._table) {
            this._table.removeColumnDef(this._columnDef);
        }
    }
    _syncColumnDefName() {
        if (this._columnDef) {
            this._columnDef.name = this._name;
        }
    }
}
CdkSelectionColumn.decorators = [
    { type: Component, args: [{
                selector: 'cdk-selection-column',
                template: `
    <ng-container cdkColumnDef>
      <th cdkHeaderCell *cdkHeaderCellDef>
        <input type="checkbox" *ngIf="selection.multiple"
            cdkSelectAll
            #allToggler="cdkSelectAll"
            [checked]="allToggler.checked | async"
            [indeterminate]="allToggler.indeterminate | async"
            (click)="allToggler.toggle($event)">
      </th>
      <td cdkCell *cdkCellDef="let row; let i = $index">
        <input type="checkbox"
            #toggler="cdkSelectionToggle"
            cdkSelectionToggle
            [cdkSelectionToggleValue]="row"
            [cdkSelectionToggleIndex]="i"
            (click)="toggler.toggle()"
            [checked]="toggler.checked | async">
      </td>
    </ng-container>
  `,
                changeDetection: ChangeDetectionStrategy.OnPush,
                encapsulation: ViewEncapsulation.None
            },] }
];
CdkSelectionColumn.ctorParameters = () => [
    { type: CdkTable, decorators: [{ type: Optional }, { type: Inject, args: [CdkTable,] }] },
    { type: CdkSelection, decorators: [{ type: Optional }, { type: Inject, args: [CdkSelection,] }] }
];
CdkSelectionColumn.propDecorators = {
    name: [{ type: Input, args: ['cdkSelectionColumnName',] }],
    _columnDef: [{ type: ViewChild, args: [CdkColumnDef, { static: true },] }],
    _cell: [{ type: ViewChild, args: [CdkCellDef, { static: true },] }],
    _headerCell: [{ type: ViewChild, args: [CdkHeaderCellDef, { static: true },] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VsZWN0aW9uLWNvbHVtbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL3NlbGVjdGlvbi9zZWxlY3Rpb24tY29sdW1uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxVQUFVLEVBQUUsWUFBWSxFQUFFLGdCQUFnQixFQUFFLFFBQVEsRUFBQyxNQUFNLG9CQUFvQixDQUFDO0FBQ3hGLE9BQU8sRUFDTCxTQUFTLEVBQ1QsS0FBSyxFQUNMLFNBQVMsRUFHVCxRQUFRLEVBQ1IsU0FBUyxFQUNULHVCQUF1QixFQUN2QixpQkFBaUIsRUFDakIsTUFBTSxHQUNQLE1BQU0sZUFBZSxDQUFDO0FBRXZCLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxhQUFhLENBQUM7QUFFekM7Ozs7O0dBS0c7QUEyQkgsTUFBTSxPQUFPLGtCQUFrQjtJQWlCN0IsWUFDMEMsTUFBbUIsRUFDZCxTQUEwQjtRQUQvQixXQUFNLEdBQU4sTUFBTSxDQUFhO1FBQ2QsY0FBUyxHQUFULFNBQVMsQ0FBaUI7SUFDdEUsQ0FBQztJQW5CSixnRUFBZ0U7SUFDaEUsSUFDSSxJQUFJO1FBQ04sT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDO0lBQ3BCLENBQUM7SUFDRCxJQUFJLElBQUksQ0FBQyxJQUFZO1FBQ25CLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1FBRWxCLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO0lBQzVCLENBQUM7SUFZRCxRQUFRO1FBQ04sSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLElBQUksU0FBUyxFQUFFLEVBQUU7WUFDbEMsTUFBTSxLQUFLLENBQUMsd0RBQXdELENBQUMsQ0FBQztTQUN2RTtRQUVELElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBRTFCLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNmLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7WUFDbEMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztZQUM5QyxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7U0FDM0M7YUFBTTtZQUNMLElBQUksU0FBUyxFQUFFLEVBQUU7Z0JBQ2YsTUFBTSxLQUFLLENBQUMsMENBQTBDLENBQUMsQ0FBQzthQUN6RDtTQUNGO0lBQ0gsQ0FBQztJQUVELFdBQVc7UUFDVCxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDZixJQUFJLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7U0FDOUM7SUFDSCxDQUFDO0lBRU8sa0JBQWtCO1FBQ3hCLElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRTtZQUNuQixJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1NBQ25DO0lBQ0gsQ0FBQzs7O1lBNUVGLFNBQVMsU0FBQztnQkFDVCxRQUFRLEVBQUUsc0JBQXNCO2dCQUNoQyxRQUFRLEVBQUU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBb0JUO2dCQUNELGVBQWUsRUFBRSx1QkFBdUIsQ0FBQyxNQUFNO2dCQUMvQyxhQUFhLEVBQUUsaUJBQWlCLENBQUMsSUFBSTthQUN0Qzs7O1lBL0NtRCxRQUFRLHVCQWtFckQsUUFBUSxZQUFJLE1BQU0sU0FBQyxRQUFRO1lBcEQxQixZQUFZLHVCQXFEYixRQUFRLFlBQUksTUFBTSxTQUFDLFlBQVk7OzttQkFqQm5DLEtBQUssU0FBQyx3QkFBd0I7eUJBVzlCLFNBQVMsU0FBQyxZQUFZLEVBQUUsRUFBQyxNQUFNLEVBQUUsSUFBSSxFQUFDO29CQUN0QyxTQUFTLFNBQUMsVUFBVSxFQUFFLEVBQUMsTUFBTSxFQUFFLElBQUksRUFBQzswQkFDcEMsU0FBUyxTQUFDLGdCQUFnQixFQUFFLEVBQUMsTUFBTSxFQUFFLElBQUksRUFBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0Nka0NlbGxEZWYsIENka0NvbHVtbkRlZiwgQ2RrSGVhZGVyQ2VsbERlZiwgQ2RrVGFibGV9IGZyb20gJ0Bhbmd1bGFyL2Nkay90YWJsZSc7XG5pbXBvcnQge1xuICBDb21wb25lbnQsXG4gIElucHV0LFxuICBpc0Rldk1vZGUsXG4gIE9uRGVzdHJveSxcbiAgT25Jbml0LFxuICBPcHRpb25hbCxcbiAgVmlld0NoaWxkLFxuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgVmlld0VuY2Fwc3VsYXRpb24sXG4gIEluamVjdCxcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7Q2RrU2VsZWN0aW9ufSBmcm9tICcuL3NlbGVjdGlvbic7XG5cbi8qKlxuICogQ29sdW1uIHRoYXQgYWRkcyByb3cgc2VsZWN0aW5nIGNoZWNrYm94ZXMgYW5kIGEgc2VsZWN0LWFsbCBjaGVja2JveCBpZiBgY2RrU2VsZWN0aW9uTXVsdGlwbGVgIGlzXG4gKiBgdHJ1ZWAuXG4gKlxuICogTXVzdCBiZSB1c2VkIHdpdGhpbiBhIHBhcmVudCBgQ2RrU2VsZWN0aW9uYCBkaXJlY3RpdmUuXG4gKi9cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2Nkay1zZWxlY3Rpb24tY29sdW1uJyxcbiAgdGVtcGxhdGU6IGBcbiAgICA8bmctY29udGFpbmVyIGNka0NvbHVtbkRlZj5cbiAgICAgIDx0aCBjZGtIZWFkZXJDZWxsICpjZGtIZWFkZXJDZWxsRGVmPlxuICAgICAgICA8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgKm5nSWY9XCJzZWxlY3Rpb24ubXVsdGlwbGVcIlxuICAgICAgICAgICAgY2RrU2VsZWN0QWxsXG4gICAgICAgICAgICAjYWxsVG9nZ2xlcj1cImNka1NlbGVjdEFsbFwiXG4gICAgICAgICAgICBbY2hlY2tlZF09XCJhbGxUb2dnbGVyLmNoZWNrZWQgfCBhc3luY1wiXG4gICAgICAgICAgICBbaW5kZXRlcm1pbmF0ZV09XCJhbGxUb2dnbGVyLmluZGV0ZXJtaW5hdGUgfCBhc3luY1wiXG4gICAgICAgICAgICAoY2xpY2spPVwiYWxsVG9nZ2xlci50b2dnbGUoJGV2ZW50KVwiPlxuICAgICAgPC90aD5cbiAgICAgIDx0ZCBjZGtDZWxsICpjZGtDZWxsRGVmPVwibGV0IHJvdzsgbGV0IGkgPSAkaW5kZXhcIj5cbiAgICAgICAgPGlucHV0IHR5cGU9XCJjaGVja2JveFwiXG4gICAgICAgICAgICAjdG9nZ2xlcj1cImNka1NlbGVjdGlvblRvZ2dsZVwiXG4gICAgICAgICAgICBjZGtTZWxlY3Rpb25Ub2dnbGVcbiAgICAgICAgICAgIFtjZGtTZWxlY3Rpb25Ub2dnbGVWYWx1ZV09XCJyb3dcIlxuICAgICAgICAgICAgW2Nka1NlbGVjdGlvblRvZ2dsZUluZGV4XT1cImlcIlxuICAgICAgICAgICAgKGNsaWNrKT1cInRvZ2dsZXIudG9nZ2xlKClcIlxuICAgICAgICAgICAgW2NoZWNrZWRdPVwidG9nZ2xlci5jaGVja2VkIHwgYXN5bmNcIj5cbiAgICAgIDwvdGQ+XG4gICAgPC9uZy1jb250YWluZXI+XG4gIGAsXG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoLFxuICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lLFxufSlcbmV4cG9ydCBjbGFzcyBDZGtTZWxlY3Rpb25Db2x1bW48VD4gaW1wbGVtZW50cyBPbkluaXQsIE9uRGVzdHJveSB7XG4gIC8qKiBDb2x1bW4gbmFtZSB0aGF0IHNob3VsZCBiZSB1c2VkIHRvIHJlZmVyZW5jZSB0aGlzIGNvbHVtbi4gKi9cbiAgQElucHV0KCdjZGtTZWxlY3Rpb25Db2x1bW5OYW1lJylcbiAgZ2V0IG5hbWUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fbmFtZTtcbiAgfVxuICBzZXQgbmFtZShuYW1lOiBzdHJpbmcpIHtcbiAgICB0aGlzLl9uYW1lID0gbmFtZTtcblxuICAgIHRoaXMuX3N5bmNDb2x1bW5EZWZOYW1lKCk7XG4gIH1cbiAgcHJpdmF0ZSBfbmFtZTogc3RyaW5nO1xuXG4gIEBWaWV3Q2hpbGQoQ2RrQ29sdW1uRGVmLCB7c3RhdGljOiB0cnVlfSkgcHJpdmF0ZSByZWFkb25seSBfY29sdW1uRGVmOiBDZGtDb2x1bW5EZWY7XG4gIEBWaWV3Q2hpbGQoQ2RrQ2VsbERlZiwge3N0YXRpYzogdHJ1ZX0pIHByaXZhdGUgcmVhZG9ubHkgX2NlbGw6IENka0NlbGxEZWY7XG4gIEBWaWV3Q2hpbGQoQ2RrSGVhZGVyQ2VsbERlZiwge3N0YXRpYzogdHJ1ZX0pIHByaXZhdGUgcmVhZG9ubHkgX2hlYWRlckNlbGw6IENka0hlYWRlckNlbGxEZWY7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBAT3B0aW9uYWwoKSBASW5qZWN0KENka1RhYmxlKSBwcml2YXRlIF90YWJsZTogQ2RrVGFibGU8VD4sXG4gICAgICBAT3B0aW9uYWwoKSBASW5qZWN0KENka1NlbGVjdGlvbikgcmVhZG9ubHkgc2VsZWN0aW9uOiBDZGtTZWxlY3Rpb248VD4sXG4gICkge31cblxuICBuZ09uSW5pdCgpIHtcbiAgICBpZiAoIXRoaXMuc2VsZWN0aW9uICYmIGlzRGV2TW9kZSgpKSB7XG4gICAgICB0aHJvdyBFcnJvcignQ2RrU2VsZWN0aW9uQ29sdW1uOiBtaXNzaW5nIENka1NlbGVjdGlvbiBpbiB0aGUgcGFyZW50Jyk7XG4gICAgfVxuXG4gICAgdGhpcy5fc3luY0NvbHVtbkRlZk5hbWUoKTtcblxuICAgIGlmICh0aGlzLl90YWJsZSkge1xuICAgICAgdGhpcy5fY29sdW1uRGVmLmNlbGwgPSB0aGlzLl9jZWxsO1xuICAgICAgdGhpcy5fY29sdW1uRGVmLmhlYWRlckNlbGwgPSB0aGlzLl9oZWFkZXJDZWxsO1xuICAgICAgdGhpcy5fdGFibGUuYWRkQ29sdW1uRGVmKHRoaXMuX2NvbHVtbkRlZik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChpc0Rldk1vZGUoKSkge1xuICAgICAgICB0aHJvdyBFcnJvcignQ2RrU2VsZWN0aW9uQ29sdW1uOiBtaXNzaW5nIHBhcmVudCB0YWJsZScpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIGlmICh0aGlzLl90YWJsZSkge1xuICAgICAgdGhpcy5fdGFibGUucmVtb3ZlQ29sdW1uRGVmKHRoaXMuX2NvbHVtbkRlZik7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfc3luY0NvbHVtbkRlZk5hbWUoKSB7XG4gICAgaWYgKHRoaXMuX2NvbHVtbkRlZikge1xuICAgICAgdGhpcy5fY29sdW1uRGVmLm5hbWUgPSB0aGlzLl9uYW1lO1xuICAgIH1cbiAgfVxufVxuIl19