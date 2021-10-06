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
        (_a = this._styleElement) === null || _a === void 0 ? void 0 : _a.remove();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFibGUtc2Nyb2xsLWNvbnRhaW5lci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL3RhYmxlLXNjcm9sbC1jb250YWluZXIvdGFibGUtc2Nyb2xsLWNvbnRhaW5lci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsU0FBUyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQXFCLFFBQVEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUN6RixPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDekMsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQ2pELE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUNyRCxPQUFPLEVBQ0wsMkJBQTJCLEdBSTVCLE1BQU0sb0JBQW9CLENBQUM7QUFFNUIsSUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDO0FBRWY7Ozs7Ozs7Ozs7R0FVRztBQVVILE1BQU0sT0FBTyx1QkFBdUI7SUFZbEMsWUFDcUIsV0FBb0MsRUFDbEIsU0FBbUIsRUFDekIsZUFBZ0M7UUFGNUMsZ0JBQVcsR0FBWCxXQUFXLENBQXlCO1FBQ2xCLGNBQVMsR0FBVCxTQUFTLENBQVU7UUFDekIsb0JBQWUsR0FBZixlQUFlLENBQWlCO1FBVGpFLG1FQUFtRTtRQUMzRCxnQkFBVyxHQUFpQixFQUFFLENBQUM7UUFDL0IsY0FBUyxHQUFpQixFQUFFLENBQUM7UUFDN0IsaUJBQVksR0FBaUIsRUFBRSxDQUFDO1FBQ2hDLGlCQUFZLEdBQWlCLEVBQUUsQ0FBQztRQU10QyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsOEJBQThCLEVBQUUsTUFBTSxFQUFFLENBQUM7UUFDakUsV0FBVyxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lB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LElBQUksSUFBSSxDQUFDLGdCQUFnQiwyQkFBMkIsQ0FBQztRQUN0RSxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUMsVUFBVSxDQUFDLEdBQUcsUUFBUSxhQUFhLEtBQUssR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ3hFLENBQUM7SUFFTyxTQUFTO1FBQ2YsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQ3pDLElBQUksVUFBVSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQ2xDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDMUI7SUFDSCxDQUFDOzs7WUF6R0YsU0FBUyxTQUFDO2dCQUNULFFBQVEsRUFBRSwyQkFBMkI7Z0JBQ3JDLElBQUksRUFBRTtvQkFDSixPQUFPLEVBQUUsNEJBQTRCO2lCQUN0QztnQkFDRCxTQUFTLEVBQUU7b0JBQ1QsRUFBQyxPQUFPLEVBQUUsMkJBQTJCLEVBQUUsV0FBVyxFQUFFLHVCQUF1QixFQUFDO2lCQUM3RTthQUNGOzs7WUFoQ2tCLFVBQVU7WUErQ3VCLFFBQVEsdUJBQXJELE1BQU0sU0FBQyxRQUFRO1lBN0NkLGNBQWMsdUJBOENmLFFBQVE7O0FBb0ZmLFNBQVMsYUFBYSxDQUFDLEtBQWdDO0lBQ3JELElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQztJQUNmLEtBQUssTUFBTSxJQUFJLElBQUksS0FBSyxFQUFFO1FBQ3hCLElBQUksSUFBSSxJQUFJLElBQUksRUFBRTtZQUNoQixNQUFNO1NBQ1A7UUFDRCxNQUFNLElBQUksSUFBSSxDQUFDO0tBQ2hCO0lBQ0QsT0FBTyxNQUFNLENBQUM7QUFDaEIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0RpcmVjdGl2ZSwgRWxlbWVudFJlZiwgSW5qZWN0LCBPbkRlc3Ryb3ksIE9uSW5pdCwgT3B0aW9uYWx9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtET0NVTUVOVH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7RGlyZWN0aW9uYWxpdHl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9iaWRpJztcbmltcG9ydCB7X2dldFNoYWRvd1Jvb3R9IGZyb20gJ0Bhbmd1bGFyL2Nkay9wbGF0Zm9ybSc7XG5pbXBvcnQge1xuICBTVElDS1lfUE9TSVRJT05JTkdfTElTVEVORVIsXG4gIFN0aWNreVBvc2l0aW9uaW5nTGlzdGVuZXIsXG4gIFN0aWNreVNpemUsXG4gIFN0aWNreVVwZGF0ZSxcbn0gZnJvbSAnQGFuZ3VsYXIvY2RrL3RhYmxlJztcblxubGV0IG5leHRJZCA9IDA7XG5cbi8qKlxuICogQXBwbGllcyBzdHlsZXMgdG8gdGhlIGhvc3QgZWxlbWVudCB0aGF0IG1ha2UgaXRzIHNjcm9sbGJhcnMgbWF0Y2ggdXAgd2l0aFxuICogdGhlIG5vbi1zdGlja3kgc2Nyb2xsYWJsZSBwb3J0aW9ucyBvZiB0aGUgQ2RrVGFibGUgY29udGFpbmVkIHdpdGhpbi5cbiAqXG4gKiBUaGlzIHZpc3VhbCBlZmZlY3Qgb25seSB3b3JrcyBpbiBXZWJraXQgYW5kIEJsaW5rIGJhc2VkIGJyb3dzZXJzIChlZyBDaHJvbWUsXG4gKiBTYWZhcmksIEVkZ2UpLiBPdGhlciBicm93c2VycyBzdWNoIGFzIEZpcmVmb3ggd2lsbCBncmFjZWZ1bGx5IGRlZ3JhZGUgdG9cbiAqIG5vcm1hbCBzY3JvbGxiYXIgYXBwZWFyYW5jZS5cbiAqIEZ1cnRoZXIgbm90ZTogVGhlc2Ugc3R5bGVzIGhhdmUgbm8gZWZmZWN0IHdoZW4gdGhlIGJyb3dzZXIgaXMgdXNpbmcgT1MtZGVmYXVsdFxuICogc2Nyb2xsYmFycy4gVGhlIGVhc2llc3Qgd2F5IHRvIGZvcmNlIHRoZW0gaW50byBjdXN0b20gbW9kZSBpcyB0byBzcGVjaWZ5IHdpZHRoXG4gKiBhbmQgaGVpZ2h0IGZvciB0aGUgc2Nyb2xsYmFyIGFuZCB0aHVtYi5cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW2Nka1RhYmxlU2Nyb2xsQ29udGFpbmVyXScsXG4gIGhvc3Q6IHtcbiAgICAnY2xhc3MnOiAnY2RrLXRhYmxlLXNjcm9sbC1jb250YWluZXInLFxuICB9LFxuICBwcm92aWRlcnM6IFtcbiAgICB7cHJvdmlkZTogU1RJQ0tZX1BPU0lUSU9OSU5HX0xJU1RFTkVSLCB1c2VFeGlzdGluZzogQ2RrVGFibGVTY3JvbGxDb250YWluZXJ9LFxuICBdLFxufSlcbmV4cG9ydCBjbGFzcyBDZGtUYWJsZVNjcm9sbENvbnRhaW5lciBpbXBsZW1lbnRzIFN0aWNreVBvc2l0aW9uaW5nTGlzdGVuZXIsXG4gICAgT25EZXN0cm95LCBPbkluaXQge1xuICBwcml2YXRlIHJlYWRvbmx5IF91bmlxdWVDbGFzc05hbWU6IHN0cmluZztcbiAgcHJpdmF0ZSBfc3R5bGVSb290ITogTm9kZTtcbiAgcHJpdmF0ZSBfc3R5bGVFbGVtZW50PzogSFRNTFN0eWxlRWxlbWVudDtcblxuICAvKiogVGhlIG1vc3QgcmVjZW50IHN0aWNreSBjb2x1bW4gc2l6ZSB2YWx1ZXMgZnJvbSB0aGUgQ2RrVGFibGUuICovXG4gIHByaXZhdGUgX3N0YXJ0U2l6ZXM6IFN0aWNreVNpemVbXSA9IFtdO1xuICBwcml2YXRlIF9lbmRTaXplczogU3RpY2t5U2l6ZVtdID0gW107XG4gIHByaXZhdGUgX2hlYWRlclNpemVzOiBTdGlja3lTaXplW10gPSBbXTtcbiAgcHJpdmF0ZSBfZm9vdGVyU2l6ZXM6IFN0aWNreVNpemVbXSA9IFtdO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSByZWFkb25seSBfZWxlbWVudFJlZjogRWxlbWVudFJlZjxIVE1MRWxlbWVudD4sXG4gICAgICBASW5qZWN0KERPQ1VNRU5UKSBwcml2YXRlIHJlYWRvbmx5IF9kb2N1bWVudDogRG9jdW1lbnQsXG4gICAgICBAT3B0aW9uYWwoKSBwcml2YXRlIHJlYWRvbmx5IF9kaXJlY3Rpb25hbGl0eT86IERpcmVjdGlvbmFsaXR5KSB7XG4gICAgdGhpcy5fdW5pcXVlQ2xhc3NOYW1lID0gYGNkay10YWJsZS1zY3JvbGwtY29udGFpbmVyLSR7KytuZXh0SWR9YDtcbiAgICBfZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LmNsYXNzTGlzdC5hZGQodGhpcy5fdW5pcXVlQ2xhc3NOYW1lKTtcbiAgfVxuXG4gIG5nT25Jbml0KCkge1xuICAgIC8vIE5vdGUgdGhhdCB3ZSBuZWVkIHRvIGxvb2sgdXAgdGhlIHJvb3Qgbm9kZSBpbiBuZ09uSW5pdCwgcmF0aGVyIHRoYW4gdGhlIGNvbnN0cnVjdG9yLCBiZWNhdXNlXG4gICAgLy8gQW5ndWxhciBzZWVtcyB0byBjcmVhdGUgdGhlIGVsZW1lbnQgb3V0c2lkZSB0aGUgc2hhZG93IHJvb3QgYW5kIHRoZW4gbW92ZXMgaXQgaW5zaWRlLCBpZiB0aGVcbiAgICAvLyBub2RlIGlzIGluc2lkZSBhbiBgbmdJZmAgYW5kIGEgU2hhZG93RG9tLWVuY2Fwc3VsYXRlZCBjb21wb25lbnQuXG4gICAgdGhpcy5fc3R5bGVSb290ID0gX2dldFNoYWRvd1Jvb3QodGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50KSA/PyB0aGlzLl9kb2N1bWVudC5oZWFkO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgdGhpcy5fc3R5bGVFbGVtZW50Py5yZW1vdmUoKTtcbiAgICB0aGlzLl9zdHlsZUVsZW1lbnQgPSB1bmRlZmluZWQ7XG4gIH1cblxuICBzdGlja3lDb2x1bW5zVXBkYXRlZCh7c2l6ZXN9OiBTdGlja3lVcGRhdGUpOiB2b2lkIHtcbiAgICB0aGlzLl9zdGFydFNpemVzID0gc2l6ZXM7XG4gICAgdGhpcy5fdXBkYXRlU2Nyb2xsYmFyKCk7XG4gIH1cblxuICBzdGlja3lFbmRDb2x1bW5zVXBkYXRlZCh7c2l6ZXN9OiBTdGlja3lVcGRhdGUpOiB2b2lkIHtcbiAgICB0aGlzLl9lbmRTaXplcyA9IHNpemVzO1xuICAgIHRoaXMuX3VwZGF0ZVNjcm9sbGJhcigpO1xuICB9XG5cbiAgc3RpY2t5SGVhZGVyUm93c1VwZGF0ZWQoe3NpemVzfTogU3RpY2t5VXBkYXRlKTogdm9pZCB7XG4gICAgdGhpcy5faGVhZGVyU2l6ZXMgPSBzaXplcztcbiAgICB0aGlzLl91cGRhdGVTY3JvbGxiYXIoKTtcbiAgfVxuXG4gIHN0aWNreUZvb3RlclJvd3NVcGRhdGVkKHtzaXplc306IFN0aWNreVVwZGF0ZSk6IHZvaWQge1xuICAgIHRoaXMuX2Zvb3RlclNpemVzID0gc2l6ZXM7XG4gICAgdGhpcy5fdXBkYXRlU2Nyb2xsYmFyKCk7XG4gIH1cblxuICAvKipcbiAgICogU2V0IHBhZGRpbmcgb24gdGhlIHNjcm9sbGJhciB0cmFjayBiYXNlZCBvbiB0aGUgc3RpY2t5IHN0YXRlcyBmcm9tIENka1RhYmxlLlxuICAgKi9cbiAgcHJpdmF0ZSBfdXBkYXRlU2Nyb2xsYmFyKCk6IHZvaWQge1xuICAgIGNvbnN0IHRvcE1hcmdpbiA9IGNvbXB1dGVNYXJnaW4odGhpcy5faGVhZGVyU2l6ZXMpO1xuICAgIGNvbnN0IGJvdHRvbU1hcmdpbiA9IGNvbXB1dGVNYXJnaW4odGhpcy5fZm9vdGVyU2l6ZXMpO1xuICAgIGNvbnN0IHN0YXJ0TWFyZ2luID0gY29tcHV0ZU1hcmdpbih0aGlzLl9zdGFydFNpemVzKTtcbiAgICBjb25zdCBlbmRNYXJnaW4gPSBjb21wdXRlTWFyZ2luKHRoaXMuX2VuZFNpemVzKTtcblxuICAgIGlmICh0b3BNYXJnaW4gPT09IDAgJiYgYm90dG9tTWFyZ2luID09PSAwICYmIHN0YXJ0TWFyZ2luID09PSAwICYmIGVuZE1hcmdpbiA9PT0gMCkge1xuICAgICAgdGhpcy5fY2xlYXJDc3MoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBkaXJlY3Rpb24gPSB0aGlzLl9kaXJlY3Rpb25hbGl0eSA/IHRoaXMuX2RpcmVjdGlvbmFsaXR5LnZhbHVlIDogJ2x0cic7XG4gICAgY29uc3QgbGVmdE1hcmdpbiA9IGRpcmVjdGlvbiA9PT0gJ3J0bCcgPyBlbmRNYXJnaW4gOiBzdGFydE1hcmdpbjtcbiAgICBjb25zdCByaWdodE1hcmdpbiA9IGRpcmVjdGlvbiA9PT0gJ3J0bCcgPyBzdGFydE1hcmdpbiA6IGVuZE1hcmdpbjtcblxuICAgIHRoaXMuX2FwcGx5Q3NzKGAke3RvcE1hcmdpbn1weCAke3JpZ2h0TWFyZ2lufXB4ICR7Ym90dG9tTWFyZ2lufXB4ICR7bGVmdE1hcmdpbn1weGApO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIHN0eWxlc2hlZXQgZm9yIHRoZSBzY3JvbGxiYXIgc3R5bGVzIGFuZCBjcmVhdGVzIGl0IGlmIG5lZWQgYmUuICovXG4gIHByaXZhdGUgX2dldFN0eWxlU2hlZXQoKTogQ1NTU3R5bGVTaGVldCB7XG4gICAgaWYgKCF0aGlzLl9zdHlsZUVsZW1lbnQpIHtcbiAgICAgIHRoaXMuX3N0eWxlRWxlbWVudCA9IHRoaXMuX2RvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XG4gICAgICB0aGlzLl9zdHlsZVJvb3QuYXBwZW5kQ2hpbGQodGhpcy5fc3R5bGVFbGVtZW50KTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fc3R5bGVFbGVtZW50LnNoZWV0IGFzIENTU1N0eWxlU2hlZXQ7XG4gIH1cblxuICAvKiogVXBkYXRlcyB0aGUgc3R5bGVzaGVldCB3aXRoIHRoZSBzcGVjaWZpZWQgc2Nyb2xsYmFyIHN0eWxlLiAqL1xuICBwcml2YXRlIF9hcHBseUNzcyh2YWx1ZTogc3RyaW5nKSB7XG4gICAgdGhpcy5fY2xlYXJDc3MoKTtcblxuICAgIGNvbnN0IHNlbGVjdG9yID0gYC4ke3RoaXMuX3VuaXF1ZUNsYXNzTmFtZX06Oi13ZWJraXQtc2Nyb2xsYmFyLXRyYWNrYDtcbiAgICB0aGlzLl9nZXRTdHlsZVNoZWV0KCkuaW5zZXJ0UnVsZShgJHtzZWxlY3Rvcn0ge21hcmdpbjogJHt2YWx1ZX19YCwgMCk7XG4gIH1cblxuICBwcml2YXRlIF9jbGVhckNzcygpIHtcbiAgICBjb25zdCBzdHlsZVNoZWV0ID0gdGhpcy5fZ2V0U3R5bGVTaGVldCgpO1xuICAgIGlmIChzdHlsZVNoZWV0LmNzc1J1bGVzLmxlbmd0aCA+IDApIHtcbiAgICAgIHN0eWxlU2hlZXQuZGVsZXRlUnVsZSgwKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gY29tcHV0ZU1hcmdpbihzaXplczogKG51bWJlcnxudWxsfHVuZGVmaW5lZClbXSk6IG51bWJlciB7XG4gIGxldCBtYXJnaW4gPSAwO1xuICBmb3IgKGNvbnN0IHNpemUgb2Ygc2l6ZXMpIHtcbiAgICBpZiAoc2l6ZSA9PSBudWxsKSB7XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgbWFyZ2luICs9IHNpemU7XG4gIH1cbiAgcmV0dXJuIG1hcmdpbjtcbn1cbiJdfQ==