import { queryStringFromObject } from '@/utils/queryStringFromObject';
import { baseClient } from './base-client';
import { Transaction, PageResponse, TransactionType } from '@/utils/types';

export interface TransactionSearchParams {
  start_date?: string;
  end_date?: string;
  merchant_id?: number;
  merchant_name?: string;
  plaid_category_primary?: string;
  plaid_category_detail?: string;
  payment_channel?: string;
  transaction_type?: string;
  check_number?: string;
  currency_code?: string;
  pending?: boolean;
  search_term?: string;
}

export interface TransactionUpdateParams {
  transactionType: TransactionType;
}

export const getTransactions = async ({
  params,
}: {
  params: TransactionSearchParams;
}): Promise<PageResponse<Transaction>> => {
  const response = await baseClient.get(`/transactions?${queryStringFromObject({...params})}`);
  return response.data;
}; 

export const updateTransaction = async ({
  id,
  params,
}: {
  id: number;
  params: TransactionUpdateParams;
}): Promise<Transaction> => {
  const response = await baseClient.patch<Transaction>(`/transactions/${id}`, { transaction: params });
  return response.data;
};