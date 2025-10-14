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

// signals
export class EventSignal {
  protected _eventIds: Set<string>;
  private _process: number;
  private _isDisposed: boolean;
  constructor() {
    this._eventIds = new Set();
    this._process = null;
    this._isDisposed = false;
  }
  subscribe(cb: (e: any) => void) {
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
}

export class EntityEventSignal extends EventSignal {
  constructor() {
    super();
  }
}

export class EntityItemEventSignal extends EntityEventSignal {
  constructor() {
    super();
  }
}

export class PlayerJumpAfterEventSignal extends EntityEventSignal {
  constructor() {
    super();
  }

  protected _main(cb: (e: PlayerJumpAfterEvent) => void) {
    for (const player of world.players) {
      if (!this._eventIds.has(player.id) && player.isJumping && !player.isOnGround) {
        this._eventIds.add(player.id);
        cb(new PlayerJumpAfterEvent(player));
      } else if (this._eventIds.has(player.id) && player.isOnGround) {
        this._eventIds.delete(player.id);
      }
    }
  }
}

export class PlayerStartJumpingAfterEventSignal extends EntityEventSignal {
  constructor() {
    super();
  }

  protected _main(cb: (e: PlayerJumpAfterEvent) => void) {
    for (const player of world.players) {
      if (!this._eventIds.has(player.id) && player.isJumping && !player.isOnGround) {
        this._eventIds.add(player.id);
        cb(new PlayerJumpAfterEvent(player));
      } else if (!player.isJumping && this._eventIds.has(player.id)) {
        this._eventIds.delete(player.id);
      }
    }
  }
}

export class PlayerStopJumpingAfterEventSignal extends EntityEventSignal {
  constructor() {
    super();
  }

  protected _main(cb: (e: PlayerJumpAfterEvent) => void) {
    for (const player of world.players) {
      if (player.isJumping && !this._eventIds.has(player.id)) {
        this._eventIds.add(player.id);
      } else if (!player.isJumping && this._eventIds.has(player.id)) {
        cb(new PlayerJumpAfterEvent(player));
        this._eventIds.delete(player.id);
      }
    }
  }
}

export class EntitySneakAfterEventSignal extends EntityEventSignal {
  constructor() {
    super();
  }

  protected _main(cb: (e: EntitySneakAfterEvent) => void) {
    for (const entity of world.getEntities()) {
      if (entity.isSneaking && !this._eventIds.has(entity.id)) {
        this._eventIds.add(entity.id);
        cb(new EntitySneakAfterEvent(entity));
      } else if (!entity.isSneaking && this._eventIds.has(entity.id)) {
        this._eventIds.delete(entity.id);
      }
    }
  }
}

export class EntityUnsneakAfterEventSignal extends EntityEventSignal {
  constructor() {
    super();
  }

  protected _main(cb: (e: EntityUnsneakAfterEvent) => void) {
    for (const entity of world.getEntities()) {
      if (entity.isSneaking && !this._eventIds.has(entity.id)) {
        this._eventIds.add(entity.id);
      } else if (!entity.isSneaking && this._eventIds.has(entity.id)) {
        cb(new EntityUnsneakAfterEvent(entity));
        this._eventIds.delete(entity.id);
      }
    }
  }
}

export class PlayerOnAirJumpAfterEventSignal extends EntityEventSignal {
  constructor() {
    super();
  }

  protected _main(cb: (e: PlayerOnAirJumpAfterEvent) => void) {
    for (const player of world.players) {
      if (!player.isOnGround && !player.isJumping) {
        this._eventIds.add(player.id);
      } else if (this._eventIds.has(player.id) && player.isOnGround) {
        this._eventIds.delete(player.id);
      }

      if (player.isJumping && this._eventIds.has(player.id)) {
        cb(new PlayerOnAirJumpAfterEvent(player));
        this._eventIds.delete(player.id);
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

  protected _main(cb: (e: PlayerOnEquipAfterEvent) => void) {
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
        if (!this._eventIds.has(player.id) && !itemStack.compare(prevItemStack)) {
          this._eventIds.add(player.id);
          cb(new PlayerOnEquipAfterEvent(player, itemStack, slot));
        } else if (this._eventIds.has(player.id)) {
          this._eventIds.delete(player.id);
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

  protected _main(cb: (e: PlayerOnUnequipAfterEvent) => void) {
    for (const player of world.players) {
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
        if (
          !this._eventIds.has(player.id) &&
          prevItemStack &&
          (!currItemStack || !prevItemStack.compare(currItemStack))
        ) {
          this._eventIds.add(player.id);
          cb(new PlayerOnUnequipAfterEvent(player, prevItemStack, slot));
        } else if (this._eventIds.has(player.id)) {
          this._eventIds.delete(player.id);
        }
      }

      this._previousEquipments.set(player.id, currentEquipments);
    }
  }
}

export class EntityOnGroundAfterEventSignal extends EntityEventSignal {
  constructor() {
    super();
  }

  protected _main(cb: (e: EntityOnGroundAfterEvent) => void) {
    for (const entity of world.getEntities()) {
      if (!entity.isOnGround && !this._eventIds.has(entity.id)) {
        this._eventIds.add(entity.id);
      } else if (entity.isOnGround && this._eventIds.has(entity.id)) {
        cb(new EntityOnGroundAfterEvent(entity));
        this._eventIds.delete(entity.id);
      }
    }
  }
}
