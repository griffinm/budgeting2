import { MovingAverage } from "./types";

export function getAverageForCurrentDay(movingAverage: MovingAverage[]): MovingAverage | undefined {
  const currentDay = new Date().getDate();
  const currentDayMovingAverage = movingAverage.find((item) => item.dayOfMonth === currentDay);
  return currentDayMovingAverage;
}
