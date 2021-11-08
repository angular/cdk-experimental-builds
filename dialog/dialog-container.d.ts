/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { AnimationEvent } from '@angular/animations';
import { FocusTrapFactory, InteractivityChecker } from '@angular/cdk/a11y';
import { BasePortalOutlet, CdkPortalOutlet, ComponentPortal, DomPortal, TemplatePortal } from '@angular/cdk/portal';
import { ChangeDetectorRef, ComponentRef, ElementRef, EmbeddedViewRef, NgZone, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { DialogConfig } from './dialog-config';
import * as i0 from "@angular/core";
export declare function throwDialogContentAlreadyAttachedError(): void;
/**
 * Internal component that wraps user-provided dialog content.
 * @docs-private
 */
export declare class CdkDialogContainer extends BasePortalOutlet implements OnDestroy {
    private _elementRef;
    private _focusTrapFactory;
    private _changeDetectorRef;
    private readonly _interactivityChecker;
    private readonly _ngZone;
    /** The dialog configuration. */
    _config: DialogConfig;
    private readonly _document;
    /** State of the dialog animation. */
    _state: 'void' | 'enter' | 'exit';
    /** Element that was focused before the dialog was opened. Save this to restore upon close. */
    private _elementFocusedBeforeDialogWasOpened;
    /** The class that traps and manages focus within the dialog. */
    private _focusTrap;
    /** The portal host inside of this container into which the dialog content will be loaded. */
    _portalHost: CdkPortalOutlet;
    /** A subject emitting before the dialog enters the view. */
    readonly _beforeEnter: Subject<void>;
    /** A subject emitting after the dialog enters the view. */
    readonly _afterEnter: Subject<void>;
    /** A subject emitting before the dialog exits the view. */
    readonly _beforeExit: Subject<void>;
    /** A subject emitting after the dialog exits the view. */
    readonly _afterExit: Subject<void>;
    /** Stream of animation `done` events. */
    readonly _animationDone: Subject<AnimationEvent>;
    constructor(_elementRef: ElementRef<HTMLElement>, _focusTrapFactory: FocusTrapFactory, _changeDetectorRef: ChangeDetectorRef, _interactivityChecker: InteractivityChecker, _ngZone: NgZone, _document: any, 
    /** The dialog configuration. */
    _config: DialogConfig);
    /** Initializes the dialog container with the attached content. */
    _initializeWithAttachedContent(): void;
    /** Destroy focus trap to place focus back to the element focused before the dialog opened. */
    ngOnDestroy(): void;
    /**
     * Attach a ComponentPortal as content to this dialog container.
     * @param portal Portal to be attached as the dialog content.
     */
    attachComponentPortal<T>(portal: ComponentPortal<T>): ComponentRef<T>;
    /**
     * Attach a TemplatePortal as content to this dialog container.
     * @param portal Portal to be attached as the dialog content.
     */
    attachTemplatePortal<C>(portal: TemplatePortal<C>): EmbeddedViewRef<C>;
    /**
     * Attaches a DOM portal to the dialog container.
     * @param portal Portal to be attached.
     * @deprecated To be turned into a method.
     * @breaking-change 10.0.0
     */
    attachDomPortal: (portal: DomPortal) => void;
    /** Emit lifecycle events based on animation `start` callback. */
    _onAnimationStart(event: AnimationEvent): void;
    /** Starts the dialog exit animation. */
    _startExiting(): void;
    /** Saves a reference to the element that was focused before the dialog was opened. */
    private _savePreviouslyFocusedElement;
    /** Focuses the dialog container. */
    private _focusDialogContainer;
    /**
     * Focuses the provided element. If the element is not focusable, it will add a tabIndex
     * attribute to forcefully focus it. The attribute is removed after focus is moved.
     * @param element The element to focus.
     */
    private _forceFocus;
    /**
     * Focuses the first element that matches the given selector within the focus trap.
     * @param selector The CSS selector for the element to set focus to.
     */
    private _focusByCssSelector;
    /**
     * Autofocus the element specified by the autoFocus field. When autoFocus is not 'dialog', if
     * for some reason the element cannot be focused, the dialog container will be focused.
     */
    private _autoFocus;
    /** Returns the focus to the element focused before the dialog was open. */
    private _returnFocusAfterDialog;
    static ɵfac: i0.ɵɵFactoryDeclaration<CdkDialogContainer, [null, null, null, null, null, { optional: true; }, null]>;
    static ɵcmp: i0.ɵɵComponentDeclaration<CdkDialogContainer, "cdk-dialog-container", never, {}, {}, never, never>;
}
