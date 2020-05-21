/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __decorate } from "tslib";
import { NgModule } from '@angular/core';
import { OverlayModule } from '@angular/cdk/overlay';
import { CdkPopoverEdit, CdkPopoverEditTabOut, CdkRowHoverContent, CdkEditable, CdkEditOpen } from './table-directives';
import { CdkEditControl, CdkEditRevert, CdkEditClose } from './lens-directives';
import { DefaultPopoverEditPositionStrategyFactory, PopoverEditPositionStrategyFactory } from './popover-edit-position-strategy-factory';
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
let CdkPopoverEditModule = /** @class */ (() => {
    let CdkPopoverEditModule = class CdkPopoverEditModule {
    };
    CdkPopoverEditModule = __decorate([
        NgModule({
            imports: [
                OverlayModule,
            ],
            exports: EXPORTED_DECLARATIONS,
            declarations: EXPORTED_DECLARATIONS,
            providers: [{
                    provide: PopoverEditPositionStrategyFactory,
                    useClass: DefaultPopoverEditPositionStrategyFactory
                }],
        })
    ], CdkPopoverEditModule);
    return CdkPopoverEditModule;
})();
export { CdkPopoverEditModule };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wb3Zlci1lZGl0LW1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL3BvcG92ZXItZWRpdC9wb3BvdmVyLWVkaXQtbW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFFSCxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3ZDLE9BQU8sRUFBQyxhQUFhLEVBQUMsTUFBTSxzQkFBc0IsQ0FBQztBQUNuRCxPQUFPLEVBQ0wsY0FBYyxFQUNkLG9CQUFvQixFQUNwQixrQkFBa0IsRUFDbEIsV0FBVyxFQUNYLFdBQVcsRUFDWixNQUFNLG9CQUFvQixDQUFDO0FBQzVCLE9BQU8sRUFBQyxjQUFjLEVBQ3BCLGFBQWEsRUFDYixZQUFZLEVBQ2IsTUFBTSxtQkFBbUIsQ0FBQztBQUMzQixPQUFPLEVBQ0wseUNBQXlDLEVBQ3pDLGtDQUFrQyxFQUNuQyxNQUFNLDBDQUEwQyxDQUFDO0FBRWxELE1BQU0scUJBQXFCLEdBQUc7SUFDNUIsY0FBYztJQUNkLG9CQUFvQjtJQUNwQixrQkFBa0I7SUFDbEIsY0FBYztJQUNkLGFBQWE7SUFDYixZQUFZO0lBQ1osV0FBVztJQUNYLFdBQVc7Q0FDWixDQUFDO0FBYUY7SUFBQSxJQUFhLG9CQUFvQixHQUFqQyxNQUFhLG9CQUFvQjtLQUFJLENBQUE7SUFBeEIsb0JBQW9CO1FBWGhDLFFBQVEsQ0FBQztZQUNSLE9BQU8sRUFBRTtnQkFDUCxhQUFhO2FBQ2Q7WUFDRCxPQUFPLEVBQUUscUJBQXFCO1lBQzlCLFlBQVksRUFBRSxxQkFBcUI7WUFDbkMsU0FBUyxFQUFFLENBQUM7b0JBQ1YsT0FBTyxFQUFFLGtDQUFrQztvQkFDM0MsUUFBUSxFQUFFLHlDQUF5QztpQkFDcEQsQ0FBQztTQUNILENBQUM7T0FDVyxvQkFBb0IsQ0FBSTtJQUFELDJCQUFDO0tBQUE7U0FBeEIsb0JBQW9CIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7TmdNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtPdmVybGF5TW9kdWxlfSBmcm9tICdAYW5ndWxhci9jZGsvb3ZlcmxheSc7XG5pbXBvcnQge1xuICBDZGtQb3BvdmVyRWRpdCxcbiAgQ2RrUG9wb3ZlckVkaXRUYWJPdXQsXG4gIENka1Jvd0hvdmVyQ29udGVudCxcbiAgQ2RrRWRpdGFibGUsXG4gIENka0VkaXRPcGVuXG59IGZyb20gJy4vdGFibGUtZGlyZWN0aXZlcyc7XG5pbXBvcnQge0Nka0VkaXRDb250cm9sLFxuICBDZGtFZGl0UmV2ZXJ0LFxuICBDZGtFZGl0Q2xvc2Vcbn0gZnJvbSAnLi9sZW5zLWRpcmVjdGl2ZXMnO1xuaW1wb3J0IHtcbiAgRGVmYXVsdFBvcG92ZXJFZGl0UG9zaXRpb25TdHJhdGVneUZhY3RvcnksXG4gIFBvcG92ZXJFZGl0UG9zaXRpb25TdHJhdGVneUZhY3Rvcnlcbn0gZnJvbSAnLi9wb3BvdmVyLWVkaXQtcG9zaXRpb24tc3RyYXRlZ3ktZmFjdG9yeSc7XG5cbmNvbnN0IEVYUE9SVEVEX0RFQ0xBUkFUSU9OUyA9IFtcbiAgQ2RrUG9wb3ZlckVkaXQsXG4gIENka1BvcG92ZXJFZGl0VGFiT3V0LFxuICBDZGtSb3dIb3ZlckNvbnRlbnQsXG4gIENka0VkaXRDb250cm9sLFxuICBDZGtFZGl0UmV2ZXJ0LFxuICBDZGtFZGl0Q2xvc2UsXG4gIENka0VkaXRhYmxlLFxuICBDZGtFZGl0T3Blbixcbl07XG5cbkBOZ01vZHVsZSh7XG4gIGltcG9ydHM6IFtcbiAgICBPdmVybGF5TW9kdWxlLFxuICBdLFxuICBleHBvcnRzOiBFWFBPUlRFRF9ERUNMQVJBVElPTlMsXG4gIGRlY2xhcmF0aW9uczogRVhQT1JURURfREVDTEFSQVRJT05TLFxuICBwcm92aWRlcnM6IFt7XG4gICAgcHJvdmlkZTogUG9wb3ZlckVkaXRQb3NpdGlvblN0cmF0ZWd5RmFjdG9yeSxcbiAgICB1c2VDbGFzczogRGVmYXVsdFBvcG92ZXJFZGl0UG9zaXRpb25TdHJhdGVneUZhY3RvcnlcbiAgfV0sXG59KVxuZXhwb3J0IGNsYXNzIENka1BvcG92ZXJFZGl0TW9kdWxlIHsgfVxuIl19