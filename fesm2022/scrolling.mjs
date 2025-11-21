import { coerceNumberProperty } from '@angular/cdk/coercion';
import { VIRTUAL_SCROLL_STRATEGY } from '@angular/cdk/scrolling';
import * as i0 from '@angular/core';
import { forwardRef, Directive, Input, NgModule } from '@angular/core';
import { Observable } from 'rxjs';

class ItemSizeAverager {
  _totalWeight = 0;
  _averageItemSize;
  _defaultItemSize;
  constructor(defaultItemSize = 50) {
    this._defaultItemSize = defaultItemSize;
    this._averageItemSize = defaultItemSize;
  }
  getAverageItemSize() {
    return this._averageItemSize;
  }
  addSample(range, size) {
    const newTotalWeight = this._totalWeight + range.end - range.start;
    if (newTotalWeight) {
      const newAverageItemSize = (size + this._averageItemSize * this._totalWeight) / newTotalWeight;
      if (newAverageItemSize) {
        this._averageItemSize = newAverageItemSize;
        this._totalWeight = newTotalWeight;
      }
    }
  }
  reset() {
    this._averageItemSize = this._defaultItemSize;
    this._totalWeight = 0;
  }
}
class AutoSizeVirtualScrollStrategy {
  scrolledIndexChange = new Observable(() => {
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      throw Error('cdk-virtual-scroll: scrolledIndexChange is currently not supported for the' + ' autosize scroll strategy');
    }
  });
  _viewport = null;
  _minBufferPx;
  _maxBufferPx;
  _averager;
  _lastScrollOffset;
  _lastRenderedContentSize;
  _lastRenderedContentOffset;
  _removalFailures = 0;
  constructor(minBufferPx, maxBufferPx, averager = new ItemSizeAverager()) {
    this._minBufferPx = minBufferPx;
    this._maxBufferPx = maxBufferPx;
    this._averager = averager;
  }
  attach(viewport) {
    this._averager.reset();
    this._viewport = viewport;
    this._renderContentForCurrentOffset();
  }
  detach() {
    this._viewport = null;
  }
  onContentScrolled() {
    if (this._viewport) {
      this._updateRenderedContentAfterScroll();
    }
  }
  onDataLengthChanged() {
    if (this._viewport) {
      this._renderContentForCurrentOffset();
      this._checkRenderedContentSize();
    }
  }
  onContentRendered() {
    if (this._viewport) {
      this._checkRenderedContentSize();
    }
  }
  onRenderedOffsetChanged() {
    if (this._viewport) {
      this._checkRenderedContentOffset();
    }
  }
  scrollToIndex() {
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      throw Error('cdk-virtual-scroll: scrollToIndex is currently not supported for the autosize' + ' scroll strategy');
    }
  }
  updateBufferSize(minBufferPx, maxBufferPx) {
    if (maxBufferPx < minBufferPx) {
      throw Error('CDK virtual scroll: maxBufferPx must be greater than or equal to minBufferPx');
    }
    this._minBufferPx = minBufferPx;
    this._maxBufferPx = maxBufferPx;
  }
  _updateRenderedContentAfterScroll() {
    const viewport = this._viewport;
    const scrollOffset = viewport.measureScrollOffset();
    let scrollDelta = scrollOffset - this._lastScrollOffset;
    let scrollMagnitude = Math.abs(scrollDelta);
    const renderedRange = viewport.getRenderedRange();
    let offsetCorrection = 0;
    if (scrollDelta < 0) {
      const predictedOffset = renderedRange.start * this._averager.getAverageItemSize();
      const offsetDifference = predictedOffset - this._lastRenderedContentOffset;
      offsetCorrection = Math.round(offsetDifference * Math.max(0, Math.min(1, scrollMagnitude / (scrollOffset + scrollMagnitude))));
      scrollDelta = scrollDelta - offsetCorrection;
      scrollMagnitude = Math.abs(scrollDelta);
    }
    const startBuffer = this._lastScrollOffset - this._lastRenderedContentOffset;
    const endBuffer = this._lastRenderedContentOffset + this._lastRenderedContentSize - (this._lastScrollOffset + viewport.getViewportSize());
    const underscan = scrollMagnitude + this._minBufferPx - (scrollDelta < 0 ? startBuffer : endBuffer);
    if (underscan > 0) {
      if (scrollMagnitude >= viewport.getViewportSize()) {
        this._renderContentForCurrentOffset();
      } else {
        const addItems = Math.max(0, Math.ceil((underscan - this._minBufferPx + this._maxBufferPx) / this._averager.getAverageItemSize()));
        const overscan = (scrollDelta < 0 ? endBuffer : startBuffer) - this._minBufferPx + scrollMagnitude;
        const unboundedRemoveItems = Math.floor(overscan / this._averager.getAverageItemSize() / (this._removalFailures + 1));
        const removeItems = Math.min(renderedRange.end - renderedRange.start, Math.max(0, unboundedRemoveItems));
        const range = this._expandRange(renderedRange, scrollDelta < 0 ? addItems : 0, scrollDelta > 0 ? addItems : 0);
        if (scrollDelta < 0) {
          range.end = Math.max(range.start + 1, range.end - removeItems);
        } else {
          range.start = Math.min(range.end - 1, range.start + removeItems);
        }
        let contentOffset;
        let contentOffsetTo;
        if (scrollDelta < 0) {
          let removedSize = viewport.measureRangeSize({
            start: range.end,
            end: renderedRange.end
          });
          if (removedSize <= overscan) {
            contentOffset = this._lastRenderedContentOffset + this._lastRenderedContentSize - removedSize;
            this._removalFailures = 0;
          } else {
            range.end = renderedRange.end;
            contentOffset = this._lastRenderedContentOffset + this._lastRenderedContentSize;
            this._removalFailures++;
          }
          contentOffsetTo = 'to-end';
        } else {
          const removedSize = viewport.measureRangeSize({
            start: renderedRange.start,
            end: range.start
          });
          if (removedSize <= overscan) {
            contentOffset = this._lastRenderedContentOffset + removedSize;
            this._removalFailures = 0;
          } else {
            range.start = renderedRange.start;
            contentOffset = this._lastRenderedContentOffset;
            this._removalFailures++;
          }
          contentOffsetTo = 'to-start';
        }
        viewport.setRenderedRange(range);
        viewport.setRenderedContentOffset(contentOffset + offsetCorrection, contentOffsetTo);
      }
    } else if (offsetCorrection) {
      viewport.setRenderedContentOffset(this._lastRenderedContentOffset + offsetCorrection);
    }
    this._lastScrollOffset = scrollOffset;
  }
  _checkRenderedContentSize() {
    const viewport = this._viewport;
    this._lastRenderedContentSize = viewport.measureRenderedContentSize();
    this._averager.addSample(viewport.getRenderedRange(), this._lastRenderedContentSize);
    this._updateTotalContentSize(this._lastRenderedContentSize);
  }
  _checkRenderedContentOffset() {
    const viewport = this._viewport;
    this._lastRenderedContentOffset = viewport.getOffsetToRenderedContentStart();
  }
  _renderContentForCurrentOffset() {
    const viewport = this._viewport;
    const scrollOffset = viewport.measureScrollOffset();
    this._lastScrollOffset = scrollOffset;
    this._removalFailures = 0;
    const itemSize = this._averager.getAverageItemSize();
    const firstVisibleIndex = Math.min(viewport.getDataLength() - 1, Math.floor(scrollOffset / itemSize));
    const bufferSize = Math.ceil(this._maxBufferPx / itemSize);
    const range = this._expandRange(this._getVisibleRangeForIndex(firstVisibleIndex), bufferSize, bufferSize);
    viewport.setRenderedRange(range);
    viewport.setRenderedContentOffset(itemSize * range.start);
  }
  _getVisibleRangeForIndex(startIndex) {
    const viewport = this._viewport;
    const range = {
      start: startIndex,
      end: startIndex + Math.ceil(viewport.getViewportSize() / this._averager.getAverageItemSize())
    };
    const extra = range.end - viewport.getDataLength();
    if (extra > 0) {
      range.start = Math.max(0, range.start - extra);
    }
    return range;
  }
  _expandRange(range, expandStart, expandEnd) {
    const viewport = this._viewport;
    const start = Math.max(0, range.start - expandStart);
    const end = Math.min(viewport.getDataLength(), range.end + expandEnd);
    return {
      start,
      end
    };
  }
  _updateTotalContentSize(renderedContentSize) {
    const viewport = this._viewport;
    const renderedRange = viewport.getRenderedRange();
    const totalSize = renderedContentSize + (viewport.getDataLength() - (renderedRange.end - renderedRange.start)) * this._averager.getAverageItemSize();
    viewport.setTotalContentSize(totalSize);
  }
}
function _autoSizeVirtualScrollStrategyFactory(autoSizeDir) {
  return autoSizeDir._scrollStrategy;
}
class CdkAutoSizeVirtualScroll {
  get minBufferPx() {
    return this._minBufferPx;
  }
  set minBufferPx(value) {
    this._minBufferPx = coerceNumberProperty(value);
  }
  _minBufferPx = 100;
  get maxBufferPx() {
    return this._maxBufferPx;
  }
  set maxBufferPx(value) {
    this._maxBufferPx = coerceNumberProperty(value);
  }
  _maxBufferPx = 200;
  _scrollStrategy = new AutoSizeVirtualScrollStrategy(this.minBufferPx, this.maxBufferPx);
  ngOnChanges() {
    this._scrollStrategy.updateBufferSize(this.minBufferPx, this.maxBufferPx);
  }
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: "12.0.0",
    version: "21.0.0",
    ngImport: i0,
    type: CdkAutoSizeVirtualScroll,
    deps: [],
    target: i0.ɵɵFactoryTarget.Directive
  });
  static ɵdir = i0.ɵɵngDeclareDirective({
    minVersion: "14.0.0",
    version: "21.0.0",
    type: CdkAutoSizeVirtualScroll,
    isStandalone: true,
    selector: "cdk-virtual-scroll-viewport[autosize]",
    inputs: {
      minBufferPx: "minBufferPx",
      maxBufferPx: "maxBufferPx"
    },
    providers: [{
      provide: VIRTUAL_SCROLL_STRATEGY,
      useFactory: _autoSizeVirtualScrollStrategyFactory,
      deps: [forwardRef(() => CdkAutoSizeVirtualScroll)]
    }],
    usesOnChanges: true,
    ngImport: i0
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: "12.0.0",
  version: "21.0.0",
  ngImport: i0,
  type: CdkAutoSizeVirtualScroll,
  decorators: [{
    type: Directive,
    args: [{
      selector: 'cdk-virtual-scroll-viewport[autosize]',
      providers: [{
        provide: VIRTUAL_SCROLL_STRATEGY,
        useFactory: _autoSizeVirtualScrollStrategyFactory,
        deps: [forwardRef(() => CdkAutoSizeVirtualScroll)]
      }]
    }]
  }],
  propDecorators: {
    minBufferPx: [{
      type: Input
    }],
    maxBufferPx: [{
      type: Input
    }]
  }
});

class ScrollingModule {
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: "12.0.0",
    version: "21.0.0",
    ngImport: i0,
    type: ScrollingModule,
    deps: [],
    target: i0.ɵɵFactoryTarget.NgModule
  });
  static ɵmod = i0.ɵɵngDeclareNgModule({
    minVersion: "14.0.0",
    version: "21.0.0",
    ngImport: i0,
    type: ScrollingModule,
    imports: [CdkAutoSizeVirtualScroll],
    exports: [CdkAutoSizeVirtualScroll]
  });
  static ɵinj = i0.ɵɵngDeclareInjector({
    minVersion: "12.0.0",
    version: "21.0.0",
    ngImport: i0,
    type: ScrollingModule
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: "12.0.0",
  version: "21.0.0",
  ngImport: i0,
  type: ScrollingModule,
  decorators: [{
    type: NgModule,
    args: [{
      imports: [CdkAutoSizeVirtualScroll],
      exports: [CdkAutoSizeVirtualScroll]
    }]
  }]
});

export { AutoSizeVirtualScrollStrategy, CdkAutoSizeVirtualScroll, ItemSizeAverager, ScrollingModule, _autoSizeVirtualScrollStrategyFactory };
//# sourceMappingURL=scrolling.mjs.map
