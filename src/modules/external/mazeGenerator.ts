import { Dimension } from "@minecraft/server";
import { Vector3, Edge, Vector2 } from "mc-bedrock-lib";

interface MazeOptions {
  entranceEdge?: Edge;
  entranceCoord?: number;
  entrance?: Vector2;
  exitEdge?: Edge;
  exitCoord?: number;
  exit?: Vector2;
  loopDensity?: number;
}

export class MazeGenerator {
  private _w: number;
  private _l: number;
  private _grid: number[][] = [];
  private _vis: boolean[][] = [];
  private _entrance: { x: number; y: number } | null = null;
  private _exit: { x: number; y: number } | null = null;

  static isCorner(x: number, y: number, w: number, h: number): boolean {
    return (x === 0 || x === w - 1) && (y === 0 || y === h - 1);
  }

  private _initGrid(w: number, l: number): void {
    this._w = w;
    this._l = l;
    this._grid = Array.from({ length: this._l }, () => Array(this._w).fill(0));
    this._vis = Array.from({ length: this._l }, () => Array(this._w).fill(false));
  }

  private _inBounds(x: number, y: number): boolean {
    return x >= 0 && y >= 0 && x < this._w && y < this._l;
  }

  private _forceToEdge(coord: number, edge: Edge): [number, number] {
    if (edge === "left" || edge === "right") {
      if (coord == null || coord < 0 || coord >= this._l)
        throw new Error(`Entrance/exit coord ${coord} out of bounds for edge '${edge}' (maze height ${this._l})`);
      return [edge === "left" ? 0 : this._w - 1, coord];
    }
    if (edge === "top" || edge === "bottom") {
      if (coord == null || coord < 0 || coord >= this._w)
        throw new Error(`Entrance/exit coord ${coord} out of bounds for edge '${edge}' (maze width ${this._w})`);
      return [coord, edge === "top" ? 0 : this._l - 1];
    }
    throw new Error(`Unknown edge '${edge}'`);
  }

  private _carve(sx: number, sy: number): void {
    const dx = [0, 1, 0, -1];
    const dy = [-1, 0, 1, 0];
    const stack: [number, number][] = [[sx, sy]];
    this._vis[sy][sx] = true;
    this._grid[sy][sx] = 1;

    while (stack.length) {
      const [cx, cy] = stack[stack.length - 1];
      const dirs = [0, 1, 2, 3].sort(() => Math.random() - 0.5);
      let moved = false;
      for (const d of dirs) {
        const nx = cx + dx[d] * 2;
        const ny = cy + dy[d] * 2;
        if (this._inBounds(nx, ny) && !this._vis[ny][nx]) {
          this._grid[cy + dy[d]][cx + dx[d]] = 1;
          this._grid[ny][nx] = 1;
          this._vis[ny][nx] = true;
          stack.push([nx, ny]);
          moved = true;
          break;
        }
      }
      if (!moved) stack.pop();
    }
  }

  private _connectToMaze(ix: number, iy: number): boolean {
    if (!this._inBounds(ix, iy)) return false;
    if (this._grid[iy][ix] === 1) return true;

    const q: [number, number][] = [];
    const prev: (number[] | null)[][] = Array.from({ length: this._l }, () => Array(this._w).fill(null));
    q.push([ix, iy]);
    prev[iy][ix] = [-1, -1];
    let found: [number, number] | null = null;

    while (q.length && !found) {
      const [cx, cy] = q.shift() as [number, number];
      const neighbors = [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ];
      for (const [dx, dy] of neighbors) {
        const nx = cx + dx;
        const ny = cy + dy;
        if (!this._inBounds(nx, ny)) continue;
        if (prev[ny][nx]) continue;
        prev[ny][nx] = [cx, cy];
        if (this._grid[ny][nx] === 1) {
          found = [nx, ny];
          break;
        }
        q.push([nx, ny]);
      }
    }

    if (!found) return false;
    let [px, py] = found;
    while (!(px === ix && py === iy)) {
      this._grid[py][px] = 1;
      const p = prev[py][px] as number[];
      px = p[0];
      py = p[1];
    }
    this._grid[iy][ix] = 1;
    return true;
  }

  private _computeEndpoints(opts: MazeOptions = {}) {
    let sx: number, sy: number, ex: number, ey: number;
    let entranceDeclared = false;
    let exitDeclared = false;

    if (opts.entranceEdge) {
      const entCoord =
        opts.entranceCoord ??
        (opts.entranceEdge === "left" || opts.entranceEdge === "right"
          ? Math.floor(this._l / 2)
          : Math.floor(this._w / 2));
      if (opts.entranceEdge === "left" || opts.entranceEdge === "right") {
        if (entCoord < 0 || entCoord >= this._l)
          throw new Error(`Entrance coord ${entCoord} out of bounds for edge '${opts.entranceEdge}'`);
      } else {
        if (entCoord < 0 || entCoord >= this._w)
          throw new Error(`Entrance coord ${entCoord} out of bounds for edge '${opts.entranceEdge}'`);
      }
      [sx, sy] = this._forceToEdge(entCoord, opts.entranceEdge);
      entranceDeclared = true;
    } else if (opts.entrance) {
      sx = opts.entrance.x;
      sy = opts.entrance.y;
      if (!(sx === 0 || sx === this._w - 1 || sy === 0 || sy === this._l - 1))
        throw new Error(
          "Explicit entrance must be on the outer border (use entranceEdge/entranceCoord for edge placement)"
        );
      entranceDeclared = true;
    } else {
      sx = Math.floor(this._w / 2);
      sy = Math.floor(this._l / 2);
    }

    if (opts.exitEdge) {
      const exitCoord =
        opts.exitCoord ??
        (opts.exitEdge === "left" || opts.exitEdge === "right" ? Math.floor(this._l / 2) : Math.floor(this._w / 2));
      if (opts.exitEdge === "left" || opts.exitEdge === "right") {
        if (exitCoord < 0 || exitCoord >= this._l)
          throw new Error(`Exit coord ${exitCoord} out of bounds for edge '${opts.exitEdge}'`);
      } else {
        if (exitCoord < 0 || exitCoord >= this._w)
          throw new Error(`Exit coord ${exitCoord} out of bounds for edge '${opts.exitEdge}'`);
      }
      [ex, ey] = this._forceToEdge(exitCoord, opts.exitEdge);
      exitDeclared = true;
    } else if (opts.exit) {
      ex = opts.exit.x;
      ey = opts.exit.y;
      if (!(ex === 0 || ex === this._w - 1 || ey === 0 || ey === this._l - 1))
        throw new Error("Explicit exit must be on the outer border (use exitEdge/exitCoord for edge placement)");
      exitDeclared = true;
    } else {
      ex = Math.floor(this._w / 2);
      ey = 0;
    }

    if ([sx, sy, ex, ey].some((v) => v == null)) throw new Error("Computed entrance/exit coordinates are invalid");
    if (!this._inBounds(sx, sy) || !this._inBounds(ex, ey)) throw new Error("Entrance/exit out of bounds");
    if (MazeGenerator.isCorner(sx, sy, this._w, this._l)) throw new Error("Entrance cannot be at a corner");
    if (MazeGenerator.isCorner(ex, ey, this._w, this._l)) throw new Error("Exit cannot be at a corner");

    return { sx, sy, ex, ey, entranceDeclared, exitDeclared };
  }

  private _make(w: number, l: number, opts: MazeOptions = {}): number[][] {
    this._initGrid(w, l);
    const { sx, sy, ex, ey, entranceDeclared, exitDeclared } = this._computeEndpoints(opts);

    let seedX: number, seedY: number;
    if (entranceDeclared) {
      seedX = sx;
      seedY = sy;
      if (sx === 0) seedX = sx + 1;
      else if (sx === this._w - 1) seedX = sx - 1;
      else if (sy === 0) seedY = sy + 1;
      else if (sy === this._l - 1) seedY = sy - 1;
    } else {
      seedX = Math.floor(this._w / 2);
      seedY = Math.floor(this._l / 2);
    }

    if (seedX % 2 === 0) {
      if (seedX + 1 < this._w) seedX = seedX + 1;
      else seedX = seedX - 1;
    }
    if (seedY % 2 === 0) {
      if (seedY + 1 < this._l) seedY = seedY + 1;
      else seedY = seedY - 1;
    }

    if (!this._inBounds(seedX, seedY)) throw new Error("Invalid _carve seed");
    this._grid[seedY][seedX] = 1;
    this._carve(seedX, seedY);

    const loopDensity = Math.max(0, Math.min(1, Number(opts.loopDensity || 0)));
    if (loopDensity > 0) {
      const candidates: [number, number][] = [];
      for (let y = 1; y < this._l - 1; y++) {
        for (let x = 1; x < this._w - 1; x++) {
          if (this._grid[y][x] !== 0) continue;
          const dirs = [
            [1, 0],
            [0, 1],
            [-1, 0],
            [0, -1],
          ];
          for (const [dx, dy] of dirs) {
            const aX = x + dx,
              aY = y + dy,
              bX = x - dx,
              bY = y - dy;
            if (
              this._inBounds(aX, aY) &&
              this._inBounds(bX, bY) &&
              this._grid[aY][aX] === 1 &&
              this._grid[bY][bX] === 1
            ) {
              candidates.push([x, y]);
              break;
            }
          }
        }
      }
      if (candidates.length > 0) {
        for (let i = candidates.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
        }
        const toRemove = Math.max(1, Math.floor(candidates.length * loopDensity));
        for (let i = 0; i < toRemove && i < candidates.length; i++) {
          const [wx, wy] = candidates[i];
          this._grid[wy][wx] = 1;
        }
      }
    }

    for (let x = 0; x < this._w; x++) {
      if (
        this._grid[0][x] === 1 &&
        !(entranceDeclared && x === sx && 0 === sy) &&
        !(exitDeclared && x === ex && 0 === ey)
      )
        this._grid[0][x] = 0;
      if (
        this._grid[this._l - 1][x] === 1 &&
        !(entranceDeclared && x === sx && this._l - 1 === sy) &&
        !(exitDeclared && x === ex && this._l - 1 === ey)
      )
        this._grid[this._l - 1][x] = 0;
    }
    for (let y = 0; y < this._l; y++) {
      if (
        this._grid[y][0] === 1 &&
        !(entranceDeclared && 0 === sx && y === sy) &&
        !(exitDeclared && 0 === ex && y === ey)
      )
        this._grid[y][0] = 0;
      if (
        this._grid[y][this._w - 1] === 1 &&
        !(entranceDeclared && this._w - 1 === sx && y === sy) &&
        !(exitDeclared && this._w - 1 === ex && y === ey)
      )
        this._grid[y][this._w - 1] = 0;
    }

    if (entranceDeclared) {
      this._grid[sy][sx] = 1;
      if (sx === 0 && sx + 1 < this._w) this._grid[sy][sx + 1] = 1;
      if (sx === this._w - 1 && sx - 1 >= 0) this._grid[sy][sx - 1] = 1;
      if (sy === 0 && sy + 1 < this._l) this._grid[sy + 1][sx] = 1;
      if (sy === this._l - 1 && sy - 1 >= 0) this._grid[sy - 1][sx] = 1;
    }
    if (exitDeclared) {
      this._grid[ey][ex] = 1;
      if (ex === 0 && ex + 1 < this._w) this._grid[ey][ex + 1] = 1;
      if (ex === this._w - 1 && ex - 1 >= 0) this._grid[ey][ex - 1] = 1;
      if (ey === 0 && ey + 1 < this._l) this._grid[ey + 1][ex] = 1;
      if (ey === this._l - 1 && ey - 1 >= 0) this._grid[ey - 1][ex] = 1;
    }

    this._entrance = entranceDeclared ? { x: sx, y: sy } : null;
    this._exit = exitDeclared ? { x: ex, y: ey } : null;

    if (entranceDeclared) {
      let ix = sx,
        iy = sy;
      if (sx === 0) ix = sx + 1;
      else if (sx === this._w - 1) ix = sx - 1;
      else if (sy === 0) iy = sy + 1;
      else if (sy === this._l - 1) iy = sy - 1;
      this._connectToMaze(ix, iy);
      this._grid[sy][sx] = 1;
      if (this._inBounds(ix, iy)) this._grid[iy][ix] = 1;
    }
    if (exitDeclared) {
      let jx = ex,
        jy = ey;
      if (ex === 0) jx = ex + 1;
      else if (ex === this._w - 1) jx = ex - 1;
      else if (ey === 0) jy = ey + 1;
      else if (ey === this._l - 1) jy = ey - 1;
      this._connectToMaze(jx, jy);
      this._grid[ey][ex] = 1;
      if (this._inBounds(jx, jy)) this._grid[jy][jx] = 1;
    }

    return this._grid;
  }

  generate(wdim: Dimension, loc: Vector3, size: Vector3, blockType: string, opts: MazeOptions = {}): void {
    const air = "minecraft:air";

    if (opts.entranceEdge && opts.entranceCoord != null) {
      const c = opts.entranceCoord;
      const edge = opts.entranceEdge;
      if ((edge === "left" || edge === "right") && (c < 0 || c >= this._l))
        throw new Error("Entrance coord out of bounds");
      if ((edge === "top" || edge === "bottom") && (c < 0 || c >= this._w))
        throw new Error("Entrance coord out of bounds");
    }
    if (opts.exitEdge && opts.exitCoord != null) {
      const c = opts.exitCoord;
      const edge = opts.exitEdge;
      if ((edge === "left" || edge === "right") && (c < 0 || c >= this._l)) throw new Error("Exit coord out of bounds");
      if ((edge === "top" || edge === "bottom") && (c < 0 || c >= this._w)) throw new Error("Exit coord out of bounds");
    }

    const maze = this._make(size.x, size.z, opts);

    for (let gz = 0; gz < this._l; gz++) {
      for (let gx = 0; gx < this._w; gx++) {
        for (let gy = 0; gy < size.y; gy++) {
          const pos = { x: loc.x + gx, y: loc.y + gy, z: loc.z + gz };
          wdim.setBlockType(pos, maze[gz][gx] === 1 ? air : blockType);
        }
      }
    }

    if (this._entrance) {
      const { x: sx, y: sy } = this._entrance;
      for (let gy = 0; gy < size.y; gy++) wdim.setBlockType({ x: loc.x + sx, y: loc.y + gy, z: loc.z + sy }, air);
      if (sx === 0)
        for (let gy = 0; gy < size.y; gy++) wdim.setBlockType({ x: loc.x + sx - 1, y: loc.y + gy, z: loc.z + sy }, air);
      if (sx === this._w - 1)
        for (let gy = 0; gy < size.y; gy++) wdim.setBlockType({ x: loc.x + sx + 1, y: loc.y + gy, z: loc.z + sy }, air);
      if (sy === 0)
        for (let gy = 0; gy < size.y; gy++) wdim.setBlockType({ x: loc.x + sx, y: loc.y + gy, z: loc.z + sy - 1 }, air);
      if (sy === this._l - 1)
        for (let gy = 0; gy < size.y; gy++) wdim.setBlockType({ x: loc.x + sx, y: loc.y + gy, z: loc.z + sy + 1 }, air);
    }
    if (this._exit) {
      const { x: ex, y: ey } = this._exit;
      for (let gy = 0; gy < size.y; gy++) wdim.setBlockType({ x: loc.x + ex, y: loc.y + gy, z: loc.z + ey }, air);
      if (ex === 0)
        for (let gy = 0; gy < size.y; gy++) wdim.setBlockType({ x: loc.x + ex - 1, y: loc.y + gy, z: loc.z + ey }, air);
      if (ex === this._w - 1)
        for (let gy = 0; gy < size.y; gy++) wdim.setBlockType({ x: loc.x + ex + 1, y: loc.y + gy, z: loc.z + ey }, air);
      if (ey === 0)
        for (let gy = 0; gy < size.y; gy++) wdim.setBlockType({ x: loc.x + ex, y: loc.y + gy, z: loc.z + ey - 1 }, air);
      if (ey === this._l - 1)
        for (let gy = 0; gy < size.y; gy++) wdim.setBlockType({ x: loc.x + ex, y: loc.y + gy, z: loc.z + ey + 1 }, air);
    }
  }
}
