/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { AfterViewInit, ElementRef, OnDestroy, NgZone } from '@angular/core';
import { Directionality } from '@angular/cdk/bidi';
import { CdkColumnDef } from '@angular/cdk/table';
import { ReplaySubject } from 'rxjs';
import { ColumnResizeNotifierSource } from './column-resize-notifier';
import { HeaderRowEventDispatcher } from './event-dispatcher';
import { ResizeRef } from './resize-ref';
/**
 * Base class for a component shown over the edge of a resizable column that is responsible
 * for handling column resize mouse events and displaying any visible UI on the column edge.
 */
export declare abstract class ResizeOverlayHandle implements AfterViewInit, OnDestroy {
    protected readonly destroyed: ReplaySubject<void>;
    protected abstract readonly columnDef: CdkColumnDef;
    protected abstract readonly document: Document;
    protected abstract readonly directionality: Directionality;
    protected abstract readonly elementRef: ElementRef;
    protected abstract readonly eventDispatcher: HeaderRowEventDispatcher;
    protected abstract readonly ngZone: NgZone;
    protected abstract readonly resizeNotifier: ColumnResizeNotifierSource;
    protected abstract readonly resizeRef: ResizeRef;
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    private _listenForMouseEvents;
    private _dragStarted;
    protected updateResizeActive(active: boolean): void;
    private _getOriginWidth;
    private _getOriginOffset;
    private _getOverlayOffset;
    private _updateOverlayOffset;
    private _isLtr;
    private _notifyResizeEnded;
}
