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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.0-next.1", ngImport: i0, type: CdkPopoverEditModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.0.0-next.1", ngImport: i0, type: CdkPopoverEditModule, imports: [OverlayModule, CdkPopoverEdit,
            CdkPopoverEditTabOut,
            CdkRowHoverContent,
            CdkEditControl,
            CdkEditRevert,
            CdkEditClose,
            CdkEditable,
            CdkEditOpen], exports: [CdkPopoverEdit,
            CdkPopoverEditTabOut,
            CdkRowHoverContent,
            CdkEditControl,
            CdkEditRevert,
            CdkEditClose,
            CdkEditable,
            CdkEditOpen] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.0.0-next.1", ngImport: i0, type: CdkPopoverEditModule, imports: [OverlayModule] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.0-next.1", ngImport: i0, type: CdkPopoverEditModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [OverlayModule, ...EXPORTED_DECLARATIONS],
                    exports: EXPORTED_DECLARATIONS,
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wb3Zlci1lZGl0LW1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL3BvcG92ZXItZWRpdC9wb3BvdmVyLWVkaXQtbW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDdkMsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBQ25ELE9BQU8sRUFDTCxjQUFjLEVBQ2Qsb0JBQW9CLEVBQ3BCLGtCQUFrQixFQUNsQixXQUFXLEVBQ1gsV0FBVyxHQUNaLE1BQU0sb0JBQW9CLENBQUM7QUFDNUIsT0FBTyxFQUFDLGNBQWMsRUFBRSxhQUFhLEVBQUUsWUFBWSxFQUFDLE1BQU0sbUJBQW1CLENBQUM7O0FBRTlFLE1BQU0scUJBQXFCLEdBQUc7SUFDNUIsY0FBYztJQUNkLG9CQUFvQjtJQUNwQixrQkFBa0I7SUFDbEIsY0FBYztJQUNkLGFBQWE7SUFDYixZQUFZO0lBQ1osV0FBVztJQUNYLFdBQVc7Q0FDWixDQUFDO0FBTUYsTUFBTSxPQUFPLG9CQUFvQjtxSEFBcEIsb0JBQW9CO3NIQUFwQixvQkFBb0IsWUFIckIsYUFBYSxFQVh2QixjQUFjO1lBQ2Qsb0JBQW9CO1lBQ3BCLGtCQUFrQjtZQUNsQixjQUFjO1lBQ2QsYUFBYTtZQUNiLFlBQVk7WUFDWixXQUFXO1lBQ1gsV0FBVyxhQVBYLGNBQWM7WUFDZCxvQkFBb0I7WUFDcEIsa0JBQWtCO1lBQ2xCLGNBQWM7WUFDZCxhQUFhO1lBQ2IsWUFBWTtZQUNaLFdBQVc7WUFDWCxXQUFXO3NIQU9BLG9CQUFvQixZQUhyQixhQUFhOztrR0FHWixvQkFBb0I7a0JBSmhDLFFBQVE7bUJBQUM7b0JBQ1IsT0FBTyxFQUFFLENBQUMsYUFBYSxFQUFFLEdBQUcscUJBQXFCLENBQUM7b0JBQ2xELE9BQU8sRUFBRSxxQkFBcUI7aUJBQy9CIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7TmdNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtPdmVybGF5TW9kdWxlfSBmcm9tICdAYW5ndWxhci9jZGsvb3ZlcmxheSc7XG5pbXBvcnQge1xuICBDZGtQb3BvdmVyRWRpdCxcbiAgQ2RrUG9wb3ZlckVkaXRUYWJPdXQsXG4gIENka1Jvd0hvdmVyQ29udGVudCxcbiAgQ2RrRWRpdGFibGUsXG4gIENka0VkaXRPcGVuLFxufSBmcm9tICcuL3RhYmxlLWRpcmVjdGl2ZXMnO1xuaW1wb3J0IHtDZGtFZGl0Q29udHJvbCwgQ2RrRWRpdFJldmVydCwgQ2RrRWRpdENsb3NlfSBmcm9tICcuL2xlbnMtZGlyZWN0aXZlcyc7XG5cbmNvbnN0IEVYUE9SVEVEX0RFQ0xBUkFUSU9OUyA9IFtcbiAgQ2RrUG9wb3ZlckVkaXQsXG4gIENka1BvcG92ZXJFZGl0VGFiT3V0LFxuICBDZGtSb3dIb3ZlckNvbnRlbnQsXG4gIENka0VkaXRDb250cm9sLFxuICBDZGtFZGl0UmV2ZXJ0LFxuICBDZGtFZGl0Q2xvc2UsXG4gIENka0VkaXRhYmxlLFxuICBDZGtFZGl0T3Blbixcbl07XG5cbkBOZ01vZHVsZSh7XG4gIGltcG9ydHM6IFtPdmVybGF5TW9kdWxlLCAuLi5FWFBPUlRFRF9ERUNMQVJBVElPTlNdLFxuICBleHBvcnRzOiBFWFBPUlRFRF9ERUNMQVJBVElPTlMsXG59KVxuZXhwb3J0IGNsYXNzIENka1BvcG92ZXJFZGl0TW9kdWxlIHt9XG4iXX0=