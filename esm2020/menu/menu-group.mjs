/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive } from '@angular/core';
import { UniqueSelectionDispatcher } from '@angular/cdk/collections';
import * as i0 from "@angular/core";
/**
 * Directive which acts as a grouping container for `CdkMenuItem` instances with
 * `role="menuitemradio"`, similar to a `role="radiogroup"` element.
 */
export class CdkMenuGroup {
}
CdkMenuGroup.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.0.0-next.9", ngImport: i0, type: CdkMenuGroup, deps: [], target: i0.ɵɵFactoryTarget.Directive });
CdkMenuGroup.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "14.0.0-next.9", type: CdkMenuGroup, selector: "[cdkMenuGroup]", host: { attributes: { "role": "group" }, classAttribute: "cdk-menu-group" }, providers: [{ provide: UniqueSelectionDispatcher, useClass: UniqueSelectionDispatcher }], exportAs: ["cdkMenuGroup"], ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.0.0-next.9", ngImport: i0, type: CdkMenuGroup, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkMenuGroup]',
                    exportAs: 'cdkMenuGroup',
                    host: {
                        'role': 'group',
                        'class': 'cdk-menu-group',
                    },
                    providers: [{ provide: UniqueSelectionDispatcher, useClass: UniqueSelectionDispatcher }],
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1ncm91cC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL21lbnUvbWVudS1ncm91cC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3hDLE9BQU8sRUFBQyx5QkFBeUIsRUFBQyxNQUFNLDBCQUEwQixDQUFDOztBQUVuRTs7O0dBR0c7QUFVSCxNQUFNLE9BQU8sWUFBWTs7Z0hBQVosWUFBWTtvR0FBWixZQUFZLHNIQUZaLENBQUMsRUFBQyxPQUFPLEVBQUUseUJBQXlCLEVBQUUsUUFBUSxFQUFFLHlCQUF5QixFQUFDLENBQUM7a0dBRTNFLFlBQVk7a0JBVHhCLFNBQVM7bUJBQUM7b0JBQ1QsUUFBUSxFQUFFLGdCQUFnQjtvQkFDMUIsUUFBUSxFQUFFLGNBQWM7b0JBQ3hCLElBQUksRUFBRTt3QkFDSixNQUFNLEVBQUUsT0FBTzt3QkFDZixPQUFPLEVBQUUsZ0JBQWdCO3FCQUMxQjtvQkFDRCxTQUFTLEVBQUUsQ0FBQyxFQUFDLE9BQU8sRUFBRSx5QkFBeUIsRUFBRSxRQUFRLEVBQUUseUJBQXlCLEVBQUMsQ0FBQztpQkFDdkYiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtEaXJlY3RpdmV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtVbmlxdWVTZWxlY3Rpb25EaXNwYXRjaGVyfSBmcm9tICdAYW5ndWxhci9jZGsvY29sbGVjdGlvbnMnO1xuXG4vKipcbiAqIERpcmVjdGl2ZSB3aGljaCBhY3RzIGFzIGEgZ3JvdXBpbmcgY29udGFpbmVyIGZvciBgQ2RrTWVudUl0ZW1gIGluc3RhbmNlcyB3aXRoXG4gKiBgcm9sZT1cIm1lbnVpdGVtcmFkaW9cImAsIHNpbWlsYXIgdG8gYSBgcm9sZT1cInJhZGlvZ3JvdXBcImAgZWxlbWVudC5cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW2Nka01lbnVHcm91cF0nLFxuICBleHBvcnRBczogJ2Nka01lbnVHcm91cCcsXG4gIGhvc3Q6IHtcbiAgICAncm9sZSc6ICdncm91cCcsXG4gICAgJ2NsYXNzJzogJ2Nkay1tZW51LWdyb3VwJyxcbiAgfSxcbiAgcHJvdmlkZXJzOiBbe3Byb3ZpZGU6IFVuaXF1ZVNlbGVjdGlvbkRpc3BhdGNoZXIsIHVzZUNsYXNzOiBVbmlxdWVTZWxlY3Rpb25EaXNwYXRjaGVyfV0sXG59KVxuZXhwb3J0IGNsYXNzIENka01lbnVHcm91cCB7fVxuIl19