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
let CdkAutoSizeVirtualScroll = /** @class */ (() => {
    class CdkAutoSizeVirtualScroll {
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
    return CdkAutoSizeVirtualScroll;
})();
export { CdkAutoSizeVirtualScroll };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0by1zaXplLXZpcnR1YWwtc2Nyb2xsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvc2Nyb2xsaW5nL2F1dG8tc2l6ZS12aXJ0dWFsLXNjcm9sbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsb0JBQW9CLEVBQWMsTUFBTSx1QkFBdUIsQ0FBQztBQUV4RSxPQUFPLEVBRUwsdUJBQXVCLEVBRXhCLE1BQU0sd0JBQXdCLENBQUM7QUFDaEMsT0FBTyxFQUFDLFNBQVMsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFZLE1BQU0sZUFBZSxDQUFDO0FBQ3RFLE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFHaEM7OztHQUdHO0FBQ0gsTUFBTSxPQUFPLGdCQUFnQjtJQVUzQiwwRkFBMEY7SUFDMUYsWUFBWSxlQUFlLEdBQUcsRUFBRTtRQVZoQyw2REFBNkQ7UUFDckQsaUJBQVksR0FBRyxDQUFDLENBQUM7UUFVdkIsSUFBSSxDQUFDLGdCQUFnQixHQUFHLGVBQWUsQ0FBQztRQUN4QyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsZUFBZSxDQUFDO0lBQzFDLENBQUM7SUFFRCxxQ0FBcUM7SUFDckMsa0JBQWtCO1FBQ2hCLE9BQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDO0lBQy9CLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsU0FBUyxDQUFDLEtBQWdCLEVBQUUsSUFBWTtRQUN0QyxNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQyxHQUFHLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQztRQUNuRSxJQUFJLGNBQWMsRUFBRTtZQUNsQixNQUFNLGtCQUFrQixHQUNwQixDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLGNBQWMsQ0FBQztZ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QztLQUFBO1NBOUJZLHdCQUF3QiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2NvZXJjZU51bWJlclByb3BlcnR5LCBOdW1iZXJJbnB1dH0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvZXJjaW9uJztcbmltcG9ydCB7TGlzdFJhbmdlfSBmcm9tICdAYW5ndWxhci9jZGsvY29sbGVjdGlvbnMnO1xuaW1wb3J0IHtcbiAgQ2RrVmlydHVhbFNjcm9sbFZpZXdwb3J0LFxuICBWSVJUVUFMX1NDUk9MTF9TVFJBVEVHWSxcbiAgVmlydHVhbFNjcm9sbFN0cmF0ZWd5XG59IGZyb20gJ0Bhbmd1bGFyL2Nkay9zY3JvbGxpbmcnO1xuaW1wb3J0IHtEaXJlY3RpdmUsIGZvcndhcmRSZWYsIElucHV0LCBPbkNoYW5nZXN9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtPYnNlcnZhYmxlfSBmcm9tICdyeGpzJztcblxuXG4vKipcbiAqIEEgY2xhc3MgdGhhdCB0cmFja3MgdGhlIHNpemUgb2YgaXRlbXMgdGhhdCBoYXZlIGJlZW4gc2VlbiBhbmQgdXNlcyBpdCB0byBlc3RpbWF0ZSB0aGUgYXZlcmFnZVxuICogaXRlbSBzaXplLlxuICovXG5leHBvcnQgY2xhc3MgSXRlbVNpemVBdmVyYWdlciB7XG4gIC8qKiBUaGUgdG90YWwgYW1vdW50IG9mIHdlaWdodCBiZWhpbmQgdGhlIGN1cnJlbnQgYXZlcmFnZS4gKi9cbiAgcHJpdmF0ZSBfdG90YWxXZWlnaHQgPSAwO1xuXG4gIC8qKiBUaGUgY3VycmVudCBhdmVyYWdlIGl0ZW0gc2l6ZS4gKi9cbiAgcHJpdmF0ZSBfYXZlcmFnZUl0ZW1TaXplOiBudW1iZXI7XG5cbiAgLyoqIFRoZSBkZWZhdWx0IHNpemUgdG8gdXNlIGZvciBpdGVtcyB3aGVuIG5vIGRhdGEgaXMgYXZhaWxhYmxlLiAqL1xuICBwcml2YXRlIF9kZWZhdWx0SXRlbVNpemU6IG51bWJlcjtcblxuICAvKiogQHBhcmFtIGRlZmF1bHRJdGVtU2l6ZSBUaGUgZGVmYXVsdCBzaXplIHRvIHVzZSBmb3IgaXRlbXMgd2hlbiBubyBkYXRhIGlzIGF2YWlsYWJsZS4gKi9cbiAgY29uc3RydWN0b3IoZGVmYXVsdEl0ZW1TaXplID0gNTApIHtcbiAgICB0aGlzLl9kZWZhdWx0SXRlbVNpemUgPSBkZWZhdWx0SXRlbVNpemU7XG4gICAgdGhpcy5fYXZlcmFnZUl0ZW1TaXplID0gZGVmYXVsdEl0ZW1TaXplO1xuICB9XG5cbiAgLyoqIFJldHVybnMgdGhlIGF2ZXJhZ2UgaXRlbSBzaXplLiAqL1xuICBnZXRBdmVyYWdlSXRlbVNpemUoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fYXZlcmFnZUl0ZW1TaXplO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgYSBtZWFzdXJlbWVudCBzYW1wbGUgZm9yIHRoZSBlc3RpbWF0b3IgdG8gY29uc2lkZXIuXG4gICAqIEBwYXJhbSByYW5nZSBUaGUgbWVhc3VyZWQgcmFuZ2UuXG4gICAqIEBwYXJhbSBzaXplIFRoZSBtZWFzdXJlZCBzaXplIG9mIHRoZSBnaXZlbiByYW5nZSBpbiBwaXhlbHMuXG4gICAqL1xuICBhZGRTYW1wbGUocmFuZ2U6IExpc3RSYW5nZSwgc2l6ZTogbnVtYmVyKSB7XG4gICAgY29uc3QgbmV3VG90YWxXZWlnaHQgPSB0aGlzLl90b3RhbFdlaWdodCArIHJhbmdlLmVuZCAtIHJhbmdlLnN0YXJ0O1xuICAgIGlmIChuZXdUb3RhbFdlaWdodCkge1xuICAgICAgY29uc3QgbmV3QXZlcmFnZUl0ZW1TaXplID1cbiAgICAgICAgICAoc2l6ZSArIHRoaXMuX2F2ZXJhZ2VJdGVtU2l6ZSAqIHRoaXMuX3RvdGFsV2VpZ2h0KSAvIG5ld1RvdGFsV2VpZ2h0O1xuICAgICAgaWYgKG5ld0F2ZXJhZ2VJdGVtU2l6ZSkge1xuICAgICAgICB0aGlzLl9hdmVyYWdlSXRlbVNpemUgPSBuZXdBdmVyYWdlSXRlbVNpemU7XG4gICAgICAgIHRoaXMuX3RvdGFsV2VpZ2h0ID0gbmV3VG90YWxXZWlnaHQ7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqIFJlc2V0cyB0aGUgYXZlcmFnZXIuICovXG4gIHJlc2V0KCkge1xuICAgIHRoaXMuX2F2ZXJhZ2VJdGVtU2l6ZSA9IHRoaXMuX2RlZmF1bHRJdGVtU2l6ZTtcbiAgICB0aGlzLl90b3RhbFdlaWdodCA9IDA7XG4gIH1cbn1cblxuXG4vKiogVmlydHVhbCBzY3JvbGxpbmcgc3RyYXRlZ3kgZm9yIGxpc3RzIHdpdGggaXRlbXMgb2YgdW5rbm93biBvciBkeW5hbWljIHNpemUuICovXG5leHBvcnQgY2xhc3MgQXV0b1NpemVWaXJ0dWFsU2Nyb2xsU3RyYXRlZ3kgaW1wbGVtZW50cyBWaXJ0dWFsU2Nyb2xsU3RyYXRlZ3kge1xuICAvKiogQGRvY3MtcHJpdmF0ZSBJbXBsZW1lbnRlZCBhcyBwYXJ0IG9mIFZpcnR1YWxTY3JvbGxTdHJhdGVneS4gKi9cbiAgc2Nyb2xsZWRJbmRleENoYW5nZSA9IG5ldyBPYnNlcnZhYmxlPG51bWJlcj4oKCkgPT4ge1xuICAgIC8vIFRPRE8obW1hbGVyYmEpOiBJbXBsZW1lbnQuXG4gICAgdGhyb3cgRXJyb3IoJ2Nkay12aXJ0dWFsLXNjcm9sbDogc2Nyb2xsZWRJbmRleENoYW5nZSBpcyBjdXJyZW50bHkgbm90IHN1cHBvcnRlZCBmb3IgdGhlJyArXG4gICAgICAgICcgYXV0b3NpemUgc2Nyb2xsIHN0cmF0ZWd5Jyk7XG4gIH0pO1xuXG4gIC8qKiBUaGUgYXR0YWNoZWQgdmlld3BvcnQuICovXG4gIHByaXZhdGUgX3ZpZXdwb3J0OiBDZGtWaXJ0dWFsU2Nyb2xsVmlld3BvcnQgfCBudWxsID0gbnVsbDtcblxuICAvKiogVGhlIG1pbmltdW0gYW1vdW50IG9mIGJ1ZmZlciByZW5kZXJlZCBiZXlvbmQgdGhlIHZpZXdwb3J0IChpbiBwaXhlbHMpLiAqL1xuICBwcml2YXRlIF9taW5CdWZmZXJQeDogbnVtYmVyO1xuXG4gIC8qKiBUaGUgbnVtYmVyIG9mIGJ1ZmZlciBpdGVtcyB0byByZW5kZXIgYmV5b25kIHRoZSBlZGdlIG9mIHRoZSB2aWV3cG9ydCAoaW4gcGl4ZWxzKS4gKi9cbiAgcHJpdmF0ZSBfbWF4QnVmZmVyUHg6IG51bWJlcjtcblxuICAvKiogVGhlIGVzdGltYXRvciB1c2VkIHRvIGVzdGltYXRlIHRoZSBzaXplIG9mIHVuc2VlbiBpdGVtcy4gKi9cbiAgcHJpdmF0ZSBfYXZlcmFnZXI6IEl0ZW1TaXplQXZlcmFnZXI7XG5cbiAgLyoqIFRoZSBsYXN0IG1lYXN1cmVkIHNjcm9sbCBvZmZzZXQgb2YgdGhlIHZpZXdwb3J0LiAqL1xuICBwcml2YXRlIF9sYXN0U2Nyb2xsT2Zmc2V0OiBudW1iZXI7XG5cbiAgLyoqIFRoZSBsYXN0IG1lYXN1cmVkIHNpemUgb2YgdGhlIHJlbmRlcmVkIGNvbnRlbnQgaW4gdGhlIHZpZXdwb3J0LiAqL1xuICBwcml2YXRlIF9sYXN0UmVuZGVyZWRDb250ZW50U2l6ZTogbnVtYmVyO1xuXG4gIC8qKiBUaGUgbGFzdCBtZWFzdXJlZCBzaXplIG9mIHRoZSByZW5kZXJlZCBjb250ZW50IGluIHRoZSB2aWV3cG9ydC4gKi9cbiAgcHJpdmF0ZSBfbGFzdFJlbmRlcmVkQ29udGVudE9mZnNldDogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiBUaGUgbnVtYmVyIG9mIGNvbnNlY3V0aXZlIGN5Y2xlcyB3aGVyZSByZW1vdmluZyBleHRyYSBpdGVtcyBoYXMgZmFpbGVkLiBGYWlsdXJlIGhlcmUgbWVhbnMgdGhhdFxuICAgKiB3ZSBlc3RpbWF0ZWQgaG93IG1hbnkgaXRlbXMgd2UgY291bGQgc2FmZWx5IHJlbW92ZSwgYnV0IG91ciBlc3RpbWF0ZSB0dXJuZWQgb3V0IHRvIGJlIHRvbyBtdWNoXG4gICAqIGFuZCBpdCB3YXNuJ3Qgc2FmZSB0byByZW1vdmUgdGhhdCBtYW55IGVsZW1lbnRzLlxuICAgKi9cbiAgcHJpdmF0ZSBfcmVtb3ZhbEZhaWx1cmVzID0gMDtcblxuICAvKipcbiAgICogQHBhcmFtIG1pbkJ1ZmZlclB4IFRoZSBtaW5pbXVtIGFtb3VudCBvZiBidWZmZXIgcmVuZGVyZWQgYmV5b25kIHRoZSB2aWV3cG9ydCAoaW4gcGl4ZWxzKS5cbiAgICogICAgIElmIHRoZSBhbW91bnQgb2YgYnVmZmVyIGRpcHMgYmVsb3cgdGhpcyBudW1iZXIsIG1vcmUgaXRlbXMgd2lsbCBiZSByZW5kZXJlZC5cbiAgICogQHBhcmFtIG1heEJ1ZmZlclB4IFRoZSBudW1iZXIgb2YgcGl4ZWxzIHdvcnRoIG9mIGJ1ZmZlciB0byBzaG9vdCBmb3Igd2hlbiByZW5kZXJpbmcgbmV3IGl0ZW1zLlxuICAgKiAgICAgSWYgdGhlIGFjdHVhbCBhbW91bnQgdHVybnMgb3V0IHRvIGJlIGxlc3MgaXQgd2lsbCBub3QgbmVjZXNzYXJpbHkgdHJpZ2dlciBhbiBhZGRpdGlvbmFsXG4gICAqICAgICByZW5kZXJpbmcgY3ljbGUgKGFzIGxvbmcgYXMgdGhlIGFtb3VudCBvZiBidWZmZXIgaXMgc3RpbGwgZ3JlYXRlciB0aGFuIGBtaW5CdWZmZXJQeGApLlxuICAgKiBAcGFyYW0gYXZlcmFnZXIgVGhlIGF2ZXJhZ2VyIHVzZWQgdG8gZXN0aW1hdGUgdGhlIHNpemUgb2YgdW5zZWVuIGl0ZW1zLlxuICAgKi9cbiAgY29uc3RydWN0b3IobWluQnVmZmVyUHg6IG51bWJlciwgbWF4QnVmZmVyUHg6IG51bWJlciwgYXZlcmFnZXIgPSBuZXcgSXRlbVNpemVBdmVyYWdlcigpKSB7XG4gICAgdGhpcy5fbWluQnVmZmVyUHggPSBtaW5CdWZmZXJQeDtcbiAgICB0aGlzLl9tYXhCdWZmZXJQeCA9IG1heEJ1ZmZlclB4O1xuICAgIHRoaXMuX2F2ZXJhZ2VyID0gYXZlcmFnZXI7XG4gIH1cblxuICAvKipcbiAgICogQXR0YWNoZXMgdGhpcyBzY3JvbGwgc3RyYXRlZ3kgdG8gYSB2aWV3cG9ydC5cbiAgICogQHBhcmFtIHZpZXdwb3J0IFRoZSB2aWV3cG9ydCB0byBhdHRhY2ggdGhpcyBzdHJhdGVneSB0by5cbiAgICovXG4gIGF0dGFjaCh2aWV3cG9ydDogQ2RrVmlydHVhbFNjcm9sbFZpZXdwb3J0KSB7XG4gICAgdGhpcy5fYXZlcmFnZXIucmVzZXQoKTtcbiAgICB0aGlzLl92aWV3cG9ydCA9IHZpZXdwb3J0O1xuICAgIHRoaXMuX3JlbmRlckNvbnRlbnRGb3JDdXJyZW50T2Zmc2V0KCk7XG4gIH1cblxuICAvKiogRGV0YWNoZXMgdGhpcyBzY3JvbGwgc3RyYXRlZ3kgZnJvbSB0aGUgY3VycmVudGx5IGF0dGFjaGVkIHZpZXdwb3J0LiAqL1xuICBkZXRhY2goKSB7XG4gICAgdGhpcy5fdmlld3BvcnQgPSBudWxsO1xuICB9XG5cbiAgLyoqIEBkb2NzLXByaXZhdGUgSW1wbGVtZW50ZWQgYXMgcGFydCBvZiBWaXJ0dWFsU2Nyb2xsU3RyYXRlZ3kuICovXG4gIG9uQ29udGVudFNjcm9sbGVkKCkge1xuICAgIGlmICh0aGlzLl92aWV3cG9ydCkge1xuICAgICAgdGhpcy5fdXBkYXRlUmVuZGVyZWRDb250ZW50QWZ0ZXJTY3JvbGwoKTtcbiAgICB9XG4gIH1cblxuICAvKiogQGRvY3MtcHJpdmF0ZSBJbXBsZW1lbnRlZCBhcyBwYXJ0IG9mIFZpcnR1YWxTY3JvbGxTdHJhdGVneS4gKi9cbiAgb25EYXRhTGVuZ3RoQ2hhbmdlZCgpIHtcbiAgICBpZiAodGhpcy5fdmlld3BvcnQpIHtcbiAgICAgIHRoaXMuX3JlbmRlckNvbnRlbnRGb3JDdXJyZW50T2Zmc2V0KCk7XG4gICAgICB0aGlzLl9jaGVja1JlbmRlcmVkQ29udGVudFNpemUoKTtcbiAgICB9XG4gIH1cblxuICAvKiogQGRvY3MtcHJpdmF0ZSBJbXBsZW1lbnRlZCBhcyBwYXJ0IG9mIFZpcnR1YWxTY3JvbGxTdHJhdGVneS4gKi9cbiAgb25Db250ZW50UmVuZGVyZWQoKSB7XG4gICAgaWYgKHRoaXMuX3ZpZXdwb3J0KSB7XG4gICAgICB0aGlzLl9jaGVja1JlbmRlcmVkQ29udGVudFNpemUoKTtcbiAgICB9XG4gIH1cblxuICAvKiogQGRvY3MtcHJpdmF0ZSBJbXBsZW1lbnRlZCBhcyBwYXJ0IG9mIFZpcnR1YWxTY3JvbGxTdHJhdGVneS4gKi9cbiAgb25SZW5kZXJlZE9mZnNldENoYW5nZWQoKSB7XG4gICAgaWYgKHRoaXMuX3ZpZXdwb3J0KSB7XG4gICAgICB0aGlzLl9jaGVja1JlbmRlcmVkQ29udGVudE9mZnNldCgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBTY3JvbGwgdG8gdGhlIG9mZnNldCBmb3IgdGhlIGdpdmVuIGluZGV4LiAqL1xuICBzY3JvbGxUb0luZGV4KCk6IHZvaWQge1xuICAgIC8vIFRPRE8obW1hbGVyYmEpOiBJbXBsZW1lbnQuXG4gICAgdGhyb3cgRXJyb3IoJ2Nkay12aXJ0dWFsLXNjcm9sbDogc2Nyb2xsVG9JbmRleCBpcyBjdXJyZW50bHkgbm90IHN1cHBvcnRlZCBmb3IgdGhlIGF1dG9zaXplJ1xuICAgICAgICArICcgc2Nyb2xsIHN0cmF0ZWd5Jyk7XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlIHRoZSBidWZmZXIgcGFyYW1ldGVycy5cbiAgICogQHBhcmFtIG1pbkJ1ZmZlclB4IFRoZSBtaW5pbXVtIGFtb3VudCBvZiBidWZmZXIgcmVuZGVyZWQgYmV5b25kIHRoZSB2aWV3cG9ydCAoaW4gcGl4ZWxzKS5cbiAgICogQHBhcmFtIG1heEJ1ZmZlclB4IFRoZSBudW1iZXIgb2YgYnVmZmVyIGl0ZW1zIHRvIHJlbmRlciBiZXlvbmQgdGhlIGVkZ2Ugb2YgdGhlIHZpZXdwb3J0IChpblxuICAgKiAgICAgcGl4ZWxzKS5cbiAgICovXG4gIHVwZGF0ZUJ1ZmZlclNpemUobWluQnVmZmVyUHg6IG51bWJlciwgbWF4QnVmZmVyUHg6IG51bWJlcikge1xuICAgIGlmIChtYXhCdWZmZXJQeCA8IG1pbkJ1ZmZlclB4KSB7XG4gICAgICB0aHJvdygnQ0RLIHZpcnR1YWwgc2Nyb2xsOiBtYXhCdWZmZXJQeCBtdXN0IGJlIGdyZWF0ZXIgdGhhbiBvciBlcXVhbCB0byBtaW5CdWZmZXJQeCcpO1xuICAgIH1cbiAgICB0aGlzLl9taW5CdWZmZXJQeCA9IG1pbkJ1ZmZlclB4O1xuICAgIHRoaXMuX21heEJ1ZmZlclB4ID0gbWF4QnVmZmVyUHg7XG4gIH1cblxuICAvKiogVXBkYXRlIHRoZSByZW5kZXJlZCBjb250ZW50IGFmdGVyIHRoZSB1c2VyIHNjcm9sbHMuICovXG4gIHByaXZhdGUgX3VwZGF0ZVJlbmRlcmVkQ29udGVudEFmdGVyU2Nyb2xsKCkge1xuICAgIGNvbnN0IHZpZXdwb3J0ID0gdGhpcy5fdmlld3BvcnQhO1xuXG4gICAgLy8gVGhlIGN1cnJlbnQgc2Nyb2xsIG9mZnNldC5cbiAgICBjb25zdCBzY3JvbGxPZmZzZXQgPSB2aWV3cG9ydC5tZWFzdXJlU2Nyb2xsT2Zmc2V0KCk7XG4gICAgLy8gVGhlIGRlbHRhIGJldHdlZW4gdGhlIGN1cnJlbnQgc2Nyb2xsIG9mZnNldCBhbmQgdGhlIHByZXZpb3VzbHkgcmVjb3JkZWQgc2Nyb2xsIG9mZnNldC5cbiAgICBsZXQgc2Nyb2xsRGVsdGEgPSBzY3JvbGxPZmZzZXQgLSB0aGlzLl9sYXN0U2Nyb2xsT2Zmc2V0O1xuICAgIC8vIFRoZSBtYWduaXR1ZGUgb2YgdGhlIHNjcm9sbCBkZWx0YS5cbiAgICBsZXQgc2Nyb2xsTWFnbml0dWRlID0gTWF0aC5hYnMoc2Nyb2xsRGVsdGEpO1xuXG4gICAgLy8gVGhlIGN1cnJlbnRseSByZW5kZXJlZCByYW5nZS5cbiAgICBjb25zdCByZW5kZXJlZFJhbmdlID0gdmlld3BvcnQuZ2V0UmVuZGVyZWRSYW5nZSgpO1xuXG4gICAgLy8gSWYgd2UncmUgc2Nyb2xsaW5nIHRvd2FyZCB0aGUgdG9wLCB3ZSBuZWVkIHRvIGFjY291bnQgZm9yIHRoZSBmYWN0IHRoYXQgdGhlIHByZWRpY3RlZCBhbW91bnRcbiAgICAvLyBvZiBjb250ZW50IGFuZCB0aGUgYWN0dWFsIGFtb3VudCBvZiBzY3JvbGxhYmxlIHNwYWNlIG1heSBkaWZmZXIuIFdlIGFkZHJlc3MgdGhpcyBieSBzbG93bHlcbiAgICAvLyBjb3JyZWN0aW5nIHRoZSBkaWZmZXJlbmNlIG9uIGVhY2ggc2Nyb2xsIGV2ZW50LlxuICAgIGxldCBvZmZzZXRDb3JyZWN0aW9uID0gMDtcbiAgICBpZiAoc2Nyb2xsRGVsdGEgPCAwKSB7XG4gICAgICAvLyBUaGUgY29udGVudCBvZmZzZXQgd2Ugd291bGQgZXhwZWN0IGJhc2VkIG9uIHRoZSBhdmVyYWdlIGl0ZW0gc2l6ZS5cbiAgICAgIGNvbnN0IHByZWRpY3RlZE9mZnNldCA9IHJlbmRlcmVkUmFuZ2Uuc3RhcnQgKiB0aGlzLl9hdmVyYWdlci5nZXRBdmVyYWdlSXRlbVNpemUoKTtcbiAgICAgIC8vIFRoZSBkaWZmZXJlbmNlIGJldHdlZW4gdGhlIHByZWRpY3RlZCBzaXplIG9mIHRoZSB1bnJlbmRlcmVkIGNvbnRlbnQgYXQgdGhlIGJlZ2lubmluZyBhbmRcbiAgICAgIC8vIHRoZSBhY3R1YWwgYXZhaWxhYmxlIHNwYWNlIHRvIHNjcm9sbCBvdmVyLiBXZSBuZWVkIHRvIHJlZHVjZSB0aGlzIHRvIHplcm8gYnkgdGhlIHRpbWUgdGhlXG4gICAgICAvLyB1c2VyIHNjcm9sbHMgdG8gdGhlIHRvcC5cbiAgICAgIC8vIC0gMCBpbmRpY2F0ZXMgdGhhdCB0aGUgcHJlZGljdGVkIHNpemUgYW5kIGF2YWlsYWJsZSBzcGFjZSBhcmUgdGhlIHNhbWUuXG4gICAgICAvLyAtIEEgbmVnYXRpdmUgbnVtYmVyIHRoYXQgdGhlIHByZWRpY3RlZCBzaXplIGlzIHNtYWxsZXIgdGhhbiB0aGUgYXZhaWxhYmxlIHNwYWNlLlxuICAgICAgLy8gLSBBIHBvc2l0aXZlIG51bWJlciBpbmRpY2F0ZXMgdGhlIHByZWRpY3RlZCBzaXplIGlzIGxhcmdlciB0aGFuIHRoZSBhdmFpbGFibGUgc3BhY2VcbiAgICAgIGNvbnN0IG9mZnNldERpZmZlcmVuY2UgPSBwcmVkaWN0ZWRPZmZzZXQgLSB0aGlzLl9sYXN0UmVuZGVyZWRDb250ZW50T2Zmc2V0O1xuICAgICAgLy8gVGhlIGFtb3VudCBvZiBkaWZmZXJlbmNlIHRvIGNvcnJlY3QgZHVyaW5nIHRoaXMgc2Nyb2xsIGV2ZW50LiBXZSBjYWxjdWxhdGUgdGhpcyBhcyBhXG4gICAgICAvLyBwZXJjZW50YWdlIG9mIHRoZSB0b3RhbCBkaWZmZXJlbmNlIGJhc2VkIG9uIHRoZSBwZXJjZW50YWdlIG9mIHRoZSBkaXN0YW5jZSB0b3dhcmQgdGhlIHRvcFxuICAgICAgLy8gdGhhdCB0aGUgdXNlciBzY3JvbGxlZC5cbiAgICAgIG9mZnNldENvcnJlY3Rpb24gPSBNYXRoLnJvdW5kKG9mZnNldERpZmZlcmVuY2UgKlxuICAgICAgICAgIE1hdGgubWF4KDAsIE1hdGgubWluKDEsIHNjcm9sbE1hZ25pdHVkZSAvIChzY3JvbGxPZmZzZXQgKyBzY3JvbGxNYWduaXR1ZGUpKSkpO1xuXG4gICAgICAvLyBCYXNlZCBvbiB0aGUgb2Zmc2V0IGNvcnJlY3Rpb24gYWJvdmUsIHdlIHByZXRlbmQgdGhhdCB0aGUgc2Nyb2xsIGRlbHRhIHdhcyBiaWdnZXIgb3JcbiAgICAgIC8vIHNtYWxsZXIgdGhhbiBpdCBhY3R1YWxseSB3YXMsIHRoaXMgd2F5IHdlIGNhbiBzdGFydCB0byBlbGltaW5hdGUgdGhlIGRpZmZlcmVuY2UuXG4gICAgICBzY3JvbGxEZWx0YSA9IHNjcm9sbERlbHRhIC0gb2Zmc2V0Q29ycmVjdGlvbjtcbiAgICAgIHNjcm9sbE1hZ25pdHVkZSA9IE1hdGguYWJzKHNjcm9sbERlbHRhKTtcbiAgICB9XG5cbiAgICAvLyBUaGUgY3VycmVudCBhbW91bnQgb2YgYnVmZmVyIHBhc3QgdGhlIHN0YXJ0IG9mIHRoZSB2aWV3cG9ydC5cbiAgICBjb25zdCBzdGFydEJ1ZmZlciA9IHRoaXMuX2xhc3RTY3JvbGxPZmZzZXQgLSB0aGlzLl9sYXN0UmVuZGVyZWRDb250ZW50T2Zmc2V0O1xuICAgIC8vIFRoZSBjdXJyZW50IGFtb3VudCBvZiBidWZmZXIgcGFzdCB0aGUgZW5kIG9mIHRoZSB2aWV3cG9ydC5cbiAgICBjb25zdCBlbmRCdWZmZXIgPSAodGhpcy5fbGFzdFJlbmRlcmVkQ29udGVudE9mZnNldCArIHRoaXMuX2xhc3RSZW5kZXJlZENvbnRlbnRTaXplKSAtXG4gICAgICAgICh0aGlzLl9sYXN0U2Nyb2xsT2Zmc2V0ICsgdmlld3BvcnQuZ2V0Vmlld3BvcnRTaXplKCkpO1xuICAgIC8vIFRoZSBhbW91bnQgb2YgdW5maWxsZWQgc3BhY2UgdGhhdCBzaG91bGQgYmUgZmlsbGVkIG9uIHRoZSBzaWRlIHRoZSB1c2VyIGlzIHNjcm9sbGluZyB0b3dhcmRcbiAgICAvLyBpbiBvcmRlciB0byBzYWZlbHkgYWJzb3JiIHRoZSBzY3JvbGwgZGVsdGEuXG4gICAgY29uc3QgdW5kZXJzY2FuID0gc2Nyb2xsTWFnbml0dWRlICsgdGhpcy5fbWluQnVmZmVyUHggLVxuICAgICAgICAoc2Nyb2xsRGVsdGEgPCAwID8gc3RhcnRCdWZmZXIgOiBlbmRCdWZmZXIpO1xuXG4gICAgLy8gQ2hlY2sgaWYgdGhlcmUncyB1bmZpbGxlZCBzcGFjZSB0aGF0IHdlIG5lZWQgdG8gcmVuZGVyIG5ldyBlbGVtZW50cyB0byBmaWxsLlxuICAgIGlmICh1bmRlcnNjYW4gPiAwKSB7XG4gICAgICAvLyBDaGVjayBpZiB0aGUgc2Nyb2xsIG1hZ25pdHVkZSB3YXMgbGFyZ2VyIHRoYW4gdGhlIHZpZXdwb3J0IHNpemUuIEluIHRoaXMgY2FzZSB0aGUgdXNlclxuICAgICAgLy8gd29uJ3Qgbm90aWNlIGEgZGlzY29udGludWl0eSBpZiB3ZSBqdXN0IGp1bXAgdG8gdGhlIG5ldyBlc3RpbWF0ZWQgcG9zaXRpb24gaW4gdGhlIGxpc3QuXG4gICAgICAvLyBIb3dldmVyLCBpZiB0aGUgc2Nyb2xsIG1hZ25pdHVkZSBpcyBzbWFsbGVyIHRoYW4gdGhlIHZpZXdwb3J0IHRoZSB1c2VyIG1pZ2h0IG5vdGljZSBzb21lXG4gICAgICAvLyBqaXR0ZXJpbmVzcyBpZiB3ZSBqdXN0IGp1bXAgdG8gdGhlIGVzdGltYXRlZCBwb3NpdGlvbi4gSW5zdGVhZCB3ZSBtYWtlIHN1cmUgdG8gc2Nyb2xsIGJ5XG4gICAgICAvLyB0aGUgc2FtZSBudW1iZXIgb2YgcGl4ZWxzIGFzIHRoZSBzY3JvbGwgbWFnbml0dWRlLlxuICAgICAgaWYgKHNjcm9sbE1hZ25pdHVkZSA+PSB2aWV3cG9ydC5nZXRWaWV3cG9ydFNpemUoKSkge1xuICAgICAgICB0aGlzLl9yZW5kZXJDb250ZW50Rm9yQ3VycmVudE9mZnNldCgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gVGhlIG51bWJlciBvZiBuZXcgaXRlbXMgdG8gcmVuZGVyIG9uIHRoZSBzaWRlIHRoZSB1c2VyIGlzIHNjcm9sbGluZyB0b3dhcmRzLiBSYXRoZXIgdGhhblxuICAgICAgICAvLyBqdXN0IGZpbGxpbmcgdGhlIHVuZGVyc2NhbiBzcGFjZSwgd2UgYWN0dWFsbHkgZmlsbCBlbm91Z2ggdG8gaGF2ZSBhIGJ1ZmZlciBzaXplIG9mXG4gICAgICAgIC8vIGBtYXhCdWZmZXJQeGAuIFRoaXMgZ2l2ZXMgdXMgYSBsaXR0bGUgd2lnZ2xlIHJvb20gaW4gY2FzZSBvdXIgaXRlbSBzaXplIGVzdGltYXRlIGlzIG9mZi5cbiAgICAgICAgY29uc3QgYWRkSXRlbXMgPSBNYXRoLm1heCgwLCBNYXRoLmNlaWwoKHVuZGVyc2NhbiAtIHRoaXMuX21pbkJ1ZmZlclB4ICsgdGhpcy5fbWF4QnVmZmVyUHgpIC9cbiAgICAgICAgICAgIHRoaXMuX2F2ZXJhZ2VyLmdldEF2ZXJhZ2VJdGVtU2l6ZSgpKSk7XG4gICAgICAgIC8vIFRoZSBhbW91bnQgb2YgZmlsbGVkIHNwYWNlIGJleW9uZCB3aGF0IGlzIG5lY2Vzc2FyeSBvbiB0aGUgc2lkZSB0aGUgdXNlciBpcyBzY3JvbGxpbmdcbiAgICAgICAgLy8gYXdheSBmcm9tLlxuICAgICAgICBjb25zdCBvdmVyc2NhbiA9IChzY3JvbGxEZWx0YSA8IDAgPyBlbmRCdWZmZXIgOiBzdGFydEJ1ZmZlcikgLSB0aGlzLl9taW5CdWZmZXJQeCArXG4gICAgICAgICAgICBzY3JvbGxNYWduaXR1ZGU7XG4gICAgICAgIC8vIFRoZSBudW1iZXIgb2YgY3VycmVudGx5IHJlbmRlcmVkIGl0ZW1zIHRvIHJlbW92ZSBvbiB0aGUgc2lkZSB0aGUgdXNlciBpcyBzY3JvbGxpbmcgYXdheVxuICAgICAgICAvLyBmcm9tLiBJZiByZW1vdmFsIGhhcyBmYWlsZWQgaW4gcmVjZW50IGN5Y2xlcyB3ZSBhcmUgbGVzcyBhZ2dyZXNzaXZlIGluIGhvdyBtdWNoIHdlIHRyeSB0b1xuICAgICAgICAvLyByZW1vdmUuXG4gICAgICAgIGNvbnN0IHVuYm91bmRlZFJlbW92ZUl0ZW1zID0gTWF0aC5mbG9vcihcbiAgICAgICAgICAgIG92ZXJzY2FuIC8gdGhpcy5fYXZlcmFnZXIuZ2V0QXZlcmFnZUl0ZW1TaXplKCkgLyAodGhpcy5fcmVtb3ZhbEZhaWx1cmVzICsgMSkpO1xuICAgICAgICBjb25zdCByZW1vdmVJdGVtcyA9XG4gICAgICAgICAgICBNYXRoLm1pbihyZW5kZXJlZFJhbmdlLmVuZCAtIHJlbmRlcmVkUmFuZ2Uuc3RhcnQsIE1hdGgubWF4KDAsIHVuYm91bmRlZFJlbW92ZUl0ZW1zKSk7XG5cbiAgICAgICAgLy8gVGhlIG5ldyByYW5nZSB3ZSB3aWxsIHRlbGwgdGhlIHZpZXdwb3J0IHRvIHJlbmRlci4gV2UgZmlyc3QgZXhwYW5kIGl0IHRvIGluY2x1ZGUgdGhlIG5ld1xuICAgICAgICAvLyBpdGVtcyB3ZSB3YW50IHJlbmRlcmVkLCB3ZSB0aGVuIGNvbnRyYWN0IHRoZSBvcHBvc2l0ZSBzaWRlIHRvIHJlbW92ZSBpdGVtcyB3ZSBubyBsb25nZXJcbiAgICAgICAgLy8gd2FudCByZW5kZXJlZC5cbiAgICAgICAgY29uc3QgcmFuZ2UgPSB0aGlzLl9leHBhbmRSYW5nZShcbiAgICAgICAgICAgIHJlbmRlcmVkUmFuZ2UsIHNjcm9sbERlbHRhIDwgMCA/IGFkZEl0ZW1zIDogMCwgc2Nyb2xsRGVsdGEgPiAwID8gYWRkSXRlbXMgOiAwKTtcbiAgICAgICAgaWYgKHNjcm9sbERlbHRhIDwgMCkge1xuICAgICAgICAgIHJhbmdlLmVuZCA9IE1hdGgubWF4KHJhbmdlLnN0YXJ0ICsgMSwgcmFuZ2UuZW5kIC0gcmVtb3ZlSXRlbXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJhbmdlLnN0YXJ0ID0gTWF0aC5taW4ocmFuZ2UuZW5kIC0gMSwgcmFuZ2Uuc3RhcnQgKyByZW1vdmVJdGVtcyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUaGUgbmV3IG9mZnNldCB3ZSB3YW50IHRvIHNldCBvbiB0aGUgcmVuZGVyZWQgY29udGVudC4gVG8gZGV0ZXJtaW5lIHRoaXMgd2UgbWVhc3VyZSB0aGVcbiAgICAgICAgLy8gbnVtYmVyIG9mIHBpeGVscyB3ZSByZW1vdmVkIGFuZCB0aGVuIGFkanVzdCB0aGUgb2Zmc2V0IHRvIHRoZSBzdGFydCBvZiB0aGUgcmVuZGVyZWRcbiAgICAgICAgLy8gY29udGVudCBvciB0byB0aGUgZW5kIG9mIHRoZSByZW5kZXJlZCBjb250ZW50IGFjY29yZGluZ2x5ICh3aGljaGV2ZXIgb25lIGRvZXNuJ3QgcmVxdWlyZVxuICAgICAgICAvLyB0aGF0IHRoZSBuZXdseSBhZGRlZCBpdGVtcyB0byBiZSByZW5kZXJlZCB0byBjYWxjdWxhdGUuKVxuICAgICAgICBsZXQgY29udGVudE9mZnNldDogbnVtYmVyO1xuICAgICAgICBsZXQgY29udGVudE9mZnNldFRvOiAndG8tc3RhcnQnIHwgJ3RvLWVuZCc7XG4gICAgICAgIGlmIChzY3JvbGxEZWx0YSA8IDApIHtcbiAgICAgICAgICBsZXQgcmVtb3ZlZFNpemUgPSB2aWV3cG9ydC5tZWFzdXJlUmFuZ2VTaXplKHtcbiAgICAgICAgICAgIHN0YXJ0OiByYW5nZS5lbmQsXG4gICAgICAgICAgICBlbmQ6IHJlbmRlcmVkUmFuZ2UuZW5kLFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIC8vIENoZWNrIHRoYXQgd2UncmUgbm90IHJlbW92aW5nIHRvbyBtdWNoLlxuICAgICAgICAgIGlmIChyZW1vdmVkU2l6ZSA8PSBvdmVyc2Nhbikge1xuICAgICAgICAgICAgY29udGVudE9mZnNldCA9XG4gICAgICAgICAgICAgICAgdGhpcy5fbGFzdFJlbmRlcmVkQ29udGVudE9mZnNldCArIHRoaXMuX2xhc3RSZW5kZXJlZENvbnRlbnRTaXplIC0gcmVtb3ZlZFNpemU7XG4gICAgICAgICAgICB0aGlzLl9yZW1vdmFsRmFpbHVyZXMgPSAwO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBJZiB0aGUgcmVtb3ZhbCBpcyBtb3JlIHRoYW4gdGhlIG92ZXJzY2FuIGNhbiBhYnNvcmIganVzdCB1bmRvIGl0IGFuZCByZWNvcmQgdGhlIGZhY3RcbiAgICAgICAgICAgIC8vIHRoYXQgdGhlIHJlbW92YWwgZmFpbGVkIHNvIHdlIGNhbiBiZSBsZXNzIGFnZ3Jlc3NpdmUgbmV4dCB0aW1lLlxuICAgICAgICAgICAgcmFuZ2UuZW5kID0gcmVuZGVyZWRSYW5nZS5lbmQ7XG4gICAgICAgICAgICBjb250ZW50T2Zmc2V0ID0gdGhpcy5fbGFzdFJlbmRlcmVkQ29udGVudE9mZnNldCArIHRoaXMuX2xhc3RSZW5kZXJlZENvbnRlbnRTaXplO1xuICAgICAgICAgICAgdGhpcy5fcmVtb3ZhbEZhaWx1cmVzKys7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnRlbnRPZmZzZXRUbyA9ICd0by1lbmQnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnN0IHJlbW92ZWRTaXplID0gdmlld3BvcnQubWVhc3VyZVJhbmdlU2l6ZSh7XG4gICAgICAgICAgICBzdGFydDogcmVuZGVyZWRSYW5nZS5zdGFydCxcbiAgICAgICAgICAgIGVuZDogcmFuZ2Uuc3RhcnQsXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgLy8gQ2hlY2sgdGhhdCB3ZSdyZSBub3QgcmVtb3ZpbmcgdG9vIG11Y2guXG4gICAgICAgICAgaWYgKHJlbW92ZWRTaXplIDw9IG92ZXJzY2FuKSB7XG4gICAgICAgICAgICBjb250ZW50T2Zmc2V0ID0gdGhpcy5fbGFzdFJlbmRlcmVkQ29udGVudE9mZnNldCArIHJlbW92ZWRTaXplO1xuICAgICAgICAgICAgdGhpcy5fcmVtb3ZhbEZhaWx1cmVzID0gMDtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gSWYgdGhlIHJlbW92YWwgaXMgbW9yZSB0aGFuIHRoZSBvdmVyc2NhbiBjYW4gYWJzb3JiIGp1c3QgdW5kbyBpdCBhbmQgcmVjb3JkIHRoZSBmYWN0XG4gICAgICAgICAgICAvLyB0aGF0IHRoZSByZW1vdmFsIGZhaWxlZCBzbyB3ZSBjYW4gYmUgbGVzcyBhZ2dyZXNzaXZlIG5leHQgdGltZS5cbiAgICAgICAgICAgIHJhbmdlLnN0YXJ0ID0gcmVuZGVyZWRSYW5nZS5zdGFydDtcbiAgICAgICAgICAgIGNvbnRlbnRPZmZzZXQgPSB0aGlzLl9sYXN0UmVuZGVyZWRDb250ZW50T2Zmc2V0O1xuICAgICAgICAgICAgdGhpcy5fcmVtb3ZhbEZhaWx1cmVzKys7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnRlbnRPZmZzZXRUbyA9ICd0by1zdGFydCc7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTZXQgdGhlIHJhbmdlIGFuZCBvZmZzZXQgd2UgY2FsY3VsYXRlZCBhYm92ZS5cbiAgICAgICAgdmlld3BvcnQuc2V0UmVuZGVyZWRSYW5nZShyYW5nZSk7XG4gICAgICAgIHZpZXdwb3J0LnNldFJlbmRlcmVkQ29udGVudE9mZnNldChjb250ZW50T2Zmc2V0ICsgb2Zmc2V0Q29ycmVjdGlvbiwgY29udGVudE9mZnNldFRvKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKG9mZnNldENvcnJlY3Rpb24pIHtcbiAgICAgIC8vIEV2ZW4gaWYgdGhlIHJlbmRlcmVkIHJhbmdlIGRpZG4ndCBjaGFuZ2UsIHdlIG1heSBzdGlsbCBuZWVkIHRvIGFkanVzdCB0aGUgY29udGVudCBvZmZzZXQgdG9cbiAgICAgIC8vIHNpbXVsYXRlIHNjcm9sbGluZyBzbGlnaHRseSBzbG93ZXIgb3IgZmFzdGVyIHRoYW4gdGhlIHVzZXIgYWN0dWFsbHkgc2Nyb2xsZWQuXG4gICAgICB2aWV3cG9ydC5zZXRSZW5kZXJlZENvbnRlbnRPZmZzZXQodGhpcy5fbGFzdFJlbmRlcmVkQ29udGVudE9mZnNldCArIG9mZnNldENvcnJlY3Rpb24pO1xuICAgIH1cblxuICAgIC8vIFNhdmUgdGhlIHNjcm9sbCBvZmZzZXQgdG8gYmUgY29tcGFyZWQgdG8gdGhlIG5ldyB2YWx1ZSBvbiB0aGUgbmV4dCBzY3JvbGwgZXZlbnQuXG4gICAgdGhpcy5fbGFzdFNjcm9sbE9mZnNldCA9IHNjcm9sbE9mZnNldDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3MgdGhlIHNpemUgb2YgdGhlIGN1cnJlbnRseSByZW5kZXJlZCBjb250ZW50IGFuZCB1c2VzIGl0IHRvIHVwZGF0ZSB0aGUgZXN0aW1hdGVkIGl0ZW0gc2l6ZVxuICAgKiBhbmQgZXN0aW1hdGVkIHRvdGFsIGNvbnRlbnQgc2l6ZS5cbiAgICovXG4gIHByaXZhdGUgX2NoZWNrUmVuZGVyZWRDb250ZW50U2l6ZSgpIHtcbiAgICBjb25zdCB2aWV3cG9ydCA9IHRoaXMuX3ZpZXdwb3J0ITtcbiAgICB0aGlzLl9sYXN0UmVuZGVyZWRDb250ZW50U2l6ZSA9IHZpZXdwb3J0Lm1lYXN1cmVSZW5kZXJlZENvbnRlbnRTaXplKCk7XG4gICAgdGhpcy5fYXZlcmFnZXIuYWRkU2FtcGxlKHZpZXdwb3J0LmdldFJlbmRlcmVkUmFuZ2UoKSwgdGhpcy5fbGFzdFJlbmRlcmVkQ29udGVudFNpemUpO1xuICAgIHRoaXMuX3VwZGF0ZVRvdGFsQ29udGVudFNpemUodGhpcy5fbGFzdFJlbmRlcmVkQ29udGVudFNpemUpO1xuICB9XG5cbiAgLyoqIENoZWNrcyB0aGUgY3VycmVudGx5IHJlbmRlcmVkIGNvbnRlbnQgb2Zmc2V0IGFuZCBzYXZlcyB0aGUgdmFsdWUgZm9yIGxhdGVyIHVzZS4gKi9cbiAgcHJpdmF0ZSBfY2hlY2tSZW5kZXJlZENvbnRlbnRPZmZzZXQoKSB7XG4gICAgY29uc3Qgdmlld3BvcnQgPSB0aGlzLl92aWV3cG9ydCE7XG4gICAgdGhpcy5fbGFzdFJlbmRlcmVkQ29udGVudE9mZnNldCA9IHZpZXdwb3J0LmdldE9mZnNldFRvUmVuZGVyZWRDb250ZW50U3RhcnQoKSE7XG4gIH1cblxuICAvKipcbiAgICogUmVjYWxjdWxhdGVzIHRoZSByZW5kZXJlZCBjb250ZW50IGJhc2VkIG9uIG91ciBlc3RpbWF0ZSBvZiB3aGF0IHNob3VsZCBiZSBzaG93biBhdCB0aGUgY3VycmVudFxuICAgKiBzY3JvbGwgb2Zmc2V0LlxuICAgKi9cbiAgcHJpdmF0ZSBfcmVuZGVyQ29udGVudEZvckN1cnJlbnRPZmZzZXQoKSB7XG4gICAgY29uc3Qgdmlld3BvcnQgPSB0aGlzLl92aWV3cG9ydCE7XG4gICAgY29uc3Qgc2Nyb2xsT2Zmc2V0ID0gdmlld3BvcnQubWVhc3VyZVNjcm9sbE9mZnNldCgpO1xuICAgIHRoaXMuX2xhc3RTY3JvbGxPZmZzZXQgPSBzY3JvbGxPZmZzZXQ7XG4gICAgdGhpcy5fcmVtb3ZhbEZhaWx1cmVzID0gMDtcblxuICAgIGNvbnN0IGl0ZW1TaXplID0gdGhpcy5fYXZlcmFnZXIuZ2V0QXZlcmFnZUl0ZW1TaXplKCk7XG4gICAgY29uc3QgZmlyc3RWaXNpYmxlSW5kZXggPVxuICAgICAgICBNYXRoLm1pbih2aWV3cG9ydC5nZXREYXRhTGVuZ3RoKCkgLSAxLCBNYXRoLmZsb29yKHNjcm9sbE9mZnNldCAvIGl0ZW1TaXplKSk7XG4gICAgY29uc3QgYnVmZmVyU2l6ZSA9IE1hdGguY2VpbCh0aGlzLl9tYXhCdWZmZXJQeCAvIGl0ZW1TaXplKTtcbiAgICBjb25zdCByYW5nZSA9IHRoaXMuX2V4cGFuZFJhbmdlKFxuICAgICAgICB0aGlzLl9nZXRWaXNpYmxlUmFuZ2VGb3JJbmRleChmaXJzdFZpc2libGVJbmRleCksIGJ1ZmZlclNpemUsIGJ1ZmZlclNpemUpO1xuXG4gICAgdmlld3BvcnQuc2V0UmVuZGVyZWRSYW5nZShyYW5nZSk7XG4gICAgdmlld3BvcnQuc2V0UmVuZGVyZWRDb250ZW50T2Zmc2V0KGl0ZW1TaXplICogcmFuZ2Uuc3RhcnQpO1xuICB9XG5cbiAgLy8gVE9ETzogbWF5YmUgbW92ZSB0byBiYXNlIGNsYXNzLCBjYW4gcHJvYmFibHkgc2hhcmUgd2l0aCBmaXhlZCBzaXplIHN0cmF0ZWd5LlxuICAvKipcbiAgICogR2V0cyB0aGUgdmlzaWJsZSByYW5nZSBvZiBkYXRhIGZvciB0aGUgZ2l2ZW4gc3RhcnQgaW5kZXguIElmIHRoZSBzdGFydCBpbmRleCBpcyB0b28gY2xvc2UgdG9cbiAgICogdGhlIGVuZCBvZiB0aGUgbGlzdCBpdCBtYXkgYmUgYmFja2VkIHVwIHRvIGVuc3VyZSB0aGUgZXN0aW1hdGVkIHNpemUgb2YgdGhlIHJhbmdlIGlzIGVub3VnaCB0b1xuICAgKiBmaWxsIHRoZSB2aWV3cG9ydC5cbiAgICogTm90ZTogbXVzdCBub3QgYmUgY2FsbGVkIGlmIGB0aGlzLl92aWV3cG9ydGAgaXMgbnVsbFxuICAgKiBAcGFyYW0gc3RhcnRJbmRleCBUaGUgaW5kZXggdG8gc3RhcnQgdGhlIHJhbmdlIGF0XG4gICAqIEByZXR1cm4gYSByYW5nZSBlc3RpbWF0ZWQgdG8gYmUgbGFyZ2UgZW5vdWdoIHRvIGZpbGwgdGhlIHZpZXdwb3J0IHdoZW4gcmVuZGVyZWQuXG4gICAqL1xuICBwcml2YXRlIF9nZXRWaXNpYmxlUmFuZ2VGb3JJbmRleChzdGFydEluZGV4OiBudW1iZXIpOiBMaXN0UmFuZ2Uge1xuICAgIGNvbnN0IHZpZXdwb3J0ID0gdGhpcy5fdmlld3BvcnQhO1xuICAgIGNvbnN0IHJhbmdlOiBMaXN0UmFuZ2UgPSB7XG4gICAgICBzdGFydDogc3RhcnRJbmRleCxcbiAgICAgIGVuZDogc3RhcnRJbmRleCArXG4gICAgICAgICAgTWF0aC5jZWlsKHZpZXdwb3J0LmdldFZpZXdwb3J0U2l6ZSgpIC8gdGhpcy5fYXZlcmFnZXIuZ2V0QXZlcmFnZUl0ZW1TaXplKCkpXG4gICAgfTtcbiAgICBjb25zdCBleHRyYSA9IHJhbmdlLmVuZCAtIHZpZXdwb3J0LmdldERhdGFMZW5ndGgoKTtcbiAgICBpZiAoZXh0cmEgPiAwKSB7XG4gICAgICByYW5nZS5zdGFydCA9IE1hdGgubWF4KDAsIHJhbmdlLnN0YXJ0IC0gZXh0cmEpO1xuICAgIH1cbiAgICByZXR1cm4gcmFuZ2U7XG4gIH1cblxuICAvLyBUT0RPOiBtYXliZSBtb3ZlIHRvIGJhc2UgY2xhc3MsIGNhbiBwcm9iYWJseSBzaGFyZSB3aXRoIGZpeGVkIHNpemUgc3RyYXRlZ3kuXG4gIC8qKlxuICAgKiBFeHBhbmQgdGhlIGdpdmVuIHJhbmdlIGJ5IHRoZSBnaXZlbiBhbW91bnQgaW4gZWl0aGVyIGRpcmVjdGlvbi5cbiAgICogTm90ZTogbXVzdCBub3QgYmUgY2FsbGVkIGlmIGB0aGlzLl92aWV3cG9ydGAgaXMgbnVsbFxuICAgKiBAcGFyYW0gcmFuZ2UgVGhlIHJhbmdlIHRvIGV4cGFuZFxuICAgKiBAcGFyYW0gZXhwYW5kU3RhcnQgVGhlIG51bWJlciBvZiBpdGVtcyB0byBleHBhbmQgdGhlIHN0YXJ0IG9mIHRoZSByYW5nZSBieS5cbiAgICogQHBhcmFtIGV4cGFuZEVuZCBUaGUgbnVtYmVyIG9mIGl0ZW1zIHRvIGV4cGFuZCB0aGUgZW5kIG9mIHRoZSByYW5nZSBieS5cbiAgICogQHJldHVybiBUaGUgZXhwYW5kZWQgcmFuZ2UuXG4gICAqL1xuICBwcml2YXRlIF9leHBhbmRSYW5nZShyYW5nZTogTGlzdFJhbmdlLCBleHBhbmRTdGFydDogbnVtYmVyLCBleHBhbmRFbmQ6IG51bWJlcik6IExpc3RSYW5nZSB7XG4gICAgY29uc3Qgdmlld3BvcnQgPSB0aGlzLl92aWV3cG9ydCE7XG4gICAgY29uc3Qgc3RhcnQgPSBNYXRoLm1heCgwLCByYW5nZS5zdGFydCAtIGV4cGFuZFN0YXJ0KTtcbiAgICBjb25zdCBlbmQgPSBNYXRoLm1pbih2aWV3cG9ydC5nZXREYXRhTGVuZ3RoKCksIHJhbmdlLmVuZCArIGV4cGFuZEVuZCk7XG4gICAgcmV0dXJuIHtzdGFydCwgZW5kfTtcbiAgfVxuXG4gIC8qKiBVcGRhdGUgdGhlIHZpZXdwb3J0J3MgdG90YWwgY29udGVudCBzaXplLiAqL1xuICBwcml2YXRlIF91cGRhdGVUb3RhbENvbnRlbnRTaXplKHJlbmRlcmVkQ29udGVudFNpemU6IG51bWJlcikge1xuICAgIGNvbnN0IHZpZXdwb3J0ID0gdGhpcy5fdmlld3BvcnQhO1xuICAgIGNvbnN0IHJlbmRlcmVkUmFuZ2UgPSB2aWV3cG9ydC5nZXRSZW5kZXJlZFJhbmdlKCk7XG4gICAgY29uc3QgdG90YWxTaXplID0gcmVuZGVyZWRDb250ZW50U2l6ZSArXG4gICAgICAgICh2aWV3cG9ydC5nZXREYXRhTGVuZ3RoKCkgLSAocmVuZGVyZWRSYW5nZS5lbmQgLSByZW5kZXJlZFJhbmdlLnN0YXJ0KSkgKlxuICAgICAgICB0aGlzLl9hdmVyYWdlci5nZXRBdmVyYWdlSXRlbVNpemUoKTtcbiAgICB2aWV3cG9ydC5zZXRUb3RhbENvbnRlbnRTaXplKHRvdGFsU2l6ZSk7XG4gIH1cbn1cblxuLyoqXG4gKiBQcm92aWRlciBmYWN0b3J5IGZvciBgQXV0b1NpemVWaXJ0dWFsU2Nyb2xsU3RyYXRlZ3lgIHRoYXQgc2ltcGx5IGV4dHJhY3RzIHRoZSBhbHJlYWR5IGNyZWF0ZWRcbiAqIGBBdXRvU2l6ZVZpcnR1YWxTY3JvbGxTdHJhdGVneWAgZnJvbSB0aGUgZ2l2ZW4gZGlyZWN0aXZlLlxuICogQHBhcmFtIGF1dG9TaXplRGlyIFRoZSBpbnN0YW5jZSBvZiBgQ2RrQXV0b1NpemVWaXJ0dWFsU2Nyb2xsYCB0byBleHRyYWN0IHRoZVxuICogICAgIGBBdXRvU2l6ZVZpcnR1YWxTY3JvbGxTdHJhdGVneWAgZnJvbS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIF9hdXRvU2l6ZVZpcnR1YWxTY3JvbGxTdHJhdGVneUZhY3RvcnkoYXV0b1NpemVEaXI6IENka0F1dG9TaXplVmlydHVhbFNjcm9sbCkge1xuICByZXR1cm4gYXV0b1NpemVEaXIuX3Njcm9sbFN0cmF0ZWd5O1xufVxuXG5cbi8qKiBBIHZpcnR1YWwgc2Nyb2xsIHN0cmF0ZWd5IHRoYXQgc3VwcG9ydHMgdW5rbm93biBvciBkeW5hbWljIHNpemUgaXRlbXMuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdjZGstdmlydHVhbC1zY3JvbGwtdmlld3BvcnRbYXV0b3NpemVdJyxcbiAgcHJvdmlkZXJzOiBbe1xuICAgIHByb3ZpZGU6IFZJUlRVQUxfU0NST0xMX1NUUkFURUdZLFxuICAgIHVzZUZhY3Rvcnk6IF9hdXRvU2l6ZVZpcnR1YWxTY3JvbGxTdHJhdGVneUZhY3RvcnksXG4gICAgZGVwczogW2ZvcndhcmRSZWYoKCkgPT4gQ2RrQXV0b1NpemVWaXJ0dWFsU2Nyb2xsKV0sXG4gIH1dLFxufSlcbmV4cG9ydCBjbGFzcyBDZGtBdXRvU2l6ZVZpcnR1YWxTY3JvbGwgaW1wbGVtZW50cyBPbkNoYW5nZXMge1xuICAvKipcbiAgICogVGhlIG1pbmltdW0gYW1vdW50IG9mIGJ1ZmZlciByZW5kZXJlZCBiZXlvbmQgdGhlIHZpZXdwb3J0IChpbiBwaXhlbHMpLlxuICAgKiBJZiB0aGUgYW1vdW50IG9mIGJ1ZmZlciBkaXBzIGJlbG93IHRoaXMgbnVtYmVyLCBtb3JlIGl0ZW1zIHdpbGwgYmUgcmVuZGVyZWQuIERlZmF1bHRzIHRvIDEwMHB4LlxuICAgKi9cbiAgQElucHV0KClcbiAgZ2V0IG1pbkJ1ZmZlclB4KCk6IG51bWJlciB7IHJldHVybiB0aGlzLl9taW5CdWZmZXJQeDsgfVxuICBzZXQgbWluQnVmZmVyUHgodmFsdWU6IG51bWJlcikgeyB0aGlzLl9taW5CdWZmZXJQeCA9IGNvZXJjZU51bWJlclByb3BlcnR5KHZhbHVlKTsgfVxuICBfbWluQnVmZmVyUHggPSAxMDA7XG5cbiAgLyoqXG4gICAqIFRoZSBudW1iZXIgb2YgcGl4ZWxzIHdvcnRoIG9mIGJ1ZmZlciB0byBzaG9vdCBmb3Igd2hlbiByZW5kZXJpbmcgbmV3IGl0ZW1zLlxuICAgKiBJZiB0aGUgYWN0dWFsIGFtb3VudCB0dXJucyBvdXQgdG8gYmUgbGVzcyBpdCB3aWxsIG5vdCBuZWNlc3NhcmlseSB0cmlnZ2VyIGFuIGFkZGl0aW9uYWxcbiAgICogcmVuZGVyaW5nIGN5Y2xlIChhcyBsb25nIGFzIHRoZSBhbW91bnQgb2YgYnVmZmVyIGlzIHN0aWxsIGdyZWF0ZXIgdGhhbiBgbWluQnVmZmVyUHhgKS5cbiAgICogRGVmYXVsdHMgdG8gMjAwcHguXG4gICAqL1xuICBASW5wdXQoKVxuICBnZXQgbWF4QnVmZmVyUHgoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuX21heEJ1ZmZlclB4OyB9XG4gIHNldCBtYXhCdWZmZXJQeCh2YWx1ZTogbnVtYmVyKSB7IHRoaXMuX21heEJ1ZmZlclB4ID0gY29lcmNlTnVtYmVyUHJvcGVydHkodmFsdWUpOyB9XG4gIF9tYXhCdWZmZXJQeCA9IDIwMDtcblxuICAvKiogVGhlIHNjcm9sbCBzdHJhdGVneSB1c2VkIGJ5IHRoaXMgZGlyZWN0aXZlLiAqL1xuICBfc2Nyb2xsU3RyYXRlZ3kgPSBuZXcgQXV0b1NpemVWaXJ0dWFsU2Nyb2xsU3RyYXRlZ3kodGhpcy5taW5CdWZmZXJQeCwgdGhpcy5tYXhCdWZmZXJQeCk7XG5cbiAgbmdPbkNoYW5nZXMoKSB7XG4gICAgdGhpcy5fc2Nyb2xsU3RyYXRlZ3kudXBkYXRlQnVmZmVyU2l6ZSh0aGlzLm1pbkJ1ZmZlclB4LCB0aGlzLm1heEJ1ZmZlclB4KTtcbiAgfVxuXG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9taW5CdWZmZXJQeDogTnVtYmVySW5wdXQ7XG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9tYXhCdWZmZXJQeDogTnVtYmVySW5wdXQ7XG59XG4iXX0=