/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { NgModule } from '@angular/core';
import { OverlayModule } from '@angular/cdk/overlay';
import { CdkPopoverEdit, CdkPopoverEditTabOut, CdkRowHoverContent, CdkEditable, CdkEditOpen } from './table-directives';
import { CdkEditControl, CdkEditRevert, CdkEditClose } from './lens-directives';
import { DefaultPopoverEditPositionStrategyFactory, PopoverEditPositionStrategyFactory } from './popover-edit-position-strategy-factory';
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
export class CdkPopoverEditModule {
}
CdkPopoverEditModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.0-next.15", ngImport: i0, type: CdkPopoverEditModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
CdkPopoverEditModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "13.0.0-next.15", ngImport: i0, type: CdkPopoverEditModule, declarations: [CdkPopoverEdit,
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
        CdkEditOpen] });
CdkPopoverEditModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "13.0.0-next.15", ngImport: i0, type: CdkPopoverEditModule, providers: [{
            provide: PopoverEditPositionStrategyFactory,
            useClass: DefaultPopoverEditPositionStrategyFactory
        }], imports: [[
            OverlayModule,
        ]] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.0-next.15", ngImport: i0, type: CdkPopoverEditModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [
                        OverlayModule,
                    ],
                    exports: EXPORTED_DECLARATIONS,
                    declarations: EXPORTED_DECLARATIONS,
                    providers: [{
                            provide: PopoverEditPositionStrategyFactory,
                            useClass: DefaultPopoverEditPositionStrategyFactory
                        }],
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wb3Zlci1lZGl0LW1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL3BvcG92ZXItZWRpdC9wb3BvdmVyLWVkaXQtbW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDdkMsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBQ25ELE9BQU8sRUFDTCxjQUFjLEVBQ2Qsb0JBQW9CLEVBQ3BCLGtCQUFrQixFQUNsQixXQUFXLEVBQ1gsV0FBVyxFQUNaLE1BQU0sb0JBQW9CLENBQUM7QUFDNUIsT0FBTyxFQUFDLGNBQWMsRUFDcEIsYUFBYSxFQUNiLFlBQVksRUFDYixNQUFNLG1CQUFtQixDQUFDO0FBQzNCLE9BQU8sRUFDTCx5Q0FBeUMsRUFDekMsa0NBQWtDLEVBQ25DLE1BQU0sMENBQTBDLENBQUM7O0FBRWxELE1BQU0scUJBQXFCLEdBQUc7SUFDNUIsY0FBYztJQUNkLG9CQUFvQjtJQUNwQixrQkFBa0I7SUFDbEIsY0FBYztJQUNkLGFBQWE7SUFDYixZQUFZO0lBQ1osV0FBVztJQUNYLFdBQVc7Q0FDWixDQUFDO0FBYUYsTUFBTSxPQUFPLG9CQUFvQjs7eUhBQXBCLG9CQUFvQjswSEFBcEIsb0JBQW9CLGlCQXJCL0IsY0FBYztRQUNkLG9CQUFvQjtRQUNwQixrQkFBa0I7UUFDbEIsY0FBYztRQUNkLGFBQWE7UUFDYixZQUFZO1FBQ1osV0FBVztRQUNYLFdBQVcsYUFLVCxhQUFhLGFBWmYsY0FBYztRQUNkLG9CQUFvQjtRQUNwQixrQkFBa0I7UUFDbEIsY0FBYztRQUNkLGFBQWE7UUFDYixZQUFZO1FBQ1osV0FBVztRQUNYLFdBQVc7MEhBY0Esb0JBQW9CLGFBTHBCLENBQUM7WUFDVixPQUFPLEVBQUUsa0NBQWtDO1lBQzNDLFFBQVEsRUFBRSx5Q0FBeUM7U0FDcEQsQ0FBQyxZQVJPO1lBQ1AsYUFBYTtTQUNkO21HQVFVLG9CQUFvQjtrQkFYaEMsUUFBUTttQkFBQztvQkFDUixPQUFPLEVBQUU7d0JBQ1AsYUFBYTtxQkFDZDtvQkFDRCxPQUFPLEVBQUUscUJBQXFCO29CQUM5QixZQUFZLEVBQUUscUJBQXFCO29CQUNuQyxTQUFTLEVBQUUsQ0FBQzs0QkFDVixPQUFPLEVBQUUsa0NBQWtDOzRCQUMzQyxRQUFRLEVBQUUseUNBQXlDO3lCQUNwRCxDQUFDO2lCQUNIIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7TmdNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtPdmVybGF5TW9kdWxlfSBmcm9tICdAYW5ndWxhci9jZGsvb3ZlcmxheSc7XG5pbXBvcnQge1xuICBDZGtQb3BvdmVyRWRpdCxcbiAgQ2RrUG9wb3ZlckVkaXRUYWJPdXQsXG4gIENka1Jvd0hvdmVyQ29udGVudCxcbiAgQ2RrRWRpdGFibGUsXG4gIENka0VkaXRPcGVuXG59IGZyb20gJy4vdGFibGUtZGlyZWN0aXZlcyc7XG5pbXBvcnQge0Nka0VkaXRDb250cm9sLFxuICBDZGtFZGl0UmV2ZXJ0LFxuICBDZGtFZGl0Q2xvc2Vcbn0gZnJvbSAnLi9sZW5zLWRpcmVjdGl2ZXMnO1xuaW1wb3J0IHtcbiAgRGVmYXVsdFBvcG92ZXJFZGl0UG9zaXRpb25TdHJhdGVneUZhY3RvcnksXG4gIFBvcG92ZXJFZGl0UG9zaXRpb25TdHJhdGVneUZhY3Rvcnlcbn0gZnJvbSAnLi9wb3BvdmVyLWVkaXQtcG9zaXRpb24tc3RyYXRlZ3ktZmFjdG9yeSc7XG5cbmNvbnN0IEVYUE9SVEVEX0RFQ0xBUkFUSU9OUyA9IFtcbiAgQ2RrUG9wb3ZlckVkaXQsXG4gIENka1BvcG92ZXJFZGl0VGFiT3V0LFxuICBDZGtSb3dIb3ZlckNvbnRlbnQsXG4gIENka0VkaXRDb250cm9sLFxuICBDZGtFZGl0UmV2ZXJ0LFxuICBDZGtFZGl0Q2xvc2UsXG4gIENka0VkaXRhYmxlLFxuICBDZGtFZGl0T3Blbixcbl07XG5cbkBOZ01vZHVsZSh7XG4gIGltcG9ydHM6IFtcbiAgICBPdmVybGF5TW9kdWxlLFxuICBdLFxuICBleHBvcnRzOiBFWFBPUlRFRF9ERUNMQVJBVElPTlMsXG4gIGRlY2xhcmF0aW9uczogRVhQT1JURURfREVDTEFSQVRJT05TLFxuICBwcm92aWRlcnM6IFt7XG4gICAgcHJvdmlkZTogUG9wb3ZlckVkaXRQb3NpdGlvblN0cmF0ZWd5RmFjdG9yeSxcbiAgICB1c2VDbGFzczogRGVmYXVsdFBvcG92ZXJFZGl0UG9zaXRpb25TdHJhdGVneUZhY3RvcnlcbiAgfV0sXG59KVxuZXhwb3J0IGNsYXNzIENka1BvcG92ZXJFZGl0TW9kdWxlIHsgfVxuIl19