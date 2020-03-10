/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __extends } from "tslib";
import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { coerceCssPixelValue } from '@angular/cdk/coercion';
import { ColumnResize } from './column-resize';
/**
 * Provides an implementation for resizing a column.
 * The details of how resizing works for tables for flex mat-tables are quite different.
 */
var ResizeStrategy = /** @class */ (function () {
    function ResizeStrategy() {
    }
    ResizeStrategy.decorators = [
        { type: Injectable }
    ];
    return ResizeStrategy;
}());
export { ResizeStrategy };
/**
 * The optimially performing resize strategy for &lt;table&gt; elements with table-layout: fixed.
 * Tested against and outperformed:
 *   CSS selector
 *   CSS selector w/ CSS variable
 *   Updating all cell nodes
 */
var TableLayoutFixedResizeStrategy = /** @class */ (function (_super) {
    __extends(TableLayoutFixedResizeStrategy, _super);
    function TableLayoutFixedResizeStrategy() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TableLayoutFixedResizeStrategy.prototype.applyColumnSize = function (_, columnHeader, sizeInPx) {
        columnHeader.style.width = coerceCssPixelValue(sizeInPx);
    };
    TableLayoutFixedResizeStrategy.prototype.applyMinColumnSize = function (_, columnHeader, sizeInPx) {
        columnHeader.style.minWidth = coerceCssPixelValue(sizeInPx);
    };
    TableLayoutFixedResizeStrategy.prototype.applyMaxColumnSize = function () {
        // Intentionally omitted as max-width causes strange rendering issues in Chrome.
        // Max size will still apply when the user is resizing this column.
    };
    TableLayoutFixedResizeStrategy.decorators = [
        { type: Injectable }
    ];
    return TableLayoutFixedResizeStrategy;
}(ResizeStrategy));
export { TableLayoutFixedResizeStrategy };
/**
 * The optimally performing resize strategy for flex mat-tables.
 * Tested against and outperformed:
 *   CSS selector w/ CSS variable
 *   Updating all mat-cell nodes
 */
var CdkFlexTableResizeStrategy = /** @class */ (function (_super) {
    __extends(CdkFlexTableResizeStrategy, _super);
    function CdkFlexTableResizeStrategy(_columnResize, document) {
        var _this = _super.call(this) || this;
        _this._columnResize = _columnResize;
        _this._columnIndexes = new Map();
        _this._columnProperties = new Map();
        _this._indexSequence = 0;
        _this.defaultMinSize = 0;
        _this.defaultMaxSize = Number.MAX_SAFE_INTEGER;
        _this._document = document;
        return _this;
    }
    CdkFlexTableResizeStrategy.prototype.applyColumnSize = function (cssFriendlyColumnName, _, sizeInPx) {
        var cssSize = coerceCssPixelValue(sizeInPx);
        this._applyProperty(cssFriendlyColumnName, 'flex', "0 0.01 " + cssSize);
    };
    CdkFlexTableResizeStrategy.prototype.applyMinColumnSize = function (cssFriendlyColumnName, _, sizeInPx) {
        var cssSize = coerceCssPixelValue(sizeInPx);
        this._applyProperty(cssFriendlyColumnName, 'min-width', cssSize, sizeInPx !== this.defaultMinSize);
    };
    CdkFlexTableResizeStrategy.prototype.applyMaxColumnSize = function (cssFriendlyColumnName, _, sizeInPx) {
        var cssSize = coerceCssPixelValue(sizeInPx);
        this._applyProperty(cssFriendlyColumnName, 'max-width', cssSize, sizeInPx !== this.defaultMaxSize);
    };
    CdkFlexTableResizeStrategy.prototype.getColumnCssClass = function (cssFriendlyColumnName) {
        return "cdk-column-" + cssFriendlyColumnName;
    };
    CdkFlexTableResizeStrategy.prototype.ngOnDestroy = function () {
        // TODO: Use remove() once we're off IE11.
        if (this._styleElement && this._styleElement.parentNode) {
            this._styleElement.parentNode.removeChild(this._styleElement);
            this._styleElement = undefined;
        }
    };
    CdkFlexTableResizeStrategy.prototype._applyProperty = function (cssFriendlyColumnName, key, value, enable) {
        if (enable === void 0) { enable = true; }
        var properties = this._getColumnPropertiesMap(cssFriendlyColumnName);
        if (enable) {
            properties.set(key, value);
        }
        else {
            properties.delete(key);
        }
        this._applySizeCss(cssFriendlyColumnName);
    };
    CdkFlexTableResizeStrategy.prototype._getStyleSheet = function () {
        if (!this._styleElement) {
            this._styleElement = this._document.createElement('style');
            this._styleElement.appendChild(this._document.createTextNode(''));
            this._document.head.appendChild(this._styleElement);
        }
        return this._styleElement.sheet;
    };
    CdkFlexTableResizeStrategy.prototype._getColumnPropertiesMap = function (cssFriendlyColumnName) {
        var properties = this._columnProperties.get(cssFriendlyColumnName);
        if (properties === undefined) {
            properties = new Map();
            this._columnProperties.set(cssFriendlyColumnName, properties);
        }
        return properties;
    };
    CdkFlexTableResizeStrategy.prototype._applySizeCss = function (cssFriendlyColumnName) {
        var properties = this._getColumnPropertiesMap(cssFriendlyColumnName);
        var propertyKeys = Array.from(properties.keys());
        var index = this._columnIndexes.get(cssFriendlyColumnName);
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
        var columnClassName = this.getColumnCssClass(cssFriendlyColumnName);
        var tableClassName = this._columnResize.getUniqueCssClass();
        var selector = "." + tableClassName + " ." + columnClassName;
        var body = propertyKeys.map(function (key) { return key + ":" + properties.get(key); }).join(';');
        this._getStyleSheet().insertRule(selector + " {" + body + "}", index);
    };
    CdkFlexTableResizeStrategy.decorators = [
        { type: Injectable }
    ];
    /** @nocollapse */
    CdkFlexTableResizeStrategy.ctorParameters = function () { return [
        { type: ColumnResize },
        { type: undefined, decorators: [{ type: Inject, args: [DOCUMENT,] }] }
    ]; };
    return CdkFlexTableResizeStrategy;
}(ResizeStrategy));
export { CdkFlexTableResizeStrategy };
export var TABLE_LAYOUT_FIXED_RESIZE_STRATEGY_PROVIDER = {
    provide: ResizeStrategy,
    useClass: TableLayoutFixedResizeStrategy,
};
export var FLEX_RESIZE_STRATEGY_PROVIDER = {
    provide: ResizeStrategy,
    useClass: CdkFlexTableResizeStrategy,
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzaXplLXN0cmF0ZWd5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvY29sdW1uLXJlc2l6ZS9yZXNpemUtc3RyYXRlZ3kudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUVILE9BQU8sRUFBQyxNQUFNLEVBQUUsVUFBVSxFQUFzQixNQUFNLGVBQWUsQ0FBQztBQUN0RSxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDekMsT0FBTyxFQUFDLG1CQUFtQixFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFFMUQsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBRTdDOzs7R0FHRztBQUNIO0lBQUE7SUFnQkEsQ0FBQzs7Z0JBaEJBLFVBQVU7O0lBZ0JYLHFCQUFDO0NBQUEsQUFoQkQsSUFnQkM7U0FmcUIsY0FBYztBQWlCcEM7Ozs7OztHQU1HO0FBQ0g7SUFDb0Qsa0RBQWM7SUFEbEU7O0lBY0EsQ0FBQztJQVpDLHdEQUFlLEdBQWYsVUFBZ0IsQ0FBUyxFQUFFLFlBQXlCLEVBQUUsUUFBZ0I7UUFDcEUsWUFBWSxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsbUJBQW1CLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDM0QsQ0FBQztJQUVELDJEQUFrQixHQUFsQixVQUFtQixDQUFTLEVBQUUsWUFBeUIsRUFBRSxRQUFnQjtRQUN2RSxZQUFZLENBQUMsS0FBSyxDQUFDLFFBQVEsR0FBRyxtQkFBbUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUM5RCxDQUFDO0lBRUQsMkRBQWtCLEdBQWxCO1FBQ0UsZ0ZBQWdGO1FBQ2hGLG1FQUFtRTtJQUNyRSxDQUFDOztnQkFiRixVQUFVOztJQWNYLHFDQUFDO0NBQUEsQUFkRCxDQUNvRCxjQUFjLEdBYWpFO1NBYlksOEJBQThCO0FBZTNDOzs7OztHQUtHO0FBQ0g7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YUFBYSxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFFOUQsSUFBTSxRQUFRLEdBQUcsTUFBSSxjQUFjLFVBQUssZUFBaUIsQ0FBQztRQUMxRCxJQUFNLElBQUksR0FBRyxZQUFZLENBQUMsR0FBRyxDQUFDLFVBQUEsR0FBRyxJQUFJLE9BQUcsR0FBRyxTQUFJLFVBQVUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFHLEVBQS9CLENBQStCLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFaEYsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDLFVBQVUsQ0FBSSxRQUFRLFVBQUssSUFBSSxNQUFHLEVBQUUsS0FBTSxDQUFDLENBQUM7SUFDcEUsQ0FBQzs7Z0JBN0dGLFVBQVU7Ozs7Z0JBckRILFlBQVk7Z0RBbUViLE1BQU0sU0FBQyxRQUFROztJQWdHdEIsaUNBQUM7Q0FBQSxBQTlHRCxDQUNnRCxjQUFjLEdBNkc3RDtTQTdHWSwwQkFBMEI7QUErR3ZDLE1BQU0sQ0FBQyxJQUFNLDJDQUEyQyxHQUFhO0lBQ25FLE9BQU8sRUFBRSxjQUFjO0lBQ3ZCLFFBQVEsRUFBRSw4QkFBOEI7Q0FDekMsQ0FBQztBQUNGLE1BQU0sQ0FBQyxJQUFNLDZCQUE2QixHQUFhO0lBQ3JELE9BQU8sRUFBRSxjQUFjO0lBQ3ZCLFFBQVEsRUFBRSwwQkFBMEI7Q0FDckMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0luamVjdCwgSW5qZWN0YWJsZSwgT25EZXN0cm95LCBQcm92aWRlcn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0RPQ1VNRU5UfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHtjb2VyY2VDc3NQaXhlbFZhbHVlfSBmcm9tICdAYW5ndWxhci9jZGsvY29lcmNpb24nO1xuXG5pbXBvcnQge0NvbHVtblJlc2l6ZX0gZnJvbSAnLi9jb2x1bW4tcmVzaXplJztcblxuLyoqXG4gKiBQcm92aWRlcyBhbiBpbXBsZW1lbnRhdGlvbiBmb3IgcmVzaXppbmcgYSBjb2x1bW4uXG4gKiBUaGUgZGV0YWlscyBvZiBob3cgcmVzaXppbmcgd29ya3MgZm9yIHRhYmxlcyBmb3IgZmxleCBtYXQtdGFibGVzIGFyZSBxdWl0ZSBkaWZmZXJlbnQuXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBSZXNpemVTdHJhdGVneSB7XG4gIGFic3RyYWN0IGFwcGx5Q29sdW1uU2l6ZShcbiAgICAgIGNzc0ZyaWVuZGx5Q29sdW1uTmFtZTogc3RyaW5nLFxuICAgICAgY29sdW1uSGVhZGVyOiBIVE1MRWxlbWVudCxcbiAgICAgIHNpemVJblB4OiBudW1iZXIpOiB2b2lkO1xuXG4gIGFic3RyYWN0IGFwcGx5TWluQ29sdW1uU2l6ZShcbiAgICAgIGNzc0ZyaWVuZGx5Q29sdW1uTmFtZTogc3RyaW5nLFxuICAgICAgY29sdW1uSGVhZGVyOiBIVE1MRWxlbWVudCxcbiAgICAgIG1pblNpemVJblB4OiBudW1iZXIpOiB2b2lkO1xuXG4gIGFic3RyYWN0IGFwcGx5TWF4Q29sdW1uU2l6ZShcbiAgICAgIGNzc0ZyaWVuZGx5Q29sdW1uTmFtZTogc3RyaW5nLFxuICAgICAgY29sdW1uSGVhZGVyOiBIVE1MRWxlbWVudCxcbiAgICAgIG1pblNpemVJblB4OiBudW1iZXIpOiB2b2lkO1xufVxuXG4vKipcbiAqIFRoZSBvcHRpbWlhbGx5IHBlcmZvcm1pbmcgcmVzaXplIHN0cmF0ZWd5IGZvciAmbHQ7dGFibGUmZ3Q7IGVsZW1lbnRzIHdpdGggdGFibGUtbGF5b3V0OiBmaXhlZC5cbiAqIFRlc3RlZCBhZ2FpbnN0IGFuZCBvdXRwZXJmb3JtZWQ6XG4gKiAgIENTUyBzZWxlY3RvclxuICogICBDU1Mgc2VsZWN0b3Igdy8gQ1NTIHZhcmlhYmxlXG4gKiAgIFVwZGF0aW5nIGFsbCBjZWxsIG5vZGVzXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBUYWJsZUxheW91dEZpeGVkUmVzaXplU3RyYXRlZ3kgZXh0ZW5kcyBSZXNpemVTdHJhdGVneSB7XG4gIGFwcGx5Q29sdW1uU2l6ZShfOiBzdHJpbmcsIGNvbHVtbkhlYWRlcjogSFRNTEVsZW1lbnQsIHNpemVJblB4OiBudW1iZXIpOiB2b2lkIHtcbiAgICBjb2x1bW5IZWFkZXIuc3R5bGUud2lkdGggPSBjb2VyY2VDc3NQaXhlbFZhbHVlKHNpemVJblB4KTtcbiAgfVxuXG4gIGFwcGx5TWluQ29sdW1uU2l6ZShfOiBzdHJpbmcsIGNvbHVtbkhlYWRlcjogSFRNTEVsZW1lbnQsIHNpemVJblB4OiBudW1iZXIpOiB2b2lkIHtcbiAgICBjb2x1bW5IZWFkZXIuc3R5bGUubWluV2lkdGggPSBjb2VyY2VDc3NQaXhlbFZhbHVlKHNpemVJblB4KTtcbiAgfVxuXG4gIGFwcGx5TWF4Q29sdW1uU2l6ZSgpOiB2b2lkIHtcbiAgICAvLyBJbnRlbnRpb25hbGx5IG9taXR0ZWQgYXMgbWF4LXdpZHRoIGNhdXNlcyBzdHJhbmdlIHJlbmRlcmluZyBpc3N1ZXMgaW4gQ2hyb21lLlxuICAgIC8vIE1heCBzaXplIHdpbGwgc3RpbGwgYXBwbHkgd2hlbiB0aGUgdXNlciBpcyByZXNpemluZyB0aGlzIGNvbHVtbi5cbiAgfVxufVxuXG4vKipcbiAqIFRoZSBvcHRpbWFsbHkgcGVyZm9ybWluZyByZXNpemUgc3RyYXRlZ3kgZm9yIGZsZXggbWF0LXRhYmxlcy5cbiAqIFRlc3RlZCBhZ2FpbnN0IGFuZCBvdXRwZXJmb3JtZWQ6XG4gKiAgIENTUyBzZWxlY3RvciB3LyBDU1MgdmFyaWFibGVcbiAqICAgVXBkYXRpbmcgYWxsIG1hdC1jZWxsIG5vZGVzXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBDZGtGbGV4VGFibGVSZXNpemVTdHJhdGVneSBleHRlbmRzIFJlc2l6ZVN0cmF0ZWd5IGltcGxlbWVudHMgT25EZXN0cm95IHtcbiAgcHJpdmF0ZSByZWFkb25seSBfZG9jdW1lbnQ6IERvY3VtZW50O1xuICBwcml2YXRlIHJlYWRvbmx5IF9jb2x1bW5JbmRleGVzID0gbmV3IE1hcDxzdHJpbmcsIG51bWJlcj4oKTtcbiAgcHJpdmF0ZSByZWFkb25seSBfY29sdW1uUHJvcGVydGllcyA9IG5ldyBNYXA8c3RyaW5nLCBNYXA8c3RyaW5nLCBzdHJpbmc+PigpO1xuXG4gIHByaXZhdGUgX3N0eWxlRWxlbWVudD86IEhUTUxTdHlsZUVsZW1lbnQ7XG4gIHByaXZhdGUgX2luZGV4U2VxdWVuY2UgPSAwO1xuXG4gIHByb3RlY3RlZCByZWFkb25seSBkZWZhdWx0TWluU2l6ZSA9IDA7XG4gIHByb3RlY3RlZCByZWFkb25seSBkZWZhdWx0TWF4U2l6ZSA9IE51bWJlci5NQVhfU0FGRV9JTlRFR0VSO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSByZWFkb25seSBfY29sdW1uUmVzaXplOiBDb2x1bW5SZXNpemUsXG4gICAgICBASW5qZWN0KERPQ1VNRU5UKSBkb2N1bWVudDogYW55KSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLl9kb2N1bWVudCA9IGRvY3VtZW50O1xuICB9XG5cbiAgYXBwbHlDb2x1bW5TaXplKGNzc0ZyaWVuZGx5Q29sdW1uTmFtZTogc3RyaW5nLCBfOiBIVE1MRWxlbWVudCwgc2l6ZUluUHg6IG51bWJlcik6IHZvaWQge1xuICAgIGNvbnN0IGNzc1NpemUgPSBjb2VyY2VDc3NQaXhlbFZhbHVlKHNpemVJblB4KTtcblxuICAgIHRoaXMuX2FwcGx5UHJvcGVydHkoY3NzRnJpZW5kbHlDb2x1bW5OYW1lLCAnZmxleCcsIGAwIDAuMDEgJHtjc3NTaXplfWApO1xuICB9XG5cbiAgYXBwbHlNaW5Db2x1bW5TaXplKGNzc0ZyaWVuZGx5Q29sdW1uTmFtZTogc3RyaW5nLCBfOiBIVE1MRWxlbWVudCwgc2l6ZUluUHg6IG51bWJlcik6IHZvaWQge1xuICAgIGNvbnN0IGNzc1NpemUgPSBjb2VyY2VDc3NQaXhlbFZhbHVlKHNpemVJblB4KTtcblxuICAgIHRoaXMuX2FwcGx5UHJvcGVydHkoY3NzRnJpZW5kbHlDb2x1bW5OYW1lLCAnbWluLXdpZHRoJywgY3NzU2l6ZSxcbiAgICAgICAgc2l6ZUluUHggIT09IHRoaXMuZGVmYXVsdE1pblNpemUpO1xuICB9XG5cbiAgYXBwbHlNYXhDb2x1bW5TaXplKGNzc0ZyaWVuZGx5Q29sdW1uTmFtZTogc3RyaW5nLCBfOiBIVE1MRWxlbWVudCwgc2l6ZUluUHg6IG51bWJlcik6IHZvaWQge1xuICAgIGNvbnN0IGNzc1NpemUgPSBjb2VyY2VDc3NQaXhlbFZhbHVlKHNpemVJblB4KTtcblxuICAgIHRoaXMuX2FwcGx5UHJvcGVydHkoY3NzRnJpZW5kbHlDb2x1bW5OYW1lLCAnbWF4LXdpZHRoJywgY3NzU2l6ZSxcbiAgICAgICAgc2l6ZUluUHggIT09IHRoaXMuZGVmYXVsdE1heFNpemUpO1xuICB9XG5cbiAgcHJvdGVjdGVkIGdldENvbHVtbkNzc0NsYXNzKGNzc0ZyaWVuZGx5Q29sdW1uTmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYGNkay1jb2x1bW4tJHtjc3NGcmllbmRseUNvbHVtbk5hbWV9YDtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIC8vIFRPRE86IFVzZSByZW1vdmUoKSBvbmNlIHdlJ3JlIG9mZiBJRTExLlxuICAgIGlmICh0aGlzLl9zdHlsZUVsZW1lbnQgJiYgdGhpcy5fc3R5bGVFbGVtZW50LnBhcmVudE5vZGUpIHtcbiAgICAgIHRoaXMuX3N0eWxlRWxlbWVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMuX3N0eWxlRWxlbWVudCk7XG4gICAgICB0aGlzLl9zdHlsZUVsZW1lbnQgPSB1bmRlZmluZWQ7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfYXBwbHlQcm9wZXJ0eShcbiAgICAgIGNzc0ZyaWVuZGx5Q29sdW1uTmFtZTogc3RyaW5nLFxuICAgICAga2V5OiBzdHJpbmcsXG4gICAgICB2YWx1ZTogc3RyaW5nLFxuICAgICAgZW5hYmxlID0gdHJ1ZSk6IHZvaWQge1xuICAgIGNvbnN0IHByb3BlcnRpZXMgPSB0aGlzLl9nZXRDb2x1bW5Qcm9wZXJ0aWVzTWFwKGNzc0ZyaWVuZGx5Q29sdW1uTmFtZSk7XG5cbiAgICBpZiAoZW5hYmxlKSB7XG4gICAgICBwcm9wZXJ0aWVzLnNldChrZXksIHZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcHJvcGVydGllcy5kZWxldGUoa2V5KTtcbiAgICB9XG4gICAgdGhpcy5fYXBwbHlTaXplQ3NzKGNzc0ZyaWVuZGx5Q29sdW1uTmFtZSk7XG4gIH1cblxuICBwcml2YXRlIF9nZXRTdHlsZVNoZWV0KCk6IENTU1N0eWxlU2hlZXQge1xuICAgIGlmICghdGhpcy5fc3R5bGVFbGVtZW50KSB7XG4gICAgICB0aGlzLl9zdHlsZUVsZW1lbnQgPSB0aGlzLl9kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuICAgICAgdGhpcy5fc3R5bGVFbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuX2RvY3VtZW50LmNyZWF0ZVRleHROb2RlKCcnKSk7XG4gICAgICB0aGlzLl9kb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHRoaXMuX3N0eWxlRWxlbWVudCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX3N0eWxlRWxlbWVudC5zaGVldCBhcyBDU1NTdHlsZVNoZWV0O1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0Q29sdW1uUHJvcGVydGllc01hcChjc3NGcmllbmRseUNvbHVtbk5hbWU6IHN0cmluZyk6IE1hcDxzdHJpbmcsIHN0cmluZz4ge1xuICAgIGxldCBwcm9wZXJ0aWVzID0gdGhpcy5fY29sdW1uUHJvcGVydGllcy5nZXQoY3NzRnJpZW5kbHlDb2x1bW5OYW1lKTtcbiAgICBpZiAocHJvcGVydGllcyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBwcm9wZXJ0aWVzID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZz4oKTtcbiAgICAgIHRoaXMuX2NvbHVtblByb3BlcnRpZXMuc2V0KGNzc0ZyaWVuZGx5Q29sdW1uTmFtZSwgcHJvcGVydGllcyk7XG4gICAgfVxuICAgIHJldHVybiBwcm9wZXJ0aWVzO1xuICB9XG5cbiAgcHJpdmF0ZSBfYXBwbHlTaXplQ3NzKGNzc0ZyaWVuZGx5Q29sdW1uTmFtZTogc3RyaW5nKSB7XG4gICAgY29uc3QgcHJvcGVydGllcyA9IHRoaXMuX2dldENvbHVtblByb3BlcnRpZXNNYXAoY3NzRnJpZW5kbHlDb2x1bW5OYW1lKTtcbiAgICBjb25zdCBwcm9wZXJ0eUtleXMgPSBBcnJheS5mcm9tKHByb3BlcnRpZXMua2V5cygpKTtcblxuICAgIGxldCBpbmRleCA9IHRoaXMuX2NvbHVtbkluZGV4ZXMuZ2V0KGNzc0ZyaWVuZGx5Q29sdW1uTmFtZSk7XG4gICAgaWYgKGluZGV4ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGlmICghcHJvcGVydHlLZXlzLmxlbmd0aCkge1xuICAgICAgICAvLyBOb3RoaW5nIHRvIHNldCBvciB1bnNldC5cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpbmRleCA9IHRoaXMuX2luZGV4U2VxdWVuY2UrKztcbiAgICAgIHRoaXMuX2NvbHVtbkluZGV4ZXMuc2V0KGNzc0ZyaWVuZGx5Q29sdW1uTmFtZSwgaW5kZXgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9nZXRTdHlsZVNoZWV0KCkuZGVsZXRlUnVsZShpbmRleCk7XG4gICAgfVxuXG4gICAgY29uc3QgY29sdW1uQ2xhc3NOYW1lID0gdGhpcy5nZXRDb2x1bW5Dc3NDbGFzcyhjc3NGcmllbmRseUNvbHVtbk5hbWUpO1xuICAgIGNvbnN0IHRhYmxlQ2xhc3NOYW1lID0gdGhpcy5fY29sdW1uUmVzaXplLmdldFVuaXF1ZUNzc0NsYXNzKCk7XG5cbiAgICBjb25zdCBzZWxlY3RvciA9IGAuJHt0YWJsZUNsYXNzTmFtZX0gLiR7Y29sdW1uQ2xhc3NOYW1lfWA7XG4gICAgY29uc3QgYm9keSA9IHByb3BlcnR5S2V5cy5tYXAoa2V5ID0+IGAke2tleX06JHtwcm9wZXJ0aWVzLmdldChrZXkpfWApLmpvaW4oJzsnKTtcblxuICAgIHRoaXMuX2dldFN0eWxlU2hlZXQoKS5pbnNlcnRSdWxlKGAke3NlbGVjdG9yfSB7JHtib2R5fX1gLCBpbmRleCEpO1xuICB9XG59XG5cbmV4cG9ydCBjb25zdCBUQUJMRV9MQVlPVVRfRklYRURfUkVTSVpFX1NUUkFURUdZX1BST1ZJREVSOiBQcm92aWRlciA9IHtcbiAgcHJvdmlkZTogUmVzaXplU3RyYXRlZ3ksXG4gIHVzZUNsYXNzOiBUYWJsZUxheW91dEZpeGVkUmVzaXplU3RyYXRlZ3ksXG59O1xuZXhwb3J0IGNvbnN0IEZMRVhfUkVTSVpFX1NUUkFURUdZX1BST1ZJREVSOiBQcm92aWRlciA9IHtcbiAgcHJvdmlkZTogUmVzaXplU3RyYXRlZ3ksXG4gIHVzZUNsYXNzOiBDZGtGbGV4VGFibGVSZXNpemVTdHJhdGVneSxcbn07XG4iXX0=