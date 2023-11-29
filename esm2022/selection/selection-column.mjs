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
import { AsyncPipe } from '@angular/common';
import { CdkSelectionToggle } from './selection-toggle';
import { CdkSelectAll } from './select-all';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/table";
import * as i2 from "./selection";
/**
 * Column that adds row selecting checkboxes and a select-all checkbox if `cdkSelectionMultiple` is
 * `true`.
 *
 * Must be used within a parent `CdkSelection` directive.
 */
export class CdkSelectionColumn {
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.0.4", ngImport: i0, type: CdkSelectionColumn, deps: [{ token: CdkTable, optional: true }, { token: CdkSelection, optional: true }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "17.0.4", type: CdkSelectionColumn, isStandalone: true, selector: "cdk-selection-column", inputs: { name: ["cdkSelectionColumnName", "name"] }, viewQueries: [{ propertyName: "_columnDef", first: true, predicate: CdkColumnDef, descendants: true, static: true }, { propertyName: "_cell", first: true, predicate: CdkCellDef, descendants: true, static: true }, { propertyName: "_headerCell", first: true, predicate: CdkHeaderCellDef, descendants: true, static: true }], ngImport: i0, template: `
    <ng-container cdkColumnDef>
      <th cdkHeaderCell *cdkHeaderCellDef>
        @if (selection.multiple) {
          <input type="checkbox"
              cdkSelectAll
              #allToggler="cdkSelectAll"
              [checked]="allToggler.checked | async"
              [indeterminate]="allToggler.indeterminate | async"
              (click)="allToggler.toggle($event)">
        }
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
  `, isInline: true, dependencies: [{ kind: "directive", type: CdkColumnDef, selector: "[cdkColumnDef]", inputs: ["sticky", "cdkColumnDef", "stickyEnd"] }, { kind: "directive", type: CdkHeaderCellDef, selector: "[cdkHeaderCellDef]" }, { kind: "directive", type: CdkSelectAll, selector: "[cdkSelectAll]", exportAs: ["cdkSelectAll"] }, { kind: "directive", type: CdkCellDef, selector: "[cdkCellDef]" }, { kind: "directive", type: CdkSelectionToggle, selector: "[cdkSelectionToggle]", inputs: ["cdkSelectionToggleValue", "cdkSelectionToggleIndex"], exportAs: ["cdkSelectionToggle"] }, { kind: "pipe", type: AsyncPipe, name: "async" }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.0.4", ngImport: i0, type: CdkSelectionColumn, decorators: [{
            type: Component,
            args: [{
                    selector: 'cdk-selection-column',
                    template: `
    <ng-container cdkColumnDef>
      <th cdkHeaderCell *cdkHeaderCellDef>
        @if (selection.multiple) {
          <input type="checkbox"
              cdkSelectAll
              #allToggler="cdkSelectAll"
              [checked]="allToggler.checked | async"
              [indeterminate]="allToggler.indeterminate | async"
              (click)="allToggler.toggle($event)">
        }
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
                    standalone: true,
                    imports: [
                        CdkColumnDef,
                        CdkHeaderCellDef,
                        CdkSelectAll,
                        CdkCellDef,
                        CdkSelectionToggle,
                        AsyncPipe,
                    ],
                }]
        }], ctorParameters: () => [{ type: i1.CdkTable, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [CdkTable]
                }] }, { type: i2.CdkSelection, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [CdkSelection]
                }] }], propDecorators: { name: [{
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VsZWN0aW9uLWNvbHVtbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL3NlbGVjdGlvbi9zZWxlY3Rpb24tY29sdW1uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxVQUFVLEVBQUUsWUFBWSxFQUFFLGdCQUFnQixFQUFFLFFBQVEsRUFBQyxNQUFNLG9CQUFvQixDQUFDO0FBQ3hGLE9BQU8sRUFDTCxTQUFTLEVBQ1QsS0FBSyxFQUdMLFFBQVEsRUFDUixTQUFTLEVBQ1QsdUJBQXVCLEVBQ3ZCLGlCQUFpQixFQUNqQixNQUFNLEdBQ1AsTUFBTSxlQUFlLENBQUM7QUFFdkIsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGFBQWEsQ0FBQztBQUN6QyxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDMUMsT0FBTyxFQUFDLGtCQUFrQixFQUFDLE1BQU0sb0JBQW9CLENBQUM7QUFDdEQsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGNBQWMsQ0FBQzs7OztBQUUxQzs7Ozs7R0FLRztBQXNDSCxNQUFNLE9BQU8sa0JBQWtCO0lBQzdCLGdFQUFnRTtJQUNoRSxJQUNJLElBQUk7UUFDTixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUM7SUFDcEIsQ0FBQztJQUNELElBQUksSUFBSSxDQUFDLElBQVk7UUFDbkIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7UUFFbEIsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7SUFDNUIsQ0FBQztJQU9ELFlBQ3dDLE1BQW1CLEVBQ2QsU0FBMEI7UUFEL0IsV0FBTSxHQUFOLE1BQU0sQ0FBYTtRQUNkLGNBQVMsR0FBVCxTQUFTLENBQWlCO0lBQ3BFLENBQUM7SUFFSixRQUFRO1FBQ04sSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLElBQUksQ0FBQyxPQUFPLFNBQVMsS0FBSyxXQUFXLElBQUksU0FBUyxDQUFDLEVBQUU7WUFDdEUsTUFBTSxLQUFLLENBQUMsd0RBQXdELENBQUMsQ0FBQztTQUN2RTtRQUVELElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBRTFCLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNmLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7WUFDbEMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztZQUM5QyxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7U0FDM0M7YUFBTSxJQUFJLE9BQU8sU0FBUyxLQUFLLFdBQVcsSUFBSSxTQUFTLEVBQUU7WUFDeEQsTUFBTSxLQUFLLENBQUMsMENBQTBDLENBQUMsQ0FBQztTQUN6RDtJQUNILENBQUM7SUFFRCxXQUFXO1FBQ1QsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ2YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1NBQzlDO0lBQ0gsQ0FBQztJQUVPLGtCQUFrQjtRQUN4QixJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUU7WUFDbkIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztTQUNuQztJQUNILENBQUM7OEdBaERVLGtCQUFrQixrQkFrQlAsUUFBUSw2QkFDUixZQUFZO2tHQW5CdkIsa0JBQWtCLGtMQWFsQixZQUFZLHNGQUNaLFVBQVUsNEZBQ1YsZ0JBQWdCLDhEQWxEakI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FzQlQsNERBS0MsWUFBWSw0R0FDWixnQkFBZ0IsK0RBQ2hCLFlBQVksdUZBQ1osVUFBVSx5REFDVixrQkFBa0IsOEpBQ2xCLFNBQVM7OzJGQUdBLGtCQUFrQjtrQkFyQzlCLFNBQVM7bUJBQUM7b0JBQ1QsUUFBUSxFQUFFLHNCQUFzQjtvQkFDaEMsUUFBUSxFQUFFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBc0JUO29CQUNELGVBQWUsRUFBRSx1QkFBdUIsQ0FBQyxNQUFNO29CQUMvQyxhQUFhLEVBQUUsaUJBQWlCLENBQUMsSUFBSTtvQkFDckMsVUFBVSxFQUFFLElBQUk7b0JBQ2hCLE9BQU8sRUFBRTt3QkFDUCxZQUFZO3dCQUNaLGdCQUFnQjt3QkFDaEIsWUFBWTt3QkFDWixVQUFVO3dCQUNWLGtCQUFrQjt3QkFDbEIsU0FBUztxQkFDVjtpQkFDRjs7MEJBbUJJLFFBQVE7OzBCQUFJLE1BQU07MkJBQUMsUUFBUTs7MEJBQzNCLFFBQVE7OzBCQUFJLE1BQU07MkJBQUMsWUFBWTt5Q0FoQjlCLElBQUk7c0JBRFAsS0FBSzt1QkFBQyx3QkFBd0I7Z0JBVzJCLFVBQVU7c0JBQW5FLFNBQVM7dUJBQUMsWUFBWSxFQUFFLEVBQUMsTUFBTSxFQUFFLElBQUksRUFBQztnQkFDaUIsS0FBSztzQkFBNUQsU0FBUzt1QkFBQyxVQUFVLEVBQUUsRUFBQyxNQUFNLEVBQUUsSUFBSSxFQUFDO2dCQUN5QixXQUFXO3NCQUF4RSxTQUFTO3VCQUFDLGdCQUFnQixFQUFFLEVBQUMsTUFBTSxFQUFFLElBQUksRUFBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0Nka0NlbGxEZWYsIENka0NvbHVtbkRlZiwgQ2RrSGVhZGVyQ2VsbERlZiwgQ2RrVGFibGV9IGZyb20gJ0Bhbmd1bGFyL2Nkay90YWJsZSc7XG5pbXBvcnQge1xuICBDb21wb25lbnQsXG4gIElucHV0LFxuICBPbkRlc3Ryb3ksXG4gIE9uSW5pdCxcbiAgT3B0aW9uYWwsXG4gIFZpZXdDaGlsZCxcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gIFZpZXdFbmNhcHN1bGF0aW9uLFxuICBJbmplY3QsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge0Nka1NlbGVjdGlvbn0gZnJvbSAnLi9zZWxlY3Rpb24nO1xuaW1wb3J0IHtBc3luY1BpcGV9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQge0Nka1NlbGVjdGlvblRvZ2dsZX0gZnJvbSAnLi9zZWxlY3Rpb24tdG9nZ2xlJztcbmltcG9ydCB7Q2RrU2VsZWN0QWxsfSBmcm9tICcuL3NlbGVjdC1hbGwnO1xuXG4vKipcbiAqIENvbHVtbiB0aGF0IGFkZHMgcm93IHNlbGVjdGluZyBjaGVja2JveGVzIGFuZCBhIHNlbGVjdC1hbGwgY2hlY2tib3ggaWYgYGNka1NlbGVjdGlvbk11bHRpcGxlYCBpc1xuICogYHRydWVgLlxuICpcbiAqIE11c3QgYmUgdXNlZCB3aXRoaW4gYSBwYXJlbnQgYENka1NlbGVjdGlvbmAgZGlyZWN0aXZlLlxuICovXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdjZGstc2VsZWN0aW9uLWNvbHVtbicsXG4gIHRlbXBsYXRlOiBgXG4gICAgPG5nLWNvbnRhaW5lciBjZGtDb2x1bW5EZWY+XG4gICAgICA8dGggY2RrSGVhZGVyQ2VsbCAqY2RrSGVhZGVyQ2VsbERlZj5cbiAgICAgICAgQGlmIChzZWxlY3Rpb24ubXVsdGlwbGUpIHtcbiAgICAgICAgICA8aW5wdXQgdHlwZT1cImNoZWNrYm94XCJcbiAgICAgICAgICAgICAgY2RrU2VsZWN0QWxsXG4gICAgICAgICAgICAgICNhbGxUb2dnbGVyPVwiY2RrU2VsZWN0QWxsXCJcbiAgICAgICAgICAgICAgW2NoZWNrZWRdPVwiYWxsVG9nZ2xlci5jaGVja2VkIHwgYXN5bmNcIlxuICAgICAgICAgICAgICBbaW5kZXRlcm1pbmF0ZV09XCJhbGxUb2dnbGVyLmluZGV0ZXJtaW5hdGUgfCBhc3luY1wiXG4gICAgICAgICAgICAgIChjbGljayk9XCJhbGxUb2dnbGVyLnRvZ2dsZSgkZXZlbnQpXCI+XG4gICAgICAgIH1cbiAgICAgIDwvdGg+XG4gICAgICA8dGQgY2RrQ2VsbCAqY2RrQ2VsbERlZj1cImxldCByb3c7IGxldCBpID0gJGluZGV4XCI+XG4gICAgICAgIDxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIlxuICAgICAgICAgICAgI3RvZ2dsZXI9XCJjZGtTZWxlY3Rpb25Ub2dnbGVcIlxuICAgICAgICAgICAgY2RrU2VsZWN0aW9uVG9nZ2xlXG4gICAgICAgICAgICBbY2RrU2VsZWN0aW9uVG9nZ2xlVmFsdWVdPVwicm93XCJcbiAgICAgICAgICAgIFtjZGtTZWxlY3Rpb25Ub2dnbGVJbmRleF09XCJpXCJcbiAgICAgICAgICAgIChjbGljayk9XCJ0b2dnbGVyLnRvZ2dsZSgpXCJcbiAgICAgICAgICAgIFtjaGVja2VkXT1cInRvZ2dsZXIuY2hlY2tlZCB8IGFzeW5jXCI+XG4gICAgICA8L3RkPlxuICAgIDwvbmctY29udGFpbmVyPlxuICBgLFxuICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5Lk9uUHVzaCxcbiAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZSxcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbiAgaW1wb3J0czogW1xuICAgIENka0NvbHVtbkRlZixcbiAgICBDZGtIZWFkZXJDZWxsRGVmLFxuICAgIENka1NlbGVjdEFsbCxcbiAgICBDZGtDZWxsRGVmLFxuICAgIENka1NlbGVjdGlvblRvZ2dsZSxcbiAgICBBc3luY1BpcGUsXG4gIF0sXG59KVxuZXhwb3J0IGNsYXNzIENka1NlbGVjdGlvbkNvbHVtbjxUPiBpbXBsZW1lbnRzIE9uSW5pdCwgT25EZXN0cm95IHtcbiAgLyoqIENvbHVtbiBuYW1lIHRoYXQgc2hvdWxkIGJlIHVzZWQgdG8gcmVmZXJlbmNlIHRoaXMgY29sdW1uLiAqL1xuICBASW5wdXQoJ2Nka1NlbGVjdGlvbkNvbHVtbk5hbWUnKVxuICBnZXQgbmFtZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9uYW1lO1xuICB9XG4gIHNldCBuYW1lKG5hbWU6IHN0cmluZykge1xuICAgIHRoaXMuX25hbWUgPSBuYW1lO1xuXG4gICAgdGhpcy5fc3luY0NvbHVtbkRlZk5hbWUoKTtcbiAgfVxuICBwcml2YXRlIF9uYW1lOiBzdHJpbmc7XG5cbiAgQFZpZXdDaGlsZChDZGtDb2x1bW5EZWYsIHtzdGF0aWM6IHRydWV9KSBwcml2YXRlIHJlYWRvbmx5IF9jb2x1bW5EZWY6IENka0NvbHVtbkRlZjtcbiAgQFZpZXdDaGlsZChDZGtDZWxsRGVmLCB7c3RhdGljOiB0cnVlfSkgcHJpdmF0ZSByZWFkb25seSBfY2VsbDogQ2RrQ2VsbERlZjtcbiAgQFZpZXdDaGlsZChDZGtIZWFkZXJDZWxsRGVmLCB7c3RhdGljOiB0cnVlfSkgcHJpdmF0ZSByZWFkb25seSBfaGVhZGVyQ2VsbDogQ2RrSGVhZGVyQ2VsbERlZjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBAT3B0aW9uYWwoKSBASW5qZWN0KENka1RhYmxlKSBwcml2YXRlIF90YWJsZTogQ2RrVGFibGU8VD4sXG4gICAgQE9wdGlvbmFsKCkgQEluamVjdChDZGtTZWxlY3Rpb24pIHJlYWRvbmx5IHNlbGVjdGlvbjogQ2RrU2VsZWN0aW9uPFQ+LFxuICApIHt9XG5cbiAgbmdPbkluaXQoKSB7XG4gICAgaWYgKCF0aGlzLnNlbGVjdGlvbiAmJiAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSkge1xuICAgICAgdGhyb3cgRXJyb3IoJ0Nka1NlbGVjdGlvbkNvbHVtbjogbWlzc2luZyBDZGtTZWxlY3Rpb24gaW4gdGhlIHBhcmVudCcpO1xuICAgIH1cblxuICAgIHRoaXMuX3N5bmNDb2x1bW5EZWZOYW1lKCk7XG5cbiAgICBpZiAodGhpcy5fdGFibGUpIHtcbiAgICAgIHRoaXMuX2NvbHVtbkRlZi5jZWxsID0gdGhpcy5fY2VsbDtcbiAgICAgIHRoaXMuX2NvbHVtbkRlZi5oZWFkZXJDZWxsID0gdGhpcy5faGVhZGVyQ2VsbDtcbiAgICAgIHRoaXMuX3RhYmxlLmFkZENvbHVtbkRlZih0aGlzLl9jb2x1bW5EZWYpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSB7XG4gICAgICB0aHJvdyBFcnJvcignQ2RrU2VsZWN0aW9uQ29sdW1uOiBtaXNzaW5nIHBhcmVudCB0YWJsZScpO1xuICAgIH1cbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIGlmICh0aGlzLl90YWJsZSkge1xuICAgICAgdGhpcy5fdGFibGUucmVtb3ZlQ29sdW1uRGVmKHRoaXMuX2NvbHVtbkRlZik7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfc3luY0NvbHVtbkRlZk5hbWUoKSB7XG4gICAgaWYgKHRoaXMuX2NvbHVtbkRlZikge1xuICAgICAgdGhpcy5fY29sdW1uRGVmLm5hbWUgPSB0aGlzLl9uYW1lO1xuICAgIH1cbiAgfVxufVxuIl19