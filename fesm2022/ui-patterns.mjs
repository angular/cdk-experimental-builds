export { L as ListboxPattern, O as OptionPattern } from './option-CgeKz9_Q.mjs';
export { a as RadioButtonPattern, R as RadioGroupPattern } from './radio-button-92xc4w-A.mjs';
export { T as TabListPattern, b as TabPanelPattern, a as TabPattern } from './tabs-hMdwtXv2.mjs';
export { b as AccordionGroupPattern, A as AccordionPanelPattern, a as AccordionTriggerPattern } from './accordion-D9JoxtzT.mjs';
import './list-selection-C41ApAbt.mjs';
import '@angular/core';
import './list-typeahead-DIIbNJrP.mjs';
import './list-focus-Czul8jzR.mjs';
import './expansion-C9iQLHOG.mjs';

/** Converts a getter setter style signal to a WritableSignalLike. */
function convertGetterSetterToWritableSignalLike(getter, setter) {
    // tslint:disable-next-line:ban Have to use `Object.assign` to preserve the getter function.
    return Object.assign(getter, {
        set: setter,
        update: (updateCallback) => setter(updateCallback(getter())),
    });
}

export { convertGetterSetterToWritableSignalLike };
//# sourceMappingURL=ui-patterns.mjs.map
