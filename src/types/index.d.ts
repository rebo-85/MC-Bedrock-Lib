import {
  PlayerJumpAfterEventSignal,
  EntityStartJumpingAfterEventSignal,
  EntityStopJumpingAfterEventSignal,
  EntitySneakAfterEventSignal,
  EntityUnsneakAfterEventSignal,
  PlayerOnAirJumpAfterEventSignal,
  PlayerOnLandAfterEventSignal,
  PlayerOnEquipAfterEventSignal,
  PlayerOnUnequipAfterEventSignal,
  Vector3,
  Vector2,
} from "./classes";

/**
 * Extends the String prototype with utility methods for string manipulation and parsing.
 */
declare global {
  interface String {
    /** Converts the string to title case, capitalizing the first letter of each word. */
    toTitleCase(): string;
    /** Parses the string as a Vector2. Returns undefined if parsing fails. */
    toVector2(): Vector2 | undefined;
    /** Parses the string as a Vector3. Returns undefined if parsing fails. */
    toVector3(): Vector3 | undefined;
    /** Parses the string as an EQO (Entity Query Object). Returns undefined if parsing fails. */
    toEQO(): Record<string, any> | undefined;
  }

  /**
   * Extends the Math object with additional randomization utilities.
   */
  interface Math {
    /** Returns a random integer between min (inclusive) and max (exclusive). */
    randomInt(min: number, max: number): number;
  }
}

declare module "@minecraft/server" {
  interface World {
    /** Returns all entities in the world matching the given selector. */
    getEntities(selector?: any): Entity[];
    /** Array of all players currently in the world. */
    readonly players: Player[];
    /** Reference to the End dimension. */
    readonly end: Dimension;
    /** Reference to the Overworld dimension. */
    readonly overworld: Dimension;
    /** Reference to the Nether dimension. */
    readonly nether: Dimension;
  }
  interface WorldAfterEvents {
    /** Signal triggered when an entity starts sneaking. */
    readonly entitySneak: EntitySneakAfterEventSignal;
    /** Signal triggered when an entity stops sneaking. */
    readonly entityUnsneak: EntityUnsneakAfterEventSignal;
    /** Signal triggered when a entity lands on the ground. */
    readonly entityOnGround: EntityOnGroundAfterEventSignal;
    /** Signal triggered when an player jumps. */
    readonly playerJump: PlayerJumpAfterEventSignal;
    /** Signal triggered when an player starts jumping. */
    readonly playerStartJumping: PlayerStartJumpingAfterEventSignal;
    /** Signal triggered when an player stops jumping. */
    readonly playerStopJumping: PlayerStopJumpingAfterEventSignal;
    /** Signal triggered when a player performs an air jump. */
    readonly playerOnAirJump: PlayerOnAirJumpAfterEventSignal;
    /** Signal triggered when a player equips an item. */
    readonly playerOnEquip: PlayerOnEquipAfterEventSignal;
    /** Signal triggered when a player unequips an item. */
    readonly playerOnUnequip: PlayerOnUnequipAfterEventSignal;
  }
  interface Player {
    /** Indicates whether the player can die (is mortal). */
    readonly isInvulnerable: boolean;
    /** Removes items from the player's inventory matching the given type and data. */
    clearItem(typeId: string, maxCount?: string, data?: number): void;
    /** True if the player is currently using an item. */
    readonly isUsingItem: boolean;
    /** Returns the player's equipped items and inventory as maps. */
    getItems(typeId?: string): { equipments: Map<string, ItemStack>; inventory: Map<number, ItemStack> };
    /** Damages the item equipped in the specified slot. Returns the updated ItemStack or undefined. */
    damageItem(slot: EquipmentSlot, damage?: number): ItemStack | undefined;
    /** Stops a sound for the player by its ID. */
    stopSound(id: string): void;
    /** The player's current game mode (e.g., survival, creative). */
    gamemode: GameMode;
    /** The player's inventory container. */
    inventory: Container;
    /** Sets a message in the player's action bar. */
    setActionBar(rawMessage: string | RawMessage): void;
    /** Sets a title message for the player, with optional display options. */
    setTitle(rawMessage: string, option?: any): void;
    /** Whether player movement input is enabled. */
    ipMovement: boolean;
    /** Whether player camera input is enabled. */
    ipCamera: boolean;
  }
  interface Entity {
    /** Runs one or more commands as this entity. */
    commandRun(...commands: (string | string[])[]): CommandResult;
    /** The chunk position of the entity as a Vector3. */
    readonly chunk: Vector3;
    /** Adds an effect to the entity for a given duration and amplifier. */
    effectAdd(effectName: string, durationInSeconds?: number, amplifier?: number, hideParticles?: boolean): void;
    /** Clears effects from the entity. If effectType is provided, only that effect is cleared. */
    effectClear(effectType?: string | null): void;
    /** Sends a Molang query to the entity. */
    sendMolang(molang: string): void;
    /** Converts the entity to an ItemStack if possible. */
    toItemStack(): ItemStack | undefined;
    /** The projectile component if the entity is a projectile, otherwise undefined. */
    readonly projectileComponent: EntityProjectileComponent | undefined;
    /** The item component if the entity is an item, otherwise undefined. */
    readonly itemComponent: EntityItemComponent | undefined;
    /** The riding component if the entity can ride, otherwise undefined. */
    readonly ridingComponent: EntityRidingComponent | undefined;
    /** The movement component if the entity can move, otherwise undefined. */
    readonly movementComponent: EntityMovementComponent | undefined;
    /** The health component if the entity has health, otherwise undefined. */
    readonly healthComponent: EntityHealthComponent | undefined;
    /** The equippable component if the entity can equip items, otherwise undefined. */
    readonly equippableComponent: EntityEquippableComponent | undefined;
    /** The inventory component if the entity has an inventory, otherwise undefined. */
    readonly inventoryComponent: EntityInventoryComponent | undefined;
    /** The type family component if the entity has type families, otherwise undefined. */
    readonly typeFamilyComponent: EntityTypeFamilyComponent | undefined;
    /** The tameable component if the entity can be tamed. */
    readonly tameableComponent: EntityTameableComponent;
    /** Array of type family strings for the entity. */
    readonly typeFamilies: string[];
    /** The position of the entity's head as a Vector3. */
    readonly headLocation: Vector3;
    /** The direction the entity is facing as a Vector3. */
    readonly viewDirection: Vector3;
    /** True if the entity is a player. */
    readonly isPlayer: boolean;
    /** The entity being ridden by this entity, or undefined. */
    readonly ride: Entity | undefined;
    /** True if this entity is riding another entity. */
    readonly isRiding: boolean;
    /** The owner of this projectile entity, or undefined. */
    projectileOwner: Entity | undefined;
    /** The current speed of the entity. */
    speed: number;
    /** Returns a Vector3 offset in the direction the entity is facing, scaled by distance and optional offset. */
    getFacingOffset(distance: number, offset?: Vector3): Vector3;
    /** The current health value of the entity. */
    health: number;
    /** The maximum health value of the entity. */
    readonly maxHealth: number;
    /** The amount of health missing from the entity. */
    readonly missingHealth: number;
    /** Removes the entity from the world. */
    dispose(): void;
    /** Gets the item equipped in the specified slot, or undefined. */
    getEquipment(slot: EquipmentSlot): ItemStack | undefined;
    /** Sets the item in the specified equipment slot. Returns true if successful. */
    setEquipment(slot: EquipmentSlot, item: ItemStack): boolean | undefined;
    /** Sets the mainhand item for the entity. */
    setMainhand(item: ItemStack | undefined): void;
    /** Sets the offhand item for the entity. */
    setOffhand(item: ItemStack | undefined): void;
    /** Sets the head slot item for the entity. */
    setHead(item: ItemStack | undefined): void;
    /** Sets the chest slot item for the entity. */
    setChest(item: ItemStack | undefined): void;
    /** Sets the legs slot item for the entity. */
    setLegs(item: ItemStack | undefined): void;
    /** Sets the feet slot item for the entity. */
    setFeet(item: ItemStack | undefined): void;
    /** The entity's inventory container, or undefined if not present. */
    readonly inventory: Container | undefined;
    /** Adds an item to the entity's inventory. */
    addItem(itemStack: ItemStack): void;
    /** The owner entity if this entity is tamed, or undefined. */
    tameOwner: Entity | undefined;
    /** The entity's rotation as a Vector2. */
    rotation: Vector2;
    /** The entity's velocity as a Vector3. */
    readonly velocity: Vector3;
    /** The entity's coordinates as a Vector3. */
    readonly coordinates: Vector3;
    /** The X coordinate of the entity's chunk. */
    readonly cx: number;
    /** The Y coordinate of the entity's chunk. */
    readonly cy: number;
    /** The Z coordinate of the entity's chunk. */
    readonly cz: number;
    /** The X coordinate of the entity. */
    x: number;
    /** The Y coordinate of the entity. */
    y: number;
    /** The Z coordinate of the entity. */
    z: number;
    /** The X rotation of the entity. */
    rx: number;
    /** The Y rotation of the entity. */
    ry: number;
    /** The X position of the entity's head. */
    readonly hx: number;
    /** The Y position of the entity's head. */
    readonly hy: number;
    /** The Z position of the entity's head. */
    readonly hz: number;
    /** The X component of the entity's velocity. */
    readonly vx: number;
    /** The Y component of the entity's velocity. */
    readonly vy: number;
    /** The Z component of the entity's velocity. */
    readonly vz: number;
    /** The X component of the entity's velocity delta. */
    readonly vdx: number;
    /** The Y component of the entity's velocity delta. */
    readonly vdy: number;
    /** The Z component of the entity's velocity delta. */
    readonly vdz: number;
  }
  interface ItemStack {
    /** True if this item stack represents a vanilla block. */
    readonly isVanillaBlock: boolean;
    /** Compares this item stack to another for equality. */
    compare(itemStack: ItemStack | null | undefined): boolean;
    /** The enchantable component for this item stack. */
    readonly enchantableComponent: ItemEnchantableComponent;
    /** The available enchantment slots for this item stack, or undefined. */
    readonly enchantmentSlots: EnchantmentSlot[] | undefined;
    /** Adds one or more enchantments to this item stack. */
    addEnchantment(...enchantments: Enchantment[]): void;
    /** Gets a specific enchantment from this item stack, or undefined. */
    getEnchantment(enchantmentType: EnchantmentType): Enchantment | undefined;
    /** Checks if this item stack has a specific enchantment. */
    hasEnchantment(enchantmentType: EnchantmentType): boolean;
    /** Removes a specific enchantment from this item stack. */
    removeEnchantment(enchantmentType: EnchantmentType): void;
    /** Removes all enchantments from this item stack. */
    removeAllEnchantments(): void;
    /** The durability component for this item stack. */
    readonly durabilityComponent: ItemDurabilityComponent;
    /** The current durability value of this item stack. */
    durability: number;
  }
  interface Container {
    /** Iterates over each slot in the container, calling the callback with the slot object and slot ID. */
    forEachSlot(cb: (slotObj: ContainerSlot, slotId: number) => void): void;
    /** Returns a map of all items in the container, keyed by slot number. */
    getItems(): Map<number, ItemStack>;
    /** Sorts the items in the container using the provided comparison callback. */
    sort(cb: (a: ItemStack, b: ItemStack) => number): void;
  }
  interface Block {
    /** Returns an array of blocks adjacent to this block. */
    getAdjacentBlocks(): Block[];
    /** Gets the value of a specific block state. */
    getState(state: string): any;
    /** Sets the value of a specific block state. */
    setState(state: string, value: any): void;
    /** The inventory component for this block, if present. */
    readonly inventoryComponent: any;
    /** The inventory container for this block, or undefined. */
    readonly inventory: Container | undefined;
    /** Returns a map of items in this block, optionally filtered by type ID. */
    getItems(typeId?: string): Map<number, ItemStack>;
  }
  interface BlockPermutation {
    /** Sets the value of a specific permutation state and returns the updated permutation. */
    setState(state: string, value: any): BlockPermutation;
    /** Gets the value of a specific permutation state. */
    getState(state: string): any;
  }
  interface Dimension {
    /** The current weather in this dimension, or undefined if not set. */
    weather: WeatherType | { type: WeatherType; duration: number } | undefined;
    /** Runs one or more commands in this dimension. */
    commandRun(...commands: (string | string[])[]): CommandResult;
  }

  interface ScriptEventCommandMessageAfterEvent {
    /** The source block or entity that triggered the script event, or undefined. */
    readonly source: Block | Entity | undefined;
  }
  interface CustomCommandOrigin {
    /** The source block or entity that triggered the custom command, or undefined. */
    readonly source: Block | Entity | undefined;
  }
}
