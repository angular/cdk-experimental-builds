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
export class CdkSelectionModule {
}
CdkSelectionModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.3.0", ngImport: i0, type: CdkSelectionModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
CdkSelectionModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "13.3.0", ngImport: i0, type: CdkSelectionModule, declarations: [CdkSelection,
        CdkSelectionToggle,
        CdkSelectAll,
        CdkSelectionColumn,
        CdkRowSelection], imports: [CommonModule, CdkTableModule], exports: [CdkSelection, CdkSelectionToggle, CdkSelectAll, CdkSelectionColumn, CdkRowSelection] });
CdkSelectionModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "13.3.0", ngImport: i0, type: CdkSelectionModule, imports: [[CommonModule, CdkTableModule]] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.3.0", ngImport: i0, type: CdkSelectionModule, decorators: [{
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VsZWN0aW9uLW1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL3NlbGVjdGlvbi9zZWxlY3Rpb24tbW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxvQkFBb0IsQ0FBQztBQUNsRCxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDN0MsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUV2QyxPQUFPLEVBQUMsZUFBZSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDaEQsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGNBQWMsQ0FBQztBQUMxQyxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sYUFBYSxDQUFDO0FBQ3pDLE9BQU8sRUFBQyxrQkFBa0IsRUFBQyxNQUFNLG9CQUFvQixDQUFDO0FBQ3RELE9BQU8sRUFBQyxrQkFBa0IsRUFBQyxNQUFNLG9CQUFvQixDQUFDOztBQWF0RCxNQUFNLE9BQU8sa0JBQWtCOzsrR0FBbEIsa0JBQWtCO2dIQUFsQixrQkFBa0IsaUJBUDNCLFlBQVk7UUFDWixrQkFBa0I7UUFDbEIsWUFBWTtRQUNaLGtCQUFrQjtRQUNsQixlQUFlLGFBUFAsWUFBWSxFQUFFLGNBQWMsYUFDNUIsWUFBWSxFQUFFLGtCQUFrQixFQUFFLFlBQVksRUFBRSxrQkFBa0IsRUFBRSxlQUFlO2dIQVNsRixrQkFBa0IsWUFWcEIsQ0FBQyxZQUFZLEVBQUUsY0FBYyxDQUFDOzJGQVU1QixrQkFBa0I7a0JBWDlCLFFBQVE7bUJBQUM7b0JBQ1IsT0FBTyxFQUFFLENBQUMsWUFBWSxFQUFFLGNBQWMsQ0FBQztvQkFDdkMsT0FBTyxFQUFFLENBQUMsWUFBWSxFQUFFLGtCQUFrQixFQUFFLFlBQVksRUFBRSxrQkFBa0IsRUFBRSxlQUFlLENBQUM7b0JBQzlGLFlBQVksRUFBRTt3QkFDWixZQUFZO3dCQUNaLGtCQUFrQjt3QkFDbEIsWUFBWTt3QkFDWixrQkFBa0I7d0JBQ2xCLGVBQWU7cUJBQ2hCO2lCQUNGIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Q2RrVGFibGVNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2Nkay90YWJsZSc7XG5pbXBvcnQge0NvbW1vbk1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7TmdNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge0Nka1Jvd1NlbGVjdGlvbn0gZnJvbSAnLi9yb3ctc2VsZWN0aW9uJztcbmltcG9ydCB7Q2RrU2VsZWN0QWxsfSBmcm9tICcuL3NlbGVjdC1hbGwnO1xuaW1wb3J0IHtDZGtTZWxlY3Rpb259IGZyb20gJy4vc2VsZWN0aW9uJztcbmltcG9ydCB7Q2RrU2VsZWN0aW9uQ29sdW1ufSBmcm9tICcuL3NlbGVjdGlvbi1jb2x1bW4nO1xuaW1wb3J0IHtDZGtTZWxlY3Rpb25Ub2dnbGV9IGZyb20gJy4vc2VsZWN0aW9uLXRvZ2dsZSc7XG5cbkBOZ01vZHVsZSh7XG4gIGltcG9ydHM6IFtDb21tb25Nb2R1bGUsIENka1RhYmxlTW9kdWxlXSxcbiAgZXhwb3J0czogW0Nka1NlbGVjdGlvbiwgQ2RrU2VsZWN0aW9uVG9nZ2xlLCBDZGtTZWxlY3RBbGwsIENka1NlbGVjdGlvbkNvbHVtbiwgQ2RrUm93U2VsZWN0aW9uXSxcbiAgZGVjbGFyYXRpb25zOiBbXG4gICAgQ2RrU2VsZWN0aW9uLFxuICAgIENka1NlbGVjdGlvblRvZ2dsZSxcbiAgICBDZGtTZWxlY3RBbGwsXG4gICAgQ2RrU2VsZWN0aW9uQ29sdW1uLFxuICAgIENka1Jvd1NlbGVjdGlvbixcbiAgXSxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrU2VsZWN0aW9uTW9kdWxlIHt9XG4iXX0=