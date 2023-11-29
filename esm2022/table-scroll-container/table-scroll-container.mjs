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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.0.4", ngImport: i0, type: CdkTableScrollContainer, deps: [{ token: i0.ElementRef }, { token: DOCUMENT }, { token: i1.Directionality, optional: true }, { token: CSP_NONCE, optional: true }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "17.0.4", type: CdkTableScrollContainer, isStandalone: true, selector: "[cdkTableScrollContainer]", host: { classAttribute: "cdk-table-scroll-container" }, providers: [{ provide: STICKY_POSITIONING_LISTENER, useExisting: CdkTableScrollContainer }], ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.0.4", ngImport: i0, type: CdkTableScrollContainer, decorators: [{
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFibGUtc2Nyb2xsLWNvbnRhaW5lci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL3RhYmxlLXNjcm9sbC1jb250YWluZXIvdGFibGUtc2Nyb2xsLWNvbnRhaW5lci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFxQixRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDcEcsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQ3pDLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUNqRCxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDckQsT0FBTyxFQUNMLDJCQUEyQixHQUk1QixNQUFNLG9CQUFvQixDQUFDOzs7QUFFNUIsSUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDO0FBRWY7Ozs7Ozs7Ozs7R0FVRztBQVNILE1BQU0sT0FBTyx1QkFBdUI7SUFXbEMsWUFDbUIsV0FBb0MsRUFDbEIsU0FBbUIsRUFDekIsZUFBZ0MsRUFDYixNQUFzQjtRQUhyRCxnQkFBVyxHQUFYLFdBQVcsQ0FBeUI7UUFDbEIsY0FBUyxHQUFULFNBQVMsQ0FBVTtRQUN6QixvQkFBZSxHQUFmLGVBQWUsQ0FBaUI7UUFDYixXQUFNLEdBQU4sTUFBTSxDQUFnQjtRQVZ4RSxtRUFBbUU7UUFDM0QsZ0JBQVcsR0FBaUIsRUFBRSxDQUFDO1FBQy9CLGNBQVMsR0FBaUIsRUFBRSxDQUFDO1FBQzdCLGlCQUFZLEdBQWlCLEVBQUUsQ0FBQztRQUNoQyxpQkFBWSxHQUFpQixFQUFFLENBQUM7UUFRdEMsSUFBSSxDQUFDLGdCQUFnQixHQUFHLDhCQUE4QixFQUFFLE1BQU0sRUFBRSxDQUFDO1FBQ2pFLFdBQVcsQ0FBQyxhQUFhLENBQUMs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LEVBQUU7UUFDeEIsSUFBSSxJQUFJLElBQUksSUFBSSxFQUFFO1lBQ2hCLE1BQU07U0FDUDtRQUNELE1BQU0sSUFBSSxJQUFJLENBQUM7S0FDaEI7SUFDRCxPQUFPLE1BQU0sQ0FBQztBQUNoQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Q1NQX05PTkNFLCBEaXJlY3RpdmUsIEVsZW1lbnRSZWYsIEluamVjdCwgT25EZXN0cm95LCBPbkluaXQsIE9wdGlvbmFsfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7RE9DVU1FTlR9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQge0RpcmVjdGlvbmFsaXR5fSBmcm9tICdAYW5ndWxhci9jZGsvYmlkaSc7XG5pbXBvcnQge19nZXRTaGFkb3dSb290fSBmcm9tICdAYW5ndWxhci9jZGsvcGxhdGZvcm0nO1xuaW1wb3J0IHtcbiAgU1RJQ0tZX1BPU0lUSU9OSU5HX0xJU1RFTkVSLFxuICBTdGlja3lQb3NpdGlvbmluZ0xpc3RlbmVyLFxuICBTdGlja3lTaXplLFxuICBTdGlja3lVcGRhdGUsXG59IGZyb20gJ0Bhbmd1bGFyL2Nkay90YWJsZSc7XG5cbmxldCBuZXh0SWQgPSAwO1xuXG4vKipcbiAqIEFwcGxpZXMgc3R5bGVzIHRvIHRoZSBob3N0IGVsZW1lbnQgdGhhdCBtYWtlIGl0cyBzY3JvbGxiYXJzIG1hdGNoIHVwIHdpdGhcbiAqIHRoZSBub24tc3RpY2t5IHNjcm9sbGFibGUgcG9ydGlvbnMgb2YgdGhlIENka1RhYmxlIGNvbnRhaW5lZCB3aXRoaW4uXG4gKlxuICogVGhpcyB2aXN1YWwgZWZmZWN0IG9ubHkgd29ya3MgaW4gV2Via2l0IGFuZCBCbGluayBiYXNlZCBicm93c2VycyAoZWcgQ2hyb21lLFxuICogU2FmYXJpLCBFZGdlKS4gT3RoZXIgYnJvd3NlcnMgc3VjaCBhcyBGaXJlZm94IHdpbGwgZ3JhY2VmdWxseSBkZWdyYWRlIHRvXG4gKiBub3JtYWwgc2Nyb2xsYmFyIGFwcGVhcmFuY2UuXG4gKiBGdXJ0aGVyIG5vdGU6IFRoZXNlIHN0eWxlcyBoYXZlIG5vIGVmZmVjdCB3aGVuIHRoZSBicm93c2VyIGlzIHVzaW5nIE9TLWRlZmF1bHRcbiAqIHNjcm9sbGJhcnMuIFRoZSBlYXNpZXN0IHdheSB0byBmb3JjZSB0aGVtIGludG8gY3VzdG9tIG1vZGUgaXMgdG8gc3BlY2lmeSB3aWR0aFxuICogYW5kIGhlaWdodCBmb3IgdGhlIHNjcm9sbGJhciBhbmQgdGh1bWIuXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tjZGtUYWJsZVNjcm9sbENvbnRhaW5lcl0nLFxuICBob3N0OiB7XG4gICAgJ2NsYXNzJzogJ2Nkay10YWJsZS1zY3JvbGwtY29udGFpbmVyJyxcbiAgfSxcbiAgcHJvdmlkZXJzOiBbe3Byb3ZpZGU6IFNUSUNLWV9QT1NJVElPTklOR19MSVNURU5FUiwgdXNlRXhpc3Rpbmc6IENka1RhYmxlU2Nyb2xsQ29udGFpbmVyfV0sXG4gIHN0YW5kYWxvbmU6IHRydWUsXG59KVxuZXhwb3J0IGNsYXNzIENka1RhYmxlU2Nyb2xsQ29udGFpbmVyIGltcGxlbWVudHMgU3RpY2t5UG9zaXRpb25pbmdMaXN0ZW5lciwgT25EZXN0cm95LCBPbkluaXQge1xuICBwcml2YXRlIHJlYWRvbmx5IF91bmlxdWVDbGFzc05hbWU6IHN0cmluZztcbiAgcHJpdmF0ZSBfc3R5bGVSb290ITogTm9kZTtcbiAgcHJpdmF0ZSBfc3R5bGVFbGVtZW50PzogSFRNTFN0eWxlRWxlbWVudDtcblxuICAvKiogVGhlIG1vc3QgcmVjZW50IHN0aWNreSBjb2x1bW4gc2l6ZSB2YWx1ZXMgZnJvbSB0aGUgQ2RrVGFibGUuICovXG4gIHByaXZhdGUgX3N0YXJ0U2l6ZXM6IFN0aWNreVNpemVbXSA9IFtdO1xuICBwcml2YXRlIF9lbmRTaXplczogU3RpY2t5U2l6ZVtdID0gW107XG4gIHByaXZhdGUgX2hlYWRlclNpemVzOiBTdGlja3lTaXplW10gPSBbXTtcbiAgcHJpdmF0ZSBfZm9vdGVyU2l6ZXM6IFN0aWNreVNpemVbXSA9IFtdO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgcmVhZG9ubHkgX2VsZW1lbnRSZWY6IEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+LFxuICAgIEBJbmplY3QoRE9DVU1FTlQpIHByaXZhdGUgcmVhZG9ubHkgX2RvY3VtZW50OiBEb2N1bWVudCxcbiAgICBAT3B0aW9uYWwoKSBwcml2YXRlIHJlYWRvbmx5IF9kaXJlY3Rpb25hbGl0eT86IERpcmVjdGlvbmFsaXR5LFxuICAgIEBPcHRpb25hbCgpIEBJbmplY3QoQ1NQX05PTkNFKSBwcml2YXRlIHJlYWRvbmx5IF9ub25jZT86IHN0cmluZyB8IG51bGwsXG4gICkge1xuICAgIHRoaXMuX3VuaXF1ZUNsYXNzTmFtZSA9IGBjZGstdGFibGUtc2Nyb2xsLWNvbnRhaW5lci0keysrbmV4dElkfWA7XG4gICAgX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5jbGFzc0xpc3QuYWRkKHRoaXMuX3VuaXF1ZUNsYXNzTmFtZSk7XG4gIH1cblxuICBuZ09uSW5pdCgpIHtcbiAgICAvLyBOb3RlIHRoYXQgd2UgbmVlZCB0byBsb29rIHVwIHRoZSByb290IG5vZGUgaW4gbmdPbkluaXQsIHJhdGhlciB0aGFuIHRoZSBjb25zdHJ1Y3RvciwgYmVjYXVzZVxuICAgIC8vIEFuZ3VsYXIgc2VlbXMgdG8gY3JlYXRlIHRoZSBlbGVtZW50IG91dHNpZGUgdGhlIHNoYWRvdyByb290IGFuZCB0aGVuIG1vdmVzIGl0IGluc2lkZSwgaWYgdGhlXG4gICAgLy8gbm9kZSBpcyBpbnNpZGUgYW4gYG5nSWZgIGFuZCBhIFNoYWRvd0RvbS1lbmNhcHN1bGF0ZWQgY29tcG9uZW50LlxuICAgIHRoaXMuX3N0eWxlUm9vdCA9IF9nZXRTaGFkb3dSb290KHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudCkgPz8gdGhpcy5fZG9jdW1lbnQuaGVhZDtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCk6IHZvaWQge1xuICAgIHRoaXMuX3N0eWxlRWxlbWVudD8ucmVtb3ZlKCk7XG4gICAgdGhpcy5fc3R5bGVFbGVtZW50ID0gdW5kZWZpbmVkO1xuICB9XG5cbiAgc3RpY2t5Q29sdW1uc1VwZGF0ZWQoe3NpemVzfTogU3RpY2t5VXBkYXRlKTogdm9pZCB7XG4gICAgdGhpcy5fc3RhcnRTaXplcyA9IHNpemVzO1xuICAgIHRoaXMuX3VwZGF0ZVNjcm9sbGJhcigpO1xuICB9XG5cbiAgc3RpY2t5RW5kQ29sdW1uc1VwZGF0ZWQoe3NpemVzfTogU3RpY2t5VXBkYXRlKTogdm9pZCB7XG4gICAgdGhpcy5fZW5kU2l6ZXMgPSBzaXplcztcbiAgICB0aGlzLl91cGRhdGVTY3JvbGxiYXIoKTtcbiAgfVxuXG4gIHN0aWNreUhlYWRlclJvd3NVcGRhdGVkKHtzaXplc306IFN0aWNreVVwZGF0ZSk6IHZvaWQge1xuICAgIHRoaXMuX2hlYWRlclNpemVzID0gc2l6ZXM7XG4gICAgdGhpcy5fdXBkYXRlU2Nyb2xsYmFyKCk7XG4gIH1cblxuICBzdGlja3lGb290ZXJSb3dzVXBkYXRlZCh7c2l6ZXN9OiBTdGlja3lVcGRhdGUpOiB2b2lkIHtcbiAgICB0aGlzLl9mb290ZXJTaXplcyA9IHNpemVzO1xuICAgIHRoaXMuX3VwZGF0ZVNjcm9sbGJhcigpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCBwYWRkaW5nIG9uIHRoZSBzY3JvbGxiYXIgdHJhY2sgYmFzZWQgb24gdGhlIHN0aWNreSBzdGF0ZXMgZnJvbSBDZGtUYWJsZS5cbiAgICovXG4gIHByaXZhdGUgX3VwZGF0ZVNjcm9sbGJhcigpOiB2b2lkIHtcbiAgICBjb25zdCB0b3BNYXJnaW4gPSBjb21wdXRlTWFyZ2luKHRoaXMuX2hlYWRlclNpemVzKTtcbiAgICBjb25zdCBib3R0b21NYXJnaW4gPSBjb21wdXRlTWFyZ2luKHRoaXMuX2Zvb3RlclNpemVzKTtcbiAgICBjb25zdCBzdGFydE1hcmdpbiA9IGNvbXB1dGVNYXJnaW4odGhpcy5fc3RhcnRTaXplcyk7XG4gICAgY29uc3QgZW5kTWFyZ2luID0gY29tcHV0ZU1hcmdpbih0aGlzLl9lbmRTaXplcyk7XG5cbiAgICBpZiAodG9wTWFyZ2luID09PSAwICYmIGJvdHRvbU1hcmdpbiA9PT0gMCAmJiBzdGFydE1hcmdpbiA9PT0gMCAmJiBlbmRNYXJnaW4gPT09IDApIHtcbiAgICAgIHRoaXMuX2NsZWFyQ3NzKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgZGlyZWN0aW9uID0gdGhpcy5fZGlyZWN0aW9uYWxpdHkgPyB0aGlzLl9kaXJlY3Rpb25hbGl0eS52YWx1ZSA6ICdsdHInO1xuICAgIGNvbnN0IGxlZnRNYXJnaW4gPSBkaXJlY3Rpb24gPT09ICdydGwnID8gZW5kTWFyZ2luIDogc3RhcnRNYXJnaW47XG4gICAgY29uc3QgcmlnaHRNYXJnaW4gPSBkaXJlY3Rpb24gPT09ICdydGwnID8gc3RhcnRNYXJnaW4gOiBlbmRNYXJnaW47XG5cbiAgICB0aGlzLl9hcHBseUNzcyhgJHt0b3BNYXJnaW59cHggJHtyaWdodE1hcmdpbn1weCAke2JvdHRvbU1hcmdpbn1weCAke2xlZnRNYXJnaW59cHhgKTtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBzdHlsZXNoZWV0IGZvciB0aGUgc2Nyb2xsYmFyIHN0eWxlcyBhbmQgY3JlYXRlcyBpdCBpZiBuZWVkIGJlLiAqL1xuICBwcml2YXRlIF9nZXRTdHlsZVNoZWV0KCk6IENTU1N0eWxlU2hlZXQge1xuICAgIGlmICghdGhpcy5fc3R5bGVFbGVtZW50KSB7XG4gICAgICB0aGlzLl9zdHlsZUVsZW1lbnQgPSB0aGlzLl9kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuXG4gICAgICBpZiAodGhpcy5fbm9uY2UpIHtcbiAgICAgICAgdGhpcy5fc3R5bGVFbGVtZW50Lm5vbmNlID0gdGhpcy5fbm9uY2U7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX3N0eWxlUm9vdC5hcHBlbmRDaGlsZCh0aGlzLl9zdHlsZUVsZW1lbnQpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9zdHlsZUVsZW1lbnQuc2hlZXQgYXMgQ1NTU3R5bGVTaGVldDtcbiAgfVxuXG4gIC8qKiBVcGRhdGVzIHRoZSBzdHlsZXNoZWV0IHdpdGggdGhlIHNwZWNpZmllZCBzY3JvbGxiYXIgc3R5bGUuICovXG4gIHByaXZhdGUgX2FwcGx5Q3NzKHZhbHVlOiBzdHJpbmcpIHtcbiAgICB0aGlzLl9jbGVhckNzcygpO1xuXG4gICAgY29uc3Qgc2VsZWN0b3IgPSBgLiR7dGhpcy5fdW5pcXVlQ2xhc3NOYW1lfTo6LXdlYmtpdC1zY3JvbGxiYXItdHJhY2tgO1xuICAgIHRoaXMuX2dldFN0eWxlU2hlZXQoKS5pbnNlcnRSdWxlKGAke3NlbGVjdG9yfSB7bWFyZ2luOiAke3ZhbHVlfX1gLCAwKTtcbiAgfVxuXG4gIHByaXZhdGUgX2NsZWFyQ3NzKCkge1xuICAgIGNvbnN0IHN0eWxlU2hlZXQgPSB0aGlzLl9nZXRTdHlsZVNoZWV0KCk7XG4gICAgaWYgKHN0eWxlU2hlZXQuY3NzUnVsZXMubGVuZ3RoID4gMCkge1xuICAgICAgc3R5bGVTaGVldC5kZWxldGVSdWxlKDApO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBjb21wdXRlTWFyZ2luKHNpemVzOiAobnVtYmVyIHwgbnVsbCB8IHVuZGVmaW5lZClbXSk6IG51bWJlciB7XG4gIGxldCBtYXJnaW4gPSAwO1xuICBmb3IgKGNvbnN0IHNpemUgb2Ygc2l6ZXMpIHtcbiAgICBpZiAoc2l6ZSA9PSBudWxsKSB7XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgbWFyZ2luICs9IHNpemU7XG4gIH1cbiAgcmV0dXJuIG1hcmdpbjtcbn1cbiJdfQ==