/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, HostListener } from '@angular/core';
import { CdkMenuItemSelectable } from './menu-item-selectable';
import { CdkMenuItem } from './menu-item';
/**
 * A directive providing behavior for the "menuitemcheckbox" ARIA role, which behaves similarly to a
 * conventional checkbox.
 */
export class CdkMenuItemCheckbox extends CdkMenuItemSelectable {
    // In Ivy the `host` metadata will be merged, whereas in ViewEngine it is overridden. In order
    // to avoid double event listeners, we need to use `HostListener`. Once Ivy is the default, we
    // can move this back into `host`.
    // tslint:disable:no-host-decorator-in-concrete
    trigger() {
        super.trigger();
        if (!this.disabled) {
            this.checked = !this.checked;
        }
    }
}
CdkMenuItemCheckbox.decorators = [
    { type: Directive, args: [{
                selector: '[cdkMenuItemCheckbox]',
                exportAs: 'cdkMenuItemCheckbox',
                host: {
                    'type': 'button',
                    'role': 'menuitemcheckbox',
                    '[attr.aria-checked]': 'checked || null',
                    '[attr.aria-disabled]': 'disabled || null',
                },
                providers: [
                    { provide: CdkMenuItemSelectable, useExisting: CdkMenuItemCheckbox },
                    { provide: CdkMenuItem, useExisting: CdkMenuItemSelectable },
                ],
            },] }
];
CdkMenuItemCheckbox.propDecorators = {
    trigger: [{ type: HostListener, args: ['click',] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1pdGVtLWNoZWNrYm94LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvbWVudS9tZW51LWl0ZW0tY2hlY2tib3gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFNBQVMsRUFBRSxZQUFZLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDdEQsT0FBTyxFQUFDLHFCQUFxQixFQUFDLE1BQU0sd0JBQXdCLENBQUM7QUFDN0QsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLGFBQWEsQ0FBQztBQUV4Qzs7O0dBR0c7QUFlSCxNQUFNLE9BQU8sbUJBQW9CLFNBQVEscUJBQXFCO0lBQzVELDhGQUE4RjtJQUM5Riw4RkFBOEY7SUFDOUYsa0NBQWtDO0lBQ2xDLCtDQUErQztJQUUvQyxPQUFPO1FBQ0wsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBRWhCLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ2xCLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO1NBQzlCO0lBQ0gsQ0FBQzs7O1lBMUJGLFNBQVMsU0FBQztnQkFDVCxRQUFRLEVBQUUsdUJBQXVCO2dCQUNqQyxRQUFRLEVBQUUscUJBQXFCO2dCQUMvQixJQUFJLEVBQUU7b0JBQ0osTUFBTSxFQUFFLFFBQVE7b0JBQ2hCLE1BQU0sRUFBRSxrQkFBa0I7b0JBQzFCLHFCQUFxQixFQUFFLGlCQUFpQjtvQkFDeEMsc0JBQXNCLEVBQUUsa0JBQWtCO2lCQUMzQztnQkFDRCxTQUFTLEVBQUU7b0JBQ1QsRUFBQyxPQUFPLEVBQUUscUJBQXFCLEVBQUUsV0FBVyxFQUFFLG1CQUFtQixFQUFDO29CQUNsRSxFQUFDLE9BQU8sRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLHFCQUFxQixFQUFDO2lCQUMzRDthQUNGOzs7c0JBTUUsWUFBWSxTQUFDLE9BQU8iLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtEaXJlY3RpdmUsIEhvc3RMaXN0ZW5lcn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0Nka01lbnVJdGVtU2VsZWN0YWJsZX0gZnJvbSAnLi9tZW51LWl0ZW0tc2VsZWN0YWJsZSc7XG5pbXBvcnQge0Nka01lbnVJdGVtfSBmcm9tICcuL21lbnUtaXRlbSc7XG5cbi8qKlxuICogQSBkaXJlY3RpdmUgcHJvdmlkaW5nIGJlaGF2aW9yIGZvciB0aGUgXCJtZW51aXRlbWNoZWNrYm94XCIgQVJJQSByb2xlLCB3aGljaCBiZWhhdmVzIHNpbWlsYXJseSB0byBhXG4gKiBjb252ZW50aW9uYWwgY2hlY2tib3guXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tjZGtNZW51SXRlbUNoZWNrYm94XScsXG4gIGV4cG9ydEFzOiAnY2RrTWVudUl0ZW1DaGVja2JveCcsXG4gIGhvc3Q6IHtcbiAgICAndHlwZSc6ICdidXR0b24nLFxuICAgICdyb2xlJzogJ21lbnVpdGVtY2hlY2tib3gnLFxuICAgICdbYXR0ci5hcmlhLWNoZWNrZWRdJzogJ2NoZWNrZWQgfHwgbnVsbCcsXG4gICAgJ1thdHRyLmFyaWEtZGlzYWJsZWRdJzogJ2Rpc2FibGVkIHx8IG51bGwnLFxuICB9LFxuICBwcm92aWRlcnM6IFtcbiAgICB7cHJvdmlkZTogQ2RrTWVudUl0ZW1TZWxlY3RhYmxlLCB1c2VFeGlzdGluZzogQ2RrTWVudUl0ZW1DaGVja2JveH0sXG4gICAge3Byb3ZpZGU6IENka01lbnVJdGVtLCB1c2VFeGlzdGluZzogQ2RrTWVudUl0ZW1TZWxlY3RhYmxlfSxcbiAgXSxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrTWVudUl0ZW1DaGVja2JveCBleHRlbmRzIENka01lbnVJdGVtU2VsZWN0YWJsZSB7XG4gIC8vIEluIEl2eSB0aGUgYGhvc3RgIG1ldGFkYXRhIHdpbGwgYmUgbWVyZ2VkLCB3aGVyZWFzIGluIFZpZXdFbmdpbmUgaXQgaXMgb3ZlcnJpZGRlbi4gSW4gb3JkZXJcbiAgLy8gdG8gYXZvaWQgZG91YmxlIGV2ZW50IGxpc3RlbmVycywgd2UgbmVlZCB0byB1c2UgYEhvc3RMaXN0ZW5lcmAuIE9uY2UgSXZ5IGlzIHRoZSBkZWZhdWx0LCB3ZVxuICAvLyBjYW4gbW92ZSB0aGlzIGJhY2sgaW50byBgaG9zdGAuXG4gIC8vIHRzbGludDpkaXNhYmxlOm5vLWhvc3QtZGVjb3JhdG9yLWluLWNvbmNyZXRlXG4gIEBIb3N0TGlzdGVuZXIoJ2NsaWNrJylcbiAgdHJpZ2dlcigpIHtcbiAgICBzdXBlci50cmlnZ2VyKCk7XG5cbiAgICBpZiAoIXRoaXMuZGlzYWJsZWQpIHtcbiAgICAgIHRoaXMuY2hlY2tlZCA9ICF0aGlzLmNoZWNrZWQ7XG4gICAgfVxuICB9XG59XG4iXX0=