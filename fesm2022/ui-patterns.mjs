export { L as ListboxPattern, O as OptionPattern } from './option-FVBjwHVM.mjs';
export { a as RadioButtonPattern, R as RadioGroupPattern } from './radio-B6IYVjCK.mjs';
export { T as TabListPattern, b as TabPanelPattern, a as TabPattern } from './tabs-D7mgfcPg.mjs';
export { b as AccordionGroupPattern, A as AccordionPanelPattern, a as AccordionTriggerPattern } from './accordion-CyyDY39y.mjs';
import './list-focus-BXQdAA3i.mjs';
import '@angular/core';
import './list-selection-Nv_R5GBA.mjs';
import './expansion-DykBzWrb.mjs';

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
