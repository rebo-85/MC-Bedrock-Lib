import {
  Dimension,
  Entity,
  BlockPermutation,
  Player,
  WorldAfterEvents,
  EntityComponentTypes,
  Container,
  ItemStack,
  World,
  Block,
  ItemComponentTypes,
  ScriptEventCommandMessageAfterEvent,
  CustomCommandSource,
  ScriptEventSource,
  EquipmentSlot,
  GameMode,
  DimensionTypes,
  BlockComponentTypes,
  BlockTypes,
  WeatherType,
  world,
  InputPermissionCategory,
  ItemEnchantableComponent,
  EnchantmentSlot,
  EnchantmentType,
  Enchantment,
  ItemDurabilityComponent,
  EntityInventoryComponent,
  BlockInventoryComponent,
  EntityProjectileComponent,
  EntityItemComponent,
  EntityRidingComponent,
  EntityMovementComponent,
  EntityHealthComponent,
  EntityEquippableComponent,
  EntityTameableComponent,
  RawMessage,
  EntityTypeFamilyComponent,
  CustomCommandOrigin,
} from "@minecraft/server";
import {
  PlayerJumpAfterEventSignal,
  PlayerStartJumpingAfterEventSignal,
  PlayerStopJumpingAfterEventSignal,
  EntityUnsneakAfterEventSignal,
  PlayerOnAirJumpAfterEventSignal,
  PlayerOnEquipAfterEventSignal,
  PlayerOnUnequipAfterEventSignal,
  EntityOnGroundAfterEventSignal,
  EntitySneakAfterEventSignal,
} from "./classes/index";

import { Vector3, Vector2 } from "./classes/index";

import { arraysEqual, defineProperties } from "./utils";
import { playersUsingItem, weatherTracker } from "./events";

// WorldAfterEvents
defineProperties(WorldAfterEvents.prototype, {
  entitySneak: {
    get: function (): EntitySneakAfterEventSignal {
      return new EntitySneakAfterEventSignal();
    },
  },
  entityUnsneak: {
    get: function (): EntityUnsneakAfterEventSignal {
      return new EntityUnsneakAfterEventSignal();
    },
  },
  entityOnGround: {
    get: function (): EntityOnGroundAfterEventSignal {
      return new EntityOnGroundAfterEventSignal();
    },
  },
  playerOnAirJump: {
    get: function (): PlayerOnAirJumpAfterEventSignal {
      return new PlayerOnAirJumpAfterEventSignal();
    },
  },
  playerOnEquip: {
    get: function (): PlayerOnEquipAfterEventSignal {
      return new PlayerOnEquipAfterEventSignal();
    },
  },
  playerOnUnequip: {
    get: function (): PlayerOnUnequipAfterEventSignal {
      return new PlayerOnUnequipAfterEventSignal();
    },
  },
  playerJump: {
    get: function (): PlayerJumpAfterEventSignal {
      return new PlayerJumpAfterEventSignal();
    },
  },
  playerStartJumping: {
    get: function (): PlayerStartJumpingAfterEventSignal {
      return new PlayerStartJumpingAfterEventSignal();
    },
  },
  playerStopJumping: {
    get: function (): PlayerStopJumpingAfterEventSignal {
      return new PlayerStopJumpingAfterEventSignal();
    },
  },
});

// World
defineProperties(World.prototype, {
  end: {
    get: function (): Dimension {
      return (this as World).getDimension("minecraft:the_end");
    },
    enumerable: true,
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
    },
  },
  nether: {
    get: function (): Dimension {
      return (this as World).getDimension("minecraft:nether");
    },
    enumerable: true,
  },
  overworld: {
    get: function (): Dimension {
      return (this as World).getDimension("minecraft:overworld");
    },
    enumerable: true,
  },
  players: {
    get: function (): Player[] {
      return (this as World).getAllPlayers();
    },
    enumerable: true,
  },
});

// ItemStack
defineProperties(ItemStack.prototype, {
  addEnchantment: {
    value: function (...enchantments: Enchantment[]): void {
      const enchantmentList = enchantments.flat();
      enchantmentList.forEach((ench: any) => (this as ItemStack).enchantableComponent?.addEnchantments(ench));
    },
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
    },
  },
  durability: {
    get: function (): number {
      return (this as ItemStack).durabilityComponent?.maxDurability ?? 0;
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
    enumerable: true,
  },
  durabilityComponent: {
    get: function (): ItemDurabilityComponent | undefined {
      return (this as ItemStack).getComponent(ItemComponentTypes.Durability);
    },
    enumerable: true,
  },
  enchantableComponent: {
    get: function (): ItemEnchantableComponent | undefined {
      return (this as ItemStack).getComponent(ItemComponentTypes.Enchantable);
    },
    enumerable: true,
  },
  enchantmentSlots: {
    get: function (): EnchantmentSlot[] | undefined {
      return (this as ItemStack).enchantableComponent?.slots;
    },
    enumerable: true,
  },
  getEnchantment: {
    value: function (enchantmentType: EnchantmentType): Enchantment | undefined {
      return (this as ItemStack).enchantableComponent?.getEnchantment(enchantmentType);
    },
  },
  hasEnchantment: {
    value: function (enchantmentType: EnchantmentType): boolean {
      return !!(this as ItemStack).enchantableComponent?.hasEnchantment(enchantmentType);
    },
  },
  isVanillaBlock: {
    get: function (): boolean {
      return !!BlockTypes.get((this as ItemStack).typeId);
    },
  },
  removeAllEnchantments: {
    value: function (): void {
      return (this as ItemStack).enchantableComponent?.removeAllEnchantments();
    },
  },
  removeEnchantment: {
    value: function (enchantmentType: EnchantmentType): void {
      return (this as ItemStack).enchantableComponent?.removeEnchantment(enchantmentType);
    },
  },
});

// Block
defineProperties(Block.prototype, {
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
        [1, 1, 1],
      ];
      return ofs
        .map(([dx, dy, dz]) => (this as Block).offset(new Vector3(dx, dy, dz)))
        .filter((b): b is Block => b !== undefined);
    },
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
    },
  },
  getState: {
    value: function (state: string): any {
      return (this as Block).permutation.getState(state as any);
    },
  },
  inventory: {
    get: function (): Container | undefined {
      return (this as Block).inventoryComponent?.container;
    },
    enumerable: true,
  },
  inventoryComponent: {
    get: function (): BlockInventoryComponent | undefined {
      return (this as Block).getComponent(BlockComponentTypes.Inventory);
    },
    enumerable: true,
  },
  setState: {
    value: function (state: string, value: any): void {
      const perm = (this as Block).permutation.withState(state as any, value);
      (this as Block).setPermutation(perm);
    },
  },
});

// Player
defineProperties(Player.prototype, {
  clearItem: {
    value: function (typeId: string, maxCount: string = "", data: number = -1): void {
      (this as Player).runCommand(`clear @s ${typeId} ${data} ${maxCount}`);
    },
  },
  damageItem: {
    value: function (slot: EquipmentSlot, damage: number = 1): ItemStack | undefined {
      // unbreaking
      const eqSlot = (this as Player).equippableComponent?.getEquipmentSlot(slot);
      const item = eqSlot?.getItem();
      if (!item) return;
      const unbreaking = item.getEnchantment({ id: "unbreakind" } as EnchantmentType);
      const unbreakingLevel = unbreaking ? unbreaking.level : 0;
      const unbreakingChance = 1 / (unbreakingLevel + 1);
      if (Math.random() < unbreakingChance && (this as Player).gamemode !== GameMode.Creative) {
        item.durability -= damage;
        if (item.durability <= 0) {
          eqSlot?.setItem(undefined);
          (this as Player).dimension.playSound("random.break", (this as Player).location);
        } else {
          eqSlot?.setItem(item);
        }
      }
      return item;
    },
  },
  gamemode: {
    get: function (): GameMode {
      return (this as Player).getGameMode();
    },
    set: function (gamemode: GameMode) {
      (this as Player).setGameMode(gamemode);
    },
    enumerable: true,
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
    },
  },
  ipCamera: {
    get: function (): boolean {
      return (this as Player).inputPermissions.isPermissionCategoryEnabled(InputPermissionCategory.Camera);
    },
    set: function (value: boolean) {
      (this as Player).inputPermissions.setPermissionCategory(InputPermissionCategory.Camera, value);
    },
  },
  ipMovement: {
    get: function (): boolean {
      return (this as Player).inputPermissions.isPermissionCategoryEnabled(InputPermissionCategory.Movement);
    },
    set: function (value: boolean) {
      (this as Player).inputPermissions.setPermissionCategory(InputPermissionCategory.Movement, value);
    },
  },
  isInvulnerable: {
    get: function (): boolean {
      return (this as Player).gamemode === GameMode.Creative || (this as Player).gamemode === GameMode.Spectator;
    },
    enumerable: true,
  },
  isUsingItem: {
    get: function (): boolean {
      return playersUsingItem.has((this as Player).id);
    },
    enumerable: true,
  },
  setActionBar: {
    value: function (rawMessage: string | RawMessage): void {
      (this as Player).onScreenDisplay.setActionBar(rawMessage);
    },
  },
  setTitle: {
    value: function (rawMessage: string, option?: any): void {
      (this as Player).onScreenDisplay.setTitle(rawMessage, option);
    },
  },
  stopSound: {
    value: function (id: string): void {
      (this as Player).runCommand(`stopsound @s ${id}`);
    },
  },
});

// Entity
defineProperties(Entity.prototype, {
  equippableComponent: {
    get: function (): EntityEquippableComponent | undefined {
      return (this as Entity).getComponent(EntityComponentTypes.Equippable);
    },
    enumerable: true,
  },
  healthComponent: {
    get: function (): EntityHealthComponent | undefined {
      return (this as Entity).getComponent(EntityComponentTypes.Health);
    },
    enumerable: true,
  },
  inventoryComponent: {
    get: function (): EntityInventoryComponent | undefined {
      return (this as Entity).getComponent(EntityComponentTypes.Inventory);
    },
    enumerable: true,
  },
  itemComponent: {
    get: function (): EntityItemComponent | undefined {
      return (this as Entity).getComponent(EntityComponentTypes.Item);
    },
    enumerable: true,
  },
  movementComponent: {
    get: function (): EntityMovementComponent | undefined {
      return (this as Entity).getComponent(EntityComponentTypes.Movement);
    },
    enumerable: true,
  },
  projectileComponent: {
    get: function (): EntityProjectileComponent | undefined {
      return (this as Entity).getComponent(EntityComponentTypes.Projectile);
    },
    enumerable: true,
  },
  tameableComponent: {
    get: function (): EntityTameableComponent | undefined {
      return (this as Entity).getComponent(EntityComponentTypes.Tameable);
    },
    enumerable: true,
  },
  typeFamilyComponent: {
    get: function (): EntityTypeFamilyComponent | undefined {
      return (this as Entity).getComponent(EntityComponentTypes.TypeFamily);
    },
    enumerable: true,
  },
  //
  typeFamilies: {
    get: function (): string[] {
      return (this as Entity).typeFamilyComponent?.getTypeFamilies() ?? [];
    },
  },
  addItem: {
    value: function (itemStack: ItemStack): void {
      (this as Entity).inventory?.addItem(itemStack);
    },
  },
  chunk: {
    get: function (): Vector3 {
      return new Vector3(
        Math.floor((this as Entity).x / 16),
        Math.floor((this as Entity).y / 16),
        Math.floor((this as Entity).z / 16)
      );
    },
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
    },
  },
  coordinates: {
    get: function (): Vector3 {
      return new Vector3(
        Math.floor((this as Entity).x),
        Math.floor((this as Entity).y),
        Math.floor((this as Entity).z)
      );
    },
    enumerable: true,
  },
  dispose: {
    value: function (): void {
      (this as Entity).remove();
    },
  },
  effectAdd: {
    value: function (
      effectName: string,
      durationInSeconds: number = 30,
      amplifier: number = 0,
      hideParticles: boolean = false
    ): void {
      (this as Entity).runCommand(`effect @s ${effectName} ${durationInSeconds} ${amplifier} ${hideParticles}`);
    },
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
    },
  },
  getEquipment: {
    value: function (slot: EquipmentSlot): ItemStack | undefined {
      return (this as Entity).equippableComponent?.getEquipment(slot);
    },
  },
  getFacingOffset: {
    value: function (distance: number, offset: Vector3 = new Vector3(0, 0, 0)): Vector3 {
      const view_dir = Vector3.extend((this as Entity).viewDirection);
      const right_dir = new Vector3(-view_dir.z, 0, view_dir.x);
      const normalized_right_dir = right_dir.normalized();
      const end = {
        x: view_dir.x * distance + normalized_right_dir.x * offset.x + offset.z,
        y: view_dir.y * distance + offset.y,
        z: view_dir.z * distance + normalized_right_dir.z * offset.x + offset.z,
      };
      const headLoc = Vector3.extend((this as Entity).headLocation);
      return headLoc.offset(Vector3.extend(end));
    },
  },
  headLocation: {
    get: function (): Vector3 {
      return Vector3.extend((this as Entity).getHeadLocation());
    },
    enumerable: true,
  },
  health: {
    get: function (): number {
      return (this as Entity).healthComponent?.currentValue || 0;
    },
    set: function (value: number) {
      return (this as Entity).healthComponent?.setCurrentValue(value);
    },
    enumerable: true,
  },
  hx: {
    get: function (): number {
      return (this as Entity).headLocation.x;
    },
    enumerable: true,
  },
  hy: {
    get: function (): number {
      return (this as Entity).headLocation.y;
    },
    enumerable: true,
  },
  hz: {
    get: function (): number {
      return (this as Entity).headLocation.z;
    },
    enumerable: true,
  },
  inventory: {
    get: function (): Container | undefined {
      return (this as Entity).inventoryComponent?.container;
    },
    enumerable: true,
  },
  isPlayer: {
    get: function (): boolean {
      return (this as Entity).typeId === "minecraft:player";
    },
    enumerable: true,
  },
  isRiding: {
    get: function (): boolean {
      return (this as Entity).ridingComponent ? true : false;
    },
    enumerable: true,
  },
  maxHealth: {
    get: function (): number {
      return (this as Entity).healthComponent?.effectiveMax || 0;
    },
    enumerable: true,
  },
  missingHealth: {
    get: function (): number {
      return (this as Entity).maxHealth - (this as Entity).health;
    },
    enumerable: true,
  },
  projectileOwner: {
    get: function (): Entity | undefined {
      return (this as Entity).projectileComponent?.owner;
    },
    set: function (entity: Entity) {
      const comp = (this as Entity).projectileComponent;
      if (comp) comp.owner = entity;
    },
  },
  ride: {
    get: function (): Entity | undefined {
      return (this as Entity).ridingComponent?.entityRidingOn;
    },
    enumerable: true,
  },
  ridingComponent: {
    get: function (): EntityRidingComponent | undefined {
      return (this as Entity).getComponent(EntityComponentTypes.Riding);
    },
    enumerable: true,
  },
  rotation: {
    get: function (): Vector2 {
      return Vector2.extend((this as Entity).getRotation());
    },
    set: function (rotation: Vector2) {
      (this as Entity).setRotation(rotation);
    },
    enumerable: true,
  },
  setEquipment: {
    value: function (slot: EquipmentSlot, item: ItemStack): boolean | undefined {
      return (this as Entity).equippableComponent?.setEquipment(slot, item);
    },
  },
  setMainhand: {
    value: function (item: ItemStack | undefined) {
      this.setEquipment?.(EquipmentSlot.Mainhand, item);
    },
  },
  setOffhand: {
    value: function (item: ItemStack | undefined) {
      this.setEquipment?.(EquipmentSlot.Offhand, item);
    },
  },
  setHead: {
    value: function (item: ItemStack | undefined) {
      this.setEquipment?.(EquipmentSlot.Head, item);
    },
  },
  setChest: {
    value: function (item: ItemStack | undefined) {
      this.setEquipment?.(EquipmentSlot.Chest, item);
    },
  },
  setLegs: {
    value: function (item: ItemStack | undefined) {
      this.setEquipment?.(EquipmentSlot.Legs, item);
    },
  },
  setFeet: {
    value: function (item: ItemStack | undefined) {
      this.setEquipment?.(EquipmentSlot.Feet, item);
    },
  },
  speed: {
    get: function (): number {
      return (this as Entity).movementComponent?.currentValue ?? 0;
    },
    set: function (value: number) {
      return (this as Entity).movementComponent?.setCurrentValue(value);
    },
    enumerable: true,
  },
  tameOwner: {
    get: function (): Entity | undefined {
      return (this as Entity).tameableComponent?.tamedToPlayer;
    },
    set: function (player: Player) {
      return (this as Entity).tameableComponent?.tame(player);
    },
  },
  toItemStack: {
    value: function (): ItemStack | undefined {
      return (this as Entity).itemComponent?.itemStack;
    },
  },
  velocity: {
    get: function (): Vector3 {
      return Vector3.extend((this as Entity).getVelocity());
    },
    enumerable: true,
  },
  viewDirection: {
    get: function (): Vector3 {
      return Vector3.extend((this as Entity).getViewDirection());
    },
    enumerable: true,
  },
  // axis/coord
  cx: {
    get: function (): number {
      return (this as Entity).coordinates.x;
    },
    enumerable: true,
  },
  cy: {
    get: function (): number {
      return (this as Entity).coordinates.y;
    },
    enumerable: true,
  },
  cz: {
    get: function (): number {
      return (this as Entity).coordinates.z;
    },
    enumerable: true,
  },
  x: {
    get: function (): number {
      return (this as Entity).location.x;
    },
    set: function (x: number) {
      const location = (this as Entity).location;
      location.x = x;
      (this as Entity).teleport(location);
    },
    enumerable: true,
  },
  y: {
    get: function (): number {
      return (this as Entity).location.y;
    },
    set: function (y: number) {
      const location = (this as Entity).location;
      location.y = y;
      (this as Entity).teleport(location);
    },
    enumerable: true,
  },
  z: {
    get: function (): number {
      return (this as Entity).location.z;
    },
    set: function (z: number) {
      const location = (this as Entity).location;
      location.z = z;
      (this as Entity).teleport(location);
    },
    enumerable: true,
  },
  rx: {
    get: function (): number {
      return (this as Entity).rotation.x;
    },
    set: function (rx: number) {
      const rotation = (this as Entity).rotation;
      rotation.x = rx;
      (this as Entity).setRotation(rotation);
    },
    enumerable: true,
  },
  ry: {
    get: function (): number {
      return (this as Entity).rotation.y;
    },
    set: function (ry: number) {
      const rotation = (this as Entity).rotation;
      rotation.y = ry;
      (this as Entity).setRotation(rotation);
    },
    enumerable: true,
  },
  vx: {
    get: function (): number {
      return (this as Entity).velocity.x;
    },
    enumerable: true,
  },
  vy: {
    get: function (): number {
      return (this as Entity).velocity.y;
    },
    enumerable: true,
  },
  vz: {
    get: function (): number {
      return (this as Entity).velocity.z;
    },
    enumerable: true,
  },
  vdx: {
    get: function (): number {
      return (this as Entity).viewDirection.x;
    },
    enumerable: true,
  },
  vdy: {
    get: function (): number {
      return (this as Entity).viewDirection.y;
    },
    enumerable: true,
  },
  vdz: {
    get: function (): number {
      return (this as Entity).viewDirection.z;
    },
    enumerable: true,
  },
});

// Container
defineProperties(Container.prototype, {
  forEachSlot: {
    value: function (cb: (slotObj: any, slotId: number) => void): void {
      for (let slotId = 0; slotId < (this as Container).size; slotId++) {
        const slotObj = (this as Container).getSlot(slotId);
        cb(slotObj, slotId);
      }
    },
  },
  getItems: {
    value: function (): Map<number, ItemStack> {
      const items = new Map<number, ItemStack>();
      (this as Container).forEachSlot((slot, id) => {
        const item = slot.getItem();
        if (item) items.set(id, item);
      });
      return items;
    },
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
    },
  },
});

// BlockPermutation
defineProperties(BlockPermutation.prototype, {
  getState: {
    value: function (state: string): any {
      return (this as BlockPermutation).getAllStates()[state];
    },
  },
  setState: {
    value: function (state: string, value: any): BlockPermutation {
      return BlockPermutation.resolve((this as BlockPermutation).type.id, {
        ...(this as BlockPermutation).getAllStates(),
        [state]: value,
      });
    },
  },
});

// ScriptEventCommandMessageAfterEvent
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
    enumerable: true,
  },
});

// CustomCommandOrigin
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
    enumerable: true,
  },
});

// Dimension
defineProperties(Dimension.prototype, {
  commandRun: {
    value: function (...commands: (string | string[])[]): any {
      let result = { successCount: 0 };

      const flattenedCommands = commands.flat();

      flattenedCommands.forEach((command) => {
        const cr = (this as Dimension).runCommand(command);
        if (cr.successCount > 0) result.successCount++;
      });
      return result;
    },
  },
  weather: {
    get: function (): WeatherType | undefined {
      // get current weather
      const eventId = world.getTimeOfDay();
      const weatherTypes: string[] = Object.values(WeatherType);
      for (const weatherType of weatherTypes) {
        (this as Dimension).setWeather(weatherType as WeatherType, eventId);
        if (weatherTracker.has(eventId)) {
          const currentWeather = weatherTracker.get(eventId);
          weatherTracker.delete(eventId);
          return currentWeather;
        }
      }
      return undefined;
    },
    set: function (v: { type: WeatherType; duration: number }) {
      (this as Dimension).setWeather(v.type, v.duration);
    },
  },
});
