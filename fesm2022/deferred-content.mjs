import * as i0 from '@angular/core';
import { signal, input, Directive, inject, TemplateRef, ViewContainerRef, afterRenderEffect } from '@angular/core';

/**
 * A container directive controls the visibility of its content.
 */
class DeferredContentAware {
    contentVisible = signal(false, ...(ngDevMode ? [{ debugName: "contentVisible" }] : []));
    preserveContent = input(false, ...(ngDevMode ? [{ debugName: "preserveContent" }] : []));
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.2.0-next.2", ngImport: i0, type: DeferredContentAware, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.1.0", version: "20.2.0-next.2", type: DeferredContentAware, isStandalone: true, inputs: { preserveContent: { classPropertyName: "preserveContent", publicName: "preserveContent", isSignal: true, isRequired: false, transformFunction: null } }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.2.0-next.2", ngImport: i0, type: DeferredContentAware, decorators: [{
            type: Directive
        }] });
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
class DeferredContent {
    _deferredContentAware = inject(DeferredContentAware);
    _templateRef = inject(TemplateRef);
    _viewContainerRef = inject(ViewContainerRef);
    _isRendered = false;
    constructor() {
        afterRenderEffect(() => {
            if (this._deferredContentAware.contentVisible()) {
                if (this._isRendered)
                    return;
                this._viewContainerRef.clear();
                this._viewContainerRef.createEmbeddedView(this._templateRef);
                this._isRendered = true;
            }
            else if (!this._deferredContentAware.preserveContent()) {
                this._viewContainerRef.clear();
                this._isRendered = false;
            }
        });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.2.0-next.2", ngImport: i0, type: DeferredContent, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "20.2.0-next.2", type: DeferredContent, isStandalone: true, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.2.0-next.2", ngImport: i0, type: DeferredContent, decorators: [{
            type: Directive
        }], ctorParameters: () => [] });

export { DeferredContent, DeferredContentAware };
//# sourceMappingURL=deferred-content.mjs.map
