import { system, World, world } from "@minecraft/server";

export function tillWorldLoad(): Promise<void> {
  return new Promise((resolve) => {
    const callback = () => {
      world.afterEvents.worldLoad.unsubscribe(callback);
      resolve();
    };
    world.afterEvents.worldLoad.subscribe(callback);
  });
}

export function createDimGetter(dimId: string) {
  return function (this: World): any {
    const w = this;
    const dimName = dimId.split(":")[1].replace("the_", "");
    const err = new Error(`[World::${dimName}] requires await.`);

    try {
      return w.getDimension(dimId);
    } catch {
      const handler = {
        get(target: any, prop: string | symbol) {
          if (prop === "then") {
            return (onRes: any, onRej: any) => {
              const p = new Promise((res) => {
                const chk = () => {
                  try {
                    const dim = w.getDimension(dimId);
                    res(dim);
                  } catch {
                    system.run(chk);
                  }
                };
                chk();
              });
              return p.then(onRes, onRej);
            };
          }
          if (prop === "toJSON" || prop === "toString" || prop === "valueOf") {
            return () => {
              throw err;
            };
          }
          throw err;
        },
      };
      return new Proxy({}, handler);
    }
  };
}

export function createPlayersGetter() {
  return function (this: World): any {
    const w = this;
    const err = new Error("[World::players] requires await.");

    try {
      return w.getAllPlayers();
    } catch {
      const handler = {
        get(target: any, prop: string | symbol) {
          if (prop === "then") {
            return (onRes: any, onRej: any) => {
              const p = new Promise((res) => {
                const chk = () => {
                  try {
                    const plrs = w.getAllPlayers();
                    res(plrs);
                  } catch {
                    system.run(chk);
                  }
                };
                chk();
              });
              return p.then(onRes, onRej);
            };
          }
          if (prop === "toJSON" || prop === "toString" || prop === "valueOf") {
            return () => {
              throw err;
            };
          }
          const idx = Number(prop);
          if (!isNaN(idx)) {
            return {
              then(onRes: any, onRej: any) {
                const p = new Promise((res) => {
                  const chk = () => {
                    try {
                      const plrs = w.getAllPlayers();
                      res(plrs[idx]);
                    } catch {
                      system.run(chk);
                    }
                  };
                  chk();
                });
                return p.then(onRes, onRej);
              },
            };
          }
          throw err;
        },
      };
      return new Proxy({}, handler);
    }
  };
}

export function createArrayProxy<T>(getArr: () => T[], getRdy: () => boolean): any {
  // If ready, return array directly
  if (getRdy()) return getArr();

  // Otherwise return Proxy that supports await
  const err = new Error("Array access requires await.");
  const handler = {
    get(target: any, prop: string | symbol) {
      if (prop === "then") {
        return (onRes: any, onRej: any) => {
          const p = new Promise<T[]>((res) => {
            const chk = () => (getRdy() ? res(getArr()) : system.run(chk));
            system.run(chk);
          });
          return p.then(onRes, onRej);
        };
      }
      if (prop === "toJSON" || prop === "toString" || prop === "valueOf") {
        return () => {
          throw err;
        };
      }
      const idx = Number(prop);
      if (!isNaN(idx)) {
        return {
          then(onRes: any, onRej: any) {
            const p = new Promise<T>((res) => {
              const chk = () => (getRdy() ? res(getArr()[idx]) : system.run(chk));
              system.run(chk);
            });
            return p.then(onRes, onRej);
          },
        };
      }
      throw err;
    },
  };
  return new Proxy({}, handler);
}

export function defineProperties(target: object, properties: Record<string, PropertyDescriptor>) {
  for (const [prop, descriptor] of Object.entries(properties)) {
    Object.defineProperty(target, prop, { ...descriptor, configurable: true });
  }
}

export function getRandom<T>(arr: T[]): T {
  const i = Math.floor(Math.random() * arr.length);
  return arr[i];
}

export function idTranslate(id: string): string {
  return id
    .split(":")[1]
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function arraysEqual(arr1: any[], arr2: any[]): boolean {
  if (arr1 === arr2) return true;
  if (arr1 == null || arr2 == null) return false;
  if (arr1.length !== arr2.length) return false;

  for (let i = 0; i < arr1.length; ++i) {
    if (typeof arr1[i] === "object" && typeof arr2[i] === "object") {
      if (!objectsEqual(arr1[i], arr2[i])) return false;
    } else if (arr1[i] !== arr2[i]) {
      return false;
    }
  }
  return true;
}

function objectsEqual(obj1: Record<string, any>, obj2: Record<string, any>): boolean {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (obj1[key] !== obj2[key]) return false;
  }

  return true;
}

export function clampValue(num: number, min: number, max: number): number {
  if (num < min) return min;
  if (num > max) return max;
  return num;
}

export function deepClone<T>(input: T): T {
  if (input === null || typeof input !== "object") return input;
  if (Array.isArray(input)) return input.map(deepClone) as any;
  const out: any = {};
  for (const key in input) out[key] = deepClone((input as any)[key]);
  return out;
}

export function isPlainObject(val: unknown): val is Record<string, unknown> {
  return !!val && typeof val === "object" && val.constructor === Object;
}

export function pickKeys<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const picked: Partial<T> = {};
  for (const key of keys) if (key in obj) picked[key] = obj[key];
  return picked as Pick<T, K>;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function toCommandDecimal(val: number) {
  const n = Number(val);
  return n % 1 === 0 ? n.toFixed(1) : n.toFixed(16);
}
