import { RunInterval } from "./utils";

export class CountDownTimer {
  timer: number;
  minutes: number = 0;
  seconds: string | number = "00";
  process: any;
  constructor(
    durationInSeconds: number = 10,
    onEnd: () => void = () => {},
    onUpdate: (min: number, sec: string | number) => void = () => {}
  ) {
    this.timer = durationInSeconds;
    this.process = new RunInterval(() => {
      this.minutes = Math.floor(this.timer / 60);
      this.seconds = this.timer % 60;
      this.seconds = this.seconds < 10 ? "0" + this.seconds : this.seconds;
      onUpdate(this.minutes, this.seconds);
      if (--this.timer < -1) {
        onEnd();
        this.process.dispose();
        return;
      }
    }, 20);
  }
  dispose() {
    this.process.dispose();
  }
}
