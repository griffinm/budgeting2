import { MovingAverage } from "./types";

export function getAverageSpendOnCurrentDay(movingAverage: MovingAverage[]): number {
  const currentDay = new Date().getDate();
  const currentDayMovingAverage = movingAverage.find((item) => item.dayOfMonth === currentDay);
  return currentDayMovingAverage?.dayAverage || 0;
}
