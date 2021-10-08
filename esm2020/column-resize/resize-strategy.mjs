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
ResizeStrategy.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.0-next.15", ngImport: i0, type: ResizeStrategy, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
ResizeStrategy.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.0-next.15", ngImport: i0, type: ResizeStrategy });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.0-next.15", ngImport: i0, type: ResizeStrategy, decorators: [{
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
TableLayoutFixedResizeStrategy.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.0-next.15", ngImport: i0, type: TableLayoutFixedResizeStrategy, deps: [{ token: i1.ColumnResize }, { token: _COALESCED_STYLE_SCHEDULER }, { token: i2.CdkTable }], target: i0.ɵɵFactoryTarget.Injectable });
TableLayoutFixedResizeStrategy.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.0-next.15", ngImport: i0, type: TableLayoutFixedResizeStrategy });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.0-next.15", ngImport: i0, type: TableLayoutFixedResizeStrategy, decorators: [{
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
        const delta = sizeInPx - (previousSizeInPx ??
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
CdkFlexTableResizeStrategy.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.0-next.15", ngImport: i0, type: CdkFlexTableResizeStrategy, deps: [{ token: i1.ColumnResize }, { token: _COALESCED_STYLE_SCHEDULER }, { token: i2.CdkTable }, { token: DOCUMENT }], target: i0.ɵɵFactoryTarget.Injectable });
CdkFlexTableResizeStrategy.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.0-next.15", ngImport: i0, type: CdkFlexTableResizeStrategy });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.0-next.15", ngImport: i0, type: CdkFlexTableResizeStrategy, decorators: [{
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzaXplLXN0cmF0ZWd5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvY29sdW1uLXJlc2l6ZS9yZXNpemUtc3RyYXRlZ3kudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLE1BQU0sRUFBRSxVQUFVLEVBQXNCLE1BQU0sZUFBZSxDQUFDO0FBQ3RFLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUN6QyxPQUFPLEVBQUMsbUJBQW1CLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUMxRCxPQUFPLEVBQUMsUUFBUSxFQUFFLHdCQUF3QixFQUFFLDBCQUEwQixFQUFDLE1BQU0sb0JBQW9CLENBQUM7QUFFbEcsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGlCQUFpQixDQUFDOzs7O0FBRTdDOzs7R0FHRztBQUVILE1BQU0sT0FBZ0IsY0FBYztJQURwQztRQU1VLHdCQUFtQixHQUFnQixJQUFJLENBQUM7S0F3Q2pEO0lBbkJDLHFFQUFxRTtJQUMzRCxnQ0FBZ0MsQ0FBQyxLQUFhO1FBQ3RELElBQUksSUFBSSxDQUFDLG1CQUFtQixLQUFLLElBQUksRUFBRTtZQUNyQyxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUM7WUFDaEUsTUFBTSxVQUFVLEdBQUcsZUFBZSxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBRWpELElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRTtnQkFDaEMsWUFBWSxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsbUJBQW1CLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxtQkFBb0IsQ0FBQyxDQUFDO2dCQUV2RixJQUFJLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxDQUFDO1lBQ2xDLENBQUMsQ0FBQyxDQUFDO1lBRUgsSUFBSSxDQUFD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QUMsV0FBVyxDQUFDO0FBQzlFLENBQUM7QUFFRDs7O0dBR0c7QUFDSCxTQUFTLHlCQUF5QixDQUFDLFNBQTJCO0lBQzVELE9BQU8sTUFBTSxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsaUJBQWlCLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDMUQsQ0FBQztBQUVELE1BQU0sQ0FBQyxNQUFNLDJDQUEyQyxHQUFhO0lBQ25FLE9BQU8sRUFBRSxjQUFjO0lBQ3ZCLFFBQVEsRUFBRSw4QkFBOEI7Q0FDekMsQ0FBQztBQUNGLE1BQU0sQ0FBQyxNQUFNLDZCQUE2QixHQUFhO0lBQ3JELE9BQU8sRUFBRSxjQUFjO0lBQ3ZCLFFBQVEsRUFBRSwwQkFBMEI7Q0FDckMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0luamVjdCwgSW5qZWN0YWJsZSwgT25EZXN0cm95LCBQcm92aWRlcn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0RPQ1VNRU5UfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHtjb2VyY2VDc3NQaXhlbFZhbHVlfSBmcm9tICdAYW5ndWxhci9jZGsvY29lcmNpb24nO1xuaW1wb3J0IHtDZGtUYWJsZSwgX0NvYWxlc2NlZFN0eWxlU2NoZWR1bGVyLCBfQ09BTEVTQ0VEX1NUWUxFX1NDSEVEVUxFUn0gZnJvbSAnQGFuZ3VsYXIvY2RrL3RhYmxlJztcblxuaW1wb3J0IHtDb2x1bW5SZXNpemV9IGZyb20gJy4vY29sdW1uLXJlc2l6ZSc7XG5cbi8qKlxuICogUHJvdmlkZXMgYW4gaW1wbGVtZW50YXRpb24gZm9yIHJlc2l6aW5nIGEgY29sdW1uLlxuICogVGhlIGRldGFpbHMgb2YgaG93IHJlc2l6aW5nIHdvcmtzIGZvciB0YWJsZXMgZm9yIGZsZXggbWF0LXRhYmxlcyBhcmUgcXVpdGUgZGlmZmVyZW50LlxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgUmVzaXplU3RyYXRlZ3kge1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgcmVhZG9ubHkgY29sdW1uUmVzaXplOiBDb2x1bW5SZXNpemU7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCByZWFkb25seSBzdHlsZVNjaGVkdWxlcjogX0NvYWxlc2NlZFN0eWxlU2NoZWR1bGVyO1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgcmVhZG9ubHkgdGFibGU6IENka1RhYmxlPHVua25vd24+O1xuXG4gIHByaXZhdGUgX3BlbmRpbmdSZXNpemVEZWx0YTogbnVtYmVyfG51bGwgPSBudWxsO1xuXG4gIC8qKiBVcGRhdGVzIHRoZSB3aWR0aCBvZiB0aGUgc3BlY2lmaWVkIGNvbHVtbi4gKi9cbiAgYWJzdHJhY3QgYXBwbHlDb2x1bW5TaXplKFxuICAgICAgY3NzRnJpZW5kbHlDb2x1bW5OYW1lOiBzdHJpbmcsXG4gICAgICBjb2x1bW5IZWFkZXI6IEhUTUxFbGVtZW50LFxuICAgICAgc2l6ZUluUHg6IG51bWJlcixcbiAgICAgIHByZXZpb3VzU2l6ZUluUHg/OiBudW1iZXIpOiB2b2lkO1xuXG4gIC8qKiBBcHBsaWVzIGEgbWluaW11bSB3aWR0aCB0byB0aGUgc3BlY2lmaWVkIGNvbHVtbiwgdXBkYXRpbmcgaXRzIGN1cnJlbnQgd2lkdGggYXMgbmVlZGVkLiAqL1xuICBhYnN0cmFjdCBhcHBseU1pbkNvbHVtblNpemUoXG4gICAgICBjc3NGcmllbmRseUNvbHVtbk5hbWU6IHN0cmluZyxcbiAgICAgIGNvbHVtbkhlYWRlcjogSFRNTEVsZW1lbnQsXG4gICAgICBtaW5TaXplSW5QeDogbnVtYmVyKTogdm9pZDtcblxuICAvKiogQXBwbGllcyBhIG1heGltdW0gd2lkdGggdG8gdGhlIHNwZWNpZmllZCBjb2x1bW4sIHVwZGF0aW5nIGl0cyBjdXJyZW50IHdpZHRoIGFzIG5lZWRlZC4gKi9cbiAgYWJzdHJhY3QgYXBwbHlNYXhDb2x1bW5TaXplKFxuICAgICAgY3NzRnJpZW5kbHlDb2x1bW5OYW1lOiBzdHJpbmcsXG4gICAgICBjb2x1bW5IZWFkZXI6IEhUTUxFbGVtZW50LFxuICAgICAgbWluU2l6ZUluUHg6IG51bWJlcik6IHZvaWQ7XG5cbiAgLyoqIEFkanVzdHMgdGhlIHdpZHRoIG9mIHRoZSB0YWJsZSBlbGVtZW50IGJ5IHRoZSBzcGVjaWZpZWQgZGVsdGEuICovXG4gIHByb3RlY3RlZCB1cGRhdGVUYWJsZVdpZHRoQW5kU3RpY2t5Q29sdW1ucyhkZWx0YTogbnVtYmVyKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX3BlbmRpbmdSZXNpemVEZWx0YSA9PT0gbnVsbCkge1xuICAgICAgY29uc3QgdGFibGVFbGVtZW50ID0gdGhpcy5jb2x1bW5SZXNpemUuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50O1xuICAgICAgY29uc3QgdGFibGVXaWR0aCA9IGdldEVsZW1lbnRXaWR0aCh0YWJsZUVsZW1lbnQpO1xuXG4gICAgICB0aGlzLnN0eWxlU2NoZWR1bGVyLnNjaGVkdWxlKCgpID0+IHtcbiAgICAgICAgdGFibGVFbGVtZW50LnN0eWxlLndpZHRoID0gY29lcmNlQ3NzUGl4ZWxWYWx1ZSh0YWJsZVdpZHRoICsgdGhpcy5fcGVuZGluZ1Jlc2l6ZURlbHRhISk7XG5cbiAgICAgICAgdGhpcy5fcGVuZGluZ1Jlc2l6ZURlbHRhID0gbnVsbDtcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLnN0eWxlU2NoZWR1bGVyLnNjaGVkdWxlRW5kKCgpID0+IHtcbiAgICAgICAgdGhpcy50YWJsZS51cGRhdGVTdGlja3lDb2x1bW5TdHlsZXMoKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHRoaXMuX3BlbmRpbmdSZXNpemVEZWx0YSA9ICh0aGlzLl9wZW5kaW5nUmVzaXplRGVsdGEgPz8gMCkgKyBkZWx0YTtcbiAgfVxufVxuXG4vKipcbiAqIFRoZSBvcHRpbWlhbGx5IHBlcmZvcm1pbmcgcmVzaXplIHN0cmF0ZWd5IGZvciAmbHQ7dGFibGUmZ3Q7IGVsZW1lbnRzIHdpdGggdGFibGUtbGF5b3V0OiBmaXhlZC5cbiAqIFRlc3RlZCBhZ2FpbnN0IGFuZCBvdXRwZXJmb3JtZWQ6XG4gKiAgIENTUyBzZWxlY3RvclxuICogICBDU1Mgc2VsZWN0b3Igdy8gQ1NTIHZhcmlhYmxlXG4gKiAgIFVwZGF0aW5nIGFsbCBjZWxsIG5vZGVzXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBUYWJsZUxheW91dEZpeGVkUmVzaXplU3RyYXRlZ3kgZXh0ZW5kcyBSZXNpemVTdHJhdGVneSB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJvdGVjdGVkIHJlYWRvbmx5IGNvbHVtblJlc2l6ZTogQ29sdW1uUmVzaXplLFxuICAgICAgQEluamVjdChfQ09BTEVTQ0VEX1NUWUxFX1NDSEVEVUxFUilcbiAgICAgICAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgc3R5bGVTY2hlZHVsZXI6IF9Db2FsZXNjZWRTdHlsZVNjaGVkdWxlcixcbiAgICAgIHByb3RlY3RlZCByZWFkb25seSB0YWJsZTogQ2RrVGFibGU8dW5rbm93bj4pIHtcbiAgICBzdXBlcigpO1xuICB9XG5cbiAgYXBwbHlDb2x1bW5TaXplKF86IHN0cmluZywgY29sdW1uSGVhZGVyOiBIVE1MRWxlbWVudCwgc2l6ZUluUHg6IG51bWJlcixcbiAgICAgIHByZXZpb3VzU2l6ZUluUHg/OiBudW1iZXIpOiB2b2lkIHtcbiAgICBjb25zdCBkZWx0YSA9IHNpemVJblB4IC0gKHByZXZpb3VzU2l6ZUluUHggPz8gZ2V0RWxlbWVudFdpZHRoKGNvbHVtbkhlYWRlcikpO1xuXG4gICAgaWYgKGRlbHRhID09PSAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5zdHlsZVNjaGVkdWxlci5zY2hlZHVsZSgoKSA9PiB7XG4gICAgICBjb2x1bW5IZWFkZXIuc3R5bGUud2lkdGggPSBjb2VyY2VDc3NQaXhlbFZhbHVlKHNpemVJblB4KTtcbiAgICB9KTtcblxuICAgIHRoaXMudXBkYXRlVGFibGVXaWR0aEFuZFN0aWNreUNvbHVtbnMoZGVsdGEpO1xuICB9XG5cbiAgYXBwbHlNaW5Db2x1bW5TaXplKF86IHN0cmluZywgY29sdW1uSGVhZGVyOiBIVE1MRWxlbWVudCwgc2l6ZUluUHg6IG51bWJlcik6IHZvaWQge1xuICAgIGNvbnN0IGN1cnJlbnRXaWR0aCA9IGdldEVsZW1lbnRXaWR0aChjb2x1bW5IZWFkZXIpO1xuICAgIGNvbnN0IG5ld1dpZHRoID0gTWF0aC5tYXgoY3VycmVudFdpZHRoLCBzaXplSW5QeCk7XG5cbiAgICB0aGlzLmFwcGx5Q29sdW1uU2l6ZShfLCBjb2x1bW5IZWFkZXIsIG5ld1dpZHRoLCBjdXJyZW50V2lkdGgpO1xuICB9XG5cbiAgYXBwbHlNYXhDb2x1bW5TaXplKF86IHN0cmluZywgY29sdW1uSGVhZGVyOiBIVE1MRWxlbWVudCwgc2l6ZUluUHg6IG51bWJlcik6IHZvaWQge1xuICAgIGNvbnN0IGN1cnJlbnRXaWR0aCA9IGdldEVsZW1lbnRXaWR0aChjb2x1bW5IZWFkZXIpO1xuICAgIGNvbnN0IG5ld1dpZHRoID0gTWF0aC5taW4oY3VycmVudFdpZHRoLCBzaXplSW5QeCk7XG5cbiAgICB0aGlzLmFwcGx5Q29sdW1uU2l6ZShfLCBjb2x1bW5IZWFkZXIsIG5ld1dpZHRoLCBjdXJyZW50V2lkdGgpO1xuICB9XG59XG5cbi8qKlxuICogVGhlIG9wdGltYWxseSBwZXJmb3JtaW5nIHJlc2l6ZSBzdHJhdGVneSBmb3IgZmxleCBtYXQtdGFibGVzLlxuICogVGVzdGVkIGFnYWluc3QgYW5kIG91dHBlcmZvcm1lZDpcbiAqICAgQ1NTIHNlbGVjdG9yIHcvIENTUyB2YXJpYWJsZVxuICogICBVcGRhdGluZyBhbGwgbWF0LWNlbGwgbm9kZXNcbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIENka0ZsZXhUYWJsZVJlc2l6ZVN0cmF0ZWd5IGV4dGVuZHMgUmVzaXplU3RyYXRlZ3kgaW1wbGVtZW50cyBPbkRlc3Ryb3kge1xuICBwcml2YXRlIHJlYWRvbmx5IF9kb2N1bWVudDogRG9jdW1lbnQ7XG4gIHByaXZhdGUgcmVhZG9ubHkgX2NvbHVtbkluZGV4ZXMgPSBuZXcgTWFwPHN0cmluZywgbnVtYmVyPigpO1xuICBwcml2YXRlIHJlYWRvbmx5IF9jb2x1bW5Qcm9wZXJ0aWVzID0gbmV3IE1hcDxzdHJpbmcsIE1hcDxzdHJpbmcsIHN0cmluZz4+KCk7XG5cbiAgcHJpdmF0ZSBfc3R5bGVFbGVtZW50PzogSFRNTFN0eWxlRWxlbWVudDtcbiAgcHJpdmF0ZSBfaW5kZXhTZXF1ZW5jZSA9IDA7XG5cbiAgcHJvdGVjdGVkIHJlYWRvbmx5IGRlZmF1bHRNaW5TaXplID0gMDtcbiAgcHJvdGVjdGVkIHJlYWRvbmx5IGRlZmF1bHRNYXhTaXplID0gTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVI7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgY29sdW1uUmVzaXplOiBDb2x1bW5SZXNpemUsXG4gICAgICBASW5qZWN0KF9DT0FMRVNDRURfU1RZTEVfU0NIRURVTEVSKVxuICAgICAgICAgIHByb3RlY3RlZCByZWFkb25seSBzdHlsZVNjaGVkdWxlcjogX0NvYWxlc2NlZFN0eWxlU2NoZWR1bGVyLFxuICAgICAgcHJvdGVjdGVkIHJlYWRvbmx5IHRhYmxlOiBDZGtUYWJsZTx1bmtub3duPixcbiAgICAgIEBJbmplY3QoRE9DVU1FTlQpIGRvY3VtZW50OiBhbnkpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuX2RvY3VtZW50ID0gZG9jdW1lbnQ7XG4gIH1cblxuICBhcHBseUNvbHVtblNpemUoY3NzRnJpZW5kbHlDb2x1bW5OYW1lOiBzdHJpbmcsIGNvbHVtbkhlYWRlcjogSFRNTEVsZW1lbnQsXG4gICAgICBzaXplSW5QeDogbnVtYmVyLCBwcmV2aW91c1NpemVJblB4PzogbnVtYmVyKTogdm9pZCB7XG4gICAgLy8gT3B0aW1pemF0aW9uOiBDaGVjayBhcHBsaWVkIHdpZHRoIGZpcnN0IGFzIHdlIHByb2JhYmx5IHNldCBpdCBhbHJlYWR5IGJlZm9yZSByZWFkaW5nXG4gICAgLy8gb2Zmc2V0V2lkdGggd2hpY2ggdHJpZ2dlcnMgbGF5b3V0LlxuICAgIGNvbnN0IGRlbHRhID0gc2l6ZUluUHggLSAocHJldmlvdXNTaXplSW5QeCA/P1xuICAgICAgICAodGhpcy5fZ2V0QXBwbGllZFdpZHRoKGNzc0ZyaWVuZGx5Q29sdW1uTmFtZSkgfHwgY29sdW1uSGVhZGVyLm9mZnNldFdpZHRoKSk7XG5cbiAgICBpZiAoZGVsdGEgPT09IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBjc3NTaXplID0gY29lcmNlQ3NzUGl4ZWxWYWx1ZShzaXplSW5QeCk7XG5cbiAgICB0aGlzLl9hcHBseVByb3BlcnR5KGNzc0ZyaWVuZGx5Q29sdW1uTmFtZSwgJ2ZsZXgnLCBgMCAwLjAxICR7Y3NzU2l6ZX1gKTtcbiAgICB0aGlzLnVwZGF0ZVRhYmxlV2lkdGhBbmRTdGlja3lDb2x1bW5zKGRlbHRhKTtcbiAgfVxuXG4gIGFwcGx5TWluQ29sdW1uU2l6ZShjc3NGcmllbmRseUNvbHVtbk5hbWU6IHN0cmluZywgXzogSFRNTEVsZW1lbnQsIHNpemVJblB4OiBudW1iZXIpOiB2b2lkIHtcbiAgICBjb25zdCBjc3NTaXplID0gY29lcmNlQ3NzUGl4ZWxWYWx1ZShzaXplSW5QeCk7XG5cbiAgICB0aGlzLl9hcHBseVByb3BlcnR5KGNzc0ZyaWVuZGx5Q29sdW1uTmFtZSwgJ21pbi13aWR0aCcsIGNzc1NpemUsXG4gICAgICAgIHNpemVJblB4ICE9PSB0aGlzLmRlZmF1bHRNaW5TaXplKTtcbiAgICB0aGlzLnVwZGF0ZVRhYmxlV2lkdGhBbmRTdGlja3lDb2x1bW5zKDApO1xuICB9XG5cbiAgYXBwbHlNYXhDb2x1bW5TaXplKGNzc0ZyaWVuZGx5Q29sdW1uTmFtZTogc3RyaW5nLCBfOiBIVE1MRWxlbWVudCwgc2l6ZUluUHg6IG51bWJlcik6IHZvaWQge1xuICAgIGNvbnN0IGNzc1NpemUgPSBjb2VyY2VDc3NQaXhlbFZhbHVlKHNpemVJblB4KTtcblxuICAgIHRoaXMuX2FwcGx5UHJvcGVydHkoY3NzRnJpZW5kbHlDb2x1bW5OYW1lLCAnbWF4LXdpZHRoJywgY3NzU2l6ZSxcbiAgICAgICAgc2l6ZUluUHggIT09IHRoaXMuZGVmYXVsdE1heFNpemUpO1xuICAgIHRoaXMudXBkYXRlVGFibGVXaWR0aEFuZFN0aWNreUNvbHVtbnMoMCk7XG4gIH1cblxuICBwcm90ZWN0ZWQgZ2V0Q29sdW1uQ3NzQ2xhc3MoY3NzRnJpZW5kbHlDb2x1bW5OYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBgY2RrLWNvbHVtbi0ke2Nzc0ZyaWVuZGx5Q29sdW1uTmFtZX1gO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgdGhpcy5fc3R5bGVFbGVtZW50Py5yZW1vdmUoKTtcbiAgICB0aGlzLl9zdHlsZUVsZW1lbnQgPSB1bmRlZmluZWQ7XG4gIH1cblxuICBwcml2YXRlIF9nZXRQcm9wZXJ0eVZhbHVlKGNzc0ZyaWVuZGx5Q29sdW1uTmFtZTogc3RyaW5nLCBrZXk6IHN0cmluZyk6IHN0cmluZ3x1bmRlZmluZWQge1xuICAgIGNvbnN0IHByb3BlcnRpZXMgPSB0aGlzLl9nZXRDb2x1bW5Qcm9wZXJ0aWVzTWFwKGNzc0ZyaWVuZGx5Q29sdW1uTmFtZSk7XG4gICAgcmV0dXJuIHByb3BlcnRpZXMuZ2V0KGtleSk7XG4gIH1cblxuICBwcml2YXRlIF9nZXRBcHBsaWVkV2lkdGgoY3NzRnJpZW5kc2x5Q29sdW1uTmFtZTogc3RyaW5nKTogbnVtYmVyIHtcbiAgICByZXR1cm4gY29lcmNlUGl4ZWxzRnJvbUZsZXhWYWx1ZSh0aGlzLl9nZXRQcm9wZXJ0eVZhbHVlKGNzc0ZyaWVuZHNseUNvbHVtbk5hbWUsICdmbGV4JykpO1xuICB9XG5cbiAgcHJpdmF0ZSBfYXBwbHlQcm9wZXJ0eShcbiAgICAgIGNzc0ZyaWVuZGx5Q29sdW1uTmFtZTogc3RyaW5nLFxuICAgICAga2V5OiBzdHJpbmcsXG4gICAgICB2YWx1ZTogc3RyaW5nLFxuICAgICAgZW5hYmxlID0gdHJ1ZSk6IHZvaWQge1xuICAgIGNvbnN0IHByb3BlcnRpZXMgPSB0aGlzLl9nZXRDb2x1bW5Qcm9wZXJ0aWVzTWFwKGNzc0ZyaWVuZGx5Q29sdW1uTmFtZSk7XG5cbiAgICB0aGlzLnN0eWxlU2NoZWR1bGVyLnNjaGVkdWxlKCgpID0+IHtcbiAgICAgIGlmIChlbmFibGUpIHtcbiAgICAgICAgcHJvcGVydGllcy5zZXQoa2V5LCB2YWx1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwcm9wZXJ0aWVzLmRlbGV0ZShrZXkpO1xuICAgICAgfVxuICAgICAgdGhpcy5fYXBwbHlTaXplQ3NzKGNzc0ZyaWVuZGx5Q29sdW1uTmFtZSk7XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIF9nZXRTdHlsZVNoZWV0KCk6IENTU1N0eWxlU2hlZXQge1xuICAgIGlmICghdGhpcy5fc3R5bGVFbGVtZW50KSB7XG4gICAgICB0aGlzLl9zdHlsZUVsZW1lbnQgPSB0aGlzLl9kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuICAgICAgdGhpcy5fc3R5bGVFbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuX2RvY3VtZW50LmNyZWF0ZVRleHROb2RlKCcnKSk7XG4gICAgICB0aGlzLl9kb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHRoaXMuX3N0eWxlRWxlbWVudCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX3N0eWxlRWxlbWVudC5zaGVldCBhcyBDU1NTdHlsZVNoZWV0O1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0Q29sdW1uUHJvcGVydGllc01hcChjc3NGcmllbmRseUNvbHVtbk5hbWU6IHN0cmluZyk6IE1hcDxzdHJpbmcsIHN0cmluZz4ge1xuICAgIGxldCBwcm9wZXJ0aWVzID0gdGhpcy5fY29sdW1uUHJvcGVydGllcy5nZXQoY3NzRnJpZW5kbHlDb2x1bW5OYW1lKTtcbiAgICBpZiAocHJvcGVydGllcyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBwcm9wZXJ0aWVzID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZz4oKTtcbiAgICAgIHRoaXMuX2NvbHVtblByb3BlcnRpZXMuc2V0KGNzc0ZyaWVuZGx5Q29sdW1uTmFtZSwgcHJvcGVydGllcyk7XG4gICAgfVxuICAgIHJldHVybiBwcm9wZXJ0aWVzO1xuICB9XG5cbiAgcHJpdmF0ZSBfYXBwbHlTaXplQ3NzKGNzc0ZyaWVuZGx5Q29sdW1uTmFtZTogc3RyaW5nKSB7XG4gICAgY29uc3QgcHJvcGVydGllcyA9IHRoaXMuX2dldENvbHVtblByb3BlcnRpZXNNYXAoY3NzRnJpZW5kbHlDb2x1bW5OYW1lKTtcbiAgICBjb25zdCBwcm9wZXJ0eUtleXMgPSBBcnJheS5mcm9tKHByb3BlcnRpZXMua2V5cygpKTtcblxuICAgIGxldCBpbmRleCA9IHRoaXMuX2NvbHVtbkluZGV4ZXMuZ2V0KGNzc0ZyaWVuZGx5Q29sdW1uTmFtZSk7XG4gICAgaWYgKGluZGV4ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGlmICghcHJvcGVydHlLZXlzLmxlbmd0aCkge1xuICAgICAgICAvLyBOb3RoaW5nIHRvIHNldCBvciB1bnNldC5cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpbmRleCA9IHRoaXMuX2luZGV4U2VxdWVuY2UrKztcbiAgICAgIHRoaXMuX2NvbHVtbkluZGV4ZXMuc2V0KGNzc0ZyaWVuZGx5Q29sdW1uTmFtZSwgaW5kZXgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9nZXRTdHlsZVNoZWV0KCkuZGVsZXRlUnVsZShpbmRleCk7XG4gICAgfVxuXG4gICAgY29uc3QgY29sdW1uQ2xhc3NOYW1lID0gdGhpcy5nZXRDb2x1bW5Dc3NDbGFzcyhjc3NGcmllbmRseUNvbHVtbk5hbWUpO1xuICAgIGNvbnN0IHRhYmxlQ2xhc3NOYW1lID0gdGhpcy5jb2x1bW5SZXNpemUuZ2V0VW5pcXVlQ3NzQ2xhc3MoKTtcblxuICAgIGNvbnN0IHNlbGVjdG9yID0gYC4ke3RhYmxlQ2xhc3NOYW1lfSAuJHtjb2x1bW5DbGFzc05hbWV9YDtcbiAgICBjb25zdCBib2R5ID0gcHJvcGVydHlLZXlzLm1hcChrZXkgPT4gYCR7a2V5fToke3Byb3BlcnRpZXMuZ2V0KGtleSl9YCkuam9pbignOycpO1xuXG4gICAgdGhpcy5fZ2V0U3R5bGVTaGVldCgpLmluc2VydFJ1bGUoYCR7c2VsZWN0b3J9IHske2JvZHl9fWAsIGluZGV4ISk7XG4gIH1cbn1cblxuLyoqIENvbnZlcnRzIENTUyBwaXhlbCB2YWx1ZXMgdG8gbnVtYmVycywgZWcgXCIxMjNweFwiIHRvIDEyMy4gUmV0dXJucyBOYU4gZm9yIG5vbiBwaXhlbCB2YWx1ZXMuICovXG5mdW5jdGlvbiBjb2VyY2VQaXhlbHNGcm9tQ3NzVmFsdWUoY3NzVmFsdWU6IHN0cmluZyk6IG51bWJlciB7XG4gIHJldHVybiBOdW1iZXIoY3NzVmFsdWUubWF0Y2goLyhcXGQrKXB4Lyk/LlsxXSk7XG59XG5cbi8qKiBHZXRzIHRoZSBzdHlsZS53aWR0aCBwaXhlbHMgb24gdGhlIHNwZWNpZmllZCBlbGVtZW50IGlmIHByZXNlbnQsIG90aGVyd2lzZSBpdHMgb2Zmc2V0V2lkdGguICovXG5mdW5jdGlvbiBnZXRFbGVtZW50V2lkdGgoZWxlbWVudDogSFRNTEVsZW1lbnQpIHtcbiAgLy8gT3B0aW1pemF0aW9uOiBDaGVjayBzdHlsZS53aWR0aCBmaXJzdCBhcyB3ZSBwcm9iYWJseSBzZXQgaXQgYWxyZWFkeSBiZWZvcmUgcmVhZGluZ1xuICAvLyBvZmZzZXRXaWR0aCB3aGljaCB0cmlnZ2VycyBsYXlvdXQuXG4gIHJldHVybiBjb2VyY2VQaXhlbHNGcm9tQ3NzVmFsdWUoZWxlbWVudC5zdHlsZS53aWR0aCkgfHwgZWxlbWVudC5vZmZzZXRXaWR0aDtcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBDU1MgZmxleCB2YWx1ZXMgYXMgc2V0IGluIENka0ZsZXhUYWJsZVJlc2l6ZVN0cmF0ZWd5IHRvIG51bWJlcnMsXG4gKiBlZyBcIjAgMC4wMSAxMjNweFwiIHRvIDEyMy5cbiAqL1xuZnVuY3Rpb24gY29lcmNlUGl4ZWxzRnJvbUZsZXhWYWx1ZShmbGV4VmFsdWU6IHN0cmluZ3x1bmRlZmluZWQpOiBudW1iZXIge1xuICByZXR1cm4gTnVtYmVyKGZsZXhWYWx1ZT8ubWF0Y2goLzAgMFxcLjAxIChcXGQrKXB4Lyk/LlsxXSk7XG59XG5cbmV4cG9ydCBjb25zdCBUQUJMRV9MQVlPVVRfRklYRURfUkVTSVpFX1NUUkFURUdZX1BST1ZJREVSOiBQcm92aWRlciA9IHtcbiAgcHJvdmlkZTogUmVzaXplU3RyYXRlZ3ksXG4gIHVzZUNsYXNzOiBUYWJsZUxheW91dEZpeGVkUmVzaXplU3RyYXRlZ3ksXG59O1xuZXhwb3J0IGNvbnN0IEZMRVhfUkVTSVpFX1NUUkFURUdZX1BST1ZJREVSOiBQcm92aWRlciA9IHtcbiAgcHJvdmlkZTogUmVzaXplU3RyYXRlZ3ksXG4gIHVzZUNsYXNzOiBDZGtGbGV4VGFibGVSZXNpemVTdHJhdGVneSxcbn07XG4iXX0=