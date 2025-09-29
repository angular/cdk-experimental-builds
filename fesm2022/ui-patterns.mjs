export { ListboxPattern, OptionPattern } from './option-HpmyHx3F.mjs';
export { RadioButtonPattern, RadioGroupPattern, ToolbarRadioGroupPattern } from './toolbar-radio-group-BnIxGg0N.mjs';
export { TabListPattern, TabPanelPattern, TabPattern } from './tabs-CgsqriS4.mjs';
export { ToolbarPattern, ToolbarWidgetGroupPattern, ToolbarWidgetPattern } from './toolbar-CGsEAlA3.mjs';
export { AccordionGroupPattern, AccordionPanelPattern, AccordionTriggerPattern } from './accordion-BaOrFTZM.mjs';
import '@angular/core';
import './list-DDPL6e4b.mjs';
import './list-navigation-DFutf3ha.mjs';
import './expansion-B3kmlWCY.mjs';

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
