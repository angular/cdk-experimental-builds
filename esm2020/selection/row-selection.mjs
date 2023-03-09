/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { coerceNumberProperty } from '@angular/cdk/coercion';
import { Directive, Input } from '@angular/core';
import { CdkSelection } from './selection';
import * as i0 from "@angular/core";
import * as i1 from "./selection";
/**
 * Applies `cdk-selected` class and `aria-selected` to an element.
 *
 * Must be used within a parent `CdkSelection` directive.
 * Must be provided with the value. The index is required if `trackBy` is used on the `CdkSelection`
 * directive.
 */
class CdkRowSelection {
    get index() {
        return this._index;
    }
    set index(index) {
        this._index = coerceNumberProperty(index);
    }
    constructor(_selection) {
        this._selection = _selection;
    }
}
CdkRowSelection.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.0.0-next.2", ngImport: i0, type: CdkRowSelection, deps: [{ token: i1.CdkSelection }], target: i0.ɵɵFactoryTarget.Directive });
CdkRowSelection.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "16.0.0-next.2", type: CdkRowSelection, selector: "[cdkRowSelection]", inputs: { value: ["cdkRowSelectionValue", "value"], index: ["cdkRowSelectionIndex", "index"] }, host: { properties: { "class.cdk-selected": "_selection.isSelected(this.value, this.index)", "attr.aria-selected": "_selection.isSelected(this.value, this.index)" } }, ngImport: i0 });
export { CdkRowSelection };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.0.0-next.2", ngImport: i0, type: CdkRowSelection, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkRowSelection]',
                    host: {
                        '[class.cdk-selected]': '_selection.isSelected(this.value, this.index)',
                        '[attr.aria-selected]': '_selection.isSelected(this.value, this.index)',
                    },
                }]
        }], ctorParameters: function () { return [{ type: i1.CdkSelection }]; }, propDecorators: { value: [{
                type: Input,
                args: ['cdkRowSelectionValue']
            }], index: [{
                type: Input,
                args: ['cdkRowSelectionIndex']
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm93LXNlbGVjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL3NlbGVjdGlvbi9yb3ctc2VsZWN0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxvQkFBb0IsRUFBYyxNQUFNLHVCQUF1QixDQUFDO0FBQ3hFLE9BQU8sRUFBQyxTQUFTLEVBQUUsS0FBSyxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRS9DLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxhQUFhLENBQUM7OztBQUV6Qzs7Ozs7O0dBTUc7QUFDSCxNQU9hLGVBQWU7SUFHMUIsSUFDSSxLQUFLO1FBQ1AsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDO0lBQ3JCLENBQUM7SUFDRCxJQUFJLEtBQUssQ0FBQyxLQUFrQjtRQUMxQixJQUFJLENBQUMsTUFBTSxHQUFHLG9CQUFvQixDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzVDLENBQUM7SUFHRCxZQUFxQixVQUEyQjtRQUEzQixlQUFVLEdBQVYsVUFBVSxDQUFpQjtJQUFHLENBQUM7O21IQVp6QyxlQUFlO3VHQUFmLGVBQWU7U0FBZixlQUFlO2tHQUFmLGVBQWU7a0JBUDNCLFNBQVM7bUJBQUM7b0JBQ1QsUUFBUSxFQUFFLG1CQUFtQjtvQkFDN0IsSUFBSSxFQUFFO3dCQUNKLHNCQUFzQixFQUFFLCtDQUErQzt3QkFDdkUsc0JBQXNCLEVBQUUsK0NBQStDO3FCQUN4RTtpQkFDRjttR0FFZ0MsS0FBSztzQkFBbkMsS0FBSzt1QkFBQyxzQkFBc0I7Z0JBR3pCLEtBQUs7c0JBRFIsS0FBSzt1QkFBQyxzQkFBc0IiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtjb2VyY2VOdW1iZXJQcm9wZXJ0eSwgTnVtYmVySW5wdXR9IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2VyY2lvbic7XG5pbXBvcnQge0RpcmVjdGl2ZSwgSW5wdXR9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge0Nka1NlbGVjdGlvbn0gZnJvbSAnLi9zZWxlY3Rpb24nO1xuXG4vKipcbiAqIEFwcGxpZXMgYGNkay1zZWxlY3RlZGAgY2xhc3MgYW5kIGBhcmlhLXNlbGVjdGVkYCB0byBhbiBlbGVtZW50LlxuICpcbiAqIE11c3QgYmUgdXNlZCB3aXRoaW4gYSBwYXJlbnQgYENka1NlbGVjdGlvbmAgZGlyZWN0aXZlLlxuICogTXVzdCBiZSBwcm92aWRlZCB3aXRoIHRoZSB2YWx1ZS4gVGhlIGluZGV4IGlzIHJlcXVpcmVkIGlmIGB0cmFja0J5YCBpcyB1c2VkIG9uIHRoZSBgQ2RrU2VsZWN0aW9uYFxuICogZGlyZWN0aXZlLlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbY2RrUm93U2VsZWN0aW9uXScsXG4gIGhvc3Q6IHtcbiAgICAnW2NsYXNzLmNkay1zZWxlY3RlZF0nOiAnX3NlbGVjdGlvbi5pc1NlbGVjdGVkKHRoaXMudmFsdWUsIHRoaXMuaW5kZXgpJyxcbiAgICAnW2F0dHIuYXJpYS1zZWxlY3RlZF0nOiAnX3NlbGVjdGlvbi5pc1NlbGVjdGVkKHRoaXMudmFsdWUsIHRoaXMuaW5kZXgpJyxcbiAgfSxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrUm93U2VsZWN0aW9uPFQ+IHtcbiAgQElucHV0KCdjZGtSb3dTZWxlY3Rpb25WYWx1ZScpIHZhbHVlOiBUO1xuXG4gIEBJbnB1dCgnY2RrUm93U2VsZWN0aW9uSW5kZXgnKVxuICBnZXQgaW5kZXgoKTogbnVtYmVyIHwgdW5kZWZpbmVkIHtcbiAgICByZXR1cm4gdGhpcy5faW5kZXg7XG4gIH1cbiAgc2V0IGluZGV4KGluZGV4OiBOdW1iZXJJbnB1dCkge1xuICAgIHRoaXMuX2luZGV4ID0gY29lcmNlTnVtYmVyUHJvcGVydHkoaW5kZXgpO1xuICB9XG4gIHByb3RlY3RlZCBfaW5kZXg/OiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3IocmVhZG9ubHkgX3NlbGVjdGlvbjogQ2RrU2VsZWN0aW9uPFQ+KSB7fVxufVxuIl19