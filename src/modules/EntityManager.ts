import { Player, Entity, world, EntityQueryOptions, system } from "@minecraft/server";
import { Manager } from "./utils";
import { createArrayProxy } from "utils";

export class PlayerManager extends Manager {
  private _plrs: Player[] = [];
  private _rdy: boolean = false;

  get players(): any {
    return createArrayProxy(
      () => this._plrs,
      () => this._rdy
    );
  }

  protected _init() {
    const load = () => {
      try {
        this._plrs = world.getAllPlayers();
        this._rdy = true;
      } catch {
        system.run(load);
      }
    };
    load();

    world.afterEvents.playerSpawn.subscribe((e) => {
      if (e.initialSpawn && !this._plrs.some((p) => p.id === e.player.id)) this._plrs.push(e.player);
    });

    world.afterEvents.playerLeave.subscribe((e) => {
      this._plrs = this._plrs.filter((p) => p.id !== e.playerId);
    });
  }
}

export class EntityManager extends Manager {
  private _ents: Entity[] = [];
  private _rdy: boolean = false;
  private _opts: EntityQueryOptions;
  private _addCbs: ((entity: Entity) => void)[] = [];
  private _rmvCbs: ((entityId: string) => void)[] = [];

  constructor(opts: EntityQueryOptions = {}) {
    super();
    this._opts = opts;
  }

  get entities(): any {
    return createArrayProxy(
      () => this._ents,
      () => this._rdy
    );
  }

  private _isMatch(ent: Entity): boolean {
    const opts: EntityQueryOptions = this._opts;
    opts.location = ent.location;
    opts.maxDistance = 0.1;
    const match = ent.dimension.getEntities(opts);
    return match.length > 0;
  }

  protected _init() {
    const load = () => {
      try {
        this._ents = world.getEntities(this._opts);
        this._rdy = true;
      } catch {
        system.run(load);
      }
    };
    load();

    world.afterEvents.entitySpawn.subscribe((e) => {
      if (this._isMatch(e.entity) && !this._ents.some((ent) => ent.id === e.entity.id)) {
        this._ents.push(e.entity);
        this._addCbs.forEach((cb) => cb(e.entity));
      }
    });

    world.afterEvents.entityLoad.subscribe((e) => {
      if (this._isMatch(e.entity) && !this._ents.some((ent) => ent.id === e.entity.id)) {
        this._ents.push(e.entity);
        this._addCbs.forEach((cb) => cb(e.entity));
      }
    });

    world.afterEvents.entityRemove.subscribe((e) => {
      this._ents = this._ents.filter((ent) => ent.id !== e.removedEntityId);
      this._rmvCbs.forEach((cb) => cb(e.removedEntityId));
    });
  }

  onEntityAdd(cb: (entity: Entity) => void) {
    this._addCbs.push(cb);
  }

  onEntityRemove(cb: (entityId: string) => void) {
    this._rmvCbs.push(cb);
  }
}
