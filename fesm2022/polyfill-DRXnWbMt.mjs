/** closest implementation that is able to start from non-Element Nodes. */
function closest(element, selector) {
    if (!(element instanceof Node)) {
        return null;
    }
    let curr = element;
    while (curr != null && !(curr instanceof Element)) {
        curr = curr.parentNode;
    }
    return curr?.closest(selector) ?? null;
}

export { closest };
//# sourceMappingURL=polyfill-DRXnWbMt.mjs.map
