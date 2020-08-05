/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Subject } from 'rxjs';
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
}
/** NoopMenuStack is a placeholder MenuStack used for inline menus. */
export class NoopMenuStack extends MenuStack {
    /** Noop push - does not add elements to the MenuStack. */
    push(_) { }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL21lbnUvbWVudS1zdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsT0FBTyxFQUFhLE1BQU0sTUFBTSxDQUFDO0FBaUJ6Qzs7Ozs7R0FLRztBQUNILE1BQU0sT0FBTyxTQUFTO0lBQXRCO1FBQ0Usb0RBQW9EO1FBQ25DLGNBQVMsR0FBb0IsRUFBRSxDQUFDO1FBRWpELHNGQUFzRjtRQUNyRSxXQUFNLEdBQTJCLElBQUksT0FBTyxFQUFFLENBQUM7UUFFaEUsNEVBQTRFO1FBQzNELFdBQU0sR0FBdUIsSUFBSSxPQUFPLEVBQUUsQ0FBQztRQUU1RCxrRkFBa0Y7UUFDekUsV0FBTSxHQUE4QixJQUFJLENBQUMsTUFBTSxDQUFDO1FBRXpEOzs7O1dBSUc7UUFDTSxZQUFPLEdBQTBCLElBQUksQ0FBQyxNQUFNLENBQUM7SUE4RXhELENBQUM7SUE1RUMseURBQXlEO0lBQ3pELElBQUksQ0FBQyxJQUFtQjtRQUN0QixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM1QixDQUFDO0lBRUQ7Ozs7Ozs7T0FPRztJQUNILEtBQUssQ0FBQyxRQUF1QixFQUFFLFNBQXFCO1FBQ2xELElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ3pDLElBQUksYUFBYSxDQUFDO1lBQ2xCLEdBQUc7Z0JBQ0QsYUFBYSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUM7Z0JBQ3JDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO2FBQ2pDLFFBQVEsYUFBYSxLQUFLLFFBQVEsRUFBRTtZQUVyQyxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRTtnQkFDbEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7YUFDN0I7U0FDRjtJQUNILENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILGNBQWMsQ0FBQyxRQUF1QjtRQUNwQyxJQUFJLE9BQU8sR0FBRyxLQUFLLENBQUM7UUFDcEIsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDekMsT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsS0FBSyxRQUFRLENBQUM7WUFDbkMsT0FBTyxJQUFJLENBQUMsSUFBSSxFQUFFLEtBQUssUUFBUSxFQUFFO2dCQUMvQixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7YUFDeEM7U0FDRjtRQUNELE9BQU8sT0FBTyxDQUFDO0lBQ2pCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsUUFBUSxDQUFDLFNBQXFCO1FBQzVCLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUU7WUFDbkIsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRTtnQkFDdEIsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztnQkFDM0MsSUFBSSxhQUFhLEVBQUU7b0JBQ2pCLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO2lCQUNqQzthQUNGO1lBRUQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDN0I7SUFDSCxDQUFDO0lBRUQsMENBQTBDO0lBQzFDLE9BQU87UUFDTCxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUM7SUFDaEMsQ0FBQztJQUVELHNDQUFzQztJQUN0QyxNQUFNO1FBQ0osT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQztJQUMvQixDQUFDO0lBRUQsNkNBQTZDO0lBQzdDLElBQUk7UUFDRixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDbkQsQ0FBQztDQUNGO0FBRUQsc0VBQXNFO0FBQ3RFLE1BQU0sT0FBTyxhQUFjLFNBQVEsU0FBUztJQUMxQywwREFBMEQ7SUFDMUQsSUFBSSxDQUFDLENBQWdCLElBQUcsQ0FBQztDQUMxQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1N1YmplY3QsIE9ic2VydmFibGV9IGZyb20gJ3J4anMnO1xuXG4vKiogRXZlbnRzIHRvIGVtaXQgYXMgc3BlY2lmaWVkIGJ5IHRoZSBjYWxsZXIgb25jZSB0aGUgTWVudVN0YWNrIGlzIGVtcHR5LiAqL1xuZXhwb3J0IGNvbnN0IGVudW0gRm9jdXNOZXh0IHtcbiAgbmV4dEl0ZW0sXG4gIHByZXZpb3VzSXRlbSxcbiAgY3VycmVudEl0ZW0sXG59XG5cbi8qKlxuICogSW50ZXJmYWNlIGZvciB0aGUgZWxlbWVudHMgdHJhY2tlZCBpbiB0aGUgTWVudVN0YWNrLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIE1lbnVTdGFja0l0ZW0ge1xuICAvKiogQSByZWZlcmVuY2UgdG8gdGhlIHByZXZpb3VzIE1lbnVzIE1lbnVTdGFjayBpbnN0YW5jZS4gKi9cbiAgX21lbnVTdGFjazogTWVudVN0YWNrO1xufVxuXG4vKipcbiAqIE1lbnVTdGFjayBhbGxvd3Mgc3Vic2NyaWJlcnMgdG8gbGlzdGVuIGZvciBjbG9zZSBldmVudHMgKHdoZW4gYSBNZW51U3RhY2tJdGVtIGlzIHBvcHBlZCBvZmZcbiAqIG9mIHRoZSBzdGFjaykgaW4gb3JkZXIgdG8gcGVyZm9ybSBjbG9zaW5nIGFjdGlvbnMuIFVwb24gdGhlIE1lbnVTdGFjayBiZWluZyBlbXB0eSBpdCBlbWl0c1xuICogZnJvbSB0aGUgYGVtcHR5YCBvYnNlcnZhYmxlIHNwZWNpZnlpbmcgdGhlIG5leHQgZm9jdXMgYWN0aW9uIHdoaWNoIHRoZSBsaXN0ZW5lciBzaG91bGQgcGVyZm9ybVxuICogYXMgcmVxdWVzdGVkIGJ5IHRoZSBjbG9zZXIuXG4gKi9cbmV4cG9ydCBjbGFzcyBNZW51U3RhY2sge1xuICAvKiogQWxsIE1lbnVTdGFja0l0ZW1zIHRyYWNrZWQgYnkgdGhpcyBNZW51U3RhY2suICovXG4gIHByaXZhdGUgcmVhZG9ubHkgX2VsZW1lbnRzOiBNZW51U3RhY2tJdGVtW10gPSBbXTtcblxuICAvKiogRW1pdHMgdGhlIGVsZW1lbnQgd2hpY2ggd2FzIHBvcHBlZCBvZmYgb2YgdGhlIHN0YWNrIHdoZW4gcmVxdWVzdGVkIGJ5IGEgY2xvc2VyLiAqL1xuICBwcml2YXRlIHJlYWRvbmx5IF9jbG9zZTogU3ViamVjdDxNZW51U3RhY2tJdGVtPiA9IG5ldyBTdWJqZWN0KCk7XG5cbiAgLyoqIEVtaXRzIG9uY2UgdGhlIE1lbnVTdGFjayBoYXMgYmVjb21lIGVtcHR5IGFmdGVyIHBvcHBpbmcgb2ZmIGVsZW1lbnRzLiAqL1xuICBwcml2YXRlIHJlYWRvbmx5IF9lbXB0eTogU3ViamVjdDxGb2N1c05leHQ+ID0gbmV3IFN1YmplY3QoKTtcblxuICAvKiogT2JzZXJ2YWJsZSB3aGljaCBlbWl0cyB0aGUgTWVudVN0YWNrSXRlbSB3aGljaCBoYXMgYmVlbiByZXF1ZXN0ZWQgdG8gY2xvc2UuICovXG4gIHJlYWRvbmx5IGNsb3NlZDogT2JzZXJ2YWJsZTxNZW51U3RhY2tJdGVtPiA9IHRoaXMuX2Nsb3NlO1xuXG4gIC8qKlxuICAgKiBPYnNlcnZhYmxlIHdoaWNoIGVtaXRzIHdoZW4gdGhlIE1lbnVTdGFjayBpcyBlbXB0eSBhZnRlciBwb3BwaW5nIG9mZiB0aGUgbGFzdCBlbGVtZW50LiBJdFxuICAgKiBlbWl0cyBhIEZvY3VzTmV4dCBldmVudCB3aGljaCBzcGVjaWZpZXMgdGhlIGFjdGlvbiB0aGUgY2xvc2VyIGhhcyByZXF1ZXN0ZWQgdGhlIGxpc3RlbmVyXG4gICAqIHBlcmZvcm0uXG4gICAqL1xuICByZWFkb25seSBlbXB0aWVkOiBPYnNlcnZhYmxlPEZvY3VzTmV4dD4gPSB0aGlzLl9lbXB0eTtcblxuICAvKiogQHBhcmFtIG1lbnUgdGhlIE1lbnVTdGFja0l0ZW0gdG8gcHV0IG9uIHRoZSBzdGFjay4gKi9cbiAgcHVzaChtZW51OiBNZW51U3RhY2tJdGVtKSB7XG4gICAgdGhpcy5fZWxlbWVudHMucHVzaChtZW51KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQb3AgaXRlbXMgb2ZmIG9mIHRoZSBzdGFjayB1cCB0byBhbmQgaW5jbHVkaW5nIGBsYXN0SXRlbWAgYW5kIGVtaXQgZWFjaCBvbiB0aGUgY2xvc2VcbiAgICogb2JzZXJ2YWJsZS4gSWYgdGhlIHN0YWNrIGlzIGVtcHR5IG9yIGBsYXN0SXRlbWAgaXMgbm90IG9uIHRoZSBzdGFjayBpdCBkb2VzIG5vdGhpbmcuXG4gICAqIEBwYXJhbSBsYXN0SXRlbSB0aGUgbGFzdCBpdGVtIHRvIHBvcCBvZmYgdGhlIHN0YWNrLlxuICAgKiBAcGFyYW0gZm9jdXNOZXh0IHRoZSBldmVudCB0byBlbWl0IG9uIHRoZSBgZW1wdHlgIG9ic2VydmFibGUgaWYgdGhlIG1ldGhvZCBjYWxsIHJlc3VsdGVkIGluIGFuXG4gICAqIGVtcHR5IHN0YWNrLiBEb2VzIG5vdCBlbWl0IGlmIHRoZSBzdGFjayB3YXMgaW5pdGlhbGx5IGVtcHR5IG9yIGlmIGBsYXN0SXRlbWAgd2FzIG5vdCBvbiB0aGVcbiAgICogc3RhY2suXG4gICAqL1xuICBjbG9zZShsYXN0SXRlbTogTWVudVN0YWNrSXRlbSwgZm9jdXNOZXh0PzogRm9jdXNOZXh0KSB7XG4gICAgaWYgKHRoaXMuX2VsZW1lbnRzLmluZGV4T2YobGFzdEl0ZW0pID49IDApIHtcbiAgICAgIGxldCBwb3BwZWRFbGVtZW50O1xuICAgICAgZG8ge1xuICAgICAgICBwb3BwZWRFbGVtZW50ID0gdGhpcy5fZWxlbWVudHMucG9wKCk7XG4gICAgICAgIHRoaXMuX2Nsb3NlLm5leHQocG9wcGVkRWxlbWVudCk7XG4gICAgICB9IHdoaWxlIChwb3BwZWRFbGVtZW50ICE9PSBsYXN0SXRlbSk7XG5cbiAgICAgIGlmICh0aGlzLmlzRW1wdHkoKSkge1xuICAgICAgICB0aGlzLl9lbXB0eS5uZXh0KGZvY3VzTmV4dCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFBvcCBpdGVtcyBvZmYgb2YgdGhlIHN0YWNrIHVwIHRvIGJ1dCBleGNsdWRpbmcgYGxhc3RJdGVtYCBhbmQgZW1pdCBlYWNoIG9uIHRoZSBjbG9zZVxuICAgKiBvYnNlcnZhYmxlLiBJZiB0aGUgc3RhY2sgaXMgZW1wdHkgb3IgYGxhc3RJdGVtYCBpcyBub3Qgb24gdGhlIHN0YWNrIGl0IGRvZXMgbm90aGluZy5cbiAgICogQHBhcmFtIGxhc3RJdGVtIHRoZSBlbGVtZW50IHdoaWNoIHNob3VsZCBiZSBsZWZ0IG9uIHRoZSBzdGFja1xuICAgKiBAcmV0dXJuIHdoZXRoZXIgb3Igbm90IGFuIGl0ZW0gd2FzIHJlbW92ZWQgZnJvbSB0aGUgc3RhY2tcbiAgICovXG4gIGNsb3NlU3ViTWVudU9mKGxhc3RJdGVtOiBNZW51U3RhY2tJdGVtKSB7XG4gICAgbGV0IHJlbW92ZWQgPSBmYWxzZTtcbiAgICBpZiAodGhpcy5fZWxlbWVudHMuaW5kZXhPZihsYXN0SXRlbSkgPj0gMCkge1xuICAgICAgcmVtb3ZlZCA9IHRoaXMucGVlaygpICE9PSBsYXN0SXRlbTtcbiAgICAgIHdoaWxlICh0aGlzLnBlZWsoKSAhPT0gbGFzdEl0ZW0pIHtcbiAgICAgICAgdGhpcy5fY2xvc2UubmV4dCh0aGlzLl9lbGVtZW50cy5wb3AoKSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZW1vdmVkO1xuICB9XG5cbiAgLyoqXG4gICAqIFBvcCBvZmYgYWxsIE1lbnVTdGFja0l0ZW1zIGFuZCBlbWl0IGVhY2ggb25lIG9uIHRoZSBgY2xvc2VgIG9ic2VydmFibGUgb25lIGJ5IG9uZS5cbiAgICogQHBhcmFtIGZvY3VzTmV4dCB0aGUgZXZlbnQgdG8gZW1pdCBvbiB0aGUgYGVtcHR5YCBvYnNlcnZhYmxlIG9uY2UgdGhlIHN0YWNrIGlzIGVtcHRpZWQuIERvZXNcbiAgICogbm90IGVtaXQgaWYgdGhlIHN0YWNrIHdhcyBpbml0aWFsbHkgZW1wdHkuXG4gICAqL1xuICBjbG9zZUFsbChmb2N1c05leHQ/OiBGb2N1c05leHQpIHtcbiAgICBpZiAoIXRoaXMuaXNFbXB0eSgpKSB7XG4gICAgICB3aGlsZSAoIXRoaXMuaXNFbXB0eSgpKSB7XG4gICAgICAgIGNvbnN0IG1lbnVTdGFja0l0ZW0gPSB0aGlzLl9lbGVtZW50cy5wb3AoKTtcbiAgICAgICAgaWYgKG1lbnVTdGFja0l0ZW0pIHtcbiAgICAgICAgICB0aGlzLl9jbG9zZS5uZXh0KG1lbnVTdGFja0l0ZW0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX2VtcHR5Lm5leHQoZm9jdXNOZXh0KTtcbiAgICB9XG4gIH1cblxuICAvKiogUmV0dXJuIHRydWUgaWYgdGhpcyBzdGFjayBpcyBlbXB0eS4gKi9cbiAgaXNFbXB0eSgpIHtcbiAgICByZXR1cm4gIXRoaXMuX2VsZW1lbnRzLmxlbmd0aDtcbiAgfVxuXG4gIC8qKiBSZXR1cm4gdGhlIGxlbmd0aCBvZiB0aGUgc3RhY2suICovXG4gIGxlbmd0aCgpIHtcbiAgICByZXR1cm4gdGhpcy5fZWxlbWVudHMubGVuZ3RoO1xuICB9XG5cbiAgLyoqIEdldCB0aGUgdG9wIG1vc3QgZWxlbWVudCBvbiB0aGUgc3RhY2suICovXG4gIHBlZWsoKTogTWVudVN0YWNrSXRlbSB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIHRoaXMuX2VsZW1lbnRzW3RoaXMuX2VsZW1lbnRzLmxlbmd0aCAtIDFdO1xuICB9XG59XG5cbi8qKiBOb29wTWVudVN0YWNrIGlzIGEgcGxhY2Vob2xkZXIgTWVudVN0YWNrIHVzZWQgZm9yIGlubGluZSBtZW51cy4gKi9cbmV4cG9ydCBjbGFzcyBOb29wTWVudVN0YWNrIGV4dGVuZHMgTWVudVN0YWNrIHtcbiAgLyoqIE5vb3AgcHVzaCAtIGRvZXMgbm90IGFkZCBlbGVtZW50cyB0byB0aGUgTWVudVN0YWNrLiAqL1xuICBwdXNoKF86IE1lbnVTdGFja0l0ZW0pIHt9XG59XG4iXX0=