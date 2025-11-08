import { baseClient } from '@/api/base-client';
import { ProfitAndLossItem, TransactionType, TotalForDateRange } from '@/utils/types';

export interface SpendMovingAverage {
  dayOfMonth: number;
  dayAverage: number;
  cumulativeTotal: number;
  cumulativeAveragePerDay: number;
}

export interface TotalForDateRangeParams {
  transactionType: TransactionType;
  startDate: Date;
  endDate: Date;
}

export async function getTotalForDateRange(params: TotalForDateRangeParams): Promise<TotalForDateRange> {
  const url = '/data/total_for_date_range';
  const date = params.startDate && params.endDate ? `start_date=${params.startDate}&end_date=${params.endDate}` : undefined;
  const response = await baseClient.get(`${url}?${date}`);
  return response.data;
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
