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
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/bidi";
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
class CdkTableScrollContainer {
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
        // Note that we need to look up the root node in ngOnInit, rather than the constructor, because
        // Angular seems to create the element outside the shadow root and then moves it inside, if the
        // node is inside an `ngIf` and a ShadowDom-encapsulated component.
        this._styleRoot = _getShadowRoot(this._elementRef.nativeElement) ?? this._document.head;
    }
    ngOnDestroy() {
        this._styleElement?.remove();
        this._styleElement = undefined;
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
CdkTableScrollContainer.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.0.0-next.2", ngImport: i0, type: CdkTableScrollContainer, deps: [{ token: i0.ElementRef }, { token: DOCUMENT }, { token: i1.Directionality, optional: true }], target: i0.ɵɵFactoryTarget.Directive });
CdkTableScrollContainer.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "16.0.0-next.2", type: CdkTableScrollContainer, selector: "[cdkTableScrollContainer]", host: { classAttribute: "cdk-table-scroll-container" }, providers: [{ provide: STICKY_POSITIONING_LISTENER, useExisting: CdkTableScrollContainer }], ngImport: i0 });
export { CdkTableScrollContainer };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.0.0-next.2", ngImport: i0, type: CdkTableScrollContainer, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkTableScrollContainer]',
                    host: {
                        'class': 'cdk-table-scroll-container',
                    },
                    providers: [{ provide: STICKY_POSITIONING_LISTENER, useExisting: CdkTableScrollContainer }],
                }]
        }], ctorParameters: function () { return [{ type: i0.ElementRef }, { type: Document, decorators: [{
                    type: Inject,
                    args: [DOCUMENT]
                }] }, { type: i1.Directionality, decorators: [{
                    type: Optional
                }] }]; } });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFibGUtc2Nyb2xsLWNvbnRhaW5lci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL3RhYmxlLXNjcm9sbC1jb250YWluZXIvdGFibGUtc2Nyb2xsLWNvbnRhaW5lci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsU0FBUyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQXFCLFFBQVEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUN6RixPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDekMsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQ2pELE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUNyRCxPQUFPLEVBQ0wsMkJBQTJCLEdBSTVCLE1BQU0sb0JBQW9CLENBQUM7OztBQUU1QixJQUFJLE1BQU0sR0FBRyxDQUFDLENBQUM7QUFFZjs7Ozs7Ozs7OztHQVVHO0FBQ0gsTUFPYSx1QkFBdUI7SUFXbEMsWUFDbUIsV0FBb0MsRUFDbEIsU0FBbUIsRUFDekIsZUFBZ0M7UUFGNUMsZ0JBQVcsR0FBWCxXQUFXLENBQXlCO1FBQ2xCLGNBQVMsR0FBVCxTQUFTLENBQVU7UUFDekIsb0JBQWUsR0FBZixlQUFlLENBQWlCO1FBVC9ELG1FQUFtRTtRQUMzRCxnQkFBVyxHQUFpQixFQUFFLENBQUM7UUFDL0IsY0FBUyxHQUFpQixFQUFFLENBQUM7UUFDN0IsaUJBQVksR0FBaUIsRUFBRSxDQUFDO1FBQ2hDLGlCQUFZLEdBQWlCLEVBQUUsQ0FBQztRQU90QyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsOEJBQThCLEVBQUUsTUFBTSxFQUFFLENBQUM7UUFDakUsV0FBVyxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBQ2pF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QkFBZ0IsMkJBQTJCLENBQUM7UUFDdEUsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxHQUFHLFFBQVEsYUFBYSxLQUFLLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUN4RSxDQUFDO0lBRU8sU0FBUztRQUNmLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUN6QyxJQUFJLFVBQVUsQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUNsQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQzFCO0lBQ0gsQ0FBQzs7MkhBaEdVLHVCQUF1Qiw0Q0FheEIsUUFBUTsrR0FiUCx1QkFBdUIsNEdBRnZCLENBQUMsRUFBQyxPQUFPLEVBQUUsMkJBQTJCLEVBQUUsV0FBVyxFQUFFLHVCQUF1QixFQUFDLENBQUM7U0FFOUUsdUJBQXVCO2tHQUF2Qix1QkFBdUI7a0JBUG5DLFNBQVM7bUJBQUM7b0JBQ1QsUUFBUSxFQUFFLDJCQUEyQjtvQkFDckMsSUFBSSxFQUFFO3dCQUNKLE9BQU8sRUFBRSw0QkFBNEI7cUJBQ3RDO29CQUNELFNBQVMsRUFBRSxDQUFDLEVBQUMsT0FBTyxFQUFFLDJCQUEyQixFQUFFLFdBQVcseUJBQXlCLEVBQUMsQ0FBQztpQkFDMUY7OzBCQWNJLE1BQU07MkJBQUMsUUFBUTs7MEJBQ2YsUUFBUTs7QUFxRmIsU0FBUyxhQUFhLENBQUMsS0FBb0M7SUFDekQsSUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDO0lBQ2YsS0FBSyxNQUFNLElBQUksSUFBSSxLQUFLLEVBQUU7UUFDeEIsSUFBSSxJQUFJLElBQUksSUFBSSxFQUFFO1lBQ2hCLE1BQU07U0FDUDtRQUNELE1BQU0sSUFBSSxJQUFJLENBQUM7S0FDaEI7SUFDRCxPQUFPLE1BQU0sQ0FBQztBQUNoQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RGlyZWN0aXZlLCBFbGVtZW50UmVmLCBJbmplY3QsIE9uRGVzdHJveSwgT25Jbml0LCBPcHRpb25hbH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0RPQ1VNRU5UfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHtEaXJlY3Rpb25hbGl0eX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2JpZGknO1xuaW1wb3J0IHtfZ2V0U2hhZG93Um9vdH0gZnJvbSAnQGFuZ3VsYXIvY2RrL3BsYXRmb3JtJztcbmltcG9ydCB7XG4gIFNUSUNLWV9QT1NJVElPTklOR19MSVNURU5FUixcbiAgU3RpY2t5UG9zaXRpb25pbmdMaXN0ZW5lcixcbiAgU3RpY2t5U2l6ZSxcbiAgU3RpY2t5VXBkYXRlLFxufSBmcm9tICdAYW5ndWxhci9jZGsvdGFibGUnO1xuXG5sZXQgbmV4dElkID0gMDtcblxuLyoqXG4gKiBBcHBsaWVzIHN0eWxlcyB0byB0aGUgaG9zdCBlbGVtZW50IHRoYXQgbWFrZSBpdHMgc2Nyb2xsYmFycyBtYXRjaCB1cCB3aXRoXG4gKiB0aGUgbm9uLXN0aWNreSBzY3JvbGxhYmxlIHBvcnRpb25zIG9mIHRoZSBDZGtUYWJsZSBjb250YWluZWQgd2l0aGluLlxuICpcbiAqIFRoaXMgdmlzdWFsIGVmZmVjdCBvbmx5IHdvcmtzIGluIFdlYmtpdCBhbmQgQmxpbmsgYmFzZWQgYnJvd3NlcnMgKGVnIENocm9tZSxcbiAqIFNhZmFyaSwgRWRnZSkuIE90aGVyIGJyb3dzZXJzIHN1Y2ggYXMgRmlyZWZveCB3aWxsIGdyYWNlZnVsbHkgZGVncmFkZSB0b1xuICogbm9ybWFsIHNjcm9sbGJhciBhcHBlYXJhbmNlLlxuICogRnVydGhlciBub3RlOiBUaGVzZSBzdHlsZXMgaGF2ZSBubyBlZmZlY3Qgd2hlbiB0aGUgYnJvd3NlciBpcyB1c2luZyBPUy1kZWZhdWx0XG4gKiBzY3JvbGxiYXJzLiBUaGUgZWFzaWVzdCB3YXkgdG8gZm9yY2UgdGhlbSBpbnRvIGN1c3RvbSBtb2RlIGlzIHRvIHNwZWNpZnkgd2lkdGhcbiAqIGFuZCBoZWlnaHQgZm9yIHRoZSBzY3JvbGxiYXIgYW5kIHRodW1iLlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbY2RrVGFibGVTY3JvbGxDb250YWluZXJdJyxcbiAgaG9zdDoge1xuICAgICdjbGFzcyc6ICdjZGstdGFibGUtc2Nyb2xsLWNvbnRhaW5lcicsXG4gIH0sXG4gIHByb3ZpZGVyczogW3twcm92aWRlOiBTVElDS1lfUE9TSVRJT05JTkdfTElTVEVORVIsIHVzZUV4aXN0aW5nOiBDZGtUYWJsZVNjcm9sbENvbnRhaW5lcn1dLFxufSlcbmV4cG9ydCBjbGFzcyBDZGtUYWJsZVNjcm9sbENvbnRhaW5lciBpbXBsZW1lbnRzIFN0aWNreVBvc2l0aW9uaW5nTGlzdGVuZXIsIE9uRGVzdHJveSwgT25Jbml0IHtcbiAgcHJpdmF0ZSByZWFkb25seSBfdW5pcXVlQ2xhc3NOYW1lOiBzdHJpbmc7XG4gIHByaXZhdGUgX3N0eWxlUm9vdCE6IE5vZGU7XG4gIHByaXZhdGUgX3N0eWxlRWxlbWVudD86IEhUTUxTdHlsZUVsZW1lbnQ7XG5cbiAgLyoqIFRoZSBtb3N0IHJlY2VudCBzdGlja3kgY29sdW1uIHNpemUgdmFsdWVzIGZyb20gdGhlIENka1RhYmxlLiAqL1xuICBwcml2YXRlIF9zdGFydFNpemVzOiBTdGlja3lTaXplW10gPSBbXTtcbiAgcHJpdmF0ZSBfZW5kU2l6ZXM6IFN0aWNreVNpemVbXSA9IFtdO1xuICBwcml2YXRlIF9oZWFkZXJTaXplczogU3RpY2t5U2l6ZVtdID0gW107XG4gIHByaXZhdGUgX2Zvb3RlclNpemVzOiBTdGlja3lTaXplW10gPSBbXTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIHJlYWRvbmx5IF9lbGVtZW50UmVmOiBFbGVtZW50UmVmPEhUTUxFbGVtZW50PixcbiAgICBASW5qZWN0KERPQ1VNRU5UKSBwcml2YXRlIHJlYWRvbmx5IF9kb2N1bWVudDogRG9jdW1lbnQsXG4gICAgQE9wdGlvbmFsKCkgcHJpdmF0ZSByZWFkb25seSBfZGlyZWN0aW9uYWxpdHk/OiBEaXJlY3Rpb25hbGl0eSxcbiAgKSB7XG4gICAgdGhpcy5fdW5pcXVlQ2xhc3NOYW1lID0gYGNkay10YWJsZS1zY3JvbGwtY29udGFpbmVyLSR7KytuZXh0SWR9YDtcbiAgICBfZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LmNsYXNzTGlzdC5hZGQodGhpcy5fdW5pcXVlQ2xhc3NOYW1lKTtcbiAgfVxuXG4gIG5nT25Jbml0KCkge1xuICAgIC8vIE5vdGUgdGhhdCB3ZSBuZWVkIHRvIGxvb2sgdXAgdGhlIHJvb3Qgbm9kZSBpbiBuZ09uSW5pdCwgcmF0aGVyIHRoYW4gdGhlIGNvbnN0cnVjdG9yLCBiZWNhdXNlXG4gICAgLy8gQW5ndWxhciBzZWVtcyB0byBjcmVhdGUgdGhlIGVsZW1lbnQgb3V0c2lkZSB0aGUgc2hhZG93IHJvb3QgYW5kIHRoZW4gbW92ZXMgaXQgaW5zaWRlLCBpZiB0aGVcbiAgICAvLyBub2RlIGlzIGluc2lkZSBhbiBgbmdJZmAgYW5kIGEgU2hhZG93RG9tLWVuY2Fwc3VsYXRlZCBjb21wb25lbnQuXG4gICAgdGhpcy5fc3R5bGVSb290ID0gX2dldFNoYWRvd1Jvb3QodGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50KSA/PyB0aGlzLl9kb2N1bWVudC5oZWFkO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgdGhpcy5fc3R5bGVFbGVtZW50Py5yZW1vdmUoKTtcbiAgICB0aGlzLl9zdHlsZUVsZW1lbnQgPSB1bmRlZmluZWQ7XG4gIH1cblxuICBzdGlja3lDb2x1bW5zVXBkYXRlZCh7c2l6ZXN9OiBTdGlja3lVcGRhdGUpOiB2b2lkIHtcbiAgICB0aGlzLl9zdGFydFNpemVzID0gc2l6ZXM7XG4gICAgdGhpcy5fdXBkYXRlU2Nyb2xsYmFyKCk7XG4gIH1cblxuICBzdGlja3lFbmRDb2x1bW5zVXBkYXRlZCh7c2l6ZXN9OiBTdGlja3lVcGRhdGUpOiB2b2lkIHtcbiAgICB0aGlzLl9lbmRTaXplcyA9IHNpemVzO1xuICAgIHRoaXMuX3VwZGF0ZVNjcm9sbGJhcigpO1xuICB9XG5cbiAgc3RpY2t5SGVhZGVyUm93c1VwZGF0ZWQoe3NpemVzfTogU3RpY2t5VXBkYXRlKTogdm9pZCB7XG4gICAgdGhpcy5faGVhZGVyU2l6ZXMgPSBzaXplcztcbiAgICB0aGlzLl91cGRhdGVTY3JvbGxiYXIoKTtcbiAgfVxuXG4gIHN0aWNreUZvb3RlclJvd3NVcGRhdGVkKHtzaXplc306IFN0aWNreVVwZGF0ZSk6IHZvaWQge1xuICAgIHRoaXMuX2Zvb3RlclNpemVzID0gc2l6ZXM7XG4gICAgdGhpcy5fdXBkYXRlU2Nyb2xsYmFyKCk7XG4gIH1cblxuICAvKipcbiAgICogU2V0IHBhZGRpbmcgb24gdGhlIHNjcm9sbGJhciB0cmFjayBiYXNlZCBvbiB0aGUgc3RpY2t5IHN0YXRlcyBmcm9tIENka1RhYmxlLlxuICAgKi9cbiAgcHJpdmF0ZSBfdXBkYXRlU2Nyb2xsYmFyKCk6IHZvaWQge1xuICAgIGNvbnN0IHRvcE1hcmdpbiA9IGNvbXB1dGVNYXJnaW4odGhpcy5faGVhZGVyU2l6ZXMpO1xuICAgIGNvbnN0IGJvdHRvbU1hcmdpbiA9IGNvbXB1dGVNYXJnaW4odGhpcy5fZm9vdGVyU2l6ZXMpO1xuICAgIGNvbnN0IHN0YXJ0TWFyZ2luID0gY29tcHV0ZU1hcmdpbih0aGlzLl9zdGFydFNpemVzKTtcbiAgICBjb25zdCBlbmRNYXJnaW4gPSBjb21wdXRlTWFyZ2luKHRoaXMuX2VuZFNpemVzKTtcblxuICAgIGlmICh0b3BNYXJnaW4gPT09IDAgJiYgYm90dG9tTWFyZ2luID09PSAwICYmIHN0YXJ0TWFyZ2luID09PSAwICYmIGVuZE1hcmdpbiA9PT0gMCkge1xuICAgICAgdGhpcy5fY2xlYXJDc3MoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBkaXJlY3Rpb24gPSB0aGlzLl9kaXJlY3Rpb25hbGl0eSA/IHRoaXMuX2RpcmVjdGlvbmFsaXR5LnZhbHVlIDogJ2x0cic7XG4gICAgY29uc3QgbGVmdE1hcmdpbiA9IGRpcmVjdGlvbiA9PT0gJ3J0bCcgPyBlbmRNYXJnaW4gOiBzdGFydE1hcmdpbjtcbiAgICBjb25zdCByaWdodE1hcmdpbiA9IGRpcmVjdGlvbiA9PT0gJ3J0bCcgPyBzdGFydE1hcmdpbiA6IGVuZE1hcmdpbjtcblxuICAgIHRoaXMuX2FwcGx5Q3NzKGAke3RvcE1hcmdpbn1weCAke3JpZ2h0TWFyZ2lufXB4ICR7Ym90dG9tTWFyZ2lufXB4ICR7bGVmdE1hcmdpbn1weGApO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIHN0eWxlc2hlZXQgZm9yIHRoZSBzY3JvbGxiYXIgc3R5bGVzIGFuZCBjcmVhdGVzIGl0IGlmIG5lZWQgYmUuICovXG4gIHByaXZhdGUgX2dldFN0eWxlU2hlZXQoKTogQ1NTU3R5bGVTaGVldCB7XG4gICAgaWYgKCF0aGlzLl9zdHlsZUVsZW1lbnQpIHtcbiAgICAgIHRoaXMuX3N0eWxlRWxlbWVudCA9IHRoaXMuX2RvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XG4gICAgICB0aGlzLl9zdHlsZVJvb3QuYXBwZW5kQ2hpbGQodGhpcy5fc3R5bGVFbGVtZW50KTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fc3R5bGVFbGVtZW50LnNoZWV0IGFzIENTU1N0eWxlU2hlZXQ7XG4gIH1cblxuICAvKiogVXBkYXRlcyB0aGUgc3R5bGVzaGVldCB3aXRoIHRoZSBzcGVjaWZpZWQgc2Nyb2xsYmFyIHN0eWxlLiAqL1xuICBwcml2YXRlIF9hcHBseUNzcyh2YWx1ZTogc3RyaW5nKSB7XG4gICAgdGhpcy5fY2xlYXJDc3MoKTtcblxuICAgIGNvbnN0IHNlbGVjdG9yID0gYC4ke3RoaXMuX3VuaXF1ZUNsYXNzTmFtZX06Oi13ZWJraXQtc2Nyb2xsYmFyLXRyYWNrYDtcbiAgICB0aGlzLl9nZXRTdHlsZVNoZWV0KCkuaW5zZXJ0UnVsZShgJHtzZWxlY3Rvcn0ge21hcmdpbjogJHt2YWx1ZX19YCwgMCk7XG4gIH1cblxuICBwcml2YXRlIF9jbGVhckNzcygpIHtcbiAgICBjb25zdCBzdHlsZVNoZWV0ID0gdGhpcy5fZ2V0U3R5bGVTaGVldCgpO1xuICAgIGlmIChzdHlsZVNoZWV0LmNzc1J1bGVzLmxlbmd0aCA+IDApIHtcbiAgICAgIHN0eWxlU2hlZXQuZGVsZXRlUnVsZSgwKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gY29tcHV0ZU1hcmdpbihzaXplczogKG51bWJlciB8IG51bGwgfCB1bmRlZmluZWQpW10pOiBudW1iZXIge1xuICBsZXQgbWFyZ2luID0gMDtcbiAgZm9yIChjb25zdCBzaXplIG9mIHNpemVzKSB7XG4gICAgaWYgKHNpemUgPT0gbnVsbCkge1xuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIG1hcmdpbiArPSBzaXplO1xuICB9XG4gIHJldHVybiBtYXJnaW47XG59XG4iXX0=