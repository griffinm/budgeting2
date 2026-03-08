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
  merchant_group_id?: number;
  plaid_account_ids?: number[];
  tag_ids?: number[];
  omit_tag_ids?: number[];
  page?: number;
  per_page?: number;
}

export interface TransactionUpdateParams {
  transactionType?: TransactionType;
  merchantCategoryId?: number | null;
  note?: string;
  useAsDefault?: boolean;
  merchantId?: number; // Only used when updating all transactions for a merchant
}

export const getTransactions = async ({
  params,
}: {
  params: TransactionSearchParams;
}): Promise<PageResponse<Transaction>> => {
  const queryString = queryStringFromObject({...params});
  const url = `/transactions?${queryString}&page=${params.page || 1}`;
  const response = await baseClient.get(url);
  return response.data;
}; 

export const getTransaction = async ({
  id,
}: {
  id: number;
}): Promise<Transaction> => {
  const response = await baseClient.get<Transaction>(`/transactions/${id}`);
  return response.data;
};

export const updateTransaction = async ({
  id,
  params,
}: {
  id: number;
  params: TransactionUpdateParams;
}): Promise<Transaction> => {
  const { merchantCategoryId, useAsDefault, merchantId, ...rest } = params;
  const response = await baseClient.patch<Transaction>(`/transactions/${id}`, {
    transaction: {
      ...rest,
      merchantTagId: merchantCategoryId,
    },
    useAsDefault,
    merchantId,
  });
  return response.data;
};
