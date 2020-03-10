/**
 * @fileoverview added by tsickle
 * Generated from: src/cdk-experimental/dialog/dialog-config.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * Possible overrides for a dialog's position.
 * @record
 */
export function DialogPosition() { }
if (false) {
    /** @type {?|undefined} */
    DialogPosition.prototype.top;
    /** @type {?|undefined} */
    DialogPosition.prototype.bottom;
    /** @type {?|undefined} */
    DialogPosition.prototype.left;
    /** @type {?|undefined} */
    DialogPosition.prototype.right;
}
/**
 * @template D
 */
export class DialogConfig {
    constructor() {
        /**
         * The ARIA role of the dialog.
         */
        this.role = 'dialog';
        /**
         * Custom class(es) for the overlay panel.
         */
        this.panelClass = '';
        /**
         * Whether the dialog has a background.
         */
        this.hasBackdrop = true;
        /**
         * Custom class(es) for the backdrop.
         */
        this.backdropClass = '';
        /**
         * Whether the dialog can be closed by user interaction.
         */
        this.disableClose = false;
        /**
         * The width of the dialog.
         */
        this.width = '';
        /**
         * The height of the dialog.
         */
        this.height = '';
        /**
         * The minimum width of the dialog.
         */
        this.minWidth = '';
        /**
         * The minimum height of the dialog.
         */
        this.minHeight = '';
        /**
         * The maximum width of the dialog.
         */
        this.maxWidth = '80vw';
        /**
         * The maximum height of the dialog.
         */
        this.maxHeight = '';
        /**
         * Data to be injected into the dialog content.
         */
        this.data = null;
        /**
         * ID of the element that describes the dialog.
         */
        this.ariaDescribedBy = null;
        /**
         * Aria label to assign to the dialog element
         */
        this.ariaLabel = null;
        /**
         * Whether the dialog should focus the first focusable element on open.
         */
        this.autoFocus = true;
        /**
         * Duration of the enter animation. Has to be a valid CSS value (e.g. 100ms).
         */
        this.enterAnimationDuration = '225ms';
        /**
         * Duration of the exit animation. Has to be a valid CSS value (e.g. 50ms).
         */
        this.exitAnimationDuration = '225ms';
    }
}
if (false) {
    /**
     * Component to use as the container for the dialog.
     * @type {?}
     */
    DialogConfig.prototype.containerComponent;
    /**
     * Where the attached component should live in Angular's *logical* component tree.
     * This affects what is available for injection and the change detection order for the
     * component instantiated inside of the dialog. This does not affect where the dialog
     * content will be rendered.
     * @type {?}
     */
    DialogConfig.prototype.viewContainerRef;
    /**
     * The id of the dialog.
     * @type {?}
     */
    DialogConfig.prototype.id;
    /**
     * The ARIA role of the dialog.
     * @type {?}
     */
    DialogConfig.prototype.role;
    /**
     * Custom class(es) for the overlay panel.
     * @type {?}
     */
    DialogConfig.prototype.panelClass;
    /**
     * Whether the dialog has a background.
     * @type {?}
     */
    DialogConfig.prototype.hasBackdrop;
    /**
     * Custom class(es) for the backdrop.
     * @type {?}
     */
    DialogConfig.prototype.backdropClass;
    /**
     * Whether the dialog can be closed by user interaction.
     * @type {?}
     */
    DialogConfig.prototype.disableClose;
    /**
     * The width of the dialog.
     * @type {?}
     */
    DialogConfig.prototype.width;
    /**
     * The height of the dialog.
     * @type {?}
     */
    DialogConfig.prototype.height;
    /**
     * The minimum width of the dialog.
     * @type {?}
     */
    DialogConfig.prototype.minWidth;
    /**
     * The minimum height of the dialog.
     * @type {?}
     */
    DialogConfig.prototype.minHeight;
    /**
     * The maximum width of the dialog.
     * @type {?}
     */
    DialogConfig.prototype.maxWidth;
    /**
     * The maximum height of the dialog.
     * @type {?}
     */
    DialogConfig.prototype.maxHeight;
    /**
     * The position of the dialog.
     * @type {?}
     */
    DialogConfig.prototype.position;
    /**
     * Data to be injected into the dialog content.
     * @type {?}
     */
    DialogConfig.prototype.data;
    /**
     * The layout direction for the dialog content.
     * @type {?}
     */
    DialogConfig.prototype.direction;
    /**
     * ID of the element that describes the dialog.
     * @type {?}
     */
    DialogConfig.prototype.ariaDescribedBy;
    /**
     * Aria label to assign to the dialog element
     * @type {?}
     */
    DialogConfig.prototype.ariaLabel;
    /**
     * Whether the dialog should focus the first focusable element on open.
     * @type {?}
     */
    DialogConfig.prototype.autoFocus;
    /**
     * Duration of the enter animation. Has to be a valid CSS value (e.g. 100ms).
     * @type {?}
     */
    DialogConfig.prototype.enterAnimationDuration;
    /**
     * Duration of the exit animation. Has to be a valid CSS value (e.g. 50ms).
     * @type {?}
     */
    DialogConfig.prototype.exitAnimationDuration;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhbG9nLWNvbmZpZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL2RpYWxvZy9kaWFsb2ctY29uZmlnLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQWdCQSxvQ0FLQzs7O0lBSkMsNkJBQWE7O0lBQ2IsZ0NBQWdCOztJQUNoQiw4QkFBYzs7SUFDZCwrQkFBZTs7Ozs7QUFHakIsTUFBTSxPQUFPLFlBQVk7SUFBekI7Ozs7UUFnQkUsU0FBSSxHQUFnQixRQUFRLENBQUM7Ozs7UUFHN0IsZUFBVSxHQUF1QixFQUFFLENBQUM7Ozs7UUFHcEMsZ0JBQVcsR0FBYSxJQUFJLENBQUM7Ozs7UUFHN0Isa0JBQWEsR0FBd0IsRUFBRSxDQUFDOzs7O1FBR3hDLGlCQUFZLEdBQWEsS0FBSyxDQUFDOzs7O1FBRy9CLFVBQUssR0FBWSxFQUFFLENBQUM7Ozs7UUFHcEIsV0FBTSxHQUFZLEVBQUUsQ0FBQzs7OztRQUdyQixhQUFRLEdBQXFCLEVBQUUsQ0FBQzs7OztRQUdoQyxjQUFTLEdBQXFCLEVBQUUsQ0FBQzs7OztRQUdqQyxhQUFRLEdBQXFCLE1BQU0sQ0FBQzs7OztRQUdwQyxjQUFTLEdBQXFCLEVBQUUsQ0FBQzs7OztRQU1qQyxTQUFJLEdBQWMsSUFBSSxDQUFDOzs7O1FBTXZCLG9CQUFlLEdBQW1CLElBQUksQ0FBQzs7OztRQUd2QyxjQUFTLEdBQW1CLElBQUksQ0FBQzs7OztRQUdqQyxjQUFTLEdBQWEsSUFBSSxDQUFDOzs7O1FBRzNCLDJCQUFzQixHQUFZLE9BQU8sQ0FBQzs7OztRQUcxQywwQkFBcUIsR0FBWSxPQUFPLENBQUM7SUFDM0MsQ0FBQztDQUFBOzs7Ozs7SUFyRUMsMENBQXVEOzs7Ozs7OztJQVF2RCx3Q0FBb0M7Ozs7O0lBR3BDLDBCQUFZOzs7OztJQUdaLDRCQUE2Qjs7Ozs7SUFHN0Isa0NBQW9DOzs7OztJQUdwQyxtQ0FBNkI7Ozs7O0lBRzdCLHFDQUF3Qzs7Ozs7SUFHeEMsb0NBQStCOzs7OztJQUcvQiw2QkFBb0I7Ozs7O0lBR3BCLDhCQUFxQjs7Ozs7SUFHckIsZ0NBQWdDOzs7OztJQUdoQyxpQ0FBaUM7Ozs7O0lBR2pDLGdDQUFvQzs7Ozs7SUFHcEMsaUNBQWlDOzs7OztJQUdqQyxnQ0FBMEI7Ozs7O0lBRzFCLDRCQUF1Qjs7Ozs7SUFHdkIsaUNBQXNCOzs7OztJQUd0Qix1Q0FBdUM7Ozs7O0lBR3ZDLGlDQUFpQzs7Ozs7SUFHakMsaUNBQTJCOzs7OztJQUczQiw4Q0FBMEM7Ozs7O0lBRzFDLDZDQUF5QyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtWaWV3Q29udGFpbmVyUmVmfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7RGlyZWN0aW9ufSBmcm9tICdAYW5ndWxhci9jZGsvYmlkaSc7XG5pbXBvcnQge0NvbXBvbmVudFR5cGV9IGZyb20gJ0Bhbmd1bGFyL2Nkay9vdmVybGF5JztcbmltcG9ydCB7Q2RrRGlhbG9nQ29udGFpbmVyfSBmcm9tICcuL2RpYWxvZy1jb250YWluZXInO1xuXG4vKiogVmFsaWQgQVJJQSByb2xlcyBmb3IgYSBkaWFsb2cgZWxlbWVudC4gKi9cbmV4cG9ydCB0eXBlIERpYWxvZ1JvbGUgPSAnZGlhbG9nJyB8ICdhbGVydGRpYWxvZyc7XG5cbi8qKiBQb3NzaWJsZSBvdmVycmlkZXMgZm9yIGEgZGlhbG9nJ3MgcG9zaXRpb24uICovXG5leHBvcnQgaW50ZXJmYWNlIERpYWxvZ1Bvc2l0aW9uIHtcbiAgdG9wPzogc3RyaW5nO1xuICBib3R0b20/OiBzdHJpbmc7XG4gIGxlZnQ/OiBzdHJpbmc7XG4gIHJpZ2h0Pzogc3RyaW5nO1xufVxuXG5leHBvcnQgY2xhc3MgRGlhbG9nQ29uZmlnPEQgPSBhbnk+IHtcbiAgLyoqIENvbXBvbmVudCB0byB1c2UgYXMgdGhlIGNvbnRhaW5lciBmb3IgdGhlIGRpYWxvZy4gKi9cbiAgY29udGFpbmVyQ29tcG9uZW50PzogQ29tcG9uZW50VHlwZTxDZGtEaWFsb2dDb250YWluZXI+O1xuXG4gIC8qKlxuICAgKiBXaGVyZSB0aGUgYXR0YWNoZWQgY29tcG9uZW50IHNob3VsZCBsaXZlIGluIEFuZ3VsYXIncyAqbG9naWNhbCogY29tcG9uZW50IHRyZWUuXG4gICAqIFRoaXMgYWZmZWN0cyB3aGF0IGlzIGF2YWlsYWJsZSBmb3IgaW5qZWN0aW9uIGFuZCB0aGUgY2hhbmdlIGRldGVjdGlvbiBvcmRlciBmb3IgdGhlXG4gICAqIGNvbXBvbmVudCBpbnN0YW50aWF0ZWQgaW5zaWRlIG9mIHRoZSBkaWFsb2cuIFRoaXMgZG9lcyBub3QgYWZmZWN0IHdoZXJlIHRoZSBkaWFsb2dcbiAgICogY29udGVudCB3aWxsIGJlIHJlbmRlcmVkLlxuICAgKi9cbiAgdmlld0NvbnRhaW5lclJlZj86IFZpZXdDb250YWluZXJSZWY7XG5cbiAgLyoqIFRoZSBpZCBvZiB0aGUgZGlhbG9nLiAqL1xuICBpZD86IHN0cmluZztcblxuICAvKiogVGhlIEFSSUEgcm9sZSBvZiB0aGUgZGlhbG9nLiAqL1xuICByb2xlPzogRGlhbG9nUm9sZSA9ICdkaWFsb2cnO1xuXG4gIC8qKiBDdXN0b20gY2xhc3MoZXMpIGZvciB0aGUgb3ZlcmxheSBwYW5lbC4gKi9cbiAgcGFuZWxDbGFzcz86IHN0cmluZyB8IHN0cmluZ1tdID0gJyc7XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGRpYWxvZyBoYXMgYSBiYWNrZ3JvdW5kLiAqL1xuICBoYXNCYWNrZHJvcD86IGJvb2xlYW4gPSB0cnVlO1xuXG4gIC8qKiBDdXN0b20gY2xhc3MoZXMpIGZvciB0aGUgYmFja2Ryb3AuICovXG4gIGJhY2tkcm9wQ2xhc3M/OiBzdHJpbmcgfCB1bmRlZmluZWQgPSAnJztcblxuICAvKiogV2hldGhlciB0aGUgZGlhbG9nIGNhbiBiZSBjbG9zZWQgYnkgdXNlciBpbnRlcmFjdGlvbi4gKi9cbiAgZGlzYWJsZUNsb3NlPzogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIC8qKiBUaGUgd2lkdGggb2YgdGhlIGRpYWxvZy4gKi9cbiAgd2lkdGg/OiBzdHJpbmcgPSAnJztcblxuICAvKiogVGhlIGhlaWdodCBvZiB0aGUgZGlhbG9nLiAqL1xuICBoZWlnaHQ/OiBzdHJpbmcgPSAnJztcblxuICAvKiogVGhlIG1pbmltdW0gd2lkdGggb2YgdGhlIGRpYWxvZy4gKi9cbiAgbWluV2lkdGg/OiBzdHJpbmcgfCBudW1iZXIgPSAnJztcblxuICAvKiogVGhlIG1pbmltdW0gaGVpZ2h0IG9mIHRoZSBkaWFsb2cuICovXG4gIG1pbkhlaWdodD86IHN0cmluZyB8IG51bWJlciA9ICcnO1xuXG4gIC8qKiBUaGUgbWF4aW11bSB3aWR0aCBvZiB0aGUgZGlhbG9nLiAqL1xuICBtYXhXaWR0aD86IHN0cmluZyB8IG51bWJlciA9ICc4MHZ3JztcblxuICAvKiogVGhlIG1heGltdW0gaGVpZ2h0IG9mIHRoZSBkaWFsb2cuICovXG4gIG1heEhlaWdodD86IHN0cmluZyB8IG51bWJlciA9ICcnO1xuXG4gIC8qKiBUaGUgcG9zaXRpb24gb2YgdGhlIGRpYWxvZy4gKi9cbiAgcG9zaXRpb24/OiBEaWFsb2dQb3NpdGlvbjtcblxuICAvKiogRGF0YSB0byBiZSBpbmplY3RlZCBpbnRvIHRoZSBkaWFsb2cgY29udGVudC4gKi9cbiAgZGF0YT86IEQgfCBudWxsID0gbnVsbDtcblxuICAvKiogVGhlIGxheW91dCBkaXJlY3Rpb24gZm9yIHRoZSBkaWFsb2cgY29udGVudC4gKi9cbiAgZGlyZWN0aW9uPzogRGlyZWN0aW9uO1xuXG4gIC8qKiBJRCBvZiB0aGUgZWxlbWVudCB0aGF0IGRlc2NyaWJlcyB0aGUgZGlhbG9nLiAqL1xuICBhcmlhRGVzY3JpYmVkQnk/OiBzdHJpbmcgfCBudWxsID0gbnVsbDtcblxuICAvKiogQXJpYSBsYWJlbCB0byBhc3NpZ24gdG8gdGhlIGRpYWxvZyBlbGVtZW50ICovXG4gIGFyaWFMYWJlbD86IHN0cmluZyB8IG51bGwgPSBudWxsO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSBkaWFsb2cgc2hvdWxkIGZvY3VzIHRoZSBmaXJzdCBmb2N1c2FibGUgZWxlbWVudCBvbiBvcGVuLiAqL1xuICBhdXRvRm9jdXM/OiBib29sZWFuID0gdHJ1ZTtcblxuICAvKiogRHVyYXRpb24gb2YgdGhlIGVudGVyIGFuaW1hdGlvbi4gSGFzIHRvIGJlIGEgdmFsaWQgQ1NTIHZhbHVlIChlLmcuIDEwMG1zKS4gKi9cbiAgZW50ZXJBbmltYXRpb25EdXJhdGlvbj86IHN0cmluZyA9ICcyMjVtcyc7XG5cbiAgLyoqIER1cmF0aW9uIG9mIHRoZSBleGl0IGFuaW1hdGlvbi4gSGFzIHRvIGJlIGEgdmFsaWQgQ1NTIHZhbHVlIChlLmcuIDUwbXMpLiAqL1xuICBleGl0QW5pbWF0aW9uRHVyYXRpb24/OiBzdHJpbmcgPSAnMjI1bXMnO1xufVxuIl19