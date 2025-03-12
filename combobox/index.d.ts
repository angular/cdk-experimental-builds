import * as i0 from '@angular/core';
import { InjectionToken, OnDestroy, ViewContainerRef, TemplateRef, EventEmitter, OnInit } from '@angular/core';
import * as i1 from '@angular/cdk/overlay';
import { BooleanInput } from '@angular/cdk/coercion';

type AriaHasPopupValue = 'false' | 'true' | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';
type OpenAction = 'focus' | 'click' | 'downKey' | 'toggle';
type OpenActionInput = OpenAction | OpenAction[] | string | null | undefined;
declare const CDK_COMBOBOX: InjectionToken<CdkCombobox<unknown>>;
declare class CdkCombobox<T = unknown> implements OnDestroy {
    private readonly _elementRef;
    private readonly _overlay;
    protected readonly _viewContainerRef: ViewContainerRef;
    private readonly _injector;
    private readonly _doc;
    private readonly _directionality;
    private _changeDetectorRef;
    private _overlayRef;
    private _panelPortal;
    _panelTemplateRef: TemplateRef<unknown>;
    value: T | T[];
    get disabled(): boolean;
    set disabled(value: BooleanInput);
    private _disabled;
    get openActions(): OpenAction[];
    set openActions(action: OpenActionInput);
    private _openActions;
    /** Whether the textContent is automatically updated upon change of the combobox value. */
    get autoSetText(): boolean;
    set autoSetText(value: BooleanInput);
    private _autoSetText;
    readonly opened: EventEmitter<void>;
    readonly closed: EventEmitter<void>;
    readonly panelValueChanged: EventEmitter<T[]>;
    contentId: string;
    contentType: AriaHasPopupValue;
    ngOnDestroy(): void;
    _keydown(event: KeyboardEvent): void;
    /** Handles click or focus interactions. */
    _handleInteractions(interaction: OpenAction): void;
    /** Given a click in the document, determines if the click was inside a combobox. */
    _attemptClose(event: MouseEvent): void;
    /** Toggles the open state of the panel. */
    toggle(): void;
    /** If the combobox is closed and not disabled, opens the panel. */
    open(): void;
    /** If the combobox is open and not disabled, closes the panel. */
    close(): void;
    /** Returns true if panel is currently opened. */
    isOpen(): boolean;
    /** Returns true if combobox has a child panel. */
    hasPanel(): boolean;
    _getTabIndex(): string | null;
    private _setComboboxValue;
    updateAndClose(value: T | T[]): void;
    private _setTextContent;
    private _isTextTrigger;
    private _getOverlayConfig;
    private _getOverlayPositionStrategy;
    private _getOverlayPositions;
    private _getPanelInjector;
    private _getPanelContent;
    private _coerceOpenActionProperty;
    /** Registers the content's id and the content type with the panel. */
    _registerContent(contentId: string, contentType: AriaHasPopupValue): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<CdkCombobox<any>, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<CdkCombobox<any>, "[cdkCombobox]", ["cdkCombobox"], { "_panelTemplateRef": { "alias": "cdkComboboxTriggerFor"; "required": false; }; "value": { "alias": "value"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; "openActions": { "alias": "openActions"; "required": false; }; "autoSetText": { "alias": "autoSetText"; "required": false; }; }, { "opened": "comboboxPanelOpened"; "closed": "comboboxPanelClosed"; "panelValueChanged": "panelValueChanged"; }, never, never, true, never>;
}

declare class CdkComboboxPopup<T = unknown> implements OnInit {
    private readonly _elementRef;
    private readonly _combobox;
    get role(): AriaHasPopupValue;
    set role(value: AriaHasPopupValue);
    private _role;
    get firstFocus(): HTMLElement;
    set firstFocus(id: HTMLElement);
    private _firstFocusElement;
    id: string;
    ngOnInit(): void;
    registerWithPanel(): void;
    focusFirstElement(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<CdkComboboxPopup<any>, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<CdkComboboxPopup<any>, "[cdkComboboxPopup]", ["cdkComboboxPopup"], { "role": { "alias": "role"; "required": false; }; "firstFocus": { "alias": "firstFocus"; "required": false; }; "id": { "alias": "id"; "required": false; }; }, {}, never, never, true, never>;
}

declare class CdkComboboxModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<CdkComboboxModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<CdkComboboxModule, never, [typeof i1.OverlayModule, typeof CdkCombobox, typeof CdkComboboxPopup], [typeof CdkCombobox, typeof CdkComboboxPopup]>;
    static ɵinj: i0.ɵɵInjectorDeclaration<CdkComboboxModule>;
}

export { type AriaHasPopupValue, CDK_COMBOBOX, CdkCombobox, CdkComboboxModule, CdkComboboxPopup, type OpenAction, type OpenActionInput };
