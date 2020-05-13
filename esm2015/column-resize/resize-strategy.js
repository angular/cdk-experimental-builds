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
}
ResizeStrategy.decorators = [
    { type: Injectable }
];
if (false) {
    /**
     * @abstract
     * @param {?} cssFriendlyColumnName
     * @param {?} columnHeader
     * @param {?} sizeInPx
     * @return {?}
     */
    ResizeStrategy.prototype.applyColumnSize = function (cssFriendlyColumnName, columnHeader, sizeInPx) { };
    /**
     * @abstract
     * @param {?} cssFriendlyColumnName
     * @param {?} columnHeader
     * @param {?} minSizeInPx
     * @return {?}
     */
    ResizeStrategy.prototype.applyMinColumnSize = function (cssFriendlyColumnName, columnHeader, minSizeInPx) { };
    /**
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
     * @param {?} _
     * @param {?} columnHeader
     * @param {?} sizeInPx
     * @return {?}
     */
    applyColumnSize(_, columnHeader, sizeInPx) {
        columnHeader.style.width = coerceCssPixelValue(sizeInPx);
    }
    /**
     * @param {?} _
     * @param {?} columnHeader
     * @param {?} sizeInPx
     * @return {?}
     */
    applyMinColumnSize(_, columnHeader, sizeInPx) {
        columnHeader.style.minWidth = coerceCssPixelValue(sizeInPx);
    }
    /**
     * @return {?}
     */
    applyMaxColumnSize() {
        // Intentionally omitted as max-width causes strange rendering issues in Chrome.
        // Max size will still apply when the user is resizing this column.
    }
}
TableLayoutFixedResizeStrategy.decorators = [
    { type: Injectable }
];
/**
 * The optimally performing resize strategy for flex mat-tables.
 * Tested against and outperformed:
 *   CSS selector w/ CSS variable
 *   Updating all mat-cell nodes
 */
export class CdkFlexTableResizeStrategy extends ResizeStrategy {
    /**
     * @param {?} _columnResize
     * @param {?} document
     */
    constructor(_columnResize, document) {
        super();
        this._columnResize = _columnResize;
        this._columnIndexes = new Map();
        this._columnProperties = new Map();
        this._indexSequence = 0;
        this.defaultMinSize = 0;
        this.defaultMaxSize = Number.MAX_SAFE_INTEGER;
        this._document = document;
    }
    /**
     * @param {?} cssFriendlyColumnName
     * @param {?} _
     * @param {?} sizeInPx
     * @return {?}
     */
    applyColumnSize(cssFriendlyColumnName, _, sizeInPx) {
        /** @type {?} */
        const cssSize = coerceCssPixelValue(sizeInPx);
        this._applyProperty(cssFriendlyColumnName, 'flex', `0 0.01 ${cssSize}`);
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
        const tableClassName = this._columnResize.getUniqueCssClass();
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
     * @private
     */
    CdkFlexTableResizeStrategy.prototype._columnResize;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzaXplLXN0cmF0ZWd5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvY29sdW1uLXJlc2l6ZS9yZXNpemUtc3RyYXRlZ3kudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBUUEsT0FBTyxFQUFDLE1BQU0sRUFBRSxVQUFVLEVBQXNCLE1BQU0sZUFBZSxDQUFDO0FBQ3RFLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUN6QyxPQUFPLEVBQUMsbUJBQW1CLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUUxRCxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0saUJBQWlCLENBQUM7Ozs7OztBQU83QyxNQUFNLE9BQWdCLGNBQWM7OztZQURuQyxVQUFVOzs7Ozs7Ozs7O0lBRVQsd0dBRzRCOzs7Ozs7OztJQUU1Qiw4R0FHK0I7Ozs7Ozs7O0lBRS9CLDhHQUcrQjs7Ozs7Ozs7O0FBV2pDLE1BQU0sT0FBTyw4QkFBK0IsU0FBUSxjQUFjOzs7Ozs7O0lBQ2hFLGVBQWUsQ0FBQyxDQUFTLEVBQUUsWUFBeUIsRUFBRSxRQUFnQjtRQUNwRSxZQUFZLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxtQkFBbUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUMzRCxDQUFDOzs7Ozs7O0lBRUQsa0JBQWtCLENBQUMsQ0FBUyxFQUFFLFlBQXlCLEVBQUUsUUFBZ0I7UUFDdkUsWUFBWSxDQUFDLEtBQUssQ0FBQyxRQUFRLEdBQUcsbUJBQW1CLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDOUQsQ0FBQzs7OztJQUVELGtCQUFrQjtRQUNoQixnRkFBZ0Y7UUFDaEYsbUVBQW1FO0lBQ3JFLENBQUM7OztZQWJGLFVBQVU7Ozs7Ozs7O0FBdUJYLE1BQU0sT0FBTywwQkFBMkIsU0FBUSxjQUFjOzs7OztJQVc1RCxZQUNxQixhQUEyQixFQUMxQixRQUFhO1FBQ2pDLEtBQUssRUFB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LEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQztRQUUvRSxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUMsVUFBVSxDQUFDLEdBQUcsUUFBUSxLQUFLLElBQUksR0FBRyxFQUFFLG1CQUFBLEtBQUssRUFBQyxDQUFDLENBQUM7SUFDcEUsQ0FBQzs7O1lBN0dGLFVBQVU7Ozs7WUFyREgsWUFBWTs0Q0FtRWIsTUFBTSxTQUFDLFFBQVE7Ozs7Ozs7SUFacEIsK0NBQXFDOzs7OztJQUNyQyxvREFBNEQ7Ozs7O0lBQzVELHVEQUE0RTs7Ozs7SUFFNUUsbURBQXlDOzs7OztJQUN6QyxvREFBMkI7Ozs7O0lBRTNCLG9EQUFzQzs7Ozs7SUFDdEMsb0RBQTREOzs7OztJQUd4RCxtREFBNEM7OztBQW1HbEQsTUFBTSxPQUFPLDJDQUEyQyxHQUFhO0lBQ25FLE9BQU8sRUFBRSxjQUFjO0lBQ3ZCLFFBQVEsRUFBRSw4QkFBOEI7Q0FDekM7O0FBQ0QsTUFBTSxPQUFPLDZCQUE2QixHQUFhO0lBQ3JELE9BQU8sRUFBRSxjQUFjO0lBQ3ZCLFFBQVEsRUFBRSwwQkFBMEI7Q0FDckMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtJbmplY3QsIEluamVjdGFibGUsIE9uRGVzdHJveSwgUHJvdmlkZXJ9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtET0NVTUVOVH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7Y29lcmNlQ3NzUGl4ZWxWYWx1ZX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvZXJjaW9uJztcblxuaW1wb3J0IHtDb2x1bW5SZXNpemV9IGZyb20gJy4vY29sdW1uLXJlc2l6ZSc7XG5cbi8qKlxuICogUHJvdmlkZXMgYW4gaW1wbGVtZW50YXRpb24gZm9yIHJlc2l6aW5nIGEgY29sdW1uLlxuICogVGhlIGRldGFpbHMgb2YgaG93IHJlc2l6aW5nIHdvcmtzIGZvciB0YWJsZXMgZm9yIGZsZXggbWF0LXRhYmxlcyBhcmUgcXVpdGUgZGlmZmVyZW50LlxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgUmVzaXplU3RyYXRlZ3kge1xuICBhYnN0cmFjdCBhcHBseUNvbHVtblNpemUoXG4gICAgICBjc3NGcmllbmRseUNvbHVtbk5hbWU6IHN0cmluZyxcbiAgICAgIGNvbHVtbkhlYWRlcjogSFRNTEVsZW1lbnQsXG4gICAgICBzaXplSW5QeDogbnVtYmVyKTogdm9pZDtcblxuICBhYnN0cmFjdCBhcHBseU1pbkNvbHVtblNpemUoXG4gICAgICBjc3NGcmllbmRseUNvbHVtbk5hbWU6IHN0cmluZyxcbiAgICAgIGNvbHVtbkhlYWRlcjogSFRNTEVsZW1lbnQsXG4gICAgICBtaW5TaXplSW5QeDogbnVtYmVyKTogdm9pZDtcblxuICBhYnN0cmFjdCBhcHBseU1heENvbHVtblNpemUoXG4gICAgICBjc3NGcmllbmRseUNvbHVtbk5hbWU6IHN0cmluZyxcbiAgICAgIGNvbHVtbkhlYWRlcjogSFRNTEVsZW1lbnQsXG4gICAgICBtaW5TaXplSW5QeDogbnVtYmVyKTogdm9pZDtcbn1cblxuLyoqXG4gKiBUaGUgb3B0aW1pYWxseSBwZXJmb3JtaW5nIHJlc2l6ZSBzdHJhdGVneSBmb3IgJmx0O3RhYmxlJmd0OyBlbGVtZW50cyB3aXRoIHRhYmxlLWxheW91dDogZml4ZWQuXG4gKiBUZXN0ZWQgYWdhaW5zdCBhbmQgb3V0cGVyZm9ybWVkOlxuICogICBDU1Mgc2VsZWN0b3JcbiAqICAgQ1NTIHNlbGVjdG9yIHcvIENTUyB2YXJpYWJsZVxuICogICBVcGRhdGluZyBhbGwgY2VsbCBub2Rlc1xuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgVGFibGVMYXlvdXRGaXhlZFJlc2l6ZVN0cmF0ZWd5IGV4dGVuZHMgUmVzaXplU3RyYXRlZ3kge1xuICBhcHBseUNvbHVtblNpemUoXzogc3RyaW5nLCBjb2x1bW5IZWFkZXI6IEhUTUxFbGVtZW50LCBzaXplSW5QeDogbnVtYmVyKTogdm9pZCB7XG4gICAgY29sdW1uSGVhZGVyLnN0eWxlLndpZHRoID0gY29lcmNlQ3NzUGl4ZWxWYWx1ZShzaXplSW5QeCk7XG4gIH1cblxuICBhcHBseU1pbkNvbHVtblNpemUoXzogc3RyaW5nLCBjb2x1bW5IZWFkZXI6IEhUTUxFbGVtZW50LCBzaXplSW5QeDogbnVtYmVyKTogdm9pZCB7XG4gICAgY29sdW1uSGVhZGVyLnN0eWxlLm1pbldpZHRoID0gY29lcmNlQ3NzUGl4ZWxWYWx1ZShzaXplSW5QeCk7XG4gIH1cblxuICBhcHBseU1heENvbHVtblNpemUoKTogdm9pZCB7XG4gICAgLy8gSW50ZW50aW9uYWxseSBvbWl0dGVkIGFzIG1heC13aWR0aCBjYXVzZXMgc3RyYW5nZSByZW5kZXJpbmcgaXNzdWVzIGluIENocm9tZS5cbiAgICAvLyBNYXggc2l6ZSB3aWxsIHN0aWxsIGFwcGx5IHdoZW4gdGhlIHVzZXIgaXMgcmVzaXppbmcgdGhpcyBjb2x1bW4uXG4gIH1cbn1cblxuLyoqXG4gKiBUaGUgb3B0aW1hbGx5IHBlcmZvcm1pbmcgcmVzaXplIHN0cmF0ZWd5IGZvciBmbGV4IG1hdC10YWJsZXMuXG4gKiBUZXN0ZWQgYWdhaW5zdCBhbmQgb3V0cGVyZm9ybWVkOlxuICogICBDU1Mgc2VsZWN0b3Igdy8gQ1NTIHZhcmlhYmxlXG4gKiAgIFVwZGF0aW5nIGFsbCBtYXQtY2VsbCBub2Rlc1xuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgQ2RrRmxleFRhYmxlUmVzaXplU3RyYXRlZ3kgZXh0ZW5kcyBSZXNpemVTdHJhdGVneSBpbXBsZW1lbnRzIE9uRGVzdHJveSB7XG4gIHByaXZhdGUgcmVhZG9ubHkgX2RvY3VtZW50OiBEb2N1bWVudDtcbiAgcHJpdmF0ZSByZWFkb25seSBfY29sdW1uSW5kZXhlcyA9IG5ldyBNYXA8c3RyaW5nLCBudW1iZXI+KCk7XG4gIHByaXZhdGUgcmVhZG9ubHkgX2NvbHVtblByb3BlcnRpZXMgPSBuZXcgTWFwPHN0cmluZywgTWFwPHN0cmluZywgc3RyaW5nPj4oKTtcblxuICBwcml2YXRlIF9zdHlsZUVsZW1lbnQ/OiBIVE1MU3R5bGVFbGVtZW50O1xuICBwcml2YXRlIF9pbmRleFNlcXVlbmNlID0gMDtcblxuICBwcm90ZWN0ZWQgcmVhZG9ubHkgZGVmYXVsdE1pblNpemUgPSAwO1xuICBwcm90ZWN0ZWQgcmVhZG9ubHkgZGVmYXVsdE1heFNpemUgPSBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgcmVhZG9ubHkgX2NvbHVtblJlc2l6ZTogQ29sdW1uUmVzaXplLFxuICAgICAgQEluamVjdChET0NVTUVOVCkgZG9jdW1lbnQ6IGFueSkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5fZG9jdW1lbnQgPSBkb2N1bWVudDtcbiAgfVxuXG4gIGFwcGx5Q29sdW1uU2l6ZShjc3NGcmllbmRseUNvbHVtbk5hbWU6IHN0cmluZywgXzogSFRNTEVsZW1lbnQsIHNpemVJblB4OiBudW1iZXIpOiB2b2lkIHtcbiAgICBjb25zdCBjc3NTaXplID0gY29lcmNlQ3NzUGl4ZWxWYWx1ZShzaXplSW5QeCk7XG5cbiAgICB0aGlzLl9hcHBseVByb3BlcnR5KGNzc0ZyaWVuZGx5Q29sdW1uTmFtZSwgJ2ZsZXgnLCBgMCAwLjAxICR7Y3NzU2l6ZX1gKTtcbiAgfVxuXG4gIGFwcGx5TWluQ29sdW1uU2l6ZShjc3NGcmllbmRseUNvbHVtbk5hbWU6IHN0cmluZywgXzogSFRNTEVsZW1lbnQsIHNpemVJblB4OiBudW1iZXIpOiB2b2lkIHtcbiAgICBjb25zdCBjc3NTaXplID0gY29lcmNlQ3NzUGl4ZWxWYWx1ZShzaXplSW5QeCk7XG5cbiAgICB0aGlzLl9hcHBseVByb3BlcnR5KGNzc0ZyaWVuZGx5Q29sdW1uTmFtZSwgJ21pbi13aWR0aCcsIGNzc1NpemUsXG4gICAgICAgIHNpemVJblB4ICE9PSB0aGlzLmRlZmF1bHRNaW5TaXplKTtcbiAgfVxuXG4gIGFwcGx5TWF4Q29sdW1uU2l6ZShjc3NGcmllbmRseUNvbHVtbk5hbWU6IHN0cmluZywgXzogSFRNTEVsZW1lbnQsIHNpemVJblB4OiBudW1iZXIpOiB2b2lkIHtcbiAgICBjb25zdCBjc3NTaXplID0gY29lcmNlQ3NzUGl4ZWxWYWx1ZShzaXplSW5QeCk7XG5cbiAgICB0aGlzLl9hcHBseVByb3BlcnR5KGNzc0ZyaWVuZGx5Q29sdW1uTmFtZSwgJ21heC13aWR0aCcsIGNzc1NpemUsXG4gICAgICAgIHNpemVJblB4ICE9PSB0aGlzLmRlZmF1bHRNYXhTaXplKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBnZXRDb2x1bW5Dc3NDbGFzcyhjc3NGcmllbmRseUNvbHVtbk5hbWU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGBjZGstY29sdW1uLSR7Y3NzRnJpZW5kbHlDb2x1bW5OYW1lfWA7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICAvLyBUT0RPOiBVc2UgcmVtb3ZlKCkgb25jZSB3ZSdyZSBvZmYgSUUxMS5cbiAgICBpZiAodGhpcy5fc3R5bGVFbGVtZW50ICYmIHRoaXMuX3N0eWxlRWxlbWVudC5wYXJlbnROb2RlKSB7XG4gICAgICB0aGlzLl9zdHlsZUVsZW1lbnQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzLl9zdHlsZUVsZW1lbnQpO1xuICAgICAgdGhpcy5fc3R5bGVFbGVtZW50ID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2FwcGx5UHJvcGVydHkoXG4gICAgICBjc3NGcmllbmRseUNvbHVtbk5hbWU6IHN0cmluZyxcbiAgICAgIGtleTogc3RyaW5nLFxuICAgICAgdmFsdWU6IHN0cmluZyxcbiAgICAgIGVuYWJsZSA9IHRydWUpOiB2b2lkIHtcbiAgICBjb25zdCBwcm9wZXJ0aWVzID0gdGhpcy5fZ2V0Q29sdW1uUHJvcGVydGllc01hcChjc3NGcmllbmRseUNvbHVtbk5hbWUpO1xuXG4gICAgaWYgKGVuYWJsZSkge1xuICAgICAgcHJvcGVydGllcy5zZXQoa2V5LCB2YWx1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHByb3BlcnRpZXMuZGVsZXRlKGtleSk7XG4gICAgfVxuICAgIHRoaXMuX2FwcGx5U2l6ZUNzcyhjc3NGcmllbmRseUNvbHVtbk5hbWUpO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0U3R5bGVTaGVldCgpOiBDU1NTdHlsZVNoZWV0IHtcbiAgICBpZiAoIXRoaXMuX3N0eWxlRWxlbWVudCkge1xuICAgICAgdGhpcy5fc3R5bGVFbGVtZW50ID0gdGhpcy5fZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcbiAgICAgIHRoaXMuX3N0eWxlRWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLl9kb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgnJykpO1xuICAgICAgdGhpcy5fZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZCh0aGlzLl9zdHlsZUVsZW1lbnQpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9zdHlsZUVsZW1lbnQuc2hlZXQgYXMgQ1NTU3R5bGVTaGVldDtcbiAgfVxuXG4gIHByaXZhdGUgX2dldENvbHVtblByb3BlcnRpZXNNYXAoY3NzRnJpZW5kbHlDb2x1bW5OYW1lOiBzdHJpbmcpOiBNYXA8c3RyaW5nLCBzdHJpbmc+IHtcbiAgICBsZXQgcHJvcGVydGllcyA9IHRoaXMuX2NvbHVtblByb3BlcnRpZXMuZ2V0KGNzc0ZyaWVuZGx5Q29sdW1uTmFtZSk7XG4gICAgaWYgKHByb3BlcnRpZXMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcHJvcGVydGllcyA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmc+KCk7XG4gICAgICB0aGlzLl9jb2x1bW5Qcm9wZXJ0aWVzLnNldChjc3NGcmllbmRseUNvbHVtbk5hbWUsIHByb3BlcnRpZXMpO1xuICAgIH1cbiAgICByZXR1cm4gcHJvcGVydGllcztcbiAgfVxuXG4gIHByaXZhdGUgX2FwcGx5U2l6ZUNzcyhjc3NGcmllbmRseUNvbHVtbk5hbWU6IHN0cmluZykge1xuICAgIGNvbnN0IHByb3BlcnRpZXMgPSB0aGlzLl9nZXRDb2x1bW5Qcm9wZXJ0aWVzTWFwKGNzc0ZyaWVuZGx5Q29sdW1uTmFtZSk7XG4gICAgY29uc3QgcHJvcGVydHlLZXlzID0gQXJyYXkuZnJvbShwcm9wZXJ0aWVzLmtleXMoKSk7XG5cbiAgICBsZXQgaW5kZXggPSB0aGlzLl9jb2x1bW5JbmRleGVzLmdldChjc3NGcmllbmRseUNvbHVtbk5hbWUpO1xuICAgIGlmIChpbmRleCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBpZiAoIXByb3BlcnR5S2V5cy5sZW5ndGgpIHtcbiAgICAgICAgLy8gTm90aGluZyB0byBzZXQgb3IgdW5zZXQuXG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaW5kZXggPSB0aGlzLl9pbmRleFNlcXVlbmNlKys7XG4gICAgICB0aGlzLl9jb2x1bW5JbmRleGVzLnNldChjc3NGcmllbmRseUNvbHVtbk5hbWUsIGluZGV4KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fZ2V0U3R5bGVTaGVldCgpLmRlbGV0ZVJ1bGUoaW5kZXgpO1xuICAgIH1cblxuICAgIGNvbnN0IGNvbHVtbkNsYXNzTmFtZSA9IHRoaXMuZ2V0Q29sdW1uQ3NzQ2xhc3MoY3NzRnJpZW5kbHlDb2x1bW5OYW1lKTtcbiAgICBjb25zdCB0YWJsZUNsYXNzTmFtZSA9IHRoaXMuX2NvbHVtblJlc2l6ZS5nZXRVbmlxdWVDc3NDbGFzcygpO1xuXG4gICAgY29uc3Qgc2VsZWN0b3IgPSBgLiR7dGFibGVDbGFzc05hbWV9IC4ke2NvbHVtbkNsYXNzTmFtZX1gO1xuICAgIGNvbnN0IGJvZHkgPSBwcm9wZXJ0eUtleXMubWFwKGtleSA9PiBgJHtrZXl9OiR7cHJvcGVydGllcy5nZXQoa2V5KX1gKS5qb2luKCc7Jyk7XG5cbiAgICB0aGlzLl9nZXRTdHlsZVNoZWV0KCkuaW5zZXJ0UnVsZShgJHtzZWxlY3Rvcn0geyR7Ym9keX19YCwgaW5kZXghKTtcbiAgfVxufVxuXG5leHBvcnQgY29uc3QgVEFCTEVfTEFZT1VUX0ZJWEVEX1JFU0laRV9TVFJBVEVHWV9QUk9WSURFUjogUHJvdmlkZXIgPSB7XG4gIHByb3ZpZGU6IFJlc2l6ZVN0cmF0ZWd5LFxuICB1c2VDbGFzczogVGFibGVMYXlvdXRGaXhlZFJlc2l6ZVN0cmF0ZWd5LFxufTtcbmV4cG9ydCBjb25zdCBGTEVYX1JFU0laRV9TVFJBVEVHWV9QUk9WSURFUjogUHJvdmlkZXIgPSB7XG4gIHByb3ZpZGU6IFJlc2l6ZVN0cmF0ZWd5LFxuICB1c2VDbGFzczogQ2RrRmxleFRhYmxlUmVzaXplU3RyYXRlZ3ksXG59O1xuIl19