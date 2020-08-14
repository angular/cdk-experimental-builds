/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, TemplateRef } from '@angular/core';
import { Subject } from 'rxjs';
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
        this.valueUpdated.next(data);
    }
    // TODO: instead of using a focus function, potentially use cdk/a11y focus trapping
    focusContent() {
        var _a;
        // TODO: Use an injected document here
        (_a = document.getElementById(this.contentId)) === null || _a === void 0 ? void 0 : _a.focus();
    }
    /** Registers the content's id and the content type with the panel. */
    _registerContent(contentId, contentType) {
        this.contentId = contentId;
        if (contentType !== 'listbox' && contentType !== 'dialog') {
            throw Error('CdkComboboxPanel currently only supports listbox or dialog content.');
        }
        this.contentType = contentType;
        this.contentIdUpdated.next(this.contentId);
        this.contentTypeUpdated.next(this.contentType);
    }
}
CdkComboboxPanel.decorators = [
    { type: Directive, args: [{
                host: {
                    'class': 'cdk-combobox-panel'
                },
                selector: 'ng-template[cdkComboboxPanel]',
                exportAs: 'cdkComboboxPanel',
            },] }
];
CdkComboboxPanel.ctorParameters = () => [
    { type: TemplateRef }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tYm9ib3gtcGFuZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrLWV4cGVyaW1lbnRhbC9jb21ib2JveC9jb21ib2JveC1wYW5lbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFJSCxPQUFPLEVBQUMsU0FBUyxFQUFFLFdBQVcsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUNyRCxPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBUzdCLE1BQU0sT0FBTyxnQkFBZ0I7SUFTM0IsWUFDVyxZQUFrQztRQUFsQyxpQkFBWSxHQUFaLFlBQVksQ0FBc0I7UUFSN0MsaUJBQVksR0FBZSxJQUFJLE9BQU8sRUFBSyxDQUFDO1FBQzVDLHFCQUFnQixHQUFvQixJQUFJLE9BQU8sRUFBVSxDQUFDO1FBQzFELHVCQUFrQixHQUErQixJQUFJLE9BQU8sRUFBcUIsQ0FBQztRQUVsRixjQUFTLEdBQVcsRUFBRSxDQUFDO0lBS3BCLENBQUM7SUFFSixxRkFBcUY7SUFDckYsVUFBVSxDQUFDLElBQVE7UUFDakIsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDL0IsQ0FBQztJQUVELG1GQUFtRjtJQUNuRixZQUFZOztRQUNWLHNDQUFzQztRQUN0QyxNQUFBLFFBQVEsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQywwQ0FBRSxLQUFLLEdBQUc7SUFDbkQsQ0FBQztJQUVELHNFQUFzRTtJQUN0RSxnQkFBZ0IsQ0FBQyxTQUFpQixFQUFFLFdBQThCO1FBQ2hFLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1FBQzNCLElBQUksV0FBVyxLQUFLLFNBQVMsSUFBSSxXQUFXLEtBQUssUUFBUSxFQUFFO1lBQ3pELE1BQU0sS0FBSyxDQUFDLHFFQUFxRSxDQUFDLENBQUM7U0FDcEY7UUFDRCxJQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQztRQUUvQixJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUMzQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUNqRCxDQUFDOzs7WUF6Q0YsU0FBUyxTQUFDO2dCQUNULElBQUksRUFBRTtvQkFDSixPQUFPLEVBQUUsb0JBQW9CO2lCQUM5QjtnQkFDRCxRQUFRLEVBQUUsK0JBQStCO2dCQUN6QyxRQUFRLEVBQUUsa0JBQWtCO2FBQzdCOzs7WUFUa0IsV0FBVyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5leHBvcnQgdHlwZSBBcmlhSGFzUG9wdXBWYWx1ZSA9ICdmYWxzZScgfCAndHJ1ZScgfCAnbWVudScgfCAnbGlzdGJveCcgfCAndHJlZScgfCAnZ3JpZCcgfCAnZGlhbG9nJztcblxuaW1wb3J0IHtEaXJlY3RpdmUsIFRlbXBsYXRlUmVmfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7U3ViamVjdH0gZnJvbSAncnhqcyc7XG5cbkBEaXJlY3RpdmUoe1xuICBob3N0OiB7XG4gICAgJ2NsYXNzJzogJ2Nkay1jb21ib2JveC1wYW5lbCdcbiAgfSxcbiAgc2VsZWN0b3I6ICduZy10ZW1wbGF0ZVtjZGtDb21ib2JveFBhbmVsXScsXG4gIGV4cG9ydEFzOiAnY2RrQ29tYm9ib3hQYW5lbCcsXG59KVxuZXhwb3J0IGNsYXNzIENka0NvbWJvYm94UGFuZWw8VCA9IHVua25vd24+IHtcblxuICB2YWx1ZVVwZGF0ZWQ6IFN1YmplY3Q8VD4gPSBuZXcgU3ViamVjdDxUPigpO1xuICBjb250ZW50SWRVcGRhdGVkOiBTdWJqZWN0PHN0cmluZz4gPSBuZXcgU3ViamVjdDxzdHJpbmc+KCk7XG4gIGNvbnRlbnRUeXBlVXBkYXRlZDogU3ViamVjdDxBcmlhSGFzUG9wdXBWYWx1ZT4gPSBuZXcgU3ViamVjdDxBcmlhSGFzUG9wdXBWYWx1ZT4oKTtcblxuICBjb250ZW50SWQ6IHN0cmluZyA9ICcnO1xuICBjb250ZW50VHlwZTogQXJpYUhhc1BvcHVwVmFsdWU7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcmVhZG9ubHkgX3RlbXBsYXRlUmVmOiBUZW1wbGF0ZVJlZjx1bmtub3duPlxuICApIHt9XG5cbiAgLyoqIFRlbGxzIHRoZSBwYXJlbnQgY29tYm9ib3ggdG8gY2xvc2UgdGhlIHBhbmVsIGFuZCBzZW5kcyBiYWNrIHRoZSBjb250ZW50IHZhbHVlLiAqL1xuICBjbG9zZVBhbmVsKGRhdGE/OiBUKSB7XG4gICAgdGhpcy52YWx1ZVVwZGF0ZWQubmV4dChkYXRhKTtcbiAgfVxuXG4gIC8vIFRPRE86IGluc3RlYWQgb2YgdXNpbmcgYSBmb2N1cyBmdW5jdGlvbiwgcG90ZW50aWFsbHkgdXNlIGNkay9hMTF5IGZvY3VzIHRyYXBwaW5nXG4gIGZvY3VzQ29udGVudCgpIHtcbiAgICAvLyBUT0RPOiBVc2UgYW4gaW5qZWN0ZWQgZG9jdW1lbnQgaGVyZVxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuY29udGVudElkKT8uZm9jdXMoKTtcbiAgfVxuXG4gIC8qKiBSZWdpc3RlcnMgdGhlIGNvbnRlbnQncyBpZCBhbmQgdGhlIGNvbnRlbnQgdHlwZSB3aXRoIHRoZSBwYW5lbC4gKi9cbiAgX3JlZ2lzdGVyQ29udGVudChjb250ZW50SWQ6IHN0cmluZywgY29udGVudFR5cGU6IEFyaWFIYXNQb3B1cFZhbHVlKSB7XG4gICAgdGhpcy5jb250ZW50SWQgPSBjb250ZW50SWQ7XG4gICAgaWYgKGNvbnRlbnRUeXBlICE9PSAnbGlzdGJveCcgJiYgY29udGVudFR5cGUgIT09ICdkaWFsb2cnKSB7XG4gICAgICB0aHJvdyBFcnJvcignQ2RrQ29tYm9ib3hQYW5lbCBjdXJyZW50bHkgb25seSBzdXBwb3J0cyBsaXN0Ym94IG9yIGRpYWxvZyBjb250ZW50LicpO1xuICAgIH1cbiAgICB0aGlzLmNvbnRlbnRUeXBlID0gY29udGVudFR5cGU7XG5cbiAgICB0aGlzLmNvbnRlbnRJZFVwZGF0ZWQubmV4dCh0aGlzLmNvbnRlbnRJZCk7XG4gICAgdGhpcy5jb250ZW50VHlwZVVwZGF0ZWQubmV4dCh0aGlzLmNvbnRlbnRUeXBlKTtcbiAgfVxufVxuIl19