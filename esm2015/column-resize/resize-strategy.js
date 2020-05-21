/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __decorate, __metadata, __param } from "tslib";
import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { coerceCssPixelValue } from '@angular/cdk/coercion';
import { ColumnResize } from './column-resize';
/**
 * Provides an implementation for resizing a column.
 * The details of how resizing works for tables for flex mat-tables are quite different.
 */
let ResizeStrategy = /** @class */ (() => {
    let ResizeStrategy = class ResizeStrategy {
        /** Adjusts the width of the table element by the specified delta. */
        updateTableWidth(delta) {
            const table = this.columnResize.elementRef.nativeElement;
            const tableWidth = getElementWidth(table);
            table.style.width = coerceCssPixelValue(tableWidth + delta);
        }
    };
    ResizeStrategy = __decorate([
        Injectable()
    ], ResizeStrategy);
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
    let TableLayoutFixedResizeStrategy = class TableLayoutFixedResizeStrategy extends ResizeStrategy {
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
    };
    TableLayoutFixedResizeStrategy = __decorate([
        Injectable(),
        __metadata("design:paramtypes", [ColumnResize])
    ], TableLayoutFixedResizeStrategy);
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
    let CdkFlexTableResizeStrategy = class CdkFlexTableResizeStrategy extends ResizeStrategy {
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
    };
    CdkFlexTableResizeStrategy = __decorate([
        Injectable(),
        __param(1, Inject(DOCUMENT)),
        __metadata("design:paramtypes", [ColumnResize, Object])
    ], CdkFlexTableResizeStrategy);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzaXplLXN0cmF0ZWd5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvY29sdW1uLXJlc2l6ZS9yZXNpemUtc3RyYXRlZ3kudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUVILE9BQU8sRUFBQyxNQUFNLEVBQUUsVUFBVSxFQUFzQixNQUFNLGVBQWUsQ0FBQztBQUN0RSxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDekMsT0FBTyxFQUFDLG1CQUFtQixFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFFMUQsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBRTdDOzs7R0FHRztBQUVIO0lBQUEsSUFBc0IsY0FBYyxHQUFwQyxNQUFzQixjQUFjO1FBc0JsQyxxRUFBcUU7UUFDM0QsZ0JBQWdCLENBQUMsS0FBYTtZQUN0QyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUM7WUFDekQsTUFBTSxVQUFVLEdBQUcsZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBRTFDLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLG1CQUFtQixDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUMsQ0FBQztRQUM5RCxDQUFDO0tBQ0YsQ0FBQTtJQTdCcUIsY0FBYztRQURuQyxVQUFVLEVBQUU7T0FDUyxjQUFjLENBNkJuQztJQUFELHFCQUFDO0tBQUE7U0E3QnFCLGNBQWM7QUErQnBDOzs7Ozs7R0FNRztBQUVIO0lBQUEsSUFBYSw4QkFBOEIsR0FBM0MsTUFBYSw4QkFBK0IsU0FBUSxjQUFjO1FBQ2hFLFlBQStCLFlBQTBCO1lBQ3ZELEtBQUssRUFBRSxDQUFDO1lBRHFCLGlCQUFZLEdBQVosWUFBWSxDQUFjO1FBRXpELENBQUM7UUFFRCxlQUFlLENBQUMsQ0FBUyxFQUFFLFlBQXlC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LHdCQUF3QixDQUFDLFFBQWdCOztJQUNoRCxPQUFPLE1BQU0sT0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQywwQ0FBRyxDQUFDLEVBQUUsQ0FBQztBQUNoRCxDQUFDO0FBRUQsa0dBQWtHO0FBQ2xHLFNBQVMsZUFBZSxDQUFDLE9BQW9CO0lBQzNDLHFGQUFxRjtJQUNyRixxQ0FBcUM7SUFDckMsT0FBTyx3QkFBd0IsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLE9BQU8sQ0FBQyxXQUFXLENBQUM7QUFDOUUsQ0FBQztBQUVEOzs7R0FHRztBQUNILFNBQVMseUJBQXlCLENBQUMsU0FBMkI7O0lBQzVELE9BQU8sTUFBTSxPQUFDLFNBQVMsYUFBVCxTQUFTLHVCQUFULFNBQVMsQ0FBRSxLQUFLLENBQUMsaUJBQWlCLDJDQUFJLENBQUMsRUFBRSxDQUFDO0FBQzFELENBQUM7QUFFRCxNQUFNLENBQUMsTUFBTSwyQ0FBMkMsR0FBYTtJQUNuRSxPQUFPLEVBQUUsY0FBYztJQUN2QixRQUFRLEVBQUUsOEJBQThCO0NBQ3pDLENBQUM7QUFDRixNQUFNLENBQUMsTUFBTSw2QkFBNkIsR0FBYTtJQUNyRCxPQUFPLEVBQUUsY0FBYztJQUN2QixRQUFRLEVBQUUsMEJBQTBCO0NBQ3JDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtJbmplY3QsIEluamVjdGFibGUsIE9uRGVzdHJveSwgUHJvdmlkZXJ9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtET0NVTUVOVH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7Y29lcmNlQ3NzUGl4ZWxWYWx1ZX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvZXJjaW9uJztcblxuaW1wb3J0IHtDb2x1bW5SZXNpemV9IGZyb20gJy4vY29sdW1uLXJlc2l6ZSc7XG5cbi8qKlxuICogUHJvdmlkZXMgYW4gaW1wbGVtZW50YXRpb24gZm9yIHJlc2l6aW5nIGEgY29sdW1uLlxuICogVGhlIGRldGFpbHMgb2YgaG93IHJlc2l6aW5nIHdvcmtzIGZvciB0YWJsZXMgZm9yIGZsZXggbWF0LXRhYmxlcyBhcmUgcXVpdGUgZGlmZmVyZW50LlxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgUmVzaXplU3RyYXRlZ3kge1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgcmVhZG9ubHkgY29sdW1uUmVzaXplOiBDb2x1bW5SZXNpemU7XG5cbiAgLyoqIFVwZGF0ZXMgdGhlIHdpZHRoIG9mIHRoZSBzcGVjaWZpZWQgY29sdW1uLiAqL1xuICBhYnN0cmFjdCBhcHBseUNvbHVtblNpemUoXG4gICAgICBjc3NGcmllbmRseUNvbHVtbk5hbWU6IHN0cmluZyxcbiAgICAgIGNvbHVtbkhlYWRlcjogSFRNTEVsZW1lbnQsXG4gICAgICBzaXplSW5QeDogbnVtYmVyLFxuICAgICAgcHJldmlvdXNTaXplSW5QeD86IG51bWJlcik6IHZvaWQ7XG5cbiAgLyoqIEFwcGxpZXMgYSBtaW5pbXVtIHdpZHRoIHRvIHRoZSBzcGVjaWZpZWQgY29sdW1uLCB1cGRhdGluZyBpdHMgY3VycmVudCB3aWR0aCBhcyBuZWVkZWQuICovXG4gIGFic3RyYWN0IGFwcGx5TWluQ29sdW1uU2l6ZShcbiAgICAgIGNzc0ZyaWVuZGx5Q29sdW1uTmFtZTogc3RyaW5nLFxuICAgICAgY29sdW1uSGVhZGVyOiBIVE1MRWxlbWVudCxcbiAgICAgIG1pblNpemVJblB4OiBudW1iZXIpOiB2b2lkO1xuXG4gIC8qKiBBcHBsaWVzIGEgbWF4aW11bSB3aWR0aCB0byB0aGUgc3BlY2lmaWVkIGNvbHVtbiwgdXBkYXRpbmcgaXRzIGN1cnJlbnQgd2lkdGggYXMgbmVlZGVkLiAqL1xuICBhYnN0cmFjdCBhcHBseU1heENvbHVtblNpemUoXG4gICAgICBjc3NGcmllbmRseUNvbHVtbk5hbWU6IHN0cmluZyxcbiAgICAgIGNvbHVtbkhlYWRlcjogSFRNTEVsZW1lbnQsXG4gICAgICBtaW5TaXplSW5QeDogbnVtYmVyKTogdm9pZDtcblxuICAvKiogQWRqdXN0cyB0aGUgd2lkdGggb2YgdGhlIHRhYmxlIGVsZW1lbnQgYnkgdGhlIHNwZWNpZmllZCBkZWx0YS4gKi9cbiAgcHJvdGVjdGVkIHVwZGF0ZVRhYmxlV2lkdGgoZGVsdGE6IG51bWJlcik6IHZvaWQge1xuICAgIGNvbnN0IHRhYmxlID0gdGhpcy5jb2x1bW5SZXNpemUuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50O1xuICAgIGNvbnN0IHRhYmxlV2lkdGggPSBnZXRFbGVtZW50V2lkdGgodGFibGUpO1xuXG4gICAgdGFibGUuc3R5bGUud2lkdGggPSBjb2VyY2VDc3NQaXhlbFZhbHVlKHRhYmxlV2lkdGggKyBkZWx0YSk7XG4gIH1cbn1cblxuLyoqXG4gKiBUaGUgb3B0aW1pYWxseSBwZXJmb3JtaW5nIHJlc2l6ZSBzdHJhdGVneSBmb3IgJmx0O3RhYmxlJmd0OyBlbGVtZW50cyB3aXRoIHRhYmxlLWxheW91dDogZml4ZWQuXG4gKiBUZXN0ZWQgYWdhaW5zdCBhbmQgb3V0cGVyZm9ybWVkOlxuICogICBDU1Mgc2VsZWN0b3JcbiAqICAgQ1NTIHNlbGVjdG9yIHcvIENTUyB2YXJpYWJsZVxuICogICBVcGRhdGluZyBhbGwgY2VsbCBub2Rlc1xuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgVGFibGVMYXlvdXRGaXhlZFJlc2l6ZVN0cmF0ZWd5IGV4dGVuZHMgUmVzaXplU3RyYXRlZ3kge1xuICBjb25zdHJ1Y3Rvcihwcm90ZWN0ZWQgcmVhZG9ubHkgY29sdW1uUmVzaXplOiBDb2x1bW5SZXNpemUpIHtcbiAgICBzdXBlcigpO1xuICB9XG5cbiAgYXBwbHlDb2x1bW5TaXplKF86IHN0cmluZywgY29sdW1uSGVhZGVyOiBIVE1MRWxlbWVudCwgc2l6ZUluUHg6IG51bWJlcixcbiAgICAgIHByZXZpb3VzU2l6ZUluUHg/OiBudW1iZXIpOiB2b2lkIHtcbiAgICBjb25zdCBkZWx0YSA9IHNpemVJblB4IC0gKHByZXZpb3VzU2l6ZUluUHggPz8gZ2V0RWxlbWVudFdpZHRoKGNvbHVtbkhlYWRlcikpO1xuXG4gICAgY29sdW1uSGVhZGVyLnN0eWxlLndpZHRoID0gY29lcmNlQ3NzUGl4ZWxWYWx1ZShzaXplSW5QeCk7XG5cbiAgICB0aGlzLnVwZGF0ZVRhYmxlV2lkdGgoZGVsdGEpO1xuICB9XG5cbiAgYXBwbHlNaW5Db2x1bW5TaXplKF86IHN0cmluZywgY29sdW1uSGVhZGVyOiBIVE1MRWxlbWVudCwgc2l6ZUluUHg6IG51bWJlcik6IHZvaWQge1xuICAgIGNvbnN0IGN1cnJlbnRXaWR0aCA9IGdldEVsZW1lbnRXaWR0aChjb2x1bW5IZWFkZXIpO1xuICAgIGNvbnN0IG5ld1dpZHRoID0gTWF0aC5tYXgoY3VycmVudFdpZHRoLCBzaXplSW5QeCk7XG5cbiAgICB0aGlzLmFwcGx5Q29sdW1uU2l6ZShfLCBjb2x1bW5IZWFkZXIsIG5ld1dpZHRoLCBjdXJyZW50V2lkdGgpO1xuICB9XG5cbiAgYXBwbHlNYXhDb2x1bW5TaXplKF86IHN0cmluZywgY29sdW1uSGVhZGVyOiBIVE1MRWxlbWVudCwgc2l6ZUluUHg6IG51bWJlcik6IHZvaWQge1xuICAgIGNvbnN0IGN1cnJlbnRXaWR0aCA9IGdldEVsZW1lbnRXaWR0aChjb2x1bW5IZWFkZXIpO1xuICAgIGNvbnN0IG5ld1dpZHRoID0gTWF0aC5taW4oY3VycmVudFdpZHRoLCBzaXplSW5QeCk7XG5cbiAgICB0aGlzLmFwcGx5Q29sdW1uU2l6ZShfLCBjb2x1bW5IZWFkZXIsIG5ld1dpZHRoLCBjdXJyZW50V2lkdGgpO1xuICB9XG59XG5cbi8qKlxuICogVGhlIG9wdGltYWxseSBwZXJmb3JtaW5nIHJlc2l6ZSBzdHJhdGVneSBmb3IgZmxleCBtYXQtdGFibGVzLlxuICogVGVzdGVkIGFnYWluc3QgYW5kIG91dHBlcmZvcm1lZDpcbiAqICAgQ1NTIHNlbGVjdG9yIHcvIENTUyB2YXJpYWJsZVxuICogICBVcGRhdGluZyBhbGwgbWF0LWNlbGwgbm9kZXNcbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIENka0ZsZXhUYWJsZVJlc2l6ZVN0cmF0ZWd5IGV4dGVuZHMgUmVzaXplU3RyYXRlZ3kgaW1wbGVtZW50cyBPbkRlc3Ryb3kge1xuICBwcml2YXRlIHJlYWRvbmx5IF9kb2N1bWVudDogRG9jdW1lbnQ7XG4gIHByaXZhdGUgcmVhZG9ubHkgX2NvbHVtbkluZGV4ZXMgPSBuZXcgTWFwPHN0cmluZywgbnVtYmVyPigpO1xuICBwcml2YXRlIHJlYWRvbmx5IF9jb2x1bW5Qcm9wZXJ0aWVzID0gbmV3IE1hcDxzdHJpbmcsIE1hcDxzdHJpbmcsIHN0cmluZz4+KCk7XG5cbiAgcHJpdmF0ZSBfc3R5bGVFbGVtZW50PzogSFRNTFN0eWxlRWxlbWVudDtcbiAgcHJpdmF0ZSBfaW5kZXhTZXF1ZW5jZSA9IDA7XG5cbiAgcHJvdGVjdGVkIHJlYWRvbmx5IGRlZmF1bHRNaW5TaXplID0gMDtcbiAgcHJvdGVjdGVkIHJlYWRvbmx5IGRlZmF1bHRNYXhTaXplID0gTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVI7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgY29sdW1uUmVzaXplOiBDb2x1bW5SZXNpemUsXG4gICAgICBASW5qZWN0KERPQ1VNRU5UKSBkb2N1bWVudDogYW55KSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLl9kb2N1bWVudCA9IGRvY3VtZW50O1xuICB9XG5cbiAgYXBwbHlDb2x1bW5TaXplKGNzc0ZyaWVuZGx5Q29sdW1uTmFtZTogc3RyaW5nLCBjb2x1bW5IZWFkZXI6IEhUTUxFbGVtZW50LFxuICAgICAgc2l6ZUluUHg6IG51bWJlciwgcHJldmlvdXNTaXplSW5QeD86IG51bWJlcik6IHZvaWQge1xuICAgIC8vIE9wdGltaXphdGlvbjogQ2hlY2sgYXBwbGllZCB3aWR0aCBmaXJzdCBhcyB3ZSBwcm9iYWJseSBzZXQgaXQgYWxyZWFkeSBiZWZvcmUgcmVhZGluZ1xuICAgIC8vIG9mZnNldFdpZHRoIHdoaWNoIHRyaWdnZXJzIGxheW91dC5cbiAgICBjb25zdCBkZWx0YSA9IHNpemVJblB4IC0gKHByZXZpb3VzU2l6ZUluUHggPz9cbiAgICAgICAgKHRoaXMuX2dldEFwcGxpZWRXaWR0aChjc3NGcmllbmRseUNvbHVtbk5hbWUpIHx8IGNvbHVtbkhlYWRlci5vZmZzZXRXaWR0aCkpO1xuXG4gICAgY29uc3QgY3NzU2l6ZSA9IGNvZXJjZUNzc1BpeGVsVmFsdWUoc2l6ZUluUHgpO1xuXG4gICAgdGhpcy5fYXBwbHlQcm9wZXJ0eShjc3NGcmllbmRseUNvbHVtbk5hbWUsICdmbGV4JywgYDAgMC4wMSAke2Nzc1NpemV9YCk7XG4gICAgdGhpcy51cGRhdGVUYWJsZVdpZHRoKGRlbHRhKTtcbiAgfVxuXG4gIGFwcGx5TWluQ29sdW1uU2l6ZShjc3NGcmllbmRseUNvbHVtbk5hbWU6IHN0cmluZywgXzogSFRNTEVsZW1lbnQsIHNpemVJblB4OiBudW1iZXIpOiB2b2lkIHtcbiAgICBjb25zdCBjc3NTaXplID0gY29lcmNlQ3NzUGl4ZWxWYWx1ZShzaXplSW5QeCk7XG5cbiAgICB0aGlzLl9hcHBseVByb3BlcnR5KGNzc0ZyaWVuZGx5Q29sdW1uTmFtZSwgJ21pbi13aWR0aCcsIGNzc1NpemUsXG4gICAgICAgIHNpemVJblB4ICE9PSB0aGlzLmRlZmF1bHRNaW5TaXplKTtcbiAgfVxuXG4gIGFwcGx5TWF4Q29sdW1uU2l6ZShjc3NGcmllbmRseUNvbHVtbk5hbWU6IHN0cmluZywgXzogSFRNTEVsZW1lbnQsIHNpemVJblB4OiBudW1iZXIpOiB2b2lkIHtcbiAgICBjb25zdCBjc3NTaXplID0gY29lcmNlQ3NzUGl4ZWxWYWx1ZShzaXplSW5QeCk7XG5cbiAgICB0aGlzLl9hcHBseVByb3BlcnR5KGNzc0ZyaWVuZGx5Q29sdW1uTmFtZSwgJ21heC13aWR0aCcsIGNzc1NpemUsXG4gICAgICAgIHNpemVJblB4ICE9PSB0aGlzLmRlZmF1bHRNYXhTaXplKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBnZXRDb2x1bW5Dc3NDbGFzcyhjc3NGcmllbmRseUNvbHVtbk5hbWU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGBjZGstY29sdW1uLSR7Y3NzRnJpZW5kbHlDb2x1bW5OYW1lfWA7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICAvLyBUT0RPOiBVc2UgcmVtb3ZlKCkgb25jZSB3ZSdyZSBvZmYgSUUxMS5cbiAgICBpZiAodGhpcy5fc3R5bGVFbGVtZW50ICYmIHRoaXMuX3N0eWxlRWxlbWVudC5wYXJlbnROb2RlKSB7XG4gICAgICB0aGlzLl9zdHlsZUVsZW1lbnQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzLl9zdHlsZUVsZW1lbnQpO1xuICAgICAgdGhpcy5fc3R5bGVFbGVtZW50ID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2dldFByb3BlcnR5VmFsdWUoY3NzRnJpZW5kbHlDb2x1bW5OYW1lOiBzdHJpbmcsIGtleTogc3RyaW5nKTogc3RyaW5nfHVuZGVmaW5lZCB7XG4gICAgY29uc3QgcHJvcGVydGllcyA9IHRoaXMuX2dldENvbHVtblByb3BlcnRpZXNNYXAoY3NzRnJpZW5kbHlDb2x1bW5OYW1lKTtcbiAgICByZXR1cm4gcHJvcGVydGllcy5nZXQoa2V5KTtcbiAgfVxuXG4gIHByaXZhdGUgX2dldEFwcGxpZWRXaWR0aChjc3NGcmllbmRzbHlDb2x1bW5OYW1lOiBzdHJpbmcpOiBudW1iZXIge1xuICAgIHJldHVybiBjb2VyY2VQaXhlbHNGcm9tRmxleFZhbHVlKHRoaXMuX2dldFByb3BlcnR5VmFsdWUoY3NzRnJpZW5kc2x5Q29sdW1uTmFtZSwgJ2ZsZXgnKSk7XG4gIH1cblxuICBwcml2YXRlIF9hcHBseVByb3BlcnR5KFxuICAgICAgY3NzRnJpZW5kbHlDb2x1bW5OYW1lOiBzdHJpbmcsXG4gICAgICBrZXk6IHN0cmluZyxcbiAgICAgIHZhbHVlOiBzdHJpbmcsXG4gICAgICBlbmFibGUgPSB0cnVlKTogdm9pZCB7XG4gICAgY29uc3QgcHJvcGVydGllcyA9IHRoaXMuX2dldENvbHVtblByb3BlcnRpZXNNYXAoY3NzRnJpZW5kbHlDb2x1bW5OYW1lKTtcblxuICAgIGlmIChlbmFibGUpIHtcbiAgICAgIHByb3BlcnRpZXMuc2V0KGtleSwgdmFsdWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBwcm9wZXJ0aWVzLmRlbGV0ZShrZXkpO1xuICAgIH1cbiAgICB0aGlzLl9hcHBseVNpemVDc3MoY3NzRnJpZW5kbHlDb2x1bW5OYW1lKTtcbiAgfVxuXG4gIHByaXZhdGUgX2dldFN0eWxlU2hlZXQoKTogQ1NTU3R5bGVTaGVldCB7XG4gICAgaWYgKCF0aGlzLl9zdHlsZUVsZW1lbnQpIHtcbiAgICAgIHRoaXMuX3N0eWxlRWxlbWVudCA9IHRoaXMuX2RvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XG4gICAgICB0aGlzLl9zdHlsZUVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5fZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoJycpKTtcbiAgICAgIHRoaXMuX2RvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQodGhpcy5fc3R5bGVFbGVtZW50KTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fc3R5bGVFbGVtZW50LnNoZWV0IGFzIENTU1N0eWxlU2hlZXQ7XG4gIH1cblxuICBwcml2YXRlIF9nZXRDb2x1bW5Qcm9wZXJ0aWVzTWFwKGNzc0ZyaWVuZGx5Q29sdW1uTmFtZTogc3RyaW5nKTogTWFwPHN0cmluZywgc3RyaW5nPiB7XG4gICAgbGV0IHByb3BlcnRpZXMgPSB0aGlzLl9jb2x1bW5Qcm9wZXJ0aWVzLmdldChjc3NGcmllbmRseUNvbHVtbk5hbWUpO1xuICAgIGlmIChwcm9wZXJ0aWVzID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHByb3BlcnRpZXMgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nPigpO1xuICAgICAgdGhpcy5fY29sdW1uUHJvcGVydGllcy5zZXQoY3NzRnJpZW5kbHlDb2x1bW5OYW1lLCBwcm9wZXJ0aWVzKTtcbiAgICB9XG4gICAgcmV0dXJuIHByb3BlcnRpZXM7XG4gIH1cblxuICBwcml2YXRlIF9hcHBseVNpemVDc3MoY3NzRnJpZW5kbHlDb2x1bW5OYW1lOiBzdHJpbmcpIHtcbiAgICBjb25zdCBwcm9wZXJ0aWVzID0gdGhpcy5fZ2V0Q29sdW1uUHJvcGVydGllc01hcChjc3NGcmllbmRseUNvbHVtbk5hbWUpO1xuICAgIGNvbnN0IHByb3BlcnR5S2V5cyA9IEFycmF5LmZyb20ocHJvcGVydGllcy5rZXlzKCkpO1xuXG4gICAgbGV0IGluZGV4ID0gdGhpcy5fY29sdW1uSW5kZXhlcy5nZXQoY3NzRnJpZW5kbHlDb2x1bW5OYW1lKTtcbiAgICBpZiAoaW5kZXggPT09IHVuZGVmaW5lZCkge1xuICAgICAgaWYgKCFwcm9wZXJ0eUtleXMubGVuZ3RoKSB7XG4gICAgICAgIC8vIE5vdGhpbmcgdG8gc2V0IG9yIHVuc2V0LlxuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGluZGV4ID0gdGhpcy5faW5kZXhTZXF1ZW5jZSsrO1xuICAgICAgdGhpcy5fY29sdW1uSW5kZXhlcy5zZXQoY3NzRnJpZW5kbHlDb2x1bW5OYW1lLCBpbmRleCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2dldFN0eWxlU2hlZXQoKS5kZWxldGVSdWxlKGluZGV4KTtcbiAgICB9XG5cbiAgICBjb25zdCBjb2x1bW5DbGFzc05hbWUgPSB0aGlzLmdldENvbHVtbkNzc0NsYXNzKGNzc0ZyaWVuZGx5Q29sdW1uTmFtZSk7XG4gICAgY29uc3QgdGFibGVDbGFzc05hbWUgPSB0aGlzLmNvbHVtblJlc2l6ZS5nZXRVbmlxdWVDc3NDbGFzcygpO1xuXG4gICAgY29uc3Qgc2VsZWN0b3IgPSBgLiR7dGFibGVDbGFzc05hbWV9IC4ke2NvbHVtbkNsYXNzTmFtZX1gO1xuICAgIGNvbnN0IGJvZHkgPSBwcm9wZXJ0eUtleXMubWFwKGtleSA9PiBgJHtrZXl9OiR7cHJvcGVydGllcy5nZXQoa2V5KX1gKS5qb2luKCc7Jyk7XG5cbiAgICB0aGlzLl9nZXRTdHlsZVNoZWV0KCkuaW5zZXJ0UnVsZShgJHtzZWxlY3Rvcn0geyR7Ym9keX19YCwgaW5kZXghKTtcbiAgfVxufVxuXG4vKiogQ29udmVydHMgQ1NTIHBpeGVsIHZhbHVlcyB0byBudW1iZXJzLCBlZyBcIjEyM3B4XCIgdG8gMTIzLiBSZXR1cm5zIE5hTiBmb3Igbm9uIHBpeGVsIHZhbHVlcy4gKi9cbmZ1bmN0aW9uIGNvZXJjZVBpeGVsc0Zyb21Dc3NWYWx1ZShjc3NWYWx1ZTogc3RyaW5nKTogbnVtYmVyIHtcbiAgcmV0dXJuIE51bWJlcihjc3NWYWx1ZS5tYXRjaCgvKFxcZCspcHgvKT8uWzFdKTtcbn1cblxuLyoqIEdldHMgdGhlIHN0eWxlLndpZHRoIHBpeGVscyBvbiB0aGUgc3BlY2lmaWVkIGVsZW1lbnQgaWYgcHJlc2VudCwgb3RoZXJ3aXNlIGl0cyBvZmZzZXRXaWR0aC4gKi9cbmZ1bmN0aW9uIGdldEVsZW1lbnRXaWR0aChlbGVtZW50OiBIVE1MRWxlbWVudCkge1xuICAvLyBPcHRpbWl6YXRpb246IENoZWNrIHN0eWxlLndpZHRoIGZpcnN0IGFzIHdlIHByb2JhYmx5IHNldCBpdCBhbHJlYWR5IGJlZm9yZSByZWFkaW5nXG4gIC8vIG9mZnNldFdpZHRoIHdoaWNoIHRyaWdnZXJzIGxheW91dC5cbiAgcmV0dXJuIGNvZXJjZVBpeGVsc0Zyb21Dc3NWYWx1ZShlbGVtZW50LnN0eWxlLndpZHRoKSB8fCBlbGVtZW50Lm9mZnNldFdpZHRoO1xufVxuXG4vKipcbiAqIENvbnZlcnRzIENTUyBmbGV4IHZhbHVlcyBhcyBzZXQgaW4gQ2RrRmxleFRhYmxlUmVzaXplU3RyYXRlZ3kgdG8gbnVtYmVycyxcbiAqIGVnIFwiMCAwLjAxIDEyM3B4XCIgdG8gMTIzLlxuICovXG5mdW5jdGlvbiBjb2VyY2VQaXhlbHNGcm9tRmxleFZhbHVlKGZsZXhWYWx1ZTogc3RyaW5nfHVuZGVmaW5lZCk6IG51bWJlciB7XG4gIHJldHVybiBOdW1iZXIoZmxleFZhbHVlPy5tYXRjaCgvMCAwXFwuMDEgKFxcZCspcHgvKT8uWzFdKTtcbn1cblxuZXhwb3J0IGNvbnN0IFRBQkxFX0xBWU9VVF9GSVhFRF9SRVNJWkVfU1RSQVRFR1lfUFJPVklERVI6IFByb3ZpZGVyID0ge1xuICBwcm92aWRlOiBSZXNpemVTdHJhdGVneSxcbiAgdXNlQ2xhc3M6IFRhYmxlTGF5b3V0Rml4ZWRSZXNpemVTdHJhdGVneSxcbn07XG5leHBvcnQgY29uc3QgRkxFWF9SRVNJWkVfU1RSQVRFR1lfUFJPVklERVI6IFByb3ZpZGVyID0ge1xuICBwcm92aWRlOiBSZXNpemVTdHJhdGVneSxcbiAgdXNlQ2xhc3M6IENka0ZsZXhUYWJsZVJlc2l6ZVN0cmF0ZWd5LFxufTtcbiJdfQ==