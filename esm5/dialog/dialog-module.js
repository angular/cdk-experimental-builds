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
var ɵ0 = DialogRef, ɵ1 = CdkDialogContainer, ɵ2 = DialogConfig;
var DialogModule = /** @class */ (function () {
    function DialogModule() {
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
}());
export { DialogModule };
export { ɵ0, ɵ1, ɵ2 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhbG9nLW1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL2RpYWxvZy9kaWFsb2ctbW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDdkMsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBQ25ELE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUNqRCxPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDN0MsT0FBTyxFQUFDLE1BQU0sRUFBQyxNQUFNLFVBQVUsQ0FBQztBQUNoQyxPQUFPLEVBQUMsa0JBQWtCLEVBQUMsTUFBTSxvQkFBb0IsQ0FBQztBQUN0RCxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDN0MsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLGNBQWMsQ0FBQztBQUN2QyxPQUFPLEVBQ0wsYUFBYSxFQUNiLGdCQUFnQixFQUNoQixVQUFVLEVBQ1YsbUNBQW1DLEVBQ3BDLE1BQU0sb0JBQW9CLENBQUM7U0FxQlEsU0FBUyxPQUNILGtCQUFrQixPQUNyQixZQUFZO0FBcEJuRDtJQUFBO0lBd0IyQixDQUFDOztnQkF4QjNCLFFBQVEsU0FBQztvQkFDUixPQUFPLEVBQUU7d0JBQ1AsYUFBYTt3QkFDYixZQUFZO3dCQUNaLFVBQVU7cUJBQ1g7b0JBQ0QsT0FBTyxFQUFFO3dCQUNQLCtFQUErRTt3QkFDL0UsMkVBQTJFO3dCQUMzRSxZQUFZO3dCQUNaLGtCQUFrQjtxQkFDbkI7b0JBQ0QsWUFBWSxFQUFFO3dCQUNaLGtCQUFrQjtxQkFDbkI7b0JBQ0QsU0FBUyxFQUFFO3dCQUNULE1BQU07d0JBQ04sbUNBQW1DO3dCQUNuQyxFQUFDLE9BQU8sRUFBRSxVQUFVLEVBQUUsUUFBUSxJQUFXLEVBQUM7d0JBQzFDLEVBQUMsT0FBTyxFQUFFLGdCQUFnQixFQUFFLFFBQVEsSUFBb0IsRUFBQzt3QkFDekQsRUFBQyxPQUFPLEVBQUUsYUFBYSxFQUFFLFFBQVEsSUFBYyxFQUFDO3FCQUNqRDtvQkFDRCxlQUFlLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQztpQkFDdEM7O0lBQzBCLG1CQUFDO0NBQUEsQUF4QjVCLElBd0I0QjtTQUFmLFlBQVkiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtOZ01vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge092ZXJsYXlNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2Nkay9vdmVybGF5JztcbmltcG9ydCB7UG9ydGFsTW9kdWxlfSBmcm9tICdAYW5ndWxhci9jZGsvcG9ydGFsJztcbmltcG9ydCB7QTExeU1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2ExMXknO1xuaW1wb3J0IHtEaWFsb2d9IGZyb20gJy4vZGlhbG9nJztcbmltcG9ydCB7Q2RrRGlhbG9nQ29udGFpbmVyfSBmcm9tICcuL2RpYWxvZy1jb250YWluZXInO1xuaW1wb3J0IHtEaWFsb2dDb25maWd9IGZyb20gJy4vZGlhbG9nLWNvbmZpZyc7XG5pbXBvcnQge0RpYWxvZ1JlZn0gZnJvbSAnLi9kaWFsb2ctcmVmJztcbmltcG9ydCB7XG4gIERJQUxPR19DT05GSUcsXG4gIERJQUxPR19DT05UQUlORVIsXG4gIERJQUxPR19SRUYsXG4gIE1BVF9ESUFMT0dfU0NST0xMX1NUUkFURUdZX1BST1ZJREVSXG59IGZyb20gJy4vZGlhbG9nLWluamVjdG9ycyc7XG5cblxuQE5nTW9kdWxlKHtcbiAgaW1wb3J0czogW1xuICAgIE92ZXJsYXlNb2R1bGUsXG4gICAgUG9ydGFsTW9kdWxlLFxuICAgIEExMXlNb2R1bGUsXG4gIF0sXG4gIGV4cG9ydHM6IFtcbiAgICAvLyBSZS1leHBvcnQgdGhlIFBvcnRhbE1vZHVsZSBzbyB0aGF0IHBlb3BsZSBleHRlbmRpbmcgdGhlIGBDZGtEaWFsb2dDb250YWluZXJgXG4gICAgLy8gZG9uJ3QgaGF2ZSB0byByZW1lbWJlciB0byBpbXBvcnQgaXQgb3IgYmUgZmFjZWQgd2l0aCBhbiB1bmhlbHBmdWwgZXJyb3IuXG4gICAgUG9ydGFsTW9kdWxlLFxuICAgIENka0RpYWxvZ0NvbnRhaW5lcixcbiAgXSxcbiAgZGVjbGFyYXRpb25zOiBbXG4gICAgQ2RrRGlhbG9nQ29udGFpbmVyLFxuICBdLFxuICBwcm92aWRlcnM6IFtcbiAgICBEaWFsb2csXG4gICAgTUFUX0RJQUxPR19TQ1JPTExfU1RSQVRFR1lfUFJPVklERVIsXG4gICAge3Byb3ZpZGU6IERJQUxPR19SRUYsIHVzZVZhbHVlOiBEaWFsb2dSZWZ9LFxuICAgIHtwcm92aWRlOiBESUFMT0dfQ09OVEFJTkVSLCB1c2VWYWx1ZTogQ2RrRGlhbG9nQ29udGFpbmVyfSxcbiAgICB7cHJvdmlkZTogRElBTE9HX0NPTkZJRywgdXNlVmFsdWU6IERpYWxvZ0NvbmZpZ30sXG4gIF0sXG4gIGVudHJ5Q29tcG9uZW50czogW0Nka0RpYWxvZ0NvbnRhaW5lcl0sXG59KVxuZXhwb3J0IGNsYXNzIERpYWxvZ01vZHVsZSB7fVxuIl19