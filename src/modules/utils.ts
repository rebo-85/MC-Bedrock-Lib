import { system } from "@minecraft/server";

export class Run {
  protected _process: number | undefined;
  protected _cb: () => void;
  constructor(cb: () => void) {
    this._cb = cb;
    this._process = system.run(this._cb);
  }
  dispose() {
    if (this._process) system.clearRun(this._process);
    this._process = undefined;
  }
}

export class RunInterval extends Run {
  constructor(cb: () => void, interval = 1) {
    super(() => {});
    this._cb = cb;
    this._process = system.runInterval(cb, interval);
  }
}

export class RunTimeOut extends Run {
  constructor(cb: () => void, timeOut = 1) {
    super(() => {});
    this._cb = cb;
    this._process = system.runTimeout(cb, timeOut);
  }
}

export class Manager {
  private _process: number;
  private _isDisposed: boolean;
  constructor() {
    this._init();

    const process = () => {
      this._main();
      if (!this._isDisposed) this._process = system.run(process);
    };
    this._process = system.run(process);
  }

  protected _init(): void {}
  protected _main(): void {}
  dispose() {
    this._isDisposed = true;
    system.clearRun(this._process);
  }
}
