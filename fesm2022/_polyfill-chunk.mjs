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
//# sourceMappingURL=_polyfill-chunk.mjs.map
