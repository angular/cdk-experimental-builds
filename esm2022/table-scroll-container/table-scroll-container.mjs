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
                this._styleElement.setAttribute('nonce', this._nonce);
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.0", ngImport: i0, type: CdkTableScrollContainer, deps: [{ token: i0.ElementRef }, { token: DOCUMENT }, { token: i1.Directionality, optional: true }, { token: CSP_NONCE, optional: true }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.0.0", type: CdkTableScrollContainer, isStandalone: true, selector: "[cdkTableScrollContainer]", host: { classAttribute: "cdk-table-scroll-container" }, providers: [{ provide: STICKY_POSITIONING_LISTENER, useExisting: CdkTableScrollContainer }], ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.0", ngImport: i0, type: CdkTableScrollContainer, decorators: [{
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFibGUtc2Nyb2xsLWNvbnRhaW5lci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL3RhYmxlLXNjcm9sbC1jb250YWluZXIvdGFibGUtc2Nyb2xsLWNvbnRhaW5lci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFxQixRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDcEcsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQ3pDLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUNqRCxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDckQsT0FBTyxFQUNMLDJCQUEyQixHQUk1QixNQUFNLG9CQUFvQixDQUFDOzs7QUFFNUIsSUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDO0FBRWY7Ozs7Ozs7Ozs7R0FVRztBQVNILE1BQU0sT0FBTyx1QkFBdUI7SUFXbEMsWUFDbUIsV0FBb0MsRUFDbEIsU0FBbUIsRUFDekIsZUFBZ0MsRUFDYixNQUFzQjtRQUhyRCxnQkFBVyxHQUFYLFdBQVcsQ0FBeUI7UUFDbEIsY0FBUyxHQUFULFNBQVMsQ0FBVTtRQUN6QixvQkFBZSxHQUFmLGVBQWUsQ0FBaUI7UUFDYixXQUFNLEdBQU4sTUFBTSxDQUFnQjtRQVZ4RSxtRUFBbUU7UUFDM0QsZ0JBQVcsR0FBaUIsRUFBRSxDQUFDO1FBQy9CLGNBQVMsR0FBaUIsRUFBRSxDQUFDO1FBQzdCLGlCQUFZLEdBQWlCLEVBQUUsQ0FBQztRQUNoQyxpQkFBWSxHQUFpQixFQUFFLENBQUM7UUFRdEMsSUFBSSxDQUFDLGdCQUFnQixHQUFHLDhCQUE4QixFQUFFLE1BQU0sRUFBRSxDQUFDO1FBQ2pFLFdBQVcsQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUNqRSxDQUFDO0lBRUQsUUFBUTtRQUNOLCtGQUErRjtRQUMvRiwrRkFBK0Y7UUFDL0YsbUVBQW1FO1FBQ25FLElBQUksQ0FBQyxVQUFVLEdBQUcsY0FBYyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUM7SUFDMUYsQ0FBQztJQUVELFdBQVc7UUFDVCxJQUFJLENBQUMsYUFBYSxFQUFFLE1BQU0sRUFBRSxDQUFDO1FBQzdCLElBQUksQ0FBQyxhQUFhLEdBQUcsU0FBUyxDQUFDO0lBQ2pDLENBQUM7SUFFRCxvQkFBb0IsQ0FBQyxFQUFDLEtBQUssRUFBZTtRQUN4QyxJQUFJLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQztRQUN6QixJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztJQUMxQixDQUFDO0lBRUQsdUJBQXVCLENBQUMsRUFBQyxLQUFLLEVBQWU7UUFDM0MsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7UUFDdkIsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7SUFDMUIsQ0FBQztJQUVELHVCQUF1QixDQUFDLEVBQUMsS0FBSyxFQUFlO1FBQzNDLElBQUksQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDO1FBQzFCLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0lBQzFCLENBQUM7SUFFRCx1QkFBdUIsQ0FBQyxFQUFDLEtBQUssRUFBZTtRQUMzQyxJQUFJLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQztRQUMxQixJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztJQUMxQixDQUFDO0lBRUQ7O09BRUc7SUFDSyxnQkFBZ0I7UUFDdEIsTUFBTSxTQUFTLEdBQUcsYUFBYSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUNuRCxNQUFNLFlBQVksR0FBRyxhQUFhLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ3RELE1BQU0sV0FBVyxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDcEQsTUFBTSxTQUFTLEdBQUcsYUFBYSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUVoRCxJQUFJLFNBQVMsS0FBSyxDQUFDLElBQUksWUFBWSxLQUFLLENBQUMsSUFBSSxXQUFXLEtBQUssQ0FBQyxJQUFJLFNBQVMsS0FBSyxDQUFDLEVBQUUsQ0FBQztZQUNsRixJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDakIsT0FBTztRQUNULENBQUM7UUFFRCxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1FBQzVFLE1BQU0sVUFBVSxHQUFHLFNBQVMsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDO1FBQ2pFLE1BQU0sV0FBVyxHQUFHLFNBQVMsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBRWxFLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxTQUFTLE1BQU0sV0FBVyxNQUFNLFlBQVksTUFBTSxVQUFVLElBQUksQ0FBQyxDQUFDO0lBQ3RGLENBQUM7SUFFRCw4RUFBOEU7SUFDdEUsY0FBYztRQUNwQixJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQ3hCLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFM0QsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQ2hCLElBQUksQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDeEQsQ0FBQztZQUVELElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUNsRCxDQUFDO1FBRUQsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQXNCLENBQUM7SUFDbkQsQ0FBQztJQUVELGlFQUFpRTtJQUN6RCxTQUFTLENBQUMsS0FBYTtRQUM3QixJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7UUFFakIsTUFBTSxRQUFRLEdBQUcsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLDJCQUEyQixDQUFDO1FBQ3RFLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQyxVQUFVLENBQUMsR0FBRyxRQUFRLGFBQWEsS0FBSyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDeEUsQ0FBQztJQUVPLFNBQVM7UUFDZixNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDekMsSUFBSSxVQUFVLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztZQUNuQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzNCLENBQUM7SUFDSCxDQUFDOzhHQXRHVSx1QkFBdUIsNENBYXhCLFFBQVEsMkRBRUksU0FBUztrR0FmcEIsdUJBQXVCLGdJQUh2QixDQUFDLEVBQUMsT0FBTyxFQUFFLDJCQUEyQixFQUFFLFdBQVcsRUFBRSx1QkFBdUIsRUFBQyxDQUFDOzsyRkFHOUUsdUJBQXVCO2tCQVJuQyxTQUFTO21CQUFDO29CQUNULFFBQVEsRUFBRSwyQkFBMkI7b0JBQ3JDLElBQUksRUFBRTt3QkFDSixPQUFPLEVBQUUsNEJBQTRCO3FCQUN0QztvQkFDRCxTQUFTLEVBQUUsQ0FBQyxFQUFDLE9BQU8sRUFBRSwyQkFBMkIsRUFBRSxXQUFXLHlCQUF5QixFQUFDLENBQUM7b0JBQ3pGLFVBQVUsRUFBRSxJQUFJO2lCQUNqQjs7MEJBY0ksTUFBTTsyQkFBQyxRQUFROzswQkFDZixRQUFROzswQkFDUixRQUFROzswQkFBSSxNQUFNOzJCQUFDLFNBQVM7O0FBMEZqQyxTQUFTLGFBQWEsQ0FBQyxLQUFvQztJQUN6RCxJQUFJLE1BQU0sR0FBRyxDQUFDLENBQUM7SUFDZixLQUFLLE1BQU0sSUFBSSxJQUFJLEtBQUssRUFBRSxDQUFDO1FBQ3pCLElBQUksSUFBSSxJQUFJLElBQUksRUFBRSxDQUFDO1lBQ2pCLE1BQU07UUFDUixDQUFDO1FBQ0QsTUFBTSxJQUFJLElBQUksQ0FBQztJQUNqQixDQUFDO0lBQ0QsT0FBTyxNQUFNLENBQUM7QUFDaEIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0NTUF9OT05DRSwgRGlyZWN0aXZlLCBFbGVtZW50UmVmLCBJbmplY3QsIE9uRGVzdHJveSwgT25Jbml0LCBPcHRpb25hbH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0RPQ1VNRU5UfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHtEaXJlY3Rpb25hbGl0eX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2JpZGknO1xuaW1wb3J0IHtfZ2V0U2hhZG93Um9vdH0gZnJvbSAnQGFuZ3VsYXIvY2RrL3BsYXRmb3JtJztcbmltcG9ydCB7XG4gIFNUSUNLWV9QT1NJVElPTklOR19MSVNURU5FUixcbiAgU3RpY2t5UG9zaXRpb25pbmdMaXN0ZW5lcixcbiAgU3RpY2t5U2l6ZSxcbiAgU3RpY2t5VXBkYXRlLFxufSBmcm9tICdAYW5ndWxhci9jZGsvdGFibGUnO1xuXG5sZXQgbmV4dElkID0gMDtcblxuLyoqXG4gKiBBcHBsaWVzIHN0eWxlcyB0byB0aGUgaG9zdCBlbGVtZW50IHRoYXQgbWFrZSBpdHMgc2Nyb2xsYmFycyBtYXRjaCB1cCB3aXRoXG4gKiB0aGUgbm9uLXN0aWNreSBzY3JvbGxhYmxlIHBvcnRpb25zIG9mIHRoZSBDZGtUYWJsZSBjb250YWluZWQgd2l0aGluLlxuICpcbiAqIFRoaXMgdmlzdWFsIGVmZmVjdCBvbmx5IHdvcmtzIGluIFdlYmtpdCBhbmQgQmxpbmsgYmFzZWQgYnJvd3NlcnMgKGVnIENocm9tZSxcbiAqIFNhZmFyaSwgRWRnZSkuIE90aGVyIGJyb3dzZXJzIHN1Y2ggYXMgRmlyZWZveCB3aWxsIGdyYWNlZnVsbHkgZGVncmFkZSB0b1xuICogbm9ybWFsIHNjcm9sbGJhciBhcHBlYXJhbmNlLlxuICogRnVydGhlciBub3RlOiBUaGVzZSBzdHlsZXMgaGF2ZSBubyBlZmZlY3Qgd2hlbiB0aGUgYnJvd3NlciBpcyB1c2luZyBPUy1kZWZhdWx0XG4gKiBzY3JvbGxiYXJzLiBUaGUgZWFzaWVzdCB3YXkgdG8gZm9yY2UgdGhlbSBpbnRvIGN1c3RvbSBtb2RlIGlzIHRvIHNwZWNpZnkgd2lkdGhcbiAqIGFuZCBoZWlnaHQgZm9yIHRoZSBzY3JvbGxiYXIgYW5kIHRodW1iLlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbY2RrVGFibGVTY3JvbGxDb250YWluZXJdJyxcbiAgaG9zdDoge1xuICAgICdjbGFzcyc6ICdjZGstdGFibGUtc2Nyb2xsLWNvbnRhaW5lcicsXG4gIH0sXG4gIHByb3ZpZGVyczogW3twcm92aWRlOiBTVElDS1lfUE9TSVRJT05JTkdfTElTVEVORVIsIHVzZUV4aXN0aW5nOiBDZGtUYWJsZVNjcm9sbENvbnRhaW5lcn1dLFxuICBzdGFuZGFsb25lOiB0cnVlLFxufSlcbmV4cG9ydCBjbGFzcyBDZGtUYWJsZVNjcm9sbENvbnRhaW5lciBpbXBsZW1lbnRzIFN0aWNreVBvc2l0aW9uaW5nTGlzdGVuZXIsIE9uRGVzdHJveSwgT25Jbml0IHtcbiAgcHJpdmF0ZSByZWFkb25seSBfdW5pcXVlQ2xhc3NOYW1lOiBzdHJpbmc7XG4gIHByaXZhdGUgX3N0eWxlUm9vdCE6IE5vZGU7XG4gIHByaXZhdGUgX3N0eWxlRWxlbWVudD86IEhUTUxTdHlsZUVsZW1lbnQ7XG5cbiAgLyoqIFRoZSBtb3N0IHJlY2VudCBzdGlja3kgY29sdW1uIHNpemUgdmFsdWVzIGZyb20gdGhlIENka1RhYmxlLiAqL1xuICBwcml2YXRlIF9zdGFydFNpemVzOiBTdGlja3lTaXplW10gPSBbXTtcbiAgcHJpdmF0ZSBfZW5kU2l6ZXM6IFN0aWNreVNpemVbXSA9IFtdO1xuICBwcml2YXRlIF9oZWFkZXJTaXplczogU3RpY2t5U2l6ZVtdID0gW107XG4gIHByaXZhdGUgX2Zvb3RlclNpemVzOiBTdGlja3lTaXplW10gPSBbXTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIHJlYWRvbmx5IF9lbGVtZW50UmVmOiBFbGVtZW50UmVmPEhUTUxFbGVtZW50PixcbiAgICBASW5qZWN0KERPQ1VNRU5UKSBwcml2YXRlIHJlYWRvbmx5IF9kb2N1bWVudDogRG9jdW1lbnQsXG4gICAgQE9wdGlvbmFsKCkgcHJpdmF0ZSByZWFkb25seSBfZGlyZWN0aW9uYWxpdHk/OiBEaXJlY3Rpb25hbGl0eSxcbiAgICBAT3B0aW9uYWwoKSBASW5qZWN0KENTUF9OT05DRSkgcHJpdmF0ZSByZWFkb25seSBfbm9uY2U/OiBzdHJpbmcgfCBudWxsLFxuICApIHtcbiAgICB0aGlzLl91bmlxdWVDbGFzc05hbWUgPSBgY2RrLXRhYmxlLXNjcm9sbC1jb250YWluZXItJHsrK25leHRJZH1gO1xuICAgIF9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQuY2xhc3NMaXN0LmFkZCh0aGlzLl91bmlxdWVDbGFzc05hbWUpO1xuICB9XG5cbiAgbmdPbkluaXQoKSB7XG4gICAgLy8gTm90ZSB0aGF0IHdlIG5lZWQgdG8gbG9vayB1cCB0aGUgcm9vdCBub2RlIGluIG5nT25Jbml0LCByYXRoZXIgdGhhbiB0aGUgY29uc3RydWN0b3IsIGJlY2F1c2VcbiAgICAvLyBBbmd1bGFyIHNlZW1zIHRvIGNyZWF0ZSB0aGUgZWxlbWVudCBvdXRzaWRlIHRoZSBzaGFkb3cgcm9vdCBhbmQgdGhlbiBtb3ZlcyBpdCBpbnNpZGUsIGlmIHRoZVxuICAgIC8vIG5vZGUgaXMgaW5zaWRlIGFuIGBuZ0lmYCBhbmQgYSBTaGFkb3dEb20tZW5jYXBzdWxhdGVkIGNvbXBvbmVudC5cbiAgICB0aGlzLl9zdHlsZVJvb3QgPSBfZ2V0U2hhZG93Um9vdCh0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQpID8/IHRoaXMuX2RvY3VtZW50LmhlYWQ7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLl9zdHlsZUVsZW1lbnQ/LnJlbW92ZSgpO1xuICAgIHRoaXMuX3N0eWxlRWxlbWVudCA9IHVuZGVmaW5lZDtcbiAgfVxuXG4gIHN0aWNreUNvbHVtbnNVcGRhdGVkKHtzaXplc306IFN0aWNreVVwZGF0ZSk6IHZvaWQge1xuICAgIHRoaXMuX3N0YXJ0U2l6ZXMgPSBzaXplcztcbiAgICB0aGlzLl91cGRhdGVTY3JvbGxiYXIoKTtcbiAgfVxuXG4gIHN0aWNreUVuZENvbHVtbnNVcGRhdGVkKHtzaXplc306IFN0aWNreVVwZGF0ZSk6IHZvaWQge1xuICAgIHRoaXMuX2VuZFNpemVzID0gc2l6ZXM7XG4gICAgdGhpcy5fdXBkYXRlU2Nyb2xsYmFyKCk7XG4gIH1cblxuICBzdGlja3lIZWFkZXJSb3dzVXBkYXRlZCh7c2l6ZXN9OiBTdGlja3lVcGRhdGUpOiB2b2lkIHtcbiAgICB0aGlzLl9oZWFkZXJTaXplcyA9IHNpemVzO1xuICAgIHRoaXMuX3VwZGF0ZVNjcm9sbGJhcigpO1xuICB9XG5cbiAgc3RpY2t5Rm9vdGVyUm93c1VwZGF0ZWQoe3NpemVzfTogU3RpY2t5VXBkYXRlKTogdm9pZCB7XG4gICAgdGhpcy5fZm9vdGVyU2l6ZXMgPSBzaXplcztcbiAgICB0aGlzLl91cGRhdGVTY3JvbGxiYXIoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgcGFkZGluZyBvbiB0aGUgc2Nyb2xsYmFyIHRyYWNrIGJhc2VkIG9uIHRoZSBzdGlja3kgc3RhdGVzIGZyb20gQ2RrVGFibGUuXG4gICAqL1xuICBwcml2YXRlIF91cGRhdGVTY3JvbGxiYXIoKTogdm9pZCB7XG4gICAgY29uc3QgdG9wTWFyZ2luID0gY29tcHV0ZU1hcmdpbih0aGlzLl9oZWFkZXJTaXplcyk7XG4gICAgY29uc3QgYm90dG9tTWFyZ2luID0gY29tcHV0ZU1hcmdpbih0aGlzLl9mb290ZXJTaXplcyk7XG4gICAgY29uc3Qgc3RhcnRNYXJnaW4gPSBjb21wdXRlTWFyZ2luKHRoaXMuX3N0YXJ0U2l6ZXMpO1xuICAgIGNvbnN0IGVuZE1hcmdpbiA9IGNvbXB1dGVNYXJnaW4odGhpcy5fZW5kU2l6ZXMpO1xuXG4gICAgaWYgKHRvcE1hcmdpbiA9PT0gMCAmJiBib3R0b21NYXJnaW4gPT09IDAgJiYgc3RhcnRNYXJnaW4gPT09IDAgJiYgZW5kTWFyZ2luID09PSAwKSB7XG4gICAgICB0aGlzLl9jbGVhckNzcygpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGRpcmVjdGlvbiA9IHRoaXMuX2RpcmVjdGlvbmFsaXR5ID8gdGhpcy5fZGlyZWN0aW9uYWxpdHkudmFsdWUgOiAnbHRyJztcbiAgICBjb25zdCBsZWZ0TWFyZ2luID0gZGlyZWN0aW9uID09PSAncnRsJyA/IGVuZE1hcmdpbiA6IHN0YXJ0TWFyZ2luO1xuICAgIGNvbnN0IHJpZ2h0TWFyZ2luID0gZGlyZWN0aW9uID09PSAncnRsJyA/IHN0YXJ0TWFyZ2luIDogZW5kTWFyZ2luO1xuXG4gICAgdGhpcy5fYXBwbHlDc3MoYCR7dG9wTWFyZ2lufXB4ICR7cmlnaHRNYXJnaW59cHggJHtib3R0b21NYXJnaW59cHggJHtsZWZ0TWFyZ2lufXB4YCk7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgc3R5bGVzaGVldCBmb3IgdGhlIHNjcm9sbGJhciBzdHlsZXMgYW5kIGNyZWF0ZXMgaXQgaWYgbmVlZCBiZS4gKi9cbiAgcHJpdmF0ZSBfZ2V0U3R5bGVTaGVldCgpOiBDU1NTdHlsZVNoZWV0IHtcbiAgICBpZiAoIXRoaXMuX3N0eWxlRWxlbWVudCkge1xuICAgICAgdGhpcy5fc3R5bGVFbGVtZW50ID0gdGhpcy5fZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcblxuICAgICAgaWYgKHRoaXMuX25vbmNlKSB7XG4gICAgICAgIHRoaXMuX3N0eWxlRWxlbWVudC5zZXRBdHRyaWJ1dGUoJ25vbmNlJywgdGhpcy5fbm9uY2UpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9zdHlsZVJvb3QuYXBwZW5kQ2hpbGQodGhpcy5fc3R5bGVFbGVtZW50KTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fc3R5bGVFbGVtZW50LnNoZWV0IGFzIENTU1N0eWxlU2hlZXQ7XG4gIH1cblxuICAvKiogVXBkYXRlcyB0aGUgc3R5bGVzaGVldCB3aXRoIHRoZSBzcGVjaWZpZWQgc2Nyb2xsYmFyIHN0eWxlLiAqL1xuICBwcml2YXRlIF9hcHBseUNzcyh2YWx1ZTogc3RyaW5nKSB7XG4gICAgdGhpcy5fY2xlYXJDc3MoKTtcblxuICAgIGNvbnN0IHNlbGVjdG9yID0gYC4ke3RoaXMuX3VuaXF1ZUNsYXNzTmFtZX06Oi13ZWJraXQtc2Nyb2xsYmFyLXRyYWNrYDtcbiAgICB0aGlzLl9nZXRTdHlsZVNoZWV0KCkuaW5zZXJ0UnVsZShgJHtzZWxlY3Rvcn0ge21hcmdpbjogJHt2YWx1ZX19YCwgMCk7XG4gIH1cblxuICBwcml2YXRlIF9jbGVhckNzcygpIHtcbiAgICBjb25zdCBzdHlsZVNoZWV0ID0gdGhpcy5fZ2V0U3R5bGVTaGVldCgpO1xuICAgIGlmIChzdHlsZVNoZWV0LmNzc1J1bGVzLmxlbmd0aCA+IDApIHtcbiAgICAgIHN0eWxlU2hlZXQuZGVsZXRlUnVsZSgwKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gY29tcHV0ZU1hcmdpbihzaXplczogKG51bWJlciB8IG51bGwgfCB1bmRlZmluZWQpW10pOiBudW1iZXIge1xuICBsZXQgbWFyZ2luID0gMDtcbiAgZm9yIChjb25zdCBzaXplIG9mIHNpemVzKSB7XG4gICAgaWYgKHNpemUgPT0gbnVsbCkge1xuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIG1hcmdpbiArPSBzaXplO1xuICB9XG4gIHJldHVybiBtYXJnaW47XG59XG4iXX0=