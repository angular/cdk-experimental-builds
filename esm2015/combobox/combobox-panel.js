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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tYm9ib3gtcGFuZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrLWV4cGVyaW1lbnRhbC9jb21ib2JveC9jb21ib2JveC1wYW5lbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFJSCxPQUFPLEVBQUMsU0FBUyxFQUFFLFdBQVcsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUNyRCxPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBUzdCLE1BQU0sT0FBTyxnQkFBZ0I7SUFTM0IsWUFDVyxZQUFrQztRQUFsQyxpQkFBWSxHQUFaLFlBQVksQ0FBc0I7UUFSN0MsaUJBQVksR0FBcUIsSUFBSSxPQUFPLEVBQVcsQ0FBQztRQUN4RCxxQkFBZ0IsR0FBb0IsSUFBSSxPQUFPLEVBQVUsQ0FBQztRQUMxRCx1QkFBa0IsR0FBK0IsSUFBSSxPQUFPLEVBQXFCLENBQUM7UUFFbEYsY0FBUyxHQUFXLEVBQUUsQ0FBQztJQUtwQixDQUFDO0lBRUoscUZBQXFGO0lBQ3JGLFVBQVUsQ0FBQyxJQUFjO1FBQ3ZCLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQy9CLENBQUM7SUFFRCxtRkFBbUY7SUFDbkYsWUFBWTs7UUFDVixzQ0FBc0M7UUFDdEMsTUFBQSxRQUFRLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsMENBQUUsS0FBSyxFQUFFLENBQUM7SUFDbkQsQ0FBQztJQUVELHNFQUFzRTtJQUN0RSxnQkFBZ0IsQ0FBQyxTQUFpQixFQUFFLFdBQThCO1FBQ2hFLGdGQUFnRjtRQUNoRixJQUFJLElBQUksQ0FBQyxXQUFXLElBQUksSUFBSSxDQUFDLFdBQVcsS0FBSyxXQUFXLEVBQUU7WUFDeEQsT0FBTztTQUNSO1FBRUQsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7UUFDM0IsSUFBSSxXQUFXLEtBQUssU0FBUyxJQUFJLFdBQVcsS0FBSyxRQUFRLEVBQUU7WUFDekQsTUFBTSxLQUFLLENBQUMscUVBQXFFLENBQUMsQ0FBQztTQUNwRjtRQUNELElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO1FBRS9CLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzNDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ2pELENBQUM7OztZQTlDRixTQUFTLFNBQUM7Z0JBQ1QsSUFBSSxFQUFFO29CQUNKLE9BQU8sRUFBRSxvQkFBb0I7aUJBQzlCO2dCQUNELFFBQVEsRUFBRSwrQkFBK0I7Z0JBQ3pDLFFBQVEsRUFBRSxrQkFBa0I7YUFDN0I7OztZQVRrQixXQUFXIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmV4cG9ydCB0eXBlIEFyaWFIYXNQb3B1cFZhbHVlID0gJ2ZhbHNlJyB8ICd0cnVlJyB8ICdtZW51JyB8ICdsaXN0Ym94JyB8ICd0cmVlJyB8ICdncmlkJyB8ICdkaWFsb2cnO1xuXG5pbXBvcnQge0RpcmVjdGl2ZSwgVGVtcGxhdGVSZWZ9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtTdWJqZWN0fSBmcm9tICdyeGpzJztcblxuQERpcmVjdGl2ZSh7XG4gIGhvc3Q6IHtcbiAgICAnY2xhc3MnOiAnY2RrLWNvbWJvYm94LXBhbmVsJ1xuICB9LFxuICBzZWxlY3RvcjogJ25nLXRlbXBsYXRlW2Nka0NvbWJvYm94UGFuZWxdJyxcbiAgZXhwb3J0QXM6ICdjZGtDb21ib2JveFBhbmVsJyxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrQ29tYm9ib3hQYW5lbDxUID0gdW5rbm93bj4ge1xuXG4gIHZhbHVlVXBkYXRlZDogU3ViamVjdDxUIHwgVFtdPiA9IG5ldyBTdWJqZWN0PFQgfCBUW10+KCk7XG4gIGNvbnRlbnRJZFVwZGF0ZWQ6IFN1YmplY3Q8c3RyaW5nPiA9IG5ldyBTdWJqZWN0PHN0cmluZz4oKTtcbiAgY29udGVudFR5cGVVcGRhdGVkOiBTdWJqZWN0PEFyaWFIYXNQb3B1cFZhbHVlPiA9IG5ldyBTdWJqZWN0PEFyaWFIYXNQb3B1cFZhbHVlPigpO1xuXG4gIGNvbnRlbnRJZDogc3RyaW5nID0gJyc7XG4gIGNvbnRlbnRUeXBlOiBBcmlhSGFzUG9wdXBWYWx1ZTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICByZWFkb25seSBfdGVtcGxhdGVSZWY6IFRlbXBsYXRlUmVmPHVua25vd24+XG4gICkge31cblxuICAvKiogVGVsbHMgdGhlIHBhcmVudCBjb21ib2JveCB0byBjbG9zZSB0aGUgcGFuZWwgYW5kIHNlbmRzIGJhY2sgdGhlIGNvbnRlbnQgdmFsdWUuICovXG4gIGNsb3NlUGFuZWwoZGF0YT86IFQgfCBUW10pIHtcbiAgICB0aGlzLnZhbHVlVXBkYXRlZC5uZXh0KGRhdGEpO1xuICB9XG5cbiAgLy8gVE9ETzogaW5zdGVhZCBvZiB1c2luZyBhIGZvY3VzIGZ1bmN0aW9uLCBwb3RlbnRpYWxseSB1c2UgY2RrL2ExMXkgZm9jdXMgdHJhcHBpbmdcbiAgZm9jdXNDb250ZW50KCkge1xuICAgIC8vIFRPRE86IFVzZSBhbiBpbmplY3RlZCBkb2N1bWVudCBoZXJlXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGhpcy5jb250ZW50SWQpPy5mb2N1cygpO1xuICB9XG5cbiAgLyoqIFJlZ2lzdGVycyB0aGUgY29udGVudCdzIGlkIGFuZCB0aGUgY29udGVudCB0eXBlIHdpdGggdGhlIHBhbmVsLiAqL1xuICBfcmVnaXN0ZXJDb250ZW50KGNvbnRlbnRJZDogc3RyaW5nLCBjb250ZW50VHlwZTogQXJpYUhhc1BvcHVwVmFsdWUpIHtcbiAgICAvLyBJZiBjb250ZW50IGhhcyBhbHJlYWR5IGJlZW4gcmVnaXN0ZXJlZCwgbm8gZnVydGhlciBjb250ZW50SWRzIGFyZSByZWdpc3RlcmVkLlxuICAgIGlmICh0aGlzLmNvbnRlbnRUeXBlICYmIHRoaXMuY29udGVudFR5cGUgIT09IGNvbnRlbnRUeXBlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5jb250ZW50SWQgPSBjb250ZW50SWQ7XG4gICAgaWYgKGNvbnRlbnRUeXBlICE9PSAnbGlzdGJveCcgJiYgY29udGVudFR5cGUgIT09ICdkaWFsb2cnKSB7XG4gICAgICB0aHJvdyBFcnJvcignQ2RrQ29tYm9ib3hQYW5lbCBjdXJyZW50bHkgb25seSBzdXBwb3J0cyBsaXN0Ym94IG9yIGRpYWxvZyBjb250ZW50LicpO1xuICAgIH1cbiAgICB0aGlzLmNvbnRlbnRUeXBlID0gY29udGVudFR5cGU7XG5cbiAgICB0aGlzLmNvbnRlbnRJZFVwZGF0ZWQubmV4dCh0aGlzLmNvbnRlbnRJZCk7XG4gICAgdGhpcy5jb250ZW50VHlwZVVwZGF0ZWQubmV4dCh0aGlzLmNvbnRlbnRUeXBlKTtcbiAgfVxufVxuIl19