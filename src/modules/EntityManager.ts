import { Entity, EntityQueryOptions, Player, system, world } from "@minecraft/server";
import { createArrayProxy } from "utils";
import { Manager } from "./utils";

/**
 * PlayerManager
 * Tracks all players in the world, updates on spawn/leave events.
 */
export class PlayerManager extends Manager {
  private _plrs: Player[] = [];
  private _rdy = false;

  get players(): Player[] {
    return createArrayProxy(
      () => this._plrs,
      () => this._rdy
    );
  }

  protected _init(): void {
    this._loadPlayers();
    this._subscribeEvents();
  }

  private _loadPlayers(): void {
    const load = () => {
      try {
        this._plrs = world.getAllPlayers();
        this._rdy = true;
      } catch {
        system.run(load);
      }
    };
    load();
  }

  private _subscribeEvents(): void {
    world.afterEvents.playerSpawn.subscribe((e) => {
      if (e.initialSpawn && !this._plrs.some((p) => p.id === e.player.id)) this._plrs.push(e.player);
    });

    world.beforeEvents.playerLeave.subscribe((e) => {
      this._plrs = this._plrs.filter((p) => p.id !== e.player.id);
    });
  }
}

/**
 * EntityManager
 * Tracks entities matching query options, provides add/remove callbacks.
 */
export class EntityManager extends Manager {
  private static readonly MATCH_DIST = 0.1;

  private _ents: Entity[] = [];
  private _rdy = false;
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

  protected _init(): void {
    this._loadEntities();
    this._subscribeEvents();
  }

  private _loadEntities(): void {
    const load = () => {
      try {
        this._ents = world.getEntities(this._opts);
        this._rdy = true;
      } catch {
        system.run(load);
      }
    };
    load();
  }

  private _subscribeEvents(): void {
    world.afterEvents.entitySpawn.subscribe((e) => this._handleEntityAdd(e.entity));
    world.afterEvents.entityLoad.subscribe((e) => this._handleEntityAdd(e.entity));
    world.afterEvents.entityRemove.subscribe((e) => this._handleEntityRemove(e.removedEntityId));
  }

  private _handleEntityAdd(ent: Entity): void {
    if (!this._isMatch(ent) || this._ents.some((e) => e.id === ent.id)) return;

    this._ents.push(ent);
    this._addCbs.forEach((cb) => cb(ent));
  }

  private _handleEntityRemove(entId: string): void {
    this._ents = this._ents.filter((e) => e.id !== entId);
    this._rmvCbs.forEach((cb) => cb(entId));
  }

  private _isMatch(ent: Entity): boolean {
    const opts = { ...this._opts, location: ent.location, maxDistance: EntityManager.MATCH_DIST };
    return ent.dimension.getEntities(opts).length > 0;
  }

  onEntityAdd(cb: (entity: Entity) => void): void {
    this._addCbs.push(cb);
  }

  onEntityRemove(cb: (entityId: string) => void): void {
    this._rmvCbs.push(cb);
  }
}
