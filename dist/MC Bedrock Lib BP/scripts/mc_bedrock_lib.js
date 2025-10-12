// src/classes.ts
import { EquipmentSlot, system as system2, world } from "@minecraft/server";

// src/constants.ts
import {
  world as w,
  system as s,
  TicksPerSecond
} from "@minecraft/server";
var namespace = "eternal";
var ns = namespace;
var tps = TicksPerSecond;
var system = s;
var afterEvents = w.afterEvents;
var beforeEvents = w.beforeEvents;
var scriptEvent = s.afterEvents.scriptEventReceive;

// src/classes.ts
var ScriptEventManager = class {
  constructor() {
    this._events = /* @__PURE__ */ new Map();
  }
  addEvent(eventName, callback) {
    const event = system2.afterEvents.scriptEventReceive.subscribe((e) => {
      if (e.id === eventName) {
        callback(e);
      }
    });
    this._events.set(eventName, event);
  }
  removeEvent(eventName) {
    const event = this._events.get(eventName);
    if (event) {
      system2.afterEvents.scriptEventReceive.unsubscribe(event);
      this._events.delete(eventName);
    }
  }
  clearEvents() {
    for (const [eventName, event] of this._events) {
      system2.afterEvents.scriptEventReceive.unsubscribe(event);
    }
    this._events.clear();
  }
};
var CommandResult = class {
  constructor() {
    this.successCount = 0;
  }
};
var Fade = class {
  constructor(fadeIn, fadeHold, fadeOut) {
    this.fadeIn = fadeIn;
    this.fadeHold = fadeHold;
    this.fadeOut = fadeOut;
  }
};
var Event = class {
  constructor() {
  }
};
var AfterEvent = class extends Event {
  constructor() {
    super();
  }
};
var BeforeEvent = class extends Event {
  constructor() {
    super();
    this.cancel = false;
  }
};
var EntityAfterEvent = class extends AfterEvent {
  constructor(entity) {
    super();
    this.entity = entity;
  }
};
var EntityOnGroundAfterEvent = class extends EntityAfterEvent {
  constructor(entity) {
    super(entity);
  }
};
var PlayerAfterEvent = class extends AfterEvent {
  constructor(player) {
    super();
    this.player = player;
  }
};
var EntityJumpAfterEvent = class extends EntityAfterEvent {
  constructor(entity) {
    super(entity);
  }
};
var EntitySneakAfterEvent = class extends EntityAfterEvent {
  constructor(entity) {
    super(entity);
  }
};
var EntityUnsneakAfterEvent = class extends EntityAfterEvent {
  constructor(entity) {
    super(entity);
  }
};
var PlayerOnAirJumpAfterEvent = class extends PlayerAfterEvent {
  constructor(player) {
    super(player);
  }
};
var PlayerOnLandAfterEvent = class extends PlayerAfterEvent {
  constructor(player) {
    super(player);
  }
};
var ItemAfterEvent = class extends PlayerAfterEvent {
  constructor(player, itemStack) {
    super(player);
    this.itemStack = itemStack;
  }
};
var PlayerOnEquipAfterEvent = class extends ItemAfterEvent {
  constructor(player, itemStack, equipmentSlot) {
    super(player, itemStack);
    this.equipmentSlot = equipmentSlot;
  }
};
var PlayerOnUnequipAfterEvent = class extends PlayerOnEquipAfterEvent {
  constructor(player, itemStack, equipmentSlot) {
    super(player, itemStack, equipmentSlot);
  }
};
var EventSignal = class {
  constructor() {
    this._events = /* @__PURE__ */ new Map();
    this._process = null;
    this._isDisposed = false;
  }
  subscribe(cb) {
    const process = () => {
      this._run(cb);
      if (!this._isDisposed) this._process = system2.run(process);
    };
    this._process = system2.run(process);
  }
  unsubscribe() {
    this._isDisposed = true;
    system2.clearRun(this._process);
  }
  _run(cb) {
  }
};
var EntityEventSignal = class extends EventSignal {
  constructor() {
    super();
    this._entityIds = /* @__PURE__ */ new Set();
  }
};
var EntityItemEventSignal = class extends EntityEventSignal {
  constructor() {
    super();
    this._items = /* @__PURE__ */ new Set();
  }
};
var EntityJumpAfterEventSignal = class extends EntityEventSignal {
  constructor() {
    super();
  }
  _run(cb) {
    for (const entity of world.getEntities()) {
      if (entity.isJumping && !entity.isOnGround && !this._entityIds.has(entity.id)) {
        this._entityIds.add(entity.id);
        this._events.set(entity.id, new EntityJumpAfterEvent(entity));
        cb(this._events.get(entity.id));
      } else if (entity.isOnGround && this._entityIds.has(entity.id)) {
        this._entityIds.delete(entity.id);
        this._events.delete(entity.id);
      }
    }
  }
};
var EntityStartJumpingAfterEventSignal = class extends EntityEventSignal {
  constructor() {
    super();
  }
  _run(cb) {
    for (const entity of world.getEntities()) {
      if (entity.isJumping && !entity.isOnGround && !this._entityIds.has(entity.id)) {
        this._entityIds.add(entity.id);
        this._events.set(entity.id, new EntityJumpAfterEvent(entity));
        cb(this._events.get(entity.id));
      } else if (!entity.isJumping && this._entityIds.has(entity.id)) {
        this._entityIds.delete(entity.id);
        this._events.delete(entity.id);
      }
    }
  }
};
var EntityStopJumpingAfterEventSignal = class extends EntityEventSignal {
  constructor() {
    super();
  }
  _run(cb) {
    for (const entity of world.getEntities()) {
      if (entity.isJumping && !entity.isOnGround && !this._entityIds.has(entity.id)) {
        this._entityIds.add(entity.id);
      } else if (!entity.isJumping && this._entityIds.has(entity.id)) {
        this._events.set(entity.id, new EntityJumpAfterEvent(entity));
        cb(this._events.get(entity.id));
        this._events.delete(entity.id);
        this._entityIds.delete(entity.id);
      }
    }
  }
};
var EntitySneakAfterEventSignal = class extends EntityEventSignal {
  constructor() {
    super();
  }
  _run(cb) {
    for (const entity of world.getEntities()) {
      if (entity.isSneaking && !this._entityIds.has(entity.id)) {
        this._entityIds.add(entity.id);
        this._events.set(entity.id, new EntitySneakAfterEvent(entity));
        cb(this._events.get(entity.id));
      } else if (!entity.isSneaking && this._entityIds.has(entity.id)) {
        this._entityIds.delete(entity.id);
        this._events.delete(entity.id);
      }
    }
  }
};
var EntityUnsneakAfterEventSignal = class extends EntityEventSignal {
  constructor() {
    super();
    this._sneaking = /* @__PURE__ */ new Set();
  }
  _run(cb) {
    for (const entity of world.getEntities()) {
      if (entity.isSneaking) {
        this._sneaking.add(entity.id);
        if (this._entityIds.has(entity.id)) {
          this._events.delete(entity.id);
          this._entityIds.delete(entity.id);
        }
      } else if (!entity.isSneaking && this._sneaking.has(entity.id) && !this._events.has(entity.id)) {
        this._entityIds.add(entity.id);
        this._events.set(entity.id, new EntityUnsneakAfterEvent(entity));
        cb(this._events.get(entity.id));
        this._sneaking.delete(entity.id);
      }
    }
  }
};
var PlayerOnAirJumpAfterEventSignal = class extends EntityEventSignal {
  constructor() {
    super();
    this._onAir = /* @__PURE__ */ new Set();
  }
  _run(cb) {
    for (const player of world.players) {
      if (!player.isJumping && !player.isOnGround) {
        if (this._onAir.has(player.id)) {
          this._entityIds.add(player.id);
        } else this._onAir.add(player.id);
      } else if (player.isJumping && !player.isOnGround && this._entityIds.has(player.id) && !this._events.has(player.id)) {
        this._events.set(player.id, new PlayerOnAirJumpAfterEvent(player));
        cb(this._events.get(player.id));
      } else {
        this._events.delete(player.id);
        this._entityIds.delete(player.id);
        this._onAir.delete(player.id);
      }
    }
  }
};
var PlayerOnEquipAfterEventSignal = class extends EntityEventSignal {
  constructor() {
    super();
    this._previousEquipments = /* @__PURE__ */ new Map();
  }
  _run(cb) {
    for (const player of world.players) {
      let slots = Object.values(EquipmentSlot);
      const currentEquipments = /* @__PURE__ */ new Map();
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
};
var PlayerOnUnequipAfterEventSignal = class extends EntityEventSignal {
  constructor() {
    super();
    this._previousEquipments = /* @__PURE__ */ new Map();
  }
  _run(cb) {
    for (const player of world.players) {
      let slots = Object.values(EquipmentSlot);
      const currentEquipments = /* @__PURE__ */ new Map();
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
};
var PlayerOnLandAfterEventSignal = class extends EntityEventSignal {
  constructor() {
    super();
  }
  _run(cb) {
    for (const player of world.players) {
      if (!player.isOnGround && !this._entityIds.has(player.id)) {
        this._entityIds.add(player.id);
      } else if (player.isOnGround && this._entityIds.has(player.id)) {
        this._events.set(player.id, new PlayerOnLandAfterEvent(player));
        cb(this._events.get(player.id));
        this._events.delete(player.id);
        this._entityIds.delete(player.id);
      }
    }
  }
};
var Scene = class {
  constructor(posStart, posEnd, rotStart, rotEnd, duration, fade, ease_type = "linear") {
    this.posStart = posStart;
    this.posEnd = posEnd;
    this.rotStart = rotStart;
    this.rotEnd = rotEnd;
    this.duration = duration;
    this.fade = fade;
    this.ease_type = ease_type;
  }
};
var Cutscene = class {
  constructor(target, scenes, timedCommands = [], is_spectator = true, is_invisible = true) {
    this.target = target;
    this.scenes = scenes;
    this.timedCommands = timedCommands;
    this.is_spectator = is_spectator;
    this.is_invisible = is_invisible;
  }
  play() {
    const entities = world.getEntities(this.target);
    for (const entity of entities) {
      entity.commandRun(`inputpermission set @s camera disabled`, `inputpermission set @s movement disabled`);
      entity.commandRun("hud @s hide all");
      const checkpoint = { pos: entity.location, rot: entity.rotation };
      let originalGamemode = null;
      if (this.is_spectator) {
        const currentGamemode = entity.gamemode?.toString?.() || entity.gamemode || "adventure";
        originalGamemode = currentGamemode === "spectator" ? "adventure" : currentGamemode;
        entity.commandRun(`gamemode spectator @s`);
      }
      if (this.is_invisible) entity.commandRun(`effect @s invisibility infinite 0 true`);
      this.timedCommands.forEach((timedCommand) => {
        entity.timedCommand(timedCommand.time, timedCommand.commands);
      });
      let timeline = 0;
      this.scenes.forEach((scene, i) => {
        const fade = scene.fade;
        let fadeInTime = 0;
        if (fade) {
          system2.runTimeout(() => {
            entity.camera.fade({
              fadeInTime: fade.fadeIn,
              holdTime: fade.fadeHold,
              fadeOutTime: fade.fadeOut
            });
          }, timeline);
          fadeInTime = fade.fadeIn;
        }
        const endTime = scene.duration * tps + fadeInTime * tps;
        system2.runTimeout(() => {
          system2.runTimeout(() => {
            entity.teleport(scene.posStart, { facingLocation: scene.rotStart });
          }, fadeInTime * tps);
          system2.runTimeout(() => {
            entity.commandRun(
              `camera @s set minecraft:free pos ${scene.posStart.toString()} facing ${scene.rotStart.toString()}`,
              `camera @s set minecraft:free ease ${scene.duration} ${scene.ease_type} pos ${scene.posEnd.toString()} facing ${scene.rotEnd.toString()}`
            );
          }, fadeInTime * tps);
          system2.runTimeout(() => {
            entity.commandRun(`camera @s clear`);
            entity.commandRun("hud @s reset all");
            if (i === this.scenes.length - 1) {
              if (this.is_spectator) {
                if (originalGamemode) {
                  entity.commandRun(`gamemode ${originalGamemode} @s`);
                } else {
                  entity.commandRun(`gamemode adventure @s`);
                }
              }
              if (this.is_invisible) entity.commandRun(`effect @s invisibility 0`);
              entity.commandRun(
                `inputpermission set @s camera enabled`,
                `inputpermission set @s movement enabled`
              );
              entity.teleport(checkpoint.pos, { rotation: checkpoint.rot });
            }
          }, endTime);
        }, timeline);
        timeline += endTime;
      });
    }
  }
};
var Run = class {
  constructor() {
    this._process = null;
  }
  dispose() {
    system2.clearRun(this._process);
  }
};
var RunInterval = class extends Run {
  constructor(cb, interval = 1) {
    super();
    this._process = system2.runInterval(cb, interval);
  }
};
var RunTimeOut = class extends Run {
  constructor(cb, timeOut = 1) {
    super();
    this._process = system2.runTimeout(cb, timeOut);
  }
};
var Vector2 = class _Vector2 {
  constructor(x, y) {
    if (typeof x === "object" && x !== null && "x" in x && "y" in x) {
      this.x = x.x;
      this._y = x.y;
      this.z = x.z !== void 0 ? x.z : x.y;
    } else {
      this.x = x;
      this._y = y;
      this.z = y;
    }
  }
  set y(value) {
    this._y = value;
    this.z = value;
  }
  get y() {
    return this._y;
  }
  toString() {
    return `${this.x} ${this.y}`;
  }
  offset(x, y) {
    if (typeof x === "object" && x !== null && "x" in x && "y" in x) {
      return new _Vector2(this.x + x.x, this.y + x.y);
    }
    return new _Vector2(this.x + x, this.y + y);
  }
  check(x, y) {
    return this.x === x && this.y === y;
  }
  normalized() {
    const length = Math.sqrt(this.x * this.x + this.y * this.y);
    if (length === 0) return new _Vector2(0, 0);
    return new _Vector2(this.x / length, this.y / length);
  }
};
var Vector3 = class _Vector3 extends Vector2 {
  constructor(x, y, z) {
    if (typeof x === "string") {
      const [sx, sy, sz] = x.split(" ").map(Number);
      super(sx, sy);
      this.z = sz;
    } else if (typeof x === "object" && x !== null && "x" in x && "y" in x) {
      super(x.x, x.y);
      this.z = x.z !== void 0 ? x.z : x.y;
    } else {
      super(x, y);
      this.z = z;
    }
  }
  offset(x, y, z) {
    if (typeof x === "object" && x !== null && "x" in x && "y" in x) {
      if ("z" in x) {
        return new _Vector3(this.x + x.x, this.y + x.y, this.z + (x.z !== void 0 ? x.z : x.y));
      }
      return new Vector2(this.x + x.x, this.y + x.y);
    }
    if (typeof z !== "undefined") {
      return new _Vector3(this.x + x, this.y + y, this.z + z);
    }
    return new Vector2(this.x + x, this.y + y);
  }
  check(x, y, z) {
    if (typeof z === "undefined") {
      return this.x === x && this.y === y;
    }
    return this.x === x && this.y === y && this.z === z;
  }
  toVector2() {
    return new Vector2(this.x, this.y);
  }
  toString() {
    return `${this.x} ${this.y} ${this.z}`;
  }
  belowCenter() {
    const x = this._roundToNearestHalf(this.x);
    const y = this.y;
    const z = this._roundToNearestHalf(this.z);
    return new _Vector3(x, y, z);
  }
  center() {
    const x = this._roundToNearestHalf(this.x);
    const y = this._roundToNearestHalf(this.y);
    const z = this._roundToNearestHalf(this.z);
    return new _Vector3(x, y, z);
  }
  sizeCenter() {
    const x = Math.floor(this.x / 2);
    const y = Math.floor(this.z / 2);
    const z = Math.floor(this.z / 2);
    return new _Vector3(x, y, z);
  }
  sizeBelowCenter() {
    const x = Math.floor(this.x / 2);
    const y = 0;
    const z = Math.floor(this.z / 2);
    return new _Vector3(x, y, z);
  }
  _roundToNearestHalf(value) {
    return Math.round(value * 2) / 2;
  }
  normalized() {
    const len = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    if (len === 0) return new _Vector3(0, 0, 0);
    return new _Vector3(this.x / len, this.y / len, this.z / len);
  }
  toVolume(vec) {
    return new _Vector3(Math.abs(this.x - vec.x), Math.abs(this.y - vec.y), Math.abs(this.z - vec.z));
  }
};
var TimedCommand = class {
  constructor(time, commands) {
    this.time = time;
    this.timeTick = time * tps;
    this.commands = commands;
  }
};
var CountDownTimer = class {
  constructor(durationInSeconds = 10, onEnd = () => {
  }, onUpdate = () => {
  }) {
    this.minutes = 0;
    this.seconds = "00";
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
};

// src/extension.ts
import {
  Dimension as Dimension2,
  Entity as Entity3,
  BlockPermutation,
  Player as Player2,
  WorldAfterEvents as WorldAfterEvents2,
  EntityComponentTypes,
  Container,
  ItemStack as ItemStack2,
  World,
  Block,
  ItemComponentTypes,
  ScriptEventCommandMessageAfterEvent,
  ScriptEventSource,
  EquipmentSlot as EquipmentSlot2,
  GameMode,
  DimensionTypes,
  BlockComponentTypes,
  BlockTypes,
  WeatherType as WeatherType2,
  world as world4,
  InputPermissionCategory
} from "@minecraft/server";

// src/utils.ts
import { Entity as Entity2, Dimension, world as world2 } from "@minecraft/server";
var entityRunCommand = Entity2.prototype.runCommand;
var dimensionRunCommand = Dimension.prototype.runCommand;
function defineProperties(target, properties) {
  for (const [property, descriptor] of Object.entries(properties)) {
    Object.defineProperty(target, property, { ...descriptor, configurable: true });
  }
}
function getRandomElement(array) {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}
function generateUUIDv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === "x" ? r : r & 3 | 8;
    return v.toString(16);
  });
}
function idTranslate(id) {
  return id.split(":")[1].split("_").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}
function runCommand(source, ...commands) {
  const result = new CommandResult();
  const flattenedCommands = commands.flat();
  flattenedCommands.forEach((command) => {
    if (source === Entity2) {
      const cr = entityRunCommand.call(this, command);
      if (cr.successCount > 0) {
        result.successCount++;
      }
    } else if (source === Dimension) {
      const cr = dimensionRunCommand.call(this, command);
      if (cr.successCount > 0) {
        result.successCount++;
      }
    }
  });
  return result;
}
function display(value, type = "chat") {
  value = JSON.stringify(value, null, 0);
  switch (type) {
    case "chat":
      world2.sendMessage(`${value}`);
      break;
    case "error":
      console.error(value);
      break;
    case "log":
      console.log(value);
      break;
    default:
      world2.sendMessage(`${value}`);
      break;
  }
}
function arraysEqual(arr1, arr2) {
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
function objectsEqual(obj1, obj2) {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  if (keys1.length !== keys2.length) return false;
  for (const key of keys1) {
    if (obj1[key] !== obj2[key]) return false;
  }
  return true;
}

// src/events.ts
import { world as world3 } from "@minecraft/server";
var playersUsingItem = /* @__PURE__ */ new Set();
world3.afterEvents.itemUse.subscribe((e) => {
  const { source: player } = e;
  playersUsingItem.add(player.id);
});
world3.afterEvents.itemStopUse.subscribe((e) => {
  const { source: player } = e;
  if (playersUsingItem.has(player.id)) playersUsingItem.delete(player.id);
});
var weatherTracker = /* @__PURE__ */ new Map();
world3.beforeEvents.weatherChange.subscribe((e) => {
  const { previousWeather, duration } = e;
  if (duration == world3.getTimeOfDay()) {
    weatherTracker.set(duration, previousWeather);
    e.cancel = true;
  }
});

// src/extension.ts
defineProperties(WorldAfterEvents2.prototype, {
  entityJump: {
    get: function() {
      return new EntityJumpAfterEventSignal();
    }
  },
  entityStartJumping: {
    get: function() {
      return new EntityStartJumpingAfterEventSignal();
    }
  },
  entityStopJumping: {
    get: function() {
      return new EntityStopJumpingAfterEventSignal();
    }
  },
  entitySneak: {
    get: function() {
      return new EntitySneakAfterEventSignal();
    }
  },
  entityUnsneak: {
    get: function() {
      return new EntityUnsneakAfterEventSignal();
    }
  },
  playerOnAirJump: {
    get: function() {
      return new PlayerOnAirJumpAfterEventSignal();
    }
  },
  playerOnLand: {
    get: function() {
      return new PlayerOnLandAfterEventSignal();
    }
  },
  playerOnUnequip: {
    get: function() {
      return new PlayerOnUnequipAfterEventSignal();
    }
  },
  playerOnEquip: {
    get: function() {
      return new PlayerOnEquipAfterEventSignal();
    }
  }
});
defineProperties(World.prototype, {
  getEntities: {
    value: function(selector) {
      const entities = /* @__PURE__ */ new Set();
      const dimTypes = DimensionTypes.getAll();
      dimTypes.forEach((type) => {
        const dim = this.getDimension(type.typeId);
        dim?.getEntities(selector).forEach((e) => entities.add(e));
      });
      return Array.from(entities);
    }
  },
  players: {
    get: function() {
      return this.getAllPlayers();
    },
    enumerable: true
  },
  end: {
    get: function() {
      return this.getDimension("minecraft:the_end");
    },
    enumerable: true
  },
  overworld: {
    get: function() {
      return this.getDimension("minecraft:overworld");
    },
    enumerable: true
  },
  nether: {
    get: function() {
      return this.getDimension("minecraft:nether");
    },
    enumerable: true
  }
});
defineProperties(ItemStack2.prototype, {
  isVanillaBlock: {
    get: function() {
      return !!BlockTypes.get(this.typeId);
    }
  },
  compare: {
    value: function(itemStack) {
      if (itemStack === null || itemStack === void 0) return false;
      if (this.amount === itemStack.amount && this.isStackable === itemStack.isStackable && this.keepOnDeath === itemStack.keepOnDeath && this.lockMode === itemStack.lockMode && this.maxAmount === itemStack.maxAmount && this.nameTag === itemStack.nameTag && this.type === itemStack.type && this.typeId === itemStack.typeId && arraysEqual(this.getCanDestroy(), itemStack.getCanDestroy()) && arraysEqual(this.getComponents(), itemStack.getComponents()) && arraysEqual(this.getLore(), itemStack.getLore()) && arraysEqual(this.getTags(), itemStack.getTags()) && this.getDynamicPropertyTotalByteCount() === itemStack.getDynamicPropertyTotalByteCount()) {
        return true;
      }
      return false;
    }
  },
  enchantableComponent: {
    get: function() {
      return this.getComponent(ItemComponentTypes.Enchantable);
    },
    enumerable: true
  },
  enchantmentSlots: {
    get: function() {
      return this.enchantableComponent?.slots;
    },
    enumerable: true
  },
  addEnchantment: {
    value: function(...enchantments) {
      const enchantmentList = enchantments.flat();
      enchantmentList.forEach((ench) => this.enchantableComponent?.addEnchantments(ench));
    }
  },
  getEnchantment: {
    value: function(enchantmentType) {
      return this.enchantableComponent?.getEnchantment(enchantmentType);
    }
  },
  hasEnchantment: {
    value: function(enchantmentType) {
      return !!this.enchantableComponent?.hasEnchantment(enchantmentType);
    }
  },
  removeEnchantment: {
    value: function(enchantmentType) {
      return this.enchantableComponent?.removeEnchantment(enchantmentType);
    }
  },
  removeAllEnchantments: {
    value: function() {
      return this.enchantableComponent?.removeAllEnchantments();
    }
  },
  durabilityComponent: {
    get: function() {
      return this.getComponent(ItemComponentTypes.Durability);
    },
    enumerable: true
  },
  durability: {
    get: function() {
      return this.durabilityComponent?.maxDurability ?? 0;
    },
    set: function(dur) {
      const dc = this.durabilityComponent;
      if (!dc) return;
      let dmg = (dc.maxDurability ?? 0) - dur;
      if (dmg < 0) {
        dmg = 0;
      } else if (dmg > (dc.maxDurability ?? 0)) {
        dmg = dc.maxDurability ?? 0;
      }
      dc.damage = dmg;
    },
    enumerable: true
  }
});
defineProperties(Block.prototype, {
  getAdjacentBlocks: {
    value: function() {
      const ofs = [
        [-1, -1, -1],
        [-1, -1, 0],
        [-1, -1, 1],
        [-1, 0, -1],
        [-1, 0, 0],
        [-1, 0, 1],
        [-1, 1, -1],
        [-1, 1, 0],
        [-1, 1, 1],
        [0, -1, -1],
        [0, -1, 0],
        [0, -1, 1],
        [0, 0, -1],
        [0, 0, 0],
        [0, 0, 1],
        [0, 1, -1],
        [0, 1, 0],
        [0, 1, 1],
        [1, -1, -1],
        [1, -1, 0],
        [1, -1, 1],
        [1, 0, -1],
        [1, 0, 0],
        [1, 0, 1],
        [1, 1, -1],
        [1, 1, 0],
        [1, 1, 1]
      ];
      return ofs.map(([dx, dy, dz]) => this.offset(new Vector3(dx, dy, dz))).filter((b) => b !== void 0);
    }
  },
  getState: {
    value: function(state) {
      return this.permutation.getState(state);
    }
  },
  setState: {
    value: function(state, value) {
      const perm = this.permutation.withState(state, value);
      this.setPermutation(perm);
    }
  },
  inventoryComponent: {
    get: function() {
      return this.getComponent(BlockComponentTypes.Inventory);
    },
    enumerable: true
  },
  inventory: {
    get: function() {
      return this.inventoryComponent?.container;
    },
    enumerable: true
  },
  getItems: {
    value: function(typeId) {
      const items = /* @__PURE__ */ new Map();
      const inv = this.inventory;
      if (!inv) return items;
      for (let i = 0; i < inv.size; i++) {
        const itm = inv.getItem(i);
        if (itm && (!typeId || itm.typeId === typeId)) {
          items.set(i, itm);
        }
      }
      return items;
    }
  }
});
defineProperties(Player2.prototype, {
  isMortal: {
    get: function() {
      return this.gamemode === GameMode.Survival || this.gamemode === GameMode.Adventure;
    },
    enumerable: true
  },
  clearItem: {
    value: function(typeId, maxCount = "", data = -1) {
      this.runCommand(`clear @s ${typeId} ${data} ${maxCount}`);
    }
  },
  isUsingItem: {
    get: function() {
      return playersUsingItem.has(this.id);
    },
    enumerable: true
  },
  getItems: {
    value: function(typeId) {
      const eMap = /* @__PURE__ */ new Map();
      const slots = Object.values(EquipmentSlot2).filter((value) => typeof value === "string");
      for (const slot of slots) {
        const item = this.getEquipment(slot);
        if (item) {
          if (typeId) {
            if (item.typeId === typeId) eMap.set(slot, item);
          } else eMap.set(slot, item);
        }
      }
      const iMap = /* @__PURE__ */ new Map();
      const inv = this.inventory;
      for (let i = 0; i < inv.size; i++) {
        const item = inv.getItem(i);
        if (item) {
          if (typeId) {
            if (item.typeId === typeId) iMap.set(i, item);
          } else iMap.set(i, item);
        }
      }
      return { equipments: eMap, inventory: iMap };
    }
  },
  damageItem: {
    value: function(slot, damage = 1) {
      const eqSlot = this.equippableComponent?.getEquipmentSlot(slot);
      const item = eqSlot?.getItem();
      if (!item) return;
      const unbreaking = item.getEnchantment({ id: "unbreakind" });
      const unbreakingLevel = unbreaking ? unbreaking.level : 0;
      const unbreakingChance = 1 / (unbreakingLevel + 1);
      if (Math.random() < unbreakingChance && this.gamemode !== GameMode.Creative) {
        item.durability -= damage;
        if (item.durability <= 0) {
          eqSlot?.setItem(void 0);
          this.dimension.playSound("random.break", this.location);
        } else {
          eqSlot?.setItem(item);
        }
      }
      return item;
    }
  },
  stopSound: {
    value: function(id) {
      this.runCommand(`stopsound @s ${id}`);
    }
  },
  gamemode: {
    get: function() {
      return this.getGameMode();
    },
    set: function(gamemode) {
      this.setGameMode(gamemode);
    },
    enumerable: true
  },
  setActionBar: {
    value: function(rawMessage) {
      this.onScreenDisplay.setActionBar(rawMessage);
    }
  },
  setTitle: {
    value: function(rawMessage, option) {
      this.onScreenDisplay.setTitle(rawMessage, option);
    }
  },
  ipMovement: {
    get: function() {
      return this.inputPermissions.isPermissionCategoryEnabled(InputPermissionCategory.Movement);
    },
    set: function(value) {
      this.inputPermissions.setPermissionCategory(InputPermissionCategory.Movement, value);
    }
  },
  ipCamera: {
    get: function() {
      return this.inputPermissions.isPermissionCategoryEnabled(InputPermissionCategory.Camera);
    },
    set: function(value) {
      this.inputPermissions.setPermissionCategory(InputPermissionCategory.Camera, value);
    }
  }
});
defineProperties(Entity3.prototype, {
  commandRun: {
    value: function(...commands) {
      return runCommand.call(this, Entity3, ...commands);
    }
  },
  chunk: {
    get: function() {
      return new Vector3(
        Math.floor(this.x / 16),
        Math.floor(this.y / 16),
        Math.floor(this.z / 16)
      );
    }
  },
  effectAdd: {
    value: function(effectName, durationInSeconds = 30, amplifier = 0, hideParticles = false) {
      this.runCommand(`effect @s ${effectName} ${durationInSeconds} ${amplifier} ${hideParticles}`);
    }
  },
  effectClear: {
    value: function(effectType = null) {
      switch (typeof effectType) {
        case "undefined":
        case "object":
          this.runCommand("effect @s clear");
          break;
        case "string":
          this.runCommand(`effect @s ${effectType} 0`);
          break;
      }
    }
  },
  sendMolang: {
    value: function(molang) {
      this.playAnimation("animation.common.look_at_target", { stopExpression: `${molang} return true;` });
    }
  },
  projectileComponent: {
    get: function() {
      return this.getComponent(EntityComponentTypes.Projectile);
    },
    enumerable: true
  },
  projectileOwner: {
    get: function() {
      return this.projectileComponent?.owner;
    },
    set: function(entity) {
      const comp = this.projectileComponent;
      if (comp) comp.owner = entity;
    }
  },
  itemComponent: {
    get: function() {
      return this.getComponent(EntityComponentTypes.Item);
    },
    enumerable: true
  },
  toItemStack: {
    value: function() {
      return this.itemComponent?.itemStack;
    }
  },
  headLocation: {
    get: function() {
      const hl = this.getHeadLocation();
      return new Vector3(hl.x, hl.y, hl.z);
    },
    enumerable: true
  },
  viewDirection: {
    get: function() {
      const v = this.getViewDirection();
      return new Vector3(v.x, v.y, v.z);
    },
    enumerable: true
  },
  isPlayer: {
    get: function() {
      return this.typeId === "minecraft:player";
    },
    enumerable: true
  },
  ridingComponent: {
    get: function() {
      return this.getComponent(EntityComponentTypes.Riding);
    },
    enumerable: true
  },
  ride: {
    get: function() {
      return this.ridingComponent?.entityRidingOn;
    },
    enumerable: true
  },
  isRiding: {
    get: function() {
      return this.ridingComponent ? true : false;
    },
    enumerable: true
  },
  movementComponent: {
    get: function() {
      return this.getComponent(EntityComponentTypes.Movement);
    },
    enumerable: true
  },
  speed: {
    get: function() {
      return this.movementComponent?.currentValue ?? 0;
    },
    set: function(value) {
      return this.movementComponent?.setCurrentValue(value);
    },
    enumerable: true
  },
  getFacingOffset: {
    value: function(distance, offset = new Vector3(0, 0, 0)) {
      const view_dir = new Vector3(this.vdx, this.vdy, this.vdz);
      const right_dir = new Vector3(-view_dir.z, 0, view_dir.x);
      const normalized_right_dir = right_dir.normalized();
      const end = {
        x: view_dir.x * distance + normalized_right_dir.x * offset.x + offset.z,
        y: view_dir.y * distance + offset.y,
        z: view_dir.z * distance + normalized_right_dir.z * offset.x + offset.z
      };
      const head_loc = new Vector3(this.hx, this.hy, this.hz);
      return head_loc.offset(end.x, end.y, end.z);
    }
  },
  healthComponent: {
    get: function() {
      return this.getComponent(EntityComponentTypes.Health);
    },
    enumerable: true
  },
  health: {
    get: function() {
      return this.healthComponent?.currentValue || 0;
    },
    set: function(value) {
      return this.healthComponent?.setCurrentValue(value);
    },
    enumerable: true
  },
  maxHealth: {
    get: function() {
      return this.healthComponent?.effectiveMax || 0;
    },
    enumerable: true
  },
  missingHealth: {
    get: function() {
      return this.maxHealth - this.health;
    },
    enumerable: true
  },
  dispose: {
    value: function() {
      this.remove();
    }
  },
  equippableComponent: {
    get: function() {
      return this.getComponent(EntityComponentTypes.Equippable);
    },
    enumerable: true
  },
  getEquipment: {
    value: function(slot) {
      return this.equippableComponent?.getEquipment(slot);
    }
  },
  setEquipment: {
    value: function(slot, item) {
      return this.equippableComponent?.setEquipment(slot, item);
    }
  },
  inventoryComponent: {
    get: function() {
      return this.getComponent(EntityComponentTypes.Inventory);
    },
    enumerable: true
  },
  inventory: {
    get: function() {
      return this.inventoryComponent?.container;
    },
    enumerable: true
  },
  addItem: {
    value: function(itemStack) {
      this.inventory?.addItem(itemStack);
    }
  },
  tameableComponent: {
    get: function() {
      return this.getComponent(EntityComponentTypes.Tameable);
    },
    enumerable: true
  },
  tameOwner: {
    get: function() {
      return this.tameableComponent?.tamedToPlayer;
    },
    set: function(player) {
      return this.tameableComponent?.tame(player);
    }
  },
  rotation: {
    get: function() {
      return new Vector2(this.getRotation().x, this.getRotation().y);
    },
    set: function(rotation) {
      this.setRotation(rotation);
    },
    enumerable: true
  },
  velocity: {
    get: function() {
      return new Vector3(this.getVelocity());
    },
    enumerable: true
  },
  coordinates: {
    get: function() {
      return new Vector3(
        Math.floor(this.x),
        Math.floor(this.y),
        Math.floor(this.z)
      );
    },
    enumerable: true
  },
  cx: {
    get: function() {
      return this.coordinates.x;
    },
    enumerable: true
  },
  cy: {
    get: function() {
      return this.coordinates.y;
    },
    enumerable: true
  },
  cz: {
    get: function() {
      return this.coordinates.z;
    },
    enumerable: true
  },
  x: {
    get: function() {
      return this.location.x;
    },
    set: function(x) {
      const location = this.location;
      location.x = x;
      this.teleport(location);
    },
    enumerable: true
  },
  y: {
    get: function() {
      return this.location.y;
    },
    set: function(y) {
      const location = this.location;
      location.y = y;
      this.teleport(location);
    },
    enumerable: true
  },
  z: {
    get: function() {
      return this.location.z;
    },
    set: function(z) {
      const location = this.location;
      location.z = z;
      this.teleport(location);
    },
    enumerable: true
  },
  rx: {
    get: function() {
      return this.rotation.x;
    },
    set: function(rx) {
      const rotation = this.rotation;
      rotation.x = rx;
      this.setRotation(rotation);
    },
    enumerable: true
  },
  ry: {
    get: function() {
      return this.rotation.y;
    },
    set: function(ry) {
      const rotation = this.rotation;
      rotation.y = ry;
      this.setRotation(rotation);
    },
    enumerable: true
  },
  hx: {
    get: function() {
      return this.headLocation.x;
    },
    enumerable: true
  },
  hy: {
    get: function() {
      return this.headLocation.y;
    },
    enumerable: true
  },
  hz: {
    get: function() {
      return this.headLocation.z;
    },
    enumerable: true
  },
  vx: {
    get: function() {
      return this.velocity.x;
    },
    enumerable: true
  },
  vy: {
    get: function() {
      return this.velocity.y;
    },
    enumerable: true
  },
  vz: {
    get: function() {
      return this.velocity.z;
    },
    enumerable: true
  },
  vdx: {
    get: function() {
      return this.viewDirection.x;
    },
    enumerable: true
  },
  vdy: {
    get: function() {
      return this.viewDirection.y;
    },
    enumerable: true
  },
  vdz: {
    get: function() {
      return this.viewDirection.z;
    },
    enumerable: true
  }
});
defineProperties(Container.prototype, {
  forEachSlot: {
    value: function(cb) {
      for (let slotId = 0; slotId < this.size; slotId++) {
        const slotObj = this.getSlot(slotId);
        cb(slotObj, slotId);
      }
    }
  },
  getItems: {
    value: function() {
      const items = /* @__PURE__ */ new Map();
      this.forEachSlot((slot, id) => {
        const item = slot.getItem();
        if (item) items.set(id, item);
      });
      return items;
    }
  },
  sort: {
    value: function(cb) {
      const items = [];
      for (let i = 0; i < this.size; i++) {
        const item = this.getItem(i);
        if (item) {
          items.push({ slot: i, item });
        }
      }
      items.sort((a, b) => cb(a.item, b.item));
      for (let i = 0; i < this.size; i++) {
        this.setItem(i, void 0);
      }
      items.forEach(({ item }, index) => {
        this.setItem(index, item);
      });
    }
  }
});
defineProperties(BlockPermutation.prototype, {
  setState: {
    value: function(state, value) {
      return BlockPermutation.resolve(this.type.id, {
        ...this.getAllStates(),
        [state]: value
      });
    }
  },
  getState: {
    value: function(state) {
      return this.getAllStates()[state];
    }
  }
});
defineProperties(ScriptEventCommandMessageAfterEvent.prototype, {
  source: {
    get: function() {
      switch (this.sourceType) {
        case ScriptEventSource.Block:
          return this.sourceBlock;
        case ScriptEventSource.Entity:
          return this.sourceEntity;
        case ScriptEventSource.NPCDialogue:
          return this.initiator;
        default:
          return void 0;
      }
    },
    enumerable: true
  }
});
defineProperties(Dimension2.prototype, {
  weather: {
    get: function() {
      const eventId = world4.getTimeOfDay();
      const weatherTypes = Object.values(WeatherType2);
      for (const weatherType of weatherTypes) {
        this.setWeather(weatherType, eventId);
        if (weatherTracker.has(eventId)) {
          const currentWeather = weatherTracker.get(eventId);
          weatherTracker.delete(eventId);
          return currentWeather;
        }
      }
      return void 0;
    },
    set: function(v) {
      this.setWeather(v.type, v.duration);
    }
  },
  commandRun: {
    value: function(...commands) {
      return runCommand.call(this, Dimension2, ...commands);
    }
  }
});

// src/javascript.ts
Math.randomInt = function(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
defineProperties(String.prototype, {
  toTitleCase: {
    value: function() {
      return this.toLowerCase().split(" ").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
    }
  },
  toVector2: {
    value: function() {
      const pattern = this.match(/^(\d+)\s(\d+)$/);
      if (pattern) {
        const x = parseInt(pattern[1]);
        const y = parseInt(pattern[2]);
        return new Vector2(x, y);
      }
      switch (this.toLowerCase()) {
        case "north":
          return new Vector2(0, 180);
        case "east":
          return new Vector2(0, -90);
        case "south":
          return new Vector2(0, 0);
        case "west":
          return new Vector2(0, 90);
        default:
          return;
      }
    }
  },
  toVector3: {
    value: function() {
      const coordinates = this.split(" ").map(parseFloat);
      if (coordinates.some(isNaN) || coordinates.length !== 3) {
        console.error('Invalid string format. It should be "x y z"');
        return;
      }
      return new Vector3(coordinates[0], coordinates[1], coordinates[2]);
    }
  },
  toEQO: {
    value: function() {
      const options = {};
      const regex = /^@(a|p|r|e|s|initiator)(?:\[(.+)\])?$/;
      const matches = this.match(regex);
      if (matches && matches.length >= 2) {
        const attributes = matches[2] ? matches[2].split(",") : [];
        let excludeFamilies = [];
        let excludeGameModes = [];
        let excludeTags = [];
        let excludeTypes = [];
        let families = [];
        let tags = [];
        options.location = { x: 0, y: 0, z: 0 };
        attributes.forEach((attribute) => {
          const [key, value] = attribute.split("=").map((part) => part.trim());
          let trimmedValue = value;
          const quotedMatch = value.match(/^"(.+)"$/);
          if (quotedMatch) {
            trimmedValue = quotedMatch[1];
          }
          switch (key) {
            case "c":
              options.closest = parseInt(trimmedValue, 10);
              if (["p", "r", "s", "initiator"].includes(matches[1])) {
                options.closest = 1;
              }
              break;
            case "family":
              if (trimmedValue.startsWith("!")) {
                excludeFamilies.push(trimmedValue.replace(/^!/, ""));
                options.excludeFamilies = excludeFamilies;
              } else {
                families.push(trimmedValue);
                options.families = families;
              }
              break;
            case "l":
              options.maxLevel = parseInt(trimmedValue, 10);
              break;
            case "lm":
              options.minLevel = parseInt(trimmedValue, 10);
              break;
            case "m":
              if (trimmedValue.startsWith("!")) {
                excludeGameModes.push(trimmedValue.replace(/^!/, ""));
                options.excludeGameModes = excludeGameModes;
              } else {
                options.gameMode = parseInt(trimmedValue, 10) || trimmedValue;
              }
              break;
            case "name":
              options.name = trimmedValue;
              break;
            case "r":
              options.maxDistance = parseInt(trimmedValue, 10);
              break;
            case "rm":
              options.minDistance = parseInt(trimmedValue, 10);
              break;
            case "rx":
              options.location.x = parseInt(trimmedValue, 10);
              break;
            case "rxm":
              options.minHorizontalRotation = parseInt(trimmedValue, 10);
              break;
            case "ry":
              options.location.y = parseInt(trimmedValue, 10);
              break;
            case "rym":
              options.minVerticalRotation = parseInt(trimmedValue, 10);
              break;
            case "tag":
              if (trimmedValue.startsWith("!")) {
                excludeTags.push(trimmedValue.replace(/^!/, ""));
                options.excludeTags = excludeTags;
              } else {
                tags.push(trimmedValue);
                options.tags = tags;
              }
              break;
            case "type":
              if (trimmedValue.startsWith("!")) {
                excludeTypes.push(trimmedValue.replace(/^!/, ""));
                options.excludeTypes = excludeTypes;
              } else {
                options.type = trimmedValue;
              }
              if (["a", "p", "r", "s", "initiator"].includes(matches[1])) {
                options.type = "minecraft:player";
              }
              break;
            case "x":
              options.location.x = parseInt(trimmedValue, 10);
              break;
            case "y":
              options.location.y = parseInt(trimmedValue, 10);
              break;
            case "z":
              options.location.z = parseInt(trimmedValue, 10);
              break;
            default:
              console.warn(`'${key}' cannot be converted to EntityQueryOptions property.`);
              break;
          }
        });
        if (["a", "p", "r", "s", "initiator"].includes(matches[1])) {
          options.type = "minecraft:player";
          if (matches[1] !== "a") {
            options.closest = 1;
          }
        }
        return options;
      } else {
        console.error(`"${this}" is not a valid selector.`);
        return;
      }
    }
  }
});
defineProperties(Map.prototype, {
  display: {
    value: function() {
      this.forEach((v, k) => {
        console.warn(`${k}, ${JSON.stringify(v)}`);
      });
    }
  }
});
export {
  AfterEvent,
  BeforeEvent,
  CommandResult,
  CountDownTimer,
  Cutscene,
  EntityAfterEvent,
  EntityEventSignal,
  EntityItemEventSignal,
  EntityJumpAfterEvent,
  EntityJumpAfterEventSignal,
  EntityOnGroundAfterEvent,
  EntitySneakAfterEvent,
  EntitySneakAfterEventSignal,
  EntityStartJumpingAfterEventSignal,
  EntityStopJumpingAfterEventSignal,
  EntityUnsneakAfterEvent,
  EntityUnsneakAfterEventSignal,
  Event,
  EventSignal,
  Fade,
  ItemAfterEvent,
  PlayerAfterEvent,
  PlayerOnAirJumpAfterEvent,
  PlayerOnAirJumpAfterEventSignal,
  PlayerOnEquipAfterEvent,
  PlayerOnEquipAfterEventSignal,
  PlayerOnLandAfterEvent,
  PlayerOnLandAfterEventSignal,
  PlayerOnUnequipAfterEvent,
  PlayerOnUnequipAfterEventSignal,
  Run,
  RunInterval,
  RunTimeOut,
  Scene,
  ScriptEventManager,
  TimedCommand,
  Vector2,
  Vector3,
  afterEvents,
  arraysEqual,
  beforeEvents,
  defineProperties,
  display,
  generateUUIDv4,
  getRandomElement,
  idTranslate,
  namespace,
  ns,
  runCommand,
  scriptEvent,
  system,
  tps
};
