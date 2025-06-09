import { useState, useEffect, useCallback } from 'react';
import { getTransactions, TransactionSearchParams } from '@/api/transaction-client';
import { Page, Transaction } from '@/utils/types';

interface TransactionsState {
  transactions: Transaction[];
  isLoading: boolean;
  error: Error | null;
  searchParams: TransactionSearchParams;
  setSearchParams: (searchParams: TransactionSearchParams) => void;
  page: Page,
}

export const useTransactions = () => {
  const [state, setState] = useState<TransactionsState>({
    searchParams: {},
    setSearchParams: () => {},
    transactions: [],
    isLoading: false,
    error: null,
    page: {
      currentPage: 1,
      totalPages: 1,
      totalCount: 0,
    },
  });

  const fetchTransactions = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    const apiParams = {
      ...state.searchParams,
      page: state.page.currentPage,
    };

    try {
      const response = await getTransactions({
        params: apiParams,
      });
      setState(prev => ({
        ...prev,
        transactions: response.items,
        isLoading: false,
        error: null,
        page: response.page,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error('Failed to fetch transactions'),
      }));
    }
  }, [state.searchParams, state.page.currentPage]);

  const setSearchParams = useCallback((newParams: TransactionSearchParams) => {
    setState(prev => ({ ...prev, searchParams: { ...prev.searchParams, ...newParams }, page: { ...prev.page, currentPage: 1 } }));
  }, []);

  const setPage = useCallback((page: number) => {
    setState(prev => ({ ...prev, page: { ...prev.page, currentPage: page } }));
  }, []);

  const setPerPage = useCallback((per_page: number) => {
    setState(prev => ({ ...prev, per_page, page: { ...prev.page, currentPage: 1 } }));
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return {
    ...state,
    fetchTransactions,
    setPage,
    setPerPage,
    setSearchParams,
  };
}; 
