/**
 * @fileoverview added by tsickle
 * Generated from: src/cdk-experimental/column-resize/resize-strategy.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
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
 * @abstract
 */
let ResizeStrategy = /** @class */ (() => {
    /**
     * Provides an implementation for resizing a column.
     * The details of how resizing works for tables for flex mat-tables are quite different.
     * @abstract
     */
    class ResizeStrategy {
        /**
         * Adjusts the width of the table element by the specified delta.
         * @protected
         * @param {?} delta
         * @return {?}
         */
        updateTableWidth(delta) {
            /** @type {?} */
            const table = this.columnResize.elementRef.nativeElement;
            /** @type {?} */
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
if (false) {
    /**
     * @type {?}
     * @protected
     */
    ResizeStrategy.prototype.columnResize;
    /**
     * Updates the width of the specified column.
     * @abstract
     * @param {?} cssFriendlyColumnName
     * @param {?} columnHeader
     * @param {?} sizeInPx
     * @param {?=} previousSizeInPx
     * @return {?}
     */
    ResizeStrategy.prototype.applyColumnSize = function (cssFriendlyColumnName, columnHeader, sizeInPx, previousSizeInPx) { };
    /**
     * Applies a minimum width to the specified column, updating its current width as needed.
     * @abstract
     * @param {?} cssFriendlyColumnName
     * @param {?} columnHeader
     * @param {?} minSizeInPx
     * @return {?}
     */
    ResizeStrategy.prototype.applyMinColumnSize = function (cssFriendlyColumnName, columnHeader, minSizeInPx) { };
    /**
     * Applies a maximum width to the specified column, updating its current width as needed.
     * @abstract
     * @param {?} cssFriendlyColumnName
     * @param {?} columnHeader
     * @param {?} minSizeInPx
     * @return {?}
     */
    ResizeStrategy.prototype.applyMaxColumnSize = function (cssFriendlyColumnName, columnHeader, minSizeInPx) { };
}
/**
 * The optimially performing resize strategy for &lt;table&gt; elements with table-layout: fixed.
 * Tested against and outperformed:
 *   CSS selector
 *   CSS selector w/ CSS variable
 *   Updating all cell nodes
 */
let TableLayoutFixedResizeStrategy = /** @class */ (() => {
    /**
     * The optimially performing resize strategy for &lt;table&gt; elements with table-layout: fixed.
     * Tested against and outperformed:
     *   CSS selector
     *   CSS selector w/ CSS variable
     *   Updating all cell nodes
     */
    class TableLayoutFixedResizeStrategy extends ResizeStrategy {
        /**
         * @param {?} columnResize
         */
        constructor(columnResize) {
            super();
            this.columnResize = columnResize;
        }
        /**
         * @param {?} _
         * @param {?} columnHeader
         * @param {?} sizeInPx
         * @param {?=} previousSizeInPx
         * @return {?}
         */
        applyColumnSize(_, columnHeader, sizeInPx, previousSizeInPx) {
            /** @type {?} */
            const delta = sizeInPx - (previousSizeInPx !== null && previousSizeInPx !== void 0 ? previousSizeInPx : getElementWidth(columnHeader));
            columnHeader.style.width = coerceCssPixelValue(sizeInPx);
            this.updateTableWidth(delta);
        }
        /**
         * @param {?} _
         * @param {?} columnHeader
         * @param {?} sizeInPx
         * @return {?}
         */
        applyMinColumnSize(_, columnHeader, sizeInPx) {
            /** @type {?} */
            const currentWidth = getElementWidth(columnHeader);
            /** @type {?} */
            const newWidth = Math.max(currentWidth, sizeInPx);
            this.applyColumnSize(_, columnHeader, newWidth, currentWidth);
        }
        /**
         * @param {?} _
         * @param {?} columnHeader
         * @param {?} sizeInPx
         * @return {?}
         */
        applyMaxColumnSize(_, columnHeader, sizeInPx) {
            /** @type {?} */
            const currentWidth = getElementWidth(columnHeader);
            /** @type {?} */
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
if (false) {
    /**
     * @type {?}
     * @protected
     */
    TableLayoutFixedResizeStrategy.prototype.columnResize;
}
/**
 * The optimally performing resize strategy for flex mat-tables.
 * Tested against and outperformed:
 *   CSS selector w/ CSS variable
 *   Updating all mat-cell nodes
 */
let CdkFlexTableResizeStrategy = /** @class */ (() => {
    /**
     * The optimally performing resize strategy for flex mat-tables.
     * Tested against and outperformed:
     *   CSS selector w/ CSS variable
     *   Updating all mat-cell nodes
     */
    class CdkFlexTableResizeStrategy extends ResizeStrategy {
        /**
         * @param {?} columnResize
         * @param {?} document
         */
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
        /**
         * @param {?} cssFriendlyColumnName
         * @param {?} columnHeader
         * @param {?} sizeInPx
         * @param {?=} previousSizeInPx
         * @return {?}
         */
        applyColumnSize(cssFriendlyColumnName, columnHeader, sizeInPx, previousSizeInPx) {
            // Optimization: Check applied width first as we probably set it already before reading
            // offsetWidth which triggers layout.
            /** @type {?} */
            const delta = sizeInPx - (previousSizeInPx !== null && previousSizeInPx !== void 0 ? previousSizeInPx : (this._getAppliedWidth(cssFriendlyColumnName) || columnHeader.offsetWidth));
            /** @type {?} */
            const cssSize = coerceCssPixelValue(sizeInPx);
            this._applyProperty(cssFriendlyColumnName, 'flex', `0 0.01 ${cssSize}`);
            this.updateTableWidth(delta);
        }
        /**
         * @param {?} cssFriendlyColumnName
         * @param {?} _
         * @param {?} sizeInPx
         * @return {?}
         */
        applyMinColumnSize(cssFriendlyColumnName, _, sizeInPx) {
            /** @type {?} */
            const cssSize = coerceCssPixelValue(sizeInPx);
            this._applyProperty(cssFriendlyColumnName, 'min-width', cssSize, sizeInPx !== this.defaultMinSize);
        }
        /**
         * @param {?} cssFriendlyColumnName
         * @param {?} _
         * @param {?} sizeInPx
         * @return {?}
         */
        applyMaxColumnSize(cssFriendlyColumnName, _, sizeInPx) {
            /** @type {?} */
            const cssSize = coerceCssPixelValue(sizeInPx);
            this._applyProperty(cssFriendlyColumnName, 'max-width', cssSize, sizeInPx !== this.defaultMaxSize);
        }
        /**
         * @protected
         * @param {?} cssFriendlyColumnName
         * @return {?}
         */
        getColumnCssClass(cssFriendlyColumnName) {
            return `cdk-column-${cssFriendlyColumnName}`;
        }
        /**
         * @return {?}
         */
        ngOnDestroy() {
            // TODO: Use remove() once we're off IE11.
            if (this._styleElement && this._styleElement.parentNode) {
                this._styleElement.parentNode.removeChild(this._styleElement);
                this._styleElement = undefined;
            }
        }
        /**
         * @private
         * @param {?} cssFriendlyColumnName
         * @param {?} key
         * @return {?}
         */
        _getPropertyValue(cssFriendlyColumnName, key) {
            /** @type {?} */
            const properties = this._getColumnPropertiesMap(cssFriendlyColumnName);
            return properties.get(key);
        }
        /**
         * @private
         * @param {?} cssFriendslyColumnName
         * @return {?}
         */
        _getAppliedWidth(cssFriendslyColumnName) {
            return coercePixelsFromFlexValue(this._getPropertyValue(cssFriendslyColumnName, 'flex'));
        }
        /**
         * @private
         * @param {?} cssFriendlyColumnName
         * @param {?} key
         * @param {?} value
         * @param {?=} enable
         * @return {?}
         */
        _applyProperty(cssFriendlyColumnName, key, value, enable = true) {
            /** @type {?} */
            const properties = this._getColumnPropertiesMap(cssFriendlyColumnName);
            if (enable) {
                properties.set(key, value);
            }
            else {
                properties.delete(key);
            }
            this._applySizeCss(cssFriendlyColumnName);
        }
        /**
         * @private
         * @return {?}
         */
        _getStyleSheet() {
            if (!this._styleElement) {
                this._styleElement = this._document.createElement('style');
                this._styleElement.appendChild(this._document.createTextNode(''));
                this._document.head.appendChild(this._styleElement);
            }
            return (/** @type {?} */ (this._styleElement.sheet));
        }
        /**
         * @private
         * @param {?} cssFriendlyColumnName
         * @return {?}
         */
        _getColumnPropertiesMap(cssFriendlyColumnName) {
            /** @type {?} */
            let properties = this._columnProperties.get(cssFriendlyColumnName);
            if (properties === undefined) {
                properties = new Map();
                this._columnProperties.set(cssFriendlyColumnName, properties);
            }
            return properties;
        }
        /**
         * @private
         * @param {?} cssFriendlyColumnName
         * @return {?}
         */
        _applySizeCss(cssFriendlyColumnName) {
            /** @type {?} */
            const properties = this._getColumnPropertiesMap(cssFriendlyColumnName);
            /** @type {?} */
            const propertyKeys = Array.from(properties.keys());
            /** @type {?} */
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
            /** @type {?} */
            const columnClassName = this.getColumnCssClass(cssFriendlyColumnName);
            /** @type {?} */
            const tableClassName = this.columnResize.getUniqueCssClass();
            /** @type {?} */
            const selector = `.${tableClassName} .${columnClassName}`;
            /** @type {?} */
            const body = propertyKeys.map((/**
             * @param {?} key
             * @return {?}
             */
            key => `${key}:${properties.get(key)}`)).join(';');
            this._getStyleSheet().insertRule(`${selector} {${body}}`, (/** @type {?} */ (index)));
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
if (false) {
    /**
     * @type {?}
     * @private
     */
    CdkFlexTableResizeStrategy.prototype._document;
    /**
     * @type {?}
     * @private
     */
    CdkFlexTableResizeStrategy.prototype._columnIndexes;
    /**
     * @type {?}
     * @private
     */
    CdkFlexTableResizeStrategy.prototype._columnProperties;
    /**
     * @type {?}
     * @private
     */
    CdkFlexTableResizeStrategy.prototype._styleElement;
    /**
     * @type {?}
     * @private
     */
    CdkFlexTableResizeStrategy.prototype._indexSequence;
    /**
     * @type {?}
     * @protected
     */
    CdkFlexTableResizeStrategy.prototype.defaultMinSize;
    /**
     * @type {?}
     * @protected
     */
    CdkFlexTableResizeStrategy.prototype.defaultMaxSize;
    /**
     * @type {?}
     * @protected
     */
    CdkFlexTableResizeStrategy.prototype.columnResize;
}
/**
 * Converts CSS pixel values to numbers, eg "123px" to 123. Returns NaN for non pixel values.
 * @param {?} cssValue
 * @return {?}
 */
function coercePixelsFromCssValue(cssValue) {
    var _a;
    return Number((_a = cssValue.match(/(\d+)px/)) === null || _a === void 0 ? void 0 : _a[1]);
}
/**
 * Gets the style.width pixels on the specified element if present, otherwise its offsetWidth.
 * @param {?} element
 * @return {?}
 */
function getElementWidth(element) {
    // Optimization: Check style.width first as we probably set it already before reading
    // offsetWidth which triggers layout.
    return coercePixelsFromCssValue(element.style.width) || element.offsetWidth;
}
/**
 * Converts CSS flex values as set in CdkFlexTableResizeStrategy to numbers,
 * eg "0 0.01 123px" to 123.
 * @param {?} flexValue
 * @return {?}
 */
function coercePixelsFromFlexValue(flexValue) {
    var _a;
    return Number((_a = flexValue === null || flexValue === void 0 ? void 0 : flexValue.match(/0 0\.01 (\d+)px/)) === null || _a === void 0 ? void 0 : _a[1]);
}
/** @type {?} */
export const TABLE_LAYOUT_FIXED_RESIZE_STRATEGY_PROVIDER = {
    provide: ResizeStrategy,
    useClass: TableLayoutFixedResizeStrategy,
};
/** @type {?} */
export const FLEX_RESIZE_STRATEGY_PROVIDER = {
    provide: ResizeStrategy,
    useClass: CdkFlexTableResizeStrategy,
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzaXplLXN0cmF0ZWd5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvY29sdW1uLXJlc2l6ZS9yZXNpemUtc3RyYXRlZ3kudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBUUEsT0FBTyxFQUFDLE1BQU0sRUFBRSxVQUFVLEVBQXNCLE1BQU0sZUFBZSxDQUFDO0FBQ3RFLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUN6QyxPQUFPLEVBQUMsbUJBQW1CLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUUxRCxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0saUJBQWlCLENBQUM7Ozs7OztBQU03Qzs7Ozs7O0lBQUEsTUFDc0IsY0FBYzs7Ozs7OztRQXVCeEIsZ0JBQWdCLENBQUMsS0FBYTs7a0JBQ2hDLEtBQUssR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxhQUFhOztrQkFDbEQsVUFBVSxHQUFHLGVBQWUsQ0FBQyxLQUFLLENBQUM7WUFFekMsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsbUJBQW1CLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQyxDQUFDO1FBQzlELENBQUM7OztnQkE3QkYsVUFBVTs7SUE4QlgscUJBQUM7S0FBQTtTQTdCcUIsY0FBYzs7Ozs7O0lBQ2xDLHNDQUF1RDs7Ozs7Ozs7OztJQUd2RCwwSEFJcUM7Ozs7Ozs7OztJQUdyQyw4R0FHK0I7Ozs7Ozs7OztJQUcvQiw4R0FHK0I7Ozs7Ozs7OztBQWtCakM7Ozs7Ozs7O0lBQUEsTUFDYSw4QkFBK0IsU0FBUSxjQUFjOzs7O1FBQ2hFLFlBQStCLFlBQTBCO1lBQ3ZELEtBQUssRUFBRSxDQUFDO1lBRHFCLGlCQUFZLEdBQVosWUFBWSxDQUFjO1FBRXpELENBQUM7Ozs7Ozs7O1FBRUQsZUFBZSxDQUFDLENBQVMsRUFBRSxZQUF5QixFQUFFLFFBQWdC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QUMsS0FBSyxDQUFDLFNBQVMsQ0FBQywwQ0FBRyxDQUFDLEVBQUUsQ0FBQztBQUNoRCxDQUFDOzs7Ozs7QUFHRCxTQUFTLGVBQWUsQ0FBQyxPQUFvQjtJQUMzQyxxRkFBcUY7SUFDckYscUNBQXFDO0lBQ3JDLE9BQU8sd0JBQXdCLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxPQUFPLENBQUMsV0FBVyxDQUFDO0FBQzlFLENBQUM7Ozs7Ozs7QUFNRCxTQUFTLHlCQUF5QixDQUFDLFNBQTJCOztJQUM1RCxPQUFPLE1BQU0sT0FBQyxTQUFTLGFBQVQsU0FBUyx1QkFBVCxTQUFTLENBQUUsS0FBSyxDQUFDLGlCQUFpQiwyQ0FBSSxDQUFDLEVBQUUsQ0FBQztBQUMxRCxDQUFDOztBQUVELE1BQU0sT0FBTywyQ0FBMkMsR0FBYTtJQUNuRSxPQUFPLEVBQUUsY0FBYztJQUN2QixRQUFRLEVBQUUsOEJBQThCO0NBQ3pDOztBQUNELE1BQU0sT0FBTyw2QkFBNkIsR0FBYTtJQUNyRCxPQUFPLEVBQUUsY0FBYztJQUN2QixRQUFRLEVBQUUsMEJBQTBCO0NBQ3JDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SW5qZWN0LCBJbmplY3RhYmxlLCBPbkRlc3Ryb3ksIFByb3ZpZGVyfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7RE9DVU1FTlR9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQge2NvZXJjZUNzc1BpeGVsVmFsdWV9IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2VyY2lvbic7XG5cbmltcG9ydCB7Q29sdW1uUmVzaXplfSBmcm9tICcuL2NvbHVtbi1yZXNpemUnO1xuXG4vKipcbiAqIFByb3ZpZGVzIGFuIGltcGxlbWVudGF0aW9uIGZvciByZXNpemluZyBhIGNvbHVtbi5cbiAqIFRoZSBkZXRhaWxzIG9mIGhvdyByZXNpemluZyB3b3JrcyBmb3IgdGFibGVzIGZvciBmbGV4IG1hdC10YWJsZXMgYXJlIHF1aXRlIGRpZmZlcmVudC5cbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFJlc2l6ZVN0cmF0ZWd5IHtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IHJlYWRvbmx5IGNvbHVtblJlc2l6ZTogQ29sdW1uUmVzaXplO1xuXG4gIC8qKiBVcGRhdGVzIHRoZSB3aWR0aCBvZiB0aGUgc3BlY2lmaWVkIGNvbHVtbi4gKi9cbiAgYWJzdHJhY3QgYXBwbHlDb2x1bW5TaXplKFxuICAgICAgY3NzRnJpZW5kbHlDb2x1bW5OYW1lOiBzdHJpbmcsXG4gICAgICBjb2x1bW5IZWFkZXI6IEhUTUxFbGVtZW50LFxuICAgICAgc2l6ZUluUHg6IG51bWJlcixcbiAgICAgIHByZXZpb3VzU2l6ZUluUHg/OiBudW1iZXIpOiB2b2lkO1xuXG4gIC8qKiBBcHBsaWVzIGEgbWluaW11bSB3aWR0aCB0byB0aGUgc3BlY2lmaWVkIGNvbHVtbiwgdXBkYXRpbmcgaXRzIGN1cnJlbnQgd2lkdGggYXMgbmVlZGVkLiAqL1xuICBhYnN0cmFjdCBhcHBseU1pbkNvbHVtblNpemUoXG4gICAgICBjc3NGcmllbmRseUNvbHVtbk5hbWU6IHN0cmluZyxcbiAgICAgIGNvbHVtbkhlYWRlcjogSFRNTEVsZW1lbnQsXG4gICAgICBtaW5TaXplSW5QeDogbnVtYmVyKTogdm9pZDtcblxuICAvKiogQXBwbGllcyBhIG1heGltdW0gd2lkdGggdG8gdGhlIHNwZWNpZmllZCBjb2x1bW4sIHVwZGF0aW5nIGl0cyBjdXJyZW50IHdpZHRoIGFzIG5lZWRlZC4gKi9cbiAgYWJzdHJhY3QgYXBwbHlNYXhDb2x1bW5TaXplKFxuICAgICAgY3NzRnJpZW5kbHlDb2x1bW5OYW1lOiBzdHJpbmcsXG4gICAgICBjb2x1bW5IZWFkZXI6IEhUTUxFbGVtZW50LFxuICAgICAgbWluU2l6ZUluUHg6IG51bWJlcik6IHZvaWQ7XG5cbiAgLyoqIEFkanVzdHMgdGhlIHdpZHRoIG9mIHRoZSB0YWJsZSBlbGVtZW50IGJ5IHRoZSBzcGVjaWZpZWQgZGVsdGEuICovXG4gIHByb3RlY3RlZCB1cGRhdGVUYWJsZVdpZHRoKGRlbHRhOiBudW1iZXIpOiB2b2lkIHtcbiAgICBjb25zdCB0YWJsZSA9IHRoaXMuY29sdW1uUmVzaXplLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudDtcbiAgICBjb25zdCB0YWJsZVdpZHRoID0gZ2V0RWxlbWVudFdpZHRoKHRhYmxlKTtcblxuICAgIHRhYmxlLnN0eWxlLndpZHRoID0gY29lcmNlQ3NzUGl4ZWxWYWx1ZSh0YWJsZVdpZHRoICsgZGVsdGEpO1xuICB9XG59XG5cbi8qKlxuICogVGhlIG9wdGltaWFsbHkgcGVyZm9ybWluZyByZXNpemUgc3RyYXRlZ3kgZm9yICZsdDt0YWJsZSZndDsgZWxlbWVudHMgd2l0aCB0YWJsZS1sYXlvdXQ6IGZpeGVkLlxuICogVGVzdGVkIGFnYWluc3QgYW5kIG91dHBlcmZvcm1lZDpcbiAqICAgQ1NTIHNlbGVjdG9yXG4gKiAgIENTUyBzZWxlY3RvciB3LyBDU1MgdmFyaWFibGVcbiAqICAgVXBkYXRpbmcgYWxsIGNlbGwgbm9kZXNcbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFRhYmxlTGF5b3V0Rml4ZWRSZXNpemVTdHJhdGVneSBleHRlbmRzIFJlc2l6ZVN0cmF0ZWd5IHtcbiAgY29uc3RydWN0b3IocHJvdGVjdGVkIHJlYWRvbmx5IGNvbHVtblJlc2l6ZTogQ29sdW1uUmVzaXplKSB7XG4gICAgc3VwZXIoKTtcbiAgfVxuXG4gIGFwcGx5Q29sdW1uU2l6ZShfOiBzdHJpbmcsIGNvbHVtbkhlYWRlcjogSFRNTEVsZW1lbnQsIHNpemVJblB4OiBudW1iZXIsXG4gICAgICBwcmV2aW91c1NpemVJblB4PzogbnVtYmVyKTogdm9pZCB7XG4gICAgY29uc3QgZGVsdGEgPSBzaXplSW5QeCAtIChwcmV2aW91c1NpemVJblB4ID8/IGdldEVsZW1lbnRXaWR0aChjb2x1bW5IZWFkZXIpKTtcblxuICAgIGNvbHVtbkhlYWRlci5zdHlsZS53aWR0aCA9IGNvZXJjZUNzc1BpeGVsVmFsdWUoc2l6ZUluUHgpO1xuXG4gICAgdGhpcy51cGRhdGVUYWJsZVdpZHRoKGRlbHRhKTtcbiAgfVxuXG4gIGFwcGx5TWluQ29sdW1uU2l6ZShfOiBzdHJpbmcsIGNvbHVtbkhlYWRlcjogSFRNTEVsZW1lbnQsIHNpemVJblB4OiBudW1iZXIpOiB2b2lkIHtcbiAgICBjb25zdCBjdXJyZW50V2lkdGggPSBnZXRFbGVtZW50V2lkdGgoY29sdW1uSGVhZGVyKTtcbiAgICBjb25zdCBuZXdXaWR0aCA9IE1hdGgubWF4KGN1cnJlbnRXaWR0aCwgc2l6ZUluUHgpO1xuXG4gICAgdGhpcy5hcHBseUNvbHVtblNpemUoXywgY29sdW1uSGVhZGVyLCBuZXdXaWR0aCwgY3VycmVudFdpZHRoKTtcbiAgfVxuXG4gIGFwcGx5TWF4Q29sdW1uU2l6ZShfOiBzdHJpbmcsIGNvbHVtbkhlYWRlcjogSFRNTEVsZW1lbnQsIHNpemVJblB4OiBudW1iZXIpOiB2b2lkIHtcbiAgICBjb25zdCBjdXJyZW50V2lkdGggPSBnZXRFbGVtZW50V2lkdGgoY29sdW1uSGVhZGVyKTtcbiAgICBjb25zdCBuZXdXaWR0aCA9IE1hdGgubWluKGN1cnJlbnRXaWR0aCwgc2l6ZUluUHgpO1xuXG4gICAgdGhpcy5hcHBseUNvbHVtblNpemUoXywgY29sdW1uSGVhZGVyLCBuZXdXaWR0aCwgY3VycmVudFdpZHRoKTtcbiAgfVxufVxuXG4vKipcbiAqIFRoZSBvcHRpbWFsbHkgcGVyZm9ybWluZyByZXNpemUgc3RyYXRlZ3kgZm9yIGZsZXggbWF0LXRhYmxlcy5cbiAqIFRlc3RlZCBhZ2FpbnN0IGFuZCBvdXRwZXJmb3JtZWQ6XG4gKiAgIENTUyBzZWxlY3RvciB3LyBDU1MgdmFyaWFibGVcbiAqICAgVXBkYXRpbmcgYWxsIG1hdC1jZWxsIG5vZGVzXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBDZGtGbGV4VGFibGVSZXNpemVTdHJhdGVneSBleHRlbmRzIFJlc2l6ZVN0cmF0ZWd5IGltcGxlbWVudHMgT25EZXN0cm95IHtcbiAgcHJpdmF0ZSByZWFkb25seSBfZG9jdW1lbnQ6IERvY3VtZW50O1xuICBwcml2YXRlIHJlYWRvbmx5IF9jb2x1bW5JbmRleGVzID0gbmV3IE1hcDxzdHJpbmcsIG51bWJlcj4oKTtcbiAgcHJpdmF0ZSByZWFkb25seSBfY29sdW1uUHJvcGVydGllcyA9IG5ldyBNYXA8c3RyaW5nLCBNYXA8c3RyaW5nLCBzdHJpbmc+PigpO1xuXG4gIHByaXZhdGUgX3N0eWxlRWxlbWVudD86IEhUTUxTdHlsZUVsZW1lbnQ7XG4gIHByaXZhdGUgX2luZGV4U2VxdWVuY2UgPSAwO1xuXG4gIHByb3RlY3RlZCByZWFkb25seSBkZWZhdWx0TWluU2l6ZSA9IDA7XG4gIHByb3RlY3RlZCByZWFkb25seSBkZWZhdWx0TWF4U2l6ZSA9IE51bWJlci5NQVhfU0FGRV9JTlRFR0VSO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJvdGVjdGVkIHJlYWRvbmx5IGNvbHVtblJlc2l6ZTogQ29sdW1uUmVzaXplLFxuICAgICAgQEluamVjdChET0NVTUVOVCkgZG9jdW1lbnQ6IGFueSkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5fZG9jdW1lbnQgPSBkb2N1bWVudDtcbiAgfVxuXG4gIGFwcGx5Q29sdW1uU2l6ZShjc3NGcmllbmRseUNvbHVtbk5hbWU6IHN0cmluZywgY29sdW1uSGVhZGVyOiBIVE1MRWxlbWVudCxcbiAgICAgIHNpemVJblB4OiBudW1iZXIsIHByZXZpb3VzU2l6ZUluUHg/OiBudW1iZXIpOiB2b2lkIHtcbiAgICAvLyBPcHRpbWl6YXRpb246IENoZWNrIGFwcGxpZWQgd2lkdGggZmlyc3QgYXMgd2UgcHJvYmFibHkgc2V0IGl0IGFscmVhZHkgYmVmb3JlIHJlYWRpbmdcbiAgICAvLyBvZmZzZXRXaWR0aCB3aGljaCB0cmlnZ2VycyBsYXlvdXQuXG4gICAgY29uc3QgZGVsdGEgPSBzaXplSW5QeCAtIChwcmV2aW91c1NpemVJblB4ID8/XG4gICAgICAgICh0aGlzLl9nZXRBcHBsaWVkV2lkdGgoY3NzRnJpZW5kbHlDb2x1bW5OYW1lKSB8fCBjb2x1bW5IZWFkZXIub2Zmc2V0V2lkdGgpKTtcblxuICAgIGNvbnN0IGNzc1NpemUgPSBjb2VyY2VDc3NQaXhlbFZhbHVlKHNpemVJblB4KTtcblxuICAgIHRoaXMuX2FwcGx5UHJvcGVydHkoY3NzRnJpZW5kbHlDb2x1bW5OYW1lLCAnZmxleCcsIGAwIDAuMDEgJHtjc3NTaXplfWApO1xuICAgIHRoaXMudXBkYXRlVGFibGVXaWR0aChkZWx0YSk7XG4gIH1cblxuICBhcHBseU1pbkNvbHVtblNpemUoY3NzRnJpZW5kbHlDb2x1bW5OYW1lOiBzdHJpbmcsIF86IEhUTUxFbGVtZW50LCBzaXplSW5QeDogbnVtYmVyKTogdm9pZCB7XG4gICAgY29uc3QgY3NzU2l6ZSA9IGNvZXJjZUNzc1BpeGVsVmFsdWUoc2l6ZUluUHgpO1xuXG4gICAgdGhpcy5fYXBwbHlQcm9wZXJ0eShjc3NGcmllbmRseUNvbHVtbk5hbWUsICdtaW4td2lkdGgnLCBjc3NTaXplLFxuICAgICAgICBzaXplSW5QeCAhPT0gdGhpcy5kZWZhdWx0TWluU2l6ZSk7XG4gIH1cblxuICBhcHBseU1heENvbHVtblNpemUoY3NzRnJpZW5kbHlDb2x1bW5OYW1lOiBzdHJpbmcsIF86IEhUTUxFbGVtZW50LCBzaXplSW5QeDogbnVtYmVyKTogdm9pZCB7XG4gICAgY29uc3QgY3NzU2l6ZSA9IGNvZXJjZUNzc1BpeGVsVmFsdWUoc2l6ZUluUHgpO1xuXG4gICAgdGhpcy5fYXBwbHlQcm9wZXJ0eShjc3NGcmllbmRseUNvbHVtbk5hbWUsICdtYXgtd2lkdGgnLCBjc3NTaXplLFxuICAgICAgICBzaXplSW5QeCAhPT0gdGhpcy5kZWZhdWx0TWF4U2l6ZSk7XG4gIH1cblxuICBwcm90ZWN0ZWQgZ2V0Q29sdW1uQ3NzQ2xhc3MoY3NzRnJpZW5kbHlDb2x1bW5OYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBgY2RrLWNvbHVtbi0ke2Nzc0ZyaWVuZGx5Q29sdW1uTmFtZX1gO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgLy8gVE9ETzogVXNlIHJlbW92ZSgpIG9uY2Ugd2UncmUgb2ZmIElFMTEuXG4gICAgaWYgKHRoaXMuX3N0eWxlRWxlbWVudCAmJiB0aGlzLl9zdHlsZUVsZW1lbnQucGFyZW50Tm9kZSkge1xuICAgICAgdGhpcy5fc3R5bGVFbGVtZW50LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcy5fc3R5bGVFbGVtZW50KTtcbiAgICAgIHRoaXMuX3N0eWxlRWxlbWVudCA9IHVuZGVmaW5lZDtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9nZXRQcm9wZXJ0eVZhbHVlKGNzc0ZyaWVuZGx5Q29sdW1uTmFtZTogc3RyaW5nLCBrZXk6IHN0cmluZyk6IHN0cmluZ3x1bmRlZmluZWQge1xuICAgIGNvbnN0IHByb3BlcnRpZXMgPSB0aGlzLl9nZXRDb2x1bW5Qcm9wZXJ0aWVzTWFwKGNzc0ZyaWVuZGx5Q29sdW1uTmFtZSk7XG4gICAgcmV0dXJuIHByb3BlcnRpZXMuZ2V0KGtleSk7XG4gIH1cblxuICBwcml2YXRlIF9nZXRBcHBsaWVkV2lkdGgoY3NzRnJpZW5kc2x5Q29sdW1uTmFtZTogc3RyaW5nKTogbnVtYmVyIHtcbiAgICByZXR1cm4gY29lcmNlUGl4ZWxzRnJvbUZsZXhWYWx1ZSh0aGlzLl9nZXRQcm9wZXJ0eVZhbHVlKGNzc0ZyaWVuZHNseUNvbHVtbk5hbWUsICdmbGV4JykpO1xuICB9XG5cbiAgcHJpdmF0ZSBfYXBwbHlQcm9wZXJ0eShcbiAgICAgIGNzc0ZyaWVuZGx5Q29sdW1uTmFtZTogc3RyaW5nLFxuICAgICAga2V5OiBzdHJpbmcsXG4gICAgICB2YWx1ZTogc3RyaW5nLFxuICAgICAgZW5hYmxlID0gdHJ1ZSk6IHZvaWQge1xuICAgIGNvbnN0IHByb3BlcnRpZXMgPSB0aGlzLl9nZXRDb2x1bW5Qcm9wZXJ0aWVzTWFwKGNzc0ZyaWVuZGx5Q29sdW1uTmFtZSk7XG5cbiAgICBpZiAoZW5hYmxlKSB7XG4gICAgICBwcm9wZXJ0aWVzLnNldChrZXksIHZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcHJvcGVydGllcy5kZWxldGUoa2V5KTtcbiAgICB9XG4gICAgdGhpcy5fYXBwbHlTaXplQ3NzKGNzc0ZyaWVuZGx5Q29sdW1uTmFtZSk7XG4gIH1cblxuICBwcml2YXRlIF9nZXRTdHlsZVNoZWV0KCk6IENTU1N0eWxlU2hlZXQge1xuICAgIGlmICghdGhpcy5fc3R5bGVFbGVtZW50KSB7XG4gICAgICB0aGlzLl9zdHlsZUVsZW1lbnQgPSB0aGlzLl9kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuICAgICAgdGhpcy5fc3R5bGVFbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuX2RvY3VtZW50LmNyZWF0ZVRleHROb2RlKCcnKSk7XG4gICAgICB0aGlzLl9kb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHRoaXMuX3N0eWxlRWxlbWVudCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX3N0eWxlRWxlbWVudC5zaGVldCBhcyBDU1NTdHlsZVNoZWV0O1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0Q29sdW1uUHJvcGVydGllc01hcChjc3NGcmllbmRseUNvbHVtbk5hbWU6IHN0cmluZyk6IE1hcDxzdHJpbmcsIHN0cmluZz4ge1xuICAgIGxldCBwcm9wZXJ0aWVzID0gdGhpcy5fY29sdW1uUHJvcGVydGllcy5nZXQoY3NzRnJpZW5kbHlDb2x1bW5OYW1lKTtcbiAgICBpZiAocHJvcGVydGllcyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBwcm9wZXJ0aWVzID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZz4oKTtcbiAgICAgIHRoaXMuX2NvbHVtblByb3BlcnRpZXMuc2V0KGNzc0ZyaWVuZGx5Q29sdW1uTmFtZSwgcHJvcGVydGllcyk7XG4gICAgfVxuICAgIHJldHVybiBwcm9wZXJ0aWVzO1xuICB9XG5cbiAgcHJpdmF0ZSBfYXBwbHlTaXplQ3NzKGNzc0ZyaWVuZGx5Q29sdW1uTmFtZTogc3RyaW5nKSB7XG4gICAgY29uc3QgcHJvcGVydGllcyA9IHRoaXMuX2dldENvbHVtblByb3BlcnRpZXNNYXAoY3NzRnJpZW5kbHlDb2x1bW5OYW1lKTtcbiAgICBjb25zdCBwcm9wZXJ0eUtleXMgPSBBcnJheS5mcm9tKHByb3BlcnRpZXMua2V5cygpKTtcblxuICAgIGxldCBpbmRleCA9IHRoaXMuX2NvbHVtbkluZGV4ZXMuZ2V0KGNzc0ZyaWVuZGx5Q29sdW1uTmFtZSk7XG4gICAgaWYgKGluZGV4ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGlmICghcHJvcGVydHlLZXlzLmxlbmd0aCkge1xuICAgICAgICAvLyBOb3RoaW5nIHRvIHNldCBvciB1bnNldC5cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpbmRleCA9IHRoaXMuX2luZGV4U2VxdWVuY2UrKztcbiAgICAgIHRoaXMuX2NvbHVtbkluZGV4ZXMuc2V0KGNzc0ZyaWVuZGx5Q29sdW1uTmFtZSwgaW5kZXgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9nZXRTdHlsZVNoZWV0KCkuZGVsZXRlUnVsZShpbmRleCk7XG4gICAgfVxuXG4gICAgY29uc3QgY29sdW1uQ2xhc3NOYW1lID0gdGhpcy5nZXRDb2x1bW5Dc3NDbGFzcyhjc3NGcmllbmRseUNvbHVtbk5hbWUpO1xuICAgIGNvbnN0IHRhYmxlQ2xhc3NOYW1lID0gdGhpcy5jb2x1bW5SZXNpemUuZ2V0VW5pcXVlQ3NzQ2xhc3MoKTtcblxuICAgIGNvbnN0IHNlbGVjdG9yID0gYC4ke3RhYmxlQ2xhc3NOYW1lfSAuJHtjb2x1bW5DbGFzc05hbWV9YDtcbiAgICBjb25zdCBib2R5ID0gcHJvcGVydHlLZXlzLm1hcChrZXkgPT4gYCR7a2V5fToke3Byb3BlcnRpZXMuZ2V0KGtleSl9YCkuam9pbignOycpO1xuXG4gICAgdGhpcy5fZ2V0U3R5bGVTaGVldCgpLmluc2VydFJ1bGUoYCR7c2VsZWN0b3J9IHske2JvZHl9fWAsIGluZGV4ISk7XG4gIH1cbn1cblxuLyoqIENvbnZlcnRzIENTUyBwaXhlbCB2YWx1ZXMgdG8gbnVtYmVycywgZWcgXCIxMjNweFwiIHRvIDEyMy4gUmV0dXJucyBOYU4gZm9yIG5vbiBwaXhlbCB2YWx1ZXMuICovXG5mdW5jdGlvbiBjb2VyY2VQaXhlbHNGcm9tQ3NzVmFsdWUoY3NzVmFsdWU6IHN0cmluZyk6IG51bWJlciB7XG4gIHJldHVybiBOdW1iZXIoY3NzVmFsdWUubWF0Y2goLyhcXGQrKXB4Lyk/LlsxXSk7XG59XG5cbi8qKiBHZXRzIHRoZSBzdHlsZS53aWR0aCBwaXhlbHMgb24gdGhlIHNwZWNpZmllZCBlbGVtZW50IGlmIHByZXNlbnQsIG90aGVyd2lzZSBpdHMgb2Zmc2V0V2lkdGguICovXG5mdW5jdGlvbiBnZXRFbGVtZW50V2lkdGgoZWxlbWVudDogSFRNTEVsZW1lbnQpIHtcbiAgLy8gT3B0aW1pemF0aW9uOiBDaGVjayBzdHlsZS53aWR0aCBmaXJzdCBhcyB3ZSBwcm9iYWJseSBzZXQgaXQgYWxyZWFkeSBiZWZvcmUgcmVhZGluZ1xuICAvLyBvZmZzZXRXaWR0aCB3aGljaCB0cmlnZ2VycyBsYXlvdXQuXG4gIHJldHVybiBjb2VyY2VQaXhlbHNGcm9tQ3NzVmFsdWUoZWxlbWVudC5zdHlsZS53aWR0aCkgfHwgZWxlbWVudC5vZmZzZXRXaWR0aDtcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBDU1MgZmxleCB2YWx1ZXMgYXMgc2V0IGluIENka0ZsZXhUYWJsZVJlc2l6ZVN0cmF0ZWd5IHRvIG51bWJlcnMsXG4gKiBlZyBcIjAgMC4wMSAxMjNweFwiIHRvIDEyMy5cbiAqL1xuZnVuY3Rpb24gY29lcmNlUGl4ZWxzRnJvbUZsZXhWYWx1ZShmbGV4VmFsdWU6IHN0cmluZ3x1bmRlZmluZWQpOiBudW1iZXIge1xuICByZXR1cm4gTnVtYmVyKGZsZXhWYWx1ZT8ubWF0Y2goLzAgMFxcLjAxIChcXGQrKXB4Lyk/LlsxXSk7XG59XG5cbmV4cG9ydCBjb25zdCBUQUJMRV9MQVlPVVRfRklYRURfUkVTSVpFX1NUUkFURUdZX1BST1ZJREVSOiBQcm92aWRlciA9IHtcbiAgcHJvdmlkZTogUmVzaXplU3RyYXRlZ3ksXG4gIHVzZUNsYXNzOiBUYWJsZUxheW91dEZpeGVkUmVzaXplU3RyYXRlZ3ksXG59O1xuZXhwb3J0IGNvbnN0IEZMRVhfUkVTSVpFX1NUUkFURUdZX1BST1ZJREVSOiBQcm92aWRlciA9IHtcbiAgcHJvdmlkZTogUmVzaXplU3RyYXRlZ3ksXG4gIHVzZUNsYXNzOiBDZGtGbGV4VGFibGVSZXNpemVTdHJhdGVneSxcbn07XG4iXX0=