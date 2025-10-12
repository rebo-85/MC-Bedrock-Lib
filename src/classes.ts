import { EquipmentSlot, system, world, Entity, Player, ItemStack } from "@minecraft/server";
import {} from "./extension";
import {} from "./javascript";
import { tps } from "./constants";

export class ScriptEventManager {
  private _events: Map<string, any>;
  constructor() {
    this._events = new Map();
  }

  addEvent(eventName: string, callback: (e: any) => void) {
    const event = system.afterEvents.scriptEventReceive.subscribe((e: any) => {
      if (e.id === eventName) {
        callback(e);
      }
    });
    this._events.set(eventName, event);
  }
  removeEvent(eventName: string) {
    const event = this._events.get(eventName);
    if (event) {
      system.afterEvents.scriptEventReceive.unsubscribe(event);
      this._events.delete(eventName);
    }
  }
  clearEvents() {
    for (const [eventName, event] of this._events) {
      system.afterEvents.scriptEventReceive.unsubscribe(event);
    }
    this._events.clear();
  }
}

export class CommandResult {
  successCount: number;
  constructor() {
    this.successCount = 0;
  }
}
export class Fade {
  fadeIn: number;
  fadeHold: number;
  fadeOut: number;
  constructor(fadeIn: number, fadeHold: number, fadeOut: number) {
    this.fadeIn = fadeIn;
    this.fadeHold = fadeHold;
    this.fadeOut = fadeOut;
  }
}

export class Event {
  constructor() {}
}

export class AfterEvent extends Event {
  constructor() {
    super();
  }
}

export class BeforeEvent extends Event {
  cancel: boolean;
  constructor() {
    super();
    this.cancel = false;
  }
}
export class EntityAfterEvent extends AfterEvent {
  entity: Entity;
  constructor(entity: Entity) {
    super();
    this.entity = entity;
  }
}
export class EntityOnGroundAfterEvent extends EntityAfterEvent {
  constructor(entity: Entity) {
    super(entity);
  }
}
export class PlayerAfterEvent extends AfterEvent {
  player: Player;
  constructor(player: Player) {
    super();
    this.player = player;
  }
}
export class EntityJumpAfterEvent extends EntityAfterEvent {
  constructor(entity: Entity) {
    super(entity);
  }
}
export class EntitySneakAfterEvent extends EntityAfterEvent {
  constructor(entity: Entity) {
    super(entity);
  }
}
export class EntityUnsneakAfterEvent extends EntityAfterEvent {
  constructor(entity: Entity) {
    super(entity);
  }
}
export class PlayerOnAirJumpAfterEvent extends PlayerAfterEvent {
  constructor(player: Player) {
    super(player);
  }
}

export class PlayerOnLandAfterEvent extends PlayerAfterEvent {
  constructor(player: Player) {
    super(player);
  }
}

export class ItemAfterEvent extends PlayerAfterEvent {
  itemStack: ItemStack;
  constructor(player: Player, itemStack: ItemStack) {
    super(player);
    this.itemStack = itemStack;
  }
}
export class PlayerOnEquipAfterEvent extends ItemAfterEvent {
  equipmentSlot: EquipmentSlot;
  constructor(player: Player, itemStack: ItemStack, equipmentSlot: EquipmentSlot) {
    super(player, itemStack);
    this.equipmentSlot = equipmentSlot;
  }
}

export class PlayerOnUnequipAfterEvent extends PlayerOnEquipAfterEvent {
  constructor(player: Player, itemStack: ItemStack, equipmentSlot: EquipmentSlot) {
    super(player, itemStack, equipmentSlot);
  }
}

export class EventSignal {
  protected _events: Map<string, any>;
  protected _process: any;
  protected _isDisposed: boolean;
  constructor() {
    this._events = new Map();
    this._process = null;
    this._isDisposed = false;
  }
  subscribe(cb: (e: any) => void) {
    const process = () => {
      this._run(cb);

      if (!this._isDisposed) this._process = system.run(process);
    };
    this._process = system.run(process);
  }
  unsubscribe() {
    this._isDisposed = true;
    system.clearRun(this._process);
  }
  protected _run(cb: (e: any) => void): void {}
}

export class EntityEventSignal extends EventSignal {
  protected _entityIds: Set<string>;
  constructor() {
    super();
    this._entityIds = new Set();
  }
}

export class EntityItemEventSignal extends EntityEventSignal {
  protected _items: Set<string>;
  constructor() {
    super();
    this._items = new Set();
  }
}

export class EntityJumpAfterEventSignal extends EntityEventSignal {
  constructor() {
    super();
  }

  protected _run(cb: (e: EntityJumpAfterEvent) => void) {
    for (const entity of world.getEntities()) {
      if ((entity as any).isJumping && !(entity as any).isOnGround && !this._entityIds.has(entity.id)) {
        this._entityIds.add(entity.id);
        this._events.set(entity.id, new EntityJumpAfterEvent(entity));
        cb(this._events.get(entity.id));
      } else if ((entity as any).isOnGround && this._entityIds.has(entity.id)) {
        this._entityIds.delete(entity.id);
        this._events.delete(entity.id);
      }
    }
  }
}

export class EntityStartJumpingAfterEventSignal extends EntityEventSignal {
  constructor() {
    super();
  }

  protected _run(cb: (e: EntityJumpAfterEvent) => void) {
    for (const entity of world.getEntities()) {
      if ((entity as any).isJumping && !(entity as any).isOnGround && !this._entityIds.has(entity.id)) {
        this._entityIds.add(entity.id);
        this._events.set(entity.id, new EntityJumpAfterEvent(entity));
        cb(this._events.get(entity.id));
      } else if (!(entity as any).isJumping && this._entityIds.has(entity.id)) {
        this._entityIds.delete(entity.id);
        this._events.delete(entity.id);
      }
    }
  }
}

export class EntityStopJumpingAfterEventSignal extends EntityEventSignal {
  constructor() {
    super();
  }

  protected _run(cb: (e: EntityJumpAfterEvent) => void) {
    for (const entity of world.getEntities()) {
      if ((entity as any).isJumping && !(entity as any).isOnGround && !this._entityIds.has(entity.id)) {
        this._entityIds.add(entity.id);
      } else if (!(entity as any).isJumping && this._entityIds.has(entity.id)) {
        this._events.set(entity.id, new EntityJumpAfterEvent(entity));
        cb(this._events.get(entity.id));
        this._events.delete(entity.id);
        this._entityIds.delete(entity.id);
      }
    }
  }
}

export class EntitySneakAfterEventSignal extends EntityEventSignal {
  constructor() {
    super();
  }

  protected _run(cb: (e: EntitySneakAfterEvent) => void) {
    for (const entity of world.getEntities()) {
      if ((entity as any).isSneaking && !this._entityIds.has(entity.id)) {
        this._entityIds.add(entity.id);
        this._events.set(entity.id, new EntitySneakAfterEvent(entity));
        cb(this._events.get(entity.id));
      } else if (!(entity as any).isSneaking && this._entityIds.has(entity.id)) {
        this._entityIds.delete(entity.id);
        this._events.delete(entity.id);
      }
    }
  }
}

export class EntityUnsneakAfterEventSignal extends EntityEventSignal {
  private _sneaking: Set<string>;
  constructor() {
    super();
    this._sneaking = new Set();
  }

  protected _run(cb: (e: EntityUnsneakAfterEvent) => void) {
    for (const entity of world.getEntities()) {
      if ((entity as any).isSneaking) {
        this._sneaking.add(entity.id);
        if (this._entityIds.has(entity.id)) {
          this._events.delete(entity.id);
          this._entityIds.delete(entity.id);
        }
      } else if (!(entity as any).isSneaking && this._sneaking.has(entity.id) && !this._events.has(entity.id)) {
        this._entityIds.add(entity.id);
        this._events.set(entity.id, new EntityUnsneakAfterEvent(entity));
        cb(this._events.get(entity.id));
        this._sneaking.delete(entity.id);
      }
    }
  }
}

export class PlayerOnAirJumpAfterEventSignal extends EntityEventSignal {
  private _onAir: Set<string>;
  constructor() {
    super();
    this._onAir = new Set();
  }

  protected _run(cb: (e: PlayerOnAirJumpAfterEvent) => void) {
    for (const player of world.players) {
      if (!(player as any).isJumping && !(player as any).isOnGround) {
        if (this._onAir.has(player.id)) {
          this._entityIds.add(player.id);
        } else this._onAir.add(player.id);
      } else if (
        (player as any).isJumping &&
        !(player as any).isOnGround &&
        this._entityIds.has(player.id) &&
        !this._events.has(player.id)
      ) {
        this._events.set(player.id, new PlayerOnAirJumpAfterEvent(player));
        cb(this._events.get(player.id));
      } else {
        this._events.delete(player.id);
        this._entityIds.delete(player.id);
        this._onAir.delete(player.id);
      }
    }
  }
}

export class PlayerOnEquipAfterEventSignal extends EntityEventSignal {
  private _previousEquipments: Map<string, Map<EquipmentSlot, ItemStack>>;
  constructor() {
    super();
    this._previousEquipments = new Map();
  }

  protected _run(cb: (e: PlayerOnEquipAfterEvent) => void) {
    for (const player of world.players) {
      let slots = Object.values(EquipmentSlot) as EquipmentSlot[];
      const currentEquipments = new Map<EquipmentSlot, ItemStack>();
      for (const slot of slots) {
        const item = player.getEquipment(slot);
        if (item) currentEquipments.set(slot, item);
      }

      const previousEquipments = this._previousEquipments.get(player.id) || currentEquipments;
      for (const [slot, itemStack] of currentEquipments) {
        const prevItemStack = previousEquipments.get(slot);
        if (!itemStack.compare(prevItemStack) && !this._entityIds.has(player.id)) {
          this._entityIds.add(player.id);
          this._events.set(player.id, new PlayerOnEquipAfterEvent(player, itemStack, slot));
          cb(this._events.get(player.id));
        } else if (itemStack.compare(prevItemStack) && this._entityIds.has(player.id)) {
          this._events.delete(player.id);
          this._entityIds.delete(player.id);
        }
      }

      this._previousEquipments.set(player.id, currentEquipments);
    }
  }
}

export class PlayerOnUnequipAfterEventSignal extends EntityEventSignal {
  private _previousEquipments: Map<string, Map<EquipmentSlot, ItemStack>>;
  constructor() {
    super();
    this._previousEquipments = new Map();
  }

  protected _run(cb: (e: PlayerOnUnequipAfterEvent) => void) {
    for (const player of world.players) {
      let slots = Object.values(EquipmentSlot) as EquipmentSlot[];
      const currentEquipments = new Map<EquipmentSlot, ItemStack>();
      for (const slot of slots) {
        const item = player.getEquipment(slot);
        if (item) currentEquipments.set(slot, item);
      }

      const previousEquipments = this._previousEquipments.get(player.id) || currentEquipments;
      for (const [slot, itemStack] of currentEquipments) {
        const prevItemStack = previousEquipments.get(slot);
        if (prevItemStack) {
          if (!prevItemStack.compare(itemStack) && !this._entityIds.has(player.id)) {
            this._entityIds.add(player.id);
            this._events.set(player.id, new PlayerOnUnequipAfterEvent(player, prevItemStack, slot));
            cb(this._events.get(player.id));
          } else if (prevItemStack.compare(itemStack) && this._entityIds.has(player.id)) {
            this._events.delete(player.id);
            this._entityIds.delete(player.id);
          }
        }
      }

      this._previousEquipments.set(player.id, currentEquipments);
    }
  }
}

export class PlayerOnLandAfterEventSignal extends EntityEventSignal {
  constructor() {
    super();
  }

  protected _run(cb: (e: PlayerOnLandAfterEvent) => void) {
    for (const player of world.players) {
      if (!(player as any).isOnGround && !this._entityIds.has(player.id)) {
        this._entityIds.add(player.id);
      } else if ((player as any).isOnGround && this._entityIds.has(player.id)) {
        this._events.set(player.id, new PlayerOnLandAfterEvent(player));
        cb(this._events.get(player.id));
        this._events.delete(player.id);
        this._entityIds.delete(player.id);
      }
    }
  }
}

export class Scene {
  posStart: any;
  posEnd: any;
  rotStart: any;
  rotEnd: any;
  duration: number;
  fade: Fade;
  ease_type: string;
  constructor(
    posStart: any,
    posEnd: any,
    rotStart: any,
    rotEnd: any,
    duration: number,
    fade: Fade,
    ease_type: string = "linear"
  ) {
    this.posStart = posStart;
    this.posEnd = posEnd;
    this.rotStart = rotStart;
    this.rotEnd = rotEnd;
    this.duration = duration;
    this.fade = fade;
    this.ease_type = ease_type;
  }
}
export class Cutscene {
  target: any;
  scenes: Scene[];
  timedCommands: TimedCommand[];
  is_spectator: boolean;
  is_invisible: boolean;
  constructor(
    target: any,
    scenes: Scene[],
    timedCommands: TimedCommand[] = [],
    is_spectator: boolean = true,
    is_invisible: boolean = true
  ) {
    this.target = target;
    this.scenes = scenes;
    this.timedCommands = timedCommands;
    this.is_spectator = is_spectator;
    this.is_invisible = is_invisible;
  }
  play() {
    const entities = world.getEntities(this.target);
    for (const entity of entities) {
      (entity as any).commandRun(`inputpermission set @s camera disabled`, `inputpermission set @s movement disabled`);
      (entity as any).commandRun("hud @s hide all");
      const checkpoint = { pos: (entity as any).location, rot: (entity as any).rotation };

      let originalGamemode: string | null = null;
      if (this.is_spectator) {
        const currentGamemode = (entity as any).gamemode?.toString?.() || (entity as any).gamemode || "adventure";
        originalGamemode = currentGamemode === "spectator" ? "adventure" : currentGamemode;
        (entity as any).commandRun(`gamemode spectator @s`);
      }
      if (this.is_invisible) (entity as any).commandRun(`effect @s invisibility infinite 0 true`);

      this.timedCommands.forEach((timedCommand) => {
        (entity as any).timedCommand(timedCommand.time, timedCommand.commands);
      });

      let timeline = 0;
      this.scenes.forEach((scene, i) => {
        const fade = scene.fade;
        let fadeInTime = 0;
        if (fade) {
          system.runTimeout(() => {
            (entity as any).camera.fade({
              fadeInTime: fade.fadeIn,
              holdTime: fade.fadeHold,
              fadeOutTime: fade.fadeOut,
            });
          }, timeline);
          fadeInTime = fade.fadeIn;
        }

        const endTime = scene.duration * tps + fadeInTime * tps;
        system.runTimeout(() => {
          system.runTimeout(() => {
            (entity as any).teleport(scene.posStart, { facingLocation: scene.rotStart });
          }, fadeInTime * tps);

          system.runTimeout(() => {
            (entity as any).commandRun(
              `camera @s set minecraft:free pos ${scene.posStart.toString()} facing ${scene.rotStart.toString()}`,
              `camera @s set minecraft:free ease ${scene.duration} ${
                scene.ease_type
              } pos ${scene.posEnd.toString()} facing ${scene.rotEnd.toString()}`
            );
          }, fadeInTime * tps);

          system.runTimeout(() => {
            (entity as any).commandRun(`camera @s clear`);
            (entity as any).commandRun("hud @s reset all");
            if (i === this.scenes.length - 1) {
              if (this.is_spectator) {
                if (originalGamemode) {
                  (entity as any).commandRun(`gamemode ${originalGamemode} @s`);
                } else {
                  (entity as any).commandRun(`gamemode adventure @s`);
                }
              }
              if (this.is_invisible) (entity as any).commandRun(`effect @s invisibility 0`);

              (entity as any).commandRun(
                `inputpermission set @s camera enabled`,
                `inputpermission set @s movement enabled`
              );

              (entity as any).teleport(checkpoint.pos, { rotation: checkpoint.rot });
            }
          }, endTime);
        }, timeline);

        timeline += endTime;
      });
    }
  }
}

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

export class Vector2 {
  x: number;
  private _y: number;
  z: number;
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

export class TimedCommand {
  time: number;
  timeTick: number;
  commands: string[];
  constructor(time: number, commands: string[]) {
    this.time = time;
    this.timeTick = time * tps;
    this.commands = commands;
  }
}

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
