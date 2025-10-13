export class Vector2 {
  x: number;
  z: number;
  private _y: number;
  constructor(x: number | { x: number; y: number; z?: number }, y?: number) {
    if (typeof x === "object" && x !== null && "x" in x && "y" in x) {
      this.x = x.x;
      this._y = x.y;
      this.z = x.z !== undefined ? x.z : x.y;
    } else {
      this.x = x as number;
      this._y = y as number;
      this.z = y as number;
    }
  }

  set y(value: number) {
    this._y = value;
    this.z = value;
  }

  get y(): number {
    return this._y;
  }
  toString(): string {
    return `${this.x} ${this.y}`;
  }

  offset(x: number | { x: number; y: number }, y?: number): Vector2 {
    if (typeof x === "object" && x !== null && "x" in x && "y" in x) {
      return new Vector2(this.x + x.x, this.y + x.y);
    }
    return new Vector2(this.x + (x as number), this.y + (y as number));
  }

  check(x: number, y: number): boolean {
    return this.x === x && this.y === y;
  }

  normalized(): Vector2 {
    const length = Math.sqrt(this.x * this.x + this.y * this.y);
    if (length === 0) return new Vector2(0, 0);
    return new Vector2(this.x / length, this.y / length);
  }
}

export class Vector3 extends Vector2 {
  z: number;
  constructor(x: number | string | { x: number; y: number; z?: number }, y?: number, z?: number) {
    if (typeof x === "string") {
      const [sx, sy, sz] = x.split(" ").map(Number);
      super(sx, sy);
      this.z = sz;
    } else if (typeof x === "object" && x !== null && "x" in x && "y" in x) {
      super(x.x, x.y);
      this.z = x.z !== undefined ? x.z : x.y;
    } else {
      super(x as number, y as number);
      this.z = z as number;
    }
  }

  override offset(x: number | { x: number; y: number }, y?: number): Vector2;
  offset(x: number | { x: number; y: number; z?: number }, y?: number, z?: number): Vector3;
  override offset(x: any, y?: any, z?: any): Vector2 | Vector3 {
    if (typeof x === "object" && x !== null && "x" in x && "y" in x) {
      if ("z" in x) {
        return new Vector3(this.x + x.x, this.y + x.y, this.z + (x.z !== undefined ? x.z : x.y));
      }
      return new Vector2(this.x + x.x, this.y + x.y);
    }
    if (typeof z !== "undefined") {
      return new Vector3(this.x + x, this.y + y, this.z + z);
    }
    return new Vector2(this.x + x, this.y + y);
  }

  check(x: number, y: number): boolean;
  check(x: number, y: number, z: number): boolean;
  check(x: number, y: number, z?: number): boolean {
    if (typeof z === "undefined") {
      return this.x === x && this.y === y;
    }
    return this.x === x && this.y === y && this.z === z;
  }

  toVector2(): Vector2 {
    return new Vector2(this.x, this.y);
  }

  toString(): string {
    return `${this.x} ${this.y} ${this.z}`;
  }

  belowCenter(): Vector3 {
    const x = this._roundToNearestHalf(this.x);
    const y = this.y;
    const z = this._roundToNearestHalf(this.z);
    return new Vector3(x, y, z);
  }

  center(): Vector3 {
    const x = this._roundToNearestHalf(this.x);
    const y = this._roundToNearestHalf(this.y);
    const z = this._roundToNearestHalf(this.z);
    return new Vector3(x, y, z);
  }

  sizeCenter(): Vector3 {
    const x = Math.floor(this.x / 2);
    const y = Math.floor(this.z / 2);
    const z = Math.floor(this.z / 2);
    return new Vector3(x, y, z);
  }

  sizeBelowCenter(): Vector3 {
    const x = Math.floor(this.x / 2);
    const y = 0;
    const z = Math.floor(this.z / 2);
    return new Vector3(x, y, z);
  }

  private _roundToNearestHalf(value: number): number {
    return Math.round(value * 2) / 2;
  }
  normalized(): Vector3 {
    const len = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    if (len === 0) return new Vector3(0, 0, 0);
    return new Vector3(this.x / len, this.y / len, this.z / len);
  }
  toVolume(vec: Vector3): Vector3 {
    return new Vector3(Math.abs(this.x - vec.x), Math.abs(this.y - vec.y), Math.abs(this.z - vec.z));
  }
}
