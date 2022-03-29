/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ContentChildren, Directive, EventEmitter, Output, QueryList, } from '@angular/core';
import { UniqueSelectionDispatcher } from '@angular/cdk/collections';
import { takeUntil } from 'rxjs/operators';
import { CdkMenuItemSelectable } from './menu-item-selectable';
import * as i0 from "@angular/core";
/**
 * Directive which acts as a grouping container for `CdkMenuItem` instances with
 * `role="menuitemradio"`, similar to a `role="radiogroup"` element.
 */
export class CdkMenuGroup {
    constructor() {
        /** Emits the element when checkbox or radiobutton state changed  */
        this.change = new EventEmitter();
        /** Emits when the _selectableItems QueryList triggers a change */
        this._selectableChanges = new EventEmitter();
    }
    ngAfterContentInit() {
        this._registerMenuSelectionListeners();
    }
    ngOnDestroy() {
        this._selectableChanges.next();
        this._selectableChanges.complete();
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
        selectable.toggled
            .pipe(takeUntil(this._selectableChanges))
            .subscribe(() => this.change.next(selectable));
    }
}
CdkMenuGroup.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.0.0-next.9", ngImport: i0, type: CdkMenuGroup, deps: [], target: i0.ɵɵFactoryTarget.Directive });
CdkMenuGroup.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "14.0.0-next.9", type: CdkMenuGroup, selector: "[cdkMenuGroup]", outputs: { change: "change" }, host: { attributes: { "role": "group" }, classAttribute: "cdk-menu-group" }, providers: [{ provide: UniqueSelectionDispatcher, useClass: UniqueSelectionDispatcher }], queries: [{ propertyName: "_selectableItems", predicate: CdkMenuItemSelectable, descendants: true }], exportAs: ["cdkMenuGroup"], ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.0.0-next.9", ngImport: i0, type: CdkMenuGroup, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkMenuGroup]',
                    exportAs: 'cdkMenuGroup',
                    host: {
                        'role': 'group',
                        'class': 'cdk-menu-group',
                    },
                    providers: [{ provide: UniqueSelectionDispatcher, useClass: UniqueSelectionDispatcher }],
                }]
        }], propDecorators: { change: [{
                type: Output
            }], _selectableItems: [{
                type: ContentChildren,
                args: [CdkMenuItemSelectable, { descendants: true }]
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1ncm91cC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL21lbnUvbWVudS1ncm91cC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBRUwsZUFBZSxFQUNmLFNBQVMsRUFDVCxZQUFZLEVBRVosTUFBTSxFQUNOLFNBQVMsR0FDVixNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUMseUJBQXlCLEVBQUMsTUFBTSwwQkFBMEIsQ0FBQztBQUNuRSxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDekMsT0FBTyxFQUFDLHFCQUFxQixFQUFDLE1BQU0sd0JBQXdCLENBQUM7O0FBRzdEOzs7R0FHRztBQVVILE1BQU0sT0FBTyxZQUFZO0lBVHpCO1FBVUUsb0VBQW9FO1FBQ2pELFdBQU0sR0FBOEIsSUFBSSxZQUFZLEVBQUUsQ0FBQztRQU0xRSxrRUFBa0U7UUFDakQsdUJBQWtCLEdBQXVCLElBQUksWUFBWSxFQUFFLENBQUM7S0E4QjlFO0lBNUJDLGtCQUFrQjtRQUNoQixJQUFJLENBQUMsK0JBQStCLEVBQUUsQ0FBQztJQUN6QyxDQUFDO0lBRUQsV0FBVztRQUNULElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUMvQixJQUFJLENBQUMsa0JBQWtCLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDckMsQ0FBQztJQUVEOzs7T0FHRztJQUNLLCtCQUErQjtRQUNyQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7UUFFckYsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxlQUFpRCxFQUFFLEVBQUU7WUFDNUYsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksRUFBRSxDQUFDO1lBQy9CLGVBQWUsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztRQUNqRixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCwwRUFBMEU7SUFDbEUsc0JBQXNCLENBQUMsVUFBaUM7UUFDOUQsVUFBVSxDQUFDLE9BQU87YUFDZixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO2FBQ3hDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO0lBQ25ELENBQUM7O2dIQXRDVSxZQUFZO29HQUFaLFlBQVkscUpBRlosQ0FBQyxFQUFDLE9BQU8sRUFBRSx5QkFBeUIsRUFBRSxRQUFRLEVBQUUseUJBQXlCLEVBQUMsQ0FBQywyREFPckUscUJBQXFCO2tHQUwzQixZQUFZO2tCQVR4QixTQUFTO21CQUFDO29CQUNULFFBQVEsRUFBRSxnQkFBZ0I7b0JBQzFCLFFBQVEsRUFBRSxjQUFjO29CQUN4QixJQUFJLEVBQUU7d0JBQ0osTUFBTSxFQUFFLE9BQU87d0JBQ2YsT0FBTyxFQUFFLGdCQUFnQjtxQkFDMUI7b0JBQ0QsU0FBUyxFQUFFLENBQUMsRUFBQyxPQUFPLEVBQUUseUJBQXlCLEVBQUUsUUFBUSxFQUFFLHlCQUF5QixFQUFDLENBQUM7aUJBQ3ZGOzhCQUdvQixNQUFNO3NCQUF4QixNQUFNO2dCQUlVLGdCQUFnQjtzQkFEaEMsZUFBZTt1QkFBQyxxQkFBcUIsRUFBRSxFQUFDLFdBQVcsRUFBRSxJQUFJLEVBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtcbiAgQWZ0ZXJDb250ZW50SW5pdCxcbiAgQ29udGVudENoaWxkcmVuLFxuICBEaXJlY3RpdmUsXG4gIEV2ZW50RW1pdHRlcixcbiAgT25EZXN0cm95LFxuICBPdXRwdXQsXG4gIFF1ZXJ5TGlzdCxcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge1VuaXF1ZVNlbGVjdGlvbkRpc3BhdGNoZXJ9IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2xsZWN0aW9ucyc7XG5pbXBvcnQge3Rha2VVbnRpbH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuaW1wb3J0IHtDZGtNZW51SXRlbVNlbGVjdGFibGV9IGZyb20gJy4vbWVudS1pdGVtLXNlbGVjdGFibGUnO1xuaW1wb3J0IHtDZGtNZW51SXRlbX0gZnJvbSAnLi9tZW51LWl0ZW0nO1xuXG4vKipcbiAqIERpcmVjdGl2ZSB3aGljaCBhY3RzIGFzIGEgZ3JvdXBpbmcgY29udGFpbmVyIGZvciBgQ2RrTWVudUl0ZW1gIGluc3RhbmNlcyB3aXRoXG4gKiBgcm9sZT1cIm1lbnVpdGVtcmFkaW9cImAsIHNpbWlsYXIgdG8gYSBgcm9sZT1cInJhZGlvZ3JvdXBcImAgZWxlbWVudC5cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW2Nka01lbnVHcm91cF0nLFxuICBleHBvcnRBczogJ2Nka01lbnVHcm91cCcsXG4gIGhvc3Q6IHtcbiAgICAncm9sZSc6ICdncm91cCcsXG4gICAgJ2NsYXNzJzogJ2Nkay1tZW51LWdyb3VwJyxcbiAgfSxcbiAgcHJvdmlkZXJzOiBbe3Byb3ZpZGU6IFVuaXF1ZVNlbGVjdGlvbkRpc3BhdGNoZXIsIHVzZUNsYXNzOiBVbmlxdWVTZWxlY3Rpb25EaXNwYXRjaGVyfV0sXG59KVxuZXhwb3J0IGNsYXNzIENka01lbnVHcm91cCBpbXBsZW1lbnRzIEFmdGVyQ29udGVudEluaXQsIE9uRGVzdHJveSB7XG4gIC8qKiBFbWl0cyB0aGUgZWxlbWVudCB3aGVuIGNoZWNrYm94IG9yIHJhZGlvYnV0dG9uIHN0YXRlIGNoYW5nZWQgICovXG4gIEBPdXRwdXQoKSByZWFkb25seSBjaGFuZ2U6IEV2ZW50RW1pdHRlcjxDZGtNZW51SXRlbT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG5cbiAgLyoqIExpc3Qgb2YgbWVudWl0ZW1jaGVja2JveCBvciBtZW51aXRlbXJhZGlvIGVsZW1lbnRzIHdoaWNoIHJlc2lkZSBpbiB0aGlzIGdyb3VwICovXG4gIEBDb250ZW50Q2hpbGRyZW4oQ2RrTWVudUl0ZW1TZWxlY3RhYmxlLCB7ZGVzY2VuZGFudHM6IHRydWV9KVxuICBwcml2YXRlIHJlYWRvbmx5IF9zZWxlY3RhYmxlSXRlbXM6IFF1ZXJ5TGlzdDxDZGtNZW51SXRlbVNlbGVjdGFibGU+O1xuXG4gIC8qKiBFbWl0cyB3aGVuIHRoZSBfc2VsZWN0YWJsZUl0ZW1zIFF1ZXJ5TGlzdCB0cmlnZ2VycyBhIGNoYW5nZSAqL1xuICBwcml2YXRlIHJlYWRvbmx5IF9zZWxlY3RhYmxlQ2hhbmdlczogRXZlbnRFbWl0dGVyPHZvaWQ+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4gIG5nQWZ0ZXJDb250ZW50SW5pdCgpIHtcbiAgICB0aGlzLl9yZWdpc3Rlck1lbnVTZWxlY3Rpb25MaXN0ZW5lcnMoKTtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIHRoaXMuX3NlbGVjdGFibGVDaGFuZ2VzLm5leHQoKTtcbiAgICB0aGlzLl9zZWxlY3RhYmxlQ2hhbmdlcy5jb21wbGV0ZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVyIHRoZSBjaGlsZCBzZWxlY3RhYmxlIGVsZW1lbnRzIHdpdGggdGhlIGNoYW5nZSBlbWl0dGVyIGFuZCBlbnN1cmUgYW55IG5ldyBjaGlsZFxuICAgKiBlbGVtZW50cyBkbyBzbyBhcyB3ZWxsLlxuICAgKi9cbiAgcHJpdmF0ZSBfcmVnaXN0ZXJNZW51U2VsZWN0aW9uTGlzdGVuZXJzKCkge1xuICAgIHRoaXMuX3NlbGVjdGFibGVJdGVtcy5mb3JFYWNoKHNlbGVjdGFibGUgPT4gdGhpcy5fcmVnaXN0ZXJDbGlja0xpc3RlbmVyKHNlbGVjdGFibGUpKTtcblxuICAgIHRoaXMuX3NlbGVjdGFibGVJdGVtcy5jaGFuZ2VzLnN1YnNjcmliZSgoc2VsZWN0YWJsZUl0ZW1zOiBRdWVyeUxpc3Q8Q2RrTWVudUl0ZW1TZWxlY3RhYmxlPikgPT4ge1xuICAgICAgdGhpcy5fc2VsZWN0YWJsZUNoYW5nZXMubmV4dCgpO1xuICAgICAgc2VsZWN0YWJsZUl0ZW1zLmZvckVhY2goc2VsZWN0YWJsZSA9PiB0aGlzLl9yZWdpc3RlckNsaWNrTGlzdGVuZXIoc2VsZWN0YWJsZSkpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqIFJlZ2lzdGVyIGVhY2ggc2VsZWN0YWJsZSB0byBlbWl0IG9uIHRoZSBjaGFuZ2UgRW1pdHRlciB3aGVuIGNsaWNrZWQgKi9cbiAgcHJpdmF0ZSBfcmVnaXN0ZXJDbGlja0xpc3RlbmVyKHNlbGVjdGFibGU6IENka01lbnVJdGVtU2VsZWN0YWJsZSkge1xuICAgIHNlbGVjdGFibGUudG9nZ2xlZFxuICAgICAgLnBpcGUodGFrZVVudGlsKHRoaXMuX3NlbGVjdGFibGVDaGFuZ2VzKSlcbiAgICAgIC5zdWJzY3JpYmUoKCkgPT4gdGhpcy5jaGFuZ2UubmV4dChzZWxlY3RhYmxlKSk7XG4gIH1cbn1cbiJdfQ==