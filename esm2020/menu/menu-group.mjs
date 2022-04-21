/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive } from '@angular/core';
import { UniqueSelectionDispatcher } from '@angular/cdk/collections';
import * as i0 from "@angular/core";
/**
 * A grouping container for `CdkMenuItemRadio` instances, similar to a `role="radiogroup"` element.
 */
export class CdkMenuGroup {
}
CdkMenuGroup.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.0.0-next.14", ngImport: i0, type: CdkMenuGroup, deps: [], target: i0.ɵɵFactoryTarget.Directive });
CdkMenuGroup.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "14.0.0-next.14", type: CdkMenuGroup, selector: "[cdkMenuGroup]", host: { attributes: { "role": "group" }, classAttribute: "cdk-menu-group" }, providers: [{ provide: UniqueSelectionDispatcher, useClass: UniqueSelectionDispatcher }], exportAs: ["cdkMenuGroup"], ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.0.0-next.14", ngImport: i0, type: CdkMenuGroup, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkMenuGroup]',
                    exportAs: 'cdkMenuGroup',
                    host: {
                        'role': 'group',
                        'class': 'cdk-menu-group',
                    },
                    providers: [{ provide: UniqueSelectionDispatcher, useClass: UniqueSelectionDispatcher }],
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1ncm91cC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL21lbnUvbWVudS1ncm91cC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3hDLE9BQU8sRUFBQyx5QkFBeUIsRUFBQyxNQUFNLDBCQUEwQixDQUFDOztBQUVuRTs7R0FFRztBQVVILE1BQU0sT0FBTyxZQUFZOztpSEFBWixZQUFZO3FHQUFaLFlBQVksc0hBRlosQ0FBQyxFQUFDLE9BQU8sRUFBRSx5QkFBeUIsRUFBRSxRQUFRLEVBQUUseUJBQXlCLEVBQUMsQ0FBQzttR0FFM0UsWUFBWTtrQkFUeEIsU0FBUzttQkFBQztvQkFDVCxRQUFRLEVBQUUsZ0JBQWdCO29CQUMxQixRQUFRLEVBQUUsY0FBYztvQkFDeEIsSUFBSSxFQUFFO3dCQUNKLE1BQU0sRUFBRSxPQUFPO3dCQUNmLE9BQU8sRUFBRSxnQkFBZ0I7cUJBQzFCO29CQUNELFNBQVMsRUFBRSxDQUFDLEVBQUMsT0FBTyxFQUFFLHlCQUF5QixFQUFFLFFBQVEsRUFBRSx5QkFBeUIsRUFBQyxDQUFDO2lCQUN2RiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0RpcmVjdGl2ZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge1VuaXF1ZVNlbGVjdGlvbkRpc3BhdGNoZXJ9IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2xsZWN0aW9ucyc7XG5cbi8qKlxuICogQSBncm91cGluZyBjb250YWluZXIgZm9yIGBDZGtNZW51SXRlbVJhZGlvYCBpbnN0YW5jZXMsIHNpbWlsYXIgdG8gYSBgcm9sZT1cInJhZGlvZ3JvdXBcImAgZWxlbWVudC5cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW2Nka01lbnVHcm91cF0nLFxuICBleHBvcnRBczogJ2Nka01lbnVHcm91cCcsXG4gIGhvc3Q6IHtcbiAgICAncm9sZSc6ICdncm91cCcsXG4gICAgJ2NsYXNzJzogJ2Nkay1tZW51LWdyb3VwJyxcbiAgfSxcbiAgcHJvdmlkZXJzOiBbe3Byb3ZpZGU6IFVuaXF1ZVNlbGVjdGlvbkRpc3BhdGNoZXIsIHVzZUNsYXNzOiBVbmlxdWVTZWxlY3Rpb25EaXNwYXRjaGVyfV0sXG59KVxuZXhwb3J0IGNsYXNzIENka01lbnVHcm91cCB7fVxuIl19