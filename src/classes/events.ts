import { Entity, Player, ItemStack, EquipmentSlot, system, world } from "@minecraft/server";

class Event {
  constructor() {}
}

class AfterEvent extends Event {
  constructor() {
    super();
  }
}

class BeforeEvent extends Event {
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
export class PlayerAfterEvent extends AfterEvent {
  player: Player;
  constructor(player: Player) {
    super();
    this.player = player;
  }
}
export class EntityOnGroundAfterEvent extends EntityAfterEvent {
  constructor(entity: Entity) {
    super(entity);
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

// signals
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
