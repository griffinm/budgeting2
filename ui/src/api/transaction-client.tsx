import { queryStringFromObject } from '@/utils/queryStringFromObject';
import { baseClient } from './base-client';
import { Transaction, PageResponse, TransactionType } from '@/utils/types';

export interface TransactionSearchParams {
  start_date?: string;
  end_date?: string;
  merchant_id?: number;
  merchant_name?: string;
  transaction_type?: string;
  check_number?: string;
  currency_code?: string;
  search_term?: string;
  amount_greater_than?: string;
  amount_less_than?: string;
  amount_equal_to?: string;
  has_no_category?: boolean;
  merchant_tag_id?: number;
  page?: number;
}

export interface TransactionUpdateParams {
  transactionType?: TransactionType;
  merchantTagId?: number | null;
  note?: string;
  useAsDefault?: boolean;
  merchantId?: number; // Only used when updating all transactions for a merchant
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
  const response = await baseClient.patch<Transaction>(`/transactions/${id}`, { 
    transaction: {
      ...params,
      useAsDefault: undefined,
    },
    useAsDefault: params.useAsDefault,
    merchantId: params.merchantId,
  });
  return response.data;
};
