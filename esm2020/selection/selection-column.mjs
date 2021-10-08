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
import * as i1 from "@angular/cdk/table";
import * as i2 from "@angular/common";
import * as i3 from "./select-all";
import * as i4 from "./selection-toggle";
import * as i5 from "./selection";
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
        if (!this.selection && (typeof ngDevMode === 'undefined' || ngDevMode)) {
            throw Error('CdkSelectionColumn: missing CdkSelection in the parent');
        }
        this._syncColumnDefName();
        if (this._table) {
            this._columnDef.cell = this._cell;
            this._columnDef.headerCell = this._headerCell;
            this._table.addColumnDef(this._columnDef);
        }
        else if ((typeof ngDevMode === 'undefined' || ngDevMode)) {
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
}
CdkSelectionColumn.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.0-next.15", ngImport: i0, type: CdkSelectionColumn, deps: [{ token: CdkTable, optional: true }, { token: CdkSelection, optional: true }], target: i0.ɵɵFactoryTarget.Component });
CdkSelectionColumn.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "12.0.0", version: "13.0.0-next.15", type: CdkSelectionColumn, selector: "cdk-selection-column", inputs: { name: ["cdkSelectionColumnName", "name"] }, viewQueries: [{ propertyName: "_columnDef", first: true, predicate: CdkColumnDef, descendants: true, static: true }, { propertyName: "_cell", first: true, predicate: CdkCellDef, descendants: true, static: true }, { propertyName: "_headerCell", first: true, predicate: CdkHeaderCellDef, descendants: true, static: true }], ngImport: i0, template: `
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
  `, isInline: true, directives: [{ type: i1.CdkColumnDef, selector: "[cdkColumnDef]", inputs: ["sticky", "cdkColumnDef", "stickyEnd"] }, { type: i1.CdkHeaderCellDef, selector: "[cdkHeaderCellDef]" }, { type: i2.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { type: i3.CdkSelectAll, selector: "[cdkSelectAll]", exportAs: ["cdkSelectAll"] }, { type: i1.CdkCellDef, selector: "[cdkCellDef]" }, { type: i4.CdkSelectionToggle, selector: "[cdkSelectionToggle]", inputs: ["cdkSelectionToggleValue", "cdkSelectionToggleIndex"], exportAs: ["cdkSelectionToggle"] }], pipes: { "async": i2.AsyncPipe }, changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.0-next.15", ngImport: i0, type: CdkSelectionColumn, decorators: [{
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
        }], ctorParameters: function () { return [{ type: i1.CdkTable, decorators: [{
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VsZWN0aW9uLWNvbHVtbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL3NlbGVjdGlvbi9zZWxlY3Rpb24tY29sdW1uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxVQUFVLEVBQUUsWUFBWSxFQUFFLGdCQUFnQixFQUFFLFFBQVEsRUFBQyxNQUFNLG9CQUFvQixDQUFDO0FBQ3hGLE9BQU8sRUFDTCxTQUFTLEVBQ1QsS0FBSyxFQUdMLFFBQVEsRUFDUixTQUFTLEVBQ1QsdUJBQXVCLEVBQ3ZCLGlCQUFpQixFQUNqQixNQUFNLEdBQ1AsTUFBTSxlQUFlLENBQUM7QUFFdkIsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGFBQWEsQ0FBQzs7Ozs7OztBQUV6Qzs7Ozs7R0FLRztBQTJCSCxNQUFNLE9BQU8sa0JBQWtCO0lBaUI3QixZQUMwQyxNQUFtQixFQUNkLFNBQTBCO1FBRC9CLFdBQU0sR0FBTixNQUFNLENBQWE7UUFDZCxjQUFTLEdBQVQsU0FBUyxDQUFpQjtJQUN0RSxDQUFDO0lBbkJKLGdFQUFnRTtJQUNoRSxJQUNJLElBQUk7UUFDTixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUM7SUFDcEIsQ0FBQztJQUNELElBQUksSUFBSSxDQUFDLElBQVk7UUFDbkIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7UUFFbEIsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7SUFDNUIsQ0FBQztJQVlELFFBQVE7UUFDTixJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsSUFBSSxDQUFDLE9BQU8sU0FBUyxLQUFLLFdBQVcsSUFBSSxTQUFTLENBQUMsRUFBRTtZQUN0RSxNQUFNLEtBQUssQ0FBQyx3REFBd0QsQ0FBQyxDQUFDO1NBQ3ZFO1FBRUQsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFFMUIsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ2YsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztZQUNsQyxJQUFJLENBQUMsVUFBVSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO1lBQzlDLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztTQUMzQzthQUFNLElBQUksQ0FBQyxPQUFPLFNBQVMsS0FBSyxXQUFXLElBQUksU0FBUyxDQUFDLEVBQUU7WUFDMUQsTUFBTSxLQUFLLENBQUMsMENBQTBDLENBQUMsQ0FBQztTQUN6RDtJQUNILENBQUM7SUFFRCxXQUFXO1FBQ1QsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ2YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1NBQzlDO0lBQ0gsQ0FBQztJQUVPLGtCQUFrQjtRQUN4QixJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUU7WUFDbkIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztTQUNuQztJQUNILENBQUM7O3VIQWhEVSxrQkFBa0Isa0JBa0JMLFFBQVEsNkJBQ1IsWUFBWTsyR0FuQnpCLGtCQUFrQiw4SkFhbEIsWUFBWSxzRkFDWixVQUFVLDRGQUNWLGdCQUFnQiw4REF2Q2pCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQW9CVDttR0FJVSxrQkFBa0I7a0JBMUI5QixTQUFTO21CQUFDO29CQUNULFFBQVEsRUFBRSxzQkFBc0I7b0JBQ2hDLFFBQVEsRUFBRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FvQlQ7b0JBQ0QsZUFBZSxFQUFFLHVCQUF1QixDQUFDLE1BQU07b0JBQy9DLGFBQWEsRUFBRSxpQkFBaUIsQ0FBQyxJQUFJO2lCQUN0Qzs7MEJBbUJNLFFBQVE7OzBCQUFJLE1BQU07MkJBQUMsUUFBUTs7MEJBQzNCLFFBQVE7OzBCQUFJLE1BQU07MkJBQUMsWUFBWTs0Q0FoQmhDLElBQUk7c0JBRFAsS0FBSzt1QkFBQyx3QkFBd0I7Z0JBVzJCLFVBQVU7c0JBQW5FLFNBQVM7dUJBQUMsWUFBWSxFQUFFLEVBQUMsTUFBTSxFQUFFLElBQUksRUFBQztnQkFDaUIsS0FBSztzQkFBNUQsU0FBUzt1QkFBQyxVQUFVLEVBQUUsRUFBQyxNQUFNLEVBQUUsSUFBSSxFQUFDO2dCQUN5QixXQUFXO3NCQUF4RSxTQUFTO3VCQUFDLGdCQUFnQixFQUFFLEVBQUMsTUFBTSxFQUFFLElBQUksRUFBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0Nka0NlbGxEZWYsIENka0NvbHVtbkRlZiwgQ2RrSGVhZGVyQ2VsbERlZiwgQ2RrVGFibGV9IGZyb20gJ0Bhbmd1bGFyL2Nkay90YWJsZSc7XG5pbXBvcnQge1xuICBDb21wb25lbnQsXG4gIElucHV0LFxuICBPbkRlc3Ryb3ksXG4gIE9uSW5pdCxcbiAgT3B0aW9uYWwsXG4gIFZpZXdDaGlsZCxcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gIFZpZXdFbmNhcHN1bGF0aW9uLFxuICBJbmplY3QsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge0Nka1NlbGVjdGlvbn0gZnJvbSAnLi9zZWxlY3Rpb24nO1xuXG4vKipcbiAqIENvbHVtbiB0aGF0IGFkZHMgcm93IHNlbGVjdGluZyBjaGVja2JveGVzIGFuZCBhIHNlbGVjdC1hbGwgY2hlY2tib3ggaWYgYGNka1NlbGVjdGlvbk11bHRpcGxlYCBpc1xuICogYHRydWVgLlxuICpcbiAqIE11c3QgYmUgdXNlZCB3aXRoaW4gYSBwYXJlbnQgYENka1NlbGVjdGlvbmAgZGlyZWN0aXZlLlxuICovXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdjZGstc2VsZWN0aW9uLWNvbHVtbicsXG4gIHRlbXBsYXRlOiBgXG4gICAgPG5nLWNvbnRhaW5lciBjZGtDb2x1bW5EZWY+XG4gICAgICA8dGggY2RrSGVhZGVyQ2VsbCAqY2RrSGVhZGVyQ2VsbERlZj5cbiAgICAgICAgPGlucHV0IHR5cGU9XCJjaGVja2JveFwiICpuZ0lmPVwic2VsZWN0aW9uLm11bHRpcGxlXCJcbiAgICAgICAgICAgIGNka1NlbGVjdEFsbFxuICAgICAgICAgICAgI2FsbFRvZ2dsZXI9XCJjZGtTZWxlY3RBbGxcIlxuICAgICAgICAgICAgW2NoZWNrZWRdPVwiYWxsVG9nZ2xlci5jaGVja2VkIHwgYXN5bmNcIlxuICAgICAgICAgICAgW2luZGV0ZXJtaW5hdGVdPVwiYWxsVG9nZ2xlci5pbmRldGVybWluYXRlIHwgYXN5bmNcIlxuICAgICAgICAgICAgKGNsaWNrKT1cImFsbFRvZ2dsZXIudG9nZ2xlKCRldmVudClcIj5cbiAgICAgIDwvdGg+XG4gICAgICA8dGQgY2RrQ2VsbCAqY2RrQ2VsbERlZj1cImxldCByb3c7IGxldCBpID0gJGluZGV4XCI+XG4gICAgICAgIDxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIlxuICAgICAgICAgICAgI3RvZ2dsZXI9XCJjZGtTZWxlY3Rpb25Ub2dnbGVcIlxuICAgICAgICAgICAgY2RrU2VsZWN0aW9uVG9nZ2xlXG4gICAgICAgICAgICBbY2RrU2VsZWN0aW9uVG9nZ2xlVmFsdWVdPVwicm93XCJcbiAgICAgICAgICAgIFtjZGtTZWxlY3Rpb25Ub2dnbGVJbmRleF09XCJpXCJcbiAgICAgICAgICAgIChjbGljayk9XCJ0b2dnbGVyLnRvZ2dsZSgpXCJcbiAgICAgICAgICAgIFtjaGVja2VkXT1cInRvZ2dsZXIuY2hlY2tlZCB8IGFzeW5jXCI+XG4gICAgICA8L3RkPlxuICAgIDwvbmctY29udGFpbmVyPlxuICBgLFxuICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5Lk9uUHVzaCxcbiAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZSxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrU2VsZWN0aW9uQ29sdW1uPFQ+IGltcGxlbWVudHMgT25Jbml0LCBPbkRlc3Ryb3kge1xuICAvKiogQ29sdW1uIG5hbWUgdGhhdCBzaG91bGQgYmUgdXNlZCB0byByZWZlcmVuY2UgdGhpcyBjb2x1bW4uICovXG4gIEBJbnB1dCgnY2RrU2VsZWN0aW9uQ29sdW1uTmFtZScpXG4gIGdldCBuYW1lKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX25hbWU7XG4gIH1cbiAgc2V0IG5hbWUobmFtZTogc3RyaW5nKSB7XG4gICAgdGhpcy5fbmFtZSA9IG5hbWU7XG5cbiAgICB0aGlzLl9zeW5jQ29sdW1uRGVmTmFtZSgpO1xuICB9XG4gIHByaXZhdGUgX25hbWU6IHN0cmluZztcblxuICBAVmlld0NoaWxkKENka0NvbHVtbkRlZiwge3N0YXRpYzogdHJ1ZX0pIHByaXZhdGUgcmVhZG9ubHkgX2NvbHVtbkRlZjogQ2RrQ29sdW1uRGVmO1xuICBAVmlld0NoaWxkKENka0NlbGxEZWYsIHtzdGF0aWM6IHRydWV9KSBwcml2YXRlIHJlYWRvbmx5IF9jZWxsOiBDZGtDZWxsRGVmO1xuICBAVmlld0NoaWxkKENka0hlYWRlckNlbGxEZWYsIHtzdGF0aWM6IHRydWV9KSBwcml2YXRlIHJlYWRvbmx5IF9oZWFkZXJDZWxsOiBDZGtIZWFkZXJDZWxsRGVmO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgQE9wdGlvbmFsKCkgQEluamVjdChDZGtUYWJsZSkgcHJpdmF0ZSBfdGFibGU6IENka1RhYmxlPFQ+LFxuICAgICAgQE9wdGlvbmFsKCkgQEluamVjdChDZGtTZWxlY3Rpb24pIHJlYWRvbmx5IHNlbGVjdGlvbjogQ2RrU2VsZWN0aW9uPFQ+LFxuICApIHt9XG5cbiAgbmdPbkluaXQoKSB7XG4gICAgaWYgKCF0aGlzLnNlbGVjdGlvbiAmJiAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSkge1xuICAgICAgdGhyb3cgRXJyb3IoJ0Nka1NlbGVjdGlvbkNvbHVtbjogbWlzc2luZyBDZGtTZWxlY3Rpb24gaW4gdGhlIHBhcmVudCcpO1xuICAgIH1cblxuICAgIHRoaXMuX3N5bmNDb2x1bW5EZWZOYW1lKCk7XG5cbiAgICBpZiAodGhpcy5fdGFibGUpIHtcbiAgICAgIHRoaXMuX2NvbHVtbkRlZi5jZWxsID0gdGhpcy5fY2VsbDtcbiAgICAgIHRoaXMuX2NvbHVtbkRlZi5oZWFkZXJDZWxsID0gdGhpcy5faGVhZGVyQ2VsbDtcbiAgICAgIHRoaXMuX3RhYmxlLmFkZENvbHVtbkRlZih0aGlzLl9jb2x1bW5EZWYpO1xuICAgIH0gZWxzZSBpZiAoKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkpIHtcbiAgICAgIHRocm93IEVycm9yKCdDZGtTZWxlY3Rpb25Db2x1bW46IG1pc3NpbmcgcGFyZW50IHRhYmxlJyk7XG4gICAgfVxuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgaWYgKHRoaXMuX3RhYmxlKSB7XG4gICAgICB0aGlzLl90YWJsZS5yZW1vdmVDb2x1bW5EZWYodGhpcy5fY29sdW1uRGVmKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9zeW5jQ29sdW1uRGVmTmFtZSgpIHtcbiAgICBpZiAodGhpcy5fY29sdW1uRGVmKSB7XG4gICAgICB0aGlzLl9jb2x1bW5EZWYubmFtZSA9IHRoaXMuX25hbWU7XG4gICAgfVxuICB9XG59XG4iXX0=