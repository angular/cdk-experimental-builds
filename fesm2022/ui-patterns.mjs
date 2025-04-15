import { KeyboardEventManager, PointerEventManager, ListNavigation, ListSelection, ListFocus } from './option-DdKMDp4V.mjs';
export { ListboxPattern, OptionPattern } from './option-DdKMDp4V.mjs';
import { computed, signal } from '@angular/core';

/** Converts a getter setter style signal to a WritableSignalLike. */
function convertGetterSetterToWritableSignalLike(getter, setter) {
    // tslint:disable-next-line:ban Have to use `Object.assign` to preserve the getter function.
    return Object.assign(getter, {
        set: setter,
        update: (updateCallback) => setter(updateCallback(getter())),
    });
}

/** A tab in a tablist. */
class TabPattern {
    /** A global unique identifier for the tab. */
    id;
    /** A local unique identifier for the tab. */
    value;
    /** Whether the tab is selected. */
    selected = computed(() => this.tablist().selection.inputs.value().includes(this.value()));
    /** A Tabpanel Id controlled by the tab. */
    controls = computed(() => this.tabpanel()?.id());
    /** Whether the tab is disabled. */
    disabled;
    /** A reference to the parent tablist. */
    tablist;
    /** A reference to the corresponding tabpanel. */
    tabpanel;
    /** The tabindex of the tab. */
    tabindex = computed(() => this.tablist().focusManager.getItemTabindex(this));
    /** The html element that should receive focus. */
    element;
    constructor(inputs) {
        this.id = inputs.id;
        this.value = inputs.value;
        this.tablist = inputs.tablist;
        this.tabpanel = inputs.tabpanel;
        this.element = inputs.element;
        this.disabled = inputs.disabled;
    }
}

/** Controls the state of a tablist. */
class TabListPattern {
    inputs;
    /** Controls navigation for the tablist. */
    navigation;
    /** Controls selection for the tablist. */
    selection;
    /** Controls focus for the tablist. */
    focusManager;
    /** Whether the tablist is vertically or horizontally oriented. */
    orientation;
    /** Whether the tablist is disabled. */
    disabled;
    /** The tabindex of the tablist. */
    tabindex = computed(() => this.focusManager.getListTabindex());
    /** The id of the current active tab. */
    activedescendant = computed(() => this.focusManager.getActiveDescendant());
    followFocus = computed(() => this.inputs.selectionMode() === 'follow');
    /** The key used to navigate to the previous tab in the tablist. */
    prevKey = computed(() => {
        if (this.inputs.orientation() === 'vertical') {
            return 'ArrowUp';
        }
        return this.inputs.textDirection() === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
    });
    /** The key used to navigate to the next item in the list. */
    nextKey = computed(() => {
        if (this.inputs.orientation() === 'vertical') {
            return 'ArrowDown';
        }
        return this.inputs.textDirection() === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
    });
    /** The keydown event manager for the tablist. */
    keydown = computed(() => {
        const manager = new KeyboardEventManager();
        if (this.followFocus()) {
            manager
                .on(this.prevKey, () => this.prev({ selectOne: true }))
                .on(this.nextKey, () => this.next({ selectOne: true }))
                .on('Home', () => this.first({ selectOne: true }))
                .on('End', () => this.last({ selectOne: true }));
        }
        else {
            manager
                .on(this.prevKey, () => this.prev())
                .on(this.nextKey, () => this.next())
                .on('Home', () => this.first())
                .on('End', () => this.last())
                .on(' ', () => this._updateSelection({ selectOne: true }))
                .on('Enter', () => this._updateSelection({ selectOne: true }));
        }
        return manager;
    });
    /** The pointerdown event manager for the tablist. */
    pointerdown = computed(() => {
        const manager = new PointerEventManager();
        manager.on(e => this.goto(e, { selectOne: true }));
        return manager;
    });
    constructor(inputs) {
        this.inputs = inputs;
        this.disabled = inputs.disabled;
        this.orientation = inputs.orientation;
        this.navigation = new ListNavigation(inputs);
        this.selection = new ListSelection({
            ...inputs,
            navigation: this.navigation,
            multi: signal(false),
        });
        this.focusManager = new ListFocus({ ...inputs, navigation: this.navigation });
    }
    /** Handles keydown events for the tablist. */
    onKeydown(event) {
        if (!this.disabled()) {
            this.keydown().handle(event);
        }
    }
    /** The pointerdown event manager for the tablist. */
    onPointerdown(event) {
        if (!this.disabled()) {
            this.pointerdown().handle(event);
        }
    }
    /** Navigates to the first option in the tablist. */
    first(opts) {
        this.navigation.first();
        this.focusManager.focus();
        this._updateSelection(opts);
    }
    /** Navigates to the last option in the tablist. */
    last(opts) {
        this.navigation.last();
        this.focusManager.focus();
        this._updateSelection(opts);
    }
    /** Navigates to the next option in the tablist. */
    next(opts) {
        this.navigation.next();
        this.focusManager.focus();
        this._updateSelection(opts);
    }
    /** Navigates to the previous option in the tablist. */
    prev(opts) {
        this.navigation.prev();
        this.focusManager.focus();
        this._updateSelection(opts);
    }
    /** Navigates to the given item in the tablist. */
    goto(event, opts) {
        const item = this._getItem(event);
        if (item) {
            this.navigation.goto(item);
            this.focusManager.focus();
            this._updateSelection(opts);
        }
    }
    /** Handles updating selection for the tablist. */
    _updateSelection(opts) {
        if (opts?.select) {
            this.selection.select();
        }
        if (opts?.toggle) {
            this.selection.toggle();
        }
        if (opts?.toggleOne) {
            this.selection.toggleOne();
        }
        if (opts?.selectOne) {
            this.selection.selectOne();
        }
    }
    _getItem(e) {
        if (!(e.target instanceof HTMLElement)) {
            return;
        }
        const element = e.target.closest('[role="tab"]');
        return this.inputs.items().find(i => i.element() === element);
    }
}

/** A tabpanel associated with a tab. */
class TabPanelPattern {
    /** A global unique identifier for the tabpanel. */
    id;
    /** A local unique identifier for the tabpanel. */
    value;
    /** A reference to the corresponding tab. */
    tab;
    /** Whether the tabpanel is hidden. */
    hidden = computed(() => !this.tab()?.selected());
    constructor(inputs) {
        this.id = inputs.id;
        this.value = inputs.value;
        this.tab = inputs.tab;
    }
}

export { TabListPattern, TabPanelPattern, TabPattern, convertGetterSetterToWritableSignalLike };
//# sourceMappingURL=ui-patterns.mjs.map
