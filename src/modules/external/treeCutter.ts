import { Direction, EquipmentSlot, ItemStack, system, world } from "@minecraft/server";
import { blockRegistry, Run } from "mc-bedrock-lib";

type Vec3 = { x: number; y: number; z: number };

const DIRECTIONS: number[][] = (() => {
  const out: number[][] = [];
  for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) for (let dz = -1; dz <= 1; dz++) if (dx || dy || dz) out.push([dx, dy, dz]);
  return out;
})();

const keyOf = (pos: Vec3): number => {
  const x = pos.x | 0;
  const y = pos.y | 0;
  const z = pos.z | 0;
  // integer 3D hash (fast, avoids string allocations)
  return ((x * 73856093) ^ (y * 19349663) ^ (z * 83492791)) >>> 0;
};

// common filter descriptor used repeatedly
const SILK_TOUCH = { test: "has_enchantment", value: "minecraft:silk_touch" };

const species: any = {
  // Common overworld trees
  oak: {
    maxNodes: 120,
    blocks: {
      logs: {
        "minecraft:oak_log": []
      },
      leaves: {
        "minecraft:oak_leaves": [{ "minecraft:oak_sapling": { chance: 0.05 } }, { "minecraft:apple": { chance: 0.02 } }],
        "minecraft:azalea_leaves": [{ "minecraft:azalea": { chance: 0.05 } }],
        "minecraft:azalea_leaves_flowered": [{ "minecraft:flowering_azalea": { chance: 0.05 } }]
      },
      miscellaneous: {
        "minecraft:bee_nest": [
          {
            "minecraft:bee_nest": {
              filter: {
                test: "has_enchantment",
                value: "minecraft:silk_touch"
              }
            }
          }
        ]
      }
    }
  },
  birch: {
    maxNodes: 70,
    blocks: {
      logs: {
        "minecraft:birch_log": []
      },
      leaves: {
        "minecraft:birch_leaves": [{ "minecraft:birch_sapling": { chance: 0.05 } }]
      },
      miscellaneous: {}
    }
  },
  spruce: {
    maxNodes: 240,
    blocks: {
      logs: {
        "minecraft:spruce_log": []
      },
      leaves: {
        "minecraft:spruce_leaves": [{ "minecraft:spruce_sapling": { chance: 0.05 } }]
      },
      miscellaneous: {}
    }
  },
  dark_oak: {
    maxNodes: 180,
    blocks: {
      logs: {
        "minecraft:dark_oak_log": []
      },
      leaves: {
        "minecraft:dark_oak_leaves": [{ "minecraft:dark_oak_sapling": { chance: 0.05 } }, { "minecraft:apple": { chance: 0.02 } }]
      },
      miscellaneous: {}
    }
  },
  acacia: {
    maxNodes: 70,
    blocks: {
      logs: {
        "minecraft:acacia_log": []
      },
      leaves: {
        "minecraft:acacia_leaves": [{ "minecraft:acacia_sapling": { chance: 0.05 } }]
      },
      miscellaneous: {}
    }
  },
  jungle: {
    maxNodes: 240,
    blocks: {
      logs: {
        "minecraft:jungle_log": []
      },
      leaves: {
        "minecraft:jungle_leaves": [{ "minecraft:jungle_sapling": { chance: 0.05 } }]
      },
      miscellaneous: {}
    }
  },
  mangrove: {
    maxNodes: 180,
    blocks: {
      logs: {
        "minecraft:mangrove_log": []
      },
      leaves: {
        "minecraft:mangrove_leaves": [{ "minecraft:mangrove_propagule": { chance: 0.06 } }]
      },
      miscellaneous: {}
    }
  },
  cherry: {
    maxNodes: 180,
    blocks: {
      logs: {
        "minecraft:cherry_log": []
      },
      leaves: {
        "minecraft:cherry_leaves": [{ "minecraft:cherry_sapling": { chance: 0.05 } }]
      },
      miscellaneous: {}
    }
  },
  pale_oak: {
    maxNodes: 180,
    blocks: {
      logs: {
        "minecraft:pale_oak_log": []
      },
      leaves: {
        "minecraft:pale_oak_leaves": [{ "minecraft:pale_oak_sapling": { chance: 0.05 } }]
      },
      miscellaneous: {
        "minecraft:creaking_heart": [
          {
            "minecraft:resin_clump": {
              count: 3,
              filter: {
                test: "has_enchantment",
                operator: "not",
                value: "minecraft:silk_touch"
              }
            }
          },
          {
            "minecraft:creaking_heart": {
              filter: {
                test: "has_enchantment",
                value: "minecraft:silk_touch"
              }
            }
          }
        ]
      }
    }
  },
  // Nether "trees"
  crimson: {
    maxNodes: 70,
    blocks: {
      logs: {
        "minecraft:crimson_stem": []
      },
      leaves: {
        "minecraft:nether_wart_block": []
      },
      miscellaneous: {
        "minecraft:shroomlight": ["minecraft:shroomlight"]
      }
    }
  },
  warped: {
    maxNodes: 70,
    blocks: {
      logs: {
        "minecraft:warped_stem": []
      },
      leaves: {
        "minecraft:warped_wart_block": []
      }
    }
  },
  mushroom: {
    maxNodes: 70,
    blocks: {
      logs: {
        "minecraft:mushroom_stem": ["minecraft:mushroom_stem"]
      },
      leaves: {
        "minecraft:red_mushroom_block": [
          {
            "minecraft:red_mushroom_block": {
              filter: {
                test: "has_enchantment",
                value: "minecraft:silk_touch"
              }
            }
          },
          {
            "minecraft:red_mushroom": {
              chance: 0.165,
              filter: {
                test: "has_enchantment",
                operator: "not",
                value: "minecraft:silk_touch"
              }
            }
          }
        ],
        "minecraft:brown_mushroom_block": [
          {
            "minecraft:brown_mushroom_block": {
              filter: {
                test: "has_enchantment",
                value: "minecraft:silk_touch"
              }
            }
          },
          {
            "minecraft:brown_mushroom": {
              chance: 0.165,
              filter: {
                test: "has_enchantment",
                operator: "not",
                value: "minecraft:silk_touch"
              }
            }
          }
        ]
      },
      miscellaneous: {}
    }
  }
};

// Precompute miscellaneous-drop lookup maps to avoid repeated species loops
const MISC_DIRECT_LOOKUP: Map<string, any[]> = (() => {
  const map = new Map<string, any[]>();
  for (const spec of Object.values(species) as any[]) {
    const miscMap = spec?.blocks?.miscellaneous;
    if (!miscMap) continue;
    for (const [key, dropsListRaw] of Object.entries(miscMap)) {
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(dropsListRaw);
    }
  }
  return map;
})();

// Neighbor-based lookup: map neighbor block type -> array of dropsListRaw
const MISC_NEIGHBOR_LOOKUP: Map<string, any[]> = (() => {
  const map = new Map<string, any[]>();
  for (const spec of Object.values(species) as any[]) {
    const miscMap = spec?.blocks?.miscellaneous;
    if (!miscMap) continue;
    for (const [key, dropsListRaw] of Object.entries(miscMap)) {
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(dropsListRaw);
    }
  }
  return map;
})();

blockRegistry.add("bluepearl:log", {
  onTick: (ev: any) => {
    const { block, dimension } = ev;
    const location = block.location;
    const logState = block.getState("p:state");
    const logRotation = block.getState("p:rotation");
    if (logState > 1) {
      block.setState("p:state", logState - 1);
    } else {
      dimension.setBlockType(location, block.typeId.replace(/bluepearl/g, "minecraft"));
      if (block.getState("pillar_axis") !== undefined) block.setState("pillar_axis", logRotation || "y");
    }

    dimension.playSound("use.wood", location);
  },
  beforeOnPlayerPlace: (ev: any) => {
    const { permutationToPlace, face } = ev;
    const rot = face === Direction.Up || face === Direction.Down ? "y" : face === Direction.East || face === Direction.West ? "x" : "z";
    ev.permutationToPlace = permutationToPlace.withState("p:rotation", rot);
  },
  onPlayerBreak: (ev: any) => {
    const { block, dimension, brokenBlockPermutation } = ev;
    const logState = brokenBlockPermutation.getState("p:state");

    if (logState < 4) {
      block.setPermutation(brokenBlockPermutation.withState("p:state", logState + 1));
    }

    // remove log item duped by silk touch
    new Run(() => {
      dimension
        .getEntities({
          type: "minecraft:item",
          location: block.location,
          maxDistance: 3
        })
        .find((i: any) => i.toItemStack()?.typeId === block.typeId)
        ?.dispose();
    });
  }
});

export class TreeCutter {
  constructor() {
    this._attachListeners();
  }

  /* Event wiring */
  _attachListeners(): void {
    world.beforeEvents.playerBreakBlock.subscribe((ev: any) => this._onPlayerBreak(ev));
  }

  /* Handle the player attempting to break a block while sneaking with an axe */
  _onPlayerBreak(ev: any): void {
    try {
      const { player, block, dimension } = ev;
      if (!player?.isSneaking) return;
      const held = player.mainHandItem || null;
      if (!held?.typeId?.includes("axe")) return;

      const id = block?.typeId || "";
      // Quick guard: only operate on log-like or mushroom blocks
      if (!/(log|stem|wood|mushroom)/i.test(id)) return;

      if (id.includes("minecraft:")) {
        // Convert real minecraft logs into bluepearl placeholder and store rotation
        ev.cancel = true;
        const typeName = id.split(":")[1];
        const rotation = block.getState("pillar_axis");
        new Run(() => {
          dimension.setBlockType(
            {
              x: Math.floor(block.x),
              y: Math.floor(block.y),
              z: Math.floor(block.z)
            },
            `bluepearl:${typeName}`
          );
          if (rotation) block.setState("p:rotation", rotation);
        });
        return;
      }

      if (id.includes("bluepearl:")) {
        const state = block.getState("p:state") ?? 0;
        if (state >= 4) {
          ev.cancel = true;
          new Run(() => {
            block.setType(id.replace(/bluepearl/g, "minecraft"));
            this.run(block, player);
          });
        }
      }
    } catch (err) {
      // keep event handler safe
    }
  }

  /* Filter evaluator for drop conditions */
  _evalFilter(filter: any, ctx: any = {}): boolean {
    if (!filter) return true;
    if (typeof filter !== "object" || filter === null) return false;
    const testKey = (filter.test || "").toLowerCase();
    const value = filter.value || "";
    const operator = ((filter.operator || "") + "").toLowerCase();
    const negate = operator === "not";

    let result = false;
    if (testKey === "has_enchantment") {
      try {
        const player = ctx.player;
        if (player?.mainHandItem && typeof player.mainHandItem.hasEnchantment === "function") {
          result = player.mainHandItem.hasEnchantment(value);
        } else if (ctx.block && typeof ctx.block.getItemStack === "function") {
          const stack = ctx.block.getItemStack(1, true);
          if (stack && typeof stack.hasEnchantment === "function") result = stack.hasEnchantment(value);
        }
      } catch (e) {
        result = false;
      }
    }

    return negate ? !result : result;
  }

  /* Normalize various drop descriptor formats into {id,chance,count,filter} */
  _normalizeDrops(raw: any): Array<{ id: string; chance: number; count: number; filter: any }> {
    const out: Array<{
      id: string;
      chance: number;
      count: number;
      filter: any;
    }> = [];
    const list = Array.isArray(raw) ? raw : [raw];
    for (const entry of list) {
      if (!entry) continue;
      if (typeof entry === "string") out.push({ id: entry, chance: 1.0, count: 1, filter: null });
      else if (typeof entry === "object") {
        if (typeof entry.id === "string")
          out.push({
            id: entry.id,
            chance: entry.chance ?? 1.0,
            count: entry.count ?? 1,
            filter: entry.filter ?? null
          });
        else {
          for (const itemId of Object.keys(entry)) {
            const info = entry[itemId] || {};
            out.push({
              id: itemId,
              chance: info.chance ?? 1.0,
              count: info.count ?? 1,
              filter: info.filter ?? null
            });
          }
        }
      }
    }
    return out;
  }

  /* Find miscellaneous drop mappings for a given original block id */
  _discoverMiscDrops(position: Vec3, origId: string, dimension: any, speciesSpec: any = null) {
    const matches: Array<{ dropsListRaw: any; neighborPos: Vec3 | null }> = [];

    // Fast path: specific species provided -> only consult that species' misc map
    if (speciesSpec) {
      const miscMap = speciesSpec?.blocks?.miscellaneous || null;
      if (!miscMap) return matches;

      // direct mapping for this original id
      if (miscMap[origId]) matches.push({ dropsListRaw: miscMap[origId], neighborPos: null });

      // neighbor-based mapping: only scan neighbors if the species actually has other misc keys
      const neighborKeys = Object.keys(miscMap).filter((k) => k !== origId);
      if (neighborKeys.length === 0) return matches;
      const neighborSet = new Set(neighborKeys);

      for (const [dx, dy, dz] of DIRECTIONS) {
        try {
          const np = {
            x: position.x + dx,
            y: position.y + dy,
            z: position.z + dz
          };
          const nb = dimension.getBlock(np);
          if (nb && neighborSet.has(nb.typeId)) {
            matches.push({ dropsListRaw: miscMap[nb.typeId], neighborPos: np });
          }
        } catch (e) {}
      }

      return matches;
    }

    // Global path (no species specified): use precomputed maps
    const direct = MISC_DIRECT_LOOKUP.get(origId);
    if (direct) for (const dropsListRaw of direct) matches.push({ dropsListRaw, neighborPos: null });

    for (const [dx, dy, dz] of DIRECTIONS) {
      try {
        const np = {
          x: position.x + dx,
          y: position.y + dy,
          z: position.z + dz
        };
        const nb = dimension.getBlock(np);
        if (!nb) continue;
        const arr = MISC_NEIGHBOR_LOOKUP.get(nb.typeId);
        if (!arr) continue;
        for (const dropsListRaw of arr) matches.push({ dropsListRaw, neighborPos: np });
      } catch (e) {}
    }

    return matches;
  }

  /* Breadth-first search for connected log blocks */
  _discoverLogs(startBlock: any, logTypeDescriptor: any, maxNodes = 100, ctx: any = {}) {
    const startPos = startBlock.location;
    const dimension = startBlock.dimension;
    const queue: Vec3[] = [startPos];
    const seen = new Set<number>();
    const found: Vec3[] = [];

    const matchesType = (blk: any) => {
      if (!blk) return false;
      if (Array.isArray(logTypeDescriptor)) {
        for (const entry of logTypeDescriptor) {
          if (typeof entry === "string") {
            if (blk.typeId === entry) return true;
          } else if (typeof entry === "object") {
            for (const key of Object.keys(entry)) {
              if (blk.typeId === key) {
                const cond = (entry[key] || {}).filter;
                if (!cond || this._evalFilter(cond, { block: blk, player: ctx.player })) return true;
              }
            }
          }
        }
        return false;
      }
      return blk.typeId === logTypeDescriptor;
    };

    let i = 0;
    while (i < queue.length && found.length < maxNodes) {
      const pos = queue[i++];
      const k = keyOf(pos);
      if (seen.has(k)) continue;
      seen.add(k);
      const blk = dimension.getBlock(pos);
      if (!blk) continue;
      if (!matchesType(blk)) continue;
      found.push(pos);
      for (const [dx, dy, dz] of DIRECTIONS) queue.push({ x: pos.x + dx, y: pos.y + dy, z: pos.z + dz });
    }

    return found;
  }

  /* Breadth-first search for leaves around found logs */
  _discoverLeaves(foundLogs: Vec3[], dimension: any, leafTypes: any, maxNodes: number) {
    if (!leafTypes || foundLogs.length === 0) return [];
    const queue: Vec3[] = [];
    const seen = new Set<number>();
    const leaves: Vec3[] = [];

    for (const logPos of foundLogs) for (const [dx, dy, dz] of DIRECTIONS) queue.push({ x: logPos.x + dx, y: logPos.y + dy, z: logPos.z + dz });

    let i = 0;
    while (i < queue.length && leaves.length < maxNodes) {
      const pos = queue[i++];
      const k = keyOf(pos);
      if (seen.has(k)) continue;
      seen.add(k);
      const blk = dimension.getBlock(pos);
      if (!blk) continue;
      const isLeaf = Array.isArray(leafTypes) ? leafTypes.includes(blk.typeId) : blk.typeId === leafTypes;
      if (!isLeaf) continue;
      leaves.push(pos);
      for (const [dx, dy, dz] of DIRECTIONS) queue.push({ x: pos.x + dx, y: pos.y + dy, z: pos.z + dz });
    }

    return leaves;
  }

  _getSpeciesForLogType(typeId: string | null) {
    if (!typeId) return null;
    // direct mapping in species.blocks.logs
    for (const spec of Object.values(species) as any[]) if (spec?.blocks?.logs && spec.blocks.logs[typeId]) return spec;
    // fallback by base name
    const base = typeId.split(":").pop();
    for (const spec of Object.values(species) as any[]) {
      if (!spec?.blocks?.logs) continue;
      for (const logId of Object.keys(spec.blocks.logs)) if (logId.split(":").pop() === base) return spec;
    }
    return null;
  }

  _getStack(dimension: any, pos: Vec3) {
    const blk = dimension.getBlock(pos);
    if (!blk?.isAir) return blk.getItemStack(1, true);
    return null;
  }

  /* Remove blocks and spawn drops for logs + leaves */
  removeAndDrop(foundLogs: Vec3[], foundLeaves: Vec3[], dimension: any, spec: any = null, player: any = null) {
    const baseLogStack = foundLogs.length ? this._getStack(dimension, foundLogs[0]) : null;
    new Run(() => {
      const skipDrops = !!player?.isInvulnerable;
      const allNodes = [...foundLogs, ...foundLeaves];

      // cache block objects to avoid repeated dimension.getBlock calls
      const blocks = allNodes.map((p) => {
        try {
          return dimension.getBlock(p);
        } catch (e) {
          return null;
        }
      });
      const originalTypes = blocks.map((b) => b?.typeId ?? null);
      const leafOriginalTypes = originalTypes.slice(foundLogs.length);
      const logSet = new Set(foundLogs.map(keyOf));
      let miscSpawned = 0;

      for (let i = 0; i < allNodes.length; i++) {
        const nodePos = allNodes[i];
        const origType = originalTypes[i];
        if (!origType) continue;
        const spawnPoint = {
          x: nodePos.x + 0.5,
          y: nodePos.y + 0.5,
          z: nodePos.z + 0.5
        };

        const miscMatches = this._discoverMiscDrops(nodePos, origType, dimension, spec);
        for (const { dropsListRaw, neighborPos } of miscMatches) {
          if (neighborPos)
            try {
              dimension.setBlockType(neighborPos, "minecraft:air");
            } catch (e) {}
          const drops = this._normalizeDrops(dropsListRaw);
          for (const nd of drops) {
            if (nd.filter && !this._evalFilter(nd.filter, { player })) continue;
            if (Math.random() <= (typeof nd.chance === "number" ? nd.chance : 1.0)) {
              try {
                const cnt = typeof nd.count === "number" ? nd.count : 1;
                if (!skipDrops) {
                  dimension.spawnItem(new ItemStack(nd.id, cnt), spawnPoint);
                  miscSpawned += cnt;
                }
              } catch (e) {}
            }
          }
        }

        // delete block and play effects (reuse cached block)
        try {
          const before = blocks[i];
          const beforeId = (before?.typeId || "").toLowerCase();
          dimension.setBlockType(nodePos, "minecraft:air");
          dimension.spawnParticle("minecraft:egg_destroy_emitter", spawnPoint);
          try {
            let sound = "dig.wood";
            if (/leaf|leaves|leaf_/i.test(beforeId) || /mushroom/i.test(beforeId)) sound = "dig.grass";
            dimension.playSound(sound, nodePos);
          } catch (e) {}
        } catch (e) {}

        // drop logs at log node positions (O(1) check via Set)
        if (logSet.has(keyOf(nodePos))) {
          try {
            const requireSilk = spec === species.mushroom;
            const silk = this._evalFilter(SILK_TOUCH, { player });
            if (!requireSilk || silk) {
              if (!skipDrops) {
                const blockId = origType ?? "minecraft:log";
                const spawnStack = baseLogStack && typeof baseLogStack.clone === "function" ? baseLogStack.clone() : new ItemStack(blockId, 1);
                spawnStack.amount = 1;
                dimension.spawnItem(spawnStack, spawnPoint);
              }
            }
          } catch (e) {}
        }
      }

      // handle leaf drops via species config
      if (foundLeaves.length) {
        for (let i = 0; i < foundLeaves.length; i++) {
          const origLeaf = leafOriginalTypes[i];
          if (!origLeaf) continue;
          for (const specKey of Object.keys(species)) {
            const s = species[specKey];
            const leafDropsRaw = s?.blocks?.leaves?.[origLeaf];
            if (!leafDropsRaw) continue;
            const leafDropsList = Array.isArray(leafDropsRaw) ? leafDropsRaw : [leafDropsRaw];
            for (const d of leafDropsList) {
              const norm = this._normalizeDrops(Array.isArray(d) ? d : [d]);
              const leafPos = foundLeaves[i];
              const leafSpawn = {
                x: leafPos.x + 0.5,
                y: leafPos.y + 0.5,
                z: leafPos.z + 0.5
              };
              for (const nd of norm) {
                if (nd.filter && !this._evalFilter(nd.filter, { player })) continue;
                if (Math.random() <= (typeof nd.chance === "number" ? nd.chance : 1.0)) {
                  try {
                    const cnt = typeof nd.count === "number" ? nd.count : 1;
                    if (!skipDrops) {
                      dimension.spawnItem(new ItemStack(nd.id, cnt), leafSpawn);
                      miscSpawned += cnt;
                    }
                  } catch (e) {}
                }
              }
            }
          }
        }
      }

      if (!player?.isInvulnerable) {
        const damage = foundLogs.length + miscSpawned;
        if (damage > 0) player.damageItem(EquipmentSlot.Mainhand, damage);
      }
    });
  }
  *_processTree(startBlock: any, player: any, dimension: any, spec: any): Generator<any, void, unknown> {
    let logTypes: any = startBlock.typeId;
    if (spec.blocks?.logs) {
      const acc: any[] = [];
      for (const v of Object.values(spec.blocks.logs)) {
        if (Array.isArray(v)) acc.push(...v);
        else if (typeof v === "string") acc.push(v);
      }
      if (acc.length) logTypes = acc;
    }

    // --- DISCOVER LOGS (spread work) ---
    const logs: Vec3[] = [];
    const queue: Vec3[] = [startBlock.location];
    const seen = new Set<number>();
    let i = 0;

    const matchesType = (blk: any) => {
      if (!blk) return false;
      if (Array.isArray(logTypes)) {
        for (const entry of logTypes) {
          if (typeof entry === "string") {
            if (blk.typeId === entry) return true;
          } else if (typeof entry === "object") {
            for (const key of Object.keys(entry)) {
              if (blk.typeId === key) {
                const cond = (entry[key] || {}).filter;
                if (!cond || this._evalFilter(cond, { block: blk, player })) return true;
              }
            }
          }
        }
        return false;
      }
      return blk.typeId === logTypes;
    };

    while (i < queue.length && logs.length < spec.maxNodes) {
      const pos = queue[i++];
      const k = keyOf(pos);
      if (seen.has(k)) continue;
      seen.add(k);
      let blk = null;
      try {
        blk = dimension.getBlock(pos);
      } catch (e) {}
      if (!blk) continue;
      if (!matchesType(blk)) continue;
      logs.push(pos);
      for (const [dx, dy, dz] of DIRECTIONS) queue.push({ x: pos.x + dx, y: pos.y + dy, z: pos.z + dz });

      if (i % 10 === 0) yield;
    }

    if (!logs.length) return;

    // --- DISCOVER LEAVES (spread work) ---
    const leaves: Vec3[] = [];
    const leafTypes = Object.keys(spec.blocks.leaves || {});
    const leafQueue: Vec3[] = [];
    for (const logPos of logs)
      for (const [dx, dy, dz] of DIRECTIONS)
        leafQueue.push({
          x: logPos.x + dx,
          y: logPos.y + dy,
          z: logPos.z + dz
        });

    i = 0;
    const seenLeaf = new Set<number>();
    while (i < leafQueue.length && leaves.length < spec.maxNodes) {
      const pos = leafQueue[i++];
      const k = keyOf(pos);
      if (seenLeaf.has(k)) continue;
      seenLeaf.add(k);
      let blk = null;
      try {
        blk = dimension.getBlock(pos);
      } catch (e) {}
      if (!blk) continue;
      if (!leafTypes.includes(blk.typeId)) continue;
      leaves.push(pos);
      for (const [dx, dy, dz] of DIRECTIONS) leafQueue.push({ x: pos.x + dx, y: pos.y + dy, z: pos.z + dz });

      if (i % 10 === 0) yield;
    }

    // --- REMOVE + DROP (spread work) ---
    const all = [...logs, ...leaves];
    const baseLogStack = logs.length ? this._getStack(dimension, logs[0]) : null;

    // cache blocks and types once
    const blocks = all.map((p) => {
      try {
        return dimension.getBlock(p);
      } catch (e) {
        return null;
      }
    });
    const originalTypes = blocks.map((b) => b?.typeId ?? null);
    const leafOriginalTypes = originalTypes.slice(logs.length);
    const logSet = new Set(logs.map(keyOf));
    let miscSpawned = 0;
    const skipDrops = !!player?.isInvulnerable;

    for (let j = 0; j < all.length; j++) {
      const nodePos = all[j];
      const origType = originalTypes[j];
      if (!origType) continue;
      const spawnPoint = {
        x: nodePos.x + 0.5,
        y: nodePos.y + 0.5,
        z: nodePos.z + 0.5
      };

      try {
        const miscMatches = this._discoverMiscDrops(nodePos, origType, dimension, spec);
        for (const { dropsListRaw, neighborPos } of miscMatches) {
          if (neighborPos)
            try {
              dimension.setBlockType(neighborPos, "minecraft:air");
            } catch (e) {}
          const drops = this._normalizeDrops(dropsListRaw);
          for (const nd of drops) {
            if (nd.filter && !this._evalFilter(nd.filter, { player })) continue;
            if (Math.random() <= (typeof nd.chance === "number" ? nd.chance : 1.0)) {
              try {
                const cnt = typeof nd.count === "number" ? nd.count : 1;
                if (!skipDrops) {
                  dimension.spawnItem(new ItemStack(nd.id, cnt), spawnPoint);
                  miscSpawned += cnt;
                }
              } catch (e) {}
            }
          }
        }
      } catch (e) {}

      // delete block and play effects (reuse cached block)
      try {
        const before = blocks[j];
        const beforeId = (before?.typeId || "").toLowerCase();
        dimension.setBlockType(nodePos, "minecraft:air");
        dimension.spawnParticle("minecraft:egg_destroy_emitter", spawnPoint);
        try {
          let sound = "dig.wood";
          if (/leaf|leaves|leaf_/i.test(beforeId) || /mushroom/i.test(beforeId)) sound = "dig.grass";
          dimension.playSound(sound, nodePos);
        } catch (e) {}
      } catch (e) {}

      // drop logs at log node positions (O(1) membership test)
      if (logSet.has(keyOf(nodePos))) {
        try {
          const requireSilk = spec === species.mushroom;
          const silk = this._evalFilter(SILK_TOUCH, { player });
          if (!requireSilk || silk) {
            if (!skipDrops) {
              const blockId = origType ?? "minecraft:log";
              const spawnStack = baseLogStack && typeof baseLogStack.clone === "function" ? baseLogStack.clone() : new ItemStack(blockId, 1);
              spawnStack.amount = 1;
              dimension.spawnItem(spawnStack, spawnPoint);
            }
          }
        } catch (e) {}
      }

      if (j % 6 === 0) yield;
    }

    // handle leaf drops via species config (spread work)
    if (leaves.length) {
      for (let li = 0; li < leaves.length; li++) {
        const origLeaf = leafOriginalTypes[li];
        if (!origLeaf) continue;
        for (const specKey of Object.keys(species)) {
          const s = species[specKey];
          const leafDropsRaw = s?.blocks?.leaves?.[origLeaf];
          if (!leafDropsRaw) continue;
          const leafDropsList = Array.isArray(leafDropsRaw) ? leafDropsRaw : [leafDropsRaw];
          for (const d of leafDropsList) {
            const norm = this._normalizeDrops(Array.isArray(d) ? d : [d]);
            const leafPos = leaves[li];
            const leafSpawn = {
              x: leafPos.x + 0.5,
              y: leafPos.y + 0.5,
              z: leafPos.z + 0.5
            };
            for (const nd of norm) {
              if (nd.filter && !this._evalFilter(nd.filter, { player })) continue;
              if (Math.random() <= (typeof nd.chance === "number" ? nd.chance : 1.0)) {
                try {
                  const cnt = typeof nd.count === "number" ? nd.count : 1;
                  if (!skipDrops) {
                    dimension.spawnItem(new ItemStack(nd.id, cnt), leafSpawn);
                    miscSpawned += cnt;
                  }
                } catch (e) {}
              }
            }
          }
        }

        if (li % 8 === 0) yield;
      }
    }

    if (!player?.isInvulnerable) {
      const damage = logs.length + miscSpawned;
      if (damage > 0) player.damageItem(EquipmentSlot.Mainhand, damage);
    }

    return;
  }

  run(block: any, player: any): void {
    const dimension = player.dimension;
    const spec = this._getSpeciesForLogType(block.typeId);
    if (!spec) return;

    const job = this._processTree(block, player, dimension, spec);
    system.runJob(
      (function* () {
        for (const step of job) {
          try {
            if (player && typeof player.isValid === "function" && !player.isValid()) return;
          } catch (e) {}
          yield step;
        }
      })()
    );
  }
}

new TreeCutter();
