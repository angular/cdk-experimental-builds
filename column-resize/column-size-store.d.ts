import * as i0 from "@angular/core";
/**
 * Can be provided by the host application to enable persistence of column resize state.
 */
export declare abstract class ColumnSizeStore {
    /** Returns the persisted size of the specified column in the specified table. */
    abstract getSize(tableId: string, columnId: string): number;
    /** Persists the size of the specified column in the specified table. */
    abstract setSize(tableId: string, columnId: string): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<ColumnSizeStore, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<ColumnSizeStore>;
}
