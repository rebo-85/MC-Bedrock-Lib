import { lerp } from "utils";
import type { Vector3 } from "@minecraft/server";
export class V2 {
  x: number;
  y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  toString(): string {
    return `${this.x} ${this.y}`;
  }

  offset(value: V2 | { x: number; y: number }): V2 {
    return new V2(this.x + value.x, this.y + value.y);
  }

  check(x: number, y: number): boolean {
    return this.x === x && this.y === y;
  }

  normalized(): V2 {
    const length = Math.sqrt(this.x * this.x + this.y * this.y);
    if (length === 0) return new V2(0, 0);
    return new V2(this.x / length, this.y / length);
  }

  static lerp(a: V2, b: V2, t: number) {
    return new V2(lerp(a.x, b.x, t), lerp(a.y, b.y, t));
  }
  static extend(v2: { x: number; y: number }) {
    return new V2(v2.x, v2.y);
  }
}

export class V3 extends V2 {
  z: number;
  constructor(x: number, y: number, z: number) {
    super(x as number, y as number);
    this.z = z as number;
  }

  override offset(value: V3 | Vector3): V3 {
    return new V3(this.x + value.x, this.y + value.y, this.z + value.z);
  }

  check(x: number, y: number): boolean;
  check(x: number, y: number, z: number): boolean;
  check(x: number, y: number, z?: number): boolean {
    if (typeof z === "undefined") {
      return this.x === x && this.y === y;
    }
    return this.x === x && this.y === y && this.z === z;
  }

  toV2(): V2 {
    return new V2(this.x, this.y);
  }

  toString(): string {
    return `${this.x} ${this.y} ${this.z}`;
  }

  belowCenter(): V3 {
    const x = this._roundToNearestHalf(this.x);
    const y = this.y;
    const z = this._roundToNearestHalf(this.z);
    return new V3(x, y, z);
  }

  center(): V3 {
    const x = this._roundToNearestHalf(this.x);
    const y = this._roundToNearestHalf(this.y);
    const z = this._roundToNearestHalf(this.z);
    return new V3(x, y, z);
  }

  sizeCenter(): V3 {
    const x = Math.floor(this.x / 2);
    const y = Math.floor(this.z / 2);
    const z = Math.floor(this.z / 2);
    return new V3(x, y, z);
  }

  sizeBelowCenter(): V3 {
    const x = Math.floor(this.x / 2);
    const y = 0;
    const z = Math.floor(this.z / 2);
    return new V3(x, y, z);
  }

  rotate(angle: number) {
    const rad = (angle * Math.PI) / 180;
    const c = Math.cos(rad);
    const s = Math.sin(rad);
    const rx = this.x * c - this.z * s;
    const rz = this.x * s + this.z * c;
    return new V3(rx, this.y, rz);
  }

  snapToBlockCenter() {
    const x = Math.floor(this.x) + 0.5;
    const y = Math.floor(this.y);
    const z = Math.floor(this.z) + 0.5;
    return new V3(x, y, z);
  }

  private _roundToNearestHalf(value: number): number {
    return Math.round(value * 2) / 2;
  }
  normalized(): V3 {
    const len = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    if (len === 0) return new V3(0, 0, 0);
    return new V3(this.x / len, this.y / len, this.z / len);
  }
  toVolume(vec: V3): V3 {
    return new V3(Math.abs(this.x - vec.x), Math.abs(this.y - vec.y), Math.abs(this.z - vec.z));
  }

  static lerp(a: V3, b: V3, t: number) {
    return new V3(lerp(a.x, b.x, t), lerp(a.y, b.y, t), lerp(a.z, b.z, t));
  }

  static extend(v3: { x: number; y: number; z: number }) {
    return new V3(v3.x, v3.y, v3.z);
  }
}
