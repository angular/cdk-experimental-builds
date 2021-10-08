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
CdkComboboxPanel.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.0-next.15", ngImport: i0, type: CdkComboboxPanel, deps: [{ token: i0.TemplateRef }], target: i0.ɵɵFactoryTarget.Directive });
CdkComboboxPanel.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "13.0.0-next.15", type: CdkComboboxPanel, selector: "ng-template[cdkComboboxPanel]", host: { classAttribute: "cdk-combobox-panel" }, exportAs: ["cdkComboboxPanel"], ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.0-next.15", ngImport: i0, type: CdkComboboxPanel, decorators: [{
            type: Directive,
            args: [{
                    host: {
                        'class': 'cdk-combobox-panel'
                    },
                    selector: 'ng-template[cdkComboboxPanel]',
                    exportAs: 'cdkComboboxPanel',
                }]
        }], ctorParameters: function () { return [{ type: i0.TemplateRef }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tYm9ib3gtcGFuZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrLWV4cGVyaW1lbnRhbC9jb21ib2JveC9jb21ib2JveC1wYW5lbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFVQSxPQUFPLEVBQUMsU0FBUyxFQUFFLFdBQVcsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUNyRCxPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sTUFBTSxDQUFDOztBQVM3QixNQUFNLE9BQU8sZ0JBQWdCO0lBUzNCLFlBQ1csWUFBa0M7UUFBbEMsaUJBQVksR0FBWixZQUFZLENBQXNCO1FBUjdDLGlCQUFZLEdBQXFCLElBQUksT0FBTyxFQUFXLENBQUM7UUFDeEQscUJBQWdCLEdBQW9CLElBQUksT0FBTyxFQUFVLENBQUM7UUFDMUQsdUJBQWtCLEdBQStCLElBQUksT0FBTyxFQUFxQixDQUFDO1FBRWxGLGNBQVMsR0FBVyxFQUFFLENBQUM7SUFLcEIsQ0FBQztJQUVKLHFGQUFxRjtJQUNyRixVQUFVLENBQUMsSUFBYztRQUN2QixJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLENBQUM7SUFDckMsQ0FBQztJQUVELG1GQUFtRjtJQUNuRixZQUFZO1FBQ1Ysc0NBQXNDO1FBQ3RDLFFBQVEsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDO0lBQ25ELENBQUM7SUFFRCxzRUFBc0U7SUFDdEUsZ0JBQWdCLENBQUMsU0FBaUIsRUFBRSxXQUE4QjtRQUNoRSxnRkFBZ0Y7UUFDaEYsSUFBSSxJQUFJLENBQUMsV0FBVyxJQUFJLElBQUksQ0FBQyxXQUFXLEtBQUssV0FBVyxFQUFFO1lBQ3hELE9BQU87U0FDUjtRQUVELElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1FBQzNCLElBQUksV0FBVyxLQUFLLFNBQVMsSUFBSSxXQUFXLEtBQUssUUFBUSxFQUFFO1lBQ3pELE1BQU0sS0FBSyxDQUFDLHFFQUFxRSxDQUFDLENBQUM7U0FDcEY7UUFDRCxJQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQztRQUUvQixJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUMzQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUNqRCxDQUFDOztxSEF2Q1UsZ0JBQWdCO3lHQUFoQixnQkFBZ0I7bUdBQWhCLGdCQUFnQjtrQkFQNUIsU0FBUzttQkFBQztvQkFDVCxJQUFJLEVBQUU7d0JBQ0osT0FBTyxFQUFFLG9CQUFvQjtxQkFDOUI7b0JBQ0QsUUFBUSxFQUFFLCtCQUErQjtvQkFDekMsUUFBUSxFQUFFLGtCQUFrQjtpQkFDN0IiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuZXhwb3J0IHR5cGUgQXJpYUhhc1BvcHVwVmFsdWUgPSAnZmFsc2UnIHwgJ3RydWUnIHwgJ21lbnUnIHwgJ2xpc3Rib3gnIHwgJ3RyZWUnIHwgJ2dyaWQnIHwgJ2RpYWxvZyc7XG5cbmltcG9ydCB7RGlyZWN0aXZlLCBUZW1wbGF0ZVJlZn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge1N1YmplY3R9IGZyb20gJ3J4anMnO1xuXG5ARGlyZWN0aXZlKHtcbiAgaG9zdDoge1xuICAgICdjbGFzcyc6ICdjZGstY29tYm9ib3gtcGFuZWwnXG4gIH0sXG4gIHNlbGVjdG9yOiAnbmctdGVtcGxhdGVbY2RrQ29tYm9ib3hQYW5lbF0nLFxuICBleHBvcnRBczogJ2Nka0NvbWJvYm94UGFuZWwnLFxufSlcbmV4cG9ydCBjbGFzcyBDZGtDb21ib2JveFBhbmVsPFQgPSB1bmtub3duPiB7XG5cbiAgdmFsdWVVcGRhdGVkOiBTdWJqZWN0PFQgfCBUW10+ID0gbmV3IFN1YmplY3Q8VCB8IFRbXT4oKTtcbiAgY29udGVudElkVXBkYXRlZDogU3ViamVjdDxzdHJpbmc+ID0gbmV3IFN1YmplY3Q8c3RyaW5nPigpO1xuICBjb250ZW50VHlwZVVwZGF0ZWQ6IFN1YmplY3Q8QXJpYUhhc1BvcHVwVmFsdWU+ID0gbmV3IFN1YmplY3Q8QXJpYUhhc1BvcHVwVmFsdWU+KCk7XG5cbiAgY29udGVudElkOiBzdHJpbmcgPSAnJztcbiAgY29udGVudFR5cGU6IEFyaWFIYXNQb3B1cFZhbHVlO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHJlYWRvbmx5IF90ZW1wbGF0ZVJlZjogVGVtcGxhdGVSZWY8dW5rbm93bj5cbiAgKSB7fVxuXG4gIC8qKiBUZWxscyB0aGUgcGFyZW50IGNvbWJvYm94IHRvIGNsb3NlIHRoZSBwYW5lbCBhbmQgc2VuZHMgYmFjayB0aGUgY29udGVudCB2YWx1ZS4gKi9cbiAgY2xvc2VQYW5lbChkYXRhPzogVCB8IFRbXSkge1xuICAgIHRoaXMudmFsdWVVcGRhdGVkLm5leHQoZGF0YSB8fCBbXSk7XG4gIH1cblxuICAvLyBUT0RPOiBpbnN0ZWFkIG9mIHVzaW5nIGEgZm9jdXMgZnVuY3Rpb24sIHBvdGVudGlhbGx5IHVzZSBjZGsvYTExeSBmb2N1cyB0cmFwcGluZ1xuICBmb2N1c0NvbnRlbnQoKSB7XG4gICAgLy8gVE9ETzogVXNlIGFuIGluamVjdGVkIGRvY3VtZW50IGhlcmVcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLmNvbnRlbnRJZCk/LmZvY3VzKCk7XG4gIH1cblxuICAvKiogUmVnaXN0ZXJzIHRoZSBjb250ZW50J3MgaWQgYW5kIHRoZSBjb250ZW50IHR5cGUgd2l0aCB0aGUgcGFuZWwuICovXG4gIF9yZWdpc3RlckNvbnRlbnQoY29udGVudElkOiBzdHJpbmcsIGNvbnRlbnRUeXBlOiBBcmlhSGFzUG9wdXBWYWx1ZSkge1xuICAgIC8vIElmIGNvbnRlbnQgaGFzIGFscmVhZHkgYmVlbiByZWdpc3RlcmVkLCBubyBmdXJ0aGVyIGNvbnRlbnRJZHMgYXJlIHJlZ2lzdGVyZWQuXG4gICAgaWYgKHRoaXMuY29udGVudFR5cGUgJiYgdGhpcy5jb250ZW50VHlwZSAhPT0gY29udGVudFR5cGUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLmNvbnRlbnRJZCA9IGNvbnRlbnRJZDtcbiAgICBpZiAoY29udGVudFR5cGUgIT09ICdsaXN0Ym94JyAmJiBjb250ZW50VHlwZSAhPT0gJ2RpYWxvZycpIHtcbiAgICAgIHRocm93IEVycm9yKCdDZGtDb21ib2JveFBhbmVsIGN1cnJlbnRseSBvbmx5IHN1cHBvcnRzIGxpc3Rib3ggb3IgZGlhbG9nIGNvbnRlbnQuJyk7XG4gICAgfVxuICAgIHRoaXMuY29udGVudFR5cGUgPSBjb250ZW50VHlwZTtcblxuICAgIHRoaXMuY29udGVudElkVXBkYXRlZC5uZXh0KHRoaXMuY29udGVudElkKTtcbiAgICB0aGlzLmNvbnRlbnRUeXBlVXBkYXRlZC5uZXh0KHRoaXMuY29udGVudFR5cGUpO1xuICB9XG59XG4iXX0=