/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, ElementRef, Inject, InjectionToken, Input, Optional, } from '@angular/core';
import { CdkComboboxPanel } from './combobox-panel';
import * as i0 from "@angular/core";
import * as i1 from "./combobox-panel";
export const PANEL = new InjectionToken('CdkComboboxPanel');
let nextId = 0;
export class CdkComboboxPopup {
    constructor(_elementRef, _parentPanel) {
        this._elementRef = _elementRef;
        this._parentPanel = _parentPanel;
        this._role = 'dialog';
        this.id = `cdk-combobox-popup-${nextId++}`;
    }
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
    ngOnInit() {
        this.registerWithPanel();
    }
    registerWithPanel() {
        if (this._parentPanel === null || this._parentPanel === undefined) {
            this._explicitPanel._registerContent(this.id, this._role);
        }
        else {
            this._parentPanel._registerContent(this.id, this._role);
        }
    }
    focusFirstElement() {
        if (this._firstFocusElement) {
            this._firstFocusElement.focus();
        }
        else {
            this._elementRef.nativeElement.focus();
        }
    }
}
CdkComboboxPopup.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.3.0", ngImport: i0, type: CdkComboboxPopup, deps: [{ token: i0.ElementRef }, { token: PANEL, optional: true }], target: i0.ɵɵFactoryTarget.Directive });
CdkComboboxPopup.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "13.3.0", type: CdkComboboxPopup, selector: "[cdkComboboxPopup]", inputs: { role: "role", firstFocus: "firstFocus", id: "id", _explicitPanel: ["parentPanel", "_explicitPanel"] }, host: { attributes: { "tabindex": "-1" }, listeners: { "focus": "focusFirstElement()" }, properties: { "attr.role": "role", "id": "id" }, classAttribute: "cdk-combobox-popup" }, exportAs: ["cdkComboboxPopup"], ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.3.0", ngImport: i0, type: CdkComboboxPopup, decorators: [{
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
        }], ctorParameters: function () { return [{ type: i0.ElementRef }, { type: i1.CdkComboboxPanel, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [PANEL]
                }] }]; }, propDecorators: { role: [{
                type: Input
            }], firstFocus: [{
                type: Input
            }], id: [{
                type: Input
            }], _explicitPanel: [{
                type: Input,
                args: ['parentPanel']
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tYm9ib3gtcG9wdXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrLWV4cGVyaW1lbnRhbC9jb21ib2JveC9jb21ib2JveC1wb3B1cC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQ0wsU0FBUyxFQUNULFVBQVUsRUFDVixNQUFNLEVBQ04sY0FBYyxFQUNkLEtBQUssRUFFTCxRQUFRLEdBQ1QsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFvQixnQkFBZ0IsRUFBQyxNQUFNLGtCQUFrQixDQUFDOzs7QUFFckUsTUFBTSxDQUFDLE1BQU0sS0FBSyxHQUFHLElBQUksY0FBYyxDQUFtQixrQkFBa0IsQ0FBQyxDQUFDO0FBRTlFLElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQztBQWFmLE1BQU0sT0FBTyxnQkFBZ0I7SUF1QjNCLFlBQ21CLFdBQW9DLEVBQ2pCLFlBQWtDO1FBRHJELGdCQUFXLEdBQVgsV0FBVyxDQUF5QjtRQUNqQixpQkFBWSxHQUFaLFlBQVksQ0FBc0I7UUFqQmhFLFVBQUssR0FBc0IsUUFBUSxDQUFDO1FBV25DLE9BQUUsR0FBRyxzQkFBc0IsTUFBTSxFQUFFLEVBQUUsQ0FBQztJQU81QyxDQUFDO0lBekJKLElBQ0ksSUFBSTtRQUNOLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQztJQUNwQixDQUFDO0lBQ0QsSUFBSSxJQUFJLENBQUMsS0FBd0I7UUFDL0IsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7SUFDckIsQ0FBQztJQUdELElBQ0ksVUFBVTtRQUNaLE9BQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDO0lBQ2pDLENBQUM7SUFDRCxJQUFJLFVBQVUsQ0FBQyxFQUFlO1FBQzVCLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxFQUFFLENBQUM7SUFDL0IsQ0FBQztJQVlELFFBQVE7UUFDTixJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztJQUMzQixDQUFDO0lBRUQsaUJBQWlCO1FBQ2YsSUFBSSxJQUFJLENBQUMsWUFBWSxLQUFLLElBQUksSUFBSSxJQUFJLENBQUMsWUFBWSxLQUFLLFNBQVMsRUFBRTtZQUNqRSxJQUFJLENBQUMsY0FBYyxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQzNEO2FBQU07WUFDTCxJQUFJLENBQUMsWUFBWSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ3pEO0lBQ0gsQ0FBQztJQUVELGlCQUFpQjtRQUNmLElBQUksSUFBSSxDQUFDLGtCQUFrQixFQUFFO1lBQzNCLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLEVBQUUsQ0FBQztTQUNqQzthQUFNO1lBQ0wsSUFBSSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsS0FBSyxFQUFFLENBQUM7U0FDeEM7SUFDSCxDQUFDOzs2R0E5Q1UsZ0JBQWdCLDRDQXlCTCxLQUFLO2lHQXpCaEIsZ0JBQWdCOzJGQUFoQixnQkFBZ0I7a0JBWDVCLFNBQVM7bUJBQUM7b0JBQ1QsUUFBUSxFQUFFLG9CQUFvQjtvQkFDOUIsUUFBUSxFQUFFLGtCQUFrQjtvQkFDNUIsSUFBSSxFQUFFO3dCQUNKLE9BQU8sRUFBRSxvQkFBb0I7d0JBQzdCLGFBQWEsRUFBRSxNQUFNO3dCQUNyQixNQUFNLEVBQUUsSUFBSTt3QkFDWixVQUFVLEVBQUUsSUFBSTt3QkFDaEIsU0FBUyxFQUFFLHFCQUFxQjtxQkFDakM7aUJBQ0Y7OzBCQTBCSSxRQUFROzswQkFBSSxNQUFNOzJCQUFDLEtBQUs7NENBdkJ2QixJQUFJO3NCQURQLEtBQUs7Z0JBVUYsVUFBVTtzQkFEYixLQUFLO2dCQVNHLEVBQUU7c0JBQVYsS0FBSztnQkFFaUMsY0FBYztzQkFBcEQsS0FBSzt1QkFBQyxhQUFhIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7XG4gIERpcmVjdGl2ZSxcbiAgRWxlbWVudFJlZixcbiAgSW5qZWN0LFxuICBJbmplY3Rpb25Ub2tlbixcbiAgSW5wdXQsXG4gIE9uSW5pdCxcbiAgT3B0aW9uYWwsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtBcmlhSGFzUG9wdXBWYWx1ZSwgQ2RrQ29tYm9ib3hQYW5lbH0gZnJvbSAnLi9jb21ib2JveC1wYW5lbCc7XG5cbmV4cG9ydCBjb25zdCBQQU5FTCA9IG5ldyBJbmplY3Rpb25Ub2tlbjxDZGtDb21ib2JveFBhbmVsPignQ2RrQ29tYm9ib3hQYW5lbCcpO1xuXG5sZXQgbmV4dElkID0gMDtcblxuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW2Nka0NvbWJvYm94UG9wdXBdJyxcbiAgZXhwb3J0QXM6ICdjZGtDb21ib2JveFBvcHVwJyxcbiAgaG9zdDoge1xuICAgICdjbGFzcyc6ICdjZGstY29tYm9ib3gtcG9wdXAnLFxuICAgICdbYXR0ci5yb2xlXSc6ICdyb2xlJyxcbiAgICAnW2lkXSc6ICdpZCcsXG4gICAgJ3RhYmluZGV4JzogJy0xJyxcbiAgICAnKGZvY3VzKSc6ICdmb2N1c0ZpcnN0RWxlbWVudCgpJyxcbiAgfSxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrQ29tYm9ib3hQb3B1cDxUID0gdW5rbm93bj4gaW1wbGVtZW50cyBPbkluaXQge1xuICBASW5wdXQoKVxuICBnZXQgcm9sZSgpOiBBcmlhSGFzUG9wdXBWYWx1ZSB7XG4gICAgcmV0dXJuIHRoaXMuX3JvbGU7XG4gIH1cbiAgc2V0IHJvbGUodmFsdWU6IEFyaWFIYXNQb3B1cFZhbHVlKSB7XG4gICAgdGhpcy5fcm9sZSA9IHZhbHVlO1xuICB9XG4gIHByaXZhdGUgX3JvbGU6IEFyaWFIYXNQb3B1cFZhbHVlID0gJ2RpYWxvZyc7XG5cbiAgQElucHV0KClcbiAgZ2V0IGZpcnN0Rm9jdXMoKTogSFRNTEVsZW1lbnQge1xuICAgIHJldHVybiB0aGlzLl9maXJzdEZvY3VzRWxlbWVudDtcbiAgfVxuICBzZXQgZmlyc3RGb2N1cyhpZDogSFRNTEVsZW1lbnQpIHtcbiAgICB0aGlzLl9maXJzdEZvY3VzRWxlbWVudCA9IGlkO1xuICB9XG4gIHByaXZhdGUgX2ZpcnN0Rm9jdXNFbGVtZW50OiBIVE1MRWxlbWVudDtcblxuICBASW5wdXQoKSBpZCA9IGBjZGstY29tYm9ib3gtcG9wdXAtJHtuZXh0SWQrK31gO1xuXG4gIEBJbnB1dCgncGFyZW50UGFuZWwnKSBwcml2YXRlIHJlYWRvbmx5IF9leHBsaWNpdFBhbmVsOiBDZGtDb21ib2JveFBhbmVsO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgcmVhZG9ubHkgX2VsZW1lbnRSZWY6IEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+LFxuICAgIEBPcHRpb25hbCgpIEBJbmplY3QoUEFORUwpIHJlYWRvbmx5IF9wYXJlbnRQYW5lbD86IENka0NvbWJvYm94UGFuZWw8VD4sXG4gICkge31cblxuICBuZ09uSW5pdCgpIHtcbiAgICB0aGlzLnJlZ2lzdGVyV2l0aFBhbmVsKCk7XG4gIH1cblxuICByZWdpc3RlcldpdGhQYW5lbCgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fcGFyZW50UGFuZWwgPT09IG51bGwgfHwgdGhpcy5fcGFyZW50UGFuZWwgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5fZXhwbGljaXRQYW5lbC5fcmVnaXN0ZXJDb250ZW50KHRoaXMuaWQsIHRoaXMuX3JvbGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9wYXJlbnRQYW5lbC5fcmVnaXN0ZXJDb250ZW50KHRoaXMuaWQsIHRoaXMuX3JvbGUpO1xuICAgIH1cbiAgfVxuXG4gIGZvY3VzRmlyc3RFbGVtZW50KCkge1xuICAgIGlmICh0aGlzLl9maXJzdEZvY3VzRWxlbWVudCkge1xuICAgICAgdGhpcy5fZmlyc3RGb2N1c0VsZW1lbnQuZm9jdXMoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LmZvY3VzKCk7XG4gICAgfVxuICB9XG59XG4iXX0=