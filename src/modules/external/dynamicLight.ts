import { EquipmentSlot, world, Player, Block, BlockComponentTickEvent } from "@minecraft/server";
import { Manager, Run, V3, PlayerManager, blockRegistry } from "mc-bedrock-lib";

blockRegistry.add("bluepearl:light_block", {
  onTick(ev: BlockComponentTickEvent) {
    const { block } = ev as { block: Block };
    block.setType("minecraft:air");
  }
});

class DynamicLight extends Manager {
  private active: Map<string, Block> = new Map();
  private playerManager!: PlayerManager;

  constructor() {
    super();
  }

  protected init(): void {
    this.active = new Map<string, Block>();
    this.playerManager = new PlayerManager();
    this.attachListeners();
  }

  private attachListeners(): void {
    world.afterEvents.playerOnUnequip.subscribe(({ player }) => {
      if (!this.getLightInfo(player)) this.off(player);
    });

    world.afterEvents.worldLoad.subscribe(() => {
      for (const player of this.playerManager.players as Player[]) this.off(player);
    });

    world.afterEvents.playerSpawn.subscribe(({ player }) => this.off(player));

    world.beforeEvents.playerLeave.subscribe(({ player }) => new Run(() => this.off(player)));
  }

  protected async main(): Promise<void> {
    for (const player of this.playerManager.players as Player[]) {
      const info = this.getLightInfo(player);
      if (info) this.on(player, info.level);
    }
  }

  on(player: Player, lightPower = 15): void {
    this.off(player);
    const radius = 1;
    const loc = (player as any).location ?? { x: player.x, y: player.y, z: player.z };
    const px = Number(loc.x);
    const py = Number(loc.y);
    const pz = Number(loc.z);

    const center = new V3(px, py, pz);
    const dimension = player.dimension;
    const location = center.offset(new V3(0, 1, 0));

    const lightableBlocksIds = ["minecraft:air", "bluepearl:light_block"];
    const isLightable = (b?: Block) => {
      for (const id of lightableBlocksIds) if (b?.typeId.startsWith(id)) return true;
      return false;
    };

    let block: Block | undefined;
    try {
      block = dimension.getBlock(location as any) as Block;
    } catch (e) {
      block = undefined;
    }

    if (block && isLightable(block)) {
      block.setType("minecraft:air"); // force block update to prevent lighting glitches
      block.setType("bluepearl:light_block");
      block.setState("p:block_light_level", lightPower);
      this.active.set(player.id, block);
      return;
    }

    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dz = -radius; dz <= radius; dz++) {
          const pos = new V3(px + dx, py + 1 + dy, pz + dz);
          try {
            const nb = dimension.getBlock(pos as any) as Block;
            if (isLightable(nb)) {
              nb.setType("bluepearl:light_block");
              nb.setState("p:block_light_level", lightPower);
              this.active.set(player.id, nb);
              return;
            }
          } catch (e) {
            /* ignore */
          }
        }
      }
    }
  }

  off(player: Player): void {
    if (this.active.has(player.id)) {
      const prev = this.active.get(player.id);
      if (prev?.typeId === "bluepearl:light_block") {
        prev.setType("minecraft:air");
        this.active.delete(player.id);
      }
    }
  }

  hasLightItem(player: Player): boolean {
    return !!this.getLightInfo(player);
  }

  getLightInfo(player: Player): { slot: string; typeId: string; level: number } | null {
    if (!DynamicLight.lightItems) return null;

    for (const slot of Object.values(EquipmentSlot) as EquipmentSlot[]) {
      const mapping = DynamicLight.lightItems[slot as unknown as string];
      if (!mapping) continue;

      const item = (player as any).getEquipment(slot);
      if (!item) continue;
      const typeId = item.typeId as string;
      if (typeof mapping !== "object") continue;
      const props = mapping[typeId];
      if (props) {
        const level = props.block_light_level ?? 15;
        return { slot: String(slot), typeId, level };
      }
    }
    return null;
  }

  static lightItems: Partial<Record<EquipmentSlot | string, Record<string, { block_light_level?: number }>>> = {
    [EquipmentSlot.Head]: {},
    [EquipmentSlot.Chest]: {},
    [EquipmentSlot.Legs]: {},
    [EquipmentSlot.Feet]: {},
    [EquipmentSlot.Mainhand]: {
      "minecraft:beacon": { block_light_level: 15 },
      "minecraft:copper_lantern": { block_light_level: 15 },
      "minecraft:copper_torch": { block_light_level: 14 },
      "minecraft:exposed_copper_lantern": { block_light_level: 15 },
      "minecraft:lantern": { block_light_level: 15 },
      "minecraft:end_rod": { block_light_level: 14 },
      "minecraft:conduit": { block_light_level: 15 },
      "minecraft:lava_bucket": { block_light_level: 15 },
      "minecraft:redstone_torch": { block_light_level: 7 },
      "minecraft:magma_block": { block_light_level: 3 },
      "minecraft:glow_lichen": { block_light_level: 7 },
      "minecraft:amethyst_cluster": { block_light_level: 5 },
      "minecraft:lit_pumpkin": { block_light_level: 15 },
      "minecraft:ochre_froglight": { block_light_level: 15 },
      "minecraft:oxidized_copper_lantern": { block_light_level: 15 },
      "minecraft:pearlescent_froglight": { block_light_level: 15 },
      "minecraft:sea_lantern": { block_light_level: 15 },
      "minecraft:sea_pickle": { block_light_level: 6 },
      "minecraft:shroomlight": { block_light_level: 15 },
      "minecraft:soul_lantern": { block_light_level: 10 },
      "minecraft:soul_torch": { block_light_level: 10 },
      "minecraft:torch": { block_light_level: 14 },
      "minecraft:verdant_froglight": { block_light_level: 15 },
      "minecraft:waxed_copper_lantern": { block_light_level: 15 },
      "minecraft:waxed_exposed_copper_lantern": { block_light_level: 15 },
      "minecraft:waxed_oxidized_copper_lantern": { block_light_level: 15 },
      "minecraft:waxed_weathered_copper_lantern": { block_light_level: 15 },
      "minecraft:weathered_copper_lantern": { block_light_level: 15 }
    },
    [EquipmentSlot.Offhand]: {}
  };
}

new DynamicLight();
