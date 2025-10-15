import {
  Player,
  Entity,
  Dimension,
  world,
  system,
  CustomCommandParamType,
  CommandPermissionLevel,
  CustomCommandOrigin,
  CustomCommandStatus,
} from "@minecraft/server";
import { SceneData, SceneFrame } from "../interface";
import { Vector2, Vector3 } from "./general";
import { CommandRegistry } from "./registry";
import { Run } from "./utils";
import { toCommandDecimal } from "utils";
class ScenePlayer {
  scenarioData: SceneData = {} as SceneData;
  activeScene: number | null = null;

  constructor(command: string = "ecs_mp:playscene") {
    world.afterEvents.worldLoad.subscribe(() => {
      world.getAllPlayers().forEach((player) => {
        player.commandRun("camera @s clear", "hud @s reset");
        player.ipCamera = true;
        player.ipMovement = true;
      });
    });

    const commandRegistry = new CommandRegistry();
    commandRegistry.add(
      {
        cheatsRequired: true,
        description: "Play the scene to players",
        name: command,
        mandatoryParameters: [
          { name: "SceneID", type: CustomCommandParamType.String },
          { name: "actor", type: CustomCommandParamType.EntitySelector },
          { name: "players", type: CustomCommandParamType.PlayerSelector },
        ],
        permissionLevel: CommandPermissionLevel.Any,
      },
      (origin: CustomCommandOrigin, sceneId, actors, players) => {
        let result = { message: `Executing Scene: "${sceneId}"`, status: CustomCommandStatus.Success };
        if (actors.length > 0) {
          if (actors.length == 1) {
            if (players.length > 0 && origin.source) {
              new Run(() => {
                this._runScene(origin.source.dimension, actors[0], players);
              });
            } else {
              result.message = "No players matched selector";
              result.status = CustomCommandStatus.Failure;
            }
          } else {
            result.message = "Too many actors matched selector";
            result.status = CustomCommandStatus.Failure;
          }
        } else {
          result.message = "No actors found matched selector";
          result.status = CustomCommandStatus.Failure;
        }
        new Run(() => {});
        return result;
      }
    );
  }

  private _handleCommand(
    dimension: Dimension,
    commandObj: { time: number; data_points: string[] },
    executedCommands: Set<number>,
    tick: number,
    epsilon: number
  ) {
    if (Math.abs(commandObj.time - tick) <= epsilon && !executedCommands.has(commandObj.time)) {
      try {
        dimension.commandRun(...commandObj.data_points);
        executedCommands.add(commandObj.time);
      } catch (e: any) {
        world.sendMessage(e.message);
      }
    }
  }

  private _handleSound(scenario: SceneData, tick: number, playedSounds: Set<number>, epsilon: number) {
    for (const sound of scenario.sounds) {
      if (Math.abs(sound.time - tick) <= epsilon && !playedSounds.has(sound.time)) {
        playedSounds.add(sound.time);
        return sound;
      }
    }
    return null;
  }

  private _setPlayerCamera(
    player: Player,
    actorEntity: Entity,
    framePos: Vector3,
    frameRot: Vector2,
    tickDelta: number
  ) {
    const rel = framePos.offset(new Vector3(-actorEntity.location.x, -actorEntity.location.y, -actorEntity.location.z));
    const rot = rel.rotate(actorEntity.getRotation().y);
    const finalPos = rot.offset(Vector3.extend(actorEntity.location));
    const rx = frameRot.x;
    const ry = this._normalizeRotation(frameRot.y + actorEntity.getRotation().y);
    const cmd = `camera @s set minecraft:free ease ${tickDelta} linear pos ${toCommandDecimal(
      finalPos.x
    )} ${toCommandDecimal(finalPos.y)} ${toCommandDecimal(finalPos.z)} rot ${toCommandDecimal(rx)} ${toCommandDecimal(
      ry
    )}`;
    player.commandRun(cmd);
  }

  private _resetPlayer(player: Player, prevGameMode: string, checkpoint: { location: Vector3; rotation: Vector2 }) {
    player.commandRun(
      "effect @s invisibility 0",
      "hud @s reset",
      `gamemode ${prevGameMode} @s`,
      `teleport @s ${checkpoint.location.x} ${checkpoint.location.y} ${checkpoint.location.z} ${checkpoint.rotation.y} ${checkpoint.rotation.x}`
    );
    player.ipCamera = true;
    player.ipMovement = true;
    system.runTimeout(() => player.commandRun("camera @s clear"), 1);
  }

  private _runScene(dimension: Dimension, actor: Entity, players: Player[]) {
    if (this.activeScene) system.clearRun(this.activeScene);
    const playerGameModes = new Map<string, string>();
    const playerCheckpoints = new Map<string, { location: Vector3; rotation: Vector2 }>();
    const executedCommands = new Set<number>();
    const playedSounds = new Set<number>();
    actor.playAnimation(this.scenarioData.animationId);
    players.forEach((player: Player) => {
      playerGameModes.set(player.id, player.gamemode);
      playerCheckpoints.set(player.id, {
        location: Vector3.extend(player.location),
        rotation: Vector2.extend(player.rotation),
      });
      player.commandRun(
        "camera @s clear",
        "effect @s invisibility infinite 1 true",
        "hud @s hide all",
        "gamemode spectator @s"
      );
      player.ipCamera = false;
      player.ipMovement = false;
    });
    let tick = 0,
      ticksPerSecond = 20,
      lastTick: number | null = null;
    const updateScene = () => {
      const now = Date.now();
      let elapsed = lastTick === null ? 1 / ticksPerSecond : (now - lastTick) / 1000;
      lastTick = now;
      ticksPerSecond = 1 / elapsed;
      const tickDelta = 1 / ticksPerSecond;
      tick += tickDelta;
      const framePos = this._calculateFramePosition(actor, tick);
      const frameRot = this._calculateFrameRotation(actor, tick);
      this.scenarioData.commands.forEach((cmd) => this._handleCommand(dimension, cmd, executedCommands, tick, 0.05));
      const currentSound = this._handleSound(this.scenarioData, tick, playedSounds, 0.05);
      players.forEach((player: Player) => {
        player.teleport(framePos, { rotation: new Vector2(frameRot.x, frameRot.y) });
        this._setPlayerCamera(player, actor, framePos, frameRot, tickDelta);
        if (currentSound) currentSound.data_points.forEach((snd: string) => player.playSound(snd));
      });
      if (tick >= this.scenarioData.length) {
        players.forEach((player: Player) =>
          this._resetPlayer(player, playerGameModes.get(player.id)!, playerCheckpoints.get(player.id)!)
        );
        system.runTimeout(() => system.clearRun(this.activeScene!), 1);
      } else {
        this.activeScene = system.run(updateScene);
      }
    };
    this.activeScene = system.run(updateScene);
  }

  private _getKeyframes(frames: SceneFrame[], tick: number): [SceneFrame, SceneFrame] {
    let l = 0,
      r = frames.length - 1;
    while (l < r) {
      const m = (l + r) >> 1;
      if (frames[m].time < tick) l = m + 1;
      else r = m;
    }
    return [frames[l - 1] || frames[l], frames[l]];
  }

  private _normalizeRotation(rot: number) {
    return ((rot + 180) % 360) - 180;
  }

  private _easeTime(t: number, mode = "linear") {
    if (mode === "easeIn") return t * t;
    if (mode === "easeOut") return t * (2 - t);
    if (mode === "easeInOut") return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    return t;
  }

  private _calculateFramePosition(actorEntity: Entity, tick: number) {
    const keyframes = this.scenarioData.positions || [];
    if (!keyframes.length) return Vector3.extend(actorEntity.location);
    const [startFrame, endFrame] = this._getKeyframes(keyframes, tick);
    const posStart = Vector3.extend(startFrame.data_points).offset(Vector3.extend(actorEntity.location));
    const posEnd = Vector3.extend(endFrame.data_points).offset(Vector3.extend(actorEntity.location));
    if (!startFrame || !endFrame) return Vector3.extend(actorEntity.location);
    const tNorm = (tick - startFrame.time) / (endFrame.time - startFrame.time);
    const eased = this._easeTime(tNorm, startFrame.interpolation || "linear");
    return Vector3.lerp(posStart, posEnd, eased);
  }

  private _calculateFrameRotation(actorEntity: Entity, tick: number) {
    const keyframes = this.scenarioData.rotations || [];
    if (!keyframes.length) return Vector2.extend(actorEntity.rotation);
    const [startFrame, endFrame] = this._getKeyframes(keyframes, tick);
    if (!startFrame || !endFrame) return Vector2.extend(actorEntity.rotation);
    const tNorm = (tick - startFrame.time) / (endFrame.time - startFrame.time);
    const eased = this._easeTime(tNorm, startFrame.interpolation || "linear");
    return Vector2.lerp(startFrame.data_points, endFrame.data_points, eased);
  }
}

export { ScenePlayer };
