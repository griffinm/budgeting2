import { baseClient } from '@/api/base-client';
import { ProfitAndLossItem } from '@/utils/types';

export interface SpendMovingAverage {
  dayOfMonth: number;
  dayAverage: number;
  cumulativeTotal: number;
  cumulativeAveragePerDay: number;
}

export async function getProfitAndLoss({
  monthsBack = 12,
}: {
  monthsBack: number;
}): Promise<ProfitAndLossItem[]> {
  const url = '/data/profit_and_loss';
  const params = { months_back: monthsBack };
  const response = await baseClient.get(url, { params });
  return response.data;
}

export async function getSpendMovingAverage(): Promise<SpendMovingAverage[]> {
  const url = '/data/spend_moving_average';
  const response = await baseClient.get(url);
  return response.data;
}

export async function getIncomeMovingAverage(): Promise<SpendMovingAverage[]> {
  const url = '/data/income_moving_average';
  const response = await baseClient.get(url);
  return response.data;
}
