import {
  world as w,
  system as s,
  WorldAfterEvents,
  WorldBeforeEvents,
  ScriptEventCommandMessageAfterEventSignal,
  System,
  World,
} from "@minecraft/server";

export const namespace: string = "eternal";
export const world: World = w;
export const system: System = s;
export const afterEvents: WorldAfterEvents = w.afterEvents;
export const beforeEvents: WorldBeforeEvents = w.beforeEvents;
export const scriptEvent: ScriptEventCommandMessageAfterEventSignal = s.afterEvents.scriptEventReceive;
