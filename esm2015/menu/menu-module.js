/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { NgModule } from '@angular/core';
import { CdkMenu } from './menu';
import { CdkMenuBar } from './menu-bar';
import { CdkMenuPanel } from './menu-panel';
import { CdkMenuItem } from './menu-item';
import { CdkMenuGroup } from './menu-group';
const EXPORTED_DECLARATIONS = [CdkMenuBar, CdkMenu, CdkMenuPanel, CdkMenuItem, CdkMenuGroup];
let CdkMenuModule = /** @class */ (() => {
    class CdkMenuModule {
    }
    CdkMenuModule.decorators = [
        { type: NgModule, args: [{
                    exports: EXPORTED_DECLARATIONS,
                    declarations: EXPORTED_DECLARATIONS,
                },] }
    ];
    return CdkMenuModule;
})();
export { CdkMenuModule };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrLWV4cGVyaW1lbnRhbC9tZW51L21lbnUtbW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDdkMsT0FBTyxFQUFDLE9BQU8sRUFBQyxNQUFNLFFBQVEsQ0FBQztBQUMvQixPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sWUFBWSxDQUFDO0FBQ3RDLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFDMUMsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLGFBQWEsQ0FBQztBQUN4QyxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sY0FBYyxDQUFDO0FBRTFDLE1BQU0scUJBQXFCLEdBQUcsQ0FBQyxVQUFVLEVBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxXQUFXLEVBQUUsWUFBWSxDQUFDLENBQUM7QUFDN0Y7SUFBQSxNQUlhLGFBQWE7OztnQkFKekIsUUFBUSxTQUFDO29CQUNSLE9BQU8sRUFBRSxxQkFBcUI7b0JBQzlCLFlBQVksRUFBRSxxQkFBcUI7aUJBQ3BDOztJQUMyQixvQkFBQztLQUFBO1NBQWhCLGFBQWEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtOZ01vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0Nka01lbnV9IGZyb20gJy4vbWVudSc7XG5pbXBvcnQge0Nka01lbnVCYXJ9IGZyb20gJy4vbWVudS1iYXInO1xuaW1wb3J0IHtDZGtNZW51UGFuZWx9IGZyb20gJy4vbWVudS1wYW5lbCc7XG5pbXBvcnQge0Nka01lbnVJdGVtfSBmcm9tICcuL21lbnUtaXRlbSc7XG5pbXBvcnQge0Nka01lbnVHcm91cH0gZnJvbSAnLi9tZW51LWdyb3VwJztcblxuY29uc3QgRVhQT1JURURfREVDTEFSQVRJT05TID0gW0Nka01lbnVCYXIsIENka01lbnUsIENka01lbnVQYW5lbCwgQ2RrTWVudUl0ZW0sIENka01lbnVHcm91cF07XG5ATmdNb2R1bGUoe1xuICBleHBvcnRzOiBFWFBPUlRFRF9ERUNMQVJBVElPTlMsXG4gIGRlY2xhcmF0aW9uczogRVhQT1JURURfREVDTEFSQVRJT05TLFxufSlcbmV4cG9ydCBjbGFzcyBDZGtNZW51TW9kdWxlIHt9XG4iXX0=