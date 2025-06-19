import { useState, useEffect, useCallback } from 'react';
import { 
  getTransactions,
  TransactionSearchParams,
  TransactionUpdateParams,
  updateTransaction as updateTransactionApi,
} from '@/api/transaction-client';
import { Page, Transaction } from '@/utils/types';

interface TransactionsState {
  transactions: Transaction[];
  isLoading: boolean;
  error: Error | null;
  searchParams: TransactionSearchParams;
  setSearchParams: (searchParams: TransactionSearchParams) => void;
  page: Page;
  updateTransaction: (id: number, params: TransactionUpdateParams) => void;
}

const getPageFromHash = (): number => {
  const hash = window.location.hash;
  const match = hash.match(/page=(\d+)/);
  return match ? parseInt(match[1], 10) : 1;
};

const setPageInHash = (page: number) => {
  const hash = window.location.hash.replace(/page=\d+/, '').replace(/^#/, '');
  const newHash = hash ? `${hash}&page=${page}` : `page=${page}`;
  window.location.hash = newHash;
};

export const useTransactions = ({
  initialSearchParams = {},
}: {
  initialSearchParams?: TransactionSearchParams;
} = {}) => {
  const [state, setState] = useState<TransactionsState>({
    searchParams: initialSearchParams || {},
    setSearchParams: () => {},
    transactions: [],
    isLoading: false,
    error: null,
    updateTransaction: () => {},
    page: {
      currentPage: getPageFromHash(),
      totalPages: 1,
      totalCount: 0,
    },
  });

  const fetchTransactions = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    const currentPage = getPageFromHash();
    const apiParams = {
      ...state.searchParams,
      page: currentPage,
    };

    try {
      const response = await getTransactions({
        params: apiParams,
      });
      setState(prev => ({
        ...prev,
        transactions: response.items || [],
        isLoading: false,
        error: null,
        page: {
          currentPage: response.page?.currentPage ?? currentPage,
          totalPages: response.page?.totalPages ?? 1,
          totalCount: response.page?.totalCount ?? 0,
        },
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error('Failed to fetch transactions'),
      }));
    }
  }, [state.searchParams]);

  const setSearchParams = useCallback((newParams: TransactionSearchParams) => {
    setState(prev => ({ ...prev, searchParams: { ...prev.searchParams, ...newParams } }));
    setPageInHash(1); // Reset to first page when search params change
  }, []);

  const setPage = useCallback((page: number) => {
    setPageInHash(page);
  }, []);

  const setPerPage = useCallback((per_page: number) => {
    setState(prev => ({ ...prev, per_page }));
    setPageInHash(1); // Reset to first page when per_page changes
  }, []);

  const updateTransaction = useCallback((id: number, params: TransactionUpdateParams) => {
    updateTransactionApi({ id, params }).then((newTransaction) => {
      setState(prev => ({
        ...prev,
        transactions: prev.transactions.map(transaction => transaction.id === id ? newTransaction : transaction),
      }));
    });
  }, []);

  // Listen for hash changes
  useEffect(() => {
    const handleHashChange = () => {
      fetchTransactions();
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [fetchTransactions]);

  // Initial fetch
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return {
    ...state,
    fetchTransactions,
    setPage,
    setPerPage,
    setSearchParams,
    updateTransaction,
  };
}; 
