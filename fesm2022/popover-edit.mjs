import { closest } from './polyfill.mjs';
import * as i0 from '@angular/core';
import { inject, NgZone, Injectable, Injector, afterNextRender, ElementRef, EventEmitter, Directive, Input, DOCUMENT, Renderer2, ViewContainerRef, TemplateRef, NgModule } from '@angular/core';
import { Subject, pipe, combineLatest, Observable, merge } from 'rxjs';
import { distinctUntilChanged, startWith, shareReplay, filter, map, auditTime, audit, debounceTime, skip, takeUntil, mapTo, throttleTime, share, withLatestFrom } from 'rxjs/operators';
import { ControlContainer } from '@angular/forms';
import { Directionality } from '@angular/cdk/bidi';
import { RIGHT_ARROW, LEFT_ARROW, DOWN_ARROW, UP_ARROW, hasModifierKey } from '@angular/cdk/keycodes';
import { createOverlayRef, createRepositionScrollStrategy, createFlexibleConnectedPositionStrategy, OverlayModule } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { FocusTrapFactory, InteractivityChecker, FocusTrap } from '@angular/cdk/a11y';
import { ScrollDispatcher, ViewportRuler } from '@angular/cdk/scrolling';

/** Selector for finding table cells. */
const CELL_SELECTOR = '.cdk-cell, .mat-cell, td';
/** Selector for finding editable table cells. */
const EDITABLE_CELL_SELECTOR = '.cdk-popover-edit-cell, .mat-popover-edit-cell';
/** Selector for finding table rows. */
const ROW_SELECTOR = '.cdk-row, .mat-row, tr';
/** Selector for finding the table element. */
const TABLE_SELECTOR = 'table, cdk-table, mat-table';
/** CSS class added to the edit lens pane. */
const EDIT_PANE_CLASS = 'cdk-edit-pane';
/** Selector for finding the edit lens pane. */
const EDIT_PANE_SELECTOR = `.${EDIT_PANE_CLASS}, .mat-edit-pane`;
/** Selector for table rows that should be skipped when moving focus. */
const SKIP_ROW_FOCUS_SELECTOR = '.cdk-popover-edit-skip-focus, .mat-popover-edit-skip-focus';

/** The delay applied to mouse events before hiding or showing hover content. */
const MOUSE_EVENT_DELAY_MS = 40;
/** The delay for reacting to focus/blur changes. */
const FOCUS_DELAY = 0;
/**
 * The possible states for hover content:
 * OFF - Not rendered.
 * FOCUSABLE - Rendered in the dom and styled for its contents to be focusable but invisible.
 * ON - Rendered and fully visible.
 */
var HoverContentState;
(function (HoverContentState) {
    HoverContentState[HoverContentState["OFF"] = 0] = "OFF";
    HoverContentState[HoverContentState["FOCUSABLE"] = 1] = "FOCUSABLE";
    HoverContentState[HoverContentState["ON"] = 2] = "ON";
})(HoverContentState || (HoverContentState = {}));
// Note: this class is generic, rather than referencing EditRef directly, in order to avoid
// circular imports. If we were to reference it here, importing the registry into the
// class that is registering itself will introduce a circular import.
/**
 * Service for sharing delegated events and state for triggering table edits.
 */
class EditEventDispatcher {
    _ngZone = inject(NgZone);
    /** A subject that indicates which table cell is currently editing (unless it is disabled). */
    editing = new Subject();
    /** A subject that indicates which table row is currently hovered. */
    hovering = new Subject();
    /** A subject that indicates which table row currently contains focus. */
    focused = new Subject();
    /** A subject that indicates all elements in the table matching ROW_SELECTOR. */
    allRows = new Subject();
    /** A subject that emits mouse move events from the table indicating the targeted row. */
    mouseMove = new Subject();
    // TODO: Use WeakSet once IE11 support is dropped.
    /**
     * Tracks the currently disabled editable cells - edit calls will be ignored
     * for these cells.
     */
    disabledCells = new WeakMap();
    /** The EditRef for the currently active edit lens (if any). */
    get editRef() {
        return this._editRef;
    }
    _editRef = null;
    // Optimization: Precompute common pipeable operators used per row/cell.
    _distinctUntilChanged = distinctUntilChanged();
    _startWithNull = startWith(null);
    _distinctShare = pipe(this._distinctUntilChanged, shareReplay(1));
    _startWithNullDistinct = pipe(this._startWithNull, this._distinctUntilChanged);
    editingAndEnabled = this.editing.pipe(filter(cell => cell == null || !this.disabledCells.has(cell)), shareReplay(1));
    /** An observable that emits the row containing focus or an active edit. */
    editingOrFocused = combineLatest([
        this.editingAndEnabled.pipe(map(cell => closest(cell, ROW_SELECTOR)), this._startWithNull),
        this.focused.pipe(this._startWithNull),
    ]).pipe(map(([editingRow, focusedRow]) => focusedRow || editingRow), this._distinctUntilChanged, auditTime(FOCUS_DELAY), // Use audit to skip over blur events to the next focused element.
    this._distinctUntilChanged, shareReplay(1));
    /** Tracks rows that contain hover content with a reference count. */
    _rowsWithHoverContent = new WeakMap();
    /** The table cell that has an active edit lens (or null). */
    _currentlyEditing = null;
    /** The combined set of row hover content states organized by row. */
    _hoveredContentStateDistinct = combineLatest([
        this._getFirstRowWithHoverContent(),
        this._getLastRowWithHoverContent(),
        this.editingOrFocused,
        this.hovering.pipe(distinctUntilChanged(), audit(row => this.mouseMove.pipe(filter(mouseMoveRow => row === mouseMoveRow), this._startWithNull, debounceTime(MOUSE_EVENT_DELAY_MS))), this._startWithNullDistinct),
    ]).pipe(skip(1), // Skip the initial emission of [null, null, null, null].
    map(computeHoverContentState), distinctUntilChanged(areMapEntriesEqual), 
    // Optimization: Enter the zone before shareReplay so that we trigger a single
    // ApplicationRef.tick for all row updates.
    this._enterZone(), shareReplay(1));
    _editingAndEnabledDistinct = this.editingAndEnabled.pipe(distinctUntilChanged(), this._enterZone(), shareReplay(1));
    // Optimization: Share row events observable with subsequent callers.
    // At startup, calls will be sequential by row.
    _lastSeenRow = null;
    _lastSeenRowHoverOrFocus = null;
    constructor() {
        this._editingAndEnabledDistinct.subscribe(cell => {
            this._currentlyEditing = cell;
        });
    }
    /**
     * Gets an Observable that emits true when the specified element's cell
     * is editing and false when not.
     */
    editingCell(element) {
        let cell = null;
        return this._editingAndEnabledDistinct.pipe(map(editCell => editCell === (cell || (cell = closest(element, CELL_SELECTOR)))), this._distinctUntilChanged);
    }
    /**
     * Stops editing for the specified cell. If the specified cell is not the current
     * edit cell, does nothing.
     */
    doneEditingCell(element) {
        const cell = closest(element, CELL_SELECTOR);
        if (this._currentlyEditing === cell) {
            this.editing.next(null);
        }
    }
    /** Sets the currently active EditRef. */
    setActiveEditRef(ref) {
        this._editRef = ref;
    }
    /** Unset the currently active EditRef, if the specified editRef is active. */
    unsetActiveEditRef(ref) {
        if (this._editRef !== ref) {
            return;
        }
        this._editRef = null;
    }
    /** Adds the specified table row to be tracked for first/last row comparisons. */
    registerRowWithHoverContent(row) {
        this._rowsWithHoverContent.set(row, (this._rowsWithHoverContent.get(row) || 0) + 1);
    }
    /**
     * Reference decrements and ultimately removes the specified table row from first/last row
     * comparisons.
     */
    deregisterRowWithHoverContent(row) {
        const refCount = this._rowsWithHoverContent.get(row) || 0;
        if (refCount <= 1) {
            this._rowsWithHoverContent.delete(row);
        }
        else {
            this._rowsWithHoverContent.set(row, refCount - 1);
        }
    }
    /**
     * Gets an Observable that emits true when the specified element's row
     * contains the focused element or is being hovered over and false when not.
     * Hovering is defined as when the mouse has momentarily stopped moving over the cell.
     */
    hoverOrFocusOnRow(row) {
        if (row !== this._lastSeenRow) {
            this._lastSeenRow = row;
            this._lastSeenRowHoverOrFocus = this._hoveredContentStateDistinct.pipe(map(state => state.get(row) || HoverContentState.OFF), this._distinctShare);
        }
        return this._lastSeenRowHoverOrFocus;
    }
    /**
     * RxJS operator that enters the Angular zone, used to reduce boilerplate in
     * re-entering the zone for stream pipelines.
     */
    _enterZone() {
        return (source) => new Observable(observer => source.subscribe({
            next: value => this._ngZone.run(() => observer.next(value)),
            error: err => observer.error(err),
            complete: () => observer.complete(),
        }));
    }
    _getFirstRowWithHoverContent() {
        return this._mapAllRowsToSingleRow(rows => {
            for (let i = 0, row; (row = rows[i]); i++) {
                if (this._rowsWithHoverContent.has(row)) {
                    return row;
                }
            }
            return null;
        });
    }
    _getLastRowWithHoverContent() {
        return this._mapAllRowsToSingleRow(rows => {
            for (let i = rows.length - 1, row; (row = rows[i]); i--) {
                if (this._rowsWithHoverContent.has(row)) {
                    return row;
                }
            }
            return null;
        });
    }
    _mapAllRowsToSingleRow(mapper) {
        return this.allRows.pipe(map(mapper), this._startWithNullDistinct);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.2.0-next.2", ngImport: i0, type: EditEventDispatcher, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "20.2.0-next.2", ngImport: i0, type: EditEventDispatcher });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.2.0-next.2", ngImport: i0, type: EditEventDispatcher, decorators: [{
            type: Injectable
        }], ctorParameters: () => [] });
function computeHoverContentState([firstRow, lastRow, activeRow, hoverRow,]) {
    const hoverContentState = new Map();
    // Add focusable rows.
    for (const focussableRow of [
        firstRow,
        lastRow,
        activeRow && activeRow.previousElementSibling,
        activeRow && activeRow.nextElementSibling,
    ]) {
        if (focussableRow) {
            hoverContentState.set(focussableRow, HoverContentState.FOCUSABLE);
        }
    }
    // Add/overwrite with fully visible rows.
    for (const onRow of [activeRow, hoverRow]) {
        if (onRow) {
            hoverContentState.set(onRow, HoverContentState.ON);
        }
    }
    return hoverContentState;
}
function areMapEntriesEqual(a, b) {
    if (a.size !== b.size) {
        return false;
    }
    // TODO: use Map.prototype.entries once we're off IE11.
    for (const aKey of Array.from(a.keys())) {
        if (b.get(aKey) !== a.get(aKey)) {
            return false;
        }
    }
    return true;
}

/**
 * Used for communication between the form within the edit lens and the
 * table that launched it. Provided by CdkEditControl within the lens.
 */
class EditRef {
    _form = inject(ControlContainer, { self: true });
    _editEventDispatcher = inject(EditEventDispatcher);
    /** Emits the final value of this edit instance before closing. */
    _finalValueSubject = new Subject();
    finalValue = this._finalValueSubject;
    /** Emits when the user tabs out of this edit lens before closing. */
    _blurredSubject = new Subject();
    blurred = this._blurredSubject;
    /** The value to set the form back to on revert. */
    _revertFormValue;
    _injector = inject(Injector);
    constructor() {
        this._editEventDispatcher.setActiveEditRef(this);
    }
    /**
     * Called by the host directive's OnInit hook. Reads the initial state of the
     * form and overrides it with persisted state from previous openings, if
     * applicable.
     */
    init(previousFormValue) {
        // Wait for the next render before caching the initial value.
        // This ensures that all form controls have been initialized.
        afterNextRender(() => {
            this.updateRevertValue();
            if (previousFormValue) {
                this.reset(previousFormValue);
            }
        }, { injector: this._injector });
    }
    ngOnDestroy() {
        this._editEventDispatcher.unsetActiveEditRef(this);
        this._finalValueSubject.next(this._form.value);
        this._finalValueSubject.complete();
    }
    /** Whether the attached form is in a valid state. */
    isValid() {
        return this._form.valid;
    }
    /** Set the form's current value as what it will be set to on revert/reset. */
    updateRevertValue() {
        this._revertFormValue = this._form.value;
    }
    /** Tells the table to close the edit popup. */
    close() {
        this._editEventDispatcher.editing.next(null);
    }
    /** Notifies the active edit that the user has moved focus out of the lens. */
    blur() {
        this._blurredSubject.next();
    }
    /**
     * Resets the form value to the specified value or the previously set
     * revert value.
     */
    reset(value) {
        this._form.reset(value || this._revertFormValue);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.2.0-next.2", ngImport: i0, type: EditRef, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "20.2.0-next.2", ngImport: i0, type: EditRef });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.2.0-next.2", ngImport: i0, type: EditRef, decorators: [{
            type: Injectable
        }], ctorParameters: () => [] });

/**
 * Service responsible for moving cell focus around in response to keyboard events.
 * May be overridden to customize the keyboard behavior of popover edit.
 */
class FocusDispatcher {
    directionality = inject(Directionality);
    /** Observes keydown events triggered from the table. */
    keyObserver;
    constructor() {
        this.keyObserver = { next: event => this.handleKeyboardEvent(event) };
    }
    /**
     * Moves focus to earlier or later cells (in dom order) by offset cells relative to
     * currentCell.
     */
    moveFocusHorizontally(currentCell, offset) {
        const cells = Array.from(closest(currentCell, TABLE_SELECTOR).querySelectorAll(EDITABLE_CELL_SELECTOR));
        const currentIndex = cells.indexOf(currentCell);
        const newIndex = currentIndex + offset;
        if (cells[newIndex]) {
            cells[newIndex].focus();
        }
    }
    /** Moves focus to up or down by row by offset cells relative to currentCell. */
    moveFocusVertically(currentCell, offset) {
        const currentRow = closest(currentCell, ROW_SELECTOR);
        const rows = Array.from(closest(currentRow, TABLE_SELECTOR).querySelectorAll(ROW_SELECTOR));
        const currentRowIndex = rows.indexOf(currentRow);
        const currentIndexWithinRow = Array.from(currentRow.querySelectorAll(EDITABLE_CELL_SELECTOR)).indexOf(currentCell);
        let newRowIndex = currentRowIndex + offset;
        while (rows[newRowIndex]?.matches(SKIP_ROW_FOCUS_SELECTOR)) {
            newRowIndex = newRowIndex + (offset > 0 ? 1 : -1);
        }
        if (rows[newRowIndex]) {
            const rowToFocus = Array.from(rows[newRowIndex].querySelectorAll(EDITABLE_CELL_SELECTOR));
            if (rowToFocus[currentIndexWithinRow]) {
                rowToFocus[currentIndexWithinRow].focus();
            }
        }
    }
    /** Translates arrow keydown events into focus move operations. */
    handleKeyboardEvent(event) {
        const cell = closest(event.target, EDITABLE_CELL_SELECTOR);
        if (!cell) {
            return;
        }
        switch (event.keyCode) {
            case UP_ARROW:
                this.moveFocusVertically(cell, -1);
                break;
            case DOWN_ARROW:
                this.moveFocusVertically(cell, 1);
                break;
            case LEFT_ARROW:
                this.moveFocusHorizontally(cell, this.directionality.value === 'ltr' ? -1 : 1);
                break;
            case RIGHT_ARROW:
                this.moveFocusHorizontally(cell, this.directionality.value === 'ltr' ? 1 : -1);
                break;
            default:
                // If the keyboard event is not handled, return now so that we don't `preventDefault`.
                return;
        }
        event.preventDefault();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.2.0-next.2", ngImport: i0, type: FocusDispatcher, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "20.2.0-next.2", ngImport: i0, type: FocusDispatcher, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.2.0-next.2", ngImport: i0, type: FocusDispatcher, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: () => [] });

/**
 * A convenience class for preserving unsaved form state while an edit lens is closed.
 *
 * Example usage:
 * class MyComponent {
 *   readonly nameEditValues = new FormValueContainer&lt;Item, {name: string}&gt;();
 * }
 *
 * &lt;form cdkEditControl [(cdkEditControlPreservedFormValue)]="nameEditValues.for(item).value"&gt;
 */
class FormValueContainer {
    _formValues = new WeakMap();
    for(key) {
        const _formValues = this._formValues;
        let entry = _formValues.get(key);
        if (!entry) {
            // Expose entry as an object so that we can [(two-way)] bind to its value member
            entry = {};
            _formValues.set(key, entry);
        }
        return entry;
    }
}

/**
 * A directive that attaches to a form within the edit lens.
 * It coordinates the form state with the table-wide edit system and handles
 * closing the edit lens when the form is submitted or the user clicks
 * out.
 */
class CdkEditControl {
    elementRef = inject(ElementRef);
    editRef = inject(EditRef);
    destroyed = new Subject();
    /**
     * Specifies what should happen when the user clicks outside of the edit lens.
     * The default behavior is to close the lens without submitting the form.
     */
    clickOutBehavior = 'close';
    /**
     * A two-way binding for storing unsubmitted form state. If not provided
     * then form state will be discarded on close. The PeristBy directive is offered
     * as a convenient shortcut for these bindings.
     */
    preservedFormValue;
    preservedFormValueChange = new EventEmitter();
    /**
     * Determines whether the lens will close on form submit if the form is not in a valid
     * state. By default the lens will remain open.
     */
    ignoreSubmitUnlessValid = true;
    ngOnInit() {
        this.editRef.init(this.preservedFormValue);
        this.editRef.finalValue.subscribe(this.preservedFormValueChange);
        this.editRef.blurred.subscribe(() => this._handleBlur());
    }
    ngOnDestroy() {
        this.destroyed.next();
        this.destroyed.complete();
    }
    /**
     * Called when the form submits. If ignoreSubmitUnlessValid is true, checks
     * the form for validity before proceeding.
     * Updates the revert state with the latest submitted value then closes the edit.
     */
    handleFormSubmit() {
        if (this.ignoreSubmitUnlessValid && !this.editRef.isValid()) {
            return;
        }
        this.editRef.updateRevertValue();
        this.editRef.close();
    }
    /** Called on Escape keyup. Closes the edit. */
    close() {
        // todo - allow this behavior to be customized as well, such as calling
        // reset before close
        this.editRef.close();
    }
    /**
     * Called on click anywhere in the document.
     * If the click was outside of the lens, trigger the specified click out behavior.
     */
    handlePossibleClickOut(evt) {
        if (closest(evt.target, EDIT_PANE_SELECTOR)) {
            return;
        }
        switch (this.clickOutBehavior) {
            case 'submit':
                // Manually cause the form to submit before closing.
                this._triggerFormSubmit();
                this.editRef.close();
                break;
            case 'close':
                this.editRef.close();
                break;
        }
    }
    _handleKeydown(event) {
        if (event.key === 'Escape' && !hasModifierKey(event)) {
            this.close();
            event.preventDefault();
        }
    }
    /** Triggers submit on tab out if clickOutBehavior is 'submit'. */
    _handleBlur() {
        if (this.clickOutBehavior === 'submit') {
            // Manually cause the form to submit before closing.
            this._triggerFormSubmit();
        }
    }
    _triggerFormSubmit() {
        this.elementRef.nativeElement.dispatchEvent(new Event('submit'));
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.2.0-next.2", ngImport: i0, type: CdkEditControl, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "20.2.0-next.2", type: CdkEditControl, isStandalone: true, selector: "form[cdkEditControl]", inputs: { clickOutBehavior: ["cdkEditControlClickOutBehavior", "clickOutBehavior"], preservedFormValue: ["cdkEditControlPreservedFormValue", "preservedFormValue"], ignoreSubmitUnlessValid: ["cdkEditControlIgnoreSubmitUnlessValid", "ignoreSubmitUnlessValid"] }, outputs: { preservedFormValueChange: "cdkEditControlPreservedFormValueChange" }, host: { listeners: { "ngSubmit": "handleFormSubmit()", "document:click": "handlePossibleClickOut($event)", "keydown": "_handleKeydown($event)" } }, providers: [EditRef], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.2.0-next.2", ngImport: i0, type: CdkEditControl, decorators: [{
            type: Directive,
            args: [{
                    selector: 'form[cdkEditControl]',
                    inputs: [
                        { name: 'clickOutBehavior', alias: 'cdkEditControlClickOutBehavior' },
                        { name: 'preservedFormValue', alias: 'cdkEditControlPreservedFormValue' },
                        { name: 'ignoreSubmitUnlessValid', alias: 'cdkEditControlIgnoreSubmitUnlessValid' },
                    ],
                    outputs: ['preservedFormValueChange: cdkEditControlPreservedFormValueChange'],
                    providers: [EditRef],
                    host: {
                        '(ngSubmit)': 'handleFormSubmit()',
                        '(document:click)': 'handlePossibleClickOut($event)',
                        '(keydown)': '_handleKeydown($event)',
                    },
                }]
        }] });
/** Reverts the form to its initial or previously submitted state on click. */
class CdkEditRevert {
    editRef = inject(EditRef);
    /** Type of the button. Defaults to `button` to avoid accident form submits. */
    type = 'button';
    revertEdit() {
        this.editRef.reset();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.2.0-next.2", ngImport: i0, type: CdkEditRevert, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "20.2.0-next.2", type: CdkEditRevert, isStandalone: true, selector: "button[cdkEditRevert]", inputs: { type: "type" }, host: { attributes: { "type": "button" }, listeners: { "click": "revertEdit()" } }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.2.0-next.2", ngImport: i0, type: CdkEditRevert, decorators: [{
            type: Directive,
            args: [{
                    selector: 'button[cdkEditRevert]',
                    host: {
                        'type': 'button',
                        '(click)': 'revertEdit()',
                    },
                }]
        }], propDecorators: { type: [{
                type: Input
            }] } });
/** Closes the lens on click. */
class CdkEditClose {
    elementRef = inject(ElementRef);
    editRef = inject(EditRef);
    constructor() {
        const nativeElement = this.elementRef.nativeElement;
        // Prevent accidental form submits.
        if (nativeElement.nodeName === 'BUTTON' && !nativeElement.getAttribute('type')) {
            nativeElement.setAttribute('type', 'button');
        }
    }
    closeEdit() {
        // Note that we use `click` here, rather than a keyboard event, because some screen readers
        // will emit a fake click event instead of an enter keyboard event on buttons. For the keyboard
        // events we use `keydown`, rather than `keyup`, because we use `keydown` to open the overlay
        // as well. If we were to use `keyup`, the user could end up opening and closing within
        // the same event sequence if focus was moved quickly.
        this.editRef.close();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.2.0-next.2", ngImport: i0, type: CdkEditClose, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "20.2.0-next.2", type: CdkEditClose, isStandalone: true, selector: "[cdkEditClose]", host: { listeners: { "click": "closeEdit()", "keydown.enter": "closeEdit()", "keydown.space": "closeEdit()" } }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.2.0-next.2", ngImport: i0, type: CdkEditClose, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkEditClose]',
                    host: {
                        '(click)': 'closeEdit()',
                        '(keydown.enter)': 'closeEdit()',
                        '(keydown.space)': 'closeEdit()',
                    },
                }]
        }], ctorParameters: () => [] });

/**
 * Optimization
 * Collects multiple Injectables into a singleton shared across the table. By reducing the
 * number of services injected into each CdkPopoverEdit, this saves about 0.023ms of cpu time
 * and 56 bytes of memory per instance.
 */
class EditServices {
    directionality = inject(Directionality);
    editEventDispatcher = inject(EditEventDispatcher);
    focusDispatcher = inject(FocusDispatcher);
    focusTrapFactory = inject(FocusTrapFactory);
    ngZone = inject(NgZone);
    scrollDispatcher = inject(ScrollDispatcher);
    viewportRuler = inject(ViewportRuler);
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.2.0-next.2", ngImport: i0, type: EditServices, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "20.2.0-next.2", ngImport: i0, type: EditServices });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.2.0-next.2", ngImport: i0, type: EditServices, decorators: [{
            type: Injectable
        }] });

/** Value indicating whether focus left the target area before or after the enclosed elements. */
var FocusEscapeNotifierDirection;
(function (FocusEscapeNotifierDirection) {
    FocusEscapeNotifierDirection[FocusEscapeNotifierDirection["START"] = 0] = "START";
    FocusEscapeNotifierDirection[FocusEscapeNotifierDirection["END"] = 1] = "END";
})(FocusEscapeNotifierDirection || (FocusEscapeNotifierDirection = {}));
/**
 * Like FocusTrap, but rather than trapping focus within a dom region, notifies subscribers when
 * focus leaves the region.
 */
class FocusEscapeNotifier extends FocusTrap {
    _escapeSubject = new Subject();
    constructor(element, checker, ngZone, document) {
        super(element, checker, ngZone, document, true /* deferAnchors */);
        // The focus trap adds "anchors" at the beginning and end of a trapped region that redirect
        // focus. We override that redirect behavior here with simply emitting on a stream.
        this.startAnchorListener = () => {
            this._escapeSubject.next(FocusEscapeNotifierDirection.START);
            return true;
        };
        this.endAnchorListener = () => {
            this._escapeSubject.next(FocusEscapeNotifierDirection.END);
            return true;
        };
        this.attachAnchors();
    }
    escapes() {
        return this._escapeSubject;
    }
}
/** Factory that allows easy instantiation of focus escape notifiers. */
class FocusEscapeNotifierFactory {
    _checker = inject(InteractivityChecker);
    _ngZone = inject(NgZone);
    _document = inject(DOCUMENT);
    /**
     * Creates a focus escape notifier region around the given element.
     * @param element The element around which focus will be monitored.
     * @returns The created focus escape notifier instance.
     */
    create(element) {
        return new FocusEscapeNotifier(element, this._checker, this._ngZone, this._document);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.2.0-next.2", ngImport: i0, type: FocusEscapeNotifierFactory, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "20.2.0-next.2", ngImport: i0, type: FocusEscapeNotifierFactory, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.2.0-next.2", ngImport: i0, type: FocusEscapeNotifierFactory, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });

/** Used for rate-limiting mousemove events. */
const MOUSE_MOVE_THROTTLE_TIME_MS = 10;
function hasRowElement(nl) {
    for (let i = 0; i < nl.length; i++) {
        const el = nl[i];
        if (!(el instanceof HTMLElement)) {
            continue;
        }
        if (el.matches(ROW_SELECTOR)) {
            return true;
        }
    }
    return false;
}
function isRowMutation(mutation) {
    return hasRowElement(mutation.addedNodes) || hasRowElement(mutation.removedNodes);
}
/**
 * A directive that must be attached to enable editability on a table.
 * It is responsible for setting up delegated event handlers and providing the
 * EditEventDispatcher service for use by the other edit directives.
 */
class CdkEditable {
    elementRef = inject(ElementRef);
    editEventDispatcher = inject(EditEventDispatcher);
    focusDispatcher = inject(FocusDispatcher);
    ngZone = inject(NgZone);
    _renderer = inject(Renderer2);
    destroyed = new Subject();
    _rowsRendered = new Subject();
    _rowMutationObserver = globalThis.MutationObserver
        ? new globalThis.MutationObserver(mutations => {
            if (mutations.some(isRowMutation)) {
                this._rowsRendered.next();
            }
        })
        : null;
    constructor() {
        // TODO: consider a design where instead of polling for row changes we just use
        // afterRenderEffect + a signal of the rows.
        afterNextRender(() => {
            this._rowsRendered.next();
            this._rowMutationObserver?.observe(this.elementRef.nativeElement, {
                childList: true,
                subtree: true,
            });
        });
    }
    ngAfterViewInit() {
        this._listenForTableEvents();
    }
    ngOnDestroy() {
        this.destroyed.next();
        this.destroyed.complete();
        this._rowMutationObserver?.disconnect();
    }
    _observableFromEvent(element, name, options) {
        return new Observable(subscriber => {
            const handler = (event) => subscriber.next(event);
            const cleanup = this._renderer.listen(element, name, handler, options);
            return () => {
                cleanup();
                subscriber.complete();
            };
        });
    }
    _listenForTableEvents() {
        const element = this.elementRef.nativeElement;
        const toClosest = (selector) => map((event) => closest(event.target, selector));
        this.ngZone.runOutsideAngular(() => {
            // Track mouse movement over the table to hide/show hover content.
            this._observableFromEvent(element, 'mouseover')
                .pipe(toClosest(ROW_SELECTOR), takeUntil(this.destroyed))
                .subscribe(this.editEventDispatcher.hovering);
            this._observableFromEvent(element, 'mouseleave')
                .pipe(mapTo(null), takeUntil(this.destroyed))
                .subscribe(this.editEventDispatcher.hovering);
            this._observableFromEvent(element, 'mousemove')
                .pipe(throttleTime(MOUSE_MOVE_THROTTLE_TIME_MS), toClosest(ROW_SELECTOR), takeUntil(this.destroyed))
                .subscribe(this.editEventDispatcher.mouseMove);
            // Track focus within the table to hide/show/make focusable hover content.
            this._observableFromEvent(element, 'focus', { capture: true })
                .pipe(toClosest(ROW_SELECTOR), share(), takeUntil(this.destroyed))
                .subscribe(this.editEventDispatcher.focused);
            merge(this._observableFromEvent(element, 'blur', { capture: true }), this._observableFromEvent(element, 'keydown').pipe(filter(event => event.key === 'Escape')))
                .pipe(mapTo(null), share(), takeUntil(this.destroyed))
                .subscribe(this.editEventDispatcher.focused);
            // Keep track of rows within the table. This is used to know which rows with hover content
            // are first or last in the table. They are kept focusable in case focus enters from above
            // or below the table.
            this._rowsRendered
                .pipe(
            // Avoid some timing inconsistencies since Angular v19.
            // TODO: see if we can remove this now that we're using MutationObserver.
            debounceTime(0), 
            // Optimization: ignore dom changes while focus is within the table as we already
            // ensure that rows above and below the focused/active row are tabbable.
            withLatestFrom(this.editEventDispatcher.editingOrFocused), filter(([_, activeRow]) => activeRow == null), map(() => element.querySelectorAll(ROW_SELECTOR)), share(), takeUntil(this.destroyed))
                .subscribe(this.editEventDispatcher.allRows);
            this._observableFromEvent(element, 'keydown')
                .pipe(filter(event => event.key === 'Enter'), toClosest(CELL_SELECTOR), takeUntil(this.destroyed))
                .subscribe(this.editEventDispatcher.editing);
            // Keydown must be used here or else key auto-repeat does not work properly on some platforms.
            this._observableFromEvent(element, 'keydown')
                .pipe(takeUntil(this.destroyed))
                .subscribe(this.focusDispatcher.keyObserver);
        });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.2.0-next.2", ngImport: i0, type: CdkEditable, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "20.2.0-next.2", type: CdkEditable, isStandalone: true, selector: "table[editable], cdk-table[editable], mat-table[editable]", providers: [EditEventDispatcher, EditServices], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.2.0-next.2", ngImport: i0, type: CdkEditable, decorators: [{
            type: Directive,
            args: [{
                    selector: 'table[editable], cdk-table[editable], mat-table[editable]',
                    providers: [EditEventDispatcher, EditServices],
                }]
        }], ctorParameters: () => [] });
const POPOVER_EDIT_HOST_BINDINGS = {
    '[attr.tabindex]': 'disabled ? null : 0',
    'class': 'cdk-popover-edit-cell',
    '[attr.aria-haspopup]': '!disabled',
};
const POPOVER_EDIT_INPUTS = [
    { name: 'template', alias: 'cdkPopoverEdit' },
    { name: 'context', alias: 'cdkPopoverEditContext' },
    { name: 'colspan', alias: 'cdkPopoverEditColspan' },
    { name: 'disabled', alias: 'cdkPopoverEditDisabled' },
    { name: 'ariaLabel', alias: 'cdkPopoverEditAriaLabel' },
];
/**
 * Attaches an ng-template to a cell and shows it when instructed to by the
 * EditEventDispatcher service.
 * Makes the cell focusable.
 */
class CdkPopoverEdit {
    services = inject(EditServices);
    elementRef = inject(ElementRef);
    viewContainerRef = inject(ViewContainerRef);
    _injector = inject(Injector);
    /** The edit lens template shown over the cell on edit. */
    template = null;
    /**
     * Implicit context to pass along to the template. Can be omitted if the template
     * is defined within the cell.
     */
    context;
    /** Aria label to set on the popover dialog element. */
    ariaLabel;
    /**
     * Specifies that the popup should cover additional table cells before and/or after
     * this one.
     */
    get colspan() {
        return this._colspan;
    }
    set colspan(value) {
        this._colspan = value;
        // Recompute positioning when the colspan changes.
        if (this.overlayRef) {
            this.overlayRef.updatePositionStrategy(this._getPositionStrategy());
            if (this.overlayRef.hasAttached()) {
                this._updateOverlaySize();
            }
        }
    }
    _colspan = {};
    /** Whether popover edit is disabled for this cell. */
    get disabled() {
        return this._disabled;
    }
    set disabled(value) {
        this._disabled = value;
        if (value) {
            this.services.editEventDispatcher.doneEditingCell(this.elementRef.nativeElement);
            this.services.editEventDispatcher.disabledCells.set(this.elementRef.nativeElement, true);
        }
        else {
            this.services.editEventDispatcher.disabledCells.delete(this.elementRef.nativeElement);
        }
    }
    _disabled = false;
    focusTrap;
    overlayRef;
    destroyed = new Subject();
    ngAfterViewInit() {
        this._startListeningToEditEvents();
    }
    ngOnDestroy() {
        this.destroyed.next();
        this.destroyed.complete();
        if (this.focusTrap) {
            this.focusTrap.destroy();
            this.focusTrap = undefined;
        }
        if (this.overlayRef) {
            this.overlayRef.dispose();
        }
    }
    initFocusTrap() {
        this.focusTrap = this.services.focusTrapFactory.create(this.overlayRef.overlayElement);
    }
    closeEditOverlay() {
        this.services.editEventDispatcher.doneEditingCell(this.elementRef.nativeElement);
    }
    panelClass() {
        return EDIT_PANE_CLASS;
    }
    _startListeningToEditEvents() {
        this.services.editEventDispatcher
            .editingCell(this.elementRef.nativeElement)
            .pipe(takeUntil(this.destroyed))
            .subscribe(open => {
            if (open && this.template) {
                if (!this.overlayRef) {
                    this._createEditOverlay();
                }
                this._showEditOverlay();
            }
            else if (this.overlayRef) {
                this._maybeReturnFocusToCell();
                this.overlayRef.detach();
            }
        });
    }
    _createEditOverlay() {
        this.overlayRef = createOverlayRef(this._injector, {
            disposeOnNavigation: true,
            panelClass: this.panelClass(),
            positionStrategy: this._getPositionStrategy(),
            scrollStrategy: createRepositionScrollStrategy(this._injector),
            direction: this.services.directionality,
        });
        this.initFocusTrap();
        this.overlayRef.overlayElement.setAttribute('role', 'dialog');
        if (this.ariaLabel) {
            this.overlayRef.overlayElement.setAttribute('aria-label', this.ariaLabel);
        }
        this.overlayRef.detachments().subscribe(() => this.closeEditOverlay());
    }
    _showEditOverlay() {
        this.overlayRef.attach(new TemplatePortal(this.template, this.viewContainerRef, { $implicit: this.context }));
        // We have to defer trapping focus, because doing so too early can cause the form inside
        // the overlay to be submitted immediately if it was opened on an Enter keydown event.
        this.services.ngZone.runOutsideAngular(() => {
            setTimeout(() => {
                this.focusTrap.focusInitialElement();
            });
        });
        // Update the size of the popup initially and on subsequent changes to
        // scroll position and viewport size.
        merge(this.services.scrollDispatcher.scrolled(), this.services.viewportRuler.change())
            .pipe(startWith(null), takeUntil(merge(this.overlayRef.detachments(), this.destroyed)))
            .subscribe(() => {
            this._updateOverlaySize();
        });
    }
    _getOverlayCells() {
        const cell = closest(this.elementRef.nativeElement, CELL_SELECTOR);
        if (!this._colspan.before && !this._colspan.after) {
            return [cell];
        }
        const row = closest(this.elementRef.nativeElement, ROW_SELECTOR);
        const rowCells = Array.from(row.querySelectorAll(CELL_SELECTOR));
        const ownIndex = rowCells.indexOf(cell);
        return rowCells.slice(ownIndex - (this._colspan.before || 0), ownIndex + (this._colspan.after || 0) + 1);
    }
    _getPositionStrategy() {
        const cells = this._getOverlayCells();
        return createFlexibleConnectedPositionStrategy(this._injector, cells[0])
            .withGrowAfterOpen()
            .withPush()
            .withViewportMargin(16)
            .withPositions([
            {
                originX: 'start',
                originY: 'top',
                overlayX: 'start',
                overlayY: 'top',
            },
        ]);
    }
    _updateOverlaySize() {
        this.overlayRef.updateSize(this._sizeConfigForCells(this._getOverlayCells()));
    }
    _maybeReturnFocusToCell() {
        if (closest(document.activeElement, EDIT_PANE_SELECTOR) === this.overlayRef.overlayElement) {
            this.elementRef.nativeElement.focus();
        }
    }
    _sizeConfigForCells(cells) {
        if (cells.length === 0) {
            return {};
        }
        if (cells.length === 1) {
            return { width: cells[0].getBoundingClientRect().width };
        }
        let firstCell, lastCell;
        if (this.services.directionality.value === 'ltr') {
            firstCell = cells[0];
            lastCell = cells[cells.length - 1];
        }
        else {
            lastCell = cells[0];
            firstCell = cells[cells.length - 1];
        }
        return { width: lastCell.getBoundingClientRect().right - firstCell.getBoundingClientRect().left };
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.2.0-next.2", ngImport: i0, type: CdkPopoverEdit, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "20.2.0-next.2", type: CdkPopoverEdit, isStandalone: true, selector: "[cdkPopoverEdit]:not([cdkPopoverEditTabOut])", inputs: { template: ["cdkPopoverEdit", "template"], context: ["cdkPopoverEditContext", "context"], colspan: ["cdkPopoverEditColspan", "colspan"], disabled: ["cdkPopoverEditDisabled", "disabled"], ariaLabel: ["cdkPopoverEditAriaLabel", "ariaLabel"] }, host: { properties: { "attr.tabindex": "disabled ? null : 0", "attr.aria-haspopup": "!disabled" }, classAttribute: "cdk-popover-edit-cell" }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.2.0-next.2", ngImport: i0, type: CdkPopoverEdit, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkPopoverEdit]:not([cdkPopoverEditTabOut])',
                    host: POPOVER_EDIT_HOST_BINDINGS,
                    inputs: POPOVER_EDIT_INPUTS,
                }]
        }] });
/**
 * Attaches an ng-template to a cell and shows it when instructed to by the
 * EditEventDispatcher service.
 * Makes the cell focusable.
 */
class CdkPopoverEditTabOut extends CdkPopoverEdit {
    focusEscapeNotifierFactory = inject(FocusEscapeNotifierFactory);
    focusTrap = undefined;
    initFocusTrap() {
        this.focusTrap = this.focusEscapeNotifierFactory.create(this.overlayRef.overlayElement);
        this.focusTrap
            .escapes()
            .pipe(takeUntil(this.destroyed))
            .subscribe(direction => {
            this.services.editEventDispatcher.editRef?.blur();
            this.services.focusDispatcher.moveFocusHorizontally(closest(this.elementRef.nativeElement, CELL_SELECTOR), direction === FocusEscapeNotifierDirection.START ? -1 : 1);
            this.closeEditOverlay();
        });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.2.0-next.2", ngImport: i0, type: CdkPopoverEditTabOut, deps: null, target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "20.2.0-next.2", type: CdkPopoverEditTabOut, isStandalone: true, selector: "[cdkPopoverEdit][cdkPopoverEditTabOut]", inputs: { template: ["cdkPopoverEdit", "template"], context: ["cdkPopoverEditContext", "context"], colspan: ["cdkPopoverEditColspan", "colspan"], disabled: ["cdkPopoverEditDisabled", "disabled"], ariaLabel: ["cdkPopoverEditAriaLabel", "ariaLabel"] }, host: { properties: { "attr.tabindex": "disabled ? null : 0", "attr.aria-haspopup": "!disabled" }, classAttribute: "cdk-popover-edit-cell" }, usesInheritance: true, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.2.0-next.2", ngImport: i0, type: CdkPopoverEditTabOut, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkPopoverEdit][cdkPopoverEditTabOut]',
                    host: POPOVER_EDIT_HOST_BINDINGS,
                    inputs: POPOVER_EDIT_INPUTS,
                }]
        }] });
/**
 * A structural directive that shows its contents when the table row containing
 * it is hovered or when an element in the row has focus.
 */
class CdkRowHoverContent {
    services = inject(EditServices);
    elementRef = inject(ElementRef);
    templateRef = inject(TemplateRef);
    viewContainerRef = inject(ViewContainerRef);
    destroyed = new Subject();
    viewRef = null;
    _row;
    ngAfterViewInit() {
        this._row = closest(this.elementRef.nativeElement, ROW_SELECTOR);
        this.services.editEventDispatcher.registerRowWithHoverContent(this._row);
        this._listenForHoverAndFocusEvents();
    }
    ngOnDestroy() {
        this.destroyed.next();
        this.destroyed.complete();
        if (this.viewRef) {
            this.viewRef.destroy();
        }
        if (this._row) {
            this.services.editEventDispatcher.deregisterRowWithHoverContent(this._row);
        }
    }
    /**
     * Called immediately after the hover content is created and added to the dom.
     * In the CDK version, this is a noop but subclasses such as MatRowHoverContent use this
     * to prepare/style the inserted element.
     */
    initElement(_) { }
    /**
     * Called when the hover content needs to be focusable to preserve a reasonable tab ordering
     * but should not yet be shown.
     */
    makeElementHiddenButFocusable(element) {
        element.style.opacity = '0';
    }
    /**
     * Called when the hover content needs to be focusable to preserve a reasonable tab ordering
     * but should not yet be shown.
     */
    makeElementVisible(element) {
        element.style.opacity = '';
    }
    _listenForHoverAndFocusEvents() {
        this.services.editEventDispatcher
            .hoverOrFocusOnRow(this._row)
            .pipe(takeUntil(this.destroyed))
            .subscribe(eventState => {
            // When in FOCUSABLE state, add the hover content to the dom but make it transparent so
            // that it is in the tab order relative to the currently focused row.
            if (eventState === HoverContentState.ON || eventState === HoverContentState.FOCUSABLE) {
                if (!this.viewRef) {
                    this.viewRef = this.viewContainerRef.createEmbeddedView(this.templateRef, {});
                    this.initElement(this.viewRef.rootNodes[0]);
                    this.viewRef.markForCheck();
                }
                else if (this.viewContainerRef.indexOf(this.viewRef) === -1) {
                    this.viewContainerRef.insert(this.viewRef);
                    this.viewRef.markForCheck();
                }
                if (eventState === HoverContentState.ON) {
                    this.makeElementVisible(this.viewRef.rootNodes[0]);
                }
                else {
                    this.makeElementHiddenButFocusable(this.viewRef.rootNodes[0]);
                }
            }
            else if (this.viewRef) {
                this.viewContainerRef.detach(this.viewContainerRef.indexOf(this.viewRef));
            }
        });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.2.0-next.2", ngImport: i0, type: CdkRowHoverContent, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "20.2.0-next.2", type: CdkRowHoverContent, isStandalone: true, selector: "[cdkRowHoverContent]", ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.2.0-next.2", ngImport: i0, type: CdkRowHoverContent, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkRowHoverContent]',
                }]
        }] });
/**
 * Opens the closest edit popover to this element, whether it's associated with this exact
 * element or an ancestor element.
 */
class CdkEditOpen {
    elementRef = inject(ElementRef);
    editEventDispatcher = inject(EditEventDispatcher);
    constructor() {
        const elementRef = this.elementRef;
        const nativeElement = elementRef.nativeElement;
        // Prevent accidental form submits.
        if (nativeElement.nodeName === 'BUTTON' && !nativeElement.getAttribute('type')) {
            nativeElement.setAttribute('type', 'button');
        }
    }
    openEdit(evt) {
        this.editEventDispatcher.editing.next(closest(this.elementRef.nativeElement, CELL_SELECTOR));
        evt.stopPropagation();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.2.0-next.2", ngImport: i0, type: CdkEditOpen, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "20.2.0-next.2", type: CdkEditOpen, isStandalone: true, selector: "[cdkEditOpen]", host: { listeners: { "click": "openEdit($event)" } }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.2.0-next.2", ngImport: i0, type: CdkEditOpen, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkEditOpen]',
                    host: {
                        '(click)': 'openEdit($event)',
                    },
                }]
        }], ctorParameters: () => [] });

const EXPORTED_DECLARATIONS = [
    CdkPopoverEdit,
    CdkPopoverEditTabOut,
    CdkRowHoverContent,
    CdkEditControl,
    CdkEditRevert,
    CdkEditClose,
    CdkEditable,
    CdkEditOpen,
];
class CdkPopoverEditModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.2.0-next.2", ngImport: i0, type: CdkPopoverEditModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "20.2.0-next.2", ngImport: i0, type: CdkPopoverEditModule, imports: [OverlayModule, CdkPopoverEdit,
            CdkPopoverEditTabOut,
            CdkRowHoverContent,
            CdkEditControl,
            CdkEditRevert,
            CdkEditClose,
            CdkEditable,
            CdkEditOpen], exports: [CdkPopoverEdit,
            CdkPopoverEditTabOut,
            CdkRowHoverContent,
            CdkEditControl,
            CdkEditRevert,
            CdkEditClose,
            CdkEditable,
            CdkEditOpen] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "20.2.0-next.2", ngImport: i0, type: CdkPopoverEditModule, imports: [OverlayModule] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.2.0-next.2", ngImport: i0, type: CdkPopoverEditModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [OverlayModule, ...EXPORTED_DECLARATIONS],
                    exports: EXPORTED_DECLARATIONS,
                }]
        }] });

export { CdkEditClose, CdkEditControl, CdkEditOpen, CdkEditRevert, CdkEditable, CdkPopoverEdit, CdkPopoverEditModule, CdkPopoverEditTabOut, CdkRowHoverContent, EditEventDispatcher, EditRef, FocusDispatcher, FormValueContainer, HoverContentState, CELL_SELECTOR as _CELL_SELECTOR, closest as _closest };
//# sourceMappingURL=popover-edit.mjs.map
