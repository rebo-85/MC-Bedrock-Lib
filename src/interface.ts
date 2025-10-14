export interface CommandResult {
  successCount: number;
}

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
  timeTick: number;
  commands: string[];
}

export interface CutsceneOptions {
  target: any;
  scenes: Scene[];
  timedCommands?: TimedCommand[];
  is_spectator?: boolean;
  is_invisible?: boolean;
}
