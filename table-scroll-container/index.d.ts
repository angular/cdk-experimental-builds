import * as _angular_core from '@angular/core';
import { OnDestroy, OnInit } from '@angular/core';
import { StickyPositioningListener, StickyUpdate } from '@angular/cdk/table';

/**
 * Applies styles to the host element that make its scrollbars match up with
 * the non-sticky scrollable portions of the CdkTable contained within.
 *
 * This visual effect only works in Webkit and Blink based browsers (eg Chrome,
 * Safari, Edge). Other browsers such as Firefox will gracefully degrade to
 * normal scrollbar appearance.
 * Further note: These styles have no effect when the browser is using OS-default
 * scrollbars. The easiest way to force them into custom mode is to specify width
 * and height for the scrollbar and thumb.
 */
declare class CdkTableScrollContainer implements StickyPositioningListener, OnDestroy, OnInit {
    private readonly _elementRef;
    private readonly _document;
    private readonly _directionality;
    private readonly _nonce;
    private readonly _uniqueClassName;
    private _styleRoot;
    private _styleElement?;
    /** The most recent sticky column size values from the CdkTable. */
    private _startSizes;
    private _endSizes;
    private _headerSizes;
    private _footerSizes;
    ngOnInit(): void;
    ngOnDestroy(): void;
    stickyColumnsUpdated({ sizes }: StickyUpdate): void;
    stickyEndColumnsUpdated({ sizes }: StickyUpdate): void;
    stickyHeaderRowsUpdated({ sizes }: StickyUpdate): void;
    stickyFooterRowsUpdated({ sizes }: StickyUpdate): void;
    /**
     * Set padding on the scrollbar track based on the sticky states from CdkTable.
     */
    private _updateScrollbar;
    /** Gets the stylesheet for the scrollbar styles and creates it if need be. */
    private _getStyleSheet;
    /** Updates the stylesheet with the specified scrollbar style. */
    private _applyCss;
    private _clearCss;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CdkTableScrollContainer, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<CdkTableScrollContainer, "[cdkTableScrollContainer]", never, {}, {}, never, never, true, never>;
}

declare class CdkTableScrollContainerModule {
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CdkTableScrollContainerModule, never>;
    static ɵmod: _angular_core.ɵɵNgModuleDeclaration<CdkTableScrollContainerModule, never, [typeof CdkTableScrollContainer], [typeof CdkTableScrollContainer]>;
    static ɵinj: _angular_core.ɵɵInjectorDeclaration<CdkTableScrollContainerModule>;
}

export { CdkTableScrollContainer, CdkTableScrollContainerModule };
