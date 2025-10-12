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
} from "@minecraft/server";
import {
  Vector2,
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
  CommandResult,
} from "./classes";
import { runCommand, arraysEqual, defineProperties } from "./utils";
import { playersUsingItem, weatherTracker } from "./events";

// WorldAfterEvents
defineProperties(WorldAfterEvents.prototype, {
  entityJump: {
    get: function (): EntityJumpAfterEventSignal {
      return new EntityJumpAfterEventSignal();
    },
  },
  entityStartJumping: {
    get: function (): EntityStartJumpingAfterEventSignal {
      return new EntityStartJumpingAfterEventSignal();
    },
  },
  entityStopJumping: {
    get: function (): EntityStopJumpingAfterEventSignal {
      return new EntityStopJumpingAfterEventSignal();
    },
  },
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
  playerOnAirJump: {
    get: function (): PlayerOnAirJumpAfterEventSignal {
      return new PlayerOnAirJumpAfterEventSignal();
    },
  },
  playerOnLand: {
    get: function (): PlayerOnLandAfterEventSignal {
      return new PlayerOnLandAfterEventSignal();
    },
  },
  playerOnUnequip: {
    get: function (): PlayerOnUnequipAfterEventSignal {
      return new PlayerOnUnequipAfterEventSignal();
    },
  },
  playerOnEquip: {
    get: function (): PlayerOnEquipAfterEventSignal {
      return new PlayerOnEquipAfterEventSignal();
    },
  },
});

defineProperties(World.prototype, {
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
  players: {
    get: function (): Player[] {
      return (this as World).getAllPlayers();
    },
    enumerable: true,
  },
  end: {
    get: function (): Dimension {
      return (this as World).getDimension("minecraft:the_end");
    },
    enumerable: true,
  },
  overworld: {
    get: function (): Dimension {
      return (this as World).getDimension("minecraft:overworld");
    },
    enumerable: true,
  },
  nether: {
    get: function (): Dimension {
      return (this as World).getDimension("minecraft:nether");
    },
    enumerable: true,
  },
});

// ItemStack
defineProperties(ItemStack.prototype, {
  isVanillaBlock: {
    get: function (): boolean {
      return !!BlockTypes.get((this as ItemStack).typeId);
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
  addEnchantment: {
    value: function (...enchantments: any[]): void {
      const enchantmentList = enchantments.flat();
      enchantmentList.forEach((ench: any) => (this as ItemStack).enchantableComponent?.addEnchantments(ench));
    },
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
  removeEnchantment: {
    value: function (enchantmentType: EnchantmentType): void {
      return (this as ItemStack).enchantableComponent?.removeEnchantment(enchantmentType);
    },
  },
  removeAllEnchantments: {
    value: function (): void {
      return (this as ItemStack).enchantableComponent?.removeAllEnchantments();
    },
  },
  durabilityComponent: {
    get: function (): ItemDurabilityComponent | undefined {
      return (this as ItemStack).getComponent(ItemComponentTypes.Durability);
    },
    enumerable: true,
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
  getState: {
    value: function (state: string): any {
      return (this as Block).permutation.getState(state as any);
    },
  },
  setState: {
    value: function (state: string, value: any): void {
      const perm = (this as Block).permutation.withState(state as any, value);
      (this as Block).setPermutation(perm);
    },
  },
  inventoryComponent: {
    get: function (): BlockInventoryComponent | undefined {
      return (this as Block).getComponent(BlockComponentTypes.Inventory);
    },
    enumerable: true,
  },
  inventory: {
    get: function (): Container | undefined {
      return (this as Block).inventoryComponent?.container;
    },
    enumerable: true,
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
});

// Player
defineProperties(Player.prototype, {
  isMortal: {
    get: function (): boolean {
      return (this as Player).gamemode === GameMode.Survival || (this as Player).gamemode === GameMode.Adventure;
    },
    enumerable: true,
  },
  clearItem: {
    value: function (typeId: string, maxCount: string = "", data: number = -1): void {
      (this as Player).runCommand(`clear @s ${typeId} ${data} ${maxCount}`);
    },
  },
  isUsingItem: {
    get: function (): boolean {
      return playersUsingItem.has((this as Player).id);
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
  damageItem: {
    value: function (slot: EquipmentSlot, damage: number = 1): ItemStack | undefined {
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
  stopSound: {
    value: function (id: string): void {
      (this as Player).runCommand(`stopsound @s ${id}`);
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
  setActionBar: {
    value: function (rawMessage: string): void {
      (this as Player).onScreenDisplay.setActionBar(rawMessage);
    },
  },
  setTitle: {
    value: function (rawMessage: string, option?: any): void {
      (this as Player).onScreenDisplay.setTitle(rawMessage, option);
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
  ipCamera: {
    get: function (): boolean {
      return (this as Player).inputPermissions.isPermissionCategoryEnabled(InputPermissionCategory.Camera);
    },
    set: function (value: boolean) {
      (this as Player).inputPermissions.setPermissionCategory(InputPermissionCategory.Camera, value);
    },
  },
});

// Define Entity methods
defineProperties(Entity.prototype, {
  commandRun: {
    value: function (...commands: string[]): CommandResult {
      return runCommand.call(this as Entity, Entity, ...commands);
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
  sendMolang: {
    value: function (molang: string): void {
      (this as Entity).playAnimation("animation.common.look_at_target", { stopExpression: `${molang} return true;` });
    },
  },
  projectileComponent: {
    get: function (): EntityProjectileComponent | undefined {
      return (this as Entity).getComponent(EntityComponentTypes.Projectile);
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
  itemComponent: {
    get: function (): EntityItemComponent | undefined {
      return (this as Entity).getComponent(EntityComponentTypes.Item);
    },
    enumerable: true,
  },
  toItemStack: {
    value: function (): ItemStack | undefined {
      return (this as Entity).itemComponent?.itemStack;
    },
  },
  headLocation: {
    get: function (): Vector3 {
      const hl = (this as Entity).getHeadLocation();
      return new Vector3(hl.x, hl.y, hl.z);
    },
    enumerable: true,
  },
  viewDirection: {
    get: function (): Vector3 {
      const v = (this as Entity).getViewDirection();
      return new Vector3(v.x, v.y, v.z);
    },
    enumerable: true,
  },
  isPlayer: {
    get: function (): boolean {
      return (this as Entity).typeId === "minecraft:player";
    },
    enumerable: true,
  },
  ridingComponent: {
    get: function (): EntityRidingComponent | undefined {
      return (this as Entity).getComponent(EntityComponentTypes.Riding);
    },
    enumerable: true,
  },
  ride: {
    get: function (): Entity | undefined {
      return (this as Entity).ridingComponent?.entityRidingOn;
    },
    enumerable: true,
  },
  isRiding: {
    get: function (): boolean {
      return (this as Entity).ridingComponent ? true : false;
    },
    enumerable: true,
  },
  movementComponent: {
    get: function (): EntityMovementComponent | undefined {
      return (this as Entity).getComponent(EntityComponentTypes.Movement);
    },
    enumerable: true,
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
  getFacingOffset: {
    value: function (distance: number, offset: Vector3 = new Vector3(0, 0, 0)): Vector3 {
      const view_dir = new Vector3((this as Entity).vdx, (this as Entity).vdy, (this as Entity).vdz);
      const right_dir = new Vector3(-view_dir.z, 0, view_dir.x);
      const normalized_right_dir = right_dir.normalized();
      const end = {
        x: view_dir.x * distance + normalized_right_dir.x * offset.x + offset.z,
        y: view_dir.y * distance + offset.y,
        z: view_dir.z * distance + normalized_right_dir.z * offset.x + offset.z,
      };
      const head_loc = new Vector3((this as Entity).hx, (this as Entity).hy, (this as Entity).hz);
      return head_loc.offset(end.x, end.y, end.z);
    },
  },
  healthComponent: {
    get: function (): EntityHealthComponent | undefined {
      return (this as Entity).getComponent(EntityComponentTypes.Health);
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
  dispose: {
    value: function (): void {
      (this as Entity).remove();
    },
  },
  equippableComponent: {
    get: function (): EntityEquippableComponent | undefined {
      return (this as Entity).getComponent(EntityComponentTypes.Equippable);
    },
    enumerable: true,
  },
  getEquipment: {
    value: function (slot: EquipmentSlot): ItemStack | undefined {
      return (this as Entity).equippableComponent?.getEquipment(slot);
    },
  },
  setEquipment: {
    value: function (slot: EquipmentSlot, item: ItemStack): any {
      return (this as Entity).equippableComponent?.setEquipment(slot, item);
    },
  },
  inventoryComponent: {
    get: function (): EntityInventoryComponent | undefined {
      return (this as Entity).getComponent(EntityComponentTypes.Inventory);
    },
    enumerable: true,
  },
  inventory: {
    get: function (): Container | undefined {
      return (this as Entity).inventoryComponent?.container;
    },
    enumerable: true,
  },
  addItem: {
    value: function (itemStack: ItemStack): void {
      (this as Entity).inventory?.addItem(itemStack);
    },
  },
  tameableComponent: {
    get: function (): EntityTameableComponent | undefined {
      return (this as Entity).getComponent(EntityComponentTypes.Tameable);
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
  rotation: {
    get: function (): Vector2 {
      return new Vector2((this as Entity).getRotation().x, (this as Entity).getRotation().y);
    },
    set: function (rotation: Vector2) {
      (this as Entity).setRotation(rotation);
    },
    enumerable: true,
  },
  velocity: {
    get: function (): Vector3 {
      return new Vector3((this as Entity).getVelocity());
    },
    enumerable: true,
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

// BlockPermutation methods
defineProperties(BlockPermutation.prototype, {
  setState: {
    value: function (state: string, value: any): BlockPermutation {
      return BlockPermutation.resolve((this as BlockPermutation).type.id, {
        ...(this as BlockPermutation).getAllStates(),
        [state]: value,
      });
    },
  },
  getState: {
    value: function (state: string): any {
      return (this as BlockPermutation).getAllStates()[state];
    },
  },
});

defineProperties(ScriptEventCommandMessageAfterEvent.prototype, {
  source: {
    get: function (): any {
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

defineProperties(Dimension.prototype, {
  weather: {
    get: function (): WeatherType | undefined {
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
  commandRun: {
    value: function (...commands: string[]): any {
      return runCommand.call(this as Dimension, Dimension, ...commands);
    },
  },
});
