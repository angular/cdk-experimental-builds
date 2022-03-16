/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { coerceNumberProperty } from '@angular/cdk/coercion';
import { VIRTUAL_SCROLL_STRATEGY, } from '@angular/cdk/scrolling';
import { Directive, forwardRef, Input } from '@angular/core';
import { Observable } from 'rxjs';
import * as i0 from "@angular/core";
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
            if (typeof ngDevMode === 'undefined' || ngDevMode) {
                throw Error('cdk-virtual-scroll: scrolledIndexChange is currently not supported for the' +
                    ' autosize scroll strategy');
            }
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
        if (typeof ngDevMode === 'undefined' || ngDevMode) {
            // TODO(mmalerba): Implement.
            throw Error('cdk-virtual-scroll: scrollToIndex is currently not supported for the autosize' +
                ' scroll strategy');
        }
    }
    /**
     * Update the buffer parameters.
     * @param minBufferPx The minimum amount of buffer rendered beyond the viewport (in pixels).
     * @param maxBufferPx The number of buffer items to render beyond the edge of the viewport (in
     *     pixels).
     */
    updateBufferSize(minBufferPx, maxBufferPx) {
        if (maxBufferPx < minBufferPx) {
            throw 'CDK virtual scroll: maxBufferPx must be greater than or equal to minBufferPx';
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
        const endBuffer = this._lastRenderedContentOffset +
            this._lastRenderedContentSize -
            (this._lastScrollOffset + viewport.getViewportSize());
        // The amount of unfilled space that should be filled on the side the user is scrolling toward
        // in order to safely absorb the scroll delta.
        const underscan = scrollMagnitude + this._minBufferPx - (scrollDelta < 0 ? startBuffer : endBuffer);
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
                const overscan = (scrollDelta < 0 ? endBuffer : startBuffer) - this._minBufferPx + scrollMagnitude;
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
            end: startIndex + Math.ceil(viewport.getViewportSize() / this._averager.getAverageItemSize()),
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
    get minBufferPx() {
        return this._minBufferPx;
    }
    set minBufferPx(value) {
        this._minBufferPx = coerceNumberProperty(value);
    }
    /**
     * The number of pixels worth of buffer to shoot for when rendering new items.
     * If the actual amount turns out to be less it will not necessarily trigger an additional
     * rendering cycle (as long as the amount of buffer is still greater than `minBufferPx`).
     * Defaults to 200px.
     */
    get maxBufferPx() {
        return this._maxBufferPx;
    }
    set maxBufferPx(value) {
        this._maxBufferPx = coerceNumberProperty(value);
    }
    ngOnChanges() {
        this._scrollStrategy.updateBufferSize(this.minBufferPx, this.maxBufferPx);
    }
}
CdkAutoSizeVirtualScroll.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.3.0", ngImport: i0, type: CdkAutoSizeVirtualScroll, deps: [], target: i0.ɵɵFactoryTarget.Directive });
CdkAutoSizeVirtualScroll.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "13.3.0", type: CdkAutoSizeVirtualScroll, selector: "cdk-virtual-scroll-viewport[autosize]", inputs: { minBufferPx: "minBufferPx", maxBufferPx: "maxBufferPx" }, providers: [
        {
            provide: VIRTUAL_SCROLL_STRATEGY,
            useFactory: _autoSizeVirtualScrollStrategyFactory,
            deps: [forwardRef(() => CdkAutoSizeVirtualScroll)],
        },
    ], usesOnChanges: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.3.0", ngImport: i0, type: CdkAutoSizeVirtualScroll, decorators: [{
            type: Directive,
            args: [{
                    selector: 'cdk-virtual-scroll-viewport[autosize]',
                    providers: [
                        {
                            provide: VIRTUAL_SCROLL_STRATEGY,
                            useFactory: _autoSizeVirtualScrollStrategyFactory,
                            deps: [forwardRef(() => CdkAutoSizeVirtualScroll)],
                        },
                    ],
                }]
        }], propDecorators: { minBufferPx: [{
                type: Input
            }], maxBufferPx: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0by1zaXplLXZpcnR1YWwtc2Nyb2xsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvc2Nyb2xsaW5nL2F1dG8tc2l6ZS12aXJ0dWFsLXNjcm9sbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsb0JBQW9CLEVBQWMsTUFBTSx1QkFBdUIsQ0FBQztBQUV4RSxPQUFPLEVBRUwsdUJBQXVCLEdBRXhCLE1BQU0sd0JBQXdCLENBQUM7QUFDaEMsT0FBTyxFQUFDLFNBQVMsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFZLE1BQU0sZUFBZSxDQUFDO0FBQ3RFLE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxNQUFNLENBQUM7O0FBRWhDOzs7R0FHRztBQUNILE1BQU0sT0FBTyxnQkFBZ0I7SUFVM0IsMEZBQTBGO0lBQzFGLFlBQVksZUFBZSxHQUFHLEVBQUU7UUFWaEMsNkRBQTZEO1FBQ3JELGlCQUFZLEdBQUcsQ0FBQyxDQUFDO1FBVXZCLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxlQUFlLENBQUM7UUFDeEMsSUFBSSxDQUFDLGdCQUFnQixHQUFHLGVBQWUsQ0FBQztJQUMxQyxDQUFDO0lBRUQscUNBQXFDO0lBQ3JDLGtCQUFrQjtRQUNoQixPQUFPLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQztJQUMvQixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILFNBQVMsQ0FBQyxLQUFnQixFQUFFLElBQVk7UUFDdEMsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUMsR0FBRyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUM7UUFDbkUsSUFBSSxjQUFjLEVBQUU7WUFDbEIsTUFBTSxrQkFBa0IsR0FDdEIsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxjQUFjLENBQUM7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QUMsQ0FBQztTQUNuRDtLQUNGOzJGQUVVLHdCQUF3QjtrQkFWcEMsU0FBUzttQkFBQztvQkFDVCxRQUFRLEVBQUUsdUNBQXVDO29CQUNqRCxTQUFTLEVBQUU7d0JBQ1Q7NEJBQ0UsT0FBTyxFQUFFLHVCQUF1Qjs0QkFDaEMsVUFBVSxFQUFFLHFDQUFxQzs0QkFDakQsSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBRSx5QkFBeUIsQ0FBQyxDQUFDO3lCQUNuRDtxQkFDRjtpQkFDRjs4QkFPSyxXQUFXO3NCQURkLEtBQUs7Z0JBZ0JGLFdBQVc7c0JBRGQsS0FBSyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2NvZXJjZU51bWJlclByb3BlcnR5LCBOdW1iZXJJbnB1dH0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvZXJjaW9uJztcbmltcG9ydCB7TGlzdFJhbmdlfSBmcm9tICdAYW5ndWxhci9jZGsvY29sbGVjdGlvbnMnO1xuaW1wb3J0IHtcbiAgQ2RrVmlydHVhbFNjcm9sbFZpZXdwb3J0LFxuICBWSVJUVUFMX1NDUk9MTF9TVFJBVEVHWSxcbiAgVmlydHVhbFNjcm9sbFN0cmF0ZWd5LFxufSBmcm9tICdAYW5ndWxhci9jZGsvc2Nyb2xsaW5nJztcbmltcG9ydCB7RGlyZWN0aXZlLCBmb3J3YXJkUmVmLCBJbnB1dCwgT25DaGFuZ2VzfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7T2JzZXJ2YWJsZX0gZnJvbSAncnhqcyc7XG5cbi8qKlxuICogQSBjbGFzcyB0aGF0IHRyYWNrcyB0aGUgc2l6ZSBvZiBpdGVtcyB0aGF0IGhhdmUgYmVlbiBzZWVuIGFuZCB1c2VzIGl0IHRvIGVzdGltYXRlIHRoZSBhdmVyYWdlXG4gKiBpdGVtIHNpemUuXG4gKi9cbmV4cG9ydCBjbGFzcyBJdGVtU2l6ZUF2ZXJhZ2VyIHtcbiAgLyoqIFRoZSB0b3RhbCBhbW91bnQgb2Ygd2VpZ2h0IGJlaGluZCB0aGUgY3VycmVudCBhdmVyYWdlLiAqL1xuICBwcml2YXRlIF90b3RhbFdlaWdodCA9IDA7XG5cbiAgLyoqIFRoZSBjdXJyZW50IGF2ZXJhZ2UgaXRlbSBzaXplLiAqL1xuICBwcml2YXRlIF9hdmVyYWdlSXRlbVNpemU6IG51bWJlcjtcblxuICAvKiogVGhlIGRlZmF1bHQgc2l6ZSB0byB1c2UgZm9yIGl0ZW1zIHdoZW4gbm8gZGF0YSBpcyBhdmFpbGFibGUuICovXG4gIHByaXZhdGUgX2RlZmF1bHRJdGVtU2l6ZTogbnVtYmVyO1xuXG4gIC8qKiBAcGFyYW0gZGVmYXVsdEl0ZW1TaXplIFRoZSBkZWZhdWx0IHNpemUgdG8gdXNlIGZvciBpdGVtcyB3aGVuIG5vIGRhdGEgaXMgYXZhaWxhYmxlLiAqL1xuICBjb25zdHJ1Y3RvcihkZWZhdWx0SXRlbVNpemUgPSA1MCkge1xuICAgIHRoaXMuX2RlZmF1bHRJdGVtU2l6ZSA9IGRlZmF1bHRJdGVtU2l6ZTtcbiAgICB0aGlzLl9hdmVyYWdlSXRlbVNpemUgPSBkZWZhdWx0SXRlbVNpemU7XG4gIH1cblxuICAvKiogUmV0dXJucyB0aGUgYXZlcmFnZSBpdGVtIHNpemUuICovXG4gIGdldEF2ZXJhZ2VJdGVtU2l6ZSgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9hdmVyYWdlSXRlbVNpemU7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBhIG1lYXN1cmVtZW50IHNhbXBsZSBmb3IgdGhlIGVzdGltYXRvciB0byBjb25zaWRlci5cbiAgICogQHBhcmFtIHJhbmdlIFRoZSBtZWFzdXJlZCByYW5nZS5cbiAgICogQHBhcmFtIHNpemUgVGhlIG1lYXN1cmVkIHNpemUgb2YgdGhlIGdpdmVuIHJhbmdlIGluIHBpeGVscy5cbiAgICovXG4gIGFkZFNhbXBsZShyYW5nZTogTGlzdFJhbmdlLCBzaXplOiBudW1iZXIpIHtcbiAgICBjb25zdCBuZXdUb3RhbFdlaWdodCA9IHRoaXMuX3RvdGFsV2VpZ2h0ICsgcmFuZ2UuZW5kIC0gcmFuZ2Uuc3RhcnQ7XG4gICAgaWYgKG5ld1RvdGFsV2VpZ2h0KSB7XG4gICAgICBjb25zdCBuZXdBdmVyYWdlSXRlbVNpemUgPVxuICAgICAgICAoc2l6ZSArIHRoaXMuX2F2ZXJhZ2VJdGVtU2l6ZSAqIHRoaXMuX3RvdGFsV2VpZ2h0KSAvIG5ld1RvdGFsV2VpZ2h0O1xuICAgICAgaWYgKG5ld0F2ZXJhZ2VJdGVtU2l6ZSkge1xuICAgICAgICB0aGlzLl9hdmVyYWdlSXRlbVNpemUgPSBuZXdBdmVyYWdlSXRlbVNpemU7XG4gICAgICAgIHRoaXMuX3RvdGFsV2VpZ2h0ID0gbmV3VG90YWxXZWlnaHQ7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqIFJlc2V0cyB0aGUgYXZlcmFnZXIuICovXG4gIHJlc2V0KCkge1xuICAgIHRoaXMuX2F2ZXJhZ2VJdGVtU2l6ZSA9IHRoaXMuX2RlZmF1bHRJdGVtU2l6ZTtcbiAgICB0aGlzLl90b3RhbFdlaWdodCA9IDA7XG4gIH1cbn1cblxuLyoqIFZpcnR1YWwgc2Nyb2xsaW5nIHN0cmF0ZWd5IGZvciBsaXN0cyB3aXRoIGl0ZW1zIG9mIHVua25vd24gb3IgZHluYW1pYyBzaXplLiAqL1xuZXhwb3J0IGNsYXNzIEF1dG9TaXplVmlydHVhbFNjcm9sbFN0cmF0ZWd5IGltcGxlbWVudHMgVmlydHVhbFNjcm9sbFN0cmF0ZWd5IHtcbiAgLyoqIEBkb2NzLXByaXZhdGUgSW1wbGVtZW50ZWQgYXMgcGFydCBvZiBWaXJ0dWFsU2Nyb2xsU3RyYXRlZ3kuICovXG4gIHNjcm9sbGVkSW5kZXhDaGFuZ2UgPSBuZXcgT2JzZXJ2YWJsZTxudW1iZXI+KCgpID0+IHtcbiAgICAvLyBUT0RPKG1tYWxlcmJhKTogSW1wbGVtZW50LlxuICAgIGlmICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpIHtcbiAgICAgIHRocm93IEVycm9yKFxuICAgICAgICAnY2RrLXZpcnR1YWwtc2Nyb2xsOiBzY3JvbGxlZEluZGV4Q2hhbmdlIGlzIGN1cnJlbnRseSBub3Qgc3VwcG9ydGVkIGZvciB0aGUnICtcbiAgICAgICAgICAnIGF1dG9zaXplIHNjcm9sbCBzdHJhdGVneScsXG4gICAgICApO1xuICAgIH1cbiAgfSk7XG5cbiAgLyoqIFRoZSBhdHRhY2hlZCB2aWV3cG9ydC4gKi9cbiAgcHJpdmF0ZSBfdmlld3BvcnQ6IENka1ZpcnR1YWxTY3JvbGxWaWV3cG9ydCB8IG51bGwgPSBudWxsO1xuXG4gIC8qKiBUaGUgbWluaW11bSBhbW91bnQgb2YgYnVmZmVyIHJlbmRlcmVkIGJleW9uZCB0aGUgdmlld3BvcnQgKGluIHBpeGVscykuICovXG4gIHByaXZhdGUgX21pbkJ1ZmZlclB4OiBudW1iZXI7XG5cbiAgLyoqIFRoZSBudW1iZXIgb2YgYnVmZmVyIGl0ZW1zIHRvIHJlbmRlciBiZXlvbmQgdGhlIGVkZ2Ugb2YgdGhlIHZpZXdwb3J0IChpbiBwaXhlbHMpLiAqL1xuICBwcml2YXRlIF9tYXhCdWZmZXJQeDogbnVtYmVyO1xuXG4gIC8qKiBUaGUgZXN0aW1hdG9yIHVzZWQgdG8gZXN0aW1hdGUgdGhlIHNpemUgb2YgdW5zZWVuIGl0ZW1zLiAqL1xuICBwcml2YXRlIF9hdmVyYWdlcjogSXRlbVNpemVBdmVyYWdlcjtcblxuICAvKiogVGhlIGxhc3QgbWVhc3VyZWQgc2Nyb2xsIG9mZnNldCBvZiB0aGUgdmlld3BvcnQuICovXG4gIHByaXZhdGUgX2xhc3RTY3JvbGxPZmZzZXQ6IG51bWJlcjtcblxuICAvKiogVGhlIGxhc3QgbWVhc3VyZWQgc2l6ZSBvZiB0aGUgcmVuZGVyZWQgY29udGVudCBpbiB0aGUgdmlld3BvcnQuICovXG4gIHByaXZhdGUgX2xhc3RSZW5kZXJlZENvbnRlbnRTaXplOiBudW1iZXI7XG5cbiAgLyoqIFRoZSBsYXN0IG1lYXN1cmVkIHNpemUgb2YgdGhlIHJlbmRlcmVkIGNvbnRlbnQgaW4gdGhlIHZpZXdwb3J0LiAqL1xuICBwcml2YXRlIF9sYXN0UmVuZGVyZWRDb250ZW50T2Zmc2V0OiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIFRoZSBudW1iZXIgb2YgY29uc2VjdXRpdmUgY3ljbGVzIHdoZXJlIHJlbW92aW5nIGV4dHJhIGl0ZW1zIGhhcyBmYWlsZWQuIEZhaWx1cmUgaGVyZSBtZWFucyB0aGF0XG4gICAqIHdlIGVzdGltYXRlZCBob3cgbWFueSBpdGVtcyB3ZSBjb3VsZCBzYWZlbHkgcmVtb3ZlLCBidXQgb3VyIGVzdGltYXRlIHR1cm5lZCBvdXQgdG8gYmUgdG9vIG11Y2hcbiAgICogYW5kIGl0IHdhc24ndCBzYWZlIHRvIHJlbW92ZSB0aGF0IG1hbnkgZWxlbWVudHMuXG4gICAqL1xuICBwcml2YXRlIF9yZW1vdmFsRmFpbHVyZXMgPSAwO1xuXG4gIC8qKlxuICAgKiBAcGFyYW0gbWluQnVmZmVyUHggVGhlIG1pbmltdW0gYW1vdW50IG9mIGJ1ZmZlciByZW5kZXJlZCBiZXlvbmQgdGhlIHZpZXdwb3J0IChpbiBwaXhlbHMpLlxuICAgKiAgICAgSWYgdGhlIGFtb3VudCBvZiBidWZmZXIgZGlwcyBiZWxvdyB0aGlzIG51bWJlciwgbW9yZSBpdGVtcyB3aWxsIGJlIHJlbmRlcmVkLlxuICAgKiBAcGFyYW0gbWF4QnVmZmVyUHggVGhlIG51bWJlciBvZiBwaXhlbHMgd29ydGggb2YgYnVmZmVyIHRvIHNob290IGZvciB3aGVuIHJlbmRlcmluZyBuZXcgaXRlbXMuXG4gICAqICAgICBJZiB0aGUgYWN0dWFsIGFtb3VudCB0dXJucyBvdXQgdG8gYmUgbGVzcyBpdCB3aWxsIG5vdCBuZWNlc3NhcmlseSB0cmlnZ2VyIGFuIGFkZGl0aW9uYWxcbiAgICogICAgIHJlbmRlcmluZyBjeWNsZSAoYXMgbG9uZyBhcyB0aGUgYW1vdW50IG9mIGJ1ZmZlciBpcyBzdGlsbCBncmVhdGVyIHRoYW4gYG1pbkJ1ZmZlclB4YCkuXG4gICAqIEBwYXJhbSBhdmVyYWdlciBUaGUgYXZlcmFnZXIgdXNlZCB0byBlc3RpbWF0ZSB0aGUgc2l6ZSBvZiB1bnNlZW4gaXRlbXMuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihtaW5CdWZmZXJQeDogbnVtYmVyLCBtYXhCdWZmZXJQeDogbnVtYmVyLCBhdmVyYWdlciA9IG5ldyBJdGVtU2l6ZUF2ZXJhZ2VyKCkpIHtcbiAgICB0aGlzLl9taW5CdWZmZXJQeCA9IG1pbkJ1ZmZlclB4O1xuICAgIHRoaXMuX21heEJ1ZmZlclB4ID0gbWF4QnVmZmVyUHg7XG4gICAgdGhpcy5fYXZlcmFnZXIgPSBhdmVyYWdlcjtcbiAgfVxuXG4gIC8qKlxuICAgKiBBdHRhY2hlcyB0aGlzIHNjcm9sbCBzdHJhdGVneSB0byBhIHZpZXdwb3J0LlxuICAgKiBAcGFyYW0gdmlld3BvcnQgVGhlIHZpZXdwb3J0IHRvIGF0dGFjaCB0aGlzIHN0cmF0ZWd5IHRvLlxuICAgKi9cbiAgYXR0YWNoKHZpZXdwb3J0OiBDZGtWaXJ0dWFsU2Nyb2xsVmlld3BvcnQpIHtcbiAgICB0aGlzLl9hdmVyYWdlci5yZXNldCgpO1xuICAgIHRoaXMuX3ZpZXdwb3J0ID0gdmlld3BvcnQ7XG4gICAgdGhpcy5fcmVuZGVyQ29udGVudEZvckN1cnJlbnRPZmZzZXQoKTtcbiAgfVxuXG4gIC8qKiBEZXRhY2hlcyB0aGlzIHNjcm9sbCBzdHJhdGVneSBmcm9tIHRoZSBjdXJyZW50bHkgYXR0YWNoZWQgdmlld3BvcnQuICovXG4gIGRldGFjaCgpIHtcbiAgICB0aGlzLl92aWV3cG9ydCA9IG51bGw7XG4gIH1cblxuICAvKiogQGRvY3MtcHJpdmF0ZSBJbXBsZW1lbnRlZCBhcyBwYXJ0IG9mIFZpcnR1YWxTY3JvbGxTdHJhdGVneS4gKi9cbiAgb25Db250ZW50U2Nyb2xsZWQoKSB7XG4gICAgaWYgKHRoaXMuX3ZpZXdwb3J0KSB7XG4gICAgICB0aGlzLl91cGRhdGVSZW5kZXJlZENvbnRlbnRBZnRlclNjcm9sbCgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAZG9jcy1wcml2YXRlIEltcGxlbWVudGVkIGFzIHBhcnQgb2YgVmlydHVhbFNjcm9sbFN0cmF0ZWd5LiAqL1xuICBvbkRhdGFMZW5ndGhDaGFuZ2VkKCkge1xuICAgIGlmICh0aGlzLl92aWV3cG9ydCkge1xuICAgICAgdGhpcy5fcmVuZGVyQ29udGVudEZvckN1cnJlbnRPZmZzZXQoKTtcbiAgICAgIHRoaXMuX2NoZWNrUmVuZGVyZWRDb250ZW50U2l6ZSgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAZG9jcy1wcml2YXRlIEltcGxlbWVudGVkIGFzIHBhcnQgb2YgVmlydHVhbFNjcm9sbFN0cmF0ZWd5LiAqL1xuICBvbkNvbnRlbnRSZW5kZXJlZCgpIHtcbiAgICBpZiAodGhpcy5fdmlld3BvcnQpIHtcbiAgICAgIHRoaXMuX2NoZWNrUmVuZGVyZWRDb250ZW50U2l6ZSgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAZG9jcy1wcml2YXRlIEltcGxlbWVudGVkIGFzIHBhcnQgb2YgVmlydHVhbFNjcm9sbFN0cmF0ZWd5LiAqL1xuICBvblJlbmRlcmVkT2Zmc2V0Q2hhbmdlZCgpIHtcbiAgICBpZiAodGhpcy5fdmlld3BvcnQpIHtcbiAgICAgIHRoaXMuX2NoZWNrUmVuZGVyZWRDb250ZW50T2Zmc2V0KCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFNjcm9sbCB0byB0aGUgb2Zmc2V0IGZvciB0aGUgZ2l2ZW4gaW5kZXguICovXG4gIHNjcm9sbFRvSW5kZXgoKTogdm9pZCB7XG4gICAgaWYgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkge1xuICAgICAgLy8gVE9ETyhtbWFsZXJiYSk6IEltcGxlbWVudC5cbiAgICAgIHRocm93IEVycm9yKFxuICAgICAgICAnY2RrLXZpcnR1YWwtc2Nyb2xsOiBzY3JvbGxUb0luZGV4IGlzIGN1cnJlbnRseSBub3Qgc3VwcG9ydGVkIGZvciB0aGUgYXV0b3NpemUnICtcbiAgICAgICAgICAnIHNjcm9sbCBzdHJhdGVneScsXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGUgdGhlIGJ1ZmZlciBwYXJhbWV0ZXJzLlxuICAgKiBAcGFyYW0gbWluQnVmZmVyUHggVGhlIG1pbmltdW0gYW1vdW50IG9mIGJ1ZmZlciByZW5kZXJlZCBiZXlvbmQgdGhlIHZpZXdwb3J0IChpbiBwaXhlbHMpLlxuICAgKiBAcGFyYW0gbWF4QnVmZmVyUHggVGhlIG51bWJlciBvZiBidWZmZXIgaXRlbXMgdG8gcmVuZGVyIGJleW9uZCB0aGUgZWRnZSBvZiB0aGUgdmlld3BvcnQgKGluXG4gICAqICAgICBwaXhlbHMpLlxuICAgKi9cbiAgdXBkYXRlQnVmZmVyU2l6ZShtaW5CdWZmZXJQeDogbnVtYmVyLCBtYXhCdWZmZXJQeDogbnVtYmVyKSB7XG4gICAgaWYgKG1heEJ1ZmZlclB4IDwgbWluQnVmZmVyUHgpIHtcbiAgICAgIHRocm93ICdDREsgdmlydHVhbCBzY3JvbGw6IG1heEJ1ZmZlclB4IG11c3QgYmUgZ3JlYXRlciB0aGFuIG9yIGVxdWFsIHRvIG1pbkJ1ZmZlclB4JztcbiAgICB9XG4gICAgdGhpcy5fbWluQnVmZmVyUHggPSBtaW5CdWZmZXJQeDtcbiAgICB0aGlzLl9tYXhCdWZmZXJQeCA9IG1heEJ1ZmZlclB4O1xuICB9XG5cbiAgLyoqIFVwZGF0ZSB0aGUgcmVuZGVyZWQgY29udGVudCBhZnRlciB0aGUgdXNlciBzY3JvbGxzLiAqL1xuICBwcml2YXRlIF91cGRhdGVSZW5kZXJlZENvbnRlbnRBZnRlclNjcm9sbCgpIHtcbiAgICBjb25zdCB2aWV3cG9ydCA9IHRoaXMuX3ZpZXdwb3J0ITtcblxuICAgIC8vIFRoZSBjdXJyZW50IHNjcm9sbCBvZmZzZXQuXG4gICAgY29uc3Qgc2Nyb2xsT2Zmc2V0ID0gdmlld3BvcnQubWVhc3VyZVNjcm9sbE9mZnNldCgpO1xuICAgIC8vIFRoZSBkZWx0YSBiZXR3ZWVuIHRoZSBjdXJyZW50IHNjcm9sbCBvZmZzZXQgYW5kIHRoZSBwcmV2aW91c2x5IHJlY29yZGVkIHNjcm9sbCBvZmZzZXQuXG4gICAgbGV0IHNjcm9sbERlbHRhID0gc2Nyb2xsT2Zmc2V0IC0gdGhpcy5fbGFzdFNjcm9sbE9mZnNldDtcbiAgICAvLyBUaGUgbWFnbml0dWRlIG9mIHRoZSBzY3JvbGwgZGVsdGEuXG4gICAgbGV0IHNjcm9sbE1hZ25pdHVkZSA9IE1hdGguYWJzKHNjcm9sbERlbHRhKTtcblxuICAgIC8vIFRoZSBjdXJyZW50bHkgcmVuZGVyZWQgcmFuZ2UuXG4gICAgY29uc3QgcmVuZGVyZWRSYW5nZSA9IHZpZXdwb3J0LmdldFJlbmRlcmVkUmFuZ2UoKTtcblxuICAgIC8vIElmIHdlJ3JlIHNjcm9sbGluZyB0b3dhcmQgdGhlIHRvcCwgd2UgbmVlZCB0byBhY2NvdW50IGZvciB0aGUgZmFjdCB0aGF0IHRoZSBwcmVkaWN0ZWQgYW1vdW50XG4gICAgLy8gb2YgY29udGVudCBhbmQgdGhlIGFjdHVhbCBhbW91bnQgb2Ygc2Nyb2xsYWJsZSBzcGFjZSBtYXkgZGlmZmVyLiBXZSBhZGRyZXNzIHRoaXMgYnkgc2xvd2x5XG4gICAgLy8gY29ycmVjdGluZyB0aGUgZGlmZmVyZW5jZSBvbiBlYWNoIHNjcm9sbCBldmVudC5cbiAgICBsZXQgb2Zmc2V0Q29ycmVjdGlvbiA9IDA7XG4gICAgaWYgKHNjcm9sbERlbHRhIDwgMCkge1xuICAgICAgLy8gVGhlIGNvbnRlbnQgb2Zmc2V0IHdlIHdvdWxkIGV4cGVjdCBiYXNlZCBvbiB0aGUgYXZlcmFnZSBpdGVtIHNpemUuXG4gICAgICBjb25zdCBwcmVkaWN0ZWRPZmZzZXQgPSByZW5kZXJlZFJhbmdlLnN0YXJ0ICogdGhpcy5fYXZlcmFnZXIuZ2V0QXZlcmFnZUl0ZW1TaXplKCk7XG4gICAgICAvLyBUaGUgZGlmZmVyZW5jZSBiZXR3ZWVuIHRoZSBwcmVkaWN0ZWQgc2l6ZSBvZiB0aGUgdW5yZW5kZXJlZCBjb250ZW50IGF0IHRoZSBiZWdpbm5pbmcgYW5kXG4gICAgICAvLyB0aGUgYWN0dWFsIGF2YWlsYWJsZSBzcGFjZSB0byBzY3JvbGwgb3Zlci4gV2UgbmVlZCB0byByZWR1Y2UgdGhpcyB0byB6ZXJvIGJ5IHRoZSB0aW1lIHRoZVxuICAgICAgLy8gdXNlciBzY3JvbGxzIHRvIHRoZSB0b3AuXG4gICAgICAvLyAtIDAgaW5kaWNhdGVzIHRoYXQgdGhlIHByZWRpY3RlZCBzaXplIGFuZCBhdmFpbGFibGUgc3BhY2UgYXJlIHRoZSBzYW1lLlxuICAgICAgLy8gLSBBIG5lZ2F0aXZlIG51bWJlciB0aGF0IHRoZSBwcmVkaWN0ZWQgc2l6ZSBpcyBzbWFsbGVyIHRoYW4gdGhlIGF2YWlsYWJsZSBzcGFjZS5cbiAgICAgIC8vIC0gQSBwb3NpdGl2ZSBudW1iZXIgaW5kaWNhdGVzIHRoZSBwcmVkaWN0ZWQgc2l6ZSBpcyBsYXJnZXIgdGhhbiB0aGUgYXZhaWxhYmxlIHNwYWNlXG4gICAgICBjb25zdCBvZmZzZXREaWZmZXJlbmNlID0gcHJlZGljdGVkT2Zmc2V0IC0gdGhpcy5fbGFzdFJlbmRlcmVkQ29udGVudE9mZnNldDtcbiAgICAgIC8vIFRoZSBhbW91bnQgb2YgZGlmZmVyZW5jZSB0byBjb3JyZWN0IGR1cmluZyB0aGlzIHNjcm9sbCBldmVudC4gV2UgY2FsY3VsYXRlIHRoaXMgYXMgYVxuICAgICAgLy8gcGVyY2VudGFnZSBvZiB0aGUgdG90YWwgZGlmZmVyZW5jZSBiYXNlZCBvbiB0aGUgcGVyY2VudGFnZSBvZiB0aGUgZGlzdGFuY2UgdG93YXJkIHRoZSB0b3BcbiAgICAgIC8vIHRoYXQgdGhlIHVzZXIgc2Nyb2xsZWQuXG4gICAgICBvZmZzZXRDb3JyZWN0aW9uID0gTWF0aC5yb3VuZChcbiAgICAgICAgb2Zmc2V0RGlmZmVyZW5jZSAqXG4gICAgICAgICAgTWF0aC5tYXgoMCwgTWF0aC5taW4oMSwgc2Nyb2xsTWFnbml0dWRlIC8gKHNjcm9sbE9mZnNldCArIHNjcm9sbE1hZ25pdHVkZSkpKSxcbiAgICAgICk7XG5cbiAgICAgIC8vIEJhc2VkIG9uIHRoZSBvZmZzZXQgY29ycmVjdGlvbiBhYm92ZSwgd2UgcHJldGVuZCB0aGF0IHRoZSBzY3JvbGwgZGVsdGEgd2FzIGJpZ2dlciBvclxuICAgICAgLy8gc21hbGxlciB0aGFuIGl0IGFjdHVhbGx5IHdhcywgdGhpcyB3YXkgd2UgY2FuIHN0YXJ0IHRvIGVsaW1pbmF0ZSB0aGUgZGlmZmVyZW5jZS5cbiAgICAgIHNjcm9sbERlbHRhID0gc2Nyb2xsRGVsdGEgLSBvZmZzZXRDb3JyZWN0aW9uO1xuICAgICAgc2Nyb2xsTWFnbml0dWRlID0gTWF0aC5hYnMoc2Nyb2xsRGVsdGEpO1xuICAgIH1cblxuICAgIC8vIFRoZSBjdXJyZW50IGFtb3VudCBvZiBidWZmZXIgcGFzdCB0aGUgc3RhcnQgb2YgdGhlIHZpZXdwb3J0LlxuICAgIGNvbnN0IHN0YXJ0QnVmZmVyID0gdGhpcy5fbGFzdFNjcm9sbE9mZnNldCAtIHRoaXMuX2xhc3RSZW5kZXJlZENvbnRlbnRPZmZzZXQ7XG4gICAgLy8gVGhlIGN1cnJlbnQgYW1vdW50IG9mIGJ1ZmZlciBwYXN0IHRoZSBlbmQgb2YgdGhlIHZpZXdwb3J0LlxuICAgIGNvbnN0IGVuZEJ1ZmZlciA9XG4gICAgICB0aGlzLl9sYXN0UmVuZGVyZWRDb250ZW50T2Zmc2V0ICtcbiAgICAgIHRoaXMuX2xhc3RSZW5kZXJlZENvbnRlbnRTaXplIC1cbiAgICAgICh0aGlzLl9sYXN0U2Nyb2xsT2Zmc2V0ICsgdmlld3BvcnQuZ2V0Vmlld3BvcnRTaXplKCkpO1xuICAgIC8vIFRoZSBhbW91bnQgb2YgdW5maWxsZWQgc3BhY2UgdGhhdCBzaG91bGQgYmUgZmlsbGVkIG9uIHRoZSBzaWRlIHRoZSB1c2VyIGlzIHNjcm9sbGluZyB0b3dhcmRcbiAgICAvLyBpbiBvcmRlciB0byBzYWZlbHkgYWJzb3JiIHRoZSBzY3JvbGwgZGVsdGEuXG4gICAgY29uc3QgdW5kZXJzY2FuID1cbiAgICAgIHNjcm9sbE1hZ25pdHVkZSArIHRoaXMuX21pbkJ1ZmZlclB4IC0gKHNjcm9sbERlbHRhIDwgMCA/IHN0YXJ0QnVmZmVyIDogZW5kQnVmZmVyKTtcblxuICAgIC8vIENoZWNrIGlmIHRoZXJlJ3MgdW5maWxsZWQgc3BhY2UgdGhhdCB3ZSBuZWVkIHRvIHJlbmRlciBuZXcgZWxlbWVudHMgdG8gZmlsbC5cbiAgICBpZiAodW5kZXJzY2FuID4gMCkge1xuICAgICAgLy8gQ2hlY2sgaWYgdGhlIHNjcm9sbCBtYWduaXR1ZGUgd2FzIGxhcmdlciB0aGFuIHRoZSB2aWV3cG9ydCBzaXplLiBJbiB0aGlzIGNhc2UgdGhlIHVzZXJcbiAgICAgIC8vIHdvbid0IG5vdGljZSBhIGRpc2NvbnRpbnVpdHkgaWYgd2UganVzdCBqdW1wIHRvIHRoZSBuZXcgZXN0aW1hdGVkIHBvc2l0aW9uIGluIHRoZSBsaXN0LlxuICAgICAgLy8gSG93ZXZlciwgaWYgdGhlIHNjcm9sbCBtYWduaXR1ZGUgaXMgc21hbGxlciB0aGFuIHRoZSB2aWV3cG9ydCB0aGUgdXNlciBtaWdodCBub3RpY2Ugc29tZVxuICAgICAgLy8gaml0dGVyaW5lc3MgaWYgd2UganVzdCBqdW1wIHRvIHRoZSBlc3RpbWF0ZWQgcG9zaXRpb24uIEluc3RlYWQgd2UgbWFrZSBzdXJlIHRvIHNjcm9sbCBieVxuICAgICAgLy8gdGhlIHNhbWUgbnVtYmVyIG9mIHBpeGVscyBhcyB0aGUgc2Nyb2xsIG1hZ25pdHVkZS5cbiAgICAgIGlmIChzY3JvbGxNYWduaXR1ZGUgPj0gdmlld3BvcnQuZ2V0Vmlld3BvcnRTaXplKCkpIHtcbiAgICAgICAgdGhpcy5fcmVuZGVyQ29udGVudEZvckN1cnJlbnRPZmZzZXQoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFRoZSBudW1iZXIgb2YgbmV3IGl0ZW1zIHRvIHJlbmRlciBvbiB0aGUgc2lkZSB0aGUgdXNlciBpcyBzY3JvbGxpbmcgdG93YXJkcy4gUmF0aGVyIHRoYW5cbiAgICAgICAgLy8ganVzdCBmaWxsaW5nIHRoZSB1bmRlcnNjYW4gc3BhY2UsIHdlIGFjdHVhbGx5IGZpbGwgZW5vdWdoIHRvIGhhdmUgYSBidWZmZXIgc2l6ZSBvZlxuICAgICAgICAvLyBgbWF4QnVmZmVyUHhgLiBUaGlzIGdpdmVzIHVzIGEgbGl0dGxlIHdpZ2dsZSByb29tIGluIGNhc2Ugb3VyIGl0ZW0gc2l6ZSBlc3RpbWF0ZSBpcyBvZmYuXG4gICAgICAgIGNvbnN0IGFkZEl0ZW1zID0gTWF0aC5tYXgoXG4gICAgICAgICAgMCxcbiAgICAgICAgICBNYXRoLmNlaWwoXG4gICAgICAgICAgICAodW5kZXJzY2FuIC0gdGhpcy5fbWluQnVmZmVyUHggKyB0aGlzLl9tYXhCdWZmZXJQeCkgL1xuICAgICAgICAgICAgICB0aGlzLl9hdmVyYWdlci5nZXRBdmVyYWdlSXRlbVNpemUoKSxcbiAgICAgICAgICApLFxuICAgICAgICApO1xuICAgICAgICAvLyBUaGUgYW1vdW50IG9mIGZpbGxlZCBzcGFjZSBiZXlvbmQgd2hhdCBpcyBuZWNlc3Nhcnkgb24gdGhlIHNpZGUgdGhlIHVzZXIgaXMgc2Nyb2xsaW5nXG4gICAgICAgIC8vIGF3YXkgZnJvbS5cbiAgICAgICAgY29uc3Qgb3ZlcnNjYW4gPVxuICAgICAgICAgIChzY3JvbGxEZWx0YSA8IDAgPyBlbmRCdWZmZXIgOiBzdGFydEJ1ZmZlcikgLSB0aGlzLl9taW5CdWZmZXJQeCArIHNjcm9sbE1hZ25pdHVkZTtcbiAgICAgICAgLy8gVGhlIG51bWJlciBvZiBjdXJyZW50bHkgcmVuZGVyZWQgaXRlbXMgdG8gcmVtb3ZlIG9uIHRoZSBzaWRlIHRoZSB1c2VyIGlzIHNjcm9sbGluZyBhd2F5XG4gICAgICAgIC8vIGZyb20uIElmIHJlbW92YWwgaGFzIGZhaWxlZCBpbiByZWNlbnQgY3ljbGVzIHdlIGFyZSBsZXNzIGFnZ3Jlc3NpdmUgaW4gaG93IG11Y2ggd2UgdHJ5IHRvXG4gICAgICAgIC8vIHJlbW92ZS5cbiAgICAgICAgY29uc3QgdW5ib3VuZGVkUmVtb3ZlSXRlbXMgPSBNYXRoLmZsb29yKFxuICAgICAgICAgIG92ZXJzY2FuIC8gdGhpcy5fYXZlcmFnZXIuZ2V0QXZlcmFnZUl0ZW1TaXplKCkgLyAodGhpcy5fcmVtb3ZhbEZhaWx1cmVzICsgMSksXG4gICAgICAgICk7XG4gICAgICAgIGNvbnN0IHJlbW92ZUl0ZW1zID0gTWF0aC5taW4oXG4gICAgICAgICAgcmVuZGVyZWRSYW5nZS5lbmQgLSByZW5kZXJlZFJhbmdlLnN0YXJ0LFxuICAgICAgICAgIE1hdGgubWF4KDAsIHVuYm91bmRlZFJlbW92ZUl0ZW1zKSxcbiAgICAgICAgKTtcblxuICAgICAgICAvLyBUaGUgbmV3IHJhbmdlIHdlIHdpbGwgdGVsbCB0aGUgdmlld3BvcnQgdG8gcmVuZGVyLiBXZSBmaXJzdCBleHBhbmQgaXQgdG8gaW5jbHVkZSB0aGUgbmV3XG4gICAgICAgIC8vIGl0ZW1zIHdlIHdhbnQgcmVuZGVyZWQsIHdlIHRoZW4gY29udHJhY3QgdGhlIG9wcG9zaXRlIHNpZGUgdG8gcmVtb3ZlIGl0ZW1zIHdlIG5vIGxvbmdlclxuICAgICAgICAvLyB3YW50IHJlbmRlcmVkLlxuICAgICAgICBjb25zdCByYW5nZSA9IHRoaXMuX2V4cGFuZFJhbmdlKFxuICAgICAgICAgIHJlbmRlcmVkUmFuZ2UsXG4gICAgICAgICAgc2Nyb2xsRGVsdGEgPCAwID8gYWRkSXRlbXMgOiAwLFxuICAgICAgICAgIHNjcm9sbERlbHRhID4gMCA/IGFkZEl0ZW1zIDogMCxcbiAgICAgICAgKTtcbiAgICAgICAgaWYgKHNjcm9sbERlbHRhIDwgMCkge1xuICAgICAgICAgIHJhbmdlLmVuZCA9IE1hdGgubWF4KHJhbmdlLnN0YXJ0ICsgMSwgcmFuZ2UuZW5kIC0gcmVtb3ZlSXRlbXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJhbmdlLnN0YXJ0ID0gTWF0aC5taW4ocmFuZ2UuZW5kIC0gMSwgcmFuZ2Uuc3RhcnQgKyByZW1vdmVJdGVtcyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUaGUgbmV3IG9mZnNldCB3ZSB3YW50IHRvIHNldCBvbiB0aGUgcmVuZGVyZWQgY29udGVudC4gVG8gZGV0ZXJtaW5lIHRoaXMgd2UgbWVhc3VyZSB0aGVcbiAgICAgICAgLy8gbnVtYmVyIG9mIHBpeGVscyB3ZSByZW1vdmVkIGFuZCB0aGVuIGFkanVzdCB0aGUgb2Zmc2V0IHRvIHRoZSBzdGFydCBvZiB0aGUgcmVuZGVyZWRcbiAgICAgICAgLy8gY29udGVudCBvciB0byB0aGUgZW5kIG9mIHRoZSByZW5kZXJlZCBjb250ZW50IGFjY29yZGluZ2x5ICh3aGljaGV2ZXIgb25lIGRvZXNuJ3QgcmVxdWlyZVxuICAgICAgICAvLyB0aGF0IHRoZSBuZXdseSBhZGRlZCBpdGVtcyB0byBiZSByZW5kZXJlZCB0byBjYWxjdWxhdGUuKVxuICAgICAgICBsZXQgY29udGVudE9mZnNldDogbnVtYmVyO1xuICAgICAgICBsZXQgY29udGVudE9mZnNldFRvOiAndG8tc3RhcnQnIHwgJ3RvLWVuZCc7XG4gICAgICAgIGlmIChzY3JvbGxEZWx0YSA8IDApIHtcbiAgICAgICAgICBsZXQgcmVtb3ZlZFNpemUgPSB2aWV3cG9ydC5tZWFzdXJlUmFuZ2VTaXplKHtcbiAgICAgICAgICAgIHN0YXJ0OiByYW5nZS5lbmQsXG4gICAgICAgICAgICBlbmQ6IHJlbmRlcmVkUmFuZ2UuZW5kLFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIC8vIENoZWNrIHRoYXQgd2UncmUgbm90IHJlbW92aW5nIHRvbyBtdWNoLlxuICAgICAgICAgIGlmIChyZW1vdmVkU2l6ZSA8PSBvdmVyc2Nhbikge1xuICAgICAgICAgICAgY29udGVudE9mZnNldCA9XG4gICAgICAgICAgICAgIHRoaXMuX2xhc3RSZW5kZXJlZENvbnRlbnRPZmZzZXQgKyB0aGlzLl9sYXN0UmVuZGVyZWRDb250ZW50U2l6ZSAtIHJlbW92ZWRTaXplO1xuICAgICAgICAgICAgdGhpcy5fcmVtb3ZhbEZhaWx1cmVzID0gMDtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gSWYgdGhlIHJlbW92YWwgaXMgbW9yZSB0aGFuIHRoZSBvdmVyc2NhbiBjYW4gYWJzb3JiIGp1c3QgdW5kbyBpdCBhbmQgcmVjb3JkIHRoZSBmYWN0XG4gICAgICAgICAgICAvLyB0aGF0IHRoZSByZW1vdmFsIGZhaWxlZCBzbyB3ZSBjYW4gYmUgbGVzcyBhZ2dyZXNzaXZlIG5leHQgdGltZS5cbiAgICAgICAgICAgIHJhbmdlLmVuZCA9IHJlbmRlcmVkUmFuZ2UuZW5kO1xuICAgICAgICAgICAgY29udGVudE9mZnNldCA9IHRoaXMuX2xhc3RSZW5kZXJlZENvbnRlbnRPZmZzZXQgKyB0aGlzLl9sYXN0UmVuZGVyZWRDb250ZW50U2l6ZTtcbiAgICAgICAgICAgIHRoaXMuX3JlbW92YWxGYWlsdXJlcysrO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb250ZW50T2Zmc2V0VG8gPSAndG8tZW5kJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zdCByZW1vdmVkU2l6ZSA9IHZpZXdwb3J0Lm1lYXN1cmVSYW5nZVNpemUoe1xuICAgICAgICAgICAgc3RhcnQ6IHJlbmRlcmVkUmFuZ2Uuc3RhcnQsXG4gICAgICAgICAgICBlbmQ6IHJhbmdlLnN0YXJ0LFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIC8vIENoZWNrIHRoYXQgd2UncmUgbm90IHJlbW92aW5nIHRvbyBtdWNoLlxuICAgICAgICAgIGlmIChyZW1vdmVkU2l6ZSA8PSBvdmVyc2Nhbikge1xuICAgICAgICAgICAgY29udGVudE9mZnNldCA9IHRoaXMuX2xhc3RSZW5kZXJlZENvbnRlbnRPZmZzZXQgKyByZW1vdmVkU2l6ZTtcbiAgICAgICAgICAgIHRoaXMuX3JlbW92YWxGYWlsdXJlcyA9IDA7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIElmIHRoZSByZW1vdmFsIGlzIG1vcmUgdGhhbiB0aGUgb3ZlcnNjYW4gY2FuIGFic29yYiBqdXN0IHVuZG8gaXQgYW5kIHJlY29yZCB0aGUgZmFjdFxuICAgICAgICAgICAgLy8gdGhhdCB0aGUgcmVtb3ZhbCBmYWlsZWQgc28gd2UgY2FuIGJlIGxlc3MgYWdncmVzc2l2ZSBuZXh0IHRpbWUuXG4gICAgICAgICAgICByYW5nZS5zdGFydCA9IHJlbmRlcmVkUmFuZ2Uuc3RhcnQ7XG4gICAgICAgICAgICBjb250ZW50T2Zmc2V0ID0gdGhpcy5fbGFzdFJlbmRlcmVkQ29udGVudE9mZnNldDtcbiAgICAgICAgICAgIHRoaXMuX3JlbW92YWxGYWlsdXJlcysrO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb250ZW50T2Zmc2V0VG8gPSAndG8tc3RhcnQnO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gU2V0IHRoZSByYW5nZSBhbmQgb2Zmc2V0IHdlIGNhbGN1bGF0ZWQgYWJvdmUuXG4gICAgICAgIHZpZXdwb3J0LnNldFJlbmRlcmVkUmFuZ2UocmFuZ2UpO1xuICAgICAgICB2aWV3cG9ydC5zZXRSZW5kZXJlZENvbnRlbnRPZmZzZXQoY29udGVudE9mZnNldCArIG9mZnNldENvcnJlY3Rpb24sIGNvbnRlbnRPZmZzZXRUbyk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChvZmZzZXRDb3JyZWN0aW9uKSB7XG4gICAgICAvLyBFdmVuIGlmIHRoZSByZW5kZXJlZCByYW5nZSBkaWRuJ3QgY2hhbmdlLCB3ZSBtYXkgc3RpbGwgbmVlZCB0byBhZGp1c3QgdGhlIGNvbnRlbnQgb2Zmc2V0IHRvXG4gICAgICAvLyBzaW11bGF0ZSBzY3JvbGxpbmcgc2xpZ2h0bHkgc2xvd2VyIG9yIGZhc3RlciB0aGFuIHRoZSB1c2VyIGFjdHVhbGx5IHNjcm9sbGVkLlxuICAgICAgdmlld3BvcnQuc2V0UmVuZGVyZWRDb250ZW50T2Zmc2V0KHRoaXMuX2xhc3RSZW5kZXJlZENvbnRlbnRPZmZzZXQgKyBvZmZzZXRDb3JyZWN0aW9uKTtcbiAgICB9XG5cbiAgICAvLyBTYXZlIHRoZSBzY3JvbGwgb2Zmc2V0IHRvIGJlIGNvbXBhcmVkIHRvIHRoZSBuZXcgdmFsdWUgb24gdGhlIG5leHQgc2Nyb2xsIGV2ZW50LlxuICAgIHRoaXMuX2xhc3RTY3JvbGxPZmZzZXQgPSBzY3JvbGxPZmZzZXQ7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIHRoZSBzaXplIG9mIHRoZSBjdXJyZW50bHkgcmVuZGVyZWQgY29udGVudCBhbmQgdXNlcyBpdCB0byB1cGRhdGUgdGhlIGVzdGltYXRlZCBpdGVtIHNpemVcbiAgICogYW5kIGVzdGltYXRlZCB0b3RhbCBjb250ZW50IHNpemUuXG4gICAqL1xuICBwcml2YXRlIF9jaGVja1JlbmRlcmVkQ29udGVudFNpemUoKSB7XG4gICAgY29uc3Qgdmlld3BvcnQgPSB0aGlzLl92aWV3cG9ydCE7XG4gICAgdGhpcy5fbGFzdFJlbmRlcmVkQ29udGVudFNpemUgPSB2aWV3cG9ydC5tZWFzdXJlUmVuZGVyZWRDb250ZW50U2l6ZSgpO1xuICAgIHRoaXMuX2F2ZXJhZ2VyLmFkZFNhbXBsZSh2aWV3cG9ydC5nZXRSZW5kZXJlZFJhbmdlKCksIHRoaXMuX2xhc3RSZW5kZXJlZENvbnRlbnRTaXplKTtcbiAgICB0aGlzLl91cGRhdGVUb3RhbENvbnRlbnRTaXplKHRoaXMuX2xhc3RSZW5kZXJlZENvbnRlbnRTaXplKTtcbiAgfVxuXG4gIC8qKiBDaGVja3MgdGhlIGN1cnJlbnRseSByZW5kZXJlZCBjb250ZW50IG9mZnNldCBhbmQgc2F2ZXMgdGhlIHZhbHVlIGZvciBsYXRlciB1c2UuICovXG4gIHByaXZhdGUgX2NoZWNrUmVuZGVyZWRDb250ZW50T2Zmc2V0KCkge1xuICAgIGNvbnN0IHZpZXdwb3J0ID0gdGhpcy5fdmlld3BvcnQhO1xuICAgIHRoaXMuX2xhc3RSZW5kZXJlZENvbnRlbnRPZmZzZXQgPSB2aWV3cG9ydC5nZXRPZmZzZXRUb1JlbmRlcmVkQ29udGVudFN0YXJ0KCkhO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlY2FsY3VsYXRlcyB0aGUgcmVuZGVyZWQgY29udGVudCBiYXNlZCBvbiBvdXIgZXN0aW1hdGUgb2Ygd2hhdCBzaG91bGQgYmUgc2hvd24gYXQgdGhlIGN1cnJlbnRcbiAgICogc2Nyb2xsIG9mZnNldC5cbiAgICovXG4gIHByaXZhdGUgX3JlbmRlckNvbnRlbnRGb3JDdXJyZW50T2Zmc2V0KCkge1xuICAgIGNvbnN0IHZpZXdwb3J0ID0gdGhpcy5fdmlld3BvcnQhO1xuICAgIGNvbnN0IHNjcm9sbE9mZnNldCA9IHZpZXdwb3J0Lm1lYXN1cmVTY3JvbGxPZmZzZXQoKTtcbiAgICB0aGlzLl9sYXN0U2Nyb2xsT2Zmc2V0ID0gc2Nyb2xsT2Zmc2V0O1xuICAgIHRoaXMuX3JlbW92YWxGYWlsdXJlcyA9IDA7XG5cbiAgICBjb25zdCBpdGVtU2l6ZSA9IHRoaXMuX2F2ZXJhZ2VyLmdldEF2ZXJhZ2VJdGVtU2l6ZSgpO1xuICAgIGNvbnN0IGZpcnN0VmlzaWJsZUluZGV4ID0gTWF0aC5taW4oXG4gICAgICB2aWV3cG9ydC5nZXREYXRhTGVuZ3RoKCkgLSAxLFxuICAgICAgTWF0aC5mbG9vcihzY3JvbGxPZmZzZXQgLyBpdGVtU2l6ZSksXG4gICAgKTtcbiAgICBjb25zdCBidWZmZXJTaXplID0gTWF0aC5jZWlsKHRoaXMuX21heEJ1ZmZlclB4IC8gaXRlbVNpemUpO1xuICAgIGNvbnN0IHJhbmdlID0gdGhpcy5fZXhwYW5kUmFuZ2UoXG4gICAgICB0aGlzLl9nZXRWaXNpYmxlUmFuZ2VGb3JJbmRleChmaXJzdFZpc2libGVJbmRleCksXG4gICAgICBidWZmZXJTaXplLFxuICAgICAgYnVmZmVyU2l6ZSxcbiAgICApO1xuXG4gICAgdmlld3BvcnQuc2V0UmVuZGVyZWRSYW5nZShyYW5nZSk7XG4gICAgdmlld3BvcnQuc2V0UmVuZGVyZWRDb250ZW50T2Zmc2V0KGl0ZW1TaXplICogcmFuZ2Uuc3RhcnQpO1xuICB9XG5cbiAgLy8gVE9ETzogbWF5YmUgbW92ZSB0byBiYXNlIGNsYXNzLCBjYW4gcHJvYmFibHkgc2hhcmUgd2l0aCBmaXhlZCBzaXplIHN0cmF0ZWd5LlxuICAvKipcbiAgICogR2V0cyB0aGUgdmlzaWJsZSByYW5nZSBvZiBkYXRhIGZvciB0aGUgZ2l2ZW4gc3RhcnQgaW5kZXguIElmIHRoZSBzdGFydCBpbmRleCBpcyB0b28gY2xvc2UgdG9cbiAgICogdGhlIGVuZCBvZiB0aGUgbGlzdCBpdCBtYXkgYmUgYmFja2VkIHVwIHRvIGVuc3VyZSB0aGUgZXN0aW1hdGVkIHNpemUgb2YgdGhlIHJhbmdlIGlzIGVub3VnaCB0b1xuICAgKiBmaWxsIHRoZSB2aWV3cG9ydC5cbiAgICogTm90ZTogbXVzdCBub3QgYmUgY2FsbGVkIGlmIGB0aGlzLl92aWV3cG9ydGAgaXMgbnVsbFxuICAgKiBAcGFyYW0gc3RhcnRJbmRleCBUaGUgaW5kZXggdG8gc3RhcnQgdGhlIHJhbmdlIGF0XG4gICAqIEByZXR1cm4gYSByYW5nZSBlc3RpbWF0ZWQgdG8gYmUgbGFyZ2UgZW5vdWdoIHRvIGZpbGwgdGhlIHZpZXdwb3J0IHdoZW4gcmVuZGVyZWQuXG4gICAqL1xuICBwcml2YXRlIF9nZXRWaXNpYmxlUmFuZ2VGb3JJbmRleChzdGFydEluZGV4OiBudW1iZXIpOiBMaXN0UmFuZ2Uge1xuICAgIGNvbnN0IHZpZXdwb3J0ID0gdGhpcy5fdmlld3BvcnQhO1xuICAgIGNvbnN0IHJhbmdlOiBMaXN0UmFuZ2UgPSB7XG4gICAgICBzdGFydDogc3RhcnRJbmRleCxcbiAgICAgIGVuZDogc3RhcnRJbmRleCArIE1hdGguY2VpbCh2aWV3cG9ydC5nZXRWaWV3cG9ydFNpemUoKSAvIHRoaXMuX2F2ZXJhZ2VyLmdldEF2ZXJhZ2VJdGVtU2l6ZSgpKSxcbiAgICB9O1xuICAgIGNvbnN0IGV4dHJhID0gcmFuZ2UuZW5kIC0gdmlld3BvcnQuZ2V0RGF0YUxlbmd0aCgpO1xuICAgIGlmIChleHRyYSA+IDApIHtcbiAgICAgIHJhbmdlLnN0YXJ0ID0gTWF0aC5tYXgoMCwgcmFuZ2Uuc3RhcnQgLSBleHRyYSk7XG4gICAgfVxuICAgIHJldHVybiByYW5nZTtcbiAgfVxuXG4gIC8vIFRPRE86IG1heWJlIG1vdmUgdG8gYmFzZSBjbGFzcywgY2FuIHByb2JhYmx5IHNoYXJlIHdpdGggZml4ZWQgc2l6ZSBzdHJhdGVneS5cbiAgLyoqXG4gICAqIEV4cGFuZCB0aGUgZ2l2ZW4gcmFuZ2UgYnkgdGhlIGdpdmVuIGFtb3VudCBpbiBlaXRoZXIgZGlyZWN0aW9uLlxuICAgKiBOb3RlOiBtdXN0IG5vdCBiZSBjYWxsZWQgaWYgYHRoaXMuX3ZpZXdwb3J0YCBpcyBudWxsXG4gICAqIEBwYXJhbSByYW5nZSBUaGUgcmFuZ2UgdG8gZXhwYW5kXG4gICAqIEBwYXJhbSBleHBhbmRTdGFydCBUaGUgbnVtYmVyIG9mIGl0ZW1zIHRvIGV4cGFuZCB0aGUgc3RhcnQgb2YgdGhlIHJhbmdlIGJ5LlxuICAgKiBAcGFyYW0gZXhwYW5kRW5kIFRoZSBudW1iZXIgb2YgaXRlbXMgdG8gZXhwYW5kIHRoZSBlbmQgb2YgdGhlIHJhbmdlIGJ5LlxuICAgKiBAcmV0dXJuIFRoZSBleHBhbmRlZCByYW5nZS5cbiAgICovXG4gIHByaXZhdGUgX2V4cGFuZFJhbmdlKHJhbmdlOiBMaXN0UmFuZ2UsIGV4cGFuZFN0YXJ0OiBudW1iZXIsIGV4cGFuZEVuZDogbnVtYmVyKTogTGlzdFJhbmdlIHtcbiAgICBjb25zdCB2aWV3cG9ydCA9IHRoaXMuX3ZpZXdwb3J0ITtcbiAgICBjb25zdCBzdGFydCA9IE1hdGgubWF4KDAsIHJhbmdlLnN0YXJ0IC0gZXhwYW5kU3RhcnQpO1xuICAgIGNvbnN0IGVuZCA9IE1hdGgubWluKHZpZXdwb3J0LmdldERhdGFMZW5ndGgoKSwgcmFuZ2UuZW5kICsgZXhwYW5kRW5kKTtcbiAgICByZXR1cm4ge3N0YXJ0LCBlbmR9O1xuICB9XG5cbiAgLyoqIFVwZGF0ZSB0aGUgdmlld3BvcnQncyB0b3RhbCBjb250ZW50IHNpemUuICovXG4gIHByaXZhdGUgX3VwZGF0ZVRvdGFsQ29udGVudFNpemUocmVuZGVyZWRDb250ZW50U2l6ZTogbnVtYmVyKSB7XG4gICAgY29uc3Qgdmlld3BvcnQgPSB0aGlzLl92aWV3cG9ydCE7XG4gICAgY29uc3QgcmVuZGVyZWRSYW5nZSA9IHZpZXdwb3J0LmdldFJlbmRlcmVkUmFuZ2UoKTtcbiAgICBjb25zdCB0b3RhbFNpemUgPVxuICAgICAgcmVuZGVyZWRDb250ZW50U2l6ZSArXG4gICAgICAodmlld3BvcnQuZ2V0RGF0YUxlbmd0aCgpIC0gKHJlbmRlcmVkUmFuZ2UuZW5kIC0gcmVuZGVyZWRSYW5nZS5zdGFydCkpICpcbiAgICAgICAgdGhpcy5fYXZlcmFnZXIuZ2V0QXZlcmFnZUl0ZW1TaXplKCk7XG4gICAgdmlld3BvcnQuc2V0VG90YWxDb250ZW50U2l6ZSh0b3RhbFNpemUpO1xuICB9XG59XG5cbi8qKlxuICogUHJvdmlkZXIgZmFjdG9yeSBmb3IgYEF1dG9TaXplVmlydHVhbFNjcm9sbFN0cmF0ZWd5YCB0aGF0IHNpbXBseSBleHRyYWN0cyB0aGUgYWxyZWFkeSBjcmVhdGVkXG4gKiBgQXV0b1NpemVWaXJ0dWFsU2Nyb2xsU3RyYXRlZ3lgIGZyb20gdGhlIGdpdmVuIGRpcmVjdGl2ZS5cbiAqIEBwYXJhbSBhdXRvU2l6ZURpciBUaGUgaW5zdGFuY2Ugb2YgYENka0F1dG9TaXplVmlydHVhbFNjcm9sbGAgdG8gZXh0cmFjdCB0aGVcbiAqICAgICBgQXV0b1NpemVWaXJ0dWFsU2Nyb2xsU3RyYXRlZ3lgIGZyb20uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBfYXV0b1NpemVWaXJ0dWFsU2Nyb2xsU3RyYXRlZ3lGYWN0b3J5KGF1dG9TaXplRGlyOiBDZGtBdXRvU2l6ZVZpcnR1YWxTY3JvbGwpIHtcbiAgcmV0dXJuIGF1dG9TaXplRGlyLl9zY3JvbGxTdHJhdGVneTtcbn1cblxuLyoqIEEgdmlydHVhbCBzY3JvbGwgc3RyYXRlZ3kgdGhhdCBzdXBwb3J0cyB1bmtub3duIG9yIGR5bmFtaWMgc2l6ZSBpdGVtcy4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ2Nkay12aXJ0dWFsLXNjcm9sbC12aWV3cG9ydFthdXRvc2l6ZV0nLFxuICBwcm92aWRlcnM6IFtcbiAgICB7XG4gICAgICBwcm92aWRlOiBWSVJUVUFMX1NDUk9MTF9TVFJBVEVHWSxcbiAgICAgIHVzZUZhY3Rvcnk6IF9hdXRvU2l6ZVZpcnR1YWxTY3JvbGxTdHJhdGVneUZhY3RvcnksXG4gICAgICBkZXBzOiBbZm9yd2FyZFJlZigoKSA9PiBDZGtBdXRvU2l6ZVZpcnR1YWxTY3JvbGwpXSxcbiAgICB9LFxuICBdLFxufSlcbmV4cG9ydCBjbGFzcyBDZGtBdXRvU2l6ZVZpcnR1YWxTY3JvbGwgaW1wbGVtZW50cyBPbkNoYW5nZXMge1xuICAvKipcbiAgICogVGhlIG1pbmltdW0gYW1vdW50IG9mIGJ1ZmZlciByZW5kZXJlZCBiZXlvbmQgdGhlIHZpZXdwb3J0IChpbiBwaXhlbHMpLlxuICAgKiBJZiB0aGUgYW1vdW50IG9mIGJ1ZmZlciBkaXBzIGJlbG93IHRoaXMgbnVtYmVyLCBtb3JlIGl0ZW1zIHdpbGwgYmUgcmVuZGVyZWQuIERlZmF1bHRzIHRvIDEwMHB4LlxuICAgKi9cbiAgQElucHV0KClcbiAgZ2V0IG1pbkJ1ZmZlclB4KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX21pbkJ1ZmZlclB4O1xuICB9XG4gIHNldCBtaW5CdWZmZXJQeCh2YWx1ZTogTnVtYmVySW5wdXQpIHtcbiAgICB0aGlzLl9taW5CdWZmZXJQeCA9IGNvZXJjZU51bWJlclByb3BlcnR5KHZhbHVlKTtcbiAgfVxuICBfbWluQnVmZmVyUHggPSAxMDA7XG5cbiAgLyoqXG4gICAqIFRoZSBudW1iZXIgb2YgcGl4ZWxzIHdvcnRoIG9mIGJ1ZmZlciB0byBzaG9vdCBmb3Igd2hlbiByZW5kZXJpbmcgbmV3IGl0ZW1zLlxuICAgKiBJZiB0aGUgYWN0dWFsIGFtb3VudCB0dXJucyBvdXQgdG8gYmUgbGVzcyBpdCB3aWxsIG5vdCBuZWNlc3NhcmlseSB0cmlnZ2VyIGFuIGFkZGl0aW9uYWxcbiAgICogcmVuZGVyaW5nIGN5Y2xlIChhcyBsb25nIGFzIHRoZSBhbW91bnQgb2YgYnVmZmVyIGlzIHN0aWxsIGdyZWF0ZXIgdGhhbiBgbWluQnVmZmVyUHhgKS5cbiAgICogRGVmYXVsdHMgdG8gMjAwcHguXG4gICAqL1xuICBASW5wdXQoKVxuICBnZXQgbWF4QnVmZmVyUHgoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fbWF4QnVmZmVyUHg7XG4gIH1cbiAgc2V0IG1heEJ1ZmZlclB4KHZhbHVlOiBOdW1iZXJJbnB1dCkge1xuICAgIHRoaXMuX21heEJ1ZmZlclB4ID0gY29lcmNlTnVtYmVyUHJvcGVydHkodmFsdWUpO1xuICB9XG4gIF9tYXhCdWZmZXJQeCA9IDIwMDtcblxuICAvKiogVGhlIHNjcm9sbCBzdHJhdGVneSB1c2VkIGJ5IHRoaXMgZGlyZWN0aXZlLiAqL1xuICBfc2Nyb2xsU3RyYXRlZ3kgPSBuZXcgQXV0b1NpemVWaXJ0dWFsU2Nyb2xsU3RyYXRlZ3kodGhpcy5taW5CdWZmZXJQeCwgdGhpcy5tYXhCdWZmZXJQeCk7XG5cbiAgbmdPbkNoYW5nZXMoKSB7XG4gICAgdGhpcy5fc2Nyb2xsU3RyYXRlZ3kudXBkYXRlQnVmZmVyU2l6ZSh0aGlzLm1pbkJ1ZmZlclB4LCB0aGlzLm1heEJ1ZmZlclB4KTtcbiAgfVxufVxuIl19