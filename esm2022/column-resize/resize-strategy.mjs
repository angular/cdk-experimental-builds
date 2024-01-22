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
                this.styleScheduler.flushAfterRender();
            });
        }
        this._pendingResizeDelta = (this._pendingResizeDelta ?? 0) + delta;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.1.0-next.5", ngImport: i0, type: ResizeStrategy, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "17.1.0-next.5", ngImport: i0, type: ResizeStrategy }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.1.0-next.5", ngImport: i0, type: ResizeStrategy, decorators: [{
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.1.0-next.5", ngImport: i0, type: TableLayoutFixedResizeStrategy, deps: [{ token: i1.ColumnResize }, { token: _COALESCED_STYLE_SCHEDULER }, { token: i2.CdkTable }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "17.1.0-next.5", ngImport: i0, type: TableLayoutFixedResizeStrategy }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.1.0-next.5", ngImport: i0, type: TableLayoutFixedResizeStrategy, decorators: [{
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.1.0-next.5", ngImport: i0, type: CdkFlexTableResizeStrategy, deps: [{ token: i1.ColumnResize }, { token: _COALESCED_STYLE_SCHEDULER }, { token: i2.CdkTable }, { token: DOCUMENT }, { token: CSP_NONCE, optional: true }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "17.1.0-next.5", ngImport: i0, type: CdkFlexTableResizeStrategy }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.1.0-next.5", ngImport: i0, type: CdkFlexTableResizeStrategy, decorators: [{
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzaXplLXN0cmF0ZWd5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvY29sdW1uLXJlc2l6ZS9yZXNpemUtc3RyYXRlZ3kudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLE1BQU0sRUFBRSxVQUFVLEVBQXVCLFNBQVMsRUFBRSxRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDM0YsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQ3pDLE9BQU8sRUFBQyxtQkFBbUIsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQzFELE9BQU8sRUFBQyxRQUFRLEVBQUUsd0JBQXdCLEVBQUUsMEJBQTBCLEVBQUMsTUFBTSxvQkFBb0IsQ0FBQztBQUVsRyxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0saUJBQWlCLENBQUM7Ozs7QUFFN0M7OztHQUdHO0FBRUgsTUFBTSxPQUFnQixjQUFjO0lBRHBDO1FBTVUsd0JBQW1CLEdBQWtCLElBQUksQ0FBQztLQTJDbkQ7SUFuQkMscUVBQXFFO0lBQzNELGdDQUFnQyxDQUFDLEtBQWE7UUFDdEQsSUFBSSxJQUFJLENBQUMsbUJBQW1CLEtBQUssSUFBSSxFQUFFLENBQUM7WUFDdEMsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDO1lBQ2hFLE1BQU0sVUFBVSxHQUFHLGVBQWUsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUVqRCxJQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUU7Z0JBQ2hDLFlBQVksQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLG1CQUFtQixDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsbUJBQW9CLENBQUMsQ0FBQztnQkFDdkYsSUFBSSxDQUFDLG1CQUFtQixHQUFHLElBQUksQ0FBQztZQUNsQyxDQUFD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QyxVQUFVOzswQkFjTixNQUFNOzJCQUFDLDBCQUEwQjs7MEJBR2pDLE1BQU07MkJBQUMsUUFBUTs7MEJBQ2YsTUFBTTsyQkFBQyxTQUFTOzswQkFBRyxRQUFROztBQTRJaEMsaUdBQWlHO0FBQ2pHLFNBQVMsd0JBQXdCLENBQUMsUUFBZ0I7SUFDaEQsT0FBTyxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDaEQsQ0FBQztBQUVELGtHQUFrRztBQUNsRyxTQUFTLGVBQWUsQ0FBQyxPQUFvQjtJQUMzQyxxRkFBcUY7SUFDckYscUNBQXFDO0lBQ3JDLE9BQU8sd0JBQXdCLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxPQUFPLENBQUMsV0FBVyxDQUFDO0FBQzlFLENBQUM7QUFFRDs7O0dBR0c7QUFDSCxTQUFTLHlCQUF5QixDQUFDLFNBQTZCO0lBQzlELE9BQU8sTUFBTSxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsaUJBQWlCLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDMUQsQ0FBQztBQUVELE1BQU0sQ0FBQyxNQUFNLDJDQUEyQyxHQUFhO0lBQ25FLE9BQU8sRUFBRSxjQUFjO0lBQ3ZCLFFBQVEsRUFBRSw4QkFBOEI7Q0FDekMsQ0FBQztBQUNGLE1BQU0sQ0FBQyxNQUFNLDZCQUE2QixHQUFhO0lBQ3JELE9BQU8sRUFBRSxjQUFjO0lBQ3ZCLFFBQVEsRUFBRSwwQkFBMEI7Q0FDckMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0luamVjdCwgSW5qZWN0YWJsZSwgT25EZXN0cm95LCBQcm92aWRlciwgQ1NQX05PTkNFLCBPcHRpb25hbH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0RPQ1VNRU5UfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHtjb2VyY2VDc3NQaXhlbFZhbHVlfSBmcm9tICdAYW5ndWxhci9jZGsvY29lcmNpb24nO1xuaW1wb3J0IHtDZGtUYWJsZSwgX0NvYWxlc2NlZFN0eWxlU2NoZWR1bGVyLCBfQ09BTEVTQ0VEX1NUWUxFX1NDSEVEVUxFUn0gZnJvbSAnQGFuZ3VsYXIvY2RrL3RhYmxlJztcblxuaW1wb3J0IHtDb2x1bW5SZXNpemV9IGZyb20gJy4vY29sdW1uLXJlc2l6ZSc7XG5cbi8qKlxuICogUHJvdmlkZXMgYW4gaW1wbGVtZW50YXRpb24gZm9yIHJlc2l6aW5nIGEgY29sdW1uLlxuICogVGhlIGRldGFpbHMgb2YgaG93IHJlc2l6aW5nIHdvcmtzIGZvciB0YWJsZXMgZm9yIGZsZXggbWF0LXRhYmxlcyBhcmUgcXVpdGUgZGlmZmVyZW50LlxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgUmVzaXplU3RyYXRlZ3kge1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgcmVhZG9ubHkgY29sdW1uUmVzaXplOiBDb2x1bW5SZXNpemU7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCByZWFkb25seSBzdHlsZVNjaGVkdWxlcjogX0NvYWxlc2NlZFN0eWxlU2NoZWR1bGVyO1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgcmVhZG9ubHkgdGFibGU6IENka1RhYmxlPHVua25vd24+O1xuXG4gIHByaXZhdGUgX3BlbmRpbmdSZXNpemVEZWx0YTogbnVtYmVyIHwgbnVsbCA9IG51bGw7XG5cbiAgLyoqIFVwZGF0ZXMgdGhlIHdpZHRoIG9mIHRoZSBzcGVjaWZpZWQgY29sdW1uLiAqL1xuICBhYnN0cmFjdCBhcHBseUNvbHVtblNpemUoXG4gICAgY3NzRnJpZW5kbHlDb2x1bW5OYW1lOiBzdHJpbmcsXG4gICAgY29sdW1uSGVhZGVyOiBIVE1MRWxlbWVudCxcbiAgICBzaXplSW5QeDogbnVtYmVyLFxuICAgIHByZXZpb3VzU2l6ZUluUHg/OiBudW1iZXIsXG4gICk6IHZvaWQ7XG5cbiAgLyoqIEFwcGxpZXMgYSBtaW5pbXVtIHdpZHRoIHRvIHRoZSBzcGVjaWZpZWQgY29sdW1uLCB1cGRhdGluZyBpdHMgY3VycmVudCB3aWR0aCBhcyBuZWVkZWQuICovXG4gIGFic3RyYWN0IGFwcGx5TWluQ29sdW1uU2l6ZShcbiAgICBjc3NGcmllbmRseUNvbHVtbk5hbWU6IHN0cmluZyxcbiAgICBjb2x1bW5IZWFkZXI6IEhUTUxFbGVtZW50LFxuICAgIG1pblNpemVJblB4OiBudW1iZXIsXG4gICk6IHZvaWQ7XG5cbiAgLyoqIEFwcGxpZXMgYSBtYXhpbXVtIHdpZHRoIHRvIHRoZSBzcGVjaWZpZWQgY29sdW1uLCB1cGRhdGluZyBpdHMgY3VycmVudCB3aWR0aCBhcyBuZWVkZWQuICovXG4gIGFic3RyYWN0IGFwcGx5TWF4Q29sdW1uU2l6ZShcbiAgICBjc3NGcmllbmRseUNvbHVtbk5hbWU6IHN0cmluZyxcbiAgICBjb2x1bW5IZWFkZXI6IEhUTUxFbGVtZW50LFxuICAgIG1pblNpemVJblB4OiBudW1iZXIsXG4gICk6IHZvaWQ7XG5cbiAgLyoqIEFkanVzdHMgdGhlIHdpZHRoIG9mIHRoZSB0YWJsZSBlbGVtZW50IGJ5IHRoZSBzcGVjaWZpZWQgZGVsdGEuICovXG4gIHByb3RlY3RlZCB1cGRhdGVUYWJsZVdpZHRoQW5kU3RpY2t5Q29sdW1ucyhkZWx0YTogbnVtYmVyKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX3BlbmRpbmdSZXNpemVEZWx0YSA9PT0gbnVsbCkge1xuICAgICAgY29uc3QgdGFibGVFbGVtZW50ID0gdGhpcy5jb2x1bW5SZXNpemUuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50O1xuICAgICAgY29uc3QgdGFibGVXaWR0aCA9IGdldEVsZW1lbnRXaWR0aCh0YWJsZUVsZW1lbnQpO1xuXG4gICAgICB0aGlzLnN0eWxlU2NoZWR1bGVyLnNjaGVkdWxlKCgpID0+IHtcbiAgICAgICAgdGFibGVFbGVtZW50LnN0eWxlLndpZHRoID0gY29lcmNlQ3NzUGl4ZWxWYWx1ZSh0YWJsZVdpZHRoICsgdGhpcy5fcGVuZGluZ1Jlc2l6ZURlbHRhISk7XG4gICAgICAgIHRoaXMuX3BlbmRpbmdSZXNpemVEZWx0YSA9IG51bGw7XG4gICAgICB9KTtcblxuICAgICAgdGhpcy5zdHlsZVNjaGVkdWxlci5zY2hlZHVsZUVuZCgoKSA9PiB7XG4gICAgICAgIHRoaXMudGFibGUudXBkYXRlU3RpY2t5Q29sdW1uU3R5bGVzKCk7XG4gICAgICAgIHRoaXMuc3R5bGVTY2hlZHVsZXIuZmx1c2hBZnRlclJlbmRlcigpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgdGhpcy5fcGVuZGluZ1Jlc2l6ZURlbHRhID0gKHRoaXMuX3BlbmRpbmdSZXNpemVEZWx0YSA/PyAwKSArIGRlbHRhO1xuICB9XG59XG5cbi8qKlxuICogVGhlIG9wdGltYWxseSBwZXJmb3JtaW5nIHJlc2l6ZSBzdHJhdGVneSBmb3IgJmx0O3RhYmxlJmd0OyBlbGVtZW50cyB3aXRoIHRhYmxlLWxheW91dDogZml4ZWQuXG4gKiBUZXN0ZWQgYWdhaW5zdCBhbmQgb3V0cGVyZm9ybWVkOlxuICogICBDU1Mgc2VsZWN0b3JcbiAqICAgQ1NTIHNlbGVjdG9yIHcvIENTUyB2YXJpYWJsZVxuICogICBVcGRhdGluZyBhbGwgY2VsbCBub2Rlc1xuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgVGFibGVMYXlvdXRGaXhlZFJlc2l6ZVN0cmF0ZWd5IGV4dGVuZHMgUmVzaXplU3RyYXRlZ3kge1xuICBjb25zdHJ1Y3RvcihcbiAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgY29sdW1uUmVzaXplOiBDb2x1bW5SZXNpemUsXG4gICAgQEluamVjdChfQ09BTEVTQ0VEX1NUWUxFX1NDSEVEVUxFUilcbiAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgc3R5bGVTY2hlZHVsZXI6IF9Db2FsZXNjZWRTdHlsZVNjaGVkdWxlcixcbiAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgdGFibGU6IENka1RhYmxlPHVua25vd24+LFxuICApIHtcbiAgICBzdXBlcigpO1xuICB9XG5cbiAgYXBwbHlDb2x1bW5TaXplKFxuICAgIF86IHN0cmluZyxcbiAgICBjb2x1bW5IZWFkZXI6IEhUTUxFbGVtZW50LFxuICAgIHNpemVJblB4OiBudW1iZXIsXG4gICAgcHJldmlvdXNTaXplSW5QeD86IG51bWJlcixcbiAgKTogdm9pZCB7XG4gICAgY29uc3QgZGVsdGEgPSBzaXplSW5QeCAtIChwcmV2aW91c1NpemVJblB4ID8/IGdldEVsZW1lbnRXaWR0aChjb2x1bW5IZWFkZXIpKTtcblxuICAgIGlmIChkZWx0YSA9PT0gMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuc3R5bGVTY2hlZHVsZXIuc2NoZWR1bGUoKCkgPT4ge1xuICAgICAgY29sdW1uSGVhZGVyLnN0eWxlLndpZHRoID0gY29lcmNlQ3NzUGl4ZWxWYWx1ZShzaXplSW5QeCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLnVwZGF0ZVRhYmxlV2lkdGhBbmRTdGlja3lDb2x1bW5zKGRlbHRhKTtcbiAgfVxuXG4gIGFwcGx5TWluQ29sdW1uU2l6ZShfOiBzdHJpbmcsIGNvbHVtbkhlYWRlcjogSFRNTEVsZW1lbnQsIHNpemVJblB4OiBudW1iZXIpOiB2b2lkIHtcbiAgICBjb25zdCBjdXJyZW50V2lkdGggPSBnZXRFbGVtZW50V2lkdGgoY29sdW1uSGVhZGVyKTtcbiAgICBjb25zdCBuZXdXaWR0aCA9IE1hdGgubWF4KGN1cnJlbnRXaWR0aCwgc2l6ZUluUHgpO1xuXG4gICAgdGhpcy5hcHBseUNvbHVtblNpemUoXywgY29sdW1uSGVhZGVyLCBuZXdXaWR0aCwgY3VycmVudFdpZHRoKTtcbiAgfVxuXG4gIGFwcGx5TWF4Q29sdW1uU2l6ZShfOiBzdHJpbmcsIGNvbHVtbkhlYWRlcjogSFRNTEVsZW1lbnQsIHNpemVJblB4OiBudW1iZXIpOiB2b2lkIHtcbiAgICBjb25zdCBjdXJyZW50V2lkdGggPSBnZXRFbGVtZW50V2lkdGgoY29sdW1uSGVhZGVyKTtcbiAgICBjb25zdCBuZXdXaWR0aCA9IE1hdGgubWluKGN1cnJlbnRXaWR0aCwgc2l6ZUluUHgpO1xuXG4gICAgdGhpcy5hcHBseUNvbHVtblNpemUoXywgY29sdW1uSGVhZGVyLCBuZXdXaWR0aCwgY3VycmVudFdpZHRoKTtcbiAgfVxufVxuXG4vKipcbiAqIFRoZSBvcHRpbWFsbHkgcGVyZm9ybWluZyByZXNpemUgc3RyYXRlZ3kgZm9yIGZsZXggbWF0LXRhYmxlcy5cbiAqIFRlc3RlZCBhZ2FpbnN0IGFuZCBvdXRwZXJmb3JtZWQ6XG4gKiAgIENTUyBzZWxlY3RvciB3LyBDU1MgdmFyaWFibGVcbiAqICAgVXBkYXRpbmcgYWxsIG1hdC1jZWxsIG5vZGVzXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBDZGtGbGV4VGFibGVSZXNpemVTdHJhdGVneSBleHRlbmRzIFJlc2l6ZVN0cmF0ZWd5IGltcGxlbWVudHMgT25EZXN0cm95IHtcbiAgcHJpdmF0ZSByZWFkb25seSBfZG9jdW1lbnQ6IERvY3VtZW50O1xuICBwcml2YXRlIHJlYWRvbmx5IF9jb2x1bW5JbmRleGVzID0gbmV3IE1hcDxzdHJpbmcsIG51bWJlcj4oKTtcbiAgcHJpdmF0ZSByZWFkb25seSBfY29sdW1uUHJvcGVydGllcyA9IG5ldyBNYXA8c3RyaW5nLCBNYXA8c3RyaW5nLCBzdHJpbmc+PigpO1xuXG4gIHByaXZhdGUgX3N0eWxlRWxlbWVudD86IEhUTUxTdHlsZUVsZW1lbnQ7XG4gIHByaXZhdGUgX2luZGV4U2VxdWVuY2UgPSAwO1xuXG4gIHByb3RlY3RlZCByZWFkb25seSBkZWZhdWx0TWluU2l6ZSA9IDA7XG4gIHByb3RlY3RlZCByZWFkb25seSBkZWZhdWx0TWF4U2l6ZSA9IE51bWJlci5NQVhfU0FGRV9JTlRFR0VSO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByb3RlY3RlZCByZWFkb25seSBjb2x1bW5SZXNpemU6IENvbHVtblJlc2l6ZSxcbiAgICBASW5qZWN0KF9DT0FMRVNDRURfU1RZTEVfU0NIRURVTEVSKVxuICAgIHByb3RlY3RlZCByZWFkb25seSBzdHlsZVNjaGVkdWxlcjogX0NvYWxlc2NlZFN0eWxlU2NoZWR1bGVyLFxuICAgIHByb3RlY3RlZCByZWFkb25seSB0YWJsZTogQ2RrVGFibGU8dW5rbm93bj4sXG4gICAgQEluamVjdChET0NVTUVOVCkgZG9jdW1lbnQ6IGFueSxcbiAgICBASW5qZWN0KENTUF9OT05DRSkgQE9wdGlvbmFsKCkgcHJpdmF0ZSByZWFkb25seSBfbm9uY2U/OiBzdHJpbmcgfCBudWxsLFxuICApIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuX2RvY3VtZW50ID0gZG9jdW1lbnQ7XG4gIH1cblxuICBhcHBseUNvbHVtblNpemUoXG4gICAgY3NzRnJpZW5kbHlDb2x1bW5OYW1lOiBzdHJpbmcsXG4gICAgY29sdW1uSGVhZGVyOiBIVE1MRWxlbWVudCxcbiAgICBzaXplSW5QeDogbnVtYmVyLFxuICAgIHByZXZpb3VzU2l6ZUluUHg/OiBudW1iZXIsXG4gICk6IHZvaWQge1xuICAgIC8vIE9wdGltaXphdGlvbjogQ2hlY2sgYXBwbGllZCB3aWR0aCBmaXJzdCBhcyB3ZSBwcm9iYWJseSBzZXQgaXQgYWxyZWFkeSBiZWZvcmUgcmVhZGluZ1xuICAgIC8vIG9mZnNldFdpZHRoIHdoaWNoIHRyaWdnZXJzIGxheW91dC5cbiAgICBjb25zdCBkZWx0YSA9XG4gICAgICBzaXplSW5QeCAtXG4gICAgICAocHJldmlvdXNTaXplSW5QeCA/P1xuICAgICAgICAodGhpcy5fZ2V0QXBwbGllZFdpZHRoKGNzc0ZyaWVuZGx5Q29sdW1uTmFtZSkgfHwgY29sdW1uSGVhZGVyLm9mZnNldFdpZHRoKSk7XG5cbiAgICBpZiAoZGVsdGEgPT09IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBjc3NTaXplID0gY29lcmNlQ3NzUGl4ZWxWYWx1ZShzaXplSW5QeCk7XG5cbiAgICB0aGlzLl9hcHBseVByb3BlcnR5KGNzc0ZyaWVuZGx5Q29sdW1uTmFtZSwgJ2ZsZXgnLCBgMCAwLjAxICR7Y3NzU2l6ZX1gKTtcbiAgICB0aGlzLnVwZGF0ZVRhYmxlV2lkdGhBbmRTdGlja3lDb2x1bW5zKGRlbHRhKTtcbiAgfVxuXG4gIGFwcGx5TWluQ29sdW1uU2l6ZShjc3NGcmllbmRseUNvbHVtbk5hbWU6IHN0cmluZywgXzogSFRNTEVsZW1lbnQsIHNpemVJblB4OiBudW1iZXIpOiB2b2lkIHtcbiAgICBjb25zdCBjc3NTaXplID0gY29lcmNlQ3NzUGl4ZWxWYWx1ZShzaXplSW5QeCk7XG5cbiAgICB0aGlzLl9hcHBseVByb3BlcnR5KFxuICAgICAgY3NzRnJpZW5kbHlDb2x1bW5OYW1lLFxuICAgICAgJ21pbi13aWR0aCcsXG4gICAgICBjc3NTaXplLFxuICAgICAgc2l6ZUluUHggIT09IHRoaXMuZGVmYXVsdE1pblNpemUsXG4gICAgKTtcbiAgICB0aGlzLnVwZGF0ZVRhYmxlV2lkdGhBbmRTdGlja3lDb2x1bW5zKDApO1xuICB9XG5cbiAgYXBwbHlNYXhDb2x1bW5TaXplKGNzc0ZyaWVuZGx5Q29sdW1uTmFtZTogc3RyaW5nLCBfOiBIVE1MRWxlbWVudCwgc2l6ZUluUHg6IG51bWJlcik6IHZvaWQge1xuICAgIGNvbnN0IGNzc1NpemUgPSBjb2VyY2VDc3NQaXhlbFZhbHVlKHNpemVJblB4KTtcblxuICAgIHRoaXMuX2FwcGx5UHJvcGVydHkoXG4gICAgICBjc3NGcmllbmRseUNvbHVtbk5hbWUsXG4gICAgICAnbWF4LXdpZHRoJyxcbiAgICAgIGNzc1NpemUsXG4gICAgICBzaXplSW5QeCAhPT0gdGhpcy5kZWZhdWx0TWF4U2l6ZSxcbiAgICApO1xuICAgIHRoaXMudXBkYXRlVGFibGVXaWR0aEFuZFN0aWNreUNvbHVtbnMoMCk7XG4gIH1cblxuICBwcm90ZWN0ZWQgZ2V0Q29sdW1uQ3NzQ2xhc3MoY3NzRnJpZW5kbHlDb2x1bW5OYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBgY2RrLWNvbHVtbi0ke2Nzc0ZyaWVuZGx5Q29sdW1uTmFtZX1gO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgdGhpcy5fc3R5bGVFbGVtZW50Py5yZW1vdmUoKTtcbiAgICB0aGlzLl9zdHlsZUVsZW1lbnQgPSB1bmRlZmluZWQ7XG4gIH1cblxuICBwcml2YXRlIF9nZXRQcm9wZXJ0eVZhbHVlKGNzc0ZyaWVuZGx5Q29sdW1uTmFtZTogc3RyaW5nLCBrZXk6IHN0cmluZyk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gICAgY29uc3QgcHJvcGVydGllcyA9IHRoaXMuX2dldENvbHVtblByb3BlcnRpZXNNYXAoY3NzRnJpZW5kbHlDb2x1bW5OYW1lKTtcbiAgICByZXR1cm4gcHJvcGVydGllcy5nZXQoa2V5KTtcbiAgfVxuXG4gIHByaXZhdGUgX2dldEFwcGxpZWRXaWR0aChjc3NGcmllbmRzbHlDb2x1bW5OYW1lOiBzdHJpbmcpOiBudW1iZXIge1xuICAgIHJldHVybiBjb2VyY2VQaXhlbHNGcm9tRmxleFZhbHVlKHRoaXMuX2dldFByb3BlcnR5VmFsdWUoY3NzRnJpZW5kc2x5Q29sdW1uTmFtZSwgJ2ZsZXgnKSk7XG4gIH1cblxuICBwcml2YXRlIF9hcHBseVByb3BlcnR5KFxuICAgIGNzc0ZyaWVuZGx5Q29sdW1uTmFtZTogc3RyaW5nLFxuICAgIGtleTogc3RyaW5nLFxuICAgIHZhbHVlOiBzdHJpbmcsXG4gICAgZW5hYmxlID0gdHJ1ZSxcbiAgKTogdm9pZCB7XG4gICAgY29uc3QgcHJvcGVydGllcyA9IHRoaXMuX2dldENvbHVtblByb3BlcnRpZXNNYXAoY3NzRnJpZW5kbHlDb2x1bW5OYW1lKTtcblxuICAgIHRoaXMuc3R5bGVTY2hlZHVsZXIuc2NoZWR1bGUoKCkgPT4ge1xuICAgICAgaWYgKGVuYWJsZSkge1xuICAgICAgICBwcm9wZXJ0aWVzLnNldChrZXksIHZhbHVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHByb3BlcnRpZXMuZGVsZXRlKGtleSk7XG4gICAgICB9XG4gICAgICB0aGlzLl9hcHBseVNpemVDc3MoY3NzRnJpZW5kbHlDb2x1bW5OYW1lKTtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX2dldFN0eWxlU2hlZXQoKTogQ1NTU3R5bGVTaGVldCB7XG4gICAgaWYgKCF0aGlzLl9zdHlsZUVsZW1lbnQpIHtcbiAgICAgIHRoaXMuX3N0eWxlRWxlbWVudCA9IHRoaXMuX2RvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XG5cbiAgICAgIGlmICh0aGlzLl9ub25jZSkge1xuICAgICAgICB0aGlzLl9zdHlsZUVsZW1lbnQubm9uY2UgPSB0aGlzLl9ub25jZTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fc3R5bGVFbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuX2RvY3VtZW50LmNyZWF0ZVRleHROb2RlKCcnKSk7XG4gICAgICB0aGlzLl9kb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHRoaXMuX3N0eWxlRWxlbWVudCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX3N0eWxlRWxlbWVudC5zaGVldCBhcyBDU1NTdHlsZVNoZWV0O1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0Q29sdW1uUHJvcGVydGllc01hcChjc3NGcmllbmRseUNvbHVtbk5hbWU6IHN0cmluZyk6IE1hcDxzdHJpbmcsIHN0cmluZz4ge1xuICAgIGxldCBwcm9wZXJ0aWVzID0gdGhpcy5fY29sdW1uUHJvcGVydGllcy5nZXQoY3NzRnJpZW5kbHlDb2x1bW5OYW1lKTtcbiAgICBpZiAocHJvcGVydGllcyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBwcm9wZXJ0aWVzID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZz4oKTtcbiAgICAgIHRoaXMuX2NvbHVtblByb3BlcnRpZXMuc2V0KGNzc0ZyaWVuZGx5Q29sdW1uTmFtZSwgcHJvcGVydGllcyk7XG4gICAgfVxuICAgIHJldHVybiBwcm9wZXJ0aWVzO1xuICB9XG5cbiAgcHJpdmF0ZSBfYXBwbHlTaXplQ3NzKGNzc0ZyaWVuZGx5Q29sdW1uTmFtZTogc3RyaW5nKSB7XG4gICAgY29uc3QgcHJvcGVydGllcyA9IHRoaXMuX2dldENvbHVtblByb3BlcnRpZXNNYXAoY3NzRnJpZW5kbHlDb2x1bW5OYW1lKTtcbiAgICBjb25zdCBwcm9wZXJ0eUtleXMgPSBBcnJheS5mcm9tKHByb3BlcnRpZXMua2V5cygpKTtcblxuICAgIGxldCBpbmRleCA9IHRoaXMuX2NvbHVtbkluZGV4ZXMuZ2V0KGNzc0ZyaWVuZGx5Q29sdW1uTmFtZSk7XG4gICAgaWYgKGluZGV4ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGlmICghcHJvcGVydHlLZXlzLmxlbmd0aCkge1xuICAgICAgICAvLyBOb3RoaW5nIHRvIHNldCBvciB1bnNldC5cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpbmRleCA9IHRoaXMuX2luZGV4U2VxdWVuY2UrKztcbiAgICAgIHRoaXMuX2NvbHVtbkluZGV4ZXMuc2V0KGNzc0ZyaWVuZGx5Q29sdW1uTmFtZSwgaW5kZXgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9nZXRTdHlsZVNoZWV0KCkuZGVsZXRlUnVsZShpbmRleCk7XG4gICAgfVxuXG4gICAgY29uc3QgY29sdW1uQ2xhc3NOYW1lID0gdGhpcy5nZXRDb2x1bW5Dc3NDbGFzcyhjc3NGcmllbmRseUNvbHVtbk5hbWUpO1xuICAgIGNvbnN0IHRhYmxlQ2xhc3NOYW1lID0gdGhpcy5jb2x1bW5SZXNpemUuZ2V0VW5pcXVlQ3NzQ2xhc3MoKTtcblxuICAgIGNvbnN0IHNlbGVjdG9yID0gYC4ke3RhYmxlQ2xhc3NOYW1lfSAuJHtjb2x1bW5DbGFzc05hbWV9YDtcbiAgICBjb25zdCBib2R5ID0gcHJvcGVydHlLZXlzLm1hcChrZXkgPT4gYCR7a2V5fToke3Byb3BlcnRpZXMuZ2V0KGtleSl9YCkuam9pbignOycpO1xuXG4gICAgdGhpcy5fZ2V0U3R5bGVTaGVldCgpLmluc2VydFJ1bGUoYCR7c2VsZWN0b3J9IHske2JvZHl9fWAsIGluZGV4ISk7XG4gIH1cbn1cblxuLyoqIENvbnZlcnRzIENTUyBwaXhlbCB2YWx1ZXMgdG8gbnVtYmVycywgZWcgXCIxMjNweFwiIHRvIDEyMy4gUmV0dXJucyBOYU4gZm9yIG5vbiBwaXhlbCB2YWx1ZXMuICovXG5mdW5jdGlvbiBjb2VyY2VQaXhlbHNGcm9tQ3NzVmFsdWUoY3NzVmFsdWU6IHN0cmluZyk6IG51bWJlciB7XG4gIHJldHVybiBOdW1iZXIoY3NzVmFsdWUubWF0Y2goLyhcXGQrKXB4Lyk/LlsxXSk7XG59XG5cbi8qKiBHZXRzIHRoZSBzdHlsZS53aWR0aCBwaXhlbHMgb24gdGhlIHNwZWNpZmllZCBlbGVtZW50IGlmIHByZXNlbnQsIG90aGVyd2lzZSBpdHMgb2Zmc2V0V2lkdGguICovXG5mdW5jdGlvbiBnZXRFbGVtZW50V2lkdGgoZWxlbWVudDogSFRNTEVsZW1lbnQpIHtcbiAgLy8gT3B0aW1pemF0aW9uOiBDaGVjayBzdHlsZS53aWR0aCBmaXJzdCBhcyB3ZSBwcm9iYWJseSBzZXQgaXQgYWxyZWFkeSBiZWZvcmUgcmVhZGluZ1xuICAvLyBvZmZzZXRXaWR0aCB3aGljaCB0cmlnZ2VycyBsYXlvdXQuXG4gIHJldHVybiBjb2VyY2VQaXhlbHNGcm9tQ3NzVmFsdWUoZWxlbWVudC5zdHlsZS53aWR0aCkgfHwgZWxlbWVudC5vZmZzZXRXaWR0aDtcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBDU1MgZmxleCB2YWx1ZXMgYXMgc2V0IGluIENka0ZsZXhUYWJsZVJlc2l6ZVN0cmF0ZWd5IHRvIG51bWJlcnMsXG4gKiBlZyBcIjAgMC4wMSAxMjNweFwiIHRvIDEyMy5cbiAqL1xuZnVuY3Rpb24gY29lcmNlUGl4ZWxzRnJvbUZsZXhWYWx1ZShmbGV4VmFsdWU6IHN0cmluZyB8IHVuZGVmaW5lZCk6IG51bWJlciB7XG4gIHJldHVybiBOdW1iZXIoZmxleFZhbHVlPy5tYXRjaCgvMCAwXFwuMDEgKFxcZCspcHgvKT8uWzFdKTtcbn1cblxuZXhwb3J0IGNvbnN0IFRBQkxFX0xBWU9VVF9GSVhFRF9SRVNJWkVfU1RSQVRFR1lfUFJPVklERVI6IFByb3ZpZGVyID0ge1xuICBwcm92aWRlOiBSZXNpemVTdHJhdGVneSxcbiAgdXNlQ2xhc3M6IFRhYmxlTGF5b3V0Rml4ZWRSZXNpemVTdHJhdGVneSxcbn07XG5leHBvcnQgY29uc3QgRkxFWF9SRVNJWkVfU1RSQVRFR1lfUFJPVklERVI6IFByb3ZpZGVyID0ge1xuICBwcm92aWRlOiBSZXNpemVTdHJhdGVneSxcbiAgdXNlQ2xhc3M6IENka0ZsZXhUYWJsZVJlc2l6ZVN0cmF0ZWd5LFxufTtcbiJdfQ==