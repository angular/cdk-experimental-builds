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
import { DIALOG_CONFIG, DIALOG_CONTAINER, DIALOG_REF, MAT_DIALOG_SCROLL_STRATEGY_PROVIDER } from './dialog-injectors';
import * as i0 from "@angular/core";
export class DialogModule {
}
DialogModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.0-next.15", ngImport: i0, type: DialogModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
DialogModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "13.0.0-next.15", ngImport: i0, type: DialogModule, declarations: [CdkDialogContainer], imports: [OverlayModule,
        PortalModule,
        A11yModule], exports: [
        // Re-export the PortalModule so that people extending the `CdkDialogContainer`
        // don't have to remember to import it or be faced with an unhelpful error.
        PortalModule,
        CdkDialogContainer] });
DialogModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "13.0.0-next.15", ngImport: i0, type: DialogModule, providers: [
        Dialog,
        MAT_DIALOG_SCROLL_STRATEGY_PROVIDER,
        { provide: DIALOG_REF, useValue: DialogRef },
        { provide: DIALOG_CONTAINER, useValue: CdkDialogContainer },
        { provide: DIALOG_CONFIG, useValue: DialogConfig },
    ], imports: [[
            OverlayModule,
            PortalModule,
            A11yModule,
        ], 
        // Re-export the PortalModule so that people extending the `CdkDialogContainer`
        // don't have to remember to import it or be faced with an unhelpful error.
        PortalModule] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.0-next.15", ngImport: i0, type: DialogModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [
                        OverlayModule,
                        PortalModule,
                        A11yModule,
                    ],
                    exports: [
                        // Re-export the PortalModule so that people extending the `CdkDialogContainer`
                        // don't have to remember to import it or be faced with an unhelpful error.
                        PortalModule,
                        CdkDialogContainer,
                    ],
                    declarations: [
                        CdkDialogContainer,
                    ],
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhbG9nLW1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL2RpYWxvZy9kaWFsb2ctbW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDdkMsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBQ25ELE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUNqRCxPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDN0MsT0FBTyxFQUFDLE1BQU0sRUFBQyxNQUFNLFVBQVUsQ0FBQztBQUNoQyxPQUFPLEVBQUMsa0JBQWtCLEVBQUMsTUFBTSxvQkFBb0IsQ0FBQztBQUN0RCxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDN0MsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLGNBQWMsQ0FBQztBQUN2QyxPQUFPLEVBQ0wsYUFBYSxFQUNiLGdCQUFnQixFQUNoQixVQUFVLEVBQ1YsbUNBQW1DLEVBQ3BDLE1BQU0sb0JBQW9CLENBQUM7O0FBMkI1QixNQUFNLE9BQU8sWUFBWTs7aUhBQVosWUFBWTtrSEFBWixZQUFZLGlCQVhyQixrQkFBa0IsYUFYbEIsYUFBYTtRQUNiLFlBQVk7UUFDWixVQUFVO1FBR1YsK0VBQStFO1FBQy9FLDJFQUEyRTtRQUMzRSxZQUFZO1FBQ1osa0JBQWtCO2tIQWNULFlBQVksYUFUWjtRQUNULE1BQU07UUFDTixtQ0FBbUM7UUFDbkMsRUFBQyxPQUFPLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUM7UUFDMUMsRUFBQyxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsUUFBUSxFQUFFLGtCQUFrQixFQUFDO1FBQ3pELEVBQUMsT0FBTyxFQUFFLGFBQWEsRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFDO0tBQ2pELFlBcEJRO1lBQ1AsYUFBYTtZQUNiLFlBQVk7WUFDWixVQUFVO1NBQ1g7UUFFQywrRUFBK0U7UUFDL0UsMkVBQTJFO1FBQzNFLFlBQVk7bUdBZUgsWUFBWTtrQkF4QnhCLFFBQVE7bUJBQUM7b0JBQ1IsT0FBTyxFQUFFO3dCQUNQLGFBQWE7d0JBQ2IsWUFBWTt3QkFDWixVQUFVO3FCQUNYO29CQUNELE9BQU8sRUFBRTt3QkFDUCwrRUFBK0U7d0JBQy9FLDJFQUEyRTt3QkFDM0UsWUFBWTt3QkFDWixrQkFBa0I7cUJBQ25CO29CQUNELFlBQVksRUFBRTt3QkFDWixrQkFBa0I7cUJBQ25CO29CQUNELFNBQVMsRUFBRTt3QkFDVCxNQUFNO3dCQUNOLG1DQUFtQzt3QkFDbkMsRUFBQyxPQUFPLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUM7d0JBQzFDLEVBQUMsT0FBTyxFQUFFLGdCQUFnQixFQUFFLFFBQVEsRUFBRSxrQkFBa0IsRUFBQzt3QkFDekQsRUFBQyxPQUFPLEVBQUUsYUFBYSxFQUFFLFFBQVEsRUFBRSxZQUFZLEVBQUM7cUJBQ2pEO29CQUNELGVBQWUsRUFBRSxDQUFDLGtCQUFrQixDQUFDO2lCQUN0QyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge05nTW9kdWxlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7T3ZlcmxheU1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY2RrL292ZXJsYXknO1xuaW1wb3J0IHtQb3J0YWxNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2Nkay9wb3J0YWwnO1xuaW1wb3J0IHtBMTF5TW9kdWxlfSBmcm9tICdAYW5ndWxhci9jZGsvYTExeSc7XG5pbXBvcnQge0RpYWxvZ30gZnJvbSAnLi9kaWFsb2cnO1xuaW1wb3J0IHtDZGtEaWFsb2dDb250YWluZXJ9IGZyb20gJy4vZGlhbG9nLWNvbnRhaW5lcic7XG5pbXBvcnQge0RpYWxvZ0NvbmZpZ30gZnJvbSAnLi9kaWFsb2ctY29uZmlnJztcbmltcG9ydCB7RGlhbG9nUmVmfSBmcm9tICcuL2RpYWxvZy1yZWYnO1xuaW1wb3J0IHtcbiAgRElBTE9HX0NPTkZJRyxcbiAgRElBTE9HX0NPTlRBSU5FUixcbiAgRElBTE9HX1JFRixcbiAgTUFUX0RJQUxPR19TQ1JPTExfU1RSQVRFR1lfUFJPVklERVJcbn0gZnJvbSAnLi9kaWFsb2ctaW5qZWN0b3JzJztcblxuXG5ATmdNb2R1bGUoe1xuICBpbXBvcnRzOiBbXG4gICAgT3ZlcmxheU1vZHVsZSxcbiAgICBQb3J0YWxNb2R1bGUsXG4gICAgQTExeU1vZHVsZSxcbiAgXSxcbiAgZXhwb3J0czogW1xuICAgIC8vIFJlLWV4cG9ydCB0aGUgUG9ydGFsTW9kdWxlIHNvIHRoYXQgcGVvcGxlIGV4dGVuZGluZyB0aGUgYENka0RpYWxvZ0NvbnRhaW5lcmBcbiAgICAvLyBkb24ndCBoYXZlIHRvIHJlbWVtYmVyIHRvIGltcG9ydCBpdCBvciBiZSBmYWNlZCB3aXRoIGFuIHVuaGVscGZ1bCBlcnJvci5cbiAgICBQb3J0YWxNb2R1bGUsXG4gICAgQ2RrRGlhbG9nQ29udGFpbmVyLFxuICBdLFxuICBkZWNsYXJhdGlvbnM6IFtcbiAgICBDZGtEaWFsb2dDb250YWluZXIsXG4gIF0sXG4gIHByb3ZpZGVyczogW1xuICAgIERpYWxvZyxcbiAgICBNQVRfRElBTE9HX1NDUk9MTF9TVFJBVEVHWV9QUk9WSURFUixcbiAgICB7cHJvdmlkZTogRElBTE9HX1JFRiwgdXNlVmFsdWU6IERpYWxvZ1JlZn0sXG4gICAge3Byb3ZpZGU6IERJQUxPR19DT05UQUlORVIsIHVzZVZhbHVlOiBDZGtEaWFsb2dDb250YWluZXJ9LFxuICAgIHtwcm92aWRlOiBESUFMT0dfQ09ORklHLCB1c2VWYWx1ZTogRGlhbG9nQ29uZmlnfSxcbiAgXSxcbiAgZW50cnlDb21wb25lbnRzOiBbQ2RrRGlhbG9nQ29udGFpbmVyXSxcbn0pXG5leHBvcnQgY2xhc3MgRGlhbG9nTW9kdWxlIHt9XG4iXX0=