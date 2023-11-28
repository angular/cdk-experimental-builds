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
export class CdkComboboxPopup {
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.0.0", ngImport: i0, type: CdkComboboxPopup, deps: [{ token: i0.ElementRef }, { token: CDK_COMBOBOX }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "17.0.0", type: CdkComboboxPopup, isStandalone: true, selector: "[cdkComboboxPopup]", inputs: { role: "role", firstFocus: "firstFocus", id: "id" }, host: { attributes: { "tabindex": "-1" }, listeners: { "focus": "focusFirstElement()" }, properties: { "attr.role": "role", "id": "id" }, classAttribute: "cdk-combobox-popup" }, exportAs: ["cdkComboboxPopup"], ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.0.0", ngImport: i0, type: CdkComboboxPopup, decorators: [{
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
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: i1.CdkCombobox, decorators: [{
                    type: Inject,
                    args: [CDK_COMBOBOX]
                }] }], propDecorators: { role: [{
                type: Input
            }], firstFocus: [{
                type: Input
            }], id: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tYm9ib3gtcG9wdXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrLWV4cGVyaW1lbnRhbC9jb21ib2JveC9jb21ib2JveC1wb3B1cC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsU0FBUyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFTLE1BQU0sZUFBZSxDQUFDO0FBQzNFLE9BQU8sRUFBb0IsWUFBWSxFQUFFLFdBQVcsRUFBQyxNQUFNLFlBQVksQ0FBQzs7O0FBRXhFLElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQztBQWNmLE1BQU0sT0FBTyxnQkFBZ0I7SUFDM0IsSUFDSSxJQUFJO1FBQ04sT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDO0lBQ3BCLENBQUM7SUFDRCxJQUFJLElBQUksQ0FBQyxLQUF3QjtRQUMvQixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztJQUNyQixDQUFDO0lBR0QsSUFDSSxVQUFVO1FBQ1osT0FBTyxJQUFJLENBQUMsa0JBQWtCLENBQUM7SUFDakMsQ0FBQztJQUNELElBQUksVUFBVSxDQUFDLEVBQWU7UUFDNUIsSUFBSSxDQUFDLGtCQUFrQixHQUFHLEVBQUUsQ0FBQztJQUMvQixDQUFDO0lBS0QsWUFDbUIsV0FBb0MsRUFDZCxTQUFzQjtRQUQ1QyxnQkFBVyxHQUFYLFdBQVcsQ0FBeUI7UUFDZCxjQUFTLEdBQVQsU0FBUyxDQUFhO1FBZnZELFVBQUssR0FBc0IsUUFBUSxDQUFDO1FBV25DLE9BQUUsR0FBRyxzQkFBc0IsTUFBTSxFQUFFLEVBQUUsQ0FBQztJQUs1QyxDQUFDO0lBRUosUUFBUTtRQUNOLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO0lBQzNCLENBQUM7SUFFRCxpQkFBaUI7UUFDZixJQUFJLENBQUMsU0FBUyxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3ZELENBQUM7SUFFRCxpQkFBaUI7UUFDZixJQUFJLElBQUksQ0FBQyxrQkFBa0IsRUFBRTtZQUMzQixJQUFJLENBQUMsa0JBQWtCLENBQUMsS0FBSyxFQUFFLENBQUM7U0FDakM7YUFBTTtZQUNMLElBQUksQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRSxDQUFDO1NBQ3hDO0lBQ0gsQ0FBQzs4R0F4Q1UsZ0JBQWdCLDRDQXVCakIsWUFBWTtrR0F2QlgsZ0JBQWdCOzsyRkFBaEIsZ0JBQWdCO2tCQVo1QixTQUFTO21CQUFDO29CQUNULFFBQVEsRUFBRSxvQkFBb0I7b0JBQzlCLFFBQVEsRUFBRSxrQkFBa0I7b0JBQzVCLElBQUksRUFBRTt3QkFDSixPQUFPLEVBQUUsb0JBQW9CO3dCQUM3QixhQUFhLEVBQUUsTUFBTTt3QkFDckIsTUFBTSxFQUFFLElBQUk7d0JBQ1osVUFBVSxFQUFFLElBQUk7d0JBQ2hCLFNBQVMsRUFBRSxxQkFBcUI7cUJBQ2pDO29CQUNELFVBQVUsRUFBRSxJQUFJO2lCQUNqQjs7MEJBd0JJLE1BQU07MkJBQUMsWUFBWTt5Q0FyQmxCLElBQUk7c0JBRFAsS0FBSztnQkFVRixVQUFVO3NCQURiLEtBQUs7Z0JBU0csRUFBRTtzQkFBVixLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RGlyZWN0aXZlLCBFbGVtZW50UmVmLCBJbmplY3QsIElucHV0LCBPbkluaXR9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtBcmlhSGFzUG9wdXBWYWx1ZSwgQ0RLX0NPTUJPQk9YLCBDZGtDb21ib2JveH0gZnJvbSAnLi9jb21ib2JveCc7XG5cbmxldCBuZXh0SWQgPSAwO1xuXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbY2RrQ29tYm9ib3hQb3B1cF0nLFxuICBleHBvcnRBczogJ2Nka0NvbWJvYm94UG9wdXAnLFxuICBob3N0OiB7XG4gICAgJ2NsYXNzJzogJ2Nkay1jb21ib2JveC1wb3B1cCcsXG4gICAgJ1thdHRyLnJvbGVdJzogJ3JvbGUnLFxuICAgICdbaWRdJzogJ2lkJyxcbiAgICAndGFiaW5kZXgnOiAnLTEnLFxuICAgICcoZm9jdXMpJzogJ2ZvY3VzRmlyc3RFbGVtZW50KCknLFxuICB9LFxuICBzdGFuZGFsb25lOiB0cnVlLFxufSlcbmV4cG9ydCBjbGFzcyBDZGtDb21ib2JveFBvcHVwPFQgPSB1bmtub3duPiBpbXBsZW1lbnRzIE9uSW5pdCB7XG4gIEBJbnB1dCgpXG4gIGdldCByb2xlKCk6IEFyaWFIYXNQb3B1cFZhbHVlIHtcbiAgICByZXR1cm4gdGhpcy5fcm9sZTtcbiAgfVxuICBzZXQgcm9sZSh2YWx1ZTogQXJpYUhhc1BvcHVwVmFsdWUpIHtcbiAgICB0aGlzLl9yb2xlID0gdmFsdWU7XG4gIH1cbiAgcHJpdmF0ZSBfcm9sZTogQXJpYUhhc1BvcHVwVmFsdWUgPSAnZGlhbG9nJztcblxuICBASW5wdXQoKVxuICBnZXQgZmlyc3RGb2N1cygpOiBIVE1MRWxlbWVudCB7XG4gICAgcmV0dXJuIHRoaXMuX2ZpcnN0Rm9jdXNFbGVtZW50O1xuICB9XG4gIHNldCBmaXJzdEZvY3VzKGlkOiBIVE1MRWxlbWVudCkge1xuICAgIHRoaXMuX2ZpcnN0Rm9jdXNFbGVtZW50ID0gaWQ7XG4gIH1cbiAgcHJpdmF0ZSBfZmlyc3RGb2N1c0VsZW1lbnQ6IEhUTUxFbGVtZW50O1xuXG4gIEBJbnB1dCgpIGlkID0gYGNkay1jb21ib2JveC1wb3B1cC0ke25leHRJZCsrfWA7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSByZWFkb25seSBfZWxlbWVudFJlZjogRWxlbWVudFJlZjxIVE1MRWxlbWVudD4sXG4gICAgQEluamVjdChDREtfQ09NQk9CT1gpIHByaXZhdGUgcmVhZG9ubHkgX2NvbWJvYm94OiBDZGtDb21ib2JveCxcbiAgKSB7fVxuXG4gIG5nT25Jbml0KCkge1xuICAgIHRoaXMucmVnaXN0ZXJXaXRoUGFuZWwoKTtcbiAgfVxuXG4gIHJlZ2lzdGVyV2l0aFBhbmVsKCk6IHZvaWQge1xuICAgIHRoaXMuX2NvbWJvYm94Ll9yZWdpc3RlckNvbnRlbnQodGhpcy5pZCwgdGhpcy5fcm9sZSk7XG4gIH1cblxuICBmb2N1c0ZpcnN0RWxlbWVudCgpIHtcbiAgICBpZiAodGhpcy5fZmlyc3RGb2N1c0VsZW1lbnQpIHtcbiAgICAgIHRoaXMuX2ZpcnN0Rm9jdXNFbGVtZW50LmZvY3VzKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5mb2N1cygpO1xuICAgIH1cbiAgfVxufVxuIl19