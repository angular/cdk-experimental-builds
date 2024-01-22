/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { CSP_NONCE, Directive, ElementRef, Inject, Optional } from '@angular/core';
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
export class CdkTableScrollContainer {
    constructor(_elementRef, _document, _directionality, _nonce) {
        this._elementRef = _elementRef;
        this._document = _document;
        this._directionality = _directionality;
        this._nonce = _nonce;
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
        if (arrayEquals(this._startSizes, sizes)) {
            return;
        }
        this._startSizes = sizes;
        this._updateScrollbar();
    }
    stickyEndColumnsUpdated({ sizes }) {
        if (arrayEquals(this._endSizes, sizes)) {
            return;
        }
        this._endSizes = sizes;
        this._updateScrollbar();
    }
    stickyHeaderRowsUpdated({ sizes }) {
        if (arrayEquals(this._headerSizes, sizes)) {
            return;
        }
        this._headerSizes = sizes;
        this._updateScrollbar();
    }
    stickyFooterRowsUpdated({ sizes }) {
        console.log('sizes', this._footerSizes, sizes, arrayEquals(this._footerSizes, sizes));
        if (arrayEquals(this._footerSizes, sizes)) {
            return;
        }
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
            if (this._nonce) {
                this._styleElement.nonce = this._nonce;
            }
            this._styleRoot.appendChild(this._styleElement);
        }
        return this._styleElement.sheet;
    }
    /** Updates the stylesheet with the specified scrollbar style. */
    _applyCss(value) {
        this._clearCss();
        const selector = `.${this._uniqueClassName}::-webkit-scrollbar-track`;
        this._getStyleSheet().insertRule(`${selector} {margin: ${value}}`, 0);
        // Force the scrollbar to paint.
        const display = this._elementRef.nativeElement.style.display;
        this._elementRef.nativeElement.style.display = 'none';
        this._elementRef.nativeElement.style.display = display;
    }
    _clearCss() {
        const styleSheet = this._getStyleSheet();
        if (styleSheet.cssRules.length > 0) {
            styleSheet.deleteRule(0);
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.1.0-next.5", ngImport: i0, type: CdkTableScrollContainer, deps: [{ token: i0.ElementRef }, { token: DOCUMENT }, { token: i1.Directionality, optional: true }, { token: CSP_NONCE, optional: true }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "17.1.0-next.5", type: CdkTableScrollContainer, isStandalone: true, selector: "[cdkTableScrollContainer]", host: { classAttribute: "cdk-table-scroll-container" }, providers: [{ provide: STICKY_POSITIONING_LISTENER, useExisting: CdkTableScrollContainer }], ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.1.0-next.5", ngImport: i0, type: CdkTableScrollContainer, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkTableScrollContainer]',
                    host: {
                        'class': 'cdk-table-scroll-container',
                    },
                    providers: [{ provide: STICKY_POSITIONING_LISTENER, useExisting: CdkTableScrollContainer }],
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: Document, decorators: [{
                    type: Inject,
                    args: [DOCUMENT]
                }] }, { type: i1.Directionality, decorators: [{
                    type: Optional
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [CSP_NONCE]
                }] }] });
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
function arrayEquals(a1, a2) {
    if (a1 === a2) {
        return true;
    }
    if (a1.length !== a2.length) {
        return false;
    }
    for (let index = 0; index < a1.length; index++) {
        if (a1[index] !== a2[index]) {
            return false;
        }
    }
    return true;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFibGUtc2Nyb2xsLWNvbnRhaW5lci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL3RhYmxlLXNjcm9sbC1jb250YWluZXIvdGFibGUtc2Nyb2xsLWNvbnRhaW5lci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFxQixRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDcEcsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQ3pDLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUNqRCxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDckQsT0FBTyxFQUNMLDJCQUEyQixHQUk1QixNQUFNLG9CQUFvQixDQUFDOzs7QUFFNUIsSUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDO0FBRWY7Ozs7Ozs7Ozs7R0FVRztBQVNILE1BQU0sT0FBTyx1QkFBdUI7SUFXbEMsWUFDbUIsV0FBb0MsRUFDbEIsU0FBbUIsRUFDekIsZUFBZ0MsRUFDYixNQUFzQjtRQUhyRCxnQkFBVyxHQUFYLFdBQVcsQ0FBeUI7UUFDbEIsY0FBUyxHQUFULFNBQVMsQ0FBVTtRQUN6QixvQkFBZSxHQUFmLGVBQWUsQ0FBaUI7UUFDYixXQUFNLEdBQU4sTUFBTSxDQUFnQjtRQVZ4RSxtRUFBbUU7UUFDM0QsZ0JBQVcsR0FBaUIsRUFBRSxDQUFDO1FBQy9CLGNBQVMsR0FBaUIsRUFBRSxDQUFDO1FBQzdCLGlCQUFZLEdBQWlCLEVBQUUsQ0FBQztRQUNoQyxpQkFBWSxHQUFpQixFQUFFLENBQUM7UUFRdEMsSUFBSSxDQUFDLGdCQUFnQixHQUFHLDhCQUE4QixFQUFFLE1BQU0sRUFBRSxDQUFDO1FBQ2pFLFdBQVcsQ0FBQyxhQUFhLENBQUMs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QUM7UUFDZCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFDRCxJQUFJLEVBQUUsQ0FBQyxNQUFNLEtBQUssRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQzVCLE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQztJQUVELEtBQUssSUFBSSxLQUFLLEdBQUcsQ0FBQyxFQUFFLEtBQUssR0FBRyxFQUFFLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUM7UUFDL0MsSUFBSSxFQUFFLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7WUFDNUIsT0FBTyxLQUFLLENBQUM7UUFDZixDQUFDO0lBQ0gsQ0FBQztJQUVELE9BQU8sSUFBSSxDQUFDO0FBQ2QsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0NTUF9OT05DRSwgRGlyZWN0aXZlLCBFbGVtZW50UmVmLCBJbmplY3QsIE9uRGVzdHJveSwgT25Jbml0LCBPcHRpb25hbH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0RPQ1VNRU5UfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHtEaXJlY3Rpb25hbGl0eX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2JpZGknO1xuaW1wb3J0IHtfZ2V0U2hhZG93Um9vdH0gZnJvbSAnQGFuZ3VsYXIvY2RrL3BsYXRmb3JtJztcbmltcG9ydCB7XG4gIFNUSUNLWV9QT1NJVElPTklOR19MSVNURU5FUixcbiAgU3RpY2t5UG9zaXRpb25pbmdMaXN0ZW5lcixcbiAgU3RpY2t5U2l6ZSxcbiAgU3RpY2t5VXBkYXRlLFxufSBmcm9tICdAYW5ndWxhci9jZGsvdGFibGUnO1xuXG5sZXQgbmV4dElkID0gMDtcblxuLyoqXG4gKiBBcHBsaWVzIHN0eWxlcyB0byB0aGUgaG9zdCBlbGVtZW50IHRoYXQgbWFrZSBpdHMgc2Nyb2xsYmFycyBtYXRjaCB1cCB3aXRoXG4gKiB0aGUgbm9uLXN0aWNreSBzY3JvbGxhYmxlIHBvcnRpb25zIG9mIHRoZSBDZGtUYWJsZSBjb250YWluZWQgd2l0aGluLlxuICpcbiAqIFRoaXMgdmlzdWFsIGVmZmVjdCBvbmx5IHdvcmtzIGluIFdlYmtpdCBhbmQgQmxpbmsgYmFzZWQgYnJvd3NlcnMgKGVnIENocm9tZSxcbiAqIFNhZmFyaSwgRWRnZSkuIE90aGVyIGJyb3dzZXJzIHN1Y2ggYXMgRmlyZWZveCB3aWxsIGdyYWNlZnVsbHkgZGVncmFkZSB0b1xuICogbm9ybWFsIHNjcm9sbGJhciBhcHBlYXJhbmNlLlxuICogRnVydGhlciBub3RlOiBUaGVzZSBzdHlsZXMgaGF2ZSBubyBlZmZlY3Qgd2hlbiB0aGUgYnJvd3NlciBpcyB1c2luZyBPUy1kZWZhdWx0XG4gKiBzY3JvbGxiYXJzLiBUaGUgZWFzaWVzdCB3YXkgdG8gZm9yY2UgdGhlbSBpbnRvIGN1c3RvbSBtb2RlIGlzIHRvIHNwZWNpZnkgd2lkdGhcbiAqIGFuZCBoZWlnaHQgZm9yIHRoZSBzY3JvbGxiYXIgYW5kIHRodW1iLlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbY2RrVGFibGVTY3JvbGxDb250YWluZXJdJyxcbiAgaG9zdDoge1xuICAgICdjbGFzcyc6ICdjZGstdGFibGUtc2Nyb2xsLWNvbnRhaW5lcicsXG4gIH0sXG4gIHByb3ZpZGVyczogW3twcm92aWRlOiBTVElDS1lfUE9TSVRJT05JTkdfTElTVEVORVIsIHVzZUV4aXN0aW5nOiBDZGtUYWJsZVNjcm9sbENvbnRhaW5lcn1dLFxuICBzdGFuZGFsb25lOiB0cnVlLFxufSlcbmV4cG9ydCBjbGFzcyBDZGtUYWJsZVNjcm9sbENvbnRhaW5lciBpbXBsZW1lbnRzIFN0aWNreVBvc2l0aW9uaW5nTGlzdGVuZXIsIE9uRGVzdHJveSwgT25Jbml0IHtcbiAgcHJpdmF0ZSByZWFkb25seSBfdW5pcXVlQ2xhc3NOYW1lOiBzdHJpbmc7XG4gIHByaXZhdGUgX3N0eWxlUm9vdCE6IE5vZGU7XG4gIHByaXZhdGUgX3N0eWxlRWxlbWVudD86IEhUTUxTdHlsZUVsZW1lbnQ7XG5cbiAgLyoqIFRoZSBtb3N0IHJlY2VudCBzdGlja3kgY29sdW1uIHNpemUgdmFsdWVzIGZyb20gdGhlIENka1RhYmxlLiAqL1xuICBwcml2YXRlIF9zdGFydFNpemVzOiBTdGlja3lTaXplW10gPSBbXTtcbiAgcHJpdmF0ZSBfZW5kU2l6ZXM6IFN0aWNreVNpemVbXSA9IFtdO1xuICBwcml2YXRlIF9oZWFkZXJTaXplczogU3RpY2t5U2l6ZVtdID0gW107XG4gIHByaXZhdGUgX2Zvb3RlclNpemVzOiBTdGlja3lTaXplW10gPSBbXTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIHJlYWRvbmx5IF9lbGVtZW50UmVmOiBFbGVtZW50UmVmPEhUTUxFbGVtZW50PixcbiAgICBASW5qZWN0KERPQ1VNRU5UKSBwcml2YXRlIHJlYWRvbmx5IF9kb2N1bWVudDogRG9jdW1lbnQsXG4gICAgQE9wdGlvbmFsKCkgcHJpdmF0ZSByZWFkb25seSBfZGlyZWN0aW9uYWxpdHk/OiBEaXJlY3Rpb25hbGl0eSxcbiAgICBAT3B0aW9uYWwoKSBASW5qZWN0KENTUF9OT05DRSkgcHJpdmF0ZSByZWFkb25seSBfbm9uY2U/OiBzdHJpbmcgfCBudWxsLFxuICApIHtcbiAgICB0aGlzLl91bmlxdWVDbGFzc05hbWUgPSBgY2RrLXRhYmxlLXNjcm9sbC1jb250YWluZXItJHsrK25leHRJZH1gO1xuICAgIF9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQuY2xhc3NMaXN0LmFkZCh0aGlzLl91bmlxdWVDbGFzc05hbWUpO1xuICB9XG5cbiAgbmdPbkluaXQoKSB7XG4gICAgLy8gTm90ZSB0aGF0IHdlIG5lZWQgdG8gbG9vayB1cCB0aGUgcm9vdCBub2RlIGluIG5nT25Jbml0LCByYXRoZXIgdGhhbiB0aGUgY29uc3RydWN0b3IsIGJlY2F1c2VcbiAgICAvLyBBbmd1bGFyIHNlZW1zIHRvIGNyZWF0ZSB0aGUgZWxlbWVudCBvdXRzaWRlIHRoZSBzaGFkb3cgcm9vdCBhbmQgdGhlbiBtb3ZlcyBpdCBpbnNpZGUsIGlmIHRoZVxuICAgIC8vIG5vZGUgaXMgaW5zaWRlIGFuIGBuZ0lmYCBhbmQgYSBTaGFkb3dEb20tZW5jYXBzdWxhdGVkIGNvbXBvbmVudC5cbiAgICB0aGlzLl9zdHlsZVJvb3QgPSBfZ2V0U2hhZG93Um9vdCh0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQpID8/IHRoaXMuX2RvY3VtZW50LmhlYWQ7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLl9zdHlsZUVsZW1lbnQ/LnJlbW92ZSgpO1xuICAgIHRoaXMuX3N0eWxlRWxlbWVudCA9IHVuZGVmaW5lZDtcbiAgfVxuXG4gIHN0aWNreUNvbHVtbnNVcGRhdGVkKHtzaXplc306IFN0aWNreVVwZGF0ZSk6IHZvaWQge1xuICAgIGlmIChhcnJheUVxdWFscyh0aGlzLl9zdGFydFNpemVzLCBzaXplcykpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5fc3RhcnRTaXplcyA9IHNpemVzO1xuICAgIHRoaXMuX3VwZGF0ZVNjcm9sbGJhcigpO1xuICB9XG5cbiAgc3RpY2t5RW5kQ29sdW1uc1VwZGF0ZWQoe3NpemVzfTogU3RpY2t5VXBkYXRlKTogdm9pZCB7XG4gICAgaWYgKGFycmF5RXF1YWxzKHRoaXMuX2VuZFNpemVzLCBzaXplcykpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5fZW5kU2l6ZXMgPSBzaXplcztcbiAgICB0aGlzLl91cGRhdGVTY3JvbGxiYXIoKTtcbiAgfVxuXG4gIHN0aWNreUhlYWRlclJvd3NVcGRhdGVkKHtzaXplc306IFN0aWNreVVwZGF0ZSk6IHZvaWQge1xuICAgIGlmIChhcnJheUVxdWFscyh0aGlzLl9oZWFkZXJTaXplcywgc2l6ZXMpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuX2hlYWRlclNpemVzID0gc2l6ZXM7XG4gICAgdGhpcy5fdXBkYXRlU2Nyb2xsYmFyKCk7XG4gIH1cblxuICBzdGlja3lGb290ZXJSb3dzVXBkYXRlZCh7c2l6ZXN9OiBTdGlja3lVcGRhdGUpOiB2b2lkIHtcbiAgICBjb25zb2xlLmxvZygnc2l6ZXMnLCB0aGlzLl9mb290ZXJTaXplcywgc2l6ZXMsIGFycmF5RXF1YWxzKHRoaXMuX2Zvb3RlclNpemVzLCBzaXplcykpO1xuICAgIGlmIChhcnJheUVxdWFscyh0aGlzLl9mb290ZXJTaXplcywgc2l6ZXMpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuX2Zvb3RlclNpemVzID0gc2l6ZXM7XG4gICAgdGhpcy5fdXBkYXRlU2Nyb2xsYmFyKCk7XG4gIH1cblxuICAvKipcbiAgICogU2V0IHBhZGRpbmcgb24gdGhlIHNjcm9sbGJhciB0cmFjayBiYXNlZCBvbiB0aGUgc3RpY2t5IHN0YXRlcyBmcm9tIENka1RhYmxlLlxuICAgKi9cbiAgcHJpdmF0ZSBfdXBkYXRlU2Nyb2xsYmFyKCk6IHZvaWQge1xuICAgIGNvbnN0IHRvcE1hcmdpbiA9IGNvbXB1dGVNYXJnaW4odGhpcy5faGVhZGVyU2l6ZXMpO1xuICAgIGNvbnN0IGJvdHRvbU1hcmdpbiA9IGNvbXB1dGVNYXJnaW4odGhpcy5fZm9vdGVyU2l6ZXMpO1xuICAgIGNvbnN0IHN0YXJ0TWFyZ2luID0gY29tcHV0ZU1hcmdpbih0aGlzLl9zdGFydFNpemVzKTtcbiAgICBjb25zdCBlbmRNYXJnaW4gPSBjb21wdXRlTWFyZ2luKHRoaXMuX2VuZFNpemVzKTtcblxuICAgIGlmICh0b3BNYXJnaW4gPT09IDAgJiYgYm90dG9tTWFyZ2luID09PSAwICYmIHN0YXJ0TWFyZ2luID09PSAwICYmIGVuZE1hcmdpbiA9PT0gMCkge1xuICAgICAgdGhpcy5fY2xlYXJDc3MoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBkaXJlY3Rpb24gPSB0aGlzLl9kaXJlY3Rpb25hbGl0eSA/IHRoaXMuX2RpcmVjdGlvbmFsaXR5LnZhbHVlIDogJ2x0cic7XG4gICAgY29uc3QgbGVmdE1hcmdpbiA9IGRpcmVjdGlvbiA9PT0gJ3J0bCcgPyBlbmRNYXJnaW4gOiBzdGFydE1hcmdpbjtcbiAgICBjb25zdCByaWdodE1hcmdpbiA9IGRpcmVjdGlvbiA9PT0gJ3J0bCcgPyBzdGFydE1hcmdpbiA6IGVuZE1hcmdpbjtcblxuICAgIHRoaXMuX2FwcGx5Q3NzKGAke3RvcE1hcmdpbn1weCAke3JpZ2h0TWFyZ2lufXB4ICR7Ym90dG9tTWFyZ2lufXB4ICR7bGVmdE1hcmdpbn1weGApO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIHN0eWxlc2hlZXQgZm9yIHRoZSBzY3JvbGxiYXIgc3R5bGVzIGFuZCBjcmVhdGVzIGl0IGlmIG5lZWQgYmUuICovXG4gIHByaXZhdGUgX2dldFN0eWxlU2hlZXQoKTogQ1NTU3R5bGVTaGVldCB7XG4gICAgaWYgKCF0aGlzLl9zdHlsZUVsZW1lbnQpIHtcbiAgICAgIHRoaXMuX3N0eWxlRWxlbWVudCA9IHRoaXMuX2RvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XG5cbiAgICAgIGlmICh0aGlzLl9ub25jZSkge1xuICAgICAgICB0aGlzLl9zdHlsZUVsZW1lbnQubm9uY2UgPSB0aGlzLl9ub25jZTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fc3R5bGVSb290LmFwcGVuZENoaWxkKHRoaXMuX3N0eWxlRWxlbWVudCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX3N0eWxlRWxlbWVudC5zaGVldCBhcyBDU1NTdHlsZVNoZWV0O1xuICB9XG5cbiAgLyoqIFVwZGF0ZXMgdGhlIHN0eWxlc2hlZXQgd2l0aCB0aGUgc3BlY2lmaWVkIHNjcm9sbGJhciBzdHlsZS4gKi9cbiAgcHJpdmF0ZSBfYXBwbHlDc3ModmFsdWU6IHN0cmluZykge1xuICAgIHRoaXMuX2NsZWFyQ3NzKCk7XG4gICAgY29uc3Qgc2VsZWN0b3IgPSBgLiR7dGhpcy5fdW5pcXVlQ2xhc3NOYW1lfTo6LXdlYmtpdC1zY3JvbGxiYXItdHJhY2tgO1xuICAgIHRoaXMuX2dldFN0eWxlU2hlZXQoKS5pbnNlcnRSdWxlKGAke3NlbGVjdG9yfSB7bWFyZ2luOiAke3ZhbHVlfX1gLCAwKTtcblxuICAgIC8vIEZvcmNlIHRoZSBzY3JvbGxiYXIgdG8gcGFpbnQuXG4gICAgY29uc3QgZGlzcGxheSA9IHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5zdHlsZS5kaXNwbGF5O1xuICAgIHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgIHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gZGlzcGxheTtcbiAgfVxuXG4gIHByaXZhdGUgX2NsZWFyQ3NzKCkge1xuICAgIGNvbnN0IHN0eWxlU2hlZXQgPSB0aGlzLl9nZXRTdHlsZVNoZWV0KCk7XG4gICAgaWYgKHN0eWxlU2hlZXQuY3NzUnVsZXMubGVuZ3RoID4gMCkge1xuICAgICAgc3R5bGVTaGVldC5kZWxldGVSdWxlKDApO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBjb21wdXRlTWFyZ2luKHNpemVzOiAobnVtYmVyIHwgbnVsbCB8IHVuZGVmaW5lZClbXSk6IG51bWJlciB7XG4gIGxldCBtYXJnaW4gPSAwO1xuICBmb3IgKGNvbnN0IHNpemUgb2Ygc2l6ZXMpIHtcbiAgICBpZiAoc2l6ZSA9PSBudWxsKSB7XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgbWFyZ2luICs9IHNpemU7XG4gIH1cbiAgcmV0dXJuIG1hcmdpbjtcbn1cblxuZnVuY3Rpb24gYXJyYXlFcXVhbHMoYTE6IHVua25vd25bXSwgYTI6IHVua25vd25bXSkge1xuICBpZiAoYTEgPT09IGEyKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgaWYgKGExLmxlbmd0aCAhPT0gYTIubGVuZ3RoKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IGExLmxlbmd0aDsgaW5kZXgrKykge1xuICAgIGlmIChhMVtpbmRleF0gIT09IGEyW2luZGV4XSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufVxuIl19