/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, Output, EventEmitter, ContentChildren, QueryList, } from '@angular/core';
import { UniqueSelectionDispatcher } from '@angular/cdk/collections';
import { takeUntil } from 'rxjs/operators';
import { CdkMenuItemSelectable } from './menu-item-selectable';
/**
 * Directive which acts as a grouping container for `CdkMenuItem` instances with
 * `role="menuitemradio"`, similar to a `role="radiogroup"` element.
 */
let CdkMenuGroup = /** @class */ (() => {
    class CdkMenuGroup {
        constructor() {
            /** Emits the element when checkbox or radiobutton state changed  */
            this.change = new EventEmitter();
            /** Emits when the _selectableItems QueryList triggers a change */
            this._selectableChanges = new EventEmitter();
        }
        ngAfterContentInit() {
            this._registerMenuSelectionListeners();
        }
        /**
         * Register the child selectable elements with the change emitter and ensure any new child
         * elements do so as well.
         */
        _registerMenuSelectionListeners() {
            this._selectableItems.forEach(selectable => this._registerClickListener(selectable));
            this._selectableItems.changes.subscribe((selectableItems) => {
                this._selectableChanges.next();
                selectableItems.forEach(selectable => this._registerClickListener(selectable));
            });
        }
        /** Register each selectable to emit on the change Emitter when clicked */
        _registerClickListener(selectable) {
            selectable.clicked
                .pipe(takeUntil(this._selectableChanges))
                .subscribe(() => this.change.next(selectable));
        }
        ngOnDestroy() {
            this._selectableChanges.next();
            this._selectableChanges.complete();
        }
    }
    CdkMenuGroup.decorators = [
        { type: Directive, args: [{
                    selector: '[cdkMenuGroup]',
                    exportAs: 'cdkMenuGroup',
                    host: {
                        'role': 'group',
                    },
                    providers: [{ provide: UniqueSelectionDispatcher, useClass: UniqueSelectionDispatcher }],
                },] }
    ];
    CdkMenuGroup.propDecorators = {
        change: [{ type: Output }],
        _selectableItems: [{ type: ContentChildren, args: [CdkMenuItemSelectable, { descendants: true },] }]
    };
    return CdkMenuGroup;
})();
export { CdkMenuGroup };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1ncm91cC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL21lbnUvbWVudS1ncm91cC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQ0wsU0FBUyxFQUNULE1BQU0sRUFDTixZQUFZLEVBQ1osZUFBZSxFQUVmLFNBQVMsR0FFVixNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUMseUJBQXlCLEVBQUMsTUFBTSwwQkFBMEIsQ0FBQztBQUNuRSxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDekMsT0FBTyxFQUFDLHFCQUFxQixFQUFDLE1BQU0sd0JBQXdCLENBQUM7QUFHN0Q7OztHQUdHO0FBQ0g7SUFBQSxNQVFhLFlBQVk7UUFSekI7WUFTRSxvRUFBb0U7WUFDakQsV0FBTSxHQUE4QixJQUFJLFlBQVksRUFBRSxDQUFDO1lBTTFFLGtFQUFrRTtZQUNqRCx1QkFBa0IsR0FBdUIsSUFBSSxZQUFZLEVBQUUsQ0FBQztRQThCL0UsQ0FBQztRQTVCQyxrQkFBa0I7WUFDaEIsSUFBSSxDQUFDLCtCQUErQixFQUFFLENBQUM7UUFDekMsQ0FBQztRQUVEOzs7V0FHRztRQUNLLCtCQUErQjtZQUNyQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7WUFFckYsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxlQUFpRCxFQUFFLEVBQUU7Z0JBQzVGLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDL0IsZUFBZSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1lBQ2pGLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztRQUVELDBFQUEwRTtRQUNsRSxzQkFBc0IsQ0FBQyxVQUFpQztZQUM5RCxVQUFVLENBQUMsT0FBTztpQkFDZixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO2lCQUN4QyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztRQUNuRCxDQUFDO1FBRUQsV0FBVztZQUNULElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUMvQixJQUFJLENBQUMsa0JBQWtCLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDckMsQ0FBQzs7O2dCQTlDRixTQUFTLFNBQUM7b0JBQ1QsUUFBUSxFQUFFLGdCQUFnQjtvQkFDMUIsUUFBUSxFQUFFLGNBQWM7b0JBQ3hCLElBQUksRUFBRTt3QkFDSixNQUFNLEVBQUUsT0FBTztxQkFDaEI7b0JBQ0QsU0FBUyxFQUFFLENBQUMsRUFBQyxPQUFPLEVBQUUseUJBQXlCLEVBQUUsUUFBUSxFQUFFLHlCQUF5QixFQUFDLENBQUM7aUJBQ3ZGOzs7eUJBR0UsTUFBTTttQ0FHTixlQUFlLFNBQUMscUJBQXFCLEVBQUUsRUFBQyxXQUFXLEVBQUUsSUFBSSxFQUFDOztJQWtDN0QsbUJBQUM7S0FBQTtTQXZDWSxZQUFZIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7XG4gIERpcmVjdGl2ZSxcbiAgT3V0cHV0LFxuICBFdmVudEVtaXR0ZXIsXG4gIENvbnRlbnRDaGlsZHJlbixcbiAgQWZ0ZXJDb250ZW50SW5pdCxcbiAgUXVlcnlMaXN0LFxuICBPbkRlc3Ryb3ksXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtVbmlxdWVTZWxlY3Rpb25EaXNwYXRjaGVyfSBmcm9tICdAYW5ndWxhci9jZGsvY29sbGVjdGlvbnMnO1xuaW1wb3J0IHt0YWtlVW50aWx9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7Q2RrTWVudUl0ZW1TZWxlY3RhYmxlfSBmcm9tICcuL21lbnUtaXRlbS1zZWxlY3RhYmxlJztcbmltcG9ydCB7Q2RrTWVudUl0ZW19IGZyb20gJy4vbWVudS1pdGVtJztcblxuLyoqXG4gKiBEaXJlY3RpdmUgd2hpY2ggYWN0cyBhcyBhIGdyb3VwaW5nIGNvbnRhaW5lciBmb3IgYENka01lbnVJdGVtYCBpbnN0YW5jZXMgd2l0aFxuICogYHJvbGU9XCJtZW51aXRlbXJhZGlvXCJgLCBzaW1pbGFyIHRvIGEgYHJvbGU9XCJyYWRpb2dyb3VwXCJgIGVsZW1lbnQuXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tjZGtNZW51R3JvdXBdJyxcbiAgZXhwb3J0QXM6ICdjZGtNZW51R3JvdXAnLFxuICBob3N0OiB7XG4gICAgJ3JvbGUnOiAnZ3JvdXAnLFxuICB9LFxuICBwcm92aWRlcnM6IFt7cHJvdmlkZTogVW5pcXVlU2VsZWN0aW9uRGlzcGF0Y2hlciwgdXNlQ2xhc3M6IFVuaXF1ZVNlbGVjdGlvbkRpc3BhdGNoZXJ9XSxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrTWVudUdyb3VwIGltcGxlbWVudHMgQWZ0ZXJDb250ZW50SW5pdCwgT25EZXN0cm95IHtcbiAgLyoqIEVtaXRzIHRoZSBlbGVtZW50IHdoZW4gY2hlY2tib3ggb3IgcmFkaW9idXR0b24gc3RhdGUgY2hhbmdlZCAgKi9cbiAgQE91dHB1dCgpIHJlYWRvbmx5IGNoYW5nZTogRXZlbnRFbWl0dGVyPENka01lbnVJdGVtPiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuICAvKiogTGlzdCBvZiBtZW51aXRlbWNoZWNrYm94IG9yIG1lbnVpdGVtcmFkaW8gZWxlbWVudHMgd2hpY2ggcmVzaWRlIGluIHRoaXMgZ3JvdXAgKi9cbiAgQENvbnRlbnRDaGlsZHJlbihDZGtNZW51SXRlbVNlbGVjdGFibGUsIHtkZXNjZW5kYW50czogdHJ1ZX0pXG4gIHByaXZhdGUgcmVhZG9ubHkgX3NlbGVjdGFibGVJdGVtczogUXVlcnlMaXN0PENka01lbnVJdGVtU2VsZWN0YWJsZT47XG5cbiAgLyoqIEVtaXRzIHdoZW4gdGhlIF9zZWxlY3RhYmxlSXRlbXMgUXVlcnlMaXN0IHRyaWdnZXJzIGEgY2hhbmdlICovXG4gIHByaXZhdGUgcmVhZG9ubHkgX3NlbGVjdGFibGVDaGFuZ2VzOiBFdmVudEVtaXR0ZXI8dm9pZD4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG5cbiAgbmdBZnRlckNvbnRlbnRJbml0KCkge1xuICAgIHRoaXMuX3JlZ2lzdGVyTWVudVNlbGVjdGlvbkxpc3RlbmVycygpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVyIHRoZSBjaGlsZCBzZWxlY3RhYmxlIGVsZW1lbnRzIHdpdGggdGhlIGNoYW5nZSBlbWl0dGVyIGFuZCBlbnN1cmUgYW55IG5ldyBjaGlsZFxuICAgKiBlbGVtZW50cyBkbyBzbyBhcyB3ZWxsLlxuICAgKi9cbiAgcHJpdmF0ZSBfcmVnaXN0ZXJNZW51U2VsZWN0aW9uTGlzdGVuZXJzKCkge1xuICAgIHRoaXMuX3NlbGVjdGFibGVJdGVtcy5mb3JFYWNoKHNlbGVjdGFibGUgPT4gdGhpcy5fcmVnaXN0ZXJDbGlja0xpc3RlbmVyKHNlbGVjdGFibGUpKTtcblxuICAgIHRoaXMuX3NlbGVjdGFibGVJdGVtcy5jaGFuZ2VzLnN1YnNjcmliZSgoc2VsZWN0YWJsZUl0ZW1zOiBRdWVyeUxpc3Q8Q2RrTWVudUl0ZW1TZWxlY3RhYmxlPikgPT4ge1xuICAgICAgdGhpcy5fc2VsZWN0YWJsZUNoYW5nZXMubmV4dCgpO1xuICAgICAgc2VsZWN0YWJsZUl0ZW1zLmZvckVhY2goc2VsZWN0YWJsZSA9PiB0aGlzLl9yZWdpc3RlckNsaWNrTGlzdGVuZXIoc2VsZWN0YWJsZSkpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqIFJlZ2lzdGVyIGVhY2ggc2VsZWN0YWJsZSB0byBlbWl0IG9uIHRoZSBjaGFuZ2UgRW1pdHRlciB3aGVuIGNsaWNrZWQgKi9cbiAgcHJpdmF0ZSBfcmVnaXN0ZXJDbGlja0xpc3RlbmVyKHNlbGVjdGFibGU6IENka01lbnVJdGVtU2VsZWN0YWJsZSkge1xuICAgIHNlbGVjdGFibGUuY2xpY2tlZFxuICAgICAgLnBpcGUodGFrZVVudGlsKHRoaXMuX3NlbGVjdGFibGVDaGFuZ2VzKSlcbiAgICAgIC5zdWJzY3JpYmUoKCkgPT4gdGhpcy5jaGFuZ2UubmV4dChzZWxlY3RhYmxlKSk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICB0aGlzLl9zZWxlY3RhYmxlQ2hhbmdlcy5uZXh0KCk7XG4gICAgdGhpcy5fc2VsZWN0YWJsZUNoYW5nZXMuY29tcGxldGUoKTtcbiAgfVxufVxuIl19