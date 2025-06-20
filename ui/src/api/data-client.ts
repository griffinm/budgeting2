import { baseClient } from '@/api/base-client';
import { ProfitAndLossItem, Transaction, TransactionType } from '@/utils/types';

export interface MonthlySpendParams {
  month?: number;
  year?: number;
  transactionType: TransactionType;
}

export async function getMonthlyTransactions(params: MonthlySpendParams): Promise<Transaction[]> {
  const url = urlForTransactionType(params.transactionType);
  const date = params.month && params.year ? `month=${params.month}&year=${params.year}` : undefined;
  const response = await baseClient.get(`${url}?${date}`);
  return response.data;
}

function urlForTransactionType(type: TransactionType): string {
  let baseUrl = '/data/monthly_';
  switch (type) {
    case 'expense':
      baseUrl += 'spend';
      break;
    case 'income':
      baseUrl += 'income';
      break;
    case 'transfer':
      baseUrl += 'transfer';
      break;
  }
  return baseUrl;
}

export async function averageForMonthsBack({ 
  monthsBack, 
  transactionType 
}: { 
  monthsBack: number, 
  transactionType: TransactionType 
}): Promise<number> {
  const url = `/data/average_${transactionType}`;
  const params = { months_back: monthsBack };
  const response = await baseClient.get(url, { params });
  return response.data.average;
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
