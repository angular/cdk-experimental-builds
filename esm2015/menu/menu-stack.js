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
        this.close = this._close;
        /**
         * Observable which emits when the MenuStack is empty after popping off the last element. It
         * emits a FocusNext event which specifies the action the closer has requested the listener
         * perform.
         */
        this.empty = this._empty;
    }
    /** @param menu the MenuStackItem to put on the stack. */
    push(menu) {
        this._elements.push(menu);
    }
    /**
     *  Pop off the top most MenuStackItem and emit it on the close observable.
     *  @param focusNext the event to emit on the `empty` observable if the method call resulted in an
     *  empty stack. Does not emit if the stack was initially empty.
     */
    closeLatest(focusNext) {
        const menuStackItem = this._elements.pop();
        if (menuStackItem) {
            this._close.next(menuStackItem);
            if (this._elements.length === 0) {
                this._empty.next(focusNext);
            }
        }
    }
    /**
     * Pop off all MenuStackItems and emit each one on the `close` observable one by one.
     * @param focusNext the event to emit on the `empty` observable once the stack is emptied. Does
     * not emit if the stack was initially empty.
     */
    closeAll(focusNext) {
        if (this._elements.length) {
            while (this._elements.length) {
                const menuStackItem = this._elements.pop();
                if (menuStackItem) {
                    this._close.next(menuStackItem);
                }
            }
            this._empty.next(focusNext);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL21lbnUvbWVudS1zdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsT0FBTyxFQUFhLE1BQU0sTUFBTSxDQUFDO0FBaUJ6Qzs7Ozs7R0FLRztBQUNILE1BQU0sT0FBTyxTQUFTO0lBQXRCO1FBQ0Usb0RBQW9EO1FBQ25DLGNBQVMsR0FBb0IsRUFBRSxDQUFDO1FBRWpELHNGQUFzRjtRQUNyRSxXQUFNLEdBQTJCLElBQUksT0FBTyxFQUFFLENBQUM7UUFFaEUsNEVBQTRFO1FBQzNELFdBQU0sR0FBdUIsSUFBSSxPQUFPLEVBQUUsQ0FBQztRQUU1RCxrRkFBa0Y7UUFDekUsVUFBSyxHQUE4QixJQUFJLENBQUMsTUFBTSxDQUFDO1FBRXhEOzs7O1dBSUc7UUFDTSxVQUFLLEdBQTBCLElBQUksQ0FBQyxNQUFNLENBQUM7SUF1Q3RELENBQUM7SUFyQ0MseURBQXlEO0lBQ3pELElBQUksQ0FBQyxJQUFtQjtRQUN0QixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM1QixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILFdBQVcsQ0FBQyxTQUFxQjtRQUMvQixNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQzNDLElBQUksYUFBYSxFQUFFO1lBQ2pCLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQ2hDLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUMvQixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQzthQUM3QjtTQUNGO0lBQ0gsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxRQUFRLENBQUMsU0FBcUI7UUFDNUIsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRTtZQUN6QixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFO2dCQUM1QixNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDO2dCQUMzQyxJQUFJLGFBQWEsRUFBRTtvQkFDakIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7aUJBQ2pDO2FBQ0Y7WUFFRCxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztTQUM3QjtJQUNILENBQUM7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1N1YmplY3QsIE9ic2VydmFibGV9IGZyb20gJ3J4anMnO1xuXG4vKiogRXZlbnRzIHRvIGVtaXQgYXMgc3BlY2lmaWVkIGJ5IHRoZSBjYWxsZXIgb25jZSB0aGUgTWVudVN0YWNrIGlzIGVtcHR5LiAqL1xuZXhwb3J0IGNvbnN0IGVudW0gRm9jdXNOZXh0IHtcbiAgbmV4dEl0ZW0sXG4gIHByZXZpb3VzSXRlbSxcbiAgY3VycmVudEl0ZW0sXG59XG5cbi8qKlxuICogSW50ZXJmYWNlIGZvciB0aGUgZWxlbWVudHMgdHJhY2tlZCBpbiB0aGUgTWVudVN0YWNrLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIE1lbnVTdGFja0l0ZW0ge1xuICAvKiogQSByZWZlcmVuY2UgdG8gdGhlIHByZXZpb3VzIE1lbnVzIE1lbnVTdGFjayBpbnN0YW5jZS4gKi9cbiAgX21lbnVTdGFjazogTWVudVN0YWNrO1xufVxuXG4vKipcbiAqIE1lbnVTdGFjayBhbGxvd3Mgc3Vic2NyaWJlcnMgdG8gbGlzdGVuIGZvciBjbG9zZSBldmVudHMgKHdoZW4gYSBNZW51U3RhY2tJdGVtIGlzIHBvcHBlZCBvZmZcbiAqIG9mIHRoZSBzdGFjaykgaW4gb3JkZXIgdG8gcGVyZm9ybSBjbG9zaW5nIGFjdGlvbnMuIFVwb24gdGhlIE1lbnVTdGFjayBiZWluZyBlbXB0eSBpdCBlbWl0c1xuICogZnJvbSB0aGUgYGVtcHR5YCBvYnNlcnZhYmxlIHNwZWNpZnlpbmcgdGhlIG5leHQgZm9jdXMgYWN0aW9uIHdoaWNoIHRoZSBsaXN0ZW5lciBzaG91bGQgcGVyZm9ybVxuICogYXMgcmVxdWVzdGVkIGJ5IHRoZSBjbG9zZXIuXG4gKi9cbmV4cG9ydCBjbGFzcyBNZW51U3RhY2sge1xuICAvKiogQWxsIE1lbnVTdGFja0l0ZW1zIHRyYWNrZWQgYnkgdGhpcyBNZW51U3RhY2suICovXG4gIHByaXZhdGUgcmVhZG9ubHkgX2VsZW1lbnRzOiBNZW51U3RhY2tJdGVtW10gPSBbXTtcblxuICAvKiogRW1pdHMgdGhlIGVsZW1lbnQgd2hpY2ggd2FzIHBvcHBlZCBvZmYgb2YgdGhlIHN0YWNrIHdoZW4gcmVxdWVzdGVkIGJ5IGEgY2xvc2VyLiAqL1xuICBwcml2YXRlIHJlYWRvbmx5IF9jbG9zZTogU3ViamVjdDxNZW51U3RhY2tJdGVtPiA9IG5ldyBTdWJqZWN0KCk7XG5cbiAgLyoqIEVtaXRzIG9uY2UgdGhlIE1lbnVTdGFjayBoYXMgYmVjb21lIGVtcHR5IGFmdGVyIHBvcHBpbmcgb2ZmIGVsZW1lbnRzLiAqL1xuICBwcml2YXRlIHJlYWRvbmx5IF9lbXB0eTogU3ViamVjdDxGb2N1c05leHQ+ID0gbmV3IFN1YmplY3QoKTtcblxuICAvKiogT2JzZXJ2YWJsZSB3aGljaCBlbWl0cyB0aGUgTWVudVN0YWNrSXRlbSB3aGljaCBoYXMgYmVlbiByZXF1ZXN0ZWQgdG8gY2xvc2UuICovXG4gIHJlYWRvbmx5IGNsb3NlOiBPYnNlcnZhYmxlPE1lbnVTdGFja0l0ZW0+ID0gdGhpcy5fY2xvc2U7XG5cbiAgLyoqXG4gICAqIE9ic2VydmFibGUgd2hpY2ggZW1pdHMgd2hlbiB0aGUgTWVudVN0YWNrIGlzIGVtcHR5IGFmdGVyIHBvcHBpbmcgb2ZmIHRoZSBsYXN0IGVsZW1lbnQuIEl0XG4gICAqIGVtaXRzIGEgRm9jdXNOZXh0IGV2ZW50IHdoaWNoIHNwZWNpZmllcyB0aGUgYWN0aW9uIHRoZSBjbG9zZXIgaGFzIHJlcXVlc3RlZCB0aGUgbGlzdGVuZXJcbiAgICogcGVyZm9ybS5cbiAgICovXG4gIHJlYWRvbmx5IGVtcHR5OiBPYnNlcnZhYmxlPEZvY3VzTmV4dD4gPSB0aGlzLl9lbXB0eTtcblxuICAvKiogQHBhcmFtIG1lbnUgdGhlIE1lbnVTdGFja0l0ZW0gdG8gcHV0IG9uIHRoZSBzdGFjay4gKi9cbiAgcHVzaChtZW51OiBNZW51U3RhY2tJdGVtKSB7XG4gICAgdGhpcy5fZWxlbWVudHMucHVzaChtZW51KTtcbiAgfVxuXG4gIC8qKlxuICAgKiAgUG9wIG9mZiB0aGUgdG9wIG1vc3QgTWVudVN0YWNrSXRlbSBhbmQgZW1pdCBpdCBvbiB0aGUgY2xvc2Ugb2JzZXJ2YWJsZS5cbiAgICogIEBwYXJhbSBmb2N1c05leHQgdGhlIGV2ZW50IHRvIGVtaXQgb24gdGhlIGBlbXB0eWAgb2JzZXJ2YWJsZSBpZiB0aGUgbWV0aG9kIGNhbGwgcmVzdWx0ZWQgaW4gYW5cbiAgICogIGVtcHR5IHN0YWNrLiBEb2VzIG5vdCBlbWl0IGlmIHRoZSBzdGFjayB3YXMgaW5pdGlhbGx5IGVtcHR5LlxuICAgKi9cbiAgY2xvc2VMYXRlc3QoZm9jdXNOZXh0PzogRm9jdXNOZXh0KSB7XG4gICAgY29uc3QgbWVudVN0YWNrSXRlbSA9IHRoaXMuX2VsZW1lbnRzLnBvcCgpO1xuICAgIGlmIChtZW51U3RhY2tJdGVtKSB7XG4gICAgICB0aGlzLl9jbG9zZS5uZXh0KG1lbnVTdGFja0l0ZW0pO1xuICAgICAgaWYgKHRoaXMuX2VsZW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICB0aGlzLl9lbXB0eS5uZXh0KGZvY3VzTmV4dCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFBvcCBvZmYgYWxsIE1lbnVTdGFja0l0ZW1zIGFuZCBlbWl0IGVhY2ggb25lIG9uIHRoZSBgY2xvc2VgIG9ic2VydmFibGUgb25lIGJ5IG9uZS5cbiAgICogQHBhcmFtIGZvY3VzTmV4dCB0aGUgZXZlbnQgdG8gZW1pdCBvbiB0aGUgYGVtcHR5YCBvYnNlcnZhYmxlIG9uY2UgdGhlIHN0YWNrIGlzIGVtcHRpZWQuIERvZXNcbiAgICogbm90IGVtaXQgaWYgdGhlIHN0YWNrIHdhcyBpbml0aWFsbHkgZW1wdHkuXG4gICAqL1xuICBjbG9zZUFsbChmb2N1c05leHQ/OiBGb2N1c05leHQpIHtcbiAgICBpZiAodGhpcy5fZWxlbWVudHMubGVuZ3RoKSB7XG4gICAgICB3aGlsZSAodGhpcy5fZWxlbWVudHMubGVuZ3RoKSB7XG4gICAgICAgIGNvbnN0IG1lbnVTdGFja0l0ZW0gPSB0aGlzLl9lbGVtZW50cy5wb3AoKTtcbiAgICAgICAgaWYgKG1lbnVTdGFja0l0ZW0pIHtcbiAgICAgICAgICB0aGlzLl9jbG9zZS5uZXh0KG1lbnVTdGFja0l0ZW0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX2VtcHR5Lm5leHQoZm9jdXNOZXh0KTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==