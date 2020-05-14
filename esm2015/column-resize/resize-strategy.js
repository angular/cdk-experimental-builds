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
export class ResizeStrategy {
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
export class TableLayoutFixedResizeStrategy extends ResizeStrategy {
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
export class CdkFlexTableResizeStrategy extends ResizeStrategy {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzaXplLXN0cmF0ZWd5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvY29sdW1uLXJlc2l6ZS9yZXNpemUtc3RyYXRlZ3kudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBUUEsT0FBTyxFQUFDLE1BQU0sRUFBRSxVQUFVLEVBQXNCLE1BQU0sZUFBZSxDQUFDO0FBQ3RFLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUN6QyxPQUFPLEVBQUMsbUJBQW1CLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUUxRCxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0saUJBQWlCLENBQUM7Ozs7OztBQU83QyxNQUFNLE9BQWdCLGNBQWM7Ozs7Ozs7SUF1QnhCLGdCQUFnQixDQUFDLEtBQWE7O2NBQ2hDLEtBQUssR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxhQUFhOztjQUNsRCxVQUFVLEdBQUcsZUFBZSxDQUFDLEtBQUssQ0FBQztRQUV6QyxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxtQkFBbUIsQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDLENBQUM7SUFDOUQsQ0FBQzs7O1lBN0JGLFVBQVU7Ozs7Ozs7SUFFVCxzQ0FBdUQ7Ozs7Ozs7Ozs7SUFHdkQsMEhBSXFDOzs7Ozs7Ozs7SUFHckMsOEdBRytCOzs7Ozs7Ozs7SUFHL0IsOEdBRytCOzs7Ozs7Ozs7QUFtQmpDLE1BQU0sT0FBTyw4QkFBK0IsU0FBUSxjQUFjOzs7O0lBQ2hFLFlBQStCLFlBQTBCO1FBQ3ZELEtBQUssRUFBRSxDQUFDO1FBRHFCLGlCQUFZLEdBQVosWUFBWSxDQUFjO0lBRXpELENBQUM7Ozs7Ozs7O0lBRUQsZUFBZSxDQUFDLENBQVMsRUFBRSxZQUF5QixFQUFFLFFBQWdCLEVBQ2xFLGdCQUF5Qjs7Y0FDckIsS0FBSyxHQUFHLFFBQVEsR0FBRyxDQUFD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QUMsS0FBSyxDQUFDLElBQUksT0FBTyxDQUFDLFdBQVcsQ0FBQztBQUM5RSxDQUFDOzs7Ozs7O0FBTUQsU0FBUyx5QkFBeUIsQ0FBQyxTQUEyQjs7SUFDNUQsT0FBTyxNQUFNLE9BQUMsU0FBUyxhQUFULFNBQVMsdUJBQVQsU0FBUyxDQUFFLEtBQUssQ0FBQyxpQkFBaUIsMkNBQUksQ0FBQyxFQUFFLENBQUM7QUFDMUQsQ0FBQzs7QUFFRCxNQUFNLE9BQU8sMkNBQTJDLEdBQWE7SUFDbkUsT0FBTyxFQUFFLGNBQWM7SUFDdkIsUUFBUSxFQUFFLDhCQUE4QjtDQUN6Qzs7QUFDRCxNQUFNLE9BQU8sNkJBQTZCLEdBQWE7SUFDckQsT0FBTyxFQUFFLGNBQWM7SUFDdkIsUUFBUSxFQUFFLDBCQUEwQjtDQUNyQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0luamVjdCwgSW5qZWN0YWJsZSwgT25EZXN0cm95LCBQcm92aWRlcn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0RPQ1VNRU5UfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHtjb2VyY2VDc3NQaXhlbFZhbHVlfSBmcm9tICdAYW5ndWxhci9jZGsvY29lcmNpb24nO1xuXG5pbXBvcnQge0NvbHVtblJlc2l6ZX0gZnJvbSAnLi9jb2x1bW4tcmVzaXplJztcblxuLyoqXG4gKiBQcm92aWRlcyBhbiBpbXBsZW1lbnRhdGlvbiBmb3IgcmVzaXppbmcgYSBjb2x1bW4uXG4gKiBUaGUgZGV0YWlscyBvZiBob3cgcmVzaXppbmcgd29ya3MgZm9yIHRhYmxlcyBmb3IgZmxleCBtYXQtdGFibGVzIGFyZSBxdWl0ZSBkaWZmZXJlbnQuXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBSZXNpemVTdHJhdGVneSB7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCByZWFkb25seSBjb2x1bW5SZXNpemU6IENvbHVtblJlc2l6ZTtcblxuICAvKiogVXBkYXRlcyB0aGUgd2lkdGggb2YgdGhlIHNwZWNpZmllZCBjb2x1bW4uICovXG4gIGFic3RyYWN0IGFwcGx5Q29sdW1uU2l6ZShcbiAgICAgIGNzc0ZyaWVuZGx5Q29sdW1uTmFtZTogc3RyaW5nLFxuICAgICAgY29sdW1uSGVhZGVyOiBIVE1MRWxlbWVudCxcbiAgICAgIHNpemVJblB4OiBudW1iZXIsXG4gICAgICBwcmV2aW91c1NpemVJblB4PzogbnVtYmVyKTogdm9pZDtcblxuICAvKiogQXBwbGllcyBhIG1pbmltdW0gd2lkdGggdG8gdGhlIHNwZWNpZmllZCBjb2x1bW4sIHVwZGF0aW5nIGl0cyBjdXJyZW50IHdpZHRoIGFzIG5lZWRlZC4gKi9cbiAgYWJzdHJhY3QgYXBwbHlNaW5Db2x1bW5TaXplKFxuICAgICAgY3NzRnJpZW5kbHlDb2x1bW5OYW1lOiBzdHJpbmcsXG4gICAgICBjb2x1bW5IZWFkZXI6IEhUTUxFbGVtZW50LFxuICAgICAgbWluU2l6ZUluUHg6IG51bWJlcik6IHZvaWQ7XG5cbiAgLyoqIEFwcGxpZXMgYSBtYXhpbXVtIHdpZHRoIHRvIHRoZSBzcGVjaWZpZWQgY29sdW1uLCB1cGRhdGluZyBpdHMgY3VycmVudCB3aWR0aCBhcyBuZWVkZWQuICovXG4gIGFic3RyYWN0IGFwcGx5TWF4Q29sdW1uU2l6ZShcbiAgICAgIGNzc0ZyaWVuZGx5Q29sdW1uTmFtZTogc3RyaW5nLFxuICAgICAgY29sdW1uSGVhZGVyOiBIVE1MRWxlbWVudCxcbiAgICAgIG1pblNpemVJblB4OiBudW1iZXIpOiB2b2lkO1xuXG4gIC8qKiBBZGp1c3RzIHRoZSB3aWR0aCBvZiB0aGUgdGFibGUgZWxlbWVudCBieSB0aGUgc3BlY2lmaWVkIGRlbHRhLiAqL1xuICBwcm90ZWN0ZWQgdXBkYXRlVGFibGVXaWR0aChkZWx0YTogbnVtYmVyKTogdm9pZCB7XG4gICAgY29uc3QgdGFibGUgPSB0aGlzLmNvbHVtblJlc2l6ZS5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQ7XG4gICAgY29uc3QgdGFibGVXaWR0aCA9IGdldEVsZW1lbnRXaWR0aCh0YWJsZSk7XG5cbiAgICB0YWJsZS5zdHlsZS53aWR0aCA9IGNvZXJjZUNzc1BpeGVsVmFsdWUodGFibGVXaWR0aCArIGRlbHRhKTtcbiAgfVxufVxuXG4vKipcbiAqIFRoZSBvcHRpbWlhbGx5IHBlcmZvcm1pbmcgcmVzaXplIHN0cmF0ZWd5IGZvciAmbHQ7dGFibGUmZ3Q7IGVsZW1lbnRzIHdpdGggdGFibGUtbGF5b3V0OiBmaXhlZC5cbiAqIFRlc3RlZCBhZ2FpbnN0IGFuZCBvdXRwZXJmb3JtZWQ6XG4gKiAgIENTUyBzZWxlY3RvclxuICogICBDU1Mgc2VsZWN0b3Igdy8gQ1NTIHZhcmlhYmxlXG4gKiAgIFVwZGF0aW5nIGFsbCBjZWxsIG5vZGVzXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBUYWJsZUxheW91dEZpeGVkUmVzaXplU3RyYXRlZ3kgZXh0ZW5kcyBSZXNpemVTdHJhdGVneSB7XG4gIGNvbnN0cnVjdG9yKHByb3RlY3RlZCByZWFkb25seSBjb2x1bW5SZXNpemU6IENvbHVtblJlc2l6ZSkge1xuICAgIHN1cGVyKCk7XG4gIH1cblxuICBhcHBseUNvbHVtblNpemUoXzogc3RyaW5nLCBjb2x1bW5IZWFkZXI6IEhUTUxFbGVtZW50LCBzaXplSW5QeDogbnVtYmVyLFxuICAgICAgcHJldmlvdXNTaXplSW5QeD86IG51bWJlcik6IHZvaWQge1xuICAgIGNvbnN0IGRlbHRhID0gc2l6ZUluUHggLSAocHJldmlvdXNTaXplSW5QeCA/PyBnZXRFbGVtZW50V2lkdGgoY29sdW1uSGVhZGVyKSk7XG5cbiAgICBjb2x1bW5IZWFkZXIuc3R5bGUud2lkdGggPSBjb2VyY2VDc3NQaXhlbFZhbHVlKHNpemVJblB4KTtcblxuICAgIHRoaXMudXBkYXRlVGFibGVXaWR0aChkZWx0YSk7XG4gIH1cblxuICBhcHBseU1pbkNvbHVtblNpemUoXzogc3RyaW5nLCBjb2x1bW5IZWFkZXI6IEhUTUxFbGVtZW50LCBzaXplSW5QeDogbnVtYmVyKTogdm9pZCB7XG4gICAgY29uc3QgY3VycmVudFdpZHRoID0gZ2V0RWxlbWVudFdpZHRoKGNvbHVtbkhlYWRlcik7XG4gICAgY29uc3QgbmV3V2lkdGggPSBNYXRoLm1heChjdXJyZW50V2lkdGgsIHNpemVJblB4KTtcblxuICAgIHRoaXMuYXBwbHlDb2x1bW5TaXplKF8sIGNvbHVtbkhlYWRlciwgbmV3V2lkdGgsIGN1cnJlbnRXaWR0aCk7XG4gIH1cblxuICBhcHBseU1heENvbHVtblNpemUoXzogc3RyaW5nLCBjb2x1bW5IZWFkZXI6IEhUTUxFbGVtZW50LCBzaXplSW5QeDogbnVtYmVyKTogdm9pZCB7XG4gICAgY29uc3QgY3VycmVudFdpZHRoID0gZ2V0RWxlbWVudFdpZHRoKGNvbHVtbkhlYWRlcik7XG4gICAgY29uc3QgbmV3V2lkdGggPSBNYXRoLm1pbihjdXJyZW50V2lkdGgsIHNpemVJblB4KTtcblxuICAgIHRoaXMuYXBwbHlDb2x1bW5TaXplKF8sIGNvbHVtbkhlYWRlciwgbmV3V2lkdGgsIGN1cnJlbnRXaWR0aCk7XG4gIH1cbn1cblxuLyoqXG4gKiBUaGUgb3B0aW1hbGx5IHBlcmZvcm1pbmcgcmVzaXplIHN0cmF0ZWd5IGZvciBmbGV4IG1hdC10YWJsZXMuXG4gKiBUZXN0ZWQgYWdhaW5zdCBhbmQgb3V0cGVyZm9ybWVkOlxuICogICBDU1Mgc2VsZWN0b3Igdy8gQ1NTIHZhcmlhYmxlXG4gKiAgIFVwZGF0aW5nIGFsbCBtYXQtY2VsbCBub2Rlc1xuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgQ2RrRmxleFRhYmxlUmVzaXplU3RyYXRlZ3kgZXh0ZW5kcyBSZXNpemVTdHJhdGVneSBpbXBsZW1lbnRzIE9uRGVzdHJveSB7XG4gIHByaXZhdGUgcmVhZG9ubHkgX2RvY3VtZW50OiBEb2N1bWVudDtcbiAgcHJpdmF0ZSByZWFkb25seSBfY29sdW1uSW5kZXhlcyA9IG5ldyBNYXA8c3RyaW5nLCBudW1iZXI+KCk7XG4gIHByaXZhdGUgcmVhZG9ubHkgX2NvbHVtblByb3BlcnRpZXMgPSBuZXcgTWFwPHN0cmluZywgTWFwPHN0cmluZywgc3RyaW5nPj4oKTtcblxuICBwcml2YXRlIF9zdHlsZUVsZW1lbnQ/OiBIVE1MU3R5bGVFbGVtZW50O1xuICBwcml2YXRlIF9pbmRleFNlcXVlbmNlID0gMDtcblxuICBwcm90ZWN0ZWQgcmVhZG9ubHkgZGVmYXVsdE1pblNpemUgPSAwO1xuICBwcm90ZWN0ZWQgcmVhZG9ubHkgZGVmYXVsdE1heFNpemUgPSBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByb3RlY3RlZCByZWFkb25seSBjb2x1bW5SZXNpemU6IENvbHVtblJlc2l6ZSxcbiAgICAgIEBJbmplY3QoRE9DVU1FTlQpIGRvY3VtZW50OiBhbnkpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuX2RvY3VtZW50ID0gZG9jdW1lbnQ7XG4gIH1cblxuICBhcHBseUNvbHVtblNpemUoY3NzRnJpZW5kbHlDb2x1bW5OYW1lOiBzdHJpbmcsIGNvbHVtbkhlYWRlcjogSFRNTEVsZW1lbnQsXG4gICAgICBzaXplSW5QeDogbnVtYmVyLCBwcmV2aW91c1NpemVJblB4PzogbnVtYmVyKTogdm9pZCB7XG4gICAgLy8gT3B0aW1pemF0aW9uOiBDaGVjayBhcHBsaWVkIHdpZHRoIGZpcnN0IGFzIHdlIHByb2JhYmx5IHNldCBpdCBhbHJlYWR5IGJlZm9yZSByZWFkaW5nXG4gICAgLy8gb2Zmc2V0V2lkdGggd2hpY2ggdHJpZ2dlcnMgbGF5b3V0LlxuICAgIGNvbnN0IGRlbHRhID0gc2l6ZUluUHggLSAocHJldmlvdXNTaXplSW5QeCA/P1xuICAgICAgICAodGhpcy5fZ2V0QXBwbGllZFdpZHRoKGNzc0ZyaWVuZGx5Q29sdW1uTmFtZSkgfHwgY29sdW1uSGVhZGVyLm9mZnNldFdpZHRoKSk7XG5cbiAgICBjb25zdCBjc3NTaXplID0gY29lcmNlQ3NzUGl4ZWxWYWx1ZShzaXplSW5QeCk7XG5cbiAgICB0aGlzLl9hcHBseVByb3BlcnR5KGNzc0ZyaWVuZGx5Q29sdW1uTmFtZSwgJ2ZsZXgnLCBgMCAwLjAxICR7Y3NzU2l6ZX1gKTtcbiAgICB0aGlzLnVwZGF0ZVRhYmxlV2lkdGgoZGVsdGEpO1xuICB9XG5cbiAgYXBwbHlNaW5Db2x1bW5TaXplKGNzc0ZyaWVuZGx5Q29sdW1uTmFtZTogc3RyaW5nLCBfOiBIVE1MRWxlbWVudCwgc2l6ZUluUHg6IG51bWJlcik6IHZvaWQge1xuICAgIGNvbnN0IGNzc1NpemUgPSBjb2VyY2VDc3NQaXhlbFZhbHVlKHNpemVJblB4KTtcblxuICAgIHRoaXMuX2FwcGx5UHJvcGVydHkoY3NzRnJpZW5kbHlDb2x1bW5OYW1lLCAnbWluLXdpZHRoJywgY3NzU2l6ZSxcbiAgICAgICAgc2l6ZUluUHggIT09IHRoaXMuZGVmYXVsdE1pblNpemUpO1xuICB9XG5cbiAgYXBwbHlNYXhDb2x1bW5TaXplKGNzc0ZyaWVuZGx5Q29sdW1uTmFtZTogc3RyaW5nLCBfOiBIVE1MRWxlbWVudCwgc2l6ZUluUHg6IG51bWJlcik6IHZvaWQge1xuICAgIGNvbnN0IGNzc1NpemUgPSBjb2VyY2VDc3NQaXhlbFZhbHVlKHNpemVJblB4KTtcblxuICAgIHRoaXMuX2FwcGx5UHJvcGVydHkoY3NzRnJpZW5kbHlDb2x1bW5OYW1lLCAnbWF4LXdpZHRoJywgY3NzU2l6ZSxcbiAgICAgICAgc2l6ZUluUHggIT09IHRoaXMuZGVmYXVsdE1heFNpemUpO1xuICB9XG5cbiAgcHJvdGVjdGVkIGdldENvbHVtbkNzc0NsYXNzKGNzc0ZyaWVuZGx5Q29sdW1uTmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYGNkay1jb2x1bW4tJHtjc3NGcmllbmRseUNvbHVtbk5hbWV9YDtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCk6IHZvaWQge1xuICAgIC8vIFRPRE86IFVzZSByZW1vdmUoKSBvbmNlIHdlJ3JlIG9mZiBJRTExLlxuICAgIGlmICh0aGlzLl9zdHlsZUVsZW1lbnQgJiYgdGhpcy5fc3R5bGVFbGVtZW50LnBhcmVudE5vZGUpIHtcbiAgICAgIHRoaXMuX3N0eWxlRWxlbWVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMuX3N0eWxlRWxlbWVudCk7XG4gICAgICB0aGlzLl9zdHlsZUVsZW1lbnQgPSB1bmRlZmluZWQ7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0UHJvcGVydHlWYWx1ZShjc3NGcmllbmRseUNvbHVtbk5hbWU6IHN0cmluZywga2V5OiBzdHJpbmcpOiBzdHJpbmd8dW5kZWZpbmVkIHtcbiAgICBjb25zdCBwcm9wZXJ0aWVzID0gdGhpcy5fZ2V0Q29sdW1uUHJvcGVydGllc01hcChjc3NGcmllbmRseUNvbHVtbk5hbWUpO1xuICAgIHJldHVybiBwcm9wZXJ0aWVzLmdldChrZXkpO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0QXBwbGllZFdpZHRoKGNzc0ZyaWVuZHNseUNvbHVtbk5hbWU6IHN0cmluZyk6IG51bWJlciB7XG4gICAgcmV0dXJuIGNvZXJjZVBpeGVsc0Zyb21GbGV4VmFsdWUodGhpcy5fZ2V0UHJvcGVydHlWYWx1ZShjc3NGcmllbmRzbHlDb2x1bW5OYW1lLCAnZmxleCcpKTtcbiAgfVxuXG4gIHByaXZhdGUgX2FwcGx5UHJvcGVydHkoXG4gICAgICBjc3NGcmllbmRseUNvbHVtbk5hbWU6IHN0cmluZyxcbiAgICAgIGtleTogc3RyaW5nLFxuICAgICAgdmFsdWU6IHN0cmluZyxcbiAgICAgIGVuYWJsZSA9IHRydWUpOiB2b2lkIHtcbiAgICBjb25zdCBwcm9wZXJ0aWVzID0gdGhpcy5fZ2V0Q29sdW1uUHJvcGVydGllc01hcChjc3NGcmllbmRseUNvbHVtbk5hbWUpO1xuXG4gICAgaWYgKGVuYWJsZSkge1xuICAgICAgcHJvcGVydGllcy5zZXQoa2V5LCB2YWx1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHByb3BlcnRpZXMuZGVsZXRlKGtleSk7XG4gICAgfVxuICAgIHRoaXMuX2FwcGx5U2l6ZUNzcyhjc3NGcmllbmRseUNvbHVtbk5hbWUpO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0U3R5bGVTaGVldCgpOiBDU1NTdHlsZVNoZWV0IHtcbiAgICBpZiAoIXRoaXMuX3N0eWxlRWxlbWVudCkge1xuICAgICAgdGhpcy5fc3R5bGVFbGVtZW50ID0gdGhpcy5fZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcbiAgICAgIHRoaXMuX3N0eWxlRWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLl9kb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgnJykpO1xuICAgICAgdGhpcy5fZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZCh0aGlzLl9zdHlsZUVsZW1lbnQpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9zdHlsZUVsZW1lbnQuc2hlZXQgYXMgQ1NTU3R5bGVTaGVldDtcbiAgfVxuXG4gIHByaXZhdGUgX2dldENvbHVtblByb3BlcnRpZXNNYXAoY3NzRnJpZW5kbHlDb2x1bW5OYW1lOiBzdHJpbmcpOiBNYXA8c3RyaW5nLCBzdHJpbmc+IHtcbiAgICBsZXQgcHJvcGVydGllcyA9IHRoaXMuX2NvbHVtblByb3BlcnRpZXMuZ2V0KGNzc0ZyaWVuZGx5Q29sdW1uTmFtZSk7XG4gICAgaWYgKHByb3BlcnRpZXMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcHJvcGVydGllcyA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmc+KCk7XG4gICAgICB0aGlzLl9jb2x1bW5Qcm9wZXJ0aWVzLnNldChjc3NGcmllbmRseUNvbHVtbk5hbWUsIHByb3BlcnRpZXMpO1xuICAgIH1cbiAgICByZXR1cm4gcHJvcGVydGllcztcbiAgfVxuXG4gIHByaXZhdGUgX2FwcGx5U2l6ZUNzcyhjc3NGcmllbmRseUNvbHVtbk5hbWU6IHN0cmluZykge1xuICAgIGNvbnN0IHByb3BlcnRpZXMgPSB0aGlzLl9nZXRDb2x1bW5Qcm9wZXJ0aWVzTWFwKGNzc0ZyaWVuZGx5Q29sdW1uTmFtZSk7XG4gICAgY29uc3QgcHJvcGVydHlLZXlzID0gQXJyYXkuZnJvbShwcm9wZXJ0aWVzLmtleXMoKSk7XG5cbiAgICBsZXQgaW5kZXggPSB0aGlzLl9jb2x1bW5JbmRleGVzLmdldChjc3NGcmllbmRseUNvbHVtbk5hbWUpO1xuICAgIGlmIChpbmRleCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBpZiAoIXByb3BlcnR5S2V5cy5sZW5ndGgpIHtcbiAgICAgICAgLy8gTm90aGluZyB0byBzZXQgb3IgdW5zZXQuXG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaW5kZXggPSB0aGlzLl9pbmRleFNlcXVlbmNlKys7XG4gICAgICB0aGlzLl9jb2x1bW5JbmRleGVzLnNldChjc3NGcmllbmRseUNvbHVtbk5hbWUsIGluZGV4KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fZ2V0U3R5bGVTaGVldCgpLmRlbGV0ZVJ1bGUoaW5kZXgpO1xuICAgIH1cblxuICAgIGNvbnN0IGNvbHVtbkNsYXNzTmFtZSA9IHRoaXMuZ2V0Q29sdW1uQ3NzQ2xhc3MoY3NzRnJpZW5kbHlDb2x1bW5OYW1lKTtcbiAgICBjb25zdCB0YWJsZUNsYXNzTmFtZSA9IHRoaXMuY29sdW1uUmVzaXplLmdldFVuaXF1ZUNzc0NsYXNzKCk7XG5cbiAgICBjb25zdCBzZWxlY3RvciA9IGAuJHt0YWJsZUNsYXNzTmFtZX0gLiR7Y29sdW1uQ2xhc3NOYW1lfWA7XG4gICAgY29uc3QgYm9keSA9IHByb3BlcnR5S2V5cy5tYXAoa2V5ID0+IGAke2tleX06JHtwcm9wZXJ0aWVzLmdldChrZXkpfWApLmpvaW4oJzsnKTtcblxuICAgIHRoaXMuX2dldFN0eWxlU2hlZXQoKS5pbnNlcnRSdWxlKGAke3NlbGVjdG9yfSB7JHtib2R5fX1gLCBpbmRleCEpO1xuICB9XG59XG5cbi8qKiBDb252ZXJ0cyBDU1MgcGl4ZWwgdmFsdWVzIHRvIG51bWJlcnMsIGVnIFwiMTIzcHhcIiB0byAxMjMuIFJldHVybnMgTmFOIGZvciBub24gcGl4ZWwgdmFsdWVzLiAqL1xuZnVuY3Rpb24gY29lcmNlUGl4ZWxzRnJvbUNzc1ZhbHVlKGNzc1ZhbHVlOiBzdHJpbmcpOiBudW1iZXIge1xuICByZXR1cm4gTnVtYmVyKGNzc1ZhbHVlLm1hdGNoKC8oXFxkKylweC8pPy5bMV0pO1xufVxuXG4vKiogR2V0cyB0aGUgc3R5bGUud2lkdGggcGl4ZWxzIG9uIHRoZSBzcGVjaWZpZWQgZWxlbWVudCBpZiBwcmVzZW50LCBvdGhlcndpc2UgaXRzIG9mZnNldFdpZHRoLiAqL1xuZnVuY3Rpb24gZ2V0RWxlbWVudFdpZHRoKGVsZW1lbnQ6IEhUTUxFbGVtZW50KSB7XG4gIC8vIE9wdGltaXphdGlvbjogQ2hlY2sgc3R5bGUud2lkdGggZmlyc3QgYXMgd2UgcHJvYmFibHkgc2V0IGl0IGFscmVhZHkgYmVmb3JlIHJlYWRpbmdcbiAgLy8gb2Zmc2V0V2lkdGggd2hpY2ggdHJpZ2dlcnMgbGF5b3V0LlxuICByZXR1cm4gY29lcmNlUGl4ZWxzRnJvbUNzc1ZhbHVlKGVsZW1lbnQuc3R5bGUud2lkdGgpIHx8IGVsZW1lbnQub2Zmc2V0V2lkdGg7XG59XG5cbi8qKlxuICogQ29udmVydHMgQ1NTIGZsZXggdmFsdWVzIGFzIHNldCBpbiBDZGtGbGV4VGFibGVSZXNpemVTdHJhdGVneSB0byBudW1iZXJzLFxuICogZWcgXCIwIDAuMDEgMTIzcHhcIiB0byAxMjMuXG4gKi9cbmZ1bmN0aW9uIGNvZXJjZVBpeGVsc0Zyb21GbGV4VmFsdWUoZmxleFZhbHVlOiBzdHJpbmd8dW5kZWZpbmVkKTogbnVtYmVyIHtcbiAgcmV0dXJuIE51bWJlcihmbGV4VmFsdWU/Lm1hdGNoKC8wIDBcXC4wMSAoXFxkKylweC8pPy5bMV0pO1xufVxuXG5leHBvcnQgY29uc3QgVEFCTEVfTEFZT1VUX0ZJWEVEX1JFU0laRV9TVFJBVEVHWV9QUk9WSURFUjogUHJvdmlkZXIgPSB7XG4gIHByb3ZpZGU6IFJlc2l6ZVN0cmF0ZWd5LFxuICB1c2VDbGFzczogVGFibGVMYXlvdXRGaXhlZFJlc2l6ZVN0cmF0ZWd5LFxufTtcbmV4cG9ydCBjb25zdCBGTEVYX1JFU0laRV9TVFJBVEVHWV9QUk9WSURFUjogUHJvdmlkZXIgPSB7XG4gIHByb3ZpZGU6IFJlc2l6ZVN0cmF0ZWd5LFxuICB1c2VDbGFzczogQ2RrRmxleFRhYmxlUmVzaXplU3RyYXRlZ3ksXG59O1xuIl19