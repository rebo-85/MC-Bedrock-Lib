# Debug Commands

A collection of utility commands for debugging and testing in Minecraft Bedrock.

## Setup

```typescript
import { DebugCommands } from "mc-bedrock-lib";

// Register all debug commands on startup
DebugCommands.register();
```

## Available Commands

All commands require permission level 2 (operator).

### Player Info

```
/dbg_info
```

Displays detailed player information including:

- ID and name
- Location and rotation
- Dimension
- Health and XP
- Movement states (on ground, sneaking, swimming, flying)

### Clear Inventory

```
/dbg_clear
```

Clears the player's entire inventory.

### Heal

```
/dbg_heal
```

Heals the player to full health.

### Entity Count

```
/dbg_entities
```

Lists all entities in the current dimension with counts by type (shows top 10).

### Teleport

```
/dbg_tp <x> <y> <z>
```

Teleports the player to the specified coordinates.

Example:

```
/dbg_tp 100 64 -200
```

### Give Item

```
/dbg_give <item> [amount]
```

Gives the specified item to the player.

Examples:

```
/dbg_give minecraft:diamond_sword
/dbg_give minecraft:iron_ingot 64
```

### Block Info

```
/dbg_block
```

Displays information about the block at the player's feet, including type, location, and block states.

### Set Time

```
/dbg_time <time>
```

Sets the time of day (0-24000).

Examples:

```
/dbg_time 0      # Dawn
/dbg_time 6000   # Noon
/dbg_time 12000  # Dusk
/dbg_time 18000  # Midnight
```

### Set Weather

```
/dbg_weather <type>
```

Sets the weather in the current dimension.

Types: `clear`, `rain`, `thunder`

Examples:

```
/dbg_weather clear
/dbg_weather rain
/dbg_weather thunder
```

### List Players

```
/dbg_players
```

Lists all online players with their names and IDs.

## Notes

- All commands require operator permissions (permission level 2)
- Commands only work for player sources
- Some commands use prototype extensions from mc-bedrock-lib for enhanced functionality
