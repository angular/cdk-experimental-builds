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
            throw Error('CDK virtual scroll: maxBufferPx must be greater than or equal to minBufferPx');
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
            // The difference between the predicted size of the un-rendered content at the beginning and
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.0-next.1", ngImport: i0, type: CdkAutoSizeVirtualScroll, deps: [], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.0.0-next.1", type: CdkAutoSizeVirtualScroll, isStandalone: true, selector: "cdk-virtual-scroll-viewport[autosize]", inputs: { minBufferPx: "minBufferPx", maxBufferPx: "maxBufferPx" }, providers: [
            {
                provide: VIRTUAL_SCROLL_STRATEGY,
                useFactory: _autoSizeVirtualScrollStrategyFactory,
                deps: [forwardRef(() => CdkAutoSizeVirtualScroll)],
            },
        ], usesOnChanges: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.0-next.1", ngImport: i0, type: CdkAutoSizeVirtualScroll, decorators: [{
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
                    standalone: true,
                }]
        }], propDecorators: { minBufferPx: [{
                type: Input
            }], maxBufferPx: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0by1zaXplLXZpcnR1YWwtc2Nyb2xsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvc2Nyb2xsaW5nL2F1dG8tc2l6ZS12aXJ0dWFsLXNjcm9sbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsb0JBQW9CLEVBQWMsTUFBTSx1QkFBdUIsQ0FBQztBQUV4RSxPQUFPLEVBRUwsdUJBQXVCLEdBRXhCLE1BQU0sd0JBQXdCLENBQUM7QUFDaEMsT0FBTyxFQUFDLFNBQVMsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFZLE1BQU0sZUFBZSxDQUFDO0FBQ3RFLE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxNQUFNLENBQUM7O0FBRWhDOzs7R0FHRztBQUNILE1BQU0sT0FBTyxnQkFBZ0I7SUFVM0IsMEZBQTBGO0lBQzFGLFlBQVksZUFBZSxHQUFHLEVBQUU7UUFWaEMsNkRBQTZEO1FBQ3JELGlCQUFZLEdBQUcsQ0FBQyxDQUFDO1FBVXZCLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxlQUFlLENBQUM7UUFDeEMsSUFBSSxDQUFDLGdCQUFnQixHQUFHLGVBQWUsQ0FBQztJQUMxQyxDQUFDO0lBRUQscUNBQXFDO0lBQ3JDLGtCQUFrQjtRQUNoQixPQUFPLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQztJQUMvQixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILFNBQVMsQ0FBQyxLQUFnQixFQUFFLElBQVk7UUFDdEMsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUMsR0FBRyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUM7UUFDbkUsSUFBSSxjQUFjLEVBQUUsQ0FBQztZQUNuQixNQUFNLGtCQUFrQixHQUN0QixDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLGNBQWMs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O0lBTUQsV0FBVztRQUNULElBQUksQ0FBQyxlQUFlLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDNUUsQ0FBQztxSEFsQ1Usd0JBQXdCO3lHQUF4Qix3QkFBd0Isd0pBVHhCO1lBQ1Q7Z0JBQ0UsT0FBTyxFQUFFLHVCQUF1QjtnQkFDaEMsVUFBVSxFQUFFLHFDQUFxQztnQkFDakQsSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDLHdCQUF3QixDQUFDLENBQUM7YUFDbkQ7U0FDRjs7a0dBR1Usd0JBQXdCO2tCQVhwQyxTQUFTO21CQUFDO29CQUNULFFBQVEsRUFBRSx1Q0FBdUM7b0JBQ2pELFNBQVMsRUFBRTt3QkFDVDs0QkFDRSxPQUFPLEVBQUUsdUJBQXVCOzRCQUNoQyxVQUFVLEVBQUUscUNBQXFDOzRCQUNqRCxJQUFJLEVBQUUsQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLHlCQUF5QixDQUFDLENBQUM7eUJBQ25EO3FCQUNGO29CQUNELFVBQVUsRUFBRSxJQUFJO2lCQUNqQjs4QkFPSyxXQUFXO3NCQURkLEtBQUs7Z0JBZ0JGLFdBQVc7c0JBRGQsS0FBSyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2NvZXJjZU51bWJlclByb3BlcnR5LCBOdW1iZXJJbnB1dH0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvZXJjaW9uJztcbmltcG9ydCB7TGlzdFJhbmdlfSBmcm9tICdAYW5ndWxhci9jZGsvY29sbGVjdGlvbnMnO1xuaW1wb3J0IHtcbiAgQ2RrVmlydHVhbFNjcm9sbFZpZXdwb3J0LFxuICBWSVJUVUFMX1NDUk9MTF9TVFJBVEVHWSxcbiAgVmlydHVhbFNjcm9sbFN0cmF0ZWd5LFxufSBmcm9tICdAYW5ndWxhci9jZGsvc2Nyb2xsaW5nJztcbmltcG9ydCB7RGlyZWN0aXZlLCBmb3J3YXJkUmVmLCBJbnB1dCwgT25DaGFuZ2VzfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7T2JzZXJ2YWJsZX0gZnJvbSAncnhqcyc7XG5cbi8qKlxuICogQSBjbGFzcyB0aGF0IHRyYWNrcyB0aGUgc2l6ZSBvZiBpdGVtcyB0aGF0IGhhdmUgYmVlbiBzZWVuIGFuZCB1c2VzIGl0IHRvIGVzdGltYXRlIHRoZSBhdmVyYWdlXG4gKiBpdGVtIHNpemUuXG4gKi9cbmV4cG9ydCBjbGFzcyBJdGVtU2l6ZUF2ZXJhZ2VyIHtcbiAgLyoqIFRoZSB0b3RhbCBhbW91bnQgb2Ygd2VpZ2h0IGJlaGluZCB0aGUgY3VycmVudCBhdmVyYWdlLiAqL1xuICBwcml2YXRlIF90b3RhbFdlaWdodCA9IDA7XG5cbiAgLyoqIFRoZSBjdXJyZW50IGF2ZXJhZ2UgaXRlbSBzaXplLiAqL1xuICBwcml2YXRlIF9hdmVyYWdlSXRlbVNpemU6IG51bWJlcjtcblxuICAvKiogVGhlIGRlZmF1bHQgc2l6ZSB0byB1c2UgZm9yIGl0ZW1zIHdoZW4gbm8gZGF0YSBpcyBhdmFpbGFibGUuICovXG4gIHByaXZhdGUgX2RlZmF1bHRJdGVtU2l6ZTogbnVtYmVyO1xuXG4gIC8qKiBAcGFyYW0gZGVmYXVsdEl0ZW1TaXplIFRoZSBkZWZhdWx0IHNpemUgdG8gdXNlIGZvciBpdGVtcyB3aGVuIG5vIGRhdGEgaXMgYXZhaWxhYmxlLiAqL1xuICBjb25zdHJ1Y3RvcihkZWZhdWx0SXRlbVNpemUgPSA1MCkge1xuICAgIHRoaXMuX2RlZmF1bHRJdGVtU2l6ZSA9IGRlZmF1bHRJdGVtU2l6ZTtcbiAgICB0aGlzLl9hdmVyYWdlSXRlbVNpemUgPSBkZWZhdWx0SXRlbVNpemU7XG4gIH1cblxuICAvKiogUmV0dXJucyB0aGUgYXZlcmFnZSBpdGVtIHNpemUuICovXG4gIGdldEF2ZXJhZ2VJdGVtU2l6ZSgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9hdmVyYWdlSXRlbVNpemU7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBhIG1lYXN1cmVtZW50IHNhbXBsZSBmb3IgdGhlIGVzdGltYXRvciB0byBjb25zaWRlci5cbiAgICogQHBhcmFtIHJhbmdlIFRoZSBtZWFzdXJlZCByYW5nZS5cbiAgICogQHBhcmFtIHNpemUgVGhlIG1lYXN1cmVkIHNpemUgb2YgdGhlIGdpdmVuIHJhbmdlIGluIHBpeGVscy5cbiAgICovXG4gIGFkZFNhbXBsZShyYW5nZTogTGlzdFJhbmdlLCBzaXplOiBudW1iZXIpIHtcbiAgICBjb25zdCBuZXdUb3RhbFdlaWdodCA9IHRoaXMuX3RvdGFsV2VpZ2h0ICsgcmFuZ2UuZW5kIC0gcmFuZ2Uuc3RhcnQ7XG4gICAgaWYgKG5ld1RvdGFsV2VpZ2h0KSB7XG4gICAgICBjb25zdCBuZXdBdmVyYWdlSXRlbVNpemUgPVxuICAgICAgICAoc2l6ZSArIHRoaXMuX2F2ZXJhZ2VJdGVtU2l6ZSAqIHRoaXMuX3RvdGFsV2VpZ2h0KSAvIG5ld1RvdGFsV2VpZ2h0O1xuICAgICAgaWYgKG5ld0F2ZXJhZ2VJdGVtU2l6ZSkge1xuICAgICAgICB0aGlzLl9hdmVyYWdlSXRlbVNpemUgPSBuZXdBdmVyYWdlSXRlbVNpemU7XG4gICAgICAgIHRoaXMuX3RvdGFsV2VpZ2h0ID0gbmV3VG90YWxXZWlnaHQ7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqIFJlc2V0cyB0aGUgYXZlcmFnZXIuICovXG4gIHJlc2V0KCkge1xuICAgIHRoaXMuX2F2ZXJhZ2VJdGVtU2l6ZSA9IHRoaXMuX2RlZmF1bHRJdGVtU2l6ZTtcbiAgICB0aGlzLl90b3RhbFdlaWdodCA9IDA7XG4gIH1cbn1cblxuLyoqIFZpcnR1YWwgc2Nyb2xsaW5nIHN0cmF0ZWd5IGZvciBsaXN0cyB3aXRoIGl0ZW1zIG9mIHVua25vd24gb3IgZHluYW1pYyBzaXplLiAqL1xuZXhwb3J0IGNsYXNzIEF1dG9TaXplVmlydHVhbFNjcm9sbFN0cmF0ZWd5IGltcGxlbWVudHMgVmlydHVhbFNjcm9sbFN0cmF0ZWd5IHtcbiAgLyoqIEBkb2NzLXByaXZhdGUgSW1wbGVtZW50ZWQgYXMgcGFydCBvZiBWaXJ0dWFsU2Nyb2xsU3RyYXRlZ3kuICovXG4gIHNjcm9sbGVkSW5kZXhDaGFuZ2UgPSBuZXcgT2JzZXJ2YWJsZTxudW1iZXI+KCgpID0+IHtcbiAgICAvLyBUT0RPKG1tYWxlcmJhKTogSW1wbGVtZW50LlxuICAgIGlmICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpIHtcbiAgICAgIHRocm93IEVycm9yKFxuICAgICAgICAnY2RrLXZpcnR1YWwtc2Nyb2xsOiBzY3JvbGxlZEluZGV4Q2hhbmdlIGlzIGN1cnJlbnRseSBub3Qgc3VwcG9ydGVkIGZvciB0aGUnICtcbiAgICAgICAgICAnIGF1dG9zaXplIHNjcm9sbCBzdHJhdGVneScsXG4gICAgICApO1xuICAgIH1cbiAgfSk7XG5cbiAgLyoqIFRoZSBhdHRhY2hlZCB2aWV3cG9ydC4gKi9cbiAgcHJpdmF0ZSBfdmlld3BvcnQ6IENka1ZpcnR1YWxTY3JvbGxWaWV3cG9ydCB8IG51bGwgPSBudWxsO1xuXG4gIC8qKiBUaGUgbWluaW11bSBhbW91bnQgb2YgYnVmZmVyIHJlbmRlcmVkIGJleW9uZCB0aGUgdmlld3BvcnQgKGluIHBpeGVscykuICovXG4gIHByaXZhdGUgX21pbkJ1ZmZlclB4OiBudW1iZXI7XG5cbiAgLyoqIFRoZSBudW1iZXIgb2YgYnVmZmVyIGl0ZW1zIHRvIHJlbmRlciBiZXlvbmQgdGhlIGVkZ2Ugb2YgdGhlIHZpZXdwb3J0IChpbiBwaXhlbHMpLiAqL1xuICBwcml2YXRlIF9tYXhCdWZmZXJQeDogbnVtYmVyO1xuXG4gIC8qKiBUaGUgZXN0aW1hdG9yIHVzZWQgdG8gZXN0aW1hdGUgdGhlIHNpemUgb2YgdW5zZWVuIGl0ZW1zLiAqL1xuICBwcml2YXRlIF9hdmVyYWdlcjogSXRlbVNpemVBdmVyYWdlcjtcblxuICAvKiogVGhlIGxhc3QgbWVhc3VyZWQgc2Nyb2xsIG9mZnNldCBvZiB0aGUgdmlld3BvcnQuICovXG4gIHByaXZhdGUgX2xhc3RTY3JvbGxPZmZzZXQ6IG51bWJlcjtcblxuICAvKiogVGhlIGxhc3QgbWVhc3VyZWQgc2l6ZSBvZiB0aGUgcmVuZGVyZWQgY29udGVudCBpbiB0aGUgdmlld3BvcnQuICovXG4gIHByaXZhdGUgX2xhc3RSZW5kZXJlZENvbnRlbnRTaXplOiBudW1iZXI7XG5cbiAgLyoqIFRoZSBsYXN0IG1lYXN1cmVkIHNpemUgb2YgdGhlIHJlbmRlcmVkIGNvbnRlbnQgaW4gdGhlIHZpZXdwb3J0LiAqL1xuICBwcml2YXRlIF9sYXN0UmVuZGVyZWRDb250ZW50T2Zmc2V0OiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIFRoZSBudW1iZXIgb2YgY29uc2VjdXRpdmUgY3ljbGVzIHdoZXJlIHJlbW92aW5nIGV4dHJhIGl0ZW1zIGhhcyBmYWlsZWQuIEZhaWx1cmUgaGVyZSBtZWFucyB0aGF0XG4gICAqIHdlIGVzdGltYXRlZCBob3cgbWFueSBpdGVtcyB3ZSBjb3VsZCBzYWZlbHkgcmVtb3ZlLCBidXQgb3VyIGVzdGltYXRlIHR1cm5lZCBvdXQgdG8gYmUgdG9vIG11Y2hcbiAgICogYW5kIGl0IHdhc24ndCBzYWZlIHRvIHJlbW92ZSB0aGF0IG1hbnkgZWxlbWVudHMuXG4gICAqL1xuICBwcml2YXRlIF9yZW1vdmFsRmFpbHVyZXMgPSAwO1xuXG4gIC8qKlxuICAgKiBAcGFyYW0gbWluQnVmZmVyUHggVGhlIG1pbmltdW0gYW1vdW50IG9mIGJ1ZmZlciByZW5kZXJlZCBiZXlvbmQgdGhlIHZpZXdwb3J0IChpbiBwaXhlbHMpLlxuICAgKiAgICAgSWYgdGhlIGFtb3VudCBvZiBidWZmZXIgZGlwcyBiZWxvdyB0aGlzIG51bWJlciwgbW9yZSBpdGVtcyB3aWxsIGJlIHJlbmRlcmVkLlxuICAgKiBAcGFyYW0gbWF4QnVmZmVyUHggVGhlIG51bWJlciBvZiBwaXhlbHMgd29ydGggb2YgYnVmZmVyIHRvIHNob290IGZvciB3aGVuIHJlbmRlcmluZyBuZXcgaXRlbXMuXG4gICAqICAgICBJZiB0aGUgYWN0dWFsIGFtb3VudCB0dXJucyBvdXQgdG8gYmUgbGVzcyBpdCB3aWxsIG5vdCBuZWNlc3NhcmlseSB0cmlnZ2VyIGFuIGFkZGl0aW9uYWxcbiAgICogICAgIHJlbmRlcmluZyBjeWNsZSAoYXMgbG9uZyBhcyB0aGUgYW1vdW50IG9mIGJ1ZmZlciBpcyBzdGlsbCBncmVhdGVyIHRoYW4gYG1pbkJ1ZmZlclB4YCkuXG4gICAqIEBwYXJhbSBhdmVyYWdlciBUaGUgYXZlcmFnZXIgdXNlZCB0byBlc3RpbWF0ZSB0aGUgc2l6ZSBvZiB1bnNlZW4gaXRlbXMuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihtaW5CdWZmZXJQeDogbnVtYmVyLCBtYXhCdWZmZXJQeDogbnVtYmVyLCBhdmVyYWdlciA9IG5ldyBJdGVtU2l6ZUF2ZXJhZ2VyKCkpIHtcbiAgICB0aGlzLl9taW5CdWZmZXJQeCA9IG1pbkJ1ZmZlclB4O1xuICAgIHRoaXMuX21heEJ1ZmZlclB4ID0gbWF4QnVmZmVyUHg7XG4gICAgdGhpcy5fYXZlcmFnZXIgPSBhdmVyYWdlcjtcbiAgfVxuXG4gIC8qKlxuICAgKiBBdHRhY2hlcyB0aGlzIHNjcm9sbCBzdHJhdGVneSB0byBhIHZpZXdwb3J0LlxuICAgKiBAcGFyYW0gdmlld3BvcnQgVGhlIHZpZXdwb3J0IHRvIGF0dGFjaCB0aGlzIHN0cmF0ZWd5IHRvLlxuICAgKi9cbiAgYXR0YWNoKHZpZXdwb3J0OiBDZGtWaXJ0dWFsU2Nyb2xsVmlld3BvcnQpIHtcbiAgICB0aGlzLl9hdmVyYWdlci5yZXNldCgpO1xuICAgIHRoaXMuX3ZpZXdwb3J0ID0gdmlld3BvcnQ7XG4gICAgdGhpcy5fcmVuZGVyQ29udGVudEZvckN1cnJlbnRPZmZzZXQoKTtcbiAgfVxuXG4gIC8qKiBEZXRhY2hlcyB0aGlzIHNjcm9sbCBzdHJhdGVneSBmcm9tIHRoZSBjdXJyZW50bHkgYXR0YWNoZWQgdmlld3BvcnQuICovXG4gIGRldGFjaCgpIHtcbiAgICB0aGlzLl92aWV3cG9ydCA9IG51bGw7XG4gIH1cblxuICAvKiogQGRvY3MtcHJpdmF0ZSBJbXBsZW1lbnRlZCBhcyBwYXJ0IG9mIFZpcnR1YWxTY3JvbGxTdHJhdGVneS4gKi9cbiAgb25Db250ZW50U2Nyb2xsZWQoKSB7XG4gICAgaWYgKHRoaXMuX3ZpZXdwb3J0KSB7XG4gICAgICB0aGlzLl91cGRhdGVSZW5kZXJlZENvbnRlbnRBZnRlclNjcm9sbCgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAZG9jcy1wcml2YXRlIEltcGxlbWVudGVkIGFzIHBhcnQgb2YgVmlydHVhbFNjcm9sbFN0cmF0ZWd5LiAqL1xuICBvbkRhdGFMZW5ndGhDaGFuZ2VkKCkge1xuICAgIGlmICh0aGlzLl92aWV3cG9ydCkge1xuICAgICAgdGhpcy5fcmVuZGVyQ29udGVudEZvckN1cnJlbnRPZmZzZXQoKTtcbiAgICAgIHRoaXMuX2NoZWNrUmVuZGVyZWRDb250ZW50U2l6ZSgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAZG9jcy1wcml2YXRlIEltcGxlbWVudGVkIGFzIHBhcnQgb2YgVmlydHVhbFNjcm9sbFN0cmF0ZWd5LiAqL1xuICBvbkNvbnRlbnRSZW5kZXJlZCgpIHtcbiAgICBpZiAodGhpcy5fdmlld3BvcnQpIHtcbiAgICAgIHRoaXMuX2NoZWNrUmVuZGVyZWRDb250ZW50U2l6ZSgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAZG9jcy1wcml2YXRlIEltcGxlbWVudGVkIGFzIHBhcnQgb2YgVmlydHVhbFNjcm9sbFN0cmF0ZWd5LiAqL1xuICBvblJlbmRlcmVkT2Zmc2V0Q2hhbmdlZCgpIHtcbiAgICBpZiAodGhpcy5fdmlld3BvcnQpIHtcbiAgICAgIHRoaXMuX2NoZWNrUmVuZGVyZWRDb250ZW50T2Zmc2V0KCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFNjcm9sbCB0byB0aGUgb2Zmc2V0IGZvciB0aGUgZ2l2ZW4gaW5kZXguICovXG4gIHNjcm9sbFRvSW5kZXgoKTogdm9pZCB7XG4gICAgaWYgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkge1xuICAgICAgLy8gVE9ETyhtbWFsZXJiYSk6IEltcGxlbWVudC5cbiAgICAgIHRocm93IEVycm9yKFxuICAgICAgICAnY2RrLXZpcnR1YWwtc2Nyb2xsOiBzY3JvbGxUb0luZGV4IGlzIGN1cnJlbnRseSBub3Qgc3VwcG9ydGVkIGZvciB0aGUgYXV0b3NpemUnICtcbiAgICAgICAgICAnIHNjcm9sbCBzdHJhdGVneScsXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGUgdGhlIGJ1ZmZlciBwYXJhbWV0ZXJzLlxuICAgKiBAcGFyYW0gbWluQnVmZmVyUHggVGhlIG1pbmltdW0gYW1vdW50IG9mIGJ1ZmZlciByZW5kZXJlZCBiZXlvbmQgdGhlIHZpZXdwb3J0IChpbiBwaXhlbHMpLlxuICAgKiBAcGFyYW0gbWF4QnVmZmVyUHggVGhlIG51bWJlciBvZiBidWZmZXIgaXRlbXMgdG8gcmVuZGVyIGJleW9uZCB0aGUgZWRnZSBvZiB0aGUgdmlld3BvcnQgKGluXG4gICAqICAgICBwaXhlbHMpLlxuICAgKi9cbiAgdXBkYXRlQnVmZmVyU2l6ZShtaW5CdWZmZXJQeDogbnVtYmVyLCBtYXhCdWZmZXJQeDogbnVtYmVyKSB7XG4gICAgaWYgKG1heEJ1ZmZlclB4IDwgbWluQnVmZmVyUHgpIHtcbiAgICAgIHRocm93IEVycm9yKCdDREsgdmlydHVhbCBzY3JvbGw6IG1heEJ1ZmZlclB4IG11c3QgYmUgZ3JlYXRlciB0aGFuIG9yIGVxdWFsIHRvIG1pbkJ1ZmZlclB4Jyk7XG4gICAgfVxuICAgIHRoaXMuX21pbkJ1ZmZlclB4ID0gbWluQnVmZmVyUHg7XG4gICAgdGhpcy5fbWF4QnVmZmVyUHggPSBtYXhCdWZmZXJQeDtcbiAgfVxuXG4gIC8qKiBVcGRhdGUgdGhlIHJlbmRlcmVkIGNvbnRlbnQgYWZ0ZXIgdGhlIHVzZXIgc2Nyb2xscy4gKi9cbiAgcHJpdmF0ZSBfdXBkYXRlUmVuZGVyZWRDb250ZW50QWZ0ZXJTY3JvbGwoKSB7XG4gICAgY29uc3Qgdmlld3BvcnQgPSB0aGlzLl92aWV3cG9ydCE7XG5cbiAgICAvLyBUaGUgY3VycmVudCBzY3JvbGwgb2Zmc2V0LlxuICAgIGNvbnN0IHNjcm9sbE9mZnNldCA9IHZpZXdwb3J0Lm1lYXN1cmVTY3JvbGxPZmZzZXQoKTtcbiAgICAvLyBUaGUgZGVsdGEgYmV0d2VlbiB0aGUgY3VycmVudCBzY3JvbGwgb2Zmc2V0IGFuZCB0aGUgcHJldmlvdXNseSByZWNvcmRlZCBzY3JvbGwgb2Zmc2V0LlxuICAgIGxldCBzY3JvbGxEZWx0YSA9IHNjcm9sbE9mZnNldCAtIHRoaXMuX2xhc3RTY3JvbGxPZmZzZXQ7XG4gICAgLy8gVGhlIG1hZ25pdHVkZSBvZiB0aGUgc2Nyb2xsIGRlbHRhLlxuICAgIGxldCBzY3JvbGxNYWduaXR1ZGUgPSBNYXRoLmFicyhzY3JvbGxEZWx0YSk7XG5cbiAgICAvLyBUaGUgY3VycmVudGx5IHJlbmRlcmVkIHJhbmdlLlxuICAgIGNvbnN0IHJlbmRlcmVkUmFuZ2UgPSB2aWV3cG9ydC5nZXRSZW5kZXJlZFJhbmdlKCk7XG5cbiAgICAvLyBJZiB3ZSdyZSBzY3JvbGxpbmcgdG93YXJkIHRoZSB0b3AsIHdlIG5lZWQgdG8gYWNjb3VudCBmb3IgdGhlIGZhY3QgdGhhdCB0aGUgcHJlZGljdGVkIGFtb3VudFxuICAgIC8vIG9mIGNvbnRlbnQgYW5kIHRoZSBhY3R1YWwgYW1vdW50IG9mIHNjcm9sbGFibGUgc3BhY2UgbWF5IGRpZmZlci4gV2UgYWRkcmVzcyB0aGlzIGJ5IHNsb3dseVxuICAgIC8vIGNvcnJlY3RpbmcgdGhlIGRpZmZlcmVuY2Ugb24gZWFjaCBzY3JvbGwgZXZlbnQuXG4gICAgbGV0IG9mZnNldENvcnJlY3Rpb24gPSAwO1xuICAgIGlmIChzY3JvbGxEZWx0YSA8IDApIHtcbiAgICAgIC8vIFRoZSBjb250ZW50IG9mZnNldCB3ZSB3b3VsZCBleHBlY3QgYmFzZWQgb24gdGhlIGF2ZXJhZ2UgaXRlbSBzaXplLlxuICAgICAgY29uc3QgcHJlZGljdGVkT2Zmc2V0ID0gcmVuZGVyZWRSYW5nZS5zdGFydCAqIHRoaXMuX2F2ZXJhZ2VyLmdldEF2ZXJhZ2VJdGVtU2l6ZSgpO1xuICAgICAgLy8gVGhlIGRpZmZlcmVuY2UgYmV0d2VlbiB0aGUgcHJlZGljdGVkIHNpemUgb2YgdGhlIHVuLXJlbmRlcmVkIGNvbnRlbnQgYXQgdGhlIGJlZ2lubmluZyBhbmRcbiAgICAgIC8vIHRoZSBhY3R1YWwgYXZhaWxhYmxlIHNwYWNlIHRvIHNjcm9sbCBvdmVyLiBXZSBuZWVkIHRvIHJlZHVjZSB0aGlzIHRvIHplcm8gYnkgdGhlIHRpbWUgdGhlXG4gICAgICAvLyB1c2VyIHNjcm9sbHMgdG8gdGhlIHRvcC5cbiAgICAgIC8vIC0gMCBpbmRpY2F0ZXMgdGhhdCB0aGUgcHJlZGljdGVkIHNpemUgYW5kIGF2YWlsYWJsZSBzcGFjZSBhcmUgdGhlIHNhbWUuXG4gICAgICAvLyAtIEEgbmVnYXRpdmUgbnVtYmVyIHRoYXQgdGhlIHByZWRpY3RlZCBzaXplIGlzIHNtYWxsZXIgdGhhbiB0aGUgYXZhaWxhYmxlIHNwYWNlLlxuICAgICAgLy8gLSBBIHBvc2l0aXZlIG51bWJlciBpbmRpY2F0ZXMgdGhlIHByZWRpY3RlZCBzaXplIGlzIGxhcmdlciB0aGFuIHRoZSBhdmFpbGFibGUgc3BhY2VcbiAgICAgIGNvbnN0IG9mZnNldERpZmZlcmVuY2UgPSBwcmVkaWN0ZWRPZmZzZXQgLSB0aGlzLl9sYXN0UmVuZGVyZWRDb250ZW50T2Zmc2V0O1xuICAgICAgLy8gVGhlIGFtb3VudCBvZiBkaWZmZXJlbmNlIHRvIGNvcnJlY3QgZHVyaW5nIHRoaXMgc2Nyb2xsIGV2ZW50LiBXZSBjYWxjdWxhdGUgdGhpcyBhcyBhXG4gICAgICAvLyBwZXJjZW50YWdlIG9mIHRoZSB0b3RhbCBkaWZmZXJlbmNlIGJhc2VkIG9uIHRoZSBwZXJjZW50YWdlIG9mIHRoZSBkaXN0YW5jZSB0b3dhcmQgdGhlIHRvcFxuICAgICAgLy8gdGhhdCB0aGUgdXNlciBzY3JvbGxlZC5cbiAgICAgIG9mZnNldENvcnJlY3Rpb24gPSBNYXRoLnJvdW5kKFxuICAgICAgICBvZmZzZXREaWZmZXJlbmNlICpcbiAgICAgICAgICBNYXRoLm1heCgwLCBNYXRoLm1pbigxLCBzY3JvbGxNYWduaXR1ZGUgLyAoc2Nyb2xsT2Zmc2V0ICsgc2Nyb2xsTWFnbml0dWRlKSkpLFxuICAgICAgKTtcblxuICAgICAgLy8gQmFzZWQgb24gdGhlIG9mZnNldCBjb3JyZWN0aW9uIGFib3ZlLCB3ZSBwcmV0ZW5kIHRoYXQgdGhlIHNjcm9sbCBkZWx0YSB3YXMgYmlnZ2VyIG9yXG4gICAgICAvLyBzbWFsbGVyIHRoYW4gaXQgYWN0dWFsbHkgd2FzLCB0aGlzIHdheSB3ZSBjYW4gc3RhcnQgdG8gZWxpbWluYXRlIHRoZSBkaWZmZXJlbmNlLlxuICAgICAgc2Nyb2xsRGVsdGEgPSBzY3JvbGxEZWx0YSAtIG9mZnNldENvcnJlY3Rpb247XG4gICAgICBzY3JvbGxNYWduaXR1ZGUgPSBNYXRoLmFicyhzY3JvbGxEZWx0YSk7XG4gICAgfVxuXG4gICAgLy8gVGhlIGN1cnJlbnQgYW1vdW50IG9mIGJ1ZmZlciBwYXN0IHRoZSBzdGFydCBvZiB0aGUgdmlld3BvcnQuXG4gICAgY29uc3Qgc3RhcnRCdWZmZXIgPSB0aGlzLl9sYXN0U2Nyb2xsT2Zmc2V0IC0gdGhpcy5fbGFzdFJlbmRlcmVkQ29udGVudE9mZnNldDtcbiAgICAvLyBUaGUgY3VycmVudCBhbW91bnQgb2YgYnVmZmVyIHBhc3QgdGhlIGVuZCBvZiB0aGUgdmlld3BvcnQuXG4gICAgY29uc3QgZW5kQnVmZmVyID1cbiAgICAgIHRoaXMuX2xhc3RSZW5kZXJlZENvbnRlbnRPZmZzZXQgK1xuICAgICAgdGhpcy5fbGFzdFJlbmRlcmVkQ29udGVudFNpemUgLVxuICAgICAgKHRoaXMuX2xhc3RTY3JvbGxPZmZzZXQgKyB2aWV3cG9ydC5nZXRWaWV3cG9ydFNpemUoKSk7XG4gICAgLy8gVGhlIGFtb3VudCBvZiB1bmZpbGxlZCBzcGFjZSB0aGF0IHNob3VsZCBiZSBmaWxsZWQgb24gdGhlIHNpZGUgdGhlIHVzZXIgaXMgc2Nyb2xsaW5nIHRvd2FyZFxuICAgIC8vIGluIG9yZGVyIHRvIHNhZmVseSBhYnNvcmIgdGhlIHNjcm9sbCBkZWx0YS5cbiAgICBjb25zdCB1bmRlcnNjYW4gPVxuICAgICAgc2Nyb2xsTWFnbml0dWRlICsgdGhpcy5fbWluQnVmZmVyUHggLSAoc2Nyb2xsRGVsdGEgPCAwID8gc3RhcnRCdWZmZXIgOiBlbmRCdWZmZXIpO1xuXG4gICAgLy8gQ2hlY2sgaWYgdGhlcmUncyB1bmZpbGxlZCBzcGFjZSB0aGF0IHdlIG5lZWQgdG8gcmVuZGVyIG5ldyBlbGVtZW50cyB0byBmaWxsLlxuICAgIGlmICh1bmRlcnNjYW4gPiAwKSB7XG4gICAgICAvLyBDaGVjayBpZiB0aGUgc2Nyb2xsIG1hZ25pdHVkZSB3YXMgbGFyZ2VyIHRoYW4gdGhlIHZpZXdwb3J0IHNpemUuIEluIHRoaXMgY2FzZSB0aGUgdXNlclxuICAgICAgLy8gd29uJ3Qgbm90aWNlIGEgZGlzY29udGludWl0eSBpZiB3ZSBqdXN0IGp1bXAgdG8gdGhlIG5ldyBlc3RpbWF0ZWQgcG9zaXRpb24gaW4gdGhlIGxpc3QuXG4gICAgICAvLyBIb3dldmVyLCBpZiB0aGUgc2Nyb2xsIG1hZ25pdHVkZSBpcyBzbWFsbGVyIHRoYW4gdGhlIHZpZXdwb3J0IHRoZSB1c2VyIG1pZ2h0IG5vdGljZSBzb21lXG4gICAgICAvLyBqaXR0ZXJpbmVzcyBpZiB3ZSBqdXN0IGp1bXAgdG8gdGhlIGVzdGltYXRlZCBwb3NpdGlvbi4gSW5zdGVhZCB3ZSBtYWtlIHN1cmUgdG8gc2Nyb2xsIGJ5XG4gICAgICAvLyB0aGUgc2FtZSBudW1iZXIgb2YgcGl4ZWxzIGFzIHRoZSBzY3JvbGwgbWFnbml0dWRlLlxuICAgICAgaWYgKHNjcm9sbE1hZ25pdHVkZSA+PSB2aWV3cG9ydC5nZXRWaWV3cG9ydFNpemUoKSkge1xuICAgICAgICB0aGlzLl9yZW5kZXJDb250ZW50Rm9yQ3VycmVudE9mZnNldCgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gVGhlIG51bWJlciBvZiBuZXcgaXRlbXMgdG8gcmVuZGVyIG9uIHRoZSBzaWRlIHRoZSB1c2VyIGlzIHNjcm9sbGluZyB0b3dhcmRzLiBSYXRoZXIgdGhhblxuICAgICAgICAvLyBqdXN0IGZpbGxpbmcgdGhlIHVuZGVyc2NhbiBzcGFjZSwgd2UgYWN0dWFsbHkgZmlsbCBlbm91Z2ggdG8gaGF2ZSBhIGJ1ZmZlciBzaXplIG9mXG4gICAgICAgIC8vIGBtYXhCdWZmZXJQeGAuIFRoaXMgZ2l2ZXMgdXMgYSBsaXR0bGUgd2lnZ2xlIHJvb20gaW4gY2FzZSBvdXIgaXRlbSBzaXplIGVzdGltYXRlIGlzIG9mZi5cbiAgICAgICAgY29uc3QgYWRkSXRlbXMgPSBNYXRoLm1heChcbiAgICAgICAgICAwLFxuICAgICAgICAgIE1hdGguY2VpbChcbiAgICAgICAgICAgICh1bmRlcnNjYW4gLSB0aGlzLl9taW5CdWZmZXJQeCArIHRoaXMuX21heEJ1ZmZlclB4KSAvXG4gICAgICAgICAgICAgIHRoaXMuX2F2ZXJhZ2VyLmdldEF2ZXJhZ2VJdGVtU2l6ZSgpLFxuICAgICAgICAgICksXG4gICAgICAgICk7XG4gICAgICAgIC8vIFRoZSBhbW91bnQgb2YgZmlsbGVkIHNwYWNlIGJleW9uZCB3aGF0IGlzIG5lY2Vzc2FyeSBvbiB0aGUgc2lkZSB0aGUgdXNlciBpcyBzY3JvbGxpbmdcbiAgICAgICAgLy8gYXdheSBmcm9tLlxuICAgICAgICBjb25zdCBvdmVyc2NhbiA9XG4gICAgICAgICAgKHNjcm9sbERlbHRhIDwgMCA/IGVuZEJ1ZmZlciA6IHN0YXJ0QnVmZmVyKSAtIHRoaXMuX21pbkJ1ZmZlclB4ICsgc2Nyb2xsTWFnbml0dWRlO1xuICAgICAgICAvLyBUaGUgbnVtYmVyIG9mIGN1cnJlbnRseSByZW5kZXJlZCBpdGVtcyB0byByZW1vdmUgb24gdGhlIHNpZGUgdGhlIHVzZXIgaXMgc2Nyb2xsaW5nIGF3YXlcbiAgICAgICAgLy8gZnJvbS4gSWYgcmVtb3ZhbCBoYXMgZmFpbGVkIGluIHJlY2VudCBjeWNsZXMgd2UgYXJlIGxlc3MgYWdncmVzc2l2ZSBpbiBob3cgbXVjaCB3ZSB0cnkgdG9cbiAgICAgICAgLy8gcmVtb3ZlLlxuICAgICAgICBjb25zdCB1bmJvdW5kZWRSZW1vdmVJdGVtcyA9IE1hdGguZmxvb3IoXG4gICAgICAgICAgb3ZlcnNjYW4gLyB0aGlzLl9hdmVyYWdlci5nZXRBdmVyYWdlSXRlbVNpemUoKSAvICh0aGlzLl9yZW1vdmFsRmFpbHVyZXMgKyAxKSxcbiAgICAgICAgKTtcbiAgICAgICAgY29uc3QgcmVtb3ZlSXRlbXMgPSBNYXRoLm1pbihcbiAgICAgICAgICByZW5kZXJlZFJhbmdlLmVuZCAtIHJlbmRlcmVkUmFuZ2Uuc3RhcnQsXG4gICAgICAgICAgTWF0aC5tYXgoMCwgdW5ib3VuZGVkUmVtb3ZlSXRlbXMpLFxuICAgICAgICApO1xuXG4gICAgICAgIC8vIFRoZSBuZXcgcmFuZ2Ugd2Ugd2lsbCB0ZWxsIHRoZSB2aWV3cG9ydCB0byByZW5kZXIuIFdlIGZpcnN0IGV4cGFuZCBpdCB0byBpbmNsdWRlIHRoZSBuZXdcbiAgICAgICAgLy8gaXRlbXMgd2Ugd2FudCByZW5kZXJlZCwgd2UgdGhlbiBjb250cmFjdCB0aGUgb3Bwb3NpdGUgc2lkZSB0byByZW1vdmUgaXRlbXMgd2Ugbm8gbG9uZ2VyXG4gICAgICAgIC8vIHdhbnQgcmVuZGVyZWQuXG4gICAgICAgIGNvbnN0IHJhbmdlID0gdGhpcy5fZXhwYW5kUmFuZ2UoXG4gICAgICAgICAgcmVuZGVyZWRSYW5nZSxcbiAgICAgICAgICBzY3JvbGxEZWx0YSA8IDAgPyBhZGRJdGVtcyA6IDAsXG4gICAgICAgICAgc2Nyb2xsRGVsdGEgPiAwID8gYWRkSXRlbXMgOiAwLFxuICAgICAgICApO1xuICAgICAgICBpZiAoc2Nyb2xsRGVsdGEgPCAwKSB7XG4gICAgICAgICAgcmFuZ2UuZW5kID0gTWF0aC5tYXgocmFuZ2Uuc3RhcnQgKyAxLCByYW5nZS5lbmQgLSByZW1vdmVJdGVtcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmFuZ2Uuc3RhcnQgPSBNYXRoLm1pbihyYW5nZS5lbmQgLSAxLCByYW5nZS5zdGFydCArIHJlbW92ZUl0ZW1zKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRoZSBuZXcgb2Zmc2V0IHdlIHdhbnQgdG8gc2V0IG9uIHRoZSByZW5kZXJlZCBjb250ZW50LiBUbyBkZXRlcm1pbmUgdGhpcyB3ZSBtZWFzdXJlIHRoZVxuICAgICAgICAvLyBudW1iZXIgb2YgcGl4ZWxzIHdlIHJlbW92ZWQgYW5kIHRoZW4gYWRqdXN0IHRoZSBvZmZzZXQgdG8gdGhlIHN0YXJ0IG9mIHRoZSByZW5kZXJlZFxuICAgICAgICAvLyBjb250ZW50IG9yIHRvIHRoZSBlbmQgb2YgdGhlIHJlbmRlcmVkIGNvbnRlbnQgYWNjb3JkaW5nbHkgKHdoaWNoZXZlciBvbmUgZG9lc24ndCByZXF1aXJlXG4gICAgICAgIC8vIHRoYXQgdGhlIG5ld2x5IGFkZGVkIGl0ZW1zIHRvIGJlIHJlbmRlcmVkIHRvIGNhbGN1bGF0ZS4pXG4gICAgICAgIGxldCBjb250ZW50T2Zmc2V0OiBudW1iZXI7XG4gICAgICAgIGxldCBjb250ZW50T2Zmc2V0VG86ICd0by1zdGFydCcgfCAndG8tZW5kJztcbiAgICAgICAgaWYgKHNjcm9sbERlbHRhIDwgMCkge1xuICAgICAgICAgIGxldCByZW1vdmVkU2l6ZSA9IHZpZXdwb3J0Lm1lYXN1cmVSYW5nZVNpemUoe1xuICAgICAgICAgICAgc3RhcnQ6IHJhbmdlLmVuZCxcbiAgICAgICAgICAgIGVuZDogcmVuZGVyZWRSYW5nZS5lbmQsXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgLy8gQ2hlY2sgdGhhdCB3ZSdyZSBub3QgcmVtb3ZpbmcgdG9vIG11Y2guXG4gICAgICAgICAgaWYgKHJlbW92ZWRTaXplIDw9IG92ZXJzY2FuKSB7XG4gICAgICAgICAgICBjb250ZW50T2Zmc2V0ID1cbiAgICAgICAgICAgICAgdGhpcy5fbGFzdFJlbmRlcmVkQ29udGVudE9mZnNldCArIHRoaXMuX2xhc3RSZW5kZXJlZENvbnRlbnRTaXplIC0gcmVtb3ZlZFNpemU7XG4gICAgICAgICAgICB0aGlzLl9yZW1vdmFsRmFpbHVyZXMgPSAwO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBJZiB0aGUgcmVtb3ZhbCBpcyBtb3JlIHRoYW4gdGhlIG92ZXJzY2FuIGNhbiBhYnNvcmIganVzdCB1bmRvIGl0IGFuZCByZWNvcmQgdGhlIGZhY3RcbiAgICAgICAgICAgIC8vIHRoYXQgdGhlIHJlbW92YWwgZmFpbGVkIHNvIHdlIGNhbiBiZSBsZXNzIGFnZ3Jlc3NpdmUgbmV4dCB0aW1lLlxuICAgICAgICAgICAgcmFuZ2UuZW5kID0gcmVuZGVyZWRSYW5nZS5lbmQ7XG4gICAgICAgICAgICBjb250ZW50T2Zmc2V0ID0gdGhpcy5fbGFzdFJlbmRlcmVkQ29udGVudE9mZnNldCArIHRoaXMuX2xhc3RSZW5kZXJlZENvbnRlbnRTaXplO1xuICAgICAgICAgICAgdGhpcy5fcmVtb3ZhbEZhaWx1cmVzKys7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnRlbnRPZmZzZXRUbyA9ICd0by1lbmQnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnN0IHJlbW92ZWRTaXplID0gdmlld3BvcnQubWVhc3VyZVJhbmdlU2l6ZSh7XG4gICAgICAgICAgICBzdGFydDogcmVuZGVyZWRSYW5nZS5zdGFydCxcbiAgICAgICAgICAgIGVuZDogcmFuZ2Uuc3RhcnQsXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgLy8gQ2hlY2sgdGhhdCB3ZSdyZSBub3QgcmVtb3ZpbmcgdG9vIG11Y2guXG4gICAgICAgICAgaWYgKHJlbW92ZWRTaXplIDw9IG92ZXJzY2FuKSB7XG4gICAgICAgICAgICBjb250ZW50T2Zmc2V0ID0gdGhpcy5fbGFzdFJlbmRlcmVkQ29udGVudE9mZnNldCArIHJlbW92ZWRTaXplO1xuICAgICAgICAgICAgdGhpcy5fcmVtb3ZhbEZhaWx1cmVzID0gMDtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gSWYgdGhlIHJlbW92YWwgaXMgbW9yZSB0aGFuIHRoZSBvdmVyc2NhbiBjYW4gYWJzb3JiIGp1c3QgdW5kbyBpdCBhbmQgcmVjb3JkIHRoZSBmYWN0XG4gICAgICAgICAgICAvLyB0aGF0IHRoZSByZW1vdmFsIGZhaWxlZCBzbyB3ZSBjYW4gYmUgbGVzcyBhZ2dyZXNzaXZlIG5leHQgdGltZS5cbiAgICAgICAgICAgIHJhbmdlLnN0YXJ0ID0gcmVuZGVyZWRSYW5nZS5zdGFydDtcbiAgICAgICAgICAgIGNvbnRlbnRPZmZzZXQgPSB0aGlzLl9sYXN0UmVuZGVyZWRDb250ZW50T2Zmc2V0O1xuICAgICAgICAgICAgdGhpcy5fcmVtb3ZhbEZhaWx1cmVzKys7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnRlbnRPZmZzZXRUbyA9ICd0by1zdGFydCc7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTZXQgdGhlIHJhbmdlIGFuZCBvZmZzZXQgd2UgY2FsY3VsYXRlZCBhYm92ZS5cbiAgICAgICAgdmlld3BvcnQuc2V0UmVuZGVyZWRSYW5nZShyYW5nZSk7XG4gICAgICAgIHZpZXdwb3J0LnNldFJlbmRlcmVkQ29udGVudE9mZnNldChjb250ZW50T2Zmc2V0ICsgb2Zmc2V0Q29ycmVjdGlvbiwgY29udGVudE9mZnNldFRvKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKG9mZnNldENvcnJlY3Rpb24pIHtcbiAgICAgIC8vIEV2ZW4gaWYgdGhlIHJlbmRlcmVkIHJhbmdlIGRpZG4ndCBjaGFuZ2UsIHdlIG1heSBzdGlsbCBuZWVkIHRvIGFkanVzdCB0aGUgY29udGVudCBvZmZzZXQgdG9cbiAgICAgIC8vIHNpbXVsYXRlIHNjcm9sbGluZyBzbGlnaHRseSBzbG93ZXIgb3IgZmFzdGVyIHRoYW4gdGhlIHVzZXIgYWN0dWFsbHkgc2Nyb2xsZWQuXG4gICAgICB2aWV3cG9ydC5zZXRSZW5kZXJlZENvbnRlbnRPZmZzZXQodGhpcy5fbGFzdFJlbmRlcmVkQ29udGVudE9mZnNldCArIG9mZnNldENvcnJlY3Rpb24pO1xuICAgIH1cblxuICAgIC8vIFNhdmUgdGhlIHNjcm9sbCBvZmZzZXQgdG8gYmUgY29tcGFyZWQgdG8gdGhlIG5ldyB2YWx1ZSBvbiB0aGUgbmV4dCBzY3JvbGwgZXZlbnQuXG4gICAgdGhpcy5fbGFzdFNjcm9sbE9mZnNldCA9IHNjcm9sbE9mZnNldDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3MgdGhlIHNpemUgb2YgdGhlIGN1cnJlbnRseSByZW5kZXJlZCBjb250ZW50IGFuZCB1c2VzIGl0IHRvIHVwZGF0ZSB0aGUgZXN0aW1hdGVkIGl0ZW0gc2l6ZVxuICAgKiBhbmQgZXN0aW1hdGVkIHRvdGFsIGNvbnRlbnQgc2l6ZS5cbiAgICovXG4gIHByaXZhdGUgX2NoZWNrUmVuZGVyZWRDb250ZW50U2l6ZSgpIHtcbiAgICBjb25zdCB2aWV3cG9ydCA9IHRoaXMuX3ZpZXdwb3J0ITtcbiAgICB0aGlzLl9sYXN0UmVuZGVyZWRDb250ZW50U2l6ZSA9IHZpZXdwb3J0Lm1lYXN1cmVSZW5kZXJlZENvbnRlbnRTaXplKCk7XG4gICAgdGhpcy5fYXZlcmFnZXIuYWRkU2FtcGxlKHZpZXdwb3J0LmdldFJlbmRlcmVkUmFuZ2UoKSwgdGhpcy5fbGFzdFJlbmRlcmVkQ29udGVudFNpemUpO1xuICAgIHRoaXMuX3VwZGF0ZVRvdGFsQ29udGVudFNpemUodGhpcy5fbGFzdFJlbmRlcmVkQ29udGVudFNpemUpO1xuICB9XG5cbiAgLyoqIENoZWNrcyB0aGUgY3VycmVudGx5IHJlbmRlcmVkIGNvbnRlbnQgb2Zmc2V0IGFuZCBzYXZlcyB0aGUgdmFsdWUgZm9yIGxhdGVyIHVzZS4gKi9cbiAgcHJpdmF0ZSBfY2hlY2tSZW5kZXJlZENvbnRlbnRPZmZzZXQoKSB7XG4gICAgY29uc3Qgdmlld3BvcnQgPSB0aGlzLl92aWV3cG9ydCE7XG4gICAgdGhpcy5fbGFzdFJlbmRlcmVkQ29udGVudE9mZnNldCA9IHZpZXdwb3J0LmdldE9mZnNldFRvUmVuZGVyZWRDb250ZW50U3RhcnQoKSE7XG4gIH1cblxuICAvKipcbiAgICogUmVjYWxjdWxhdGVzIHRoZSByZW5kZXJlZCBjb250ZW50IGJhc2VkIG9uIG91ciBlc3RpbWF0ZSBvZiB3aGF0IHNob3VsZCBiZSBzaG93biBhdCB0aGUgY3VycmVudFxuICAgKiBzY3JvbGwgb2Zmc2V0LlxuICAgKi9cbiAgcHJpdmF0ZSBfcmVuZGVyQ29udGVudEZvckN1cnJlbnRPZmZzZXQoKSB7XG4gICAgY29uc3Qgdmlld3BvcnQgPSB0aGlzLl92aWV3cG9ydCE7XG4gICAgY29uc3Qgc2Nyb2xsT2Zmc2V0ID0gdmlld3BvcnQubWVhc3VyZVNjcm9sbE9mZnNldCgpO1xuICAgIHRoaXMuX2xhc3RTY3JvbGxPZmZzZXQgPSBzY3JvbGxPZmZzZXQ7XG4gICAgdGhpcy5fcmVtb3ZhbEZhaWx1cmVzID0gMDtcblxuICAgIGNvbnN0IGl0ZW1TaXplID0gdGhpcy5fYXZlcmFnZXIuZ2V0QXZlcmFnZUl0ZW1TaXplKCk7XG4gICAgY29uc3QgZmlyc3RWaXNpYmxlSW5kZXggPSBNYXRoLm1pbihcbiAgICAgIHZpZXdwb3J0LmdldERhdGFMZW5ndGgoKSAtIDEsXG4gICAgICBNYXRoLmZsb29yKHNjcm9sbE9mZnNldCAvIGl0ZW1TaXplKSxcbiAgICApO1xuICAgIGNvbnN0IGJ1ZmZlclNpemUgPSBNYXRoLmNlaWwodGhpcy5fbWF4QnVmZmVyUHggLyBpdGVtU2l6ZSk7XG4gICAgY29uc3QgcmFuZ2UgPSB0aGlzLl9leHBhbmRSYW5nZShcbiAgICAgIHRoaXMuX2dldFZpc2libGVSYW5nZUZvckluZGV4KGZpcnN0VmlzaWJsZUluZGV4KSxcbiAgICAgIGJ1ZmZlclNpemUsXG4gICAgICBidWZmZXJTaXplLFxuICAgICk7XG5cbiAgICB2aWV3cG9ydC5zZXRSZW5kZXJlZFJhbmdlKHJhbmdlKTtcbiAgICB2aWV3cG9ydC5zZXRSZW5kZXJlZENvbnRlbnRPZmZzZXQoaXRlbVNpemUgKiByYW5nZS5zdGFydCk7XG4gIH1cblxuICAvLyBUT0RPOiBtYXliZSBtb3ZlIHRvIGJhc2UgY2xhc3MsIGNhbiBwcm9iYWJseSBzaGFyZSB3aXRoIGZpeGVkIHNpemUgc3RyYXRlZ3kuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSB2aXNpYmxlIHJhbmdlIG9mIGRhdGEgZm9yIHRoZSBnaXZlbiBzdGFydCBpbmRleC4gSWYgdGhlIHN0YXJ0IGluZGV4IGlzIHRvbyBjbG9zZSB0b1xuICAgKiB0aGUgZW5kIG9mIHRoZSBsaXN0IGl0IG1heSBiZSBiYWNrZWQgdXAgdG8gZW5zdXJlIHRoZSBlc3RpbWF0ZWQgc2l6ZSBvZiB0aGUgcmFuZ2UgaXMgZW5vdWdoIHRvXG4gICAqIGZpbGwgdGhlIHZpZXdwb3J0LlxuICAgKiBOb3RlOiBtdXN0IG5vdCBiZSBjYWxsZWQgaWYgYHRoaXMuX3ZpZXdwb3J0YCBpcyBudWxsXG4gICAqIEBwYXJhbSBzdGFydEluZGV4IFRoZSBpbmRleCB0byBzdGFydCB0aGUgcmFuZ2UgYXRcbiAgICogQHJldHVybiBhIHJhbmdlIGVzdGltYXRlZCB0byBiZSBsYXJnZSBlbm91Z2ggdG8gZmlsbCB0aGUgdmlld3BvcnQgd2hlbiByZW5kZXJlZC5cbiAgICovXG4gIHByaXZhdGUgX2dldFZpc2libGVSYW5nZUZvckluZGV4KHN0YXJ0SW5kZXg6IG51bWJlcik6IExpc3RSYW5nZSB7XG4gICAgY29uc3Qgdmlld3BvcnQgPSB0aGlzLl92aWV3cG9ydCE7XG4gICAgY29uc3QgcmFuZ2U6IExpc3RSYW5nZSA9IHtcbiAgICAgIHN0YXJ0OiBzdGFydEluZGV4LFxuICAgICAgZW5kOiBzdGFydEluZGV4ICsgTWF0aC5jZWlsKHZpZXdwb3J0LmdldFZpZXdwb3J0U2l6ZSgpIC8gdGhpcy5fYXZlcmFnZXIuZ2V0QXZlcmFnZUl0ZW1TaXplKCkpLFxuICAgIH07XG4gICAgY29uc3QgZXh0cmEgPSByYW5nZS5lbmQgLSB2aWV3cG9ydC5nZXREYXRhTGVuZ3RoKCk7XG4gICAgaWYgKGV4dHJhID4gMCkge1xuICAgICAgcmFuZ2Uuc3RhcnQgPSBNYXRoLm1heCgwLCByYW5nZS5zdGFydCAtIGV4dHJhKTtcbiAgICB9XG4gICAgcmV0dXJuIHJhbmdlO1xuICB9XG5cbiAgLy8gVE9ETzogbWF5YmUgbW92ZSB0byBiYXNlIGNsYXNzLCBjYW4gcHJvYmFibHkgc2hhcmUgd2l0aCBmaXhlZCBzaXplIHN0cmF0ZWd5LlxuICAvKipcbiAgICogRXhwYW5kIHRoZSBnaXZlbiByYW5nZSBieSB0aGUgZ2l2ZW4gYW1vdW50IGluIGVpdGhlciBkaXJlY3Rpb24uXG4gICAqIE5vdGU6IG11c3Qgbm90IGJlIGNhbGxlZCBpZiBgdGhpcy5fdmlld3BvcnRgIGlzIG51bGxcbiAgICogQHBhcmFtIHJhbmdlIFRoZSByYW5nZSB0byBleHBhbmRcbiAgICogQHBhcmFtIGV4cGFuZFN0YXJ0IFRoZSBudW1iZXIgb2YgaXRlbXMgdG8gZXhwYW5kIHRoZSBzdGFydCBvZiB0aGUgcmFuZ2UgYnkuXG4gICAqIEBwYXJhbSBleHBhbmRFbmQgVGhlIG51bWJlciBvZiBpdGVtcyB0byBleHBhbmQgdGhlIGVuZCBvZiB0aGUgcmFuZ2UgYnkuXG4gICAqIEByZXR1cm4gVGhlIGV4cGFuZGVkIHJhbmdlLlxuICAgKi9cbiAgcHJpdmF0ZSBfZXhwYW5kUmFuZ2UocmFuZ2U6IExpc3RSYW5nZSwgZXhwYW5kU3RhcnQ6IG51bWJlciwgZXhwYW5kRW5kOiBudW1iZXIpOiBMaXN0UmFuZ2Uge1xuICAgIGNvbnN0IHZpZXdwb3J0ID0gdGhpcy5fdmlld3BvcnQhO1xuICAgIGNvbnN0IHN0YXJ0ID0gTWF0aC5tYXgoMCwgcmFuZ2Uuc3RhcnQgLSBleHBhbmRTdGFydCk7XG4gICAgY29uc3QgZW5kID0gTWF0aC5taW4odmlld3BvcnQuZ2V0RGF0YUxlbmd0aCgpLCByYW5nZS5lbmQgKyBleHBhbmRFbmQpO1xuICAgIHJldHVybiB7c3RhcnQsIGVuZH07XG4gIH1cblxuICAvKiogVXBkYXRlIHRoZSB2aWV3cG9ydCdzIHRvdGFsIGNvbnRlbnQgc2l6ZS4gKi9cbiAgcHJpdmF0ZSBfdXBkYXRlVG90YWxDb250ZW50U2l6ZShyZW5kZXJlZENvbnRlbnRTaXplOiBudW1iZXIpIHtcbiAgICBjb25zdCB2aWV3cG9ydCA9IHRoaXMuX3ZpZXdwb3J0ITtcbiAgICBjb25zdCByZW5kZXJlZFJhbmdlID0gdmlld3BvcnQuZ2V0UmVuZGVyZWRSYW5nZSgpO1xuICAgIGNvbnN0IHRvdGFsU2l6ZSA9XG4gICAgICByZW5kZXJlZENvbnRlbnRTaXplICtcbiAgICAgICh2aWV3cG9ydC5nZXREYXRhTGVuZ3RoKCkgLSAocmVuZGVyZWRSYW5nZS5lbmQgLSByZW5kZXJlZFJhbmdlLnN0YXJ0KSkgKlxuICAgICAgICB0aGlzLl9hdmVyYWdlci5nZXRBdmVyYWdlSXRlbVNpemUoKTtcbiAgICB2aWV3cG9ydC5zZXRUb3RhbENvbnRlbnRTaXplKHRvdGFsU2l6ZSk7XG4gIH1cbn1cblxuLyoqXG4gKiBQcm92aWRlciBmYWN0b3J5IGZvciBgQXV0b1NpemVWaXJ0dWFsU2Nyb2xsU3RyYXRlZ3lgIHRoYXQgc2ltcGx5IGV4dHJhY3RzIHRoZSBhbHJlYWR5IGNyZWF0ZWRcbiAqIGBBdXRvU2l6ZVZpcnR1YWxTY3JvbGxTdHJhdGVneWAgZnJvbSB0aGUgZ2l2ZW4gZGlyZWN0aXZlLlxuICogQHBhcmFtIGF1dG9TaXplRGlyIFRoZSBpbnN0YW5jZSBvZiBgQ2RrQXV0b1NpemVWaXJ0dWFsU2Nyb2xsYCB0byBleHRyYWN0IHRoZVxuICogICAgIGBBdXRvU2l6ZVZpcnR1YWxTY3JvbGxTdHJhdGVneWAgZnJvbS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIF9hdXRvU2l6ZVZpcnR1YWxTY3JvbGxTdHJhdGVneUZhY3RvcnkoYXV0b1NpemVEaXI6IENka0F1dG9TaXplVmlydHVhbFNjcm9sbCkge1xuICByZXR1cm4gYXV0b1NpemVEaXIuX3Njcm9sbFN0cmF0ZWd5O1xufVxuXG4vKiogQSB2aXJ0dWFsIHNjcm9sbCBzdHJhdGVneSB0aGF0IHN1cHBvcnRzIHVua25vd24gb3IgZHluYW1pYyBzaXplIGl0ZW1zLiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnY2RrLXZpcnR1YWwtc2Nyb2xsLXZpZXdwb3J0W2F1dG9zaXplXScsXG4gIHByb3ZpZGVyczogW1xuICAgIHtcbiAgICAgIHByb3ZpZGU6IFZJUlRVQUxfU0NST0xMX1NUUkFURUdZLFxuICAgICAgdXNlRmFjdG9yeTogX2F1dG9TaXplVmlydHVhbFNjcm9sbFN0cmF0ZWd5RmFjdG9yeSxcbiAgICAgIGRlcHM6IFtmb3J3YXJkUmVmKCgpID0+IENka0F1dG9TaXplVmlydHVhbFNjcm9sbCldLFxuICAgIH0sXG4gIF0sXG4gIHN0YW5kYWxvbmU6IHRydWUsXG59KVxuZXhwb3J0IGNsYXNzIENka0F1dG9TaXplVmlydHVhbFNjcm9sbCBpbXBsZW1lbnRzIE9uQ2hhbmdlcyB7XG4gIC8qKlxuICAgKiBUaGUgbWluaW11bSBhbW91bnQgb2YgYnVmZmVyIHJlbmRlcmVkIGJleW9uZCB0aGUgdmlld3BvcnQgKGluIHBpeGVscykuXG4gICAqIElmIHRoZSBhbW91bnQgb2YgYnVmZmVyIGRpcHMgYmVsb3cgdGhpcyBudW1iZXIsIG1vcmUgaXRlbXMgd2lsbCBiZSByZW5kZXJlZC4gRGVmYXVsdHMgdG8gMTAwcHguXG4gICAqL1xuICBASW5wdXQoKVxuICBnZXQgbWluQnVmZmVyUHgoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fbWluQnVmZmVyUHg7XG4gIH1cbiAgc2V0IG1pbkJ1ZmZlclB4KHZhbHVlOiBOdW1iZXJJbnB1dCkge1xuICAgIHRoaXMuX21pbkJ1ZmZlclB4ID0gY29lcmNlTnVtYmVyUHJvcGVydHkodmFsdWUpO1xuICB9XG4gIF9taW5CdWZmZXJQeCA9IDEwMDtcblxuICAvKipcbiAgICogVGhlIG51bWJlciBvZiBwaXhlbHMgd29ydGggb2YgYnVmZmVyIHRvIHNob290IGZvciB3aGVuIHJlbmRlcmluZyBuZXcgaXRlbXMuXG4gICAqIElmIHRoZSBhY3R1YWwgYW1vdW50IHR1cm5zIG91dCB0byBiZSBsZXNzIGl0IHdpbGwgbm90IG5lY2Vzc2FyaWx5IHRyaWdnZXIgYW4gYWRkaXRpb25hbFxuICAgKiByZW5kZXJpbmcgY3ljbGUgKGFzIGxvbmcgYXMgdGhlIGFtb3VudCBvZiBidWZmZXIgaXMgc3RpbGwgZ3JlYXRlciB0aGFuIGBtaW5CdWZmZXJQeGApLlxuICAgKiBEZWZhdWx0cyB0byAyMDBweC5cbiAgICovXG4gIEBJbnB1dCgpXG4gIGdldCBtYXhCdWZmZXJQeCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9tYXhCdWZmZXJQeDtcbiAgfVxuICBzZXQgbWF4QnVmZmVyUHgodmFsdWU6IE51bWJlcklucHV0KSB7XG4gICAgdGhpcy5fbWF4QnVmZmVyUHggPSBjb2VyY2VOdW1iZXJQcm9wZXJ0eSh2YWx1ZSk7XG4gIH1cbiAgX21heEJ1ZmZlclB4ID0gMjAwO1xuXG4gIC8qKiBUaGUgc2Nyb2xsIHN0cmF0ZWd5IHVzZWQgYnkgdGhpcyBkaXJlY3RpdmUuICovXG4gIF9zY3JvbGxTdHJhdGVneSA9IG5ldyBBdXRvU2l6ZVZpcnR1YWxTY3JvbGxTdHJhdGVneSh0aGlzLm1pbkJ1ZmZlclB4LCB0aGlzLm1heEJ1ZmZlclB4KTtcblxuICBuZ09uQ2hhbmdlcygpIHtcbiAgICB0aGlzLl9zY3JvbGxTdHJhdGVneS51cGRhdGVCdWZmZXJTaXplKHRoaXMubWluQnVmZmVyUHgsIHRoaXMubWF4QnVmZmVyUHgpO1xuICB9XG59XG4iXX0=