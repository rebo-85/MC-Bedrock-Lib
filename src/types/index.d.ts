import { EntityQueryOptions } from "@minecraft/server";
import {
  EntitySneakAfterEventSignal,
  EntityStartJumpingAfterEventSignal,
  EntityStopJumpingAfterEventSignal,
  EntityUnsneakAfterEventSignal,
  PlayerJumpAfterEventSignal,
  PlayerOnAirJumpAfterEventSignal,
  PlayerDoubleSneakAfterEventSignal,
  PlayerOnEquipAfterEventSignal,
  PlayerOnLandAfterEventSignal,
  PlayerOnUnequipAfterEventSignal,
  PlayerXpOrbCollectAfterEventSignal
} from "../modules/events";

import { V2, V3 } from "../modules/general";

/**
 * Extends the String prototype with utility methods for string manipulation and parsing.
 */
declare global {
  interface String {
    /** Parses the string as an Entity Query Options (EQO). Returns undefined if parsing fails. */
    toEQO(): EntityQueryOptions | undefined;
    /** Converts the string to title case, capitalizing the first letter of each word. */
    toTitleCase(): string;
    /** Parses the string as a V2. Returns undefined if parsing fails. */
    toV2(): V2 | undefined;
    /** Parses the string as a V3. Returns undefined if parsing fails. */
    toV3(): V3 | undefined;
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
  interface WorldAfterEvents {
    /** Signal triggered when a entity lands on the ground. */
    readonly entityOnGround: EntityOnGroundAfterEventSignal;
    /** Signal triggered when an entity starts sneaking. */
    readonly entitySneak: EntitySneakAfterEventSignal;
    /** Signal triggered when an entity stops sneaking. */
    readonly entityUnsneak: EntityUnsneakAfterEventSignal;
    /** Signal triggered when a player jumps. */
    readonly playerJump: PlayerJumpAfterEventSignal;
    /** Signal triggered when a player performs an air jump. */
    readonly playerOnAirJump: PlayerOnAirJumpAfterEventSignal;
    /** Signal triggered when a player equips an item. */
    readonly playerOnEquip: PlayerOnEquipAfterEventSignal;
    /** Signal triggered when a player unequips an item. */
    readonly playerOnUnequip: PlayerOnUnequipAfterEventSignal;
    /** Signal triggered when a player starts jumping. */
    readonly playerStartJumping: PlayerStartJumpingAfterEventSignal;
    /** Signal triggered when a player stops jumping. */
    readonly playerStopJumping: PlayerStopJumpingAfterEventSignal;
    /** Signal triggered when a player double-sneaks (two quick sneaks). */
    readonly playerDoubleSneak: PlayerDoubleSneakAfterEventSignal;
    /** Signal triggered when a player collects an xp orb. */
    readonly playerXpOrbCollect: PlayerXpOrbCollectAfterEventSignal;
  }

  interface World {
    /** Reference to the End dimension. */
    readonly end: Dimension;
    /** Reference to the Nether dimension. */
    readonly nether: Dimension;
    /** Reference to the Overworld dimension. */
    readonly overworld: Dimension;
    /** Array of all players currently in the world. */
    readonly players: Player[];
    /** World time of day (ms). */
    time: number;
    /** Returns all entities in the world matching the given selector. */
    getEntities(selector?: any): Entity[];
  }

  interface Player {
    /** The player's current game mode (e.g., survival, creative). */
    gamemode: GameMode;
    /** The player's inventory container. */
    inventory: Container;
    /** Indicates whether the player can die (is mortal). */
    readonly isInvulnerable: boolean;
    /** True if the player is currently using an item. */
    readonly isUsingItem: boolean;
    /** Whether player camera input is enabled. */
    ipCamera: boolean;
    /** Whether player movement input is enabled. */
    ipMovement: boolean;
    /** The total experience points of the player. */
    xp: number;
    /** Removes items from the player's inventory matching the given type and data. */
    clearItem(typeId: string, maxCount?: string, data?: number): void;
    /** Damages the item equipped in the specified slot. Returns the updated ItemStack or undefined. */
    damageItem(slot: EquipmentSlot, damage?: number, ignoreUnbreaking?: boolean): ItemStack | undefined;
    /** Hides all HUD elements except the provided list. */
    hideHudExcept(hudElements?: HudElement[]): void;
    /** Returns true if a specific HUD element is currently forced hidden. */
    isHudHidden(hudElement: HudElement): boolean;
    /** Returns the currently hidden HUD elements for the player. */
    getHiddenHud(): HudElement[];
    /** Returns the player's equipped items and inventory as maps. */
    getItems(typeId?: string): { equipments: Map<string, ItemStack>; inventory: Map<number, ItemStack> };
    /** Resets HUD elements visibility to their default state. */
    resetHud(): void;
    /** Sets the field of view for the player. */
    setActionBar(rawMessage: string | RawMessage): void;
    /** Sets a title message for the player, with optional display options. */
    setFov(value: number, easeOption?: EaseOptions): void;
    /** Sets visibility for HUD elements. */
    setHudVisibility(visible: HudVisibility, hudElements?: HudElement[]): void;
    /** Sets a message in the player's action bar. */
    setTitle(rawMessage: string, option?: TitleDisplayOptions): void;
    /** Stops a sound for the player by its ID. */
    stopSound(id: string): void;
    /** Updates the player's subtitle message. */
    updateSubtitle(rawMessage: string | RawMessage): void;
  }

  interface Entity {
    /** The item in the chest slot. */
    chestItem: ItemStack | undefined;
    /** The chunk position of the entity as a V3. */
    readonly chunk: V3;
    /** The entity's coordinates as a V3. */
    readonly coordinates: V3;
    /** The X coordinate of the entity's chunk. */
    readonly cx: number;
    /** The Y coordinate of the entity's chunk. */
    readonly cy: number;
    /** The Z coordinate of the entity's chunk. */
    readonly cz: number;
    /** The equippable component if the entity can equip items, otherwise undefined. */
    readonly equippableComponent: EntityEquippableComponent | undefined;
    /** The item in the feet slot. */
    feetItem: ItemStack | undefined;
    /** The item in the head slot. */
    headItem: ItemStack | undefined;
    /** The position of the entity's head as a V3. */
    readonly headLocation: V3;
    /** The health of the entity, or undefined if not present. */
    health: number;
    /** The health component if the entity has health, otherwise undefined. */
    readonly healthComponent: EntityHealthComponent | undefined;
    /** The X position of the entity's head. */
    readonly hx: number;
    /** The Y position of the entity's head. */
    readonly hy: number;
    /** The Z position of the entity's head. */
    readonly hz: number;
    /** The entity's inventory container, or undefined if not present. */
    readonly inventory: Container | undefined;
    /** The inventory component if the entity has an inventory, otherwise undefined. */
    readonly inventoryComponent: EntityInventoryComponent | undefined;
    /** True if the entity is a player. */
    readonly isPlayer: boolean;
    /** True if this entity is riding another entity. */
    readonly isRiding: boolean;
    /** The item component if the entity is an item, otherwise undefined. */
    readonly itemComponent: EntityItemComponent | undefined;
    /** The item in the legs slot. */
    legsItem: ItemStack | undefined;
    /** The item in the main hand slot. */
    mainHandItem: ItemStack | undefined;
    /** The maximum health value of the entity. */
    readonly maxHealth: number;
    /** The amount of health missing from the entity. */
    readonly missingHealth: number;
    /** The movement component if the entity can move, otherwise undefined. */
    readonly movementComponent: EntityMovementComponent | undefined;
    /** The item in the offhand slot. */
    offhandItem: ItemStack | undefined;
    /** The projectile component if the entity is a projectile, otherwise undefined. */
    readonly projectileComponent: EntityProjectileComponent | undefined;
    /** The owner of this projectile entity, or undefined. */
    projectileOwner: Entity | undefined;
    /** The entity being ridden by this entity, or undefined. */
    readonly ride: Entity | undefined;
    /** The riding component if the entity can ride, otherwise undefined. */
    readonly ridingComponent: EntityRidingComponent | undefined;
    /** The entity's rotation as a V2. */
    rotation: V2;
    /** The X rotation of the entity. */
    rx: number;
    /** The Y rotation of the entity. */
    ry: number;
    /** The current speed of the entity. */
    speed: number;
    /** The tameable component if the entity can be tamed. */
    readonly tameableComponent: EntityTameableComponent | undefined;
    /** The owner entity if this entity is tamed, or undefined. */
    tameOwner: Entity | undefined;
    /** The type family component if the entity has type families, otherwise undefined. */
    readonly typeFamilyComponent: EntityTypeFamilyComponent | undefined;
    /** Array of type family strings for the entity. */
    readonly typeFamilies: string[];
    /** The X component of the entity's velocity delta. */
    readonly vdx: number;
    /** The Y component of the entity's velocity delta. */
    readonly vdy: number;
    /** The Z component of the entity's velocity delta. */
    readonly vdz: number;
    /** The entity's velocity as a V3. */
    readonly velocity: V3;
    /** The direction the entity is facing as a V3. */
    readonly viewDirection: V3;
    /** The X component of the entity's velocity. */
    readonly vx: number;
    /** The Y component of the entity's velocity. */
    readonly vy: number;
    /** The Z component of the entity's velocity. */
    readonly vz: number;
    /** The X coordinate of the entity. */
    x: number;
    /** The Y coordinate of the entity. */
    y: number;
    /** The Z coordinate of the entity. */
    z: number;
    /** Adds an item to the entity's inventory. */
    addItem(itemStack: ItemStack): ItemStack | undefined;
    /** Runs one or more commands as this entity. */
    commandRun(...commands: (string | string[])[]): CommandResult;
    /** Removes the entity from the world. */
    dispose(): void;
    /** Adds an effect to the entity for a given duration and amplifier. */
    effectAdd(effectName: string, durationInSeconds?: number | string, amplifier?: number, hideParticles?: boolean): void;
    /** Clears effects from the entity. If effectType is provided, only that effect is cleared. */
    effectClear(effectType?: string | null): void;
    /** Gets the item equipped in the specified slot, or undefined. */
    getEquipment(slot: EquipmentSlot): ItemStack | undefined;
    /** Returns a V3 offset in the direction the entity is facing, scaled by distance and optional offset. */
    getFacingOffset(distance: number, offset?: V3): V3;
    /** Sets the item in the specified equipment slot. Returns true if successful. */
    setEquipment(slot: EquipmentSlot, item: ItemStack): boolean | undefined;
    /** Converts the entity to an ItemStack if possible. */
    toItemStack(): ItemStack | undefined;
  }

  interface ItemStack {
    /** The book component for this item stack. */
    readonly bookComponent: ItemBookComponent | undefined;
    /** The compostable component for this item stack. */
    readonly compostableComponent: ItemCompostableComponent | undefined;
    /** The cooldown component for this item stack. */
    readonly cooldownComponent: ItemCooldownComponent | undefined;
    /** The current damage value of this item stack. */
    damage: number;
    /** The current durability value of this item stack. */
    durability: number;
    /** The durability component for this item stack. */
    readonly durabilityComponent: ItemDurabilityComponent | undefined;
    /** The dyeable component for this item stack. */
    readonly dyeableComponent: ItemDyeableComponent | undefined;
    /** The enchantable component for this item stack. */
    readonly enchantableComponent: ItemEnchantableComponent | undefined;
    /** The available enchantment slots for this item stack, or undefined. */
    readonly enchantmentSlots: EnchantmentSlot[] | undefined;
    /** The food component for this item stack, or undefined if not a food item. */
    readonly foodComponent: ItemFoodComponent | undefined;
    /** The inventory container this item stack is in, or undefined. */
    readonly inventory: Container | undefined;
    /** The inventory component for this item stack, or undefined. */
    readonly inventoryComponent: ItemInventoryComponent | undefined;
    /** True if this item stack represents a vanilla block. */
    readonly isVanillaBlock: boolean;
    /** The maximum durability value of this item stack. */
    maxDurability: number;
    /** The potion component for this item stack, or undefined if not a potion item. */
    readonly potionComponent: ItemPotionComponent | undefined;

    /** Adds one or more enchantments to this item stack. */
    addEnchantment(...enchantments: Enchantment[]): void;
    /** Compares this item stack to another for equality. */
    compare(itemStack: ItemStack | null | undefined): boolean;
    /** Gets a specific enchantment from this item stack, or undefined. */
    getEnchantment(enchantmentType: EnchantmentType): Enchantment | undefined;
    /** Gets all enchantments currently on this item stack. */
    getEnchantments(): Enchantment[];
    /** Checks if this item stack has a specific enchantment. */
    hasEnchantment(enchantmentType: EnchantmentType | string): boolean;
    /** Removes all enchantments from this item stack. */
    removeAllEnchantments(): void;
    /** Removes a specific enchantment from this item stack. */
    removeEnchantment(enchantmentType: EnchantmentType): void;
  }

  interface Container {
    /** Iterates over each slot in the container, calling the callback with the slot object and slot ID. */
    forEachSlot(cb: (slotObj: ContainerSlot, slotId: number) => void): void;
    /** Returns a map of all items in the container, keyed by slot number. */
    getItems(): Map<number, ItemStack>;
    /** Sorts the items in the container using the provided comparison callback. */
    sort(cb: (a: ItemStack, b: ItemStack) => number): void;
    /** Transfers all items from this container to the target container. Returns the number of moved stacks. */
    transferAll(targetContainer: Container): number;
  }

  interface Block {
    /** The block's fluid container component, if present. */
    readonly fluidContainerComponent: BlockFluidContainerComponent | undefined;
    /** The inventory container for this block, or undefined. */
    readonly inventory: Container | undefined;
    /** The inventory component for this block, if present. */
    readonly inventoryComponent: any;
    /** The block's map color component, if present. */
    readonly mapColorComponent: BlockMapColorComponent | undefined;
    /** The block's movable component, if present. */
    readonly movableComponent: BlockMovableComponent | undefined;
    /** The block's piston component, if present. */
    readonly pistonComponent: BlockPistonComponent | undefined;
    /** The block's precipitation interactions component, if present. */
    readonly precipitationInteractionsComponent: BlockPrecipitationInteractionsComponent | undefined;
    /** The block's record player component, if present. */
    readonly recordPlayerComponent: BlockRecordPlayerComponent | undefined;
    /** The block's redstone producer component, if present. */
    readonly redstoneProducerComponent: BlockRedstoneProducerComponent | undefined;
    /** The block's sign component, if present. */
    readonly signComponent: BlockSignComponent | undefined;
    /** Returns an array of blocks adjacent to this block. */
    getAdjacentBlocks(): Block[];
    /** Returns an object containing all block states and their values. */
    getAllStates(): any;
    /** Returns a map of items in this block, optionally filtered by type ID. */
    getItems(typeId?: string): Map<number, ItemStack>;
    /** Gets the value of a specific block state. */
    getState(state: string): any;
    /** Sets the value of a specific block state. */
    setState(state: string, value: any): void;
    /** Returns a new block permutation with the specified state value. */
    withState(state: string, value: any): BlockPermutation;
  }

  interface BlockPermutation {
    /** The type ID of the block this permutation represents. */
    typeId: string;
    /** Sets the value of a specific permutation state and returns the updated permutation. */
    setState(state: string, value: any): BlockPermutation;
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
