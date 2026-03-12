import { WeatherType } from "@minecraft/server";

// Command & Execution
export interface CommandResult {
  successCount: number;
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

export type Edge = "left" | "right" | "top" | "bottom";
