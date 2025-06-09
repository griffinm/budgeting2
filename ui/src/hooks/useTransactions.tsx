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
      // per_page: state.per_page, // Assuming per_page is part of the state
    };

    try {
      // The `getTransactions` function in the API client expects `page` and `params`
      // but the `page` object in the client is just `currentPage`, `totalPages` etc.
      // The API endpoint itself probably just wants a `page` number and `per_page`.
      // The client builds the query string. Let's pass only what's needed.
      const response = await getTransactions({
        params: apiParams,
        page: { currentPage: state.page.currentPage, totalPages: state.page.totalPages, totalCount: state.page.totalCount },
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

  const updateParams = useCallback((newParams: TransactionSearchParams) => {
    setState(prev => ({ ...prev, searchParams: { ...prev.searchParams, ...newParams }, page: { ...prev.page, currentPage: 1 } }));
  }, []);

  const setPage = useCallback((page: number) => {
    setState(prev => ({ ...prev, page: { ...prev.page, currentPage: page } }));
  }, []);

  const setPerPage = useCallback((per_page: number) => {
    setState(prev => ({ ...prev, per_page, page: { ...prev.page, currentPage: 1 } })); // Reset to first page when changing per_page
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return {
    ...state,
    fetchTransactions,
    setPage,
    setPerPage,
    updateParams,
  };
}; 
