import { system } from "@minecraft/server";

export class Run {
  protected _process: any;
  constructor() {
    this._process = null;
  }
  dispose() {
    system.clearRun(this._process);
  }
}
export class RunInterval extends Run {
  constructor(cb: () => void, interval: number = 1) {
    super();
    this._process = system.runInterval(cb, interval);
  }
}

export class RunTimeOut extends Run {
  constructor(cb: () => void, timeOut: number = 1) {
    super();
    this._process = system.runTimeout(cb, timeOut);
  }
}
