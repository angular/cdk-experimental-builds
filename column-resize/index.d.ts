import * as _angular_core from '@angular/core';
import { InjectionToken, AfterViewInit, OnDestroy, ElementRef, NgZone, Provider, OnInit, Injector, ViewContainerRef, ChangeDetectorRef, Type } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { CdkTable, CdkColumnDef } from '@angular/cdk/table';
import { Directionality } from '@angular/cdk/bidi';
import { OverlayRef } from '@angular/cdk/overlay';

/** Indicates the width of a column. */
interface ColumnSize {
    /** The ID/name of the column, as defined in CdkColumnDef. */
    readonly columnId: string;
    /** The width in pixels of the column. */
    readonly size: number;
    /** The width in pixels of the column prior to this update, if known. */
    readonly previousSize?: number;
}
/** Interface describing column size changes. */
interface ColumnSizeAction extends ColumnSize {
    /**
     * Whether the resize action should be applied instantaneously. False for events triggered during
     * a UI-triggered resize (such as with the mouse) until the mouse button is released. True
     * for all programmatically triggered resizes.
     */
    readonly completeImmediately?: boolean;
    /**
     * Whether the resize action is being applied to a sticky/stickyEnd column.
     */
    readonly isStickyColumn?: boolean;
}
/**
 * Originating source of column resize events within a table.
 * @docs-private
 */
declare class ColumnResizeNotifierSource {
    /** Emits when an in-progress resize is canceled. */
    readonly resizeCanceled: Subject<ColumnSizeAction>;
    /** Emits when a resize is applied. */
    readonly resizeCompleted: Subject<ColumnSize>;
    /** Triggers a resize action. */
    readonly triggerResize: Subject<ColumnSizeAction>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<ColumnResizeNotifierSource, never>;
    static ɵprov: _angular_core.ɵɵInjectableDeclaration<ColumnResizeNotifierSource>;
}
/** Service for triggering column resizes imperatively or being notified of them. */
declare class ColumnResizeNotifier {
    private readonly _source;
    /** Emits whenever a column is resized. */
    readonly resizeCompleted: Observable<ColumnSize>;
    /** Instantly resizes the specified column. */
    resize(columnId: string, size: number): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<ColumnResizeNotifier, never>;
    static ɵprov: _angular_core.ɵɵInjectableDeclaration<ColumnResizeNotifier>;
}

/** Coordinates events between the column resize directives. */
declare class HeaderRowEventDispatcher {
    private readonly _ngZone;
    /**
     * Emits the currently hovered header cell or null when no header cells are hovered.
     * Exposed publicly for events to feed in, but subscribers should use headerCellHoveredDistinct,
     * defined below.
     */
    readonly headerCellHovered: Subject<Element | null>;
    /**
     * Emits the header cell for which a user-triggered resize is active or null
     * when no resize is in progress.
     */
    readonly overlayHandleActiveForCell: Subject<Element | null>;
    /** Distinct and shared version of headerCellHovered. */
    readonly headerCellHoveredDistinct: Observable<Element | null>;
    /**
     * Emits the header that is currently hovered or hosting an active resize event (with active
     * taking precedence).
     */
    readonly headerRowHoveredOrActiveDistinct: Observable<Element | null>;
    private readonly _headerRowHoveredOrActiveDistinctReenterZone;
    private _lastSeenRow;
    private _lastSeenRowHover;
    /**
     * Emits whether the specified row should show its overlay controls.
     * Emission occurs within the NgZone.
     */
    resizeOverlayVisibleForHeaderRow(row: Element): Observable<boolean>;
    private _enterZone;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<HeaderRowEventDispatcher, never>;
    static ɵprov: _angular_core.ɵɵInjectableDeclaration<HeaderRowEventDispatcher>;
}

/** Configurable options for column resize. */
interface ColumnResizeOptions {
    liveResizeUpdates?: boolean;
}
declare const COLUMN_RESIZE_OPTIONS: InjectionToken<ColumnResizeOptions>;
/**
 * Base class for ColumnResize directives which attach to mat-table elements to
 * provide common events and services for column resizing.
 */
declare abstract class ColumnResize implements AfterViewInit, OnDestroy {
    private _renderer;
    private _eventCleanups;
    protected readonly destroyed: Subject<void>;
    abstract readonly columnResizeNotifier: ColumnResizeNotifier;
    abstract readonly elementRef: ElementRef<HTMLElement>;
    protected abstract readonly eventDispatcher: HeaderRowEventDispatcher;
    protected abstract readonly ngZone: NgZone;
    protected abstract readonly notifier: ColumnResizeNotifierSource;
    /** Unique ID for this table instance. */
    protected readonly selectorId: string;
    /** The id attribute of the table, if specified. */
    id?: string;
    /** @docs-private Whether a call to updateStickyColumnStyles is pending after a resize. */
    _flushPending: boolean;
    /**
     * Whether to update the column's width continuously as the mouse position
     * changes, or to wait until mouseup to apply the new size.
     */
    liveResizeUpdates: boolean;
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    /** Gets the unique CSS class name for this table instance. */
    getUniqueCssClass(): string;
    /** Gets the ID for this table used for column size persistance. */
    getTableId(): string;
    /** Called when a column in the table is resized. Applies a css class to the table element. */
    setResized(): void;
    private _listenForRowHoverEvents;
    private _listenForResizeActivity;
    private _listenForHoverActivity;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<ColumnResize, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<ColumnResize, never, never, { "liveResizeUpdates": { "alias": "liveResizeUpdates"; "required": false; }; }, {}, never, never, true, never>;
}

/**
 * Explicitly enables column resizing for a table-based cdk-table.
 * Individual columns must be annotated specifically.
 */
declare class CdkColumnResize extends ColumnResize {
    readonly columnResizeNotifier: ColumnResizeNotifier;
    readonly elementRef: ElementRef<HTMLElement>;
    protected readonly eventDispatcher: HeaderRowEventDispatcher;
    protected readonly ngZone: NgZone;
    protected readonly notifier: ColumnResizeNotifierSource;
    protected readonly table: CdkTable<unknown>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CdkColumnResize, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<CdkColumnResize, "table[cdk-table][columnResize]", never, {}, {}, never, never, true, never>;
}

/**
 * Explicitly enables column resizing for a flexbox-based cdk-table.
 * Individual columns must be annotated specifically.
 */
declare class CdkColumnResizeFlex extends ColumnResize {
    readonly columnResizeNotifier: ColumnResizeNotifier;
    readonly elementRef: ElementRef<HTMLElement>;
    protected readonly eventDispatcher: HeaderRowEventDispatcher;
    protected readonly ngZone: NgZone;
    protected readonly notifier: ColumnResizeNotifierSource;
    protected readonly table: CdkTable<unknown>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CdkColumnResizeFlex, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<CdkColumnResizeFlex, "cdk-table[columnResize]", never, {}, {}, never, never, true, never>;
}

/**
 * Implicitly enables column resizing for a table-based cdk-table.
 * Individual columns will be resizable unless opted out.
 */
declare class CdkDefaultEnabledColumnResize extends ColumnResize {
    readonly columnResizeNotifier: ColumnResizeNotifier;
    readonly elementRef: ElementRef<HTMLElement>;
    protected readonly eventDispatcher: HeaderRowEventDispatcher;
    protected readonly ngZone: NgZone;
    protected readonly notifier: ColumnResizeNotifierSource;
    protected readonly table: CdkTable<unknown>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CdkDefaultEnabledColumnResize, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<CdkDefaultEnabledColumnResize, "table[cdk-table]", never, {}, {}, never, never, true, never>;
}

/**
 * Implicitly enables column resizing for a flex cdk-table.
 * Individual columns will be resizable unless opted out.
 */
declare class CdkDefaultEnabledColumnResizeFlex extends ColumnResize {
    readonly columnResizeNotifier: ColumnResizeNotifier;
    readonly elementRef: ElementRef<HTMLElement>;
    protected readonly eventDispatcher: HeaderRowEventDispatcher;
    protected readonly ngZone: NgZone;
    protected readonly notifier: ColumnResizeNotifierSource;
    protected readonly table: CdkTable<unknown>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CdkDefaultEnabledColumnResizeFlex, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<CdkDefaultEnabledColumnResizeFlex, "cdk-table", never, {}, {}, never, never, true, never>;
}

/**
 * One of two NgModules for use with CdkColumnResize.
 * When using this module, columns are resizable by default.
 */
declare class CdkColumnResizeDefaultEnabledModule {
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CdkColumnResizeDefaultEnabledModule, never>;
    static ɵmod: _angular_core.ɵɵNgModuleDeclaration<CdkColumnResizeDefaultEnabledModule, never, [typeof CdkDefaultEnabledColumnResize, typeof CdkDefaultEnabledColumnResizeFlex], [typeof CdkDefaultEnabledColumnResize, typeof CdkDefaultEnabledColumnResizeFlex]>;
    static ɵinj: _angular_core.ɵɵInjectorDeclaration<CdkColumnResizeDefaultEnabledModule>;
}
/**
 * One of two NgModules for use with CdkColumnResize.
 * When using this module, columns are not resizable by default.
 */
declare class CdkColumnResizeModule {
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CdkColumnResizeModule, never>;
    static ɵmod: _angular_core.ɵɵNgModuleDeclaration<CdkColumnResizeModule, never, [typeof CdkColumnResize, typeof CdkColumnResizeFlex], [typeof CdkColumnResize, typeof CdkColumnResizeFlex]>;
    static ɵinj: _angular_core.ɵɵInjectorDeclaration<CdkColumnResizeModule>;
}

/**
 * Can be provided by the host application to enable persistence of column resize state.
 */
declare abstract class ColumnSizeStore {
    /** Returns the persisted size of the specified column in the specified table. */
    abstract getSize(tableId: string, columnId: string): Observable<number | null> | null;
    /** Persists the size of the specified column in the specified table. */
    abstract setSize(tableId: string, columnId: string, sizePx: number): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<ColumnSizeStore, never>;
    static ɵprov: _angular_core.ɵɵInjectableDeclaration<ColumnSizeStore>;
}

/** Tracks state of resize events in progress. */
declare class ResizeRef {
    readonly origin: ElementRef;
    readonly overlayRef: OverlayRef;
    readonly minWidthPx: number;
    readonly maxWidthPx: number;
    readonly liveUpdates: boolean;
    constructor(origin: ElementRef, overlayRef: OverlayRef, minWidthPx: number, maxWidthPx: number, liveUpdates?: boolean);
}

/**
 * @docs-private
 */
declare class _Schedule {
    tasks: (() => unknown)[];
    endTasks: (() => unknown)[];
}
/** Injection token used to provide a coalesced style scheduler. */
declare const _COALESCED_STYLE_SCHEDULER: InjectionToken<_CoalescedStyleScheduler>;
/**
 * Allows grouping up CSSDom mutations after the current execution context.
 * This can significantly improve performance when separate consecutive functions are
 * reading from the CSSDom and then mutating it.
 *
 * @docs-private
 */
declare class _CoalescedStyleScheduler {
    private _currentSchedule;
    private _ngZone;
    constructor(...args: unknown[]);
    /**
     * Schedules the specified task to run at the end of the current VM turn.
     */
    schedule(task: () => unknown): void;
    /**
     * Schedules the specified task to run after other scheduled tasks at the end of the current
     * VM turn.
     */
    scheduleEnd(task: () => unknown): void;
    private _createScheduleIfNeeded;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<_CoalescedStyleScheduler, never>;
    static ɵprov: _angular_core.ɵɵInjectableDeclaration<_CoalescedStyleScheduler>;
}

/**
 * Base class for a component shown over the edge of a resizable column that is responsible
 * for handling column resize mouse events and displaying any visible UI on the column edge.
 */
declare abstract class ResizeOverlayHandle implements AfterViewInit, OnDestroy {
    private _renderer;
    protected readonly destroyed: Subject<void>;
    protected abstract readonly columnDef: CdkColumnDef;
    protected abstract readonly document: Document;
    protected abstract readonly directionality: Directionality;
    protected abstract readonly elementRef: ElementRef;
    protected abstract readonly eventDispatcher: HeaderRowEventDispatcher;
    protected abstract readonly ngZone: NgZone;
    protected abstract readonly resizeNotifier: ColumnResizeNotifierSource;
    protected abstract readonly resizeRef: ResizeRef;
    protected abstract readonly styleScheduler: _CoalescedStyleScheduler;
    private _cumulativeDeltaX;
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    private _listenForMouseEvents;
    private _dragStarted;
    protected updateResizeActive(active: boolean): void;
    private _triggerResize;
    private _computeNewSize;
    private _getOriginWidth;
    private _getOriginOffset;
    private _updateOverlayOffset;
    private _isLtr;
    private _notifyResizeEnded;
    private _observableFromEvent;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<ResizeOverlayHandle, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<ResizeOverlayHandle, never, never, {}, {}, never, never, true, never>;
}

/**
 * Provides an implementation for resizing a column.
 * The details of how resizing works for tables for flex mat-tables are quite different.
 */
declare abstract class ResizeStrategy implements OnDestroy {
    protected abstract readonly columnResize: ColumnResize;
    protected abstract readonly styleScheduler: _CoalescedStyleScheduler;
    protected abstract readonly table: CdkTable<unknown>;
    private _tableObserved;
    private _elemSizeCache;
    private _resizeObserver;
    /** Updates the width of the specified column. */
    abstract applyColumnSize(cssFriendlyColumnName: string, columnHeader: HTMLElement, sizeInPx: number, previousSizeInPx?: number): void;
    /** Applies a minimum width to the specified column, updating its current width as needed. */
    abstract applyMinColumnSize(cssFriendlyColumnName: string, columnHeader: HTMLElement, minSizeInPx: number): void;
    /** Applies a maximum width to the specified column, updating its current width as needed. */
    abstract applyMaxColumnSize(cssFriendlyColumnName: string, columnHeader: HTMLElement, minSizeInPx: number): void;
    /** Adjusts the width of the table element by the specified delta. */
    protected updateTableWidthAndStickyColumns(delta: number): void;
    /** Gets the style.width pixels on the specified element if present, otherwise its offsetWidth. */
    protected getElementWidth(element: HTMLElement): number;
    /** Informs the ResizeStrategy instance of a column that may be resized in the future. */
    registerColumn(column: HTMLElement): void;
    ngOnDestroy(): void;
    private _updateCachedSizes;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<ResizeStrategy, never>;
    static ɵprov: _angular_core.ɵɵInjectableDeclaration<ResizeStrategy>;
}
/**
 * The optimally performing resize strategy for &lt;table&gt; elements with table-layout: fixed.
 * Tested against and outperformed:
 *   CSS selector
 *   CSS selector w/ CSS variable
 *   Updating all cell nodes
 */
declare class TableLayoutFixedResizeStrategy extends ResizeStrategy {
    protected readonly columnResize: ColumnResize;
    protected readonly styleScheduler: _CoalescedStyleScheduler;
    protected readonly table: CdkTable<unknown>;
    applyColumnSize(_: string, columnHeader: HTMLElement, sizeInPx: number, previousSizeInPx?: number): void;
    applyMinColumnSize(_: string, columnHeader: HTMLElement, sizeInPx: number): void;
    applyMaxColumnSize(_: string, columnHeader: HTMLElement, sizeInPx: number): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<TableLayoutFixedResizeStrategy, never>;
    static ɵprov: _angular_core.ɵɵInjectableDeclaration<TableLayoutFixedResizeStrategy>;
}
/**
 * The optimally performing resize strategy for flex mat-tables.
 * Tested against and outperformed:
 *   CSS selector w/ CSS variable
 *   Updating all mat-cell nodes
 */
declare class CdkFlexTableResizeStrategy extends ResizeStrategy implements OnDestroy {
    protected readonly columnResize: ColumnResize;
    protected readonly styleScheduler: _CoalescedStyleScheduler;
    protected readonly table: CdkTable<unknown>;
    private readonly _nonce;
    private readonly _document;
    private readonly _columnIndexes;
    private readonly _columnProperties;
    private _styleElement?;
    private _indexSequence;
    protected readonly defaultMinSize = 0;
    protected readonly defaultMaxSize: number;
    applyColumnSize(cssFriendlyColumnName: string, columnHeader: HTMLElement, sizeInPx: number, previousSizeInPx?: number): void;
    applyMinColumnSize(cssFriendlyColumnName: string, _: HTMLElement, sizeInPx: number): void;
    applyMaxColumnSize(cssFriendlyColumnName: string, _: HTMLElement, sizeInPx: number): void;
    protected getColumnCssClass(cssFriendlyColumnName: string): string;
    ngOnDestroy(): void;
    private _getPropertyValue;
    private _getAppliedWidth;
    private _applyProperty;
    private _getStyleSheet;
    private _getColumnPropertiesMap;
    private _applySizeCss;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CdkFlexTableResizeStrategy, never>;
    static ɵprov: _angular_core.ɵɵInjectableDeclaration<CdkFlexTableResizeStrategy>;
}
declare const TABLE_LAYOUT_FIXED_RESIZE_STRATEGY_PROVIDER: Provider;
declare const FLEX_RESIZE_STRATEGY_PROVIDER: Provider;

/**
 * Base class for Resizable directives which are applied to column headers to make those columns
 * resizable.
 */
declare abstract class Resizable<HandleComponent extends ResizeOverlayHandle> implements AfterViewInit, OnDestroy, OnInit {
    protected minWidthPxInternal: number;
    protected maxWidthPxInternal: number;
    protected inlineHandle?: HTMLElement;
    protected overlayRef?: OverlayRef;
    protected readonly destroyed: Subject<void>;
    protected abstract readonly columnDef: CdkColumnDef;
    protected abstract readonly columnResize: ColumnResize;
    protected abstract readonly directionality: Directionality;
    protected abstract readonly document: Document;
    protected abstract readonly elementRef: ElementRef;
    protected abstract readonly eventDispatcher: HeaderRowEventDispatcher;
    protected abstract readonly injector: Injector;
    protected abstract readonly ngZone: NgZone;
    protected abstract readonly resizeNotifier: ColumnResizeNotifierSource;
    protected abstract readonly resizeStrategy: ResizeStrategy;
    protected abstract readonly styleScheduler: _CoalescedStyleScheduler;
    protected abstract readonly viewContainerRef: ViewContainerRef;
    protected abstract readonly changeDetectorRef: ChangeDetectorRef;
    protected readonly columnSizeStore: ColumnSizeStore | null;
    private _injector;
    private _viewInitialized;
    private _isDestroyed;
    /** The minimum width to allow the column to be sized to. */
    get minWidthPx(): number;
    set minWidthPx(value: number);
    /** The maximum width to allow the column to be sized to. */
    get maxWidthPx(): number;
    set maxWidthPx(value: number);
    ngOnInit(): void;
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    protected abstract getInlineHandleCssClassName(): string;
    protected abstract getOverlayHandleComponentType(): Type<HandleComponent>;
    private _createOverlayForHandle;
    private _listenForRowHoverEvents;
    private _listenForResizeEvents;
    private _completeResizeOperation;
    private _cleanUpAfterResize;
    private _createHandlePortal;
    private _showHandleOverlay;
    private _updateOverlayHandleHeight;
    private _applySize;
    private _applyMinWidthPx;
    private _applyMaxWidthPx;
    private _appendInlineHandle;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<Resizable<any>, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<Resizable<any>, never, never, {}, {}, never, never, true, never>;
}

export { COLUMN_RESIZE_OPTIONS, CdkColumnResize, CdkColumnResizeDefaultEnabledModule, CdkColumnResizeFlex, CdkColumnResizeModule, CdkDefaultEnabledColumnResize, CdkDefaultEnabledColumnResizeFlex, CdkFlexTableResizeStrategy, ColumnResize, ColumnResizeNotifier, ColumnResizeNotifierSource, ColumnSizeStore, FLEX_RESIZE_STRATEGY_PROVIDER, HeaderRowEventDispatcher, Resizable, ResizeOverlayHandle, ResizeRef, ResizeStrategy, TABLE_LAYOUT_FIXED_RESIZE_STRATEGY_PROVIDER, TableLayoutFixedResizeStrategy, _COALESCED_STYLE_SCHEDULER, _CoalescedStyleScheduler, _Schedule };
export type { ColumnResizeOptions, ColumnSize, ColumnSizeAction };
