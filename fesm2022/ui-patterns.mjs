export { ListboxPattern, OptionPattern } from './option-D1-Zcobx.mjs';
export { TabListPattern, TabPanelPattern, TabPattern } from './tabs-C0pLghH2.mjs';
import './list-focus-CSTLIgwc.mjs';
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
