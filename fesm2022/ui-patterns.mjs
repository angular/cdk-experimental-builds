export { ComboboxPattern } from './_combobox-chunk.mjs';
export { ComboboxListboxPattern, ListboxPattern, OptionPattern } from './_combobox-listbox-chunk.mjs';
export { RadioButtonPattern, RadioGroupPattern, ToolbarRadioGroupPattern } from './_toolbar-radio-group-chunk.mjs';
export { TabListPattern, TabPanelPattern, TabPattern } from './_tabs-chunk.mjs';
export { ToolbarPattern, ToolbarWidgetGroupPattern, ToolbarWidgetPattern } from './_toolbar-chunk.mjs';
export { AccordionGroupPattern, AccordionPanelPattern, AccordionTriggerPattern } from './_accordion-chunk.mjs';
export { ComboboxTreePattern, TreeItemPattern, TreePattern } from './_combobox-tree-chunk.mjs';
import '@angular/core';
import './_pointer-event-manager-chunk.mjs';
import './_list-chunk.mjs';
import './_list-navigation-chunk.mjs';
import './_expansion-chunk.mjs';

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
