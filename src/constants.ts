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

export const namespace: string = "eternal";
export const world: World = w;
export const system: System = s;
export const worldAfterEvents: WorldAfterEvents = w.afterEvents;
export const worldBeforeEvents: WorldBeforeEvents = w.beforeEvents;
export const systemAfterEvents: SystemAfterEvents = s.afterEvents;
export const systemBeforeEvents: SystemBeforeEvents = s.beforeEvents;
