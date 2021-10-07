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
CdkSelectionModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.0-next.15", ngImport: i0, type: CdkSelectionModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
CdkSelectionModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "13.0.0-next.15", ngImport: i0, type: CdkSelectionModule, declarations: [CdkSelection,
        CdkSelectionToggle,
        CdkSelectAll,
        CdkSelectionColumn,
        CdkRowSelection], imports: [CommonModule,
        CdkTableModule], exports: [CdkSelection,
        CdkSelectionToggle,
        CdkSelectAll,
        CdkSelectionColumn,
        CdkRowSelection] });
CdkSelectionModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "13.0.0-next.15", ngImport: i0, type: CdkSelectionModule, imports: [[
            CommonModule,
            CdkTableModule,
        ]] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.0-next.15", ngImport: i0, type: CdkSelectionModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [
                        CommonModule,
                        CdkTableModule,
                    ],
                    exports: [
                        CdkSelection,
                        CdkSelectionToggle,
                        CdkSelectAll,
                        CdkSelectionColumn,
                        CdkRowSelection,
                    ],
                    declarations: [
                        CdkSelection,
                        CdkSelectionToggle,
                        CdkSelectAll,
                        CdkSelectionColumn,
                        CdkRowSelection,
                    ],
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VsZWN0aW9uLW1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL3NlbGVjdGlvbi9zZWxlY3Rpb24tbW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxvQkFBb0IsQ0FBQztBQUNsRCxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDN0MsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUV2QyxPQUFPLEVBQUMsZUFBZSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDaEQsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGNBQWMsQ0FBQztBQUMxQyxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sYUFBYSxDQUFDO0FBQ3pDLE9BQU8sRUFBQyxrQkFBa0IsRUFBQyxNQUFNLG9CQUFvQixDQUFDO0FBQ3RELE9BQU8sRUFBQyxrQkFBa0IsRUFBQyxNQUFNLG9CQUFvQixDQUFDOztBQXNCdEQsTUFBTSxPQUFPLGtCQUFrQjs7dUhBQWxCLGtCQUFrQjt3SEFBbEIsa0JBQWtCLGlCQVAzQixZQUFZO1FBQ1osa0JBQWtCO1FBQ2xCLFlBQVk7UUFDWixrQkFBa0I7UUFDbEIsZUFBZSxhQWZmLFlBQVk7UUFDWixjQUFjLGFBR2QsWUFBWTtRQUNaLGtCQUFrQjtRQUNsQixZQUFZO1FBQ1osa0JBQWtCO1FBQ2xCLGVBQWU7d0hBVU4sa0JBQWtCLFlBbkJwQjtZQUNQLFlBQVk7WUFDWixjQUFjO1NBQ2Y7bUdBZ0JVLGtCQUFrQjtrQkFwQjlCLFFBQVE7bUJBQUM7b0JBQ1IsT0FBTyxFQUFFO3dCQUNQLFlBQVk7d0JBQ1osY0FBYztxQkFDZjtvQkFDRCxPQUFPLEVBQUU7d0JBQ1AsWUFBWTt3QkFDWixrQkFBa0I7d0JBQ2xCLFlBQVk7d0JBQ1osa0JBQWtCO3dCQUNsQixlQUFlO3FCQUNoQjtvQkFDRCxZQUFZLEVBQUU7d0JBQ1osWUFBWTt3QkFDWixrQkFBa0I7d0JBQ2xCLFlBQVk7d0JBQ1osa0JBQWtCO3dCQUNsQixlQUFlO3FCQUNoQjtpQkFDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0Nka1RhYmxlTW9kdWxlfSBmcm9tICdAYW5ndWxhci9jZGsvdGFibGUnO1xuaW1wb3J0IHtDb21tb25Nb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQge05nTW9kdWxlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtDZGtSb3dTZWxlY3Rpb259IGZyb20gJy4vcm93LXNlbGVjdGlvbic7XG5pbXBvcnQge0Nka1NlbGVjdEFsbH0gZnJvbSAnLi9zZWxlY3QtYWxsJztcbmltcG9ydCB7Q2RrU2VsZWN0aW9ufSBmcm9tICcuL3NlbGVjdGlvbic7XG5pbXBvcnQge0Nka1NlbGVjdGlvbkNvbHVtbn0gZnJvbSAnLi9zZWxlY3Rpb24tY29sdW1uJztcbmltcG9ydCB7Q2RrU2VsZWN0aW9uVG9nZ2xlfSBmcm9tICcuL3NlbGVjdGlvbi10b2dnbGUnO1xuXG5ATmdNb2R1bGUoe1xuICBpbXBvcnRzOiBbXG4gICAgQ29tbW9uTW9kdWxlLFxuICAgIENka1RhYmxlTW9kdWxlLFxuICBdLFxuICBleHBvcnRzOiBbXG4gICAgQ2RrU2VsZWN0aW9uLFxuICAgIENka1NlbGVjdGlvblRvZ2dsZSxcbiAgICBDZGtTZWxlY3RBbGwsXG4gICAgQ2RrU2VsZWN0aW9uQ29sdW1uLFxuICAgIENka1Jvd1NlbGVjdGlvbixcbiAgXSxcbiAgZGVjbGFyYXRpb25zOiBbXG4gICAgQ2RrU2VsZWN0aW9uLFxuICAgIENka1NlbGVjdGlvblRvZ2dsZSxcbiAgICBDZGtTZWxlY3RBbGwsXG4gICAgQ2RrU2VsZWN0aW9uQ29sdW1uLFxuICAgIENka1Jvd1NlbGVjdGlvbixcbiAgXSxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrU2VsZWN0aW9uTW9kdWxlIHtcbn1cbiJdfQ==