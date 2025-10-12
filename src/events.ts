import { WeatherType, world } from "@minecraft/server";

export const playersUsingItem = new Set<string>();
world.afterEvents.itemUse.subscribe((e: any) => {
  const { source: player } = e;
  playersUsingItem.add(player.id);
});

world.afterEvents.itemStopUse.subscribe((e: any) => {
  const { source: player } = e;
  if (playersUsingItem.has(player.id)) playersUsingItem.delete(player.id);
});

export const weatherTracker = new Map<number, WeatherType>();
world.beforeEvents.weatherChange.subscribe((e: any) => {
  const { previousWeather, duration } = e;
  if (duration == world.getTimeOfDay()) {
    weatherTracker.set(duration, previousWeather);
    e.cancel = true;
  }
});
