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
export class CdkPopoverEditModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.1.0-next.3", ngImport: i0, type: CdkPopoverEditModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "16.1.0-next.3", ngImport: i0, type: CdkPopoverEditModule, declarations: [CdkPopoverEdit,
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
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "16.1.0-next.3", ngImport: i0, type: CdkPopoverEditModule, providers: [
            {
                provide: PopoverEditPositionStrategyFactory,
                useClass: DefaultPopoverEditPositionStrategyFactory,
            },
        ], imports: [OverlayModule] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.1.0-next.3", ngImport: i0, type: CdkPopoverEditModule, decorators: [{
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wb3Zlci1lZGl0LW1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL3BvcG92ZXItZWRpdC9wb3BvdmVyLWVkaXQtbW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDdkMsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBQ25ELE9BQU8sRUFDTCxjQUFjLEVBQ2Qsb0JBQW9CLEVBQ3BCLGtCQUFrQixFQUNsQixXQUFXLEVBQ1gsV0FBVyxHQUNaLE1BQU0sb0JBQW9CLENBQUM7QUFDNUIsT0FBTyxFQUFDLGNBQWMsRUFBRSxhQUFhLEVBQUUsWUFBWSxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDOUUsT0FBTyxFQUNMLHlDQUF5QyxFQUN6QyxrQ0FBa0MsR0FDbkMsTUFBTSwwQ0FBMEMsQ0FBQzs7QUFFbEQsTUFBTSxxQkFBcUIsR0FBRztJQUM1QixjQUFjO0lBQ2Qsb0JBQW9CO0lBQ3BCLGtCQUFrQjtJQUNsQixjQUFjO0lBQ2QsYUFBYTtJQUNiLFlBQVk7SUFDWixXQUFXO0lBQ1gsV0FBVztDQUNaLENBQUM7QUFhRixNQUFNLE9BQU8sb0JBQW9CO3FIQUFwQixvQkFBb0I7c0hBQXBCLG9CQUFvQixpQkFyQi9CLGNBQWM7WUFDZCxvQkFBb0I7WUFDcEIsa0JBQWtCO1lBQ2xCLGNBQWM7WUFDZCxhQUFhO1lBQ2IsWUFBWTtZQUNaLFdBQVc7WUFDWCxXQUFXLGFBSUQsYUFBYSxhQVh2QixjQUFjO1lBQ2Qsb0JBQW9CO1lBQ3BCLGtCQUFrQjtZQUNsQixjQUFjO1lBQ2QsYUFBYTtZQUNiLFlBQVk7WUFDWixXQUFXO1lBQ1gsV0FBVztzSEFjQSxvQkFBb0IsYUFQcEI7WUFDVDtnQkFDRSxPQUFPLEVBQUUsa0NBQWtDO2dCQUMzQyxRQUFRLEVBQUUseUNBQXlDO2FBQ3BEO1NBQ0YsWUFSUyxhQUFhOztrR0FVWixvQkFBb0I7a0JBWGhDLFFBQVE7bUJBQUM7b0JBQ1IsT0FBTyxFQUFFLENBQUMsYUFBYSxDQUFDO29CQUN4QixPQUFPLEVBQUUscUJBQXFCO29CQUM5QixZQUFZLEVBQUUscUJBQXFCO29CQUNuQyxTQUFTLEVBQUU7d0JBQ1Q7NEJBQ0UsT0FBTyxFQUFFLGtDQUFrQzs0QkFDM0MsUUFBUSxFQUFFLHlDQUF5Qzt5QkFDcEQ7cUJBQ0Y7aUJBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtOZ01vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge092ZXJsYXlNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2Nkay9vdmVybGF5JztcbmltcG9ydCB7XG4gIENka1BvcG92ZXJFZGl0LFxuICBDZGtQb3BvdmVyRWRpdFRhYk91dCxcbiAgQ2RrUm93SG92ZXJDb250ZW50LFxuICBDZGtFZGl0YWJsZSxcbiAgQ2RrRWRpdE9wZW4sXG59IGZyb20gJy4vdGFibGUtZGlyZWN0aXZlcyc7XG5pbXBvcnQge0Nka0VkaXRDb250cm9sLCBDZGtFZGl0UmV2ZXJ0LCBDZGtFZGl0Q2xvc2V9IGZyb20gJy4vbGVucy1kaXJlY3RpdmVzJztcbmltcG9ydCB7XG4gIERlZmF1bHRQb3BvdmVyRWRpdFBvc2l0aW9uU3RyYXRlZ3lGYWN0b3J5LFxuICBQb3BvdmVyRWRpdFBvc2l0aW9uU3RyYXRlZ3lGYWN0b3J5LFxufSBmcm9tICcuL3BvcG92ZXItZWRpdC1wb3NpdGlvbi1zdHJhdGVneS1mYWN0b3J5JztcblxuY29uc3QgRVhQT1JURURfREVDTEFSQVRJT05TID0gW1xuICBDZGtQb3BvdmVyRWRpdCxcbiAgQ2RrUG9wb3ZlckVkaXRUYWJPdXQsXG4gIENka1Jvd0hvdmVyQ29udGVudCxcbiAgQ2RrRWRpdENvbnRyb2wsXG4gIENka0VkaXRSZXZlcnQsXG4gIENka0VkaXRDbG9zZSxcbiAgQ2RrRWRpdGFibGUsXG4gIENka0VkaXRPcGVuLFxuXTtcblxuQE5nTW9kdWxlKHtcbiAgaW1wb3J0czogW092ZXJsYXlNb2R1bGVdLFxuICBleHBvcnRzOiBFWFBPUlRFRF9ERUNMQVJBVElPTlMsXG4gIGRlY2xhcmF0aW9uczogRVhQT1JURURfREVDTEFSQVRJT05TLFxuICBwcm92aWRlcnM6IFtcbiAgICB7XG4gICAgICBwcm92aWRlOiBQb3BvdmVyRWRpdFBvc2l0aW9uU3RyYXRlZ3lGYWN0b3J5LFxuICAgICAgdXNlQ2xhc3M6IERlZmF1bHRQb3BvdmVyRWRpdFBvc2l0aW9uU3RyYXRlZ3lGYWN0b3J5LFxuICAgIH0sXG4gIF0sXG59KVxuZXhwb3J0IGNsYXNzIENka1BvcG92ZXJFZGl0TW9kdWxlIHt9XG4iXX0=