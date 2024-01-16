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
        this.keyObserver = { next: event => this.handleKeyboardEvent(event) };
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.1.0-rc.0", ngImport: i0, type: FocusDispatcher, deps: [{ token: i1.Directionality }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "17.1.0-rc.0", ngImport: i0, type: FocusDispatcher, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.1.0-rc.0", ngImport: i0, type: FocusDispatcher, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: () => [{ type: i1.Directionality }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9jdXMtZGlzcGF0Y2hlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL3BvcG92ZXItZWRpdC9mb2N1cy1kaXNwYXRjaGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUNqRCxPQUFPLEVBQUMsVUFBVSxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsVUFBVSxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDcEYsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUd6QyxPQUFPLEVBQUMsc0JBQXNCLEVBQUUsWUFBWSxFQUFFLGNBQWMsRUFBQyxNQUFNLGFBQWEsQ0FBQztBQUNqRixPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sWUFBWSxDQUFDOzs7QUFFbkM7OztHQUdHO0FBRUgsTUFBTSxPQUFPLGVBQWU7SUFJMUIsWUFBK0IsY0FBOEI7UUFBOUIsbUJBQWMsR0FBZCxjQUFjLENBQWdCO1FBQzNELElBQUksQ0FBQyxXQUFXLEdBQUcsRUFBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsS0FBSyxDQUFDLEVBQUMsQ0FBQztJQUN0RSxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gscUJBQXFCLENBQUMsV0FBd0IsRUFBRSxNQUFjO1FBQzVELE1BQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQ3RCLE9BQU8sQ0FBQyxXQUFXLEVBQUUsY0FBYyxDQUFFLENBQUMsZ0JBQWdCLENBQUMsc0JBQXNCLENBQUMsQ0FDOUQsQ0FBQztRQUNuQixNQUFNLFlBQVksR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ2hELE1BQU0sUUFBUSxHQUFHLFlBQVksR0FBRyxNQUFNLENBQUM7UUFFdkMsSUFBSSxLQUFLLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQztZQUNwQixLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDMUIsQ0FBQztJQUNILENBQUM7SUFFRCxnRkFBZ0Y7SUFDaEYsbUJBQW1CLENBQUMsV0FBd0IsRUFBRSxNQUFjO1FBQzFELE1BQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxXQUFXLEVBQUUsWUFBWSxDQUFFLENBQUM7UUFDdkQsTUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLGNBQWMsQ0FBRSxDQUFDLGdCQUFnQixDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7UUFDN0YsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUNqRCxNQUFNLHFCQUFxQixHQUFHLEtBQUssQ0FBQyxJQUFJLENBQ3RDLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxzQkFBc0IsQ0FBQyxDQUNwRCxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUN2QixNQUFNLFdBQVcsR0FBRyxlQUFlLEdBQUcsTUFBTSxDQUFDO1FBRTdDLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUM7WUFDdEIsTUFBTSxVQUFVLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FDM0IsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLHNCQUFzQixDQUFDLENBQzFDLENBQUM7WUFFbkIsSUFBSSxVQUFVLENBQUMscUJBQXFCLENBQUMsRUFBRSxDQUFDO2dCQUN0QyxVQUFVLENBQUMscUJBQXFCLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUM1QyxDQUFDO1FBQ0gsQ0FBQztJQUNILENBQUM7SUFFRCxrRUFBa0U7SUFDeEQsbUJBQW1CLENBQUMsS0FBb0I7UUFDaEQsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsc0JBQXNCLENBQXVCLENBQUM7UUFFakYsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ1YsT0FBTztRQUNULENBQUM7UUFFRCxRQUFRLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUN0QixLQUFLLFFBQVE7Z0JBQ1gsSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNuQyxNQUFNO1lBQ1IsS0FBSyxVQUFVO2dCQUNiLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ2xDLE1BQU07WUFDUixLQUFLLFVBQVU7Z0JBQ2IsSUFBSSxDQUFDLHFCQUFxQixDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDL0UsTUFBTTtZQUNSLEtBQUssV0FBVztnQkFDZCxJQUFJLENBQUMscUJBQXFCLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMvRSxNQUFNO1lBQ1I7Z0JBQ0Usc0ZBQXNGO2dCQUN0RixPQUFPO1FBQ1gsQ0FBQztRQUVELEtBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQztJQUN6QixDQUFDO21IQXhFVSxlQUFlO3VIQUFmLGVBQWUsY0FESCxNQUFNOztnR0FDbEIsZUFBZTtrQkFEM0IsVUFBVTttQkFBQyxFQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtEaXJlY3Rpb25hbGl0eX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2JpZGknO1xuaW1wb3J0IHtMRUZUX0FSUk9XLCBVUF9BUlJPVywgUklHSFRfQVJST1csIERPV05fQVJST1d9IGZyb20gJ0Bhbmd1bGFyL2Nkay9rZXljb2Rlcyc7XG5pbXBvcnQge0luamVjdGFibGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtQYXJ0aWFsT2JzZXJ2ZXJ9IGZyb20gJ3J4anMnO1xuXG5pbXBvcnQge0VESVRBQkxFX0NFTExfU0VMRUNUT1IsIFJPV19TRUxFQ1RPUiwgVEFCTEVfU0VMRUNUT1J9IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCB7Y2xvc2VzdH0gZnJvbSAnLi9wb2x5ZmlsbCc7XG5cbi8qKlxuICogU2VydmljZSByZXNwb25zaWJsZSBmb3IgbW92aW5nIGNlbGwgZm9jdXMgYXJvdW5kIGluIHJlc3BvbnNlIHRvIGtleWJvYXJkIGV2ZW50cy5cbiAqIE1heSBiZSBvdmVycmlkZGVuIHRvIGN1c3RvbWl6ZSB0aGUga2V5Ym9hcmQgYmVoYXZpb3Igb2YgcG9wb3ZlciBlZGl0LlxuICovXG5ASW5qZWN0YWJsZSh7cHJvdmlkZWRJbjogJ3Jvb3QnfSlcbmV4cG9ydCBjbGFzcyBGb2N1c0Rpc3BhdGNoZXIge1xuICAvKiogT2JzZXJ2ZXMga2V5ZG93biBldmVudHMgdHJpZ2dlcmVkIGZyb20gdGhlIHRhYmxlLiAqL1xuICByZWFkb25seSBrZXlPYnNlcnZlcjogUGFydGlhbE9ic2VydmVyPEtleWJvYXJkRXZlbnQ+O1xuXG4gIGNvbnN0cnVjdG9yKHByb3RlY3RlZCByZWFkb25seSBkaXJlY3Rpb25hbGl0eTogRGlyZWN0aW9uYWxpdHkpIHtcbiAgICB0aGlzLmtleU9ic2VydmVyID0ge25leHQ6IGV2ZW50ID0+IHRoaXMuaGFuZGxlS2V5Ym9hcmRFdmVudChldmVudCl9O1xuICB9XG5cbiAgLyoqXG4gICAqIE1vdmVzIGZvY3VzIHRvIGVhcmxpZXIgb3IgbGF0ZXIgY2VsbHMgKGluIGRvbSBvcmRlcikgYnkgb2Zmc2V0IGNlbGxzIHJlbGF0aXZlIHRvXG4gICAqIGN1cnJlbnRDZWxsLlxuICAgKi9cbiAgbW92ZUZvY3VzSG9yaXpvbnRhbGx5KGN1cnJlbnRDZWxsOiBIVE1MRWxlbWVudCwgb2Zmc2V0OiBudW1iZXIpOiB2b2lkIHtcbiAgICBjb25zdCBjZWxscyA9IEFycmF5LmZyb20oXG4gICAgICBjbG9zZXN0KGN1cnJlbnRDZWxsLCBUQUJMRV9TRUxFQ1RPUikhLnF1ZXJ5U2VsZWN0b3JBbGwoRURJVEFCTEVfQ0VMTF9TRUxFQ1RPUiksXG4gICAgKSBhcyBIVE1MRWxlbWVudFtdO1xuICAgIGNvbnN0IGN1cnJlbnRJbmRleCA9IGNlbGxzLmluZGV4T2YoY3VycmVudENlbGwpO1xuICAgIGNvbnN0IG5ld0luZGV4ID0gY3VycmVudEluZGV4ICsgb2Zmc2V0O1xuXG4gICAgaWYgKGNlbGxzW25ld0luZGV4XSkge1xuICAgICAgY2VsbHNbbmV3SW5kZXhdLmZvY3VzKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIE1vdmVzIGZvY3VzIHRvIHVwIG9yIGRvd24gYnkgcm93IGJ5IG9mZnNldCBjZWxscyByZWxhdGl2ZSB0byBjdXJyZW50Q2VsbC4gKi9cbiAgbW92ZUZvY3VzVmVydGljYWxseShjdXJyZW50Q2VsbDogSFRNTEVsZW1lbnQsIG9mZnNldDogbnVtYmVyKTogdm9pZCB7XG4gICAgY29uc3QgY3VycmVudFJvdyA9IGNsb3Nlc3QoY3VycmVudENlbGwsIFJPV19TRUxFQ1RPUikhO1xuICAgIGNvbnN0IHJvd3MgPSBBcnJheS5mcm9tKGNsb3Nlc3QoY3VycmVudFJvdywgVEFCTEVfU0VMRUNUT1IpIS5xdWVyeVNlbGVjdG9yQWxsKFJPV19TRUxFQ1RPUikpO1xuICAgIGNvbnN0IGN1cnJlbnRSb3dJbmRleCA9IHJvd3MuaW5kZXhPZihjdXJyZW50Um93KTtcbiAgICBjb25zdCBjdXJyZW50SW5kZXhXaXRoaW5Sb3cgPSBBcnJheS5mcm9tKFxuICAgICAgY3VycmVudFJvdy5xdWVyeVNlbGVjdG9yQWxsKEVESVRBQkxFX0NFTExfU0VMRUNUT1IpLFxuICAgICkuaW5kZXhPZihjdXJyZW50Q2VsbCk7XG4gICAgY29uc3QgbmV3Um93SW5kZXggPSBjdXJyZW50Um93SW5kZXggKyBvZmZzZXQ7XG5cbiAgICBpZiAocm93c1tuZXdSb3dJbmRleF0pIHtcbiAgICAgIGNvbnN0IHJvd1RvRm9jdXMgPSBBcnJheS5mcm9tKFxuICAgICAgICByb3dzW25ld1Jvd0luZGV4XS5xdWVyeVNlbGVjdG9yQWxsKEVESVRBQkxFX0NFTExfU0VMRUNUT1IpLFxuICAgICAgKSBhcyBIVE1MRWxlbWVudFtdO1xuXG4gICAgICBpZiAocm93VG9Gb2N1c1tjdXJyZW50SW5kZXhXaXRoaW5Sb3ddKSB7XG4gICAgICAgIHJvd1RvRm9jdXNbY3VycmVudEluZGV4V2l0aGluUm93XS5mb2N1cygpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKiBUcmFuc2xhdGVzIGFycm93IGtleWRvd24gZXZlbnRzIGludG8gZm9jdXMgbW92ZSBvcGVyYXRpb25zLiAqL1xuICBwcm90ZWN0ZWQgaGFuZGxlS2V5Ym9hcmRFdmVudChldmVudDogS2V5Ym9hcmRFdmVudCk6IHZvaWQge1xuICAgIGNvbnN0IGNlbGwgPSBjbG9zZXN0KGV2ZW50LnRhcmdldCwgRURJVEFCTEVfQ0VMTF9TRUxFQ1RPUikgYXMgSFRNTEVsZW1lbnQgfCBudWxsO1xuXG4gICAgaWYgKCFjZWxsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgc3dpdGNoIChldmVudC5rZXlDb2RlKSB7XG4gICAgICBjYXNlIFVQX0FSUk9XOlxuICAgICAgICB0aGlzLm1vdmVGb2N1c1ZlcnRpY2FsbHkoY2VsbCwgLTEpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgRE9XTl9BUlJPVzpcbiAgICAgICAgdGhpcy5tb3ZlRm9jdXNWZXJ0aWNhbGx5KGNlbGwsIDEpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgTEVGVF9BUlJPVzpcbiAgICAgICAgdGhpcy5tb3ZlRm9jdXNIb3Jpem9udGFsbHkoY2VsbCwgdGhpcy5kaXJlY3Rpb25hbGl0eS52YWx1ZSA9PT0gJ2x0cicgPyAtMSA6IDEpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgUklHSFRfQVJST1c6XG4gICAgICAgIHRoaXMubW92ZUZvY3VzSG9yaXpvbnRhbGx5KGNlbGwsIHRoaXMuZGlyZWN0aW9uYWxpdHkudmFsdWUgPT09ICdsdHInID8gMSA6IC0xKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICAvLyBJZiB0aGUga2V5Ym9hcmQgZXZlbnQgaXMgbm90IGhhbmRsZWQsIHJldHVybiBub3cgc28gdGhhdCB3ZSBkb24ndCBgcHJldmVudERlZmF1bHRgLlxuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgfVxufVxuIl19