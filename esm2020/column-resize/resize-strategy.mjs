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
}
ResizeStrategy.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.3.0", ngImport: i0, type: ResizeStrategy, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
ResizeStrategy.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.3.0", ngImport: i0, type: ResizeStrategy });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.3.0", ngImport: i0, type: ResizeStrategy, decorators: [{
            type: Injectable
        }] });
/**
 * The optimially performing resize strategy for &lt;table&gt; elements with table-layout: fixed.
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
}
TableLayoutFixedResizeStrategy.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.3.0", ngImport: i0, type: TableLayoutFixedResizeStrategy, deps: [{ token: i1.ColumnResize }, { token: _COALESCED_STYLE_SCHEDULER }, { token: i2.CdkTable }], target: i0.ɵɵFactoryTarget.Injectable });
TableLayoutFixedResizeStrategy.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.3.0", ngImport: i0, type: TableLayoutFixedResizeStrategy });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.3.0", ngImport: i0, type: TableLayoutFixedResizeStrategy, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: i1.ColumnResize }, { type: i2._CoalescedStyleScheduler, decorators: [{
                    type: Inject,
                    args: [_COALESCED_STYLE_SCHEDULER]
                }] }, { type: i2.CdkTable }]; } });
/**
 * The optimally performing resize strategy for flex mat-tables.
 * Tested against and outperformed:
 *   CSS selector w/ CSS variable
 *   Updating all mat-cell nodes
 */
export class CdkFlexTableResizeStrategy extends ResizeStrategy {
    constructor(columnResize, styleScheduler, table, document) {
        super();
        this.columnResize = columnResize;
        this.styleScheduler = styleScheduler;
        this.table = table;
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
CdkFlexTableResizeStrategy.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.3.0", ngImport: i0, type: CdkFlexTableResizeStrategy, deps: [{ token: i1.ColumnResize }, { token: _COALESCED_STYLE_SCHEDULER }, { token: i2.CdkTable }, { token: DOCUMENT }], target: i0.ɵɵFactoryTarget.Injectable });
CdkFlexTableResizeStrategy.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.3.0", ngImport: i0, type: CdkFlexTableResizeStrategy });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.3.0", ngImport: i0, type: CdkFlexTableResizeStrategy, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: i1.ColumnResize }, { type: i2._CoalescedStyleScheduler, decorators: [{
                    type: Inject,
                    args: [_COALESCED_STYLE_SCHEDULER]
                }] }, { type: i2.CdkTable }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [DOCUMENT]
                }] }]; } });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzaXplLXN0cmF0ZWd5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvY29sdW1uLXJlc2l6ZS9yZXNpemUtc3RyYXRlZ3kudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLE1BQU0sRUFBRSxVQUFVLEVBQXNCLE1BQU0sZUFBZSxDQUFDO0FBQ3RFLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUN6QyxPQUFPLEVBQUMsbUJBQW1CLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUMxRCxPQUFPLEVBQUMsUUFBUSxFQUFFLHdCQUF3QixFQUFFLDBCQUEwQixFQUFDLE1BQU0sb0JBQW9CLENBQUM7QUFFbEcsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGlCQUFpQixDQUFDOzs7O0FBRTdDOzs7R0FHRztBQUVILE1BQU0sT0FBZ0IsY0FBYztJQURwQztRQU1VLHdCQUFtQixHQUFrQixJQUFJLENBQUM7S0EyQ25EO0lBbkJDLHFFQUFxRTtJQUMzRCxnQ0FBZ0MsQ0FBQyxLQUFhO1FBQ3RELElBQUksSUFBSSxDQUFDLG1CQUFtQixLQUFLLElBQUksRUFBRTtZQUNyQyxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUM7WUFDaEUsTUFBTSxVQUFVLEdBQUcsZUFBZSxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBRWpELElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRTtnQkFDaEMsWUFBWSxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsbUJBQW1CLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxtQkFBb0IsQ0FBQyxDQUFDO2dCQUV2RixJQUFJLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxDQUFDO1lBQ2xDLENBQUMsQ0FBQyxDQUFDO1lBRUgsSUFBSSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFO2dCQUNuQyxJQUFJLENBQUMsS0FBSyxDQUFDLHdCQUF3QixFQUFFLENBQUM7WUFDeEMsQ0FBQyxDQUFDLENBQUM7U0FDSjtRQUVELElBQUksQ0FBQyxtQkFBbUIsR0FBRyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsSUFBSSxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUM7SUFDckUsQ0FBQzs7MkdBL0NtQixjQUFjOytHQUFkLGNBQWM7MkZBQWQsY0FBYztrQkFEbkMsVUFBVTs7QUFtRFg7Ozs7OztHQU1HO0FBRUgsTUFBTSxPQUFPLDhCQUErQixTQUFRLGNBQWM7SUFDaEUsWUFDcUIsWUFBMEIsRUFFMUIsY0FBd0MsRUFDeEMsS0FBd0I7UUFFM0MsS0FBSyxFQUFFLENBQUM7UUFMVyxpQkFBWSxHQUFaLFlBQVksQ0FBYztRQUUxQixtQkFBYyxHQUFkLGNBQWMsQ0FBMEI7UUFDeEMsVUFBSyxHQUFMLEtBQUssQ0FBbUI7SUFHN0MsQ0FBQztJQUVELGVBQWUsQ0FDYixDQUFTLEVBQ1QsWUFBeUIsRUFDekIsUUFBZ0IsRUFDaEIsZ0JBQXlCO1FBRXpCLE1BQU0sS0FBSyxHQUFHLFFBQVEsR0FBRyxDQUFDLGdCQUFnQixJQUFJLGVBQWUsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO1FBRTdFLElBQUksS0FBSyxLQUFLLENBQUMsRUFBRTtZQUNmLE9BQU87U0FDUjtRQUVELElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRTtZQUNoQyxZQUFZLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxtQkFBbUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUMzRCxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxnQ0FBZ0MsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUMvQyxDQUFDO0lBRUQsa0JBQWtCLENBQUMsQ0FBUyxFQUFFLFlBQXlCLEVBQUUsUUFBZ0I7UUFDdkUsTUFBTSxZQUFZLEdBQUcsZUFBZSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ25ELE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBRWxELElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxFQUFFLFlBQVksRUFBRSxRQUFRLEVBQUUsWUFBWSxDQUFDLENBQUM7SUFDaEUsQ0FBQztJQUVELGtCQUFrQixDQUFDLENBQVMsRUFBRSxZQUF5QixFQUFFLFFBQWdCO1FBQ3ZFLE1BQU0sWUFBWSxHQUFHLGVBQWUsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUNuRCxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRSxRQUFRLENBQUMsQ0FBQztRQUVsRCxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsRUFBRSxZQUFZLEVBQUUsUUFBUSxFQUFFLFlBQVksQ0FBQyxDQUFDO0lBQ2hFLENBQUM7OzJIQXpDVSw4QkFBOEIsOENBRy9CLDBCQUEwQjsrSEFIekIsOEJBQThCOzJGQUE5Qiw4QkFBOEI7a0JBRDFDLFVBQVU7OzBCQUlOLE1BQU07MkJBQUMsMEJBQTBCOztBQXlDdEM7Ozs7O0dBS0c7QUFFSCxNQUFNLE9BQU8sMEJBQTJCLFNBQVEsY0FBYztJQVc1RCxZQUNxQixZQUEwQixFQUUxQixjQUF3QyxFQUN4QyxLQUF3QixFQUN6QixRQUFhO1FBRS9CLEtBQUssRUFBRSxDQUFDO1FBTlcsaUJBQVksR0FBWixZQUFZLENBQWM7UUFFMUIsbUJBQWMsR0FBZCxjQUFjLENBQTBCO1FBQ3hDLFVBQUssR0FBTCxLQUFLLENBQW1CO1FBYjVCLG1CQUFjLEdBQUcsSUFBSSxHQUFHLEVBQWtCLENBQUM7UUFDM0Msc0JBQWlCLEdBQUcsSUFBSSxHQUFHLEVBQStCLENBQUM7UUFHcEUsbUJBQWMsR0FBRyxDQUFDLENBQUM7UUFFUixtQkFBYyxHQUFHLENBQUMsQ0FBQztRQUNuQixtQkFBYyxHQUFHLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQztRQVUxRCxJQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQztJQUM1QixDQUFDO0lBRUQsZUFBZSxDQUNiLHFCQUE2QixFQUM3QixZQUF5QixFQUN6QixRQUFnQixFQUNoQixnQkFBeUI7UUFFekIsdUZBQXVGO1FBQ3ZGLHFDQUFxQztRQUNyQyxNQUFNLEtBQUssR0FDVCxRQUFRO1lBQ1IsQ0FBQyxnQkFBZ0I7Z0JBQ2YsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMscUJBQXFCLENBQUMsSUFBSSxZQUFZLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztRQUVoRixJQUFJLEtBQUssS0FBSyxDQUFDLEVBQUU7WUFDZixPQUFPO1NBQ1I7UUFFRCxNQUFNLE9BQU8sR0FBRyxtQkFBbUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUU5QyxJQUFJLENBQUMsY0FBYyxDQUFDLHFCQUFxQixFQUFFLE1BQU0sRUFBRSxVQUFVLE9BQU8sRUFBRSxDQUFDLENBQUM7UUFDeEUsSUFBSSxDQUFDLGdDQUFnQyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQy9DLENBQUM7SUFFRCxrQkFBa0IsQ0FBQyxxQkFBNkIsRUFBRSxDQUFjLEVBQUUsUUFBZ0I7UUFDaEYsTUFBTSxPQUFPLEdBQUcsbUJBQW1CLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFOUMsSUFBSSxDQUFDLGNBQWMsQ0FDakIscUJBQXFCLEVBQ3JCLFdBQVcsRUFDWCxPQUFPLEVBQ1AsUUFBUSxLQUFLLElBQUksQ0FBQyxjQUFjLENBQ2pDLENBQUM7UUFDRixJQUFJLENBQUMsZ0NBQWdDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDM0MsQ0FBQztJQUVELGtCQUFrQixDQUFDLHFCQUE2QixFQUFFLENBQWMsRUFBRSxRQUFnQjtRQUNoRixNQUFNLE9BQU8sR0FBRyxtQkFBbUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUU5QyxJQUFJLENBQUMsY0FBYyxDQUNqQixxQkFBcUIsRUFDckIsV0FBVyxFQUNYLE9BQU8sRUFDUCxRQUFRLEtBQUssSUFBSSxDQUFDLGNBQWMsQ0FDakMsQ0FBQztRQUNGLElBQUksQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMzQyxDQUFDO0lBRVMsaUJBQWlCLENBQUMscUJBQTZCO1FBQ3ZELE9BQU8sY0FBYyxxQkFBcUIsRUFBRSxDQUFDO0lBQy9DLENBQUM7SUFFRCxXQUFXO1FBQ1QsSUFBSSxDQUFDLGFBQWEsRUFBRSxNQUFNLEVBQUUsQ0FBQztRQUM3QixJQUFJLENBQUMsYUFBYSxHQUFHLFNBQVMsQ0FBQztJQUNqQyxDQUFDO0lBRU8saUJBQWlCLENBQUMscUJBQTZCLEVBQUUsR0FBVztRQUNsRSxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsdUJBQXVCLENBQUMscUJBQXFCLENBQUMsQ0FBQztRQUN2RSxPQUFPLFVBQVUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDN0IsQ0FBQztJQUVPLGdCQUFnQixDQUFDLHNCQUE4QjtRQUNyRCxPQUFPLHlCQUF5QixDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxzQkFBc0IsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO0lBQzNGLENBQUM7SUFFTyxjQUFjLENBQ3BCLHFCQUE2QixFQUM3QixHQUFXLEVBQ1gsS0FBYSxFQUNiLE1BQU0sR0FBRyxJQUFJO1FBRWIsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLHVCQUF1QixDQUFDLHFCQUFxQixDQUFDLENBQUM7UUFFdkUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFO1lBQ2hDLElBQUksTUFBTSxFQUFFO2dCQUNWLFVBQVUsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO2FBQzVCO2lCQUFNO2dCQUNMLFVBQVUsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7YUFDeEI7WUFDRCxJQUFJLENBQUMsYUFBYSxDQUFDLHFCQUFxQixDQUFDLENBQUM7UUFDNUMsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRU8sY0FBYztRQUNwQixJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRTtZQUN2QixJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzNELElBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDbEUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztTQUNyRDtRQUVELE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFzQixDQUFDO0lBQ25ELENBQUM7SUFFTyx1QkFBdUIsQ0FBQyxxQkFBNkI7UUFDM0QsSUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1FBQ25FLElBQUksVUFBVSxLQUFLLFNBQVMsRUFBRTtZQUM1QixVQUFVLEdBQUcsSUFBSSxHQUFHLEVBQWtCLENBQUM7WUFDdkMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsRUFBRSxVQUFVLENBQUMsQ0FBQztTQUMvRDtRQUNELE9BQU8sVUFBVSxDQUFDO0lBQ3BCLENBQUM7SUFFTyxhQUFhLENBQUMscUJBQTZCO1FBQ2pELE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1FBQ3ZFLE1BQU0sWUFBWSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7UUFFbkQsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMscUJBQXFCLENBQUMsQ0FBQztRQUMzRCxJQUFJLEtBQUssS0FBSyxTQUFTLEVBQUU7WUFDdkIsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUU7Z0JBQ3hCLDJCQUEyQjtnQkFDM0IsT0FBTzthQUNSO1lBRUQsS0FBSyxHQUFHLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUM5QixJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsRUFBRSxLQUFLLENBQUMsQ0FBQztTQUN2RDthQUFNO1lBQ0wsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUN6QztRQUVELE1BQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1FBQ3RFLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUU3RCxNQUFNLFFBQVEsR0FBRyxJQUFJLGNBQWMsS0FBSyxlQUFlLEVBQUUsQ0FBQztRQUMxRCxNQUFNLElBQUksR0FBRyxZQUFZLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLElBQUksVUFBVSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRWhGLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQyxVQUFVLENBQUMsR0FBRyxRQUFRLEtBQUssSUFBSSxHQUFHLEVBQUUsS0FBTSxDQUFDLENBQUM7SUFDcEUsQ0FBQzs7dUhBcEpVLDBCQUEwQiw4Q0FhM0IsMEJBQTBCLHFDQUcxQixRQUFROzJIQWhCUCwwQkFBMEI7MkZBQTFCLDBCQUEwQjtrQkFEdEMsVUFBVTs7MEJBY04sTUFBTTsyQkFBQywwQkFBMEI7OzBCQUdqQyxNQUFNOzJCQUFDLFFBQVE7O0FBdUlwQixpR0FBaUc7QUFDakcsU0FBUyx3QkFBd0IsQ0FBQyxRQUFnQjtJQUNoRCxPQUFPLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNoRCxDQUFDO0FBRUQsa0dBQWtHO0FBQ2xHLFNBQVMsZUFBZSxDQUFDLE9BQW9CO0lBQzNDLHFGQUFxRjtJQUNyRixxQ0FBcUM7SUFDckMsT0FBTyx3QkFBd0IsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLE9BQU8sQ0FBQyxXQUFXLENBQUM7QUFDOUUsQ0FBQztBQUVEOzs7R0FHRztBQUNILFNBQVMseUJBQXlCLENBQUMsU0FBNkI7SUFDOUQsT0FBTyxNQUFNLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMxRCxDQUFDO0FBRUQsTUFBTSxDQUFDLE1BQU0sMkNBQTJDLEdBQWE7SUFDbkUsT0FBTyxFQUFFLGNBQWM7SUFDdkIsUUFBUSxFQUFFLDhCQUE4QjtDQUN6QyxDQUFDO0FBQ0YsTUFBTSxDQUFDLE1BQU0sNkJBQTZCLEdBQWE7SUFDckQsT0FBTyxFQUFFLGNBQWM7SUFDdkIsUUFBUSxFQUFFLDBCQUEwQjtDQUNyQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SW5qZWN0LCBJbmplY3RhYmxlLCBPbkRlc3Ryb3ksIFByb3ZpZGVyfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7RE9DVU1FTlR9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQge2NvZXJjZUNzc1BpeGVsVmFsdWV9IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2VyY2lvbic7XG5pbXBvcnQge0Nka1RhYmxlLCBfQ29hbGVzY2VkU3R5bGVTY2hlZHVsZXIsIF9DT0FMRVNDRURfU1RZTEVfU0NIRURVTEVSfSBmcm9tICdAYW5ndWxhci9jZGsvdGFibGUnO1xuXG5pbXBvcnQge0NvbHVtblJlc2l6ZX0gZnJvbSAnLi9jb2x1bW4tcmVzaXplJztcblxuLyoqXG4gKiBQcm92aWRlcyBhbiBpbXBsZW1lbnRhdGlvbiBmb3IgcmVzaXppbmcgYSBjb2x1bW4uXG4gKiBUaGUgZGV0YWlscyBvZiBob3cgcmVzaXppbmcgd29ya3MgZm9yIHRhYmxlcyBmb3IgZmxleCBtYXQtdGFibGVzIGFyZSBxdWl0ZSBkaWZmZXJlbnQuXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBSZXNpemVTdHJhdGVneSB7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCByZWFkb25seSBjb2x1bW5SZXNpemU6IENvbHVtblJlc2l6ZTtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IHJlYWRvbmx5IHN0eWxlU2NoZWR1bGVyOiBfQ29hbGVzY2VkU3R5bGVTY2hlZHVsZXI7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCByZWFkb25seSB0YWJsZTogQ2RrVGFibGU8dW5rbm93bj47XG5cbiAgcHJpdmF0ZSBfcGVuZGluZ1Jlc2l6ZURlbHRhOiBudW1iZXIgfCBudWxsID0gbnVsbDtcblxuICAvKiogVXBkYXRlcyB0aGUgd2lkdGggb2YgdGhlIHNwZWNpZmllZCBjb2x1bW4uICovXG4gIGFic3RyYWN0IGFwcGx5Q29sdW1uU2l6ZShcbiAgICBjc3NGcmllbmRseUNvbHVtbk5hbWU6IHN0cmluZyxcbiAgICBjb2x1bW5IZWFkZXI6IEhUTUxFbGVtZW50LFxuICAgIHNpemVJblB4OiBudW1iZXIsXG4gICAgcHJldmlvdXNTaXplSW5QeD86IG51bWJlcixcbiAgKTogdm9pZDtcblxuICAvKiogQXBwbGllcyBhIG1pbmltdW0gd2lkdGggdG8gdGhlIHNwZWNpZmllZCBjb2x1bW4sIHVwZGF0aW5nIGl0cyBjdXJyZW50IHdpZHRoIGFzIG5lZWRlZC4gKi9cbiAgYWJzdHJhY3QgYXBwbHlNaW5Db2x1bW5TaXplKFxuICAgIGNzc0ZyaWVuZGx5Q29sdW1uTmFtZTogc3RyaW5nLFxuICAgIGNvbHVtbkhlYWRlcjogSFRNTEVsZW1lbnQsXG4gICAgbWluU2l6ZUluUHg6IG51bWJlcixcbiAgKTogdm9pZDtcblxuICAvKiogQXBwbGllcyBhIG1heGltdW0gd2lkdGggdG8gdGhlIHNwZWNpZmllZCBjb2x1bW4sIHVwZGF0aW5nIGl0cyBjdXJyZW50IHdpZHRoIGFzIG5lZWRlZC4gKi9cbiAgYWJzdHJhY3QgYXBwbHlNYXhDb2x1bW5TaXplKFxuICAgIGNzc0ZyaWVuZGx5Q29sdW1uTmFtZTogc3RyaW5nLFxuICAgIGNvbHVtbkhlYWRlcjogSFRNTEVsZW1lbnQsXG4gICAgbWluU2l6ZUluUHg6IG51bWJlcixcbiAgKTogdm9pZDtcblxuICAvKiogQWRqdXN0cyB0aGUgd2lkdGggb2YgdGhlIHRhYmxlIGVsZW1lbnQgYnkgdGhlIHNwZWNpZmllZCBkZWx0YS4gKi9cbiAgcHJvdGVjdGVkIHVwZGF0ZVRhYmxlV2lkdGhBbmRTdGlja3lDb2x1bW5zKGRlbHRhOiBudW1iZXIpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fcGVuZGluZ1Jlc2l6ZURlbHRhID09PSBudWxsKSB7XG4gICAgICBjb25zdCB0YWJsZUVsZW1lbnQgPSB0aGlzLmNvbHVtblJlc2l6ZS5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQ7XG4gICAgICBjb25zdCB0YWJsZVdpZHRoID0gZ2V0RWxlbWVudFdpZHRoKHRhYmxlRWxlbWVudCk7XG5cbiAgICAgIHRoaXMuc3R5bGVTY2hlZHVsZXIuc2NoZWR1bGUoKCkgPT4ge1xuICAgICAgICB0YWJsZUVsZW1lbnQuc3R5bGUud2lkdGggPSBjb2VyY2VDc3NQaXhlbFZhbHVlKHRhYmxlV2lkdGggKyB0aGlzLl9wZW5kaW5nUmVzaXplRGVsdGEhKTtcblxuICAgICAgICB0aGlzLl9wZW5kaW5nUmVzaXplRGVsdGEgPSBudWxsO1xuICAgICAgfSk7XG5cbiAgICAgIHRoaXMuc3R5bGVTY2hlZHVsZXIuc2NoZWR1bGVFbmQoKCkgPT4ge1xuICAgICAgICB0aGlzLnRhYmxlLnVwZGF0ZVN0aWNreUNvbHVtblN0eWxlcygpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgdGhpcy5fcGVuZGluZ1Jlc2l6ZURlbHRhID0gKHRoaXMuX3BlbmRpbmdSZXNpemVEZWx0YSA/PyAwKSArIGRlbHRhO1xuICB9XG59XG5cbi8qKlxuICogVGhlIG9wdGltaWFsbHkgcGVyZm9ybWluZyByZXNpemUgc3RyYXRlZ3kgZm9yICZsdDt0YWJsZSZndDsgZWxlbWVudHMgd2l0aCB0YWJsZS1sYXlvdXQ6IGZpeGVkLlxuICogVGVzdGVkIGFnYWluc3QgYW5kIG91dHBlcmZvcm1lZDpcbiAqICAgQ1NTIHNlbGVjdG9yXG4gKiAgIENTUyBzZWxlY3RvciB3LyBDU1MgdmFyaWFibGVcbiAqICAgVXBkYXRpbmcgYWxsIGNlbGwgbm9kZXNcbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFRhYmxlTGF5b3V0Rml4ZWRSZXNpemVTdHJhdGVneSBleHRlbmRzIFJlc2l6ZVN0cmF0ZWd5IHtcbiAgY29uc3RydWN0b3IoXG4gICAgcHJvdGVjdGVkIHJlYWRvbmx5IGNvbHVtblJlc2l6ZTogQ29sdW1uUmVzaXplLFxuICAgIEBJbmplY3QoX0NPQUxFU0NFRF9TVFlMRV9TQ0hFRFVMRVIpXG4gICAgcHJvdGVjdGVkIHJlYWRvbmx5IHN0eWxlU2NoZWR1bGVyOiBfQ29hbGVzY2VkU3R5bGVTY2hlZHVsZXIsXG4gICAgcHJvdGVjdGVkIHJlYWRvbmx5IHRhYmxlOiBDZGtUYWJsZTx1bmtub3duPixcbiAgKSB7XG4gICAgc3VwZXIoKTtcbiAgfVxuXG4gIGFwcGx5Q29sdW1uU2l6ZShcbiAgICBfOiBzdHJpbmcsXG4gICAgY29sdW1uSGVhZGVyOiBIVE1MRWxlbWVudCxcbiAgICBzaXplSW5QeDogbnVtYmVyLFxuICAgIHByZXZpb3VzU2l6ZUluUHg/OiBudW1iZXIsXG4gICk6IHZvaWQge1xuICAgIGNvbnN0IGRlbHRhID0gc2l6ZUluUHggLSAocHJldmlvdXNTaXplSW5QeCA/PyBnZXRFbGVtZW50V2lkdGgoY29sdW1uSGVhZGVyKSk7XG5cbiAgICBpZiAoZGVsdGEgPT09IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLnN0eWxlU2NoZWR1bGVyLnNjaGVkdWxlKCgpID0+IHtcbiAgICAgIGNvbHVtbkhlYWRlci5zdHlsZS53aWR0aCA9IGNvZXJjZUNzc1BpeGVsVmFsdWUoc2l6ZUluUHgpO1xuICAgIH0pO1xuXG4gICAgdGhpcy51cGRhdGVUYWJsZVdpZHRoQW5kU3RpY2t5Q29sdW1ucyhkZWx0YSk7XG4gIH1cblxuICBhcHBseU1pbkNvbHVtblNpemUoXzogc3RyaW5nLCBjb2x1bW5IZWFkZXI6IEhUTUxFbGVtZW50LCBzaXplSW5QeDogbnVtYmVyKTogdm9pZCB7XG4gICAgY29uc3QgY3VycmVudFdpZHRoID0gZ2V0RWxlbWVudFdpZHRoKGNvbHVtbkhlYWRlcik7XG4gICAgY29uc3QgbmV3V2lkdGggPSBNYXRoLm1heChjdXJyZW50V2lkdGgsIHNpemVJblB4KTtcblxuICAgIHRoaXMuYXBwbHlDb2x1bW5TaXplKF8sIGNvbHVtbkhlYWRlciwgbmV3V2lkdGgsIGN1cnJlbnRXaWR0aCk7XG4gIH1cblxuICBhcHBseU1heENvbHVtblNpemUoXzogc3RyaW5nLCBjb2x1bW5IZWFkZXI6IEhUTUxFbGVtZW50LCBzaXplSW5QeDogbnVtYmVyKTogdm9pZCB7XG4gICAgY29uc3QgY3VycmVudFdpZHRoID0gZ2V0RWxlbWVudFdpZHRoKGNvbHVtbkhlYWRlcik7XG4gICAgY29uc3QgbmV3V2lkdGggPSBNYXRoLm1pbihjdXJyZW50V2lkdGgsIHNpemVJblB4KTtcblxuICAgIHRoaXMuYXBwbHlDb2x1bW5TaXplKF8sIGNvbHVtbkhlYWRlciwgbmV3V2lkdGgsIGN1cnJlbnRXaWR0aCk7XG4gIH1cbn1cblxuLyoqXG4gKiBUaGUgb3B0aW1hbGx5IHBlcmZvcm1pbmcgcmVzaXplIHN0cmF0ZWd5IGZvciBmbGV4IG1hdC10YWJsZXMuXG4gKiBUZXN0ZWQgYWdhaW5zdCBhbmQgb3V0cGVyZm9ybWVkOlxuICogICBDU1Mgc2VsZWN0b3Igdy8gQ1NTIHZhcmlhYmxlXG4gKiAgIFVwZGF0aW5nIGFsbCBtYXQtY2VsbCBub2Rlc1xuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgQ2RrRmxleFRhYmxlUmVzaXplU3RyYXRlZ3kgZXh0ZW5kcyBSZXNpemVTdHJhdGVneSBpbXBsZW1lbnRzIE9uRGVzdHJveSB7XG4gIHByaXZhdGUgcmVhZG9ubHkgX2RvY3VtZW50OiBEb2N1bWVudDtcbiAgcHJpdmF0ZSByZWFkb25seSBfY29sdW1uSW5kZXhlcyA9IG5ldyBNYXA8c3RyaW5nLCBudW1iZXI+KCk7XG4gIHByaXZhdGUgcmVhZG9ubHkgX2NvbHVtblByb3BlcnRpZXMgPSBuZXcgTWFwPHN0cmluZywgTWFwPHN0cmluZywgc3RyaW5nPj4oKTtcblxuICBwcml2YXRlIF9zdHlsZUVsZW1lbnQ/OiBIVE1MU3R5bGVFbGVtZW50O1xuICBwcml2YXRlIF9pbmRleFNlcXVlbmNlID0gMDtcblxuICBwcm90ZWN0ZWQgcmVhZG9ubHkgZGVmYXVsdE1pblNpemUgPSAwO1xuICBwcm90ZWN0ZWQgcmVhZG9ubHkgZGVmYXVsdE1heFNpemUgPSBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgY29sdW1uUmVzaXplOiBDb2x1bW5SZXNpemUsXG4gICAgQEluamVjdChfQ09BTEVTQ0VEX1NUWUxFX1NDSEVEVUxFUilcbiAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgc3R5bGVTY2hlZHVsZXI6IF9Db2FsZXNjZWRTdHlsZVNjaGVkdWxlcixcbiAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgdGFibGU6IENka1RhYmxlPHVua25vd24+LFxuICAgIEBJbmplY3QoRE9DVU1FTlQpIGRvY3VtZW50OiBhbnksXG4gICkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5fZG9jdW1lbnQgPSBkb2N1bWVudDtcbiAgfVxuXG4gIGFwcGx5Q29sdW1uU2l6ZShcbiAgICBjc3NGcmllbmRseUNvbHVtbk5hbWU6IHN0cmluZyxcbiAgICBjb2x1bW5IZWFkZXI6IEhUTUxFbGVtZW50LFxuICAgIHNpemVJblB4OiBudW1iZXIsXG4gICAgcHJldmlvdXNTaXplSW5QeD86IG51bWJlcixcbiAgKTogdm9pZCB7XG4gICAgLy8gT3B0aW1pemF0aW9uOiBDaGVjayBhcHBsaWVkIHdpZHRoIGZpcnN0IGFzIHdlIHByb2JhYmx5IHNldCBpdCBhbHJlYWR5IGJlZm9yZSByZWFkaW5nXG4gICAgLy8gb2Zmc2V0V2lkdGggd2hpY2ggdHJpZ2dlcnMgbGF5b3V0LlxuICAgIGNvbnN0IGRlbHRhID1cbiAgICAgIHNpemVJblB4IC1cbiAgICAgIChwcmV2aW91c1NpemVJblB4ID8/XG4gICAgICAgICh0aGlzLl9nZXRBcHBsaWVkV2lkdGgoY3NzRnJpZW5kbHlDb2x1bW5OYW1lKSB8fCBjb2x1bW5IZWFkZXIub2Zmc2V0V2lkdGgpKTtcblxuICAgIGlmIChkZWx0YSA9PT0gMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGNzc1NpemUgPSBjb2VyY2VDc3NQaXhlbFZhbHVlKHNpemVJblB4KTtcblxuICAgIHRoaXMuX2FwcGx5UHJvcGVydHkoY3NzRnJpZW5kbHlDb2x1bW5OYW1lLCAnZmxleCcsIGAwIDAuMDEgJHtjc3NTaXplfWApO1xuICAgIHRoaXMudXBkYXRlVGFibGVXaWR0aEFuZFN0aWNreUNvbHVtbnMoZGVsdGEpO1xuICB9XG5cbiAgYXBwbHlNaW5Db2x1bW5TaXplKGNzc0ZyaWVuZGx5Q29sdW1uTmFtZTogc3RyaW5nLCBfOiBIVE1MRWxlbWVudCwgc2l6ZUluUHg6IG51bWJlcik6IHZvaWQge1xuICAgIGNvbnN0IGNzc1NpemUgPSBjb2VyY2VDc3NQaXhlbFZhbHVlKHNpemVJblB4KTtcblxuICAgIHRoaXMuX2FwcGx5UHJvcGVydHkoXG4gICAgICBjc3NGcmllbmRseUNvbHVtbk5hbWUsXG4gICAgICAnbWluLXdpZHRoJyxcbiAgICAgIGNzc1NpemUsXG4gICAgICBzaXplSW5QeCAhPT0gdGhpcy5kZWZhdWx0TWluU2l6ZSxcbiAgICApO1xuICAgIHRoaXMudXBkYXRlVGFibGVXaWR0aEFuZFN0aWNreUNvbHVtbnMoMCk7XG4gIH1cblxuICBhcHBseU1heENvbHVtblNpemUoY3NzRnJpZW5kbHlDb2x1bW5OYW1lOiBzdHJpbmcsIF86IEhUTUxFbGVtZW50LCBzaXplSW5QeDogbnVtYmVyKTogdm9pZCB7XG4gICAgY29uc3QgY3NzU2l6ZSA9IGNvZXJjZUNzc1BpeGVsVmFsdWUoc2l6ZUluUHgpO1xuXG4gICAgdGhpcy5fYXBwbHlQcm9wZXJ0eShcbiAgICAgIGNzc0ZyaWVuZGx5Q29sdW1uTmFtZSxcbiAgICAgICdtYXgtd2lkdGgnLFxuICAgICAgY3NzU2l6ZSxcbiAgICAgIHNpemVJblB4ICE9PSB0aGlzLmRlZmF1bHRNYXhTaXplLFxuICAgICk7XG4gICAgdGhpcy51cGRhdGVUYWJsZVdpZHRoQW5kU3RpY2t5Q29sdW1ucygwKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBnZXRDb2x1bW5Dc3NDbGFzcyhjc3NGcmllbmRseUNvbHVtbk5hbWU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGBjZGstY29sdW1uLSR7Y3NzRnJpZW5kbHlDb2x1bW5OYW1lfWA7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLl9zdHlsZUVsZW1lbnQ/LnJlbW92ZSgpO1xuICAgIHRoaXMuX3N0eWxlRWxlbWVudCA9IHVuZGVmaW5lZDtcbiAgfVxuXG4gIHByaXZhdGUgX2dldFByb3BlcnR5VmFsdWUoY3NzRnJpZW5kbHlDb2x1bW5OYW1lOiBzdHJpbmcsIGtleTogc3RyaW5nKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgICBjb25zdCBwcm9wZXJ0aWVzID0gdGhpcy5fZ2V0Q29sdW1uUHJvcGVydGllc01hcChjc3NGcmllbmRseUNvbHVtbk5hbWUpO1xuICAgIHJldHVybiBwcm9wZXJ0aWVzLmdldChrZXkpO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0QXBwbGllZFdpZHRoKGNzc0ZyaWVuZHNseUNvbHVtbk5hbWU6IHN0cmluZyk6IG51bWJlciB7XG4gICAgcmV0dXJuIGNvZXJjZVBpeGVsc0Zyb21GbGV4VmFsdWUodGhpcy5fZ2V0UHJvcGVydHlWYWx1ZShjc3NGcmllbmRzbHlDb2x1bW5OYW1lLCAnZmxleCcpKTtcbiAgfVxuXG4gIHByaXZhdGUgX2FwcGx5UHJvcGVydHkoXG4gICAgY3NzRnJpZW5kbHlDb2x1bW5OYW1lOiBzdHJpbmcsXG4gICAga2V5OiBzdHJpbmcsXG4gICAgdmFsdWU6IHN0cmluZyxcbiAgICBlbmFibGUgPSB0cnVlLFxuICApOiB2b2lkIHtcbiAgICBjb25zdCBwcm9wZXJ0aWVzID0gdGhpcy5fZ2V0Q29sdW1uUHJvcGVydGllc01hcChjc3NGcmllbmRseUNvbHVtbk5hbWUpO1xuXG4gICAgdGhpcy5zdHlsZVNjaGVkdWxlci5zY2hlZHVsZSgoKSA9PiB7XG4gICAgICBpZiAoZW5hYmxlKSB7XG4gICAgICAgIHByb3BlcnRpZXMuc2V0KGtleSwgdmFsdWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcHJvcGVydGllcy5kZWxldGUoa2V5KTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX2FwcGx5U2l6ZUNzcyhjc3NGcmllbmRseUNvbHVtbk5hbWUpO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0U3R5bGVTaGVldCgpOiBDU1NTdHlsZVNoZWV0IHtcbiAgICBpZiAoIXRoaXMuX3N0eWxlRWxlbWVudCkge1xuICAgICAgdGhpcy5fc3R5bGVFbGVtZW50ID0gdGhpcy5fZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcbiAgICAgIHRoaXMuX3N0eWxlRWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLl9kb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgnJykpO1xuICAgICAgdGhpcy5fZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZCh0aGlzLl9zdHlsZUVsZW1lbnQpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9zdHlsZUVsZW1lbnQuc2hlZXQgYXMgQ1NTU3R5bGVTaGVldDtcbiAgfVxuXG4gIHByaXZhdGUgX2dldENvbHVtblByb3BlcnRpZXNNYXAoY3NzRnJpZW5kbHlDb2x1bW5OYW1lOiBzdHJpbmcpOiBNYXA8c3RyaW5nLCBzdHJpbmc+IHtcbiAgICBsZXQgcHJvcGVydGllcyA9IHRoaXMuX2NvbHVtblByb3BlcnRpZXMuZ2V0KGNzc0ZyaWVuZGx5Q29sdW1uTmFtZSk7XG4gICAgaWYgKHByb3BlcnRpZXMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcHJvcGVydGllcyA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmc+KCk7XG4gICAgICB0aGlzLl9jb2x1bW5Qcm9wZXJ0aWVzLnNldChjc3NGcmllbmRseUNvbHVtbk5hbWUsIHByb3BlcnRpZXMpO1xuICAgIH1cbiAgICByZXR1cm4gcHJvcGVydGllcztcbiAgfVxuXG4gIHByaXZhdGUgX2FwcGx5U2l6ZUNzcyhjc3NGcmllbmRseUNvbHVtbk5hbWU6IHN0cmluZykge1xuICAgIGNvbnN0IHByb3BlcnRpZXMgPSB0aGlzLl9nZXRDb2x1bW5Qcm9wZXJ0aWVzTWFwKGNzc0ZyaWVuZGx5Q29sdW1uTmFtZSk7XG4gICAgY29uc3QgcHJvcGVydHlLZXlzID0gQXJyYXkuZnJvbShwcm9wZXJ0aWVzLmtleXMoKSk7XG5cbiAgICBsZXQgaW5kZXggPSB0aGlzLl9jb2x1bW5JbmRleGVzLmdldChjc3NGcmllbmRseUNvbHVtbk5hbWUpO1xuICAgIGlmIChpbmRleCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBpZiAoIXByb3BlcnR5S2V5cy5sZW5ndGgpIHtcbiAgICAgICAgLy8gTm90aGluZyB0byBzZXQgb3IgdW5zZXQuXG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaW5kZXggPSB0aGlzLl9pbmRleFNlcXVlbmNlKys7XG4gICAgICB0aGlzLl9jb2x1bW5JbmRleGVzLnNldChjc3NGcmllbmRseUNvbHVtbk5hbWUsIGluZGV4KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fZ2V0U3R5bGVTaGVldCgpLmRlbGV0ZVJ1bGUoaW5kZXgpO1xuICAgIH1cblxuICAgIGNvbnN0IGNvbHVtbkNsYXNzTmFtZSA9IHRoaXMuZ2V0Q29sdW1uQ3NzQ2xhc3MoY3NzRnJpZW5kbHlDb2x1bW5OYW1lKTtcbiAgICBjb25zdCB0YWJsZUNsYXNzTmFtZSA9IHRoaXMuY29sdW1uUmVzaXplLmdldFVuaXF1ZUNzc0NsYXNzKCk7XG5cbiAgICBjb25zdCBzZWxlY3RvciA9IGAuJHt0YWJsZUNsYXNzTmFtZX0gLiR7Y29sdW1uQ2xhc3NOYW1lfWA7XG4gICAgY29uc3QgYm9keSA9IHByb3BlcnR5S2V5cy5tYXAoa2V5ID0+IGAke2tleX06JHtwcm9wZXJ0aWVzLmdldChrZXkpfWApLmpvaW4oJzsnKTtcblxuICAgIHRoaXMuX2dldFN0eWxlU2hlZXQoKS5pbnNlcnRSdWxlKGAke3NlbGVjdG9yfSB7JHtib2R5fX1gLCBpbmRleCEpO1xuICB9XG59XG5cbi8qKiBDb252ZXJ0cyBDU1MgcGl4ZWwgdmFsdWVzIHRvIG51bWJlcnMsIGVnIFwiMTIzcHhcIiB0byAxMjMuIFJldHVybnMgTmFOIGZvciBub24gcGl4ZWwgdmFsdWVzLiAqL1xuZnVuY3Rpb24gY29lcmNlUGl4ZWxzRnJvbUNzc1ZhbHVlKGNzc1ZhbHVlOiBzdHJpbmcpOiBudW1iZXIge1xuICByZXR1cm4gTnVtYmVyKGNzc1ZhbHVlLm1hdGNoKC8oXFxkKylweC8pPy5bMV0pO1xufVxuXG4vKiogR2V0cyB0aGUgc3R5bGUud2lkdGggcGl4ZWxzIG9uIHRoZSBzcGVjaWZpZWQgZWxlbWVudCBpZiBwcmVzZW50LCBvdGhlcndpc2UgaXRzIG9mZnNldFdpZHRoLiAqL1xuZnVuY3Rpb24gZ2V0RWxlbWVudFdpZHRoKGVsZW1lbnQ6IEhUTUxFbGVtZW50KSB7XG4gIC8vIE9wdGltaXphdGlvbjogQ2hlY2sgc3R5bGUud2lkdGggZmlyc3QgYXMgd2UgcHJvYmFibHkgc2V0IGl0IGFscmVhZHkgYmVmb3JlIHJlYWRpbmdcbiAgLy8gb2Zmc2V0V2lkdGggd2hpY2ggdHJpZ2dlcnMgbGF5b3V0LlxuICByZXR1cm4gY29lcmNlUGl4ZWxzRnJvbUNzc1ZhbHVlKGVsZW1lbnQuc3R5bGUud2lkdGgpIHx8IGVsZW1lbnQub2Zmc2V0V2lkdGg7XG59XG5cbi8qKlxuICogQ29udmVydHMgQ1NTIGZsZXggdmFsdWVzIGFzIHNldCBpbiBDZGtGbGV4VGFibGVSZXNpemVTdHJhdGVneSB0byBudW1iZXJzLFxuICogZWcgXCIwIDAuMDEgMTIzcHhcIiB0byAxMjMuXG4gKi9cbmZ1bmN0aW9uIGNvZXJjZVBpeGVsc0Zyb21GbGV4VmFsdWUoZmxleFZhbHVlOiBzdHJpbmcgfCB1bmRlZmluZWQpOiBudW1iZXIge1xuICByZXR1cm4gTnVtYmVyKGZsZXhWYWx1ZT8ubWF0Y2goLzAgMFxcLjAxIChcXGQrKXB4Lyk/LlsxXSk7XG59XG5cbmV4cG9ydCBjb25zdCBUQUJMRV9MQVlPVVRfRklYRURfUkVTSVpFX1NUUkFURUdZX1BST1ZJREVSOiBQcm92aWRlciA9IHtcbiAgcHJvdmlkZTogUmVzaXplU3RyYXRlZ3ksXG4gIHVzZUNsYXNzOiBUYWJsZUxheW91dEZpeGVkUmVzaXplU3RyYXRlZ3ksXG59O1xuZXhwb3J0IGNvbnN0IEZMRVhfUkVTSVpFX1NUUkFURUdZX1BST1ZJREVSOiBQcm92aWRlciA9IHtcbiAgcHJvdmlkZTogUmVzaXplU3RyYXRlZ3ksXG4gIHVzZUNsYXNzOiBDZGtGbGV4VGFibGVSZXNpemVTdHJhdGVneSxcbn07XG4iXX0=