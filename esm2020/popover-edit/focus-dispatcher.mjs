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
    constructor(directionality) {
        this.directionality = directionality;
        this.keyObserver = { next: (event) => this.handleKeyboardEvent(event) };
    }
    /**
     * Moves focus to earlier or later cells (in dom order) by offset cells relative to
     * currentCell.
     */
    moveFocusHorizontally(currentCell, offset) {
        const cells = Array.from(closest(currentCell, TABLE_SELECTOR).querySelectorAll(EDITABLE_CELL_SELECTOR));
        const currentIndex = cells.indexOf(currentCell);
        const newIndex = currentIndex + offset;
        if (cells[newIndex]) {
            cells[newIndex].focus();
        }
    }
    /** Moves focus to up or down by row by offset cells relative to currentCell. */
    moveFocusVertically(currentCell, offset) {
        const currentRow = closest(currentCell, ROW_SELECTOR);
        const rows = Array.from(closest(currentRow, TABLE_SELECTOR).querySelectorAll(ROW_SELECTOR));
        const currentRowIndex = rows.indexOf(currentRow);
        const currentIndexWithinRow = Array.from(currentRow.querySelectorAll(EDITABLE_CELL_SELECTOR)).indexOf(currentCell);
        const newRowIndex = currentRowIndex + offset;
        if (rows[newRowIndex]) {
            const rowToFocus = Array.from(rows[newRowIndex].querySelectorAll(EDITABLE_CELL_SELECTOR));
            if (rowToFocus[currentIndexWithinRow]) {
                rowToFocus[currentIndexWithinRow].focus();
            }
        }
    }
    /** Translates arrow keydown events into focus move operations. */
    handleKeyboardEvent(event) {
        const cell = closest(event.target, EDITABLE_CELL_SELECTOR);
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
FocusDispatcher.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.0-next.15", ngImport: i0, type: FocusDispatcher, deps: [{ token: i1.Directionality }], target: i0.ɵɵFactoryTarget.Injectable });
FocusDispatcher.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.0-next.15", ngImport: i0, type: FocusDispatcher, providedIn: 'root' });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.0-next.15", ngImport: i0, type: FocusDispatcher, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: function () { return [{ type: i1.Directionality }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9jdXMtZGlzcGF0Y2hlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL3BvcG92ZXItZWRpdC9mb2N1cy1kaXNwYXRjaGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUNqRCxPQUFPLEVBQUMsVUFBVSxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsVUFBVSxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDcEYsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUd6QyxPQUFPLEVBQUMsc0JBQXNCLEVBQUUsWUFBWSxFQUFFLGNBQWMsRUFBQyxNQUFNLGFBQWEsQ0FBQztBQUNqRixPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sWUFBWSxDQUFDOzs7QUFFbkM7OztHQUdHO0FBRUgsTUFBTSxPQUFPLGVBQWU7SUFJMUIsWUFBK0IsY0FBOEI7UUFBOUIsbUJBQWMsR0FBZCxjQUFjLENBQWdCO1FBQzNELElBQUksQ0FBQyxXQUFXLEdBQUcsRUFBQyxJQUFJLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLENBQUMsRUFBQyxDQUFDO0lBQ3hFLENBQUM7SUFFRDs7O09BR0c7SUFDSCxxQkFBcUIsQ0FBQyxXQUF3QixFQUFFLE1BQWM7UUFDNUQsTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLGNBQWMsQ0FBRSxDQUFDLGdCQUFnQixDQUM3RCxzQkFBc0IsQ0FBQyxDQUFrQixDQUFDO1FBQzVELE1BQU0sWUFBWSxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDaEQsTUFBTSxRQUFRLEdBQUcsWUFBWSxHQUFHLE1BQU0sQ0FBQztRQUV2QyxJQUFJLEtBQUssQ0FBQyxRQUFRLENBQUMsRUFBRTtZQUNuQixLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7U0FDekI7SUFDSCxDQUFDO0lBRUQsZ0ZBQWdGO0lBQ2hGLG1CQUFtQixDQUFDLFdBQXdCLEVBQUUsTUFBYztRQUMxRCxNQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsV0FBVyxFQUFFLFlBQVksQ0FBRSxDQUFDO1FBQ3ZELE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxjQUFjLENBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO1FBQzdGLE1BQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDakQsTUFBTSxxQkFBcUIsR0FDdkIsS0FBSyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUN6RixNQUFNLFdBQVcsR0FBRyxlQUFlLEdBQUcsTUFBTSxDQUFDO1FBRTdDLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFO1lBQ3JCLE1BQU0sVUFBVSxHQUNaLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLHNCQUFzQixDQUFDLENBQWtCLENBQUM7WUFFNUYsSUFBSSxVQUFVLENBQUMscUJBQXFCLENBQUMsRUFBRTtnQkFDckMsVUFBVSxDQUFDLHFCQUFxQixDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7YUFDM0M7U0FDRjtJQUNILENBQUM7SUFFRCxrRUFBa0U7SUFDeEQsbUJBQW1CLENBQUMsS0FBb0I7UUFDaEQsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsc0JBQXNCLENBQXVCLENBQUM7UUFFakYsSUFBSSxDQUFDLElBQUksRUFBRTtZQUNULE9BQU87U0FDUjtRQUVELFFBQVEsS0FBSyxDQUFDLE9BQU8sRUFBRTtZQUNyQixLQUFLLFFBQVE7Z0JBQ1gsSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNuQyxNQUFNO1lBQ1IsS0FBSyxVQUFVO2dCQUNiLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ2xDLE1BQU07WUFDUixLQUFLLFVBQVU7Z0JBQ2IsSUFBSSxDQUFDLHFCQUFxQixDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDL0UsTUFBTTtZQUNSLEtBQUssV0FBVztnQkFDZCxJQUFJLENBQUMscUJBQXFCLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMvRSxNQUFNO1lBQ1I7Z0JBQ0Usc0ZBQXNGO2dCQUN0RixPQUFPO1NBQ1Y7UUFFRCxLQUFLLENBQUMsY0FBYyxFQUFFLENBQUM7SUFDekIsQ0FBQzs7b0hBckVVLGVBQWU7d0hBQWYsZUFBZSxjQURILE1BQU07bUdBQ2xCLGVBQWU7a0JBRDNCLFVBQVU7bUJBQUMsRUFBQyxVQUFVLEVBQUUsTUFBTSxFQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RGlyZWN0aW9uYWxpdHl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9iaWRpJztcbmltcG9ydCB7TEVGVF9BUlJPVywgVVBfQVJST1csIFJJR0hUX0FSUk9XLCBET1dOX0FSUk9XfSBmcm9tICdAYW5ndWxhci9jZGsva2V5Y29kZXMnO1xuaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7UGFydGlhbE9ic2VydmVyfSBmcm9tICdyeGpzJztcblxuaW1wb3J0IHtFRElUQUJMRV9DRUxMX1NFTEVDVE9SLCBST1dfU0VMRUNUT1IsIFRBQkxFX1NFTEVDVE9SfSBmcm9tICcuL2NvbnN0YW50cyc7XG5pbXBvcnQge2Nsb3Nlc3R9IGZyb20gJy4vcG9seWZpbGwnO1xuXG4vKipcbiAqIFNlcnZpY2UgcmVzcG9uc2libGUgZm9yIG1vdmluZyBjZWxsIGZvY3VzIGFyb3VuZCBpbiByZXNwb25zZSB0byBrZXlib2FyZCBldmVudHMuXG4gKiBNYXkgYmUgb3ZlcnJpZGRlbiB0byBjdXN0b21pemUgdGhlIGtleWJvYXJkIGJlaGF2aW9yIG9mIHBvcG92ZXIgZWRpdC5cbiAqL1xuQEluamVjdGFibGUoe3Byb3ZpZGVkSW46ICdyb290J30pXG5leHBvcnQgY2xhc3MgRm9jdXNEaXNwYXRjaGVyIHtcbiAgLyoqIE9ic2VydmVzIGtleWRvd24gZXZlbnRzIHRyaWdnZXJlZCBmcm9tIHRoZSB0YWJsZS4gKi9cbiAgcmVhZG9ubHkga2V5T2JzZXJ2ZXI6IFBhcnRpYWxPYnNlcnZlcjxLZXlib2FyZEV2ZW50PjtcblxuICBjb25zdHJ1Y3Rvcihwcm90ZWN0ZWQgcmVhZG9ubHkgZGlyZWN0aW9uYWxpdHk6IERpcmVjdGlvbmFsaXR5KSB7XG4gICAgdGhpcy5rZXlPYnNlcnZlciA9IHtuZXh0OiAoZXZlbnQpID0+IHRoaXMuaGFuZGxlS2V5Ym9hcmRFdmVudChldmVudCl9O1xuICB9XG5cbiAgLyoqXG4gICAqIE1vdmVzIGZvY3VzIHRvIGVhcmxpZXIgb3IgbGF0ZXIgY2VsbHMgKGluIGRvbSBvcmRlcikgYnkgb2Zmc2V0IGNlbGxzIHJlbGF0aXZlIHRvXG4gICAqIGN1cnJlbnRDZWxsLlxuICAgKi9cbiAgbW92ZUZvY3VzSG9yaXpvbnRhbGx5KGN1cnJlbnRDZWxsOiBIVE1MRWxlbWVudCwgb2Zmc2V0OiBudW1iZXIpOiB2b2lkIHtcbiAgICBjb25zdCBjZWxscyA9IEFycmF5LmZyb20oY2xvc2VzdChjdXJyZW50Q2VsbCwgVEFCTEVfU0VMRUNUT1IpIS5xdWVyeVNlbGVjdG9yQWxsKFxuICAgICAgICAgICAgICAgICAgICAgIEVESVRBQkxFX0NFTExfU0VMRUNUT1IpKSBhcyBIVE1MRWxlbWVudFtdO1xuICAgIGNvbnN0IGN1cnJlbnRJbmRleCA9IGNlbGxzLmluZGV4T2YoY3VycmVudENlbGwpO1xuICAgIGNvbnN0IG5ld0luZGV4ID0gY3VycmVudEluZGV4ICsgb2Zmc2V0O1xuXG4gICAgaWYgKGNlbGxzW25ld0luZGV4XSkge1xuICAgICAgY2VsbHNbbmV3SW5kZXhdLmZvY3VzKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIE1vdmVzIGZvY3VzIHRvIHVwIG9yIGRvd24gYnkgcm93IGJ5IG9mZnNldCBjZWxscyByZWxhdGl2ZSB0byBjdXJyZW50Q2VsbC4gKi9cbiAgbW92ZUZvY3VzVmVydGljYWxseShjdXJyZW50Q2VsbDogSFRNTEVsZW1lbnQsIG9mZnNldDogbnVtYmVyKTogdm9pZCB7XG4gICAgY29uc3QgY3VycmVudFJvdyA9IGNsb3Nlc3QoY3VycmVudENlbGwsIFJPV19TRUxFQ1RPUikhO1xuICAgIGNvbnN0IHJvd3MgPSBBcnJheS5mcm9tKGNsb3Nlc3QoY3VycmVudFJvdywgVEFCTEVfU0VMRUNUT1IpIS5xdWVyeVNlbGVjdG9yQWxsKFJPV19TRUxFQ1RPUikpO1xuICAgIGNvbnN0IGN1cnJlbnRSb3dJbmRleCA9IHJvd3MuaW5kZXhPZihjdXJyZW50Um93KTtcbiAgICBjb25zdCBjdXJyZW50SW5kZXhXaXRoaW5Sb3cgPVxuICAgICAgICBBcnJheS5mcm9tKGN1cnJlbnRSb3cucXVlcnlTZWxlY3RvckFsbChFRElUQUJMRV9DRUxMX1NFTEVDVE9SKSkuaW5kZXhPZihjdXJyZW50Q2VsbCk7XG4gICAgY29uc3QgbmV3Um93SW5kZXggPSBjdXJyZW50Um93SW5kZXggKyBvZmZzZXQ7XG5cbiAgICBpZiAocm93c1tuZXdSb3dJbmRleF0pIHtcbiAgICAgIGNvbnN0IHJvd1RvRm9jdXMgPVxuICAgICAgICAgIEFycmF5LmZyb20ocm93c1tuZXdSb3dJbmRleF0ucXVlcnlTZWxlY3RvckFsbChFRElUQUJMRV9DRUxMX1NFTEVDVE9SKSkgYXMgSFRNTEVsZW1lbnRbXTtcblxuICAgICAgaWYgKHJvd1RvRm9jdXNbY3VycmVudEluZGV4V2l0aGluUm93XSkge1xuICAgICAgICByb3dUb0ZvY3VzW2N1cnJlbnRJbmRleFdpdGhpblJvd10uZm9jdXMoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKiogVHJhbnNsYXRlcyBhcnJvdyBrZXlkb3duIGV2ZW50cyBpbnRvIGZvY3VzIG1vdmUgb3BlcmF0aW9ucy4gKi9cbiAgcHJvdGVjdGVkIGhhbmRsZUtleWJvYXJkRXZlbnQoZXZlbnQ6IEtleWJvYXJkRXZlbnQpOiB2b2lkIHtcbiAgICBjb25zdCBjZWxsID0gY2xvc2VzdChldmVudC50YXJnZXQsIEVESVRBQkxFX0NFTExfU0VMRUNUT1IpIGFzIEhUTUxFbGVtZW50IHwgbnVsbDtcblxuICAgIGlmICghY2VsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHN3aXRjaCAoZXZlbnQua2V5Q29kZSkge1xuICAgICAgY2FzZSBVUF9BUlJPVzpcbiAgICAgICAgdGhpcy5tb3ZlRm9jdXNWZXJ0aWNhbGx5KGNlbGwsIC0xKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIERPV05fQVJST1c6XG4gICAgICAgIHRoaXMubW92ZUZvY3VzVmVydGljYWxseShjZWxsLCAxKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIExFRlRfQVJST1c6XG4gICAgICAgIHRoaXMubW92ZUZvY3VzSG9yaXpvbnRhbGx5KGNlbGwsIHRoaXMuZGlyZWN0aW9uYWxpdHkudmFsdWUgPT09ICdsdHInID8gLTEgOiAxKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFJJR0hUX0FSUk9XOlxuICAgICAgICB0aGlzLm1vdmVGb2N1c0hvcml6b250YWxseShjZWxsLCB0aGlzLmRpcmVjdGlvbmFsaXR5LnZhbHVlID09PSAnbHRyJyA/IDEgOiAtMSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgLy8gSWYgdGhlIGtleWJvYXJkIGV2ZW50IGlzIG5vdCBoYW5kbGVkLCByZXR1cm4gbm93IHNvIHRoYXQgd2UgZG9uJ3QgYHByZXZlbnREZWZhdWx0YC5cbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gIH1cbn1cbiJdfQ==