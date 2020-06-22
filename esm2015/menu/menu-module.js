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
import { CdkMenuItemRadio } from './menu-item-radio';
import { CdkMenuItemCheckbox } from './menu-item-checkbox';
import { CdkMenuItemTrigger } from './menu-item-trigger';
const EXPORTED_DECLARATIONS = [
    CdkMenuBar,
    CdkMenu,
    CdkMenuPanel,
    CdkMenuItem,
    CdkMenuItemRadio,
    CdkMenuItemCheckbox,
    CdkMenuItemTrigger,
    CdkMenuGroup,
];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrLWV4cGVyaW1lbnRhbC9tZW51L21lbnUtbW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDdkMsT0FBTyxFQUFDLE9BQU8sRUFBQyxNQUFNLFFBQVEsQ0FBQztBQUMvQixPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sWUFBWSxDQUFDO0FBQ3RDLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFDMUMsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLGFBQWEsQ0FBQztBQUN4QyxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sY0FBYyxDQUFDO0FBQzFDLE9BQU8sRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQ25ELE9BQU8sRUFBQyxtQkFBbUIsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBQ3pELE9BQU8sRUFBQyxrQkFBa0IsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBRXZELE1BQU0scUJBQXFCLEdBQUc7SUFDNUIsVUFBVTtJQUNWLE9BQU87SUFDUCxZQUFZO0lBQ1osV0FBVztJQUNYLGdCQUFnQjtJQUNoQixtQkFBbUI7SUFDbkIsa0JBQWtCO0lBQ2xCLFlBQVk7Q0FDYixDQUFDO0FBQ0Y7SUFBQSxNQUlhLGFBQWE7OztnQkFKekIsUUFBUSxTQUFDO29CQUNSLE9BQU8sRUFBRSxxQkFBcUI7b0JBQzlCLFlBQVksRUFBRSxxQkFBcUI7aUJBQ3BDOztJQUMyQixvQkFBQztLQUFBO1NBQWhCLGFBQWEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtOZ01vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0Nka01lbnV9IGZyb20gJy4vbWVudSc7XG5pbXBvcnQge0Nka01lbnVCYXJ9IGZyb20gJy4vbWVudS1iYXInO1xuaW1wb3J0IHtDZGtNZW51UGFuZWx9IGZyb20gJy4vbWVudS1wYW5lbCc7XG5pbXBvcnQge0Nka01lbnVJdGVtfSBmcm9tICcuL21lbnUtaXRlbSc7XG5pbXBvcnQge0Nka01lbnVHcm91cH0gZnJvbSAnLi9tZW51LWdyb3VwJztcbmltcG9ydCB7Q2RrTWVudUl0ZW1SYWRpb30gZnJvbSAnLi9tZW51LWl0ZW0tcmFkaW8nO1xuaW1wb3J0IHtDZGtNZW51SXRlbUNoZWNrYm94fSBmcm9tICcuL21lbnUtaXRlbS1jaGVja2JveCc7XG5pbXBvcnQge0Nka01lbnVJdGVtVHJpZ2dlcn0gZnJvbSAnLi9tZW51LWl0ZW0tdHJpZ2dlcic7XG5cbmNvbnN0IEVYUE9SVEVEX0RFQ0xBUkFUSU9OUyA9IFtcbiAgQ2RrTWVudUJhcixcbiAgQ2RrTWVudSxcbiAgQ2RrTWVudVBhbmVsLFxuICBDZGtNZW51SXRlbSxcbiAgQ2RrTWVudUl0ZW1SYWRpbyxcbiAgQ2RrTWVudUl0ZW1DaGVja2JveCxcbiAgQ2RrTWVudUl0ZW1UcmlnZ2VyLFxuICBDZGtNZW51R3JvdXAsXG5dO1xuQE5nTW9kdWxlKHtcbiAgZXhwb3J0czogRVhQT1JURURfREVDTEFSQVRJT05TLFxuICBkZWNsYXJhdGlvbnM6IEVYUE9SVEVEX0RFQ0xBUkFUSU9OUyxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrTWVudU1vZHVsZSB7fVxuIl19