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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhbG9nLWNvbmZpZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGstZXhwZXJpbWVudGFsL2RpYWxvZy9kaWFsb2ctY29uZmlnLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQTBCQSxNQUFNLE9BQU8sWUFBWTtJQUF6QjtRQXFCRSxtQ0FBbUM7UUFDbkMsU0FBSSxHQUFnQixRQUFRLENBQUM7UUFFN0IsOENBQThDO1FBQzlDLGVBQVUsR0FBdUIsRUFBRSxDQUFDO1FBRXBDLDJDQUEyQztRQUMzQyxnQkFBVyxHQUFhLElBQUksQ0FBQztRQUU3Qix5Q0FBeUM7UUFDekMsa0JBQWEsR0FBd0IsRUFBRSxDQUFDO1FBRXhDLDREQUE0RDtRQUM1RCxpQkFBWSxHQUFhLEtBQUssQ0FBQztRQUUvQiwrQkFBK0I7UUFDL0IsVUFBSyxHQUFZLEVBQUUsQ0FBQztRQUVwQixnQ0FBZ0M7UUFDaEMsV0FBTSxHQUFZLEVBQUUsQ0FBQztRQUVyQix1Q0FBdUM7UUFDdkMsYUFBUSxHQUFxQixFQUFFLENBQUM7UUFFaEMsd0NBQXdDO1FBQ3hDLGNBQVMsR0FBcUIsRUFBRSxDQUFDO1FBRWpDLHVDQUF1QztRQUN2QyxhQUFRLEdBQXFCLE1BQU0sQ0FBQztRQUVwQyx3Q0FBd0M7UUFDeEMsY0FBUyxHQUFxQixFQUFFLENBQUM7UUFLakMsbURBQW1EO1FBQ25ELFNBQUksR0FBYyxJQUFJLENBQUM7UUFLdkIsbURBQW1EO1FBQ25ELG9CQUFlLEdBQW1CLElBQUksQ0FBQztRQUV2QyxpREFBaUQ7UUFDakQsY0FBUyxHQUFtQixJQUFJLENBQUM7UUFFakM7Ozs7V0FJRztRQUNILGNBQVMsR0FBd0MsZ0JBQWdCLENBQUM7UUFFbEUsaUZBQWlGO1FBQ2pGLDJCQUFzQixHQUFZLE9BQU8sQ0FBQztRQUUxQywrRUFBK0U7UUFDL0UsMEJBQXFCLEdBQVksT0FBTyxDQUFDO0lBQzNDLENBQUM7Q0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtJbmplY3RvciwgVmlld0NvbnRhaW5lclJlZn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0RpcmVjdGlvbn0gZnJvbSAnQGFuZ3VsYXIvY2RrL2JpZGknO1xuaW1wb3J0IHtDb21wb25lbnRUeXBlfSBmcm9tICdAYW5ndWxhci9jZGsvb3ZlcmxheSc7XG5pbXBvcnQge0Nka0RpYWxvZ0NvbnRhaW5lcn0gZnJvbSAnLi9kaWFsb2ctY29udGFpbmVyJztcblxuLyoqIE9wdGlvbnMgZm9yIHdoZXJlIHRvIHNldCBmb2N1cyB0byBhdXRvbWF0aWNhbGx5IG9uIGRpYWxvZyBvcGVuICovXG5leHBvcnQgdHlwZSBBdXRvRm9jdXNUYXJnZXQgPSAnZGlhbG9nJyB8ICdmaXJzdC10YWJiYWJsZScgfCAnZmlyc3QtaGVhZGluZyc7XG5cbi8qKiBWYWxpZCBBUklBIHJvbGVzIGZvciBhIGRpYWxvZyBlbGVtZW50LiAqL1xuZXhwb3J0IHR5cGUgRGlhbG9nUm9sZSA9ICdkaWFsb2cnIHwgJ2FsZXJ0ZGlhbG9nJztcblxuLyoqIFBvc3NpYmxlIG92ZXJyaWRlcyBmb3IgYSBkaWFsb2cncyBwb3NpdGlvbi4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRGlhbG9nUG9zaXRpb24ge1xuICB0b3A/OiBzdHJpbmc7XG4gIGJvdHRvbT86IHN0cmluZztcbiAgbGVmdD86IHN0cmluZztcbiAgcmlnaHQ/OiBzdHJpbmc7XG59XG5cbmV4cG9ydCBjbGFzcyBEaWFsb2dDb25maWc8RCA9IGFueT4ge1xuICAvKiogQ29tcG9uZW50IHRvIHVzZSBhcyB0aGUgY29udGFpbmVyIGZvciB0aGUgZGlhbG9nLiAqL1xuICBjb250YWluZXJDb21wb25lbnQ/OiBDb21wb25lbnRUeXBlPENka0RpYWxvZ0NvbnRhaW5lcj47XG5cbiAgLyoqXG4gICAqIFdoZXJlIHRoZSBhdHRhY2hlZCBjb21wb25lbnQgc2hvdWxkIGxpdmUgaW4gQW5ndWxhcidzICpsb2dpY2FsKiBjb21wb25lbnQgdHJlZS5cbiAgICogVGhpcyBhZmZlY3RzIHdoYXQgaXMgYXZhaWxhYmxlIGZvciBpbmplY3Rpb24gYW5kIHRoZSBjaGFuZ2UgZGV0ZWN0aW9uIG9yZGVyIGZvciB0aGVcbiAgICogY29tcG9uZW50IGluc3RhbnRpYXRlZCBpbnNpZGUgb2YgdGhlIGRpYWxvZy4gVGhpcyBkb2VzIG5vdCBhZmZlY3Qgd2hlcmUgdGhlIGRpYWxvZ1xuICAgKiBjb250ZW50IHdpbGwgYmUgcmVuZGVyZWQuXG4gICAqL1xuICB2aWV3Q29udGFpbmVyUmVmPzogVmlld0NvbnRhaW5lclJlZjtcblxuICAvKipcbiAgICogSW5qZWN0b3IgdXNlZCBmb3IgdGhlIGluc3RhbnRpYXRpb24gb2YgdGhlIGNvbXBvbmVudCB0byBiZSBhdHRhY2hlZC4gSWYgcHJvdmlkZWQsXG4gICAqIHRha2VzIHByZWNlZGVuY2Ugb3ZlciB0aGUgaW5qZWN0b3IgaW5kaXJlY3RseSBwcm92aWRlZCBieSBgVmlld0NvbnRhaW5lclJlZmAuXG4gICAqL1xuICBpbmplY3Rvcj86IEluamVjdG9yO1xuXG4gIC8qKiBUaGUgaWQgb2YgdGhlIGRpYWxvZy4gKi9cbiAgaWQ/OiBzdHJpbmc7XG5cbiAgLyoqIFRoZSBBUklBIHJvbGUgb2YgdGhlIGRpYWxvZy4gKi9cbiAgcm9sZT86IERpYWxvZ1JvbGUgPSAnZGlhbG9nJztcblxuICAvKiogQ3VzdG9tIGNsYXNzKGVzKSBmb3IgdGhlIG92ZXJsYXkgcGFuZWwuICovXG4gIHBhbmVsQ2xhc3M/OiBzdHJpbmcgfCBzdHJpbmdbXSA9ICcnO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSBkaWFsb2cgaGFzIGEgYmFja2dyb3VuZC4gKi9cbiAgaGFzQmFja2Ryb3A/OiBib29sZWFuID0gdHJ1ZTtcblxuICAvKiogQ3VzdG9tIGNsYXNzKGVzKSBmb3IgdGhlIGJhY2tkcm9wLiAqL1xuICBiYWNrZHJvcENsYXNzPzogc3RyaW5nIHwgdW5kZWZpbmVkID0gJyc7XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGRpYWxvZyBjYW4gYmUgY2xvc2VkIGJ5IHVzZXIgaW50ZXJhY3Rpb24uICovXG4gIGRpc2FibGVDbG9zZT86IGJvb2xlYW4gPSBmYWxzZTtcblxuICAvKiogVGhlIHdpZHRoIG9mIHRoZSBkaWFsb2cuICovXG4gIHdpZHRoPzogc3RyaW5nID0gJyc7XG5cbiAgLyoqIFRoZSBoZWlnaHQgb2YgdGhlIGRpYWxvZy4gKi9cbiAgaGVpZ2h0Pzogc3RyaW5nID0gJyc7XG5cbiAgLyoqIFRoZSBtaW5pbXVtIHdpZHRoIG9mIHRoZSBkaWFsb2cuICovXG4gIG1pbldpZHRoPzogc3RyaW5nIHwgbnVtYmVyID0gJyc7XG5cbiAgLyoqIFRoZSBtaW5pbXVtIGhlaWdodCBvZiB0aGUgZGlhbG9nLiAqL1xuICBtaW5IZWlnaHQ/OiBzdHJpbmcgfCBudW1iZXIgPSAnJztcblxuICAvKiogVGhlIG1heGltdW0gd2lkdGggb2YgdGhlIGRpYWxvZy4gKi9cbiAgbWF4V2lkdGg/OiBzdHJpbmcgfCBudW1iZXIgPSAnODB2dyc7XG5cbiAgLyoqIFRoZSBtYXhpbXVtIGhlaWdodCBvZiB0aGUgZGlhbG9nLiAqL1xuICBtYXhIZWlnaHQ/OiBzdHJpbmcgfCBudW1iZXIgPSAnJztcblxuICAvKiogVGhlIHBvc2l0aW9uIG9mIHRoZSBkaWFsb2cuICovXG4gIHBvc2l0aW9uPzogRGlhbG9nUG9zaXRpb247XG5cbiAgLyoqIERhdGEgdG8gYmUgaW5qZWN0ZWQgaW50byB0aGUgZGlhbG9nIGNvbnRlbnQuICovXG4gIGRhdGE/OiBEIHwgbnVsbCA9IG51bGw7XG5cbiAgLyoqIFRoZSBsYXlvdXQgZGlyZWN0aW9uIGZvciB0aGUgZGlhbG9nIGNvbnRlbnQuICovXG4gIGRpcmVjdGlvbj86IERpcmVjdGlvbjtcblxuICAvKiogSUQgb2YgdGhlIGVsZW1lbnQgdGhhdCBkZXNjcmliZXMgdGhlIGRpYWxvZy4gKi9cbiAgYXJpYURlc2NyaWJlZEJ5Pzogc3RyaW5nIHwgbnVsbCA9IG51bGw7XG5cbiAgLyoqIEFyaWEgbGFiZWwgdG8gYXNzaWduIHRvIHRoZSBkaWFsb2cgZWxlbWVudCAqL1xuICBhcmlhTGFiZWw/OiBzdHJpbmcgfCBudWxsID0gbnVsbDtcblxuICAvKipcbiAgICogV2hlcmUgdGhlIGRpYWxvZyBzaG91bGQgZm9jdXMgb24gb3Blbi5cbiAgICogQGJyZWFraW5nLWNoYW5nZSAxNC4wLjAgUmVtb3ZlIGJvb2xlYW4gb3B0aW9uIGZyb20gYXV0b0ZvY3VzLiBVc2Ugc3RyaW5nIG9yXG4gICAqIEF1dG9Gb2N1c1RhcmdldCBpbnN0ZWFkLlxuICAgKi9cbiAgYXV0b0ZvY3VzPzogQXV0b0ZvY3VzVGFyZ2V0IHwgc3RyaW5nIHwgYm9vbGVhbiA9ICdmaXJzdC10YWJiYWJsZSc7XG5cbiAgLyoqIER1cmF0aW9uIG9mIHRoZSBlbnRlciBhbmltYXRpb24uIEhhcyB0byBiZSBhIHZhbGlkIENTUyB2YWx1ZSAoZS5nLiAxMDBtcykuICovXG4gIGVudGVyQW5pbWF0aW9uRHVyYXRpb24/OiBzdHJpbmcgPSAnMjI1bXMnO1xuXG4gIC8qKiBEdXJhdGlvbiBvZiB0aGUgZXhpdCBhbmltYXRpb24uIEhhcyB0byBiZSBhIHZhbGlkIENTUyB2YWx1ZSAoZS5nLiA1MG1zKS4gKi9cbiAgZXhpdEFuaW1hdGlvbkR1cmF0aW9uPzogc3RyaW5nID0gJzIyNW1zJztcbn1cbiJdfQ==