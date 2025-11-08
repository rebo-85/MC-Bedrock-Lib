import { RunInterval } from "../utils";

/**
 * Countdown timer utility for ticking events.
 *
 * @param durationInSeconds How long the timer runs (seconds)
 * @param onEnd Callback when timer ends
 * @param onUpdate Callback on each tick (min, sec)
 */
export class CountDownTimer {
  timer: number;
  minutes: number = 0;
  seconds: string | number = "00";
  protected _process: RunInterval;
  constructor(
    durationInSeconds: number = 10,
    onEnd: () => void = () => {},
    onUpdate: (min: number, sec: string | number) => void = () => {}
  ) {
    this.timer = durationInSeconds;
    this._process = new RunInterval(() => {
      this.minutes = Math.floor(this.timer / 60);
      this.seconds = this.timer % 60;
      this.seconds = this.seconds < 10 ? "0" + this.seconds : this.seconds;
      onUpdate(this.minutes, this.seconds);
      if (--this.timer < -1) {
        onEnd();
        this._process.dispose();
        return;
      }
    }, 20);
  }
  /**
   * Disposes the timer process.
   */
  dispose() {
    this._process.dispose();
  }
}
