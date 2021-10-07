/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { NgZone } from '@angular/core';
import { FocusTrapFactory } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { Overlay } from '@angular/cdk/overlay';
import { ScrollDispatcher, ViewportRuler } from '@angular/cdk/scrolling';
import { EditEventDispatcher } from './edit-event-dispatcher';
import { FocusDispatcher } from './focus-dispatcher';
import { PopoverEditPositionStrategyFactory } from './popover-edit-position-strategy-factory';
import { EditRef } from './edit-ref';
import * as i0 from "@angular/core";
/**
 * Optimization
 * Collects multiple Injectables into a singleton shared across the table. By reducing the
 * number of services injected into each CdkPopoverEdit, this saves about 0.023ms of cpu time
 * and 56 bytes of memory per instance.
 */
export declare class EditServices {
    readonly directionality: Directionality;
    readonly editEventDispatcher: EditEventDispatcher<EditRef<unknown>>;
    readonly focusDispatcher: FocusDispatcher;
    readonly focusTrapFactory: FocusTrapFactory;
    readonly ngZone: NgZone;
    readonly overlay: Overlay;
    readonly positionFactory: PopoverEditPositionStrategyFactory;
    readonly scrollDispatcher: ScrollDispatcher;
    readonly viewportRuler: ViewportRuler;
    constructor(directionality: Directionality, editEventDispatcher: EditEventDispatcher<EditRef<unknown>>, focusDispatcher: FocusDispatcher, focusTrapFactory: FocusTrapFactory, ngZone: NgZone, overlay: Overlay, positionFactory: PopoverEditPositionStrategyFactory, scrollDispatcher: ScrollDispatcher, viewportRuler: ViewportRuler);
    static ɵfac: i0.ɵɵFactoryDeclaration<EditServices, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<EditServices>;
}
