/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Inject, Injectable, InjectionToken, Optional, SkipSelf } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, startWith } from 'rxjs/operators';
import * as i0 from "@angular/core";
/** Injection token used for an implementation of MenuStack. */
export const MENU_STACK = new InjectionToken('cdk-menu-stack');
/** A provider that provides the parent menu stack, or a new menu stack if there is no parent one. */
export const PARENT_OR_NEW_MENU_STACK_PROVIDER = {
    provide: MENU_STACK,
    deps: [[new Optional(), new SkipSelf(), new Inject(MENU_STACK)]],
    useFactory: (parentMenuStack) => parentMenuStack || new MenuStack(),
};
/** A provider that provides the parent menu stack, or a new menu stack if there is no parent one. */
export const PARENT_OR_NEW_INLINE_MENU_STACK_PROVIDER = {
    provide: MENU_STACK,
    deps: [[new Optional(), new SkipSelf(), new Inject(MENU_STACK)]],
    useFactory: (parentMenuStack) => parentMenuStack || MenuStack.inline(),
};
/**
 * MenuStack allows subscribers to listen for close events (when a MenuStackItem is popped off
 * of the stack) in order to perform closing actions. Upon the MenuStack being empty it emits
 * from the `empty` observable specifying the next focus action which the listener should perform
 * as requested by the closer.
 */
export class MenuStack {
    constructor() {
        /** All MenuStackItems tracked by this MenuStack. */
        this._elements = [];
        /** Emits the element which was popped off of the stack when requested by a closer. */
        this._close = new Subject();
        /** Emits once the MenuStack has become empty after popping off elements. */
        this._empty = new Subject();
        this._hasFocus = new Subject();
        /** Observable which emits the MenuStackItem which has been requested to close. */
        this.closed = this._close;
        this.hasFocus = this._hasFocus.pipe(startWith(false), debounceTime(0), distinctUntilChanged());
        /**
         * Observable which emits when the MenuStack is empty after popping off the last element. It
         * emits a FocusNext event which specifies the action the closer has requested the listener
         * perform.
         */
        this.emptied = this._empty;
        this._hasInlineMenu = false;
    }
    static inline() {
        const stack = new MenuStack();
        stack._hasInlineMenu = true;
        return stack;
    }
    /** @param menu the MenuStackItem to put on the stack. */
    push(menu) {
        this._elements.push(menu);
    }
    /**
     * Pop items off of the stack up to and including `lastItem` and emit each on the close
     * observable. If the stack is empty or `lastItem` is not on the stack it does nothing.
     * @param lastItem the last item to pop off the stack.
     * @param options Options that configure behavior on close.
     */
    close(lastItem, options) {
        const { focusNextOnEmpty, focusParentTrigger } = { ...options };
        if (this._elements.indexOf(lastItem) >= 0) {
            let poppedElement;
            do {
                poppedElement = this._elements.pop();
                this._close.next({ item: poppedElement, focusParentTrigger });
            } while (poppedElement !== lastItem);
            if (this.isEmpty()) {
                this._empty.next(focusNextOnEmpty);
            }
        }
    }
    /**
     * Pop items off of the stack up to but excluding `lastItem` and emit each on the close
     * observable. If the stack is empty or `lastItem` is not on the stack it does nothing.
     * @param lastItem the element which should be left on the stack
     * @return whether or not an item was removed from the stack
     */
    closeSubMenuOf(lastItem) {
        let removed = false;
        if (this._elements.indexOf(lastItem) >= 0) {
            removed = this.peek() !== lastItem;
            while (this.peek() !== lastItem) {
                this._close.next({ item: this._elements.pop() });
            }
        }
        return removed;
    }
    /**
     * Pop off all MenuStackItems and emit each one on the `close` observable one by one.
     * @param options Options that configure behavior on close.
     */
    closeAll(options) {
        const { focusNextOnEmpty, focusParentTrigger } = { ...options };
        if (!this.isEmpty()) {
            while (!this.isEmpty()) {
                const menuStackItem = this._elements.pop();
                if (menuStackItem) {
                    this._close.next({ item: menuStackItem, focusParentTrigger });
                }
            }
            this._empty.next(focusNextOnEmpty);
        }
    }
    /** Return true if this stack is empty. */
    isEmpty() {
        return !this._elements.length;
    }
    /** Return the length of the stack. */
    length() {
        return this._elements.length;
    }
    /** Get the top most element on the stack. */
    peek() {
        return this._elements[this._elements.length - 1];
    }
    /** Whether the menu stack is associated with an inline menu. */
    hasInlineMenu() {
        return this._hasInlineMenu;
    }
    /** Sets whether the menu stack contains the focused element. */
    setHasFocus(hasFocus) {
        this._hasFocus.next(hasFocus);
    }
}
MenuStack.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.0.0-next.9", ngImport: i0, type: MenuStack, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
MenuStack.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "14.0.0-next.9", ngImport: i0, type: MenuStack });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.0.0-next.9", ngImport: i0, type: MenuStack, decorators: [{
            type: Injectable
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL21lbnUvbWVudS1zdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsTUFBTSxFQUFFLFVBQVUsRUFBRSxjQUFjLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUNyRixPQUFPLEVBQWEsT0FBTyxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQ3pDLE9BQU8sRUFBQyxZQUFZLEVBQUUsb0JBQW9CLEVBQUUsU0FBUyxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7O0FBZTdFLCtEQUErRDtBQUMvRCxNQUFNLENBQUMsTUFBTSxVQUFVLEdBQUcsSUFBSSxjQUFjLENBQVksZ0JBQWdCLENBQUMsQ0FBQztBQUUxRSxxR0FBcUc7QUFDckcsTUFBTSxDQUFDLE1BQU0saUNBQWlDLEdBQUc7SUFDL0MsT0FBTyxFQUFFLFVBQVU7SUFDbkIsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJLFFBQVEsRUFBRSxFQUFFLElBQUksUUFBUSxFQUFFLEVBQUUsSUFBSSxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztJQUNoRSxVQUFVLEVBQUUsQ0FBQyxlQUEyQixFQUFFLEVBQUUsQ0FBQyxlQUFlLElBQUksSUFBSSxTQUFTLEVBQUU7Q0FDaEYsQ0FBQztBQUVGLHFHQUFxRztBQUNyRyxNQUFNLENBQUMsTUFBTSx3Q0FBd0MsR0FBRztJQUN0RCxPQUFPLEVBQUUsVUFBVTtJQUNuQixJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksUUFBUSxFQUFFLEVBQUUsSUFBSSxRQUFRLEVBQUUsRUFBRSxJQUFJLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO0lBQ2hFLFVBQVUsRUFBRSxDQUFDLGVBQTJCLEVBQUUsRUFBRSxDQUFDLGVBQWUsSUFBSSxTQUFTLENBQUMs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QUMsR0FBRyxFQUFFLENBQUM7Z0JBQzNDLElBQUksYUFBYSxFQUFFO29CQUNqQixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFDLElBQUksRUFBRSxhQUFhLEVBQUUsa0JBQWtCLEVBQUMsQ0FBQyxDQUFDO2lCQUM3RDthQUNGO1lBQ0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztTQUNwQztJQUNILENBQUM7SUFFRCwwQ0FBMEM7SUFDMUMsT0FBTztRQUNMLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQztJQUNoQyxDQUFDO0lBRUQsc0NBQXNDO0lBQ3RDLE1BQU07UUFDSixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDO0lBQy9CLENBQUM7SUFFRCw2Q0FBNkM7SUFDN0MsSUFBSTtRQUNGLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztJQUNuRCxDQUFDO0lBRUQsZ0VBQWdFO0lBQ2hFLGFBQWE7UUFDWCxPQUFPLElBQUksQ0FBQyxjQUFjLENBQUM7SUFDN0IsQ0FBQztJQUVELGdFQUFnRTtJQUNoRSxXQUFXLENBQUMsUUFBaUI7UUFDM0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDaEMsQ0FBQzs7NkdBdkhVLFNBQVM7aUhBQVQsU0FBUztrR0FBVCxTQUFTO2tCQURyQixVQUFVIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SW5qZWN0LCBJbmplY3RhYmxlLCBJbmplY3Rpb25Ub2tlbiwgT3B0aW9uYWwsIFNraXBTZWxmfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7T2JzZXJ2YWJsZSwgU3ViamVjdH0gZnJvbSAncnhqcyc7XG5pbXBvcnQge2RlYm91bmNlVGltZSwgZGlzdGluY3RVbnRpbENoYW5nZWQsIHN0YXJ0V2l0aH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuXG4vKiogRXZlbnRzIHRvIGVtaXQgYXMgc3BlY2lmaWVkIGJ5IHRoZSBjYWxsZXIgb25jZSB0aGUgTWVudVN0YWNrIGlzIGVtcHR5LiAqL1xuZXhwb3J0IGNvbnN0IGVudW0gRm9jdXNOZXh0IHtcbiAgbmV4dEl0ZW0sXG4gIHByZXZpb3VzSXRlbSxcbiAgY3VycmVudEl0ZW0sXG59XG5cbi8qKiBJbnRlcmZhY2UgZm9yIHRoZSBlbGVtZW50cyB0cmFja2VkIGluIHRoZSBNZW51U3RhY2suICovXG5leHBvcnQgaW50ZXJmYWNlIE1lbnVTdGFja0l0ZW0ge1xuICAvKiogQSByZWZlcmVuY2UgdG8gdGhlIHByZXZpb3VzIE1lbnVzIE1lbnVTdGFjayBpbnN0YW5jZS4gKi9cbiAgbWVudVN0YWNrPzogTWVudVN0YWNrO1xufVxuXG4vKiogSW5qZWN0aW9uIHRva2VuIHVzZWQgZm9yIGFuIGltcGxlbWVudGF0aW9uIG9mIE1lbnVTdGFjay4gKi9cbmV4cG9ydCBjb25zdCBNRU5VX1NUQUNLID0gbmV3IEluamVjdGlvblRva2VuPE1lbnVTdGFjaz4oJ2Nkay1tZW51LXN0YWNrJyk7XG5cbi8qKiBBIHByb3ZpZGVyIHRoYXQgcHJvdmlkZXMgdGhlIHBhcmVudCBtZW51IHN0YWNrLCBvciBhIG5ldyBtZW51IHN0YWNrIGlmIHRoZXJlIGlzIG5vIHBhcmVudCBvbmUuICovXG5leHBvcnQgY29uc3QgUEFSRU5UX09SX05FV19NRU5VX1NUQUNLX1BST1ZJREVSID0ge1xuICBwcm92aWRlOiBNRU5VX1NUQUNLLFxuICBkZXBzOiBbW25ldyBPcHRpb25hbCgpLCBuZXcgU2tpcFNlbGYoKSwgbmV3IEluamVjdChNRU5VX1NUQUNLKV1dLFxuICB1c2VGYWN0b3J5OiAocGFyZW50TWVudVN0YWNrPzogTWVudVN0YWNrKSA9PiBwYXJlbnRNZW51U3RhY2sgfHwgbmV3IE1lbnVTdGFjaygpLFxufTtcblxuLyoqIEEgcHJvdmlkZXIgdGhhdCBwcm92aWRlcyB0aGUgcGFyZW50IG1lbnUgc3RhY2ssIG9yIGEgbmV3IG1lbnUgc3RhY2sgaWYgdGhlcmUgaXMgbm8gcGFyZW50IG9uZS4gKi9cbmV4cG9ydCBjb25zdCBQQVJFTlRfT1JfTkVXX0lOTElORV9NRU5VX1NUQUNLX1BST1ZJREVSID0ge1xuICBwcm92aWRlOiBNRU5VX1NUQUNLLFxuICBkZXBzOiBbW25ldyBPcHRpb25hbCgpLCBuZXcgU2tpcFNlbGYoKSwgbmV3IEluamVjdChNRU5VX1NUQUNLKV1dLFxuICB1c2VGYWN0b3J5OiAocGFyZW50TWVudVN0YWNrPzogTWVudVN0YWNrKSA9PiBwYXJlbnRNZW51U3RhY2sgfHwgTWVudVN0YWNrLmlubGluZSgpLFxufTtcblxuLyoqIE9wdGlvbnMgdGhhdCBjYW4gYmUgcHJvdmlkZWQgdG8gdGhlIGNsb3NlIG9yIGNsb3NlQWxsIG1ldGhvZHMuICovXG5leHBvcnQgaW50ZXJmYWNlIENsb3NlT3B0aW9ucyB7XG4gIC8qKiBUaGUgZWxlbWVudCB0byBmb2N1cyBuZXh0IGlmIHRoZSBjbG9zZSBvcGVyYXRpb24gY2F1c2VzIHRoZSBtZW51IHN0YWNrIHRvIGJlY29tZSBlbXB0eS4gKi9cbiAgZm9jdXNOZXh0T25FbXB0eT86IEZvY3VzTmV4dDtcbiAgLyoqIFdoZXRoZXIgdG8gZm9jdXMgdGhlIHBhcmVudCB0cmlnZ2VyIGFmdGVyIGNsb3NpbmcgdGhlIG1lbnUuICovXG4gIGZvY3VzUGFyZW50VHJpZ2dlcj86IGJvb2xlYW47XG59XG5cbi8qKiBFdmVudCBkaXNwYXRjaGVkIHdoZW4gYSBtZW51IGlzIGNsb3NlZC4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTWVudVN0YWNrQ2xvc2VFdmVudCB7XG4gIC8qKiBUaGUgbWVudSBiZWluZyBjbG9zZWQuICovXG4gIGl0ZW06IE1lbnVTdGFja0l0ZW0gfCB1bmRlZmluZWQ7XG4gIC8qKiBXaGV0aGVyIHRvIGZvY3VzIHRoZSBwYXJlbnQgdHJpZ2dlciBhZnRlciBjbG9zaW5nIHRoZSBtZW51LiAqL1xuICBmb2N1c1BhcmVudFRyaWdnZXI/OiBib29sZWFuO1xufVxuXG4vKipcbiAqIE1lbnVTdGFjayBhbGxvd3Mgc3Vic2NyaWJlcnMgdG8gbGlzdGVuIGZvciBjbG9zZSBldmVudHMgKHdoZW4gYSBNZW51U3RhY2tJdGVtIGlzIHBvcHBlZCBvZmZcbiAqIG9mIHRoZSBzdGFjaykgaW4gb3JkZXIgdG8gcGVyZm9ybSBjbG9zaW5nIGFjdGlvbnMuIFVwb24gdGhlIE1lbnVTdGFjayBiZWluZyBlbXB0eSBpdCBlbWl0c1xuICogZnJvbSB0aGUgYGVtcHR5YCBvYnNlcnZhYmxlIHNwZWNpZnlpbmcgdGhlIG5leHQgZm9jdXMgYWN0aW9uIHdoaWNoIHRoZSBsaXN0ZW5lciBzaG91bGQgcGVyZm9ybVxuICogYXMgcmVxdWVzdGVkIGJ5IHRoZSBjbG9zZXIuXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBNZW51U3RhY2sge1xuICAvKiogQWxsIE1lbnVTdGFja0l0ZW1zIHRyYWNrZWQgYnkgdGhpcyBNZW51U3RhY2suICovXG4gIHByaXZhdGUgcmVhZG9ubHkgX2VsZW1lbnRzOiBNZW51U3RhY2tJdGVtW10gPSBbXTtcblxuICAvKiogRW1pdHMgdGhlIGVsZW1lbnQgd2hpY2ggd2FzIHBvcHBlZCBvZmYgb2YgdGhlIHN0YWNrIHdoZW4gcmVxdWVzdGVkIGJ5IGEgY2xvc2VyLiAqL1xuICBwcml2YXRlIHJlYWRvbmx5IF9jbG9zZSA9IG5ldyBTdWJqZWN0PE1lbnVTdGFja0Nsb3NlRXZlbnQ+KCk7XG5cbiAgLyoqIEVtaXRzIG9uY2UgdGhlIE1lbnVTdGFjayBoYXMgYmVjb21lIGVtcHR5IGFmdGVyIHBvcHBpbmcgb2ZmIGVsZW1lbnRzLiAqL1xuICBwcml2YXRlIHJlYWRvbmx5IF9lbXB0eSA9IG5ldyBTdWJqZWN0PEZvY3VzTmV4dCB8IHVuZGVmaW5lZD4oKTtcblxuICBwcml2YXRlIHJlYWRvbmx5IF9oYXNGb2N1cyA9IG5ldyBTdWJqZWN0PGJvb2xlYW4+KCk7XG5cbiAgLyoqIE9ic2VydmFibGUgd2hpY2ggZW1pdHMgdGhlIE1lbnVTdGFja0l0ZW0gd2hpY2ggaGFzIGJlZW4gcmVxdWVzdGVkIHRvIGNsb3NlLiAqL1xuICByZWFkb25seSBjbG9zZWQ6IE9ic2VydmFibGU8TWVudVN0YWNrQ2xvc2VFdmVudD4gPSB0aGlzLl9jbG9zZTtcblxuICByZWFkb25seSBoYXNGb2N1czogT2JzZXJ2YWJsZTxib29sZWFuPiA9IHRoaXMuX2hhc0ZvY3VzLnBpcGUoXG4gICAgc3RhcnRXaXRoKGZhbHNlKSxcbiAgICBkZWJvdW5jZVRpbWUoMCksXG4gICAgZGlzdGluY3RVbnRpbENoYW5nZWQoKSxcbiAgKTtcblxuICAvKipcbiAgICogT2JzZXJ2YWJsZSB3aGljaCBlbWl0cyB3aGVuIHRoZSBNZW51U3RhY2sgaXMgZW1wdHkgYWZ0ZXIgcG9wcGluZyBvZmYgdGhlIGxhc3QgZWxlbWVudC4gSXRcbiAgICogZW1pdHMgYSBGb2N1c05leHQgZXZlbnQgd2hpY2ggc3BlY2lmaWVzIHRoZSBhY3Rpb24gdGhlIGNsb3NlciBoYXMgcmVxdWVzdGVkIHRoZSBsaXN0ZW5lclxuICAgKiBwZXJmb3JtLlxuICAgKi9cbiAgcmVhZG9ubHkgZW1wdGllZDogT2JzZXJ2YWJsZTxGb2N1c05leHQgfCB1bmRlZmluZWQ+ID0gdGhpcy5fZW1wdHk7XG5cbiAgcHJpdmF0ZSBfaGFzSW5saW5lTWVudSA9IGZhbHNlO1xuXG4gIHN0YXRpYyBpbmxpbmUoKSB7XG4gICAgY29uc3Qgc3RhY2sgPSBuZXcgTWVudVN0YWNrKCk7XG4gICAgc3RhY2suX2hhc0lubGluZU1lbnUgPSB0cnVlO1xuICAgIHJldHVybiBzdGFjaztcbiAgfVxuXG4gIC8qKiBAcGFyYW0gbWVudSB0aGUgTWVudVN0YWNrSXRlbSB0byBwdXQgb24gdGhlIHN0YWNrLiAqL1xuICBwdXNoKG1lbnU6IE1lbnVTdGFja0l0ZW0pIHtcbiAgICB0aGlzLl9lbGVtZW50cy5wdXNoKG1lbnUpO1xuICB9XG5cbiAgLyoqXG4gICAqIFBvcCBpdGVtcyBvZmYgb2YgdGhlIHN0YWNrIHVwIHRvIGFuZCBpbmNsdWRpbmcgYGxhc3RJdGVtYCBhbmQgZW1pdCBlYWNoIG9uIHRoZSBjbG9zZVxuICAgKiBvYnNlcnZhYmxlLiBJZiB0aGUgc3RhY2sgaXMgZW1wdHkgb3IgYGxhc3RJdGVtYCBpcyBub3Qgb24gdGhlIHN0YWNrIGl0IGRvZXMgbm90aGluZy5cbiAgICogQHBhcmFtIGxhc3RJdGVtIHRoZSBsYXN0IGl0ZW0gdG8gcG9wIG9mZiB0aGUgc3RhY2suXG4gICAqIEBwYXJhbSBvcHRpb25zIE9wdGlvbnMgdGhhdCBjb25maWd1cmUgYmVoYXZpb3Igb24gY2xvc2UuXG4gICAqL1xuICBjbG9zZShsYXN0SXRlbTogTWVudVN0YWNrSXRlbSwgb3B0aW9ucz86IENsb3NlT3B0aW9ucykge1xuICAgIGNvbnN0IHtmb2N1c05leHRPbkVtcHR5LCBmb2N1c1BhcmVudFRyaWdnZXJ9ID0gey4uLm9wdGlvbnN9O1xuICAgIGlmICh0aGlzLl9lbGVtZW50cy5pbmRleE9mKGxhc3RJdGVtKSA+PSAwKSB7XG4gICAgICBsZXQgcG9wcGVkRWxlbWVudDogTWVudVN0YWNrSXRlbSB8IHVuZGVmaW5lZDtcbiAgICAgIGRvIHtcbiAgICAgICAgcG9wcGVkRWxlbWVudCA9IHRoaXMuX2VsZW1lbnRzLnBvcCgpO1xuICAgICAgICB0aGlzLl9jbG9zZS5uZXh0KHtpdGVtOiBwb3BwZWRFbGVtZW50LCBmb2N1c1BhcmVudFRyaWdnZXJ9KTtcbiAgICAgIH0gd2hpbGUgKHBvcHBlZEVsZW1lbnQgIT09IGxhc3RJdGVtKTtcblxuICAgICAgaWYgKHRoaXMuaXNFbXB0eSgpKSB7XG4gICAgICAgIHRoaXMuX2VtcHR5Lm5leHQoZm9jdXNOZXh0T25FbXB0eSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFBvcCBpdGVtcyBvZmYgb2YgdGhlIHN0YWNrIHVwIHRvIGJ1dCBleGNsdWRpbmcgYGxhc3RJdGVtYCBhbmQgZW1pdCBlYWNoIG9uIHRoZSBjbG9zZVxuICAgKiBvYnNlcnZhYmxlLiBJZiB0aGUgc3RhY2sgaXMgZW1wdHkgb3IgYGxhc3RJdGVtYCBpcyBub3Qgb24gdGhlIHN0YWNrIGl0IGRvZXMgbm90aGluZy5cbiAgICogQHBhcmFtIGxhc3RJdGVtIHRoZSBlbGVtZW50IHdoaWNoIHNob3VsZCBiZSBsZWZ0IG9uIHRoZSBzdGFja1xuICAgKiBAcmV0dXJuIHdoZXRoZXIgb3Igbm90IGFuIGl0ZW0gd2FzIHJlbW92ZWQgZnJvbSB0aGUgc3RhY2tcbiAgICovXG4gIGNsb3NlU3ViTWVudU9mKGxhc3RJdGVtOiBNZW51U3RhY2tJdGVtKSB7XG4gICAgbGV0IHJlbW92ZWQgPSBmYWxzZTtcbiAgICBpZiAodGhpcy5fZWxlbWVudHMuaW5kZXhPZihsYXN0SXRlbSkgPj0gMCkge1xuICAgICAgcmVtb3ZlZCA9IHRoaXMucGVlaygpICE9PSBsYXN0SXRlbTtcbiAgICAgIHdoaWxlICh0aGlzLnBlZWsoKSAhPT0gbGFzdEl0ZW0pIHtcbiAgICAgICAgdGhpcy5fY2xvc2UubmV4dCh7aXRlbTogdGhpcy5fZWxlbWVudHMucG9wKCl9KTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlbW92ZWQ7XG4gIH1cblxuICAvKipcbiAgICogUG9wIG9mZiBhbGwgTWVudVN0YWNrSXRlbXMgYW5kIGVtaXQgZWFjaCBvbmUgb24gdGhlIGBjbG9zZWAgb2JzZXJ2YWJsZSBvbmUgYnkgb25lLlxuICAgKiBAcGFyYW0gb3B0aW9ucyBPcHRpb25zIHRoYXQgY29uZmlndXJlIGJlaGF2aW9yIG9uIGNsb3NlLlxuICAgKi9cbiAgY2xvc2VBbGwob3B0aW9ucz86IENsb3NlT3B0aW9ucykge1xuICAgIGNvbnN0IHtmb2N1c05leHRPbkVtcHR5LCBmb2N1c1BhcmVudFRyaWdnZXJ9ID0gey4uLm9wdGlvbnN9O1xuICAgIGlmICghdGhpcy5pc0VtcHR5KCkpIHtcbiAgICAgIHdoaWxlICghdGhpcy5pc0VtcHR5KCkpIHtcbiAgICAgICAgY29uc3QgbWVudVN0YWNrSXRlbSA9IHRoaXMuX2VsZW1lbnRzLnBvcCgpO1xuICAgICAgICBpZiAobWVudVN0YWNrSXRlbSkge1xuICAgICAgICAgIHRoaXMuX2Nsb3NlLm5leHQoe2l0ZW06IG1lbnVTdGFja0l0ZW0sIGZvY3VzUGFyZW50VHJpZ2dlcn0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aGlzLl9lbXB0eS5uZXh0KGZvY3VzTmV4dE9uRW1wdHkpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBSZXR1cm4gdHJ1ZSBpZiB0aGlzIHN0YWNrIGlzIGVtcHR5LiAqL1xuICBpc0VtcHR5KCkge1xuICAgIHJldHVybiAhdGhpcy5fZWxlbWVudHMubGVuZ3RoO1xuICB9XG5cbiAgLyoqIFJldHVybiB0aGUgbGVuZ3RoIG9mIHRoZSBzdGFjay4gKi9cbiAgbGVuZ3RoKCkge1xuICAgIHJldHVybiB0aGlzLl9lbGVtZW50cy5sZW5ndGg7XG4gIH1cblxuICAvKiogR2V0IHRoZSB0b3AgbW9zdCBlbGVtZW50IG9uIHRoZSBzdGFjay4gKi9cbiAgcGVlaygpOiBNZW51U3RhY2tJdGVtIHwgdW5kZWZpbmVkIHtcbiAgICByZXR1cm4gdGhpcy5fZWxlbWVudHNbdGhpcy5fZWxlbWVudHMubGVuZ3RoIC0gMV07XG4gIH1cblxuICAvKiogV2hldGhlciB0aGUgbWVudSBzdGFjayBpcyBhc3NvY2lhdGVkIHdpdGggYW4gaW5saW5lIG1lbnUuICovXG4gIGhhc0lubGluZU1lbnUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2hhc0lubGluZU1lbnU7XG4gIH1cblxuICAvKiogU2V0cyB3aGV0aGVyIHRoZSBtZW51IHN0YWNrIGNvbnRhaW5zIHRoZSBmb2N1c2VkIGVsZW1lbnQuICovXG4gIHNldEhhc0ZvY3VzKGhhc0ZvY3VzOiBib29sZWFuKSB7XG4gICAgdGhpcy5faGFzRm9jdXMubmV4dChoYXNGb2N1cyk7XG4gIH1cbn1cbiJdfQ==