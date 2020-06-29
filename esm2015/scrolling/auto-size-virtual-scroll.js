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
export class ItemSizeAverager {
    /** @param defaultItemSize The default size to use for items when no data is available. */
    constructor(defaultItemSize = 50) {
        /** The total amount of weight behind the current average. */
        this._totalWeight = 0;
        this._defaultItemSize = defaultItemSize;
        this._averageItemSize = defaultItemSize;
    }
    /** Returns the average item size. */
    getAverageItemSize() {
        return this._averageItemSize;
    }
    /**
     * Adds a measurement sample for the estimator to consider.
     * @param range The measured range.
     * @param size The measured size of the given range in pixels.
     */
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
    /** Resets the averager. */
    reset() {
        this._averageItemSize = this._defaultItemSize;
        this._totalWeight = 0;
    }
}
/** Virtual scrolling strategy for lists with items of unknown or dynamic size. */
export class AutoSizeVirtualScrollStrategy {
    /**
     * @param minBufferPx The minimum amount of buffer rendered beyond the viewport (in pixels).
     *     If the amount of buffer dips below this number, more items will be rendered.
     * @param maxBufferPx The number of pixels worth of buffer to shoot for when rendering new items.
     *     If the actual amount turns out to be less it will not necessarily trigger an additional
     *     rendering cycle (as long as the amount of buffer is still greater than `minBufferPx`).
     * @param averager The averager used to estimate the size of unseen items.
     */
    constructor(minBufferPx, maxBufferPx, averager = new ItemSizeAverager()) {
        /** @docs-private Implemented as part of VirtualScrollStrategy. */
        this.scrolledIndexChange = new Observable(() => {
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
    attach(viewport) {
        this._averager.reset();
        this._viewport = viewport;
        this._renderContentForCurrentOffset();
    }
    /** Detaches this scroll strategy from the currently attached viewport. */
    detach() {
        this._viewport = null;
    }
    /** @docs-private Implemented as part of VirtualScrollStrategy. */
    onContentScrolled() {
        if (this._viewport) {
            this._updateRenderedContentAfterScroll();
        }
    }
    /** @docs-private Implemented as part of VirtualScrollStrategy. */
    onDataLengthChanged() {
        if (this._viewport) {
            this._renderContentForCurrentOffset();
            this._checkRenderedContentSize();
        }
    }
    /** @docs-private Implemented as part of VirtualScrollStrategy. */
    onContentRendered() {
        if (this._viewport) {
            this._checkRenderedContentSize();
        }
    }
    /** @docs-private Implemented as part of VirtualScrollStrategy. */
    onRenderedOffsetChanged() {
        if (this._viewport) {
            this._checkRenderedContentOffset();
        }
    }
    /** Scroll to the offset for the given index. */
    scrollToIndex() {
        // TODO(mmalerba): Implement.
        throw Error('cdk-virtual-scroll: scrollToIndex is currently not supported for the autosize'
            + ' scroll strategy');
    }
    /**
     * Update the buffer parameters.
     * @param minBufferPx The minimum amount of buffer rendered beyond the viewport (in pixels).
     * @param maxBufferPx The number of buffer items to render beyond the edge of the viewport (in
     *     pixels).
     */
    updateBufferSize(minBufferPx, maxBufferPx) {
        if (maxBufferPx < minBufferPx) {
            throw ('CDK virtual scroll: maxBufferPx must be greater than or equal to minBufferPx');
        }
        this._minBufferPx = minBufferPx;
        this._maxBufferPx = maxBufferPx;
    }
    /** Update the rendered content after the user scrolls. */
    _updateRenderedContentAfterScroll() {
        const viewport = this._viewport;
        // The current scroll offset.
        const scrollOffset = viewport.measureScrollOffset();
        // The delta between the current scroll offset and the previously recorded scroll offset.
        let scrollDelta = scrollOffset - this._lastScrollOffset;
        // The magnitude of the scroll delta.
        let scrollMagnitude = Math.abs(scrollDelta);
        // The currently rendered range.
        const renderedRange = viewport.getRenderedRange();
        // If we're scrolling toward the top, we need to account for the fact that the predicted amount
        // of content and the actual amount of scrollable space may differ. We address this by slowly
        // correcting the difference on each scroll event.
        let offsetCorrection = 0;
        if (scrollDelta < 0) {
            // The content offset we would expect based on the average item size.
            const predictedOffset = renderedRange.start * this._averager.getAverageItemSize();
            // The difference between the predicted size of the unrendered content at the beginning and
            // the actual available space to scroll over. We need to reduce this to zero by the time the
            // user scrolls to the top.
            // - 0 indicates that the predicted size and available space are the same.
            // - A negative number that the predicted size is smaller than the available space.
            // - A positive number indicates the predicted size is larger than the available space
            const offsetDifference = predictedOffset - this._lastRenderedContentOffset;
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
        const startBuffer = this._lastScrollOffset - this._lastRenderedContentOffset;
        // The current amount of buffer past the end of the viewport.
        const endBuffer = (this._lastRenderedContentOffset + this._lastRenderedContentSize) -
            (this._lastScrollOffset + viewport.getViewportSize());
        // The amount of unfilled space that should be filled on the side the user is scrolling toward
        // in order to safely absorb the scroll delta.
        const underscan = scrollMagnitude + this._minBufferPx -
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
                const addItems = Math.max(0, Math.ceil((underscan - this._minBufferPx + this._maxBufferPx) /
                    this._averager.getAverageItemSize()));
                // The amount of filled space beyond what is necessary on the side the user is scrolling
                // away from.
                const overscan = (scrollDelta < 0 ? endBuffer : startBuffer) - this._minBufferPx +
                    scrollMagnitude;
                // The number of currently rendered items to remove on the side the user is scrolling away
                // from. If removal has failed in recent cycles we are less aggressive in how much we try to
                // remove.
                const unboundedRemoveItems = Math.floor(overscan / this._averager.getAverageItemSize() / (this._removalFailures + 1));
                const removeItems = Math.min(renderedRange.end - renderedRange.start, Math.max(0, unboundedRemoveItems));
                // The new range we will tell the viewport to render. We first expand it to include the new
                // items we want rendered, we then contract the opposite side to remove items we no longer
                // want rendered.
                const range = this._expandRange(renderedRange, scrollDelta < 0 ? addItems : 0, scrollDelta > 0 ? addItems : 0);
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
                let contentOffset;
                let contentOffsetTo;
                if (scrollDelta < 0) {
                    let removedSize = viewport.measureRangeSize({
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
                    const removedSize = viewport.measureRangeSize({
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
    }
    /**
     * Checks the size of the currently rendered content and uses it to update the estimated item size
     * and estimated total content size.
     */
    _checkRenderedContentSize() {
        const viewport = this._viewport;
        this._lastRenderedContentSize = viewport.measureRenderedContentSize();
        this._averager.addSample(viewport.getRenderedRange(), this._lastRenderedContentSize);
        this._updateTotalContentSize(this._lastRenderedContentSize);
    }
    /** Checks the currently rendered content offset and saves the value for later use. */
    _checkRenderedContentOffset() {
        const viewport = this._viewport;
        this._lastRenderedContentOffset = viewport.getOffsetToRenderedContentStart();
    }
    /**
     * Recalculates the rendered content based on our estimate of what should be shown at the current
     * scroll offset.
     */
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
    // TODO: maybe move to base class, can probably share with fixed size strategy.
    /**
     * Gets the visible range of data for the given start index. If the start index is too close to
     * the end of the list it may be backed up to ensure the estimated size of the range is enough to
     * fill the viewport.
     * Note: must not be called if `this._viewport` is null
     * @param startIndex The index to start the range at
     * @return a range estimated to be large enough to fill the viewport when rendered.
     */
    _getVisibleRangeForIndex(startIndex) {
        const viewport = this._viewport;
        const range = {
            start: startIndex,
            end: startIndex +
                Math.ceil(viewport.getViewportSize() / this._averager.getAverageItemSize())
        };
        const extra = range.end - viewport.getDataLength();
        if (extra > 0) {
            range.start = Math.max(0, range.start - extra);
        }
        return range;
    }
    // TODO: maybe move to base class, can probably share with fixed size strategy.
    /**
     * Expand the given range by the given amount in either direction.
     * Note: must not be called if `this._viewport` is null
     * @param range The range to expand
     * @param expandStart The number of items to expand the start of the range by.
     * @param expandEnd The number of items to expand the end of the range by.
     * @return The expanded range.
     */
    _expandRange(range, expandStart, expandEnd) {
        const viewport = this._viewport;
        const start = Math.max(0, range.start - expandStart);
        const end = Math.min(viewport.getDataLength(), range.end + expandEnd);
        return { start, end };
    }
    /** Update the viewport's total content size. */
    _updateTotalContentSize(renderedContentSize) {
        const viewport = this._viewport;
        const renderedRange = viewport.getRenderedRange();
        const totalSize = renderedContentSize +
            (viewport.getDataLength() - (renderedRange.end - renderedRange.start)) *
                this._averager.getAverageItemSize();
        viewport.setTotalContentSize(totalSize);
    }
}
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
export class CdkAutoSizeVirtualScroll {
    constructor() {
        this._minBufferPx = 100;
        this._maxBufferPx = 200;
        /** The scroll strategy used by this directive. */
        this._scrollStrategy = new AutoSizeVirtualScrollStrategy(this.minBufferPx, this.maxBufferPx);
    }
    /**
     * The minimum amount of buffer rendered beyond the viewport (in pixels).
     * If the amount of buffer dips below this number, more items will be rendered. Defaults to 100px.
     */
    get minBufferPx() { return this._minBufferPx; }
    set minBufferPx(value) { this._minBufferPx = coerceNumberProperty(value); }
    /**
     * The number of pixels worth of buffer to shoot for when rendering new items.
     * If the actual amount turns out to be less it will not necessarily trigger an additional
     * rendering cycle (as long as the amount of buffer is still greater than `minBufferPx`).
     * Defaults to 200px.
     */
    get maxBufferPx() { return this._maxBufferPx; }
    set maxBufferPx(value) { this._maxBufferPx = coerceNumberProperty(value); }
    ngOnChanges() {
        this._scrollStrategy.updateBufferSize(this.minBufferPx, this.maxBufferPx);
    }
}
CdkAutoSizeVirtualScroll.decorators = [
    { type: Directive, args: [{
                selector: 'cdk-virtual-scroll-viewport[autosize]',
                providers: [{
                        provide: VIRTUAL_SCROLL_STRATEGY,
                        useFactory: _autoSizeVirtualScrollStrategyFactory,
                        deps: [forwardRef(() => CdkAutoSizeVirtualScroll)],
                    }],
            },] }
];
CdkAutoSizeVirtualScroll.propDecorators = {
    minBufferPx: [{ type: Input }],
    maxBufferPx: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0by1zaXplLXZpcnR1YWwtc2Nyb2xsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvc2Nyb2xsaW5nL2F1dG8tc2l6ZS12aXJ0dWFsLXNjcm9sbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsb0JBQW9CLEVBQWMsTUFBTSx1QkFBdUIsQ0FBQztBQUV4RSxPQUFPLEVBRUwsdUJBQXVCLEVBRXhCLE1BQU0sd0JBQXdCLENBQUM7QUFDaEMsT0FBTyxFQUFDLFNBQVMsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFZLE1BQU0sZUFBZSxDQUFDO0FBQ3RFLE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFHaEM7OztHQUdHO0FBQ0gsTUFBTSxPQUFPLGdCQUFnQjtJQVUzQiwwRkFBMEY7SUFDMUYsWUFBWSxlQUFlLEdBQUcsRUFBRTtRQVZoQyw2REFBNkQ7UUFDckQsaUJBQVksR0FBRyxDQUFDLENBQUM7UUFVdkIsSUFBSSxDQUFDLGdCQUFnQixHQUFHLGVBQWUsQ0FBQztRQUN4QyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsZUFBZSxDQUFDO0lBQzFDLENBQUM7SUFFRCxxQ0FBcUM7SUFDckMsa0JBQWtCO1FBQ2hCLE9BQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDO0lBQy9CLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsU0FBUyxDQUFDLEtBQWdCLEVBQUUsSUFBWTtRQUN0QyxNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQyxHQUFHLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQztRQUNuRSxJQUFJLGNBQWMsRUFBRTtZQUNsQixNQUFNLGtCQUFrQixHQUNwQixDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLGNBQWMsQ0FBQztZ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dGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtjb2VyY2VOdW1iZXJQcm9wZXJ0eSwgTnVtYmVySW5wdXR9IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2VyY2lvbic7XG5pbXBvcnQge0xpc3RSYW5nZX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvbGxlY3Rpb25zJztcbmltcG9ydCB7XG4gIENka1ZpcnR1YWxTY3JvbGxWaWV3cG9ydCxcbiAgVklSVFVBTF9TQ1JPTExfU1RSQVRFR1ksXG4gIFZpcnR1YWxTY3JvbGxTdHJhdGVneVxufSBmcm9tICdAYW5ndWxhci9jZGsvc2Nyb2xsaW5nJztcbmltcG9ydCB7RGlyZWN0aXZlLCBmb3J3YXJkUmVmLCBJbnB1dCwgT25DaGFuZ2VzfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7T2JzZXJ2YWJsZX0gZnJvbSAncnhqcyc7XG5cblxuLyoqXG4gKiBBIGNsYXNzIHRoYXQgdHJhY2tzIHRoZSBzaXplIG9mIGl0ZW1zIHRoYXQgaGF2ZSBiZWVuIHNlZW4gYW5kIHVzZXMgaXQgdG8gZXN0aW1hdGUgdGhlIGF2ZXJhZ2VcbiAqIGl0ZW0gc2l6ZS5cbiAqL1xuZXhwb3J0IGNsYXNzIEl0ZW1TaXplQXZlcmFnZXIge1xuICAvKiogVGhlIHRvdGFsIGFtb3VudCBvZiB3ZWlnaHQgYmVoaW5kIHRoZSBjdXJyZW50IGF2ZXJhZ2UuICovXG4gIHByaXZhdGUgX3RvdGFsV2VpZ2h0ID0gMDtcblxuICAvKiogVGhlIGN1cnJlbnQgYXZlcmFnZSBpdGVtIHNpemUuICovXG4gIHByaXZhdGUgX2F2ZXJhZ2VJdGVtU2l6ZTogbnVtYmVyO1xuXG4gIC8qKiBUaGUgZGVmYXVsdCBzaXplIHRvIHVzZSBmb3IgaXRlbXMgd2hlbiBubyBkYXRhIGlzIGF2YWlsYWJsZS4gKi9cbiAgcHJpdmF0ZSBfZGVmYXVsdEl0ZW1TaXplOiBudW1iZXI7XG5cbiAgLyoqIEBwYXJhbSBkZWZhdWx0SXRlbVNpemUgVGhlIGRlZmF1bHQgc2l6ZSB0byB1c2UgZm9yIGl0ZW1zIHdoZW4gbm8gZGF0YSBpcyBhdmFpbGFibGUuICovXG4gIGNvbnN0cnVjdG9yKGRlZmF1bHRJdGVtU2l6ZSA9IDUwKSB7XG4gICAgdGhpcy5fZGVmYXVsdEl0ZW1TaXplID0gZGVmYXVsdEl0ZW1TaXplO1xuICAgIHRoaXMuX2F2ZXJhZ2VJdGVtU2l6ZSA9IGRlZmF1bHRJdGVtU2l6ZTtcbiAgfVxuXG4gIC8qKiBSZXR1cm5zIHRoZSBhdmVyYWdlIGl0ZW0gc2l6ZS4gKi9cbiAgZ2V0QXZlcmFnZUl0ZW1TaXplKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX2F2ZXJhZ2VJdGVtU2l6ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGEgbWVhc3VyZW1lbnQgc2FtcGxlIGZvciB0aGUgZXN0aW1hdG9yIHRvIGNvbnNpZGVyLlxuICAgKiBAcGFyYW0gcmFuZ2UgVGhlIG1lYXN1cmVkIHJhbmdlLlxuICAgKiBAcGFyYW0gc2l6ZSBUaGUgbWVhc3VyZWQgc2l6ZSBvZiB0aGUgZ2l2ZW4gcmFuZ2UgaW4gcGl4ZWxzLlxuICAgKi9cbiAgYWRkU2FtcGxlKHJhbmdlOiBMaXN0UmFuZ2UsIHNpemU6IG51bWJlcikge1xuICAgIGNvbnN0IG5ld1RvdGFsV2VpZ2h0ID0gdGhpcy5fdG90YWxXZWlnaHQgKyByYW5nZS5lbmQgLSByYW5nZS5zdGFydDtcbiAgICBpZiAobmV3VG90YWxXZWlnaHQpIHtcbiAgICAgIGNvbnN0IG5ld0F2ZXJhZ2VJdGVtU2l6ZSA9XG4gICAgICAgICAgKHNpemUgKyB0aGlzLl9hdmVyYWdlSXRlbVNpemUgKiB0aGlzLl90b3RhbFdlaWdodCkgLyBuZXdUb3RhbFdlaWdodDtcbiAgICAgIGlmIChuZXdBdmVyYWdlSXRlbVNpemUpIHtcbiAgICAgICAgdGhpcy5fYXZlcmFnZUl0ZW1TaXplID0gbmV3QXZlcmFnZUl0ZW1TaXplO1xuICAgICAgICB0aGlzLl90b3RhbFdlaWdodCA9IG5ld1RvdGFsV2VpZ2h0O1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKiBSZXNldHMgdGhlIGF2ZXJhZ2VyLiAqL1xuICByZXNldCgpIHtcbiAgICB0aGlzLl9hdmVyYWdlSXRlbVNpemUgPSB0aGlzLl9kZWZhdWx0SXRlbVNpemU7XG4gICAgdGhpcy5fdG90YWxXZWlnaHQgPSAwO1xuICB9XG59XG5cblxuLyoqIFZpcnR1YWwgc2Nyb2xsaW5nIHN0cmF0ZWd5IGZvciBsaXN0cyB3aXRoIGl0ZW1zIG9mIHVua25vd24gb3IgZHluYW1pYyBzaXplLiAqL1xuZXhwb3J0IGNsYXNzIEF1dG9TaXplVmlydHVhbFNjcm9sbFN0cmF0ZWd5IGltcGxlbWVudHMgVmlydHVhbFNjcm9sbFN0cmF0ZWd5IHtcbiAgLyoqIEBkb2NzLXByaXZhdGUgSW1wbGVtZW50ZWQgYXMgcGFydCBvZiBWaXJ0dWFsU2Nyb2xsU3RyYXRlZ3kuICovXG4gIHNjcm9sbGVkSW5kZXhDaGFuZ2UgPSBuZXcgT2JzZXJ2YWJsZTxudW1iZXI+KCgpID0+IHtcbiAgICAvLyBUT0RPKG1tYWxlcmJhKTogSW1wbGVtZW50LlxuICAgIHRocm93IEVycm9yKCdjZGstdmlydHVhbC1zY3JvbGw6IHNjcm9sbGVkSW5kZXhDaGFuZ2UgaXMgY3VycmVudGx5IG5vdCBzdXBwb3J0ZWQgZm9yIHRoZScgK1xuICAgICAgICAnIGF1dG9zaXplIHNjcm9sbCBzdHJhdGVneScpO1xuICB9KTtcblxuICAvKiogVGhlIGF0dGFjaGVkIHZpZXdwb3J0LiAqL1xuICBwcml2YXRlIF92aWV3cG9ydDogQ2RrVmlydHVhbFNjcm9sbFZpZXdwb3J0IHwgbnVsbCA9IG51bGw7XG5cbiAgLyoqIFRoZSBtaW5pbXVtIGFtb3VudCBvZiBidWZmZXIgcmVuZGVyZWQgYmV5b25kIHRoZSB2aWV3cG9ydCAoaW4gcGl4ZWxzKS4gKi9cbiAgcHJpdmF0ZSBfbWluQnVmZmVyUHg6IG51bWJlcjtcblxuICAvKiogVGhlIG51bWJlciBvZiBidWZmZXIgaXRlbXMgdG8gcmVuZGVyIGJleW9uZCB0aGUgZWRnZSBvZiB0aGUgdmlld3BvcnQgKGluIHBpeGVscykuICovXG4gIHByaXZhdGUgX21heEJ1ZmZlclB4OiBudW1iZXI7XG5cbiAgLyoqIFRoZSBlc3RpbWF0b3IgdXNlZCB0byBlc3RpbWF0ZSB0aGUgc2l6ZSBvZiB1bnNlZW4gaXRlbXMuICovXG4gIHByaXZhdGUgX2F2ZXJhZ2VyOiBJdGVtU2l6ZUF2ZXJhZ2VyO1xuXG4gIC8qKiBUaGUgbGFzdCBtZWFzdXJlZCBzY3JvbGwgb2Zmc2V0IG9mIHRoZSB2aWV3cG9ydC4gKi9cbiAgcHJpdmF0ZSBfbGFzdFNjcm9sbE9mZnNldDogbnVtYmVyO1xuXG4gIC8qKiBUaGUgbGFzdCBtZWFzdXJlZCBzaXplIG9mIHRoZSByZW5kZXJlZCBjb250ZW50IGluIHRoZSB2aWV3cG9ydC4gKi9cbiAgcHJpdmF0ZSBfbGFzdFJlbmRlcmVkQ29udGVudFNpemU6IG51bWJlcjtcblxuICAvKiogVGhlIGxhc3QgbWVhc3VyZWQgc2l6ZSBvZiB0aGUgcmVuZGVyZWQgY29udGVudCBpbiB0aGUgdmlld3BvcnQuICovXG4gIHByaXZhdGUgX2xhc3RSZW5kZXJlZENvbnRlbnRPZmZzZXQ6IG51bWJlcjtcblxuICAvKipcbiAgICogVGhlIG51bWJlciBvZiBjb25zZWN1dGl2ZSBjeWNsZXMgd2hlcmUgcmVtb3ZpbmcgZXh0cmEgaXRlbXMgaGFzIGZhaWxlZC4gRmFpbHVyZSBoZXJlIG1lYW5zIHRoYXRcbiAgICogd2UgZXN0aW1hdGVkIGhvdyBtYW55IGl0ZW1zIHdlIGNvdWxkIHNhZmVseSByZW1vdmUsIGJ1dCBvdXIgZXN0aW1hdGUgdHVybmVkIG91dCB0byBiZSB0b28gbXVjaFxuICAgKiBhbmQgaXQgd2Fzbid0IHNhZmUgdG8gcmVtb3ZlIHRoYXQgbWFueSBlbGVtZW50cy5cbiAgICovXG4gIHByaXZhdGUgX3JlbW92YWxGYWlsdXJlcyA9IDA7XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBtaW5CdWZmZXJQeCBUaGUgbWluaW11bSBhbW91bnQgb2YgYnVmZmVyIHJlbmRlcmVkIGJleW9uZCB0aGUgdmlld3BvcnQgKGluIHBpeGVscykuXG4gICAqICAgICBJZiB0aGUgYW1vdW50IG9mIGJ1ZmZlciBkaXBzIGJlbG93IHRoaXMgbnVtYmVyLCBtb3JlIGl0ZW1zIHdpbGwgYmUgcmVuZGVyZWQuXG4gICAqIEBwYXJhbSBtYXhCdWZmZXJQeCBUaGUgbnVtYmVyIG9mIHBpeGVscyB3b3J0aCBvZiBidWZmZXIgdG8gc2hvb3QgZm9yIHdoZW4gcmVuZGVyaW5nIG5ldyBpdGVtcy5cbiAgICogICAgIElmIHRoZSBhY3R1YWwgYW1vdW50IHR1cm5zIG91dCB0byBiZSBsZXNzIGl0IHdpbGwgbm90IG5lY2Vzc2FyaWx5IHRyaWdnZXIgYW4gYWRkaXRpb25hbFxuICAgKiAgICAgcmVuZGVyaW5nIGN5Y2xlIChhcyBsb25nIGFzIHRoZSBhbW91bnQgb2YgYnVmZmVyIGlzIHN0aWxsIGdyZWF0ZXIgdGhhbiBgbWluQnVmZmVyUHhgKS5cbiAgICogQHBhcmFtIGF2ZXJhZ2VyIFRoZSBhdmVyYWdlciB1c2VkIHRvIGVzdGltYXRlIHRoZSBzaXplIG9mIHVuc2VlbiBpdGVtcy5cbiAgICovXG4gIGNvbnN0cnVjdG9yKG1pbkJ1ZmZlclB4OiBudW1iZXIsIG1heEJ1ZmZlclB4OiBudW1iZXIsIGF2ZXJhZ2VyID0gbmV3IEl0ZW1TaXplQXZlcmFnZXIoKSkge1xuICAgIHRoaXMuX21pbkJ1ZmZlclB4ID0gbWluQnVmZmVyUHg7XG4gICAgdGhpcy5fbWF4QnVmZmVyUHggPSBtYXhCdWZmZXJQeDtcbiAgICB0aGlzLl9hdmVyYWdlciA9IGF2ZXJhZ2VyO1xuICB9XG5cbiAgLyoqXG4gICAqIEF0dGFjaGVzIHRoaXMgc2Nyb2xsIHN0cmF0ZWd5IHRvIGEgdmlld3BvcnQuXG4gICAqIEBwYXJhbSB2aWV3cG9ydCBUaGUgdmlld3BvcnQgdG8gYXR0YWNoIHRoaXMgc3RyYXRlZ3kgdG8uXG4gICAqL1xuICBhdHRhY2godmlld3BvcnQ6IENka1ZpcnR1YWxTY3JvbGxWaWV3cG9ydCkge1xuICAgIHRoaXMuX2F2ZXJhZ2VyLnJlc2V0KCk7XG4gICAgdGhpcy5fdmlld3BvcnQgPSB2aWV3cG9ydDtcbiAgICB0aGlzLl9yZW5kZXJDb250ZW50Rm9yQ3VycmVudE9mZnNldCgpO1xuICB9XG5cbiAgLyoqIERldGFjaGVzIHRoaXMgc2Nyb2xsIHN0cmF0ZWd5IGZyb20gdGhlIGN1cnJlbnRseSBhdHRhY2hlZCB2aWV3cG9ydC4gKi9cbiAgZGV0YWNoKCkge1xuICAgIHRoaXMuX3ZpZXdwb3J0ID0gbnVsbDtcbiAgfVxuXG4gIC8qKiBAZG9jcy1wcml2YXRlIEltcGxlbWVudGVkIGFzIHBhcnQgb2YgVmlydHVhbFNjcm9sbFN0cmF0ZWd5LiAqL1xuICBvbkNvbnRlbnRTY3JvbGxlZCgpIHtcbiAgICBpZiAodGhpcy5fdmlld3BvcnQpIHtcbiAgICAgIHRoaXMuX3VwZGF0ZVJlbmRlcmVkQ29udGVudEFmdGVyU2Nyb2xsKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBkb2NzLXByaXZhdGUgSW1wbGVtZW50ZWQgYXMgcGFydCBvZiBWaXJ0dWFsU2Nyb2xsU3RyYXRlZ3kuICovXG4gIG9uRGF0YUxlbmd0aENoYW5nZWQoKSB7XG4gICAgaWYgKHRoaXMuX3ZpZXdwb3J0KSB7XG4gICAgICB0aGlzLl9yZW5kZXJDb250ZW50Rm9yQ3VycmVudE9mZnNldCgpO1xuICAgICAgdGhpcy5fY2hlY2tSZW5kZXJlZENvbnRlbnRTaXplKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBkb2NzLXByaXZhdGUgSW1wbGVtZW50ZWQgYXMgcGFydCBvZiBWaXJ0dWFsU2Nyb2xsU3RyYXRlZ3kuICovXG4gIG9uQ29udGVudFJlbmRlcmVkKCkge1xuICAgIGlmICh0aGlzLl92aWV3cG9ydCkge1xuICAgICAgdGhpcy5fY2hlY2tSZW5kZXJlZENvbnRlbnRTaXplKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBkb2NzLXByaXZhdGUgSW1wbGVtZW50ZWQgYXMgcGFydCBvZiBWaXJ0dWFsU2Nyb2xsU3RyYXRlZ3kuICovXG4gIG9uUmVuZGVyZWRPZmZzZXRDaGFuZ2VkKCkge1xuICAgIGlmICh0aGlzLl92aWV3cG9ydCkge1xuICAgICAgdGhpcy5fY2hlY2tSZW5kZXJlZENvbnRlbnRPZmZzZXQoKTtcbiAgICB9XG4gIH1cblxuICAvKiogU2Nyb2xsIHRvIHRoZSBvZmZzZXQgZm9yIHRoZSBnaXZlbiBpbmRleC4gKi9cbiAgc2Nyb2xsVG9JbmRleCgpOiB2b2lkIHtcbiAgICAvLyBUT0RPKG1tYWxlcmJhKTogSW1wbGVtZW50LlxuICAgIHRocm93IEVycm9yKCdjZGstdmlydHVhbC1zY3JvbGw6IHNjcm9sbFRvSW5kZXggaXMgY3VycmVudGx5IG5vdCBzdXBwb3J0ZWQgZm9yIHRoZSBhdXRvc2l6ZSdcbiAgICAgICAgKyAnIHNjcm9sbCBzdHJhdGVneScpO1xuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZSB0aGUgYnVmZmVyIHBhcmFtZXRlcnMuXG4gICAqIEBwYXJhbSBtaW5CdWZmZXJQeCBUaGUgbWluaW11bSBhbW91bnQgb2YgYnVmZmVyIHJlbmRlcmVkIGJleW9uZCB0aGUgdmlld3BvcnQgKGluIHBpeGVscykuXG4gICAqIEBwYXJhbSBtYXhCdWZmZXJQeCBUaGUgbnVtYmVyIG9mIGJ1ZmZlciBpdGVtcyB0byByZW5kZXIgYmV5b25kIHRoZSBlZGdlIG9mIHRoZSB2aWV3cG9ydCAoaW5cbiAgICogICAgIHBpeGVscykuXG4gICAqL1xuICB1cGRhdGVCdWZmZXJTaXplKG1pbkJ1ZmZlclB4OiBudW1iZXIsIG1heEJ1ZmZlclB4OiBudW1iZXIpIHtcbiAgICBpZiAobWF4QnVmZmVyUHggPCBtaW5CdWZmZXJQeCkge1xuICAgICAgdGhyb3coJ0NESyB2aXJ0dWFsIHNjcm9sbDogbWF4QnVmZmVyUHggbXVzdCBiZSBncmVhdGVyIHRoYW4gb3IgZXF1YWwgdG8gbWluQnVmZmVyUHgnKTtcbiAgICB9XG4gICAgdGhpcy5fbWluQnVmZmVyUHggPSBtaW5CdWZmZXJQeDtcbiAgICB0aGlzLl9tYXhCdWZmZXJQeCA9IG1heEJ1ZmZlclB4O1xuICB9XG5cbiAgLyoqIFVwZGF0ZSB0aGUgcmVuZGVyZWQgY29udGVudCBhZnRlciB0aGUgdXNlciBzY3JvbGxzLiAqL1xuICBwcml2YXRlIF91cGRhdGVSZW5kZXJlZENvbnRlbnRBZnRlclNjcm9sbCgpIHtcbiAgICBjb25zdCB2aWV3cG9ydCA9IHRoaXMuX3ZpZXdwb3J0ITtcblxuICAgIC8vIFRoZSBjdXJyZW50IHNjcm9sbCBvZmZzZXQuXG4gICAgY29uc3Qgc2Nyb2xsT2Zmc2V0ID0gdmlld3BvcnQubWVhc3VyZVNjcm9sbE9mZnNldCgpO1xuICAgIC8vIFRoZSBkZWx0YSBiZXR3ZWVuIHRoZSBjdXJyZW50IHNjcm9sbCBvZmZzZXQgYW5kIHRoZSBwcmV2aW91c2x5IHJlY29yZGVkIHNjcm9sbCBvZmZzZXQuXG4gICAgbGV0IHNjcm9sbERlbHRhID0gc2Nyb2xsT2Zmc2V0IC0gdGhpcy5fbGFzdFNjcm9sbE9mZnNldDtcbiAgICAvLyBUaGUgbWFnbml0dWRlIG9mIHRoZSBzY3JvbGwgZGVsdGEuXG4gICAgbGV0IHNjcm9sbE1hZ25pdHVkZSA9IE1hdGguYWJzKHNjcm9sbERlbHRhKTtcblxuICAgIC8vIFRoZSBjdXJyZW50bHkgcmVuZGVyZWQgcmFuZ2UuXG4gICAgY29uc3QgcmVuZGVyZWRSYW5nZSA9IHZpZXdwb3J0LmdldFJlbmRlcmVkUmFuZ2UoKTtcblxuICAgIC8vIElmIHdlJ3JlIHNjcm9sbGluZyB0b3dhcmQgdGhlIHRvcCwgd2UgbmVlZCB0byBhY2NvdW50IGZvciB0aGUgZmFjdCB0aGF0IHRoZSBwcmVkaWN0ZWQgYW1vdW50XG4gICAgLy8gb2YgY29udGVudCBhbmQgdGhlIGFjdHVhbCBhbW91bnQgb2Ygc2Nyb2xsYWJsZSBzcGFjZSBtYXkgZGlmZmVyLiBXZSBhZGRyZXNzIHRoaXMgYnkgc2xvd2x5XG4gICAgLy8gY29ycmVjdGluZyB0aGUgZGlmZmVyZW5jZSBvbiBlYWNoIHNjcm9sbCBldmVudC5cbiAgICBsZXQgb2Zmc2V0Q29ycmVjdGlvbiA9IDA7XG4gICAgaWYgKHNjcm9sbERlbHRhIDwgMCkge1xuICAgICAgLy8gVGhlIGNvbnRlbnQgb2Zmc2V0IHdlIHdvdWxkIGV4cGVjdCBiYXNlZCBvbiB0aGUgYXZlcmFnZSBpdGVtIHNpemUuXG4gICAgICBjb25zdCBwcmVkaWN0ZWRPZmZzZXQgPSByZW5kZXJlZFJhbmdlLnN0YXJ0ICogdGhpcy5fYXZlcmFnZXIuZ2V0QXZlcmFnZUl0ZW1TaXplKCk7XG4gICAgICAvLyBUaGUgZGlmZmVyZW5jZSBiZXR3ZWVuIHRoZSBwcmVkaWN0ZWQgc2l6ZSBvZiB0aGUgdW5yZW5kZXJlZCBjb250ZW50IGF0IHRoZSBiZWdpbm5pbmcgYW5kXG4gICAgICAvLyB0aGUgYWN0dWFsIGF2YWlsYWJsZSBzcGFjZSB0byBzY3JvbGwgb3Zlci4gV2UgbmVlZCB0byByZWR1Y2UgdGhpcyB0byB6ZXJvIGJ5IHRoZSB0aW1lIHRoZVxuICAgICAgLy8gdXNlciBzY3JvbGxzIHRvIHRoZSB0b3AuXG4gICAgICAvLyAtIDAgaW5kaWNhdGVzIHRoYXQgdGhlIHByZWRpY3RlZCBzaXplIGFuZCBhdmFpbGFibGUgc3BhY2UgYXJlIHRoZSBzYW1lLlxuICAgICAgLy8gLSBBIG5lZ2F0aXZlIG51bWJlciB0aGF0IHRoZSBwcmVkaWN0ZWQgc2l6ZSBpcyBzbWFsbGVyIHRoYW4gdGhlIGF2YWlsYWJsZSBzcGFjZS5cbiAgICAgIC8vIC0gQSBwb3NpdGl2ZSBudW1iZXIgaW5kaWNhdGVzIHRoZSBwcmVkaWN0ZWQgc2l6ZSBpcyBsYXJnZXIgdGhhbiB0aGUgYXZhaWxhYmxlIHNwYWNlXG4gICAgICBjb25zdCBvZmZzZXREaWZmZXJlbmNlID0gcHJlZGljdGVkT2Zmc2V0IC0gdGhpcy5fbGFzdFJlbmRlcmVkQ29udGVudE9mZnNldDtcbiAgICAgIC8vIFRoZSBhbW91bnQgb2YgZGlmZmVyZW5jZSB0byBjb3JyZWN0IGR1cmluZyB0aGlzIHNjcm9sbCBldmVudC4gV2UgY2FsY3VsYXRlIHRoaXMgYXMgYVxuICAgICAgLy8gcGVyY2VudGFnZSBvZiB0aGUgdG90YWwgZGlmZmVyZW5jZSBiYXNlZCBvbiB0aGUgcGVyY2VudGFnZSBvZiB0aGUgZGlzdGFuY2UgdG93YXJkIHRoZSB0b3BcbiAgICAgIC8vIHRoYXQgdGhlIHVzZXIgc2Nyb2xsZWQuXG4gICAgICBvZmZzZXRDb3JyZWN0aW9uID0gTWF0aC5yb3VuZChvZmZzZXREaWZmZXJlbmNlICpcbiAgICAgICAgICBNYXRoLm1heCgwLCBNYXRoLm1pbigxLCBzY3JvbGxNYWduaXR1ZGUgLyAoc2Nyb2xsT2Zmc2V0ICsgc2Nyb2xsTWFnbml0dWRlKSkpKTtcblxuICAgICAgLy8gQmFzZWQgb24gdGhlIG9mZnNldCBjb3JyZWN0aW9uIGFib3ZlLCB3ZSBwcmV0ZW5kIHRoYXQgdGhlIHNjcm9sbCBkZWx0YSB3YXMgYmlnZ2VyIG9yXG4gICAgICAvLyBzbWFsbGVyIHRoYW4gaXQgYWN0dWFsbHkgd2FzLCB0aGlzIHdheSB3ZSBjYW4gc3RhcnQgdG8gZWxpbWluYXRlIHRoZSBkaWZmZXJlbmNlLlxuICAgICAgc2Nyb2xsRGVsdGEgPSBzY3JvbGxEZWx0YSAtIG9mZnNldENvcnJlY3Rpb247XG4gICAgICBzY3JvbGxNYWduaXR1ZGUgPSBNYXRoLmFicyhzY3JvbGxEZWx0YSk7XG4gICAgfVxuXG4gICAgLy8gVGhlIGN1cnJlbnQgYW1vdW50IG9mIGJ1ZmZlciBwYXN0IHRoZSBzdGFydCBvZiB0aGUgdmlld3BvcnQuXG4gICAgY29uc3Qgc3RhcnRCdWZmZXIgPSB0aGlzLl9sYXN0U2Nyb2xsT2Zmc2V0IC0gdGhpcy5fbGFzdFJlbmRlcmVkQ29udGVudE9mZnNldDtcbiAgICAvLyBUaGUgY3VycmVudCBhbW91bnQgb2YgYnVmZmVyIHBhc3QgdGhlIGVuZCBvZiB0aGUgdmlld3BvcnQuXG4gICAgY29uc3QgZW5kQnVmZmVyID0gKHRoaXMuX2xhc3RSZW5kZXJlZENvbnRlbnRPZmZzZXQgKyB0aGlzLl9sYXN0UmVuZGVyZWRDb250ZW50U2l6ZSkgLVxuICAgICAgICAodGhpcy5fbGFzdFNjcm9sbE9mZnNldCArIHZpZXdwb3J0LmdldFZpZXdwb3J0U2l6ZSgpKTtcbiAgICAvLyBUaGUgYW1vdW50IG9mIHVuZmlsbGVkIHNwYWNlIHRoYXQgc2hvdWxkIGJlIGZpbGxlZCBvbiB0aGUgc2lkZSB0aGUgdXNlciBpcyBzY3JvbGxpbmcgdG93YXJkXG4gICAgLy8gaW4gb3JkZXIgdG8gc2FmZWx5IGFic29yYiB0aGUgc2Nyb2xsIGRlbHRhLlxuICAgIGNvbnN0IHVuZGVyc2NhbiA9IHNjcm9sbE1hZ25pdHVkZSArIHRoaXMuX21pbkJ1ZmZlclB4IC1cbiAgICAgICAgKHNjcm9sbERlbHRhIDwgMCA/IHN0YXJ0QnVmZmVyIDogZW5kQnVmZmVyKTtcblxuICAgIC8vIENoZWNrIGlmIHRoZXJlJ3MgdW5maWxsZWQgc3BhY2UgdGhhdCB3ZSBuZWVkIHRvIHJlbmRlciBuZXcgZWxlbWVudHMgdG8gZmlsbC5cbiAgICBpZiAodW5kZXJzY2FuID4gMCkge1xuICAgICAgLy8gQ2hlY2sgaWYgdGhlIHNjcm9sbCBtYWduaXR1ZGUgd2FzIGxhcmdlciB0aGFuIHRoZSB2aWV3cG9ydCBzaXplLiBJbiB0aGlzIGNhc2UgdGhlIHVzZXJcbiAgICAgIC8vIHdvbid0IG5vdGljZSBhIGRpc2NvbnRpbnVpdHkgaWYgd2UganVzdCBqdW1wIHRvIHRoZSBuZXcgZXN0aW1hdGVkIHBvc2l0aW9uIGluIHRoZSBsaXN0LlxuICAgICAgLy8gSG93ZXZlciwgaWYgdGhlIHNjcm9sbCBtYWduaXR1ZGUgaXMgc21hbGxlciB0aGFuIHRoZSB2aWV3cG9ydCB0aGUgdXNlciBtaWdodCBub3RpY2Ugc29tZVxuICAgICAgLy8gaml0dGVyaW5lc3MgaWYgd2UganVzdCBqdW1wIHRvIHRoZSBlc3RpbWF0ZWQgcG9zaXRpb24uIEluc3RlYWQgd2UgbWFrZSBzdXJlIHRvIHNjcm9sbCBieVxuICAgICAgLy8gdGhlIHNhbWUgbnVtYmVyIG9mIHBpeGVscyBhcyB0aGUgc2Nyb2xsIG1hZ25pdHVkZS5cbiAgICAgIGlmIChzY3JvbGxNYWduaXR1ZGUgPj0gdmlld3BvcnQuZ2V0Vmlld3BvcnRTaXplKCkpIHtcbiAgICAgICAgdGhpcy5fcmVuZGVyQ29udGVudEZvckN1cnJlbnRPZmZzZXQoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFRoZSBudW1iZXIgb2YgbmV3IGl0ZW1zIHRvIHJlbmRlciBvbiB0aGUgc2lkZSB0aGUgdXNlciBpcyBzY3JvbGxpbmcgdG93YXJkcy4gUmF0aGVyIHRoYW5cbiAgICAgICAgLy8ganVzdCBmaWxsaW5nIHRoZSB1bmRlcnNjYW4gc3BhY2UsIHdlIGFjdHVhbGx5IGZpbGwgZW5vdWdoIHRvIGhhdmUgYSBidWZmZXIgc2l6ZSBvZlxuICAgICAgICAvLyBgbWF4QnVmZmVyUHhgLiBUaGlzIGdpdmVzIHVzIGEgbGl0dGxlIHdpZ2dsZSByb29tIGluIGNhc2Ugb3VyIGl0ZW0gc2l6ZSBlc3RpbWF0ZSBpcyBvZmYuXG4gICAgICAgIGNvbnN0IGFkZEl0ZW1zID0gTWF0aC5tYXgoMCwgTWF0aC5jZWlsKCh1bmRlcnNjYW4gLSB0aGlzLl9taW5CdWZmZXJQeCArIHRoaXMuX21heEJ1ZmZlclB4KSAvXG4gICAgICAgICAgICB0aGlzLl9hdmVyYWdlci5nZXRBdmVyYWdlSXRlbVNpemUoKSkpO1xuICAgICAgICAvLyBUaGUgYW1vdW50IG9mIGZpbGxlZCBzcGFjZSBiZXlvbmQgd2hhdCBpcyBuZWNlc3Nhcnkgb24gdGhlIHNpZGUgdGhlIHVzZXIgaXMgc2Nyb2xsaW5nXG4gICAgICAgIC8vIGF3YXkgZnJvbS5cbiAgICAgICAgY29uc3Qgb3ZlcnNjYW4gPSAoc2Nyb2xsRGVsdGEgPCAwID8gZW5kQnVmZmVyIDogc3RhcnRCdWZmZXIpIC0gdGhpcy5fbWluQnVmZmVyUHggK1xuICAgICAgICAgICAgc2Nyb2xsTWFnbml0dWRlO1xuICAgICAgICAvLyBUaGUgbnVtYmVyIG9mIGN1cnJlbnRseSByZW5kZXJlZCBpdGVtcyB0byByZW1vdmUgb24gdGhlIHNpZGUgdGhlIHVzZXIgaXMgc2Nyb2xsaW5nIGF3YXlcbiAgICAgICAgLy8gZnJvbS4gSWYgcmVtb3ZhbCBoYXMgZmFpbGVkIGluIHJlY2VudCBjeWNsZXMgd2UgYXJlIGxlc3MgYWdncmVzc2l2ZSBpbiBob3cgbXVjaCB3ZSB0cnkgdG9cbiAgICAgICAgLy8gcmVtb3ZlLlxuICAgICAgICBjb25zdCB1bmJvdW5kZWRSZW1vdmVJdGVtcyA9IE1hdGguZmxvb3IoXG4gICAgICAgICAgICBvdmVyc2NhbiAvIHRoaXMuX2F2ZXJhZ2VyLmdldEF2ZXJhZ2VJdGVtU2l6ZSgpIC8gKHRoaXMuX3JlbW92YWxGYWlsdXJlcyArIDEpKTtcbiAgICAgICAgY29uc3QgcmVtb3ZlSXRlbXMgPVxuICAgICAgICAgICAgTWF0aC5taW4ocmVuZGVyZWRSYW5nZS5lbmQgLSByZW5kZXJlZFJhbmdlLnN0YXJ0LCBNYXRoLm1heCgwLCB1bmJvdW5kZWRSZW1vdmVJdGVtcykpO1xuXG4gICAgICAgIC8vIFRoZSBuZXcgcmFuZ2Ugd2Ugd2lsbCB0ZWxsIHRoZSB2aWV3cG9ydCB0byByZW5kZXIuIFdlIGZpcnN0IGV4cGFuZCBpdCB0byBpbmNsdWRlIHRoZSBuZXdcbiAgICAgICAgLy8gaXRlbXMgd2Ugd2FudCByZW5kZXJlZCwgd2UgdGhlbiBjb250cmFjdCB0aGUgb3Bwb3NpdGUgc2lkZSB0byByZW1vdmUgaXRlbXMgd2Ugbm8gbG9uZ2VyXG4gICAgICAgIC8vIHdhbnQgcmVuZGVyZWQuXG4gICAgICAgIGNvbnN0IHJhbmdlID0gdGhpcy5fZXhwYW5kUmFuZ2UoXG4gICAgICAgICAgICByZW5kZXJlZFJhbmdlLCBzY3JvbGxEZWx0YSA8IDAgPyBhZGRJdGVtcyA6IDAsIHNjcm9sbERlbHRhID4gMCA/IGFkZEl0ZW1zIDogMCk7XG4gICAgICAgIGlmIChzY3JvbGxEZWx0YSA8IDApIHtcbiAgICAgICAgICByYW5nZS5lbmQgPSBNYXRoLm1heChyYW5nZS5zdGFydCArIDEsIHJhbmdlLmVuZCAtIHJlbW92ZUl0ZW1zKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByYW5nZS5zdGFydCA9IE1hdGgubWluKHJhbmdlLmVuZCAtIDEsIHJhbmdlLnN0YXJ0ICsgcmVtb3ZlSXRlbXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVGhlIG5ldyBvZmZzZXQgd2Ugd2FudCB0byBzZXQgb24gdGhlIHJlbmRlcmVkIGNvbnRlbnQuIFRvIGRldGVybWluZSB0aGlzIHdlIG1lYXN1cmUgdGhlXG4gICAgICAgIC8vIG51bWJlciBvZiBwaXhlbHMgd2UgcmVtb3ZlZCBhbmQgdGhlbiBhZGp1c3QgdGhlIG9mZnNldCB0byB0aGUgc3RhcnQgb2YgdGhlIHJlbmRlcmVkXG4gICAgICAgIC8vIGNvbnRlbnQgb3IgdG8gdGhlIGVuZCBvZiB0aGUgcmVuZGVyZWQgY29udGVudCBhY2NvcmRpbmdseSAod2hpY2hldmVyIG9uZSBkb2Vzbid0IHJlcXVpcmVcbiAgICAgICAgLy8gdGhhdCB0aGUgbmV3bHkgYWRkZWQgaXRlbXMgdG8gYmUgcmVuZGVyZWQgdG8gY2FsY3VsYXRlLilcbiAgICAgICAgbGV0IGNvbnRlbnRPZmZzZXQ6IG51bWJlcjtcbiAgICAgICAgbGV0IGNvbnRlbnRPZmZzZXRUbzogJ3RvLXN0YXJ0JyB8ICd0by1lbmQnO1xuICAgICAgICBpZiAoc2Nyb2xsRGVsdGEgPCAwKSB7XG4gICAgICAgICAgbGV0IHJlbW92ZWRTaXplID0gdmlld3BvcnQubWVhc3VyZVJhbmdlU2l6ZSh7XG4gICAgICAgICAgICBzdGFydDogcmFuZ2UuZW5kLFxuICAgICAgICAgICAgZW5kOiByZW5kZXJlZFJhbmdlLmVuZCxcbiAgICAgICAgICB9KTtcbiAgICAgICAgICAvLyBDaGVjayB0aGF0IHdlJ3JlIG5vdCByZW1vdmluZyB0b28gbXVjaC5cbiAgICAgICAgICBpZiAocmVtb3ZlZFNpemUgPD0gb3ZlcnNjYW4pIHtcbiAgICAgICAgICAgIGNvbnRlbnRPZmZzZXQgPVxuICAgICAgICAgICAgICAgIHRoaXMuX2xhc3RSZW5kZXJlZENvbnRlbnRPZmZzZXQgKyB0aGlzLl9sYXN0UmVuZGVyZWRDb250ZW50U2l6ZSAtIHJlbW92ZWRTaXplO1xuICAgICAgICAgICAgdGhpcy5fcmVtb3ZhbEZhaWx1cmVzID0gMDtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gSWYgdGhlIHJlbW92YWwgaXMgbW9yZSB0aGFuIHRoZSBvdmVyc2NhbiBjYW4gYWJzb3JiIGp1c3QgdW5kbyBpdCBhbmQgcmVjb3JkIHRoZSBmYWN0XG4gICAgICAgICAgICAvLyB0aGF0IHRoZSByZW1vdmFsIGZhaWxlZCBzbyB3ZSBjYW4gYmUgbGVzcyBhZ2dyZXNzaXZlIG5leHQgdGltZS5cbiAgICAgICAgICAgIHJhbmdlLmVuZCA9IHJlbmRlcmVkUmFuZ2UuZW5kO1xuICAgICAgICAgICAgY29udGVudE9mZnNldCA9IHRoaXMuX2xhc3RSZW5kZXJlZENvbnRlbnRPZmZzZXQgKyB0aGlzLl9sYXN0UmVuZGVyZWRDb250ZW50U2l6ZTtcbiAgICAgICAgICAgIHRoaXMuX3JlbW92YWxGYWlsdXJlcysrO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb250ZW50T2Zmc2V0VG8gPSAndG8tZW5kJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zdCByZW1vdmVkU2l6ZSA9IHZpZXdwb3J0Lm1lYXN1cmVSYW5nZVNpemUoe1xuICAgICAgICAgICAgc3RhcnQ6IHJlbmRlcmVkUmFuZ2Uuc3RhcnQsXG4gICAgICAgICAgICBlbmQ6IHJhbmdlLnN0YXJ0LFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIC8vIENoZWNrIHRoYXQgd2UncmUgbm90IHJlbW92aW5nIHRvbyBtdWNoLlxuICAgICAgICAgIGlmIChyZW1vdmVkU2l6ZSA8PSBvdmVyc2Nhbikge1xuICAgICAgICAgICAgY29udGVudE9mZnNldCA9IHRoaXMuX2xhc3RSZW5kZXJlZENvbnRlbnRPZmZzZXQgKyByZW1vdmVkU2l6ZTtcbiAgICAgICAgICAgIHRoaXMuX3JlbW92YWxGYWlsdXJlcyA9IDA7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIElmIHRoZSByZW1vdmFsIGlzIG1vcmUgdGhhbiB0aGUgb3ZlcnNjYW4gY2FuIGFic29yYiBqdXN0IHVuZG8gaXQgYW5kIHJlY29yZCB0aGUgZmFjdFxuICAgICAgICAgICAgLy8gdGhhdCB0aGUgcmVtb3ZhbCBmYWlsZWQgc28gd2UgY2FuIGJlIGxlc3MgYWdncmVzc2l2ZSBuZXh0IHRpbWUuXG4gICAgICAgICAgICByYW5nZS5zdGFydCA9IHJlbmRlcmVkUmFuZ2Uuc3RhcnQ7XG4gICAgICAgICAgICBjb250ZW50T2Zmc2V0ID0gdGhpcy5fbGFzdFJlbmRlcmVkQ29udGVudE9mZnNldDtcbiAgICAgICAgICAgIHRoaXMuX3JlbW92YWxGYWlsdXJlcysrO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb250ZW50T2Zmc2V0VG8gPSAndG8tc3RhcnQnO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gU2V0IHRoZSByYW5nZSBhbmQgb2Zmc2V0IHdlIGNhbGN1bGF0ZWQgYWJvdmUuXG4gICAgICAgIHZpZXdwb3J0LnNldFJlbmRlcmVkUmFuZ2UocmFuZ2UpO1xuICAgICAgICB2aWV3cG9ydC5zZXRSZW5kZXJlZENvbnRlbnRPZmZzZXQoY29udGVudE9mZnNldCArIG9mZnNldENvcnJlY3Rpb24sIGNvbnRlbnRPZmZzZXRUbyk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChvZmZzZXRDb3JyZWN0aW9uKSB7XG4gICAgICAvLyBFdmVuIGlmIHRoZSByZW5kZXJlZCByYW5nZSBkaWRuJ3QgY2hhbmdlLCB3ZSBtYXkgc3RpbGwgbmVlZCB0byBhZGp1c3QgdGhlIGNvbnRlbnQgb2Zmc2V0IHRvXG4gICAgICAvLyBzaW11bGF0ZSBzY3JvbGxpbmcgc2xpZ2h0bHkgc2xvd2VyIG9yIGZhc3RlciB0aGFuIHRoZSB1c2VyIGFjdHVhbGx5IHNjcm9sbGVkLlxuICAgICAgdmlld3BvcnQuc2V0UmVuZGVyZWRDb250ZW50T2Zmc2V0KHRoaXMuX2xhc3RSZW5kZXJlZENvbnRlbnRPZmZzZXQgKyBvZmZzZXRDb3JyZWN0aW9uKTtcbiAgICB9XG5cbiAgICAvLyBTYXZlIHRoZSBzY3JvbGwgb2Zmc2V0IHRvIGJlIGNvbXBhcmVkIHRvIHRoZSBuZXcgdmFsdWUgb24gdGhlIG5leHQgc2Nyb2xsIGV2ZW50LlxuICAgIHRoaXMuX2xhc3RTY3JvbGxPZmZzZXQgPSBzY3JvbGxPZmZzZXQ7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIHRoZSBzaXplIG9mIHRoZSBjdXJyZW50bHkgcmVuZGVyZWQgY29udGVudCBhbmQgdXNlcyBpdCB0byB1cGRhdGUgdGhlIGVzdGltYXRlZCBpdGVtIHNpemVcbiAgICogYW5kIGVzdGltYXRlZCB0b3RhbCBjb250ZW50IHNpemUuXG4gICAqL1xuICBwcml2YXRlIF9jaGVja1JlbmRlcmVkQ29udGVudFNpemUoKSB7XG4gICAgY29uc3Qgdmlld3BvcnQgPSB0aGlzLl92aWV3cG9ydCE7XG4gICAgdGhpcy5fbGFzdFJlbmRlcmVkQ29udGVudFNpemUgPSB2aWV3cG9ydC5tZWFzdXJlUmVuZGVyZWRDb250ZW50U2l6ZSgpO1xuICAgIHRoaXMuX2F2ZXJhZ2VyLmFkZFNhbXBsZSh2aWV3cG9ydC5nZXRSZW5kZXJlZFJhbmdlKCksIHRoaXMuX2xhc3RSZW5kZXJlZENvbnRlbnRTaXplKTtcbiAgICB0aGlzLl91cGRhdGVUb3RhbENvbnRlbnRTaXplKHRoaXMuX2xhc3RSZW5kZXJlZENvbnRlbnRTaXplKTtcbiAgfVxuXG4gIC8qKiBDaGVja3MgdGhlIGN1cnJlbnRseSByZW5kZXJlZCBjb250ZW50IG9mZnNldCBhbmQgc2F2ZXMgdGhlIHZhbHVlIGZvciBsYXRlciB1c2UuICovXG4gIHByaXZhdGUgX2NoZWNrUmVuZGVyZWRDb250ZW50T2Zmc2V0KCkge1xuICAgIGNvbnN0IHZpZXdwb3J0ID0gdGhpcy5fdmlld3BvcnQhO1xuICAgIHRoaXMuX2xhc3RSZW5kZXJlZENvbnRlbnRPZmZzZXQgPSB2aWV3cG9ydC5nZXRPZmZzZXRUb1JlbmRlcmVkQ29udGVudFN0YXJ0KCkhO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlY2FsY3VsYXRlcyB0aGUgcmVuZGVyZWQgY29udGVudCBiYXNlZCBvbiBvdXIgZXN0aW1hdGUgb2Ygd2hhdCBzaG91bGQgYmUgc2hvd24gYXQgdGhlIGN1cnJlbnRcbiAgICogc2Nyb2xsIG9mZnNldC5cbiAgICovXG4gIHByaXZhdGUgX3JlbmRlckNvbnRlbnRGb3JDdXJyZW50T2Zmc2V0KCkge1xuICAgIGNvbnN0IHZpZXdwb3J0ID0gdGhpcy5fdmlld3BvcnQhO1xuICAgIGNvbnN0IHNjcm9sbE9mZnNldCA9IHZpZXdwb3J0Lm1lYXN1cmVTY3JvbGxPZmZzZXQoKTtcbiAgICB0aGlzLl9sYXN0U2Nyb2xsT2Zmc2V0ID0gc2Nyb2xsT2Zmc2V0O1xuICAgIHRoaXMuX3JlbW92YWxGYWlsdXJlcyA9IDA7XG5cbiAgICBjb25zdCBpdGVtU2l6ZSA9IHRoaXMuX2F2ZXJhZ2VyLmdldEF2ZXJhZ2VJdGVtU2l6ZSgpO1xuICAgIGNvbnN0IGZpcnN0VmlzaWJsZUluZGV4ID1cbiAgICAgICAgTWF0aC5taW4odmlld3BvcnQuZ2V0RGF0YUxlbmd0aCgpIC0gMSwgTWF0aC5mbG9vcihzY3JvbGxPZmZzZXQgLyBpdGVtU2l6ZSkpO1xuICAgIGNvbnN0IGJ1ZmZlclNpemUgPSBNYXRoLmNlaWwodGhpcy5fbWF4QnVmZmVyUHggLyBpdGVtU2l6ZSk7XG4gICAgY29uc3QgcmFuZ2UgPSB0aGlzLl9leHBhbmRSYW5nZShcbiAgICAgICAgdGhpcy5fZ2V0VmlzaWJsZVJhbmdlRm9ySW5kZXgoZmlyc3RWaXNpYmxlSW5kZXgpLCBidWZmZXJTaXplLCBidWZmZXJTaXplKTtcblxuICAgIHZpZXdwb3J0LnNldFJlbmRlcmVkUmFuZ2UocmFuZ2UpO1xuICAgIHZpZXdwb3J0LnNldFJlbmRlcmVkQ29udGVudE9mZnNldChpdGVtU2l6ZSAqIHJhbmdlLnN0YXJ0KTtcbiAgfVxuXG4gIC8vIFRPRE86IG1heWJlIG1vdmUgdG8gYmFzZSBjbGFzcywgY2FuIHByb2JhYmx5IHNoYXJlIHdpdGggZml4ZWQgc2l6ZSBzdHJhdGVneS5cbiAgLyoqXG4gICAqIEdldHMgdGhlIHZpc2libGUgcmFuZ2Ugb2YgZGF0YSBmb3IgdGhlIGdpdmVuIHN0YXJ0IGluZGV4LiBJZiB0aGUgc3RhcnQgaW5kZXggaXMgdG9vIGNsb3NlIHRvXG4gICAqIHRoZSBlbmQgb2YgdGhlIGxpc3QgaXQgbWF5IGJlIGJhY2tlZCB1cCB0byBlbnN1cmUgdGhlIGVzdGltYXRlZCBzaXplIG9mIHRoZSByYW5nZSBpcyBlbm91Z2ggdG9cbiAgICogZmlsbCB0aGUgdmlld3BvcnQuXG4gICAqIE5vdGU6IG11c3Qgbm90IGJlIGNhbGxlZCBpZiBgdGhpcy5fdmlld3BvcnRgIGlzIG51bGxcbiAgICogQHBhcmFtIHN0YXJ0SW5kZXggVGhlIGluZGV4IHRvIHN0YXJ0IHRoZSByYW5nZSBhdFxuICAgKiBAcmV0dXJuIGEgcmFuZ2UgZXN0aW1hdGVkIHRvIGJlIGxhcmdlIGVub3VnaCB0byBmaWxsIHRoZSB2aWV3cG9ydCB3aGVuIHJlbmRlcmVkLlxuICAgKi9cbiAgcHJpdmF0ZSBfZ2V0VmlzaWJsZVJhbmdlRm9ySW5kZXgoc3RhcnRJbmRleDogbnVtYmVyKTogTGlzdFJhbmdlIHtcbiAgICBjb25zdCB2aWV3cG9ydCA9IHRoaXMuX3ZpZXdwb3J0ITtcbiAgICBjb25zdCByYW5nZTogTGlzdFJhbmdlID0ge1xuICAgICAgc3RhcnQ6IHN0YXJ0SW5kZXgsXG4gICAgICBlbmQ6IHN0YXJ0SW5kZXggK1xuICAgICAgICAgIE1hdGguY2VpbCh2aWV3cG9ydC5nZXRWaWV3cG9ydFNpemUoKSAvIHRoaXMuX2F2ZXJhZ2VyLmdldEF2ZXJhZ2VJdGVtU2l6ZSgpKVxuICAgIH07XG4gICAgY29uc3QgZXh0cmEgPSByYW5nZS5lbmQgLSB2aWV3cG9ydC5nZXREYXRhTGVuZ3RoKCk7XG4gICAgaWYgKGV4dHJhID4gMCkge1xuICAgICAgcmFuZ2Uuc3RhcnQgPSBNYXRoLm1heCgwLCByYW5nZS5zdGFydCAtIGV4dHJhKTtcbiAgICB9XG4gICAgcmV0dXJuIHJhbmdlO1xuICB9XG5cbiAgLy8gVE9ETzogbWF5YmUgbW92ZSB0byBiYXNlIGNsYXNzLCBjYW4gcHJvYmFibHkgc2hhcmUgd2l0aCBmaXhlZCBzaXplIHN0cmF0ZWd5LlxuICAvKipcbiAgICogRXhwYW5kIHRoZSBnaXZlbiByYW5nZSBieSB0aGUgZ2l2ZW4gYW1vdW50IGluIGVpdGhlciBkaXJlY3Rpb24uXG4gICAqIE5vdGU6IG11c3Qgbm90IGJlIGNhbGxlZCBpZiBgdGhpcy5fdmlld3BvcnRgIGlzIG51bGxcbiAgICogQHBhcmFtIHJhbmdlIFRoZSByYW5nZSB0byBleHBhbmRcbiAgICogQHBhcmFtIGV4cGFuZFN0YXJ0IFRoZSBudW1iZXIgb2YgaXRlbXMgdG8gZXhwYW5kIHRoZSBzdGFydCBvZiB0aGUgcmFuZ2UgYnkuXG4gICAqIEBwYXJhbSBleHBhbmRFbmQgVGhlIG51bWJlciBvZiBpdGVtcyB0byBleHBhbmQgdGhlIGVuZCBvZiB0aGUgcmFuZ2UgYnkuXG4gICAqIEByZXR1cm4gVGhlIGV4cGFuZGVkIHJhbmdlLlxuICAgKi9cbiAgcHJpdmF0ZSBfZXhwYW5kUmFuZ2UocmFuZ2U6IExpc3RSYW5nZSwgZXhwYW5kU3RhcnQ6IG51bWJlciwgZXhwYW5kRW5kOiBudW1iZXIpOiBMaXN0UmFuZ2Uge1xuICAgIGNvbnN0IHZpZXdwb3J0ID0gdGhpcy5fdmlld3BvcnQhO1xuICAgIGNvbnN0IHN0YXJ0ID0gTWF0aC5tYXgoMCwgcmFuZ2Uuc3RhcnQgLSBleHBhbmRTdGFydCk7XG4gICAgY29uc3QgZW5kID0gTWF0aC5taW4odmlld3BvcnQuZ2V0RGF0YUxlbmd0aCgpLCByYW5nZS5lbmQgKyBleHBhbmRFbmQpO1xuICAgIHJldHVybiB7c3RhcnQsIGVuZH07XG4gIH1cblxuICAvKiogVXBkYXRlIHRoZSB2aWV3cG9ydCdzIHRvdGFsIGNvbnRlbnQgc2l6ZS4gKi9cbiAgcHJpdmF0ZSBfdXBkYXRlVG90YWxDb250ZW50U2l6ZShyZW5kZXJlZENvbnRlbnRTaXplOiBudW1iZXIpIHtcbiAgICBjb25zdCB2aWV3cG9ydCA9IHRoaXMuX3ZpZXdwb3J0ITtcbiAgICBjb25zdCByZW5kZXJlZFJhbmdlID0gdmlld3BvcnQuZ2V0UmVuZGVyZWRSYW5nZSgpO1xuICAgIGNvbnN0IHRvdGFsU2l6ZSA9IHJlbmRlcmVkQ29udGVudFNpemUgK1xuICAgICAgICAodmlld3BvcnQuZ2V0RGF0YUxlbmd0aCgpIC0gKHJlbmRlcmVkUmFuZ2UuZW5kIC0gcmVuZGVyZWRSYW5nZS5zdGFydCkpICpcbiAgICAgICAgdGhpcy5fYXZlcmFnZXIuZ2V0QXZlcmFnZUl0ZW1TaXplKCk7XG4gICAgdmlld3BvcnQuc2V0VG90YWxDb250ZW50U2l6ZSh0b3RhbFNpemUpO1xuICB9XG59XG5cbi8qKlxuICogUHJvdmlkZXIgZmFjdG9yeSBmb3IgYEF1dG9TaXplVmlydHVhbFNjcm9sbFN0cmF0ZWd5YCB0aGF0IHNpbXBseSBleHRyYWN0cyB0aGUgYWxyZWFkeSBjcmVhdGVkXG4gKiBgQXV0b1NpemVWaXJ0dWFsU2Nyb2xsU3RyYXRlZ3lgIGZyb20gdGhlIGdpdmVuIGRpcmVjdGl2ZS5cbiAqIEBwYXJhbSBhdXRvU2l6ZURpciBUaGUgaW5zdGFuY2Ugb2YgYENka0F1dG9TaXplVmlydHVhbFNjcm9sbGAgdG8gZXh0cmFjdCB0aGVcbiAqICAgICBgQXV0b1NpemVWaXJ0dWFsU2Nyb2xsU3RyYXRlZ3lgIGZyb20uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBfYXV0b1NpemVWaXJ0dWFsU2Nyb2xsU3RyYXRlZ3lGYWN0b3J5KGF1dG9TaXplRGlyOiBDZGtBdXRvU2l6ZVZpcnR1YWxTY3JvbGwpIHtcbiAgcmV0dXJuIGF1dG9TaXplRGlyLl9zY3JvbGxTdHJhdGVneTtcbn1cblxuXG4vKiogQSB2aXJ0dWFsIHNjcm9sbCBzdHJhdGVneSB0aGF0IHN1cHBvcnRzIHVua25vd24gb3IgZHluYW1pYyBzaXplIGl0ZW1zLiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnY2RrLXZpcnR1YWwtc2Nyb2xsLXZpZXdwb3J0W2F1dG9zaXplXScsXG4gIHByb3ZpZGVyczogW3tcbiAgICBwcm92aWRlOiBWSVJUVUFMX1NDUk9MTF9TVFJBVEVHWSxcbiAgICB1c2VGYWN0b3J5OiBfYXV0b1NpemVWaXJ0dWFsU2Nyb2xsU3RyYXRlZ3lGYWN0b3J5LFxuICAgIGRlcHM6IFtmb3J3YXJkUmVmKCgpID0+IENka0F1dG9TaXplVmlydHVhbFNjcm9sbCldLFxuICB9XSxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrQXV0b1NpemVWaXJ0dWFsU2Nyb2xsIGltcGxlbWVudHMgT25DaGFuZ2VzIHtcbiAgLyoqXG4gICAqIFRoZSBtaW5pbXVtIGFtb3VudCBvZiBidWZmZXIgcmVuZGVyZWQgYmV5b25kIHRoZSB2aWV3cG9ydCAoaW4gcGl4ZWxzKS5cbiAgICogSWYgdGhlIGFtb3VudCBvZiBidWZmZXIgZGlwcyBiZWxvdyB0aGlzIG51bWJlciwgbW9yZSBpdGVtcyB3aWxsIGJlIHJlbmRlcmVkLiBEZWZhdWx0cyB0byAxMDBweC5cbiAgICovXG4gIEBJbnB1dCgpXG4gIGdldCBtaW5CdWZmZXJQeCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5fbWluQnVmZmVyUHg7IH1cbiAgc2V0IG1pbkJ1ZmZlclB4KHZhbHVlOiBudW1iZXIpIHsgdGhpcy5fbWluQnVmZmVyUHggPSBjb2VyY2VOdW1iZXJQcm9wZXJ0eSh2YWx1ZSk7IH1cbiAgX21pbkJ1ZmZlclB4ID0gMTAwO1xuXG4gIC8qKlxuICAgKiBUaGUgbnVtYmVyIG9mIHBpeGVscyB3b3J0aCBvZiBidWZmZXIgdG8gc2hvb3QgZm9yIHdoZW4gcmVuZGVyaW5nIG5ldyBpdGVtcy5cbiAgICogSWYgdGhlIGFjdHVhbCBhbW91bnQgdHVybnMgb3V0IHRvIGJlIGxlc3MgaXQgd2lsbCBub3QgbmVjZXNzYXJpbHkgdHJpZ2dlciBhbiBhZGRpdGlvbmFsXG4gICAqIHJlbmRlcmluZyBjeWNsZSAoYXMgbG9uZyBhcyB0aGUgYW1vdW50IG9mIGJ1ZmZlciBpcyBzdGlsbCBncmVhdGVyIHRoYW4gYG1pbkJ1ZmZlclB4YCkuXG4gICAqIERlZmF1bHRzIHRvIDIwMHB4LlxuICAgKi9cbiAgQElucHV0KClcbiAgZ2V0IG1heEJ1ZmZlclB4KCk6IG51bWJlciB7IHJldHVybiB0aGlzLl9tYXhCdWZmZXJQeDsgfVxuICBzZXQgbWF4QnVmZmVyUHgodmFsdWU6IG51bWJlcikgeyB0aGlzLl9tYXhCdWZmZXJQeCA9IGNvZXJjZU51bWJlclByb3BlcnR5KHZhbHVlKTsgfVxuICBfbWF4QnVmZmVyUHggPSAyMDA7XG5cbiAgLyoqIFRoZSBzY3JvbGwgc3RyYXRlZ3kgdXNlZCBieSB0aGlzIGRpcmVjdGl2ZS4gKi9cbiAgX3Njcm9sbFN0cmF0ZWd5ID0gbmV3IEF1dG9TaXplVmlydHVhbFNjcm9sbFN0cmF0ZWd5KHRoaXMubWluQnVmZmVyUHgsIHRoaXMubWF4QnVmZmVyUHgpO1xuXG4gIG5nT25DaGFuZ2VzKCkge1xuICAgIHRoaXMuX3Njcm9sbFN0cmF0ZWd5LnVwZGF0ZUJ1ZmZlclNpemUodGhpcy5taW5CdWZmZXJQeCwgdGhpcy5tYXhCdWZmZXJQeCk7XG4gIH1cblxuICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfbWluQnVmZmVyUHg6IE51bWJlcklucHV0O1xuICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfbWF4QnVmZmVyUHg6IE51bWJlcklucHV0O1xufVxuIl19