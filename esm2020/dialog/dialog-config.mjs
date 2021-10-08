export class DialogConfig {
    constructor() {
        /** The ARIA role of the dialog. */
        this.role = 'dialog';
        /** Custom class(es) for the overlay panel. */
        this.panelClass = '';
        /** Whether the dialog has a background. */
        this.hasBackdrop = true;
        /** Custom class(es) for the backdrop. */
        this.backdropClass = '';
        /** Whether the dialog can be closed by user interaction. */
        this.disableClose = false;
        /** The width of the dialog. */
        this.width = '';
        /** The height of the dialog. */
        this.height = '';
        /** The minimum width of the dialog. */
        this.minWidth = '';
        /** The minimum height of the dialog. */
        this.minHeight = '';
        /** The maximum width of the dialog. */
        this.maxWidth = '80vw';
        /** The maximum height of the dialog. */
        this.maxHeight = '';
        /** Data to be injected into the dialog content. */
        this.data = null;
        /** ID of the element that describes the dialog. */
        this.ariaDescribedBy = null;
        /** Aria label to assign to the dialog element */
        this.ariaLabel = null;
        /**
         * Where the dialog should focus on open.
         * @breaking-change 14.0.0 Remove boolean option from autoFocus. Use string or
         * AutoFocusTarget instead.
         */
        this.autoFocus = 'first-tabbable';
        /** Duration of the enter animation. Has to be a valid CSS value (e.g. 100ms). */
        this.enterAnimationDuration = '225ms';
        /** Duration of the exit animation. Has to be a valid CSS value (e.g. 50ms). */
        this.exitAnimationDuration = '225ms';
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhbG9nLWNvbmZpZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL2RpYWxvZy9kaWFsb2ctY29uZmlnLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQTBCQSxNQUFNLE9BQU8sWUFBWTtJQUF6QjtRQWVFLG1DQUFtQztRQUNuQyxTQUFJLEdBQWdCLFFBQVEsQ0FBQztRQUU3Qiw4Q0FBOEM7UUFDOUMsZUFBVSxHQUF1QixFQUFFLENBQUM7UUFFcEMsMkNBQTJDO1FBQzNDLGdCQUFXLEdBQWEsSUFBSSxDQUFDO1FBRTdCLHlDQUF5QztRQUN6QyxrQkFBYSxHQUF3QixFQUFFLENBQUM7UUFFeEMsNERBQTREO1FBQzVELGlCQUFZLEdBQWEsS0FBSyxDQUFDO1FBRS9CLCtCQUErQjtRQUMvQixVQUFLLEdBQVksRUFBRSxDQUFDO1FBRXBCLGdDQUFnQztRQUNoQyxXQUFNLEdBQVksRUFBRSxDQUFDO1FBRXJCLHVDQUF1QztRQUN2QyxhQUFRLEdBQXFCLEVBQUUsQ0FBQztRQUVoQyx3Q0FBd0M7UUFDeEMsY0FBUyxHQUFxQixFQUFFLENBQUM7UUFFakMsdUNBQXVDO1FBQ3ZDLGFBQVEsR0FBcUIsTUFBTSxDQUFDO1FBRXBDLHdDQUF3QztRQUN4QyxjQUFTLEdBQXFCLEVBQUUsQ0FBQztRQUtqQyxtREFBbUQ7UUFDbkQsU0FBSSxHQUFjLElBQUksQ0FBQztRQUt2QixtREFBbUQ7UUFDbkQsb0JBQWUsR0FBbUIsSUFBSSxDQUFDO1FBRXZDLGlEQUFpRDtRQUNqRCxjQUFTLEdBQW1CLElBQUksQ0FBQztRQUVqQzs7OztXQUlHO1FBQ0gsY0FBUyxHQUF3QyxnQkFBZ0IsQ0FBQztRQUVsRSxpRkFBaUY7UUFDakYsMkJBQXNCLEdBQVksT0FBTyxDQUFDO1FBRTFDLCtFQUErRTtRQUMvRSwwQkFBcUIsR0FBWSxPQUFPLENBQUM7SUFDM0MsQ0FBQztDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge1ZpZXdDb250YWluZXJSZWZ9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtEaXJlY3Rpb259IGZyb20gJ0Bhbmd1bGFyL2Nkay9iaWRpJztcbmltcG9ydCB7Q29tcG9uZW50VHlwZX0gZnJvbSAnQGFuZ3VsYXIvY2RrL292ZXJsYXknO1xuaW1wb3J0IHtDZGtEaWFsb2dDb250YWluZXJ9IGZyb20gJy4vZGlhbG9nLWNvbnRhaW5lcic7XG5cbi8qKiBPcHRpb25zIGZvciB3aGVyZSB0byBzZXQgZm9jdXMgdG8gYXV0b21hdGljYWxseSBvbiBkaWFsb2cgb3BlbiAqL1xuZXhwb3J0IHR5cGUgQXV0b0ZvY3VzVGFyZ2V0ID0gJ2RpYWxvZycgfCAnZmlyc3QtdGFiYmFibGUnIHwgJ2ZpcnN0LWhlYWRpbmcnO1xuXG4vKiogVmFsaWQgQVJJQSByb2xlcyBmb3IgYSBkaWFsb2cgZWxlbWVudC4gKi9cbmV4cG9ydCB0eXBlIERpYWxvZ1JvbGUgPSAnZGlhbG9nJyB8ICdhbGVydGRpYWxvZyc7XG5cbi8qKiBQb3NzaWJsZSBvdmVycmlkZXMgZm9yIGEgZGlhbG9nJ3MgcG9zaXRpb24uICovXG5leHBvcnQgaW50ZXJmYWNlIERpYWxvZ1Bvc2l0aW9uIHtcbiAgdG9wPzogc3RyaW5nO1xuICBib3R0b20/OiBzdHJpbmc7XG4gIGxlZnQ/OiBzdHJpbmc7XG4gIHJpZ2h0Pzogc3RyaW5nO1xufVxuXG5leHBvcnQgY2xhc3MgRGlhbG9nQ29uZmlnPEQgPSBhbnk+IHtcbiAgLyoqIENvbXBvbmVudCB0byB1c2UgYXMgdGhlIGNvbnRhaW5lciBmb3IgdGhlIGRpYWxvZy4gKi9cbiAgY29udGFpbmVyQ29tcG9uZW50PzogQ29tcG9uZW50VHlwZTxDZGtEaWFsb2dDb250YWluZXI+O1xuXG4gIC8qKlxuICAgKiBXaGVyZSB0aGUgYXR0YWNoZWQgY29tcG9uZW50IHNob3VsZCBsaXZlIGluIEFuZ3VsYXIncyAqbG9naWNhbCogY29tcG9uZW50IHRyZWUuXG4gICAqIFRoaXMgYWZmZWN0cyB3aGF0IGlzIGF2YWlsYWJsZSBmb3IgaW5qZWN0aW9uIGFuZCB0aGUgY2hhbmdlIGRldGVjdGlvbiBvcmRlciBmb3IgdGhlXG4gICAqIGNvbXBvbmVudCBpbnN0YW50aWF0ZWQgaW5zaWRlIG9mIHRoZSBkaWFsb2cuIFRoaXMgZG9lcyBub3QgYWZmZWN0IHdoZXJlIHRoZSBkaWFsb2dcbiAgICogY29udGVudCB3aWxsIGJlIHJlbmRlcmVkLlxuICAgKi9cbiAgdmlld0NvbnRhaW5lclJlZj86IFZpZXdDb250YWluZXJSZWY7XG5cbiAgLyoqIFRoZSBpZCBvZiB0aGUgZGlhbG9nLiAqL1xuICBpZD86IHN0cmluZztcblxuICAvKiogVGhlIEFSSUEgcm9sZSBvZiB0aGUgZGlhbG9nLiAqL1xuICByb2xlPzogRGlhbG9nUm9sZSA9ICdkaWFsb2cnO1xuXG4gIC8qKiBDdXN0b20gY2xhc3MoZXMpIGZvciB0aGUgb3ZlcmxheSBwYW5lbC4gKi9cbiAgcGFuZWxDbGFzcz86IHN0cmluZyB8IHN0cmluZ1tdID0gJyc7XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGRpYWxvZyBoYXMgYSBiYWNrZ3JvdW5kLiAqL1xuICBoYXNCYWNrZHJvcD86IGJvb2xlYW4gPSB0cnVlO1xuXG4gIC8qKiBDdXN0b20gY2xhc3MoZXMpIGZvciB0aGUgYmFja2Ryb3AuICovXG4gIGJhY2tkcm9wQ2xhc3M/OiBzdHJpbmcgfCB1bmRlZmluZWQgPSAnJztcblxuICAvKiogV2hldGhlciB0aGUgZGlhbG9nIGNhbiBiZSBjbG9zZWQgYnkgdXNlciBpbnRlcmFjdGlvbi4gKi9cbiAgZGlzYWJsZUNsb3NlPzogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIC8qKiBUaGUgd2lkdGggb2YgdGhlIGRpYWxvZy4gKi9cbiAgd2lkdGg/OiBzdHJpbmcgPSAnJztcblxuICAvKiogVGhlIGhlaWdodCBvZiB0aGUgZGlhbG9nLiAqL1xuICBoZWlnaHQ/OiBzdHJpbmcgPSAnJztcblxuICAvKiogVGhlIG1pbmltdW0gd2lkdGggb2YgdGhlIGRpYWxvZy4gKi9cbiAgbWluV2lkdGg/OiBzdHJpbmcgfCBudW1iZXIgPSAnJztcblxuICAvKiogVGhlIG1pbmltdW0gaGVpZ2h0IG9mIHRoZSBkaWFsb2cuICovXG4gIG1pbkhlaWdodD86IHN0cmluZyB8IG51bWJlciA9ICcnO1xuXG4gIC8qKiBUaGUgbWF4aW11bSB3aWR0aCBvZiB0aGUgZGlhbG9nLiAqL1xuICBtYXhXaWR0aD86IHN0cmluZyB8IG51bWJlciA9ICc4MHZ3JztcblxuICAvKiogVGhlIG1heGltdW0gaGVpZ2h0IG9mIHRoZSBkaWFsb2cuICovXG4gIG1heEhlaWdodD86IHN0cmluZyB8IG51bWJlciA9ICcnO1xuXG4gIC8qKiBUaGUgcG9zaXRpb24gb2YgdGhlIGRpYWxvZy4gKi9cbiAgcG9zaXRpb24/OiBEaWFsb2dQb3NpdGlvbjtcblxuICAvKiogRGF0YSB0byBiZSBpbmplY3RlZCBpbnRvIHRoZSBkaWFsb2cgY29udGVudC4gKi9cbiAgZGF0YT86IEQgfCBudWxsID0gbnVsbDtcblxuICAvKiogVGhlIGxheW91dCBkaXJlY3Rpb24gZm9yIHRoZSBkaWFsb2cgY29udGVudC4gKi9cbiAgZGlyZWN0aW9uPzogRGlyZWN0aW9uO1xuXG4gIC8qKiBJRCBvZiB0aGUgZWxlbWVudCB0aGF0IGRlc2NyaWJlcyB0aGUgZGlhbG9nLiAqL1xuICBhcmlhRGVzY3JpYmVkQnk/OiBzdHJpbmcgfCBudWxsID0gbnVsbDtcblxuICAvKiogQXJpYSBsYWJlbCB0byBhc3NpZ24gdG8gdGhlIGRpYWxvZyBlbGVtZW50ICovXG4gIGFyaWFMYWJlbD86IHN0cmluZyB8IG51bGwgPSBudWxsO1xuXG4gIC8qKlxuICAgKiBXaGVyZSB0aGUgZGlhbG9nIHNob3VsZCBmb2N1cyBvbiBvcGVuLlxuICAgKiBAYnJlYWtpbmctY2hhbmdlIDE0LjAuMCBSZW1vdmUgYm9vbGVhbiBvcHRpb24gZnJvbSBhdXRvRm9jdXMuIFVzZSBzdHJpbmcgb3JcbiAgICogQXV0b0ZvY3VzVGFyZ2V0IGluc3RlYWQuXG4gICAqL1xuICBhdXRvRm9jdXM/OiBBdXRvRm9jdXNUYXJnZXQgfCBzdHJpbmcgfCBib29sZWFuID0gJ2ZpcnN0LXRhYmJhYmxlJztcblxuICAvKiogRHVyYXRpb24gb2YgdGhlIGVudGVyIGFuaW1hdGlvbi4gSGFzIHRvIGJlIGEgdmFsaWQgQ1NTIHZhbHVlIChlLmcuIDEwMG1zKS4gKi9cbiAgZW50ZXJBbmltYXRpb25EdXJhdGlvbj86IHN0cmluZyA9ICcyMjVtcyc7XG5cbiAgLyoqIER1cmF0aW9uIG9mIHRoZSBleGl0IGFuaW1hdGlvbi4gSGFzIHRvIGJlIGEgdmFsaWQgQ1NTIHZhbHVlIChlLmcuIDUwbXMpLiAqL1xuICBleGl0QW5pbWF0aW9uRHVyYXRpb24/OiBzdHJpbmcgPSAnMjI1bXMnO1xufVxuIl19