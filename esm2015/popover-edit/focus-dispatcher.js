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
let FocusDispatcher = /** @class */ (() => {
    class FocusDispatcher {
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
    FocusDispatcher.ɵprov = i0.ɵɵdefineInjectable({ factory: function FocusDispatcher_Factory() { return new FocusDispatcher(i0.ɵɵinject(i1.Directionality)); }, token: FocusDispatcher, providedIn: "root" });
    FocusDispatcher.decorators = [
        { type: Injectable, args: [{ providedIn: 'root' },] }
    ];
    FocusDispatcher.ctorParameters = () => [
        { type: Directionality }
    ];
    return FocusDispatcher;
})();
export { FocusDispatcher };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9jdXMtZGlzcGF0Y2hlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL3BvcG92ZXItZWRpdC9mb2N1cy1kaXNwYXRjaGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUNqRCxPQUFPLEVBQUMsVUFBVSxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsVUFBVSxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDcEYsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUd6QyxPQUFPLEVBQUMsc0JBQXNCLEVBQUUsWUFBWSxFQUFFLGNBQWMsRUFBQyxNQUFNLGFBQWEsQ0FBQztBQUNqRixPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sWUFBWSxDQUFDOzs7QUFFbkM7OztHQUdHO0FBQ0g7SUFBQSxNQUNhLGVBQWU7UUFJMUIsWUFBK0IsY0FBOEI7WUFBOUIsbUJBQWMsR0FBZCxjQUFjLENBQWdCO1lBQzNELElBQUksQ0FBQyxXQUFXLEdBQUcsRUFBQyxJQUFJLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLENBQUMsRUFBQyxDQUFDO1FBQ3hFLENBQUM7UUFFRDs7O1dBR0c7UUFDSCxxQkFBcUIsQ0FBQyxXQUF3QixFQUFFLE1BQWM7WUFDNUQsTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLGNBQWMsQ0FBRSxDQUFDLGdCQUFnQixDQUM3RCxzQkFBc0IsQ0FBQyxDQUFrQixDQUFDO1lBQzVELE1BQU0sWUFBWSxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDaEQsTUFBTSxRQUFRLEdBQUcsWUFBWSxHQUFHLE1BQU0sQ0FBQztZQUV2QyxJQUFJLEtBQUssQ0FBQyxRQUFRLENBQUMsRUFBRTtnQkFDbkIsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO2FBQ3pCO1FBQ0gsQ0FBQztRQUVELGdGQUFnRjtRQUNoRixtQkFBbUIsQ0FBQyxXQUF3QixFQUFFLE1BQWM7WUFDMUQsTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLFdBQVcsRUFBRSxZQUFZLENBQUUsQ0FBQztZQUN2RCxNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsY0FBYyxDQUFFLENBQUMsZ0JBQWdCLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztZQUM3RixNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ2pELE1BQU0scUJBQXFCLEdBQ3ZCLEtBQUssQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLGdCQUFnQixDQUFDLHNCQUFzQixDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDekYsTUFBTSxXQUFXLEdBQUcsZUFBZSxHQUFHLE1BQU0sQ0FBQztZQUU3QyxJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRTtnQkFDckIsTUFBTSxVQUFVLEdBQ1osS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsc0JBQXNCLENBQUMsQ0FBa0IsQ0FBQztnQkFFNUYsSUFBSSxVQUFVLENBQUMscUJBQXFCLENBQUMsRUFBRTtvQkFDckMsVUFBVSxDQUFDLHFCQUFxQixDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7aUJBQzNDO2FBQ0Y7UUFDSCxDQUFDO1FBRUQsa0VBQWtFO1FBQ3hELG1CQUFtQixDQUFDLEtBQW9CO1lBQ2hELE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLHNCQUFzQixDQUF1QixDQUFDO1lBRWpGLElBQUksQ0FBQyxJQUFJLEVBQUU7Z0JBQ1QsT0FBTzthQUNSO1lBRUQsUUFBUSxLQUFLLENBQUMsT0FBTyxFQUFFO2dCQUNyQixLQUFLLFFBQVE7b0JBQ1gsSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNuQyxNQUFNO2dCQUNSLEtBQUssVUFBVTtvQkFDYixJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO29CQUNsQyxNQUFNO2dCQUNSLEtBQUssVUFBVTtvQkFDYixJQUFJLENBQUMscUJBQXFCLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUMvRSxNQUFNO2dCQUNSLEtBQUssV0FBVztvQkFDZCxJQUFJLENBQUMscUJBQXFCLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUMvRSxNQUFNO2dCQUNSO29CQUNFLHNGQUFzRjtvQkFDdEYsT0FBTzthQUNWO1lBRUQsS0FBSyxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQ3pCLENBQUM7Ozs7Z0JBdEVGLFVBQVUsU0FBQyxFQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUM7OztnQkFaeEIsY0FBYzs7MEJBUnRCO0tBMkZDO1NBdEVZLGVBQWUiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtEaXJlY3Rpb25hbGl0eX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2JpZGknO1xuaW1wb3J0IHtMRUZUX0FSUk9XLCBVUF9BUlJPVywgUklHSFRfQVJST1csIERPV05fQVJST1d9IGZyb20gJ0Bhbmd1bGFyL2Nkay9rZXljb2Rlcyc7XG5pbXBvcnQge0luamVjdGFibGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtQYXJ0aWFsT2JzZXJ2ZXJ9IGZyb20gJ3J4anMnO1xuXG5pbXBvcnQge0VESVRBQkxFX0NFTExfU0VMRUNUT1IsIFJPV19TRUxFQ1RPUiwgVEFCTEVfU0VMRUNUT1J9IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCB7Y2xvc2VzdH0gZnJvbSAnLi9wb2x5ZmlsbCc7XG5cbi8qKlxuICogU2VydmljZSByZXNwb25zaWJsZSBmb3IgbW92aW5nIGNlbGwgZm9jdXMgYXJvdW5kIGluIHJlc3BvbnNlIHRvIGtleWJvYXJkIGV2ZW50cy5cbiAqIE1heSBiZSBvdmVycmlkZGVuIHRvIGN1c3RvbWl6ZSB0aGUga2V5Ym9hcmQgYmVoYXZpb3Igb2YgcG9wb3ZlciBlZGl0LlxuICovXG5ASW5qZWN0YWJsZSh7cHJvdmlkZWRJbjogJ3Jvb3QnfSlcbmV4cG9ydCBjbGFzcyBGb2N1c0Rpc3BhdGNoZXIge1xuICAvKiogT2JzZXJ2ZXMga2V5ZG93biBldmVudHMgdHJpZ2dlcmVkIGZyb20gdGhlIHRhYmxlLiAqL1xuICByZWFkb25seSBrZXlPYnNlcnZlcjogUGFydGlhbE9ic2VydmVyPEtleWJvYXJkRXZlbnQ+O1xuXG4gIGNvbnN0cnVjdG9yKHByb3RlY3RlZCByZWFkb25seSBkaXJlY3Rpb25hbGl0eTogRGlyZWN0aW9uYWxpdHkpIHtcbiAgICB0aGlzLmtleU9ic2VydmVyID0ge25leHQ6IChldmVudCkgPT4gdGhpcy5oYW5kbGVLZXlib2FyZEV2ZW50KGV2ZW50KX07XG4gIH1cblxuICAvKipcbiAgICogTW92ZXMgZm9jdXMgdG8gZWFybGllciBvciBsYXRlciBjZWxscyAoaW4gZG9tIG9yZGVyKSBieSBvZmZzZXQgY2VsbHMgcmVsYXRpdmUgdG9cbiAgICogY3VycmVudENlbGwuXG4gICAqL1xuICBtb3ZlRm9jdXNIb3Jpem9udGFsbHkoY3VycmVudENlbGw6IEhUTUxFbGVtZW50LCBvZmZzZXQ6IG51bWJlcik6IHZvaWQge1xuICAgIGNvbnN0IGNlbGxzID0gQXJyYXkuZnJvbShjbG9zZXN0KGN1cnJlbnRDZWxsLCBUQUJMRV9TRUxFQ1RPUikhLnF1ZXJ5U2VsZWN0b3JBbGwoXG4gICAgICAgICAgICAgICAgICAgICAgRURJVEFCTEVfQ0VMTF9TRUxFQ1RPUikpIGFzIEhUTUxFbGVtZW50W107XG4gICAgY29uc3QgY3VycmVudEluZGV4ID0gY2VsbHMuaW5kZXhPZihjdXJyZW50Q2VsbCk7XG4gICAgY29uc3QgbmV3SW5kZXggPSBjdXJyZW50SW5kZXggKyBvZmZzZXQ7XG5cbiAgICBpZiAoY2VsbHNbbmV3SW5kZXhdKSB7XG4gICAgICBjZWxsc1tuZXdJbmRleF0uZm9jdXMoKTtcbiAgICB9XG4gIH1cblxuICAvKiogTW92ZXMgZm9jdXMgdG8gdXAgb3IgZG93biBieSByb3cgYnkgb2Zmc2V0IGNlbGxzIHJlbGF0aXZlIHRvIGN1cnJlbnRDZWxsLiAqL1xuICBtb3ZlRm9jdXNWZXJ0aWNhbGx5KGN1cnJlbnRDZWxsOiBIVE1MRWxlbWVudCwgb2Zmc2V0OiBudW1iZXIpOiB2b2lkIHtcbiAgICBjb25zdCBjdXJyZW50Um93ID0gY2xvc2VzdChjdXJyZW50Q2VsbCwgUk9XX1NFTEVDVE9SKSE7XG4gICAgY29uc3Qgcm93cyA9IEFycmF5LmZyb20oY2xvc2VzdChjdXJyZW50Um93LCBUQUJMRV9TRUxFQ1RPUikhLnF1ZXJ5U2VsZWN0b3JBbGwoUk9XX1NFTEVDVE9SKSk7XG4gICAgY29uc3QgY3VycmVudFJvd0luZGV4ID0gcm93cy5pbmRleE9mKGN1cnJlbnRSb3cpO1xuICAgIGNvbnN0IGN1cnJlbnRJbmRleFdpdGhpblJvdyA9XG4gICAgICAgIEFycmF5LmZyb20oY3VycmVudFJvdy5xdWVyeVNlbGVjdG9yQWxsKEVESVRBQkxFX0NFTExfU0VMRUNUT1IpKS5pbmRleE9mKGN1cnJlbnRDZWxsKTtcbiAgICBjb25zdCBuZXdSb3dJbmRleCA9IGN1cnJlbnRSb3dJbmRleCArIG9mZnNldDtcblxuICAgIGlmIChyb3dzW25ld1Jvd0luZGV4XSkge1xuICAgICAgY29uc3Qgcm93VG9Gb2N1cyA9XG4gICAgICAgICAgQXJyYXkuZnJvbShyb3dzW25ld1Jvd0luZGV4XS5xdWVyeVNlbGVjdG9yQWxsKEVESVRBQkxFX0NFTExfU0VMRUNUT1IpKSBhcyBIVE1MRWxlbWVudFtdO1xuXG4gICAgICBpZiAocm93VG9Gb2N1c1tjdXJyZW50SW5kZXhXaXRoaW5Sb3ddKSB7XG4gICAgICAgIHJvd1RvRm9jdXNbY3VycmVudEluZGV4V2l0aGluUm93XS5mb2N1cygpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKiBUcmFuc2xhdGVzIGFycm93IGtleWRvd24gZXZlbnRzIGludG8gZm9jdXMgbW92ZSBvcGVyYXRpb25zLiAqL1xuICBwcm90ZWN0ZWQgaGFuZGxlS2V5Ym9hcmRFdmVudChldmVudDogS2V5Ym9hcmRFdmVudCk6IHZvaWQge1xuICAgIGNvbnN0IGNlbGwgPSBjbG9zZXN0KGV2ZW50LnRhcmdldCwgRURJVEFCTEVfQ0VMTF9TRUxFQ1RPUikgYXMgSFRNTEVsZW1lbnQgfCBudWxsO1xuXG4gICAgaWYgKCFjZWxsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgc3dpdGNoIChldmVudC5rZXlDb2RlKSB7XG4gICAgICBjYXNlIFVQX0FSUk9XOlxuICAgICAgICB0aGlzLm1vdmVGb2N1c1ZlcnRpY2FsbHkoY2VsbCwgLTEpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgRE9XTl9BUlJPVzpcbiAgICAgICAgdGhpcy5tb3ZlRm9jdXNWZXJ0aWNhbGx5KGNlbGwsIDEpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgTEVGVF9BUlJPVzpcbiAgICAgICAgdGhpcy5tb3ZlRm9jdXNIb3Jpem9udGFsbHkoY2VsbCwgdGhpcy5kaXJlY3Rpb25hbGl0eS52YWx1ZSA9PT0gJ2x0cicgPyAtMSA6IDEpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgUklHSFRfQVJST1c6XG4gICAgICAgIHRoaXMubW92ZUZvY3VzSG9yaXpvbnRhbGx5KGNlbGwsIHRoaXMuZGlyZWN0aW9uYWxpdHkudmFsdWUgPT09ICdsdHInID8gMSA6IC0xKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICAvLyBJZiB0aGUga2V5Ym9hcmQgZXZlbnQgaXMgbm90IGhhbmRsZWQsIHJldHVybiBub3cgc28gdGhhdCB3ZSBkb24ndCBgcHJldmVudERlZmF1bHRgLlxuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgfVxufVxuIl19