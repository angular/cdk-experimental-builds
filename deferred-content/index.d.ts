import * as _angular_core from '@angular/core';

/**
 * A container directive controls the visibility of its content.
 */
declare class DeferredContentAware {
    readonly contentVisible: _angular_core.WritableSignal<boolean>;
    readonly preserveContent: _angular_core.InputSignal<boolean>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<DeferredContentAware, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<DeferredContentAware, never, never, { "preserveContent": { "alias": "preserveContent"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
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
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<DeferredContent, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<DeferredContent, never, never, {}, {}, never, never, true, never>;
}

export { DeferredContent, DeferredContentAware };
