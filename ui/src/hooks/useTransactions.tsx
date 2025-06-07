import { useState, useEffect, useCallback } from 'react';
import { getTransactions, TransactionSearchParams } from '@/api/transaction-client';
import { Transaction } from '@/utils/types';

interface TransactionsState {
  transactions: Transaction[];
  isLoading: boolean;
  error: Error | null;
  page: {
    count: number;
    page: number;
    items: number;
    pages: number;
  } | null;
}

export const useTransactions = (initialParams?: TransactionSearchParams) => {
  const [params, setParams] = useState<TransactionSearchParams>(initialParams || {});
  const [state, setState] = useState<TransactionsState>({
    transactions: [],
    isLoading: false,
    error: null,
    page: null,
  });

  const fetchTransactions = useCallback(async (searchParams?: TransactionSearchParams) => {
    const queryParams = searchParams || params;
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await getTransactions(queryParams);
      setState({
        transactions: response.items,
        isLoading: false,
        error: null,
        page: response.page,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error('Failed to fetch transactions'),
      }));
    }
  }, [params]);

  const updateParams = useCallback((newParams: TransactionSearchParams) => {
    setParams(prev => ({ ...prev, ...newParams }));
  }, []);

  const setPage = useCallback((page: number) => {
    setParams(prev => ({ ...prev, page }));
  }, []);

  const setPerPage = useCallback((per_page: number) => {
    setParams(prev => ({ ...prev, per_page, page: 1 })); // Reset to first page when changing per_page
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return {
    ...state,
    fetchTransactions,
    updateParams,
    setPage,
    setPerPage,
    params,
  };
}; 
