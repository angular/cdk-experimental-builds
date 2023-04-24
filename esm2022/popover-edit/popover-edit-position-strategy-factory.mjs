/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directionality } from '@angular/cdk/bidi';
import { Overlay } from '@angular/cdk/overlay';
import { Injectable } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/bidi";
import * as i2 from "@angular/cdk/overlay";
/**
 * Overridable factory responsible for configuring how cdkPopoverEdit popovers are positioned
 * and sized.
 */
class PopoverEditPositionStrategyFactory {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.0.0-rc.2", ngImport: i0, type: PopoverEditPositionStrategyFactory, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "16.0.0-rc.2", ngImport: i0, type: PopoverEditPositionStrategyFactory }); }
}
export { PopoverEditPositionStrategyFactory };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.0.0-rc.2", ngImport: i0, type: PopoverEditPositionStrategyFactory, decorators: [{
            type: Injectable
        }] });
/**
 * Default implementation of PopoverEditPositionStrategyFactory.
 * Uses a FlexibleConnectedPositionStrategy anchored to the start + top of the cell.
 * Note: This will change to CoverPositionStrategy once it implemented.
 */
class DefaultPopoverEditPositionStrategyFactory extends PopoverEditPositionStrategyFactory {
    constructor(direction, overlay) {
        super();
        this.direction = direction;
        this.overlay = overlay;
    }
    positionStrategyForCells(cells) {
        return this.overlay
            .position()
            .flexibleConnectedTo(cells[0])
            .withGrowAfterOpen()
            .withPush()
            .withViewportMargin(16)
            .withPositions([
            {
                originX: 'start',
                originY: 'top',
                overlayX: 'start',
                overlayY: 'top',
            },
        ]);
    }
    sizeConfigForCells(cells) {
        if (cells.length === 0) {
            return {};
        }
        if (cells.length === 1) {
            return { width: cells[0].getBoundingClientRect().width };
        }
        let firstCell, lastCell;
        if (this.direction.value === 'ltr') {
            firstCell = cells[0];
            lastCell = cells[cells.length - 1];
        }
        else {
            lastCell = cells[0];
            firstCell = cells[cells.length - 1];
        }
        return { width: lastCell.getBoundingClientRect().right - firstCell.getBoundingClientRect().left };
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.0.0-rc.2", ngImport: i0, type: DefaultPopoverEditPositionStrategyFactory, deps: [{ token: i1.Directionality }, { token: i2.Overlay }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "16.0.0-rc.2", ngImport: i0, type: DefaultPopoverEditPositionStrategyFactory }); }
}
export { DefaultPopoverEditPositionStrategyFactory };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.0.0-rc.2", ngImport: i0, type: DefaultPopoverEditPositionStrategyFactory, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: i1.Directionality }, { type: i2.Overlay }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wb3Zlci1lZGl0LXBvc2l0aW9uLXN0cmF0ZWd5LWZhY3RvcnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrLWV4cGVyaW1lbnRhbC9wb3BvdmVyLWVkaXQvcG9wb3Zlci1lZGl0LXBvc2l0aW9uLXN0cmF0ZWd5LWZhY3RvcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQ2pELE9BQU8sRUFBQyxPQUFPLEVBQXNDLE1BQU0sc0JBQXNCLENBQUM7QUFDbEYsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLGVBQWUsQ0FBQzs7OztBQUV6Qzs7O0dBR0c7QUFDSCxNQUNzQixrQ0FBa0M7bUhBQWxDLGtDQUFrQzt1SEFBbEMsa0NBQWtDOztTQUFsQyxrQ0FBa0M7Z0dBQWxDLGtDQUFrQztrQkFEdkQsVUFBVTs7QUFlWDs7OztHQUlHO0FBQ0gsTUFDYSx5Q0FBMEMsU0FBUSxrQ0FBa0M7SUFDL0YsWUFBK0IsU0FBeUIsRUFBcUIsT0FBZ0I7UUFDM0YsS0FBSyxFQUFFLENBQUM7UUFEcUIsY0FBUyxHQUFULFNBQVMsQ0FBZ0I7UUFBcUIsWUFBTyxHQUFQLE9BQU8sQ0FBUztJQUU3RixDQUFDO0lBRUQsd0JBQXdCLENBQUMsS0FBb0I7UUFDM0MsT0FBTyxJQUFJLENBQUMsT0FBTzthQUNoQixRQUFRLEVBQUU7YUFDVixtQkFBbUIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDN0IsaUJBQWlCLEVBQUU7YUFDbkIsUUFBUSxFQUFFO2FBQ1Ysa0JBQWtCLENBQUMsRUFBRSxDQUFDO2FBQ3RCLGFBQWEsQ0FBQztZQUNiO2dCQUNFLE9BQU8sRUFBRSxPQUFPO2dCQUNoQixPQUFPLEVBQUUsS0FBSztnQkFDZCxRQUFRLEVBQUUsT0FBTztnQkFDakIsUUFBUSxFQUFFLEtBQUs7YUFDaEI7U0FDRixDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsa0JBQWtCLENBQUMsS0FBb0I7UUFDckMsSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUN0QixPQUFPLEVBQUUsQ0FBQztTQUNYO1FBRUQsSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUN0QixPQUFPLEVBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLEtBQUssRUFBQyxDQUFDO1NBQ3hEO1FBRUQsSUFBSSxTQUFTLEVBQUUsUUFBUSxDQUFDO1FBQ3hCLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEtBQUssS0FBSyxFQUFFO1lBQ2xDLFNBQVMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDckIsUUFBUSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO1NBQ3BDO2FBQU07WUFDTCxRQUFRLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3BCLFNBQVMsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztTQUNyQztRQUVELE9BQU8sRUFBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLHFCQUFxQixFQUFFLENBQUMsS0FBSyxHQUFHLFNBQVMsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLElBQUksRUFBQyxDQUFDO0lBQ2xHLENBQUM7bUhBekNVLHlDQUF5Qzt1SEFBekMseUNBQXlDOztTQUF6Qyx5Q0FBeUM7Z0dBQXpDLHlDQUF5QztrQkFEckQsVUFBVSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0RpcmVjdGlvbmFsaXR5fSBmcm9tICdAYW5ndWxhci9jZGsvYmlkaSc7XG5pbXBvcnQge092ZXJsYXksIE92ZXJsYXlTaXplQ29uZmlnLCBQb3NpdGlvblN0cmF0ZWd5fSBmcm9tICdAYW5ndWxhci9jZGsvb3ZlcmxheSc7XG5pbXBvcnQge0luamVjdGFibGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG4vKipcbiAqIE92ZXJyaWRhYmxlIGZhY3RvcnkgcmVzcG9uc2libGUgZm9yIGNvbmZpZ3VyaW5nIGhvdyBjZGtQb3BvdmVyRWRpdCBwb3BvdmVycyBhcmUgcG9zaXRpb25lZFxuICogYW5kIHNpemVkLlxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgUG9wb3ZlckVkaXRQb3NpdGlvblN0cmF0ZWd5RmFjdG9yeSB7XG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgUG9zaXRpb25TdHJhdGVneSBiYXNlZCBvbiB0aGUgc3BlY2lmaWVkIHRhYmxlIGNlbGxzLlxuICAgKiBUaGUgY2VsbHMgd2lsbCBiZSBwcm92aWRlZCBpbiBET00gb3JkZXIuXG4gICAqL1xuICBhYnN0cmFjdCBwb3NpdGlvblN0cmF0ZWd5Rm9yQ2VsbHMoY2VsbHM6IEhUTUxFbGVtZW50W10pOiBQb3NpdGlvblN0cmF0ZWd5O1xuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGFuIE92ZXJsYXlTaXplQ29uZmlnIGJhc2VkIG9uIHRoZSBzcGVjaWZpZWQgdGFibGUgY2VsbHMuXG4gICAqIFRoZSBjZWxscyB3aWxsIGJlIHByb3ZpZGVkIGluIERPTSBvcmRlci5cbiAgICovXG4gIGFic3RyYWN0IHNpemVDb25maWdGb3JDZWxscyhjZWxsczogSFRNTEVsZW1lbnRbXSk6IE92ZXJsYXlTaXplQ29uZmlnO1xufVxuXG4vKipcbiAqIERlZmF1bHQgaW1wbGVtZW50YXRpb24gb2YgUG9wb3ZlckVkaXRQb3NpdGlvblN0cmF0ZWd5RmFjdG9yeS5cbiAqIFVzZXMgYSBGbGV4aWJsZUNvbm5lY3RlZFBvc2l0aW9uU3RyYXRlZ3kgYW5jaG9yZWQgdG8gdGhlIHN0YXJ0ICsgdG9wIG9mIHRoZSBjZWxsLlxuICogTm90ZTogVGhpcyB3aWxsIGNoYW5nZSB0byBDb3ZlclBvc2l0aW9uU3RyYXRlZ3kgb25jZSBpdCBpbXBsZW1lbnRlZC5cbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIERlZmF1bHRQb3BvdmVyRWRpdFBvc2l0aW9uU3RyYXRlZ3lGYWN0b3J5IGV4dGVuZHMgUG9wb3ZlckVkaXRQb3NpdGlvblN0cmF0ZWd5RmFjdG9yeSB7XG4gIGNvbnN0cnVjdG9yKHByb3RlY3RlZCByZWFkb25seSBkaXJlY3Rpb246IERpcmVjdGlvbmFsaXR5LCBwcm90ZWN0ZWQgcmVhZG9ubHkgb3ZlcmxheTogT3ZlcmxheSkge1xuICAgIHN1cGVyKCk7XG4gIH1cblxuICBwb3NpdGlvblN0cmF0ZWd5Rm9yQ2VsbHMoY2VsbHM6IEhUTUxFbGVtZW50W10pOiBQb3NpdGlvblN0cmF0ZWd5IHtcbiAgICByZXR1cm4gdGhpcy5vdmVybGF5XG4gICAgICAucG9zaXRpb24oKVxuICAgICAgLmZsZXhpYmxlQ29ubmVjdGVkVG8oY2VsbHNbMF0pXG4gICAgICAud2l0aEdyb3dBZnRlck9wZW4oKVxuICAgICAgLndpdGhQdXNoKClcbiAgICAgIC53aXRoVmlld3BvcnRNYXJnaW4oMTYpXG4gICAgICAud2l0aFBvc2l0aW9ucyhbXG4gICAgICAgIHtcbiAgICAgICAgICBvcmlnaW5YOiAnc3RhcnQnLFxuICAgICAgICAgIG9yaWdpblk6ICd0b3AnLFxuICAgICAgICAgIG92ZXJsYXlYOiAnc3RhcnQnLFxuICAgICAgICAgIG92ZXJsYXlZOiAndG9wJyxcbiAgICAgICAgfSxcbiAgICAgIF0pO1xuICB9XG5cbiAgc2l6ZUNvbmZpZ0ZvckNlbGxzKGNlbGxzOiBIVE1MRWxlbWVudFtdKTogT3ZlcmxheVNpemVDb25maWcge1xuICAgIGlmIChjZWxscy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiB7fTtcbiAgICB9XG5cbiAgICBpZiAoY2VsbHMubGVuZ3RoID09PSAxKSB7XG4gICAgICByZXR1cm4ge3dpZHRoOiBjZWxsc1swXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aH07XG4gICAgfVxuXG4gICAgbGV0IGZpcnN0Q2VsbCwgbGFzdENlbGw7XG4gICAgaWYgKHRoaXMuZGlyZWN0aW9uLnZhbHVlID09PSAnbHRyJykge1xuICAgICAgZmlyc3RDZWxsID0gY2VsbHNbMF07XG4gICAgICBsYXN0Q2VsbCA9IGNlbGxzW2NlbGxzLmxlbmd0aCAtIDFdO1xuICAgIH0gZWxzZSB7XG4gICAgICBsYXN0Q2VsbCA9IGNlbGxzWzBdO1xuICAgICAgZmlyc3RDZWxsID0gY2VsbHNbY2VsbHMubGVuZ3RoIC0gMV07XG4gICAgfVxuXG4gICAgcmV0dXJuIHt3aWR0aDogbGFzdENlbGwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkucmlnaHQgLSBmaXJzdENlbGwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkubGVmdH07XG4gIH1cbn1cbiJdfQ==