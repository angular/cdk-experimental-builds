import { __read, __extends, __spread } from 'tslib';
import { Directive, Injectable, NgZone, Inject, ElementRef, NgModule } from '@angular/core';
import { ReplaySubject, fromEvent, merge, Subject, combineLatest, Observable } from 'rxjs';
import { map, takeUntil, filter, mapTo, take, startWith, pairwise, distinctUntilChanged, share, skip } from 'rxjs/operators';
import { _closest, _matches } from '@angular/cdk-experimental/popover-edit';
import { Directionality } from '@angular/cdk/bidi';
import { DOCUMENT } from '@angular/common';
import { coerceCssPixelValue } from '@angular/cdk/coercion';
import { PortalInjector, ComponentPortal } from '@angular/cdk/portal';
import { ESCAPE } from '@angular/cdk/keycodes';

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
// TODO: Figure out how to remove `mat-` classes from the CDK part of the
// column resize implementation.
var HEADER_CELL_SELECTOR = '.cdk-header-cell, .mat-header-cell';
var HEADER_ROW_SELECTOR = '.cdk-header-row, .mat-header-row';
var RESIZE_OVERLAY_SELECTOR = '.mat-column-resize-overlay-thumb';

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var HOVER_OR_ACTIVE_CLASS = 'cdk-column-resize-hover-or-active';
var WITH_RESIZED_COLUMN_CLASS = 'cdk-column-resize-with-resized-column';
var nextId = 0;
/**
 * Base class for ColumnResize directives which attach to mat-table elements to
 * provide common events and services for column resizing.
 */
var ColumnResize = /** @class */ (function () {
    function ColumnResize() {
        this.destroyed = new ReplaySubject();
        /** Unique ID for this table instance. */
        this.selectorId = "" + ++nextId;
    }
    ColumnResize.prototype.ngAfterViewInit = function () {
        this.elementRef.nativeElement.classList.add(this.getUniqueCssClass());
        this._listenForRowHoverEvents();
        this._listenForResizeActivity();
        this._listenForHoverActivity();
    };
    ColumnResize.prototype.ngOnDestroy = function () {
        this.destroyed.next();
        this.destroyed.complete();
    };
    /** Gets the unique CSS class name for this table instance. */
    ColumnResize.prototype.getUniqueCssClass = function () {
        return "cdk-column-resize-" + this.selectorId;
    };
    ColumnResize.prototype._listenForRowHoverEvents = function () {
        var _this = this;
        this.ngZone.runOutsideAngular(function () {
            var element = _this.elementRef.nativeElement;
            fromEvent(element, 'mouseover').pipe(map(function (event) { return _closest(event.target, HEADER_CELL_SELECTOR); }), takeUntil(_this.destroyed)).subscribe(_this.eventDispatcher.headerCellHovered);
            fromEvent(element, 'mouseleave').pipe(filter(function (event) { return !!event.relatedTarget &&
                !_matches(event.relatedTarget, RESIZE_OVERLAY_SELECTOR); }), mapTo(null), takeUntil(_this.destroyed)).subscribe(_this.eventDispatcher.headerCellHovered);
        });
    };
    ColumnResize.prototype._listenForResizeActivity = function () {
        var _this = this;
        merge(this.eventDispatcher.overlayHandleActiveForCell.pipe(mapTo(undefined)), this.notifier.triggerResize.pipe(mapTo(undefined)), this.notifier.resizeCompleted.pipe(mapTo(undefined))).pipe(takeUntil(this.destroyed), take(1)).subscribe(function () {
            _this.elementRef.nativeElement.classList.add(WITH_RESIZED_COLUMN_CLASS);
        });
    };
    ColumnResize.prototype._listenForHoverActivity = function () {
        this.eventDispatcher.headerRowHoveredOrActiveDistinct.pipe(startWith(null), pairwise(), takeUntil(this.destroyed)).subscribe(function (_a) {
            var _b = __read(_a, 2), previousRow = _b[0], hoveredRow = _b[1];
            if (hoveredRow) {
                hoveredRow.classList.add(HOVER_OR_ACTIVE_CLASS);
            }
            if (previousRow) {
                previousRow.classList.remove(HOVER_OR_ACTIVE_CLASS);
            }
        });
    };
    ColumnResize.decorators = [
        { type: Directive }
    ];
    return ColumnResize;
}());

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** Originating source of column resize events within a table. */
var ColumnResizeNotifierSource = /** @class */ (function () {
    function ColumnResizeNotifierSource() {
        /** Emits when an in-progress resize is canceled. */
        this.resizeCanceled = new Subject();
        /** Emits when a resize is applied. */
        this.resizeCompleted = new Subject();
        /** Triggers a resize action. */
        this.triggerResize = new Subject();
    }
    ColumnResizeNotifierSource.decorators = [
        { type: Injectable }
    ];
    return ColumnResizeNotifierSource;
}());
/** Service for triggering column resizes imperatively or being notified of them. */
var ColumnResizeNotifier = /** @class */ (function () {
    function ColumnResizeNotifier(_source) {
        this._source = _source;
        /** Emits whenever a column is resized. */
        this.resizeCompleted = this._source.resizeCompleted.asObservable();
    }
    /** Instantly resizes the specified column. */
    ColumnResizeNotifier.prototype.resize = function (columnId, size) {
        this._source.triggerResize.next({ columnId: columnId, size: size, completeImmediately: true });
    };
    ColumnResizeNotifier.decorators = [
        { type: Injectable }
    ];
    /** @nocollapse */
    ColumnResizeNotifier.ctorParameters = function () { return [
        { type: ColumnResizeNotifierSource }
    ]; };
    return ColumnResizeNotifier;
}());

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** Coordinates events between the column resize directives. */
var HeaderRowEventDispatcher = /** @class */ (function () {
    function HeaderRowEventDispatcher(_ngZone) {
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
        /** Distinct and shared version of headerCellHovered. */
        this.headerCellHoveredDistinct = this.headerCellHovered.pipe(distinctUntilChanged(), share());
        /**
         * Emits the header that is currently hovered or hosting an active resize event (with active
         * taking precedence).
         */
        this.headerRowHoveredOrActiveDistinct = combineLatest(this.headerCellHoveredDistinct.pipe(map(function (cell) { return _closest(cell, HEADER_ROW_SELECTOR); }), startWith(null), distinctUntilChanged()), this.overlayHandleActiveForCell.pipe(map(function (cell) { return _closest(cell, HEADER_ROW_SELECTOR); }), startWith(null), distinctUntilChanged())).pipe(skip(1), // Ignore initial [null, null] emission.
        map(function (_a) {
            var _b = __read(_a, 2), hovered = _b[0], active = _b[1];
            return active || hovered;
        }), distinctUntilChanged(), share());
        this._headerRowHoveredOrActiveDistinctReenterZone = this.headerRowHoveredOrActiveDistinct.pipe(this._enterZone(), share());
        // Optimization: Share row events observable with subsequent callers.
        // At startup, calls will be sequential by row (and typically there's only one).
        this._lastSeenRow = null;
        this._lastSeenRowHover = null;
    }
    /**
     * Emits whether the specified row should show its overlay controls.
     * Emission occurs within the NgZone.
     */
    HeaderRowEventDispatcher.prototype.resizeOverlayVisibleForHeaderRow = function (row) {
        if (row !== this._lastSeenRow) {
            this._lastSeenRow = row;
            this._lastSeenRowHover = this._headerRowHoveredOrActiveDistinctReenterZone.pipe(map(function (hoveredRow) { return hoveredRow === row; }), distinctUntilChanged(), share());
        }
        return this._lastSeenRowHover;
    };
    HeaderRowEventDispatcher.prototype._enterZone = function () {
        var _this = this;
        return function (source) {
            return new Observable(function (observer) { return source.subscribe({
                next: function (value) { return _this._ngZone.run(function () { return observer.next(value); }); },
                error: function (err) { return observer.error(err); },
                complete: function () { return observer.complete(); }
            }); });
        };
    };
    HeaderRowEventDispatcher.decorators = [
        { type: Injectable }
    ];
    /** @nocollapse */
    HeaderRowEventDispatcher.ctorParameters = function () { return [
        { type: NgZone }
    ]; };
    return HeaderRowEventDispatcher;
}());

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
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
var TABLE_LAYOUT_FIXED_RESIZE_STRATEGY_PROVIDER = {
    provide: ResizeStrategy,
    useClass: TableLayoutFixedResizeStrategy,
};
var FLEX_RESIZE_STRATEGY_PROVIDER = {
    provide: ResizeStrategy,
    useClass: CdkFlexTableResizeStrategy,
};

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var PROVIDERS = [
    ColumnResizeNotifier,
    HeaderRowEventDispatcher,
    ColumnResizeNotifierSource,
];
var TABLE_PROVIDERS = __spread(PROVIDERS, [
    TABLE_LAYOUT_FIXED_RESIZE_STRATEGY_PROVIDER,
]);
var FLEX_PROVIDERS = __spread(PROVIDERS, [FLEX_RESIZE_STRATEGY_PROVIDER]);
var HOST_BINDINGS = {
    '[class.cdk-column-resize-rtl]': 'directionality.value === "rtl"',
};

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Explicitly enables column resizing for a table-based cdk-table.
 * Individual columns must be annotated specifically.
 */
var CdkColumnResize = /** @class */ (function (_super) {
    __extends(CdkColumnResize, _super);
    function CdkColumnResize(columnResizeNotifier, directionality, elementRef, eventDispatcher, ngZone, notifier) {
        var _this = _super.call(this) || this;
        _this.columnResizeNotifier = columnResizeNotifier;
        _this.directionality = directionality;
        _this.elementRef = elementRef;
        _this.eventDispatcher = eventDispatcher;
        _this.ngZone = ngZone;
        _this.notifier = notifier;
        return _this;
    }
    CdkColumnResize.decorators = [
        { type: Directive, args: [{
                    selector: 'table[cdk-table][columnResize]',
                    host: HOST_BINDINGS,
                    providers: __spread(TABLE_PROVIDERS, [
                        { provide: ColumnResize, useExisting: CdkColumnResize },
                    ]),
                },] }
    ];
    /** @nocollapse */
    CdkColumnResize.ctorParameters = function () { return [
        { type: ColumnResizeNotifier },
        { type: Directionality },
        { type: ElementRef },
        { type: HeaderRowEventDispatcher },
        { type: NgZone },
        { type: ColumnResizeNotifierSource }
    ]; };
    return CdkColumnResize;
}(ColumnResize));

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Explicitly enables column resizing for a flexbox-based cdk-table.
 * Individual columns must be annotated specifically.
 */
var CdkColumnResizeFlex = /** @class */ (function (_super) {
    __extends(CdkColumnResizeFlex, _super);
    function CdkColumnResizeFlex(columnResizeNotifier, directionality, elementRef, eventDispatcher, ngZone, notifier) {
        var _this = _super.call(this) || this;
        _this.columnResizeNotifier = columnResizeNotifier;
        _this.directionality = directionality;
        _this.elementRef = elementRef;
        _this.eventDispatcher = eventDispatcher;
        _this.ngZone = ngZone;
        _this.notifier = notifier;
        return _this;
    }
    CdkColumnResizeFlex.decorators = [
        { type: Directive, args: [{
                    selector: 'cdk-table[columnResize]',
                    host: HOST_BINDINGS,
                    providers: __spread(FLEX_PROVIDERS, [
                        { provide: ColumnResize, useExisting: CdkColumnResizeFlex },
                    ]),
                },] }
    ];
    /** @nocollapse */
    CdkColumnResizeFlex.ctorParameters = function () { return [
        { type: ColumnResizeNotifier },
        { type: Directionality },
        { type: ElementRef },
        { type: HeaderRowEventDispatcher },
        { type: NgZone },
        { type: ColumnResizeNotifierSource }
    ]; };
    return CdkColumnResizeFlex;
}(ColumnResize));

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Implicitly enables column resizing for a table-based cdk-table.
 * Individual columns will be resizable unless opted out.
 */
var CdkDefaultEnabledColumnResize = /** @class */ (function (_super) {
    __extends(CdkDefaultEnabledColumnResize, _super);
    function CdkDefaultEnabledColumnResize(columnResizeNotifier, directionality, elementRef, eventDispatcher, ngZone, notifier) {
        var _this = _super.call(this) || this;
        _this.columnResizeNotifier = columnResizeNotifier;
        _this.directionality = directionality;
        _this.elementRef = elementRef;
        _this.eventDispatcher = eventDispatcher;
        _this.ngZone = ngZone;
        _this.notifier = notifier;
        return _this;
    }
    CdkDefaultEnabledColumnResize.decorators = [
        { type: Directive, args: [{
                    selector: 'table[cdk-table]',
                    host: HOST_BINDINGS,
                    providers: __spread(TABLE_PROVIDERS, [
                        { provide: ColumnResize, useExisting: CdkDefaultEnabledColumnResize },
                    ]),
                },] }
    ];
    /** @nocollapse */
    CdkDefaultEnabledColumnResize.ctorParameters = function () { return [
        { type: ColumnResizeNotifier },
        { type: Directionality },
        { type: ElementRef },
        { type: HeaderRowEventDispatcher },
        { type: NgZone },
        { type: ColumnResizeNotifierSource }
    ]; };
    return CdkDefaultEnabledColumnResize;
}(ColumnResize));

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Implicitly enables column resizing for a flex cdk-table.
 * Individual columns will be resizable unless opted out.
 */
var CdkDefaultEnabledColumnResizeFlex = /** @class */ (function (_super) {
    __extends(CdkDefaultEnabledColumnResizeFlex, _super);
    function CdkDefaultEnabledColumnResizeFlex(columnResizeNotifier, directionality, elementRef, eventDispatcher, ngZone, notifier) {
        var _this = _super.call(this) || this;
        _this.columnResizeNotifier = columnResizeNotifier;
        _this.directionality = directionality;
        _this.elementRef = elementRef;
        _this.eventDispatcher = eventDispatcher;
        _this.ngZone = ngZone;
        _this.notifier = notifier;
        return _this;
    }
    CdkDefaultEnabledColumnResizeFlex.decorators = [
        { type: Directive, args: [{
                    selector: 'cdk-table',
                    host: HOST_BINDINGS,
                    providers: __spread(FLEX_PROVIDERS, [
                        { provide: ColumnResize, useExisting: CdkDefaultEnabledColumnResizeFlex },
                    ]),
                },] }
    ];
    /** @nocollapse */
    CdkDefaultEnabledColumnResizeFlex.ctorParameters = function () { return [
        { type: ColumnResizeNotifier },
        { type: Directionality },
        { type: ElementRef },
        { type: HeaderRowEventDispatcher },
        { type: NgZone },
        { type: ColumnResizeNotifierSource }
    ]; };
    return CdkDefaultEnabledColumnResizeFlex;
}(ColumnResize));

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * One of two NgModules for use with CdkColumnResize.
 * When using this module, columns are resizable by default.
 */
var CdkColumnResizeDefaultEnabledModule = /** @class */ (function () {
    function CdkColumnResizeDefaultEnabledModule() {
    }
    CdkColumnResizeDefaultEnabledModule.decorators = [
        { type: NgModule, args: [{
                    declarations: [CdkDefaultEnabledColumnResize, CdkDefaultEnabledColumnResizeFlex],
                    exports: [CdkDefaultEnabledColumnResize, CdkDefaultEnabledColumnResizeFlex],
                },] }
    ];
    return CdkColumnResizeDefaultEnabledModule;
}());
/**
 * One of two NgModules for use with CdkColumnResize.
 * When using this module, columns are not resizable by default.
 */
var CdkColumnResizeModule = /** @class */ (function () {
    function CdkColumnResizeModule() {
    }
    CdkColumnResizeModule.decorators = [
        { type: NgModule, args: [{
                    declarations: [CdkColumnResize, CdkColumnResizeFlex],
                    exports: [CdkColumnResize, CdkColumnResizeFlex],
                },] }
    ];
    return CdkColumnResizeModule;
}());

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Can be provided by the host application to enable persistence of column resize state.
 */
var ColumnSizeStore = /** @class */ (function () {
    function ColumnSizeStore() {
    }
    ColumnSizeStore.decorators = [
        { type: Injectable }
    ];
    return ColumnSizeStore;
}());

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** Tracks state of resize events in progress. */
var ResizeRef = /** @class */ (function () {
    function ResizeRef(origin, overlayRef, minWidthPx, maxWidthPx) {
        this.origin = origin;
        this.overlayRef = overlayRef;
        this.minWidthPx = minWidthPx;
        this.maxWidthPx = maxWidthPx;
    }
    return ResizeRef;
}());

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var OVERLAY_ACTIVE_CLASS = 'cdk-resizable-overlay-thumb-active';
/**
 * Base class for Resizable directives which are applied to column headers to make those columns
 * resizable.
 */
var Resizable = /** @class */ (function () {
    function Resizable() {
        this.minWidthPxInternal = 0;
        this.maxWidthPxInternal = Number.MAX_SAFE_INTEGER;
        this.destroyed = new ReplaySubject();
    }
    Object.defineProperty(Resizable.prototype, "minWidthPx", {
        /** The minimum width to allow the column to be sized to. */
        get: function () {
            return this.minWidthPxInternal;
        },
        set: function (value) {
            this.minWidthPxInternal = value;
            if (this.elementRef.nativeElement) {
                this._applyMinWidthPx();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Resizable.prototype, "maxWidthPx", {
        /** The maximum width to allow the column to be sized to. */
        get: function () {
            return this.maxWidthPxInternal;
        },
        set: function (value) {
            this.maxWidthPxInternal = value;
            if (this.elementRef.nativeElement) {
                this._applyMaxWidthPx();
            }
        },
        enumerable: true,
        configurable: true
    });
    Resizable.prototype.ngAfterViewInit = function () {
        this._listenForRowHoverEvents();
        this._listenForResizeEvents();
        this._appendInlineHandle();
        this._applyMinWidthPx();
        this._applyMaxWidthPx();
    };
    Resizable.prototype.ngOnDestroy = function () {
        this.destroyed.next();
        this.destroyed.complete();
        if (this.inlineHandle) {
            this.elementRef.nativeElement.removeChild(this.inlineHandle);
        }
        if (this.overlayRef) {
            this.overlayRef.dispose();
        }
    };
    Resizable.prototype._createOverlayForHandle = function () {
        // Use of overlays allows us to properly capture click events spanning parts
        // of two table cells and is also useful for displaying a resize thumb
        // over both cells and extending it down the table as needed.
        var positionStrategy = this.overlay.position()
            .flexibleConnectedTo(this.elementRef.nativeElement)
            .withFlexibleDimensions(false)
            .withGrowAfterOpen(false)
            .withPush(false)
            .withPositions([{
                originX: 'end',
                originY: 'top',
                overlayX: 'center',
                overlayY: 'top',
            }]);
        return this.overlay.create({
            direction: this.directionality,
            disposeOnNavigation: true,
            positionStrategy: positionStrategy,
            scrollStrategy: this.overlay.scrollStrategies.reposition(),
            width: '16px',
        });
    };
    Resizable.prototype._listenForRowHoverEvents = function () {
        var _this = this;
        var element = this.elementRef.nativeElement;
        var takeUntilDestroyed = takeUntil(this.destroyed);
        this.eventDispatcher.resizeOverlayVisibleForHeaderRow(_closest(element, HEADER_ROW_SELECTOR))
            .pipe(takeUntilDestroyed).subscribe(function (hoveringRow) {
            if (hoveringRow) {
                if (!_this.overlayRef) {
                    _this.overlayRef = _this._createOverlayForHandle();
                }
                _this._showHandleOverlay();
            }
            else if (_this.overlayRef) {
                // todo - can't detach during an active resize - need to work that out
                _this.overlayRef.detach();
            }
        });
    };
    Resizable.prototype._listenForResizeEvents = function () {
        var _this = this;
        var takeUntilDestroyed = takeUntil(this.destroyed);
        merge(this.resizeNotifier.resizeCanceled, this.resizeNotifier.triggerResize).pipe(takeUntilDestroyed, filter(function (columnSize) { return columnSize.columnId === _this.columnDef.name; })).subscribe(function (_a) {
            var size = _a.size, completeImmediately = _a.completeImmediately;
            _this.elementRef.nativeElement.classList.add(OVERLAY_ACTIVE_CLASS);
            _this._applySize(size);
            if (completeImmediately) {
                _this._completeResizeOperation();
            }
        });
        merge(this.resizeNotifier.resizeCanceled, this.resizeNotifier.resizeCompleted).pipe(takeUntilDestroyed).subscribe(function (columnSize) {
            _this._cleanUpAfterResize(columnSize);
        });
    };
    Resizable.prototype._completeResizeOperation = function () {
        var _this = this;
        this.ngZone.run(function () {
            _this.resizeNotifier.resizeCompleted.next({
                columnId: _this.columnDef.name,
                size: _this.elementRef.nativeElement.offsetWidth,
            });
        });
    };
    Resizable.prototype._cleanUpAfterResize = function (columnSize) {
        this.elementRef.nativeElement.classList.remove(OVERLAY_ACTIVE_CLASS);
        if (this.overlayRef && this.overlayRef.hasAttached()) {
            this._updateOverlayHandleHeight();
            this.overlayRef.updatePosition();
            if (columnSize.columnId === this.columnDef.name) {
                this.inlineHandle.focus();
            }
        }
    };
    Resizable.prototype._createHandlePortal = function () {
        var injector = new PortalInjector(this.injector, new WeakMap([[
                ResizeRef,
                new ResizeRef(this.elementRef, this.overlayRef, this.minWidthPx, this.maxWidthPx),
            ]]));
        return new ComponentPortal(this.getOverlayHandleComponentType(), this.viewContainerRef, injector);
    };
    Resizable.prototype._showHandleOverlay = function () {
        this._updateOverlayHandleHeight();
        this.overlayRef.attach(this._createHandlePortal());
    };
    Resizable.prototype._updateOverlayHandleHeight = function () {
        this.overlayRef.updateSize({ height: this.elementRef.nativeElement.offsetHeight });
    };
    Resizable.prototype._applySize = function (sizeInPixels) {
        var sizeToApply = Math.min(Math.max(sizeInPixels, this.minWidthPx, 0), this.maxWidthPx);
        this.resizeStrategy.applyColumnSize(this.columnDef.cssClassFriendlyName, this.elementRef.nativeElement, sizeToApply);
    };
    Resizable.prototype._applyMinWidthPx = function () {
        this.resizeStrategy.applyMinColumnSize(this.columnDef.cssClassFriendlyName, this.elementRef.nativeElement, this.minWidthPx);
    };
    Resizable.prototype._applyMaxWidthPx = function () {
        this.resizeStrategy.applyMaxColumnSize(this.columnDef.cssClassFriendlyName, this.elementRef.nativeElement, this.maxWidthPx);
    };
    Resizable.prototype._appendInlineHandle = function () {
        this.inlineHandle = this.document.createElement('div');
        this.inlineHandle.tabIndex = 0;
        this.inlineHandle.className = this.getInlineHandleCssClassName();
        // TODO: Apply correct aria role (probably slider) after a11y spec questions resolved.
        this.elementRef.nativeElement.appendChild(this.inlineHandle);
    };
    return Resizable;
}());

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
// TODO: Take another look at using cdk drag drop. IIRC I ran into a couple
// good reasons for not using it but I don't remember what they were at this point.
/**
 * Base class for a component shown over the edge of a resizable column that is responsible
 * for handling column resize mouse events and displaying any visible UI on the column edge.
 */
var ResizeOverlayHandle = /** @class */ (function () {
    function ResizeOverlayHandle() {
        this.destroyed = new ReplaySubject();
    }
    ResizeOverlayHandle.prototype.ngAfterViewInit = function () {
        this._listenForMouseEvents();
    };
    ResizeOverlayHandle.prototype.ngOnDestroy = function () {
        this.destroyed.next();
        this.destroyed.complete();
    };
    ResizeOverlayHandle.prototype._listenForMouseEvents = function () {
        var _this = this;
        this.ngZone.runOutsideAngular(function () {
            var takeUntilDestroyed = takeUntil(_this.destroyed);
            fromEvent(_this.elementRef.nativeElement, 'mouseenter').pipe(takeUntilDestroyed, mapTo(_this.resizeRef.origin.nativeElement)).subscribe(function (cell) { return _this.eventDispatcher.headerCellHovered.next(cell); });
            fromEvent(_this.elementRef.nativeElement, 'mouseleave').pipe(takeUntilDestroyed, map(function (event) { return event.relatedTarget &&
                _closest(event.relatedTarget, HEADER_CELL_SELECTOR); })).subscribe(function (cell) { return _this.eventDispatcher.headerCellHovered.next(cell); });
            fromEvent(_this.elementRef.nativeElement, 'mousedown')
                .pipe(takeUntilDestroyed).subscribe(function (mousedownEvent) {
                _this._dragStarted(mousedownEvent);
            });
        });
    };
    ResizeOverlayHandle.prototype._dragStarted = function (mousedownEvent) {
        var _this = this;
        // Only allow dragging using the left mouse button.
        if (mousedownEvent.button !== 0) {
            return;
        }
        var mouseup = fromEvent(this.document, 'mouseup');
        var mousemove = fromEvent(this.document, 'mousemove');
        var escape = fromEvent(this.document, 'keyup')
            .pipe(filter(function (event) { return event.keyCode === ESCAPE; }));
        var startX = mousedownEvent.screenX;
        var initialOverlayOffset = this._getOverlayOffset();
        var initialSize = this._getOriginWidth();
        var overlayOffset = initialOverlayOffset;
        var originOffset = this._getOriginOffset();
        var size = initialSize;
        var overshot = 0;
        this.updateResizeActive(true);
        mouseup.pipe(takeUntil(escape), takeUntil(this.destroyed)).subscribe(function (_a) {
            var screenX = _a.screenX;
            _this._notifyResizeEnded(size, screenX !== startX);
        });
        escape.pipe(takeUntil(mouseup), takeUntil(this.destroyed)).subscribe(function () {
            _this._notifyResizeEnded(initialSize);
        });
        mousemove.pipe(map(function (_a) {
            var screenX = _a.screenX;
            return screenX;
        }), startWith(startX), distinctUntilChanged(), pairwise(), takeUntil(mouseup), takeUntil(escape), takeUntil(this.destroyed)).subscribe(function (_a) {
            var _b = __read(_a, 2), prevX = _b[0], currX = _b[1];
            var deltaX = currX - prevX;
            // If the mouse moved further than the resize was able to match, limit the
            // movement of the overlay to match the actual size and position of the origin.
            if (overshot !== 0) {
                if (overshot < 0 && deltaX < 0 || overshot > 0 && deltaX > 0) {
                    overshot += deltaX;
                    return;
                }
                else {
                    var remainingOvershot = overshot + deltaX;
                    overshot = overshot > 0 ?
                        Math.max(remainingOvershot, 0) : Math.min(remainingOvershot, 0);
                    deltaX = remainingOvershot - overshot;
                    if (deltaX === 0) {
                        return;
                    }
                }
            }
            var computedNewSize = size + (_this._isLtr() ? deltaX : -deltaX);
            computedNewSize = Math.min(Math.max(computedNewSize, _this.resizeRef.minWidthPx, 0), _this.resizeRef.maxWidthPx);
            _this.resizeNotifier.triggerResize.next({ columnId: _this.columnDef.name, size: computedNewSize });
            var originNewSize = _this._getOriginWidth();
            var originNewOffset = _this._getOriginOffset();
            var originOffsetDeltaX = originNewOffset - originOffset;
            var originSizeDeltaX = originNewSize - size;
            size = originNewSize;
            originOffset = originNewOffset;
            overshot += deltaX + (_this._isLtr() ? -originSizeDeltaX : originSizeDeltaX);
            overlayOffset += originSizeDeltaX + originOffsetDeltaX;
            _this._updateOverlayOffset(overlayOffset);
        });
    };
    ResizeOverlayHandle.prototype.updateResizeActive = function (active) {
        this.eventDispatcher.overlayHandleActiveForCell.next(active ? this.resizeRef.origin.nativeElement : null);
    };
    ResizeOverlayHandle.prototype._getOriginWidth = function () {
        return this.resizeRef.origin.nativeElement.offsetWidth;
    };
    ResizeOverlayHandle.prototype._getOriginOffset = function () {
        var originElement = this.resizeRef.origin.nativeElement;
        var offsetLeft = originElement.offsetLeft;
        return this._isLtr() ?
            offsetLeft :
            originElement.offsetParent.offsetWidth - (offsetLeft + this._getOriginWidth());
    };
    ResizeOverlayHandle.prototype._getOverlayOffset = function () {
        var overlayElement = this.resizeRef.overlayRef.overlayElement;
        return this._isLtr() ?
            parseInt(overlayElement.style.left, 10) : parseInt(overlayElement.style.right, 10);
    };
    ResizeOverlayHandle.prototype._updateOverlayOffset = function (offset) {
        var overlayElement = this.resizeRef.overlayRef.overlayElement;
        var overlayOffsetCssValue = coerceCssPixelValue(offset);
        if (this._isLtr()) {
            overlayElement.style.left = overlayOffsetCssValue;
        }
        else {
            overlayElement.style.right = overlayOffsetCssValue;
        }
    };
    ResizeOverlayHandle.prototype._isLtr = function () {
        return this.directionality.value === 'ltr';
    };
    ResizeOverlayHandle.prototype._notifyResizeEnded = function (size, completedSuccessfully) {
        var _this = this;
        if (completedSuccessfully === void 0) { completedSuccessfully = false; }
        this.updateResizeActive(false);
        this.ngZone.run(function () {
            var sizeMessage = { columnId: _this.columnDef.name, size: size };
            if (completedSuccessfully) {
                _this.resizeNotifier.resizeCompleted.next(sizeMessage);
            }
            else {
                _this.resizeNotifier.resizeCanceled.next(sizeMessage);
            }
        });
    };
    ResizeOverlayHandle.decorators = [
        { type: Directive }
    ];
    return ResizeOverlayHandle;
}());

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Generated bundle index. Do not edit.
 */

export { CdkColumnResize, CdkColumnResizeDefaultEnabledModule, CdkColumnResizeFlex, CdkColumnResizeModule, CdkDefaultEnabledColumnResize, CdkDefaultEnabledColumnResizeFlex, CdkFlexTableResizeStrategy, ColumnResize, ColumnResizeNotifier, ColumnResizeNotifierSource, ColumnSizeStore, FLEX_RESIZE_STRATEGY_PROVIDER, HeaderRowEventDispatcher, Resizable, ResizeOverlayHandle, ResizeRef, ResizeStrategy, TABLE_LAYOUT_FIXED_RESIZE_STRATEGY_PROVIDER, TableLayoutFixedResizeStrategy, TABLE_PROVIDERS as ɵangular_material_src_cdk_experimental_column_resize_column_resize_a, FLEX_PROVIDERS as ɵangular_material_src_cdk_experimental_column_resize_column_resize_b, HOST_BINDINGS as ɵangular_material_src_cdk_experimental_column_resize_column_resize_c };
//# sourceMappingURL=column-resize.js.map
