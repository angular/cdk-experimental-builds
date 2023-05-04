/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { CdkCellDef, CdkColumnDef, CdkHeaderCellDef, CdkTable } from '@angular/cdk/table';
import { Component, Input, Optional, ViewChild, ChangeDetectionStrategy, ViewEncapsulation, Inject, } from '@angular/core';
import { CdkSelection } from './selection';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
import * as i2 from "@angular/cdk/table";
import * as i3 from "./selection-toggle";
import * as i4 from "./select-all";
import * as i5 from "./selection";
/**
 * Column that adds row selecting checkboxes and a select-all checkbox if `cdkSelectionMultiple` is
 * `true`.
 *
 * Must be used within a parent `CdkSelection` directive.
 */
class CdkSelectionColumn {
    /** Column name that should be used to reference this column. */
    get name() {
        return this._name;
    }
    set name(name) {
        this._name = name;
        this._syncColumnDefName();
    }
    constructor(_table, selection) {
        this._table = _table;
        this.selection = selection;
    }
    ngOnInit() {
        if (!this.selection && (typeof ngDevMode === 'undefined' || ngDevMode)) {
            throw Error('CdkSelectionColumn: missing CdkSelection in the parent');
        }
        this._syncColumnDefName();
        if (this._table) {
            this._columnDef.cell = this._cell;
            this._columnDef.headerCell = this._headerCell;
            this._table.addColumnDef(this._columnDef);
        }
        else if (typeof ngDevMode === 'undefined' || ngDevMode) {
            throw Error('CdkSelectionColumn: missing parent table');
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.0.0", ngImport: i0, type: CdkSelectionColumn, deps: [{ token: CdkTable, optional: true }, { token: CdkSelection, optional: true }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "16.0.0", type: CdkSelectionColumn, selector: "cdk-selection-column", inputs: { name: ["cdkSelectionColumnName", "name"] }, viewQueries: [{ propertyName: "_columnDef", first: true, predicate: CdkColumnDef, descendants: true, static: true }, { propertyName: "_cell", first: true, predicate: CdkCellDef, descendants: true, static: true }, { propertyName: "_headerCell", first: true, predicate: CdkHeaderCellDef, descendants: true, static: true }], ngImport: i0, template: `
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
  `, isInline: true, dependencies: [{ kind: "directive", type: i1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "directive", type: i2.CdkCellDef, selector: "[cdkCellDef]" }, { kind: "directive", type: i2.CdkHeaderCellDef, selector: "[cdkHeaderCellDef]" }, { kind: "directive", type: i2.CdkColumnDef, selector: "[cdkColumnDef]", inputs: ["sticky", "cdkColumnDef", "stickyEnd"] }, { kind: "directive", type: i3.CdkSelectionToggle, selector: "[cdkSelectionToggle]", inputs: ["cdkSelectionToggleValue", "cdkSelectionToggleIndex"], exportAs: ["cdkSelectionToggle"] }, { kind: "directive", type: i4.CdkSelectAll, selector: "[cdkSelectAll]", exportAs: ["cdkSelectAll"] }, { kind: "pipe", type: i1.AsyncPipe, name: "async" }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None }); }
}
export { CdkSelectionColumn };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.0.0", ngImport: i0, type: CdkSelectionColumn, decorators: [{
            type: Component,
            args: [{
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
                    encapsulation: ViewEncapsulation.None,
                }]
        }], ctorParameters: function () { return [{ type: i2.CdkTable, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [CdkTable]
                }] }, { type: i5.CdkSelection, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [CdkSelection]
                }] }]; }, propDecorators: { name: [{
                type: Input,
                args: ['cdkSelectionColumnName']
            }], _columnDef: [{
                type: ViewChild,
                args: [CdkColumnDef, { static: true }]
            }], _cell: [{
                type: ViewChild,
                args: [CdkCellDef, { static: true }]
            }], _headerCell: [{
                type: ViewChild,
                args: [CdkHeaderCellDef, { static: true }]
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VsZWN0aW9uLWNvbHVtbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL3NlbGVjdGlvbi9zZWxlY3Rpb24tY29sdW1uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxVQUFVLEVBQUUsWUFBWSxFQUFFLGdCQUFnQixFQUFFLFFBQVEsRUFBQyxNQUFNLG9CQUFvQixDQUFDO0FBQ3hGLE9BQU8sRUFDTCxTQUFTLEVBQ1QsS0FBSyxFQUdMLFFBQVEsRUFDUixTQUFTLEVBQ1QsdUJBQXVCLEVBQ3ZCLGlCQUFpQixFQUNqQixNQUFNLEdBQ1AsTUFBTSxlQUFlLENBQUM7QUFFdkIsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGFBQWEsQ0FBQzs7Ozs7OztBQUV6Qzs7Ozs7R0FLRztBQUNILE1BMEJhLGtCQUFrQjtJQUM3QixnRUFBZ0U7SUFDaEUsSUFDSSxJQUFJO1FBQ04sT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDO0lBQ3BCLENBQUM7SUFDRCxJQUFJLElBQUksQ0FBQyxJQUFZO1FBQ25CLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1FBRWxCLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO0lBQzVCLENBQUM7SUFPRCxZQUN3QyxNQUFtQixFQUNkLFNBQTBCO1FBRC9CLFdBQU0sR0FBTixNQUFNLENBQWE7UUFDZCxjQUFTLEdBQVQsU0FBUyxDQUFpQjtJQUNwRSxDQUFDO0lBRUosUUFBUTtRQUNOLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxJQUFJLENBQUMsT0FBTyxTQUFTLEtBQUssV0FBVyxJQUFJLFNBQVMsQ0FBQyxFQUFFO1lBQ3RFLE1BQU0sS0FBSyxDQUFDLHdEQUF3RCxDQUFDLENBQUM7U0FDdkU7UUFFRCxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztRQUUxQixJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDZixJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1lBQ2xDLElBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7WUFDOUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1NBQzNDO2FBQU0sSUFBSSxPQUFPLFNBQVMsS0FBSyxXQUFXLElBQUksU0FBUyxFQUFFO1lBQ3hELE1BQU0sS0FBSyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7U0FDekQ7SUFDSCxDQUFDO0lBRUQsV0FBVztRQUNULElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNmLElBQUksQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztTQUM5QztJQUNILENBQUM7SUFFTyxrQkFBa0I7UUFDeEIsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQ25CLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7U0FDbkM7SUFDSCxDQUFDOzhHQWhEVSxrQkFBa0Isa0JBa0JQLFFBQVEsNkJBQ1IsWUFBWTtrR0FuQnZCLGtCQUFrQiw4SkFhbEIsWUFBWSxzRkFDWixVQUFVLDRGQUNWLGdCQUFnQiw4REF2Q2pCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQW9CVDs7U0FJVSxrQkFBa0I7MkZBQWxCLGtCQUFrQjtrQkExQjlCLFNBQVM7bUJBQUM7b0JBQ1QsUUFBUSxFQUFFLHNCQUFzQjtvQkFDaEMsUUFBUSxFQUFFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQW9CVDtvQkFDRCxlQUFlLEVBQUUsdUJBQXVCLENBQUMsTUFBTTtvQkFDL0MsYUFBYSxFQUFFLGlCQUFpQixDQUFDLElBQUk7aUJBQ3RDOzswQkFtQkksUUFBUTs7MEJBQUksTUFBTTsyQkFBQyxRQUFROzswQkFDM0IsUUFBUTs7MEJBQUksTUFBTTsyQkFBQyxZQUFZOzRDQWhCOUIsSUFBSTtzQkFEUCxLQUFLO3VCQUFDLHdCQUF3QjtnQkFXMkIsVUFBVTtzQkFBbkUsU0FBUzt1QkFBQyxZQUFZLEVBQUUsRUFBQyxNQUFNLEVBQUUsSUFBSSxFQUFDO2dCQUNpQixLQUFLO3NCQUE1RCxTQUFTO3VCQUFDLFVBQVUsRUFBRSxFQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUM7Z0JBQ3lCLFdBQVc7c0JBQXhFLFNBQVM7dUJBQUMsZ0JBQWdCLEVBQUUsRUFBQyxNQUFNLEVBQUUsSUFBSSxFQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Q2RrQ2VsbERlZiwgQ2RrQ29sdW1uRGVmLCBDZGtIZWFkZXJDZWxsRGVmLCBDZGtUYWJsZX0gZnJvbSAnQGFuZ3VsYXIvY2RrL3RhYmxlJztcbmltcG9ydCB7XG4gIENvbXBvbmVudCxcbiAgSW5wdXQsXG4gIE9uRGVzdHJveSxcbiAgT25Jbml0LFxuICBPcHRpb25hbCxcbiAgVmlld0NoaWxkLFxuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgVmlld0VuY2Fwc3VsYXRpb24sXG4gIEluamVjdCxcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7Q2RrU2VsZWN0aW9ufSBmcm9tICcuL3NlbGVjdGlvbic7XG5cbi8qKlxuICogQ29sdW1uIHRoYXQgYWRkcyByb3cgc2VsZWN0aW5nIGNoZWNrYm94ZXMgYW5kIGEgc2VsZWN0LWFsbCBjaGVja2JveCBpZiBgY2RrU2VsZWN0aW9uTXVsdGlwbGVgIGlzXG4gKiBgdHJ1ZWAuXG4gKlxuICogTXVzdCBiZSB1c2VkIHdpdGhpbiBhIHBhcmVudCBgQ2RrU2VsZWN0aW9uYCBkaXJlY3RpdmUuXG4gKi9cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2Nkay1zZWxlY3Rpb24tY29sdW1uJyxcbiAgdGVtcGxhdGU6IGBcbiAgICA8bmctY29udGFpbmVyIGNka0NvbHVtbkRlZj5cbiAgICAgIDx0aCBjZGtIZWFkZXJDZWxsICpjZGtIZWFkZXJDZWxsRGVmPlxuICAgICAgICA8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgKm5nSWY9XCJzZWxlY3Rpb24ubXVsdGlwbGVcIlxuICAgICAgICAgICAgY2RrU2VsZWN0QWxsXG4gICAgICAgICAgICAjYWxsVG9nZ2xlcj1cImNka1NlbGVjdEFsbFwiXG4gICAgICAgICAgICBbY2hlY2tlZF09XCJhbGxUb2dnbGVyLmNoZWNrZWQgfCBhc3luY1wiXG4gICAgICAgICAgICBbaW5kZXRlcm1pbmF0ZV09XCJhbGxUb2dnbGVyLmluZGV0ZXJtaW5hdGUgfCBhc3luY1wiXG4gICAgICAgICAgICAoY2xpY2spPVwiYWxsVG9nZ2xlci50b2dnbGUoJGV2ZW50KVwiPlxuICAgICAgPC90aD5cbiAgICAgIDx0ZCBjZGtDZWxsICpjZGtDZWxsRGVmPVwibGV0IHJvdzsgbGV0IGkgPSAkaW5kZXhcIj5cbiAgICAgICAgPGlucHV0IHR5cGU9XCJjaGVja2JveFwiXG4gICAgICAgICAgICAjdG9nZ2xlcj1cImNka1NlbGVjdGlvblRvZ2dsZVwiXG4gICAgICAgICAgICBjZGtTZWxlY3Rpb25Ub2dnbGVcbiAgICAgICAgICAgIFtjZGtTZWxlY3Rpb25Ub2dnbGVWYWx1ZV09XCJyb3dcIlxuICAgICAgICAgICAgW2Nka1NlbGVjdGlvblRvZ2dsZUluZGV4XT1cImlcIlxuICAgICAgICAgICAgKGNsaWNrKT1cInRvZ2dsZXIudG9nZ2xlKClcIlxuICAgICAgICAgICAgW2NoZWNrZWRdPVwidG9nZ2xlci5jaGVja2VkIHwgYXN5bmNcIj5cbiAgICAgIDwvdGQ+XG4gICAgPC9uZy1jb250YWluZXI+XG4gIGAsXG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoLFxuICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lLFxufSlcbmV4cG9ydCBjbGFzcyBDZGtTZWxlY3Rpb25Db2x1bW48VD4gaW1wbGVtZW50cyBPbkluaXQsIE9uRGVzdHJveSB7XG4gIC8qKiBDb2x1bW4gbmFtZSB0aGF0IHNob3VsZCBiZSB1c2VkIHRvIHJlZmVyZW5jZSB0aGlzIGNvbHVtbi4gKi9cbiAgQElucHV0KCdjZGtTZWxlY3Rpb25Db2x1bW5OYW1lJylcbiAgZ2V0IG5hbWUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fbmFtZTtcbiAgfVxuICBzZXQgbmFtZShuYW1lOiBzdHJpbmcpIHtcbiAgICB0aGlzLl9uYW1lID0gbmFtZTtcblxuICAgIHRoaXMuX3N5bmNDb2x1bW5EZWZOYW1lKCk7XG4gIH1cbiAgcHJpdmF0ZSBfbmFtZTogc3RyaW5nO1xuXG4gIEBWaWV3Q2hpbGQoQ2RrQ29sdW1uRGVmLCB7c3RhdGljOiB0cnVlfSkgcHJpdmF0ZSByZWFkb25seSBfY29sdW1uRGVmOiBDZGtDb2x1bW5EZWY7XG4gIEBWaWV3Q2hpbGQoQ2RrQ2VsbERlZiwge3N0YXRpYzogdHJ1ZX0pIHByaXZhdGUgcmVhZG9ubHkgX2NlbGw6IENka0NlbGxEZWY7XG4gIEBWaWV3Q2hpbGQoQ2RrSGVhZGVyQ2VsbERlZiwge3N0YXRpYzogdHJ1ZX0pIHByaXZhdGUgcmVhZG9ubHkgX2hlYWRlckNlbGw6IENka0hlYWRlckNlbGxEZWY7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgQE9wdGlvbmFsKCkgQEluamVjdChDZGtUYWJsZSkgcHJpdmF0ZSBfdGFibGU6IENka1RhYmxlPFQ+LFxuICAgIEBPcHRpb25hbCgpIEBJbmplY3QoQ2RrU2VsZWN0aW9uKSByZWFkb25seSBzZWxlY3Rpb246IENka1NlbGVjdGlvbjxUPixcbiAgKSB7fVxuXG4gIG5nT25Jbml0KCkge1xuICAgIGlmICghdGhpcy5zZWxlY3Rpb24gJiYgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkpIHtcbiAgICAgIHRocm93IEVycm9yKCdDZGtTZWxlY3Rpb25Db2x1bW46IG1pc3NpbmcgQ2RrU2VsZWN0aW9uIGluIHRoZSBwYXJlbnQnKTtcbiAgICB9XG5cbiAgICB0aGlzLl9zeW5jQ29sdW1uRGVmTmFtZSgpO1xuXG4gICAgaWYgKHRoaXMuX3RhYmxlKSB7XG4gICAgICB0aGlzLl9jb2x1bW5EZWYuY2VsbCA9IHRoaXMuX2NlbGw7XG4gICAgICB0aGlzLl9jb2x1bW5EZWYuaGVhZGVyQ2VsbCA9IHRoaXMuX2hlYWRlckNlbGw7XG4gICAgICB0aGlzLl90YWJsZS5hZGRDb2x1bW5EZWYodGhpcy5fY29sdW1uRGVmKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkge1xuICAgICAgdGhyb3cgRXJyb3IoJ0Nka1NlbGVjdGlvbkNvbHVtbjogbWlzc2luZyBwYXJlbnQgdGFibGUnKTtcbiAgICB9XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICBpZiAodGhpcy5fdGFibGUpIHtcbiAgICAgIHRoaXMuX3RhYmxlLnJlbW92ZUNvbHVtbkRlZih0aGlzLl9jb2x1bW5EZWYpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3N5bmNDb2x1bW5EZWZOYW1lKCkge1xuICAgIGlmICh0aGlzLl9jb2x1bW5EZWYpIHtcbiAgICAgIHRoaXMuX2NvbHVtbkRlZi5uYW1lID0gdGhpcy5fbmFtZTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==