/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { CdkTableModule } from '@angular/cdk/table';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CdkRowSelection } from './row-selection';
import { CdkSelectAll } from './select-all';
import { CdkSelection } from './selection';
import { CdkSelectionColumn } from './selection-column';
import { CdkSelectionToggle } from './selection-toggle';
import * as i0 from "@angular/core";
class CdkSelectionModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.0.0-rc.2", ngImport: i0, type: CdkSelectionModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "16.0.0-rc.2", ngImport: i0, type: CdkSelectionModule, declarations: [CdkSelection,
            CdkSelectionToggle,
            CdkSelectAll,
            CdkSelectionColumn,
            CdkRowSelection], imports: [CommonModule, CdkTableModule], exports: [CdkSelection, CdkSelectionToggle, CdkSelectAll, CdkSelectionColumn, CdkRowSelection] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "16.0.0-rc.2", ngImport: i0, type: CdkSelectionModule, imports: [CommonModule, CdkTableModule] }); }
}
export { CdkSelectionModule };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.0.0-rc.2", ngImport: i0, type: CdkSelectionModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [CommonModule, CdkTableModule],
                    exports: [CdkSelection, CdkSelectionToggle, CdkSelectAll, CdkSelectionColumn, CdkRowSelection],
                    declarations: [
                        CdkSelection,
                        CdkSelectionToggle,
                        CdkSelectAll,
                        CdkSelectionColumn,
                        CdkRowSelection,
                    ],
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VsZWN0aW9uLW1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL3NlbGVjdGlvbi9zZWxlY3Rpb24tbW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxvQkFBb0IsQ0FBQztBQUNsRCxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDN0MsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUV2QyxPQUFPLEVBQUMsZUFBZSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDaEQsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGNBQWMsQ0FBQztBQUMxQyxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sYUFBYSxDQUFDO0FBQ3pDLE9BQU8sRUFBQyxrQkFBa0IsRUFBQyxNQUFNLG9CQUFvQixDQUFDO0FBQ3RELE9BQU8sRUFBQyxrQkFBa0IsRUFBQyxNQUFNLG9CQUFvQixDQUFDOztBQUV0RCxNQVdhLGtCQUFrQjttSEFBbEIsa0JBQWtCO29IQUFsQixrQkFBa0IsaUJBUDNCLFlBQVk7WUFDWixrQkFBa0I7WUFDbEIsWUFBWTtZQUNaLGtCQUFrQjtZQUNsQixlQUFlLGFBUFAsWUFBWSxFQUFFLGNBQWMsYUFDNUIsWUFBWSxFQUFFLGtCQUFrQixFQUFFLFlBQVksRUFBRSxrQkFBa0IsRUFBRSxlQUFlO29IQVNsRixrQkFBa0IsWUFWbkIsWUFBWSxFQUFFLGNBQWM7O1NBVTNCLGtCQUFrQjtnR0FBbEIsa0JBQWtCO2tCQVg5QixRQUFRO21CQUFDO29CQUNSLE9BQU8sRUFBRSxDQUFDLFlBQVksRUFBRSxjQUFjLENBQUM7b0JBQ3ZDLE9BQU8sRUFBRSxDQUFDLFlBQVksRUFBRSxrQkFBa0IsRUFBRSxZQUFZLEVBQUUsa0JBQWtCLEVBQUUsZUFBZSxDQUFDO29CQUM5RixZQUFZLEVBQUU7d0JBQ1osWUFBWTt3QkFDWixrQkFBa0I7d0JBQ2xCLFlBQVk7d0JBQ1osa0JBQWtCO3dCQUNsQixlQUFlO3FCQUNoQjtpQkFDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0Nka1RhYmxlTW9kdWxlfSBmcm9tICdAYW5ndWxhci9jZGsvdGFibGUnO1xuaW1wb3J0IHtDb21tb25Nb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQge05nTW9kdWxlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtDZGtSb3dTZWxlY3Rpb259IGZyb20gJy4vcm93LXNlbGVjdGlvbic7XG5pbXBvcnQge0Nka1NlbGVjdEFsbH0gZnJvbSAnLi9zZWxlY3QtYWxsJztcbmltcG9ydCB7Q2RrU2VsZWN0aW9ufSBmcm9tICcuL3NlbGVjdGlvbic7XG5pbXBvcnQge0Nka1NlbGVjdGlvbkNvbHVtbn0gZnJvbSAnLi9zZWxlY3Rpb24tY29sdW1uJztcbmltcG9ydCB7Q2RrU2VsZWN0aW9uVG9nZ2xlfSBmcm9tICcuL3NlbGVjdGlvbi10b2dnbGUnO1xuXG5ATmdNb2R1bGUoe1xuICBpbXBvcnRzOiBbQ29tbW9uTW9kdWxlLCBDZGtUYWJsZU1vZHVsZV0sXG4gIGV4cG9ydHM6IFtDZGtTZWxlY3Rpb24sIENka1NlbGVjdGlvblRvZ2dsZSwgQ2RrU2VsZWN0QWxsLCBDZGtTZWxlY3Rpb25Db2x1bW4sIENka1Jvd1NlbGVjdGlvbl0sXG4gIGRlY2xhcmF0aW9uczogW1xuICAgIENka1NlbGVjdGlvbixcbiAgICBDZGtTZWxlY3Rpb25Ub2dnbGUsXG4gICAgQ2RrU2VsZWN0QWxsLFxuICAgIENka1NlbGVjdGlvbkNvbHVtbixcbiAgICBDZGtSb3dTZWxlY3Rpb24sXG4gIF0sXG59KVxuZXhwb3J0IGNsYXNzIENka1NlbGVjdGlvbk1vZHVsZSB7fVxuIl19