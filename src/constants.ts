import {
  world as w,
  system as s,
  System,
  World,
  WorldAfterEvents,
  WorldBeforeEvents,
  SystemAfterEvents,
  SystemBeforeEvents
} from "@minecraft/server";
import { BlockRegistry, CommandRegistry, ItemRegistry, V2 } from "modules";

/**
 * Predefined directional vectors for common orientations.
 */
export const DIRECTION = {
  South: new V2(0, 0),
  West: new V2(0, 90),
  North: new V2(0, 180),
  East: new V2(0, -90),
  NorthEast: new V2(0, -45),
  SouthEast: new V2(0, 45),
  SouthWest: new V2(0, 135),
  NorthWest: new V2(0, -135)
};
/**
 * Predefined offsets for neighboring blocks in a 3D grid (26 neighbors).
 */
export const NEIGHBOR_OFFSETS_3D: number[][] = (() => {
  const out: number[][] = [];
  for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) for (let dz = -1; dz <= 1; dz++) if (dx || dy || dz) out.push([dx, dy, dz]);
  return out;
})();

/**
 * Reference to the Minecraft world instance.
 */
export const world: World = w;

/**
 * Reference to the Minecraft system instance.
 */
export const system: System = s;

/**
 * Handles world after-event hooks.
 */
export const worldAfterEvents: WorldAfterEvents = w.afterEvents;

/**
 * Handles world before-event hooks.
 */
export const worldBeforeEvents: WorldBeforeEvents = w.beforeEvents;

/**
 * Handles system after-event hooks.
 */
export const systemAfterEvents: SystemAfterEvents = s.afterEvents;

/**
 * Handles system before-event hooks.
 */
export const systemBeforeEvents: SystemBeforeEvents = s.beforeEvents;

/**
 * Central registry for custom blocks.
 */
export const blockRegistry: BlockRegistry = new BlockRegistry();

/**
 * Central registry for custom items.
 */
export const itemRegistry: ItemRegistry = new ItemRegistry();

/**
 * Central registry for custom commands.
 */
export const commandRegistry: CommandRegistry = new CommandRegistry();
