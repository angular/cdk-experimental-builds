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
        this.closed = this._close.asObservable();
        /**
         * Observable which emits when the MenuStack is empty after popping off the last element. It
         * emits a FocusNext event which specifies the action the closer has requested the listener
         * perform.
         */
        this.emptied = this._empty.asObservable();
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
     */
    closeSubMenuOf(lastItem) {
        if (this._elements.indexOf(lastItem) >= 0) {
            while (this.peek() !== lastItem) {
                this._close.next(this._elements.pop());
            }
        }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL21lbnUvbWVudS1zdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsT0FBTyxFQUFhLE1BQU0sTUFBTSxDQUFDO0FBaUJ6Qzs7Ozs7R0FLRztBQUNILE1BQU0sT0FBTyxTQUFTO0lBQXRCO1FBQ0Usb0RBQW9EO1FBQ25DLGNBQVMsR0FBb0IsRUFBRSxDQUFDO1FBRWpELHNGQUFzRjtRQUNyRSxXQUFNLEdBQTJCLElBQUksT0FBTyxFQUFFLENBQUM7UUFFaEUsNEVBQTRFO1FBQzNELFdBQU0sR0FBdUIsSUFBSSxPQUFPLEVBQUUsQ0FBQztRQUU1RCxrRkFBa0Y7UUFDekUsV0FBTSxHQUE4QixJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBRXhFOzs7O1dBSUc7UUFDTSxZQUFPLEdBQTBCLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLENBQUM7SUEwRXZFLENBQUM7SUF4RUMseURBQXlEO0lBQ3pELElBQUksQ0FBQyxJQUFtQjtRQUN0QixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM1QixDQUFDO0lBRUQ7Ozs7Ozs7T0FPRztJQUNILEtBQUssQ0FBQyxRQUF1QixFQUFFLFNBQXFCO1FBQ2xELElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ3pDLElBQUksYUFBYSxDQUFDO1lBQ2xCLEdBQUc7Z0JBQ0QsYUFBYSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUM7Z0JBQ3JDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO2FBQ2pDLFFBQVEsYUFBYSxLQUFLLFFBQVEsRUFBRTtZQUVyQyxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRTtnQkFDbEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7YUFDN0I7U0FDRjtJQUNILENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsY0FBYyxDQUFDLFFBQXVCO1FBQ3BDLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ3pDLE9BQU8sSUFBSSxDQUFDLElBQUksRUFBRSxLQUFLLFFBQVEsRUFBRTtnQkFDL0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO2FBQ3hDO1NBQ0Y7SUFDSCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILFFBQVEsQ0FBQyxTQUFxQjtRQUM1QixJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUFFO1lBQ25CLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUU7Z0JBQ3RCLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUM7Z0JBQzNDLElBQUksYUFBYSxFQUFFO29CQUNqQixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztpQkFDakM7YUFDRjtZQUVELElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1NBQzdCO0lBQ0gsQ0FBQztJQUVELDBDQUEwQztJQUMxQyxPQUFPO1FBQ0wsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDO0lBQ2hDLENBQUM7SUFFRCxzQ0FBc0M7SUFDdEMsTUFBTTtRQUNKLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUM7SUFDL0IsQ0FBQztJQUVELDZDQUE2QztJQUM3QyxJQUFJO1FBQ0YsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ25ELENBQUM7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1N1YmplY3QsIE9ic2VydmFibGV9IGZyb20gJ3J4anMnO1xuXG4vKiogRXZlbnRzIHRvIGVtaXQgYXMgc3BlY2lmaWVkIGJ5IHRoZSBjYWxsZXIgb25jZSB0aGUgTWVudVN0YWNrIGlzIGVtcHR5LiAqL1xuZXhwb3J0IGNvbnN0IGVudW0gRm9jdXNOZXh0IHtcbiAgbmV4dEl0ZW0sXG4gIHByZXZpb3VzSXRlbSxcbiAgY3VycmVudEl0ZW0sXG59XG5cbi8qKlxuICogSW50ZXJmYWNlIGZvciB0aGUgZWxlbWVudHMgdHJhY2tlZCBpbiB0aGUgTWVudVN0YWNrLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIE1lbnVTdGFja0l0ZW0ge1xuICAvKiogQSByZWZlcmVuY2UgdG8gdGhlIHByZXZpb3VzIE1lbnVzIE1lbnVTdGFjayBpbnN0YW5jZS4gKi9cbiAgX21lbnVTdGFjazogTWVudVN0YWNrO1xufVxuXG4vKipcbiAqIE1lbnVTdGFjayBhbGxvd3Mgc3Vic2NyaWJlcnMgdG8gbGlzdGVuIGZvciBjbG9zZSBldmVudHMgKHdoZW4gYSBNZW51U3RhY2tJdGVtIGlzIHBvcHBlZCBvZmZcbiAqIG9mIHRoZSBzdGFjaykgaW4gb3JkZXIgdG8gcGVyZm9ybSBjbG9zaW5nIGFjdGlvbnMuIFVwb24gdGhlIE1lbnVTdGFjayBiZWluZyBlbXB0eSBpdCBlbWl0c1xuICogZnJvbSB0aGUgYGVtcHR5YCBvYnNlcnZhYmxlIHNwZWNpZnlpbmcgdGhlIG5leHQgZm9jdXMgYWN0aW9uIHdoaWNoIHRoZSBsaXN0ZW5lciBzaG91bGQgcGVyZm9ybVxuICogYXMgcmVxdWVzdGVkIGJ5IHRoZSBjbG9zZXIuXG4gKi9cbmV4cG9ydCBjbGFzcyBNZW51U3RhY2sge1xuICAvKiogQWxsIE1lbnVTdGFja0l0ZW1zIHRyYWNrZWQgYnkgdGhpcyBNZW51U3RhY2suICovXG4gIHByaXZhdGUgcmVhZG9ubHkgX2VsZW1lbnRzOiBNZW51U3RhY2tJdGVtW10gPSBbXTtcblxuICAvKiogRW1pdHMgdGhlIGVsZW1lbnQgd2hpY2ggd2FzIHBvcHBlZCBvZmYgb2YgdGhlIHN0YWNrIHdoZW4gcmVxdWVzdGVkIGJ5IGEgY2xvc2VyLiAqL1xuICBwcml2YXRlIHJlYWRvbmx5IF9jbG9zZTogU3ViamVjdDxNZW51U3RhY2tJdGVtPiA9IG5ldyBTdWJqZWN0KCk7XG5cbiAgLyoqIEVtaXRzIG9uY2UgdGhlIE1lbnVTdGFjayBoYXMgYmVjb21lIGVtcHR5IGFmdGVyIHBvcHBpbmcgb2ZmIGVsZW1lbnRzLiAqL1xuICBwcml2YXRlIHJlYWRvbmx5IF9lbXB0eTogU3ViamVjdDxGb2N1c05leHQ+ID0gbmV3IFN1YmplY3QoKTtcblxuICAvKiogT2JzZXJ2YWJsZSB3aGljaCBlbWl0cyB0aGUgTWVudVN0YWNrSXRlbSB3aGljaCBoYXMgYmVlbiByZXF1ZXN0ZWQgdG8gY2xvc2UuICovXG4gIHJlYWRvbmx5IGNsb3NlZDogT2JzZXJ2YWJsZTxNZW51U3RhY2tJdGVtPiA9IHRoaXMuX2Nsb3NlLmFzT2JzZXJ2YWJsZSgpO1xuXG4gIC8qKlxuICAgKiBPYnNlcnZhYmxlIHdoaWNoIGVtaXRzIHdoZW4gdGhlIE1lbnVTdGFjayBpcyBlbXB0eSBhZnRlciBwb3BwaW5nIG9mZiB0aGUgbGFzdCBlbGVtZW50LiBJdFxuICAgKiBlbWl0cyBhIEZvY3VzTmV4dCBldmVudCB3aGljaCBzcGVjaWZpZXMgdGhlIGFjdGlvbiB0aGUgY2xvc2VyIGhhcyByZXF1ZXN0ZWQgdGhlIGxpc3RlbmVyXG4gICAqIHBlcmZvcm0uXG4gICAqL1xuICByZWFkb25seSBlbXB0aWVkOiBPYnNlcnZhYmxlPEZvY3VzTmV4dD4gPSB0aGlzLl9lbXB0eS5hc09ic2VydmFibGUoKTtcblxuICAvKiogQHBhcmFtIG1lbnUgdGhlIE1lbnVTdGFja0l0ZW0gdG8gcHV0IG9uIHRoZSBzdGFjay4gKi9cbiAgcHVzaChtZW51OiBNZW51U3RhY2tJdGVtKSB7XG4gICAgdGhpcy5fZWxlbWVudHMucHVzaChtZW51KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQb3AgaXRlbXMgb2ZmIG9mIHRoZSBzdGFjayB1cCB0byBhbmQgaW5jbHVkaW5nIGBsYXN0SXRlbWAgYW5kIGVtaXQgZWFjaCBvbiB0aGUgY2xvc2VcbiAgICogb2JzZXJ2YWJsZS4gSWYgdGhlIHN0YWNrIGlzIGVtcHR5IG9yIGBsYXN0SXRlbWAgaXMgbm90IG9uIHRoZSBzdGFjayBpdCBkb2VzIG5vdGhpbmcuXG4gICAqIEBwYXJhbSBsYXN0SXRlbSB0aGUgbGFzdCBpdGVtIHRvIHBvcCBvZmYgdGhlIHN0YWNrLlxuICAgKiBAcGFyYW0gZm9jdXNOZXh0IHRoZSBldmVudCB0byBlbWl0IG9uIHRoZSBgZW1wdHlgIG9ic2VydmFibGUgaWYgdGhlIG1ldGhvZCBjYWxsIHJlc3VsdGVkIGluIGFuXG4gICAqIGVtcHR5IHN0YWNrLiBEb2VzIG5vdCBlbWl0IGlmIHRoZSBzdGFjayB3YXMgaW5pdGlhbGx5IGVtcHR5IG9yIGlmIGBsYXN0SXRlbWAgd2FzIG5vdCBvbiB0aGVcbiAgICogc3RhY2suXG4gICAqL1xuICBjbG9zZShsYXN0SXRlbTogTWVudVN0YWNrSXRlbSwgZm9jdXNOZXh0PzogRm9jdXNOZXh0KSB7XG4gICAgaWYgKHRoaXMuX2VsZW1lbnRzLmluZGV4T2YobGFzdEl0ZW0pID49IDApIHtcbiAgICAgIGxldCBwb3BwZWRFbGVtZW50O1xuICAgICAgZG8ge1xuICAgICAgICBwb3BwZWRFbGVtZW50ID0gdGhpcy5fZWxlbWVudHMucG9wKCk7XG4gICAgICAgIHRoaXMuX2Nsb3NlLm5leHQocG9wcGVkRWxlbWVudCk7XG4gICAgICB9IHdoaWxlIChwb3BwZWRFbGVtZW50ICE9PSBsYXN0SXRlbSk7XG5cbiAgICAgIGlmICh0aGlzLmlzRW1wdHkoKSkge1xuICAgICAgICB0aGlzLl9lbXB0eS5uZXh0KGZvY3VzTmV4dCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFBvcCBpdGVtcyBvZmYgb2YgdGhlIHN0YWNrIHVwIHRvIGJ1dCBleGNsdWRpbmcgYGxhc3RJdGVtYCBhbmQgZW1pdCBlYWNoIG9uIHRoZSBjbG9zZVxuICAgKiBvYnNlcnZhYmxlLiBJZiB0aGUgc3RhY2sgaXMgZW1wdHkgb3IgYGxhc3RJdGVtYCBpcyBub3Qgb24gdGhlIHN0YWNrIGl0IGRvZXMgbm90aGluZy5cbiAgICogQHBhcmFtIGxhc3RJdGVtIHRoZSBlbGVtZW50IHdoaWNoIHNob3VsZCBiZSBsZWZ0IG9uIHRoZSBzdGFja1xuICAgKi9cbiAgY2xvc2VTdWJNZW51T2YobGFzdEl0ZW06IE1lbnVTdGFja0l0ZW0pIHtcbiAgICBpZiAodGhpcy5fZWxlbWVudHMuaW5kZXhPZihsYXN0SXRlbSkgPj0gMCkge1xuICAgICAgd2hpbGUgKHRoaXMucGVlaygpICE9PSBsYXN0SXRlbSkge1xuICAgICAgICB0aGlzLl9jbG9zZS5uZXh0KHRoaXMuX2VsZW1lbnRzLnBvcCgpKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUG9wIG9mZiBhbGwgTWVudVN0YWNrSXRlbXMgYW5kIGVtaXQgZWFjaCBvbmUgb24gdGhlIGBjbG9zZWAgb2JzZXJ2YWJsZSBvbmUgYnkgb25lLlxuICAgKiBAcGFyYW0gZm9jdXNOZXh0IHRoZSBldmVudCB0byBlbWl0IG9uIHRoZSBgZW1wdHlgIG9ic2VydmFibGUgb25jZSB0aGUgc3RhY2sgaXMgZW1wdGllZC4gRG9lc1xuICAgKiBub3QgZW1pdCBpZiB0aGUgc3RhY2sgd2FzIGluaXRpYWxseSBlbXB0eS5cbiAgICovXG4gIGNsb3NlQWxsKGZvY3VzTmV4dD86IEZvY3VzTmV4dCkge1xuICAgIGlmICghdGhpcy5pc0VtcHR5KCkpIHtcbiAgICAgIHdoaWxlICghdGhpcy5pc0VtcHR5KCkpIHtcbiAgICAgICAgY29uc3QgbWVudVN0YWNrSXRlbSA9IHRoaXMuX2VsZW1lbnRzLnBvcCgpO1xuICAgICAgICBpZiAobWVudVN0YWNrSXRlbSkge1xuICAgICAgICAgIHRoaXMuX2Nsb3NlLm5leHQobWVudVN0YWNrSXRlbSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5fZW1wdHkubmV4dChmb2N1c05leHQpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBSZXR1cm4gdHJ1ZSBpZiB0aGlzIHN0YWNrIGlzIGVtcHR5LiAqL1xuICBpc0VtcHR5KCkge1xuICAgIHJldHVybiAhdGhpcy5fZWxlbWVudHMubGVuZ3RoO1xuICB9XG5cbiAgLyoqIFJldHVybiB0aGUgbGVuZ3RoIG9mIHRoZSBzdGFjay4gKi9cbiAgbGVuZ3RoKCkge1xuICAgIHJldHVybiB0aGlzLl9lbGVtZW50cy5sZW5ndGg7XG4gIH1cblxuICAvKiogR2V0IHRoZSB0b3AgbW9zdCBlbGVtZW50IG9uIHRoZSBzdGFjay4gKi9cbiAgcGVlaygpIHtcbiAgICByZXR1cm4gdGhpcy5fZWxlbWVudHNbdGhpcy5fZWxlbWVudHMubGVuZ3RoIC0gMV07XG4gIH1cbn1cbiJdfQ==