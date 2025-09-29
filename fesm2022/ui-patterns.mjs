export { ComboboxPattern } from './combobox-ZZC2YlgZ.mjs';
export { ComboboxListboxPattern, ListboxPattern, OptionPattern } from './combobox-listbox-DuA-LCB4.mjs';
export { RadioButtonPattern, RadioGroupPattern, ToolbarRadioGroupPattern } from './toolbar-radio-group-B9FHdtFs.mjs';
export { TabListPattern, TabPanelPattern, TabPattern } from './tabs-CNyN-ltr.mjs';
export { ToolbarPattern, ToolbarWidgetGroupPattern, ToolbarWidgetPattern } from './toolbar-yLXvQipo.mjs';
export { AccordionGroupPattern, AccordionPanelPattern, AccordionTriggerPattern } from './accordion-B0bXcxhE.mjs';
export { ComboboxTreePattern, TreeItemPattern, TreePattern } from './combobox-tree-T4IBVlaU.mjs';
import '@angular/core';
import './pointer-event-manager-B6GE9jDm.mjs';
import './list-QKHHM4uh.mjs';
import './list-navigation-CPkqnU1i.mjs';
import './expansion-BRQMRoGR.mjs';

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
