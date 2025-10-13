import { BlockCustomComponent, StartupEvent } from "@minecraft/server";
import { systemBeforeEvents as sbe } from "../constants";

class Registry<T> {
  registry: Map<string, T>;
  constructor() {
    this.registry = new Map();
    if (!sbe?.startup) return;
  }
  add(id: string, comp: T) {
    this.registry.set(id, comp);
  }
  remove(id: string) {
    this.registry.delete(id);
  }
  clear() {
    this.registry.clear();
  }
}

export class BlockRegistry extends Registry<BlockCustomComponent> {
  constructor() {
    super();
    sbe.startup.subscribe((e: StartupEvent) => {
      for (const [id, comp] of this.registry) {
        e.blockComponentRegistry.registerCustomComponent(id, comp);
      }
    });
  }
}

// TODO: CommandRegistry and ItemRegistry
