/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Subject } from 'rxjs';
/**
 * Maintains a set of selected items. Support selecting and deselecting items, and checking if a
 * value is selected.
 * When constructed with a `trackByFn`, all the items will be identified by applying the `trackByFn`
 * on them. Because `trackByFn` requires the index of the item to be passed in, the `index` field is
 * expected to be set when calling `isSelected`, `select` and `deselect`.
 */
export class SelectionSet {
    constructor(_multiple = false, _trackByFn) {
        this._multiple = _multiple;
        this._trackByFn = _trackByFn;
        this._selectionMap = new Map();
        this.changed = new Subject();
    }
    isSelected(value) {
        return this._selectionMap.has(this._getTrackedByValue(value));
    }
    select(...selects) {
        if (!this._multiple && selects.length > 1 && (typeof ngDevMode === 'undefined' || ngDevMode)) {
            throw Error('SelectionSet: not multiple selection');
        }
        const before = this._getCurrentSelection();
        if (!this._multiple) {
            this._selectionMap.clear();
        }
        const toSelect = [];
        for (const select of selects) {
            if (this.isSelected(select)) {
                continue;
            }
            toSelect.push(select);
            this._markSelected(this._getTrackedByValue(select), select);
        }
        const after = this._getCurrentSelection();
        this.changed.next({ before, after });
    }
    deselect(...selects) {
        if (!this._multiple && selects.length > 1 && (typeof ngDevMode === 'undefined' || ngDevMode)) {
            throw Error('SelectionSet: not multiple selection');
        }
        const before = this._getCurrentSelection();
        const toDeselect = [];
        for (const select of selects) {
            if (!this.isSelected(select)) {
                continue;
            }
            toDeselect.push(select);
            this._markDeselected(this._getTrackedByValue(select));
        }
        const after = this._getCurrentSelection();
        this.changed.next({ before, after });
    }
    _markSelected(key, toSelect) {
        this._selectionMap.set(key, toSelect);
    }
    _markDeselected(key) {
        this._selectionMap.delete(key);
    }
    _getTrackedByValue(select) {
        if (!this._trackByFn) {
            return select.value;
        }
        if (select.index == null && (typeof ngDevMode === 'undefined' || ngDevMode)) {
            throw Error('SelectionSet: index required when trackByFn is used.');
        }
        return this._trackByFn(select.index, select.value);
    }
    _getCurrentSelection() {
        return Array.from(this._selectionMap.values());
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VsZWN0aW9uLXNldC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL3NlbGVjdGlvbi9zZWxlY3Rpb24tc2V0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUdILE9BQU8sRUFBQyxPQUFPLEVBQUMsTUFBTSxNQUFNLENBQUM7QUE4QjdCOzs7Ozs7R0FNRztBQUNILE1BQU0sT0FBTyxZQUFZO0lBSXZCLFlBQW9CLFlBQVksS0FBSyxFQUFVLFVBQStCO1FBQTFELGNBQVMsR0FBVCxTQUFTLENBQVE7UUFBVSxlQUFVLEdBQVYsVUFBVSxDQUFxQjtRQUh0RSxrQkFBYSxHQUFHLElBQUksR0FBRyxFQUE4RCxDQUFDO1FBQzlGLFlBQU8sR0FBRyxJQUFJLE9BQU8sRUFBc0IsQ0FBQztJQUVxQyxDQUFDO0lBRWxGLFVBQVUsQ0FBQyxLQUE2QjtRQUN0QyxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ2hFLENBQUM7SUFFRCxNQUFNLENBQUMsR0FBRyxPQUFpQztRQUN6QyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsSUFBSSxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sU0FBUyxLQUFLLFdBQVcsSUFBSSxTQUFTLENBQUMsRUFBRSxDQUFDO1lBQzdGLE1BQU0sS0FBSyxDQUFDLHNDQUFzQyxDQUFDLENBQUM7UUFDdEQsQ0FBQztRQUVELE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO1FBRTNDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDcEIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUM3QixDQUFDO1FBRUQsTUFBTSxRQUFRLEdBQTZCLEVBQUUsQ0FBQztRQUM5QyxLQUFLLE1BQU0sTUFBTSxJQUFJLE9BQU8sRUFBRSxDQUFDO1lBQzdCLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO2dCQUM1QixTQUFTO1lBQ1gsQ0FBQztZQUVELFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDdEIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDOUQsQ0FBQztRQUVELE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO1FBRTFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUMsTUFBTSxFQUFFLEtBQUssRUFBQyxDQUFDLENBQUM7SUFDckMsQ0FBQztJQUVELFFBQVEsQ0FBQyxHQUFHLE9BQWlDO1FBQzNDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxJQUFJLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxTQUFTLEtBQUssV0FBVyxJQUFJLFNBQVMsQ0FBQyxFQUFFLENBQUM7WUFDN0YsTUFBTSxLQUFLLENBQUMsc0NBQXNDLENBQUMsQ0FBQztRQUN0RCxDQUFDO1FBRUQsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUM7UUFDM0MsTUFBTSxVQUFVLEdBQTZCLEVBQUUsQ0FBQztRQUVoRCxLQUFLLE1BQU0sTUFBTSxJQUFJLE9BQU8sRUFBRSxDQUFDO1lBQzdCLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7Z0JBQzdCLFNBQVM7WUFDWCxDQUFDO1lBRUQsVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUN4QixJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ3hELENBQUM7UUFFRCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztRQUMxQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUMsQ0FBQyxDQUFDO0lBQ3JDLENBQUM7SUFFTyxhQUFhLENBQUMsR0FBdUMsRUFBRSxRQUFnQztRQUM3RixJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDeEMsQ0FBQztJQUVPLGVBQWUsQ0FBQyxHQUF1QztRQUM3RCxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNqQyxDQUFDO0lBRU8sa0JBQWtCLENBQUMsTUFBOEI7UUFDdkQsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUNyQixPQUFPLE1BQU0sQ0FBQyxLQUFLLENBQUM7UUFDdEIsQ0FBQztRQUVELElBQUksTUFBTSxDQUFDLEtBQUssSUFBSSxJQUFJLElBQUksQ0FBQyxPQUFPLFNBQVMsS0FBSyxXQUFXLElBQUksU0FBUyxDQUFDLEVBQUUsQ0FBQztZQUM1RSxNQUFNLEtBQUssQ0FBQyxzREFBc0QsQ0FBQyxDQUFDO1FBQ3RFLENBQUM7UUFFRCxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEtBQU0sRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDdEQsQ0FBQztJQUVPLG9CQUFvQjtRQUMxQixPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO0lBQ2pELENBQUM7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1RyYWNrQnlGdW5jdGlvbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge1N1YmplY3R9IGZyb20gJ3J4anMnO1xuXG4vKipcbiAqIE1haW50YWlucyBhIHNldCBvZiBzZWxlY3RlZCB2YWx1ZXMuIE9uZSBvciBtb3JlIHZhbHVlcyBjYW4gYmUgYWRkZWQgdG8gb3IgcmVtb3ZlZCBmcm9tIHRoZVxuICogc2VsZWN0aW9uLlxuICovXG5pbnRlcmZhY2UgVHJhY2tCeVNlbGVjdGlvbjxUPiB7XG4gIGlzU2VsZWN0ZWQodmFsdWU6IFNlbGVjdGFibGVXaXRoSW5kZXg8VD4pOiBib29sZWFuO1xuICBzZWxlY3QoLi4udmFsdWVzOiBTZWxlY3RhYmxlV2l0aEluZGV4PFQ+W10pOiB2b2lkO1xuICBkZXNlbGVjdCguLi52YWx1ZXM6IFNlbGVjdGFibGVXaXRoSW5kZXg8VD5bXSk6IHZvaWQ7XG4gIGNoYW5nZWQ6IFN1YmplY3Q8U2VsZWN0aW9uQ2hhbmdlPFQ+Pjtcbn1cblxuLyoqXG4gKiBBIHNlbGVjdGFibGUgdmFsdWUgd2l0aCBhbiBvcHRpb25hbCBpbmRleC4gVGhlIGluZGV4IGlzIHJlcXVpcmVkIHdoZW4gdGhlIHNlbGVjdGlvbiBpcyB1c2VkIHdpdGhcbiAqIGB0cmFja0J5YC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBTZWxlY3RhYmxlV2l0aEluZGV4PFQ+IHtcbiAgdmFsdWU6IFQ7XG4gIGluZGV4PzogbnVtYmVyO1xufVxuXG4vKipcbiAqIFJlcHJlc2VudHMgdGhlIGNoYW5nZSBpbiB0aGUgc2VsZWN0aW9uIHNldC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBTZWxlY3Rpb25DaGFuZ2U8VD4ge1xuICBiZWZvcmU6IFNlbGVjdGFibGVXaXRoSW5kZXg8VD5bXTtcbiAgYWZ0ZXI6IFNlbGVjdGFibGVXaXRoSW5kZXg8VD5bXTtcbn1cblxuLyoqXG4gKiBNYWludGFpbnMgYSBzZXQgb2Ygc2VsZWN0ZWQgaXRlbXMuIFN1cHBvcnQgc2VsZWN0aW5nIGFuZCBkZXNlbGVjdGluZyBpdGVtcywgYW5kIGNoZWNraW5nIGlmIGFcbiAqIHZhbHVlIGlzIHNlbGVjdGVkLlxuICogV2hlbiBjb25zdHJ1Y3RlZCB3aXRoIGEgYHRyYWNrQnlGbmAsIGFsbCB0aGUgaXRlbXMgd2lsbCBiZSBpZGVudGlmaWVkIGJ5IGFwcGx5aW5nIHRoZSBgdHJhY2tCeUZuYFxuICogb24gdGhlbS4gQmVjYXVzZSBgdHJhY2tCeUZuYCByZXF1aXJlcyB0aGUgaW5kZXggb2YgdGhlIGl0ZW0gdG8gYmUgcGFzc2VkIGluLCB0aGUgYGluZGV4YCBmaWVsZCBpc1xuICogZXhwZWN0ZWQgdG8gYmUgc2V0IHdoZW4gY2FsbGluZyBgaXNTZWxlY3RlZGAsIGBzZWxlY3RgIGFuZCBgZGVzZWxlY3RgLlxuICovXG5leHBvcnQgY2xhc3MgU2VsZWN0aW9uU2V0PFQ+IGltcGxlbWVudHMgVHJhY2tCeVNlbGVjdGlvbjxUPiB7XG4gIHByaXZhdGUgX3NlbGVjdGlvbk1hcCA9IG5ldyBNYXA8VCB8IFJldHVyblR5cGU8VHJhY2tCeUZ1bmN0aW9uPFQ+PiwgU2VsZWN0YWJsZVdpdGhJbmRleDxUPj4oKTtcbiAgY2hhbmdlZCA9IG5ldyBTdWJqZWN0PFNlbGVjdGlvbkNoYW5nZTxUPj4oKTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9tdWx0aXBsZSA9IGZhbHNlLCBwcml2YXRlIF90cmFja0J5Rm4/OiBUcmFja0J5RnVuY3Rpb248VD4pIHt9XG5cbiAgaXNTZWxlY3RlZCh2YWx1ZTogU2VsZWN0YWJsZVdpdGhJbmRleDxUPik6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9zZWxlY3Rpb25NYXAuaGFzKHRoaXMuX2dldFRyYWNrZWRCeVZhbHVlKHZhbHVlKSk7XG4gIH1cblxuICBzZWxlY3QoLi4uc2VsZWN0czogU2VsZWN0YWJsZVdpdGhJbmRleDxUPltdKSB7XG4gICAgaWYgKCF0aGlzLl9tdWx0aXBsZSAmJiBzZWxlY3RzLmxlbmd0aCA+IDEgJiYgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkpIHtcbiAgICAgIHRocm93IEVycm9yKCdTZWxlY3Rpb25TZXQ6IG5vdCBtdWx0aXBsZSBzZWxlY3Rpb24nKTtcbiAgICB9XG5cbiAgICBjb25zdCBiZWZvcmUgPSB0aGlzLl9nZXRDdXJyZW50U2VsZWN0aW9uKCk7XG5cbiAgICBpZiAoIXRoaXMuX211bHRpcGxlKSB7XG4gICAgICB0aGlzLl9zZWxlY3Rpb25NYXAuY2xlYXIoKTtcbiAgICB9XG5cbiAgICBjb25zdCB0b1NlbGVjdDogU2VsZWN0YWJsZVdpdGhJbmRleDxUPltdID0gW107XG4gICAgZm9yIChjb25zdCBzZWxlY3Qgb2Ygc2VsZWN0cykge1xuICAgICAgaWYgKHRoaXMuaXNTZWxlY3RlZChzZWxlY3QpKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICB0b1NlbGVjdC5wdXNoKHNlbGVjdCk7XG4gICAgICB0aGlzLl9tYXJrU2VsZWN0ZWQodGhpcy5fZ2V0VHJhY2tlZEJ5VmFsdWUoc2VsZWN0KSwgc2VsZWN0KTtcbiAgICB9XG5cbiAgICBjb25zdCBhZnRlciA9IHRoaXMuX2dldEN1cnJlbnRTZWxlY3Rpb24oKTtcblxuICAgIHRoaXMuY2hhbmdlZC5uZXh0KHtiZWZvcmUsIGFmdGVyfSk7XG4gIH1cblxuICBkZXNlbGVjdCguLi5zZWxlY3RzOiBTZWxlY3RhYmxlV2l0aEluZGV4PFQ+W10pIHtcbiAgICBpZiAoIXRoaXMuX211bHRpcGxlICYmIHNlbGVjdHMubGVuZ3RoID4gMSAmJiAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSkge1xuICAgICAgdGhyb3cgRXJyb3IoJ1NlbGVjdGlvblNldDogbm90IG11bHRpcGxlIHNlbGVjdGlvbicpO1xuICAgIH1cblxuICAgIGNvbnN0IGJlZm9yZSA9IHRoaXMuX2dldEN1cnJlbnRTZWxlY3Rpb24oKTtcbiAgICBjb25zdCB0b0Rlc2VsZWN0OiBTZWxlY3RhYmxlV2l0aEluZGV4PFQ+W10gPSBbXTtcblxuICAgIGZvciAoY29uc3Qgc2VsZWN0IG9mIHNlbGVjdHMpIHtcbiAgICAgIGlmICghdGhpcy5pc1NlbGVjdGVkKHNlbGVjdCkpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIHRvRGVzZWxlY3QucHVzaChzZWxlY3QpO1xuICAgICAgdGhpcy5fbWFya0Rlc2VsZWN0ZWQodGhpcy5fZ2V0VHJhY2tlZEJ5VmFsdWUoc2VsZWN0KSk7XG4gICAgfVxuXG4gICAgY29uc3QgYWZ0ZXIgPSB0aGlzLl9nZXRDdXJyZW50U2VsZWN0aW9uKCk7XG4gICAgdGhpcy5jaGFuZ2VkLm5leHQoe2JlZm9yZSwgYWZ0ZXJ9KTtcbiAgfVxuXG4gIHByaXZhdGUgX21hcmtTZWxlY3RlZChrZXk6IFQgfCBSZXR1cm5UeXBlPFRyYWNrQnlGdW5jdGlvbjxUPj4sIHRvU2VsZWN0OiBTZWxlY3RhYmxlV2l0aEluZGV4PFQ+KSB7XG4gICAgdGhpcy5fc2VsZWN0aW9uTWFwLnNldChrZXksIHRvU2VsZWN0KTtcbiAgfVxuXG4gIHByaXZhdGUgX21hcmtEZXNlbGVjdGVkKGtleTogVCB8IFJldHVyblR5cGU8VHJhY2tCeUZ1bmN0aW9uPFQ+Pikge1xuICAgIHRoaXMuX3NlbGVjdGlvbk1hcC5kZWxldGUoa2V5KTtcbiAgfVxuXG4gIHByaXZhdGUgX2dldFRyYWNrZWRCeVZhbHVlKHNlbGVjdDogU2VsZWN0YWJsZVdpdGhJbmRleDxUPikge1xuICAgIGlmICghdGhpcy5fdHJhY2tCeUZuKSB7XG4gICAgICByZXR1cm4gc2VsZWN0LnZhbHVlO1xuICAgIH1cblxuICAgIGlmIChzZWxlY3QuaW5kZXggPT0gbnVsbCAmJiAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSkge1xuICAgICAgdGhyb3cgRXJyb3IoJ1NlbGVjdGlvblNldDogaW5kZXggcmVxdWlyZWQgd2hlbiB0cmFja0J5Rm4gaXMgdXNlZC4nKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fdHJhY2tCeUZuKHNlbGVjdC5pbmRleCEsIHNlbGVjdC52YWx1ZSk7XG4gIH1cblxuICBwcml2YXRlIF9nZXRDdXJyZW50U2VsZWN0aW9uKCk6IFNlbGVjdGFibGVXaXRoSW5kZXg8VD5bXSB7XG4gICAgcmV0dXJuIEFycmF5LmZyb20odGhpcy5fc2VsZWN0aW9uTWFwLnZhbHVlcygpKTtcbiAgfVxufVxuIl19