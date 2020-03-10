/**
 * @fileoverview added by tsickle
 * Generated from: src/cdk-experimental/popover-edit/focus-dispatcher.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directionality } from '@angular/cdk/bidi';
import { LEFT_ARROW, UP_ARROW, RIGHT_ARROW, DOWN_ARROW } from '@angular/cdk/keycodes';
import { Injectable } from '@angular/core';
import { EDITABLE_CELL_SELECTOR, ROW_SELECTOR, TABLE_SELECTOR } from './constants';
import { closest } from './polyfill';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/bidi";
/**
 * Service responsible for moving cell focus around in response to keyboard events.
 * May be overridden to customize the keyboard behavior of popover edit.
 */
export class FocusDispatcher {
    /**
     * @param {?} directionality
     */
    constructor(directionality) {
        this.directionality = directionality;
        this.keyObserver = { next: (/**
             * @param {?} event
             * @return {?}
             */
            (event) => this.handleKeyboardEvent(event)) };
    }
    /**
     * Moves focus to earlier or later cells (in dom order) by offset cells relative to
     * currentCell.
     * @param {?} currentCell
     * @param {?} offset
     * @return {?}
     */
    moveFocusHorizontally(currentCell, offset) {
        /** @type {?} */
        const cells = (/** @type {?} */ (Array.from((/** @type {?} */ (closest(currentCell, TABLE_SELECTOR))).querySelectorAll(EDITABLE_CELL_SELECTOR))));
        /** @type {?} */
        const currentIndex = cells.indexOf(currentCell);
        /** @type {?} */
        const newIndex = currentIndex + offset;
        if (cells[newIndex]) {
            cells[newIndex].focus();
        }
    }
    /**
     * Moves focus to up or down by row by offset cells relative to currentCell.
     * @param {?} currentCell
     * @param {?} offset
     * @return {?}
     */
    moveFocusVertically(currentCell, offset) {
        /** @type {?} */
        const currentRow = (/** @type {?} */ (closest(currentCell, ROW_SELECTOR)));
        /** @type {?} */
        const rows = Array.from((/** @type {?} */ (closest(currentRow, TABLE_SELECTOR))).querySelectorAll(ROW_SELECTOR));
        /** @type {?} */
        const currentRowIndex = rows.indexOf(currentRow);
        /** @type {?} */
        const currentIndexWithinRow = Array.from(currentRow.querySelectorAll(EDITABLE_CELL_SELECTOR)).indexOf(currentCell);
        /** @type {?} */
        const newRowIndex = currentRowIndex + offset;
        if (rows[newRowIndex]) {
            /** @type {?} */
            const rowToFocus = (/** @type {?} */ (Array.from(rows[newRowIndex].querySelectorAll(EDITABLE_CELL_SELECTOR))));
            if (rowToFocus[currentIndexWithinRow]) {
                rowToFocus[currentIndexWithinRow].focus();
            }
        }
    }
    /**
     * Translates arrow keydown events into focus move operations.
     * @protected
     * @param {?} event
     * @return {?}
     */
    handleKeyboardEvent(event) {
        /** @type {?} */
        const cell = (/** @type {?} */ (closest(event.target, EDITABLE_CELL_SELECTOR)));
        if (!cell) {
            return;
        }
        switch (event.keyCode) {
            case UP_ARROW:
                this.moveFocusVertically(cell, -1);
                break;
            case DOWN_ARROW:
                this.moveFocusVertically(cell, 1);
                break;
            case LEFT_ARROW:
                this.moveFocusHorizontally(cell, this.directionality.value === 'ltr' ? -1 : 1);
                break;
            case RIGHT_ARROW:
                this.moveFocusHorizontally(cell, this.directionality.value === 'ltr' ? 1 : -1);
                break;
            default:
                // If the keyboard event is not handled, return now so that we don't `preventDefault`.
                return;
        }
        event.preventDefault();
    }
}
FocusDispatcher.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] }
];
/** @nocollapse */
FocusDispatcher.ctorParameters = () => [
    { type: Directionality }
];
/** @nocollapse */ FocusDispatcher.ɵprov = i0.ɵɵdefineInjectable({ factory: function FocusDispatcher_Factory() { return new FocusDispatcher(i0.ɵɵinject(i1.Directionality)); }, token: FocusDispatcher, providedIn: "root" });
if (false) {
    /**
     * Observes keydown events triggered from the table.
     * @type {?}
     */
    FocusDispatcher.prototype.keyObserver;
    /**
     * @type {?}
     * @protected
     */
    FocusDispatcher.prototype.directionality;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9jdXMtZGlzcGF0Y2hlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL3BvcG92ZXItZWRpdC9mb2N1cy1kaXNwYXRjaGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQVFBLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUNqRCxPQUFPLEVBQUMsVUFBVSxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsVUFBVSxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDcEYsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUd6QyxPQUFPLEVBQUMsc0JBQXNCLEVBQUUsWUFBWSxFQUFFLGNBQWMsRUFBQyxNQUFNLGFBQWEsQ0FBQztBQUNqRixPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sWUFBWSxDQUFDOzs7Ozs7O0FBT25DLE1BQU0sT0FBTyxlQUFlOzs7O0lBSTFCLFlBQStCLGNBQThCO1FBQTlCLG1CQUFjLEdBQWQsY0FBYyxDQUFnQjtRQUMzRCxJQUFJLENBQUMsV0FBVyxHQUFHLEVBQUMsSUFBSTs7OztZQUFFLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsS0FBSyxDQUFDLENBQUEsRUFBQyxDQUFDO0lBQ3hFLENBQUM7Ozs7Ozs7O0lBTUQscUJBQXFCLENBQUMsV0FBd0IsRUFBRSxNQUFjOztjQUN0RCxLQUFLLEdBQUcsbUJBQUEsS0FBSyxDQUFDLElBQUksQ0FBQyxtQkFBQSxPQUFPLENBQUMsV0FBVyxFQUFFLGNBQWMsQ0FBQyxFQUFDLENBQUMsZ0JBQWdCLENBQzdELHNCQUFzQixDQUFDLENBQUMsRUFBaUI7O2NBQ3JELFlBQVksR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQzs7Y0FDekMsUUFBUSxHQUFHLFlBQVksR0FBRyxNQUFNO1FBRXRDLElBQUksS0FBSyxDQUFDLFFBQVEsQ0FBQyxFQUFFO1lBQ25CLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztTQUN6QjtJQUNILENBQUM7Ozs7Ozs7SUFHRCxtQkFBbUIsQ0FBQyxXQUF3QixFQUFFLE1BQWM7O2NBQ3BELFVBQVUsR0FBRyxtQkFBQSxPQUFPLENBQUMsV0FBVyxFQUFFLFlBQVksQ0FBQyxFQUFDOztjQUNoRCxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxtQkFBQSxPQUFPLENBQUMsVUFBVSxFQUFFLGNBQWMsQ0FBQyxFQUFDLENBQUMsZ0JBQWdCLENBQUMsWUFBWSxDQUFDLENBQUM7O2NBQ3RGLGVBQWUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQzs7Y0FDMUMscUJBQXFCLEdBQ3ZCLEtBQUssQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLGdCQUFnQixDQUFDLHNCQUFzQixDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDOztjQUNsRixXQUFXLEdBQUcsZUFBZSxHQUFHLE1BQU07UUFFNUMsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUU7O2tCQUNmLFVBQVUsR0FDWixtQkFBQSxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLEVBQWlCO1lBRTNGLElBQUksVUFBVSxDQUFDLHFCQUFxQixDQUFDLEVBQUU7Z0JBQ3JDLFVBQVUsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO2FBQzNDO1NBQ0Y7SUFDSCxDQUFDOzs7Ozs7O0lBR1MsbUJBQW1CLENBQUMsS0FBb0I7O2NBQzFDLElBQUksR0FBRyxtQkFBQSxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxzQkFBc0IsQ0FBQyxFQUFzQjtRQUVoRixJQUFJLENBQUMsSUFBSSxFQUFFO1lBQ1QsT0FBTztTQUNSO1FBRUQsUUFBUSxLQUFLLENBQUMsT0FBTyxFQUFFO1lBQ3JCLEtBQUssUUFBUTtnQkFDWCxJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ25DLE1BQU07WUFDUixLQUFLLFVBQVU7Z0JBQ2IsSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDbEMsTUFBTTtZQUNSLEtBQUssVUFBVTtnQkFDYixJQUFJLENBQUMscUJBQXFCLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMvRSxNQUFNO1lBQ1IsS0FBSyxXQUFXO2dCQUNkLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQy9FLE1BQU07WUFDUjtnQkFDRSxzRkFBc0Y7Z0JBQ3RGLE9BQU87U0FDVjtRQUVELEtBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQztJQUN6QixDQUFDOzs7WUF0RUYsVUFBVSxTQUFDLEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBQzs7OztZQVp4QixjQUFjOzs7Ozs7OztJQWVwQixzQ0FBcUQ7Ozs7O0lBRXpDLHlDQUFpRCIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0RpcmVjdGlvbmFsaXR5fSBmcm9tICdAYW5ndWxhci9jZGsvYmlkaSc7XG5pbXBvcnQge0xFRlRfQVJST1csIFVQX0FSUk9XLCBSSUdIVF9BUlJPVywgRE9XTl9BUlJPV30gZnJvbSAnQGFuZ3VsYXIvY2RrL2tleWNvZGVzJztcbmltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge1BhcnRpYWxPYnNlcnZlcn0gZnJvbSAncnhqcyc7XG5cbmltcG9ydCB7RURJVEFCTEVfQ0VMTF9TRUxFQ1RPUiwgUk9XX1NFTEVDVE9SLCBUQUJMRV9TRUxFQ1RPUn0gZnJvbSAnLi9jb25zdGFudHMnO1xuaW1wb3J0IHtjbG9zZXN0fSBmcm9tICcuL3BvbHlmaWxsJztcblxuLyoqXG4gKiBTZXJ2aWNlIHJlc3BvbnNpYmxlIGZvciBtb3ZpbmcgY2VsbCBmb2N1cyBhcm91bmQgaW4gcmVzcG9uc2UgdG8ga2V5Ym9hcmQgZXZlbnRzLlxuICogTWF5IGJlIG92ZXJyaWRkZW4gdG8gY3VzdG9taXplIHRoZSBrZXlib2FyZCBiZWhhdmlvciBvZiBwb3BvdmVyIGVkaXQuXG4gKi9cbkBJbmplY3RhYmxlKHtwcm92aWRlZEluOiAncm9vdCd9KVxuZXhwb3J0IGNsYXNzIEZvY3VzRGlzcGF0Y2hlciB7XG4gIC8qKiBPYnNlcnZlcyBrZXlkb3duIGV2ZW50cyB0cmlnZ2VyZWQgZnJvbSB0aGUgdGFibGUuICovXG4gIHJlYWRvbmx5IGtleU9ic2VydmVyOiBQYXJ0aWFsT2JzZXJ2ZXI8S2V5Ym9hcmRFdmVudD47XG5cbiAgY29uc3RydWN0b3IocHJvdGVjdGVkIHJlYWRvbmx5IGRpcmVjdGlvbmFsaXR5OiBEaXJlY3Rpb25hbGl0eSkge1xuICAgIHRoaXMua2V5T2JzZXJ2ZXIgPSB7bmV4dDogKGV2ZW50KSA9PiB0aGlzLmhhbmRsZUtleWJvYXJkRXZlbnQoZXZlbnQpfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNb3ZlcyBmb2N1cyB0byBlYXJsaWVyIG9yIGxhdGVyIGNlbGxzIChpbiBkb20gb3JkZXIpIGJ5IG9mZnNldCBjZWxscyByZWxhdGl2ZSB0b1xuICAgKiBjdXJyZW50Q2VsbC5cbiAgICovXG4gIG1vdmVGb2N1c0hvcml6b250YWxseShjdXJyZW50Q2VsbDogSFRNTEVsZW1lbnQsIG9mZnNldDogbnVtYmVyKTogdm9pZCB7XG4gICAgY29uc3QgY2VsbHMgPSBBcnJheS5mcm9tKGNsb3Nlc3QoY3VycmVudENlbGwsIFRBQkxFX1NFTEVDVE9SKSEucXVlcnlTZWxlY3RvckFsbChcbiAgICAgICAgICAgICAgICAgICAgICBFRElUQUJMRV9DRUxMX1NFTEVDVE9SKSkgYXMgSFRNTEVsZW1lbnRbXTtcbiAgICBjb25zdCBjdXJyZW50SW5kZXggPSBjZWxscy5pbmRleE9mKGN1cnJlbnRDZWxsKTtcbiAgICBjb25zdCBuZXdJbmRleCA9IGN1cnJlbnRJbmRleCArIG9mZnNldDtcblxuICAgIGlmIChjZWxsc1tuZXdJbmRleF0pIHtcbiAgICAgIGNlbGxzW25ld0luZGV4XS5mb2N1cygpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBNb3ZlcyBmb2N1cyB0byB1cCBvciBkb3duIGJ5IHJvdyBieSBvZmZzZXQgY2VsbHMgcmVsYXRpdmUgdG8gY3VycmVudENlbGwuICovXG4gIG1vdmVGb2N1c1ZlcnRpY2FsbHkoY3VycmVudENlbGw6IEhUTUxFbGVtZW50LCBvZmZzZXQ6IG51bWJlcik6IHZvaWQge1xuICAgIGNvbnN0IGN1cnJlbnRSb3cgPSBjbG9zZXN0KGN1cnJlbnRDZWxsLCBST1dfU0VMRUNUT1IpITtcbiAgICBjb25zdCByb3dzID0gQXJyYXkuZnJvbShjbG9zZXN0KGN1cnJlbnRSb3csIFRBQkxFX1NFTEVDVE9SKSEucXVlcnlTZWxlY3RvckFsbChST1dfU0VMRUNUT1IpKTtcbiAgICBjb25zdCBjdXJyZW50Um93SW5kZXggPSByb3dzLmluZGV4T2YoY3VycmVudFJvdyk7XG4gICAgY29uc3QgY3VycmVudEluZGV4V2l0aGluUm93ID1cbiAgICAgICAgQXJyYXkuZnJvbShjdXJyZW50Um93LnF1ZXJ5U2VsZWN0b3JBbGwoRURJVEFCTEVfQ0VMTF9TRUxFQ1RPUikpLmluZGV4T2YoY3VycmVudENlbGwpO1xuICAgIGNvbnN0IG5ld1Jvd0luZGV4ID0gY3VycmVudFJvd0luZGV4ICsgb2Zmc2V0O1xuXG4gICAgaWYgKHJvd3NbbmV3Um93SW5kZXhdKSB7XG4gICAgICBjb25zdCByb3dUb0ZvY3VzID1cbiAgICAgICAgICBBcnJheS5mcm9tKHJvd3NbbmV3Um93SW5kZXhdLnF1ZXJ5U2VsZWN0b3JBbGwoRURJVEFCTEVfQ0VMTF9TRUxFQ1RPUikpIGFzIEhUTUxFbGVtZW50W107XG5cbiAgICAgIGlmIChyb3dUb0ZvY3VzW2N1cnJlbnRJbmRleFdpdGhpblJvd10pIHtcbiAgICAgICAgcm93VG9Gb2N1c1tjdXJyZW50SW5kZXhXaXRoaW5Sb3ddLmZvY3VzKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqIFRyYW5zbGF0ZXMgYXJyb3cga2V5ZG93biBldmVudHMgaW50byBmb2N1cyBtb3ZlIG9wZXJhdGlvbnMuICovXG4gIHByb3RlY3RlZCBoYW5kbGVLZXlib2FyZEV2ZW50KGV2ZW50OiBLZXlib2FyZEV2ZW50KTogdm9pZCB7XG4gICAgY29uc3QgY2VsbCA9IGNsb3Nlc3QoZXZlbnQudGFyZ2V0LCBFRElUQUJMRV9DRUxMX1NFTEVDVE9SKSBhcyBIVE1MRWxlbWVudCB8IG51bGw7XG5cbiAgICBpZiAoIWNlbGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBzd2l0Y2ggKGV2ZW50LmtleUNvZGUpIHtcbiAgICAgIGNhc2UgVVBfQVJST1c6XG4gICAgICAgIHRoaXMubW92ZUZvY3VzVmVydGljYWxseShjZWxsLCAtMSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBET1dOX0FSUk9XOlxuICAgICAgICB0aGlzLm1vdmVGb2N1c1ZlcnRpY2FsbHkoY2VsbCwgMSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBMRUZUX0FSUk9XOlxuICAgICAgICB0aGlzLm1vdmVGb2N1c0hvcml6b250YWxseShjZWxsLCB0aGlzLmRpcmVjdGlvbmFsaXR5LnZhbHVlID09PSAnbHRyJyA/IC0xIDogMSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBSSUdIVF9BUlJPVzpcbiAgICAgICAgdGhpcy5tb3ZlRm9jdXNIb3Jpem9udGFsbHkoY2VsbCwgdGhpcy5kaXJlY3Rpb25hbGl0eS52YWx1ZSA9PT0gJ2x0cicgPyAxIDogLTEpO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIC8vIElmIHRoZSBrZXlib2FyZCBldmVudCBpcyBub3QgaGFuZGxlZCwgcmV0dXJuIG5vdyBzbyB0aGF0IHdlIGRvbid0IGBwcmV2ZW50RGVmYXVsdGAuXG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICB9XG59XG4iXX0=