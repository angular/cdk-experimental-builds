import { Subject, Observable, PartialObserver } from 'rxjs';
import * as _angular_core from '@angular/core';
import { OnDestroy, OnInit, ElementRef, EventEmitter, NgZone, AfterViewInit, ViewContainerRef, TemplateRef, EmbeddedViewRef } from '@angular/core';
import { Directionality } from '@angular/cdk/bidi';
import * as i1 from '@angular/cdk/overlay';
import { OverlayRef } from '@angular/cdk/overlay';
import { FocusTrapFactory, FocusTrap, InteractivityChecker } from '@angular/cdk/a11y';
import { ScrollDispatcher, ViewportRuler } from '@angular/cdk/scrolling';

/**
 * The possible states for hover content:
 * OFF - Not rendered.
 * FOCUSABLE - Rendered in the dom and styled for its contents to be focusable but invisible.
 * ON - Rendered and fully visible.
 */
declare enum HoverContentState {
    OFF = 0,
    FOCUSABLE = 1,
    ON = 2
}
/**
 * Service for sharing delegated events and state for triggering table edits.
 */
declare class EditEventDispatcher<R> {
    private readonly _ngZone;
    /** A subject that indicates which table cell is currently editing (unless it is disabled). */
    readonly editing: Subject<Element | null>;
    /** A subject that indicates which table row is currently hovered. */
    readonly hovering: Subject<Element | null>;
    /** A subject that indicates which table row currently contains focus. */
    readonly focused: Subject<Element | null>;
    /** A subject that indicates all elements in the table matching ROW_SELECTOR. */
    readonly allRows: Subject<NodeList>;
    /** A subject that emits mouse move events from the table indicating the targeted row. */
    readonly mouseMove: Subject<Element | null>;
    /**
     * Tracks the currently disabled editable cells - edit calls will be ignored
     * for these cells.
     */
    readonly disabledCells: WeakMap<Element, boolean>;
    /** The EditRef for the currently active edit lens (if any). */
    get editRef(): R | null;
    private _editRef;
    private readonly _distinctUntilChanged;
    private readonly _startWithNull;
    private readonly _distinctShare;
    private readonly _startWithNullDistinct;
    readonly editingAndEnabled: Observable<Element | null>;
    /** An observable that emits the row containing focus or an active edit. */
    readonly editingOrFocused: Observable<Element | null>;
    /** Tracks rows that contain hover content with a reference count. */
    private _rowsWithHoverContent;
    /** The table cell that has an active edit lens (or null). */
    private _currentlyEditing;
    /** The combined set of row hover content states organized by row. */
    private readonly _hoveredContentStateDistinct;
    private readonly _editingAndEnabledDistinct;
    private _lastSeenRow;
    private _lastSeenRowHoverOrFocus;
    constructor();
    /**
     * Gets an Observable that emits true when the specified element's cell
     * is editing and false when not.
     */
    editingCell(element: Element | EventTarget): Observable<boolean>;
    /**
     * Stops editing for the specified cell. If the specified cell is not the current
     * edit cell, does nothing.
     */
    doneEditingCell(element: Element | EventTarget): void;
    /** Sets the currently active EditRef. */
    setActiveEditRef(ref: R): void;
    /** Unset the currently active EditRef, if the specified editRef is active. */
    unsetActiveEditRef(ref: R): void;
    /** Adds the specified table row to be tracked for first/last row comparisons. */
    registerRowWithHoverContent(row: Element): void;
    /**
     * Reference decrements and ultimately removes the specified table row from first/last row
     * comparisons.
     */
    deregisterRowWithHoverContent(row: Element): void;
    /**
     * Gets an Observable that emits true when the specified element's row
     * contains the focused element or is being hovered over and false when not.
     * Hovering is defined as when the mouse has momentarily stopped moving over the cell.
     */
    hoverOrFocusOnRow(row: Element): Observable<HoverContentState>;
    /**
     * RxJS operator that enters the Angular zone, used to reduce boilerplate in
     * re-entering the zone for stream pipelines.
     */
    private _enterZone;
    private _getFirstRowWithHoverContent;
    private _getLastRowWithHoverContent;
    private _mapAllRowsToSingleRow;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<EditEventDispatcher<any>, never>;
    static ɵprov: _angular_core.ɵɵInjectableDeclaration<EditEventDispatcher<any>>;
}

/**
 * Used for communication between the form within the edit lens and the
 * table that launched it. Provided by CdkEditControl within the lens.
 */
declare class EditRef<FormValue> implements OnDestroy {
    private readonly _form;
    private readonly _editEventDispatcher;
    /** Emits the final value of this edit instance before closing. */
    private readonly _finalValueSubject;
    readonly finalValue: Observable<FormValue>;
    /** Emits when the user tabs out of this edit lens before closing. */
    private readonly _blurredSubject;
    readonly blurred: Observable<void>;
    /** The value to set the form back to on revert. */
    private _revertFormValue;
    private _injector;
    constructor();
    /**
     * Called by the host directive's OnInit hook. Reads the initial state of the
     * form and overrides it with persisted state from previous openings, if
     * applicable.
     */
    init(previousFormValue: FormValue | undefined): void;
    ngOnDestroy(): void;
    /** Whether the attached form is in a valid state. */
    isValid(): boolean | null;
    /** Set the form's current value as what it will be set to on revert/reset. */
    updateRevertValue(): void;
    /** Tells the table to close the edit popup. */
    close(): void;
    /** Notifies the active edit that the user has moved focus out of the lens. */
    blur(): void;
    /**
     * Resets the form value to the specified value or the previously set
     * revert value.
     */
    reset(value?: FormValue): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<EditRef<any>, never>;
    static ɵprov: _angular_core.ɵɵInjectableDeclaration<EditRef<any>>;
}

/**
 * Service responsible for moving cell focus around in response to keyboard events.
 * May be overridden to customize the keyboard behavior of popover edit.
 */
declare class FocusDispatcher {
    protected readonly directionality: Directionality;
    /** Observes keydown events triggered from the table. */
    readonly keyObserver: PartialObserver<KeyboardEvent>;
    constructor();
    /**
     * Moves focus to earlier or later cells (in dom order) by offset cells relative to
     * currentCell.
     */
    moveFocusHorizontally(currentCell: HTMLElement, offset: number): void;
    /** Moves focus to up or down by row by offset cells relative to currentCell. */
    moveFocusVertically(currentCell: HTMLElement, offset: number): void;
    /** Translates arrow keydown events into focus move operations. */
    protected handleKeyboardEvent(event: KeyboardEvent): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<FocusDispatcher, never>;
    static ɵprov: _angular_core.ɵɵInjectableDeclaration<FocusDispatcher>;
}

interface Entry<FormValue> {
    value?: FormValue;
}
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
declare class FormValueContainer<Key extends object, FormValue> {
    private _formValues;
    for(key: Key): Entry<FormValue>;
}

/** Options for what do to when the user clicks outside of an edit lens. */
type PopoverEditClickOutBehavior = 'close' | 'submit' | 'noop';
/**
 * A directive that attaches to a form within the edit lens.
 * It coordinates the form state with the table-wide edit system and handles
 * closing the edit lens when the form is submitted or the user clicks
 * out.
 */
declare class CdkEditControl<FormValue> implements OnDestroy, OnInit {
    protected readonly elementRef: ElementRef<any>;
    readonly editRef: EditRef<FormValue>;
    protected readonly destroyed: Subject<void>;
    /**
     * Specifies what should happen when the user clicks outside of the edit lens.
     * The default behavior is to close the lens without submitting the form.
     */
    clickOutBehavior: PopoverEditClickOutBehavior;
    /**
     * A two-way binding for storing unsubmitted form state. If not provided
     * then form state will be discarded on close. The PeristBy directive is offered
     * as a convenient shortcut for these bindings.
     */
    preservedFormValue?: FormValue;
    readonly preservedFormValueChange: EventEmitter<FormValue>;
    /**
     * Determines whether the lens will close on form submit if the form is not in a valid
     * state. By default the lens will remain open.
     */
    ignoreSubmitUnlessValid: boolean;
    ngOnInit(): void;
    ngOnDestroy(): void;
    /**
     * Called when the form submits. If ignoreSubmitUnlessValid is true, checks
     * the form for validity before proceeding.
     * Updates the revert state with the latest submitted value then closes the edit.
     */
    handleFormSubmit(): void;
    /** Called on Escape keyup. Closes the edit. */
    close(): void;
    /**
     * Called on click anywhere in the document.
     * If the click was outside of the lens, trigger the specified click out behavior.
     */
    handlePossibleClickOut(evt: Event): void;
    _handleKeydown(event: KeyboardEvent): void;
    /** Triggers submit on tab out if clickOutBehavior is 'submit'. */
    private _handleBlur;
    private _triggerFormSubmit;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CdkEditControl<any>, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<CdkEditControl<any>, "form[cdkEditControl]", never, { "clickOutBehavior": { "alias": "cdkEditControlClickOutBehavior"; "required": false; }; "preservedFormValue": { "alias": "cdkEditControlPreservedFormValue"; "required": false; }; "ignoreSubmitUnlessValid": { "alias": "cdkEditControlIgnoreSubmitUnlessValid"; "required": false; }; }, { "preservedFormValueChange": "cdkEditControlPreservedFormValueChange"; }, never, never, true, never>;
}
/** Reverts the form to its initial or previously submitted state on click. */
declare class CdkEditRevert<FormValue> {
    protected readonly editRef: EditRef<FormValue>;
    /** Type of the button. Defaults to `button` to avoid accident form submits. */
    type: string;
    revertEdit(): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CdkEditRevert<any>, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<CdkEditRevert<any>, "button[cdkEditRevert]", never, { "type": { "alias": "type"; "required": false; }; }, {}, never, never, true, never>;
}
/** Closes the lens on click. */
declare class CdkEditClose<FormValue> {
    protected readonly elementRef: ElementRef<HTMLElement>;
    protected readonly editRef: EditRef<FormValue>;
    constructor();
    closeEdit(): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CdkEditClose<any>, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<CdkEditClose<any>, "[cdkEditClose]", never, {}, {}, never, never, true, never>;
}

/**
 * Optimization
 * Collects multiple Injectables into a singleton shared across the table. By reducing the
 * number of services injected into each CdkPopoverEdit, this saves about 0.023ms of cpu time
 * and 56 bytes of memory per instance.
 */
declare class EditServices {
    readonly directionality: Directionality;
    readonly editEventDispatcher: EditEventDispatcher<EditRef<unknown>>;
    readonly focusDispatcher: FocusDispatcher;
    readonly focusTrapFactory: FocusTrapFactory;
    readonly ngZone: NgZone;
    readonly scrollDispatcher: ScrollDispatcher;
    readonly viewportRuler: ViewportRuler;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<EditServices, never>;
    static ɵprov: _angular_core.ɵɵInjectableDeclaration<EditServices>;
}

/** Value indicating whether focus left the target area before or after the enclosed elements. */
declare enum FocusEscapeNotifierDirection {
    START = 0,
    END = 1
}
/**
 * Like FocusTrap, but rather than trapping focus within a dom region, notifies subscribers when
 * focus leaves the region.
 */
declare class FocusEscapeNotifier extends FocusTrap {
    private readonly _escapeSubject;
    constructor(element: HTMLElement, checker: InteractivityChecker, ngZone: NgZone, document: Document);
    escapes(): Observable<FocusEscapeNotifierDirection>;
}
/** Factory that allows easy instantiation of focus escape notifiers. */
declare class FocusEscapeNotifierFactory {
    private _checker;
    private _ngZone;
    private _document;
    /**
     * Creates a focus escape notifier region around the given element.
     * @param element The element around which focus will be monitored.
     * @returns The created focus escape notifier instance.
     */
    create(element: HTMLElement): FocusEscapeNotifier;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<FocusEscapeNotifierFactory, never>;
    static ɵprov: _angular_core.ɵɵInjectableDeclaration<FocusEscapeNotifierFactory>;
}

/**
 * Describes the number of columns before and after the originating cell that the
 * edit popup should span. In left to right locales, before means left and after means
 * right. In right to left locales before means right and after means left.
 */
interface CdkPopoverEditColspan {
    before?: number;
    after?: number;
}
/**
 * A directive that must be attached to enable editability on a table.
 * It is responsible for setting up delegated event handlers and providing the
 * EditEventDispatcher service for use by the other edit directives.
 */
declare class CdkEditable implements AfterViewInit, OnDestroy {
    protected readonly elementRef: ElementRef<any>;
    protected readonly editEventDispatcher: EditEventDispatcher<EditRef<unknown>>;
    protected readonly focusDispatcher: FocusDispatcher;
    protected readonly ngZone: NgZone;
    private readonly _renderer;
    protected readonly destroyed: Subject<void>;
    private _rowsRendered;
    private _rowMutationObserver;
    constructor();
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    private _observableFromEvent;
    private _listenForTableEvents;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CdkEditable, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<CdkEditable, "table[editable], cdk-table[editable], mat-table[editable]", never, {}, {}, never, never, true, never>;
}
/**
 * Attaches an ng-template to a cell and shows it when instructed to by the
 * EditEventDispatcher service.
 * Makes the cell focusable.
 */
declare class CdkPopoverEdit<C> implements AfterViewInit, OnDestroy {
    protected readonly services: EditServices;
    protected readonly elementRef: ElementRef<any>;
    protected readonly viewContainerRef: ViewContainerRef;
    private _injector;
    /** The edit lens template shown over the cell on edit. */
    template: TemplateRef<any> | null;
    /**
     * Implicit context to pass along to the template. Can be omitted if the template
     * is defined within the cell.
     */
    context?: C;
    /** Aria label to set on the popover dialog element. */
    ariaLabel?: string;
    /**
     * Specifies that the popup should cover additional table cells before and/or after
     * this one.
     */
    get colspan(): CdkPopoverEditColspan;
    set colspan(value: CdkPopoverEditColspan);
    private _colspan;
    /** Whether popover edit is disabled for this cell. */
    get disabled(): boolean;
    set disabled(value: boolean);
    private _disabled;
    protected focusTrap?: FocusTrap;
    protected overlayRef?: OverlayRef;
    protected readonly destroyed: Subject<void>;
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    protected initFocusTrap(): void;
    protected closeEditOverlay(): void;
    protected panelClass(): string;
    private _startListeningToEditEvents;
    private _createEditOverlay;
    private _showEditOverlay;
    private _getOverlayCells;
    private _getPositionStrategy;
    private _updateOverlaySize;
    private _maybeReturnFocusToCell;
    private _sizeConfigForCells;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CdkPopoverEdit<any>, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<CdkPopoverEdit<any>, "[cdkPopoverEdit]:not([cdkPopoverEditTabOut])", never, { "template": { "alias": "cdkPopoverEdit"; "required": false; }; "context": { "alias": "cdkPopoverEditContext"; "required": false; }; "colspan": { "alias": "cdkPopoverEditColspan"; "required": false; }; "disabled": { "alias": "cdkPopoverEditDisabled"; "required": false; }; "ariaLabel": { "alias": "cdkPopoverEditAriaLabel"; "required": false; }; }, {}, never, never, true, never>;
}
/**
 * Attaches an ng-template to a cell and shows it when instructed to by the
 * EditEventDispatcher service.
 * Makes the cell focusable.
 */
declare class CdkPopoverEditTabOut<C> extends CdkPopoverEdit<C> {
    protected readonly focusEscapeNotifierFactory: FocusEscapeNotifierFactory;
    protected focusTrap?: FocusEscapeNotifier;
    protected initFocusTrap(): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CdkPopoverEditTabOut<any>, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<CdkPopoverEditTabOut<any>, "[cdkPopoverEdit][cdkPopoverEditTabOut]", never, { "template": { "alias": "cdkPopoverEdit"; "required": false; }; "context": { "alias": "cdkPopoverEditContext"; "required": false; }; "colspan": { "alias": "cdkPopoverEditColspan"; "required": false; }; "disabled": { "alias": "cdkPopoverEditDisabled"; "required": false; }; "ariaLabel": { "alias": "cdkPopoverEditAriaLabel"; "required": false; }; }, {}, never, never, true, never>;
}
/**
 * A structural directive that shows its contents when the table row containing
 * it is hovered or when an element in the row has focus.
 */
declare class CdkRowHoverContent implements AfterViewInit, OnDestroy {
    protected readonly services: EditServices;
    protected readonly elementRef: ElementRef<any>;
    protected readonly templateRef: TemplateRef<any>;
    protected readonly viewContainerRef: ViewContainerRef;
    protected readonly destroyed: Subject<void>;
    protected viewRef: EmbeddedViewRef<any> | null;
    private _row?;
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    /**
     * Called immediately after the hover content is created and added to the dom.
     * In the CDK version, this is a noop but subclasses such as MatRowHoverContent use this
     * to prepare/style the inserted element.
     */
    protected initElement(_: HTMLElement): void;
    /**
     * Called when the hover content needs to be focusable to preserve a reasonable tab ordering
     * but should not yet be shown.
     */
    protected makeElementHiddenButFocusable(element: HTMLElement): void;
    /**
     * Called when the hover content needs to be focusable to preserve a reasonable tab ordering
     * but should not yet be shown.
     */
    protected makeElementVisible(element: HTMLElement): void;
    private _listenForHoverAndFocusEvents;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CdkRowHoverContent, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<CdkRowHoverContent, "[cdkRowHoverContent]", never, {}, {}, never, never, true, never>;
}
/**
 * Opens the closest edit popover to this element, whether it's associated with this exact
 * element or an ancestor element.
 */
declare class CdkEditOpen {
    protected readonly elementRef: ElementRef<HTMLElement>;
    protected readonly editEventDispatcher: EditEventDispatcher<EditRef<unknown>>;
    constructor();
    openEdit(evt: Event): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CdkEditOpen, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<CdkEditOpen, "[cdkEditOpen]", never, {}, {}, never, never, true, never>;
}

declare class CdkPopoverEditModule {
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CdkPopoverEditModule, never>;
    static ɵmod: _angular_core.ɵɵNgModuleDeclaration<CdkPopoverEditModule, never, [typeof i1.OverlayModule, typeof CdkPopoverEdit, typeof CdkPopoverEditTabOut, typeof CdkRowHoverContent, typeof CdkEditControl, typeof CdkEditRevert, typeof CdkEditClose, typeof CdkEditable, typeof CdkEditOpen], [typeof CdkPopoverEdit, typeof CdkPopoverEditTabOut, typeof CdkRowHoverContent, typeof CdkEditControl, typeof CdkEditRevert, typeof CdkEditClose, typeof CdkEditable, typeof CdkEditOpen]>;
    static ɵinj: _angular_core.ɵɵInjectorDeclaration<CdkPopoverEditModule>;
}

/** Selector for finding table cells. */
declare const CELL_SELECTOR = ".cdk-cell, .mat-cell, td";

/** closest implementation that is able to start from non-Element Nodes. */
declare function closest(element: EventTarget | Element | null | undefined, selector: string): Element | null;

export { CdkEditClose, CdkEditControl, CdkEditOpen, CdkEditRevert, CdkEditable, CdkPopoverEdit, CdkPopoverEditModule, CdkPopoverEditTabOut, CdkRowHoverContent, EditEventDispatcher, EditRef, FocusDispatcher, FormValueContainer, HoverContentState, CELL_SELECTOR as _CELL_SELECTOR, closest as _closest };
export type { CdkPopoverEditColspan, Entry, PopoverEditClickOutBehavior };
