/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { OnDestroy, Provider } from '@angular/core';
import { ColumnResize } from './column-resize';
/**
 * Provides an implementation for resizing a column.
 * The details of how resizing works for tables for flex mat-tables are quite different.
 */
export declare abstract class ResizeStrategy {
    abstract applyColumnSize(cssFriendlyColumnName: string, columnHeader: HTMLElement, sizeInPx: number): void;
    abstract applyMinColumnSize(cssFriendlyColumnName: string, columnHeader: HTMLElement, minSizeInPx: number): void;
    abstract applyMaxColumnSize(cssFriendlyColumnName: string, columnHeader: HTMLElement, minSizeInPx: number): void;
}
/**
 * The optimially performing resize strategy for &lt;table&gt; elements with table-layout: fixed.
 * Tested against and outperformed:
 *   CSS selector
 *   CSS selector w/ CSS variable
 *   Updating all cell nodes
 */
export declare class TableLayoutFixedResizeStrategy extends ResizeStrategy {
    applyColumnSize(_: string, columnHeader: HTMLElement, sizeInPx: number): void;
    applyMinColumnSize(_: string, columnHeader: HTMLElement, sizeInPx: number): void;
    applyMaxColumnSize(): void;
}
/**
 * The optimally performing resize strategy for flex mat-tables.
 * Tested against and outperformed:
 *   CSS selector w/ CSS variable
 *   Updating all mat-cell nodes
 */
export declare class CdkFlexTableResizeStrategy extends ResizeStrategy implements OnDestroy {
    private readonly _columnResize;
    private readonly _document;
    private readonly _columnIndexes;
    private readonly _columnProperties;
    private _styleElement?;
    private _indexSequence;
    protected readonly defaultMinSize = 0;
    protected readonly defaultMaxSize: number;
    constructor(_columnResize: ColumnResize, document: any);
    applyColumnSize(cssFriendlyColumnName: string, _: HTMLElement, sizeInPx: number): void;
    applyMinColumnSize(cssFriendlyColumnName: string, _: HTMLElement, sizeInPx: number): void;
    applyMaxColumnSize(cssFriendlyColumnName: string, _: HTMLElement, sizeInPx: number): void;
    protected getColumnCssClass(cssFriendlyColumnName: string): string;
    ngOnDestroy(): void;
    private _applyProperty;
    private _getStyleSheet;
    private _getColumnPropertiesMap;
    private _applySizeCss;
}
export declare const TABLE_LAYOUT_FIXED_RESIZE_STRATEGY_PROVIDER: Provider;
export declare const FLEX_RESIZE_STRATEGY_PROVIDER: Provider;
