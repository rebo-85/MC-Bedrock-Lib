import { Player, WeatherType } from "@minecraft/server";
import { Vector3 } from "modules";

// Command & Execution
export interface CommandResult {
  successCount: number;
}

export interface TimedCommand {
  timeTick: number;
  commands: string[];
}

// Scene & Animation
export interface Fade {
  fadeIn: number;
  fadeHold: number;
  fadeOut: number;
}

export interface Scene {
  posStart: Vector3;
  posEnd: Vector3;
  rotStart: Vector3;
  rotEnd: Vector3;
  duration: number;
  fade: Fade;
  ease_type: string;
}

export interface SceneFrame {
  time: number;
  data_points: Vector3;
  interpolation?: string;
}

export interface SceneData {
  sceneId: string;
  animationId: string;
  positions?: SceneFrame[];
  rotations?: SceneFrame[];
  commands: { time: number; data_points: string[] }[];
  sounds: { time: number; data_points: string[] }[];
  length: number;
}

export interface CutsceneOptions {
  target: Player;
  scenes: Scene[];
  timedCommands?: TimedCommand[];
  is_spectator?: boolean;
  is_invisible?: boolean;
}

// World & Environment
export interface WeatherOptions {
  type: WeatherType;
  duration: number;
}

// Player Data
export interface XpData {
  level: number;
  xpEarnedAtCurrentLevel: number;
  totalXpNeededForNextLevel: number;
}
