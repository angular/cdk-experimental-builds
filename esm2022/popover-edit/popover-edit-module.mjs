/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { NgModule } from '@angular/core';
import { OverlayModule } from '@angular/cdk/overlay';
import { CdkPopoverEdit, CdkPopoverEditTabOut, CdkRowHoverContent, CdkEditable, CdkEditOpen, } from './table-directives';
import { CdkEditControl, CdkEditRevert, CdkEditClose } from './lens-directives';
import { DefaultPopoverEditPositionStrategyFactory, PopoverEditPositionStrategyFactory, } from './popover-edit-position-strategy-factory';
import * as i0 from "@angular/core";
const EXPORTED_DECLARATIONS = [
    CdkPopoverEdit,
    CdkPopoverEditTabOut,
    CdkRowHoverContent,
    CdkEditControl,
    CdkEditRevert,
    CdkEditClose,
    CdkEditable,
    CdkEditOpen,
];
class CdkPopoverEditModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.0.0-rc.2", ngImport: i0, type: CdkPopoverEditModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "16.0.0-rc.2", ngImport: i0, type: CdkPopoverEditModule, declarations: [CdkPopoverEdit,
            CdkPopoverEditTabOut,
            CdkRowHoverContent,
            CdkEditControl,
            CdkEditRevert,
            CdkEditClose,
            CdkEditable,
            CdkEditOpen], imports: [OverlayModule], exports: [CdkPopoverEdit,
            CdkPopoverEditTabOut,
            CdkRowHoverContent,
            CdkEditControl,
            CdkEditRevert,
            CdkEditClose,
            CdkEditable,
            CdkEditOpen] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "16.0.0-rc.2", ngImport: i0, type: CdkPopoverEditModule, providers: [
            {
                provide: PopoverEditPositionStrategyFactory,
                useClass: DefaultPopoverEditPositionStrategyFactory,
            },
        ], imports: [OverlayModule] }); }
}
export { CdkPopoverEditModule };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.0.0-rc.2", ngImport: i0, type: CdkPopoverEditModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [OverlayModule],
                    exports: EXPORTED_DECLARATIONS,
                    declarations: EXPORTED_DECLARATIONS,
                    providers: [
                        {
                            provide: PopoverEditPositionStrategyFactory,
                            useClass: DefaultPopoverEditPositionStrategyFactory,
                        },
                    ],
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wb3Zlci1lZGl0LW1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL3BvcG92ZXItZWRpdC9wb3BvdmVyLWVkaXQtbW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDdkMsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBQ25ELE9BQU8sRUFDTCxjQUFjLEVBQ2Qsb0JBQW9CLEVBQ3BCLGtCQUFrQixFQUNsQixXQUFXLEVBQ1gsV0FBVyxHQUNaLE1BQU0sb0JBQW9CLENBQUM7QUFDNUIsT0FBTyxFQUFDLGNBQWMsRUFBRSxhQUFhLEVBQUUsWUFBWSxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDOUUsT0FBTyxFQUNMLHlDQUF5QyxFQUN6QyxrQ0FBa0MsR0FDbkMsTUFBTSwwQ0FBMEMsQ0FBQzs7QUFFbEQsTUFBTSxxQkFBcUIsR0FBRztJQUM1QixjQUFjO0lBQ2Qsb0JBQW9CO0lBQ3BCLGtCQUFrQjtJQUNsQixjQUFjO0lBQ2QsYUFBYTtJQUNiLFlBQVk7SUFDWixXQUFXO0lBQ1gsV0FBVztDQUNaLENBQUM7QUFFRixNQVdhLG9CQUFvQjttSEFBcEIsb0JBQW9CO29IQUFwQixvQkFBb0IsaUJBckIvQixjQUFjO1lBQ2Qsb0JBQW9CO1lBQ3BCLGtCQUFrQjtZQUNsQixjQUFjO1lBQ2QsYUFBYTtZQUNiLFlBQVk7WUFDWixXQUFXO1lBQ1gsV0FBVyxhQUlELGFBQWEsYUFYdkIsY0FBYztZQUNkLG9CQUFvQjtZQUNwQixrQkFBa0I7WUFDbEIsY0FBYztZQUNkLGFBQWE7WUFDYixZQUFZO1lBQ1osV0FBVztZQUNYLFdBQVc7b0hBY0Esb0JBQW9CLGFBUHBCO1lBQ1Q7Z0JBQ0UsT0FBTyxFQUFFLGtDQUFrQztnQkFDM0MsUUFBUSxFQUFFLHlDQUF5QzthQUNwRDtTQUNGLFlBUlMsYUFBYTs7U0FVWixvQkFBb0I7Z0dBQXBCLG9CQUFvQjtrQkFYaEMsUUFBUTttQkFBQztvQkFDUixPQUFPLEVBQUUsQ0FBQyxhQUFhLENBQUM7b0JBQ3hCLE9BQU8sRUFBRSxxQkFBcUI7b0JBQzlCLFlBQVksRUFBRSxxQkFBcUI7b0JBQ25DLFNBQVMsRUFBRTt3QkFDVDs0QkFDRSxPQUFPLEVBQUUsa0NBQWtDOzRCQUMzQyxRQUFRLEVBQUUseUNBQXlDO3lCQUNwRDtxQkFDRjtpQkFDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge05nTW9kdWxlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7T3ZlcmxheU1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY2RrL292ZXJsYXknO1xuaW1wb3J0IHtcbiAgQ2RrUG9wb3ZlckVkaXQsXG4gIENka1BvcG92ZXJFZGl0VGFiT3V0LFxuICBDZGtSb3dIb3ZlckNvbnRlbnQsXG4gIENka0VkaXRhYmxlLFxuICBDZGtFZGl0T3Blbixcbn0gZnJvbSAnLi90YWJsZS1kaXJlY3RpdmVzJztcbmltcG9ydCB7Q2RrRWRpdENvbnRyb2wsIENka0VkaXRSZXZlcnQsIENka0VkaXRDbG9zZX0gZnJvbSAnLi9sZW5zLWRpcmVjdGl2ZXMnO1xuaW1wb3J0IHtcbiAgRGVmYXVsdFBvcG92ZXJFZGl0UG9zaXRpb25TdHJhdGVneUZhY3RvcnksXG4gIFBvcG92ZXJFZGl0UG9zaXRpb25TdHJhdGVneUZhY3RvcnksXG59IGZyb20gJy4vcG9wb3Zlci1lZGl0LXBvc2l0aW9uLXN0cmF0ZWd5LWZhY3RvcnknO1xuXG5jb25zdCBFWFBPUlRFRF9ERUNMQVJBVElPTlMgPSBbXG4gIENka1BvcG92ZXJFZGl0LFxuICBDZGtQb3BvdmVyRWRpdFRhYk91dCxcbiAgQ2RrUm93SG92ZXJDb250ZW50LFxuICBDZGtFZGl0Q29udHJvbCxcbiAgQ2RrRWRpdFJldmVydCxcbiAgQ2RrRWRpdENsb3NlLFxuICBDZGtFZGl0YWJsZSxcbiAgQ2RrRWRpdE9wZW4sXG5dO1xuXG5ATmdNb2R1bGUoe1xuICBpbXBvcnRzOiBbT3ZlcmxheU1vZHVsZV0sXG4gIGV4cG9ydHM6IEVYUE9SVEVEX0RFQ0xBUkFUSU9OUyxcbiAgZGVjbGFyYXRpb25zOiBFWFBPUlRFRF9ERUNMQVJBVElPTlMsXG4gIHByb3ZpZGVyczogW1xuICAgIHtcbiAgICAgIHByb3ZpZGU6IFBvcG92ZXJFZGl0UG9zaXRpb25TdHJhdGVneUZhY3RvcnksXG4gICAgICB1c2VDbGFzczogRGVmYXVsdFBvcG92ZXJFZGl0UG9zaXRpb25TdHJhdGVneUZhY3RvcnksXG4gICAgfSxcbiAgXSxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrUG9wb3ZlckVkaXRNb2R1bGUge31cbiJdfQ==