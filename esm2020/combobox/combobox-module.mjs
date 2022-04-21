/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { NgModule } from '@angular/core';
import { OverlayModule } from '@angular/cdk/overlay';
import { CdkCombobox } from './combobox';
import { CdkComboboxPopup } from './combobox-popup';
import * as i0 from "@angular/core";
const EXPORTED_DECLARATIONS = [CdkCombobox, CdkComboboxPopup];
export class CdkComboboxModule {
}
CdkComboboxModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.0.0-next.14", ngImport: i0, type: CdkComboboxModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
CdkComboboxModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "14.0.0-next.14", ngImport: i0, type: CdkComboboxModule, declarations: [CdkCombobox, CdkComboboxPopup], imports: [OverlayModule], exports: [CdkCombobox, CdkComboboxPopup] });
CdkComboboxModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "14.0.0-next.14", ngImport: i0, type: CdkComboboxModule, imports: [[OverlayModule]] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.0.0-next.14", ngImport: i0, type: CdkComboboxModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [OverlayModule],
                    exports: EXPORTED_DECLARATIONS,
                    declarations: EXPORTED_DECLARATIONS,
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tYm9ib3gtbW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvY29tYm9ib3gvY29tYm9ib3gtbW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDdkMsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBQ25ELE9BQU8sRUFBQyxXQUFXLEVBQUMsTUFBTSxZQUFZLENBQUM7QUFDdkMsT0FBTyxFQUFDLGdCQUFnQixFQUFDLE1BQU0sa0JBQWtCLENBQUM7O0FBRWxELE1BQU0scUJBQXFCLEdBQUcsQ0FBQyxXQUFXLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztBQU05RCxNQUFNLE9BQU8saUJBQWlCOztzSEFBakIsaUJBQWlCO3VIQUFqQixpQkFBaUIsaUJBTkMsV0FBVyxFQUFFLGdCQUFnQixhQUVoRCxhQUFhLGFBRk0sV0FBVyxFQUFFLGdCQUFnQjt1SEFNL0MsaUJBQWlCLFlBSm5CLENBQUMsYUFBYSxDQUFDO21HQUliLGlCQUFpQjtrQkFMN0IsUUFBUTttQkFBQztvQkFDUixPQUFPLEVBQUUsQ0FBQyxhQUFhLENBQUM7b0JBQ3hCLE9BQU8sRUFBRSxxQkFBcUI7b0JBQzlCLFlBQVksRUFBRSxxQkFBcUI7aUJBQ3BDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7TmdNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtPdmVybGF5TW9kdWxlfSBmcm9tICdAYW5ndWxhci9jZGsvb3ZlcmxheSc7XG5pbXBvcnQge0Nka0NvbWJvYm94fSBmcm9tICcuL2NvbWJvYm94JztcbmltcG9ydCB7Q2RrQ29tYm9ib3hQb3B1cH0gZnJvbSAnLi9jb21ib2JveC1wb3B1cCc7XG5cbmNvbnN0IEVYUE9SVEVEX0RFQ0xBUkFUSU9OUyA9IFtDZGtDb21ib2JveCwgQ2RrQ29tYm9ib3hQb3B1cF07XG5ATmdNb2R1bGUoe1xuICBpbXBvcnRzOiBbT3ZlcmxheU1vZHVsZV0sXG4gIGV4cG9ydHM6IEVYUE9SVEVEX0RFQ0xBUkFUSU9OUyxcbiAgZGVjbGFyYXRpb25zOiBFWFBPUlRFRF9ERUNMQVJBVElPTlMsXG59KVxuZXhwb3J0IGNsYXNzIENka0NvbWJvYm94TW9kdWxlIHt9XG4iXX0=