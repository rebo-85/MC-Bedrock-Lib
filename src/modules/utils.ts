import { system } from "@minecraft/server";

export class Run {
  protected id?: number;

  constructor(cb: () => void) {
    this.id = system.run(cb);
  }

  dispose() {
    if (this.id !== undefined) {
      system.clearRun(this.id);
      this.id = undefined;
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
  private id?: number;

  constructor(cb: () => void, tickInterval = 1) {
    this.id = system.runInterval(cb, tickInterval);
  }

  dispose() {
    if (this.id !== undefined) {
      system.clearRun(this.id);
      this.id = undefined;
    }
  }
}

export class RunTimeout {
  private id?: number;

  constructor(cb: () => void, delay = 1) {
    this.id = system.runTimeout(cb, delay);
  }

  dispose() {
    if (this.id !== undefined) {
      system.clearRun(this.id);
      this.id = undefined;
    }
  }
}

export class Manager {
  private id?: number;
  private disposed = false;
  private interval: number;

  constructor(interval = 1) {
    this.interval = interval;
    this.init();
    this.loop();
  }

  private loop() {
    const tick = () => {
      Promise.resolve(this.main())
        .catch(console.error)
        .finally(() => {
          if (!this.disposed) {
            this.id = system.runTimeout(tick, this.interval);
          }
        });
    };

    this.id = system.runTimeout(tick, this.interval);
  }

  protected init(): void {}
  protected async main(): Promise<void> {}

  dispose() {
    this.disposed = true;

    if (this.id !== undefined) {
      system.clearRun(this.id);
      this.id = undefined;
    }
  }
}
