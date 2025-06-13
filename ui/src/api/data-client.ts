import { baseClient } from '@/api/base-client';
import { Transaction, TransactionType } from '@/utils/types';

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