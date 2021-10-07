import * as i0 from "@angular/core";
import * as i1 from "./column-resize-directives/default-enabled-column-resize";
import * as i2 from "./column-resize-directives/default-enabled-column-resize-flex";
import * as i3 from "./column-resize-directives/column-resize";
import * as i4 from "./column-resize-directives/column-resize-flex";
/**
 * One of two NgModules for use with CdkColumnResize.
 * When using this module, columns are resizable by default.
 */
export declare class CdkColumnResizeDefaultEnabledModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<CdkColumnResizeDefaultEnabledModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<CdkColumnResizeDefaultEnabledModule, [typeof i1.CdkDefaultEnabledColumnResize, typeof i2.CdkDefaultEnabledColumnResizeFlex], never, [typeof i1.CdkDefaultEnabledColumnResize, typeof i2.CdkDefaultEnabledColumnResizeFlex]>;
    static ɵinj: i0.ɵɵInjectorDeclaration<CdkColumnResizeDefaultEnabledModule>;
}
/**
 * One of two NgModules for use with CdkColumnResize.
 * When using this module, columns are not resizable by default.
 */
export declare class CdkColumnResizeModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<CdkColumnResizeModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<CdkColumnResizeModule, [typeof i3.CdkColumnResize, typeof i4.CdkColumnResizeFlex], never, [typeof i3.CdkColumnResize, typeof i4.CdkColumnResizeFlex]>;
    static ɵinj: i0.ɵɵInjectorDeclaration<CdkColumnResizeModule>;
}
