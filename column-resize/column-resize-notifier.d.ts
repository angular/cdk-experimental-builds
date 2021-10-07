import { Observable, Subject } from 'rxjs';
import * as i0 from "@angular/core";
/** Indicates the width of a column. */
export interface ColumnSize {
    /** The ID/name of the column, as defined in CdkColumnDef. */
    readonly columnId: string;
    /** The width in pixels of the column. */
    readonly size: number;
    /** The width in pixels of the column prior to this update, if known. */
    readonly previousSize?: number;
}
/** Interface describing column size changes. */
export interface ColumnSizeAction extends ColumnSize {
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
export declare class ColumnResizeNotifierSource {
    /** Emits when an in-progress resize is canceled. */
    readonly resizeCanceled: Subject<ColumnSizeAction>;
    /** Emits when a resize is applied. */
    readonly resizeCompleted: Subject<ColumnSize>;
    /** Triggers a resize action. */
    readonly triggerResize: Subject<ColumnSizeAction>;
    static ɵfac: i0.ɵɵFactoryDeclaration<ColumnResizeNotifierSource, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<ColumnResizeNotifierSource>;
}
/** Service for triggering column resizes imperatively or being notified of them. */
export declare class ColumnResizeNotifier {
    private readonly _source;
    /** Emits whenever a column is resized. */
    readonly resizeCompleted: Observable<ColumnSize>;
    constructor(_source: ColumnResizeNotifierSource);
    /** Instantly resizes the specified column. */
    resize(columnId: string, size: number): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<ColumnResizeNotifier, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<ColumnResizeNotifier>;
}
