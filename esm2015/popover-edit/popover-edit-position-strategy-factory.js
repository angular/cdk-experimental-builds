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
 */
let PopoverEditPositionStrategyFactory = /** @class */ (() => {
    class PopoverEditPositionStrategyFactory {
    }
    PopoverEditPositionStrategyFactory.decorators = [
        { type: Injectable }
    ];
    return PopoverEditPositionStrategyFactory;
})();
export { PopoverEditPositionStrategyFactory };
/**
 * Default implementation of PopoverEditPositionStrategyFactory.
 * Uses a FlexibleConnectedPositionStrategy anchored to the start + top of the cell.
 * Note: This will change to CoverPositionStrategy once it implemented.
 */
let DefaultPopoverEditPositionStrategyFactory = /** @class */ (() => {
    class DefaultPopoverEditPositionStrategyFactory extends PopoverEditPositionStrategyFactory {
        constructor(direction, overlay) {
            super();
            this.direction = direction;
            this.overlay = overlay;
        }
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
    }
    DefaultPopoverEditPositionStrategyFactory.decorators = [
        { type: Injectable }
    ];
    /** @nocollapse */
    DefaultPopoverEditPositionStrategyFactory.ctorParameters = () => [
        { type: Directionality },
        { type: Overlay }
    ];
    return DefaultPopoverEditPositionStrategyFactory;
})();
export { DefaultPopoverEditPositionStrategyFactory };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wb3Zlci1lZGl0LXBvc2l0aW9uLXN0cmF0ZWd5LWZhY3RvcnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrLWV4cGVyaW1lbnRhbC9wb3BvdmVyLWVkaXQvcG9wb3Zlci1lZGl0LXBvc2l0aW9uLXN0cmF0ZWd5LWZhY3RvcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQ2pELE9BQU8sRUFBQyxPQUFPLEVBQXNDLE1BQU0sc0JBQXNCLENBQUM7QUFDbEYsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUV6Qzs7O0dBR0c7QUFDSDtJQUFBLE1BQ3NCLGtDQUFrQzs7O2dCQUR2RCxVQUFVOztJQWFYLHlDQUFDO0tBQUE7U0FacUIsa0NBQWtDO0FBY3hEOzs7O0dBSUc7QUFDSDtJQUFBLE1BQ2EseUNBQTBDLFNBQVEsa0NBQWtDO1FBQy9GLFlBQStCLFNBQXlCLEVBQXFCLE9BQWdCO1lBQzNGLEtBQUssRUFBRSxDQUFDO1lBRHFCLGNBQVMsR0FBVCxTQUFTLENBQWdCO1lBQXFCLFlBQU8sR0FBUCxPQUFPLENBQVM7UUFFN0YsQ0FBQztRQUVELHdCQUF3QixDQUFDLEtBQW9CO1lBQzNDLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUU7aUJBQ3pCLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDN0IsaUJBQWlCLEVBQUU7aUJBQ25CLFFBQVEsRUFBRTtpQkFDVixrQkFBa0IsQ0FBQyxFQUFFLENBQUM7aUJBQ3RCLGFBQWEsQ0FBQyxDQUFDO29CQUNkLE9BQU8sRUFBRSxPQUFPO29CQUNoQixPQUFPLEVBQUUsS0FBSztvQkFDZCxRQUFRLEVBQUUsT0FBTztvQkFDakIsUUFBUSxFQUFFLEtBQUs7aUJBQ2hCLENBQUMsQ0FBQyxDQUFDO1FBQ1YsQ0FBQztRQUVELGtCQUFrQixDQUFDLEtBQW9CO1lBQ3JDLElBQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0JBQ3RCLE9BQU8sRUFBRSxDQUFDO2FBQ1g7WUFFRCxJQUFJLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUN0QixPQUFPLEVBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLEtBQUssRUFBQyxDQUFDO2FBQ3hEO1lBRUQsSUFBSSxTQUFTLEVBQUUsUUFBUSxDQUFDO1lBQ3hCLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEtBQUssS0FBSyxFQUFFO2dCQUNsQyxTQUFTLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNyQixRQUFRLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7YUFDcEM7aUJBQU07Z0JBQ0wsUUFBUSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDcEIsU0FBUyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO2FBQ3JDO1lBRUQsT0FBTyxFQUFDLEtBQUssRUFBRSxRQUFRLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxLQUFLLEdBQUcsU0FBUyxDQUFDLHFCQUFxQixFQUFFLENBQUMsSUFBSSxFQUFDLENBQUM7UUFDbEcsQ0FBQzs7O2dCQXZDRixVQUFVOzs7O2dCQTVCSCxjQUFjO2dCQUNkLE9BQU87O0lBbUVmLGdEQUFDO0tBQUE7U0F2Q1kseUNBQXlDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RGlyZWN0aW9uYWxpdHl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9iaWRpJztcbmltcG9ydCB7T3ZlcmxheSwgT3ZlcmxheVNpemVDb25maWcsIFBvc2l0aW9uU3RyYXRlZ3l9IGZyb20gJ0Bhbmd1bGFyL2Nkay9vdmVybGF5JztcbmltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbi8qKlxuICogT3ZlcnJpZGFibGUgZmFjdG9yeSByZXNwb25zaWJsZSBmb3IgY29uZmlndXJpbmcgaG93IGNka1BvcG92ZXJFZGl0IHBvcG92ZXJzIGFyZSBwb3NpdGlvbmVkXG4gKiBhbmQgc2l6ZWQuXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBQb3BvdmVyRWRpdFBvc2l0aW9uU3RyYXRlZ3lGYWN0b3J5IHtcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBQb3NpdGlvblN0cmF0ZWd5IGJhc2VkIG9uIHRoZSBzcGVjaWZpZWQgdGFibGUgY2VsbHMuXG4gICAqIFRoZSBjZWxscyB3aWxsIGJlIHByb3ZpZGVkIGluIERPTSBvcmRlci5cbiAgICovXG4gIGFic3RyYWN0IHBvc2l0aW9uU3RyYXRlZ3lGb3JDZWxscyhjZWxsczogSFRNTEVsZW1lbnRbXSk6IFBvc2l0aW9uU3RyYXRlZ3k7XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYW4gT3ZlcmxheVNpemVDb25maWcgYmFzZWQgb24gdGhlIHNwZWNpZmllZCB0YWJsZSBjZWxscy5cbiAgICogVGhlIGNlbGxzIHdpbGwgYmUgcHJvdmlkZWQgaW4gRE9NIG9yZGVyLlxuICAgKi9cbiAgYWJzdHJhY3Qgc2l6ZUNvbmZpZ0ZvckNlbGxzKGNlbGxzOiBIVE1MRWxlbWVudFtdKTogT3ZlcmxheVNpemVDb25maWc7XG59XG5cbi8qKlxuICogRGVmYXVsdCBpbXBsZW1lbnRhdGlvbiBvZiBQb3BvdmVyRWRpdFBvc2l0aW9uU3RyYXRlZ3lGYWN0b3J5LlxuICogVXNlcyBhIEZsZXhpYmxlQ29ubmVjdGVkUG9zaXRpb25TdHJhdGVneSBhbmNob3JlZCB0byB0aGUgc3RhcnQgKyB0b3Agb2YgdGhlIGNlbGwuXG4gKiBOb3RlOiBUaGlzIHdpbGwgY2hhbmdlIHRvIENvdmVyUG9zaXRpb25TdHJhdGVneSBvbmNlIGl0IGltcGxlbWVudGVkLlxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgRGVmYXVsdFBvcG92ZXJFZGl0UG9zaXRpb25TdHJhdGVneUZhY3RvcnkgZXh0ZW5kcyBQb3BvdmVyRWRpdFBvc2l0aW9uU3RyYXRlZ3lGYWN0b3J5IHtcbiAgY29uc3RydWN0b3IocHJvdGVjdGVkIHJlYWRvbmx5IGRpcmVjdGlvbjogRGlyZWN0aW9uYWxpdHksIHByb3RlY3RlZCByZWFkb25seSBvdmVybGF5OiBPdmVybGF5KSB7XG4gICAgc3VwZXIoKTtcbiAgfVxuXG4gIHBvc2l0aW9uU3RyYXRlZ3lGb3JDZWxscyhjZWxsczogSFRNTEVsZW1lbnRbXSk6IFBvc2l0aW9uU3RyYXRlZ3kge1xuICAgIHJldHVybiB0aGlzLm92ZXJsYXkucG9zaXRpb24oKVxuICAgICAgICAuZmxleGlibGVDb25uZWN0ZWRUbyhjZWxsc1swXSlcbiAgICAgICAgLndpdGhHcm93QWZ0ZXJPcGVuKClcbiAgICAgICAgLndpdGhQdXNoKClcbiAgICAgICAgLndpdGhWaWV3cG9ydE1hcmdpbigxNilcbiAgICAgICAgLndpdGhQb3NpdGlvbnMoW3tcbiAgICAgICAgICBvcmlnaW5YOiAnc3RhcnQnLFxuICAgICAgICAgIG9yaWdpblk6ICd0b3AnLFxuICAgICAgICAgIG92ZXJsYXlYOiAnc3RhcnQnLFxuICAgICAgICAgIG92ZXJsYXlZOiAndG9wJyxcbiAgICAgICAgfV0pO1xuICB9XG5cbiAgc2l6ZUNvbmZpZ0ZvckNlbGxzKGNlbGxzOiBIVE1MRWxlbWVudFtdKTogT3ZlcmxheVNpemVDb25maWcge1xuICAgIGlmIChjZWxscy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiB7fTtcbiAgICB9XG5cbiAgICBpZiAoY2VsbHMubGVuZ3RoID09PSAxKSB7XG4gICAgICByZXR1cm4ge3dpZHRoOiBjZWxsc1swXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aH07XG4gICAgfVxuXG4gICAgbGV0IGZpcnN0Q2VsbCwgbGFzdENlbGw7XG4gICAgaWYgKHRoaXMuZGlyZWN0aW9uLnZhbHVlID09PSAnbHRyJykge1xuICAgICAgZmlyc3RDZWxsID0gY2VsbHNbMF07XG4gICAgICBsYXN0Q2VsbCA9IGNlbGxzW2NlbGxzLmxlbmd0aCAtIDFdO1xuICAgIH0gZWxzZSB7XG4gICAgICBsYXN0Q2VsbCA9IGNlbGxzWzBdO1xuICAgICAgZmlyc3RDZWxsID0gY2VsbHNbY2VsbHMubGVuZ3RoIC0gMV07XG4gICAgfVxuXG4gICAgcmV0dXJuIHt3aWR0aDogbGFzdENlbGwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkucmlnaHQgLSBmaXJzdENlbGwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkubGVmdH07XG4gIH1cbn1cbiJdfQ==