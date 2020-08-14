/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, Inject, InjectionToken, Input, Optional } from '@angular/core';
import { CdkComboboxPanel } from './combobox-panel';
export const PANEL = new InjectionToken('CdkComboboxPanel');
let nextId = 0;
export class CdkComboboxPopup {
    constructor(_parentPanel) {
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
}
CdkComboboxPopup.decorators = [
    { type: Directive, args: [{
                selector: '[cdkComboboxPopup]',
                exportAs: 'cdkComboboxPopup',
                host: {
                    'class': 'cdk-combobox-popup',
                    '[attr.role]': 'role',
                    '[id]': 'id',
                    'tabindex': '-1'
                }
            },] }
];
CdkComboboxPopup.ctorParameters = () => [
    { type: CdkComboboxPanel, decorators: [{ type: Optional }, { type: Inject, args: [PANEL,] }] }
];
CdkComboboxPopup.propDecorators = {
    role: [{ type: Input }],
    id: [{ type: Input }],
    _explicitPanel: [{ type: Input, args: ['parentPanel',] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tYm9ib3gtcG9wdXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrLWV4cGVyaW1lbnRhbC9jb21ib2JveC9jb21ib2JveC1wb3B1cC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsU0FBUyxFQUFFLE1BQU0sRUFBRSxjQUFjLEVBQUUsS0FBSyxFQUFVLFFBQVEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUN6RixPQUFPLEVBQW9CLGdCQUFnQixFQUFDLE1BQU0sa0JBQWtCLENBQUM7QUFFckUsTUFBTSxDQUFDLE1BQU0sS0FBSyxHQUFHLElBQUksY0FBYyxDQUFtQixrQkFBa0IsQ0FBQyxDQUFDO0FBRTlFLElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQztBQVlmLE1BQU0sT0FBTyxnQkFBZ0I7SUFjM0IsWUFDc0MsWUFBa0M7UUFBbEMsaUJBQVksR0FBWixZQUFZLENBQXNCO1FBUGhFLFVBQUssR0FBc0IsUUFBUSxDQUFDO1FBRW5DLE9BQUUsR0FBRyxzQkFBc0IsTUFBTSxFQUFFLEVBQUUsQ0FBQztJQU0zQyxDQUFDO0lBZkwsSUFDSSxJQUFJO1FBQ04sT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDO0lBQ3BCLENBQUM7SUFDRCxJQUFJLElBQUksQ0FBQyxLQUF3QjtRQUMvQixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztJQUNyQixDQUFDO0lBV0QsUUFBUTtRQUNOLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO0lBQzNCLENBQUM7SUFFRCxpQkFBaUI7UUFDZixJQUFJLElBQUksQ0FBQyxZQUFZLEtBQUssSUFBSSxJQUFJLElBQUksQ0FBQyxZQUFZLEtBQUssU0FBUyxFQUFFO1lBQ2pFLElBQUksQ0FBQyxjQUFjLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDM0Q7YUFBTTtZQUNMLElBQUksQ0FBQyxZQUFZLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDekQ7SUFDSCxDQUFDOzs7WUF0Q0YsU0FBUyxTQUFDO2dCQUNULFFBQVEsRUFBRSxvQkFBb0I7Z0JBQzlCLFFBQVEsRUFBRSxrQkFBa0I7Z0JBQzVCLElBQUksRUFBRTtvQkFDSixPQUFPLEVBQUUsb0JBQW9CO29CQUM3QixhQUFhLEVBQUUsTUFBTTtvQkFDckIsTUFBTSxFQUFFLElBQUk7b0JBQ1osVUFBVSxFQUFFLElBQUk7aUJBQ2pCO2FBQ0Y7OztZQWYwQixnQkFBZ0IsdUJBK0J0QyxRQUFRLFlBQUksTUFBTSxTQUFDLEtBQUs7OzttQkFkMUIsS0FBSztpQkFTTCxLQUFLOzZCQUVMLEtBQUssU0FBQyxhQUFhIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RGlyZWN0aXZlLCBJbmplY3QsIEluamVjdGlvblRva2VuLCBJbnB1dCwgT25Jbml0LCBPcHRpb25hbH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0FyaWFIYXNQb3B1cFZhbHVlLCBDZGtDb21ib2JveFBhbmVsfSBmcm9tICcuL2NvbWJvYm94LXBhbmVsJztcblxuZXhwb3J0IGNvbnN0IFBBTkVMID0gbmV3IEluamVjdGlvblRva2VuPENka0NvbWJvYm94UGFuZWw+KCdDZGtDb21ib2JveFBhbmVsJyk7XG5cbmxldCBuZXh0SWQgPSAwO1xuXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbY2RrQ29tYm9ib3hQb3B1cF0nLFxuICBleHBvcnRBczogJ2Nka0NvbWJvYm94UG9wdXAnLFxuICBob3N0OiB7XG4gICAgJ2NsYXNzJzogJ2Nkay1jb21ib2JveC1wb3B1cCcsXG4gICAgJ1thdHRyLnJvbGVdJzogJ3JvbGUnLFxuICAgICdbaWRdJzogJ2lkJyxcbiAgICAndGFiaW5kZXgnOiAnLTEnXG4gIH1cbn0pXG5leHBvcnQgY2xhc3MgQ2RrQ29tYm9ib3hQb3B1cDxUID0gdW5rbm93bj4gaW1wbGVtZW50cyBPbkluaXQge1xuICBASW5wdXQoKVxuICBnZXQgcm9sZSgpOiBBcmlhSGFzUG9wdXBWYWx1ZSB7XG4gICAgcmV0dXJuIHRoaXMuX3JvbGU7XG4gIH1cbiAgc2V0IHJvbGUodmFsdWU6IEFyaWFIYXNQb3B1cFZhbHVlKSB7XG4gICAgdGhpcy5fcm9sZSA9IHZhbHVlO1xuICB9XG4gIHByaXZhdGUgX3JvbGU6IEFyaWFIYXNQb3B1cFZhbHVlID0gJ2RpYWxvZyc7XG5cbiAgQElucHV0KCkgaWQgPSBgY2RrLWNvbWJvYm94LXBvcHVwLSR7bmV4dElkKyt9YDtcblxuICBASW5wdXQoJ3BhcmVudFBhbmVsJykgcHJpdmF0ZSByZWFkb25seSBfZXhwbGljaXRQYW5lbDogQ2RrQ29tYm9ib3hQYW5lbDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBAT3B0aW9uYWwoKSBASW5qZWN0KFBBTkVMKSByZWFkb25seSBfcGFyZW50UGFuZWw/OiBDZGtDb21ib2JveFBhbmVsPFQ+LFxuICApIHsgfVxuXG4gIG5nT25Jbml0KCkge1xuICAgIHRoaXMucmVnaXN0ZXJXaXRoUGFuZWwoKTtcbiAgfVxuXG4gIHJlZ2lzdGVyV2l0aFBhbmVsKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9wYXJlbnRQYW5lbCA9PT0gbnVsbCB8fCB0aGlzLl9wYXJlbnRQYW5lbCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLl9leHBsaWNpdFBhbmVsLl9yZWdpc3RlckNvbnRlbnQodGhpcy5pZCwgdGhpcy5fcm9sZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3BhcmVudFBhbmVsLl9yZWdpc3RlckNvbnRlbnQodGhpcy5pZCwgdGhpcy5fcm9sZSk7XG4gICAgfVxuICB9XG59XG4iXX0=