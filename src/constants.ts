import {
  world as w,
  system as s,
  TicksPerSecond,
  WorldAfterEvents,
  WorldBeforeEvents,
  ScriptEventCommandMessageAfterEventSignal,
  System,
} from "@minecraft/server";

export const namespace: string = "eternal";
export const ns: string = namespace;
export const tps: number = TicksPerSecond;
export const system: System = s;
export const afterEvents: WorldAfterEvents = w.afterEvents;
export const beforeEvents: WorldBeforeEvents = w.beforeEvents;
export const scriptEvent: ScriptEventCommandMessageAfterEventSignal = s.afterEvents.scriptEventReceive;
