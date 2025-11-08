import { Player, world } from "@minecraft/server";
import { Manager } from "./utils";


export class PlayerManager extends Manager {
  players: Player[] = [];
  constructor() {
    super();
  }
  protected _init() {
    const worldLoadCB = () => {
      this.players = world.getAllPlayers();

      world.afterEvents.worldLoad.unsubscribe(worldLoadCB);
    }
    world.afterEvents.worldLoad.subscribe(worldLoadCB);

    world.afterEvents.playerSpawn.subscribe((e) => {
      if (e.initialSpawn) this.players.push(e.player);
    });

    world.afterEvents.playerLeave.subscribe((e) => {
      this.players = this.players.filter((p) => p.id !== e.playerId);
    });
  }
}
