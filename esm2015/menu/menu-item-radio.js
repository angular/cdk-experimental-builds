/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { UniqueSelectionDispatcher } from '@angular/cdk/collections';
import { Directive } from '@angular/core';
import { CdkMenuItemSelectable } from './menu-item-selectable';
/**
 * A directive providing behavior for the the "menuitemradio" ARIA role, which behaves similarly to
 * a conventional radio-button. Any sibling `CdkMenuItemRadio` instances within the same `CdkMenu`
 * or `CdkMenuGroup` comprise a radio group with unique selection enforced.
 */
export class CdkMenuItemRadio extends CdkMenuItemSelectable {
    constructor(_selectionDispatcher) {
        super();
        this._selectionDispatcher = _selectionDispatcher;
        this._registerDispatcherListener();
    }
    /** Configure the unique selection dispatcher listener in order to toggle the checked state  */
    _registerDispatcherListener() {
        this._removeDispatcherListener = this._selectionDispatcher.listen((id, name) => (this.checked = this.id === id && this.name === name));
    }
    /** Toggles the checked state of the radio-button. */
    trigger() {
        super.trigger();
        if (!this.disabled) {
            this._selectionDispatcher.notify(this.id, this.name);
        }
    }
    ngOnDestroy() {
        this._removeDispatcherListener();
    }
}
CdkMenuItemRadio.decorators = [
    { type: Directive, args: [{
                selector: '[cdkMenuItemRadio]',
                exportAs: 'cdkMenuItemRadio',
                host: {
                    '(click)': 'trigger()',
                    'type': 'button',
                    'role': 'menuitemradio',
                    '[attr.aria-checked]': 'checked || null',
                    '[attr.aria-disabled]': 'disabled || null',
                },
                providers: [{ provide: CdkMenuItemSelectable, useExisting: CdkMenuItemRadio }],
            },] }
];
CdkMenuItemRadio.ctorParameters = () => [
    { type: UniqueSelectionDispatcher }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1pdGVtLXJhZGlvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay1leHBlcmltZW50YWwvbWVudS9tZW51LWl0ZW0tcmFkaW8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBQ0gsT0FBTyxFQUFDLHlCQUF5QixFQUFDLE1BQU0sMEJBQTBCLENBQUM7QUFDbkUsT0FBTyxFQUFDLFNBQVMsRUFBWSxNQUFNLGVBQWUsQ0FBQztBQUNuRCxPQUFPLEVBQUMscUJBQXFCLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQztBQUU3RDs7OztHQUlHO0FBYUgsTUFBTSxPQUFPLGdCQUFpQixTQUFRLHFCQUFxQjtJQUl6RCxZQUE2QixvQkFBK0M7UUFDMUUsS0FBSyxFQUFFLENBQUM7UUFEbUIseUJBQW9CLEdBQXBCLG9CQUFvQixDQUEyQjtRQUcxRSxJQUFJLENBQUMsMkJBQTJCLEVBQUUsQ0FBQztJQUNyQyxDQUFDO0lBRUQsK0ZBQStGO0lBQ3ZGLDJCQUEyQjtRQUNqQyxJQUFJLENBQUMseUJBQXlCLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLE1BQU0sQ0FDL0QsQ0FBQyxFQUFVLEVBQUUsSUFBWSxFQUFFLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxJQUFJLENBQUMsQ0FDcEYsQ0FBQztJQUNKLENBQUM7SUFFRCxxREFBcUQ7SUFDckQsT0FBTztRQUNMLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUVoQixJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNsQixJQUFJLENBQUMsb0JBQW9CLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3REO0lBQ0gsQ0FBQztJQUVELFdBQVc7UUFDVCxJQUFJLENBQUMseUJBQXlCLEVBQUUsQ0FBQztJQUNuQyxDQUFDOzs7WUF4Q0YsU0FBUyxTQUFDO2dCQUNULFFBQVEsRUFBRSxvQkFBb0I7Z0JBQzlCLFFBQVEsRUFBRSxrQkFBa0I7Z0JBQzVCLElBQUksRUFBRTtvQkFDSixTQUFTLEVBQUUsV0FBVztvQkFDdEIsTUFBTSxFQUFFLFFBQVE7b0JBQ2hCLE1BQU0sRUFBRSxlQUFlO29CQUN2QixxQkFBcUIsRUFBRSxpQkFBaUI7b0JBQ3hDLHNCQUFzQixFQUFFLGtCQUFrQjtpQkFDM0M7Z0JBQ0QsU0FBUyxFQUFFLENBQUMsRUFBQyxPQUFPLEVBQUUscUJBQXFCLEVBQUUsV0FBVyxFQUFFLGdCQUFnQixFQUFDLENBQUM7YUFDN0U7OztZQXBCTyx5QkFBeUIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7VW5pcXVlU2VsZWN0aW9uRGlzcGF0Y2hlcn0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvbGxlY3Rpb25zJztcbmltcG9ydCB7RGlyZWN0aXZlLCBPbkRlc3Ryb3l9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtDZGtNZW51SXRlbVNlbGVjdGFibGV9IGZyb20gJy4vbWVudS1pdGVtLXNlbGVjdGFibGUnO1xuXG4vKipcbiAqIEEgZGlyZWN0aXZlIHByb3ZpZGluZyBiZWhhdmlvciBmb3IgdGhlIHRoZSBcIm1lbnVpdGVtcmFkaW9cIiBBUklBIHJvbGUsIHdoaWNoIGJlaGF2ZXMgc2ltaWxhcmx5IHRvXG4gKiBhIGNvbnZlbnRpb25hbCByYWRpby1idXR0b24uIEFueSBzaWJsaW5nIGBDZGtNZW51SXRlbVJhZGlvYCBpbnN0YW5jZXMgd2l0aGluIHRoZSBzYW1lIGBDZGtNZW51YFxuICogb3IgYENka01lbnVHcm91cGAgY29tcHJpc2UgYSByYWRpbyBncm91cCB3aXRoIHVuaXF1ZSBzZWxlY3Rpb24gZW5mb3JjZWQuXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tjZGtNZW51SXRlbVJhZGlvXScsXG4gIGV4cG9ydEFzOiAnY2RrTWVudUl0ZW1SYWRpbycsXG4gIGhvc3Q6IHtcbiAgICAnKGNsaWNrKSc6ICd0cmlnZ2VyKCknLFxuICAgICd0eXBlJzogJ2J1dHRvbicsXG4gICAgJ3JvbGUnOiAnbWVudWl0ZW1yYWRpbycsXG4gICAgJ1thdHRyLmFyaWEtY2hlY2tlZF0nOiAnY2hlY2tlZCB8fCBudWxsJyxcbiAgICAnW2F0dHIuYXJpYS1kaXNhYmxlZF0nOiAnZGlzYWJsZWQgfHwgbnVsbCcsXG4gIH0sXG4gIHByb3ZpZGVyczogW3twcm92aWRlOiBDZGtNZW51SXRlbVNlbGVjdGFibGUsIHVzZUV4aXN0aW5nOiBDZGtNZW51SXRlbVJhZGlvfV0sXG59KVxuZXhwb3J0IGNsYXNzIENka01lbnVJdGVtUmFkaW8gZXh0ZW5kcyBDZGtNZW51SXRlbVNlbGVjdGFibGUgaW1wbGVtZW50cyBPbkRlc3Ryb3kge1xuICAvKiogRnVuY3Rpb24gdG8gdW5yZWdpc3RlciB0aGUgc2VsZWN0aW9uIGRpc3BhdGNoZXIgKi9cbiAgcHJpdmF0ZSBfcmVtb3ZlRGlzcGF0Y2hlckxpc3RlbmVyOiAoKSA9PiB2b2lkO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgX3NlbGVjdGlvbkRpc3BhdGNoZXI6IFVuaXF1ZVNlbGVjdGlvbkRpc3BhdGNoZXIpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5fcmVnaXN0ZXJEaXNwYXRjaGVyTGlzdGVuZXIoKTtcbiAgfVxuXG4gIC8qKiBDb25maWd1cmUgdGhlIHVuaXF1ZSBzZWxlY3Rpb24gZGlzcGF0Y2hlciBsaXN0ZW5lciBpbiBvcmRlciB0byB0b2dnbGUgdGhlIGNoZWNrZWQgc3RhdGUgICovXG4gIHByaXZhdGUgX3JlZ2lzdGVyRGlzcGF0Y2hlckxpc3RlbmVyKCkge1xuICAgIHRoaXMuX3JlbW92ZURpc3BhdGNoZXJMaXN0ZW5lciA9IHRoaXMuX3NlbGVjdGlvbkRpc3BhdGNoZXIubGlzdGVuKFxuICAgICAgKGlkOiBzdHJpbmcsIG5hbWU6IHN0cmluZykgPT4gKHRoaXMuY2hlY2tlZCA9IHRoaXMuaWQgPT09IGlkICYmIHRoaXMubmFtZSA9PT0gbmFtZSlcbiAgICApO1xuICB9XG5cbiAgLyoqIFRvZ2dsZXMgdGhlIGNoZWNrZWQgc3RhdGUgb2YgdGhlIHJhZGlvLWJ1dHRvbi4gKi9cbiAgdHJpZ2dlcigpIHtcbiAgICBzdXBlci50cmlnZ2VyKCk7XG5cbiAgICBpZiAoIXRoaXMuZGlzYWJsZWQpIHtcbiAgICAgIHRoaXMuX3NlbGVjdGlvbkRpc3BhdGNoZXIubm90aWZ5KHRoaXMuaWQsIHRoaXMubmFtZSk7XG4gICAgfVxuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgdGhpcy5fcmVtb3ZlRGlzcGF0Y2hlckxpc3RlbmVyKCk7XG4gIH1cbn1cbiJdfQ==