import { ContainerSlot, Player } from "@minecraft/server";
import { Manager, world } from "mc-bedrock-lib";

/**
 * PassiveMending
 * Applies mending to all items in inventory when XP orbs are collected.
 * Repairs damaged items with mending enchantment proportional to XP value.
 */
export class PassiveMending extends Manager {
  private static readonly REPAIR_MULTIPLIER = 2;

  async _init(): Promise<void> {
    world.afterEvents.playerXpOrbCollect.subscribe((ev) => this._handleXpCollect(ev.player, ev.xpValue));
  }

  private _handleXpCollect(player: Player, xpValue: number): void {
    const inv = player.inventory;
    if (!inv) return;

    inv.forEachSlot((slot: ContainerSlot) => {
      const item = slot.getItem();
      if (!item || !item.hasEnchantment("mending")) return;
      if (item.durability >= item.maxDurability) return;

      const repairAmt = Math.min(xpValue * PassiveMending.REPAIR_MULTIPLIER, item.maxDurability - item.durability);
      item.durability += repairAmt;
      slot.setItem(item);
      player.xp -= xpValue;
    });
  }
}
