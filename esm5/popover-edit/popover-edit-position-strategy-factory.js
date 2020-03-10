/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __extends } from "tslib";
import { Directionality } from '@angular/cdk/bidi';
import { Overlay } from '@angular/cdk/overlay';
import { Injectable } from '@angular/core';
/**
 * Overridable factory responsible for configuring how cdkPopoverEdit popovers are positioned
 * and sized.
 */
var PopoverEditPositionStrategyFactory = /** @class */ (function () {
    function PopoverEditPositionStrategyFactory() {
    }
    PopoverEditPositionStrategyFactory.decorators = [
        { type: Injectable }
    ];
    return PopoverEditPositionStrategyFactory;
}());
export { PopoverEditPositionStrategyFactory };
/**
 * Default implementation of PopoverEditPositionStrategyFactory.
 * Uses a FlexibleConnectedPositionStrategy anchored to the start + top of the cell.
 * Note: This will change to CoverPositionStrategy once it implemented.
 */
var DefaultPopoverEditPositionStrategyFactory = /** @class */ (function (_super) {
    __extends(DefaultPopoverEditPositionStrategyFactory, _super);
    function DefaultPopoverEditPositionStrategyFactory(direction, overlay) {
        var _this = _super.call(this) || this;
        _this.direction = direction;
        _this.overlay = overlay;
        return _this;
    }
    DefaultPopoverEditPositionStrategyFactory.prototype.positionStrategyForCells = function (cells) {
        return this.overlay.position()
            .flexibleConnectedTo(cells[0])
            .withGrowAfterOpen()
            .withPush()
            .withViewportMargin(16)
            .withPositions([{
                originX: 'start',
                originY: 'top',
                overlayX: 'start',
                overlayY: 'top',
            }]);
    };
    DefaultPopoverEditPositionStrategyFactory.prototype.sizeConfigForCells = function (cells) {
        if (cells.length === 0) {
            return {};
        }
        if (cells.length === 1) {
            return { width: cells[0].getBoundingClientRect().width };
        }
        var firstCell, lastCell;
        if (this.direction.value === 'ltr') {
            firstCell = cells[0];
            lastCell = cells[cells.length - 1];
        }
        else {
            lastCell = cells[0];
            firstCell = cells[cells.length - 1];
        }
        return { width: lastCell.getBoundingClientRect().right - firstCell.getBoundingClientRect().left };
    };
    DefaultPopoverEditPositionStrategyFactory.decorators = [
        { type: Injectable }
    ];
    /** @nocollapse */
    DefaultPopoverEditPositionStrategyFactory.ctorParameters = function () { return [
        { type: Directionality },
        { type: Overlay }
    ]; };
    return DefaultPopoverEditPositionStrategyFactory;
}(PopoverEditPositionStrategyFactory));
export { DefaultPopoverEditPositionStrategyFactory };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wb3Zlci1lZGl0LXBvc2l0aW9uLXN0cmF0ZWd5LWZhY3RvcnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrLWV4cGVyaW1lbnRhbC9wb3BvdmVyLWVkaXQvcG9wb3Zlci1lZGl0LXBvc2l0aW9uLXN0cmF0ZWd5LWZhY3RvcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUVILE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUNqRCxPQUFPLEVBQUMsT0FBTyxFQUFzQyxNQUFNLHNCQUFzQixDQUFDO0FBQ2xGLE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFekM7OztHQUdHO0FBQ0g7SUFBQTtJQWFBLENBQUM7O2dCQWJBLFVBQVU7O0lBYVgseUNBQUM7Q0FBQSxBQWJELElBYUM7U0FacUIsa0NBQWtDO0FBY3hEOzs7O0dBSUc7QUFDSDtJQUMrRCw2REFBa0M7SUFDL0YsbURBQStCLFNBQXlCLEVBQXFCLE9BQWdCO1FBQTdGLFlBQ0UsaUJBQU8sU0FDUjtRQUY4QixlQUFTLEdBQVQsU0FBUyxDQUFnQjtRQUFxQixhQUFPLEdBQVAsT0FBTyxDQUFTOztJQUU3RixDQUFDO0lBRUQsNEVBQXdCLEdBQXhCLFVBQXlCLEtBQW9CO1FBQzNDLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUU7YUFDekIsbUJBQW1CLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQzdCLGlCQUFpQixFQUFFO2FBQ25CLFFBQVEsRUFBRTthQUNWLGtCQUFrQixDQUFDLEVBQUUsQ0FBQzthQUN0QixhQUFhLENBQUMsQ0FBQztnQkFDZCxPQUFPLEVBQUUsT0FBTztnQkFDaEIsT0FBTyxFQUFFLEtBQUs7Z0JBQ2QsUUFBUSxFQUFFLE9BQU87Z0JBQ2pCLFFBQVEsRUFBRSxLQUFLO2FBQ2hCLENBQUMsQ0FBQyxDQUFDO0lBQ1YsQ0FBQztJQUVELHNFQUFrQixHQUFsQixVQUFtQixLQUFvQjtRQUNyQyxJQUFJLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQ3RCLE9BQU8sRUFBRSxDQUFDO1NBQ1g7UUFFRCxJQUFJLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQ3RCLE9BQU8sRUFBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLHFCQUFxQixFQUFFLENBQUMsS0FBSyxFQUFDLENBQUM7U0FDeEQ7UUFFRCxJQUFJLFNBQVMsRUFBRSxRQUFRLENBQUM7UUFDeEIsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssS0FBSyxLQUFLLEVBQUU7WUFDbEMsU0FBUyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNyQixRQUFRLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7U0FDcEM7YUFBTTtZQUNMLFFBQVEsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDcEIsU0FBUyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO1NBQ3JDO1FBRUQsT0FBTyxFQUFDLEtBQUssRUFBRSxRQUFRLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxLQUFLLEdBQUcsU0FBUyxDQUFDLHFCQUFxQixFQUFFLENBQUMsSUFBSSxFQUFDLENBQUM7SUFDbEcsQ0FBQzs7Z0JBdkNGLFVBQVU7Ozs7Z0JBNUJILGNBQWM7Z0JBQ2QsT0FBTzs7SUFtRWYsZ0RBQUM7Q0FBQSxBQXhDRCxDQUMrRCxrQ0FBa0MsR0F1Q2hHO1NBdkNZLHlDQUF5QyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0RpcmVjdGlvbmFsaXR5fSBmcm9tICdAYW5ndWxhci9jZGsvYmlkaSc7XG5pbXBvcnQge092ZXJsYXksIE92ZXJsYXlTaXplQ29uZmlnLCBQb3NpdGlvblN0cmF0ZWd5fSBmcm9tICdAYW5ndWxhci9jZGsvb3ZlcmxheSc7XG5pbXBvcnQge0luamVjdGFibGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG4vKipcbiAqIE92ZXJyaWRhYmxlIGZhY3RvcnkgcmVzcG9uc2libGUgZm9yIGNvbmZpZ3VyaW5nIGhvdyBjZGtQb3BvdmVyRWRpdCBwb3BvdmVycyBhcmUgcG9zaXRpb25lZFxuICogYW5kIHNpemVkLlxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgUG9wb3ZlckVkaXRQb3NpdGlvblN0cmF0ZWd5RmFjdG9yeSB7XG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgUG9zaXRpb25TdHJhdGVneSBiYXNlZCBvbiB0aGUgc3BlY2lmaWVkIHRhYmxlIGNlbGxzLlxuICAgKiBUaGUgY2VsbHMgd2lsbCBiZSBwcm92aWRlZCBpbiBET00gb3JkZXIuXG4gICAqL1xuICBhYnN0cmFjdCBwb3NpdGlvblN0cmF0ZWd5Rm9yQ2VsbHMoY2VsbHM6IEhUTUxFbGVtZW50W10pOiBQb3NpdGlvblN0cmF0ZWd5O1xuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGFuIE92ZXJsYXlTaXplQ29uZmlnIGJhc2VkIG9uIHRoZSBzcGVjaWZpZWQgdGFibGUgY2VsbHMuXG4gICAqIFRoZSBjZWxscyB3aWxsIGJlIHByb3ZpZGVkIGluIERPTSBvcmRlci5cbiAgICovXG4gIGFic3RyYWN0IHNpemVDb25maWdGb3JDZWxscyhjZWxsczogSFRNTEVsZW1lbnRbXSk6IE92ZXJsYXlTaXplQ29uZmlnO1xufVxuXG4vKipcbiAqIERlZmF1bHQgaW1wbGVtZW50YXRpb24gb2YgUG9wb3ZlckVkaXRQb3NpdGlvblN0cmF0ZWd5RmFjdG9yeS5cbiAqIFVzZXMgYSBGbGV4aWJsZUNvbm5lY3RlZFBvc2l0aW9uU3RyYXRlZ3kgYW5jaG9yZWQgdG8gdGhlIHN0YXJ0ICsgdG9wIG9mIHRoZSBjZWxsLlxuICogTm90ZTogVGhpcyB3aWxsIGNoYW5nZSB0byBDb3ZlclBvc2l0aW9uU3RyYXRlZ3kgb25jZSBpdCBpbXBsZW1lbnRlZC5cbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIERlZmF1bHRQb3BvdmVyRWRpdFBvc2l0aW9uU3RyYXRlZ3lGYWN0b3J5IGV4dGVuZHMgUG9wb3ZlckVkaXRQb3NpdGlvblN0cmF0ZWd5RmFjdG9yeSB7XG4gIGNvbnN0cnVjdG9yKHByb3RlY3RlZCByZWFkb25seSBkaXJlY3Rpb246IERpcmVjdGlvbmFsaXR5LCBwcm90ZWN0ZWQgcmVhZG9ubHkgb3ZlcmxheTogT3ZlcmxheSkge1xuICAgIHN1cGVyKCk7XG4gIH1cblxuICBwb3NpdGlvblN0cmF0ZWd5Rm9yQ2VsbHMoY2VsbHM6IEhUTUxFbGVtZW50W10pOiBQb3NpdGlvblN0cmF0ZWd5IHtcbiAgICByZXR1cm4gdGhpcy5vdmVybGF5LnBvc2l0aW9uKClcbiAgICAgICAgLmZsZXhpYmxlQ29ubmVjdGVkVG8oY2VsbHNbMF0pXG4gICAgICAgIC53aXRoR3Jvd0FmdGVyT3BlbigpXG4gICAgICAgIC53aXRoUHVzaCgpXG4gICAgICAgIC53aXRoVmlld3BvcnRNYXJnaW4oMTYpXG4gICAgICAgIC53aXRoUG9zaXRpb25zKFt7XG4gICAgICAgICAgb3JpZ2luWDogJ3N0YXJ0JyxcbiAgICAgICAgICBvcmlnaW5ZOiAndG9wJyxcbiAgICAgICAgICBvdmVybGF5WDogJ3N0YXJ0JyxcbiAgICAgICAgICBvdmVybGF5WTogJ3RvcCcsXG4gICAgICAgIH1dKTtcbiAgfVxuXG4gIHNpemVDb25maWdGb3JDZWxscyhjZWxsczogSFRNTEVsZW1lbnRbXSk6IE92ZXJsYXlTaXplQ29uZmlnIHtcbiAgICBpZiAoY2VsbHMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4ge307XG4gICAgfVxuXG4gICAgaWYgKGNlbGxzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgcmV0dXJuIHt3aWR0aDogY2VsbHNbMF0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGh9O1xuICAgIH1cblxuICAgIGxldCBmaXJzdENlbGwsIGxhc3RDZWxsO1xuICAgIGlmICh0aGlzLmRpcmVjdGlvbi52YWx1ZSA9PT0gJ2x0cicpIHtcbiAgICAgIGZpcnN0Q2VsbCA9IGNlbGxzWzBdO1xuICAgICAgbGFzdENlbGwgPSBjZWxsc1tjZWxscy5sZW5ndGggLSAxXTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGFzdENlbGwgPSBjZWxsc1swXTtcbiAgICAgIGZpcnN0Q2VsbCA9IGNlbGxzW2NlbGxzLmxlbmd0aCAtIDFdO1xuICAgIH1cblxuICAgIHJldHVybiB7d2lkdGg6IGxhc3RDZWxsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnJpZ2h0IC0gZmlyc3RDZWxsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmxlZnR9O1xuICB9XG59XG4iXX0=