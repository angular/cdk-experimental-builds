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
var EXPORTED_DECLARATIONS = [
    CdkPopoverEdit,
    CdkPopoverEditTabOut,
    CdkRowHoverContent,
    CdkEditControl,
    CdkEditRevert,
    CdkEditClose,
    CdkEditable,
    CdkEditOpen,
];
var CdkPopoverEditModule = /** @class */ (function () {
    function CdkPopoverEditModule() {
    }
    CdkPopoverEditModule.decorators = [
        { type: NgModule, args: [{
                    imports: [
                        OverlayModule,
                    ],
                    exports: EXPORTED_DECLARATIONS,
                    declarations: EXPORTED_DECLARATIONS,
                    providers: [{
                            provide: PopoverEditPositionStrategyFactory,
                            useClass: DefaultPopoverEditPositionStrategyFactory
                        }],
                },] }
    ];
    return CdkPopoverEditModule;
}());
export { CdkPopoverEditModule };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wb3Zlci1lZGl0LW1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL3BvcG92ZXItZWRpdC9wb3BvdmVyLWVkaXQtbW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDdkMsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBQ25ELE9BQU8sRUFDTCxjQUFjLEVBQ2Qsb0JBQW9CLEVBQ3BCLGtCQUFrQixFQUNsQixXQUFXLEVBQ1gsV0FBVyxFQUNaLE1BQU0sb0JBQW9CLENBQUM7QUFDNUIsT0FBTyxFQUFDLGNBQWMsRUFDcEIsYUFBYSxFQUNiLFlBQVksRUFDYixNQUFNLG1CQUFtQixDQUFDO0FBQzNCLE9BQU8sRUFDTCx5Q0FBeUMsRUFDekMsa0NBQWtDLEVBQ25DLE1BQU0sMENBQTBDLENBQUM7QUFFbEQsSUFBTSxxQkFBcUIsR0FBRztJQUM1QixjQUFjO0lBQ2Qsb0JBQW9CO0lBQ3BCLGtCQUFrQjtJQUNsQixjQUFjO0lBQ2QsYUFBYTtJQUNiLFlBQVk7SUFDWixXQUFXO0lBQ1gsV0FBVztDQUNaLENBQUM7QUFFRjtJQUFBO0lBV29DLENBQUM7O2dCQVhwQyxRQUFRLFNBQUM7b0JBQ1IsT0FBTyxFQUFFO3dCQUNQLGFBQWE7cUJBQ2Q7b0JBQ0QsT0FBTyxFQUFFLHFCQUFxQjtvQkFDOUIsWUFBWSxFQUFFLHFCQUFxQjtvQkFDbkMsU0FBUyxFQUFFLENBQUM7NEJBQ1YsT0FBTyxFQUFFLGtDQUFrQzs0QkFDM0MsUUFBUSxFQUFFLHlDQUF5Qzt5QkFDcEQsQ0FBQztpQkFDSDs7SUFDbUMsMkJBQUM7Q0FBQSxBQVhyQyxJQVdxQztTQUF4QixvQkFBb0IiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtOZ01vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge092ZXJsYXlNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2Nkay9vdmVybGF5JztcbmltcG9ydCB7XG4gIENka1BvcG92ZXJFZGl0LFxuICBDZGtQb3BvdmVyRWRpdFRhYk91dCxcbiAgQ2RrUm93SG92ZXJDb250ZW50LFxuICBDZGtFZGl0YWJsZSxcbiAgQ2RrRWRpdE9wZW5cbn0gZnJvbSAnLi90YWJsZS1kaXJlY3RpdmVzJztcbmltcG9ydCB7Q2RrRWRpdENvbnRyb2wsXG4gIENka0VkaXRSZXZlcnQsXG4gIENka0VkaXRDbG9zZVxufSBmcm9tICcuL2xlbnMtZGlyZWN0aXZlcyc7XG5pbXBvcnQge1xuICBEZWZhdWx0UG9wb3ZlckVkaXRQb3NpdGlvblN0cmF0ZWd5RmFjdG9yeSxcbiAgUG9wb3ZlckVkaXRQb3NpdGlvblN0cmF0ZWd5RmFjdG9yeVxufSBmcm9tICcuL3BvcG92ZXItZWRpdC1wb3NpdGlvbi1zdHJhdGVneS1mYWN0b3J5JztcblxuY29uc3QgRVhQT1JURURfREVDTEFSQVRJT05TID0gW1xuICBDZGtQb3BvdmVyRWRpdCxcbiAgQ2RrUG9wb3ZlckVkaXRUYWJPdXQsXG4gIENka1Jvd0hvdmVyQ29udGVudCxcbiAgQ2RrRWRpdENvbnRyb2wsXG4gIENka0VkaXRSZXZlcnQsXG4gIENka0VkaXRDbG9zZSxcbiAgQ2RrRWRpdGFibGUsXG4gIENka0VkaXRPcGVuLFxuXTtcblxuQE5nTW9kdWxlKHtcbiAgaW1wb3J0czogW1xuICAgIE92ZXJsYXlNb2R1bGUsXG4gIF0sXG4gIGV4cG9ydHM6IEVYUE9SVEVEX0RFQ0xBUkFUSU9OUyxcbiAgZGVjbGFyYXRpb25zOiBFWFBPUlRFRF9ERUNMQVJBVElPTlMsXG4gIHByb3ZpZGVyczogW3tcbiAgICBwcm92aWRlOiBQb3BvdmVyRWRpdFBvc2l0aW9uU3RyYXRlZ3lGYWN0b3J5LFxuICAgIHVzZUNsYXNzOiBEZWZhdWx0UG9wb3ZlckVkaXRQb3NpdGlvblN0cmF0ZWd5RmFjdG9yeVxuICB9XSxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrUG9wb3ZlckVkaXRNb2R1bGUgeyB9XG4iXX0=