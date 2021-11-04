/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { Input, Directive, Output, EventEmitter } from '@angular/core';
import { CdkMenuItem } from './menu-item';
import * as i0 from "@angular/core";
/** Counter used to set a unique id and name for a selectable item */
let nextId = 0;
/**
 * Base class providing checked state for MenuItems along with outputting a clicked event when the
 * element is triggered. It provides functionality for selectable elements.
 */
export class CdkMenuItemSelectable extends CdkMenuItem {
    constructor() {
        super(...arguments);
        /** Event emitted when the selectable item is clicked */
        this.toggled = new EventEmitter();
        this._checked = false;
        /** The name of the selectable element with a default value */
        this.name = `cdk-selectable-item-${nextId++}`;
        /** The id of the selectable element with a default value */
        this.id = `cdk-selectable-item-${nextId++}`;
    }
    /** Whether the element is checked */
    get checked() {
        return this._checked;
    }
    set checked(value) {
        this._checked = coerceBooleanProperty(value);
    }
    /** If the element is not disabled emit the click event */
    trigger() {
        if (!this.disabled) {
            this.toggled.next(this);
        }
    }
}
CdkMenuItemSelectable.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.0", ngImport: i0, type: CdkMenuItemSelectable, deps: null, target: i0.ɵɵFactoryTarget.Directive });
CdkMenuItemSelectable.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "13.0.0", type: CdkMenuItemSelectable, inputs: { checked: "checked", name: "name", id: "id" }, outputs: { toggled: "cdkMenuItemToggled" }, usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.0", ngImport: i0, type: CdkMenuItemSelectable, decorators: [{
            type: Directive
        }], propDecorators: { toggled: [{
                type: Output,
                args: ['cdkMenuItemToggled']
            }], checked: [{
                type: Input
            }], name: [{
                type: Input
            }], id: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1pdGVtLXNlbGVjdGFibGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrLWV4cGVyaW1lbnRhbC9tZW51L21lbnUtaXRlbS1zZWxlY3RhYmxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxxQkFBcUIsRUFBZSxNQUFNLHVCQUF1QixDQUFDO0FBQzFFLE9BQU8sRUFBQyxLQUFLLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxZQUFZLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDckUsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLGFBQWEsQ0FBQzs7QUFFeEMscUVBQXFFO0FBQ3JFLElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQztBQUVmOzs7R0FHRztBQUVILE1BQU0sT0FBZ0IscUJBQXNCLFNBQVEsV0FBVztJQUQvRDs7UUFFRSx3REFBd0Q7UUFDakIsWUFBTyxHQUM1QyxJQUFJLFlBQVksRUFBRSxDQUFDO1FBVWIsYUFBUSxHQUFHLEtBQUssQ0FBQztRQUV6Qiw4REFBOEQ7UUFDckQsU0FBSSxHQUFXLHVCQUF1QixNQUFNLEVBQUUsRUFBRSxDQUFDO1FBRTFELDREQUE0RDtRQUNuRCxPQUFFLEdBQVcsdUJBQXVCLE1BQU0sRUFBRSxFQUFFLENBQUM7S0FVekQ7SUF4QkMscUNBQXFDO0lBQ3JDLElBQ0ksT0FBTztRQUNULE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztJQUN2QixDQUFDO0lBQ0QsSUFBSSxPQUFPLENBQUMsS0FBYztRQUN4QixJQUFJLENBQUMsUUFBUSxHQUFHLHFCQUFxQixDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQy9DLENBQUM7SUFTRCwwREFBMEQ7SUFDakQsT0FBTztRQUNkLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ2xCLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3pCO0lBQ0gsQ0FBQzs7a0hBMUJtQixxQkFBcUI7c0dBQXJCLHFCQUFxQjsyRkFBckIscUJBQXFCO2tCQUQxQyxTQUFTOzhCQUcrQixPQUFPO3NCQUE3QyxNQUFNO3VCQUFDLG9CQUFvQjtnQkFLeEIsT0FBTztzQkFEVixLQUFLO2dCQVVHLElBQUk7c0JBQVosS0FBSztnQkFHRyxFQUFFO3NCQUFWLEtBQUsiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtjb2VyY2VCb29sZWFuUHJvcGVydHksIEJvb2xlYW5JbnB1dH0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvZXJjaW9uJztcbmltcG9ydCB7SW5wdXQsIERpcmVjdGl2ZSwgT3V0cHV0LCBFdmVudEVtaXR0ZXJ9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtDZGtNZW51SXRlbX0gZnJvbSAnLi9tZW51LWl0ZW0nO1xuXG4vKiogQ291bnRlciB1c2VkIHRvIHNldCBhIHVuaXF1ZSBpZCBhbmQgbmFtZSBmb3IgYSBzZWxlY3RhYmxlIGl0ZW0gKi9cbmxldCBuZXh0SWQgPSAwO1xuXG4vKipcbiAqIEJhc2UgY2xhc3MgcHJvdmlkaW5nIGNoZWNrZWQgc3RhdGUgZm9yIE1lbnVJdGVtcyBhbG9uZyB3aXRoIG91dHB1dHRpbmcgYSBjbGlja2VkIGV2ZW50IHdoZW4gdGhlXG4gKiBlbGVtZW50IGlzIHRyaWdnZXJlZC4gSXQgcHJvdmlkZXMgZnVuY3Rpb25hbGl0eSBmb3Igc2VsZWN0YWJsZSBlbGVtZW50cy5cbiAqL1xuQERpcmVjdGl2ZSgpXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQ2RrTWVudUl0ZW1TZWxlY3RhYmxlIGV4dGVuZHMgQ2RrTWVudUl0ZW0ge1xuICAvKiogRXZlbnQgZW1pdHRlZCB3aGVuIHRoZSBzZWxlY3RhYmxlIGl0ZW0gaXMgY2xpY2tlZCAqL1xuICBAT3V0cHV0KCdjZGtNZW51SXRlbVRvZ2dsZWQnKSByZWFkb25seSB0b2dnbGVkOiBFdmVudEVtaXR0ZXI8Q2RrTWVudUl0ZW1TZWxlY3RhYmxlPiA9XG4gICAgbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSBlbGVtZW50IGlzIGNoZWNrZWQgKi9cbiAgQElucHV0KClcbiAgZ2V0IGNoZWNrZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2NoZWNrZWQ7XG4gIH1cbiAgc2V0IGNoZWNrZWQodmFsdWU6IGJvb2xlYW4pIHtcbiAgICB0aGlzLl9jaGVja2VkID0gY29lcmNlQm9vbGVhblByb3BlcnR5KHZhbHVlKTtcbiAgfVxuICBwcml2YXRlIF9jaGVja2VkID0gZmFsc2U7XG5cbiAgLyoqIFRoZSBuYW1lIG9mIHRoZSBzZWxlY3RhYmxlIGVsZW1lbnQgd2l0aCBhIGRlZmF1bHQgdmFsdWUgKi9cbiAgQElucHV0KCkgbmFtZTogc3RyaW5nID0gYGNkay1zZWxlY3RhYmxlLWl0ZW0tJHtuZXh0SWQrK31gO1xuXG4gIC8qKiBUaGUgaWQgb2YgdGhlIHNlbGVjdGFibGUgZWxlbWVudCB3aXRoIGEgZGVmYXVsdCB2YWx1ZSAqL1xuICBASW5wdXQoKSBpZDogc3RyaW5nID0gYGNkay1zZWxlY3RhYmxlLWl0ZW0tJHtuZXh0SWQrK31gO1xuXG4gIC8qKiBJZiB0aGUgZWxlbWVudCBpcyBub3QgZGlzYWJsZWQgZW1pdCB0aGUgY2xpY2sgZXZlbnQgKi9cbiAgb3ZlcnJpZGUgdHJpZ2dlcigpIHtcbiAgICBpZiAoIXRoaXMuZGlzYWJsZWQpIHtcbiAgICAgIHRoaXMudG9nZ2xlZC5uZXh0KHRoaXMpO1xuICAgIH1cbiAgfVxuXG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9jaGVja2VkOiBCb29sZWFuSW5wdXQ7XG59XG4iXX0=