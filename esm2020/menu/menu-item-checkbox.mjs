/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive } from '@angular/core';
import { CdkMenuItemSelectable } from './menu-item-selectable';
import { CdkMenuItem } from './menu-item';
import * as i0 from "@angular/core";
/**
 * A directive providing behavior for the "menuitemcheckbox" ARIA role, which behaves similarly to a
 * conventional checkbox.
 */
export class CdkMenuItemCheckbox extends CdkMenuItemSelectable {
    /**
     * Toggle the checked state of the checkbox.
     * @param options Options the configure how the item is triggered
     *   - keepOpen: specifies that the menu should be kept open after triggering the item.
     */
    trigger(options) {
        super.trigger(options);
        if (!this.disabled) {
            this.checked = !this.checked;
        }
    }
}
CdkMenuItemCheckbox.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.0.0-next.13", ngImport: i0, type: CdkMenuItemCheckbox, deps: null, target: i0.ɵɵFactoryTarget.Directive });
CdkMenuItemCheckbox.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "14.0.0-next.13", type: CdkMenuItemCheckbox, selector: "[cdkMenuItemCheckbox]", host: { attributes: { "role": "menuitemcheckbox" } }, providers: [
        { provide: CdkMenuItemSelectable, useExisting: CdkMenuItemCheckbox },
        { provide: CdkMenuItem, useExisting: CdkMenuItemSelectable },
    ], exportAs: ["cdkMenuItemCheckbox"], usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.0.0-next.13", ngImport: i0, type: CdkMenuItemCheckbox, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkMenuItemCheckbox]',
                    exportAs: 'cdkMenuItemCheckbox',
                    host: {
                        'role': 'menuitemcheckbox',
                    },
                    providers: [
                        { provide: CdkMenuItemSelectable, useExisting: CdkMenuItemCheckbox },
                        { provide: CdkMenuItem, useExisting: CdkMenuItemSelectable },
                    ],
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1pdGVtLWNoZWNrYm94LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvbWVudS9tZW51LWl0ZW0tY2hlY2tib3gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUN4QyxPQUFPLEVBQUMscUJBQXFCLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQztBQUM3RCxPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0sYUFBYSxDQUFDOztBQUV4Qzs7O0dBR0c7QUFZSCxNQUFNLE9BQU8sbUJBQW9CLFNBQVEscUJBQXFCO0lBQzVEOzs7O09BSUc7SUFDTSxPQUFPLENBQUMsT0FBNkI7UUFDNUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUV2QixJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNsQixJQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztTQUM5QjtJQUNILENBQUM7O3dIQVpVLG1CQUFtQjs0R0FBbkIsbUJBQW1CLHNHQUxuQjtRQUNULEVBQUMsT0FBTyxFQUFFLHFCQUFxQixFQUFFLFdBQVcsRUFBRSxtQkFBbUIsRUFBQztRQUNsRSxFQUFDLE9BQU8sRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLHFCQUFxQixFQUFDO0tBQzNEO21HQUVVLG1CQUFtQjtrQkFYL0IsU0FBUzttQkFBQztvQkFDVCxRQUFRLEVBQUUsdUJBQXVCO29CQUNqQyxRQUFRLEVBQUUscUJBQXFCO29CQUMvQixJQUFJLEVBQUU7d0JBQ0osTUFBTSxFQUFFLGtCQUFrQjtxQkFDM0I7b0JBQ0QsU0FBUyxFQUFFO3dCQUNULEVBQUMsT0FBTyxFQUFFLHFCQUFxQixFQUFFLFdBQVcscUJBQXFCLEVBQUM7d0JBQ2xFLEVBQUMsT0FBTyxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUscUJBQXFCLEVBQUM7cUJBQzNEO2lCQUNGIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RGlyZWN0aXZlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7Q2RrTWVudUl0ZW1TZWxlY3RhYmxlfSBmcm9tICcuL21lbnUtaXRlbS1zZWxlY3RhYmxlJztcbmltcG9ydCB7Q2RrTWVudUl0ZW19IGZyb20gJy4vbWVudS1pdGVtJztcblxuLyoqXG4gKiBBIGRpcmVjdGl2ZSBwcm92aWRpbmcgYmVoYXZpb3IgZm9yIHRoZSBcIm1lbnVpdGVtY2hlY2tib3hcIiBBUklBIHJvbGUsIHdoaWNoIGJlaGF2ZXMgc2ltaWxhcmx5IHRvIGFcbiAqIGNvbnZlbnRpb25hbCBjaGVja2JveC5cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW2Nka01lbnVJdGVtQ2hlY2tib3hdJyxcbiAgZXhwb3J0QXM6ICdjZGtNZW51SXRlbUNoZWNrYm94JyxcbiAgaG9zdDoge1xuICAgICdyb2xlJzogJ21lbnVpdGVtY2hlY2tib3gnLFxuICB9LFxuICBwcm92aWRlcnM6IFtcbiAgICB7cHJvdmlkZTogQ2RrTWVudUl0ZW1TZWxlY3RhYmxlLCB1c2VFeGlzdGluZzogQ2RrTWVudUl0ZW1DaGVja2JveH0sXG4gICAge3Byb3ZpZGU6IENka01lbnVJdGVtLCB1c2VFeGlzdGluZzogQ2RrTWVudUl0ZW1TZWxlY3RhYmxlfSxcbiAgXSxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrTWVudUl0ZW1DaGVja2JveCBleHRlbmRzIENka01lbnVJdGVtU2VsZWN0YWJsZSB7XG4gIC8qKlxuICAgKiBUb2dnbGUgdGhlIGNoZWNrZWQgc3RhdGUgb2YgdGhlIGNoZWNrYm94LlxuICAgKiBAcGFyYW0gb3B0aW9ucyBPcHRpb25zIHRoZSBjb25maWd1cmUgaG93IHRoZSBpdGVtIGlzIHRyaWdnZXJlZFxuICAgKiAgIC0ga2VlcE9wZW46IHNwZWNpZmllcyB0aGF0IHRoZSBtZW51IHNob3VsZCBiZSBrZXB0IG9wZW4gYWZ0ZXIgdHJpZ2dlcmluZyB0aGUgaXRlbS5cbiAgICovXG4gIG92ZXJyaWRlIHRyaWdnZXIob3B0aW9ucz86IHtrZWVwT3BlbjogYm9vbGVhbn0pIHtcbiAgICBzdXBlci50cmlnZ2VyKG9wdGlvbnMpO1xuXG4gICAgaWYgKCF0aGlzLmRpc2FibGVkKSB7XG4gICAgICB0aGlzLmNoZWNrZWQgPSAhdGhpcy5jaGVja2VkO1xuICAgIH1cbiAgfVxufVxuIl19