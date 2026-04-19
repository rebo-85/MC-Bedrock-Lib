import { Entity, EntityQueryOptions, Player, system, world } from "@minecraft/server";
import { createArrayProxy } from "utils";
import { Manager } from "./utils";

/**
 * PlayerManager
 * Tracks all players in the world, updates on spawn/leave events.
 */
export class PlayerManager extends Manager {
  private _players: Player[] = [];
  private ready = false;

  get players(): Player[] {
    return createArrayProxy(
      () => this._players,
      () => this.ready
    );
  }

  protected init(): void {
    this.loadPlayers();
    this.subscribeEvents();
  }

  private loadPlayers(): void {
    const load = () => {
      try {
        this._players = world.getAllPlayers();
        this.ready = true;
      } catch {
        system.run(load);
      }
    };
    load();
  }

  private subscribeEvents(): void {
    world.afterEvents.playerSpawn.subscribe((e) => {
      if (e.initialSpawn && !this._players.some((p) => p.id === e.player.id)) this._players.push(e.player);
    });

    world.beforeEvents.playerLeave.subscribe((e) => {
      this._players = this._players.filter((p) => p.id !== e.player.id);
    });
  }
}

/**
 * EntityManager
 * Tracks entities matching query options, provides add/remove callbacks.
 */
export class EntityManager extends Manager {
  private static readonly MATCH_DIST = 0.1;

  private _entities: Entity[] = [];
  private ready = false;
  private options: EntityQueryOptions;
  private addCbs: ((entity: Entity) => void)[] = [];
  private removeCbs: ((entityId: string) => void)[] = [];

  constructor(opts: EntityQueryOptions = {}) {
    super();
    this.options = opts;
  }

  get entities(): any {
    return createArrayProxy(
      () => this._entities,
      () => this.ready
    );
  }

  protected init(): void {
    this.loadEntities();
    this.subscribeEvents();
  }

  private loadEntities(): void {
    const load = () => {
      try {
        this._entities = world.getEntities(this.options);
        this.ready = true;
      } catch {
        system.run(load);
      }
    };
    load();
  }

  private subscribeEvents(): void {
    world.afterEvents.entitySpawn.subscribe((e) => this._handleEntityAdd(e.entity));
    world.afterEvents.entityLoad.subscribe((e) => this._handleEntityAdd(e.entity));
    world.afterEvents.entityRemove.subscribe((e) => this._handleEntityRemove(e.removedEntityId));
  }

  private _handleEntityAdd(ent: Entity): void {
    if (!this._isMatch(ent) || this._entities.some((e) => e.id === ent.id)) return;

    this._entities.push(ent);
    this.addCbs.forEach((cb) => cb(ent));
  }

  private _handleEntityRemove(entId: string): void {
    this._entities = this._entities.filter((e) => e.id !== entId);
    this.removeCbs.forEach((cb) => cb(entId));
  }

  private _isMatch(ent: Entity): boolean {
    const opts = { ...this.options, location: ent.location, maxDistance: EntityManager.MATCH_DIST };
    return ent.dimension.getEntities(opts).length > 0;
  }

  onEntityAdd(cb: (entity: Entity) => void): void {
    this.addCbs.push(cb);
  }

  onEntityRemove(cb: (entityId: string) => void): void {
    this.removeCbs.push(cb);
  }
}
