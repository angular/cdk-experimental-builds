/**
 * @fileoverview added by tsickle
 * Generated from: src/cdk-experimental/popover-edit/popover-edit-position-strategy-factory.ts
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
import { Overlay } from '@angular/cdk/overlay';
import { Injectable } from '@angular/core';
/**
 * Overridable factory responsible for configuring how cdkPopoverEdit popovers are positioned
 * and sized.
 * @abstract
 */
export class PopoverEditPositionStrategyFactory {
}
PopoverEditPositionStrategyFactory.decorators = [
    { type: Injectable }
];
if (false) {
    /**
     * Creates a PositionStrategy based on the specified table cells.
     * The cells will be provided in DOM order.
     * @abstract
     * @param {?} cells
     * @return {?}
     */
    PopoverEditPositionStrategyFactory.prototype.positionStrategyForCells = function (cells) { };
    /**
     * Creates an OverlaySizeConfig based on the specified table cells.
     * The cells will be provided in DOM order.
     * @abstract
     * @param {?} cells
     * @return {?}
     */
    PopoverEditPositionStrategyFactory.prototype.sizeConfigForCells = function (cells) { };
}
/**
 * Default implementation of PopoverEditPositionStrategyFactory.
 * Uses a FlexibleConnectedPositionStrategy anchored to the start + top of the cell.
 * Note: This will change to CoverPositionStrategy once it implemented.
 */
export class DefaultPopoverEditPositionStrategyFactory extends PopoverEditPositionStrategyFactory {
    /**
     * @param {?} direction
     * @param {?} overlay
     */
    constructor(direction, overlay) {
        super();
        this.direction = direction;
        this.overlay = overlay;
    }
    /**
     * @param {?} cells
     * @return {?}
     */
    positionStrategyForCells(cells) {
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
    }
    /**
     * @param {?} cells
     * @return {?}
     */
    sizeConfigForCells(cells) {
        if (cells.length === 0) {
            return {};
        }
        if (cells.length === 1) {
            return { width: cells[0].getBoundingClientRect().width };
        }
        /** @type {?} */
        let firstCell;
        /** @type {?} */
        let lastCell;
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
}
DefaultPopoverEditPositionStrategyFactory.decorators = [
    { type: Injectable }
];
/** @nocollapse */
DefaultPopoverEditPositionStrategyFactory.ctorParameters = () => [
    { type: Directionality },
    { type: Overlay }
];
if (false) {
    /**
     * @type {?}
     * @protected
     */
    DefaultPopoverEditPositionStrategyFactory.prototype.direction;
    /**
     * @type {?}
     * @protected
     */
    DefaultPopoverEditPositionStrategyFactory.prototype.overlay;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wb3Zlci1lZGl0LXBvc2l0aW9uLXN0cmF0ZWd5LWZhY3RvcnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrLWV4cGVyaW1lbnRhbC9wb3BvdmVyLWVkaXQvcG9wb3Zlci1lZGl0LXBvc2l0aW9uLXN0cmF0ZWd5LWZhY3RvcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBUUEsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQ2pELE9BQU8sRUFBQyxPQUFPLEVBQXNDLE1BQU0sc0JBQXNCLENBQUM7QUFDbEYsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLGVBQWUsQ0FBQzs7Ozs7O0FBT3pDLE1BQU0sT0FBZ0Isa0NBQWtDOzs7WUFEdkQsVUFBVTs7Ozs7Ozs7OztJQU1ULDZGQUEwRTs7Ozs7Ozs7SUFNMUUsdUZBQXFFOzs7Ozs7O0FBU3ZFLE1BQU0sT0FBTyx5Q0FBMEMsU0FBUSxrQ0FBa0M7Ozs7O0lBQy9GLFlBQStCLFNBQXlCLEVBQXFCLE9BQWdCO1FBQzNGLEtBQUssRUFBRSxDQUFDO1FBRHFCLGNBQVMsR0FBVCxTQUFTLENBQWdCO1FBQXFCLFlBQU8sR0FBUCxPQUFPLENBQVM7SUFFN0YsQ0FBQzs7Ozs7SUFFRCx3QkFBd0IsQ0FBQyxLQUFvQjtRQUMzQyxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFO2FBQ3pCLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUM3QixpQkFBaUIsRUFBRTthQUNuQixRQUFRLEVBQUU7YUFDVixrQkFBa0IsQ0FBQyxFQUFFLENBQUM7YUFDdEIsYUFBYSxDQUFDLENBQUM7Z0JBQ2QsT0FBTyxFQUFFLE9BQU87Z0JBQ2hCLE9BQU8sRUFBRSxLQUFLO2dCQUNkLFFBQVEsRUFBRSxPQUFPO2dCQUNqQixRQUFRLEVBQUUsS0FBSzthQUNoQixDQUFDLENBQUMsQ0FBQztJQUNWLENBQUM7Ozs7O0lBRUQsa0JBQWtCLENBQUMsS0FBb0I7UUFDckMsSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUN0QixPQUFPLEVBQUUsQ0FBQztTQUNYO1FBRUQsSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUN0QixPQUFPLEVBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLEtBQUssRUFBQyxDQUFDO1NBQ3hEOztZQUVHLFNBQVM7O1lBQUUsUUFBUTtRQUN2QixJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxLQUFLLEtBQUssRUFBRTtZQUNsQyxTQUFTLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3JCLFFBQVEsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztTQUNwQzthQUFNO1lBQ0wsUUFBUSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNwQixTQUFTLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7U0FDckM7UUFFRCxPQUFPLEVBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLEtBQUssR0FBRyxTQUFTLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxJQUFJLEVBQUMsQ0FBQztJQUNsRyxDQUFDOzs7WUF2Q0YsVUFBVTs7OztZQTVCSCxjQUFjO1lBQ2QsT0FBTzs7Ozs7OztJQTZCRCw4REFBNEM7Ozs7O0lBQUUsNERBQW1DIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RGlyZWN0aW9uYWxpdHl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9iaWRpJztcbmltcG9ydCB7T3ZlcmxheSwgT3ZlcmxheVNpemVDb25maWcsIFBvc2l0aW9uU3RyYXRlZ3l9IGZyb20gJ0Bhbmd1bGFyL2Nkay9vdmVybGF5JztcbmltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbi8qKlxuICogT3ZlcnJpZGFibGUgZmFjdG9yeSByZXNwb25zaWJsZSBmb3IgY29uZmlndXJpbmcgaG93IGNka1BvcG92ZXJFZGl0IHBvcG92ZXJzIGFyZSBwb3NpdGlvbmVkXG4gKiBhbmQgc2l6ZWQuXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBQb3BvdmVyRWRpdFBvc2l0aW9uU3RyYXRlZ3lGYWN0b3J5IHtcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBQb3NpdGlvblN0cmF0ZWd5IGJhc2VkIG9uIHRoZSBzcGVjaWZpZWQgdGFibGUgY2VsbHMuXG4gICAqIFRoZSBjZWxscyB3aWxsIGJlIHByb3ZpZGVkIGluIERPTSBvcmRlci5cbiAgICovXG4gIGFic3RyYWN0IHBvc2l0aW9uU3RyYXRlZ3lGb3JDZWxscyhjZWxsczogSFRNTEVsZW1lbnRbXSk6IFBvc2l0aW9uU3RyYXRlZ3k7XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYW4gT3ZlcmxheVNpemVDb25maWcgYmFzZWQgb24gdGhlIHNwZWNpZmllZCB0YWJsZSBjZWxscy5cbiAgICogVGhlIGNlbGxzIHdpbGwgYmUgcHJvdmlkZWQgaW4gRE9NIG9yZGVyLlxuICAgKi9cbiAgYWJzdHJhY3Qgc2l6ZUNvbmZpZ0ZvckNlbGxzKGNlbGxzOiBIVE1MRWxlbWVudFtdKTogT3ZlcmxheVNpemVDb25maWc7XG59XG5cbi8qKlxuICogRGVmYXVsdCBpbXBsZW1lbnRhdGlvbiBvZiBQb3BvdmVyRWRpdFBvc2l0aW9uU3RyYXRlZ3lGYWN0b3J5LlxuICogVXNlcyBhIEZsZXhpYmxlQ29ubmVjdGVkUG9zaXRpb25TdHJhdGVneSBhbmNob3JlZCB0byB0aGUgc3RhcnQgKyB0b3Agb2YgdGhlIGNlbGwuXG4gKiBOb3RlOiBUaGlzIHdpbGwgY2hhbmdlIHRvIENvdmVyUG9zaXRpb25TdHJhdGVneSBvbmNlIGl0IGltcGxlbWVudGVkLlxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgRGVmYXVsdFBvcG92ZXJFZGl0UG9zaXRpb25TdHJhdGVneUZhY3RvcnkgZXh0ZW5kcyBQb3BvdmVyRWRpdFBvc2l0aW9uU3RyYXRlZ3lGYWN0b3J5IHtcbiAgY29uc3RydWN0b3IocHJvdGVjdGVkIHJlYWRvbmx5IGRpcmVjdGlvbjogRGlyZWN0aW9uYWxpdHksIHByb3RlY3RlZCByZWFkb25seSBvdmVybGF5OiBPdmVybGF5KSB7XG4gICAgc3VwZXIoKTtcbiAgfVxuXG4gIHBvc2l0aW9uU3RyYXRlZ3lGb3JDZWxscyhjZWxsczogSFRNTEVsZW1lbnRbXSk6IFBvc2l0aW9uU3RyYXRlZ3kge1xuICAgIHJldHVybiB0aGlzLm92ZXJsYXkucG9zaXRpb24oKVxuICAgICAgICAuZmxleGlibGVDb25uZWN0ZWRUbyhjZWxsc1swXSlcbiAgICAgICAgLndpdGhHcm93QWZ0ZXJPcGVuKClcbiAgICAgICAgLndpdGhQdXNoKClcbiAgICAgICAgLndpdGhWaWV3cG9ydE1hcmdpbigxNilcbiAgICAgICAgLndpdGhQb3NpdGlvbnMoW3tcbiAgICAgICAgICBvcmlnaW5YOiAnc3RhcnQnLFxuICAgICAgICAgIG9yaWdpblk6ICd0b3AnLFxuICAgICAgICAgIG92ZXJsYXlYOiAnc3RhcnQnLFxuICAgICAgICAgIG92ZXJsYXlZOiAndG9wJyxcbiAgICAgICAgfV0pO1xuICB9XG5cbiAgc2l6ZUNvbmZpZ0ZvckNlbGxzKGNlbGxzOiBIVE1MRWxlbWVudFtdKTogT3ZlcmxheVNpemVDb25maWcge1xuICAgIGlmIChjZWxscy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiB7fTtcbiAgICB9XG5cbiAgICBpZiAoY2VsbHMubGVuZ3RoID09PSAxKSB7XG4gICAgICByZXR1cm4ge3dpZHRoOiBjZWxsc1swXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aH07XG4gICAgfVxuXG4gICAgbGV0IGZpcnN0Q2VsbCwgbGFzdENlbGw7XG4gICAgaWYgKHRoaXMuZGlyZWN0aW9uLnZhbHVlID09PSAnbHRyJykge1xuICAgICAgZmlyc3RDZWxsID0gY2VsbHNbMF07XG4gICAgICBsYXN0Q2VsbCA9IGNlbGxzW2NlbGxzLmxlbmd0aCAtIDFdO1xuICAgIH0gZWxzZSB7XG4gICAgICBsYXN0Q2VsbCA9IGNlbGxzWzBdO1xuICAgICAgZmlyc3RDZWxsID0gY2VsbHNbY2VsbHMubGVuZ3RoIC0gMV07XG4gICAgfVxuXG4gICAgcmV0dXJuIHt3aWR0aDogbGFzdENlbGwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkucmlnaHQgLSBmaXJzdENlbGwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkubGVmdH07XG4gIH1cbn1cbiJdfQ==