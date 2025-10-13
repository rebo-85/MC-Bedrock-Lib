import { world, system } from "@minecraft/server";

export interface Fade {
  fadeIn: number;
  fadeHold: number;
  fadeOut: number;
}

export interface Scene {
  posStart: any;
  posEnd: any;
  rotStart: any;
  rotEnd: any;
  duration: number;
  fade: Fade;
  ease_type: string;
}

export interface TimedCommand {
  time: number;
  timeTick: number;
  commands: string[];
}

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
      (entity as any)
        .commandRun(
          `inputpermission set @s camera disabled`,
          `inputpermission set @s movement disabled`
        )(entity as any)
        .commandRun("hud @s hide all");
      const checkpoint = { pos: (entity as any).location, rot: (entity as any).rotation };

      let originalGamemode: string | null = null;
      if (this.is_spectator) {
        const currentGamemode = (entity as any).gamemode?.toString?.() || (entity as any).gamemode || "adventure";
        originalGamemode = currentGamemode === "spectator" ? "adventure" : currentGamemode;
        (entity as any).commandRun(`gamemode spectator @s`);
      }
      if (this.is_invisible) (entity as any).commandRun(`effect @s invisibility infinite 0 true`);

      this.timedCommands.forEach((timedCommand) => {
        (entity as any).timedCommand(timedCommand.time, timedCommand.commands);
      });

      let timeline = 0;
      this.scenes.forEach((scene, i) => {
        const fade = scene.fade;
        let fadeInTime = 0;
        if (fade) {
          system.runTimeout(() => {
            (entity as any).camera.fade({
              fadeInTime: fade.fadeIn,
              holdTime: fade.fadeHold,
              fadeOutTime: fade.fadeOut,
            });
          }, timeline);
          fadeInTime = fade.fadeIn;
        }

        const endTime = scene.duration * 20 + fadeInTime * 20;
        system.runTimeout(() => {
          system.runTimeout(() => {
            (entity as any).teleport(scene.posStart, { facingLocation: scene.rotStart });
          }, fadeInTime * 20);

          system.runTimeout(() => {
            (entity as any).commandRun(
              `camera @s set minecraft:free pos ${scene.posStart.toString()} facing ${scene.rotStart.toString()}`,
              `camera @s set minecraft:free ease ${scene.duration} ${
                scene.ease_type
              } pos ${scene.posEnd.toString()} facing ${scene.rotEnd.toString()}`
            );
          }, fadeInTime * 20);

          system.runTimeout(() => {
            (entity as any)
              .commandRun(`camera @s clear`)(entity as any)
              .commandRun("hud @s reset all");
            if (i === this.scenes.length - 1) {
              if (this.is_spectator) {
                if (originalGamemode) {
                  (entity as any).commandRun(`gamemode ${originalGamemode} @s`);
                } else {
                  (entity as any).commandRun(`gamemode adventure @s`);
                }
              }
              if (this.is_invisible)
                (entity as any)
                  .commandRun(`effect @s invisibility 0`)(entity as any)
                  .commandRun(
                    `inputpermission set @s camera enabled`,
                    `inputpermission set @s movement enabled`
                  )(entity as any)
                  .teleport(checkpoint.pos, { rotation: checkpoint.rot });
            }
          }, endTime);
        }, timeline);

        timeline += endTime;
      });
    }
  }
}
