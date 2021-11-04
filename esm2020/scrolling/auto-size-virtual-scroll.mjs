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
CdkAutoSizeVirtualScroll.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.0", ngImport: i0, type: CdkAutoSizeVirtualScroll, deps: [], target: i0.ɵɵFactoryTarget.Directive });
CdkAutoSizeVirtualScroll.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "13.0.0", type: CdkAutoSizeVirtualScroll, selector: "cdk-virtual-scroll-viewport[autosize]", inputs: { minBufferPx: "minBufferPx", maxBufferPx: "maxBufferPx" }, providers: [
        {
            provide: VIRTUAL_SCROLL_STRATEGY,
            useFactory: _autoSizeVirtualScrollStrategyFactory,
            deps: [forwardRef(() => CdkAutoSizeVirtualScroll)],
        },
    ], usesOnChanges: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.0", ngImport: i0, type: CdkAutoSizeVirtualScroll, decorators: [{
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0by1zaXplLXZpcnR1YWwtc2Nyb2xsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvc2Nyb2xsaW5nL2F1dG8tc2l6ZS12aXJ0dWFsLXNjcm9sbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsb0JBQW9CLEVBQWMsTUFBTSx1QkFBdUIsQ0FBQztBQUV4RSxPQUFPLEVBRUwsdUJBQXVCLEdBRXhCLE1BQU0sd0JBQXdCLENBQUM7QUFDaEMsT0FBTyxFQUFDLFNBQVMsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFZLE1BQU0sZUFBZSxDQUFDO0FBQ3RFLE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxNQUFNLENBQUM7O0FBRWhDOzs7R0FHRztBQUNILE1BQU0sT0FBTyxnQkFBZ0I7SUFVM0IsMEZBQTBGO0lBQzFGLFlBQVksZUFBZSxHQUFHLEVBQUU7UUFWaEMsNkRBQTZEO1FBQ3JELGlCQUFZLEdBQUcsQ0FBQyxDQUFDO1FBVXZCLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxlQUFlLENBQUM7UUFDeEMsSUFBSSxDQUFDLGdCQUFnQixHQUFHLGVBQWUsQ0FBQztJQUMxQyxDQUFDO0lBRUQscUNBQXFDO0lBQ3JDLGtCQUFrQjtRQUNoQixPQUFPLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQztJQUMvQixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILFNBQVMsQ0FBQyxLQUFnQixFQUFFLElBQVk7UUFDdEMsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUMsR0FBRyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUM7UUFDbkUsSUFBSSxjQUFjLEVBQUU7WUFDbEIsTUFBTSxrQkFBa0IsR0FDdEIsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxjQUFjLENBQUM7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LENBQUM7U0FDbkQ7S0FDRjsyRkFFVSx3QkFBd0I7a0JBVnBDLFNBQVM7bUJBQUM7b0JBQ1QsUUFBUSxFQUFFLHVDQUF1QztvQkFDakQsU0FBUyxFQUFFO3dCQUNUOzRCQUNFLE9BQU8sRUFBRSx1QkFBdUI7NEJBQ2hDLFVBQVUsRUFBRSxxQ0FBcUM7NEJBQ2pELElBQUksRUFBRSxDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUUseUJBQXlCLENBQUMsQ0FBQzt5QkFDbkQ7cUJBQ0Y7aUJBQ0Y7OEJBT0ssV0FBVztzQkFEZCxLQUFLO2dCQWdCRixXQUFXO3NCQURkLEtBQUsiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtjb2VyY2VOdW1iZXJQcm9wZXJ0eSwgTnVtYmVySW5wdXR9IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2VyY2lvbic7XG5pbXBvcnQge0xpc3RSYW5nZX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvbGxlY3Rpb25zJztcbmltcG9ydCB7XG4gIENka1ZpcnR1YWxTY3JvbGxWaWV3cG9ydCxcbiAgVklSVFVBTF9TQ1JPTExfU1RSQVRFR1ksXG4gIFZpcnR1YWxTY3JvbGxTdHJhdGVneSxcbn0gZnJvbSAnQGFuZ3VsYXIvY2RrL3Njcm9sbGluZyc7XG5pbXBvcnQge0RpcmVjdGl2ZSwgZm9yd2FyZFJlZiwgSW5wdXQsIE9uQ2hhbmdlc30gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge09ic2VydmFibGV9IGZyb20gJ3J4anMnO1xuXG4vKipcbiAqIEEgY2xhc3MgdGhhdCB0cmFja3MgdGhlIHNpemUgb2YgaXRlbXMgdGhhdCBoYXZlIGJlZW4gc2VlbiBhbmQgdXNlcyBpdCB0byBlc3RpbWF0ZSB0aGUgYXZlcmFnZVxuICogaXRlbSBzaXplLlxuICovXG5leHBvcnQgY2xhc3MgSXRlbVNpemVBdmVyYWdlciB7XG4gIC8qKiBUaGUgdG90YWwgYW1vdW50IG9mIHdlaWdodCBiZWhpbmQgdGhlIGN1cnJlbnQgYXZlcmFnZS4gKi9cbiAgcHJpdmF0ZSBfdG90YWxXZWlnaHQgPSAwO1xuXG4gIC8qKiBUaGUgY3VycmVudCBhdmVyYWdlIGl0ZW0gc2l6ZS4gKi9cbiAgcHJpdmF0ZSBfYXZlcmFnZUl0ZW1TaXplOiBudW1iZXI7XG5cbiAgLyoqIFRoZSBkZWZhdWx0IHNpemUgdG8gdXNlIGZvciBpdGVtcyB3aGVuIG5vIGRhdGEgaXMgYXZhaWxhYmxlLiAqL1xuICBwcml2YXRlIF9kZWZhdWx0SXRlbVNpemU6IG51bWJlcjtcblxuICAvKiogQHBhcmFtIGRlZmF1bHRJdGVtU2l6ZSBUaGUgZGVmYXVsdCBzaXplIHRvIHVzZSBmb3IgaXRlbXMgd2hlbiBubyBkYXRhIGlzIGF2YWlsYWJsZS4gKi9cbiAgY29uc3RydWN0b3IoZGVmYXVsdEl0ZW1TaXplID0gNTApIHtcbiAgICB0aGlzLl9kZWZhdWx0SXRlbVNpemUgPSBkZWZhdWx0SXRlbVNpemU7XG4gICAgdGhpcy5fYXZlcmFnZUl0ZW1TaXplID0gZGVmYXVsdEl0ZW1TaXplO1xuICB9XG5cbiAgLyoqIFJldHVybnMgdGhlIGF2ZXJhZ2UgaXRlbSBzaXplLiAqL1xuICBnZXRBdmVyYWdlSXRlbVNpemUoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fYXZlcmFnZUl0ZW1TaXplO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgYSBtZWFzdXJlbWVudCBzYW1wbGUgZm9yIHRoZSBlc3RpbWF0b3IgdG8gY29uc2lkZXIuXG4gICAqIEBwYXJhbSByYW5nZSBUaGUgbWVhc3VyZWQgcmFuZ2UuXG4gICAqIEBwYXJhbSBzaXplIFRoZSBtZWFzdXJlZCBzaXplIG9mIHRoZSBnaXZlbiByYW5nZSBpbiBwaXhlbHMuXG4gICAqL1xuICBhZGRTYW1wbGUocmFuZ2U6IExpc3RSYW5nZSwgc2l6ZTogbnVtYmVyKSB7XG4gICAgY29uc3QgbmV3VG90YWxXZWlnaHQgPSB0aGlzLl90b3RhbFdlaWdodCArIHJhbmdlLmVuZCAtIHJhbmdlLnN0YXJ0O1xuICAgIGlmIChuZXdUb3RhbFdlaWdodCkge1xuICAgICAgY29uc3QgbmV3QXZlcmFnZUl0ZW1TaXplID1cbiAgICAgICAgKHNpemUgKyB0aGlzLl9hdmVyYWdlSXRlbVNpemUgKiB0aGlzLl90b3RhbFdlaWdodCkgLyBuZXdUb3RhbFdlaWdodDtcbiAgICAgIGlmIChuZXdBdmVyYWdlSXRlbVNpemUpIHtcbiAgICAgICAgdGhpcy5fYXZlcmFnZUl0ZW1TaXplID0gbmV3QXZlcmFnZUl0ZW1TaXplO1xuICAgICAgICB0aGlzLl90b3RhbFdlaWdodCA9IG5ld1RvdGFsV2VpZ2h0O1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKiBSZXNldHMgdGhlIGF2ZXJhZ2VyLiAqL1xuICByZXNldCgpIHtcbiAgICB0aGlzLl9hdmVyYWdlSXRlbVNpemUgPSB0aGlzLl9kZWZhdWx0SXRlbVNpemU7XG4gICAgdGhpcy5fdG90YWxXZWlnaHQgPSAwO1xuICB9XG59XG5cbi8qKiBWaXJ0dWFsIHNjcm9sbGluZyBzdHJhdGVneSBmb3IgbGlzdHMgd2l0aCBpdGVtcyBvZiB1bmtub3duIG9yIGR5bmFtaWMgc2l6ZS4gKi9cbmV4cG9ydCBjbGFzcyBBdXRvU2l6ZVZpcnR1YWxTY3JvbGxTdHJhdGVneSBpbXBsZW1lbnRzIFZpcnR1YWxTY3JvbGxTdHJhdGVneSB7XG4gIC8qKiBAZG9jcy1wcml2YXRlIEltcGxlbWVudGVkIGFzIHBhcnQgb2YgVmlydHVhbFNjcm9sbFN0cmF0ZWd5LiAqL1xuICBzY3JvbGxlZEluZGV4Q2hhbmdlID0gbmV3IE9ic2VydmFibGU8bnVtYmVyPigoKSA9PiB7XG4gICAgLy8gVE9ETyhtbWFsZXJiYSk6IEltcGxlbWVudC5cbiAgICBpZiAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSB7XG4gICAgICB0aHJvdyBFcnJvcihcbiAgICAgICAgJ2Nkay12aXJ0dWFsLXNjcm9sbDogc2Nyb2xsZWRJbmRleENoYW5nZSBpcyBjdXJyZW50bHkgbm90IHN1cHBvcnRlZCBmb3IgdGhlJyArXG4gICAgICAgICAgJyBhdXRvc2l6ZSBzY3JvbGwgc3RyYXRlZ3knLFxuICAgICAgKTtcbiAgICB9XG4gIH0pO1xuXG4gIC8qKiBUaGUgYXR0YWNoZWQgdmlld3BvcnQuICovXG4gIHByaXZhdGUgX3ZpZXdwb3J0OiBDZGtWaXJ0dWFsU2Nyb2xsVmlld3BvcnQgfCBudWxsID0gbnVsbDtcblxuICAvKiogVGhlIG1pbmltdW0gYW1vdW50IG9mIGJ1ZmZlciByZW5kZXJlZCBiZXlvbmQgdGhlIHZpZXdwb3J0IChpbiBwaXhlbHMpLiAqL1xuICBwcml2YXRlIF9taW5CdWZmZXJQeDogbnVtYmVyO1xuXG4gIC8qKiBUaGUgbnVtYmVyIG9mIGJ1ZmZlciBpdGVtcyB0byByZW5kZXIgYmV5b25kIHRoZSBlZGdlIG9mIHRoZSB2aWV3cG9ydCAoaW4gcGl4ZWxzKS4gKi9cbiAgcHJpdmF0ZSBfbWF4QnVmZmVyUHg6IG51bWJlcjtcblxuICAvKiogVGhlIGVzdGltYXRvciB1c2VkIHRvIGVzdGltYXRlIHRoZSBzaXplIG9mIHVuc2VlbiBpdGVtcy4gKi9cbiAgcHJpdmF0ZSBfYXZlcmFnZXI6IEl0ZW1TaXplQXZlcmFnZXI7XG5cbiAgLyoqIFRoZSBsYXN0IG1lYXN1cmVkIHNjcm9sbCBvZmZzZXQgb2YgdGhlIHZpZXdwb3J0LiAqL1xuICBwcml2YXRlIF9sYXN0U2Nyb2xsT2Zmc2V0OiBudW1iZXI7XG5cbiAgLyoqIFRoZSBsYXN0IG1lYXN1cmVkIHNpemUgb2YgdGhlIHJlbmRlcmVkIGNvbnRlbnQgaW4gdGhlIHZpZXdwb3J0LiAqL1xuICBwcml2YXRlIF9sYXN0UmVuZGVyZWRDb250ZW50U2l6ZTogbnVtYmVyO1xuXG4gIC8qKiBUaGUgbGFzdCBtZWFzdXJlZCBzaXplIG9mIHRoZSByZW5kZXJlZCBjb250ZW50IGluIHRoZSB2aWV3cG9ydC4gKi9cbiAgcHJpdmF0ZSBfbGFzdFJlbmRlcmVkQ29udGVudE9mZnNldDogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiBUaGUgbnVtYmVyIG9mIGNvbnNlY3V0aXZlIGN5Y2xlcyB3aGVyZSByZW1vdmluZyBleHRyYSBpdGVtcyBoYXMgZmFpbGVkLiBGYWlsdXJlIGhlcmUgbWVhbnMgdGhhdFxuICAgKiB3ZSBlc3RpbWF0ZWQgaG93IG1hbnkgaXRlbXMgd2UgY291bGQgc2FmZWx5IHJlbW92ZSwgYnV0IG91ciBlc3RpbWF0ZSB0dXJuZWQgb3V0IHRvIGJlIHRvbyBtdWNoXG4gICAqIGFuZCBpdCB3YXNuJ3Qgc2FmZSB0byByZW1vdmUgdGhhdCBtYW55IGVsZW1lbnRzLlxuICAgKi9cbiAgcHJpdmF0ZSBfcmVtb3ZhbEZhaWx1cmVzID0gMDtcblxuICAvKipcbiAgICogQHBhcmFtIG1pbkJ1ZmZlclB4IFRoZSBtaW5pbXVtIGFtb3VudCBvZiBidWZmZXIgcmVuZGVyZWQgYmV5b25kIHRoZSB2aWV3cG9ydCAoaW4gcGl4ZWxzKS5cbiAgICogICAgIElmIHRoZSBhbW91bnQgb2YgYnVmZmVyIGRpcHMgYmVsb3cgdGhpcyBudW1iZXIsIG1vcmUgaXRlbXMgd2lsbCBiZSByZW5kZXJlZC5cbiAgICogQHBhcmFtIG1heEJ1ZmZlclB4IFRoZSBudW1iZXIgb2YgcGl4ZWxzIHdvcnRoIG9mIGJ1ZmZlciB0byBzaG9vdCBmb3Igd2hlbiByZW5kZXJpbmcgbmV3IGl0ZW1zLlxuICAgKiAgICAgSWYgdGhlIGFjdHVhbCBhbW91bnQgdHVybnMgb3V0IHRvIGJlIGxlc3MgaXQgd2lsbCBub3QgbmVjZXNzYXJpbHkgdHJpZ2dlciBhbiBhZGRpdGlvbmFsXG4gICAqICAgICByZW5kZXJpbmcgY3ljbGUgKGFzIGxvbmcgYXMgdGhlIGFtb3VudCBvZiBidWZmZXIgaXMgc3RpbGwgZ3JlYXRlciB0aGFuIGBtaW5CdWZmZXJQeGApLlxuICAgKiBAcGFyYW0gYXZlcmFnZXIgVGhlIGF2ZXJhZ2VyIHVzZWQgdG8gZXN0aW1hdGUgdGhlIHNpemUgb2YgdW5zZWVuIGl0ZW1zLlxuICAgKi9cbiAgY29uc3RydWN0b3IobWluQnVmZmVyUHg6IG51bWJlciwgbWF4QnVmZmVyUHg6IG51bWJlciwgYXZlcmFnZXIgPSBuZXcgSXRlbVNpemVBdmVyYWdlcigpKSB7XG4gICAgdGhpcy5fbWluQnVmZmVyUHggPSBtaW5CdWZmZXJQeDtcbiAgICB0aGlzLl9tYXhCdWZmZXJQeCA9IG1heEJ1ZmZlclB4O1xuICAgIHRoaXMuX2F2ZXJhZ2VyID0gYXZlcmFnZXI7XG4gIH1cblxuICAvKipcbiAgICogQXR0YWNoZXMgdGhpcyBzY3JvbGwgc3RyYXRlZ3kgdG8gYSB2aWV3cG9ydC5cbiAgICogQHBhcmFtIHZpZXdwb3J0IFRoZSB2aWV3cG9ydCB0byBhdHRhY2ggdGhpcyBzdHJhdGVneSB0by5cbiAgICovXG4gIGF0dGFjaCh2aWV3cG9ydDogQ2RrVmlydHVhbFNjcm9sbFZpZXdwb3J0KSB7XG4gICAgdGhpcy5fYXZlcmFnZXIucmVzZXQoKTtcbiAgICB0aGlzLl92aWV3cG9ydCA9IHZpZXdwb3J0O1xuICAgIHRoaXMuX3JlbmRlckNvbnRlbnRGb3JDdXJyZW50T2Zmc2V0KCk7XG4gIH1cblxuICAvKiogRGV0YWNoZXMgdGhpcyBzY3JvbGwgc3RyYXRlZ3kgZnJvbSB0aGUgY3VycmVudGx5IGF0dGFjaGVkIHZpZXdwb3J0LiAqL1xuICBkZXRhY2goKSB7XG4gICAgdGhpcy5fdmlld3BvcnQgPSBudWxsO1xuICB9XG5cbiAgLyoqIEBkb2NzLXByaXZhdGUgSW1wbGVtZW50ZWQgYXMgcGFydCBvZiBWaXJ0dWFsU2Nyb2xsU3RyYXRlZ3kuICovXG4gIG9uQ29udGVudFNjcm9sbGVkKCkge1xuICAgIGlmICh0aGlzLl92aWV3cG9ydCkge1xuICAgICAgdGhpcy5fdXBkYXRlUmVuZGVyZWRDb250ZW50QWZ0ZXJTY3JvbGwoKTtcbiAgICB9XG4gIH1cblxuICAvKiogQGRvY3MtcHJpdmF0ZSBJbXBsZW1lbnRlZCBhcyBwYXJ0IG9mIFZpcnR1YWxTY3JvbGxTdHJhdGVneS4gKi9cbiAgb25EYXRhTGVuZ3RoQ2hhbmdlZCgpIHtcbiAgICBpZiAodGhpcy5fdmlld3BvcnQpIHtcbiAgICAgIHRoaXMuX3JlbmRlckNvbnRlbnRGb3JDdXJyZW50T2Zmc2V0KCk7XG4gICAgICB0aGlzLl9jaGVja1JlbmRlcmVkQ29udGVudFNpemUoKTtcbiAgICB9XG4gIH1cblxuICAvKiogQGRvY3MtcHJpdmF0ZSBJbXBsZW1lbnRlZCBhcyBwYXJ0IG9mIFZpcnR1YWxTY3JvbGxTdHJhdGVneS4gKi9cbiAgb25Db250ZW50UmVuZGVyZWQoKSB7XG4gICAgaWYgKHRoaXMuX3ZpZXdwb3J0KSB7XG4gICAgICB0aGlzLl9jaGVja1JlbmRlcmVkQ29udGVudFNpemUoKTtcbiAgICB9XG4gIH1cblxuICAvKiogQGRvY3MtcHJpdmF0ZSBJbXBsZW1lbnRlZCBhcyBwYXJ0IG9mIFZpcnR1YWxTY3JvbGxTdHJhdGVneS4gKi9cbiAgb25SZW5kZXJlZE9mZnNldENoYW5nZWQoKSB7XG4gICAgaWYgKHRoaXMuX3ZpZXdwb3J0KSB7XG4gICAgICB0aGlzLl9jaGVja1JlbmRlcmVkQ29udGVudE9mZnNldCgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBTY3JvbGwgdG8gdGhlIG9mZnNldCBmb3IgdGhlIGdpdmVuIGluZGV4LiAqL1xuICBzY3JvbGxUb0luZGV4KCk6IHZvaWQge1xuICAgIGlmICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpIHtcbiAgICAgIC8vIFRPRE8obW1hbGVyYmEpOiBJbXBsZW1lbnQuXG4gICAgICB0aHJvdyBFcnJvcihcbiAgICAgICAgJ2Nkay12aXJ0dWFsLXNjcm9sbDogc2Nyb2xsVG9JbmRleCBpcyBjdXJyZW50bHkgbm90IHN1cHBvcnRlZCBmb3IgdGhlIGF1dG9zaXplJyArXG4gICAgICAgICAgJyBzY3JvbGwgc3RyYXRlZ3knLFxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlIHRoZSBidWZmZXIgcGFyYW1ldGVycy5cbiAgICogQHBhcmFtIG1pbkJ1ZmZlclB4IFRoZSBtaW5pbXVtIGFtb3VudCBvZiBidWZmZXIgcmVuZGVyZWQgYmV5b25kIHRoZSB2aWV3cG9ydCAoaW4gcGl4ZWxzKS5cbiAgICogQHBhcmFtIG1heEJ1ZmZlclB4IFRoZSBudW1iZXIgb2YgYnVmZmVyIGl0ZW1zIHRvIHJlbmRlciBiZXlvbmQgdGhlIGVkZ2Ugb2YgdGhlIHZpZXdwb3J0IChpblxuICAgKiAgICAgcGl4ZWxzKS5cbiAgICovXG4gIHVwZGF0ZUJ1ZmZlclNpemUobWluQnVmZmVyUHg6IG51bWJlciwgbWF4QnVmZmVyUHg6IG51bWJlcikge1xuICAgIGlmIChtYXhCdWZmZXJQeCA8IG1pbkJ1ZmZlclB4KSB7XG4gICAgICB0aHJvdyAnQ0RLIHZpcnR1YWwgc2Nyb2xsOiBtYXhCdWZmZXJQeCBtdXN0IGJlIGdyZWF0ZXIgdGhhbiBvciBlcXVhbCB0byBtaW5CdWZmZXJQeCc7XG4gICAgfVxuICAgIHRoaXMuX21pbkJ1ZmZlclB4ID0gbWluQnVmZmVyUHg7XG4gICAgdGhpcy5fbWF4QnVmZmVyUHggPSBtYXhCdWZmZXJQeDtcbiAgfVxuXG4gIC8qKiBVcGRhdGUgdGhlIHJlbmRlcmVkIGNvbnRlbnQgYWZ0ZXIgdGhlIHVzZXIgc2Nyb2xscy4gKi9cbiAgcHJpdmF0ZSBfdXBkYXRlUmVuZGVyZWRDb250ZW50QWZ0ZXJTY3JvbGwoKSB7XG4gICAgY29uc3Qgdmlld3BvcnQgPSB0aGlzLl92aWV3cG9ydCE7XG5cbiAgICAvLyBUaGUgY3VycmVudCBzY3JvbGwgb2Zmc2V0LlxuICAgIGNvbnN0IHNjcm9sbE9mZnNldCA9IHZpZXdwb3J0Lm1lYXN1cmVTY3JvbGxPZmZzZXQoKTtcbiAgICAvLyBUaGUgZGVsdGEgYmV0d2VlbiB0aGUgY3VycmVudCBzY3JvbGwgb2Zmc2V0IGFuZCB0aGUgcHJldmlvdXNseSByZWNvcmRlZCBzY3JvbGwgb2Zmc2V0LlxuICAgIGxldCBzY3JvbGxEZWx0YSA9IHNjcm9sbE9mZnNldCAtIHRoaXMuX2xhc3RTY3JvbGxPZmZzZXQ7XG4gICAgLy8gVGhlIG1hZ25pdHVkZSBvZiB0aGUgc2Nyb2xsIGRlbHRhLlxuICAgIGxldCBzY3JvbGxNYWduaXR1ZGUgPSBNYXRoLmFicyhzY3JvbGxEZWx0YSk7XG5cbiAgICAvLyBUaGUgY3VycmVudGx5IHJlbmRlcmVkIHJhbmdlLlxuICAgIGNvbnN0IHJlbmRlcmVkUmFuZ2UgPSB2aWV3cG9ydC5nZXRSZW5kZXJlZFJhbmdlKCk7XG5cbiAgICAvLyBJZiB3ZSdyZSBzY3JvbGxpbmcgdG93YXJkIHRoZSB0b3AsIHdlIG5lZWQgdG8gYWNjb3VudCBmb3IgdGhlIGZhY3QgdGhhdCB0aGUgcHJlZGljdGVkIGFtb3VudFxuICAgIC8vIG9mIGNvbnRlbnQgYW5kIHRoZSBhY3R1YWwgYW1vdW50IG9mIHNjcm9sbGFibGUgc3BhY2UgbWF5IGRpZmZlci4gV2UgYWRkcmVzcyB0aGlzIGJ5IHNsb3dseVxuICAgIC8vIGNvcnJlY3RpbmcgdGhlIGRpZmZlcmVuY2Ugb24gZWFjaCBzY3JvbGwgZXZlbnQuXG4gICAgbGV0IG9mZnNldENvcnJlY3Rpb24gPSAwO1xuICAgIGlmIChzY3JvbGxEZWx0YSA8IDApIHtcbiAgICAgIC8vIFRoZSBjb250ZW50IG9mZnNldCB3ZSB3b3VsZCBleHBlY3QgYmFzZWQgb24gdGhlIGF2ZXJhZ2UgaXRlbSBzaXplLlxuICAgICAgY29uc3QgcHJlZGljdGVkT2Zmc2V0ID0gcmVuZGVyZWRSYW5nZS5zdGFydCAqIHRoaXMuX2F2ZXJhZ2VyLmdldEF2ZXJhZ2VJdGVtU2l6ZSgpO1xuICAgICAgLy8gVGhlIGRpZmZlcmVuY2UgYmV0d2VlbiB0aGUgcHJlZGljdGVkIHNpemUgb2YgdGhlIHVucmVuZGVyZWQgY29udGVudCBhdCB0aGUgYmVnaW5uaW5nIGFuZFxuICAgICAgLy8gdGhlIGFjdHVhbCBhdmFpbGFibGUgc3BhY2UgdG8gc2Nyb2xsIG92ZXIuIFdlIG5lZWQgdG8gcmVkdWNlIHRoaXMgdG8gemVybyBieSB0aGUgdGltZSB0aGVcbiAgICAgIC8vIHVzZXIgc2Nyb2xscyB0byB0aGUgdG9wLlxuICAgICAgLy8gLSAwIGluZGljYXRlcyB0aGF0IHRoZSBwcmVkaWN0ZWQgc2l6ZSBhbmQgYXZhaWxhYmxlIHNwYWNlIGFyZSB0aGUgc2FtZS5cbiAgICAgIC8vIC0gQSBuZWdhdGl2ZSBudW1iZXIgdGhhdCB0aGUgcHJlZGljdGVkIHNpemUgaXMgc21hbGxlciB0aGFuIHRoZSBhdmFpbGFibGUgc3BhY2UuXG4gICAgICAvLyAtIEEgcG9zaXRpdmUgbnVtYmVyIGluZGljYXRlcyB0aGUgcHJlZGljdGVkIHNpemUgaXMgbGFyZ2VyIHRoYW4gdGhlIGF2YWlsYWJsZSBzcGFjZVxuICAgICAgY29uc3Qgb2Zmc2V0RGlmZmVyZW5jZSA9IHByZWRpY3RlZE9mZnNldCAtIHRoaXMuX2xhc3RSZW5kZXJlZENvbnRlbnRPZmZzZXQ7XG4gICAgICAvLyBUaGUgYW1vdW50IG9mIGRpZmZlcmVuY2UgdG8gY29ycmVjdCBkdXJpbmcgdGhpcyBzY3JvbGwgZXZlbnQuIFdlIGNhbGN1bGF0ZSB0aGlzIGFzIGFcbiAgICAgIC8vIHBlcmNlbnRhZ2Ugb2YgdGhlIHRvdGFsIGRpZmZlcmVuY2UgYmFzZWQgb24gdGhlIHBlcmNlbnRhZ2Ugb2YgdGhlIGRpc3RhbmNlIHRvd2FyZCB0aGUgdG9wXG4gICAgICAvLyB0aGF0IHRoZSB1c2VyIHNjcm9sbGVkLlxuICAgICAgb2Zmc2V0Q29ycmVjdGlvbiA9IE1hdGgucm91bmQoXG4gICAgICAgIG9mZnNldERpZmZlcmVuY2UgKlxuICAgICAgICAgIE1hdGgubWF4KDAsIE1hdGgubWluKDEsIHNjcm9sbE1hZ25pdHVkZSAvIChzY3JvbGxPZmZzZXQgKyBzY3JvbGxNYWduaXR1ZGUpKSksXG4gICAgICApO1xuXG4gICAgICAvLyBCYXNlZCBvbiB0aGUgb2Zmc2V0IGNvcnJlY3Rpb24gYWJvdmUsIHdlIHByZXRlbmQgdGhhdCB0aGUgc2Nyb2xsIGRlbHRhIHdhcyBiaWdnZXIgb3JcbiAgICAgIC8vIHNtYWxsZXIgdGhhbiBpdCBhY3R1YWxseSB3YXMsIHRoaXMgd2F5IHdlIGNhbiBzdGFydCB0byBlbGltaW5hdGUgdGhlIGRpZmZlcmVuY2UuXG4gICAgICBzY3JvbGxEZWx0YSA9IHNjcm9sbERlbHRhIC0gb2Zmc2V0Q29ycmVjdGlvbjtcbiAgICAgIHNjcm9sbE1hZ25pdHVkZSA9IE1hdGguYWJzKHNjcm9sbERlbHRhKTtcbiAgICB9XG5cbiAgICAvLyBUaGUgY3VycmVudCBhbW91bnQgb2YgYnVmZmVyIHBhc3QgdGhlIHN0YXJ0IG9mIHRoZSB2aWV3cG9ydC5cbiAgICBjb25zdCBzdGFydEJ1ZmZlciA9IHRoaXMuX2xhc3RTY3JvbGxPZmZzZXQgLSB0aGlzLl9sYXN0UmVuZGVyZWRDb250ZW50T2Zmc2V0O1xuICAgIC8vIFRoZSBjdXJyZW50IGFtb3VudCBvZiBidWZmZXIgcGFzdCB0aGUgZW5kIG9mIHRoZSB2aWV3cG9ydC5cbiAgICBjb25zdCBlbmRCdWZmZXIgPVxuICAgICAgdGhpcy5fbGFzdFJlbmRlcmVkQ29udGVudE9mZnNldCArXG4gICAgICB0aGlzLl9sYXN0UmVuZGVyZWRDb250ZW50U2l6ZSAtXG4gICAgICAodGhpcy5fbGFzdFNjcm9sbE9mZnNldCArIHZpZXdwb3J0LmdldFZpZXdwb3J0U2l6ZSgpKTtcbiAgICAvLyBUaGUgYW1vdW50IG9mIHVuZmlsbGVkIHNwYWNlIHRoYXQgc2hvdWxkIGJlIGZpbGxlZCBvbiB0aGUgc2lkZSB0aGUgdXNlciBpcyBzY3JvbGxpbmcgdG93YXJkXG4gICAgLy8gaW4gb3JkZXIgdG8gc2FmZWx5IGFic29yYiB0aGUgc2Nyb2xsIGRlbHRhLlxuICAgIGNvbnN0IHVuZGVyc2NhbiA9XG4gICAgICBzY3JvbGxNYWduaXR1ZGUgKyB0aGlzLl9taW5CdWZmZXJQeCAtIChzY3JvbGxEZWx0YSA8IDAgPyBzdGFydEJ1ZmZlciA6IGVuZEJ1ZmZlcik7XG5cbiAgICAvLyBDaGVjayBpZiB0aGVyZSdzIHVuZmlsbGVkIHNwYWNlIHRoYXQgd2UgbmVlZCB0byByZW5kZXIgbmV3IGVsZW1lbnRzIHRvIGZpbGwuXG4gICAgaWYgKHVuZGVyc2NhbiA+IDApIHtcbiAgICAgIC8vIENoZWNrIGlmIHRoZSBzY3JvbGwgbWFnbml0dWRlIHdhcyBsYXJnZXIgdGhhbiB0aGUgdmlld3BvcnQgc2l6ZS4gSW4gdGhpcyBjYXNlIHRoZSB1c2VyXG4gICAgICAvLyB3b24ndCBub3RpY2UgYSBkaXNjb250aW51aXR5IGlmIHdlIGp1c3QganVtcCB0byB0aGUgbmV3IGVzdGltYXRlZCBwb3NpdGlvbiBpbiB0aGUgbGlzdC5cbiAgICAgIC8vIEhvd2V2ZXIsIGlmIHRoZSBzY3JvbGwgbWFnbml0dWRlIGlzIHNtYWxsZXIgdGhhbiB0aGUgdmlld3BvcnQgdGhlIHVzZXIgbWlnaHQgbm90aWNlIHNvbWVcbiAgICAgIC8vIGppdHRlcmluZXNzIGlmIHdlIGp1c3QganVtcCB0byB0aGUgZXN0aW1hdGVkIHBvc2l0aW9uLiBJbnN0ZWFkIHdlIG1ha2Ugc3VyZSB0byBzY3JvbGwgYnlcbiAgICAgIC8vIHRoZSBzYW1lIG51bWJlciBvZiBwaXhlbHMgYXMgdGhlIHNjcm9sbCBtYWduaXR1ZGUuXG4gICAgICBpZiAoc2Nyb2xsTWFnbml0dWRlID49IHZpZXdwb3J0LmdldFZpZXdwb3J0U2l6ZSgpKSB7XG4gICAgICAgIHRoaXMuX3JlbmRlckNvbnRlbnRGb3JDdXJyZW50T2Zmc2V0KCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBUaGUgbnVtYmVyIG9mIG5ldyBpdGVtcyB0byByZW5kZXIgb24gdGhlIHNpZGUgdGhlIHVzZXIgaXMgc2Nyb2xsaW5nIHRvd2FyZHMuIFJhdGhlciB0aGFuXG4gICAgICAgIC8vIGp1c3QgZmlsbGluZyB0aGUgdW5kZXJzY2FuIHNwYWNlLCB3ZSBhY3R1YWxseSBmaWxsIGVub3VnaCB0byBoYXZlIGEgYnVmZmVyIHNpemUgb2ZcbiAgICAgICAgLy8gYG1heEJ1ZmZlclB4YC4gVGhpcyBnaXZlcyB1cyBhIGxpdHRsZSB3aWdnbGUgcm9vbSBpbiBjYXNlIG91ciBpdGVtIHNpemUgZXN0aW1hdGUgaXMgb2ZmLlxuICAgICAgICBjb25zdCBhZGRJdGVtcyA9IE1hdGgubWF4KFxuICAgICAgICAgIDAsXG4gICAgICAgICAgTWF0aC5jZWlsKFxuICAgICAgICAgICAgKHVuZGVyc2NhbiAtIHRoaXMuX21pbkJ1ZmZlclB4ICsgdGhpcy5fbWF4QnVmZmVyUHgpIC9cbiAgICAgICAgICAgICAgdGhpcy5fYXZlcmFnZXIuZ2V0QXZlcmFnZUl0ZW1TaXplKCksXG4gICAgICAgICAgKSxcbiAgICAgICAgKTtcbiAgICAgICAgLy8gVGhlIGFtb3VudCBvZiBmaWxsZWQgc3BhY2UgYmV5b25kIHdoYXQgaXMgbmVjZXNzYXJ5IG9uIHRoZSBzaWRlIHRoZSB1c2VyIGlzIHNjcm9sbGluZ1xuICAgICAgICAvLyBhd2F5IGZyb20uXG4gICAgICAgIGNvbnN0IG92ZXJzY2FuID1cbiAgICAgICAgICAoc2Nyb2xsRGVsdGEgPCAwID8gZW5kQnVmZmVyIDogc3RhcnRCdWZmZXIpIC0gdGhpcy5fbWluQnVmZmVyUHggKyBzY3JvbGxNYWduaXR1ZGU7XG4gICAgICAgIC8vIFRoZSBudW1iZXIgb2YgY3VycmVudGx5IHJlbmRlcmVkIGl0ZW1zIHRvIHJlbW92ZSBvbiB0aGUgc2lkZSB0aGUgdXNlciBpcyBzY3JvbGxpbmcgYXdheVxuICAgICAgICAvLyBmcm9tLiBJZiByZW1vdmFsIGhhcyBmYWlsZWQgaW4gcmVjZW50IGN5Y2xlcyB3ZSBhcmUgbGVzcyBhZ2dyZXNzaXZlIGluIGhvdyBtdWNoIHdlIHRyeSB0b1xuICAgICAgICAvLyByZW1vdmUuXG4gICAgICAgIGNvbnN0IHVuYm91bmRlZFJlbW92ZUl0ZW1zID0gTWF0aC5mbG9vcihcbiAgICAgICAgICBvdmVyc2NhbiAvIHRoaXMuX2F2ZXJhZ2VyLmdldEF2ZXJhZ2VJdGVtU2l6ZSgpIC8gKHRoaXMuX3JlbW92YWxGYWlsdXJlcyArIDEpLFxuICAgICAgICApO1xuICAgICAgICBjb25zdCByZW1vdmVJdGVtcyA9IE1hdGgubWluKFxuICAgICAgICAgIHJlbmRlcmVkUmFuZ2UuZW5kIC0gcmVuZGVyZWRSYW5nZS5zdGFydCxcbiAgICAgICAgICBNYXRoLm1heCgwLCB1bmJvdW5kZWRSZW1vdmVJdGVtcyksXG4gICAgICAgICk7XG5cbiAgICAgICAgLy8gVGhlIG5ldyByYW5nZSB3ZSB3aWxsIHRlbGwgdGhlIHZpZXdwb3J0IHRvIHJlbmRlci4gV2UgZmlyc3QgZXhwYW5kIGl0IHRvIGluY2x1ZGUgdGhlIG5ld1xuICAgICAgICAvLyBpdGVtcyB3ZSB3YW50IHJlbmRlcmVkLCB3ZSB0aGVuIGNvbnRyYWN0IHRoZSBvcHBvc2l0ZSBzaWRlIHRvIHJlbW92ZSBpdGVtcyB3ZSBubyBsb25nZXJcbiAgICAgICAgLy8gd2FudCByZW5kZXJlZC5cbiAgICAgICAgY29uc3QgcmFuZ2UgPSB0aGlzLl9leHBhbmRSYW5nZShcbiAgICAgICAgICByZW5kZXJlZFJhbmdlLFxuICAgICAgICAgIHNjcm9sbERlbHRhIDwgMCA/IGFkZEl0ZW1zIDogMCxcbiAgICAgICAgICBzY3JvbGxEZWx0YSA+IDAgPyBhZGRJdGVtcyA6IDAsXG4gICAgICAgICk7XG4gICAgICAgIGlmIChzY3JvbGxEZWx0YSA8IDApIHtcbiAgICAgICAgICByYW5nZS5lbmQgPSBNYXRoLm1heChyYW5nZS5zdGFydCArIDEsIHJhbmdlLmVuZCAtIHJlbW92ZUl0ZW1zKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByYW5nZS5zdGFydCA9IE1hdGgubWluKHJhbmdlLmVuZCAtIDEsIHJhbmdlLnN0YXJ0ICsgcmVtb3ZlSXRlbXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVGhlIG5ldyBvZmZzZXQgd2Ugd2FudCB0byBzZXQgb24gdGhlIHJlbmRlcmVkIGNvbnRlbnQuIFRvIGRldGVybWluZSB0aGlzIHdlIG1lYXN1cmUgdGhlXG4gICAgICAgIC8vIG51bWJlciBvZiBwaXhlbHMgd2UgcmVtb3ZlZCBhbmQgdGhlbiBhZGp1c3QgdGhlIG9mZnNldCB0byB0aGUgc3RhcnQgb2YgdGhlIHJlbmRlcmVkXG4gICAgICAgIC8vIGNvbnRlbnQgb3IgdG8gdGhlIGVuZCBvZiB0aGUgcmVuZGVyZWQgY29udGVudCBhY2NvcmRpbmdseSAod2hpY2hldmVyIG9uZSBkb2Vzbid0IHJlcXVpcmVcbiAgICAgICAgLy8gdGhhdCB0aGUgbmV3bHkgYWRkZWQgaXRlbXMgdG8gYmUgcmVuZGVyZWQgdG8gY2FsY3VsYXRlLilcbiAgICAgICAgbGV0IGNvbnRlbnRPZmZzZXQ6IG51bWJlcjtcbiAgICAgICAgbGV0IGNvbnRlbnRPZmZzZXRUbzogJ3RvLXN0YXJ0JyB8ICd0by1lbmQnO1xuICAgICAgICBpZiAoc2Nyb2xsRGVsdGEgPCAwKSB7XG4gICAgICAgICAgbGV0IHJlbW92ZWRTaXplID0gdmlld3BvcnQubWVhc3VyZVJhbmdlU2l6ZSh7XG4gICAgICAgICAgICBzdGFydDogcmFuZ2UuZW5kLFxuICAgICAgICAgICAgZW5kOiByZW5kZXJlZFJhbmdlLmVuZCxcbiAgICAgICAgICB9KTtcbiAgICAgICAgICAvLyBDaGVjayB0aGF0IHdlJ3JlIG5vdCByZW1vdmluZyB0b28gbXVjaC5cbiAgICAgICAgICBpZiAocmVtb3ZlZFNpemUgPD0gb3ZlcnNjYW4pIHtcbiAgICAgICAgICAgIGNvbnRlbnRPZmZzZXQgPVxuICAgICAgICAgICAgICB0aGlzLl9sYXN0UmVuZGVyZWRDb250ZW50T2Zmc2V0ICsgdGhpcy5fbGFzdFJlbmRlcmVkQ29udGVudFNpemUgLSByZW1vdmVkU2l6ZTtcbiAgICAgICAgICAgIHRoaXMuX3JlbW92YWxGYWlsdXJlcyA9IDA7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIElmIHRoZSByZW1vdmFsIGlzIG1vcmUgdGhhbiB0aGUgb3ZlcnNjYW4gY2FuIGFic29yYiBqdXN0IHVuZG8gaXQgYW5kIHJlY29yZCB0aGUgZmFjdFxuICAgICAgICAgICAgLy8gdGhhdCB0aGUgcmVtb3ZhbCBmYWlsZWQgc28gd2UgY2FuIGJlIGxlc3MgYWdncmVzc2l2ZSBuZXh0IHRpbWUuXG4gICAgICAgICAgICByYW5nZS5lbmQgPSByZW5kZXJlZFJhbmdlLmVuZDtcbiAgICAgICAgICAgIGNvbnRlbnRPZmZzZXQgPSB0aGlzLl9sYXN0UmVuZGVyZWRDb250ZW50T2Zmc2V0ICsgdGhpcy5fbGFzdFJlbmRlcmVkQ29udGVudFNpemU7XG4gICAgICAgICAgICB0aGlzLl9yZW1vdmFsRmFpbHVyZXMrKztcbiAgICAgICAgICB9XG4gICAgICAgICAgY29udGVudE9mZnNldFRvID0gJ3RvLWVuZCc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3QgcmVtb3ZlZFNpemUgPSB2aWV3cG9ydC5tZWFzdXJlUmFuZ2VTaXplKHtcbiAgICAgICAgICAgIHN0YXJ0OiByZW5kZXJlZFJhbmdlLnN0YXJ0LFxuICAgICAgICAgICAgZW5kOiByYW5nZS5zdGFydCxcbiAgICAgICAgICB9KTtcbiAgICAgICAgICAvLyBDaGVjayB0aGF0IHdlJ3JlIG5vdCByZW1vdmluZyB0b28gbXVjaC5cbiAgICAgICAgICBpZiAocmVtb3ZlZFNpemUgPD0gb3ZlcnNjYW4pIHtcbiAgICAgICAgICAgIGNvbnRlbnRPZmZzZXQgPSB0aGlzLl9sYXN0UmVuZGVyZWRDb250ZW50T2Zmc2V0ICsgcmVtb3ZlZFNpemU7XG4gICAgICAgICAgICB0aGlzLl9yZW1vdmFsRmFpbHVyZXMgPSAwO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBJZiB0aGUgcmVtb3ZhbCBpcyBtb3JlIHRoYW4gdGhlIG92ZXJzY2FuIGNhbiBhYnNvcmIganVzdCB1bmRvIGl0IGFuZCByZWNvcmQgdGhlIGZhY3RcbiAgICAgICAgICAgIC8vIHRoYXQgdGhlIHJlbW92YWwgZmFpbGVkIHNvIHdlIGNhbiBiZSBsZXNzIGFnZ3Jlc3NpdmUgbmV4dCB0aW1lLlxuICAgICAgICAgICAgcmFuZ2Uuc3RhcnQgPSByZW5kZXJlZFJhbmdlLnN0YXJ0O1xuICAgICAgICAgICAgY29udGVudE9mZnNldCA9IHRoaXMuX2xhc3RSZW5kZXJlZENvbnRlbnRPZmZzZXQ7XG4gICAgICAgICAgICB0aGlzLl9yZW1vdmFsRmFpbHVyZXMrKztcbiAgICAgICAgICB9XG4gICAgICAgICAgY29udGVudE9mZnNldFRvID0gJ3RvLXN0YXJ0JztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFNldCB0aGUgcmFuZ2UgYW5kIG9mZnNldCB3ZSBjYWxjdWxhdGVkIGFib3ZlLlxuICAgICAgICB2aWV3cG9ydC5zZXRSZW5kZXJlZFJhbmdlKHJhbmdlKTtcbiAgICAgICAgdmlld3BvcnQuc2V0UmVuZGVyZWRDb250ZW50T2Zmc2V0KGNvbnRlbnRPZmZzZXQgKyBvZmZzZXRDb3JyZWN0aW9uLCBjb250ZW50T2Zmc2V0VG8pO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAob2Zmc2V0Q29ycmVjdGlvbikge1xuICAgICAgLy8gRXZlbiBpZiB0aGUgcmVuZGVyZWQgcmFuZ2UgZGlkbid0IGNoYW5nZSwgd2UgbWF5IHN0aWxsIG5lZWQgdG8gYWRqdXN0IHRoZSBjb250ZW50IG9mZnNldCB0b1xuICAgICAgLy8gc2ltdWxhdGUgc2Nyb2xsaW5nIHNsaWdodGx5IHNsb3dlciBvciBmYXN0ZXIgdGhhbiB0aGUgdXNlciBhY3R1YWxseSBzY3JvbGxlZC5cbiAgICAgIHZpZXdwb3J0LnNldFJlbmRlcmVkQ29udGVudE9mZnNldCh0aGlzLl9sYXN0UmVuZGVyZWRDb250ZW50T2Zmc2V0ICsgb2Zmc2V0Q29ycmVjdGlvbik7XG4gICAgfVxuXG4gICAgLy8gU2F2ZSB0aGUgc2Nyb2xsIG9mZnNldCB0byBiZSBjb21wYXJlZCB0byB0aGUgbmV3IHZhbHVlIG9uIHRoZSBuZXh0IHNjcm9sbCBldmVudC5cbiAgICB0aGlzLl9sYXN0U2Nyb2xsT2Zmc2V0ID0gc2Nyb2xsT2Zmc2V0O1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyB0aGUgc2l6ZSBvZiB0aGUgY3VycmVudGx5IHJlbmRlcmVkIGNvbnRlbnQgYW5kIHVzZXMgaXQgdG8gdXBkYXRlIHRoZSBlc3RpbWF0ZWQgaXRlbSBzaXplXG4gICAqIGFuZCBlc3RpbWF0ZWQgdG90YWwgY29udGVudCBzaXplLlxuICAgKi9cbiAgcHJpdmF0ZSBfY2hlY2tSZW5kZXJlZENvbnRlbnRTaXplKCkge1xuICAgIGNvbnN0IHZpZXdwb3J0ID0gdGhpcy5fdmlld3BvcnQhO1xuICAgIHRoaXMuX2xhc3RSZW5kZXJlZENvbnRlbnRTaXplID0gdmlld3BvcnQubWVhc3VyZVJlbmRlcmVkQ29udGVudFNpemUoKTtcbiAgICB0aGlzLl9hdmVyYWdlci5hZGRTYW1wbGUodmlld3BvcnQuZ2V0UmVuZGVyZWRSYW5nZSgpLCB0aGlzLl9sYXN0UmVuZGVyZWRDb250ZW50U2l6ZSk7XG4gICAgdGhpcy5fdXBkYXRlVG90YWxDb250ZW50U2l6ZSh0aGlzLl9sYXN0UmVuZGVyZWRDb250ZW50U2l6ZSk7XG4gIH1cblxuICAvKiogQ2hlY2tzIHRoZSBjdXJyZW50bHkgcmVuZGVyZWQgY29udGVudCBvZmZzZXQgYW5kIHNhdmVzIHRoZSB2YWx1ZSBmb3IgbGF0ZXIgdXNlLiAqL1xuICBwcml2YXRlIF9jaGVja1JlbmRlcmVkQ29udGVudE9mZnNldCgpIHtcbiAgICBjb25zdCB2aWV3cG9ydCA9IHRoaXMuX3ZpZXdwb3J0ITtcbiAgICB0aGlzLl9sYXN0UmVuZGVyZWRDb250ZW50T2Zmc2V0ID0gdmlld3BvcnQuZ2V0T2Zmc2V0VG9SZW5kZXJlZENvbnRlbnRTdGFydCgpITtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWNhbGN1bGF0ZXMgdGhlIHJlbmRlcmVkIGNvbnRlbnQgYmFzZWQgb24gb3VyIGVzdGltYXRlIG9mIHdoYXQgc2hvdWxkIGJlIHNob3duIGF0IHRoZSBjdXJyZW50XG4gICAqIHNjcm9sbCBvZmZzZXQuXG4gICAqL1xuICBwcml2YXRlIF9yZW5kZXJDb250ZW50Rm9yQ3VycmVudE9mZnNldCgpIHtcbiAgICBjb25zdCB2aWV3cG9ydCA9IHRoaXMuX3ZpZXdwb3J0ITtcbiAgICBjb25zdCBzY3JvbGxPZmZzZXQgPSB2aWV3cG9ydC5tZWFzdXJlU2Nyb2xsT2Zmc2V0KCk7XG4gICAgdGhpcy5fbGFzdFNjcm9sbE9mZnNldCA9IHNjcm9sbE9mZnNldDtcbiAgICB0aGlzLl9yZW1vdmFsRmFpbHVyZXMgPSAwO1xuXG4gICAgY29uc3QgaXRlbVNpemUgPSB0aGlzLl9hdmVyYWdlci5nZXRBdmVyYWdlSXRlbVNpemUoKTtcbiAgICBjb25zdCBmaXJzdFZpc2libGVJbmRleCA9IE1hdGgubWluKFxuICAgICAgdmlld3BvcnQuZ2V0RGF0YUxlbmd0aCgpIC0gMSxcbiAgICAgIE1hdGguZmxvb3Ioc2Nyb2xsT2Zmc2V0IC8gaXRlbVNpemUpLFxuICAgICk7XG4gICAgY29uc3QgYnVmZmVyU2l6ZSA9IE1hdGguY2VpbCh0aGlzLl9tYXhCdWZmZXJQeCAvIGl0ZW1TaXplKTtcbiAgICBjb25zdCByYW5nZSA9IHRoaXMuX2V4cGFuZFJhbmdlKFxuICAgICAgdGhpcy5fZ2V0VmlzaWJsZVJhbmdlRm9ySW5kZXgoZmlyc3RWaXNpYmxlSW5kZXgpLFxuICAgICAgYnVmZmVyU2l6ZSxcbiAgICAgIGJ1ZmZlclNpemUsXG4gICAgKTtcblxuICAgIHZpZXdwb3J0LnNldFJlbmRlcmVkUmFuZ2UocmFuZ2UpO1xuICAgIHZpZXdwb3J0LnNldFJlbmRlcmVkQ29udGVudE9mZnNldChpdGVtU2l6ZSAqIHJhbmdlLnN0YXJ0KTtcbiAgfVxuXG4gIC8vIFRPRE86IG1heWJlIG1vdmUgdG8gYmFzZSBjbGFzcywgY2FuIHByb2JhYmx5IHNoYXJlIHdpdGggZml4ZWQgc2l6ZSBzdHJhdGVneS5cbiAgLyoqXG4gICAqIEdldHMgdGhlIHZpc2libGUgcmFuZ2Ugb2YgZGF0YSBmb3IgdGhlIGdpdmVuIHN0YXJ0IGluZGV4LiBJZiB0aGUgc3RhcnQgaW5kZXggaXMgdG9vIGNsb3NlIHRvXG4gICAqIHRoZSBlbmQgb2YgdGhlIGxpc3QgaXQgbWF5IGJlIGJhY2tlZCB1cCB0byBlbnN1cmUgdGhlIGVzdGltYXRlZCBzaXplIG9mIHRoZSByYW5nZSBpcyBlbm91Z2ggdG9cbiAgICogZmlsbCB0aGUgdmlld3BvcnQuXG4gICAqIE5vdGU6IG11c3Qgbm90IGJlIGNhbGxlZCBpZiBgdGhpcy5fdmlld3BvcnRgIGlzIG51bGxcbiAgICogQHBhcmFtIHN0YXJ0SW5kZXggVGhlIGluZGV4IHRvIHN0YXJ0IHRoZSByYW5nZSBhdFxuICAgKiBAcmV0dXJuIGEgcmFuZ2UgZXN0aW1hdGVkIHRvIGJlIGxhcmdlIGVub3VnaCB0byBmaWxsIHRoZSB2aWV3cG9ydCB3aGVuIHJlbmRlcmVkLlxuICAgKi9cbiAgcHJpdmF0ZSBfZ2V0VmlzaWJsZVJhbmdlRm9ySW5kZXgoc3RhcnRJbmRleDogbnVtYmVyKTogTGlzdFJhbmdlIHtcbiAgICBjb25zdCB2aWV3cG9ydCA9IHRoaXMuX3ZpZXdwb3J0ITtcbiAgICBjb25zdCByYW5nZTogTGlzdFJhbmdlID0ge1xuICAgICAgc3RhcnQ6IHN0YXJ0SW5kZXgsXG4gICAgICBlbmQ6IHN0YXJ0SW5kZXggKyBNYXRoLmNlaWwodmlld3BvcnQuZ2V0Vmlld3BvcnRTaXplKCkgLyB0aGlzLl9hdmVyYWdlci5nZXRBdmVyYWdlSXRlbVNpemUoKSksXG4gICAgfTtcbiAgICBjb25zdCBleHRyYSA9IHJhbmdlLmVuZCAtIHZpZXdwb3J0LmdldERhdGFMZW5ndGgoKTtcbiAgICBpZiAoZXh0cmEgPiAwKSB7XG4gICAgICByYW5nZS5zdGFydCA9IE1hdGgubWF4KDAsIHJhbmdlLnN0YXJ0IC0gZXh0cmEpO1xuICAgIH1cbiAgICByZXR1cm4gcmFuZ2U7XG4gIH1cblxuICAvLyBUT0RPOiBtYXliZSBtb3ZlIHRvIGJhc2UgY2xhc3MsIGNhbiBwcm9iYWJseSBzaGFyZSB3aXRoIGZpeGVkIHNpemUgc3RyYXRlZ3kuXG4gIC8qKlxuICAgKiBFeHBhbmQgdGhlIGdpdmVuIHJhbmdlIGJ5IHRoZSBnaXZlbiBhbW91bnQgaW4gZWl0aGVyIGRpcmVjdGlvbi5cbiAgICogTm90ZTogbXVzdCBub3QgYmUgY2FsbGVkIGlmIGB0aGlzLl92aWV3cG9ydGAgaXMgbnVsbFxuICAgKiBAcGFyYW0gcmFuZ2UgVGhlIHJhbmdlIHRvIGV4cGFuZFxuICAgKiBAcGFyYW0gZXhwYW5kU3RhcnQgVGhlIG51bWJlciBvZiBpdGVtcyB0byBleHBhbmQgdGhlIHN0YXJ0IG9mIHRoZSByYW5nZSBieS5cbiAgICogQHBhcmFtIGV4cGFuZEVuZCBUaGUgbnVtYmVyIG9mIGl0ZW1zIHRvIGV4cGFuZCB0aGUgZW5kIG9mIHRoZSByYW5nZSBieS5cbiAgICogQHJldHVybiBUaGUgZXhwYW5kZWQgcmFuZ2UuXG4gICAqL1xuICBwcml2YXRlIF9leHBhbmRSYW5nZShyYW5nZTogTGlzdFJhbmdlLCBleHBhbmRTdGFydDogbnVtYmVyLCBleHBhbmRFbmQ6IG51bWJlcik6IExpc3RSYW5nZSB7XG4gICAgY29uc3Qgdmlld3BvcnQgPSB0aGlzLl92aWV3cG9ydCE7XG4gICAgY29uc3Qgc3RhcnQgPSBNYXRoLm1heCgwLCByYW5nZS5zdGFydCAtIGV4cGFuZFN0YXJ0KTtcbiAgICBjb25zdCBlbmQgPSBNYXRoLm1pbih2aWV3cG9ydC5nZXREYXRhTGVuZ3RoKCksIHJhbmdlLmVuZCArIGV4cGFuZEVuZCk7XG4gICAgcmV0dXJuIHtzdGFydCwgZW5kfTtcbiAgfVxuXG4gIC8qKiBVcGRhdGUgdGhlIHZpZXdwb3J0J3MgdG90YWwgY29udGVudCBzaXplLiAqL1xuICBwcml2YXRlIF91cGRhdGVUb3RhbENvbnRlbnRTaXplKHJlbmRlcmVkQ29udGVudFNpemU6IG51bWJlcikge1xuICAgIGNvbnN0IHZpZXdwb3J0ID0gdGhpcy5fdmlld3BvcnQhO1xuICAgIGNvbnN0IHJlbmRlcmVkUmFuZ2UgPSB2aWV3cG9ydC5nZXRSZW5kZXJlZFJhbmdlKCk7XG4gICAgY29uc3QgdG90YWxTaXplID1cbiAgICAgIHJlbmRlcmVkQ29udGVudFNpemUgK1xuICAgICAgKHZpZXdwb3J0LmdldERhdGFMZW5ndGgoKSAtIChyZW5kZXJlZFJhbmdlLmVuZCAtIHJlbmRlcmVkUmFuZ2Uuc3RhcnQpKSAqXG4gICAgICAgIHRoaXMuX2F2ZXJhZ2VyLmdldEF2ZXJhZ2VJdGVtU2l6ZSgpO1xuICAgIHZpZXdwb3J0LnNldFRvdGFsQ29udGVudFNpemUodG90YWxTaXplKTtcbiAgfVxufVxuXG4vKipcbiAqIFByb3ZpZGVyIGZhY3RvcnkgZm9yIGBBdXRvU2l6ZVZpcnR1YWxTY3JvbGxTdHJhdGVneWAgdGhhdCBzaW1wbHkgZXh0cmFjdHMgdGhlIGFscmVhZHkgY3JlYXRlZFxuICogYEF1dG9TaXplVmlydHVhbFNjcm9sbFN0cmF0ZWd5YCBmcm9tIHRoZSBnaXZlbiBkaXJlY3RpdmUuXG4gKiBAcGFyYW0gYXV0b1NpemVEaXIgVGhlIGluc3RhbmNlIG9mIGBDZGtBdXRvU2l6ZVZpcnR1YWxTY3JvbGxgIHRvIGV4dHJhY3QgdGhlXG4gKiAgICAgYEF1dG9TaXplVmlydHVhbFNjcm9sbFN0cmF0ZWd5YCBmcm9tLlxuICovXG5leHBvcnQgZnVuY3Rpb24gX2F1dG9TaXplVmlydHVhbFNjcm9sbFN0cmF0ZWd5RmFjdG9yeShhdXRvU2l6ZURpcjogQ2RrQXV0b1NpemVWaXJ0dWFsU2Nyb2xsKSB7XG4gIHJldHVybiBhdXRvU2l6ZURpci5fc2Nyb2xsU3RyYXRlZ3k7XG59XG5cbi8qKiBBIHZpcnR1YWwgc2Nyb2xsIHN0cmF0ZWd5IHRoYXQgc3VwcG9ydHMgdW5rbm93biBvciBkeW5hbWljIHNpemUgaXRlbXMuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdjZGstdmlydHVhbC1zY3JvbGwtdmlld3BvcnRbYXV0b3NpemVdJyxcbiAgcHJvdmlkZXJzOiBbXG4gICAge1xuICAgICAgcHJvdmlkZTogVklSVFVBTF9TQ1JPTExfU1RSQVRFR1ksXG4gICAgICB1c2VGYWN0b3J5OiBfYXV0b1NpemVWaXJ0dWFsU2Nyb2xsU3RyYXRlZ3lGYWN0b3J5LFxuICAgICAgZGVwczogW2ZvcndhcmRSZWYoKCkgPT4gQ2RrQXV0b1NpemVWaXJ0dWFsU2Nyb2xsKV0sXG4gICAgfSxcbiAgXSxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrQXV0b1NpemVWaXJ0dWFsU2Nyb2xsIGltcGxlbWVudHMgT25DaGFuZ2VzIHtcbiAgLyoqXG4gICAqIFRoZSBtaW5pbXVtIGFtb3VudCBvZiBidWZmZXIgcmVuZGVyZWQgYmV5b25kIHRoZSB2aWV3cG9ydCAoaW4gcGl4ZWxzKS5cbiAgICogSWYgdGhlIGFtb3VudCBvZiBidWZmZXIgZGlwcyBiZWxvdyB0aGlzIG51bWJlciwgbW9yZSBpdGVtcyB3aWxsIGJlIHJlbmRlcmVkLiBEZWZhdWx0cyB0byAxMDBweC5cbiAgICovXG4gIEBJbnB1dCgpXG4gIGdldCBtaW5CdWZmZXJQeCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9taW5CdWZmZXJQeDtcbiAgfVxuICBzZXQgbWluQnVmZmVyUHgodmFsdWU6IG51bWJlcikge1xuICAgIHRoaXMuX21pbkJ1ZmZlclB4ID0gY29lcmNlTnVtYmVyUHJvcGVydHkodmFsdWUpO1xuICB9XG4gIF9taW5CdWZmZXJQeCA9IDEwMDtcblxuICAvKipcbiAgICogVGhlIG51bWJlciBvZiBwaXhlbHMgd29ydGggb2YgYnVmZmVyIHRvIHNob290IGZvciB3aGVuIHJlbmRlcmluZyBuZXcgaXRlbXMuXG4gICAqIElmIHRoZSBhY3R1YWwgYW1vdW50IHR1cm5zIG91dCB0byBiZSBsZXNzIGl0IHdpbGwgbm90IG5lY2Vzc2FyaWx5IHRyaWdnZXIgYW4gYWRkaXRpb25hbFxuICAgKiByZW5kZXJpbmcgY3ljbGUgKGFzIGxvbmcgYXMgdGhlIGFtb3VudCBvZiBidWZmZXIgaXMgc3RpbGwgZ3JlYXRlciB0aGFuIGBtaW5CdWZmZXJQeGApLlxuICAgKiBEZWZhdWx0cyB0byAyMDBweC5cbiAgICovXG4gIEBJbnB1dCgpXG4gIGdldCBtYXhCdWZmZXJQeCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9tYXhCdWZmZXJQeDtcbiAgfVxuICBzZXQgbWF4QnVmZmVyUHgodmFsdWU6IG51bWJlcikge1xuICAgIHRoaXMuX21heEJ1ZmZlclB4ID0gY29lcmNlTnVtYmVyUHJvcGVydHkodmFsdWUpO1xuICB9XG4gIF9tYXhCdWZmZXJQeCA9IDIwMDtcblxuICAvKiogVGhlIHNjcm9sbCBzdHJhdGVneSB1c2VkIGJ5IHRoaXMgZGlyZWN0aXZlLiAqL1xuICBfc2Nyb2xsU3RyYXRlZ3kgPSBuZXcgQXV0b1NpemVWaXJ0dWFsU2Nyb2xsU3RyYXRlZ3kodGhpcy5taW5CdWZmZXJQeCwgdGhpcy5tYXhCdWZmZXJQeCk7XG5cbiAgbmdPbkNoYW5nZXMoKSB7XG4gICAgdGhpcy5fc2Nyb2xsU3RyYXRlZ3kudXBkYXRlQnVmZmVyU2l6ZSh0aGlzLm1pbkJ1ZmZlclB4LCB0aGlzLm1heEJ1ZmZlclB4KTtcbiAgfVxuXG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9taW5CdWZmZXJQeDogTnVtYmVySW5wdXQ7XG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9tYXhCdWZmZXJQeDogTnVtYmVySW5wdXQ7XG59XG4iXX0=