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
import { CdkMenuPanel } from './menu-panel';
import { CdkMenuItem } from './menu-item';
import { CdkMenuGroup } from './menu-group';
import { CdkMenuItemRadio } from './menu-item-radio';
import { CdkMenuItemCheckbox } from './menu-item-checkbox';
import { CdkMenuItemTrigger } from './menu-item-trigger';
import { CdkContextMenuTrigger } from './context-menu';
import { CdkTargetMenuAim } from './menu-aim';
import * as i0 from "@angular/core";
const EXPORTED_DECLARATIONS = [
    CdkMenuBar,
    CdkMenu,
    CdkMenuPanel,
    CdkMenuItem,
    CdkMenuItemRadio,
    CdkMenuItemCheckbox,
    CdkMenuItemTrigger,
    CdkMenuGroup,
    CdkContextMenuTrigger,
    CdkTargetMenuAim,
];
export class CdkMenuModule {
}
CdkMenuModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.3.0", ngImport: i0, type: CdkMenuModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
CdkMenuModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "13.3.0", ngImport: i0, type: CdkMenuModule, declarations: [CdkMenuBar,
        CdkMenu,
        CdkMenuPanel,
        CdkMenuItem,
        CdkMenuItemRadio,
        CdkMenuItemCheckbox,
        CdkMenuItemTrigger,
        CdkMenuGroup,
        CdkContextMenuTrigger,
        CdkTargetMenuAim], imports: [OverlayModule], exports: [CdkMenuBar,
        CdkMenu,
        CdkMenuPanel,
        CdkMenuItem,
        CdkMenuItemRadio,
        CdkMenuItemCheckbox,
        CdkMenuItemTrigger,
        CdkMenuGroup,
        CdkContextMenuTrigger,
        CdkTargetMenuAim] });
CdkMenuModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "13.3.0", ngImport: i0, type: CdkMenuModule, imports: [[OverlayModule]] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.3.0", ngImport: i0, type: CdkMenuModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [OverlayModule],
                    exports: EXPORTED_DECLARATIONS,
                    declarations: EXPORTED_DECLARATIONS,
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrLWV4cGVyaW1lbnRhbC9tZW51L21lbnUtbW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDdkMsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBQ25ELE9BQU8sRUFBQyxPQUFPLEVBQUMsTUFBTSxRQUFRLENBQUM7QUFDL0IsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLFlBQVksQ0FBQztBQUN0QyxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sY0FBYyxDQUFDO0FBQzFDLE9BQU8sRUFBQyxXQUFXLEVBQUMsTUFBTSxhQUFhLENBQUM7QUFDeEMsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGNBQWMsQ0FBQztBQUMxQyxPQUFPLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUNuRCxPQUFPLEVBQUMsbUJBQW1CLEVBQUMsTUFBTSxzQkFBc0IsQ0FBQztBQUN6RCxPQUFPLEVBQUMsa0JBQWtCLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUN2RCxPQUFPLEVBQUMscUJBQXFCLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUNyRCxPQUFPLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxZQUFZLENBQUM7O0FBRTVDLE1BQU0scUJBQXFCLEdBQUc7SUFDNUIsVUFBVTtJQUNWLE9BQU87SUFDUCxZQUFZO0lBQ1osV0FBVztJQUNYLGdCQUFnQjtJQUNoQixtQkFBbUI7SUFDbkIsa0JBQWtCO0lBQ2xCLFlBQVk7SUFDWixxQkFBcUI7SUFDckIsZ0JBQWdCO0NBQ2pCLENBQUM7QUFNRixNQUFNLE9BQU8sYUFBYTs7MEdBQWIsYUFBYTsyR0FBYixhQUFhLGlCQWhCeEIsVUFBVTtRQUNWLE9BQU87UUFDUCxZQUFZO1FBQ1osV0FBVztRQUNYLGdCQUFnQjtRQUNoQixtQkFBbUI7UUFDbkIsa0JBQWtCO1FBQ2xCLFlBQVk7UUFDWixxQkFBcUI7UUFDckIsZ0JBQWdCLGFBR04sYUFBYSxhQVp2QixVQUFVO1FBQ1YsT0FBTztRQUNQLFlBQVk7UUFDWixXQUFXO1FBQ1gsZ0JBQWdCO1FBQ2hCLG1CQUFtQjtRQUNuQixrQkFBa0I7UUFDbEIsWUFBWTtRQUNaLHFCQUFxQjtRQUNyQixnQkFBZ0I7MkdBT0wsYUFBYSxZQUpmLENBQUMsYUFBYSxDQUFDOzJGQUliLGFBQWE7a0JBTHpCLFFBQVE7bUJBQUM7b0JBQ1IsT0FBTyxFQUFFLENBQUMsYUFBYSxDQUFDO29CQUN4QixPQUFPLEVBQUUscUJBQXFCO29CQUM5QixZQUFZLEVBQUUscUJBQXFCO2lCQUNwQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge05nTW9kdWxlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7T3ZlcmxheU1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY2RrL292ZXJsYXknO1xuaW1wb3J0IHtDZGtNZW51fSBmcm9tICcuL21lbnUnO1xuaW1wb3J0IHtDZGtNZW51QmFyfSBmcm9tICcuL21lbnUtYmFyJztcbmltcG9ydCB7Q2RrTWVudVBhbmVsfSBmcm9tICcuL21lbnUtcGFuZWwnO1xuaW1wb3J0IHtDZGtNZW51SXRlbX0gZnJvbSAnLi9tZW51LWl0ZW0nO1xuaW1wb3J0IHtDZGtNZW51R3JvdXB9IGZyb20gJy4vbWVudS1ncm91cCc7XG5pbXBvcnQge0Nka01lbnVJdGVtUmFkaW99IGZyb20gJy4vbWVudS1pdGVtLXJhZGlvJztcbmltcG9ydCB7Q2RrTWVudUl0ZW1DaGVja2JveH0gZnJvbSAnLi9tZW51LWl0ZW0tY2hlY2tib3gnO1xuaW1wb3J0IHtDZGtNZW51SXRlbVRyaWdnZXJ9IGZyb20gJy4vbWVudS1pdGVtLXRyaWdnZXInO1xuaW1wb3J0IHtDZGtDb250ZXh0TWVudVRyaWdnZXJ9IGZyb20gJy4vY29udGV4dC1tZW51JztcbmltcG9ydCB7Q2RrVGFyZ2V0TWVudUFpbX0gZnJvbSAnLi9tZW51LWFpbSc7XG5cbmNvbnN0IEVYUE9SVEVEX0RFQ0xBUkFUSU9OUyA9IFtcbiAgQ2RrTWVudUJhcixcbiAgQ2RrTWVudSxcbiAgQ2RrTWVudVBhbmVsLFxuICBDZGtNZW51SXRlbSxcbiAgQ2RrTWVudUl0ZW1SYWRpbyxcbiAgQ2RrTWVudUl0ZW1DaGVja2JveCxcbiAgQ2RrTWVudUl0ZW1UcmlnZ2VyLFxuICBDZGtNZW51R3JvdXAsXG4gIENka0NvbnRleHRNZW51VHJpZ2dlcixcbiAgQ2RrVGFyZ2V0TWVudUFpbSxcbl07XG5ATmdNb2R1bGUoe1xuICBpbXBvcnRzOiBbT3ZlcmxheU1vZHVsZV0sXG4gIGV4cG9ydHM6IEVYUE9SVEVEX0RFQ0xBUkFUSU9OUyxcbiAgZGVjbGFyYXRpb25zOiBFWFBPUlRFRF9ERUNMQVJBVElPTlMsXG59KVxuZXhwb3J0IGNsYXNzIENka01lbnVNb2R1bGUge31cbiJdfQ==