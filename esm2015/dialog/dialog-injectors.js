/**
 * @fileoverview added by tsickle
 * Generated from: src/cdk-experimental/dialog/dialog-injectors.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { InjectionToken } from '@angular/core';
import { Overlay, } from '@angular/cdk/overlay';
/**
 * Injection token for the Dialog's ScrollStrategy.
 * @type {?}
 */
export const DIALOG_SCROLL_STRATEGY = new InjectionToken('DialogScrollStrategy');
/**
 * Injection token for the Dialog's Data.
 * @type {?}
 */
export const DIALOG_DATA = new InjectionToken('DialogData');
/**
 * Injection token for the DialogRef constructor.
 * @type {?}
 */
export const DIALOG_REF = new InjectionToken('DialogRef');
/**
 * Injection token for the DialogConfig.
 * @type {?}
 */
export const DIALOG_CONFIG = new InjectionToken('DialogConfig');
/**
 * Injection token for the Dialog's DialogContainer component.
 * @type {?}
 */
export const DIALOG_CONTAINER = new InjectionToken('DialogContainer');
/**
 * \@docs-private
 * @param {?} overlay
 * @return {?}
 */
export function MAT_DIALOG_SCROLL_STRATEGY_PROVIDER_FACTORY(overlay) {
    return (/**
     * @return {?}
     */
    () => overlay.scrollStrategies.block());
}
/**
 * \@docs-private
 * @type {?}
 */
export const MAT_DIALOG_SCROLL_STRATEGY_PROVIDER = {
    provide: DIALOG_SCROLL_STRATEGY,
    deps: [Overlay],
    useFactory: MAT_DIALOG_SCROLL_STRATEGY_PROVIDER_FACTORY,
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhbG9nLWluamVjdG9ycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL2RpYWxvZy9kaWFsb2ctaW5qZWN0b3JzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQVFBLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDN0MsT0FBTyxFQUVMLE9BQU8sR0FFUixNQUFNLHNCQUFzQixDQUFDOzs7OztBQU05QixNQUFNLE9BQU8sc0JBQXNCLEdBQy9CLElBQUksY0FBYyxDQUF1QixzQkFBc0IsQ0FBQzs7Ozs7QUFHcEUsTUFBTSxPQUFPLFdBQVcsR0FBRyxJQUFJLGNBQWMsQ0FBTSxZQUFZLENBQUM7Ozs7O0FBR2hFLE1BQU0sT0FBTyxVQUFVLEdBQUcsSUFBSSxjQUFjLENBQWlCLFdBQVcsQ0FBQzs7Ozs7QUFHekUsTUFBTSxPQUFPLGFBQWEsR0FBRyxJQUFJLGNBQWMsQ0FBZSxjQUFjLENBQUM7Ozs7O0FBRzdFLE1BQU0sT0FBTyxnQkFBZ0IsR0FDekIsSUFBSSxjQUFjLENBQW9DLGlCQUFpQixDQUFDOzs7Ozs7QUFHNUUsTUFBTSxVQUFVLDJDQUEyQyxDQUFDLE9BQWdCO0lBRTFFOzs7SUFBTyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxFQUFFLEVBQUM7QUFDaEQsQ0FBQzs7Ozs7QUFHRCxNQUFNLE9BQU8sbUNBQW1DLEdBQUc7SUFDakQsT0FBTyxFQUFFLHNCQUFzQjtJQUMvQixJQUFJLEVBQUUsQ0FBQyxPQUFPLENBQUM7SUFDZixVQUFVLEVBQUUsMkNBQTJDO0NBQ3hEIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SW5qZWN0aW9uVG9rZW59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtcbiAgQ29tcG9uZW50VHlwZSxcbiAgT3ZlcmxheSxcbiAgU2Nyb2xsU3RyYXRlZ3ksXG59IGZyb20gJ0Bhbmd1bGFyL2Nkay9vdmVybGF5JztcbmltcG9ydCB7RGlhbG9nUmVmfSBmcm9tICcuL2RpYWxvZy1yZWYnO1xuaW1wb3J0IHtDZGtEaWFsb2dDb250YWluZXJ9IGZyb20gJy4vZGlhbG9nLWNvbnRhaW5lcic7XG5pbXBvcnQge0RpYWxvZ0NvbmZpZ30gZnJvbSAnLi9kaWFsb2ctY29uZmlnJztcblxuLyoqIEluamVjdGlvbiB0b2tlbiBmb3IgdGhlIERpYWxvZydzIFNjcm9sbFN0cmF0ZWd5LiAqL1xuZXhwb3J0IGNvbnN0IERJQUxPR19TQ1JPTExfU1RSQVRFR1kgPVxuICAgIG5ldyBJbmplY3Rpb25Ub2tlbjwoKSA9PiBTY3JvbGxTdHJhdGVneT4oJ0RpYWxvZ1Njcm9sbFN0cmF0ZWd5Jyk7XG5cbi8qKiBJbmplY3Rpb24gdG9rZW4gZm9yIHRoZSBEaWFsb2cncyBEYXRhLiAqL1xuZXhwb3J0IGNvbnN0IERJQUxPR19EQVRBID0gbmV3IEluamVjdGlvblRva2VuPGFueT4oJ0RpYWxvZ0RhdGEnKTtcblxuLyoqIEluamVjdGlvbiB0b2tlbiBmb3IgdGhlIERpYWxvZ1JlZiBjb25zdHJ1Y3Rvci4gKi9cbmV4cG9ydCBjb25zdCBESUFMT0dfUkVGID0gbmV3IEluamVjdGlvblRva2VuPERpYWxvZ1JlZjxhbnk+PignRGlhbG9nUmVmJyk7XG5cbi8qKiBJbmplY3Rpb24gdG9rZW4gZm9yIHRoZSBEaWFsb2dDb25maWcuICovXG5leHBvcnQgY29uc3QgRElBTE9HX0NPTkZJRyA9IG5ldyBJbmplY3Rpb25Ub2tlbjxEaWFsb2dDb25maWc+KCdEaWFsb2dDb25maWcnKTtcblxuLyoqIEluamVjdGlvbiB0b2tlbiBmb3IgdGhlIERpYWxvZydzIERpYWxvZ0NvbnRhaW5lciBjb21wb25lbnQuICovXG5leHBvcnQgY29uc3QgRElBTE9HX0NPTlRBSU5FUiA9XG4gICAgbmV3IEluamVjdGlvblRva2VuPENvbXBvbmVudFR5cGU8Q2RrRGlhbG9nQ29udGFpbmVyPj4oJ0RpYWxvZ0NvbnRhaW5lcicpO1xuXG4vKiogQGRvY3MtcHJpdmF0ZSAqL1xuZXhwb3J0IGZ1bmN0aW9uIE1BVF9ESUFMT0dfU0NST0xMX1NUUkFURUdZX1BST1ZJREVSX0ZBQ1RPUlkob3ZlcmxheTogT3ZlcmxheSk6XG4gICAgKCkgPT4gU2Nyb2xsU3RyYXRlZ3kge1xuICByZXR1cm4gKCkgPT4gb3ZlcmxheS5zY3JvbGxTdHJhdGVnaWVzLmJsb2NrKCk7XG59XG5cbi8qKiBAZG9jcy1wcml2YXRlICovXG5leHBvcnQgY29uc3QgTUFUX0RJQUxPR19TQ1JPTExfU1RSQVRFR1lfUFJPVklERVIgPSB7XG4gIHByb3ZpZGU6IERJQUxPR19TQ1JPTExfU1RSQVRFR1ksXG4gIGRlcHM6IFtPdmVybGF5XSxcbiAgdXNlRmFjdG9yeTogTUFUX0RJQUxPR19TQ1JPTExfU1RSQVRFR1lfUFJPVklERVJfRkFDVE9SWSxcbn07XG4iXX0=