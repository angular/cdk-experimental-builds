import { Directive, TemplateRef } from '@angular/core';
import { Subject } from 'rxjs';
import * as i0 from "@angular/core";
export class CdkComboboxPanel {
    constructor(_templateRef) {
        this._templateRef = _templateRef;
        this.valueUpdated = new Subject();
        this.contentIdUpdated = new Subject();
        this.contentTypeUpdated = new Subject();
        this.contentId = '';
    }
    /** Tells the parent combobox to close the panel and sends back the content value. */
    closePanel(data) {
        this.valueUpdated.next(data || []);
    }
    // TODO: instead of using a focus function, potentially use cdk/a11y focus trapping
    focusContent() {
        // TODO: Use an injected document here
        document.getElementById(this.contentId)?.focus();
    }
    /** Registers the content's id and the content type with the panel. */
    _registerContent(contentId, contentType) {
        // If content has already been registered, no further contentIds are registered.
        if (this.contentType && this.contentType !== contentType) {
            return;
        }
        this.contentId = contentId;
        if (contentType !== 'listbox' && contentType !== 'dialog') {
            throw Error('CdkComboboxPanel currently only supports listbox or dialog content.');
        }
        this.contentType = contentType;
        this.contentIdUpdated.next(this.contentId);
        this.contentTypeUpdated.next(this.contentType);
    }
}
CdkComboboxPanel.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.3.0", ngImport: i0, type: CdkComboboxPanel, deps: [{ token: i0.TemplateRef }], target: i0.ɵɵFactoryTarget.Directive });
CdkComboboxPanel.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "13.3.0", type: CdkComboboxPanel, selector: "ng-template[cdkComboboxPanel]", host: { classAttribute: "cdk-combobox-panel" }, exportAs: ["cdkComboboxPanel"], ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.3.0", ngImport: i0, type: CdkComboboxPanel, decorators: [{
            type: Directive,
            args: [{
                    host: {
                        'class': 'cdk-combobox-panel',
                    },
                    selector: 'ng-template[cdkComboboxPanel]',
                    exportAs: 'cdkComboboxPanel',
                }]
        }], ctorParameters: function () { return [{ type: i0.TemplateRef }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tYm9ib3gtcGFuZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrLWV4cGVyaW1lbnRhbC9jb21ib2JveC9jb21ib2JveC1wYW5lbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFVQSxPQUFPLEVBQUMsU0FBUyxFQUFFLFdBQVcsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUNyRCxPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sTUFBTSxDQUFDOztBQVM3QixNQUFNLE9BQU8sZ0JBQWdCO0lBUTNCLFlBQXFCLFlBQWtDO1FBQWxDLGlCQUFZLEdBQVosWUFBWSxDQUFzQjtRQVB2RCxpQkFBWSxHQUFxQixJQUFJLE9BQU8sRUFBVyxDQUFDO1FBQ3hELHFCQUFnQixHQUFvQixJQUFJLE9BQU8sRUFBVSxDQUFDO1FBQzFELHVCQUFrQixHQUErQixJQUFJLE9BQU8sRUFBcUIsQ0FBQztRQUVsRixjQUFTLEdBQVcsRUFBRSxDQUFDO0lBR21DLENBQUM7SUFFM0QscUZBQXFGO0lBQ3JGLFVBQVUsQ0FBQyxJQUFjO1FBQ3ZCLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxFQUFFLENBQUMsQ0FBQztJQUNyQyxDQUFDO0lBRUQsbUZBQW1GO0lBQ25GLFlBQVk7UUFDVixzQ0FBc0M7UUFDdEMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUM7SUFDbkQsQ0FBQztJQUVELHNFQUFzRTtJQUN0RSxnQkFBZ0IsQ0FBQyxTQUFpQixFQUFFLFdBQThCO1FBQ2hFLGdGQUFnRjtRQUNoRixJQUFJLElBQUksQ0FBQyxXQUFXLElBQUksSUFBSSxDQUFDLFdBQVcsS0FBSyxXQUFXLEVBQUU7WUFDeEQsT0FBTztTQUNSO1FBRUQsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7UUFDM0IsSUFBSSxXQUFXLEtBQUssU0FBUyxJQUFJLFdBQVcsS0FBSyxRQUFRLEVBQUU7WUFDekQsTUFBTSxLQUFLLENBQUMscUVBQXFFLENBQUMsQ0FBQztTQUNwRjtRQUNELElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO1FBRS9CLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzNDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ2pELENBQUM7OzZHQXBDVSxnQkFBZ0I7aUdBQWhCLGdCQUFnQjsyRkFBaEIsZ0JBQWdCO2tCQVA1QixTQUFTO21CQUFDO29CQUNULElBQUksRUFBRTt3QkFDSixPQUFPLEVBQUUsb0JBQW9CO3FCQUM5QjtvQkFDRCxRQUFRLEVBQUUsK0JBQStCO29CQUN6QyxRQUFRLEVBQUUsa0JBQWtCO2lCQUM3QiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5leHBvcnQgdHlwZSBBcmlhSGFzUG9wdXBWYWx1ZSA9ICdmYWxzZScgfCAndHJ1ZScgfCAnbWVudScgfCAnbGlzdGJveCcgfCAndHJlZScgfCAnZ3JpZCcgfCAnZGlhbG9nJztcblxuaW1wb3J0IHtEaXJlY3RpdmUsIFRlbXBsYXRlUmVmfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7U3ViamVjdH0gZnJvbSAncnhqcyc7XG5cbkBEaXJlY3RpdmUoe1xuICBob3N0OiB7XG4gICAgJ2NsYXNzJzogJ2Nkay1jb21ib2JveC1wYW5lbCcsXG4gIH0sXG4gIHNlbGVjdG9yOiAnbmctdGVtcGxhdGVbY2RrQ29tYm9ib3hQYW5lbF0nLFxuICBleHBvcnRBczogJ2Nka0NvbWJvYm94UGFuZWwnLFxufSlcbmV4cG9ydCBjbGFzcyBDZGtDb21ib2JveFBhbmVsPFQgPSB1bmtub3duPiB7XG4gIHZhbHVlVXBkYXRlZDogU3ViamVjdDxUIHwgVFtdPiA9IG5ldyBTdWJqZWN0PFQgfCBUW10+KCk7XG4gIGNvbnRlbnRJZFVwZGF0ZWQ6IFN1YmplY3Q8c3RyaW5nPiA9IG5ldyBTdWJqZWN0PHN0cmluZz4oKTtcbiAgY29udGVudFR5cGVVcGRhdGVkOiBTdWJqZWN0PEFyaWFIYXNQb3B1cFZhbHVlPiA9IG5ldyBTdWJqZWN0PEFyaWFIYXNQb3B1cFZhbHVlPigpO1xuXG4gIGNvbnRlbnRJZDogc3RyaW5nID0gJyc7XG4gIGNvbnRlbnRUeXBlOiBBcmlhSGFzUG9wdXBWYWx1ZTtcblxuICBjb25zdHJ1Y3RvcihyZWFkb25seSBfdGVtcGxhdGVSZWY6IFRlbXBsYXRlUmVmPHVua25vd24+KSB7fVxuXG4gIC8qKiBUZWxscyB0aGUgcGFyZW50IGNvbWJvYm94IHRvIGNsb3NlIHRoZSBwYW5lbCBhbmQgc2VuZHMgYmFjayB0aGUgY29udGVudCB2YWx1ZS4gKi9cbiAgY2xvc2VQYW5lbChkYXRhPzogVCB8IFRbXSkge1xuICAgIHRoaXMudmFsdWVVcGRhdGVkLm5leHQoZGF0YSB8fCBbXSk7XG4gIH1cblxuICAvLyBUT0RPOiBpbnN0ZWFkIG9mIHVzaW5nIGEgZm9jdXMgZnVuY3Rpb24sIHBvdGVudGlhbGx5IHVzZSBjZGsvYTExeSBmb2N1cyB0cmFwcGluZ1xuICBmb2N1c0NvbnRlbnQoKSB7XG4gICAgLy8gVE9ETzogVXNlIGFuIGluamVjdGVkIGRvY3VtZW50IGhlcmVcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLmNvbnRlbnRJZCk/LmZvY3VzKCk7XG4gIH1cblxuICAvKiogUmVnaXN0ZXJzIHRoZSBjb250ZW50J3MgaWQgYW5kIHRoZSBjb250ZW50IHR5cGUgd2l0aCB0aGUgcGFuZWwuICovXG4gIF9yZWdpc3RlckNvbnRlbnQoY29udGVudElkOiBzdHJpbmcsIGNvbnRlbnRUeXBlOiBBcmlhSGFzUG9wdXBWYWx1ZSkge1xuICAgIC8vIElmIGNvbnRlbnQgaGFzIGFscmVhZHkgYmVlbiByZWdpc3RlcmVkLCBubyBmdXJ0aGVyIGNvbnRlbnRJZHMgYXJlIHJlZ2lzdGVyZWQuXG4gICAgaWYgKHRoaXMuY29udGVudFR5cGUgJiYgdGhpcy5jb250ZW50VHlwZSAhPT0gY29udGVudFR5cGUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLmNvbnRlbnRJZCA9IGNvbnRlbnRJZDtcbiAgICBpZiAoY29udGVudFR5cGUgIT09ICdsaXN0Ym94JyAmJiBjb250ZW50VHlwZSAhPT0gJ2RpYWxvZycpIHtcbiAgICAgIHRocm93IEVycm9yKCdDZGtDb21ib2JveFBhbmVsIGN1cnJlbnRseSBvbmx5IHN1cHBvcnRzIGxpc3Rib3ggb3IgZGlhbG9nIGNvbnRlbnQuJyk7XG4gICAgfVxuICAgIHRoaXMuY29udGVudFR5cGUgPSBjb250ZW50VHlwZTtcblxuICAgIHRoaXMuY29udGVudElkVXBkYXRlZC5uZXh0KHRoaXMuY29udGVudElkKTtcbiAgICB0aGlzLmNvbnRlbnRUeXBlVXBkYXRlZC5uZXh0KHRoaXMuY29udGVudFR5cGUpO1xuICB9XG59XG4iXX0=