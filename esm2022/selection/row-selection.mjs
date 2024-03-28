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
export class CdkRowSelection {
    get index() {
        return this._index;
    }
    set index(index) {
        this._index = coerceNumberProperty(index);
    }
    constructor(_selection) {
        this._selection = _selection;
        // We need an initializer here to avoid a TS error.
        this.value = undefined;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.0-next.1", ngImport: i0, type: CdkRowSelection, deps: [{ token: i1.CdkSelection }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.0.0-next.1", type: CdkRowSelection, isStandalone: true, selector: "[cdkRowSelection]", inputs: { value: ["cdkRowSelectionValue", "value"], index: ["cdkRowSelectionIndex", "index"] }, host: { properties: { "class.cdk-selected": "_selection.isSelected(this.value, this.index)", "attr.aria-selected": "_selection.isSelected(this.value, this.index)" } }, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.0-next.1", ngImport: i0, type: CdkRowSelection, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkRowSelection]',
                    host: {
                        '[class.cdk-selected]': '_selection.isSelected(this.value, this.index)',
                        '[attr.aria-selected]': '_selection.isSelected(this.value, this.index)',
                    },
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: i1.CdkSelection }], propDecorators: { value: [{
                type: Input,
                args: ['cdkRowSelectionValue']
            }], index: [{
                type: Input,
                args: ['cdkRowSelectionIndex']
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm93LXNlbGVjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL3NlbGVjdGlvbi9yb3ctc2VsZWN0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxvQkFBb0IsRUFBYyxNQUFNLHVCQUF1QixDQUFDO0FBQ3hFLE9BQU8sRUFBQyxTQUFTLEVBQUUsS0FBSyxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRS9DLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxhQUFhLENBQUM7OztBQUV6Qzs7Ozs7O0dBTUc7QUFTSCxNQUFNLE9BQU8sZUFBZTtJQUkxQixJQUNJLEtBQUs7UUFDUCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUM7SUFDckIsQ0FBQztJQUNELElBQUksS0FBSyxDQUFDLEtBQWtCO1FBQzFCLElBQUksQ0FBQyxNQUFNLEdBQUcsb0JBQW9CLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDNUMsQ0FBQztJQUdELFlBQXFCLFVBQTJCO1FBQTNCLGVBQVUsR0FBVixVQUFVLENBQWlCO1FBWmhELG1EQUFtRDtRQUNwQixVQUFLLEdBQU0sU0FBVSxDQUFDO0lBV0YsQ0FBQztxSEFiekMsZUFBZTt5R0FBZixlQUFlOztrR0FBZixlQUFlO2tCQVIzQixTQUFTO21CQUFDO29CQUNULFFBQVEsRUFBRSxtQkFBbUI7b0JBQzdCLElBQUksRUFBRTt3QkFDSixzQkFBc0IsRUFBRSwrQ0FBK0M7d0JBQ3ZFLHNCQUFzQixFQUFFLCtDQUErQztxQkFDeEU7b0JBQ0QsVUFBVSxFQUFFLElBQUk7aUJBQ2pCO2lGQUdnQyxLQUFLO3NCQUFuQyxLQUFLO3VCQUFDLHNCQUFzQjtnQkFHekIsS0FBSztzQkFEUixLQUFLO3VCQUFDLHNCQUFzQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2NvZXJjZU51bWJlclByb3BlcnR5LCBOdW1iZXJJbnB1dH0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvZXJjaW9uJztcbmltcG9ydCB7RGlyZWN0aXZlLCBJbnB1dH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7Q2RrU2VsZWN0aW9ufSBmcm9tICcuL3NlbGVjdGlvbic7XG5cbi8qKlxuICogQXBwbGllcyBgY2RrLXNlbGVjdGVkYCBjbGFzcyBhbmQgYGFyaWEtc2VsZWN0ZWRgIHRvIGFuIGVsZW1lbnQuXG4gKlxuICogTXVzdCBiZSB1c2VkIHdpdGhpbiBhIHBhcmVudCBgQ2RrU2VsZWN0aW9uYCBkaXJlY3RpdmUuXG4gKiBNdXN0IGJlIHByb3ZpZGVkIHdpdGggdGhlIHZhbHVlLiBUaGUgaW5kZXggaXMgcmVxdWlyZWQgaWYgYHRyYWNrQnlgIGlzIHVzZWQgb24gdGhlIGBDZGtTZWxlY3Rpb25gXG4gKiBkaXJlY3RpdmUuXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tjZGtSb3dTZWxlY3Rpb25dJyxcbiAgaG9zdDoge1xuICAgICdbY2xhc3MuY2RrLXNlbGVjdGVkXSc6ICdfc2VsZWN0aW9uLmlzU2VsZWN0ZWQodGhpcy52YWx1ZSwgdGhpcy5pbmRleCknLFxuICAgICdbYXR0ci5hcmlhLXNlbGVjdGVkXSc6ICdfc2VsZWN0aW9uLmlzU2VsZWN0ZWQodGhpcy52YWx1ZSwgdGhpcy5pbmRleCknLFxuICB9LFxuICBzdGFuZGFsb25lOiB0cnVlLFxufSlcbmV4cG9ydCBjbGFzcyBDZGtSb3dTZWxlY3Rpb248VD4ge1xuICAvLyBXZSBuZWVkIGFuIGluaXRpYWxpemVyIGhlcmUgdG8gYXZvaWQgYSBUUyBlcnJvci5cbiAgQElucHV0KCdjZGtSb3dTZWxlY3Rpb25WYWx1ZScpIHZhbHVlOiBUID0gdW5kZWZpbmVkITtcblxuICBASW5wdXQoJ2Nka1Jvd1NlbGVjdGlvbkluZGV4JylcbiAgZ2V0IGluZGV4KCk6IG51bWJlciB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIHRoaXMuX2luZGV4O1xuICB9XG4gIHNldCBpbmRleChpbmRleDogTnVtYmVySW5wdXQpIHtcbiAgICB0aGlzLl9pbmRleCA9IGNvZXJjZU51bWJlclByb3BlcnR5KGluZGV4KTtcbiAgfVxuICBwcm90ZWN0ZWQgX2luZGV4PzogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKHJlYWRvbmx5IF9zZWxlY3Rpb246IENka1NlbGVjdGlvbjxUPikge31cbn1cbiJdfQ==