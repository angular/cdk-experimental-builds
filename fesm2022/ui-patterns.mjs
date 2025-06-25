export { L as ListboxPattern, O as OptionPattern } from './option-D44ECQK6.mjs';
export { a as RadioButtonPattern, R as RadioGroupPattern } from './radio-button-BiqPDreS.mjs';
export { T as TabListPattern, b as TabPanelPattern, a as TabPattern } from './tabs-YS9XXb7X.mjs';
export { b as AccordionGroupPattern, A as AccordionPanelPattern, a as AccordionTriggerPattern } from './accordion-CN4PcmAh.mjs';
import './list-focus-BXQdAA3i.mjs';
import '@angular/core';
import './list-selection-C41ApAbt.mjs';
import './list-typeahead-DIIbNJrP.mjs';
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
