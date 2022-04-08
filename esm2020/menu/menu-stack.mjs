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
/** Provider that provides the parent menu stack, or a new menu stack if there is no parent one. */
export const PARENT_OR_NEW_MENU_STACK_PROVIDER = {
    provide: MENU_STACK,
    deps: [[new Optional(), new SkipSelf(), new Inject(MENU_STACK)]],
    useFactory: (parentMenuStack) => parentMenuStack || new MenuStack(),
};
/** Provider that provides the parent menu stack, or a new inline menu stack if there is no parent one. */
export const PARENT_OR_NEW_INLINE_MENU_STACK_PROVIDER = (orientation) => ({
    provide: MENU_STACK,
    deps: [[new Optional(), new SkipSelf(), new Inject(MENU_STACK)]],
    useFactory: (parentMenuStack) => parentMenuStack || MenuStack.inline(orientation),
});
/** The next available menu stack ID. */
let nextId = 0;
/**
 * MenuStack allows subscribers to listen for close events (when a MenuStackItem is popped off
 * of the stack) in order to perform closing actions. Upon the MenuStack being empty it emits
 * from the `empty` observable specifying the next focus action which the listener should perform
 * as requested by the closer.
 */
export class MenuStack {
    constructor() {
        /** The ID of this menu stack. */
        this.id = `${nextId++}`;
        /** All MenuStackItems tracked by this MenuStack. */
        this._elements = [];
        /** Emits the element which was popped off of the stack when requested by a closer. */
        this._close = new Subject();
        /** Emits once the MenuStack has become empty after popping off elements. */
        this._empty = new Subject();
        /** Emits whether any menu in the menu stack has focus. */
        this._hasFocus = new Subject();
        /** Observable which emits the MenuStackItem which has been requested to close. */
        this.closed = this._close;
        /** Observable which emits whether any menu in the menu stack has focus. */
        this.hasFocus = this._hasFocus.pipe(startWith(false), debounceTime(0), distinctUntilChanged());
        /**
         * Observable which emits when the MenuStack is empty after popping off the last element. It
         * emits a FocusNext event which specifies the action the closer has requested the listener
         * perform.
         */
        this.emptied = this._empty;
        /**
         * Whether the inline menu associated with this menu stack is vertical or horizontal.
         * `null` indicates there is no inline menu associated with this menu stack.
         */
        this._inlineMenuOrientation = null;
    }
    /** Creates a menu stack that originates from an inline menu. */
    static inline(orientation) {
        const stack = new MenuStack();
        stack._inlineMenuOrientation = orientation;
        return stack;
    }
    /**
     * Adds an item to the menu stack.
     * @param menu the MenuStackItem to put on the stack.
     */
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
        return this._inlineMenuOrientation != null;
    }
    /** The orientation of the associated inline menu. */
    inlineMenuOrientation() {
        return this._inlineMenuOrientation;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL21lbnUvbWVudS1zdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsTUFBTSxFQUFFLFVBQVUsRUFBRSxjQUFjLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUNyRixPQUFPLEVBQWEsT0FBTyxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQ3pDLE9BQU8sRUFBQyxZQUFZLEVBQUUsb0JBQW9CLEVBQUUsU0FBUyxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7O0FBZTdFLCtEQUErRDtBQUMvRCxNQUFNLENBQUMsTUFBTSxVQUFVLEdBQUcsSUFBSSxjQUFjLENBQVksZ0JBQWdCLENBQUMsQ0FBQztBQUUxRSxtR0FBbUc7QUFDbkcsTUFBTSxDQUFDLE1BQU0saUNBQWlDLEdBQUc7SUFDL0MsT0FBTyxFQUFFLFVBQVU7SUFDbkIsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJLFFBQVEsRUFBRSxFQUFFLElBQUksUUFBUSxFQUFFLEVBQUUsSUFBSSxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztJQUNoRSxVQUFVLEVBQUUsQ0FBQyxlQUEyQixFQUFFLEVBQUUsQ0FBQyxlQUFlLElBQUksSUFBSSxTQUFTLEVBQUU7Q0FDaEYsQ0FBQztBQUVGLDBHQUEwRztBQUMxRyxNQUFNLENBQUMsTUFBTSx3Q0FBd0MsR0FBRyxDQUN0RCxXQUFzQyxFQUN0QyxFQUFFLENBQUMsQ0FBQztJQUNKLE9BQU8sRUFBRSxVQUFVO0lBQ25CLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxRQUFRLEVBQUUsRUFBRSxJQUFJLFFBQVEsRUFBRSxFQUFFLElBQUksTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7SUFDaEUsVUFBVSxFQUFFLENBQUMsZUFBMkIsRUFB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Q0FBQztJQUNoQyxDQUFDOzs2R0F6SVUsU0FBUztpSEFBVCxTQUFTO2tHQUFULFNBQVM7a0JBRHJCLFVBQVUiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtJbmplY3QsIEluamVjdGFibGUsIEluamVjdGlvblRva2VuLCBPcHRpb25hbCwgU2tpcFNlbGZ9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtPYnNlcnZhYmxlLCBTdWJqZWN0fSBmcm9tICdyeGpzJztcbmltcG9ydCB7ZGVib3VuY2VUaW1lLCBkaXN0aW5jdFVudGlsQ2hhbmdlZCwgc3RhcnRXaXRofSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbi8qKiBUaGUgcmVsYXRpdmUgaXRlbSBpbiB0aGUgaW5saW5lIG1lbnUgdG8gZm9jdXMgYWZ0ZXIgY2xvc2luZyBhbGwgcG9wdXAgbWVudXMuICovXG5leHBvcnQgY29uc3QgZW51bSBGb2N1c05leHQge1xuICBuZXh0SXRlbSxcbiAgcHJldmlvdXNJdGVtLFxuICBjdXJyZW50SXRlbSxcbn1cblxuLyoqIEEgc2luZ2xlIGl0ZW0gKG1lbnUpIGluIHRoZSBtZW51IHN0YWNrLiAqL1xuZXhwb3J0IGludGVyZmFjZSBNZW51U3RhY2tJdGVtIHtcbiAgLyoqIEEgcmVmZXJlbmNlIHRvIHRoZSBtZW51IHN0YWNrIHRoaXMgbWVudSBzdGFjayBpdGVtIGJlbG9uZ3MgdG8uICovXG4gIG1lbnVTdGFjaz86IE1lbnVTdGFjaztcbn1cblxuLyoqIEluamVjdGlvbiB0b2tlbiB1c2VkIGZvciBhbiBpbXBsZW1lbnRhdGlvbiBvZiBNZW51U3RhY2suICovXG5leHBvcnQgY29uc3QgTUVOVV9TVEFDSyA9IG5ldyBJbmplY3Rpb25Ub2tlbjxNZW51U3RhY2s+KCdjZGstbWVudS1zdGFjaycpO1xuXG4vKiogUHJvdmlkZXIgdGhhdCBwcm92aWRlcyB0aGUgcGFyZW50IG1lbnUgc3RhY2ssIG9yIGEgbmV3IG1lbnUgc3RhY2sgaWYgdGhlcmUgaXMgbm8gcGFyZW50IG9uZS4gKi9cbmV4cG9ydCBjb25zdCBQQVJFTlRfT1JfTkVXX01FTlVfU1RBQ0tfUFJPVklERVIgPSB7XG4gIHByb3ZpZGU6IE1FTlVfU1RBQ0ssXG4gIGRlcHM6IFtbbmV3IE9wdGlvbmFsKCksIG5ldyBTa2lwU2VsZigpLCBuZXcgSW5qZWN0KE1FTlVfU1RBQ0spXV0sXG4gIHVzZUZhY3Rvcnk6IChwYXJlbnRNZW51U3RhY2s/OiBNZW51U3RhY2spID0+IHBhcmVudE1lbnVTdGFjayB8fCBuZXcgTWVudVN0YWNrKCksXG59O1xuXG4vKiogUHJvdmlkZXIgdGhhdCBwcm92aWRlcyB0aGUgcGFyZW50IG1lbnUgc3RhY2ssIG9yIGEgbmV3IGlubGluZSBtZW51IHN0YWNrIGlmIHRoZXJlIGlzIG5vIHBhcmVudCBvbmUuICovXG5leHBvcnQgY29uc3QgUEFSRU5UX09SX05FV19JTkxJTkVfTUVOVV9TVEFDS19QUk9WSURFUiA9IChcbiAgb3JpZW50YXRpb246ICd2ZXJ0aWNhbCcgfCAnaG9yaXpvbnRhbCcsXG4pID0+ICh7XG4gIHByb3ZpZGU6IE1FTlVfU1RBQ0ssXG4gIGRlcHM6IFtbbmV3IE9wdGlvbmFsKCksIG5ldyBTa2lwU2VsZigpLCBuZXcgSW5qZWN0KE1FTlVfU1RBQ0spXV0sXG4gIHVzZUZhY3Rvcnk6IChwYXJlbnRNZW51U3RhY2s/OiBNZW51U3RhY2spID0+IHBhcmVudE1lbnVTdGFjayB8fCBNZW51U3RhY2suaW5saW5lKG9yaWVudGF0aW9uKSxcbn0pO1xuXG4vKiogT3B0aW9ucyB0aGF0IGNhbiBiZSBwcm92aWRlZCB0byB0aGUgY2xvc2Ugb3IgY2xvc2VBbGwgbWV0aG9kcy4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ2xvc2VPcHRpb25zIHtcbiAgLyoqIFRoZSBlbGVtZW50IHRvIGZvY3VzIG5leHQgaWYgdGhlIGNsb3NlIG9wZXJhdGlvbiBjYXVzZXMgdGhlIG1lbnUgc3RhY2sgdG8gYmVjb21lIGVtcHR5LiAqL1xuICBmb2N1c05leHRPbkVtcHR5PzogRm9jdXNOZXh0O1xuICAvKiogV2hldGhlciB0byBmb2N1cyB0aGUgcGFyZW50IHRyaWdnZXIgYWZ0ZXIgY2xvc2luZyB0aGUgbWVudS4gKi9cbiAgZm9jdXNQYXJlbnRUcmlnZ2VyPzogYm9vbGVhbjtcbn1cblxuLyoqIEV2ZW50IGRpc3BhdGNoZWQgd2hlbiBhIG1lbnUgaXMgY2xvc2VkLiAqL1xuZXhwb3J0IGludGVyZmFjZSBNZW51U3RhY2tDbG9zZUV2ZW50IHtcbiAgLyoqIFRoZSBtZW51IGJlaW5nIGNsb3NlZC4gKi9cbiAgaXRlbTogTWVudVN0YWNrSXRlbTtcbiAgLyoqIFdoZXRoZXIgdG8gZm9jdXMgdGhlIHBhcmVudCB0cmlnZ2VyIGFmdGVyIGNsb3NpbmcgdGhlIG1lbnUuICovXG4gIGZvY3VzUGFyZW50VHJpZ2dlcj86IGJvb2xlYW47XG59XG5cbi8qKiBUaGUgbmV4dCBhdmFpbGFibGUgbWVudSBzdGFjayBJRC4gKi9cbmxldCBuZXh0SWQgPSAwO1xuXG4vKipcbiAqIE1lbnVTdGFjayBhbGxvd3Mgc3Vic2NyaWJlcnMgdG8gbGlzdGVuIGZvciBjbG9zZSBldmVudHMgKHdoZW4gYSBNZW51U3RhY2tJdGVtIGlzIHBvcHBlZCBvZmZcbiAqIG9mIHRoZSBzdGFjaykgaW4gb3JkZXIgdG8gcGVyZm9ybSBjbG9zaW5nIGFjdGlvbnMuIFVwb24gdGhlIE1lbnVTdGFjayBiZWluZyBlbXB0eSBpdCBlbWl0c1xuICogZnJvbSB0aGUgYGVtcHR5YCBvYnNlcnZhYmxlIHNwZWNpZnlpbmcgdGhlIG5leHQgZm9jdXMgYWN0aW9uIHdoaWNoIHRoZSBsaXN0ZW5lciBzaG91bGQgcGVyZm9ybVxuICogYXMgcmVxdWVzdGVkIGJ5IHRoZSBjbG9zZXIuXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBNZW51U3RhY2sge1xuICAvKiogVGhlIElEIG9mIHRoaXMgbWVudSBzdGFjay4gKi9cbiAgcmVhZG9ubHkgaWQgPSBgJHtuZXh0SWQrK31gO1xuXG4gIC8qKiBBbGwgTWVudVN0YWNrSXRlbXMgdHJhY2tlZCBieSB0aGlzIE1lbnVTdGFjay4gKi9cbiAgcHJpdmF0ZSByZWFkb25seSBfZWxlbWVudHM6IE1lbnVTdGFja0l0ZW1bXSA9IFtdO1xuXG4gIC8qKiBFbWl0cyB0aGUgZWxlbWVudCB3aGljaCB3YXMgcG9wcGVkIG9mZiBvZiB0aGUgc3RhY2sgd2hlbiByZXF1ZXN0ZWQgYnkgYSBjbG9zZXIuICovXG4gIHByaXZhdGUgcmVhZG9ubHkgX2Nsb3NlID0gbmV3IFN1YmplY3Q8TWVudVN0YWNrQ2xvc2VFdmVudD4oKTtcblxuICAvKiogRW1pdHMgb25jZSB0aGUgTWVudVN0YWNrIGhhcyBiZWNvbWUgZW1wdHkgYWZ0ZXIgcG9wcGluZyBvZmYgZWxlbWVudHMuICovXG4gIHByaXZhdGUgcmVhZG9ubHkgX2VtcHR5ID0gbmV3IFN1YmplY3Q8Rm9jdXNOZXh0IHwgdW5kZWZpbmVkPigpO1xuXG4gIC8qKiBFbWl0cyB3aGV0aGVyIGFueSBtZW51IGluIHRoZSBtZW51IHN0YWNrIGhhcyBmb2N1cy4gKi9cbiAgcHJpdmF0ZSByZWFkb25seSBfaGFzRm9jdXMgPSBuZXcgU3ViamVjdDxib29sZWFuPigpO1xuXG4gIC8qKiBPYnNlcnZhYmxlIHdoaWNoIGVtaXRzIHRoZSBNZW51U3RhY2tJdGVtIHdoaWNoIGhhcyBiZWVuIHJlcXVlc3RlZCB0byBjbG9zZS4gKi9cbiAgcmVhZG9ubHkgY2xvc2VkOiBPYnNlcnZhYmxlPE1lbnVTdGFja0Nsb3NlRXZlbnQ+ID0gdGhpcy5fY2xvc2U7XG5cbiAgLyoqIE9ic2VydmFibGUgd2hpY2ggZW1pdHMgd2hldGhlciBhbnkgbWVudSBpbiB0aGUgbWVudSBzdGFjayBoYXMgZm9jdXMuICovXG4gIHJlYWRvbmx5IGhhc0ZvY3VzOiBPYnNlcnZhYmxlPGJvb2xlYW4+ID0gdGhpcy5faGFzRm9jdXMucGlwZShcbiAgICBzdGFydFdpdGgoZmFsc2UpLFxuICAgIGRlYm91bmNlVGltZSgwKSxcbiAgICBkaXN0aW5jdFVudGlsQ2hhbmdlZCgpLFxuICApO1xuXG4gIC8qKlxuICAgKiBPYnNlcnZhYmxlIHdoaWNoIGVtaXRzIHdoZW4gdGhlIE1lbnVTdGFjayBpcyBlbXB0eSBhZnRlciBwb3BwaW5nIG9mZiB0aGUgbGFzdCBlbGVtZW50LiBJdFxuICAgKiBlbWl0cyBhIEZvY3VzTmV4dCBldmVudCB3aGljaCBzcGVjaWZpZXMgdGhlIGFjdGlvbiB0aGUgY2xvc2VyIGhhcyByZXF1ZXN0ZWQgdGhlIGxpc3RlbmVyXG4gICAqIHBlcmZvcm0uXG4gICAqL1xuICByZWFkb25seSBlbXB0aWVkOiBPYnNlcnZhYmxlPEZvY3VzTmV4dCB8IHVuZGVmaW5lZD4gPSB0aGlzLl9lbXB0eTtcblxuICAvKipcbiAgICogV2hldGhlciB0aGUgaW5saW5lIG1lbnUgYXNzb2NpYXRlZCB3aXRoIHRoaXMgbWVudSBzdGFjayBpcyB2ZXJ0aWNhbCBvciBob3Jpem9udGFsLlxuICAgKiBgbnVsbGAgaW5kaWNhdGVzIHRoZXJlIGlzIG5vIGlubGluZSBtZW51IGFzc29jaWF0ZWQgd2l0aCB0aGlzIG1lbnUgc3RhY2suXG4gICAqL1xuICBwcml2YXRlIF9pbmxpbmVNZW51T3JpZW50YXRpb246ICd2ZXJ0aWNhbCcgfCAnaG9yaXpvbnRhbCcgfCBudWxsID0gbnVsbDtcblxuICAvKiogQ3JlYXRlcyBhIG1lbnUgc3RhY2sgdGhhdCBvcmlnaW5hdGVzIGZyb20gYW4gaW5saW5lIG1lbnUuICovXG4gIHN0YXRpYyBpbmxpbmUob3JpZW50YXRpb246ICd2ZXJ0aWNhbCcgfCAnaG9yaXpvbnRhbCcpIHtcbiAgICBjb25zdCBzdGFjayA9IG5ldyBNZW51U3RhY2soKTtcbiAgICBzdGFjay5faW5saW5lTWVudU9yaWVudGF0aW9uID0gb3JpZW50YXRpb247XG4gICAgcmV0dXJuIHN0YWNrO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgYW4gaXRlbSB0byB0aGUgbWVudSBzdGFjay5cbiAgICogQHBhcmFtIG1lbnUgdGhlIE1lbnVTdGFja0l0ZW0gdG8gcHV0IG9uIHRoZSBzdGFjay5cbiAgICovXG4gIHB1c2gobWVudTogTWVudVN0YWNrSXRlbSkge1xuICAgIHRoaXMuX2VsZW1lbnRzLnB1c2gobWVudSk7XG4gIH1cblxuICAvKipcbiAgICogUG9wIGl0ZW1zIG9mZiBvZiB0aGUgc3RhY2sgdXAgdG8gYW5kIGluY2x1ZGluZyBgbGFzdEl0ZW1gIGFuZCBlbWl0IGVhY2ggb24gdGhlIGNsb3NlXG4gICAqIG9ic2VydmFibGUuIElmIHRoZSBzdGFjayBpcyBlbXB0eSBvciBgbGFzdEl0ZW1gIGlzIG5vdCBvbiB0aGUgc3RhY2sgaXQgZG9lcyBub3RoaW5nLlxuICAgKiBAcGFyYW0gbGFzdEl0ZW0gdGhlIGxhc3QgaXRlbSB0byBwb3Agb2ZmIHRoZSBzdGFjay5cbiAgICogQHBhcmFtIG9wdGlvbnMgT3B0aW9ucyB0aGF0IGNvbmZpZ3VyZSBiZWhhdmlvciBvbiBjbG9zZS5cbiAgICovXG4gIGNsb3NlKGxhc3RJdGVtOiBNZW51U3RhY2tJdGVtLCBvcHRpb25zPzogQ2xvc2VPcHRpb25zKSB7XG4gICAgY29uc3Qge2ZvY3VzTmV4dE9uRW1wdHksIGZvY3VzUGFyZW50VHJpZ2dlcn0gPSB7Li4ub3B0aW9uc307XG4gICAgaWYgKHRoaXMuX2VsZW1lbnRzLmluZGV4T2YobGFzdEl0ZW0pID49IDApIHtcbiAgICAgIGxldCBwb3BwZWRFbGVtZW50O1xuICAgICAgZG8ge1xuICAgICAgICBwb3BwZWRFbGVtZW50ID0gdGhpcy5fZWxlbWVudHMucG9wKCkhO1xuICAgICAgICB0aGlzLl9jbG9zZS5uZXh0KHtpdGVtOiBwb3BwZWRFbGVtZW50LCBmb2N1c1BhcmVudFRyaWdnZXJ9KTtcbiAgICAgIH0gd2hpbGUgKHBvcHBlZEVsZW1lbnQgIT09IGxhc3RJdGVtKTtcblxuICAgICAgaWYgKHRoaXMuaXNFbXB0eSgpKSB7XG4gICAgICAgIHRoaXMuX2VtcHR5Lm5leHQoZm9jdXNOZXh0T25FbXB0eSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFBvcCBpdGVtcyBvZmYgb2YgdGhlIHN0YWNrIHVwIHRvIGJ1dCBleGNsdWRpbmcgYGxhc3RJdGVtYCBhbmQgZW1pdCBlYWNoIG9uIHRoZSBjbG9zZVxuICAgKiBvYnNlcnZhYmxlLiBJZiB0aGUgc3RhY2sgaXMgZW1wdHkgb3IgYGxhc3RJdGVtYCBpcyBub3Qgb24gdGhlIHN0YWNrIGl0IGRvZXMgbm90aGluZy5cbiAgICogQHBhcmFtIGxhc3RJdGVtIHRoZSBlbGVtZW50IHdoaWNoIHNob3VsZCBiZSBsZWZ0IG9uIHRoZSBzdGFja1xuICAgKiBAcmV0dXJuIHdoZXRoZXIgb3Igbm90IGFuIGl0ZW0gd2FzIHJlbW92ZWQgZnJvbSB0aGUgc3RhY2tcbiAgICovXG4gIGNsb3NlU3ViTWVudU9mKGxhc3RJdGVtOiBNZW51U3RhY2tJdGVtKSB7XG4gICAgbGV0IHJlbW92ZWQgPSBmYWxzZTtcbiAgICBpZiAodGhpcy5fZWxlbWVudHMuaW5kZXhPZihsYXN0SXRlbSkgPj0gMCkge1xuICAgICAgcmVtb3ZlZCA9IHRoaXMucGVlaygpICE9PSBsYXN0SXRlbTtcbiAgICAgIHdoaWxlICh0aGlzLnBlZWsoKSAhPT0gbGFzdEl0ZW0pIHtcbiAgICAgICAgdGhpcy5fY2xvc2UubmV4dCh7aXRlbTogdGhpcy5fZWxlbWVudHMucG9wKCkhfSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZW1vdmVkO1xuICB9XG5cbiAgLyoqXG4gICAqIFBvcCBvZmYgYWxsIE1lbnVTdGFja0l0ZW1zIGFuZCBlbWl0IGVhY2ggb25lIG9uIHRoZSBgY2xvc2VgIG9ic2VydmFibGUgb25lIGJ5IG9uZS5cbiAgICogQHBhcmFtIG9wdGlvbnMgT3B0aW9ucyB0aGF0IGNvbmZpZ3VyZSBiZWhhdmlvciBvbiBjbG9zZS5cbiAgICovXG4gIGNsb3NlQWxsKG9wdGlvbnM/OiBDbG9zZU9wdGlvbnMpIHtcbiAgICBjb25zdCB7Zm9jdXNOZXh0T25FbXB0eSwgZm9jdXNQYXJlbnRUcmlnZ2VyfSA9IHsuLi5vcHRpb25zfTtcbiAgICBpZiAoIXRoaXMuaXNFbXB0eSgpKSB7XG4gICAgICB3aGlsZSAoIXRoaXMuaXNFbXB0eSgpKSB7XG4gICAgICAgIGNvbnN0IG1lbnVTdGFja0l0ZW0gPSB0aGlzLl9lbGVtZW50cy5wb3AoKTtcbiAgICAgICAgaWYgKG1lbnVTdGFja0l0ZW0pIHtcbiAgICAgICAgICB0aGlzLl9jbG9zZS5uZXh0KHtpdGVtOiBtZW51U3RhY2tJdGVtLCBmb2N1c1BhcmVudFRyaWdnZXJ9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdGhpcy5fZW1wdHkubmV4dChmb2N1c05leHRPbkVtcHR5KTtcbiAgICB9XG4gIH1cblxuICAvKiogUmV0dXJuIHRydWUgaWYgdGhpcyBzdGFjayBpcyBlbXB0eS4gKi9cbiAgaXNFbXB0eSgpIHtcbiAgICByZXR1cm4gIXRoaXMuX2VsZW1lbnRzLmxlbmd0aDtcbiAgfVxuXG4gIC8qKiBSZXR1cm4gdGhlIGxlbmd0aCBvZiB0aGUgc3RhY2suICovXG4gIGxlbmd0aCgpIHtcbiAgICByZXR1cm4gdGhpcy5fZWxlbWVudHMubGVuZ3RoO1xuICB9XG5cbiAgLyoqIEdldCB0aGUgdG9wIG1vc3QgZWxlbWVudCBvbiB0aGUgc3RhY2suICovXG4gIHBlZWsoKTogTWVudVN0YWNrSXRlbSB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIHRoaXMuX2VsZW1lbnRzW3RoaXMuX2VsZW1lbnRzLmxlbmd0aCAtIDFdO1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhlIG1lbnUgc3RhY2sgaXMgYXNzb2NpYXRlZCB3aXRoIGFuIGlubGluZSBtZW51LiAqL1xuICBoYXNJbmxpbmVNZW51KCkge1xuICAgIHJldHVybiB0aGlzLl9pbmxpbmVNZW51T3JpZW50YXRpb24gIT0gbnVsbDtcbiAgfVxuXG4gIC8qKiBUaGUgb3JpZW50YXRpb24gb2YgdGhlIGFzc29jaWF0ZWQgaW5saW5lIG1lbnUuICovXG4gIGlubGluZU1lbnVPcmllbnRhdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5faW5saW5lTWVudU9yaWVudGF0aW9uO1xuICB9XG5cbiAgLyoqIFNldHMgd2hldGhlciB0aGUgbWVudSBzdGFjayBjb250YWlucyB0aGUgZm9jdXNlZCBlbGVtZW50LiAqL1xuICBzZXRIYXNGb2N1cyhoYXNGb2N1czogYm9vbGVhbikge1xuICAgIHRoaXMuX2hhc0ZvY3VzLm5leHQoaGFzRm9jdXMpO1xuICB9XG59XG4iXX0=