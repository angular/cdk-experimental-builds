import * as i0 from '@angular/core';
import { InjectionToken, inject, Renderer2, Directive, Input, Injectable, NgZone, CSP_NONCE, DOCUMENT, ElementRef, NgModule, Injector, runInInjectionContext, afterNextRender } from '@angular/core';
import { _IdGenerator } from '@angular/cdk/a11y';
import { Subject, merge, combineLatest, Observable } from 'rxjs';
import { mapTo, take, takeUntil, startWith, pairwise, distinctUntilChanged, share, map, skip, filter } from 'rxjs/operators';
import { c as closest } from './polyfill-CXksG4af.mjs';
import { CdkTable } from '@angular/cdk/table';
import { coerceCssPixelValue } from '@angular/cdk/coercion';
import { ComponentPortal } from '@angular/cdk/portal';
import { createFlexibleConnectedPositionStrategy, createOverlayRef, createRepositionScrollStrategy } from '@angular/cdk/overlay';
import { ESCAPE } from '@angular/cdk/keycodes';

// TODO: Figure out how to remove `mat-` classes from the CDK part of the
// column resize implementation.
const HEADER_CELL_SELECTOR = '.cdk-header-cell, .mat-header-cell';
const HEADER_ROW_SELECTOR = '.cdk-header-row, .mat-header-row';
const RESIZE_OVERLAY_SELECTOR = '.mat-column-resize-overlay-thumb';

const HOVER_OR_ACTIVE_CLASS = 'cdk-column-resize-hover-or-active';
const WITH_RESIZED_COLUMN_CLASS = 'cdk-column-resize-with-resized-column';
const COLUMN_RESIZE_OPTIONS = new InjectionToken('CdkColumnResizeOptions');
/**
 * Base class for ColumnResize directives which attach to mat-table elements to
 * provide common events and services for column resizing.
 */
class ColumnResize {
    _renderer = inject(Renderer2);
    _eventCleanups;
    destroyed = new Subject();
    /** Unique ID for this table instance. */
    selectorId = inject(_IdGenerator).getId('cdk-column-resize-');
    /** The id attribute of the table, if specified. */
    id;
    /** @docs-private Whether a call to updateStickyColumnStyles is pending after a resize. */
    _flushPending = false;
    /**
     * Whether to update the column's width continuously as the mouse position
     * changes, or to wait until mouseup to apply the new size.
     */
    liveResizeUpdates = inject(COLUMN_RESIZE_OPTIONS, { optional: true })?.liveResizeUpdates ?? true;
    ngAfterViewInit() {
        this.elementRef.nativeElement.classList.add(this.getUniqueCssClass());
        this._listenForRowHoverEvents();
        this._listenForResizeActivity();
        this._listenForHoverActivity();
    }
    ngOnDestroy() {
        this._eventCleanups?.forEach(cleanup => cleanup());
        this.destroyed.next();
        this.destroyed.complete();
    }
    /** Gets the unique CSS class name for this table instance. */
    getUniqueCssClass() {
        return this.selectorId;
    }
    /** Gets the ID for this table used for column size persistance. */
    getTableId() {
        return String(this.elementRef.nativeElement.id);
    }
    /** Called when a column in the table is resized. Applies a css class to the table element. */
    setResized() {
        this.elementRef.nativeElement.classList.add(WITH_RESIZED_COLUMN_CLASS);
    }
    _listenForRowHoverEvents() {
        this.ngZone.runOutsideAngular(() => {
            const element = this.elementRef.nativeElement;
            this._eventCleanups = [
                this._renderer.listen(element, 'mouseover', (event) => {
                    this.eventDispatcher.headerCellHovered.next(closest(event.target, HEADER_CELL_SELECTOR));
                }),
                this._renderer.listen(element, 'mouseleave', (event) => {
                    if (event.relatedTarget &&
                        !event.relatedTarget.matches(RESIZE_OVERLAY_SELECTOR)) {
                        this.eventDispatcher.headerCellHovered.next(null);
                    }
                }),
            ];
        });
    }
    _listenForResizeActivity() {
        merge(this.eventDispatcher.overlayHandleActiveForCell.pipe(mapTo(undefined)), this.notifier.triggerResize.pipe(mapTo(undefined)), this.notifier.resizeCompleted.pipe(mapTo(undefined)))
            .pipe(take(1), takeUntil(this.destroyed))
            .subscribe(() => {
            this.setResized();
        });
    }
    _listenForHoverActivity() {
        this.eventDispatcher.headerRowHoveredOrActiveDistinct
            .pipe(startWith(null), pairwise(), takeUntil(this.destroyed))
            .subscribe(([previousRow, hoveredRow]) => {
            if (hoveredRow) {
                hoveredRow.classList.add(HOVER_OR_ACTIVE_CLASS);
            }
            if (previousRow) {
                previousRow.classList.remove(HOVER_OR_ACTIVE_CLASS);
            }
        });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: ColumnResize, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "20.0.0", type: ColumnResize, isStandalone: true, inputs: { liveResizeUpdates: "liveResizeUpdates" }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: ColumnResize, decorators: [{
            type: Directive
        }], propDecorators: { liveResizeUpdates: [{
                type: Input
            }] } });

/**
 * Originating source of column resize events within a table.
 * @docs-private
 */
class ColumnResizeNotifierSource {
    /** Emits when an in-progress resize is canceled. */
    resizeCanceled = new Subject();
    /** Emits when a resize is applied. */
    resizeCompleted = new Subject();
    /** Triggers a resize action. */
    triggerResize = new Subject();
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: ColumnResizeNotifierSource, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: ColumnResizeNotifierSource });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: ColumnResizeNotifierSource, decorators: [{
            type: Injectable
        }] });
/** Service for triggering column resizes imperatively or being notified of them. */
class ColumnResizeNotifier {
    _source = inject(ColumnResizeNotifierSource);
    /** Emits whenever a column is resized. */
    resizeCompleted = this._source.resizeCompleted;
    /** Instantly resizes the specified column. */
    resize(columnId, size) {
        this._source.triggerResize.next({
            columnId,
            size,
            completeImmediately: true,
            isStickyColumn: true,
        });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: ColumnResizeNotifier, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: ColumnResizeNotifier });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: ColumnResizeNotifier, decorators: [{
            type: Injectable
        }] });

/** Coordinates events between the column resize directives. */
class HeaderRowEventDispatcher {
    _ngZone = inject(NgZone);
    /**
     * Emits the currently hovered header cell or null when no header cells are hovered.
     * Exposed publicly for events to feed in, but subscribers should use headerCellHoveredDistinct,
     * defined below.
     */
    headerCellHovered = new Subject();
    /**
     * Emits the header cell for which a user-triggered resize is active or null
     * when no resize is in progress.
     */
    overlayHandleActiveForCell = new Subject();
    /** Distinct and shared version of headerCellHovered. */
    headerCellHoveredDistinct = this.headerCellHovered.pipe(distinctUntilChanged(), share());
    /**
     * Emits the header that is currently hovered or hosting an active resize event (with active
     * taking precedence).
     */
    headerRowHoveredOrActiveDistinct = combineLatest([
        this.headerCellHoveredDistinct.pipe(map(cell => closest(cell, HEADER_ROW_SELECTOR)), startWith(null), distinctUntilChanged()),
        this.overlayHandleActiveForCell.pipe(map(cell => closest(cell, HEADER_ROW_SELECTOR)), startWith(null), distinctUntilChanged()),
    ]).pipe(skip(1), // Ignore initial [null, null] emission.
    map(([hovered, active]) => active || hovered), distinctUntilChanged(), share());
    _headerRowHoveredOrActiveDistinctReenterZone = this.headerRowHoveredOrActiveDistinct.pipe(this._enterZone(), share());
    // Optimization: Share row events observable with subsequent callers.
    // At startup, calls will be sequential by row (and typically there's only one).
    _lastSeenRow = null;
    _lastSeenRowHover = null;
    /**
     * Emits whether the specified row should show its overlay controls.
     * Emission occurs within the NgZone.
     */
    resizeOverlayVisibleForHeaderRow(row) {
        if (row !== this._lastSeenRow) {
            this._lastSeenRow = row;
            this._lastSeenRowHover = this._headerRowHoveredOrActiveDistinctReenterZone.pipe(map(hoveredRow => hoveredRow === row), distinctUntilChanged(), share());
        }
        return this._lastSeenRowHover;
    }
    _enterZone() {
        return (source) => new Observable(observer => source.subscribe({
            next: value => this._ngZone.run(() => observer.next(value)),
            error: err => observer.error(err),
            complete: () => observer.complete(),
        }));
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: HeaderRowEventDispatcher, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: HeaderRowEventDispatcher });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: HeaderRowEventDispatcher, decorators: [{
            type: Injectable
        }] });

/**
 * @docs-private
 */
class _Schedule {
    tasks = [];
    endTasks = [];
}
/** Injection token used to provide a coalesced style scheduler. */
const _COALESCED_STYLE_SCHEDULER = new InjectionToken('_COALESCED_STYLE_SCHEDULER');
/**
 * Allows grouping up CSSDom mutations after the current execution context.
 * This can significantly improve performance when separate consecutive functions are
 * reading from the CSSDom and then mutating it.
 *
 * @docs-private
 */
class _CoalescedStyleScheduler {
    _currentSchedule = null;
    _ngZone = inject(NgZone);
    constructor() { }
    /**
     * Schedules the specified task to run at the end of the current VM turn.
     */
    schedule(task) {
        this._createScheduleIfNeeded();
        this._currentSchedule.tasks.push(task);
    }
    /**
     * Schedules the specified task to run after other scheduled tasks at the end of the current
     * VM turn.
     */
    scheduleEnd(task) {
        this._createScheduleIfNeeded();
        this._currentSchedule.endTasks.push(task);
    }
    _createScheduleIfNeeded() {
        if (this._currentSchedule) {
            return;
        }
        this._currentSchedule = new _Schedule();
        this._ngZone.runOutsideAngular(() => 
        // TODO(mmalerba): Scheduling this using something that runs less frequently
        //  (e.g. requestAnimationFrame, setTimeout, etc.) causes noticeable jank with the column
        //  resizer. We should audit the usages of schedule / scheduleEnd in that component and see
        //  if we can refactor it so that we don't need to flush the tasks quite so frequently.
        queueMicrotask(() => {
            while (this._currentSchedule.tasks.length || this._currentSchedule.endTasks.length) {
                const schedule = this._currentSchedule;
                // Capture new tasks scheduled by the current set of tasks.
                this._currentSchedule = new _Schedule();
                for (const task of schedule.tasks) {
                    task();
                }
                for (const task of schedule.endTasks) {
                    task();
                }
            }
            this._currentSchedule = null;
        }));
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: _CoalescedStyleScheduler, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: _CoalescedStyleScheduler });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: _CoalescedStyleScheduler, decorators: [{
            type: Injectable
        }], ctorParameters: () => [] });

/**
 * Provides an implementation for resizing a column.
 * The details of how resizing works for tables for flex mat-tables are quite different.
 */
class ResizeStrategy {
    _tableObserved = false;
    _elemSizeCache = new WeakMap();
    _resizeObserver = globalThis?.ResizeObserver
        ? new globalThis.ResizeObserver(entries => this._updateCachedSizes(entries))
        : null;
    /** Adjusts the width of the table element by the specified delta. */
    updateTableWidthAndStickyColumns(delta) {
        this.columnResize._flushPending = true;
        this.styleScheduler.scheduleEnd(() => {
            if (!this.columnResize._flushPending) {
                return;
            }
            this.columnResize._flushPending = false;
            this.table.updateStickyColumnStyles();
        });
    }
    /** Gets the style.width pixels on the specified element if present, otherwise its offsetWidth. */
    getElementWidth(element) {
        // Optimization: Check style.width first as we probably set it already before reading
        // offsetWidth which triggers layout.
        return (coercePixelsFromCssValue(element.style.width) ||
            this._elemSizeCache.get(element)?.width ||
            element.offsetWidth);
    }
    /** Informs the ResizeStrategy instance of a column that may be resized in the future. */
    registerColumn(column) {
        if (!this._tableObserved) {
            this._tableObserved = true;
            this._resizeObserver?.observe(this.columnResize.elementRef.nativeElement, {
                box: 'border-box',
            });
        }
        this._resizeObserver?.observe(column, { box: 'border-box' });
    }
    ngOnDestroy() {
        this._resizeObserver?.disconnect();
    }
    _updateCachedSizes(entries) {
        for (const entry of entries) {
            const newEntry = entry.borderBoxSize?.length
                ? {
                    width: entry.borderBoxSize[0].inlineSize,
                    height: entry.borderBoxSize[0].blockSize,
                }
                : {
                    width: entry.contentRect.width,
                    height: entry.contentRect.height,
                };
            this._elemSizeCache.set(entry.target, newEntry);
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: ResizeStrategy, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: ResizeStrategy });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: ResizeStrategy, decorators: [{
            type: Injectable
        }] });
/**
 * The optimally performing resize strategy for &lt;table&gt; elements with table-layout: fixed.
 * Tested against and outperformed:
 *   CSS selector
 *   CSS selector w/ CSS variable
 *   Updating all cell nodes
 */
class TableLayoutFixedResizeStrategy extends ResizeStrategy {
    columnResize = inject(ColumnResize);
    styleScheduler = inject(_COALESCED_STYLE_SCHEDULER);
    table = inject(CdkTable);
    applyColumnSize(_, columnHeader, sizeInPx, previousSizeInPx) {
        const delta = sizeInPx - (previousSizeInPx ?? this.getElementWidth(columnHeader));
        if (delta === 0) {
            return;
        }
        this.styleScheduler.schedule(() => {
            columnHeader.style.width = coerceCssPixelValue(sizeInPx);
        });
        this.updateTableWidthAndStickyColumns(delta);
    }
    applyMinColumnSize(_, columnHeader, sizeInPx) {
        const currentWidth = this.getElementWidth(columnHeader);
        const newWidth = Math.max(currentWidth, sizeInPx);
        this.applyColumnSize(_, columnHeader, newWidth, currentWidth);
    }
    applyMaxColumnSize(_, columnHeader, sizeInPx) {
        const currentWidth = this.getElementWidth(columnHeader);
        const newWidth = Math.min(currentWidth, sizeInPx);
        this.applyColumnSize(_, columnHeader, newWidth, currentWidth);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: TableLayoutFixedResizeStrategy, deps: null, target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: TableLayoutFixedResizeStrategy });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: TableLayoutFixedResizeStrategy, decorators: [{
            type: Injectable
        }] });
/**
 * The optimally performing resize strategy for flex mat-tables.
 * Tested against and outperformed:
 *   CSS selector w/ CSS variable
 *   Updating all mat-cell nodes
 */
class CdkFlexTableResizeStrategy extends ResizeStrategy {
    columnResize = inject(ColumnResize);
    styleScheduler = inject(_COALESCED_STYLE_SCHEDULER);
    table = inject(CdkTable);
    _nonce = inject(CSP_NONCE, { optional: true });
    _document = inject(DOCUMENT);
    _columnIndexes = new Map();
    _columnProperties = new Map();
    _styleElement;
    _indexSequence = 0;
    defaultMinSize = 0;
    defaultMaxSize = Number.MAX_SAFE_INTEGER;
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
        super.ngOnDestroy();
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
                this._styleElement.setAttribute('nonce', this._nonce);
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
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: CdkFlexTableResizeStrategy, deps: null, target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: CdkFlexTableResizeStrategy });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: CdkFlexTableResizeStrategy, decorators: [{
            type: Injectable
        }] });
/** Converts CSS pixel values to numbers, eg "123px" to 123. Returns NaN for non pixel values. */
function coercePixelsFromCssValue(cssValue) {
    return Number(cssValue.match(/(\d+)px/)?.[1]);
}
/**
 * Converts CSS flex values as set in CdkFlexTableResizeStrategy to numbers,
 * eg "0 0.01 123px" to 123.
 */
function coercePixelsFromFlexValue(flexValue) {
    return Number(flexValue?.match(/0 0\.01 (\d+)px/)?.[1]);
}
const TABLE_LAYOUT_FIXED_RESIZE_STRATEGY_PROVIDER = {
    provide: ResizeStrategy,
    useClass: TableLayoutFixedResizeStrategy,
};
const FLEX_RESIZE_STRATEGY_PROVIDER = {
    provide: ResizeStrategy,
    useClass: CdkFlexTableResizeStrategy,
};

const PROVIDERS = [
    ColumnResizeNotifier,
    HeaderRowEventDispatcher,
    ColumnResizeNotifierSource,
    { provide: _COALESCED_STYLE_SCHEDULER, useClass: _CoalescedStyleScheduler },
];
const TABLE_PROVIDERS = [
    ...PROVIDERS,
    TABLE_LAYOUT_FIXED_RESIZE_STRATEGY_PROVIDER,
];
const FLEX_PROVIDERS = [...PROVIDERS, FLEX_RESIZE_STRATEGY_PROVIDER];

/**
 * Explicitly enables column resizing for a table-based cdk-table.
 * Individual columns must be annotated specifically.
 */
class CdkColumnResize extends ColumnResize {
    columnResizeNotifier = inject(ColumnResizeNotifier);
    elementRef = inject(ElementRef);
    eventDispatcher = inject(HeaderRowEventDispatcher);
    ngZone = inject(NgZone);
    notifier = inject(ColumnResizeNotifierSource);
    table = inject(CdkTable);
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: CdkColumnResize, deps: null, target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "20.0.0", type: CdkColumnResize, isStandalone: true, selector: "table[cdk-table][columnResize]", providers: [...TABLE_PROVIDERS, { provide: ColumnResize, useExisting: CdkColumnResize }], usesInheritance: true, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: CdkColumnResize, decorators: [{
            type: Directive,
            args: [{
                    selector: 'table[cdk-table][columnResize]',
                    providers: [...TABLE_PROVIDERS, { provide: ColumnResize, useExisting: CdkColumnResize }],
                }]
        }] });

/**
 * Explicitly enables column resizing for a flexbox-based cdk-table.
 * Individual columns must be annotated specifically.
 */
class CdkColumnResizeFlex extends ColumnResize {
    columnResizeNotifier = inject(ColumnResizeNotifier);
    elementRef = inject(ElementRef);
    eventDispatcher = inject(HeaderRowEventDispatcher);
    ngZone = inject(NgZone);
    notifier = inject(ColumnResizeNotifierSource);
    table = inject(CdkTable);
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: CdkColumnResizeFlex, deps: null, target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "20.0.0", type: CdkColumnResizeFlex, isStandalone: true, selector: "cdk-table[columnResize]", providers: [...FLEX_PROVIDERS, { provide: ColumnResize, useExisting: CdkColumnResizeFlex }], usesInheritance: true, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: CdkColumnResizeFlex, decorators: [{
            type: Directive,
            args: [{
                    selector: 'cdk-table[columnResize]',
                    providers: [...FLEX_PROVIDERS, { provide: ColumnResize, useExisting: CdkColumnResizeFlex }],
                }]
        }] });

/**
 * Implicitly enables column resizing for a table-based cdk-table.
 * Individual columns will be resizable unless opted out.
 */
class CdkDefaultEnabledColumnResize extends ColumnResize {
    columnResizeNotifier = inject(ColumnResizeNotifier);
    elementRef = inject(ElementRef);
    eventDispatcher = inject(HeaderRowEventDispatcher);
    ngZone = inject(NgZone);
    notifier = inject(ColumnResizeNotifierSource);
    table = inject(CdkTable);
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: CdkDefaultEnabledColumnResize, deps: null, target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "20.0.0", type: CdkDefaultEnabledColumnResize, isStandalone: true, selector: "table[cdk-table]", providers: [
            ...TABLE_PROVIDERS,
            { provide: ColumnResize, useExisting: CdkDefaultEnabledColumnResize },
        ], usesInheritance: true, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: CdkDefaultEnabledColumnResize, decorators: [{
            type: Directive,
            args: [{
                    selector: 'table[cdk-table]',
                    providers: [
                        ...TABLE_PROVIDERS,
                        { provide: ColumnResize, useExisting: CdkDefaultEnabledColumnResize },
                    ],
                }]
        }] });

/**
 * Implicitly enables column resizing for a flex cdk-table.
 * Individual columns will be resizable unless opted out.
 */
class CdkDefaultEnabledColumnResizeFlex extends ColumnResize {
    columnResizeNotifier = inject(ColumnResizeNotifier);
    elementRef = inject(ElementRef);
    eventDispatcher = inject(HeaderRowEventDispatcher);
    ngZone = inject(NgZone);
    notifier = inject(ColumnResizeNotifierSource);
    table = inject(CdkTable);
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: CdkDefaultEnabledColumnResizeFlex, deps: null, target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "20.0.0", type: CdkDefaultEnabledColumnResizeFlex, isStandalone: true, selector: "cdk-table", providers: [
            ...FLEX_PROVIDERS,
            { provide: ColumnResize, useExisting: CdkDefaultEnabledColumnResizeFlex },
        ], usesInheritance: true, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: CdkDefaultEnabledColumnResizeFlex, decorators: [{
            type: Directive,
            args: [{
                    selector: 'cdk-table',
                    providers: [
                        ...FLEX_PROVIDERS,
                        { provide: ColumnResize, useExisting: CdkDefaultEnabledColumnResizeFlex },
                    ],
                }]
        }] });

/**
 * One of two NgModules for use with CdkColumnResize.
 * When using this module, columns are resizable by default.
 */
class CdkColumnResizeDefaultEnabledModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: CdkColumnResizeDefaultEnabledModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "20.0.0", ngImport: i0, type: CdkColumnResizeDefaultEnabledModule, imports: [CdkDefaultEnabledColumnResize, CdkDefaultEnabledColumnResizeFlex], exports: [CdkDefaultEnabledColumnResize, CdkDefaultEnabledColumnResizeFlex] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: CdkColumnResizeDefaultEnabledModule });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: CdkColumnResizeDefaultEnabledModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [CdkDefaultEnabledColumnResize, CdkDefaultEnabledColumnResizeFlex],
                    exports: [CdkDefaultEnabledColumnResize, CdkDefaultEnabledColumnResizeFlex],
                }]
        }] });
/**
 * One of two NgModules for use with CdkColumnResize.
 * When using this module, columns are not resizable by default.
 */
class CdkColumnResizeModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: CdkColumnResizeModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "20.0.0", ngImport: i0, type: CdkColumnResizeModule, imports: [CdkColumnResize, CdkColumnResizeFlex], exports: [CdkColumnResize, CdkColumnResizeFlex] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: CdkColumnResizeModule });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: CdkColumnResizeModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [CdkColumnResize, CdkColumnResizeFlex],
                    exports: [CdkColumnResize, CdkColumnResizeFlex],
                }]
        }] });

/**
 * Can be provided by the host application to enable persistence of column resize state.
 */
class ColumnSizeStore {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: ColumnSizeStore, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: ColumnSizeStore });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: ColumnSizeStore, decorators: [{
            type: Injectable
        }] });

/** Tracks state of resize events in progress. */
class ResizeRef {
    origin;
    overlayRef;
    minWidthPx;
    maxWidthPx;
    liveUpdates;
    constructor(origin, overlayRef, minWidthPx, maxWidthPx, liveUpdates = true) {
        this.origin = origin;
        this.overlayRef = overlayRef;
        this.minWidthPx = minWidthPx;
        this.maxWidthPx = maxWidthPx;
        this.liveUpdates = liveUpdates;
    }
}

const OVERLAY_ACTIVE_CLASS = 'cdk-resizable-overlay-thumb-active';
const RESIZE_DISABLED_CLASS = 'cdk-resizable-resize-disabled';
/**
 * Base class for Resizable directives which are applied to column headers to make those columns
 * resizable.
 */
class Resizable {
    minWidthPxInternal = 0;
    maxWidthPxInternal = Number.MAX_SAFE_INTEGER;
    inlineHandle;
    overlayRef;
    destroyed = new Subject();
    columnSizeStore = inject(ColumnSizeStore, { optional: true });
    _injector = inject(Injector);
    _viewInitialized = false;
    _isDestroyed = false;
    /** The minimum width to allow the column to be sized to. */
    get minWidthPx() {
        return this.minWidthPxInternal;
    }
    set minWidthPx(value) {
        this.minWidthPxInternal = value;
        this.columnResize.setResized();
        if (this.elementRef.nativeElement && this._viewInitialized) {
            this._applyMinWidthPx();
        }
    }
    /** The maximum width to allow the column to be sized to. */
    get maxWidthPx() {
        return this.maxWidthPxInternal;
    }
    set maxWidthPx(value) {
        this.maxWidthPxInternal = value;
        this.columnResize.setResized();
        if (this.elementRef.nativeElement && this._viewInitialized) {
            this._applyMaxWidthPx();
        }
    }
    ngOnInit() {
        this.resizeStrategy.registerColumn(this.elementRef.nativeElement);
    }
    ngAfterViewInit() {
        this._listenForRowHoverEvents();
        this._listenForResizeEvents();
        this._appendInlineHandle();
        this.styleScheduler.scheduleEnd(() => {
            if (this._isDestroyed)
                return;
            this._viewInitialized = true;
            this._applyMinWidthPx();
            this._applyMaxWidthPx();
            this.columnSizeStore
                ?.getSize(this.columnResize.getTableId(), this.columnDef.name)
                ?.pipe(take(1), takeUntil(this.destroyed))
                .subscribe(size => {
                if (size == null) {
                    return;
                }
                this._applySize(size);
            });
        });
    }
    ngOnDestroy() {
        this._isDestroyed = true;
        this.destroyed.next();
        this.destroyed.complete();
        this.inlineHandle?.remove();
        this.overlayRef?.dispose();
    }
    _createOverlayForHandle() {
        // Use of overlays allows us to properly capture click events spanning parts
        // of two table cells and is also useful for displaying a resize thumb
        // over both cells and extending it down the table as needed.
        const isRtl = this.directionality.value === 'rtl';
        const positionStrategy = createFlexibleConnectedPositionStrategy(this._injector, this.elementRef.nativeElement)
            .withFlexibleDimensions(false)
            .withGrowAfterOpen(false)
            .withPush(false)
            .withDefaultOffsetX(isRtl ? 1 : 0)
            .withPositions([
            {
                originX: isRtl ? 'start' : 'end',
                originY: 'top',
                overlayX: 'center',
                overlayY: 'top',
            },
        ]);
        return createOverlayRef(this._injector, {
            // Always position the overlay based on left-indexed coordinates.
            direction: 'ltr',
            disposeOnNavigation: true,
            positionStrategy,
            scrollStrategy: createRepositionScrollStrategy(this._injector),
            width: '16px',
        });
    }
    _listenForRowHoverEvents() {
        const element = this.elementRef.nativeElement;
        const takeUntilDestroyed = takeUntil(this.destroyed);
        this.eventDispatcher
            .resizeOverlayVisibleForHeaderRow(closest(element, HEADER_ROW_SELECTOR))
            .pipe(takeUntilDestroyed)
            .subscribe(hoveringRow => {
            if (hoveringRow) {
                const tooBigToResize = this.maxWidthPxInternal < Number.MAX_SAFE_INTEGER &&
                    element.offsetWidth > this.maxWidthPxInternal;
                element.classList.toggle(RESIZE_DISABLED_CLASS, tooBigToResize);
                if (!tooBigToResize) {
                    if (!this.overlayRef) {
                        this.overlayRef = this._createOverlayForHandle();
                    }
                    this._showHandleOverlay();
                }
            }
            else if (this.overlayRef) {
                // todo - can't detach during an active resize - need to work that out
                this.overlayRef.detach();
            }
        });
    }
    _listenForResizeEvents() {
        const takeUntilDestroyed = takeUntil(this.destroyed);
        merge(this.resizeNotifier.resizeCanceled, this.resizeNotifier.triggerResize)
            .pipe(takeUntilDestroyed, filter(columnSize => columnSize.columnId === this.columnDef.name))
            .subscribe(({ size, previousSize, completeImmediately }) => {
            this.elementRef.nativeElement.classList.add(OVERLAY_ACTIVE_CLASS);
            this._applySize(size, previousSize);
            if (completeImmediately) {
                this._completeResizeOperation();
            }
        });
        merge(this.resizeNotifier.resizeCanceled, this.resizeNotifier.resizeCompleted)
            .pipe(takeUntilDestroyed)
            .subscribe(columnSize => {
            this._cleanUpAfterResize(columnSize);
        });
        this.resizeNotifier.resizeCompleted
            .pipe(filter(sizeUpdate => sizeUpdate.columnId === this.columnDef.name), distinctUntilChanged((a, b) => a.size === b.size), takeUntil(this.destroyed))
            .subscribe(sizeUpdate => {
            this.columnSizeStore?.setSize(this.columnResize.getTableId(), this.columnDef.name, sizeUpdate.size);
        });
    }
    _completeResizeOperation() {
        this.ngZone.run(() => {
            this.resizeNotifier.resizeCompleted.next({
                columnId: this.columnDef.name,
                size: this.elementRef.nativeElement.offsetWidth,
            });
        });
    }
    _cleanUpAfterResize(columnSize) {
        this.elementRef.nativeElement.classList.remove(OVERLAY_ACTIVE_CLASS);
        if (this.overlayRef && this.overlayRef.hasAttached()) {
            this._updateOverlayHandleHeight();
            this.overlayRef.updatePosition();
            if (columnSize.columnId === this.columnDef.name) {
                this.inlineHandle.focus();
            }
        }
    }
    _createHandlePortal() {
        const injector = Injector.create({
            parent: this.injector,
            providers: [
                {
                    provide: ResizeRef,
                    useValue: new ResizeRef(this.elementRef, this.overlayRef, this.minWidthPx, this.maxWidthPx, this.columnResize.liveResizeUpdates),
                },
            ],
        });
        return new ComponentPortal(this.getOverlayHandleComponentType(), this.viewContainerRef, injector);
    }
    _showHandleOverlay() {
        this._updateOverlayHandleHeight();
        this.overlayRef.attach(this._createHandlePortal());
        // Needed to ensure that all of the lifecycle hooks inside the overlay run immediately.
        this.changeDetectorRef.markForCheck();
    }
    _updateOverlayHandleHeight() {
        runInInjectionContext(this.injector, () => {
            afterNextRender({
                write: () => {
                    this.overlayRef.updateSize({ height: this.elementRef.nativeElement.offsetHeight });
                },
            });
        });
    }
    _applySize(sizeInPixels, previousSize) {
        const sizeToApply = Math.min(Math.max(sizeInPixels, this.minWidthPx, 0), this.maxWidthPx);
        this.resizeStrategy.applyColumnSize(this.columnDef.cssClassFriendlyName, this.elementRef.nativeElement, sizeToApply, previousSize);
    }
    _applyMinWidthPx() {
        this.resizeStrategy.applyMinColumnSize(this.columnDef.cssClassFriendlyName, this.elementRef.nativeElement, this.minWidthPx);
    }
    _applyMaxWidthPx() {
        this.resizeStrategy.applyMaxColumnSize(this.columnDef.cssClassFriendlyName, this.elementRef.nativeElement, this.maxWidthPx);
    }
    _appendInlineHandle() {
        this.inlineHandle = this.document.createElement('div');
        // TODO: re-apply tab index once this element has behavior.
        // this.inlineHandle.tabIndex = 0;
        this.inlineHandle.className = this.getInlineHandleCssClassName();
        // TODO: Apply correct aria role (probably slider) after a11y spec questions resolved.
        this.elementRef.nativeElement.appendChild(this.inlineHandle);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: Resizable, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "20.0.0", type: Resizable, isStandalone: true, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: Resizable, decorators: [{
            type: Directive
        }] });

// TODO: Take another look at using cdk drag drop. IIRC I ran into a couple
// good reasons for not using it but I don't remember what they were at this point.
/**
 * Base class for a component shown over the edge of a resizable column that is responsible
 * for handling column resize mouse events and displaying any visible UI on the column edge.
 */
class ResizeOverlayHandle {
    _renderer = inject(Renderer2);
    destroyed = new Subject();
    _cumulativeDeltaX = 0;
    ngAfterViewInit() {
        this._listenForMouseEvents();
    }
    ngOnDestroy() {
        this.destroyed.next();
        this.destroyed.complete();
    }
    _listenForMouseEvents() {
        this.ngZone.runOutsideAngular(() => {
            this._observableFromEvent(this.elementRef.nativeElement, 'mouseenter')
                .pipe(mapTo(this.resizeRef.origin.nativeElement), takeUntil(this.destroyed))
                .subscribe(cell => this.eventDispatcher.headerCellHovered.next(cell));
            this._observableFromEvent(this.elementRef.nativeElement, 'mouseleave')
                .pipe(map(event => event.relatedTarget && closest(event.relatedTarget, HEADER_CELL_SELECTOR)), takeUntil(this.destroyed))
                .subscribe(cell => this.eventDispatcher.headerCellHovered.next(cell));
            this._observableFromEvent(this.elementRef.nativeElement, 'mousedown')
                .pipe(takeUntil(this.destroyed))
                .subscribe(mousedownEvent => {
                this._dragStarted(mousedownEvent);
            });
        });
    }
    _dragStarted(mousedownEvent) {
        // Only allow dragging using the left mouse button.
        if (mousedownEvent.button !== 0) {
            return;
        }
        const mouseup = this._observableFromEvent(this.document, 'mouseup');
        const mousemove = this._observableFromEvent(this.document, 'mousemove');
        const escape = this._observableFromEvent(this.document, 'keyup').pipe(filter(event => event.keyCode === ESCAPE));
        const startX = mousedownEvent.screenX;
        const initialSize = this._getOriginWidth();
        let overlayOffset = 0;
        let originOffset = this._getOriginOffset();
        let size = initialSize;
        let overshot = 0;
        this._cumulativeDeltaX = 0;
        this.updateResizeActive(true);
        mouseup.pipe(takeUntil(merge(escape, this.destroyed))).subscribe(({ screenX }) => {
            this.styleScheduler.scheduleEnd(() => {
                this._notifyResizeEnded(size, screenX !== startX);
            });
        });
        escape.pipe(takeUntil(merge(mouseup, this.destroyed))).subscribe(() => {
            this._notifyResizeEnded(initialSize);
        });
        mousemove
            .pipe(map(({ screenX }) => screenX), startWith(startX), distinctUntilChanged(), pairwise(), takeUntil(merge(mouseup, escape, this.destroyed)))
            .subscribe(([prevX, currX]) => {
            let deltaX = currX - prevX;
            if (!this.resizeRef.liveUpdates) {
                this._cumulativeDeltaX += deltaX;
                const sizeDelta = this._computeNewSize(size, this._cumulativeDeltaX) - size;
                this._updateOverlayOffset(sizeDelta);
                return;
            }
            // If the mouse moved further than the resize was able to match, limit the
            // movement of the overlay to match the actual size and position of the origin.
            if (overshot !== 0) {
                if ((overshot < 0 && deltaX < 0) || (overshot > 0 && deltaX > 0)) {
                    overshot += deltaX;
                    return;
                }
                else {
                    const remainingOvershot = overshot + deltaX;
                    overshot =
                        overshot > 0 ? Math.max(remainingOvershot, 0) : Math.min(remainingOvershot, 0);
                    deltaX = remainingOvershot - overshot;
                    if (deltaX === 0) {
                        return;
                    }
                }
            }
            this._triggerResize(size, deltaX);
            this.styleScheduler.scheduleEnd(() => {
                const originNewSize = this._getOriginWidth();
                const originNewOffset = this._getOriginOffset();
                const originOffsetDeltaX = originNewOffset - originOffset;
                const originSizeDeltaX = originNewSize - size;
                size = originNewSize;
                originOffset = originNewOffset;
                overshot += deltaX + (this._isLtr() ? -originSizeDeltaX : originSizeDeltaX);
                overlayOffset += originOffsetDeltaX + (this._isLtr() ? originSizeDeltaX : 0);
                this._updateOverlayOffset(overlayOffset);
            });
        });
    }
    updateResizeActive(active) {
        this.eventDispatcher.overlayHandleActiveForCell.next(active ? this.resizeRef.origin.nativeElement : null);
    }
    _triggerResize(startSize, deltaX) {
        this.resizeNotifier.triggerResize.next({
            columnId: this.columnDef.name,
            size: this._computeNewSize(startSize, deltaX),
            previousSize: startSize,
            isStickyColumn: this.columnDef.sticky || this.columnDef.stickyEnd,
        });
    }
    _computeNewSize(startSize, deltaX) {
        let computedNewSize = startSize + (this._isLtr() ? deltaX : -deltaX);
        computedNewSize = Math.min(Math.max(computedNewSize, this.resizeRef.minWidthPx, 0), this.resizeRef.maxWidthPx);
        return computedNewSize;
    }
    _getOriginWidth() {
        return this.resizeRef.origin.nativeElement.offsetWidth;
    }
    _getOriginOffset() {
        return this.resizeRef.origin.nativeElement.offsetLeft;
    }
    _updateOverlayOffset(offset) {
        this.resizeRef.overlayRef.overlayElement.style.transform = `translateX(${coerceCssPixelValue(offset)})`;
    }
    _isLtr() {
        return this.directionality.value === 'ltr';
    }
    _notifyResizeEnded(size, completedSuccessfully = false) {
        this.updateResizeActive(false);
        this.ngZone.run(() => {
            const sizeMessage = {
                columnId: this.columnDef.name,
                size: this._computeNewSize(size, this._cumulativeDeltaX),
            };
            if (completedSuccessfully) {
                if (!this.resizeRef.liveUpdates) {
                    this._triggerResize(size, this._cumulativeDeltaX);
                }
                this.resizeNotifier.resizeCompleted.next(sizeMessage);
            }
            else {
                this.resizeNotifier.resizeCanceled.next(sizeMessage);
            }
        });
    }
    _observableFromEvent(element, name) {
        return new Observable(subscriber => {
            const handler = (event) => subscriber.next(event);
            const cleanup = this._renderer.listen(element, name, handler);
            return () => {
                cleanup();
                subscriber.complete();
            };
        });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: ResizeOverlayHandle, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "20.0.0", type: ResizeOverlayHandle, isStandalone: true, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: ResizeOverlayHandle, decorators: [{
            type: Directive
        }] });

export { COLUMN_RESIZE_OPTIONS, CdkColumnResize, CdkColumnResizeDefaultEnabledModule, CdkColumnResizeFlex, CdkColumnResizeModule, CdkDefaultEnabledColumnResize, CdkDefaultEnabledColumnResizeFlex, CdkFlexTableResizeStrategy, ColumnResize, ColumnResizeNotifier, ColumnResizeNotifierSource, ColumnSizeStore, FLEX_RESIZE_STRATEGY_PROVIDER, HeaderRowEventDispatcher, Resizable, ResizeOverlayHandle, ResizeRef, ResizeStrategy, TABLE_LAYOUT_FIXED_RESIZE_STRATEGY_PROVIDER, TableLayoutFixedResizeStrategy, _COALESCED_STYLE_SCHEDULER, _CoalescedStyleScheduler, _Schedule };
//# sourceMappingURL=column-resize.mjs.map
