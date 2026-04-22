import {
  Component,
  input,
  OnChanges,
  OnDestroy,
  output,
  signal,
  SimpleChanges,
} from '@angular/core';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-countdown',
  imports: [],
  template: `
    <div class="countdown">
      {{ displayTime() }}
    </div>
  `,
  styles: [
    `
      .countdown {
        font-size: 2rem;
        font-weight: bold;
        text-align: center;
      }
    `,
  ],
})
export class Countdown implements OnChanges, OnDestroy {
  stop = output<void>();
  seconds = input<number>(0);
  timerEnd = input<number>(0);
  displayTime = signal('00:00');

  private subscription?: Subscription;
  private remainingSeconds: number = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['seconds'] || changes['timerEnd']) {
      this.startCountdown();
    }
  }

  private startCountdown(): void {
    this.stopCountdown();

    const timerEnd = this.timerEnd() || new Date().getTime() + (this.seconds() ?? 30) * 1000;

    this.remainingSeconds = this.seconds();
    this.updateDisplay();

    this.subscription = interval(1000).subscribe(() => {
      const now = new Date().getTime();
      const remainingTime = Math.max(0, Math.round((timerEnd - now) / 1000));

      this.remainingSeconds = remainingTime;

      if (this.remainingSeconds <= 0) {
        this.remainingSeconds = 0;
        this.updateDisplay();
        this.stopCountdown();
        this.stop.emit();
        return;
      }

      this.updateDisplay();
    });
  }

  private updateDisplay(): void {
    const minutes = Math.floor(this.remainingSeconds / 60);
    const seconds = this.remainingSeconds % 60;

    this.displayTime.set(`${this.pad(minutes)}:${this.pad(seconds)}`);
  }

  private pad(value: number): string {
    return value.toString().padStart(2, '0');
  }

  private stopCountdown(): void {
    this.subscription?.unsubscribe();
    this.subscription = undefined;
  }

  ngOnDestroy(): void {
    this.stopCountdown();
  }
}
