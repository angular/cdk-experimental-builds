/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Inject, Injectable, InjectionToken, Optional, SkipSelf } from '@angular/core';
import { Subject } from 'rxjs';
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
        /** Observable which emits the MenuStackItem which has been requested to close. */
        this.closed = this._close;
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
     * @param focusNext the event to emit on the `empty` observable if the method call resulted in an
     * empty stack. Does not emit if the stack was initially empty or if `lastItem` was not on the
     * stack.
     */
    close(lastItem, focusNext) {
        if (this._elements.indexOf(lastItem) >= 0) {
            let poppedElement;
            do {
                poppedElement = this._elements.pop();
                this._close.next(poppedElement);
            } while (poppedElement !== lastItem);
            if (this.isEmpty()) {
                this._empty.next(focusNext);
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
                this._close.next(this._elements.pop());
            }
        }
        return removed;
    }
    /**
     * Pop off all MenuStackItems and emit each one on the `close` observable one by one.
     * @param focusNext the event to emit on the `empty` observable once the stack is emptied. Does
     * not emit if the stack was initially empty.
     */
    closeAll(focusNext) {
        if (!this.isEmpty()) {
            while (!this.isEmpty()) {
                const menuStackItem = this._elements.pop();
                if (menuStackItem) {
                    this._close.next(menuStackItem);
                }
            }
            this._empty.next(focusNext);
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
    hasInlineMenu() {
        return this._hasInlineMenu;
    }
}
MenuStack.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.0.0-next.9", ngImport: i0, type: MenuStack, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
MenuStack.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "14.0.0-next.9", ngImport: i0, type: MenuStack });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.0.0-next.9", ngImport: i0, type: MenuStack, decorators: [{
            type: Injectable
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL21lbnUvbWVudS1zdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsTUFBTSxFQUFFLFVBQVUsRUFBRSxjQUFjLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUNyRixPQUFPLEVBQWEsT0FBTyxFQUFDLE1BQU0sTUFBTSxDQUFDOztBQWlCekMsK0RBQStEO0FBQy9ELE1BQU0sQ0FBQyxNQUFNLFVBQVUsR0FBRyxJQUFJLGNBQWMsQ0FBWSxnQkFBZ0IsQ0FBQyxDQUFDO0FBRTFFLHFHQUFxRztBQUNyRyxNQUFNLENBQUMsTUFBTSxpQ0FBaUMsR0FBRztJQUMvQyxPQUFPLEVBQUUsVUFBVTtJQUNuQixJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksUUFBUSxFQUFFLEVBQUUsSUFBSSxRQUFRLEVBQUUsRUFBRSxJQUFJLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO0lBQ2hFLFVBQVUsRUFBRSxDQUFDLGVBQTJCLEVBQUUsRUFBRSxDQUFDLGVBQWUsSUFBSSxJQUFJLFNBQVMsRUFBRTtDQUNoRixDQUFDO0FBRUYscUdBQXFHO0FBQ3JHLE1BQU0sQ0FBQyxNQUFNLHdDQUF3QyxHQUFHO0lBQ3RELE9BQU8sRUFBRSxVQUFVO0lBQ25CLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxRQUFRLEVBQUUsRUFBRSxJQUFJLFFBQVEsRUFBRSxFQUFFLElBQUksTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7SUFDaEUsVUFBVSxFQUFFLENBQUMsZUFBMkIsRUFBRSxFQUFFLENBQUMsZUFBZSxJQUFJLFNBQVMsQ0FBQyxNQUFNLEVBQUU7Q0FDbkYsQ0FBQztBQUVGOzs7OztHQUtHO0FBRUgsTUFBTSxPQUFPLFNBQVM7SUFEdEI7UUFF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QUMsQ0FBQztJQUNuRCxDQUFDO0lBRUQsYUFBYTtRQUNYLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQztJQUM3QixDQUFDOzs2R0EzR1UsU0FBUztpSEFBVCxTQUFTO2tHQUFULFNBQVM7a0JBRHJCLFVBQVUiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtJbmplY3QsIEluamVjdGFibGUsIEluamVjdGlvblRva2VuLCBPcHRpb25hbCwgU2tpcFNlbGZ9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtPYnNlcnZhYmxlLCBTdWJqZWN0fSBmcm9tICdyeGpzJztcblxuLyoqIEV2ZW50cyB0byBlbWl0IGFzIHNwZWNpZmllZCBieSB0aGUgY2FsbGVyIG9uY2UgdGhlIE1lbnVTdGFjayBpcyBlbXB0eS4gKi9cbmV4cG9ydCBjb25zdCBlbnVtIEZvY3VzTmV4dCB7XG4gIG5leHRJdGVtLFxuICBwcmV2aW91c0l0ZW0sXG4gIGN1cnJlbnRJdGVtLFxufVxuXG4vKipcbiAqIEludGVyZmFjZSBmb3IgdGhlIGVsZW1lbnRzIHRyYWNrZWQgaW4gdGhlIE1lbnVTdGFjay5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBNZW51U3RhY2tJdGVtIHtcbiAgLyoqIEEgcmVmZXJlbmNlIHRvIHRoZSBwcmV2aW91cyBNZW51cyBNZW51U3RhY2sgaW5zdGFuY2UuICovXG4gIG1lbnVTdGFjaz86IE1lbnVTdGFjaztcbn1cblxuLyoqIEluamVjdGlvbiB0b2tlbiB1c2VkIGZvciBhbiBpbXBsZW1lbnRhdGlvbiBvZiBNZW51U3RhY2suICovXG5leHBvcnQgY29uc3QgTUVOVV9TVEFDSyA9IG5ldyBJbmplY3Rpb25Ub2tlbjxNZW51U3RhY2s+KCdjZGstbWVudS1zdGFjaycpO1xuXG4vKiogQSBwcm92aWRlciB0aGF0IHByb3ZpZGVzIHRoZSBwYXJlbnQgbWVudSBzdGFjaywgb3IgYSBuZXcgbWVudSBzdGFjayBpZiB0aGVyZSBpcyBubyBwYXJlbnQgb25lLiAqL1xuZXhwb3J0IGNvbnN0IFBBUkVOVF9PUl9ORVdfTUVOVV9TVEFDS19QUk9WSURFUiA9IHtcbiAgcHJvdmlkZTogTUVOVV9TVEFDSyxcbiAgZGVwczogW1tuZXcgT3B0aW9uYWwoKSwgbmV3IFNraXBTZWxmKCksIG5ldyBJbmplY3QoTUVOVV9TVEFDSyldXSxcbiAgdXNlRmFjdG9yeTogKHBhcmVudE1lbnVTdGFjaz86IE1lbnVTdGFjaykgPT4gcGFyZW50TWVudVN0YWNrIHx8IG5ldyBNZW51U3RhY2soKSxcbn07XG5cbi8qKiBBIHByb3ZpZGVyIHRoYXQgcHJvdmlkZXMgdGhlIHBhcmVudCBtZW51IHN0YWNrLCBvciBhIG5ldyBtZW51IHN0YWNrIGlmIHRoZXJlIGlzIG5vIHBhcmVudCBvbmUuICovXG5leHBvcnQgY29uc3QgUEFSRU5UX09SX05FV19JTkxJTkVfTUVOVV9TVEFDS19QUk9WSURFUiA9IHtcbiAgcHJvdmlkZTogTUVOVV9TVEFDSyxcbiAgZGVwczogW1tuZXcgT3B0aW9uYWwoKSwgbmV3IFNraXBTZWxmKCksIG5ldyBJbmplY3QoTUVOVV9TVEFDSyldXSxcbiAgdXNlRmFjdG9yeTogKHBhcmVudE1lbnVTdGFjaz86IE1lbnVTdGFjaykgPT4gcGFyZW50TWVudVN0YWNrIHx8IE1lbnVTdGFjay5pbmxpbmUoKSxcbn07XG5cbi8qKlxuICogTWVudVN0YWNrIGFsbG93cyBzdWJzY3JpYmVycyB0byBsaXN0ZW4gZm9yIGNsb3NlIGV2ZW50cyAod2hlbiBhIE1lbnVTdGFja0l0ZW0gaXMgcG9wcGVkIG9mZlxuICogb2YgdGhlIHN0YWNrKSBpbiBvcmRlciB0byBwZXJmb3JtIGNsb3NpbmcgYWN0aW9ucy4gVXBvbiB0aGUgTWVudVN0YWNrIGJlaW5nIGVtcHR5IGl0IGVtaXRzXG4gKiBmcm9tIHRoZSBgZW1wdHlgIG9ic2VydmFibGUgc3BlY2lmeWluZyB0aGUgbmV4dCBmb2N1cyBhY3Rpb24gd2hpY2ggdGhlIGxpc3RlbmVyIHNob3VsZCBwZXJmb3JtXG4gKiBhcyByZXF1ZXN0ZWQgYnkgdGhlIGNsb3Nlci5cbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIE1lbnVTdGFjayB7XG4gIC8qKiBBbGwgTWVudVN0YWNrSXRlbXMgdHJhY2tlZCBieSB0aGlzIE1lbnVTdGFjay4gKi9cbiAgcHJpdmF0ZSByZWFkb25seSBfZWxlbWVudHM6IE1lbnVTdGFja0l0ZW1bXSA9IFtdO1xuXG4gIC8qKiBFbWl0cyB0aGUgZWxlbWVudCB3aGljaCB3YXMgcG9wcGVkIG9mZiBvZiB0aGUgc3RhY2sgd2hlbiByZXF1ZXN0ZWQgYnkgYSBjbG9zZXIuICovXG4gIHByaXZhdGUgcmVhZG9ubHkgX2Nsb3NlOiBTdWJqZWN0PE1lbnVTdGFja0l0ZW0gfCB1bmRlZmluZWQ+ID0gbmV3IFN1YmplY3QoKTtcblxuICAvKiogRW1pdHMgb25jZSB0aGUgTWVudVN0YWNrIGhhcyBiZWNvbWUgZW1wdHkgYWZ0ZXIgcG9wcGluZyBvZmYgZWxlbWVudHMuICovXG4gIHByaXZhdGUgcmVhZG9ubHkgX2VtcHR5OiBTdWJqZWN0PEZvY3VzTmV4dCB8IHVuZGVmaW5lZD4gPSBuZXcgU3ViamVjdCgpO1xuXG4gIC8qKiBPYnNlcnZhYmxlIHdoaWNoIGVtaXRzIHRoZSBNZW51U3RhY2tJdGVtIHdoaWNoIGhhcyBiZWVuIHJlcXVlc3RlZCB0byBjbG9zZS4gKi9cbiAgcmVhZG9ubHkgY2xvc2VkOiBPYnNlcnZhYmxlPE1lbnVTdGFja0l0ZW0gfCB1bmRlZmluZWQ+ID0gdGhpcy5fY2xvc2U7XG5cbiAgLyoqXG4gICAqIE9ic2VydmFibGUgd2hpY2ggZW1pdHMgd2hlbiB0aGUgTWVudVN0YWNrIGlzIGVtcHR5IGFmdGVyIHBvcHBpbmcgb2ZmIHRoZSBsYXN0IGVsZW1lbnQuIEl0XG4gICAqIGVtaXRzIGEgRm9jdXNOZXh0IGV2ZW50IHdoaWNoIHNwZWNpZmllcyB0aGUgYWN0aW9uIHRoZSBjbG9zZXIgaGFzIHJlcXVlc3RlZCB0aGUgbGlzdGVuZXJcbiAgICogcGVyZm9ybS5cbiAgICovXG4gIHJlYWRvbmx5IGVtcHRpZWQ6IE9ic2VydmFibGU8Rm9jdXNOZXh0IHwgdW5kZWZpbmVkPiA9IHRoaXMuX2VtcHR5O1xuXG4gIHByaXZhdGUgX2hhc0lubGluZU1lbnUgPSBmYWxzZTtcblxuICBzdGF0aWMgaW5saW5lKCkge1xuICAgIGNvbnN0IHN0YWNrID0gbmV3IE1lbnVTdGFjaygpO1xuICAgIHN0YWNrLl9oYXNJbmxpbmVNZW51ID0gdHJ1ZTtcbiAgICByZXR1cm4gc3RhY2s7XG4gIH1cblxuICAvKiogQHBhcmFtIG1lbnUgdGhlIE1lbnVTdGFja0l0ZW0gdG8gcHV0IG9uIHRoZSBzdGFjay4gKi9cbiAgcHVzaChtZW51OiBNZW51U3RhY2tJdGVtKSB7XG4gICAgdGhpcy5fZWxlbWVudHMucHVzaChtZW51KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQb3AgaXRlbXMgb2ZmIG9mIHRoZSBzdGFjayB1cCB0byBhbmQgaW5jbHVkaW5nIGBsYXN0SXRlbWAgYW5kIGVtaXQgZWFjaCBvbiB0aGUgY2xvc2VcbiAgICogb2JzZXJ2YWJsZS4gSWYgdGhlIHN0YWNrIGlzIGVtcHR5IG9yIGBsYXN0SXRlbWAgaXMgbm90IG9uIHRoZSBzdGFjayBpdCBkb2VzIG5vdGhpbmcuXG4gICAqIEBwYXJhbSBsYXN0SXRlbSB0aGUgbGFzdCBpdGVtIHRvIHBvcCBvZmYgdGhlIHN0YWNrLlxuICAgKiBAcGFyYW0gZm9jdXNOZXh0IHRoZSBldmVudCB0byBlbWl0IG9uIHRoZSBgZW1wdHlgIG9ic2VydmFibGUgaWYgdGhlIG1ldGhvZCBjYWxsIHJlc3VsdGVkIGluIGFuXG4gICAqIGVtcHR5IHN0YWNrLiBEb2VzIG5vdCBlbWl0IGlmIHRoZSBzdGFjayB3YXMgaW5pdGlhbGx5IGVtcHR5IG9yIGlmIGBsYXN0SXRlbWAgd2FzIG5vdCBvbiB0aGVcbiAgICogc3RhY2suXG4gICAqL1xuICBjbG9zZShsYXN0SXRlbTogTWVudVN0YWNrSXRlbSwgZm9jdXNOZXh0PzogRm9jdXNOZXh0KSB7XG4gICAgaWYgKHRoaXMuX2VsZW1lbnRzLmluZGV4T2YobGFzdEl0ZW0pID49IDApIHtcbiAgICAgIGxldCBwb3BwZWRFbGVtZW50OiBNZW51U3RhY2tJdGVtIHwgdW5kZWZpbmVkO1xuICAgICAgZG8ge1xuICAgICAgICBwb3BwZWRFbGVtZW50ID0gdGhpcy5fZWxlbWVudHMucG9wKCk7XG4gICAgICAgIHRoaXMuX2Nsb3NlLm5leHQocG9wcGVkRWxlbWVudCk7XG4gICAgICB9IHdoaWxlIChwb3BwZWRFbGVtZW50ICE9PSBsYXN0SXRlbSk7XG5cbiAgICAgIGlmICh0aGlzLmlzRW1wdHkoKSkge1xuICAgICAgICB0aGlzLl9lbXB0eS5uZXh0KGZvY3VzTmV4dCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFBvcCBpdGVtcyBvZmYgb2YgdGhlIHN0YWNrIHVwIHRvIGJ1dCBleGNsdWRpbmcgYGxhc3RJdGVtYCBhbmQgZW1pdCBlYWNoIG9uIHRoZSBjbG9zZVxuICAgKiBvYnNlcnZhYmxlLiBJZiB0aGUgc3RhY2sgaXMgZW1wdHkgb3IgYGxhc3RJdGVtYCBpcyBub3Qgb24gdGhlIHN0YWNrIGl0IGRvZXMgbm90aGluZy5cbiAgICogQHBhcmFtIGxhc3RJdGVtIHRoZSBlbGVtZW50IHdoaWNoIHNob3VsZCBiZSBsZWZ0IG9uIHRoZSBzdGFja1xuICAgKiBAcmV0dXJuIHdoZXRoZXIgb3Igbm90IGFuIGl0ZW0gd2FzIHJlbW92ZWQgZnJvbSB0aGUgc3RhY2tcbiAgICovXG4gIGNsb3NlU3ViTWVudU9mKGxhc3RJdGVtOiBNZW51U3RhY2tJdGVtKSB7XG4gICAgbGV0IHJlbW92ZWQgPSBmYWxzZTtcbiAgICBpZiAodGhpcy5fZWxlbWVudHMuaW5kZXhPZihsYXN0SXRlbSkgPj0gMCkge1xuICAgICAgcmVtb3ZlZCA9IHRoaXMucGVlaygpICE9PSBsYXN0SXRlbTtcbiAgICAgIHdoaWxlICh0aGlzLnBlZWsoKSAhPT0gbGFzdEl0ZW0pIHtcbiAgICAgICAgdGhpcy5fY2xvc2UubmV4dCh0aGlzLl9lbGVtZW50cy5wb3AoKSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZW1vdmVkO1xuICB9XG5cbiAgLyoqXG4gICAqIFBvcCBvZmYgYWxsIE1lbnVTdGFja0l0ZW1zIGFuZCBlbWl0IGVhY2ggb25lIG9uIHRoZSBgY2xvc2VgIG9ic2VydmFibGUgb25lIGJ5IG9uZS5cbiAgICogQHBhcmFtIGZvY3VzTmV4dCB0aGUgZXZlbnQgdG8gZW1pdCBvbiB0aGUgYGVtcHR5YCBvYnNlcnZhYmxlIG9uY2UgdGhlIHN0YWNrIGlzIGVtcHRpZWQuIERvZXNcbiAgICogbm90IGVtaXQgaWYgdGhlIHN0YWNrIHdhcyBpbml0aWFsbHkgZW1wdHkuXG4gICAqL1xuICBjbG9zZUFsbChmb2N1c05leHQ/OiBGb2N1c05leHQpIHtcbiAgICBpZiAoIXRoaXMuaXNFbXB0eSgpKSB7XG4gICAgICB3aGlsZSAoIXRoaXMuaXNFbXB0eSgpKSB7XG4gICAgICAgIGNvbnN0IG1lbnVTdGFja0l0ZW0gPSB0aGlzLl9lbGVtZW50cy5wb3AoKTtcbiAgICAgICAgaWYgKG1lbnVTdGFja0l0ZW0pIHtcbiAgICAgICAgICB0aGlzLl9jbG9zZS5uZXh0KG1lbnVTdGFja0l0ZW0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX2VtcHR5Lm5leHQoZm9jdXNOZXh0KTtcbiAgICB9XG4gIH1cblxuICAvKiogUmV0dXJuIHRydWUgaWYgdGhpcyBzdGFjayBpcyBlbXB0eS4gKi9cbiAgaXNFbXB0eSgpIHtcbiAgICByZXR1cm4gIXRoaXMuX2VsZW1lbnRzLmxlbmd0aDtcbiAgfVxuXG4gIC8qKiBSZXR1cm4gdGhlIGxlbmd0aCBvZiB0aGUgc3RhY2suICovXG4gIGxlbmd0aCgpIHtcbiAgICByZXR1cm4gdGhpcy5fZWxlbWVudHMubGVuZ3RoO1xuICB9XG5cbiAgLyoqIEdldCB0aGUgdG9wIG1vc3QgZWxlbWVudCBvbiB0aGUgc3RhY2suICovXG4gIHBlZWsoKTogTWVudVN0YWNrSXRlbSB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIHRoaXMuX2VsZW1lbnRzW3RoaXMuX2VsZW1lbnRzLmxlbmd0aCAtIDFdO1xuICB9XG5cbiAgaGFzSW5saW5lTWVudSgpIHtcbiAgICByZXR1cm4gdGhpcy5faGFzSW5saW5lTWVudTtcbiAgfVxufVxuIl19