/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, ElementRef, Inject, Input } from '@angular/core';
import { CDK_COMBOBOX, CdkCombobox } from './combobox';
import * as i0 from "@angular/core";
import * as i1 from "./combobox";
let nextId = 0;
class CdkComboboxPopup {
    get role() {
        return this._role;
    }
    set role(value) {
        this._role = value;
    }
    get firstFocus() {
        return this._firstFocusElement;
    }
    set firstFocus(id) {
        this._firstFocusElement = id;
    }
    constructor(_elementRef, _combobox) {
        this._elementRef = _elementRef;
        this._combobox = _combobox;
        this._role = 'dialog';
        this.id = `cdk-combobox-popup-${nextId++}`;
    }
    ngOnInit() {
        this.registerWithPanel();
    }
    registerWithPanel() {
        this._combobox._registerContent(this.id, this._role);
    }
    focusFirstElement() {
        if (this._firstFocusElement) {
            this._firstFocusElement.focus();
        }
        else {
            this._elementRef.nativeElement.focus();
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.0.0", ngImport: i0, type: CdkComboboxPopup, deps: [{ token: i0.ElementRef }, { token: CDK_COMBOBOX }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "16.0.0", type: CdkComboboxPopup, selector: "[cdkComboboxPopup]", inputs: { role: "role", firstFocus: "firstFocus", id: "id" }, host: { attributes: { "tabindex": "-1" }, listeners: { "focus": "focusFirstElement()" }, properties: { "attr.role": "role", "id": "id" }, classAttribute: "cdk-combobox-popup" }, exportAs: ["cdkComboboxPopup"], ngImport: i0 }); }
}
export { CdkComboboxPopup };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.0.0", ngImport: i0, type: CdkComboboxPopup, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkComboboxPopup]',
                    exportAs: 'cdkComboboxPopup',
                    host: {
                        'class': 'cdk-combobox-popup',
                        '[attr.role]': 'role',
                        '[id]': 'id',
                        'tabindex': '-1',
                        '(focus)': 'focusFirstElement()',
                    },
                }]
        }], ctorParameters: function () { return [{ type: i0.ElementRef }, { type: i1.CdkCombobox, decorators: [{
                    type: Inject,
                    args: [CDK_COMBOBOX]
                }] }]; }, propDecorators: { role: [{
                type: Input
            }], firstFocus: [{
                type: Input
            }], id: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tYm9ib3gtcG9wdXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrLWV4cGVyaW1lbnRhbC9jb21ib2JveC9jb21ib2JveC1wb3B1cC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsU0FBUyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFTLE1BQU0sZUFBZSxDQUFDO0FBQzNFLE9BQU8sRUFBb0IsWUFBWSxFQUFFLFdBQVcsRUFBQyxNQUFNLFlBQVksQ0FBQzs7O0FBRXhFLElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQztBQUVmLE1BV2EsZ0JBQWdCO0lBQzNCLElBQ0ksSUFBSTtRQUNOLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQztJQUNwQixDQUFDO0lBQ0QsSUFBSSxJQUFJLENBQUMsS0FBd0I7UUFDL0IsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7SUFDckIsQ0FBQztJQUdELElBQ0ksVUFBVTtRQUNaLE9BQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDO0lBQ2pDLENBQUM7SUFDRCxJQUFJLFVBQVUsQ0FBQyxFQUFlO1FBQzVCLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxFQUFFLENBQUM7SUFDL0IsQ0FBQztJQUtELFlBQ21CLFdBQW9DLEVBQ2QsU0FBc0I7UUFENUMsZ0JBQVcsR0FBWCxXQUFXLENBQXlCO1FBQ2QsY0FBUyxHQUFULFNBQVMsQ0FBYTtRQWZ2RCxVQUFLLEdBQXNCLFFBQVEsQ0FBQztRQVduQyxPQUFFLEdBQUcsc0JBQXNCLE1BQU0sRUFBRSxFQUFFLENBQUM7SUFLNUMsQ0FBQztJQUVKLFFBQVE7UUFDTixJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztJQUMzQixDQUFDO0lBRUQsaUJBQWlCO1FBQ2YsSUFBSSxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUN2RCxDQUFDO0lBRUQsaUJBQWlCO1FBQ2YsSUFBSSxJQUFJLENBQUMsa0JBQWtCLEVBQUU7WUFDM0IsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEtBQUssRUFBRSxDQUFDO1NBQ2pDO2FBQU07WUFDTCxJQUFJLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztTQUN4QztJQUNILENBQUM7OEdBeENVLGdCQUFnQiw0Q0F1QmpCLFlBQVk7a0dBdkJYLGdCQUFnQjs7U0FBaEIsZ0JBQWdCOzJGQUFoQixnQkFBZ0I7a0JBWDVCLFNBQVM7bUJBQUM7b0JBQ1QsUUFBUSxFQUFFLG9CQUFvQjtvQkFDOUIsUUFBUSxFQUFFLGtCQUFrQjtvQkFDNUIsSUFBSSxFQUFFO3dCQUNKLE9BQU8sRUFBRSxvQkFBb0I7d0JBQzdCLGFBQWEsRUFBRSxNQUFNO3dCQUNyQixNQUFNLEVBQUUsSUFBSTt3QkFDWixVQUFVLEVBQUUsSUFBSTt3QkFDaEIsU0FBUyxFQUFFLHFCQUFxQjtxQkFDakM7aUJBQ0Y7OzBCQXdCSSxNQUFNOzJCQUFDLFlBQVk7NENBckJsQixJQUFJO3NCQURQLEtBQUs7Z0JBVUYsVUFBVTtzQkFEYixLQUFLO2dCQVNHLEVBQUU7c0JBQVYsS0FBSyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0RpcmVjdGl2ZSwgRWxlbWVudFJlZiwgSW5qZWN0LCBJbnB1dCwgT25Jbml0fSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7QXJpYUhhc1BvcHVwVmFsdWUsIENES19DT01CT0JPWCwgQ2RrQ29tYm9ib3h9IGZyb20gJy4vY29tYm9ib3gnO1xuXG5sZXQgbmV4dElkID0gMDtcblxuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW2Nka0NvbWJvYm94UG9wdXBdJyxcbiAgZXhwb3J0QXM6ICdjZGtDb21ib2JveFBvcHVwJyxcbiAgaG9zdDoge1xuICAgICdjbGFzcyc6ICdjZGstY29tYm9ib3gtcG9wdXAnLFxuICAgICdbYXR0ci5yb2xlXSc6ICdyb2xlJyxcbiAgICAnW2lkXSc6ICdpZCcsXG4gICAgJ3RhYmluZGV4JzogJy0xJyxcbiAgICAnKGZvY3VzKSc6ICdmb2N1c0ZpcnN0RWxlbWVudCgpJyxcbiAgfSxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrQ29tYm9ib3hQb3B1cDxUID0gdW5rbm93bj4gaW1wbGVtZW50cyBPbkluaXQge1xuICBASW5wdXQoKVxuICBnZXQgcm9sZSgpOiBBcmlhSGFzUG9wdXBWYWx1ZSB7XG4gICAgcmV0dXJuIHRoaXMuX3JvbGU7XG4gIH1cbiAgc2V0IHJvbGUodmFsdWU6IEFyaWFIYXNQb3B1cFZhbHVlKSB7XG4gICAgdGhpcy5fcm9sZSA9IHZhbHVlO1xuICB9XG4gIHByaXZhdGUgX3JvbGU6IEFyaWFIYXNQb3B1cFZhbHVlID0gJ2RpYWxvZyc7XG5cbiAgQElucHV0KClcbiAgZ2V0IGZpcnN0Rm9jdXMoKTogSFRNTEVsZW1lbnQge1xuICAgIHJldHVybiB0aGlzLl9maXJzdEZvY3VzRWxlbWVudDtcbiAgfVxuICBzZXQgZmlyc3RGb2N1cyhpZDogSFRNTEVsZW1lbnQpIHtcbiAgICB0aGlzLl9maXJzdEZvY3VzRWxlbWVudCA9IGlkO1xuICB9XG4gIHByaXZhdGUgX2ZpcnN0Rm9jdXNFbGVtZW50OiBIVE1MRWxlbWVudDtcblxuICBASW5wdXQoKSBpZCA9IGBjZGstY29tYm9ib3gtcG9wdXAtJHtuZXh0SWQrK31gO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgcmVhZG9ubHkgX2VsZW1lbnRSZWY6IEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+LFxuICAgIEBJbmplY3QoQ0RLX0NPTUJPQk9YKSBwcml2YXRlIHJlYWRvbmx5IF9jb21ib2JveDogQ2RrQ29tYm9ib3gsXG4gICkge31cblxuICBuZ09uSW5pdCgpIHtcbiAgICB0aGlzLnJlZ2lzdGVyV2l0aFBhbmVsKCk7XG4gIH1cblxuICByZWdpc3RlcldpdGhQYW5lbCgpOiB2b2lkIHtcbiAgICB0aGlzLl9jb21ib2JveC5fcmVnaXN0ZXJDb250ZW50KHRoaXMuaWQsIHRoaXMuX3JvbGUpO1xuICB9XG5cbiAgZm9jdXNGaXJzdEVsZW1lbnQoKSB7XG4gICAgaWYgKHRoaXMuX2ZpcnN0Rm9jdXNFbGVtZW50KSB7XG4gICAgICB0aGlzLl9maXJzdEZvY3VzRWxlbWVudC5mb2N1cygpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQuZm9jdXMoKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==