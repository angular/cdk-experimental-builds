/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { QueryList, ElementRef } from '@angular/core';
import { Observable } from 'rxjs';
/** Item to track for mouse focus events. */
export interface FocusableElement {
    /** A reference to the element to be tracked. */
    _elementRef: ElementRef<HTMLElement>;
}
/**
 * Gets a stream of pointer (mouse) entries into the given items.
 * This should typically run outside the Angular zone.
 */
export declare function getItemPointerEntries<T extends FocusableElement>(items: QueryList<T>): Observable<T>;
