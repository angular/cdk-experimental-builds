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
import { PortalModule } from '@angular/cdk/portal';
import { A11yModule } from '@angular/cdk/a11y';
import { Dialog } from './dialog';
import { CdkDialogContainer } from './dialog-container';
import { DialogConfig } from './dialog-config';
import { DialogRef } from './dialog-ref';
import { DIALOG_CONFIG, DIALOG_CONTAINER, DIALOG_REF, MAT_DIALOG_SCROLL_STRATEGY_PROVIDER } from './dialog-injectors';
const ɵ0 = DialogRef, ɵ1 = CdkDialogContainer, ɵ2 = DialogConfig;
let DialogModule = /** @class */ (() => {
    let DialogModule = class DialogModule {
    };
    DialogModule = __decorate([
        NgModule({
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
                { provide: DIALOG_REF, useValue: ɵ0 },
                { provide: DIALOG_CONTAINER, useValue: ɵ1 },
                { provide: DIALOG_CONFIG, useValue: ɵ2 },
            ],
            entryComponents: [CdkDialogContainer],
        })
    ], DialogModule);
    return DialogModule;
})();
export { DialogModule };
export { ɵ0, ɵ1, ɵ2 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhbG9nLW1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL2RpYWxvZy9kaWFsb2ctbW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFFSCxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3ZDLE9BQU8sRUFBQyxhQUFhLEVBQUMsTUFBTSxzQkFBc0IsQ0FBQztBQUNuRCxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDakQsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQzdDLE9BQU8sRUFBQyxNQUFNLEVBQUMsTUFBTSxVQUFVLENBQUM7QUFDaEMsT0FBTyxFQUFDLGtCQUFrQixFQUFDLE1BQU0sb0JBQW9CLENBQUM7QUFDdEQsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQzdDLE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFDdkMsT0FBTyxFQUNMLGFBQWEsRUFDYixnQkFBZ0IsRUFDaEIsVUFBVSxFQUNWLG1DQUFtQyxFQUNwQyxNQUFNLG9CQUFvQixDQUFDO1dBcUJRLFNBQVMsT0FDSCxrQkFBa0IsT0FDckIsWUFBWTtBQUluRDtJQUFBLElBQWEsWUFBWSxHQUF6QixNQUFhLFlBQVk7S0FBRyxDQUFBO0lBQWYsWUFBWTtRQXhCeEIsUUFBUSxDQUFDO1lBQ1IsT0FBTyxFQUFFO2dCQUNQLGFBQWE7Z0JBQ2IsWUFBWTtnQkFDWixVQUFVO2FBQ1g7WUFDRCxPQUFPLEVBQUU7Z0JBQ1AsK0VBQStFO2dCQUMvRSwyRUFBMkU7Z0JBQzNFLFlBQVk7Z0JBQ1osa0JBQWtCO2FBQ25CO1lBQ0QsWUFBWSxFQUFFO2dCQUNaLGtCQUFrQjthQUNuQjtZQUNELFNBQVMsRUFBRTtnQkFDVCxNQUFNO2dCQUNOLG1DQUFtQztnQkFDbkMsRUFBQyxPQUFPLEVBQUUsVUFBVSxFQUFFLFFBQVEsSUFBVyxFQUFDO2dCQUMxQyxFQUFDLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxRQUFRLElBQW9CLEVBQUM7Z0JBQ3pELEVBQUMsT0FBTyxFQUFFLGFBQWEsRUFBRSxRQUFRLElBQWMsRUFBQzthQUNqRDtZQUNELGVBQWUsRUFBRSxDQUFDLGtCQUFrQixDQUFDO1NBQ3RDLENBQUM7T0FDVyxZQUFZLENBQUc7SUFBRCxtQkFBQztLQUFBO1NBQWYsWUFBWSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge05nTW9kdWxlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7T3ZlcmxheU1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY2RrL292ZXJsYXknO1xuaW1wb3J0IHtQb3J0YWxNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2Nkay9wb3J0YWwnO1xuaW1wb3J0IHtBMTF5TW9kdWxlfSBmcm9tICdAYW5ndWxhci9jZGsvYTExeSc7XG5pbXBvcnQge0RpYWxvZ30gZnJvbSAnLi9kaWFsb2cnO1xuaW1wb3J0IHtDZGtEaWFsb2dDb250YWluZXJ9IGZyb20gJy4vZGlhbG9nLWNvbnRhaW5lcic7XG5pbXBvcnQge0RpYWxvZ0NvbmZpZ30gZnJvbSAnLi9kaWFsb2ctY29uZmlnJztcbmltcG9ydCB7RGlhbG9nUmVmfSBmcm9tICcuL2RpYWxvZy1yZWYnO1xuaW1wb3J0IHtcbiAgRElBTE9HX0NPTkZJRyxcbiAgRElBTE9HX0NPTlRBSU5FUixcbiAgRElBTE9HX1JFRixcbiAgTUFUX0RJQUxPR19TQ1JPTExfU1RSQVRFR1lfUFJPVklERVJcbn0gZnJvbSAnLi9kaWFsb2ctaW5qZWN0b3JzJztcblxuXG5ATmdNb2R1bGUoe1xuICBpbXBvcnRzOiBbXG4gICAgT3ZlcmxheU1vZHVsZSxcbiAgICBQb3J0YWxNb2R1bGUsXG4gICAgQTExeU1vZHVsZSxcbiAgXSxcbiAgZXhwb3J0czogW1xuICAgIC8vIFJlLWV4cG9ydCB0aGUgUG9ydGFsTW9kdWxlIHNvIHRoYXQgcGVvcGxlIGV4dGVuZGluZyB0aGUgYENka0RpYWxvZ0NvbnRhaW5lcmBcbiAgICAvLyBkb24ndCBoYXZlIHRvIHJlbWVtYmVyIHRvIGltcG9ydCBpdCBvciBiZSBmYWNlZCB3aXRoIGFuIHVuaGVscGZ1bCBlcnJvci5cbiAgICBQb3J0YWxNb2R1bGUsXG4gICAgQ2RrRGlhbG9nQ29udGFpbmVyLFxuICBdLFxuICBkZWNsYXJhdGlvbnM6IFtcbiAgICBDZGtEaWFsb2dDb250YWluZXIsXG4gIF0sXG4gIHByb3ZpZGVyczogW1xuICAgIERpYWxvZyxcbiAgICBNQVRfRElBTE9HX1NDUk9MTF9TVFJBVEVHWV9QUk9WSURFUixcbiAgICB7cHJvdmlkZTogRElBTE9HX1JFRiwgdXNlVmFsdWU6IERpYWxvZ1JlZn0sXG4gICAge3Byb3ZpZGU6IERJQUxPR19DT05UQUlORVIsIHVzZVZhbHVlOiBDZGtEaWFsb2dDb250YWluZXJ9LFxuICAgIHtwcm92aWRlOiBESUFMT0dfQ09ORklHLCB1c2VWYWx1ZTogRGlhbG9nQ29uZmlnfSxcbiAgXSxcbiAgZW50cnlDb21wb25lbnRzOiBbQ2RrRGlhbG9nQ29udGFpbmVyXSxcbn0pXG5leHBvcnQgY2xhc3MgRGlhbG9nTW9kdWxlIHt9XG4iXX0=