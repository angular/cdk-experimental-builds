export { ListboxPattern, OptionPattern } from './option.mjs';
export { RadioButtonPattern, RadioGroupPattern, ToolbarRadioGroupPattern } from './toolbar-radio-group.mjs';
export { TabListPattern, TabPanelPattern, TabPattern } from './tabs2.mjs';
export { ToolbarPattern, ToolbarWidgetGroupPattern, ToolbarWidgetPattern } from './toolbar2.mjs';
export { AccordionGroupPattern, AccordionPanelPattern, AccordionTriggerPattern } from './accordion2.mjs';
import '@angular/core';
import './list.mjs';
import './list-navigation.mjs';
import './expansion.mjs';

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
