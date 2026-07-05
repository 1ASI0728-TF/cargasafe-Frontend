import { Directive, EventEmitter, HostListener, Input, Output } from '@angular/core';

/**
 * Emits `longPress` after the element has been pressed and held for
 * `appLongPressDuration` milliseconds, and `longPressProgress` (0..1)
 * continuously while pressed, so the UI can show visual feedback
 * (e.g. a filling ring/bar) before the action fires.
 *
 * Used by the login logo and the app sidebar logo as a hidden shortcut
 * to reset the demo database — see `onSecretReset()` in those components.
 */
@Directive({
  selector: '[appLongPress]',
  standalone: true,
})
export class LongPressDirective {
  @Input() appLongPressDuration = 3000;
  @Output() longPress = new EventEmitter<void>();
  @Output() longPressProgress = new EventEmitter<number>();

  private startedAt = 0;
  private rafId?: number;
  private fired = false;

  @HostListener('pointerdown', ['$event'])
  onPointerDown(event: PointerEvent): void {
    // Ignore secondary buttons (right-click etc.)
    if (event.button !== 0) return;
    this.begin();
  }

  @HostListener('pointerup')
  @HostListener('pointerleave')
  @HostListener('pointercancel')
  onPointerRelease(): void {
    this.cancel();
  }

  private begin(): void {
    this.startedAt = performance.now();
    this.fired = false;
    const step = (now: number) => {
      const elapsed = now - this.startedAt;
      const progress = Math.min(1, elapsed / this.appLongPressDuration);
      this.longPressProgress.emit(progress);
      if (progress >= 1) {
        if (!this.fired) {
          this.fired = true;
          this.longPress.emit();
        }
        this.cancel();
        return;
      }
      this.rafId = requestAnimationFrame(step);
    };
    this.rafId = requestAnimationFrame(step);
  }

  private cancel(): void {
    if (this.rafId !== undefined) {
      cancelAnimationFrame(this.rafId);
      this.rafId = undefined;
    }
    this.longPressProgress.emit(0);
  }
}
