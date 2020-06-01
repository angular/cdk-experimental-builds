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
const ɵ0 = DialogRef, ɵ1 = CdkDialogContainer, ɵ2 = DialogConfig;
let DialogModule = /** @class */ (() => {
    class DialogModule {
    }
    DialogModule.decorators = [
        { type: NgModule, args: [{
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
                },] }
    ];
    return DialogModule;
})();
export { DialogModule };
export { ɵ0, ɵ1, ɵ2 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhbG9nLW1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL2RpYWxvZy9kaWFsb2ctbW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDdkMsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBQ25ELE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUNqRCxPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDN0MsT0FBTyxFQUFDLE1BQU0sRUFBQyxNQUFNLFVBQVUsQ0FBQztBQUNoQyxPQUFPLEVBQUMsa0JBQWtCLEVBQUMsTUFBTSxvQkFBb0IsQ0FBQztBQUN0RCxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDN0MsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLGNBQWMsQ0FBQztBQUN2QyxPQUFPLEVBQ0wsYUFBYSxFQUNiLGdCQUFnQixFQUNoQixVQUFVLEVBQ1YsbUNBQW1DLEVBQ3BDLE1BQU0sb0JBQW9CLENBQUM7V0FxQlEsU0FBUyxPQUNILGtCQUFrQixPQUNyQixZQUFZO0FBcEJuRDtJQUFBLE1Bd0JhLFlBQVk7OztnQkF4QnhCLFFBQVEsU0FBQztvQkFDUixPQUFPLEVBQUU7d0JBQ1AsYUFBYTt3QkFDYixZQUFZO3dCQUNaLFVBQVU7cUJBQ1g7b0JBQ0QsT0FBTyxFQUFFO3dCQUNQLCtFQUErRTt3QkFDL0UsMkVBQTJFO3dCQUMzRSxZQUFZO3dCQUNaLGtCQUFrQjtxQkFDbkI7b0JBQ0QsWUFBWSxFQUFFO3dCQUNaLGtCQUFrQjtxQkFDbkI7b0JBQ0QsU0FBUyxFQUFFO3dCQUNULE1BQU07d0JBQ04sbUNBQW1DO3dCQUNuQyxFQUFDLE9BQU8sRUFBRSxVQUFVLEVBQUUsUUFBUSxJQUFXLEVBQUM7d0JBQzFDLEVBQUMsT0FBTyxFQUFFLGdCQUFnQixFQUFFLFFBQVEsSUFBb0IsRUFBQzt3QkFDekQsRUFBQyxPQUFPLEVBQUUsYUFBYSxFQUFFLFFBQVEsSUFBYyxFQUFDO3FCQUNqRDtvQkFDRCxlQUFlLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQztpQkFDdEM7O0lBQzBCLG1CQUFDO0tBQUE7U0FBZixZQUFZIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7TmdNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtPdmVybGF5TW9kdWxlfSBmcm9tICdAYW5ndWxhci9jZGsvb3ZlcmxheSc7XG5pbXBvcnQge1BvcnRhbE1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY2RrL3BvcnRhbCc7XG5pbXBvcnQge0ExMXlNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2Nkay9hMTF5JztcbmltcG9ydCB7RGlhbG9nfSBmcm9tICcuL2RpYWxvZyc7XG5pbXBvcnQge0Nka0RpYWxvZ0NvbnRhaW5lcn0gZnJvbSAnLi9kaWFsb2ctY29udGFpbmVyJztcbmltcG9ydCB7RGlhbG9nQ29uZmlnfSBmcm9tICcuL2RpYWxvZy1jb25maWcnO1xuaW1wb3J0IHtEaWFsb2dSZWZ9IGZyb20gJy4vZGlhbG9nLXJlZic7XG5pbXBvcnQge1xuICBESUFMT0dfQ09ORklHLFxuICBESUFMT0dfQ09OVEFJTkVSLFxuICBESUFMT0dfUkVGLFxuICBNQVRfRElBTE9HX1NDUk9MTF9TVFJBVEVHWV9QUk9WSURFUlxufSBmcm9tICcuL2RpYWxvZy1pbmplY3RvcnMnO1xuXG5cbkBOZ01vZHVsZSh7XG4gIGltcG9ydHM6IFtcbiAgICBPdmVybGF5TW9kdWxlLFxuICAgIFBvcnRhbE1vZHVsZSxcbiAgICBBMTF5TW9kdWxlLFxuICBdLFxuICBleHBvcnRzOiBbXG4gICAgLy8gUmUtZXhwb3J0IHRoZSBQb3J0YWxNb2R1bGUgc28gdGhhdCBwZW9wbGUgZXh0ZW5kaW5nIHRoZSBgQ2RrRGlhbG9nQ29udGFpbmVyYFxuICAgIC8vIGRvbid0IGhhdmUgdG8gcmVtZW1iZXIgdG8gaW1wb3J0IGl0IG9yIGJlIGZhY2VkIHdpdGggYW4gdW5oZWxwZnVsIGVycm9yLlxuICAgIFBvcnRhbE1vZHVsZSxcbiAgICBDZGtEaWFsb2dDb250YWluZXIsXG4gIF0sXG4gIGRlY2xhcmF0aW9uczogW1xuICAgIENka0RpYWxvZ0NvbnRhaW5lcixcbiAgXSxcbiAgcHJvdmlkZXJzOiBbXG4gICAgRGlhbG9nLFxuICAgIE1BVF9ESUFMT0dfU0NST0xMX1NUUkFURUdZX1BST1ZJREVSLFxuICAgIHtwcm92aWRlOiBESUFMT0dfUkVGLCB1c2VWYWx1ZTogRGlhbG9nUmVmfSxcbiAgICB7cHJvdmlkZTogRElBTE9HX0NPTlRBSU5FUiwgdXNlVmFsdWU6IENka0RpYWxvZ0NvbnRhaW5lcn0sXG4gICAge3Byb3ZpZGU6IERJQUxPR19DT05GSUcsIHVzZVZhbHVlOiBEaWFsb2dDb25maWd9LFxuICBdLFxuICBlbnRyeUNvbXBvbmVudHM6IFtDZGtEaWFsb2dDb250YWluZXJdLFxufSlcbmV4cG9ydCBjbGFzcyBEaWFsb2dNb2R1bGUge31cbiJdfQ==