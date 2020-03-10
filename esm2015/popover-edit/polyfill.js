/**
 * @fileoverview added by tsickle
 * Generated from: src/cdk-experimental/popover-edit/polyfill.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * IE 11 compatible matches implementation.
 * @param {?} element
 * @param {?} selector
 * @return {?}
 */
export function matches(element, selector) {
    return element.matches ?
        element.matches(selector) :
        ((/** @type {?} */ (element)))['msMatchesSelector'](selector);
}
/**
 * IE 11 compatible closest implementation that is able to start from non-Element Nodes.
 * @param {?} element
 * @param {?} selector
 * @return {?}
 */
export function closest(element, selector) {
    if (!(element instanceof Node)) {
        return null;
    }
    /** @type {?} */
    let curr = element;
    while (curr != null && !(curr instanceof Element)) {
        curr = curr.parentNode;
    }
    return curr && (/** @type {?} */ ((hasNativeClosest ?
        curr.closest(selector) : polyfillClosest(curr, selector))));
}
/**
 * Polyfill for browsers without Element.closest.
 * @param {?} element
 * @param {?} selector
 * @return {?}
 */
function polyfillClosest(element, selector) {
    /** @type {?} */
    let curr = element;
    while (curr != null && !(curr instanceof Element && matches(curr, selector))) {
        curr = curr.parentNode;
    }
    return (/** @type {?} */ ((curr || null)));
}
/** @type {?} */
const hasNativeClosest = !!Element.prototype.closest;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9seWZpbGwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrLWV4cGVyaW1lbnRhbC9wb3BvdmVyLWVkaXQvcG9seWZpbGwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBU0EsTUFBTSxVQUFVLE9BQU8sQ0FBQyxPQUFnQixFQUFFLFFBQWdCO0lBQ3hELE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3BCLE9BQU8sQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUMzQixDQUFDLG1CQUFBLE9BQU8sRUFBTyxDQUFDLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUN0RCxDQUFDOzs7Ozs7O0FBR0QsTUFBTSxVQUFVLE9BQU8sQ0FBQyxPQUEyQyxFQUFFLFFBQWdCO0lBRW5GLElBQUksQ0FBQyxDQUFDLE9BQU8sWUFBWSxJQUFJLENBQUMsRUFBRTtRQUFFLE9BQU8sSUFBSSxDQUFDO0tBQUU7O1FBRTVDLElBQUksR0FBYyxPQUFPO0lBQzdCLE9BQU8sSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLENBQUMsSUFBSSxZQUFZLE9BQU8sQ0FBQyxFQUFFO1FBQ2pELElBQUksR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO0tBQ3hCO0lBRUQsT0FBTyxJQUFJLElBQUksbUJBQUEsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQzlCLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUMsRUFBZ0IsQ0FBQztBQUNoRixDQUFDOzs7Ozs7O0FBR0QsU0FBUyxlQUFlLENBQUMsT0FBZ0IsRUFBRSxRQUFnQjs7UUFDckQsSUFBSSxHQUFjLE9BQU87SUFDN0IsT0FBTyxJQUFJLElBQUksSUFBSSxJQUFJLENBQUMsQ0FBQyxJQUFJLFlBQVksT0FBTyxJQUFJLE9BQU8sQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUMsRUFBRTtRQUM1RSxJQUFJLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQztLQUN4QjtJQUVELE9BQU8sbUJBQUEsQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLEVBQWdCLENBQUM7QUFDeEMsQ0FBQzs7TUFFSyxnQkFBZ0IsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxPQUFPIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbi8qKiBJRSAxMSBjb21wYXRpYmxlIG1hdGNoZXMgaW1wbGVtZW50YXRpb24uICovXG5leHBvcnQgZnVuY3Rpb24gbWF0Y2hlcyhlbGVtZW50OiBFbGVtZW50LCBzZWxlY3Rvcjogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiBlbGVtZW50Lm1hdGNoZXMgP1xuICAgICAgZWxlbWVudC5tYXRjaGVzKHNlbGVjdG9yKSA6XG4gICAgICAoZWxlbWVudCBhcyBhbnkpWydtc01hdGNoZXNTZWxlY3RvciddKHNlbGVjdG9yKTtcbn1cblxuLyoqIElFIDExIGNvbXBhdGlibGUgY2xvc2VzdCBpbXBsZW1lbnRhdGlvbiB0aGF0IGlzIGFibGUgdG8gc3RhcnQgZnJvbSBub24tRWxlbWVudCBOb2Rlcy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjbG9zZXN0KGVsZW1lbnQ6IEV2ZW50VGFyZ2V0fEVsZW1lbnR8bnVsbHx1bmRlZmluZWQsIHNlbGVjdG9yOiBzdHJpbmcpOlxuICAgIEVsZW1lbnR8bnVsbCB7XG4gIGlmICghKGVsZW1lbnQgaW5zdGFuY2VvZiBOb2RlKSkgeyByZXR1cm4gbnVsbDsgfVxuXG4gIGxldCBjdXJyOiBOb2RlfG51bGwgPSBlbGVtZW50O1xuICB3aGlsZSAoY3VyciAhPSBudWxsICYmICEoY3VyciBpbnN0YW5jZW9mIEVsZW1lbnQpKSB7XG4gICAgY3VyciA9IGN1cnIucGFyZW50Tm9kZTtcbiAgfVxuXG4gIHJldHVybiBjdXJyICYmIChoYXNOYXRpdmVDbG9zZXN0ID9cbiAgICAgIGN1cnIuY2xvc2VzdChzZWxlY3RvcikgOiBwb2x5ZmlsbENsb3Nlc3QoY3Vyciwgc2VsZWN0b3IpKSBhcyBFbGVtZW50fG51bGw7XG59XG5cbi8qKiBQb2x5ZmlsbCBmb3IgYnJvd3NlcnMgd2l0aG91dCBFbGVtZW50LmNsb3Nlc3QuICovXG5mdW5jdGlvbiBwb2x5ZmlsbENsb3Nlc3QoZWxlbWVudDogRWxlbWVudCwgc2VsZWN0b3I6IHN0cmluZyk6IEVsZW1lbnR8bnVsbCB7XG4gIGxldCBjdXJyOiBOb2RlfG51bGwgPSBlbGVtZW50O1xuICB3aGlsZSAoY3VyciAhPSBudWxsICYmICEoY3VyciBpbnN0YW5jZW9mIEVsZW1lbnQgJiYgbWF0Y2hlcyhjdXJyLCBzZWxlY3RvcikpKSB7XG4gICAgY3VyciA9IGN1cnIucGFyZW50Tm9kZTtcbiAgfVxuXG4gIHJldHVybiAoY3VyciB8fCBudWxsKSBhcyBFbGVtZW50fG51bGw7XG59XG5cbmNvbnN0IGhhc05hdGl2ZUNsb3Nlc3QgPSAhIUVsZW1lbnQucHJvdG90eXBlLmNsb3Nlc3Q7XG4iXX0=