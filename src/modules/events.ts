import { Entity, EquipmentSlot, ItemStack, Player, system, world } from "@minecraft/server";
import { XpData } from "../interface";
import { EntityManager, PlayerManager } from "./EntityManager";

// Base Event Classes
class Event {}

class AfterEvent extends Event {}

class BeforeEvent extends Event {
  cancel = false;
}

// Player Events
export class PlayerAfterEvent extends AfterEvent {
  constructor(public player: Player) {
    super();
  }
}

export class PlayerJumpAfterEvent extends PlayerAfterEvent {}

export class PlayerOnAirJumpAfterEvent extends PlayerAfterEvent {}

export class PlayerXpOrbCollectAfterEvent extends PlayerAfterEvent {
  constructor(player: Player, public xpValue: number) {
    super(player);
  }
}

// Item Events
export class ItemAfterEvent extends PlayerAfterEvent {
  constructor(player: Player, public itemStack: ItemStack) {
    super(player);
  }
}

export class PlayerOnEquipAfterEvent extends ItemAfterEvent {
  constructor(player: Player, itemStack: ItemStack, public equipmentSlot: EquipmentSlot) {
    super(player, itemStack);
  }
}

export class PlayerOnUnequipAfterEvent extends PlayerOnEquipAfterEvent {}

// Entity Events
export class EntityAfterEvent extends AfterEvent {
  constructor(public entity: Entity) {
    super();
  }
}

export class EntityOnGroundAfterEvent extends EntityAfterEvent {}

export class EntitySneakAfterEvent extends EntityAfterEvent {}

export class EntityUnsneakAfterEvent extends EntityAfterEvent {}

// Event Signals
export class EventSignal {
  protected _events: Map<string, any> = new Map();
  protected _isInit = false;
  private _proc: number | null = null;
  private _disposed = false;

  subscribe(cb: (e: any) => void): void {
    this._init();
    const process = () => {
      this._main(cb);
      if (!this._disposed) this._proc = system.run(process);
    };
    this._proc = system.run(process);
  }

  unsubscribe(): void {
    this._disposed = true;
    if (this._proc !== null) system.clearRun(this._proc);
  }

  protected _main(cb: (e: any) => void): void {}
  protected _init(): void {
    this._isInit = true;
  }
}

// Player Event Signals
export class PlayerEventSignal extends EventSignal {
  protected players: Player[] = [];

  protected async _init(): Promise<void> {
    const pm = new PlayerManager();
    this.players = await pm.players;
    this._isInit = true;
  }
}

export class PlayerJumpAfterEventSignal extends PlayerEventSignal {
  protected _main(cb: (e: PlayerJumpAfterEvent) => void): void {
    if (!this._isInit) return;

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
  protected _main(cb: (e: PlayerJumpAfterEvent) => void): void {
    if (!this._isInit) return;

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
  protected _main(cb: (e: PlayerJumpAfterEvent) => void): void {
    if (!this._isInit) return;

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
  protected _main(cb: (e: PlayerOnAirJumpAfterEvent) => void): void {
    if (!this._isInit) return;

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
  private _prevEquip: Map<string, Map<EquipmentSlot, ItemStack>> = new Map();

  protected _main(cb: (e: PlayerOnEquipAfterEvent) => void): void {
    if (!this._isInit) return;

    for (const player of this.players) {
      const slots = Object.values(EquipmentSlot) as EquipmentSlot[];
      const currEquip = new Map<EquipmentSlot, ItemStack>();
      for (const slot of slots) {
        const item = player.getEquipment(slot);
        if (item) currEquip.set(slot, item);
      }

      const prevEquip = this._prevEquip.get(player.id) || currEquip;
      for (const [slot, item] of currEquip) {
        const prevItem = prevEquip.get(slot);
        const isTracked = this._events.has(player.id);
        const changed = !item.compare(prevItem);

        if (!isTracked && changed) {
          const event = new PlayerOnEquipAfterEvent(player, item, slot);
          this._events.set(player.id, event);
          cb(event);
        } else if (isTracked) {
          this._events.delete(player.id);
        }
      }

      this._prevEquip.set(player.id, currEquip);
    }
  }
}

export class PlayerOnUnequipAfterEventSignal extends PlayerEventSignal {
  private _prevEquip: Map<string, Map<EquipmentSlot, ItemStack>> = new Map();

  protected _main(cb: (e: PlayerOnUnequipAfterEvent) => void): void {
    if (!this._isInit) return;

    for (const player of this.players) {
      const slots = Object.values(EquipmentSlot) as EquipmentSlot[];
      const currEquip = new Map<EquipmentSlot, ItemStack>();
      for (const slot of slots) {
        const item = player.getEquipment(slot);
        if (item) currEquip.set(slot, item);
      }

      const prevEquip = this._prevEquip.get(player.id);
      if (!prevEquip) {
        this._prevEquip.set(player.id, currEquip);
        continue;
      }

      for (const [slot, prevItem] of prevEquip) {
        const currItem = currEquip.get(slot);
        const isTracked = this._events.has(player.id);
        const unequipped = prevItem && (!currItem || !prevItem.compare(currItem));

        if (!isTracked && unequipped) {
          const event = new PlayerOnUnequipAfterEvent(player, prevItem, slot);
          this._events.set(player.id, event);
          cb(event);
        } else if (isTracked) {
          this._events.delete(player.id);
        }
      }

      this._prevEquip.set(player.id, currEquip);
    }
  }
}

export class PlayerXpOrbCollectAfterEventSignal extends PlayerEventSignal {
  private static readonly XP_ORB_ID = "minecraft:xp_orb";
  private static readonly COLLECT_DIST = 2;
  private _orbData: Map<string, Map<string, XpData>> = new Map();

  protected async _init(): Promise<void> {
    await super._init();
    this._subscribeOrbEvents();
  }

  private _subscribeOrbEvents(): void {
    world.afterEvents.entitySpawn.subscribe(({ entity }) => {
      if (entity.typeId !== PlayerXpOrbCollectAfterEventSignal.XP_ORB_ID) return;

      const plrXpData = new Map<string, XpData>();
      for (const plr of this.players) {
        plrXpData.set(plr.id, this._captureXpData(plr));
      }
      this._orbData.set(entity.id, plrXpData);
    });

    world.beforeEvents.entityRemove.subscribe(({ removedEntity }) => {
      if (removedEntity.typeId !== PlayerXpOrbCollectAfterEventSignal.XP_ORB_ID) return;
      this._handleOrbRemove(removedEntity);
    });
  }

  private _captureXpData(plr: Player): XpData {
    return {
      level: plr.level,
      xpEarnedAtCurrentLevel: plr.xpEarnedAtCurrentLevel,
      totalXpNeededForNextLevel: plr.totalXpNeededForNextLevel,
    };
  }

  private _handleOrbRemove(orb: Entity): void {
    const plrXpBefore = this._orbData.get(orb.id);
    if (!plrXpBefore) return;

    const plr = orb.dimension.getPlayers({
      maxDistance: PlayerXpOrbCollectAfterEventSignal.COLLECT_DIST,
      location: orb.location,
      closest: 1,
    })[0];

    const xpBefore = plrXpBefore.get(plr.id);
    if (!xpBefore) return;

    const xpAfter = this._captureXpData(plr);
    const xpVal = this._calcXpValue(xpBefore, xpAfter);

    if (xpVal > 0) {
      const event = new PlayerXpOrbCollectAfterEvent(plr, xpVal);
      this._events.set(plr.id, event);

      for (const plrData of this._orbData.values()) {
        if (plrData.has(plr.id)) plrData.set(plr.id, xpAfter);
      }
    }

    this._orbData.delete(orb.id);
  }

  private _calcXpValue(before: XpData, after: XpData): number {
    if (after.level > before.level) {
      return before.totalXpNeededForNextLevel - before.xpEarnedAtCurrentLevel + after.xpEarnedAtCurrentLevel;
    }
    return after.xpEarnedAtCurrentLevel - before.xpEarnedAtCurrentLevel;
  }

  protected _main(cb: (e: PlayerXpOrbCollectAfterEvent) => void): void {
    if (!this._isInit) return;

    for (const [plrId, event] of this._events) {
      cb(event);
      this._events.delete(plrId);
    }
  }
}

// Entity Event Signals
export class EntityEventSignal extends EventSignal {
  protected entities: Entity[] = [];

  protected async _init(): Promise<void> {
    const em = new EntityManager();
    this.entities = await em.entities;
    this._isInit = true;
  }
}

export class EntityItemEventSignal extends EntityEventSignal {}

export class EntitySneakAfterEventSignal extends EntityEventSignal {
  protected _main(cb: (e: EntitySneakAfterEvent) => void): void {
    if (!this._isInit) return;

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
  protected _main(cb: (e: EntityUnsneakAfterEvent) => void): void {
    if (!this._isInit) return;

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
  protected _main(cb: (e: EntityOnGroundAfterEvent) => void): void {
    if (!this._isInit) return;

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
