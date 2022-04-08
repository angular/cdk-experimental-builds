/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { NgModule } from '@angular/core';
import { OverlayModule } from '@angular/cdk/overlay';
import { CdkMenu } from './menu';
import { CdkMenuBar } from './menu-bar';
import { CdkMenuItem } from './menu-item';
import { CdkMenuGroup } from './menu-group';
import { CdkMenuItemRadio } from './menu-item-radio';
import { CdkMenuItemCheckbox } from './menu-item-checkbox';
import { CdkMenuTrigger } from './menu-trigger';
import { CdkContextMenuTrigger } from './context-menu-trigger';
import { CdkTargetMenuAim } from './menu-aim';
import * as i0 from "@angular/core";
/** The list of components and directives that should be declared and exported from this module. */
const EXPORTED_DECLARATIONS = [
    CdkMenuBar,
    CdkMenu,
    CdkMenuItem,
    CdkMenuItemRadio,
    CdkMenuItemCheckbox,
    CdkMenuTrigger,
    CdkMenuGroup,
    CdkContextMenuTrigger,
    CdkTargetMenuAim,
];
/** Module that declares components and directives for the CDK menu. */
export class CdkMenuModule {
}
CdkMenuModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.0.0-next.9", ngImport: i0, type: CdkMenuModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
CdkMenuModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "14.0.0-next.9", ngImport: i0, type: CdkMenuModule, declarations: [CdkMenuBar,
        CdkMenu,
        CdkMenuItem,
        CdkMenuItemRadio,
        CdkMenuItemCheckbox,
        CdkMenuTrigger,
        CdkMenuGroup,
        CdkContextMenuTrigger,
        CdkTargetMenuAim], imports: [OverlayModule], exports: [CdkMenuBar,
        CdkMenu,
        CdkMenuItem,
        CdkMenuItemRadio,
        CdkMenuItemCheckbox,
        CdkMenuTrigger,
        CdkMenuGroup,
        CdkContextMenuTrigger,
        CdkTargetMenuAim] });
CdkMenuModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "14.0.0-next.9", ngImport: i0, type: CdkMenuModule, imports: [[OverlayModule]] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.0.0-next.9", ngImport: i0, type: CdkMenuModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [OverlayModule],
                    exports: EXPORTED_DECLARATIONS,
                    declarations: EXPORTED_DECLARATIONS,
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrLWV4cGVyaW1lbnRhbC9tZW51L21lbnUtbW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDdkMsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBQ25ELE9BQU8sRUFBQyxPQUFPLEVBQUMsTUFBTSxRQUFRLENBQUM7QUFDL0IsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLFlBQVksQ0FBQztBQUN0QyxPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0sYUFBYSxDQUFDO0FBQ3hDLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFDMUMsT0FBTyxFQUFDLGdCQUFnQixFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDbkQsT0FBTyxFQUFDLG1CQUFtQixFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFDekQsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQzlDLE9BQU8sRUFBQyxxQkFBcUIsRUFBQyxNQUFNLHdCQUF3QixDQUFDO0FBQzdELE9BQU8sRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLFlBQVksQ0FBQzs7QUFFNUMsbUdBQW1HO0FBQ25HLE1BQU0scUJBQXFCLEdBQUc7SUFDNUIsVUFBVTtJQUNWLE9BQU87SUFDUCxXQUFXO0lBQ1gsZ0JBQWdCO0lBQ2hCLG1CQUFtQjtJQUNuQixjQUFjO0lBQ2QsWUFBWTtJQUNaLHFCQUFxQjtJQUNyQixnQkFBZ0I7Q0FDakIsQ0FBQztBQUVGLHVFQUF1RTtBQU12RSxNQUFNLE9BQU8sYUFBYTs7aUhBQWIsYUFBYTtrSEFBYixhQUFhLGlCQWpCeEIsVUFBVTtRQUNWLE9BQU87UUFDUCxXQUFXO1FBQ1gsZ0JBQWdCO1FBQ2hCLG1CQUFtQjtRQUNuQixjQUFjO1FBQ2QsWUFBWTtRQUNaLHFCQUFxQjtRQUNyQixnQkFBZ0IsYUFLTixhQUFhLGFBYnZCLFVBQVU7UUFDVixPQUFPO1FBQ1AsV0FBVztRQUNYLGdCQUFnQjtRQUNoQixtQkFBbUI7UUFDbkIsY0FBYztRQUNkLFlBQVk7UUFDWixxQkFBcUI7UUFDckIsZ0JBQWdCO2tIQVNMLGFBQWEsWUFKZixDQUFDLGFBQWEsQ0FBQztrR0FJYixhQUFhO2tCQUx6QixRQUFRO21CQUFDO29CQUNSLE9BQU8sRUFBRSxDQUFDLGFBQWEsQ0FBQztvQkFDeEIsT0FBTyxFQUFFLHFCQUFxQjtvQkFDOUIsWUFBWSxFQUFFLHFCQUFxQjtpQkFDcEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtOZ01vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge092ZXJsYXlNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2Nkay9vdmVybGF5JztcbmltcG9ydCB7Q2RrTWVudX0gZnJvbSAnLi9tZW51JztcbmltcG9ydCB7Q2RrTWVudUJhcn0gZnJvbSAnLi9tZW51LWJhcic7XG5pbXBvcnQge0Nka01lbnVJdGVtfSBmcm9tICcuL21lbnUtaXRlbSc7XG5pbXBvcnQge0Nka01lbnVHcm91cH0gZnJvbSAnLi9tZW51LWdyb3VwJztcbmltcG9ydCB7Q2RrTWVudUl0ZW1SYWRpb30gZnJvbSAnLi9tZW51LWl0ZW0tcmFkaW8nO1xuaW1wb3J0IHtDZGtNZW51SXRlbUNoZWNrYm94fSBmcm9tICcuL21lbnUtaXRlbS1jaGVja2JveCc7XG5pbXBvcnQge0Nka01lbnVUcmlnZ2VyfSBmcm9tICcuL21lbnUtdHJpZ2dlcic7XG5pbXBvcnQge0Nka0NvbnRleHRNZW51VHJpZ2dlcn0gZnJvbSAnLi9jb250ZXh0LW1lbnUtdHJpZ2dlcic7XG5pbXBvcnQge0Nka1RhcmdldE1lbnVBaW19IGZyb20gJy4vbWVudS1haW0nO1xuXG4vKiogVGhlIGxpc3Qgb2YgY29tcG9uZW50cyBhbmQgZGlyZWN0aXZlcyB0aGF0IHNob3VsZCBiZSBkZWNsYXJlZCBhbmQgZXhwb3J0ZWQgZnJvbSB0aGlzIG1vZHVsZS4gKi9cbmNvbnN0IEVYUE9SVEVEX0RFQ0xBUkFUSU9OUyA9IFtcbiAgQ2RrTWVudUJhcixcbiAgQ2RrTWVudSxcbiAgQ2RrTWVudUl0ZW0sXG4gIENka01lbnVJdGVtUmFkaW8sXG4gIENka01lbnVJdGVtQ2hlY2tib3gsXG4gIENka01lbnVUcmlnZ2VyLFxuICBDZGtNZW51R3JvdXAsXG4gIENka0NvbnRleHRNZW51VHJpZ2dlcixcbiAgQ2RrVGFyZ2V0TWVudUFpbSxcbl07XG5cbi8qKiBNb2R1bGUgdGhhdCBkZWNsYXJlcyBjb21wb25lbnRzIGFuZCBkaXJlY3RpdmVzIGZvciB0aGUgQ0RLIG1lbnUuICovXG5ATmdNb2R1bGUoe1xuICBpbXBvcnRzOiBbT3ZlcmxheU1vZHVsZV0sXG4gIGV4cG9ydHM6IEVYUE9SVEVEX0RFQ0xBUkFUSU9OUyxcbiAgZGVjbGFyYXRpb25zOiBFWFBPUlRFRF9ERUNMQVJBVElPTlMsXG59KVxuZXhwb3J0IGNsYXNzIENka01lbnVNb2R1bGUge31cbiJdfQ==