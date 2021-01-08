/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, ElementRef, Inject, Optional } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Directionality } from '@angular/cdk/bidi';
import { _getShadowRoot } from '@angular/cdk/platform';
import { STICKY_POSITIONING_LISTENER, } from '@angular/cdk/table';
let nextId = 0;
/**
 * Applies styles to the host element that make its scrollbars match up with
 * the non-sticky scrollable portions of the CdkTable contained within.
 *
 * This visual effect only works in Webkit and Blink based browsers (eg Chrome,
 * Safari, Edge). Other browsers such as Firefox will gracefully degrade to
 * normal scrollbar appearance.
 * Further note: These styles have no effect when the browser is using OS-default
 * scrollbars. The easiest way to force them into custom mode is to specify width
 * and height for the scrollbar and thumb.
 */
export class CdkTableScrollContainer {
    constructor(_elementRef, _document, _directionality) {
        this._elementRef = _elementRef;
        this._document = _document;
        this._directionality = _directionality;
        /** The most recent sticky column size values from the CdkTable. */
        this._startSizes = [];
        this._endSizes = [];
        this._headerSizes = [];
        this._footerSizes = [];
        this._uniqueClassName = `cdk-table-scroll-container-${++nextId}`;
        _elementRef.nativeElement.classList.add(this._uniqueClassName);
    }
    ngOnInit() {
        var _a;
        // Note that we need to look up the root node in ngOnInit, rather than the constructor, because
        // Angular seems to create the element outside the shadow root and then moves it inside, if the
        // node is inside an `ngIf` and a ShadowDom-encapsulated component.
        this._styleRoot = (_a = _getShadowRoot(this._elementRef.nativeElement)) !== null && _a !== void 0 ? _a : this._document.head;
    }
    ngOnDestroy() {
        var _a;
        // TODO: Use remove() once we're off IE11.
        if ((_a = this._styleElement) === null || _a === void 0 ? void 0 : _a.parentNode) {
            this._styleElement.parentNode.removeChild(this._styleElement);
            this._styleElement = undefined;
        }
    }
    stickyColumnsUpdated({ sizes }) {
        this._startSizes = sizes;
        this._updateScrollbar();
    }
    stickyEndColumnsUpdated({ sizes }) {
        this._endSizes = sizes;
        this._updateScrollbar();
    }
    stickyHeaderRowsUpdated({ sizes }) {
        this._headerSizes = sizes;
        this._updateScrollbar();
    }
    stickyFooterRowsUpdated({ sizes }) {
        this._footerSizes = sizes;
        this._updateScrollbar();
    }
    /**
     * Set padding on the scrollbar track based on the sticky states from CdkTable.
     */
    _updateScrollbar() {
        const topMargin = computeMargin(this._headerSizes);
        const bottomMargin = computeMargin(this._footerSizes);
        const startMargin = computeMargin(this._startSizes);
        const endMargin = computeMargin(this._endSizes);
        if (topMargin === 0 && bottomMargin === 0 && startMargin === 0 && endMargin === 0) {
            this._clearCss();
            return;
        }
        const direction = this._directionality ? this._directionality.value : 'ltr';
        const leftMargin = direction === 'rtl' ? endMargin : startMargin;
        const rightMargin = direction === 'rtl' ? startMargin : endMargin;
        this._applyCss(`${topMargin}px ${rightMargin}px ${bottomMargin}px ${leftMargin}px`);
    }
    /** Gets the stylesheet for the scrollbar styles and creates it if need be. */
    _getStyleSheet() {
        if (!this._styleElement) {
            this._styleElement = this._document.createElement('style');
            this._styleRoot.appendChild(this._styleElement);
        }
        return this._styleElement.sheet;
    }
    /** Updates the stylesheet with the specified scrollbar style. */
    _applyCss(value) {
        this._clearCss();
        const selector = `.${this._uniqueClassName}::-webkit-scrollbar-track`;
        this._getStyleSheet().insertRule(`${selector} {margin: ${value}}`, 0);
    }
    _clearCss() {
        const styleSheet = this._getStyleSheet();
        if (styleSheet.cssRules.length > 0) {
            styleSheet.deleteRule(0);
        }
    }
}
CdkTableScrollContainer.decorators = [
    { type: Directive, args: [{
                selector: '[cdkTableScrollContainer]',
                host: {
                    'class': 'cdk-table-scroll-container',
                },
                providers: [
                    { provide: STICKY_POSITIONING_LISTENER, useExisting: CdkTableScrollContainer },
                ],
            },] }
];
CdkTableScrollContainer.ctorParameters = () => [
    { type: ElementRef },
    { type: Document, decorators: [{ type: Inject, args: [DOCUMENT,] }] },
    { type: Directionality, decorators: [{ type: Optional }] }
];
function computeMargin(sizes) {
    let margin = 0;
    for (const size of sizes) {
        if (size == null) {
            break;
        }
        margin += size;
    }
    return margin;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFibGUtc2Nyb2xsLWNvbnRhaW5lci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL3RhYmxlLXNjcm9sbC1jb250YWluZXIvdGFibGUtc2Nyb2xsLWNvbnRhaW5lci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsU0FBUyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQXFCLFFBQVEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUN6RixPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDekMsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQ2pELE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUNyRCxPQUFPLEVBQ0wsMkJBQTJCLEdBSTVCLE1BQU0sb0JBQW9CLENBQUM7QUFFNUIsSUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDO0FBRWY7Ozs7Ozs7Ozs7R0FVRztBQVVILE1BQU0sT0FBTyx1QkFBdUI7SUFZbEMsWUFDcUIsV0FBb0MsRUFDbEIsU0FBbUIsRUFDekIsZUFBZ0M7UUFGNUMsZ0JBQVcsR0FBWCxXQUFXLENBQXlCO1FBQ2xCLGNBQVMsR0FBVCxTQUFTLENBQVU7UUFDekIsb0JBQWUsR0FBZixlQUFlLENBQWlCO1FBVGpFLG1FQUFtRTtRQUMzRCxnQkFBVyxHQUFpQixFQUFFLENBQUM7UUFDL0IsY0FBUyxHQUFpQixFQUFFLENBQUM7UUFDN0IsaUJBQVksR0FBaUIsRUFBRSxDQUFDO1FBQ2hDLGlCQUFZLEdBQWlCLEVBQUUsQ0FBQztRQU10QyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsOEJBQThCLEVBQUUsTUFBTSxFQUFFLENBQUM7UUFDakUsV0FBVyxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBQ2pFLENBQUM7SUFFRCxRQUFROztRQUNOLCtGQUErRjtRQUMvRiwrRkFBK0Y7UUFDL0YsbUVBQW1FO1FBQ25FLElBQUksQ0FBQyxVQUFVLFNBQUcsY0FBYyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDLG1DQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDO0lBQzFGLENBQUM7SUFFRCxXQUFXOztRQUNULDBDQUEwQztRQUMxQyxVQUFJLElBQUksQ0FBQyxhQUFhLDBDQUFFLFVBQVUsRUFBRTtZQUNsQyxJQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQzlELElBQUksQ0FBQyxhQUFhLEdBQUcsU0FBUyxDQUFDO1NBQ2hDO0lBQ0gsQ0FBQztJQUVELG9CQUFvQixDQUFDLEVBQUMsS0FBSyxFQUFlO1FBQ3hDLElBQUksQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO1FBQ3pCLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0lBQzFCLENBQUM7SUFFRCx1QkFBdUIsQ0FBQyxFQUFDLEtBQUssRUFBZTtRQUMzQyxJQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztRQUN2QixJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztJQUMxQixDQUFDO0lBRUQsdUJBQXVCLENBQUMsRUFBQyxLQUFLLEVBQWU7UUFDM0MsSUFBSSxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUM7UUFDMUIsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7SUFDMUIsQ0FBQztJQUVELHVCQUF1QixDQUFDLEVBQUMsS0FBSyxFQUFlO1FBQzNDLElBQUksQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDO1FBQzFCLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0lBQzFCLENBQUM7SUFFRDs7T0FFRztJQUNLLGdCQUFnQjtRQUN0QixNQUFNLFNBQVMsR0FBRyxhQUFhLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ25ELE1BQU0sWUFBWSxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDdEQsTUFBTSxXQUFXLEdBQUcsYUFBYSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUNwRCxNQUFNLFNBQVMsR0FBRyxhQUFhLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBRWhELElBQUksU0FBUyxLQUFLLENBQUMsSUFBSSxZQUFZLEtBQUssQ0FBQyxJQUFJLFdBQVcsS0FBSyxDQUFDLElBQUksU0FBUyxLQUFLLENBQUMsRUFBRTtZQUNqRixJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDakIsT0FBTztTQUNSO1FBRUQsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUM1RSxNQUFNLFVBQVUsR0FBRyxTQUFTLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQztRQUNqRSxNQUFNLFdBQVcsR0FBRyxTQUFTLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztRQUVsRSxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsU0FBUyxNQUFNLFdBQVcsTUFBTSxZQUFZLE1BQU0sVUFBVSxJQUFJLENBQUMsQ0FBQztJQUN0RixDQUFDO0lBRUQsOEVBQThFO0lBQ3RFLGNBQWM7UUFDcEIsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUU7WUFDdkIsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUMzRCxJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7U0FDakQ7UUFFRCxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBc0IsQ0FBQztJQUNuRCxDQUFDO0lBRUQsaUVBQWlFO0lBQ3pELFNBQVMsQ0FBQyxLQUFhO1FBQzdCLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUVqQixNQUFNLFFBQVEsR0FBRyxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsMkJBQTJCLENBQUM7UUFDdEUsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxHQUFHLFFBQVEsYUFBYSxLQUFLLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUN4RSxDQUFDO0lBRU8sU0FBUztRQUNmLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUN6QyxJQUFJLFVBQVUsQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUNsQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQzFCO0lBQ0gsQ0FBQzs7O1lBNUdGLFNBQVMsU0FBQztnQkFDVCxRQUFRLEVBQUUsMkJBQTJCO2dCQUNyQyxJQUFJLEVBQUU7b0JBQ0osT0FBTyxFQUFFLDRCQUE0QjtpQkFDdEM7Z0JBQ0QsU0FBUyxFQUFFO29CQUNULEVBQUMsT0FBTyxFQUFFLDJCQUEyQixFQUFFLFdBQVcsRUFBRSx1QkFBdUIsRUFBQztpQkFDN0U7YUFDRjs7O1lBaENrQixVQUFVO1lBK0N1QixRQUFRLHVCQUFyRCxNQUFNLFNBQUMsUUFBUTtZQTdDZCxjQUFjLHVCQThDZixRQUFROztBQXVGZixTQUFTLGFBQWEsQ0FBQyxLQUFnQztJQUNyRCxJQUFJLE1BQU0sR0FBRyxDQUFDLENBQUM7SUFDZixLQUFLLE1BQU0sSUFBSSxJQUFJLEtBQUssRUFBRTtRQUN4QixJQUFJLElBQUksSUFBSSxJQUFJLEVBQUU7WUFDaEIsTUFBTTtTQUNQO1FBQ0QsTUFBTSxJQUFJLElBQUksQ0FBQztLQUNoQjtJQUNELE9BQU8sTUFBTSxDQUFDO0FBQ2hCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtEaXJlY3RpdmUsIEVsZW1lbnRSZWYsIEluamVjdCwgT25EZXN0cm95LCBPbkluaXQsIE9wdGlvbmFsfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7RE9DVU1FTlR9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQge0RpcmVjdGlvbmFsaXR5fSBmcm9tICdAYW5ndWxhci9jZGsvYmlkaSc7XG5pbXBvcnQge19nZXRTaGFkb3dSb290fSBmcm9tICdAYW5ndWxhci9jZGsvcGxhdGZvcm0nO1xuaW1wb3J0IHtcbiAgU1RJQ0tZX1BPU0lUSU9OSU5HX0xJU1RFTkVSLFxuICBTdGlja3lQb3NpdGlvbmluZ0xpc3RlbmVyLFxuICBTdGlja3lTaXplLFxuICBTdGlja3lVcGRhdGUsXG59IGZyb20gJ0Bhbmd1bGFyL2Nkay90YWJsZSc7XG5cbmxldCBuZXh0SWQgPSAwO1xuXG4vKipcbiAqIEFwcGxpZXMgc3R5bGVzIHRvIHRoZSBob3N0IGVsZW1lbnQgdGhhdCBtYWtlIGl0cyBzY3JvbGxiYXJzIG1hdGNoIHVwIHdpdGhcbiAqIHRoZSBub24tc3RpY2t5IHNjcm9sbGFibGUgcG9ydGlvbnMgb2YgdGhlIENka1RhYmxlIGNvbnRhaW5lZCB3aXRoaW4uXG4gKlxuICogVGhpcyB2aXN1YWwgZWZmZWN0IG9ubHkgd29ya3MgaW4gV2Via2l0IGFuZCBCbGluayBiYXNlZCBicm93c2VycyAoZWcgQ2hyb21lLFxuICogU2FmYXJpLCBFZGdlKS4gT3RoZXIgYnJvd3NlcnMgc3VjaCBhcyBGaXJlZm94IHdpbGwgZ3JhY2VmdWxseSBkZWdyYWRlIHRvXG4gKiBub3JtYWwgc2Nyb2xsYmFyIGFwcGVhcmFuY2UuXG4gKiBGdXJ0aGVyIG5vdGU6IFRoZXNlIHN0eWxlcyBoYXZlIG5vIGVmZmVjdCB3aGVuIHRoZSBicm93c2VyIGlzIHVzaW5nIE9TLWRlZmF1bHRcbiAqIHNjcm9sbGJhcnMuIFRoZSBlYXNpZXN0IHdheSB0byBmb3JjZSB0aGVtIGludG8gY3VzdG9tIG1vZGUgaXMgdG8gc3BlY2lmeSB3aWR0aFxuICogYW5kIGhlaWdodCBmb3IgdGhlIHNjcm9sbGJhciBhbmQgdGh1bWIuXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tjZGtUYWJsZVNjcm9sbENvbnRhaW5lcl0nLFxuICBob3N0OiB7XG4gICAgJ2NsYXNzJzogJ2Nkay10YWJsZS1zY3JvbGwtY29udGFpbmVyJyxcbiAgfSxcbiAgcHJvdmlkZXJzOiBbXG4gICAge3Byb3ZpZGU6IFNUSUNLWV9QT1NJVElPTklOR19MSVNURU5FUiwgdXNlRXhpc3Rpbmc6IENka1RhYmxlU2Nyb2xsQ29udGFpbmVyfSxcbiAgXSxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrVGFibGVTY3JvbGxDb250YWluZXIgaW1wbGVtZW50cyBTdGlja3lQb3NpdGlvbmluZ0xpc3RlbmVyLFxuICAgIE9uRGVzdHJveSwgT25Jbml0IHtcbiAgcHJpdmF0ZSByZWFkb25seSBfdW5pcXVlQ2xhc3NOYW1lOiBzdHJpbmc7XG4gIHByaXZhdGUgX3N0eWxlUm9vdCE6IE5vZGU7XG4gIHByaXZhdGUgX3N0eWxlRWxlbWVudD86IEhUTUxTdHlsZUVsZW1lbnQ7XG5cbiAgLyoqIFRoZSBtb3N0IHJlY2VudCBzdGlja3kgY29sdW1uIHNpemUgdmFsdWVzIGZyb20gdGhlIENka1RhYmxlLiAqL1xuICBwcml2YXRlIF9zdGFydFNpemVzOiBTdGlja3lTaXplW10gPSBbXTtcbiAgcHJpdmF0ZSBfZW5kU2l6ZXM6IFN0aWNreVNpemVbXSA9IFtdO1xuICBwcml2YXRlIF9oZWFkZXJTaXplczogU3RpY2t5U2l6ZVtdID0gW107XG4gIHByaXZhdGUgX2Zvb3RlclNpemVzOiBTdGlja3lTaXplW10gPSBbXTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgcmVhZG9ubHkgX2VsZW1lbnRSZWY6IEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+LFxuICAgICAgQEluamVjdChET0NVTUVOVCkgcHJpdmF0ZSByZWFkb25seSBfZG9jdW1lbnQ6IERvY3VtZW50LFxuICAgICAgQE9wdGlvbmFsKCkgcHJpdmF0ZSByZWFkb25seSBfZGlyZWN0aW9uYWxpdHk/OiBEaXJlY3Rpb25hbGl0eSkge1xuICAgIHRoaXMuX3VuaXF1ZUNsYXNzTmFtZSA9IGBjZGstdGFibGUtc2Nyb2xsLWNvbnRhaW5lci0keysrbmV4dElkfWA7XG4gICAgX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5jbGFzc0xpc3QuYWRkKHRoaXMuX3VuaXF1ZUNsYXNzTmFtZSk7XG4gIH1cblxuICBuZ09uSW5pdCgpIHtcbiAgICAvLyBOb3RlIHRoYXQgd2UgbmVlZCB0byBsb29rIHVwIHRoZSByb290IG5vZGUgaW4gbmdPbkluaXQsIHJhdGhlciB0aGFuIHRoZSBjb25zdHJ1Y3RvciwgYmVjYXVzZVxuICAgIC8vIEFuZ3VsYXIgc2VlbXMgdG8gY3JlYXRlIHRoZSBlbGVtZW50IG91dHNpZGUgdGhlIHNoYWRvdyByb290IGFuZCB0aGVuIG1vdmVzIGl0IGluc2lkZSwgaWYgdGhlXG4gICAgLy8gbm9kZSBpcyBpbnNpZGUgYW4gYG5nSWZgIGFuZCBhIFNoYWRvd0RvbS1lbmNhcHN1bGF0ZWQgY29tcG9uZW50LlxuICAgIHRoaXMuX3N0eWxlUm9vdCA9IF9nZXRTaGFkb3dSb290KHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudCkgPz8gdGhpcy5fZG9jdW1lbnQuaGVhZDtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCk6IHZvaWQge1xuICAgIC8vIFRPRE86IFVzZSByZW1vdmUoKSBvbmNlIHdlJ3JlIG9mZiBJRTExLlxuICAgIGlmICh0aGlzLl9zdHlsZUVsZW1lbnQ/LnBhcmVudE5vZGUpIHtcbiAgICAgIHRoaXMuX3N0eWxlRWxlbWVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMuX3N0eWxlRWxlbWVudCk7XG4gICAgICB0aGlzLl9zdHlsZUVsZW1lbnQgPSB1bmRlZmluZWQ7XG4gICAgfVxuICB9XG5cbiAgc3RpY2t5Q29sdW1uc1VwZGF0ZWQoe3NpemVzfTogU3RpY2t5VXBkYXRlKTogdm9pZCB7XG4gICAgdGhpcy5fc3RhcnRTaXplcyA9IHNpemVzO1xuICAgIHRoaXMuX3VwZGF0ZVNjcm9sbGJhcigpO1xuICB9XG5cbiAgc3RpY2t5RW5kQ29sdW1uc1VwZGF0ZWQoe3NpemVzfTogU3RpY2t5VXBkYXRlKTogdm9pZCB7XG4gICAgdGhpcy5fZW5kU2l6ZXMgPSBzaXplcztcbiAgICB0aGlzLl91cGRhdGVTY3JvbGxiYXIoKTtcbiAgfVxuXG4gIHN0aWNreUhlYWRlclJvd3NVcGRhdGVkKHtzaXplc306IFN0aWNreVVwZGF0ZSk6IHZvaWQge1xuICAgIHRoaXMuX2hlYWRlclNpemVzID0gc2l6ZXM7XG4gICAgdGhpcy5fdXBkYXRlU2Nyb2xsYmFyKCk7XG4gIH1cblxuICBzdGlja3lGb290ZXJSb3dzVXBkYXRlZCh7c2l6ZXN9OiBTdGlja3lVcGRhdGUpOiB2b2lkIHtcbiAgICB0aGlzLl9mb290ZXJTaXplcyA9IHNpemVzO1xuICAgIHRoaXMuX3VwZGF0ZVNjcm9sbGJhcigpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCBwYWRkaW5nIG9uIHRoZSBzY3JvbGxiYXIgdHJhY2sgYmFzZWQgb24gdGhlIHN0aWNreSBzdGF0ZXMgZnJvbSBDZGtUYWJsZS5cbiAgICovXG4gIHByaXZhdGUgX3VwZGF0ZVNjcm9sbGJhcigpOiB2b2lkIHtcbiAgICBjb25zdCB0b3BNYXJnaW4gPSBjb21wdXRlTWFyZ2luKHRoaXMuX2hlYWRlclNpemVzKTtcbiAgICBjb25zdCBib3R0b21NYXJnaW4gPSBjb21wdXRlTWFyZ2luKHRoaXMuX2Zvb3RlclNpemVzKTtcbiAgICBjb25zdCBzdGFydE1hcmdpbiA9IGNvbXB1dGVNYXJnaW4odGhpcy5fc3RhcnRTaXplcyk7XG4gICAgY29uc3QgZW5kTWFyZ2luID0gY29tcHV0ZU1hcmdpbih0aGlzLl9lbmRTaXplcyk7XG5cbiAgICBpZiAodG9wTWFyZ2luID09PSAwICYmIGJvdHRvbU1hcmdpbiA9PT0gMCAmJiBzdGFydE1hcmdpbiA9PT0gMCAmJiBlbmRNYXJnaW4gPT09IDApIHtcbiAgICAgIHRoaXMuX2NsZWFyQ3NzKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgZGlyZWN0aW9uID0gdGhpcy5fZGlyZWN0aW9uYWxpdHkgPyB0aGlzLl9kaXJlY3Rpb25hbGl0eS52YWx1ZSA6ICdsdHInO1xuICAgIGNvbnN0IGxlZnRNYXJnaW4gPSBkaXJlY3Rpb24gPT09ICdydGwnID8gZW5kTWFyZ2luIDogc3RhcnRNYXJnaW47XG4gICAgY29uc3QgcmlnaHRNYXJnaW4gPSBkaXJlY3Rpb24gPT09ICdydGwnID8gc3RhcnRNYXJnaW4gOiBlbmRNYXJnaW47XG5cbiAgICB0aGlzLl9hcHBseUNzcyhgJHt0b3BNYXJnaW59cHggJHtyaWdodE1hcmdpbn1weCAke2JvdHRvbU1hcmdpbn1weCAke2xlZnRNYXJnaW59cHhgKTtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBzdHlsZXNoZWV0IGZvciB0aGUgc2Nyb2xsYmFyIHN0eWxlcyBhbmQgY3JlYXRlcyBpdCBpZiBuZWVkIGJlLiAqL1xuICBwcml2YXRlIF9nZXRTdHlsZVNoZWV0KCk6IENTU1N0eWxlU2hlZXQge1xuICAgIGlmICghdGhpcy5fc3R5bGVFbGVtZW50KSB7XG4gICAgICB0aGlzLl9zdHlsZUVsZW1lbnQgPSB0aGlzLl9kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuICAgICAgdGhpcy5fc3R5bGVSb290LmFwcGVuZENoaWxkKHRoaXMuX3N0eWxlRWxlbWVudCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX3N0eWxlRWxlbWVudC5zaGVldCBhcyBDU1NTdHlsZVNoZWV0O1xuICB9XG5cbiAgLyoqIFVwZGF0ZXMgdGhlIHN0eWxlc2hlZXQgd2l0aCB0aGUgc3BlY2lmaWVkIHNjcm9sbGJhciBzdHlsZS4gKi9cbiAgcHJpdmF0ZSBfYXBwbHlDc3ModmFsdWU6IHN0cmluZykge1xuICAgIHRoaXMuX2NsZWFyQ3NzKCk7XG5cbiAgICBjb25zdCBzZWxlY3RvciA9IGAuJHt0aGlzLl91bmlxdWVDbGFzc05hbWV9Ojotd2Via2l0LXNjcm9sbGJhci10cmFja2A7XG4gICAgdGhpcy5fZ2V0U3R5bGVTaGVldCgpLmluc2VydFJ1bGUoYCR7c2VsZWN0b3J9IHttYXJnaW46ICR7dmFsdWV9fWAsIDApO1xuICB9XG5cbiAgcHJpdmF0ZSBfY2xlYXJDc3MoKSB7XG4gICAgY29uc3Qgc3R5bGVTaGVldCA9IHRoaXMuX2dldFN0eWxlU2hlZXQoKTtcbiAgICBpZiAoc3R5bGVTaGVldC5jc3NSdWxlcy5sZW5ndGggPiAwKSB7XG4gICAgICBzdHlsZVNoZWV0LmRlbGV0ZVJ1bGUoMCk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGNvbXB1dGVNYXJnaW4oc2l6ZXM6IChudW1iZXJ8bnVsbHx1bmRlZmluZWQpW10pOiBudW1iZXIge1xuICBsZXQgbWFyZ2luID0gMDtcbiAgZm9yIChjb25zdCBzaXplIG9mIHNpemVzKSB7XG4gICAgaWYgKHNpemUgPT0gbnVsbCkge1xuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIG1hcmdpbiArPSBzaXplO1xuICB9XG4gIHJldHVybiBtYXJnaW47XG59XG4iXX0=