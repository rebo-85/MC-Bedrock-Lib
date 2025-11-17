import {
  CustomCommandOrigin,
  CustomCommandParamType,
  CustomCommandResult,
  CustomCommandStatus,
  Entity,
  EquipmentSlot,
  Player,
  RawMessage,
  world,
} from "@minecraft/server";
import { CommandRegistry } from "./registry";
import { Run } from "./utils";

/**
 * DebugCommands
 * Utility commands for debugging and testing.
 * Note: Cast src to Player (as any) for sendMessage since Entity doesn't have it in types.
 */
export class DebugCommands {
  private static cmdReg = new CommandRegistry();
  static namepace: string = "debug";
  static register(): void {
    // Get player info
    this.cmdReg.add(
      {
        name: `${DebugCommands.namepace}:player_info`,
        description: "Get detailed player info",
        permissionLevel: 2,
      },
      (origin: CustomCommandOrigin): CustomCommandResult | undefined => {
        const src = origin.source;
        if (!(src instanceof Entity) || !src.isPlayer) return;

        const plr = src as Player;
        const info = [
          `§bPlayer Info:§r`,
          `  ID: ${plr.id}`,
          `  Name: ${plr.name}`,
          `  Location: ${plr.x.toFixed(2)}, ${plr.y.toFixed(2)}, ${plr.z.toFixed(2)}`,
          `  Rotation: ${plr.rx.toFixed(1)}°, ${plr.ry.toFixed(1)}°`,
          `  Gamemode: ${plr.gamemode}`,
          `  Health: ${plr.health}/${plr.maxHealth}`,
          `  XP: ${plr.xpEarnedAtCurrentLevel}/${plr.totalXpNeededForNextLevel} (Lvl ${plr.level})`,
        ].join("\n");

        plr.sendMessage(info);
        return { status: CustomCommandStatus.Success, message: "Player info displayed" };
      }
    );

    // Heal entity
    this.cmdReg.add(
      {
        name: `${DebugCommands.namepace}:heal`,
        description: "Heal entity/entities (optional value)",
        permissionLevel: 2,
        mandatoryParameters: [{ name: "target", type: CustomCommandParamType.EntitySelector }],
        optionalParameters: [{ name: "value", type: CustomCommandParamType.Float }],
      },
      (origin: CustomCommandOrigin, target: Entity[], value?: number): CustomCommandResult | undefined => {
        const src = origin.source;
        if (!(src instanceof Entity)) return;

        let healedCnt = 0;
        new Run(() => {
          for (const ent of target) {
            const healthComp = ent.healthComponent;
            if (!healthComp) continue;
            const healAmt = value ?? ent.maxHealth;
            ent.health = Math.min(ent.health + healAmt, ent.maxHealth);
            healedCnt++;
          }
          const msg = `\xA7aHealed ${healedCnt} entit${healedCnt === 1 ? "y" : "ies"}${
            value !== void 0 ? ` by ${value} HP` : " to full health"
          }\xA7r`;
          if (src.isPlayer) (src as Player).sendMessage(msg);
          return { status: CustomCommandStatus.Success, message: `Healed ${healedCnt} entities` };
        });
      }
    );

    // Damage item in mainhand
    this.cmdReg.add(
      {
        name: `${DebugCommands.namepace}:damage_item`,
        description: "Damage item in mainhand by specified value",
        permissionLevel: 2,
        mandatoryParameters: [{ name: "value", type: CustomCommandParamType.Integer }],
      },
      (origin: CustomCommandOrigin, value: number): CustomCommandResult | undefined => {
        const src = origin.source;
        if (!(src instanceof Entity) || !src.isPlayer) {
          return { status: CustomCommandStatus.Failure, message: "Source is not a player" };
        }

        const plr = src as Player;
        const item = plr.mainHandItem;

        if (!item) {
          plr.sendMessage("§cNo item in mainhand§r");
          return { status: CustomCommandStatus.Failure, message: "No item in mainhand" };
        }

        const durComp = item.durabilityComponent;
        if (!durComp) {
          plr.sendMessage("§cItem is not damageable§r");
          return { status: CustomCommandStatus.Failure, message: "Item is not damageable" };
        }

        const oldDmg = item.damage;
        const itemName = item.nameTag || item.typeId;

        new Run(() => {
          plr.damageItem(EquipmentSlot.Mainhand, value, true);

          const newItem = plr.mainHandItem;
          const newDmg = newItem ? newItem.damage : durComp.maxDurability;
          const remaining = durComp.maxDurability - newDmg;

          const msg: RawMessage = {
            rawtext: [
              { text: "§6Damaged " },
              { translate: item.localizationKey },
              { text: ` by ${newDmg - oldDmg} (${remaining}/${durComp.maxDurability})§r` },
            ],
          };

          plr.sendMessage(msg);
          return { status: CustomCommandStatus.Success, message: `Damaged item by ${value}` };
        });
      }
    );

    // Get entity count by dimension
    this.cmdReg.add(
      {
        name: `${DebugCommands.namepace}:show_entities`,
        description: "Count entities grouped by dimension",
        permissionLevel: 2,
      },
      (origin: CustomCommandOrigin): CustomCommandResult | undefined => {
        const src = origin.source;
        if (!(src instanceof Entity)) return;

        const dimData = new Map<string, Map<string, number>>();
        let totalEnts = 0;

        for (const dim of [world.overworld, world.nether, world.end]) {
          const ents = dim.getEntities();
          const byType = new Map<string, number>();

          for (const ent of ents) {
            byType.set(ent.typeId, (byType.get(ent.typeId) || 0) + 1);
            totalEnts++;
          }

          dimData.set(dim.id, byType);
        }

        const lines = [`§bTotal Entities: ${totalEnts}§r`];

        for (const [dimId, byType] of dimData) {
          const dimTotal = Array.from(byType.values()).reduce((a, b) => a + b, 0);
          const dimName = dimId.replace("minecraft:", "");
          lines.push(`\n§6${dimName} (${dimTotal}):§r`);

          const sorted = Array.from(byType.entries()).sort((a, b) => b[1] - a[1]);
          lines.push(...sorted.slice(0, 8).map(([type, cnt]) => `  ${type}: ${cnt}`));
        }

        (src as any).sendMessage(lines.join("\n"));
        return { status: CustomCommandStatus.Success, message: `Found ${totalEnts} entities` };
      }
    );

    // Get block info
    this.cmdReg.add(
      {
        name: `${DebugCommands.namepace}:block_info`,
        description: "Get block info at feet",
        permissionLevel: 2,
      },
      (origin: CustomCommandOrigin): CustomCommandResult | undefined => {
        const src = origin.source;
        if (!(src instanceof Entity) || !src.isPlayer) return;

        const plr = src as Player;
        const block = plr.dimension.getBlock(plr.location);
        if (!block) {
          plr.sendMessage("§cNo block found§r");
          return { status: CustomCommandStatus.Failure, message: "No block found" };
        }

        const states = block.permutation.getAllStates();
        const info = [
          `§bBlock Info:§r`,
          `  Type: ${block.typeId}`,
          `  Location: ${block.x}, ${block.y}, ${block.z}`,
          `  States: ${JSON.stringify(states, null, 2)}`,
        ].join("\n");

        plr.sendMessage(info);
        return { status: CustomCommandStatus.Success, message: "Block info displayed" };
      }
    );
  }
}
