import { system } from "@minecraft/server";

export class Run {
  protected _id?: number;

  constructor(cb: () => void) {
    this._id = system.run(cb);
  }

  dispose() {
    if (this._id !== undefined) {
      system.clearRun(this._id);
      this._id = undefined;
    }
  }

  static interval(cb: () => void, tickInterval = 1) {
    return new RunInterval(cb, tickInterval);
  }

  static timeout(cb: () => void, delay = 1) {
    return new RunTimeout(cb, delay);
  }
}

export class RunInterval {
  private _id?: number;

  constructor(cb: () => void, tickInterval = 1) {
    this._id = system.runInterval(cb, tickInterval);
  }

  dispose() {
    if (this._id !== undefined) {
      system.clearRun(this._id);
      this._id = undefined;
    }
  }
}

export class RunTimeout {
  private _id?: number;

  constructor(cb: () => void, delay = 1) {
    this._id = system.runTimeout(cb, delay);
  }

  dispose() {
    if (this._id !== undefined) {
      system.clearRun(this._id);
      this._id = undefined;
    }
  }
}

export class Manager {
  private _id?: number;
  private _disposed = false;
  private _interval: number;

  constructor(interval = 1) {
    this._interval = interval;
    this._init();
    this._loop();
  }

  private _loop() {
    const tick = () => {
      Promise.resolve(this._main())
        .catch(console.error)
        .finally(() => {
          if (!this._disposed) {
            this._id = system.runTimeout(tick, this._interval);
          }
        });
    };

    this._id = system.runTimeout(tick, this._interval);
  }

  protected _init(): void {}
  protected async _main(): Promise<void> {}

  dispose() {
    this._disposed = true;

    if (this._id !== undefined) {
      system.clearRun(this._id);
      this._id = undefined;
    }
  }
}
