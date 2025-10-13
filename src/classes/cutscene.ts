import { world, system, Player, CameraFadeOptions } from "@minecraft/server";

import { Scene, TimedCommand } from "../interface";
import { RunTimeOut } from "./utils";

export class Cutscene {
  target: any;
  scenes: Scene[];
  timedCommands: TimedCommand[];
  is_invisible: boolean;
  is_spectator: boolean;
  constructor(
    target: any,
    scenes: Scene[],
    timedCommands: TimedCommand[] = [],
    is_spectator: boolean = true,
    is_invisible: boolean = true
  ) {
    this.target = target;
    this.scenes = scenes;
    this.timedCommands = timedCommands;
    this.is_spectator = is_spectator;
    this.is_invisible = is_invisible;
  }
  play() {
    const entities = world.getEntities(this.target);
    for (const entity of entities) {
      const player: Player = entity as Player;
      player.commandRun(`inputpermission set @s camera disabled`, `inputpermission set @s movement disabled`);
      player.commandRun("hud @s hide all");
      const checkpoint = { pos: player.location, rot: player.rotation };

      let originalGamemode: string | null = null;
      if (this.is_spectator) {
        const currentGamemode = player.gamemode?.toString?.() || player.gamemode || "adventure";
        originalGamemode = currentGamemode === "spectator" ? "adventure" : currentGamemode;
        player.commandRun(`gamemode spectator @s`);
      }
      if (this.is_invisible) player.commandRun(`effect @s invisibility infinite 0 true`);

      this.timedCommands.forEach((timedCommand) => {
        new RunTimeOut(() => {
          player.commandRun(timedCommand.commands);
        }, timedCommand.timeTick);
      });

      let timeline = 0;
      this.scenes.forEach((scene, i) => {
        const fade = scene.fade;
        let fadeInTime = 0;
        if (fade) {
          system.runTimeout(() => {
            player.camera.fade({
              fadeTime: {
                fadeInTime: fade.fadeIn,
                holdTime: fade.fadeHold,
                fadeOutTime: fade.fadeOut,
              },
            });
          }, timeline);
          fadeInTime = fade.fadeIn;
        }

        const endTime = scene.duration * 20 + fadeInTime * 20;
        system.runTimeout(() => {
          system.runTimeout(() => {
            player.teleport(scene.posStart, { facingLocation: scene.rotStart });
          }, fadeInTime * 20);

          system.runTimeout(() => {
            player.commandRun(
              `camera @s set minecraft:free pos ${scene.posStart.toString()} facing ${scene.rotStart.toString()}`,
              `camera @s set minecraft:free ease ${scene.duration} ${
                scene.ease_type
              } pos ${scene.posEnd.toString()} facing ${scene.rotEnd.toString()}`
            );
          }, fadeInTime * 20);

          system.runTimeout(() => {
            player.commandRun(`camera @s clear`);
            player.commandRun("hud @s reset all");
            if (i === this.scenes.length - 1) {
              if (this.is_spectator) {
                if (originalGamemode) {
                  player.commandRun(`gamemode ${originalGamemode} @s`);
                } else {
                  player.commandRun(`gamemode adventure @s`);
                }
              }
              if (this.is_invisible) player.commandRun(`effect @s invisibility 0`);
              player.commandRun(`inputpermission set @s camera enabled`, `inputpermission set @s movement enabled`);
              player.teleport(checkpoint.pos, { rotation: checkpoint.rot });
            }
          }, endTime);
        }, timeline);

        timeline += endTime;
      });
    }
  }
}
