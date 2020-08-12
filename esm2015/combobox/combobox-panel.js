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
    /** Tells the parent combobox to closet he panel and sends back the content value. */
    closePanel(data) {
        this.valueUpdated.next(data);
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
                selector: 'ng-template[cdkComboboxPanel]',
                exportAs: 'cdkComboboxPanel',
            },] }
];
CdkComboboxPanel.ctorParameters = () => [
    { type: TemplateRef }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tYm9ib3gtcGFuZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrLWV4cGVyaW1lbnRhbC9jb21ib2JveC9jb21ib2JveC1wYW5lbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFJSCxPQUFPLEVBQUMsU0FBUyxFQUFFLFdBQVcsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUNyRCxPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBTTdCLE1BQU0sT0FBTyxnQkFBZ0I7SUFTM0IsWUFBcUIsWUFBa0M7UUFBbEMsaUJBQVksR0FBWixZQUFZLENBQXNCO1FBUHZELGlCQUFZLEdBQWUsSUFBSSxPQUFPLEVBQUssQ0FBQztRQUM1QyxxQkFBZ0IsR0FBb0IsSUFBSSxPQUFPLEVBQVUsQ0FBQztRQUMxRCx1QkFBa0IsR0FBK0IsSUFBSSxPQUFPLEVBQXFCLENBQUM7UUFFbEYsY0FBUyxHQUFXLEVBQUUsQ0FBQztJQUdtQyxDQUFDO0lBRTNELHFGQUFxRjtJQUNyRixVQUFVLENBQUMsSUFBUTtRQUNqQixJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMvQixDQUFDO0lBRUQsc0VBQXNFO0lBQ3RFLGdCQUFnQixDQUFDLFNBQWlCLEVBQUUsV0FBOEI7UUFDaEUsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7UUFDM0IsSUFBSSxXQUFXLEtBQUssU0FBUyxJQUFJLFdBQVcsS0FBSyxRQUFRLEVBQUU7WUFDekQsTUFBTSxLQUFLLENBQUMscUVBQXFFLENBQUMsQ0FBQztTQUNwRjtRQUNELElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO1FBRS9CLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzNDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ2pELENBQUM7OztZQTlCRixTQUFTLFNBQUM7Z0JBQ1QsUUFBUSxFQUFFLCtCQUErQjtnQkFDekMsUUFBUSxFQUFFLGtCQUFrQjthQUM3Qjs7O1lBTmtCLFdBQVciLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuZXhwb3J0IHR5cGUgQXJpYUhhc1BvcHVwVmFsdWUgPSAnZmFsc2UnIHwgJ3RydWUnIHwgJ21lbnUnIHwgJ2xpc3Rib3gnIHwgJ3RyZWUnIHwgJ2dyaWQnIHwgJ2RpYWxvZyc7XG5cbmltcG9ydCB7RGlyZWN0aXZlLCBUZW1wbGF0ZVJlZn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge1N1YmplY3R9IGZyb20gJ3J4anMnO1xuXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICduZy10ZW1wbGF0ZVtjZGtDb21ib2JveFBhbmVsXScsXG4gIGV4cG9ydEFzOiAnY2RrQ29tYm9ib3hQYW5lbCcsXG59KVxuZXhwb3J0IGNsYXNzIENka0NvbWJvYm94UGFuZWw8VCA9IHVua25vd24+IHtcblxuICB2YWx1ZVVwZGF0ZWQ6IFN1YmplY3Q8VD4gPSBuZXcgU3ViamVjdDxUPigpO1xuICBjb250ZW50SWRVcGRhdGVkOiBTdWJqZWN0PHN0cmluZz4gPSBuZXcgU3ViamVjdDxzdHJpbmc+KCk7XG4gIGNvbnRlbnRUeXBlVXBkYXRlZDogU3ViamVjdDxBcmlhSGFzUG9wdXBWYWx1ZT4gPSBuZXcgU3ViamVjdDxBcmlhSGFzUG9wdXBWYWx1ZT4oKTtcblxuICBjb250ZW50SWQ6IHN0cmluZyA9ICcnO1xuICBjb250ZW50VHlwZTogQXJpYUhhc1BvcHVwVmFsdWU7XG5cbiAgY29uc3RydWN0b3IocmVhZG9ubHkgX3RlbXBsYXRlUmVmOiBUZW1wbGF0ZVJlZjx1bmtub3duPikge31cblxuICAvKiogVGVsbHMgdGhlIHBhcmVudCBjb21ib2JveCB0byBjbG9zZXQgaGUgcGFuZWwgYW5kIHNlbmRzIGJhY2sgdGhlIGNvbnRlbnQgdmFsdWUuICovXG4gIGNsb3NlUGFuZWwoZGF0YT86IFQpIHtcbiAgICB0aGlzLnZhbHVlVXBkYXRlZC5uZXh0KGRhdGEpO1xuICB9XG5cbiAgLyoqIFJlZ2lzdGVycyB0aGUgY29udGVudCdzIGlkIGFuZCB0aGUgY29udGVudCB0eXBlIHdpdGggdGhlIHBhbmVsLiAqL1xuICBfcmVnaXN0ZXJDb250ZW50KGNvbnRlbnRJZDogc3RyaW5nLCBjb250ZW50VHlwZTogQXJpYUhhc1BvcHVwVmFsdWUpIHtcbiAgICB0aGlzLmNvbnRlbnRJZCA9IGNvbnRlbnRJZDtcbiAgICBpZiAoY29udGVudFR5cGUgIT09ICdsaXN0Ym94JyAmJiBjb250ZW50VHlwZSAhPT0gJ2RpYWxvZycpIHtcbiAgICAgIHRocm93IEVycm9yKCdDZGtDb21ib2JveFBhbmVsIGN1cnJlbnRseSBvbmx5IHN1cHBvcnRzIGxpc3Rib3ggb3IgZGlhbG9nIGNvbnRlbnQuJyk7XG4gICAgfVxuICAgIHRoaXMuY29udGVudFR5cGUgPSBjb250ZW50VHlwZTtcblxuICAgIHRoaXMuY29udGVudElkVXBkYXRlZC5uZXh0KHRoaXMuY29udGVudElkKTtcbiAgICB0aGlzLmNvbnRlbnRUeXBlVXBkYXRlZC5uZXh0KHRoaXMuY29udGVudFR5cGUpO1xuICB9XG59XG4iXX0=