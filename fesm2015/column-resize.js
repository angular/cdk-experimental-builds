import { Directive, Injectable, NgZone, Inject, ElementRef, NgModule } from '@angular/core';
import { ReplaySubject, fromEvent, merge, Subject, combineLatest, Observable } from 'rxjs';
import { map, takeUntil, filter, mapTo, take, startWith, pairwise, distinctUntilChanged, share, skip } from 'rxjs/operators';
import { _closest, _matches } from '@angular/cdk-experimental/popover-edit';
import { DOCUMENT } from '@angular/common';
import { coerceCssPixelValue } from '@angular/cdk/coercion';
import { PortalInjector, ComponentPortal } from '@angular/cdk/portal';
import { ESCAPE } from '@angular/cdk/keycodes';

/**
 * @fileoverview added by tsickle
 * Generated from: src/cdk-experimental/column-resize/selectors.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
// TODO: Figure out how to remove `mat-` classes from the CDK part of the
// column resize implementation.
/** @type {?} */
const HEADER_CELL_SELECTOR = '.cdk-header-cell, .mat-header-cell';
/** @type {?} */
const HEADER_ROW_SELECTOR = '.cdk-header-row, .mat-header-row';
/** @type {?} */
const RESIZE_OVERLAY_SELECTOR = '.mat-column-resize-overlay-thumb';

/**
 * @fileoverview added by tsickle
 * Generated from: src/cdk-experimental/column-resize/column-resize.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/** @type {?} */
const HOVER_OR_ACTIVE_CLASS = 'cdk-column-resize-hover-or-active';
/** @type {?} */
const WITH_RESIZED_COLUMN_CLASS = 'cdk-column-resize-with-resized-column';
/** @type {?} */
let nextId = 0;
/**
 * Base class for ColumnResize directives which attach to mat-table elements to
 * provide common events and services for column resizing.
 * @abstract
 */
let ColumnResize = /** @class */ (() => {
    /**
     * Base class for ColumnResize directives which attach to mat-table elements to
     * provide common events and services for column resizing.
     * @abstract
     */
    class ColumnResize {
        constructor() {
            this.destroyed = new ReplaySubject();
            /**
             * Unique ID for this table instance.
             */
            this.selectorId = `${++nextId}`;
        }
        /**
         * @return {?}
         */
        ngAfterViewInit() {
            (/** @type {?} */ (this.elementRef.nativeElement)).classList.add(this.getUniqueCssClass());
            this._listenForRowHoverEvents();
            this._listenForResizeActivity();
            this._listenForHoverActivity();
        }
        /**
         * @return {?}
         */
        ngOnDestroy() {
            this.destroyed.next();
            this.destroyed.complete();
        }
        /**
         * Gets the unique CSS class name for this table instance.
         * @return {?}
         */
        getUniqueCssClass() {
            return `cdk-column-resize-${this.selectorId}`;
        }
        /**
         * Called when a column in the table is resized. Applies a css class to the table element.
         * @return {?}
         */
        setResized() {
            (/** @type {?} */ (this.elementRef.nativeElement)).classList.add(WITH_RESIZED_COLUMN_CLASS);
        }
        /**
         * @private
         * @return {?}
         */
        _listenForRowHoverEvents() {
            this.ngZone.runOutsideAngular((/**
             * @return {?}
             */
            () => {
                /** @type {?} */
                const element = (/** @type {?} */ (this.elementRef.nativeElement));
                fromEvent(element, 'mouseover').pipe(map((/**
                 * @param {?} event
                 * @return {?}
                 */
                event => _closest(event.target, HEADER_CELL_SELECTOR))), takeUntil(this.destroyed)).subscribe(this.eventDispatcher.headerCellHovered);
                fromEvent(element, 'mouseleave').pipe(filter((/**
                 * @param {?} event
                 * @return {?}
                 */
                event => !!event.relatedTarget &&
                    !_matches((/** @type {?} */ (event.relatedTarget)), RESIZE_OVERLAY_SELECTOR))), mapTo(null), takeUntil(this.destroyed)).subscribe(this.eventDispatcher.headerCellHovered);
            }));
        }
        /**
         * @private
         * @return {?}
         */
        _listenForResizeActivity() {
            merge(this.eventDispatcher.overlayHandleActiveForCell.pipe(mapTo(undefined)), this.notifier.triggerResize.pipe(mapTo(undefined)), this.notifier.resizeCompleted.pipe(mapTo(undefined))).pipe(takeUntil(this.destroyed), take(1)).subscribe((/**
             * @return {?}
             */
            () => {
                this.setResized();
            }));
        }
        /**
         * @private
         * @return {?}
         */
        _listenForHoverActivity() {
            this.eventDispatcher.headerRowHoveredOrActiveDistinct.pipe(startWith(null), pairwise(), takeUntil(this.destroyed)).subscribe((/**
             * @param {?} __0
             * @return {?}
             */
            ([previousRow, hoveredRow]) => {
                if (hoveredRow) {
                    hoveredRow.classList.add(HOVER_OR_ACTIVE_CLASS);
                }
                if (previousRow) {
                    previousRow.classList.remove(HOVER_OR_ACTIVE_CLASS);
                }
            }));
        }
    }
    ColumnResize.decorators = [
        { type: Directive }
    ];
    return ColumnResize;
})();
if (false) {
    /**
     * @type {?}
     * @protected
     */
    ColumnResize.prototype.destroyed;
    /** @type {?} */
    ColumnResize.prototype.columnResizeNotifier;
    /** @type {?} */
    ColumnResize.prototype.elementRef;
    /**
     * @type {?}
     * @protected
     */
    ColumnResize.prototype.eventDispatcher;
    /**
     * @type {?}
     * @protected
     */
    ColumnResize.prototype.ngZone;
    /**
     * @type {?}
     * @protected
     */
    ColumnResize.prototype.notifier;
    /**
     * Unique ID for this table instance.
     * @type {?}
     * @protected
     */
    ColumnResize.prototype.selectorId;
    /**
     * The id attribute of the table, if specified.
     * @type {?}
     */
    ColumnResize.prototype.id;
}

/**
 * @fileoverview added by tsickle
 * Generated from: src/cdk-experimental/column-resize/column-resize-notifier.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * Indicates the width of a column.
 * @record
 */
function ColumnSize() { }
if (false) {
    /**
     * The ID/name of the column, as defined in CdkColumnDef.
     * @type {?}
     */
    ColumnSize.prototype.columnId;
    /**
     * The width in pixels of the column.
     * @type {?}
     */
    ColumnSize.prototype.size;
    /**
     * The width in pixels of the column prior to this update, if known.
     * @type {?|undefined}
     */
    ColumnSize.prototype.previousSize;
}
/**
 * Interface describing column size changes.
 * @record
 */
function ColumnSizeAction() { }
if (false) {
    /**
     * Whether the resize action should be applied instantaneously. False for events triggered during
     * a UI-triggered resize (such as with the mouse) until the mouse button is released. True
     * for all programatically triggered resizes.
     * @type {?|undefined}
     */
    ColumnSizeAction.prototype.completeImmediately;
}
/**
 * Originating source of column resize events within a table.
 * \@docs-private
 */
let ColumnResizeNotifierSource = /** @class */ (() => {
    /**
     * Originating source of column resize events within a table.
     * \@docs-private
     */
    class ColumnResizeNotifierSource {
        constructor() {
            /**
             * Emits when an in-progress resize is canceled.
             */
            this.resizeCanceled = new Subject();
            /**
             * Emits when a resize is applied.
             */
            this.resizeCompleted = new Subject();
            /**
             * Triggers a resize action.
             */
            this.triggerResize = new Subject();
        }
    }
    ColumnResizeNotifierSource.decorators = [
        { type: Injectable }
    ];
    return ColumnResizeNotifierSource;
})();
if (false) {
    /**
     * Emits when an in-progress resize is canceled.
     * @type {?}
     */
    ColumnResizeNotifierSource.prototype.resizeCanceled;
    /**
     * Emits when a resize is applied.
     * @type {?}
     */
    ColumnResizeNotifierSource.prototype.resizeCompleted;
    /**
     * Triggers a resize action.
     * @type {?}
     */
    ColumnResizeNotifierSource.prototype.triggerResize;
}
/**
 * Service for triggering column resizes imperatively or being notified of them.
 */
let ColumnResizeNotifier = /** @class */ (() => {
    /**
     * Service for triggering column resizes imperatively or being notified of them.
     */
    class ColumnResizeNotifier {
        /**
         * @param {?} _source
         */
        constructor(_source) {
            this._source = _source;
            /**
             * Emits whenever a column is resized.
             */
            this.resizeCompleted = this._source.resizeCompleted.asObservable();
        }
        /**
         * Instantly resizes the specified column.
         * @param {?} columnId
         * @param {?} size
         * @return {?}
         */
        resize(columnId, size) {
            this._source.triggerResize.next({ columnId, size, completeImmediately: true });
        }
    }
    ColumnResizeNotifier.decorators = [
        { type: Injectable }
    ];
    /** @nocollapse */
    ColumnResizeNotifier.ctorParameters = () => [
        { type: ColumnResizeNotifierSource }
    ];
    return ColumnResizeNotifier;
})();
if (false) {
    /**
     * Emits whenever a column is resized.
     * @type {?}
     */
    ColumnResizeNotifier.prototype.resizeCompleted;
    /**
     * @type {?}
     * @private
     */
    ColumnResizeNotifier.prototype._source;
}

/**
 * @fileoverview added by tsickle
 * Generated from: src/cdk-experimental/column-resize/event-dispatcher.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * Coordinates events between the column resize directives.
 */
let HeaderRowEventDispatcher = /** @class */ (() => {
    /**
     * Coordinates events between the column resize directives.
     */
    class HeaderRowEventDispatcher {
        /**
         * @param {?} _ngZone
         */
        constructor(_ngZone) {
            this._ngZone = _ngZone;
            /**
             * Emits the currently hovered header cell or null when no header cells are hovered.
             * Exposed publicly for events to feed in, but subscribers should use headerCellHoveredDistinct,
             * defined below.
             */
            this.headerCellHovered = new Subject();
            /**
             * Emits the header cell for which a user-triggered resize is active or null
             * when no resize is in progress.
             */
            this.overlayHandleActiveForCell = new Subject();
            /**
             * Distinct and shared version of headerCellHovered.
             */
            this.headerCellHoveredDistinct = this.headerCellHovered.pipe(distinctUntilChanged(), share());
            /**
             * Emits the header that is currently hovered or hosting an active resize event (with active
             * taking precedence).
             */
            this.headerRowHoveredOrActiveDistinct = combineLatest(this.headerCellHoveredDistinct.pipe(map((/**
             * @param {?} cell
             * @return {?}
             */
            cell => _closest(cell, HEADER_ROW_SELECTOR))), startWith(null), distinctUntilChanged()), this.overlayHandleActiveForCell.pipe(map((/**
             * @param {?} cell
             * @return {?}
             */
            cell => _closest(cell, HEADER_ROW_SELECTOR))), startWith(null), distinctUntilChanged())).pipe(skip(1), // Ignore initial [null, null] emission.
            map((/**
             * @param {?} __0
             * @return {?}
             */
            ([hovered, active]) => active || hovered)), distinctUntilChanged(), share());
            this._headerRowHoveredOrActiveDistinctReenterZone = this.headerRowHoveredOrActiveDistinct.pipe(this._enterZone(), share());
            // Optimization: Share row events observable with subsequent callers.
            // At startup, calls will be sequential by row (and typically there's only one).
            this._lastSeenRow = null;
            this._lastSeenRowHover = null;
        }
        /**
         * Emits whether the specified row should show its overlay controls.
         * Emission occurs within the NgZone.
         * @param {?} row
         * @return {?}
         */
        resizeOverlayVisibleForHeaderRow(row) {
            if (row !== this._lastSeenRow) {
                this._lastSeenRow = row;
                this._lastSeenRowHover = this._headerRowHoveredOrActiveDistinctReenterZone.pipe(map((/**
                 * @param {?} hoveredRow
                 * @return {?}
                 */
                hoveredRow => hoveredRow === row)), distinctUntilChanged(), share());
            }
            return (/** @type {?} */ (this._lastSeenRowHover));
        }
        /**
         * @private
         * @template T
         * @return {?}
         */
        _enterZone() {
            return (/**
             * @param {?} source
             * @return {?}
             */
            (source) => new Observable((/**
             * @param {?} observer
             * @return {?}
             */
            (observer) => source.subscribe({
                next: (/**
                 * @param {?} value
                 * @return {?}
                 */
                (value) => this._ngZone.run((/**
                 * @return {?}
                 */
                () => observer.next(value)))),
                error: (/**
                 * @param {?} err
                 * @return {?}
                 */
                (err) => observer.error(err)),
                complete: (/**
                 * @return {?}
                 */
                () => observer.complete())
            }))));
        }
    }
    HeaderRowEventDispatcher.decorators = [
        { type: Injectable }
    ];
    /** @nocollapse */
    HeaderRowEventDispatcher.ctorParameters = () => [
        { type: NgZone }
    ];
    return HeaderRowEventDispatcher;
})();
if (false) {
    /**
     * Emits the currently hovered header cell or null when no header cells are hovered.
     * Exposed publicly for events to feed in, but subscribers should use headerCellHoveredDistinct,
     * defined below.
     * @type {?}
     */
    HeaderRowEventDispatcher.prototype.headerCellHovered;
    /**
     * Emits the header cell for which a user-triggered resize is active or null
     * when no resize is in progress.
     * @type {?}
     */
    HeaderRowEventDispatcher.prototype.overlayHandleActiveForCell;
    /**
     * Distinct and shared version of headerCellHovered.
     * @type {?}
     */
    HeaderRowEventDispatcher.prototype.headerCellHoveredDistinct;
    /**
     * Emits the header that is currently hovered or hosting an active resize event (with active
     * taking precedence).
     * @type {?}
     */
    HeaderRowEventDispatcher.prototype.headerRowHoveredOrActiveDistinct;
    /**
     * @type {?}
     * @private
     */
    HeaderRowEventDispatcher.prototype._headerRowHoveredOrActiveDistinctReenterZone;
    /**
     * @type {?}
     * @private
     */
    HeaderRowEventDispatcher.prototype._lastSeenRow;
    /**
     * @type {?}
     * @private
     */
    HeaderRowEventDispatcher.prototype._lastSeenRowHover;
    /**
     * @type {?}
     * @private
     */
    HeaderRowEventDispatcher.prototype._ngZone;
}

/**
 * @fileoverview added by tsickle
 * Generated from: src/cdk-experimental/column-resize/resize-strategy.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
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
const TABLE_LAYOUT_FIXED_RESIZE_STRATEGY_PROVIDER = {
    provide: ResizeStrategy,
    useClass: TableLayoutFixedResizeStrategy,
};
/** @type {?} */
const FLEX_RESIZE_STRATEGY_PROVIDER = {
    provide: ResizeStrategy,
    useClass: CdkFlexTableResizeStrategy,
};

/**
 * @fileoverview added by tsickle
 * Generated from: src/cdk-experimental/column-resize/column-resize-directives/constants.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/** @type {?} */
const PROVIDERS = [
    ColumnResizeNotifier,
    HeaderRowEventDispatcher,
    ColumnResizeNotifierSource,
];
/** @type {?} */
const TABLE_PROVIDERS = [
    ...PROVIDERS,
    TABLE_LAYOUT_FIXED_RESIZE_STRATEGY_PROVIDER,
];
/** @type {?} */
const FLEX_PROVIDERS = [...PROVIDERS, FLEX_RESIZE_STRATEGY_PROVIDER];

/**
 * @fileoverview added by tsickle
 * Generated from: src/cdk-experimental/column-resize/column-resize-directives/column-resize.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * Explicitly enables column resizing for a table-based cdk-table.
 * Individual columns must be annotated specifically.
 */
let CdkColumnResize = /** @class */ (() => {
    /**
     * Explicitly enables column resizing for a table-based cdk-table.
     * Individual columns must be annotated specifically.
     */
    class CdkColumnResize extends ColumnResize {
        /**
         * @param {?} columnResizeNotifier
         * @param {?} elementRef
         * @param {?} eventDispatcher
         * @param {?} ngZone
         * @param {?} notifier
         */
        constructor(columnResizeNotifier, elementRef, eventDispatcher, ngZone, notifier) {
            super();
            this.columnResizeNotifier = columnResizeNotifier;
            this.elementRef = elementRef;
            this.eventDispatcher = eventDispatcher;
            this.ngZone = ngZone;
            this.notifier = notifier;
        }
    }
    CdkColumnResize.decorators = [
        { type: Directive, args: [{
                    selector: 'table[cdk-table][columnResize]',
                    providers: [
                        ...TABLE_PROVIDERS,
                        { provide: ColumnResize, useExisting: CdkColumnResize },
                    ],
                },] }
    ];
    /** @nocollapse */
    CdkColumnResize.ctorParameters = () => [
        { type: ColumnResizeNotifier },
        { type: ElementRef },
        { type: HeaderRowEventDispatcher },
        { type: NgZone },
        { type: ColumnResizeNotifierSource }
    ];
    return CdkColumnResize;
})();
if (false) {
    /** @type {?} */
    CdkColumnResize.prototype.columnResizeNotifier;
    /** @type {?} */
    CdkColumnResize.prototype.elementRef;
    /**
     * @type {?}
     * @protected
     */
    CdkColumnResize.prototype.eventDispatcher;
    /**
     * @type {?}
     * @protected
     */
    CdkColumnResize.prototype.ngZone;
    /**
     * @type {?}
     * @protected
     */
    CdkColumnResize.prototype.notifier;
}

/**
 * @fileoverview added by tsickle
 * Generated from: src/cdk-experimental/column-resize/column-resize-directives/column-resize-flex.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * Explicitly enables column resizing for a flexbox-based cdk-table.
 * Individual columns must be annotated specifically.
 */
let CdkColumnResizeFlex = /** @class */ (() => {
    /**
     * Explicitly enables column resizing for a flexbox-based cdk-table.
     * Individual columns must be annotated specifically.
     */
    class CdkColumnResizeFlex extends ColumnResize {
        /**
         * @param {?} columnResizeNotifier
         * @param {?} elementRef
         * @param {?} eventDispatcher
         * @param {?} ngZone
         * @param {?} notifier
         */
        constructor(columnResizeNotifier, elementRef, eventDispatcher, ngZone, notifier) {
            super();
            this.columnResizeNotifier = columnResizeNotifier;
            this.elementRef = elementRef;
            this.eventDispatcher = eventDispatcher;
            this.ngZone = ngZone;
            this.notifier = notifier;
        }
    }
    CdkColumnResizeFlex.decorators = [
        { type: Directive, args: [{
                    selector: 'cdk-table[columnResize]',
                    providers: [
                        ...FLEX_PROVIDERS,
                        { provide: ColumnResize, useExisting: CdkColumnResizeFlex },
                    ],
                },] }
    ];
    /** @nocollapse */
    CdkColumnResizeFlex.ctorParameters = () => [
        { type: ColumnResizeNotifier },
        { type: ElementRef },
        { type: HeaderRowEventDispatcher },
        { type: NgZone },
        { type: ColumnResizeNotifierSource }
    ];
    return CdkColumnResizeFlex;
})();
if (false) {
    /** @type {?} */
    CdkColumnResizeFlex.prototype.columnResizeNotifier;
    /** @type {?} */
    CdkColumnResizeFlex.prototype.elementRef;
    /**
     * @type {?}
     * @protected
     */
    CdkColumnResizeFlex.prototype.eventDispatcher;
    /**
     * @type {?}
     * @protected
     */
    CdkColumnResizeFlex.prototype.ngZone;
    /**
     * @type {?}
     * @protected
     */
    CdkColumnResizeFlex.prototype.notifier;
}

/**
 * @fileoverview added by tsickle
 * Generated from: src/cdk-experimental/column-resize/column-resize-directives/default-enabled-column-resize.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * Implicitly enables column resizing for a table-based cdk-table.
 * Individual columns will be resizable unless opted out.
 */
let CdkDefaultEnabledColumnResize = /** @class */ (() => {
    /**
     * Implicitly enables column resizing for a table-based cdk-table.
     * Individual columns will be resizable unless opted out.
     */
    class CdkDefaultEnabledColumnResize extends ColumnResize {
        /**
         * @param {?} columnResizeNotifier
         * @param {?} elementRef
         * @param {?} eventDispatcher
         * @param {?} ngZone
         * @param {?} notifier
         */
        constructor(columnResizeNotifier, elementRef, eventDispatcher, ngZone, notifier) {
            super();
            this.columnResizeNotifier = columnResizeNotifier;
            this.elementRef = elementRef;
            this.eventDispatcher = eventDispatcher;
            this.ngZone = ngZone;
            this.notifier = notifier;
        }
    }
    CdkDefaultEnabledColumnResize.decorators = [
        { type: Directive, args: [{
                    selector: 'table[cdk-table]',
                    providers: [
                        ...TABLE_PROVIDERS,
                        { provide: ColumnResize, useExisting: CdkDefaultEnabledColumnResize },
                    ],
                },] }
    ];
    /** @nocollapse */
    CdkDefaultEnabledColumnResize.ctorParameters = () => [
        { type: ColumnResizeNotifier },
        { type: ElementRef },
        { type: HeaderRowEventDispatcher },
        { type: NgZone },
        { type: ColumnResizeNotifierSource }
    ];
    return CdkDefaultEnabledColumnResize;
})();
if (false) {
    /** @type {?} */
    CdkDefaultEnabledColumnResize.prototype.columnResizeNotifier;
    /** @type {?} */
    CdkDefaultEnabledColumnResize.prototype.elementRef;
    /**
     * @type {?}
     * @protected
     */
    CdkDefaultEnabledColumnResize.prototype.eventDispatcher;
    /**
     * @type {?}
     * @protected
     */
    CdkDefaultEnabledColumnResize.prototype.ngZone;
    /**
     * @type {?}
     * @protected
     */
    CdkDefaultEnabledColumnResize.prototype.notifier;
}

/**
 * @fileoverview added by tsickle
 * Generated from: src/cdk-experimental/column-resize/column-resize-directives/default-enabled-column-resize-flex.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * Implicitly enables column resizing for a flex cdk-table.
 * Individual columns will be resizable unless opted out.
 */
let CdkDefaultEnabledColumnResizeFlex = /** @class */ (() => {
    /**
     * Implicitly enables column resizing for a flex cdk-table.
     * Individual columns will be resizable unless opted out.
     */
    class CdkDefaultEnabledColumnResizeFlex extends ColumnResize {
        /**
         * @param {?} columnResizeNotifier
         * @param {?} elementRef
         * @param {?} eventDispatcher
         * @param {?} ngZone
         * @param {?} notifier
         */
        constructor(columnResizeNotifier, elementRef, eventDispatcher, ngZone, notifier) {
            super();
            this.columnResizeNotifier = columnResizeNotifier;
            this.elementRef = elementRef;
            this.eventDispatcher = eventDispatcher;
            this.ngZone = ngZone;
            this.notifier = notifier;
        }
    }
    CdkDefaultEnabledColumnResizeFlex.decorators = [
        { type: Directive, args: [{
                    selector: 'cdk-table',
                    providers: [
                        ...FLEX_PROVIDERS,
                        { provide: ColumnResize, useExisting: CdkDefaultEnabledColumnResizeFlex },
                    ],
                },] }
    ];
    /** @nocollapse */
    CdkDefaultEnabledColumnResizeFlex.ctorParameters = () => [
        { type: ColumnResizeNotifier },
        { type: ElementRef },
        { type: HeaderRowEventDispatcher },
        { type: NgZone },
        { type: ColumnResizeNotifierSource }
    ];
    return CdkDefaultEnabledColumnResizeFlex;
})();
if (false) {
    /** @type {?} */
    CdkDefaultEnabledColumnResizeFlex.prototype.columnResizeNotifier;
    /** @type {?} */
    CdkDefaultEnabledColumnResizeFlex.prototype.elementRef;
    /**
     * @type {?}
     * @protected
     */
    CdkDefaultEnabledColumnResizeFlex.prototype.eventDispatcher;
    /**
     * @type {?}
     * @protected
     */
    CdkDefaultEnabledColumnResizeFlex.prototype.ngZone;
    /**
     * @type {?}
     * @protected
     */
    CdkDefaultEnabledColumnResizeFlex.prototype.notifier;
}

/**
 * @fileoverview added by tsickle
 * Generated from: src/cdk-experimental/column-resize/column-resize-module.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * One of two NgModules for use with CdkColumnResize.
 * When using this module, columns are resizable by default.
 */
let CdkColumnResizeDefaultEnabledModule = /** @class */ (() => {
    /**
     * One of two NgModules for use with CdkColumnResize.
     * When using this module, columns are resizable by default.
     */
    class CdkColumnResizeDefaultEnabledModule {
    }
    CdkColumnResizeDefaultEnabledModule.decorators = [
        { type: NgModule, args: [{
                    declarations: [CdkDefaultEnabledColumnResize, CdkDefaultEnabledColumnResizeFlex],
                    exports: [CdkDefaultEnabledColumnResize, CdkDefaultEnabledColumnResizeFlex],
                },] }
    ];
    return CdkColumnResizeDefaultEnabledModule;
})();
/**
 * One of two NgModules for use with CdkColumnResize.
 * When using this module, columns are not resizable by default.
 */
let CdkColumnResizeModule = /** @class */ (() => {
    /**
     * One of two NgModules for use with CdkColumnResize.
     * When using this module, columns are not resizable by default.
     */
    class CdkColumnResizeModule {
    }
    CdkColumnResizeModule.decorators = [
        { type: NgModule, args: [{
                    declarations: [CdkColumnResize, CdkColumnResizeFlex],
                    exports: [CdkColumnResize, CdkColumnResizeFlex],
                },] }
    ];
    return CdkColumnResizeModule;
})();

/**
 * @fileoverview added by tsickle
 * Generated from: src/cdk-experimental/column-resize/column-size-store.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * Can be provided by the host application to enable persistence of column resize state.
 * @abstract
 */
let ColumnSizeStore = /** @class */ (() => {
    /**
     * Can be provided by the host application to enable persistence of column resize state.
     * @abstract
     */
    class ColumnSizeStore {
    }
    ColumnSizeStore.decorators = [
        { type: Injectable }
    ];
    return ColumnSizeStore;
})();
if (false) {
    /**
     * Returns the persisted size of the specified column in the specified table.
     * @abstract
     * @param {?} tableId
     * @param {?} columnId
     * @return {?}
     */
    ColumnSizeStore.prototype.getSize = function (tableId, columnId) { };
    /**
     * Persists the size of the specified column in the specified table.
     * @abstract
     * @param {?} tableId
     * @param {?} columnId
     * @return {?}
     */
    ColumnSizeStore.prototype.setSize = function (tableId, columnId) { };
}

/**
 * @fileoverview added by tsickle
 * Generated from: src/cdk-experimental/column-resize/resize-ref.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Tracks state of resize events in progress.
 */
class ResizeRef {
    /**
     * @param {?} origin
     * @param {?} overlayRef
     * @param {?} minWidthPx
     * @param {?} maxWidthPx
     */
    constructor(origin, overlayRef, minWidthPx, maxWidthPx) {
        this.origin = origin;
        this.overlayRef = overlayRef;
        this.minWidthPx = minWidthPx;
        this.maxWidthPx = maxWidthPx;
    }
}
if (false) {
    /** @type {?} */
    ResizeRef.prototype.origin;
    /** @type {?} */
    ResizeRef.prototype.overlayRef;
    /** @type {?} */
    ResizeRef.prototype.minWidthPx;
    /** @type {?} */
    ResizeRef.prototype.maxWidthPx;
}

/**
 * @fileoverview added by tsickle
 * Generated from: src/cdk-experimental/column-resize/resizable.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/** @type {?} */
const OVERLAY_ACTIVE_CLASS = 'cdk-resizable-overlay-thumb-active';
/**
 * Base class for Resizable directives which are applied to column headers to make those columns
 * resizable.
 * @abstract
 * @template HandleComponent
 */
let Resizable = /** @class */ (() => {
    /**
     * Base class for Resizable directives which are applied to column headers to make those columns
     * resizable.
     * @abstract
     * @template HandleComponent
     */
    class Resizable {
        constructor() {
            this.minWidthPxInternal = 0;
            this.maxWidthPxInternal = Number.MAX_SAFE_INTEGER;
            this.destroyed = new ReplaySubject();
        }
        /**
         * The minimum width to allow the column to be sized to.
         * @return {?}
         */
        get minWidthPx() {
            return this.minWidthPxInternal;
        }
        /**
         * @param {?} value
         * @return {?}
         */
        set minWidthPx(value) {
            this.minWidthPxInternal = value;
            if (this.elementRef.nativeElement) {
                this.columnResize.setResized();
                this._applyMinWidthPx();
            }
        }
        /**
         * The maximum width to allow the column to be sized to.
         * @return {?}
         */
        get maxWidthPx() {
            return this.maxWidthPxInternal;
        }
        /**
         * @param {?} value
         * @return {?}
         */
        set maxWidthPx(value) {
            this.maxWidthPxInternal = value;
            if (this.elementRef.nativeElement) {
                this.columnResize.setResized();
                this._applyMaxWidthPx();
            }
        }
        /**
         * @return {?}
         */
        ngAfterViewInit() {
            this._listenForRowHoverEvents();
            this._listenForResizeEvents();
            this._appendInlineHandle();
            this._applyMinWidthPx();
            this._applyMaxWidthPx();
        }
        /**
         * @return {?}
         */
        ngOnDestroy() {
            this.destroyed.next();
            this.destroyed.complete();
            if (this.inlineHandle) {
                (/** @type {?} */ (this.elementRef.nativeElement)).removeChild(this.inlineHandle);
            }
            if (this.overlayRef) {
                this.overlayRef.dispose();
            }
        }
        /**
         * @private
         * @return {?}
         */
        _createOverlayForHandle() {
            // Use of overlays allows us to properly capture click events spanning parts
            // of two table cells and is also useful for displaying a resize thumb
            // over both cells and extending it down the table as needed.
            // Use of overlays allows us to properly capture click events spanning parts
            // of two table cells and is also useful for displaying a resize thumb
            // over both cells and extending it down the table as needed.
            /** @type {?} */
            const isRtl = this.directionality.value === 'rtl';
            /** @type {?} */
            const positionStrategy = this.overlay.position()
                .flexibleConnectedTo((/** @type {?} */ (this.elementRef.nativeElement)))
                .withFlexibleDimensions(false)
                .withGrowAfterOpen(false)
                .withPush(false)
                .withDefaultOffsetX(isRtl ? 1 : 0)
                .withPositions([{
                    originX: isRtl ? 'start' : 'end',
                    originY: 'top',
                    overlayX: 'center',
                    overlayY: 'top',
                }]);
            return this.overlay.create({
                // Always position the overlay based on left-indexed coordinates.
                direction: 'ltr',
                disposeOnNavigation: true,
                positionStrategy,
                scrollStrategy: this.overlay.scrollStrategies.reposition(),
                width: '16px',
            });
        }
        /**
         * @private
         * @return {?}
         */
        _listenForRowHoverEvents() {
            /** @type {?} */
            const element = (/** @type {?} */ (this.elementRef.nativeElement));
            /** @type {?} */
            const takeUntilDestroyed = takeUntil(this.destroyed);
            this.eventDispatcher.resizeOverlayVisibleForHeaderRow((/** @type {?} */ (_closest(element, HEADER_ROW_SELECTOR))))
                .pipe(takeUntilDestroyed).subscribe((/**
             * @param {?} hoveringRow
             * @return {?}
             */
            hoveringRow => {
                if (hoveringRow) {
                    if (!this.overlayRef) {
                        this.overlayRef = this._createOverlayForHandle();
                    }
                    this._showHandleOverlay();
                }
                else if (this.overlayRef) {
                    // todo - can't detach during an active resize - need to work that out
                    this.overlayRef.detach();
                }
            }));
        }
        /**
         * @private
         * @return {?}
         */
        _listenForResizeEvents() {
            /** @type {?} */
            const takeUntilDestroyed = takeUntil(this.destroyed);
            merge(this.resizeNotifier.resizeCanceled, this.resizeNotifier.triggerResize).pipe(takeUntilDestroyed, filter((/**
             * @param {?} columnSize
             * @return {?}
             */
            columnSize => columnSize.columnId === this.columnDef.name))).subscribe((/**
             * @param {?} __0
             * @return {?}
             */
            ({ size, previousSize, completeImmediately }) => {
                (/** @type {?} */ (this.elementRef.nativeElement)).classList.add(OVERLAY_ACTIVE_CLASS);
                this._applySize(size, previousSize);
                if (completeImmediately) {
                    this._completeResizeOperation();
                }
            }));
            merge(this.resizeNotifier.resizeCanceled, this.resizeNotifier.resizeCompleted).pipe(takeUntilDestroyed).subscribe((/**
             * @param {?} columnSize
             * @return {?}
             */
            columnSize => {
                this._cleanUpAfterResize(columnSize);
            }));
        }
        /**
         * @private
         * @return {?}
         */
        _completeResizeOperation() {
            this.ngZone.run((/**
             * @return {?}
             */
            () => {
                this.resizeNotifier.resizeCompleted.next({
                    columnId: this.columnDef.name,
                    size: (/** @type {?} */ (this.elementRef.nativeElement)).offsetWidth,
                });
            }));
        }
        /**
         * @private
         * @param {?} columnSize
         * @return {?}
         */
        _cleanUpAfterResize(columnSize) {
            (/** @type {?} */ (this.elementRef.nativeElement)).classList.remove(OVERLAY_ACTIVE_CLASS);
            if (this.overlayRef && this.overlayRef.hasAttached()) {
                this._updateOverlayHandleHeight();
                this.overlayRef.updatePosition();
                if (columnSize.columnId === this.columnDef.name) {
                    (/** @type {?} */ (this.inlineHandle)).focus();
                }
            }
        }
        /**
         * @private
         * @return {?}
         */
        _createHandlePortal() {
            /** @type {?} */
            const injector = new PortalInjector(this.injector, new WeakMap([[
                    ResizeRef,
                    new ResizeRef(this.elementRef, (/** @type {?} */ (this.overlayRef)), this.minWidthPx, this.maxWidthPx),
                ]]));
            return new ComponentPortal(this.getOverlayHandleComponentType(), this.viewContainerRef, injector);
        }
        /**
         * @private
         * @return {?}
         */
        _showHandleOverlay() {
            this._updateOverlayHandleHeight();
            (/** @type {?} */ (this.overlayRef)).attach(this._createHandlePortal());
        }
        /**
         * @private
         * @return {?}
         */
        _updateOverlayHandleHeight() {
            (/** @type {?} */ (this.overlayRef)).updateSize({ height: (/** @type {?} */ (this.elementRef.nativeElement)).offsetHeight });
        }
        /**
         * @private
         * @param {?} sizeInPixels
         * @param {?=} previousSize
         * @return {?}
         */
        _applySize(sizeInPixels, previousSize) {
            /** @type {?} */
            const sizeToApply = Math.min(Math.max(sizeInPixels, this.minWidthPx, 0), this.maxWidthPx);
            this.resizeStrategy.applyColumnSize(this.columnDef.cssClassFriendlyName, (/** @type {?} */ (this.elementRef.nativeElement)), sizeToApply, previousSize);
        }
        /**
         * @private
         * @return {?}
         */
        _applyMinWidthPx() {
            this.resizeStrategy.applyMinColumnSize(this.columnDef.cssClassFriendlyName, this.elementRef.nativeElement, this.minWidthPx);
        }
        /**
         * @private
         * @return {?}
         */
        _applyMaxWidthPx() {
            this.resizeStrategy.applyMaxColumnSize(this.columnDef.cssClassFriendlyName, this.elementRef.nativeElement, this.maxWidthPx);
        }
        /**
         * @private
         * @return {?}
         */
        _appendInlineHandle() {
            this.inlineHandle = this.document.createElement('div');
            this.inlineHandle.tabIndex = 0;
            this.inlineHandle.className = this.getInlineHandleCssClassName();
            // TODO: Apply correct aria role (probably slider) after a11y spec questions resolved.
            (/** @type {?} */ (this.elementRef.nativeElement)).appendChild(this.inlineHandle);
        }
    }
    Resizable.decorators = [
        { type: Directive }
    ];
    return Resizable;
})();
if (false) {
    /**
     * @type {?}
     * @protected
     */
    Resizable.prototype.minWidthPxInternal;
    /**
     * @type {?}
     * @protected
     */
    Resizable.prototype.maxWidthPxInternal;
    /**
     * @type {?}
     * @protected
     */
    Resizable.prototype.inlineHandle;
    /**
     * @type {?}
     * @protected
     */
    Resizable.prototype.overlayRef;
    /**
     * @type {?}
     * @protected
     */
    Resizable.prototype.destroyed;
    /**
     * @type {?}
     * @protected
     */
    Resizable.prototype.columnDef;
    /**
     * @type {?}
     * @protected
     */
    Resizable.prototype.columnResize;
    /**
     * @type {?}
     * @protected
     */
    Resizable.prototype.directionality;
    /**
     * @type {?}
     * @protected
     */
    Resizable.prototype.document;
    /**
     * @type {?}
     * @protected
     */
    Resizable.prototype.elementRef;
    /**
     * @type {?}
     * @protected
     */
    Resizable.prototype.eventDispatcher;
    /**
     * @type {?}
     * @protected
     */
    Resizable.prototype.injector;
    /**
     * @type {?}
     * @protected
     */
    Resizable.prototype.ngZone;
    /**
     * @type {?}
     * @protected
     */
    Resizable.prototype.overlay;
    /**
     * @type {?}
     * @protected
     */
    Resizable.prototype.resizeNotifier;
    /**
     * @type {?}
     * @protected
     */
    Resizable.prototype.resizeStrategy;
    /**
     * @type {?}
     * @protected
     */
    Resizable.prototype.viewContainerRef;
    /**
     * @abstract
     * @protected
     * @return {?}
     */
    Resizable.prototype.getInlineHandleCssClassName = function () { };
    /**
     * @abstract
     * @protected
     * @return {?}
     */
    Resizable.prototype.getOverlayHandleComponentType = function () { };
}

/**
 * @fileoverview added by tsickle
 * Generated from: src/cdk-experimental/column-resize/overlay-handle.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
// TODO: Take another look at using cdk drag drop. IIRC I ran into a couple
// good reasons for not using it but I don't remember what they were at this point.
/**
 * Base class for a component shown over the edge of a resizable column that is responsible
 * for handling column resize mouse events and displaying any visible UI on the column edge.
 * @abstract
 */
let ResizeOverlayHandle = /** @class */ (() => {
    // TODO: Take another look at using cdk drag drop. IIRC I ran into a couple
    // good reasons for not using it but I don't remember what they were at this point.
    /**
     * Base class for a component shown over the edge of a resizable column that is responsible
     * for handling column resize mouse events and displaying any visible UI on the column edge.
     * @abstract
     */
    class ResizeOverlayHandle {
        constructor() {
            this.destroyed = new ReplaySubject();
        }
        /**
         * @return {?}
         */
        ngAfterViewInit() {
            this._listenForMouseEvents();
        }
        /**
         * @return {?}
         */
        ngOnDestroy() {
            this.destroyed.next();
            this.destroyed.complete();
        }
        /**
         * @private
         * @return {?}
         */
        _listenForMouseEvents() {
            this.ngZone.runOutsideAngular((/**
             * @return {?}
             */
            () => {
                /** @type {?} */
                const takeUntilDestroyed = takeUntil(this.destroyed);
                fromEvent((/** @type {?} */ (this.elementRef.nativeElement)), 'mouseenter').pipe(takeUntilDestroyed, mapTo((/** @type {?} */ (this.resizeRef.origin.nativeElement)))).subscribe((/**
                 * @param {?} cell
                 * @return {?}
                 */
                cell => this.eventDispatcher.headerCellHovered.next(cell)));
                fromEvent((/** @type {?} */ (this.elementRef.nativeElement)), 'mouseleave').pipe(takeUntilDestroyed, map((/**
                 * @param {?} event
                 * @return {?}
                 */
                event => event.relatedTarget &&
                    _closest((/** @type {?} */ (event.relatedTarget)), HEADER_CELL_SELECTOR)))).subscribe((/**
                 * @param {?} cell
                 * @return {?}
                 */
                cell => this.eventDispatcher.headerCellHovered.next(cell)));
                fromEvent((/** @type {?} */ (this.elementRef.nativeElement)), 'mousedown')
                    .pipe(takeUntilDestroyed).subscribe((/**
                 * @param {?} mousedownEvent
                 * @return {?}
                 */
                mousedownEvent => {
                    this._dragStarted(mousedownEvent);
                }));
            }));
        }
        /**
         * @private
         * @param {?} mousedownEvent
         * @return {?}
         */
        _dragStarted(mousedownEvent) {
            // Only allow dragging using the left mouse button.
            if (mousedownEvent.button !== 0) {
                return;
            }
            /** @type {?} */
            const mouseup = fromEvent(this.document, 'mouseup');
            /** @type {?} */
            const mousemove = fromEvent(this.document, 'mousemove');
            /** @type {?} */
            const escape = fromEvent(this.document, 'keyup')
                .pipe(filter((/**
             * @param {?} event
             * @return {?}
             */
            event => event.keyCode === ESCAPE)));
            /** @type {?} */
            const startX = mousedownEvent.screenX;
            /** @type {?} */
            const initialSize = this._getOriginWidth();
            /** @type {?} */
            let overlayOffset = this._getOverlayOffset();
            /** @type {?} */
            let originOffset = this._getOriginOffset();
            /** @type {?} */
            let size = initialSize;
            /** @type {?} */
            let overshot = 0;
            this.updateResizeActive(true);
            mouseup.pipe(takeUntil(escape), takeUntil(this.destroyed)).subscribe((/**
             * @param {?} __0
             * @return {?}
             */
            ({ screenX }) => {
                this._notifyResizeEnded(size, screenX !== startX);
            }));
            escape.pipe(takeUntil(mouseup), takeUntil(this.destroyed)).subscribe((/**
             * @return {?}
             */
            () => {
                this._notifyResizeEnded(initialSize);
            }));
            mousemove.pipe(map((/**
             * @param {?} __0
             * @return {?}
             */
            ({ screenX }) => screenX)), startWith(startX), distinctUntilChanged(), pairwise(), takeUntil(mouseup), takeUntil(escape), takeUntil(this.destroyed)).subscribe((/**
             * @param {?} __0
             * @return {?}
             */
            ([prevX, currX]) => {
                /** @type {?} */
                let deltaX = currX - prevX;
                // If the mouse moved further than the resize was able to match, limit the
                // movement of the overlay to match the actual size and position of the origin.
                if (overshot !== 0) {
                    if (overshot < 0 && deltaX < 0 || overshot > 0 && deltaX > 0) {
                        overshot += deltaX;
                        return;
                    }
                    else {
                        /** @type {?} */
                        const remainingOvershot = overshot + deltaX;
                        overshot = overshot > 0 ?
                            Math.max(remainingOvershot, 0) : Math.min(remainingOvershot, 0);
                        deltaX = remainingOvershot - overshot;
                        if (deltaX === 0) {
                            return;
                        }
                    }
                }
                /** @type {?} */
                let computedNewSize = size + (this._isLtr() ? deltaX : -deltaX);
                computedNewSize = Math.min(Math.max(computedNewSize, this.resizeRef.minWidthPx, 0), this.resizeRef.maxWidthPx);
                this.resizeNotifier.triggerResize.next({ columnId: this.columnDef.name, size: computedNewSize, previousSize: size });
                /** @type {?} */
                const originNewSize = this._getOriginWidth();
                /** @type {?} */
                const originNewOffset = this._getOriginOffset();
                /** @type {?} */
                const originOffsetDeltaX = originNewOffset - originOffset;
                /** @type {?} */
                const originSizeDeltaX = originNewSize - size;
                size = originNewSize;
                originOffset = originNewOffset;
                overshot += deltaX + (this._isLtr() ? -originSizeDeltaX : originSizeDeltaX);
                overlayOffset += originOffsetDeltaX + (this._isLtr() ? originSizeDeltaX : 0);
                this._updateOverlayOffset(overlayOffset);
            }));
        }
        /**
         * @protected
         * @param {?} active
         * @return {?}
         */
        updateResizeActive(active) {
            this.eventDispatcher.overlayHandleActiveForCell.next(active ? (/** @type {?} */ (this.resizeRef.origin.nativeElement)) : null);
        }
        /**
         * @private
         * @return {?}
         */
        _getOriginWidth() {
            return (/** @type {?} */ (this.resizeRef.origin.nativeElement)).offsetWidth;
        }
        /**
         * @private
         * @return {?}
         */
        _getOriginOffset() {
            return (/** @type {?} */ (this.resizeRef.origin.nativeElement)).offsetLeft;
        }
        /**
         * @private
         * @return {?}
         */
        _getOverlayOffset() {
            return parseInt((/** @type {?} */ (this.resizeRef.overlayRef.overlayElement.style.left)), 10);
        }
        /**
         * @private
         * @param {?} offset
         * @return {?}
         */
        _updateOverlayOffset(offset) {
            this.resizeRef.overlayRef.overlayElement.style.left = coerceCssPixelValue(offset);
        }
        /**
         * @private
         * @return {?}
         */
        _isLtr() {
            return this.directionality.value === 'ltr';
        }
        /**
         * @private
         * @param {?} size
         * @param {?=} completedSuccessfully
         * @return {?}
         */
        _notifyResizeEnded(size, completedSuccessfully = false) {
            this.updateResizeActive(false);
            this.ngZone.run((/**
             * @return {?}
             */
            () => {
                /** @type {?} */
                const sizeMessage = { columnId: this.columnDef.name, size };
                if (completedSuccessfully) {
                    this.resizeNotifier.resizeCompleted.next(sizeMessage);
                }
                else {
                    this.resizeNotifier.resizeCanceled.next(sizeMessage);
                }
            }));
        }
    }
    ResizeOverlayHandle.decorators = [
        { type: Directive }
    ];
    return ResizeOverlayHandle;
})();
if (false) {
    /**
     * @type {?}
     * @protected
     */
    ResizeOverlayHandle.prototype.destroyed;
    /**
     * @type {?}
     * @protected
     */
    ResizeOverlayHandle.prototype.columnDef;
    /**
     * @type {?}
     * @protected
     */
    ResizeOverlayHandle.prototype.document;
    /**
     * @type {?}
     * @protected
     */
    ResizeOverlayHandle.prototype.directionality;
    /**
     * @type {?}
     * @protected
     */
    ResizeOverlayHandle.prototype.elementRef;
    /**
     * @type {?}
     * @protected
     */
    ResizeOverlayHandle.prototype.eventDispatcher;
    /**
     * @type {?}
     * @protected
     */
    ResizeOverlayHandle.prototype.ngZone;
    /**
     * @type {?}
     * @protected
     */
    ResizeOverlayHandle.prototype.resizeNotifier;
    /**
     * @type {?}
     * @protected
     */
    ResizeOverlayHandle.prototype.resizeRef;
}

/**
 * @fileoverview added by tsickle
 * Generated from: src/cdk-experimental/column-resize/public-api.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */

/**
 * Generated bundle index. Do not edit.
 */

export { CdkColumnResize, CdkColumnResizeDefaultEnabledModule, CdkColumnResizeFlex, CdkColumnResizeModule, CdkDefaultEnabledColumnResize, CdkDefaultEnabledColumnResizeFlex, CdkFlexTableResizeStrategy, ColumnResize, ColumnResizeNotifier, ColumnResizeNotifierSource, ColumnSizeStore, FLEX_RESIZE_STRATEGY_PROVIDER, HeaderRowEventDispatcher, Resizable, ResizeOverlayHandle, ResizeRef, ResizeStrategy, TABLE_LAYOUT_FIXED_RESIZE_STRATEGY_PROVIDER, TableLayoutFixedResizeStrategy, TABLE_PROVIDERS as ɵangular_material_src_cdk_experimental_column_resize_column_resize_a, FLEX_PROVIDERS as ɵangular_material_src_cdk_experimental_column_resize_column_resize_b };
//# sourceMappingURL=column-resize.js.map
