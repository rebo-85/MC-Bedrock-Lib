import { Entity, Dimension, world } from "@minecraft/server";
import { CommandResult } from "./classes";

const entityRunCommand = Entity.prototype.runCommand;
const dimensionRunCommand = Dimension.prototype.runCommand;

export function defineProperties(target: object, properties: Record<string, PropertyDescriptor>) {
  for (const [property, descriptor] of Object.entries(properties)) {
    Object.defineProperty(target, property, { ...descriptor, configurable: true });
  }
}

export function getRandomElement<T>(array: T[]): T {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}

export function generateUUIDv4(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
export function idTranslate(id: string): string {
  return id
    .split(":")[1]
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function runCommand(
  this: Entity | Dimension,
  source: typeof Entity | typeof Dimension,
  ...commands: string[] | string[][]
): CommandResult {
  const result = new CommandResult();

  const flattenedCommands = commands.flat();

  flattenedCommands.forEach((command) => {
    if (source === Entity) {
      const cr = entityRunCommand.call(this, command);
      if (cr.successCount > 0) {
        result.successCount++;
      }
    } else if (source === Dimension) {
      const cr = dimensionRunCommand.call(this, command);
      if (cr.successCount > 0) {
        result.successCount++;
      }
    }
  });
  return result;
}

export function display(value: any, type: "chat" | "error" | "log" = "chat"): void {
  value = JSON.stringify(value, null, 0);
  switch (type) {
    case "chat":
      world.sendMessage(`${value}`);
      break;
    case "error":
      console.error(value);
      break;
    case "log":
      console.log(value);
      break;
    default:
      world.sendMessage(`${value}`);
      break;
  }
}

export function arraysEqual(arr1: any[], arr2: any[]): boolean {
  if (arr1 === arr2) return true;
  if (arr1 == null || arr2 == null) return false;
  if (arr1.length !== arr2.length) return false;

  for (let i = 0; i < arr1.length; ++i) {
    if (typeof arr1[i] === "object" && typeof arr2[i] === "object") {
      if (!objectsEqual(arr1[i], arr2[i])) return false;
    } else if (arr1[i] !== arr2[i]) {
      return false;
    }
  }
  return true;
}

function objectsEqual(obj1: Record<string, any>, obj2: Record<string, any>): boolean {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (obj1[key] !== obj2[key]) return false;
  }

  return true;
}
