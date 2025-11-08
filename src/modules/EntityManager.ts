import { Player, Entity, world, EntityQueryOptions } from "@minecraft/server";
import { Manager } from "./utils";

export class PlayerManager extends Manager {
  private _players: Player[] = [];
  private _initialized: boolean = false;
  constructor() {
    super();
  }
  get players(): Player[] {
    if (!this._initialized)
      throw new ReferenceError("Native variable [PlayerManager::players] does not have required privileges.");

    return this._players;
  }
  protected _init() {
    const callback = () => {
      this._players = world.getAllPlayers();

      this._initialized = true;
      world.afterEvents.worldLoad.unsubscribe(callback);
    };
    world.afterEvents.worldLoad.subscribe(callback);

    world.afterEvents.playerSpawn.subscribe((e) => {
      if (e.initialSpawn) {
        if (!this._players.some((p) => p.id === e.player.id)) {
          this._players.push(e.player);
        }
      }
    });

    world.afterEvents.playerLeave.subscribe((e) => {
      this._players = this._players.filter((p) => p.id !== e.playerId);
    });
  }
}

export class EntityManager extends Manager {
  private _entities: Entity[] = [];
  private _initialized: boolean = false;
  private _options: EntityQueryOptions;

  constructor(options: EntityQueryOptions = {}) {
    super();
    this._loadEntities(options);
    this._options = options;
  }

  private _loadEntities(options: EntityQueryOptions) {
    const callback = () => {
      const overworld = world.getDimension("overworld").getEntities(options);
      const nether = world.getDimension("nether").getEntities(options);
      const theEnd = world.getDimension("the_end").getEntities(options);

      this._entities = [...overworld, ...nether, ...theEnd];

      this._initialized = true;
      world.afterEvents.worldLoad.unsubscribe(callback);
    };
    world.afterEvents.worldLoad.subscribe(callback);
  }

  private _isMatch(entity: Entity): boolean {
    const options: EntityQueryOptions = this._options;
    options.location = entity.location;
    options.maxDistance = 0.1;
    const match = entity.dimension.getEntities(options);
    return match.length > 0;
  }

  get entities(): Entity[] {
    if (!this._initialized)
      throw new ReferenceError("Native variable [EntityManager::entities] does not have required privileges.");

    return this._entities;
  }

  protected _init() {
    world.afterEvents.entitySpawn.subscribe((e) => {
      if (this._isMatch(e.entity) && !this._entities.some((ent) => ent.id === e.entity.id))
        this._entities.push(e.entity);
    });

    world.afterEvents.entityLoad.subscribe((e) => {
      if (this._isMatch(e.entity) && !this._entities.some((ent) => ent.id === e.entity.id))
        this._entities.push(e.entity);
    });

    world.afterEvents.entityRemove.subscribe((e) => {
      this._entities = this._entities.filter((ent) => ent.id !== e.removedEntityId);
    });
  }
}
