import { lerp } from "utils";

export class Vector2 {
  x: number;
  y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  toString(): string {
    return `${this.x} ${this.y}`;
  }

  offset(value: Vector2): Vector2 {
    return new Vector2(this.x + value.x, this.y + value.y);
  }

  check(x: number, y: number): boolean {
    return this.x === x && this.y === y;
  }

  normalized(): Vector2 {
    const length = Math.sqrt(this.x * this.x + this.y * this.y);
    if (length === 0) return new Vector2(0, 0);
    return new Vector2(this.x / length, this.y / length);
  }

  static lerp(a: Vector2, b: Vector2, t: number) {
    return new Vector2(lerp(a.x, b.x, t), lerp(a.y, b.y, t));
  }
  static extend(v2: { x: number; y: number }) {
    return new Vector2(v2.x, v2.y);
  }
}

export class Vector3 extends Vector2 {
  z: number;
  constructor(x: number, y: number, z: number) {
    super(x as number, y as number);
    this.z = z as number;
  }

  override offset(value: Vector3) {
    return new Vector3(this.x + value.x, this.y + value.y, this.z + value.z);
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

  rotate(angle: number) {
    const rad = (angle * Math.PI) / 180;
    const c = Math.cos(rad),
      s = Math.sin(rad);
    const rx = this.x * c - this.z * s;
    const rz = this.x * s + this.z * c;
    return new Vector3(rx, this.y, rz);
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

  static lerp(a: Vector3, b: Vector3, t: number) {
    return new Vector3(lerp(a.x, b.x, t), lerp(a.y, b.y, t), lerp(a.z, b.z, t));
  }

  static extend(v3: { x: number; y: number; z: number }) {
    return new Vector3(v3.x, v3.y, v3.z);
  }
}
