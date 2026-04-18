import { BlockRaycastHit, EntityRaycastHit, EquipmentSlot, Player, RawMessage, world } from "@minecraft/server";
import { Manager, PlayerManager } from "mc-bedrock-lib";
class DebugStickInspector extends Manager {
  private playerManger!: PlayerManager;

  protected init(): void {
    this.playerManger = new PlayerManager();
  }
  protected async main(): Promise<void> {
    for (const player of this.playerManger.players) {
      if (!(player.mainHandItem?.typeId === "minecraft:debug_stick")) continue;

      const target = this.getTarget(player);
      const text = this.getActionBarText(target);
      player.setActionBar(text);
    }
  }

  private getTarget(player: Player): EntityRaycastHit | BlockRaycastHit | undefined {
    const entityHit = player.getEntitiesFromViewDirection({
      includeLiquidBlocks: true,
      includePassableBlocks: true
    })[0];

    if (entityHit) return entityHit;

    return player.getBlockFromViewDirection({
      includeLiquidBlocks: true,
      includePassableBlocks: true,
      maxDistance: 7
    });
  }

  private getActionBarText(target: EntityRaycastHit | BlockRaycastHit | undefined): string | RawMessage {
    if (!target) return "No selected Block/Entity";

    if ("block" in target && target.block) return this.getBlockInfo(target);
    if ("entity" in target && target.entity) return this.getEntityInfo(target);

    return "No selected Block/Entity";
  }

  private getBlockInfo(target: BlockRaycastHit): RawMessage {
    const block = target.block;
    return {
      rawtext: [
        { text: `§bBlock§r: §f${block.typeId}\n§r` },
        {
          text: `§bData§r: §f${JSON.stringify(block.permutation.getAllStates(), null, 2)}§r`
        }
      ]
    };
  }

  private getEntityInfo(target: EntityRaycastHit): RawMessage {
    const entity = target.entity;
    const data = { dynamicProperties: entity.getDynamicPropertyIds() };

    return {
      rawtext: [
        { text: `§bEntity§r: §f${entity.typeId}\n§r` },
        { text: `§bHealth§r: §f${entity.health}/${entity.maxHealth}\n§r` },
        { text: `§bFamilies§r: §f[${entity.typeFamilies}]\n§r` },
        { text: `§bData§r: §f${JSON.stringify(data, null, 2)}§r` }
      ]
    };
  }
}

new DebugStickInspector();
