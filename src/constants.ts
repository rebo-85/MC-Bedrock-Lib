import {
  world as w,
  system as s,
  System,
  World,
  WorldAfterEvents,
  WorldBeforeEvents,
  SystemAfterEvents,
  SystemBeforeEvents,
} from "@minecraft/server";
import { BlockRegistry, CommandRegistry, DebugStickInspector, ItemRegistry } from "classes";

/**
 * Project-wide namespace string, used for identifiers.
 */
export const namespace: string = "eternal";

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
