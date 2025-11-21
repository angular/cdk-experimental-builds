import * as i0 from '@angular/core';
import { inject, ElementRef, DOCUMENT, CSP_NONCE, Directive, NgModule } from '@angular/core';
import { _IdGenerator } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { _getShadowRoot } from '@angular/cdk/platform';
import { STICKY_POSITIONING_LISTENER } from '@angular/cdk/table';

class CdkTableScrollContainer {
  _elementRef = inject(ElementRef);
  _document = inject(DOCUMENT);
  _directionality = inject(Directionality, {
    optional: true
  });
  _nonce = inject(CSP_NONCE, {
    optional: true
  });
  _uniqueClassName = inject(_IdGenerator).getId('cdk-table-scroll-container-');
  _styleRoot;
  _styleElement;
  _startSizes = [];
  _endSizes = [];
  _headerSizes = [];
  _footerSizes = [];
  ngOnInit() {
    this._elementRef.nativeElement.classList.add(this._uniqueClassName);
    this._styleRoot = _getShadowRoot(this._elementRef.nativeElement) ?? this._document.head;
  }
  ngOnDestroy() {
    this._styleElement?.remove();
    this._styleElement = undefined;
  }
  stickyColumnsUpdated({
    sizes
  }) {
    this._startSizes = sizes;
    this._updateScrollbar();
  }
  stickyEndColumnsUpdated({
    sizes
  }) {
    this._endSizes = sizes;
    this._updateScrollbar();
  }
  stickyHeaderRowsUpdated({
    sizes
  }) {
    this._headerSizes = sizes;
    this._updateScrollbar();
  }
  stickyFooterRowsUpdated({
    sizes
  }) {
    this._footerSizes = sizes;
    this._updateScrollbar();
  }
  _updateScrollbar() {
    const topMargin = computeMargin(this._headerSizes);
    const bottomMargin = computeMargin(this._footerSizes);
    const startMargin = computeMargin(this._startSizes);
    const endMargin = computeMargin(this._endSizes);
    if (topMargin === 0 && bottomMargin === 0 && startMargin === 0 && endMargin === 0) {
      this._clearCss();
      return;
    }
    const direction = this._directionality ? this._directionality.value : 'ltr';
    const leftMargin = direction === 'rtl' ? endMargin : startMargin;
    const rightMargin = direction === 'rtl' ? startMargin : endMargin;
    this._applyCss(`${topMargin}px ${rightMargin}px ${bottomMargin}px ${leftMargin}px`);
  }
  _getStyleSheet() {
    if (!this._styleElement) {
      this._styleElement = this._document.createElement('style');
      if (this._nonce) {
        this._styleElement.setAttribute('nonce', this._nonce);
      }
      this._styleRoot.appendChild(this._styleElement);
    }
    return this._styleElement.sheet;
  }
  _applyCss(value) {
    this._clearCss();
    const selector = `.${this._uniqueClassName}::-webkit-scrollbar-track`;
    this._getStyleSheet().insertRule(`${selector} {margin: ${value}}`, 0);
  }
  _clearCss() {
    const styleSheet = this._getStyleSheet();
    if (styleSheet.cssRules.length > 0) {
      styleSheet.deleteRule(0);
    }
  }
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: "12.0.0",
    version: "21.0.0",
    ngImport: i0,
    type: CdkTableScrollContainer,
    deps: [],
    target: i0.ɵɵFactoryTarget.Directive
  });
  static ɵdir = i0.ɵɵngDeclareDirective({
    minVersion: "14.0.0",
    version: "21.0.0",
    type: CdkTableScrollContainer,
    isStandalone: true,
    selector: "[cdkTableScrollContainer]",
    host: {
      classAttribute: "cdk-table-scroll-container"
    },
    providers: [{
      provide: STICKY_POSITIONING_LISTENER,
      useExisting: CdkTableScrollContainer
    }],
    ngImport: i0
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: "12.0.0",
  version: "21.0.0",
  ngImport: i0,
  type: CdkTableScrollContainer,
  decorators: [{
    type: Directive,
    args: [{
      selector: '[cdkTableScrollContainer]',
      host: {
        'class': 'cdk-table-scroll-container'
      },
      providers: [{
        provide: STICKY_POSITIONING_LISTENER,
        useExisting: CdkTableScrollContainer
      }]
    }]
  }]
});
function computeMargin(sizes) {
  let margin = 0;
  for (const size of sizes) {
    if (size == null) {
      break;
    }
    margin += size;
  }
  return margin;
}

class CdkTableScrollContainerModule {
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: "12.0.0",
    version: "21.0.0",
    ngImport: i0,
    type: CdkTableScrollContainerModule,
    deps: [],
    target: i0.ɵɵFactoryTarget.NgModule
  });
  static ɵmod = i0.ɵɵngDeclareNgModule({
    minVersion: "14.0.0",
    version: "21.0.0",
    ngImport: i0,
    type: CdkTableScrollContainerModule,
    imports: [CdkTableScrollContainer],
    exports: [CdkTableScrollContainer]
  });
  static ɵinj = i0.ɵɵngDeclareInjector({
    minVersion: "12.0.0",
    version: "21.0.0",
    ngImport: i0,
    type: CdkTableScrollContainerModule
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: "12.0.0",
  version: "21.0.0",
  ngImport: i0,
  type: CdkTableScrollContainerModule,
  decorators: [{
    type: NgModule,
    args: [{
      imports: [CdkTableScrollContainer],
      exports: [CdkTableScrollContainer]
    }]
  }]
});

export { CdkTableScrollContainer, CdkTableScrollContainerModule };
//# sourceMappingURL=table-scroll-container.mjs.map
