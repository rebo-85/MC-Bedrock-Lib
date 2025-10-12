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

// World extensions
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
    gamemode: any;
    inventory: Container;
    setActionBar(rawMessage: string): void;
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
    readonly projectileComponent: any;
    projectileOwner: Entity | undefined;
    readonly itemComponent: any;
    toItemStack(): ItemStack | undefined;
    readonly headLocation: Vector3;
    readonly viewDirection: Vector3;
    readonly isPlayer: boolean;
    readonly ridingComponent: any;
    readonly ride: Entity | undefined;
    readonly isRiding: boolean;
    readonly movementComponent: any;
    speed: number;
    getFacingOffset(distance: number, offset?: Vector3): Vector3;
    readonly healthComponent: any;
    health: number;
    readonly maxHealth: number;
    readonly missingHealth: number;
    dispose(): void;
    readonly equippableComponent: any;
    getEquipment(slot: EquipmentSlot): ItemStack | undefined;
    setEquipment(slot: EquipmentSlot, item: ItemStack): any;
    readonly inventoryComponent: any;
    readonly inventory: Container | undefined;
    addItem(itemStack: ItemStack): void;
    readonly tameableComponent: any;
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
    readonly enchantableComponent: any;
    readonly enchantmentSlots: any[] | undefined;
    addEnchantment(...enchantments: any[]): void;
    getEnchantment(enchantmentType: any): any | undefined;
    hasEnchantment(enchantmentType: any): boolean;
    removeEnchantment(enchantmentType: any): void;
    removeAllEnchantments(): void;
    readonly durabilityComponent: any;
    durability: number;
  }
  interface Container {
    forEachSlot(cb: (slotObj: any, slotId: number) => void): void;
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
    commandRun(...commands: string[]): any;
  }
}
