/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ElementRef, NgZone } from '@angular/core';
import { CdkTable } from '@angular/cdk/table';
import { ColumnResize } from '../column-resize';
import { ColumnResizeNotifier, ColumnResizeNotifierSource } from '../column-resize-notifier';
import { HeaderRowEventDispatcher } from '../event-dispatcher';
import * as i0 from "@angular/core";
/**
 * Explicitly enables column resizing for a flexbox-based cdk-table.
 * Individual columns must be annotated specifically.
 */
export declare class CdkColumnResizeFlex extends ColumnResize {
    readonly columnResizeNotifier: ColumnResizeNotifier;
    readonly elementRef: ElementRef<HTMLElement>;
    protected readonly eventDispatcher: HeaderRowEventDispatcher;
    protected readonly ngZone: NgZone;
    protected readonly notifier: ColumnResizeNotifierSource;
    protected readonly table: CdkTable<unknown>;
    constructor(columnResizeNotifier: ColumnResizeNotifier, elementRef: ElementRef<HTMLElement>, eventDispatcher: HeaderRowEventDispatcher, ngZone: NgZone, notifier: ColumnResizeNotifierSource, table: CdkTable<unknown>);
    static ɵfac: i0.ɵɵFactoryDeclaration<CdkColumnResizeFlex, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<CdkColumnResizeFlex, "cdk-table[columnResize]", never, {}, {}, never>;
}
