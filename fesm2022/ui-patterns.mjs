export { L as ListboxPattern, O as OptionPattern } from './option-PfSxXfNh.mjs';
export { a as RadioButtonPattern, R as RadioGroupPattern } from './radio-button-DNUyZmoC.mjs';
export { T as TabListPattern, b as TabPanelPattern, a as TabPattern } from './tabs-Y300LEKG.mjs';
export { b as AccordionGroupPattern, A as AccordionPanelPattern, a as AccordionTriggerPattern } from './accordion-CILp35b8.mjs';
import '@angular/core';
import './list-DwfufhyY.mjs';
import './list-navigation-DzM8xz11.mjs';
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
