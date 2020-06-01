/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { coerceCssPixelValue } from '@angular/cdk/coercion';
import { ColumnResize } from './column-resize';
/**
 * Provides an implementation for resizing a column.
 * The details of how resizing works for tables for flex mat-tables are quite different.
 */
let ResizeStrategy = /** @class */ (() => {
    class ResizeStrategy {
        /** Adjusts the width of the table element by the specified delta. */
        updateTableWidth(delta) {
            const table = this.columnResize.elementRef.nativeElement;
            const tableWidth = getElementWidth(table);
            table.style.width = coerceCssPixelValue(tableWidth + delta);
        }
    }
    ResizeStrategy.decorators = [
        { type: Injectable }
    ];
    return ResizeStrategy;
})();
export { ResizeStrategy };
/**
 * The optimially performing resize strategy for &lt;table&gt; elements with table-layout: fixed.
 * Tested against and outperformed:
 *   CSS selector
 *   CSS selector w/ CSS variable
 *   Updating all cell nodes
 */
let TableLayoutFixedResizeStrategy = /** @class */ (() => {
    class TableLayoutFixedResizeStrategy extends ResizeStrategy {
        constructor(columnResize) {
            super();
            this.columnResize = columnResize;
        }
        applyColumnSize(_, columnHeader, sizeInPx, previousSizeInPx) {
            const delta = sizeInPx - (previousSizeInPx !== null && previousSizeInPx !== void 0 ? previousSizeInPx : getElementWidth(columnHeader));
            columnHeader.style.width = coerceCssPixelValue(sizeInPx);
            this.updateTableWidth(delta);
        }
        applyMinColumnSize(_, columnHeader, sizeInPx) {
            const currentWidth = getElementWidth(columnHeader);
            const newWidth = Math.max(currentWidth, sizeInPx);
            this.applyColumnSize(_, columnHeader, newWidth, currentWidth);
        }
        applyMaxColumnSize(_, columnHeader, sizeInPx) {
            const currentWidth = getElementWidth(columnHeader);
            const newWidth = Math.min(currentWidth, sizeInPx);
            this.applyColumnSize(_, columnHeader, newWidth, currentWidth);
        }
    }
    TableLayoutFixedResizeStrategy.decorators = [
        { type: Injectable }
    ];
    /** @nocollapse */
    TableLayoutFixedResizeStrategy.ctorParameters = () => [
        { type: ColumnResize }
    ];
    return TableLayoutFixedResizeStrategy;
})();
export { TableLayoutFixedResizeStrategy };
/**
 * The optimally performing resize strategy for flex mat-tables.
 * Tested against and outperformed:
 *   CSS selector w/ CSS variable
 *   Updating all mat-cell nodes
 */
let CdkFlexTableResizeStrategy = /** @class */ (() => {
    class CdkFlexTableResizeStrategy extends ResizeStrategy {
        constructor(columnResize, document) {
            super();
            this.columnResize = columnResize;
            this._columnIndexes = new Map();
            this._columnProperties = new Map();
            this._indexSequence = 0;
            this.defaultMinSize = 0;
            this.defaultMaxSize = Number.MAX_SAFE_INTEGER;
            this._document = document;
        }
        applyColumnSize(cssFriendlyColumnName, columnHeader, sizeInPx, previousSizeInPx) {
            // Optimization: Check applied width first as we probably set it already before reading
            // offsetWidth which triggers layout.
            const delta = sizeInPx - (previousSizeInPx !== null && previousSizeInPx !== void 0 ? previousSizeInPx : (this._getAppliedWidth(cssFriendlyColumnName) || columnHeader.offsetWidth));
            const cssSize = coerceCssPixelValue(sizeInPx);
            this._applyProperty(cssFriendlyColumnName, 'flex', `0 0.01 ${cssSize}`);
            this.updateTableWidth(delta);
        }
        applyMinColumnSize(cssFriendlyColumnName, _, sizeInPx) {
            const cssSize = coerceCssPixelValue(sizeInPx);
            this._applyProperty(cssFriendlyColumnName, 'min-width', cssSize, sizeInPx !== this.defaultMinSize);
        }
        applyMaxColumnSize(cssFriendlyColumnName, _, sizeInPx) {
            const cssSize = coerceCssPixelValue(sizeInPx);
            this._applyProperty(cssFriendlyColumnName, 'max-width', cssSize, sizeInPx !== this.defaultMaxSize);
        }
        getColumnCssClass(cssFriendlyColumnName) {
            return `cdk-column-${cssFriendlyColumnName}`;
        }
        ngOnDestroy() {
            // TODO: Use remove() once we're off IE11.
            if (this._styleElement && this._styleElement.parentNode) {
                this._styleElement.parentNode.removeChild(this._styleElement);
                this._styleElement = undefined;
            }
        }
        _getPropertyValue(cssFriendlyColumnName, key) {
            const properties = this._getColumnPropertiesMap(cssFriendlyColumnName);
            return properties.get(key);
        }
        _getAppliedWidth(cssFriendslyColumnName) {
            return coercePixelsFromFlexValue(this._getPropertyValue(cssFriendslyColumnName, 'flex'));
        }
        _applyProperty(cssFriendlyColumnName, key, value, enable = true) {
            const properties = this._getColumnPropertiesMap(cssFriendlyColumnName);
            if (enable) {
                properties.set(key, value);
            }
            else {
                properties.delete(key);
            }
            this._applySizeCss(cssFriendlyColumnName);
        }
        _getStyleSheet() {
            if (!this._styleElement) {
                this._styleElement = this._document.createElement('style');
                this._styleElement.appendChild(this._document.createTextNode(''));
                this._document.head.appendChild(this._styleElement);
            }
            return this._styleElement.sheet;
        }
        _getColumnPropertiesMap(cssFriendlyColumnName) {
            let properties = this._columnProperties.get(cssFriendlyColumnName);
            if (properties === undefined) {
                properties = new Map();
                this._columnProperties.set(cssFriendlyColumnName, properties);
            }
            return properties;
        }
        _applySizeCss(cssFriendlyColumnName) {
            const properties = this._getColumnPropertiesMap(cssFriendlyColumnName);
            const propertyKeys = Array.from(properties.keys());
            let index = this._columnIndexes.get(cssFriendlyColumnName);
            if (index === undefined) {
                if (!propertyKeys.length) {
                    // Nothing to set or unset.
                    return;
                }
                index = this._indexSequence++;
                this._columnIndexes.set(cssFriendlyColumnName, index);
            }
            else {
                this._getStyleSheet().deleteRule(index);
            }
            const columnClassName = this.getColumnCssClass(cssFriendlyColumnName);
            const tableClassName = this.columnResize.getUniqueCssClass();
            const selector = `.${tableClassName} .${columnClassName}`;
            const body = propertyKeys.map(key => `${key}:${properties.get(key)}`).join(';');
            this._getStyleSheet().insertRule(`${selector} {${body}}`, index);
        }
    }
    CdkFlexTableResizeStrategy.decorators = [
        { type: Injectable }
    ];
    /** @nocollapse */
    CdkFlexTableResizeStrategy.ctorParameters = () => [
        { type: ColumnResize },
        { type: undefined, decorators: [{ type: Inject, args: [DOCUMENT,] }] }
    ];
    return CdkFlexTableResizeStrategy;
})();
export { CdkFlexTableResizeStrategy };
/** Converts CSS pixel values to numbers, eg "123px" to 123. Returns NaN for non pixel values. */
function coercePixelsFromCssValue(cssValue) {
    var _a;
    return Number((_a = cssValue.match(/(\d+)px/)) === null || _a === void 0 ? void 0 : _a[1]);
}
/** Gets the style.width pixels on the specified element if present, otherwise its offsetWidth. */
function getElementWidth(element) {
    // Optimization: Check style.width first as we probably set it already before reading
    // offsetWidth which triggers layout.
    return coercePixelsFromCssValue(element.style.width) || element.offsetWidth;
}
/**
 * Converts CSS flex values as set in CdkFlexTableResizeStrategy to numbers,
 * eg "0 0.01 123px" to 123.
 */
function coercePixelsFromFlexValue(flexValue) {
    var _a;
    return Number((_a = flexValue === null || flexValue === void 0 ? void 0 : flexValue.match(/0 0\.01 (\d+)px/)) === null || _a === void 0 ? void 0 : _a[1]);
}
export const TABLE_LAYOUT_FIXED_RESIZE_STRATEGY_PROVIDER = {
    provide: ResizeStrategy,
    useClass: TableLayoutFixedResizeStrategy,
};
export const FLEX_RESIZE_STRATEGY_PROVIDER = {
    provide: ResizeStrategy,
    useClass: CdkFlexTableResizeStrategy,
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzaXplLXN0cmF0ZWd5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvY29sdW1uLXJlc2l6ZS9yZXNpemUtc3RyYXRlZ3kudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLE1BQU0sRUFBRSxVQUFVLEVBQXNCLE1BQU0sZUFBZSxDQUFDO0FBQ3RFLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUN6QyxPQUFPLEVBQUMsbUJBQW1CLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUUxRCxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFFN0M7OztHQUdHO0FBQ0g7SUFBQSxNQUNzQixjQUFjO1FBc0JsQyxxRUFBcUU7UUFDM0QsZ0JBQWdCLENBQUMsS0FBYTtZQUN0QyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUM7WUFDekQsTUFBTSxVQUFVLEdBQUcsZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBRTFDLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLG1CQUFtQixDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUMsQ0FBQztRQUM5RCxDQUFDOzs7Z0JBN0JGLFVBQVU7O0lBOEJYLHFCQUFDO0tBQUE7U0E3QnFCLGNBQWM7QUErQnBDOzs7Ozs7R0FNRztBQUNIO0lBQUEsTUFDYSw4QkFBK0IsU0FBUSxjQUFjO1FBQ2hFLFlBQStCLFlBQTBCO1lBQ3ZELEtBQUssRUFBRSxDQUFDO1lBRHFCLGlCQUFZLEdBQVosWUFBWSxDQUFjO1FBRXpELENBQUM7UUFFRCxlQUFlLENBQUMsQ0FBUyxFQUFFLFlBQXlCLEVBQUUsUUFBZ0IsRUFDbEUsZ0JBQXlCO1lBQzNCLE1BQU0sS0FBSyxHQUFHLFFBQVEsR0FBRyxDQUFDLGdCQUFnQixhQUFoQixn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QixDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksT0FBTyxDQUFDLFdBQVcsQ0FBQztBQUM5RSxDQUFDO0FBRUQ7OztHQUdHO0FBQ0gsU0FBUyx5QkFBeUIsQ0FBQyxTQUEyQjs7SUFDNUQsT0FBTyxNQUFNLE9BQUMsU0FBUyxhQUFULFNBQVMsdUJBQVQsU0FBUyxDQUFFLEtBQUssQ0FBQyxpQkFBaUIsMkNBQUksQ0FBQyxFQUFFLENBQUM7QUFDMUQsQ0FBQztBQUVELE1BQU0sQ0FBQyxNQUFNLDJDQUEyQyxHQUFhO0lBQ25FLE9BQU8sRUFBRSxjQUFjO0lBQ3ZCLFFBQVEsRUFBRSw4QkFBOEI7Q0FDekMsQ0FBQztBQUNGLE1BQU0sQ0FBQyxNQUFNLDZCQUE2QixHQUFhO0lBQ3JELE9BQU8sRUFBRSxjQUFjO0lBQ3ZCLFFBQVEsRUFBRSwwQkFBMEI7Q0FDckMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0luamVjdCwgSW5qZWN0YWJsZSwgT25EZXN0cm95LCBQcm92aWRlcn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0RPQ1VNRU5UfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHtjb2VyY2VDc3NQaXhlbFZhbHVlfSBmcm9tICdAYW5ndWxhci9jZGsvY29lcmNpb24nO1xuXG5pbXBvcnQge0NvbHVtblJlc2l6ZX0gZnJvbSAnLi9jb2x1bW4tcmVzaXplJztcblxuLyoqXG4gKiBQcm92aWRlcyBhbiBpbXBsZW1lbnRhdGlvbiBmb3IgcmVzaXppbmcgYSBjb2x1bW4uXG4gKiBUaGUgZGV0YWlscyBvZiBob3cgcmVzaXppbmcgd29ya3MgZm9yIHRhYmxlcyBmb3IgZmxleCBtYXQtdGFibGVzIGFyZSBxdWl0ZSBkaWZmZXJlbnQuXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBSZXNpemVTdHJhdGVneSB7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCByZWFkb25seSBjb2x1bW5SZXNpemU6IENvbHVtblJlc2l6ZTtcblxuICAvKiogVXBkYXRlcyB0aGUgd2lkdGggb2YgdGhlIHNwZWNpZmllZCBjb2x1bW4uICovXG4gIGFic3RyYWN0IGFwcGx5Q29sdW1uU2l6ZShcbiAgICAgIGNzc0ZyaWVuZGx5Q29sdW1uTmFtZTogc3RyaW5nLFxuICAgICAgY29sdW1uSGVhZGVyOiBIVE1MRWxlbWVudCxcbiAgICAgIHNpemVJblB4OiBudW1iZXIsXG4gICAgICBwcmV2aW91c1NpemVJblB4PzogbnVtYmVyKTogdm9pZDtcblxuICAvKiogQXBwbGllcyBhIG1pbmltdW0gd2lkdGggdG8gdGhlIHNwZWNpZmllZCBjb2x1bW4sIHVwZGF0aW5nIGl0cyBjdXJyZW50IHdpZHRoIGFzIG5lZWRlZC4gKi9cbiAgYWJzdHJhY3QgYXBwbHlNaW5Db2x1bW5TaXplKFxuICAgICAgY3NzRnJpZW5kbHlDb2x1bW5OYW1lOiBzdHJpbmcsXG4gICAgICBjb2x1bW5IZWFkZXI6IEhUTUxFbGVtZW50LFxuICAgICAgbWluU2l6ZUluUHg6IG51bWJlcik6IHZvaWQ7XG5cbiAgLyoqIEFwcGxpZXMgYSBtYXhpbXVtIHdpZHRoIHRvIHRoZSBzcGVjaWZpZWQgY29sdW1uLCB1cGRhdGluZyBpdHMgY3VycmVudCB3aWR0aCBhcyBuZWVkZWQuICovXG4gIGFic3RyYWN0IGFwcGx5TWF4Q29sdW1uU2l6ZShcbiAgICAgIGNzc0ZyaWVuZGx5Q29sdW1uTmFtZTogc3RyaW5nLFxuICAgICAgY29sdW1uSGVhZGVyOiBIVE1MRWxlbWVudCxcbiAgICAgIG1pblNpemVJblB4OiBudW1iZXIpOiB2b2lkO1xuXG4gIC8qKiBBZGp1c3RzIHRoZSB3aWR0aCBvZiB0aGUgdGFibGUgZWxlbWVudCBieSB0aGUgc3BlY2lmaWVkIGRlbHRhLiAqL1xuICBwcm90ZWN0ZWQgdXBkYXRlVGFibGVXaWR0aChkZWx0YTogbnVtYmVyKTogdm9pZCB7XG4gICAgY29uc3QgdGFibGUgPSB0aGlzLmNvbHVtblJlc2l6ZS5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQ7XG4gICAgY29uc3QgdGFibGVXaWR0aCA9IGdldEVsZW1lbnRXaWR0aCh0YWJsZSk7XG5cbiAgICB0YWJsZS5zdHlsZS53aWR0aCA9IGNvZXJjZUNzc1BpeGVsVmFsdWUodGFibGVXaWR0aCArIGRlbHRhKTtcbiAgfVxufVxuXG4vKipcbiAqIFRoZSBvcHRpbWlhbGx5IHBlcmZvcm1pbmcgcmVzaXplIHN0cmF0ZWd5IGZvciAmbHQ7dGFibGUmZ3Q7IGVsZW1lbnRzIHdpdGggdGFibGUtbGF5b3V0OiBmaXhlZC5cbiAqIFRlc3RlZCBhZ2FpbnN0IGFuZCBvdXRwZXJmb3JtZWQ6XG4gKiAgIENTUyBzZWxlY3RvclxuICogICBDU1Mgc2VsZWN0b3Igdy8gQ1NTIHZhcmlhYmxlXG4gKiAgIFVwZGF0aW5nIGFsbCBjZWxsIG5vZGVzXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBUYWJsZUxheW91dEZpeGVkUmVzaXplU3RyYXRlZ3kgZXh0ZW5kcyBSZXNpemVTdHJhdGVneSB7XG4gIGNvbnN0cnVjdG9yKHByb3RlY3RlZCByZWFkb25seSBjb2x1bW5SZXNpemU6IENvbHVtblJlc2l6ZSkge1xuICAgIHN1cGVyKCk7XG4gIH1cblxuICBhcHBseUNvbHVtblNpemUoXzogc3RyaW5nLCBjb2x1bW5IZWFkZXI6IEhUTUxFbGVtZW50LCBzaXplSW5QeDogbnVtYmVyLFxuICAgICAgcHJldmlvdXNTaXplSW5QeD86IG51bWJlcik6IHZvaWQge1xuICAgIGNvbnN0IGRlbHRhID0gc2l6ZUluUHggLSAocHJldmlvdXNTaXplSW5QeCA/PyBnZXRFbGVtZW50V2lkdGgoY29sdW1uSGVhZGVyKSk7XG5cbiAgICBjb2x1bW5IZWFkZXIuc3R5bGUud2lkdGggPSBjb2VyY2VDc3NQaXhlbFZhbHVlKHNpemVJblB4KTtcblxuICAgIHRoaXMudXBkYXRlVGFibGVXaWR0aChkZWx0YSk7XG4gIH1cblxuICBhcHBseU1pbkNvbHVtblNpemUoXzogc3RyaW5nLCBjb2x1bW5IZWFkZXI6IEhUTUxFbGVtZW50LCBzaXplSW5QeDogbnVtYmVyKTogdm9pZCB7XG4gICAgY29uc3QgY3VycmVudFdpZHRoID0gZ2V0RWxlbWVudFdpZHRoKGNvbHVtbkhlYWRlcik7XG4gICAgY29uc3QgbmV3V2lkdGggPSBNYXRoLm1heChjdXJyZW50V2lkdGgsIHNpemVJblB4KTtcblxuICAgIHRoaXMuYXBwbHlDb2x1bW5TaXplKF8sIGNvbHVtbkhlYWRlciwgbmV3V2lkdGgsIGN1cnJlbnRXaWR0aCk7XG4gIH1cblxuICBhcHBseU1heENvbHVtblNpemUoXzogc3RyaW5nLCBjb2x1bW5IZWFkZXI6IEhUTUxFbGVtZW50LCBzaXplSW5QeDogbnVtYmVyKTogdm9pZCB7XG4gICAgY29uc3QgY3VycmVudFdpZHRoID0gZ2V0RWxlbWVudFdpZHRoKGNvbHVtbkhlYWRlcik7XG4gICAgY29uc3QgbmV3V2lkdGggPSBNYXRoLm1pbihjdXJyZW50V2lkdGgsIHNpemVJblB4KTtcblxuICAgIHRoaXMuYXBwbHlDb2x1bW5TaXplKF8sIGNvbHVtbkhlYWRlciwgbmV3V2lkdGgsIGN1cnJlbnRXaWR0aCk7XG4gIH1cbn1cblxuLyoqXG4gKiBUaGUgb3B0aW1hbGx5IHBlcmZvcm1pbmcgcmVzaXplIHN0cmF0ZWd5IGZvciBmbGV4IG1hdC10YWJsZXMuXG4gKiBUZXN0ZWQgYWdhaW5zdCBhbmQgb3V0cGVyZm9ybWVkOlxuICogICBDU1Mgc2VsZWN0b3Igdy8gQ1NTIHZhcmlhYmxlXG4gKiAgIFVwZGF0aW5nIGFsbCBtYXQtY2VsbCBub2Rlc1xuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgQ2RrRmxleFRhYmxlUmVzaXplU3RyYXRlZ3kgZXh0ZW5kcyBSZXNpemVTdHJhdGVneSBpbXBsZW1lbnRzIE9uRGVzdHJveSB7XG4gIHByaXZhdGUgcmVhZG9ubHkgX2RvY3VtZW50OiBEb2N1bWVudDtcbiAgcHJpdmF0ZSByZWFkb25seSBfY29sdW1uSW5kZXhlcyA9IG5ldyBNYXA8c3RyaW5nLCBudW1iZXI+KCk7XG4gIHByaXZhdGUgcmVhZG9ubHkgX2NvbHVtblByb3BlcnRpZXMgPSBuZXcgTWFwPHN0cmluZywgTWFwPHN0cmluZywgc3RyaW5nPj4oKTtcblxuICBwcml2YXRlIF9zdHlsZUVsZW1lbnQ/OiBIVE1MU3R5bGVFbGVtZW50O1xuICBwcml2YXRlIF9pbmRleFNlcXVlbmNlID0gMDtcblxuICBwcm90ZWN0ZWQgcmVhZG9ubHkgZGVmYXVsdE1pblNpemUgPSAwO1xuICBwcm90ZWN0ZWQgcmVhZG9ubHkgZGVmYXVsdE1heFNpemUgPSBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByb3RlY3RlZCByZWFkb25seSBjb2x1bW5SZXNpemU6IENvbHVtblJlc2l6ZSxcbiAgICAgIEBJbmplY3QoRE9DVU1FTlQpIGRvY3VtZW50OiBhbnkpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuX2RvY3VtZW50ID0gZG9jdW1lbnQ7XG4gIH1cblxuICBhcHBseUNvbHVtblNpemUoY3NzRnJpZW5kbHlDb2x1bW5OYW1lOiBzdHJpbmcsIGNvbHVtbkhlYWRlcjogSFRNTEVsZW1lbnQsXG4gICAgICBzaXplSW5QeDogbnVtYmVyLCBwcmV2aW91c1NpemVJblB4PzogbnVtYmVyKTogdm9pZCB7XG4gICAgLy8gT3B0aW1pemF0aW9uOiBDaGVjayBhcHBsaWVkIHdpZHRoIGZpcnN0IGFzIHdlIHByb2JhYmx5IHNldCBpdCBhbHJlYWR5IGJlZm9yZSByZWFkaW5nXG4gICAgLy8gb2Zmc2V0V2lkdGggd2hpY2ggdHJpZ2dlcnMgbGF5b3V0LlxuICAgIGNvbnN0IGRlbHRhID0gc2l6ZUluUHggLSAocHJldmlvdXNTaXplSW5QeCA/P1xuICAgICAgICAodGhpcy5fZ2V0QXBwbGllZFdpZHRoKGNzc0ZyaWVuZGx5Q29sdW1uTmFtZSkgfHwgY29sdW1uSGVhZGVyLm9mZnNldFdpZHRoKSk7XG5cbiAgICBjb25zdCBjc3NTaXplID0gY29lcmNlQ3NzUGl4ZWxWYWx1ZShzaXplSW5QeCk7XG5cbiAgICB0aGlzLl9hcHBseVByb3BlcnR5KGNzc0ZyaWVuZGx5Q29sdW1uTmFtZSwgJ2ZsZXgnLCBgMCAwLjAxICR7Y3NzU2l6ZX1gKTtcbiAgICB0aGlzLnVwZGF0ZVRhYmxlV2lkdGgoZGVsdGEpO1xuICB9XG5cbiAgYXBwbHlNaW5Db2x1bW5TaXplKGNzc0ZyaWVuZGx5Q29sdW1uTmFtZTogc3RyaW5nLCBfOiBIVE1MRWxlbWVudCwgc2l6ZUluUHg6IG51bWJlcik6IHZvaWQge1xuICAgIGNvbnN0IGNzc1NpemUgPSBjb2VyY2VDc3NQaXhlbFZhbHVlKHNpemVJblB4KTtcblxuICAgIHRoaXMuX2FwcGx5UHJvcGVydHkoY3NzRnJpZW5kbHlDb2x1bW5OYW1lLCAnbWluLXdpZHRoJywgY3NzU2l6ZSxcbiAgICAgICAgc2l6ZUluUHggIT09IHRoaXMuZGVmYXVsdE1pblNpemUpO1xuICB9XG5cbiAgYXBwbHlNYXhDb2x1bW5TaXplKGNzc0ZyaWVuZGx5Q29sdW1uTmFtZTogc3RyaW5nLCBfOiBIVE1MRWxlbWVudCwgc2l6ZUluUHg6IG51bWJlcik6IHZvaWQge1xuICAgIGNvbnN0IGNzc1NpemUgPSBjb2VyY2VDc3NQaXhlbFZhbHVlKHNpemVJblB4KTtcblxuICAgIHRoaXMuX2FwcGx5UHJvcGVydHkoY3NzRnJpZW5kbHlDb2x1bW5OYW1lLCAnbWF4LXdpZHRoJywgY3NzU2l6ZSxcbiAgICAgICAgc2l6ZUluUHggIT09IHRoaXMuZGVmYXVsdE1heFNpemUpO1xuICB9XG5cbiAgcHJvdGVjdGVkIGdldENvbHVtbkNzc0NsYXNzKGNzc0ZyaWVuZGx5Q29sdW1uTmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYGNkay1jb2x1bW4tJHtjc3NGcmllbmRseUNvbHVtbk5hbWV9YDtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCk6IHZvaWQge1xuICAgIC8vIFRPRE86IFVzZSByZW1vdmUoKSBvbmNlIHdlJ3JlIG9mZiBJRTExLlxuICAgIGlmICh0aGlzLl9zdHlsZUVsZW1lbnQgJiYgdGhpcy5fc3R5bGVFbGVtZW50LnBhcmVudE5vZGUpIHtcbiAgICAgIHRoaXMuX3N0eWxlRWxlbWVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMuX3N0eWxlRWxlbWVudCk7XG4gICAgICB0aGlzLl9zdHlsZUVsZW1lbnQgPSB1bmRlZmluZWQ7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0UHJvcGVydHlWYWx1ZShjc3NGcmllbmRseUNvbHVtbk5hbWU6IHN0cmluZywga2V5OiBzdHJpbmcpOiBzdHJpbmd8dW5kZWZpbmVkIHtcbiAgICBjb25zdCBwcm9wZXJ0aWVzID0gdGhpcy5fZ2V0Q29sdW1uUHJvcGVydGllc01hcChjc3NGcmllbmRseUNvbHVtbk5hbWUpO1xuICAgIHJldHVybiBwcm9wZXJ0aWVzLmdldChrZXkpO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0QXBwbGllZFdpZHRoKGNzc0ZyaWVuZHNseUNvbHVtbk5hbWU6IHN0cmluZyk6IG51bWJlciB7XG4gICAgcmV0dXJuIGNvZXJjZVBpeGVsc0Zyb21GbGV4VmFsdWUodGhpcy5fZ2V0UHJvcGVydHlWYWx1ZShjc3NGcmllbmRzbHlDb2x1bW5OYW1lLCAnZmxleCcpKTtcbiAgfVxuXG4gIHByaXZhdGUgX2FwcGx5UHJvcGVydHkoXG4gICAgICBjc3NGcmllbmRseUNvbHVtbk5hbWU6IHN0cmluZyxcbiAgICAgIGtleTogc3RyaW5nLFxuICAgICAgdmFsdWU6IHN0cmluZyxcbiAgICAgIGVuYWJsZSA9IHRydWUpOiB2b2lkIHtcbiAgICBjb25zdCBwcm9wZXJ0aWVzID0gdGhpcy5fZ2V0Q29sdW1uUHJvcGVydGllc01hcChjc3NGcmllbmRseUNvbHVtbk5hbWUpO1xuXG4gICAgaWYgKGVuYWJsZSkge1xuICAgICAgcHJvcGVydGllcy5zZXQoa2V5LCB2YWx1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHByb3BlcnRpZXMuZGVsZXRlKGtleSk7XG4gICAgfVxuICAgIHRoaXMuX2FwcGx5U2l6ZUNzcyhjc3NGcmllbmRseUNvbHVtbk5hbWUpO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0U3R5bGVTaGVldCgpOiBDU1NTdHlsZVNoZWV0IHtcbiAgICBpZiAoIXRoaXMuX3N0eWxlRWxlbWVudCkge1xuICAgICAgdGhpcy5fc3R5bGVFbGVtZW50ID0gdGhpcy5fZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcbiAgICAgIHRoaXMuX3N0eWxlRWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLl9kb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgnJykpO1xuICAgICAgdGhpcy5fZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZCh0aGlzLl9zdHlsZUVsZW1lbnQpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9zdHlsZUVsZW1lbnQuc2hlZXQgYXMgQ1NTU3R5bGVTaGVldDtcbiAgfVxuXG4gIHByaXZhdGUgX2dldENvbHVtblByb3BlcnRpZXNNYXAoY3NzRnJpZW5kbHlDb2x1bW5OYW1lOiBzdHJpbmcpOiBNYXA8c3RyaW5nLCBzdHJpbmc+IHtcbiAgICBsZXQgcHJvcGVydGllcyA9IHRoaXMuX2NvbHVtblByb3BlcnRpZXMuZ2V0KGNzc0ZyaWVuZGx5Q29sdW1uTmFtZSk7XG4gICAgaWYgKHByb3BlcnRpZXMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcHJvcGVydGllcyA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmc+KCk7XG4gICAgICB0aGlzLl9jb2x1bW5Qcm9wZXJ0aWVzLnNldChjc3NGcmllbmRseUNvbHVtbk5hbWUsIHByb3BlcnRpZXMpO1xuICAgIH1cbiAgICByZXR1cm4gcHJvcGVydGllcztcbiAgfVxuXG4gIHByaXZhdGUgX2FwcGx5U2l6ZUNzcyhjc3NGcmllbmRseUNvbHVtbk5hbWU6IHN0cmluZykge1xuICAgIGNvbnN0IHByb3BlcnRpZXMgPSB0aGlzLl9nZXRDb2x1bW5Qcm9wZXJ0aWVzTWFwKGNzc0ZyaWVuZGx5Q29sdW1uTmFtZSk7XG4gICAgY29uc3QgcHJvcGVydHlLZXlzID0gQXJyYXkuZnJvbShwcm9wZXJ0aWVzLmtleXMoKSk7XG5cbiAgICBsZXQgaW5kZXggPSB0aGlzLl9jb2x1bW5JbmRleGVzLmdldChjc3NGcmllbmRseUNvbHVtbk5hbWUpO1xuICAgIGlmIChpbmRleCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBpZiAoIXByb3BlcnR5S2V5cy5sZW5ndGgpIHtcbiAgICAgICAgLy8gTm90aGluZyB0byBzZXQgb3IgdW5zZXQuXG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaW5kZXggPSB0aGlzLl9pbmRleFNlcXVlbmNlKys7XG4gICAgICB0aGlzLl9jb2x1bW5JbmRleGVzLnNldChjc3NGcmllbmRseUNvbHVtbk5hbWUsIGluZGV4KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fZ2V0U3R5bGVTaGVldCgpLmRlbGV0ZVJ1bGUoaW5kZXgpO1xuICAgIH1cblxuICAgIGNvbnN0IGNvbHVtbkNsYXNzTmFtZSA9IHRoaXMuZ2V0Q29sdW1uQ3NzQ2xhc3MoY3NzRnJpZW5kbHlDb2x1bW5OYW1lKTtcbiAgICBjb25zdCB0YWJsZUNsYXNzTmFtZSA9IHRoaXMuY29sdW1uUmVzaXplLmdldFVuaXF1ZUNzc0NsYXNzKCk7XG5cbiAgICBjb25zdCBzZWxlY3RvciA9IGAuJHt0YWJsZUNsYXNzTmFtZX0gLiR7Y29sdW1uQ2xhc3NOYW1lfWA7XG4gICAgY29uc3QgYm9keSA9IHByb3BlcnR5S2V5cy5tYXAoa2V5ID0+IGAke2tleX06JHtwcm9wZXJ0aWVzLmdldChrZXkpfWApLmpvaW4oJzsnKTtcblxuICAgIHRoaXMuX2dldFN0eWxlU2hlZXQoKS5pbnNlcnRSdWxlKGAke3NlbGVjdG9yfSB7JHtib2R5fX1gLCBpbmRleCEpO1xuICB9XG59XG5cbi8qKiBDb252ZXJ0cyBDU1MgcGl4ZWwgdmFsdWVzIHRvIG51bWJlcnMsIGVnIFwiMTIzcHhcIiB0byAxMjMuIFJldHVybnMgTmFOIGZvciBub24gcGl4ZWwgdmFsdWVzLiAqL1xuZnVuY3Rpb24gY29lcmNlUGl4ZWxzRnJvbUNzc1ZhbHVlKGNzc1ZhbHVlOiBzdHJpbmcpOiBudW1iZXIge1xuICByZXR1cm4gTnVtYmVyKGNzc1ZhbHVlLm1hdGNoKC8oXFxkKylweC8pPy5bMV0pO1xufVxuXG4vKiogR2V0cyB0aGUgc3R5bGUud2lkdGggcGl4ZWxzIG9uIHRoZSBzcGVjaWZpZWQgZWxlbWVudCBpZiBwcmVzZW50LCBvdGhlcndpc2UgaXRzIG9mZnNldFdpZHRoLiAqL1xuZnVuY3Rpb24gZ2V0RWxlbWVudFdpZHRoKGVsZW1lbnQ6IEhUTUxFbGVtZW50KSB7XG4gIC8vIE9wdGltaXphdGlvbjogQ2hlY2sgc3R5bGUud2lkdGggZmlyc3QgYXMgd2UgcHJvYmFibHkgc2V0IGl0IGFscmVhZHkgYmVmb3JlIHJlYWRpbmdcbiAgLy8gb2Zmc2V0V2lkdGggd2hpY2ggdHJpZ2dlcnMgbGF5b3V0LlxuICByZXR1cm4gY29lcmNlUGl4ZWxzRnJvbUNzc1ZhbHVlKGVsZW1lbnQuc3R5bGUud2lkdGgpIHx8IGVsZW1lbnQub2Zmc2V0V2lkdGg7XG59XG5cbi8qKlxuICogQ29udmVydHMgQ1NTIGZsZXggdmFsdWVzIGFzIHNldCBpbiBDZGtGbGV4VGFibGVSZXNpemVTdHJhdGVneSB0byBudW1iZXJzLFxuICogZWcgXCIwIDAuMDEgMTIzcHhcIiB0byAxMjMuXG4gKi9cbmZ1bmN0aW9uIGNvZXJjZVBpeGVsc0Zyb21GbGV4VmFsdWUoZmxleFZhbHVlOiBzdHJpbmd8dW5kZWZpbmVkKTogbnVtYmVyIHtcbiAgcmV0dXJuIE51bWJlcihmbGV4VmFsdWU/Lm1hdGNoKC8wIDBcXC4wMSAoXFxkKylweC8pPy5bMV0pO1xufVxuXG5leHBvcnQgY29uc3QgVEFCTEVfTEFZT1VUX0ZJWEVEX1JFU0laRV9TVFJBVEVHWV9QUk9WSURFUjogUHJvdmlkZXIgPSB7XG4gIHByb3ZpZGU6IFJlc2l6ZVN0cmF0ZWd5LFxuICB1c2VDbGFzczogVGFibGVMYXlvdXRGaXhlZFJlc2l6ZVN0cmF0ZWd5LFxufTtcbmV4cG9ydCBjb25zdCBGTEVYX1JFU0laRV9TVFJBVEVHWV9QUk9WSURFUjogUHJvdmlkZXIgPSB7XG4gIHByb3ZpZGU6IFJlc2l6ZVN0cmF0ZWd5LFxuICB1c2VDbGFzczogQ2RrRmxleFRhYmxlUmVzaXplU3RyYXRlZ3ksXG59O1xuIl19