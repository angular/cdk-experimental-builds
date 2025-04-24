export { L as ListboxPattern, O as OptionPattern } from './option-f_gNslw8.mjs';
export { T as TabListPattern, b as TabPanelPattern, a as TabPattern } from './tabs-BDmqS14d.mjs';
import './list-focus-Di7m_z_6.mjs';
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
