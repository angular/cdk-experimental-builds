export { ListboxPattern, OptionPattern } from './option-qZalEfOu.mjs';
export { TabListPattern, TabPanelPattern, TabPattern } from './tabs-DMCcUWaU.mjs';
import './list-focus-P6xynDMg.mjs';
import '@angular/core';

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
