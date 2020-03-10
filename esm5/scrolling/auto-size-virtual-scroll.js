/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { coerceNumberProperty } from '@angular/cdk/coercion';
import { VIRTUAL_SCROLL_STRATEGY } from '@angular/cdk/scrolling';
import { Directive, forwardRef, Input } from '@angular/core';
import { Observable } from 'rxjs';
/**
 * A class that tracks the size of items that have been seen and uses it to estimate the average
 * item size.
 */
var ItemSizeAverager = /** @class */ (function () {
    /** @param defaultItemSize The default size to use for items when no data is available. */
    function ItemSizeAverager(defaultItemSize) {
        if (defaultItemSize === void 0) { defaultItemSize = 50; }
        /** The total amount of weight behind the current average. */
        this._totalWeight = 0;
        this._defaultItemSize = defaultItemSize;
        this._averageItemSize = defaultItemSize;
    }
    /** Returns the average item size. */
    ItemSizeAverager.prototype.getAverageItemSize = function () {
        return this._averageItemSize;
    };
    /**
     * Adds a measurement sample for the estimator to consider.
     * @param range The measured range.
     * @param size The measured size of the given range in pixels.
     */
    ItemSizeAverager.prototype.addSample = function (range, size) {
        var newTotalWeight = this._totalWeight + range.end - range.start;
        if (newTotalWeight) {
            var newAverageItemSize = (size + this._averageItemSize * this._totalWeight) / newTotalWeight;
            if (newAverageItemSize) {
                this._averageItemSize = newAverageItemSize;
                this._totalWeight = newTotalWeight;
            }
        }
    };
    /** Resets the averager. */
    ItemSizeAverager.prototype.reset = function () {
        this._averageItemSize = this._defaultItemSize;
        this._totalWeight = 0;
    };
    return ItemSizeAverager;
}());
export { ItemSizeAverager };
/** Virtual scrolling strategy for lists with items of unknown or dynamic size. */
var AutoSizeVirtualScrollStrategy = /** @class */ (function () {
    /**
     * @param minBufferPx The minimum amount of buffer rendered beyond the viewport (in pixels).
     *     If the amount of buffer dips below this number, more items will be rendered.
     * @param maxBufferPx The number of pixels worth of buffer to shoot for when rendering new items.
     *     If the actual amount turns out to be less it will not necessarily trigger an additional
     *     rendering cycle (as long as the amount of buffer is still greater than `minBufferPx`).
     * @param averager The averager used to estimate the size of unseen items.
     */
    function AutoSizeVirtualScrollStrategy(minBufferPx, maxBufferPx, averager) {
        if (averager === void 0) { averager = new ItemSizeAverager(); }
        /** @docs-private Implemented as part of VirtualScrollStrategy. */
        this.scrolledIndexChange = new Observable(function () {
            // TODO(mmalerba): Implement.
            throw Error('cdk-virtual-scroll: scrolledIndexChange is currently not supported for the' +
                ' autosize scroll strategy');
        });
        /** The attached viewport. */
        this._viewport = null;
        /**
         * The number of consecutive cycles where removing extra items has failed. Failure here means that
         * we estimated how many items we could safely remove, but our estimate turned out to be too much
         * and it wasn't safe to remove that many elements.
         */
        this._removalFailures = 0;
        this._minBufferPx = minBufferPx;
        this._maxBufferPx = maxBufferPx;
        this._averager = averager;
    }
    /**
     * Attaches this scroll strategy to a viewport.
     * @param viewport The viewport to attach this strategy to.
     */
    AutoSizeVirtualScrollStrategy.prototype.attach = function (viewport) {
        this._averager.reset();
        this._viewport = viewport;
        this._renderContentForCurrentOffset();
    };
    /** Detaches this scroll strategy from the currently attached viewport. */
    AutoSizeVirtualScrollStrategy.prototype.detach = function () {
        this._viewport = null;
    };
    /** @docs-private Implemented as part of VirtualScrollStrategy. */
    AutoSizeVirtualScrollStrategy.prototype.onContentScrolled = function () {
        if (this._viewport) {
            this._updateRenderedContentAfterScroll();
        }
    };
    /** @docs-private Implemented as part of VirtualScrollStrategy. */
    AutoSizeVirtualScrollStrategy.prototype.onDataLengthChanged = function () {
        if (this._viewport) {
            this._renderContentForCurrentOffset();
            this._checkRenderedContentSize();
        }
    };
    /** @docs-private Implemented as part of VirtualScrollStrategy. */
    AutoSizeVirtualScrollStrategy.prototype.onContentRendered = function () {
        if (this._viewport) {
            this._checkRenderedContentSize();
        }
    };
    /** @docs-private Implemented as part of VirtualScrollStrategy. */
    AutoSizeVirtualScrollStrategy.prototype.onRenderedOffsetChanged = function () {
        if (this._viewport) {
            this._checkRenderedContentOffset();
        }
    };
    /** Scroll to the offset for the given index. */
    AutoSizeVirtualScrollStrategy.prototype.scrollToIndex = function () {
        // TODO(mmalerba): Implement.
        throw Error('cdk-virtual-scroll: scrollToIndex is currently not supported for the autosize'
            + ' scroll strategy');
    };
    /**
     * Update the buffer parameters.
     * @param minBufferPx The minimum amount of buffer rendered beyond the viewport (in pixels).
     * @param maxBufferPx The number of buffer items to render beyond the edge of the viewport (in
     *     pixels).
     */
    AutoSizeVirtualScrollStrategy.prototype.updateBufferSize = function (minBufferPx, maxBufferPx) {
        if (maxBufferPx < minBufferPx) {
            throw ('CDK virtual scroll: maxBufferPx must be greater than or equal to minBufferPx');
        }
        this._minBufferPx = minBufferPx;
        this._maxBufferPx = maxBufferPx;
    };
    /** Update the rendered content after the user scrolls. */
    AutoSizeVirtualScrollStrategy.prototype._updateRenderedContentAfterScroll = function () {
        var viewport = this._viewport;
        // The current scroll offset.
        var scrollOffset = viewport.measureScrollOffset();
        // The delta between the current scroll offset and the previously recorded scroll offset.
        var scrollDelta = scrollOffset - this._lastScrollOffset;
        // The magnitude of the scroll delta.
        var scrollMagnitude = Math.abs(scrollDelta);
        // The currently rendered range.
        var renderedRange = viewport.getRenderedRange();
        // If we're scrolling toward the top, we need to account for the fact that the predicted amount
        // of content and the actual amount of scrollable space may differ. We address this by slowly
        // correcting the difference on each scroll event.
        var offsetCorrection = 0;
        if (scrollDelta < 0) {
            // The content offset we would expect based on the average item size.
            var predictedOffset = renderedRange.start * this._averager.getAverageItemSize();
            // The difference between the predicted size of the unrendered content at the beginning and
            // the actual available space to scroll over. We need to reduce this to zero by the time the
            // user scrolls to the top.
            // - 0 indicates that the predicted size and available space are the same.
            // - A negative number that the predicted size is smaller than the available space.
            // - A positive number indicates the predicted size is larger than the available space
            var offsetDifference = predictedOffset - this._lastRenderedContentOffset;
            // The amount of difference to correct during this scroll event. We calculate this as a
            // percentage of the total difference based on the percentage of the distance toward the top
            // that the user scrolled.
            offsetCorrection = Math.round(offsetDifference *
                Math.max(0, Math.min(1, scrollMagnitude / (scrollOffset + scrollMagnitude))));
            // Based on the offset correction above, we pretend that the scroll delta was bigger or
            // smaller than it actually was, this way we can start to eliminate the difference.
            scrollDelta = scrollDelta - offsetCorrection;
            scrollMagnitude = Math.abs(scrollDelta);
        }
        // The current amount of buffer past the start of the viewport.
        var startBuffer = this._lastScrollOffset - this._lastRenderedContentOffset;
        // The current amount of buffer past the end of the viewport.
        var endBuffer = (this._lastRenderedContentOffset + this._lastRenderedContentSize) -
            (this._lastScrollOffset + viewport.getViewportSize());
        // The amount of unfilled space that should be filled on the side the user is scrolling toward
        // in order to safely absorb the scroll delta.
        var underscan = scrollMagnitude + this._minBufferPx -
            (scrollDelta < 0 ? startBuffer : endBuffer);
        // Check if there's unfilled space that we need to render new elements to fill.
        if (underscan > 0) {
            // Check if the scroll magnitude was larger than the viewport size. In this case the user
            // won't notice a discontinuity if we just jump to the new estimated position in the list.
            // However, if the scroll magnitude is smaller than the viewport the user might notice some
            // jitteriness if we just jump to the estimated position. Instead we make sure to scroll by
            // the same number of pixels as the scroll magnitude.
            if (scrollMagnitude >= viewport.getViewportSize()) {
                this._renderContentForCurrentOffset();
            }
            else {
                // The number of new items to render on the side the user is scrolling towards. Rather than
                // just filling the underscan space, we actually fill enough to have a buffer size of
                // `maxBufferPx`. This gives us a little wiggle room in case our item size estimate is off.
                var addItems = Math.max(0, Math.ceil((underscan - this._minBufferPx + this._maxBufferPx) /
                    this._averager.getAverageItemSize()));
                // The amount of filled space beyond what is necessary on the side the user is scrolling
                // away from.
                var overscan = (scrollDelta < 0 ? endBuffer : startBuffer) - this._minBufferPx +
                    scrollMagnitude;
                // The number of currently rendered items to remove on the side the user is scrolling away
                // from. If removal has failed in recent cycles we are less aggressive in how much we try to
                // remove.
                var unboundedRemoveItems = Math.floor(overscan / this._averager.getAverageItemSize() / (this._removalFailures + 1));
                var removeItems = Math.min(renderedRange.end - renderedRange.start, Math.max(0, unboundedRemoveItems));
                // The new range we will tell the viewport to render. We first expand it to include the new
                // items we want rendered, we then contract the opposite side to remove items we no longer
                // want rendered.
                var range = this._expandRange(renderedRange, scrollDelta < 0 ? addItems : 0, scrollDelta > 0 ? addItems : 0);
                if (scrollDelta < 0) {
                    range.end = Math.max(range.start + 1, range.end - removeItems);
                }
                else {
                    range.start = Math.min(range.end - 1, range.start + removeItems);
                }
                // The new offset we want to set on the rendered content. To determine this we measure the
                // number of pixels we removed and then adjust the offset to the start of the rendered
                // content or to the end of the rendered content accordingly (whichever one doesn't require
                // that the newly added items to be rendered to calculate.)
                var contentOffset = void 0;
                var contentOffsetTo = void 0;
                if (scrollDelta < 0) {
                    var removedSize = viewport.measureRangeSize({
                        start: range.end,
                        end: renderedRange.end,
                    });
                    // Check that we're not removing too much.
                    if (removedSize <= overscan) {
                        contentOffset =
                            this._lastRenderedContentOffset + this._lastRenderedContentSize - removedSize;
                        this._removalFailures = 0;
                    }
                    else {
                        // If the removal is more than the overscan can absorb just undo it and record the fact
                        // that the removal failed so we can be less aggressive next time.
                        range.end = renderedRange.end;
                        contentOffset = this._lastRenderedContentOffset + this._lastRenderedContentSize;
                        this._removalFailures++;
                    }
                    contentOffsetTo = 'to-end';
                }
                else {
                    var removedSize = viewport.measureRangeSize({
                        start: renderedRange.start,
                        end: range.start,
                    });
                    // Check that we're not removing too much.
                    if (removedSize <= overscan) {
                        contentOffset = this._lastRenderedContentOffset + removedSize;
                        this._removalFailures = 0;
                    }
                    else {
                        // If the removal is more than the overscan can absorb just undo it and record the fact
                        // that the removal failed so we can be less aggressive next time.
                        range.start = renderedRange.start;
                        contentOffset = this._lastRenderedContentOffset;
                        this._removalFailures++;
                    }
                    contentOffsetTo = 'to-start';
                }
                // Set the range and offset we calculated above.
                viewport.setRenderedRange(range);
                viewport.setRenderedContentOffset(contentOffset + offsetCorrection, contentOffsetTo);
            }
        }
        else if (offsetCorrection) {
            // Even if the rendered range didn't change, we may still need to adjust the content offset to
            // simulate scrolling slightly slower or faster than the user actually scrolled.
            viewport.setRenderedContentOffset(this._lastRenderedContentOffset + offsetCorrection);
        }
        // Save the scroll offset to be compared to the new value on the next scroll event.
        this._lastScrollOffset = scrollOffset;
    };
    /**
     * Checks the size of the currently rendered content and uses it to update the estimated item size
     * and estimated total content size.
     */
    AutoSizeVirtualScrollStrategy.prototype._checkRenderedContentSize = function () {
        var viewport = this._viewport;
        this._lastRenderedContentSize = viewport.measureRenderedContentSize();
        this._averager.addSample(viewport.getRenderedRange(), this._lastRenderedContentSize);
        this._updateTotalContentSize(this._lastRenderedContentSize);
    };
    /** Checks the currently rendered content offset and saves the value for later use. */
    AutoSizeVirtualScrollStrategy.prototype._checkRenderedContentOffset = function () {
        var viewport = this._viewport;
        this._lastRenderedContentOffset = viewport.getOffsetToRenderedContentStart();
    };
    /**
     * Recalculates the rendered content based on our estimate of what should be shown at the current
     * scroll offset.
     */
    AutoSizeVirtualScrollStrategy.prototype._renderContentForCurrentOffset = function () {
        var viewport = this._viewport;
        var scrollOffset = viewport.measureScrollOffset();
        this._lastScrollOffset = scrollOffset;
        this._removalFailures = 0;
        var itemSize = this._averager.getAverageItemSize();
        var firstVisibleIndex = Math.min(viewport.getDataLength() - 1, Math.floor(scrollOffset / itemSize));
        var bufferSize = Math.ceil(this._maxBufferPx / itemSize);
        var range = this._expandRange(this._getVisibleRangeForIndex(firstVisibleIndex), bufferSize, bufferSize);
        viewport.setRenderedRange(range);
        viewport.setRenderedContentOffset(itemSize * range.start);
    };
    // TODO: maybe move to base class, can probably share with fixed size strategy.
    /**
     * Gets the visible range of data for the given start index. If the start index is too close to
     * the end of the list it may be backed up to ensure the estimated size of the range is enough to
     * fill the viewport.
     * Note: must not be called if `this._viewport` is null
     * @param startIndex The index to start the range at
     * @return a range estimated to be large enough to fill the viewport when rendered.
     */
    AutoSizeVirtualScrollStrategy.prototype._getVisibleRangeForIndex = function (startIndex) {
        var viewport = this._viewport;
        var range = {
            start: startIndex,
            end: startIndex +
                Math.ceil(viewport.getViewportSize() / this._averager.getAverageItemSize())
        };
        var extra = range.end - viewport.getDataLength();
        if (extra > 0) {
            range.start = Math.max(0, range.start - extra);
        }
        return range;
    };
    // TODO: maybe move to base class, can probably share with fixed size strategy.
    /**
     * Expand the given range by the given amount in either direction.
     * Note: must not be called if `this._viewport` is null
     * @param range The range to expand
     * @param expandStart The number of items to expand the start of the range by.
     * @param expandEnd The number of items to expand the end of the range by.
     * @return The expanded range.
     */
    AutoSizeVirtualScrollStrategy.prototype._expandRange = function (range, expandStart, expandEnd) {
        var viewport = this._viewport;
        var start = Math.max(0, range.start - expandStart);
        var end = Math.min(viewport.getDataLength(), range.end + expandEnd);
        return { start: start, end: end };
    };
    /** Update the viewport's total content size. */
    AutoSizeVirtualScrollStrategy.prototype._updateTotalContentSize = function (renderedContentSize) {
        var viewport = this._viewport;
        var renderedRange = viewport.getRenderedRange();
        var totalSize = renderedContentSize +
            (viewport.getDataLength() - (renderedRange.end - renderedRange.start)) *
                this._averager.getAverageItemSize();
        viewport.setTotalContentSize(totalSize);
    };
    return AutoSizeVirtualScrollStrategy;
}());
export { AutoSizeVirtualScrollStrategy };
/**
 * Provider factory for `AutoSizeVirtualScrollStrategy` that simply extracts the already created
 * `AutoSizeVirtualScrollStrategy` from the given directive.
 * @param autoSizeDir The instance of `CdkAutoSizeVirtualScroll` to extract the
 *     `AutoSizeVirtualScrollStrategy` from.
 */
export function _autoSizeVirtualScrollStrategyFactory(autoSizeDir) {
    return autoSizeDir._scrollStrategy;
}
/** A virtual scroll strategy that supports unknown or dynamic size items. */
var CdkAutoSizeVirtualScroll = /** @class */ (function () {
    function CdkAutoSizeVirtualScroll() {
        this._minBufferPx = 100;
        this._maxBufferPx = 200;
        /** The scroll strategy used by this directive. */
        this._scrollStrategy = new AutoSizeVirtualScrollStrategy(this.minBufferPx, this.maxBufferPx);
    }
    Object.defineProperty(CdkAutoSizeVirtualScroll.prototype, "minBufferPx", {
        /**
         * The minimum amount of buffer rendered beyond the viewport (in pixels).
         * If the amount of buffer dips below this number, more items will be rendered. Defaults to 100px.
         */
        get: function () { return this._minBufferPx; },
        set: function (value) { this._minBufferPx = coerceNumberProperty(value); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CdkAutoSizeVirtualScroll.prototype, "maxBufferPx", {
        /**
         * The number of pixels worth of buffer to shoot for when rendering new items.
         * If the actual amount turns out to be less it will not necessarily trigger an additional
         * rendering cycle (as long as the amount of buffer is still greater than `minBufferPx`).
         * Defaults to 200px.
         */
        get: function () { return this._maxBufferPx; },
        set: function (value) { this._maxBufferPx = coerceNumberProperty(value); },
        enumerable: true,
        configurable: true
    });
    CdkAutoSizeVirtualScroll.prototype.ngOnChanges = function () {
        this._scrollStrategy.updateBufferSize(this.minBufferPx, this.maxBufferPx);
    };
    CdkAutoSizeVirtualScroll.decorators = [
        { type: Directive, args: [{
                    selector: 'cdk-virtual-scroll-viewport[autosize]',
                    providers: [{
                            provide: VIRTUAL_SCROLL_STRATEGY,
                            useFactory: _autoSizeVirtualScrollStrategyFactory,
                            deps: [forwardRef(function () { return CdkAutoSizeVirtualScroll; })],
                        }],
                },] }
    ];
    CdkAutoSizeVirtualScroll.propDecorators = {
        minBufferPx: [{ type: Input }],
        maxBufferPx: [{ type: Input }]
    };
    return CdkAutoSizeVirtualScroll;
}());
export { CdkAutoSizeVirtualScroll };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0by1zaXplLXZpcnR1YWwtc2Nyb2xsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvc2Nyb2xsaW5nL2F1dG8tc2l6ZS12aXJ0dWFsLXNjcm9sbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsb0JBQW9CLEVBQWMsTUFBTSx1QkFBdUIsQ0FBQztBQUV4RSxPQUFPLEVBRUwsdUJBQXVCLEVBRXhCLE1BQU0sd0JBQXdCLENBQUM7QUFDaEMsT0FBTyxFQUFDLFNBQVMsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFZLE1BQU0sZUFBZSxDQUFDO0FBQ3RFLE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFHaEM7OztHQUdHO0FBQ0g7SUFVRSwwRkFBMEY7SUFDMUYsMEJBQVksZUFBb0I7UUFBcEIsZ0NBQUEsRUFBQSxvQkFBb0I7UUFWaEMsNkRBQTZEO1FBQ3JELGlCQUFZLEdBQUcsQ0FBQyxDQUFDO1FBVXZCLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxlQUFlLENBQUM7UUFDeEMsSUFBSSxDQUFDLGdCQUFnQixHQUFHLGVBQWUsQ0FBQztJQUMxQyxDQUFDO0lBRUQscUNBQXFDO0lBQ3JDLDZDQUFrQixHQUFsQjtRQUNFLE9BQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDO0lBQy9CLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsb0NBQVMsR0FBVCxVQUFVLEtBQWdCLEVBQUUsSUFBWTtRQUN0QyxJQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQyxHQUFHLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQztRQUNuRSxJQUFJLGNBQWMsRUFBRTtZQUNsQixJQUFNLGtCQUFrQixHQUNwQixDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLFlBQVks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RCxTQUFTLEVBQUUsQ0FBQzs0QkFDVixPQUFPLEVBQUUsdUJBQXVCOzRCQUNoQyxVQUFVLEVBQUUscUNBQXFDOzRCQUNqRCxJQUFJLEVBQUUsQ0FBQyxVQUFVLENBQUMsY0FBTSxPQUFBLHdCQUF3QixFQUF4QixDQUF3QixDQUFDLENBQUM7eUJBQ25ELENBQUM7aUJBQ0g7Ozs4QkFNRSxLQUFLOzhCQVdMLEtBQUs7O0lBY1IsK0JBQUM7Q0FBQSxBQXRDRCxJQXNDQztTQTlCWSx3QkFBd0IiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtjb2VyY2VOdW1iZXJQcm9wZXJ0eSwgTnVtYmVySW5wdXR9IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2VyY2lvbic7XG5pbXBvcnQge0xpc3RSYW5nZX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvbGxlY3Rpb25zJztcbmltcG9ydCB7XG4gIENka1ZpcnR1YWxTY3JvbGxWaWV3cG9ydCxcbiAgVklSVFVBTF9TQ1JPTExfU1RSQVRFR1ksXG4gIFZpcnR1YWxTY3JvbGxTdHJhdGVneVxufSBmcm9tICdAYW5ndWxhci9jZGsvc2Nyb2xsaW5nJztcbmltcG9ydCB7RGlyZWN0aXZlLCBmb3J3YXJkUmVmLCBJbnB1dCwgT25DaGFuZ2VzfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7T2JzZXJ2YWJsZX0gZnJvbSAncnhqcyc7XG5cblxuLyoqXG4gKiBBIGNsYXNzIHRoYXQgdHJhY2tzIHRoZSBzaXplIG9mIGl0ZW1zIHRoYXQgaGF2ZSBiZWVuIHNlZW4gYW5kIHVzZXMgaXQgdG8gZXN0aW1hdGUgdGhlIGF2ZXJhZ2VcbiAqIGl0ZW0gc2l6ZS5cbiAqL1xuZXhwb3J0IGNsYXNzIEl0ZW1TaXplQXZlcmFnZXIge1xuICAvKiogVGhlIHRvdGFsIGFtb3VudCBvZiB3ZWlnaHQgYmVoaW5kIHRoZSBjdXJyZW50IGF2ZXJhZ2UuICovXG4gIHByaXZhdGUgX3RvdGFsV2VpZ2h0ID0gMDtcblxuICAvKiogVGhlIGN1cnJlbnQgYXZlcmFnZSBpdGVtIHNpemUuICovXG4gIHByaXZhdGUgX2F2ZXJhZ2VJdGVtU2l6ZTogbnVtYmVyO1xuXG4gIC8qKiBUaGUgZGVmYXVsdCBzaXplIHRvIHVzZSBmb3IgaXRlbXMgd2hlbiBubyBkYXRhIGlzIGF2YWlsYWJsZS4gKi9cbiAgcHJpdmF0ZSBfZGVmYXVsdEl0ZW1TaXplOiBudW1iZXI7XG5cbiAgLyoqIEBwYXJhbSBkZWZhdWx0SXRlbVNpemUgVGhlIGRlZmF1bHQgc2l6ZSB0byB1c2UgZm9yIGl0ZW1zIHdoZW4gbm8gZGF0YSBpcyBhdmFpbGFibGUuICovXG4gIGNvbnN0cnVjdG9yKGRlZmF1bHRJdGVtU2l6ZSA9IDUwKSB7XG4gICAgdGhpcy5fZGVmYXVsdEl0ZW1TaXplID0gZGVmYXVsdEl0ZW1TaXplO1xuICAgIHRoaXMuX2F2ZXJhZ2VJdGVtU2l6ZSA9IGRlZmF1bHRJdGVtU2l6ZTtcbiAgfVxuXG4gIC8qKiBSZXR1cm5zIHRoZSBhdmVyYWdlIGl0ZW0gc2l6ZS4gKi9cbiAgZ2V0QXZlcmFnZUl0ZW1TaXplKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX2F2ZXJhZ2VJdGVtU2l6ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGEgbWVhc3VyZW1lbnQgc2FtcGxlIGZvciB0aGUgZXN0aW1hdG9yIHRvIGNvbnNpZGVyLlxuICAgKiBAcGFyYW0gcmFuZ2UgVGhlIG1lYXN1cmVkIHJhbmdlLlxuICAgKiBAcGFyYW0gc2l6ZSBUaGUgbWVhc3VyZWQgc2l6ZSBvZiB0aGUgZ2l2ZW4gcmFuZ2UgaW4gcGl4ZWxzLlxuICAgKi9cbiAgYWRkU2FtcGxlKHJhbmdlOiBMaXN0UmFuZ2UsIHNpemU6IG51bWJlcikge1xuICAgIGNvbnN0IG5ld1RvdGFsV2VpZ2h0ID0gdGhpcy5fdG90YWxXZWlnaHQgKyByYW5nZS5lbmQgLSByYW5nZS5zdGFydDtcbiAgICBpZiAobmV3VG90YWxXZWlnaHQpIHtcbiAgICAgIGNvbnN0IG5ld0F2ZXJhZ2VJdGVtU2l6ZSA9XG4gICAgICAgICAgKHNpemUgKyB0aGlzLl9hdmVyYWdlSXRlbVNpemUgKiB0aGlzLl90b3RhbFdlaWdodCkgLyBuZXdUb3RhbFdlaWdodDtcbiAgICAgIGlmIChuZXdBdmVyYWdlSXRlbVNpemUpIHtcbiAgICAgICAgdGhpcy5fYXZlcmFnZUl0ZW1TaXplID0gbmV3QXZlcmFnZUl0ZW1TaXplO1xuICAgICAgICB0aGlzLl90b3RhbFdlaWdodCA9IG5ld1RvdGFsV2VpZ2h0O1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKiBSZXNldHMgdGhlIGF2ZXJhZ2VyLiAqL1xuICByZXNldCgpIHtcbiAgICB0aGlzLl9hdmVyYWdlSXRlbVNpemUgPSB0aGlzLl9kZWZhdWx0SXRlbVNpemU7XG4gICAgdGhpcy5fdG90YWxXZWlnaHQgPSAwO1xuICB9XG59XG5cblxuLyoqIFZpcnR1YWwgc2Nyb2xsaW5nIHN0cmF0ZWd5IGZvciBsaXN0cyB3aXRoIGl0ZW1zIG9mIHVua25vd24gb3IgZHluYW1pYyBzaXplLiAqL1xuZXhwb3J0IGNsYXNzIEF1dG9TaXplVmlydHVhbFNjcm9sbFN0cmF0ZWd5IGltcGxlbWVudHMgVmlydHVhbFNjcm9sbFN0cmF0ZWd5IHtcbiAgLyoqIEBkb2NzLXByaXZhdGUgSW1wbGVtZW50ZWQgYXMgcGFydCBvZiBWaXJ0dWFsU2Nyb2xsU3RyYXRlZ3kuICovXG4gIHNjcm9sbGVkSW5kZXhDaGFuZ2UgPSBuZXcgT2JzZXJ2YWJsZTxudW1iZXI+KCgpID0+IHtcbiAgICAvLyBUT0RPKG1tYWxlcmJhKTogSW1wbGVtZW50LlxuICAgIHRocm93IEVycm9yKCdjZGstdmlydHVhbC1zY3JvbGw6IHNjcm9sbGVkSW5kZXhDaGFuZ2UgaXMgY3VycmVudGx5IG5vdCBzdXBwb3J0ZWQgZm9yIHRoZScgK1xuICAgICAgICAnIGF1dG9zaXplIHNjcm9sbCBzdHJhdGVneScpO1xuICB9KTtcblxuICAvKiogVGhlIGF0dGFjaGVkIHZpZXdwb3J0LiAqL1xuICBwcml2YXRlIF92aWV3cG9ydDogQ2RrVmlydHVhbFNjcm9sbFZpZXdwb3J0IHwgbnVsbCA9IG51bGw7XG5cbiAgLyoqIFRoZSBtaW5pbXVtIGFtb3VudCBvZiBidWZmZXIgcmVuZGVyZWQgYmV5b25kIHRoZSB2aWV3cG9ydCAoaW4gcGl4ZWxzKS4gKi9cbiAgcHJpdmF0ZSBfbWluQnVmZmVyUHg6IG51bWJlcjtcblxuICAvKiogVGhlIG51bWJlciBvZiBidWZmZXIgaXRlbXMgdG8gcmVuZGVyIGJleW9uZCB0aGUgZWRnZSBvZiB0aGUgdmlld3BvcnQgKGluIHBpeGVscykuICovXG4gIHByaXZhdGUgX21heEJ1ZmZlclB4OiBudW1iZXI7XG5cbiAgLyoqIFRoZSBlc3RpbWF0b3IgdXNlZCB0byBlc3RpbWF0ZSB0aGUgc2l6ZSBvZiB1bnNlZW4gaXRlbXMuICovXG4gIHByaXZhdGUgX2F2ZXJhZ2VyOiBJdGVtU2l6ZUF2ZXJhZ2VyO1xuXG4gIC8qKiBUaGUgbGFzdCBtZWFzdXJlZCBzY3JvbGwgb2Zmc2V0IG9mIHRoZSB2aWV3cG9ydC4gKi9cbiAgcHJpdmF0ZSBfbGFzdFNjcm9sbE9mZnNldDogbnVtYmVyO1xuXG4gIC8qKiBUaGUgbGFzdCBtZWFzdXJlZCBzaXplIG9mIHRoZSByZW5kZXJlZCBjb250ZW50IGluIHRoZSB2aWV3cG9ydC4gKi9cbiAgcHJpdmF0ZSBfbGFzdFJlbmRlcmVkQ29udGVudFNpemU6IG51bWJlcjtcblxuICAvKiogVGhlIGxhc3QgbWVhc3VyZWQgc2l6ZSBvZiB0aGUgcmVuZGVyZWQgY29udGVudCBpbiB0aGUgdmlld3BvcnQuICovXG4gIHByaXZhdGUgX2xhc3RSZW5kZXJlZENvbnRlbnRPZmZzZXQ6IG51bWJlcjtcblxuICAvKipcbiAgICogVGhlIG51bWJlciBvZiBjb25zZWN1dGl2ZSBjeWNsZXMgd2hlcmUgcmVtb3ZpbmcgZXh0cmEgaXRlbXMgaGFzIGZhaWxlZC4gRmFpbHVyZSBoZXJlIG1lYW5zIHRoYXRcbiAgICogd2UgZXN0aW1hdGVkIGhvdyBtYW55IGl0ZW1zIHdlIGNvdWxkIHNhZmVseSByZW1vdmUsIGJ1dCBvdXIgZXN0aW1hdGUgdHVybmVkIG91dCB0byBiZSB0b28gbXVjaFxuICAgKiBhbmQgaXQgd2Fzbid0IHNhZmUgdG8gcmVtb3ZlIHRoYXQgbWFueSBlbGVtZW50cy5cbiAgICovXG4gIHByaXZhdGUgX3JlbW92YWxGYWlsdXJlcyA9IDA7XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBtaW5CdWZmZXJQeCBUaGUgbWluaW11bSBhbW91bnQgb2YgYnVmZmVyIHJlbmRlcmVkIGJleW9uZCB0aGUgdmlld3BvcnQgKGluIHBpeGVscykuXG4gICAqICAgICBJZiB0aGUgYW1vdW50IG9mIGJ1ZmZlciBkaXBzIGJlbG93IHRoaXMgbnVtYmVyLCBtb3JlIGl0ZW1zIHdpbGwgYmUgcmVuZGVyZWQuXG4gICAqIEBwYXJhbSBtYXhCdWZmZXJQeCBUaGUgbnVtYmVyIG9mIHBpeGVscyB3b3J0aCBvZiBidWZmZXIgdG8gc2hvb3QgZm9yIHdoZW4gcmVuZGVyaW5nIG5ldyBpdGVtcy5cbiAgICogICAgIElmIHRoZSBhY3R1YWwgYW1vdW50IHR1cm5zIG91dCB0byBiZSBsZXNzIGl0IHdpbGwgbm90IG5lY2Vzc2FyaWx5IHRyaWdnZXIgYW4gYWRkaXRpb25hbFxuICAgKiAgICAgcmVuZGVyaW5nIGN5Y2xlIChhcyBsb25nIGFzIHRoZSBhbW91bnQgb2YgYnVmZmVyIGlzIHN0aWxsIGdyZWF0ZXIgdGhhbiBgbWluQnVmZmVyUHhgKS5cbiAgICogQHBhcmFtIGF2ZXJhZ2VyIFRoZSBhdmVyYWdlciB1c2VkIHRvIGVzdGltYXRlIHRoZSBzaXplIG9mIHVuc2VlbiBpdGVtcy5cbiAgICovXG4gIGNvbnN0cnVjdG9yKG1pbkJ1ZmZlclB4OiBudW1iZXIsIG1heEJ1ZmZlclB4OiBudW1iZXIsIGF2ZXJhZ2VyID0gbmV3IEl0ZW1TaXplQXZlcmFnZXIoKSkge1xuICAgIHRoaXMuX21pbkJ1ZmZlclB4ID0gbWluQnVmZmVyUHg7XG4gICAgdGhpcy5fbWF4QnVmZmVyUHggPSBtYXhCdWZmZXJQeDtcbiAgICB0aGlzLl9hdmVyYWdlciA9IGF2ZXJhZ2VyO1xuICB9XG5cbiAgLyoqXG4gICAqIEF0dGFjaGVzIHRoaXMgc2Nyb2xsIHN0cmF0ZWd5IHRvIGEgdmlld3BvcnQuXG4gICAqIEBwYXJhbSB2aWV3cG9ydCBUaGUgdmlld3BvcnQgdG8gYXR0YWNoIHRoaXMgc3RyYXRlZ3kgdG8uXG4gICAqL1xuICBhdHRhY2godmlld3BvcnQ6IENka1ZpcnR1YWxTY3JvbGxWaWV3cG9ydCkge1xuICAgIHRoaXMuX2F2ZXJhZ2VyLnJlc2V0KCk7XG4gICAgdGhpcy5fdmlld3BvcnQgPSB2aWV3cG9ydDtcbiAgICB0aGlzLl9yZW5kZXJDb250ZW50Rm9yQ3VycmVudE9mZnNldCgpO1xuICB9XG5cbiAgLyoqIERldGFjaGVzIHRoaXMgc2Nyb2xsIHN0cmF0ZWd5IGZyb20gdGhlIGN1cnJlbnRseSBhdHRhY2hlZCB2aWV3cG9ydC4gKi9cbiAgZGV0YWNoKCkge1xuICAgIHRoaXMuX3ZpZXdwb3J0ID0gbnVsbDtcbiAgfVxuXG4gIC8qKiBAZG9jcy1wcml2YXRlIEltcGxlbWVudGVkIGFzIHBhcnQgb2YgVmlydHVhbFNjcm9sbFN0cmF0ZWd5LiAqL1xuICBvbkNvbnRlbnRTY3JvbGxlZCgpIHtcbiAgICBpZiAodGhpcy5fdmlld3BvcnQpIHtcbiAgICAgIHRoaXMuX3VwZGF0ZVJlbmRlcmVkQ29udGVudEFmdGVyU2Nyb2xsKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBkb2NzLXByaXZhdGUgSW1wbGVtZW50ZWQgYXMgcGFydCBvZiBWaXJ0dWFsU2Nyb2xsU3RyYXRlZ3kuICovXG4gIG9uRGF0YUxlbmd0aENoYW5nZWQoKSB7XG4gICAgaWYgKHRoaXMuX3ZpZXdwb3J0KSB7XG4gICAgICB0aGlzLl9yZW5kZXJDb250ZW50Rm9yQ3VycmVudE9mZnNldCgpO1xuICAgICAgdGhpcy5fY2hlY2tSZW5kZXJlZENvbnRlbnRTaXplKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBkb2NzLXByaXZhdGUgSW1wbGVtZW50ZWQgYXMgcGFydCBvZiBWaXJ0dWFsU2Nyb2xsU3RyYXRlZ3kuICovXG4gIG9uQ29udGVudFJlbmRlcmVkKCkge1xuICAgIGlmICh0aGlzLl92aWV3cG9ydCkge1xuICAgICAgdGhpcy5fY2hlY2tSZW5kZXJlZENvbnRlbnRTaXplKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBkb2NzLXByaXZhdGUgSW1wbGVtZW50ZWQgYXMgcGFydCBvZiBWaXJ0dWFsU2Nyb2xsU3RyYXRlZ3kuICovXG4gIG9uUmVuZGVyZWRPZmZzZXRDaGFuZ2VkKCkge1xuICAgIGlmICh0aGlzLl92aWV3cG9ydCkge1xuICAgICAgdGhpcy5fY2hlY2tSZW5kZXJlZENvbnRlbnRPZmZzZXQoKTtcbiAgICB9XG4gIH1cblxuICAvKiogU2Nyb2xsIHRvIHRoZSBvZmZzZXQgZm9yIHRoZSBnaXZlbiBpbmRleC4gKi9cbiAgc2Nyb2xsVG9JbmRleCgpOiB2b2lkIHtcbiAgICAvLyBUT0RPKG1tYWxlcmJhKTogSW1wbGVtZW50LlxuICAgIHRocm93IEVycm9yKCdjZGstdmlydHVhbC1zY3JvbGw6IHNjcm9sbFRvSW5kZXggaXMgY3VycmVudGx5IG5vdCBzdXBwb3J0ZWQgZm9yIHRoZSBhdXRvc2l6ZSdcbiAgICAgICAgKyAnIHNjcm9sbCBzdHJhdGVneScpO1xuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZSB0aGUgYnVmZmVyIHBhcmFtZXRlcnMuXG4gICAqIEBwYXJhbSBtaW5CdWZmZXJQeCBUaGUgbWluaW11bSBhbW91bnQgb2YgYnVmZmVyIHJlbmRlcmVkIGJleW9uZCB0aGUgdmlld3BvcnQgKGluIHBpeGVscykuXG4gICAqIEBwYXJhbSBtYXhCdWZmZXJQeCBUaGUgbnVtYmVyIG9mIGJ1ZmZlciBpdGVtcyB0byByZW5kZXIgYmV5b25kIHRoZSBlZGdlIG9mIHRoZSB2aWV3cG9ydCAoaW5cbiAgICogICAgIHBpeGVscykuXG4gICAqL1xuICB1cGRhdGVCdWZmZXJTaXplKG1pbkJ1ZmZlclB4OiBudW1iZXIsIG1heEJ1ZmZlclB4OiBudW1iZXIpIHtcbiAgICBpZiAobWF4QnVmZmVyUHggPCBtaW5CdWZmZXJQeCkge1xuICAgICAgdGhyb3coJ0NESyB2aXJ0dWFsIHNjcm9sbDogbWF4QnVmZmVyUHggbXVzdCBiZSBncmVhdGVyIHRoYW4gb3IgZXF1YWwgdG8gbWluQnVmZmVyUHgnKTtcbiAgICB9XG4gICAgdGhpcy5fbWluQnVmZmVyUHggPSBtaW5CdWZmZXJQeDtcbiAgICB0aGlzLl9tYXhCdWZmZXJQeCA9IG1heEJ1ZmZlclB4O1xuICB9XG5cbiAgLyoqIFVwZGF0ZSB0aGUgcmVuZGVyZWQgY29udGVudCBhZnRlciB0aGUgdXNlciBzY3JvbGxzLiAqL1xuICBwcml2YXRlIF91cGRhdGVSZW5kZXJlZENvbnRlbnRBZnRlclNjcm9sbCgpIHtcbiAgICBjb25zdCB2aWV3cG9ydCA9IHRoaXMuX3ZpZXdwb3J0ITtcblxuICAgIC8vIFRoZSBjdXJyZW50IHNjcm9sbCBvZmZzZXQuXG4gICAgY29uc3Qgc2Nyb2xsT2Zmc2V0ID0gdmlld3BvcnQubWVhc3VyZVNjcm9sbE9mZnNldCgpO1xuICAgIC8vIFRoZSBkZWx0YSBiZXR3ZWVuIHRoZSBjdXJyZW50IHNjcm9sbCBvZmZzZXQgYW5kIHRoZSBwcmV2aW91c2x5IHJlY29yZGVkIHNjcm9sbCBvZmZzZXQuXG4gICAgbGV0IHNjcm9sbERlbHRhID0gc2Nyb2xsT2Zmc2V0IC0gdGhpcy5fbGFzdFNjcm9sbE9mZnNldDtcbiAgICAvLyBUaGUgbWFnbml0dWRlIG9mIHRoZSBzY3JvbGwgZGVsdGEuXG4gICAgbGV0IHNjcm9sbE1hZ25pdHVkZSA9IE1hdGguYWJzKHNjcm9sbERlbHRhKTtcblxuICAgIC8vIFRoZSBjdXJyZW50bHkgcmVuZGVyZWQgcmFuZ2UuXG4gICAgY29uc3QgcmVuZGVyZWRSYW5nZSA9IHZpZXdwb3J0LmdldFJlbmRlcmVkUmFuZ2UoKTtcblxuICAgIC8vIElmIHdlJ3JlIHNjcm9sbGluZyB0b3dhcmQgdGhlIHRvcCwgd2UgbmVlZCB0byBhY2NvdW50IGZvciB0aGUgZmFjdCB0aGF0IHRoZSBwcmVkaWN0ZWQgYW1vdW50XG4gICAgLy8gb2YgY29udGVudCBhbmQgdGhlIGFjdHVhbCBhbW91bnQgb2Ygc2Nyb2xsYWJsZSBzcGFjZSBtYXkgZGlmZmVyLiBXZSBhZGRyZXNzIHRoaXMgYnkgc2xvd2x5XG4gICAgLy8gY29ycmVjdGluZyB0aGUgZGlmZmVyZW5jZSBvbiBlYWNoIHNjcm9sbCBldmVudC5cbiAgICBsZXQgb2Zmc2V0Q29ycmVjdGlvbiA9IDA7XG4gICAgaWYgKHNjcm9sbERlbHRhIDwgMCkge1xuICAgICAgLy8gVGhlIGNvbnRlbnQgb2Zmc2V0IHdlIHdvdWxkIGV4cGVjdCBiYXNlZCBvbiB0aGUgYXZlcmFnZSBpdGVtIHNpemUuXG4gICAgICBjb25zdCBwcmVkaWN0ZWRPZmZzZXQgPSByZW5kZXJlZFJhbmdlLnN0YXJ0ICogdGhpcy5fYXZlcmFnZXIuZ2V0QXZlcmFnZUl0ZW1TaXplKCk7XG4gICAgICAvLyBUaGUgZGlmZmVyZW5jZSBiZXR3ZWVuIHRoZSBwcmVkaWN0ZWQgc2l6ZSBvZiB0aGUgdW5yZW5kZXJlZCBjb250ZW50IGF0IHRoZSBiZWdpbm5pbmcgYW5kXG4gICAgICAvLyB0aGUgYWN0dWFsIGF2YWlsYWJsZSBzcGFjZSB0byBzY3JvbGwgb3Zlci4gV2UgbmVlZCB0byByZWR1Y2UgdGhpcyB0byB6ZXJvIGJ5IHRoZSB0aW1lIHRoZVxuICAgICAgLy8gdXNlciBzY3JvbGxzIHRvIHRoZSB0b3AuXG4gICAgICAvLyAtIDAgaW5kaWNhdGVzIHRoYXQgdGhlIHByZWRpY3RlZCBzaXplIGFuZCBhdmFpbGFibGUgc3BhY2UgYXJlIHRoZSBzYW1lLlxuICAgICAgLy8gLSBBIG5lZ2F0aXZlIG51bWJlciB0aGF0IHRoZSBwcmVkaWN0ZWQgc2l6ZSBpcyBzbWFsbGVyIHRoYW4gdGhlIGF2YWlsYWJsZSBzcGFjZS5cbiAgICAgIC8vIC0gQSBwb3NpdGl2ZSBudW1iZXIgaW5kaWNhdGVzIHRoZSBwcmVkaWN0ZWQgc2l6ZSBpcyBsYXJnZXIgdGhhbiB0aGUgYXZhaWxhYmxlIHNwYWNlXG4gICAgICBjb25zdCBvZmZzZXREaWZmZXJlbmNlID0gcHJlZGljdGVkT2Zmc2V0IC0gdGhpcy5fbGFzdFJlbmRlcmVkQ29udGVudE9mZnNldDtcbiAgICAgIC8vIFRoZSBhbW91bnQgb2YgZGlmZmVyZW5jZSB0byBjb3JyZWN0IGR1cmluZyB0aGlzIHNjcm9sbCBldmVudC4gV2UgY2FsY3VsYXRlIHRoaXMgYXMgYVxuICAgICAgLy8gcGVyY2VudGFnZSBvZiB0aGUgdG90YWwgZGlmZmVyZW5jZSBiYXNlZCBvbiB0aGUgcGVyY2VudGFnZSBvZiB0aGUgZGlzdGFuY2UgdG93YXJkIHRoZSB0b3BcbiAgICAgIC8vIHRoYXQgdGhlIHVzZXIgc2Nyb2xsZWQuXG4gICAgICBvZmZzZXRDb3JyZWN0aW9uID0gTWF0aC5yb3VuZChvZmZzZXREaWZmZXJlbmNlICpcbiAgICAgICAgICBNYXRoLm1heCgwLCBNYXRoLm1pbigxLCBzY3JvbGxNYWduaXR1ZGUgLyAoc2Nyb2xsT2Zmc2V0ICsgc2Nyb2xsTWFnbml0dWRlKSkpKTtcblxuICAgICAgLy8gQmFzZWQgb24gdGhlIG9mZnNldCBjb3JyZWN0aW9uIGFib3ZlLCB3ZSBwcmV0ZW5kIHRoYXQgdGhlIHNjcm9sbCBkZWx0YSB3YXMgYmlnZ2VyIG9yXG4gICAgICAvLyBzbWFsbGVyIHRoYW4gaXQgYWN0dWFsbHkgd2FzLCB0aGlzIHdheSB3ZSBjYW4gc3RhcnQgdG8gZWxpbWluYXRlIHRoZSBkaWZmZXJlbmNlLlxuICAgICAgc2Nyb2xsRGVsdGEgPSBzY3JvbGxEZWx0YSAtIG9mZnNldENvcnJlY3Rpb247XG4gICAgICBzY3JvbGxNYWduaXR1ZGUgPSBNYXRoLmFicyhzY3JvbGxEZWx0YSk7XG4gICAgfVxuXG4gICAgLy8gVGhlIGN1cnJlbnQgYW1vdW50IG9mIGJ1ZmZlciBwYXN0IHRoZSBzdGFydCBvZiB0aGUgdmlld3BvcnQuXG4gICAgY29uc3Qgc3RhcnRCdWZmZXIgPSB0aGlzLl9sYXN0U2Nyb2xsT2Zmc2V0IC0gdGhpcy5fbGFzdFJlbmRlcmVkQ29udGVudE9mZnNldDtcbiAgICAvLyBUaGUgY3VycmVudCBhbW91bnQgb2YgYnVmZmVyIHBhc3QgdGhlIGVuZCBvZiB0aGUgdmlld3BvcnQuXG4gICAgY29uc3QgZW5kQnVmZmVyID0gKHRoaXMuX2xhc3RSZW5kZXJlZENvbnRlbnRPZmZzZXQgKyB0aGlzLl9sYXN0UmVuZGVyZWRDb250ZW50U2l6ZSkgLVxuICAgICAgICAodGhpcy5fbGFzdFNjcm9sbE9mZnNldCArIHZpZXdwb3J0LmdldFZpZXdwb3J0U2l6ZSgpKTtcbiAgICAvLyBUaGUgYW1vdW50IG9mIHVuZmlsbGVkIHNwYWNlIHRoYXQgc2hvdWxkIGJlIGZpbGxlZCBvbiB0aGUgc2lkZSB0aGUgdXNlciBpcyBzY3JvbGxpbmcgdG93YXJkXG4gICAgLy8gaW4gb3JkZXIgdG8gc2FmZWx5IGFic29yYiB0aGUgc2Nyb2xsIGRlbHRhLlxuICAgIGNvbnN0IHVuZGVyc2NhbiA9IHNjcm9sbE1hZ25pdHVkZSArIHRoaXMuX21pbkJ1ZmZlclB4IC1cbiAgICAgICAgKHNjcm9sbERlbHRhIDwgMCA/IHN0YXJ0QnVmZmVyIDogZW5kQnVmZmVyKTtcblxuICAgIC8vIENoZWNrIGlmIHRoZXJlJ3MgdW5maWxsZWQgc3BhY2UgdGhhdCB3ZSBuZWVkIHRvIHJlbmRlciBuZXcgZWxlbWVudHMgdG8gZmlsbC5cbiAgICBpZiAodW5kZXJzY2FuID4gMCkge1xuICAgICAgLy8gQ2hlY2sgaWYgdGhlIHNjcm9sbCBtYWduaXR1ZGUgd2FzIGxhcmdlciB0aGFuIHRoZSB2aWV3cG9ydCBzaXplLiBJbiB0aGlzIGNhc2UgdGhlIHVzZXJcbiAgICAgIC8vIHdvbid0IG5vdGljZSBhIGRpc2NvbnRpbnVpdHkgaWYgd2UganVzdCBqdW1wIHRvIHRoZSBuZXcgZXN0aW1hdGVkIHBvc2l0aW9uIGluIHRoZSBsaXN0LlxuICAgICAgLy8gSG93ZXZlciwgaWYgdGhlIHNjcm9sbCBtYWduaXR1ZGUgaXMgc21hbGxlciB0aGFuIHRoZSB2aWV3cG9ydCB0aGUgdXNlciBtaWdodCBub3RpY2Ugc29tZVxuICAgICAgLy8gaml0dGVyaW5lc3MgaWYgd2UganVzdCBqdW1wIHRvIHRoZSBlc3RpbWF0ZWQgcG9zaXRpb24uIEluc3RlYWQgd2UgbWFrZSBzdXJlIHRvIHNjcm9sbCBieVxuICAgICAgLy8gdGhlIHNhbWUgbnVtYmVyIG9mIHBpeGVscyBhcyB0aGUgc2Nyb2xsIG1hZ25pdHVkZS5cbiAgICAgIGlmIChzY3JvbGxNYWduaXR1ZGUgPj0gdmlld3BvcnQuZ2V0Vmlld3BvcnRTaXplKCkpIHtcbiAgICAgICAgdGhpcy5fcmVuZGVyQ29udGVudEZvckN1cnJlbnRPZmZzZXQoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFRoZSBudW1iZXIgb2YgbmV3IGl0ZW1zIHRvIHJlbmRlciBvbiB0aGUgc2lkZSB0aGUgdXNlciBpcyBzY3JvbGxpbmcgdG93YXJkcy4gUmF0aGVyIHRoYW5cbiAgICAgICAgLy8ganVzdCBmaWxsaW5nIHRoZSB1bmRlcnNjYW4gc3BhY2UsIHdlIGFjdHVhbGx5IGZpbGwgZW5vdWdoIHRvIGhhdmUgYSBidWZmZXIgc2l6ZSBvZlxuICAgICAgICAvLyBgbWF4QnVmZmVyUHhgLiBUaGlzIGdpdmVzIHVzIGEgbGl0dGxlIHdpZ2dsZSByb29tIGluIGNhc2Ugb3VyIGl0ZW0gc2l6ZSBlc3RpbWF0ZSBpcyBvZmYuXG4gICAgICAgIGNvbnN0IGFkZEl0ZW1zID0gTWF0aC5tYXgoMCwgTWF0aC5jZWlsKCh1bmRlcnNjYW4gLSB0aGlzLl9taW5CdWZmZXJQeCArIHRoaXMuX21heEJ1ZmZlclB4KSAvXG4gICAgICAgICAgICB0aGlzLl9hdmVyYWdlci5nZXRBdmVyYWdlSXRlbVNpemUoKSkpO1xuICAgICAgICAvLyBUaGUgYW1vdW50IG9mIGZpbGxlZCBzcGFjZSBiZXlvbmQgd2hhdCBpcyBuZWNlc3Nhcnkgb24gdGhlIHNpZGUgdGhlIHVzZXIgaXMgc2Nyb2xsaW5nXG4gICAgICAgIC8vIGF3YXkgZnJvbS5cbiAgICAgICAgY29uc3Qgb3ZlcnNjYW4gPSAoc2Nyb2xsRGVsdGEgPCAwID8gZW5kQnVmZmVyIDogc3RhcnRCdWZmZXIpIC0gdGhpcy5fbWluQnVmZmVyUHggK1xuICAgICAgICAgICAgc2Nyb2xsTWFnbml0dWRlO1xuICAgICAgICAvLyBUaGUgbnVtYmVyIG9mIGN1cnJlbnRseSByZW5kZXJlZCBpdGVtcyB0byByZW1vdmUgb24gdGhlIHNpZGUgdGhlIHVzZXIgaXMgc2Nyb2xsaW5nIGF3YXlcbiAgICAgICAgLy8gZnJvbS4gSWYgcmVtb3ZhbCBoYXMgZmFpbGVkIGluIHJlY2VudCBjeWNsZXMgd2UgYXJlIGxlc3MgYWdncmVzc2l2ZSBpbiBob3cgbXVjaCB3ZSB0cnkgdG9cbiAgICAgICAgLy8gcmVtb3ZlLlxuICAgICAgICBjb25zdCB1bmJvdW5kZWRSZW1vdmVJdGVtcyA9IE1hdGguZmxvb3IoXG4gICAgICAgICAgICBvdmVyc2NhbiAvIHRoaXMuX2F2ZXJhZ2VyLmdldEF2ZXJhZ2VJdGVtU2l6ZSgpIC8gKHRoaXMuX3JlbW92YWxGYWlsdXJlcyArIDEpKTtcbiAgICAgICAgY29uc3QgcmVtb3ZlSXRlbXMgPVxuICAgICAgICAgICAgTWF0aC5taW4ocmVuZGVyZWRSYW5nZS5lbmQgLSByZW5kZXJlZFJhbmdlLnN0YXJ0LCBNYXRoLm1heCgwLCB1bmJvdW5kZWRSZW1vdmVJdGVtcykpO1xuXG4gICAgICAgIC8vIFRoZSBuZXcgcmFuZ2Ugd2Ugd2lsbCB0ZWxsIHRoZSB2aWV3cG9ydCB0byByZW5kZXIuIFdlIGZpcnN0IGV4cGFuZCBpdCB0byBpbmNsdWRlIHRoZSBuZXdcbiAgICAgICAgLy8gaXRlbXMgd2Ugd2FudCByZW5kZXJlZCwgd2UgdGhlbiBjb250cmFjdCB0aGUgb3Bwb3NpdGUgc2lkZSB0byByZW1vdmUgaXRlbXMgd2Ugbm8gbG9uZ2VyXG4gICAgICAgIC8vIHdhbnQgcmVuZGVyZWQuXG4gICAgICAgIGNvbnN0IHJhbmdlID0gdGhpcy5fZXhwYW5kUmFuZ2UoXG4gICAgICAgICAgICByZW5kZXJlZFJhbmdlLCBzY3JvbGxEZWx0YSA8IDAgPyBhZGRJdGVtcyA6IDAsIHNjcm9sbERlbHRhID4gMCA/IGFkZEl0ZW1zIDogMCk7XG4gICAgICAgIGlmIChzY3JvbGxEZWx0YSA8IDApIHtcbiAgICAgICAgICByYW5nZS5lbmQgPSBNYXRoLm1heChyYW5nZS5zdGFydCArIDEsIHJhbmdlLmVuZCAtIHJlbW92ZUl0ZW1zKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByYW5nZS5zdGFydCA9IE1hdGgubWluKHJhbmdlLmVuZCAtIDEsIHJhbmdlLnN0YXJ0ICsgcmVtb3ZlSXRlbXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVGhlIG5ldyBvZmZzZXQgd2Ugd2FudCB0byBzZXQgb24gdGhlIHJlbmRlcmVkIGNvbnRlbnQuIFRvIGRldGVybWluZSB0aGlzIHdlIG1lYXN1cmUgdGhlXG4gICAgICAgIC8vIG51bWJlciBvZiBwaXhlbHMgd2UgcmVtb3ZlZCBhbmQgdGhlbiBhZGp1c3QgdGhlIG9mZnNldCB0byB0aGUgc3RhcnQgb2YgdGhlIHJlbmRlcmVkXG4gICAgICAgIC8vIGNvbnRlbnQgb3IgdG8gdGhlIGVuZCBvZiB0aGUgcmVuZGVyZWQgY29udGVudCBhY2NvcmRpbmdseSAod2hpY2hldmVyIG9uZSBkb2Vzbid0IHJlcXVpcmVcbiAgICAgICAgLy8gdGhhdCB0aGUgbmV3bHkgYWRkZWQgaXRlbXMgdG8gYmUgcmVuZGVyZWQgdG8gY2FsY3VsYXRlLilcbiAgICAgICAgbGV0IGNvbnRlbnRPZmZzZXQ6IG51bWJlcjtcbiAgICAgICAgbGV0IGNvbnRlbnRPZmZzZXRUbzogJ3RvLXN0YXJ0JyB8ICd0by1lbmQnO1xuICAgICAgICBpZiAoc2Nyb2xsRGVsdGEgPCAwKSB7XG4gICAgICAgICAgbGV0IHJlbW92ZWRTaXplID0gdmlld3BvcnQubWVhc3VyZVJhbmdlU2l6ZSh7XG4gICAgICAgICAgICBzdGFydDogcmFuZ2UuZW5kLFxuICAgICAgICAgICAgZW5kOiByZW5kZXJlZFJhbmdlLmVuZCxcbiAgICAgICAgICB9KTtcbiAgICAgICAgICAvLyBDaGVjayB0aGF0IHdlJ3JlIG5vdCByZW1vdmluZyB0b28gbXVjaC5cbiAgICAgICAgICBpZiAocmVtb3ZlZFNpemUgPD0gb3ZlcnNjYW4pIHtcbiAgICAgICAgICAgIGNvbnRlbnRPZmZzZXQgPVxuICAgICAgICAgICAgICAgIHRoaXMuX2xhc3RSZW5kZXJlZENvbnRlbnRPZmZzZXQgKyB0aGlzLl9sYXN0UmVuZGVyZWRDb250ZW50U2l6ZSAtIHJlbW92ZWRTaXplO1xuICAgICAgICAgICAgdGhpcy5fcmVtb3ZhbEZhaWx1cmVzID0gMDtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gSWYgdGhlIHJlbW92YWwgaXMgbW9yZSB0aGFuIHRoZSBvdmVyc2NhbiBjYW4gYWJzb3JiIGp1c3QgdW5kbyBpdCBhbmQgcmVjb3JkIHRoZSBmYWN0XG4gICAgICAgICAgICAvLyB0aGF0IHRoZSByZW1vdmFsIGZhaWxlZCBzbyB3ZSBjYW4gYmUgbGVzcyBhZ2dyZXNzaXZlIG5leHQgdGltZS5cbiAgICAgICAgICAgIHJhbmdlLmVuZCA9IHJlbmRlcmVkUmFuZ2UuZW5kO1xuICAgICAgICAgICAgY29udGVudE9mZnNldCA9IHRoaXMuX2xhc3RSZW5kZXJlZENvbnRlbnRPZmZzZXQgKyB0aGlzLl9sYXN0UmVuZGVyZWRDb250ZW50U2l6ZTtcbiAgICAgICAgICAgIHRoaXMuX3JlbW92YWxGYWlsdXJlcysrO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb250ZW50T2Zmc2V0VG8gPSAndG8tZW5kJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zdCByZW1vdmVkU2l6ZSA9IHZpZXdwb3J0Lm1lYXN1cmVSYW5nZVNpemUoe1xuICAgICAgICAgICAgc3RhcnQ6IHJlbmRlcmVkUmFuZ2Uuc3RhcnQsXG4gICAgICAgICAgICBlbmQ6IHJhbmdlLnN0YXJ0LFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIC8vIENoZWNrIHRoYXQgd2UncmUgbm90IHJlbW92aW5nIHRvbyBtdWNoLlxuICAgICAgICAgIGlmIChyZW1vdmVkU2l6ZSA8PSBvdmVyc2Nhbikge1xuICAgICAgICAgICAgY29udGVudE9mZnNldCA9IHRoaXMuX2xhc3RSZW5kZXJlZENvbnRlbnRPZmZzZXQgKyByZW1vdmVkU2l6ZTtcbiAgICAgICAgICAgIHRoaXMuX3JlbW92YWxGYWlsdXJlcyA9IDA7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIElmIHRoZSByZW1vdmFsIGlzIG1vcmUgdGhhbiB0aGUgb3ZlcnNjYW4gY2FuIGFic29yYiBqdXN0IHVuZG8gaXQgYW5kIHJlY29yZCB0aGUgZmFjdFxuICAgICAgICAgICAgLy8gdGhhdCB0aGUgcmVtb3ZhbCBmYWlsZWQgc28gd2UgY2FuIGJlIGxlc3MgYWdncmVzc2l2ZSBuZXh0IHRpbWUuXG4gICAgICAgICAgICByYW5nZS5zdGFydCA9IHJlbmRlcmVkUmFuZ2Uuc3RhcnQ7XG4gICAgICAgICAgICBjb250ZW50T2Zmc2V0ID0gdGhpcy5fbGFzdFJlbmRlcmVkQ29udGVudE9mZnNldDtcbiAgICAgICAgICAgIHRoaXMuX3JlbW92YWxGYWlsdXJlcysrO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb250ZW50T2Zmc2V0VG8gPSAndG8tc3RhcnQnO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gU2V0IHRoZSByYW5nZSBhbmQgb2Zmc2V0IHdlIGNhbGN1bGF0ZWQgYWJvdmUuXG4gICAgICAgIHZpZXdwb3J0LnNldFJlbmRlcmVkUmFuZ2UocmFuZ2UpO1xuICAgICAgICB2aWV3cG9ydC5zZXRSZW5kZXJlZENvbnRlbnRPZmZzZXQoY29udGVudE9mZnNldCArIG9mZnNldENvcnJlY3Rpb24sIGNvbnRlbnRPZmZzZXRUbyk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChvZmZzZXRDb3JyZWN0aW9uKSB7XG4gICAgICAvLyBFdmVuIGlmIHRoZSByZW5kZXJlZCByYW5nZSBkaWRuJ3QgY2hhbmdlLCB3ZSBtYXkgc3RpbGwgbmVlZCB0byBhZGp1c3QgdGhlIGNvbnRlbnQgb2Zmc2V0IHRvXG4gICAgICAvLyBzaW11bGF0ZSBzY3JvbGxpbmcgc2xpZ2h0bHkgc2xvd2VyIG9yIGZhc3RlciB0aGFuIHRoZSB1c2VyIGFjdHVhbGx5IHNjcm9sbGVkLlxuICAgICAgdmlld3BvcnQuc2V0UmVuZGVyZWRDb250ZW50T2Zmc2V0KHRoaXMuX2xhc3RSZW5kZXJlZENvbnRlbnRPZmZzZXQgKyBvZmZzZXRDb3JyZWN0aW9uKTtcbiAgICB9XG5cbiAgICAvLyBTYXZlIHRoZSBzY3JvbGwgb2Zmc2V0IHRvIGJlIGNvbXBhcmVkIHRvIHRoZSBuZXcgdmFsdWUgb24gdGhlIG5leHQgc2Nyb2xsIGV2ZW50LlxuICAgIHRoaXMuX2xhc3RTY3JvbGxPZmZzZXQgPSBzY3JvbGxPZmZzZXQ7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIHRoZSBzaXplIG9mIHRoZSBjdXJyZW50bHkgcmVuZGVyZWQgY29udGVudCBhbmQgdXNlcyBpdCB0byB1cGRhdGUgdGhlIGVzdGltYXRlZCBpdGVtIHNpemVcbiAgICogYW5kIGVzdGltYXRlZCB0b3RhbCBjb250ZW50IHNpemUuXG4gICAqL1xuICBwcml2YXRlIF9jaGVja1JlbmRlcmVkQ29udGVudFNpemUoKSB7XG4gICAgY29uc3Qgdmlld3BvcnQgPSB0aGlzLl92aWV3cG9ydCE7XG4gICAgdGhpcy5fbGFzdFJlbmRlcmVkQ29udGVudFNpemUgPSB2aWV3cG9ydC5tZWFzdXJlUmVuZGVyZWRDb250ZW50U2l6ZSgpO1xuICAgIHRoaXMuX2F2ZXJhZ2VyLmFkZFNhbXBsZSh2aWV3cG9ydC5nZXRSZW5kZXJlZFJhbmdlKCksIHRoaXMuX2xhc3RSZW5kZXJlZENvbnRlbnRTaXplKTtcbiAgICB0aGlzLl91cGRhdGVUb3RhbENvbnRlbnRTaXplKHRoaXMuX2xhc3RSZW5kZXJlZENvbnRlbnRTaXplKTtcbiAgfVxuXG4gIC8qKiBDaGVja3MgdGhlIGN1cnJlbnRseSByZW5kZXJlZCBjb250ZW50IG9mZnNldCBhbmQgc2F2ZXMgdGhlIHZhbHVlIGZvciBsYXRlciB1c2UuICovXG4gIHByaXZhdGUgX2NoZWNrUmVuZGVyZWRDb250ZW50T2Zmc2V0KCkge1xuICAgIGNvbnN0IHZpZXdwb3J0ID0gdGhpcy5fdmlld3BvcnQhO1xuICAgIHRoaXMuX2xhc3RSZW5kZXJlZENvbnRlbnRPZmZzZXQgPSB2aWV3cG9ydC5nZXRPZmZzZXRUb1JlbmRlcmVkQ29udGVudFN0YXJ0KCkhO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlY2FsY3VsYXRlcyB0aGUgcmVuZGVyZWQgY29udGVudCBiYXNlZCBvbiBvdXIgZXN0aW1hdGUgb2Ygd2hhdCBzaG91bGQgYmUgc2hvd24gYXQgdGhlIGN1cnJlbnRcbiAgICogc2Nyb2xsIG9mZnNldC5cbiAgICovXG4gIHByaXZhdGUgX3JlbmRlckNvbnRlbnRGb3JDdXJyZW50T2Zmc2V0KCkge1xuICAgIGNvbnN0IHZpZXdwb3J0ID0gdGhpcy5fdmlld3BvcnQhO1xuICAgIGNvbnN0IHNjcm9sbE9mZnNldCA9IHZpZXdwb3J0Lm1lYXN1cmVTY3JvbGxPZmZzZXQoKTtcbiAgICB0aGlzLl9sYXN0U2Nyb2xsT2Zmc2V0ID0gc2Nyb2xsT2Zmc2V0O1xuICAgIHRoaXMuX3JlbW92YWxGYWlsdXJlcyA9IDA7XG5cbiAgICBjb25zdCBpdGVtU2l6ZSA9IHRoaXMuX2F2ZXJhZ2VyLmdldEF2ZXJhZ2VJdGVtU2l6ZSgpO1xuICAgIGNvbnN0IGZpcnN0VmlzaWJsZUluZGV4ID1cbiAgICAgICAgTWF0aC5taW4odmlld3BvcnQuZ2V0RGF0YUxlbmd0aCgpIC0gMSwgTWF0aC5mbG9vcihzY3JvbGxPZmZzZXQgLyBpdGVtU2l6ZSkpO1xuICAgIGNvbnN0IGJ1ZmZlclNpemUgPSBNYXRoLmNlaWwodGhpcy5fbWF4QnVmZmVyUHggLyBpdGVtU2l6ZSk7XG4gICAgY29uc3QgcmFuZ2UgPSB0aGlzLl9leHBhbmRSYW5nZShcbiAgICAgICAgdGhpcy5fZ2V0VmlzaWJsZVJhbmdlRm9ySW5kZXgoZmlyc3RWaXNpYmxlSW5kZXgpLCBidWZmZXJTaXplLCBidWZmZXJTaXplKTtcblxuICAgIHZpZXdwb3J0LnNldFJlbmRlcmVkUmFuZ2UocmFuZ2UpO1xuICAgIHZpZXdwb3J0LnNldFJlbmRlcmVkQ29udGVudE9mZnNldChpdGVtU2l6ZSAqIHJhbmdlLnN0YXJ0KTtcbiAgfVxuXG4gIC8vIFRPRE86IG1heWJlIG1vdmUgdG8gYmFzZSBjbGFzcywgY2FuIHByb2JhYmx5IHNoYXJlIHdpdGggZml4ZWQgc2l6ZSBzdHJhdGVneS5cbiAgLyoqXG4gICAqIEdldHMgdGhlIHZpc2libGUgcmFuZ2Ugb2YgZGF0YSBmb3IgdGhlIGdpdmVuIHN0YXJ0IGluZGV4LiBJZiB0aGUgc3RhcnQgaW5kZXggaXMgdG9vIGNsb3NlIHRvXG4gICAqIHRoZSBlbmQgb2YgdGhlIGxpc3QgaXQgbWF5IGJlIGJhY2tlZCB1cCB0byBlbnN1cmUgdGhlIGVzdGltYXRlZCBzaXplIG9mIHRoZSByYW5nZSBpcyBlbm91Z2ggdG9cbiAgICogZmlsbCB0aGUgdmlld3BvcnQuXG4gICAqIE5vdGU6IG11c3Qgbm90IGJlIGNhbGxlZCBpZiBgdGhpcy5fdmlld3BvcnRgIGlzIG51bGxcbiAgICogQHBhcmFtIHN0YXJ0SW5kZXggVGhlIGluZGV4IHRvIHN0YXJ0IHRoZSByYW5nZSBhdFxuICAgKiBAcmV0dXJuIGEgcmFuZ2UgZXN0aW1hdGVkIHRvIGJlIGxhcmdlIGVub3VnaCB0byBmaWxsIHRoZSB2aWV3cG9ydCB3aGVuIHJlbmRlcmVkLlxuICAgKi9cbiAgcHJpdmF0ZSBfZ2V0VmlzaWJsZVJhbmdlRm9ySW5kZXgoc3RhcnRJbmRleDogbnVtYmVyKTogTGlzdFJhbmdlIHtcbiAgICBjb25zdCB2aWV3cG9ydCA9IHRoaXMuX3ZpZXdwb3J0ITtcbiAgICBjb25zdCByYW5nZTogTGlzdFJhbmdlID0ge1xuICAgICAgc3RhcnQ6IHN0YXJ0SW5kZXgsXG4gICAgICBlbmQ6IHN0YXJ0SW5kZXggK1xuICAgICAgICAgIE1hdGguY2VpbCh2aWV3cG9ydC5nZXRWaWV3cG9ydFNpemUoKSAvIHRoaXMuX2F2ZXJhZ2VyLmdldEF2ZXJhZ2VJdGVtU2l6ZSgpKVxuICAgIH07XG4gICAgY29uc3QgZXh0cmEgPSByYW5nZS5lbmQgLSB2aWV3cG9ydC5nZXREYXRhTGVuZ3RoKCk7XG4gICAgaWYgKGV4dHJhID4gMCkge1xuICAgICAgcmFuZ2Uuc3RhcnQgPSBNYXRoLm1heCgwLCByYW5nZS5zdGFydCAtIGV4dHJhKTtcbiAgICB9XG4gICAgcmV0dXJuIHJhbmdlO1xuICB9XG5cbiAgLy8gVE9ETzogbWF5YmUgbW92ZSB0byBiYXNlIGNsYXNzLCBjYW4gcHJvYmFibHkgc2hhcmUgd2l0aCBmaXhlZCBzaXplIHN0cmF0ZWd5LlxuICAvKipcbiAgICogRXhwYW5kIHRoZSBnaXZlbiByYW5nZSBieSB0aGUgZ2l2ZW4gYW1vdW50IGluIGVpdGhlciBkaXJlY3Rpb24uXG4gICAqIE5vdGU6IG11c3Qgbm90IGJlIGNhbGxlZCBpZiBgdGhpcy5fdmlld3BvcnRgIGlzIG51bGxcbiAgICogQHBhcmFtIHJhbmdlIFRoZSByYW5nZSB0byBleHBhbmRcbiAgICogQHBhcmFtIGV4cGFuZFN0YXJ0IFRoZSBudW1iZXIgb2YgaXRlbXMgdG8gZXhwYW5kIHRoZSBzdGFydCBvZiB0aGUgcmFuZ2UgYnkuXG4gICAqIEBwYXJhbSBleHBhbmRFbmQgVGhlIG51bWJlciBvZiBpdGVtcyB0byBleHBhbmQgdGhlIGVuZCBvZiB0aGUgcmFuZ2UgYnkuXG4gICAqIEByZXR1cm4gVGhlIGV4cGFuZGVkIHJhbmdlLlxuICAgKi9cbiAgcHJpdmF0ZSBfZXhwYW5kUmFuZ2UocmFuZ2U6IExpc3RSYW5nZSwgZXhwYW5kU3RhcnQ6IG51bWJlciwgZXhwYW5kRW5kOiBudW1iZXIpOiBMaXN0UmFuZ2Uge1xuICAgIGNvbnN0IHZpZXdwb3J0ID0gdGhpcy5fdmlld3BvcnQhO1xuICAgIGNvbnN0IHN0YXJ0ID0gTWF0aC5tYXgoMCwgcmFuZ2Uuc3RhcnQgLSBleHBhbmRTdGFydCk7XG4gICAgY29uc3QgZW5kID0gTWF0aC5taW4odmlld3BvcnQuZ2V0RGF0YUxlbmd0aCgpLCByYW5nZS5lbmQgKyBleHBhbmRFbmQpO1xuICAgIHJldHVybiB7c3RhcnQsIGVuZH07XG4gIH1cblxuICAvKiogVXBkYXRlIHRoZSB2aWV3cG9ydCdzIHRvdGFsIGNvbnRlbnQgc2l6ZS4gKi9cbiAgcHJpdmF0ZSBfdXBkYXRlVG90YWxDb250ZW50U2l6ZShyZW5kZXJlZENvbnRlbnRTaXplOiBudW1iZXIpIHtcbiAgICBjb25zdCB2aWV3cG9ydCA9IHRoaXMuX3ZpZXdwb3J0ITtcbiAgICBjb25zdCByZW5kZXJlZFJhbmdlID0gdmlld3BvcnQuZ2V0UmVuZGVyZWRSYW5nZSgpO1xuICAgIGNvbnN0IHRvdGFsU2l6ZSA9IHJlbmRlcmVkQ29udGVudFNpemUgK1xuICAgICAgICAodmlld3BvcnQuZ2V0RGF0YUxlbmd0aCgpIC0gKHJlbmRlcmVkUmFuZ2UuZW5kIC0gcmVuZGVyZWRSYW5nZS5zdGFydCkpICpcbiAgICAgICAgdGhpcy5fYXZlcmFnZXIuZ2V0QXZlcmFnZUl0ZW1TaXplKCk7XG4gICAgdmlld3BvcnQuc2V0VG90YWxDb250ZW50U2l6ZSh0b3RhbFNpemUpO1xuICB9XG59XG5cbi8qKlxuICogUHJvdmlkZXIgZmFjdG9yeSBmb3IgYEF1dG9TaXplVmlydHVhbFNjcm9sbFN0cmF0ZWd5YCB0aGF0IHNpbXBseSBleHRyYWN0cyB0aGUgYWxyZWFkeSBjcmVhdGVkXG4gKiBgQXV0b1NpemVWaXJ0dWFsU2Nyb2xsU3RyYXRlZ3lgIGZyb20gdGhlIGdpdmVuIGRpcmVjdGl2ZS5cbiAqIEBwYXJhbSBhdXRvU2l6ZURpciBUaGUgaW5zdGFuY2Ugb2YgYENka0F1dG9TaXplVmlydHVhbFNjcm9sbGAgdG8gZXh0cmFjdCB0aGVcbiAqICAgICBgQXV0b1NpemVWaXJ0dWFsU2Nyb2xsU3RyYXRlZ3lgIGZyb20uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBfYXV0b1NpemVWaXJ0dWFsU2Nyb2xsU3RyYXRlZ3lGYWN0b3J5KGF1dG9TaXplRGlyOiBDZGtBdXRvU2l6ZVZpcnR1YWxTY3JvbGwpIHtcbiAgcmV0dXJuIGF1dG9TaXplRGlyLl9zY3JvbGxTdHJhdGVneTtcbn1cblxuXG4vKiogQSB2aXJ0dWFsIHNjcm9sbCBzdHJhdGVneSB0aGF0IHN1cHBvcnRzIHVua25vd24gb3IgZHluYW1pYyBzaXplIGl0ZW1zLiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnY2RrLXZpcnR1YWwtc2Nyb2xsLXZpZXdwb3J0W2F1dG9zaXplXScsXG4gIHByb3ZpZGVyczogW3tcbiAgICBwcm92aWRlOiBWSVJUVUFMX1NDUk9MTF9TVFJBVEVHWSxcbiAgICB1c2VGYWN0b3J5OiBfYXV0b1NpemVWaXJ0dWFsU2Nyb2xsU3RyYXRlZ3lGYWN0b3J5LFxuICAgIGRlcHM6IFtmb3J3YXJkUmVmKCgpID0+IENka0F1dG9TaXplVmlydHVhbFNjcm9sbCldLFxuICB9XSxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrQXV0b1NpemVWaXJ0dWFsU2Nyb2xsIGltcGxlbWVudHMgT25DaGFuZ2VzIHtcbiAgLyoqXG4gICAqIFRoZSBtaW5pbXVtIGFtb3VudCBvZiBidWZmZXIgcmVuZGVyZWQgYmV5b25kIHRoZSB2aWV3cG9ydCAoaW4gcGl4ZWxzKS5cbiAgICogSWYgdGhlIGFtb3VudCBvZiBidWZmZXIgZGlwcyBiZWxvdyB0aGlzIG51bWJlciwgbW9yZSBpdGVtcyB3aWxsIGJlIHJlbmRlcmVkLiBEZWZhdWx0cyB0byAxMDBweC5cbiAgICovXG4gIEBJbnB1dCgpXG4gIGdldCBtaW5CdWZmZXJQeCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5fbWluQnVmZmVyUHg7IH1cbiAgc2V0IG1pbkJ1ZmZlclB4KHZhbHVlOiBudW1iZXIpIHsgdGhpcy5fbWluQnVmZmVyUHggPSBjb2VyY2VOdW1iZXJQcm9wZXJ0eSh2YWx1ZSk7IH1cbiAgX21pbkJ1ZmZlclB4ID0gMTAwO1xuXG4gIC8qKlxuICAgKiBUaGUgbnVtYmVyIG9mIHBpeGVscyB3b3J0aCBvZiBidWZmZXIgdG8gc2hvb3QgZm9yIHdoZW4gcmVuZGVyaW5nIG5ldyBpdGVtcy5cbiAgICogSWYgdGhlIGFjdHVhbCBhbW91bnQgdHVybnMgb3V0IHRvIGJlIGxlc3MgaXQgd2lsbCBub3QgbmVjZXNzYXJpbHkgdHJpZ2dlciBhbiBhZGRpdGlvbmFsXG4gICAqIHJlbmRlcmluZyBjeWNsZSAoYXMgbG9uZyBhcyB0aGUgYW1vdW50IG9mIGJ1ZmZlciBpcyBzdGlsbCBncmVhdGVyIHRoYW4gYG1pbkJ1ZmZlclB4YCkuXG4gICAqIERlZmF1bHRzIHRvIDIwMHB4LlxuICAgKi9cbiAgQElucHV0KClcbiAgZ2V0IG1heEJ1ZmZlclB4KCk6IG51bWJlciB7IHJldHVybiB0aGlzLl9tYXhCdWZmZXJQeDsgfVxuICBzZXQgbWF4QnVmZmVyUHgodmFsdWU6IG51bWJlcikgeyB0aGlzLl9tYXhCdWZmZXJQeCA9IGNvZXJjZU51bWJlclByb3BlcnR5KHZhbHVlKTsgfVxuICBfbWF4QnVmZmVyUHggPSAyMDA7XG5cbiAgLyoqIFRoZSBzY3JvbGwgc3RyYXRlZ3kgdXNlZCBieSB0aGlzIGRpcmVjdGl2ZS4gKi9cbiAgX3Njcm9sbFN0cmF0ZWd5ID0gbmV3IEF1dG9TaXplVmlydHVhbFNjcm9sbFN0cmF0ZWd5KHRoaXMubWluQnVmZmVyUHgsIHRoaXMubWF4QnVmZmVyUHgpO1xuXG4gIG5nT25DaGFuZ2VzKCkge1xuICAgIHRoaXMuX3Njcm9sbFN0cmF0ZWd5LnVwZGF0ZUJ1ZmZlclNpemUodGhpcy5taW5CdWZmZXJQeCwgdGhpcy5tYXhCdWZmZXJQeCk7XG4gIH1cblxuICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfbWluQnVmZmVyUHg6IE51bWJlcklucHV0O1xuICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfbWF4QnVmZmVyUHg6IE51bWJlcklucHV0O1xufVxuIl19