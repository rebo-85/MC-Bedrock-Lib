import { world, EntityRaycastHit, BlockRaycastHit, EquipmentSlot, RawMessage } from "@minecraft/server";
import { Manager } from "../utils";

/**
 * DebugStickInspector
 * Handles debug stick inspection for blocks/entities in-game.
 * Shows block/entity info in action bar when holding debug stick.
 */
export class DebugStickInspector extends Manager {
  constructor() {
    super();
  }

  /**
   * Main tick logic for debug stick inspection.
   * Iterates players, checks for debug stick, inspects target, updates action bar.
   */
  protected _main() {
    for (const player of world.getAllPlayers()) {
      const mainhand = player.getEquipment(EquipmentSlot.Mainhand);
      if (!mainhand || mainhand.typeId !== "minecraft:debug_stick") continue;

      let target: EntityRaycastHit | BlockRaycastHit | undefined = player.getEntitiesFromViewDirection({
        includeLiquidBlocks: true,
        includePassableBlocks: true,
      })[0];
      if (!target) {
        target = player.getBlockFromViewDirection({
          includeLiquidBlocks: true,
          includePassableBlocks: true,
          maxDistance: 7,
        });
      }

      let actionBarText: string | RawMessage = "No selected Block/Entity";
      if (target && "block" in target && target.block) {
        const block = target.block;
        actionBarText = {
          rawtext: [
            { text: `§bBlock§r: §f${block.typeId}\n§r` },
            { text: `§bFace§r: §f${target.face}\n§r` },
            { text: `§bData§r: §f${JSON.stringify(block.permutation.getAllStates(), null, 2)}§r` },
          ],
        };
      } else if (target && "entity" in target && target.entity) {
        const entity = target.entity;
        const entityData = {
          dynamicProperties: entity.getDynamicPropertyIds(),
        };
        actionBarText = {
          rawtext: [
            { text: `§bEntity§r: §f${entity.typeId}\n§r` },
            { text: `§bHealth§r: §f${entity.health}/${entity.maxHealth}\n§r` },
            { text: `§bFamilies§r: §f[${entity.typeFamilies}]\n§r` },
            { text: `§bData§r: §f${JSON.stringify(entityData, null, 2)}§r` },
          ],
        };
      }
      player.setActionBar(actionBarText);
    }
  }
}
