/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { NgModule } from '@angular/core';
import { CdkTableScrollContainer } from './table-scroll-container';
import * as i0 from "@angular/core";
export class CdkTableScrollContainerModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.0-next.1", ngImport: i0, type: CdkTableScrollContainerModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.1.0-next.1", ngImport: i0, type: CdkTableScrollContainerModule, imports: [CdkTableScrollContainer], exports: [CdkTableScrollContainer] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.1.0-next.1", ngImport: i0, type: CdkTableScrollContainerModule }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.0-next.1", ngImport: i0, type: CdkTableScrollContainerModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [CdkTableScrollContainer],
                    exports: [CdkTableScrollContainer],
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFibGUtc2Nyb2xsLWNvbnRhaW5lci1tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrLWV4cGVyaW1lbnRhbC90YWJsZS1zY3JvbGwtY29udGFpbmVyL3RhYmxlLXNjcm9sbC1jb250YWluZXItbW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFdkMsT0FBTyxFQUFDLHVCQUF1QixFQUFDLE1BQU0sMEJBQTBCLENBQUM7O0FBTWpFLE1BQU0sT0FBTyw2QkFBNkI7cUhBQTdCLDZCQUE2QjtzSEFBN0IsNkJBQTZCLFlBSDlCLHVCQUF1QixhQUN2Qix1QkFBdUI7c0hBRXRCLDZCQUE2Qjs7a0dBQTdCLDZCQUE2QjtrQkFKekMsUUFBUTttQkFBQztvQkFDUixPQUFPLEVBQUUsQ0FBQyx1QkFBdUIsQ0FBQztvQkFDbEMsT0FBTyxFQUFFLENBQUMsdUJBQXVCLENBQUM7aUJBQ25DIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7TmdNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge0Nka1RhYmxlU2Nyb2xsQ29udGFpbmVyfSBmcm9tICcuL3RhYmxlLXNjcm9sbC1jb250YWluZXInO1xuXG5ATmdNb2R1bGUoe1xuICBpbXBvcnRzOiBbQ2RrVGFibGVTY3JvbGxDb250YWluZXJdLFxuICBleHBvcnRzOiBbQ2RrVGFibGVTY3JvbGxDb250YWluZXJdLFxufSlcbmV4cG9ydCBjbGFzcyBDZGtUYWJsZVNjcm9sbENvbnRhaW5lck1vZHVsZSB7fVxuIl19