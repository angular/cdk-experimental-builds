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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.0-next.1", ngImport: i0, type: CdkComboboxModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.0.0-next.1", ngImport: i0, type: CdkComboboxModule, imports: [OverlayModule, CdkCombobox, CdkComboboxPopup], exports: [CdkCombobox, CdkComboboxPopup] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.0.0-next.1", ngImport: i0, type: CdkComboboxModule, imports: [OverlayModule] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.0-next.1", ngImport: i0, type: CdkComboboxModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [OverlayModule, ...EXPORTED_DECLARATIONS],
                    exports: EXPORTED_DECLARATIONS,
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tYm9ib3gtbW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvY29tYm9ib3gvY29tYm9ib3gtbW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDdkMsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBQ25ELE9BQU8sRUFBQyxXQUFXLEVBQUMsTUFBTSxZQUFZLENBQUM7QUFDdkMsT0FBTyxFQUFDLGdCQUFnQixFQUFDLE1BQU0sa0JBQWtCLENBQUM7O0FBRWxELE1BQU0scUJBQXFCLEdBQUcsQ0FBQyxXQUFXLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztBQUs5RCxNQUFNLE9BQU8saUJBQWlCO3FIQUFqQixpQkFBaUI7c0hBQWpCLGlCQUFpQixZQUhsQixhQUFhLEVBRk0sV0FBVyxFQUFFLGdCQUFnQixhQUE3QixXQUFXLEVBQUUsZ0JBQWdCO3NIQUsvQyxpQkFBaUIsWUFIbEIsYUFBYTs7a0dBR1osaUJBQWlCO2tCQUo3QixRQUFRO21CQUFDO29CQUNSLE9BQU8sRUFBRSxDQUFDLGFBQWEsRUFBRSxHQUFHLHFCQUFxQixDQUFDO29CQUNsRCxPQUFPLEVBQUUscUJBQXFCO2lCQUMvQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge05nTW9kdWxlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7T3ZlcmxheU1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY2RrL292ZXJsYXknO1xuaW1wb3J0IHtDZGtDb21ib2JveH0gZnJvbSAnLi9jb21ib2JveCc7XG5pbXBvcnQge0Nka0NvbWJvYm94UG9wdXB9IGZyb20gJy4vY29tYm9ib3gtcG9wdXAnO1xuXG5jb25zdCBFWFBPUlRFRF9ERUNMQVJBVElPTlMgPSBbQ2RrQ29tYm9ib3gsIENka0NvbWJvYm94UG9wdXBdO1xuQE5nTW9kdWxlKHtcbiAgaW1wb3J0czogW092ZXJsYXlNb2R1bGUsIC4uLkVYUE9SVEVEX0RFQ0xBUkFUSU9OU10sXG4gIGV4cG9ydHM6IEVYUE9SVEVEX0RFQ0xBUkFUSU9OUyxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrQ29tYm9ib3hNb2R1bGUge31cbiJdfQ==