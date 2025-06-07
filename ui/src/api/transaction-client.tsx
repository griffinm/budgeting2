import baseClient from './base-client';
import { Transaction, PageResponse } from '@/utils/types';

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
  page?: number;
  per_page?: number;
}

export const getTransactions = async (params?: TransactionSearchParams): Promise<PageResponse<Transaction>> => {
  const response = await baseClient.get('/transactions', { params });
  return response.data;
}; 
