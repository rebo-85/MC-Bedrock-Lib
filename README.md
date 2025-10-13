# MC-Bedrock-Lib

Utility lib for Minecraft Bedrock Scripting API. Ergonomic helpers, extended classes, and prototype extensions for smoother scripting.

---

## Install

```
npm install
npm run build
```

After building, use the files in the `dist` folder and import them in your packs.

---

## Usage

```js
import * as mbl from "mc-bedrock-lib";
// or
import { Vector3, Cutscene, world, system } from "mc-bedrock-lib";
// or
import "mc-bedrock-lib";
```

---

## Features

- Extended prototypes for Player, Entity, World, Block, ItemStack, etc.
- Utility classes: Vector2, Vector3, etc.
- Custom afterEvents: entityJump, entitySneak, entityEquip, etc.
- String parsing: `"@a[tag=admin]".toEQO()` `"12 34 56".toVector3()`
- Helpers: arraysEqual, objectsEqual, Math.randomInt(min, max)

---

## Example

```js
import { afterEvents, Vector3 } from "mc-bedrock-lib";

afterEvents.entityJump.subscribe((e) => {
  world.sendMessage(`${e.entity.typeId} jumped at ${e.entity.coordinates}`);
});

const pos = new Vector3(10, 64, 10);
```

You can use mc-bedrock-lib to add custom properties to Minecraft modules. These helpers extend the original objects from @minecraft/server.

```js
// Without library:
import { world, EntityComponentTypes, EquipmentSlot, ItemStack } from "@minecraft/server";

for (const player of world.getPlayers()) {
  player.onScreenDisplay.setTitleBar("Welcome!");

  player
    .getComponent(EntityComponentTypes.Inventory)
    .setEquipment(EquipmentSlot.Mainhand, new ItemStack("minecraft:apple"));

  const result1 = player.runCommand("say 1");
  const result2 = player.runCommand("say 2");
  const result3 = player.runCommand("say 3");
  const result4 = player.runCommand("say 4");

  const successCount = result1.successCount + result2.successCount + result3.successCount + result4.successCount; // 4
}

// With library
import { world, ItemStack } from "@minecraft/server";
import "mc-bedrock-lib";

for (const player of world.players) {
  player.setTitleBar("Welcome!");
  player.setMainhand(new ItemStack("minecraft:apple"));
  const result = player.commandRun("say 1", "say 2", ["say 3", "say 4"]); // {successCount: 4}
}
```

You can use custom properties anywhere in your scripts after importing the library once in your entrypoint (like `index.js`).  
For example, after this import in your main file:

```js
import "mc-bedrock-lib";
```

You can use helpers like `setMainhand` or `commandRun` in any other module:

```js
// someModule.js
import { world, ItemStack } from "@minecraft/server";

for (const player of world.players) {
  player.setMainhand(new ItemStack("minecraft:diamond_sword"));
  player.commandRun("say Equipped sword");
}
```

No need to re-import the library in every file—just import it once at startup.

---

## Notes

- Requires Minecraft Bedrock Scripting API v2
- See /src for all available classes and extensions
- For advanced usage, check /src/server_extension.ts and /src/classes

---

## License

MIT
