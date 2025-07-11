import { useState, useEffect, useCallback } from 'react';
import { 
  getTransactions,
  TransactionSearchParams,
  TransactionUpdateParams,
  updateTransaction as updateTransactionApi,
} from '@/api/transaction-client';
import { Page, Transaction } from '@/utils/types';

const SEARCH_PARAMS_KEY = "transactionSearch";

function localStorageBaseKey() {
  const url = window.location.pathname;
  const urlKey = url.split('/').join('-');
  return `${urlKey}-${SEARCH_PARAMS_KEY}`;
}

function saveSearchToLocalStorage(search: TransactionSearchParams) {
  localStorage.setItem(localStorageBaseKey(), JSON.stringify(search));
}

function getSearchFromLocalStorage(): TransactionSearchParams | null {
  const search = localStorage.getItem(localStorageBaseKey());
  return search ? JSON.parse(search) : null;
}

function clearSearchFromLocalStorage() {
  localStorage.removeItem(localStorageBaseKey());
}

interface TransactionsState {
  transactions: Transaction[];
  isLoading: boolean;
  error: Error | null;
  searchParams: TransactionSearchParams;
  setSearchParams: (searchParams: TransactionSearchParams) => void;
  page: Page;
  updateTransaction: (id: number, params: TransactionUpdateParams) => void;
}

export const useTransactions = ({
  initialSearchParams = {},
}: {
  initialSearchParams?: TransactionSearchParams;
} = {}) => {
  const [state, setState] = useState<TransactionsState>({
    searchParams: getSearchFromLocalStorage() || initialSearchParams || {},
    setSearchParams: () => {},
    transactions: [],
    isLoading: false,
    error: null,
    updateTransaction: () => {},
    page: {
      currentPage: getSearchFromLocalStorage()?.page || 1,
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

    saveSearchToLocalStorage(apiParams);

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
          currentPage: response.page?.currentPage ?? prev.page.currentPage,
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
  }, [state.searchParams, state.page.currentPage]);

  const setSearchParams = useCallback((newParams: TransactionSearchParams) => {
    setState(prev => ({ 
      ...prev, 
      searchParams: { ...prev.searchParams, ...newParams },
      page: { ...prev.page, currentPage: 1 } // Reset to first page when search params change
    }));
  }, []);

  const setPage = useCallback((page: number) => {
    setState(prev => ({ 
      ...prev, 
      page: { ...prev.page, currentPage: page } 
    }));
  }, []);

  const setPerPage = useCallback((per_page: number) => {
    setState(prev => ({ 
      ...prev, 
      per_page,
      page: { ...prev.page, currentPage: 1 } // Reset to first page when per_page changes
    }));
  }, []);

  const updateTransaction = useCallback((id: number, params: TransactionUpdateParams) => {
    updateTransactionApi({ id, params }).then((newTransaction) => {
      setState(prev => ({
        ...prev,
        transactions: prev.transactions.map(transaction => transaction.id === id ? newTransaction : transaction),
      }));
    });
  }, []);

  const clearSearchParams = () => {
    clearSearchFromLocalStorage();
    setState(prev => ({ 
      ...prev, 
      searchParams: {},
      page: { ...prev.page, currentPage: 1 } // Reset to first page when clearing search
    }));
  }

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
    clearSearchParams,
  };
}; 
