import {
  Block,
  BlockComponentTypes,
  BlockInventoryComponent,
  BlockPermutation,
  BlockTypes,
  Container,
  CustomCommandOrigin,
  CustomCommandSource,
  Dimension,
  DimensionTypes,
  EaseOptions,
  Enchantment,
  EnchantmentSlot,
  EnchantmentType,
  Entity,
  EntityComponentTypes,
  EntityEquippableComponent,
  EntityHealthComponent,
  EntityInventoryComponent,
  EntityItemComponent,
  EntityMovementComponent,
  EntityProjectileComponent,
  EntityRidingComponent,
  EntityTameableComponent,
  EntityTypeFamilyComponent,
  EquipmentSlot,
  GameMode,
  HudElement,
  HudVisibility,
  InputPermissionCategory,
  ItemComponentTypes,
  ItemDurabilityComponent,
  ItemEnchantableComponent,
  ItemInventoryComponent,
  ItemStack,
  Player,
  RawMessage,
  ScriptEventCommandMessageAfterEvent,
  ScriptEventSource,
  TitleDisplayOptions,
  WeatherType,
  World,
  world,
  WorldAfterEvents
} from "@minecraft/server";
import {
  EntityOnGroundAfterEventSignal,
  EntitySneakAfterEventSignal,
  EntityUnsneakAfterEventSignal,
  PlayerJumpAfterEventSignal,
  PlayerOnAirJumpAfterEventSignal,
  PlayerOnEquipAfterEventSignal,
  PlayerOnUnequipAfterEventSignal,
  PlayerStartJumpingAfterEventSignal,
  PlayerStopJumpingAfterEventSignal,
  PlayerXpOrbCollectAfterEventSignal
} from "./modules/index";

import { V3, V2 } from "./modules/index";

import { arraysEqual, defineProperties, createDimGetter, createPlayersGetter } from "./utils";
import { playersUsingItem, weatherData } from "./events";
import { WeatherOptions } from "interface";

// ============================================================================
// WorldAfterEvents Extensions
// ============================================================================

defineProperties(WorldAfterEvents.prototype, {
  entityOnGround: {
    get: function (): EntityOnGroundAfterEventSignal {
      return new EntityOnGroundAfterEventSignal();
    }
  },
  entitySneak: {
    get: function (): EntitySneakAfterEventSignal {
      return new EntitySneakAfterEventSignal();
    }
  },
  entityUnsneak: {
    get: function (): EntityUnsneakAfterEventSignal {
      return new EntityUnsneakAfterEventSignal();
    }
  },
  playerJump: {
    get: function (): PlayerJumpAfterEventSignal {
      return new PlayerJumpAfterEventSignal();
    }
  },
  playerOnAirJump: {
    get: function (): PlayerOnAirJumpAfterEventSignal {
      return new PlayerOnAirJumpAfterEventSignal();
    }
  },
  playerOnEquip: {
    get: function (): PlayerOnEquipAfterEventSignal {
      return new PlayerOnEquipAfterEventSignal();
    }
  },
  playerOnUnequip: {
    get: function (): PlayerOnUnequipAfterEventSignal {
      return new PlayerOnUnequipAfterEventSignal();
    }
  },
  playerStartJumping: {
    get: function (): PlayerStartJumpingAfterEventSignal {
      return new PlayerStartJumpingAfterEventSignal();
    }
  },
  playerStopJumping: {
    get: function (): PlayerStopJumpingAfterEventSignal {
      return new PlayerStopJumpingAfterEventSignal();
    }
  },
  playerXpOrbCollect: {
    get: function (): PlayerXpOrbCollectAfterEventSignal {
      return new PlayerXpOrbCollectAfterEventSignal();
    }
  }
});

// ============================================================================
// World Extensions
// ============================================================================

defineProperties(World.prototype, {
  end: {
    get: createDimGetter("minecraft:the_end"),
    enumerable: true
  },
  nether: {
    get: createDimGetter("minecraft:nether"),
    enumerable: true
  },
  overworld: {
    get: createDimGetter("minecraft:overworld"),
    enumerable: true
  },
  players: {
    get: createPlayersGetter(),
    enumerable: true
  },
  time: {
    get: function (): number {
      return (this as World).getTimeOfDay();
    },
    set: function (time: number) {
      (this as World).setTimeOfDay(time);
    },
    enumerable: true
  },
  getEntities: {
    value: function (selector?: any): Entity[] {
      const entities = new Set<Entity>();
      const dimTypes = DimensionTypes.getAll();
      dimTypes.forEach((type: any) => {
        const dim = (this as World).getDimension(type.typeId);
        dim?.getEntities(selector).forEach((e: Entity) => entities.add(e));
      });
      return Array.from(entities);
    }
  }
});

// ============================================================================
// ItemStack Extensions
// ============================================================================

defineProperties(ItemStack.prototype, {
  damage: {
    get: function (): number {
      return (this as ItemStack).durabilityComponent?.damage ?? 0;
    },
    set: function (dmg: number) {
      const dc = (this as ItemStack).durabilityComponent;
      if (!dc) return;
      if (dmg < 0) {
        dmg = 0;
      } else if (dmg > (dc.maxDurability ?? 0)) {
        dmg = dc.maxDurability ?? 0;
      }
      dc.damage = dmg;
    },
    enumerable: true
  },
  durability: {
    get: function (): number {
      if (!(this as ItemStack).durabilityComponent) return 0;

      return (this as ItemStack).maxDurability - (this as ItemStack).damage;
    },

    set: function (dur: number) {
      const dc = (this as ItemStack).durabilityComponent;
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
  },
  durabilityComponent: {
    get: function (): ItemDurabilityComponent | undefined {
      return (this as ItemStack).getComponent(ItemComponentTypes.Durability);
    },
    enumerable: true
  },
  enchantableComponent: {
    get: function (): ItemEnchantableComponent | undefined {
      return (this as ItemStack).getComponent(ItemComponentTypes.Enchantable);
    },
    enumerable: true
  },
  enchantmentSlots: {
    get: function (): EnchantmentSlot[] | undefined {
      return (this as ItemStack).enchantableComponent?.slots;
    },
    enumerable: true
  },
  inventory: {
    get: function (): Container | undefined {
      return (this as ItemStack).inventoryComponent?.container;
    }
  },
  inventoryComponent: {
    get: function (): ItemInventoryComponent | undefined {
      return (this as ItemStack).getComponent(ItemComponentTypes.Inventory);
    }
  },
  isVanillaBlock: {
    get: function (): boolean {
      return !!BlockTypes.get((this as ItemStack).typeId);
    }
  },
  maxDurability: {
    get: function (): number {
      return (this as ItemStack).durabilityComponent?.maxDurability ?? 0;
    },
    enumerable: true
  },
  addEnchantment: {
    value: function (...enchantments: Enchantment[]): void {
      const enchantmentList = enchantments.flat();
      enchantmentList.forEach((ench: any) => (this as ItemStack).enchantableComponent?.addEnchantments(ench));
    }
  },
  compare: {
    value: function (itemStack: ItemStack | null | undefined): boolean {
      if (itemStack === null || itemStack === undefined) return false;
      if (
        (this as ItemStack).amount === itemStack.amount &&
        (this as ItemStack).isStackable === itemStack.isStackable &&
        (this as ItemStack).keepOnDeath === itemStack.keepOnDeath &&
        (this as ItemStack).lockMode === itemStack.lockMode &&
        (this as ItemStack).maxAmount === itemStack.maxAmount &&
        (this as ItemStack).nameTag === itemStack.nameTag &&
        (this as ItemStack).type === itemStack.type &&
        (this as ItemStack).typeId === itemStack.typeId &&
        arraysEqual((this as ItemStack).getCanDestroy(), itemStack.getCanDestroy()) &&
        arraysEqual((this as ItemStack).getComponents(), itemStack.getComponents()) &&
        arraysEqual((this as ItemStack).getLore(), itemStack.getLore()) &&
        arraysEqual((this as ItemStack).getTags(), itemStack.getTags()) &&
        (this as ItemStack).getDynamicPropertyTotalByteCount() === itemStack.getDynamicPropertyTotalByteCount()
      ) {
        return true;
      }
      return false;
    }
  },
  getEnchantment: {
    value: function (enchantmentType: EnchantmentType): Enchantment | undefined {
      return (this as ItemStack).enchantableComponent?.getEnchantment(enchantmentType);
    }
  },
  hasEnchantment: {
    value: function (enchantmentType: EnchantmentType | string): boolean {
      return !!(this as ItemStack).enchantableComponent?.hasEnchantment(enchantmentType);
    }
  },
  removeAllEnchantments: {
    value: function (): void {
      return (this as ItemStack).enchantableComponent?.removeAllEnchantments();
    }
  },
  removeEnchantment: {
    value: function (enchantmentType: EnchantmentType): void {
      return (this as ItemStack).enchantableComponent?.removeEnchantment(enchantmentType);
    }
  }
});

// ============================================================================
// Block Extensions
// ============================================================================

defineProperties(Block.prototype, {
  inventory: {
    get: function (): Container | undefined {
      return (this as Block).inventoryComponent?.container;
    },
    enumerable: true
  },
  inventoryComponent: {
    get: function (): BlockInventoryComponent | undefined {
      return (this as Block).getComponent(BlockComponentTypes.Inventory);
    },
    enumerable: true
  },
  getAdjacentBlocks: {
    value: function (): Block[] {
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
      return ofs.map(([dx, dy, dz]) => (this as Block).offset(new V3(dx, dy, dz))).filter((b): b is Block => b !== undefined);
    }
  },
  getAllStates: {
    value: function (): any {
      return (this as Block).permutation.getAllStates();
    }
  },
  getItems: {
    value: function (typeId?: string): Map<number, ItemStack> {
      const items = new Map<number, ItemStack>();
      const inv = (this as Block).inventory;
      if (!inv) return items;
      for (let i = 0; i < inv.size; i++) {
        const itm = inv.getItem(i);
        if (itm && (!typeId || itm.typeId === typeId)) {
          items.set(i, itm);
        }
      }
      return items;
    }
  },
  getState: {
    value: function (state: string): any {
      return (this as Block).permutation.getState(state as any);
    }
  },
  setState: {
    value: function (state: string, value: any): void {
      const perm = (this as Block).permutation.withState(state as any, value);
      (this as Block).setPermutation(perm);
    }
  },
  withState: {
    value: function (state: string, value: any): BlockPermutation {
      return (this as Block).permutation.withState(state as any, value);
    }
  }
});

// ============================================================================
// Player Extensions
// ============================================================================

defineProperties(Player.prototype, {
  gamemode: {
    get: function (): GameMode {
      return (this as Player).getGameMode();
    },
    set: function (gamemode: GameMode | string) {
      const player = this as Player;
      if (typeof gamemode === "string") {
        const key = gamemode.toLowerCase().trim();
        const gmMap: Record<string, GameMode> = {
          creative: GameMode.Creative,
          survival: GameMode.Survival,
          adventure: GameMode.Adventure,
          spectator: GameMode.Spectator
        };
        if (gmMap[key] !== undefined) {
          player.setGameMode(gmMap[key]);
          return;
        }
        for (const k of Object.keys(GameMode)) {
          if (k.toLowerCase() === key) {
            player.setGameMode((GameMode as any)[k]);
            return;
          }
        }
        return;
      }
      player.setGameMode(gamemode);
    },
    enumerable: true
  },
  ipCamera: {
    get: function (): boolean {
      return (this as Player).inputPermissions.isPermissionCategoryEnabled(InputPermissionCategory.Camera);
    },
    set: function (value: boolean) {
      (this as Player).inputPermissions.setPermissionCategory(InputPermissionCategory.Camera, value);
    }
  },
  isHudHidden: {
    value: function (hudElement: HudElement): boolean {
      return (this as Player).onScreenDisplay.isForcedHidden(hudElement);
    }
  },
  isInvulnerable: {
    get: function (): boolean {
      return (this as Player).gamemode === GameMode.Creative || (this as Player).gamemode === GameMode.Spectator;
    },
    enumerable: true
  },
  ipMovement: {
    get: function (): boolean {
      return (this as Player).inputPermissions.isPermissionCategoryEnabled(InputPermissionCategory.Movement);
    },
    set: function (value: boolean) {
      (this as Player).inputPermissions.setPermissionCategory(InputPermissionCategory.Movement, value);
    }
  },
  isUsingItem: {
    get: function (): boolean {
      return playersUsingItem.has((this as Player).id);
    },
    enumerable: true
  },
  xp: {
    get: function (): number {
      return (this as Player).getTotalXp();
    },
    set: function (value: number) {
      const player = this as Player;

      function calculateLevelFromXp(totalXp: number): { level: number; xpAtLevel: number } {
        if (totalXp < 0) totalXp = 0;

        let xp = 0;
        let level = 0;

        while (level < 16) {
          const xpNeeded = 7 + level * 2;
          if (xp + xpNeeded > totalXp) {
            return { level, xpAtLevel: totalXp - xp };
          }
          xp += xpNeeded;
          level++;
        }

        while (level < 31) {
          const xpNeeded = 37 + (level - 15) * 5;
          if (xp + xpNeeded > totalXp) {
            return { level, xpAtLevel: totalXp - xp };
          }
          xp += xpNeeded;
          level++;
        }

        while (true) {
          const xpNeeded = 112 + (level - 30) * 9;
          if (xp + xpNeeded > totalXp) {
            return { level, xpAtLevel: totalXp - xp };
          }
          xp += xpNeeded;
          level++;
        }
      }

      const target = calculateLevelFromXp(value);

      player.resetLevel();

      if (target.level > 0) {
        player.addLevels(target.level);
      }

      if (target.xpAtLevel > 0) {
        player.addExperience(target.xpAtLevel);
      }
    }
  },
  clearItem: {
    value: function (typeId: string, maxCount: string = "", data: number = -1): void {
      (this as Player).runCommand(`clear @s ${typeId} ${data} ${maxCount}`);
    }
  },
  damageItem: {
    value: function (slot: EquipmentSlot, damage: number = 1, ignoreUnbreaking = false): ItemStack | undefined {
      const eqSlot = (this as Player).equippableComponent?.getEquipmentSlot(slot);
      const item = eqSlot?.getItem();
      if (!item) return;

      let shouldDamage = true;

      if (!ignoreUnbreaking) {
        const unbreaking = item.getEnchantment(new EnchantmentType("minecraft:unbreaking"));
        const unbreakingLevel = unbreaking ? unbreaking.level : 0;
        const unbreakingChance = 1 / (unbreakingLevel + 1);
        shouldDamage = Math.random() < unbreakingChance;
      }

      if (shouldDamage) {
        item.durability -= damage;
        if (item.durability <= 0) {
          eqSlot?.setItem(undefined);
          (this as Player).dimension.playSound("random.break", (this as Player).location);
        } else {
          eqSlot?.setItem(item);
        }
      }

      return item;
    }
  },
  getItems: {
    value: function (typeId?: string): { equipments: Map<string, ItemStack>; inventory: Map<number, ItemStack> } {
      const eMap = new Map<string, ItemStack>();
      const slots: string[] = Object.values(EquipmentSlot).filter((value) => typeof value === "string");
      for (const slot of slots) {
        const item = (this as Player).getEquipment(slot as EquipmentSlot);
        if (item) {
          if (typeId) {
            if (item.typeId === typeId) eMap.set(slot, item);
          } else eMap.set(slot, item);
        }
      }
      const iMap = new Map<number, ItemStack>();
      const inv = (this as Player).inventory;
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
  getHiddenHud: {
    value: function (): HudElement[] {
      return (this as Player).onScreenDisplay.getHiddenHudElements();
    }
  },
  hideHudExcept: {
    value: function (hudElements?: HudElement[]): void {
      (this as Player).onScreenDisplay.hideAllExcept(hudElements);
    }
  },
  resetHud: {
    value: function (): void {
      (this as Player).onScreenDisplay.resetHudElementsVisibility();
    }
  },
  setActionBar: {
    value: function (rawMessage: string | RawMessage): void {
      (this as Player).onScreenDisplay.setActionBar(rawMessage);
    }
  },
  setFov: {
    value: function (value: number, easeOption?: EaseOptions): void {
      (this as Player).camera.setFov({ fov: value, easeOptions: easeOption });
    }
  },
  setHudVisibility: {
    value: function (visible: HudVisibility, hudElements?: HudElement[]): void {
      return (this as Player).onScreenDisplay.setHudVisibility(visible, hudElements);
    }
  },
  setTitle: {
    value: function (rawMessage: string, option?: TitleDisplayOptions): void {
      (this as Player).onScreenDisplay.setTitle(rawMessage, option);
    }
  },
  updateSubtitle: {
    value: function (rawMessage: string | RawMessage): void {
      (this as Player).onScreenDisplay.updateSubtitle(rawMessage);
    }
  },
  stopSound: {
    value: function (id: string): void {
      (this as Player).runCommand(`stopsound @s ${id}`);
    }
  }
});

// ============================================================================
// Entity Extensions
// ============================================================================

defineProperties(Entity.prototype, {
  chestItem: {
    get: function (): ItemStack | undefined {
      return (this as Entity).getEquipment?.(EquipmentSlot.Chest);
    },
    set: function (item: ItemStack | undefined) {
      (this as Entity).setEquipment?.(EquipmentSlot.Chest, item as any);
    }
  },
  chunk: {
    get: function (): V3 {
      return new V3(Math.floor((this as Entity).x / 16), Math.floor((this as Entity).y / 16), Math.floor((this as Entity).z / 16));
    }
  },
  coordinates: {
    get: function (): V3 {
      return new V3(Math.floor((this as Entity).x), Math.floor((this as Entity).y), Math.floor((this as Entity).z));
    },
    enumerable: true
  },
  cx: {
    get: function (): number {
      return (this as Entity).coordinates.x;
    },
    enumerable: true
  },
  cy: {
    get: function (): number {
      return (this as Entity).coordinates.y;
    },
    enumerable: true
  },
  cz: {
    get: function (): number {
      return (this as Entity).coordinates.z;
    },
    enumerable: true
  },
  equippableComponent: {
    get: function (): EntityEquippableComponent | undefined {
      return (this as Entity).getComponent(EntityComponentTypes.Equippable);
    },
    enumerable: true
  },
  feetItem: {
    get: function (): ItemStack | undefined {
      return (this as Entity).getEquipment?.(EquipmentSlot.Feet);
    },
    set: function (item: ItemStack | undefined) {
      (this as Entity).setEquipment?.(EquipmentSlot.Feet, item as any);
    }
  },
  headItem: {
    get: function (): ItemStack | undefined {
      return (this as Entity).getEquipment?.(EquipmentSlot.Head);
    },
    set: function (item: ItemStack | undefined) {
      (this as Entity).setEquipment?.(EquipmentSlot.Head, item as any);
    }
  },
  headLocation: {
    get: function (): V3 {
      return V3.extend((this as Entity).getHeadLocation());
    },
    enumerable: true
  },
  health: {
    get: function (): number {
      return (this as Entity).healthComponent?.currentValue || 0;
    },
    set: function (value: number) {
      return (this as Entity).healthComponent?.setCurrentValue(value);
    },
    enumerable: true
  },
  healthComponent: {
    get: function (): EntityHealthComponent | undefined {
      return (this as Entity).getComponent(EntityComponentTypes.Health);
    },
    enumerable: true
  },
  hx: {
    get: function (): number {
      return (this as Entity).headLocation.x;
    },
    enumerable: true
  },
  hy: {
    get: function (): number {
      return (this as Entity).headLocation.y;
    },
    enumerable: true
  },
  hz: {
    get: function (): number {
      return (this as Entity).headLocation.z;
    },
    enumerable: true
  },
  inventory: {
    get: function (): Container | undefined {
      return (this as Entity).inventoryComponent?.container;
    },
    enumerable: true
  },
  inventoryComponent: {
    get: function (): EntityInventoryComponent | undefined {
      return (this as Entity).getComponent(EntityComponentTypes.Inventory);
    },
    enumerable: true
  },
  isPlayer: {
    get: function (): boolean {
      return (this as Entity).typeId === "minecraft:player";
    },
    enumerable: true
  },
  isRiding: {
    get: function (): boolean {
      return (this as Entity).ridingComponent ? true : false;
    },
    enumerable: true
  },
  itemComponent: {
    get: function (): EntityItemComponent | undefined {
      return (this as Entity).getComponent(EntityComponentTypes.Item);
    },
    enumerable: true
  },
  legsItem: {
    get: function (): ItemStack | undefined {
      return (this as Entity).getEquipment?.(EquipmentSlot.Legs);
    },
    set: function (item: ItemStack | undefined) {
      (this as Entity).setEquipment?.(EquipmentSlot.Legs, item as any);
    }
  },
  mainHandItem: {
    get: function (): ItemStack | undefined {
      return (this as Entity).getEquipment?.(EquipmentSlot.Mainhand);
    },
    set: function (item: ItemStack | undefined) {
      (this as Entity).setEquipment?.(EquipmentSlot.Mainhand, item as any);
    }
  },
  maxHealth: {
    get: function (): number {
      return (this as Entity).healthComponent?.effectiveMax || 0;
    },
    enumerable: true
  },
  missingHealth: {
    get: function (): number {
      return (this as Entity).maxHealth - (this as Entity).health;
    },
    enumerable: true
  },
  movementComponent: {
    get: function (): EntityMovementComponent | undefined {
      return (this as Entity).getComponent(EntityComponentTypes.Movement);
    },
    enumerable: true
  },
  offhandItem: {
    get: function (): ItemStack | undefined {
      return (this as Entity).getEquipment?.(EquipmentSlot.Offhand);
    },
    set: function (item: ItemStack | undefined) {
      (this as Entity).setEquipment?.(EquipmentSlot.Offhand, item as any);
    }
  },
  projectileComponent: {
    get: function (): EntityProjectileComponent | undefined {
      return (this as Entity).getComponent(EntityComponentTypes.Projectile);
    },
    enumerable: true
  },
  projectileOwner: {
    get: function (): Entity | undefined {
      return (this as Entity).projectileComponent?.owner;
    },
    set: function (entity: Entity) {
      const comp = (this as Entity).projectileComponent;
      if (comp) comp.owner = entity;
    }
  },
  ride: {
    get: function (): Entity | undefined {
      return (this as Entity).ridingComponent?.entityRidingOn;
    },
    enumerable: true
  },
  ridingComponent: {
    get: function (): EntityRidingComponent | undefined {
      return (this as Entity).getComponent(EntityComponentTypes.Riding);
    },
    enumerable: true
  },
  rotation: {
    get: function (): V2 {
      return V2.extend((this as Entity).getRotation());
    },
    set: function (rotation: V2) {
      (this as Entity).setRotation(rotation);
    },
    enumerable: true
  },
  rx: {
    get: function (): number {
      return (this as Entity).rotation.x;
    },
    set: function (value: number) {
      (this as Entity).rotation.x = value;
    },
    enumerable: true
  },
  ry: {
    get: function (): number {
      return (this as Entity).rotation.y;
    },
    set: function (value: number) {
      (this as Entity).rotation.y = value;
    },
    enumerable: true
  },
  speed: {
    get: function (): number {
      return (this as Entity).movementComponent?.currentValue ?? 0;
    },
    set: function (value: number) {
      return (this as Entity).movementComponent?.setCurrentValue(value);
    },
    enumerable: true
  },
  tameableComponent: {
    get: function (): EntityTameableComponent | undefined {
      return (this as Entity).getComponent(EntityComponentTypes.Tameable);
    },
    enumerable: true
  },
  tameOwner: {
    get: function (): Entity | undefined {
      return (this as Entity).tameableComponent?.tamedToPlayer;
    },
    set: function (player: Player) {
      return (this as Entity).tameableComponent?.tame(player);
    }
  },
  typeFamilies: {
    get: function (): string[] {
      return (this as Entity).typeFamilyComponent?.getTypeFamilies() ?? [];
    }
  },
  typeFamilyComponent: {
    get: function (): EntityTypeFamilyComponent | undefined {
      return (this as Entity).getComponent(EntityComponentTypes.TypeFamily);
    },
    enumerable: true
  },
  vdx: {
    get: function (): number {
      return (this as Entity).viewDirection.x;
    },
    enumerable: true
  },
  vdy: {
    get: function (): number {
      return (this as Entity).viewDirection.y;
    },
    enumerable: true
  },
  vdz: {
    get: function (): number {
      return (this as Entity).viewDirection.z;
    },
    enumerable: true
  },
  velocity: {
    get: function (): V3 {
      return V3.extend((this as Entity).getVelocity());
    },
    enumerable: true
  },
  viewDirection: {
    get: function (): V3 {
      return V3.extend((this as Entity).getViewDirection());
    },
    enumerable: true
  },
  vx: {
    get: function (): number {
      return (this as Entity).velocity.x;
    },
    enumerable: true
  },
  vy: {
    get: function (): number {
      return (this as Entity).velocity.y;
    },
    enumerable: true
  },
  vz: {
    get: function (): number {
      return (this as Entity).velocity.z;
    },
    enumerable: true
  },
  addItem: {
    value: function (itemStack: ItemStack): ItemStack | undefined {
      return (this as Entity).inventoryComponent?.container.addItem(itemStack);
    }
  },
  commandRun: {
    value: function (...commands: (string | string[])[]): any {
      let result = { successCount: 0 };

      const flattenedCommands = commands.flat();

      flattenedCommands.forEach((command) => {
        const cr = (this as Entity).runCommand(command);
        if (cr.successCount > 0) result.successCount++;
      });
      return result;
    }
  },
  dispose: {
    value: function (): void {
      (this as Entity).remove();
    }
  },
  effectAdd: {
    value: function (effectName: string, durationInSeconds: number | string = 30, amplifier: number = 0, hideParticles: boolean = false): void {
      (this as Entity).runCommand(`effect @s ${effectName} ${durationInSeconds} ${amplifier} ${hideParticles}`);
    }
  },
  effectClear: {
    value: function (effectType: string | null = null): void {
      switch (typeof effectType) {
        case "undefined":
        case "object":
          (this as Entity).runCommand("effect @s clear");
          break;
        case "string":
          (this as Entity).runCommand(`effect @s ${effectType} 0`);
          break;
      }
    }
  },
  getEquipment: {
    value: function (slot: EquipmentSlot): ItemStack | undefined {
      return (this as Entity).equippableComponent?.getEquipment(slot);
    }
  },
  getFacingOffset: {
    value: function (distance: number, offset: V3 = new V3(0, 0, 0)): V3 {
      const view_dir = V3.extend((this as Entity).viewDirection);
      const right_dir = new V3(-view_dir.z, 0, view_dir.x);
      const normalized_right_dir = right_dir.normalized();
      const end = {
        x: view_dir.x * distance + normalized_right_dir.x * offset.x + offset.z,
        y: view_dir.y * distance + offset.y,
        z: view_dir.z * distance + normalized_right_dir.z * offset.x + offset.z
      };
      const headLoc = V3.extend((this as Entity).headLocation);
      return headLoc.offset(V3.extend(end));
    }
  },
  setEquipment: {
    value: function (slot: EquipmentSlot, item: ItemStack): boolean | undefined {
      return (this as Entity).equippableComponent?.setEquipment(slot, item);
    }
  },
  toItemStack: {
    value: function (): ItemStack | undefined {
      return (this as Entity).itemComponent?.itemStack;
    }
  }
});

// ============================================================================
// Container Extensions
// ============================================================================

defineProperties(Container.prototype, {
  forEachSlot: {
    value: function (cb: (slotObj: any, slotId: number) => void): void {
      for (let slotId = 0; slotId < (this as Container).size; slotId++) {
        const slotObj = (this as Container).getSlot(slotId);
        cb(slotObj, slotId);
      }
    }
  },
  getItems: {
    value: function (): Map<number, ItemStack> {
      const items = new Map<number, ItemStack>();
      (this as Container).forEachSlot((slot, id) => {
        const item = slot.getItem();
        if (item) items.set(id, item);
      });
      return items;
    }
  },
  transferAll: {
    value: function (to: Container): number {
      const from = this as Container;
      if (!to) return 0;

      let movedStacks = 0;

      for (let i = 0; i < from.size; i++) {
        const srcItem = from.getItem(i);
        if (!srcItem) continue;

        // Use the built-in transferItem which returns leftover when destination is full
        const leftover = from.transferItem(i, to);

        if (!leftover) {
          // fully moved
          movedStacks++;
        } else {
          // put leftover back into the same slot
          from.setItem(i, leftover);
        }
      }

      return movedStacks;
    }
  },
  sort: {
    value: function (cb: (a: ItemStack, b: ItemStack) => number): void {
      const items: { slot: number; item: ItemStack }[] = [];
      for (let i = 0; i < (this as Container).size; i++) {
        const item = (this as Container).getItem(i);
        if (item) {
          items.push({ slot: i, item });
        }
      }
      items.sort((a, b) => cb(a.item, b.item));
      for (let i = 0; i < (this as Container).size; i++) {
        (this as Container).setItem(i, undefined);
      }
      items.forEach(({ item }, index) => {
        (this as Container).setItem(index, item);
      });
    }
  }
});

// ============================================================================
// BlockPermutation Extensions
// ============================================================================

defineProperties(BlockPermutation.prototype, {
  typeId: {
    get: function (): string {
      return (this as BlockPermutation).type.id;
    }
  },
  setState: {
    value: function (state: string, value: any): BlockPermutation {
      return (this as BlockPermutation).withState(state as any, value);
    }
  }
});

// ============================================================================
// ScriptEventCommandMessageAfterEvent Extensions
// ============================================================================

defineProperties(ScriptEventCommandMessageAfterEvent.prototype, {
  source: {
    get: function (): Block | Entity | undefined {
      switch ((this as ScriptEventCommandMessageAfterEvent).sourceType) {
        case ScriptEventSource.Block:
          return (this as ScriptEventCommandMessageAfterEvent).sourceBlock;
        case ScriptEventSource.Entity:
          return (this as ScriptEventCommandMessageAfterEvent).sourceEntity;
        case ScriptEventSource.NPCDialogue:
          return (this as ScriptEventCommandMessageAfterEvent).initiator;
        default:
          return undefined;
      }
    },
    enumerable: true
  }
});

// ============================================================================
// CustomCommandOrigin Extensions
// ============================================================================

defineProperties(CustomCommandOrigin.prototype, {
  source: {
    get: function (): Block | Entity | undefined {
      // see extension.ts for getter logic
      switch ((this as CustomCommandOrigin).sourceType) {
        case CustomCommandSource.Block:
          return (this as CustomCommandOrigin).sourceBlock;
        case CustomCommandSource.Entity:
          return (this as CustomCommandOrigin).sourceEntity;
        case CustomCommandSource.NPCDialogue:
          return (this as CustomCommandOrigin).initiator;
        default:
          return undefined;
      }
    },
    enumerable: true
  }
});

// ============================================================================
// Dimension Extensions
// ============================================================================

defineProperties(Dimension.prototype, {
  weather: {
    get: function (): WeatherType | undefined {
      // get current weather
      const eventId = world.getTimeOfDay();
      const weatherTypes: string[] = Object.values(WeatherType);
      for (const weatherType of weatherTypes) {
        (this as Dimension).setWeather(weatherType as WeatherType, eventId);
        if (weatherData.has(eventId)) {
          const currentWeather = weatherData.get(eventId);
          weatherData.delete(eventId);
          return currentWeather;
        }
      }
      return undefined;
    },
    set: function (v: WeatherOptions) {
      (this as Dimension).setWeather(v.type, v.duration);
    }
  },
  commandRun: {
    value: function (...commands: (string | string[])[]): any {
      let result = { successCount: 0 };

      const flattenedCommands = commands.flat();

      flattenedCommands.forEach((command) => {
        const cr = (this as Dimension).runCommand(command);
        if (cr.successCount > 0) result.successCount++;
      });
      return result;
    }
  }
});
