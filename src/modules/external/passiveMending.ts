import { ContainerSlot, Player } from "@minecraft/server";
import { PlayerManager, Manager, world } from "mc-bedrock-lib";

export class PassiveMending extends Manager {
  players: Player[] = [];

  async _init(): Promise<void> {
    const pm = new PlayerManager();
    this.players = await pm.players;

    world.afterEvents.playerXpOrbCollect.subscribe(({ player, xpValue }) => {
      const inv = player.inventory;
      if (!inv) return;

      inv.forEachSlot((slot: ContainerSlot, slotId: number) => {
        const item = slot.getItem();

        if (item && item.hasEnchantment("mending")) {
          if (item.durability < item.maxDurability) {
            const repairAmount = Math.min(xpValue * 2, item.maxDurability - item.durability);
            item.durability += repairAmount;
            slot.setItem(item);
            player.xp -= xpValue;
          }
        }
      });
    });
  }
}
