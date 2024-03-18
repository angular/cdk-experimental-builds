/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Inject, Injectable, CSP_NONCE, Optional } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { coerceCssPixelValue } from '@angular/cdk/coercion';
import { CdkTable, _CoalescedStyleScheduler, _COALESCED_STYLE_SCHEDULER } from '@angular/cdk/table';
import { ColumnResize } from './column-resize';
import * as i0 from "@angular/core";
import * as i1 from "./column-resize";
import * as i2 from "@angular/cdk/table";
/**
 * Provides an implementation for resizing a column.
 * The details of how resizing works for tables for flex mat-tables are quite different.
 */
export class ResizeStrategy {
    constructor() {
        this._pendingResizeDelta = null;
    }
    /** Adjusts the width of the table element by the specified delta. */
    updateTableWidthAndStickyColumns(delta) {
        if (this._pendingResizeDelta === null) {
            const tableElement = this.columnResize.elementRef.nativeElement;
            const tableWidth = getElementWidth(tableElement);
            this.styleScheduler.schedule(() => {
                tableElement.style.width = coerceCssPixelValue(tableWidth + this._pendingResizeDelta);
                this._pendingResizeDelta = null;
            });
            this.styleScheduler.scheduleEnd(() => {
                this.table.updateStickyColumnStyles();
            });
        }
        this._pendingResizeDelta = (this._pendingResizeDelta ?? 0) + delta;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.0-next.0", ngImport: i0, type: ResizeStrategy, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.0.0-next.0", ngImport: i0, type: ResizeStrategy }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.0-next.0", ngImport: i0, type: ResizeStrategy, decorators: [{
            type: Injectable
        }] });
/**
 * The optimally performing resize strategy for &lt;table&gt; elements with table-layout: fixed.
 * Tested against and outperformed:
 *   CSS selector
 *   CSS selector w/ CSS variable
 *   Updating all cell nodes
 */
export class TableLayoutFixedResizeStrategy extends ResizeStrategy {
    constructor(columnResize, styleScheduler, table) {
        super();
        this.columnResize = columnResize;
        this.styleScheduler = styleScheduler;
        this.table = table;
    }
    applyColumnSize(_, columnHeader, sizeInPx, previousSizeInPx) {
        const delta = sizeInPx - (previousSizeInPx ?? getElementWidth(columnHeader));
        if (delta === 0) {
            return;
        }
        this.styleScheduler.schedule(() => {
            columnHeader.style.width = coerceCssPixelValue(sizeInPx);
        });
        this.updateTableWidthAndStickyColumns(delta);
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.0-next.0", ngImport: i0, type: TableLayoutFixedResizeStrategy, deps: [{ token: i1.ColumnResize }, { token: _COALESCED_STYLE_SCHEDULER }, { token: i2.CdkTable }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.0.0-next.0", ngImport: i0, type: TableLayoutFixedResizeStrategy }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.0-next.0", ngImport: i0, type: TableLayoutFixedResizeStrategy, decorators: [{
            type: Injectable
        }], ctorParameters: () => [{ type: i1.ColumnResize }, { type: i2._CoalescedStyleScheduler, decorators: [{
                    type: Inject,
                    args: [_COALESCED_STYLE_SCHEDULER]
                }] }, { type: i2.CdkTable }] });
/**
 * The optimally performing resize strategy for flex mat-tables.
 * Tested against and outperformed:
 *   CSS selector w/ CSS variable
 *   Updating all mat-cell nodes
 */
export class CdkFlexTableResizeStrategy extends ResizeStrategy {
    constructor(columnResize, styleScheduler, table, document, _nonce) {
        super();
        this.columnResize = columnResize;
        this.styleScheduler = styleScheduler;
        this.table = table;
        this._nonce = _nonce;
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
        const delta = sizeInPx -
            (previousSizeInPx ??
                (this._getAppliedWidth(cssFriendlyColumnName) || columnHeader.offsetWidth));
        if (delta === 0) {
            return;
        }
        const cssSize = coerceCssPixelValue(sizeInPx);
        this._applyProperty(cssFriendlyColumnName, 'flex', `0 0.01 ${cssSize}`);
        this.updateTableWidthAndStickyColumns(delta);
    }
    applyMinColumnSize(cssFriendlyColumnName, _, sizeInPx) {
        const cssSize = coerceCssPixelValue(sizeInPx);
        this._applyProperty(cssFriendlyColumnName, 'min-width', cssSize, sizeInPx !== this.defaultMinSize);
        this.updateTableWidthAndStickyColumns(0);
    }
    applyMaxColumnSize(cssFriendlyColumnName, _, sizeInPx) {
        const cssSize = coerceCssPixelValue(sizeInPx);
        this._applyProperty(cssFriendlyColumnName, 'max-width', cssSize, sizeInPx !== this.defaultMaxSize);
        this.updateTableWidthAndStickyColumns(0);
    }
    getColumnCssClass(cssFriendlyColumnName) {
        return `cdk-column-${cssFriendlyColumnName}`;
    }
    ngOnDestroy() {
        this._styleElement?.remove();
        this._styleElement = undefined;
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
        this.styleScheduler.schedule(() => {
            if (enable) {
                properties.set(key, value);
            }
            else {
                properties.delete(key);
            }
            this._applySizeCss(cssFriendlyColumnName);
        });
    }
    _getStyleSheet() {
        if (!this._styleElement) {
            this._styleElement = this._document.createElement('style');
            if (this._nonce) {
                this._styleElement.nonce = this._nonce;
            }
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.0-next.0", ngImport: i0, type: CdkFlexTableResizeStrategy, deps: [{ token: i1.ColumnResize }, { token: _COALESCED_STYLE_SCHEDULER }, { token: i2.CdkTable }, { token: DOCUMENT }, { token: CSP_NONCE, optional: true }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.0.0-next.0", ngImport: i0, type: CdkFlexTableResizeStrategy }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.0-next.0", ngImport: i0, type: CdkFlexTableResizeStrategy, decorators: [{
            type: Injectable
        }], ctorParameters: () => [{ type: i1.ColumnResize }, { type: i2._CoalescedStyleScheduler, decorators: [{
                    type: Inject,
                    args: [_COALESCED_STYLE_SCHEDULER]
                }] }, { type: i2.CdkTable }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [DOCUMENT]
                }] }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [CSP_NONCE]
                }, {
                    type: Optional
                }] }] });
/** Converts CSS pixel values to numbers, eg "123px" to 123. Returns NaN for non pixel values. */
function coercePixelsFromCssValue(cssValue) {
    return Number(cssValue.match(/(\d+)px/)?.[1]);
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
    return Number(flexValue?.match(/0 0\.01 (\d+)px/)?.[1]);
}
export const TABLE_LAYOUT_FIXED_RESIZE_STRATEGY_PROVIDER = {
    provide: ResizeStrategy,
    useClass: TableLayoutFixedResizeStrategy,
};
export const FLEX_RESIZE_STRATEGY_PROVIDER = {
    provide: ResizeStrategy,
    useClass: CdkFlexTableResizeStrategy,
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzaXplLXN0cmF0ZWd5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvY29sdW1uLXJlc2l6ZS9yZXNpemUtc3RyYXRlZ3kudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLE1BQU0sRUFBRSxVQUFVLEVBQXVCLFNBQVMsRUFBRSxRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDM0YsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQ3pDLE9BQU8sRUFBQyxtQkFBbUIsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQzFELE9BQU8sRUFBQyxRQUFRLEVBQUUsd0JBQXdCLEVBQUUsMEJBQTBCLEVBQUMsTUFBTSxvQkFBb0IsQ0FBQztBQUVsRyxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0saUJBQWlCLENBQUM7Ozs7QUFFN0M7OztHQUdHO0FBRUgsTUFBTSxPQUFnQixjQUFjO0lBRHBDO1FBTVUsd0JBQW1CLEdBQWtCLElBQUksQ0FBQztLQTJDbkQ7SUFuQkMscUVBQXFFO0lBQzNELGdDQUFnQyxDQUFDLEtBQWE7UUFDdEQsSUFBSSxJQUFJLENBQUMsbUJBQW1CLEtBQUssSUFBSSxFQUFFLENBQUM7WUFDdEMsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDO1lBQ2hFLE1BQU0sVUFBVSxHQUFHLGVBQWUsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUVqRCxJQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUU7Z0JBQ2hDLFlBQVksQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLG1CQUFtQixDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsbUJBQW9CLENBQUMsQ0FBQztnQkFFdkYsSUFBSSxDQUFDLG1CQUFtQixHQUFHLElBQUksQ0FBQztZQUNsQyxDQUFD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OzJCQUFDLFFBQVE7OzBCQUNmLE1BQU07MkJBQUMsU0FBUzs7MEJBQUcsUUFBUTs7QUE0SWhDLGlHQUFpRztBQUNqRyxTQUFTLHdCQUF3QixDQUFDLFFBQWdCO0lBQ2hELE9BQU8sTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2hELENBQUM7QUFFRCxrR0FBa0c7QUFDbEcsU0FBUyxlQUFlLENBQUMsT0FBb0I7SUFDM0MscUZBQXFGO0lBQ3JGLHFDQUFxQztJQUNyQyxPQUFPLHdCQUF3QixDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksT0FBTyxDQUFDLFdBQVcsQ0FBQztBQUM5RSxDQUFDO0FBRUQ7OztHQUdHO0FBQ0gsU0FBUyx5QkFBeUIsQ0FBQyxTQUE2QjtJQUM5RCxPQUFPLE1BQU0sQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLGlCQUFpQixDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzFELENBQUM7QUFFRCxNQUFNLENBQUMsTUFBTSwyQ0FBMkMsR0FBYTtJQUNuRSxPQUFPLEVBQUUsY0FBYztJQUN2QixRQUFRLEVBQUUsOEJBQThCO0NBQ3pDLENBQUM7QUFDRixNQUFNLENBQUMsTUFBTSw2QkFBNkIsR0FBYTtJQUNyRCxPQUFPLEVBQUUsY0FBYztJQUN2QixRQUFRLEVBQUUsMEJBQTBCO0NBQ3JDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtJbmplY3QsIEluamVjdGFibGUsIE9uRGVzdHJveSwgUHJvdmlkZXIsIENTUF9OT05DRSwgT3B0aW9uYWx9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtET0NVTUVOVH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7Y29lcmNlQ3NzUGl4ZWxWYWx1ZX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvZXJjaW9uJztcbmltcG9ydCB7Q2RrVGFibGUsIF9Db2FsZXNjZWRTdHlsZVNjaGVkdWxlciwgX0NPQUxFU0NFRF9TVFlMRV9TQ0hFRFVMRVJ9IGZyb20gJ0Bhbmd1bGFyL2Nkay90YWJsZSc7XG5cbmltcG9ydCB7Q29sdW1uUmVzaXplfSBmcm9tICcuL2NvbHVtbi1yZXNpemUnO1xuXG4vKipcbiAqIFByb3ZpZGVzIGFuIGltcGxlbWVudGF0aW9uIGZvciByZXNpemluZyBhIGNvbHVtbi5cbiAqIFRoZSBkZXRhaWxzIG9mIGhvdyByZXNpemluZyB3b3JrcyBmb3IgdGFibGVzIGZvciBmbGV4IG1hdC10YWJsZXMgYXJlIHF1aXRlIGRpZmZlcmVudC5cbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFJlc2l6ZVN0cmF0ZWd5IHtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IHJlYWRvbmx5IGNvbHVtblJlc2l6ZTogQ29sdW1uUmVzaXplO1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgcmVhZG9ubHkgc3R5bGVTY2hlZHVsZXI6IF9Db2FsZXNjZWRTdHlsZVNjaGVkdWxlcjtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IHJlYWRvbmx5IHRhYmxlOiBDZGtUYWJsZTx1bmtub3duPjtcblxuICBwcml2YXRlIF9wZW5kaW5nUmVzaXplRGVsdGE6IG51bWJlciB8IG51bGwgPSBudWxsO1xuXG4gIC8qKiBVcGRhdGVzIHRoZSB3aWR0aCBvZiB0aGUgc3BlY2lmaWVkIGNvbHVtbi4gKi9cbiAgYWJzdHJhY3QgYXBwbHlDb2x1bW5TaXplKFxuICAgIGNzc0ZyaWVuZGx5Q29sdW1uTmFtZTogc3RyaW5nLFxuICAgIGNvbHVtbkhlYWRlcjogSFRNTEVsZW1lbnQsXG4gICAgc2l6ZUluUHg6IG51bWJlcixcbiAgICBwcmV2aW91c1NpemVJblB4PzogbnVtYmVyLFxuICApOiB2b2lkO1xuXG4gIC8qKiBBcHBsaWVzIGEgbWluaW11bSB3aWR0aCB0byB0aGUgc3BlY2lmaWVkIGNvbHVtbiwgdXBkYXRpbmcgaXRzIGN1cnJlbnQgd2lkdGggYXMgbmVlZGVkLiAqL1xuICBhYnN0cmFjdCBhcHBseU1pbkNvbHVtblNpemUoXG4gICAgY3NzRnJpZW5kbHlDb2x1bW5OYW1lOiBzdHJpbmcsXG4gICAgY29sdW1uSGVhZGVyOiBIVE1MRWxlbWVudCxcbiAgICBtaW5TaXplSW5QeDogbnVtYmVyLFxuICApOiB2b2lkO1xuXG4gIC8qKiBBcHBsaWVzIGEgbWF4aW11bSB3aWR0aCB0byB0aGUgc3BlY2lmaWVkIGNvbHVtbiwgdXBkYXRpbmcgaXRzIGN1cnJlbnQgd2lkdGggYXMgbmVlZGVkLiAqL1xuICBhYnN0cmFjdCBhcHBseU1heENvbHVtblNpemUoXG4gICAgY3NzRnJpZW5kbHlDb2x1bW5OYW1lOiBzdHJpbmcsXG4gICAgY29sdW1uSGVhZGVyOiBIVE1MRWxlbWVudCxcbiAgICBtaW5TaXplSW5QeDogbnVtYmVyLFxuICApOiB2b2lkO1xuXG4gIC8qKiBBZGp1c3RzIHRoZSB3aWR0aCBvZiB0aGUgdGFibGUgZWxlbWVudCBieSB0aGUgc3BlY2lmaWVkIGRlbHRhLiAqL1xuICBwcm90ZWN0ZWQgdXBkYXRlVGFibGVXaWR0aEFuZFN0aWNreUNvbHVtbnMoZGVsdGE6IG51bWJlcik6IHZvaWQge1xuICAgIGlmICh0aGlzLl9wZW5kaW5nUmVzaXplRGVsdGEgPT09IG51bGwpIHtcbiAgICAgIGNvbnN0IHRhYmxlRWxlbWVudCA9IHRoaXMuY29sdW1uUmVzaXplLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudDtcbiAgICAgIGNvbnN0IHRhYmxlV2lkdGggPSBnZXRFbGVtZW50V2lkdGgodGFibGVFbGVtZW50KTtcblxuICAgICAgdGhpcy5zdHlsZVNjaGVkdWxlci5zY2hlZHVsZSgoKSA9PiB7XG4gICAgICAgIHRhYmxlRWxlbWVudC5zdHlsZS53aWR0aCA9IGNvZXJjZUNzc1BpeGVsVmFsdWUodGFibGVXaWR0aCArIHRoaXMuX3BlbmRpbmdSZXNpemVEZWx0YSEpO1xuXG4gICAgICAgIHRoaXMuX3BlbmRpbmdSZXNpemVEZWx0YSA9IG51bGw7XG4gICAgICB9KTtcblxuICAgICAgdGhpcy5zdHlsZVNjaGVkdWxlci5zY2hlZHVsZUVuZCgoKSA9PiB7XG4gICAgICAgIHRoaXMudGFibGUudXBkYXRlU3RpY2t5Q29sdW1uU3R5bGVzKCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICB0aGlzLl9wZW5kaW5nUmVzaXplRGVsdGEgPSAodGhpcy5fcGVuZGluZ1Jlc2l6ZURlbHRhID8/IDApICsgZGVsdGE7XG4gIH1cbn1cblxuLyoqXG4gKiBUaGUgb3B0aW1hbGx5IHBlcmZvcm1pbmcgcmVzaXplIHN0cmF0ZWd5IGZvciAmbHQ7dGFibGUmZ3Q7IGVsZW1lbnRzIHdpdGggdGFibGUtbGF5b3V0OiBmaXhlZC5cbiAqIFRlc3RlZCBhZ2FpbnN0IGFuZCBvdXRwZXJmb3JtZWQ6XG4gKiAgIENTUyBzZWxlY3RvclxuICogICBDU1Mgc2VsZWN0b3Igdy8gQ1NTIHZhcmlhYmxlXG4gKiAgIFVwZGF0aW5nIGFsbCBjZWxsIG5vZGVzXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBUYWJsZUxheW91dEZpeGVkUmVzaXplU3RyYXRlZ3kgZXh0ZW5kcyBSZXNpemVTdHJhdGVneSB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHByb3RlY3RlZCByZWFkb25seSBjb2x1bW5SZXNpemU6IENvbHVtblJlc2l6ZSxcbiAgICBASW5qZWN0KF9DT0FMRVNDRURfU1RZTEVfU0NIRURVTEVSKVxuICAgIHByb3RlY3RlZCByZWFkb25seSBzdHlsZVNjaGVkdWxlcjogX0NvYWxlc2NlZFN0eWxlU2NoZWR1bGVyLFxuICAgIHByb3RlY3RlZCByZWFkb25seSB0YWJsZTogQ2RrVGFibGU8dW5rbm93bj4sXG4gICkge1xuICAgIHN1cGVyKCk7XG4gIH1cblxuICBhcHBseUNvbHVtblNpemUoXG4gICAgXzogc3RyaW5nLFxuICAgIGNvbHVtbkhlYWRlcjogSFRNTEVsZW1lbnQsXG4gICAgc2l6ZUluUHg6IG51bWJlcixcbiAgICBwcmV2aW91c1NpemVJblB4PzogbnVtYmVyLFxuICApOiB2b2lkIHtcbiAgICBjb25zdCBkZWx0YSA9IHNpemVJblB4IC0gKHByZXZpb3VzU2l6ZUluUHggPz8gZ2V0RWxlbWVudFdpZHRoKGNvbHVtbkhlYWRlcikpO1xuXG4gICAgaWYgKGRlbHRhID09PSAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5zdHlsZVNjaGVkdWxlci5zY2hlZHVsZSgoKSA9PiB7XG4gICAgICBjb2x1bW5IZWFkZXIuc3R5bGUud2lkdGggPSBjb2VyY2VDc3NQaXhlbFZhbHVlKHNpemVJblB4KTtcbiAgICB9KTtcblxuICAgIHRoaXMudXBkYXRlVGFibGVXaWR0aEFuZFN0aWNreUNvbHVtbnMoZGVsdGEpO1xuICB9XG5cbiAgYXBwbHlNaW5Db2x1bW5TaXplKF86IHN0cmluZywgY29sdW1uSGVhZGVyOiBIVE1MRWxlbWVudCwgc2l6ZUluUHg6IG51bWJlcik6IHZvaWQge1xuICAgIGNvbnN0IGN1cnJlbnRXaWR0aCA9IGdldEVsZW1lbnRXaWR0aChjb2x1bW5IZWFkZXIpO1xuICAgIGNvbnN0IG5ld1dpZHRoID0gTWF0aC5tYXgoY3VycmVudFdpZHRoLCBzaXplSW5QeCk7XG5cbiAgICB0aGlzLmFwcGx5Q29sdW1uU2l6ZShfLCBjb2x1bW5IZWFkZXIsIG5ld1dpZHRoLCBjdXJyZW50V2lkdGgpO1xuICB9XG5cbiAgYXBwbHlNYXhDb2x1bW5TaXplKF86IHN0cmluZywgY29sdW1uSGVhZGVyOiBIVE1MRWxlbWVudCwgc2l6ZUluUHg6IG51bWJlcik6IHZvaWQge1xuICAgIGNvbnN0IGN1cnJlbnRXaWR0aCA9IGdldEVsZW1lbnRXaWR0aChjb2x1bW5IZWFkZXIpO1xuICAgIGNvbnN0IG5ld1dpZHRoID0gTWF0aC5taW4oY3VycmVudFdpZHRoLCBzaXplSW5QeCk7XG5cbiAgICB0aGlzLmFwcGx5Q29sdW1uU2l6ZShfLCBjb2x1bW5IZWFkZXIsIG5ld1dpZHRoLCBjdXJyZW50V2lkdGgpO1xuICB9XG59XG5cbi8qKlxuICogVGhlIG9wdGltYWxseSBwZXJmb3JtaW5nIHJlc2l6ZSBzdHJhdGVneSBmb3IgZmxleCBtYXQtdGFibGVzLlxuICogVGVzdGVkIGFnYWluc3QgYW5kIG91dHBlcmZvcm1lZDpcbiAqICAgQ1NTIHNlbGVjdG9yIHcvIENTUyB2YXJpYWJsZVxuICogICBVcGRhdGluZyBhbGwgbWF0LWNlbGwgbm9kZXNcbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIENka0ZsZXhUYWJsZVJlc2l6ZVN0cmF0ZWd5IGV4dGVuZHMgUmVzaXplU3RyYXRlZ3kgaW1wbGVtZW50cyBPbkRlc3Ryb3kge1xuICBwcml2YXRlIHJlYWRvbmx5IF9kb2N1bWVudDogRG9jdW1lbnQ7XG4gIHByaXZhdGUgcmVhZG9ubHkgX2NvbHVtbkluZGV4ZXMgPSBuZXcgTWFwPHN0cmluZywgbnVtYmVyPigpO1xuICBwcml2YXRlIHJlYWRvbmx5IF9jb2x1bW5Qcm9wZXJ0aWVzID0gbmV3IE1hcDxzdHJpbmcsIE1hcDxzdHJpbmcsIHN0cmluZz4+KCk7XG5cbiAgcHJpdmF0ZSBfc3R5bGVFbGVtZW50PzogSFRNTFN0eWxlRWxlbWVudDtcbiAgcHJpdmF0ZSBfaW5kZXhTZXF1ZW5jZSA9IDA7XG5cbiAgcHJvdGVjdGVkIHJlYWRvbmx5IGRlZmF1bHRNaW5TaXplID0gMDtcbiAgcHJvdGVjdGVkIHJlYWRvbmx5IGRlZmF1bHRNYXhTaXplID0gTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVI7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJvdGVjdGVkIHJlYWRvbmx5IGNvbHVtblJlc2l6ZTogQ29sdW1uUmVzaXplLFxuICAgIEBJbmplY3QoX0NPQUxFU0NFRF9TVFlMRV9TQ0hFRFVMRVIpXG4gICAgcHJvdGVjdGVkIHJlYWRvbmx5IHN0eWxlU2NoZWR1bGVyOiBfQ29hbGVzY2VkU3R5bGVTY2hlZHVsZXIsXG4gICAgcHJvdGVjdGVkIHJlYWRvbmx5IHRhYmxlOiBDZGtUYWJsZTx1bmtub3duPixcbiAgICBASW5qZWN0KERPQ1VNRU5UKSBkb2N1bWVudDogYW55LFxuICAgIEBJbmplY3QoQ1NQX05PTkNFKSBAT3B0aW9uYWwoKSBwcml2YXRlIHJlYWRvbmx5IF9ub25jZT86IHN0cmluZyB8IG51bGwsXG4gICkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5fZG9jdW1lbnQgPSBkb2N1bWVudDtcbiAgfVxuXG4gIGFwcGx5Q29sdW1uU2l6ZShcbiAgICBjc3NGcmllbmRseUNvbHVtbk5hbWU6IHN0cmluZyxcbiAgICBjb2x1bW5IZWFkZXI6IEhUTUxFbGVtZW50LFxuICAgIHNpemVJblB4OiBudW1iZXIsXG4gICAgcHJldmlvdXNTaXplSW5QeD86IG51bWJlcixcbiAgKTogdm9pZCB7XG4gICAgLy8gT3B0aW1pemF0aW9uOiBDaGVjayBhcHBsaWVkIHdpZHRoIGZpcnN0IGFzIHdlIHByb2JhYmx5IHNldCBpdCBhbHJlYWR5IGJlZm9yZSByZWFkaW5nXG4gICAgLy8gb2Zmc2V0V2lkdGggd2hpY2ggdHJpZ2dlcnMgbGF5b3V0LlxuICAgIGNvbnN0IGRlbHRhID1cbiAgICAgIHNpemVJblB4IC1cbiAgICAgIChwcmV2aW91c1NpemVJblB4ID8/XG4gICAgICAgICh0aGlzLl9nZXRBcHBsaWVkV2lkdGgoY3NzRnJpZW5kbHlDb2x1bW5OYW1lKSB8fCBjb2x1bW5IZWFkZXIub2Zmc2V0V2lkdGgpKTtcblxuICAgIGlmIChkZWx0YSA9PT0gMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGNzc1NpemUgPSBjb2VyY2VDc3NQaXhlbFZhbHVlKHNpemVJblB4KTtcblxuICAgIHRoaXMuX2FwcGx5UHJvcGVydHkoY3NzRnJpZW5kbHlDb2x1bW5OYW1lLCAnZmxleCcsIGAwIDAuMDEgJHtjc3NTaXplfWApO1xuICAgIHRoaXMudXBkYXRlVGFibGVXaWR0aEFuZFN0aWNreUNvbHVtbnMoZGVsdGEpO1xuICB9XG5cbiAgYXBwbHlNaW5Db2x1bW5TaXplKGNzc0ZyaWVuZGx5Q29sdW1uTmFtZTogc3RyaW5nLCBfOiBIVE1MRWxlbWVudCwgc2l6ZUluUHg6IG51bWJlcik6IHZvaWQge1xuICAgIGNvbnN0IGNzc1NpemUgPSBjb2VyY2VDc3NQaXhlbFZhbHVlKHNpemVJblB4KTtcblxuICAgIHRoaXMuX2FwcGx5UHJvcGVydHkoXG4gICAgICBjc3NGcmllbmRseUNvbHVtbk5hbWUsXG4gICAgICAnbWluLXdpZHRoJyxcbiAgICAgIGNzc1NpemUsXG4gICAgICBzaXplSW5QeCAhPT0gdGhpcy5kZWZhdWx0TWluU2l6ZSxcbiAgICApO1xuICAgIHRoaXMudXBkYXRlVGFibGVXaWR0aEFuZFN0aWNreUNvbHVtbnMoMCk7XG4gIH1cblxuICBhcHBseU1heENvbHVtblNpemUoY3NzRnJpZW5kbHlDb2x1bW5OYW1lOiBzdHJpbmcsIF86IEhUTUxFbGVtZW50LCBzaXplSW5QeDogbnVtYmVyKTogdm9pZCB7XG4gICAgY29uc3QgY3NzU2l6ZSA9IGNvZXJjZUNzc1BpeGVsVmFsdWUoc2l6ZUluUHgpO1xuXG4gICAgdGhpcy5fYXBwbHlQcm9wZXJ0eShcbiAgICAgIGNzc0ZyaWVuZGx5Q29sdW1uTmFtZSxcbiAgICAgICdtYXgtd2lkdGgnLFxuICAgICAgY3NzU2l6ZSxcbiAgICAgIHNpemVJblB4ICE9PSB0aGlzLmRlZmF1bHRNYXhTaXplLFxuICAgICk7XG4gICAgdGhpcy51cGRhdGVUYWJsZVdpZHRoQW5kU3RpY2t5Q29sdW1ucygwKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBnZXRDb2x1bW5Dc3NDbGFzcyhjc3NGcmllbmRseUNvbHVtbk5hbWU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGBjZGstY29sdW1uLSR7Y3NzRnJpZW5kbHlDb2x1bW5OYW1lfWA7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLl9zdHlsZUVsZW1lbnQ/LnJlbW92ZSgpO1xuICAgIHRoaXMuX3N0eWxlRWxlbWVudCA9IHVuZGVmaW5lZDtcbiAgfVxuXG4gIHByaXZhdGUgX2dldFByb3BlcnR5VmFsdWUoY3NzRnJpZW5kbHlDb2x1bW5OYW1lOiBzdHJpbmcsIGtleTogc3RyaW5nKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgICBjb25zdCBwcm9wZXJ0aWVzID0gdGhpcy5fZ2V0Q29sdW1uUHJvcGVydGllc01hcChjc3NGcmllbmRseUNvbHVtbk5hbWUpO1xuICAgIHJldHVybiBwcm9wZXJ0aWVzLmdldChrZXkpO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0QXBwbGllZFdpZHRoKGNzc0ZyaWVuZHNseUNvbHVtbk5hbWU6IHN0cmluZyk6IG51bWJlciB7XG4gICAgcmV0dXJuIGNvZXJjZVBpeGVsc0Zyb21GbGV4VmFsdWUodGhpcy5fZ2V0UHJvcGVydHlWYWx1ZShjc3NGcmllbmRzbHlDb2x1bW5OYW1lLCAnZmxleCcpKTtcbiAgfVxuXG4gIHByaXZhdGUgX2FwcGx5UHJvcGVydHkoXG4gICAgY3NzRnJpZW5kbHlDb2x1bW5OYW1lOiBzdHJpbmcsXG4gICAga2V5OiBzdHJpbmcsXG4gICAgdmFsdWU6IHN0cmluZyxcbiAgICBlbmFibGUgPSB0cnVlLFxuICApOiB2b2lkIHtcbiAgICBjb25zdCBwcm9wZXJ0aWVzID0gdGhpcy5fZ2V0Q29sdW1uUHJvcGVydGllc01hcChjc3NGcmllbmRseUNvbHVtbk5hbWUpO1xuXG4gICAgdGhpcy5zdHlsZVNjaGVkdWxlci5zY2hlZHVsZSgoKSA9PiB7XG4gICAgICBpZiAoZW5hYmxlKSB7XG4gICAgICAgIHByb3BlcnRpZXMuc2V0KGtleSwgdmFsdWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcHJvcGVydGllcy5kZWxldGUoa2V5KTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX2FwcGx5U2l6ZUNzcyhjc3NGcmllbmRseUNvbHVtbk5hbWUpO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0U3R5bGVTaGVldCgpOiBDU1NTdHlsZVNoZWV0IHtcbiAgICBpZiAoIXRoaXMuX3N0eWxlRWxlbWVudCkge1xuICAgICAgdGhpcy5fc3R5bGVFbGVtZW50ID0gdGhpcy5fZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcblxuICAgICAgaWYgKHRoaXMuX25vbmNlKSB7XG4gICAgICAgIHRoaXMuX3N0eWxlRWxlbWVudC5ub25jZSA9IHRoaXMuX25vbmNlO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9zdHlsZUVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5fZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoJycpKTtcbiAgICAgIHRoaXMuX2RvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQodGhpcy5fc3R5bGVFbGVtZW50KTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fc3R5bGVFbGVtZW50LnNoZWV0IGFzIENTU1N0eWxlU2hlZXQ7XG4gIH1cblxuICBwcml2YXRlIF9nZXRDb2x1bW5Qcm9wZXJ0aWVzTWFwKGNzc0ZyaWVuZGx5Q29sdW1uTmFtZTogc3RyaW5nKTogTWFwPHN0cmluZywgc3RyaW5nPiB7XG4gICAgbGV0IHByb3BlcnRpZXMgPSB0aGlzLl9jb2x1bW5Qcm9wZXJ0aWVzLmdldChjc3NGcmllbmRseUNvbHVtbk5hbWUpO1xuICAgIGlmIChwcm9wZXJ0aWVzID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHByb3BlcnRpZXMgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nPigpO1xuICAgICAgdGhpcy5fY29sdW1uUHJvcGVydGllcy5zZXQoY3NzRnJpZW5kbHlDb2x1bW5OYW1lLCBwcm9wZXJ0aWVzKTtcbiAgICB9XG4gICAgcmV0dXJuIHByb3BlcnRpZXM7XG4gIH1cblxuICBwcml2YXRlIF9hcHBseVNpemVDc3MoY3NzRnJpZW5kbHlDb2x1bW5OYW1lOiBzdHJpbmcpIHtcbiAgICBjb25zdCBwcm9wZXJ0aWVzID0gdGhpcy5fZ2V0Q29sdW1uUHJvcGVydGllc01hcChjc3NGcmllbmRseUNvbHVtbk5hbWUpO1xuICAgIGNvbnN0IHByb3BlcnR5S2V5cyA9IEFycmF5LmZyb20ocHJvcGVydGllcy5rZXlzKCkpO1xuXG4gICAgbGV0IGluZGV4ID0gdGhpcy5fY29sdW1uSW5kZXhlcy5nZXQoY3NzRnJpZW5kbHlDb2x1bW5OYW1lKTtcbiAgICBpZiAoaW5kZXggPT09IHVuZGVmaW5lZCkge1xuICAgICAgaWYgKCFwcm9wZXJ0eUtleXMubGVuZ3RoKSB7XG4gICAgICAgIC8vIE5vdGhpbmcgdG8gc2V0IG9yIHVuc2V0LlxuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGluZGV4ID0gdGhpcy5faW5kZXhTZXF1ZW5jZSsrO1xuICAgICAgdGhpcy5fY29sdW1uSW5kZXhlcy5zZXQoY3NzRnJpZW5kbHlDb2x1bW5OYW1lLCBpbmRleCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2dldFN0eWxlU2hlZXQoKS5kZWxldGVSdWxlKGluZGV4KTtcbiAgICB9XG5cbiAgICBjb25zdCBjb2x1bW5DbGFzc05hbWUgPSB0aGlzLmdldENvbHVtbkNzc0NsYXNzKGNzc0ZyaWVuZGx5Q29sdW1uTmFtZSk7XG4gICAgY29uc3QgdGFibGVDbGFzc05hbWUgPSB0aGlzLmNvbHVtblJlc2l6ZS5nZXRVbmlxdWVDc3NDbGFzcygpO1xuXG4gICAgY29uc3Qgc2VsZWN0b3IgPSBgLiR7dGFibGVDbGFzc05hbWV9IC4ke2NvbHVtbkNsYXNzTmFtZX1gO1xuICAgIGNvbnN0IGJvZHkgPSBwcm9wZXJ0eUtleXMubWFwKGtleSA9PiBgJHtrZXl9OiR7cHJvcGVydGllcy5nZXQoa2V5KX1gKS5qb2luKCc7Jyk7XG5cbiAgICB0aGlzLl9nZXRTdHlsZVNoZWV0KCkuaW5zZXJ0UnVsZShgJHtzZWxlY3Rvcn0geyR7Ym9keX19YCwgaW5kZXghKTtcbiAgfVxufVxuXG4vKiogQ29udmVydHMgQ1NTIHBpeGVsIHZhbHVlcyB0byBudW1iZXJzLCBlZyBcIjEyM3B4XCIgdG8gMTIzLiBSZXR1cm5zIE5hTiBmb3Igbm9uIHBpeGVsIHZhbHVlcy4gKi9cbmZ1bmN0aW9uIGNvZXJjZVBpeGVsc0Zyb21Dc3NWYWx1ZShjc3NWYWx1ZTogc3RyaW5nKTogbnVtYmVyIHtcbiAgcmV0dXJuIE51bWJlcihjc3NWYWx1ZS5tYXRjaCgvKFxcZCspcHgvKT8uWzFdKTtcbn1cblxuLyoqIEdldHMgdGhlIHN0eWxlLndpZHRoIHBpeGVscyBvbiB0aGUgc3BlY2lmaWVkIGVsZW1lbnQgaWYgcHJlc2VudCwgb3RoZXJ3aXNlIGl0cyBvZmZzZXRXaWR0aC4gKi9cbmZ1bmN0aW9uIGdldEVsZW1lbnRXaWR0aChlbGVtZW50OiBIVE1MRWxlbWVudCkge1xuICAvLyBPcHRpbWl6YXRpb246IENoZWNrIHN0eWxlLndpZHRoIGZpcnN0IGFzIHdlIHByb2JhYmx5IHNldCBpdCBhbHJlYWR5IGJlZm9yZSByZWFkaW5nXG4gIC8vIG9mZnNldFdpZHRoIHdoaWNoIHRyaWdnZXJzIGxheW91dC5cbiAgcmV0dXJuIGNvZXJjZVBpeGVsc0Zyb21Dc3NWYWx1ZShlbGVtZW50LnN0eWxlLndpZHRoKSB8fCBlbGVtZW50Lm9mZnNldFdpZHRoO1xufVxuXG4vKipcbiAqIENvbnZlcnRzIENTUyBmbGV4IHZhbHVlcyBhcyBzZXQgaW4gQ2RrRmxleFRhYmxlUmVzaXplU3RyYXRlZ3kgdG8gbnVtYmVycyxcbiAqIGVnIFwiMCAwLjAxIDEyM3B4XCIgdG8gMTIzLlxuICovXG5mdW5jdGlvbiBjb2VyY2VQaXhlbHNGcm9tRmxleFZhbHVlKGZsZXhWYWx1ZTogc3RyaW5nIHwgdW5kZWZpbmVkKTogbnVtYmVyIHtcbiAgcmV0dXJuIE51bWJlcihmbGV4VmFsdWU/Lm1hdGNoKC8wIDBcXC4wMSAoXFxkKylweC8pPy5bMV0pO1xufVxuXG5leHBvcnQgY29uc3QgVEFCTEVfTEFZT1VUX0ZJWEVEX1JFU0laRV9TVFJBVEVHWV9QUk9WSURFUjogUHJvdmlkZXIgPSB7XG4gIHByb3ZpZGU6IFJlc2l6ZVN0cmF0ZWd5LFxuICB1c2VDbGFzczogVGFibGVMYXlvdXRGaXhlZFJlc2l6ZVN0cmF0ZWd5LFxufTtcbmV4cG9ydCBjb25zdCBGTEVYX1JFU0laRV9TVFJBVEVHWV9QUk9WSURFUjogUHJvdmlkZXIgPSB7XG4gIHByb3ZpZGU6IFJlc2l6ZVN0cmF0ZWd5LFxuICB1c2VDbGFzczogQ2RrRmxleFRhYmxlUmVzaXplU3RyYXRlZ3ksXG59O1xuIl19