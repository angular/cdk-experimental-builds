import * as i0 from '@angular/core';

/**
 * A container directive controls the visibility of its content.
 */
declare class DeferredContentAware {
    contentVisible: i0.WritableSignal<boolean>;
    readonly preserveContent: i0.InputSignal<boolean>;
    static ɵfac: i0.ɵɵFactoryDeclaration<DeferredContentAware, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<DeferredContentAware, never, never, { "preserveContent": { "alias": "preserveContent"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}
/**
 * DeferredContent loads/unloads the content based on the visibility.
 * The visibilty signal is sent from a parent directive implements
 * DeferredContentAware.
 *
 * Use this directive as a host directive. For example:
 *
 * ```ts
 *   @Directive({
 *     selector: 'ng-template[cdkAccordionContent]',
 *     hostDirectives: [DeferredContent],
 *   })
 *   class CdkAccordionContent {}
 * ```
 */
declare class DeferredContent {
    private readonly _deferredContentAware;
    private readonly _templateRef;
    private readonly _viewContainerRef;
    private _isRendered;
    constructor();
    static ɵfac: i0.ɵɵFactoryDeclaration<DeferredContent, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<DeferredContent, never, never, {}, {}, never, never, true, never>;
}

export { DeferredContent, DeferredContentAware };
