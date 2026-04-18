import {
  BlockCustomComponent,
  ItemCustomComponent,
  StartupEvent,
  CustomCommand,
  CustomCommandOrigin,
  CustomCommandResult,
  StartupBeforeEventSignal,
  system
} from "@minecraft/server";

class Registry<key, value> {
  protected registry: Map<key, value>;
  protected startup: StartupBeforeEventSignal;

  constructor() {
    this.registry = new Map();
    this.startup = system.beforeEvents.startup;
  }
  add(id: key, comp: value) {
    this.registry.set(id, comp);
  }
  remove(id: key) {
    this.registry.delete(id);
  }
  clear() {
    this.registry.clear();
  }
}

export class BlockRegistry extends Registry<string, BlockCustomComponent> {
  constructor() {
    super();
    this.startup.subscribe((e: StartupEvent) => {
      for (const [id, comp] of this.registry) e.blockComponentRegistry.registerCustomComponent(id, comp);
    });
  }
}

export class ItemRegistry extends Registry<string, ItemCustomComponent> {
  constructor() {
    super();
    this.startup.subscribe((e: StartupEvent) => {
      for (const [id, comp] of this.registry) e.itemComponentRegistry.registerCustomComponent(id, comp);
    });
  }
}

export class CommandRegistry extends Registry<CustomCommand, (origin: CustomCommandOrigin, ...args: any[]) => CustomCommandResult | undefined> {
  private enums: Map<string, string[]> = new Map();
  constructor() {
    super();
    this.startup.subscribe((e) => {
      for (const [name, values] of this.enums) e.customCommandRegistry.registerEnum(name, values);
      for (const [def, cb] of this.registry) e.customCommandRegistry.registerCommand(def, cb);
    });
  }
  addEnum(name: string, values: string[]) {
    if (!name || !Array.isArray(values) || !values.length) return;
    this.enums.set(name, values);
  }
}
