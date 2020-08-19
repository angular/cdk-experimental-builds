/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ESCAPE, hasModifierKey } from '@angular/cdk/keycodes';
import { map, filter } from 'rxjs/operators';
/** Unique id for the created dialog. */
let uniqueId = 0;
/**
 * Reference to a dialog opened via the Dialog service.
 */
export class DialogRef {
    constructor(_overlayRef, _containerInstance, id = `dialog-${uniqueId++}`) {
        this._overlayRef = _overlayRef;
        this._containerInstance = _containerInstance;
        this.id = id;
        // If the dialog has a backdrop, handle clicks from the backdrop.
        if (_containerInstance._config.hasBackdrop) {
            _overlayRef.backdropClick().subscribe(() => {
                if (!this.disableClose) {
                    this.close();
                }
            });
        }
        this.beforeClosed().subscribe(() => {
            this._overlayRef.detachBackdrop();
        });
        this.afterClosed().subscribe(() => {
            this._overlayRef.detach();
            this._overlayRef.dispose();
            this.componentInstance = null;
        });
        // Close when escape keydown event occurs
        _overlayRef.keydownEvents()
            .pipe(filter(event => {
            return event.keyCode === ESCAPE && !this.disableClose && !hasModifierKey(event);
        }))
            .subscribe(event => {
            event.preventDefault();
            this.close();
        });
    }
    /** Gets an observable that emits when the overlay's backdrop has been clicked. */
    backdropClick() {
        return this._overlayRef.backdropClick();
    }
    /**
     * Close the dialog.
     * @param dialogResult Optional result to return to the dialog opener.
     */
    close(dialogResult) {
        this._result = dialogResult;
        this._containerInstance._startExiting();
    }
    /**
     * Updates the dialog's position.
     * @param position New dialog position.
     */
    updatePosition(position) {
        let strategy = this._getPositionStrategy();
        if (position && (position.left || position.right)) {
            position.left ? strategy.left(position.left) : strategy.right(position.right);
        }
        else {
            strategy.centerHorizontally();
        }
        if (position && (position.top || position.bottom)) {
            position.top ? strategy.top(position.top) : strategy.bottom(position.bottom);
        }
        else {
            strategy.centerVertically();
        }
        this._overlayRef.updatePosition();
        return this;
    }
    /**
     * Gets an observable that emits when keydown events are targeted on the overlay.
     */
    keydownEvents() {
        return this._overlayRef.keydownEvents();
    }
    /**
     * Updates the dialog's width and height, defined, min and max.
     * @param size New size for the overlay.
     */
    updateSize(size) {
        if (size.width) {
            this._getPositionStrategy().width(size.width.toString());
        }
        if (size.height) {
            this._getPositionStrategy().height(size.height.toString());
        }
        this._overlayRef.updateSize(size);
        this._overlayRef.updatePosition();
        return this;
    }
    /** Fetches the position strategy object from the overlay ref. */
    _getPositionStrategy() {
        return this._overlayRef.getConfig().positionStrategy;
    }
    /** Gets an observable that emits when dialog begins opening. */
    beforeOpened() {
        return this._containerInstance._beforeEnter;
    }
    /** Gets an observable that emits when dialog is finished opening. */
    afterOpened() {
        return this._containerInstance._afterEnter;
    }
    /** Gets an observable that emits when dialog begins closing. */
    beforeClosed() {
        return this._containerInstance._beforeExit.pipe(map(() => this._result));
    }
    /** Gets an observable that emits when dialog is finished closing. */
    afterClosed() {
        return this._containerInstance._afterExit.pipe(map(() => this._result));
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhbG9nLXJlZi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL2RpYWxvZy9kaWFsb2ctcmVmLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUlILE9BQU8sRUFBQyxNQUFNLEVBQUUsY0FBYyxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFFN0QsT0FBTyxFQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUkzQyx3Q0FBd0M7QUFDeEMsSUFBSSxRQUFRLEdBQUcsQ0FBQyxDQUFDO0FBRWpCOztHQUVHO0FBQ0gsTUFBTSxPQUFPLFNBQVM7SUFVcEIsWUFDUyxXQUF1QixFQUNwQixrQkFBc0MsRUFDdkMsS0FBYSxVQUFVLFFBQVEsRUFBRSxFQUFFO1FBRnJDLGdCQUFXLEdBQVgsV0FBVyxDQUFZO1FBQ3BCLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBb0I7UUFDdkMsT0FBRSxHQUFGLEVBQUUsQ0FBaUM7UUFFNUMsaUVBQWlFO1FBQ2pFLElBQUksa0JBQWtCLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRTtZQUMxQyxXQUFXLENBQUMsYUFBYSxFQUFFLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRTtnQkFDekMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUU7b0JBQ3RCLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztpQkFDZDtZQUNILENBQUMsQ0FBQyxDQUFDO1NBQ0o7UUFFRCxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRTtZQUNqQyxJQUFJLENBQUMsV0FBVyxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQ3BDLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUU7WUFDaEMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsQ0FB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V0FBVyxDQUFDLFNBQVMsRUFBRSxDQUFDLGdCQUEwQyxDQUFDO0lBQ2pGLENBQUM7SUFFRCxnRUFBZ0U7SUFDaEUsWUFBWTtRQUNWLE9BQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDLFlBQVksQ0FBQztJQUM5QyxDQUFDO0lBRUQscUVBQXFFO0lBQ3JFLFdBQVc7UUFDVCxPQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxXQUFXLENBQUM7SUFDN0MsQ0FBQztJQUVELGdFQUFnRTtJQUNoRSxZQUFZO1FBQ1YsT0FBTyxJQUFJLENBQUMsa0JBQWtCLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7SUFDM0UsQ0FBQztJQUVELHFFQUFxRTtJQUNyRSxXQUFXO1FBQ1QsT0FBTyxJQUFJLENBQUMsa0JBQWtCLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7SUFDMUUsQ0FBQztDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cblxuaW1wb3J0IHtPdmVybGF5UmVmLCBHbG9iYWxQb3NpdGlvblN0cmF0ZWd5LCBPdmVybGF5U2l6ZUNvbmZpZ30gZnJvbSAnQGFuZ3VsYXIvY2RrL292ZXJsYXknO1xuaW1wb3J0IHtFU0NBUEUsIGhhc01vZGlmaWVyS2V5fSBmcm9tICdAYW5ndWxhci9jZGsva2V5Y29kZXMnO1xuaW1wb3J0IHtPYnNlcnZhYmxlfSBmcm9tICdyeGpzJztcbmltcG9ydCB7bWFwLCBmaWx0ZXJ9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7RGlhbG9nUG9zaXRpb259IGZyb20gJy4vZGlhbG9nLWNvbmZpZyc7XG5pbXBvcnQge0Nka0RpYWxvZ0NvbnRhaW5lcn0gZnJvbSAnLi9kaWFsb2ctY29udGFpbmVyJztcblxuLyoqIFVuaXF1ZSBpZCBmb3IgdGhlIGNyZWF0ZWQgZGlhbG9nLiAqL1xubGV0IHVuaXF1ZUlkID0gMDtcblxuLyoqXG4gKiBSZWZlcmVuY2UgdG8gYSBkaWFsb2cgb3BlbmVkIHZpYSB0aGUgRGlhbG9nIHNlcnZpY2UuXG4gKi9cbmV4cG9ydCBjbGFzcyBEaWFsb2dSZWY8VCwgUiA9IGFueT4ge1xuICAvKiogVGhlIGluc3RhbmNlIG9mIHRoZSBjb21wb25lbnQgaW4gdGhlIGRpYWxvZy4gKi9cbiAgY29tcG9uZW50SW5zdGFuY2U6IFQ7XG5cbiAgLyoqIFdoZXRoZXIgdGhlIHVzZXIgaXMgYWxsb3dlZCB0byBjbG9zZSB0aGUgZGlhbG9nLiAqL1xuICBkaXNhYmxlQ2xvc2U6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG5cbiAgLyoqIFJlc3VsdCB0byBiZSBwYXNzZWQgdG8gYWZ0ZXJDbG9zZWQuICovXG4gIHByaXZhdGUgX3Jlc3VsdDogUiB8IHVuZGVmaW5lZDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgX292ZXJsYXlSZWY6IE92ZXJsYXlSZWYsXG4gICAgcHJvdGVjdGVkIF9jb250YWluZXJJbnN0YW5jZTogQ2RrRGlhbG9nQ29udGFpbmVyLFxuICAgIHJlYWRvbmx5IGlkOiBzdHJpbmcgPSBgZGlhbG9nLSR7dW5pcXVlSWQrK31gKSB7XG5cbiAgICAvLyBJZiB0aGUgZGlhbG9nIGhhcyBhIGJhY2tkcm9wLCBoYW5kbGUgY2xpY2tzIGZyb20gdGhlIGJhY2tkcm9wLlxuICAgIGlmIChfY29udGFpbmVySW5zdGFuY2UuX2NvbmZpZy5oYXNCYWNrZHJvcCkge1xuICAgICAgX292ZXJsYXlSZWYuYmFja2Ryb3BDbGljaygpLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgIGlmICghdGhpcy5kaXNhYmxlQ2xvc2UpIHtcbiAgICAgICAgICB0aGlzLmNsb3NlKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHRoaXMuYmVmb3JlQ2xvc2VkKCkuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgIHRoaXMuX292ZXJsYXlSZWYuZGV0YWNoQmFja2Ryb3AoKTtcbiAgICB9KTtcblxuICAgIHRoaXMuYWZ0ZXJDbG9zZWQoKS5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgdGhpcy5fb3ZlcmxheVJlZi5kZXRhY2goKTtcbiAgICAgIHRoaXMuX292ZXJsYXlSZWYuZGlzcG9zZSgpO1xuICAgICAgdGhpcy5jb21wb25lbnRJbnN0YW5jZSA9IG51bGwhO1xuICAgIH0pO1xuXG4gICAgLy8gQ2xvc2Ugd2hlbiBlc2NhcGUga2V5ZG93biBldmVudCBvY2N1cnNcbiAgICBfb3ZlcmxheVJlZi5rZXlkb3duRXZlbnRzKClcbiAgICAgIC5waXBlKGZpbHRlcihldmVudCA9PiB7XG4gICAgICAgIHJldHVybiBldmVudC5rZXlDb2RlID09PSBFU0NBUEUgJiYgIXRoaXMuZGlzYWJsZUNsb3NlICYmICFoYXNNb2RpZmllcktleShldmVudCk7XG4gICAgICB9KSlcbiAgICAgIC5zdWJzY3JpYmUoZXZlbnQgPT4ge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB0aGlzLmNsb3NlKCk7XG4gICAgICB9KTtcbiAgfVxuXG4gIC8qKiBHZXRzIGFuIG9ic2VydmFibGUgdGhhdCBlbWl0cyB3aGVuIHRoZSBvdmVybGF5J3MgYmFja2Ryb3AgaGFzIGJlZW4gY2xpY2tlZC4gKi9cbiAgYmFja2Ryb3BDbGljaygpOiBPYnNlcnZhYmxlPE1vdXNlRXZlbnQ+IHtcbiAgICByZXR1cm4gdGhpcy5fb3ZlcmxheVJlZi5iYWNrZHJvcENsaWNrKCk7XG4gIH1cblxuICAvKipcbiAgICogQ2xvc2UgdGhlIGRpYWxvZy5cbiAgICogQHBhcmFtIGRpYWxvZ1Jlc3VsdCBPcHRpb25hbCByZXN1bHQgdG8gcmV0dXJuIHRvIHRoZSBkaWFsb2cgb3BlbmVyLlxuICAgKi9cbiAgY2xvc2UoZGlhbG9nUmVzdWx0PzogUik6IHZvaWQge1xuICAgIHRoaXMuX3Jlc3VsdCA9IGRpYWxvZ1Jlc3VsdDtcbiAgICB0aGlzLl9jb250YWluZXJJbnN0YW5jZS5fc3RhcnRFeGl0aW5nKCk7XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlcyB0aGUgZGlhbG9nJ3MgcG9zaXRpb24uXG4gICAqIEBwYXJhbSBwb3NpdGlvbiBOZXcgZGlhbG9nIHBvc2l0aW9uLlxuICAgKi9cbiAgdXBkYXRlUG9zaXRpb24ocG9zaXRpb24/OiBEaWFsb2dQb3NpdGlvbik6IHRoaXMge1xuICAgIGxldCBzdHJhdGVneSA9IHRoaXMuX2dldFBvc2l0aW9uU3RyYXRlZ3koKTtcblxuICAgIGlmIChwb3NpdGlvbiAmJiAocG9zaXRpb24ubGVmdCB8fCBwb3NpdGlvbi5yaWdodCkpIHtcbiAgICAgIHBvc2l0aW9uLmxlZnQgPyBzdHJhdGVneS5sZWZ0KHBvc2l0aW9uLmxlZnQpIDogc3RyYXRlZ3kucmlnaHQocG9zaXRpb24ucmlnaHQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdHJhdGVneS5jZW50ZXJIb3Jpem9udGFsbHkoKTtcbiAgICB9XG5cbiAgICBpZiAocG9zaXRpb24gJiYgKHBvc2l0aW9uLnRvcCB8fCBwb3NpdGlvbi5ib3R0b20pKSB7XG4gICAgICBwb3NpdGlvbi50b3AgPyBzdHJhdGVneS50b3AocG9zaXRpb24udG9wKSA6IHN0cmF0ZWd5LmJvdHRvbShwb3NpdGlvbi5ib3R0b20pO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdHJhdGVneS5jZW50ZXJWZXJ0aWNhbGx5KCk7XG4gICAgfVxuXG4gICAgdGhpcy5fb3ZlcmxheVJlZi51cGRhdGVQb3NpdGlvbigpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyBhbiBvYnNlcnZhYmxlIHRoYXQgZW1pdHMgd2hlbiBrZXlkb3duIGV2ZW50cyBhcmUgdGFyZ2V0ZWQgb24gdGhlIG92ZXJsYXkuXG4gICAqL1xuICBrZXlkb3duRXZlbnRzKCk6IE9ic2VydmFibGU8S2V5Ym9hcmRFdmVudD4ge1xuICAgIHJldHVybiB0aGlzLl9vdmVybGF5UmVmLmtleWRvd25FdmVudHMoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGVzIHRoZSBkaWFsb2cncyB3aWR0aCBhbmQgaGVpZ2h0LCBkZWZpbmVkLCBtaW4gYW5kIG1heC5cbiAgICogQHBhcmFtIHNpemUgTmV3IHNpemUgZm9yIHRoZSBvdmVybGF5LlxuICAgKi9cbiAgdXBkYXRlU2l6ZShzaXplOiBPdmVybGF5U2l6ZUNvbmZpZyk6IHRoaXMge1xuICAgIGlmIChzaXplLndpZHRoKSB7XG4gICAgICB0aGlzLl9nZXRQb3NpdGlvblN0cmF0ZWd5KCkud2lkdGgoc2l6ZS53aWR0aC50b1N0cmluZygpKTtcbiAgICB9XG4gICAgaWYgKHNpemUuaGVpZ2h0KSB7XG4gICAgICB0aGlzLl9nZXRQb3NpdGlvblN0cmF0ZWd5KCkuaGVpZ2h0KHNpemUuaGVpZ2h0LnRvU3RyaW5nKCkpO1xuICAgIH1cbiAgICB0aGlzLl9vdmVybGF5UmVmLnVwZGF0ZVNpemUoc2l6ZSk7XG4gICAgdGhpcy5fb3ZlcmxheVJlZi51cGRhdGVQb3NpdGlvbigpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqIEZldGNoZXMgdGhlIHBvc2l0aW9uIHN0cmF0ZWd5IG9iamVjdCBmcm9tIHRoZSBvdmVybGF5IHJlZi4gKi9cbiAgcHJpdmF0ZSBfZ2V0UG9zaXRpb25TdHJhdGVneSgpOiBHbG9iYWxQb3NpdGlvblN0cmF0ZWd5IHtcbiAgICByZXR1cm4gdGhpcy5fb3ZlcmxheVJlZi5nZXRDb25maWcoKS5wb3NpdGlvblN0cmF0ZWd5IGFzIEdsb2JhbFBvc2l0aW9uU3RyYXRlZ3k7XG4gIH1cblxuICAvKiogR2V0cyBhbiBvYnNlcnZhYmxlIHRoYXQgZW1pdHMgd2hlbiBkaWFsb2cgYmVnaW5zIG9wZW5pbmcuICovXG4gIGJlZm9yZU9wZW5lZCgpOiBPYnNlcnZhYmxlPHZvaWQ+IHtcbiAgICByZXR1cm4gdGhpcy5fY29udGFpbmVySW5zdGFuY2UuX2JlZm9yZUVudGVyO1xuICB9XG5cbiAgLyoqIEdldHMgYW4gb2JzZXJ2YWJsZSB0aGF0IGVtaXRzIHdoZW4gZGlhbG9nIGlzIGZpbmlzaGVkIG9wZW5pbmcuICovXG4gIGFmdGVyT3BlbmVkKCk6IE9ic2VydmFibGU8dm9pZD4ge1xuICAgIHJldHVybiB0aGlzLl9jb250YWluZXJJbnN0YW5jZS5fYWZ0ZXJFbnRlcjtcbiAgfVxuXG4gIC8qKiBHZXRzIGFuIG9ic2VydmFibGUgdGhhdCBlbWl0cyB3aGVuIGRpYWxvZyBiZWdpbnMgY2xvc2luZy4gKi9cbiAgYmVmb3JlQ2xvc2VkKCk6IE9ic2VydmFibGU8UiB8IHVuZGVmaW5lZD4ge1xuICAgIHJldHVybiB0aGlzLl9jb250YWluZXJJbnN0YW5jZS5fYmVmb3JlRXhpdC5waXBlKG1hcCgoKSA9PiB0aGlzLl9yZXN1bHQpKTtcbiAgfVxuXG4gIC8qKiBHZXRzIGFuIG9ic2VydmFibGUgdGhhdCBlbWl0cyB3aGVuIGRpYWxvZyBpcyBmaW5pc2hlZCBjbG9zaW5nLiAqL1xuICBhZnRlckNsb3NlZCgpOiBPYnNlcnZhYmxlPFIgfCB1bmRlZmluZWQ+IHtcbiAgICByZXR1cm4gdGhpcy5fY29udGFpbmVySW5zdGFuY2UuX2FmdGVyRXhpdC5waXBlKG1hcCgoKSA9PiB0aGlzLl9yZXN1bHQpKTtcbiAgfVxufVxuIl19