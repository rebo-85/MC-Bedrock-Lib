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
import { BlockRegistry, CommandRegistry, ItemRegistry, Vector2 } from "modules";
export const Direction = {
  South: new Vector2(0, 0),
  West: new Vector2(0, 90),
  North: new Vector2(0, 180),
  East: new Vector2(0, -90),
  NorthEast: new Vector2(0, -45),
  SouthEast: new Vector2(0, 45),
  SouthWest: new Vector2(0, 135),
  NorthWest: new Vector2(0, -135)
};

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
