import { Vector3, Vector2 } from "./classes/index";
import { defineProperties } from "./utils";

Math.randomInt = function (min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

defineProperties(String.prototype, {
  toTitleCase: {
    value: function (): string {
      return (this as String)
        .toLowerCase()
        .split(" ")
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    },
  },

  toVector2: {
    value: function (): Vector2 | undefined {
      const pattern = (this as String).match(/^(\d+)\s(\d+)$/);
      if (pattern) {
        const x = parseInt(pattern[1]);
        const y = parseInt(pattern[2]);
        return new Vector2(x, y);
      }

      switch ((this as String).toLowerCase()) {
        case "north":
          return new Vector2(0, 180);
        case "east":
          return new Vector2(0, -90);
        case "south":
          return new Vector2(0, 0);
        case "west":
          return new Vector2(0, 90);
        default:
          return;
      }
    },
  },

  toVector3: {
    value: function (): Vector3 | undefined {
      const coordinates = (this as String).split(" ").map(parseFloat);
      if (coordinates.some(isNaN) || coordinates.length !== 3) {
        console.error('Invalid string format. It should be "x y z"');
        return;
      }
      return new Vector3(coordinates[0], coordinates[1], coordinates[2]);
    },
  },

  toEQO: {
    value: function (): Record<string, any> | undefined {
      const options: Record<string, any> = {};
      const regex = /^@(a|p|r|e|s|initiator)(?:\[(.+)\])?$/;
      const matches = (this as String).match(regex);
      if (matches && matches.length >= 2) {
        const attributes = matches[2] ? matches[2].split(",") : [];
        let excludeFamilies: string[] = [];
        let excludeGameModes: string[] = [];
        let excludeTags: string[] = [];
        let excludeTypes: string[] = [];
        let families: string[] = [];
        let tags: string[] = [];
        options.location = { x: 0, y: 0, z: 0 };

        attributes.forEach((attribute: string) => {
          const [key, value] = attribute.split("=").map((part: string) => part.trim());
          let trimmedValue = value;

          const quotedMatch = value.match(/^"(.+)"$/);
          if (quotedMatch) {
            trimmedValue = quotedMatch[1];
          }

          switch (key) {
            case "c":
              options.closest = parseInt(trimmedValue, 10);
              if (["p", "r", "s", "initiator"].includes(matches[1])) {
                options.closest = 1;
              }
              break;
            case "family":
              if (trimmedValue.startsWith("!")) {
                excludeFamilies.push(trimmedValue.replace(/^!/, ""));
                options.excludeFamilies = excludeFamilies;
              } else {
                families.push(trimmedValue);
                options.families = families;
              }
              break;
            case "l":
              options.maxLevel = parseInt(trimmedValue, 10);
              break;
            case "lm":
              options.minLevel = parseInt(trimmedValue, 10);
              break;
            case "m":
              if (trimmedValue.startsWith("!")) {
                excludeGameModes.push(trimmedValue.replace(/^!/, ""));
                options.excludeGameModes = excludeGameModes;
              } else {
                options.gameMode = parseInt(trimmedValue, 10) || trimmedValue;
              }
              break;
            case "name":
              options.name = trimmedValue;
              break;
            case "r":
              options.maxDistance = parseInt(trimmedValue, 10);
              break;
            case "rm":
              options.minDistance = parseInt(trimmedValue, 10);
              break;
            case "rx":
              options.location.x = parseInt(trimmedValue, 10);
              break;
            case "rxm":
              options.minHorizontalRotation = parseInt(trimmedValue, 10);
              break;
            case "ry":
              options.location.y = parseInt(trimmedValue, 10);
              break;
            case "rym":
              options.minVerticalRotation = parseInt(trimmedValue, 10);
              break;
            case "tag":
              if (trimmedValue.startsWith("!")) {
                excludeTags.push(trimmedValue.replace(/^!/, ""));
                options.excludeTags = excludeTags;
              } else {
                tags.push(trimmedValue);
                options.tags = tags;
              }
              break;
            case "type":
              if (trimmedValue.startsWith("!")) {
                excludeTypes.push(trimmedValue.replace(/^!/, ""));
                options.excludeTypes = excludeTypes;
              } else {
                options.type = trimmedValue;
              }
              if (["a", "p", "r", "s", "initiator"].includes(matches[1])) {
                options.type = "minecraft:player";
              }
              break;
            case "x":
              options.location.x = parseInt(trimmedValue, 10);
              break;
            case "y":
              options.location.y = parseInt(trimmedValue, 10);
              break;
            case "z":
              options.location.z = parseInt(trimmedValue, 10);
              break;
            default:
              console.warn(`'${key}' cannot be converted to EntityQueryOptions property.`);
              break;
          }
        });

        if (["a", "p", "r", "s", "initiator"].includes(matches[1])) {
          options.type = "minecraft:player";
          if (matches[1] !== "a") {
            options.closest = 1;
          }
        }

        return options;
      } else {
        console.error(`"${this}" is not a valid selector.`);
        return;
      }
    },
  },
});
declare global {
  interface Map<K = any, V = any> {
    display(): void;
  }
}
defineProperties(Map.prototype, {
  display: {
    value: function (): void {
      (this as unknown as Map<any, any>).forEach((v: any, k: any) => {
        console.warn(`${k}, ${JSON.stringify(v)}`);
      });
    },
  },
});
