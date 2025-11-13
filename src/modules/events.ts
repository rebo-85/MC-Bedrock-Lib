import { Entity, Player, ItemStack, EquipmentSlot, system, world } from "@minecraft/server";
import { EntityManager, PlayerManager } from "./EntityManager";
import { XpData } from "../interface";

class Event {
  constructor() {}
}

class AfterEvent extends Event {
  constructor() {
    super();
  }
}

class BeforeEvent extends Event {
  cancel: boolean = false;
  constructor() {
    super();
  }
}
export class PlayerAfterEvent extends AfterEvent {
  player: Player;
  constructor(player: Player) {
    super();
    this.player = player;
  }
}
export class PlayerJumpAfterEvent extends PlayerAfterEvent {
  constructor(player: Player) {
    super(player);
  }
}
export class PlayerOnAirJumpAfterEvent extends PlayerAfterEvent {
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

export class PlayerXpOrbCollectAfterEvent extends PlayerAfterEvent {
  xpValue: number;

  constructor(player: Player, xpValue: number) {
    super(player);
    this.xpValue = xpValue;
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
// signals
export class EventSignal {
  protected _events: Map<string, any> = new Map();
  protected _isInitialized: boolean = false;
  private _process: number = null;
  private _isDisposed: boolean = false;

  subscribe(cb: (e: any) => void) {
    this._init();
    const process = () => {
      this._main(cb);
      if (!this._isDisposed) this._process = system.run(process);
    };
    this._process = system.run(process);
  }
  unsubscribe() {
    this._isDisposed = true;
    system.clearRun(this._process);
  }
  protected _main(cb: (e: any) => void): void {}
  protected _init(): void {
    this._isInitialized = true;
  }
}

export class PlayerEventSignal extends EventSignal {
  players: Player[];

  constructor() {
    super();
  }

  protected _init(): void {
    this._initPlayers();
  }

  private _initPlayers(): void {
    const callback = () => {
      const pm = new PlayerManager();
      pm.players = world.getAllPlayers();
      this.players = pm.players;
      this._isInitialized = true;
      world.afterEvents.worldLoad.unsubscribe(callback);
    };

    world.afterEvents.worldLoad.subscribe(callback);
  }
}

export class PlayerJumpAfterEventSignal extends PlayerEventSignal {
  constructor() {
    super();
  }

  protected _main(cb: (e: PlayerJumpAfterEvent) => void) {
    if (!this._isInitialized) return;

    for (const player of this.players) {
      const isTracked = this._events.has(player.id);
      const isJumpingInAir = player.isJumping && !player.isOnGround;

      if (!isTracked && isJumpingInAir) {
        const event = new PlayerJumpAfterEvent(player);
        this._events.set(player.id, event);
        cb(event);
      } else if (isTracked && player.isOnGround) {
        this._events.delete(player.id);
      }
    }
  }
}

export class PlayerStartJumpingAfterEventSignal extends PlayerEventSignal {
  constructor() {
    super();
  }

  protected _main(cb: (e: PlayerJumpAfterEvent) => void) {
    if (!this._isInitialized) return;

    for (const player of this.players) {
      const isTracked = this._events.has(player.id);
      const isJumpingInAir = player.isJumping && !player.isOnGround;

      if (!isTracked && isJumpingInAir) {
        const event = new PlayerJumpAfterEvent(player);
        this._events.set(player.id, event);
        cb(event);
      } else if (isTracked && !player.isJumping) {
        this._events.delete(player.id);
      }
    }
  }
}

export class PlayerStopJumpingAfterEventSignal extends PlayerEventSignal {
  constructor() {
    super();
  }

  protected _main(cb: (e: PlayerJumpAfterEvent) => void) {
    if (!this._isInitialized) return;

    for (const player of this.players) {
      const isTracked = this._events.has(player.id);

      if (player.isJumping && !isTracked) {
        this._events.set(player.id, null);
      } else if (!player.isJumping && isTracked) {
        const event = new PlayerJumpAfterEvent(player);
        this._events.set(player.id, event);
        cb(event);
        this._events.delete(player.id);
      }
    }
  }
}

export class PlayerOnAirJumpAfterEventSignal extends PlayerEventSignal {
  constructor() {
    super();
  }

  protected _main(cb: (e: PlayerOnAirJumpAfterEvent) => void) {
    if (!this._isInitialized) return;

    for (const player of this.players) {
      const isTracked = this._events.has(player.id);
      const isInAir = !player.isOnGround && !player.isJumping;

      if (isInAir) {
        this._events.set(player.id, null);
      } else if (isTracked && player.isOnGround) {
        this._events.delete(player.id);
      }

      if (player.isJumping && isTracked) {
        const event = new PlayerOnAirJumpAfterEvent(player);
        this._events.set(player.id, event);
        cb(event);
        this._events.delete(player.id);
      }
    }
  }
}

export class PlayerOnEquipAfterEventSignal extends PlayerEventSignal {
  private _previousEquipments: Map<string, Map<EquipmentSlot, ItemStack>> = new Map();
  constructor() {
    super();
  }

  protected _main(cb: (e: PlayerOnEquipAfterEvent) => void) {
    if (!this._isInitialized) return;

    for (const player of this.players) {
      let slots = Object.values(EquipmentSlot) as EquipmentSlot[];
      const currentEquipments = new Map<EquipmentSlot, ItemStack>();
      for (const slot of slots) {
        const item = player.getEquipment(slot);
        if (item) currentEquipments.set(slot, item);
      }

      const previousEquipments = this._previousEquipments.get(player.id) || currentEquipments;
      for (const [slot, itemStack] of currentEquipments) {
        const prevItemStack = previousEquipments.get(slot);
        const isTracked = this._events.has(player.id);
        const hasChanged = !itemStack.compare(prevItemStack);

        if (!isTracked && hasChanged) {
          const event = new PlayerOnEquipAfterEvent(player, itemStack, slot);
          this._events.set(player.id, event);
          cb(event);
        } else if (isTracked) {
          this._events.delete(player.id);
        }
      }

      this._previousEquipments.set(player.id, currentEquipments);
    }
  }
}

export class PlayerOnUnequipAfterEventSignal extends PlayerEventSignal {
  private _previousEquipments: Map<string, Map<EquipmentSlot, ItemStack>> = new Map();
  constructor() {
    super();
  }

  protected _main(cb: (e: PlayerOnUnequipAfterEvent) => void) {
    if (!this._isInitialized) return;

    for (const player of this.players) {
      let slots = Object.values(EquipmentSlot) as EquipmentSlot[];
      const currentEquipments = new Map<EquipmentSlot, ItemStack>();
      for (const slot of slots) {
        const item = player.getEquipment(slot);
        if (item) currentEquipments.set(slot, item);
      }

      const previousEquipments = this._previousEquipments.get(player.id);
      if (!previousEquipments) {
        this._previousEquipments.set(player.id, currentEquipments);
        continue;
      }

      for (const [slot, prevItemStack] of previousEquipments) {
        const currItemStack = currentEquipments.get(slot);
        const isTracked = this._events.has(player.id);
        const wasUnequipped = prevItemStack && (!currItemStack || !prevItemStack.compare(currItemStack));

        if (!isTracked && wasUnequipped) {
          const event = new PlayerOnUnequipAfterEvent(player, prevItemStack, slot);
          this._events.set(player.id, event);
          cb(event);
        } else if (isTracked) {
          this._events.delete(player.id);
        }
      }

      this._previousEquipments.set(player.id, currentEquipments);
    }
  }
}

export class PlayerXpOrbCollectAfterEventSignal extends PlayerEventSignal {
  private _orbSpawnData: Map<string, Map<string, XpData>> = new Map();

  constructor() {
    super();
  }

  protected _init(): void {
    super._init();

    world.afterEvents.entitySpawn.subscribe(({ entity }) => {
      if (entity.typeId === "minecraft:xp_orb") {
        const playersXpData = new Map<string, XpData>();

        for (const player of this.players) {
          playersXpData.set(player.id, {
            level: player.level,
            xpEarnedAtCurrentLevel: player.xpEarnedAtCurrentLevel,
            totalXpNeededForNextLevel: player.totalXpNeededForNextLevel,
          });
        }

        this._orbSpawnData.set(entity.id, playersXpData);
      }
    });

    world.beforeEvents.entityRemove.subscribe(({ removedEntity }) => {
      if (removedEntity.typeId === "minecraft:xp_orb") {
        const playersXpBefore = this._orbSpawnData.get(removedEntity.id);
        if (!playersXpBefore) return;

        const player = removedEntity.dimension.getPlayers({
          maxDistance: 2,
          location: removedEntity.location,
          closest: 1,
        })[0];

        const xpBefore = playersXpBefore.get(player.id);
        if (!xpBefore) return;

        const xpAfter: XpData = {
          level: player.level,
          xpEarnedAtCurrentLevel: player.xpEarnedAtCurrentLevel,
          totalXpNeededForNextLevel: player.totalXpNeededForNextLevel,
        };

        let xpOrbValue = 0;
        const hasLeveledUp = xpAfter.level > xpBefore.level;

        if (hasLeveledUp) {
          xpOrbValue =
            xpBefore.totalXpNeededForNextLevel - xpBefore.xpEarnedAtCurrentLevel + xpAfter.xpEarnedAtCurrentLevel;
        } else {
          xpOrbValue = xpAfter.xpEarnedAtCurrentLevel - xpBefore.xpEarnedAtCurrentLevel;
        }

        const hasCollected = xpOrbValue > 0;
        if (hasCollected) {
          const event = new PlayerXpOrbCollectAfterEvent(player, xpOrbValue);
          this._events.set(player.id, event);

          for (const [orbId, playersData] of this._orbSpawnData) {
            if (playersData.has(player.id)) {
              playersData.set(player.id, xpAfter);
            }
          }
        }

        this._orbSpawnData.delete(removedEntity.id);
      }
    });
  }

  protected _main(cb: (e: PlayerXpOrbCollectAfterEvent) => void): void {
    if (!this._isInitialized) return;

    for (const [playerId, event] of this._events) {
      cb(event);
      this._events.delete(playerId);
    }
  }
}

export class EntityEventSignal extends EventSignal {
  entities: Entity[];

  constructor() {
    super();
  }

  protected _init(): void {
    this._initEntities();
  }

  private _initEntities(): void {
    const callback = () => {
      const pm = new EntityManager();
      pm.entities = world.getEntities();
      this.entities = pm.entities;
      this._isInitialized = true;
      world.afterEvents.worldLoad.unsubscribe(callback);
    };
    world.afterEvents.worldLoad.subscribe(callback);
  }
}

export class EntityItemEventSignal extends EntityEventSignal {
  constructor() {
    super();
  }
}

export class EntitySneakAfterEventSignal extends EntityEventSignal {
  constructor() {
    super();
  }

  protected _main(cb: (e: EntitySneakAfterEvent) => void) {
    if (!this._isInitialized) return;

    for (const entity of this.entities) {
      const isTracked = this._events.has(entity.id);

      if (entity.isSneaking && !isTracked) {
        const event = new EntitySneakAfterEvent(entity);
        this._events.set(entity.id, event);
        cb(event);
      } else if (!entity.isSneaking && isTracked) {
        this._events.delete(entity.id);
      }
    }
  }
}

export class EntityUnsneakAfterEventSignal extends EntityEventSignal {
  constructor() {
    super();
  }

  protected _main(cb: (e: EntityUnsneakAfterEvent) => void) {
    if (!this._isInitialized) return;

    for (const entity of this.entities) {
      const isTracked = this._events.has(entity.id);

      if (entity.isSneaking && !isTracked) {
        this._events.set(entity.id, null);
      } else if (!entity.isSneaking && isTracked) {
        const event = new EntityUnsneakAfterEvent(entity);
        this._events.set(entity.id, event);
        cb(event);
        this._events.delete(entity.id);
      }
    }
  }
}

export class EntityOnGroundAfterEventSignal extends EntityEventSignal {
  constructor() {
    super();
  }

  protected _main(cb: (e: EntityOnGroundAfterEvent) => void) {
    if (!this._isInitialized) return;

    for (const entity of this.entities) {
      const isTracked = this._events.has(entity.id);

      if (!entity.isOnGround && !isTracked) {
        this._events.set(entity.id, null);
      } else if (entity.isOnGround && isTracked) {
        const event = new EntityOnGroundAfterEvent(entity);
        this._events.set(entity.id, event);
        cb(event);
        this._events.delete(entity.id);
      }
    }
  }
}
