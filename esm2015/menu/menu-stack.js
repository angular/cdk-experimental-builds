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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL21lbnUvbWVudS1zdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsT0FBTyxFQUFhLE1BQU0sTUFBTSxDQUFDO0FBaUJ6Qzs7Ozs7R0FLRztBQUNILE1BQU0sT0FBTyxTQUFTO0lBQXRCO1FBQ0Usb0RBQW9EO1FBQ25DLGNBQVMsR0FBb0IsRUFBRSxDQUFDO1FBRWpELHNGQUFzRjtRQUNyRSxXQUFNLEdBQTJCLElBQUksT0FBTyxFQUFFLENBQUM7UUFFaEUsNEVBQTRFO1FBQzNELFdBQU0sR0FBdUIsSUFBSSxPQUFPLEVBQUUsQ0FBQztRQUU1RCxrRkFBa0Y7UUFDekUsV0FBTSxHQUE4QixJQUFJLENBQUMsTUFBTSxDQUFDO1FBRXpEOzs7O1dBSUc7UUFDTSxZQUFPLEdBQTBCLElBQUksQ0FBQyxNQUFNLENBQUM7SUE4RXhELENBQUM7SUE1RUMseURBQXlEO0lBQ3pELElBQUksQ0FBQyxJQUFtQjtRQUN0QixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM1QixDQUFDO0lBRUQ7Ozs7Ozs7T0FPRztJQUNILEtBQUssQ0FBQyxRQUF1QixFQUFFLFNBQXFCO1FBQ2xELElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ3pDLElBQUksYUFBYSxDQUFDO1lBQ2xCLEdBQUc7Z0JBQ0QsYUFBYSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUM7Z0JBQ3JDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO2FBQ2pDLFFBQVEsYUFBYSxLQUFLLFFBQVEsRUFBRTtZQUVyQyxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRTtnQkFDbEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7YUFDN0I7U0FDRjtJQUNILENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILGNBQWMsQ0FBQyxRQUF1QjtRQUNwQyxJQUFJLE9BQU8sR0FBRyxLQUFLLENBQUM7UUFDcEIsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDekMsT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsS0FBSyxRQUFRLENBQUM7WUFDbkMsT0FBTyxJQUFJLENBQUMsSUFBSSxFQUFFLEtBQUssUUFBUSxFQUFFO2dCQUMvQixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7YUFDeEM7U0FDRjtRQUNELE9BQU8sT0FBTyxDQUFDO0lBQ2pCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsUUFBUSxDQUFDLFNBQXFCO1FBQzVCLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUU7WUFDbkIsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRTtnQkFDdEIsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztnQkFDM0MsSUFBSSxhQUFhLEVBQUU7b0JBQ2pCLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO2lCQUNqQzthQUNGO1lBRUQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDN0I7SUFDSCxDQUFDO0lBRUQsMENBQTBDO0lBQzFDLE9BQU87UUFDTCxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUM7SUFDaEMsQ0FBQztJQUVELHNDQUFzQztJQUN0QyxNQUFNO1FBQ0osT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQztJQUMvQixDQUFDO0lBRUQsNkNBQTZDO0lBQzdDLElBQUk7UUFDRixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDbkQsQ0FBQztDQUNGO0FBRUQsc0VBQXNFO0FBQ3RFLE1BQU0sT0FBTyxhQUFjLFNBQVEsU0FBUztJQUMxQywwREFBMEQ7SUFDMUQsSUFBSSxDQUFDLENBQWdCLElBQUcsQ0FBQztDQUMxQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1N1YmplY3QsIE9ic2VydmFibGV9IGZyb20gJ3J4anMnO1xuXG4vKiogRXZlbnRzIHRvIGVtaXQgYXMgc3BlY2lmaWVkIGJ5IHRoZSBjYWxsZXIgb25jZSB0aGUgTWVudVN0YWNrIGlzIGVtcHR5LiAqL1xuZXhwb3J0IGNvbnN0IGVudW0gRm9jdXNOZXh0IHtcbiAgbmV4dEl0ZW0sXG4gIHByZXZpb3VzSXRlbSxcbiAgY3VycmVudEl0ZW0sXG59XG5cbi8qKlxuICogSW50ZXJmYWNlIGZvciB0aGUgZWxlbWVudHMgdHJhY2tlZCBpbiB0aGUgTWVudVN0YWNrLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIE1lbnVTdGFja0l0ZW0ge1xuICAvKiogQSByZWZlcmVuY2UgdG8gdGhlIHByZXZpb3VzIE1lbnVzIE1lbnVTdGFjayBpbnN0YW5jZS4gKi9cbiAgX21lbnVTdGFjazogTWVudVN0YWNrIHwgbnVsbDtcbn1cblxuLyoqXG4gKiBNZW51U3RhY2sgYWxsb3dzIHN1YnNjcmliZXJzIHRvIGxpc3RlbiBmb3IgY2xvc2UgZXZlbnRzICh3aGVuIGEgTWVudVN0YWNrSXRlbSBpcyBwb3BwZWQgb2ZmXG4gKiBvZiB0aGUgc3RhY2spIGluIG9yZGVyIHRvIHBlcmZvcm0gY2xvc2luZyBhY3Rpb25zLiBVcG9uIHRoZSBNZW51U3RhY2sgYmVpbmcgZW1wdHkgaXQgZW1pdHNcbiAqIGZyb20gdGhlIGBlbXB0eWAgb2JzZXJ2YWJsZSBzcGVjaWZ5aW5nIHRoZSBuZXh0IGZvY3VzIGFjdGlvbiB3aGljaCB0aGUgbGlzdGVuZXIgc2hvdWxkIHBlcmZvcm1cbiAqIGFzIHJlcXVlc3RlZCBieSB0aGUgY2xvc2VyLlxuICovXG5leHBvcnQgY2xhc3MgTWVudVN0YWNrIHtcbiAgLyoqIEFsbCBNZW51U3RhY2tJdGVtcyB0cmFja2VkIGJ5IHRoaXMgTWVudVN0YWNrLiAqL1xuICBwcml2YXRlIHJlYWRvbmx5IF9lbGVtZW50czogTWVudVN0YWNrSXRlbVtdID0gW107XG5cbiAgLyoqIEVtaXRzIHRoZSBlbGVtZW50IHdoaWNoIHdhcyBwb3BwZWQgb2ZmIG9mIHRoZSBzdGFjayB3aGVuIHJlcXVlc3RlZCBieSBhIGNsb3Nlci4gKi9cbiAgcHJpdmF0ZSByZWFkb25seSBfY2xvc2U6IFN1YmplY3Q8TWVudVN0YWNrSXRlbT4gPSBuZXcgU3ViamVjdCgpO1xuXG4gIC8qKiBFbWl0cyBvbmNlIHRoZSBNZW51U3RhY2sgaGFzIGJlY29tZSBlbXB0eSBhZnRlciBwb3BwaW5nIG9mZiBlbGVtZW50cy4gKi9cbiAgcHJpdmF0ZSByZWFkb25seSBfZW1wdHk6IFN1YmplY3Q8Rm9jdXNOZXh0PiA9IG5ldyBTdWJqZWN0KCk7XG5cbiAgLyoqIE9ic2VydmFibGUgd2hpY2ggZW1pdHMgdGhlIE1lbnVTdGFja0l0ZW0gd2hpY2ggaGFzIGJlZW4gcmVxdWVzdGVkIHRvIGNsb3NlLiAqL1xuICByZWFkb25seSBjbG9zZWQ6IE9ic2VydmFibGU8TWVudVN0YWNrSXRlbT4gPSB0aGlzLl9jbG9zZTtcblxuICAvKipcbiAgICogT2JzZXJ2YWJsZSB3aGljaCBlbWl0cyB3aGVuIHRoZSBNZW51U3RhY2sgaXMgZW1wdHkgYWZ0ZXIgcG9wcGluZyBvZmYgdGhlIGxhc3QgZWxlbWVudC4gSXRcbiAgICogZW1pdHMgYSBGb2N1c05leHQgZXZlbnQgd2hpY2ggc3BlY2lmaWVzIHRoZSBhY3Rpb24gdGhlIGNsb3NlciBoYXMgcmVxdWVzdGVkIHRoZSBsaXN0ZW5lclxuICAgKiBwZXJmb3JtLlxuICAgKi9cbiAgcmVhZG9ubHkgZW1wdGllZDogT2JzZXJ2YWJsZTxGb2N1c05leHQ+ID0gdGhpcy5fZW1wdHk7XG5cbiAgLyoqIEBwYXJhbSBtZW51IHRoZSBNZW51U3RhY2tJdGVtIHRvIHB1dCBvbiB0aGUgc3RhY2suICovXG4gIHB1c2gobWVudTogTWVudVN0YWNrSXRlbSkge1xuICAgIHRoaXMuX2VsZW1lbnRzLnB1c2gobWVudSk7XG4gIH1cblxuICAvKipcbiAgICogUG9wIGl0ZW1zIG9mZiBvZiB0aGUgc3RhY2sgdXAgdG8gYW5kIGluY2x1ZGluZyBgbGFzdEl0ZW1gIGFuZCBlbWl0IGVhY2ggb24gdGhlIGNsb3NlXG4gICAqIG9ic2VydmFibGUuIElmIHRoZSBzdGFjayBpcyBlbXB0eSBvciBgbGFzdEl0ZW1gIGlzIG5vdCBvbiB0aGUgc3RhY2sgaXQgZG9lcyBub3RoaW5nLlxuICAgKiBAcGFyYW0gbGFzdEl0ZW0gdGhlIGxhc3QgaXRlbSB0byBwb3Agb2ZmIHRoZSBzdGFjay5cbiAgICogQHBhcmFtIGZvY3VzTmV4dCB0aGUgZXZlbnQgdG8gZW1pdCBvbiB0aGUgYGVtcHR5YCBvYnNlcnZhYmxlIGlmIHRoZSBtZXRob2QgY2FsbCByZXN1bHRlZCBpbiBhblxuICAgKiBlbXB0eSBzdGFjay4gRG9lcyBub3QgZW1pdCBpZiB0aGUgc3RhY2sgd2FzIGluaXRpYWxseSBlbXB0eSBvciBpZiBgbGFzdEl0ZW1gIHdhcyBub3Qgb24gdGhlXG4gICAqIHN0YWNrLlxuICAgKi9cbiAgY2xvc2UobGFzdEl0ZW06IE1lbnVTdGFja0l0ZW0sIGZvY3VzTmV4dD86IEZvY3VzTmV4dCkge1xuICAgIGlmICh0aGlzLl9lbGVtZW50cy5pbmRleE9mKGxhc3RJdGVtKSA+PSAwKSB7XG4gICAgICBsZXQgcG9wcGVkRWxlbWVudDtcbiAgICAgIGRvIHtcbiAgICAgICAgcG9wcGVkRWxlbWVudCA9IHRoaXMuX2VsZW1lbnRzLnBvcCgpO1xuICAgICAgICB0aGlzLl9jbG9zZS5uZXh0KHBvcHBlZEVsZW1lbnQpO1xuICAgICAgfSB3aGlsZSAocG9wcGVkRWxlbWVudCAhPT0gbGFzdEl0ZW0pO1xuXG4gICAgICBpZiAodGhpcy5pc0VtcHR5KCkpIHtcbiAgICAgICAgdGhpcy5fZW1wdHkubmV4dChmb2N1c05leHQpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBQb3AgaXRlbXMgb2ZmIG9mIHRoZSBzdGFjayB1cCB0byBidXQgZXhjbHVkaW5nIGBsYXN0SXRlbWAgYW5kIGVtaXQgZWFjaCBvbiB0aGUgY2xvc2VcbiAgICogb2JzZXJ2YWJsZS4gSWYgdGhlIHN0YWNrIGlzIGVtcHR5IG9yIGBsYXN0SXRlbWAgaXMgbm90IG9uIHRoZSBzdGFjayBpdCBkb2VzIG5vdGhpbmcuXG4gICAqIEBwYXJhbSBsYXN0SXRlbSB0aGUgZWxlbWVudCB3aGljaCBzaG91bGQgYmUgbGVmdCBvbiB0aGUgc3RhY2tcbiAgICogQHJldHVybiB3aGV0aGVyIG9yIG5vdCBhbiBpdGVtIHdhcyByZW1vdmVkIGZyb20gdGhlIHN0YWNrXG4gICAqL1xuICBjbG9zZVN1Yk1lbnVPZihsYXN0SXRlbTogTWVudVN0YWNrSXRlbSkge1xuICAgIGxldCByZW1vdmVkID0gZmFsc2U7XG4gICAgaWYgKHRoaXMuX2VsZW1lbnRzLmluZGV4T2YobGFzdEl0ZW0pID49IDApIHtcbiAgICAgIHJlbW92ZWQgPSB0aGlzLnBlZWsoKSAhPT0gbGFzdEl0ZW07XG4gICAgICB3aGlsZSAodGhpcy5wZWVrKCkgIT09IGxhc3RJdGVtKSB7XG4gICAgICAgIHRoaXMuX2Nsb3NlLm5leHQodGhpcy5fZWxlbWVudHMucG9wKCkpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVtb3ZlZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBQb3Agb2ZmIGFsbCBNZW51U3RhY2tJdGVtcyBhbmQgZW1pdCBlYWNoIG9uZSBvbiB0aGUgYGNsb3NlYCBvYnNlcnZhYmxlIG9uZSBieSBvbmUuXG4gICAqIEBwYXJhbSBmb2N1c05leHQgdGhlIGV2ZW50IHRvIGVtaXQgb24gdGhlIGBlbXB0eWAgb2JzZXJ2YWJsZSBvbmNlIHRoZSBzdGFjayBpcyBlbXB0aWVkLiBEb2VzXG4gICAqIG5vdCBlbWl0IGlmIHRoZSBzdGFjayB3YXMgaW5pdGlhbGx5IGVtcHR5LlxuICAgKi9cbiAgY2xvc2VBbGwoZm9jdXNOZXh0PzogRm9jdXNOZXh0KSB7XG4gICAgaWYgKCF0aGlzLmlzRW1wdHkoKSkge1xuICAgICAgd2hpbGUgKCF0aGlzLmlzRW1wdHkoKSkge1xuICAgICAgICBjb25zdCBtZW51U3RhY2tJdGVtID0gdGhpcy5fZWxlbWVudHMucG9wKCk7XG4gICAgICAgIGlmIChtZW51U3RhY2tJdGVtKSB7XG4gICAgICAgICAgdGhpcy5fY2xvc2UubmV4dChtZW51U3RhY2tJdGVtKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLl9lbXB0eS5uZXh0KGZvY3VzTmV4dCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFJldHVybiB0cnVlIGlmIHRoaXMgc3RhY2sgaXMgZW1wdHkuICovXG4gIGlzRW1wdHkoKSB7XG4gICAgcmV0dXJuICF0aGlzLl9lbGVtZW50cy5sZW5ndGg7XG4gIH1cblxuICAvKiogUmV0dXJuIHRoZSBsZW5ndGggb2YgdGhlIHN0YWNrLiAqL1xuICBsZW5ndGgoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2VsZW1lbnRzLmxlbmd0aDtcbiAgfVxuXG4gIC8qKiBHZXQgdGhlIHRvcCBtb3N0IGVsZW1lbnQgb24gdGhlIHN0YWNrLiAqL1xuICBwZWVrKCk6IE1lbnVTdGFja0l0ZW0gfCB1bmRlZmluZWQge1xuICAgIHJldHVybiB0aGlzLl9lbGVtZW50c1t0aGlzLl9lbGVtZW50cy5sZW5ndGggLSAxXTtcbiAgfVxufVxuXG4vKiogTm9vcE1lbnVTdGFjayBpcyBhIHBsYWNlaG9sZGVyIE1lbnVTdGFjayB1c2VkIGZvciBpbmxpbmUgbWVudXMuICovXG5leHBvcnQgY2xhc3MgTm9vcE1lbnVTdGFjayBleHRlbmRzIE1lbnVTdGFjayB7XG4gIC8qKiBOb29wIHB1c2ggLSBkb2VzIG5vdCBhZGQgZWxlbWVudHMgdG8gdGhlIE1lbnVTdGFjay4gKi9cbiAgcHVzaChfOiBNZW51U3RhY2tJdGVtKSB7fVxufVxuIl19