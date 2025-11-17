import { BlockType, BlockTypes, Dimension, EntityTypes, world } from "@minecraft/server";
import { Manager, Vector3 } from "mc-bedrock-lib";

export class OneBlock extends Manager {
  // Config
  location = new Vector3(0, 0, 0);
  private _spawnChance = 0.01;

  // State
  private _ready = false;
  private _dimension!: Dimension;
  private _blockList: BlockType[] = [];
  private _mobList: string[] = [];

  // Block filters
  private static readonly BANNED_BLOCKS = [
    "_door",
    "allow",
    "barrier",
    "bed",
    "bedrock",
    "border_block",
    "camera",
    "chain_command_block",
    "chalkboard",
    "chemical_heat",
    "colored_torch_",
    "command_block",
    "compound_creator",
    "deny",
    "end_gateway",
    "end_portal",
    "fire",
    "glowingobsidian",
    "hard",
    "info_update",
    "invisible_bedrock",
    "jigsaw",
    "lab_table",
    "ladder",
    "light_block",
    "material_reducer",
    "netherreactor",
    "piston_arm_collision",
    "portal",
    "repeating_command_block",
    "reserved6",
    "resin_clump",
    "sculk_vein",
    "stonecutter",
    "structure_block",
    "structure_void",
    "unknown",
    "vine",
  ];

  private static readonly NO_COLLISION_BLOCKS = [
    "_coral",
    "_grass",
    "_pressure_plate",
    "_sapling",
    "_sign",
    "allium",
    "amethyst_bud",
    "amethyst_cluster",
    "azure_bluet",
    "beetroot",
    "blue_orchid",
    "bush",
    "button",
    "carrot",
    "closed_eyeblossom",
    "crimson_roots",
    "dandelion",
    "dripstone",
    "fern",
    "flower",
    "frame",
    "frog_spawn",
    "fungus",
    "glow_lichen",
    "hanging_roots",
    "large_fern",
    "leaf_litter",
    "lever",
    "lilac",
    "lily_of_the_valley",
    "mangrove_propagule",
    "melon_stem",
    "mushroom",
    "nether_sprouts",
    "nether_wart",
    "open_eyeblossom",
    "oxeye_daisy",
    "pale_hanging_moss",
    "peony",
    "pink_petals",
    "pitcher_plant",
    "poppy",
    "potato",
    "rail",
    "reeds",
    "scaffolding",
    "small_dripleaf_block",
    "spore_blossom",
    "standing_banner",
    "string",
    "torch",
    "trip_wire",
    "tripwire_hook",
    "tulip",
    "twisting_vines",
    "warped_roots",
    "web",
    "wheat",
    "wither_rose",
  ];

  async _init(): Promise<void> {
    this._dimension = world.overworld;
    this._mobList = EntityTypes.getAll()
      .filter((e) => e.id.startsWith("minecraft:"))
      .map((e) => e.id);

    this._blockList = BlockTypes.getAll().filter((b) => this._isValidBlock(b));
    this._ready = true;
  }

  _main(): void {
    if (!this._ready) return;

    const block = this._dimension.getBlock(this.location);
    if (!block || this._isBlockOccupied(block)) return;

    const hasNearby = this._hasNearbyBlocks(block);
    if (!hasNearby) this._filterNoCollisionBlocks();

    this._placeRandomBlock(block);
    this._trySpawnMob();
  }

  private _isValidBlock(b: BlockType): boolean {
    return !b.id.startsWith("minecraft:element_") && !OneBlock.BANNED_BLOCKS.some((bn) => b.id.includes(bn));
  }

  private _isBlockOccupied(block: any): boolean {
    return !block.isAir && !block.isLiquid && !block.isWaterlogged;
  }

  private _hasNearbyBlocks(block: any): boolean {
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          if (x === 0 && y === 0 && z === 0) continue;
          const nearby = block.offset(new Vector3(x, y, z));
          if (nearby && !nearby.isAir) return true;
        }
      }
    }
    return false;
  }

  private _filterNoCollisionBlocks(): void {
    this._blockList = this._blockList.filter((b) => !OneBlock.NO_COLLISION_BLOCKS.some((nc) => b.id.includes(nc)));
  }

  private _placeRandomBlock(block: any): void {
    const randBlock = this._blockList[Math.floor(Math.random() * this._blockList.length)];
    block.setType(randBlock.id);
  }

  private _trySpawnMob(): void {
    if (Math.random() > this._spawnChance) return;

    const mobId = this._mobList[Math.floor(Math.random() * this._mobList.length)];
    try {
      this._dimension.spawnEntity(mobId, this.location);
    } catch (err) {
      const error = err as Error & { name?: string };
      if (error.name !== "InvalidArgumentError") throw error;
    }
  }
}
