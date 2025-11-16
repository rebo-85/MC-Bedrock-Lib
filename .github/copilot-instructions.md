# MC-Bedrock-Lib Development Instructions

## Architecture Overview

This is a **prototype extension library** for Minecraft Bedrock Edition Scripting API v2. The core pattern is extending native `@minecraft/server` classes via prototype manipulation to add ergonomic helpers and utilities.

**Key architectural principle**: Import `"mc-bedrock-lib"` once in your entry point, and all prototype extensions become globally available. Users can then import types from `@minecraft/server` directly and use the extended properties/methods.

## Project Structure

- `src/index.ts` - Main entry point that exports and applies all extensions
- `src/server_extension.ts` - Prototype extensions for Minecraft classes (Player, Entity, World, Block, ItemStack, etc.)
- `src/js_extension.ts` - Prototype extensions for JavaScript natives (String, Math, Map)
- `src/modules/` - Utility classes (Vector2, Vector3) and custom event systems
- `src/modules/external/` - Example implementations (countdown timer, scene player, etc.)
- `src/types/index.d.ts` - Type definitions for all prototype extensions
- `scripts/patch-dts.js` - Post-build script that merges type definitions into the bundle

## Build System

```bash
npm run build  # Bundles with esbuild + generates types with dts-bundle-generator + patches types
npm run dev    # Watch mode with nodemon
```

**Critical**: The build chain is `esbuild → dts-bundle-generator → patch-dts.js`. The patch script extracts `declare global` and `declare module` blocks from `src/types/index.d.ts` and appends them to the final `.d.ts` file so TypeScript recognizes the prototype extensions.

## Prototype Extension Pattern

Use `defineProperties()` from `utils.ts` to extend prototypes safely:

```typescript
defineProperties(Player.prototype, {
  gamemode: {
    get: function (): GameMode {
      return (this as Player).getGameMode();
    },
    set: function (gm: GameMode) {
      (this as Player).setGameMode(gm);
    },
    enumerable: true,
  },
  setMainhand: {
    value: function (item: ItemStack) {
      this.setEquipment?.(EquipmentSlot.Mainhand, item);
    },
  },
});
```

- Use `enumerable: true` for properties that should show in autocomplete
- Always cast `this` to the correct type
- Prefer getters/setters for computed properties
- Use `value` for methods

## Custom Event System

Custom events (like `entityJump`, `entitySneak`) are implemented as:

1. Event signal classes in `src/modules/events.ts` (e.g., `PlayerJumpAfterEventSignal`)
2. Getters on `WorldAfterEvents.prototype` in `src/server_extension.ts` that return new instances
3. Event managers track state via `EntityManager`/`PlayerManager` classes

When adding new events:

- Create event class extending `PlayerAfterEvent` or `EntityAfterEvent`
- Create signal class with `subscribe()` method using `EntityManager`
- Add getter to `WorldAfterEvents.prototype`
- Use `system.runInterval()` for polling-based events

## Conventions

### Naming

- Shortened property names for common operations: `player.x`, `entity.health`, `world.players`
- Component shortcuts end with "Component": `entity.healthComponent`, `item.durabilityComponent`
- Coordinate shortcuts: `cx/cy/cz` (floor coords), `x/y/z` (precise), `rx/ry` (rotation), `vx/vy/vz` (velocity)
- Use `get`/`set` prefixes for action methods: `getItems()`, `setMainhand()`

### TypeScript

- Target `es2020`, module `esnext`
- Always type function parameters and return values
- Use `undefined` for optional returns (not `null`)
- Mark Minecraft types with `@minecraft/server` imports explicitly

### String Parsing

String prototype extensions enable command-style parsing:

- `"10 64 10".toVector3()` → `Vector3`
- `"@a[tag=admin]".toEQO()` → `EntityQueryOptions`
- `"north".toVector2()` → rotation Vector2

Use these for config parsing and user input handling.

## Working with Minecraft API

### Entity/Player Extensions

- Use shortened accessors: `player.health = 20` instead of `player.getComponent(EntityComponentTypes.Health).setCurrentValue(20)`
- Batch commands with `commandRun()`: `player.commandRun("say 1", "say 2", ["say 3"])`
- Check inventory/equipment with `getItems(typeId?)` which returns `Map<slot, ItemStack>`

### ItemStack Comparisons

Use `item.compare(other)` for deep equality (checks amount, lore, tags, enchantments, dynamic properties)

### Block State Manipulation

```typescript
block.setState("facing", "north"); // Sets state directly
block.getState("facing"); // Gets state value
```

## Adding New Features

1. **New prototype method/property**: Add to appropriate section in `server_extension.ts`, update `src/types/index.d.ts` with type definition
2. **New utility class**: Add to `src/modules/general.ts` or create new module file, export from `src/modules/index.ts`
3. **New custom event**: Create event + signal classes in `src/modules/events.ts`, add getter in `server_extension.ts`
4. **New example/module**: Add to `src/modules/external/`, these are opt-in examples not part of core library

## Common Pitfalls

- **Don't forget type definitions**: Every prototype extension needs a corresponding `declare global` or `declare module` block in `src/types/index.d.ts`
- **Component access can return undefined**: Always check or use optional chaining: `entity.healthComponent?.currentValue`
- **External imports must be excluded**: esbuild config excludes `@minecraft/server` and `@minecraft/server-ui` - never bundle these
- **Dimension-specific queries**: `world.getEntities()` searches all dimensions (overworld, nether, end)

## Testing Workflow

No automated tests - this library is tested in-game. Build, copy `dist/` files into a behavior pack, and test in Minecraft.

Common test scenarios:

- Prototype extensions work after single import
- Custom events fire correctly
- Type definitions show proper autocomplete
- String parsing handles edge cases
