/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { NgModule } from '@angular/core';
import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { A11yModule } from '@angular/cdk/a11y';
import { Dialog } from './dialog';
import { CdkDialogContainer } from './dialog-container';
import { DialogConfig } from './dialog-config';
import { DialogRef } from './dialog-ref';
import { DIALOG_CONFIG, DIALOG_CONTAINER, DIALOG_REF, MAT_DIALOG_SCROLL_STRATEGY_PROVIDER, } from './dialog-injectors';
import * as i0 from "@angular/core";
export class DialogModule {
}
DialogModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.0-rc.3", ngImport: i0, type: DialogModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
DialogModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "13.0.0-rc.3", ngImport: i0, type: DialogModule, declarations: [CdkDialogContainer], imports: [OverlayModule, PortalModule, A11yModule], exports: [
        // Re-export the PortalModule so that people extending the `CdkDialogContainer`
        // don't have to remember to import it or be faced with an unhelpful error.
        PortalModule,
        CdkDialogContainer] });
DialogModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "13.0.0-rc.3", ngImport: i0, type: DialogModule, providers: [
        Dialog,
        MAT_DIALOG_SCROLL_STRATEGY_PROVIDER,
        { provide: DIALOG_REF, useValue: DialogRef },
        { provide: DIALOG_CONTAINER, useValue: CdkDialogContainer },
        { provide: DIALOG_CONFIG, useValue: DialogConfig },
    ], imports: [[OverlayModule, PortalModule, A11yModule], 
        // Re-export the PortalModule so that people extending the `CdkDialogContainer`
        // don't have to remember to import it or be faced with an unhelpful error.
        PortalModule] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.0-rc.3", ngImport: i0, type: DialogModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [OverlayModule, PortalModule, A11yModule],
                    exports: [
                        // Re-export the PortalModule so that people extending the `CdkDialogContainer`
                        // don't have to remember to import it or be faced with an unhelpful error.
                        PortalModule,
                        CdkDialogContainer,
                    ],
                    declarations: [CdkDialogContainer],
                    providers: [
                        Dialog,
                        MAT_DIALOG_SCROLL_STRATEGY_PROVIDER,
                        { provide: DIALOG_REF, useValue: DialogRef },
                        { provide: DIALOG_CONTAINER, useValue: CdkDialogContainer },
                        { provide: DIALOG_CONFIG, useValue: DialogConfig },
                    ],
                    entryComponents: [CdkDialogContainer],
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhbG9nLW1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL2RpYWxvZy9kaWFsb2ctbW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDdkMsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBQ25ELE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUNqRCxPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDN0MsT0FBTyxFQUFDLE1BQU0sRUFBQyxNQUFNLFVBQVUsQ0FBQztBQUNoQyxPQUFPLEVBQUMsa0JBQWtCLEVBQUMsTUFBTSxvQkFBb0IsQ0FBQztBQUN0RCxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDN0MsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLGNBQWMsQ0FBQztBQUN2QyxPQUFPLEVBQ0wsYUFBYSxFQUNiLGdCQUFnQixFQUNoQixVQUFVLEVBQ1YsbUNBQW1DLEdBQ3BDLE1BQU0sb0JBQW9CLENBQUM7O0FBb0I1QixNQUFNLE9BQU8sWUFBWTs7OEdBQVosWUFBWTsrR0FBWixZQUFZLGlCQVZSLGtCQUFrQixhQVB2QixhQUFhLEVBQUUsWUFBWSxFQUFFLFVBQVU7UUFFL0MsK0VBQStFO1FBQy9FLDJFQUEyRTtRQUMzRSxZQUFZO1FBQ1osa0JBQWtCOytHQVlULFlBQVksYUFUWjtRQUNULE1BQU07UUFDTixtQ0FBbUM7UUFDbkMsRUFBQyxPQUFPLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUM7UUFDMUMsRUFBQyxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsUUFBUSxFQUFFLGtCQUFrQixFQUFDO1FBQ3pELEVBQUMsT0FBTyxFQUFFLGFBQWEsRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFDO0tBQ2pELFlBZFEsQ0FBQyxhQUFhLEVBQUUsWUFBWSxFQUFFLFVBQVUsQ0FBQztRQUVoRCwrRUFBK0U7UUFDL0UsMkVBQTJFO1FBQzNFLFlBQVk7Z0dBYUgsWUFBWTtrQkFsQnhCLFFBQVE7bUJBQUM7b0JBQ1IsT0FBTyxFQUFFLENBQUMsYUFBYSxFQUFFLFlBQVksRUFBRSxVQUFVLENBQUM7b0JBQ2xELE9BQU8sRUFBRTt3QkFDUCwrRUFBK0U7d0JBQy9FLDJFQUEyRTt3QkFDM0UsWUFBWTt3QkFDWixrQkFBa0I7cUJBQ25CO29CQUNELFlBQVksRUFBRSxDQUFDLGtCQUFrQixDQUFDO29CQUNsQyxTQUFTLEVBQUU7d0JBQ1QsTUFBTTt3QkFDTixtQ0FBbUM7d0JBQ25DLEVBQUMsT0FBTyxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFDO3dCQUMxQyxFQUFDLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxRQUFRLEVBQUUsa0JBQWtCLEVBQUM7d0JBQ3pELEVBQUMsT0FBTyxFQUFFLGFBQWEsRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFDO3FCQUNqRDtvQkFDRCxlQUFlLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQztpQkFDdEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtOZ01vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge092ZXJsYXlNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2Nkay9vdmVybGF5JztcbmltcG9ydCB7UG9ydGFsTW9kdWxlfSBmcm9tICdAYW5ndWxhci9jZGsvcG9ydGFsJztcbmltcG9ydCB7QTExeU1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2ExMXknO1xuaW1wb3J0IHtEaWFsb2d9IGZyb20gJy4vZGlhbG9nJztcbmltcG9ydCB7Q2RrRGlhbG9nQ29udGFpbmVyfSBmcm9tICcuL2RpYWxvZy1jb250YWluZXInO1xuaW1wb3J0IHtEaWFsb2dDb25maWd9IGZyb20gJy4vZGlhbG9nLWNvbmZpZyc7XG5pbXBvcnQge0RpYWxvZ1JlZn0gZnJvbSAnLi9kaWFsb2ctcmVmJztcbmltcG9ydCB7XG4gIERJQUxPR19DT05GSUcsXG4gIERJQUxPR19DT05UQUlORVIsXG4gIERJQUxPR19SRUYsXG4gIE1BVF9ESUFMT0dfU0NST0xMX1NUUkFURUdZX1BST1ZJREVSLFxufSBmcm9tICcuL2RpYWxvZy1pbmplY3RvcnMnO1xuXG5ATmdNb2R1bGUoe1xuICBpbXBvcnRzOiBbT3ZlcmxheU1vZHVsZSwgUG9ydGFsTW9kdWxlLCBBMTF5TW9kdWxlXSxcbiAgZXhwb3J0czogW1xuICAgIC8vIFJlLWV4cG9ydCB0aGUgUG9ydGFsTW9kdWxlIHNvIHRoYXQgcGVvcGxlIGV4dGVuZGluZyB0aGUgYENka0RpYWxvZ0NvbnRhaW5lcmBcbiAgICAvLyBkb24ndCBoYXZlIHRvIHJlbWVtYmVyIHRvIGltcG9ydCBpdCBvciBiZSBmYWNlZCB3aXRoIGFuIHVuaGVscGZ1bCBlcnJvci5cbiAgICBQb3J0YWxNb2R1bGUsXG4gICAgQ2RrRGlhbG9nQ29udGFpbmVyLFxuICBdLFxuICBkZWNsYXJhdGlvbnM6IFtDZGtEaWFsb2dDb250YWluZXJdLFxuICBwcm92aWRlcnM6IFtcbiAgICBEaWFsb2csXG4gICAgTUFUX0RJQUxPR19TQ1JPTExfU1RSQVRFR1lfUFJPVklERVIsXG4gICAge3Byb3ZpZGU6IERJQUxPR19SRUYsIHVzZVZhbHVlOiBEaWFsb2dSZWZ9LFxuICAgIHtwcm92aWRlOiBESUFMT0dfQ09OVEFJTkVSLCB1c2VWYWx1ZTogQ2RrRGlhbG9nQ29udGFpbmVyfSxcbiAgICB7cHJvdmlkZTogRElBTE9HX0NPTkZJRywgdXNlVmFsdWU6IERpYWxvZ0NvbmZpZ30sXG4gIF0sXG4gIGVudHJ5Q29tcG9uZW50czogW0Nka0RpYWxvZ0NvbnRhaW5lcl0sXG59KVxuZXhwb3J0IGNsYXNzIERpYWxvZ01vZHVsZSB7fVxuIl19