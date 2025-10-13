import {
  World,
  Player,
  Entity,
  ItemStack,
  EquipmentSlot,
  Container,
  Block,
  BlockPermutation,
  Dimension,
  WeatherType,
} from "@minecraft/server";
import {
  EntityJumpAfterEventSignal,
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
  CommandResult,
} from "./classes";

declare global {
  interface String {
    toTitleCase(): string;
    toVector2(): Vector2 | undefined;
    toVector3(): Vector3 | undefined;
    toEQO(): Record<string, any> | undefined;
  }

  interface Math {
    randomInt(min: number, max: number): number;
  }
}

declare module "@minecraft/server" {
  interface World {
    getEntities(selector?: any): Entity[];
    readonly players: Player[];
    readonly end: Dimension;
    readonly overworld: Dimension;
    readonly nether: Dimension;
  }
  interface WorldAfterEvents {
    readonly entityJump: EntityJumpAfterEventSignal;
    readonly entityStartJumping: EntityStartJumpingAfterEventSignal;
    readonly entityStopJumping: EntityStopJumpingAfterEventSignal;
    readonly entitySneak: EntitySneakAfterEventSignal;
    readonly entityUnsneak: EntityUnsneakAfterEventSignal;
    readonly playerOnAirJump: PlayerOnAirJumpAfterEventSignal;
    readonly playerOnLand: PlayerOnLandAfterEventSignal;
    readonly playerOnEquip: PlayerOnEquipAfterEventSignal;
    readonly playerOnUnequip: PlayerOnUnequipAfterEventSignal;
  }
  interface Player {
    readonly isMortal: boolean;
    clearItem(typeId: string, maxCount?: string, data?: number): void;
    readonly isUsingItem: boolean;
    getItems(typeId?: string): { equipments: Map<string, ItemStack>; inventory: Map<number, ItemStack> };
    damageItem(slot: EquipmentSlot, damage?: number): ItemStack | undefined;
    stopSound(id: string): void;
    gamemode: GameMode;
    inventory: Container;
    setActionBar(rawMessage: string | RawMessage): void;
    setTitle(rawMessage: string, option?: any): void;
    ipMovement: boolean;
    ipCamera: boolean;
  }
  interface Entity {
    commandRun(...commands: string[]): CommandResult;
    readonly chunk: Vector3;
    effectAdd(effectName: string, durationInSeconds?: number, amplifier?: number, hideParticles?: boolean): void;
    effectClear(effectType?: string | null): void;
    sendMolang(molang: string): void;
    toItemStack(): ItemStack | undefined;
    readonly projectileComponent: EntityProjectileComponent | undefined;
    readonly itemComponent: EntityItemComponent | undefined;
    readonly ridingComponent: EntityRidingComponent | undefined;
    readonly movementComponent: EntityMovementComponent | undefined;
    readonly healthComponent: EntityHealthComponent | undefined;
    readonly equippableComponent: EntityEquippableComponent | undefined;
    readonly inventoryComponent: EntityInventoryComponent | undefined;
    readonly typeFamilyComponent: EntityTypeFamilyComponent | undefined;
    readonly tameableComponent: EntityTameableComponent;

    readonly typeFamilies: string[];
    readonly headLocation: Vector3;
    readonly viewDirection: Vector3;
    readonly isPlayer: boolean;
    readonly ride: Entity | undefined;
    readonly isRiding: boolean;
    projectileOwner: Entity | undefined;
    speed: number;
    getFacingOffset(distance: number, offset?: Vector3): Vector3;
    health: number;
    readonly maxHealth: number;
    readonly missingHealth: number;
    dispose(): void;
    getEquipment(slot: EquipmentSlot): ItemStack | undefined;
    setEquipment(slot: EquipmentSlot, item: ItemStack): boolean | undefined;
    readonly inventory: Container | undefined;
    addItem(itemStack: ItemStack): void;
    tameOwner: Entity | undefined;
    rotation: Vector2;
    readonly velocity: Vector3;
    readonly coordinates: Vector3;
    readonly cx: number;
    readonly cy: number;
    readonly cz: number;
    x: number;
    y: number;
    z: number;
    rx: number;
    ry: number;
    readonly hx: number;
    readonly hy: number;
    readonly hz: number;
    readonly vx: number;
    readonly vy: number;
    readonly vz: number;
    readonly vdx: number;
    readonly vdy: number;
    readonly vdz: number;
  }
  interface ItemStack {
    readonly isVanillaBlock: boolean;
    compare(itemStack: ItemStack | null | undefined): boolean;
    readonly enchantableComponent: ItemEnchantableComponent;
    readonly enchantmentSlots: EnchantmentSlot[] | undefined;
    addEnchantment(...enchantments: Enchantment[]): void;
    getEnchantment(enchantmentType: EnchantmentType): Enchantment | undefined;
    hasEnchantment(enchantmentType: EnchantmentType): boolean;
    removeEnchantment(enchantmentType: EnchantmentType): void;
    removeAllEnchantments(): void;
    readonly durabilityComponent: ItemDurabilityComponent;
    durability: number;
  }
  interface Container {
    forEachSlot(cb: (slotObj: ContainerSlot, slotId: number) => void): void;
    getItems(): Map<number, ItemStack>;
    sort(cb: (a: ItemStack, b: ItemStack) => number): void;
  }
  interface Block {
    getAdjacentBlocks(): Block[];
    getState(state: string): any;
    setState(state: string, value: any): void;
    readonly inventoryComponent: any;
    readonly inventory: Container | undefined;
    getItems(typeId?: string): Map<number, ItemStack>;
  }
  interface BlockPermutation {
    setState(state: string, value: any): BlockPermutation;
    getState(state: string): any;
  }
  interface Dimension {
    weather: WeatherType | { type: WeatherType; duration: number } | undefined;
    commandRun(...commands: string[]): CommandResult;
  }

  interface ScriptEventCommandMessageAfterEvent {
    readonly source: Block | Entity | undefined;
  }
}
