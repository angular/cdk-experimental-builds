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
    }
    _clearCss() {
        const styleSheet = this._getStyleSheet();
        if (styleSheet.cssRules.length > 0) {
            styleSheet.deleteRule(0);
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.0.0-next.4", ngImport: i0, type: CdkTableScrollContainer, deps: [{ token: i0.ElementRef }, { token: DOCUMENT }, { token: i1.Directionality, optional: true }, { token: CSP_NONCE, optional: true }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "17.0.0-next.4", type: CdkTableScrollContainer, selector: "[cdkTableScrollContainer]", host: { classAttribute: "cdk-table-scroll-container" }, providers: [{ provide: STICKY_POSITIONING_LISTENER, useExisting: CdkTableScrollContainer }], ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.0.0-next.4", ngImport: i0, type: CdkTableScrollContainer, decorators: [{
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
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [CSP_NONCE]
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFibGUtc2Nyb2xsLWNvbnRhaW5lci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL3RhYmxlLXNjcm9sbC1jb250YWluZXIvdGFibGUtc2Nyb2xsLWNvbnRhaW5lci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFxQixRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDcEcsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQ3pDLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUNqRCxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDckQsT0FBTyxFQUNMLDJCQUEyQixHQUk1QixNQUFNLG9CQUFvQixDQUFDOzs7QUFFNUIsSUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDO0FBRWY7Ozs7Ozs7Ozs7R0FVRztBQVFILE1BQU0sT0FBTyx1QkFBdUI7SUFXbEMsWUFDbUIsV0FBb0MsRUFDbEIsU0FBbUIsRUFDekIsZUFBZ0MsRUFDYixNQUFzQjtRQUhyRCxnQkFBVyxHQUFYLFdBQVcsQ0FBeUI7UUFDbEIsY0FBUyxHQUFULFNBQVMsQ0FBVTtRQUN6QixvQkFBZSxHQUFmLGVBQWUsQ0FBaUI7UUFDYixXQUFNLEdBQU4sTUFBTSxDQUFnQjtRQVZ4RSxtRUFBbUU7UUFDM0QsZ0JBQVcsR0FBaUIsRUFBRSxDQUFDO1FBQy9CLGNBQVMsR0FBaUIsRUFBRSxDQUFDO1FBQzdCLGlCQUFZLEdBQWlCLEVBQUUsQ0FBQztRQUNoQyxpQkFBWSxHQUFpQixFQUFFLENBQUM7UUFRdEMsSUFBSSxDQUFDLGdCQUFnQixHQUFHLDhCQUE4QixFQUFFLE1BQU0sRUFBRSxDQUFDO1FBQ2pFLFdBQVcsQ0FBQyxhQUFhLENBQUMs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SUFBSSxJQUFJLEVBQUU7WUFDaEIsTUFBTTtTQUNQO1FBQ0QsTUFBTSxJQUFJLElBQUksQ0FBQztLQUNoQjtJQUNELE9BQU8sTUFBTSxDQUFDO0FBQ2hCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtDU1BfTk9OQ0UsIERpcmVjdGl2ZSwgRWxlbWVudFJlZiwgSW5qZWN0LCBPbkRlc3Ryb3ksIE9uSW5pdCwgT3B0aW9uYWx9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtET0NVTUVOVH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7RGlyZWN0aW9uYWxpdHl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9iaWRpJztcbmltcG9ydCB7X2dldFNoYWRvd1Jvb3R9IGZyb20gJ0Bhbmd1bGFyL2Nkay9wbGF0Zm9ybSc7XG5pbXBvcnQge1xuICBTVElDS1lfUE9TSVRJT05JTkdfTElTVEVORVIsXG4gIFN0aWNreVBvc2l0aW9uaW5nTGlzdGVuZXIsXG4gIFN0aWNreVNpemUsXG4gIFN0aWNreVVwZGF0ZSxcbn0gZnJvbSAnQGFuZ3VsYXIvY2RrL3RhYmxlJztcblxubGV0IG5leHRJZCA9IDA7XG5cbi8qKlxuICogQXBwbGllcyBzdHlsZXMgdG8gdGhlIGhvc3QgZWxlbWVudCB0aGF0IG1ha2UgaXRzIHNjcm9sbGJhcnMgbWF0Y2ggdXAgd2l0aFxuICogdGhlIG5vbi1zdGlja3kgc2Nyb2xsYWJsZSBwb3J0aW9ucyBvZiB0aGUgQ2RrVGFibGUgY29udGFpbmVkIHdpdGhpbi5cbiAqXG4gKiBUaGlzIHZpc3VhbCBlZmZlY3Qgb25seSB3b3JrcyBpbiBXZWJraXQgYW5kIEJsaW5rIGJhc2VkIGJyb3dzZXJzIChlZyBDaHJvbWUsXG4gKiBTYWZhcmksIEVkZ2UpLiBPdGhlciBicm93c2VycyBzdWNoIGFzIEZpcmVmb3ggd2lsbCBncmFjZWZ1bGx5IGRlZ3JhZGUgdG9cbiAqIG5vcm1hbCBzY3JvbGxiYXIgYXBwZWFyYW5jZS5cbiAqIEZ1cnRoZXIgbm90ZTogVGhlc2Ugc3R5bGVzIGhhdmUgbm8gZWZmZWN0IHdoZW4gdGhlIGJyb3dzZXIgaXMgdXNpbmcgT1MtZGVmYXVsdFxuICogc2Nyb2xsYmFycy4gVGhlIGVhc2llc3Qgd2F5IHRvIGZvcmNlIHRoZW0gaW50byBjdXN0b20gbW9kZSBpcyB0byBzcGVjaWZ5IHdpZHRoXG4gKiBhbmQgaGVpZ2h0IGZvciB0aGUgc2Nyb2xsYmFyIGFuZCB0aHVtYi5cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW2Nka1RhYmxlU2Nyb2xsQ29udGFpbmVyXScsXG4gIGhvc3Q6IHtcbiAgICAnY2xhc3MnOiAnY2RrLXRhYmxlLXNjcm9sbC1jb250YWluZXInLFxuICB9LFxuICBwcm92aWRlcnM6IFt7cHJvdmlkZTogU1RJQ0tZX1BPU0lUSU9OSU5HX0xJU1RFTkVSLCB1c2VFeGlzdGluZzogQ2RrVGFibGVTY3JvbGxDb250YWluZXJ9XSxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrVGFibGVTY3JvbGxDb250YWluZXIgaW1wbGVtZW50cyBTdGlja3lQb3NpdGlvbmluZ0xpc3RlbmVyLCBPbkRlc3Ryb3ksIE9uSW5pdCB7XG4gIHByaXZhdGUgcmVhZG9ubHkgX3VuaXF1ZUNsYXNzTmFtZTogc3RyaW5nO1xuICBwcml2YXRlIF9zdHlsZVJvb3QhOiBOb2RlO1xuICBwcml2YXRlIF9zdHlsZUVsZW1lbnQ/OiBIVE1MU3R5bGVFbGVtZW50O1xuXG4gIC8qKiBUaGUgbW9zdCByZWNlbnQgc3RpY2t5IGNvbHVtbiBzaXplIHZhbHVlcyBmcm9tIHRoZSBDZGtUYWJsZS4gKi9cbiAgcHJpdmF0ZSBfc3RhcnRTaXplczogU3RpY2t5U2l6ZVtdID0gW107XG4gIHByaXZhdGUgX2VuZFNpemVzOiBTdGlja3lTaXplW10gPSBbXTtcbiAgcHJpdmF0ZSBfaGVhZGVyU2l6ZXM6IFN0aWNreVNpemVbXSA9IFtdO1xuICBwcml2YXRlIF9mb290ZXJTaXplczogU3RpY2t5U2l6ZVtdID0gW107XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSByZWFkb25seSBfZWxlbWVudFJlZjogRWxlbWVudFJlZjxIVE1MRWxlbWVudD4sXG4gICAgQEluamVjdChET0NVTUVOVCkgcHJpdmF0ZSByZWFkb25seSBfZG9jdW1lbnQ6IERvY3VtZW50LFxuICAgIEBPcHRpb25hbCgpIHByaXZhdGUgcmVhZG9ubHkgX2RpcmVjdGlvbmFsaXR5PzogRGlyZWN0aW9uYWxpdHksXG4gICAgQE9wdGlvbmFsKCkgQEluamVjdChDU1BfTk9OQ0UpIHByaXZhdGUgcmVhZG9ubHkgX25vbmNlPzogc3RyaW5nIHwgbnVsbCxcbiAgKSB7XG4gICAgdGhpcy5fdW5pcXVlQ2xhc3NOYW1lID0gYGNkay10YWJsZS1zY3JvbGwtY29udGFpbmVyLSR7KytuZXh0SWR9YDtcbiAgICBfZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LmNsYXNzTGlzdC5hZGQodGhpcy5fdW5pcXVlQ2xhc3NOYW1lKTtcbiAgfVxuXG4gIG5nT25Jbml0KCkge1xuICAgIC8vIE5vdGUgdGhhdCB3ZSBuZWVkIHRvIGxvb2sgdXAgdGhlIHJvb3Qgbm9kZSBpbiBuZ09uSW5pdCwgcmF0aGVyIHRoYW4gdGhlIGNvbnN0cnVjdG9yLCBiZWNhdXNlXG4gICAgLy8gQW5ndWxhciBzZWVtcyB0byBjcmVhdGUgdGhlIGVsZW1lbnQgb3V0c2lkZSB0aGUgc2hhZG93IHJvb3QgYW5kIHRoZW4gbW92ZXMgaXQgaW5zaWRlLCBpZiB0aGVcbiAgICAvLyBub2RlIGlzIGluc2lkZSBhbiBgbmdJZmAgYW5kIGEgU2hhZG93RG9tLWVuY2Fwc3VsYXRlZCBjb21wb25lbnQuXG4gICAgdGhpcy5fc3R5bGVSb290ID0gX2dldFNoYWRvd1Jvb3QodGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50KSA/PyB0aGlzLl9kb2N1bWVudC5oZWFkO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgdGhpcy5fc3R5bGVFbGVtZW50Py5yZW1vdmUoKTtcbiAgICB0aGlzLl9zdHlsZUVsZW1lbnQgPSB1bmRlZmluZWQ7XG4gIH1cblxuICBzdGlja3lDb2x1bW5zVXBkYXRlZCh7c2l6ZXN9OiBTdGlja3lVcGRhdGUpOiB2b2lkIHtcbiAgICB0aGlzLl9zdGFydFNpemVzID0gc2l6ZXM7XG4gICAgdGhpcy5fdXBkYXRlU2Nyb2xsYmFyKCk7XG4gIH1cblxuICBzdGlja3lFbmRDb2x1bW5zVXBkYXRlZCh7c2l6ZXN9OiBTdGlja3lVcGRhdGUpOiB2b2lkIHtcbiAgICB0aGlzLl9lbmRTaXplcyA9IHNpemVzO1xuICAgIHRoaXMuX3VwZGF0ZVNjcm9sbGJhcigpO1xuICB9XG5cbiAgc3RpY2t5SGVhZGVyUm93c1VwZGF0ZWQoe3NpemVzfTogU3RpY2t5VXBkYXRlKTogdm9pZCB7XG4gICAgdGhpcy5faGVhZGVyU2l6ZXMgPSBzaXplcztcbiAgICB0aGlzLl91cGRhdGVTY3JvbGxiYXIoKTtcbiAgfVxuXG4gIHN0aWNreUZvb3RlclJvd3NVcGRhdGVkKHtzaXplc306IFN0aWNreVVwZGF0ZSk6IHZvaWQge1xuICAgIHRoaXMuX2Zvb3RlclNpemVzID0gc2l6ZXM7XG4gICAgdGhpcy5fdXBkYXRlU2Nyb2xsYmFyKCk7XG4gIH1cblxuICAvKipcbiAgICogU2V0IHBhZGRpbmcgb24gdGhlIHNjcm9sbGJhciB0cmFjayBiYXNlZCBvbiB0aGUgc3RpY2t5IHN0YXRlcyBmcm9tIENka1RhYmxlLlxuICAgKi9cbiAgcHJpdmF0ZSBfdXBkYXRlU2Nyb2xsYmFyKCk6IHZvaWQge1xuICAgIGNvbnN0IHRvcE1hcmdpbiA9IGNvbXB1dGVNYXJnaW4odGhpcy5faGVhZGVyU2l6ZXMpO1xuICAgIGNvbnN0IGJvdHRvbU1hcmdpbiA9IGNvbXB1dGVNYXJnaW4odGhpcy5fZm9vdGVyU2l6ZXMpO1xuICAgIGNvbnN0IHN0YXJ0TWFyZ2luID0gY29tcHV0ZU1hcmdpbih0aGlzLl9zdGFydFNpemVzKTtcbiAgICBjb25zdCBlbmRNYXJnaW4gPSBjb21wdXRlTWFyZ2luKHRoaXMuX2VuZFNpemVzKTtcblxuICAgIGlmICh0b3BNYXJnaW4gPT09IDAgJiYgYm90dG9tTWFyZ2luID09PSAwICYmIHN0YXJ0TWFyZ2luID09PSAwICYmIGVuZE1hcmdpbiA9PT0gMCkge1xuICAgICAgdGhpcy5fY2xlYXJDc3MoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBkaXJlY3Rpb24gPSB0aGlzLl9kaXJlY3Rpb25hbGl0eSA/IHRoaXMuX2RpcmVjdGlvbmFsaXR5LnZhbHVlIDogJ2x0cic7XG4gICAgY29uc3QgbGVmdE1hcmdpbiA9IGRpcmVjdGlvbiA9PT0gJ3J0bCcgPyBlbmRNYXJnaW4gOiBzdGFydE1hcmdpbjtcbiAgICBjb25zdCByaWdodE1hcmdpbiA9IGRpcmVjdGlvbiA9PT0gJ3J0bCcgPyBzdGFydE1hcmdpbiA6IGVuZE1hcmdpbjtcblxuICAgIHRoaXMuX2FwcGx5Q3NzKGAke3RvcE1hcmdpbn1weCAke3JpZ2h0TWFyZ2lufXB4ICR7Ym90dG9tTWFyZ2lufXB4ICR7bGVmdE1hcmdpbn1weGApO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIHN0eWxlc2hlZXQgZm9yIHRoZSBzY3JvbGxiYXIgc3R5bGVzIGFuZCBjcmVhdGVzIGl0IGlmIG5lZWQgYmUuICovXG4gIHByaXZhdGUgX2dldFN0eWxlU2hlZXQoKTogQ1NTU3R5bGVTaGVldCB7XG4gICAgaWYgKCF0aGlzLl9zdHlsZUVsZW1lbnQpIHtcbiAgICAgIHRoaXMuX3N0eWxlRWxlbWVudCA9IHRoaXMuX2RvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XG5cbiAgICAgIGlmICh0aGlzLl9ub25jZSkge1xuICAgICAgICB0aGlzLl9zdHlsZUVsZW1lbnQubm9uY2UgPSB0aGlzLl9ub25jZTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fc3R5bGVSb290LmFwcGVuZENoaWxkKHRoaXMuX3N0eWxlRWxlbWVudCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX3N0eWxlRWxlbWVudC5zaGVldCBhcyBDU1NTdHlsZVNoZWV0O1xuICB9XG5cbiAgLyoqIFVwZGF0ZXMgdGhlIHN0eWxlc2hlZXQgd2l0aCB0aGUgc3BlY2lmaWVkIHNjcm9sbGJhciBzdHlsZS4gKi9cbiAgcHJpdmF0ZSBfYXBwbHlDc3ModmFsdWU6IHN0cmluZykge1xuICAgIHRoaXMuX2NsZWFyQ3NzKCk7XG5cbiAgICBjb25zdCBzZWxlY3RvciA9IGAuJHt0aGlzLl91bmlxdWVDbGFzc05hbWV9Ojotd2Via2l0LXNjcm9sbGJhci10cmFja2A7XG4gICAgdGhpcy5fZ2V0U3R5bGVTaGVldCgpLmluc2VydFJ1bGUoYCR7c2VsZWN0b3J9IHttYXJnaW46ICR7dmFsdWV9fWAsIDApO1xuICB9XG5cbiAgcHJpdmF0ZSBfY2xlYXJDc3MoKSB7XG4gICAgY29uc3Qgc3R5bGVTaGVldCA9IHRoaXMuX2dldFN0eWxlU2hlZXQoKTtcbiAgICBpZiAoc3R5bGVTaGVldC5jc3NSdWxlcy5sZW5ndGggPiAwKSB7XG4gICAgICBzdHlsZVNoZWV0LmRlbGV0ZVJ1bGUoMCk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGNvbXB1dGVNYXJnaW4oc2l6ZXM6IChudW1iZXIgfCBudWxsIHwgdW5kZWZpbmVkKVtdKTogbnVtYmVyIHtcbiAgbGV0IG1hcmdpbiA9IDA7XG4gIGZvciAoY29uc3Qgc2l6ZSBvZiBzaXplcykge1xuICAgIGlmIChzaXplID09IG51bGwpIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBtYXJnaW4gKz0gc2l6ZTtcbiAgfVxuICByZXR1cm4gbWFyZ2luO1xufVxuIl19