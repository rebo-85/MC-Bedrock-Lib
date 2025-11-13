import { Player, Entity, world, EntityQueryOptions } from "@minecraft/server";
import { Manager } from "./utils";

export class PlayerManager extends Manager {
  players: Player[] = [];
  constructor() {
    super();
  }
  protected _init() {
    try {
      this.players = world.getAllPlayers();
    } catch (error) {
      throw new ReferenceError("Native variable [PlayerManager] does not have required privileges.");
    }

    world.afterEvents.playerSpawn.subscribe((e) => {
      if (e.initialSpawn) {
        if (!this.players.some((p) => p.id === e.player.id)) {
          this.players.push(e.player);
        }
      }
    });

    world.afterEvents.playerLeave.subscribe((e) => {
      this.players = this.players.filter((p) => p.id !== e.playerId);
    });
  }
}

export class EntityManager extends Manager {
  entities: Entity[] = [];
  private _options: EntityQueryOptions;

  constructor(options: EntityQueryOptions = {}) {
    super();
    this._loadEntities(options);
    this._options = options;
  }

  private _loadEntities(options: EntityQueryOptions) {
    try {
      this.entities = world.getEntities(options);
    } catch (error) {
      throw new ReferenceError("Native variable [EntityManager] does not have required privileges.");
    }
  }

  private _isMatch(entity: Entity): boolean {
    const options: EntityQueryOptions = this._options;
    options.location = entity.location;
    options.maxDistance = 0.1;
    const match = entity.dimension.getEntities(options);
    return match.length > 0;
  }

  protected _init() {
    world.afterEvents.entitySpawn.subscribe((e) => {
      if (this._isMatch(e.entity) && !this.entities.some((ent) => ent.id === e.entity.id)) this.entities.push(e.entity);
    });

    world.afterEvents.entityLoad.subscribe((e) => {
      if (this._isMatch(e.entity) && !this.entities.some((ent) => ent.id === e.entity.id)) this.entities.push(e.entity);
    });

    world.afterEvents.entityRemove.subscribe((e) => {
      this.entities = this.entities.filter((ent) => ent.id !== e.removedEntityId);
    });
  }
}
